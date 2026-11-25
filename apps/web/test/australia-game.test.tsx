import { existsSync } from 'node:fs';
import * as React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { afterEach, beforeAll, expect, test, vi } from 'vitest';
import type { CountryResult, Locale } from '@uk-immigration/engine';
import * as au from '@uk-immigration/game/au';
import { auGameArt } from '@uk-immigration/game/au/presentation';
import { CountryAssessmentColumns } from '../components/result-view';
import { LocaleContext } from '../i18n/locale';
import { t, withCount, type TranslationKey } from '../i18n';
import { australiaModule } from '../lib/australia-module';
import { readPageResult } from '../lib/page-result';
import { sitePagePaths, siteCountries } from '../lib/site-countries';
import {
  auCountry,
  auShell,
  gameDraft,
  itemIcon,
  shownResult,
} from '../app/australia/game/shell';
import { gameKey } from '../app/game-shell/game-ui';
import town from '../public/game/australia/town.json';

type State = ReturnType<typeof au.newGame>;
afterEach(() => vi.unstubAllGlobals());
beforeAll(async () => {
  for (const { id } of au.characters) await au.loadCharacter(id);
});

const render = (node: React.ReactNode, locale: Locale = 'zh-CN') =>
  renderToStaticMarkup(
    <LocaleContext value={{ locale, setLocale: () => {} }}>
      {node}
    </LocaleContext>,
  );
function settle(state: State) {
  while (state.pendingEvent)
    state = au.resolve(state, au.currentEvent(state)!.choices[0].id);
  return state;
}

test('Australia has a game page, entries and its own save and sound keys', () => {
  expect(siteCountries.find(({ id }) => id === 'au')?.hasGame).toBe(true);
  expect(sitePagePaths).toContain('/australia/game');
  const storage = new Map<string, string>();
  vi.stubGlobal('localStorage', {
    getItem: (key: string) => storage.get(key) ?? null,
    setItem: (key: string, value: string) => storage.set(key, value),
  });
  const state = au.newGame('nurse', 4, 'zh-CN');
  expect(auShell.gameStorage('nurse', state).available).toBe(true);
  expect([...storage.keys()]).toEqual(['au-immigration-life-v3:nurse']);
  expect(auShell.previewGameSave('nurse').state).toEqual(state);
  expect(auShell.previewGameSave('graduate')).toEqual({
    state: undefined,
    available: true,
  });
  auCountry.sound.setMuted(false);
  expect(storage.get('au-immigration-life-muted')).toBe('false');
});

/** Walk to an open place at a given time, as the town map would. */
function visit(state: State, place: string, minute: number) {
  state = settle(state);
  if (state.day.minute < minute)
    state = settle(au.tick(state, minute - state.day.minute));
  return settle(au.enter(state, place));
}
/** Sleep through to the next playable day, answering events on the way. */
function nextDay(state: State) {
  const day = state.dayNumber;
  for (let i = 0; i < 8 && state.dayNumber === day; i++)
    state = settle(au.sleep(settle(state)));
  return state;
}
/** Every 191 document in hand, at a later quarter start. */
function ready(state: State, date: string) {
  const next = structuredClone(state);
  Object.assign(next.timeline.publicInterest, {
    health: 'cleared',
    policeDocuments: 'supplied',
  });
  next.timeline.regional.assessmentYears = [2023, 2024, 2025, 2026, 2027];
  next.date = date;
  next.result = au.auRules.evaluate(next);
  return next;
}
const view = (result: CountryResult) =>
  result.columns[0].pathways.map((pathway) => ({
    id: pathway.id,
    status: pathway.status,
    earliestDate: pathway.earliestDate,
    timeEarliestDate: pathway.timeEarliestDate,
    checks: pathway.checks.map((check) => [check.id, check.status, check.kind]),
  }));

test.each([
  ['nurse', '2027-12-01', '2029-09-01'],
  ['graduate', '2027-09-01', '2029-06-01'],
] as const)(
  'the ending link opens the same %s timeline on the Australia result page',
  (id, metOn, lastQuarter) => {
    vi.stubGlobal('localStorage', {
      getItem: () => null,
      setItem: () => {},
      removeItem: () => {},
    });
    const opening = settle(au.newGame(id, 7, 'zh-CN'));
    // A month home, recorded when the quarter that holds the return begins.
    const abroad = settle(
      au.doActivity(visit(opening, 'station', 600), 'travel-1'),
    );
    expect(abroad.timeline.trips).toHaveLength(1);
    // The medical and police checks on the quarter's playable day, then leave.
    const medical = au.doActivity(
      visit(opening, 'station', 540),
      'health-exam',
    );
    const papers = au.doActivity(visit(medical, 'post', 900), 'police-check');
    const left = au.doActivity(visit(papers, 'station', 1000), 'leave');
    expect(left.ending).toBe('left');
    const lodged = au.doActivity(
      visit(ready(opening, metOn), 'visa', 600),
      'settle',
    );
    expect(lodged.ending).toBe('settled');
    let lapsed = ready(opening, lastQuarter);
    for (let i = 0; i < 6 && !au.isOver(lapsed); i++) lapsed = nextDay(lapsed);
    expect(lapsed.ending).toBe('overstayed');
    for (const state of [opening, abroad, left, lodged, lapsed]) {
      const href = auCountry.resultHref(state);
      expect(href.startsWith('/australia/result#s=')).toBe(true);
      const page = readPageResult(
        australiaModule,
        'zh-CN',
        href.split('#s=')[1],
        'result',
      );
      expect(page.correction, state.ending).toBeUndefined();
      expect(page.draft, state.ending).toEqual(gameDraft(state));
      expect(page.draft!.simulationDate).toBe(state.date);
      expect(page.draft!.step).toBe(6);
      expect(view(page.result!), state.ending).toEqual(
        view(shownResult(state)),
      );
      expect(au.progress(state).pr.outcome).toBe(
        page.result!.columns[0].pathways[0].status,
      );
    }
    expect(view(lodged.result)[0].status).toBe('MET');
    expect(view(lapsed.result)[0].status).toBe('NOT_MET');
  },
);

