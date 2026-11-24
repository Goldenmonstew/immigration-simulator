import { describe, expect, test } from 'vitest';
import { evaluateGreeceFull, type GrFullRequest } from '../src';
import { grContext } from '../src/greece-rules';
import {
  workFamilyChecks,
  type GrWorkFamilyAnswers,
} from '../src/greece-work-family';

type Work = NonNullable<GrWorkFamilyAnswers['work']>;
type Family = NonNullable<GrWorkFamilyAnswers['familyTcn']>;
const date = '2026-11-23';
const base = {
  simulationDate: date,
  birthDate: '1996-11-23',
  entry: 'national-visa',
  insurance: { kind: 'public', coversFamily: true },
  citizenship: 'third-country',
  passport: { kind: 'exception-granted' },
  publicHealth: 'cleared',
  publicOrder: 'clear',
  biometrics: 'provided',
  changes: [],
} satisfies GrFullRequest;
const employed: Work = {
  permit: 'E4',
  stage: 'initial',
  admission: 'ordinary',
  contractMonths: 6,
  payBasis: 'monthly',
  grossPayEur: 920,
  employerApproval: true,
  employer: 'business',
  sponsoredWorkers: 2,
  employerLastYearGrossEur: 120000,
  taxEvidenceSupportsContractPay: true,
  occupationMatchesBusiness: true,
  quotaAvailable: true,
};
const blue: Work = {
  ...employed,
  permit: 'E1',
  grossAnnualEur: 31918.83,
  qualification: 'regulated-recognised',
  permanentAddressAvailable: true,
};
const reunion: Family = {
  stage: 'initial',
  sponsor: 'ordinary',
  sponsorLawfulYears: 2,
  sponsorPermitDurationYears: 2,
  sponsorPermitLeadsToPermanentResidence: true,
  sponsorPermitValid: true,
  sponsorPersonalNetEur: 19320,
  priorYearTaxAndInsuranceEvidence: true,
  stableIncome: true,
  spouseIncluded: true,
  childrenIncluded: 2,
  bothParentsLawfullyInGreece: false,
  housingDocument: 'Taxisnet',
  housingMeetsFamilyNeeds: true,
  member: 'spouse',
  soleEligibleSpouse: true,
  relationshipAndDocumentsGenuine: true,
};

function work(
  id: string,
  answers: Work = {},
  request: Partial<GrFullRequest> = {},
) {
  const req = { ...base, ...request, work: { ...employed, ...answers } };
  const check = workFamilyChecks('GR-WORK', req, grContext('en')).find(
    (item) => item.id === id,
  );
  if (!check) throw new Error(`missing ${id}`);
  return check;
}
function family(
  id: string,
  answers: Family = {},
  request: Partial<GrFullRequest> = {},
) {
  const req = { ...base, ...request, familyTcn: { ...reunion, ...answers } };
  const check = workFamilyChecks('GR-FAMILY-TCN', req, grContext('en')).find(
    (item) => item.id === id,
  );
  if (!check) throw new Error(`missing ${id}`);
  return check;
}

function route(
  id: 'GR-WORK' | 'GR-FAMILY-TCN',
  request: Partial<GrFullRequest>,
) {
  return evaluateGreeceFull({ ...base, ...request, pathways: [id] }).columns[0]
    .pathways[0];
}

test.each([
  ['2026-11-23', 'standalone-Z', 'FUTURE', '2026-12-01'],
  ['2026-12-01', 'standalone-Z', 'MET', undefined],
  ['2026-12-02', 'standalone-Z', 'NOT_MET', undefined],
  ['2026-12-01', 'leads-to-permit', 'NOT_MET', undefined],
] as const)(
  'an Ε.4 switch on a %s national visa (%s) needs the qualifying visa at expiry',
  (simulationDate, kind, status, earliestDate) => {
    const result = route('GR-WORK', {
      simulationDate,
      entry: 'national-visa',
      work: {
        ...employed,
        admission: 'domestic-switch',
        quotaAvailable: false,
        switchVisa: { kind, expiresOn: '2026-12-01' },
      },
    });
    const check = result.checks.find((item) => item.id === 'WK-06');
    expect(check?.status).toBe(status === 'FUTURE' ? 'NOT_MET' : status);
    if (earliestDate) expect(check?.explanation).toContain(earliestDate);
    expect(result.status).toBe(status);
    expect(result.earliestDate).toBe(earliestDate);
  },
);

test.each([
  [true, 'MET'],
  [false, 'NOT_MET'],
  [undefined, 'UNKNOWN'],
] as const)(
  'a lawful short-stay Ε.1 switch uses the available quota (%s)',
  (quotaAvailable, status) => {
    const result = route('GR-WORK', {
      simulationDate: '2024-11-23',
      entry: 'short-stay',
      work: {
        ...blue,
        admission: 'domestic-switch',
        grossAnnualEur: 60000,
        quotaAvailable,
      },
    });
    for (const id of ['C-02', 'WK-03']) {
      expect(result.checks.find((item) => item.id === id)?.status).toBe('MET');
    }
    expect(result.checks.find((item) => item.id === 'WK-06')?.status).toBe(
      status,
    );
    expect(result.status).toBe(status);
    expect(result.earliestDate).toBeUndefined();
  },
);

