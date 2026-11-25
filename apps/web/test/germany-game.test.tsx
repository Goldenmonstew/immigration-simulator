import { existsSync } from 'node:fs';
import * as React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { afterEach, beforeAll, expect, test, vi } from 'vitest';
import type { CountryResult, Locale } from '@uk-immigration/engine';
import * as de from '@uk-immigration/game/de';
import { deGameArt } from '@uk-immigration/game/de/presentation';
import { CountryAssessmentColumns } from '../components/result-view';
import { LocaleContext } from '../i18n/locale';
import { t, withCount, type TranslationKey } from '../i18n';
import { germanyModule } from '../lib/germany-module';
import { readPageResult } from '../lib/page-result';
import { sitePagePaths, siteCountries } from '../lib/site-countries';
import {
  deCountry,
  deShell,
  gameDraft,
  itemIcon,
} from '../app/germany/game/shell';
import { gameKey } from '../app/game-shell/game-ui';
import town from '../public/game/germany/town.json';

type State = ReturnType<typeof de.newGame>;
afterEach(() => vi.unstubAllGlobals());
beforeAll(async () => {
  for (const { id } of de.characters) await de.loadCharacter(id);
});

const render = (node: React.ReactNode, locale: Locale = 'zh-CN') =>
  renderToStaticMarkup(
    <LocaleContext value={{ locale, setLocale: () => {} }}>
      {node}
    </LocaleContext>,
  );
function settle(state: State) {
  while (state.pendingEvent)
    state = de.resolve(state, de.currentEvent(state)!.choices[0].id);
  return state;
}
function visit(state: State, place: string, minute: number) {
  state = settle(state);
  if (state.day.minute < minute)
    state = settle(de.tick(state, minute - state.day.minute));
  return settle(de.enter(state, place));
}
function nextDay(state: State) {
  const day = state.dayNumber;
  for (let i = 0; i < 8 && state.dayNumber === day; i++)
    state = settle(de.sleep(settle(state)));
  return state;
}
/** B1 and a Leben in Deutschland result, as the exams record them. */
function certified(state: State) {
  state.timeline.common.provenGerman = 'B1';
  state.timeline.citizenship.germanEvidence = 'B1';
  state.timeline.common.orientationScore = 20;
  state.timeline.citizenship.knowledge = { kind: 'lid', correct: 20 };
  state.flags.push('german-b1');
  state.result = de.deRules.evaluate(state);
  return state;
}
const view = (result: CountryResult) =>
  result.columns[0].pathways.map((pathway) => ({
    id: pathway.id,
    status: pathway.status,
    earliestDate: pathway.earliestDate,
    checks: pathway.checks.map((check) => [check.id, check.status]),
  }));
/** The ending link, read back through the result page's own entry. */
function reopen(state: State) {
  const href = deCountry.resultHref(state);
  expect(href.startsWith('/germany/result#s=')).toBe(true);
  const page = readPageResult(
    germanyModule,
    'zh-CN',
    href.split('#s=')[1],
    'result',
  );
  expect(page.correction).toBeUndefined();
  expect(page.draft).toEqual(gameDraft(state));
  expect(page.draft!.simulationDate).toBe(state.date);
  // No invented local housing standard travels to the questionnaire.
  expect(JSON.stringify(page.draft)).not.toContain('localMinimumM2');
  expect(view(page.result!)).toEqual(view(state.result));
}

test('Germany has a game page, entries and its own save and sound keys', () => {
  expect(siteCountries.find(({ id }) => id === 'de')?.hasGame).toBe(true);
  expect(sitePagePaths).toContain('/germany/game');
  const storage = new Map<string, string>();
  vi.stubGlobal('localStorage', {
    getItem: (key: string) => storage.get(key) ?? null,
    setItem: (key: string, value: string) => storage.set(key, value),
  });
  const state = de.newGame('bluecard', 4, 'zh-CN');
  expect(deShell.gameStorage('bluecard', state).available).toBe(true);
  expect([...storage.keys()]).toEqual(['de-immigration-life-v3:bluecard']);
  expect(deShell.previewGameSave('bluecard').state).toEqual(state);
  expect(deShell.previewGameSave('spouse')).toEqual({
    state: undefined,
    available: true,
  });
  deCountry.sound.setMuted(false);
  expect(storage.get('de-immigration-life-muted')).toBe('false');
});

