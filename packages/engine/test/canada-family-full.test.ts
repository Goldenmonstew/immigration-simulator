import { expect, test } from 'vitest';
import { evaluateCanadaFull } from '../src';
import type { FamilyAnswers } from '../src/canada-full/family';
import { federal, filed, person } from './canada-federal-fixture';

const base: FamilyAnswers = {
  relationship: 'spouse',
  quebec: false,
  filingDate: '2026-11-23',
  sponsorBirthDate: '1980-01-01',
  sponsorStatus: 'citizen',
  sponsorInCanada: true,
  noDuplicateSponsorship: true,
  sponsorshipFiled: true,
  sponsorPreviouslySponsoredAsPartner: false,
  noActivePartnerUndertaking: true,
  sponsor: {
    notWithdrawn: true,
    noRemovalOrder: true,
    notDetained: true,
    criminalBarCleared: true,
    noProceedingSuspension: true,
    noUndertakingOrSupportDefault: true,
    immigrationDebtClear: true,
    bankruptcyDischargedOrAbsent: true,
    socialAssistancePermittedOrAbsent: true,
  },
  genuineAndContinuingRelationship: true,
  marriageRecognizedAndEligible: true,
  child: { priorDisclosureExamOrExceptionConfirmed: true },
  applicationClass: 'family',
  multigenerationalDependants: false,
  federalUndertakingAndAgreementSigned: true,
};
const qc: NonNullable<FamilyAnswers['province']> = {
  eligibilityLetterOrQualifyingInlandAor: true,
  letterDate: '2025-06-30',
  submissionDate: '2026-11-23',
  sponsorResidenceOrReturnConfirmed: true,
  provincialFinancialAndConductBarsClear: true,
  custodyConsentIfRequired: true,
  undertakingAndAdultDeclarationsSigned: true,
  integrationPlanIfRequiredSigned: true,
  mifiDecision: 'approved',
  ownHouseholdSize: 1,
  sponsoredGroups: [{ adults: 1, children: 1 }],
  eligibleCanadianIncome: 29642,
  eligibleCanadianAssets: 29131,
  resourcesSustainable: true,
  intakeExemptionConfirmed: false,
  intakeCapacityConfirmed: true,
  applications: 1,
  additionalPersons: 1,
  feesPaid: true,
};
function inspect(id: string, changes: FamilyAnswers = {}, dob = '1990-11-23') {
  const p = evaluateCanadaFull({
    simulationDate: '2026-11-23',
    dateOfBirth: dob,
    locale: 'en',
    family: { ...base, ...changes },
  }).columns[0].pathways.find((p) => p.id === 'CA-FAMILY')!;
  return p.checks.find((c) => c.id === `CA-R${id}`)!;
}
function filedFamily(
  family: FamilyAnswers,
  dateOfBirth = '1990-01-01',
  application: Partial<typeof filed> = {},
) {
  return evaluateCanadaFull({
    simulationDate: '2026-11-23',
    dateOfBirth,
    family: { ...base, filingDate: undefined, ...family },
    federal: {
      ...federal,
      principal: {
        ...person,
        dateOfBirth,
        exam: {
          instructionOn: '2026-10-23',
          examOn: '2026-11-05',
          panelExamComplete: true,
        },
      },
      applications: {
        'CA-FAMILY': { ...filed, filedOn: '2026-10-20', ...application },
      },
    },
  }).columns[0].pathways.find((p) => p.id === 'CA-FAMILY')!;
}

test('R73 counts cohabitation up to the family application receipt', () => {
  const partner = {
    relationship: 'common-law',
    cohabitationSince: '2025-11-01',
    deemedCommonLawAccepted: false,
  } as const;
  for (const [filedOn, expected] of [
    ['2026-10-20', 'NOT_MET'],
    ['2026-11-01', 'MET'],
  ] as const) {
    const result = filedFamily(partner, undefined, { filedOn });
    expect(result.checks.find((c) => c.id === 'CA-R24')?.status).toBe('MET');
    expect(result.checks.find((c) => c.id === 'CA-R73')?.status).toBe(expected);
    expect(result.status).toBe(expected);
  }
});

test('R74 locks child age on confirmed complete receipt, including a later resubmission', () => {
  const child: FamilyAnswers = {
    relationship: 'child',
    child: {
      ...base.child,
      parentageConfirmed: true,
      custodyAndConsentReady: true,
      unmarriedAndUnpartnered: true,
      dependentBeforeCutoffAndContinuing: false,
    },
  };
  for (const [
    applicationEvidenceComplete,
    completeApplicationReceived,
    expected,
  ] of [
    [true, undefined, 'MET'],
    [undefined, undefined, 'UNKNOWN'],
    [true, '2026-11-05', 'NOT_MET'],
  ] as const) {
    const result = filedFamily(
      { ...child, completeApplicationReceived },
      '2004-11-01',
      {
        applicationEvidenceComplete,
      },
    );
    expect(result.checks.find((c) => c.id === 'CA-R74')?.status).toBe(expected);
    expect(result.status).toBe(expected);
  }
});

