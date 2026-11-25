import { beforeAll, expect, test } from 'vitest';
import {
  evaluateNewZealand,
  evaluateNewZealandFull,
} from '@uk-immigration/engine';
import {
  newZealand2026_11,
  newZealandFull2026_11,
  nzResidentParameters,
} from '@uk-immigration/policy-data';
import * as nz from '../src/packs/nz';

type State = ReturnType<typeof nz.newGame>;

beforeAll(async () => {
  for (const { id } of nz.characters) await nz.loadCharacter(id);
});

/** Take each event's first choice until nothing is pending. */
function settle(state: State) {
  while (state.pendingEvent)
    state = nz.resolve(state, nz.currentEvent(state)!.choices[0].id);
  return state;
}
/** Sleep through to the next playable day, answering events on the way. */
function nextDay(state: State) {
  const day = state.dayNumber;
  for (let i = 0; i < 8 && state.dayNumber === day; i++)
    state = settle(nz.sleep(settle(state)));
  return state;
}
/** Walk to an open place at a given time, as the town map would. */
function visit(state: State, place: string, minute: number) {
  state = settle(state);
  if (state.day.minute < minute)
    state = settle(nz.tick(state, minute - state.day.minute));
  return settle(nz.enter(state, place));
}

/** Jump to a later quarter, its assessment and its playable workday. */
function jump(from: State, date: string, day: string) {
  const state = structuredClone(from);
  state.date = date;
  state.day = { ...state.day, date: day, minute: 540, done: [] };
  state.result = nz.nzRules.evaluate(state);
  return state;
}

test('each character opens on their own autumn morning with a resident visa', () => {
  const nurse = nz.newGame('nurse', 5, 'en');
  expect(nz.currentEvent(nurse)?.id).toBe('opening-nurse');
  // Quarter 2 is March to May: autumn in the southern hemisphere.
  expect([nurse.date, nurse.quarter, nurse.day.date]).toEqual([
    '2026-03-01',
    2,
    '2026-03-10',
  ]);
  expect(nurse.stats).toEqual({
    money: 14_000,
    mood: 66,
    health: 70,
    tereo: 8,
    career: 40,
  });
  expect(nz.resolve(nurse, 'coffee').stats.mood).toBe(70);
  // The general categories' travel conditions run two years from the
  // first day as a resident (SRC-072 R5.66.5(a)).
  expect(newZealand2026_11.values.travelYears.value.general).toBe(2);
  expect(nz.travelEnd(nurse)).toBe('2027-08-17');
  expect(nz.visaMonthsLeft(nurse)).toBe(17);

  const partner = nz.newGame('partner', 5, 'en');
  expect(nz.currentEvent(partner)?.id).toBe('opening-partner');
  expect(partner.timeline.residentVisa).toEqual({
    granted: '2026-01-20',
    category: 'general',
  });
  expect(nz.travelEnd(partner)).toBe('2028-01-19');
  expect(nz.townsfolk(partner).map((npc) => npc.id)).toContain('aroha');
  expect(nz.townsfolk(nurse).map((npc) => npc.id)).not.toContain('aroha');
  expect(nz.townsfolk(nurse).filter((npc) => !npc.characters)).toHaveLength(7);
});

test('the New Zealand rules engine assesses the permanent resident visa and citizenship', () => {
  const nurse = nz.newGame('nurse', 5, 'zh-CN');
  expect(nurse.result.columns[0].id).toBe(newZealandFull2026_11.ruleSetId);
  expect(nurse.result.columns[0].pathways.map(({ id }) => id)).toEqual([
    'NZ-PRV',
    'NZ-CITIZENSHIP',
  ]);
  // 730 days from the onshore grant on 2025-08-18 (SRC-072 RV2.5).
  expect(nz.progress(nurse).prv).toEqual({
    outcome: 'FUTURE',
    earliestDate: '2027-08-18',
    percent: 27,
  });
  // The full assessment gives no citizenship date yet. The bar keeps the
  // result page's outcome and fills with the engine's presence projection
  // (SRC-070 s8).
  expect(nz.pathwayOf(nurse.result, 'cit')?.status).toBe('NOT_MET');
  expect(
    evaluateNewZealand({
      ...nurse.timeline,
      simulationDate: nurse.date,
    }).pathways.find(({ id }) => id === 'NZ-CITIZENSHIP')?.earliestDate,
  ).toBe('2030-04-15');
  expect(nz.progress(nurse).cit).toEqual({ outcome: 'NOT_MET', percent: 11 });
  const partner = nz.newGame('partner', 5, 'zh-CN');
  expect(nz.progress(partner).prv).toMatchObject({
    outcome: 'FUTURE',
    earliestDate: '2028-01-20',
  });
});

