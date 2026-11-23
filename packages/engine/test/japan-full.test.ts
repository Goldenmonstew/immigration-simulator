import { describe, expect, test } from 'vitest';
import { evaluateJapan, evaluateJapanFull } from '../src';
import type {
  JpFullNaturalisationRoute,
  JpFullPathway,
  JpFullPrRoute,
  JpFullReentryRequest,
  JpFullRequest,
  JpHspSnapshot,
  JpNaturalisationEvidence,
  JpPrCommonEvidence,
  JpPrRequest,
} from '../src';

const base = {
  simulationDate: '2027-04-01',
  stayStart: '2017-04-01',
  dateOfBirth: '1990-05-01',
  trips: [],
  locale: 'en',
} satisfies JpFullRequest;

const general = { route: 'general', statusStart: '2022-04-01' } as const;
const prEvidence = {
  japaneseCitizen: false,
  inJapan: true,
  status: {
    kind: 'engineer',
    expiresOn: '2028-04-01',
    grantedPeriodMonths: 60,
    fitsCurrentCriteria: true,
  },
  family: { relativeStatus: 'other', relation: 'other' },
  protectionRecognition: 'none',
  internationalProtectionConfirmed: false,
  goodConductConfirmed: true,
  criminalHistory: 'none',
  nationalInterestConfirmed: true,
  statusActivitiesCompliant: true,
  residenceCardDutiesCompliant: true,
  affiliationNotices: [],
  tax: 'on-time',
  pension: 'lawful-exemption',
  publicHealthInsurance: 'on-time',
  addressNotices: [],
  actualAddressAndRegister: true,
  livelihoodConfirmed: true,
  householdIncomeConfirmed: true,
  pensionComparisonConfirmed: true,
  publicBurdenConfirmedAcceptable: true,
  publicHealthCleared: true,
  otherLandingGroundsCleared: true,
  guarantor: 'japanese-resident',
  guarantorDocumentsReady: true,
  japaneseB1Confirmed: true,
  integrationKnowledgeConfirmed: true,
  schoolChildren: [
    { bornOn: '2015-04-02', attendance: 'primary-or-junior-high' },
  ],
  filer: 'self',
  documentsReady: true,
  photoReady: true,
  specialPermission: { kind: 'none' },
  feeReduction: 'not-requested',
  integratedCard: {
    requested: true,
    immigrationChargeApplies: true,
    jLisChargeApplies: true,
    electronicCertificate: true,
  },
} satisfies JpPrCommonEvidence;

const natEvidence = {
  japaneseCitizen: false,
  inJapan: true,
  lawfulDomicile: true,
  capacityUnderHomeLaw: true,
  goodConductConfirmed: true,
  criminalOrTrafficHistory: 'none',
  livelihoodConfirmed: true,
  nationality: 'all-nationalities-lost-on-naturalisation',
  constitutionalConditionConfirmed: true,
  integratedIntoJapanConfirmed: true,
  japaneseLanguage: { authorityConfirmed: true },
  requiredInterviewAndAssessmentComplete: true,
  tax: 'on-time',
  pension: 'lawful-exemption',
  publicHealthInsurance: 'on-time',
  residenceEvidenceReady: true,
  healthInsuranceEvidenceReady: true,
  motivationReady: true,
  oathReady: true,
  filer: 'self',
  filedAtJurisdictionalBureau: true,
  writtenDocumentsAndTranslationsReady: true,
} satisfies JpNaturalisationEvidence;

const pr = (
  route: JpFullPrRoute = general,
  evidence: JpPrCommonEvidence = prEvidence,
  request: Partial<JpFullRequest> = {},
) =>
  evaluateJapanFull({
    ...base,
    ...request,
    permanentResidence: { routes: [route], evidence },
  }).columns[0].pathways[0];

const nat = (
  route: JpFullNaturalisationRoute = { route: 'general' },
  evidence: JpNaturalisationEvidence = natEvidence,
  request: Partial<JpFullRequest> = {},
) =>
  evaluateJapanFull({
    ...base,
    ...request,
    naturalisation: { routes: [route], evidence },
  }).columns[0].pathways[0];

const reentry = (
  route: JpFullReentryRequest,
  request: Partial<JpFullRequest> = {},
) =>
  evaluateJapanFull({ ...base, ...request, reentry: [route] }).columns[0]
    .pathways[0];

const condition = (path: JpFullPathway, suffix: string) =>
  path.checks.find(
    ({ id }) => id === `${path.id.split('.').slice(0, 2).join('.')}.${suffix}`,
  )!;
const status = (path: JpFullPathway, suffix: string) =>
  condition(path, suffix).status;