test('sponsor at age 18, abroad or previously sponsored; suspension and defaults', () => {
  expect(inspect('71', { sponsorBirthDate: '2008-11-23' }).status).toBe('MET');
  expect(inspect('71', { sponsorBirthDate: '2008-11-24' }).status).toBe(
    'NOT_MET',
  );
  const foreign = { sponsorInCanada: false, returnToCanadaConfirmed: true };
  expect(inspect('71', foreign).status).toBe('MET');
  expect(inspect('71', { ...foreign, sponsorStatus: 'pr' }).status).toBe(
    'NOT_MET',
  );
  expect(inspect('71', { sponsorStatus: 'registered-indian' }).status).toBe(
    'UNKNOWN',
  );
  for (const [start, status] of [
    ['2021-11-23', 'MET'],
    ['2021-11-24', 'NOT_MET'],
  ]) {
    expect(
      inspect('71', {
        sponsorPreviouslySponsoredAsPartner: true,
        sponsorContinuousPrOrCitizenSince: start,
      }).status,
    ).toBe(status);
  }
  expect(inspect('72').status).toBe('MET');
  expect(
    inspect('72', { sponsor: { ...base.sponsor, immigrationDebtClear: false } })
      .status,
  ).toBe('NOT_MET');
  expect(
    inspect('72', {
      sponsor: { ...base.sponsor, criminalBarCleared: undefined },
    }).pendingDetails,
  ).toContain('PD-243');
});
test('12 consecutive months, conjugal outside Canada, dependent child lock-in at 22', () => {
  const co = {
    relationship: 'common-law',
    cohabitationSince: '2025-11-23',
    deemedCommonLawAccepted: false,
  } as const;
  expect(inspect('73', co).status).toBe('MET');
  expect(inspect('73', { ...co, cohabitationSince: '2025-11-24' }).status).toBe(
    'NOT_MET',
  );
  const conj = {
    relationship: 'conjugal',
    partnershipSince: '2025-11-23',
    legalOrPracticalBarriersConfirmed: true,
    sponsoredOutsideCanada: true,
  } as const;
  expect(inspect('73', conj).status).toBe('MET');
  expect(inspect('73', { ...conj, sponsoredOutsideCanada: false }).status).toBe(
    'NOT_MET',
  );
  const kid = {
    relationship: 'child',
    completeApplicationReceived: '2026-11-23',
    child: {
      ...base.child,
      unmarriedAndUnpartnered: true,
      parentageConfirmed: true,
      custodyAndConsentReady: true,
      dependentBeforeCutoffAndContinuing: false,
      unableToSupportSelfDueToCondition: false,
    },
  } as const;
  expect(inspect('74', kid, '2004-11-24').status).toBe('MET');
  expect(inspect('74', kid, '2004-11-23').status).toBe('NOT_MET');
  expect(
    inspect(
      '74',
      {
        ...kid,
        child: {
          ...kid.child,
          dependentBeforeCutoffAndContinuing: true,
          unableToSupportSelfDueToCondition: true,
        },
      },
      '2004-11-23',
    ).status,
  ).toBe('MET');
});
test('inland class and lack-of-status decision are independent of a genuine relationship', () => {
  const inland = {
    applicationClass: 'inland',
    cohabitingInCanada: true,
    temporaryStatusValid: false,
  } as const;
  expect(
    inspect('75', { ...inland, lackOfStatusPolicy: 'requested' }).status,
  ).toBe('UNKNOWN');
  expect(
    inspect('75', { ...inland, lackOfStatusPolicy: 'accepted' }).status,
  ).toBe('MET');
  expect(
    inspect('75', {
      ...inland,
      relationship: 'conjugal',
      lackOfStatusPolicy: 'accepted',
    }).status,
  ).toBe('NOT_MET');
});
test('federal undertaking: only nested dependants trigger MNI and the higher eligible income counts', () => {
  expect(inspect('76').status).toBe('MET');
  const f = {
    multigenerationalDependants: true,
    federalIncome: {
      unduplicatedHouseholdSize: 8,
      eligibleNoaIncome: 89007,
      eligibleLastYearIncome: 89008,
    },
  };
  // 7-person row 80,784 + 8,224 = 89,008.
  expect(inspect('76', f).explanation).toContain('89008');
  expect(inspect('76', f).status).toBe('MET');
  expect(
    inspect('76', {
      ...f,
      federalIncome: { ...f.federalIncome, eligibleLastYearIncome: 89007 },
    }).status,
  ).toBe('NOT_MET');
  expect(
    inspect('76', { ...f, filingDate: '2027-01-01' }).pendingDetails,
  ).toContain('PD-248');
  expect(
    inspect(
      '76',
      { relationship: 'child', permanentResidenceDate: '2026-11-23' },
      '2007-11-23',
    ).explanation,
  ).toContain('2032-11-23');
});
test('Québec undertaking, income tables, income-only base amount and separate sponsored groups', () => {
  const input = {
    quebec: true,
    province: qc,
    multigenerationalDependants: true,
  };
  for (const id of ['77', '78', '79', '80'])
    expect(inspect(id, input).status, id).toBe('MET');
  expect(
    inspect('77', { ...input, province: { ...qc, mifiDecision: 'pending' } })
      .status,
  ).toBe('UNKNOWN');
  expect(
    inspect('77', { ...input, province: { ...qc, mifiDecision: 'refused' } })
      .status,
  ).toBe('NOT_MET');
  expect(
    inspect(
      '77',
      { ...input, relationship: 'child', permanentResidenceDate: '2026-11-23' },
      '2011-11-23',
    ).explanation,
  ).toContain('2036-11-23');
  // A = 29,642. B for one adult with one minor = 29,131.
  expect(inspect('78', input).explanation).toContain('58773');
  expect(
    inspect('78', {
      ...input,
      province: {
        ...qc,
        eligibleCanadianIncome: 29641,
        eligibleCanadianAssets: 80000,
      },
    }).status,
  ).toBe('NOT_MET');
  expect(
    inspect('78', {
      ...input,
      province: { ...qc, eligibleCanadianAssets: 29130 },
    }).status,
  ).toBe('NOT_MET');
  // A = 29,642; B1 = 10,261; B2 = 38,450 + 10,107 + 2,823.
  const groups = [
    { adults: 0, children: 1 },
    { adults: 3, children: 3 },
  ];
  expect(
    inspect('78', {
      ...input,
      province: {
        ...qc,
        sponsoredGroups: groups,
        eligibleCanadianIncome: 91283,
      },
    }).explanation,
  ).toContain('91283');
  expect(
    inspect('78', {
      ...input,
      province: { ...qc, submissionDate: '2027-01-01' },
    }).status,
  ).toBe('UNKNOWN');
});
test('Québec intake separates schedule, actual capacity, exemptions and fees', () => {
  const phase = (p: FamilyAnswers['province']) => ({
    quebec: true,
    province: { ...qc, ...p },
  });
  expect(inspect('79', phase({ letterDate: '2025-07-01' })).status).toBe(
    'NOT_MET',
  );
  expect(
    inspect(
      '79',
      phase({ submissionDate: '2027-01-01', letterDate: '2025-08-31' }),
    ).status,
  ).toBe('MET');
  expect(
    inspect('79', phase({ intakeCapacityConfirmed: undefined })).pendingDetails,
  ).toContain('PD-256');
  expect(inspect('79', phase({ letterDate: '2028-06-01' })).status).toBe(
    'UNKNOWN',
  );
  expect(
    inspect('79', {
      ...phase({ intakeCapacityConfirmed: false }),
      relationship: 'child',
    }).status,
  ).toBe('MET');
  expect(inspect('80', phase({})).explanation).toContain('470');
  expect(
    inspect('80', phase({ applications: 2, additionalPersons: 0 })).explanation,
  ).toContain('670');
  expect(inspect('80', phase({ feesPaid: false })).status).toBe('NOT_MET');
  const unpublished = inspect('80', phase({ submissionDate: '2027-01-01' }));
  expect(unpublished.pendingDetails).toContain('PD-258');
  expect(unpublished.explanation).not.toContain('335');
});

