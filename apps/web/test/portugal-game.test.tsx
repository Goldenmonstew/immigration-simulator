import { existsSync } from 'node:fs';
import * as React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { afterEach, beforeAll, expect, test, vi } from 'vitest';
import type { CountryResult, Locale } from '@uk-immigration/engine';
import * as pt from '@uk-immigration/game/pt';
import { ptGameArt } from '@uk-immigration/game/pt/presentation';
import { LocaleContext } from '../i18n/locale';
import { t, withCount, type TranslationKey } from '../i18n';
import { portugalModule } from '../lib/portugal-module';
import { readPageResult } from '../lib/page-result';
import { sitePagePaths, siteCountries } from '../lib/site-countries';
import {
  PortugalAssessment,
  gameDraft,
  itemIcon,
  ptCountry,
  ptShell,
} from '../app/portugal/game/shell';
import { gameKey } from '../app/game-shell/game-ui';
import town from '../public/game/portugal/town.json';

type State = ReturnType<typeof pt.newGame>;
afterEach(() => vi.unstubAllGlobals());
beforeAll(async () => {
  for (const { id } of pt.characters) await pt.loadCharacter(id);
});

const render = (node: React.ReactNode, locale: Locale = 'zh-CN') =>
  renderToStaticMarkup(
    <LocaleContext value={{ locale, setLocale: () => {} }}>
      {node}
    </LocaleContext>,
  );
function settle(state: State) {
  while (state.pendingEvent)
    state = pt.resolve(state, pt.currentEvent(state)!.choices[0].id);
  return state;
}
const visit = (state: State, place: string, minute: number) => {
  state = settle(state);
  if (state.day.minute < minute)
    state = settle(pt.tick(state, minute - state.day.minute));
  return settle(pt.enter(state, place));
};
const on = (state: State, date: string) => {
  state.date = date;
  state.result = pt.ptRules.evaluate(state);
  return state;
};
const view = (result: CountryResult) =>
  result.columns[0].pathways.map((pathway) => ({
    id: pathway.id,
    status: pathway.status,
    earliestDate: pathway.earliestDate,
    checks: pathway.checks.map((check) => [check.id, check.status]),
  }));

test('Portugal has a game page, entries and its own save and sound keys', () => {
  expect(siteCountries.find(({ id }) => id === 'pt')?.hasGame).toBe(true);
  expect(sitePagePaths).toContain('/portugal/game');
  const storage = new Map<string, string>();
  vi.stubGlobal('localStorage', {
    getItem: (key: string) => storage.get(key) ?? null,
    setItem: (key: string, value: string) => storage.set(key, value),
  });
  const state = pt.newGame('worker', 4, 'zh-CN');
  expect(ptShell.gameStorage('worker', state).available).toBe(true);
  expect([...storage.keys()]).toEqual(['pt-immigration-life-v3:worker']);
  expect(ptShell.previewGameSave('worker').state).toEqual(state);
  expect(ptShell.previewGameSave('partner')).toEqual({
    state: undefined,
    available: true,
  });
  ptCountry.sound.setMuted(false);
  expect(storage.get('pt-immigration-life-muted')).toBe('false');
});

test.each(['worker', 'partner'])(
  'the ending link opens the same %s timeline on the Portugal result page',
  (id) => {
    vi.stubGlobal('localStorage', {
      getItem: () => null,
      setItem: () => {},
      removeItem: () => {},
    });
    const opening = settle(pt.newGame(id, 7, 'zh-CN'));
    const abroad = settle(
      pt.doActivity(visit(opening, 'station', 600), 'travel-1'),
    );
    expect(abroad.timeline.trips).toHaveLength(1);
    const left = pt.doActivity(visit(abroad, 'station', 600), 'leave');
    expect(left.ending).toBe('left');
    // The application each character can make, with its papers in hand.
    const ready = on(structuredClone(opening), '2027-03-01');
    ready.timeline.residence!.language = { kind: 'ciple' };
    ready.timeline.residence!.criminalRecordAvailable = true;
    ready.result = pt.ptRules.evaluate(ready);
    const applied =
      id === 'worker'
        ? pt.doActivity(visit(ready, 'visa', 600), 'settle')
        : pt.doActivity(
            pt.doActivity(visit(ready, 'bureau', 600), 'declaration-papers'),
            'declare',
          );
    expect(applied.ending).toBe('settled');
    for (const state of [opening, abroad, left, applied]) {
      const href = ptCountry.resultHref(state);
      expect(href.startsWith('/portugal/result#s=')).toBe(true);
      const page = readPageResult(
        portugalModule,
        'zh-CN',
        href.split('#s=')[1],
        'result',
      );
      expect(page.correction).toBeUndefined();
      expect(page.draft).toEqual(gameDraft(state));
      expect(page.draft!.simulationDate).toBe(state.date);
      expect(view(page.result!)).toEqual(view(state.result));
    }
    expect(gameDraft(opening).step).toBe(id === 'worker' ? 3 : 8);
  },
);

