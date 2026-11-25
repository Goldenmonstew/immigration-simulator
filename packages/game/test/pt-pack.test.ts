import { beforeAll, expect, test } from 'vitest';
import { evaluatePortugalFull } from '@uk-immigration/engine';
import {
  portugal2026_11,
  portugalFull2026_11,
} from '@uk-immigration/policy-data';
import { addDays, firstWeekday } from '../src/calendar';
import * as pt from '../src/packs/pt';

type State = ReturnType<typeof pt.newGame>;
const fees = portugalFull2026_11.values;

beforeAll(async () => {
  for (const { id } of pt.characters) await pt.loadCharacter(id);
});

/** Take each event's first choice until nothing is pending. */
function settle(state: State) {
  while (state.pendingEvent)
    state = pt.resolve(state, pt.currentEvent(state)!.choices[0].id);
  return state;
}
/** Sleep through to the next playable day, answering events on the way. */
function nextDay(state: State) {
  const day = state.dayNumber;
  for (let i = 0; i < 8 && state.dayNumber === day; i++)
    state = settle(pt.sleep(settle(state)));
  return state;
}
/** Sleep on to the first day of the next quarter. */
function quarterLater(from: State) {
  let next = from;
  for (let i = 0; i < 12 && next.date === from.date; i++)
    next = settle(pt.sleep(next));
  return next;
}
/** Walk to an open place at a given time, as the town map would. */
function visit(state: State, place: string, minute: number) {
  state = settle(state);
  if (state.day.minute < minute)
    state = settle(pt.tick(state, minute - state.day.minute));
  return settle(pt.enter(state, place));
}
/** The game on a later assessment date and its workday, re-evaluated. */
function on(state: State, date: string) {
  state.date = date;
  if (state.day.kind === 'workday')
    state.day.date = firstWeekday(addDays(date, 7), 2);
  state.result = pt.ptRules.evaluate(state);
  return state;
}
const checks = (state: State, column: pt.PtColumn) =>
  Object.fromEntries(
    pt.pathwayOf(state, column)!.checks.map(({ id, status }) => [id, status]),
  );

test('each character opens on their own spring morning in Andorinhas', () => {
  const worker = pt.newGame('worker', 5, 'en');
  expect(pt.currentEvent(worker)?.id).toBe('opening-worker');
  expect([worker.date, worker.quarter, worker.day.date]).toEqual([
    '2026-03-01',
    2,
    '2026-03-10',
  ]);
  expect(worker.stats).toEqual({
    money: 9_000,
    mood: 64,
    health: 72,
    portuguese: 36,
    career: 32,
  });
  expect(pt.resolve(worker, 'walk').stats.mood).toBe(68);
  // The card runs to 2028-09-19.
  expect(pt.visaMonthsLeft(worker)).toBe(30);

  const partner = pt.newGame('partner', 5, 'en');
  expect(pt.currentEvent(partner)?.id).toBe('opening-partner');
  expect(pt.townsfolk(partner).map((npc) => npc.id)).toContain('miguel');
  expect(pt.townsfolk(worker).map((npc) => npc.id)).not.toContain('miguel');
  expect(pt.townsfolk(worker).filter((npc) => !npc.characters)).toHaveLength(8);
});