test('the autumn festival is the Pasifika festival at the domain, with panikeke', () => {
  const state = nextDay(nextDay(nz.newGame('nurse', 5, 'en')));
  expect([state.day.kind, state.day.date, state.day.festival]).toEqual([
    'special',
    '2026-03-21',
    'pasifika',
  ]);
  const domain = visit(state, 'green', 600);
  expect(nz.activities(domain, 'green').map(({ id }) => id)).toEqual([
    'festival',
    'pasifika-dance',
  ]);
  const danced = nz.doActivity(domain, 'pasifika-dance');
  expect(danced.inventory.panikeke).toBe(1);
  expect(danced.flags).toContain('visited-festival:pasifika');
  expect(nz.shop(danced, 'green').map(({ id }) => id)).toEqual(['panikeke']);
});

test('a JSON save round trip continues the same quarter after a trip', () => {
  const station = visit(nz.newGame('partner', 21, 'en'), 'station', 600);
  const state = settle(nz.doActivity(station, 'travel-1'));
  expect(state.timeline.trips).toEqual([
    { departed: '2026-03-10', returned: '2026-04-10' },
  ]);
  expect([state.date, state.quarter]).toEqual(['2026-06-01', 3]);
  // A month away keeps the PRV date but moves citizenship presence back.
  expect(nz.progress(state).prv.earliestDate).toBe('2028-01-20');
  expect(
    nz.timeProjection(state).find(({ id }) => id === 'NZ-CITIZENSHIP')
      ?.earliestDate,
  ).toBe('2030-10-17');
  const restored: State = JSON.parse(JSON.stringify(state));
  const quarterLater = (from: State) => {
    let next = from;
    for (let i = 0; i < 12 && next.date === from.date; i++)
      next = settle(nz.sleep(next));
    return next;
  };
  const played = quarterLater(state);
  expect(played.date).toBe('2026-09-01');
  expect(quarterLater(restored)).toEqual(played);
});

test('trips must be back before the travel conditions end', () => {
  const state = visit(nz.newGame('nurse', 5, 'en'), 'station', 600);
  state.timeline.travelConditionsEnd = '2026-05-31';
  expect(nz.activities(state, 'station').map(({ id }) => id)).toEqual([
    'travel-1',
    'leave',
  ]);
  state.timeline.travelConditionsEnd = '2026-04-09';
  expect(nz.activities(state, 'station').map(({ id }) => id)).toEqual([
    'leave',
  ]);
});

test('the travel conditions count down from the day being played', () => {
  const state = settle(nz.newGame('nurse', 5, 'en'));
  expect([state.date, state.day.date]).toEqual(['2026-03-01', '2026-03-10']);
  // A month from the quarter's start, but less than one from today.
  state.timeline.travelConditionsEnd = '2026-04-05';
  expect(nz.visaMonthsLeft(state)).toBe(0);
  state.timeline.travelConditionsEnd = '2026-04-10';
  expect(nz.visaMonthsLeft(state)).toBe(1);
  state.timeline.travelConditionsEnd = '2026-03-05';
  expect(nz.visaMonthsLeft(state)).toBe(0);
});

