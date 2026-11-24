import { describe, expect, test } from 'vitest';
import { evaluatePortugal, evaluatePortugalFull } from '../src';
import type { PtFullRequest, PtInvestment, PtNationalityCrime } from '../src';

const adult: PtFullRequest = {
  simulationDate: '2026-11-23',
  locale: 'en',
  route: 'other',
  birthDate: '1990-11-23',
  permits: [{ kind: 'temporary', from: '2015-10-01', to: '2027-01-22' }],
  trips: [],
};

const nationality: NonNullable<PtFullRequest['nationality']> = {
  statelessRecognized: true,
  newLanguageAccepted: true,
  cultureAccepted: true,
  civicsAccepted: true,
  declaration: 'completed',
  crime: { record: 'none' },
  security: 'clear',
  sanctions: 'clear',
  language: { kind: 'ciple' },
  documentsReady: true,
};

const residence: NonNullable<PtFullRequest['residence']> = {
  means: {
    region: 'mainland',
    otherAdults: 1,
    dependantChildren: 1,
    supportedMonths: 12,
    monthlyEligibleEur: 1473.84,
    confirmedMonthlyMinimumEur: 1473.84,
    stable: true,
    solidarityReliance: false,
  },
  accommodation: 'documented',
  language: { kind: 'pla', level: 'A2', recognized: true },
  healthCoverage: 'sns-proof',
  tax: 'compliant',
  socialSecurity: 'recognized-arrangement',
  travelDocumentValid: true,
  criminalRecordAvailable: true,
  statusCancellation: 'clear',
  criminalSentence: {
    totalYears: 1,
    scope: 'complete',
    permanentWindowVerified: true,
  },
  generalRefusal: {
    sisAlert: false,
    ucfeExclusion: false,
    longestFinalPortuguesePrisonYears: 1,
    comparablePortugueseConvictions: 1,
  },
  fees: { column: 'right', paid: true, exemption: 'none' },
};

const renewal: NonNullable<PtFullRequest['renewal']> = {
  purpose: 'employment',
  purposeEvidence: true,
  residencePermitCancelled: false,
  contumacia: 'none',
  publicOrder: 'clear',
  euRestrictiveMeasure: false,
};

const longTerm: NonNullable<PtFullRequest['longTerm']> = {
  basis: 'ordinary',
  currentCategory: 'qualifying',
  publicOrder: 'clear',
  memberStateChecks: 'clear',
};

const investment: NonNullable<PtFullRequest['investment']> = {
  operation: 'grant',
  holder: 'investor',
  entry: 'schengen-visa',
  firstEntry: '2026-08-25',
  regularizedOn: '2026-11-23',
  lawfullyInPortugal: true,
  visaRefusalGround: false,
  socialRegistration: 'not-required',
  qualifyingConviction: true,
  convictionMaximumYears: 1,
  admissionReview: 'clear',
  healthReview: 'clear',
  domesticImmigrationAlert: false,
  euRestrictiveMeasure: false,
  foreignRecordDate: '2026-08-23',
  accompanyingTaxEvidenceDate: '2026-10-09',
  documentsReady: true,
  investedOn: '2026-11-23',
  commercialVehicleQualified: true,
  realEstateExposure: false,
  investmentEvidenceAccepted: true,
  investment: { kind: 'jobs', jobs: 10 },
};

const freeMovement: NonNullable<PtFullRequest['freeMovement']> = {
  applicant: 'eu-eea-swiss',
  basis: 'ordinary',
  continuousResidenceFrom: '2021-11-23',
  expulsionExecuted: false,
  historicalBasisReview: 'clear',
  documents: 'standard',
  publicRestrictions: 'clear',
  feeMode: 'digital',
  feePaid: true,
};

const partner: NonNullable<PtFullRequest['partner']> = {
  kind: 'marriage',
  current: true,
  portuguesePartner: true,
  partnerPortugueseSince: '1991-01-01',
  relationshipFrom: '2020-11-22',
  registrationAccepted: true,
  commonPortugueseChild: false,
  foreignService: 'nontechnical-or-voluntary',
  documentsReady: true,
};

const A = 'PT-NATURALISATION';
const B = 'PT-PERMANENT';
const C = 'PT-EU-LONG-TERM';
const D = 'PT-GOLDEN-VISA';
const E = 'PT-TEMPORARY-RENEWAL';
const F = 'PT-FREE-MOVEMENT-PERMANENT';
const G = 'PT-PARTNER-NATIONALITY';

const result = (patch: Partial<PtFullRequest> = {}) =>
  evaluatePortugalFull({ ...adult, ...patch });
const pathway = (id: string, patch: Partial<PtFullRequest> = {}) =>
  result(patch).columns[0].pathways.find((item) => item.id === id)!;
const condition = (
  id: string,
  rule: string,
  patch: Partial<PtFullRequest> = {},
) => pathway(id, patch).checks.find((item) => item.id === `PT-${rule}`)!;
const statuses = (
  id: string,
  patch: Partial<PtFullRequest>,
  expected: Record<string, string>,
) => {
  const byId = Object.fromEntries(
    pathway(id, patch).checks.map((c) => [c.id, c.status]),
  );
  for (const [rule, status] of Object.entries(expected))
    expect(byId[`PT-${rule}`], rule).toBe(status);
};