test('residence and age waits use the actual anniversary and require every other condition', () => {
  const familyTcn: Family = {
    ...reunion,
    sponsorLawfulFrom: '2024-12-10',
    sponsorLawfulYears: undefined,
  };
  const application = { familyTcn, birthDate: '2008-11-24' };
  const pending = route('GR-FAMILY-TCN', application);
  expect(pending.checks.find((item) => item.id === 'FT-01')).toMatchObject({
    status: 'NOT_MET',
    explanation: expect.stringContaining('2026-12-10'),
  });
  expect(pending.checks.find((item) => item.id === 'FT-05')).toMatchObject({
    status: 'NOT_MET',
    explanation: expect.stringContaining('2026-11-24'),
  });
  expect(pending).toMatchObject({
    status: 'FUTURE',
    earliestDate: '2026-12-10',
  });
  expect(
    route('GR-FAMILY-TCN', { ...application, simulationDate: '2026-12-10' })
      .status,
  ).toBe('MET');
  const blocked = route('GR-FAMILY-TCN', {
    ...application,
    familyTcn: { ...familyTcn, housingDocument: 'none' },
  });
  expect(blocked.status).toBe('NOT_MET');
  expect(blocked.earliestDate).toBeUndefined();
});

test('Ο.2 uses combined Blue Card family residence and the final years in Greece', () => {
  const familyTcn: Family = {
    stage: 'autonomous',
    sponsor: 'blue-card',
    member: 'spouse',
    previousFamilyCard: true,
    autonomousBasis: 'residence',
    familyResidenceFrom: '2025-01-01',
    blueFamilyResidenceFrom: '2021-11-23',
  };
  const result = route('GR-FAMILY-TCN', { familyTcn });
  expect(result.checks.find((item) => item.id === 'FT-07')).toMatchObject({
    status: 'NOT_MET',
    explanation: expect.stringContaining('2027-01-01'),
  });
  expect(result).toMatchObject({
    status: 'FUTURE',
    earliestDate: '2027-01-01',
  });
  expect(
    route('GR-FAMILY-TCN', { familyTcn, simulationDate: '2027-01-01' }).status,
  ).toBe('MET');
});

test.each([
  [1, 5, 'NOT_MET'],
  [2, 4, 'NOT_MET'],
  [2, 5, 'MET'],
  [4, undefined, 'UNKNOWN'],
  [undefined, 4, 'NOT_MET'],
  [5, undefined, 'MET'],
] as const)(
  'Ο.2 Blue Card family with %s Greek years and %s EU years',
  (familyResidenceYears, blueFamilyYearsInEU, status) => {
    const result = route('GR-FAMILY-TCN', {
      familyTcn: {
        stage: 'autonomous',
        autonomousBasis: 'residence',
        sponsor: 'blue-card',
        member: 'spouse',
        previousFamilyCard: true,
        familyResidenceYears,
        blueFamilyYearsInEU,
      },
    });
    expect(result.checks.find((item) => item.id === 'FT-07')?.status).toBe(
      status,
    );
    expect(result.status).toBe(status);
    expect(result.earliestDate).toBeUndefined();
  },
);

test.each([
  ['blue-card', '2023-01-01', undefined, undefined, 'UNKNOWN', undefined],
  ['blue-card', '2023-01-01', 4, undefined, 'NOT_MET', undefined],
  ['blue-card', '2023-01-01', undefined, '2022-01-01', 'FUTURE', '2027-01-01'],
  ['blue-card', '2025-01-01', undefined, undefined, 'NOT_MET', undefined],
  [undefined, '2023-01-01', 5, undefined, 'UNKNOWN', undefined],
  [undefined, '2025-01-01', 5, undefined, 'NOT_MET', undefined],
  [undefined, undefined, 1, undefined, 'NOT_MET', undefined],
] as const)(
  'Ο.2 sponsor %s, Greek residence since %s, EU total %s years or since %s',
  (
    sponsor,
    familyResidenceFrom,
    blueFamilyYearsInEU,
    blueFamilyResidenceFrom,
    status,
    earliestDate,
  ) => {
    const result = route('GR-FAMILY-TCN', {
      familyTcn: {
        stage: 'autonomous',
        autonomousBasis: 'residence',
        member: 'spouse',
        previousFamilyCard: true,
        sponsor,
        familyResidenceFrom,
        blueFamilyYearsInEU,
        blueFamilyResidenceFrom,
      },
    });
    expect(result.checks.find((item) => item.id === 'FT-07')?.status).toBe(
      status === 'FUTURE' ? 'NOT_MET' : status,
    );
    expect(result.status).toBe(status);
    expect(result.earliestDate).toBe(earliestDate);
  },
);

