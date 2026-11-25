import { existsSync } from 'node:fs';
import * as React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { afterEach, beforeAll, expect, test, vi } from 'vitest';
import type { Locale } from '@uk-immigration/engine';
import * as es from '@uk-immigration/game/es';
import { esGameArt } from '@uk-immigration/game/es/presentation';
import SpainPage from '../app/spain/page';
import { CountryAssessmentColumns } from '../components/result-view';
import { LocaleContext } from '../i18n/locale';
import { t, withCount, type TranslationKey } from '../i18n';
import { decodeDraft } from '../lib/share';
import { sitePagePaths, siteCountries } from '../lib/site-countries';
import { spainModule } from '../lib/spain-module';
import {
  esCountry,
  esShell,
  gameDraft,
  itemIcon,
} from '../app/spain/game/shell';
import { gameKey } from '../app/game-shell/game-ui';
import town from '../public/game/spain/town.json';

type State = ReturnType<typeof es.newGame>;
afterEach(() => vi.unstubAllGlobals());
beforeAll(async () => {
  for (const { id } of es.characters) await es.loadCharacter(id);
});

const render = (node: React.ReactNode, locale: Locale = 'zh-CN') =>
  renderToStaticMarkup(
    <LocaleContext value={{ locale, setLocale: () => {} }}>
      {node}
    </LocaleContext>,
  );
function settle(state: State) {
  while (state.pendingEvent)
    state = es.resolve(state, es.currentEvent(state)!.choices[0].id);
  return state;
}

test('Spain has a game page, entries and its own save and sound keys', () => {
  expect(siteCountries.find(({ id }) => id === 'es')?.hasGame).toBe(true);
  expect(sitePagePaths).toContain('/spain/game');
  expect(render(<SpainPage />)).toContain('href="/spain/game"');
  const storage = new Map<string, string>();
  vi.stubGlobal('localStorage', {
    getItem: (key: string) => storage.get(key) ?? null,
    setItem: (key: string, value: string) => storage.set(key, value),
  });
  const state = es.newGame('cook', 4, 'zh-CN');
  expect(esShell.gameStorage('cook', state).available).toBe(true);
  expect([...storage.keys()]).toEqual(['es-immigration-life-v3:cook']);
  expect(esShell.previewGameSave('cook').state).toEqual(state);
  expect(esShell.previewGameSave('exporter')).toEqual({
    state: undefined,
    available: true,
  });
  esCountry.sound.setMuted(false);
  expect(storage.get('es-immigration-life-muted')).toBe('false');
});

test('the ending link restores the same timeline on the Spain result page', () => {
  const state = settle(es.newGame('exporter', 4, 'en'));
  const href = esCountry.resultHref(state);
  expect(href.startsWith('/spain/result#s=')).toBe(true);
  const draft = decodeDraft(spainModule, href.split('#s=')[1], true)!;
  expect(draft).toEqual(gameDraft(state));
  expect(draft.completed).toBe(true);
  expect(draft.simulationDate).toBe(state.date);
  expect(draft.targets).toEqual(['L', 'N']);
  expect(draft.permits).toEqual(state.timeline.permits);
  const shown = spainModule.run(draft, 'en').columns[0].pathways;
  expect(
    shown.map(({ id, status, earliestDate }) => [id, status, earliestDate]),
  ).toEqual(
    state.result.columns[0].pathways.map(({ id, status, earliestDate }) => [
      id,
      status,
      earliestDate,
    ]),
  );
});

test.each(['zh-CN', 'en'] as const)(
  'the status bar, progress bars and assessment speak Spanish residence in %s',
  (locale) => {
    const state = es.newGame('exporter', 4, locale);
    const hud = render(<esShell.StatusBar state={state} />, locale);
    expect(hud).toContain('€11,000');
    expect(hud).toContain(t('game.spanish', locale));
    expect(hud).toContain(
      withCount(t('es.game.visa', locale), 'count', es.visaMonthsLeft(state)),
    );
    const bars = render(
      <esShell.ProgressBars state={state} onOpen={vi.fn()} />,
      locale,
    );
    expect(bars).toContain(t('es.game.ltColumn', locale));
    expect(bars).toContain(
      t('country.status.FUTURE', locale).replace('{date}', '2026-10-04'),
    );
    const office = settle(es.enter(settle(state), 'council'));
    let menu: React.ReactNode;
    function Probe() {
      menu = esShell.LocationMenu({
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
    expect(html).toContain('town-es.current-law-heading');
  },
);

test.each(['zh-CN', 'en'] as const)(
  'Spanish recipes keep their own cooking steps in %s',
  (locale) => {
    for (const recipe of es.recipes) {
      const shared = `game.prepare-${recipe.id}` as TranslationKey;
      const own = gameKey('es', shared);
      expect(own, recipe.id).toBe(`es.${shared}`);
      expect(t(own, locale), recipe.id).toBeTruthy();
    }
    const gazpacho = 'game.prepare-gazpacho' as TranslationKey;
    expect(t(gameKey('es', gazpacho), locale)).toBe(
      locale === 'en'
        ? 'Blend tomato and cucumber, add olive oil and chill'
        : '番茄黄瓜打碎，淋橄榄油冰镇',
    );
  },
);

test('every item, character and townsperson has existing art', () => {
  const art = (path: string) =>
    existsSync(new URL(`../public${path}`, import.meta.url));
  for (const item of es.items)
    expect(art(itemIcon(item.id)), item.id).toBe(true);
  expect(itemIcon('turron')).not.toContain('indoor/item');
  for (const id of [
    ...es.characters.map((c) => c.id),
    ...es.npcs.map((n) => n.id),
  ]) {
    expect(esGameArt.cast[id], id).toBeDefined();
    for (const face of ['neutral', 'happy', 'worried'])
      expect(art(esShell.portraitPath(id, face)), id).toBe(true);
    expect(art(esShell.spritePath(id)), id).toBe(true);
  }
  expect(art(esShell.townBanner)).toBe(true);
  for (const sign of esGameArt.shopSigns)
    expect(art(esShell.signPath(sign))).toBe(true);
});

test('the town map has every place, schedule stop and garden plot', () => {
  const layer = (name: string) =>
    town.layers.find((l) => l.name === name)!.objects!;
  const places = new Set(layer('places').map((o) => o.name));
  const anchors = new Set(layer('anchors').map((o) => o.name));
  expect([...places].sort()).toEqual(es.places.map((p) => p.id).sort());
  for (const npc of es.npcs)
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
