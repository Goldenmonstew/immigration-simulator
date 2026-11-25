import { existsSync } from 'node:fs';
import * as React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { afterEach, beforeAll, expect, test, vi } from 'vitest';
import type {
  CountryPathway,
  CountryResult,
  Locale,
} from '@uk-immigration/engine';
import * as ca from '@uk-immigration/game/ca';
import { caGameArt } from '@uk-immigration/game/ca/presentation';
import { CountryAssessmentColumns } from '../components/result-view';
import { LocaleContext } from '../i18n/locale';
import { t, withCount, type TranslationKey } from '../i18n';
import { canadaModule } from '../lib/canada-module';
import { readPageResult } from '../lib/page-result';
import { sitePagePaths, siteCountries } from '../lib/site-countries';
import {
  caCountry,
  caShell,
  gameDraft,
  itemIcon,
  shownResult,
} from '../app/canada/game/shell';
import { gameKey } from '../app/game-shell/game-ui';
import town from '../public/game/canada/town.json';

type State = ReturnType<typeof ca.newGame>;
afterEach(() => vi.unstubAllGlobals());
beforeAll(async () => {
  for (const { id } of ca.characters) await ca.loadCharacter(id);
});

const render = (node: React.ReactNode, locale: Locale = 'zh-CN') =>
  renderToStaticMarkup(
    <LocaleContext value={{ locale, setLocale: () => {} }}>
      {node}
    </LocaleContext>,
  );
function settle(state: State) {
  while (state.pendingEvent)
    state = ca.resolve(state, ca.currentEvent(state)!.choices[0].id);
  return state;
}

test('Canada has a game page, entries and its own save and sound keys', () => {
  expect(siteCountries.find(({ id }) => id === 'ca')?.hasGame).toBe(true);
  expect(sitePagePaths).toContain('/canada/game');
  const storage = new Map<string, string>();
  vi.stubGlobal('localStorage', {
    getItem: (key: string) => storage.get(key) ?? null,
    setItem: (key: string, value: string) => storage.set(key, value),
  });
  const state = ca.newGame('citizen', 4, 'zh-CN');
  expect(caShell.gameStorage('citizen', state).available).toBe(true);
  expect([...storage.keys()]).toEqual(['ca-immigration-life-v3:citizen']);
  expect(caShell.previewGameSave('citizen').state).toEqual(state);
  expect(caShell.previewGameSave('graduate')).toEqual({
    state: undefined,
    available: true,
  });
  caCountry.sound.setMuted(false);
  expect(storage.get('ca-immigration-life-muted')).toBe('false');
});

/** Answer events and read letters until nothing is pending. */
function settleAll(state: State) {
  for (;;) {
    state = settle(state);
    if (!ca.mailbox(state).length) return state;
    state = ca.readMail(state);
  }
}
function visit(state: State, place: string, minute: number) {
  state = settleAll(state);
  if (state.day.minute < minute)
    state = settleAll(ca.tick(state, minute - state.day.minute));
  return settleAll(ca.enter(state, place));
}
function nextDay(state: State) {
  const day = state.dayNumber;
  for (let i = 0; i < 8 && state.dayNumber === day; i++)
    state = settleAll(ca.sleep(settleAll(state)));
  return state;
}
function nextQuarter(from: State) {
  let state = from;
  for (let i = 0; i < 12 && state.date === from.date; i++)
    state = settleAll(ca.sleep(settleAll(state)));
  return state;
}
/** Jump to a later quarter, its assessment and its playable workday. */
function jump(from: State, date: string, day: string) {
  const state = structuredClone(from);
  state.date = date;
  state.day = { ...state.day, date: day, minute: 540, done: [] };
  state.result = ca.caRules.evaluate(state);
  return state;
}
const leave = (state: State) =>
  ca.doActivity(visit(state, 'station', 960), 'leave');

/** Each route as the result page shows it, with every check. */
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
    const href = caCountry.resultHref(state);
    expect(href.startsWith('/canada/result#s='), label).toBe(true);
    const page = readPageResult(
      canadaModule,
      'zh-CN',
      href.split('#s=')[1],
      'result',
    );
    expect(page.correction, label).toBeUndefined();
    expect(page.draft, label).toEqual(gameDraft(state));
    expect(page.draft!.simulationDate, label).toBe(ca.assessedOn(state));
    expect(view(page.result!), label).toEqual(view(shownResult(state)));
    const progress = ca.progress(state);
    for (const column of ['pr', 'cit'] as const)
      expect(progress[column].outcome, `${label} ${column}`).toBe(
        page.result!.columns[0].pathways.find(
          ({ id }) => id === ca.columnPathway(state.timeline, column),
        )!.status,
      );
  }
}
const pathway = (state: State, id: string) =>
  shownResult(state).columns[0].pathways.find((item) => item.id === id)!;

