/// <reference types="node" />

import { createHash } from 'node:crypto';
import { expect, test } from 'vitest';
import { activities, doActivity, enter, newGame, progress } from '../src';
import { completeQuarter } from './helpers';

const digest = (value: unknown) =>
  createHash('sha256').update(JSON.stringify(value)).digest('hex');

function play(characterId: string, seed: number) {
  let state = newGame(characterId, seed, 'en');
  const quarters: { date: string; assessment: string }[] = [];
  for (let i = 0; !state.ending && i < 40; i++) {
    if (!state.pendingEvent && i > 0) {
      const atVisa = enter(
        { ...state, day: { ...state.day, minute: 600 } },
        'visa',
      );
      const renewal = activities(atVisa, 'visa').find(
        (action) =>
          action.id ===
          (characterId === 'graduate' ? 'graduate-switch' : 'extend'),
      );
      if (renewal) state = doActivity(atVisa, renewal.id);
    }
    state = completeQuarter(state);
    quarters.push({
      date: state.date,
      assessment: digest([progress(state), state.result]),
    });
    state = JSON.parse(JSON.stringify(state));
  }
  const events = state.log
    .filter((entry) => entry.kind === 'event')
    .map(({ year, quarter, id, choiceId }) => [year, quarter, id, choiceId]);
  return {
    quarterCount: quarters.length,
    assessments: digest(quarters),
    eventCount: events.length,
    events: digest([events, state.firedEvents]),
    ending: state.ending,
    state: digest(state),
  };
}

test.each([
  ['skilled-worker', 8101],
  ['hong-kong-bno', 8102],
  ['family-partner', 8103],
  ['graduate', 8104],
] as const)(
  '%s matches the pre-pack quarterly results, event sequence and final save',
  (id, seed) => {
    expect(play(id, seed)).toMatchSnapshot();
  },
);
