import { describe, expect, test } from 'vitest';
import { evaluateCanadaFull } from '../src';
import type { ExpressAnswers, WorkPeriod } from '../src/canada-full/express';

const simulationDate = '2026-11-23';
const skills = (n: number) => ({
  speaking: n,
  listening: n,
  reading: n,
  writing: n,
});
const language: ExpressAnswers['primary'] = {
  test: 'IELTS General Training',
  resultDate: '2025-01-05',
  levels: skills(7),
};
const job: WorkPeriod = {
  from: '2024-11-23',
  to: '2026-11-22',
  noc: '72310',
  teer: 2,
  dailyHours: [0, 6, 6, 6, 6, 6, 0],
  dutiesConfirmed: true,
  pay: 'paid',
  inCanada: true,
  canadianEmployer: true,
  authorizedTemporaryResident: true,
  fullTimeStudent: false,
  selfEmployed: false,
  independentlyQualifiedFrom: '2024-11-23',
};
const complete: ExpressAnswers = {
  profileDate: '2026-01-01',
  profileUpdated: true,
  invitation: { date: '2026-11-03', program: 'CA-EE-FSW' },
  applicationDate: simulationDate,
  qualificationsRetained: true,
  completeElectronicApplication: true,
  round: {
    date: '2026-11-03',
    cutoff: 440,
    confirmedCrs: 440,
    category: 'general',
    profileTimestamp: '2026-01-01T09:00:00Z',
    tieBreakTimestamp: '2026-01-01T09:00:00Z',
  },
  primary: language,
  education: { origin: 'Canada', level: 'masters' },
  usingForeignEducationPoints: false,
  workHistory: [job],
  primaryNoc: job.noc,
  fswSelectionWorkYears: 2,
  offer: { exists: false },
  secondary: { test: 'other' },
  adaptability: {
    spouseAccompanying: false,
    applicantStudy: true,
    applicantWork: false,
    qualifyingRelative: false,
  },
  workAuthorizedInCanada: false,
  funds: { familySize: 1, availableAtApplication: 15263, verified: true },
  intendsOutsideQuebec: true,
  tradeEmploymentRequirementsMet: true,
  certificateForTrade: true,
};
type Route = 'CA-EE-FSW' | 'CA-EE-FST' | 'CA-EE-CEC';
function rule(
  id: string,
  changes: Partial<ExpressAnswers> = {},
  route: Route = 'CA-EE-FSW',
  lang: 'en' | 'zh-CN' = 'en',
) {
  const req = {
    simulationDate,
    dateOfBirth: '1992-01-01',
    locale: lang,
    express: { ...complete, ...changes },
  };
  const pathway = evaluateCanadaFull(req).columns[0].pathways.find(
    (p) => p.id === route,
  )!;
  return pathway.checks.find((c) => c.id === 'CA-' + id)!;
}

