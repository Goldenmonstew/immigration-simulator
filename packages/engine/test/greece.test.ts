import { describe, expect, test } from 'vitest';
import { evaluateGreece } from '../src';
import type { GrPathwayId, GrRequest } from '../src';

// An ordinary residence permit from 2020-03-15, renewed on time.
const base: GrRequest = {
  simulationDate: '2024-01-01',
  dateOfBirth: '1990-05-01',
  permits: [{ kind: 'regular', from: '2020-03-15' }],
  trips: [],
  route: 'general',
};

function pathway(req: Partial<GrRequest>, id: GrPathwayId) {
  const result = evaluateGreece({ ...base, ...req });
  const found = result.pathways.find((p) => p.id === id);
  if (!found) throw new Error(`missing ${id}`);
  return found;
}

describe('long-term residence Μ1 (art. 144)', () => {
  test('5 years immediately before applying', () => {
    const p = pathway({}, 'GR-LONG-TERM');
    expect(p.status).toBe('FUTURE');
    expect(p.earliestDate).toBe('2025-03-15');
  });

  test('an absence shorter than 6 months keeps continuity', () => {
    const p = pathway(
      { trips: [{ departed: '2022-01-10', returned: '2022-07-10' }] },
      'GR-LONG-TERM',
    );
    expect(p.earliestDate).toBe('2025-03-15');
  });

  test('6 months or more: count again after it leaves the window', () => {
    const p = pathway(
      { trips: [{ departed: '2022-01-10', returned: '2022-07-11' }] },
      'GR-LONG-TERM',
    );
    expect(p.earliestDate).toBe('2027-07-11');
    expect(p.checks[1].met).toBe(false);
  });

  test('golden visa time alone is uncertain, not unmet (PD-101)', () => {
    const p = pathway(
      { permits: [{ kind: 'investor', from: '2019-01-01' }] },
      'GR-LONG-TERM',
    );
    expect(p.status).toBe('UNKNOWN');
    expect(p.summary).toContain('2024-01-01');
    expect(p.checks[0].met).toBeUndefined();
  });

  test('study periods only make an earlier date possible', () => {
    const p = pathway(
      {
        simulationDate: '2023-01-01',
        permits: [
          { kind: 'study', from: '2018-09-01', to: '2020-03-14' },
          { kind: 'regular', from: '2020-03-15' },
        ],
      },
      'GR-LONG-TERM',
    );
    expect(p.earliestDate).toBe('2025-03-15');
    expect(p.summary).toContain('2023-09-01');
  });
});

describe('golden visa renewal (art. 100, art. 11)', () => {
  const investor = {
    permits: [
      { kind: 'investor' as const, from: '2022-06-01', to: '2027-05-31' },
    ],
  };

  test('no golden visa: not applicable', () => {
    expect(pathway({}, 'GR-GOLDEN-VISA').status).toBe('NOT_APPLICABLE');
  });

  test('the 2 months before expiry', () => {
    const p = pathway(
      { ...investor, simulationDate: '2026-11-21' },
      'GR-GOLDEN-VISA',
    );
    expect(p.status).toBe('FUTURE');
    expect(p.earliestDate).toBe('2027-03-31');
    expect(p.summary).toContain('2027-08-31');
  });

  test('inside the window', () => {
    const p = pathway(
      { ...investor, simulationDate: '2027-04-15' },
      'GR-GOLDEN-VISA',
    );
    expect(p.status).toBe('MET');
  });

  test('late with a fine, then too late', () => {
    const late = pathway(
      { ...investor, simulationDate: '2027-07-01' },
      'GR-GOLDEN-VISA',
    );
    expect(late.status).toBe('NOT_MET');
    expect(late.summary).toContain('100');
    const tooLate = pathway(
      { ...investor, simulationDate: '2027-09-01' },
      'GR-GOLDEN-VISA',
    );
    expect(tooLate.summary).toContain('2027-08-31');
  });

  test('no expiry entered: unknown', () => {
    const p = pathway(
      { permits: [{ kind: 'investor', from: '2022-06-01' }] },
      'GR-GOLDEN-VISA',
    );
    expect(p.status).toBe('UNKNOWN');
  });
});

describe('naturalisation (art. 5)', () => {
  test('7 years in general', () => {
    const p = pathway({}, 'GR-NATIONALITY');
    expect(p.earliestDate).toBe('2027-03-15');
  });

  test('3 years for the listed categories', () => {
    expect(pathway({ route: 'three-year' }, 'GR-NATIONALITY').status).toBe(
      'MET',
    );
  });

  test('golden visa time counts as a recognised status (PD-105)', () => {
    const p = pathway(
      { permits: [{ kind: 'investor', from: '2018-01-01' }] },
      'GR-NATIONALITY',
    );
    expect(p.earliestDate).toBe('2025-01-01');
    expect(p.pendingDetails).toContain('PD-105');
  });

  test('absences make continuity uncertain (PD-106)', () => {
    const p = pathway(
      {
        route: 'three-year',
        trips: [{ departed: '2022-01-10', returned: '2022-02-10' }],
      },
      'GR-NATIONALITY',
    );
    expect(p.status).toBe('UNKNOWN');
    expect(p.pendingDetails).toContain('PD-106');
  });
});
