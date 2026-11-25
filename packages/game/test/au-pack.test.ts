import { beforeAll, expect, test } from 'vitest';
import { evaluateAustraliaFull } from '@uk-immigration/engine';
import {
  auCharges,
  auRegionalParameters,
  australiaFull2026_11,
} from '@uk-immigration/policy-data';
import * as au from '../src/packs/au';
import { auSystemEvents } from '../src/packs/au/events';
import { auActions } from '../src/packs/au/town';

type State = ReturnType<typeof au.newGame>;

beforeAll(async () => {
  for (const { id } of au.characters) await au.loadCharacter(id);
});

/** Take each event's first choice until nothing is pending. */
function settle(state: State) {
  while (state.pendingEvent)
    state = au.resolve(state, au.currentEvent(state)!.choices[0].id);
  return state;
}
/** Sleep through to the next playable day, answering events on the way. */
function nextDay(state: State) {
  const day = state.dayNumber;
  for (let i = 0; i < 8 && state.dayNumber === day; i++)
    state = settle(au.sleep(settle(state)));
  return state;
}
/** Walk to an open place at a given time, as the town map would. */
function visit(state: State, place: string, minute: number) {
  state = settle(state);
  if (state.day.minute < minute)
    state = settle(au.tick(state, minute - state.day.minute));
  return settle(au.enter(state, place));
}
/** Move the timeline to another quarter start and reassess, as a later save would. */
function at(state: State, date: string, quarter = state.quarter) {
  const next = structuredClone(state);
  next.date = date;
  next.quarter = quarter;
  next.result = au.auRules.evaluate(next);
  return next;
}
const failing = (state: State) =>
  au
    .pathwayOf(state.result)!
    .checks.filter(({ status }) => status !== 'MET')
    .map(({ id }) => id);

test('each character opens on their own autumn morning in Wattle Bay', () => {
  const nurse = au.newGame('nurse', 5, 'en');
  expect(au.currentEvent(nurse)?.id).toBe('opening-nurse');
  // The game starts on 1 March, so its quarters match the southern seasons.
  expect([nurse.date, nurse.quarter, nurse.day.date]).toEqual([
    '2026-03-01',
    2,
    '2026-03-10',
  ]);
  expect(nurse.stats).toEqual({
    money: 15_000,
    mood: 66,
    health: 72,
    english: 40,
    career: 34,
  });
  expect(au.resolve(nurse, 'beach').stats.mood).toBe(70);
  const graduate = au.newGame('graduate', 5, 'en');
  expect(au.currentEvent(graduate)?.id).toBe('opening-graduate');
  expect(au.townsfolk(graduate)).toHaveLength(8);
});

test('the Australian rules engine assesses each 191 stream and the time milestone', () => {
  const nurse = au.newGame('nurse', 5, 'zh-CN');
  expect(nurse.result.columns[0].id).toBe(australiaFull2026_11.ruleSetId);
  expect(nurse.result.columns[0].pathways.map(({ id }) => id)).toEqual([
    'AU-191',
  ]);
  // Three years on the 491 from 2024-11-04 (SRC-062 Sch 1 item 1139(3)(c)(ii)).
  expect(au.progress(nurse).pr).toEqual({
    outcome: 'NOT_MET',
    earliestDate: '2027-11-04',
    percent: 44,
  });
  expect(failing(nurse)).toEqual([
    'AU-191-time-held',
    'AU-191-tax-notices',
    'AU-PIC-HEALTH',
    'AU-PIC-POLICE',
    'AU-FEES-APPLICATION',
  ]);
  // From the first playable day, 2026-03-10.
  expect(au.visaMonthsLeft(nurse)).toBe(43);
  const graduate = au.newGame('graduate', 5, 'zh-CN');
  expect(graduate.result.columns[0].pathways.map(({ id }) => id)).toEqual([
    'AU-191-HK',
  ]);
  // The Hong Kong 485 ends five years after it came into effect.
  expect(au.currentVisa(graduate).to).toBe('2029-07-14');
  expect(au.progress(graduate).pr).toEqual({
    outcome: 'NOT_MET',
    earliestDate: '2027-07-15',
    percent: 54,
  });
});

