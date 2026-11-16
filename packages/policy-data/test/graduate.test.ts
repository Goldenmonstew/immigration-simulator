import { expect, test } from 'vitest';
import { currentLaw2026_11 } from '../src';

test('Graduate non-doctoral early grant retains GR 8.1 application cutoff and decision-based duration', () => {
  const {
    graduateNonDoctoralEarlyGrantMonths: months,
    graduateNonDoctoralShorterGrantFrom: cutoff,
  } = currentLaw2026_11.values;
  expect(months.value).toBe(24);
  expect(cutoff.value).toBe('2027-01-01');
  for (const parameter of [months, cutoff])
    expect(parameter.sources).toEqual([
      { srcId: 'SRC-034', locator: 'GR 8.1, non-doctoral table row' },
    ]);
});
