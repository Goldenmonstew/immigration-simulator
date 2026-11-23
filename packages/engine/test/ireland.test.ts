import { describe, expect, test } from 'vitest';
import { evaluateIreland } from '../src';
import type { IePathwayId, IeRequest } from '../src';

// Stamp 1 on an employment permit from 2021-03-01, renewed on time.
const base: IeRequest = {
  simulationDate: '2025-06-01',
  permissions: [{ kind: 'stamp1', from: '2021-03-01' }],
  trips: [],
  stamp4Route: 'none',
};

function pathway(req: Partial<IeRequest>, id: IePathwayId) {
  const result = evaluateIreland({ ...base, ...req });
  const found = result.pathways.find((p) => p.id === id);
  if (!found) throw new Error(`missing ${id}`);
  return found;
}

// A permission since 2015, so only the year before applying matters.
const settled: Partial<IeRequest> = {
  simulationDate: '2026-11-22',
  permissions: [{ kind: 'stamp4', from: '2015-01-01' }],
};

describe('naturalisation (s15(1)(c), s15C, s16A)', () => {
  test('1 year continuous + 1460 days and a day per 29 February before it', () => {
    // Window 2017-03-02 to 2025-03-01 holds 2020-02-29 and 2024-02-29, so
    // 1462 days: 2021-03-01 to 2025-03-01, the year from 2025-03-02.
    const p = pathway({}, 'IE-NATURALISATION');
    expect(p.status).toBe('FUTURE');
    expect(p.earliestDate).toBe('2026-03-02');
    // Without the leap days, 1460 days end on 2025-02-27 (PD-113).
    expect(p.summary).toContain('2026-02-28');
    expect(p.checks.map((c) => c.met)).toEqual([true, true, false]);
  });

  test('met on the simulation date', () => {
    const p = pathway(settled, 'IE-NATURALISATION');
    expect(p.status).toBe('MET');
    expect(p.earliestDate).toBe('2026-11-22');
  });

  test('student and protection applicant time is not reckonable', () => {
    const p = pathway(
      {
        simulationDate: '2022-01-01',
        permissions: [
          { kind: 'student', from: '2014-01-01', to: '2015-12-31' },
          {
            kind: 'protection-applicant',
            from: '2016-01-01',
            to: '2020-12-31',
          },
          { kind: 'stamp4', from: '2021-01-01' },
        ],
      },
      'IE-NATURALISATION',
    );
    // 1462 days from 2021-01-01 end on 2025-01-01.
    expect(p.earliestDate).toBe('2026-01-02');
    expect(p.checks[2].met).toBe(false);
  });

  test('only excluded permissions: not met', () => {
    const p = pathway(
      { permissions: [{ kind: 'student', from: '2016-01-01' }] },
      'IE-NATURALISATION',
    );
    expect(p.status).toBe('NOT_MET');
    expect(p.earliestDate).toBeUndefined();
  });

  test('a gap between permissions breaks the continuous year', () => {
    const p = pathway(
      {
        simulationDate: '2026-11-22',
        permissions: [
          { kind: 'stamp4', from: '2015-01-01', to: '2026-05-31' },
          { kind: 'stamp4', from: '2026-06-02' },
        ],
      },
      'IE-NATURALISATION',
    );
    expect(p.checks[0].met).toBe(false);
    expect(p.earliestDate).toBe('2027-06-02');
  });

  test('uncertain permissions (Stamp 1A, 4D and so on) give UNKNOWN', () => {
    const p = pathway(
      { permissions: [{ kind: 'other', from: '2018-01-01' }] },
      'IE-NATURALISATION',
    );
    expect(p.status).toBe('UNKNOWN');
    expect(p.earliestDate).toBeUndefined();
    expect(p.summary).toContain('2025-06-01');
    expect(p.checks[0].met).toBeUndefined();
    expect(p.pendingDetails).toContain('PD-114');
  });

  test('departure and return days are not absences', () => {
    const p = pathway(
      {
        ...settled,
        trips: [{ departed: '2026-07-01', returned: '2026-07-15' }],
        locale: 'en',
      },
      'IE-NATURALISATION',
    );
    expect(p.checks[1].text).toMatch(/^13 days absent/);
    expect(p.status).toBe('MET');
  });

  test('70 days absent is fine', () => {
    // 2026-01-02 to 2026-03-12: 30 + 28 + 12 days.
    const p = pathway(
      {
        ...settled,
        trips: [{ departed: '2026-01-01', returned: '2026-03-13' }],
      },
      'IE-NATURALISATION',
    );
    expect(p.status).toBe('MET');
    expect(p.checks[1].met).toBe(true);
  });

  test('71 days needs exceptional circumstances: unknown now, sure later', () => {
    const p = pathway(
      {
        ...settled,
        trips: [{ departed: '2026-01-01', returned: '2026-03-14' }],
      },
      'IE-NATURALISATION',
    );
    expect(p.checks[1].met).toBeUndefined();
    // The simulation date depends on discretion (review68-1): not FUTURE.
    expect(p.status).toBe('UNKNOWN');
    expect(p.earliestDate).toBeUndefined();
    // 70 days once 2026-01-02 leaves the year: from 2027-01-03.
    expect(p.summary).toContain('2027-01-03');
    expect(p.summary).toContain('2026-11-22');
    expect(p.summary).toContain('71');
  });

  test('100 days is the most the Minister can accept', () => {
    // 2026-01-02 to 2026-04-11: 30 + 28 + 31 + 11 days.
    const p = pathway(
      {
        ...settled,
        trips: [{ departed: '2026-01-01', returned: '2026-04-12' }],
      },
      'IE-NATURALISATION',
    );
    expect(p.checks[1].met).toBeUndefined();
    expect(p.status).toBe('UNKNOWN');
    expect(p.summary).toContain('2026-11-22');
  });

  test('over 100 days does not qualify', () => {
    const p = pathway(
      {
        ...settled,
        trips: [{ departed: '2026-01-01', returned: '2026-04-13' }],
      },
      'IE-NATURALISATION',
    );
    expect(p.checks[1].met).toBe(false);
    // 100 days once 2026-01-02 leaves (2027-01-03); 70 from 2026-02-02 on.
    expect(p.earliestDate).toBe('2027-02-02');
    expect(p.summary).toContain('2027-01-03');
  });

  test('absences in the earlier years: deducted on the strict reading (PD-112)', () => {
    // 10 days abroad in 2023 push the 1462 days back to 2025-03-11.
    const p = pathway(
      { trips: [{ departed: '2023-01-01', returned: '2023-01-12' }] },
      'IE-NATURALISATION',
    );
    expect(p.earliestDate).toBe('2026-03-12');
    expect(p.summary).toContain('2026-02-28');
  });

  test('the draft bill is a note only', () => {
    const p = pathway({ locale: 'en' }, 'IE-NATURALISATION');
    expect(p.summary).toContain('2 years’ continuous residence');
    expect(p.pendingDetails).toContain('PD-119');
  });
});

