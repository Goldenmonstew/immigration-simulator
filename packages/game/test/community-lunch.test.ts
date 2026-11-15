import { describe, expect, test } from 'vitest';
import {
  activities,
  buy,
  cook,
  doActivity,
  enter,
  fastForward,
  gift,
  items,
  newGame,
  npcAt,
  npcs,
  sleep,
  talk,
  tick,
} from '../src';
import type { GameState } from '../src';
import { balance as b } from '../src/balance';
import { clear, completeQuarter, quarter } from './helpers';

const posted = 'quarter-board-community-lunch';
const photo = 'community-lunch-photo';
const followup = 'quarter-community-lunch-followup';
const attended = (state: GameState) =>
  `community-lunch-attended:${state.day.date.slice(0, 4)}`;
const restore = (state: GameState): GameState =>
  JSON.parse(JSON.stringify(state));
const menu = (state: GameState) =>
  activities(state, 'green')
    .map((action) => action.id)
    .filter((id) => id.startsWith('community-lunch-'));

// Find an actual seasonal announcement without replacing the random draw.
const invitation = (() => {
  for (let seed = 1; seed <= 100; seed++) {
    let state = clear(newGame('skilled-worker', seed));
    state.timeline.episodes[0].validTo = '2040-01-01';
    state = clear(quarter(clear(quarter(state))));
    if (state.flags.includes(posted)) return state;
  }
  throw new Error('No summer lunch announcement found');
})();
const summer = () => structuredClone(invitation);
const morning = () => enter(clear(sleep(summer())), 'green');
const noon = (state = morning()) => tick(state, 720 - state.day.minute);
const join = (state = noon()) =>
  doActivity(enter(state, 'green'), 'community-lunch-attend');

