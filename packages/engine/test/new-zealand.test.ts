import { describe, expect, test } from 'vitest';
import { evaluateNewZealand } from '../src';
import type { NzPathwayId, NzRequest } from '../src';

// Granted in New Zealand on 2022-03-01, no trips.
const base: NzRequest = {
  simulationDate: '2024-03-01',
  dateOfBirth: '1990-05-01',
  firstArrival: '2020-01-10',
  residentVisa: { granted: '2022-03-01', category: 'general' },
  trips: [],
};

function pathway(req: Partial<NzRequest>, id: NzPathwayId) {
  const result = evaluateNewZealand({ ...base, ...req });
  const found = result.pathways.find((p) => p.id === id);
  if (!found) throw new Error(`missing ${id}`);
  return found;
}

describe('travel conditions (R5.66)', () => {
  test('2 years from the first day as a resident, ending the day before', () => {
    const p = pathway({}, 'NZ-TRAVEL');
    expect(p.status).toBe('MET');
    expect(p.summary).toContain('2024-02-29');
    expect(p.pendingDetails).toEqual(['PD-087']);
  });

  test('from 29 February the anniversary is 1 March', () => {
    const p = pathway(
      {
        simulationDate: '2024-03-01',
        residentVisa: { granted: '2024-02-29', category: 'general' },
      },
      'NZ-TRAVEL',
    );
    expect(p.summary).toContain('2026-02-28');
  });

  test('category lengths: Active Investor Plus Growth 4 years', () => {
    const p = pathway(
      { residentVisa: { granted: '2022-03-01', category: 'aip-growth' } },
      'NZ-TRAVEL',
    );
    expect(p.summary).toContain('2026-02-28');
  });

  test('returning after the travel conditions without a PRV', () => {
    const p = pathway(
      { trips: [{ departed: '2024-02-20', returned: '2024-03-05' }] },
      'NZ-TRAVEL',
    );
    // Outside New Zealand when they end on 2024-02-29: expired from 03-01.
    expect(p.status).toBe('NOT_MET');
    expect(p.summary).toContain('2024-03-01');
    expect(p.pendingDetails).toEqual(['PD-087', 'PD-088']);
  });

  test('a PRV granted abroad before the travel conditions end', () => {
    const p = pathway(
      {
        simulationDate: '2024-02-21',
        permanentResidentVisa: '2024-02-25',
        trips: [{ departed: '2024-02-20', returned: '2024-03-05' }],
      },
      'NZ-TRAVEL',
    );
    expect(p.status).toBe('MET');
  });

  test('a PRV held on the simulation date: not applicable', () => {
    const p = pathway({ permanentResidentVisa: '2024-02-01' }, 'NZ-TRAVEL');
    expect(p.status).toBe('NOT_APPLICABLE');
  });

  test('offshore grant: first entry within 1 year', () => {
    const p = pathway(
      {
        firstArrival: '2023-06-01',
        residentVisa: { granted: '2023-01-15', category: 'general' },
      },
      'NZ-TRAVEL',
    );
    expect(p.status).toBe('MET');
    expect(p.checks[0].met).toBe(true);
    expect(p.checks[0].text).toContain('2024-01-14');
    expect(p.summary).toContain('2025-05-31');
  });

  test('a planned first entry is in the future', () => {
    const p = pathway(
      {
        simulationDate: '2026-11-21',
        firstArrival: '2027-01-15',
        residentVisa: { granted: '2026-11-01', category: 'general' },
      },
      'NZ-TRAVEL',
    );
    expect(p.status).toBe('FUTURE');
    expect(p.earliestDate).toBe('2027-01-15');
    expect(p.checks[0].met).toBeUndefined();
  });

  test('offshore grant: first entry too late lapses everything', () => {
    const req = {
      simulationDate: '2026-01-01',
      firstArrival: '2024-01-15',
      residentVisa: { granted: '2023-01-15', category: 'general' as const },
    };
    expect(pathway(req, 'NZ-TRAVEL').status).toBe('NOT_MET');
    expect(pathway(req, 'NZ-PRV').status).toBe('NOT_MET');
    expect(pathway(req, 'NZ-CITIZENSHIP').status).toBe('NOT_MET');
  });
});

