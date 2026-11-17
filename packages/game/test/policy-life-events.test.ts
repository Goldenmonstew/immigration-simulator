import { evaluate } from '@uk-immigration/engine';
import { describe, expect, test } from 'vitest';
import {
  currentEvent,
  enter,
  newGame,
  readMail,
  resolve,
  sleep,
  talk,
  tick,
} from '../src';
import type { GameEvent, GameState, PlaceId } from '../src';
import { lifeEvents } from '../src/events/life';
import { characterLifeEvents } from './character-life';
import { commonEvents } from '../src/events/common';
import { policyStories } from '../src/events/policy';
import { characters, clear, completeQuarter, drain } from './helpers';

const restore = (state: GameState): GameState =>
  JSON.parse(JSON.stringify(state));
const budget = policyStories.find(
  (story) => story.event.id === 'news-budget-2026',
)!;
const followups = policyStories.filter((story) =>
  story.event.id.startsWith('budget-'),
);
const card = (id: string) =>
  [
    ...lifeEvents,
    ...Object.values(characterLifeEvents).flat(),
    ...characters.flatMap((character) => character.events),
  ].find((event) => event.id === id)!;

function receive(state: GameState, event: GameEvent) {
  const before = clear(state);
  before.day.deliveries = [{ eventId: event.id, channel: event.channel! }];
  return deliverSaved(before, event);
}
function deliverSaved(state: GameState, event: GameEvent) {
  if (event.channel === 'letter') return readMail(state);
  if (event.channel === 'phone')
    return tick(state, Math.max(0, 720 - state.day.minute));
  if (event.channel?.startsWith('place:')) {
    state.day.place = 'green';
    return enter(state, event.channel.slice(6) as PlaceId);
  }
  if (event.channel?.startsWith('npc:'))
    return talk(state, event.channel.slice(4));
  return tick(state, 0);
}
function dateState(date: string, character = 'skilled-worker') {
  const state = clear(newGame(character, 1));
  state.date = state.day.date = date;
  state.timeline.episodes[0].validTo = '2040-01-01';
  return state;
}

describe('12.4 Budget reactions', () => {
  test.each(['2026-10-27', '2027-01-28', '2027-02-01'])(
    'the Budget is absent on %s, including a saved pending delivery',
    (date) => {
      const state = dateState(date);
      expect(
        receive(restore(state), budget.event).pendingEvent,
      ).toBeUndefined();
    },
  );

  test.each(characters.filter((character) => character.id !== 'graduate'))(
    '$id sees the news once and then only its own follow-up in actual quarterly play',
    (character) => {
      let state = newGame(character.id, 1);
      const own = followups.find((story) => story.character === character.id)!;
      for (let q = 0; q < 20; q++) {
        state.stats.money = 100000;
        state.timeline.episodes[0].validTo = '2040-01-01';
        state = completeQuarter(restore(state));
      }
      const newsLog = state.log.findIndex(
        (entry) => entry.id === budget.event.id,
      );
      const followupLog = state.log.findIndex(
        (entry) => entry.id === own.event.id,
      );
      expect(newsLog).toBeGreaterThanOrEqual(0);
      expect(followupLog).toBeGreaterThan(newsLog);
      expect(
        state.firedEvents.filter((id) => id === budget.event.id),
      ).toHaveLength(1);
      expect(
        state.firedEvents.filter((id) => id === own.event.id),
      ).toHaveLength(1);
      for (const story of followups.filter((story) => story !== own))
        expect(state.firedEvents).not.toContain(story.event.id);
    },
  );

  test('follow-ups require the news, respect role and window, and every choice preserves the engine result', () => {
    for (const story of followups) {
      for (const character of characters) {
        const before = dateState('2027-01-15', character.id);
        expect(receive(before, story.event).pendingEvent).toBeUndefined();
        before.flags.push('budget-news-read');
        const delivered = receive(restore(before), story.event);
        expect(delivered.pendingEvent).toBe(
          character.id === story.character ? story.event.id : undefined,
        );
        if (character.id !== story.character) continue;
        for (const choice of story.event.choices) {
          const after = resolve(restore(delivered), choice.id);
          expect(after.timeline).toEqual(delivered.timeline);
          expect(after.result).toEqual(delivered.result);
          expect(
            receive(restore(after), story.event).pendingEvent,
          ).toBeUndefined();
        }
        for (const date of ['2026-11-01', story.until]) {
          const outside = dateState(date, character.id);
          outside.flags.push('budget-news-read');
          expect(receive(outside, story.event).pendingEvent).toBeUndefined();
        }
      }
    }
    for (const choice of budget.event.choices) {
      const before = receive(dateState(budget.published), budget.event);
      const after = resolve(before, choice.id);
      expect(after.timeline).toEqual(before.timeline);
      expect(after.result).toEqual(before.result);
      expect(after.flags).toContain('budget-news-read');
    }
  });
});

