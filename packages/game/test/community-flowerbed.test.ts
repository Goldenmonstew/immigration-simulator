import { describe, expect, test } from 'vitest';
import {
  activities,
  doActivity,
  enter,
  newGame,
  plant,
  sleep,
  water,
} from '../src';
import type { GameState } from '../src';
import { clear, completeQuarter, quarter } from './helpers';

const restore = (state: GameState): GameState =>
  JSON.parse(JSON.stringify(state));
const flags = (state: GameState) =>
  state.flags.filter((flag) => flag.startsWith('flowerbed-'));
const menu = (state: GameState) =>
  activities(state, 'allotment')
    .filter((a) => a.id.startsWith('flowerbed-'))
    .map((a) => a.id);
const visit = (state: GameState) => enter(clear(state), 'allotment');
const nextQuarter = (state: GameState) => visit(clear(quarter(state)));

describe('12.6 community flowerbed', () => {
  test.each(['work', 'sunflower', 'tulip'])(
    '%s follows five manual interactions through three persistent stages without a money gate',
    (route) => {
      const before = visit(newGame('skilled-worker', 3));
      expect(menu(before)).toEqual(['flowerbed-mark']);
      const marked = doActivity(before, 'flowerbed-mark');
      expect(flags(before)).toEqual([]);
      expect(flags(marked)).toEqual(['flowerbed-marked']);
      expect(menu(marked)).toEqual([]);
      let state = nextQuarter(restore(marked));
      if (route === 'sunflower') state = nextQuarter(state);
      expect(menu(state)).toEqual(['flowerbed-work']);
      if (route !== 'work') {
        state.inventory[`seed-${route}`] = 1;
        state.plots = [{ growth: 0 }];
        state = plant(state, 0, `seed-${route}`);
        expect(menu(state)).not.toContain(`flowerbed-donate-${route}`);
        state = water(state, 0);
        state = visit(clear(sleep(state)));
        expect(state.plots[0].growth).toBeGreaterThan(0);
        expect(menu(state)).toContain(`flowerbed-donate-${route}`);
      }
      state.stats.money = 0;
      const prepared = doActivity(
        state,
        route === 'work' ? 'flowerbed-work' : `flowerbed-donate-${route}`,
      );
      expect(prepared.stats.money).toBe(0);
      expect(flags(prepared)).toContain('flowerbed-prepared');
      if (route !== 'work') {
        expect(state.plots[0].seed).toBe(`seed-${route}`);
        expect(prepared.plots[0]).toEqual({ growth: 0 });
        expect(prepared.lifeRecords).toEqual(state.lifeRecords);
      }
      expect(menu(prepared)).toEqual(['flowerbed-plant']);
      const planted = doActivity(restore(prepared), 'flowerbed-plant');
      expect(flags(planted)).toContain('flowerbed-planted');
      expect(menu(planted)).toEqual([]);
      const later = nextQuarter(restore(planted));
      expect(flags(later)).toEqual(flags(planted));
      expect(menu(later)).toEqual(['flowerbed-tend']);
      const tended = doActivity(later, 'flowerbed-tend');
      expect(menu(tended)).toEqual(['flowerbed-open']);
      const opened = doActivity(restore(tended), 'flowerbed-open');
      expect(opened.flags).toContain('flowerbed-open');
      expect(opened.outcome?.text?.zhCN).toContain(
        route === 'work'
          ? '你松过的土'
          : route === 'sunflower'
            ? '你育的向日葵'
            : '你育的郁金香',
      );
      expect(opened.outcome?.text?.zhCN).toContain('玛格丽特');
      expect(opened.outcome?.text?.en).toContain('Rahman');
      expect(opened.log.at(-1)?.text).toEqual(opened.outcome?.text);
      expect(
        opened.log.filter((entry) => entry.id.startsWith('flowerbed-')),
      ).toHaveLength(5);
      expect(restore(opened)).toEqual(opened);
      expect(menu(opened)).toEqual([]);
      expect(() => doActivity(opened, 'flowerbed-open')).toThrow(
        'not available',
      );
    },
  );

  test('fast-forward preserves every reached stage without doing the next interaction', () => {
    let state = visit(newGame('skilled-worker', 1));
    state.timeline.episodes[0].validTo = '2040-01-01';
    for (const action of [
      undefined,
      'flowerbed-mark',
      'flowerbed-work',
      'flowerbed-plant',
      'flowerbed-tend',
      'flowerbed-open',
    ]) {
      if (action) state = doActivity(visit(state), action);
      const reached = flags(state);
      const count = state.log.filter((entry) =>
        entry.id.startsWith('flowerbed-'),
      ).length;
      state = completeQuarter(restore(state));
      expect(flags(state)).toEqual(reached);
      expect(
        state.log.filter((entry) => entry.id.startsWith('flowerbed-')),
      ).toHaveLength(count);
      expect(state.ending).toBeUndefined();
    }
  });

  test('time, place and missing or ungrown seedlings do not consume a plot or advance the project', () => {
    const state = nextQuarter(
      doActivity(visit(newGame('family-partner', 1)), 'flowerbed-mark'),
    );
    state.inventory['seed-tulip'] = 1;
    state.inventory.tulip = 1;
    state.plots = [{ seed: 'seed-tulip', growth: 0 }];
    expect(menu(state)).toEqual(['flowerbed-work']);
    expect(() => doActivity(state, 'flowerbed-donate-tulip')).toThrow(
      'not available',
    );
    expect(state.plots[0].seed).toBe('seed-tulip');
    const home = enter(state, 'home');
    expect(() => doActivity(home, 'flowerbed-work')).toThrow('not available');
    state.day.minute = 1081;
    expect(menu(state)).toEqual([]);
    expect(flags(state)).toEqual(['flowerbed-marked']);
  });
});