test.each(['zh-CN', 'en'] as const)(
  'the status bar, progress bars and assessment speak Portuguese residence in %s',
  (locale) => {
    const state = pt.newGame('worker', 4, locale);
    const hud = render(<ptShell.StatusBar state={state} />, locale);
    expect(hud).toContain('€9,000');
    expect(hud).toContain(t('game.portuguese', locale));
    expect(hud).toContain(
      withCount(t('pt.game.visa', locale), 'count', pt.visaMonthsLeft(state)),
    );
    const bars = render(
      <ptShell.ProgressBars state={state} onOpen={vi.fn()} />,
      locale,
    );
    expect(bars).toContain(t('pt.game.prColumn', locale));
    expect(bars).toContain(t('pt.game.natColumn', locale));
    // Only the time requirement has a date; the bar does not claim the rest.
    expect(bars).toContain(
      t('pt.game.timeFuture', locale).replace('{date}', '2026-09-21'),
    );
    expect(bars).not.toContain(
      t('country.status.FUTURE', locale).replace('{date}', '2026-09-21'),
    );
    expect(bars).toContain(t('country.status.NOT_MET', locale));
    const office = settle(pt.enter(settle(state), 'council'));
    let menu: React.ReactNode;
    function Probe() {
      menu = ptShell.LocationMenu({
        state: { ...office, day: { ...office.day, minute: 600 } },
        location: 'council',
        onChange: vi.fn(),
      });
      return menu;
    }
    const html = render(<Probe />, locale);
    let assessment: React.ReactElement | undefined;
    React.Children.forEach(menu, function find(node) {
      if (!React.isValidElement<{ children?: React.ReactNode }>(node)) return;
      if (node.type === PortugalAssessment) assessment = node;
      React.Children.forEach(node.props.children, find);
    });
    expect(assessment).toBeDefined();
    expect(html).toContain('town-pt.current-law-heading');
    // The game shows the result page's wording, not the engine's fallback.
    expect(html).not.toContain(
      locale === 'en' ? 'The evidence satisfies' : '已满足「',
    );
    if (locale === 'en') expect(hud + bars).not.toMatch(/[㐀-鿿]/);
  },
);

test.each(['zh-CN', 'en'] as const)(
  'Portuguese recipes keep their own cooking steps in %s',
  (locale) => {
    for (const recipe of pt.recipes) {
      const shared = `game.prepare-${recipe.id}` as TranslationKey;
      const own = gameKey('pt', shared);
      expect(own, recipe.id).toBe(`pt.${shared}`);
      expect(t(own, locale), recipe.id).not.toBe(t(shared, locale));
    }
  },
);

test.each(['zh-CN', 'en'] as const)(
  'the kitchen hint, the AIMA note and ending furniture use Portuguese wording in %s',
  (locale) => {
    const hint = t(gameKey('pt', 'game.kitchenNoIngredients'), locale);
    expect(hint).not.toBe(t('game.kitchenNoIngredients', locale));
    expect(hint).not.toMatch(/池塘|河鲈|pond|perch/);
    const state = settle(pt.newGame('worker', 4, locale));
    expect(ptCountry.placeNote?.(state, 'visa')).toEqual(pt.cardNote);
    const shop = pt
      .activities({ ...state, day: { ...state.day, minute: 600 } }, 'shop')
      .filter(({ id }) => id.startsWith('furnish-'))
      .map(({ label }) => (locale === 'en' ? label.en : label.zhCN));
    state.flags.push(
      'furnished-reading-chair',
      'furnished-warm-curtains',
      'furnished-desk-lamp',
    );
    const names = ptShell
      .endingMemories(state)
      .furnishings.map(({ name }) => (locale === 'en' ? name.en : name.zhCN));
    expect(names).toEqual(
      locale === 'en'
        ? ['Wicker armchair', 'Linen curtains', 'Ceramic lamp']
        : ['藤编扶手椅', '亚麻窗帘', '陶瓷台灯'],
    );
    expect(shop).toHaveLength(names.length);
    names.forEach((name, i) => expect(shop[i]).toContain(name));
  },
);

test('every item, character and townsperson has existing art', () => {
  const art = (path: string) =>
    existsSync(new URL(`../public${path}`, import.meta.url));
  for (const item of pt.items)
    expect(art(itemIcon(item.id)), item.id).toBe(true);
  for (const id of [
    ...pt.characters.map((c) => c.id),
    ...pt.npcs.map((n) => n.id),
  ]) {
    expect(ptGameArt.cast[id], id).toBeDefined();
    for (const face of ['neutral', 'happy', 'worried'])
      expect(art(ptShell.portraitPath(id, face)), id).toBe(true);
    expect(art(ptShell.spritePath(id)), id).toBe(true);
  }
  expect(art(ptShell.townBanner)).toBe(true);
  for (const sign of ptGameArt.shopSigns)
    expect(art(ptShell.signPath(sign))).toBe(true);
});

test('the town map has every place, schedule stop and garden plot', () => {
  const layer = (name: string) =>
    town.layers.find((l) => l.name === name)!.objects!;
  const places = new Set(layer('places').map((o) => o.name));
  const anchors = new Set(layer('anchors').map((o) => o.name));
  expect([...places].sort()).toEqual(pt.places.map((p) => p.id).sort());
  for (const npc of pt.npcs)
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
  expect([home.x / 16, home.y / 16 - 1]).toEqual([5, 10]);
});
