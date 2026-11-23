import { describe, expect, test } from 'vitest';
import {
  DE_FULL_ROUTES,
  evaluateGermany,
  evaluateGermanyFull,
  type DeFullRequest,
  type DeFullRoute,
} from '../src';
import { commonChecks, type DeCommonAnswers } from '../src/germany-full-common';
import { feeChecks, type DeFeeAnswers } from '../src/germany-fees';

const day = '2026-11-23';
const evidence: DeCommonAnswers = {
  identityEstablished: true,
  nationalityEstablishedOrNotRequired: true,
  capableOrRepresented: true,
  passport: 'valid',
  evidenceAndAttendance: true,
  entry: 'required-visa-and-disclosed',
  security: 'no-known-ground',
  benefits: 'none-or-permitted',
  household: {
    members: ['single'],
    countableMonthlyIncome: 1243,
    warmRent: 550,
    additionalNeeds: 50,
    uncoveredPremiums: 80,
    sustainable: true,
    scopeAndDeductionsConfirmed: true,
  },
  insurance: ['statutory', 'family'],
  employmentAuthorisedOrNotRequired: true,
  permanentProfessionalPermissionOrNotRequired: true,
  provenGerman: 'B1',
  orientationScore: 15,
  housing: {
    qualityAndOccupancyConfirmed: true,
    localMinimumM2: 46,
    usableM2: 46,
  },
  address: 'registered',
  transition: 'ordinary',
};
const complete: DeFullRequest = {
  mobility: {
    titles: [
      { kind: 'other', validTo: null, noOtherLossEvent: true, trips: [] },
    ],
  },

  simulationDate: day,
  birthDate: '1990-06-20',
  firstEntry: '2021-11-23',
  permits: [{ kind: 'other', from: '2021-11-23' }],
  trips: [],
  contributionMonths: 60,
  common: evidence,
};
const pathway = (route: DeFullRoute, overrides: Partial<DeFullRequest> = {}) =>
  evaluateGermanyFull({ ...complete, ...overrides, routes: [route] }).columns[0]
    .pathways[0];
const rule = (
  route: DeFullRoute,
  id: string,
  answers: DeCommonAnswers,
  overrides: Partial<DeFullRequest> = {},
) =>
  commonChecks(route, {
    ...complete,
    ...overrides,
    common: { ...evidence, ...answers },
  }).find((c) => c.id === 'DE-' + id);
const fee = (
  route: DeFullRoute,
  id: string,
  fees: DeFeeAnswers = {},
  overrides: Partial<DeFullRequest> = {},
) =>
  feeChecks(route, { ...complete, ...overrides, fees }).find(
    (c) => c.id === 'DE-' + id,
  );

