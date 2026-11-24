import { expect, test } from 'vitest';
import {
  evaluateGreeceFull,
  type GrFullPathwayId,
  type GrFullRequest,
} from '../src';

function assess(
  id: GrFullPathwayId,
  simulationDate: string,
  facts: Partial<GrFullRequest>,
) {
  return evaluateGreeceFull({
    filingDocuments: { formReady: true, feeReceiptReady: true },
    citizenship: 'third-country',
    birthDate: '1985-01-01',
    passport: { kind: 'exception-granted' },
    publicOrder: 'clear',
    publicHealth: 'cleared',
    insurance: { kind: 'public', coversFamily: true },
    biometrics: 'provided',
    entry: 'permit',
    ...facts,
    simulationDate,
    pathways: [id],
  }).columns[0].pathways[0];
}

test.each([
  [false, 'NOT_MET'],
  [undefined, 'UNKNOWN'],
  [true, 'MET'],
] as const)(
  'an adult heir filing Β.5 on the property reform date supplies Ε9 (%s)',
  (e9DeclarationCopy, filingStatus) => {
    const filing = '2024-04-05';
    const facts: Partial<GrFullRequest> = {
      birthDate: '2006-04-05',
      entry: 'outside',
      overseasInvestorMandate: true,
      goldenVisa: {
        stage: 'initial',
        regime: 'current',
        originalConditionsStillMet: true,
        kind: 'standard',
        zone: 'named-high-cost',
        assessedValueEur: 800000,
        acquisition: 'inheritance',
        title: 'sole',
        notarialEvidence: true,
        registeredTransferEvidence: true,
        e9DeclarationCopy,
        use: 'residential-or-long-let',
        worksInGreeceUnderThisPermit: false,
        family: [],
      },
    };
    const day = assess('GR-GOLDEN-VISA', filing, facts);
    const before = assess('GR-GOLDEN-VISA', '2024-04-04', facts);
    expect(day.checks.find((check) => check.id === 'GV-03')?.status).toBe(
      filingStatus,
    );
    expect(day.status).toBe(filingStatus);
    if (filingStatus === 'MET') {
      expect(before).toMatchObject({ status: 'FUTURE', earliestDate: filing });
    } else {
      expect(before.checks.find((check) => check.id === 'GV-03')?.status).toBe(
        filingStatus,
      );
      expect(before.status).toBe(filingStatus);
      expect(before.earliestDate).toBeUndefined();
    }
  },
);

test.each([
  ['2007-11-10', '2025-11-10', 'NOT_MET'],
  ['2007-11-11', '2025-11-11', 'FUTURE'],
  ['2007-11-12', '2025-11-12', 'FUTURE'],
] as const)(
  'Β.5 heir born on %s presents a registration application receipt on attaining majority',
  (birthDate, filing, forecastStatus) => {
    const facts: Partial<GrFullRequest> = {
      birthDate,
      entry: 'outside',
      overseasInvestorMandate: true,
      goldenVisa: {
        stage: 'initial',
        regime: 'current',
        kind: 'standard',
        zone: 'named-high-cost',
        assessedValueEur: 800000,
        acquisition: 'inheritance',
        title: 'sole',
        notarialEvidence: true,
        registeredTransferEvidence: 'application-receipt',
        e9DeclarationCopy: true,
        use: 'residential-or-long-let',
        worksInGreeceUnderThisPermit: false,
        family: [],
      },
    };
    const forecast = assess('GR-GOLDEN-VISA', '2025-11-10', facts);
    const filed = assess('GR-GOLDEN-VISA', filing, facts);
    expect(forecast.status).toBe(forecastStatus);
    expect(forecast.earliestDate).toBe(
      forecastStatus === 'FUTURE' ? filing : undefined,
    );
    const filingStatus = forecastStatus === 'FUTURE' ? 'MET' : 'NOT_MET';
    expect(filed.checks.find((c) => c.id === 'GV-03')?.status).toBe(
      filingStatus,
    );
    expect(filed.status).toBe(filingStatus);
    if (forecastStatus === 'FUTURE')
      expect(
        forecast.checks.find((c) => c.id === 'GV-03')?.explanation,
      ).toContain(filing);
  },
);

