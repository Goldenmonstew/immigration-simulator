import { beforeAll, expect, test } from 'vitest';
import { evaluateSpainFull } from '@uk-immigration/engine';
import { spainFull2026_11 } from '@uk-immigration/policy-data';
import { addMonths } from '../src/calendar';
import * as es from '../src/packs/es';
import { esBalance } from '../src/packs/es/balance';

type State = ReturnType<typeof es.newGame>;
const values = spainFull2026_11.values;

beforeAll(async () => {
  for (const { id } of es.characters) await es.loadCharacter(id);
});

/** Take each event's first choice until nothing is pending. */
function settle(state: State) {
  while (state.pendingEvent)
    state = es.resolve(state, es.currentEvent(state)!.choices[0].id);
  return state;
}
/** Sleep through to the next playable day, answering events on the way. */
function nextDay(state: State) {
  const day = state.dayNumber;
  for (let i = 0; i < 8 && state.dayNumber === day; i++)
    state = settle(es.sleep(settle(state)));
  return state;
}
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
/** The nationality checks still open, among those that decide the route. */
function natGaps(state: State) {
  const nat = es.pathwayOf(state.result, 'nat')!;
  return nat.checks
    .filter(({ id, status }) => status !== 'MET' && nat.decidedBy?.includes(id))
    .map(({ id }) => id);
}
const ids = (state: State, place: string) =>
  es.activities(state, place).map(({ id }) => id);

test('each character opens on their own spring morning with a Spanish timeline', () => {
  const cook = es.newGame('cook', 5, 'en');
  expect(es.currentEvent(cook)?.id).toBe('opening-cook');
  expect([cook.date, cook.quarter, cook.day.date]).toEqual([
    '2026-03-01',
    2,
    '2026-03-10',
  ]);
  expect(cook.stats).toEqual({
    money: 5_200,
    mood: 66,
    health: 74,
    spanish: 44,
    career: 30,
  });
  expect(es.resolve(cook, 'study').stats.spanish).toBe(46);
  // The residence card runs to 2027-08-31: 17 whole months.
  expect(es.visaMonthsLeft(cook)).toBe(17);

  const exporter = es.newGame('exporter', 5, 'en');
  expect(es.currentEvent(exporter)?.id).toBe('opening-exporter');
  expect(es.visaMonthsLeft(exporter)).toBe(13);
  expect(es.townsfolk(exporter).map((npc) => npc.id)).toContain('lele');
  expect(es.townsfolk(cook).map((npc) => npc.id)).not.toContain('lele');
  expect(es.townsfolk(cook)).toHaveLength(7);
});

test('the Spanish rules engine sets the long-term residence and nationality bars', () => {
  const exporter = es.newGame('exporter', 5, 'zh-CN');
  expect(exporter.result.columns[0].id).toBe(spainFull2026_11.ruleSetId);
  expect(exporter.result.columns[0].pathways.map(({ id }) => id)).toEqual([
    'ES-LONG-TERM',
    'ES-NATIONALITY',
  ]);
  // Five years from the first permit on 2021-10-04 (SRC-083 art. 183.1).
  expect(es.progress(exporter).lt).toEqual({
    outcome: 'FUTURE',
    earliestDate: '2026-10-04',
    percent: 88,
  });
  expect(es.progress(exporter).nat.outcome).toBe('NOT_MET');

  // Two years for a Philippine national from 2024-09-02 (SRC-084 art. 22.1),
  // still missing the DELE A2, the CCSE and the legalised home papers.
  const cook = es.newGame('cook', 5, 'zh-CN');
  expect(es.progress(cook).nat).toEqual({
    outcome: 'NOT_MET',
    earliestDate: '2026-09-02',
    percent: 75,
  });
  expect(
    es
      .pathwayOf(cook.result, 'nat')!
      .checks.filter(({ status }) => status !== 'MET')
      .map(({ id }) => id),
  ).toEqual(
    expect.arrayContaining([
      'ES-N01',
      'ES-N10-RECORDS',
      'ES-N11',
      'ES-N12',
      'ES-N14',
    ]),
  );
  // Without renewals the card ends before five years of residence.
  expect(es.progress(cook).lt.outcome).toBe('NOT_MET');
});

