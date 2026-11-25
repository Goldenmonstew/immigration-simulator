import { beforeAll, expect, test } from 'vitest';
import { evaluateGermanyFull } from '@uk-immigration/engine';
import { germanyFull2026_11 } from '@uk-immigration/policy-data';
import * as de from '../src/packs/de';

type State = ReturnType<typeof de.newGame>;
const values = germanyFull2026_11.values;

beforeAll(async () => {
  for (const { id } of de.characters) await de.loadCharacter(id);
});

/** Take each event's first choice until nothing is pending. */
function settle(state: State) {
  while (state.pendingEvent)
    state = de.resolve(state, de.currentEvent(state)!.choices[0].id);
  return state;
}
/** Sleep through to the next playable day, answering events on the way. */
function nextDay(state: State) {
  const day = state.dayNumber;
  for (let i = 0; i < 8 && state.dayNumber === day; i++)
    state = settle(de.sleep(settle(state)));
  return state;
}
/** Sleep on to the first day of the next quarter. */
function quarterLater(from: State) {
  let next = from;
  for (let i = 0; i < 12 && next.date === from.date; i++)
    next = settle(de.sleep(next));
  return next;
}
/** Walk to an open place at a given time, as the town map would. */
function visit(state: State, place: string, minute: number) {
  state = settle(state);
  if (state.day.minute < minute)
    state = settle(de.tick(state, minute - state.day.minute));
  return settle(de.enter(state, place));
}
const pathway = (state: State, column: de.DeColumn) =>
  de.pathwayOf(state.result, state.timeline, column)!;
const ids = (state: State, place: string) =>
  de.activities(state, place).map(({ id }) => id);
/** B1 and a Leben in Deutschland result, as the exams record them. */
function certified(state: State, correct = 20) {
  state.timeline.common.provenGerman = 'B1';
  state.timeline.citizenship.germanEvidence = 'B1';
  state.timeline.common.orientationScore = correct;
  state.timeline.citizenship.knowledge = { kind: 'lid', correct };
  state.flags.push('german-b1');
  state.result = de.deRules.evaluate(state);
  return state;
}

test('each character opens on their own spring morning with a German timeline', () => {
  const card = de.newGame('bluecard', 5, 'en');
  expect(de.currentEvent(card)?.id).toBe('opening-bluecard');
  expect([card.date, card.quarter, card.day.date]).toEqual([
    '2026-03-01',
    2,
    '2026-03-10',
  ]);
  expect(card.stats).toEqual({
    money: 15_000,
    mood: 64,
    health: 72,
    german: 36,
    career: 32,
  });
  expect(de.resolve(card, 'walk').stats.mood).toBe(68);

  const spouse = de.newGame('spouse', 5, 'en');
  expect(de.currentEvent(spouse)?.id).toBe('opening-spouse');
  expect(de.townsfolk(spouse).map((npc) => npc.id)).toContain('lena');
  expect(de.townsfolk(card).map((npc) => npc.id)).not.toContain('lena');
  expect(de.townsfolk(card).filter((npc) => !npc.characters)).toHaveLength(8);
  expect(de.visaMonthsLeft(card)).toBe(34);
  expect(de.visaMonthsLeft(spouse)).toBe(23);
});

test('the German rules engine assesses each route and sets the progress bars', () => {
  const card = de.newGame('bluecard', 5, 'zh-CN');
  expect(card.result.columns[0].id).toBe(germanyFull2026_11.ruleSetId);
  expect(card.result.columns[0].pathways.map(({ id }) => id)).toEqual([
    'DE-R03',
    'DE-R07',
  ]);
  // 27 months of Blue Card work without B1 (SRC-100 § 18c Abs. 2).
  expect(de.progress(card).settle).toEqual({
    outcome: 'NOT_MET',
    earliestDate: '2027-05-01',
    percent: 49,
  });
  // The card ends before five years of residence (SRC-101 § 10 Abs. 1).
  expect(de.progress(card).nat).toEqual({ outcome: 'NOT_MET', percent: 0 });

  const spouse = de.newGame('spouse', 5, 'zh-CN');
  expect(spouse.result.columns[0].pathways.map(({ id }) => id)).toEqual([
    'DE-R04',
    'DE-R08',
  ]);
  // Three years on the family permit (SRC-100 § 28 Abs. 2) and three years'
  // residence with two years' marriage (SRC-101 § 9).
  expect(de.progress(spouse).settle).toMatchObject({
    outcome: 'NOT_MET',
    earliestDate: '2027-03-01',
  });
  expect(de.progress(spouse).nat).toMatchObject({
    outcome: 'NOT_MET',
    earliestDate: '2027-03-01',
  });
});

