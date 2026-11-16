import { describe, expect, test } from 'vitest';
import {
  activities,
  buy,
  characters,
  currentEvent,
  doActivity,
  enter,
  newGame,
  npcs,
  readMail,
  resolve,
  tick,
} from '../src';
import type { GameEvent, GameState, Text } from '../src';
import { balance as b } from '../src/balance';
import { commonEvents, systemEvents } from '../src/events/common';
import { policyStories } from '../src/events/policy';
import { heartEvents, townHeartLetters } from '../src/npcs';
import { clear, completeQuarter, quarter } from './helpers';

function at(date: string, character = 'skilled-worker') {
  const state = clear(newGame(character, 1));
  state.date = state.day.date = date;
  return state;
}
function receive(state: GameState, event: GameEvent) {
  state.day.deliveries = [{ eventId: event.id, channel: event.channel! }];
  return event.channel === 'letter' ? readMail(state) : tick(state, 0);
}
const events = [
  ...commonEvents,
  ...systemEvents,
  ...characters.flatMap((c) => c.events),
  ...heartEvents,
  ...townHeartLetters,
  ...policyStories.map((s) => s.event),
  ...characters.map((c) => currentEvent(newGame(c.id, 1))!),
];
const textOf = (event: GameEvent): Text[] => [
  event.title,
  event.text,
  ...event.choices.flatMap((choice) => [
    choice.label,
    ...(choice.note ? [choice.note] : []),
  ]),
];

describe('11.2 news and the old-rules window', () => {
  test.each(policyStories.filter((s) => s.event.id.startsWith('news-')))(
    '$event.id is unavailable before publication, then appears once in the next quarter',
    (story) => {
      for (const character of characters) {
        const before = new Date(story.published);
        before.setUTCDate(before.getUTCDate() - 1);
        expect(
          receive(
            at(before.toISOString().slice(0, 10), character.id),
            story.event,
          ).pendingEvent,
        ).toBeUndefined();
        expect(
          receive(at(story.published, character.id), story.event).pendingEvent,
        ).toBe(story.event.id);
        // A later displayed day must not make news available in an earlier quarter.
        const earlyQuarter = at(
          before.toISOString().slice(0, 10),
          character.id,
        );
        earlyQuarter.day.date = story.published;
        expect(receive(earlyQuarter, story.event).pendingEvent).toBeUndefined();
        let state = newGame(character.id, 1);
        let delivered = false;
        for (let q = 0; q < 16; q++) {
          // completeQuarter drains every card; firedEvents is the independent receipt.
          state.stats.money = 100000;
          state.timeline.episodes.at(-1)!.validTo = '2040-01-01';
          state = completeQuarter(state);
          if (state.firedEvents.includes(story.event.id)) {
            delivered = true;
            expect(state.date >= story.published).toBe(true);
            expect(
              state.firedEvents.filter((id) => id === story.event.id),
            ).toHaveLength(1);
          }
        }
        expect(delivered, character.id).toBe(character.startDate < story.until);
        expect(
          receive(at(story.until, character.id), story.event).pendingEvent,
        ).toBeUndefined();
      }
      for (const text of textOf(story.event)) {
        // SRC-032 §7.9 supplies the Budget card's spring 2027 window.
        const copy = text.zhCN + text.en;
        expect(
          story.event.id === 'news-budget-2026'
            ? copy.replaceAll('2027', '')
            : copy,
        ).not.toMatch(/\d/);
      }
    },
  );
  test('only Yao receives the reminder, before the exclusive cutoff, including through fast-forward', () => {
    const story = policyStories.find(
      (s) => s.event.id === 'sw-settlement-window-letter',
    )!;
    expect(receive(at('2029-10-03'), story.event).pendingEvent).toBeUndefined();
    const before = receive(at('2030-04-03'), story.event);
    expect(before.pendingEvent).toBe(story.event.id);
    expect(resolve(before, 'check').timeline).toEqual(before.timeline);
    for (const date of ['2030-04-04', '2030-04-05'])
      expect(receive(at(date), story.event).pendingEvent).toBeUndefined();
    const expiredDay = at('2030-01-15');
    expiredDay.day.date = '2030-04-04';
    expect(receive(expiredDay, story.event).pendingEvent).toBeUndefined();
    for (const character of ['hong-kong-bno', 'family-partner'])
      expect(
        receive(at('2030-01-15', character), story.event).pendingEvent,
      ).toBeUndefined();
    let state = at('2029-07-15');
    state.stats.money = 100000;
    state.timeline.episodes.at(-1)!.validTo = '2040-01-01';
    state = completeQuarter(state);
    state = completeQuarter(state);
    expect(state.firedEvents).toContain(story.event.id);
    expect(state.date < story.until).toBe(true);
  });
});

