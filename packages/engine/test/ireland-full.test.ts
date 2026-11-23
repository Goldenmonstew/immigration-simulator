import { describe, expect, test } from 'vitest';
import { evaluateIreland, evaluateIrelandFull } from '../src';
import type {
  CountryCheck,
  IeStamp4Route,
  IrelandCitizenship,
  IrelandFamily,
  IrelandFullPathwayId,
  IrelandFullRequest,
  IrelandLtr,
  IrelandRegistration,
  IrelandTreatyResidence,
  IrelandWcatt,
  IrelandWorkPermit,
  IrelandWorkUpgrade,
} from '../src';

const day = '2026-11-23';
const base: IrelandFullRequest = {
  simulationDate: day,
  permissions: [{ kind: 'stamp4', from: '2016-01-01' }],
  trips: [],
  dateOfBirth: '1985-01-01',
  currentLocation: 'state',
  locale: 'en',
};
const good = { record: 'none', disclosed: true } as const;
const registration: IrelandRegistration = {
  basis: 'required',
  validPermission: true,
  passportValid: true,
  addressCurrent: true,
  registrationDate: day,
  feeExemption: 'none',
  feePrepared: true,
};
const citizen: IrelandCitizenship = {
  entitlement: 'none',
  character: good,
  vetting: 'completed',
  intendToReside: 'state',
  willingToDeclare: true,
  identityDocuments: ['validPassport'],
  birthCertificateOrAcceptedAlternative: true,
  prescribedFormAndWitness: true,
  refereeCount: 3,
  residenceEvidence: {
    requiredYears: [2025],
    years: [{ year: 2025, strong: 1, supporting: 1 }],
  },
  applicationFeePrepared: true,
  approved: true,
  certificateFeePaid: true,
  addressUpdated: true,
  survivorFeeConditions: false,
};

function result(
  id: IrelandFullPathwayId,
  request: Partial<IrelandFullRequest> = {},
) {
  return evaluateIrelandFull({
    ...base,
    registration,
    ...request,
    pathways: [id],
  }).columns[0].pathways[0];
}

function checks(
  id: IrelandFullPathwayId,
  request: Partial<IrelandFullRequest>,
  expected: Record<string, CountryCheck['status']>,
) {
  const evaluated = result(id, request);
  for (const [key, status] of Object.entries(expected)) {
    const check = evaluated.checks.find((item) => item.id === `IE-${key}`);
    expect(check, key).toBeDefined();
    expect(check?.status, key).toBe(status);
  }
  return evaluated;
}

function checkOf(checks: CountryCheck[], id: string) {
  return checks.find((check) => check.id === `IE-${id}`);
}

