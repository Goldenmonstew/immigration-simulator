import { describe, expect, test } from 'vitest';
import { evaluatePortugal } from '../src';
import type { PtPathwayId, PtRequest } from '../src';

// A temporary residence permit from 2020-03-15, renewed on time.
const base: PtRequest = {
  simulationDate: '2024-01-01',
  permits: [{ kind: 'temporary', from: '2020-03-15' }],
  trips: [],
  route: 'other',
};

function pathway(req: Partial<PtRequest>, id: PtPathwayId) {
  const result = evaluatePortugal({ ...base, ...req });
  const found = result.pathways.find((p) => p.id === id);
  if (!found) throw new Error(`missing ${id}`);
  return found;
}

describe('naturalisation, current law (Lei 37/81 art. 6, 15)', () => {
  test('10 years for other nationals, from the day after the start', () => {
    // 2020-03-15 not counted; 10 years end on 2030-03-15 (art. 279 b–c).
    const p = pathway({}, 'PT-NATURALISATION');
    expect(p.status).toBe('FUTURE');
    expect(p.earliestDate).toBe('2030-03-16');
  });

  test('7 years for Portuguese-speaking nationals', () => {
    const p = pathway({ route: 'cplp' }, 'PT-NATURALISATION');
    expect(p.earliestDate).toBe('2027-03-16');
  });

  test('EU citizens: 7 years, but their EU registration is not modelled', () => {
    const p = pathway({ route: 'eu' }, 'PT-NATURALISATION');
    expect(p.status).toBe('UNKNOWN');
    expect(p.earliestDate).toBeUndefined();
    expect(p.summary).toContain('art. 15 n.º 2');
    expect(p.summary).toContain('2027-03-16');
  });

  test('4 years for stateless people', () => {
    expect(
      pathway(
        { route: 'stateless', simulationDate: '2024-03-15' },
        'PT-NATURALISATION',
      ).earliestDate,
    ).toBe('2024-03-16');
    const met = pathway(
      { route: 'stateless', simulationDate: '2024-03-16' },
      'PT-NATURALISATION',
    );
    expect(met.status).toBe('MET');
    expect(met.checks[0].met).toBe(true);
  });

  test('from 29 February the years end on the last day of February', () => {
    const p = pathway(
      { route: 'cplp', permits: [{ kind: 'temporary', from: '2020-02-29' }] },
      'PT-NATURALISATION',
    );
    expect(p.earliestDate).toBe('2027-03-01');
  });

  test('from 28 February, 29 February of a leap year is the day after', () => {
    // review71-1: 2021-02-28 + 7 years ends on 2028-02-28.
    const p = pathway(
      {
        route: 'cplp',
        simulationDate: '2026-11-22',
        permits: [{ kind: 'temporary', from: '2021-02-28' }],
      },
      'PT-NATURALISATION',
    );
    expect(p.earliestDate).toBe('2028-02-29');
  });

  test('periods with a gap add up within the 9-year interval', () => {
    const permits: PtRequest['permits'] = [
      { kind: 'temporary', from: '2016-01-01', to: '2018-12-31' },
      { kind: 'temporary', from: '2020-01-01' },
    ];
    const p = pathway(
      { route: 'cplp', simulationDate: '2023-01-01', permits },
      'PT-NATURALISATION',
    );
    // 1,095 days from 2016-01-02 to 2018-12-31, plus 1,462 from 2020-01-02
    // to 2024-01-02, make 2,557: the most days 7 years can have.
    expect(p.status).toBe('FUTURE');
    expect(p.earliestDate).toBe('2024-01-03');
    // Counting the 6 months after the card expired (to 2019-06-30), 1,276
    // + 1,280 days reach 2,556 on 2023-07-05.
    expect(p.summary).toContain('2023-07-05');
    expect(p.pendingDetails).toContain('PD-145');
    // On 2024-01-02 the 2,556 days are the fewest 7 years can have.
    const edge = pathway(
      { route: 'cplp', simulationDate: '2024-01-02', permits },
      'PT-NATURALISATION',
    );
    expect(edge.status).toBe('UNKNOWN');
    expect(edge.checks[0].met).toBeUndefined();
    expect(edge.summary).toContain('2024-01-03');
  });

  test('periods outside the 12-year interval no longer count', () => {
    const p = pathway(
      {
        simulationDate: '2026-11-22',
        permits: [
          { kind: 'temporary', from: '2010-01-01', to: '2014-12-31' },
          { kind: 'temporary', from: '2020-01-01' },
        ],
      },
      'PT-NATURALISATION',
    );
    // Only 10 unbroken years from 2020-01-01 reach it.
    expect(p.earliestDate).toBe('2030-01-02');
    expect(p.summary).not.toContain('2030-01-01');
  });

  test('a residence visa before the permit is uncertain (PD-140)', () => {
    const p = pathway(
      {
        route: 'cplp',
        simulationDate: '2026-06-01',
        permits: [
          { kind: 'visa', from: '2019-06-01', to: '2019-09-30' },
          { kind: 'temporary', from: '2019-10-01' },
        ],
      },
      'PT-NATURALISATION',
    );
    expect(p.status).toBe('FUTURE');
    expect(p.earliestDate).toBe('2026-10-02');
    expect(p.summary).toContain('2026-06-02');
  });

  test('met today only with the visa: unknown, with the sure date', () => {
    // review71-1: 7 years from 2019-08-01 counting the visa, from
    // 2019-12-01 without it.
    const p = pathway(
      {
        route: 'cplp',
        simulationDate: '2026-11-22',
        permits: [
          { kind: 'visa', from: '2019-08-01', to: '2019-11-30' },
          { kind: 'temporary', from: '2019-12-01' },
        ],
      },
      'PT-NATURALISATION',
    );
    expect(p.status).toBe('UNKNOWN');
    expect(p.earliestDate).toBeUndefined();
    expect(p.checks[0].met).toBeUndefined();
    expect(p.summary).toContain('2026-12-02');
    expect(p.summary).toContain('模拟日可能已经满足');
  });

  test('absences make the date uncertain (PD-144)', () => {
    const p = pathway(
      {
        route: 'cplp',
        trips: [{ departed: '2022-05-01', returned: '2022-05-15' }],
      },
      'PT-NATURALISATION',
    );
    expect(p.status).toBe('UNKNOWN');
    expect(p.earliestDate).toBeUndefined();
    expect(p.summary).toContain('2027-03-16');
    expect(p.summary).toContain('合计 13 天');
    expect(p.pendingDetails).toContain('PD-144');
  });

  test('trips only inside an uncounted gap leave the result alone', () => {
    // review71-1: 4 years to 2020-12-31 and 5 from 2021-11-01 make 7.
    const req: Partial<PtRequest> = {
      route: 'cplp',
      simulationDate: '2026-11-22',
      permits: [
        { kind: 'temporary', from: '2017-01-01', to: '2020-12-31' },
        { kind: 'temporary', from: '2021-11-01' },
      ],
    };
    expect(pathway(req, 'PT-NATURALISATION').status).toBe('MET');
    const inGap = pathway(
      { ...req, trips: [{ departed: '2021-03-01', returned: '2021-03-21' }] },
      'PT-NATURALISATION',
    );
    expect(inGap.status).toBe('MET');
    expect(inGap.pendingDetails).not.toContain('PD-144');
    const counted = pathway(
      { ...req, trips: [{ departed: '2019-03-01', returned: '2019-03-21' }] },
      'PT-NATURALISATION',
    );
    expect(counted.status).toBe('UNKNOWN');
    expect(counted.summary).toContain('合计 19 天');
  });

  test('legal residence is needed on the application day', () => {
    // The card expired on 2025-12-31; the 6 months after it ended on
    // 2026-06-30.
    const p = pathway(
      {
        route: 'stateless',
        simulationDate: '2026-11-22',
        permits: [{ kind: 'temporary', from: '2018-01-01', to: '2025-12-31' }],
      },
      'PT-NATURALISATION',
    );
    expect(p.status).toBe('NOT_MET');
  });

  test('within 6 months of a card expiring: unknown (PD-145)', () => {
    // review71-1: the right of residence lasts to 2027-04-30.
    const p = pathway(
      {
        route: 'cplp',
        simulationDate: '2026-11-22',
        permits: [{ kind: 'temporary', from: '2018-11-01', to: '2026-10-31' }],
      },
      'PT-NATURALISATION',
    );
    expect(p.status).toBe('UNKNOWN');
    expect(p.checks[0].met).toBeUndefined();
    expect(p.pendingDetails).toContain('PD-145');
  });
});

