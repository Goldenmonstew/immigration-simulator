import { existsSync } from 'node:fs';
import * as React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { afterEach, beforeAll, expect, test, vi } from 'vitest';
import type { CountryResult, Locale } from '@uk-immigration/engine';
import * as nz from '@uk-immigration/game/nz';
import { nzGameArt } from '@uk-immigration/game/nz/presentation';
import { CountryAssessmentColumns } from '../components/result-view';
import { LocaleContext } from '../i18n/locale';
import { t, withCount, type TranslationKey } from '../i18n';
import { newZealandModule } from '../lib/new-zealand-module';
import { readPageResult } from '../lib/page-result';
import { sitePagePaths, siteCountries } from '../lib/site-countries';
import {
  gameDraft,
  itemIcon,
  nzCountry,
  nzShell,
  shownResult,
} from '../app/new-zealand/game/shell';
import { gameKey } from '../app/game-shell/game-ui';
import town from '../public/game/new-zealand/town.json';

type State = ReturnType<typeof nz.newGame>;
afterEach(() => vi.unstubAllGlobals());
beforeAll(async () => {
  for (const { id } of nz.characters) await nz.loadCharacter(id);
});

const render = (node: React.ReactNode, locale: Locale = 'zh-CN') =>
  renderToStaticMarkup(
    <LocaleContext value={{ locale, setLocale: () => {} }}>
      {node}
    </LocaleContext>,
  );
function settle(state: State) {
  while (state.pendingEvent)
    state = nz.resolve(state, nz.currentEvent(state)!.choices[0].id);
  return state;
}

test('New Zealand has a game page, entries and its own save and sound keys', () => {
  expect(siteCountries.find(({ id }) => id === 'nz')?.hasGame).toBe(true);
  expect(sitePagePaths).toContain('/new-zealand/game');
  const storage = new Map<string, string>();
  vi.stubGlobal('localStorage', {
    getItem: (key: string) => storage.get(key) ?? null,
    setItem: (key: string, value: string) => storage.set(key, value),
  });
  const state = nz.newGame('nurse', 4, 'zh-CN');
  expect(nzShell.gameStorage('nurse', state).available).toBe(true);
  expect([...storage.keys()]).toEqual(['nz-immigration-life-v3:nurse']);
  expect(nzShell.previewGameSave('nurse').state).toEqual(state);
  expect(nzShell.previewGameSave('partner')).toEqual({
    state: undefined,
    available: true,
  });
  nzCountry.sound.setMuted(false);
  expect(storage.get('nz-immigration-life-muted')).toBe('false');
});

/** Answer events and read letters until nothing is pending. */
function settleAll(state: State) {
  for (;;) {
    state = settle(state);
    if (!nz.mailbox(state).length) return state;
    state = nz.readMail(state);
  }
}
function visit(state: State, place: string, minute: number) {
  state = settleAll(state);
  if (state.day.minute < minute)
    state = settleAll(nz.tick(state, minute - state.day.minute));
  return settleAll(nz.enter(state, place));
}
/** Jump to a later quarter, its assessment and its playable workday. */
function jump(from: State, date: string, day: string) {
  const state = structuredClone(from);
  state.date = date;
  state.day = { ...state.day, date: day, minute: 540, done: [] };
  state.result = nz.nzRules.evaluate(state);
  return state;
}
const leave = (state: State) =>
  nz.doActivity(visit(state, 'station', 900), 'leave');

/** Each pathway as the result page shows it, with every check. */
const view = (result: CountryResult) =>
  result.columns[0].pathways.map((pathway) => ({
    id: pathway.id,
    status: pathway.status,
    earliestDate: pathway.earliestDate,
    timeStatus: pathway.timeStatus,
    timeEarliestDate: pathway.timeEarliestDate,
    travelDate: pathway.travelDate,
    checks: pathway.checks.map(({ id, status, kind }) => [id, status, kind]),
  }));