describe('German full route results', () => {
  test('omitted histories are unknown with localised, sourced rules and stable IDs for every route', () => {
    const result = (locale: 'en' | 'zh-CN') =>
      evaluateGermanyFull({ simulationDate: day, locale });
    const chinese = result('zh-CN');
    expect(chinese.policyAsOf).toBe(day);
    expect(chinese.columns[0].id).toBe('de.current-law-2026-11');
    const paths = chinese.columns[0].pathways;
    expect(paths.map((p) => p.id)).toEqual(
      DE_FULL_ROUTES.map((r) => 'DE-' + r),
    );
    const en = result('en').columns[0].pathways;
    for (const [i, p] of paths.entries()) {
      expect(p.status, p.id).toBe('UNKNOWN');
      expect(p.earliestDate).toBeUndefined();
      expect(p.title).not.toBe(en[i].title);
      expect(new Set(p.checks.map((c) => c.id)).size).toBe(p.checks.length);
      expect(en[i].checks.map((c) => c.id)).toEqual(p.checks.map((c) => c.id));
      for (const [j, c] of p.checks.entries()) {
        expect(c.sources.length, c.id).toBeGreaterThan(0);
        expect(
          c.sources.every((s) => s.locator && /^SRC-\d+$/.test(s.srcId)),
        ).toBe(true);
        expect(c.title).not.toBe(en[i].checks[j].title);
        expect(c.explanation.length).toBeGreaterThan(0);
        if (c.status === 'UNKNOWN')
          expect(c.pendingDetails?.[0], c.id).toMatch(/^PD-/);
      }
    }
  });
  test('the fifth anniversary is met; missing evidence, a known failure, and procedure costs are independent', () => {
    expect(pathway('R01')).toMatchObject({ status: 'MET', earliestDate: day });
    expect(
      pathway('R01', { common: { ...evidence, insurance: ['unconfirmed'] } })
        .status,
    ).toBe('UNKNOWN');
    expect(
      pathway('R01', {
        common: {
          ...evidence,
          insurance: ['unconfirmed'],
          security: 'refusal-ground',
        },
      }).status,
    ).toBe('NOT_MET');
    expect(
      pathway('R01', {
        fees: { paid: 0 },
        common: {
          ...evidence,
          address: 'wrong-jurisdiction',
          evidenceAndAttendance: false,
        },
      }).status,
    ).toBe('MET');
    const before = pathway('R01', { simulationDate: '2026-11-22' });
    expect(before).toMatchObject({ status: 'FUTURE', earliestDate: day });
    expect(before.earliestDate).toBe(
      evaluateGermany({
        ...complete,
        firstEntry: complete.firstEntry!,
        permits: complete.permits!,
        trips: [],
        settlementRoute: 'general',
        naturalisationRoute: 'general',
        simulationDate: '2026-11-22',
      }).pathways[0].earliestDate,
    );
    expect(
      pathway('R01', {
        simulationDate: '2026-11-22',
        contributionMonths: 0,
        common: { ...evidence, recognisedEducation: true },
      }),
    ).toMatchObject({ status: 'FUTURE', earliestDate: day });
    expect(pathway('R01', { contributionMonths: 59 })).toMatchObject({
      status: 'FUTURE',
      earliestDate: '2026-12-23',
    });
    expect(
      pathway('R01', {
        permits: [{ kind: 'subsidiary', from: complete.firstEntry! }],
      }).status,
    ).toBe('NOT_APPLICABLE');
  });
  test('ordinary and accelerated refugee terms and skilled graduation tiers use independent cutoffs', () => {
    const refugee = {
      permits: [{ kind: 'protection' as const, from: '2023-11-23' }],
      firstEntry: '2023-11-23',
    };
    expect(pathway('R05', refugee).checks[0].status).toBe('NOT_MET');
    expect(pathway('R05-fast', refugee).checks[0].status).toBe('MET');
    const skilled = {
      permits: [{ kind: 'skilled' as const, from: '2024-11-23' }],
      firstEntry: '2024-11-23',
    };
    expect(pathway('R02', skilled).checks[0].status).toBe('UNKNOWN');
    expect(
      pathway('R02', { ...skilled, trainedInGermany: true }).checks[0].status,
    ).toBe('MET');
    expect(
      pathway('R02', { ...skilled, trainedInGermany: false }).checks[0].status,
    ).toBe('NOT_MET');
  });
  test('a lost current title blocks the route even when the permit period would be long enough', () => {
    const mobility = {
      titles: [
        {
          kind: 'other' as const,
          noOtherLossEvent: false,
          validTo: '2027-02-01',
          trips: [],
        },
      ],
    };
    expect(pathway('R00', { mobility }).status).toBe('NOT_MET');
    expect(pathway('R01', { mobility }).status).toBe('NOT_MET');
    expect(
      pathway('R18', {
        mobility: {
          freedom: {
            permanentRightPreviouslyAcquired: true,
            subsequentTrips: [],
            lossDecision: 'clear',
          },
        },
        common: {},
        fees: {},
      }).status,
    ).toBe('MET');
  });
});

