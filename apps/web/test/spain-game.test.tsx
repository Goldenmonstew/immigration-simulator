import { existsSync } from 'node:fs';
import * as React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { afterEach, beforeAll, expect, test, vi } from 'vitest';
import type { CountryResult, Locale } from '@uk-immigration/engine';
import * as es from '@uk-immigration/game/es';
import { esGameArt } from '@uk-immigration/game/es/presentation';
import SpainPage from '../app/spain/page';
import { CountryAssessmentColumns } from '../components/result-view';
import { LocaleContext } from '../i18n/locale';
import { t, withCount, type TranslationKey } from '../i18n';
import { pathwayTitle } from '../lib/country-module';
import { gapRules } from '../lib/gap-summary';
import { readPageResult } from '../lib/page-result';
import { sitePagePaths, siteCountries } from '../lib/site-countries';
import { activeSpainAnswers, spainSteps } from '../lib/spain-draft';
import { spainModule } from '../lib/spain-module';
import {
  esCountry,
  esShell,
  gameDraft,
  itemIcon,
  shownResult as esShown,
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

/** Walk to an open place at a given time, as the town map would. */
function visit(state: State, place: string, minute: number) {
  state = settle(state);
  if (state.day.minute < minute)
    state = settle(es.tick(state, minute - state.day.minute));
  return settle(es.enter(state, place));
}
/**
 * Move a saved game to a later quarter start, with the playable day on that
 * date, and re-run the assessment.
 */
function at(state: State, date: string) {
  const next = structuredClone(state);
  next.date = date;
  next.day.date = date;
  next.result = es.esRules.evaluate(next);
  return next;
}
function untilOver(state: State) {
  for (let i = 0; i < 8 && !es.isOver(state); i++)
    state = settle(es.sleep(settle(state)));
  return state;
}
const leave = (state: State) =>
  es.doActivity(visit(state, 'station', 900), 'leave');
function quarterLater(from: State) {
  let next = from;
  for (let i = 0; i < 12 && next.date === from.date; i++)
    next = settle(es.sleep(settle(next)));
  return next;
}

/** Each character's states worth opening: trips, mid-quarter events, endings. */
function endings(id: string): [string, State][] {
  const opening = settle(es.newGame(id, 7, 'zh-CN'));
  const abroad = settle(
    es.doActivity(visit(opening, 'station', 600), 'travel-1'),
  );
  const moved = settle(
    es.doActivity(visit(opening, 'home', 420), 'rent-brighter-home'),
  );
  const registered = es.doActivity(visit(moved, 'ward', 510), 'padron');
  expect(abroad.timeline.trips).toHaveLength(1);
  const day = moved.day.date;
  expect(moved.timeline.steps.moves).toEqual([{ movedOn: day }]);
  expect(registered.timeline.steps.moves).toEqual([
    { movedOn: day, registeredOn: day },
  ]);
  const ready = structuredClone(opening);
  ready.stats.spanish = 60;
  ready.stats.money = 5_000;
  let exams = visit(ready, 'bureau', 600);
  if (es.activities(exams, 'bureau').some(({ id }) => id === 'nat-papers'))
    exams = es.doActivity(exams, 'nat-papers');
  exams = es.doActivity(visit(exams, 'college', 700), 'ccse');
  exams = es.doActivity(exams, 'dele');
  expect(exams.timeline.steps).toMatchObject({ ccse: day, dele: day });
  // The exams count from the next quarter's assessment.
  const examsLater = quarterLater(exams);
  expect(gameDraft(exams).nationality.ccse).toEqual({ verifiedPass: false });
  expect(gameDraft(examsLater).nationality.ccse).toEqual({
    verifiedPass: true,
    issued: day,
  });
  // File on a later quarter's working morning, once the conditions are met.
  const later = at(id === 'cook' ? exams : opening, '2026-12-01');
  later.day.date = '2026-12-10';
  later.day.minute = 540;
  if (id === 'exporter') later.flags.push('cita-booked');
  const filed =
    id === 'cook'
      ? es.doActivity(visit(later, 'bureau', 600), 'naturalise')
      : es.doActivity(visit(later, 'visa', 600), 'settle');
  // The card runs out between the quarter's assessment date and its day.
  const lapsing = structuredClone(opening);
  lapsing.timeline.permits.at(-1)!.to = '2026-12-05';
  const midQuarter = at(lapsing, '2026-12-01');
  midQuarter.day.date = '2026-12-10';
  midQuarter.day.minute = 540;
  expect(esCountry.placeNote!(midQuarter, 'visa')?.zhCN).toContain(
    '居留卡已于 2026-12-05 到期',
  );
  expect(es.visaMonthsLeft(midQuarter)).toBe(0);
  const lapsed = structuredClone(opening);
  if (id === 'cook') es.currentPermit(lapsed).to = '2026-04-30';
  const overstayed = untilOver(
    id === 'cook' ? lapsed : at(lapsed, '2027-06-01'),
  );
  return [
    ['opening', opening],
    ['abroad', abroad],
    ['moved, left', leave(moved)],
    ['moved, next quarter, left', leave(quarterLater(moved))],
    ['registered, left', leave(registered)],
    ['exams, left', leave(exams)],
    ['exams, next quarter, left', leave(examsLater)],
    ['filed', filed],
    ['card lapsed mid-quarter, left', leave(midQuarter)],
    ['overstayed', overstayed],
  ];
}

test.each(['cook', 'exporter'])(
  'the ending link opens the same %s timeline on the Spain result page',
  (id) => {
    const storage = new Map<string, string>();
    vi.stubGlobal('localStorage', {
      getItem: (key: string) => storage.get(key) ?? null,
      setItem: (key: string, value: string) => storage.set(key, value),
      removeItem: (key: string) => storage.delete(key),
    });
    const view = (result: CountryResult) =>
      result.columns[0].pathways.map((pathway) => ({
        id: pathway.id,
        status: pathway.status,
        earliestDate: pathway.earliestDate,
        pathwayCompletionDate: pathway.pathwayCompletionDate,
        summary: pathway.summary,
        checks: pathway.checks.map((check) => [
          check.id,
          check.status,
          check.kind,
        ]),
      }));
    const zh = (key: TranslationKey) => t(key, 'zh-CN');
    const states = endings(id);
    expect(states.map(([, state]) => state.ending)).toEqual([
      undefined,
      undefined,
      'left',
      'left',
      'left',
      'left',
      'left',
      'settled',
      'left',
      'overstayed',
    ]);
    for (const [name, state] of states) {
      const href = esCountry.resultHref(state);
      expect(href.startsWith('/spain/result#s='), name).toBe(true);
      const page = readPageResult(
        spainModule,
        'zh-CN',
        href.split('#s=')[1],
        'result',
      );
      expect(page.correction, name).toBeUndefined();
      const draft = gameDraft(state);
      expect(page.draft, name).toEqual(draft);
      // Only the answers the questionnaire asks for the chosen routes.
      expect(activeSpainAnswers(draft), name).toEqual(draft);
      expect(draft.simulationDate, name).toBe(
        ['filed', 'card lapsed mid-quarter, left'].includes(name)
          ? '2026-12-10'
          : state.date,
      );
      // Nothing that happened after the assessment date is in the draft.
      for (const date of [
        draft.nationality.ccse?.issued,
        ...(draft.trips ?? []).map(({ returned }) => returned),
      ])
        if (date) expect(date <= draft.simulationDate, name).toBe(true);
      expect(draft.step, name).toBe(spainSteps(draft).at(-1)!.step);
      // The game shows the assessment as the result page does.
      expect(view(esShown(state)), name).toEqual(view(page.result!));
      for (const column of ['lt', 'nat'] as const) {
        const pathway = es.pathwayOf(page.result!, column)!;
        const bar = es.progress(state)[column];
        expect(bar.outcome, `${name} ${column}`).toBe(pathway.status);
        expect(esCountry.outcomeLabel(bar, zh), `${name} ${column}`).toBe(
          pathwayTitle(pathway, zh),
        );
        const gaps = [...new Set(gapRules(pathway).map(({ title }) => title))];
        expect(
          esCountry.missingRules(state, column) ?? [],
          `${name} ${column} gaps`,
        ).toEqual(gaps);
      }
    }
    const [, overstayed] = states.at(-1)!;
    for (const pathway of readPageResult(
      spainModule,
      'zh-CN',
      esCountry.resultHref(overstayed).split('#s=')[1],
      'result',
    ).result!.columns[0].pathways)
      expect(pathway.status).toBe('NOT_MET');
  },
  // Plays and assesses many quarters for each character.
  60_000,
);

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

test.each(['zh-CN', 'en'] as const)(
  'the kitchen hint and ending furniture use Spanish wording in %s',
  (locale) => {
    const hint = t(gameKey('es', 'game.kitchenNoIngredients'), locale);
    expect(hint).not.toBe(t('game.kitchenNoIngredients', locale));
    expect(hint).not.toMatch(/池塘|河鲈|pond|perch/);
    const state = settle(es.newGame('cook', 4, locale));
    const shop = es
      .activities({ ...state, day: { ...state.day, minute: 600 } }, 'shop')
      .filter(({ id }) => id.startsWith('furnish-'))
      .map(({ label }) => (locale === 'en' ? label.en : label.zhCN));
    state.flags.push(
      'furnished-reading-chair',
      'furnished-warm-curtains',
      'furnished-desk-lamp',
    );
    const names = esShell
      .endingMemories(state)
      .furnishings.map(({ name }) => (locale === 'en' ? name.en : name.zhCN));
    expect(names).toEqual(
      locale === 'en'
        ? ['Wicker rocking chair', 'Wooden shutter blinds', 'Desk lamp']
        : ['藤编摇椅', '木百叶遮阳帘', '台灯'],
    );
    expect(shop).toHaveLength(names.length);
    names.forEach((name, i) => expect(shop[i]).toContain(name));
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