describe('Ireland full naturalisation', () => {
  const ordinary = 'IE-NATURALISATION';
  test('ordinary naturalisation checks identity, residence evidence, character, procedure and fee', () => {
    const route = checks(
      ordinary,
      { citizenship: citizen },
      {
        A01: 'MET',
        A02: 'MET',
        A03: 'MET',
        A04: 'MET',
        A05: 'MET',
        A06: 'MET',
        A07: 'MET',
        A08: 'MET',
        A09: 'MET',
        A10: 'MET',
        A11: 'MET',
        A12: 'MET',
      },
    );
    expect(route.status).toBe('MET');
    expect(route.earliestDate).toBe(day);
    expect(checkOf(route.checks, 'A09')?.explanation).toContain('€175');
    expect(checkOf(route.checks, 'A10')?.explanation).toContain('€950');
    expect(checkOf(route.checks, 'A11')?.explanation).toContain(
      'no standalone language',
    );
    const alternative = {
      ...citizen,
      approvedAlternativeDeclaration: true,
      willingToDeclare: false,
    };
    checks(ordinary, { citizenship: alternative }, { A06: 'NOT_MET' });
    checks(
      ordinary,
      { citizenship: { ...alternative, willingToDeclare: undefined } },
      { A06: 'UNKNOWN' },
    );
    checks(
      ordinary,
      { citizenship: { ...alternative, declarationCompleted: true } },
      { A06: 'MET' },
    );
  });

  test('omitted facts and deferred official checks remain unknown', () => {
    checks(
      ordinary,
      {
        dateOfBirth: undefined,
        currentLocation: undefined,
        registration: {
          ...registration,
          validPermission: false,
          renewalPending: true,
        },
      },
      {
        A01: 'UNKNOWN',
        A02: 'UNKNOWN',
        A03: 'UNKNOWN',
        A04: 'UNKNOWN',
        A05: 'UNKNOWN',
        A06: 'UNKNOWN',
        A07: 'UNKNOWN',
        A08: 'UNKNOWN',
        A09: 'UNKNOWN',
        A10: 'UNKNOWN',
        A12: 'UNKNOWN',
      },
    );
    const route = checks(
      ordinary,
      {
        citizenship: {
          ...citizen,
          character: { record: 'awaiting-trial', disclosed: true },
          vetting: 'pending-review',
        },
      },
      { A02: 'UNKNOWN', A03: 'UNKNOWN' },
    );
    expect(route.status).toBe('UNKNOWN');
    expect(route.earliestDate).toBeUndefined();
  });

  test('birthday and missing filing evidence do not turn into eligibility', () => {
    const route = checks(
      ordinary,
      {
        dateOfBirth: '2008-11-24',
        currentLocation: 'northern-ireland',
        citizenship: {
          ...citizen,
          character: { ...good, disclosed: false },
          vetting: 'outstanding',
          intendToReside: 'northern-ireland',
          willingToDeclare: false,
          identityDocuments: ['irp', 'euId'],
          refereeCount: 2,
          residenceEvidence: {
            requiredYears: [2025],
            years: [{ year: 2025, strong: 0, supporting: 3 }],
          },
          applicationFeePrepared: false,
          certificateFeePaid: false,
          addressUpdated: false,
        },
      },
      {
        A01: 'NOT_MET',
        A02: 'NOT_MET',
        A03: 'NOT_MET',
        A04: 'NOT_MET',
        A05: 'NOT_MET',
        A06: 'NOT_MET',
        A07: 'NOT_MET',
        A08: 'NOT_MET',
        A09: 'NOT_MET',
        A10: 'NOT_MET',
        A12: 'NOT_MET',
      },
    );
    expect(route.status).toBe('NOT_MET');
    expect(
      result(ordinary, { dateOfBirth: '2008-11-23', citizenship: citizen })
        .status,
    ).toBe('MET');
    expect(
      result(ordinary, {
        citizenship: { ...citizen, entitlement: 'already-citizen' },
      }).status,
    ).toBe('NOT_APPLICABLE');
  });

  test('identity expiry gap and addition deadline are checked at literal dates', () => {
    const documents: IrelandCitizenship['identityDocuments'] = ['irp'];
    const evidence = { requestedOn: '2026-10-26', suppliedOn: '2026-11-23' };
    const c = { ...citizen, identityDocuments: documents };
    checks(
      ordinary,
      {
        citizenship: {
          ...c,
          passportExpiredOn: '2025-11-24',
          additionalEvidence: evidence,
        },
      },
      { A07: 'MET', A12: 'MET' },
    );
    const gap = checks(
      ordinary,
      {
        citizenship: {
          ...c,
          passportExpiredOn: '2025-11-23',
          additionalEvidence: { ...evidence, suppliedOn: '2026-11-24' },
        },
      },
      { A07: 'UNKNOWN', A12: 'NOT_MET' },
    );
    expect(checkOf(gap.checks, 'A07')?.pendingDetails).toEqual(['PD-322']);
    checks(
      ordinary,
      { citizenship: { ...c, passportExpiredOn: '2025-11-22' } },
      { A07: 'NOT_MET' },
    );
  });

  const spouse: NonNullable<IrelandCitizenship['spouse']> = {
    relationship: 'spouse',
    irishCitizen: true,
    recognised: true,
    livingTogether: true,
    affidavit: true,
    jointAddressEvidenceMonths: 3,
    jointAddressDocuments: 3,
  };

  test('spouse relationship, island residence and posting or waiver are independent', () => {
    const marriedOn = '2023-11-23';
    const id = 'IE-SPOUSE';
    expect(
      checks(
        id,
        {
          marriedOn,
          citizenship: {
            ...citizen,
            spouse,
            intendToReside: 'northern-ireland',
          },
        },
        { 'SPOUSE-MARRIAGE': 'MET', A05: 'MET', A13: 'MET' },
      ).status,
    ).toBe('MET');
    checks(
      id,
      {
        marriedOn: '2023-11-24',
        citizenship: {
          ...citizen,
          spouse: {
            ...spouse,
            jointAddressDocuments: 2,
            livingTogether: false,
          },
        },
      },
      { 'SPOUSE-MARRIAGE': 'NOT_MET', A13: 'NOT_MET' },
    );
    checks(
      id,
      {
        marriedOn,
        currentLocation: 'elsewhere',
        permissions: [],
        trips: [{ departed: '2023-11-22', returned: '2026-12-01' }],
        citizenship: {
          ...citizen,
          intendToReside: 'elsewhere',
          spouse: { ...spouse, postingPeriods: [{ from: '2023-11-23' }] },
        },
      },
      {
        'NAT-CONTINUOUS': 'MET',
        'NAT-ABSENCES': 'MET',
        A04: 'MET',
        A05: 'MET',
        A14: 'MET',
      },
    );
    checks(
      id,
      {
        marriedOn,
        currentLocation: 'elsewhere',
        citizenship: { ...citizen, spouse: { ...spouse, waiver: 'pending' } },
      },
      { A04: 'UNKNOWN', A05: 'UNKNOWN', A14: 'UNKNOWN' },
    );
    checks(
      id,
      {
        citizenship: {
          ...citizen,
          spouse: {
            ...spouse,
            waiver: 'granted',
            waivedConditions: ['marriage'],
          },
        },
      },
      { 'SPOUSE-MARRIAGE': 'MET', A14: 'MET' },
    );
  });

  test('State-born minor needs 2 years before the final year, and statutory character begins at 14', () => {
    const id = 'IE-MINOR-BORN-IN-STATE';
    const minor = {
      authorisedRepresentative: true,
      listedSeriousOffence: false,
      backgroundFormPrepared: true,
    };
    const c: IrelandCitizenship = {
      ...citizen,
      character: { record: 'conviction-or-other', disclosed: true },
      willingToDeclare: false,
      minor,
      residence: [{ basis: 'reckonable', from: '2023-11-23' }],
    };
    const request = {
      birthplace: 'state' as const,
      dateOfBirth: '2012-11-24',
      citizenship: c,
    };
    const under = checks(id, request, {
      A01: 'MET',
      A04: 'MET',
      A15: 'MET',
      A16: 'MET',
    });
    expect(checkOf(under.checks, 'A06')).toBeUndefined();
    expect(checkOf(under.checks, 'A10')?.explanation).toContain('€200');
    checks(
      id,
      { ...request, birthplace: 'northern-ireland', dateOfBirth: '2012-11-23' },
      { A02: 'UNKNOWN', A06: 'NOT_MET', A15: 'NOT_MET', A16: 'NOT_MET' },
    );
    checks(
      id,
      {
        ...request,
        citizenship: {
          ...c,
          residence: [{ basis: 'reckonable', from: '2023-11-24' }],
        },
      },
      { A04: 'NOT_MET' },
    );
    checks(
      id,
      {
        ...request,
        citizenship: { ...c, minor: { ...minor, listedSeriousOffence: true } },
      },
      { A02: 'UNKNOWN' },
    );
  });

  test('Form 9 checks the parent certificate date and leaves an unconfirmed waiver open', () => {
    const id = 'IE-MINOR-NATURALISED-PARENT';
    const minor = {
      naturalisedParentCertificateOn: day,
      authorisedRepresentative: true,
      relationshipAndConsentEvidence: true,
      childResidenceAndSchoolEvidence: true,
      parentRouteWaiverGranted: true,
    };
    const request = {
      dateOfBirth: '2011-05-03',
      citizenship: { ...citizen, minor },
    };
    checks(id, request, { A17: 'MET', A04: 'MET' });
    checks(
      id,
      {
        ...request,
        citizenship: {
          ...citizen,
          minor: {
            ...minor,
            naturalisedParentCertificateOn: '2026-11-24',
            parentRouteWaiverGranted: undefined,
          },
        },
      },
      { A17: 'NOT_MET', A04: 'UNKNOWN' },
    );
  });

  test('Irish associations score in separate categories and do not grant the waiver', () => {
    const id = 'IE-IRISH-ASSOCIATIONS';
    const association: IrelandCitizenship['association'] = {
      qualifyingRelationship: true,
      relativeEligibleAtRelevantDate: true,
      evidence: {
        residenceYears: 5,
        taxResident: false,
        currentlyResident: true,
        visits: 0,
        residentFamily: false,
        significantContribution: false,
        nfqLevel: 6,
        juniorCertificate: true,
        leavingCertificate: true,
        irishInsurance: false,
        prsiContributions: 0,
        irishPension: false,
        fullIrishLicence: false,
        activeIrishBank: false,
      },
    };
    const p = checks(
      id,
      { citizenship: { ...citizen, association } },
      { A18: 'MET', A19: 'UNKNOWN' },
    );
    expect(checkOf(p.checks, 'A19')?.explanation).toContain(
      '2 evidence categories',
    );
    checks(
      id,
      {
        citizenship: {
          ...citizen,
          association: { ...association, waiverGranted: true },
        },
      },
      { A19: 'MET' },
    );
    checks(
      id,
      {
        citizenship: {
          ...citizen,
          association: {
            ...association,
            relativeEligibleAtRelevantDate: false,
          },
        },
      },
      { A18: 'NOT_MET' },
    );
  });

  test('refugee time changes on 8 December 2025 and the exemption is a certification fee', () => {
    const id = 'IE-PROTECTION';
    const protection = {
      kind: 'convention-refugee',
      grantOn: '2022-12-07',
      validRecognition: true,
    } as const;
    const c: IrelandCitizenship = {
      ...citizen,
      protection,
      residence: [{ basis: 'reckonable', from: '2022-12-07' }],
    };
    const route = checks(
      id,
      { simulationDate: '2025-12-07', citizenship: c },
      { A20: 'MET', A09: 'MET', A10: 'MET' },
    );
    expect(checkOf(route.checks, 'A10')?.explanation).toContain('€0');
    checks(
      id,
      { simulationDate: '2025-12-08', citizenship: c },
      { A20: 'NOT_MET' },
    );
    checks(
      id,
      { simulationDate: '2027-12-07', citizenship: c },
      { A20: 'MET' },
    );
    checks(
      id,
      {
        citizenship: {
          ...c,
          protection: { ...protection, kind: 'subsidiary' },
        },
      },
      { A20: 'UNKNOWN', A10: 'UNKNOWN' },
    );
  });

  test('confirmed overseas Irish appointment and waiver are both required', () => {
    const id = 'IE-PUBLIC-SERVICE';
    const publicService = {
      qualifyingIrishPublicAppointment: true,
      residesAbroadDuringService: true,
      appointmentEvidence: true,
    };
    checks(
      id,
      { citizenship: { ...citizen, publicService } },
      { A21: 'UNKNOWN' },
    );
    expect(
      checks(
        id,
        {
          citizenship: {
            ...citizen,
            publicService: { ...publicService, waiverGranted: true },
          },
        },
        { A21: 'MET' },
      ).status,
    ).toBe('MET');
    checks(
      id,
      {
        citizenship: {
          ...citizen,
          publicService: {
            ...publicService,
            qualifyingIrishPublicAppointment: false,
          },
        },
      },
      { A21: 'NOT_MET' },
    );
  });
});