test('the Portuguese rules engine assesses each route and sets the progress bars', () => {
  const worker = pt.newGame('worker', 5, 'zh-CN');
  expect(worker.result.columns[0].id).toBe('pt.current-law');
  expect(worker.result.columns[0].pathways.map(({ id }) => id)).toEqual([
    'PT-NATURALISATION',
    'PT-PERMANENT',
  ]);
  // The game result is the engine's, for the character's two routes.
  const { targets, ...answers } = worker.timeline;
  expect(targets).toEqual(['naturalisation', 'permanent']);
  const direct = evaluatePortugalFull({
    ...answers,
    simulationDate: worker.date,
    locale: 'zh-CN',
  }).columns[0].pathways.filter(({ id }) =>
    ['PT-NATURALISATION', 'PT-PERMANENT'].includes(id),
  );
  expect(worker.result.columns[0].pathways).toEqual(direct);
  // Five years of temporary residence (study included) from 2021-09-20
  // (SRC-123 art. 80(1)(a)); other conditions are still open.
  expect(pt.pathwayOf(worker, 'pr')?.status).toBe('NOT_MET');
  expect(pt.progress(worker).pr).toEqual({
    outcome: 'FUTURE',
    earliestDate: '2026-09-21',
    percent: 89,
  });
  expect(pt.progress(worker).nat.outcome).toBe('NOT_MET');

  const partner = pt.newGame('partner', 5, 'zh-CN');
  expect(partner.result.columns[0].pathways.map(({ id }) => id)).toEqual([
    'PT-PERMANENT',
    'PT-PARTNER-NATIONALITY',
  ]);
  // Three years of marriage from 2024-02-10 (SRC-120 Lei 37/81 art. 3(1)).
  expect(pt.progress(partner).nat).toMatchObject({
    outcome: 'FUTURE',
    earliestDate: '2027-02-11',
  });
  expect(pt.progress(partner).pr.outcome).toBe('NOT_MET');
});

test('the spring festival is Carnation Day on the square, with a carnation and a diary flag', () => {
  const state = nextDay(nextDay(pt.newGame('worker', 5, 'en')));
  expect([state.day.kind, state.day.date, state.day.festival]).toEqual([
    'special',
    '2026-04-25',
    'cravos',
  ]);
  const square = visit(state, 'green', 600);
  expect(pt.activities(square, 'green').map(({ id }) => id)).toEqual([
    'festival',
    'carnation',
  ]);
  const marched = pt.doActivity(square, 'carnation');
  expect(marched.inventory.cravo).toBe(1);
  expect(marched.flags).toContain('visited-festival:cravos');
  expect(pt.shop(marched, 'green').map(({ id }) => id)).toEqual(['cravo']);
});

test('the June arraial falls on the Saturday after 19 June, in the evening', () => {
  let state = quarterLater(settle(pt.newGame('partner', 5, 'en')));
  expect(state.date).toBe('2026-06-01');
  state = nextDay(nextDay(state));
  expect([state.day.date, state.day.festival]).toEqual([
    '2026-06-20',
    'santos',
  ]);
  expect(
    pt.activities(visit(state, 'green', 900), 'green').map(({ id }) => id),
  ).not.toContain('arraial');
  const evening = visit(state, 'green', 1140);
  expect(pt.doActivity(evening, 'arraial').inventory.sardinha).toBe(1);
});

test('a JSON save round trip continues the same quarter after a trip', () => {
  const station = visit(pt.newGame('partner', 21, 'en'), 'station', 600);
  const state = settle(pt.doActivity(station, 'travel-1'));
  expect(state.timeline.trips).toEqual([
    { departed: '2026-03-10', returned: '2026-04-10' },
  ]);
  expect([state.date, state.quarter]).toEqual(['2026-06-01', 3]);
  const restored: State = JSON.parse(JSON.stringify(state));
  const played = quarterLater(state);
  expect(played.date).toBe('2026-09-01');
  expect(quarterLater(restored)).toEqual(played);
});