describe('Express Entry application, ranking and evidence', () => {
  test('R29 profile anniversary, issued program and 60-day deadline', () => {
    expect(rule('R29').status).toBe('MET');
    expect(rule('R29', { profileDate: '2025-11-03' }).status).toBe('NOT_MET');
    expect(rule('R29', { profileDate: '2025-11-04' }).status).toBe('MET');
    expect(rule('R29', { applicationDate: '2027-01-02' }).status).toBe('MET');
    expect(rule('R29', { applicationDate: '2027-01-03' }).status).toBe(
      'NOT_MET',
    );
    expect(rule('R29', { invitation: undefined }).pendingDetails).toContain(
      'PD-246',
    );
    expect(rule('R29', {}, 'CA-EE-CEC').status).toBe('NOT_MET');
  });
  test('R30 contemporaneous official score, published cutoff and timestamp', () => {
    const round = complete.round!;
    expect(rule('R30').status).toBe('MET');
    expect(rule('R30', { round: { ...round, confirmedCrs: 439 } }).status).toBe(
      'NOT_MET',
    );
    expect(
      rule('R30', {
        round: { ...round, profileTimestamp: '2026-01-01T09:00:01Z' },
      }).status,
    ).toBe('NOT_MET');
    expect(
      rule('R30', { round: { ...round, tieBreakTimestamp: undefined } }).status,
    ).toBe('UNKNOWN');
    expect(
      rule('R30', {
        round: { ...round, date: '2026-12-01', confirmedCrs: 900 },
      }).status,
    ).toBe('UNKNOWN');
  });
  test('R31 approved versions, 2-year language and 5-year ECA boundaries, renewal', () => {
    const foreign: ExpressAnswers['education'] = {
      origin: 'foreign',
      level: 'secondary',
      appropriateEca: true,
      ecaDate: '2021-11-24',
    };
    expect(
      rule('R31', {
        education: foreign,
        primary: { ...language, resultDate: '2024-11-24' },
      }).status,
    ).toBe('MET');
    expect(
      rule('R31', { education: { ...foreign, ecaDate: '2021-11-23' } }).status,
    ).toBe('NOT_MET');
    expect(
      rule('R31', { primary: { ...language, resultDate: '2024-11-23' } })
        .status,
    ).toBe('NOT_MET');
    expect(
      rule('R31', {
        primary: { ...language, resultDate: '2026-06-01' },
        profileLanguage: language,
      }).status,
    ).toBe('MET');
    expect(
      rule('R31', { primary: { ...language, test: 'other' } }).status,
    ).toBe('NOT_MET');
  });
  test('R31 uses the result available at profile creation when the filing result is newer', () => {
    const renewed: ExpressAnswers = {
      profileDate: '2026-01-01',
      applicationDate: '2026-11-20',
      primary: { ...language, resultDate: '2026-10-15' },
    };
    const status = (profileLanguage?: ExpressAnswers['profileLanguage']) =>
      rule('R31', { ...renewed, profileLanguage }, 'CA-EE-CEC').status;
    expect(status()).toBe('UNKNOWN');
    expect(status(language)).toBe('MET');
    expect(status({ ...language, resultDate: '2024-01-01' })).toBe('NOT_MET');
  });
  test('R32 French all four NCLC 7, unconfirmed occupational category', () => {
    const round = { ...complete.round!, category: 'french' as const };
    const french = { ...language, test: 'TEF Canada' as const };
    expect(rule('R32', { round, french }).status).toBe('MET');
    expect(
      rule('R32', {
        round,
        french: { ...french, levels: { ...skills(7), speaking: 6 } },
      }).status,
    ).toBe('NOT_MET');
    expect(
      rule('R32', { round: { ...round, category: 'occupation' } }).status,
    ).toBe('UNKNOWN');
  });
});