describe('11.2 optional household spending', () => {
  test('three limited furnishings cost money once, survive JSON and benefit later quarters without travel', () => {
    let state = clear();
    state.stats.money = 40000;
    state.day.minute = 600;
    state = enter(state, 'shop');
    const before = structuredClone(state);
    for (const id of Object.keys(b.furnishings)) {
      expect(
        activities(state, 'shop').some(
          (action) => action.id === `furnish-${id}`,
        ),
      ).toBe(true);
      expect(() => buy(state, id, 2)).toThrow('Purchase is not available');
      state = doActivity(state, `furnish-${id}`);
      expect(state.flags).toContain(`furnished-${id}`);
      expect(state.inventory[id]).toBeUndefined();
      expect(
        activities(state, 'shop').some(
          (action) => action.id === `furnish-${id}`,
        ),
      ).toBe(false);
      expect(() => doActivity(state, `furnish-${id}`)).toThrow(
        'Activity is not available',
      );
    }
    expect(before.stats.money - state.stats.money).toBe(2900);
    expect(state.timeline).toEqual(before.timeline);
    for (let q = 0; q < 3; q++) {
      const control = clear(structuredClone(state));
      control.flags = control.flags.filter(
        (flag) => !flag.startsWith('furnished-'),
      );
      const after = quarter(clear(JSON.parse(JSON.stringify(state))));
      const without = quarter(control);
      expect(after.stats.mood - without.stats.mood).toBe(2);
      expect(after.stats.health - without.stats.health).toBe(2);
      expect(after.stats.money).toBe(without.stats.money);
      expect(after.timeline).toEqual(without.timeline);
      state = clear(after);
    }
  });
  test('a short let charges rent each quarter and returns exactly one deposit on exit', () => {
    let state = clear();
    state.stats.money = 40000;
    const before = structuredClone(state);
    state = doActivity(state, 'rent-brighter-home');
    expect(state.stats.money).toBe(
      before.stats.money - b.housingDeposit - b.housingMoveCost,
    );
    expect(
      activities(state, 'home').some((a) => a.id === 'rent-brighter-home'),
    ).toBe(false);
    for (let q = 0; q < 2; q++) {
      const control = clear(structuredClone(state));
      control.flags = control.flags.filter((flag) => flag !== 'brighter-home');
      const without = quarter(control);
      state = quarter(clear(JSON.parse(JSON.stringify(state))));
      expect(without.stats.money - state.stats.money).toBe(b.housingRent);
      expect(state.stats.mood - without.stats.mood).toBe(b.housingMood);
      expect(state.stats.health - without.stats.health).toBe(b.housingHealth);
      expect(state.timeline).toEqual(without.timeline);
      state = clear(state);
    }
    state.day.place = 'home';
    const money = state.stats.money;
    const exited = doActivity(state, 'leave-brighter-home');
    expect(exited.stats.money - money).toBe(b.housingDeposit);
    expect(exited.flags).not.toContain('brighter-home');
    expect(
      activities(exited, 'home').some((a) => a.id === 'leave-brighter-home'),
    ).toBe(false);
    expect(() => doActivity(exited, 'leave-brighter-home')).toThrow();
    const tight = clear(state);
    tight.stats.money = 0;
    const returned = quarter(tight);
    expect(returned.flags).not.toContain('brighter-home');
    expect(
      returned.log.some((entry) => entry.id === 'brighter-home-return'),
    ).toBe(true);
    expect(returned.timeline.absences).toEqual(tight.timeline.absences);
  });
  test('club membership is prepaid for this quarter, expires, and never renews silently', () => {
    let state = clear();
    state.day.place = 'bench';
    const money = state.stats.money;
    state = doActivity(state, 'walking-club');
    expect(money - state.stats.money).toBe(b.clubFee);
    expect(
      activities(state, 'bench').some((a) => a.id === 'walking-club'),
    ).toBe(false);
    const control = clear(structuredClone(state));
    control.flags = [];
    const without = quarter(control);
    const after = quarter(clear(JSON.parse(JSON.stringify(state))));
    expect(after.stats.mood - without.stats.mood).toBe(b.clubMood);
    expect(after.stats.health - without.stats.health).toBe(b.clubHealth);
    expect(after.stats.money).toBe(without.stats.money);
    expect(after.flags).not.toContain('quarter-walking-club');
    expect(quarter(clear(after)).stats.money).toBe(
      quarter(clear(without)).stats.money,
    );
    const poor = clear();
    poor.stats.money = 0;
    expect(
      activities(poor, 'home').some((a) => a.id === 'rent-brighter-home'),
    ).toBe(false);
    expect(activities(poor, 'bench').some((a) => a.id === 'walking-club')).toBe(
      false,
    );
  });
  test('high attributes wear down while low attributes retain the existing decay', () => {
    for (const value of [40, 100]) {
      const before = clear();
      before.stats.mood = before.stats.health = value;
      const after = quarter(before);
      expect(after.stats.mood).toBe(
        value -
          b.moodDecay -
          Math.round(Math.max(0, value - b.moodWearThreshold) * b.moodWearRate),
      );
      expect(after.stats.health).toBe(
        value -
          b.healthDecay -
          Math.round(
            Math.max(0, value - b.healthWearThreshold) * b.healthWearRate,
          ),
      );
    }
  });
});

describe('11.2 narrator and voice cleanup', () => {
  test.each(events)(
    '$id uses you outside quoted dialogue in all card fields',
    (event) => {
      for (const text of textOf(event))
        expect(
          text.zhCN.replace(/「[^」]*」|“[^”]*”|"[^"]*"/g, ''),
        ).not.toMatch(/林遥|陈嘉宁|嘉宁|索菲娅/);
    },
  );
  test.each([
    ['jamie', /足球|球赛|球衣|球靴|球队|全队|守门|任意球|点球|裁判|踢|队里/],
    ['dave', /题|抢答|计分|队名|裁判|主持|各位/],
    ['lina', /喂|拜托|烦/],
    ['margaret', /我可|得了|瞧/],
  ] as const)(
    '%s keeps signature tics or topics below forty percent',
    (id, pattern) => {
      const lines = npcs.find((npc) => npc.id === id)!.lines;
      expect(
        lines.filter((line) => pattern.test(line.text.zhCN)).length /
          lines.length,
      ).toBeLessThanOrEqual(0.4);
    },
  );
});
