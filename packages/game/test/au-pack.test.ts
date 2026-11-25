import { beforeAll, expect, test } from 'vitest';
import { evaluateAustraliaFull } from '@uk-immigration/engine';
import {
  auCharges,
  auRegionalParameters,
  australiaFull2026_11,
} from '@uk-immigration/policy-data';
import * as au from '../src/packs/au';

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
function at(state: State, date: string) {
  const next = structuredClone(state);
  next.date = date;
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
  expect(au.visaMonthsLeft(nurse)).toBe(44);
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
