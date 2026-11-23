import { describe, expect, it } from 'vitest';
import { evaluateNewZealandFull } from '../src/new-zealand-full';
import type { NzFamilyAnswers } from '../src/new-zealand-family';

type Request = Parameters<typeof evaluateNewZealandFull>[0];
const common: Request['common'] = {
  identityDocuments: true,
  health: 'clear',
  character: 'clear',
  familyOmission: false,
  evidence: {
    medical: { issued: '2026-11-01' },
    xray: { issued: '2026-11-01' },
    policeCountriesComplete: true,
    police: [{ issued: '2026-11-01' }],
  },
  dependants: [],
};
function run(id: string, family: NzFamilyAnswers, r: Partial<Request> = {}) {
  const result = evaluateNewZealandFull({
    simulationDate: '2026-11-23',
    dateOfBirth: '1971-11-23',
    common,
    family,
    ...r,
  });
  return result.columns[0].pathways.find((p) => p.id === id)!;
}
function check(id: string, family: NzFamilyAnswers, r: Partial<Request> = {}) {
  return run(id.split('-').slice(0, 2).join('-'), family, r).checks.find(
    (c) => c.id === id,
  )!;
}
const partner: NonNullable<NzFamilyAnswers['partner']> = {
  partnerAge: 30,
  monthsTogetherAfterBothAdult: 12,
  metInPerson: true,
  eligibleRelationshipFormAndKinship: true,
  genuineStableEvidence: 'accepted',
  separation: 'none',
  earlierNonDeclaration: 'none',
  sponsorStatus: 'resident',
  previousSuccessfulApplications: 1,
  lastSuccessfulApplication: '2021-11-23',
  sponsorFreeOfDeportationLiabilityAndS4Bar: true,
  sponsorCharacter: 'accepted',
  sponsorPoliceEvidence: true,
};
const sponsor = {
  age: 30,
  notDependentChild: true,
  currentUnconditionalCitizenOrResident: true,
  yearsAsCitizenOrResident: 3,
  normallyResidentInNz: true,
  nzDaysInEachPriorYear: [184, 184, 184],
  meetsOtherR4Conditions: true,
  acceptsSupportUndertaking: true,
};
const parent: NonNullable<NzFamilyAnswers['parent']> = {
  relationship: 'parent',
  children: [],
  eoi: 'invited',
  invitationDate: '2026-11-02',
  selectionDate: '2026-11-01',
  scheme: 'child',
  sponsors: [sponsor],
  parentsSponsored: 1,
  incomePeriods: [
    { from: '2024-05-01', irdIncomePerSponsor: [104707.2] },
    { from: '2025-05-01', irdIncomePerSponsor: [109200] },
  ],
  applicantEnglish: { method: 'esol-paid' },
  includesPartner: false,
  parentBoost: 'never-held',
};
const investor: NonNullable<
  NonNullable<NzFamilyAnswers['investment']>['active']
> = {
  category: 'growth',
  nominatedFunds: 5000000,
  totalInvested: 5000000,
  qualifyingInvestments: 'accepted',
  qualifyingPhilanthropy: 1000000,
  cleanFundsAndTransfer: 'accepted',
  fitAndProper: 'accepted',
  approvalInPrinciple: '2026-01-05',
  allInvestmentsCompleted: '2026-07-05',
  extensionGranted: false,
  transferEvidenceFiled: '2026-10-05',
  currentContactDetailsProvided: true,
};
const business: NonNullable<
  NonNullable<NzFamilyAnswers['investment']>['business']
