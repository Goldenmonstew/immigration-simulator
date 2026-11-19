import { describe, expect, test } from 'vitest';
import {
  buy,
  cook,
  eat,
  enter,
  fish,
  gift,
  harvest,
  items,
  newGame,
  recipes,
} from '../src';
import type { GameState } from '../src';
import { clear } from './helpers';

const restore = (state: GameState): GameState =>
  JSON.parse(JSON.stringify(state));

describe('12.6 persistent life records', () => {
  test('each fish is recorded on its first real catch, excluding misses and junk', () => {
    const seen = new Set<string>();
    for (let seed = 1; seed <= 40; seed++) {
      const before = clear(newGame('skilled-worker', seed));
      before.quarter = seed % 2 ? 1 : 3;
      before.day.weather = 'sunny';
      const atPond = enter(before, 'pond');
      expect(fish(atPond, false).lifeRecords?.fish).toEqual([]);
      const caught = fish(restore(atPond), true);
      const id = Object.keys(caught.outcome!.items!)[0];
      expect(atPond.lifeRecords?.fish).toEqual([]);
      if (items.find((item) => item.id === id)?.kind !== 'fish') {
        expect(caught.lifeRecords?.fish).toEqual([]);
        continue;
      }
      seen.add(id);
      const record = {
        itemId: id,
        year: 1,
        quarter: before.quarter,
        memory: { place: 'pond', weather: 'sunny' },
      };
      expect(caught.lifeRecords?.fish).toEqual([record]);
      for (const consumed of [eat(caught, id), gift(caught, 'margaret', id)]) {
        expect(consumed.inventory[id]).toBe(0);
        expect(restore(consumed).lifeRecords?.fish).toEqual([record]);
      }
      const repeat = restore(caught);
      repeat.randomState = before.randomState;
      repeat.year = 2;
      repeat.day.weather = 'cloudy';
      const caughtAgain = fish(repeat, true);
      expect(caughtAgain.outcome?.items).toEqual({ [id]: 1 });
      expect(caughtAgain.lifeRecords?.fish).toEqual([record]);
    }
    expect([...seen].sort()).toEqual(
      items
        .filter((i) => i.kind === 'fish')
        .map((i) => i.id)
        .sort(),
    );
  });

  test.each(recipes)(
    '$id records the cooked output once and survives eating, gifting and JSON',
    (recipe) => {
      const before = clear(newGame('skilled-worker', 1));
      before.day.weather = 'rain';
      before.inventory = Object.fromEntries(
        Object.entries(recipe.needs).map(([id, qty]) => [id, qty * 2]),
      );
      const made = cook(before, recipe.id);
      const record = {
        itemId: recipe.makes,
        year: 1,
        quarter: before.quarter,
        memory: { place: 'home', weather: 'rain' },
      };
      expect(before.lifeRecords?.dishes).toEqual([]);
      expect(made.lifeRecords?.dishes).toEqual([record]);
      for (const consumed of [
        eat(made, recipe.makes),
        gift(made, 'margaret', recipe.makes),
      ]) {
        expect(consumed.inventory[recipe.makes]).toBe(0);
        expect(restore(consumed).lifeRecords?.dishes).toEqual([record]);
      }
      const repeat = restore(made);
      repeat.year = 2;
      repeat.day.weather = 'snow';
      const madeAgain = cook(repeat, recipe.id);
      expect(madeAgain.inventory[recipe.makes]).toBe(2);
      expect(madeAgain.lifeRecords?.dishes).toEqual([record]);
    },
  );

  test('each harvest is retained by crop ID, including repeats in another year/season', () => {
    const before = enter(clear(newGame('skilled-worker', 1)), 'allotment');
    before.plots = [{ seed: 'seed-turnip', growth: 100 }];
    const first = harvest(before, 0);
    expect(first.inventory.turnip).toBeGreaterThan(0);
    expect(first.lifeRecords?.harvests).toEqual([
      { itemId: 'turnip', year: 1, quarter: 1 },
    ]);
    const again = restore(first);
    again.year = 2;
    again.quarter = 4;
    again.plots = [{ seed: 'seed-turnip', growth: 100 }];
    let second = harvest(again, 0);
    expect(second.lifeRecords?.harvests).toEqual([
      { itemId: 'turnip', year: 1, quarter: 1 },
      { itemId: 'turnip', year: 2, quarter: 4 },
    ]);
    second = gift(second, 'margaret', 'turnip');
    while (second.inventory.turnip) second = eat(second, 'turnip');
    expect(restore(second).lifeRecords).toEqual(harvest(again, 0).lifeRecords);
    expect(before.lifeRecords?.harvests).toEqual([]);
  });

  test('old v3 saves remain playable, lazily start empty records and do not infer inventory history', () => {
    const old = clear(newGame('skilled-worker', 1));
    delete old.lifeRecords;
    old.day.minute = 600;
    old.inventory = { perch: 1, potato: 1, 'baked-potato': 1 };
    expect(restore(old).version).toBe(3);
    expect(eat(restore(old), 'perch').lifeRecords).toBeUndefined();
    expect(
      gift(restore(old), 'margaret', 'baked-potato').lifeRecords,
    ).toBeUndefined();
    const made = cook(restore(old), 'baked-potato');
    expect(made.lifeRecords).toEqual({
      fish: [],
      harvests: [],
      dishes: [
        {
          itemId: 'baked-potato',
          year: 1,
          quarter: 1,
          memory: { place: 'home', weather: old.day.weather },
        },
      ],
    });
    const bought = buy(enter(restore(old), 'shop'), 'biscuits', 1);
    expect(bought.lifeRecords).toBeUndefined();
    expect(() => cook({ ...old, inventory: {} }, 'baked-potato')).toThrow(
      'Ingredients',
    );
    expect(old.lifeRecords).toBeUndefined();
  });

  test('cooking again does not backfill an earlier record without a memory', () => {
    const old = clear(newGame('skilled-worker', 1));
    old.year = 2;
    old.inventory = { potato: 1 };
    const record = { itemId: 'baked-potato', year: 1, quarter: 1 } as const;
    old.lifeRecords!.dishes = [record];
    const made = cook(restore(old), 'baked-potato');
    expect(made.inventory['baked-potato']).toBe(1);
    expect(made.lifeRecords?.dishes).toEqual([record]);
  });
});
