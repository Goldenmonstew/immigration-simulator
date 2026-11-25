import { existsSync } from 'node:fs';
import * as React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { afterEach, beforeAll, expect, test, vi } from 'vitest';
import type { CountryResult, Locale } from '@uk-immigration/engine';
import * as gr from '@uk-immigration/game/gr';
import { grGameArt } from '@uk-immigration/game/gr/presentation';
import { CountryAssessmentColumns } from '../components/result-view';
import { LocaleContext } from '../i18n/locale';
import { t, withCount, type TranslationKey } from '../i18n';
import { greeceModule } from '../lib/greece-module';
import { readPageResult } from '../lib/page-result';
import { sitePagePaths, siteCountries } from '../lib/site-countries';
import {
  gameDraft,
  grCountry,
  grShell,
  itemIcon,
} from '../app/greece/game/shell';
import { gameKey } from '../app/game-shell/game-ui';
import town from '../public/game/greece/town.json';

type State = ReturnType<typeof gr.newGame>;
afterEach(() => vi.unstubAllGlobals());
beforeAll(async () => {
  for (const { id } of gr.characters) await gr.loadCharacter(id);
});

const render = (node: React.ReactNode, locale: Locale = 'zh-CN') =>
  renderToStaticMarkup(
    <LocaleContext value={{ locale, setLocale: () => {} }}>
      {node}
    </LocaleContext>,
  );
function settle(state: State) {
  while (state.pendingEvent)
    state = gr.resolve(state, gr.currentEvent(state)!.choices[0].id);
  return state;
}

test('Greece has a game page, entries and its own save and sound keys', () => {
  expect(siteCountries.find(({ id }) => id === 'gr')?.hasGame).toBe(true);
  expect(sitePagePaths).toContain('/greece/game');
  const storage = new Map<string, string>();
  vi.stubGlobal('localStorage', {
    getItem: (key: string) => storage.get(key) ?? null,
    setItem: (key: string, value: string) => storage.set(key, value),
  });
  const state = gr.newGame('bluecard', 4, 'zh-CN');
  expect(grShell.gameStorage('bluecard', state).available).toBe(true);
  expect([...storage.keys()]).toEqual(['gr-immigration-life-v3:bluecard']);
  expect(grShell.previewGameSave('bluecard').state).toEqual(state);
  expect(grShell.previewGameSave('spouse')).toEqual({
    state: undefined,
    available: true,
  });
  grCountry.sound.setMuted(false);
  expect(storage.get('gr-immigration-life-muted')).toBe('false');
});

const view = (result: CountryResult) =>
  result.columns[0].pathways.map((pathway) => ({
    id: pathway.id,
    status: pathway.status,
    earliestDate: pathway.earliestDate,
    checks: pathway.checks.map((check) => [check.id, check.status]),
  }));
/** Open the ending link the way the Greece result page reads it. */
function openResult(state: State) {
  vi.stubGlobal('localStorage', {
    getItem: () => null,
    setItem: () => {},
    removeItem: () => {},
  });
  const href = grCountry.resultHref(state);
  expect(href.startsWith('/greece/result#s=')).toBe(true);
  return readPageResult(greeceModule, 'zh-CN', href.split('#s=')[1], 'result');
}
function visit(state: State, place: string, minute: number) {
  state = settle(state);
  if (state.day.minute < minute)
    state = settle(gr.tick(state, minute - state.day.minute));
  return settle(gr.enter(state, place));
}