describe('permanent residence', () => {
  test('excludes Intra-company Transferee from qualifying stay only under the revised guideline', () => {
    const evidence = {
      ...prEvidence,
      status: { ...prEvidence.status, kind: 'transfer' },
    } satisfies JpPrCommonEvidence;
    const stayStart = '2012-04-01';
    const revised = pr(general, evidence, { stayStart });
    expect(status(revised, 'continuous-stay')).toBe('MET');
    expect(status(revised, 'qualifying-status-stay')).toBe('NOT_MET');
    expect(revised.status).toBe('NOT_MET');
    expect(revised.earliestDate).toBeUndefined();
    expect(
      status(
        pr({ ...general, statusStart: '2022-03-31' }, evidence, {
          stayStart,
          applicationDate: '2027-03-31',
        }),
        'qualifying-status-stay',
      ),
    ).toBe('MET');
  });

  test('moves Saturday filing to the next open day and preserves the time result', () => {
    const result = pr(general, prEvidence, { simulationDate: '2027-04-03' });
    expect(result).toMatchObject({
      status: 'MET',
      earliestDate: '2027-04-05',
      timeStatus: 'MET',
      timeEarliestDate: '2027-04-03',
    });
  });

  test.each([undefined, true])(
    'rechecks lawful filing on the rescheduled day after expiry (original validity: %s)',
    (valid) => {
      const result = pr(
        general,
        {
          ...prEvidence,
          status: {
            ...prEvidence.status,
            valid,
            expiresOn: '2027-04-04',
            timelyRenewalPending: false,
          },
        },
        { simulationDate: '2027-04-03' },
      );
      expect(status(result, 'lawful-filing-status')).toBe('NOT_MET');
      expect(result.status).toBe('NOT_MET');
      expect(result.timeEarliestDate).toBe('2027-04-03');
      expect(result.earliestDate).toBeUndefined();
    },
  );

  test('rechecks presence in Japan on the rescheduled filing day', () => {
    const result = pr(
      general,
      prEvidence,
      {
        simulationDate: '2027-04-03',
        trips: [{ departed: '2027-04-04', returned: '2027-04-07' }],
      },
    );
    expect(status(result, 'filing-in-japan')).toBe('NOT_MET');
    expect(status(result, 'lawful-filing-status')).toBe('NOT_MET');
    expect(result.status).toBe('NOT_MET');
    expect(result.timeEarliestDate).toBe('2027-04-03');
    expect(result.earliestDate).toBeUndefined();
  });

  test('leaves the filing date open when the next weekday may be a holiday', () => {
    const result = pr(general, prEvidence, { simulationDate: '2028-03-18' });
    expect(result.timeEarliestDate).toBe('2028-03-18');
    expect(result.earliestDate).toBeUndefined();
    expect(result.pendingDetails).toContain('PD-370');
  });

  test.each([
    [undefined, 'UNKNOWN', undefined],
    [false, 'NOT_MET', undefined],
    [true, 'MET', '2027-04-01'],
  ] as const)(
    'assesses a long absence with a valid re-entry permit using the authority’s finding (%s)',
    (absenceReasonsConfirmedReasonable, expected, earliestDate) => {
      const result = pr(
        general,
        {
          ...prEvidence,
          nationalInterestConfirmed:
            absenceReasonsConfirmedReasonable === true ? true : undefined,
          absenceReasonsConfirmedReasonable,
        },
        {
          stayStart: '2012-04-01',
          trips: [
            {
              departed: '2021-05-01',
              returned: '2021-12-01',
              reentryPermit: true,
            },
          ],
        },
      );
      expect(status(result, 'continuous-stay')).toBe('MET');
      expect(status(result, 'qualifying-status-stay')).toBe('MET');
      expect(status(result, 'single-absence')).toBe(expected);
      expect(status(result, 'total-absence')).toBe('MET');
      expect(result.timeStatus).toBe('UNKNOWN');
      expect(result.status).toBe(expected);
      expect(result.earliestDate).toBe(earliestDate);
      if (expected === 'UNKNOWN') {
        const absence = condition(result, 'single-absence');
        expect(absence.pendingDetails).toEqual(['PD-360']);
        expect(absence.sources.map(({ srcId }) => srcId)).toEqual([
          'SRC-114',
          'SRC-115',
        ]);
      }
    },
  );

  const cases = [
    ['lawful-filing-status', { inJapan: false }, 'NOT_MET'],
    ['filing-in-japan', { inJapan: false }, 'NOT_MET'],
    [
      'longest-period',
      { status: { ...prEvidence.status, grantedPeriodMonths: 12 } },
      'NOT_MET',
    ],
    ['good-conduct', { goodConductConfirmed: false }, 'NOT_MET'],
    ['criminal-record', { criminalHistory: 'fine' }, 'NOT_MET'],
    ['national-interest', { nationalInterestConfirmed: undefined }, 'UNKNOWN'],
    ['immigration-duties', { statusActivitiesCompliant: false }, 'NOT_MET'],
    ['tax', { tax: 'late-paid' }, 'NOT_MET'],
    ['pension-payments', { pension: 'unpaid' }, 'NOT_MET'],
    ['public-health-insurance', { publicHealthInsurance: 'unpaid' }, 'NOT_MET'],
    ['address-registration', { actualAddressAndRegister: false }, 'NOT_MET'],
    ['independent-livelihood', { livelihoodConfirmed: false }, 'NOT_MET'],
    ['household-income', { householdIncomeConfirmed: undefined }, 'UNKNOWN'],
    ['projected-pension', { pensionComparisonConfirmed: undefined }, 'UNKNOWN'],
    [
      'public-burden',
      {
        publicBurdenConfirmedAcceptable: undefined,
        publicAssistance: 'received',
      },
      'UNKNOWN',
    ],
    ['public-health', { publicHealthCleared: false }, 'NOT_MET'],
    ['landing-and-security', { otherLandingGroundsCleared: false }, 'NOT_MET'],
    [
      'status-criteria',
      { status: { ...prEvidence.status, fitsCurrentCriteria: false } },
      'NOT_MET',
    ],
    ['guarantor', { guarantor: 'none' }, 'NOT_MET'],
    ['japanese-language', { japaneseB1Confirmed: undefined }, 'UNKNOWN'],
    ['life-rules', { integrationKnowledgeConfirmed: undefined }, 'UNKNOWN'],
    [
      'school-attendance',
      {
        schoolChildren: [{ bornOn: '2015-04-02', attendance: 'not-attending' }],
      },
      'NOT_MET',
    ],
    ['filing-documents', { documentsReady: false }, 'NOT_MET'],
    ['integrated-card-fee', { integratedCard: { requested: true } }, 'UNKNOWN'],
  ] satisfies [string, Partial<JpPrCommonEvidence>, string][];
  test.each(cases)(
    '%s records a positive and an adverse or unconfirmed result',
    (id, evidence, expected) => {
      const good = condition(pr(), id);
      expect(good).toMatchObject({ status: 'MET' });
      expect(good.applicable).toBeUndefined();
      expect(
        condition(pr(general, { ...prEvidence, ...evidence }), id).status,
      ).toBe(expected);
    },
  );

  test('formal requirements, adverse factors and unknowns produce distinct outcomes', () => {
    expect(pr().status).toBe('MET');
    expect(
      pr(general, { ...prEvidence, nationalInterestConfirmed: undefined })
        .status,
    ).toBe('UNKNOWN');
    expect(
      pr(general, {
        ...prEvidence,
        nationalInterestConfirmed: undefined,
        goodConductConfirmed: false,
      }).status,
    ).toBe('NOT_MET');
    expect(
      pr(general, { ...prEvidence, criminalHistory: 'fine' }),
    ).toMatchObject({
      status: 'MET',
      timeStatus: 'MET',
      timeEarliestDate: '2027-04-01',
    });
    expect(pr(general, { ...prEvidence, japaneseCitizen: true }).status).toBe(
      'NOT_APPLICABLE',
    );
    expect(pr(general, {}, { stayStart: '2025-01-01' })).toMatchObject({
      status: 'NOT_MET',
      timeStatus: 'FUTURE',
    });
  });

  test.each([
    ['2024-06-09', undefined],
    ['2024-06-10', 8_000],
    ['2025-03-31', 8_000],
    ['2025-04-01', 10_000],
    ['2026-09-30', 10_000],
    ['2026-10-01', 200_000],
    ['2027-04-01', 200_000],
  ])(
    'selects the fee by the actual reception date %s',
    (applicationDate, amount) => {
      const c = condition(
        pr(general, prEvidence, { applicationDate }),
        'approval-fee',
      );
      expect(c.fee?.amount).toBe(amount);
      expect(c.status).toBe(amount === undefined ? 'UNKNOWN' : 'MET');
    },
  );

  test('April filings are transitional only if still pending on the revision date', () => {
    const before = pr(general, prEvidence, { applicationDate: '2026-03-31' });
    expect(condition(before, 'household-income').applicable).toBe(false);
    expect(condition(before, 'public-burden').applicable).toBe(false);
    const transition = { applicationDate: '2026-04-01' };
    expect(
      status(pr(general, prEvidence, transition), 'household-income'),
    ).toBe('UNKNOWN');
    expect(
      condition(
        pr(
          general,
          { ...prEvidence, pendingOnIncomeReviewDate: false },
          transition,
        ),
        'household-income',
      ).applicable,
    ).toBe(false);
    const active = pr(
      general,
      { ...prEvidence, pendingOnIncomeReviewDate: true },
      transition,
    );
    expect(status(active, 'household-income')).toBe('MET');
    expect(status(active, 'public-burden')).toBe('MET');
    expect(condition(active, 'projected-pension').applicable).toBe(false);
    expect(condition(pr(), 'integrated-card-fee').fee).toEqual({
      currency: 'JPY',
      amount: 2_700,
    });
  });

  test('counts eligible household income, excludes ineligible pay and counts nonresident dependants', () => {
    const result = pr(general, {
      ...prEvidence,
      applicantAnnualIncomeYen: 4_000_000,
      householdIncomeConfirmed: undefined,
      household: [
        {
          relationship: 'shared-home-and-budget',
          incomeTreatment: 'eligible',
          annualIncomeYen: 2_000_000,
        },
        {
          relationship: 'shared-home-and-budget',
          incomeTreatment: 'nonqualifying-activity',
          annualIncomeYen: 900_000,
        },
        {
          relationship: 'shared-home-and-budget',
          incomeTreatment: 'parents-not-supporting-applicant',
          annualIncomeYen: 3_000_000,
        },
        { relationship: 'nonresident-dependant', annualIncomeYen: 700_000 },
      ],
    });
    expect(condition(result, 'household-income')).toMatchObject({
      status: 'UNKNOWN',
      pendingDetails: ['PD-361'],
      explanation: expect.stringContaining(
        'size 5; reported includable annual income JPY 6000000',
      ),
    });
    expect(condition(result, 'household-income').explanation).toContain(
      'living-cost adjustment',
    );
  });

  test('uses nominal grant length and all three conditions of the transition', () => {
    const current = { ...prEvidence.status, grantedPeriodMonths: 36 } as const;
    const route = (
      statusEvidence: JpPrCommonEvidence['status'],
      applicationDate?: string,
    ) =>
      status(
        pr(
          general,
          { ...prEvidence, status: statusEvidence },
          { applicationDate },
        ),
        'longest-period',
      );
    expect(route(current, '2027-03-31')).toBe('MET');
    const transition = {
      ...current,
      heldThreeYearPeriodOnTransitionDay: true,
      firstApplicationAfterTransition: true,
      decisionOn: '2028-04-01',
      transitionPermitExpiresOn: '2028-04-01',
    };
    expect(route(transition)).toBe('MET');
    expect(route({ ...transition, decisionOn: '2028-04-02' })).toBe('NOT_MET');
    expect(route({ ...transition, decisionOn: undefined })).toBe('UNKNOWN');
    expect(
      route({ ...transition, firstApplicationAfterTransition: false }),
    ).toBe('NOT_MET');
    expect(route({ kind: 'entertainer', grantedPeriodMonths: 36 })).toBe('MET');
    expect(route({ kind: 'hsp2', grantedPeriodMonths: 'indefinite' })).toBe(
      'MET',
    );
  });

  test.each([
    ['addressNotices', 'address-registration'],
    ['affiliationNotices', 'immigration-duties'],
  ] as const)(
    '%s distinguishes an omitted filing date from late or unfiled notices',
    (notices, id) => {
      const eventOn = '2027-03-01';
      const assess = (notifiedOn?: string | null, event = eventOn) =>
        condition(
          pr(general, {
            ...prEvidence,
            [notices]: [
              { eventOn: event, ...(notifiedOn !== undefined ? { notifiedOn } : {}) },
            ],
          }),
          id,
        );
      expect(assess()).toMatchObject({
        status: 'UNKNOWN',
        pendingDetails: ['PD-366'],
      });
      expect(assess('2027-03-15').status).toBe('MET');
      expect(assess('2027-03-16').status).toBe('NOT_MET');
      expect(assess(null).status).toBe('NOT_MET');
      expect(assess(null, '2027-03-18').status).toBe('UNKNOWN');
    },
  );

  test('distinguishes first school cohorts born April 1 and 2', () => {
    const school = (
      bornOn: string,
      attendance: 'alternative' | 'not-attending',
    ) =>
      condition(
        pr(general, {
          ...prEvidence,
          schoolChildren: [{ bornOn, attendance }],
        }),
        'school-attendance',
      );
    expect(school('2021-04-01', 'not-attending').status).toBe('NOT_MET');
    expect(school('2021-04-02', 'not-attending').applicable).toBe(false);
    expect(school('2012-04-01', 'not-attending').applicable).toBe(false);
    expect(school('2012-04-02', 'alternative').status).toBe('UNKNOWN');
    const language = (qualifyingSchoolYears: number) =>
      condition(
        pr(general, {
          ...prEvidence,
          qualifyingSchoolYears,
          japaneseB1Confirmed: undefined,
        }),
        'japanese-language',
      );
    expect(language(6).applicable).toBe(false);
    expect(language(5).status).toBe('UNKNOWN');
  });

  test('checks the revised Business Manager thresholds and retains transitional uncertainty', () => {
    const revised = {
      subjectToRevisedCriteria: true,
      officeInJapan: true,
      eligibleEmployees: 1,
      assetsYen: 30_000_000,
      confirmedB2: true,
      relevantGraduateDegree: false,
      managementExperienceYears: 3,
      planProfessionallyConfirmed: true,
    };
    const checkManager = (businessManager: typeof revised) =>
      status(
        pr(general, {
          ...prEvidence,
          status: {
            ...prEvidence.status,
            kind: 'businessManager',
            fitsCurrentCriteria: undefined,
            businessManager,
          },
        }),
        'status-criteria',
      );
    expect(checkManager(revised)).toBe('MET');
    expect(checkManager({ ...revised, assetsYen: 29_999_999 })).toBe('NOT_MET');
    expect(checkManager({ ...revised, managementExperienceYears: 2 })).toBe(
      'NOT_MET',
    );
    expect(checkManager({ ...revised, subjectToRevisedCriteria: false })).toBe(
      'UNKNOWN',
    );
  });

  test('family exemption leaves criminal and public-burden evaluations and distinguishes plausible and approved reduction', () => {
    const evidence: JpPrCommonEvidence = {
      ...prEvidence,
      family: {
        relativeStatus: 'japanese',
        relation: 'spouse',
        genuineMarriage: true,
      },
      goodConductConfirmed: false,
      livelihoodConfirmed: false,
      criminalHistory: 'fine',
      publicBurdenConfirmedAcceptable: undefined,
      feeReduction: 'requested',
    };
    const route = { route: 'spouse', marriedLifeFrom: '2022-04-01' } as const;
    const result = pr(route, evidence);
    expect(status(result, 'qualifying-family')).toBe('MET');
    expect(condition(result, 'good-conduct').applicable).toBe(false);
    expect(condition(result, 'independent-livelihood').applicable).toBe(false);
    expect(status(result, 'criminal-record')).toBe('NOT_MET');
    expect(status(result, 'public-burden')).toBe('UNKNOWN');
    expect(status(result, 'fee-reduction')).toBe('UNKNOWN');
    expect(condition(result, 'approval-fee').fee).toEqual({
      currency: 'JPY',
      amount: 200_000,
      possibleReducedAmount: 20_000,
    });
    const approved = pr(route, { ...evidence, feeReduction: 'approved' });
    expect(status(approved, 'fee-reduction')).toBe('MET');
    expect(condition(approved, 'approval-fee').fee?.amount).toBe(20_000);
    expect(
      status(
        pr(route, {
          ...evidence,
          family: { ...evidence.family, genuineMarriage: false },
        }),
        'qualifying-family',
      ),
    ).toBe('NOT_MET');
  });

  test('child and birth routes distinguish eligible family, residence, filing and reporting', () => {
    const child: JpPrCommonEvidence = {
      ...prEvidence,
      family: { relativeStatus: 'permanent', relation: 'biological-child' },
    };
    expect(status(pr({ route: 'child' }, child), 'qualifying-family')).toBe(
      'MET',
    );
    expect(
      status(
        pr(
          { route: 'child' },
          {
            ...child,
            family: { relativeStatus: 'permanent', relation: 'other-adoption' },
          },
        ),
        'qualifying-family',
      ),
    ).toBe('UNKNOWN');
    const route = {
      route: 'child-birth',
      bornOn: '2026-11-02',
      bornInJapan: true,
      withoutLanding: true,
      heldAnotherStatus: false,
      birthRegisteredOn: '2026-11-16',
    } as const;
    const result = pr(
      route,
      { ...child, photoReady: false },
      { applicationDate: '2026-11-20' },
    );
    expect(status(result, 'birth-filing-window')).toBe('MET');
    expect(status(result, 'birth-acquisition')).toBe('MET');
    expect(status(result, 'birth-registration')).toBe('MET');
    expect(status(result, 'filing-documents')).toBe('MET');
    expect(condition(result, 'longest-period').applicable).toBe(false);
    expect(condition(result, 'approval-fee').fee?.amount).toBe(0);
    const late = pr(
      { ...route, birthRegisteredOn: '2026-11-17', bornInJapan: false },
      child,
      { applicationDate: '2026-12-03' },
    );
    expect(status(late, 'birth-filing-window')).toBe('NOT_MET');
    expect(status(late, 'birth-registration')).toBe('NOT_MET');
    expect(status(late, 'birth-acquisition')).toBe('NOT_MET');
  });

  test('omits the language factor for a Japan-born child changing from a PR family status', () => {
    const route = { route: 'child', bornInJapan: true } as const;
    const evidence = {
      ...prEvidence,
      status: { ...prEvidence.status, kind: 'prFamily' },
      family: { relativeStatus: 'permanent', relation: 'biological-child' },
      japaneseB1Confirmed: false,
      raisingParentB1Confirmed: true,
    } satisfies JpPrCommonEvidence;
    const result = pr(route, evidence);
    expect(status(result, 'qualifying-family')).toBe('MET');
    expect(result.status).toBe('MET');
    expect(condition(result, 'japanese-language').applicable).toBe(false);
    expect(
      status(
        pr({ ...route, bornInJapan: false }, evidence),
        'japanese-language',
      ),
    ).toBe('NOT_MET');
  });

  test('teijusha, refugee and international recognition are distinct', () => {
    const route = { route: 'teijusha', statusStart: '2022-04-01' } as const;
    expect(
      status(
        pr(route, {
          ...prEvidence,
          status: { ...prEvidence.status, kind: 'teijusha' },
        }),
        'long-term-resident',
      ),
    ).toBe('MET');
    expect(status(pr(route), 'long-term-resident')).toBe('NOT_MET');
    const refugee = { route: 'refugee', statusStart: '2022-04-01' } as const;
    const recognised = pr(refugee, {
      ...prEvidence,
      protectionRecognition: 'complementary-protection',
    });
    expect(status(recognised, 'recognised-protection')).toBe('MET');
    expect(condition(recognised, 'independent-livelihood').applicable).toBe(
      false,
    );
    expect(condition(recognised, 'good-conduct').applicable).toBeUndefined();
    expect(
      status(
        pr(refugee, { ...prEvidence, protectionRecognition: 'pending' }),
        'recognised-protection',
      ),
    ).toBe('NOT_MET');
    const resettled = {
      ...general,
      route: 'international-protection',
    } as const;
    expect(
      status(
        pr(resettled, {
          ...prEvidence,
          internationalProtectionConfirmed: true,
        }),
        'international-protection',
      ),
    ).toBe('MET');
    expect(status(pr(resettled), 'international-protection')).toBe('NOT_MET');
    expect(
      status(
        pr(
          resettled,
          { ...prEvidence, internationalProtectionConfirmed: true },
          { stayStart: '2022-04-01' },
        ),
        'continuous-stay',
      ),
    ).toBe('NOT_MET');
  });

  test('regional plans, special zones, contribution and special permission use their own controls', () => {
    const regional = {
      route: 'regional-regeneration',
      planRecognised: true,
      institutionInArea: true,
      designatedInstitutionAndContract: true,
      activityNotice: 37,
      activityQualified: true,
      comparableJapanesePay: true,
      qualifyingTechnologyEducation: false,
      designatedItQualification: false,
      technologyExperienceYears: 10,
      recognisedContribution: true,
    } as const;
    expect(status(pr(regional), 'regional-regeneration')).toBe('MET');
    expect(
      status(
        pr({ ...regional, technologyExperienceYears: 9 }),
        'regional-regeneration',
      ),
    ).toBe('NOT_MET');
    const zone = {
      route: 'structural-zone',
      recognisedZone: true,
      designatedBusiness: true,
      recognisedContribution: true,
    } as const;
    expect(status(pr(zone), 'structural-zone')).toBe('MET');
    expect(
      status(
        pr(zone, prEvidence, { applicationDate: '2027-03-31' }),
        'structural-zone',
      ),
    ).toBe('NOT_MET');
    const contribution = {
      route: 'japan-contribution',
      category: 'prime-director',
      roleYears: 5,
      designatedCategoryEvidence: true,
    } as const;
    expect(
      status(
        pr({ ...contribution, recognisedContribution: true }),
        'recognised-contribution',
      ),
    ).toBe('MET');
    expect(
      status(pr({ ...contribution, roleYears: 4 }), 'recognised-contribution'),
    ).toBe('NOT_MET');
    expect(status(pr(contribution), 'recognised-contribution')).toBe('UNKNOWN');
    const evidence = {
      ...prEvidence,
      specialPermission: { kind: 'stay', grantedOn: '2017-04-01' },
    } as const;
    expect(status(pr(zone, evidence), 'special-permission')).toBe('NOT_MET');
    expect(status(pr(general, evidence), 'special-permission')).toBe('MET');
    expect(
      status(
        pr(general, {
          ...evidence,
          specialPermission: {
            kind: 'landing-refusal',
            grantedOn: '2017-04-02',
          },
        }),
        'special-permission',
      ),
    ).toBe('NOT_MET');
  });
});