test('leaving on a festival after the visa has ended links the lapse on that day', () => {
  vi.stubGlobal('localStorage', {
    getItem: () => null,
    setItem: () => {},
    removeItem: () => {},
  });
  // The graduate's 485 ends on 2029-07-14; the grand final is on 2029-08-25.
  let state = ready(settle(au.newGame('graduate', 7, 'zh-CN')), '2029-06-01');
  state.quarter = 3;
  while (state.day.index < 2) state = nextDay(state);
  expect([state.day.date, state.day.festival]).toEqual([
    '2029-08-25',
    'footy-final',
  ]);
  const hud = render(<auShell.StatusBar state={state} />);
  expect(hud).toContain(withCount(t('au.game.visa', 'zh-CN'), 'count', 0));
  // No visa runs on: the fast-forward warning says the game ends this quarter.
  expect(auCountry.visaStatus(state)).toEqual({ months: 0, renewed: false });
  expect(
    auCountry.visaStatus(settle(au.newGame('graduate', 7, 'zh-CN'))).validTo,
  ).toBe('2029-07-14');
  expect(t('au.game.fastVisaWarningNone', 'zh-CN')).toBe(
    '签证已到期，这一季结束时本局结束。',
  );
  expect(t('au.game.fastVisaWarningNone', 'en')).toBe(
    'Your visa has ended. This game ends when the quarter does.',
  );
  expect(view(shownResult(state))[0].status).toBe('NOT_MET');
  const left = au.doActivity(visit(state, 'station', 900), 'leave');
  expect(left.ending).toBe('left');
  const page = readPageResult(
    australiaModule,
    'zh-CN',
    auCountry.resultHref(left).split('#s=')[1],
    'result',
  );
  expect(page.correction).toBeUndefined();
  expect(page.draft).toEqual(gameDraft(left));
  expect(page.draft!.simulationDate).toBe('2029-08-25');
  expect(view(page.result!)).toEqual(view(shownResult(left)));
  expect(view(page.result!)[0].status).toBe('NOT_MET');
});

test('a Hong Kong application lodged with usual residence pending links the same assessment', () => {
  vi.stubGlobal('localStorage', {
    getItem: () => null,
    setItem: () => {},
    removeItem: () => {},
  });
  const opening = settle(au.newGame('graduate', 7, 'zh-CN'));
  let state = au.doActivity(visit(opening, 'station', 540), 'health-exam');
  state = au.doActivity(visit(state, 'post', 900), 'police-check');
  state = settle(au.doActivity(visit(state, 'station', 1000), 'travel-1'));
  const later = structuredClone(state);
  Object.assign(later, { date: '2027-09-01', quarter: 4 });
  later.result = au.auRules.evaluate(later);
  const lodged = au.doActivity(visit(later, 'visa', 600), 'settle');
  expect(lodged.ending).toBe('settled');
  const page = readPageResult(
    australiaModule,
    'zh-CN',
    auCountry.resultHref(lodged).split('#s=')[1],
    'result',
  );
  expect(page.correction).toBeUndefined();
  expect(page.draft).toEqual(gameDraft(lodged));
  expect(view(page.result!)).toEqual(view(shownResult(lodged)));
  expect(view(page.result!)[0].status).toBe('UNKNOWN');
  expect(au.progress(lodged).pr.outcome).toBe('UNKNOWN');
  // The bar reads 0%, but the application can go in that day.
  expect(au.progress(later).pr.percent).toBe(0);
  for (const locale of ['zh-CN', 'en'] as const)
    expect(
      render(
        auCountry.progressDetail(later, 'pr', (key) => t(key, locale)),
        locale,
      ),
    ).toContain(t('au.game.residencePending', locale));
  expect(
    render(auCountry.progressDetail(opening, 'pr', (key) => t(key, 'zh-CN'))),
  ).not.toContain(t('au.game.residencePending', 'zh-CN'));
});