describe('naturalisation, application pending on 2026-05-19 (LO 1/2026 art. 7)', () => {
  // review71-1: a permit from 2021-07-01, applied for naturalisation on
  // 2026-05-01.
  const pending: Partial<PtRequest> = {
    simulationDate: '2026-11-22',
    permits: [{ kind: 'temporary', from: '2021-07-01' }],
    pendingApplication: '2026-05-01',
  };

  test('permit time alone is short: ask for the residence application', () => {
    const p = pathway(pending, 'PT-NATURALISATION');
    expect(p.status).toBe('UNKNOWN');
    expect(p.checks[0].met).toBeUndefined();
    expect(p.summary).toContain('请填写');
  });

  test('the earlier text counts from the residence application', () => {
    const p = pathway(
      { ...pending, residenceApplied: '2021-03-01' },
      'PT-NATURALISATION',
    );
    expect(p.status).toBe('MET');
    expect(p.checks[0].met).toBe(true);
    // 5 years before 2026-05-01, from the day after 2021-04-30.
    expect(
      pathway(
        { ...pending, residenceApplied: '2021-04-30' },
        'PT-NATURALISATION',
      ).status,
    ).toBe('MET');
  });

  test('one day short: a new application falls under the current law', () => {
    const p = pathway(
      { ...pending, residenceApplied: '2021-05-01' },
      'PT-NATURALISATION',
    );
    expect(p.checks[0].met).toBe(false);
    // 10 years from 2021-07-01 under the current law.
    expect(p.status).toBe('FUTURE');
    expect(p.earliestDate).toBe('2031-07-02');
    expect(p.checks).toHaveLength(2);
  });

  test('applied before LO 1/2024 came into force: not modelled', () => {
    const p = pathway(
      { ...pending, pendingApplication: '2024-03-01' },
      'PT-NATURALISATION',
    );
    expect(p.status).toBe('UNKNOWN');
    expect(p.summary).toContain('2024-04-01');
    expect(p.pendingDetails).toContain('PD-143');
  });

  test('applied on the day the law came into force: unclear (PD-143)', () => {
    const p = pathway(
      { ...pending, pendingApplication: '2026-05-19' },
      'PT-NATURALISATION',
    );
    expect(p.status).toBe('UNKNOWN');
    expect(p.pendingDetails).toContain('PD-143');
  });

  test('applied after it: the current law', () => {
    const p = pathway(
      { ...pending, pendingApplication: '2026-06-01' },
      'PT-NATURALISATION',
    );
    expect(p.earliestDate).toBe('2031-07-02');
    expect(p.summary).toContain('2026-05-19');
  });
});