describe('highly skilled routes', () => {
  // A technical PhD (30), seven years of experience (15), salary 5m at
  // age 34 (15), and age under 35 (10) sum to exactly 70.
  const snapshot = {
    on: '2027-04-01',
    activity: 'technical',
    qualifyingActivity: true,
    complete: true,
    age: 34,
    remunerationYen: 5_000_000,
    education: 'doctorate',
    relevantExperienceYears: 7,
  } satisfies JpHspSnapshot;
  const hsp70 = {
    route: 'hsp70',
    statusStart: '2024-04-01',
    mode: 'recognised',
    recognisedOn: '2024-04-01',
    recognisedPoints: 70,
    maintained: true,
    current: snapshot,
  } as const;
  test('70 points, the birthday band, salary minimum and continuous history', () => {
    const result = pr(hsp70);
    expect(condition(result, 'hsp-current-points')).toMatchObject({
      status: 'MET',
      explanation: expect.stringContaining('Points checked: 70'),
    });
    expect(status(result, 'hsp-history')).toBe('MET');
    expect(condition(result, 'japanese-language').applicable).toBe(false);
    const older = pr({ ...hsp70, current: { ...snapshot, age: 35 } });
    expect(condition(older, 'hsp-current-points')).toMatchObject({
      status: 'NOT_MET',
      explanation: expect.stringContaining('Points checked: 50'),
    });
    expect(
      status(
        pr({ ...hsp70, current: { ...snapshot, remunerationYen: 2_999_999 } }),
        'hsp-current-points',
      ),
    ).toBe('NOT_MET');
    expect(
      status(
        pr({
          ...hsp70,
          current: {
            ...snapshot,
            remunerationYen: 3_000_000,
            japanHigherEducation: true,
            japaneseEvidence: 'N1-equivalent',
          },
        }),
        'hsp-current-points',
      ),
    ).toBe('MET');
    expect(
      status(pr({ ...hsp70, recognisedOn: '2024-04-02' }), 'hsp-history'),
    ).toBe('NOT_MET');
    expect(status(pr({ ...hsp70, maintained: undefined }), 'hsp-history')).toBe(
      'UNKNOWN',
    );
  });

  test('80 points at filing and exactly one year back, with language exclusions', () => {
    const eighty = { ...snapshot, bjtScore: 400 };
    const route = {
      route: 'hsp80',
      mode: 'retrospective',
      statusStart: '2026-04-01',
      maintained: true,
      current: eighty,
      historical: { ...eighty, on: '2026-04-01' },
    } as const;
    expect(status(pr(route), 'hsp-current-points')).toBe('MET');
    expect(status(pr(route), 'hsp-history')).toBe('MET');
    expect(
      status(
        pr({ ...route, historical: { ...eighty, on: '2026-04-02' } }),
        'hsp-history',
      ),
    ).toBe('UNKNOWN');
    expect(
      status(
        pr({ ...route, historical: { ...route.historical, bjtScore: 399 } }),
        'hsp-history',
      ),
    ).toBe('NOT_MET');
    expect(
      condition(
        pr({
          ...route,
          current: { ...eighty, japanHigherEducation: true, bjtScore: 480 },
        }),
        'hsp-current-points',
      ).explanation,
    ).toContain('Points checked: 95');
    expect(
      condition(
        pr({
          ...route,
          current: { ...eighty, japanHigherEducation: true, bjtScore: 479 },
        }),
        'hsp-current-points',
      ).explanation,
    ).toContain('Points checked: 80');
  });

  test('research and management use distinct salaries, education and bonus tables', () => {
    const different = (current: JpHspSnapshot) =>
      condition(pr({ ...hsp70, current }), 'hsp-current-points');
    const research = {
      ...snapshot,
      activity: 'research',
      age: 29,
      remunerationYen: 2_000_000,
      education: 'doctorate',
      relevantExperienceYears: 7,
      patents: 1,
      qualifyingPublications: 3,
    } as const;
    // 30 + 15 + zero salary points + 15 + 25 research = 85.
    expect(different(research)).toMatchObject({
      status: 'MET',
      explanation: expect.stringContaining('Points checked: 85'),
    });
    // 25 MBA + 25 experience + 20 salary + 5 position + 5 investment = 80.
    const manager = {
      ...snapshot,
      activity: 'management',
      education: 'businessProfessional',
      age: undefined,
      relevantExperienceYears: 10,
      remunerationYen: 15_000_000,
      position: 'director',
      personalInvestmentYen: 100_000_000,
    } as const;
    expect(different(manager).explanation).toContain('Points checked: 80');
    expect(
      different({ ...manager, personalInvestmentYen: 99_999_999 }).explanation,
    ).toContain('Points checked: 75');
  });

  test('J-Skip checks both reference dates and distinct business tracks', () => {
    const skill = {
      activity: 'research',
      qualifyingActivity: true,
      education: 'graduate',
      remunerationYen: 20_000_000,
    } as const;
    const route = {
      route: 'j-skip',
      mode: 'retrospective',
      current: { ...skill, on: '2027-04-01' },
      historical: { ...skill, on: '2026-04-01' },
    } as const;
    expect(status(pr(route), 'j-skip-current')).toBe('MET');
    expect(status(pr(route), 'j-skip-history')).toBe('MET');
    expect(
      status(
        pr({
          ...route,
          historical: { ...route.historical, remunerationYen: 19_999_999 },
        }),
        'j-skip-history',
      ),
    ).toBe('NOT_MET');
    const manager = {
      ...route.current,
      activity: 'management',
      remunerationYen: 40_000_000,
      relevantExperienceYears: 5,
    } as const;
    expect(status(pr({ ...route, current: manager }), 'j-skip-current')).toBe(
      'MET',
    );
    expect(
      status(
        pr({ ...route, current: { ...manager, relevantExperienceYears: 4 } }),
        'j-skip-current',
      ),
    ).toBe('NOT_MET');
    expect(
      status(
        pr({ ...route, current: { ...manager, remunerationYen: 39_999_999 } }),
        'j-skip-current',
      ),
    ).toBe('NOT_MET');
    expect(
      status(
        pr({
          ...route,
          mode: 'recognised',
          recognisedOn: '2026-04-01',
          remainedRecognised: true,
        }),
        'j-skip-history',
      ),
    ).toBe('MET');
    expect(status(pr({ ...route, mode: 'recognised' }), 'j-skip-history')).toBe(
      'UNKNOWN',
    );
  });
});