const work: IrelandWorkUpgrade = {
  basis: 'csep',
  validCorrespondingPermission: true,
  employedInState: true,
  passportIrpAndPermits: true,
  payslipAndRevenueEvidence: true,
  employerLetterOn: '2026-08-23',
  recordsConsistent: true,
  termsComplied: true,
  character: good,
  permissionRevoked: false,
  isdApproved: true,
};
const permit: IrelandWorkPermit = {
  applicationDate: '2026-11-23',
  termMonths: 24,
  renewal: false,
  feePrepared: true,
  occupationEligible: true,
  recognisedQualifications: true,
  employerEligible: true,
  eeaStaffShare: 0.5,
  staffShareExemption: false,
  tier: 'csep',
  hoursPerWeek: 39,
  eligibleAnnualRemuneration: 40904,
  eligibleHourlyRemuneration: 20.17,
  offerFrom: day,
  offerEnd: '2028-11-22',
  baseWageLawMet: true,
};

describe('Ireland work upgrades, registration and Stamp 5', () => {
  const id = 'IE-STAMP4-21';
  const shortClock: Partial<IrelandFullRequest> = {
    permissions: [{ kind: 'stamp1-csep', from: '2025-02-23' }],
    employmentStart: '2025-02-23',
  };
  test('21-month group uses actual permission and checks the 3-month employer letter', () => {
    const route = checks(
      id,
      { ...shortClock, work },
      {
        'STAMP4-WORK-TIME': 'MET',
        B01: 'MET',
        B02: 'MET',
        B03: 'MET',
        B04: 'MET',
        B05: 'MET',
        B06: 'MET',
      },
    );
    expect(route.status).toBe('MET');
    expect(checkOf(route.checks, 'B02')?.explanation).toContain('€300');
    checks(
      id,
      {
        ...shortClock,
        work: {
          ...work,
          basis: 'ict',
          employerLetterOn: '2026-08-22',
          termsComplied: false,
          isdApproved: false,
        },
        registration: {
          ...registration,
          validPermission: false,
          feePrepared: false,
        },
      },
      {
        B01: 'NOT_MET',
        B02: 'NOT_MET',
        B03: 'NOT_MET',
        B04: 'NOT_MET',
        B05: 'NOT_MET',
        B06: 'NOT_MET',
      },
    );
    checks(
      id,
      { ...shortClock, work: { ...work, recordsConsistent: false } },
      { B04: 'UNKNOWN' },
    );
    checks(
      id,
      {
        ...shortClock,
        dateOfBirth: '2008-11-24',
        registration: { ...registration, feePrepared: false },
        work,
      },
      { B02: 'MET' },
    );
  });

  test('CSEP floor, unsatisfied hourly rate and working hours are checked only when applying for a permit', () => {
    const route = checks(
      id,
      { ...shortClock, work: { ...work, permitApplication: permit } },
      { B07: 'MET', B10: 'MET' },
    );
    expect(checkOf(route.checks, 'B10')?.explanation).toContain('€1000');
    checks(
      id,
      {
        ...shortClock,
        work: {
          ...work,
          permitApplication: {
            ...permit,
            eligibleHourlyRemuneration: 20.16,
            feePrepared: false,
          },
        },
      },
      { B07: 'NOT_MET', B10: 'NOT_MET' },
    );
    // 40,904 + (40 - 39) × 20.17 × 52 = 41,952.84.
    checks(
      id,
      {
        ...shortClock,
        work: {
          ...work,
          permitApplication: {
            ...permit,
            hoursPerWeek: 40,
            eligibleAnnualRemuneration: 41952.84,
          },
        },
      },
      { B07: 'MET' },
    );
    checks(
      id,
      {
        ...shortClock,
        work: {
          ...work,
          permitApplication: {
            ...permit,
            hoursPerWeek: 40,
            eligibleAnnualRemuneration: 41952.83,
          },
        },
      },
      { B07: 'NOT_MET' },
    );
    expect(
      checkOf(result(id, { ...shortClock, work }).checks, 'B07'),
    ).toBeUndefined();
  });

  test('GEP and ICT use separate salary and prior-work conditions', () => {
    const long = 'IE-STAMP4-57';
    const gep: IrelandWorkPermit = {
      ...permit,
      tier: 'gepLower',
      eligibleAnnualRemuneration: 32691,
      eligibleHourlyRemuneration: 16.12,
      labourMarketTestOrExemption: true,
      termMonths: 6,
    };
    const path = checks(
      long,
      { work: { ...work, basis: 'gep', permitApplication: gep } },
      { B08: 'MET', B10: 'MET' },
    );
    expect(checkOf(path.checks, 'B10')?.explanation).toContain('€500');
    checks(
      long,
      {
        work: {
          ...work,
          basis: 'gep',
          permitApplication: { ...gep, eligibleAnnualRemuneration: 32690.99 },
        },
      },
      { B08: 'NOT_MET' },
    );
    const ict: IrelandWorkPermit = {
      ...permit,
      tier: 'ictTrainee',
      termMonths: 12,
      associatedEmployersAndAssignment: true,
      foreignEmploymentFrom: '2026-10-23',
      transferOn: day,
      hoursPerWeek: 20,
      eligibleAnnualRemuneration: 36605,
      eligibleHourlyRemuneration: 18.05,
    };
    checks(
      long,
      { work: { ...work, basis: 'ict', permitApplication: ict } },
      { B09: 'MET' },
    );
    checks(
      long,
      {
        work: {
          ...work,
          basis: 'ict',
          permitApplication: { ...ict, foreignEmploymentFrom: '2026-10-24' },
        },
      },
      { B09: 'NOT_MET' },
    );
    checks(
      id,
      {
        ...shortClock,
        work: { ...work, basis: 'hosting', hostingAgreementValid: false },
      },
      { B09: 'NOT_MET' },
    );
  });

  test('Stamp 5 preserves the 96-month time check and applies distinct character and burden checks', () => {
    const stamp = 'IE-STAMP5';
    const stamp5: IrelandWcatt = {
      nonEea: true,
      validPermissionWhileProcessing: true,
      termsComplied: true,
      character: good,
      burden: { benefit: 'none' },
      passportAndIrpEvidence: true,
      bankEvidenceMonths: 6,
      longestAnnualAbsenceMonths: 4,
      grantReceived: true,
      employmentEfforts: true,
      passportExpiresOn: day,
    };
    expect(
      checks(
        stamp,
        { stamp5 },
        {
          'WCATT-TIME': 'MET',
          B24: 'MET',
          B25: 'MET',
          B26: 'MET',
          B27: 'MET',
          B28: 'MET',
        },
      ).status,
    ).toBe('MET');
    checks(
      stamp,
      {
        currentLocation: 'elsewhere',
        stamp5: {
          ...stamp5,
          character: { record: 'awaiting-trial', disclosed: true },
          burden: { benefit: 'prsi-only' },
          bankEvidenceMonths: 5,
          employmentEfforts: false,
        },
      },
      {
        B24: 'NOT_MET',
        B25: 'UNKNOWN',
        B26: 'UNKNOWN',
        B27: 'NOT_MET',
        B28: 'NOT_MET',
      },
    );
    checks(
      stamp,
      {
        stamp5: {
          ...stamp5,
          grantReceived: false,
          longestAnnualAbsenceMonths: 8,
        },
      },
      { B27: 'MET' },
    );
  });
});

