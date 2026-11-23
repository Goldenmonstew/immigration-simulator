import { expect, test } from 'vitest';
import { gameAsset, gameStorageKey } from '../lib/game-country';

test('the UK game keeps its asset root and legacy save key while other countries get their own keys', () => {
  expect(gameAsset('uk', '/town.json')).toBe('/game/town.json');
  expect(gameStorageKey('uk', 'v3:resident')).toBe(
    'uk-immigration-life-v3:resident',
  );
  expect(gameStorageKey('au', 'v3:resident')).toBe(
    'au-immigration-life-v3:resident',
  );
});