describe('naturalisation', () => {
  test('moves ordinary naturalisation filing from Saturday to the next open day', () => {
    const result = nat({ route: 'general' }, natEvidence, {
      simulationDate: '2027-04-03',
    });
    expect(status(result, 'domicile-years')).toBe('MET');
    expect(status(result, 'filing-in-japan')).toBe('MET');
    expect(result).toMatchObject({
      status: 'MET',
      earliestDate: '2027-04-05',
      timeStatus: 'MET',
      timeEarliestDate: '2027-04-03',
    });
    expect(result.summary).toContain('competent Legal Affairs Bureau');
  });

  const cases = [
    ['foreign-national', { japaneseCitizen: true }, 'NOT_MET'],
    ['lawful-domicile', { lawfulDomicile: false }, 'NOT_MET'],
    ['filing-in-japan', { inJapan: false }, 'NOT_MET'],
    ['age-and-capacity', { capacityUnderHomeLaw: false }, 'NOT_MET'],
    [
      'good-conduct',
      { goodConductConfirmed: undefined, criminalOrTrafficHistory: 'none' },
      'UNKNOWN',
    ],
    ['livelihood', { livelihoodConfirmed: false }, 'NOT_MET'],
    [
      'nationality-loss',
      {
        nationality: 'will-retain-nationality',
        cannotLoseNationalityByOwnChoice: false,
      },
      'NOT_MET',
    ],
    [
      'constitutional-condition',
      { constitutionalConditionConfirmed: false },
      'NOT_MET',
    ],
    ['integration', { integratedIntoJapanConfirmed: undefined }, 'UNKNOWN'],
    [
      'japanese-language',
      {
        japaneseLanguage: {
          speaking: 'independent',
          reading: 'independent',
          writing: 'independent',
        },
      },
      'UNKNOWN',
    ],
    [
      'interview-and-assessment',
      { requiredInterviewAndAssessmentComplete: false },
      'NOT_MET',
    ],
    ['tax', { tax: 'late-paid' }, 'NOT_MET'],
    ['pension-payments', { pension: 'unpaid' }, 'NOT_MET'],
    ['public-health-insurance', { publicHealthInsurance: 'unpaid' }, 'NOT_MET'],
    [
      'housing-and-health-evidence',
      { residenceEvidenceReady: false },
      'NOT_MET',
    ],
    ['motivation-and-oath', { oathReady: false }, 'NOT_MET'],
    ['filing-and-documents', { filer: 'legal-representative' }, 'NOT_MET'],
  ] satisfies [string, Partial<JpNaturalisationEvidence>, string][];
  test.each(cases)(
    '%s records a positive and an adverse or unconfirmed result',
    (id, evidence, expected) => {
      expect(status(nat(), id)).toBe('MET');
      expect(
        status(nat({ route: 'general' }, { ...natEvidence, ...evidence }), id),
      ).toBe(expected);
    },
  );

  test('keeps the five-year statutory date distinct from the ten-year review', () => {
    const afterFive = nat({ route: 'general' }, natEvidence, {
      stayStart: '2022-04-01',
    });
    expect(status(afterFive, 'domicile-years')).toBe('MET');
    expect(status(afterFive, 'residence-practice')).toBe('NOT_MET');
    const soon = nat({ route: 'general' }, natEvidence, {
      stayStart: '2022-04-02',
    });
    expect(status(soon, 'domicile-years')).toBe('NOT_MET');
    expect(nat().status).toBe('MET');
    expect(
      nat(
        { route: 'general' },
        { ...natEvidence, constitutionalConditionConfirmed: false },
      ).status,
    ).toBe('NOT_MET');
    expect(
      nat(
        { route: 'general' },
        { ...natEvidence, goodConductConfirmed: undefined },
      ).status,
    ).toBe('UNKNOWN');
  });

  test('separates the domestic age threshold, the 2022 transition and foreign-law capacity', () => {
    const onBirthday = nat({ route: 'general' }, natEvidence, {
      dateOfBirth: '2009-04-01',
    });
    expect(status(onBirthday, 'age-and-capacity')).toBe('MET');
    expect(
      status(
        nat({ route: 'general' }, natEvidence, { dateOfBirth: '2009-04-02' }),
        'age-and-capacity',
      ),
    ).toBe('NOT_MET');
    expect(
      status(
        nat({ route: 'general', homeMajorityAge: 20 }, natEvidence, {
          dateOfBirth: '2009-04-01',
        }),
        'age-and-capacity',
      ),
    ).toBe('NOT_MET');
    expect(
      condition(
        nat({ route: 'general' }, natEvidence, {
          applicationDate: '2022-03-31',
          dateOfBirth: '2004-03-31',
        }),
        'age-and-capacity',
      ),
    ).toMatchObject({
      status: 'UNKNOWN',
      pendingDetails: ['PD-161', 'PD-377'],
    });
    expect(
      status(
        nat({ route: 'general' }, natEvidence, {
          applicationDate: '2022-04-01',
          dateOfBirth: '2004-03-31',
        }),
        'age-and-capacity',
      ),
    ).toBe('MET');
    expect(
      status(
        nat({ route: 'general' }, natEvidence, { dateOfBirth: undefined }),
        'age-and-capacity',
      ),
    ).toBe('UNKNOWN');
  });

  test('checks nationality loss exceptions and distinguishes fee and post-approval registration', () => {
    const retained = {
      ...natEvidence,
      nationality: 'will-retain-nationality',
      cannotLoseNationalityByOwnChoice: true,
    } as const;
    const undecided = nat({ route: 'general' }, retained);
    expect(status(undecided, 'nationality-loss-exception')).toBe('UNKNOWN');
    expect(status(undecided, 'nationality-loss')).toBe('UNKNOWN');
    const approved = nat(
      { route: 'general' },
      { ...retained, ministerialExceptionConfirmed: true },
    );
    expect(status(approved, 'nationality-loss-exception')).toBe('MET');
    expect(status(approved, 'nationality-loss')).toBe('MET');
    expect(
      status(
        nat(
          { route: 'general' },
          { ...retained, ministerialExceptionConfirmed: false },
        ),
        'nationality-loss',
      ),
    ).toBe('NOT_MET');
    expect(condition(approved, 'application-fee').fee).toEqual({
      currency: 'JPY',
      amount: 0,
    });
    const registration = (familyRegistrationOn?: string) =>
      status(
        nat(
          { route: 'general' },
          {
            ...natEvidence,
            officialGazetteOn: '2027-02-03',
            familyRegistrationOn,
          },
        ),
        'gazette-and-family-registration',
      );
    expect(registration('2027-03-03')).toBe('MET');
    expect(registration('2027-03-04')).toBe('NOT_MET');
    expect(status(nat(), 'gazette-and-family-registration')).toBe('UNKNOWN');
  });

  test('a current spouse can qualify through either Article 7 branch', () => {
    const route = {
      route: 'spouse',
      marriedOn: '2024-04-01',
      stillJapaneseSpouse: true,
    } as const;
    const first = nat({ ...route, marriedOn: '2027-03-30' }, natEvidence, {
      stayStart: '2024-04-01',
    });
    expect(status(first, 'spouse-article-7')).toBe('MET');
    const second = nat(route, natEvidence, { stayStart: '2026-04-01' });
    expect(status(second, 'spouse-article-7')).toBe('MET');
    expect(condition(second, 'age-and-capacity').applicable).toBe(false);
    expect(status(second, 'residence-practice')).toBe('UNKNOWN');
    expect(
      status(
        nat(route, natEvidence, { stayStart: '2026-04-02' }),
        'spouse-article-7',
      ),
    ).toBe('NOT_MET');
    expect(
      status(nat({ ...route, stillJapaneseSpouse: false }), 'spouse-article-7'),
    ).toBe('NOT_MET');
  });

  const routes = [
    [
      'former-national-child',
      {
        route: 'article-6-former-national-child',
        biologicalChildOfFormerNational: true,
      },
      {
        route: 'article-6-former-national-child',
        biologicalChildOfFormerNational: false,
      },
      '2024-04-01',
    ],
    [
      'japan-birth',
      {
        route: 'article-6-japan-birth',
        bornInJapan: true,
        biologicalParentBornInJapan: false,
      },
      {
        route: 'article-6-japan-birth',
        bornInJapan: false,
        biologicalParentBornInJapan: false,
      },
      '2024-04-01',
    ],
    [
      'long-residence',
      { route: 'article-6-long-residence' },
      { route: 'article-6-long-residence' },
      '2017-04-01',
    ],
    [
      'japanese-child',
      {
        route: 'article-8-japanese-child',
        biologicalChildOfJapaneseNational: true,
      },
      {
        route: 'article-8-japanese-child',
        biologicalChildOfJapaneseNational: false,
      },
      '2027-03-01',
    ],
    [
      'adopted-child',
      {
        route: 'article-8-adopted-child',
        adoptedByJapaneseNational: true,
        adoptedWhileMinorUnderHomeLaw: true,
      },
      {
        route: 'article-8-adopted-child',
        adoptedByJapaneseNational: true,
        adoptedWhileMinorUnderHomeLaw: false,
      },
      '2026-04-01',
    ],
    [
      'former-national',
      {
        route: 'article-8-former-national',
        lostJapaneseNationality: true,
        lostAfterNaturalising: false,
      },
      {
        route: 'article-8-former-national',
        lostJapaneseNationality: true,
        lostAfterNaturalising: true,
      },
      '2027-03-01',
    ],
    [
      'stateless-from-birth',
      {
        route: 'article-8-stateless-from-birth',
        bornInJapan: true,
        statelessSinceBirth: true,
        domiciledContinuouslySinceBirth: true,
      },
      {
        route: 'article-8-stateless-from-birth',
        bornInJapan: true,
        statelessSinceBirth: false,
        domiciledContinuouslySinceBirth: true,
      },
      '2024-04-01',
    ],
    [
      'special-merit',
      {
        route: 'article-9-special-merit',
        specialMeritConfirmed: true,
        dietApproval: true,
      },
      {
        route: 'article-9-special-merit',
        specialMeritConfirmed: true,
        dietApproval: false,
      },
      '2027-03-01',
    ],
  ] satisfies [
    string,
    JpFullNaturalisationRoute,
    JpFullNaturalisationRoute,
    string,
  ][];

  test.each(routes)(
    'assesses the statutory route %s',
    (id, eligible, ineligible, start) => {
      const birth = id === 'stateless-from-birth';
      const request = {
        stayStart: start,
        ...(birth ? { dateOfBirth: start } : {}),
      };
      const evidence = birth
        ? {
            ...natEvidence,
            filer: 'legal-representative' as const,
            nationality: 'confirmed-stateless' as const,
          }
        : natEvidence;
      const good = nat(eligible, evidence, request);
      const bad = nat(ineligible, evidence, {
        ...request,
        ...(id === 'long-residence' ? { stayStart: '2017-04-02' } : {}),
      });
      expect(status(good, id)).toBe('MET');
      expect(status(bad, id)).toBe('NOT_MET');
      if (eligible.route.startsWith('article-8-'))
        expect(condition(good, 'livelihood').applicable).toBe(false);
      if (eligible.route.startsWith('article-6-'))
        expect(condition(good, 'age-and-capacity').applicable).toBeUndefined();
      if (eligible.route.startsWith('article-9-')) {
        expect(good.status).toBe('MET');
        expect(condition(good, 'constitutional-condition').applicable).toBe(
          false,
        );
      }
    },
  );

  test('does not guess Article 6 birth interpretation or the filer for a minor', () => {
    const route = {
      route: 'article-6-japan-birth',
      bornInJapan: false,
      biologicalParentBornInJapan: true,
    } as const;
    const unknownParent = nat({
      route: 'article-6-japan-birth',
      bornInJapan: false,
    });
    expect(condition(unknownParent, 'japan-birth')).toMatchObject({
      status: 'UNKNOWN',
      pendingDetails: expect.arrayContaining(['PD-373']),
    });
    expect(
      status(
        nat({ ...route, biologicalParentBornInJapan: false }),
        'japan-birth',
      ),
    ).toBe('NOT_MET');
    expect(status(nat(route), 'japan-birth')).toBe('UNKNOWN');
    expect(
      status(
        nat({ ...route, authorityConfirmsOverseasBirthBranch: true }),
        'japan-birth',
      ),
    ).toBe('MET');
    const child = {
      route: 'article-8-japanese-child',
      biologicalChildOfJapaneseNational: true,
    } as const;
    const fifteen = nat(child, natEvidence, { dateOfBirth: '2012-04-01' });
    expect(status(fifteen, 'filing-and-documents')).toBe('MET');
    const fourteen = { dateOfBirth: '2012-04-02' };
    expect(
      status(nat(child, natEvidence, fourteen), 'filing-and-documents'),
    ).toBe('NOT_MET');
    const represented = nat(
      child,
      { ...natEvidence, filer: 'legal-representative' },
      fourteen,
    );
    expect(status(represented, 'filing-and-documents')).toBe('MET');
    expect(condition(represented, 'motivation-and-oath').applicable).toBe(
      false,
    );
  });
});

