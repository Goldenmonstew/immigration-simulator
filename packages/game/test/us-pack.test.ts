import { beforeAll, expect, test } from 'vitest';
import { evaluateUnitedStatesFull } from '@uk-immigration/engine';
import {
  unitedStates2026_11,
  unitedStatesFull2026_11,
} from '@uk-immigration/policy-data';
import * as us from '../src/packs/us';

type State = ReturnType<typeof us.newGame>;
const fees = unitedStatesFull2026_11.values.fees.value;
const cardYears = unitedStatesFull2026_11.values.address.value.cardYears;

beforeAll(async () => {
  for (const { id } of us.characters) await us.loadCharacter(id);
});

/** Take each event's first choice until nothing is pending. */
function settle(state: State) {
  while (state.pendingEvent)
    state = us.resolve(state, us.currentEvent(state)!.choices[0].id);
  return state;
}
/** Sleep through to the next playable day, answering events on the way. */
function nextDay(state: State) {
  const day = state.dayNumber;
  for (let i = 0; i < 8 && state.dayNumber === day; i++)
    state = settle(us.sleep(settle(state)));
  return state;
}
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
/** Play quarters until the game date reaches the given quarter start. */
function playTo(state: State, date: string) {
  while (state.date < date && !us.isOver(state)) state = quarterLater(state);
  return settle(state);
}
const ids = (state: State, place: string) =>
  us.activities(state, place).map(({ id }) => id);

test('each character opens on their own spring morning in Lakebend', () => {
  const engineer = us.newGame('engineer', 5, 'en');
  expect(us.currentEvent(engineer)?.id).toBe('opening-engineer');
  expect([engineer.date, engineer.quarter, engineer.day.date]).toEqual([
    '2026-03-01',
    2,
    '2026-03-10',
  ]);
  expect(engineer.stats).toEqual({
    money: 14_000,
    mood: 64,
    health: 72,
    english: 52,
    career: 34,
  });
  expect(us.resolve(engineer, 'walk').stats.mood).toBe(68);

  const spouse = us.newGame('spouse', 5, 'en');
  expect(us.currentEvent(spouse)?.id).toBe('opening-spouse');
  expect(us.townsfolk(spouse).map((npc) => npc.id)).toContain('marcus');
  expect(us.townsfolk(engineer).map((npc) => npc.id)).not.toContain('marcus');
  expect(us.townsfolk(engineer).filter((npc) => !npc.characters)).toHaveLength(
    7,
  );
});

test('the US rules engine assesses each character’s green card and citizenship pathways', () => {
  const engineer = us.newGame('engineer', 5, 'zh-CN');
  expect(engineer.result.columns[0].id).toBe('us.current-law-2026-11');
  expect(engineer.result.columns[0].pathways.map(({ id }) => id)).toEqual([
    'US-TRAVEL',
    'US-NATURALIZATION',
  ]);
  // Five years from the 2023-06-15 green card, filed up to 90 days early
  // (SRC-079 8 U.S.C. 1427(a), SRC-080 8 CFR 334.2(b)).
  expect(unitedStates2026_11.values.earlyFilingDays.value).toBe(90);
  expect(us.progress(engineer)).toEqual({
    gc: { outcome: 'MET', percent: 100 },
    cit: { outcome: 'FUTURE', earliestDate: '2028-03-17', percent: 57 },
  });
  // The same answers on the questionnaire give the same assessment.
  const direct = evaluateUnitedStatesFull(
    us.usRequest(engineer.timeline, 'US-NATURALIZATION', '2026-03-02', 'zh-CN'),
  ).columns[0].pathways[0];
  expect(us.pathwayOf(engineer.result, 'cit')).toEqual(direct);

  const spouse = us.newGame('spouse', 5, 'zh-CN');
  expect(spouse.result.columns[0].pathways.map(({ id }) => id)).toEqual([
    'US-CONDITIONS',
    'US-SPOUSE',
  ]);
  // The conditional card ends on the second anniversary; I-751 opens 90
  // days before it (SRC-079 8 U.S.C. 1186a(d)(2)(A), SRC-080 8 CFR 216.4(a)(1)).
  expect(spouse.timeline.travel.cardExpiresOn).toBe('2027-09-15');
  expect(us.visaMonthsLeft(spouse)).toBe(18);
  expect(us.progress(spouse).gc).toEqual({
    outcome: 'FUTURE',
    earliestDate: '2027-06-17',
    percent: 26,
  });
  // Three years from 2025-09-15, 90 days early, on the next paper receipt day.
  expect(us.progress(spouse).cit).toMatchObject({
    outcome: 'FUTURE',
    earliestDate: '2028-06-20',
  });
});

test('the spring festival is Cinco de Mayo in the park, with elote and a diary flag', () => {
  const state = nextDay(nextDay(us.newGame('engineer', 5, 'en')));
  expect([state.day.kind, state.day.date, state.day.festival]).toEqual([
    'special',
    '2026-05-05',
    'cinco-de-mayo',
  ]);
  const park = visit(state, 'green', 600);
  expect(ids(park, 'green')).toEqual(['festival', 'folklorico']);
  const danced = us.doActivity(park, 'folklorico');
  expect(danced.inventory.elote).toBe(1);
  expect(danced.flags).toContain('visited-festival:cinco-de-mayo');
  expect(us.shop(danced, 'green').map(({ id }) => id)).toEqual(['elote']);
});

