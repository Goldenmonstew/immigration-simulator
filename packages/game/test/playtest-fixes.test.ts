import { expect, test } from 'vitest';
import {
  cook,
  currentEvent,
  doActivity,
  enter,
  items,
  recipes,
  resolve,
} from '../src';
import { balance } from '../src/balance';
import { availableActivities, clear, perform, quarter } from './helpers';

test.each([
  {
    existing: undefined,
    score: balance.englishB1 - 1,
    target: 'B1',
    pass: false,
  },
  { existing: undefined, score: balance.englishB1, target: 'B1', pass: true },
  { existing: 'B1', score: 55, target: 'B2', pass: false },
  { existing: 'B1', score: 68, target: 'B2', pass: false },
  { existing: 'B1', score: balance.englishB2, target: 'B2', pass: true },
  { existing: 'B2', score: balance.englishB1, target: 'B1', pass: true },
] as const)(
  'English exam with $existing at $score shows the $target target and result',
  ({ existing, score, target, pass }) => {
    const state = clear();
    state.timeline.english = existing ? { cefrLevel: existing } : undefined;
    state.stats.english = score;
    const exam = availableActivities(state).find(
      (action) => action.id === 'exam',
    )!;
    const required = target === 'B1' ? balance.englishB1 : balance.englishB2;
    expect(exam.note?.zhCN).toContain(
      `目标 ${target}。备考进度 ${score} / ${required}`,
    );
    expect(exam.note?.en).toContain(
      `${target}. Readiness ${score} / ${required}`,
    );

    const after = perform(state, 'exam');
    const expectedEvidence =
      existing === 'B2' ? existing : pass ? target : existing;
    expect(after.timeline.english).toEqual(
      expectedEvidence ? { cefrLevel: expectedEvidence } : undefined,
    );
    const result = after.outcome!.text!;
    expect(result.zhCN).toContain(pass ? '考试通过了' : '考试没通过');
    expect(result.zhCN).toContain(target);
    expect(result.en).toContain(
      pass
        ? `passed the English test at ${target}`
        : `didn't pass the ${target}`,
    );
    expect(after.log.at(-1)?.text).toEqual(result);
    if (pass) {
      expect(currentEvent(after)).toBeUndefined();
      expect(after.flags).toContain('quarter-exam-passed');
    } else {
      expect(currentEvent(after)?.id).toBe('system-exam-failed');
      expect(currentEvent(after)?.text.en).toContain(result.en);
      expect(currentEvent(after)?.text.zhCN).toContain(result.zhCN);
      expect(resolve(after, 'study').stats.english).toBeGreaterThan(score);
    }
  },
);

test('settlement sources record the actual clamped deltas', () => {
  const before = perform(clear(), 'overtime');
  before.stats.mood = 2;
  before.stats.health = balance.healthDecay + 1;
  before.flags.push('quarter-walking-club');
  const after = quarter(before);
  const settlement = after.log.find((entry) => entry.kind === 'quarter')!;
  expect(settlement.wellbeing).toEqual([
    { source: 'seasonWear', mood: -2, health: -balance.healthDecay },
    { source: 'overtimeWear', mood: 0, health: -1 },
    {
      source: 'walkingClub',
      mood: balance.clubMood,
      health: balance.clubHealth,
    },
  ]);
  expect(settlement.statDeltas?.mood).toBe(
    after.stats.mood - before.stats.mood,
  );
  expect(settlement.statDeltas?.health).toBe(
    after.stats.health - before.stats.health,
  );
});

test('Lin Yao can find the soup after a normal workday', () => {
  const worked = perform(clear(), 'work');
  expect(worked.flags).not.toContain('worked-overtime');
  worked.day.deliveries = [{ eventId: 'sw-soup', channel: 'place:home' }];
  const event = currentEvent(enter(worked, 'home'));
  expect(event?.id).toBe('sw-soup');
  expect(event?.text.zhCN).toContain('给你留了汤');
  expect(event?.text.zhCN).not.toMatch(/加班|昨晚|早上/);
  expect(event?.text.en).toContain('Saved you some soup');
  expect(event?.text.en).not.toMatch(/overtime|late shift|last night|morning/i);
});

test.each([1, 2, 3])(
  'New Year stalls and dumpling folding differ in year %s',
  (year) => {
    const state = clear();
    state.year = year;
    Object.assign(state.day, {
      kind: 'special',
      festival: 'lunar-new-year',
      place: 'green',
      minute: 660,
    });
    const stalls = doActivity(state, 'festival');
    const folded = doActivity(stalls, 'lunar-dumplings');
    expect(stalls.outcome?.text?.zhCN).toContain('摊');
    expect(stalls.outcome?.text?.en).toContain('stall');
    expect(folded.outcome?.text?.zhCN).toContain('饺子');
    expect(folded.outcome?.text?.en).toContain('dumpling');
    expect(folded.inventory.dumplings).toBe(1);
  },
);

test('the dish and recipe name the fish that the kitchen actually accepts', () => {
  const recipe = recipes.find((entry) => entry.id === 'fish-and-potatoes')!;
  const dish = items.find((item) => item.id === recipe.makes)!;
  for (const label of [recipe.label, dish.name]) {
    expect(label.zhCN).toContain('河鲈');
    expect(label.en.toLowerCase()).toContain('perch');
  }
  const state = clear();
  state.inventory = { carp: 1, potato: 1 };
  expect(() => cook(state, recipe.id)).toThrow();
  state.inventory.perch = 1;
  const cooked = cook(state, recipe.id);
  expect(cooked.inventory).toMatchObject({
    carp: 1,
    perch: 0,
    'fish-and-potatoes': 1,
  });
});