describe('permanent residence (Lei 23/2007 art. 80)', () => {
  test('5 years of temporary residence', () => {
    const p = pathway({}, 'PT-PERMANENT');
    expect(p.status).toBe('FUTURE');
    expect(p.earliestDate).toBe('2025-03-16');
    expect(
      pathway({ simulationDate: '2026-11-22' }, 'PT-PERMANENT').status,
    ).toBe('MET');
  });

  test('golden visa and study permits are temporary residence', () => {
    const p = pathway(
      {
        permits: [
          { kind: 'study', from: '2019-09-01', to: '2021-08-31' },
          { kind: 'golden-visa', from: '2021-09-01' },
        ],
      },
      'PT-PERMANENT',
    );
    expect(p.earliestDate).toBe('2024-09-02');
  });

  test('a gap within 6 months of expiry: met today only if bridged', () => {
    const p = pathway(
      {
        permits: [
          { kind: 'temporary', from: '2018-01-01', to: '2020-12-31' },
          { kind: 'temporary', from: '2021-03-01' },
        ],
      },
      'PT-PERMANENT',
    );
    expect(p.status).toBe('UNKNOWN');
    expect(p.earliestDate).toBeUndefined();
    expect(p.summary).toContain('2026-03-02');
    expect(p.pendingDetails).toContain('PD-145');
  });

  test('a longer gap starts the years again', () => {
    const p = pathway(
      {
        permits: [
          { kind: 'temporary', from: '2018-01-01', to: '2020-06-30' },
          { kind: 'temporary', from: '2021-03-01' },
        ],
      },
      'PT-PERMANENT',
    );
    expect(p.status).toBe('FUTURE');
    expect(p.earliestDate).toBe('2026-03-02');
  });

  test('6 months away may cancel the permit but leaves the date', () => {
    const p = pathway(
      {
        permits: [
          { kind: 'temporary', from: '2020-03-15', to: '2022-03-14' },
          { kind: 'temporary', from: '2022-03-15' },
        ],
        trips: [{ departed: '2021-01-10', returned: '2021-07-11' }],
      },
      'PT-PERMANENT',
    );
    expect(p.earliestDate).toBe('2025-03-16');
    expect(p.checks[1].met).toBe(false);
    expect(p.summary).toContain('2020-03-15');
  });

  test('just under 6 months raises no warning', () => {
    const p = pathway(
      { trips: [{ departed: '2021-01-10', returned: '2021-07-10' }] },
      'PT-PERMANENT',
    );
    expect(p.checks[1].met).toBe(true);
  });

  test('a trip across a renewal counts within each permit', () => {
    // review71-1: away 2024-04-02 to 2024-06-30 and 2024-07-01 to
    // 2024-11-30, under 6 months on each permit.
    const p = pathway(
      {
        simulationDate: '2026-11-22',
        permits: [
          { kind: 'temporary', from: '2022-07-01', to: '2024-06-30' },
          { kind: 'temporary', from: '2024-07-01' },
        ],
        trips: [{ departed: '2024-04-01', returned: '2024-12-01' }],
      },
      'PT-PERMANENT',
    );
    expect(p.checks[1].met).toBe(true);
  });

  test('8 months in all over one permit', () => {
    const p = pathway(
      {
        permits: [{ kind: 'temporary', from: '2020-03-15', to: '2022-03-14' }],
        simulationDate: '2021-01-01',
        trips: [
          { departed: '2020-05-01', returned: '2020-09-15' },
          { departed: '2021-01-10', returned: '2021-05-20' },
        ],
      },
      'PT-PERMANENT',
    );
    // 136 + 129 = 265 days abroad: more than 8 months can have.
    expect(p.checks[1].met).toBe(false);
  });

  test('for the golden visa the absence rule is uncertain (PD-146)', () => {
    const p = pathway(
      {
        permits: [{ kind: 'golden-visa', from: '2020-03-15' }],
        trips: [{ departed: '2021-01-10', returned: '2021-07-11' }],
      },
      'PT-PERMANENT',
    );
    expect(p.checks[1].met).toBeUndefined();
    expect(p.earliestDate).toBe('2025-03-16');
  });

  test('not met when temporary residence ended', () => {
    const p = pathway(
      {
        simulationDate: '2026-11-22',
        permits: [{ kind: 'temporary', from: '2022-01-01', to: '2025-12-31' }],
      },
      'PT-PERMANENT',
    );
    expect(p.status).toBe('NOT_MET');
    expect(p.checks[0].met).toBe(false);
  });

  test('a residence visa does not count', () => {
    const p = pathway(
      {
        permits: [
          { kind: 'visa', from: '2019-06-01', to: '2020-03-14' },
          { kind: 'temporary', from: '2020-03-15' },
        ],
      },
      'PT-PERMANENT',
    );
    expect(p.earliestDate).toBe('2025-03-16');
  });

  test('permanent residence held: absences of 24 months (art. 85 n.º 2 b)', () => {
    const p = pathway(
      {
        simulationDate: '2026-11-22',
        permits: [
          { kind: 'temporary', from: '2016-01-01', to: '2021-12-31' },
          { kind: 'permanent', from: '2022-01-01' },
        ],
        trips: [{ departed: '2023-01-01', returned: '2025-01-03' }],
      },
      'PT-PERMANENT',
    );
    expect(p.status).toBe('NOT_APPLICABLE');
    expect(p.checks[0].met).toBe(false);
    const fine = pathway(
      {
        simulationDate: '2026-11-22',
        permits: [{ kind: 'permanent', from: '2022-01-01' }],
      },
      'PT-PERMANENT',
    );
    expect(fine.checks[0].met).toBe(true);
  });

  test('an expired permanent card does not end permanent residence', () => {
    // review71-1: the permit has no time limit (art. 76 n.º 1–2).
    const p = pathway(
      {
        simulationDate: '2026-11-22',
        permits: [
          { kind: 'temporary', from: '2016-10-01', to: '2021-09-30' },
          { kind: 'permanent', from: '2021-10-01', to: '2026-09-30' },
        ],
      },
      'PT-PERMANENT',
    );
    expect(p.status).toBe('NOT_APPLICABLE');
  });

  test('EU citizens fall outside the foreigners law (art. 4 n.º 2 a)', () => {
    // review71-1: a French citizen with no permits.
    for (const id of [
      'PT-PERMANENT',
      'PT-EU-LONG-TERM',
      'PT-GOLDEN-VISA',
    ] as const)
      expect(pathway({ route: 'eu', permits: [] }, id).status).toBe(
        'NOT_APPLICABLE',
      );
    expect(
      pathway({ route: 'eu', permits: [] }, 'PT-EU-LONG-TERM').summary,
    ).toContain('art. 125 n.º 1');
  });
});