describe('review92-1', () => {
  test.each([
    [true, true, 'MET', '2026-11-23'],
    [undefined, true, 'UNKNOWN', undefined],
    [true, undefined, 'UNKNOWN', undefined],
    [false, true, 'NOT_MET', undefined],
    [true, false, 'NOT_MET', undefined],
  ] as const)(
    'ARI family grant with sponsor %s and accepted relationship %s',
    (sponsorAriValid, familyEvidenceAccepted, status, earliestDate) => {
      const request = {
        residence: {
          ...residence,
          means: { officialAssessment: 'clear' as const },
        },
        investment: {
          ...investment,
          holder: 'family' as const,
          sponsorAriValid,
          familyEvidenceAccepted,
          firstEntry: undefined,
          regularizedOn: undefined,
          investment: undefined,
          investedOn: undefined,
          investmentEvidenceAccepted: undefined,
        },
      };
      statuses(D, request, { D01: status });
      const path = pathway(D, request);
      expect(path.status).toBe(status);
      expect(path.earliestDate).toBe(earliestDate);
      expect(path.checks.some(({ id }) => /^PT-D0[56]/.test(id))).toBe(false);
    },
  );

  test('first EU permanent certificate uses absence rules after the acquisition date', () => {
    const request = {
      route: 'eu' as const,
      freeMovement: {
        ...freeMovement,
        continuousResidenceFrom: '2018-01-01',
        historicalBasisReview: undefined,
        identityAtEntryValid: true,
        residenceBasis: 'worker' as const,
        absences: [
          {
            departed: '2024-01-01',
            returned: '2024-09-01',
            reason: 'ordinary' as const,
          },
        ],
      },
    };
    statuses(F, request, {
      F01: 'MET',
      F02: 'MET',
      F03: 'MET',
      'F02-RETENTION': 'MET',
    });
    expect(pathway(F, request)).toMatchObject({
      status: 'MET',
      earliestDate: '2023-01-01',
    });
    const loss = {
      ...request,
      freeMovement: {
        ...request.freeMovement,
        absences: [
          {
            departed: '2024-01-01',
            returned: '2026-01-02',
            reason: 'ordinary' as const,
          },
        ],
      },
    };
    statuses(F, loss, { F02: 'MET', 'F02-RETENTION': 'NOT_MET' });
    expect(pathway(F, loss)).toMatchObject({
      status: 'NOT_MET',
      earliestDate: undefined,
    });
  });

  const descendant = {
    ...freeMovement,
    applicant: 'third-country-family' as const,
    continuousResidenceFrom: '2019-01-01',
    relationship: 'descendant' as const,
    relationshipVerified: true,
    sponsorEligible: true,
    accompaniesOrJoins: true,
    livedWithSponsor: true,
    dependant: false,
    historicalBasisReview: undefined,
    residenceBasis: 'family' as const,
    identityAtEntryValid: true,
    sponsorResidenceBasisEstablished: true,
  };

  test('first third-country family card uses the descendant age at acquisition', () => {
    const request = { birthDate: '2004-08-02', freeMovement: descendant };
    statuses(F, request, {
      F01: 'MET',
      F02: 'MET',
      F03: 'MET',
      'F02-RETENTION': 'MET',
    });
    expect(pathway(F, request)).toMatchObject({
      status: 'MET',
      earliestDate: '2024-01-01',
    });
  });

  test.each([
    ['2024-01-01', 'MET', '2021-11-23'],
    ['2024-04-01', 'UNKNOWN', undefined],
    ['2024-07-01', 'UNKNOWN', undefined],
    ['2024-07-02', 'NOT_MET', undefined],
  ] as const)(
    'third-country family retention with absence until %s',
    (returned, status, earliestDate) => {
      const request = {
        freeMovement: {
          ...descendant,
          operation: 'retain' as const,
          permanentRightAcquiredOn: '2021-11-23',
          absences: [{ departed: '2022-01-01', returned }],
        },
      };
      statuses(F, request, { 'F02-RETENTION': status });
      const path = pathway(F, request);
      expect(path).toMatchObject({ status, earliestDate });
      if (status === 'UNKNOWN') expect(path.pendingDetails).toContain('PD-396');
    },
  );

  test.each([
    [undefined, 'UNKNOWN', undefined],
    ['clear', 'MET', '2024-01-01'],
    ['barred', 'NOT_MET', undefined],
  ] as const)(
    'other-family permission %s controls eligibility and historical basis',
    (otherFamilyPermission, status, earliestDate) => {
      const request = {
        freeMovement: {
          ...descendant,
          relationship: 'other-family' as const,
          otherFamilyPermission,
        },
      };
      statuses(F, request, { F01: status, F03: status });
      expect(pathway(F, request)).toMatchObject({ status, earliestDate });
    },
  );

  test.each([
    [1000, 'MET', '2026-11-23'],
    [400, 'NOT_MET', undefined],
    [undefined, 'UNKNOWN', undefined],
  ] as const)(
    'employment renewal uses confirmed net income of %s',
    (monthlyEligibleEur, status, earliestDate) => {
      const request = {
        renewal,
        residence: {
          ...residence,
          means: {
            sources: ['employment' as const],
            stable: true,
            monthlyEligibleEur,
            confirmedMonthlyMinimumEur: 818.8,
            supportedMonths: 12,
          },
        },
      };
      statuses(E, request, { E01: 'MET', E02: status });
      expect(pathway(E, request)).toMatchObject({ status, earliestDate });
    },
  );

  test.each([
    [undefined, 'UNKNOWN', undefined],
    [true, 'MET', '2026-11-23'],
    [false, 'NOT_MET', undefined],
  ] as const)(
    'old CPLP language presumption with birthplace %s',
    (bornInOfficialPortugueseCountry, status, earliestDate) => {
      const request = {
        route: 'cplp' as const,
        pendingApplication: '2026-02-01',
        nationality: {
          ...nationality,
          bornInOfficialPortugueseCountry,
          language: { kind: 'none' as const },
        },
      };
      statuses(A, request, { A13: status });
      expect(pathway(A, request)).toMatchObject({ status, earliestDate });
      if (status === 'UNKNOWN') {
        expect(condition(A, 'A13', request).explanation).toContain(
          'born in a country',
        );
      }
    },
  );

  test('known renewal, free-movement and partner waiting dates require clear substantive conditions', () => {
    const ordinary = {
      simulationDate: '2026-10-23',
      residence,
      renewal,
    };
    statuses(E, ordinary, { E01: 'NOT_MET', E02: 'MET' });
    expect(pathway(E, ordinary)).toMatchObject({
      status: 'FUTURE',
      earliestDate: '2026-10-24',
    });
    const expelled = {
      ...ordinary,
      renewal: { ...renewal, servingSentence: true, expulsionOrdered: true },
    };
    expect(pathway(E, expelled)).toMatchObject({
      status: 'NOT_MET',
      earliestDate: undefined,
    });

    const movement = {
      freeMovement: { ...freeMovement, continuousResidenceFrom: '2021-11-24' },
    };
    statuses(F, movement, { F02: 'NOT_MET' });
    expect(pathway(F, movement)).toMatchObject({
      status: 'FUTURE',
      earliestDate: '2026-11-24',
    });
    const missingBasis = {
      freeMovement: {
        ...movement.freeMovement,
        historicalBasisReview: undefined,
      },
    };
    expect(pathway(F, missingBasis)).toMatchObject({
      status: 'UNKNOWN',
      earliestDate: undefined,
    });

    const marriage = {
      partner: {
        ...partner,
        relationshipFrom: '2023-11-23',
        commonPortugueseChild: true,
      },
      nationality,
    };
    statuses(G, marriage, { G01: 'NOT_MET' });
    expect(pathway(G, marriage)).toMatchObject({
      status: 'FUTURE',
      earliestDate: '2026-11-24',
    });
    const pending = {
      ...marriage,
      partner: { ...marriage.partner, pendingApplication: '2026-05-18' },
    };
    expect(pathway(G, pending)).toMatchObject({
      status: 'NOT_MET',
      earliestDate: undefined,
    });
  });

  test('known Blue Card and international protection waiting dates use the applicable residence facts', () => {
    const blue = {
      residence,
      longTerm: {
        ...longTerm,
        basis: 'blue-card' as const,
        blueCard: {
          issuedByPortugal: true,
          staysVerified: true,
          continuousQualifyingEuFrom: '2021-11-24',
          continuousPortugueseBlueCardFrom: '2024-11-25',
          euAbsences: [],
        },
      },
    };
    statuses(C, blue, { C01: 'MET', C03: 'NOT_MET' });
    expect(pathway(C, blue)).toMatchObject({
      status: 'FUTURE',
      earliestDate: '2026-11-25',
    });
    const protection = {
      residence,
      longTerm: {
        ...longTerm,
        basis: 'international-protection' as const,
        protectionApplicationDate: '2021-11-23',
        qualifyingProtectionGranted: true,
        protectionContinuityVerified: true,
        protectionWithdrawal: 'clear' as const,
      },
    };
    statuses(C, protection, { C01: 'NOT_MET', C02: 'MET' });
    expect(pathway(C, protection)).toMatchObject({
      status: 'FUTURE',
      earliestDate: '2026-11-24',
    });
    const unknown = {
      ...protection,
      longTerm: { ...protection.longTerm, protectionWithdrawal: undefined },
    };
    expect(pathway(C, unknown)).toMatchObject({
      status: 'UNKNOWN',
      earliestDate: undefined,
    });
  });

  test('prospective adulthood and ARI conversion wait without overriding the substantive checks', () => {
    const minor = {
      simulationDate: '2026-04-15',
      birthDate: '2008-04-16',
      emancipation: 'none' as const,
      nationality,
    };
    statuses(A, minor, { A02: 'MET', A12: 'NOT_MET' });
    expect(pathway(A, minor)).toMatchObject({
      status: 'FUTURE',
      earliestDate: '2026-04-16',
    });

    const conversion = {
      investment: { operation: 'convert' as const },
      permits: [{ kind: 'golden-visa' as const, from: '2022-11-22' }],
      residence,
    };
    expect(pathway(B, conversion)).toMatchObject({
      status: 'FUTURE',
      earliestDate: '2027-11-23',
    });
    expect(pathway(D, conversion)).toMatchObject({
      status: 'FUTURE',
      earliestDate: '2027-11-23',
    });
  });
});