test('the citizen’s ending links open the same timeline on the result page', () => {
  const opening = settleAll(ca.newGame('citizen', 5, 'zh-CN'));
  const abroad = settleAll(
    ca.doActivity(visit(opening, 'station', 600), 'travel-1'),
  );
  const ready = jump(opening, '2027-09-01', '2027-09-14');
  const signed = settleAll(
    ca.doActivity(visit(ready, 'visa', 600), 'apply-citizenship'),
  );
  const invited = nextQuarter(signed);
  invited.stats.civics = 70;
  const passed = ca.doActivity(visit(invited, 'visa', 600), 'cit-test');
  const sworn = ca.doActivity(visit(nextQuarter(passed), 'visa', 600), 'oath');
  expect(sworn.ending).toBe('settled');
  readBack([opening, abroad, leave(signed), sworn]);
  expect(pathway(sworn, 'CA-CITIZENSHIP').status).toBe('MET');
});

test('the graduate’s ending links open the same timeline on the result page', () => {
  let papers = settleAll(ca.newGame('graduate', 5, 'zh-CN'));
  Object.assign(papers.stats, { career: 45, english: 65, money: 9_000 });
  for (const [place, action] of [
    ['work', 'permanent-post'],
    ['newcomer', 'settlement-plan'],
    ['work', 'endorsement-request'],
    ['library', 'police-request'],
    ['college', 'exam'],
  ])
    papers = settleAll(ca.doActivity(visit(papers, place, 600), action));
  const next = nextQuarter(papers);
  const filed = ca.doActivity(visit(next, 'visa', 600), 'settle');
  expect(filed.ending).toBe('settled');
  let lapsed = structuredClone(next);
  lapsed.timeline.document.expires = '2026-07-30';
  for (let i = 0; i < 6 && !ca.isOver(lapsed); i++) lapsed = nextDay(lapsed);
  expect(lapsed.ending).toBe('overstayed');
  readBack([papers, leave(papers), filed, lapsed]);
  // Only the medical exam, which IRCC instructs after receipt, is open.
  expect(
    pathway(filed, 'CA-AIP')
      .checks.filter(
        ({ kind, status }) => kind === 'requirement' && status !== 'MET',
      )
      .map(({ id }) => id),
  ).toEqual(['CA-R24']);
  expect(pathway(lapsed, 'CA-AIP').status).not.toBe('MET');
});

test('a story that ends in town opens on the result page as of its last day', () => {
  const opening = settle(ca.newGame('graduate', 4, 'en'));
  opening.stats.english = 65;
  const at = (state: State, place: string) =>
    settle(ca.enter({ ...state, day: { ...state.day, minute: 600 } }, place));
  // CELPIP on the first workday, then leave Canada the same day.
  const tested = ca.doActivity(at(opening, 'college'), 'exam');
  const left = ca.doActivity(at(settle(tested), 'station'), 'leave');
  expect(left.ending).toBe('left');
  const draft = gameDraft(left);
  expect(draft.simulationDate).toBe('2026-03-10');
  expect(draft.answers.atlantic?.language?.resultDate).toBe('2026-03-10');
  const checks = (result: { columns: { pathways: CountryPathway[] }[] }) =>
    result.columns[0].pathways
      .find(({ id }) => id === 'CA-AIP')!
      .checks.map(({ id, status }) => [id, status]);
  expect(checks(canadaModule.run(draft, 'en'))).toEqual(checks(left.result));
});

