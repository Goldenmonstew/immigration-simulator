import { describe, expect, test } from 'vitest';
import type { GrFullRequest } from '../src/greece-full';
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
      work('WK-INVITATION-AGE', {}, { birthDate: '2008-11-23' }).status,
    ).toBe('NOT_MET');
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
    ).toBe('NOT_MET');
    const renewal = {
      stage: 'renewal' as const,
      taxesSettledDuringPermit: true,
    };
    expect(
      work('WK-07', renewal, {
        insurance: { kind: 'gap', gapEvidence: 'unemployment-benefit' },
      }).status,
    ).toBe('MET');
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
    expect(family('FT-05', {}, { birthDate: '2008-11-24' }).status).toBe(
      'NOT_MET',
    );
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
