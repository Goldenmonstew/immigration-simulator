import { describe, expect, it } from 'vitest';
import { evaluateNewZealandFull } from '../src/new-zealand-full';
import type { NzSkilledAnswers } from '../src/new-zealand-skilled';

type Job = NonNullable<NzSkilledAnswers['job']>;
type Smc = NonNullable<NzSkilledAnswers['smc']>;
type Green = NonNullable<NzSkilledAnswers['green']>;
type Sector = NonNullable<NzSkilledAnswers['sector']>;
type Period = NonNullable<Sector['periods']>[number];

const job: Job = {
  occupationCode: '261313',
  genuineOfferInNZ: true,
  employerCompliant: true,
  accreditedAtApplication: true,
  guaranteedWeeklyHours: 30,
  contract: 'fixed',
  contractMonths: 12,
  hourlyPay: 105,
  occupationMatch: true,
};
const smc: Smc = {
  route: 'points',
  invitedRoute: 'points',
  invitedOn: '2026-09-01',
  invitationCurrent: true,
  eoiDisclosure: 'accurate',
  skillLevel: 'one',
  registration: 'not-required',
  anzscoQualificationOrSubstitution: true,
  sr330Registration: false,
  claim: 'income',
  pointsMonthsInLast24: 0,
  pointsMonthsInLast36: 0,
  pointsMonthsInLast48: 0,
};
const period: Period = {
  kind: 'care',
  monthsInWindow: 24,
  occupationCode: '423111',
  visa: 'work',
  accrualStarted: '2024-11-23',
  minimumHourlyPay: 28.25,
  guaranteedWeeklyHours: 30,
};
const sector: Sector = {
  category: 'care',
  currentVisa: 'work',
  periods: [period],
  distinctMonthsAndEarningsVerified: true,
  accrualStarted: '2024-11-23',
};
const green: Green = { tier: 'straight', rowRequirementsVerified: true };

function result(
  skilled: NzSkilledAnswers,
  birth = '1971-11-23',
  date = '2026-11-23',
  locale: 'en' | 'zh-CN' = 'en',
) {
  const r = evaluateNewZealandFull({
    simulationDate: date,
    dateOfBirth: birth,
    locale,
    skilled,
    common: {
      identityDocuments: true,
      requiredFeePaid: true,
      health: 'clear',
      character: 'clear',
      dependants: [],
      evidence: {
        medical: { issued: '2026-11-01', limited: false },
        xray: { issued: '2026-11-01' },
        policeCountriesComplete: true,
        police: [{ issued: '2026-11-01' }],
      },
      english: {
        method: 'test',
        test: 'ielts',
        score: 6.5,
        date: '2026-01-01',
        inPerson: true,
      },
    },
  });
  return r.columns.flatMap((c) => c.pathways);
}

function pathway(
  skilled: NzSkilledAnswers,
  id: string,
  birth?: string,
  date?: string,
) {
  return result(skilled, birth, date).find((p) => p.id === id)!;
}

function check(skilled: NzSkilledAnswers, id: string, date?: string) {
  return result(skilled, undefined, date)
    .flatMap((p) => p.checks)
    .find((c) => c.id === id)!;
}

function expectDecision(
  input: NzSkilledAnswers,
  pathId: string,
  checkId: string,
  expected: 'MET' | 'NOT_MET' | 'UNKNOWN',
) {
  const path = pathway(input, pathId);
  expect(path.checks.find((c) => c.id === checkId)?.status).toBe(expected);
  expect(path.status).toBe(expected);
  expect(path.earliestDate).toBe(expected === 'MET' ? '2026-11-23' : undefined);
}
const smcInput = (update: Partial<Smc> = {}, j: Partial<Job> = {}) => ({
  job: { ...job, ...j },
  smc: { ...smc, ...update },
  feeBand: 'A' as const,
});
const greenInput = (update: Partial<Green> = {}, j: Partial<Job> = {}) => ({
  job: { ...job, ...j },
  green: { ...green, ...update },
  feeBand: 'B' as const,
});
const sectorInput = (update: Partial<Sector> = {}, j: Partial<Job> = {}) => ({
  job: { ...job, occupationCode: '423111', hourlyPay: 28.25, ...j },
  sector: { ...sector, ...update },
  feeBand: 'C' as const,
});

