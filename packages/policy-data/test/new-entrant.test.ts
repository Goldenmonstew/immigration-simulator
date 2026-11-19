import { expect, test } from 'vitest';
import { currentLaw2026_11 } from '../src';

test('Skilled Worker new entrant option keeps its SW 4.2 Option E and SW 12.3 sources', () => {
  const {
    skilledWorkerNewEntrantSalaryThreshold: salary,
    skilledWorkerNewEntrantGoingRatePercent: percent,
    skilledWorkerNewEntrantMaxCombinedYears: years,
  } = currentLaw2026_11.values;
  expect([salary.value, percent.value, years.value]).toEqual([33400, 70, 4]);
  expect(salary.sources).toEqual([
    { srcId: 'SRC-004', locator: 'SW 4.2 Option E' },
  ]);
  expect(percent.sources).toEqual(salary.sources);
  expect(years.sources).toEqual([{ srcId: 'SRC-004', locator: 'SW 12.3' }]);
});
