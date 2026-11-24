import { existsSync } from 'node:fs';
import * as React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { afterEach, beforeAll, expect, test, vi } from 'vitest';
import type { Locale } from '@uk-immigration/engine';
import * as au from '@uk-immigration/game/au';
import { auGameArt } from '@uk-immigration/game/au/presentation';
import { CountryAssessmentColumns } from '../components/result-view';
import { LocaleContext } from '../i18n/locale';
import { t, withCount } from '../i18n';
import { australiaModule } from '../lib/australia-module';
import { decodeDraft } from '../lib/share';
import { sitePagePaths, siteCountries } from '../lib/site-countries';
import {
  auCountry,
  auShell,
  gameDraft,
  itemIcon,
} from '../app/australia/game/shell';
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

test.each(['nurse', 'graduate'] as const)(
  'the ending link restores the %s timeline on the Australia result page',
  (id) => {
    const state = settle(au.newGame(id, 4, 'en'));
    const href = auCountry.resultHref(state);
    expect(href.startsWith('/australia/result#s=')).toBe(true);
    const draft = decodeDraft(australiaModule, href.split('#s=')[1], true)!;
    expect(draft.completed).toBe(true);
    expect(draft.simulationDate).toBe(state.date);
    expect(draft.pathway).toBe(state.timeline.pathway);
    expect(draft.visas).toEqual(state.timeline.visas);
    const shown = australiaModule.run(draft, 'en').columns[0].pathways;
    expect(
      shown.map(({ id, status, checks }) => [
        id,
        status,
        checks.map((check) => [check.id, check.status]),
      ]),
    ).toEqual(
      state.result.columns[0].pathways.map(({ id, status, checks }) => [
        id,
        status,
        checks.map((check) => [check.id, check.status]),
      ]),
    );
    expect(gameDraft(state).step).toBe(6);
  },
);

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
  },
);

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