> = {
  stage: 'work',
  workApplicationEvidenceComplete: true,
  workApplicationAge: 55,
  workApplicationDate: '2026-11-23',
  principalEnglish: {
    method: 'test',
    type: 'ielts',
    overall: 5,
    date: '2024-11-23',
    atTestCentre: true,
  },
  cleanBankruptcyYears: 5,
  fitAndProper: 'accepted',
  reserveFunds: 500000,
  experience: [
    {
      role: 'owner',
      years: 6,
      weeklyHours: 15,
      fullTimeEmployees: 0,
      revenue: 1000000,
    },
  ],
  targetAndDueDiligence: 'accepted',
  capitalAndOperatingPlan: true,
  holdsBusinessInvestorWorkVisa: true,
  acquisitionExcludingRealEstate: 2000000,
  activeOwnershipMonths: 12,
  annualNzDays: [184],
  retainedOwnershipAndSameApprovedBusiness: true,
  solventRegisteredAndCompliant: 'accepted',
  currentFte: 5,
  additionalNzFte: 1,
  additionalJobMonths: 12,
};
const religious: NonNullable<NzFamilyAnswers['religious']> = {
  inNz: true,
  compliantVisaYears: 3,
  qualifyingTrainingOrWorkYears: 5,
  eligibleSponsorAndLongTermNeed: 'accepted',
  sponsorshipUndertaking: true,
  qualifyingReligiousDutiesAndOffer: true,
  offerYears: 5,
  welfareSinceWorkVisa: 'none',
  principalEnglish: {
    method: 'test',
    type: 'ielts',
    overall: 5,
    date: '2024-11-23',
    atTestCentre: true,
  },
};

describe('F2 partnership', () => {
  it('keeps ordinary residence open when only direct PRV fails', () => {
    const p = run('NZ-P7', { partner });
    expect(p.status).toBe('MET');
    expect(p.checks.find((c) => c.id === 'NZ-P7-4')?.status).toBe('NOT_MET');
    expect(p.checks.find((c) => c.id === 'NZ-P7-FEE')).toMatchObject({
      status: 'UNKNOWN',
      pendingDetails: ['PD-225'],
    });
    expect(
      run('NZ-P7', { partner: { ...partner, goal: 'direct-prv' } }).status,
    ).toBe('NOT_MET');
  });
  it.each([
    [{ monthsTogetherAfterBothAdult: 11 }, 'NZ-P7-1', 'NOT_MET'],
    [{ partnerAge: 17 }, 'NZ-P7-1', 'NOT_MET'],
    [{ partnerAge: 18 }, 'NZ-P7-1', 'NOT_MET'],
    [{ separation: 'pending' }, 'NZ-P7-1', 'UNKNOWN'],
    [{ earlierNonDeclaration: 'barred-eoi' }, 'NZ-P7-1', 'NOT_MET'],
    [{ previousSuccessfulApplications: 2 }, 'NZ-P7-2', 'NOT_MET'],
    [{ lastSuccessfulApplication: '2021-11-24' }, 'NZ-P7-2', 'NOT_MET'],
    [
      {
        sponsorStatus: 'australian-basis',
        sponsorPrimarilyResidentInNz: false,
      },
      'NZ-P7-2',
      'NOT_MET',
    ],
    [{ sponsorCharacter: 'pending' }, 'NZ-P7-2', 'UNKNOWN'],
  ] as const)('%j changes %s to %s', (changes, id, status) => {
    expect(check(id, { partner: { ...partner, ...changes } }).status).toBe(
      status,
    );
  });
  it('applies prior secondary English only if omitted from a category that required it', () => {
    const request = { common: { ...common, familyOmission: true } };
    expect(
      check(
        'NZ-P7-3',
        { partner: { earlierCategoryRequiredEnglish: false } },
        request,
      ).status,
    ).toBe('MET');
    expect(
      check(
        'NZ-P7-3',
        { partner: { earlierCategoryRequiredEnglish: true } },
        request,
      ).status,
    ).toBe('UNKNOWN');
    expect(
      check(
        'NZ-P7-3',
        {
          partner: {
            earlierCategoryRequiredEnglish: true,
            earlierCategoryEnglish: 'declined',
          },
        },
        request,
      ).status,
    ).toBe('NOT_MET');
  });
  it('checks all five strictly sub-three-month intervals and the onshore return window', () => {
    const direct = {
      ...partner,
      goal: 'direct-prv' as const,
      sponsorStatus: 'citizen' as const,
      monthsTogetherAfterBothAdult: 60,
      citizenOffshore: false,
      citizenLastReturn: '2026-08-23',
      citizenNzMonthsPerYear: [2, 2, 2, 2, 2],
    };
    expect(run('NZ-P7', { partner: direct }).status).toBe('MET');
    expect(
      check('NZ-P7-4', {
        partner: { ...direct, citizenNzMonthsPerYear: [2, 2, 3, 2, 2] },
      }).status,
    ).toBe('NOT_MET');
    expect(
      check('NZ-P7-4', {
        partner: { ...direct, citizenLastReturn: '2026-08-22' },
      }).status,
    ).toBe('NOT_MET');
  });
});

