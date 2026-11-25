import { beforeAll, expect, test } from 'vitest';
import { evaluateJapanFull } from '@uk-immigration/engine';
import { japanFull2026_11 } from '@uk-immigration/policy-data';
import * as jp from '../src/packs/jp';

type State = ReturnType<typeof jp.newGame>;
const values = japanFull2026_11.values;

beforeAll(async () => {
  for (const { id } of jp.characters) await jp.loadCharacter(id);
});

/** Take each event's first choice until nothing is pending. */
function settle(state: State) {
  while (state.pendingEvent)
    state = jp.resolve(state, jp.currentEvent(state)!.choices[0].id);
  return state;
}
/** Sleep through to the next playable day, answering events on the way. */
function nextDay(state: State) {
  const day = state.dayNumber;
  for (let i = 0; i < 8 && state.dayNumber === day; i++)
    state = settle(jp.sleep(settle(state)));
  return state;
}
/** Walk to an open place at a given time, as the town map would. */
function visit(state: State, place: string, minute: number) {
  state = settle(state);
  if (state.day.minute < minute)
    state = settle(jp.tick(state, minute - state.day.minute));
  return settle(jp.enter(state, place));
}

test('each character opens on their own spring morning with a Japanese timeline', () => {
  const engineer = jp.newGame('engineer', 5, 'en');
  expect(jp.currentEvent(engineer)?.id).toBe('opening-engineer');
  expect([engineer.date, engineer.quarter, engineer.day.date]).toEqual([
    '2026-03-01',
    2,
    '2026-03-10',
  ]);
  expect(engineer.stats).toEqual({
    money: 1_800_000,
    mood: 64,
    health: 72,
    japanese: 38,
    career: 30,
  });
  const walked = jp.resolve(engineer, 'walk');
  expect(walked.stats.mood).toBe(68);

  const spouse = jp.newGame('spouse', 5, 'en');
  expect(jp.currentEvent(spouse)?.id).toBe('opening-spouse');
  expect(jp.townsfolk(spouse).map((npc) => npc.id)).toContain('yuto');
  expect(jp.townsfolk(engineer).map((npc) => npc.id)).not.toContain('yuto');
  expect(jp.townsfolk(engineer).filter((npc) => !npc.characters)).toHaveLength(
    7,
  );
});

test('the Japanese rules engine assesses each route and sets the progress bars', () => {
  const engineer = jp.newGame('engineer', 5, 'zh-CN');
  expect(engineer.result.columns[0].id).toBe(japanFull2026_11.ruleSetId);
  expect(engineer.result.columns[0].pathways.map(({ id }) => id)).toEqual([
    'jp.pr.general',
    'jp.nat.general',
  ]);
  // Ten years from the 2024-04-01 landing (SRC-113 1(3)ア).
  expect(jp.progress(engineer).pr).toEqual({
    outcome: 'FUTURE',
    earliestDate: '2034-04-01',
    percent: 19,
  });
  expect(jp.progress(engineer).nat.outcome).toBe('NOT_MET');
  const spouse = jp.newGame('spouse', 5, 'zh-CN');
  expect(spouse.result.columns[0].pathways.map(({ id }) => id)).toEqual([
    'jp.pr.spouse',
    'jp.nat.spouse',
  ]);
  expect(jp.progress(spouse).pr).toMatchObject({
    outcome: 'FUTURE',
    earliestDate: '2029-06-15',
  });
});

test('a renewal records the longest period of stay and lifts the visa warning', () => {
  const start = settle(jp.newGame('engineer', 5, 'en'));
  expect(jp.visaMonthsLeft(start)).toBe(12);
  const office = visit(start, 'visa', 600);
  expect(jp.activities(office, 'visa').map(({ id }) => id)).toEqual(['extend']);
  const renewed = jp.doActivity(office, 'extend');
  const months = values.longestPeriod.value.maximumMonths.engineer;
  expect(jp.status(renewed)).toMatchObject({
    expiresOn: '2032-03-31',
    grantedPeriodMonths: months,
  });
  expect(renewed.log.at(-1)?.renewalValidTo).toBe('2032-03-31');
  expect(jp.visaMonthsLeft(renewed)).toBe(72);
  expect(jp.activities(renewed, 'visa').map(({ id }) => id)).toEqual([]);
});

test('moving home and reporting the address go through the ward office', () => {
  const home = visit(jp.newGame('engineer', 5, 'en'), 'home', 480);
  const moved = settle(jp.doActivity(home, 'rent-brighter-home'));
  expect(moved.timeline.permanentResidence.evidence.addressNotices).toEqual([
    { eventOn: '2026-03-01' },
  ]);
  const check = (state: State) =>
    jp
      .pathwayOf(state.result, 'pr')!
      .checks.find(({ id }) => id === 'jp.pr.address-registration')!.status;
  expect(check(moved)).toBe('UNKNOWN');
  const ward = visit(moved, 'ward', 600);
  const reported = jp.doActivity(ward, 'address-notice');
  expect(reported.timeline.permanentResidence.evidence.addressNotices).toEqual([
    { eventOn: '2026-03-01', notifiedOn: '2026-03-01' },
  ]);
  expect(check(reported)).toBe('MET');
  expect(reported.flags).not.toContain('address-notice-due');
});

