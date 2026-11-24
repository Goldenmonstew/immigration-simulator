import { describe, expect, test } from 'vitest';
import { evaluateGreeceFull, type GrFullRequest } from '../src';
import { grContext } from '../src/greece-rules';
import {
  workFamilyChecks,
  type GrWorkFamilyAnswers,
} from '../src/greece-work-family';

type Work = NonNullable<GrWorkFamilyAnswers['work']>;
type Family = NonNullable<GrWorkFamilyAnswers['familyTcn']>;
const date = '2026-11-23';
const base = {
  filingDocuments: { formReady: true, feeReceiptReady: true },
  simulationDate: date,
  birthDate: '1996-11-23',
  entry: 'national-visa',
  insurance: { kind: 'public', coversFamily: true },
  citizenship: 'third-country',
  passport: { kind: 'exception-granted' },
  publicHealth: 'cleared',
  publicOrder: 'clear',
  biometrics: 'provided',
  changes: [],
} satisfies GrFullRequest;
const employed: Work = {
  permit: 'E4',
  stage: 'initial',
  admission: 'ordinary',
  contractMonths: 6,
  contractDocumented: true,
  fullTimeEmployment: true,
  hiringNotificationFiled: true,
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
  otherResidencePermitGranted: false,
  relationshipCertificateIssuedOn: '2026-11-01',
  unchangedFamilyDeclaration: true,
  birthRecordProvesAge: true,
  stage: 'initial',
  sponsor: 'ordinary',
  sponsorLawfulYears: 2,
  sponsorPermitDurationYears: 2,
  sponsorPermitLeadsToPermanentResidence: true,
  sponsorPermitValid: true,
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

function route(
  id: 'GR-WORK' | 'GR-FAMILY-TCN',
  request: Partial<GrFullRequest>,
) {
  return evaluateGreeceFull({ ...base, ...request, pathways: [id] }).columns[0]
    .pathways[0];
}

test.each([
  ['2026-11-23', 'standalone-Z', 'FUTURE', '2026-12-01'],
  ['2026-12-01', 'standalone-Z', 'MET', undefined],
  ['2026-12-02', 'standalone-Z', 'NOT_MET', undefined],
  ['2026-12-01', 'leads-to-permit', 'NOT_MET', undefined],
] as const)(
  'an Ε.4 switch on a %s national visa (%s) needs the qualifying visa at expiry',
  (simulationDate, kind, status, earliestDate) => {
    const result = route('GR-WORK', {
      simulationDate,
      entry: 'national-visa',
      work: {
        ...employed,
        admission: 'domestic-switch',
        quotaAvailable: false,
        switchVisa: { kind, expiresOn: '2026-12-01' },
      },
    });
    const check = result.checks.find((item) => item.id === 'WK-06');
    expect(check?.status).toBe(status === 'FUTURE' ? 'NOT_MET' : status);
    if (earliestDate) expect(check?.explanation).toContain(earliestDate);
    expect(result.status).toBe(status);
    expect(result.earliestDate).toBe(earliestDate);
  },
);

test.each([
  [true, 'MET'],
  [false, 'NOT_MET'],
  [undefined, 'UNKNOWN'],
] as const)(
  'a lawful short-stay Ε.1 switch uses the available quota (%s)',
  (quotaAvailable, status) => {
    const result = route('GR-WORK', {
      simulationDate: '2024-11-23',
      entry: 'short-stay',
      work: {
        ...blue,
        admission: 'domestic-switch',
        grossAnnualEur: 60000,
        quotaAvailable,
      },
    });
    for (const id of ['C-02', 'WK-03']) {
      expect(result.checks.find((item) => item.id === id)?.status).toBe('MET');
    }
    expect(result.checks.find((item) => item.id === 'WK-06')?.status).toBe(
      status,
    );
    expect(result.status).toBe(status);
    expect(result.earliestDate).toBeUndefined();
  },
);

test.each([
  [undefined, 'UNKNOWN'],
  ['possible-risk', 'UNKNOWN'],
  ['entry-refused', 'NOT_MET'],
  ['cleared', 'MET'],
] as const)(
  'Ε.1 initial grant checks public health (%s) on either visa route',
  (publicHealth, status) => {
    for (const entry of ['national-visa', 'short-stay'] as const) {
      const path = route('GR-WORK', {
        simulationDate: '2024-11-23',
        entry,
        work: blue,
        publicHealth,
      });
      expect(path.checks.find((item) => item.id === 'C-04')?.status).toBe(
        status,
      );
      expect(path.status).toBe(status);
    }
  },
);

test.each([
  [undefined, 'UNKNOWN'],
  ['possible-risk', 'UNKNOWN'],
  ['cleared', 'MET'],
] as const)(
  'Ε.1 domestic switch from a valid permit checks public health (%s)',
  (publicHealth, status) => {
    const path = route('GR-WORK', {
      simulationDate: '2024-11-23',
      entry: 'permit',
      permits: [{ kind: 'regular', from: '2024-01-01', to: '2025-01-01' }],
      work: { ...blue, admission: 'domestic-switch' },
      publicHealth,
    });
    expect(path.checks.find((item) => item.id === 'C-04')?.status).toBe(status);
    expect(path.status).toBe(status);
  },
);

test('residence and age waits use the actual anniversary and require every other condition', () => {
  const familyTcn: Family = {
    ...reunion,
    sponsorLawfulFrom: '2024-12-10',
    sponsorLawfulYears: undefined,
  };
  const application = { familyTcn, birthDate: '2008-11-24' };
  const pending = route('GR-FAMILY-TCN', application);
  expect(pending.checks.find((item) => item.id === 'FT-01')).toMatchObject({
    status: 'NOT_MET',
    explanation: expect.stringContaining('2026-12-10'),
  });
  expect(pending.checks.find((item) => item.id === 'FT-05')).toMatchObject({
    status: 'NOT_MET',
    explanation: expect.stringContaining('2026-11-24'),
  });
  expect(pending).toMatchObject({
    status: 'FUTURE',
    earliestDate: '2026-12-10',
  });
  expect(
    route('GR-FAMILY-TCN', { ...application, simulationDate: '2026-12-10' })
      .status,
  ).toBe('MET');
  const blocked = route('GR-FAMILY-TCN', {
    ...application,
    familyTcn: { ...familyTcn, housingDocument: 'none' },
  });
  expect(blocked.status).toBe('NOT_MET');
  expect(blocked.earliestDate).toBeUndefined();
});

test.each([
  ['investor', '2005-11-24', '2026-11-24'],
  ['ordinary', '2008-11-24', '2026-11-24'],
] as const)(
  'Ο.2 child conversion for an %s sponsor starts on the applicable birthday',
  (sponsor, birthDate, birthday) => {
    const request = {
      birthDate,
      familyTcn: {
        stage: 'autonomous',
        autonomousBasis: 'child',
        sponsor,
        member: 'child',
        previousFamilyCard: true,
        birthRecordProvesAge: true,
        previousAutonomousChildCard: false,
      },
    } satisfies Partial<GrFullRequest>;
    const before = route('GR-FAMILY-TCN', { ...request, simulationDate: date });
    expect(before.checks.find((item) => item.id === 'FT-07')).toMatchObject({
      status: 'NOT_MET',
      explanation: expect.stringContaining(birthday),
    });
    expect(before).toMatchObject({ status: 'FUTURE', earliestDate: birthday });
    const on = route('GR-FAMILY-TCN', { ...request, simulationDate: birthday });
    expect(on.checks.find((item) => item.id === 'FT-07')?.status).toBe('MET');
    expect(on.status).toBe('MET');
  },
);

test('Ο.2 distinguishes the investor child permit from the five-year residence basis', () => {
  const request = {
    simulationDate: '2026-11-24',
    birthDate: '2007-01-01',
    familyTcn: {
      stage: 'autonomous',
      member: 'child',
      sponsor: 'investor',
      previousFamilyCard: true,
      otherResidencePermitGranted: false,
      autonomousBasis: 'child',
      familyResidenceYears: 5,
    },
  } satisfies GrFullRequest;
  expect(route('GR-FAMILY-TCN', request)).toMatchObject({
    status: 'FUTURE',
    earliestDate: '2028-01-01',
  });
  const unknownSponsor = route('GR-FAMILY-TCN', {
    ...request,
    familyTcn: { ...request.familyTcn, sponsor: undefined },
  });
  expect(
    unknownSponsor.checks.find((item) => item.id === 'FT-07')?.status,
  ).toBe('UNKNOWN');
  expect(unknownSponsor.status).toBe('UNKNOWN');
  expect(unknownSponsor.earliestDate).toBeUndefined();
  expect(
    route('GR-FAMILY-TCN', {
      ...request,
      familyTcn: { ...request.familyTcn, autonomousBasis: 'residence' },
    }).status,
  ).toBe('MET');
});

const fiveYearConversion: Family = {
  otherResidencePermitGranted: false,
  stage: 'autonomous',
  autonomousBasis: 'residence',
  sponsor: 'ordinary',
  member: 'spouse',
  previousFamilyCard: true,
  familyResidenceYears: 5,
  yearsSinceFirstFamilyPermit: 5,
};

describe('Ο.2 filing evidence under articles 24 and 90', () => {
  const spouse: Family = {
    stage: 'autonomous',
    autonomousBasis: 'residence',
    member: 'spouse',
    sponsor: 'ordinary',
    previousFamilyCard: true,
    familyResidenceFrom: '2021-11-10',
    otherResidencePermitGranted: false,
  };
  test.each([
    ['2026-11-01', 'FUTURE'],
    ['2026-11-24', 'FUTURE'],
    ['2027-01-09', 'FUTURE'],
    ['2027-01-10', 'MET'],
  ] as const)(
    'first grant after D-visa arrival on %s',
    (simulationDate, status) => {
      const result = route('GR-FAMILY-TCN', {
        simulationDate,
        familyTcn: spouse,
        permits: [
          { kind: 'regular', from: '2022-01-10', issuedOn: '2022-01-10' },
        ],
      });
      expect(result.checks.find((item) => item.id === 'FT-07')?.status).toBe(
        status === 'MET' ? 'MET' : 'NOT_MET',
      );
      expect(result.status).toBe(status);
      expect(result.earliestDate).toBe(
        status === 'FUTURE' ? '2027-01-10' : undefined,
      );
    },
  );

  test('the recorded grant date governs a backdated card; residence alone cannot prove the anniversary', () => {
    const result = route('GR-FAMILY-TCN', {
      simulationDate: '2026-11-24',
      familyTcn: spouse,
      permits: [
        {
          kind: 'regular',
          from: '2021-11-10',
          issuedOn: '2022-01-10',
          purpose: 'family-reunification',
        },
      ],
    });
    expect(result).toMatchObject({
      status: 'FUTURE',
      earliestDate: '2027-01-10',
    });
    expect(route('GR-FAMILY-TCN', { familyTcn: spouse }).status).toBe(
      'UNKNOWN',
    );
    const firstCard = {
      ...spouse,
      firstFamilyPermitIssuedOn: '2020-11-24',
      familyResidenceFrom: '2020-11-01',
    };
    expect(
      route('GR-FAMILY-TCN', {
        familyTcn: firstCard,
        permits: [{ kind: 'regular', from: '2025-01-01' }],
      }).status,
    ).toBe('MET');
  });

  test.each(['2026-11-01', '2026-11-24'])(
    'a first Ο.1 with only a validity start cannot date a five-year conversion on %s',
    (simulationDate) => {
      const permit = {
        kind: 'regular',
        purpose: 'family-reunification',
        from: '2021-11-10',
      } as const;
      const request = { simulationDate, familyTcn: spouse, permits: [permit] };
      const missing = route('GR-FAMILY-TCN', request);
      expect(missing.checks.find((item) => item.id === 'FT-07')?.status).toBe(
        'UNKNOWN',
      );
      expect(missing.status).toBe('UNKNOWN');
      expect(missing.earliestDate).toBeUndefined();
      expect(
        route('GR-FAMILY-TCN', {
          ...request,
          permits: [{ ...permit, issuedOn: '2022-01-10' }],
        }),
      ).toMatchObject({ status: 'FUTURE', earliestDate: '2027-01-10' });
    },
  );

  test.each([
    [undefined, 'UNKNOWN'],
    [false, 'MET'],
    [true, 'NOT_MET'],
  ] as const)(
    'Ο.2 asks about other grants independently of the first family card (%s)',
    (answer, status) => {
      const familyTcn = {
        ...spouse,
        familyResidenceFrom: '2021-01-01',
        firstFamilyPermitIssuedOn: '2021-01-10',
        otherResidencePermitGranted: answer,
      };
      const partialCard = {
        kind: 'regular',
        purpose: 'family-reunification',
        from: '2021-01-01',
      } as const;
      for (const permits of [undefined, [partialCard]]) {
        const result = route('GR-FAMILY-TCN', {
          simulationDate: '2026-11-24',
          permits,
          familyTcn,
        });
        expect(result.checks.find((item) => item.id === 'FT-07')?.status).toBe(
          status,
        );
        expect(result.status).toBe(status);
        expect(result.earliestDate).toBeUndefined();
        expect(
          route('GR-FAMILY-TCN', {
            familyTcn,
            permits,
            permitHistoryComplete: true,
          }).status,
        ).toBe(answer === true ? 'NOT_MET' : 'MET');
      }
    },
  );

  test('elapsed time since the first family grant alone cannot prove uninterrupted residence', () => {
    const result = route('GR-FAMILY-TCN', {
      familyTcn: {
        ...fiveYearConversion,
        familyResidenceYears: undefined,
      },
    });
    expect(result.status).toBe('UNKNOWN');
  });

  test('the same applicant’s Ε.4 renewal blocks Ο.2 even with a negative other-grants answer', () => {
    const req = {
      ...base,
      simulationDate: '2026-11-24',
      familyTcn: fiveYearConversion,
      work: { permit: 'E4', stage: 'renewal', taxesSettledDuringPermit: true },
      currentCardExpiresOn: '2026-12-30',
      pathways: ['GR-WORK', 'GR-FAMILY-TCN'],
    } satisfies GrFullRequest;
    const [work, family] = evaluateGreeceFull(req).columns[0].pathways;
    expect(work.status).toBe('MET');
    expect(family.checks.find((item) => item.id === 'FT-07')?.status).toBe(
      'NOT_MET',
    );
    expect(family.status).toBe('NOT_MET');
    expect(
      route('GR-FAMILY-TCN', {
        familyTcn: fiveYearConversion,
        work: { permit: 'E4', stage: 'initial' },
      }).status,
    ).toBe('MET');
  });

  test.each([
    { work: { permit: 'E1', stage: 'renewal' } },
    { goldenVisa: { stage: 'renewal' } },
    { longTerm: { stage: 'reacquisition' } },
    { tenYear: { stage: 'renewal', hasPriorCard: true } },
    { greekFamily: { stage: 'renewal' } },
    { euFamily: { stage: 'permanent-renewal' } },
    { permits: [{ kind: 'study', from: '2023-11-24' }] },
    {
      blueCardMobility: {
        priorMemberPeriods: [
          {
            issuer: 'greece',
            kind: 'researcher',
            from: '2020-01-01',
            through: '2021-01-10',
          },
        ],
      },
    },
  ] satisfies Partial<GrFullRequest>[])(
    'a Greek grant entered on another route blocks Ο.2: %o',
    (grant) => {
      expect(
        route('GR-FAMILY-TCN', { ...grant, familyTcn: fiveYearConversion })
          .status,
      ).toBe('NOT_MET');
    },
  );

  test('an expired first card proves the original grant, but the later residence must also be documented', () => {
    const familyTcn: Family = { ...spouse, familyResidenceFrom: undefined };
    const first = {
      kind: 'regular',
      from: '2019-01-01',
      issuedOn: '2019-01-01',
      to: '2021-12-31',
    } as const;
    expect(route('GR-FAMILY-TCN', { familyTcn, permits: [first] }).status).toBe(
      'UNKNOWN',
    );
    expect(
      route('GR-FAMILY-TCN', {
        familyTcn,
        permits: [first, { kind: 'regular', from: '2022-01-01' }],
      }).status,
    ).toBe('MET');
    expect(
      route('GR-FAMILY-TCN', {
        familyTcn: {
          ...familyTcn,
          familyResidenceYears: 6,
          yearsSinceFirstFamilyPermit: 6,
        },
        permits: [{ kind: 'regular', from: '2025-01-01' }],
      }).status,
    ).toBe('MET');
  });

  test.each([true, false, undefined])(
    'divorce or registered dissolution evidence %s',
    (evidence) => {
      for (const member of ['spouse', 'registered-partner'] as const) {
        const result = route('GR-FAMILY-TCN', {
          simulationDate: '2026-11-24',
          familyTcn: {
            ...spouse,
            member,
            autonomousBasis: 'divorce',
            priorMarriageYears: 4,
            priorMarriageYearsInGreece: 2,
            relationshipAndDocumentsGenuine: evidence,
          },
        });
        const expected =
          evidence === undefined ? 'UNKNOWN' : evidence ? 'MET' : 'NOT_MET';
        expect(result.checks.find((item) => item.id === 'FT-07')?.status).toBe(
          expected,
        );
        expect(result.status).toBe(expected);
      }
    },
  );

  test.each([
    ['2026-08-01', undefined, 'NOT_MET'],
    ['2026-08-01', '2026-09-01', 'NOT_MET'],
    ['2026-11-25', undefined, 'MET'],
  ] as const)(
    'applicant’s Greek Blue Card issued %s through %s',
    (greekBlueCardFrom, greekBlueCardThrough, expected) => {
      const result = route('GR-FAMILY-TCN', {
        simulationDate: '2026-11-24',
        familyTcn: {
          ...spouse,
          otherResidencePermitGranted: false,
          firstFamilyPermitIssuedOn: '2020-11-24',
          familyResidenceFrom: '2020-11-24',
        },
        blueCardMobility: { greekBlueCardFrom, greekBlueCardThrough },
      });
      expect(result.checks.find((c) => c.id === 'FT-07')?.status).toBe(
        expected,
      );
      expect(result.status).toBe(expected);
    },
  );

  test.each([
    ['greece', 'NOT_MET'],
    ['other-member-state', 'MET'],
    [undefined, 'UNKNOWN'],
  ] as const)('prior mobility period with issuer %s', (issuer, expected) => {
    const result = route('GR-FAMILY-TCN', {
      permits: [],
      permitHistoryComplete: true,
      familyTcn: {
        ...fiveYearConversion,
        otherResidencePermitGranted: undefined,
      },
      blueCardMobility: {
        priorMemberPeriods: [
          {
            kind: 'blue-card',
            issuer,
            from: '2019-04-01',
            through: '2020-11-23',
          },
        ],
      },
    });
    expect(result.status).toBe(expected);
  });

  test.each([
    ['2021-11-09', true, 'NOT_MET'],
    ['2022-11-10', true, 'MET'],
    ['2022-11-10', false, 'NOT_MET'],
    ['2022-11-10', undefined, 'UNKNOWN'],
  ] as const)(
    'bereavement on %s with civil record %s',
    (sponsorDiedOn, evidence, expected) => {
      const result = route('GR-FAMILY-TCN', {
        familyTcn: {
          ...spouse,
          autonomousBasis: 'bereavement',
          sponsorDiedOn,
          relationshipAndDocumentsGenuine: evidence,
        },
      });
      expect(result.status).toBe(expected);
    },
  );

  test.each([
    ['2026-05-23', true, 'NOT_MET'],
    ['2026-05-24', true, 'MET'],
    ['2026-11-25', true, 'NOT_MET'],
    [undefined, true, 'UNKNOWN'],
    ['2026-05-24', false, 'NOT_MET'],
  ] as const)(
    'Blue Card family grant with civil record dated %s and unchanged-status declaration %s',
    (issued, declaration, expected) => {
      const result = route('GR-FAMILY-TCN', {
        simulationDate: '2026-11-24',
        familyTcn: {
          ...reunion,
          sponsor: 'blue-card',
          relationshipCertificateIssuedOn: issued,
          unchangedFamilyDeclaration: declaration,
        },
      });
      expect(result.checks.find((c) => c.id === 'FT-08')?.status).toBe(
        expected,
      );
      expect(result.status).toBe(expected);
    },
  );
});

test.each([
  [{ kind: 'public', coversFamily: false }, undefined, [], 'MET'],
  [{ kind: 'uninsured' }, undefined, [], 'NOT_MET'],
  [undefined, undefined, [], 'UNKNOWN'],
  [
    { kind: 'gap', gapEvidence: 'unemployment-benefit' },
    undefined,
    [],
    'UNKNOWN',
  ],
  [{ kind: 'uninsured' }, true, [], 'MET'],
  [undefined, undefined, ['public-insurance-application'], 'MET'],
] as const)(
  'Ο.2 five-year conversion checks personal cover (%j), public application (%s) and deferred evidence (%j)',
  (insurance, appliedForFullPublicCover, deferred, status) => {
    const result = route('GR-FAMILY-TCN', {
      simulationDate: '2026-11-24',
      familyTcn: { ...fiveYearConversion, appliedForFullPublicCover },
      deferredInitialEvidence: [...deferred],
      insurance,
    });
    expect(result.checks.find((item) => item.id === 'C-05')?.status).toBe(
      status,
    );
    expect(result.checks.find((item) => item.id === 'FT-07')?.status).toBe(
      'MET',
    );
    expect(result.status).toBe(status);
    expect(result.earliestDate).toBeUndefined();
  },
);

test.each([
  [true, 'MET'],
  [false, 'NOT_MET'],
  [undefined, 'UNKNOWN'],
] as const)(
  'Ο.2 five-year conversion checks whether private coverage is permitted (%s)',
  (privateCoverPermitted, status) => {
    const result = route('GR-FAMILY-TCN', {
      simulationDate: '2026-11-24',
      familyTcn: { ...fiveYearConversion, privateCoverPermitted },
      insurance: {
        kind: 'private',
        issuer: 'greek',
        disabilityEur: 20000,
        medicalEur: 2000,
        hospitalEur: 20000,
        maxCopayPercent: 0,
        hasDeductibleOrExclusions: false,
        policyMonths: 18,
      },
      deferredInitialEvidence: [],
    });
    expect(result.checks.find((item) => item.id === 'C-05')?.status).toBe(
      status,
    );
    expect(result.status).toBe(status);
  },
);

test('Ο.2 investor child special card uses its own evidence', () => {
  const result = route('GR-FAMILY-TCN', {
    simulationDate: '2026-11-24',
    birthDate: '2005-11-24',
    insurance: { kind: 'uninsured' },
    deferredInitialEvidence: [],
    familyTcn: {
      stage: 'autonomous',
      autonomousBasis: 'child',
      sponsor: 'investor',
      member: 'child',
      previousFamilyCard: true,
    },
  });
  expect(result.checks.some((item) => item.id === 'C-05')).toBe(false);
  expect(result.checks.find((item) => item.id === 'FT-07')?.status).toBe('MET');
  expect(result.status).toBe('MET');
});

test.each([
  ['2008-11-24', false, 'NOT_MET'],
  ['2005-11-24', true, 'MET'],
] as const)(
  'Ο.2 ordinary child born %s applies with an explicit insurance shortfall',
  (birthDate, previousAutonomousChildCard, status) => {
    const result = route('GR-FAMILY-TCN', {
      simulationDate: '2026-11-24',
      birthDate,
      insurance: { kind: 'uninsured' },
      deferredInitialEvidence: [],
      familyTcn: {
        stage: 'autonomous',
        autonomousBasis: 'child',
        sponsor: 'ordinary',
        member: 'child',
        previousFamilyCard: true,
        birthRecordProvesAge: true,
        previousAutonomousChildCard,
      },
    });
    expect(result.checks.find((item) => item.id === 'C-05')?.status).toBe(
      previousAutonomousChildCard ? undefined : 'NOT_MET',
    );
    expect(result.checks.find((item) => item.id === 'FT-07')?.status).toBe(
      'MET',
    );
    expect(result.status).toBe(status);
  },
);

test.each([
  ['investor', '2024-01-02', undefined, undefined, 'NOT_MET'],
  ['study', '2024-01-02', '2025-01-01', false, 'NOT_MET'],
  ['investor', '2026-11-24', undefined, false, 'NOT_MET'],
  ['investor', '2026-11-25', undefined, false, 'MET'],
  ['temporary', '2024-01-02', undefined, false, 'MET'],
] as const)(
  'Ο.2 five-year conversion with a %s record from %s to %s',
  (kind, from, to, otherResidencePermitGranted, status) => {
    const result = route('GR-FAMILY-TCN', {
      simulationDate: '2026-11-24',
      familyTcn: { ...fiveYearConversion, otherResidencePermitGranted },
      permits: [
        { kind: 'regular', from: '2019-01-01', to: '2024-01-01' },
        { kind, from, to },
      ],
    });
    expect(result.checks.find((item) => item.id === 'FT-07')?.status).toBe(
      status,
    );
    expect(result.status).toBe(status);
    expect(result.earliestDate).toBeUndefined();
  },
);

test.each([
  [true, 'NOT_MET'],
  [undefined, 'UNKNOWN'],
  [false, 'MET'],
] as const)(
  'Ο.2 five-year conversion distinguishes other permits within regular history (%s)',
  (otherResidencePermitGranted, status) => {
    const result = route('GR-FAMILY-TCN', {
      simulationDate: '2026-11-24',
      familyTcn: { ...fiveYearConversion, otherResidencePermitGranted },
      permits: [{ kind: 'regular', from: '2019-01-01' }],
    });
    expect(result.checks.find((item) => item.id === 'FT-07')?.status).toBe(
      status,
    );
    expect(result.status).toBe(status);
  },
);

test.each([
  ['employment', '2026-11-23', 'NOT_MET'],
  ['services-or-project', '2026-11-23', 'NOT_MET'],
  ['autonomous-family', '2026-11-24', 'NOT_MET'],
  ['other', '2026-11-24', 'NOT_MET'],
  ['family', '2026-11-24', 'MET'],
  ['employment', '2026-11-25', 'MET'],
] as const)(
  'Ο.2 five-year conversion checks a recorded %s renewal effective %s',
  (category, permitEffectiveOn, status) => {
    const result = route('GR-FAMILY-TCN', {
      simulationDate: '2026-11-24',
      familyTcn: fiveYearConversion,
      backlogRenewals: [
        {
          category,
          filedOn: '2025-01-01',
          permitEffectiveOn,
          typeAReceipt: true,
          pendingAtCommencement: true,
        },
      ],
    });
    expect(result.checks.find((item) => item.id === 'FT-07')?.status).toBe(
      status,
    );
    expect(result.status).toBe(status);
  },
);

test('Ο.2 five-year conversion checks a previously granted autonomous child card', () => {
  const result = route('GR-FAMILY-TCN', {
    simulationDate: '2026-11-24',
    familyTcn: {
      ...fiveYearConversion,
      member: 'child',
      previousAutonomousChildCard: true,
    },
  });
  expect(result.checks.find((item) => item.id === 'FT-07')?.status).toBe(
    'NOT_MET',
  );
  expect(result.status).toBe('NOT_MET');
});

test('Ο.2 uses combined Blue Card family residence and the final years in Greece', () => {
  const familyTcn: Family = {
    stage: 'autonomous',
    sponsor: 'blue-card',
    member: 'spouse',
    previousFamilyCard: true,
    otherResidencePermitGranted: false,
    autonomousBasis: 'residence',
    familyResidenceFrom: '2025-01-01',
    blueFamilyResidenceFrom: '2021-11-23',
  };
  const result = route('GR-FAMILY-TCN', { familyTcn });
  expect(result.checks.find((item) => item.id === 'FT-07')).toMatchObject({
    status: 'NOT_MET',
    explanation: expect.stringContaining('2027-01-01'),
  });
  expect(result).toMatchObject({
    status: 'FUTURE',
    earliestDate: '2027-01-01',
  });
  expect(
    route('GR-FAMILY-TCN', { familyTcn, simulationDate: '2027-01-01' }).status,
  ).toBe('MET');
});

test.each([
  [1, 5, 'NOT_MET'],
  [2, 4, 'NOT_MET'],
  [2, 5, 'MET'],
  [4, undefined, 'UNKNOWN'],
  [undefined, 4, 'NOT_MET'],
  [5, undefined, 'MET'],
] as const)(
  'Ο.2 Blue Card family with %s Greek years and %s EU years',
  (familyResidenceYears, blueFamilyYearsInEU, status) => {
    const result = route('GR-FAMILY-TCN', {
      familyTcn: {
        stage: 'autonomous',
        autonomousBasis: 'residence',
        otherResidencePermitGranted: false,
        sponsor: 'blue-card',
        member: 'spouse',
        previousFamilyCard: true,
        familyResidenceYears,
        blueFamilyYearsInEU,
      },
    });
    expect(result.checks.find((item) => item.id === 'FT-07')?.status).toBe(
      status,
    );
    expect(result.status).toBe(status);
    expect(result.earliestDate).toBeUndefined();
  },
);

test.each([
  ['blue-card', '2023-01-01', undefined, undefined, 'UNKNOWN', undefined],
  ['blue-card', '2023-01-01', 4, undefined, 'NOT_MET', undefined],
  ['blue-card', '2023-01-01', undefined, '2022-01-01', 'FUTURE', '2027-01-01'],
  ['blue-card', '2025-01-01', undefined, undefined, 'NOT_MET', undefined],
  [undefined, '2023-01-01', 5, undefined, 'UNKNOWN', undefined],
  [undefined, '2025-01-01', 5, undefined, 'NOT_MET', undefined],
  [undefined, undefined, 1, undefined, 'NOT_MET', undefined],
] as const)(
  'Ο.2 sponsor %s, Greek residence since %s, EU total %s years or since %s',
  (
    sponsor,
    familyResidenceFrom,
    blueFamilyYearsInEU,
    blueFamilyResidenceFrom,
    status,
    earliestDate,
  ) => {
    const result = route('GR-FAMILY-TCN', {
      familyTcn: {
        stage: 'autonomous',
        autonomousBasis: 'residence',
        otherResidencePermitGranted: false,
        member: 'spouse',
        previousFamilyCard: true,
        sponsor,
        familyResidenceFrom,
        blueFamilyYearsInEU,
        blueFamilyResidenceFrom,
      },
    });
    expect(result.checks.find((item) => item.id === 'FT-07')?.status).toBe(
      status === 'FUTURE' ? 'NOT_MET' : status,
    );
    expect(result.status).toBe(status);
    expect(result.earliestDate).toBe(earliestDate);
  },
);

test('employment filing can defer the insurance registration certificate and Blue Card address', () => {
  const req: Partial<GrFullRequest> = {
    simulationDate: '2024-11-23',
    entry: 'short-stay',
    deferredInitialEvidence: ['public-insurance-application'],
    insurance: undefined,
    work: {
      ...blue,
      admission: 'domestic-switch',
      permanentAddressAvailable: false,
    },
  };
  const filed = route('GR-WORK', req);
  expect(filed.status).toBe('MET');
  expect(filed.earliestDate).toBeUndefined();
  expect(filed.checks.find((item) => item.id === 'WK-07')).toMatchObject({
    status: 'MET',
    explanation: expect.stringContaining('6'),
  });
  const renewal = route('GR-WORK', {
    ...req,
    currentCardExpiresOn: '2024-12-01',
    work: { ...req.work, stage: 'renewal', taxesSettledDuringPermit: true },
  });
  expect(renewal.checks.find((item) => item.id === 'WK-07')?.status).toBe(
    'UNKNOWN',
  );
  expect(renewal.status).toBe('UNKNOWN');
  expect(renewal.earliestDate).toBeUndefined();
});

test.each([
  [true, 'MET'],
  [false, 'NOT_MET'],
  [undefined, 'UNKNOWN'],
] as const)(
  'ordinary employment filing needs the hiring notice and signed contract (%s)',
  (evidence, status) => {
    for (const [permit, day, contractCheck] of [
      ['E1', '2024-11-23', 'WK-02'],
      ['E4', date, 'WK-04'],
    ] as const) {
      for (const [id, answers] of [
        ['WK-HIRING', { hiringNotificationFiled: evidence }],
        [contractCheck, { contractDocumented: evidence }],
      ] as const) {
        const path = route('GR-WORK', {
          simulationDate: day,
          work: { ...blue, permit, ...answers },
        });
        expect(path.checks.find((item) => item.id === id)?.status).toBe(status);
        expect(path.status).toBe(status);
      }
    }
    const ordinary = route('GR-WORK', {
      work: { ...employed, fullTimeEmployment: evidence },
    });
    expect(ordinary.checks.find((item) => item.id === 'WK-04')?.status).toBe(
      status,
    );
    expect(ordinary.status).toBe(status);
  },
);

test.each([
  ['provided', 'MET'],
  ['not-required', 'MET'],
  ['missing', 'NOT_MET'],
  [undefined, 'UNKNOWN'],
] as const)(
  'Ε.4 agricultural invitation evidence (%s)',
  (agriculturalStaffingCertificate, status) => {
    const path = route('GR-WORK', {
      work: {
        ...employed,
        employer: 'agriculture',
        agriculturalStaffingCertificate,
      },
    });
    expect(path.checks.find((item) => item.id === 'WK-05')?.status).toBe(
      status,
    );
    expect(path.status).toBe(status);
  },
);

test.each([
  [true, 'MET'],
  [false, 'NOT_MET'],
  [undefined, 'UNKNOWN'],
] as const)(
  'Ε.1 renewal needs active public cover after a documented earlier gap (%s)',
  (activePublicCoverAfterGap, status) => {
    const path = route('GR-WORK', {
      simulationDate: '2024-11-23',
      currentCardExpiresOn: '2024-12-01',
      work: {
        ...blue,
        stage: 'renewal',
        taxesSettledDuringPermit: true,
        activePublicCoverAfterGap,
      },
      insurance: { kind: 'gap', gapEvidence: 'unemployment-benefit' },
    });
    expect(path.checks.find((item) => item.id === 'WK-07')?.status).toBe(
      status,
    );
    expect(path.status).toBe(status);
  },
);

test.each([
  ['ordinary', 'national-visa', 'MET'],
  ['ordinary', 'permit', 'NOT_MET'],
  ['ordinary', 'short-stay', 'NOT_MET'],
  ['ordinary', undefined, 'UNKNOWN'],
  ['strategic-project', 'short-stay', 'MET'],
  ['strategic-project', 'national-visa', 'NOT_MET'],
  ['strategic-project', undefined, 'UNKNOWN'],
] as const)(
  'Ε.4 %s applies its entry procedure to %s',
  (admission, entry, status) => {
    const path = route('GR-WORK', {
      entry,
      work: {
        ...employed,
        admission,
        projectCertified: true,
        projectWorkersTotal: 1,
        hiringNotificationFiled: admission === 'ordinary',
      },
    });
    expect(path.checks.find((item) => item.id === 'WK-06')?.status).toBe(
      status,
    );
    expect(path.status).toBe(status);
  },
);

test('past gap evidence alone does not prove initial cover or registration', () => {
  const path = route('GR-WORK', {
    work: employed,
    insurance: { kind: 'gap', gapEvidence: 'accepted-force-majeure' },
  });
  expect(path.checks.find((item) => item.id === 'WK-07')?.status).toBe(
    'UNKNOWN',
  );
  expect(path.status).toBe('UNKNOWN');
});

test.each([
  ['greek', undefined, 'MET'],
  ['foreign', true, 'MET'],
  ['foreign', false, 'NOT_MET'],
  ['foreign', undefined, 'UNKNOWN'],
  [undefined, true, 'MET'],
  [undefined, undefined, 'UNKNOWN'],
] as const)(
  'foreign private insurance requires explicit Greek territorial cover (%s, %s)',
  (issuer, explicitlyCoversGreece, status) => {
    const path = route('GR-FAMILY-TCN', {
      familyTcn: { ...fiveYearConversion, privateCoverPermitted: true },
      insurance: {
        kind: 'private',
        issuer,
        explicitlyCoversGreece,
        disabilityEur: 20000,
        medicalEur: 2000,
        hospitalEur: 20000,
        maxCopayPercent: 0,
        hasDeductibleOrExclusions: false,
        policyMonths: 18,
      },
    });
    expect(path.checks.find((item) => item.id === 'C-05')?.status).toBe(status);
    expect(path.status).toBe(status);
  },
);

test.each([
  [true, 'MET'],
  [false, 'NOT_MET'],
  [undefined, 'UNKNOWN'],
] as const)(
  'foreign public insurance requires explicit Greek territorial cover (%s)',
  (explicitlyCoversGreece, status) => {
    const path = route('GR-WORK', {
      work: { ...employed, stage: 'renewal', taxesSettledDuringPermit: true },
      insurance: { kind: 'public', issuer: 'foreign', explicitlyCoversGreece },
      currentCardExpiresOn: '2026-12-01',
    });
    expect(path.checks.find((item) => item.id === 'WK-07')?.status).toBe(
      status,
    );
    expect(path.status).toBe(status);
  },
);

test.each([
  ['unemployment-benefit', true, 'MET', 'MET'],
  ['unemployment-benefit', undefined, 'UNKNOWN', 'UNKNOWN'],
  ['accepted-force-majeure', false, 'NOT_MET', 'NOT_MET'],
  ['none', true, 'MET', 'NOT_MET'],
  ['pending', true, 'MET', 'UNKNOWN'],
] as const)(
  'Ο.1 initial and renewal distinguish previous gap (%s) from active cover (%s)',
  (gapEvidence, activePublicCoverAfterGap, initial, renewal) => {
    for (const [stage, status] of [
      ['initial', initial],
      ['renewal', renewal],
    ] as const) {
      const path = route('GR-FAMILY-TCN', {
        familyTcn: { ...reunion, stage, familyLifeContinues: true },
        insurance: {
          kind: 'gap',
          coversFamily: true,
          gapEvidence,
          activePublicCoverAfterGap,
        },
        currentCardExpiresOn: '2026-12-01',
      });
      expect(path.checks.find((item) => item.id === 'FT-04')?.status).toBe(
        status,
      );
      expect(path.status).toBe(status);
    }
  },
);

test('a Greek national high-skilled permit holder switching to a Blue Card for the same job need not resubmit insurance evidence', () => {
  const path = route('GR-WORK', {
    simulationDate: '2024-11-23',
    entry: 'permit',
    insurance: undefined,
    work: {
      ...blue,
      admission: 'domestic-switch',
      sameJobOnGreekHighlyQualifiedPermit: true,
    },
  });
  expect(path.checks.find((item) => item.id === 'WK-07')?.status).toBe('MET');
  expect(path.status).toBe('MET');
});

test.each([
  ['2023-10-23', false, '2024-11-23', true, 'MET'],
  ['2023-10-24', false, '2024-11-23', true, 'NOT_MET'],
  ['2024-04-23', true, '2024-11-23', true, 'MET'],
  ['2024-04-23', undefined, '2024-11-23', true, 'UNKNOWN'],
  ['2023-10-23', false, '2024-11-24', true, 'NOT_MET'],
  ['2023-10-23', false, '2024-11-23', false, 'NOT_MET'],
  ['2023-10-23', false, '2024-11-23', undefined, 'UNKNOWN'],
] as const)(
  'Ε.1 mobility filed %s, prior move %s, date %s, foreign card %s',
  (
    residenceFrom,
    previousMove,
    simulationDate,
    validForeignBlueCardCopy,
    status,
  ) => {
    const path = route('GR-WORK', {
      simulationDate,
      entry: 'permit',
      work: {
        ...blue,
        admission: 'blue-card-mobility',
        employerApproval: false,
        hiringNotificationFiled: false,
        mobility: {
          residenceFrom,
          previousMove,
          enteredGreeceOn: '2024-10-23',
          validForeignBlueCardCopy,
        },
      },
    });
    expect(path.checks.find((item) => item.id === 'WK-03')?.status).toBe(
      status,
    );
    expect(path.checks.some((item) => item.id === 'WK-HIRING')).toBe(false);
    expect(path.status).toBe(status);
  },
);

test.each([
  ['regulated-recognised', 'MET'],
  ['unregulated-documented', 'MET'],
  ['previously-verified-in-Greece', 'MET'],
  ['missing', 'NOT_MET'],
  [undefined, 'UNKNOWN'],
] as const)(
  'Ε.1 renewal needs credentials for the current job (%s)',
  (qualification, status) => {
    const result = route('GR-WORK', {
      simulationDate: '2024-11-23',
      currentCardExpiresOn: '2024-12-01',
      work: {
        ...blue,
        stage: 'renewal',
        contractMonths: 12,
        grossAnnualEur: 60000,
        taxesSettledDuringPermit: true,
        qualification,
      },
    });
    expect(result.checks.find((item) => item.id === 'WK-02')?.status).toBe(
      status,
    );
    expect(result.status).toBe(status);
    expect(result.earliestDate).toBeUndefined();
  },
);

test.each([
  ['2024-11-23', '2024-12-01', false, undefined],
  ['2026-11-23', '2026-12-01', undefined, 0],
] as const)(
  'ordinary Ε.4 renewal on %s accepts tax and insurance evidence after the job ended',
  (
    simulationDate,
    currentCardExpiresOn,
    hasCurrentEmploymentContract,
    grossPayEur,
  ) => {
    const result = route('GR-WORK', {
      simulationDate,
      currentCardExpiresOn,
      work: {
        permit: 'E4',
        stage: 'renewal',
        taxesSettledDuringPermit: true,
        hasCurrentEmploymentContract,
        grossPayEur,
      },
    });
    expect(result.checks.map((item) => item.id)).not.toContain('WK-04');
    const taxAndCover = result.checks.find((item) => item.id === 'WK-07');
    expect(taxAndCover?.status).toBe('MET');
    expect(taxAndCover?.sources.map((source) => source.srcId)).toEqual(
      expect.arrayContaining(['SRC-373', 'SRC-374']),
    );
    expect(
      result.checks.find((item) => item.id === 'WK-09')?.explanation,
    ).toMatch(/€150.*€16/);
    expect(result.status).toBe('MET');
    expect(result.earliestDate).toBeUndefined();
  },
);

test.each([
  [false, 'public', 'NOT_MET'],
  [undefined, 'public', 'UNKNOWN'],
  [true, 'uninsured', 'NOT_MET'],
  [true, undefined, 'UNKNOWN'],
] as const)(
  'Ε.4 renewal requires tax compliance (%s) and active public insurance (%s)',
  (taxesSettledDuringPermit, kind, status) => {
    const result = route('GR-WORK', {
      simulationDate: '2024-11-23',
      currentCardExpiresOn: '2024-12-01',
      insurance: kind && { kind },
      work: { permit: 'E4', stage: 'renewal', taxesSettledDuringPermit },
    });
    expect(result.checks.find((item) => item.id === 'WK-07')?.status).toBe(
      status,
    );
    expect(result.status).toBe(status);
    expect(result.earliestDate).toBeUndefined();
  },
);

test.each([
  ['unemployment-benefit', true, 'MET'],
  ['accepted-force-majeure', false, 'NOT_MET'],
  ['unemployment-benefit', undefined, 'UNKNOWN'],
  ['none', true, 'NOT_MET'],
  ['pending', true, 'UNKNOWN'],
] as const)(
  'Ε.4 renewal checks the previous coverage gap (%s) and current public coverage (%s)',
  (gapEvidence, activePublicCoverAfterGap, status) => {
    const result = route('GR-WORK', {
      simulationDate: '2024-11-23',
      currentCardExpiresOn: '2024-12-01',
      insurance: { kind: 'gap', gapEvidence },
      work: {
        permit: 'E4',
        stage: 'renewal',
        taxesSettledDuringPermit: true,
        activePublicCoverAfterGap,
      },
    });
    expect(result.checks.find((item) => item.id === 'WK-07')?.status).toBe(
      status,
    );
    expect(result.status).toBe(status);
    expect(result.earliestDate).toBeUndefined();
  },
);

test.each([
  [3, 'MET'],
  [4, 'UNKNOWN'],
  [6, 'UNKNOWN'],
  [7, 'NOT_MET'],
] as const)(
  'Ε.1 cumulative unemployment of %s months with unknown Blue Card service',
  (interruptionMonths, status) => {
    const result = route('GR-WORK', {
      currentCardExpiresOn: '2026-12-01',
      work: {
        permit: 'E1',
        stage: 'renewal',
        blueRenewalInterruption: 'unemployment',
        interruptionMonths,
        taxesSettledDuringPermit: true,
      },
    });
    expect(
      result.checks.find((item) => item.id === 'WK-07-INTERRUPTION')?.status,
    ).toBe(status);
    expect(result.status).toBe(status);
    expect(result.earliestDate).toBeUndefined();
  },
);

test.each([
  ['2024-05-01', 'UNKNOWN'],
  ['2024-05-02', 'MET'],
] as const)(
  'employer turnover is evaluated under the order in force on %s',
  (simulationDate, status) => {
    const result = route('GR-WORK', {
      simulationDate,
      work: { ...employed, contractMonths: 12 },
    });
    expect(result.checks.find((item) => item.id === 'WK-05')?.status).toBe(
      status,
    );
    expect(result.status).toBe(status);
    expect(result.earliestDate).toBeUndefined();
  },
);

test.each(['initial', 'renewal'] as const)(
  'Ο.1 accepts the same Greek-registered civil partnership at %s filing',
  (stage) => {
    const result = route('GR-FAMILY-TCN', {
      simulationDate: '2026-11-24',
      entry: 'permit',
      currentCardExpiresOn: '2026-12-01',
      familyTcn: {
        stage,
        sponsor: 'ordinary',
        sponsorPermitValid: true,
        formedLegallyInGreece: true,
        member: 'registered-partner',
        relationshipAndDocumentsGenuine: true,
        unchangedFamilyDeclaration: true,
        familyLifeContinues: true,
        priorYearTaxAndInsuranceEvidence: true,
      },
    });
    expect(result.checks.find((item) => item.id === 'FT-05')).toMatchObject({
      status: 'MET',
      sources: expect.arrayContaining([
        expect.objectContaining({
          srcId: 'SRC-086',
          locator: expect.stringContaining('92(1)'),
        }),
        expect.objectContaining({
          srcId: 'SRC-356',
          locator: expect.stringContaining('(II)'),
        }),
      ]),
    });
    expect(result.status).toBe('MET');
  },
);

test.each([
  ['ordinary', false, 'NOT_MET'],
  ['blue-card', false, 'NOT_MET'],
  ['ordinary', undefined, 'UNKNOWN'],
  ['investor', false, 'MET'],
] as const)(
  'Ο.1 registered partner of %s with formation in Greece %s',
  (sponsor, formedLegallyInGreece, status) => {
    const result = route('GR-FAMILY-TCN', {
      familyTcn: {
        ...reunion,
        member: 'registered-partner',
        sponsor,
        formedLegallyInGreece,
      },
      entry: formedLegallyInGreece === undefined ? 'permit' : 'national-visa',
    });
    expect(result.checks.find((item) => item.id === 'FT-05')?.status).toBe(
      status,
    );
    expect(result.status).toBe(status);
  },
);

test('domestic partnership requires permits for both partners and the registration evidence', () => {
  const applicant: Family = {
    ...reunion,
    member: 'registered-partner',
    formedLegallyInGreece: true,
    sponsor: 'blue-card',
    jointInitialApplication: true,
  };
  for (const [
    entry,
    sponsorPermitValid,
    relationshipAndDocumentsGenuine,
    expected,
  ] of [
    ['permit', false, true, 'NOT_MET'],
    ['short-stay', true, true, 'NOT_MET'],
    ['permit', true, false, 'NOT_MET'],
    ['permit', true, undefined, 'UNKNOWN'],
  ] as const) {
    const result = route('GR-FAMILY-TCN', {
      entry,
      familyTcn: {
        ...applicant,
        sponsorPermitValid,
        relationshipAndDocumentsGenuine,
      },
    });
    expect(result.status).toBe(expected);
  }
});

test.each(['residence', 'divorce'] as const)(
  'Ο.2 accepts a documented former Ο.1 partner on the %s basis',
  (autonomousBasis) => {
    const result = route('GR-FAMILY-TCN', {
      familyTcn: {
        stage: 'autonomous',
        member: 'registered-partner',
        sponsor: 'ordinary',
        previousFamilyCard: true,
        autonomousBasis,
        otherResidencePermitGranted: false,
        relationshipAndDocumentsGenuine: true,
        yearsSinceFirstFamilyPermit: 5,
        familyResidenceYears: 5,
        priorMarriageYears: 3,
        priorMarriageYearsInGreece: 1,
      },
    });
    expect(result.checks.find((item) => item.id === 'FT-07')?.status).toBe(
      'MET',
    );
    expect(result.status).toBe('MET');
  },
);

test('a missing birth date leaves age-dependent Ο.1 qualification and fees open', () => {
  const request = { birthDate: undefined };
  const child: Family = {
    member: 'child',
    unmarriedChildWithCustodyAndConsent: true,
    adultChildIncapacityDependencyProved: false,
  };
  const result = route('GR-FAMILY-TCN', {
    ...request,
    familyTcn: { ...reunion, ...child },
  });
  expect(result.checks.find((item) => item.id === 'FT-05')?.status).toBe(
    'UNKNOWN',
  );
  expect(result.checks.find((item) => item.id === 'FT-06')?.status).toBe(
    'UNKNOWN',
  );
  expect(result.status).toBe('UNKNOWN');
  expect(
    family(
      'FT-05',
      { ...child, adultChildIncapacityDependencyProved: true },
      request,
    ).status,
  ).toBe('MET');
  expect(
    family(
      'FT-05',
      { ...child, unmarriedChildWithCustodyAndConsent: false },
      request,
    ).status,
  ).toBe('NOT_MET');
  expect(family('FT-05', { member: 'spouse' }, request).status).toBe('UNKNOWN');
  expect(
    family('FT-05', { member: 'spouse', sponsor: 'investor' }, request).status,
  ).toBe('MET');
  expect(work('WK-INVITATION-AGE', {}, request).status).toBe('UNKNOWN');
});

test.each([
  [false, true, 'MET'],
  [true, false, 'NOT_MET'],
  [true, undefined, 'UNKNOWN'],
] as const)(
  'Ο.1 renewal checks the family tax record, including domestic formation (%s, %s)',
  (formedLegallyInGreece, priorYearTaxAndInsuranceEvidence, status) => {
    const result = route('GR-FAMILY-TCN', {
      currentCardExpiresOn: '2026-12-01',
      familyTcn: {
        ...reunion,
        stage: 'renewal',
        sponsorPermitValid: true,
        housingDocument: 'none',
        formedLegallyInGreece,
        priorYearTaxAndInsuranceEvidence,
        familyLifeContinues: true,
      },
    });
    expect(result.checks.map((item) => item.id)).not.toContain('FT-03');
    expect(result.checks.find((item) => item.id === 'FT-02')?.status).toBe(
      status,
    );
    expect(result.checks.find((item) => item.id === 'FT-08')?.status).toBe(
      'MET',
    );
    expect(result.status).toBe(status);
    expect(result.earliestDate).toBeUndefined();
  },
);

test.each([
  [true, 1, false, 'MET'],
  [false, 2, true, 'NOT_MET'],
  [undefined, 2, true, 'UNKNOWN'],
  [undefined, 0, false, 'NOT_MET'],
] as const)(
  'Ο.1 renewal follows the current sponsor status (%s, issued term %s, permanent prospect %s)',
  (
    sponsorPermitValid,
    sponsorPermitDurationYears,
    sponsorPermitLeadsToPermanentResidence,
    status,
  ) => {
    const result = route('GR-FAMILY-TCN', {
      currentCardExpiresOn: '2026-12-01',
      familyTcn: {
        ...reunion,
        stage: 'renewal',
        sponsorPermitValid,
        sponsorPermitDurationYears,
        sponsorPermitLeadsToPermanentResidence,
        sponsorLawfulYears: 0,
        familyLifeContinues: true,
      },
    });
    expect(result.checks.find((item) => item.id === 'FT-01')?.status).toBe(
      status,
    );
    expect(result.status).toBe(status);
    expect(result.earliestDate).toBeUndefined();
  },
);

test.each([
  [true, 'MET'],
  [false, 'NOT_MET'],
  [undefined, 'UNKNOWN'],
] as const)(
  'Ο.1 ordinary initial sponsor with four lawful years and current permit %s',
  (sponsorPermitValid, status) => {
    const result = route('GR-FAMILY-TCN', {
      familyTcn: { ...reunion, sponsorLawfulYears: 4, sponsorPermitValid },
    });
    expect(result.checks.find((item) => item.id === 'FT-01')?.status).toBe(
      status,
    );
    expect(result.status).toBe(status);
    expect(result.earliestDate).toBeUndefined();
  },
);

test.each([
  ['investor', 'MET', 'UNKNOWN'],
  ['intra-corporate', 'MET', 'UNKNOWN'],
  ['special-employment', 'MET', 'UNKNOWN'],
  ['researcher', 'MET', 'UNKNOWN'],
  ['refugee', 'UNKNOWN', 'UNKNOWN'],
  ['excluded', 'NOT_MET', 'NOT_MET'],
] as const)(
  'Ο.1 separate initial filing checks the current %s sponsor permit',
  (sponsor, validStatus, missingStatus) => {
    for (const [sponsorPermitValid, expected] of [
      [true, validStatus],
      [false, 'NOT_MET'],
      [undefined, missingStatus],
    ] as const) {
      const result = route('GR-FAMILY-TCN', {
        familyTcn: { ...reunion, sponsor, sponsorPermitValid },
      });
      expect(result.checks.find((item) => item.id === 'FT-01')?.status).toBe(
        expected,
      );
      expect(result.status).toBe(expected);
    }
  },
);

test.each([
  ['pending', 'UNKNOWN'],
  ['valid-certificate', 'MET'],
] as const)(
  'Ο.1 separate investor filing with an expired card and %s renewal evidence',
  (sponsorRenewal, expected) => {
    const result = route('GR-FAMILY-TCN', {
      familyTcn: {
        ...reunion,
        sponsor: 'investor',
        sponsorPermitValid: false,
        sponsorRenewal,
      },
    });
    expect(result.checks.find((item) => item.id === 'FT-01')?.status).toBe(
      expected,
    );
    expect(result.status).toBe(expected);
  },
);

test.each([
  [undefined, false, 'NOT_MET'],
  [false, false, 'NOT_MET'],
  [false, true, 'MET'],
  [false, undefined, 'UNKNOWN'],
  [true, false, 'MET'],
  [true, undefined, 'MET'],
] as const)(
  'Ο.1 initial Blue Card family: joint filing %s, currently valid card %s',
  (jointBlueCardApplication, sponsorPermitValid, status) => {
    const result = route('GR-FAMILY-TCN', {
      entry: 'national-visa',
      familyTcn: {
        ...reunion,
        sponsor: 'blue-card',
        sponsorLawfulYears: 0,
        sponsorPermitLeadsToPermanentResidence: false,
        sponsorPermitValid,
        jointBlueCardApplication,
      },
    });
    expect(result.checks.find((item) => item.id === 'FT-01')?.status).toBe(
      status,
    );
    expect(result.status).toBe(status);
    expect(result.earliestDate).toBeUndefined();
  },
);

test.each([
  ['blue-card', '42(3)'],
  ['intra-corporate', '56(5)(β)'],
  ['researcher', '112(2)'],
] as const)(
  'Ο.1 joint and separate first applications before the %s permit is issued',
  (sponsor, clause) => {
    const applicant = {
      ...reunion,
      sponsor,
      sponsorPermitValid: false,
      sponsorPermitDurationYears: 0,
    };
    for (const jointInitialApplication of [true, false]) {
      const result = route('GR-FAMILY-TCN', {
        familyTcn: { ...applicant, jointInitialApplication },
      });
      const status = jointInitialApplication ? 'MET' : 'NOT_MET';
      const permit = result.checks.find((item) => item.id === 'FT-01');
      expect(permit?.status).toBe(status);
      expect(result.status).toBe(status);
      if (jointInitialApplication) {
        expect(permit?.sources).toContainEqual(
          expect.objectContaining({
            srcId: 'SRC-086',
            locator: expect.stringContaining(clause),
          }),
        );
      }
    }
    const renewal = route('GR-FAMILY-TCN', {
      currentCardExpiresOn: '2026-12-01',
      familyTcn: {
        ...applicant,
        stage: 'renewal',
        jointInitialApplication: true,
        familyLifeContinues: true,
      },
    });
    expect(renewal.checks.find((item) => item.id === 'FT-01')?.status).toBe(
      'NOT_MET',
    );
    expect(renewal.status).toBe('NOT_MET');
  },
);

test.each([
  ['ordinary', 'NOT_MET'],
  ['special-employment', 'UNKNOWN'],
  ['investor', 'UNKNOWN'],
  ['refugee', 'UNKNOWN'],
  ['excluded', 'NOT_MET'],
] as const)(
  'Ο.1 joint first applications without an issued %s sponsor permit',
  (sponsor, status) => {
    const result = route('GR-FAMILY-TCN', {
      familyTcn: {
        ...reunion,
        sponsor,
        sponsorPermitValid: false,
        jointInitialApplication: true,
      },
    });
    const permit = result.checks.find((item) => item.id === 'FT-01');
    expect(permit?.status).toBe(status);
    if (status === 'UNKNOWN')
      expect(permit?.pendingDetails).toEqual(['PD-319']);
    expect(result.status).toBe(status);
  },
);

test.each([
  ['blue-card', false],
  ['intra-corporate', undefined],
] as const)(
  'the earlier Blue Card joint flag applies only to that category and yields to an explicit filing choice (%s)',
  (sponsor, jointInitialApplication) => {
    const result = route('GR-FAMILY-TCN', {
      familyTcn: {
        ...reunion,
        sponsor,
        sponsorPermitValid: false,
        jointBlueCardApplication: true,
        jointInitialApplication,
      },
    });
    expect(result.checks.find((item) => item.id === 'FT-01')?.status).toBe(
      'NOT_MET',
    );
    expect(result.status).toBe('NOT_MET');
  },
);

test('joint researcher filing still requires genuine family documents and distinguishes filing from issue', () => {
  const result = route('GR-FAMILY-TCN', {
    locale: 'en',
    familyTcn: {
      ...reunion,
      sponsor: 'researcher',
      jointInitialApplication: true,
      sponsorPermitValid: false,
      relationshipAndDocumentsGenuine: false,
    },
  });
  expect(result.checks.find((item) => item.id === 'FT-01')).toMatchObject({
    status: 'MET',
    explanation: expect.stringContaining(
      'only after the researcher is granted a permit',
    ),
  });
  expect(result.checks.find((item) => item.id === 'FT-08')?.status).toBe(
    'NOT_MET',
  );
  expect(result.status).toBe('NOT_MET');
});

test.each([
  ['short-stay', 'cleared', 'UNKNOWN', 'MET', 'UNKNOWN'],
  ['short-stay', 'possible-risk', 'UNKNOWN', 'UNKNOWN', 'UNKNOWN'],
  ['short-stay', 'entry-refused', 'UNKNOWN', 'NOT_MET', 'NOT_MET'],
  ['unlawful', 'cleared', 'NOT_MET', 'MET', 'NOT_MET'],
] as const)(
  'Ο.1 joint Blue Card filing with %s entry and %s health assessment',
  (entry, publicHealth, entryStatus, healthStatus, status) => {
    const result = route('GR-FAMILY-TCN', {
      entry,
      publicHealth,
      familyTcn: {
        ...reunion,
        sponsor: 'blue-card',
        sponsorPermitValid: false,
        jointBlueCardApplication: true,
      },
    });
    expect(result.checks.find((item) => item.id === 'FT-01')?.status).toBe(
      'MET',
    );
    const entryCheck = result.checks.find((item) => item.id === 'C-02');
    expect(entryCheck).toMatchObject({
      status: entryStatus,
      sources: expect.arrayContaining([
        expect.objectContaining({ srcId: 'SRC-376' }),
      ]),
    });
    if (entryStatus === 'UNKNOWN') {
      expect(entryCheck?.pendingDetails).toEqual(['PD-319']);
      expect(result.pendingDetails).toContain('PD-319');
    }
    expect(result.checks.find((item) => item.id === 'C-04')?.status).toBe(
      healthStatus,
    );
    expect(result.status).toBe(status);
  },
);

test.each([
  [false, 'UNKNOWN'],
  [undefined, 'UNKNOWN'],
  [true, 'MET'],
] as const)(
  'Ο.1 joint short-stay filing with sponsor Blue Card validity %s',
  (sponsorPermitValid, status) => {
    const result = route('GR-FAMILY-TCN', {
      entry: 'short-stay',
      familyTcn: {
        ...reunion,
        sponsor: 'blue-card',
        jointInitialApplication: true,
        sponsorPermitValid,
      },
    });
    expect(result.checks.find((item) => item.id === 'FT-01')?.status).toBe(
      'MET',
    );
    expect(result.checks.find((item) => item.id === 'C-02')?.status).toBe(
      status,
    );
    expect(result.status).toBe(status);
  },
);

test.each([
  ['national-visa', 'MET'],
  ['short-stay', 'MET'],
  ['unlawful', 'NOT_MET'],
] as const)(
  'Ο.1 spouse joining a current Blue Card holder after %s entry',
  (entry, status) => {
    const result = route('GR-FAMILY-TCN', {
      entry,
      familyTcn: {
        ...reunion,
        sponsor: 'blue-card',
        sponsorPermitValid: true,
        jointBlueCardApplication: false,
      },
    });
    expect(result.checks.find((item) => item.id === 'C-02')?.status).toBe(
      status,
    );
    expect(result.checks.find((item) => item.id === 'FT-01')?.status).toBe(
      'MET',
    );
    expect(result.status).toBe(status);
  },
);

test.each([
  ['national-visa', 'MET', 'UNKNOWN'],
  ['short-stay', 'MET', 'UNKNOWN'],
  ['permit', 'MET', 'UNKNOWN'],
  ['receipt', 'UNKNOWN', 'UNKNOWN'],
  ['restricted-permit', 'UNKNOWN', 'UNKNOWN'],
  ['outside', 'UNKNOWN', 'UNKNOWN'],
  [undefined, 'UNKNOWN', 'UNKNOWN'],
  ['unlawful', 'NOT_MET', 'NOT_MET'],
] as const)(
  'Ο.1 %s entry screens health and public order independently of lawful entry',
  (entry, entryStatus, pathWithHealthRisk) => {
    const request = {
      entry,
      familyTcn: { ...reunion, sponsor: 'blue-card' as const },
    };
    const risk = route('GR-FAMILY-TCN', {
      ...request,
      publicHealth: 'possible-risk',
    });
    expect(risk.checks.find((item) => item.id === 'C-02')?.status).toBe(
      entryStatus,
    );
    expect(risk.checks.find((item) => item.id === 'C-03')?.status).toBe('MET');
    expect(risk.checks.find((item) => item.id === 'C-04')).toMatchObject({
      status: 'UNKNOWN',
      pendingDetails: ['PD-302'],
    });
    expect(risk.status).toBe(pathWithHealthRisk);

    const refusal = route('GR-FAMILY-TCN', {
      ...request,
      publicHealth: 'entry-refused',
    });
    expect(refusal.checks.find((item) => item.id === 'C-04')?.status).toBe(
      'NOT_MET',
    );
    expect(refusal.status).toBe('NOT_MET');

    const adverse = route('GR-FAMILY-TCN', {
      ...request,
      publicOrder: 'adverse',
    });
    expect(adverse.checks.find((item) => item.id === 'C-03')?.status).toBe(
      'NOT_MET',
    );
    expect(adverse.checks.find((item) => item.id === 'C-04')?.status).toBe(
      'MET',
    );
    expect(adverse.status).toBe('NOT_MET');
  },
);

test.each([
  [1, 'NOT_MET'],
  [2, 'MET'],
  [undefined, 'UNKNOWN'],
] as const)(
  'Ο.1 initial sponsor with %s completed years and no start date',
  (sponsorLawfulYears, status) => {
    const result = route('GR-FAMILY-TCN', {
      familyTcn: { ...reunion, sponsorLawfulYears },
    });
    expect(result.checks.find((item) => item.id === 'FT-01')?.status).toBe(
      status,
    );
    expect(result.status).toBe(status);
    expect(result.earliestDate).toBeUndefined();
  },
);

test.each([
  [4, undefined, 'NOT_MET', undefined],
  [5, undefined, 'MET', undefined],
  [undefined, undefined, 'UNKNOWN', undefined],
  [4, '2022-01-01', 'FUTURE', '2027-01-01'],
] as const)(
  'Ο.2 ordinary spouse with %s years and start date %s',
  (familyResidenceYears, familyResidenceFrom, status, earliestDate) => {
    const result = route('GR-FAMILY-TCN', {
      familyTcn: {
        ...reunion,
        stage: 'autonomous',
        autonomousBasis: 'residence',
        previousFamilyCard: true,
        familyResidenceYears,
        yearsSinceFirstFamilyPermit: familyResidenceYears,
        firstFamilyPermitIssuedOn: familyResidenceFrom,
        familyResidenceFrom,
      },
    });
    expect(result.checks.find((item) => item.id === 'FT-07')?.status).toBe(
      status === 'FUTURE' ? 'NOT_MET' : status,
    );
    expect(result.status).toBe(status);
    expect(result.earliestDate).toBe(earliestDate);
  },
);

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
  test('Ε.1 renewal projected across New Year needs the salary threshold for the filing year', () => {
    const request: Partial<GrFullRequest> = {
      entry: 'permit',
      currentCardExpiresOn: '2025-03-02',
      work: { ...blue, stage: 'renewal', taxesSettledDuringPermit: true },
    };
    for (const simulationDate of ['2024-12-31', '2025-01-02']) {
      const result = route('GR-WORK', { ...request, simulationDate });
      expect(result.checks.find((c) => c.id === 'WK-01')).toMatchObject({
        status: 'UNKNOWN',
        pendingDetails: ['PD-317'],
      });
      expect(result.status).toBe('UNKNOWN');
      expect(result.earliestDate).toBeUndefined();
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
        work('WK-05', {
          employer,
          employerLastYearGrossEur: 44000,
          agriculturalStaffingCertificate: 'provided',
        }).status,
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
    expect(
      work(
        'WK-06',
        { ...project, projectWorkersTotal: 500 },
        { entry: 'short-stay' },
      ).status,
    ).toBe('MET');
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
      work('WK-INVITATION-AGE', {}, { birthDate: '2008-11-23' }),
    ).toMatchObject({
      status: 'NOT_MET',
      explanation: expect.stringContaining('2026-11-24'),
    });
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
    ).toBe('MET');
    const renewal = {
      stage: 'renewal' as const,
      taxesSettledDuringPermit: true,
    };
    expect(
      work('WK-07', renewal, {
        insurance: { kind: 'gap', gapEvidence: 'unemployment-benefit' },
      }).status,
    ).toBe('UNKNOWN');
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
    for (const [qualification, status] of [
      ['missing', 'NOT_MET'],
      [undefined, 'UNKNOWN'],
    ] as const) {
      expect(
        work('WK-07-INTERRUPTION', {
          ...leave,
          protectedLeaveAccepted: true,
          qualification,
        }).status,
      ).toBe(status);
    }
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

test.each([
  ['2024-09-16', 'UNKNOWN'],
  ['2024-09-17', 'MET'],
] as const)(
  'family income uses the annual pay calculation in force on %s',
  (simulationDate, status) => {
    const result = route('GR-FAMILY-TCN', {
      simulationDate,
      familyTcn: reunion,
    });
    expect(result.checks.find((item) => item.id === 'FT-02')?.status).toBe(
      status,
    );
    expect(result.status).toBe(status);
    expect(result.earliestDate).toBeUndefined();
  },
);

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
    expect(family('FT-05', {}, { birthDate: '2008-11-24' })).toMatchObject({
      status: 'NOT_MET',
      explanation: expect.stringContaining('2026-11-24'),
    });
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
      yearsSinceFirstFamilyPermit: 5,
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

test('a pre-reform domestic visa switch needs the actual expiry to establish validity', () => {
  const req = {
    simulationDate: '2025-11-24',
    entry: 'national-visa',
    work: {
      ...employed,
      admission: 'domestic-switch',
      switchVisa: { kind: 'standalone-Z' },
    },
  } satisfies Partial<GrFullRequest>;
  const current = route('GR-WORK', req);
  expect(current.checks.find((check) => check.id === 'WK-06')?.status).toBe(
    'UNKNOWN',
  );
  const known = route('GR-WORK', {
    ...req,
    work: {
      ...req.work,
      switchVisa: { ...req.work.switchVisa, expiresOn: '2025-12-01' },
    },
  });
  expect(known.checks.find((check) => check.id === 'WK-06')?.status).toBe(
    'MET',
  );
});