describe('common settlement requirements', () => {
  test.each([
    ['C01', { passport: 'unconfirmed' }, 'UNKNOWN'],
    ['C01', { capableOrRepresented: false }, 'NOT_MET'],
    ['C01-procedure', { evidenceAndAttendance: false }, 'NOT_MET'],
    ['C02', { entry: 'insufficient' }, 'NOT_MET'],
    ['C03', { benefits: 'disqualifying-entitlement' }, 'NOT_MET'],
    ['C04', { insurance: ['family', 'none'] }, 'NOT_MET'],
    ['C06', { security: 'investigation' }, 'UNKNOWN'],
    ['C07', { permanentProfessionalPermissionOrNotRequired: false }, 'NOT_MET'],
    ['C08', { provenGerman: 'A2' }, 'NOT_MET'],
    ['C09', { orientationScore: 14 }, 'NOT_MET'],
    [
      'C10',
      {
        housing: {
          usableM2: 45.99,
          localMinimumM2: 46,
          qualityAndOccupancyConfirmed: true,
        },
      },
      'NOT_MET',
    ],
    ['C11', { address: 'unverified' }, 'UNKNOWN'],
    ['C12', { transition: 'pending' }, 'UNKNOWN'],
  ] as const)('%s responds to changed evidence', (id, answers, expected) => {
    expect(rule('R01', id, {})?.status).toBe('MET');
    expect(rule('R01', id, answers as DeCommonAnswers)?.status).toBe(expected);
  });
  test('2026 household budget counts the statutory bands, rent, additional needs and uncovered insurance in cents', () => {
    const household: DeCommonAnswers['household'] = {
      ...evidence.household,
      members: [
        'partner',
        'partner',
        'otherAdult',
        'child14to17',
        'child6to13',
        'childUnder6',
      ],
      countableMonthlyIncome: 3361,
    };
    // 506 + 506 + 451 + 471 + 390 + 357 + 550 + 50 + 80 = 3361.
    expect(rule('R01', 'C03', { household })?.status).toBe('MET');
    expect(
      rule('R01', 'C03', {
        household: { ...household, countableMonthlyIncome: 3360.99 },
      })?.status,
    ).toBe('NOT_MET');
    expect(
      rule('R01', 'C03', { household }, { simulationDate: '2027-01-01' })
        ?.status,
    ).toBe('UNKNOWN');
    expect(
      rule('R01', 'C03', {
        household: { ...household, scopeAndDeductionsConfirmed: false },
      })?.status,
    ).toBe('UNKNOWN');
  });
  test('sixty pension months, spouse, care, education and historic exceptions', () => {
    expect(rule('R01', 'C05', {}, { contributionMonths: 59 })?.status).toBe(
      'NOT_MET',
    );
    expect(
      rule('R01', 'C05', { creditedCareMonths: 1 }, { contributionMonths: 59 })
        ?.status,
    ).toBe('MET');
    expect(
      rule(
        'R01',
        'C05',
        { spouseInHousehold: true, spouseContributionMonths: 60 },
        { contributionMonths: 0 },
      )?.status,
    ).toBe('MET');
    expect(
      rule(
        'R09',
        'C05',
        { recognisedEducation: true },
        { contributionMonths: 0 },
      )?.status,
    ).toBe('NOT_MET');
    expect(
      rule('R01', 'C05', { transition: 'pre-2005' }, { contributionMonths: 0 })
        ?.status,
    ).toBe('MET');
    expect(
      rule('R01', 'C08', {
        transition: 'pre-2005',
        provenGerman: 'none',
        simpleSpokenGerman: true,
      })?.status,
    ).toBe('MET');
    expect(
      rule('R06', 'C09', { transition: 'pre-2005', orientationScore: 0 })
        ?.status,
    ).toBe('UNKNOWN');
    expect(
      rule('R01', 'C09', {
        orientationScore: 0,
        courseRightOrDutyException: true,
        simpleSpokenGerman: true,
      })?.status,
    ).toBe('MET');
    expect(
      rule('R02', 'C09', {
        orientationScore: 0,
        courseRightOrDutyException: true,
        simpleSpokenGerman: true,
      })?.status,
    ).toBe('NOT_MET');
    expect(rule('R03', 'C08', {})).toBeUndefined();
    expect(rule('R04', 'C09', {})).toBeUndefined();
    expect(rule('R05', 'C02', { entry: 'insufficient' })?.status).toBe('MET');
    expect(rule('R05-fast', 'C08', { provenGerman: 'B2' })?.status).toBe(
      'NOT_MET',
    );
    expect(
      rule('R01', 'C10', {
        housing: { usableM2: 100, householdAges: [40, 5, 1] },
      })?.explanation,
    ).toContain('22');
  });
});

