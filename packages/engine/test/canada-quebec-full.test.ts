import { describe, expect, test } from 'vitest';
import { evaluateCanadaFull } from '../src';
import type { FederalMember } from '../src/canada-full/federal';
import type { QuebecAnswers } from '../src/canada-full/quebec';
import { federal, filed, person } from './canada-federal-fixture';

const date = '2026-11-23';
const base: QuebecAnswers = {
  stream: 'high',
  feer: 2,
  intendsQuebec: true,
  capableOfProposedJob: true,
  noApplicantControlOfEmployer: true,
  eligibleIndustry: true,
  scholarshipReturnConditionsSatisfiedIfAny: true,
  eoi: '2026-06-01',
  invited: '2026-08-01',
  accepted: '2026-08-31',
  filed: '2026-10-30',
  invitationCriteriaProven: true,
  sameInvitedOccupationAndStream: true,
  accompanyingPartner: false,
  accompanyingMinorChildren: 0,
  accompanyingAdultDependants: 0,
  hasCanadianCitizenDependentChildren: false,
  contractSigned: true,
  availableFunds: 3957,
  principalValues: { issued: '2026-09-01' },
  french: {
    evidence: 'approved-test',
    testDate: '2024-10-30',
    listening: 7,
    speaking: 7,
    reading: 5,
    writing: 5,
  },
  authorisationRequiredInProposedSetting: false,
  mainOccupationMonths: 9,
  compulsoryInternshipMonths: 3,
  education: {
    eligibleDiploma: true,
    level: 'vocational',
    directlyLeadsToOccupation: true,
    fullTimeYears: 1,
    obtained: '2026-05-23',
    fromQuebec: true,
    hours: 900,
  },
  principalCsq: 'valid',
  federalReceived: date,
  feePaid: 940,
};
function route(
  quebec: QuebecAnswers,
  dob = '2008-10-30',
  sim = date,
  members: FederalMember[] = [],
) {
  return evaluateCanadaFull({
    simulationDate: sim,
    dateOfBirth: dob,
    quebec,
    federal: {
      ...federal,
      members,
      principal: {
        ...person,
        exam: { instructionOn: sim, examOn: sim, panelExamComplete: true },
      },
      applications: { 'CA-QC-PSTQ': { ...filed, filedOn: undefined } },
    },
  }).columns[0].pathways.find((p) => p.id === 'CA-QC-PSTQ')!;
}
function check(
  id: number,
  patch: Partial<QuebecAnswers>,
  dob?: string,
  sim?: string,
) {
  return route({ ...base, ...patch }, dob, sim).checks.find(
    (c) => c.id === `CA-R${id}`,
  )!;
}
describe('Québec PSTQ selection and federal filing', () => {
  test.each([
    ['expired', '2028-10-15', 'MET'],
    ['expired', '2028-11-02', 'MET'],
    ['expired', '2028-11-03', 'NOT_MET'],
    ['revoked', '2028-10-15', 'NOT_MET'],
    ['expired', undefined, 'UNKNOWN'],
    ['expired', '2028-12-01', 'UNKNOWN'],
  ] as const)(
    'principal CSQ %s with receipt %s during federal processing',
    (principalCsq, federalReceived, expected) => {
      const result = route(
        {
          ...base,
          principalCsq,
          principalCsqIssued: '2026-11-02',
          principalCsqExpires: '2028-11-02',
          federalReceived,
        },
        '1990-01-01',
        '2028-11-23',
      );
      expect(result.checks.find((c) => c.id === 'CA-R69')?.status).toBe(
        expected,
      );
      expect(result.status).toBe(expected);
    },
  );

  test.each([
    ['expired', '2026-11-20', 'MET'],
    ['expired', '2026-11-22', 'NOT_MET'],
    ['revoked', '2026-11-20', 'NOT_MET'],
  ] as const)(
    'accompanying CSQ %s with receipt %s',
    (status, federalReceived, expected) => {
      const result = route(
        {
          ...base,
          availableFunds: 10000,
          accompanyingMinorChildren: 1,
          completeSelectionApplicationReceived: base.filed,
          principalCsqIssued: '2026-11-02',
          accompanyingCsqs: [
            { status, issued: '2026-11-02', expires: '2026-11-21' },
          ],
          federalReceived,
        },
        '1990-01-01',
        date,
        [
          {
            ...person,
            dateOfBirth: '2017-06-01',
            relationship: 'child',
            accompanying: true,
            unmarriedAndUnpartnered: true,
            otherAdmissibility: 'clear',
            exam: {
              instructionOn: date,
              examOn: date,
              panelExamComplete: true,
            },
          },
        ],
      );
      expect(result.checks.find((c) => c.id === 'CA-R69')?.status).toBe(
        expected,
      );
      expect(result.status).toBe(expected);
    },
  );

  test.each<[Partial<QuebecAnswers>, string]>([
    [{}, 'MET'],
    [{ filed: undefined }, 'UNKNOWN'],
    [{ filed: '2026-11-24' }, 'UNKNOWN'],
    [{ accepted: undefined }, 'UNKNOWN'],
    [{ accepted: undefined, officialFilingDeadline: '2026-10-29' }, 'NOT_MET'],
    [{ invitationRevoked: true }, 'NOT_MET'],
    [{ filed: '2026-10-31' }, 'NOT_MET'],
  ])(
    'Arrima invitation uses an actual response and provincial receipt: %j',
    (patch, expected) => {
      const result = route({
        ...base,
        french: { ...base.french, testDate: '2026-01-01' },
        ...patch,
      });
      expect(result.checks.find((c) => c.id === 'CA-R61')?.status).toBe(
        expected,
      );
      expect(result.status).toBe(expected);
    },
  );

  test('R69 checks the CSQ at federal receipt independently of provincial filing', () => {
    for (const [filedOn, principalCsqExpires, expected] of [
      ['2026-11-05', '2028-11-02', 'MET'],
      ['2026-11-05', '2026-11-10', 'MET'],
      ['2026-11-01', '2026-11-10', 'NOT_MET'],
      ['2026-11-11', '2026-11-10', 'NOT_MET'],
      [undefined, '2028-11-02', 'UNKNOWN'],
    ] as const) {
      const result = evaluateCanadaFull({
        simulationDate: date,
        dateOfBirth: '1990-01-01',
        quebec: {
          ...base,
          federalReceived: undefined,
          principalCsqIssued: '2026-11-02',
          principalCsqExpires,
        },
        federal: {
          ...federal,
          principal: {
            ...person,
            exam: {
              instructionOn: '2026-11-09',
              examOn: '2026-11-15',
              panelExamComplete: true,
            },
          },
          applications: { 'CA-QC-PSTQ': { ...filed, filedOn } },
        },
      }).columns[0].pathways.find((p) => p.id === 'CA-QC-PSTQ')!;
      expect(result.checks.find((c) => c.id === 'CA-R24')?.status).toBe('MET');
      expect(result.checks.find((c) => c.id === 'CA-R69')?.status).toBe(
        expected,
      );
      expect(result.status).toBe(expected);
    }
  });

  test('complete provincial high-skill evidence meets only the relevant stream', () => {
    const p = route(base);
    for (const id of [60, 61, 62, 63, 64, 65, 69, 70])
      expect(p.checks.find((c) => c.id === `CA-R${id}`)?.status).toBe('MET');
    for (const id of [66, 67, 68])
      expect(p.checks.find((c) => c.id === `CA-R${id}`)).toBeUndefined();
    expect(check(60, {}, '2008-10-31').status).toBe('NOT_MET');
    expect(
      check(60, { scholarshipReturnConditionsSatisfiedIfAny: false }).status,
    ).toBe('NOT_MET');
    expect(check(69, { principalCsq: 'pending' }).status).toBe('UNKNOWN');
    expect(check(69, { principalCsqIssued: '2026-11-24' }).status).toBe(
      'UNKNOWN',
    );
    expect(check(69, { principalCsqExpires: '2026-11-22' }).status).toBe(
      'NOT_MET',
    );
    expect(check(69, { principalCsq: 'revoked' }).status).toBe('NOT_MET');
    expect(
      check(69, { accompanyingMinorChildren: 1, accompanyingCsqsValid: false })
        .status,
    ).toBe('NOT_MET');
  });
  test('invitation response and filing boundaries; stream 3 document conflict follows the letter', () => {
    expect(check(61, { accepted: '2026-09-01' }).status).toBe('NOT_MET');
    expect(check(61, { filed: '2026-10-31' }).status).toBe('NOT_MET');
    expect(
      check(61, {
        invited: '2026-11-24',
        accepted: '2026-11-26',
        filed: '2026-12-01',
      }).status,
    ).toBe('UNKNOWN');
    expect(check(61, { invited: undefined }).status).toBe('UNKNOWN');
    expect(check(61, { sameInvitedOccupationAndStream: false }).status).toBe(
      'NOT_MET',
    );
    const delayed: Partial<QuebecAnswers> = {
      stream: 'regulated',
      eoi: '2025-01-01',
      invited: '2025-11-01',
      accepted: '2025-11-20',
      filed: '2026-11-15',
      hadRecognitionAtAcceptance: false,
    };
    expect(check(61, delayed)).toMatchObject({
      status: 'UNKNOWN',
      pendingDetails: ['PD-253'],
    });
    expect(
      check(61, { ...delayed, officialFilingDeadline: '2026-11-15' }).status,
    ).toBe('MET');
    expect(
      check(61, { ...delayed, officialFilingDeadline: '2026-11-14' }).status,
    ).toBe('NOT_MET');
  });
  test('family financial scale, annual validity and documented exceptional households', () => {
    expect(check(62, { availableFunds: 3956 }).status).toBe('NOT_MET');
    expect(check(62, { contractSigned: false }).status).toBe('NOT_MET');
    // Single + four minors: 6,687 + 685 = 7,372.
    expect(
      check(62, { accompanyingMinorChildren: 4, availableFunds: 7372 }),
    ).toMatchObject({
      status: 'MET',
      explanation: expect.stringContaining('7372'),
    });
    // Couple + four minors + adult dependant: 7,531 + 516 + 1,845 = 9,892.
    const mixed: Partial<QuebecAnswers> = {
      accompanyingPartner: true,
      accompanyingMinorChildren: 4,
      accompanyingAdultDependants: 1,
      availableFunds: 9892,
    };
    expect(check(62, mixed)).toMatchObject({
      status: 'MET',
      explanation: expect.stringContaining('9892'),
    });
    expect(check(62, { ...mixed, availableFunds: 9891 }).status).toBe(
      'NOT_MET',
    );
    expect(check(62, { accompanyingAdultDependants: 1 })).toMatchObject({
      status: 'UNKNOWN',
      pendingDetails: ['PD-254'],
    });
    expect(
      check(62, { ...mixed, hasCanadianCitizenDependentChildren: true }).status,
    ).toBe('UNKNOWN');
    expect(
      check(62, {
        accompanyingAdultDependants: 1,
        officialContractAmount: 3957,
      }).status,
    ).toBe('MET');
    expect(
      check(62, { filed: '2027-01-01' }, undefined, '2027-01-01').status,
    ).toBe('UNKNOWN');
    expect(check(70, mixed).explanation).toContain('2146'); // 940 + 6 × 201.
    expect(check(70, { feePaid: 939 }).status).toBe('NOT_MET');
    expect(
      check(70, { filed: '2027-01-01' }, undefined, '2027-01-01').status,
    ).toBe('UNKNOWN');
  });
  test('values attestation for every applicable person, dated deadline or formal exemption', () => {
    expect(check(63, { accompanyingPartner: true }).status).toBe('UNKNOWN');
    expect(
      check(63, {
        accompanyingPartner: true,
        familyValues: [{ confirmedDisabilityExemption: true }],
      }).status,
    ).toBe('MET');
    expect(
      check(63, {
        principalValues: { requestDate: '2026-09-01', issued: '2026-10-31' },
      }).status,
    ).toBe('MET');
    expect(
      check(63, {
        principalValues: { requestDate: '2026-09-01', issued: '2026-11-01' },
      }).status,
    ).toBe('NOT_MET');
    expect(check(63, { principalValues: { refused: true } }).status).toBe(
      'NOT_MET',
    );
    expect(
      check(63, { principalValues: { requestDate: '2026-09-01' } }).status,
    ).toBe('UNKNOWN');
    expect(
      check(63, { principalValues: { ...base.principalValues, revoked: true } })
        .status,
    ).toBe('NOT_MET');
    expect(check(63, { filed: undefined }).status).toBe('UNKNOWN');
    expect(
      check(63, { principalValues: { issued: '2024-10-29' } }).status,
    ).toBe('NOT_MET');
  });
  test('official values assessment: fifteen of twenty passes, third attempt eligibility and two-week retry interval', () => {
    const online = {
      correctAnswers: 15,
      completed: '2026-11-20',
      attempt: 'final' as const,
      previousAttempt: '2026-11-06',
      validStudyOrWorkPermit: false,
    };
    expect(check(63, { principalValues: { online } }).status).toBe('MET');
    expect(
      check(63, {
        principalValues: { online: { ...online, correctAnswers: 14 } },
      }).status,
    ).toBe('NOT_MET');
    expect(
      check(63, {
        principalValues: {
          online: { ...online, correctAnswers: 14, attempt: 'first' },
        },
      }).status,
    ).toBe('UNKNOWN');
    expect(
      check(63, {
        principalValues: {
          online: { ...online, previousAttempt: '2026-11-07' },
        },
      }).status,
    ).toBe('UNKNOWN');
    expect(
      check(63, {
        principalValues: {
          online: { ...online, validStudyOrWorkPermit: true },
        },
      }).status,
    ).toBe('UNKNOWN');
    expect(
      check(63, {
        principalValues: { authorisedSessionCompleted: '2026-11-20' },
      }).status,
    ).toBe('MET');
  });
  test('French evidence uses all required Québec scores, the filing date and partner evidence', () => {
    for (const [patch, expected] of [
      [{ filed: undefined }, 'UNKNOWN'],
      [{ french: { ...base.french, revoked: true } }, 'NOT_MET'],
    ] as const) {
      const result = route({ ...base, ...patch });
      expect(result.checks.find((c) => c.id === 'CA-R64')?.status).toBe(
        expected,
      );
      expect(result.status).toBe(expected);
    }
    expect(check(64, { french: { ...base.french, writing: 4 } }).status).toBe(
      'NOT_MET',
    );
    expect(
      check(64, { french: { ...base.french, testDate: '2024-10-29' } }).status,
    ).toBe('NOT_MET');
    expect(check(64, { accompanyingPartner: true }).status).toBe('UNKNOWN');
    expect(
      check(64, {
        accompanyingPartner: true,
        partnerFrench: {
          evidence: 'accepted-education',
          speaking: 4,
          listening: 3,
        },
      }).status,
    ).toBe('NOT_MET');
    expect(
      check(64, {
        accompanyingPartner: true,
        partnerFrench: {
          evidence: 'accepted-education',
          speaking: 4,
          listening: 4,
        },
      }).status,
    ).toBe('MET');
    expect(
      check(64, {
        stream: 'talent',
        french: undefined,
        accompanyingPartner: true,
      }).status,
    ).toBe('MET');
  });
  test('high-skilled minimum and compulsory placement cap; unresolved decisive equivalence', () => {
    expect(
      check(65, { mainOccupationMonths: 8.99, compulsoryInternshipMonths: 8 })
        .status,
    ).toBe('NOT_MET');
    expect(
      check(65, { education: { ...base.education, hours: 899 } }).status,
    ).toBe('NOT_MET');
    expect(
      check(65, {
        education: {
          ...base.education,
          hours: 899,
          unresolvedEquivalence: true,
        },
      }).status,
    ).toBe('UNKNOWN');
    expect(
      check(65, {
        education: {
          ...base.education,
          level: 'university',
          credits: 30,
          hours: undefined,
        },
      }).status,
    ).toBe('MET');
  });
  test('intermediate: combined internship cap, inside minimum and outside maximum', () => {
    const lower: Partial<QuebecAnswers> = {
      stream: 'intermediate',
      feer: 3,
      localMainMonths: 9,
      localInternshipMonths: 3,
      outsideRelatedMonths: 18,
      outsideInternshipMonths: 0,
      education: { ...base.education, level: 'vocational', hours: 600 },
    };
    expect(check(66, lower).status).toBe('MET');
    expect(check(66, { ...lower, localMainMonths: 8.99 }).status).toBe(
      'NOT_MET',
    );
    expect(
      check(66, {
        ...lower,
        outsideRelatedMonths: 11.99,
        outsideInternshipMonths: 3,
      }).status,
    ).toBe('NOT_MET');
    expect(
      check(66, { ...lower, education: { ...lower.education, hours: 599 } })
        .status,
    ).toBe('NOT_MET');
    expect(
      check(64, {
        ...lower,
        french: { evidence: 'accepted-education', speaking: 5, listening: 5 },
      }).status,
    ).toBe('MET');
  });
  test('regulated: receipt pending; recognised equivalence may be five years old', () => {
    const trade: Partial<QuebecAnswers> = {
      stream: 'regulated',
      feer: 3,
      occupationOnRegulatedList: true,
      authorisationRequiredInProposedSetting: true,
      recognition: 'partial',
      recognitionDate: '2021-10-30',
    };
    expect(check(67, trade).status).toBe('MET');
    expect(check(67, { ...trade, recognitionDate: '2021-10-29' }).status).toBe(
      'NOT_MET',
    );
    expect(check(67, { ...trade, recognition: 'receipt-only' }).status).toBe(
      'UNKNOWN',
    );
    expect(check(67, { ...trade, recognition: 'refused' }).status).toBe(
      'NOT_MET',
    );
    for (const [patch, expected] of [
      [{}, 'MET'],
      [{ filed: undefined }, 'UNKNOWN'],
      [{ recognition: 'revoked' }, 'NOT_MET'],
    ] as const) {
      const result = route({
        ...base,
        ...trade,
        hadRecognitionAtAcceptance: true,
        ...patch,
      });
      expect(result.checks.find((c) => c.id === 'CA-R67')?.status).toBe(
        expected,
      );
      expect(result.status).toBe(expected);
    }
    expect(
      check(67, {
        ...trade,
        recognition: 'valid-licence',
        recognitionDate: undefined,
      }).status,
    ).toBe('MET');
  });
  test('talent: listed achievement or formal partner opinion, three years of practice', () => {
    const talent: Partial<QuebecAnswers> = {
      stream: 'talent',
      mainOccupationMonths: 33,
      exceptionalExpertiseAndTrackRecord: true,
      listedAchievement: true,
    };
    expect(check(68, talent).status).toBe('MET');
    expect(
      check(68, {
        ...talent,
        listedAchievement: false,
        favourableOfficialPartnerOpinion: true,
      }).status,
    ).toBe('MET');
    expect(
      check(68, {
        ...talent,
        mainOccupationMonths: 32,
        compulsoryInternshipMonths: 5,
      }).status,
    ).toBe('NOT_MET');
    expect(check(68, { ...talent, listedAchievement: false }).status).toBe(
      'UNKNOWN',
    );
  });
});