describe('F4 Parent residence', () => {
  it('checks one sponsor at 1.5 times each period-end median', () => {
    const p = run('NZ-P8', { parent });
    expect(p.status).toBe('MET');
    expect(
      check('NZ-P8-5', {
        parent: {
          ...parent,
          eoiChannel: 'online',
          includesPartner: true,
          partnerEnglish: { method: 'esol-paid' },
        },
      }).explanation,
    ).toContain('9280');
    expect(check('NZ-P8-5', { parent })).toMatchObject({
      status: 'UNKNOWN',
      pendingDetails: ['PD-225'],
    });
    expect(
      check('NZ-P8-2-INCOME', {
        parent: {
          ...parent,
          incomePeriods: [
            parent.incomePeriods![0],
            { from: '2025-05-01', irdIncomePerSponsor: [109199.99] },
          ],
        },
      }).status,
    ).toBe('NOT_MET');
  });
  it('rejects duplicate periods and tests the 2026-04-29 / 04-30 changeover', () => {
    const old = { from: '2025-04-30', irdIncomePerSponsor: [104707.2] };
    const earlier = { from: '2024-04-30', irdIncomePerSponsor: [104707.2] };
    expect(
      check('NZ-P8-2-INCOME', {
        parent: { ...parent, incomePeriods: [old, earlier] },
      }).status,
    ).toBe('MET');
    expect(
      check('NZ-P8-2-INCOME', {
        parent: { ...parent, incomePeriods: [old, old] },
      }).status,
    ).toBe('NOT_MET');
    expect(
      check('NZ-P8-2-INCOME', {
        parent: {
          ...parent,
          incomePeriods: [earlier, { ...old, from: '2025-05-01' }],
        },
      }).status,
    ).toBe('NOT_MET');
  });
  it('combines two IRD records for the same periods including parents already sponsored', () => {
    // Two sponsors, six parents = 4.5 x $69,804.80, then 4.5 x $72,800.
    const p = {
      ...parent,
      scheme: 'two-children' as const,
      sponsors: [sponsor, sponsor],
      parentsSponsored: 6,
      incomePeriods: [
        { from: '2024-05-01', irdIncomePerSponsor: [200000, 114121.6] },
        { from: '2025-05-01', irdIncomePerSponsor: [200000, 127600] },
      ],
    };
    expect(run('NZ-P8', { parent: p }).status).toBe('MET');
    expect(
      check('NZ-P8-2', { parent: { ...p, parentsSponsored: 7 } }).status,
    ).toBe('NOT_MET');
    expect(
      check('NZ-P8-2', {
        parent: {
          ...p,
          sponsors: [
            sponsor,
            { ...sponsor, nzDaysInEachPriorYear: [184, 184, 183] },
          ],
        },
      }).status,
    ).toBe('NOT_MET');
  });
  it('distinguishes dependence at 17, 20, 24 and 25', () => {
    const children = (age: number, hasOwnChildren: boolean) => [
      { age, hasOwnChildren, single: true, financiallyDependent: true },
    ];
    for (const [age, own, expected] of [
      [17, true, 'NOT_MET'],
      [20, true, 'MET'],
      [24, false, 'NOT_MET'],
      [25, false, 'MET'],
    ] as const)
      expect(
        check('NZ-P8-1', {
          parent: { ...parent, children: children(age, own) },
        }).status,
      ).toBe(expected);
  });
  it('handles the invitation deadline, selection, insurance and each parent’s English', () => {
    expect(
      check('NZ-P8-1-ITA', { parent: { ...parent, eoi: 'not-filed' } }).status,
    ).toBe('NOT_MET');
    expect(
      check('NZ-P8-1-ITA', { parent: { ...parent, eoi: 'in-pool' } }).status,
    ).toBe('UNKNOWN');
    expect(
      check('NZ-P8-1-ITA', {
        parent: { ...parent, invitationDate: '2026-07-23' },
      }).status,
    ).toBe('MET');
    expect(
      check('NZ-P8-1-ITA', {
        parent: { ...parent, invitationDate: '2026-07-22' },
      }).status,
    ).toBe('NOT_MET');
    expect(
      check('NZ-P8-4', {
        parent: {
          ...parent,
          parentBoost: 'insurer-bank-error-promptly-restored',
          outstandingBoostCrownDebt: false,
        },
      }).status,
    ).toBe('MET');
    expect(
      check('NZ-P8-4', {
        parent: {
          ...parent,
          parentBoost: 'covered',
          outstandingBoostCrownDebt: true,
        },
      }).status,
    ).toBe('NOT_MET');
    expect(
      check('NZ-P8-3', {
        parent: {
          ...parent,
          includesPartner: true,
          partnerEnglish: { method: 'none' },
        },
      }).status,
    ).toBe('NOT_MET');
    const e = {
      method: 'test' as const,
      type: 'ielts' as const,
      date: '2024-11-23',
      atTestCentre: true,
      overall: 3,
    };
    expect(
      check('NZ-P8-3', {
        parent: { ...parent, applicantEnglish: { ...e, skills: [4, 4, 2, 2] } },
      }).status,
    ).toBe('MET');
    expect(
      check('NZ-P8-3', {
        parent: {
          ...parent,
          applicantEnglish: { ...e, skills: [4, 3.5, 2, 2] },
        },
      }).status,
    ).toBe('NOT_MET');
  });
});

