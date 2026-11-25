import { existsSync } from 'node:fs';
import * as React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { afterEach, beforeAll, expect, test, vi } from 'vitest';
import type {
  CountryResult,
  Locale,
  UsFullResult,
} from '@uk-immigration/engine';
import * as us from '@uk-immigration/game/us';
import { usGameArt } from '@uk-immigration/game/us/presentation';
import { CountryAssessmentColumns } from '../components/result-view';
import { LocaleContext } from '../i18n/locale';
import { t, withCount, type TranslationKey } from '../i18n';
import { readPageResult } from '../lib/page-result';
import { encodeDraft } from '../lib/share';
import { sitePagePaths, siteCountries } from '../lib/site-countries';
import { unitedStatesSteps, type UsDraft } from '../lib/united-states-draft';
import {
  pathwayOutcome,
  unitedStatesModule,
} from '../lib/united-states-module';
import {
  gameDraft,
  itemIcon,
  shownResult,
  usCountry,
  usShell,
} from '../app/united-states/game/shell';
import { gameKey } from '../app/game-shell/game-ui';
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

/** Walk to an open place at a given time, as the town map would. */
function visit(state: State, place: string, minute: number) {
  state = settle(state);
  if (state.day.minute < minute)
    state = settle(us.tick(state, minute - state.day.minute));
  return settle(us.enter(state, place));
}
function quarterLater(from: State) {
  let next = from;
  for (let i = 0; i < 12 && next.date === from.date && !us.isOver(next); i++)
    next = settle(us.sleep(next));
  return next;
}
function playTo(state: State, date: string) {
  while (state.date < date && !us.isOver(state)) state = quarterLater(state);
  return settle(state);
}
const leave = (state: State) =>
  us.doActivity(visit(state, 'station', 900), 'leave');
const report = (state: State) =>
  settle(us.doActivity(visit(state, 'home', 500), 'address-report'));
/** What the result page and the game show for one pathway. */
const view = (result: CountryResult, id: string) =>
  (result as UsFullResult).columns[0].pathways
    .filter((pathway) => pathway.id === id)
    .map((pathway) => ({
      id: pathway.id,
      status: pathway.status,
      earliestDate: pathway.earliestDate,
      approvalStatus: pathway.approvalStatus,
      approvalEarliestDate: pathway.approvalEarliestDate,
      summary: pathway.summary,
      checks: pathway.checks.map((check) => [
        check.id,
        check.status,
        check.kind,
      ]),
    }));