test.each(['bluecard', 'spouse'])(
  'the ending link opens the same %s timeline on the Greece result page',
  (id) => {
    const opening = settle(gr.newGame(id, 7, 'zh-CN'));
    const abroad = settle(
      gr.doActivity(visit(opening, 'station', 600), 'travel-1'),
    );
    expect(abroad.timeline.trips).toHaveLength(1);
    // A later year with a declared tax year travels with the timeline.
    let later = structuredClone(abroad);
    later.date = '2027-03-01';
    later.timeline.nationality.incomeByTaxYear[2026] = {
      taxableEur: 30_000,
      dependants: 0,
    };
    later = {
      ...later,
      result: gr.grRules.evaluate({ ...later, locale: 'zh-CN' }),
    };
    for (const state of [opening, abroad, later]) {
      const page = openResult(state);
      expect(page.correction).toBeUndefined();
      expect(page.draft).toEqual(gameDraft(state));
      expect(page.draft!.simulationDate).toBe(state.date);
      expect(view(page.result!)).toEqual(view(state.result));
    }
    expect(openResult(later).draft!.nationality?.incomeYears).toContainEqual({
      year: 2026,
      taxableEur: 30_000,
      dependants: 0,
    });
    expect(gameDraft(opening).step).toBe(id === 'bluecard' ? 4 : 6);
  },
);

test.each(['bluecard', 'spouse'])(
  'the ending link opens after %s moves and reports mid-quarter',
  (id) => {
    const quarterLater = (from: State) => {
      let next = from;
      for (let i = 0; i < 12 && next.date === from.date; i++)
        next = settle(gr.sleep(next));
      return next;
    };
    const leave = (state: State) =>
      gr.doActivity(visit(state, 'station', 900), 'leave');
    const report = (state: State) =>
      settle(gr.doActivity(visit(state, 'visa', 600), 'report-change'));
    const opening = settle(gr.newGame(id, 7, 'zh-CN'));
    const moved = settle(
      gr.doActivity(visit(opening, 'home', 480), 'rent-brighter-home'),
    );
    const reported = report(moved);
    // Reported a quarter late, then left in that same quarter.
    const late = report(quarterLater(moved));
    expect(late.date).not.toBe(moved.date);
    for (const state of [leave(moved), leave(reported), leave(late)]) {
      expect(state.ending).toBe('left');
      const page = openResult(state);
      expect(page.correction).toBeUndefined();
      expect(page.draft).toEqual(gameDraft(state));
      // The questionnaire holds only what had happened by its date.
      for (const change of page.draft!.changes ?? []) {
        expect(change.occurredOn <= state.date).toBe(true);
        if (change.reportedOn)
          expect(change.reportedOn <= state.date).toBe(true);
      }
      expect(view(page.result!)).toEqual(view(state.result));
    }
  },
);

test('a lapsed Blue Card ending shows both routes unmet on the result page', () => {
  let state = settle(gr.newGame('bluecard', 7, 'zh-CN'));
  state.date = '2029-12-01';
  state.timeline.currentCardExpiresOn = '2029-09-14';
  state.timeline.integration = { basis: 'a2', a2Certificate: true };
  for (let i = 0; i < 12 && !gr.isOver(state); i++)
    state = settle(gr.sleep(state));
  expect([state.date, state.ending]).toEqual(['2030-03-01', 'overstayed']);
  expect(state.result.columns[0].pathways.map(({ status }) => status)).toEqual([
    'NOT_MET',
    'NOT_MET',
  ]);
  const page = openResult(state);
  expect(page.correction).toBeUndefined();
  expect(page.draft).toEqual(gameDraft(state));
  expect(page.draft!.permits?.at(-1)?.to).toBe('2029-09-14');
  expect(view(page.result!)).toEqual(view(state.result));
});

