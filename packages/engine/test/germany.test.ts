import { describe, expect, test } from 'vitest';
import { evaluateGermany } from '../src';
import type { DePathwayId, DeRequest } from '../src';

// A skilled worker permit from 2022-03-15, renewed on time, 60 months of
// pension contributions.
const base: DeRequest = {
  simulationDate: '2026-11-22',
  permits: [{ kind: 'skilled', from: '2022-03-15' }],
  trips: [],
  settlementRoute: 'general',
  contributionMonths: 60,
  naturalisationRoute: 'general',
};

function pathway(req: Partial<DeRequest>, id: DePathwayId) {
  const result = evaluateGermany({ ...base, ...req });
  const found = result.pathways.find((p) => p.id === id);
  if (!found) throw new Error(`missing ${id}`);
  return found;
}

// Study 2019-10-01 to 2021-09-30 (731 days), then a skilled worker permit.
const studyFirst: Partial<DeRequest> = {
  simulationDate: '2025-01-01',
  permits: [
    { kind: 'study', from: '2019-10-01', to: '2021-09-30' },
    { kind: 'skilled', from: '2021-10-01' },
  ],
};

// A Blue Card from 2021-03-15 and 8 months abroad in 2023 (within the
// Blue Card's 12 months, so it does not lapse).
const blueCardTrip: Partial<DeRequest> = {
  simulationDate: '2026-01-01',
  permits: [{ kind: 'blue-card', from: '2021-03-15' }],
  trips: [{ departed: '2023-01-10', returned: '2023-09-10' }],
};

describe('Niederlassungserlaubnis, general route (§ 9)', () => {
  test('5 years to the anniversary', () => {
    const p = pathway({}, 'DE-SETTLEMENT');
    expect(p.status).toBe('FUTURE');
    expect(p.earliestDate).toBe('2027-03-15');
  });

  test('met on the simulation date', () => {
    const p = pathway(
      { permits: [{ kind: 'skilled', from: '2021-03-15' }] },
      'DE-SETTLEMENT',
    );
    expect(p.status).toBe('MET');
    expect(p.earliestDate).toBe('2026-11-22');
    expect(p.checks.map((c) => c.met)).toEqual([true, true]);
  });

  test('no permit after the last one ends: not met', () => {
    const p = pathway(
      { permits: [{ kind: 'skilled', from: '2021-03-15', to: '2026-11-21' }] },
      'DE-SETTLEMENT',
    );
    expect(p.status).toBe('NOT_MET');
    expect(p.checks[0].met).toBe(false);
  });

  test('contribution months not entered: unknown', () => {
    const p = pathway({ contributionMonths: undefined }, 'DE-SETTLEMENT');
    expect(p.status).toBe('UNKNOWN');
    expect(p.earliestDate).toBeUndefined();
    expect(p.summary).toContain('2027-03-15');
    expect(p.checks[1].met).toBeUndefined();
  });

  test('no months entered and the time never met: not met', () => {
    const p = pathway(
      {
        contributionMonths: undefined,
        permits: [{ kind: 'skilled', from: '2022-03-15', to: '2026-11-21' }],
      },
      'DE-SETTLEMENT',
    );
    expect(p.status).toBe('NOT_MET');
  });

  test('missing contribution months are projected one a month', () => {
    const p = pathway(
      {
        permits: [{ kind: 'skilled', from: '2021-03-15' }],
        contributionMonths: 50,
      },
      'DE-SETTLEMENT',
    );
    // 10 more months after 2026-11-22.
    expect(p.status).toBe('FUTURE');
    expect(p.earliestDate).toBe('2027-09-22');
    expect(p.checks.map((c) => c.met)).toEqual([true, false]);
  });

  test('study counts at half (§ 9 Abs. 4 Nr. 3)', () => {
    const p = pathway(studyFirst, 'DE-SETTLEMENT');
    // 731 study half days + 2 × 1,461 days from 2021-10-01 = 3,653, at
    // least twice the 1,826 days of the five years before 2025-10-01; a
    // day earlier gives 3,651 of 3,652.
    expect(p.status).toBe('FUTURE');
    expect(p.earliestDate).toBe('2025-10-01');
  });

  test('each trip counts for at most 6 months (§ 9 Abs. 4 Nr. 2)', () => {
    const p = pathway(blueCardTrip, 'DE-SETTLEMENT');
    // 2023-07-11 to 2023-09-09 (61 days) do not count: 2026-03-15 + 61.
    expect(p.earliestDate).toBe('2026-05-15');
  });

  test('a trip that ended the permit resets the count', () => {
    const p = pathway(
      {
        permits: [{ kind: 'skilled', from: '2019-01-01' }],
        trips: [{ departed: '2023-01-10', returned: '2023-08-01' }],
      },
      'DE-SETTLEMENT',
    );
    expect(p.earliestDate).toBe('2028-08-01');
  });

  test('a lapsed settlement permit counts for up to 4 years (§ 9 Abs. 4 Nr. 1)', () => {
    const p = pathway(
      {
        simulationDate: '2023-01-01',
        permits: [
          { kind: 'skilled', from: '2015-01-01', to: '2019-12-31' },
          { kind: 'settlement', from: '2020-01-01' },
          { kind: 'other', from: '2022-09-01' },
        ],
        trips: [{ departed: '2022-01-10', returned: '2022-09-01' }],
      },
      'DE-SETTLEMENT',
    );
    // 4 × 365 days credited: 366 more days from 2022-09-01.
    expect(p.status).toBe('FUTURE');
    expect(p.earliestDate).toBe('2023-09-02');
  });

  test('already settled: not applicable', () => {
    const p = pathway(
      { permits: [{ kind: 'settlement', from: '2025-01-01' }] },
      'DE-SETTLEMENT',
    );
    expect(p.status).toBe('NOT_APPLICABLE');
  });
});

