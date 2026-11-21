import { expect, test } from 'vitest';
import { COUNTRY_ALPHA2 } from '../lib/countries';
import {
  countries,
  countryName,
  nationalityFromInput,
} from '../lib/country-names';

test('playtest #3 / review49-1: nationality resolves exact names in either language or a listed code', () => {
  expect(nationalityFromInput('中国')).toBe('CHN');
  expect(nationalityFromInput(' china ')).toBe('CHN');
  expect(nationalityFromInput('India')).toBe('IND');
  expect(nationalityFromInput('phl')).toBe('PHL');
  expect(nationalityFromInput('Germany')).toBe('DEU');
  expect(nationalityFromInput('德国')).toBe('DEU');
  expect(nationalityFromInput('United Kingdom')).toBe('GBR');
  // Unfinished or unlisted text is not turned into a code.
  expect(nationalityFromInput('United ')).toBeUndefined();
  expect(nationalityFromInput('XYZ')).toBeUndefined();
  expect(nationalityFromInput('gbn')).toBe('GBN');
  expect(countryName('MYS')).toBe('马来西亚 · Malaysia');
});

test('the list has the 249 ISO 3166-1 codes without deprecated or private-use ones, plus passport values', () => {
  expect(Object.keys(COUNTRY_ALPHA2)).toHaveLength(249);
  for (const code of ['DDR', 'YUG', 'SUN', 'XKK', 'ANT'])
    expect(countries().some((c) => c.code === code)).toBe(false);
  for (const code of ['GBD', 'GBN', 'RKS', 'XXA'])
    expect(countries().some((c) => c.code === code)).toBe(true);
});
