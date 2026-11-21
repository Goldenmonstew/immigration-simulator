import { describe, expect, test } from 'vitest';
import { evaluateCanada } from '../src';
import type { CaPathwayId, CaRequest } from '../src';

// A permanent resident since 2022-03-01 after studying from 2019-09-01.
const base: CaRequest = {
  simulationDate: '2026-11-21',
  dateOfBirth: '1990-05-01',
  permanentResident: '2022-03-01',
  temporaryPeriods: [{ from: '2019-09-01' }],
  trips: [],
};

function pathway(req: Partial<CaRequest>, id: CaPathwayId) {
  const result = evaluateCanada({ ...base, ...req });
  const found = result.pathways.find((p) => p.id === id);
  if (!found) throw new Error(`missing ${id}`);
  return found;
}

describe('residency obligation (IRPA s28)', () => {
  test('within the first 5 years: the whole first period counts', () => {
    const p = pathway({}, 'CA-RESIDENCY');
    expect(p.status).toBe('MET');
    expect(p.summary).toContain('2027-02-28');
    expect(p.pendingDetails).toEqual([]);
  });

  test('a long absence: 730 days in the 5 years before 2028-05-31', () => {
    // Away 2022-04-02 to 2026-05-31; back from 2026-06-01, the 730th day
    // is 2028-05-30, so the 5 years before 2028-05-31 hold 730 days.
    const p = pathway(
      { trips: [{ departed: '2022-04-01', returned: '2026-06-01' }] },
      'CA-RESIDENCY',
    );
    expect(p.status).toBe('FUTURE');
    expect(p.earliestDate).toBe('2028-05-31');
    expect(p.checks[0].met).toBe(false);
    expect(p.checks[0].text).toContain('305');
  });

  test('after 5 years the 5 years before the examination date count', () => {
    const p = pathway(
      {
        simulationDate: '2028-05-31',
        trips: [{ departed: '2022-04-01', returned: '2026-06-01' }],
      },
      'CA-RESIDENCY',
    );
    expect(p.status).toBe('MET');
    expect(p.checks[0].text).toContain('730');
    expect(p.pendingDetails).toEqual(['PD-089']);
  });

  test('the day before is one day short', () => {
    const p = pathway(
      {
        simulationDate: '2028-05-30',
        trips: [{ departed: '2022-04-01', returned: '2026-06-01' }],
      },
      'CA-RESIDENCY',
    );
    expect(p.status).toBe('FUTURE');
    expect(p.checks[0].text).toContain('729');
  });
});

describe('citizenship (s5(1)(c)(i), s5(1.001))', () => {
  test('already 1,095 days', () => {
    const p = pathway({}, 'CA-CITIZENSHIP');
    expect(p.status).toBe('MET');
    expect(p.earliestDate).toBe('2026-11-21');
  });

  test('pre-PR days are capped at 365', () => {
    // 1,096 temporary days before PR give 365; 730 PR days are needed.
    const p = pathway(
      {
        simulationDate: '2026-01-01',
        permanentResident: '2024-06-01',
        temporaryPeriods: [{ from: '2021-06-01' }],
      },
      'CA-CITIZENSHIP',
    );
    expect(p.status).toBe('FUTURE');
    expect(p.earliestDate).toBe('2026-06-01');
  });

  test('half days are not rounded: 1,094.5 is not enough', () => {
    // 365 temporary days give 182.5; 912 PR days make 1,094.5.
    const p = pathway(
      {
        simulationDate: '2026-11-30',
        permanentResident: '2024-06-01',
        temporaryPeriods: [{ from: '2023-06-02', to: '2024-05-31' }],
      },
      'CA-CITIZENSHIP',
    );
    expect(p.status).toBe('FUTURE');
    expect(p.earliestDate).toBe('2026-12-01');
    expect(p.checks[1].text).toContain('1094.5');
  });

  test('only days in a temporary status count before PR', () => {
    const p = pathway(
      {
        simulationDate: '2026-01-01',
        permanentResident: '2024-06-01',
        temporaryPeriods: [],
      },
      'CA-CITIZENSHIP',
    );
    // 1,095 PR days from 2024-06-01: the 1,095th is 2027-05-31.
    expect(p.earliestDate).toBe('2027-06-01');
  });

  test('travel days count in Canada', () => {
    // A trip leaving 2027-01-10 and back 2027-01-12 costs one day.
    const p = pathway(
      {
        simulationDate: '2026-01-01',
        permanentResident: '2024-06-01',
        temporaryPeriods: [],
        trips: [{ departed: '2027-01-10', returned: '2027-01-12' }],
      },
      'CA-CITIZENSHIP',
    );
    expect(p.earliestDate).toBe('2027-06-02');
  });

  test('the application date is a pending detail', () => {
    expect(pathway({}, 'CA-CITIZENSHIP').pendingDetails).toEqual(['PD-090']);
  });

  test('a 29 February signing date counts from 28 February (PD-091)', () => {
    const p = pathway(
      {
        simulationDate: '2028-02-29',
        permanentResident: '2024-06-01',
        temporaryPeriods: [],
      },
      'CA-CITIZENSHIP',
    );
    expect(p.status).toBe('MET');
    expect(p.pendingDetails).toEqual(['PD-090', 'PD-091']);
  });
});