test('Ο.3 conversion on the reform date needs evidence of the interruption after the old card expired', () => {
  const facts: Partial<GrFullRequest> = {
    greekFamily: {
      stage: 'permanent',
      relationship: 'spouse',
      registeredInGreece: true,
      genuineRelationship: true,
      qualifyingResidenceDocumented: true,
      residenceFrom: '2021-02-06',
      priorCardExpiry: '2026-02-05',
      maxAnnualAbsenceMonths: 0,
      longestConsecutiveAbsenceYears: 0,
    },
  };
  for (const date of ['2026-02-05', '2026-02-06']) {
    const route = assess('GR-GREEK-FAMILY-PR', date, facts);
    expect(route.checks.find((check) => check.id === 'GF-03')?.status).toBe(
      'UNKNOWN',
    );
    expect(route.status).toBe('UNKNOWN');
    expect(route.earliestDate).toBeUndefined();
  }
});

test('Μ.3 can open on the residence anniversary when the new conversion no longer requires insurance', () => {
  const filing = '2026-02-07';
  const facts: Partial<GrFullRequest> = {
    insurance: { kind: 'uninsured' },
    greekFamily: {
      stage: 'permanent',
      relationship: 'spouse',
      registeredInGreece: true,
      genuineRelationship: true,
      qualifyingResidenceDocumented: true,
      residenceFrom: '2021-02-07',
      priorCardExpiry: filing,
      maxAnnualAbsenceMonths: 0,
      longestConsecutiveAbsenceYears: 0,
    },
  };
  const before = assess('GR-GREEK-FAMILY-PR', '2026-02-05', facts);
  expect(before).toMatchObject({ status: 'FUTURE', earliestDate: filing });
  expect(before.checks.find((item) => item.id === 'GF-03')).toMatchObject({
    status: 'NOT_MET',
    explanation: expect.stringContaining(filing),
  });
  expect(assess('GR-GREEK-FAMILY-PR', filing, facts).status).toBe('MET');
});

test.each([
  [false, 'NOT_MET'],
  [undefined, 'UNKNOWN'],
  [true, 'MET'],
] as const)(
  'Ο.1 renewal opening on the child’s eighteenth birthday assesses the new adult dependency exception (%s)',
  (adultChildIncapacityDependencyProved, filingStatus) => {
    const filing = '2026-02-06';
    const facts: Partial<GrFullRequest> = {
      birthDate: '2008-02-06',
      currentCardExpiresOn: '2026-04-06',
      familyTcn: {
        stage: 'renewal',
        sponsor: 'ordinary',
        sponsorPermitValid: true,
        member: 'child',
        unmarriedChildWithCustodyAndConsent: true,
        adultChildIncapacityDependencyProved,
        priorYearTaxAndInsuranceEvidence: true,
        relationshipAndDocumentsGenuine: true,
        unchangedFamilyDeclaration: true,
        familyLifeContinues: true,
      },
    };
    const day = assess('GR-FAMILY-TCN', filing, facts);
    const before = assess('GR-FAMILY-TCN', '2026-02-05', facts);
    for (const route of [day, before]) {
      expect(route.checks.find((check) => check.id === 'FT-05')?.status).toBe(
        filingStatus,
      );
    }
    expect(day.status).toBe(filingStatus);
    expect(before.status).toBe(
      filingStatus === 'MET' ? 'FUTURE' : filingStatus,
    );
    expect(before.earliestDate).toBe(
      filingStatus === 'MET' ? filing : undefined,
    );
  },
);

test.each([
  ['2008-07-16', 'MET'],
  ['2008-07-15', 'NOT_MET'],
  ['2008-07-01', 'NOT_MET'],
] as const)(
  'Ο.1 renewal checks a child born on %s when the window opens under the same law',
  (birthDate, filingStatus) => {
    const filing = '2026-07-15';
    const facts: Partial<GrFullRequest> = {
      birthDate,
      currentCardExpiresOn: '2026-09-15',
      familyTcn: {
        stage: 'renewal',
        sponsor: 'ordinary',
        sponsorPermitValid: true,
        member: 'child',
        unmarriedChildWithCustodyAndConsent: true,
        adultChildIncapacityDependencyProved: false,
        priorYearTaxAndInsuranceEvidence: true,
        relationshipAndDocumentsGenuine: true,
        unchangedFamilyDeclaration: true,
        familyLifeContinues: true,
      },
    };
    const forecast = assess('GR-FAMILY-TCN', '2026-06-20', facts);
    const filed = assess('GR-FAMILY-TCN', filing, facts);
    expect(filed.status).toBe(filingStatus);
    for (const route of [filed, forecast])
      expect(route.checks.find((c) => c.id === 'FT-05')?.status).toBe(
        filed.status,
      );
    expect(forecast.status).toBe(
      filed.status === 'MET' ? 'FUTURE' : filed.status,
    );
    expect(forecast.earliestDate).toBe(
      filed.status === 'MET' ? filing : undefined,
    );
  },
);

