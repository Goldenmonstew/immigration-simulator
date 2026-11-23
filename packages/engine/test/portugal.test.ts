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

  test('7 years for Portuguese-speaking and EU nationals', () => {
    const p = pathway({ route: 'cplp-eu' }, 'PT-NATURALISATION');
    expect(p.earliestDate).toBe('2027-03-16');
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
      {
        route: 'cplp-eu',
        permits: [{ kind: 'temporary', from: '2020-02-29' }],
      },
      'PT-NATURALISATION',
    );
    expect(p.earliestDate).toBe('2027-03-01');
  });

  test('periods with a gap add up within the 9-year interval', () => {
    const p = pathway(
      {
        route: 'cplp-eu',
        simulationDate: '2023-01-01',
        permits: [
          { kind: 'temporary', from: '2016-01-01', to: '2018-12-31' },
          { kind: 'temporary', from: '2020-01-01' },
        ],
      },
      'PT-NATURALISATION',
    );
    // 1,095 days from 2016-01-02 to 2018-12-31, plus 1,462 from 2020-01-02
    // to 2024-01-02, make 2,557: the most days 7 years can have. With 2,556
    // (the fewest), 2024-01-02 is uncertain.
    expect(p.status).toBe('FUTURE');
    expect(p.earliestDate).toBe('2024-01-03');
    expect(p.summary).toContain('2024-01-02');
    expect(p.pendingDetails).toContain('PD-141');
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
        route: 'cplp-eu',
        simulationDate: '2026-06-01',
        permits: [
          { kind: 'visa', from: '2019-06-01', to: '2019-09-30' },
          { kind: 'temporary', from: '2019-10-01' },
        ],
      },
      'PT-NATURALISATION',
    );
    expect(p.earliestDate).toBe('2026-10-02');
    expect(p.summary).toContain('2026-06-02');
  });

  test('absences make the date uncertain (PD-144)', () => {
    const p = pathway(
      {
        route: 'cplp-eu',
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

  test('legal residence is needed on the application day', () => {
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
});

describe('naturalisation, application pending on 2026-05-19 (LO 1/2026 art. 7)', () => {
  const pending = {
    simulationDate: '2026-11-22',
    permits: [{ kind: 'temporary' as const, from: '2020-03-01' }],
    pendingApplication: '2024-03-01',
  };

  test('the earlier text counts from the residence application', () => {
    // 5 years before 2024-03-01, from the day after 2019-02-28.
    const p = pathway(
      { ...pending, residenceApplied: '2019-02-28' },
      'PT-NATURALISATION',
    );
    expect(p.status).toBe('MET');
    expect(p.checks[0].met).toBe(true);
  });

  test('one day short: a new application falls under the current law', () => {
    const p = pathway(
      { ...pending, residenceApplied: '2019-03-01' },
      'PT-NATURALISATION',
    );
    expect(p.checks[0].met).toBe(false);
    // 10 years from 2020-03-01 under the current law.
    expect(p.status).toBe('FUTURE');
    expect(p.earliestDate).toBe('2030-03-02');
    expect(p.checks).toHaveLength(2);
  });

  test('without the residence application date, the permit start counts', () => {
    const p = pathway(pending, 'PT-NATURALISATION');
    expect(p.checks[0].met).toBe(false);
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
    expect(p.earliestDate).toBe('2030-03-02');
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

  test('a gap between permits starts the years again (PD-145)', () => {
    const p = pathway(
      {
        permits: [
          { kind: 'temporary', from: '2018-01-01', to: '2020-12-31' },
          { kind: 'temporary', from: '2021-03-01' },
        ],
      },
      'PT-PERMANENT',
    );
    expect(p.earliestDate).toBe('2026-03-02');
    expect(p.pendingDetails).toContain('PD-145');
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

  test('not met when temporary residence ends', () => {
    const p = pathway(
      {
        simulationDate: '2026-11-22',
        permits: [{ kind: 'temporary', from: '2022-01-01', to: '2026-12-31' }],
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
    // 153 + 153 = 306 days abroad: 10 months have 303 to 306 days.
    expect(p.checks[2].met).toBeUndefined();
    expect(p.summary).toContain('2026-11-22');
    // From 2027-05-05 the 5 years start on 2022-05-04: 150 + 153 = 303.
    expect(p.status).toBe('FUTURE');
    expect(p.earliestDate).toBe('2027-05-05');
  });

  test('study at half: the date counting it in full is only possible', () => {
    const p = pathway(
      {
        simulationDate: '2023-01-01',
        permits: [
          { kind: 'study', from: '2017-09-01', to: '2020-03-14' },
          { kind: 'temporary', from: '2020-03-15' },
        ],
      },
      'PT-EU-LONG-TERM',
    );
    expect(p.status).toBe('FUTURE');
    expect(p.earliestDate).toBe('2025-03-16');
    expect(p.summary).toContain('2023-01-01');
    expect(p.checks[0].met).toBeUndefined();
  });

  test('reachable only with study time counted: unknown, not unmet', () => {
    const p = pathway(
      {
        simulationDate: '2026-06-01',
        permits: [
          { kind: 'study', from: '2019-01-01', to: '2023-12-31' },
          { kind: 'temporary', from: '2024-01-01', to: '2026-12-31' },
        ],
      },
      'PT-EU-LONG-TERM',
    );
    expect(p.status).toBe('UNKNOWN');
    expect(p.earliestDate).toBeUndefined();
    expect(p.pendingDetails).toContain('PD-147');
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

  test('14 days a year on AIMA’s page, per 2 years in the regulation', () => {
    const p = pathway(
      {
        ...card,
        simulationDate: '2025-11-01',
        // Away from 2025-01-13 to 2025-12-31: 12 days in Portugal in the
        // second year, but plenty in the 2 years from 2025-01-10.
        trips: [{ departed: '2025-01-12', returned: '2026-01-01' }],
      },
      'PT-GOLDEN-VISA',
    );
    expect(p.status).toBe('UNKNOWN');
    expect(p.checks[1].met).toBeUndefined();
    expect(p.summary).toContain('2025-01-10 至 2026-01-09 在葡萄牙 12 天');
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
  const result = evaluatePortugal({ ...base, route: 'cplp-eu', locale: 'en' });
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
