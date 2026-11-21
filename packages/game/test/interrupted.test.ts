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
function newYearAt(minute: number): GameState {
  let state = newGame('skilled-worker', 176);
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