test('the spring festival is the Fallas, with a mascletà in the square', () => {
  const state = nextDay(nextDay(es.newGame('cook', 5, 'en')));
  expect([state.day.kind, state.day.date, state.day.festival]).toEqual([
    'special',
    '2026-03-19',
    'falles',
  ]);
  expect(ids(visit(state, 'green', 600), 'green')).toEqual([
    'petanca',
    'festival',
  ]);
  const square = visit(state, 'green', 840);
  expect(ids(square, 'green')).toContain('mascleta');
  const watched = es.doActivity(square, 'mascleta');
  expect(watched.inventory.bunyols).toBe(1);
  expect(watched.flags).toContain('visited-festival:falles');
  expect(es.shop(watched, 'green').map(({ id }) => id)).toEqual(['bunyols']);
});

test('a JSON save round trip continues the same quarter after a trip', () => {
  const station = visit(es.newGame('exporter', 21, 'en'), 'station', 600);
  const state = settle(es.doActivity(station, 'travel-1'));
  expect(state.timeline.trips).toEqual([
    { departed: '2026-03-10', returned: '2026-04-10' },
  ]);
  expect([state.date, state.quarter]).toEqual(['2026-06-01', 3]);
  // A one-month absence keeps long-term residence on track.
  expect(es.progress(state).lt.outcome).toBe('FUTURE');
  const restored: State = JSON.parse(JSON.stringify(state));
  const quarterLater = (from: State) => {
    let next = from;
    for (let i = 0; i < 12 && next.date === from.date; i++)
      next = settle(es.sleep(next));
    return next;
  };
  const played = quarterLater(state);
  expect(played.date).toBe('2026-09-01');
  expect(quarterLater(restored)).toEqual(played);
});

test('steps taken in town carry their day and join the next quarter’s assessment', () => {
  const start = settle(es.newGame('cook', 5, 'en'));
  start.stats.spanish = 60;
  const answers = (state: State, date = state.date) =>
    es.filingAnswers(state.timeline, date).nationality;
  const moved = settle(
    es.doActivity(visit(start, 'home', 420), 'rent-brighter-home'),
  );
  const day = moved.day.date;
  expect([moved.date, day]).toEqual(['2026-03-01', '2026-03-10']);
  expect(moved.timeline.steps.moves).toEqual([{ movedOn: day }]);
  expect(moved.flags).toContain('padron-due');
  // The move comes after this quarter's assessment date.
  expect(answers(moved).documents?.address).toBe(true);
  expect(answers(moved, '2026-06-01').documents?.address).toBe(false);
  const ward = visit(moved, 'ward', 510);
  expect(ids(ward, 'ward')).toEqual(['padron', 'padron-certificate']);
  const registered = es.doActivity(ward, 'padron');
  expect(registered.timeline.steps.moves).toEqual([
    { movedOn: day, registeredOn: day },
  ]);
  expect(registered.flags).not.toContain('padron-due');
  expect(answers(registered, '2026-06-01').documents?.address).toBe(true);

  const registry = visit(registered, 'bureau', 600);
  expect(ids(registry, 'bureau')).toEqual(['nat-papers']);
  const papers = es.doActivity(registry, 'nat-papers');
  expect(papers.stats.money).toBe(registry.stats.money - 180);
  expect(papers.timeline.steps.papers).toBe(day);
  expect(ids(papers, 'bureau')).toEqual([]);

  const school = visit(papers, 'college', 700);
  expect(ids(school, 'college')).toEqual(['ccse', 'dele']);
  const ccse = es.doActivity(school, 'ccse');
  expect(ccse.stats.money).toBe(
    school.stats.money - values.nationalityCcseFee.value,
  );
  const dele = es.doActivity(ccse, 'dele');
  expect(dele.timeline.steps).toMatchObject({ ccse: day, dele: day });
  expect(ids(dele, 'college')).toEqual([]);
  // This quarter's assessment predates all three steps.
  expect(answers(dele)).toMatchObject({
    deleEvidence: 'none',
    ccse: { verifiedPass: false },
    documents: { birthRecord: false, foreignDocumentFormalities: false },
  });
  expect(es.progress(dele).nat.outcome).toBe('NOT_MET');
  // From the next quarter they count: only the residence period, met from
  // 2026-09-02, and the fee paid with the application are left.
  expect(answers(dele, '2026-06-01')).toMatchObject({
    deleEvidence: 'dele',
    deleLevel: 'A2',
    ccse: { verifiedPass: true, issued: day },
    criminalRecords: { originRecordOrLawfulAlternative: true },
    documents: {
      birthRecord: true,
      foreignDocumentFormalities: true,
      address: true,
    },
  });
  const next = at(dele, '2026-06-01');
  // The bar shows the time requirement's date, not just "not met".
  expect(es.progress(next).nat).toMatchObject({
    outcome: 'TIME_ONLY',
    earliestDate: '2026-09-02',
  });
  expect(natGaps(next)).toEqual(['ES-N01', 'ES-N15']);
});