describe('application and exam fee information', () => {
  test.each([
    ['R01', 'C65', {}, '113.00'],
    ['R13', 'C65', {}, '147.00'],
    ['R10', 'C65', {}, '124.00'],
    ['R06', 'C66', {}, '109.00'],
    ['R06', 'C66-advance', {}, '54.50'],
    ['R01', 'C65', { reduction: 'section52-protection-or-admission' }, '0.00'],
    [
      'R06',
      'C66',
      { reduction: 'section52-protection-or-admission' },
      '109.00',
    ],
    ['R01', 'C65', { stage: 'after-substantive-review' }, '56.50'],
    ['R01', 'C65', { stage: 'withdrawn-before-review' }, '0.00'],
    ['R01', 'C65', { expressAccepted: true }, '148.00'],
    ['R18', 'C68', { euDocument: 'certificate' }, '10.00'],
    ['R07', 'C69', {}, '255.00'],
    ['R07', 'C70', { citizenshipTest: 'bamf' }, '25.00'],
    ['R07', 'C70', { citizenshipTest: 'already-proved-or-exempt' }, '0.00'],
    ['R07', 'C71', { integration: 'external-lid' }, '25.00'],
    [
      'R02',
      'C71',
      {
        integration: 'course',
        courseExemption: 'ordinary',
        courseReimbursementBase: 205,
      },
      '102.50',
    ],
  ] as const)('%s %s applies its own tariff', (route, id, fees, expected) => {
    expect(fee(route, id, fees)?.explanation).toContain('€' + expected);
  });
  test('age at application, missing quotes, uncertain waivers and superseded amounts', () => {
    const child = { birthDate: '2010-11-23' };
    expect(fee('R11', 'C65', {}, child)?.explanation).toContain('55.00');
    expect(
      fee('R16', 'C69', { personalTaxableIncome: false }, child)?.explanation,
    ).toContain('51.00');
    expect(fee('R16', 'C69', {}, child)?.status).toBe('UNKNOWN');
    expect(
      fee(
        'R18',
        'C68',
        { euDocument: 'family-card' },
        { birthDate: '2002-11-24' },
      )?.explanation,
    ).toContain('27.60');
    expect(
      fee(
        'R18',
        'C68',
        { euDocument: 'family-card' },
        { birthDate: '2002-11-23' },
      )?.explanation,
    ).toContain('46.00');
    expect(
      fee('R18', 'C68', {
        euDocument: 'family-card',
        applicationDate: '2026-02-06',
      })?.status,
    ).toBe('UNKNOWN');
    expect(fee('R01', 'C67', { reduction: 'ordinary' })?.status).toBe('MET');
    expect(fee('R01', 'C67', { reduction: 'pending' })?.status).toBe('UNKNOWN');
    expect(fee('R01', 'C65', { reduction: 'pending' })?.status).toBe('UNKNOWN');
    expect(fee('R06', 'C66', { applicationDate: '2017-08-31' })?.status).toBe(
      'UNKNOWN',
    );
    expect(fee('R07', 'C70', { citizenshipTest: 'state' })?.status).toBe(
      'UNKNOWN',
    );
    expect(
      fee('R07', 'C71', { integration: 'commercial-or-repeat' })?.status,
    ).toBe('UNKNOWN');
    expect(
      fee('R16', 'C69-review', { stage: 'after-substantive-review' })
        ?.explanation,
    ).toContain('€25–€255');
    const course = {
      integration: 'course' as const,
      qualifyingChildren: 1,
      employeeGrossAnnual: 43602,
    };
    expect(fee('R01', 'C71-exemption', course)?.status).toBe('MET');
    expect(
      fee('R01', 'C71-exemption', { ...course, employeeGrossAnnual: 43602.01 })
        ?.status,
    ).toBe('NOT_MET');
    expect(fee('R01', 'C65-paid', { paid: 112.99 })?.status).toBe('NOT_MET');
    expect(fee('R01', 'C65-paid', { paid: 113 })?.status).toBe('MET');
  });
});

test('security clearance and registration are reported independently, including the two-week deadline', () => {
  expect(
    rule('R01', 'C06-authority', { securityAuthority: 'clear' })?.status,
  ).toBe('MET');
  expect(
    rule('R01', 'C06-authority', { securityAuthority: 'pending' })?.status,
  ).toBe('UNKNOWN');
  expect(rule('R01', 'C06', { securityAuthority: 'refused' })?.status).toBe(
    'NOT_MET',
  );
  expect(
    rule('R01', 'C11-deadline', {
      movedOn: '2026-11-01',
      registeredOn: '2026-11-15',
    })?.status,
  ).toBe('MET');
  expect(
    rule('R01', 'C11-deadline', {
      movedOn: '2026-11-01',
      registeredOn: '2026-11-16',
    })?.status,
  ).toBe('NOT_MET');
});

