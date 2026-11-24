import { existsSync } from 'node:fs';
import * as React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { afterEach, beforeAll, expect, test, vi } from 'vitest';
import type { Locale } from '@uk-immigration/engine';
import * as us from '@uk-immigration/game/us';
import { usGameArt } from '@uk-immigration/game/us/presentation';
import { CountryAssessmentColumns } from '../components/result-view';
import { LocaleContext } from '../i18n/locale';
import { t, withCount } from '../i18n';
import { decodeDraft } from '../lib/share';
import { sitePagePaths, siteCountries } from '../lib/site-countries';
import { unitedStatesModule } from '../lib/united-states-module';
import {
  gameDraft,
  itemIcon,
  usCountry,
  usShell,
} from '../app/united-states/game/shell';
import town from '../public/game/united-states/town.json';

type State = ReturnType<typeof us.newGame>;
afterEach(() => vi.unstubAllGlobals());
beforeAll(async () => {
  for (const { id } of us.characters) await us.loadCharacter(id);
});

const render = (node: React.ReactNode, locale: Locale = 'zh-CN') =>
  renderToStaticMarkup(
    <LocaleContext value={{ locale, setLocale: () => {} }}>
      {node}
    </LocaleContext>,
  );
function settle(state: State) {
  while (state.pendingEvent)
    state = us.resolve(state, us.currentEvent(state)!.choices[0].id);
  return state;
}

test('the United States has a game page, entries and its own save and sound keys', () => {
  expect(siteCountries.find(({ id }) => id === 'us')?.hasGame).toBe(true);
  expect(sitePagePaths).toContain('/united-states/game');
  const storage = new Map<string, string>();
  vi.stubGlobal('localStorage', {
    getItem: (key: string) => storage.get(key) ?? null,
    setItem: (key: string, value: string) => storage.set(key, value),
  });
  const state = us.newGame('engineer', 4, 'zh-CN');
  expect(usShell.gameStorage('engineer', state).available).toBe(true);
  expect([...storage.keys()]).toEqual(['us-immigration-life-v3:engineer']);
  expect(usShell.previewGameSave('engineer').state).toEqual(state);
  expect(usShell.previewGameSave('spouse')).toEqual({
    state: undefined,
    available: true,
  });
  usCountry.sound.setMuted(false);
  expect(storage.get('us-immigration-life-muted')).toBe('false');
});

test.each(['engineer', 'spouse'])(
  'the ending link restores the %s’s citizenship timeline on the US result page',
  (id) => {
    const state = settle(us.newGame(id, 4, 'en'));
    const href = usCountry.resultHref(state);
    expect(href.startsWith('/united-states/result#s=')).toBe(true);
    const draft = decodeDraft(unitedStatesModule, href.split('#s=')[1], true)!;
    expect(draft.completed).toBe(true);
    // The quarter is assessed on its first USCIS business day.
    expect(draft.simulationDate).toBe('2026-03-02');
    expect(draft.pathway).toBe(us.citizenshipPathway(state.timeline));
    expect(draft.permanentResident).toBe(state.timeline.permanentResident);
    const shown = unitedStatesModule.run(draft, 'en').columns[0].pathways;
    const played = us.pathwayOf(state.result, 'cit')!;
    expect(
      shown.map(({ id, status, earliestDate }) => [id, status, earliestDate]),
    ).toEqual([[played.id, played.status, played.earliestDate]]);
    expect(gameDraft(state).step).toBe(13);
  },
);

test('a lapsed conditional card links to the I-751 assessment', () => {
  const state = settle(us.newGame('spouse', 4, 'en'));
  state.ending = 'overstayed';
  const draft = gameDraft(state);
  expect(draft.pathway).toBe('US-CONDITIONS');
  expect(
    decodeDraft(
      unitedStatesModule,
      usCountry.resultHref(state).split('#s=')[1],
      true,
    ),
  ).toBeDefined();
});

test.each(['zh-CN', 'en'] as const)(
  'the status bar, progress bars and assessment speak US green cards in %s',
  (locale) => {
    const state = us.newGame('engineer', 4, locale);
    const hud = render(<usShell.StatusBar state={state} />, locale);
    expect(hud).toContain('$14,000');
    expect(hud).toContain(t('us.game.english', locale));
    expect(hud).toContain(
      withCount(t('us.game.visa', locale), 'count', us.visaMonthsLeft(state)),
    );
    const bars = render(
      <usShell.ProgressBars state={state} onOpen={vi.fn()} />,
      locale,
    );
    expect(bars).toContain(t('us.game.gcColumn', locale));
    expect(bars).toContain(t('us.game.citColumn', locale));
    expect(bars).toContain(
      t('country.status.FUTURE', locale).replace('{date}', '2028-03-17'),
    );
    const clinic = settle(us.enter(settle(state), 'council'));
    let menu: React.ReactNode;
    function Probe() {
      menu = usShell.LocationMenu({
        state: { ...clinic, day: { ...clinic.day, minute: 600 } },
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
    expect(html).toContain('town-us.current-law-2026-11-heading');
  },
);

test('the Federal Building says when the next filing opens', () => {
  const spouse = settle(us.newGame('spouse', 4, 'en'));
  expect(usCountry.placeNote?.(spouse, 'visa')?.en).toBe(
    'The I-751 can be filed from 2027-06-17.',
  );
  const engineer = settle(us.newGame('engineer', 4, 'zh-CN'));
  expect(usCountry.placeNote?.(engineer, 'visa')?.zhCN).toBe(
    'N-400 最早 2028-03-17 可以递交。',
  );
  expect(usCountry.endingActionText?.(engineer, 'oath')).toEqual({
    label: 'us.game.oath',
    confirm: 'us.game.oathConfirm',
  });
});

test('every item, character and townsperson has existing art', () => {
  const art = (path: string) =>
    existsSync(new URL(`../public${path}`, import.meta.url));
  for (const item of us.items)
    expect(art(itemIcon(item.id)), item.id).toBe(true);
  for (const id of [
    ...us.characters.map((c) => c.id),
    ...us.npcs.map((n) => n.id),
  ]) {
    expect(usGameArt.cast[id], id).toBeDefined();
    for (const face of ['neutral', 'happy', 'worried'])
      expect(art(usShell.portraitPath(id, face)), id).toBe(true);
    expect(art(usShell.spritePath(id)), id).toBe(true);
  }
  expect(art(usShell.townBanner)).toBe(true);
  for (const sign of usGameArt.shopSigns)
    expect(art(usShell.signPath(sign))).toBe(true);
  for (const recipe of us.recipes)
    expect(t(`game.prepare-${recipe.id}` as never, 'en')).not.toMatch(
      /^game\./,
    );
});

test('the town map has every place, schedule stop and garden plot', () => {
  const layer = (name: string) =>
    town.layers.find((l) => l.name === name)!.objects!;
  const places = new Set(layer('places').map((o) => o.name));
  const anchors = new Set(layer('anchors').map((o) => o.name));
  expect([...places].sort()).toEqual(us.places.map((p) => p.id).sort());
  for (const npc of us.npcs)
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