test('the B1 exam and the Leben in Deutschland test go into the assessment', () => {
  const weekend = nextDay(settle(de.newGame('bluecard', 5, 'en')));
  expect(weekend.day.kind).toBe('weekend');
  weekend.stats.german = 50;
  const college = visit(weekend, 'college', 600);
  expect(ids(college, 'college')).toEqual(
    expect.arrayContaining(['exam', 'orientation-test']),
  );
  // 50 points answer 16 questions: enough for settlement, not naturalisation.
  const tested = de.doActivity(college, 'orientation-test');
  expect(tested.stats.money).toBe(
    college.stats.money - values.externalOrientationFee.value,
  );
  expect(tested.timeline.common.orientationScore).toBe(16);
  expect(tested.timeline.citizenship.knowledge).toEqual({
    kind: 'lid',
    correct: 16,
  });
  const check = (state: State, column: de.DeColumn, id: string) =>
    pathway(state, column).checks.find((c) => c.id === id)!.status;
  expect(check(tested, 'settle', 'DE-C09')).toBe('MET');
  expect(check(tested, 'nat', 'DE-C51')).toBe('NOT_MET');

  const failed = de.doActivity(college, 'exam');
  expect(failed.timeline.common.provenGerman).toBe('A2');
  expect([failed.pendingEvent, ...failed.eventQueue]).toContain(
    'system-exam-failed',
  );
  const ready = structuredClone(college);
  ready.stats.german = 60;
  const passed = de.doActivity(ready, 'exam');
  expect(passed.timeline.common.provenGerman).toBe('B1');
  expect(passed.timeline.citizenship.germanEvidence).toBe('B1');
  expect(ids(passed, 'college')).not.toContain('exam');
  // With B1 the Blue Card needs 21 months (SRC-100 § 18c Abs. 2 Satz 3).
  expect(de.progress(passed).settle).toMatchObject({
    earliestDate: '2026-11-01',
  });
});

test('the spring festival is May Day on the market square, with Bratwurst and a diary flag', () => {
  const state = nextDay(nextDay(de.newGame('bluecard', 5, 'en')));
  expect([state.day.kind, state.day.date, state.day.festival]).toEqual([
    'special',
    '2026-05-01',
    'maifest',
  ]);
  const square = visit(state, 'green', 600);
  expect(ids(square, 'green')).toEqual(['festival', 'maibaum']);
  const maypole = de.doActivity(square, 'maibaum');
  expect(maypole.inventory.bratwurst).toBe(1);
  expect(maypole.flags).toContain('visited-festival:maifest');
  expect(de.shop(maypole, 'green').map(({ id }) => id)).toEqual(['bratwurst']);
});

