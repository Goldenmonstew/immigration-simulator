import { beforeAll, expect, test } from 'vitest';
import { evaluateCanadaFull } from '@uk-immigration/engine';
import { canadaFull2026_11 } from '@uk-immigration/policy-data';
import * as ca from '../src/packs/ca';

type State = ReturnType<typeof ca.newGame>;
const values = canadaFull2026_11.values;

beforeAll(async () => {
  for (const { id } of ca.characters) await ca.loadCharacter(id);
});

/** Take each event's first choice, and read any letters, until nothing is pending. */
function settle(state: State) {
  for (;;) {
    while (state.pendingEvent)
      state = ca.resolve(state, ca.currentEvent(state)!.choices[0].id);
    if (!ca.mailbox(state).length) return state;
    state = ca.readMail(state);
  }
}
/** Sleep through to the next playable day, answering events on the way. */
function nextDay(state: State) {
  const day = state.dayNumber;
  for (let i = 0; i < 8 && state.dayNumber === day; i++)
    state = settle(ca.sleep(settle(state)));
  return state;
}
/** Sleep through to the first day of the next quarter. */
function nextQuarter(from: State) {
  let state = from;
  for (let i = 0; i < 12 && state.date === from.date; i++)
    state = settle(ca.sleep(settle(state)));
  return state;
}
/** Walk to an open place at a given time, as the town map would. */
function visit(state: State, place: string, minute: number) {
  state = settle(state);
  if (state.day.minute < minute)
    state = settle(ca.tick(state, minute - state.day.minute));
  return settle(ca.enter(state, place));
}
/** Jump to a later quarter, its assessment and its playable workday. */
function jump(from: State, date: string, day: string) {
  const state = structuredClone(from);
  state.date = date;
  state.day = { ...state.day, date: day, minute: 540, done: [] };
  state.result = ca.caRules.evaluate(state);
  return state;
}
const ids = (state: State, place: string) =>
  ca.activities(state, place).map(({ id }) => id);
const unmet = (state: State, id: Parameters<typeof ca.pathwayOf>[1]) =>
  ca
    .pathwayOf(state.result, id)!
    .checks.filter((check) => !check.advisory && check.status !== 'MET')
    .map((check) => check.id);

test('each character opens on a Maple Harbour spring morning', () => {
  const citizen = ca.newGame('citizen', 5, 'en');
  expect(ca.currentEvent(citizen)?.id).toBe('opening-citizen');
  expect([citizen.date, citizen.quarter, citizen.day.date]).toEqual([
    '2026-03-01',
    2,
    '2026-03-10',
  ]);
  expect(citizen.stats).toEqual({
    money: 18_000,
    mood: 66,
    health: 72,
    english: 72,
    career: 35,
    civics: 20,
  });
  expect(ca.resolve(citizen, 'guide').stats.civics).toBe(23);
  // The PR card runs to July 2030; the work permit to June 2028.
  expect(ca.visaMonthsLeft(citizen)).toBe(52);

  const graduate = ca.newGame('graduate', 5, 'en');
  expect(ca.currentEvent(graduate)?.id).toBe('opening-graduate');
  expect(ca.visaMonthsLeft(graduate)).toBe(27);
  expect(ca.townsfolk(graduate).map((npc) => npc.id)).toContain('chloe');
  expect(ca.townsfolk(citizen).map((npc) => npc.id)).not.toContain('chloe');
  expect(ca.townsfolk(citizen)).toHaveLength(7);
});