test.each(['bluecard', 'spouse'])(
  'the ending link opens the same %s timeline on the Germany result page',
  (id) => {
    vi.stubGlobal('localStorage', {
      getItem: () => null,
      setItem: () => {},
      removeItem: () => {},
    });
    const opening = settle(de.newGame(id, 7, 'zh-CN'));
    const abroad = settle(
      de.doActivity(visit(opening, 'station', 600), 'travel-1'),
    );
    expect(abroad.timeline.trips).toHaveLength(1);
    // After the exams, with B1 and a test result in the timeline.
    const weekend = nextDay(opening);
    weekend.stats.german = 60;
    const college = visit(weekend, 'college', 600);
    const examined = de.doActivity(
      de.doActivity(college, 'orientation-test'),
      'exam',
    );
    expect(examined.timeline.common.provenGerman).toBe('B1');
    for (const state of [opening, abroad, examined]) reopen(state);
    expect(gameDraft(opening).step).toBe(5);
  },
);

test.each(['bluecard', 'spouse'])(
  'the ending link opens after %s settles, leaves or lets the permit lapse',
  (id) => {
    vi.stubGlobal('localStorage', {
      getItem: () => null,
      setItem: () => {},
      removeItem: () => {},
    });
    const ready = certified(settle(de.newGame(id, 7, 'zh-CN')));
    ready.date = id === 'bluecard' ? '2026-12-01' : '2027-03-01';
    ready.timeline.blueCardEmploymentMonths &&= 22;
    ready.result = de.deRules.evaluate(ready);
    const settled = de.doActivity(visit(ready, 'visa', 600), 'settle');
    expect(settled.ending).toBe('settled');
    const left = de.doActivity(visit(ready, 'station', 600), 'leave');
    expect(left.ending).toBe('left');
    let lapsed = settle(de.newGame(id, 7, 'zh-CN'));
    de.currentPermit(lapsed).to = '2026-04-30';
    for (let i = 0; i < 6 && !de.isOver(lapsed); i++) lapsed = nextDay(lapsed);
    expect(lapsed.ending).toBe('overstayed');
    for (const state of [settled, left, lapsed]) reopen(state);
  },
);

test('the ending link opens after the Blue Card is extended and naturalisation is filed', () => {
  vi.stubGlobal('localStorage', {
    getItem: () => null,
    setItem: () => {},
    removeItem: () => {},
  });
  const state = settle(de.newGame('bluecard', 7, 'zh-CN'));
  state.date = '2028-03-01';
  state.day.date = '2028-03-14';
  state.result = de.deRules.evaluate(state);
  const renewed = de.doActivity(visit(state, 'visa', 600), 'extend');
  expect(renewed.timeline.permits).toHaveLength(2);
  const later = certified(structuredClone(renewed));
  later.date = '2030-03-01';
  later.day.date = '2030-03-12';
  later.result = de.deRules.evaluate(later);
  const naturalised = de.doActivity(visit(later, 'bureau', 600), 'naturalise');
  expect(naturalised.ending).toBe('settled');
  for (const ending of [renewed, naturalised]) reopen(ending);
  // The status bar runs to the extended card.
  expect(deCountry.visaStatus(renewed)).toEqual({
    months: 28,
    renewed: true,
    validTo: '2030-07-14',
  });
});