test('a quarter of Blue Card work counts, months abroad do not, and a save round trip continues', () => {
  const start = settle(de.newGame('bluecard', 21, 'en'));
  expect(quarterLater(start).timeline.blueCardEmploymentMonths).toBe(16);
  const station = visit(start, 'station', 600);
  // The month abroad runs to the end of the quarter, then returns home.
  const state = settle(de.doActivity(station, 'travel-1'));
  expect(state.timeline.trips).toEqual([
    { departed: '2026-03-10', returned: '2026-04-10' },
  ]);
  expect(state.timeline.mobility.titles[0].trips).toEqual([
    {
      departed: '2026-03-10',
      returned: '2026-04-10',
      nonTemporary: false,
      exception: 'none',
    },
  ]);
  expect([state.date, state.quarter]).toEqual(['2026-06-01', 3]);
  expect(state.timeline.blueCardEmploymentMonths).toBe(15);
  expect(
    pathway(state, 'settle').checks.find(({ id }) => id === 'DE-C63-current')
      ?.status,
  ).toBe('MET');
  const restored: State = JSON.parse(JSON.stringify(state));
  const played = quarterLater(state);
  expect(played.date).toBe('2026-09-01');
  expect(played.timeline.blueCardEmploymentMonths).toBe(18);
  expect(quarterLater(restored)).toEqual(played);
});

test('housing has no invented local minimum, so the office checks the local standard', () => {
  for (const { id } of de.characters)
    expect(de.newGame(id, 5, 'en').timeline.common.housing).toEqual({
      usableM2: 48,
      qualityAndOccupancyConfirmed: true,
    });
  const state = certified(settle(de.newGame('bluecard', 5, 'en')));
  state.date = '2026-12-01';
  state.timeline.blueCardEmploymentMonths = 22;
  state.result = de.deRules.evaluate(state);
  const settlement = pathway(state, 'settle');
  // Without a local minimum the engine leaves housing pending (PD-348).
  expect(settlement.status).toBe('UNKNOWN');
  expect(settlement.checks.find(({ id }) => id === 'DE-C10')!.status).toBe(
    'UNKNOWN',
  );
  expect(de.officePending(state)).toEqual(['DE-C10']);
  const apply = de
    .activities(visit(state, 'visa', 600), 'visa')
    .find(({ id }) => id === 'settle')!;
  expect(apply.label.en).toContain('local housing standard');
  expect(apply.note?.en).toContain('PD-348');
});

test('settling uses the engine’s assessment and the scheduled fee', () => {
  const state = certified(settle(de.newGame('bluecard', 5, 'en')));
  state.date = '2026-12-01';
  state.timeline.blueCardEmploymentMonths = 22;
  state.result = de.deRules.evaluate(state);
  // Everything but the local housing standard is met (see the housing test).
  expect(de.officePending(state)).toEqual(['DE-C10']);
  const office = visit(state, 'visa', 600);
  const apply = de
    .activities(office, 'visa')
    .find(({ id }) => id === 'settle')!;
  const fee = values.settlementFees.value.general;
  expect(
    evaluateGermanyFull({
      ...state.timeline,
      simulationDate: state.date,
      locale: 'en',
    }).columns[0].pathways[0].checks.find(({ id }) => id === 'DE-C65')!
      .explanation,
  ).toContain(`€${fee.toFixed(2)}`);
  expect(apply.label.en).toContain(`€${fee}`);
  const ended = de.doActivity(office, 'settle');
  expect(ended.ending).toBe('settled');
  expect(ended.stats.money).toBe(office.stats.money - fee);
  expect(de.narrative(ended).at(-1)).toEqual(
    de.characterOf('bluecard').settlement,
  );

  state.stats.money = fee - 1;
  expect(ids(visit(state, 'visa', 600), 'visa')).not.toContain('settle');
});

