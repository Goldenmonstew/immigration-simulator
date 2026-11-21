import { expect, test } from 'vitest';
import {
  currentEvent,
  doActivity,
  enter,
  newGame,
  resolve,
  sleep,
  tick,
} from '../src';
import type { GameState } from '../src';
import './helpers';

// Seed 176: the parents' call rings at 18:44 on the first Lunar New Year day.
function newYearAt(minute: number, seed = 176): GameState {
  let state = newGame('skilled-worker', seed);
  while (state.pendingEvent || state.day.index < 2)
    state = state.pendingEvent
      ? resolve(state, currentEvent(state)!.choices[0].id)
      : sleep(state);
  expect(state.day.festival).toBe('lunar-new-year');
  return enter(tick(state, minute - state.day.minute), 'green');
}

test('task 56 / review56-4: a call during or at the end of an action holds its result; one after it does not', () => {
  // 18:14 + 90 minutes: the call at 18:44 interrupts the stalls.
  const during = doActivity(newYearAt(18 * 60 + 14), 'festival');
  expect(during.pendingEvent).toBe('sw-parents-call');
  expect(during.interruptedOutcome?.actionId).toBe('festival');
  expect(during.interruptedOutcome?.text).toEqual(during.outcome?.text);
  // 17:14 + 90 minutes ends at the call itself.
  const atEnd = doActivity(newYearAt(17 * 60 + 14), 'festival');
  expect(atEnd.pendingEvent).toBe('sw-parents-call');
  expect(atEnd.interruptedOutcome?.actionId).toBe('festival');
  // 17:00 + 90 minutes ends at 18:30; the clock later rings the call.
  const done = doActivity(newYearAt(17 * 60), 'festival');
  expect(done.pendingEvent).toBeUndefined();
  const rung = tick(done, 20);
  expect(rung.pendingEvent).toBe('sw-parents-call');
  expect(rung.interruptedOutcome).toBeUndefined();
  // Resolving the call clears it.
  expect(
    resolve(during, currentEvent(during)!.choices[0].id).interruptedOutcome,
  ).toBeUndefined();
});

test('review56-5: letters, exam results and the next morning are not interrupting calls', () => {
  // Seeds 2 and 20: the stalls at 22:30 run into midnight, where a letter or
  // the next quarter's morning event follows instead of a call.
  for (const seed of [2, 20]) {
    const late = doActivity(newYearAt(22 * 60 + 30, seed), 'festival');
    expect(late.interruptedOutcome).toBeUndefined();
  }
  // A failed exam queues its own event.
  const college = enter(newYearAt(10 * 60), 'college');
  const failed = doActivity(
    { ...college, stats: { ...college.stats, english: 68 } },
    'exam',
  );
  expect(failed.pendingEvent).toBe('system-exam-failed');
  expect(failed.interruptedOutcome).toBeUndefined();
});