describe('spouse or civil partner (s15A)', () => {
  test('not applicable without a marriage date', () => {
    expect(pathway({}, 'IE-SPOUSE').status).toBe('NOT_APPLICABLE');
  });

  test('3 years of marriage', () => {
    const p = pathway(
      {
        simulationDate: '2025-01-01',
        permissions: [{ kind: 'stamp4', from: '2022-01-10' }],
        marriedOn: '2023-06-15',
      },
      'IE-SPOUSE',
    );
    expect(p.status).toBe('FUTURE');
    expect(p.earliestDate).toBe('2026-06-15');
    expect(p.checks[0].met).toBe(false);
  });

  test('1 year continuous + 730 days and a day per 29 February before it', () => {
    // Window 2021-09-01 to 2025-08-31 holds 2024-02-29: 731 days from
    // 2023-09-01 end on 2025-08-31.
    const p = pathway(
      {
        simulationDate: '2025-01-01',
        permissions: [{ kind: 'stamp1g-spouse', from: '2023-09-01' }],
        marriedOn: '2020-01-01',
      },
      'IE-SPOUSE',
    );
    expect(p.earliestDate).toBe('2026-09-01');
    expect(p.summary).toContain('2026-08-31');
  });

  test('married on 29 February: 3 years on 1 March', () => {
    const p = pathway(
      {
        simulationDate: '2027-02-28',
        permissions: [{ kind: 'stamp4', from: '2015-01-01' }],
        marriedOn: '2024-02-29',
      },
      'IE-SPOUSE',
    );
    expect(p.earliestDate).toBe('2027-03-01');
  });

  test('met, not met and unknown', () => {
    const married = { marriedOn: '2015-01-01' };
    expect(pathway({ ...settled, ...married }, 'IE-SPOUSE').status).toBe('MET');
    expect(
      pathway(
        {
          ...married,
          permissions: [{ kind: 'student', from: '2015-01-01' }],
        },
        'IE-SPOUSE',
      ).status,
    ).toBe('NOT_MET');
    const p = pathway(
      { ...married, permissions: [{ kind: 'other', from: '2015-01-01' }] },
      'IE-SPOUSE',
    );
    expect(p.status).toBe('UNKNOWN');
    expect(p.pendingDetails).toEqual(
      expect.arrayContaining(['PD-114', 'PD-115']),
    );
  });

  test('the 70-day rule applies too (s15C(2))', () => {
    const p = pathway(
      {
        ...settled,
        marriedOn: '2015-01-01',
        trips: [{ departed: '2026-01-01', returned: '2026-04-13' }],
      },
      'IE-SPOUSE',
    );
    expect(p.checks[2].met).toBe(false);
    expect(p.earliestDate).toBe('2027-02-02');
  });
});