test('employment filing can defer the insurance registration certificate and Blue Card address', () => {
  const req: Partial<GrFullRequest> = {
    simulationDate: '2024-11-23',
    entry: 'short-stay',
    deferredInitialEvidence: ['public-insurance-application'],
    insurance: undefined,
    work: {
      ...blue,
      admission: 'domestic-switch',
      permanentAddressAvailable: false,
    },
  };
  const filed = route('GR-WORK', req);
  expect(filed.status).toBe('MET');
  expect(filed.earliestDate).toBeUndefined();
  expect(filed.checks.find((item) => item.id === 'WK-07')).toMatchObject({
    status: 'MET',
    explanation: expect.stringContaining('6'),
  });
  const renewal = route('GR-WORK', {
    ...req,
    currentCardExpiresOn: '2024-12-01',
    work: { ...req.work, stage: 'renewal', taxesSettledDuringPermit: true },
  });
  expect(renewal.checks.find((item) => item.id === 'WK-07')?.status).toBe(
    'UNKNOWN',
  );
  expect(renewal.status).toBe('UNKNOWN');
  expect(renewal.earliestDate).toBeUndefined();
});

test.each([
  ['regulated-recognised', 'MET'],
  ['unregulated-documented', 'MET'],
  ['previously-verified-in-Greece', 'MET'],
  ['missing', 'NOT_MET'],
  [undefined, 'UNKNOWN'],
] as const)(
  'Ε.1 renewal needs credentials for the current job (%s)',
  (qualification, status) => {
    const result = route('GR-WORK', {
      simulationDate: '2024-11-23',
      currentCardExpiresOn: '2024-12-01',
      work: {
        ...blue,
        stage: 'renewal',
        contractMonths: 12,
        grossAnnualEur: 60000,
        taxesSettledDuringPermit: true,
        qualification,
      },
    });
    expect(result.checks.find((item) => item.id === 'WK-02')?.status).toBe(
      status,
    );
    expect(result.status).toBe(status);
    expect(result.earliestDate).toBeUndefined();
  },
);

test.each([
  ['2024-11-23', '2024-12-01', false, undefined],
  ['2026-11-23', '2026-12-01', undefined, 0],
] as const)(
  'ordinary Ε.4 renewal on %s accepts tax and insurance evidence after the job ended',
  (
    simulationDate,
    currentCardExpiresOn,
    hasCurrentEmploymentContract,
    grossPayEur,
  ) => {
    const result = route('GR-WORK', {
      simulationDate,
      currentCardExpiresOn,
      work: {
        permit: 'E4',
        stage: 'renewal',
        taxesSettledDuringPermit: true,
        hasCurrentEmploymentContract,
        grossPayEur,
      },
    });
    expect(result.checks.map((item) => item.id)).not.toContain('WK-04');
    const taxAndCover = result.checks.find((item) => item.id === 'WK-07');
    expect(taxAndCover?.status).toBe('MET');
    expect(taxAndCover?.sources.map((source) => source.srcId)).toEqual(
      expect.arrayContaining(['SRC-373', 'SRC-374']),
    );
    expect(
      result.checks.find((item) => item.id === 'WK-09')?.explanation,
    ).toMatch(/€150.*€16/);
    expect(result.status).toBe('MET');
    expect(result.earliestDate).toBeUndefined();
  },
);

test.each([
  [false, 'public', 'NOT_MET'],
  [undefined, 'public', 'UNKNOWN'],
  [true, 'uninsured', 'NOT_MET'],
  [true, undefined, 'UNKNOWN'],
] as const)(
  'Ε.4 renewal requires tax compliance (%s) and active public insurance (%s)',
  (taxesSettledDuringPermit, kind, status) => {
    const result = route('GR-WORK', {
      simulationDate: '2024-11-23',
      currentCardExpiresOn: '2024-12-01',
      insurance: kind && { kind },
      work: { permit: 'E4', stage: 'renewal', taxesSettledDuringPermit },
    });
    expect(result.checks.find((item) => item.id === 'WK-07')?.status).toBe(
      status,
    );
    expect(result.status).toBe(status);
    expect(result.earliestDate).toBeUndefined();
  },
);

test.each([
  ['unemployment-benefit', true, 'MET'],
  ['accepted-force-majeure', false, 'NOT_MET'],
  ['unemployment-benefit', undefined, 'UNKNOWN'],
  ['none', true, 'NOT_MET'],
  ['pending', true, 'UNKNOWN'],
] as const)(
  'Ε.4 renewal checks the previous coverage gap (%s) and current public coverage (%s)',
  (gapEvidence, activePublicCoverAfterGap, status) => {
    const result = route('GR-WORK', {
      simulationDate: '2024-11-23',
      currentCardExpiresOn: '2024-12-01',
      insurance: { kind: 'gap', gapEvidence },
      work: {
        permit: 'E4',
        stage: 'renewal',
        taxesSettledDuringPermit: true,
        activePublicCoverAfterGap,
      },
    });
    expect(result.checks.find((item) => item.id === 'WK-07')?.status).toBe(
      status,
    );
    expect(result.status).toBe(status);
    expect(result.earliestDate).toBeUndefined();
  },
);

test.each([
  [3, 'MET'],
  [4, 'UNKNOWN'],
  [6, 'UNKNOWN'],
  [7, 'NOT_MET'],
] as const)(
  'Ε.1 cumulative unemployment of %s months with unknown Blue Card service',
  (interruptionMonths, status) => {
    const result = route('GR-WORK', {
      currentCardExpiresOn: '2026-12-01',
      work: {
        permit: 'E1',
        stage: 'renewal',
        blueRenewalInterruption: 'unemployment',
        interruptionMonths,
        taxesSettledDuringPermit: true,
      },
    });
    expect(
      result.checks.find((item) => item.id === 'WK-07-INTERRUPTION')?.status,
    ).toBe(status);
    expect(result.status).toBe(status);
    expect(result.earliestDate).toBeUndefined();
  },
);