describe('12.1 neighbourhood lunch', () => {
  test('a real summer notice gives the date, place, free route and food options in both languages', () => {
    const before = summer();
    expect(before.quarter).toBe(3);
    expect(menu(before)).toEqual([]);
    const read = doActivity(enter(before, 'board'), 'board');
    expect(read.outcome?.text?.zhCN).toMatch(/邻里聚餐.*村绿地/);
    expect(read.outcome?.text?.zhCN).toContain('12:00–16:00');
    expect(read.outcome?.text?.zhCN).toContain('当日上午');
    expect(read.outcome?.text?.en).toContain('last arrival 15:00');
    expect(read.outcome?.text?.en).toContain('baked potato or biscuits');
    expect(restore(read).flags).toEqual(read.flags);
    expect(menu(morning())).toEqual(['community-lunch-tables']);
    expect(menu({ ...morning(), flags: [] })).toEqual([]);
    for (const weather of ['sunny', 'rain', 'snow'] as const) {
      const scene = noon();
      scene.day.weather = weather;
      expect(npcAt(scene, 'margaret')).toBe('green');
    }
  });

  test('no money is needed to borrow tables, attend and keep a visible souvenir', () => {
    const before = morning();
    before.stats.money = 0;
    expect(menu(before)).toContain('community-lunch-tables');
    const prepared = doActivity(before, 'community-lunch-tables');
    expect(before.flags).not.toContain('quarter-community-lunch-tables');
    expect(prepared.flags).toContain('quarter-community-lunch-tables');
    expect(prepared.outcome?.text?.zhCN).toContain('折叠桌');
    expect(menu(prepared)).toEqual([]);
    const after = join(noon(restore(prepared)));
    expect(after.stats.money).toBe(0);
    expect(after.friendship.margaret).toBe(b.festivalFriendship);
    expect(after.outcome?.text?.zhCN).toContain('盘子都不晃了');
    expect(after.inventory[photo]).toBe(1);
    expect(items.find((item) => item.id === photo)?.name).toEqual({
      zhCN: '邻里聚餐合照',
      en: 'Neighbourhood lunch photograph',
    });
    expect(after.log.at(-1)?.text).toEqual(after.outcome?.text);
    expect(after.log.at(-1)?.text.zhCN).toContain('合照');
    expect(menu(after)).toEqual([]);
    expect(() => join(after)).toThrow('Activity is not available');
  });

  test.each(['baked-potato', 'biscuits'] as const)(
    'the %s food route contributes one item and is remembered after saving',
    (food) => {
      let before = morning();
      if (food === 'baked-potato') {
        before.inventory.potato = 1;
        before = cook(enter(before, 'home'), food);
        expect(before.inventory.potato).toBe(0);
      } else {
        before = tick(before, 480 - before.day.minute);
        const money = before.stats.money;
        before = buy(enter(before, 'shop'), food, 1);
        expect(before.stats.money).toBe(money - b.prices.biscuits);
      }
      before = enter(before, 'green');
      expect(before.inventory[food]).toBe(1);
      const prepared = doActivity(before, `community-lunch-${food}`);
      expect(prepared.inventory[food]).toBe(0);
      expect(prepared.flags).toContain('quarter-community-lunch-food');
      expect(prepared.outcome?.items).toEqual({ [food]: -1 });
      expect(menu(prepared)).toEqual([]);
      const after = join(noon(restore(prepared)));
      expect(after.outcome?.text?.zhCN).toContain('你带来的食物');
      expect(after.inventory[photo]).toBe(1);
      expect(restore(after)).toEqual(after);
      expect(join(noon(prepared))).toEqual(after);
    },
  );

  test('a player without preparation can just sit down, including with no money', () => {
    const before = noon();
    before.stats.money = 0;
    expect(menu(before)).toEqual(['community-lunch-attend']);
    const after = join(before);
    expect(after.outcome?.text?.zhCN).toContain('你空手坐下');
    expect(after.stats.money).toBe(0);
    expect(after.inventory[photo]).toBe(1);
    expect(after.flags).toContain(attended(before));
  });

  test('preparation closes at noon and the last arrival is at three', () => {
    const before = morning();
    before.day.minute = 690;
    expect(menu(before)).toContain('community-lunch-tables');
    before.day.minute++;
    expect(menu(before)).not.toContain('community-lunch-tables');
    expect(menu(noon())).toEqual(['community-lunch-attend']);
    const last = noon();
    last.day.minute = 900;
    expect(join(last).day.minute).toBe(960);
    last.day.minute++;
    expect(menu(last)).toEqual([]);
    last.day.minute = 960;
    expect(npcAt(last, 'margaret')).not.toBe('green');
  });

  test.each([false, true])(
    'missing the lunch (prepared: %s) leaves no completion or souvenir and expires the preparation',
    (prepare) => {
      let state = morning();
      if (prepare) state = doActivity(state, 'community-lunch-tables');
      state = clear(sleep(state));
      expect(state.day.index).toBe(2);
      expect(menu(state)).toEqual([]);
      expect(state.inventory[photo]).toBeUndefined();
      expect(state.flags).not.toContain(attended(state));
      state = clear(quarter(state));
      expect(
        state.flags.some((flag) => flag.startsWith('quarter-community-lunch-')),
      ).toBe(false);
      expect(state.flags).not.toContain(posted);
      expect(
        state.log.some((entry) => entry.id === 'community-lunch-attend'),
      ).toBe(false);
    },
  );

  test('the next-season meeting recalls lunch once, survives JSON and leaves a diary entry', () => {
    const after = join();
    expect(after.flags).not.toContain(followup);
    let next = clear(quarter(restore(after)));
    expect(next.quarter).toBe(4);
    expect(next.flags).toContain(followup);
    expect(next.flags).not.toContain('quarter-community-lunch-attended');
    next = restore(next);
    const spoken = talk(next, 'margaret');
    expect(spoken.outcome?.text?.zhCN).toContain('上季聚餐');
    expect(spoken.outcome?.text?.en).toContain('last season');
    expect(spoken.flags).not.toContain(followup);
    expect(spoken.log.at(-1)?.id).toBe('community-lunch-followup');
    expect(talk(clear(spoken), 'margaret').outcome?.text?.zhCN).not.toContain(
      '上季聚餐',
    );
    const missed = clear(quarter(next));
    expect(missed.flags).not.toContain(followup);
    expect(talk(missed, 'margaret').outcome?.text?.zhCN).not.toContain(
      '上季聚餐',
    );
  });

  test('another annual announcement permits one visit, repeats the recall and never replaces the photograph', () => {
    let state = join();
    const previousYear = state.day.date.slice(0, 4);
    state = clear(quarter(state));
    state = talk(state, 'margaret');
    expect(state.heard).toContain('margaret-recent-community-lunch');
    // Even giving away the photograph does not permit a replacement next year.
    state = gift(state, 'margaret', photo);
    expect(state.inventory[photo]).toBe(0);
    for (let q = 0; q < 3; q++) {
      state = clear(quarter(clear(state)));
    }
    expect(state.quarter).toBe(3);
    // The random announcement itself is covered above; isolate a later invite.
    if (!state.flags.includes(posted)) state.flags.push(posted);
    expect(state.day.date.slice(0, 4)).not.toBe(previousYear);
    state.stats.mood = state.stats.health = 80;
    state = clear(sleep(state));
    const ready = noon(state);
    expect(menu(ready)).toContain('community-lunch-attend');
    const repeat = join(ready);
    expect(repeat.outcome?.text?.zhCN).toContain('你空手坐下');
    expect(repeat.inventory[photo]).toBe(0);
    expect(repeat.outcome?.items).toBeUndefined();
    expect(
      repeat.flags.filter((flag) =>
        flag.startsWith('community-lunch-attended:'),
      ),
    ).toHaveLength(2);
    expect(menu(restore(repeat))).toEqual([]);
    expect(
      talk(clear(quarter(repeat)), 'margaret').outcome?.text?.zhCN,
    ).toContain('上季聚餐');
  });

  test.each([false, true])(
    'fast-forward does not finish the chain (prepared: %s)',
    (prepare) => {
      let before = morning();
      if (prepare) before = doActivity(before, 'community-lunch-tables');
      const after = completeQuarter(before);
      expect(after.inventory[photo]).toBeUndefined();
      expect(after.flags).not.toContain('community-lunch-photo-received');
      expect(after.flags).not.toContain(followup);
      expect(
        after.flags.some((flag) =>
          flag.startsWith('community-lunch-attended:'),
        ),
      ).toBe(false);
      expect(
        after.log.some((entry) => entry.id === 'community-lunch-attend'),
      ).toBe(false);
      expect(
        fastForward({ ...before, pendingEvent: 'opening-skilled-worker' }),
      ).toMatchObject(before);
    },
  );

  test('the added speech remains short and bilingual', () => {
    const line = npcs
      .find((npc) => npc.id === 'margaret')!
      .lines.find((entry) => entry.id === 'margaret-recent-community-lunch')!;
    expect(line.text.zhCN.length).toBeLessThanOrEqual(40);
    expect(line.text.en).not.toBe('');
    for (const action of menu(morning())) {
      const result = doActivity(morning(), action);
      expect(result.outcome?.text?.zhCN.length).toBeLessThanOrEqual(60);
      expect(result.outcome?.text?.en).not.toBe('');
    }
  });
});