test.each(['zh-CN', 'en'] as const)(
  'the status bar, progress bars and assessment speak Canadian residence in %s',
  (locale) => {
    const state = ca.newGame('citizen', 4, locale);
    const hud = render(<caShell.StatusBar state={state} />, locale);
    expect(hud).toContain('CA$18,000');
    expect(hud).toContain(t('game.english', locale));
    expect(hud).toContain(
      withCount(t('ca.game.visa', locale), 'count', ca.visaMonthsLeft(state)),
    );
    const bars = render(
      <caShell.ProgressBars state={state} onOpen={vi.fn()} />,
      locale,
    );
    expect(bars).toContain(t('ca.game.citColumn', locale));
    // The result page's outcome; the date belongs to the time condition.
    expect(bars).toContain(t('country.status.UNKNOWN', locale));
    expect(bars).not.toContain('2027-06-22');
    const detail = render(
      caCountry.progressDetail(state, 'cit', (key) => t(key, locale)),
      locale,
    );
    expect(detail).toContain(t('country.timeConditions', locale));
    expect(detail).toContain(
      t('country.status.FUTURE', locale).replace('{date}', '2027-06-22'),
    );
    const office = settle(ca.enter(settle(state), 'council'));
    let menu: React.ReactNode;
    function Probe() {
      menu = caShell.LocationMenu({
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
    expect(html).toContain('town-ca.current-law-2026-11-heading');
  },
);

test.each(['zh-CN', 'en'] as const)(
  'Canadian recipes keep their own cooking steps in %s',
  (locale) => {
    for (const recipe of ca.recipes) {
      const shared = `game.prepare-${recipe.id}` as TranslationKey;
      const own = gameKey('ca', shared);
      expect(own, recipe.id).toBe(`ca.${shared}`);
      expect(t(own, locale), recipe.id).not.toBe(t(shared, locale));
    }
    expect(
      t(gameKey('ca', 'game.prepare-garden-salad' as TranslationKey), locale),
    ).toBe(
      locale === 'en'
        ? 'Chop and dress with maple vinaigrette'
        : '切块，淋上枫糖油醋汁',
    );
    // The UK salad keeps its own step.
    expect(t('game.prepare-salad', locale)).toBe(
      locale === 'en' ? 'Toss gently' : '轻轻拌匀',
    );
  },
);

test.each(['zh-CN', 'en'] as const)(
  'the kitchen hint and ending furniture use Canadian wording in %s',
  (locale) => {
    const hint = t(gameKey('ca', 'game.kitchenNoIngredients'), locale);
    expect(hint).not.toBe(t('game.kitchenNoIngredients', locale));
    expect(hint).not.toMatch(/池塘|河鲈|pond|perch/);
    expect(hint).toMatch(
      locale === 'en' ? /pollock.*fishing wharf/ : /青鳕.*钓鱼码头/,
    );
    const state = settle(ca.newGame('citizen', 4, locale));
    const shop = ca
      .activities({ ...state, day: { ...state.day, minute: 600 } }, 'shop')
      .filter(({ id }) => id.startsWith('furnish-'))
      .map(({ label }) => (locale === 'en' ? label.en : label.zhCN));
    state.flags.push(
      'furnished-reading-chair',
      'furnished-warm-curtains',
      'furnished-desk-lamp',
    );
    const names = caShell
      .endingMemories(state)
      .furnishings.map(({ name }) => (locale === 'en' ? name.en : name.zhCN));
    expect(names).toEqual(
      locale === 'en'
        ? ['Muskoka chair', 'Thermal curtains', 'Desk lamp']
        : ['马斯科卡木椅', '保暖窗帘', '台灯'],
    );
    expect(shop).toHaveLength(names.length);
    names.forEach((name, i) => expect(shop[i]).toContain(name));
  },
);

test('the IRCC office lists the next steps on each route', () => {
  const graduate = settle(ca.newGame('graduate', 4, 'zh-CN'));
  const visa = { ...graduate, day: { ...graduate.day, minute: 600 } };
  const html = render(
    <caShell.LocationMenu state={visa} location="visa" onChange={vi.fn()} />,
  );
  expect(html).toContain('递交大西洋项目申请前还要');
  expect(html).toContain('CELPIP');
  const citizen = settle(ca.newGame('citizen', 4, 'en'));
  expect(ca.nextStep(citizen)?.en).toContain('2027-06-22');
});

test('every item, character and townsperson has existing art', () => {
  const art = (path: string) =>
    existsSync(new URL(`../public${path}`, import.meta.url));
  for (const item of ca.items)
    expect(art(itemIcon(item.id)), item.id).toBe(true);
  for (const id of [
    ...ca.characters.map((c) => c.id),
    ...ca.npcs.map((n) => n.id),
  ]) {
    expect(caGameArt.cast[id], id).toBeDefined();
    for (const face of ['neutral', 'happy', 'worried'])
      expect(art(caShell.portraitPath(id, face)), id).toBe(true);
    expect(art(caShell.spritePath(id)), id).toBe(true);
  }
  expect(art(caShell.townBanner)).toBe(true);
  for (const sign of caGameArt.shopSigns)
    expect(art(caShell.signPath(sign))).toBe(true);
});

test('the town map has every place, schedule stop and garden plot', () => {
  const layer = (name: string) =>
    town.layers.find((l) => l.name === name)!.objects!;
  const places = new Set(layer('places').map((o) => o.name));
  const anchors = new Set(layer('anchors').map((o) => o.name));
  expect([...places].sort()).toEqual(ca.places.map((p) => p.id).sort());
  for (const npc of ca.npcs)
    for (const rule of npc.schedule)
      for (const { at } of rule.stops)
        if (at !== 'away')
          expect(places.has(at) || anchors.has(at), `${npc.id}: ${at}`).toBe(
            true,
          );
  expect(layer('plots')).toHaveLength(6);
  const [spawn] = layer('spawn');
  const home = layer('places').find((o) => o.name === 'home')!;
  expect([spawn.x, spawn.y - 16]).toEqual([home.x, home.y]);
});