describe('permanent resident visa (RV2.5, RV2.5.1)', () => {
  test('24 months on the visa, 184 days in each part', () => {
    const p = pathway({}, 'NZ-PRV');
    expect(p.status).toBe('MET');
    expect(p.earliestDate).toBe('2024-03-01');
    expect(p.checks.map((c) => c.met)).toEqual([true, true, true, true]);
  });

  test('24 months are 730 days (Visa Pak 588)', () => {
    // 2022-03-01 plus 730 days is 2024-02-29, a day before the calendar date.
    const p = pathway({ simulationDate: '2024-02-28' }, 'NZ-PRV');
    expect(p.status).toBe('FUTURE');
    expect(p.earliestDate).toBe('2024-02-29');
  });

  test('12-month portions are 365 days across a leap year', () => {
    // Visa Pak 588: for 2024-05-19 the last portion is 2023-05-20 to
    // 2024-05-18, which holds 183 days after a return on 2023-11-18.
    const p = pathway(
      {
        simulationDate: '2024-05-19',
        firstArrival: '2020-01-10',
        residentVisa: { granted: '2022-05-19', category: 'general' },
        trips: [{ departed: '2023-05-19', returned: '2023-11-18' }],
      },
      'NZ-PRV',
    );
    expect(p.status).toBe('FUTURE');
    expect(p.earliestDate).toBe('2024-05-20');
    expect(p.checks.at(-1)?.text).toContain('183');
  });

  test('granted during a trip: counted from the return', () => {
    const p = pathway(
      {
        simulationDate: '2025-01-20',
        firstArrival: '2018-01-01',
        residentVisa: { granted: '2023-01-20', category: 'general' },
        trips: [{ departed: '2023-01-10', returned: '2023-02-10' }],
      },
      'NZ-PRV',
    );
    // 2023-02-10 plus 730 days.
    expect(p.status).toBe('FUTURE');
    expect(p.earliestDate).toBe('2025-02-09');
  });

  test('granted on a departure day counts as in New Zealand', () => {
    const p = pathway(
      {
        simulationDate: '2025-01-20',
        firstArrival: '2018-01-01',
        residentVisa: { granted: '2023-01-20', category: 'general' },
        trips: [{ departed: '2023-01-20', returned: '2023-02-10' }],
      },
      'NZ-PRV',
    );
    expect(p.status).toBe('MET');
  });

  test('a long absence: 184 days in the last 12 months, tax route earlier', () => {
    // Away 2022-03-02 to 2022-12-30; the last 12 months reach 184 days on
    // 2023-07-03 (2022-12-31 plus 183 days of 2023).
    const p = pathway(
      {
        simulationDate: '2023-01-01',
        firstArrival: '2019-01-01',
        residentVisa: { granted: '2021-01-01', category: 'general' },
        trips: [{ departed: '2022-03-01', returned: '2022-12-31' }],
      },
      'NZ-PRV',
    );
    expect(p.status).toBe('FUTURE');
    expect(p.earliestDate).toBe('2023-07-03');
    expect(p.checks[3].text).toContain('61');
    expect(p.summary).toContain('2023-01-01');
    expect(p.summary).toContain('RV2.5.5');
  });

  test('Active Investor Plus goes to RV2.10: unknown', () => {
    const p = pathway(
      { residentVisa: { granted: '2022-03-01', category: 'aip-balanced' } },
      'NZ-PRV',
    );
    expect(p.status).toBe('UNKNOWN');
    expect(p.summary).toContain('RV2.10');
  });

  test('Religious Worker: 5 years from the first day as a resident', () => {
    const req = {
      residentVisa: {
        granted: '2022-03-01',
        category: 'religious-worker' as const,
      },
    };
    const p = pathway(req, 'NZ-PRV');
    expect(p.status).toBe('FUTURE');
    expect(p.earliestDate).toBe('2027-03-01');
    expect(pathway(req, 'NZ-CITIZENSHIP').earliestDate).toBe('2027-03-01');
    expect(pathway(req, 'NZ-TRAVEL').summary).toContain('2027-02-28');
  });

  test('Parent: s49(1) conditions make both unknown', () => {
    const req = {
      residentVisa: { granted: '2022-03-01', category: 'parent' as const },
    };
    expect(pathway(req, 'NZ-PRV').status).toBe('UNKNOWN');
    expect(pathway(req, 'NZ-CITIZENSHIP').status).toBe('UNKNOWN');
  });

  test('a PRV already held: not applicable', () => {
    const p = pathway({ permanentResidentVisa: '2024-02-01' }, 'NZ-PRV');
    expect(p.status).toBe('NOT_APPLICABLE');
  });

  test('applying abroad before the visa expires still works', () => {
    const trips = [{ departed: '2024-02-20', returned: '2024-03-05' }];
    expect(
      pathway({ simulationDate: '2024-02-29', trips }, 'NZ-PRV').status,
    ).toBe('MET');
    // From 2024-03-01 the resident visa has expired (RV1.5).
    expect(pathway({ trips }, 'NZ-PRV').status).toBe('UNKNOWN');
  });

  test('not reached before a late return: unknown (PD-088)', () => {
    const p = pathway(
      {
        simulationDate: '2023-06-01',
        trips: [{ departed: '2023-07-01', returned: '2024-06-01' }],
      },
      'NZ-PRV',
    );
    expect(p.status).toBe('UNKNOWN');
    expect(p.pendingDetails).toEqual(['PD-088']);
  });
});

