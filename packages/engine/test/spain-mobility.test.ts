import { describe, expect, it } from 'vitest';
import type { EsFullRequest } from '../src/spain-full';
import { evaluateSpainFull } from '../src';
import type { EsMobilityFacts } from '../src/spain-mobility';

const request: EsFullRequest = {
  simulationDate: '2026-11-23',
  permits: [],
  trips: [],
  route: 'general',
};
type Holder = NonNullable<EsMobilityFacts['holder']>;
type Family = NonNullable<EsMobilityFacts['family']>;
const application = {
  thirdCountryNational: true,
  validPassportOrTravelDocument: true,
  signedEx11: true,
  competentOffice: true,
  beforeEntry: true,
  officeHolidays: [],
  fee: { paid: true, amount: 21.87, workingDaysAfterAdmission: 10 },
};
const holder: Holder = {
  ...application,
  statusDocument: true,
  noRefusalAlert: true,
  noReturnBar: true,
  securityDecision: 'cleared',
  nonWorking: {
    dependants: 1,
    monthlyNonWorkIncome: 3000,
    availableCapitalEur: 0,
    sourceAndAvailabilityDocumented: true,
    accommodationDocumented: true,
  },
  healthCover: {
    kind: 'public',
    validFrom: '2020-01-01',
    entitledOrAuthorized: true,
    equivalentCoverage: true,
    proof: true,
  },
};
const employment: NonNullable<Holder['employment']> = {
  birthDate: '1990-11-24',
  annualGrossSalary: 17094,
  signedContinuousContract: true,
  startsWhenPermitEffective: true,
  compliesWithCollectiveAgreement: true,
  qualifiedForOccupation: true,
  employer: {
    kind: 'individual',
    taxAndSocialSecurityCurrent: true,
    projectAndPayrollSupported: true,
    householdSize: 3,
    monthlyResourcesAfterGrossSalary: 1526.25,
  },
};
const family: Family = {
  ...application,
  priorFamilyUnitAndResidenceProved: true,
  noRefusalAlert: true,
  principalFiledOn: '2026-11-23',
  principalDecision: 'pending',
  relationship: {
    kind: 'spouse',
    soleGenuineUnseparatedSpouse: true,
    previousMarriagesResolved: true,
  },
  resources: {
    familySize: 2,
    eligibleMonthlyIncome: 900,
    stable: true,
    reduction: 'none',
    additionalAssetsUnderReview: false,
  },
  healthCover: holder.healthCover,
};
function run(
  kind: 'M' | 'F',
  m: EsMobilityFacts,
  changes: Partial<EsFullRequest> = {},
) {
  const [result] = evaluateSpainFull({
    ...request,
    ...changes,
    targets: [kind],
    mobility: {
      otherMemberStatus: 'eu-long-term',
      purpose: 'non-working',
      holder,
      family,
      ...m,
    },
  }).columns[0].pathways;
  return {
    result,
    get: (id: string) => result.checks.find((c) => c.id === id)?.status,
    row: (id: string) => result.checks.find((c) => c.id === id),
  };
}