const familyApplication: NonNullable<IrelandFamily['application']> = {
  date: day,
  channel: 'spouse-registration',
  entryOrConversionValid: true,
  priorSponsorshipHistoryComplete: true,
  sponsorResponsible: true,
  grossTaxYears: [25000, 25000, 25000],
  incomeMaintained: true,
  chieflyOnStateSupportYears: 0,
  minorChildren: 0,
  familyEvidenceComplete: true,
  addressEvidence: true,
  publicInterestCleared: true,
  visa: 'exempt',
  housing: { kind: 'private-owned' },
  insurance: {
    kind: 'private',
    coversRequiredPeople: true,
    hospitalAndMedical: true,
    coverageMonths: 12,
  },
};
const family: IrelandFamily = {
  relationship: 'spouse',
  relationshipValidAndGenuine: true,
  livingTogether: true,
  intendsToLiveTogetherInState: true,
  sponsorAdult: true,
  sponsorIrish: true,
  sponsorLawfulAndResident: true,
  establishedFamilyPermission: true,
  application: familyApplication,
};

describe('Ireland family Stamp 4', () => {
  const direct = 'IE-STAMP4-IRISH-FAMILY';
  const independent = 'IE-STAMP4-INDEPENDENT-FAMILY';

  test('Irish sponsor financial version changes at 12 June and the dedicated route can be unresolved', () => {
    const p = checks(
      direct,
      { family },
      {
        'FAMILY-IRISH-SPONSOR': 'MET',
        'FAMILY-CHANNEL': 'MET',
        B02: 'MET',
        B14: 'MET',
        B15: 'MET',
        B16: 'MET',
        B17: 'MET',
        B19: 'MET',
        B20: 'MET',
        'FAMILY-ENTRY-FEE': 'MET',
        B21: 'MET',
      },
    );
    expect(p.status).toBe('MET');
    expect(checkOf(p.checks, 'B02')?.explanation).toContain('€0');
    const gross = {
      ...familyApplication,
      grossTaxYears: [10000, 15000, 15000],
    };
    checks(
      direct,
      { family: { ...family, application: { ...gross, date: '2026-06-11' } } },
      { B17: 'MET' },
    );
    checks(
      direct,
      { family: { ...family, application: { ...gross, date: '2026-06-12' } } },
      { B17: 'NOT_MET' },
    );
    checks(
      direct,
      {
        family: {
          ...family,
          application: {
            ...gross,
            channel: 'spouse-in-state',
            date: '2026-06-12',
          },
        },
      },
      { B17: 'UNKNOWN' },
    );
    checks(
      direct,
      {
        family: {
          ...family,
          sponsorIrish: false,
          relationshipValidAndGenuine: false,
          application: {
            ...familyApplication,
            entryOrConversionValid: false,
            familyEvidenceComplete: false,
            chieflyOnStateSupportYears: 2,
            housing: { kind: 'excluded-public' },
            insurance: { ...familyApplication.insurance, coverageMonths: 11 },
          },
        },
      },
      {
        'FAMILY-IRISH-SPONSOR': 'NOT_MET',
        B14: 'NOT_MET',
        B15: 'NOT_MET',
        B16: 'NOT_MET',
        B19: 'NOT_MET',
        B20: 'NOT_MET',
        B21: 'NOT_MET',
      },
    );
    checks(
      direct,
      { family: { ...family, relationship: 'de-facto' } },
      { 'FAMILY-CHANNEL': 'NOT_MET' },
    );
  });

  test('Category C child net income is strictly above the threshold and housing counts capped volume', () => {
    const application: IrelandFamily['application'] = {
      ...familyApplication,
      channel: 'ordinary',
      minorChildren: 2,
      previousTaxYearNet: 45033,
      insuranceRequiredForEntry: false,
      housing: {
        kind: 'private-rented',
        bedroomCount: 2,
        childrenShareCompatibly: true,
        unrelatedAdultsWithChildren: false,
        entireHome: true,
        titleOrRtbAndAccom1: true,
        affordable: true,
        rooms: [
          {
            floorSquareFeet: 100,
            ceilingFeet: 8,
            occupantCount: 2,
            oppositeSexOccupantsAtLeastTenNotCouple: false,
          },
        ],
      },
    };
    const data: IrelandFamily = {
      ...family,
      sponsorCategory: 'C',
      sponsorIrish: false,
      sponsorQualifyingFrom: '2025-11-23',
      application,
    };
    checks(
      independent,
      { family: data },
      { B14: 'MET', B18: 'MET', B19: 'MET' },
    );
    checks(
      independent,
      {
        family: {
          ...data,
          sponsorQualifyingFrom: '2025-11-24',
          application: {
            ...application,
            previousTaxYearNet: 45032,
            housing: {
              ...application.housing,
              rooms: [
                {
                  floorSquareFeet: 99,
                  ceilingFeet: 9,
                  occupantCount: 2,
                  oppositeSexOccupantsAtLeastTenNotCouple: false,
                },
              ],
            },
          },
        },
      },
      { B14: 'NOT_MET', B18: 'NOT_MET', B19: 'NOT_MET' },
    );
    checks(
      independent,
      {
        family: {
          ...data,
          application: {
            ...application,
            minorChildren: 0,
            grossTaxYears: [30000],
          },
        },
      },
      { B17: 'NOT_MET' },
    );
    checks(
      independent,
      {
        family: {
          ...data,
          application: {
            ...application,
            minorChildren: 0,
            grossTaxYears: [30000.01],
          },
        },
      },
      { B17: 'MET' },
    );
  });

  test('independence and eligibility at next renewal differ when the sponsor just naturalised', () => {
    const { application: _application, ...previousFamily } = family;
    void _application;
    const data: IrelandFamily = {
      ...previousFamily,
      sponsorNaturalisedOn: '2026-11-22',
      nextRenewalOn: day,
      dependentPeriods: [{ from: '2023-11-22' }],
    };
    checks(
      independent,
      { family: data },
      { B11: 'MET', B12: 'MET', 'FAMILY-INDEPENDENCE': 'MET' },
    );
    const tooShort = checks(
      independent,
      { family: { ...data, dependentPeriods: [{ from: '2023-11-23' }] } },
      { B12: 'MET', 'FAMILY-INDEPENDENCE': 'NOT_MET' },
    );
    expect(tooShort.status).toBe('NOT_MET');
    checks(
      independent,
      {
        family: {
          ...data,
          establishedFamilyPermission: false,
          nextRenewalOn: '2026-11-24',
        },
      },
      { B11: 'NOT_MET', B12: 'NOT_MET' },
    );
    checks(
      independent,
      {
        family: {
          ...previousFamily,
          change: { kind: 'domestic-abuse', abusePermissionEvidence: true },
        },
      },
      { B13: 'UNKNOWN' },
    );
    checks(
      independent,
      {
        family: {
          ...previousFamily,
          change: { kind: 'domestic-abuse', approval: true },
        },
      },
      { B13: 'MET' },
    );
  });

  test('de facto channels use two-year cohabitation, dated police evidence and channel-specific insurance', () => {
    const partner: IrelandFamily = {
      ...family,
      relationship: 'de-facto',
      cohabitationFrom: '2024-11-23',
    };
    const app: NonNullable<IrelandFamily['application']> = {
      ...familyApplication,
      channel: 'de-facto-in-state',
      noSocialWelfare: true,
      applicantCharacter: good,
      sponsorCharacter: good,
      policeCertificates: {
        allRequiredCountriesCovered: true,
        issueDates: ['2026-05-23'],
      },
    };
    checks(
      direct,
      { family: { ...partner, application: app } },
      { B22: 'MET' },
    );
    checks(
      direct,
      {
        family: {
          ...partner,
          application: {
            ...app,
            policeCertificates: {
              ...app.policeCertificates,
              issueDates: ['2026-05-22'],
            },
          },
        },
      },
      { B22: 'NOT_MET' },
    );
    checks(
      direct,
      {
        family: {
          ...partner,
          cohabitationFrom: '2024-11-24',
          application: app,
        },
      },
      { B15: 'NOT_MET', B22: 'NOT_MET' },
    );
    const abroad: NonNullable<IrelandFamily['application']> = {
      ...app,
      channel: 'de-facto-overseas',
      visa: 'preclearance',
      visaFeePrepared: true,
      overseasLawfulAndRemainsAbroad: true,
      applicationSummaryOn: '2026-10-24',
      submittedDocumentsOn: day,
      sponsorBankMonths: 6,
      insurance: {
        kind: 'travel-bridge',
        coversRequiredPeople: true,
        hospitalAndMedical: true,
        coverageMonths: 6,
        coversUntilPrivateStarts: true,
        accidentCover: 25000,
        illnessCover: 25000,
      },
    };
    checks(
      direct,
      { family: { ...partner, application: abroad } },
      { B23: 'MET', 'FAMILY-ENTRY-FEE': 'MET' },
    );
    checks(
      direct,
      {
        family: {
          ...partner,
          application: {
            ...abroad,
            insurance: { ...abroad.insurance, accidentCover: 24999.99 },
            visaFeePrepared: false,
          },
        },
      },
      { B23: 'NOT_MET', 'FAMILY-ENTRY-FEE': 'NOT_MET' },
    );
    checks(
      direct,
      {
        family: {
          ...partner,
          application: { ...abroad, submittedDocumentsOn: '2026-11-24' },
        },
      },
      { B23: 'NOT_MET' },
    );
  });
});