describe('country result and existing time checks', () => {
  test('all pathways have unique scoped checks, sources and localized explanations', () => {
    const patch = {
      nationality,
      residence,
      renewal,
      longTerm,
      investment,
      freeMovement,
      partner,
    };
    const en = result(patch);
    const zh = result({ ...patch, locale: 'zh-CN' });
    expect(en.policyAsOf).toBe('2026-11-23');
    expect(en.columns[0].pathways.map((item) => item.id)).toEqual([
      A,
      B,
      C,
      D,
      E,
      F,
      G,
    ]);
    for (const [index, path] of en.columns[0].pathways.entries()) {
      const localized = zh.columns[0].pathways[index];
      const ids = path.checks.map((c) => c.id);
      expect(ids.length).toBe(new Set(ids).size);
      expect(localized.checks.map((c) => c.id)).toEqual(ids);
      path.checks.forEach((check, i) => {
        expect(check.sources.length).toBeGreaterThan(0);
        expect(
          check.sources.every(
            (source) => /^SRC-\d+$/.test(source.srcId) && source.locator,
          ),
        ).toBe(true);
        expect(localized.checks[i].title).not.toBe(check.title);
        expect(localized.checks[i].explanation).not.toBe(check.explanation);
      });
    }
  });

  test.each([
    {},
    { permits: [], trips: [] },
    { permits: [{ kind: 'temporary', from: '2024-05-21' }] },
    { trips: [{ departed: '2024-05-10', returned: '2024-06-01' }] },
    { route: 'eu' },
  ] satisfies Partial<PtFullRequest>[])(
    'maps pilot time results without changing the underlying boolean and sources',
    (patch) => {
      const request = { ...adult, ...patch };
      const output = evaluatePortugalFull(request).columns[0].pathways;
      const pilot = evaluatePortugal(request).pathways;
      const ids = [
        ['A02'],
        ['B01', 'B01-CANCELLATION-RISK'],
        ['C01', 'C01-SINGLE-ABSENCE', 'C01-TOTAL-ABSENCE'],
      ];
      for (const [index, names] of ids.entries()) {
        pilot[index].checks.forEach((check, i) => {
          const full = output[index].checks.find(
            (c) => c.id === `PT-${names[i]}`,
          )!;
          expect(full.status).toBe(
            check.met === undefined ? 'UNKNOWN' : check.met ? 'MET' : 'NOT_MET',
          );
          expect(full.sources).toEqual(check.sources);
        });
      }
    },
  );

  test('only time projects a date and an unknown or failed substantive check cannot claim it', () => {
    const partial = {
      permits: [{ kind: 'temporary' as const, from: '2022-11-22' }],
    };
    const projected = pathway(B, { ...partial, residence });
    expect(projected.status).toBe('FUTURE');
    expect(projected.earliestDate).toBe('2027-11-23');
    const unknown = pathway(B, {
      ...partial,
      residence: { ...residence, accommodation: undefined },
    });
    expect(unknown.status).toBe('UNKNOWN');
    expect(unknown.earliestDate).toBeUndefined();
    expect(
      pathway(B, {
        ...partial,
        residence: { ...residence, accommodation: 'none' },
      }).status,
    ).toBe('NOT_MET');
  });
});

describe('A · ordinary, stateless and pending naturalisation', () => {
  test('18th birthday, official proof, political declaration, security and sanctions', () => {
    const request = { nationality, birthDate: '2008-11-23' };
    statuses(A, request, {
      A01: 'MET',
      A02: 'MET',
      A03: 'MET',
      A04: 'MET',
      A05: 'MET',
      A06: 'MET',
      A07: 'MET',
      A08: 'MET',
      A09: 'MET',
      A10: 'UNKNOWN',
      A11: 'MET',
      'A11-FEE': 'MET',
      'A11-EXAM-FEE': 'UNKNOWN',
    });
    expect(pathway(A, request).status).toBe('UNKNOWN');
    expect(condition(A, 'A10', request).pendingDetails).toEqual(['PD-383']);
    expect(condition(A, 'A11-FEE', request).explanation).toContain('EUR 250');
    statuses(
      A,
      {
        birthDate: '2008-11-24',
        nationality: {
          language: { kind: 'ciple' },
          cultureAccepted: false,
          civicsAccepted: false,
          declaration: 'willing',
          security: 'barred',
          sanctions: 'barred',
          documentsReady: false,
        },
      },
      {
        A01: 'NOT_MET',
        A03: 'UNKNOWN',
        A04: 'NOT_MET',
        A05: 'NOT_MET',
        A06: 'UNKNOWN',
        A08: 'NOT_MET',
        A09: 'NOT_MET',
        A11: 'NOT_MET',
        'A11-FEE': 'UNKNOWN',
      },
    );
    statuses(
      A,
      { route: 'cplp', nationality: { declaration: 'refused' } },
      { A03: 'MET', A06: 'NOT_MET' },
    );
    statuses(
      A,
      { route: 'cplp', nationality: { languagePresumptionDisputed: true } },
      { A03: 'UNKNOWN' },
    );
  });

  test('the stateless branch requires recognition and omits adult and means requirements', () => {
    const request = {
      route: 'stateless' as const,
      birthDate: '2010-11-23',
      nationality,
    };
    const path = pathway(A, request);
    expect(path.status).toBe('MET');
    expect(path.checks.map((c) => c.id)).not.toContain('PT-A01');
    expect(path.checks.map((c) => c.id)).not.toContain('PT-A10');
    statuses(A, request, {
      'A-STATELESS': 'MET',
      A02: 'MET',
      A06: 'MET',
      'A11-FEE': 'MET',
    });
    expect(condition(A, 'A11-FEE', request).explanation).toContain('EUR 0');
    statuses(
      A,
      {
        ...request,
        nationality: { ...nationality, statelessRecognized: undefined },
      },
      { 'A-STATELESS': 'UNKNOWN', 'A11-FEE': 'UNKNOWN' },
    );
  });

  test('emancipation legally acquired before repeal can be valid at a later old-law filing', () => {
    const request = {
      pendingApplication: '2025-06-01',
      birthDate: '2008-09-01',
      emancipation: 'recognized' as const,
      emancipationFrom: '2025-04-01',
    };
    statuses(A, request, { A12: 'MET' });
    statuses(
      A,
      { ...request, emancipationFrom: '2025-04-02' },
      { A12: 'NOT_MET' },
    );
  });

  test('new serious effective imprisonment must exceed three years; old law includes exactly three', () => {
    const crime: PtNationalityCrime = {
      record: 'conviction',
      years: 3,
      final: true,
      imprisonment: true,
      effective: true,
      punishableInPortugal: true,
      category: 'specified-serious-offence',
    };
    statuses(A, { nationality: { crime } }, { A07: 'MET' });
    statuses(
      A,
      { nationality: { crime: { ...crime, years: 3.01 } } },
      { A07: 'UNKNOWN' },
    );
    statuses(
      A,
      { nationality: { crime: { ...crime, years: 4, effective: false } } },
      { A07: 'MET' },
    );
    statuses(
      A,
      { nationality: { crime: { ...crime, years: 4, category: 'other' } } },
      { A07: 'MET' },
    );
    statuses(
      A,
      { nationality: { crime: { ...crime, years: 4, review: 'barred' } } },
      { A07: 'NOT_MET' },
    );
    const pendingApplication = '2026-05-18';
    statuses(
      A,
      { pendingApplication, nationality: { crime } },
      { A14: 'NOT_MET' },
    );
    statuses(
      A,
      { pendingApplication, nationality: { crime: { ...crime, years: 2.99 } } },
      { A14: 'MET' },
    );
  });

  test('an old application cannot borrow the current-law time result', () => {
    const request = {
      pendingApplication: '2026-05-01',
      residenceApplied: '2021-05-01',
      permits: [{ kind: 'temporary' as const, from: '2021-07-01' }],
      nationality,
    };
    statuses(A, request, {
      A02: 'NOT_MET',
      'A02-CURRENT-ALTERNATIVE': 'NOT_MET',
    });
    const later = { ...request, simulationDate: '2031-07-02' };
    statuses(A, later, { A02: 'NOT_MET', 'A02-CURRENT-ALTERNATIVE': 'MET' });
    expect(pathway(A, later).status).toBe('NOT_MET');
  });

  test('old filing uses old language proof, emancipation, security and suspension', () => {
    const request = {
      pendingApplication: '2025-04-01',
      birthDate: '2008-11-23',
      emancipation: 'recognized' as const,
      nationality,
    };
    const path = pathway(A, request);
    expect(path.status).toBe('MET');
    expect(path.earliestDate).toBe(adult.simulationDate);
    statuses(A, request, {
      A12: 'MET',
      A13: 'MET',
      A14: 'MET',
      A15: 'MET',
      'A15-SUSPENSION': 'MET',
    });
    expect(condition(A, 'A11-FEE', request).explanation).toContain('EUR 95');
    statuses(
      A,
      {
        ...request,
        emancipation: 'none',
        nationality: {
          language: {
            kind: 'dual-certificate',
            recognized: true,
            courseHours: 99,
          },
          security: 'barred',
          sanctions: 'barred',
        },
      },
      {
        A12: 'NOT_MET',
        A13: 'NOT_MET',
        A15: 'NOT_MET',
        'A15-SUSPENSION': 'UNKNOWN',
      },
    );
    statuses(
      A,
      {
        ...request,
        nationality: {
          language: {
            kind: 'dual-certificate',
            recognized: true,
            courseHours: 100,
          },
        },
      },
      { A13: 'MET' },
    );
    const school = (schoolYears: number) => ({
      ...request,
      nationality: {
        language: {
          kind: 'portuguese-school' as const,
          recognized: true,
          schoolYears,
        },
      },
    });
    statuses(A, school(2), { A13: 'MET' });
    statuses(A, school(1), { A13: 'NOT_MET' });
    statuses(
      A,
      { pendingApplication: '2026-05-19' },
      { 'A-VERSION': 'UNKNOWN' },
    );
  });
});