describe('SMC, Green List and sector residence', () => {
  it('accepts three complete applications at age 55 and rejects at 56; advisory fees do not block them', () => {
    for (const [id, input, feeId] of [
      ['NZ-SMC', smcInput(), 'NZ-P4-FEE'],
      ['NZ-GREEN-LIST', greenInput(), 'NZ-P5-4'],
      ['NZ-SECTOR', sectorInput(), 'NZ-P6-3'],
    ] as const) {
      expect(pathway(input, id).status).toBe('MET');
      expect(pathway(input, id, '1970-11-23').status).toBe('NOT_MET');
      expect(check(input, feeId)).toMatchObject({
        status: 'UNKNOWN',
        pendingDetails: ['PD-225'],
      });
      expect(check(input, feeId).explanation).toContain(
        input.feeBand === 'B' ? '6,160' : '6,450',
      );
      const translated = result(input, undefined, undefined, 'zh-CN').find(
        (p) => p.id === id,
      )!;
      expect(translated.checks.map((c) => c.id)).toEqual(
        pathway(input, id).checks.map((c) => c.id),
      );
      expect(translated.title).not.toBe(pathway(input, id).title);
    }
  });
  it('keeps absent route and job evidence unknown and uses the pre-reform instructions for earlier invitations', () => {
    for (const id of ['NZ-SMC', 'NZ-GREEN-LIST', 'NZ-SECTOR'])
      expect(pathway({}, id).status).toBe('UNKNOWN');
    expect(
      pathway(smcInput({ invitedOn: '2026-08-23' }), 'NZ-SMC').status,
    ).toBe('UNKNOWN');
    expect(
      check(smcInput({ eoiDisclosure: 'under-review' }), 'NZ-P4-1').status,
    ).toBe('UNKNOWN');
    expect(check(smcInput({ invitedRoute: 'none' }), 'NZ-P4-1').status).toBe(
      'NOT_MET',
    );
    expect(
      check(smcInput({ invitedOn: '2026-08-24' }), 'NZ-P4-1', '2026-12-24')
        .status,
    ).toBe('MET');
    expect(
      check(smcInput({ invitedOn: '2026-08-24' }), 'NZ-P4-1', '2026-12-25')
        .status,
    ).toBe('NOT_MET');
    expect(check(smcInput({ invitedRoute: 'trades' }), 'NZ-P4-1').status).toBe(
      'NOT_MET',
    );
  });
  it('checks the job and statutory registration separately from the pay and skill claim', () => {
    expect(check(smcInput({}, { contractMonths: 11 }), 'NZ-P4-2').status).toBe(
      'NOT_MET',
    );
    expect(
      check(smcInput({}, { guaranteedWeeklyHours: 29 }), 'NZ-P4-2').status,
    ).toBe('NOT_MET');
    expect(
      check(smcInput({ registration: 'required-missing' }), 'NZ-P4-2').status,
    ).toBe('NOT_MET');
    expect(
      check(smcInput({}, { occupationMatch: undefined }), 'NZ-P4-2').status,
    ).toBe('UNKNOWN');
    expect(
      check(
        smcInput(
          { contractorNZSkilledMonths: 12, contractRecordSustainable: true },
          { contract: 'services', contractMonths: 6 },
        ),
        'NZ-P4-2',
      ).status,
    ).toBe('MET');
    expect(
      check(
        smcInput(
          { contractorNZSkilledMonths: 11, contractRecordSustainable: true },
          { contract: 'services', contractMonths: 6 },
        ),
        'NZ-P4-2',
      ).status,
    ).toBe('NOT_MET');
  });
  it('checks six-point income, experience supplements and salary at the contractual maximum hours', () => {
    expect(check(smcInput({}, { hourlyPay: 104.99 }), 'NZ-P4-3').status).toBe(
      'NOT_MET',
    );
    expect(
      check(
        smcInput(
          {},
          { hourlyPay: undefined, annualPay: 218400, maximumWeeklyHours: 40 },
        ),
        'NZ-P4-3',
      ).status,
    ).toBe('MET');
    expect(
      check(
        smcInput(
          {},
          { hourlyPay: undefined, annualPay: 218400, maximumWeeklyHours: 41 },
        ),
        'NZ-P4-3',
      ).status,
    ).toBe('NOT_MET');
    const fourPoints: Partial<Smc> = {
      accrualStarted: '2024-11-23',
      pointsMonthsInLast36: 18,
      minimumAdditionalHourlyPay: 63.22,
      workEvidenceVerified: true,
    };
    expect(
      check(smcInput(fourPoints, { hourlyPay: 63.22 }), 'NZ-P4-3').status,
    ).toBe('MET');
    expect(
      check(
        smcInput(
          { ...fourPoints, pointsMonthsInLast36: 17 },
          { hourlyPay: 63.22 },
        ),
        'NZ-P4-3',
      ).status,
    ).toBe('NOT_MET');
    expect(
      check(
        smcInput(
          { ...fourPoints, pointsMonthsInLast36: 18 },
          { hourlyPay: 63.21 },
        ),
        'NZ-P4-3',
      ).status,
    ).toBe('NOT_MET');
  });
  it('scores qualifications and only documented registration and eligible post-registration work', () => {
    const q: Partial<Smc> = {
      claim: 'qualification',
      qualification: 'nz-masters',
      holdsBachelor: true,
      qualificationRecognised: true,
      nzMastersFullTimeWeeks: 30,
    };
    expect(check(smcInput(q), 'NZ-P4-3').status).toBe('MET');
    expect(
      check(smcInput({ ...q, nzMastersFullTimeWeeks: 29 }), 'NZ-P4-3').status,
    ).toBe('NOT_MET');
    expect(
      check(smcInput({ ...q, qualificationRecognised: undefined }), 'NZ-P4-3')
        .status,
    ).toBe('UNKNOWN');
    expectDecision(
      smcInput({ ...q, qualificationRecognised: false }),
      'NZ-SMC',
      'NZ-P4-3',
      'NOT_MET',
    );
    const r: Partial<Smc> = {
      claim: 'registration',
      sr330Registration: true,
      registrationPoints: 3,
      accrualStarted: '2024-11-23',
      pointsMonthsInLast48: 24,
      workEvidenceVerified: true,
    };
    expect(check(smcInput(r), 'NZ-P4-3').status).toBe('MET');
    expect(
      check(smcInput({ ...r, pointsMonthsInLast48: 23 }), 'NZ-P4-3').status,
    ).toBe('NOT_MET');
  });
  const experience: Partial<Smc> = {
    route: 'experience',
    invitedRoute: 'experience',
    accrualStarted: '2024-11-23',
    workEvidenceVerified: true,
    directMonthsInLast10Years: 36,
    additionalNzMonthsInWindow: 24,
    minimumAdditionalHourlyPay: 40,
  };
  it('applies the published ordinary and amber rates, NZ-only amber experience and the red exclusion', () => {
    expect(
      check(smcInput(experience, { hourlyPay: 34.77 }), 'NZ-P4-4').status,
    ).toBe('MET');
    expect(
      check(smcInput(experience, { hourlyPay: 34.76 }), 'NZ-P4-4').status,
    ).toBe('NOT_MET');
    expect(
      check(
        smcInput(
          { ...experience, directNzMonthsInLast10Years: 36 },
          { occupationCode: '351311', hourlyPay: 37.93 },
        ),
        'NZ-P4-4',
      ).status,
    ).toBe('MET');
    expect(
      check(
        smcInput(
          { ...experience, directNzMonthsInLast10Years: 35 },
          { occupationCode: '351311', hourlyPay: 37.93 },
        ),
        'NZ-P4-4',
      ).status,
    ).toBe('NOT_MET');
    expect(
      check(smcInput(experience, { occupationCode: '391111' }), 'NZ-P4-4')
        .status,
    ).toBe('NOT_MET');
  });
  it('requires 120 non-RPL credits, a listed trade and separate post-qualification months', () => {
    const trades: Partial<Smc> = {
      ...experience,
      route: 'trades',
      invitedRoute: 'trades',
      tradeQualificationOrigin: 'nz',
      tradeQualificationLevel: 4,
      nzCreditsExcludingRpl: 120,
      tradeQualificationRelevant: true,
      directMonthsInLast10Years: 30,
      additionalNzMonthsInWindow: 18,
    };
    const j = { occupationCode: '321212', hourlyPay: 31.61 };
    expect(check(smcInput(trades, j), 'NZ-P4-5').status).toBe('MET');
    for (const fail of [
      { nzCreditsExcludingRpl: 119 },
      { tradeQualificationLevel: 3 },
      { additionalNzMonthsInWindow: 17 },
      { directMonthsInLast10Years: 29 },
    ])
      expect(check(smcInput({ ...trades, ...fail }, j), 'NZ-P4-5').status).toBe(
        'NOT_MET',
      );
    expect(
      check(
        smcInput({ ...trades, tradeQualificationOrigin: 'overseas' }, j),
        'NZ-P4-5',
      ).status,
    ).toBe('UNKNOWN');
  });
  it.each([
    [false, 'NOT_MET'],
    [undefined, 'UNKNOWN'],
    [true, 'MET'],
  ] as const)(
    'checks overseas trade IQA %s on the application date',
    (iqa, status) => {
      const input = smcInput(
        {
          ...experience,
          route: 'trades',
          invitedRoute: 'trades',
          tradeQualificationOrigin: 'overseas',
          tradeQualificationRelevant: true,
          tradeQualificationLevel: 4,
          overseasTradeIqa: iqa,
          directMonthsInLast10Years: 30,
          additionalNzMonthsInWindow: 18,
        },
        { occupationCode: '321211' },
      );
      expectDecision(input, 'NZ-SMC', 'NZ-P4-5', status);
    },
  );
  it('uses the actual Appendix 13 pay for the current Tier 1 occupation and its service contract', () => {
    expect(check(greenInput({}, { hourlyPay: 72.8 }), 'NZ-P5-2').status).toBe(
      'MET',
    );
    expect(check(greenInput({}, { hourlyPay: 72.79 }), 'NZ-P5-2').status).toBe(
      'NOT_MET',
    );
    for (const [verified, status] of [
      [undefined, 'UNKNOWN'],
      [false, 'NOT_MET'],
    ] as const)
      expectDecision(
        greenInput({ rowRequirementsVerified: verified }),
        'NZ-GREEN-LIST',
        'NZ-P5-2',
        status,
      );
    const j: Partial<Job> = {
      contract: 'services',
      contractMonths: 6,
      hourlyPay: 109.2,
    };
    expect(
      check(greenInput({ contractorRelevantYears: 10 }, j), 'NZ-P5-2').status,
    ).toBe('MET');
    expect(
      check(greenInput({ contractorRelevantYears: 9 }, j), 'NZ-P5-2').status,
    ).toBe('NOT_MET');
  });
  it('combines eligible Tier 2 and high-pay months but excludes ordinary care months and WI21 experience', () => {
    const g: Partial<Green> = {
      tier: 'work',
      accrualStarted: '2024-11-23',
      currentVisa: 'work',
      distinctMonthsAndEarningsVerified: true,
    };
    const j = { occupationCode: '712111', hourlyPay: 41.09 };
    const tier2: Period = {
      ...period,
      kind: 'tier2',
      monthsInWindow: 18,
      occupationCode: '712111',
      minimumHourlyPay: 41.09,
      occupationRequirementsVerified: true,
    };
    const high: Period = {
      ...period,
      kind: 'high-pay',
      monthsInWindow: 6,
      minimumHourlyPay: 63.22,
    };
    const input = (extra: Period, changes?: Partial<Green>) =>
      greenInput({ ...g, periods: [tier2, extra], ...changes }, j);
    expect(pathway(input(high), 'NZ-GREEN-LIST').status).toBe('MET');
    expect(check(input({ ...high, kind: 'care' }), 'NZ-P5-3').status).toBe(
      'NOT_MET',
    );
    expect(check(input({ ...high, visa: 'WI21' }), 'NZ-P5-3').status).toBe(
      'NOT_MET',
    );
    expect(
      check(input({ ...high, minimumHourlyPay: 63.21 }), 'NZ-P5-3').status,
    ).toBe('NOT_MET');
    expect(check(input(high, { currentVisa: 'other' }), 'NZ-P5-1').status).toBe(
      'NOT_MET',
    );
    expect(
      check(greenInput(g, { ...j, hourlyPay: 41.08 }), 'NZ-P5-3-JOB').status,
    ).toBe('NOT_MET');
  });
  it.each([
    ['tier2', '241111', 'NZ-GREEN-LIST', 'NZ-P5-3'],
    ['care', '423313', 'NZ-SECTOR', 'NZ-P6-WORK'],
    ['transport', '899211', 'NZ-SECTOR', 'NZ-P6-WORK'],
  ] as const)(
    'requires qualifying %s work before counting supplementary months',
    (kind, code, pathId, checkId) => {
      const highPay: Period = {
        ...period,
        occupationCode: '261313',
        kind: 'high-pay',
        minimumHourlyPay: 70,
        guaranteedWeeklyHours: 40,
      };
      const native: Period = {
        ...highPay,
        kind,
        occupationCode: code,
        occupationRequirementsVerified: true,
        monthsInWindow: 6,
        accrualStarted: '2026-05-23',
      };
      const input = (periods: Period[], verified: boolean | undefined) => {
        const work = {
          accrualStarted: periods[0]?.accrualStarted,
          currentVisa: 'work' as const,
          periods,
          distinctMonthsAndEarningsVerified: verified,
        };
        const offer = {
          occupationCode: code,
          hourlyPay: 70,
          guaranteedWeeklyHours: 40,
        };
        return kind === 'tier2'
          ? greenInput({ ...work, tier: 'work' }, offer)
          : sectorInput(
              { ...work, category: kind, maritimeCertificateHeld: true },
              offer,
            );
      };
      expectDecision(input([highPay], true), pathId, checkId, 'NOT_MET');
      const balance = { ...highPay, monthsInWindow: 18 };
      const mixed = [balance, native];
      expectDecision(input(mixed, true), pathId, checkId, 'MET');
      expectDecision(input(mixed, false), pathId, checkId, 'NOT_MET');
      expectDecision(input(mixed, undefined), pathId, checkId, 'UNKNOWN');
      // The extra high-pay months cannot resolve an unverified or ineligible sector period.
      const prior24 = { ...highPay, accrualStarted: '2024-05-23' };
      for (const [visa, status] of [
        [undefined, 'UNKNOWN'],
        ['WI21', 'NOT_MET'],
      ] as const)
        expectDecision(
          input([prior24, { ...native, visa }], true),
          pathId,
          checkId,
          status,
        );
      expectDecision(
        input([highPay, { ...native, monthsInWindow: 0 }], true),
        pathId,
        checkId,
        'NOT_MET',
      );
    },
  );
  it('honours the five-calendar-month wage lock and the separate fixed care wage and employment list', () => {
    const input = (grant: string) =>
      greenInput(
        { tier: 'work', accrualStarted: '2026-03-10', visaGranted: grant },
        { occupationCode: '721216', hourlyPay: 38.59 },
      );
    expect(check(input('2025-10-10'), 'NZ-P5-3-JOB').status).toBe('MET');
    expect(check(input('2025-10-09'), 'NZ-P5-3-JOB').status).toBe('NOT_MET');
    expect(
      check(sectorInput({}, { occupationCode: '431411' }), 'NZ-P6-1').status,
    ).toBe('NOT_MET');
    expect(check(sectorInput({}, { hourlyPay: 28.24 }), 'NZ-P6-1').status).toBe(
      'NOT_MET',
    );
    expect(
      check(sectorInput({}, { sleepHoursExcluded: true }), 'NZ-P6-1').status,
    ).toBe('UNKNOWN');
    expectDecision(
      sectorInput(
        {},
        { sleepHoursExcluded: true, sleepExclusionVerified: false },
      ),
      'NZ-SECTOR',
      'NZ-P6-1',
      'NOT_MET',
    );
    expect(
      check(
        sectorInput({ periods: [{ ...period, visa: 'other-interim-work' }] }),
        'NZ-P6-WORK',
      ).status,
    ).toBe('MET');
    expect(
      check(
        sectorInput({ periods: [{ ...period, monthsInWindow: 23 }] }),
        'NZ-P6-WORK',
      ).status,
    ).toBe('NOT_MET');
    expect(
      check(sectorInput({ currentVisa: 'other-interim-work' }), 'NZ-P6-VISA')
        .status,
    ).toBe('NOT_MET');
  });
  it.each([
    ['tier2', 'NZ-GREEN-LIST', 'NZ-P5-3-JOB', 'NZ-P5-3'],
    ['care', 'NZ-SECTOR', 'NZ-P6-1', 'NZ-P6-WORK'],
  ] as const)(
    'checks the occupation code against a retained %s role',
    (kind, pathId, jobId, workId) => {
      const work = {
        ...sector,
        maintainedRemovedOccupation: true,
        archivedHourlyFloor: 28.25,
        periods: [
          {
            ...period,
            kind,
            occupationCode: undefined,
            occupationRequirementsVerified: true,
            maintainedRemovedOccupation: true,
            archivedHourlyFloor: 28.25,
          },
        ],
      };
      const offer = { occupationCode: undefined };
      const input =
        kind === 'tier2'
          ? greenInput({ ...work, tier: 'work' }, offer)
          : sectorInput(work, offer);
      expectDecision(input, pathId, jobId, 'UNKNOWN');
      expectDecision(input, pathId, workId, 'UNKNOWN');
    },
  );
  it('requires maritime credentials at application and protects qualifying road occupations', () => {
    const p: Period = {
      ...period,
      kind: 'transport',
      occupationCode: '899211',
      minimumHourlyPay: 31.61,
    };
    const sea = (held: boolean) =>
      sectorInput(
        { category: 'transport', periods: [p], maritimeCertificateHeld: held },
        { occupationCode: '899211', hourlyPay: 31.61 },
      );
    expect(pathway(sea(true), 'NZ-SECTOR').status).toBe('MET');
    expect(check(sea(false), 'NZ-P6-2').status).toBe('NOT_MET');
    expect(check(sea(false), 'NZ-P6-WORK').status).toBe('MET');
    const bus = (
      applicationDate: string,
      history: Sector['transport'] = {},
    ) => {
      const t = {
        aewvAppliedOn: applicationDate,
        busOperatorEligible: true,
        qualifyingBeforeRemoval: false,
        offerOn: '2025-01-01',
        ...history,
      };
      return sectorInput(
        {
          category: 'transport',
          periods: [
            {
              ...p,
              occupationCode: '731211',
              minimumHourlyPay: 28,
              transport: t,
            },
          ],
          transport: t,
        },
        { occupationCode: '731211', hourlyPay: 28 },
      );
    };
    expect(pathway(bus('2024-04-06'), 'NZ-SECTOR').status).toBe('MET');
    expect(check(bus('2024-04-07'), 'NZ-P6-2').status).toBe('NOT_MET');
    const missingGrant = bus('2024-04-07', {
      offerOn: '2024-04-06',
      employmentSignedOn: '2024-04-06',
      startedOn: '2024-04-10',
    });
    expectDecision(missingGrant, 'NZ-SECTOR', 'NZ-P6-2', 'UNKNOWN');
    expectDecision(missingGrant, 'NZ-SECTOR', 'NZ-P6-WORK', 'UNKNOWN');
  });
});
