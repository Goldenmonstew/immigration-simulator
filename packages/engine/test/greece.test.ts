import { describe, expect, test } from 'vitest';
import { evaluateGreece } from '../src';
import type { GrPathwayId, GrRequest } from '../src';

// An ordinary residence permit from 2020-03-15, renewed on time.
const base: GrRequest = {
  simulationDate: '2024-01-01',
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

  test('study counts at half (άρθ. 144 παρ. 2)', () => {
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
    // 561 study days count as 280.5: 1,547 ordinary days make up the
    // 1,827 days of the five years before 2024-06-09.
    expect(p.status).toBe('FUTURE');
    expect(p.earliestDate).toBe('2024-06-09');
  });

  test('met once study at half makes up the five years', () => {
    const p = pathway(
      {
        simulationDate: '2028-03-01',
        permits: [
          { kind: 'study', from: '2021-11-21', to: '2023-11-20' },
          { kind: 'regular', from: '2023-11-21' },
        ],
      },
      'GR-LONG-TERM',
    );
    expect(p.status).toBe('MET');
    expect(p.checks[0].met).toBe(true);
  });

  test('absences are checked over the whole counted stretch', () => {
    const p = pathway(
      {
        simulationDate: '2026-11-21',
        permits: [
          { kind: 'study', from: '2019-11-21', to: '2023-11-20' },
          { kind: 'regular', from: '2023-11-21' },
        ],
        trips: [{ departed: '2020-03-15', returned: '2021-01-15' }],
      },
      'GR-LONG-TERM',
    );
    // Without the 10-month absence in 2020 this would be met today.
    expect(p.status).not.toBe('MET');
    expect(p.earliestDate).not.toBe('2026-11-21');
    expect(p.summary).not.toContain('2026-11-21');
  });

  test('a national visa (Ζ) stay does not count', () => {
    const p = pathway(
      {
        permits: [
          { kind: 'temporary', from: '2019-01-01', to: '2019-12-31' },
          { kind: 'regular', from: '2020-01-01' },
        ],
      },
      'GR-LONG-TERM',
    );
    expect(p.earliestDate).toBe('2025-01-01');
    expect(p.summary).not.toContain('2024-01-01');
  });

  test('a permit must be held on the application day', () => {
    const p = pathway(
      {
        simulationDate: '2026-11-21',
        permits: [{ kind: 'regular', from: '2021-11-21', to: '2026-11-20' }],
      },
      'GR-LONG-TERM',
    );
    expect(p.status).toBe('NOT_MET');
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
    // Late applications with a fine are still accepted.
    expect(late.status).toBe('MET');
    expect(late.summary).toContain('100');
    expect(late.checks[0].met).toBe(false);
    expect(late.checks[1].met).toBe(true);
    const tooLate = pathway(
      { ...investor, simulationDate: '2027-09-01' },
      'GR-GOLDEN-VISA',
    );
    expect(tooLate.status).toBe('NOT_MET');
    expect(tooLate.summary).toContain('2027-08-31');
  });

  test('a newer card in force wins over an old one without an expiry', () => {
    const permits: GrRequest['permits'] = [
      { kind: 'investor', from: '2022-06-01' },
      { kind: 'investor', from: '2027-06-01', to: '2032-05-31' },
    ];
    const p = pathway(
      { simulationDate: '2032-04-15', permits },
      'GR-GOLDEN-VISA',
    );
    expect(p.status).toBe('MET');
    expect(p.summary).toContain('2032-05-31');
    // After the new card expires: late with a fine, then too late.
    const late = pathway(
      { permits, simulationDate: '2032-06-15' },
      'GR-GOLDEN-VISA',
    );
    expect(late.status).toBe('MET');
    expect(late.summary).toContain('2032-08-31');
    expect(
      pathway({ permits, simulationDate: '2032-09-01' }, 'GR-GOLDEN-VISA')
        .status,
    ).toBe('NOT_MET');
    // The other routes also stop counting the old card once replaced.
    const after = { permits, simulationDate: '2032-09-01' };
    expect(pathway(after, 'GR-NATIONALITY').status).toBe('NOT_MET');
    expect(pathway(after, 'GR-LONG-TERM').status).toBe('NOT_MET');
  });

  test('the card in force is used, not a later one', () => {
    const p = pathway(
      {
        simulationDate: '2027-04-15',
        permits: [
          { kind: 'investor', from: '2022-06-01', to: '2027-05-31' },
          { kind: 'investor', from: '2027-06-01', to: '2032-05-31' },
        ],
      },
      'GR-GOLDEN-VISA',
    );
    expect(p.status).toBe('MET');
    expect(p.summary).toContain('2027-05-31');
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

  test('study time does not count (Migration Code άρθ. 123 παρ. 6)', () => {
    const p = pathway(
      {
        simulationDate: '2026-11-21',
        permits: [
          { kind: 'study', from: '2019-11-21', to: '2022-11-20' },
          { kind: 'regular', from: '2022-11-21' },
        ],
      },
      'GR-NATIONALITY',
    );
    expect(p.status).toBe('FUTURE');
    expect(p.earliestDate).toBe('2029-11-21');
    expect(p.pendingDetails).toContain('PD-103');
  });

  test('the 12-year route does not ask for a listed status', () => {
    const p = pathway(
      { simulationDate: '2026-11-21', route: 'twelve-year' },
      'GR-NATIONALITY',
    );
    expect(p.earliestDate).toBe('2032-03-15');
    expect(p.notChecked[0]).not.toContain('清单');
  });

  test('national visa (Ζ) time is uncertain (PD-109)', () => {
    const permits = (to?: string): GrRequest['permits'] => [
      { kind: 'temporary', from: '2019-11-21', to: '2022-11-20' },
      { kind: 'regular', from: '2022-11-21', ...(to ? { to } : {}) },
    ];
    // A later date without the Ζ stay is certain; the earlier one is noted.
    const later = pathway(
      { simulationDate: '2026-11-21', permits: permits() },
      'GR-NATIONALITY',
    );
    expect(later.status).toBe('FUTURE');
    expect(later.earliestDate).toBe('2029-11-21');
    expect(later.summary).toContain('2026-11-21');
    expect(later.pendingDetails).toContain('PD-109');
    expect(later.checks[0].met).toBeUndefined();
    // Only with the Ζ stay are 7 years ever met: unknown, candidate date.
    const only = pathway(
      { simulationDate: '2026-11-21', permits: permits('2028-12-31') },
      'GR-NATIONALITY',
    );
    expect(only.status).toBe('UNKNOWN');
    expect(only.summary).toContain('2026-11-21');
    expect(only.pendingDetails).toContain('PD-109');
  });

  test('a study permit alone cannot be used to apply', () => {
    const p = pathway(
      {
        simulationDate: '2026-11-21',
        permits: [{ kind: 'study', from: '2015-01-01' }],
      },
      'GR-NATIONALITY',
    );
    expect(p.status).toBe('NOT_MET');
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