describe('B · Portuguese permanent residence', () => {
  test('12 months, accepted net figure, language and permit evidence', () => {
    const request = { residence };
    statuses(B, request, {
      B01: 'MET',
      'B01-CANCELLATION-RISK': 'MET',
      'B01-TITLE': 'MET',
      B02: 'MET',
      'B02-GENERAL': 'MET',
      B03: 'MET',
      B04: 'MET',
      B05: 'MET',
      B06: 'MET',
      'B07-FEE': 'MET',
    });
    expect(pathway(B, request).status).toBe('MET');
    expect(condition(B, 'B03', request).explanation).toContain('EUR 1656.00');
    expect(condition(B, 'B03', request).explanation).toContain('EUR 1473.84');
    const means = residence.means;
    statuses(
      B,
      {
        residence: {
          ...residence,
          means: { ...means, supportedMonths: 11 },
          accommodation: 'none',
          language: { kind: 'pla', level: 'A1', recognized: true },
          statusCancellation: 'barred',
          travelDocumentValid: false,
          fees: { paid: true },
        },
      },
      {
        'B01-TITLE': 'NOT_MET',
        B03: 'NOT_MET',
        B04: 'NOT_MET',
        B05: 'NOT_MET',
        B06: 'NOT_MET',
        'B07-FEE': 'UNKNOWN',
      },
    );
    statuses(
      B,
      {
        residence: {
          ...residence,
          means: { ...means, monthlyEligibleEur: 1473.83 },
        },
      },
      { B03: 'NOT_MET' },
    );
    statuses(
      B,
      {
        residence: {
          ...residence,
          means: { ...means, confirmedMonthlyMinimumEur: undefined },
          accommodation: 'alternative-proof',
        },
      },
      { B03: 'UNKNOWN', B04: 'UNKNOWN' },
    );
  });

  test('aggregate qualifying prison within the last five years and keep general refusal separate', () => {
    const recorded = (date: string, years: number) => ({
      date,
      years,
      fallsUnderPortugueseRule: true,
      suspended: false,
    });
    const convictions = [
      recorded('2021-11-22', 3),
      recorded('2021-11-23', 0.5),
      recorded('2026-11-22', 0.5),
    ];
    const request = (extra: typeof convictions = []) => ({
      residence: {
        ...residence,
        criminalSentence: {
          scope: 'complete' as const,
          permanentWindowVerified: true,
          convictions: [...convictions, ...extra],
        },
      },
    });
    statuses(B, request(), { B02: 'MET' });
    statuses(B, request([recorded('2026-11-23', 0.01)]), { B02: 'NOT_MET' });
    statuses(
      B,
      { residence: { ...residence, generalRefusal: { sisAlert: true } } },
      { 'B02-GENERAL': 'UNKNOWN' },
    );
    statuses(
      B,
      { residence: { ...residence, generalRefusal: { review: 'barred' } } },
      { 'B02-GENERAL': 'NOT_MET' },
    );
  });

  test('investment permanent status uses its own absence rule and replacement fee', () => {
    const request = {
      permits: [
        {
          kind: 'ari-permanent' as const,
          from: '2020-11-23',
          to: '2025-11-23',
        },
      ],
      trips: [{ departed: '2020-11-24', returned: '2026-10-31' }],
      permanentOperation: 'replace' as const,
      residence,
      investment: {
        operation: 'replace-permanent' as const,
        permanentTerms: 'clear' as const,
      },
    };
    statuses(B, request, {
      B07: 'MET',
      'B07-ABSENCE': 'MET',
      'B07-REPLACE-DOCUMENTS': 'MET',
      'B07-FEE': 'MET',
    });
    expect(condition(B, 'B07-FEE', request).explanation).toContain(
      'EUR 4420.70',
    );
    statuses(D, request, { D10: 'MET', 'D10-TERMS': 'MET', 'D-FEE': 'MET' });
    statuses(
      B,
      {
        ...request,
        residence: {
          ...residence,
          statusCancellation: 'pending',
          criminalRecordAvailable: false,
        },
      },
      { B07: 'UNKNOWN', 'B07-REPLACE-DOCUMENTS': 'NOT_MET' },
    );
    statuses(
      D,
      { ...request, investment: { operation: 'replace-permanent' } },
      { 'D10-TERMS': 'UNKNOWN' },
    );
  });
});