describe('re-entry and travel documents', () => {
  const ordinary = {
    route: 'ordinary',
    inJapanWhenApplying: true,
    lawfulStatus: true,
    excludedStatusOrDetention: false,
    intendsReturn: true,
    passportOrApprovedAlternative: true,
    residentCardOrCertificate: true,
    stayIndefinite: true,
    specialPermanentResident: false,
    visits: 'multiple',
    channel: 'online',
    onlineConcurrentEligibleApplication: true,
    permitVoided: false,
    departureOn: '2026-10-03',
    returnOn: '2032-10-02',
    permit: {
      effectiveOn: '2026-10-02',
      expiresOn: '2031-10-02',
      extendedUntil: '2032-10-02',
      extensionApproved: true,
    },
  } as const;
  const deemed = {
    route: 'deemed',
    specialPermanentResident: false,
    lawfulStatus: true,
    originalStayMonths: 6,
    temporaryVisitor: false,
    passportValid: true,
    residentCardOrCertificate: true,
    formalPermitRequired: false,
    declaredIntentAtDeparture: true,
    permitVoided: false,
    departureOn: '2026-10-02',
    returnOn: '2027-10-02',
    stayExpiresOn: '2028-10-02',
  } as const;
  test('ordinary term, extension, fee timing and available channel', () => {
    const result = reentry(ordinary, { applicationDate: '2026-10-01' });
    expect(result.status).toBe('MET');
    expect(status(result, 'ordinary-eligibility')).toBe('MET');
    expect(
      status(
        reentry({ ...ordinary, excludedStatusOrDetention: true }),
        'ordinary-eligibility',
      ),
    ).toBe('NOT_MET');
    expect(status(result, 'ordinary-validity')).toBe('MET');
    expect(
      status(
        reentry({
          ...ordinary,
          permit: { ...ordinary.permit, extendedUntil: '2032-10-03' },
        }),
        'ordinary-validity',
      ),
    ).toBe('NOT_MET');
    expect(status(result, 'online-application')).toBe('MET');
    const unavailable = reentry(
      { ...ordinary, onlineConcurrentEligibleApplication: false },
      { applicationDate: '2026-10-01' },
    );
    expect(status(unavailable, 'online-application')).toBe('NOT_MET');
    expect(unavailable.status).toBe('NOT_MET');
    expect(
      condition(
        reentry(ordinary, { applicationDate: '2025-03-31' }),
        'travel-fee',
      ).fee?.amount,
    ).toBe(6_000);
    expect(condition(result, 'travel-fee').fee).toEqual({
      currency: 'JPY',
      amount: 6_720,
    });
    expect(
      condition(
        reentry(ordinary, { applicationDate: '2026-09-30' }),
        'travel-fee',
      ).fee?.amount,
    ).toBe(6_500);
    expect(
      condition(
        reentry(
          { ...ordinary, channel: 'counter', visits: 'single' },
          { applicationDate: '2025-03-31' },
        ),
        'travel-fee',
      ).fee?.amount,
    ).toBe(3_000);
    expect(
      condition(
        reentry(
          { ...ordinary, channel: 'counter', visits: 'single' },
          { applicationDate: '2025-04-01' },
        ),
        'travel-fee',
      ).fee?.amount,
    ).toBe(4_000);
    expect(
      status(
        reentry({
          ...ordinary,
          onlineConcurrentEligibleApplication: undefined,
        }),
        'travel-fee',
      ),
    ).toBe('UNKNOWN');
    expect(
      status(
        reentry({ ...ordinary, returnOn: '2032-10-03' }),
        'return-continuity',
      ),
    ).toBe('NOT_MET');
    expect(
      status(
        reentry({ ...ordinary, travelDocumentLost: true }),
        'return-continuity',
      ),
    ).toBe('UNKNOWN');
    expect(
      status(
        reentry({
          ...ordinary,
          travelDocumentLost: true,
          expiryCertificateObtained: true,
        }),
        'return-continuity',
      ),
    ).toBe('MET');
  });
  test('deemed term ends at the earlier date including a pending-renewal period', () => {
    expect(reentry(deemed).status).toBe('MET');
    expect(
      status(
        reentry({ ...deemed, originalStayMonths: 3 }),
        'deemed-eligibility',
      ),
    ).toBe('NOT_MET');
    expect(
      status(
        reentry({ ...deemed, formalPermitRequired: true }),
        'deemed-eligibility',
      ),
    ).toBe('NOT_MET');
    expect(
      status(
        reentry({ ...deemed, declaredIntentAtDeparture: undefined }),
        'deemed-eligibility',
      ),
    ).toBe('UNKNOWN');
    expect(
      status(reentry({ ...deemed, returnOn: '2027-10-03' }), 'deemed-validity'),
    ).toBe('NOT_MET');
    expect(
      status(
        reentry({
          ...deemed,
          stayExpiresOn: '2027-08-01',
          timelyRenewalPending: true,
          returnOn: '2027-10-01',
        }),
        'deemed-validity',
      ),
    ).toBe('MET');
    expect(
      status(
        reentry({
          ...deemed,
          stayExpiresOn: '2027-08-01',
          timelyRenewalPending: true,
          returnOn: '2027-10-02',
        }),
        'deemed-validity',
      ),
    ).toBe('NOT_MET');
    expect(
      status(
        reentry({
          ...deemed,
          specialPermanentResident: true,
          stayExpiresOn: undefined,
          returnOn: '2028-10-02',
        }),
        'deemed-validity',
      ),
    ).toBe('MET');
    expect(condition(reentry(deemed), 'travel-fee').fee).toEqual({
      currency: 'JPY',
      amount: 0,
    });
  });

  test('an ordinary permanent resident can use deemed re-entry without an original grant length', () => {
    const result = reentry({
      route: 'deemed',
      stayIndefinite: true,
      specialPermanentResident: false,
      lawfulStatus: true,
      passportValid: true,
      residentCardOrCertificate: true,
      formalPermitRequired: false,
      declaredIntentAtDeparture: true,
      permitVoided: false,
      departureOn: '2026-11-23',
      returnOn: '2027-01-04',
    });
    expect(status(result, 'deemed-eligibility')).toBe('MET');
    expect(status(result, 'return-continuity')).toBe('MET');
    expect(result.status).toBe('MET');
  });
  test('refugee travel has separate fee, endorsement and consular branches', () => {
    const refugee = {
      route: 'refugee-travel-document',
      refugeeRecognition: true,
      hasJapaneseTravelDocument: true,
      permitVoided: false,
      departureOn: '2026-07-04',
      returnOn: '2027-07-02',
      consularExtension: true,
      consularArea: 'china-mainland',
      extensionFeeOn: '2026-11-20',
      permit: {
        effectiveOn: '2026-07-02',
        expiresOn: '2027-07-02',
        entryDeadlineNotSpecified: true,
        extensionApproved: false,
      },
    } as const;
    const result = reentry(refugee, { applicationDate: '2026-07-01' });
    expect(result.status).toBe('MET');
    expect(status(result, 'refugee-document')).toBe('MET');
    expect(
      status(
        reentry({ ...refugee, refugeeRecognition: false }),
        'refugee-document',
      ),
    ).toBe('NOT_MET');
    expect(status(result, 'refugee-document-validity')).toBe('MET');
    expect(
      status(
        reentry({
          ...refugee,
          permit: { ...refugee.permit, expiresOn: '2027-07-01' },
        }),
        'refugee-document-validity',
      ),
    ).toBe('NOT_MET');
    expect(condition(result, 'travel-fee').fee?.amount).toBe(4_800);
    expect(
      condition(
        reentry(refugee, { applicationDate: '2024-06-10' }),
        'travel-fee',
      ).fee?.amount,
    ).toBe(5_000);
    expect(
      condition(
        reentry(refugee, { applicationDate: '2026-06-30' }),
        'travel-fee',
      ).fee?.amount,
    ).toBe(5_000);
    expect(condition(result, 'consular-extension-fee').fee).toEqual({
      currency: 'CNY',
      amount: 120,
    });
    expect(
      status(
        reentry({ ...refugee, consularArea: 'other' }),
        'consular-extension-fee',
      ),
    ).toBe('UNKNOWN');
  });
});

