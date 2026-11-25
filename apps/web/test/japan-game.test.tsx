import { existsSync } from 'node:fs';
import * as React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { afterEach, beforeAll, expect, test, vi } from 'vitest';
import type { CountryResult, Locale } from '@uk-immigration/engine';
import * as jp from '@uk-immigration/game/jp';
import { jpGameArt } from '@uk-immigration/game/jp/presentation';
import { CountryAssessmentColumns } from '../components/result-view';
import { LocaleContext } from '../i18n/locale';
import { t, withCount, type TranslationKey } from '../i18n';
import { japanModule } from '../lib/japan-module';
import { readPageResult } from '../lib/page-result';
import { sitePagePaths, siteCountries } from '../lib/site-countries';
import {
  gameDraft,
  itemIcon,
  jpCountry,
  jpShell,
} from '../app/japan/game/shell';
import { gameKey } from '../app/game-shell/game-ui';
import town from '../public/game/japan/town.json';

type State = ReturnType<typeof jp.newGame>;
afterEach(() => vi.unstubAllGlobals());
beforeAll(async () => {
  for (const { id } of jp.characters) await jp.loadCharacter(id);
});

const render = (node: React.ReactNode, locale: Locale = 'zh-CN') =>
  renderToStaticMarkup(
    <LocaleContext value={{ locale, setLocale: () => {} }}>
      {node}
    </LocaleContext>,
  );
function settle(state: State) {
  while (state.pendingEvent)
    state = jp.resolve(state, jp.currentEvent(state)!.choices[0].id);
  return state;
}

test('Japan has a game page, entries and its own save and sound keys', () => {
  expect(siteCountries.find(({ id }) => id === 'jp')?.hasGame).toBe(true);
  expect(sitePagePaths).toContain('/japan/game');
  const storage = new Map<string, string>();
  vi.stubGlobal('localStorage', {
    getItem: (key: string) => storage.get(key) ?? null,
    setItem: (key: string, value: string) => storage.set(key, value),
  });
  const state = jp.newGame('engineer', 4, 'zh-CN');
  expect(jpShell.gameStorage('engineer', state).available).toBe(true);
  expect([...storage.keys()]).toEqual(['jp-immigration-life-v3:engineer']);
  expect(jpShell.previewGameSave('engineer').state).toEqual(state);
  expect(jpShell.previewGameSave('spouse')).toEqual({
    state: undefined,
    available: true,
  });
  jpCountry.sound.setMuted(false);
  expect(storage.get('jp-immigration-life-muted')).toBe('false');
});

test.each(['engineer', 'spouse'])(
  'the ending link opens the same %s timeline on the Japan result page',
  (id) => {
    const storage = new Map<string, string>();
    vi.stubGlobal('localStorage', {
      getItem: (key: string) => storage.get(key) ?? null,
      setItem: (key: string, value: string) => storage.set(key, value),
      removeItem: (key: string) => storage.delete(key),
    });
    const opening = settle(jp.newGame(id, 7, 'zh-CN'));
    let station = settle(jp.tick(opening, 600 - opening.day.minute));
    station = settle(jp.enter(station, 'station'));
    const abroad = settle(jp.doActivity(station, 'travel-1'));
    expect(abroad.timeline.trips).toHaveLength(1);
    const view = (result: CountryResult) =>
      result.columns[0].pathways.map((pathway) => ({
        id: pathway.id,
        status: pathway.status,
        earliestDate: pathway.earliestDate,
        timeEarliestDate: pathway.timeEarliestDate,
        checks: pathway.checks.map((check) => [check.id, check.status]),
      }));
    for (const state of [opening, abroad]) {
      const href = jpCountry.resultHref(state);
      expect(href.startsWith('/japan/result#s=')).toBe(true);
      const page = readPageResult(
        japanModule,
        'zh-CN',
        href.split('#s=')[1],
        'result',
      );
      expect(page.correction).toBeUndefined();
      expect(page.draft).toEqual(gameDraft(state));
      expect(page.draft!.simulationDate).toBe(state.date);
      expect(view(page.result!)).toEqual(view(state.result));
    }
    expect(gameDraft(opening).step).toBe(5);
  },
);

test.each(['zh-CN', 'en'] as const)(
  'the status bar, progress bars and assessment speak Japanese residence in %s',
  (locale) => {
    const state = jp.newGame('engineer', 4, locale);
    const hud = render(<jpShell.StatusBar state={state} />, locale);
    expect(hud).toContain('¥1,800,000');
    expect(hud).toContain(t('game.japanese', locale));
    expect(hud).toContain(
      withCount(t('jp.game.visa', locale), 'count', jp.visaMonthsLeft(state)),
    );
    const bars = render(
      <jpShell.ProgressBars state={state} onOpen={vi.fn()} />,
      locale,
    );
    expect(bars).toContain(t('jp.game.prColumn', locale));
    expect(bars).toContain(
      t('country.status.FUTURE', locale).replace('{date}', '2034-04-01'),
    );
    const office = settle(jp.enter(settle(state), 'council'));
    let menu: React.ReactNode;
    function Probe() {
      menu = jpShell.LocationMenu({
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
    // Official source locators stay in Japanese; the game's own text does not.
    if (locale === 'en') expect(hud + bars).not.toMatch(/[\u3400-\u9fff]/);
    expect(html).toContain('town-jp.current-law-2026-11-heading');
  },
);

test.each(['zh-CN', 'en'] as const)(
  'Japanese recipes keep their own cooking steps in %s',
  (locale) => {
    for (const recipe of jp.recipes) {
      const shared = `game.prepare-${recipe.id}` as TranslationKey;
      const own = gameKey('jp', shared);
      expect(own, recipe.id).toBe(`jp.${shared}`);
      expect(t(own, locale), recipe.id).not.toBe(t(shared, locale));
    }
    // The UK salad with the same recipe ID keeps its own step.
    expect(t('game.prepare-salad', locale)).toBe(
      locale === 'en' ? 'Toss gently' : '轻轻拌匀',
    );
    expect(t(gameKey('jp', 'game.prepare-salad'), locale)).toBe(
      locale === 'en'
        ? 'Chop and toss with sesame dressing'
        : '切块，拌上芝麻酱',
    );
  },
);

test('every item, character and townsperson has existing art', () => {
  const art = (path: string) =>
    existsSync(new URL(`../public${path}`, import.meta.url));
  for (const item of jp.items)
    expect(art(itemIcon(item.id)), item.id).toBe(true);
  for (const id of [
    ...jp.characters.map((c) => c.id),
    ...jp.npcs.map((n) => n.id),
  ]) {
    expect(jpGameArt.cast[id], id).toBeDefined();
    for (const face of ['neutral', 'happy', 'worried'])
      expect(art(jpShell.portraitPath(id, face)), id).toBe(true);
    expect(art(jpShell.spritePath(id)), id).toBe(true);
  }
  expect(art(jpShell.townBanner)).toBe(true);
  for (const sign of jpGameArt.shopSigns)
    expect(art(jpShell.signPath(sign))).toBe(true);
});

test('the town map has every place, schedule stop and garden plot', () => {
  const layer = (name: string) =>
    town.layers.find((l) => l.name === name)!.objects!;
  const places = new Set(layer('places').map((o) => o.name));
  const anchors = new Set(layer('anchors').map((o) => o.name));
  expect([...places].sort()).toEqual(jp.places.map((p) => p.id).sort());
  for (const npc of jp.npcs)
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