describe('C · EU long-term residence', () => {
  test('SNS evidence, basic Portuguese, ordinary category and solidarity exclusion', () => {
    const request = { residence, longTerm };
    expect(pathway(C, request).status).toBe('MET');
    statuses(C, request, {
      C01: 'MET',
      'C01-SINGLE-ABSENCE': 'MET',
      'C01-TOTAL-ABSENCE': 'MET',
      'C01-CATEGORY': 'MET',
      C04: 'MET',
      C05: 'MET',
      C06: 'MET',
      C07: 'MET',
      C08: 'MET',
      C09: 'MET',
      'C09-FEE': 'MET',
    });
    statuses(
      C,
      {
        residence: {
          ...residence,
          means: { ...residence.means, solidarityReliance: true },
          healthCoverage: 'number-only',
          accommodation: 'none',
          language: { kind: 'foreign-portuguese-school', recognized: true },
          tax: 'arrears',
        },
        longTerm: {
          ...longTerm,
          currentCategory: 'temporary-protection',
          publicOrder: 'barred',
        },
      },
      {
        'C01-CATEGORY': 'NOT_MET',
        C04: 'NOT_MET',
        C05: 'UNKNOWN',
        C06: 'NOT_MET',
        C07: 'UNKNOWN',
        C08: 'NOT_MET',
        C09: 'NOT_MET',
      },
    );
    expect(
      pathway(C, {
        ...request,
        residence: { ...residence, healthCoverage: 'none' },
      }).status,
    ).toBe('NOT_MET');
  });

  test('successful protection application start, continuity and international-protection fee exemption', () => {
    const evidence = {
      ...longTerm,
      basis: 'international-protection' as const,
      qualifyingProtectionGranted: true,
      protectionApplicationDate: '2021-11-22',
      protectionContinuityVerified: true,
      protectionWithdrawal: 'clear' as const,
    };
    const request = { residence, longTerm: evidence };
    statuses(C, request, { C01: 'MET', C02: 'MET', 'C09-FEE': 'MET' });
    expect(condition(C, 'C09-FEE', request).explanation).toContain('exempt');
    statuses(
      C,
      {
        ...request,
        longTerm: {
          ...evidence,
          protectionApplicationDate: '2021-11-23',
          protectionWithdrawal: 'barred',
        },
      },
      { C01: 'NOT_MET', C02: 'NOT_MET' },
    );
    statuses(
      C,
      {
        ...request,
        longTerm: { ...evidence, protectionContinuityVerified: undefined },
      },
      { C01: 'UNKNOWN' },
    );
  });

  test('Blue Card five EU years, two Portuguese years, mixed-verification and absence limits', () => {
    const blueCard = {
      issuedByPortugal: true,
      staysVerified: true,
      continuousQualifyingEuFrom: '2021-11-23',
      continuousPortugueseBlueCardFrom: '2024-11-23',
      euAbsences: [],
    };
    const request = {
      residence,
      longTerm: { ...longTerm, basis: 'blue-card' as const, blueCard },
    };
    statuses(C, request, { C01: 'MET', C03: 'MET' });
    statuses(
      C,
      {
        ...request,
        longTerm: {
          ...request.longTerm,
          blueCard: {
            ...blueCard,
            continuousPortugueseBlueCardFrom: '2024-11-24',
          },
        },
      },
      { C03: 'NOT_MET' },
    );
    statuses(
      C,
      {
        ...request,
        longTerm: {
          ...request.longTerm,
          blueCard: { ...blueCard, staysVerified: false },
        },
      },
      { C03: 'UNKNOWN' },
    );
    const trips = (euAbsences: { departed: string; returned: string }[]) => ({
      ...request,
      longTerm: { ...request.longTerm, blueCard: { ...blueCard, euAbsences } },
    });
    statuses(C, trips([{ departed: '2022-01-01', returned: '2023-01-01' }]), {
      C03: 'NOT_MET',
    });
    statuses(C, trips([{ departed: '2022-01-01', returned: '2022-12-31' }]), {
      C03: 'MET',
    });
    statuses(
      C,
      trips([
        { departed: '2022-01-01', returned: '2022-11-01' },
        { departed: '2023-01-01', returned: '2023-11-01' },
      ]),
      { C03: 'NOT_MET' },
    );
  });

  test('recognized work postings are exempt from the ordinary absence budget', () => {
    const trip = { departed: '2022-01-01', returned: '2023-01-01' };
    statuses(
      C,
      { residence, longTerm, trips: [trip] },
      { 'C01-SINGLE-ABSENCE': 'NOT_MET' },
    );
    statuses(
      C,
      {
        residence,
        longTerm: { ...longTerm, acceptedWorkPostings: [trip] },
        trips: [trip],
      },
      { 'C01-SINGLE-ABSENCE': 'MET', 'C01-TOTAL-ABSENCE': 'MET' },
    );
  });

  test('former Blue Card holder and absence-based recovery have separate conditions', () => {
    const date = '2026-11-23';
    const retain = {
      permits: [
        { kind: 'eu-long-term' as const, from: '2021-11-23', to: '2026-01-01' },
      ],
      longTerm: {
        ...longTerm,
        lossReason: 'none' as const,
        formerBlueCard: true,
        euAbsences: [{ departed: '2024-11-23', returned: '2026-11-24' }],
      },
    };
    statuses(C, retain, { C10: 'UNKNOWN', 'C10-PILOT-ABSENCE': 'MET' });
    statuses(
      C,
      {
        ...retain,
        trips: [{ departed: '2024-11-23', returned: '2026-11-24' }],
      },
      { 'C10-PILOT-ABSENCE': 'UNKNOWN' },
    );
    statuses(
      C,
      { ...retain, longTerm: { ...retain.longTerm, lossException: 'barred' } },
      { C10: 'NOT_MET' },
    );
    statuses(
      C,
      { ...retain, longTerm: { ...retain.longTerm, lossException: 'clear' } },
      { C10: 'MET' },
    );
    expect(
      pathway(C, {
        residence,
        longTerm: { ...longTerm, operation: 'recover', lossReason: 'absence' },
      }).status,
    ).toBe('MET');
    expect(
      pathway(C, {
        residence,
        longTerm: { ...longTerm, operation: 'recover', lossReason: 'fraud' },
      }).status,
    ).toBe('NOT_MET');
    expect(
      pathway(C, { ...retain, simulationDate: date }).earliestDate,
    ).toBeUndefined();
  });
});