/** Open each state's ending link the way the result page does. */
function readBack(states: State[]) {
  vi.stubGlobal('localStorage', {
    getItem: () => null,
    setItem: () => {},
    removeItem: () => {},
  });
  for (const state of states) {
    const label = `${state.characterId} ${state.date} ${state.ending}`;
    const href = nzCountry.resultHref(state);
    expect(href.startsWith('/new-zealand/result#s='), label).toBe(true);
    const page = readPageResult(
      newZealandModule,
      'zh-CN',
      href.split('#s=')[1],
      'result',
    );
    expect(page.correction, label).toBeUndefined();
    expect(page.draft, label).toEqual(gameDraft(state));
    expect(page.draft!.goals, label).toEqual(['prv', 'citizenship']);
    expect(page.draft!.simulationDate, label).toBe(state.date);
    expect(view(page.result!), label).toEqual(view(shownResult(state)));
    const progress = nz.progress(state);
    for (const [column, id] of [
      ['prv', 'NZ-PRV'],
      ['cit', 'NZ-CITIZENSHIP'],
    ] as const)
      expect(progress[column].outcome, `${label} ${column}`).toBe(
        page.result!.columns[0].pathways.find((pathway) => pathway.id === id)!
          .status,
      );
  }
}

test.each([
  ['nurse', '2027-09-01', '2027-09-14'],
  ['partner', '2028-03-01', '2028-03-14'],
])(
  'the %s’s ending links open the same timeline on the result page',
  (id, eligible, workday) => {
    const opening = settleAll(nz.newGame(id, 5, 'zh-CN'));
    const abroad = settleAll(
      nz.doActivity(visit(opening, 'station', 600), 'travel-1'),
    );
    expect(abroad.timeline.trips).toHaveLength(1);
    const ready = jump(abroad, eligible, workday);
    const filed = nz.doActivity(visit(ready, 'visa', 600), 'settle');
    expect(filed.ending).toBe('settled');
    readBack([opening, abroad, leave(opening), leave(abroad), ready, filed]);
  },
);

test.each(['zh-CN', 'en'] as const)(
  'the status bar, progress bars and assessment speak New Zealand residence in %s',
  (locale) => {
    const state = nz.newGame('nurse', 4, locale);
    const hud = render(<nzShell.StatusBar state={state} />, locale);
    expect(hud).toContain('NZ$14,000');
    expect(hud).toContain(t('game.tereo', locale));
    expect(hud).toContain(t('nz.game.season2', locale));
    expect(hud).toContain(
      withCount(t('nz.game.visa', locale), 'count', nz.visaMonthsLeft(state)),
    );
    const bars = render(
      <nzShell.ProgressBars state={state} onOpen={vi.fn()} />,
      locale,
    );
    expect(bars).toContain(t('nz.game.prvColumn', locale));
    expect(bars).toContain(
      t('country.status.FUTURE', locale).replace('{date}', '2027-08-18'),
    );
    // Citizenship: the result page's outcome; the presence date is a detail.
    expect(bars).toContain(t('country.status.NOT_MET', locale));
    expect(bars).not.toContain('2030-04-15');
    const detail = render(
      nzCountry.progressDetail(state, 'cit', (key) => t(key, locale)),
      locale,
    );
    expect(detail).toContain(t('nz.game.presenceDate', locale));
    expect(detail).toContain('2030-04-15');
    const office = settle(nz.enter(settle(state), 'council'));
    let menu: React.ReactNode;
    function Probe() {
      menu = nzShell.LocationMenu({
        state: { ...office, day: { ...office.day, minute: 600 } },
        location: 'council',
        onChange: vi.fn(),
      });
      return menu;
    }
    const html = render(<Probe />, locale);
    let columns: React.ReactElement<{ result: CountryResult }> | undefined;
    React.Children.forEach(menu, function find(node) {
      if (!React.isValidElement<{ children?: React.ReactNode }>(node)) return;
      if (node.type === CountryAssessmentColumns)
        columns = node as React.ReactElement<{ result: CountryResult }>;
      React.Children.forEach(node.props.children, find);
    });
    // The advice centre shows the assessment as the result page does.
    expect(columns!.props.result).toEqual(shownResult(office));
    expect(
      columns!.props.result.columns[0].pathways[0].checks.every(
        (check) => check.kind,
      ),
    ).toBe(true);
    if (locale === 'en') expect(hud + bars).not.toMatch(/[㐀-鿿]/);
    expect(html).toContain('town-nz.current-law-heading');
  },
);