test('the medical, police checks and tax returns fill in the 191 evidence', () => {
  let state = settle(au.newGame('nurse', 5, 'en'));
  state = au.doActivity(visit(state, 'station', 600), 'health-exam');
  expect(state.timeline.publicInterest.health).toBe('cleared');
  state = au.doActivity(visit(state, 'post', 900), 'police-check');
  expect(state.timeline.publicInterest.policeDocuments).toBe('supplied');
  expect(failing(state)).toEqual([
    'AU-191-time-held',
    'AU-191-tax-notices',
    'AU-FEES-APPLICATION',
  ]);
  // The 2025–26 income year has not ended on the quarter's evidence date.
  const home = (s: State) => visit(s, 'home', 480);
  expect(au.activities(home(state), 'home').map(({ id }) => id)).not.toContain(
    'tax-return',
  );
  const lodged = au.doActivity(home(at(state, '2026-09-01')), 'tax-return');
  expect(lodged.timeline.regional.assessmentYears).toEqual([2025, 2026]);
  expect(lodged.stats.money).toBe(
    home(at(state, '2026-09-01')).stats.money + 650,
  );
  const third = au.doActivity(home(at(lodged, '2027-09-01')), 'tax-return');
  expect(third.timeline.regional.assessmentYears).toHaveLength(
    auRegionalParameters.relevantAssessments.value,
  );
  expect(au.progress(third).pr).toMatchObject({
    outcome: 'FUTURE',
    earliestDate: '2027-11-04',
  });
});

test('the autumn festival is Anzac Day on the foreshore, with a biscuit and a diary flag', () => {
  const state = nextDay(nextDay(au.newGame('nurse', 5, 'en')));
  expect([state.day.kind, state.day.date, state.day.festival]).toEqual([
    'special',
    '2026-04-25',
    'anzac-day',
  ]);
  const foreshore = visit(state, 'green', 600);
  expect(au.activities(foreshore, 'green').map(({ id }) => id)).toEqual([
    'free-bbq',
    'festival',
    'anzac-rosemary',
  ]);
  const service = au.doActivity(foreshore, 'anzac-rosemary');
  expect(service.inventory['anzac-biscuit']).toBe(1);
  expect(service.flags).toContain('visited-festival:anzac-day');
  expect(au.shop(service, 'green').map(({ id }) => id)).toEqual([
    'anzac-biscuit',
  ]);
});

test('a JSON save round trip continues the same quarter after a trip home', () => {
  const station = visit(au.newGame('nurse', 21, 'en'), 'station', 600);
  // The month abroad runs to the end of the quarter, then returns home.
  const state = settle(au.doActivity(station, 'travel-1'));
  expect(state.timeline.trips).toEqual([
    { departed: '2026-03-10', returned: '2026-04-10' },
  ]);
  expect([state.date, state.quarter]).toEqual(['2026-06-01', 3]);
  const restored: State = JSON.parse(JSON.stringify(state));
  const quarterLater = (from: State) => {
    let next = from;
    for (let i = 0; i < 12 && next.date === from.date; i++)
      next = settle(au.sleep(next));
    return next;
  };
  const played = quarterLater(state);
  expect(played.date).toBe('2026-09-01');
  expect(quarterLater(restored)).toEqual(played);
});

test.each([
  ['nurse', '2027-12-01', auCharges.regional.value.standard[0]],
  ['graduate', '2027-09-01', auCharges.regionalHk.value.standard[0]],
] as const)(
  'the %s lodges once the engine finds the stream met, paying its charge',
  (id, date, fee) => {
    const start = settle(au.newGame(id, 5, 'en'));
    Object.assign(start.timeline.publicInterest, {
      health: 'cleared',
      policeDocuments: 'supplied',
    });
    start.timeline.regional.assessmentYears = [2025, 2026, 2027];
    const ready = at(start, date);
    expect(ready.result).toEqual(
      evaluateAustraliaFull({
        ...ready.timeline,
        simulationDate: date,
        locale: 'en',
      }),
    );
    expect(au.pathwayOf(ready.result)?.status).toBe('MET');
    const office = visit(ready, 'visa', 600);
    const lodge = au.activities(office, 'visa').find((a) => a.id === 'settle')!;
    expect(lodge.label.en).toContain(`AUD ${fee.toLocaleString('en-AU')}`);
    const ended = au.doActivity(office, 'settle');
    expect(ended.ending).toBe('settled');
    expect(ended.stats.money).toBe(office.stats.money - fee);
    // The ending is written as the 191 is lodged, in the character's words.
    expect(au.narrative(ended).at(-1)).toEqual(au.characterOf(id).settlement);
    expect(ended.log.filter(({ kind }) => kind === 'ending')).toEqual([
      expect.objectContaining({
        id: 'settled',
        text: au.characterOf(id).settlement,
      }),
    ]);
  },
);