describe('D · investment residence', () => {
  const resources = {
    ...residence,
    means: { officialAssessment: 'clear' as const },
  };
  test('initial 90-day and criminal statutory exposure bounds, documents and legal entry', () => {
    const request = { residence: resources, investment };
    expect(pathway(D, request).status).toBe('MET');
    statuses(D, request, {
      D01: 'MET',
      D02: 'MET',
      'D02-HOUSING': 'MET',
      'D02-SOCIAL': 'MET',
      D03: 'MET',
      'D03-GENERAL': 'MET',
      D04: 'MET',
      'D04-HEALTH': 'MET',
      D05: 'MET',
      D06A: 'MET',
      'D-FEE': 'MET',
    });
    expect(condition(D, 'D-FEE', request).explanation).toContain('EUR 6314.20');
    const failed = {
      residence: {
        ...resources,
        accommodation: 'none' as const,
        healthCoverage: 'none' as const,
        means: { officialAssessment: 'barred' as const },
        generalRefusal: { comparablePortugueseConvictions: 2 },
        fees: { column: 'left' as const, paid: false },
      },
      investment: {
        ...investment,
        firstEntry: '2026-08-24',
        convictionMaximumYears: 1.01,
        foreignRecordDate: '2026-08-22',
        accompanyingTaxEvidenceDate: '2026-10-08',
        socialRegistration: 'missing' as const,
        investedOn: '2026-11-24',
      },
    };
    statuses(D, failed, {
      D01: 'NOT_MET',
      D02: 'NOT_MET',
      'D02-HOUSING': 'NOT_MET',
      'D02-SOCIAL': 'NOT_MET',
      D03: 'NOT_MET',
      'D03-GENERAL': 'NOT_MET',
      D04: 'NOT_MET',
      'D04-HEALTH': 'NOT_MET',
      D05: 'NOT_MET',
      'D-FEE': 'NOT_MET',
    });
    statuses(
      D,
      { ...request, investment: { ...investment, entry: 'visa-free' } },
      { D01: 'UNKNOWN' },
    );
  });

  test.each<[string, PtInvestment, PtInvestment]>([
    [
      'D06A',
      { kind: 'jobs', jobs: 8, lowDensity: true },
      { kind: 'jobs', jobs: 7, lowDensity: true },
    ],
    [
      'D06B',
      {
        kind: 'research',
        eur: 400000,
        lowDensity: true,
        recipientQualified: true,
      },
      {
        kind: 'research',
        eur: 399999,
        lowDensity: true,
        recipientQualified: true,
      },
    ],
    [
      'D06C',
      {
        kind: 'culture',
        eur: 200000,
        lowDensity: true,
        recipientQualified: true,
      },
      {
        kind: 'culture',
        eur: 199999,
        lowDensity: true,
        recipientQualified: true,
      },
    ],
    [
      'D06D',
      {
        kind: 'fund',
        eur: 500000,
        maturityYears: 5,
        portugalShare: 0.6,
        portugueseLaw: true,
      },
      {
        kind: 'fund',
        eur: 500000,
        maturityYears: 5,
        portugalShare: 0.5999,
        portugueseLaw: true,
      },
    ],
    [
      'D06E',
      {
        kind: 'company',
        eur: 500000,
        transaction: 'capital-increase',
        permanentJobsCreated: 4,
        jobsMaintained: 10,
        permanentJobsMaintained: 5,
        jobPeriodConfirmed: true,
        portugueseCompany: true,
      },
      {
        kind: 'company',
        eur: 500000,
        transaction: 'incorporation',
        permanentJobsCreated: 4,
        jobPeriodConfirmed: true,
        portugueseCompany: true,
      },
    ],
  ])('%s compares the exact investment threshold', (id, pass, fail) => {
    statuses(
      D,
      { residence: resources, investment: { ...investment, investment: pass } },
      { [id]: 'MET' },
    );
    statuses(
      D,
      { residence: resources, investment: { ...investment, investment: fail } },
      { [id]: 'NOT_MET' },
    );
  });

  test('possible low-density relief, unverified holdings and new real estate', () => {
    statuses(
      D,
      { investment: { ...investment, investment: { kind: 'jobs', jobs: 8 } } },
      { D06A: 'UNKNOWN' },
    );
    statuses(
      D,
      {
        investment: {
          ...investment,
          investment: { kind: 'research', eur: 500000 },
        },
      },
      { D06B: 'UNKNOWN' },
    );
    statuses(
      D,
      {
        investment: {
          ...investment,
          investment: {
            kind: 'culture',
            eur: 250000,
            recipientQualified: true,
          },
        },
      },
      { D06C: 'MET' },
    );
    statuses(
      D,
      {
        investment: {
          ...investment,
          investment: {
            kind: 'fund',
            eur: 500000,
            maturityYears: 4.99,
            portugalShare: 0.6,
            portugueseLaw: true,
          },
        },
      },
      { D06D: 'NOT_MET' },
    );
    statuses(
      D,
      {
        investment: {
          ...investment,
          realEstateExposure: true,
          investment: {
            kind: 'fund',
            eur: 500000,
            maturityYears: 5,
            portugalShare: 0.6,
            portugueseLaw: true,
          },
        },
      },
      { D05: 'NOT_MET', D06D: 'NOT_MET' },
    );
    statuses(
      D,
      {
        investment: {
          ...investment,
          investment: {
            kind: 'company',
            eur: 500000,
            transaction: 'incorporation',
            permanentJobsCreated: 5,
            portugueseCompany: true,
          },
        },
      },
      { D06E: 'UNKNOWN' },
    );
  });

  test('legacy old/current dates and official transition outcomes', () => {
    const legacy = {
      kind: 'legacy' as const,
      historicalType: 'property' as const,
    };
    statuses(
      D,
      {
        investment: {
          ...investment,
          investment: { ...legacy, originalApplication: '2023-10-07' },
        },
      },
      { D09: 'NOT_MET' },
    );
    statuses(
      D,
      {
        investment: {
          ...investment,
          investment: { ...legacy, originalApplication: '2023-10-06' },
        },
      },
      { D09: 'UNKNOWN' },
    );
    statuses(
      D,
      {
        investment: {
          ...investment,
          investment: {
            ...legacy,
            originalApplication: '2023-10-06',
            transition: 'clear',
          },
        },
      },
      { D09: 'MET' },
    );
  });

  test('renewal preserves stay calculations but still requires continued investment and family eligibility', () => {
    const permits = [
      { kind: 'golden-visa' as const, from: '2024-01-23', to: '2026-12-31' },
    ];
    const evidence = {
      operation: 'renew' as const,
      holder: 'family' as const,
      relationshipContinues: true,
      familyEvidenceAccepted: true,
      maintenance: 'maintained' as const,
      documentsReady: true,
    };
    const request = {
      residence: resources,
      investment: evidence,
      permits,
      renewal,
    };
    const original = evaluatePortugal({ ...adult, ...request }).pathways[3];
    statuses(D, request, {
      'D07-WINDOW': 'MET',
      'D07-STAY': 'MET',
      D07: 'MET',
      D08: 'MET',
      'D08-CRIME': 'MET',
      'D08-GENERAL': 'MET',
    });
    expect(condition(D, 'D07-STAY', request).sources).toEqual(
      original.checks[1].sources,
    );
    const path = pathway(D, request);
    expect(path).toMatchObject({ status: 'MET', earliestDate: '2026-11-23' });
    expect(path.checks.some(({ id }) => /^PT-D0[156]/.test(id))).toBe(false);
    statuses(
      D,
      {
        ...request,
        investment: {
          ...evidence,
          familyEvidenceAccepted: false,
          maintenance: 'ended',
        },
        renewal: { ...renewal, contumacia: 'active' },
        residence: { ...resources, generalRefusal: { ucfeExclusion: true } },
      },
      {
        D07: 'NOT_MET',
        D08: 'NOT_MET',
        'D08-CRIME': 'NOT_MET',
        'D08-GENERAL': 'NOT_MET',
      },
    );
    statuses(
      D,
      { ...request, investment: { ...evidence, maintenance: 'changed' } },
      { D07: 'UNKNOWN' },
    );
  });
});