describe('Federal Skilled Worker', () => {
  test('R33 a calendar year, the weekly cap, continuous paid primary NOC', () => {
    const oneYear = { ...job, from: '2025-11-23' };
    expect(rule('R33', { workHistory: [oneYear] }).status).toBe('MET');
    expect(
      rule('R33', {
        workHistory: [
          {
            ...oneYear,
            from: '2025-11-24',
            dailyHours: [0, 12, 12, 12, 12, 12, 0],
          },
        ],
      }).status,
    ).toBe('NOT_MET');
    expect(
      rule('R33', {
        workHistory: [
          { ...oneYear, to: '2026-05-01' },
          { ...oneYear, from: '2026-05-03' },
        ],
      }).status,
    ).toBe('NOT_MET');
    expect(
      rule('R33', { workHistory: [{ ...oneYear, dutiesConfirmed: undefined }] })
        .status,
    ).toBe('UNKNOWN');
    expect(
      rule('R33', {
        workHistory: [{ ...oneYear, from: '2014-11-23', to: '2016-11-22' }],
      }).status,
    ).toBe('NOT_MET');
  });
  test('R34 weakest skill matters; R35 foreign equivalency needs appropriate evidence', () => {
    expect(rule('R34').status).toBe('MET');
    expect(
      rule('R34', { primary: { ...language, levels: { listening: 6 } } })
        .status,
    ).toBe('NOT_MET');
    expect(
      rule('R34', { primary: { ...language, levels: { listening: 7 } } })
        .status,
    ).toBe('UNKNOWN');
    expect(rule('R35').status).toBe('MET');
    expect(
      rule('R35', {
        education: {
          origin: 'foreign',
          level: 'threeYears',
          appropriateEca: false,
        },
      }).status,
    ).toBe('NOT_MET');
  });
  test('R36 23 education + 16 language + 11 work + 12 age + 0 offer + 5 adaptability = 67', () => {
    expect(rule('R36').status).toBe('MET');
    expect(rule('R36').explanation).toContain('67–67');
    expect(
      rule('R36', {
        education: { origin: 'Canada', level: 'multipleIncludingThreeYears' },
      }).explanation,
    ).toContain('66–66');
    expect(
      rule('R36', {
        education: { origin: 'Canada', level: 'multipleIncludingThreeYears' },
      }).status,
    ).toBe('NOT_MET');
    expect(
      rule('R36', {
        education: { origin: 'Canada', level: 'multipleIncludingThreeYears' },
        secondary: undefined,
      }).status,
    ).toBe('UNKNOWN');
  });
  test('R37 certified offer before/after the LMIA policy and optional position', () => {
    const offer: ExpressAnswers['offer'] = {
      exists: true,
      teer: 2,
      employers: 1,
      weeklyHours: 30,
      monthsAfterPr: 12,
      permanent: false,
      continuousPaidNonseasonal: true,
      eligibleEmployers: true,
      genuineAndAble: true,
      oldLmiaOrPermitRequirementsMet: false,
      policyExemptionConfirmed: true,
    };
    expect(rule('R37', { offer }).status).toBe('MET');
    expect(
      rule('R37', {
        offer,
        invitation: { date: '2026-11-02', program: 'CA-EE-FSW' },
      }).status,
    ).toBe('NOT_MET');
    expect(
      rule('R37', { offer: { ...offer, policyExemptionConfirmed: undefined } })
        .status,
    ).toBe('UNKNOWN');
    expect(rule('R37', { offer: { ...offer, weeklyHours: 29 } }).status).toBe(
      'NOT_MET',
    );
    expect(rule('R37').status).toBe('NOT_MET');
  });
  test('R38 family of eight = 40,392 + 4,112; R39 intent is independent of work location', () => {
    const funds = {
      familySize: 8,
      verified: true,
      availableAtApplication: 44504,
    };
    expect(rule('R38', { funds }).status).toBe('MET');
    expect(
      rule('R38', { funds: { ...funds, availableAtApplication: 44503 } })
        .status,
    ).toBe('NOT_MET');
    expect(
      rule('R38', {
        funds: { ...funds, atIssuance: true, availableAtIssue: 44503 },
      }).status,
    ).toBe('NOT_MET');
    expect(
      rule('R38', { applicationDate: '2027-01-01', funds }).pendingDetails,
    ).toContain('PD-248');
    expect(rule('R39').status).toBe('MET');
    expect(rule('R39', { intendsOutsideQuebec: false }).status).toBe('NOT_MET');
  });
});
describe('Canadian Experience Class and Federal Skilled Trades', () => {
  test('R40 qualifying Canadian work, authorized temporary status, self-employed physician and stipend rules', () => {
    const cec = (workHistory: WorkPeriod[]) =>
      rule('R40', { workHistory }, 'CA-EE-CEC').status;
    expect(cec([job])).toBe('MET');
    expect(cec([{ ...job, fullTimeStudent: true }])).toBe('NOT_MET');
    expect(cec([{ ...job, authorizedTemporaryResident: false }])).toBe(
      'NOT_MET',
    );
    expect(cec([{ ...job, inCanada: false }])).toBe('NOT_MET');
    expect(cec([{ ...job, selfEmployed: true }])).toBe('NOT_MET');
    expect(
      cec([
        { ...job, selfEmployed: true, noc: '31101', physicianException: true },
      ]),
    ).toBe('MET');
    expect(
      cec([
        {
          ...job,
          noc: '41200',
          pay: 'lecturer-stipend',
          canadianEntityPays: true,
        },
      ]),
    ).toBe('MET');
  });
  test('R41 ties across thresholds with equal credited hours after the weekly cap', () => {
    const job1 = {
      ...job,
      from: '2024-01-01',
      to: '2024-12-29',
      teer: 1 as const,
      noc: '21232',
    };
    const job2 = {
      ...job,
      from: '2024-12-30',
      to: '2025-12-28',
      dailyHours: [0, 8, 8, 8, 8, 8, 0] as WorkPeriod['dailyHours'],
    };
    const tied = (level: number) =>
      rule(
        'R41',
        {
          workHistory: [job1, job2],
          primary: { ...language, levels: skills(level) },
        },
        'CA-EE-CEC',
      );
    expect(tied(7).status).toBe('MET');
    expect(tied(6).status).toBe('UNKNOWN');
    expect(tied(6).pendingDetails).toContain('PD-249');
    expect(tied(4).status).toBe('NOT_MET');
    expect(
      rule(
        'R41',
        { workHistory: [job], primary: { ...language, levels: skills(5) } },
        'CA-EE-CEC',
      ).status,
    ).toBe('MET');
  });
  test('R42 two years / 3,120 hours in a listed trade after independent qualification', () => {
    expect(rule('R42', {}, 'CA-EE-FST').status).toBe('MET');
    expect(
      rule(
        'R42',
        { workHistory: [{ ...job, independentlyQualifiedFrom: '2024-11-24' }] },
        'CA-EE-FST',
      ).status,
    ).toBe('NOT_MET');
    expect(
      rule(
        'R42',
        { primaryNoc: '72600', workHistory: [{ ...job, noc: '72600' }] },
        'CA-EE-FST',
      ).status,
    ).toBe('NOT_MET');
    expect(
      rule(
        'R42',
        { workHistory: [{ ...job, independentlyQualifiedFrom: undefined }] },
        'CA-EE-FST',
      ).status,
    ).toBe('UNKNOWN');
  });
  test('R43 trade certificate or valid offer; R44 speaking/listening 5, reading/writing 4', () => {
    expect(rule('R43', {}, 'CA-EE-FST').status).toBe('MET');
    expect(
      rule('R43', { certificateForTrade: false }, 'CA-EE-FST').status,
    ).toBe('NOT_MET');
    const levels = { speaking: 5, listening: 5, reading: 4, writing: 4 };
    expect(
      rule('R44', { primary: { ...language, levels } }, 'CA-EE-FST').status,
    ).toBe('MET');
    expect(
      rule(
        'R44',
        { primary: { ...language, levels: { ...levels, listening: 4 } } },
        'CA-EE-FST',
      ).status,
    ).toBe('NOT_MET');
    expect(
      rule(
        'R44',
        { primary: { ...language, levels: { ...levels, writing: 3 } } },
        'CA-EE-FST',
      ).status,
    ).toBe('NOT_MET');
  });
});

