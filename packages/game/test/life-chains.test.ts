import { describe, expect, test } from 'vitest';
import { currentEvent, newGame, readMail, resolve, talk } from '../src';
import type { GameState } from '../src';
import { lifeChains } from './character-life';
import { characters, clear } from './helpers';

const restore = (state: GameState): GameState =>
  JSON.parse(JSON.stringify(state));
const roots = [
  ['skilled-worker', 'sw-job-invite', ['plan', 'skip'], 'sw-lunch-returned'],
  [
    'hong-kong-bno',
    'bno-school-gate',
    ['plan', 'skip'],
    'bno-uniform-returned',
  ],
  [
    'family-partner',
    'family-kettle',
    ['replace', 'pan'],
    'family-ledger-returned',
  ],
] as const;

function deliver(state: GameState, id: string) {
  const next = clear(restore(state));
  const event = characters
    .flatMap((character) => character.events)
    .find((card) => card.id === id)!;
  next.day.deliveries = [{ eventId: id, channel: event.channel! }];
  return event.channel!.startsWith('npc:')
    ? talk(next, event.channel!.slice(4))
    : readMail(next);
}

describe('12.6 character life chains', () => {
  for (const [characterId, rootId, rootChoices, completion] of roots) {
    test(`${characterId}: both original choices open a four-scene chain and each participation gets its own return`, () => {
      const [first, middle, ...returns] = lifeChains[characterId];
      for (const rootChoice of rootChoices) {
        for (const branch of [0, 1]) {
          for (const middleChoice of middle.choices) {
            const before = clear(newGame(characterId, 2));
            before.quarter = 4;
            before.year = 2;
            expect(currentEvent(deliver(before, first.id))).toBeUndefined();
            const opened = deliver(before, rootId);
            expect(currentEvent(opened)?.id).toBe(rootId);
            let state = resolve(opened, rootChoice);
            const timeline = structuredClone(state.timeline);
            state.stats.money = 0;
            const commonFlags = state.flags;
            const arrived = deliver(state, first.id);
            expect(arrived.pendingEvent).toBe(first.id);
            state = resolve(arrived, first.choices[branch].id);
            expect(commonFlags).not.toContain(middle.requires![0]);
            expect(state.flags).toContain(middle.requires![0]);
            expect(
              currentEvent(deliver(state, returns[branch].id)),
            ).toBeUndefined();
            state = resolve(
              deliver(restore(state), middle.id),
              middleChoice.id,
            );
            expect(
              currentEvent(deliver(state, returns[1 - branch].id)),
            ).toBeUndefined();
            const revisit = deliver(restore(state), returns[branch].id);
            expect(revisit.pendingEvent).toBe(returns[branch].id);
            for (const finalChoice of returns[branch].choices) {
              const done = resolve(revisit, finalChoice.id);
              expect(done.flags).toContain(completion);
              expect(done.stats.money).toBe(0);
              expect(done.timeline).toEqual(timeline);
              expect(
                done.log
                  .filter((entry) => entry.kind === 'event')
                  .map((entry) => entry.id),
              ).toEqual([rootId, first.id, middle.id, returns[branch].id]);
              expect(restore(done)).toEqual(done);
              expect(
                currentEvent(deliver(done, returns[branch].id)),
              ).toBeUndefined();
            }
          }
        }
      }
    });

    test(`${characterId}: prerequisites cannot leak the chain into another character`, () => {
      for (const other of characters.filter(
        (character) => character.id !== characterId,
      )) {
        for (const event of lifeChains[characterId]) {
          const state = clear(newGame(other.id, 1));
          state.flags = [...(event.requires ?? [])];
          expect(currentEvent(deliver(state, event.id))).toBeUndefined();
        }
      }
    });
  }

  test('new cards keep short bilingual copy, concrete free choices and only life effects', () => {
    for (const event of Object.values(lifeChains).flat()) {
      expect(event.text.zhCN.length, event.id).toBeLessThanOrEqual(60);
      expect(event.text.zhCN).toContain('你');
      expect(event.text.en).toMatch(/\byou(r)?\b/i);
      expect(event.choices).toHaveLength(2);
      for (const choice of event.choices) {
        expect(choice.label.zhCN).toContain('你');
        expect(choice.label.en.trim()).not.toBe('');
        expect(
          choice.effects.every(
            (effect) => effect.type === 'none' || effect.type === 'friendship',
          ),
        ).toBe(true);
      }
    }
  });
});
