import { beforeAll, expect, test } from 'vitest';
import { evaluateGreeceFull } from '@uk-immigration/engine';
import { greece2026_11, greeceFull2026_11 } from '@uk-immigration/policy-data';
import { addMonths } from '../src/calendar';
import * as gr from '../src/packs/gr';
import { grBalance } from '../src/packs/gr/balance';

type State = ReturnType<typeof gr.newGame>;
const values = greeceFull2026_11.values;

beforeAll(async () => {
  for (const { id } of gr.characters) await gr.loadCharacter(id);
});

/** Take each event's first choice until nothing is pending. */
function settle(state: State) {
  while (state.pendingEvent)
    state = gr.resolve(state, gr.currentEvent(state)!.choices[0].id);
  return state;
}
/** Sleep through to the next playable day, answering events on the way. */
function nextDay(state: State) {
  const day = state.dayNumber;
  for (let i = 0; i < 8 && state.dayNumber === day; i++)
    state = settle(gr.sleep(settle(state)));
  return state;
}
/** Sleep until the quarter changes. */
function nextQuarter(state: State) {
  const date = state.date;
  for (let i = 0; i < 12 && state.date === date && !gr.isOver(state); i++)
    state = settle(gr.sleep(settle(state)));
  return settle(state);
}
/** Walk to an open place at a given time, as the town map would. */
function visit(state: State, place: string, minute: number) {
  state = settle(state);
  if (state.day.minute < minute)
    state = settle(gr.tick(state, minute - state.day.minute));
  return settle(gr.enter(state, place));
}
const ids = (state: State, place: string) =>
  gr.activities(state, place).map(({ id }) => id);

test('each character opens on their own spring morning with a Greek timeline', () => {
  const blue = gr.newGame('bluecard', 5, 'en');
  expect(gr.currentEvent(blue)?.id).toBe('opening-bluecard');
  expect([blue.date, blue.quarter, blue.day.date]).toEqual([
    '2026-03-01',
    2,
    '2026-03-10',
  ]);
  expect(blue.stats).toEqual({
    money: 14_000,
    mood: 64,
    health: 72,
    greek: 22,
    career: 32,
  });
  expect(gr.resolve(blue, 'walk').stats.mood).toBe(68);
  // A pre-reform Blue Card runs for the years policy-data records.
  expect(blue.timeline.currentCardExpiresOn).toBe('2026-09-14');
  expect(values.workValidity.value.blueBeforeReformYears).toBe(2);
  expect(gr.visaMonthsLeft(blue)).toBe(6);

  const spouse = gr.newGame('spouse', 5, 'en');
  expect(gr.currentEvent(spouse)?.id).toBe('opening-spouse');
  expect(spouse.timeline.currentCardExpiresOn).toBe('2028-06-19');
  expect(gr.townsfolk(spouse).map((npc) => npc.id)).toContain('yannis');
  expect(gr.townsfolk(blue).map((npc) => npc.id)).not.toContain('yannis');
  expect(gr.townsfolk(blue).filter((npc) => !npc.characters)).toHaveLength(7);
});

test('the Greek rules engine assesses each route and sets the progress bars', () => {
  const blue = gr.newGame('bluecard', 5, 'zh-CN');
  expect(blue.result.columns[0].id).toBe(greeceFull2026_11.ruleSetId);
  expect(blue.result.columns[0].pathways.map(({ id }) => id)).toEqual([
    'GR-LONG-TERM',
    'GR-NATIONALITY',
  ]);
  // Without the A2 certificate, the integration requirement is not met.
  expect(gr.progress(blue).pr).toEqual({ outcome: 'NOT_MET', percent: 29 });
  expect(
    gr.pathwayOf(blue.result, 'pr')!.checks.find(({ id }) => id === 'LT-04')!
      .status,
  ).toBe('NOT_MET');
  expect(gr.progress(blue).nat.outcome).toBe('NOT_MET');

  const spouse = gr.newGame('spouse', 5, 'zh-CN');
  expect(spouse.result.columns[0].pathways.map(({ id }) => id)).toEqual([
    'GR-GREEK-FAMILY-PR',
    'GR-NATIONALITY',
  ]);
  // Five years of joint residence from 2023-05-02 (SRC-087 art. 93Α).
  expect(values.gfPeriods.value.residenceYears).toBe(5);
  expect(gr.progress(spouse).pr).toEqual({
    outcome: 'FUTURE',
    earliestDate: '2028-05-02',
    percent: 57,
  });
});