describe('E · ordinary temporary renewal', () => {
  const resources = {
    ...residence,
    means: { officialAssessment: 'clear' as const },
  };

  test('30–90 day renewal window and separable evidence, fees and criminal checks', () => {
    const request = { residence: resources, renewal };
    expect(pathway(E, request).status).toBe('MET');
    expect(pathway(E, request).earliestDate).toBe('2026-11-23');
    statuses(E, request, {
      E01: 'MET',
      E02: 'MET',
      E03: 'MET',
      E04: 'MET',
      E05: 'MET',
      'E05-GENERAL': 'MET',
      E06: 'MET',
      'E06-DOCUMENTS': 'MET',
      E07: 'MET',
    });
    statuses(
      E,
      { ...request, renewal: { ...renewal, filedOn: '2026-10-24' } },
      { E01: 'MET' },
    );
    statuses(
      E,
      { ...request, renewal: { ...renewal, filedOn: '2026-10-23' } },
      { E01: 'NOT_MET' },
    );
    statuses(
      E,
      { ...request, simulationDate: '2026-12-24' },
      { E01: 'UNKNOWN' },
    );
    statuses(
      E,
      {
        ...request,
        simulationDate: '2026-12-24',
        renewal: { ...renewal, lateSubmissionAccepted: true },
      },
      { E01: 'MET' },
    );
    statuses(
      E,
      {
        residence: {
          ...resources,
          means: { officialAssessment: 'barred' },
          accommodation: 'none',
          tax: 'arrears',
          criminalSentence: { scope: 'complete', totalYears: 1.01 },
          generalRefusal: { sisAlert: true },
          travelDocumentValid: false,
          fees: { column: 'left', paid: false },
        },
        renewal: { ...renewal, purposeEvidence: false },
      },
      {
        E02: 'NOT_MET',
        E03: 'NOT_MET',
        E04: 'NOT_MET',
        E05: 'NOT_MET',
        'E05-GENERAL': 'NOT_MET',
        E06: 'NOT_MET',
        'E06-DOCUMENTS': 'NOT_MET',
        E07: 'NOT_MET',
      },
    );
  });

  test('study medical and purpose requirements and excused filing after release', () => {
    const study = {
      ...renewal,
      purpose: 'study' as const,
      studyEnrolled: true,
      studyProgress: true,
      feesAndInternshipEvidence: true,
      filedOn: '2026-11-23',
      releasedOn: '2026-10-24',
    };
    statuses(
      E,
      { residence: resources, renewal: study },
      { E06: 'MET', 'E06-STUDY-HEALTH': 'MET', 'E01-RELEASE': 'MET' },
    );
    statuses(
      E,
      {
        residence: { ...resources, healthCoverage: 'none' },
        renewal: { ...study, releasedOn: '2026-10-23', studyEnrolled: false },
      },
      {
        E06: 'NOT_MET',
        'E06-STUDY-HEALTH': 'NOT_MET',
        'E01-RELEASE': 'NOT_MET',
      },
    );
    statuses(
      E,
      {
        residence: resources,
        renewal: {
          ...study,
          studyEnrolled: false,
          studyInterruptionAccepted: true,
        },
      },
      { E06: 'MET' },
    );
  });

  test('a renewal receipt has 60 days of equivalent effect, unless formally extended', () => {
    const end = { renewal: { ...renewal, receiptIssuedOn: '2026-09-24' } };
    statuses(E, end, { 'E01-RECEIPT': 'MET' });
    statuses(
      E,
      { ...end, simulationDate: '2026-11-24' },
      { 'E01-RECEIPT': 'NOT_MET' },
    );
    statuses(
      E,
      {
        ...end,
        simulationDate: '2026-11-24',
        renewal: { ...end.renewal, receiptExtendedThrough: '2026-12-23' },
      },
      { 'E01-RECEIPT': 'MET' },
    );
    statuses(
      E,
      {
        simulationDate: '2026-12-24',
        renewal: { ...renewal, lateSubmissionAccepted: false },
      },
      { E01: 'NOT_MET' },
    );
  });

  test('scheduled AIMA fees use the archived date range only', () => {
    const before = condition(E, 'E07', {
      residence,
      renewal,
      simulationDate: '2026-02-28',
    });
    const start = condition(E, 'E07', {
      residence,
      renewal,
      simulationDate: '2026-03-01',
    });
    const next = condition(E, 'E07', {
      residence,
      renewal,
      simulationDate: '2027-03-01',
    });
    expect(before.status).toBe('UNKNOWN');
    expect(start.status).toBe('MET');
    expect(start.explanation).toContain('EUR 85.80');
    expect(next.status).toBe('UNKNOWN');
  });
});