test.each([
  ['2024-05-01', 'UNKNOWN'],
  ['2024-05-02', 'MET'],
] as const)(
  'employer turnover is evaluated under the order in force on %s',
  (simulationDate, status) => {
    const result = route('GR-WORK', {
      simulationDate,
      work: { ...employed, contractMonths: 12 },
    });
    expect(result.checks.find((item) => item.id === 'WK-05')?.status).toBe(
      status,
    );
    expect(result.status).toBe(status);
    expect(result.earliestDate).toBeUndefined();
  },
);

test.each([
  [false, true, 'MET'],
  [true, false, 'NOT_MET'],
  [true, undefined, 'UNKNOWN'],
] as const)(
  'Ο.1 renewal checks the family tax record, including domestic formation (%s, %s)',
  (formedLegallyInGreece, priorYearTaxAndInsuranceEvidence, status) => {
    const result = route('GR-FAMILY-TCN', {
      currentCardExpiresOn: '2026-12-01',
      familyTcn: {
        ...reunion,
        stage: 'renewal',
        sponsorPermitValid: true,
        housingDocument: 'none',
        formedLegallyInGreece,
        priorYearTaxAndInsuranceEvidence,
        familyLifeContinues: true,
      },
    });
    expect(result.checks.map((item) => item.id)).not.toContain('FT-03');
    expect(result.checks.find((item) => item.id === 'FT-02')?.status).toBe(
      status,
    );
    expect(result.checks.find((item) => item.id === 'FT-08')?.status).toBe(
      'MET',
    );
    expect(result.status).toBe(status);
    expect(result.earliestDate).toBeUndefined();
  },
);

test.each([
  [true, 1, false, 'MET'],
  [false, 2, true, 'NOT_MET'],
  [undefined, 2, true, 'UNKNOWN'],
  [undefined, 0, false, 'NOT_MET'],
] as const)(
  'Ο.1 renewal follows the current sponsor status (%s, issued term %s, permanent prospect %s)',
  (
    sponsorPermitValid,
    sponsorPermitDurationYears,
    sponsorPermitLeadsToPermanentResidence,
    status,
  ) => {
    const result = route('GR-FAMILY-TCN', {
      currentCardExpiresOn: '2026-12-01',
      familyTcn: {
        ...reunion,
        stage: 'renewal',
        sponsorPermitValid,
        sponsorPermitDurationYears,
        sponsorPermitLeadsToPermanentResidence,
        sponsorLawfulYears: 0,
        familyLifeContinues: true,
      },
    });
    expect(result.checks.find((item) => item.id === 'FT-01')?.status).toBe(
      status,
    );
    expect(result.status).toBe(status);
    expect(result.earliestDate).toBeUndefined();
  },
);

test.each([
  [true, 'MET'],
  [false, 'NOT_MET'],
  [undefined, 'UNKNOWN'],
] as const)(
  'Ο.1 ordinary initial sponsor with four lawful years and current permit %s',
  (sponsorPermitValid, status) => {
    const result = route('GR-FAMILY-TCN', {
      familyTcn: { ...reunion, sponsorLawfulYears: 4, sponsorPermitValid },
    });
    expect(result.checks.find((item) => item.id === 'FT-01')?.status).toBe(
      status,
    );
    expect(result.status).toBe(status);
    expect(result.earliestDate).toBeUndefined();
  },
);

test.each([
  [undefined, false, 'NOT_MET'],
  [false, false, 'NOT_MET'],
  [false, true, 'MET'],
  [false, undefined, 'UNKNOWN'],
  [true, false, 'MET'],
  [true, undefined, 'MET'],
] as const)(
  'Ο.1 initial Blue Card family: joint filing %s, currently valid card %s',
  (jointBlueCardApplication, sponsorPermitValid, status) => {
    const result = route('GR-FAMILY-TCN', {
      entry: 'national-visa',
      familyTcn: {
        ...reunion,
        sponsor: 'blue-card',
        sponsorLawfulYears: 0,
        sponsorPermitLeadsToPermanentResidence: false,
        sponsorPermitValid,
        jointBlueCardApplication,
      },
    });
    expect(result.checks.find((item) => item.id === 'FT-01')?.status).toBe(
      status,
    );
    expect(result.status).toBe(status);
    expect(result.earliestDate).toBeUndefined();
  },
);

test.each([
  ['national-visa', 'MET'],
  ['short-stay', 'MET'],
  ['unlawful', 'NOT_MET'],
] as const)(
  'Ο.1 spouse joining a current Blue Card holder after %s entry',
  (entry, status) => {
    const result = route('GR-FAMILY-TCN', {
      entry,
      familyTcn: {
        ...reunion,
        sponsor: 'blue-card',
        sponsorPermitValid: true,
        jointBlueCardApplication: false,
      },
    });
    expect(result.checks.find((item) => item.id === 'C-02')?.status).toBe(
      status,
    );
    expect(result.checks.find((item) => item.id === 'FT-01')?.status).toBe(
      'MET',
    );
    expect(result.status).toBe(status);
  },
);