test('a permanent resident visa application uses the engine assessment and the reference fee', () => {
  const state = jump(
    settle(nz.newGame('nurse', 5, 'en')),
    '2027-09-01',
    '2027-09-14',
  );
  expect(nz.pathwayOf(state.result, 'prv')?.status).toBe('MET');
  expect(
    evaluateNewZealandFull({
      ...state.timeline,
      simulationDate: state.date,
      locale: 'en',
    }).columns[0].pathways.find(({ id }) => id === 'NZ-PRV')?.status,
  ).toBe('MET');
  expect(nz.visaMonthsLeft(state)).toBe(0);
  const office = visit(state, 'visa', 600);
  const fee = nzResidentParameters.residentFeeReference.value.permanent;
  const apply = nz.activities(office, 'visa');
  expect(apply.map(({ id }) => id)).toEqual(['settle']);
  expect(apply[0].label.en).toContain(`NZ$${fee}`);
  const ended = nz.doActivity(office, 'settle');
  expect(ended.ending).toBe('settled');
  expect(ended.stats.money).toBe(office.stats.money - fee);
  expect(nz.narrative(ended).at(-1)).toEqual(
    nz.characterOf('nurse').settlement,
  );
});

// INZ and Internal Affairs decide each application; an ending only records
// that it was lodged.
const granted = /获批|批下来|宣誓|granted|oath/i;

test.each(['nurse', 'partner'])(
  'the %s’s permanent resident visa ending records a lodged application',
  (id) => {
    const state = jump(
      settle(nz.newGame(id, 5, 'en')),
      '2028-03-01',
      '2028-03-14',
    );
    const ended = nz.doActivity(visit(state, 'visa', 600), 'settle');
    expect(ended.ending).toBe('settled');
    const text = nz.narrative(ended).at(-1)!;
    expect(text).toEqual(nz.characterOf(id).settlement);
    expect(`${text.zhCN} ${text.en}`).not.toMatch(granted);
    expect(`${text.zhCN} ${text.en}`).toMatch(/递交|lodged/);
  },
);

test('a citizenship application ends on the citizenship text, read before the effects', () => {
  const state = settle(nz.newGame('nurse', 5, 'en'));
  // The engine holds the test open (PD-224); open the pathway to reach the
  // application the game would offer once it is met.
  const office = visit(state, 'dia', 600);
  nz.pathwayOf(office.result, 'cit')!.status = 'MET';
  expect(nz.activities(office, 'dia').map(({ id }) => id)).toContain(
    'naturalise',
  );
  const ended = nz.doActivity(office, 'naturalise');
  expect(ended.ending).toBe('settled');
  const text = nz.narrative(ended).at(-1)!;
  expect(text).not.toEqual(nz.characterOf('nurse').settlement);
  expect(text.en).toContain('citizenship application');
  expect(`${text.zhCN} ${text.en}`).not.toMatch(granted);
  expect(ended.log.filter(({ kind }) => kind === 'ending')).toHaveLength(1);
});

test('the Internal Affairs counter reads the presence date from the engine', () => {
  const office = visit(nz.newGame('nurse', 5, 'en'), 'dia', 600);
  expect(nz.activities(office, 'dia').map(({ id }) => id)).toEqual([
    'citizenship-info',
  ]);
  const asked = nz.doActivity(office, 'citizenship-info');
  expect(asked.outcome?.text?.en).toContain('2030-04-15');
  expect(asked.outcome?.text?.en).toContain(
    nzResidentParameters.citizenshipTestReviewFrom.value.slice(0, 4),
  );
});

test('the diary casts a line off the harbour wharf, not at a pond', () => {
  const wharf = visit(nz.newGame('nurse', 5, 'en'), 'pond', 600);
  const cast = nz.fish(wharf, false);
  expect(cast.log.at(-1)).toMatchObject({
    id: 'fishing',
    text: { zhCN: '在海湾码头抛竿', en: 'Cast at the harbour wharf' },
  });
  const diary = nz.narrative(cast);
  expect(diary.map(({ zhCN }) => zhCN).join('\n')).toContain(
    '海湾码头抛竿 1 次。',
  );
  expect(diary.map(({ en }) => en).join('\n')).toContain(
    '1 cast at the harbour wharf',
  );
});