test('the A2 exam records the integration certificate and opens a Μ.1 date', () => {
  const start = settle(gr.newGame('bluecard', 5, 'en'));
  const low = visit(start, 'college', 1080);
  const failed = settle(gr.doActivity(low, 'exam'));
  expect(failed.timeline.integration).toEqual({ basis: 'none' });
  expect(failed.stats.money).toBe(
    low.stats.money - values.settlementIntegration.value.fullFee,
  );

  const ready = { ...start, stats: { ...start.stats, greek: 50 } };
  const college = visit(ready, 'college', 1080);
  const passed = gr.doActivity(college, 'exam');
  expect(passed.timeline.integration).toEqual({
    basis: 'a2',
    a2Certificate: true,
  });
  expect(passed.flags).toContain('a2-passed');
  // Five years from the Blue Card start (SRC-087 art. 144(1)).
  expect(gr.progress(passed).pr).toMatchObject({
    outcome: 'FUTURE',
    earliestDate: '2029-09-15',
  });
  expect(ids(passed, 'college')).not.toContain('exam');
});

test('the Blue Card renews in the quarter that reaches its window, with the policy fees', () => {
  let state = settle(gr.newGame('bluecard', 7, 'en'));
  const office = visit(state, 'visa', 600);
  expect(ids(office, 'visa')).not.toContain('extend');
  state = nextQuarter(state);
  expect(state.date).toBe('2026-06-01');
  const window = visit(state, 'visa', 600);
  expect(ids(window, 'visa')).toEqual(['extend']);
  const renewed = gr.doActivity(window, 'extend');
  const fees = values.workFees.value;
  expect(renewed.stats.money).toBe(
    window.stats.money - fees.permit - fees.print,
  );
  expect(renewed.timeline.currentCardExpiresOn).toBe('2029-09-14');
  expect(renewed.timeline.passport.expectedDeparture).toBe('2029-09-14');
  expect(renewed.log.at(-1)?.renewalValidTo).toBe('2029-09-14');
  expect(gr.visaMonthsLeft(renewed)).toBe(39);
  expect(ids(renewed, 'visa')).toEqual([]);
});

test('a late renewal pays the monthly fine; past the late period the story ends', () => {
  const lateFine = greece2026_11.values.lateFinePerMonthEur.value;
  let state = settle(gr.newGame('bluecard', 9, 'en'));
  state.timeline.currentCardExpiresOn = '2026-01-14';
  const office = visit(state, 'visa', 600);
  const action = gr
    .activities(office, 'visa')
    .find(({ id }) => id === 'extend')!;
  expect(action.label.en).toContain('2-month late fine');
  const renewed = gr.doActivity(office, 'extend');
  const fees = values.workFees.value;
  expect(renewed.stats.money).toBe(
    office.stats.money - fees.permit - fees.print - 2 * lateFine,
  );

  state.timeline.currentCardExpiresOn = '2026-04-30';
  for (let i = 0; i < 3 && !gr.isOver(state); i++) state = nextQuarter(state);
  // Still within three months after expiry on 2026-06-01; gone by 2026-09-01.
  expect(state.ending).toBe('overstayed');
  expect(state.date).toBe('2026-09-01');
});

test('on the 2026 calendar the late fine and late deadline follow the day of filing', () => {
  const lateFine = greece2026_11.values.lateFinePerMonthEur.value;
  const fees = values.workFees.value;
  const autumn = nextQuarter(
    nextQuarter(settle(gr.newGame('bluecard', 7, 'en'))),
  );
  // The card ends on 2026-09-14; the quarter's working day is the 15th.
  const office = visit(autumn, 'visa', 600);
  expect([office.date, office.day.date]).toEqual(['2026-09-01', '2026-09-15']);
  const action = gr
    .activities(office, 'visa')
    .find(({ id }) => id === 'extend')!;
  expect(action.label.en).toContain('1-month late fine');
  expect(gr.doActivity(office, 'extend').stats.money).toBe(
    office.stats.money - fees.permit - fees.print - lateFine,
  );

  // Past the late period on 2026-12-15 (it ended on 2026-12-14).
  const winter = nextQuarter(autumn);
  const closed = visit(winter, 'visa', 600);
  expect([closed.date, closed.day.date]).toEqual(['2026-12-01', '2026-12-15']);
  expect(ids(closed, 'visa')).not.toContain('extend');
  const lapsed = nextQuarter(closed);
  expect([lapsed.date, lapsed.ending]).toEqual(['2027-03-01', 'overstayed']);
  expect(lapsed.timeline.permits.at(-1)?.to).toBe('2026-09-14');
});