describe('EU long-term residence (Lei 23/2007 art. 125–126)', () => {
  test('5 years immediately before applying', () => {
    const p = pathway({}, 'PT-EU-LONG-TERM');
    expect(p.status).toBe('FUTURE');
    expect(p.earliestDate).toBe('2025-03-16');
  });

  test('an absence just under 6 months keeps continuity', () => {
    const p = pathway(
      { trips: [{ departed: '2022-01-10', returned: '2022-07-10' }] },
      'PT-EU-LONG-TERM',
    );
    expect(p.earliestDate).toBe('2025-03-16');
  });

  test('6 months or more: count again once it leaves the 5 years', () => {
    const p = pathway(
      { trips: [{ departed: '2022-01-10', returned: '2022-07-11' }] },
      'PT-EU-LONG-TERM',
    );
    // Away from 2022-01-11 to 2022-07-10; the 5 years from the day after
    // 2022-07-11 end on 2027-07-11.
    expect(p.earliestDate).toBe('2027-07-12');
    expect(p.checks[1].met).toBe(false);
  });

  test('absences between the fewest and most days of 10 months', () => {
    const p = pathway(
      {
        simulationDate: '2026-11-22',
        trips: [
          { departed: '2022-04-30', returned: '2022-10-01' },
          { departed: '2023-01-31', returned: '2023-07-04' },
        ],
      },
      'PT-EU-LONG-TERM',
    );
    // 153 + 153 = 306 days abroad: 10 months have 303 to 306 days, so the
    // simulation date is met only on a generous reading.
    expect(p.checks[2].met).toBeUndefined();
    expect(p.status).toBe('UNKNOWN');
    // From 2027-05-05 the 5 years start on 2022-05-04: 150 + 153 = 303.
    expect(p.summary).toContain('2027-05-05');
  });

  test('study counts at half (art. 126 n.º 3)', () => {
    const permits: PtRequest['permits'] = [
      { kind: 'study', from: '2019-01-01', to: '2022-12-31' },
      { kind: 'temporary', from: '2023-01-01' },
    ];
    // For 2026-01-02 the 1,827 days from 2021-01-01 need 3,654 half days:
    // 1,097 work days give 2,194, and 1,460 of the 1,461 study days the rest.
    const p = pathway(
      { simulationDate: '2024-01-01', permits },
      'PT-EU-LONG-TERM',
    );
    expect(p.status).toBe('FUTURE');
    expect(p.earliestDate).toBe('2026-01-02');
    // review71-1: met on 2026-11-22.
    const met = pathway(
      { simulationDate: '2026-11-22', permits },
      'PT-EU-LONG-TERM',
    );
    expect(met.status).toBe('MET');
    expect(met.checks[0].met).toBe(true);
  });

  test('within 6 months of a card expiring: unknown (PD-145)', () => {
    const p = pathway(
      {
        simulationDate: '2026-11-22',
        permits: [{ kind: 'temporary', from: '2019-01-01', to: '2026-10-31' }],
      },
      'PT-EU-LONG-TERM',
    );
    expect(p.status).toBe('UNKNOWN');
    expect(p.pendingDetails).toContain('PD-145');
  });

  test('a study permit holder cannot apply', () => {
    const p = pathway(
      {
        simulationDate: '2026-11-22',
        permits: [{ kind: 'study', from: '2015-01-01' }],
      },
      'PT-EU-LONG-TERM',
    );
    expect(p.status).toBe('NOT_MET');
  });
});

