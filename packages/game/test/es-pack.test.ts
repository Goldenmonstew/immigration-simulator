import { beforeAll, expect, test } from 'vitest';
import { evaluateSpainFull } from '@uk-immigration/engine';
import { spainFull2026_11 } from '@uk-immigration/policy-data';
import * as es from '../src/packs/es';

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
/** Move a saved game to a later quarter start and re-run the assessment. */
function at(state: State, date: string) {
  const next = structuredClone(state);
  next.date = date;
  next.result = es.esRules.evaluate(next);
  return next;
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

test('the padrón, papers and exams feed the nationality assessment', () => {
  const start = settle(es.newGame('cook', 5, 'en'));
  start.stats.spanish = 60;
  const n14 = (state: State) =>
    es.pathwayOf(state.result, 'nat')!.checks.find(({ id }) => id === 'ES-N14')!
      .status;
  const moved = settle(
    es.doActivity(visit(start, 'home', 420), 'rent-brighter-home'),
  );
  expect(moved.timeline.nationality.documents?.address).toBe(false);
  expect(moved.flags).toContain('padron-due');
  const ward = visit(moved, 'ward', 510);
  expect(ids(ward, 'ward')).toEqual(['padron', 'padron-certificate']);
  const registered = es.doActivity(ward, 'padron');
  expect(registered.timeline.nationality.documents?.address).toBe(true);
  expect(registered.flags).not.toContain('padron-due');

  const registry = visit(registered, 'bureau', 600);
  expect(n14(registry)).toBe('NOT_MET');
  expect(ids(registry, 'bureau')).toEqual(['nat-papers']);
  const papers = es.doActivity(registry, 'nat-papers');
  expect(papers.stats.money).toBe(registry.stats.money - 180);
  expect(n14(papers)).toBe('MET');
  expect(ids(papers, 'bureau')).toEqual([]);

  const school = visit(papers, 'college', 700);
  expect(ids(school, 'college')).toEqual(['ccse', 'dele']);
  const ccse = es.doActivity(school, 'ccse');
  expect(ccse.stats.money).toBe(
    school.stats.money - values.nationalityCcseFee.value,
  );
  expect(ccse.timeline.nationality.ccse).toEqual({
    verifiedPass: true,
    issued: '2026-03-01',
  });
  const dele = es.doActivity(ccse, 'dele');
  expect(dele.timeline.nationality).toMatchObject({
    deleEvidence: 'dele',
    deleLevel: 'A2',
  });
  expect(ids(dele, 'college')).toEqual([]);
  // Only the residence period is left: met from 2026-09-02.
  expect(es.progress(dele).nat).toMatchObject({
    outcome: 'FUTURE',
    earliestDate: '2026-09-02',
  });
});

test('a failed exam costs the fee and queues the result card', () => {
  const school = visit(settle(es.newGame('cook', 5, 'en')), 'college', 600);
  const failed = es.doActivity(school, 'ccse');
  expect(failed.timeline.nationality.ccse).toEqual({ verifiedPass: false });
  expect(failed.pendingEvent ?? failed.eventQueue[0]).toBe(
    'system-exam-failed',
  );
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
  expect(es.pathwayOf(state.result, 'nat')?.status).toBe('MET');
  // The game reads the result exactly as the engine does on the filing day.
  expect(
    evaluateSpainFull({
      ...es.filingAnswers(state.timeline, state.date),
      simulationDate: state.date,
      locale: 'en',
    }),
  ).toEqual(state.result);
  const registry = visit(state, 'bureau', 600);
  expect(ids(registry, 'bureau')).toEqual(['naturalise']);
  const ended = es.doActivity(registry, 'naturalise');
  expect(ended.ending).toBe('settled');
  expect(ended.flags).toContain('applied-nat');
  expect(ended.stats.money).toBeCloseTo(
    registry.stats.money - values.nationalityApplicationFee.value,
  );
  expect(es.narrative(ended).at(-1)).toEqual(es.characterOf('cook').settlement);
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
  expect(es.pathwayOf(exporter.result, 'nat')?.status).toBe('MET');
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