const ltr: IrelandLtr = {
  registeredPeriods: [
    { from: '2021-11-23', to: '2023-11-22', basis: 'hosting', evidence: true },
    { from: '2023-11-23', basis: 'hosting-stamp4', evidence: true },
  ],
  employment: 'employed',
  canContinueEmployment: true,
  termsComplied: true,
  validPermission: true,
  residenceAndApplicationEvidence: true,
  character: good,
  burden: { benefit: 'prsi-only' },
  approvalLetterOn: '2026-10-26',
  feePaidOn: day,
  familyOrRenewalFeeConfirmed: true,
  maintenance: {
    renewal: true,
    largestCalendarYearAbsenceDays: 90,
    tripsPermittedOrExceptionConfirmed: true,
    workEffortsAndResidence: true,
    previousGrantYearsEvidence: true,
  },
};

describe('Ireland Long Term Residency', () => {
  test('two hosting years plus three qualifying Stamp 4 years meet 60 months', () => {
    const id = 'IE-LTR-PRINCIPAL';
    const p = checks(
      id,
      { ltr },
      {
        C01: 'MET',
        C02: 'MET',
        C03: 'MET',
        C04: 'MET',
        C05: 'MET',
        C06: 'MET',
        C08: 'MET',
        C09: 'MET',
        C10: 'MET',
      },
    );
    expect(p.status).toBe('MET');
    expect(checkOf(p.checks, 'C09')?.explanation).toContain('€500');
    const short: IrelandLtr = {
      ...ltr,
      registeredPeriods: [
        { ...ltr.registeredPeriods![0], from: '2021-11-24' },
        ltr.registeredPeriods![1],
      ],
      employment: 'self-employed',
      residenceAndApplicationEvidence: false,
      burden: { benefit: 'means-tested' },
      character: { ...good, disclosed: false },
      feePaidOn: '2026-11-24',
      maintenance: {
        ...ltr.maintenance,
        largestCalendarYearAbsenceDays: 91,
        tripsPermittedOrExceptionConfirmed: false,
      },
    };
    expect(
      checks(
        id,
        { ltr: short },
        {
          C01: 'NOT_MET',
          C03: 'NOT_MET',
          C04: 'NOT_MET',
          C05: 'UNKNOWN',
          C06: 'NOT_MET',
          C08: 'UNKNOWN',
          C09: 'NOT_MET',
        },
      ).status,
    ).toBe('NOT_MET');
    checks(
      id,
      {
        ltr: {
          ...ltr,
          registeredPeriods: [
            { basis: 'multi-site-doctor', from: '2021-11-23' },
          ],
        },
      },
      { C01: 'UNKNOWN', C02: 'UNKNOWN' },
    );
    checks(
      id,
      {
        ltr: {
          ...ltr,
          registeredPeriods: [
            { basis: 'ict', from: '2021-11-23', evidence: true },
          ],
        },
      },
      { C01: 'NOT_MET' },
    );
  });

  test('dependant time is the intersection and does not inherit a requirement to be employed', () => {
    const id = 'IE-LTR-FAMILY';
    const dependant: NonNullable<IrelandLtr['family']> = {
      eligibleDependentRelationship: true,
      principalHoldsLtr: true,
      dependentRegisteredPeriods: [
        { from: '2021-11-23' },
        { from: '2022-01-01' },
      ],
      principalQualifyingPeriods: [{ from: '2020-01-01' }],
    };
    const p = checks(
      id,
      {
        ltr: {
          ...ltr,
          family: dependant,
          employment: 'unemployed',
          familyOrRenewalFeeConfirmed: undefined,
        },
      },
      { C07: 'MET', C09: 'UNKNOWN' },
    );
    expect(p.status).toBe('MET');
    expect(checkOf(p.checks, 'C03')).toBeUndefined();
    checks(
      id,
      {
        ltr: {
          ...ltr,
          family: {
            ...dependant,
            principalQualifyingPeriods: [{ from: '2021-11-24' }],
          },
        },
      },
      { C07: 'NOT_MET' },
    );
    checks(
      id,
      { ltr: { ...ltr, family: { ...dependant, principalHoldsLtr: false } } },
      { C07: 'NOT_MET' },
    );
  });
});

