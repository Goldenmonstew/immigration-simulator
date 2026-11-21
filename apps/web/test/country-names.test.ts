import { expect, test } from 'vitest';
import {
  countries,
  countryName,
  nationalityFromInput,
} from '../lib/country-names';

test('playtest #3: nationality accepts a country name in either language or a code', () => {
  expect(nationalityFromInput('中国')).toBe('CHN');
  expect(nationalityFromInput(' china ')).toBe('CHN');
  expect(nationalityFromInput('India')).toBe('IND');
  expect(nationalityFromInput('phl')).toBe('PHL');
  // An unfinished name stays as typed and fails validation until resolved.
  expect(nationalityFromInput('Chin')).toBe('Chin');
  expect(countryName('MYS')).toBe('马来西亚 · Malaysia');
  expect(countryName('XYZ')).toBeUndefined();
  expect(countries().length).toBeGreaterThan(240);
});