describe('Spanish mobility from another EU Member State (arts. 179–181)', () => {
  it('keeps application eligibility, post-admission fees and subsequent grants distinct', () => {
    const { result, get } = run('M', {});
    expect(result.status).toBe('MET');
    expect(result.decidedBy).toEqual(['ES-M01', 'ES-M02', 'ES-M03', 'ES-M08']);
    for (const id of ['ES-M01', 'ES-M02', 'ES-M03', 'ES-M08', 'ES-M10'])
      expect(get(id)).toBe('MET');
    expect(get('ES-M09')).toBe('UNKNOWN');
    expect(get('ES-M11')).toBe('UNKNOWN');
    expect(
      run('M', { holder: { ...holder, spanishEuLongTermGranted: true } }).get(
        'ES-M11',
      ),
    ).toBe('MET');
    expect(
      run('M', { holder: { ...holder, spanishEuLongTermGranted: false } }).get(
        'ES-M11',
      ),
    ).toBe('NOT_MET');
    const missing = run('M', { purpose: undefined, holder: {} });
    expect(missing.result.status).toBe('UNKNOWN');
    expect(missing.get('ES-M01')).toBe('UNKNOWN');
  });
  it('requires EU status from another Member State and files before entry or within three calendar months', () => {
    expect(run('M', { otherMemberStatus: 'unconfirmed' }).get('ES-M01')).toBe(
      'UNKNOWN',
    );
    expect(run('M', { otherMemberStatus: 'national-only' }).result.status).toBe(
      'NOT_MET',
    );
    const dates = { enteredOn: '2026-08-23', beforeEntry: false };
    expect(run('M', { holder: { ...holder, ...dates } }).get('ES-M01')).toBe(
      'MET',
    );
    expect(
      run('M', {
        holder: { ...holder, ...dates, enteredOn: '2026-08-22' },
      }).get('ES-M01'),
    ).toBe('MET'); // 22 November is a Sunday.
    expect(
      run('M', {
        holder: { ...holder, ...dates, enteredOn: '2026-08-20' },
      }).get('ES-M01'),
    ).toBe('NOT_MET');
    expect(
      run('M', {
        holder: {
          ...holder,
          ...dates,
          enteredOn: '2026-08-20',
          officeHolidays: undefined,
        },
      }).get('ES-M01'),
    ).toBe('UNKNOWN');
    expect(
      run('M', {
        holder: {
          ...holder,
          ...dates,
          enteredOn: '2026-08-20',
          officeHolidays: ['2026-11-20'],
        },
      }).get('ES-M01'),
    ).toBe('MET');
    expect(
      run('M', {
        holder: { ...holder, validPassportOrTravelDocument: false },
      }).get('ES-M01'),
    ).toBe('NOT_MET');
  });
  it('compares proven non-working income or capital at EUR 2,400 plus EUR 600 per dependant', () => {
    const n = holder.nonWorking!;
    const check = (changes: Partial<typeof n>) =>
      run('M', { holder: { ...holder, nonWorking: { ...n, ...changes } } }).get(
        'ES-M02',
      );
    expect(check({ monthlyNonWorkIncome: 2999.99 })).toBe('NOT_MET');
    expect(check({ dependants: 0, monthlyNonWorkIncome: 2400 })).toBe('MET');
    // Three confirmed months for one applicant and one dependant: 3 × (2,400 + 600).
    expect(
      check({
        monthlyNonWorkIncome: 0,
        availableCapitalEur: 9000,
        confirmedCoverageMonths: 3,
      }),
    ).toBe('MET');
    expect(
      check({
        monthlyNonWorkIncome: 0,
        availableCapitalEur: 8999.99,
        confirmedCoverageMonths: 3,
      }),
    ).toBe('NOT_MET');
    expect(check({ monthlyNonWorkIncome: 0, availableCapitalEur: 9000 })).toBe(
      'UNKNOWN',
    );
    expect(check({ accommodationDocumented: undefined })).toBe('UNKNOWN');
    expect(run('M', {}, { simulationDate: '2027-01-01' }).get('ES-M02')).toBe(
      'UNKNOWN',
    );
    expect(
      run('M', { holder: { ...holder, healthCover: { kind: 'none' } } }).get(
        'ES-M03',
      ),
    ).toBe('NOT_MET');
  });
  it('distinguishes missing accommodation from an unconfirmed form of proof', () => {
    for (const [available, documented, status] of [
      [true, false, 'UNKNOWN'],
      [false, false, 'NOT_MET'],
      [true, true, 'MET'],
    ] as const) {
      const { row, result } = run('M', {
        holder: {
          ...holder,
          nonWorking: {
            ...holder.nonWorking,
            accommodationAvailable: available,
            accommodationDocumented: documented,
          },
        },
      });
      expect(row('ES-M02')?.status).toBe(status);
      if (status === 'UNKNOWN')
        expect(row('ES-M02')?.pendingDetails).toContain('PD-292');
      expect(result.status).toBe(status);
      expect(result.earliestDate).toBeUndefined();
      expect(result.pathwayCompletionDate).toBeUndefined();
    }
  });
  it('applies the full-time annual SMI to employment and checks labour age, contract and employer separately', () => {
    const work = (override: Partial<typeof employment>) =>
      run('M', {
        purpose: 'employment',
        holder: { ...holder, employment: { ...employment, ...override } },
      });
    const yes = work({});
    expect(yes.result.status).toBe('MET');
    expect(yes.get('ES-M04')).toBe('MET');
    expect(yes.get('ES-M05')).toBe('MET');
    expect(yes.get('ES-M02')).toBeUndefined();
    expect(yes.get('ES-M03')).toBeUndefined();
    expect(work({ annualGrossSalary: 17093.99 }).get('ES-M04')).toBe('NOT_MET');
    expect(
      work({ birthDate: '2010-11-23', minorConditionsAndConsent: true }).get(
        'ES-M04',
      ),
    ).toBe('MET');
    expect(
      work({ birthDate: '2010-11-24', minorConditionsAndConsent: true }).get(
        'ES-M04',
      ),
    ).toBe('NOT_MET');
    expect(work({ birthDate: '2008-11-24' }).get('ES-M04')).toBe('UNKNOWN');
    expect(work({ birthDate: '2008-11-23' }).get('ES-M04')).toBe('MET');
    expect(
      work({ compliesWithCollectiveAgreement: undefined }).get('ES-M04'),
    ).toBe('UNKNOWN');
    expect(
      run(
        'M',
        { purpose: 'employment', holder: { ...holder, employment } },
        { simulationDate: '2027-01-01' },
      ).get('ES-M04'),
    ).toBe('UNKNOWN');
    const emp = employment.employer!;
    for (const [householdSize, minimum] of [
      [1, 610.5],
      [2, 1221],
      [3, 1526.25],
    ]) {
      expect(
        work({
          employer: {
            ...emp,
            householdSize,
            monthlyResourcesAfterGrossSalary: minimum,
          },
        }).get('ES-M05'),
      ).toBe('MET');
      expect(
        work({
          employer: {
            ...emp,
            householdSize,
            monthlyResourcesAfterGrossSalary: minimum - 0.01,
          },
        }).get('ES-M05'),
      ).toBe('NOT_MET');
    }
    expect(
      work({
        employer: {
          ...emp,
          kind: 'company',
          projectAndPayrollSupported: undefined,
        },
      }).get('ES-M05'),
    ).toBe('UNKNOWN');
  });
  it('uses evidence of self-employment or a specific exemption without using the employed salary threshold', () => {
    const business = {
      businessPermits: true,
      professionalQualifications: true,
      investmentAndJobsSupported: true,
    };
    const self = (changes: Partial<typeof business>) =>
      run('M', {
        purpose: 'self-employment',
        holder: { ...holder, selfEmployment: { ...business, ...changes } },
      });
    expect(self({}).get('ES-M06')).toBe('MET');
    expect(self({ businessPermits: false }).get('ES-M06')).toBe('NOT_MET');
    expect(self({}).get('ES-M04')).toBeUndefined();
    const exempt = (e: Holder['exemptWork']) =>
      run('M', {
        purpose: 'exempt-work',
        holder: { ...holder, exemptWork: e },
      }).get('ES-M07');
    expect(
      exempt({
        basis: 'university',
        activityAndInstitutionQualify: true,
        formalEvidence: true,
      }),
    ).toBe('MET');
    expect(
      exempt({
        basis: 'none',
        activityAndInstitutionQualify: true,
        formalEvidence: true,
      }),
    ).toBe('NOT_MET');
    expect(
      exempt({
        basis: 'specific-performance',
        activityAndInstitutionQualify: true,
        formalEvidence: true,
      }),
    ).toBe('UNKNOWN');
    expect(
      run('M', { holder: { ...holder, securityDecision: 'pending' } }).get(
        'ES-M08',
      ),
    ).toBe('UNKNOWN');
    expect(
      run('M', { holder: { ...holder, noReturnBar: false } }).get('ES-M08'),
    ).toBe('NOT_MET');
  });
  it('checks admission fees, post-grant entry, alta and TIE dates by stage', () => {
    const grant = {
      notifiedOn: '2026-07-22',
      inSpainWhenNotified: false,
      enteredAfterGrantOn: '2026-10-22',
      registeredSocialSecurityOn: '2026-10-22',
      appliedForCardOn: '2026-11-22',
    };
    const procedure = (g: Holder['grant']) =>
      run('M', {
        purpose: 'employment',
        holder: { ...holder, employment, grant: g },
      });
    expect(procedure(grant).get('ES-M09')).toBe('MET');
    expect(procedure(grant).get('ES-M09-card')).toBe('MET');
    expect(
      procedure({ ...grant, registeredSocialSecurityOn: '2026-10-23' }).get(
        'ES-M09',
      ),
    ).toBe('NOT_MET');
    expect(
      procedure({ ...grant, enteredAfterGrantOn: '2026-10-23' }).get('ES-M09'),
    ).toBe('NOT_MET');
    expect(
      procedure({ ...grant, appliedForCardOn: '2026-11-23' }).get(
        'ES-M09-card',
      ),
    ).toBe('MET'); // The card deadline also rolls forward from Sunday.
    expect(
      procedure({
        ...grant,
        enteredAfterGrantOn: '2026-10-20',
        registeredSocialSecurityOn: '2026-10-20',
        appliedForCardOn: '2026-11-23',
      }).get('ES-M09-card'),
    ).toBe('NOT_MET');
    expect(
      procedure({ ...grant, registeredSocialSecurityOn: undefined }).get(
        'ES-M09',
      ),
    ).toBe('UNKNOWN');
    const lateFee = run('M', {
      holder: {
        ...holder,
        fee: {
          exemptPublicGuardian: false,
          paid: true,
          amount: 21.87,
          workingDaysAfterAdmission: 11,
        },
      },
    });
    expect(lateFee.get('ES-M10')).toBe('NOT_MET');
    expect(lateFee.result.status).toBe('MET');
    const extra = (required: boolean, paid: boolean) =>
      run('M', {
        purpose: 'employment',
        holder: {
          ...holder,
          employment,
          separateWorkFeeRequired: required,
          separateWorkFeePaid: paid,
        },
      }).get('ES-M10-work-fee');
    expect(extra(true, true)).toBe('MET');
    expect(extra(true, false)).toBe('NOT_MET');
    expect(extra(false, false)).toBeUndefined();
  });
  it('requires the prior family unit and a simultaneous or earlier principal application', () => {
    expect(run('F', {}).result.status).toBe('MET');
    expect(run('F', {}).get('ES-F01')).toBe('MET');
    expect(run('F', {}).get('ES-F01-grant')).toBe('UNKNOWN');
    expect(
      run('F', { family: { ...family, principalDecision: 'granted' } }).get(
        'ES-F01-grant',
      ),
    ).toBe('MET');
    expect(
      run('F', { family: { ...family, principalDecision: 'refused' } }).result
        .status,
    ).toBe('NOT_MET');
    expect(
      run('F', { family: { ...family, principalFiledOn: '2026-11-24' } }).get(
        'ES-F01',
      ),
    ).toBe('NOT_MET');
    expect(
      run('F', {
        family: { ...family, priorFamilyUnitAndResidenceProved: false },
      }).get('ES-F01'),
    ).toBe('NOT_MET');
    expect(
      run('F', { family: { ...family, enteredOn: '2026-08-23' } }).get(
        'ES-F01',
      ),
    ).toBe('MET');
    expect(
      run('F', { family: { ...family, enteredOn: '2026-08-20' } }).get(
        'ES-F01',
      ),
    ).toBe('NOT_MET');
  });
  it('examines relation-specific facts, the 18th and 65th birthdays and humanitarian evidence', () => {
    const relation = (r: Family['relationship']) =>
      run('F', { family: { ...family, relationship: r } }).get('ES-F02');
    expect(
      relation({
        kind: 'spouse',
        soleGenuineUnseparatedSpouse: true,
        previousMarriagesResolved: true,
      }),
    ).toBe('MET');
    expect(
      relation({
        kind: 'partner',
        exclusivePartnershipEffectiveInSpain: false,
      }),
    ).toBe('NOT_MET');
    const child = {
      kind: 'child' as const,
      childOfSponsorOrPartner: true,
      soleCustodyAndSupportIfApplicable: true,
      adoptionRecognisedIfApplicable: true,
      disabledAndUnableToProvideForSelf: false,
    };
    expect(relation({ ...child, birthDate: '2008-11-24' })).toBe('MET');
    expect(relation({ ...child, birthDate: '2008-11-23' })).toBe('NOT_MET');
    expect(
      relation({
        ...child,
        birthDate: '2008-11-23',
        disabledAndUnableToProvideForSelf: true,
      }),
    ).toBe('MET');
    expect(
      relation({
        kind: 'represented',
        birthDate: '1990-02-01',
        legalRepresentationValidInSpain: true,
        unableToProvideForSelfDueToHealth: true,
      }),
    ).toBe('MET');
    const parent = {
      kind: 'ascendant' as const,
      dependentFirstDegreeAscendant: true,
      residenceInSpainNecessary: true,
      humanitarianGroundsApproved: false,
    };
    expect(relation({ ...parent, birthDate: '1961-11-23' })).toBe('UNKNOWN');
    expect(relation({ ...parent, birthDate: '1961-11-22' })).toBe('MET');
    expect(relation({ ...parent, birthDate: '1961-11-24' })).toBe('NOT_MET');
    expect(
      relation({
        ...parent,
        birthDate: '1961-11-24',
        humanitarianGroundsApproved: true,
      }),
    ).toBe('MET');
  });
  it('uses family resources and checks insurance only on the non-working branch', () => {
    expect(run('F', {}).get('ES-F03')).toBe('MET');
    const under = run('F', {
      family: {
        ...family,
        resources: {
          ...family.resources,
          familySize: 3,
          eligibleMonthlyIncome: 1199.99,
        },
      },
    });
    expect(under.get('ES-F03')).toBe('NOT_MET');
    expect(run('F', {}).get('ES-F04')).toBe('MET');
    expect(
      run('F', {
        holder: { ...holder, healthCover: { kind: 'none' } },
        family: { ...family, healthCover: { kind: 'none' } },
      }).get('ES-F04'),
    ).toBe('NOT_MET');
    expect(
      run('F', {
        purpose: 'employment',
        family: { ...family, healthCover: { kind: 'none' } },
      }).get('ES-F04'),
    ).toBeUndefined();
    expect(run('F', { purpose: undefined }).get('ES-F04')).toBe('UNKNOWN');
  });
  it('accepts either spouse’s evidence of cover for the accompanying family member at filing', () => {
    const validPolicy = {
      ...holder.healthCover,
      kind: 'private' as const,
      validFrom: '2026-11-23',
      validTo: '2026-11-23',
    };
    const noOwnPolicy = { kind: 'none' as const };
    for (const [sponsorPolicy, ownPolicy, status] of [
      [{ ...validPolicy, coversFamilyMember: true }, undefined, 'MET'],
      [{ ...validPolicy, coversFamilyMember: true }, noOwnPolicy, 'MET'],
      [validPolicy, noOwnPolicy, 'UNKNOWN'],
      [{ ...validPolicy, coversFamilyMember: false }, noOwnPolicy, 'NOT_MET'],
      [{ ...validPolicy, coversFamilyMember: false }, validPolicy, 'MET'],
      [
        {
          ...validPolicy,
          coversFamilyMember: true,
          validFrom: '2026-01-01',
          validTo: '2026-11-22',
        },
        noOwnPolicy,
        'NOT_MET',
      ],
    ] as const) {
      const { row, result } = run('F', {
        holder: { ...holder, healthCover: sponsorPolicy },
        family: { ...family, healthCover: ownPolicy },
      });
      expect(row('ES-F04')?.status).toBe(status);
      expect(result.status).toBe(status);
      expect(result.earliestDate).toBeUndefined();
      expect(result.pathwayCompletionDate).toBeUndefined();
    }
  });
  it('separates family filing fees, activation and card issuance for permits exceeding six months', () => {
    const grant = {
      notifiedOn: '2026-07-20',
      inSpainWhenNotified: false,
      enteredAfterGrantOn: '2026-10-20',
      appliedForCardOn: '2026-11-20',
      permitEnd: '2027-04-21',
      cardCategory: 'initial-temporary' as const,
      cardFeePaidEur: 16.08,
    };
    const granted = (g: Family['grant']) =>
      run('F', {
        family: { ...family, principalDecision: 'granted', grant: g },
      });
    const yes = granted(grant);
    for (const id of [
      'ES-F05',
      'ES-F05-effective',
      'ES-F05-effective-card',
      'ES-F05-card-fee',
    ])
      expect(yes.get(id)).toBe('MET');
    expect(
      granted({ ...grant, enteredAfterGrantOn: '2026-10-21' }).get(
        'ES-F05-effective',
      ),
    ).toBe('NOT_MET');
    expect(
      granted({ ...grant, appliedForCardOn: '2026-11-21' }).get(
        'ES-F05-effective-card',
      ),
    ).toBe('NOT_MET');
    expect(
      granted({ ...grant, cardCategory: 'renewed-temporary' }).get(
        'ES-F05-card-fee',
      ),
    ).toBe('NOT_MET');
    expect(
      granted({ ...grant, cardCategory: undefined }).get('ES-F05-card-fee'),
    ).toBe('UNKNOWN');
    expect(
      granted({ ...grant, permitEnd: '2027-04-20' }).get(
        'ES-F05-effective-card',
      ),
    ).toBeUndefined();
    expect(
      run('F', { family: { ...family, fee: undefined } }).get('ES-F05'),
    ).toBe('UNKNOWN');
  });
  it('has stable ids and localised sourced checks in both languages', () => {
    for (const kind of ['F', 'M'] as const) {
      const zh = run(kind, {}).result;
      const en = run(kind, {}, { locale: 'en' }).result;
      expect(en.checks.map((c) => c.id)).toEqual(zh.checks.map((c) => c.id));
      expect(new Set(en.checks.map((c) => c.id)).size).toBe(en.checks.length);
      for (const [i, c] of en.checks.entries()) {
        expect(c.title).not.toBe(zh.checks[i].title);
        expect(c.sources.every((s) => s.locator && s.srcId)).toBe(true);
        expect(c.sources.length).toBeGreaterThan(0);
      }
    }
  });
});
