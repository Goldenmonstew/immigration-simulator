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
/** Sleep on to the first day of the next quarter. */
function quarterLater(from: State) {
  let next = from;
  for (let i = 0; i < 12 && next.date === from.date; i++)
    next = settle(jp.sleep(next));
  return next;
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

test('a renewal keeps a three-year period and lifts the visa warning', () => {
  const start = settle(jp.newGame('engineer', 5, 'en'));
  expect(jp.visaMonthsLeft(start)).toBe(12);
  const office = visit(start, 'visa', 600);
  const [extend] = jp.activities(office, 'visa');
  expect(extend.id).toBe('extend');
  expect(extend.note?.en).toContain('shows that requirement as pending');
  const renewed = jp.doActivity(office, 'extend');
  const months = values.longestPeriod.value.deemedMonths;
  expect(months).toBeLessThan(
    values.longestPeriod.value.maximumMonths.engineer,
  );
  expect(jp.status(renewed)).toMatchObject({
    expiresOn: '2030-03-31',
    grantedPeriodMonths: months,
  });
  expect(renewed.log.at(-1)?.renewalValidTo).toBe('2030-03-31');
  expect(jp.visaMonthsLeft(renewed)).toBe(48);
  expect(jp.activities(renewed, 'visa').map(({ id }) => id)).toEqual([]);
});

test('after the transition the longest period stays pending, and the application can still go in', () => {
  const state = settle(jp.newGame('engineer', 5, 'en'));
  state.date = '2034-06-01';
  state.timeline.permanentResidence.evidence.japaneseB1Confirmed = true;
  Object.assign(jp.status(state), {
    grantedPeriodMonths: values.longestPeriod.value.deemedMonths,
    expiresOn: '2036-03-31',
  });
  state.result = jp.jpRules.evaluate(state);
  const pathway = jp.pathwayOf(state.result, 'pr')!;
  expect(state.date > values.longestPeriod.value.transitionOn).toBe(true);
  expect(pathway.status).toBe('UNKNOWN');
  expect(
    pathway.checks
      .filter((check) => check.applicable !== false && check.status !== 'MET')
      .map(({ id, status }) => [id, status]),
  ).toEqual([['jp.pr.longest-period', 'UNKNOWN']]);
  const office = visit(state, 'visa', 600);
  const apply = jp
    .activities(office, 'visa')
    .find(({ id }) => id === 'settle')!;
  expect(apply.label.en).toContain('longest period of stay pending');
  expect(jp.doActivity(office, 'settle').ending).toBe('settled');

  // Any other open question still keeps the window closed.
  state.timeline.permanentResidence.evidence.addressNotices = [
    { eventOn: '2034-05-20' },
  ];
  state.result = jp.jpRules.evaluate(state);
  expect(
    jp.activities(visit(state, 'visa', 600), 'visa').map(({ id }) => id),
  ).not.toContain('settle');
});

const addressCheck = (state: State) =>
  jp
    .pathwayOf(state.result, 'pr')!
    .checks.find(({ id }) => id === 'jp.pr.address-registration')!.status;
const homeActions = (state: State) =>
  jp.activities(state, 'home').map(({ id }) => id);

test('a move and its address notice are recorded on the day they happen', () => {
  const home = visit(jp.newGame('engineer', 5, 'en'), 'home', 480);
  const moved = settle(jp.doActivity(home, 'rent-brighter-home'));
  expect(moved.timeline.permanentResidence.evidence.addressNotices).toEqual([
    { eventOn: '2026-03-10' },
  ]);
  const ward = visit(moved, 'ward', 600);
  const reported = jp.doActivity(ward, 'address-notice');
  expect(reported.timeline.permanentResidence.evidence.addressNotices).toEqual([
    { eventOn: '2026-03-10', notifiedOn: '2026-03-10' },
  ]);
  expect(reported.flags).not.toContain('address-notice-due');
  // The quarter is assessed from its first day; the next one sees the move.
  const reportedLater = quarterLater(reported);
  expect(addressCheck(reportedLater)).toBe('MET');
  const unreported = quarterLater(moved);
  expect(addressCheck(unreported)).toBe('UNKNOWN');
  const late = jp.doActivity(visit(unreported, 'ward', 600), 'address-notice');
  expect(
    late.timeline.permanentResidence.evidence.addressNotices![0].notifiedOn,
  ).toBe(late.day.date);
  // The late notice joins the assessment next quarter, as the move did.
  expect(addressCheck(late)).toBe('UNKNOWN');
  expect(addressCheck(quarterLater(late))).toBe('NOT_MET');
});

test('a move made this quarter keeps the application closed until it is reported', () => {
  const state = settle(jp.newGame('engineer', 5, 'en'));
  state.date = '2034-06-01';
  state.day.date = '2034-06-13';
  state.timeline.permanentResidence.evidence.japaneseB1Confirmed = true;
  Object.assign(jp.status(state), {
    grantedPeriodMonths: values.longestPeriod.value.deemedMonths,
    expiresOn: '2036-03-31',
  });
  state.result = jp.jpRules.evaluate(state);
  const moved = jp.doActivity(visit(state, 'home', 480), 'rent-brighter-home');
  expect(moved.flags).toContain('address-notice-due');
  // The quarter is assessed from its first day, so the move is not in it yet.
  expect(addressCheck(moved)).toBe('MET');
  const ids = (state: State) =>
    jp.activities(visit(state, 'visa', 720), 'visa').map(({ id }) => id);
  expect(ids(moved)).not.toContain('settle');
  const reported = jp.doActivity(visit(moved, 'ward', 600), 'address-notice');
  expect(ids(reported)).toContain('settle');
});

test('moving is offered only while the ward office can take the notice that day', () => {
  const start = settle(jp.newGame('engineer', 5, 'en'));
  const at = (minute: number) => visit(start, 'home', minute);
  // Moving and reporting take an hour each; the ward office closes at 17:15.
  expect(homeActions(at(915))).toContain('rent-brighter-home');
  expect(homeActions(at(916))).not.toContain('rent-brighter-home');
  const weekend = visit(nextDay(start), 'home', 480);
  expect(weekend.day.kind).toBe('weekend');
  expect(homeActions(weekend)).not.toContain('rent-brighter-home');
  const moved = jp.doActivity(at(480), 'rent-brighter-home');
  expect(homeActions(moved)).toContain('leave-brighter-home');
  expect(
    homeActions(settle(jp.tick(moved, 916 - moved.day.minute))),
  ).not.toContain('leave-brighter-home');
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
  expect(jp.narrative(ended).map(({ zhCN }) => zhCN)).toContain(
    '文件夹越装越厚，下一段生活逐渐有了形状。',
  );
});

test('the diary casts a line on the Ōoka River, not at a pond', () => {
  const riverbank = visit(jp.newGame('engineer', 5, 'en'), 'pond', 600);
  const cast = jp.fish(riverbank, false);
  expect(cast.log.at(-1)).toMatchObject({
    id: 'fishing',
    text: { zhCN: '在大冈川抛竿', en: 'Cast at the Ōoka River' },
  });
  const diary = jp.narrative(cast);
  expect(diary.map(({ zhCN }) => zhCN).join('\n')).toContain(
    '大冈川抛竿 1 次。',
  );
  expect(diary.map(({ en }) => en).join('\n')).toContain(
    '1 cast at the Ōoka River',
  );
  expect(JSON.stringify(diary)).not.toMatch(/池塘|pond/);
});

test('a lapsed period of stay ends the story', () => {
  let state = settle(jp.newGame('spouse', 5, 'en'));
  jp.status(state).expiresOn = '2026-04-30';
  for (let i = 0; i < 6 && !jp.isOver(state); i++) state = nextDay(state);
  expect(state.ending).toBe('overstayed');
  // review111-3: the ending's assessment reflects the lapse.
  const checks = state.result!.columns[0].pathways.flatMap((p) => p.checks);
  const status = (id: string) => checks.find((c) => c.id === id)?.status;
  expect(status('jp.pr.lawful-filing-status')).toBe('NOT_MET');
  expect(status('jp.nat.lawful-domicile')).toBe('NOT_MET');
  for (const pathway of state.result!.columns[0].pathways)
    expect(pathway.status).toBe('NOT_MET');
});
