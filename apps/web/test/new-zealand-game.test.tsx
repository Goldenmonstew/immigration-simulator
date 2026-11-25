import { existsSync } from 'node:fs';
import * as React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { afterEach, beforeAll, expect, test, vi } from 'vitest';
import type { Locale } from '@uk-immigration/engine';
import * as nz from '@uk-immigration/game/nz';
import { nzGameArt } from '@uk-immigration/game/nz/presentation';
import { CountryAssessmentColumns } from '../components/result-view';
import { LocaleContext } from '../i18n/locale';
import { t, withCount, type TranslationKey } from '../i18n';
import { newZealandModule } from '../lib/new-zealand-module';
import { decodeDraft } from '../lib/share';
import { sitePagePaths, siteCountries } from '../lib/site-countries';
import {
  gameDraft,
  itemIcon,
  nzCountry,
  nzShell,
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

test('the ending link restores the same timeline on the New Zealand result page', () => {
  const state = settle(nz.newGame('partner', 4, 'en'));
  const href = nzCountry.resultHref(state);
  expect(href.startsWith('/new-zealand/result#s=')).toBe(true);
  const draft = decodeDraft(newZealandModule, href.split('#s=')[1], true)!;
  expect(draft.completed).toBe(true);
  expect(draft.goals).toEqual(['prv', 'citizenship']);
  expect(draft.simulationDate).toBe(state.date);
  expect(draft.answers.residentVisa).toEqual(state.timeline.residentVisa);
  const shown = newZealandModule.run(draft, 'en').columns[0].pathways;
  expect(shown.map(({ id, status }) => [id, status])).toEqual(
    state.result.columns[0].pathways.map(({ id, status }) => [id, status]),
  );
  expect(gameDraft(state).step).toBeGreaterThan(0);
});

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
    let columns: React.ReactElement | undefined;
    React.Children.forEach(menu, function find(node) {
      if (!React.isValidElement<{ children?: React.ReactNode }>(node)) return;
      if (node.type === CountryAssessmentColumns) columns = node;
      React.Children.forEach(node.props.children, find);
    });
    expect(columns).toBeDefined();
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