test('lawful residence in Northern Ireland counts for s15A only (review68-1)', () => {
  const req: Partial<IeRequest> = {
    simulationDate: '2026-11-22',
    permissions: [
      { kind: 'ni-residence', from: '2019-01-01', to: '2024-12-31' },
      { kind: 'stamp4', from: '2025-01-01' },
    ],
    marriedOn: '2020-01-01',
  };
  const spouse = pathway(req, 'IE-SPOUSE');
  expect(spouse.status).toBe('MET');
  // The State only: 1462 days from 2025-01-01 end on 2029-01-01.
  const general = pathway(req, 'IE-NATURALISATION');
  expect(general.status).toBe('FUTURE');
  expect(general.earliestDate).toBe('2030-01-02');
});

test('permissions ISD does not list for naturalisation stay uncertain (PD-114)', () => {
  for (const kind of [
    'stamp4d',
    'stamp1g-ict',
    'stamp1a',
    'stamp4-eufam',
  ] as const) {
    const p = pathway(
      { permissions: [{ kind, from: '2018-01-01' }] },
      'IE-NATURALISATION',
    );
    expect(p.status).toBe('UNKNOWN');
    expect(p.pendingDetails).toContain('PD-114');
  }
});

describe('Stamp 4 and Stamp 5 (ISD policy)', () => {
  test('not applicable when no route is chosen', () => {
    expect(pathway({}, 'IE-STAMP4').status).toBe('NOT_APPLICABLE');
  });

  test('21 months from starting work on a CSEP', () => {
    const req: Partial<IeRequest> = {
      simulationDate: '2026-01-01',
      stamp4Route: 'csep',
      employmentStart: '2025-03-15',
    };
    const p = pathway(req, 'IE-STAMP4');
    expect(p.status).toBe('FUTURE');
    expect(p.earliestDate).toBe('2026-12-15');
    expect(p.checks[0].met).toBe(false);
    expect(
      pathway({ ...req, simulationDate: '2026-12-15' }, 'IE-STAMP4').status,
    ).toBe('MET');
  });

  test('57 months on a General Employment Permit', () => {
    const req: Partial<IeRequest> = {
      simulationDate: '2026-10-09',
      stamp4Route: 'gep',
      employmentStart: '2022-01-10',
    };
    expect(pathway(req, 'IE-STAMP4').earliestDate).toBe('2026-10-10');
    expect(
      pathway({ ...req, simulationDate: '2026-10-10' }, 'IE-STAMP4').status,
    ).toBe('MET');
  });

  test('starting on the 31st: the end of February or 1 March (PD-116)', () => {
    const req: Partial<IeRequest> = {
      stamp4Route: 'csep',
      employmentStart: '2024-05-31',
    };
    const before = pathway(
      { ...req, simulationDate: '2026-02-27' },
      'IE-STAMP4',
    );
    expect(before.status).toBe('FUTURE');
    expect(before.earliestDate).toBe('2026-03-01');
    expect(before.summary).toContain('2026-02-28');
    const on = pathway({ ...req, simulationDate: '2026-02-28' }, 'IE-STAMP4');
    expect(on.status).toBe('UNKNOWN');
    expect(on.checks[0].met).toBeUndefined();
    expect(
      pathway({ ...req, simulationDate: '2026-03-01' }, 'IE-STAMP4').status,
    ).toBe('MET');
  });

  test('no start date: unknown', () => {
    expect(pathway({ stamp4Route: 'gep' }, 'IE-STAMP4').status).toBe('UNKNOWN');
  });

  test('5 years on Stamp 1G', () => {
    const p = pathway(
      {
        simulationDate: '2025-01-01',
        permissions: [{ kind: 'stamp1g-spouse', from: '2021-06-01' }],
        stamp4Route: 'spouse-1g',
      },
      'IE-STAMP4',
    );
    expect(p.status).toBe('FUTURE');
    expect(p.earliestDate).toBe('2026-06-01');
    expect(
      pathway(
        {
          simulationDate: '2025-01-01',
          permissions: [{ kind: 'stamp1g-spouse', from: '2019-01-01' }],
          stamp4Route: 'spouse-1g',
        },
        'IE-STAMP4',
      ).status,
    ).toBe('MET');
  });

  test('Stamp 1G: a gap starts again; a later permission ends an open one', () => {
    const gap = pathway(
      {
        simulationDate: '2025-01-01',
        permissions: [
          { kind: 'stamp1g-spouse', from: '2020-01-01', to: '2022-12-31' },
          { kind: 'stamp1g-spouse', from: '2023-01-15' },
        ],
        stamp4Route: 'spouse-1g',
      },
      'IE-STAMP4',
    );
    expect(gap.status).toBe('FUTURE');
    expect(gap.earliestDate).toBe('2028-01-15');
    // Added up: 1096 days to 2022-12-31, then 731 more to 2025-01-14 (PD-118).
    expect(gap.summary).toContain('2025-01-15');
    const replaced = pathway(
      {
        simulationDate: '2025-01-01',
        permissions: [
          { kind: 'stamp1g-spouse', from: '2020-01-01' },
          { kind: 'stamp4', from: '2022-01-01' },
        ],
        stamp4Route: 'spouse-1g',
      },
      'IE-STAMP4',
    );
    expect(replaced.status).toBe('NOT_MET');
  });

  test('Stamp 1G: graduate programme time does not count (review68-1)', () => {
    const p = pathway(
      {
        simulationDate: '2026-11-22',
        permissions: [
          { kind: 'stamp1g-graduate', from: '2020-11-01', to: '2022-10-31' },
          { kind: 'stamp1g-spouse', from: '2022-11-01' },
        ],
        stamp4Route: 'spouse-1g',
      },
      'IE-STAMP4',
    );
    expect(p.status).toBe('FUTURE');
    expect(p.earliestDate).toBe('2027-11-01');
    expect(p.checks[0].met).toBe(false);
  });

  test('Stamp 4: a gap in the permit after starting work does not count (review68-1)', () => {
    const req: Partial<IeRequest> = {
      simulationDate: '2026-11-22',
      permissions: [
        { kind: 'stamp1', from: '2024-12-01', to: '2025-11-30' },
        { kind: 'stamp1', from: '2026-05-01' },
      ],
      stamp4Route: 'csep',
      employmentStart: '2024-12-01',
    };
    const p = pathway(req, 'IE-STAMP4');
    expect(p.checks[0].met).toBe(false);
    // Counting again after the gap: 2026-05-01 + 21 months.
    expect(p.status).toBe('FUTURE');
    expect(p.earliestDate).toBe('2028-02-01');
    // Added up (PD-116): 365 days, then 274 more to 2027-01-29 make the
    // 639 days from 2024-12-01 to 2026-08-31.
    expect(p.summary).toContain('2027-01-30');
    // 2025-12-01 to 2026-04-30.
    expect(p.summary).toContain('151');
    // ICT Stamp 1 is not a 21-month permit.
    expect(
      pathway(
        {
          ...req,
          permissions: [{ kind: 'stamp1-ict', from: '2024-12-01' }],
        },
        'IE-STAMP4',
      ).status,
    ).toBe('NOT_MET');
    // It is in the 57-month group: 2024-12-01 + 57 months.
    expect(
      pathway(
        {
          ...req,
          stamp4Route: 'gep',
          permissions: [{ kind: 'stamp1-ict', from: '2024-12-01' }],
        },
        'IE-STAMP4',
      ).earliestDate,
    ).toBe('2029-09-01');
  });

  test('Stamp 5 after 96 months', () => {
    const req: Partial<IeRequest> = {
      simulationDate: '2025-01-01',
      permissions: [{ kind: 'stamp4', from: '2018-05-01' }],
      stamp4Route: 'wcatt',
    };
    const p = pathway(req, 'IE-STAMP4');
    expect(p.status).toBe('FUTURE');
    expect(p.earliestDate).toBe('2026-05-01');
    expect(
      pathway(
        { ...req, permissions: [{ kind: 'stamp4', from: '2015-01-01' }] },
        'IE-STAMP4',
      ).status,
    ).toBe('MET');
  });

  test('Stamp 5: ICT Stamp 1 does not count, uncertain kinds are unknown', () => {
    const ict = pathway(
      {
        simulationDate: '2025-01-01',
        permissions: [
          { kind: 'stamp1-ict', from: '2018-05-01', to: '2020-04-30' },
          { kind: 'stamp4', from: '2020-05-01' },
        ],
        stamp4Route: 'wcatt',
      },
      'IE-STAMP4',
    );
    expect(ict.earliestDate).toBe('2028-05-01');
    const other = pathway(
      {
        simulationDate: '2025-01-01',
        permissions: [{ kind: 'other', from: '2015-01-01' }],
        stamp4Route: 'wcatt',
      },
      'IE-STAMP4',
    );
    expect(other.status).toBe('UNKNOWN');
    for (const kind of ['student', 'stamp1a', 'stamp4-eufam'] as const)
      expect(
        pathway(
          {
            simulationDate: '2025-01-01',
            permissions: [{ kind, from: '2015-01-01' }],
            stamp4Route: 'wcatt',
          },
          'IE-STAMP4',
        ).status,
      ).toBe('NOT_MET');
  });

  test('Stamp 5 follows the listed kinds: 4D counts, ICT family 1G does not (review68-1)', () => {
    const p = pathway(
      {
        simulationDate: '2026-11-22',
        permissions: [
          { kind: 'stamp1', from: '2018-10-01', to: '2021-10-31' },
          { kind: 'stamp4d', from: '2021-11-01' },
        ],
        stamp4Route: 'wcatt',
      },
      'IE-STAMP4',
    );
    expect(p.status).toBe('MET');
    const ictFamily = pathway(
      {
        simulationDate: '2026-11-22',
        permissions: [
          { kind: 'stamp1g-ict', from: '2024-06-01', to: '2025-05-31' },
          { kind: 'stamp4', from: '2025-06-01' },
        ],
        stamp4Route: 'wcatt',
      },
      'IE-STAMP4',
    );
    expect(ictFamily.status).toBe('FUTURE');
    expect(ictFamily.earliestDate).toBe('2033-06-01');
    expect(ictFamily.summary).not.toContain('2032-06-01');
  });

  test('Stamp 5: absences are a condition after grant, not of applying (review68-1)', () => {
    const p = pathway(
      {
        simulationDate: '2026-11-22',
        permissions: [{ kind: 'stamp4', from: '2014-01-01' }],
        trips: [{ departed: '2022-03-01', returned: '2022-07-15' }],
        stamp4Route: 'wcatt',
      },
      'IE-STAMP4',
    );
    expect(p.status).toBe('MET');
    expect(p.checks).toHaveLength(1);
    expect(p.pendingDetails).toContain('PD-117');
  });

  test('Stamp 5: a gap gives the added-up date as unknown (PD-118)', () => {
    const p = pathway(
      {
        simulationDate: '2026-11-22',
        permissions: [
          { kind: 'stamp4', from: '2017-01-01', to: '2024-05-31' },
          { kind: 'stamp4', from: '2024-07-01' },
        ],
        stamp4Route: 'wcatt',
      },
      'IE-STAMP4',
    );
    // Over 96 months held in all, but not since 2024-07-01.
    expect(p.status).toBe('UNKNOWN');
    expect(p.checks[0].met).toBeUndefined();
    expect(p.summary).toContain('2032-07-01');
  });
});