describe('Niederlassungserlaubnis for skilled workers (§ 18c Abs. 1)', () => {
  const skilled: Partial<DeRequest> = {
    simulationDate: '2025-01-01',
    settlementRoute: 'skilled',
    permits: [
      { kind: 'study', from: '2020-10-01', to: '2023-05-31' },
      { kind: 'skilled', from: '2023-06-01' },
    ],
    contributionMonths: 36,
  };

  test('3 years and 36 months; study does not count', () => {
    const p = pathway(skilled, 'DE-SETTLEMENT');
    expect(p.status).toBe('FUTURE');
    expect(p.earliestDate).toBe('2026-06-01');
  });

  test('2 years and 24 months after training in Germany', () => {
    const p = pathway(
      { ...skilled, trainedInGermany: true, contributionMonths: 24 },
      'DE-SETTLEMENT',
    );
    expect(p.earliestDate).toBe('2025-06-01');
  });

  test('met after 3 years', () => {
    const p = pathway(
      { ...skilled, simulationDate: '2026-11-22' },
      'DE-SETTLEMENT',
    );
    expect(p.status).toBe('MET');
  });

  test('another kind of permit does not count', () => {
    const p = pathway(
      { ...skilled, permits: [{ kind: 'other', from: '2015-01-01' }] },
      'DE-SETTLEMENT',
    );
    expect(p.status).toBe('NOT_MET');
  });

  test('contribution months not entered: unknown', () => {
    const p = pathway(
      { ...skilled, contributionMonths: undefined },
      'DE-SETTLEMENT',
    );
    expect(p.status).toBe('UNKNOWN');
    expect(p.summary).toContain('2026-06-01');
  });
});

describe('Niederlassungserlaubnis for Blue Card holders (§ 18c Abs. 2)', () => {
  const blueCard: Partial<DeRequest> = {
    simulationDate: '2025-06-01',
    settlementRoute: 'blue-card',
    permits: [{ kind: 'blue-card', from: '2024-03-10' }],
    contributionMonths: 27,
  };

  test('27 calendar months', () => {
    const p = pathway(blueCard, 'DE-SETTLEMENT');
    expect(p.status).toBe('FUTURE');
    expect(p.earliestDate).toBe('2026-06-10');
  });

  test('21 months with German at B1', () => {
    const p = pathway(
      { ...blueCard, germanB1: true, contributionMonths: 21 },
      'DE-SETTLEMENT',
    );
    expect(p.earliestDate).toBe('2025-12-10');
  });

  test('contributions for the same period', () => {
    const p = pathway(
      { ...blueCard, germanB1: true, contributionMonths: 10 },
      'DE-SETTLEMENT',
    );
    // 11 more months after 2025-06-01, later than the 21 months on the card.
    expect(p.earliestDate).toBe('2026-05-01');
    expect(p.summary).toContain('缴费月数');
  });

  test('met, and not met without a Blue Card', () => {
    expect(
      pathway({ ...blueCard, simulationDate: '2026-11-22' }, 'DE-SETTLEMENT')
        .status,
    ).toBe('MET');
    expect(
      pathway(
        { ...blueCard, permits: [{ kind: 'skilled', from: '2020-01-01' }] },
        'DE-SETTLEMENT',
      ).status,
    ).toBe('NOT_MET');
  });
});

