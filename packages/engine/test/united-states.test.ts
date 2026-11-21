import { describe, expect, test } from 'vitest';
import { evaluateUnitedStates } from '../src';
import type { UsPathwayId, UsRequest } from '../src';

// A permanent resident since 2022-03-01.
const base: UsRequest = {
  simulationDate: '2026-11-21',
  dateOfBirth: '1990-05-01',
  permanentResident: '2022-03-01',
  conditional: 'none',
  trips: [],
};

function pathway(req: Partial<UsRequest>, id: UsPathwayId) {
  const result = evaluateUnitedStates({ ...base, ...req });
  const found = result.pathways.find((p) => p.id === id);
  if (!found) throw new Error(`missing ${id}`);
  return found;
}

describe('naturalization, INA 316(a)', () => {
  test('5 years less 90 days', () => {
    // 2027-03-01 less 90 days.
    const p = pathway({}, 'US-NATURALIZATION');
    expect(p.status).toBe('FUTURE');
    expect(p.earliestDate).toBe('2026-12-01');
  });

  test('a year away: the Policy Manual example', () => {
    // PM 12 D.3(C)(2): away 2010-01-01 to 2011-01-02 (365 days). Filing on
    // 2015-01-03 must rebut the presumption; 2015-07-06 needs none.
    const p = pathway(
      {
        simulationDate: '2014-01-01',
        permanentResident: '2005-01-01',
        trips: [{ departed: '2010-01-01', returned: '2011-01-02' }],
      },
      'US-NATURALIZATION',
    );
    expect(p.status).toBe('FUTURE');
    expect(p.earliestDate).toBe('2015-07-06');
    expect(p.summary).toContain('2015-01-03');
  });

  test('180 days away is fine, 181 is presumed to break', () => {
    const at = (returned: string) =>
      pathway(
        {
          simulationDate: '2027-06-01',
          trips: [{ departed: '2025-01-01', returned }],
        },
        'US-NATURALIZATION',
      );
    // 2025-01-01 to 2025-07-01 is 180 full days abroad.
    expect(at('2025-07-01').status).toBe('MET');
    expect(at('2025-07-02').status).toBe('FUTURE');
  });

  test('3 months in the state', () => {
    const p = pathway(
      { stateResidenceFrom: '2026-10-15' },
      'US-NATURALIZATION',
    );
    expect(p.earliestDate).toBe('2027-01-15');
  });

  test('aged 18', () => {
    const p = pathway({ dateOfBirth: '2009-02-01' }, 'US-NATURALIZATION');
    expect(p.earliestDate).toBe('2027-02-01');
  });

  test('913 days in the United States', () => {
    // Five trips of 170 full days abroad each: 850 days away.
    const trips = [2022, 2023, 2024, 2025, 2026].map((y) => ({
      departed: `${y}-04-01`,
      returned: `${y}-09-19`,
    }));
    const p = pathway(
      { simulationDate: '2027-03-01', trips },
      'US-NATURALIZATION',
    );
    // 2022-03-01 to 2027-02-28 has 1,826 days; less 850 gives 976.
    expect(p.checks[2].text).toContain('976');
    expect(p.status).toBe('MET');
  });
});

describe('spouse of a citizen, INA 319(a)', () => {
  test('not entered: not applicable', () => {
    expect(pathway({}, 'US-SPOUSE').status).toBe('NOT_APPLICABLE');
  });

  test('3 years of marriage cannot be filed early', () => {
    const p = pathway(
      { simulationDate: '2026-01-01', marriage: { married: '2023-06-01' } },
      'US-SPOUSE',
    );
    expect(p.earliestDate).toBe('2026-06-01');
  });

  test('3 years as a citizen spouse', () => {
    const p = pathway(
      {
        simulationDate: '2026-01-01',
        marriage: { married: '2023-06-01', spouseCitizenSince: '2024-01-01' },
      },
      'US-SPOUSE',
    );
    expect(p.earliestDate).toBe('2027-01-01');
  });

  test('3 years of residence less 90 days', () => {
    // Residence 2025-03-01 less 90 days, married long before.
    const p = pathway(
      { simulationDate: '2024-06-01', marriage: { married: '2015-01-01' } },
      'US-SPOUSE',
    );
    expect(p.earliestDate).toBe('2024-12-01');
  });
});

describe('removing conditions, INA 216', () => {
  const conditional = {
    conditional: 'marriage' as const,
    permanentResident: '2025-03-01',
  };

  test('not conditional: not applicable', () => {
    expect(pathway({}, 'US-CONDITIONS').status).toBe('NOT_APPLICABLE');
  });

  test('the 90 days before the second anniversary', () => {
    const p = pathway(conditional, 'US-CONDITIONS');
    expect(p.status).toBe('FUTURE');
    expect(p.earliestDate).toBe('2026-12-01');
    expect(p.summary).toContain('2027-02-28');
  });

  test('inside the window', () => {
    const p = pathway(
      { ...conditional, simulationDate: '2027-01-15' },
      'US-CONDITIONS',
    );
    expect(p.status).toBe('MET');
  });

  test('after the anniversary', () => {
    const p = pathway(
      { ...conditional, simulationDate: '2027-03-01', conditional: 'investor' },
      'US-CONDITIONS',
    );
    expect(p.status).toBe('NOT_MET');
    expect(p.summary).toContain('I-829');
  });
});

describe('time abroad on a green card', () => {
  test('under a year', () => {
    const p = pathway(
      { trips: [{ departed: '2024-01-10', returned: '2025-01-09' }] },
      'US-TRAVEL',
    );
    expect(p.status).toBe('MET');
    expect(p.summary).toContain('180');
  });

  test('a year or more needs a reentry permit or SB-1', () => {
    const p = pathway(
      { trips: [{ departed: '2024-01-10', returned: '2025-01-10' }] },
      'US-TRAVEL',
    );
    expect(p.status).toBe('UNKNOWN');
    expect(p.pendingDetails).toEqual(['PD-095']);
  });
});