test('a year without a published Blue Card pay threshold leaves that check to the office too', () => {
  const state = certified(settle(de.newGame('bluecard', 5, 'en')));
  state.date = '2027-03-01';
  state.timeline.blueCardEmploymentMonths = 25;
  state.result = de.deRules.evaluate(state);
  const settlement = pathway(state, 'settle');
  expect(settlement.status).toBe('UNKNOWN');
  expect(settlement.checks.find(({ id }) => id === 'DE-C21-pay')!.status).toBe(
    'UNKNOWN',
  );
  expect(de.officePending(state)).toEqual(['DE-C10', 'DE-C21-pay']);
  expect(de.progress(state).settle).toEqual({
    outcome: 'UNKNOWN',
    percent: 100,
  });
  const office = visit(state, 'visa', 600);
  const apply = de
    .activities(office, 'visa')
    .find(({ id }) => id === 'settle')!;
  expect(apply.label.en).toContain(
    'the local housing standard and this year’s Blue Card pay threshold',
  );
  expect(apply.note?.en).toContain('PD-350');
  // Any other open requirement keeps the window closed.
  state.timeline.common.orientationScore = undefined;
  state.timeline.citizenship.knowledge = { kind: 'none' };
  state.result = de.deRules.evaluate(state);
  expect(de.officePending(state)).toBeUndefined();
  expect(ids(visit(state, 'visa', 600), 'visa')).not.toContain('settle');
});

test('applying for naturalisation ends with the naturalisation text', () => {
  const state = certified(settle(de.newGame('spouse', 5, 'zh-CN')));
  state.date = '2027-03-01';
  state.result = de.deRules.evaluate(state);
  expect(pathway(state, 'settle').status).toBe('MET');
  expect(pathway(state, 'nat').status).toBe('MET');
  const office = visit(state, 'bureau', 600);
  const fee = values.naturalisationFees.value.standard;
  const ended = de.doActivity(office, 'naturalise');
  expect(ended.ending).toBe('settled');
  expect(ended.stats.money).toBe(office.stats.money - fee);
  const text = de.narrative(ended).at(-1)!;
  expect(text.zhCN).toContain('入籍申请递进了入籍科');
  expect(text).not.toEqual(de.characterOf('spouse').settlement);
  expect(ended.log.find(({ kind }) => kind === 'ending')?.text).toEqual(text);
});

/** The Blue Card at the office in March 2028, ten months before it ends. */
function beforeExpiry(dayDate = '2028-03-14') {
  const state = settle(de.newGame('bluecard', 5, 'en'));
  state.date = `${dayDate.slice(0, 7)}-01`;
  state.day.date = dayDate;
  state.result = de.deRules.evaluate(state);
  return visit(state, 'visa', 600);
}

test('a Blue Card extension is filed, not granted: the card continues under § 81 Abs. 4', () => {
  const fee = values.extensionFee.value;
  // More than the game's window (12 months) before the card ends.
  expect(ids(beforeExpiry('2027-12-14'), 'visa')).not.toContain('extend');
  const office = beforeExpiry();
  expect(de.visaMonthsLeft(office)).toBe(10);
  const extend = de
    .activities(office, 'visa')
    .find(({ id }) => id === 'extend')!;
  expect(extend.label.en).toContain(`€${fee}`);
  const filed = de.doActivity(office, 'extend');
  expect(filed.stats.money).toBe(office.stats.money - fee);
  // Only the application is recorded, on the day; no new card or date.
  expect(filed.timeline.permits).toEqual([
    {
      kind: 'blue-card',
      from: '2025-01-15',
      to: '2029-01-14',
      renewing: true,
    },
  ]);
  expect(filed.timeline.mobility.titles).toHaveLength(1);
  expect(filed.timeline.mobility.titles[0].continuingUnder81).toBe(true);
  expect(filed.timeline.mobility.blueCard!.applicationOn).toBe('2028-03-14');
  expect(filed.log.at(-1)?.renewalValidTo).toBeUndefined();
  expect(ids(filed, 'visa')).not.toContain('extend');
  // The quarter is assessed from its first day: the application joins next quarter.
  expect(de.timelineOn(filed.timeline, filed.date)).toEqual(office.timeline);
  const next = quarterLater(filed);
  expect(de.timelineOn(next.timeline, next.date).permits[0].renewing).toBe(
    true,
  );
  // With too little money for the fee there is no application.
  const poor = structuredClone(office);
  poor.stats.money = fee - 1;
  expect(ids(poor, 'visa')).not.toContain('extend');
});