describe('12.4 passport and visiting-family chains', () => {
  test.each(characters.filter((character) => character.id !== 'graduate'))(
    '$id preserves prerequisites, deliveries and completion across JSON saves',
    (character) => {
      let state = dateState('2028-06-15', character.id);
      state.year = 4;
      const original = structuredClone(state.timeline);
      const visit = characterLifeEvents[character.id].find((event) =>
        event.id.endsWith('-visit-plans'),
      )!;
      const stages = [
        card('life-new-passport'),
        card('life-ukvi-update'),
        card('life-evisa-travel-check'),
        visit,
        card('life-guest-room'),
        card('life-guest-station'),
        card('life-guest-cooking'),
        card('life-guest-farewell'),
      ];
      for (const event of stages) {
        // A chain cannot be entered halfway; removing the actual prerequisite
        // blocks a delivery rather than merely hiding a menu item.
        const blocked = restore(state);
        blocked.flags = blocked.flags.filter(
          (flag) => !event.requires?.includes(flag),
        );
        if (event.requires?.length)
          expect(
            receive(blocked, event).pendingEvent,
            event.id,
          ).toBeUndefined();
        for (const choice of event.choices) {
          const pending = receive(restore(state), event);
          expect(currentEvent(pending)?.id).toBe(event.id);
          const after = resolve(restore(pending), choice.id);
          expect(after.flags).toEqual(
            expect.arrayContaining(choice.sets ?? []),
          );
          expect(after.timeline).toEqual(original);
          expect(after.result).toEqual(pending.result);
          expect(receive(restore(after), event).pendingEvent).toBeUndefined();
        }
        // Save a queued, not-yet-fired delivery too.
        const queued = clear(state);
        queued.day.deliveries.push({
          eventId: event.id,
          channel: event.channel!,
        });
        const pending = deliverSaved(restore(queued), event);
        state = restore(resolve(pending, event.choices[0].id));
      }
      expect(state.firedEvents).toEqual(
        expect.arrayContaining([
          'life-evisa-travel-check',
          'life-guest-farewell',
        ]),
      );
      expect(state.timeline.episodes).toEqual(original.episodes);
      expect(state.timeline.absences).toEqual(original.absences);
      expect(state.stats.money).toBe(
        characters.find((c) => c.id === character.id)!.stats.money,
      );
      expect(
        state.log.filter((entry) =>
          stages.some((event) => entry.id === event.id),
        ),
      ).toHaveLength(stages.length);
      const early = dateState('2025-01-15', character.id);
      early.year = 1;
      expect(receive(early, stages[0]).pendingEvent).toBeUndefined();
      expect(receive(early, visit).pendingEvent).toBeUndefined();
      for (const other of characters.filter(
        (c) => c.id !== character.id && c.id !== 'graduate',
      )) {
        const foreign = characterLifeEvents[other.id].find((event) =>
          event.id.endsWith('-visit-plans'),
        )!;
        expect(receive(restore(state), foreign).pendingEvent).toBeUndefined();
      }
    },
  );

  test('the isolated chains use real quarterly draws and visits without injecting prerequisites', () => {
    for (const character of characters.filter(
      (character) => character.id !== 'graduate',
    )) {
      const savedCommon = [...commonEvents];
      const savedCharacter = character.events;
      const seen = new Set<string>();
      try {
        commonEvents.splice(0, commonEvents.length, ...lifeEvents);
        character.events = characterLifeEvents[character.id];
        for (let seed = 1; seed <= 5; seed++) {
          let state = newGame(character.id, seed);
          for (let q = 0; q < 40 && !state.ending; q++) {
            state.stats.money = 100000;
            state.timeline.episodes[0].validTo = '2040-01-01';
            const date = state.date;
            while (state.date === date && !state.ending) {
              state = drain(state);
              state = drain(
                readMail(tick(state, Math.max(0, 720 - state.day.minute))),
              );
              for (const delivery of [...state.day.deliveries]) {
                if (
                  delivery.channel.startsWith('place:') &&
                  lifeEvents.some((event) => event.id === delivery.eventId)
                ) {
                  const place = delivery.channel.slice(6) as PlaceId;
                  state = drain(
                    enter(
                      place === 'home' ? enter(state, 'green') : state,
                      place,
                    ),
                  );
                }
              }
              state = drain(sleep(state));
            }
          }
          state.firedEvents.forEach((id) => seen.add(id));
        }
        for (const event of lifeEvents)
          expect(seen.has(event.id), `${character.id}/${event.id}`).toBe(true);
      } finally {
        commonEvents.splice(0, commonEvents.length, ...savedCommon);
        character.events = savedCharacter;
      }
    }
  });
});