test('the Canadian rules engine assesses each route and sets the progress bars', () => {
  const citizen = ca.newGame('citizen', 5, 'zh-CN');
  expect(citizen.result.columns[0].id).toBe(canadaFull2026_11.ruleSetId);
  expect(ca.pathwayOf(citizen.result, 'CA-RESIDENCY')?.status).toBe('MET');
  // 1,095 days with half credit for the pre-PR years, less the trip home
  // (SRC-074 s.5(1)(c)(i), s.5(1.001)).
  expect(ca.progress(citizen)).toEqual({
    pr: { outcome: 'MET', percent: 100 },
    cit: { outcome: 'FUTURE', earliestDate: '2027-06-22', percent: 73 },
  });
  expect(unmet(citizen, 'CA-CITIZENSHIP')).toEqual([
    'CA-R08',
    'CA-R11',
    'CA-R17',
  ]);

  const graduate = ca.newGame('graduate', 5, 'zh-CN');
  expect(ca.progress(graduate)).toEqual({
    pr: { outcome: 'UNKNOWN', percent: 50 },
    cit: { outcome: 'NOT_MET', percent: 0 },
  });
  expect(unmet(graduate, 'CA-AIP')).toEqual([
    'CA-R20',
    'CA-R24',
    'CA-R26',
    'CA-R55',
    'CA-R56',
    'CA-R58',
  ]);
});

test('Victoria Day is a kite fair on the waterfront green with lobster rolls', () => {
  const state = nextDay(nextDay(ca.newGame('citizen', 5, 'en')));
  expect([state.day.kind, state.day.date, state.day.festival]).toEqual([
    'special',
    '2026-05-18',
    'victoria-day',
  ]);
  const green = visit(state, 'green', 600);
  expect(ids(green, 'green')).toEqual(['festival', 'kite']);
  const kite = ca.doActivity(green, 'kite');
  expect(kite.inventory['lobster-roll']).toBe(1);
  expect(kite.flags).toContain('visited-festival:victoria-day');
  expect(ca.shop(kite, 'green').map(({ id }) => id)).toEqual(['lobster-roll']);
  const market = visit(state, 'market', 600);
  expect(ca.shop(market, 'market').map(({ id }) => id)).toEqual([
    'oatcakes',
    'blueberries',
    'maple-syrup',
    'flowers',
  ]);
});

test('a trip home delays citizenship, and a JSON save continues the same quarter', () => {
  const station = visit(ca.newGame('citizen', 21, 'en'), 'station', 600);
  const state = settle(ca.doActivity(station, 'travel-1'));
  expect(state.timeline.trips).toEqual([
    { departed: '2025-12-18', returned: '2026-01-08' },
    { departed: '2026-03-10', returned: '2026-04-10' },
  ]);
  expect([state.date, state.quarter]).toEqual(['2026-06-01', 3]);
  expect(ca.progress(state).cit.earliestDate).toBe('2027-07-22');
  const restored: State = JSON.parse(JSON.stringify(state));
  const played = nextQuarter(state);
  expect(played.date).toBe('2026-09-01');
  expect(nextQuarter(restored)).toEqual(played);
});

/** The graduate's Atlantic papers, all asked for on the first workday. */
function atlanticPapers() {
  let state = settle(ca.newGame('graduate', 5, 'en'));
  Object.assign(state.stats, { career: 45, english: 65, money: 9_000 });
  state = settle(ca.doActivity(visit(state, 'work', 600), 'permanent-post'));
  state = settle(
    ca.doActivity(visit(state, 'newcomer', 620), 'settlement-plan'),
  );
  state = settle(
    ca.doActivity(visit(state, 'work', 700), 'endorsement-request'),
  );
  state = settle(ca.doActivity(visit(state, 'library', 800), 'police-request'));
  return settle(ca.doActivity(visit(state, 'college', 900), 'exam'));
}

