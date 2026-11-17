import { describe, expect, test } from 'vitest';
import {
  activities,
  doActivity,
  enter,
  gift,
  newGame,
  npcs,
  resolve,
  sleep,
  talk,
} from '../src';
import { balance as b } from '../src/balance';
import { heartEvents } from '../src/npcs';
import { characters, clear, completeQuarter, drain, perform } from './helpers';

describe('11.1 people, context and remembered choices', () => {
  test('a later scene waits for the earlier chapter even when its context is unavailable', () => {
    const before = clear();
    before.friendship.dave = 1000;
    before.day.minute = 900;
    before.firedEvents = ['heart-dave-2', 'heart-dave-4'];
    expect(talk(before, 'dave').pendingEvent).toBeUndefined();
    const night = { ...before, day: { ...before.day, minute: 1320 } };
    expect(talk(night, 'dave').pendingEvent).toBe('heart-dave-6');
    const completed = {
      ...before,
      firedEvents: [...before.firedEvents, 'heart-dave-6'],
    };
    expect(talk(completed, 'dave').pendingEvent).toBe('heart-dave-8');
  });
  test('every voice has enough distinct bilingual speech, context and recent-life replies', () => {
    const speech = npcs.flatMap((npc) =>
      npc.lines.map((line) => line.text.zhCN),
    );
    expect(new Set(speech).size).toBe(speech.length);
    for (const npc of npcs) {
      expect(npc.lines.length, npc.id).toBeGreaterThanOrEqual(
        npc.characters ? 45 : 70,
      );
      expect(
        new Set(npc.lines.map((line) => line.text.zhCN)).size,
        npc.id,
      ).toBe(npc.lines.length);
      const contextual = npc.lines.filter(
        (line) =>
          line.heartsMin !== undefined ||
          line.heartsMax !== undefined ||
          line.season ||
          line.weather ||
          line.dayKinds ||
          line.festival ||
          line.when?.length ||
          line.requires?.length ||
          line.forbids?.length,
      );
      expect(
        contextual.length / npc.lines.length,
        npc.id,
      ).toBeGreaterThanOrEqual(0.3);
      const recent = npc.lines.filter((line) =>
        line.id.startsWith(`${npc.id}-recent-`),
      );
      expect(recent.length, npc.id).toBeGreaterThanOrEqual(9);
      for (const line of npc.lines) {
        expect(line.text.zhCN.length, line.id).toBeLessThanOrEqual(40);
        expect(line.text.en.trim(), line.id).not.toBe('');
      }
    }
  });

  test.each(npcs)(
    '$id responds to current circumstances, then stops when they expire',
    (npc) => {
      const original = npc.lines;
      try {
        for (const line of original.filter((line) =>
          line.id.startsWith(`${npc.id}-recent-`),
        )) {
          npc.lines = [
            line,
            { id: 'context-fallback', text: { zhCN: '你好。', en: 'Hello.' } },
          ];
          const before = clear(
            newGame(npc.characters?.[0] ?? 'skilled-worker', 1),
          );
          before.firedEvents = heartEvents.map((event) => event.id);
          before.flags = [`talked-${npc.id}`];
          before.day.talked = [npc.id];
          before.stats.money = b.livingCosts + 100;
          before.stats.mood = 60;
          before.heard = ['context-fallback'];
          expect(talk(before, npc.id).outcome?.text?.en).toBe('Hello.');
          const during = structuredClone(before);
          during.flags.push(...(line.requires ?? []));
          for (const condition of line.when ?? [])
            if ('stat' in condition)
              during.stats[condition.stat] = condition.max!;
          expect(talk(during, npc.id).outcome?.text).toEqual(line.text);
          const after = structuredClone(during);
          after.flags = [...before.flags];
          after.stats = { ...before.stats };
          expect(talk(after, npc.id).outcome?.text?.en).toBe('Hello.');
          expect(before.flags).toEqual([`talked-${npc.id}`]);
        }
      } finally {
        npc.lines = original;
      }
    },
  );

  test.each(heartEvents)(
    '$id remembers two genuinely different choices through JSON',
    (event) => {
      const npc = npcs.find((npc) => npc.id === event.heart!.npc)!;
      const original = npc.lines;
      const branchFlags = event.choices.map(
        (choice) => `${event.id}-${choice.id}`,
      );
      try {
        for (const choice of event.choices) {
          const before = clear(
            newGame(npc.characters?.[0] ?? 'skilled-worker', 1),
          );
          before.pendingEvent = event.id;
          before.stats.mood = 50;
          before.friendship[npc.id] = event.heart!.hearts * 100;
          expect(before.flags).not.toContain(`${event.id}-${choice.id}`);
          const after = JSON.parse(JSON.stringify(resolve(before, choice.id)));
          after.firedEvents = heartEvents.map((scene) => scene.id);
          after.day.talked = [npc.id];
          after.flags = after.flags.filter(
            (flag: string) => !flag.startsWith('quarter-'),
          );
          const reply = original.find((line) =>
            line.requires?.includes(`${event.id}-${choice.id}`),
          )!;
          const other = branchFlags.find(
            (flag) => flag !== `${event.id}-${choice.id}`,
          )!;
          npc.lines = original.filter((line) =>
            line.requires?.some((flag) => branchFlags.includes(flag)),
          );
          expect(after.flags).toContain(`${event.id}-${choice.id}`);
          expect(after.flags).not.toContain(other);
          expect(talk(after, npc.id).outcome?.text).toEqual(reply.text);
        }
      } finally {
        npc.lines = original;
      }
    },
  );

  test('renewal, actual tests, changed job, promotion and return set short-lived recent flags', () => {
    let state = clear();
    state.timeline.episodes[0].validTo = state.date;
    state.stats.money = 100000;
    expect(state.flags).not.toContain('quarter-visa-renewed');
    state = perform(state, 'extend');
    expect(state.flags).toContain('quarter-visa-renewed');
    state = completeQuarter(state);
    expect(state.flags).not.toContain('quarter-visa-renewed');
    expect(state.flags).toContain('visa-renewed');

    const exam = clear();
    exam.stats.english = b.englishB2;
    expect(perform(exam, 'exam').flags).toContain('quarter-exam-passed');
    const failed = clear();
    failed.stats.english = 0;
    expect(perform(failed, 'exam').flags).not.toContain('quarter-exam-passed');
    const life = clear();
    life.stats.english = 100;
    const lifePlace = enter(
      { ...life, day: { ...life.day, minute: 600 } },
      'college',
    );
    expect(
      activities(lifePlace, 'college').some(
        (action) => action.id === 'life-in-the-uk',
      ),
    ).toBe(true);
    const passed = doActivity(lifePlace, 'life-in-the-uk');
    expect(passed.timeline.lifeInTheUk).toEqual({ passed: true });
    expect(passed.flags).toContain('quarter-life-passed');

    const change = characters[0].events.find(
      (event) => event.id === 'sw-job-invite-after',
    )!;
    const job = resolve(
      { ...clear(), pendingEvent: change.id },
      change.choices[0].id,
    );
    expect(job.flags).toContain('quarter-job-changed');
    expect(
      resolve({ ...clear(), pendingEvent: change.id }, change.choices[1].id)
        .flags,
    ).not.toContain('quarter-job-changed');
    const promotion = clear();
    promotion.stats.career = 100;
    expect(completeQuarter(promotion).flags).toContain('quarter-promoted');

    const travel = clear();
    travel.stats.money = 100000;
    const returned = drain(perform(travel, 'travel-1'));
    expect(returned.trip).toBeUndefined();
    expect(returned.timeline.absences.length).toBe(
      travel.timeline.absences.length + 1,
    );
    expect(returned.flags).toContain('quarter-returned');
    expect(completeQuarter(returned).flags).not.toContain('quarter-returned');
  });

  test('talk and gifts record an actual heart-tier increase, without refreshing it on a repeat chat', () => {
    const before = clear();
    before.friendship.margaret = 100 - b.talkFriendship;
    const after = talk(before, 'margaret');
    expect(after.flags).toContain('quarter-friendship-margaret');
    expect(before.flags).not.toContain('quarter-friendship-margaret');
    const sameDay = {
      ...after,
      flags: after.flags.filter(
        (flag) => flag !== 'quarter-friendship-margaret',
      ),
    };
    expect(talk(sameDay, 'margaret').flags).not.toContain(
      'quarter-friendship-margaret',
    );
    const giftBefore = clear();
    const item = npcs.find((npc) => npc.id === 'margaret')!.gifts.loved[0];
    giftBefore.inventory[item] = 1;
    giftBefore.friendship.margaret = 100 - b.gifts.loved;
    expect(gift(giftBefore, 'margaret', item).flags).toContain(
      'quarter-friendship-margaret',
    );
    expect(completeQuarter(drain(after)).flags).not.toContain(
      'quarter-friendship-margaret',
    );
    expect(sleep(clear()).version).toBe(3);
  });

  test('a new employer is remembered, while resuming old hours is not announced as a pay rise', () => {
    for (const choiceId of ['first', 'second']) {
      const before = clear(newGame('hong-kong-bno', 1));
      before.pendingEvent = 'bno-new-employer';
      expect(resolve(before, choiceId).flags).toContain('quarter-job-changed');
    }
    const resumed = clear(newGame('family-partner', 1));
    resumed.timeline.episodes[0].salary = 0;
    resumed.pendingEvent = 'family-pram-hall';
    expect(resolve(resumed, 'clear').flags).not.toContain('quarter-promoted');
    const raise = clear();
    raise.pendingEvent = 'sw-salary-talk';
    expect(resolve(raise, 'first').flags).toContain('quarter-promoted');
    const higher = structuredClone(raise);
    higher.timeline.episodes[0].salary = 100000;
    expect(resolve(higher, 'first').flags).not.toContain('quarter-promoted');
  });
});