test.each(['zh-CN', 'en'] as const)(
  'New Zealand recipes keep their own cooking steps in %s',
  (locale) => {
    for (const recipe of nz.recipes) {
      const shared = `game.prepare-${recipe.id}` as TranslationKey;
      const own = gameKey('nz', shared);
      expect(own, recipe.id).toBe(`nz.${shared}`);
      expect(t(own, locale), recipe.id).not.toBe(t(shared, locale));
    }
    // The UK salad with the same recipe ID keeps its own step.
    expect(t('game.prepare-salad', locale)).toBe(
      locale === 'en' ? 'Toss gently' : '轻轻拌匀',
    );
    expect(t(gameKey('nz', 'game.prepare-salad'), locale)).toBe(
      locale === 'en'
        ? 'Chop and drizzle with olive oil'
        : '切块，淋一点橄榄油',
    );
  },
);

test.each(['zh-CN', 'en'] as const)(
  'the kitchen hint and ending furniture use New Zealand wording in %s',
  (locale) => {
    const hint = t(gameKey('nz', 'game.kitchenNoIngredients'), locale);
    expect(hint).not.toBe(t('game.kitchenNoIngredients', locale));
    expect(hint).not.toMatch(/池塘|河鲈|pond|perch/);
    const state = settle(nz.newGame('nurse', 4, locale));
    const board = nz
      .activities({ ...state, day: { ...state.day, minute: 600 } }, 'board')
      .filter(({ id }) => id.startsWith('furnish-'))
      .map(({ label }) => (locale === 'en' ? label.en : label.zhCN));
    state.flags.push(
      'furnished-reading-chair',
      'furnished-warm-curtains',
      'furnished-desk-lamp',
    );
    const names = nzShell
      .endingMemories(state)
      .furnishings.map(({ name }) => (locale === 'en' ? name.en : name.zhCN));
    expect(names).toEqual(
      locale === 'en'
        ? ['Second-hand armchair', 'Thermal curtains', 'Desk lamp']
        : ['二手单人沙发', '保暖窗帘', '台灯'],
    );
    expect(board).toHaveLength(names.length);
    names.forEach((name, i) =>
      expect(board[i].toLowerCase()).toContain(name.toLowerCase()),
    );
  },
);

test('the immigration office notes the travel conditions and the PRV date', () => {
  const state = settle(nz.newGame('nurse', 4, 'en'));
  expect(nzCountry.placeNote!(state, 'visa')?.en).toBe(
    'Your resident visa’s travel conditions run to 2027-08-17. Trips must be back by then. You can apply for a permanent resident visa from 2027-08-18.',
  );
  expect(nzCountry.visaStatus(state)).toEqual({
    months: 17,
    renewed: false,
    validTo: '2027-08-17',
  });
});

test('the travel conditions end on their own day, mid-quarter', () => {
  let state = settle(nz.newGame('nurse', 4, 'en'));
  state.timeline.travelConditionsEnd = '2026-03-15';
  expect(nzCountry.visaStatus(state).validTo).toBe('2026-03-15');
  for (let i = 0; i < 8 && state.day.kind !== 'special'; i++)
    state = settle(nz.sleep(settle(state)));
  // The Pasifika festival on 2026-03-21, after the conditions ended.
  expect([state.date, state.day.date]).toEqual(['2026-03-01', '2026-03-21']);
  expect(nzCountry.visaStatus(state)).toEqual({ months: 0, renewed: false });
  expect(nzCountry.placeNote!(state, 'visa')?.en).toContain(
    'Your travel conditions ended on 2026-03-15.',
  );
});

test('every item, character and townsperson has existing art', () => {
  const art = (path: string) =>
    existsSync(new URL(`../public${path}`, import.meta.url));
  for (const item of nz.items)
    expect(art(itemIcon(item.id)), item.id).toBe(true);
  for (const id of [
    ...nz.characters.map((c) => c.id),
    ...nz.npcs.map((n) => n.id),
  ]) {
    expect(nzGameArt.cast[id], id).toBeDefined();
    for (const face of ['neutral', 'happy', 'worried'])
      expect(art(nzShell.portraitPath(id, face)), id).toBe(true);
    expect(art(nzShell.spritePath(id)), id).toBe(true);
  }
  expect(art(nzShell.townBanner)).toBe(true);
  for (const sign of nzGameArt.shopSigns)
    expect(art(nzShell.signPath(sign))).toBe(true);
});

test('the town map has every place, schedule stop and garden plot', () => {
  const layer = (name: string) =>
    town.layers.find((l) => l.name === name)!.objects!;
  const places = new Set(layer('places').map((o) => o.name));
  const anchors = new Set(layer('anchors').map((o) => o.name));
  expect([...places].sort()).toEqual(nz.places.map((p) => p.id).sort());
  for (const npc of nz.npcs)
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