test('sponsor conviction exception turns on jurisdiction and the fifth anniversary', () => {
  const conviction = {
    jurisdiction: 'foreign',
    sentenceCompletedOn: '2021-11-23',
    finalAcquittal: false,
    foreignRehabilitationConfirmed: true,
  } as const;
  const sponsor = { ...base.sponsor, conviction };
  expect(inspect('72', { sponsor }).status).toBe('MET');
  expect(
    inspect('72', {
      sponsor: {
        ...sponsor,
        conviction: { ...conviction, sentenceCompletedOn: '2021-11-24' },
      },
    }).status,
  ).toBe('NOT_MET');
  expect(
    inspect('72', {
      sponsor: {
        ...sponsor,
        conviction: {
          ...conviction,
          foreignRehabilitationConfirmed: undefined,
        },
      },
    }).status,
  ).toBe('UNKNOWN');
  expect(
    inspect('72', {
      sponsor: { ...base.sponsor, noProceedingSuspension: false },
    }).status,
  ).toBe('UNKNOWN');
  expect(
    inspect('72', {
      quebec: true,
      sponsor: { ...base.sponsor, immigrationDebtClear: false },
    }).status,
  ).toBe('NOT_MET');
  expect(
    inspect(
      '77',
      {
        quebec: true,
        province: {
          ...qc,
          integrationPlanIfRequiredSigned: false,
          additionalSponsoredBirthDates: ['2000-01-01'],
        },
      },
      '2011-11-23',
    ).status,
  ).toBe('NOT_MET');
});