test.each(['engineer', 'spouse'])(
  'the ending link opens the same %s timeline on the US result page',
  (id) => {
    vi.stubGlobal('localStorage', {
      getItem: () => null,
      setItem: () => {},
      removeItem: () => {},
    });
    const opening = settle(us.newGame(id, 7, 'zh-CN'));
    const abroad = settle(
      us.doActivity(visit(opening, 'station', 600), 'travel-1'),
    );
    expect(abroad.timeline.trips.length).toBeGreaterThan(
      opening.timeline.trips.length,
    );
    // Enough savings for the deposit, so both characters can move.
    const saved = { ...opening, stats: { ...opening.stats, money: 20_000 } };
    const moved = settle(
      us.doActivity(visit(saved, 'home', 480), 'rent-brighter-home'),
    );
    // Reported a quarter late, then left in that same quarter.
    const late = report(quarterLater(moved));
    expect(late.date).not.toBe(moved.date);
    const states = [
      opening,
      abroad,
      leave(moved),
      leave(report(moved)),
      leave(late),
    ];
    if (id === 'spouse') {
      const lapsed = playTo(opening, '2027-12-01');
      expect(lapsed.ending).toBe('overstayed');
      states.push(lapsed);
      // The I-751 goes in on the first workday inside its window.
      let state = playTo(opening, '2027-06-01');
      while (!us.activities(visit(state, 'visa', 600), 'visa').length)
        state = quarterLater(state);
      state = us.doActivity(visit(state, 'visa', 600), 'extend');
      states.push(leave(state));
      state = quarterLater(state);
      states.push(leave(state));
      state = playTo(state, '2028-09-01');
      state = us.doActivity(visit(state, 'visa', 600), 'n400');
      state = playTo(state, '2028-12-01');
      state.stats.english = 64;
      state = settle(us.doActivity(visit(state, 'visa', 600), 'interview'));
      state = playTo(state, '2029-03-01');
      const sworn = us.doActivity(visit(state, 'visa', 600), 'oath');
      expect(sworn.ending).toBe('settled');
      states.push(sworn);
    } else {
      let state = playTo(opening, '2028-06-01');
      state = us.doActivity(visit(state, 'visa', 600), 'n400');
      states.push(leave(state));
      state = playTo(state, '2028-09-01');
      state.stats.english = 64;
      state = settle(us.doActivity(visit(state, 'visa', 600), 'interview'));
      states.push(leave(state));
      state = playTo(state, '2028-12-01');
      const sworn = us.doActivity(visit(state, 'visa', 600), 'oath');
      expect(sworn.ending).toBe('settled');
      states.push(sworn);
      // Without naturalizing, the I-90 goes in six months before the card ends.
      let renewing = playTo(opening, '2033-03-01');
      renewing = us.doActivity(visit(renewing, 'visa', 600), 'extend');
      states.push(leave(renewing));
      renewing = quarterLater(renewing);
      states.push(leave(renewing));
      // The green card column, read back as its own questionnaire.
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { locale, ...request } = us.usRequest(
        renewing.timeline,
        'US-TRAVEL',
        us.filingDay(renewing.date),
        'zh-CN',
      );
      const travel = readPageResult(
        unitedStatesModule,
        'zh-CN',
        encodeDraft(unitedStatesModule, {
          ...request,
          version: 1,
          step: 13,
          completed: true,
        } as UsDraft),
        'result',
      );
      expect(travel.correction).toBeUndefined();
      expect(travel.draft!.travel).toMatchObject({
        replacementFiledOn: renewing.timeline.filed.i90,
        replacementReason: 'renewal',
        cardExpiresOn: '2033-06-15',
      });
      expect(view(shownResult(renewing), 'US-TRAVEL')).toEqual(
        view(travel.result!, 'US-TRAVEL'),
      );
    }
    for (const state of states) {
      const href = usCountry.resultHref(state);
      expect(href.startsWith('/united-states/result#s=')).toBe(true);
      const page = readPageResult(
        unitedStatesModule,
        'zh-CN',
        href.split('#s=')[1],
        'result',
      );
      expect(page.correction).toBeUndefined();
      const draft = page.draft!;
      expect(draft).toEqual(gameDraft(state));
      expect(draft.simulationDate).toBe(us.filingDay(state.date));
      expect(draft.step).toBe(unitedStatesSteps(draft).at(-1)!.step);
      // The N-400 and the interview enter on their own day, never earlier.
      const { filed } = state.timeline;
      expect(draft.fees?.filingOn).toBe(
        filed.n400 && filed.n400 <= draft.simulationDate
          ? filed.n400
          : undefined,
      );
      expect(draft.naturalization?.interviewOn).toBe(
        filed.interview && filed.interview <= draft.simulationDate
          ? filed.interview
          : undefined,
      );
      // A mailed I-751 is pending only from its own day.
      if (id === 'spouse' && draft.pathway === 'US-SPOUSE')
        expect(draft.naturalization?.conditionalStatusResolved).toBe(
          filed.i751 && filed.i751 <= draft.simulationDate ? false : undefined,
        );
      const column = state.ending === 'overstayed' ? 'gc' : ('cit' as const);
      expect(draft.pathway).toBe(us.pathwayOf(state.result, column)!.id);
      // The game's assessment, progress bar and detail show the same result.
      const shown = view(page.result!, draft.pathway!);
      expect(shown).toHaveLength(1);
      expect(view(shownResult(state), draft.pathway!)).toEqual(shown);
      expect(us.progress(state)[column].outcome).toBe(shown[0].status);
      if (state.ending === 'overstayed')
        expect([shown[0].status, shown[0].approvalStatus]).toEqual([
          'NOT_MET',
          'NOT_MET',
        ]);
      // The spouse takes the oath while USCIS has yet to decide the I-751.
      if (state.ending === 'settled')
        expect([shown[0].status, shown[0].approvalStatus]).toEqual(
          id === 'spouse' ? ['UNKNOWN', 'UNKNOWN'] : ['MET', 'MET'],
        );
    }
  },
);

