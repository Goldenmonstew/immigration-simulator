import './load-game-characters';
import { expect, test, vi } from 'vitest';
import {
  doActivity,
  endQuarter,
  harvest,
  newGame,
  visaMonthsLeft,
  type GameState,
} from '@uk-immigration/game';
import type { Locale } from '@uk-immigration/engine';
import { renderView } from './game-client-harness';
import { QuarterSummary, StatusBar } from '../app/game/game-view';
import { PlotMenu } from '../app/game/life-overlays';
import { t } from '../i18n';

const locales = ['zh-CN', 'en'] as const;

function withoutEvents(state: GameState): GameState {
  return {
    ...state,
    pendingEvent: undefined,
    eventQueue: [],
    day: { ...state.day, deliveries: [] },
  };
}

function settle(state: GameState) {
  const before = withoutEvents(state);
  before.day.index = 2;
  return endQuarter(before);
}

function summary(before: GameState, after: GameState, locale: Locale) {
  return renderView(
    () =>
      QuarterSummary({ before, after, onContinue: vi.fn(), onVisit: vi.fn() }),
    locale,
  ).html;
}

test.each([
  {
    character: 'skilled-worker',
    played: 5,
    months: 41,
    expiry: ['2030年1月14日', '14 Jan 2030'],
  },
  {
    character: 'family-partner',
    played: 3,
    months: 35,
    expiry: ['2029年6月14日', '14 Jun 2029'],
  },
])(
  '$character renewal shows the same remaining months in the HUD and summary',
  ({ character, played, months, expiry }) => {
    let state = newGame(character, 42);
    for (let i = 0; i < played; i++) state = settle(state);
    const before = withoutEvents(state);
    before.day.minute = 600;
    before.day.place = 'visa';
    const withoutRenewal = settle(before);
    const renewed = doActivity(before, 'extend');
    const after = settle(renewed);
    expect(visaMonthsLeft(withoutRenewal)).toBe(5);
    expect(visaMonthsLeft(after)).toBe(5); // The current episode still has five months.
    for (const [index, locale] of locales.entries()) {
      const visa = t('game.visa', locale).replace('{count}', String(months));
      const text = t('game.renewedThrough', locale).replace(
        '{date}',
        expiry[index],
      );
      expect(
        renderView(() => StatusBar({ state: after }), locale).html,
      ).toContain(visa);
      expect(summary(renewed, after, locale)).toContain(visa);
      expect(summary(renewed, after, locale)).toContain(text);
      expect(summary(before, withoutRenewal, locale)).not.toContain(text);
      expect(summary(after, settle(after), locale)).not.toContain(text);
    }
  },
);

test.each(['family-partner', 'hong-kong-bno', 'skilled-worker'])(
  '%s gets a year-end review only when the game year advances',
  (character) => {
    let before = newGame(character, 42);
    for (let completed = 1; completed <= 4; completed++) {
      const after = settle(before);
      expect(after.year).toBe(completed === 4 ? 2 : 1);
      for (const locale of locales) {
        const html = summary(before, after, locale);
        expect(html.includes(t('game.yearSummary', locale))).toBe(
          completed === 4,
        );
      }
      before = after;
    }
  },
);

test.each(locales)(
  'planting and season-end crop loss are explained in %s',
  (locale) => {
    let state = withoutEvents(newGame('skilled-worker', 42, locale));
    Object.assign(state.day, { place: 'allotment', minute: 600 });
    state = doActivity(state, 'rent-plot');
    state.inventory['seed-turnip'] = 1;
    const plot = () =>
      renderView(
        () =>
          PlotMenu({
            state,
            plot: 0,
            onChange: (next) => {
              state = next;
            },
          }),
        locale,
      );
    const seed = locale === 'en' ? 'Turnip seeds' : '芜菁种子';
    const days = (
      key: 'game.cropMaturity' | 'game.cropTimeLeft',
      count: number,
    ) => t(key, locale).replace('{days}', String(count));
    expect(plot().html).toContain(days('game.cropTimeLeft', 2));
    state.day.index = 1;
    expect(plot().html).toContain(days('game.cropTimeLeft', 1));
    expect(plot().html).toContain(days('game.cropMaturity', 2));
    expect(plot().html).toContain(t('game.cropSeasonWarning', locale));
    plot().click(seed);
    expect(state.plots[0].seed).toBe('seed-turnip');
    state.plots[0].growth = 2;
    state.day.index = 2;
    expect(plot().html).toContain(days('game.cropTimeLeft', 0));
    expect(plot().html).toContain(days('game.cropMaturity', 1));

    state.plots[1] = { seed: 'seed-turnip', growth: 4 };
    state.plots[2] = { seed: 'seed-turnip', growth: 4 };
    const before = harvest(state, 2);
    const after = settle(before);
    expect(after.plots.every((entry) => !entry.seed)).toBe(true);
    expect(after.inventory.turnip).toBe(before.inventory.turnip);
    expect(summary(before, after, locale)).toContain(
      t('game.cropsCleared', locale).replace('{count}', '2'),
    );
    expect(summary(after, settle(after), locale)).not.toContain(
      t('game.cropsCleared', locale).split('{count}')[0],
    );
  },
);

test.each(locales)(
  'summary ranks the actual mood and health settlement sources in %s',
  (locale) => {
    const state = withoutEvents(newGame('skilled-worker', 42, locale));
    Object.assign(state.day, { place: 'work', minute: 1020 });
    const before = doActivity(state, 'overtime');
    before.flags.push('quarter-walking-club', 'furnished-reading-chair');
    const html = summary(before, settle(before), locale);
    const wear = t('game.settlementSource.seasonWear', locale);
    const overtime = t('game.settlementSource.overtimeWear', locale);
    const walking = t('game.settlementSource.walkingClub', locale);
    expect(html).toContain(`${wear} −15 · ${walking} +1`);
    expect(html).toContain(`${wear} −7 · ${overtime} −3`);
    expect(html).not.toContain(t('game.settlementSource.furnishings', locale));
  },
);