test('the spring festival is hanami at the shrine, with sakura mochi and a diary flag', () => {
  const state = nextDay(nextDay(jp.newGame('engineer', 5, 'en')));
  expect([state.day.kind, state.day.date, state.day.festival]).toEqual([
    'special',
    '2026-04-04',
    'hanami',
  ]);
  const shrine = visit(state, 'green', 600);
  expect(jp.activities(shrine, 'green').map(({ id }) => id)).toEqual([
    'shrine-visit',
    'festival',
    'hanami-picnic',
  ]);
  const picnic = jp.doActivity(shrine, 'hanami-picnic');
  expect(picnic.inventory['sakura-mochi']).toBe(1);
  expect(picnic.flags).toContain('visited-festival:hanami');
  expect(jp.shop(picnic, 'green').map(({ id }) => id)).toEqual([
    'sakura-mochi',
  ]);
});

test('a JSON save round trip continues the same quarter after a trip', () => {
  const station = visit(jp.newGame('spouse', 21, 'en'), 'station', 600);
  // The month abroad runs to the end of the quarter, then returns home.
  const state = settle(jp.doActivity(station, 'travel-1'));
  expect(state.timeline.trips).toEqual([
    { departed: '2026-03-10', returned: '2026-04-10', departure: 'deemed' },
  ]);
  expect([state.date, state.quarter]).toEqual(['2026-06-01', 3]);
  const restored: State = JSON.parse(JSON.stringify(state));
  const quarterLater = (from: State) => {
    let next = from;
    for (let i = 0; i < 12 && next.date === from.date; i++)
      next = settle(jp.sleep(next));
    return next;
  };
  const played = quarterLater(state);
  expect(played.date).toBe('2026-09-01');
  expect(quarterLater(restored)).toEqual(played);
});

test('settling uses the engine’s assessment and its fee for that filing date', () => {
  const state = settle(jp.newGame('engineer', 5, 'en'));
  state.date = '2034-06-01';
  state.timeline.permanentResidence.evidence.japaneseB1Confirmed = true;
  Object.assign(jp.status(state), {
    grantedPeriodMonths: values.longestPeriod.value.maximumMonths.engineer,
    expiresOn: '2037-03-31',
  });
  state.result = jp.jpRules.evaluate(state);
  expect(jp.pathwayOf(state.result, 'pr')?.status).toBe('MET');
  const office = visit(state, 'visa', 600);
  const settleAction = jp
    .activities(office, 'visa')
    .find(({ id }) => id === 'settle')!;
  const fee = evaluateJapanFull({
    ...state.timeline,
    simulationDate: state.date,
    locale: 'en',
  }).columns[0].pathways[0].checks.find(
    ({ id }) => id === 'jp.pr.approval-fee',
  )!.fee!.amount;
  expect(fee).toBe(values.fees.value.pr);
  expect(settleAction.label.en).toContain(`¥${fee.toLocaleString('en-GB')}`);
  const ended = jp.doActivity(office, 'settle');
  expect(ended.ending).toBe('settled');
  expect(ended.stats.money).toBe(office.stats.money - fee);
  expect(jp.narrative(ended).at(-1)).toEqual(
    jp.characterOf('engineer').settlement,
  );
});

test('the permanent residence application needs money for its fee', () => {
  const state = settle(jp.newGame('engineer', 5, 'en'));
  state.date = '2034-06-01';
  state.timeline.permanentResidence.evidence.japaneseB1Confirmed = true;
  Object.assign(jp.status(state), {
    grantedPeriodMonths: values.longestPeriod.value.maximumMonths.engineer,
    expiresOn: '2037-03-31',
  });
  state.result = jp.jpRules.evaluate(state);
  expect(jp.pathwayOf(state.result, 'pr')?.status).toBe('MET');
  const fee = values.fees.value.pr;
  state.stats.money = fee - 1;
  const short = visit(state, 'visa', 600);
  expect(jp.activities(short, 'visa').map(({ id }) => id)).not.toContain(
    'settle',
  );
  state.stats.money = fee;
  const enough = visit(state, 'visa', 600);
  expect(jp.activities(enough, 'visa').map(({ id }) => id)).toContain('settle');
  expect(jp.doActivity(enough, 'settle').stats.money).toBe(0);
});

test('applying for naturalisation ends with the naturalisation text', () => {
  const state = settle(jp.newGame('engineer', 5, 'zh-CN'));
  state.date = '2034-06-01';
  state.timeline.permanentResidence.evidence.japaneseB1Confirmed = true;
  const nat = state.timeline.naturalisation.evidence;
  nat.japaneseLanguage = {
    speaking: 'independent',
    reading: 'independent',
    writing: 'independent',
    authorityConfirmed: true,
  };
  nat.requiredInterviewAndAssessmentComplete = true;
  Object.assign(jp.status(state), {
    grantedPeriodMonths: values.longestPeriod.value.maximumMonths.engineer,
    expiresOn: '2037-03-31',
  });
  state.result = jp.jpRules.evaluate(state);
  expect(jp.pathwayOf(state.result, 'nat')?.status).toBe('MET');
  const ended = jp.doActivity(visit(state, 'bureau', 600), 'naturalise');
  expect(ended.ending).toBe('settled');
  const text = jp.narrative(ended).at(-1)!;
  expect(text.zhCN).toContain('帰化申请的材料递进了法务局');
  expect(text).not.toEqual(jp.characterOf('engineer').settlement);
  expect(ended.log.find(({ kind }) => kind === 'ending')?.text).toEqual(text);
});

test('a lapsed period of stay ends the story', () => {
  let state = settle(jp.newGame('spouse', 5, 'en'));
  jp.status(state).expiresOn = '2026-04-30';
  for (let i = 0; i < 6 && !jp.isOver(state); i++) state = nextDay(state);
  expect(state.ending).toBe('overstayed');
});
