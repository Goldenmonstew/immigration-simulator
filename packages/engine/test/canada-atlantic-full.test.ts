import { describe, expect, test } from 'vitest';
import { evaluateCanadaFull } from '../src';
import type { AtlanticAnswers } from '../src/canada-full/atlantic';
import type { WorkPeriod } from '../src/canada-full/express';
import { federal, filed, person } from './canada-federal-fixture';

const when = '2026-11-23';
const job: WorkPeriod = {
  from: '2025-11-23',
  to: '2026-11-22',
  noc: '21200',
  teer: 1,
  dailyHours: [0, 6, 6, 6, 6, 6, 0],
  dutiesConfirmed: true,
  pay: 'paid',
  inCanada: false,
  selfEmployed: false,
};
const base: AtlanticAnswers = {
  destination: 'NS',
  jobProvince: 'NS',
  settlementPlanGivenToEmployer: true,
  employerDesignated: true,
  endorsement: {
    province: 'NS',
    issued: '2026-06-10',
    expires: when,
    revoked: false,
  },
  offer: {
    noc: '21200',
    teer: 1,
    hoursPerWeek: 30,
    permanent: false,
    monthsAfterPr: 12,
    continuousPaidNonseasonal: true,
    eligibleNamedEmployer: true,
    applicantAndPartnerOwnershipPercent: 50,
    ableAndLikelyToAccept: true,
    genuine: true,
  },
  graduate: { claimsExemption: false },
  workHistory: [job],
  education: {
    origin: 'foreign',
    level: 'oneYear',
    ecaDate: '2021-11-24',
    appropriateEca: true,
  },
  ecaIssuer: 'CACB',
  language: {
    test: 'PTE Core',
    resultDate: '2024-11-24',
    levels: { listening: 5, speaking: 5, reading: 5, writing: 5 },
  },
  funds: { familySize: 1, availableAtApplication: 3815, verified: true },
  workingInCanada: false,
};
function rule(n: number, change: Partial<AtlanticAnswers> = {}) {
  return evaluateCanadaFull({
    simulationDate: when,
    locale: 'en',
    atlantic: { ...base, applicationDate: when, ...change },
  })
    .columns[0].pathways.find((p) => p.id === 'CA-AIP')!
    .checks.find((c) => c.id === 'CA-R' + n)!;
}
describe('Atlantic Immigration Program', () => {
  test.each([
    [undefined, undefined, true, 'UNKNOWN'],
    ['2026-06-09', undefined, false, 'MET'],
    ['2026-07-01', undefined, false, 'UNKNOWN'],
    ['2026-07-01', '2026-07-02', false, 'MET'],
    ['2026-07-01', '2026-06-30', false, 'UNKNOWN'],
    ['2026-07-01', '2026-11-24', false, 'UNKNOWN'],
    ['2026-11-24', undefined, false, 'UNKNOWN'],
  ] as const)(
    'R26 and AIP: issued %s, supplement received %s, outstanding %s → %s',
    (
      certificateIssued,
      supplementReceivedOn,
      outstandingPoliceRequest,
      expected,
    ) => {
      const result = evaluateCanadaFull({
        simulationDate: when,
        atlantic: {
          ...base,
          applicationDate: '2026-06-10',
          workHistory: [{ ...job, from: '2024-01-01', to: '2025-12-31' }],
        },
        federal: {
          ...federal,
          applications: { 'CA-AIP': { ...filed, filedOn: undefined } },
          principal: {
            ...person,
            exam: { disposition: 'exempt' },
            definitiveChecklistSatisfied: undefined,
            outstandingPoliceRequest,
            foreignStays: [
              {
                from: '2021-01-01',
                until: '2025-12-31',
                currentCountry: false,
                certificateIssued,
                supplementReceipts: { 'CA-AIP': supplementReceivedOn },
              },
            ],
          },
        },
      }).columns[0].pathways.find((p) => p.id === 'CA-AIP')!;
      expect(result.checks.find((c) => c.id === 'CA-R26')?.status).toBe(
        expected,
      );
      expect(result.status).toBe(expected);
    },
  );

  test.each([
    ['2026-06-10', false, 'MET'],
    ['2026-07-01', false, 'MET'],
    ['2026-07-02', false, 'NOT_MET'],
    ['2026-06-10', true, 'NOT_MET'],
    [undefined, false, 'UNKNOWN'],
    ['2026-12-01', false, 'UNKNOWN'],
  ] as const)(
    'R55 and AIP: federal receipt %s, endorsement revoked %s → %s',
    (filedOn, revoked, expected) => {
      const result = evaluateCanadaFull({
        simulationDate: when,
        atlantic: {
          ...base,
          endorsement: { ...base.endorsement!, expires: '2026-07-01', revoked },
          workHistory: [{ ...job, from: '2024-01-01', to: '2025-12-31' }],
        },
        federal: {
          ...federal,
          principal: {
            ...person,
            exam: {
              instructionOn: '2026-06-15',
              examOn: '2026-06-22',
              panelExamComplete: true,
            },
          },
          applications: { 'CA-AIP': { ...filed, filedOn } },
        },
      }).columns[0].pathways.find((p) => p.id === 'CA-AIP')!;
      expect(result.checks.find((c) => c.id === 'CA-R24')?.status).toBe('MET');
      expect(result.checks.find((c) => c.id === 'CA-R55')?.status).toBe(
        expected,
      );
      expect(result.status).toBe(expected);
    },
  );
  test('R55 valid endorsement in same province, including expiration date', () => {
    expect(rule(55).status).toBe('MET');
    expect(rule(55, { jobProvince: 'NB' }).status).toBe('NOT_MET');
    expect(
      rule(55, { endorsement: { ...base.endorsement!, expires: '2026-11-22' } })
        .status,
    ).toBe('NOT_MET');
    expect(
      rule(55, { endorsement: { ...base.endorsement!, revoked: true } }).status,
    ).toBe('NOT_MET');
    expect(
      rule(55, {
        applicationDate: '2026-12-15',
        endorsement: {
          province: 'NS',
          issued: '2026-12-01',
          expires: '2027-06-01',
          revoked: false,
        },
      }).status,
    ).toBe('UNKNOWN');
    expect(rule(55, { endorsement: undefined }).pendingDetails).toContain(
      'PD-252',
    );
  });
  test('R56 30 hours, 12 months, 50 percent ownership; indeterminate TEER 4', () => {
    expect(rule(56).status).toBe('MET');
    for (const change of [
      { hoursPerWeek: 29 },
      { monthsAfterPr: 11 },
      { applicantAndPartnerOwnershipPercent: 50.1 },
    ]) {
      expect(rule(56, { offer: { ...base.offer, ...change } }).status).toBe(
        'NOT_MET',
      );
    }
    const job4 = { ...job, teer: 4 as const, noc: '44101' };
    expect(
      rule(56, {
        offer: { ...base.offer, teer: 4, noc: job4.noc },
        workHistory: [job4],
      }).status,
    ).toBe('NOT_MET');
    expect(
      rule(56, {
        offer: { ...base.offer, teer: 4, noc: job4.noc, permanent: true },
        workHistory: [job4],
      }).status,
    ).toBe('MET');
  });
  test('R56 compares the offered TEER with the predominant work experience', () => {
    const teer3 = { noc: '63200', teer: 3 as const };
    const workHistory = [{ ...job, ...teer3, from: '2025-10-01' }];
    expect(rule(57, { workHistory }).status).toBe('MET');
    expect(rule(56, { workHistory }).status).toBe('MET');
    expect(rule(56, { offer: { ...base.offer, ...teer3 } }).status).toBe(
      'NOT_MET',
    );
    const teer2 = { noc: '22212', teer: 2 as const };
    expect(
      rule(56, { offer: { ...base.offer, ...teer2 }, workHistory }).status,
    ).toBe('MET');
    const check = rule(56, {
      offer: { ...base.offer, ...teer3 },
      workHistory: [{ ...job, ...teer2 }],
    });
    expect(check.status).toBe('UNKNOWN');
    expect(check.explanation).toContain('regulation accepts');
    expect(check.pendingDetails).toContain('PD-252');
  });
  test('R56 distinguishes the nursing codes listed by IRPR and IRCC', () => {
    const offer = {
      ...base.offer,
      noc: '44101',
      teer: 4 as const,
      permanent: true,
    };
    for (const [noc, teer, wording] of [
      ['32101', 2, 'regulation accepts'],
      ['31201', 1, 'regulation rejects'],
    ] as const) {
      const check = rule(56, { offer, workHistory: [{ ...job, noc, teer }] });
      expect(check.status).toBe('UNKNOWN');
      expect(check.explanation).toContain(wording);
      expect(check.pendingDetails).toContain('PD-252');
    }
    expect(
      rule(56, { offer, workHistory: [{ ...job, noc: '31301', teer: 1 }] })
        .status,
    ).toBe('MET');
  });
  test('R57 one year, 1,560 hours; student exemption needs 16 local months and less than half remote study', () => {
    expect(rule(57).status).toBe('MET');
    expect(
      rule(57, { workHistory: [{ ...job, from: '2025-11-24' }] }).status,
    ).toBe('NOT_MET');
    expect(
      rule(57, { workHistory: [{ ...job, selfEmployed: true }] }).status,
    ).toBe('NOT_MET');
    const g: AtlanticAnswers['graduate'] = {
      claimsExemption: true,
      awarded: '2024-11-24',
      recognizedInstitution: true,
      yearsOfStudy: 2,
      fullTimeThroughout: true,
      monthsResidentInInstitutionProvinceDuringLastTwoYears: 16,
      temporaryStatusAndAuthorizationThroughout: true,
      distanceLearningPercent: 49,
      secondLanguageStudyPercent: 49,
      returnHomeObligation: false,
    };
    expect(rule(57, { workHistory: [], graduate: g }).status).toBe('MET');
    for (const change of [
      { monthsResidentInInstitutionProvinceDuringLastTwoYears: 15 },
      { distanceLearningPercent: 50 },
      { secondLanguageStudyPercent: 50 },
      { awarded: '2024-11-23' },
      { returnHomeObligation: true },
    ])
      expect(
        rule(57, { workHistory: [], graduate: { ...g, ...change } }).status,
      ).toBe('NOT_MET');
    expect(
      rule(57, {
        workHistory: [],
        graduate: { ...g, recognizedInstitution: undefined },
      }).status,
    ).toBe('UNKNOWN');
  });
  test('R58 TEER-specific education, regulated assessor, test validity, and all four skills', () => {
    expect(rule(58).status).toBe('MET');
    expect(rule(58, { applicationDate: undefined }).status).toBe('UNKNOWN');
    expect(
      rule(58, { language: { ...base.language, revoked: true } }).status,
    ).toBe('NOT_MET');
    expect(
      rule(58, { education: { ...base.education, ecaRevoked: true } }).status,
    ).toBe('NOT_MET');
    expect(rule(58, { ecaIssuer: 'general-designated' }).status).toBe(
      'NOT_MET',
    );
    expect(
      rule(58, { education: { ...base.education, level: 'secondary' } }).status,
    ).toBe('NOT_MET');
    expect(
      rule(58, { education: { ...base.education, ecaDate: '2021-11-23' } })
        .status,
    ).toBe('NOT_MET');
    expect(
      rule(58, { language: { ...base.language, resultDate: '2024-11-23' } })
        .status,
    ).toBe('NOT_MET');
    const education = {
      origin: 'Canada' as const,
      level: 'secondary' as const,
    };
    const levels = { listening: 4, speaking: 4, reading: 4, writing: 4 };
    expect(
      rule(58, {
        offer: { teer: 4 },
        education,
        language: { ...base.language, levels },
      }).status,
    ).toBe('MET');
    expect(
      rule(58, {
        offer: { teer: 3 },
        education,
        language: { ...base.language, levels },
      }).status,
    ).toBe('NOT_MET');
  });
  test('R59 10,098 + 1,028 for eight; exemption requires current authorized work', () => {
    const funds = {
      ...base.funds,
      familySize: 8,
      availableAtApplication: 11126,
    };
    expect(rule(59, { funds }).status).toBe('MET');
    expect(
      rule(59, { funds: { ...funds, availableAtApplication: 11125 } }).status,
    ).toBe('NOT_MET');
    expect(
      rule(59, {
        funds: undefined,
        workingInCanada: true,
        fundsExemptionAuthorization: true,
      }).status,
    ).toBe('MET');
    expect(rule(59, { funds: undefined, workingInCanada: true }).status).toBe(
      'UNKNOWN',
    );
    expect(
      rule(59, { applicationDate: '2027-01-01', funds }).pendingDetails,
    ).toContain('PD-248');
  });
});
