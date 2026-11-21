import { describe, expect, test } from 'vitest';
import { evaluateSpain } from '../src';
import type { EsPathwayId, EsRequest } from '../src';

// A residence permit from 2020-03-15, renewed on time.
const base: EsRequest = {
  simulationDate: '2024-01-01',
  permits: [{ from: '2020-03-15' }],
  trips: [],
  route: 'general',
};

function pathway(req: Partial<EsRequest>, id: EsPathwayId) {
  const result = evaluateSpain({ ...base, ...req });
  const found = result.pathways.find((p) => p.id === id);
  if (!found) throw new Error(`missing ${id}`);
  return found;
}

describe('residencia de larga duración nacional (art. 183)', () => {
  test('5 years to the same date', () => {
    const p = pathway({}, 'ES-LONG-TERM');
    expect(p.status).toBe('FUTURE');
    expect(p.earliestDate).toBe('2025-03-15');
  });

  test('an absence of exactly 6 months keeps continuity', () => {
    const p = pathway(
      { trips: [{ departed: '2022-01-10', returned: '2022-07-10' }] },
      'ES-LONG-TERM',
    );
    expect(p.earliestDate).toBe('2025-03-15');
  });

  test('more than 6 months: count again after it leaves the window', () => {
    // Away 2022-01-11 to 2022-07-10; the window must start after it.
    const p = pathway(
      { trips: [{ departed: '2022-01-10', returned: '2022-07-11' }] },
      'ES-LONG-TERM',
    );
    expect(p.earliestDate).toBe('2027-07-11');
  });

  test('a total between 303 and 306 days is uncertain', () => {
    // 150 + 156 = 306 days: 10 calendar months span 303 to 306 days.
    const p = pathway(
      {
        trips: [
          { departed: '2021-01-01', returned: '2021-06-01' },
          { departed: '2022-01-01', returned: '2022-06-07' },
        ],
      },
      'ES-LONG-TERM',
    );
    expect(p.status).toBe('FUTURE');
    // From 2026-01-05 the window starts on 2021-01-05 and holds 147 + 156 =
    // 303 days of the two absences.
    expect(p.earliestDate).toBe('2026-01-05');
    expect(p.summary).toContain('2025-03-15');
    expect(p.checks[2].text).toContain('303–306');
  });

  test('study stays only make an earlier date possible', () => {
    const p = pathway(
      {
        simulationDate: '2023-01-01',
        permits: [
          { from: '2018-09-01', to: '2020-03-14', study: true },
          { from: '2020-03-15' },
        ],
      },
      'ES-LONG-TERM',
    );
    expect(p.earliestDate).toBe('2025-03-15');
    expect(p.summary).toContain('2023-09-01');
  });

  test('a gap between permits starts again', () => {
    const p = pathway(
      {
        permits: [
          { from: '2020-03-15', to: '2022-03-14' },
          { from: '2022-04-01' },
        ],
      },
      'ES-LONG-TERM',
    );
    expect(p.earliestDate).toBe('2027-04-01');
  });

  test('study stays alone are uncertain, not unmet (PD-098)', () => {
    const p = pathway(
      { permits: [{ from: '2018-09-01', study: true }] },
      'ES-LONG-TERM',
    );
    expect(p.status).toBe('UNKNOWN');
    expect(p.summary).toContain('2024-01-01');
  });

  test('applying within 3 months of the permit expiring (art. 184.2)', () => {
    const at = (simulationDate: string) =>
      pathway(
        { simulationDate, permits: [{ from: '2019-06-01', to: '2026-11-20' }] },
        'ES-LONG-TERM',
      ).status;
    expect(at('2026-11-21')).toBe('MET');
    expect(at('2026-12-20')).toBe('MET');
    expect(at('2027-02-20')).toBe('MET');
    expect(at('2027-02-21')).toBe('NOT_MET');
  });

  test('met on the simulation date', () => {
    const p = pathway({ simulationDate: '2026-11-21' }, 'ES-LONG-TERM');
    expect(p.status).toBe('MET');
    expect(p.checks.every((c) => c.met)).toBe(true);
  });
});

describe('nacionalidad por residencia (art. 22)', () => {
  test('10 years in general', () => {
    const p = pathway({}, 'ES-NATIONALITY');
    expect(p.status).toBe('FUTURE');
    expect(p.earliestDate).toBe('2030-03-15');
  });

  test('2 years for Ibero-American nationals', () => {
    const p = pathway({ route: 'ibero' }, 'ES-NATIONALITY');
    expect(p.status).toBe('MET');
  });

  test('1 year of marriage to a Spanish citizen', () => {
    const p = pathway(
      {
        simulationDate: '2026-01-01',
        route: 'marriage',
        marriedToSpaniard: '2025-06-01',
      },
      'ES-NATIONALITY',
    );
    expect(p.earliestDate).toBe('2026-06-01');
  });

  test('the permit must still be valid on the application day', () => {
    // Valid 2016-11-21 to 2026-11-20 only: 10 years end the day before.
    const p = pathway(
      {
        simulationDate: '2026-11-15',
        permits: [{ from: '2016-11-21', to: '2026-11-20' }],
      },
      'ES-NATIONALITY',
    );
    expect(p.status).toBe('NOT_MET');
  });

  test('a trip leaving the day before applying is an absence', () => {
    const p = pathway(
      {
        simulationDate: '2026-11-21',
        route: 'ibero',
        trips: [{ departed: '2026-11-20', returned: '2026-12-04' }],
      },
      'ES-NATIONALITY',
    );
    expect(p.status).toBe('UNKNOWN');
  });

  test('absences make continuity uncertain (PD-100)', () => {
    const p = pathway(
      {
        route: 'ibero',
        trips: [{ departed: '2023-01-10', returned: '2023-02-10' }],
      },
      'ES-NATIONALITY',
    );
    expect(p.status).toBe('UNKNOWN');
    expect(p.summary).toContain('30');
    expect(p.pendingDetails).toContain('PD-100');
  });

  test('study stays do not count', () => {
    const p = pathway(
      {
        simulationDate: '2021-01-01',
        route: 'ibero',
        permits: [
          { from: '2018-09-01', to: '2020-03-14', study: true },
          { from: '2020-03-15' },
        ],
      },
      'ES-NATIONALITY',
    );
    expect(p.earliestDate).toBe('2022-03-15');
  });
});