describe('Niederlassungserlaubnis for family of a German (§ 28 Abs. 2)', () => {
  const family: Partial<DeRequest> = {
    simulationDate: '2025-06-01',
    settlementRoute: 'german-family',
    contributionMonths: undefined,
    permits: [
      { kind: 'other', from: '2021-01-01', to: '2023-01-14' },
      { kind: 'german-family', from: '2023-01-15' },
    ],
  };

  test('3 years from the first family permit; no contributions', () => {
    const p = pathway(family, 'DE-SETTLEMENT');
    expect(p.status).toBe('FUTURE');
    expect(p.earliestDate).toBe('2026-01-15');
    expect(p.checks).toHaveLength(1);
  });

  test('met after 3 years', () => {
    expect(
      pathway({ ...family, simulationDate: '2026-11-22' }, 'DE-SETTLEMENT')
        .status,
    ).toBe('MET');
  });
});

describe('Niederlassungserlaubnis for refugees (§ 26 Abs. 3)', () => {
  const refugee: Partial<DeRequest> = {
    simulationDate: '2024-01-01',
    settlementRoute: 'refugee',
    contributionMonths: undefined,
    permits: [
      { kind: 'asylum', from: '2020-05-01', to: '2021-04-30' },
      { kind: 'protection', from: '2021-05-01' },
    ],
  };

  test('5 years counting the asylum procedure', () => {
    const p = pathway(refugee, 'DE-SETTLEMENT');
    expect(p.status).toBe('FUTURE');
    expect(p.earliestDate).toBe('2025-05-01');
  });

  test('3 years with German at C1', () => {
    expect(
      pathway({ ...refugee, germanC1: true }, 'DE-SETTLEMENT').status,
    ).toBe('MET');
  });

  test('not met while the claim is pending', () => {
    expect(
      pathway(
        { ...refugee, permits: [{ kind: 'asylum', from: '2018-01-01' }] },
        'DE-SETTLEMENT',
      ).status,
    ).toBe('NOT_MET');
  });
});

describe('Daueraufenthalt-EU (§§ 9a, 9b)', () => {
  test('5 years before applying', () => {
    const p = pathway({}, 'DE-EU-LONG-TERM');
    expect(p.status).toBe('FUTURE');
    expect(p.earliestDate).toBe('2027-03-15');
  });

  test('met, and not applicable once held', () => {
    expect(
      pathway(
        { permits: [{ kind: 'skilled', from: '2021-03-15' }] },
        'DE-EU-LONG-TERM',
      ).status,
    ).toBe('MET');
    expect(
      pathway(
        { permits: [{ kind: 'eu-long-term', from: '2025-01-01' }] },
        'DE-EU-LONG-TERM',
      ).status,
    ).toBe('NOT_APPLICABLE');
  });

  test('study counts at half and cannot be held when applying', () => {
    expect(pathway(studyFirst, 'DE-EU-LONG-TERM').earliestDate).toBe(
      '2025-10-01',
    );
    expect(
      pathway(
        { permits: [{ kind: 'study', from: '2015-01-01' }] },
        'DE-EU-LONG-TERM',
      ).status,
    ).toBe('NOT_MET');
  });

  test('more than 6 months in a row pauses the count', () => {
    const p = pathway(blueCardTrip, 'DE-EU-LONG-TERM');
    // All 242 days abroad, 2023-01-11 to 2023-09-09, are left out.
    expect(p.status).toBe('FUTURE');
    expect(p.earliestDate).toBe('2026-11-12');
  });

  test('short trips totalling up to 10 months count', () => {
    const p = pathway(
      {
        simulationDate: '2026-01-01',
        permits: [{ kind: 'skilled', from: '2021-03-15' }],
        trips: [
          // 179 + 124 = 303 days abroad, the fewest days 10 months can span.
          { departed: '2022-01-01', returned: '2022-06-30' },
          { departed: '2023-01-01', returned: '2023-05-06' },
        ],
      },
      'DE-EU-LONG-TERM',
    );
    expect(p.earliestDate).toBe('2026-03-15');
  });

  test('a total between the readings of 10 months is unknown (PD-125)', () => {
    const p = pathway(
      {
        simulationDate: '2026-03-15',
        permits: [{ kind: 'skilled', from: '2021-03-15', to: '2026-06-30' }],
        trips: [
          // 179 + 126 = 305 days: only the generous reading counts them,
          // and without them the permit ends first.
          { departed: '2022-01-01', returned: '2022-06-30' },
          { departed: '2023-01-01', returned: '2023-05-08' },
        ],
      },
      'DE-EU-LONG-TERM',
    );
    expect(p.status).toBe('UNKNOWN');
    expect(p.summary).toContain('2026-03-15');
    expect(p.checks[0].met).toBeUndefined();
  });

  test('the asylum procedure counts once protection is granted', () => {
    const permits = [
      { kind: 'asylum' as const, from: '2020-05-01', to: '2021-04-30' },
      { kind: 'protection' as const, from: '2021-05-01' },
    ];
    expect(
      pathway({ simulationDate: '2024-01-01', permits }, 'DE-EU-LONG-TERM')
        .earliestDate,
    ).toBe('2025-05-01');
    expect(
      pathway(
        {
          simulationDate: '2024-01-01',
          permits: [permits[0], { kind: 'other', from: '2021-05-01' }],
        },
        'DE-EU-LONG-TERM',
      ).earliestDate,
    ).toBe('2026-05-01');
  });

  test('a trip that ended the permit resets the count', () => {
    const p = pathway(
      {
        permits: [{ kind: 'skilled', from: '2019-01-01' }],
        trips: [{ departed: '2023-01-10', returned: '2023-08-01' }],
      },
      'DE-EU-LONG-TERM',
    );
    expect(p.earliestDate).toBe('2028-08-01');
  });
});