test('the progress bars rank the approval stage as the result page does', () => {
  const statuses = [
    'MET',
    'FUTURE',
    'NOT_MET',
    'UNKNOWN',
    'NOT_APPLICABLE',
  ] as const;
  for (const filing of statuses)
    for (const approval of [undefined, ...statuses])
      expect(us.stageOutcome(filing, approval), `${filing} ${approval}`).toBe(
        pathwayOutcome(filing, approval),
      );
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
    // As on the result page: the tests are still ahead, so approval is open,
    // while the bar fills toward the 2028-03-17 filing date.
    expect(us.progress(state).cit).toEqual({
      outcome: 'UNKNOWN',
      earliestDate: '2028-03-17',
      percent: 57,
    });
    expect(bars).toContain(t('country.status.UNKNOWN', locale));
    expect(bars).toContain('57%');
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

test('a mailed I-751 shows as pending, without reminders or warnings', () => {
  let state = settle(us.newGame('spouse', 7, 'zh-CN'));
  while (state.date < '2027-06-01') state = quarterLater(state);
  while (!us.activities(visit(state, 'visa', 600), 'visa').length)
    state = quarterLater(state);
  const filed = us.doActivity(visit(state, 'visa', 600), 'extend');
  // Past the card's printed date the petition is still pending.
  const later = playTo(filed, '2028-03-01');
  expect(later.timeline.travel.cardExpiresOn < later.date).toBe(true);
  for (const pending of [filed, later]) {
    expect(usCountry.visaStatus(pending)).toMatchObject({ pending: true });
    expect(render(<usShell.StatusBar state={pending} />)).toContain(
      t('us.game.visaPending', 'zh-CN'),
    );
    expect(usShell.needsVisaReminder(pending)).toBe(false);
    expect(usShell.visaExpiresThisSeason(pending)).toBe(false);
  }
});

test.each(['zh-CN', 'en'] as const)(
  'the green card reminder names no card length in %s',
  (locale) => {
    expect(t('us.game.visaReminder', locale)).not.toMatch(/十年|ten-year/);
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
  // The interview joins the assessment next quarter, and the oath with it.
  const interviewed = structuredClone(engineer);
  interviewed.flags.push('n400-filed', 'interview-passed');
  interviewed.timeline.filed = {
    n400: '2026-01-13',
    interview: interviewed.day.date,
  };
  expect(usCountry.placeNote?.(interviewed, 'visa')?.zhCN).toBe(
    '面谈已通过，宣誓通知下一季才会到。',
  );
  expect(usCountry.endingActionText?.(engineer, 'oath')).toEqual({
    label: 'us.game.oath',
    confirm: 'us.game.oathConfirm',
  });
});

test.each(['zh-CN', 'en'] as const)(
  'the kitchen hint and ending furniture use US wording in %s',
  (locale) => {
    const hint = t(gameKey('us', 'game.kitchenNoIngredients'), locale);
    expect(hint).not.toBe(t('game.kitchenNoIngredients', locale));
    expect(hint).not.toMatch(/池塘|河鲈|pond|allotment/);
    const state = settle(us.newGame('engineer', 4, locale));
    const shop = us
      .activities({ ...state, day: { ...state.day, minute: 600 } }, 'shop')
      .filter(({ id }) => id.startsWith('furnish-'))
      .map(({ label }) => (locale === 'en' ? label.en : label.zhCN));
    state.flags.push(
      'furnished-reading-chair',
      'furnished-warm-curtains',
      'furnished-desk-lamp',
    );
    const names = usShell
      .endingMemories(state)
      .furnishings.map(({ name }) => (locale === 'en' ? name.en : name.zhCN));
    expect(names).toEqual(
      locale === 'en'
        ? ['Thrift-store armchair', 'Thermal curtains', 'Desk lamp']
        : ['旧货店的扶手椅', '保暖窗帘', '台灯'],
    );
    expect(shop).toHaveLength(names.length);
    names.forEach((name, i) =>
      expect(shop[i].toLowerCase()).toContain(name.toLowerCase()),
    );
  },
);

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
});

test.each(['zh-CN', 'en'] as const)(
  'US recipes keep their own cooking steps in %s',
  (locale) => {
    for (const recipe of us.recipes) {
      const shared = `game.prepare-${recipe.id}` as TranslationKey;
      const own = gameKey('us', shared);
      expect(own, recipe.id).toBe(`us.${shared}`);
      expect(t(own, locale), recipe.id).not.toBe(t(shared, locale));
    }
    // The UK salad keeps its own step, and the US one is not a shared key.
    expect(t('game.prepare-salad', locale)).toBe(
      locale === 'en' ? 'Toss gently' : '轻轻拌匀',
    );
    expect(
      t(gameKey('us', 'game.prepare-garden-salad' as TranslationKey), locale),
    ).toBe(
      locale === 'en' ? 'Chop and toss with ranch' : '切块，淋上农场沙拉酱',
    );
  },
);

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