test.each([
  [1, 'NOT_MET'],
  [2, 'MET'],
  [undefined, 'UNKNOWN'],
] as const)(
  'Ο.1 initial sponsor with %s completed years and no start date',
  (sponsorLawfulYears, status) => {
    const result = route('GR-FAMILY-TCN', {
      familyTcn: { ...reunion, sponsorLawfulYears },
    });
    expect(result.checks.find((item) => item.id === 'FT-01')?.status).toBe(
      status,
    );
    expect(result.status).toBe(status);
    expect(result.earliestDate).toBeUndefined();
  },
);

test.each([
  [4, undefined, 'NOT_MET', undefined],
  [5, undefined, 'MET', undefined],
  [undefined, undefined, 'UNKNOWN', undefined],
  [4, '2022-01-01', 'FUTURE', '2027-01-01'],
] as const)(
  'Ο.2 ordinary spouse with %s years and start date %s',
  (familyResidenceYears, familyResidenceFrom, status, earliestDate) => {
    const result = route('GR-FAMILY-TCN', {
      familyTcn: {
        ...reunion,
        stage: 'autonomous',
        autonomousBasis: 'residence',
        previousFamilyCard: true,
        familyResidenceYears,
        familyResidenceFrom,
      },
    });
    expect(result.checks.find((item) => item.id === 'FT-07')?.status).toBe(
      status === 'FUTURE' ? 'NOT_MET' : status,
    );
    expect(result.status).toBe(status);
    expect(result.earliestDate).toBe(earliestDate);
  },
);