test('the Atlantic route: offer, settlement plan, endorsement, test, certificate, then filing', () => {
  const state = atlanticPapers();
  expect(state.timeline.atlantic?.offer).toMatchObject({ teer: 3 });
  expect(state.timeline.atlantic?.language?.levels).toEqual({
    listening: values.atlanticWork.value.higherLanguage,
    speaking: values.atlanticWork.value.higherLanguage,
    reading: values.atlanticWork.value.higherLanguage,
    writing: values.atlanticWork.value.higherLanguage,
  });
  expect(ca.readyToFile(state)).toBe(false);
  expect(ids(visit(state, 'visa', 960 - 120), 'visa')).toEqual([]);

  // The endorsement and police certificate arrive by post next quarter.
  const next = nextQuarter(state);
  expect(next.date).toBe('2026-06-01');
  expect(next.timeline.atlantic?.endorsement).toMatchObject({
    issued: '2026-06-01',
  });
  expect(next.timeline.federal?.principal?.foreignStays?.[0]).toMatchObject({
    certificateIssued: '2026-06-01',
  });
  expect(ca.readyToFile(next)).toBe(true);
  const office = visit(next, 'visa', 600);
  expect(ids(office, 'visa')).toEqual(['settle']);
  const fee =
    values.federalFees.value.economicAdult +
    values.federalFees.value.right +
    values.federalFees.value.biometric;
  expect(ca.aipFee).toBe(fee);
  const ended = ca.doActivity(office, 'settle');
  expect(ended.ending).toBe('settled');
  expect(ended.stats.money).toBe(office.stats.money - fee);
  // Filed on the workday; the story's last assessment is as of that day.
  expect(ended.timeline.filed).toEqual({ aip: '2026-06-09' });
  expect(ended.timeline.endedOn).toBe('2026-06-09');
  // IRCC instructs the medical exam after receipt (SRC-266).
  expect(unmet(ended, 'CA-AIP')).toEqual(['CA-R24']);
  expect(ca.narrative(ended).at(-1)).toEqual(
    ca.characterOf('graduate').settlement,
  );
});

test('citizenship: sign when the days are in, pass the test, then take the oath', () => {
  const opening = settle(ca.newGame('citizen', 5, 'en'));
  expect(ca.readyToFile(jump(opening, '2027-06-01', '2027-06-15'))).toBe(false);
  const state = jump(opening, '2027-09-01', '2027-09-14');
  expect(ca.readyToFile(state)).toBe(true);
  const office = visit(state, 'visa', 600);
  expect(ids(office, 'visa')).toEqual(['apply-citizenship']);
  const signed = settle(ca.doActivity(office, 'apply-citizenship'));
  const fee = values.citAdultProcessingFee.value + values.citRightFee.value;
  expect(signed.stats.money).toBe(office.stats.money - fee);
  expect(signed.timeline.filed).toEqual({ citizenship: '2027-09-14' });

  const invited = nextQuarter(signed);
  expect(ca.caRequest(invited.timeline, invited.date).residence).toMatchObject({
    signingDate: '2027-09-14',
    citizenshipFeesPaid: true,
  });
  expect(unmet(invited, 'CA-CITIZENSHIP')).toEqual(['CA-R11']);
  invited.stats.civics = 40;
  const failed = settle(ca.doActivity(visit(invited, 'visa', 600), 'cit-test'));
  expect(failed.timeline.residence?.test).toEqual({ outcome: 'retry' });
  expect(failed.firedEvents).toContain('system-test-failed');
  invited.stats.civics = 70;
  const passed = ca.doActivity(visit(invited, 'visa', 600), 'cit-test');
  expect(ca.pathwayOf(passed.result, 'CA-CITIZENSHIP')?.status).toBe('MET');

  const ceremony = visit(nextQuarter(passed), 'visa', 600);
  expect(ids(ceremony, 'visa')).toEqual(['oath']);
  const ended = ca.doActivity(ceremony, 'oath');
  expect(ended.ending).toBe('settled');
  expect(ended.timeline.endedOn).toBe('2028-03-14');
  const request = ca.caRequest(ended.timeline, '2028-03-14');
  expect(request.residence).toMatchObject({
    oath: 'taken',
    grantDate: '2028-03-14',
  });
  expect(ca.pathwayOf(ended.result, 'CA-CITIZENSHIP')?.status).toBe('MET');
  const engine = evaluateCanadaFull({ ...request, locale: 'en' });
  expect(ca.pathwayOf(engine, 'CA-CITIZENSHIP')?.status).toBe('MET');
  expect(ca.narrative(ended).at(-1)).toEqual(
    ca.characterOf('citizen').settlement,
  );
});

