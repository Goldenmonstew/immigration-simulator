import { describe, expect, test } from 'vitest';
import type { DeFullRequest } from '../src/germany-full';
import {
  germanFamilyLivelihoodException,
  mobilityTime,
  settlementChecks,
  type DeSettlementAnswers,
} from '../src/germany-settlement';

const day = '2026-11-23';
function at(
  route: string,
  id: string,
  settlement: DeSettlementAnswers,
  other: Partial<DeFullRequest> = {},
) {
  const row = settlementChecks(route, {
    simulationDate: day,
    settlement,
    ...other,
  }).find((c) => c.id === 'DE-' + id);
  expect(row?.sources.length).toBeGreaterThan(0);
  if (row?.status === 'UNKNOWN')
    expect(row.pendingDetails?.length).toBeGreaterThan(0);
  return row?.status;
}

describe('skilled settlement, German families and refugees', () => {
  test('own pension ledger at the 24- and 36-month boundaries; equivalent provision belongs to the applicant', () => {
    expect(at('R02', 'C15', { skilledQualification: true })).toBe('MET');
    expect(at('R02', 'C15', { skilledQualification: false })).toBe('NOT_MET');
    expect(at('R02', 'C16', { currentSkilledPost: 'research' })).toBe('MET');
    expect(at('R02', 'C16', { currentSkilledPost: 'proposed' })).toBe(
      'NOT_MET',
    );
    for (const [trained, months, expected] of [
      [true, 23, 'NOT_MET'],
      [true, 24, 'MET'],
      [false, 35, 'NOT_MET'],
      [false, 36, 'MET'],
      [undefined, 23, 'NOT_MET'],
      [undefined, 24, 'UNKNOWN'],
      [undefined, 36, 'MET'],
    ] as const) {
      expect(
        at(
          'R02',
          'C17',
          {},
          { trainedInGermany: trained, contributionMonths: months },
        ),
      ).toBe(expected);
    }
    expect(
      at(
        'R02',
        'C17',
        { skilledAlternativePension: 'accepted' },
        { contributionMonths: 0 },
      ),
    ).toBe('MET');
    expect(
      at(
        'R02',
        'C17',
        { skilledAlternativePension: 'pending' },
        { contributionMonths: 0 },
      ),
    ).toBe('UNKNOWN');
    expect(
      at(
        'R02',
        'C17',
        {},
        { simulationDate: '2024-02-29', contributionMonths: 36 },
      ),
    ).toBe('UNKNOWN');
  });
  test('initial skilled permit salary first applies on the 45th birthday and only in the sourced calendar year', () => {
    const facts = {
      appliedOn: day,
      jobAndQualificationRecognised: true,
      occupationalLicenceAndBA: true,
      genuineOfferConfirmed: true,
      adequatePension: false,
    };
    const run = (birthDate: string, salary: number, date = day) =>
      at(
        'R02',
        'C16-initial',
        {
          initialSkilledPermit: {
            ...facts,
            appliedOn: date,
            annualGrossSalary: salary,
          },
        },
        { birthDate },
      );
    expect(run('1981-11-24', 0)).toBe('MET');
    expect(run('1981-11-23', 55769.99)).toBe('NOT_MET');
    expect(run('1981-11-23', 55770)).toBe('MET');
    expect(run('1981-11-23', 55770, '2027-01-01')).toBe('UNKNOWN');
  });
  test('German family life, unmarried minor in parental care and the narrow personal-income exception', () => {
    const a: DeSettlementAnswers = {
      germanFamilyBasis: 'parent',
      germanFamilyLifeInGermany: true,
      germanChildBirthDate: '2008-11-24',
      familyChildUnmarried: true,
      parentCareRecognised: true,
      germanFamilyIncomeException: 'parent-own-income',
      parentOwnIncomeSufficient: true,
      householdShortfallOnlyGermanMembers: true,
    };
    expect(at('R04', 'C22', a)).toBe('MET');
    expect(at('R04', 'C22', { ...a, germanFamilyLifeInGermany: false })).toBe(
      'NOT_MET',
    );
    expect(at('R04', 'C22', { ...a, germanChildBirthDate: '2008-11-23' })).toBe(
      'NOT_MET',
    );
    expect(
      at('R04', 'C22', {
        ...a,
        germanChildBirthDate: '2006-11-23',
        continuedFamilyBasis: 'accepted',
      }),
    ).toBe('MET');
    expect(
      germanFamilyLivelihoodException({ simulationDate: day, settlement: a }),
    ).toBe(true);
    expect(
      germanFamilyLivelihoodException({
        simulationDate: day,
        settlement: { ...a, germanFamilyBasis: 'spouse' },
      }),
    ).toBe(false);
    expect(
      germanFamilyLivelihoodException({
        simulationDate: day,
        settlement: { ...a, householdShortfallOnlyGermanMembers: undefined },
      }),
    ).toBeUndefined();
  });
  test('qualifying resettlement excludes withdrawal grounds; inter-agency notice differs between bands', () => {
    expect(
      at('R05', 'C24-title', {
        protectionTitle: 'section23-4',
        resettlementWithdrawalGrounds: false,
      }),
    ).toBe('MET');
    expect(
      at('R05', 'C24-title', {
        protectionTitle: 'section23-4',
        resettlementWithdrawalGrounds: true,
      }),
    ).toBe('NOT_MET');
    expect(at('R05', 'C24-title', { protectionTitle: 'other' })).toBe(
      'NOT_MET',
    );
    expect(
      at(
        'R05',
        'C24-title',
        {},
        { permits: [{ kind: 'subsidiary', from: '2025-01-01' }] },
      ),
    ).toBe('NOT_MET');
    expect(at('R05', 'C24-notice', { bamfNotice: 'deprivation' })).toBe(
      'NOT_MET',
    );
    expect(at('R05-fast', 'C24-notice', { bamfNotice: 'deprivation' })).toBe(
      'MET',
    );
    expect(at('R05-fast', 'C24-notice', { bamfNotice: 'withdrawal' })).toBe(
      'NOT_MET',
    );
    expect(
      at('R05', 'C24-notice', { bamfNotice: 'only-applicant-unaware' }),
    ).toBe('UNKNOWN');
    expect(at('R05', 'C24-notice', { bamfNotice: 'confirmed-none' })).toBe(
      'MET',
    );
  });
  test('Berlin benefits must be strictly below the threshold; no national quantitative default', () => {
    const run = (
      route: string,
      benefit: number,
      berlin: boolean,
      birthDate = '1990-05-05',
    ) =>
      at(
        route,
        route === 'R05' ? 'C25' : 'C26',
        {
          refugeeIncome: {
            berlin,
            monthlySgbIIXII: benefit,
            totalMonthlyIncome: 1000,
            sustainable: true,
          },
        },
        { birthDate },
      );
    expect(run('R05', 499.99, true)).toBe('MET');
    expect(run('R05', 500, true)).toBe('NOT_MET');
    expect(run('R05-fast', 249.99, true)).toBe('MET');
    expect(run('R05-fast', 250, true)).toBe('NOT_MET');
    expect(run('R05', 0, false)).toBe('UNKNOWN');
    // Birth cohort 1960: 65 years plus 16 months = 66 years and 4 months.
    expect(run('R05', 500, true, '1960-07-23')).toBe('MET');
    expect(run('R05', 500, true, '1960-07-24')).toBe('NOT_MET');
    expect(run('R05-fast', 500, true, '1960-07-23')).toBe('NOT_MET');
    expect(
      at('R05', 'C25', { refugeeIncome: { medicalExemption: 'accepted' } }),
    ).toBe('MET');
    expect(
      at('R05-fast', 'C26', {
        refugeeIncome: { medicalExemption: 'accepted' },
      }),
    ).toBe('UNKNOWN');
  });
});