describe('golden visa (ARI) renewal and minimum stays', () => {
  const card = {
    permits: [
      { kind: 'golden-visa' as const, from: '2024-01-10', to: '2026-01-09' },
    ],
  };

  test('no golden visa: not applicable', () => {
    expect(pathway({}, 'PT-GOLDEN-VISA').status).toBe('NOT_APPLICABLE');
  });

  test('no expiry entered: unknown', () => {
    const p = pathway(
      { permits: [{ kind: 'golden-visa', from: '2024-01-10' }] },
      'PT-GOLDEN-VISA',
    );
    expect(p.status).toBe('UNKNOWN');
  });

  test('renewal from 90 to 30 days before expiry', () => {
    const p = pathway(
      { ...card, simulationDate: '2025-06-01' },
      'PT-GOLDEN-VISA',
    );
    expect(p.status).toBe('FUTURE');
    expect(p.earliestDate).toBe('2025-10-11');
    expect(p.summary).toContain('2025-12-10');
    // The investment is kept for 5 years from the grant.
    expect(p.summary).toContain('2029-01-10');
    expect(
      pathway({ ...card, simulationDate: '2025-12-10' }, 'PT-GOLDEN-VISA')
        .status,
    ).toBe('MET');
    expect(
      pathway({ ...card, simulationDate: '2025-12-11' }, 'PT-GOLDEN-VISA')
        .status,
    ).toBe('NOT_MET');
  });

  test('7 days in the first year', () => {
    const away = (returned: string) =>
      pathway(
        {
          ...card,
          simulationDate: '2025-11-01',
          trips: [{ departed: '2024-01-12', returned }],
        },
        'PT-GOLDEN-VISA',
      );
    // 366 days from 2024-01-10 to 2025-01-09; away from 2024-01-13.
    const ok = away('2025-01-05'); // 358 days away, 8 in Portugal
    expect(ok.status).toBe('MET');
    expect(ok.checks[1].met).toBe(true);
    const short = away('2025-01-07'); // 360 days away, 6 in Portugal
    expect(short.status).toBe('NOT_MET');
    expect(short.checks[1].met).toBe(false);
    expect(short.summary).toContain('2024-01-10 至 2025-01-09 在葡萄牙 6 天');
  });

  test('only days up to the simulation date count as spent', () => {
    // 3 days to 2025-01-12, then 8 from 2025-10-25 to 2025-11-01: 11 of 14,
    // reached on 2025-11-04 staying on.
    const p = pathway(
      {
        ...card,
        simulationDate: '2025-11-01',
        trips: [{ departed: '2025-01-12', returned: '2025-10-25' }],
      },
      'PT-GOLDEN-VISA',
    );
    expect(p.status).toBe('FUTURE');
    expect(p.earliestDate).toBe('2025-11-04');
    expect(p.checks[1].met).toBe(false);
    expect(p.summary).toContain('还差 3 天');
  });

  test('the reviewed case: 3 days in the second year is not yet met', () => {
    // review71-1: away 2025-12-03 to 2026-10-14; 2025-12-01, 12-02 and
    // 2026-10-15 make 3 days, 14 on 2026-10-26.
    const p = pathway(
      {
        simulationDate: '2026-10-15',
        permits: [
          { kind: 'golden-visa', from: '2024-12-01', to: '2026-11-30' },
        ],
        trips: [{ departed: '2025-12-02', returned: '2026-10-15' }],
      },
      'PT-GOLDEN-VISA',
    );
    expect(p.status).toBe('FUTURE');
    expect(p.earliestDate).toBe('2026-10-26');
  });

  test('14 days a year on AIMA’s page, per 2 years in the regulation', () => {
    // 12 days in the year from 2023-01-10, but plenty in the 2 years.
    const p = pathway(
      {
        simulationDate: '2025-11-01',
        permits: [
          { kind: 'golden-visa', from: '2022-01-10', to: '2024-01-09' },
          { kind: 'golden-visa', from: '2024-01-10', to: '2026-01-09' },
        ],
        trips: [{ departed: '2023-01-12', returned: '2024-01-01' }],
      },
      'PT-GOLDEN-VISA',
    );
    expect(p.status).toBe('UNKNOWN');
    expect(p.checks[1].met).toBeUndefined();
    expect(p.summary).toContain('2023-01-10 至 2024-01-09 在葡萄牙 12 天');
    expect(p.pendingDetails).toContain('PD-148');
  });

  test('the renewed card in force is used', () => {
    const p = pathway(
      {
        simulationDate: '2027-11-01',
        permits: [
          { kind: 'golden-visa', from: '2024-01-10', to: '2026-01-09' },
          { kind: 'golden-visa', from: '2026-01-10', to: '2028-01-09' },
        ],
      },
      'PT-GOLDEN-VISA',
    );
    expect(p.status).toBe('MET');
    expect(p.summary).toContain('2028-01-09');
  });
});

test('English text', () => {
  const result = evaluatePortugal({ ...base, route: 'cplp', locale: 'en' });
  expect(result.policyAsOf).toBe('2026-11-22');
  expect(result.pathways.map((p) => p.id)).toEqual([
    'PT-NATURALISATION',
    'PT-PERMANENT',
    'PT-EU-LONG-TERM',
    'PT-GOLDEN-VISA',
  ]);
  expect(result.pathways[0].summary).toBe(
    'The earliest application date with 7 years of legal residence is 2027-03-16.',
  );
});
