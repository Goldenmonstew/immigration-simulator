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
    choices: [
      {
        id: 'arrive',
        label: text,
        effects: [
          { type: 'item', item: 'seed-radish', delta: 1 },
          { type: 'item', item: 'radish', delta: 1 },
        ],
      },
    ],
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
  fishingPlace: 'river',
  allotmentPlace: 'garden',
  places: ['courtyard', 'square', 'river', 'garden'].map((id) => ({
    id,
    kind: 'outdoor',
    name: text,
  })),
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
    {
      id: 'rent-plot',
      place: 'garden',
      label: text,
      minutes: 20,
      effects: [{ type: 'money', delta: -3 }],
    },
  ],
  events: [
    {
      id: 'midnight-lantern',
      title: text,
      text,
      weight: 1,
      channel: 'place:square',
      when: [{ dayKind: 'workday' }, { minuteMin: 1440 }],
      choices: [{ id: 'watch', label: text, effects: [] }],
    },
  ],
  items: [
    { id: 'minnow', kind: 'fish', name: text },
    { id: 'radish', kind: 'crop', name: text },
    { id: 'roast-radish', kind: 'food', name: text },
    {
      id: 'seed-radish',
      kind: 'seed',
      name: text,
      grows: { crop: 'radish', days: 2, seasons: [1] },
    },
  ],
  recipes: [
    {
      id: 'roast-radish',
      label: text,
      needs: { radish: 1 },
      makes: 'roast-radish',
      minutes: 20,
    },
  ],
  catchItem: () => ({ item: 'minnow', junk: false }),
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

test.each([
  ['2030-01-06', '2030-01-20', 'lantern-walk'],
  ['2029-12-30', '2030-03-31', undefined],
  ['2030-04-06', '2030-03-31', undefined],
] as const)(
  'a pack festival dated %s keeps the special day within the quarter and after the weekend',
  (date, expectedDate, expectedFestival) => {
    const game = createGame({
      ...pack,
      calendar: () => ({ date, festival: 'lantern-walk' }),
    });
    const arrived = game.resolve(game.newGame(character.id, 81, 'en'), 'arrive');
    const weekend = game.sleep(arrived);
    const special = game.sleep(weekend);

    expect([arrived.day.date, weekend.day.date, special.day.date]).toEqual([
      '2030-01-15',
      '2030-01-19',
      expectedDate,
    ]);
    expect(special.day.festival).toBe(expectedFestival);
    expect(game.activities(special, 'courtyard').map(({ id }) => id)).toEqual(
      expectedFestival ? ['light'] : [],
    );
  },
);

test('the first dish records the pack home through a JSON round trip', () => {
  const game = createGame(pack);
  const arrived = game.resolve(game.newGame(character.id, 3, 'en'), 'arrive');
  expect(arrived.lifeRecords?.dishes).toEqual([]);

  const cooked = game.cook(arrived, 'roast-radish');
  expect(cooked.day.place).toBe('courtyard');
  expect(cooked.inventory).toMatchObject({ radish: 0, 'roast-radish': 1 });

  const restored: typeof cooked = JSON.parse(JSON.stringify(cooked));
  expect(restored.lifeRecords?.dishes).toMatchObject([
    { itemId: 'roast-radish', memory: { place: 'courtyard' } },
  ]);
});

test('a midnight event from the square leaves the player at the pack home', () => {
  const game = createGame(pack);
  const arrived = game.resolve(game.newGame(character.id, 3, 'en'), 'arrive');
  const square = game.enter(arrived, 'square');
  const before = game.tick(square, 1439 - square.day.minute);
  expect(before.day.place).toBe('square');
  expect(game.currentEvent(before)).toBeUndefined();

  const midnight = game.tick(before, 1);
  expect(game.currentEvent(midnight)?.id).toBe('midnight-lantern');
  expect(midnight.day).toMatchObject({ minute: 1440, place: 'courtyard' });

  const next = game.resolve(midnight, 'watch');
  expect(next.day).toMatchObject({ index: 1, place: 'courtyard' });
  expect(game.currentEvent(next)).toBeUndefined();
});

test('fishing uses the pack location and records the catch there', () => {
  const game = createGame(pack);
  const arrived = game.resolve(game.newGame(character.id, 3, 'en'), 'arrive');
  expect(() => game.fish(arrived, true)).toThrow('Go to the open river first');

  const river = game.enter(arrived, 'river');
  const caught = game.fish(river, true);
  expect(river.inventory.minnow).toBeUndefined();
  expect(caught.inventory.minnow).toBe(1);
  expect(caught.outcome).toMatchObject({
    kind: 'catch',
    items: { minnow: 1 },
  });
  expect(caught.lifeRecords?.fish).toMatchObject([
    {
      itemId: 'minnow',
      memory: { place: 'river', weather: river.day.weather },
    },
  ]);
});

test('a plot rented at the pack garden supports planting, watering and harvest', () => {
  const game = createGame(pack);
  const arrived = game.resolve(game.newGame(character.id, 3, 'en'), 'arrive');
  const garden = game.enter(arrived, 'garden');
  expect(garden.plots).toEqual([]);
  const rented = game.doActivity(garden, 'rent-plot');
  expect(rented.stats.money).toBe(garden.stats.money - 3);
  expect(rented.plots[0]).toEqual({ growth: 0 });

  expect(() =>
    game.plant(game.enter(rented, 'courtyard'), 0, 'seed-radish'),
  ).toThrow('Go to the open garden first');
  const planted = game.plant(rented, 0, 'seed-radish');
  expect(planted.plots[0]).toMatchObject({ seed: 'seed-radish', growth: 0 });
  expect(planted.inventory['seed-radish']).toBe(0);
  expect(() => game.water(game.enter(planted, 'courtyard'), 0)).toThrow(
    'Go to the open garden first',
  );
  const watered = game.water(planted, 0);
  expect(watered.plots[0].wateredOn).toBe(planted.dayNumber);

  const grown = game.sleep(watered);
  expect(grown.plots[0].growth).toBe(2);
  expect(() => game.harvest(grown, 0)).toThrow('Go to the open garden first');
  const harvested = game.harvest(game.enter(grown, 'garden'), 0);
  expect(harvested.inventory.radish).toBeGreaterThan(grown.inventory.radish);
  expect(harvested.plots[0]).toEqual({ growth: 0 });
  expect(harvested.lifeRecords?.harvests).toMatchObject([{ itemId: 'radish' }]);
});