describe('EU long-term residence', () => {
  const good: DeSettlementAnswers = {
    euExcludedStatus: 'none',
    euRegularIncome: true,
    euTaxDutiesFulfilled: true,
    euWorkLicences: 'not-required',
    euRetirementProvision: 'adequate-cohabiting-spouse',
    euCareCover: 'equivalent-accepted',
  };
  const bad: DeSettlementAnswers = {
    euExcludedStatus: 'pending-protection',
    euRegularIncome: false,
    euTaxDutiesFulfilled: false,
    euWorkLicences: 'missing',
    euRetirementProvision: 'inadequate',
    euCareCover: 'inadequate',
  };
  test.each([
    'C27',
    'C29-income',
    'C29-tax',
    'C29-work',
    'C30-pension',
    'C30-care',
  ])('%s independently checks both states', (id) => {
    expect(at('R06', id, good)).toBe('MET');
    expect(at('R06', id, bad)).toBe('NOT_MET');
    expect(at('R06', id, {})).toBe('UNKNOWN');
  });
  test('appropriate pension provision can be established below the statutory maximum request', () => {
    expect(at('R06', 'C30-pension', {}, { contributionMonths: 60 })).toBe(
      'MET',
    );
    expect(at('R06', 'C30-pension', {}, { contributionMonths: 59 })).toBe(
      'UNKNOWN',
    );
    expect(
      at(
        'R06',
        'C30-pension',
        { euRetirementProvision: 'adequate-own' },
        { contributionMonths: 59 },
      ),
    ).toBe('MET');
  });
  type Mobility = NonNullable<DeSettlementAnswers['euMobility']>;
  const run = (facts?: Mobility, date = '2026-11-23') =>
    mobilityTime({ simulationDate: date, settlement: { euMobility: facts } });
  const base: Mobility = {
    personalScope: true,
    immediatelyPriorOtherStateBlueCard: true,
    germanBlueSince: '2024-11-23',
    periods: [
      { kind: 'other-eu-blue', from: '2021-11-23', until: '2024-11-23' },
      { kind: 'german-blue', from: '2024-11-23', until: day },
    ],
  };
  test('five years across the EU include two German Blue Card years and require an immediate transfer', () => {
    expect(run(base)).toBe(true);
    expect(
      run({
        ...base,
        periods: [{ kind: 'research', from: '2020-11-23', until: day }],
      }),
    ).toBeUndefined();
    expect(run(base, '2026-11-22')).toBe(false);
    expect(run({ ...base, germanBlueSince: '2024-11-24' })).toBe(false);
    expect(run({ ...base, immediatelyPriorOtherStateBlueCard: false })).toBe(
      false,
    );
    expect(run({ ...base, personalScope: undefined })).toBeUndefined();
    expect(run({ ...base, periods: undefined })).toBeUndefined();
    expect(run()).toBe(false);
  });
  test('foreign study counts at half and twelve continuous months outside the EU pause this clock', () => {
    const withStudy = (from: string): Mobility => ({
      ...base,
      periods: [
        { kind: 'study', from, until: '2022-11-23' },
        { kind: 'other-eu-blue', from: '2022-11-23', until: '2024-11-23' },
        { kind: 'german-blue', from: '2024-11-23', until: day },
      ],
    });
    expect(run(withStudy('2020-11-23'))).toBe(true);
    expect(run(withStudy('2020-11-24'))).toBe(false);
    const withTrip = (from: string): Mobility => ({
      ...base,
      periods: [
        { kind: 'other-eu-blue', from: '2019-11-23', until: from },
        { kind: 'outside-eu', from, until: '2024-02-01' },
        { kind: 'other-eu-blue', from: '2024-02-01', until: '2024-11-23' },
        { kind: 'german-blue', from: '2024-11-23', until: day },
      ],
    });
    expect(run(withTrip('2023-02-01'))).toBe(true);
    expect(run(withTrip('2023-01-31'))).toBe(false);
  });
});