const eu: IrelandTreatyResidence = {
  role: 'citizen',
  qualifyingNationality: true,
  regulatedFreeMovementBasis: true,
  acquisition: 'ordinary',
  activities: [{ from: '2021-11-23', basis: 'employed', verified: true }],
  residenceAndTravelComplete: true,
  absences: [],
  document: {
    inState: true,
    identityAndResidenceEvidence: true,
    addressAndStatusNotified: true,
    prolongedAbsenceNotified: true,
    publicInterest: 'clear',
  },
};

describe('Ireland EU Treaty Rights and the Withdrawal Agreement', () => {
  const id = 'IE-EU-PERMANENT';
  test('five-year anniversary needs a qualifying residence basis, including CSI where applicable', () => {
    expect(
      checks(
        id,
        { eu },
        {
          D01: 'MET',
          D02: 'MET',
          D03: 'MET',
          D06: 'MET',
          D07: 'MET',
          D08: 'MET',
          'TREATY-RESTRICTION': 'MET',
        },
      ).status,
    ).toBe('MET');
    checks(
      id,
      {
        eu: {
          ...eu,
          activities: [{ ...eu.activities![0], from: '2021-11-24' }],
        },
      },
      { D03: 'NOT_MET' },
    );
    const activity = {
      from: '2021-11-23',
      basis: 'student',
      verified: true,
      recognisedEducation: true,
      sufficientResources: true,
    } as const;
    checks(
      id,
      { eu: { ...eu, activities: [activity] } },
      { D02: 'UNKNOWN', D03: 'UNKNOWN' },
    );
    checks(
      id,
      {
        eu: {
          ...eu,
          activities: [{ ...activity, comprehensiveSicknessInsurance: false }],
        },
      },
      { D02: 'NOT_MET', D03: 'NOT_MET' },
    );
    checks(
      id,
      {
        eu: {
          ...eu,
          qualifyingNationality: false,
          activities: [{ ...activity, comprehensiveSicknessInsurance: true }],
        },
      },
      { D01: 'NOT_MET', D02: 'MET', D03: 'MET' },
    );
  });

  test('one six-calendar-month trip qualifies, one day longer does not without an exception', () => {
    const absence = {
      leftOn: '2022-06-01',
      returnedOn: '2022-12-01',
      reason: 'temporary',
    } as const;
    checks(id, { eu: { ...eu, absences: [absence] } }, { D03: 'MET' });
    checks(
      id,
      { eu: { ...eu, absences: [{ ...absence, returnedOn: '2022-12-02' }] } },
      { D03: 'NOT_MET' },
    );
    const exceptional = {
      leftOn: '2022-06-01',
      returnedOn: '2023-06-01',
      reason: 'important',
    } as const;
    checks(id, { eu: { ...eu, absences: [exceptional] } }, { D03: 'UNKNOWN' });
    checks(
      id,
      {
        eu: { ...eu, absences: [{ ...exceptional, exceptionConfirmed: true }] },
      },
      { D03: 'MET' },
    );
  });

  test('retirement requires more than three years of residence, employment at least twelve months', () => {
    const early: NonNullable<IrelandTreatyResidence['early']> = {
      kind: 'retired',
      eventOn: day,
      workerOrSelfEmployed: true,
      pensionAgeOrEarlyRetirementConfirmed: true,
      residenceFrom: '2023-11-22',
      workFrom: '2025-11-23',
    };
    expect(
      checks(id, { eu: { ...eu, acquisition: 'early', early } }, { D04: 'MET' })
        .status,
    ).toBe('MET');
    checks(
      id,
      {
        eu: {
          ...eu,
          acquisition: 'early',
          early: { ...early, residenceFrom: '2023-11-23' },
        },
      },
      { D04: 'NOT_MET' },
    );
    checks(
      id,
      {
        eu: {
          ...eu,
          acquisition: 'early',
          early: {
            ...early,
            residenceFrom: undefined,
            workFrom: undefined,
            irishSpouseOrCivilPartner: true,
          },
        },
      },
      { D04: 'MET' },
    );
  });

  test('D05 authorised retention uses the period before the start of dissolution and independent work', () => {
    const euFamily: IrelandTreatyResidence = {
      ...eu,
      role: 'family',
      qualifyingSponsor: true,
      relationshipEvidence: true,
      nonEuFamily: true,
      acquisition: 'retained',
      retention: {
        event: 'dissolution',
        eventOn: '2025-11-23',
        relationshipFrom: '2022-11-23',
        livedInStateAsFamilyFrom: '2024-11-23',
        sponsorHadRightOfResidence: true,
        sponsorStillInStateAtProceedings: true,
        personalBasis: 'work',
        economicBasisConfirmed: true,
        determination: true,
        custodyGranted: false,
        particularlyDifficultCircumstancesConfirmed: false,
        contactRightMustBeInState: false,
      },
    };
    checks(id, { eu: euFamily }, { D05: 'MET' });
    checks(
      id,
      {
        eu: {
          ...euFamily,
          retention: { ...euFamily.retention, relationshipFrom: '2022-11-24' },
        },
      },
      { D05: 'NOT_MET' },
    );
    checks(
      id,
      {
        eu: {
          ...euFamily,
          retention: { ...euFamily.retention, determination: undefined },
        },
      },
      { D05: 'UNKNOWN' },
    );
  });

  test('a missed filing deadline does not erase permanent residence but a formal restriction can', () => {
    const family: IrelandTreatyResidence = {
      ...eu,
      role: 'family',
      relationship: 'descendant',
      qualifyingSponsor: true,
      relationshipEvidence: true,
      dependency: false,
      nonEuFamily: true,
      document: {
        ...eu.document,
        currentCardExpiresOn: day,
        filedOn: day,
        publicInterest: 'pending',
      },
    };
    const p = checks(
      id,
      { dateOfBirth: '2005-11-24', eu: family },
      {
        D01: 'MET',
        D06: 'NOT_MET',
        D07: 'UNKNOWN',
        'TREATY-RESTRICTION': 'UNKNOWN',
      },
    );
    expect(p.status).toBe('MET');
    checks(id, { dateOfBirth: '2005-11-23', eu: family }, { D01: 'NOT_MET' });
    const restricted = checks(
      id,
      {
        dateOfBirth: '2005-11-24',
        eu: {
          ...family,
          document: { ...family.document, publicInterest: 'restricting-order' },
        },
      },
      { D07: 'NOT_MET', 'TREATY-RESTRICTION': 'NOT_MET' },
    );
    expect(restricted.status).toBe('NOT_MET');
  });

  test('EU loss uses over two years and WA loss uses over five', () => {
    const holder = {
      ...eu.document,
      priorPermanentRightOn: '2019-11-23',
      postGrantAbsence: { from: '2024-11-23' },
    };
    checks(id, { eu: { ...eu, document: holder } }, { D08: 'MET' });
    expect(
      checks(
        id,
        { simulationDate: '2026-11-24', eu: { ...eu, document: holder } },
        { D08: 'NOT_MET' },
      ).status,
    ).toBe('NOT_MET');
    const waId = 'IE-WA-PERMANENT';
    const wa: IrelandTreatyResidence = {
      ...eu,
      activities: [{ from: '2019-11-23', basis: 'employed', verified: true }],
      wa: {
        britishOrQualifyingFamily: true,
        relevantStart: '2020-12-31T22:59:59Z',
        protectedBeforeAndContinued: true,
      },
      document: { ...holder, postGrantAbsence: { from: '2021-11-23' } },
    };
    const p = checks(waId, { wa }, { E01: 'MET', E02: 'MET', E03: 'MET' });
    expect(checkOf(p.checks, 'E03')?.explanation).toContain('€0');
    checks(
      waId,
      { wa: { ...wa, document: { ...wa.document, extraFeeRequested: true } } },
      { E03: 'UNKNOWN' },
    );
    checks(
      waId,
      {
        wa: { ...wa, wa: { ...wa.wa, relevantStart: '2020-12-31T23:00:00Z' } },
      },
      { E01: 'NOT_MET' },
    );
    checks(waId, { simulationDate: '2026-11-24', wa }, { E02: 'NOT_MET' });
  });
});