test('while the extension is pending the card does not lapse', () => {
  let state = de.doActivity(beforeExpiry('2028-12-14'), 'extend');
  for (let i = 0; i < 6 && state.date < '2029-03-01'; i++)
    state = nextDay(state);
  expect(state.date).toBe('2029-03-01');
  expect(state.ending).toBeUndefined();
  expect(de.visaMonthsLeft(state)).toBe(0);
  const checks = pathway(state, 'settle').checks;
  expect(checks.find(({ id }) => id === 'DE-C63-current')!.status).toBe('MET');
});

test('after five years under the pending extension, naturalisation waits only for the office', () => {
  const filed = certified(de.doActivity(beforeExpiry(), 'extend'));
  filed.date = '2030-03-01';
  filed.day.date = '2030-03-12';
  filed.result = de.deRules.evaluate(filed);
  const nat = pathway(filed, 'nat');
  // Whether the waiting period counts depends on the renewal (PD-124).
  expect(nat.status).toBe('UNKNOWN');
  expect(de.officePending(filed, 'nat')).toEqual(['DE-C55']);
  expect(de.progress(filed).nat.percent).toBe(100);
  const bureau = visit(filed, 'bureau', 600);
  const apply = de
    .activities(bureau, 'bureau')
    .find(({ id }) => id === 'naturalise')!;
  expect(apply.note?.en).toContain('PD-124');
  const ended = de.doActivity(bureau, 'naturalise');
  expect(ended.ending).toBe('settled');
  expect(de.narrative(ended).at(-1)!.en).toContain('naturalisation');
  // Without the pending extension that check is not left to the office.
  const lapsed = structuredClone(filed);
  delete lapsed.timeline.permits[0].renewing;
  lapsed.result = de.deRules.evaluate(lapsed);
  expect(de.officePending(lapsed, 'nat')).toBeUndefined();
});

test('the annual review never lowers the Blue Card salary', () => {
  const review = (gross: number) => {
    const state = settle(de.newGame('bluecard', 5, 'en'));
    state.timeline.mobility.blueCard!.countableAnnualGross = gross;
    state.pendingEvent = 'bc-review';
    return de.resolve(state, 'thanks').timeline.mobility.blueCard!
      .countableAnnualGross;
  };
  // After two promotions (×1.04 each) the letter's raise must not cut pay.
  expect(review(69_222)).toBe(69_222);
  expect(review(64_000)).toBe(68_000);
});

test('the registration certificate says the address stays registered throughout', () => {
  const ward = visit(de.newGame('bluecard', 5, 'en'), 'ward', 600);
  const certificate = de
    .activities(ward, 'ward')
    .find(({ id }) => id === 'ward-certificate')!;
  expect(certificate.note?.zhCN).toContain('本局住址一直按已登记计');
  expect(certificate.note?.en).toContain(
    'your address counts as registered throughout',
  );
});

test('the diary casts a line on the Lindenkanal, not at a pond', () => {
  const bank = visit(de.newGame('bluecard', 5, 'en'), 'pond', 600);
  const cast = de.fish(bank, false);
  expect(cast.log.at(-1)).toMatchObject({
    id: 'fishing',
    text: { zhCN: '在林登运河抛竿', en: 'Cast at the Lindenkanal' },
  });
  expect(JSON.stringify(de.narrative(cast))).not.toMatch(/池塘|pond/);
});

test('an expired permit ends the story and the ending assessment shows it', () => {
  let state = settle(de.newGame('spouse', 5, 'en'));
  de.currentPermit(state).to = '2026-04-30';
  for (let i = 0; i < 6 && !de.isOver(state); i++) state = nextDay(state);
  expect(state.ending).toBe('overstayed');
  const checks = state.result.columns[0].pathways.flatMap((p) => p.checks);
  const status = (id: string) => checks.find((c) => c.id === id)?.status;
  expect(status('DE-C63-current')).toBe('NOT_MET');
  expect(status('DE-C47')).toBe('NOT_MET');
  for (const pathway of state.result.columns[0].pathways)
    expect(pathway.status).toBe('NOT_MET');
});
