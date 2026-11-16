import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { expect, test } from 'vitest';
import { characters, currentEvent, newGame, npcs } from '@uk-immigration/game';
import {
  dialogueExpression,
  expressions,
  portraitIds,
  portraitPath,
  shopSignIds,
  signPath,
  townBanner,
} from '../app/game/art';

const readImage = (path: string) =>
  readFileSync(new URL(`../public${path}`, import.meta.url));
function expectPng(path: string, width: number, height: number) {
  const image = readImage(path);
  expect(image.subarray(0, 8).toString('hex')).toBe('89504e470d0a1a0a');
  expect([image.readUInt32BE(16), image.readUInt32BE(20)]).toEqual([
    width,
    height,
  ]);
  return createHash('sha256').update(image).digest('hex');
}

test('all three protagonists and twelve residents have distinct, complete 64px expression sets', () => {
  expect(portraitIds).toHaveLength(15);
  expect(new Set(portraitIds)).toEqual(
    new Set([...characters, ...npcs].map((person) => person.id)),
  );
  const hashes = portraitIds.flatMap((id) =>
    expressions.map((expression) =>
      expectPng(portraitPath(id, expression), 64, 64),
    ),
  );
  expect(new Set(hashes).size).toBe(45);
});

test('missing or unknown expressions keep the person and use their neutral portrait', () => {
  for (const id of portraitIds) {
    expect(portraitPath(id)).toBe(portraitPath(id, 'neutral'));
    expect(portraitPath(id, 'unknown')).toBe(portraitPath(id, 'neutral'));
  }
  expect(portraitPath('unknown')).toBe(portraitPath('skilled-worker'));
  expect(portraitPath('unknown', 'happy')).toBe(
    portraitPath('skilled-worker', 'happy'),
  );
});

test('gift reactions and actual mood-conditioned lines select expressions without locale heuristics', () => {
  for (const person of npcs) {
    expect(dialogueExpression(person, person.reactions.loved)).toBe('happy');
    expect(dialogueExpression(person, person.reactions.liked)).toBe('happy');
    expect(dialogueExpression(person, person.reactions.disliked)).toBe(
      'worried',
    );
    expect(dialogueExpression(person, person.reactions.neutral)).toBe(
      'neutral',
    );
    const lowMoodLine = person.lines.find((line) =>
      line.when?.some(
        (c) => 'stat' in c && c.stat === 'mood' && c.max !== undefined,
      ),
    )!;
    expect(lowMoodLine).toBeDefined();
    expect(dialogueExpression(person, { ...lowMoodLine.text })).toBe('worried');
    expect(dialogueExpression(person, { zhCN: '新台词', en: 'New line' })).toBe(
      'neutral',
    );
  }
});

test('heart scenes default to neutral except the ten-heart finale, taking precedence over earlier gifts', () => {
  const person = npcs.find((person) => person.id === 'margaret')!;
  const state = newGame('skilled-worker', 42, 'en');
  for (const hearts of [2, 4, 6, 8, 10]) {
    const event = currentEvent({
      ...state,
      pendingEvent: `heart-margaret-${hearts}`,
    });
    expect(event).toBeDefined();
    expect(dialogueExpression(person, person.reactions.disliked, event)).toBe(
      hearts === 10 ? 'happy' : 'neutral',
    );
  }
});

test('the shared banner and nine unique signs are real PNGs of the declared dimensions', () => {
  expectPng(townBanner, 960, 320);
  expect(shopSignIds).toHaveLength(9);
  const hashes = shopSignIds.map((id) => expectPng(signPath(id), 24, 24));
  expect(new Set(hashes).size).toBe(9);
});