test.each(['zh-CN', 'en'] as const)(
  'the status bar, progress bar and assessment speak Australian residence in %s',
  (locale) => {
    const state = au.newGame('nurse', 4, locale);
    const hud = render(<auShell.StatusBar state={state} />, locale);
    expect(hud).toContain('$15,000');
    expect(hud).toContain(t('au.game.english', locale));
    // A 1 March start falls in the southern autumn.
    expect(hud).toContain(t('au.game.season2', locale));
    expect(hud).toContain(
      withCount(t('au.game.visa', locale), 'count', au.visaMonthsLeft(state)),
    );
    const bars = render(
      <auShell.ProgressBars state={state} onOpen={vi.fn()} />,
      locale,
    );
    expect(bars).toContain(t('au.game.prColumn', locale));
    expect(bars).toContain('44%');
    expect(bars).toContain(t('country.status.NOT_MET', locale));
    const office = settle(au.enter(settle(state), 'council'));
    let menu: React.ReactNode;
    function Probe() {
      menu = auShell.LocationMenu({
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
    expect(html).toContain('town-au.current-law-2026-11-heading');
    // Checks are labelled by kind and the date named as on the result page.
    expect(html).toContain(t('country.check.time', locale));
    expect(html).toContain(t('country.check.budget', locale));
    const detail = render(
      auCountry.progressDetail(state, 'pr', (key) => t(key, locale)),
      locale,
    );
    expect(detail).toContain(t('au.result.earliest', locale));
  },
);

test.each(['zh-CN', 'en'] as const)(
  'Australian recipes keep their own cooking steps in %s',
  (locale) => {
    for (const recipe of au.recipes) {
      const shared = `game.prepare-${recipe.id}` as TranslationKey;
      const own = gameKey('au', shared);
      expect(own, recipe.id).toBe(`au.${shared}`);
      expect(t(own, locale), recipe.id).not.toBe(t(shared, locale));
    }
    expect(
      t(gameKey('au', 'game.prepare-summer-salad' as TranslationKey), locale),
    ).toBe(
      locale === 'en'
        ? 'Chop and squeeze over some lemon'
        : '切块，挤一点柠檬汁',
    );
    // The UK salad keeps its own step.
    expect(t('game.prepare-salad', locale)).toBe(
      locale === 'en' ? 'Toss gently' : '轻轻拌匀',
    );
  },
);

test.each(['zh-CN', 'en'] as const)(
  'the kitchen hint and ending furniture use Australian wording in %s',
  (locale) => {
    const hint = t(gameKey('au', 'game.kitchenNoIngredients'), locale);
    expect(hint).not.toBe(t('game.kitchenNoIngredients', locale));
    expect(hint).not.toMatch(/池塘|河鲈|pond|perch/);
    expect(hint).toMatch(locale === 'en' ? /flathead.*jetty/ : /鲬鱼.*码头/);
    const state = settle(au.newGame('nurse', 4, locale));
    const shop = au
      .activities({ ...state, day: { ...state.day, minute: 600 } }, 'shop')
      .filter(({ id }) => id.startsWith('furnish-'))
      .map(({ label }) => (locale === 'en' ? label.en : label.zhCN));
    state.flags.push(
      'furnished-reading-chair',
      'furnished-warm-curtains',
      'furnished-desk-lamp',
    );
    const names = auShell
      .endingMemories(state)
      .furnishings.map(({ name }) => (locale === 'en' ? name.en : name.zhCN));
    expect(names).toEqual(
      locale === 'en'
        ? ['Cane armchair', 'Block-out curtains', 'Desk lamp']
        : ['藤编扶手椅', '遮光窗帘', '台灯'],
    );
    expect(shop).toHaveLength(names.length);
    names.forEach((name, i) => expect(shop[i]).toContain(name));
  },
);

test('the details button names the migration agent as the map does', () => {
  const agent = au.places.find(({ id }) => id === 'council')!.name;
  expect(t('au.game.councilDetails', 'zh-CN')).toContain(agent.zhCN);
  expect(t('au.game.councilDetails', 'zh-CN')).not.toContain('事务所');
  expect(t('au.game.councilDetails', 'en')).toContain(agent.en.toLowerCase());
});

test('every item, character and townsperson has existing art', () => {
  const art = (path: string) =>
    existsSync(new URL(`../public${path}`, import.meta.url));
  for (const item of au.items)
    expect(art(itemIcon(item.id)), item.id).toBe(true);
  for (const id of [
    ...au.characters.map((c) => c.id),
    ...au.npcs.map((n) => n.id),
  ]) {
    expect(auGameArt.cast[id], id).toBeDefined();
    for (const face of ['neutral', 'happy', 'worried'])
      expect(art(auShell.portraitPath(id, face)), id).toBe(true);
    expect(art(auShell.spritePath(id)), id).toBe(true);
  }
  expect(art(auShell.townBanner)).toBe(true);
  for (const sign of auGameArt.shopSigns)
    expect(art(auShell.signPath(sign))).toBe(true);
});

test('the town map has every place, schedule stop and garden plot', () => {
  const layer = (name: string) =>
    town.layers.find((l) => l.name === name)!.objects!;
  const places = new Set(layer('places').map((o) => o.name));
  const anchors = new Set(layer('anchors').map((o) => o.name));
  expect([...places].sort()).toEqual(au.places.map((p) => p.id).sort());
  for (const npc of au.npcs)
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