test('a lease the balance cannot carry ends with a move to register', () => {
  const quarterLater = (from: State) => {
    let next = from;
    for (let i = 0; i < 12 && next.date === from.date; i++)
      next = settle(es.sleep(settle(next)));
    return next;
  };
  const n14 = (state: State) =>
    es.pathwayOf(state.result, 'nat')!.checks.find(({ id }) => id === 'ES-N14')!
      .status;
  const start = settle(es.newGame('cook', 5, 'en'));
  const moved = settle(
    es.doActivity(visit(start, 'home', 420), 'rent-brighter-home'),
  );
  const registered = es.doActivity(visit(moved, 'ward', 510), 'padron');
  const papers = es.doActivity(visit(registered, 'bureau', 600), 'nat-papers');
  // Below the reserve and next quarter's rent: the shared game ends the lease.
  papers.stats.money = 900;
  const next = quarterLater(papers);
  expect(next.date).toBe('2026-06-01');
  expect(next.flags).not.toContain('brighter-home');
  expect(next.timeline.steps.moves.at(-1)).toEqual({ movedOn: '2026-06-01' });
  expect(next.flags).toContain('padron-due');
  expect(
    es.filingAnswers(next.timeline, next.date).nationality.documents?.address,
  ).toBe(false);
  expect(n14(next)).toBe('NOT_MET');
  const lease = next.log.find(({ id }) => id === 'brighter-home-return')!;
  expect(lease.text.zhCN).toContain('带阳台的公寓');
  expect(lease.text.en).toContain('flat with a balcony');
  // Updating the padrón next quarter restores the address evidence.
  const ward = visit(next, 'ward', 510);
  const updated = es.doActivity(ward, 'padron');
  expect(updated.timeline.steps.moves.at(-1)).toEqual({
    movedOn: '2026-06-01',
    registeredOn: ward.day.date,
  });

  // Away on a long trip, the move is made when play resumes.
  const leaving = visit(papers, 'station', 900);
  leaving.stats.money = 900 + 6 * esBalance.travelCostPerMonth;
  const away = settle(es.doActivity(leaving, 'travel-6'));
  expect(away.date).toBe('2026-12-01');
  expect(away.timeline.steps.moves.at(-1)).toEqual({ movedOn: '2026-12-01' });
  expect(away.flags).toContain('padron-due');
});

test('a failed exam costs the fee and queues the result card', () => {
  const school = visit(settle(es.newGame('cook', 5, 'en')), 'college', 600);
  const failed = es.doActivity(school, 'ccse');
  expect(failed.stats.money).toBe(
    school.stats.money - values.nationalityCcseFee.value,
  );
  expect(failed.timeline.nationality.ccse).toEqual({ verifiedPass: false });
  expect(failed.pendingEvent ?? failed.eventQueue[0]).toBe(
    'system-exam-failed',
  );
});