test('legacy time checks match the existing engine text, sources and verdicts', () => {
  const scenarios: {
    request: Partial<IrelandFullRequest>;
    id: IrelandFullPathwayId;
    route: IeStamp4Route;
    oldIndex: number;
    pattern: RegExp;
  }[] = [
    {
      request: {},
      id: 'IE-NATURALISATION',
      route: 'none',
      oldIndex: 0,
      pattern: /^IE-NAT-/,
    },
    {
      request: { marriedOn: '2023-11-23' },
      id: 'IE-SPOUSE',
      route: 'none',
      oldIndex: 1,
      pattern: /^IE-(NAT-|SPOUSE-MARRIAGE)/,
    },
    {
      request: {
        permissions: [{ kind: 'stamp1-csep', from: '2025-02-23' }],
        employmentStart: '2025-02-23',
      },
      id: 'IE-STAMP4-21',
      route: 'csep',
      oldIndex: 2,
      pattern: /^IE-STAMP4-WORK-TIME$/,
    },
    {
      request: {
        permissions: [{ kind: 'stamp1-gep', from: '2022-02-23' }],
        employmentStart: '2022-02-23',
      },
      id: 'IE-STAMP4-57',
      route: 'gep',
      oldIndex: 2,
      pattern: /^IE-STAMP4-WORK-TIME$/,
    },
    {
      request: {
        permissions: [{ kind: 'stamp1g-spouse', from: '2021-11-23' }],
      },
      id: 'IE-STAMP4-INDEPENDENT-FAMILY',
      route: 'spouse-1g',
      oldIndex: 2,
      pattern: /^IE-FAMILY-LEGACY-TIME$/,
    },
    {
      request: {},
      id: 'IE-STAMP5',
      route: 'wcatt',
      oldIndex: 2,
      pattern: /^IE-WCATT-TIME$/,
    },
  ];
  for (const item of scenarios) {
    for (const offset of [day, '2026-11-22']) {
      const request = { ...base, ...item.request, simulationDate: offset };
      const old = evaluateIreland({ ...request, stamp4Route: item.route })
        .pathways[item.oldIndex];
      const next = result(item.id, request);
      expect(
        next.checks
          .filter((c) => item.pattern.test(c.id))
          .map((c) => ({
            status: c.status,
            explanation: c.explanation,
            sources: c.sources,
          })),
      ).toEqual(
        old.checks.map((c) => ({
          status:
            c.met === true ? 'MET' : c.met === false ? 'NOT_MET' : 'UNKNOWN',
          explanation: c.text,
          sources: c.sources,
        })),
      );
    }
  }
});