test('CIPLE and the criminal record certificate carry the day they are obtained and join the next quarter', () => {
  const start = settle(pt.newGame('worker', 5, 'en'));
  const loja = visit(start, 'ward', 1080);
  const record = pt.doActivity(loja, 'criminal-record');
  expect(record.timeline.steps).toEqual({ record: '2026-03-10' });
  expect(pt.activities(record, 'ward').map(({ id }) => id)).not.toContain(
    'criminal-record',
  );
  // Obtained after the quarter's assessment date, so not assessed yet.
  expect(checks(record, 'pr')['PT-B06']).toBe('NOT_MET');
  expect(checks(on(record, '2026-06-01'), 'pr')['PT-B06']).toBe('MET');

  const unready = visit(start, 'college', 1080);
  const failed = pt.doActivity(unready, 'exam');
  expect(failed.stats.money).toBe(unready.stats.money - fees.cipleFee.value);
  expect([failed.pendingEvent, ...failed.eventQueue]).toContain(
    'system-exam-failed',
  );
  expect(failed.timeline.steps).toEqual({});

  const ready = visit(start, 'college', 1080);
  ready.stats.portuguese = 60;
  const exam = pt.activities(ready, 'college').find(({ id }) => id === 'exam')!;
  expect(exam.label.en).toContain(`€${fees.cipleFee.value}`);
  expect(exam.note?.en).toContain('next quarter');
  const passed = pt.doActivity(ready, 'exam');
  expect(passed.timeline.steps).toEqual({ ciple: '2026-03-10' });
  expect(passed.timeline.residence?.language).toEqual({ kind: 'none' });
  expect(checks(passed, 'pr')['PT-B05']).toBe('NOT_MET');
  expect(pt.activities(passed, 'college').map(({ id }) => id)).not.toContain(
    'exam',
  );
  const later = on(passed, '2026-06-01');
  expect(checks(later, 'pr')['PT-B05']).toBe('MET');
  const answers = pt.answersOn(later.timeline, later.date);
  expect(answers.residence?.language).toEqual({ kind: 'ciple' });
  expect(answers.nationality?.language).toEqual({ kind: 'ciple' });
  expect('steps' in answers).toBe(false);
});

test('the application is not offered once the card has ended by the playable day', () => {
  const state = settle(pt.newGame('worker', 5, 'en'));
  state.timeline.steps = { ciple: '2026-09-08', record: '2026-09-08' };
  on(state, '2026-12-01');
  expect(pt.permanentFileable(state)).toBe(true);
  // The card still runs on the assessment date but ends before the workday.
  pt.currentCard(state).to = '2026-12-10';
  on(state, '2026-12-01');
  const office = visit(state, 'visa', 600);
  expect(office.day.date).toBe('2026-12-15');
  expect(pt.activities(office, 'visa').map(({ id }) => id)).toEqual([]);
});

test('the partner’s foreign schooling is left for the authority to recognise', () => {
  const partner = pt.newGame('partner', 5, 'en');
  expect(partner.timeline.residence?.language).toEqual({
    kind: 'foreign-portuguese-school',
  });
  expect(checks(partner, 'pr')['PT-B05']).toBe('UNKNOWN');
});

test('permanent residence goes in at AIMA with only the means assessment open, and pays the fee', () => {
  const start = settle(pt.newGame('worker', 5, 'en'));
  const closed = visit(on(structuredClone(start), '2026-12-01'), 'visa', 600);
  expect(pt.activities(closed, 'visa').map(({ id }) => id)).toEqual([]);

  const state = structuredClone(start);
  state.timeline.steps = { ciple: '2026-09-08', record: '2026-09-08' };
  on(state, '2026-12-01');
  expect(pt.pathwayOf(state, 'pr')?.status).toBe('UNKNOWN');
  expect(
    Object.entries(checks(state, 'pr')).filter(
      ([, status]) => status !== 'MET',
    ),
  ).toEqual([
    ['PT-B03', 'UNKNOWN'],
    ['PT-B07-FEE', 'NOT_MET'],
  ]);
  const fee =
    fees.aimaOrdinaryFees.value.analysis[0] +
    fees.aimaOrdinaryFees.value.permanent[0];
  expect(pt.permanentFee(state.date)).toBe(fee);
  const office = visit(state, 'visa', 600);
  const apply = pt
    .activities(office, 'visa')
    .find(({ id }) => id === 'settle')!;
  expect(apply.label.en).toContain('€484.1');
  expect(apply.note?.en).toContain('PD-385');
  // One euro short of the fee keeps the application closed.
  const short = structuredClone(office);
  short.stats.money = fee - 1;
  expect(pt.activities(short, 'visa').map(({ id }) => id)).toEqual([]);

  const ended = pt.doActivity(office, 'settle');
  expect(ended.ending).toBe('settled');
  expect(ended.stats.money).toBeCloseTo(office.stats.money - fee);
  expect(ended.timeline.residence?.fees?.paid).toBe(true);
  expect(checks(ended, 'pr')['PT-B07-FEE']).toBe('MET');
  expect(pt.narrative(ended).at(-1)).toEqual(
    pt.characterOf('worker').settlement,
  );
  expect(JSON.stringify(pt.narrative(ended))).toContain('paperwork folder');
});