test('a failed CCSE comes with a free retake within six months (SRC-335)', () => {
  const ccse = (state: State) =>
    es.activities(state, 'college').find(({ id }) => id === 'ccse');
  const school = visit(settle(es.newGame('cook', 5, 'en')), 'college', 600);
  const failed = es.doActivity(school, 'ccse');
  expect(failed.timeline.steps.ccseRetakeFrom).toBe('2026-03-10');
  // The weekend after: the retake is free, even with nothing in the bank.
  const weekend = visit(nextDay(failed), 'college', 600);
  expect(weekend.day.date).toBe('2026-03-14');
  weekend.stats.money = 0;
  const retake = ccse(weekend)!;
  expect(retake.label.zhCN).toContain('免费重考');
  expect(retake.label.zhCN).toContain(
    `${addMonths('2026-03-10', values.nationalityCcseRetakeMonths.value)} 前`,
  );
  expect(retake.label.en).toContain('free retake');
  const second = es.doActivity(weekend, 'ccse');
  expect(second.stats.money).toBe(0);
  expect(second.timeline.steps.ccseRetakeFrom).toBeUndefined();
  // A further sitting is a new, paid registration.
  second.stats.money = 500;
  const third = visit(nextDay(second), 'college', 600);
  expect(ccse(third)!.label.en).toContain(
    `fee €${values.nationalityCcseFee.value}`,
  );
  expect(es.doActivity(third, 'ccse').stats.money).toBe(
    third.stats.money - values.nationalityCcseFee.value,
  );
  // Past the window the retake is paid again.
  const late = structuredClone(weekend);
  late.day.date = addMonths('2026-03-10', 7);
  late.stats.money = 500;
  expect(ccse(late)!.label.en).not.toContain('free retake');
  late.stats.money = 0;
  expect(ccse(late)).toBeUndefined();
});

test('applying for nationality uses the engine’s assessment and the 790-026 fee', () => {
  let state = settle(es.newGame('cook', 5, 'en'));
  Object.assign(state.timeline.nationality, {
    deleEvidence: 'dele',
    deleLevel: 'A2',
    ccse: { verifiedPass: true, issued: '2026-06-01' },
  });
  state.timeline.nationality.criminalRecords!.originRecordOrLawfulAlternative = true;
  Object.assign(state.timeline.nationality.documents!, {
    birthRecord: true,
    foreignDocumentFormalities: true,
  });
  state = at(state, '2026-12-01');
  expect(natGaps(state)).toEqual(['ES-N15']);
  // The game reads the result exactly as the engine does on the filing day.
  expect(
    evaluateSpainFull({
      ...es.filingAnswers(state.timeline, state.date),
      simulationDate: state.date,
      locale: 'en',
    }),
  ).toEqual(state.result);
  // Joel files on the quarter's playable day, nine days later.
  state.day.date = '2026-12-10';
  const registry = visit(state, 'bureau', 600);
  expect(ids(registry, 'bureau')).toEqual(['naturalise']);
  const ended = es.doActivity(registry, 'naturalise');
  expect(ended.ending).toBe('settled');
  expect(ended.flags).toContain('applied-nat');
  expect(ended.stats.money).toBeCloseTo(
    registry.stats.money - values.nationalityApplicationFee.value,
  );
  expect(es.narrative(ended).at(-1)).toEqual(es.characterOf('cook').settlement);
  // The filing carries its day: the ending assesses that day, fee paid then.
  expect(ended.timeline.steps.filed).toBe('2026-12-10');
  expect(es.assessmentDate(ended)).toBe('2026-12-10');
  expect(
    es.filingAnswers(ended.timeline, es.assessmentDate(ended)).nationality
      .feePaidOn,
  ).toBe('2026-12-10');
  expect(ended.result).toEqual(
    evaluateSpainFull({
      ...es.filingAnswers(ended.timeline, '2026-12-10'),
      simulationDate: '2026-12-10',
      locale: 'en',
    }),
  );
});

