import { describe, expect, test } from 'vitest';
import { evaluateGermany } from '../src';
import type { DePathwayId, DeRequest } from '../src';

// A skilled worker permit from 2022-03-15, renewed on time, 60 months of
// pension contributions; first arrival long before.
const base: DeRequest = {
  simulationDate: '2026-11-22',
  firstEntry: '2015-01-01',
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
        permits: [
          { kind: 'skilled', from: '2019-01-01' },
          { kind: 'skilled', from: '2023-08-01' },
        ],
        trips: [{ departed: '2023-01-10', returned: '2023-08-01' }],
      },
      'DE-SETTLEMENT',
    );
    expect(p.earliestDate).toBe('2028-08-01');
  });

  test('a lapsed permit is not held any more (review69-1)', () => {
    const req = {
      permits: [{ kind: 'settlement' as const, from: '2020-01-01' }],
      trips: [{ departed: '2023-01-10', returned: '2023-09-01' }],
    };
    // No new permit after the settlement permit lapsed on 2023-07-11.
    expect(pathway(req, 'DE-SETTLEMENT').status).toBe('NOT_MET');
    expect(pathway(req, 'DE-TRAVEL').status).toBe('NOT_MET');
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

  test('less the time abroad that ended it (AVwV 9.4.1.3, review69-1)', () => {
    const p = pathway(
      {
        simulationDate: '2026-02-02',
        permits: [
          { kind: 'skilled', from: '2018-01-01' },
          { kind: 'settlement', from: '2023-01-01' },
          { kind: 'skilled', from: '2025-02-01' },
        ],
        trips: [{ departed: '2023-02-01', returned: '2025-02-01' }],
      },
      'DE-SETTLEMENT',
    );
    // 1,858 days to 2023-02-01 less 730 days abroad = 1,128 days; with
    // 698 days from 2025-02-01 that makes the 1,826 days on 2026-12-31.
    expect(p.status).toBe('FUTURE');
    expect(p.earliestDate).toBe('2026-12-31');
  });

  test('not while holding a study permit (§ 16b Abs. 4, review69-1)', () => {
    const before = {
      kind: 'skilled' as const,
      from: '2020-09-01',
      to: '2024-08-31',
    };
    expect(
      pathway(
        { permits: [before, { kind: 'study', from: '2024-09-01' }] },
        'DE-SETTLEMENT',
      ).status,
    ).toBe('NOT_MET');
    // Vocational training after a § 18a/18b permit is allowed (§ 16a Abs. 1).
    const training = pathway(
      { permits: [before, { kind: 'training', from: '2024-09-01' }] },
      'DE-SETTLEMENT',
    );
    expect(training.status).toBe('MET');
    // Without one it depends on the kind of training.
    const unsure = pathway(
      {
        permits: [
          { ...before, kind: 'other' },
          { kind: 'training', from: '2024-09-01' },
        ],
      },
      'DE-SETTLEMENT',
    );
    expect(unsure.status).toBe('UNKNOWN');
    expect(unsure.summary).toContain('2026-11-22');
  });

  test('settlement and EU long-term residence have no end date (review69-3)', () => {
    for (const kind of ['settlement', 'eu-long-term'] as const) {
      const req = {
        simulationDate: '2026-11-23',
        permits: [
          { kind: 'skilled' as const, from: '2020-01-01', to: '2024-12-31' },
          // The date on the card is only the document's.
          { kind, from: '2025-01-01', to: '2026-10-31' },
        ],
      };
      expect(pathway(req, 'DE-SETTLEMENT').status, kind).toBe('NOT_APPLICABLE');
      expect(pathway(req, 'DE-NATURALISATION').status, kind).toBe('MET');
    }
  });

  test('Section 5 permits settle under § 26, not § 9 (review69-4)', () => {
    const sub = pathway(
      {
        permits: [
          { kind: 'asylum', from: '2020-01-01', to: '2020-06-30' },
          { kind: 'subsidiary', from: '2020-07-01' },
        ],
      },
      'DE-SETTLEMENT',
    );
    expect(sub.status).toBe('NOT_APPLICABLE');
    expect(sub.summary).toContain('§ 26 Abs. 4');
    const refugee = pathway(
      { permits: [{ kind: 'protection', from: '2020-07-01' }] },
      'DE-SETTLEMENT',
    );
    expect(refugee.status).toBe('NOT_APPLICABLE');
    expect(refugee.summary).toContain('§ 26 Abs. 3');
  });

  test('§ 24 temporary protection, then a work permit (review69-6, task 73)', () => {
    const p = pathway(
      {
        permits: [
          {
            kind: 'temporary-humanitarian',
            from: '2022-04-01',
            to: '2025-03-03',
          },
          { kind: 'skilled', from: '2025-03-04' },
        ],
      },
      'DE-EU-LONG-TERM',
    );
    // Temporary protection is a temporary purpose: not counted (PD-155).
    expect(p.status).toBe('FUTURE');
    expect(p.earliestDate).toBe('2030-03-04');
    expect(p.summary).not.toContain('2027-04-01');
  });

  test('a § 25b permit (review69-4, task 73)', () => {
    const req = {
      firstEntry: '2010-01-01',
      permits: [{ kind: 'integration' as const, from: '2020-01-01' }],
    };
    // § 9a Abs. 3 Nr. 1: no EU long-term residence while holding it.
    expect(pathway(req, 'DE-EU-LONG-TERM').status).toBe('NOT_APPLICABLE');
    expect(pathway(req, 'DE-SETTLEMENT').status).toBe('NOT_APPLICABLE');
    // § 25b is not on the list in StAG § 10 Abs. 1 Satz 1 Nr. 2.
    expect(pathway(req, 'DE-NATURALISATION').status).toBe('MET');
  });

  test('the humanitarian permits the statute treats differently (task 73)', () => {
    // § 23 Abs. 2: kept for EU long-term residence (§ 9a Abs. 3 Nr. 1).
    const resettled = {
      permits: [{ kind: 'resettlement' as const, from: '2021-03-15' }],
    };
    expect(pathway(resettled, 'DE-EU-LONG-TERM').status).toBe('MET');
    expect(pathway(resettled, 'DE-SETTLEMENT').status).toBe('NOT_APPLICABLE');
    expect(pathway(resettled, 'DE-NATURALISATION').status).toBe('MET');
    // § 25 Abs. 3: its time counts once you hold another permit, but it is
    // on the § 10 list when naturalised.
    const humanitarian = {
      permits: [
        { kind: 'humanitarian' as const, from: '2020-01-01', to: '2023-12-31' },
        { kind: 'skilled' as const, from: '2024-01-01' },
      ],
    };
    expect(pathway(humanitarian, 'DE-EU-LONG-TERM').status).toBe('MET');
    expect(
      pathway(
        { permits: [{ kind: 'humanitarian', from: '2020-01-01' }] },
        'DE-NATURALISATION',
      ).status,
    ).toBe('NOT_MET');
  });

  test('a later permit replaces one with a later printed expiry (review69-2)', () => {
    const req = {
      simulationDate: '2026-11-23',
      permits: [
        { kind: 'skilled' as const, from: '2020-01-01', to: '2023-12-31' },
        { kind: 'skilled' as const, from: '2024-01-01', to: '2027-12-31' },
        { kind: 'study' as const, from: '2025-01-01', to: '2026-06-30' },
      ],
    };
    // Nothing is held after the study permit ends on 2026-06-30.
    for (const id of [
      'DE-SETTLEMENT',
      'DE-EU-LONG-TERM',
      'DE-NATURALISATION',
    ] as const)
      expect(pathway(req, id).status, id).toBe('NOT_MET');
  });

  test('EU long-term residence that may have lapsed abroad (review69-2)', () => {
    const req = {
      simulationDate: '2026-11-23',
      permits: [{ kind: 'eu-long-term' as const, from: '2024-01-01' }],
      trips: [{ departed: '2025-01-01', returned: '2026-02-01' }],
    };
    // 13 months away: lapsed only if all of it was outside the EU.
    for (const id of [
      'DE-TRAVEL',
      'DE-SETTLEMENT',
      'DE-EU-LONG-TERM',
      'DE-NATURALISATION',
    ] as const)
      expect(pathway(req, id).status, id).toBe('UNKNOWN');
    expect(pathway(req, 'DE-EU-LONG-TERM').summary).toContain(
      '2025-01-01 至 2026-02-01',
    );
    // Naturalisation also needs discretionary credit for the year before.
    expect(pathway(req, 'DE-NATURALISATION').pendingDetails).toContain(
      'PD-128',
    );
    // Back within 12 months it is still held.
    const back = {
      ...req,
      trips: [{ departed: '2025-01-01', returned: '2025-12-01' }],
    };
    expect(pathway(back, 'DE-EU-LONG-TERM').status).toBe('NOT_APPLICABLE');
    expect(pathway(back, 'DE-SETTLEMENT').status).toBe('NOT_APPLICABLE');
  });

  test('§ 18d research before training is not the § 16a exception (task 73)', () => {
    const permits = (kind: 'skilled' | 'research') => [
      { kind, from: '2020-09-01', to: '2024-08-31' },
      { kind: 'training' as const, from: '2024-09-01' },
    ];
    // § 16a Abs. 1 Satz 3 names only §§ 18a, 18b.
    expect(
      pathway({ permits: permits('skilled') }, 'DE-SETTLEMENT').status,
    ).toBe('MET');
    expect(
      pathway({ permits: permits('research') }, 'DE-SETTLEMENT').status,
    ).toBe('UNKNOWN');
    // A research permit counts on the skilled worker route (§ 18c Abs. 1).
    expect(
      pathway(
        {
          settlementRoute: 'skilled',
          contributionMonths: 36,
          permits: [{ kind: 'research', from: '2022-03-15' }],
        },
        'DE-SETTLEMENT',
      ).status,
    ).toBe('MET');
  });

  test('time before the first arrival does not count (review69-1)', () => {
    const req = {
      simulationDate: '2026-01-15',
      firstEntry: '2021-04-01',
      permits: [
        { kind: 'other' as const, from: '2021-01-01', to: '2021-06-30' },
        { kind: 'other' as const, from: '2021-07-01' },
      ],
    };
    for (const id of [
      'DE-SETTLEMENT',
      'DE-EU-LONG-TERM',
      'DE-NATURALISATION',
    ] as const) {
      const p = pathway(req, id);
      expect(p.status, id).toBe('FUTURE');
      expect(p.earliestDate, id).toBe('2026-04-01');
    }
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
  // 14 months employed on the card by the simulation date.
  const blueCard: Partial<DeRequest> = {
    simulationDate: '2025-06-01',
    settlementRoute: 'blue-card',
    permits: [{ kind: 'blue-card', from: '2024-03-10' }],
    contributionMonths: undefined,
    blueCardEmploymentMonths: 14,
  };

  test('27 months of Blue Card employment', () => {
    const p = pathway(blueCard, 'DE-SETTLEMENT');
    // 13 more months after 2025-06-01.
    expect(p.status).toBe('FUTURE');
    expect(p.earliestDate).toBe('2026-07-01');
  });

  test('21 months with German at B1', () => {
    const p = pathway({ ...blueCard, germanB1: true }, 'DE-SETTLEMENT');
    expect(p.earliestDate).toBe('2026-01-01');
  });

  test('only Blue Card employment counts (review69-1)', () => {
    const p = pathway(
      {
        ...blueCard,
        simulationDate: '2026-10-01',
        germanB1: true,
        permits: [
          { kind: 'skilled', from: '2024-01-01', to: '2024-12-31' },
          { kind: 'blue-card', from: '2025-01-01' },
        ],
        // All contributions since 2024; 18 months on the Blue Card.
        contributionMonths: 30,
        blueCardEmploymentMonths: 18,
      },
      'DE-SETTLEMENT',
    );
    expect(p.status).toBe('FUTURE');
    expect(p.earliestDate).toBe('2027-01-01');
    expect(p.checks.map((c) => c.met)).toEqual([true, false]);
  });

  test('§ 18g employment under another permit counts (review69-3)', () => {
    const p = pathway(
      {
        ...blueCard,
        simulationDate: '2026-11-23',
        germanB1: true,
        permits: [
          { kind: 'skilled', from: '2024-09-01' },
          { kind: 'blue-card', from: '2026-08-01' },
        ],
        // The same job met § 18g from 2024-09-01: 26 full months.
        blueCardEmploymentMonths: 26,
      },
      'DE-SETTLEMENT',
    );
    expect(p.status).toBe('MET');
    expect(p.pendingDetails).toContain('PD-123');
  });

  test('months count only from the switch to the Blue Card (review69-2)', () => {
    const p = pathway(
      {
        ...blueCard,
        simulationDate: '2026-11-23',
        germanB1: true,
        permits: [
          { kind: 'skilled', from: '2026-01-01' },
          { kind: 'blue-card', from: '2027-06-01' },
        ],
        blueCardEmploymentMonths: 0,
      },
      'DE-SETTLEMENT',
    );
    // 21 months from 2027-06-01, not from the simulation date.
    expect(p.status).toBe('FUTURE');
    expect(p.earliestDate).toBe('2029-03-01');
  });

  test('employment months not entered: unknown', () => {
    const p = pathway(
      { ...blueCard, blueCardEmploymentMonths: undefined },
      'DE-SETTLEMENT',
    );
    expect(p.status).toBe('UNKNOWN');
    expect(p.summary).toContain('§ 18g');
  });

  test('met, and not met without a Blue Card', () => {
    expect(
      pathway({ ...blueCard, blueCardEmploymentMonths: 27 }, 'DE-SETTLEMENT')
        .status,
    ).toBe('MET');
    expect(
      pathway(
        {
          ...blueCard,
          blueCardEmploymentMonths: 27,
          permits: [{ kind: 'skilled', from: '2020-01-01' }],
        },
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

  test('not for subsidiary protection (§ 26 Abs. 4)', () => {
    expect(
      pathway(
        {
          ...refugee,
          permits: [
            refugee.permits![0],
            { kind: 'subsidiary', from: '2021-05-01' },
          ],
        },
        'DE-SETTLEMENT',
      ).status,
    ).toBe('NOT_MET');
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
    // A settlement permit can be held with it; not worked out.
    expect(
      pathway(
        { permits: [{ kind: 'eu-long-term', from: '2025-01-01' }] },
        'DE-SETTLEMENT',
      ).summary,
    ).toContain('并持');
  });

  test('temporary purposes do not count (§ 9b Abs. 1 Satz 2, review69-1)', () => {
    const p = pathway(
      {
        permits: [
          { kind: 'temporary', from: '2021-09-01', to: '2022-08-31' },
          { kind: 'skilled', from: '2022-09-01' },
        ],
      },
      'DE-EU-LONG-TERM',
    );
    expect(p.status).toBe('FUTURE');
    expect(p.earliestDate).toBe('2027-09-01');
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

  test('short trips totalling up to 300 days count (BGB § 191)', () => {
    const permits = [{ kind: 'skilled' as const, from: '2021-03-15' }];
    const p = pathway(
      {
        simulationDate: '2026-01-01',
        permits,
        trips: [
          // 179 + 121 = 300 days abroad: 10 months of 30 days.
          { departed: '2022-01-01', returned: '2022-06-30' },
          { departed: '2023-01-01', returned: '2023-05-03' },
        ],
      },
      'DE-EU-LONG-TERM',
    );
    expect(p.earliestDate).toBe('2026-03-15');
    // 303 days, the fewest 10 calendar months can span, is over 300
    // (review69-2): only the generous reading counts them all.
    const over = pathway(
      {
        simulationDate: '2026-01-01',
        permits,
        trips: [
          { departed: '2022-01-01', returned: '2022-06-30' },
          { departed: '2023-01-01', returned: '2023-05-06' },
        ],
      },
      'DE-EU-LONG-TERM',
    );
    expect(over.status).toBe('FUTURE');
    expect(over.earliestDate).not.toBe('2026-03-15');
    expect(over.summary).toContain('2026-03-15');
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

  test('met today only on the generous reading: unknown (review69-1)', () => {
    const p = pathway(
      {
        simulationDate: '2026-03-15',
        permits: [{ kind: 'skilled', from: '2021-03-15' }],
        trips: [
          { departed: '2022-01-01', returned: '2022-06-30' },
          { departed: '2023-01-01', returned: '2023-05-08' },
        ],
      },
      'DE-EU-LONG-TERM',
    );
    // Certain once the 5 years start inside the first trip and the absences
    // left are 300 days or fewer.
    expect(p.status).toBe('UNKNOWN');
    expect(p.earliestDate).toBeUndefined();
    expect(p.summary).toContain('2027-01-07');
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

  test('also after subsidiary protection (Nr. 5, review69-1)', () => {
    const permits = [
      { kind: 'asylum' as const, from: '2021-05-01', to: '2022-04-30' },
      { kind: 'subsidiary' as const, from: '2022-05-01' },
    ];
    expect(pathway({ permits }, 'DE-EU-LONG-TERM').status).toBe('MET');
    expect(pathway({ permits }, 'DE-NATURALISATION').status).toBe('MET');
  });

  test('a trip that ended the permit resets the count', () => {
    const p = pathway(
      {
        permits: [
          { kind: 'skilled', from: '2019-01-01' },
          { kind: 'skilled', from: '2023-08-01' },
        ],
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
    // Before 2024-06-27 the 3-year route did not exist yet.
    const old = pathway(
      { simulationDate: '2024-01-01' },
      'DE-NATURALISATION',
    ).assumptions.join(' ');
    expect(old).toContain('模拟日早于 2024-06-27');
    expect(old).not.toContain('3 年路径');
  });

  test('a § 20 job seeking permit on the day is not met (review69-1, task 73)', () => {
    const p = pathway(
      {
        permits: [
          { kind: 'study', from: '2021-09-01', to: '2026-07-31' },
          { kind: 'job-seeking', from: '2026-08-01' },
        ],
      },
      'DE-NATURALISATION',
    );
    // § 20 is on the list in StAG § 10 Abs. 1 Satz 1 Nr. 2.
    expect(p.status).toBe('NOT_MET');
  });

  test('§ 20 job seeking: settlement yes, EU long-term no (task 73)', () => {
    const req = {
      permits: [
        { kind: 'skilled' as const, from: '2020-01-01', to: '2024-12-31' },
        { kind: 'job-seeking' as const, from: '2025-01-01' },
      ],
    };
    // § 20 does not rule out § 9 (unlike § 20a Abs. 6).
    expect(pathway(req, 'DE-SETTLEMENT').status).toBe('MET');
    // A temporary purpose for EU long-term residence (§ 9a Abs. 3 Nr. 5).
    expect(pathway(req, 'DE-EU-LONG-TERM').status).toBe('NOT_MET');
  });

  test('met today only with discretionary credit: unknown (review69-1)', () => {
    const p = pathway(
      {
        permits: [
          { kind: 'other', from: '2018-01-01', to: '2022-12-31' },
          { kind: 'other', from: '2024-01-01' },
        ],
      },
      'DE-NATURALISATION',
    );
    expect(p.status).toBe('UNKNOWN');
    expect(p.earliestDate).toBeUndefined();
    expect(p.summary).toContain('2029-01-01');
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

  test('the spouse German throughout the 2 years (review69-1)', () => {
    const p = pathway(
      {
        naturalisationRoute: 'spouse',
        permits: [{ kind: 'skilled', from: '2022-01-01' }],
        marriedOn: '2020-01-01',
        spouseGermanSince: '2026-01-01',
      },
      'DE-NATURALISATION',
    );
    expect(p.status).toBe('FUTURE');
    expect(p.earliestDate).toBe('2028-01-01');
  });

  test('no credit for residence before the marriage (review69-1)', () => {
    const p = pathway(
      {
        naturalisationRoute: 'spouse',
        permits: [
          { kind: 'skilled', from: '2019-01-01', to: '2021-12-31' },
          { kind: 'german-family', from: '2024-10-15' },
        ],
        marriedOn: '2024-10-15',
      },
      'DE-NATURALISATION',
    );
    expect(p.status).toBe('FUTURE');
    expect(p.earliestDate).toBe('2027-10-15');
    expect(p.pendingDetails).not.toContain('PD-128');
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

  test('a permit that expires while away ends then (§ 51 Abs. 1 Nr. 1, review69-3)', () => {
    const trips = [{ departed: '2026-02-01', returned: '2026-04-15' }];
    const p = pathway(
      {
        permits: [{ kind: 'skilled', from: '2022-03-15', to: '2026-03-31' }],
        trips,
      },
      'DE-TRAVEL',
    );
    expect(p.status).toBe('NOT_MET');
    expect(p.checks[0].text).toContain('2026-03-31');
    // Renewed from 2026-04-01: the 6 months apply.
    expect(
      pathway(
        {
          permits: [
            { kind: 'skilled', from: '2022-03-15', to: '2026-03-31' },
            { kind: 'skilled', from: '2026-04-01' },
          ],
          trips,
        },
        'DE-TRAVEL',
      ).status,
    ).toBe('MET');
  });

  test('a trip while a timely renewal is pending (§ 81 Abs. 4, review69-4)', () => {
    const req = {
      permits: [
        {
          kind: 'skilled' as const,
          from: '2020-01-01',
          to: '2026-03-31',
          renewing: true,
        },
        { kind: 'skilled' as const, from: '2026-05-01' },
      ],
      trips: [{ departed: '2026-03-27', returned: '2026-04-06' }],
    };
    expect(pathway(req, 'DE-TRAVEL').status).toBe('MET');
    expect(pathway(req, 'DE-SETTLEMENT').status).toBe('MET');
    // Without the renewal ticked the permit ends on 2026-03-31.
    const late = {
      ...req,
      permits: [{ ...req.permits[0], renewing: false }, req.permits[1]],
    };
    expect(pathway(late, 'DE-TRAVEL').status).toBe('NOT_MET');
  });

  describe('waiting for a renewal decision (§ 81 Abs. 4, review69-5/6)', () => {
    const req = {
      permits: [
        {
          kind: 'skilled' as const,
          from: '2021-11-15',
          to: '2026-10-31',
          renewing: true,
        },
      ],
    };
    // The 5 years end on 2026-11-15, after the card ran out.
    test('settlement: only if the renewal is granted', () => {
      const p = pathway(req, 'DE-SETTLEMENT');
      expect(p.status).toBe('UNKNOWN');
      expect(p.summary).toContain('§ 81 Abs. 4');
      // Without contribution months the summary still names the renewal,
      // and does not say the years are met (review69-7).
      const blank = pathway(
        { ...req, contributionMonths: undefined },
        'DE-SETTLEMENT',
      ).summary;
      expect(blank).toContain('§ 81 Abs. 4');
      expect(blank).toContain('只在下述待确认的情形下满足');
    });

    test('EU long-term residence: only if the renewal is granted', () => {
      const p = pathway(req, 'DE-EU-LONG-TERM');
      expect(p.status).toBe('UNKNOWN');
      expect(p.summary).toContain('§ 81 Abs. 4');
    });

    test('naturalisation: the wait counts, holding on the day is disputed (review69-6/8)', () => {
      const p = pathway(req, 'DE-NATURALISATION');
      // The 5 years are reached with the wait (review69-6), but holding a
      // permit on the day rests only on the pending renewal (review69-8).
      expect(p.status).toBe('UNKNOWN');
      expect(p.checks[0].met).toBeUndefined();
      expect(p.summary).toContain('最早 2026-11-22');
      expect(p.summary).toContain('§ 10 Abs. 1 Satz 1 Nr. 2');
    });

    test('already back, still pending: on the old permit (review69-9)', () => {
      const p = pathway(
        {
          simulationDate: '2026-11-23',
          permits: [
            {
              kind: 'skilled',
              from: '2024-03-15',
              to: '2026-10-31',
              renewing: true,
            },
          ],
          trips: [{ departed: '2026-10-25', returned: '2026-11-05' }],
        },
        'DE-TRAVEL',
      );
      expect(p.status).toBe('MET');
      // Worded as the § 51 limit, not an unconditional date (review69-10).
      expect(p.checks[0].text).toContain('§ 51 的返回期限为 2027-04-25');
    });

    test('trips back after the old expiry are conditional (review69-8)', () => {
      const permits = [
        {
          kind: 'skilled' as const,
          from: '2022-03-15',
          to: '2026-12-31',
          renewing: true,
        },
      ];
      const p = pathway(
        {
          permits,
          trips: [{ departed: '2026-12-20', returned: '2027-01-10' }],
        },
        'DE-TRAVEL',
      );
      expect(p.status).toBe('UNKNOWN');
      expect(p.checks[0].met).toBeUndefined();
      expect(p.checks[0].text).toContain('2027-06-20');
      // A Blue Card: the summary gives its 12 months too.
      const blue = pathway(
        {
          permits: [{ ...permits[0], kind: 'blue-card' }],
          trips: [{ departed: '2026-12-20', returned: '2027-01-10' }],
        },
        'DE-TRAVEL',
      );
      expect(blue.checks[0].text).toContain('2027-12-20');
      expect(blue.summary).toContain('欧盟蓝卡 12 个月');
      // Back before the old expiry: as before.
      expect(
        pathway(
          {
            permits,
            trips: [{ departed: '2026-12-01', returned: '2026-12-15' }],
          },
          'DE-TRAVEL',
        ).status,
      ).toBe('MET');
    });

    test('naturalisation: later waiting time is conditional (review69-7)', () => {
      const p = pathway(
        {
          permits: [
            {
              kind: 'skilled',
              from: '2022-03-15',
              to: '2026-10-31',
              renewing: true,
            },
          ],
        },
        'DE-NATURALISATION',
      );
      // 5 years only on 2027-03-15, after the simulation date.
      expect(p.status).toBe('UNKNOWN');
      expect(p.earliestDate).toBeUndefined();
      expect(p.summary).toContain('2027-03-15');
    });

    test('EU long-term residence: renewal pending (review69-7, task 73)', () => {
      const p = pathway(
        {
          simulationDate: '2027-05-01',
          permits: [
            {
              kind: 'temporary-humanitarian',
              from: '2022-04-01',
              to: '2025-03-03',
            },
            {
              kind: 'skilled',
              from: '2025-03-04',
              to: '2027-03-31',
              renewing: true,
            },
          ],
        },
        'DE-EU-LONG-TERM',
      );
      // § 24 time does not count (PD-155): 5 years from 2025-03-04, and
      // only if the renewal is granted.
      expect(p.status).toBe('UNKNOWN');
      expect(p.summary).toContain('§ 81 Abs. 4');
      expect(p.summary).toContain('2030-03-04');
    });

    test('training after a skilled worker permit: also uncertain (review69-6)', () => {
      const p = pathway(
        {
          permits: [
            { kind: 'skilled', from: '2018-01-01', to: '2022-12-31' },
            {
              kind: 'training',
              from: '2023-01-01',
              to: '2026-08-31',
              renewing: true,
            },
          ],
        },
        'DE-SETTLEMENT',
      );
      expect(p.status).toBe('UNKNOWN');
    });
  });

  test('a permit extended by law: enter the legal end date (review69-5)', () => {
    const p = pathway(
      {
        // Temporary protection (§ 24) with the date it was extended to.
        permits: [
          {
            kind: 'temporary-humanitarian',
            from: '2024-04-01',
            to: '2027-03-04',
          },
        ],
        trips: [{ departed: '2026-02-27', returned: '2026-03-10' }],
      },
      'DE-TRAVEL',
    );
    expect(p.status).toBe('MET');
  });

  test('an unlimited permit has no expiry near the forecast limit (review69-4)', () => {
    const p = pathway(
      {
        permits: [{ kind: 'settlement', from: '2020-01-01' }],
        trips: [{ departed: '2036-10-01', returned: '2037-01-01' }],
      },
      'DE-TRAVEL',
    );
    expect(p.status).toBe('MET');
  });

  test('a study permit and EU student mobility (§ 51 Abs. 1a, review69-10)', () => {
    const req = {
      simulationDate: '2026-06-01',
      permits: [
        { kind: 'study' as const, from: '2024-10-01', to: '2026-09-30' },
      ],
      // Two semesters in France under Directive (EU) 2016/801.
      trips: [{ departed: '2025-09-15', returned: '2026-05-15' }],
    };
    const p = pathway(req, 'DE-TRAVEL');
    expect(p.status).toBe('UNKNOWN');
    expect(p.checks[0].met).toBeUndefined();
    expect(p.summary).toContain('§ 51 Abs. 1a');
    expect(p.checks[0].text).toContain('2026-03-15');
  });

  test('a research permit and EU researcher mobility (§ 51 Abs. 1a, task 73)', () => {
    const p = pathway(
      {
        simulationDate: '2026-06-01',
        permits: [{ kind: 'research', from: '2024-10-01', to: '2026-09-30' }],
        trips: [{ departed: '2025-09-15', returned: '2026-05-15' }],
      },
      'DE-TRAVEL',
    );
    expect(p.status).toBe('UNKNOWN');
    expect(p.summary).toContain('§ 51 Abs. 1a');
  });

  test('a study permit that ran out before the return lapsed (review69-11)', () => {
    const p = pathway(
      {
        simulationDate: '2026-06-01',
        permits: [{ kind: 'study', from: '2024-10-01', to: '2026-04-30' }],
        trips: [{ departed: '2025-09-15', returned: '2026-05-15' }],
      },
      'DE-TRAVEL',
    );
    // § 51 Abs. 1a spares only Nr. 6 and 7, not the expiry (Nr. 1).
    expect(p.status).toBe('NOT_MET');
    expect(p.checks[0].text).toContain('2026-04-30');
  });

  test('a short trip after an undetermined exchange (task 73)', () => {
    const p = pathway(
      {
        simulationDate: '2026-08-01',
        permits: [{ kind: 'study', from: '2024-10-01', to: '2026-09-30' }],
        trips: [
          { departed: '2025-09-15', returned: '2026-05-15' },
          { departed: '2026-07-01', returned: '2026-07-20' },
        ],
      },
      'DE-TRAVEL',
    );
    // Whether the permit still existed on 2026-07-01 depends on the first
    // trip.
    expect(p.status).toBe('UNKNOWN');
    expect(p.checks[1].met).toBeUndefined();
    expect(p.checks[1].text).toContain('2025-09-15 至 2026-05-15');
    // With a new permit in between, the second trip is on that permit.
    expect(
      pathway(
        {
          simulationDate: '2026-08-01',
          permits: [
            { kind: 'study', from: '2024-10-01', to: '2026-09-30' },
            { kind: 'skilled', from: '2026-06-01' },
          ],
          trips: [
            { departed: '2025-09-15', returned: '2026-05-15' },
            { departed: '2026-07-01', returned: '2026-07-20' },
          ],
        },
        'DE-TRAVEL',
      ).checks[1].met,
    ).toBe(true);
  });

  test('a new permit after an undetermined exchange (review69-11)', () => {
    const req = {
      simulationDate: '2026-11-23',
      contributionMonths: 17,
      permits: [
        { kind: 'study' as const, from: '2024-10-01', to: '2026-09-30' },
        { kind: 'skilled' as const, from: '2026-05-15', to: '2030-05-14' },
        { kind: 'skilled' as const, from: '2030-05-15', to: '2034-05-14' },
      ],
      trips: [{ departed: '2025-09-15', returned: '2026-05-15' }],
    };
    expect(pathway(req, 'DE-TRAVEL').status).toBe('UNKNOWN');
    // Certain: the study permit lapsed, so the count starts again on
    // 2026-05-15; if it did not, the earlier dates.
    const settlement = pathway(req, 'DE-SETTLEMENT');
    expect(settlement.status).toBe('FUTURE');
    expect(settlement.earliestDate).toBe('2031-05-15');
    expect(settlement.summary).toContain('2030-08-23');
    const eu = pathway(req, 'DE-EU-LONG-TERM');
    expect(eu.status).toBe('FUTURE');
    expect(eu.earliestDate).toBe('2031-05-15');
    expect(eu.summary).toContain('2030-11-21');
  });

  test('the same after EU long-term residence that may have lapsed (review69-11)', () => {
    const p = pathway(
      {
        simulationDate: '2026-11-23',
        permits: [
          { kind: 'eu-long-term', from: '2024-01-01' },
          { kind: 'skilled', from: '2026-03-01' },
        ],
        // 13 months away: lapsed only if all of it was outside the EU.
        trips: [{ departed: '2025-01-01', returned: '2026-02-01' }],
      },
      'DE-SETTLEMENT',
    );
    // Certain: lapsed, so the count starts again with the new permit.
    expect(p.status).toBe('FUTURE');
    expect(p.earliestDate).toBe('2031-03-01');
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