test.each(['zh-CN', 'en'] as const)(
  'the status bar, progress bars and assessment speak German residence in %s',
  (locale) => {
    const state = de.newGame('bluecard', 4, locale);
    const hud = render(<deShell.StatusBar state={state} />, locale);
    expect(hud).toContain('€15,000');
    expect(hud).toContain(t('game.german', locale));
    expect(hud).toContain(
      withCount(t('de.game.visa', locale), 'count', de.visaMonthsLeft(state)),
    );
    const bars = render(
      <deShell.ProgressBars state={state} onOpen={vi.fn()} />,
      locale,
    );
    expect(bars).toContain(t('de.game.settleColumn', locale));
    expect(bars).toContain(t('de.game.natColumn', locale));
    expect(bars).toContain(t('country.status.NOT_MET', locale));
    // Only the time requirement has a date; the bar does not claim the rest.
    const spouse = certified(settle(de.newGame('spouse', 4, locale)));
    spouse.date = '2026-12-01';
    spouse.result = de.deRules.evaluate({ ...spouse, locale });
    expect(de.progress(spouse).settle.outcome).toBe('FUTURE');
    const future = render(
      <deShell.ProgressBars state={spouse} onOpen={vi.fn()} />,
      locale,
    );
    expect(future).toContain(
      t('de.game.timeFuture', locale).replace('{date}', '2027-03-01'),
    );
    const office = settle(de.enter(settle(state), 'council'));
    let menu: React.ReactNode;
    function Probe() {
      menu = deShell.LocationMenu({
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
    expect(columns).toBeDefined();
    // The checks carry the result page's display groups.
    const fee = columns!.props.result.columns[0].pathways[0].checks.find(
      ({ id }) => id === 'DE-C65',
    );
    expect(fee?.kind).toBe('budget');
    if (locale === 'en') expect(hud + bars).not.toMatch(/[㐀-鿿]/);
    expect(html).toContain('town-de.current-law-2026-11-heading');
  },
);

test.each(['zh-CN', 'en'] as const)(
  'German recipes keep their own cooking steps in %s',
  (locale) => {
    for (const recipe of de.recipes) {
      const shared = `game.prepare-${recipe.id}` as TranslationKey;
      const own = gameKey('de', shared);
      expect(own, recipe.id).toBe(`de.${shared}`);
      expect(t(own, locale), recipe.id).not.toBe(t(shared, locale));
    }
  },
);

test.each(['zh-CN', 'en'] as const)(
  'the kitchen hint and ending furniture use German wording in %s',
  (locale) => {
    const hint = t(gameKey('de', 'game.kitchenNoIngredients'), locale);
    expect(hint).not.toBe(t('game.kitchenNoIngredients', locale));
    expect(hint).not.toMatch(/池塘|pond/);
    const state = settle(de.newGame('bluecard', 4, locale));
    const shop = de
      .activities({ ...state, day: { ...state.day, minute: 660 } }, 'shop')
      .filter(({ id }) => id.startsWith('furnish-'))
      .map(({ label }) => (locale === 'en' ? label.en : label.zhCN));
    state.flags.push(
      'furnished-reading-chair',
      'furnished-warm-curtains',
      'furnished-desk-lamp',
    );
    const names = deShell
      .endingMemories(state)
      .furnishings.map(({ name }) => (locale === 'en' ? name.en : name.zhCN));
    expect(names).toEqual(
      locale === 'en'
        ? ['Second-hand armchair', 'Thermal curtains', 'Brass desk lamp']
        : ['二手扶手椅', '保暖窗帘', '黄铜台灯'],
    );
    expect(shop).toHaveLength(names.length);
    names.forEach((name, i) => expect(shop[i]).toContain(name));
  },
);

test('every item, character and townsperson has existing art', () => {
  const art = (path: string) =>
    existsSync(new URL(`../public${path}`, import.meta.url));
  for (const item of de.items)
    expect(art(itemIcon(item.id)), item.id).toBe(true);
  for (const id of [
    ...de.characters.map((c) => c.id),
    ...de.npcs.map((n) => n.id),
  ]) {
    expect(deGameArt.cast[id], id).toBeDefined();
    for (const face of ['neutral', 'happy', 'worried'])
      expect(art(deShell.portraitPath(id, face)), id).toBe(true);
    expect(art(deShell.spritePath(id)), id).toBe(true);
  }
  expect(art(deShell.townBanner)).toBe(true);
  for (const sign of deGameArt.shopSigns)
    expect(art(deShell.signPath(sign))).toBe(true);
});

test('the town map has every place, schedule stop and garden plot', () => {
  const layer = (name: string) =>
    town.layers.find((l) => l.name === name)!.objects!;
  const places = new Set(layer('places').map((o) => o.name));
  const anchors = new Set(layer('anchors').map((o) => o.name));
  expect([...places].sort()).toEqual(de.places.map((p) => p.id).sort());
  for (const npc of de.npcs)
    for (const rule of npc.schedule)
      for (const { at } of rule.stops)
        if (at !== 'away')
          expect(places.has(at) || anchors.has(at), `${npc.id}: ${at}`).toBe(
            true,
          );
  expect(layer('plots')).toHaveLength(6);
  const [spawn] = layer('spawn');
  const home = layer('places').find((o) => o.name === 'home')!;
  expect([home.x / 16, home.y / 16 - 1]).toEqual([5, 10]);
  expect([spawn.x, spawn.y - 16]).toEqual([home.x, home.y]);
});