describe('BN Active Investor Plus', () => {
  const f = (changes: Partial<typeof investor> = {}): NzFamilyAnswers => ({
    investment: { route: 'active', active: { ...investor, ...changes } },
  });
  it('grants residence before the post-grant checkpoints and keeps the fee pending', () => {
    expect(run('NZ-P9', f()).status).toBe('MET');
    expect(check('NZ-P9-HOME', f())).toMatchObject({
      status: 'UNKNOWN',
      pendingDetails: ['PD-233'],
    });
    expect(check('NZ-P9-4', f())).toMatchObject({
      status: 'UNKNOWN',
      pendingDetails: ['PD-225'],
    });
    expect(check('NZ-P9-1', f({ totalInvested: 4999999 })).status).toBe(
      'NOT_MET',
    );
    expect(
      check('NZ-P9-1', f({ qualifyingPhilanthropy: 1000001 })).status,
    ).toBe('NOT_MET');
    expect(
      check('NZ-P9-1-FUNDS', f({ cleanFundsAndTransfer: 'pending' })).status,
    ).toBe('UNKNOWN');
    expect(
      check('NZ-P9-1-TRANSFER', f({ allInvestmentsCompleted: '2026-07-06' }))
        .status,
    ).toBe('NOT_MET');
    expect(
      check('NZ-P9-1-TRANSFER', f({ transferEvidenceFiled: '2026-10-06' }))
        .status,
    ).toBe('NOT_MET');
    expect(
      check(
        'NZ-P9-1-TRANSFER',
        f({ allInvestmentsCompleted: '2026-07-06', extensionGranted: true }),
      ).status,
    ).toBe('MET');
  });
  it.each([
    [10000000, 0, 105],
    [11000000, 1000000, 91],
    [12000000, 2000000, 77],
    [14000000, 4000000, 63],
  ])(
    'uses qualifying Balanced investment %i plus %i for %i days',
    (total, extra, days) => {
      const r = { simulationDate: '2031-01-05' };
      // Bought before approval: the 60-month clock starts on 2026-01-05.
      const a: Partial<typeof investor> = {
        goal: 'investment-conditions',
        category: 'balanced',
        totalInvested: total,
        nominatedFunds: total,
        eligibleBalancedTopUp: extra,
        allInvestmentsCompleted: '2025-12-01',
        retainedHoldingsAndUpdatedAddress: true,
        interimEvidenceAndQuestionnaire: '2028-04-05',
        finalEvidenceAndQuestionnaire: '2031-01-05',
        residentDaysDuringInvestment: days,
      };
      expect(check('NZ-P9-2', f(a), r)).toMatchObject({
        status: 'MET',
        explanation: expect.stringContaining(String(days)),
      });
      expect(
        check('NZ-P9-2', f({ ...a, residentDaysDuringInvestment: days - 1 }), r)
          .status,
      ).toBe('NOT_MET');
      expect(
        check(
          'NZ-P9-2',
          f({ ...a, interimEvidenceAndQuestionnaire: '2028-04-06' }),
          r,
        ).status,
      ).toBe('NOT_MET');
    },
  );
  it('requires the Growth retention period and 21 days separately from initial grant', () => {
    const a: Partial<typeof investor> = {
      goal: 'investment-conditions',
      retainedHoldingsAndUpdatedAddress: true,
      interimEvidenceAndQuestionnaire: '2028-07-05',
      finalEvidenceAndQuestionnaire: '2029-07-05',
      residentDaysDuringInvestment: 21,
    };
    expect(
      check('NZ-P9-2', f(a), { simulationDate: '2029-07-05' }).status,
    ).toBe('MET');
    expect(
      check('NZ-P9-2', f({ ...a, residentDaysDuringInvestment: 20 }), {
        simulationDate: '2029-07-05',
      }).status,
    ).toBe('NOT_MET');
  });
});