describe('Einbürgerung (StAG §§ 9, 10, 12b)', () => {
  test('5 years; the 3-year route is gone from 2025-10-30', () => {
    const p = pathway(
      { permits: [{ kind: 'skilled', from: '2023-06-01' }] },
      'DE-NATURALISATION',
    );
    // 3 years and 5 months on the simulation date: not enough any more.
    expect(p.status).toBe('FUTURE');
    expect(p.earliestDate).toBe('2028-06-01');
    expect(p.summary).toContain('2025-10-30');
    expect(p.pendingDetails).toContain('PD-129');
  });

  test('a simulation date before 2025-10-30 is noted', () => {
    const p = pathway({ simulationDate: '2025-09-01' }, 'DE-NATURALISATION');
    expect(p.assumptions.join(' ')).toContain('模拟日早于 2025-10-30');
    expect(
      pathway({}, 'DE-NATURALISATION').assumptions.join(' '),
    ).not.toContain('模拟日早于');
  });

  test('met after 5 years; study counts in full', () => {
    expect(
      pathway(
        { permits: [{ kind: 'skilled', from: '2021-03-15' }] },
        'DE-NATURALISATION',
      ).status,
    ).toBe('MET');
    const p = pathway(
      { ...studyFirst, simulationDate: '2024-06-01' },
      'DE-NATURALISATION',
    );
    expect(p.earliestDate).toBe('2024-10-01');
  });

  test('a study permit cannot be held when naturalised', () => {
    expect(
      pathway(
        { permits: [{ kind: 'study', from: '2015-01-01' }] },
        'DE-NATURALISATION',
      ).status,
    ).toBe('NOT_MET');
  });

  test('an absence of up to 6 months does not interrupt', () => {
    const p = pathway(
      { trips: [{ departed: '2023-01-10', returned: '2023-07-10' }] },
      'DE-NATURALISATION',
    );
    expect(p.earliestDate).toBe('2027-03-15');
  });

  test('a longer absence interrupts; earlier time only at discretion', () => {
    const p = pathway(
      {
        simulationDate: '2026-01-01',
        permits: [{ kind: 'blue-card', from: '2022-03-15', to: '2028-01-01' }],
        trips: [{ departed: '2023-01-10', returned: '2023-07-11' }],
      },
      'DE-NATURALISATION',
    );
    // Starting again on 2023-07-11 needs 2028-07-11, after the card ends.
    // Crediting the 302 days before the trip: 1,524 + 302 = 1,826 days on
    // 2027-09-12.
    expect(p.status).toBe('UNKNOWN');
    expect(p.earliestDate).toBeUndefined();
    expect(p.summary).toContain('2027-09-12');
    expect(p.pendingDetails).toContain('PD-128');
  });

  test('more than half the years abroad starts the count again', () => {
    const p = pathway(
      {
        simulationDate: '2019-06-01',
        permits: [{ kind: 'skilled', from: '2015-01-01' }],
        trips: [
          { departed: '2016-01-01', returned: '2016-07-01' },
          { departed: '2016-07-01', returned: '2017-01-01' },
          { departed: '2017-01-01', returned: '2017-07-01' },
          { departed: '2017-07-01', returned: '2018-01-01' },
          { departed: '2018-01-01', returned: '2018-07-01' },
          { departed: '2018-07-01', returned: '2019-01-01' },
        ],
      },
      'DE-NATURALISATION',
    );
    // 181 + 183 + 180 + 183 + 180 = 907 days by 2018-07-01; the 913th day
    // abroad, 2018-07-07, goes over 912.5. Starting again on 2019-01-01.
    expect(p.earliestDate).toBe('2024-01-01');
    // Crediting 3 years: 732 + 1,095 = 1,827 days on 2021-01-02.
    expect(p.summary).toContain('2021-01-02');
  });

  test('spouse of a German: 3 years and 2 years of marriage', () => {
    const spouse: Partial<DeRequest> = {
      naturalisationRoute: 'spouse',
      permits: [{ kind: 'german-family', from: '2024-02-01' }],
      marriedOn: '2024-01-10',
    };
    const p = pathway(spouse, 'DE-NATURALISATION');
    expect(p.status).toBe('FUTURE');
    expect(p.earliestDate).toBe('2027-02-01');
    expect(p.checks.map((c) => c.met)).toEqual([false, true]);
    const later = pathway(
      { ...spouse, marriedOn: '2025-06-01' },
      'DE-NATURALISATION',
    );
    expect(later.earliestDate).toBe('2027-06-01');
    expect(
      pathway({ ...spouse, simulationDate: '2027-03-01' }, 'DE-NATURALISATION')
        .status,
    ).toBe('MET');
  });
});

