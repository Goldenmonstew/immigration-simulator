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
  irpExpiresOn: '2027-01-01',
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
const spouse: NonNullable<IrelandCitizenship['spouse']> = {
  relationship: 'spouse',
  irishCitizen: true,
  recognised: true,
  livingTogether: true,
  affidavit: true,
  jointAddressEvidenceMonths: 3,
  jointAddressDocuments: 3,
};
const residenceFrom = '2018-08-01';
const naturalisationFacts: IrelandCitizenship = {
  ...citizen,
  spouse,
  residence: [{ from: residenceFrom, basis: 'reckonable' }],
  minor: {
    authorisedRepresentative: true,
    listedSeriousOffence: false,
    backgroundFormPrepared: true,
    naturalisedParentCertificateOn: '2025-01-01',
    relationshipAndConsentEvidence: true,
    childResidenceAndSchoolEvidence: true,
  },
  association: {
    qualifyingRelationship: true,
    relativeEligibleAtRelevantDate: true,
    waiverGranted: true,
  },
  protection: {
    kind: 'convention-refugee',
    grantOn: residenceFrom,
    validRecognition: true,
  },
  publicService: {
    qualifyingIrishPublicAppointment: true,
    residesAbroadDuringService: true,
    appointmentEvidence: true,
    waiverGranted: true,
  },
};
const naturalisationApplications = {
  'IE-NATURALISATION': {},
  'IE-SPOUSE': { marriedOn: '2023-11-23' },
  'IE-MINOR-BORN-IN-STATE': { dateOfBirth: '2012-11-24', birthplace: 'state' },
  'IE-MINOR-NATURALISED-PARENT': { dateOfBirth: '2011-05-03' },
  'IE-IRISH-ASSOCIATIONS': {},
  'IE-PROTECTION': {},
  'IE-PUBLIC-SERVICE': {},
} satisfies Partial<Record<IrelandFullPathwayId, Partial<IrelandFullRequest>>>;

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

  test.each(['IE-NATURALISATION', 'IE-SPOUSE'] as const)(
    '%s counts documented residence without a Stamp for an exempt applicant',
    (id) => {
      const from = '2020-01-01';
      const requiredYears = [2020, 2021, 2022, 2023, 2024, 2025, 2026];
      const request = {
        ...naturalisationApplications[id],
        registration: { basis: 'exempt' },
        permissions: [],
        citizenship: {
          ...citizen,
          spouse,
          residence: [{ from, basis: 'reckonable' }],
          residenceEvidence: {
            requiredYears,
            years: requiredYears.map((year) => ({ year, strong: 1, supporting: 1 })),
          },
          unregisteredResidenceEvidence: [{ from, to: day }],
        },
      } satisfies Partial<IrelandFullRequest>;
      expect(checks(id, request, {
        A04: 'MET', A08: 'MET', 'NAT-CONTINUOUS': 'MET', 'NAT-ABSENCES': 'MET', 'NAT-PRIOR': 'MET',
      })).toMatchObject({ status: 'MET', earliestDate: day });
      expect(checks(id, {
        ...request,
        citizenship: { ...request.citizenship, unregisteredResidenceEvidence: [{ from, to: '2026-11-22' }] },
      }, { 'NAT-CONTINUOUS': 'UNKNOWN', 'NAT-PRIOR': 'MET' }))
        .toMatchObject({ status: 'UNKNOWN', earliestDate: undefined, pendingDetails: expect.arrayContaining(['PD-323']) });
      expect(checks(id, {
        ...request,
        citizenship: { ...request.citizenship, unregisteredResidenceEvidence: undefined },
      }, { A08: 'MET', 'NAT-CONTINUOUS': 'UNKNOWN', 'NAT-PRIOR': 'UNKNOWN' }))
        .toMatchObject({ status: 'UNKNOWN', earliestDate: undefined });
    },
  );

  test.each([
    ['IE-SPOUSE', '2020-01-01', '2024-11-23', '2027-11-23'],
    ['IE-NATURALISATION', '2022-05-23', undefined, '2027-05-24'],
  ] as const)('%s projects ongoing exempt residence from verified evidence on the simulation date', (id, from, marriedOn, earliestDate) => {
    const request = {
      marriedOn,
      registration: { basis: 'exempt' },
      permissions: [],
      citizenship: {
        ...citizen,
        spouse,
        residence: [{ from, basis: 'reckonable' }],
        unregisteredResidenceEvidence: [{ from, to: day }],
      },
    } satisfies Partial<IrelandFullRequest>;
    const timeCheck = id === 'IE-SPOUSE' ? 'SPOUSE-MARRIAGE' : 'NAT-PRIOR';
    const projected = checks(id, request, { 'NAT-CONTINUOUS': 'MET', [timeCheck]: 'NOT_MET' });
    expect(projected).toMatchObject({ status: 'FUTURE', earliestDate });
    expect(projected.assumptions.join(' ')).toContain('assumes lawful residence continues');
    expect(checks(id, {
      ...request,
      simulationDate: earliestDate,
      citizenship: {
        ...request.citizenship,
        unregisteredResidenceEvidence: [{ from, to: earliestDate }],
      },
    }, { 'NAT-CONTINUOUS': 'MET', [timeCheck]: 'MET' }))
      .toMatchObject({ status: 'MET', earliestDate });
    expect(checks(id, {
      ...request,
      simulationDate: earliestDate,
    }, { 'NAT-CONTINUOUS': 'UNKNOWN' }))
      .toMatchObject({ status: 'UNKNOWN', earliestDate: undefined });
    for (const residence of [[{ from, to: day, basis: 'reckonable' as const }], undefined]) {
      expect(result(id, { ...request, citizenship: { ...request.citizenship, residence } }))
        .toMatchObject({ status: 'NOT_MET', earliestDate: undefined });
    }
  });

  test.each([
    ['IE-MINOR-BORN-IN-STATE', 'A04'],
    ['IE-MINOR-NATURALISED-PARENT', 'A04'],
    ['IE-IRISH-ASSOCIATIONS', 'A04'],
    ['IE-PROTECTION', 'A20'],
    ['IE-PUBLIC-SERVICE', 'A04'],
  ] as const)('%s uses verified unregistered residence when no separate residence timeline is entered', (id, check) => {
    expect(checks(id, {
      ...naturalisationApplications[id],
      registration: { basis: 'exempt' },
      permissions: [],
      citizenship: {
        ...naturalisationFacts,
        residence: undefined,
        unregisteredResidenceEvidence: [{ from: residenceFrom, to: day }],
        association: { ...naturalisationFacts.association, waiverGranted: false },
        publicService: { ...naturalisationFacts.publicService, waiverGranted: false },
      },
    }, { [check]: 'MET' })).toBeDefined();
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

  test('a recognised refugee can use the ISD document combination without a national passport', () => {
    const id = 'IE-PROTECTION';
    const citizenship: IrelandCitizenship = {
      ...citizen,
      identityDocuments: [],
      alternativeIdentityEvidence: true,
      protection: {
        kind: 'convention-refugee',
        grantOn: '2021-11-23',
        validRecognition: true,
      },
      residence: [{ basis: 'reckonable', from: '2021-11-23' }],
    };
    expect(
      checks(id, { citizenship }, { A07: 'UNKNOWN', A20: 'MET' }),
    ).toMatchObject({ status: 'UNKNOWN', earliestDate: undefined });
    const identityEvidence = {
      nationalPassportUnavailable: true,
      certifiedIrishTravelDocument: true,
      refugeeStatusLetter: true,
      witnessedPassportAffidavit: true,
    };
    const protection = { ...citizenship.protection, identityEvidence };
    expect(
      checks(
        id,
        { citizenship: { ...citizenship, protection } },
        { A07: 'MET', A20: 'MET' },
      ),
    ).toMatchObject({ status: 'MET', earliestDate: day });
    expect(
      checks(
        id,
        {
          citizenship: {
            ...citizenship,
            protection: {
              ...protection,
              identityEvidence: {
                ...identityEvidence,
                witnessedPassportAffidavit: false,
              },
            },
          },
        },
        { A07: 'NOT_MET', A20: 'MET' },
      ),
    ).toMatchObject({ status: 'NOT_MET', earliestDate: undefined });
  });

  test('refugee naturalisation checks the final year separately and honours the scope of a formal waiver', () => {
    const protection = {
      kind: 'convention-refugee',
      grantOn: '2018-08-01',
      validRecognition: true,
    } as const;
    const request = {
      trips: [{ departed: '2026-05-24', returned: '2026-11-01' }],
      citizenship: {
        ...citizen,
        protection,
        residence: [
          { basis: 'reckonable', from: '2018-08-01', to: '2026-05-24' },
          { basis: 'reckonable', from: '2026-11-01' },
        ],
      },
    } satisfies Partial<IrelandFullRequest>;
    for (const [waiverGranted, waivedResidenceConditions, status] of [
      [false, undefined, 'NOT_MET'],
      [true, ['prior'], 'NOT_MET'],
      [true, ['continuous'], 'MET'],
      [true, undefined, 'MET'],
    ] satisfies [
      boolean, NonNullable<IrelandCitizenship['protection']>['waivedResidenceConditions'],
      CountryCheck['status'],
    ][]) {
      expect(checks('IE-PROTECTION', {
        ...request,
        citizenship: {
          ...request.citizenship,
          protection: { ...protection, waiverGranted, waivedResidenceConditions },
        },
      }, { A20: status })).toMatchObject({
        status, earliestDate: status === 'MET' ? day : undefined,
      });
    }
    expect(checks('IE-PROTECTION', {
      ...request,
      citizenship: {
        ...request.citizenship,
        protection: { ...protection, waiverPending: true },
      },
    }, { A20: 'UNKNOWN' })).toMatchObject({
      status: 'UNKNOWN', earliestDate: undefined,
    });
    expect(checks('IE-PROTECTION', {
      citizenship: {
        ...request.citizenship,
        residence: [{ basis: 'reckonable', from: '2022-11-23' }],
        protection: { ...protection, waiverGranted: true, waivedResidenceConditions: ['continuous'] },
      },
    }, { A20: 'NOT_MET' })).toMatchObject({
      status: 'NOT_MET', earliestDate: undefined,
    });
  });

  test.each([
    ['IE-NATURALISATION', 'A04', 'MET'],
    ['IE-SPOUSE', 'A04', 'MET'],
    ['IE-MINOR-BORN-IN-STATE', 'A04', 'MET'],
    ['IE-MINOR-NATURALISED-PARENT', 'A04', 'MET'],
    ['IE-IRISH-ASSOCIATIONS', 'A04', 'NOT_MET'],
    ['IE-PROTECTION', 'A20', 'MET'],
    ['IE-PUBLIC-SERVICE', 'A04', 'NOT_MET'],
  ] as const)('%s treats travel within lawful residence the same when entered as split periods', (id, check, status) => {
    const trip = { departed: '2026-08-01', returned: '2026-08-15' };
    const citizenship: IrelandCitizenship = {
      ...naturalisationFacts,
      association: { ...naturalisationFacts.association, waiverGranted: false },
      publicService: { ...naturalisationFacts.publicService, waiverGranted: false },
    };
    const request = { ...naturalisationApplications[id], trips: [trip], citizenship };
    const continuous = checks(id, request, { [check]: 'MET' });
    expect(continuous).toMatchObject({
      status, earliestDate: status === 'MET' ? day : undefined,
    });
    const split = checks(id, {
      ...request,
      citizenship: {
        ...citizenship,
        residence: [
          { from: residenceFrom, to: trip.departed, basis: 'reckonable' },
          { from: trip.returned, basis: 'reckonable' },
        ],
      },
    }, { [check]: 'MET' });
    expect(split).toEqual(continuous);
  });

  test.each([
    ['IE-MINOR-BORN-IN-STATE', 'A04', '2023-11-23', 'UNKNOWN'],
    ['IE-PROTECTION', 'A20', '2021-11-23', 'NOT_MET'],
  ] as const)('%s still deducts a prior-period trip once for cumulative residence', (id, check, from, status) => {
    const trip = { departed: '2024-08-01', returned: '2024-08-15' };
    const citizenship: IrelandCitizenship = {
      ...naturalisationFacts,
      protection: { ...naturalisationFacts.protection, grantOn: from },
      residence: [{ from, basis: 'reckonable' }],
    };
    const request = { ...naturalisationApplications[id], citizenship };
    expect(checks(id, request, { [check]: 'MET' }))
      .toMatchObject({ status: 'MET', earliestDate: day });
    const withTravel = checks(id, { ...request, trips: [trip] }, { [check]: status });
    expect(withTravel).toMatchObject({ status, earliestDate: undefined });
    expect(checks(id, {
      ...request,
      trips: [trip],
      citizenship: {
        ...citizenship,
        residence: [
          { from, to: trip.departed, basis: 'reckonable' },
          { from: trip.returned, basis: 'reckonable' },
        ],
      },
    }, { [check]: status })).toEqual(withTravel);
  });

  test('a travel record does not establish lawful residence during the gap', () => {
    const trip = { departed: '2026-08-01', returned: '2026-08-15' };
    const request: Partial<IrelandFullRequest> = {
      trips: [trip],
      permissions: [
        { kind: 'stamp4', from: residenceFrom, to: trip.departed },
        { kind: 'stamp4', from: trip.returned },
      ],
      citizenship: {
        ...naturalisationFacts,
        residence: [
          { from: residenceFrom, to: trip.departed, basis: 'reckonable' },
          { from: trip.returned, basis: 'reckonable' },
        ],
      },
    };
    expect(checks('IE-PROTECTION', request, { A20: 'UNKNOWN' }))
      .toMatchObject({ status: 'UNKNOWN', earliestDate: undefined });
    expect(checks('IE-PROTECTION', { ...request, trips: [] }, { A20: 'NOT_MET' }))
      .toMatchObject({ status: 'NOT_MET', earliestDate: undefined });
  });

  test('an Irish-born child without a registration record needs lawful cover for the whole trip', () => {
    const id = 'IE-MINOR-BORN-IN-STATE';
    const from = '2021-04-01';
    const trip = { departed: '2026-08-01', returned: '2026-08-15' };
    const request = {
      dateOfBirth: from,
      birthplace: 'state',
      registration: { basis: 'exempt', validPermission: true },
      permissions: [],
      trips: [trip],
    } satisfies Partial<IrelandFullRequest>;
    for (const [unregisteredResidenceEvidence, status] of [
      [[{ from: trip.departed, to: trip.returned }], 'MET'],
      [[{ from: '2026-08-02', to: '2026-08-14' }], 'UNKNOWN'],
      [undefined, 'UNKNOWN'],
    ] satisfies [IrelandCitizenship['unregisteredResidenceEvidence'], CountryCheck['status']][]) {
      const citizenship: IrelandCitizenship = {
        ...naturalisationFacts,
        unregisteredResidenceEvidence,
        residence: [{ from, basis: 'reckonable' }],
      };
      const merged = checks(id, { ...request, citizenship }, { A04: status });
      expect(merged).toMatchObject({ status, earliestDate: status === 'MET' ? day : undefined });
      expect(checks(id, {
        ...request,
        citizenship: {
          ...citizenship,
          residence: [
            { from, to: trip.departed, basis: 'reckonable' },
            { from: trip.returned, basis: 'reckonable' },
          ],
        },
      }, { A04: status })).toEqual(merged);
    }
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

  test.each([
    'IE-MINOR-NATURALISED-PARENT', 'IE-IRISH-ASSOCIATIONS', 'IE-PUBLIC-SERVICE',
  ] as const)('%s checks the final year where a waiver has not been granted', (id) => {
    const dateOfBirth = id === 'IE-MINOR-NATURALISED-PARENT' ? '2011-05-03' : base.dateOfBirth;
    for (const waiverGranted of [false, true]) {
      const status = waiverGranted ? 'MET' : 'NOT_MET';
      const citizenship: IrelandCitizenship = {
        ...citizen,
        residence: [{ basis: 'reckonable', from: '2026-05-01' }],
        minor: {
          naturalisedParentCertificateOn: '2025-01-01',
          authorisedRepresentative: true,
          relationshipAndConsentEvidence: true,
          childResidenceAndSchoolEvidence: true,
          parentRouteWaiverGranted: waiverGranted,
        },
        association: {
          qualifyingRelationship: true,
          relativeEligibleAtRelevantDate: true,
          waiverGranted,
        },
        publicService: {
          qualifyingIrishPublicAppointment: true,
          residesAbroadDuringService: true,
          appointmentEvidence: true,
          waiverGranted,
        },
      };
      expect(checks(id, { dateOfBirth, citizenship }, { A04: status }))
        .toMatchObject({ status, earliestDate: waiverGranted ? day : undefined });
    }
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
  test('work Stamp 4 upgrade waits for the IRP window and for the qualifying employment date', () => {
    const simulationDate = '2027-05-08';
    const request = {
      simulationDate,
      permissions: [{ kind: 'stamp1-csep', from: '2025-02-23', to: '2027-08-01' }],
      employmentStart: '2025-02-23',
      registration: { ...registration, irpExpiresOn: undefined },
      work: { ...work, employerLetterOn: '2027-05-01' },
    } satisfies Partial<IrelandFullRequest>;
    expect(checks(id, request, {
      'STAMP4-WORK-TIME': 'MET', 'IRP-RENEWAL-WINDOW': 'NOT_MET',
    })).toMatchObject({ status: 'FUTURE', earliestDate: '2027-05-09' });
    expect(checks(id, { ...request, simulationDate: '2027-05-09' }, {
      'STAMP4-WORK-TIME': 'MET', 'IRP-RENEWAL-WINDOW': 'MET',
    })).toMatchObject({ status: 'MET', earliestDate: '2027-05-09' });
    expect(checks(id, { ...request, employmentStart: '2025-09-10' }, {
      'STAMP4-WORK-TIME': 'NOT_MET', 'IRP-RENEWAL-WINDOW': 'NOT_MET',
    })).toMatchObject({ status: 'FUTURE', earliestDate: '2027-06-10' });
  });

  test('a work upgrade forecast after IRP expiry explains the need for valid permission', () => {
    const request = {
      permissions: [{ kind: 'stamp1-csep', from: '2025-05-20' }],
      employmentStart: '2025-05-20',
      registration: { ...registration, irpExpiresOn: '2027-01-31' },
      work,
    } satisfies Partial<IrelandFullRequest>;
    const forecast = result(id, request);
    expect(forecast).toMatchObject({ status: 'FUTURE', earliestDate: '2027-02-20' });
    expect(forecast.summary).toContain('2027-01-31');
    expect(forecast.summary).toContain('valid permission');
    expect(result(id, { ...request, locale: 'zh-CN' }).summary).toContain('有效许可');
    expect(result(id, {
      ...request,
      registration: { ...request.registration, irpExpiresOn: '2027-02-20' },
    }).summary).not.toContain('valid permission');
    expect(checks(id, {
      ...request,
      simulationDate: '2027-02-20',
      work: { ...work, employerLetterOn: '2027-02-10' },
    }, { 'IRP-RENEWAL-WINDOW': 'UNKNOWN' })).toMatchObject({
      status: 'UNKNOWN', earliestDate: undefined,
    });
  });

  test.each([
    ['IE-STAMP4-57', 'student', 'stamp1-gep', 'IRP-CHECKLIST'],
    ['IE-STAMP5', 'stamp4', 'stamp5', 'B28'],
  ] as const)('%s renewal infers the old permission end before selecting the current Stamp', (path, oldKind, kind, check) => {
    const previous = { kind: oldKind, from: '2022-01-01' };
    const current = { kind, from: '2025-01-01', to: '2026-12-01' };
    for (const irpExpiresOn of [current.to, undefined]) {
      const request = {
        registration: { ...registration, stage: 'renewal', checklistComplete: true, irpExpiresOn },
        permissions: [previous, current],
      } satisfies Partial<IrelandFullRequest>;
      const implicit = checks(path, request, { [check]: 'MET', 'IRP-RENEWAL-WINDOW': 'MET' });
      expect(implicit).toMatchObject({ status: 'MET', earliestDate: day });
      expect(implicit).toEqual(result(path, {
        ...request, permissions: [{ ...previous, to: '2024-12-31' }, current],
      }));
    }
  });

  test.each(['stamp1', 'stamp1g-graduate', 'stamp4'] as const)(
    'ordinary %s renewal applies its registration checklist and IRP opening date',
    (kind) => {
      const request = {
        permissions: [{ kind, from: '2026-08-01', to: '2027-08-01' }],
        registration: { ...registration, stage: 'renewal', checklistComplete: true, irpExpiresOn: undefined },
      } satisfies Partial<IrelandFullRequest>;
      expect(checks(id, request, {
        'IRP-RENEWAL-WINDOW': 'NOT_MET', 'IRP-CHECKLIST': 'MET',
      })).toMatchObject({ status: 'FUTURE', earliestDate: '2027-05-09' });
      const atOpening = checks(id, { ...request, simulationDate: '2027-05-09' }, {
        'IRP-RENEWAL-WINDOW': 'MET', 'IRP-CHECKLIST': 'MET',
      });
      expect(atOpening).toMatchObject({ status: 'MET', earliestDate: '2027-05-09' });
      expect(checkOf(atOpening.checks, 'STAMP4-WORK-TIME')).toBeUndefined();
    },
  );

  test('ordinary work renewal requires an eligible existing Stamp and valid permission', () => {
    const request = {
      registration: { ...registration, stage: 'renewal', checklistComplete: true },
    } satisfies Partial<IrelandFullRequest>;
    expect(checks(id, {
      ...request, permissions: [{ kind: 'student', from: '2026-08-01' }],
    }, { 'IRP-CHECKLIST': 'NOT_MET' })).toMatchObject({ status: 'NOT_MET', earliestDate: undefined });
    expect(checks(id, {
      ...request, permissions: [],
    }, { 'IRP-CHECKLIST': 'UNKNOWN' })).toMatchObject({ status: 'UNKNOWN', earliestDate: undefined });
    expect(checks(id, {
      ...request, registration: { ...request.registration, validPermission: false },
    }, { B01: 'NOT_MET' })).toMatchObject({ status: 'NOT_MET', earliestDate: undefined });
  });

  test('first employment registration after approved entry does not use the IRP renewal window', () => {
    const path = checks(id, {
      permissions: [{ kind: 'stamp1', from: day }],
      registration: { ...registration, stage: 'first', checklistComplete: true, irpExpiresOn: undefined },
    }, { 'IRP-CHECKLIST': 'MET' });
    expect(path).toMatchObject({ status: 'MET', earliestDate: day });
    expect(checkOf(path.checks, 'IRP-RENEWAL-WINDOW')).toBeUndefined();
    expect(checkOf(path.checks, 'STAMP4-WORK-TIME')).toBeUndefined();
  });
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

  test('new ICT permits check the connected entity staff share and the statutory exemption', () => {
    const id = 'IE-STAMP4-57';
    const request: Partial<IrelandFullRequest> = {
      permissions: [{ kind: 'stamp1-ict', from: '2022-02-23' }],
      employmentStart: '2022-02-23',
    };
    const ict: IrelandWorkPermit = {
      ...permit,
      tier: 'ict',
      eeaStaffShare: 0.3,
      associatedEmployersAndAssignment: true,
      foreignEmploymentFrom: '2026-05-23',
      transferOn: day,
      eligibleAnnualRemuneration: 49523,
      eligibleHourlyRemuneration: 24.42,
    };
    const upgrade: IrelandWorkUpgrade = { ...work, basis: 'ict' };
    expect(
      checks(
        id,
        { ...request, work: { ...upgrade, permitApplication: ict } },
        { 'STAMP4-WORK-TIME': 'MET', B09: 'NOT_MET', B10: 'MET' },
      ),
    ).toMatchObject({ status: 'NOT_MET', earliestDate: undefined });
    for (const permitApplication of [
      { ...ict, eeaStaffShare: 0.5 },
      { ...ict, staffShareExemption: true },
    ]) {
      expect(
        checks(
          id,
          { ...request, work: { ...upgrade, permitApplication } },
          { B09: 'MET', B10: 'MET' },
        ),
      ).toMatchObject({ status: 'MET', earliestDate: day });
    }
  });

  test('CSEP renewal is inapplicable and quotes no underlying permit fee', () => {
    const path = checks(
      id,
      {
        ...shortClock,
        work: { ...work, permitApplication: { ...permit, renewal: true } },
      },
      { B07: 'MET', B10: 'NOT_MET' },
    );
    expect(path).toMatchObject({ status: 'MET', earliestDate: day });
    expect(checkOf(path.checks, 'B10')).toMatchObject({
      explanation: expect.stringContaining('not renewable'),
      sources: expect.arrayContaining([
        {
          srcId: 'SRC-393',
          locator: expect.stringContaining('reg. 7, Schedule 1'),
        },
      ]),
    });
    expect(checkOf(path.checks, 'B10')?.explanation).not.toContain('€1000');
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
    expect(checks(stamp, {
      permissions: [{ kind: 'stamp5', from: '2026-01-01', to: '2027-08-01' }],
      registration: { ...registration, irpExpiresOn: '2027-08-01', checklistComplete: true },
      stamp5: { ...stamp5, passportExpiresOn: '2027-08-01', renewWithPassport: true },
    }, { 'IRP-RENEWAL-WINDOW': 'NOT_MET' })).toMatchObject({
      status: 'FUTURE', earliestDate: '2027-05-09',
    });
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

  test('Stamp 5 IRP renewal uses its current checklist without the first application clock or bank statements', () => {
    for (const [checklistComplete, status] of [
      [true, 'MET'], [false, 'NOT_MET'], [undefined, 'UNKNOWN'],
    ] as const) {
      const path = checks('IE-STAMP5', {
        permissions: [{ kind: 'stamp5', from: '2026-01-01', to: '2026-12-01' }],
        registration: { stage: 'renewal', checklistComplete },
        stamp5: { grantReceived: true },
      }, { B28: status, 'IRP-RENEWAL-WINDOW': 'MET' });
      expect(checkOf(path.checks, 'WCATT-TIME')).toBeUndefined();
      expect(path).toMatchObject({ status, earliestDate: status === 'MET' ? day : undefined });
    }
  });

  test('Stamp 5 renewal checks the current Stamp and does not accept a revoked permission', () => {
    const request = {
      registration: { ...registration, stage: 'renewal', checklistComplete: true, irpExpiresOn: '2026-12-01' },
      stamp5: { grantReceived: true, passportAndIrpEvidence: true },
    } satisfies Partial<IrelandFullRequest>;
    for (const [kind, validPermission, status] of [
      ['stamp5', true, 'MET'],
      ['stamp5', false, 'NOT_MET'],
      ['stamp4', true, 'NOT_MET'],
      ['other', true, 'UNKNOWN'],
    ] as const) {
      expect(checks('IE-STAMP5', {
        ...request,
        permissions: [{ kind, from: '2026-01-01', to: '2026-12-01' }],
        registration: { ...request.registration, validPermission },
      }, { B28: status, 'IRP-RENEWAL-WINDOW': 'MET' })).toMatchObject({
        status, earliestDate: status === 'MET' ? day : undefined,
      });
    }
  });
});

const familyApplication: NonNullable<IrelandFamily['application']> = {
  date: day,
  channel: 'ordinary',
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
  insuranceRequiredForEntry: false,
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

  test('a five-year dependent Stamp 1G qualifies at the next renewal', () => {
    const request = {
      permissions: [{ kind: 'stamp1g-spouse', from: '2021-11-01' }],
      registration: { ...registration, irpExpiresOn: '2027-05-01' },
      family: {
        ...family,
        application: undefined,
        sponsorCategory: 'B',
        sponsorIrish: false,
        dependentPeriods: [{ from: '2021-11-01' }],
        nextRenewalOn: '2027-04-01',
      },
    } satisfies Partial<IrelandFullRequest>;
    expect(
      checks(independent, request, {
        'FAMILY-LEGACY-TIME': 'MET',
        B11: 'MET',
        B12: 'NOT_MET',
      }),
    ).toMatchObject({ status: 'FUTURE', earliestDate: '2027-04-01' });
    expect(
      checks(
        independent,
        { ...request, simulationDate: '2027-04-01' },
        { B11: 'MET', B12: 'MET' },
      ),
    ).toMatchObject({ status: 'MET', earliestDate: '2027-04-01' });
    expect(
      checks(
        independent,
        { ...request, family: { ...request.family, nextRenewalOn: undefined } },
        { B12: 'UNKNOWN' },
      ),
    ).toMatchObject({ status: 'UNKNOWN', earliestDate: undefined });
    expect(checks(independent, {
      ...request,
      registration: { ...registration, irpExpiresOn: '2027-08-01' },
    }, { B12: 'NOT_MET', 'IRP-RENEWAL-WINDOW': 'NOT_MET' })).toMatchObject({
      status: 'FUTURE', earliestDate: '2027-05-09',
    });
  });

  test('dependent Stamp 4 as the spouse of an Irish citizen counts for independence', () => {
    expect(
      checks(
        independent,
        {
          permissions: [{ kind: 'stamp4', from: '2021-11-01' }],
          family: {
            ...family,
            application: undefined,
            sponsorCategory: 'A',
            dependentPeriods: [{ from: '2021-11-01' }],
            nextRenewalOn: day,
          },
        },
        { 'FAMILY-LEGACY-TIME': 'NOT_MET', B11: 'MET', B12: 'MET' },
      ),
    ).toMatchObject({ status: 'MET', earliestDate: day });
  });

  test('an Irish sponsor can apply from abroad while intending to move back together', () => {
    const abroad: IrelandFamily = {
      ...family,
      sponsorLawfulAndResident: false,
      application: {
        ...familyApplication,
        channel: 'ordinary',
        insuranceRequiredForEntry: false,
      },
    };
    const path = checks(
      direct,
      { currentLocation: 'elsewhere', family: abroad },
      {
        'FAMILY-IRISH-SPONSOR': 'MET',
        'FAMILY-CHANNEL': 'MET',
        B14: 'MET',
        B15: 'MET',
        B20: 'MET',
      },
    );
    expect(path).toMatchObject({ status: 'MET', earliestDate: day });
    expect(checkOf(path.checks, 'B20')?.sources).toContainEqual({
      srcId: 'SRC-387',
      locator: 'June 2026 §§2–3, 12–15',
    });
    expect(
      checks(
        direct,
        {
          currentLocation: 'elsewhere',
          family: { ...abroad, intendsToLiveTogetherInState: false },
        },
        { B14: 'NOT_MET', B15: 'NOT_MET' },
      ),
    ).toMatchObject({ status: 'NOT_MET', earliestDate: undefined });
  });

  test('B14 distinguishes the Irish sponsor plans for a spouse conversion', () => {
    const request = {
      family: {
        ...family,
        relationship: 'spouse',
        sponsorLawfulAndResident: false,
        application: { ...familyApplication, channel: 'spouse-in-state' },
      },
    } satisfies Partial<IrelandFullRequest>;
    checks(direct, request, { B14: 'MET' });
    checks(
      direct,
      { family: { ...request.family, intendsToLiveTogetherInState: false } },
      { B14: 'NOT_MET' },
    );
  });

  test('Irish spouse applicants use the financial checks for their filing channel', () => {
    const application = {
      ...familyApplication,
      channel: 'spouse-in-state',
      applicantCharacter: good,
      grossTaxYears: [10000, 10000, 10000],
      chieflyOnStateSupportYears: 2,
      housing: { kind: 'excluded-public' },
    } satisfies NonNullable<IrelandFamily['application']>;
    const withPermission = {
      permissions: [{ kind: 'stamp1', from: '2025-01-01' }],
      family: { ...family, application },
    } satisfies Partial<IrelandFullRequest>;
    const conversion = checks(direct, withPermission, { B14: 'MET', B21: 'MET' });
    expect(conversion).toMatchObject({ status: 'MET', earliestDate: day });
    for (const id of ['B16', 'B17', 'B19']) expect(checkOf(conversion.checks, id)).toBeUndefined();
    expect(checks(direct, {
      ...withPermission,
      family: { ...family, application: { ...application, familyEvidenceComplete: undefined } },
    }, { B21: 'UNKNOWN' })).toMatchObject({ status: 'UNKNOWN', earliestDate: undefined });

    const withoutPermission = {
      permissions: [],
      registration: { ...registration, validPermission: false },
      family: { ...family, application: { ...application, spouseUnitUndueBurdenCleared: true } },
    } satisfies Partial<IrelandFullRequest>;
    const shortfall = checks(direct, withoutPermission, { B14: 'MET', B16: 'MET', B17: 'NOT_MET', B21: 'MET' });
    expect(shortfall).toMatchObject({ status: 'NOT_MET', earliestDate: undefined });
    expect(checkOf(shortfall.checks, 'B19')).toBeUndefined();
    const meetsSpouseUnit = { ...withoutPermission.family.application, grossTaxYears: [10000, 15000, 15000] };
    expect(checks(direct, {
      ...withoutPermission,
      family: { ...family, application: meetsSpouseUnit },
    }, { B16: 'MET', B17: 'MET' })).toMatchObject({ status: 'MET', earliestDate: day });
    expect(checks(direct, {
      ...withoutPermission,
      family: { ...family, application: { ...meetsSpouseUnit, spouseUnitUndueBurdenCleared: undefined } },
    }, { B16: 'UNKNOWN', B17: 'MET' })).toMatchObject({ status: 'UNKNOWN', earliestDate: undefined });
    expect(checks(direct, {
      ...withoutPermission,
      registration: { ...withoutPermission.registration, renewalPending: true },
    }, { B14: 'UNKNOWN', B21: 'UNKNOWN' }))
      .toMatchObject({ status: 'UNKNOWN', earliestDate: undefined, pendingDetails: expect.arrayContaining(['PD-330']) });
    expect(checks(direct, {
      family: { ...family, application: { ...meetsSpouseUnit, channel: 'ordinary' } },
    }, { B16: 'NOT_MET', B17: 'NOT_MET', B19: 'NOT_MET' }))
      .toMatchObject({ status: 'NOT_MET', earliestDate: undefined });
  });

  const spouseConversionApplication = {
    ...familyApplication,
    channel: 'spouse-in-state',
    spouseInStateEntry: 'with-permission',
    applicantCharacter: good,
  } satisfies NonNullable<IrelandFamily['application']>;
  const spouseConversion = {
    permissions: [{ kind: 'stamp1', from: '2025-01-01', to: '2027-06-01' }],
    registration: { ...registration, irpExpiresOn: '2027-06-01' },
    family: { ...family, application: spouseConversionApplication },
  } satisfies Partial<IrelandFullRequest>;

  test.each([
    [day, 'FUTURE', 'NOT_MET'],
    ['2027-03-08', 'FUTURE', 'NOT_MET'],
    ['2027-03-09', 'MET', 'MET'],
  ] as const)('Irish spouse online conversion uses the current IRP renewal window on %s', (simulationDate, status, windowStatus) => {
    expect(checks(direct, { ...spouseConversion, simulationDate }, {
      B21: 'MET', 'IRP-RENEWAL-WINDOW': windowStatus,
    })).toMatchObject({ status, earliestDate: '2027-03-09' });
  });

  test.each([
    ['2027-03-06', '2027-03-09'],
    ['2027-03-12', '2027-03-12'],
  ] as const)('Irish spouse online conversion accounts for the return on %s and the IRP opening date', (returned, earliestDate) => {
    expect(checks(direct, {
      ...spouseConversion,
      simulationDate: '2027-03-05',
      currentLocation: 'elsewhere',
      trips: [{ departed: '2027-03-04', returned }],
    }, { B21: 'NOT_MET', 'IRP-RENEWAL-WINDOW': 'NOT_MET' }))
      .toMatchObject({ status: 'FUTURE', earliestDate });
  });

  test.each([
    [{ validPermission: false }, 'NOT_MET'],
    [{ irpExpiresOn: '2026-11-15' }, 'NOT_MET'],
    [{ irpExpiresOn: '2026-11-15', validPermission: false }, 'NOT_MET'],
    [{ irpExpiresOn: '2026-11-15', validPermission: false, renewalPending: true }, 'UNKNOWN'],
  ] as const)('Irish spouse online conversion checks current permission (%j)', (permission, status) => {
    const conversion = checks(direct, {
      ...spouseConversion,
      registration: { ...spouseConversion.registration, ...permission },
    }, { B14: status, B21: status });
    expect(conversion).toMatchObject({ status, earliestDate: undefined });
    if (status === 'UNKNOWN') expect(conversion.pendingDetails).toContain('PD-330');
  });

  test('Irish spouse online conversion needs a confirmed IRP expiry to calculate its window', () => {
    const conversion = checks(direct, {
      ...spouseConversion,
      permissions: [{ kind: 'stamp1', from: '2025-01-01' }],
      registration: { ...registration, irpExpiresOn: undefined },
    }, { 'IRP-RENEWAL-WINDOW': 'UNKNOWN' });
    expect(conversion).toMatchObject({ status: 'UNKNOWN', earliestDate: undefined });
    expect(conversion.pendingDetails).toContain('PD-321');
  });

  test.each([
    [undefined, 'UNKNOWN'],
    [{ coversRequiredPeople: false }, 'NOT_MET'],
  ] as const)('Irish spouse online conversion and first registration use different insurance checks (%j)', (insurance, firstStatus) => {
    const application = { ...spouseConversionApplication, insurance };
    expect(checks(direct, {
      permissions: [{ kind: 'stamp1', from: '2025-01-01', to: '2027-01-01' }],
      family: { ...family, application },
    }, { B21: 'MET', 'IRP-RENEWAL-WINDOW': 'MET' })).toMatchObject({ status: 'MET', earliestDate: day });
    const first = checks(direct, {
      permissions: [],
      registration: undefined,
      family: { ...family, application: { ...application, channel: 'spouse-registration', registrationStage: 'first' } },
    }, { B21: firstStatus });
    expect(first).toMatchObject({ status: firstStatus, earliestDate: undefined });
    expect(checkOf(first.checks, 'IRP-RENEWAL-WINDOW')).toBeUndefined();
  });

  test('a previous grant for a different partner needs individual confirmation for in-State conversion', () => {
    const application = {
      ...familyApplication,
      differentPartnerGrantOn: '2023-03-01',
      applicantCharacter: good,
    } satisfies NonNullable<IrelandFamily['application']>;
    const conversion = checks(direct, {
      permissions: [{ kind: 'stamp1', from: '2025-01-01', to: '2027-01-01' }],
      family: { ...family, application: { ...application, channel: 'spouse-in-state', spouseInStateEntry: 'with-permission' } },
    }, { B15: 'UNKNOWN', B21: 'MET' });
    expect(conversion).toMatchObject({ status: 'UNKNOWN', earliestDate: undefined });
    expect(checkOf(conversion.checks, 'B15')?.pendingDetails).toContain('PD-330');
    expect(checks(direct, { family: { ...family, application } }, { B15: 'NOT_MET' }))
      .toMatchObject({ status: 'NOT_MET', earliestDate: undefined });
  });

  test.each([
    ['spouse-in-state', 'spouse', 'B21'],
    ['de-facto-in-state', 'de-facto', 'B22'],
  ] as const)('%s conversion can be filed in the State or after return from a trip', (channel, relationship, check) => {
    const returned = '2026-11-28';
    const request = {
      permissions: [{ kind: 'stamp1', from: '2026-01-01', to: '2027-01-01' }],
      family: {
        ...family,
        relationship,
        cohabitationFrom: '2024-01-01',
        application: {
          ...familyApplication,
          channel,
          noSocialWelfare: true,
          applicantCharacter: good,
          sponsorCharacter: good,
          policeCertificates: { allRequiredCountriesCovered: true, issueDates: ['2026-08-01'] },
        },
      },
    } satisfies Partial<IrelandFullRequest>;
    const trip = [{ departed: '2026-11-20', returned }];
    expect(checks(direct, request, { B14: 'MET', [check]: 'MET' }))
      .toMatchObject({ status: 'MET', earliestDate: day });
    expect(checks(direct, { ...request, currentLocation: 'elsewhere', trips: trip }, {
      B14: 'NOT_MET', [check]: 'NOT_MET',
    })).toMatchObject({ status: 'FUTURE', earliestDate: returned });
    expect(checks(direct, { ...request, currentLocation: 'elsewhere' }, {
      B14: 'UNKNOWN', [check]: 'UNKNOWN',
    })).toMatchObject({ status: 'UNKNOWN', earliestDate: undefined });
    expect(checks(direct, { ...request, simulationDate: returned, trips: trip }, {
      B14: 'MET', [check]: 'MET',
    })).toMatchObject({ status: 'MET', earliestDate: returned });
    expect(checks(direct, {
      ...request, currentLocation: 'elsewhere', trips: trip,
      family: { ...request.family, application: { ...request.family.application, entryOrConversionValid: false } },
    }, { B14: 'NOT_MET' })).toMatchObject({ status: 'NOT_MET', earliestDate: undefined });
    expect(checks(direct, {
      ...request, currentLocation: 'elsewhere', trips: trip,
      family: { ...request.family, application: { ...request.family.application, entryOrConversionValid: undefined } },
    }, { B14: 'UNKNOWN' })).toMatchObject({ status: 'UNKNOWN', earliestDate: undefined });

    const abroad = { ...request, currentLocation: 'elsewhere', trips: trip } as const;
    const permission = request.permissions[0];
    const expired = { ...abroad, permissions: [{ ...permission, to: '2026-11-26' }] };
    const expiredCard = { ...registration, irpExpiresOn: '2026-11-26' };
    for (const input of [
      expired,
      { ...abroad, permissions: [{ ...permission, to: '2026-11-22' }] },
      { ...abroad, permissions: [{ kind: permission.kind, from: permission.from }], registration: expiredCard },
      { ...abroad, permissions: [
        { kind: permission.kind, from: permission.from },
        { kind: 'other', from: '2026-11-27' },
      ] },
    ] satisfies Partial<IrelandFullRequest>[]) {
      const blocked = checks(direct, input, { B14: 'UNKNOWN', [check]: 'UNKNOWN' });
      expect(blocked).toMatchObject({ status: 'UNKNOWN', earliestDate: undefined });
      expect(blocked.pendingDetails).toContain('PD-330');
    }
    expect(result(direct, {
      ...abroad, permissions: [{ ...permission, to: returned }],
      registration: { ...registration, irpExpiresOn: returned },
    })).toMatchObject({ status: 'FUTURE', earliestDate: returned });
    expect(result(direct, { ...abroad, permissions: [] }))
      .toMatchObject({ status: 'FUTURE', earliestDate: returned });
    for (const [date, valid, status] of [
      [returned, true, 'FUTURE'],
      [returned, false, 'NOT_MET'],
      ['2026-11-27', true, 'UNKNOWN'],
    ] as const) {
      const before = {
        ...expired,
        registration: expiredCard,
        family: {
          ...request.family,
          application: {
            ...request.family.application,
            entryOrConversionValid: undefined,
            entryOrConversionOnReturn: { date, valid },
          },
        },
      };
      expect(result(direct, before)).toMatchObject({ status, earliestDate: status === 'FUTURE' ? returned : undefined });
      const after = {
        ...before,
        simulationDate: returned,
        currentLocation: 'state',
        permissions: [...expired.permissions, { ...permission, from: returned }],
        registration: { ...registration, registrationDate: returned },
      } satisfies Partial<IrelandFullRequest>;
      const afterStatus = status === 'FUTURE' ? 'MET' : status;
      expect(checks(direct, after, { B14: afterStatus, [check]: afterStatus }))
        .toMatchObject({ status: afterStatus, earliestDate: afterStatus === 'MET' ? returned : undefined });
    }
  });

  const spouseRenewal: IrelandFamily = {
    relationship: 'spouse',
    sponsorIrish: true,
    livingTogether: true,
    establishedFamilyPermission: true,
    application: {
      channel: 'spouse-registration',
      registrationStage: 'renewal',
      // SRC-384 Stamp 4 (3): both passports, current IRP, certificate and joint address.
      familyEvidenceComplete: true,
      addressEvidence: true,
      renewalInsuranceRequired: false,
    },
  };

  test('ordinary Irish spouse renewal uses the renewal checklist and requires presence in Ireland', () => {
    const path = checks(
      direct,
      { family: spouseRenewal },
      { B01: 'MET', B02: 'MET', B21: 'MET' },
    );
    expect(path).toMatchObject({ status: 'MET', earliestDate: day });
    expect(path.checks.map(({ id }) => id)).toEqual([
      'IE-IRP-RENEWAL-WINDOW', 'IE-FAMILY-IRISH-SPONSOR', 'IE-B21', 'IE-B01', 'IE-B02',
    ]);
    expect(checkOf(path.checks, 'B02')?.explanation).toContain('€0');
    for (const [establishedFamilyPermission, status] of [
      [false, 'NOT_MET'], [undefined, 'UNKNOWN'],
    ] as const) {
      expect(checks(direct, { family: { ...spouseRenewal, establishedFamilyPermission } }, {
        B01: 'MET', B21: status,
      })).toMatchObject({ status, earliestDate: undefined });
    }
    for (const [location, status] of [
      ['elsewhere', 'NOT_MET'],
      ['northern-ireland', 'NOT_MET'],
      [undefined, 'UNKNOWN'],
    ] as const) {
      expect(
        checks(
          direct,
          { currentLocation: location, family: spouseRenewal },
          { B21: status },
        ),
      ).toMatchObject({ status, earliestDate: undefined });
    }
  });

  test('Irish spouse renewal opens exactly twelve weeks before the current IRP expires', () => {
    const request = {
      permissions: [{ kind: 'stamp4', from: '2026-08-01', to: '2027-08-01' }],
      registration: { ...registration, irpExpiresOn: undefined },
      family: spouseRenewal,
    } satisfies Partial<IrelandFullRequest>;
    for (const simulationDate of [day, '2027-05-08', '2027-05-09'] as const) {
      const atOpening = simulationDate === '2027-05-09';
      expect(checks(direct, { ...request, simulationDate }, {
        'IRP-RENEWAL-WINDOW': atOpening ? 'MET' : 'NOT_MET', B21: 'MET',
      })).toMatchObject({
        status: atOpening ? 'MET' : 'FUTURE',
        earliestDate: '2027-05-09',
      });
    }
    expect(checks(direct, {
      ...request, permissions: [{ kind: 'stamp4', from: '2026-08-01' }],
    }, { 'IRP-RENEWAL-WINDOW': 'UNKNOWN' })).toMatchObject({
      status: 'UNKNOWN', earliestDate: undefined,
    });
    expect(checks(direct, {
      ...request, simulationDate: '2027-05-08', currentLocation: 'elsewhere',
    }, { 'IRP-RENEWAL-WINDOW': 'NOT_MET', B21: 'NOT_MET' })).toMatchObject({
      status: 'NOT_MET', earliestDate: undefined,
    });
  });

  test('first Irish spouse registration after Join Family entry uses only the registration checklist', () => {
    const application = {
      channel: 'spouse-registration',
      registrationStage: 'first',
      entryOrConversionValid: true,
      familyEvidenceComplete: true,
      addressEvidence: true,
      insurance: familyApplication.insurance,
    } as const;
    const request = {
      registration: undefined,
      family: { relationship: 'spouse', sponsorIrish: true, livingTogether: true, application },
    } satisfies Partial<IrelandFullRequest>;
    const path = checks(direct, request, { B21: 'MET' });
    expect(path).toMatchObject({ status: 'MET', earliestDate: day });
    expect(path.checks.map(({ id }) => id)).toEqual([
      'IE-FAMILY-IRISH-SPONSOR', 'IE-FAMILY-CHANNEL', 'IE-B21', 'IE-B02',
    ]);
    expect(checks(direct, {
      ...request,
      family: { ...request.family, application: { ...application, insurance: undefined } },
    }, { B21: 'UNKNOWN' })).toMatchObject({ status: 'UNKNOWN', earliestDate: undefined });
    expect(checks(direct, {
      ...request, currentLocation: 'elsewhere',
    }, { B21: 'NOT_MET' })).toMatchObject({ status: 'NOT_MET', earliestDate: undefined });
    expect(checks(direct, {
      ...request,
      family: { ...request.family, application: { ...application, registrationStage: undefined } },
    }, { B21: 'MET' })).toMatchObject({ status: 'MET', earliestDate: day });
  });

  test.each([
    ['IE-STAMP4-IRISH-FAMILY', 'de-facto', 'de-facto-overseas', true],
    ['IE-STAMP4-INDEPENDENT-FAMILY', 'spouse', 'ordinary', false],
    ['IE-STAMP4-INDEPENDENT-FAMILY', 'child', 'ordinary', false],
  ] as const)('first family registration uses the granted checklist for %s (%s)', (id, relationship, channel, sponsorIrish) => {
    const family: IrelandFamily = {
      relationship, sponsorIrish, livingTogether: true,
      application: {
        channel,
        registrationStage: 'first',
        entryOrConversionValid: true,
        familyEvidenceComplete: true,
        addressEvidence: true,
      },
    };
    const path = checks(id, { family }, { 'FAMILY-FIRST-REGISTRATION': 'MET' });
    expect(path).toMatchObject({ status: 'MET', earliestDate: day });
    expect(checkOf(path.checks, 'B14')).toBeUndefined();
    expect(checkOf(path.checks, 'B23')).toBeUndefined();
    expect(checkOf(path.checks, 'FAMILY-LEGACY-TIME')).toBeUndefined();
  });

  test('ordinary spouse renewal checks the documents and any permission-specific insurance', () => {
    for (const [evidence, status] of [
      [{ familyEvidenceComplete: false }, 'NOT_MET'],
      [{ addressEvidence: false }, 'NOT_MET'],
      [{ renewalInsuranceRequired: true }, 'UNKNOWN'],
      [{ renewalInsuranceRequired: true, renewalInsuranceConditionMet: false }, 'NOT_MET'],
      [{ renewalInsuranceRequired: true, renewalInsuranceConditionMet: true }, 'MET'],
    ] as const) {
      const application = { ...spouseRenewal.application, ...evidence };
      expect(
        checks(
          direct,
          { family: { ...spouseRenewal, application } },
          { B21: status },
        ),
      ).toMatchObject({ status, earliestDate: status === 'MET' ? day : undefined });
    }
    expect(
      checks(
        direct,
        { family: { ...family, application: { ...familyApplication, channel: 'spouse-registration', insurance: undefined } } },
        { B21: 'UNKNOWN' },
      ),
    ).toMatchObject({ status: 'UNKNOWN', earliestDate: undefined });
  });

  test.each([
    ['ordinary', 'spouse', 'B21'],
    ['spouse-in-state', 'civil-partner', 'B21'],
    ['de-facto-in-state', 'de-facto', 'FAMILY-RENEWAL'],
    ['de-facto-overseas', 'de-facto', 'FAMILY-RENEWAL'],
  ] as const)('ordinary renewal after the %s channel uses the current Stamp 4 checklist', (channel, relationship, check) => {
    // SRC-384 Stamp 4 (3), (7): current IRP, both passports, joint address,
    // relationship evidence and (for de facto) the permission letter if applicable.
    const renewal: IrelandFamily = {
      relationship,
      sponsorIrish: true,
      livingTogether: true,
      establishedFamilyPermission: true,
      application: {
        channel,
        registrationStage: 'renewal',
        familyEvidenceComplete: true,
        addressEvidence: true,
        renewalInsuranceRequired: false,
      },
    };
    const path = checks(direct, { family: renewal }, { [check]: 'MET' });
    expect(path).toMatchObject({ status: 'MET', earliestDate: day });
    expect(path.checks.map(({ id }) => id)).toEqual([
      'IE-IRP-RENEWAL-WINDOW', 'IE-FAMILY-IRISH-SPONSOR', `IE-${check}`, 'IE-B01', 'IE-B02',
    ]);
    expect(
      checks(
        direct,
        { currentLocation: 'elsewhere', family: renewal },
        { [check]: 'NOT_MET' },
      ),
    ).toMatchObject({ status: 'NOT_MET', earliestDate: undefined });
  });

  test('ordinary dependent renewal uses the applicable checklist without meeting the Stamp 4 upgrade clock', () => {
    // SRC-384 Stamp 1G (1): both passports and IRPs, sponsor permit and
    // continuing de facto proof where applicable.
    const dependent: IrelandFamily = {
      relationship: 'de-facto',
      sponsorIrish: false,
      establishedFamilyPermission: true,
      application: {
        channel: 'ordinary',
        registrationStage: 'renewal',
        familyEvidenceComplete: true,
      },
    };
    const input = {
      permissions: [{ kind: 'stamp1g-spouse', from: '2026-11-01' }],
      family: dependent,
    } satisfies Partial<IrelandFullRequest>;
    const path = checks(independent, input, { B01: 'MET', 'FAMILY-RENEWAL': 'MET' });
    expect(path).toMatchObject({ status: 'MET', earliestDate: day });
    expect(path.title).toBe('Renewal of existing family permission');
    expect(path.checks.map(({ id }) => id)).toEqual([
      'IE-IRP-RENEWAL-WINDOW', 'IE-FAMILY-RENEWAL', 'IE-B01', 'IE-B02',
    ]);
    expect(
      checks(independent, {
        ...input,
        registration: { ...registration, irpExpiresOn: '2027-08-01' },
      }, { 'IRP-RENEWAL-WINDOW': 'NOT_MET' }),
    ).toMatchObject({ status: 'FUTURE', earliestDate: '2027-05-09' });
    expect(
      checks(
        independent,
        { ...input, currentLocation: 'elsewhere' },
        { 'FAMILY-RENEWAL': 'NOT_MET' },
      ),
    ).toMatchObject({ status: 'NOT_MET', earliestDate: undefined });
  });

  test('a child who has aged out at the independent Stamp 4 renewal stays under PD-329', () => {
    const input = {
      dateOfBirth: '2009-01-01',
      registration: { ...registration, irpExpiresOn: '2027-05-01' },
      family: {
        relationship: 'child',
        childUnmarriedDependent: true,
        establishedFamilyPermission: true,
        sponsorLawfulAndResident: true,
        dependentPeriods: [{ from: '2021-11-01' }],
        nextRenewalOn: '2027-04-01',
      },
    } satisfies Partial<IrelandFullRequest>;
    expect(
      checks(independent, input, { B11: 'MET', B12: 'NOT_MET' }),
    ).toMatchObject({ status: 'FUTURE', earliestDate: '2027-04-01' });
    const atRenewal = checks(
      independent,
      { ...input, simulationDate: '2027-04-01' },
      { B11: 'UNKNOWN', B12: 'MET' },
    );
    expect(atRenewal).toMatchObject({ status: 'UNKNOWN', earliestDate: undefined });
    expect(checkOf(atRenewal.checks, 'B11')?.pendingDetails).toContain('PD-329');
  });

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
    expect(checks(direct, {
      family: { ...partner, application: { ...app, differentPartnerGrantOn: '2023-03-01' } },
    }, { B15: 'UNKNOWN', B22: 'MET' }))
      .toMatchObject({ status: 'UNKNOWN', earliestDate: undefined, pendingDetails: expect.arrayContaining(['PD-330']) });
    expect(checks(direct, {
      currentLocation: 'elsewhere',
      family: { ...partner, sponsorLawfulAndResident: false, application: app },
    }, { B14: 'NOT_MET', B22: 'NOT_MET' })).toMatchObject({
      status: 'NOT_MET', earliestDate: undefined,
    });
    expect(checks(direct, {
      family: { ...partner, sponsorLawfulAndResident: false, application: app },
    }, { B14: 'NOT_MET', B22: 'NOT_MET' })).toMatchObject({
      status: 'NOT_MET', earliestDate: undefined,
    });
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
    const returning = {
      ...partner,
      cohabitationFrom: '2024-11-01',
      sponsorLawfulAndResident: false,
      intendsToLiveTogetherInState: true,
      application: abroad,
    } satisfies IrelandFamily;
    expect(
      checks(
        direct,
        { currentLocation: 'elsewhere', family: returning },
        { B14: 'MET', B15: 'MET', B19: 'MET', B23: 'MET' },
      ),
    ).toMatchObject({ status: 'MET', earliestDate: day });
    expect(
      checks(
        direct,
        { currentLocation: 'elsewhere', family: { ...returning, intendsToLiveTogetherInState: false } },
        { B14: 'NOT_MET', B23: 'MET' },
      ),
    ).toMatchObject({ status: 'NOT_MET', earliestDate: undefined });
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
    largestCalendarYearAbsenceDays: 90,
    tripsPermittedOrExceptionConfirmed: true,
    workEffortsAndResidence: true,
    previousGrantYearsEvidence: true,
  },
};

describe('Ireland Long Term Residency', () => {
  test.each(['IE-LTR-PRINCIPAL', 'IE-LTR-FAMILY'] as const)(
    '%s renews using the current grant and previous grant evidence without first application history',
    (id) => {
      const request = {
        permissions: [{
          kind: id === 'IE-LTR-PRINCIPAL' ? 'stamp4' : 'stamp3',
          from: '2021-12-01',
          to: '2026-12-01',
        }],
        registration: { stage: 'renewal', irpExpiresOn: '2026-12-01' },
        ltr: {
          validPermission: true,
          family: id === 'IE-LTR-FAMILY' ? {
            eligibleDependentRelationship: true,
            principalHoldsLtr: true,
          } : undefined,
          maintenance: { previousGrantYearsEvidence: true },
        },
      } satisfies Partial<IrelandFullRequest>;
      const path = checks(id, request, { C04: 'MET', C08: 'MET', 'IRP-RENEWAL-WINDOW': 'MET' });
      expect(path).toMatchObject({ status: 'MET', earliestDate: day });
      expect(checkOf(path.checks, 'C01')).toBeUndefined();
      expect(checkOf(path.checks, 'C03')).toBeUndefined();
      expect(checks(id, {
        ...request,
        ltr: { ...request.ltr, validPermission: undefined },
      }, { C04: 'UNKNOWN' })).toMatchObject({ status: 'UNKNOWN', earliestDate: undefined });
      expect(checks(id, {
        ...request,
        ltr: { ...request.ltr, validPermission: false },
        registration: { ...request.registration, validPermission: true },
      }, { C04: 'NOT_MET' })).toMatchObject({ status: 'NOT_MET', earliestDate: undefined });
      expect(checks(id, {
        ...request,
        registration: { ...request.registration, validPermission: false },
      }, { C04: 'NOT_MET' })).toMatchObject({ status: 'NOT_MET', earliestDate: undefined });
      expect(checks(id, {
        ...request,
        ltr: { ...request.ltr, burden: { benefit: 'means-tested' } },
      }, { C05: 'UNKNOWN' })).toMatchObject({ status: 'UNKNOWN', earliestDate: undefined });
    },
  );

  test.each(['IE-LTR-PRINCIPAL', 'IE-LTR-FAMILY'] as const)(
    '%s renewal uses the current IRP opening date',
    (id) => {
      const request = {
        simulationDate: '2027-05-08',
        registration: { ...registration, stage: 'renewal', irpExpiresOn: '2027-08-01' },
        ltr: {
          ...ltr,
          family: {
            eligibleDependentRelationship: true,
            principalHoldsLtr: true,
            principalQualifyingPeriods: [{ from: '2020-01-01' }],
            dependentRegisteredPeriods: [{ from: '2021-11-23' }],
          },
        },
      } satisfies Partial<IrelandFullRequest>;
      expect(checks(id, request, { 'IRP-RENEWAL-WINDOW': 'NOT_MET' }))
        .toMatchObject({ status: 'FUTURE', earliestDate: '2027-05-09' });
      expect(checks(id, { ...request, simulationDate: '2027-05-09' }, {
        'IRP-RENEWAL-WINDOW': 'MET',
      })).toMatchObject({ status: 'MET', earliestDate: '2027-05-09' });
      for (const previousGrantYearsEvidence of [false, undefined]) {
        const status = previousGrantYearsEvidence === false ? 'NOT_MET' : 'UNKNOWN';
        for (const simulationDate of ['2027-05-08', '2027-05-09']) {
          expect(checks(id, {
            ...request,
            simulationDate,
            ltr: {
              ...request.ltr,
              maintenance: { ...ltr.maintenance, previousGrantYearsEvidence },
            },
          }, {
            C08: status,
            'IRP-RENEWAL-WINDOW': simulationDate === '2027-05-08' ? 'NOT_MET' : 'MET',
          })).toMatchObject({ status, earliestDate: undefined });
        }
      }
    },
  );

  test('an explicit LTR renewal requires evidence even without a maintenance record', () => {
    expect(checks('IE-LTR-PRINCIPAL', {
      registration: { ...registration, stage: 'renewal' },
      ltr: { ...ltr, maintenance: undefined },
    }, { C08: 'UNKNOWN', 'IRP-RENEWAL-WINDOW': 'MET' }))
      .toMatchObject({ status: 'UNKNOWN', earliestDate: undefined });
  });

  test('uncertain conversion of partial months in split registrations is reported as PD-335', () => {
    const path = checks(
      'IE-LTR-PRINCIPAL',
      {
        ltr: {
          ...ltr,
          registeredPeriods: [
            {
              from: '2019-01-01',
              to: '2021-01-14',
              basis: 'hosting',
              evidence: true,
            },
            {
              from: '2023-01-01',
              to: '2025-12-15',
              basis: 'hosting-stamp4',
              evidence: true,
            },
          ],
        },
      },
      { C01: 'UNKNOWN', C02: 'MET' },
    );
    expect(path).toMatchObject({ status: 'UNKNOWN', earliestDate: undefined });
    expect(checkOf(path.checks, 'C01')?.pendingDetails).toContain('PD-335');
  });

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

const permanentCard: IrelandTreatyResidence = {
  ...eu,
  role: 'family',
  nonEuFamily: true,
  relationship: 'spouse',
  qualifyingSponsor: true,
  relationshipEvidence: true,
  activities: [{ from: '2018-11-23', basis: 'family', verified: true }],
  document: {
    ...eu.document,
    priorPermanentRightOn: '2023-11-23',
    currentCardCategory: 'permanent',
    currentCardExpiresOn: '2026-12-01',
  },
  wa: { britishOrQualifyingFamily: true, recognisedWaScope: true },
};

describe('Ireland EU Treaty Rights and the Withdrawal Agreement', () => {
  const id = 'IE-EU-PERMANENT';
  const waId = 'IE-WA-PERMANENT';

  test.each([
    [id, 'eu', 'D06', 'D08'],
    [waId, 'wa', 'E03', 'E02'],
  ] as const)('%s renews an existing card without re-proving acquisition', (path, key, check, right) => {
    const document = { currentCardCategory: 'permanent' as const, currentCardExpiresOn: '2026-12-01', identityAndResidenceEvidence: true };
    const request = {
      registration: { stage: 'renewal' },
      [key]: { document },
    } satisfies Partial<IrelandFullRequest>;
    expect(checks(path, request, { [check]: 'MET', 'IRP-RENEWAL-WINDOW': 'MET' }))
      .toMatchObject({ status: 'MET', earliestDate: day });
    expect(checks(path, {
      ...request,
      [key]: { document: { ...document, publicInterest: 'restricting-order' } },
    }, { 'TREATY-RESTRICTION': 'NOT_MET' }))
      .toMatchObject({ status: 'NOT_MET', earliestDate: undefined });
    expect(checks(path, {
      ...request,
      [key]: { document: { ...document, postGrantAbsence: { from: '2019-01-01', returnedOn: '2025-01-01' } } },
    }, { [right]: 'UNKNOWN' })).toMatchObject({ status: 'UNKNOWN', earliestDate: undefined });
  });

  test.each([
    [id, 'eu', 'D06', 'D03'],
    [waId, 'wa', 'E03', 'E02'],
  ] as const)('%s requires a permanent card before skipping initial residence requirements', (path, key, check, residence) => {
    const treaty: IrelandTreatyResidence = {
      ...permanentCard,
      activities: [{ from: '2023-12-01', basis: 'family', verified: true }],
    };
    const request = {
      registration: { ...registration, stage: 'renewal', irpExpiresOn: undefined },
    } satisfies Partial<IrelandFullRequest>;
    for (const [currentCardCategory, validPermission, status] of [
      ['ordinary', true, 'NOT_MET'],
      ['permanent', true, 'MET'],
      [undefined, true, 'UNKNOWN'],
      ['permanent', false, 'NOT_MET'],
    ] as const) {
      expect(checks(path, {
        ...request,
        registration: { ...request.registration, validPermission },
        [key]: {
          ...treaty,
          document: { ...permanentCard.document, priorPermanentRightOn: undefined, currentCardCategory },
        },
      }, { [check]: status, [residence]: 'NOT_MET', 'IRP-RENEWAL-WINDOW': 'MET' }))
        .toMatchObject({ status, earliestDate: status === 'MET' ? day : undefined });
    }
  });

  test.each([
    [id, 'eu', 'D06'],
    [waId, 'wa', 'E03'],
  ] as const)('%s uses the renewal window only with complete card evidence', (path, key, check) => {
    const previousDay = '2027-05-08';
    const openDay = '2027-05-09';
    const document = { ...permanentCard.document, currentCardExpiresOn: '2027-08-01' };
    const request = {
      registration: { ...registration, stage: 'renewal', irpExpiresOn: undefined },
      [key]: { ...permanentCard, document },
    } satisfies Partial<IrelandFullRequest>;
    for (const [simulationDate, windowStatus, status] of [
      [previousDay, 'NOT_MET', 'FUTURE'],
      [openDay, 'MET', 'MET'],
    ] as const) {
      expect(checks(path, { ...request, simulationDate }, {
        [check]: 'MET', 'IRP-RENEWAL-WINDOW': windowStatus,
      })).toMatchObject({ status, earliestDate: openDay });
      expect(checks(path, {
        ...request,
        simulationDate,
        [key]: {
          ...permanentCard,
          document: { ...document, identityAndResidenceEvidence: false },
        },
      }, { [check]: 'NOT_MET', 'IRP-RENEWAL-WINDOW': windowStatus }))
        .toMatchObject({ status: 'NOT_MET', earliestDate: undefined });
    }
    expect(checks(path, {
      [key]: {
        ...permanentCard,
        document: { ...permanentCard.document, identityAndResidenceEvidence: false },
      },
    }, { [check]: 'NOT_MET' })).toMatchObject({ status: 'MET', earliestDate: day });
  });

  test('a non-EU spouse cannot count GEP residence before qualifying as an EU family member', () => {
    const residence: IrelandTreatyResidence = {
      ...eu,
      role: 'family',
      nonEuFamily: true,
      relationship: 'spouse',
      qualifyingSponsor: true,
      relationshipEvidence: true,
      activities: [
        { from: '2020-01-01', to: '2025-05-31', basis: 'employed', verified: true },
        { from: '2025-06-01', basis: 'family', verified: true },
      ],
    };
    expect(
      checks(id, { eu: residence }, { D01: 'MET', D02: 'MET', D03: 'NOT_MET', D08: 'UNKNOWN' }),
    ).toMatchObject({ status: 'NOT_MET', earliestDate: undefined });
    expect(
      checks(
        id,
        { simulationDate: '2030-05-31', eu: residence },
        { D03: 'NOT_MET', D08: 'UNKNOWN' },
      ),
    ).toMatchObject({ status: 'NOT_MET', earliestDate: undefined });
    expect(
      checks(
        id,
        { simulationDate: '2030-06-01', eu: residence },
        { D03: 'MET', D08: 'MET' },
      ),
    ).toMatchObject({ status: 'MET', earliestDate: '2030-06-01' });
  });

  test('WA family residence can span the transition but cannot include earlier ordinary work', () => {
    const residence: IrelandTreatyResidence = {
      ...eu,
      role: 'family',
      nonEuFamily: true,
      activities: [
        { from: '2016-01-01', to: '2020-11-30', basis: 'employed', verified: true },
        { from: '2020-12-01', basis: 'family', verified: true },
      ],
      wa: {
        britishOrQualifyingFamily: true,
        relevantStart: '2020-12-01T00:00:00Z',
        protectedBeforeAndContinued: true,
        familyCategory: 'already-resident',
        qualifyingFamilyEventConfirmed: true,
      },
    };
    expect(
      checks(
        waId,
        { simulationDate: '2025-11-30', wa: residence },
        { E01: 'MET', E02: 'NOT_MET' },
      ),
    ).toMatchObject({ status: 'NOT_MET', earliestDate: undefined });
    expect(
      checks(
        waId,
        { simulationDate: '2025-12-01', wa: residence },
        { E01: 'MET', E02: 'MET' },
      ),
    ).toMatchObject({ status: 'MET', earliestDate: '2025-12-01' });
  });

  test('a permitted four-month trip bridges the gap between qualifying jobs', () => {
    const residence: IrelandTreatyResidence = {
      ...eu,
      activities: [
        {
          from: '2020-01-01',
          to: '2022-07-31',
          basis: 'employed',
          verified: true,
        },
        { from: '2022-12-01', basis: 'employed', verified: true },
      ],
      absences: [
        { leftOn: '2022-08-01', returnedOn: '2022-12-01', reason: 'temporary' },
      ],
    };
    expect(
      checks(id, { eu: residence }, { D02: 'MET', D03: 'MET', D08: 'MET' }),
    ).toMatchObject({ status: 'MET', earliestDate: day });
    expect(
      checks(
        id,
        { eu: residence, simulationDate: '2025-01-01' },
        { D03: 'MET', D08: 'MET' },
      ),
    ).toMatchObject({ status: 'MET', earliestDate: '2025-01-01' });
    expect(
      checks(
        id,
        { eu: residence, simulationDate: '2024-12-31' },
        { D03: 'NOT_MET', D08: 'UNKNOWN' },
      ),
    ).toMatchObject({ status: 'NOT_MET', earliestDate: undefined });
    expect(
      checks(id, { eu: { ...residence, absences: [] } }, { D03: 'NOT_MET' }),
    ).toMatchObject({ status: 'NOT_MET', earliestDate: undefined });
  });

  test('the initial residence period starts on actual entry despite an earlier activity date', () => {
    const residence: IrelandTreatyResidence = {
      ...eu,
      activities: [
        {
          from: '2019-01-01',
          enteredOn: '2022-01-01',
          basis: 'initial',
          verified: true,
          sufficientIdentity: true,
          unreasonableBurden: false,
        },
        { from: '2022-04-01', basis: 'employed', verified: true },
      ],
    };
    expect(
      checks(
        id,
        { eu: residence },
        { D02: 'MET', D03: 'NOT_MET', D08: 'UNKNOWN' },
      ),
    ).toMatchObject({ status: 'NOT_MET', earliestDate: undefined });
    expect(
      checks(
        id,
        { eu: residence, simulationDate: '2027-01-01' },
        { D03: 'MET', D08: 'MET' },
      ),
    ).toMatchObject({ status: 'MET', earliestDate: '2027-01-01' });
  });

  test('the citizen certificate does not need notices required only from non-EU family members', () => {
    const document: IrelandTreatyResidence['document'] = {
      inState: true,
      identityAndResidenceEvidence: true,
      publicInterest: 'clear',
    };
    expect(
      checks(
        id,
        { eu: { ...eu, document } },
        { D01: 'MET', D03: 'MET', D06: 'MET', D08: 'MET' },
      ),
    ).toMatchObject({ status: 'MET', earliestDate: day });
    expect(
      checks(
        id,
        {
          eu: {
            ...eu,
            role: 'family',
            nonEuFamily: true,
            relationship: 'spouse',
            qualifyingSponsor: true,
            relationshipEvidence: true,
            activities: [{ from: '2021-11-23', basis: 'family', verified: true }],
            document: {
              ...document,
              filedOn: day,
              currentCardExpiresOn: '2026-11-24',
            },
          },
        },
        { D06: 'UNKNOWN' },
      ),
    ).toMatchObject({ status: 'MET', earliestDate: day });
  });

  test('travel history shows loss after EU acquisition and acquisition again after return', () => {
    const residence: IrelandTreatyResidence = {
      ...eu,
      activities: [
        {
          from: '2016-02-01',
          to: '2021-02-28',
          basis: 'employed',
          verified: true,
        },
        { from: '2024-04-01', basis: 'employed', verified: true },
      ],
      absences: [
        { leftOn: '2021-03-01', returnedOn: '2024-04-01', reason: 'temporary' },
      ],
    };
    for (const document of [
      residence.document,
      {
        ...residence.document,
        postGrantAbsence: { from: '2021-03-01', returnedOn: '2024-04-01' },
      },
    ]) {
      expect(
        checks(
          id,
          { eu: { ...residence, document } },
          { D03: 'MET', D08: 'NOT_MET' },
        ),
      ).toMatchObject({ status: 'NOT_MET', earliestDate: undefined });
    }
    expect(
      checks(
        id,
        { eu: residence, simulationDate: '2029-04-01' },
        { D03: 'MET', D08: 'MET' },
      ),
    ).toMatchObject({ status: 'MET', earliestDate: '2029-04-01' });
    const wa: IrelandTreatyResidence = {
      ...residence,
      wa: {
        britishOrQualifyingFamily: true,
        relevantStart: '2016-02-01T00:00:00Z',
        protectedBeforeAndContinued: true,
      },
    };
    expect(
      checks(waId, { wa }, { E01: 'MET', E02: 'MET', E03: 'MET' }),
    ).toMatchObject({ status: 'MET', earliestDate: day });
    expect(
      checks(
        waId,
        {
          simulationDate: '2027-04-01',
          wa: {
            ...wa,
            activities: [
              wa.activities![0],
              { ...wa.activities![1], from: '2027-04-01' },
            ],
            absences: [
              {
                leftOn: '2021-03-01',
                returnedOn: '2027-04-01',
                reason: 'temporary',
              },
            ],
          },
        },
        { E01: 'UNKNOWN', E02: 'NOT_MET', E03: 'MET' },
      ),
    ).toMatchObject({ status: 'NOT_MET', earliestDate: undefined });
  });

  test('WA residence after loss needs new scope confirmation even after five years of work', () => {
    const residence: IrelandTreatyResidence = {
      ...eu,
      activities: [{ from: '2022-01-01', basis: 'employed', verified: true }],
      absences: [
        { leftOn: '2016-01-01', returnedOn: '2022-01-01', reason: 'temporary' },
      ],
      document: { ...eu.document, priorPermanentRightOn: '2015-01-01' },
      wa: { britishOrQualifyingFamily: true, recognisedWaScope: true },
    };
    for (const [postLossScopeConfirmed, status] of [
      [undefined, 'UNKNOWN'],
      [false, 'NOT_MET'],
      [true, 'MET'],
    ] as const) {
      const path = checks(
        waId,
        {
          simulationDate: '2027-01-01',
          wa: { ...residence, wa: { ...residence.wa, postLossScopeConfirmed } },
        },
        { E01: status, E02: status },
      );
      expect(path).toMatchObject({
        status,
        earliestDate: status === 'MET' ? '2027-01-01' : undefined,
      });
      if (status === 'UNKNOWN') expect(path.pendingDetails).toContain('PD-338');
    }
  });

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
      activities: [
        { from: '2021-11-23', basis: 'family', verified: true },
        { from: '2025-11-23', basis: 'retained-family', verified: true },
      ],
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
    expect(
      checks(
        id,
        { eu: { ...euFamily, activities: eu.activities } },
        { D05: 'NOT_MET' },
      ),
    ).toMatchObject({ status: 'NOT_MET', earliestDate: undefined });
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
      activities: [{ from: '2021-11-23', basis: 'family', verified: true }],
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

test('each of the 16 paths withholds a filing date for a failed or unknown applicable condition', () => {
  const dependantLtr: IrelandLtr = {
    ...ltr,
    family: {
      eligibleDependentRelationship: true,
      principalHoldsLtr: true,
      principalQualifyingPeriods: [{ from: '2020-01-01' }],
      dependentRegisteredPeriods: [{ from: '2021-11-23' }],
    },
  };
  const cardRenewal = { ...registration, stage: 'renewal' as const, irpExpiresOn: undefined };
  const cardEvidence = (value: boolean | undefined): IrelandTreatyResidence => ({
    ...permanentCard,
    document: { ...permanentCard.document, identityAndResidenceEvidence: value },
  });
  type Scenario = [check: string, request: (value: boolean | undefined) => Partial<IrelandFullRequest>];
  const scenarios = {
    ...Object.fromEntries(
      Object.entries(naturalisationApplications).map(([id, request]) => [
        id,
        ['A07', (value: boolean | undefined) => ({
          ...request,
          citizenship: { ...naturalisationFacts, prescribedFormAndWitness: value },
        })] satisfies Scenario,
      ]),
    ) as Record<keyof typeof naturalisationApplications, Scenario>,
    'IE-STAMP4-21': ['B03', (value) => ({
      permissions: [{ kind: 'stamp1-csep', from: '2025-02-23' }],
      employmentStart: '2025-02-23',
      work: { ...work, employedInState: value },
    })],
    'IE-STAMP4-57': ['B03', (value) => ({
      permissions: [{ kind: 'stamp1-gep', from: '2022-02-23' }],
      employmentStart: '2022-02-23',
      work: { ...work, basis: 'gep', employedInState: value },
    })],
    'IE-STAMP4-INDEPENDENT-FAMILY': ['B11', (value) => ({
      family: {
        ...family,
        application: undefined,
        sponsorCategory: 'A',
        dependentPeriods: [{ from: '2021-11-01' }],
        nextRenewalOn: day,
        establishedFamilyPermission: value,
      },
    })],
    'IE-STAMP5': ['B24', (value) => ({
      stamp5: {
        nonEea: true,
        validPermissionWhileProcessing: value,
        termsComplied: true,
        character: good,
        burden: { benefit: 'none' },
        passportAndIrpEvidence: true,
        bankEvidenceMonths: 6,
      },
    })],
    'IE-STAMP4-IRISH-FAMILY': ['B20', (value) => ({
      family: { ...family, application: { ...familyApplication, familyEvidenceComplete: value } },
    })],
    'IE-LTR-PRINCIPAL': ['C08', (value) => ({
      ltr: { ...ltr, maintenance: { ...ltr.maintenance, renewal: true, previousGrantYearsEvidence: value } },
    })],
    'IE-LTR-FAMILY': ['C07', (value) => ({
      ltr: { ...dependantLtr, family: { ...dependantLtr.family, principalHoldsLtr: value } },
    })],
    'IE-EU-PERMANENT': ['D06', (value) => ({
      registration: cardRenewal,
      eu: cardEvidence(value),
    })],
    'IE-WA-PERMANENT': ['E03', (value) => ({
      registration: cardRenewal,
      wa: cardEvidence(value),
    })],
  } satisfies Record<IrelandFullPathwayId, Scenario>;

  const paths = evaluateIrelandFull(base).columns[0].pathways;
  expect(paths).toHaveLength(16);
  for (const { id } of paths) {
    const [check, request] = scenarios[id as IrelandFullPathwayId];
    for (const [value, status] of [
      [true, 'MET'], [false, 'NOT_MET'], [undefined, 'UNKNOWN'],
    ] as const) {
      const assessed = checks(id as IrelandFullPathwayId, request(value), { [check]: status });
      expect(assessed, `${id}: ${check} is ${status}`).toMatchObject({
        status, earliestDate: status === 'MET' ? day : undefined,
      });
    }
  }
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

test('a projected GEP upgrade date can outlast the employer letter', () => {
  const id = 'IE-STAMP4-57';
  const request = {
    permissions: [{ kind: 'stamp1-gep', from: '2022-02-23', to: '2027-08-01' }],
    employmentStart: '2022-02-23',
    registration: { ...registration, irpExpiresOn: '2027-08-01' },
    work: { ...work, basis: 'gep', employerLetterOn: day },
  } satisfies Partial<IrelandFullRequest>;
  expect(checks(id, request, { B04: 'MET' }))
    .toMatchObject({ status: 'FUTURE', earliestDate: '2027-05-09' });
  expect(checks(id, { ...request, simulationDate: '2027-05-09' }, { B04: 'NOT_MET' }))
    .toMatchObject({ status: 'NOT_MET', earliestDate: undefined });
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

describe('Ireland check kinds', () => {
  test('checks are grouped as time, requirements, budget, after approval or information', () => {
    const naturalisation = result('IE-NATURALISATION', {
      citizenship: { ...citizen, vetting: 'outstanding' },
    });
    expect(naturalisation.status).toBe('MET');
    expect(checkOf(naturalisation.checks, 'A03')).toMatchObject({
      status: 'NOT_MET',
      kind: 'information',
    });
    // Fees are a budget, the residence clock is a time requirement and the
    // other checks outside the status are procedural information.
    for (const [id, kind] of [
      ['A01', 'requirement'],
      ['A04', 'requirement'],
      ['NAT-CONTINUOUS', 'time'],
      ['NAT-PRIOR', 'time'],
      ['NAT-ABSENCES', 'time'],
      ['A09', 'budget'],
      ['A10', 'budget'],
      ['A11', 'information'],
      ['A12', 'information'],
    ])
      expect(checkOf(naturalisation.checks, id)?.kind, id).toBe(kind);

    // The legacy Stamp 1G clock is shown for reference only (task 89, review89-2).
    const independent = result('IE-STAMP4-INDEPENDENT-FAMILY', {
      permissions: [{ kind: 'stamp4', from: '2019-01-01' }],
      family: {
        relationship: 'spouse',
        establishedFamilyPermission: true,
        sponsorLawfulAndResident: true,
        dependentPeriods: [{ from: '2019-01-01' }],
        nextRenewalOn: '2026-12-20',
      },
    });
    expect(independent).toMatchObject({
      status: 'FUTURE',
      earliestDate: '2026-12-20',
    });
    expect(checkOf(independent.checks, 'FAMILY-LEGACY-TIME')).toMatchObject({
      status: 'NOT_MET',
      kind: 'information',
    });
    expect(checkOf(independent.checks, 'B12')?.kind).toBe('requirement');

    // C08 decides an LTR renewal but only follows a first grant; the LTR
    // approval fee is a budget item.
    const request = { permissions: [{ kind: 'stamp4', from: '2021-12-01' }], ltr } satisfies Partial<IrelandFullRequest>;
    const first = result('IE-LTR-PRINCIPAL', request).checks;
    expect(checkOf(first, 'C08')?.kind).toBe('afterApproval');
    expect(checkOf(first, 'C09')?.kind).toBe('budget');
    expect(
      checkOf(
        result('IE-LTR-PRINCIPAL', {
          ...request,
          registration: { ...registration, stage: 'renewal' },
        }).checks,
        'C08',
      )?.kind,
    ).toBe('requirement');

    // Stamp 5 registration and EU permanent status maintenance follow a grant.
    const stamp5 = result('IE-STAMP5', {
      permissions: [{ kind: 'stamp1-csep', from: '2016-01-01' }],
      stamp5: { grantReceived: true },
    }).checks;
    expect(checkOf(stamp5, 'WCATT-TIME')?.kind).toBe('time');
    expect(checkOf(stamp5, 'B28')?.kind).toBe('afterApproval');
    const treaty = result('IE-EU-PERMANENT', { eu }).checks;
    expect(checkOf(treaty, 'D08')?.kind).toBe('afterApproval');
    expect(checkOf(treaty, 'D06')?.kind).toBe('information');
    expect(checkOf(treaty, 'D03')?.kind).toBe('requirement');
    const work = result('IE-STAMP4-21', { work: {} }).checks;
    expect(checkOf(work, 'STAMP4-WORK-TIME')?.kind).toBe('time');
    expect(checkOf(work, 'B02')?.kind).toBe('budget');
  });
});
