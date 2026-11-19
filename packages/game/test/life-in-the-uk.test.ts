import { evaluate } from '@uk-immigration/engine';
import { describe, expect, test } from 'vitest';
import {
  activities,
  currentEvent,
  doActivity,
  enter,
  newGame,
  sleep,
  talk,
  tick,
} from '../src';
import { commonEvents } from '../src/events/common';
import { locationActions } from '../src/locations';
import { characters, clear } from './helpers';

const id = 'life-in-the-uk';
const cards = [...commonEvents, ...characters[0].events].filter((event) =>
  ['sw-kol', 'common-book', 'common-book-after', 'common-kol-retake'].includes(
    event.id,
  ),
);

describe('10.5 Life in the UK action', () => {
  test.each(characters)(
    'A7#8 $id discloses the game shortcut and records an immediate pass at no cost',
    (character) => {
      const before = clear(newGame(character.id, 1));
      before.day.minute = 540;
      before.stats.money = 0;
      const action = activities(before, 'college').find((a) => a.id === id)!;
      expect(action).toMatchObject({
        label: {
          zhCN: '参加 Life in the UK 考试（游戏内免费）',
          en: 'Take the Life in the UK test (free in this game)',
        },
        oncePerDay: true,
        effects: [{ type: 'lifeInTheUk' }],
        minutes: locationActions.find((a) => a.id === 'exam')!.minutes,
      });
      expect(action.note?.zhCN).toContain('须提前网上预约并付费（SRC-045');
      expect(action.note?.en).toContain(
        'book online in advance and pay the fee (SRC-045',
      );
      expect(action.note?.zhCN).toContain('直接记为通过');
      expect(action.note?.en).toContain('records a pass straight away');
      expect(before.timeline.lifeInTheUk).toBeUndefined();
      const after = doActivity(enter(before, 'college'), id);
      expect(after.timeline.lifeInTheUk).toEqual({ passed: true });
      expect(after.stats.money).toBe(before.stats.money);
      expect(after.day.minute).toBe(before.day.minute + action.minutes);
      expect(after.day.done).toContain(id);
      expect(after.outcome?.text?.zhCN).toBe(
        'Life in the UK 考试通过了，证明收进文件夹。',
      );
      expect(after.result).not.toEqual(before.result);
      expect(after.result).toEqual(
        evaluate({
          simulationDate: after.date,
          timeline: after.timeline,
          locale: after.locale,
        }),
      );
      expect(Object.keys(after.result.byRuleSet)).toHaveLength(2);
      expect(activities(after, 'college').some((a) => a.id === id)).toBe(false);
      expect(
        activities(
          { ...after, day: { ...after.day, done: [] } },
          'college',
        ).some((a) => a.id === id),
      ).toBe(false);
    },
  );

  test('opening hours, time to finish and once-per-day restrictions apply', () => {
    const state = clear();
    for (const minute of [420, 1260, 1259]) {
      state.day.minute = minute;
      expect(activities(state, 'college').some((a) => a.id === id)).toBe(false);
      expect(() => doActivity(enter(state, 'college'), id)).toThrow();
    }
    state.day.minute = 1140;
    expect(activities(state, 'college').some((a) => a.id === id)).toBe(true);
    state.day.done.push(id);
    expect(activities(state, 'college').some((a) => a.id === id)).toBe(false);
    const tomorrow = clear(sleep(state));
    tomorrow.day.minute = 540;
    expect(activities(tomorrow, 'college').some((a) => a.id === id)).toBe(true);
  });

  test.each(cards)(
    '$id stops delivering after a pass, including an already scheduled card',
    (event) => {
      const before = clear();
      before.quarter = event.season ?? before.quarter;
      before.year = 5;
      before.flags.push(...(event.requires ?? []));
      before.day.minute = 600;
      before.day.deliveries = [{ eventId: event.id, channel: event.channel! }];
      const deliver = (state: typeof before) =>
        event.channel === 'npc:helen'
          ? talk(state, 'helen')
          : event.channel === 'place:home'
            ? enter(enter(state, 'green'), 'home')
            : tick(state, 0);
      expect(currentEvent(deliver(before))?.id).toBe(event.id);
      const after: typeof before = {
        ...before,
        timeline: { ...before.timeline, lifeInTheUk: { passed: true } },
      };
      expect(currentEvent(deliver(after))).toBeUndefined();
      expect(sleep(after).firedEvents).not.toContain(event.id);
    },
  );
});