test('after the fee table ends the application is free in the game, as the fee is unknown', () => {
  const state = settle(pt.newGame('worker', 5, 'en'));
  state.timeline.steps = { ciple: '2026-09-08', record: '2026-09-08' };
  on(state, fees.aimaFeeDates.value.until);
  expect(pt.permanentFee(state.date)).toBeUndefined();
  expect(checks(state, 'pr')['PT-B07-FEE']).toBe('UNKNOWN');
  const office = visit(state, 'visa', 600);
  const apply = pt
    .activities(office, 'visa')
    .find(({ id }) => id === 'settle')!;
  expect(apply.label.en).toContain('PD-398');
  expect(pt.doActivity(office, 'settle').stats.money).toBe(office.stats.money);
});

test('the nationality declaration by marriage needs papers from an earlier day and ends with the declaration text', () => {
  const start = settle(pt.newGame('partner', 5, 'en'));
  const state = on(structuredClone(start), '2027-03-01');
  expect(pt.pathwayOf(state, 'nat')?.status).toBe('MET');
  const registry = visit(state, 'bureau', 600);
  expect(pt.activities(registry, 'bureau').map(({ id }) => id)).toEqual([
    'declaration-papers',
  ]);
  const papers = pt.doActivity(registry, 'declaration-papers');
  expect(papers.timeline.steps).toEqual({ papers: registry.day.date });
  // Sorted today, they are assessed from the next quarter.
  expect(pt.activities(papers, 'bureau')).toEqual([]);
  const next = on(papers, '2027-06-01');
  expect(checks(next, 'nat')['PT-G06']).toBe('MET');
  const declare = pt
    .activities(next, 'bureau')
    .find(({ id }) => id === 'declare')!;
  expect(declare.label.en).toContain(`€${fees.adultNationalityFee.value.eur}`);
  const ended = pt.doActivity(next, 'declare');
  expect(ended.ending).toBe('settled');
  expect(ended.stats.money).toBe(
    next.stats.money - fees.adultNationalityFee.value.eur,
  );
  expect(pt.narrative(ended).at(-1)?.en).toContain('nationality declaration');
  expect(JSON.stringify(pt.narrative(ended))).toContain('paperwork folder');
  // The worker has no declaration to make.
  const worker = visit(
    on(settle(pt.newGame('worker', 5, 'en')), '2027-03-01'),
    'bureau',
    600,
  );
  expect(pt.activities(worker, 'bureau')).toEqual([]);
});

test('the story ends once the card and the residence right after it have run out', () => {
  const months = portugal2026_11.values.residenceRightMonths.value;
  expect(months).toBe(6);
  let state = settle(pt.newGame('worker', 5, 'en'));
  // With a card ending 2026-03-31, the residence right runs to 2026-09-30.
  pt.currentCard(state).to = '2026-03-31';
  while (state.date < '2026-09-01') state = nextDay(state);
  expect(state.date).toBe('2026-09-01');
  expect(state.ending).toBeUndefined();
  expect(pt.visaMonthsLeft(state)).toBe(0);
  while (!pt.isOver(state)) state = nextDay(state);
  expect(state.date).toBe('2026-12-01');
  expect(state.ending).toBe('overstayed');
  expect(checks(state, 'pr')['PT-B01']).toBe('NOT_MET');
  expect(pt.pathwayOf(state, 'pr')?.status).toBe('NOT_MET');
});

test('the diary casts a line on the Tagus, not at a pond', () => {
  const state = settle(pt.newGame('worker', 5, 'zh-CN'));
  state.log.push({
    year: 1,
    quarter: 2,
    kind: 'action',
    id: 'fishing',
    text: { zhCN: '', en: '' },
  });
  const diary = pt.narrative(state);
  expect(JSON.stringify(diary)).toContain('特茹河岸抛竿 1 次');
  expect(JSON.stringify(diary)).not.toMatch(/池塘|pond/);
});