test('the diary casts a line off the jetty, not at a pond', () => {
  const jetty = visit(au.newGame('nurse', 5, 'en'), 'pond', 600);
  const cast = au.fish(jetty, false);
  expect(cast.log.at(-1)).toMatchObject({
    id: 'fishing',
    text: { zhCN: '在码头抛竿', en: 'Cast at the jetty' },
  });
  const diary = au.narrative(cast);
  expect(diary.map(({ zhCN }) => zhCN).join('\n')).toContain('码头抛竿 1 次。');
  expect(diary.map(({ en }) => en).join('\n')).toContain('1 cast at the jetty');
  expect(JSON.stringify(diary)).not.toMatch(/池塘|pond/);
});

test('an ended visa closes the story', () => {
  let state = settle(au.newGame('graduate', 5, 'en'));
  au.currentVisa(state).to = '2026-04-30';
  for (let i = 0; i < 6 && !au.isOver(state); i++) state = nextDay(state);
  expect(state.ending).toBe('overstayed');
});

test.each([
  ['nurse', '2029-09-01', 'AU-191-time-held'],
  ['graduate', '2029-06-01', 'AU-191-HK-time-held'],
] as const)(
  'when the %s visa ends unlodged, the ending assessment shows the 191 not met',
  (id, lastQuarter, held) => {
    const start = settle(au.newGame(id, 5, 'en'));
    Object.assign(start.timeline.publicInterest, {
      health: 'cleared',
      policeDocuments: 'supplied',
    });
    start.timeline.regional.assessmentYears = [2025, 2026, 2027, 2028];
    let state = at(start, lastQuarter);
    expect(au.pathwayOf(state.result)?.status).toBe('MET');
    for (let i = 0; i < 6 && !au.isOver(state); i++) state = nextDay(state);
    expect(state.ending).toBe('overstayed');
    // The visa's end date in the timeline is its status: the engine no longer
    // finds the qualifying visa held at lodgement (Sch 1 item 1139(3)).
    expect(au.currentVisa(state).to! < state.date).toBe(true);
    const pathway = au.pathwayOf(state.result)!;
    expect(pathway.status).toBe('NOT_MET');
    expect(pathway.checks.find((check) => check.id === held)?.status).toBe(
      'NOT_MET',
    );
    expect(au.progress(state).pr.outcome).toBe('NOT_MET');
  },
);

test('a festival after the visa has ended shows the lapse, and leaving is assessed that day', () => {
  const start = settle(au.newGame('graduate', 5, 'en'));
  Object.assign(start.timeline.publicInterest, {
    health: 'cleared',
    policeDocuments: 'supplied',
  });
  // The winter quarter of 2029: the 485 ends on 14 July, the grand final is
  // on 25 August.
  let state = at(start, '2029-06-01', 3);
  expect(au.pathwayOf(state.result)?.status).toBe('MET');
  while (state.day.index < 2) state = nextDay(state);
  expect([state.day.date, state.day.festival]).toEqual([
    '2029-08-25',
    'footy-final',
  ]);
  expect(au.currentVisa(state).to).toBe('2029-07-14');
  expect(au.visaMonthsLeft(state)).toBe(0);
  expect(au.assessedOn(state)).toBe('2029-08-25');
  expect(au.pathwayOf(au.currentResult(state))?.status).toBe('NOT_MET');
  expect(au.progress(state).pr.outcome).toBe('NOT_MET');
  const left = au.doActivity(visit(state, 'station', 900), 'leave');
  expect(left.ending).toBe('left');
  expect(au.assessedOn(left)).toBe('2029-08-25');
  expect(au.pathwayOf(au.currentResult(left))?.status).toBe('NOT_MET');
  expect(au.currentResult(left)).toEqual(
    evaluateAustraliaFull({
      ...left.timeline,
      simulationDate: '2029-08-25',
      locale: 'en',
    }),
  );
});