test('the 790-026 fee counts as paid only once the application goes in', () => {
  let cook = settle(es.newGame('cook', 5, 'en'));
  Object.assign(cook.timeline.nationality, {
    deleEvidence: 'dele',
    deleLevel: 'A2',
    ccse: { verifiedPass: true, issued: '2026-06-01' },
  });
  cook.timeline.nationality.criminalRecords!.originRecordOrLawfulAlternative = true;
  Object.assign(cook.timeline.nationality.documents!, {
    birthRecord: true,
    foreignDocumentFormalities: true,
  });
  cook = at(cook, '2026-12-01');
  const answers = es.filingAnswers(cook.timeline, cook.date).nationality;
  expect(answers.feePaid).toBe(false);
  expect(answers.feePaidOn).toBeUndefined();
  // Everything else is in place: the fee is paid with the application.
  expect(es.pathwayOf(cook.result, 'nat')?.status).toBe('NOT_MET');
  expect(natGaps(cook)).toEqual(['ES-N15']);
  // The time requirement is already met: the engine dates it from today.
  expect(es.progress(cook).nat).toEqual({
    outcome: 'TIME_ONLY',
    earliestDate: '2026-12-01',
    percent: 100,
  });
  const registry = visit(cook, 'bureau', 600);
  expect(ids(registry, 'bureau')).toEqual(['naturalise']);
  const ended = es.doActivity(registry, 'naturalise');
  expect(es.progress(ended).nat.outcome).toBe('MET');
  expect(
    es.filingAnswers(ended.timeline, '2026-12-01').nationality,
  ).toMatchObject({ feePaid: true, feePaidOn: '2026-12-01' });
  expect(es.pathwayOf(ended.result, 'nat')?.status).toBe('MET');
  // Leaving instead, the result page sees no payment.
  const left = es.doActivity(visit(cook, 'station', 900), 'leave');
  expect(natGaps(left)).toEqual(['ES-N15']);
});

test('a filing is offered only if it can still be made on the day', () => {
  // Joel's card lapses between the assessment date and the playable day.
  let cook = settle(es.newGame('cook', 5, 'en'));
  Object.assign(cook.timeline.nationality, {
    deleEvidence: 'dele',
    deleLevel: 'A2',
    ccse: { verifiedPass: true, issued: '2026-06-01' },
  });
  cook.timeline.nationality.criminalRecords!.originRecordOrLawfulAlternative = true;
  Object.assign(cook.timeline.nationality.documents!, {
    birthRecord: true,
    foreignDocumentFormalities: true,
  });
  es.currentPermit(cook).to = '2026-12-05';
  cook = at(cook, '2026-12-01');
  expect(natGaps(cook)).toEqual(['ES-N15']);
  expect(ids(visit(cook, 'bureau', 600), 'bureau')).toEqual(['naturalise']);
  cook.day.date = '2026-12-10';
  expect(ids(visit(cook, 'bureau', 600), 'bureau')).toEqual([]);

  // Yutong's late filing window closes on 2027-06-05 (Saturday), so the
  // following Monday (SRC-083 art. 184.2).
  let exporter = settle(es.newGame('exporter', 5, 'en'));
  es.currentPermit(exporter).to = '2027-03-05';
  exporter = at(exporter, '2027-06-01');
  exporter.flags.push('cita-booked');
  expect(es.pathwayOf(exporter.result, 'lt')?.status).toBe('MET');
  exporter.day.date = '2027-06-07';
  expect(ids(visit(exporter, 'visa', 600), 'visa')).toEqual(['settle']);
  exporter.day.date = '2027-06-10';
  expect(ids(visit(exporter, 'visa', 600), 'visa')).toEqual([]);
});

test('long-term residence needs a cita previa and ends with its own text', () => {
  const state = at(settle(es.newGame('exporter', 5, 'en')), '2026-12-01');
  expect(es.pathwayOf(state.result, 'lt')?.status).toBe('MET');
  const office = visit(state, 'visa', 600);
  expect(ids(office, 'visa')).toEqual([]);
  let library = visit(state, 'library', 600);
  for (let i = 0; i < 20 && !library.flags.includes('cita-booked'); i++) {
    library = es.doActivity(library, 'cita-previa');
    library.day.done = library.day.done.filter((id) => id !== 'cita-previa');
  }
  expect(library.flags).toContain('cita-booked');
  const filing = visit(library, 'visa', 700);
  expect(ids(filing, 'visa')).toEqual(['settle']);
  const ended = es.doActivity(filing, 'settle');
  expect(ended.ending).toBe('settled');
  expect(ended.flags).toContain('applied-lt');
  expect(ended.stats.money).toBeCloseTo(
    filing.stats.money - values.applicationFeeEur.value,
  );
  expect(es.narrative(ended).at(-1)).toEqual(
    es.characterOf('exporter').settlement,
  );
});