test('keeps all pilot time rows and output dates across the guideline switch', () => {
  const oldPaths: JpPrRequest[] = [
    general,
    { route: 'spouse', marriedLifeFrom: '2021-04-01' },
    { route: 'child' },
    { route: 'child-birth', bornOn: '2027-03-10' },
    { route: 'teijusha', statusStart: '2022-04-01' },
    { route: 'refugee', statusStart: '2022-04-01' },
    { route: 'hsp70', statusStart: '2024-04-01' },
    { route: 'hsp80', statusStart: '2026-04-01' },
  ];
  for (const simulationDate of ['2026-11-23', '2027-04-01']) {
    for (const route of oldPaths) {
      const time = evaluateJapan({
        ...base,
        simulationDate,
        pr: route,
        naturalisation: { route: 'general', dateOfBirth: base.dateOfBirth },
      }).pathways[0];
      const full = pr(route, prEvidence, { simulationDate });
      expect(full.timeStatus).toBe(time.status);
      expect(full.timeEarliestDate).toBe(time.earliestDate);
      expect(
        full.checks
          .slice(0, time.checks.length)
          .map((x) => [x.explanation, x.status]),
      ).toEqual(
        time.checks.map((x) => [
          x.text,
          x.met === undefined ? 'UNKNOWN' : x.met ? 'MET' : 'NOT_MET',
        ]),
      );
    }
  }
  const trips = [{ departed: '2026-08-01', returned: '2027-05-01' }];
  const pilot = evaluateJapan({
    ...base,
    pr: general,
    trips,
    naturalisation: { route: 'spouse', marriedOn: '2022-01-01' },
  }).pathways;
  const existing = pr(general, prEvidence, { trips });
  expect(existing.timeStatus).toBe(pilot[0].status);
  expect(existing.timeEarliestDate).toBe(pilot[0].earliestDate);
  expect(status(existing, 'filing-in-japan')).toBe('NOT_MET');
  const spouse = nat(
    { route: 'spouse', marriedOn: '2022-01-01' },
    natEvidence,
    { trips },
  );
  expect(spouse.timeStatus).toBe(pilot[1].status);
  expect(spouse.timeEarliestDate).toBe(pilot[1].earliestDate);
  expect(status(spouse, 'filing-in-japan')).toBe('NOT_MET');
});