test('combines future time with complete facts and suppresses a date for undecided or failed facts', () => {
  const clock = {
    permissions: [{ kind: 'stamp1-csep', from: '2025-02-24' }],
    employmentStart: '2025-02-24',
  } satisfies Partial<IrelandFullRequest>;
  const id = 'IE-STAMP4-21';
  expect(result(id, { ...clock, work })).toMatchObject({
    status: 'FUTURE',
    earliestDate: '2026-11-24',
  });
  expect(
    result(id, { ...clock, work: { ...work, termsComplied: undefined } }),
  ).toMatchObject({ status: 'UNKNOWN', earliestDate: undefined });
  expect(
    result(id, { ...clock, work: { ...work, termsComplied: false } }),
  ).toMatchObject({ status: 'NOT_MET', earliestDate: undefined });
});

test('both locales expose the same stable path and check IDs, with explanations and locators', () => {
  const en = evaluateIrelandFull(base).columns[0];
  const zh = evaluateIrelandFull({ ...base, locale: 'zh-CN' }).columns[0];
  expect(en.pathways).toHaveLength(16);
  expect(zh.pathways.map((path) => path.id)).toEqual(
    en.pathways.map((path) => path.id),
  );
  for (const [index, path] of en.pathways.entries()) {
    const chinese = zh.pathways[index];
    expect(chinese.title).not.toBe(path.title);
    expect(chinese.status).toBe(path.status);
    expect(chinese.checks.map((c) => c.id)).toEqual(
      path.checks.map((c) => c.id),
    );
    expect(new Set(path.checks.map((c) => c.id)).size).toBe(path.checks.length);
    for (const [j, check] of path.checks.entries()) {
      expect(check.explanation).not.toBe(chinese.checks[j].explanation);
      expect(check.sources.length).toBeGreaterThan(0);
      for (const source of check.sources) expect(source.locator).not.toBe('');
    }
  }
});