describe('BD2 and BI stages', () => {
  const f = (changes: Partial<typeof business> = {}): NzFamilyAnswers => ({
    investment: { route: 'business', business: { ...business, ...changes } },
  });
  it('tests reserve capital, age, part-time conversion and paid management experience at the work stage', () => {
    expect(run('NZ-P9', f()).status).toBe('MET');
    expect(
      check(
        'NZ-P9-3-WORK-EVIDENCE',
        f({ workApplicationEvidenceComplete: false }),
      ).status,
    ).toBe('NOT_MET');
    for (const changes of [
      { reserveFunds: 499999 },
      { workApplicationAge: 56 },
      { experience: [{ ...business.experience![0], weeklyHours: 14.9 }] },
      {
        experience: [
          {
            role: 'senior-manager' as const,
            years: 3,
            weeklyHours: 30,
            fullTimeEmployees: 4,
            revenue: 5000000,
          },
        ],
      },
    ])
      expect(check('NZ-P9-3-WORK', f(changes)).status).toBe('NOT_MET');
    expect(
      check('NZ-P9-3-WORK', f({ targetAndDueDiligence: 'pending' })).status,
    ).toBe('UNKNOWN');
  });
  it('locks prior age at BD2 and tests standard versus fast-track ownership', () => {
    expect(
      run(
        'NZ-P9',
        f({
          stage: 'residence',
          workApplicationAge: undefined,
          principalEnglish: undefined,
        }),
        { dateOfBirth: '1965-04-01' },
      ).status,
    ).toBe('MET');
    expect(
      check('NZ-P9-3', f({ acquisitionExcludingRealEstate: 1999999 })).status,
    ).toBe('NOT_MET');
    expect(
      check(
        'NZ-P9-3',
        f({
          acquisitionExcludingRealEstate: 1000000,
          activeOwnershipMonths: 36,
        }),
      ).status,
    ).toBe('MET');
    expect(check('NZ-P9-3', f({ activeOwnershipMonths: 11 })).status).toBe(
      'NOT_MET',
    );
    expect(check('NZ-P9-3-OPERATIONS', f({ annualNzDays: [183] })).status).toBe(
      'NOT_MET',
    );
    expect(
      check('NZ-P9-3-OPERATIONS', f({ additionalJobMonths: 11 })).status,
    ).toBe('NOT_MET');
    expect(
      check('NZ-P9-3-ENGLISH', f(), {
        common: {
          ...common,
          dependants: [
            {
              dateOfBirth: '2010-11-23',
              english: { method: 'none' },
              esol: 'declined',
            },
          ],
        },
      }).status,
    ).toBe('NOT_MET');
  });
});