describe('Class-specific education, evidence and invitation versions', () => {
  test('R31 CEC and FST require an ECA only when a foreign credential is claimed', () => {
    const expired: ExpressAnswers['education'] = {
      origin: 'foreign',
      level: 'oneYear',
      appropriateEca: true,
      ecaDate: '2021-11-23',
    };
    for (const route of ['CA-EE-CEC', 'CA-EE-FST'] as const) {
      expect(
        rule(
          'R31',
          { usingForeignEducationPoints: undefined, education: undefined },
          route,
        ).status,
      ).toBe('MET');
      expect(
        rule(
          'R31',
          { usingForeignEducationPoints: true, education: undefined },
          route,
        ).status,
      ).toBe('UNKNOWN');
      const status = (usingForeignEducationPoints?: boolean) =>
        rule('R31', { education: expired, usingForeignEducationPoints }, route)
          .status;
      expect(status()).toBe('UNKNOWN');
      expect(status(true)).toBe('NOT_MET');
      expect(status(false)).toBe('MET');
    }
  });
  test('R36 education bands for two qualifying credentials, masters, regulated entry-to-practice degree and doctorate', () => {
    // All non-education factors sum to 44 (16+11+12+5).
    const bands = {
      none: 44,
      secondary: 49,
      oneYear: 59,
      twoYears: 63,
      threeYears: 65,
      multipleIncludingThreeYears: 66,
      masters: 67,
      regulatedTeerOneEntryToPractice: 67,
      doctorate: 69,
    } as const;
    for (const level of Object.keys(bands) as Array<keyof typeof bands>) {
      const c = rule('R36', { education: { origin: 'Canada', level } });
      expect(c.explanation).toContain(bands[level] + '–' + bands[level]);
      expect(c.status).toBe(bands[level] >= 67 ? 'MET' : 'NOT_MET');
    }
  });
  test('R36 only a distinct second official language counts; spouse language needs current test evidence', () => {
    const base = {
      education: {
        origin: 'Canada' as const,
        level: 'multipleIncludingThreeYears' as const,
      },
    };
    const duplicate = { ...language, levels: skills(7) };
    expect(rule('R36', { ...base, secondary: duplicate }).status).toBe(
      'NOT_MET',
    );
    expect(
      rule('R36', { ...base, secondary: { ...duplicate, test: 'TEF Canada' } })
        .status,
    ).toBe('MET');
    const adaptability = {
      ...complete.adaptability,
      spouseAccompanying: true,
      spouseStudy: false,
      spouseWork: false,
      spouseLanguage: { ...language, levels: skills(4) },
    };
    expect(rule('R36', { ...base, adaptability }).status).toBe('MET');
    expect(
      rule('R36', {
        ...base,
        adaptability: {
          ...adaptability,
          spouseLanguage: {
            ...adaptability.spouseLanguage,
            resultDate: '2024-11-23',
          },
        },
      }).status,
    ).toBe('NOT_MET');
  });
  test('A future invitation cannot establish an exemption or qualified past work under the physician policy', () => {
    const invitation = { date: '2026-12-01', program: 'CA-EE-FSW' as const };
    expect(
      rule('R29', { invitation, applicationDate: '2026-12-05' }).status,
    ).toBe('UNKNOWN');
    const offer: ExpressAnswers['offer'] = {
      exists: true,
      teer: 1,
      employers: 1,
      weeklyHours: 30,
      permanent: true,
      continuousPaidNonseasonal: true,
      eligibleEmployers: true,
      genuineAndAble: true,
      oldLmiaOrPermitRequirementsMet: false,
      policyExemptionConfirmed: true,
    };
    expect(rule('R37', { invitation, offer }).status).toBe('UNKNOWN');
    expect(
      rule(
        'R40',
        {
          invitation,
          workHistory: [
            {
              ...job,
              noc: '31101',
              selfEmployed: true,
              physicianException: true,
            },
          ],
        },
        'CA-EE-CEC',
      ).status,
    ).toBe('UNKNOWN');
    expect(
      rule('R33', { workHistory: [{ ...job, dailyHours: undefined }] }).status,
    ).toBe('UNKNOWN');
  });
});

