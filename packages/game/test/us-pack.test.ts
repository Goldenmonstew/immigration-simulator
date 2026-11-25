import { beforeAll, expect, test } from 'vitest';
import { evaluateUnitedStatesFull } from '@uk-immigration/engine';
import {
  unitedStates2026_11,
  unitedStatesFull2026_11,
} from '@uk-immigration/policy-data';
import * as us from '../src/packs/us';

type State = ReturnType<typeof us.newGame>;
const fees = unitedStatesFull2026_11.values.fees.value;

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
  // Filing opens on 2028-03-17; approval stays open until the English and
  // civics tests, so the bar shows the result page's outcome, UNKNOWN.
  expect(us.pathwayOf(engineer.result, 'cit')).toMatchObject({
    status: 'FUTURE',
    approvalStatus: 'UNKNOWN',
  });
  expect(us.progress(engineer)).toEqual({
    gc: { outcome: 'MET', percent: 100 },
    cit: { outcome: 'UNKNOWN', earliestDate: '2028-03-17', percent: 57 },
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
  // No I-751 is pending before its window, so the citizen's-spouse filing
  // cannot rest on one yet (C02 open, no projected filing date).
  expect(
    us.usRequest(spouse.timeline, 'US-SPOUSE', '2026-03-02', 'zh-CN')
      .naturalization?.conditionalStatusResolved,
  ).toBeUndefined();
  expect(us.progress(spouse).cit).toEqual({ outcome: 'UNKNOWN', percent: 0 });
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

test('a move and its AR-11 report carry the day and join the next quarter’s assessment', () => {
  const address = (state: State) =>
    us
      .pathwayOf(state.result, 'gc')!
      .checks.find(({ id }) => id === 'US-C19-ADDRESS')!.status;
  // The answers the questionnaire gets for this quarter's assessment date.
  const answers = (state: State) =>
    us.usRequest(state.timeline, 'US-TRAVEL', us.filingDay(state.date), 'en')
      .travel;
  const home = visit(us.newGame('engineer', 5, 'en'), 'home', 480);
  expect([us.filingDay(home.date), home.day.date]).toEqual([
    '2026-03-02',
    '2026-03-10',
  ]);
  const moved = settle(us.doActivity(home, 'rent-brighter-home'));
  expect(moved.flags).toContain('address-report-due');
  // The move happens after the assessment date, so it waits for next quarter.
  expect(answers(moved)).toMatchObject({ movedOn: 'no-move' });
  expect(ids(visit(moved, 'home', 500), 'home')).toContain('address-report');
  const reported = settle(
    us.doActivity(visit(moved, 'home', 500), 'address-report'),
  );
  expect(reported.flags).not.toContain('address-report-due');
  expect(answers(reported)).toMatchObject({ movedOn: 'no-move' });
  const next = quarterLater(reported);
  expect(answers(next)).toMatchObject({
    movedOn: '2026-03-10',
    addressReportedOn: '2026-03-10',
  });
  expect(address(next)).toBe('MET');
  // Not reported at all.
  expect(address(quarterLater(moved))).toBe('NOT_MET');
  // Reported on the festival day, eight weeks after the move.
  const festival = nextDay(nextDay(moved));
  expect(festival.day.date).toBe('2026-05-05');
  const late = settle(
    us.doActivity(visit(festival, 'home', 600), 'address-report'),
  );
  expect(address(late)).toBe('MET');
  const after = quarterLater(late);
  expect(answers(after)).toMatchObject({
    movedOn: '2026-03-10',
    addressReportedOn: '2026-05-05',
  });
  expect(address(after)).toBe('NOT_MET');
});

test('a move is offered only while the AR-11 can still be filed that day', () => {
  const evening = visit(us.newGame('engineer', 5, 'en'), 'home', 1370);
  expect(ids(evening, 'home')).toContain('rent-brighter-home');
  expect(ids(settle(us.tick(evening, 1)), 'home')).not.toContain(
    'rent-brighter-home',
  );
  const moved = settle(us.doActivity(evening, 'rent-brighter-home'));
  expect(ids(moved, 'home')).toContain('address-report');
  const back = visit(nextDay(moved), 'home', 1370);
  expect(ids(back, 'home')).toContain('leave-brighter-home');
  expect(ids(settle(us.tick(back, 1)), 'home')).not.toContain(
    'leave-brighter-home',
  );
});

test('the I-751 is mailed on a day inside its window and stays pending', () => {
  const answers = (state: State, pathway: 'US-SPOUSE' | 'US-TRAVEL') =>
    us.usRequest(state.timeline, pathway, us.filingDay(state.date), 'en');
  const state = playTo(us.newGame('spouse', 5, 'en'), '2027-09-01');
  const office = visit(state, 'visa', 600);
  // The window runs from 90 days before the second anniversary to the day
  // before it, judged on the day the petition goes in the mail.
  const on = (date: string) =>
    ids({ ...office, day: { ...office.day, date } }, 'visa');
  expect(on('2027-06-16')).toEqual([]);
  expect(on('2027-06-17')).toEqual(['extend']);
  expect(on('2027-09-14')).toEqual(['extend']);
  expect(on('2027-09-15')).toEqual([]);
  expect(office.day.date <= '2027-09-14').toBe(true);
  const filed = us.doActivity(office, 'extend');
  expect(filed.stats.money).toBe(office.stats.money - fees.i751.paper);
  // No decision and no new card: USCIS has not adjudicated the petition.
  expect(filed.timeline.travel.cardExpiresOn).toBe('2027-09-15');
  expect(filed.log.at(-1)?.renewalValidTo).toBeUndefined();
  expect(filed.outcome?.text?.en).not.toMatch(/new|green card arrives/i);
  expect(ids(filed, 'visa')).toEqual([]);
  // Mailed after the assessment date: still the I-751 column this quarter.
  expect(
    answers(filed, 'US-SPOUSE').naturalization?.conditionalStatusResolved,
  ).toBeUndefined();
  expect(us.pathwayOf(filed.result, 'gc')?.id).toBe('US-CONDITIONS');
  // From next quarter the petition is pending with status maintained
  // (SRC-080 8 CFR 216.4(a)(1)); the green card column keeps the card.
  const next = quarterLater(filed);
  expect(us.isOver(next)).toBe(false);
  expect(
    answers(next, 'US-SPOUSE').naturalization?.conditionalStatusResolved,
  ).toBe(false);
  expect(us.pathwayOf(next.result, 'gc')).toMatchObject({
    id: 'US-TRAVEL',
    status: 'MET',
  });
  expect(
    us
      .pathwayOf(next.result, 'cit')!
      .checks.find(({ id }) => id === 'US-C02-LAWFUL-LPR'),
  ).toMatchObject({ filingStatus: 'MET', status: 'UNKNOWN' });
  // A pending petition keeps status: no lapse when the card's date passes.
  const later = playTo(next, '2028-03-01');
  expect(us.isOver(later)).toBe(false);
  expect(ids(visit(later, 'visa', 600), 'visa')).toEqual([]);
  // How long the receipt notice extends the card is not in policy-data
  // (PD-432), so the game books no trips past the printed date.
  expect(
    ids(visit(later, 'station', 600), 'station').filter((id) =>
      id.startsWith('travel-'),
    ),
  ).toEqual([]);
});

test('the I-90 renewal opens six months before expiry and stays pending', () => {
  const travel = (state: State) =>
    us.usRequest(state.timeline, 'US-TRAVEL', us.filingDay(state.date), 'en')
      .travel!;
  const renewal = (state: State) =>
    us
      .pathwayOf(state.result, 'gc')!
      .checks.find(({ id }) => id === 'US-C19-REPLACEMENT')?.status;
  const december = visit(
    playTo(us.newGame('engineer', 5, 'en'), '2032-12-01'),
    'visa',
    600,
  );
  // The card ends 2033-06-15; renewal opens on the day six months before,
  // judged on the day the form goes in the mail.
  expect(december.timeline.travel.cardExpiresOn).toBe('2033-06-15');
  const on = (date: string) =>
    ids({ ...december, day: { ...december.day, date } }, 'visa').includes(
      'extend',
    );
  expect(on('2032-12-14')).toBe(false);
  expect(on('2032-12-15')).toBe(true);
  const office = visit(playTo(december, '2033-03-01'), 'visa', 600);
  expect(renewal(office)).toBe('NOT_MET');
  const mailed = office.day.date;
  const filed = us.doActivity(office, 'extend');
  expect(filed.stats.money).toBe(office.stats.money - fees.i90.paper);
  // No new card: USCIS has not decided, and the card keeps its date.
  expect(filed.timeline.travel.cardExpiresOn).toBe('2033-06-15');
  expect(filed.log.at(-1)?.renewalValidTo).toBeUndefined();
  expect(travel(filed).replacementFiledOn).toBe('not-filed');
  expect(ids(filed, 'visa')).not.toContain('extend');
  // From next quarter the engine sees the filing on its own day.
  const next = quarterLater(filed);
  expect(travel(next)).toMatchObject({
    replacementFiledOn: mailed,
    replacementReason: 'renewal',
  });
  expect(renewal(next)).toBe('MET');
  expect(ids(visit(next, 'visa', 600), 'visa')).not.toContain('extend');
  // Past the card's date no trips are booked (PD-432).
  const expired = playTo(next, '2033-09-01');
  expect(
    ids(visit(expired, 'station', 600), 'station').filter((id) =>
      id.startsWith('travel-'),
    ),
  ).toEqual([]);
});

test('missing the I-751 window ends conditional residence', () => {
  const state = playTo(us.newGame('spouse', 5, 'en'), '2027-12-01');
  expect(state.ending).toBe('overstayed');
  // The ending's assessment shows the lapse: no timely petition and no
  // permanent residence to naturalize from.
  const status = (column: 'gc' | 'cit', id: string) =>
    us.pathwayOf(state.result, column)!.checks.find((check) => check.id === id)
      ?.status;
  expect(status('gc', 'US-TIME-CONDITIONS-FILING')).toBe('NOT_MET');
  expect(status('cit', 'US-C02-LAWFUL-LPR')).toBe('NOT_MET');
  expect(
    state.result.columns[0].pathways.map(({ id, status, approvalStatus }) => [
      id,
      status,
      approvalStatus,
    ]),
  ).toEqual([
    ['US-CONDITIONS', 'NOT_MET', 'NOT_MET'],
    ['US-SPOUSE', 'NOT_MET', 'NOT_MET'],
  ]);
});

test('naturalization runs from the N-400 through the interview to the oath', () => {
  // The answers the questionnaire gets for a quarter's assessment date.
  const answers = (state: State) =>
    us.usRequest(
      state.timeline,
      'US-NATURALIZATION',
      us.filingDay(state.date),
      'en',
    );
  let state = playTo(us.newGame('engineer', 5, 'en'), '2028-03-01');
  expect(us.pathwayOf(state.result, 'cit')?.status).toBe('FUTURE');
  state = playTo(state, '2028-06-01');
  expect(us.pathwayOf(state.result, 'cit')?.status).toBe('MET');
  const office = visit(state, 'visa', 600);
  expect(ids(office, 'visa')).toEqual(['n400']);
  // Mailed on the quarter's workday, after its assessment date.
  const mailed = office.day.date;
  expect(mailed > us.filingDay(office.date)).toBe(true);
  const filed = us.doActivity(office, 'n400');
  expect(filed.stats.money).toBe(office.stats.money - fees.n400.paper);
  expect(answers(filed).fees?.filingOn).toBeUndefined();
  // USCIS schedules the interview later: next quarter in the game.
  expect(ids(filed, 'visa')).toEqual([]);
  const later = playTo(filed, '2028-09-01');
  expect(answers(later).fees?.filingOn).toBe(mailed);
  later.stats.english = 64;
  const interview = visit(later, 'visa', 600);
  expect(ids(interview, 'visa')).toEqual(['interview']);
  const interviewed = interview.day.date;
  const passed = settle(us.doActivity(interview, 'interview'));
  expect(passed.flags).toContain('interview-passed');
  // The tests are passed on the day, so they join next quarter's assessment.
  expect(answers(passed).naturalization).toMatchObject({
    english: 'preparing',
    civics: 'preparing',
  });
  expect(answers(passed).naturalization?.interviewOn).toBeUndefined();
  expect(us.pathwayOf(passed.result, 'cit')?.approvalStatus).toBe('UNKNOWN');
  expect(ids(visit(passed, 'visa', 700), 'visa')).toEqual([]);
  const sworn = playTo(passed, '2028-12-01');
  expect(answers(sworn).naturalization).toMatchObject({
    english: 'passed',
    civics: 'passed',
    interviewOn: interviewed,
  });
  // Five full years from 2023-06-15 have passed, so approval is met too.
  expect(us.pathwayOf(sworn.result, 'cit')?.approvalStatus).toBe('MET');
  const oath = visit(sworn, 'visa', 600);
  expect(ids(oath, 'visa')).toEqual(['oath']);
  const ended = us.doActivity(oath, 'oath');
  expect(ended.ending).toBe('settled');
  expect(us.narrative(ended).at(-1)).toEqual(
    us.characterOf('engineer').settlement,
  );
});

test('the spouse naturalizes while USCIS has yet to decide the I-751', () => {
  let state = playTo(us.newGame('spouse', 5, 'en'), '2027-09-01');
  state = settle(us.doActivity(visit(state, 'visa', 600), 'extend'));
  state = playTo(state, '2028-09-01');
  // Three years from 2025-09-15, filed up to 90 days early (2028-06-20).
  expect(us.pathwayOf(state.result, 'cit')).toMatchObject({
    id: 'US-SPOUSE',
    status: 'MET',
  });
  state.stats.money = Math.max(state.stats.money, fees.n400.paper);
  state = playTo(
    us.doActivity(visit(state, 'visa', 600), 'n400'),
    '2028-12-01',
  );
  state.stats.english = 64;
  state = settle(us.doActivity(visit(state, 'visa', 600), 'interview'));
  state = playTo(state, '2029-03-01');
  // Approval waits only on the undecided I-751 (C02).
  const citizenship = us.pathwayOf(state.result, 'cit')!;
  expect(citizenship.approvalStatus).toBe('UNKNOWN');
  expect(
    citizenship.checks
      .filter(
        (check) =>
          check.applicable !== false &&
          !check.informational &&
          check.status !== 'MET',
      )
      .map(({ id }) => id),
  ).toEqual(['US-C02-LAWFUL-LPR']);
  const office = visit(state, 'visa', 600);
  const [oath] = us.activities(office, 'visa');
  expect(oath.id).toBe('oath');
  expect(oath.note?.en).toMatch(/USCIS has not decided the I-751/);
  // The oath is the only settled ending; its text is the character's own.
  const ended = us.doActivity(office, 'oath');
  expect(ended.ending).toBe('settled');
  const settlement = us.characterOf('spouse').settlement;
  expect(us.narrative(ended).at(-1)).toEqual(settlement);
  expect(ended.log.at(-1)?.text).toEqual(settlement);
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