describe('F · free movement', () => {
  test('other-family permission does not apply to an EU resident relying on their own work', () => {
    const request = {
      freeMovement: {
        ...freeMovement,
        historicalBasisReview: undefined,
        identityAtEntryValid: true,
        residenceBasis: 'worker' as const,
        relationship: 'other-family' as const,
      },
    };
    statuses(F, request, { F01: 'MET', F03: 'MET' });
    expect(pathway(F, request)).toMatchObject({
      status: 'MET',
      earliestDate: '2026-11-23',
    });
  });

  test('ordinary five years, lawful basis, public restrictions, registration and age-specific charges', () => {
    const request = { route: 'eu' as const, freeMovement };
    expect(pathway(F, request).status).toBe('MET');
    expect(pathway(B, request).status).toBe('NOT_APPLICABLE');
    statuses(F, request, {
      F01: 'MET',
      F02: 'MET',
      F03: 'MET',
      F07: 'MET',
      F08: 'MET',
      F09: 'MET',
    });
    expect(condition(F, 'F09', request).explanation).toContain('EUR 15.00');
    statuses(
      F,
      {
        ...request,
        birthDate: '2001-11-23',
        freeMovement: {
          ...freeMovement,
          continuousResidenceFrom: '2021-11-24',
          historicalBasisReview: 'barred',
          documents: 'missing-or-expired',
          publicRestrictions: 'barred',
        },
      },
      {
        F02: 'NOT_MET',
        F03: 'NOT_MET',
        F07: 'UNKNOWN',
        F08: 'NOT_MET',
        F09: 'UNKNOWN',
      },
    );
    statuses(
      F,
      { freeMovement: { ...freeMovement, applicant: 'andorra' } },
      { F01: 'UNKNOWN' },
    );
    const infant = condition(F, 'F09', {
      birthDate: '2025-11-23',
      freeMovement: {
        ...freeMovement,
        feeMode: 'in-person',
        feePaid: undefined,
      },
    });
    expect(infant.status).toBe('MET');
    expect(infant.explanation).toContain('EUR 0.00');
  });

  test('exact six ordinary months, justified twelve months, and loss only beyond two years', () => {
    const trip = (
      returned: string,
      reason: 'ordinary' | 'justified' = 'ordinary',
    ) => ({
      freeMovement: {
        ...freeMovement,
        absences: [
          { departed: '2023-04-01', returned, reason, accepted: true },
        ],
      },
    });
    statuses(F, trip('2023-10-01'), { F02: 'MET' });
    statuses(F, trip('2023-10-02'), { F02: 'NOT_MET' });
    statuses(F, trip('2024-04-01', 'justified'), { F02: 'MET' });
    statuses(F, trip('2024-04-02', 'justified'), { F02: 'NOT_MET' });
    const held = (returned: string) => ({
      freeMovement: {
        ...freeMovement,
        operation: 'retain' as const,
        permanentRightAcquiredOn: '2021-11-23',
        absences: [{ departed: '2022-11-23', returned }],
      },
    });
    statuses(F, held('2024-11-23'), { 'F02-RETENTION': 'MET' });
    statuses(F, held('2024-11-24'), { 'F02-RETENTION': 'NOT_MET' });
  });

  test('short trips within the same year pass when far below the statutory limit', () => {
    statuses(
      F,
      {
        freeMovement,
        trips: [
          { departed: '2023-05-01', returned: '2023-05-15' },
          { departed: '2023-06-01', returned: '2023-06-12' },
        ],
      },
      { F02: 'MET' },
    );
    statuses(
      F,
      {
        freeMovement,
        trips: [
          { departed: '2023-02-01', returned: '2023-06-01' },
          { departed: '2023-07-01', returned: '2023-11-01' },
        ],
      },
      { F02: 'UNKNOWN' },
    );
  });

  test('a descendant becomes subject to dependency on the 21st birthday, and family rights can be retained', () => {
    const family = {
      ...freeMovement,
      applicant: 'third-country-family' as const,
      sponsorEligible: true,
      relationship: 'descendant' as const,
      relationshipVerified: true,
      dependant: false,
      accompaniesOrJoins: true,
      livedWithSponsor: true,
    };
    statuses(
      F,
      { freeMovement: family, birthDate: '2005-11-24' },
      { F01: 'MET', F02: 'MET' },
    );
    statuses(
      F,
      { freeMovement: family, birthDate: '2005-11-23' },
      { F01: 'NOT_MET' },
    );
    const retained = {
      ...family,
      basis: 'retained-family' as const,
      dependant: true,
      retentionEvent: 'death' as const,
      retainedBasis: 'worker' as const,
    };
    statuses(F, { freeMovement: retained }, { F04: 'MET' });
    statuses(
      F,
      { freeMovement: { ...retained, retainedBasis: 'none' } },
      { F04: 'NOT_MET' },
    );
    statuses(
      F,
      {
        freeMovement: {
          ...retained,
          retainedBasis: 'resources-and-insurance',
          sufficientResources: true,
        },
      },
      { F04: 'UNKNOWN' },
    );
  });

  test('past lawful basis checks admission, reciprocal insurance and resources separately', () => {
    const student = {
      ...freeMovement,
      historicalBasisReview: undefined,
      identityAtEntryValid: true,
      residenceBasis: 'student' as const,
      enrolledInRecognizedSchool: true,
      sufficientResources: true,
      healthInsuranceRequired: false,
    };
    statuses(F, { freeMovement: student }, { F03: 'MET' });
    statuses(
      F,
      {
        freeMovement: {
          ...student,
          healthInsuranceRequired: true,
          healthInsuranceCovered: false,
        },
      },
      { F03: 'NOT_MET' },
    );
    statuses(
      F,
      { freeMovement: { ...student, healthInsuranceRequired: undefined } },
      { F03: 'UNKNOWN' },
    );
  });

  test('early workers and co-resident family, including strict old-age residence and disability exception', () => {
    const retirement = {
      ...freeMovement,
      basis: 'early-worker' as const,
      earlyWorker: {
        reason: 'retirement' as const,
        retirementQualifies: true,
        continuousResidenceFrom: '2023-11-22',
        creditedWorkFrom: '2025-11-23',
        portuguesePartnerException: false,
      },
    };
    statuses(
      F,
      { freeMovement: retirement },
      { F05: 'MET', 'F02-EARLY-CONTINUITY': 'MET' },
    );
    statuses(
      F,
      {
        freeMovement: {
          ...retirement,
          expulsionExecuted: true,
          earlyWorker: {
            ...retirement.earlyWorker,
            continuousResidenceFrom: '2023-11-23',
          },
        },
      },
      { F05: 'NOT_MET', 'F02-EARLY-CONTINUITY': 'NOT_MET' },
    );
    statuses(
      F,
      {
        freeMovement: {
          ...retirement,
          earlyWorker: {
            reason: 'permanent-disability',
            occupationalBenefit: true,
          },
        },
      },
      { F05: 'MET' },
    );
    statuses(
      F,
      {
        birthDate: '1966-11-23',
        freeMovement: {
          ...retirement,
          earlyWorker: {
            ...retirement.earlyWorker,
            selfEmployedWithoutPension: true,
          },
        },
      },
      { F05: 'MET' },
    );
    statuses(
      F,
      {
        birthDate: '1966-11-24',
        freeMovement: {
          ...retirement,
          earlyWorker: {
            ...retirement.earlyWorker,
            selfEmployedWithoutPension: true,
          },
        },
      },
      { F05: 'NOT_MET' },
    );
    const family = {
      ...freeMovement,
      basis: 'early-family' as const,
      relationship: 'spouse' as const,
      relationshipVerified: true,
      sponsorEligible: true,
      earlyFamily: {
        livedWithWorker: true,
        workerEarlyRight: false,
        workerDiedWhileWorking: true,
        workerResidenceFrom: '2020-01-01',
        deathDate: '2022-01-01',
        occupationalDeath: false,
        survivorLostPortugueseNationality: false,
      },
    };
    statuses(F, { freeMovement: family }, { F01: 'MET', F06: 'MET' });
    expect(pathway(F, { freeMovement: family }).status).toBe('MET');
    expect(
      pathway(F, {
        freeMovement: { ...family, relationshipVerified: undefined },
      }).status,
    ).toBe('UNKNOWN');
    statuses(
      F,
      {
        freeMovement: {
          ...family,
          earlyFamily: {
            ...family.earlyFamily,
            workerResidenceFrom: '2020-01-02',
          },
        },
      },
      { F06: 'NOT_MET' },
    );
  });
});

describe('G · partner nationality', () => {
  test('after three years, above six years or common Portuguese child, and mandatory bars', () => {
    const request = { partner, nationality };
    expect(pathway(G, request).status).toBe('MET');
    statuses(G, request, {
      G01: 'MET',
      'G03-CRIME': 'MET',
      'G03-SECURITY': 'MET',
      'G03-SANCTIONS': 'MET',
      G04: 'MET',
      G05: 'MET',
      G06: 'MET',
      'G06-FEE': 'MET',
    });
    statuses(
      G,
      {
        ...request,
        partner: {
          ...partner,
          relationshipFrom: '2023-11-23',
          documentsReady: false,
        },
        nationality: {
          crime: { review: 'barred' },
          security: 'barred',
          sanctions: 'barred',
        },
      },
      {
        G01: 'NOT_MET',
        'G03-CRIME': 'NOT_MET',
        'G03-SECURITY': 'NOT_MET',
        'G03-SANCTIONS': 'NOT_MET',
        G04: 'UNKNOWN',
        G05: 'UNKNOWN',
        G06: 'NOT_MET',
      },
    );
    statuses(
      G,
      { ...request, partner: { ...partner, relationshipFrom: '2020-11-23' } },
      { G01: 'MET', G04: 'UNKNOWN', G05: 'UNKNOWN' },
    );
    statuses(
      G,
      {
        ...request,
        partner: {
          ...partner,
          relationshipFrom: '2020-11-23',
          commonPortugueseChild: true,
        },
      },
      { G04: 'MET', G05: 'MET' },
    );
    statuses(
      G,
      {
        ...request,
        partner: { ...partner, partnerPortugueseSince: '2024-01-01' },
      },
      { G01: 'UNKNOWN' },
    );
  });

  test('civil partnership needs court recognition; certificate freshness is a document matter', () => {
    const civil = {
      ...partner,
      kind: 'civil-partnership' as const,
      courtRecognition: true,
      partnerStatementDate: '2026-08-23',
    };
    statuses(
      G,
      { partner: civil, nationality },
      { G02: 'MET', 'G06-PARTNER-STATEMENT': 'MET' },
    );
    statuses(
      G,
      {
        partner: {
          ...civil,
          courtRecognition: false,
          partnerStatementDate: '2026-08-22',
        },
        nationality,
      },
      { G02: 'NOT_MET', 'G06-PARTNER-STATEMENT': 'NOT_MET' },
    );
  });

  test('pending earlier declaration can exclude connection opposition at exactly six years, while service is assessed', () => {
    const old = {
      ...partner,
      pendingApplication: '2026-05-18',
      relationshipFrom: '2020-05-18',
      serviceReview: 'barred' as const,
    };
    const request = { partner: old, nationality };
    statuses(G, request, { G04: 'MET', G05: 'NOT_MET' });
    expect(condition(G, 'G04', request).explanation).toContain('1 year(s)');
    statuses(
      G,
      { ...request, partner: { ...old, pendingApplication: '2026-05-19' } },
      { 'G-VERSION': 'UNKNOWN' },
    );
    expect(condition(G, 'G04', { partner, nationality }).explanation).toContain(
      '2 year(s)',
    );
  });
});
