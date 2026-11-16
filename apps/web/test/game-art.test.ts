import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { inflateSync } from 'node:zlib';
import { expect, test } from 'vitest';
import { characters, currentEvent, newGame, npcs } from '@uk-immigration/game';
import { spritePath } from '../app/game/session';
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

// Decode the portraits' 8-bit RGBA PNG rows so metadata/compression cannot
// make identical artwork pass the uniqueness check.
function portraitPixels(path: string) {
  const png = readImage(path);
  expect([...png.subarray(24, 29)]).toEqual([8, 6, 0, 0, 0]);
  const chunks: Buffer[] = [];
  for (let offset = 8; offset < png.length;) {
    const length = png.readUInt32BE(offset);
    if (png.toString('ascii', offset + 4, offset + 8) === 'IDAT')
      chunks.push(png.subarray(offset + 8, offset + 8 + length));
    offset += length + 12;
  }
  const raw = inflateSync(Buffer.concat(chunks));
  const stride = png.readUInt32BE(16) * 4;
  const height = png.readUInt32BE(20);
  const pixels = Buffer.alloc(stride * height);
  for (let y = 0; y < height; y++) {
    const filter = raw[y * (stride + 1)];
    expect(filter).toBeLessThanOrEqual(4);
    for (let x = 0; x < stride; x++) {
      const i = y * stride + x;
      const left = x >= 4 ? pixels[i - 4] : 0;
      const up = y ? pixels[i - stride] : 0;
      const corner = y && x >= 4 ? pixels[i - stride - 4] : 0;
      const prediction = left + up - corner;
      const distances = [left, up, corner].map((v) => Math.abs(prediction - v));
      const paeth = [left, up, corner][
        distances.indexOf(Math.min(...distances))
      ];
      const adjustment = [0, left, up, Math.floor((left + up) / 2), paeth][
        filter
      ];
      pixels[i] = (raw[y * (stride + 1) + x + 1] + adjustment) & 255;
    }
  }
  return pixels;
}

test('all 17 neutral portraits have pairwise distinct decoded pixel hashes', () => {
  const hashes = portraitIds.map((id) =>
    createHash('sha256')
      .update(portraitPixels(portraitPath(id)))
      .digest('hex'),
  );
  expect(hashes).toHaveLength(17);
  expect(new Set(hashes).size).toBe(17);
});

test.each(['graduate', 'maeve'])(
  '%s expressions keep the neutral palette and artwork outside the face',
  (id) => {
    const neutral = portraitPixels(portraitPath(id));
    for (const expression of ['happy', 'worried']) {
      const pixels = portraitPixels(portraitPath(id, expression));
      let changed = 0;
      for (let y = 0; y < 64; y++)
        for (let x = 0; x < 64; x++) {
          const offset = (y * 64 + x) * 4;
          const same = pixels
            .subarray(offset, offset + 4)
            .equals(neutral.subarray(offset, offset + 4));
          if (x < 21 || x > 43 || y < 24 || y > 42) expect(same).toBe(true);
          if (!same) changed++;
        }
      expect(changed).toBeGreaterThan(0);
      expect(changed).toBeLessThan(150);
    }
  },
);

test('all four protagonists and thirteen residents/family members have distinct, complete 64px expression sets', () => {
  expect(characters).toHaveLength(4);
  expect(npcs).toHaveLength(13);
  expect(portraitIds).toHaveLength(17);
  expect(new Set(portraitIds)).toEqual(
    new Set([...characters, ...npcs].map((person) => person.id)),
  );
  const hashes = portraitIds.flatMap((id) =>
    expressions.map((expression) =>
      expectPng(portraitPath(id, expression), 64, 64),
    ),
  );
  expect(new Set(hashes).size).toBe(51);
});

test('every person resolves to their own portrait and distinct 64 by 48 walking sheet', () => {
  const hashes = [...characters, ...npcs].map(({ id }) => {
    for (const expression of expressions)
      expect(portraitPath(id, expression)).toBe(
        `/game/assets/meadow-town/portraits/${id}-${expression}.png`,
      );
    expect(spritePath(id)).toBe(`/game/assets/urban/${id}.png`);
    return expectPng(spritePath(id), 64, 48);
  });
  expect(new Set(hashes).size).toBe(17);
  expect(spritePath('unknown')).toBe(spritePath('skilled-worker'));
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