test('what the player does on a day carries that day and joins the next quarter', () => {
  // CELPIP on the first workday, 2026-03-10.
  const graduate = atlanticPapers();
  expect(graduate.timeline.atlantic?.language?.resultDate).toBe('2026-03-10');
  expect(
    ca.caRequest(graduate.timeline, graduate.date).atlantic?.language,
  ).toBeUndefined();
  expect(
    ca.caRequest(graduate.timeline, '2026-06-01').atlantic?.language
      ?.resultDate,
  ).toBe('2026-03-10');

  const citizen = jump(
    settle(ca.newGame('citizen', 5, 'en')),
    '2027-09-01',
    '2027-09-14',
  );
  const signed = settle(
    ca.doActivity(visit(citizen, 'visa', 600), 'apply-citizenship'),
  );
  // The quarter's assessment, as of 2027-09-01, is still before the signing.
  expect(
    ca.caRequest(signed.timeline, signed.date).residence?.signingDate,
  ).toBeUndefined();
  expect(unmet(signed, 'CA-CITIZENSHIP')).toEqual(['CA-R11', 'CA-R17']);
});

test('day-count limits are checked on the day itself', () => {
  // The 1,095 days are met from 2027-06-22 (SRC-074 s.5(1)(c)(i)).
  const citizen = settle(ca.newGame('citizen', 5, 'en'));
  expect(ca.readyToFile(jump(citizen, '2027-06-01', '2027-06-21'))).toBe(false);
  expect(ca.readyToFile(jump(citizen, '2027-06-01', '2027-06-22'))).toBe(true);

  // The CELPIP result of 2026-03-10 is too old to file with two years on
  // (SRC-270), so it can be retaken.
  const papers = atlanticPapers();
  const college = (date: string, day: string) =>
    ids(visit(jump(papers, date, day), 'college', 600), 'college');
  expect(college('2028-03-01', '2028-03-09')).not.toContain('exam');
  expect(college('2028-03-01', '2028-03-14')).toContain('exam');

  // The endorsement runs to 2026-12-01; HR can ask again once it lapses.
  const next = nextQuarter(papers);
  const work = (day: string) =>
    ids(visit(jump(next, '2026-12-01', day), 'work', 600), 'work');
  expect(work('2026-12-01')).not.toContain('endorsement-request');
  expect(work('2026-12-08')).toContain('endorsement-request');
});

test('a lapsed work permit ends the story, and the assessment shows the lapse', () => {
  // Every paper in hand, but the permit ends before the filing.
  let state = nextQuarter(atlanticPapers());
  state.timeline.document.expires = '2026-07-30';
  expect(unmet(state, 'CA-AIP')).not.toContain('CA-R25');
  for (let i = 0; i < 6 && !ca.isOver(state); i++) state = nextDay(state);
  expect([state.ending, state.date]).toEqual(['overstayed', '2026-09-01']);
  // The work stops with the permit, the funds exemption goes with it, and
  // whether the overstay is noncompliance is for an officer to decide.
  expect(state.timeline.job).toBeUndefined();
  expect(state.timeline.atlantic).toMatchObject({
    workingInCanada: false,
    fundsExemptionAuthorization: false,
    workHistory: [{ from: '2025-07-07', to: '2026-07-30' }],
  });
  expect(state.timeline.federal?.protectionAndCompliance).toBe('under-review');
  expect(unmet(state, 'CA-AIP')).toEqual(
    expect.arrayContaining(['CA-R25', 'CA-R59']),
  );
  expect(ca.pathwayOf(state.result, 'CA-AIP')?.status).not.toBe('MET');
});