test('a lapsed Blue Card ends the story with both routes unmet', () => {
  let state = settle(gr.newGame('bluecard', 9, 'en'));
  state.date = '2029-12-01';
  state.timeline.currentCardExpiresOn = '2029-09-14';
  state.timeline.integration = { basis: 'a2', a2Certificate: true };
  state.result = gr.grRules.evaluate({ ...state, locale: 'en' });
  // Still inside the late renewal period, time counts as renewed on time.
  expect(gr.pathwayOf(state.result, 'pr')?.status).toBe('MET');
  state = nextQuarter(state);
  expect([state.date, state.ending]).toEqual(['2030-03-01', 'overstayed']);
  expect(state.timeline.permits.at(-1)?.to).toBe('2029-09-14');
  const pathways = state.result.columns[0].pathways;
  expect(pathways.map(({ status }) => status)).toEqual(['NOT_MET', 'NOT_MET']);
  expect(
    pathways.flatMap(({ checks }) =>
      checks
        .filter(({ id }) => id.endsWith('-TIME-RESIDENCE'))
        .map(({ id, status }) => [id, status]),
    ),
  ).toEqual([
    ['LT-TIME-RESIDENCE', 'NOT_MET'],
    ['NAT-TIME-RESIDENCE', 'NOT_MET'],
  ]);
});

test('the passports outlast the game, so long play never stalls on C-01', () => {
  const blue = settle(gr.newGame('bluecard', 5, 'en'));
  const spouse = settle(gr.newGame('spouse', 5, 'en'));
  const end = addMonths(blue.date, grBalance.years * 12);
  expect(end).toBe('2036-03-01');
  blue.timeline.integration = { basis: 'a2', a2Certificate: true };
  // The last renewal the game offers, in 2035, moves the expected departure.
  blue.timeline.currentCardExpiresOn = '2038-09-14';
  blue.timeline.passport.expectedDeparture = '2038-09-14';
  for (const state of [blue, spouse]) {
    for (let date = state.date; date <= end; date = addMonths(date, 3)) {
      const result = gr.grRules.evaluate({ ...state, date, locale: 'en' });
      const passport = result.columns[0].pathways.flatMap(({ checks }) =>
        checks.filter(({ id }) => id === 'C-01').map(({ status }) => status),
      );
      expect(passport, `${state.characterId} ${date}`).toEqual(['MET', 'MET']);
    }
    // Still free to settle in the last quarter.
    const last = gr.grRules.evaluate({
      ...state,
      date: addMonths(end, -3),
      locale: 'en',
    });
    expect(gr.pathwayOf(last, 'pr')?.status, state.characterId).toBe('MET');
  }
});

test('the spouse keeps the Μ.3 right after her Ο.3 card lapses', () => {
  const gf = values.gfPeriods.value;
  const printFee = values.cardFormalities.value.printFee;
  let state = settle(gr.newGame('spouse', 9, 'en'));
  state.date = '2028-09-01';
  state.result = gr.grRules.evaluate({ ...state, locale: 'en' });
  state = nextQuarter(state);
  // Past the late renewal period of the card that expired on 2028-06-19.
  expect(state.date).toBe('2028-12-01');
  expect(gr.isOver(state)).toBe(false);
  expect(state.timeline.permits.at(-1)?.to).toBe('2028-06-19');
  expect(gr.pathwayOf(state.result, 'pr')?.status).toBe('MET');
  expect(gr.pathwayOf(state.result, 'nat')?.status).toBe('NOT_MET');
  const office = visit(state, 'visa', 600);
  expect(gr.doActivity(office, 'settle').stats.money).toBe(
    office.stats.money - gf.applicationFee - printFee,
  );
  // A year after expiry the Μ.3 filing carries the late fee.
  const lateState = structuredClone(state);
  lateState.date = '2029-09-01';
  lateState.result = gr.grRules.evaluate({ ...lateState, locale: 'en' });
  const late = visit(lateState, 'visa', 600);
  const action = gr.activities(late, 'visa').find(({ id }) => id === 'settle')!;
  expect(action.label.en).toContain(`late filing €${gf.lateFee}`);
  const settled = gr.doActivity(late, 'settle');
  expect(settled.ending).toBe('settled');
  expect(settled.stats.money).toBe(
    late.stats.money - gf.applicationFee - printFee - gf.lateFee,
  );
});