describe('humanitarian, business, young people and other settlement paths', () => {
  test('humanitarian permit and five years including a preceding asylum procedure; decision remains separate', () => {
    const r: Partial<DeFullRequest> = {
      firstEntry: '2020-01-01',
      trips: [],
      permits: [
        { kind: 'asylum', from: '2021-11-23', to: '2023-05-09' },
        { kind: 'subsidiary', from: '2023-05-10' },
      ],
    };
    expect(at('R09', 'C32-title', {}, r)).toBe('MET');
    expect(at('R09', 'C32-title', { humanitarianCurrentTitle: false }, r)).toBe(
      'NOT_MET',
    );
    expect(at('R09', 'C32-time', {}, r)).toBe('MET');
    expect(
      at('R09', 'C32-time', {}, { ...r, simulationDate: '2026-11-22' }),
    ).toBe('NOT_MET');
    expect(
      at('R09', 'C32-discretion', { humanitarianDecision: 'accepted' }, r),
    ).toBe('MET');
    expect(at('R09', 'C32-discretion', {}, r)).toBe('UNKNOWN');
  });
  test('entrepreneurial permit, three actual years and two independent authority assessments', () => {
    const good: DeSettlementAnswers = {
      businessPermit: 'entrepreneur',
      continuousBusinessSince: '2023-11-23',
      businessSustainability: 'accepted',
      businessGrant: 'accepted',
    };
    const bad: DeSettlementAnswers = {
      businessPermit: 'freelance',
      continuousBusinessSince: '2023-11-24',
      businessSustainability: 'refused',
      businessGrant: 'refused',
    };
    for (const id of [
      'C34-title',
      'C34-time',
      'C35-business',
      'C35-discretion',
    ]) {
      expect(at('R10', id, good)).toBe('MET');
      expect(at('R10', id, bad)).toBe('NOT_MET');
      expect(at('R10', id, {})).toBe('UNKNOWN');
    }
    const first = {
      appliedOn: day,
      economicOrRegionalNeed: true,
      positiveEconomicImpact: true,
      financingSecured: true,
      adequatePension: false,
    };
    expect(
      at(
        'R10',
        'C34-initial',
        { initialBusinessPermit: first },
        { birthDate: '1981-11-23' },
      ),
    ).toBe('MET');
    expect(
      at(
        'R10',
        'C34-initial',
        { initialBusinessPermit: first },
        { birthDate: '1981-11-22' },
      ),
    ).toBe('NOT_MET');
  });
  test('a minor must have five years on the sixteenth birthday, an adult on the decision day', () => {
    const a: DeSettlementAnswers = {
      childPermitBasis: 'family',
      childPermitSince: '2020-11-23',
      childForeignSchoolDays: 0,
    };
    expect(at('R11', 'C36-title', a)).toBe('MET');
    expect(
      at(
        'R11',
        'C36-time',
        { ...a, childPermitSince: '2020-11-23' },
        { birthDate: '2002-11-23' },
      ),
    ).toBe('NOT_MET');
    expect(at('R11', 'C36-title', { ...a, childPermitBasis: 'other' })).toBe(
      'NOT_MET',
    );
    expect(
      at(
        'R11',
        'C36-title',
        {
          ...a,
          childPermitBasis: 'humanitarian',
          childHumanitarianReferral: 'accepted',
        },
        { birthDate: '2005-11-23', firstEntry: '2023-11-23' },
      ),
    ).toBe('NOT_MET');
    expect(at('R11', 'C36-time', a, { birthDate: '2009-11-23' })).toBe('MET');
    expect(
      at(
        'R11',
        'C36-time',
        { ...a, childPermitSince: '2020-11-24' },
        { birthDate: '2009-11-23' },
      ),
    ).toBe('NOT_MET');
    expect(
      at(
        'R11',
        'C36-time',
        { ...a, childPermitSince: '2021-11-23' },
        { birthDate: '2008-11-23' },
      ),
    ).toBe('MET');
    expect(
      at(
        'R11',
        'C36-time',
        { ...a, childPermitSince: '2021-11-23', childForeignSchoolDays: 1 },
        { birthDate: '2008-11-23' },
      ),
    ).toBe('NOT_MET');
    expect(at('R11', 'C36-language', {}, { birthDate: '2009-11-23' })).toBe(
      'MET',
    );
    expect(
      at(
        'R11',
        'C36-language',
        { childLanguageB1: false },
        { birthDate: '2008-11-23' },
      ),
    ).toBe('NOT_MET');
    expect(
      at(
        'R11',
        'C36-language',
        { childLanguageB1: false, childLanguageMedicalWaiver: 'accepted' },
        { birthDate: '2008-11-23' },
      ),
    ).toBe('MET');
    expect(
      at(
        'R11',
        'C36-livelihood',
        { childEducation: 'university' },
        { birthDate: '2008-11-23' },
      ),
    ).toBe('MET');
    expect(
      at(
        'R11',
        'C36-livelihood',
        { childEducation: 'none', childSecureLivelihood: false },
        { birthDate: '2008-11-23' },
      ),
    ).toBe('NOT_MET');
    expect(
      at('R11', 'C37-aid', {
        childDependsOnSgbIIXIIorVIII: true,
        childEducation: 'university',
      }),
    ).toBe('UNKNOWN');
    expect(
      at('R11', 'C37-aid', {
        childDependsOnSgbIIXIIorVIII: true,
        childEducation: 'vocational',
      }),
    ).toBe('MET');
    expect(
      at('R11', 'C37-aid', {
        childDependsOnSgbIIXIIorVIII: true,
        childEducation: 'none',
        childExceptionDecision: 'refused',
      }),
    ).toBe('NOT_MET');
  });
  test.each([
    ['fine', 90],
    ['prison', 3],
    ['youth', 6],
  ] as const)(
    'intentional %s conviction trips §35(3) at %s in the last three years',
    (kind, threshold) => {
      const run = (
        amount: number,
        judgmentDate: string,
        decision?: 'accepted' | 'refused',
      ) =>
        at('R11', 'C37-conduct', {
          childJudgments: [{ kind, amount, judgmentDate, intentional: true }],
          childYouthSentenceDeferred: false,
          childPersonalExpulsionInterest: false,
          childExceptionDecision: decision,
        });
      expect(run(threshold - 1, day)).toBe('MET');
      expect(run(threshold, '2023-11-24', 'refused')).toBe('NOT_MET');
      expect(run(threshold, '2023-11-24')).toBe('UNKNOWN');
      expect(run(threshold, '2023-11-23')).toBe('MET');
      expect(run(threshold, day, 'accepted')).toBe('MET');
    },
  );
  test('spouse hours, highly qualified academics, civil servants and former-spouse maintenance', () => {
    const cases: [string, string, DeSettlementAnswers, DeSettlementAnswers][] =
      [
        [
          'R12',
          'C38-family',
          {
            spouseHoldsSkilledSettlement: true,
            spousalCommunityContinues: true,
          },
          { spouseHoldsSkilledSettlement: false },
        ],
        [
          'R12',
          'C38-time',
          { qualifyingSpousePermitSince: '2023-11-23' },
          { qualifyingSpousePermitSince: '2023-11-24' },
        ],
        [
          'R12',
          'C38-work',
          { regularWeeklyHours: 20 },
          { regularWeeklyHours: 19.99 },
        ],
        [
          'R13',
          'C39-post',
          {
            highlyQualifiedAcademic: true,
            exceptionalAcademicPost: 'accepted',
          },
          { highlyQualifiedAcademic: false },
        ],
        [
          'R13',
          'C39-consent',
          { stateConsent: 'not-required' },
          { stateConsent: 'refused' },
        ],
        [
          'R13',
          'C40',
          { integrationProspects: 'accepted' },
          { integrationProspects: 'refused' },
        ],
        [
          'R14',
          'C41-appointment',
          { civilAppointment: 'beamter' },
          { civilAppointment: 'employee' },
        ],
        [
          'R14',
          'C41-time',
          { civilServicePermitSince: '2023-11-23' },
          { civilServicePermitSince: '2023-11-24' },
        ],
        [
          'R15',
          'C42-family',
          {
            formerFamilyLifeEnded: day,
            formerSpousePermanentTitle: 'eu-long-term',
          },
          { formerFamilyLifeEnded: '2026-11-24' },
        ],
        [
          'R15',
          'C42-maintenance',
          { formerSpouseMaintenance: 'own-funds-enforceable-and-sufficient' },
          { formerSpouseMaintenance: 'third-party' },
        ],
      ];
    for (const [route, id, yes, no] of cases) {
      expect(at(route, id, yes)).toBe('MET');
      expect(at(route, id, no)).toBe('NOT_MET');
      expect(at(route, id, {})).toBe('UNKNOWN');
    }
  });
});