test('after a trip home, the Hong Kong stream can be lodged once only usual residence (PD-108) is pending', () => {
  let state = settle(au.newGame('graduate', 5, 'en'));
  state = au.doActivity(visit(state, 'station', 540), 'health-exam');
  state = au.doActivity(visit(state, 'post', 900), 'police-check');
  const station = visit(state, 'station', 1000);
  // The trip's note says what the trip does to the stream.
  const trip = au
    .activities(station, 'station')
    .find(({ id }) => id === 'travel-1')!;
  expect(trip.note?.zhCN).toContain('PD-108');
  expect(trip.note?.zhCN).toContain('仍可在政府服务中心递交');
  expect(trip.note?.en).toContain('you can still lodge');
  state = settle(au.doActivity(station, 'travel-1'));
  expect(state.timeline.trips).toEqual([
    { departed: '2026-03-10', returned: '2026-04-10' },
  ]);
  const later = at(state, '2027-09-01', 4);
  const pathway = au.pathwayOf(later.result)!;
  expect(pathway.status).toBe('UNKNOWN');
  expect(failing(later)).toEqual([
    'AU-191-HK-time-residence',
    'AU-FEES-APPLICATION',
  ]);
  expect(
    pathway.checks.find(({ id }) => id === 'AU-191-HK-time-residence')
      ?.pendingDetails,
  ).toContain('PD-108');
  const office = visit(later, 'visa', 600);
  const lodge = au.activities(office, 'visa').find((a) => a.id === 'settle');
  expect(lodge?.label.zhCN).toContain('内政部核对');
  expect(lodge?.label.en).toContain('Home Affairs');
  expect(lodge?.note?.zhCN).toContain('PD-108');
  const ended = au.doActivity(office, 'settle');
  expect(ended.ending).toBe('settled');
  const ending = au.narrative(ended).at(-1)!;
  expect(ending.zhCN).toContain(au.characterOf('graduate').settlement.zhCN);
  expect(ending.zhCN).toContain('PD-108');
  expect(ending.en).toContain('PD-108');
  // Still closed while the time requirement itself is not met.
  const early = visit(at(state, '2026-12-01', 1), 'visa', 600);
  expect(au.pathwayOf(early.result)?.status).toBe('NOT_MET');
  expect(au.activities(early, 'visa').map(({ id }) => id)).not.toContain(
    'settle',
  );
});

test.each([
  ['nurse', '2029-03-01', 2, '2029-06-12'],
  ['graduate', '2028-12-01', 1, '2029-03-13'],
] as const)(
  'the %s cannot take a trip that would miss the last workday before the visa ends',
  (id, date, quarter, workday) => {
    const start = settle(au.newGame(id, 5, 'en'));
    Object.assign(start.timeline.publicInterest, {
      health: 'cleared',
      policeDocuments: 'supplied',
    });
    start.timeline.regional.assessmentYears = [2025, 2026, 2027, 2028];
    // Play into the next quarter's workday.
    let state = at(start, date, quarter);
    state = nextDay(nextDay(nextDay(state)));
    expect(state.day.date).toBe(workday);
    const trips = au
      .activities(visit(state, 'station', 600), 'station')
      .filter(({ id }) => id.startsWith('travel-'));
    // A month away comes back in time for the next quarter's workday; three
    // months would skip it, and the visa ends before the one after.
    expect(trips.map(({ id }) => id)).toEqual(['travel-1']);
    expect(trips[0].note?.en).toContain('workday');
    const back = settle(
      au.doActivity(visit(state, 'station', 600), 'travel-1'),
    );
    expect(back.ending).toBeUndefined();
    expect(back.day.date <= au.currentVisa(back).to!).toBe(true);
    expect(
      au.activities(visit(back, 'visa', 600), 'visa').map(({ id }) => id),
    ).toContain('settle');
  },
);