describe('trips abroad and loss of residence (§ 51)', () => {
  test('no trips: not applicable', () => {
    expect(pathway({}, 'DE-TRAVEL').status).toBe('NOT_APPLICABLE');
  });

  test('back on the same day 6 months later is in time', () => {
    const p = pathway(
      { trips: [{ departed: '2023-01-10', returned: '2023-07-10' }] },
      'DE-TRAVEL',
    );
    expect(p.status).toBe('MET');
    expect(p.checks[0].text).toContain('2023-07-10');
  });

  test('a day later the permit has lapsed (§ 51 Abs. 1 Nr. 7)', () => {
    const p = pathway(
      { trips: [{ departed: '2023-01-10', returned: '2023-07-11' }] },
      'DE-TRAVEL',
    );
    expect(p.status).toBe('NOT_MET');
    expect(p.checks[0].met).toBe(false);
  });

  test('12 months on a Blue Card (§ 51 Abs. 10)', () => {
    const permits = [{ kind: 'blue-card' as const, from: '2022-01-01' }];
    expect(
      pathway(
        {
          permits,
          trips: [{ departed: '2023-01-10', returned: '2024-01-10' }],
        },
        'DE-TRAVEL',
      ).status,
    ).toBe('MET');
    expect(
      pathway(
        {
          permits,
          trips: [{ departed: '2023-01-10', returned: '2024-01-11' }],
        },
        'DE-TRAVEL',
      ).status,
    ).toBe('NOT_MET');
  });

  test('EU long-term residence: 12 months outside the EU is unknown, 6 years lapses', () => {
    const permits = [{ kind: 'eu-long-term' as const, from: '2020-01-01' }];
    expect(
      pathway(
        {
          permits,
          trips: [{ departed: '2023-01-10', returned: '2024-03-01' }],
        },
        'DE-TRAVEL',
      ).status,
    ).toBe('UNKNOWN');
    // After a Blue Card the EU limit is 24 months.
    expect(
      pathway(
        {
          permits: [
            { kind: 'blue-card', from: '2018-01-01', to: '2019-12-31' },
            ...permits,
          ],
          trips: [{ departed: '2023-01-10', returned: '2024-03-01' }],
        },
        'DE-TRAVEL',
      ).status,
    ).toBe('MET');
    expect(
      pathway(
        {
          permits,
          trips: [{ departed: '2023-01-10', returned: '2029-01-11' }],
        },
        'DE-TRAVEL',
      ).status,
    ).toBe('NOT_MET');
  });

  test('English text', () => {
    const p = evaluateGermany({ ...base, locale: 'en' }).pathways[0];
    expect(p.title).toBe('Settlement permit (Niederlassungserlaubnis)');
    expect(p.summary).toContain('2027-03-15');
  });
});
