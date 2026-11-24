import { existsSync } from 'node:fs';
import * as React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { afterEach, beforeAll, expect, test, vi } from 'vitest';
import type { Locale } from '@uk-immigration/engine';
import * as gr from '@uk-immigration/game/gr';
import { grGameArt } from '@uk-immigration/game/gr/presentation';
import { CountryAssessmentColumns } from '../components/result-view';
import { LocaleContext } from '../i18n/locale';
import { t, withCount } from '../i18n';
import { greeceModule } from '../lib/greece-module';
import { decodeDraft } from '../lib/share';
import { sitePagePaths, siteCountries } from '../lib/site-countries';
import {
  gameDraft,
  grCountry,
  grShell,
  itemIcon,
} from '../app/greece/game/shell';
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

test.each(['bluecard', 'spouse'])(
  'the ending link restores the same %s timeline on the Greece result page',
  (id) => {
    let state = settle(gr.newGame(id, 4, 'en'));
    // A recorded trip and tax year travel with the timeline.
    state.timeline.trips.push({
      departed: '2025-07-01',
      returned: '2025-07-20',
    });
    state.date = '2027-03-01';
    state.timeline.nationality.incomeByTaxYear[2026] = {
      taxableEur: 30_000,
      dependants: 0,
    };
    state = {
      ...state,
      result: gr.grRules.evaluate({ ...state, locale: 'en' }),
    };
    const href = grCountry.resultHref(state);
    expect(href.startsWith('/greece/result#s=')).toBe(true);
    const draft = decodeDraft(greeceModule, href.split('#s=')[1], true)!;
    expect(draft.completed).toBe(true);
    expect(draft.simulationDate).toBe(state.date);
    expect(draft.pathways).toEqual(state.timeline.pathways);
    expect(draft.nationality?.incomeYears).toContainEqual({
      year: 2026,
      taxableEur: 30_000,
      dependants: 0,
    });
    const shown = greeceModule.run(draft, 'en').columns[0].pathways;
    expect(
      shown.map(({ id, status, earliestDate }) => [id, status, earliestDate]),
    ).toEqual(
      state.result.columns[0].pathways.map(({ id, status, earliestDate }) => [
        id,
        status,
        earliestDate,
      ]),
    );
    expect(gameDraft(state).step).toBe(id === 'bluecard' ? 4 : 6);
  },
);

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

test('the Blue Card holder sees the missing integration requirement', () => {
  // A route with only a waiting date lists nothing else.
  expect(
    grCountry.missingRules(gr.newGame('spouse', 4, 'en'), 'pr'),
  ).toBeUndefined();
  const state = gr.newGame('bluecard', 4, 'en');
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
