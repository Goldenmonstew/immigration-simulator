import { expect, test } from 'vitest';
import { createGame, type Character, type GameContentPack } from '../src/core';

type Timeline = { stamps: number };
type Result = { stamps: number; evaluatedOn: string };
type Stamp = { type: 'stamp'; amount: number };
type Festival = 'lantern-walk';
type Decision = 'ready' | 'waiting';

const text = { zhCN: '点灯', en: 'Light the lantern' };
const character: Character<Timeline, Stamp, Result, Festival> = {
  id: 'resident',
  name: text,
  intro: text,
  sprite: 'resident.png',
  startDate: '2030-01-01',
  timeline: { stamps: 0 },
  stats: { money: 10, mood: 70, health: 70, career: 0 },
  settlement: text,
  opening: {
    id: 'arrival',
    title: text,
    text,
    weight: 1,
    choices: [{ id: 'arrive', label: text, effects: [] }],
  },
  events: [],
};

const pack: GameContentPack<
  Timeline,
  Result,
  Stamp,
  'town-permit',
  Decision,
  Festival
> = {
  characters: [character],
  loadCharacter: async () => character,
  characterOf: () => character,
  home: 'courtyard',
  places: [{ id: 'courtyard', kind: 'outdoor', name: text }],
  actions: [
    {
      id: 'light',
      place: 'courtyard',
      label: text,
      minutes: 10,
      effects: [
        { type: 'money', delta: -2 },
        { type: 'stamp', amount: 1 },
      ],
      when: [{ festival: 'lantern-walk' }],
    },
  ],
  festivals: [{ id: 'lantern-walk', name: text, text, season: 1 }],
  calendar: () => ({ date: '2030-03-20', festival: 'lantern-walk' }),
  rules: {
    evaluate: ({ date, timeline }) => ({
      stamps: timeline.stamps,
      evaluatedOn: date,
    }),
    progress: (state) => ({
      'town-permit': {
        outcome: state.result.stamps ? 'ready' : 'waiting',
        percent: state.result.stamps ? 100 : 0,
      },
    }),
    applyEffect(state, effect) {
      state.timeline.stamps += effect.amount;
      return true;
    },
  },
  endingText: () => text,
  balance: { years: 1, quartersPerYear: 1 },
};

test('a minimal pack plays from opening through its own festival, assessment and ending', async () => {
  const game = createGame(pack);
  await pack.loadCharacter(character.id);
  const start = game.newGame(character.id, 81, 'en');
  expect(game.currentEvent(start)?.id).toBe('arrival');
  expect(game.progress(start)['town-permit'].outcome).toBe('waiting');
  const arrived = game.resolve(start, 'arrive');
  expect(game.activities(arrived, 'courtyard')).toEqual([]);

  const festival = game.sleep(game.sleep(arrived));
  expect(festival.day.festival).toBe('lantern-walk');
  expect(game.activities(festival, 'courtyard').map(({ id }) => id)).toEqual([
    'light',
  ]);
  const stamped = game.doActivity(festival, 'light');
  expect(stamped.stats.money).toBe(8);
  expect(game.progress(stamped)['town-permit']).toEqual({
    outcome: 'ready',
    percent: 100,
  });
  expect(start.timeline.stamps).toBe(0);

  const restored: typeof stamped = JSON.parse(JSON.stringify(stamped));
  const ending = game.sleep(restored);
  expect(game.isOver(ending)).toBe(true);
  expect(ending.ending).toBe('timeout');
  expect(ending.result).toEqual({ stamps: 1, evaluatedOn: '2030-04-01' });
  expect(ending.log.map(({ id }) => id)).toEqual([
    'arrival',
    'light',
    'quarter',
    'timeout',
  ]);
});