test('Easter is the spring festival on the square, with tsoureki and a diary flag', () => {
  expect(
    [2026, 2027, 2028, 2029, 2030].map((year) => gr.orthodoxEaster(year)),
  ).toEqual([
    '2026-04-12',
    '2027-05-02',
    '2028-04-16',
    '2029-04-08',
    '2030-04-28',
  ]);
  const state = nextDay(nextDay(gr.newGame('spouse', 5, 'en')));
  expect([state.day.kind, state.day.date, state.day.festival]).toEqual([
    'special',
    '2026-04-12',
    'easter',
  ]);
  const square = visit(state, 'green', 600);
  expect(ids(square, 'green')).toEqual(['candle', 'festival', 'egg-tapping']);
  const eggs = gr.doActivity(square, 'egg-tapping');
  expect(eggs.inventory.tsoureki).toBe(1);
  expect(eggs.flags).toContain('visited-festival:easter');
  expect(gr.shop(eggs, 'green').map(({ id }) => id)).toEqual(['tsoureki']);
});

test('the Saturday street market sells this season’s produce', () => {
  const saturday = nextDay(gr.newGame('bluecard', 5, 'en'));
  expect(saturday.day.kind).toBe('weekend');
  const market = visit(saturday, 'market', 480);
  expect(gr.shop(market, 'market').map(({ id }) => id)).toEqual([
    'potato',
    'strawberry',
  ]);
  const shop = visit(saturday, 'shop', 600);
  expect(
    gr
      .shop(shop, 'shop')
      .filter(({ kind }) => kind === 'seed')
      .map(({ id }) => id),
  ).toEqual(['seed-potato', 'seed-strawberry']);
});

test('moving is offered only while the migration office can take the report', () => {
  const office = gr.places.find(({ id }) => id === 'visa')!.hours!;
  // Moving and reporting each take an hour of paperwork.
  const latest = office.closes - 2 * grBalance.minutes.paperwork;
  const workday = settle(gr.newGame('bluecard', 5, 'en'));
  const lease = (state: State) => ({
    ...state,
    flags: [...state.flags, 'brighter-home'],
  });
  for (const [state, id] of [
    [workday, 'rent-brighter-home'],
    [lease(workday), 'leave-brighter-home'],
  ] as const) {
    expect(ids(visit(state, 'home', latest), 'home')).toContain(id);
    expect(ids(visit(state, 'home', latest + 1), 'home')).not.toContain(id);
  }
  const moved = settle(
    gr.doActivity(visit(workday, 'home', latest), 'rent-brighter-home'),
  );
  expect(ids(visit(moved, 'visa', moved.day.minute), 'visa')).toContain(
    'report-change',
  );
  // The office is shut at the weekend, so neither move is offered.
  const saturday = nextDay(workday);
  expect(saturday.day.kind).toBe('weekend');
  expect(ids(visit(saturday, 'home', 600), 'home')).not.toContain(
    'rent-brighter-home',
  );
  expect(ids(visit(lease(saturday), 'home', 600), 'home')).not.toContain(
    'leave-brighter-home',
  );
});