describe('Gr employment routes', () => {
  test('the request needs a permit category, and a complete Ε.4 application has no outstanding route checks', () => {
    expect(work('WK-TYPE', { permit: undefined }).status).toBe('UNKNOWN');
    expect(
      workFamilyChecks(
        'GR-WORK',
        { ...base, work: employed },
        grContext(),
      ).every((x) => x.status === 'MET'),
    ).toBe(true);
    expect(work('WK-08', { stage: undefined }).status).toBe('UNKNOWN');
  });
  test('Ε.1 uses only the published annual figure for its own year', () => {
    const published = { simulationDate: '2024-11-23' };
    expect(work('WK-01', blue, published).status).toBe('MET');
    expect(
      work('WK-01', { ...blue, grossAnnualEur: 31918.82 }, published).status,
    ).toBe('NOT_MET');
    for (const grossAnnualEur of [20000, 31918.83, 80000]) {
      expect(work('WK-01', { ...blue, grossAnnualEur })).toMatchObject({
        status: 'UNKNOWN',
        pendingDetails: ['PD-317'],
      });
    }
  });
  test('Blue Card contract, credentials, lawful short stay and approved employment', () => {
    expect(work('WK-02', blue).status).toBe('MET');
    expect(work('WK-02', { ...blue, contractMonths: 5 }).status).toBe(
      'NOT_MET',
    );
    expect(work('WK-02', { ...blue, qualification: undefined }).status).toBe(
      'UNKNOWN',
    );
    expect(work('WK-02', { ...blue, qualification: 'missing' }).status).toBe(
      'NOT_MET',
    );
    expect(work('WK-03', blue, { entry: 'short-stay' }).status).toBe('MET');
    expect(work('WK-03', blue, { entry: 'unlawful' }).status).toBe('NOT_MET');
    expect(work('WK-03', { ...blue, employerApproval: undefined }).status).toBe(
      'UNKNOWN',
    );
  });
  test('the archived 2024 minimum wage starts on 1 April', () => {
    const day = { simulationDate: '2024-04-01' };
    const contract: Work = { contractMonths: 12, grossPayEur: 830 };
    expect(work('WK-04', contract, day).status).toBe('MET');
    expect(
      work('WK-04', { ...contract, grossPayEur: 829.99 }, day).status,
    ).toBe('NOT_MET');
    expect(
      work('WK-04', { ...contract, payBasis: 'daily', grossPayEur: 37.07 }, day)
        .status,
    ).toBe('MET');
    expect(
      work('WK-04', contract, { simulationDate: '2024-03-31' }).status,
    ).toBe('UNKNOWN');
  });
  test('Ε.4 contract reform and gross wage changes use their distinct effective dates', () => {
    expect(
      work(
        'WK-04',
        { contractMonths: 6, grossPayEur: 880 },
        { simulationDate: '2026-02-05' },
      ).status,
    ).toBe('NOT_MET');
    expect(
      work(
        'WK-04',
        { contractMonths: 6, grossPayEur: 880 },
        { simulationDate: '2026-02-06' },
      ).status,
    ).toBe('MET');
    expect(
      work('WK-04', { grossPayEur: 880 }, { simulationDate: '2026-03-31' })
        .status,
    ).toBe('MET');
    expect(
      work('WK-04', { grossPayEur: 919.99 }, { simulationDate: '2026-04-01' })
        .status,
    ).toBe('NOT_MET');
    expect(work('WK-04').status).toBe('MET');
    expect(work('WK-04', { contractMonths: 5 }).status).toBe('NOT_MET');
    expect(
      work('WK-04', { payBasis: 'daily', grossPayEur: 41.09 }).status,
    ).toBe('MET');
    expect(
      work('WK-04', { payBasis: 'daily', grossPayEur: 41.08 }).status,
    ).toBe('NOT_MET');
    expect(work('WK-04', { payBasis: undefined }).status).toBe('UNKNOWN');
  });
  test('turnover multiplies by headcount and agency capital is independent of turnover', () => {
    expect(work('WK-05').status).toBe('MET');
    expect(
      work('WK-05', { taxEvidenceSupportsContractPay: false }).status,
    ).toBe('NOT_MET');
    expect(work('WK-05', { employerLastYearGrossEur: 119999.99 }).status).toBe(
      'NOT_MET',
    );
    for (const employer of ['agriculture', 'private-individual'] as const) {
      expect(
        work('WK-05', { employer, employerLastYearGrossEur: 44000 }).status,
      ).toBe('MET');
      expect(
        work('WK-05', { employer, employerLastYearGrossEur: 43999.99 }).status,
      ).toBe('NOT_MET');
      expect(
        work('WK-05', { ...blue, employer, employerLastYearGrossEur: 44000 })
          .status,
      ).toBe('NOT_MET');
    }
    const agency = {
      employer: 'agency' as const,
      agencyCapitalEur: 1000000,
      agencyManagementClear: true,
      hostContractAndTaxEvidence: true,
    };
    expect(work('WK-05', agency).status).toBe('MET');
    expect(
      work('WK-05', { ...agency, agencyCapitalEur: 999999.99 }).status,
    ).toBe('NOT_MET');
    expect(
      work('WK-05', { ...agency, hostContractAndTaxEvidence: undefined })
        .status,
    ).toBe('UNKNOWN');
    expect(work('WK-05', { occupationMatchesBusiness: false }).status).toBe(
      'NOT_MET',
    );
  });
  test('ordinary quota, qualifying in-country switch, and cap per certified project', () => {
    expect(work('WK-06', { quotaAvailable: false }).status).toBe('NOT_MET');
    expect(work('WK-06', { quotaAvailable: undefined }).status).toBe('UNKNOWN');
    expect(
      work(
        'WK-06',
        { admission: 'domestic-switch', quotaAvailable: false },
        { entry: 'permit' },
      ).status,
    ).toBe('MET');
    const project = {
      admission: 'strategic-project' as const,
      projectCertified: true,
      quotaAvailable: false,
    };
    expect(work('WK-06', { ...project, projectWorkersTotal: 500 }).status).toBe(
      'MET',
    );
    expect(work('WK-06', { ...project, projectWorkersTotal: 501 }).status).toBe(
      'NOT_MET',
    );
    expect(
      work('WK-06', {
        ...project,
        projectWorkersTotal: 500,
        projectCertified: false,
      }).status,
    ).toBe('NOT_MET');
    expect(
      work('WK-06', { ...project, ...blue, quotaAvailable: false }).status,
    ).toBe('NOT_MET');
    expect(
      work('WK-INVITATION-AGE', {}, { birthDate: '2008-11-23' }),
    ).toMatchObject({
      status: 'NOT_MET',
      explanation: expect.stringContaining('2026-11-24'),
    });
    expect(
      work('WK-INVITATION-AGE', {}, { birthDate: '2008-11-22' }).status,
    ).toBe('MET');
  });
  test('new insurance registration, ongoing cover, address and renewal tax record', () => {
    expect(
      work(
        'WK-07',
        { insuranceApplicationFiled: true },
        { insurance: undefined },
      ).status,
    ).toBe('MET');
    expect(
      work(
        'WK-07',
        { insuranceApplicationFiled: false },
        { insurance: { kind: 'uninsured' } },
      ).status,
    ).toBe('NOT_MET');
    expect(
      work('WK-07', { ...blue, permanentAddressAvailable: false }).status,
    ).toBe('MET');
    const renewal = {
      stage: 'renewal' as const,
      taxesSettledDuringPermit: true,
    };
    expect(
      work('WK-07', renewal, {
        insurance: { kind: 'gap', gapEvidence: 'unemployment-benefit' },
      }).status,
    ).toBe('UNKNOWN');
    expect(
      work('WK-07', renewal, { insurance: { kind: 'private' } }),
    ).toMatchObject({ status: 'UNKNOWN', pendingDetails: ['PD-303'] });
    expect(
      work('WK-07', { ...renewal, taxesSettledDuringPermit: false }).status,
    ).toBe('NOT_MET');
  });
  test('lawful interruption on Blue Card renewal can displace the salary and contract requirements', () => {
    const interruptions: Work = {
      ...blue,
      stage: 'renewal',
      blueRenewalInterruption: 'unemployment',
      blueCardYears: 1,
    };
    expect(
      work('WK-07-INTERRUPTION', { ...interruptions, interruptionMonths: 3 })
        .status,
    ).toBe('MET');
    expect(
      work('WK-07-INTERRUPTION', { ...interruptions, interruptionMonths: 4 })
        .status,
    ).toBe('NOT_MET');
    expect(
      work('WK-07-INTERRUPTION', {
        ...interruptions,
        blueCardYears: 2,
        interruptionMonths: 6,
      }).status,
    ).toBe('MET');
    expect(
      work('WK-07-INTERRUPTION', {
        ...interruptions,
        blueCardYears: 2,
        interruptionMonths: 7,
      }).status,
    ).toBe('NOT_MET');
    const leave: Work = {
      ...interruptions,
      blueRenewalInterruption: 'illness-disability-parental-leave',
      interruptionMonths: 12,
    };
    expect(work('WK-07-INTERRUPTION', leave).status).toBe('UNKNOWN');
    expect(
      work('WK-07-INTERRUPTION', { ...leave, protectedLeaveAccepted: true })
        .status,
    ).toBe('MET');
    for (const [qualification, status] of [
      ['missing', 'NOT_MET'],
      [undefined, 'UNKNOWN'],
    ] as const) {
      expect(
        work('WK-07-INTERRUPTION', {
          ...leave,
          protectedLeaveAccepted: true,
          qualification,
        }).status,
      ).toBe(status);
    }
  });
  test('terms and fees distinguish first issue, renewal and the exceptional recruitment procedure', () => {
    expect(work('WK-08').explanation).toContain('3 years');
    expect(work('WK-08', { stage: 'renewal' }).explanation).toContain(
      '5 years',
    );
    expect(work('WK-08', { ...blue, stage: 'renewal' }).explanation).toContain(
      '3 months',
    );
    const fees = work('WK-09').explanation;
    for (const amount of ['€150', '€16', '€180', '€200'])
      expect(fees).toContain(amount);
    expect(
      work('WK-09', { admission: 'strategic-project' }).explanation,
    ).toContain('€400');
    expect(work('WK-09', { stage: 'renewal' }).explanation).not.toContain(
      '€200',
    );
  });
});

