import { expect, test } from 'vitest';
import { currentEvent, loadCharacter, newGame } from '../src';

test('a new game requires its own character story to be loaded', async () => {
  expect(() => newGame('skilled-worker', 1)).toThrow(/skilled-worker/);

  await loadCharacter('skilled-worker');
  const state = newGame('skilled-worker', 1);
  expect(currentEvent(state)?.id).toBe('opening-skilled-worker');
  expect(() => newGame('graduate', 1)).toThrow(/graduate/);
});