test.each([
  [undefined, 'UNKNOWN'],
  [0, 'MET'],
] as const)(
  'Μ.3 checks the interruption after card expiry (%s) on the next-day residence anniversary',
  (interruptionAfterExpiryYears, filingStatus) => {
    const filing = '2026-11-24';
    const facts: Partial<GrFullRequest> = {
      greekFamily: {
        stage: 'permanent',
        relationship: 'spouse',
        registeredInGreece: true,
        genuineRelationship: true,
        qualifyingResidenceDocumented: true,
        residenceFrom: '2021-11-24',
        priorCardExpiry: '2026-11-23',
        maxAnnualAbsenceMonths: 0,
        longestConsecutiveAbsenceYears: 0,
        interruptionAfterExpiryYears,
      },
    };
    const forecast = assess('GR-GREEK-FAMILY-PR', '2026-10-30', facts);
    const filed = assess('GR-GREEK-FAMILY-PR', filing, facts);
    expect(filed.checks.find((c) => c.id === 'GF-03')?.status).toBe(
      filingStatus,
    );
    expect(filed.status).toBe(filingStatus);
    if (filed.status === 'MET') {
      expect(forecast).toMatchObject({
        status: 'FUTURE',
        earliestDate: filing,
      });
    } else {
      expect(forecast.checks.find((c) => c.id === 'GF-03')?.status).toBe(
        filed.status,
      );
      expect(forecast.status).toBe(filed.status);
      expect(forecast.earliestDate).toBeUndefined();
    }
  },
);

test('Ε.4 renewal projected across the reform uses the card duration at filing', () => {
  const facts: Partial<GrFullRequest> = {
    currentCardExpiresOn: '2026-04-06',
    work: { permit: 'E4', stage: 'renewal', taxesSettledDuringPermit: true },
  };
  const before = assess('GR-WORK', '2026-02-05', facts);
  const day = assess('GR-WORK', '2026-02-06', facts);
  expect(day.status).toBe('MET');
  expect(before).toMatchObject({
    status: 'FUTURE',
    earliestDate: '2026-02-06',
  });
  for (const route of [before, day])
    expect(
      route.checks.find((check) => check.id === 'WK-08')?.explanation,
    ).toContain('5 年');
});

test('Ν permanent residence reaches its own five-year anniversary across the reform', () => {
  const facts: Partial<GrFullRequest> = {
    euFamily: {
      stage: 'permanent',
      qualifyingNonGreekEuSponsorAndRelationship: true,
      sponsorExercisedTreatyRights: true,
      qualifyingResidenceDocumented: true,
      residenceFrom: '2021-02-07',
      priorCardExpiry: '2026-02-07',
      maxOrdinaryAnnualAbsenceMonths: 0,
      seriousAbsenceCount: 0,
      rightsDocumentsReady: true,
      shamOrFraud: false,
      early: { basis: 'none' },
    },
  };
  expect(assess('GR-EU-FAMILY-PR', '2026-02-05', facts)).toMatchObject({
    status: 'FUTURE',
    earliestDate: '2026-02-07',
  });
  expect(assess('GR-EU-FAMILY-PR', '2026-02-07', facts).status).toBe('MET');
});

test('naturalisation refiling across the reform retains the citizenship-code waiting period', () => {
  const facts: Partial<GrFullRequest> = {
    route: 'general',
    permits: [{ kind: 'regular', from: '2016-01-01' }],
    trips: [],
    nationality: {
      stage: 'application',
      permit: 'listed',
      convictions: [],
      removalOrStatusProceedings: false,
      exam: 'certificate',
      economicActivity: 'stable-declared-work',
      livingResources: 'substantiated',
      incomeByTaxYear: Object.fromEntries(
        [2018, 2019, 2020, 2021, 2022].map((year) => [
          year,
          { taxableEur: 18000, dependants: 0 },
        ]),
      ),
      taxAndSocialInsuranceCurrent: true,
      integrationAssessment: 'accepted',
      civilStatusProof: 'legalised-translation',
      hasAmka: true,
      hasTaxAssessments: true,
      lastRejection: '2023-04-06',
    },
  };
  expect(assess('GR-NATIONALITY', '2024-04-04', facts)).toMatchObject({
    status: 'FUTURE',
    earliestDate: '2024-04-06',
  });
  expect(assess('GR-NATIONALITY', '2024-04-06', facts)).toMatchObject({
    status: 'MET',
    earliestDate: '2024-04-06',
  });
});