test('the tax and application notes follow each stream and the fee table date', () => {
  const home = (id: 'nurse' | 'graduate') =>
    au
      .activities(
        visit(
          at(settle(au.newGame(id, 5, 'en')), '2026-09-01', 4),
          'home',
          480,
        ),
        'home',
      )
      .find((a) => a.id === 'tax-return')!;
  const notices = `${auRegionalParameters.relevantAssessments.value} completed income years`;
  expect(home('nurse').note?.en).toContain(notices);
  // The Hong Kong stream does not assess notices of assessment.
  const graduate = home('graduate').note!;
  expect(graduate.en).not.toContain(notices);
  expect(graduate.en).toContain('Hong Kong');
  expect(graduate.zhCN).toContain('香港类别不看评税通知');
  // The charge is the fee table in force from its effective date.
  const start = settle(au.newGame('nurse', 5, 'en'));
  Object.assign(start.timeline.publicInterest, {
    health: 'cleared',
    policeDocuments: 'supplied',
  });
  start.timeline.regional.assessmentYears = [2025, 2026, 2027];
  const lodge = au
    .activities(visit(at(start, '2027-12-01', 1), 'visa', 600), 'visa')
    .find((a) => a.id === 'settle')!;
  expect(lodge.note?.zhCN).toContain(
    `按 ${auCharges.effectiveFrom.value} 生效的费率估算`,
  );
  expect(lodge.note?.en).toContain(auCharges.effectiveFrom.value);
  expect(lodge.note?.zhCN).not.toContain('游戏日期适用的现行费率');
});

test('the summer call from Hong Kong and the Christmas invitation come at their time of year', () => {
  const seen: [string, string, number, string][] = [];
  for (let seed = 1; seed <= 20; seed++) {
    let state = au.newGame('graduate', seed, 'en');
    for (
      let i = 0;
      i < 400 && !au.isOver(state) && state.date < '2028-03-01';
      i++
    ) {
      const event = au.currentEvent(state);
      if (!event) state = au.fastForward(state);
      else {
        if (event.id === 'grad-home-call' || event.id === 'au-christmas')
          seen.push([event.id, state.day.date, state.quarter, state.day.kind]);
        state = au.resolve(state, event.choices[0].id);
      }
    }
  }
  const calls = seen.filter(([id]) => id === 'grad-home-call');
  const christmas = seen.filter(([id]) => id === 'au-christmas');
  expect(calls.length).toBeGreaterThan(0);
  expect(christmas.length).toBeGreaterThan(0);
  // “It's winter there”: the southern winter quarter.
  for (const [, date, quarter] of calls)
    expect([date, quarter]).toEqual([date, 3]);
  // An invitation for Christmas Day comes before it, in December.
  for (const [, date] of christmas) {
    expect(date.slice(5, 7)).toBe('12');
    expect(date.slice(8) < '25').toBe(true);
  }
}, 60_000);

test('every change of address says the game files the 491 notice', () => {
  const cheap = auSystemEvents
    .find(({ id }) => id === 'system-debt')!
    .choices.find(({ id }) => id === 'cheap')!;
  const leave = auActions.find(({ id }) => id === 'leave-brighter-home')!;
  const rent = auActions.find(({ id }) => id === 'rent-brighter-home')!;
  for (const note of [cheap.note, leave.note, rent.note]) {
    expect(note?.zhCN).toContain('condition 8578');
    expect(note?.en).toContain('condition 8578');
  }
  // A low balance ends the sea-view lease on its own at the quarter's end.
  expect(rent.note?.zhCN).toContain('自动退租');
  expect(rent.note?.en).toContain('low balance');
});

test('no call asks the player to turn up while they are away on a trip', () => {
  const abroad: string[] = [];
  let christmasTrips = 0;
  for (let seed = 1; seed <= 40 && christmasTrips < 3; seed++) {
    let state = settle(au.newGame('nurse', seed, 'en'));
    while (state.date < '2026-12-01') state = nextDay(state);
    // Leaving on the summer quarter's workday with the Christmas call drawn.
    if (
      !state.eventQueue.includes('au-christmas') &&
      !state.day.deliveries.some(({ eventId }) => eventId === 'au-christmas')
    )
      continue;
    christmasTrips++;
    let trip = au.doActivity(visit(state, 'station', 600), 'travel-1');
    for (let i = 0; i < 20 && trip.trip; i++) {
      const event = au.currentEvent(trip);
      if (!event) trip = au.sleep(trip);
      else {
        if (event.channel === 'phone') abroad.push(`${seed} ${event.id}`);
        trip = au.resolve(trip, event.choices[0].id);
      }
    }
  }
  expect(christmasTrips).toBeGreaterThan(0);
  expect(abroad).toEqual([]);
}, 60_000);