test('a filing outside the character’s own route ends with that route’s text', () => {
  // Yutong files for nationality after ten years on a longer card.
  let exporter = settle(es.newGame('exporter', 5, 'en'));
  es.currentPermit(exporter).to = '2033-04-30';
  Object.assign(exporter.timeline.nationality, {
    deleEvidence: 'dele',
    deleLevel: 'A2',
    ccse: { verifiedPass: true, issued: '2031-06-01' },
  });
  exporter = at(exporter, '2031-12-01');
  expect(natGaps(exporter)).toEqual(['ES-N15']);
  const nat = es.doActivity(visit(exporter, 'bureau', 600), 'naturalise');
  expect(nat.ending).toBe('settled');
  const natText = es.narrative(nat).at(-1)!;
  expect(natText.en).toContain('The nationality application is in.');
  expect(natText).not.toEqual(es.characterOf('exporter').settlement);
  expect(nat.log.find(({ kind }) => kind === 'ending')?.text).toEqual(natText);

  // Joel files for long-term residence after five years on a longer card.
  let cook = settle(es.newGame('cook', 5, 'en'));
  es.currentPermit(cook).to = '2030-08-31';
  cook = at(cook, '2029-12-01');
  cook.flags.push('cita-booked');
  expect(es.pathwayOf(cook.result, 'lt')?.status).toBe('MET');
  const lt = es.doActivity(visit(cook, 'visa', 600), 'settle');
  expect(lt.ending).toBe('settled');
  const ltText = es.narrative(lt).at(-1)!;
  expect(ltText.en).toContain(
    'The long-term residence application is accepted.',
  );
  expect(ltText).not.toEqual(es.characterOf('cook').settlement);
  expect(lt.log.find(({ kind }) => kind === 'ending')?.text).toEqual(ltText);
});

test('the diary casts a line off the breakwater, not at a pond', () => {
  const breakwater = visit(es.newGame('cook', 5, 'en'), 'pond', 600);
  const cast = es.fish(breakwater, false);
  expect(cast.log.at(-1)).toMatchObject({
    id: 'fishing',
    text: { zhCN: '在防波堤抛竿', en: 'Cast at the breakwater' },
  });
  const diary = es.narrative(cast);
  expect(diary.map(({ zhCN }) => zhCN).join('\n')).toContain(
    '防波堤抛竿 1 次。',
  );
  expect(diary.map(({ en }) => en).join('\n')).toContain(
    '1 cast at the breakwater',
  );
  expect(JSON.stringify(diary)).not.toMatch(/池塘|pond/);
});

test('the card’s lapse counts from the day being played', () => {
  // 2026-04-05 is less than a month after the playable day 2026-03-10.
  const fresh = settle(es.newGame('cook', 5, 'en'));
  es.currentPermit(fresh).to = '2026-04-05';
  expect(fresh.day.date).toBe('2026-03-10');
  expect(es.visaMonthsLeft(fresh)).toBe(0);

  // Joel's card runs out on 2026-12-05, between the quarter's assessment
  // date and its playable day.
  let cook = settle(es.newGame('cook', 5, 'en'));
  Object.assign(cook.timeline.nationality, {
    deleEvidence: 'dele',
    deleLevel: 'A2',
    ccse: { verifiedPass: true, issued: '2026-06-01' },
  });
  cook.timeline.nationality.criminalRecords!.originRecordOrLawfulAlternative = true;
  Object.assign(cook.timeline.nationality.documents!, {
    birthRecord: true,
    foreignDocumentFormalities: true,
  });
  es.currentPermit(cook).to = '2026-12-05';
  cook = at(cook, '2026-12-01');
  expect(es.assessmentDate(cook)).toBe('2026-12-01');
  cook.day.date = '2026-12-10';
  expect(es.assessmentDate(cook)).toBe('2026-12-10');
  expect(es.pathwayOf(es.currentResult(cook), 'nat')?.status).toBe('NOT_MET');
  expect(es.progress(cook).nat.outcome).toBe('NOT_MET');
});

test('a trip ending this quarter counts when the lapsed card is checked', () => {
  const exporter = at(settle(es.newGame('exporter', 5, 'en')), '2027-06-01');
  expect(es.esRules.expired!(structuredClone(exporter), '2027-03-01')).toBe(
    false,
  );
  // Back at this quarter's start from eight months away (SRC-083 art. 183.2).
  const back = structuredClone(exporter);
  back.trip = { from: '2026-10-01', to: '2027-06-01' };
  expect(es.esRules.expired!(back, '2027-03-01')).toBe(true);
});