describe('Published EE categories under the November instructions', () => {
  const round = {
    date: '2026-11-18',
    category: 'occupation' as const,
    occupationCategory: 'researchers' as const,
    roundSpecificRequirementsMet: true,
  };
  test('R32 Canadian research needs 12 months in one listed Canadian occupation', () => {
    const check = (
      categoryExperience: NonNullable<
        ExpressAnswers['round']
      >['categoryExperience'],
    ) =>
      rule('R32', {
        invitation: undefined,
        round: { ...round, categoryExperience },
      });
    expect(check([{ noc: '41200', canadianMonths: 12 }]).status).toBe('MET');
    expect(check([{ noc: '41201', canadianMonths: 12 }]).status).toBe(
      'NOT_MET',
    );
    expect(
      check([{ noc: '41200', months: 12, canadianMonths: 11 }]).status,
    ).toBe('NOT_MET');
    expect(check([{ noc: '41200', months: 12 }]).status).toBe('UNKNOWN');
    expect(
      rule('R32', {
        invitation: undefined,
        round: {
          ...round,
          occupationCategory: 'healthcare',
          categoryExperience: [
            { noc: '31100', months: 6 },
            { noc: '31101', months: 6 },
          ],
        },
      }).status,
    ).toBe('NOT_MET');
    expect(
      rule('R32', {
        invitation: undefined,
        round: {
          ...round,
          occupationCategory: 'healthcare',
          categoryExperience: [{ noc: '31100', months: 12, canadianMonths: 0 }],
        },
      }).status,
    ).toBe('MET');
  });
  test('R32 military applicants need 10 years service, a 3-year CAF offer and a 2-year credential', () => {
    const military = {
      servingInRecognizedForeignMilitary: true,
      continuousServiceYears: 10,
      trainedNoc: '40042',
      recruitingGroupOfferNoc: '42102',
      offerYears: 3,
      continuousFullTimeOfferInCanada: true,
      completedPostsecondaryYears: 2,
      canadianCredentialOrAssessedEquivalent: true,
    };
    const testMilitary = (m: typeof military) =>
      rule('R32', {
        invitation: undefined,
        round: { ...round, category: 'military', military: m },
      });
    expect(testMilitary(military).status).toBe('MET');
    for (const missing of [
      { continuousServiceYears: 9 },
      { offerYears: 2 },
      { completedPostsecondaryYears: 1 },
      { trainedNoc: '31101' },
    ])
      expect(testMilitary({ ...military, ...missing }).status).toBe('NOT_MET');
  });
  test('Moving simulation into the future cannot manufacture a published round or ITA', () => {
    const future = '2028-01-05';
    const express: ExpressAnswers = {
      ...complete,
      profileDate: '2027-12-01',
      applicationDate: future,
      invitation: { date: future, program: 'CA-EE-FSW' },
      round: {
        date: future,
        cutoff: 450,
        confirmedCrs: 550,
        category: 'general',
      },
    };
    const result = evaluateCanadaFull({
      simulationDate: future,
      express,
    }).columns[0].pathways.find((p) => p.id === 'CA-EE-FSW')!;
    for (const id of ['CA-R29', 'CA-R30', 'CA-R32'])
      expect(result.checks.find((c) => c.id === id)?.status).toBe('UNKNOWN');
  });
});

test('FSW s80 can use discontinuous experience in different NOCs, with overlapping full-time jobs capped once', () => {
  const first = { ...job, from: '2023-01-01', to: '2023-12-31' };
  const second = { ...job, from: '2025-01-01', to: '2025-12-31', noc: '21232' };
  const check = (workHistory: WorkPeriod[]) =>
    rule('R36', { fswSelectionWorkYears: undefined, workHistory });
  expect(check([first, second]).explanation).toContain('67–67');
  expect(check([first, { ...first, noc: '21232' }]).explanation).toContain(
    '65–65',
  );
  expect(
    check([first, { ...second, dutiesConfirmed: undefined }]).explanation,
  ).toContain('65–67');
});
