import { describe, expect, test } from 'vitest';
import { evaluateCanadaFull } from '../src';
import type { AtlanticAnswers } from '../src/canada-full/atlantic';
import type { WorkPeriod } from '../src/canada-full/express';

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
    atlantic: { ...base, ...change },
  })
    .columns[0].pathways.find((p) => p.id === 'CA-AIP')!
    .checks.find((c) => c.id === 'CA-R' + n)!;
}
describe('Atlantic Immigration Program', () => {
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
  test('R56 statutory TEER hierarchy and nursing exception conflicting with web guidance', () => {
    const offer = { ...base.offer, noc: '33102', teer: 3 as const };
    const nurse = { ...job, noc: '32101', teer: 2 as const };
    const check = rule(56, { offer, workHistory: [nurse] });
    expect(check.status).toBe('UNKNOWN');
    expect(check.explanation).toContain('regulation accepts');
    expect(check.pendingDetails).toContain('PD-252');
    expect(
      rule(56, { offer, workHistory: [{ ...nurse, noc: '31301', teer: 1 }] })
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