test.each([
  ['2024-09-16', 'UNKNOWN'],
  ['2024-09-17', 'MET'],
] as const)(
  'family income uses the annual pay calculation in force on %s',
  (simulationDate, status) => {
    const result = route('GR-FAMILY-TCN', {
      simulationDate,
      familyTcn: reunion,
    });
    expect(result.checks.find((item) => item.id === 'FT-02')?.status).toBe(
      status,
    );
    expect(result.status).toBe(status);
    expect(result.earliestDate).toBeUndefined();
  },
);

describe('Gr third-country family', () => {
  test('starts on complete initial application, switches to the appropriate procedure for excluded or protected sponsors', () => {
    expect(family('FT-STAGE', { stage: undefined }).status).toBe('UNKNOWN');
    expect(
      workFamilyChecks(
        'GR-FAMILY-TCN',
        { ...base, familyTcn: reunion },
        grContext(),
      ).every((x) => x.status === 'MET'),
    ).toBe(true);
    expect(family('FT-01', { sponsorLawfulYears: 1 }).status).toBe('NOT_MET');
    expect(family('FT-01', { sponsorPermitDurationYears: 1 }).status).toBe(
      'NOT_MET',
    );
    expect(
      family('FT-01', { sponsorPermitLeadsToPermanentResidence: false }).status,
    ).toBe('NOT_MET');
    expect(
      family('FT-01', {
        sponsor: 'blue-card',
        sponsorLawfulYears: 0,
        sponsorPermitDurationYears: 1,
      }).status,
    ).toBe('MET');
    expect(family('FT-01', { sponsor: 'excluded' }).status).toBe('NOT_MET');
    expect(family('FT-01', { sponsor: 'refugee' })).toMatchObject({
      status: 'UNKNOWN',
      pendingDetails: ['PD-319'],
    });
  });
  test('gross upper bound is 920 × 14 × (1 + .2 + 2 × .15); no invented net floor', () => {
    expect(family('FT-02')).toMatchObject({
      status: 'MET',
      explanation: expect.stringContaining('€19320'),
    });
    expect(family('FT-02', { sponsorPersonalNetEur: 19319.99 })).toMatchObject({
      status: 'UNKNOWN',
      pendingDetails: ['PD-304'],
    });
    expect(
      family('FT-02', {
        bothParentsLawfullyInGreece: true,
        sponsorPersonalNetEur: 15456,
      }).status,
    ).toBe('MET');
    expect(
      family('FT-02', {
        spouseIncluded: false,
        bothParentsLawfullyInGreece: true,
        sponsorPersonalNetEur: 12880,
      }).status,
    ).toBe('MET');
    expect(family('FT-02', { sponsorPersonalNetEur: 0 }).status).toBe(
      'NOT_MET',
    );
    expect(family('FT-02', { stableIncome: false }).status).toBe('NOT_MET');
    expect(family('FT-02', { childrenIncluded: undefined }).status).toBe(
      'UNKNOWN',
    );
  });
  test('registered housing and actual family insurance coverage', () => {
    for (const housingDocument of ['E9', 'E2', 'Taxisnet'] as const)
      expect(family('FT-03', { housingDocument }).status).toBe('MET');
    expect(family('FT-03', { housingDocument: 'none' }).status).toBe('NOT_MET');
    expect(
      family('FT-03', { housingMeetsFamilyNeeds: undefined }),
    ).toMatchObject({ status: 'UNKNOWN', pendingDetails: ['PD-318'] });
    expect(family('FT-04').status).toBe('MET');
    expect(
      family(
        'FT-04',
        {},
        { insurance: { kind: 'public', coversFamily: false } },
      ).status,
    ).toBe('NOT_MET');
  });
  test('ordinary and Blue Card children are minors; investor children can qualify until 21', () => {
    const child: Family = {
      member: 'child',
      unmarriedChildWithCustodyAndConsent: true,
      adultChildIncapacityDependencyProved: false,
    };
    expect(family('FT-05', child, { birthDate: '2008-11-24' }).status).toBe(
      'MET',
    );
    expect(family('FT-05', child, { birthDate: '2008-11-23' }).status).toBe(
      'NOT_MET',
    );
    expect(
      family(
        'FT-05',
        { ...child, sponsor: 'blue-card' },
        { birthDate: '2008-11-23' },
      ).status,
    ).toBe('NOT_MET');
    expect(
      family(
        'FT-05',
        { ...child, sponsor: 'investor' },
        { birthDate: '2005-11-24' },
      ).status,
    ).toBe('MET');
    expect(
      family(
        'FT-05',
        { ...child, sponsor: 'investor' },
        { birthDate: '2005-11-23' },
      ).status,
    ).toBe('NOT_MET');
    expect(
      family('FT-05', { ...child, adultChildIncapacityDependencyProved: true })
        .status,
    ).toBe('MET');
    expect(family('FT-05', {}, { birthDate: '2008-11-24' })).toMatchObject({
      status: 'NOT_MET',
      explanation: expect.stringContaining('2026-11-24'),
    });
    expect(family('FT-05', { soleEligibleSpouse: false }).status).toBe(
      'NOT_MET',
    );
    expect(
      family('FT-05', { formedLegallyInGreece: true }, { entry: 'short-stay' })
        .status,
    ).toBe('NOT_MET');
  });
  test('fees depend on age and the autonomous child permit held', () => {
    const child: Family = {
      stage: 'autonomous',
      member: 'child',
      autonomousBasis: 'child',
      previousFamilyCard: true,
      previousAutonomousChildCard: true,
    };
    expect(family('FT-06').explanation).toContain('€90');
    expect(
      family('FT-06', {}, { birthDate: '2009-11-23' }).explanation,
    ).toContain('fee €0');
    expect(
      family('FT-06', child, { birthDate: '2008-11-23' }).explanation,
    ).toContain('fee €150');
    expect(
      family('FT-06', child, { birthDate: '2005-11-23' }).explanation,
    ).toContain('fee €450');
    expect(family('FT-07', child, { birthDate: '2005-11-23' }).status).toBe(
      'MET',
    );
    expect(
      family(
        'FT-07',
        { ...child, previousAutonomousChildCard: false },
        { birthDate: '2005-11-23' },
      ).status,
    ).toBe('NOT_MET');
    expect(family('FT-07', child, { birthDate: '2002-11-23' }).status).toBe(
      'NOT_MET',
    );
  });
  test('autonomous family residence uses the chosen basis independently of continued cohabitation', () => {
    const spouse: Family = {
      stage: 'autonomous',
      autonomousBasis: 'residence',
      previousFamilyCard: true,
      familyResidenceYears: 5,
    };
    expect(family('FT-07', spouse).status).toBe('MET');
    expect(family('FT-07', { ...spouse, familyResidenceYears: 4 }).status).toBe(
      'NOT_MET',
    );
    expect(
      family('FT-07', {
        ...spouse,
        sponsor: 'blue-card',
        blueFamilyYearsInEU: 5,
        familyResidenceYears: 2,
      }).status,
    ).toBe('MET');
    expect(
      family('FT-07', {
        ...spouse,
        autonomousBasis: 'bereavement',
        familyResidenceYears: 1,
      }).status,
    ).toBe('MET');
    expect(
      family('FT-07', {
        ...spouse,
        autonomousBasis: 'bereavement',
        familyResidenceYears: 0,
      }).status,
    ).toBe('NOT_MET');
    const divorced: Family = {
      ...spouse,
      autonomousBasis: 'divorce',
      priorMarriageYears: 3,
      priorMarriageYearsInGreece: 1,
      familyLifeContinues: false,
    };
    expect(family('FT-07', divorced).status).toBe('MET');
    expect(
      family('FT-07', { ...divorced, priorMarriageYearsInGreece: 0 }).status,
    ).toBe('NOT_MET');
    expect(
      family('FT-07', {
        ...divorced,
        autonomousBasis: 'hardship',
        hardshipDocumented: true,
      }).status,
    ).toBe('MET');
    expect(
      family('FT-08', { stage: 'renewal', familyLifeContinues: false }).status,
    ).toBe('NOT_MET');
    expect(
      family('FT-08', { relationshipAndDocumentsGenuine: false }).status,
    ).toBe('NOT_MET');
    expect(
      workFamilyChecks(
        'GR-FAMILY-TCN',
        { ...base, familyTcn: divorced },
        grContext(),
      ).map((x) => x.id),
    ).toEqual(['FT-06', 'FT-07']);
  });
});