test('address changes carry the day and join the assessment next quarter', () => {
  const fine = values.changeReporting.value.firstFine;
  const home = visit(gr.newGame('bluecard', 5, 'en'), 'home', 480);
  const moved = settle(gr.doActivity(home, 'rent-brighter-home'));
  expect(moved.timeline.changes).toEqual([
    { kind: 'ordinary', occurredOn: '2026-03-10' },
  ]);
  const c06 = (state: State) =>
    gr.pathwayOf(state.result, 'pr')!.checks.find(({ id }) => id === 'C-06')!
      .status;
  // Assessed on 2026-03-01, before the move.
  expect(gr.timelineOn(moved.timeline, moved.date).changes).toEqual([]);
  expect(c06(moved)).toBe('MET');
  const office = visit(moved, 'visa', 600);
  const reported = gr.doActivity(office, 'report-change');
  expect(reported.timeline.changes).toEqual([
    { kind: 'ordinary', occurredOn: '2026-03-10', reportedOn: '2026-03-10' },
  ]);
  expect(reported.stats.money).toBe(office.stats.money);
  expect(reported.flags).not.toContain('change-report-due');
  expect(nextQuarter(reported).date).toBe('2026-06-01');
  expect(c06(nextQuarter(reported))).toBe('MET');

  // Unreported by the next quarter: past the two-month limit.
  const unreported = nextQuarter(moved);
  expect(c06(unreported)).toBe('NOT_MET');
  const late = visit(unreported, 'visa', 600);
  const action = gr
    .activities(late, 'visa')
    .find(({ id }) => id === 'report-change')!;
  expect(action.label.en).toContain('late');
  const lateReported = gr.doActivity(late, 'report-change');
  expect(lateReported.stats.money).toBe(late.stats.money - fine);
  expect(lateReported.timeline.changes[0].reportedOn).toBe(
    lateReported.day.date,
  );
  // The late report joins the assessment from the next quarter, still late.
  expect(
    gr.timelineOn(lateReported.timeline, lateReported.date).changes,
  ).toEqual([{ kind: 'ordinary', occurredOn: '2026-03-10' }]);
  expect(c06(lateReported)).toBe('NOT_MET');
  expect(c06(nextQuarter(lateReported))).toBe('NOT_MET');
});

/** Report a change at the migration office, with the action as offered. */
function report(state: State) {
  const office = visit(state, 'visa', 600);
  const action = gr
    .activities(office, 'visa')
    .find(({ id }) => id === 'report-change');
  return {
    office,
    action,
    after: settle(gr.doActivity(office, 'report-change')),
  };
}
const movedOnDayOne = () =>
  settle(
    gr.doActivity(
      visit(gr.newGame('bluecard', 5, 'en'), 'home', 480),
      'rent-brighter-home',
    ),
  );

test('a second late address report pays the repeat fine', () => {
  const { firstFine, repeatFine } = values.changeReporting.value;
  const first = report(nextQuarter(movedOnDayOne()));
  expect(first.action!.label.en).toContain(`fine €${firstFine}`);
  expect(first.after.stats.money).toBe(first.office.stats.money - firstFine);
  // Moved out the same day, then again reported a quarter late.
  const left = settle(
    gr.doActivity(
      visit(first.after, 'home', first.after.day.minute),
      'leave-brighter-home',
    ),
  );
  const second = report(nextQuarter(left));
  expect(second.action!.label.en).toContain(`fine €${repeatFine}`);
  expect(second.after.stats.money).toBe(second.office.stats.money - repeatFine);
});

test('a late address report needs the money for its fine', () => {
  const { firstFine } = values.changeReporting.value;
  const due = nextQuarter(movedOnDayOne());
  const short = { ...due, stats: { ...due.stats, money: firstFine - 1 } };
  expect(report(due).action).toBeDefined();
  expect(ids(visit(short, 'visa', 600), 'visa')).not.toContain('report-change');
  const exact = { ...due, stats: { ...due.stats, money: firstFine } };
  expect(report(exact).after.stats.money).toBe(0);
});

test('a lease that ends on a low balance is a move to report', () => {
  const c06 = (state: State) =>
    gr.pathwayOf(state.result, 'pr')!.checks.find(({ id }) => id === 'C-06')!
      .status;
  const { after } = report(movedOnDayOne());
  // The quarter's pay leaves too little for the next rent.
  const ended = nextQuarter({ ...after, stats: { ...after.stats, money: 0 } });
  expect(ended.flags).not.toContain('brighter-home');
  expect(ended.timeline.changes).toEqual([
    { kind: 'ordinary', occurredOn: '2026-03-10', reportedOn: '2026-03-10' },
    { kind: 'ordinary', occurredOn: '2026-06-01' },
  ]);
  expect(ended.flags).toContain('change-report-due');
  expect(ended.result).toEqual(gr.grRules.evaluate({ ...ended, locale: 'en' }));
  // Reported on the quarter's working day, in time and free.
  const reported = report(ended);
  expect(reported.after.stats.money).toBe(reported.office.stats.money);
  expect(c06(nextQuarter(reported.after))).toBe('MET');
  expect(c06(nextQuarter(ended))).toBe('NOT_MET');
});