describe('citizenship by grant (s8)', () => {
  test('240 days in the oldest year decides the date', () => {
    // 2022-03-01 to 2022-10-26 is 240 days, so the oldest year must end on
    // 2022-10-26: the application date is 2026-10-27.
    const p = pathway({}, 'NZ-CITIZENSHIP');
    expect(p.status).toBe('FUTURE');
    expect(p.earliestDate).toBe('2026-10-27');
    expect(p.pendingDetails).toBeUndefined();
  });

  test('met on the earliest date', () => {
    const p = pathway({ simulationDate: '2026-10-27' }, 'NZ-CITIZENSHIP');
    expect(p.status).toBe('MET');
    expect(p.checks.every((c) => c.met)).toBe(true);
  });

  test('travel days counted in, with the strict date given (PD-086)', () => {
    // Away 2020-01-02 to 2020-05-06 (126 days): the year 2019-06-01 to
    // 2020-05-31 has 240 days. Not counting travel days it has 238, and
    // only on 2023-01-03 does that year split the trip enough.
    const p = pathway(
      {
        simulationDate: '2022-06-01',
        firstArrival: '2015-01-01',
        residentVisa: { granted: '2015-01-01', category: 'general' },
        permanentResidentVisa: '2017-06-01',
        trips: [{ departed: '2020-01-01', returned: '2020-05-07' }],
      },
      'NZ-CITIZENSHIP',
    );
    expect(p.status).toBe('MET');
    expect(p.summary).toContain('2023-01-03');
    expect(p.pendingDetails).toEqual(['PD-086']);
  });

  test('must be 16', () => {
    const p = pathway(
      {
        simulationDate: '2027-01-01',
        dateOfBirth: '2012-01-01',
        firstArrival: '2015-01-01',
        residentVisa: { granted: '2015-01-01', category: 'general' },
      },
      'NZ-CITIZENSHIP',
    );
    expect(p.status).toBe('FUTURE');
    expect(p.earliestDate).toBe('2028-01-01');
    expect(p.checks[0].met).toBe(false);
  });

  test('days before the first day as a resident do not count', () => {
    // On a work visa from 2015; resident only from 2022-03-01.
    const p = pathway(
      { simulationDate: '2026-06-01', firstArrival: '2015-01-01' },
      'NZ-CITIZENSHIP',
    );
    expect(p.earliestDate).toBe('2026-10-27');
  });

  test('a late return before the date: unknown (PD-088)', () => {
    const p = pathway(
      { trips: [{ departed: '2024-02-20', returned: '2024-03-05' }] },
      'NZ-CITIZENSHIP',
    );
    expect(p.status).toBe('UNKNOWN');
    expect(p.pendingDetails).toEqual(['PD-088']);
  });

  test('leaving after the travel conditions ends the visa the next day', () => {
    const trips = [{ departed: '2025-06-01', returned: '2025-07-01' }];
    const travel = pathway(
      { simulationDate: '2025-01-01', trips },
      'NZ-TRAVEL',
    );
    expect(travel.status).toBe('NOT_MET');
    expect(travel.summary).toContain('2025-06-02');
    expect(
      pathway({ simulationDate: '2025-01-01', trips }, 'NZ-CITIZENSHIP').status,
    ).toBe('UNKNOWN');
  });

  test('the strict count also leaves out the first arrival (PD-086)', () => {
    // Granted abroad, first in New Zealand on 2022-03-01: not counting that
    // day, the oldest year reaches 240 days one day later.
    const p = pathway(
      {
        simulationDate: '2024-05-19',
        firstArrival: '2022-03-01',
        residentVisa: { granted: '2022-02-01', category: 'general' },
      },
      'NZ-CITIZENSHIP',
    );
    expect(p.earliestDate).toBe('2026-10-27');
    expect(p.summary).toContain('2026-10-28');
    expect(p.pendingDetails).toEqual(['PD-086']);
  });

  test('a Parent visa replaced by a PRV has no conditions left', () => {
    const p = pathway(
      {
        simulationDate: '2026-11-21',
        firstArrival: '2015-06-01',
        residentVisa: { granted: '2016-01-01', category: 'parent' },
        permanentResidentVisa: '2026-06-01',
      },
      'NZ-CITIZENSHIP',
    );
    expect(p.status).toBe('MET');
  });

  test('Active Investor Plus conditions make citizenship unknown', () => {
    const p = pathway(
      {
        simulationDate: '2029-12-21',
        firstArrival: '2025-01-01',
        residentVisa: { granted: '2025-05-01', category: 'aip-balanced' },
      },
      'NZ-CITIZENSHIP',
    );
    expect(p.status).toBe('UNKNOWN');
  });

  test('an expired resident visa fails the visa check', () => {
    // Leaving on 2026-11-01, after the travel conditions: expired 11-02.
    const p = pathway(
      {
        simulationDate: '2026-11-21',
        firstArrival: '2019-01-01',
        residentVisa: { granted: '2020-01-01', category: 'general' },
        trips: [{ departed: '2026-11-01', returned: '2027-01-01' }],
      },
      'NZ-CITIZENSHIP',
    );
    expect(p.status).toBe('UNKNOWN');
    expect(p.checks[1].met).toBe(false);
    expect(p.checks[1].text).toContain('2026-11-02');
  });

  test('the strict date is not given past the expiry', () => {
    // The main date 2026-10-27 is before the visa expires on 2026-10-28,
    // the strict date would fall on it.
    const p = pathway(
      {
        simulationDate: '2026-10-26',
        firstArrival: '2022-03-01',
        residentVisa: { granted: '2022-02-01', category: 'general' },
        trips: [{ departed: '2026-10-27', returned: '2026-11-15' }],
      },
      'NZ-CITIZENSHIP',
    );
    expect(p.earliestDate).toBe('2026-10-27');
    expect(p.summary).not.toContain('2026-10-28');
    expect(p.summary).toContain('PD-086');
  });
});