test.each(['zh-CN', 'en'] as const)(
  'the status bar, progress bars and assessment speak Greek residence in %s',
  (locale) => {
    const state = gr.newGame('spouse', 4, locale);
    const hud = render(<grShell.StatusBar state={state} />, locale);
    expect(hud).toContain('€9,000');
    expect(hud).toContain(t('game.greek', locale));
    expect(hud).toContain(
      withCount(t('gr.game.visa', locale), 'count', gr.visaMonthsLeft(state)),
    );
    const bars = render(
      <grShell.ProgressBars state={state} onOpen={vi.fn()} />,
      locale,
    );
    expect(bars).toContain(t('gr.game.prColumn', locale));
    expect(bars).toContain(
      t('country.status.FUTURE', locale).replace('{date}', '2028-05-02'),
    );
    const office = settle(gr.enter(settle(state), 'council'));
    let menu: React.ReactNode;
    function Probe() {
      menu = grShell.LocationMenu({
        state: { ...office, day: { ...office.day, minute: 600 } },
        location: 'council',
        onChange: vi.fn(),
      });
      return menu;
    }
    const html = render(<Probe />, locale);
    let columns: React.ReactElement | undefined;
    React.Children.forEach(menu, function find(node) {
      if (!React.isValidElement<{ children?: React.ReactNode }>(node)) return;
      if (node.type === CountryAssessmentColumns) columns = node;
      React.Children.forEach(node.props.children, find);
    });
    expect(columns).toBeDefined();
    if (locale === 'en') expect(hud + bars).not.toMatch(/[㐀-鿿]/);
    expect(html).toContain('town-gr.current-law-2026-11-heading');
  },
);

test.each(['zh-CN', 'en'] as const)(
  'Greek recipes keep their own cooking steps in %s',
  (locale) => {
    for (const recipe of gr.recipes) {
      const shared = `game.prepare-${recipe.id}` as TranslationKey;
      const own = gameKey('gr', shared);
      expect(own, recipe.id).toBe(`gr.${shared}`);
      expect(t(own, locale), recipe.id).not.toBe(t(shared, locale));
    }
    expect(
      t(gameKey('gr', 'game.prepare-horiatiki' as TranslationKey), locale),
    ).toBe(
      locale === 'en'
        ? 'Chop tomato and cucumber, top with a slab of feta'
        : '切番茄黄瓜，放一大块菲达奶酪',
    );
  },
);

test('the Blue Card holder sees the missing integration requirement', () => {
  // A route with only a waiting date lists nothing else.
  expect(
    grCountry.missingRules(gr.newGame('spouse', 4, 'en'), 'pr'),
  ).toBeUndefined();
  const state = gr.newGame('bluecard', 4, 'en');
  expect(grCountry.placeNote!(state, 'visa')?.en).toBe(
    'Blue Card valid to 2026-09-14; renew from 2026-07-14, or late until 2026-12-14.',
  );
  expect(grCountry.missingRules(state, 'pr')).toEqual([
    'Greek language, history and culture',
  ]);
});

test('every item, character and townsperson has existing art', () => {
  const art = (path: string) =>
    existsSync(new URL(`../public${path}`, import.meta.url));
  for (const item of gr.items)
    expect(art(itemIcon(item.id)), item.id).toBe(true);
  for (const id of [
    ...gr.characters.map((c) => c.id),
    ...gr.npcs.map((n) => n.id),
  ]) {
    expect(grGameArt.cast[id], id).toBeDefined();
    for (const face of ['neutral', 'happy', 'worried'])
      expect(art(grShell.portraitPath(id, face)), id).toBe(true);
    expect(art(grShell.spritePath(id)), id).toBe(true);
  }
  expect(art(grShell.townBanner)).toBe(true);
  expect(art(`${grGameArt.root}${grGameArt.tiles}`)).toBe(true);
  for (const sign of grGameArt.shopSigns)
    expect(art(grShell.signPath(sign))).toBe(true);
});

test('the town map has every place, schedule stop and garden plot', () => {
  const layer = (name: string) =>
    town.layers.find((l) => l.name === name)!.objects!;
  const places = new Set(layer('places').map((o) => o.name));
  const anchors = new Set(layer('anchors').map((o) => o.name));
  expect([...places].sort()).toEqual(gr.places.map((p) => p.id).sort());
  for (const npc of gr.npcs)
    for (const rule of npc.schedule)
      for (const { at } of rule.stops)
        if (at !== 'away' && at !== 'home')
          expect(places.has(at) || anchors.has(at), `${npc.id}: ${at}`).toBe(
            true,
          );
  expect(layer('plots')).toHaveLength(6);
  const [spawn] = layer('spawn');
  const home = layer('places').find((o) => o.name === 'home')!;
  expect([spawn.x, spawn.y - 16]).toEqual([home.x, home.y]);
});