test('a JSON save round trip continues the same game after a trip home', () => {
  const station = visit(us.newGame('spouse', 21, 'en'), 'station', 600);
  // The month abroad runs to the end of the quarter, then returns home.
  const state = settle(us.doActivity(station, 'travel-1'));
  expect(state.timeline.trips).toEqual([
    { departed: '2026-03-10', returned: '2026-04-10' },
  ]);
  expect([state.date, state.quarter]).toEqual(['2026-06-01', 3]);
  const restored: State = JSON.parse(JSON.stringify(state));
  const played = quarterLater(state);
  expect(played.date).toBe('2026-09-01');
  expect(quarterLater(restored)).toEqual(played);
});

test('a six-month trip is presumed to break continuous residence for naturalization', () => {
  const station = visit(us.newGame('engineer', 21, 'en'), 'station', 600);
  const back = settle(us.doActivity(station, 'travel-6'));
  expect(back.timeline.trips.at(-1)).toEqual({
    departed: '2026-03-10',
    returned: '2026-09-10',
  });
  const citizenship = us.pathwayOf(back.result, 'cit')!;
  expect(
    citizenship.checks.find(({ id }) => id === 'US-TIME-CONTINUOUS-RESIDENCE')
      ?.status,
  ).not.toBe('MET');
  expect(citizenship.earliestDate! > '2028-03-17').toBe(true);
  // The green card stays a valid return document after a short absence.
  expect(us.pathwayOf(back.result, 'gc')?.status).toBe('MET');
});

test('moving home records the AR-11 duty until the new address is reported', () => {
  const home = visit(us.newGame('engineer', 5, 'en'), 'home', 480);
  const moved = settle(us.doActivity(home, 'rent-brighter-home'));
  expect(moved.timeline.travel).toMatchObject({
    movedOn: '2026-03-01',
    addressReportedOn: 'not-reported',
  });
  expect(ids(visit(moved, 'home', 500), 'home')).toContain('address-report');
  const reported = us.doActivity(visit(moved, 'home', 500), 'address-report');
  expect(reported.timeline.travel.addressReportedOn).toBe('2026-03-01');
  expect(reported.flags).not.toContain('address-report-due');
});

test('the I-751 window opens at the Federal Building and removes the conditions', () => {
  const before = playTo(us.newGame('spouse', 5, 'en'), '2027-06-01');
  expect(ids(visit(before, 'visa', 600), 'visa')).toEqual([]);
  const state = playTo(before, '2027-09-01');
  expect(us.pathwayOf(state.result, 'gc')?.status).toBe('MET');
  const office = visit(state, 'visa', 600);
  expect(ids(office, 'visa')).toEqual(['extend']);
  const filed = us.doActivity(office, 'extend');
  expect(filed.stats.money).toBe(office.stats.money - fees.i751.paper);
  expect(filed.timeline.naturalization.conditionalStatusResolved).toBe(true);
  expect(filed.timeline.travel.cardExpiresOn).toBe(`${2027 + cardYears}-09-01`);
  expect(filed.log.at(-1)?.renewalValidTo).toBe(
    filed.timeline.travel.cardExpiresOn,
  );
  expect(us.pathwayOf(filed.result, 'gc')?.id).toBe('US-TRAVEL');
  expect(us.isOver(quarterLater(filed))).toBe(false);
});

test('missing the I-751 window ends conditional residence', () => {
  const state = playTo(us.newGame('spouse', 5, 'en'), '2027-12-01');
  expect(state.ending).toBe('overstayed');
});

test('naturalization runs from the N-400 through the interview to the oath', () => {
  let state = playTo(us.newGame('engineer', 5, 'en'), '2028-03-01');
  expect(us.pathwayOf(state.result, 'cit')?.status).toBe('FUTURE');
  state = playTo(state, '2028-06-01');
  expect(us.pathwayOf(state.result, 'cit')?.status).toBe('MET');
  const office = visit(state, 'visa', 600);
  expect(ids(office, 'visa')).toEqual(['n400']);
  const filed = us.doActivity(office, 'n400');
  expect(filed.stats.money).toBe(office.stats.money - fees.n400.paper);
  expect(filed.timeline.fees?.filingOn).toBe('2028-06-01');
  // USCIS schedules the interview later: next quarter in the game.
  expect(ids(filed, 'visa')).toEqual([]);
  const later = playTo(filed, '2028-09-01');
  later.stats.english = 64;
  const interview = visit(later, 'visa', 600);
  expect(ids(interview, 'visa')).toEqual(['interview']);
  const passed = settle(us.doActivity(interview, 'interview'));
  expect(passed.timeline.naturalization).toMatchObject({
    english: 'passed',
    civics: 'passed',
  });
  // Five full years from 2023-06-15 have passed, so approval is met too.
  expect(us.pathwayOf(passed.result, 'cit')?.approvalStatus).toBe('MET');
  const oath = visit(passed, 'visa', 700);
  expect(ids(oath, 'visa')).toEqual(['oath']);
  const ended = us.doActivity(oath, 'oath');
  expect(ended.ending).toBe('settled');
  expect(us.narrative(ended).at(-1)).toEqual(
    us.characterOf('engineer').settlement,
  );
});

test('failing the interview twice denies the N-400, which can be filed again', () => {
  let state = playTo(us.newGame('engineer', 5, 'en'), '2028-06-01');
  state = us.doActivity(visit(state, 'visa', 600), 'n400');
  state = playTo(state, '2028-09-01');
  state.stats.english = 40;
  const first = settle(us.doActivity(visit(state, 'visa', 600), 'interview'));
  expect(first.flags).toContain('interview-retest');
  expect(first.timeline.naturalization.english).toBe('preparing');
  expect(ids(first, 'visa')).toEqual([]);
  const retest = playTo(first, '2028-12-01');
  retest.stats.english = 40;
  const denied = us.doActivity(visit(retest, 'visa', 600), 'interview');
  expect(denied.flags).not.toContain('n400-filed');
  expect(ids(visit(denied, 'visa', 700), 'visa')).toEqual(['n400']);
});