test('the late filing window closes on the next working day after a weekend', () => {
  // Three months after 2026-11-28 is Sunday 2027-02-28, so Monday 2027-03-01.
  const cook = settle(es.newGame('cook', 5, 'en'));
  es.currentPermit(cook).to = '2026-11-28';
  const quarter = at(cook, '2027-03-01');
  expect(es.esRules.expired!(quarter, '2026-12-01')).toBe(true);
  expect(quarter.timeline.residence.filingWindowAccepted).toBeUndefined();
  expect(es.lateFilingDeadline('2026-11-28')).toBe('2027-03-01');
});

test('a trip leaves a working day to apply before the card ends', () => {
  // Yutong's card ends on 2027-04-30. Leaving on 2026-12-08, a three-month
  // trip is back on 2027-03-08, after the 2027-03 quarter has begun: play
  // resumes in the 2027-06 quarter, past the card.
  const exporter = at(settle(es.newGame('exporter', 5, 'en')), '2026-12-01');
  exporter.day.date = '2026-12-08';
  const station = ids(visit(exporter, 'station', 600), 'station');
  expect(station).toContain('travel-1');
  expect(station).not.toContain('travel-3');
  expect(station).not.toContain('travel-6');
});

test('wording keeps policy figures sourced and the fees as the game charges them', () => {
  // The residence years come from policy-data (SRC-083 art. 183.1).
  const years = values.longTermYears.value;
  const exporter = es.characters.find(({ id }) => id === 'exporter')!;
  expect(exporter.intro.zhCN).toContain(`居留满 ${years} 年后`);
  expect(exporter.intro.en).toContain(`After ${years} years of residence`);
  // Sergi no longer claims the 790-026 is never refunded: no source says so.
  const sergi = JSON.stringify(es.npcs.find(({ id }) => id === 'sergi'));
  expect(sergi).not.toMatch(/不退|refunded/);
  // The game charges the long-term residence fee when the application goes in.
  const office = visit(
    {
      ...at(settle(es.newGame('exporter', 5, 'en')), '2026-12-01'),
      flags: ['cita-booked'],
    },
    'visa',
    600,
  );
  const apply = es
    .activities(office, 'visa')
    .find(({ id }) => id === 'settle')!;
  expect(apply.note?.zhCN).toContain('游戏在递交时一并扣除');
  expect(apply.note?.en).toContain('charges it when you apply');
});

test('a lapsed card ends the story unless long-term residence can still be filed', () => {
  const exporter = settle(es.newGame('exporter', 5, 'en'));
  // Within three months of the 2027-04-30 expiry (SRC-083 art. 184.2).
  expect(es.esRules.expired!(at(exporter, '2027-06-01'), '2027-03-01')).toBe(
    false,
  );
  expect(es.esRules.expired!(at(exporter, '2027-09-01'), '2027-06-01')).toBe(
    true,
  );
  let cook = settle(es.newGame('cook', 5, 'en'));
  es.currentPermit(cook).to = '2026-04-30';
  for (let i = 0; i < 6 && !es.isOver(cook); i++) cook = nextDay(cook);
  expect(cook.ending).toBe('overstayed');
  // review111-3: the ending's assessment reflects the lapse. Within the late
  // window long-term residence already fails on Joel's short residence.
  for (const pathway of cook.result.columns[0].pathways)
    expect(pathway.status).toBe('NOT_MET');
  expect(cook.timeline.residence.filingWindowAccepted).toBeUndefined();

  // Past the late window nothing can be filed any more.
  let lapsed = at(exporter, '2027-06-01');
  for (let i = 0; i < 6 && !es.isOver(lapsed); i++) lapsed = nextDay(lapsed);
  expect([lapsed.ending, lapsed.date]).toEqual(['overstayed', '2027-09-01']);
  expect(lapsed.timeline.residence.filingWindowAccepted).toBe(false);
  const lt = es.pathwayOf(lapsed.result, 'lt')!;
  for (const id of ['ES-L11', 'ES-L01-PERMIT'])
    expect(lt.checks.find((check) => check.id === id)?.status, id).toBe(
      'NOT_MET',
    );
  for (const pathway of lapsed.result.columns[0].pathways)
    expect(pathway.status).toBe('NOT_MET');
});