describe('RW7 religious workers', () => {
  it('accepts the exact term, age and experience with an advisory-only fee', () => {
    expect(run('NZ-P10', { religious }).status).toBe('MET');
    expect(check('NZ-P10-2', { religious }).pendingDetails).toEqual(['PD-225']);
  });
  it.each([
    [{ compliantVisaYears: 2.99 }, 'NZ-P10-1', 'NOT_MET'],
    [{ qualifyingTrainingOrWorkYears: 4.99 }, 'NZ-P10-1', 'NOT_MET'],
    [{ offerYears: 4.99 }, 'NZ-P10-1-SPONSOR', 'NOT_MET'],
    [
      { eligibleSponsorAndLongTermNeed: 'pending' },
      'NZ-P10-1-SPONSOR',
      'UNKNOWN',
    ],
    [
      { welfareSinceWorkVisa: 'claimed-or-granted' },
      'NZ-P10-1-WELFARE',
      'NOT_MET',
    ],
    [
      { welfareSinceWorkVisa: 'tax-credit-or-unclear' },
      'NZ-P10-1-WELFARE',
      'UNKNOWN',
    ],
    [
      { principalEnglish: { method: 'esol-paid' } },
      'NZ-P10-1-ENGLISH',
      'NOT_MET',
    ],
  ] as const)('%j changes %s to %s', (changes, id, status) => {
    expect(check(id, { religious: { ...religious, ...changes } }).status).toBe(
      status,
    );
  });
  it('distinguishes test validity and the family ESOL option', () => {
    expect(
      check('NZ-P10-1-ENGLISH', {
        religious: {
          ...religious,
          principalEnglish: {
            method: 'test',
            type: 'ielts',
            overall: 5,
            date: '2024-11-22',
            atTestCentre: true,
          },
        },
      }).status,
    ).toBe('NOT_MET');
    const paid = check(
      'NZ-P10-1-ENGLISH',
      { religious },
      {
        common: {
          ...common,
          dependants: [
            { dateOfBirth: '2011-11-23' },
            {
              dateOfBirth: '2010-11-23',
              english: {
                method: 'test',
                test: 'ielts',
                score: 3.5,
                date: '2026-11-01',
                inPerson: true,
              },
              esol: 'paid-and-signed',
            },
          ],
        },
      },
    );
    expect(paid.status).toBe('MET');
    expect(paid.explanation).toContain('NZ$5,110');
    expect(
      check(
        'NZ-P10-1-ENGLISH',
        { religious },
        { common: { ...common, dependants: [{ dateOfBirth: '2010-11-23' }] } },
      ).status,
    ).toBe('UNKNOWN');
  });
});