test('a documented return extension resolves retention while long-absence residence credit still needs review', () => {
  const trip = { departed: '2023-01-01', returned: '2023-08-01' };
  const details: Partial<DeFullRequest> = {
    trips: [trip],
    mobility: {
      titles: [
        {
          kind: 'other',
          validTo: null,
          noOtherLossEvent: true,
          trips: [
            {
              ...trip,
              nonTemporary: false,
              approvedReturnBy: '2023-09-01',
              exception: 'none',
            },
          ],
        },
      ],
    },
  };
  expect(pathway('R00', details).status).toBe('MET');
  const settlement = pathway('R01', details);
  expect(settlement.status).toBe('UNKNOWN');
  expect(settlement.checks[0].pendingDetails).toContain('PD-353');
  const card = pathway('R03', {
    permits: undefined,
    mobility: { blueCard: { cardHeldAtDecision: true } },
  });
  expect(card.checks[0].status).toBe('MET');
  expect(card.status).toBe('UNKNOWN');
});

test('family reunification and overseas periods are not interchangeable with ordinary residence', () => {
  expect(
    pathway('R04', {
      firstEntry: '2023-11-23',
      permits: [{ kind: 'german-family', from: '2023-11-23' }],
    }).checks[0].status,
  ).toBe('MET');
  expect(
    pathway('R04', {
      firstEntry: '2023-11-24',
      permits: [{ kind: 'german-family', from: '2023-11-24' }],
    }).checks[0].status,
  ).toBe('NOT_MET');
  expect(pathway('R06').checks[0].status).toBe('MET');
  expect(pathway('R06', { firstEntry: '2021-11-24' }).checks[0].status).toBe(
    'NOT_MET',
  );
  expect(pathway('R15', { contributionMonths: 0 }).checks[0].status).toBe(
    'MET',
  );
  expect(
    pathway('R15', { firstEntry: '2021-11-24', contributionMonths: 0 })
      .checks[0].status,
  ).toBe('NOT_MET');
  expect(pathway('R07').checks[0].status).toBe('MET');
  expect(pathway('R07', { firstEntry: '2021-11-24' }).checks[0].status).toBe(
    'NOT_MET',
  );
  expect(pathway('R08', { marriedOn: '2024-11-23' }).checks[0].status).toBe(
    'MET',
  );
  expect(pathway('R08', { marriedOn: '2024-11-24' }).checks[0].status).toBe(
    'NOT_MET',
  );
});

test('a LiD score beyond the number of questions needs correction', () => {
  expect(rule('R01', 'C09', { orientationScore: 34 })?.status).toBe('UNKNOWN');
});

test('a residence timeline alone does not resolve other grounds for termination of the title', () => {
  const full = pathway('R01', { mobility: undefined });
  expect(full.checks[0].status).toBe('MET');
  expect(full.checks.find((c) => c.id === 'DE-C63-current')?.status).toBe(
    'UNKNOWN',
  );
  expect(full.status).toBe('UNKNOWN');
});

test('a short holiday does not erase humanitarian permit years; long absences need separate credit', () => {
  const permits = [{ kind: 'subsidiary' as const, from: '2021-11-23' }];
  const time = (returned: string) =>
    pathway('R09', {
      permits,
      trips: [{ departed: '2023-01-01', returned }],
    }).checks.find((c) => c.id === 'DE-C32-time')?.status;
  expect(time('2023-01-07')).toBe('MET');
  expect(time('2023-08-01')).toBe('UNKNOWN');
});

test('recognised resettlement is counted on its own permit while a different § 23(2) period is not reclassified', () => {
  const result = (protectedEarlier: boolean) =>
    pathway('R05', {
      firstEntry: '2019-01-01',
      permits: [
        {
          kind: 'resettlement',
          from: '2019-01-01',
          protectedResettlement: protectedEarlier,
        },
        {
          kind: 'resettlement',
          from: '2024-01-01',
          protectedResettlement: true,
        },
      ],
      settlement: { resettlementWithdrawalGrounds: false },
    });
  expect(result(true).checks[0].status).toBe('MET');
  expect(result(false).checks[0].status).toBe('NOT_MET');
  expect(
    result(false).checks.find((c) => c.id === 'DE-C24-title')?.status,
  ).toBe('MET');
});