test('the diary casts a line off the harbour breakwater, not at a pond', () => {
  const breakwater = visit(gr.newGame('bluecard', 5, 'en'), 'pond', 600);
  const cast = gr.fish(breakwater, false);
  expect(cast.log.at(-1)).toMatchObject({
    id: 'fishing',
    text: { zhCN: '在港口防波堤抛竿', en: 'Cast at the harbour breakwater' },
  });
  const diary = gr.narrative(cast);
  expect(diary.map(({ zhCN }) => zhCN).join('\n')).toContain(
    '港口防波堤抛竿 1 次。',
  );
  expect(diary.map(({ en }) => en).join('\n')).toContain(
    '1 cast at the harbour breakwater',
  );
  expect(JSON.stringify(diary)).not.toMatch(/池塘|pond/);
});

test('a JSON save round trip continues the same quarter after a trip', () => {
  const station = visit(gr.newGame('spouse', 21, 'en'), 'station', 600);
  const state = settle(gr.doActivity(station, 'travel-1'));
  expect(state.timeline.trips).toEqual([
    {
      departed: '2026-03-10',
      returned: '2026-04-10',
      familyAbsenceReason: 'ordinary',
    },
  ]);
  expect([state.date, state.quarter]).toEqual(['2026-06-01', 3]);
  const restored: State = JSON.parse(JSON.stringify(state));
  const played = nextQuarter(state);
  expect(played.date).toBe('2026-09-01');
  expect(nextQuarter(restored)).toEqual(played);
});

test('the yearly tax return records last year’s taxable income', () => {
  const state = settle(gr.newGame('bluecard', 5, 'en'));
  expect(gr.unfiledTaxYear(state)).toBeUndefined();
  state.date = '2027-03-01';
  const office = visit(state, 'council', 600);
  expect(ids(office, 'council')).toContain('tax-return');
  const filed = gr.doActivity(office, 'tax-return');
  expect(filed.timeline.nationality.incomeByTaxYear[2026]).toEqual({
    taxableEur: gr.grossSalary(filed),
    dependants: 0,
  });
  expect(ids(filed, 'council')).not.toContain('tax-return');
});

test('settling uses the Greek assessment and the policy card fees', () => {
  const state = settle(gr.newGame('spouse', 5, 'en'));
  state.date = '2028-06-01';
  state.result = gr.grRules.evaluate({ ...state, locale: 'en' });
  expect(gr.pathwayOf(state.result, 'pr')?.status).toBe('MET');
  const office = visit(state, 'visa', 600);
  const fee =
    values.gfPeriods.value.applicationFee +
    values.cardFormalities.value.printFee;
  const action = gr
    .activities(office, 'visa')
    .find(({ id }) => id === 'settle')!;
  expect(action.label.en).toContain('Μ.3');
  const ended = gr.doActivity(office, 'settle');
  expect(ended.ending).toBe('settled');
  expect(ended.stats.money).toBe(office.stats.money - fee);
  expect(gr.narrative(ended).at(-1)).toEqual(
    gr.characterOf('spouse').settlement,
  );
  expect(ended.log.find(({ kind }) => kind === 'ending')?.text).toEqual(
    gr.characterOf('spouse').settlement,
  );
});

test('a naturalisation filing ends with the naturalisation story', () => {
  const state = settle(gr.newGame('bluecard', 5, 'en'));
  state.date = '2031-12-01';
  state.timeline.currentCardExpiresOn = '2032-09-14';
  state.timeline.integration = { basis: 'a2', a2Certificate: true };
  state.timeline.nationality.exam = 'certificate';
  state.timeline.nationality.knowledgeDocumentReady = true;
  for (const year of [2026, 2027, 2028, 2029, 2030])
    state.timeline.nationality.incomeByTaxYear[year] = {
      taxableEur: 56_000,
      dependants: 0,
    };
  state.result = gr.grRules.evaluate({ ...state, locale: 'en' });
  expect(
    evaluateGreeceFull({
      ...state.timeline,
      simulationDate: state.date,
      locale: 'en',
    }).columns[0].pathways.map(({ status }) => status),
  ).toEqual(['MET', 'MET']);
  const bureau = visit(state, 'bureau', 600);
  const ended = gr.doActivity(bureau, 'naturalise');
  expect(ended.ending).toBe('settled');
  expect(ended.stats.money).toBe(
    bureau.stats.money - values.naturalisationFees.value.initial,
  );
  const text = gr.narrative(ended).at(-1)!;
  expect(text.en).toContain('naturalisation');
  expect(text).not.toEqual(gr.characterOf('bluecard').settlement);
  expect(ended.log.find(({ kind }) => kind === 'ending')?.text).toEqual(text);
});