describe('12.4 interrupted earnings', () => {
  test('using accrued paid leave does not invent earnings or change eligibility', () => {
    const before = clear(newGame('skilled-worker', 1));
    const pending = receive(before, card('sw-income-audit'));
    const after = resolve(restore(pending), 'first');
    expect(after.timeline).toEqual(before.timeline);
    expect(after.result).toEqual(before.result);
  });
  test.each([
    ['skilled-worker', 'sw-income-audit', 'second', 'earnings', 30000],
    ['hong-kong-bno', 'bno-sick-pay-folder', 'file', 'earnings', 26000],
    [
      'family-partner',
      'family-crossed-shifts',
      'reduce',
      'partnerEarnings',
      18000,
    ],
  ] as const)(
    '%s records only the intended income fact and lets the engine assess it',
    (character, id, choice, field, value) => {
      const before = clear(newGame(character, 1));
      before.year = 4;
      const event = card(id);
      const delivered = receive(before, event);
      expect(delivered.pendingEvent).toBe(id);
      const after = resolve(restore(delivered), choice);
      const expected = structuredClone(before.timeline);
      expected.incomeYears.at(-1)![field] = value;
      expect(after.timeline).toEqual(expected);
      expect(after.result).toEqual(
        evaluate({
          simulationDate: after.date,
          timeline: expected,
          locale: after.locale,
        }),
      );
      expect(after.timeline.relationships).toEqual(
        before.timeline.relationships,
      );
      expect(after.timeline.benefits).toEqual(before.timeline.benefits);
      expect(after.timeline.episodes).toEqual(before.timeline.episodes);
      expect(after.stats.health).toBeGreaterThanOrEqual(before.stats.health);
      expect(before.timeline).not.toEqual(after.timeline);
    },
  );

  test('a partner who has stopped work is not silently given new shifts', () => {
    for (const flag of [
      'family-job-worry',
      'family-jamie-unemployed',
      'family-pip-applied',
    ]) {
      const state = clear(newGame('family-partner', 1));
      state.year = 4;
      state.flags.push(flag);
      if (flag === 'family-job-worry')
        state.timeline.incomeYears.at(-1)!.partnerEarnings = 16000;
      expect(
        receive(state, card('family-crossed-shifts')).pendingEvent,
      ).toBeUndefined();
      expect(state.timeline.incomeYears.at(-1)!.partnerEarnings).toBe(
        flag === 'family-job-worry' ? 16000 : 20000,
      );
    }
  });

  test('all new copy is short, bilingual and uses you outside dialogue', () => {
    for (const event of [
      ...lifeEvents,
      ...Object.values(characterLifeEvents).flat(),
      card('sw-income-audit'),
      budget.event,
      ...followups.map((s) => s.event),
    ]) {
      expect(event.text.zhCN.length, event.id).toBeLessThanOrEqual(60);
      for (const copy of [
        event.title,
        event.text,
        ...event.choices.flatMap((c) => [c.label, ...(c.note ? [c.note] : [])]),
      ]) {
        expect(copy.en.trim()).not.toBe('');
        expect(copy.zhCN.replace(/「[^」]*」/g, '')).not.toMatch(
          /林遥|陈嘉宁|嘉宁|索菲娅/,
        );
      }
    }
  });
});