test('multiple goals return stable bilingual pathway and condition IDs with sources', () => {
  const request: JpFullRequest = {
    ...base,
    permanentResidence: { routes: [general, { route: 'child' }] },
    naturalisation: {
      routes: [{ route: 'general' }, { route: 'article-9-special-merit' }],
    },
    reentry: [{ route: 'ordinary' }, { route: 'deemed' }],
  };
  const en = evaluateJapanFull(request);
  const zh = evaluateJapanFull({ ...request, locale: 'zh-CN' });
  expect(zh.policyAsOf).toBe('2026-11-23');
  expect(zh.columns[0].pathways.map((p) => p.id)).toEqual(
    en.columns[0].pathways.map((p) => p.id),
  );
  for (const [i, path] of en.columns[0].pathways.entries()) {
    expect(path.status).toBe('UNKNOWN');
    const chinese = zh.columns[0].pathways[i];
    expect(chinese.title).not.toBe(path.title);
    expect(new Set(path.checks.map((c) => c.id)).size).toBe(path.checks.length);
    expect(chinese.checks.map((c) => c.id)).toEqual(
      path.checks.map((c) => c.id),
    );
    for (const [j, c] of path.checks.entries()) {
      expect(c.sources.length).toBeGreaterThan(0);
      expect(c.explanation).not.toBe(chinese.checks[j].explanation);
    }
  }
});
