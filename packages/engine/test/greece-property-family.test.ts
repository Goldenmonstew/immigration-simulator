import { describe, expect, test } from 'vitest';
import { evaluateGreeceFull } from '../src';
import { propertyFamilyChecks } from '../src/greece-property-family';
import type { GrPropertyFamilyAnswers } from '../src/greece-property-family';
import type { GrFullRequest } from '../src/greece-full';
import { grContext } from '../src/greece-rules';
import type { GrInsurance } from '../src/greece-rules';

const simulationDate = '2026-11-23';
const insurance: GrInsurance = {
  kind: 'private',
  issuer: 'greek',
  coversFamily: true,
  disabilityEur: 15000,
  medicalEur: 1500,
  hospitalEur: 10000,
  maxCopayPercent: 20,
  hasDeductibleOrExclusions: false,
  policyMonths: 12,
};
type Investor = NonNullable<GrPropertyFamilyAnswers['goldenVisa']>;
type Greek = NonNullable<GrPropertyFamilyAnswers['greekFamily']>;
type EU = NonNullable<GrPropertyFamilyAnswers['euFamily']>;
const investor: Investor = {
  stage: 'initial',
  regime: 'current',
  kind: 'standard',
  zone: 'named-high-cost',
  qualifyingValueEur: 800000,
  title: 'sole',
  acquisition: 'purchase',
  propertyCount: 1,
  builtOrBuildingPermit: true,
  mainAreaSqm: 120,
  fullyPaidAndConditionsReleased: true,
  payment: 'bank-transfer',
  payer: 'applicant',
  notarialEvidence: true,
  renewalUseDeclarationsReady: true,
  registeredTransferEvidence: true,
  e9DeclarationCopy: true,
  use: 'residential-or-long-let',
  worksInGreeceUnderThisPermit: false,
  family: [],
  nationalVisas: 0,
};
const greek: Greek = {
  stage: 'permanent',
  relationship: 'spouse',
  registeredInGreece: true,
  genuineRelationship: true,
  initialFamilyDocumentsReady: true,
  retainedRightDocumentsReady: true,
  historicalConversionDocumentsReady: true,
  residenceFrom: '2021-11-23',
  qualifyingResidenceDocumented: true,
  priorCardExpiry: '2026-11-23',
  maxAnnualAbsenceMonths: 6,
};
const european: EU = {
  stage: 'permanent',
  qualifyingNonGreekEuSponsor: true,
  relationship: 'spouse',
  sponsorExercisedTreatyRights: true,
  qualifyingResidenceDocumented: true,
  residenceFrom: '2021-11-23',
  priorCardExpiry: '2026-12-10',
  maxOrdinaryAnnualAbsenceMonths: 6,
  seriousAbsenceCount: 1,
  maxSeriousAbsenceMonths: 12,
  rightsDocumentsReady: true,
  shamOrFraud: false,
  early: { basis: 'none' },
};

function read(
  path: Parameters<typeof propertyFamilyChecks>[0],
  rule: string,
  req: Partial<GrFullRequest>,
) {
  const checks = propertyFamilyChecks(
    path,
    { simulationDate, insurance, publicOrder: 'clear', ...req },
    grContext('en'),
  );
  const found = checks.find((x) => x.id === rule);
  if (!found) throw new Error(`Missing ${rule}`);
  return found;
}
function gv(
  id: string,
  a: Partial<Investor>,
  req: Partial<GrFullRequest> = {},
) {
  return read('GR-GOLDEN-VISA', id, {
    goldenVisa: { ...investor, ...a },
    ...req,
  });
}
function gf(id: string, a: Partial<Greek>, req: Partial<GrFullRequest> = {}) {
  return read('GR-GREEK-FAMILY-PR', id, {
    greekFamily: { ...greek, ...a },
    ...req,
  });
}
function ef(id: string, a: Partial<EU>, req: Partial<GrFullRequest> = {}) {
  return read('GR-EU-FAMILY-PR', id, {
    euFamily: { ...european, ...a },
    ...req,
  });
}

describe('Β.5 property and family conditions', () => {
  test('purchase tiers use an individual qualifying share, the strict island census boundary and single property', () => {
    expect(gv('GV-01', {}).status).toBe('MET');
    expect(
      gv('GV-01', { title: 'own-share', qualifyingValueEur: 799999 }).status,
    ).toBe('NOT_MET');
    expect(
      gv('GV-01', {
        zone: 'other-island',
        censusPopulation: 3100,
        qualifyingValueEur: 400000,
      }).status,
    ).toBe('MET');
    expect(
      gv('GV-01', {
        zone: 'other-island',
        censusPopulation: 3101,
        qualifyingValueEur: 400000,
      }).status,
    ).toBe('NOT_MET');
    expect(
      gv('GV-01', { zone: 'other-mainland', qualifyingValueEur: 399999 })
        .status,
    ).toBe('NOT_MET');
    expect(
      gv('GV-01', { zone: 'other-island', qualifyingValueEur: 799999 }),
    ).toMatchObject({
      status: 'UNKNOWN',
      pendingDetails: ['PD-306'],
    });
    expect(gv('GV-01', { propertyCount: 2 }).status).toBe('NOT_MET');
  });
  test('special route €250,000 and five inactive factory years; standard floor area 120 m²', () => {
    const converted: Partial<Investor> = {
      kind: 'factory-conversion',
      qualifyingValueEur: 250000,
      conversionComplete: true,
      conversionActDate: '2024-04-05',
      factoryIdleYears: 5,
      mainAreaSqm: 47,
    };
    expect(gv('GV-01', converted).status).toBe('MET');
    expect(
      gv('GV-01', { ...converted, qualifyingValueEur: 249999 }).status,
    ).toBe('NOT_MET');
    expect(
      gv('GV-01', { ...converted, conversionComplete: false }).status,
    ).toBe('NOT_MET');
    expect(gv('GV-01', { ...converted, factoryIdleYears: 4.99 }).status).toBe(
      'NOT_MET',
    );
    expect(gv('GV-02', converted).status).toBe('MET');
    expect(gv('GV-02', {}).status).toBe('MET');
    expect(gv('GV-02', { mainAreaSqm: 119.99 }).status).toBe('NOT_MET');
    expect(
      gv('GV-02', { builtOrBuildingPermit: false, mainAreaSqm: undefined })
        .status,
    ).toBe('MET');
  });
  test('payment channel, payer, settlement and seller records', () => {
    expect(gv('GV-03', { payer: 'relative-within-second-degree' }).status).toBe(
      'MET',
    );
    for (const answer of [
      { payment: 'other' },
      { payer: 'other' },
      { notarialEvidence: false },
      { fullyPaidAndConditionsReleased: false },
    ] as const)
      expect(gv('GV-03', answer).status).toBe('NOT_MET');
    expect(gv('GV-03', { payer: undefined }).status).toBe('UNKNOWN');
  });
  test('original grant and completed transition exempt, new short leases and converted offices barred', () => {
    expect(gv('GV-04', {}).status).toBe('MET');
    expect(gv('GV-04', { use: 'short-let-or-short-sublet' })).toMatchObject({
      status: 'NOT_MET',
      explanation: expect.stringContaining('€50000'),
    });
    expect(
      gv('GV-04', {
        regime: 'legacy-card',
        stage: 'renewal',
        use: 'short-let-or-short-sublet',
        originalConditionsStillMet: true,
      }).status,
    ).toBe('MET');
    expect(
      gv('GV-04', {
        regime: 'legacy-card',
        stage: 'renewal',
        use: 'short-let-or-short-sublet',
      }),
    ).toMatchObject({ status: 'UNKNOWN', pendingDetails: ['PD-308'] });
    expect(
      gv('GV-04', {
        kind: 'conversion',
        qualifyingValueEur: 250000,
        use: 'business-office',
      }).status,
    ).toBe('NOT_MET');
    expect(gv('GV-05', {}).status).toBe('MET');
    expect(gv('GV-05', { worksInGreeceUnderThisPermit: true }).status).toBe(
      'NOT_MET',
    );
  });
  test('private insurance extends to each dependant; public insurance alone fails', () => {
    const family: Investor['family'] = [
      { kind: 'spouse-partner', birthDate: '1992-11-23' },
    ];
    expect(gv('GV-06', { family }).status).toBe('MET');
    expect(
      gv(
        'GV-06',
        { family },
        { insurance: { ...insurance, coversFamily: false } },
      ).status,
    ).toBe('NOT_MET');
    expect(
      gv('GV-06', {}, { insurance: { ...insurance, medicalEur: 1499 } }).status,
    ).toBe('NOT_MET');
    expect(gv('GV-06', {}, { insurance: { kind: 'public' } }).status).toBe(
      'NOT_MET',
    );
  });
  test.each(['initial', 'renewal'] as const)(
    'Β.5 uses the same documented relationships at %s',
    (stage) => {
      for (const kind of [
        'spouse',
        'registered-partner',
        'ascendant',
      ] as const) {
        expect(
          gv('GV-09', { stage, family: [{ kind, filingDocumentsReady: true }] })
            .status,
        ).toBe('MET');
      }
      expect(gv('GV-09', { stage, family: [{ kind: 'other' }] }).status).toBe(
        'NOT_MET',
      );
    },
  );
  test('under 21 and unmarried, recognised incapacity, and previous family card converting at 21', () => {
    const child = {
      kind: 'child',
      birthDate: '2006-11-23',
      filingDocumentsReady: true,
      unmarriedWithRequiredCustody: true,
    } as const;
    const at21 = {
      ...child,
      birthDate: '2005-11-23',
      incapacityDocumentedAndLivingAsDependant: false,
      convertingPreviousFamilyCard: false,
    };
    expect(gv('GV-09', { family: [child] }).status).toBe('MET');
    expect(gv('GV-09', { family: [at21] }).status).toBe('NOT_MET');
    expect(
      gv('GV-09', { family: [{ ...at21, convertingPreviousFamilyCard: true }] })
        .status,
    ).toBe('MET');
    expect(
      gv('GV-09', {
        family: [
          {
            ...at21,
            birthDate: '2001-11-23',
            incapacityDocumentedAndLivingAsDependant: true,
          },
        ],
      }).status,
    ).toBe('MET');
    expect(gv('GV-09', { family: undefined }).status).toBe('UNKNOWN');
    expect(
      gv('GV-09', { family: [{ ...at21, birthDate: undefined }] }).status,
    ).toBe('UNKNOWN');
  });
  test('family cost includes all four cards, minor exemption and per-person visa cost', () => {
    const family: Investor['family'] = [
      { kind: 'ascendant', birthDate: '1956-11-23' },
      { kind: 'child', birthDate: '2009-11-23' },
      {
        kind: 'child',
        birthDate: '2005-11-23',
        convertingPreviousFamilyCard: true,
      },
    ];
    // 2000 + 150 + 0 + 450 + 4 × 16 + 2 × 180 = 3024.
    expect(gv('GV-07', { family, nationalVisas: 2 }).explanation).toContain(
      'Total €3024',
    );
    expect(gv('GV-07', {}).explanation).toContain('Total €2016');
    expect(gv('GV-07', { family: undefined }).explanation).not.toContain(
      'Total €',
    );
    const child = { kind: 'child', birthDate: '2008-11-24' } as const;
    expect(gv('GV-07', { family: [child] }).explanation).toContain(
      'Total €2032',
    );
    expect(
      gv('GV-07', { family: [child] }, { simulationDate: '2026-11-24' })
        .explanation,
    ).toContain('Total €2182');
    expect(gv('GV-07', { family: [{ kind: 'child' }] }).status).toBe('UNKNOWN');
    expect(gv('GV-07', { family: [], nationalVisas: undefined }).status).toBe(
      'MET',
    );
  });
  test('renewal requires continued ownership and completed restoration by first renewal', () => {
    const listed: Partial<Investor> = {
      stage: 'renewal',
      kind: 'listed',
      originalGrantTier: 'listed',
      retainsInvestment: true,
      listedRestorationComplete: true,
    };
    expect(gv('GV-08', listed).status).toBe('MET');
    expect(
      gv('GV-08', { ...listed, listedRestorationComplete: false }),
    ).toMatchObject({
      status: 'NOT_MET',
      explanation: expect.stringContaining('€150000'),
    });
    expect(gv('GV-08', { ...listed, retainsInvestment: false }).status).toBe(
      'NOT_MET',
    );
  });
  test('deposit, legacy amount and February completion or replacement through April', () => {
    const t: Partial<Investor> = {
      regime: 'transition',
      originalConditionsStillMet: true,
      legacyZone: 'legacy-high',
      qualifyingValueEur: 500000,
      depositPercent: 10,
      depositDate: '2024-08-31',
      closingDate: '2025-02-28',
      replacementProperty: false,
    };
    expect(gv('GV-10', t).status).toBe('MET');
    expect(gv('GV-10', { ...t, depositPercent: 9.99 }).status).toBe('NOT_MET');
    expect(gv('GV-10', { ...t, qualifyingValueEur: 499999 }).status).toBe(
      'NOT_MET',
    );
    expect(
      gv('GV-10', {
        ...t,
        legacyZone: 'legacy-other',
        qualifyingValueEur: 250000,
      }).status,
    ).toBe('MET');
    expect(gv('GV-10', { ...t, depositDate: '2024-09-01' }).status).toBe(
      'NOT_MET',
    );
    expect(gv('GV-10', { ...t, closingDate: '2025-03-01' }).status).toBe(
      'NOT_MET',
    );
    expect(
      gv('GV-10', {
        ...t,
        replacementProperty: true,
        closingDate: '2025-04-30',
      }).status,
    ).toBe('MET');
    expect(
      gv('GV-10', {
        ...t,
        replacementProperty: true,
        closingDate: '2025-05-01',
      }).status,
    ).toBe('NOT_MET');
    expect(gv('GV-04', { ...t, use: 'short-let-or-short-sublet' }).status).toBe(
      'MET',
    );
  });
});

describe('Ο.3 and Μ.3 Greek citizen family', () => {
  test.each(['initial', 'renewal', 'permanent'] as const)(
    'Ο.3 and Μ.3 accept documented child incapacity and consular civil partnerships at %s',
    (stage) => {
      expect(
        gf('GF-01', {
          stage,
          relationship: 'registered-partner',
          registeredInGreece: false,
          partnershipConcludedAt: 'greek-consulate',
        }).status,
      ).toBe('MET');
      expect(
        gf('GF-01', {
          stage,
          relationship: 'registered-partner',
          partnershipConcludedAt: 'other',
        }).status,
      ).toBe('NOT_MET');
      const child = {
        stage,
        relationship: 'child-with-incapacity',
        incapacityDocumentedAndLivingAsDependant: true,
      } as const;
      expect(gf('GF-01', child, { birthDate: '2008-11-23' }).status).toBe(
        'MET',
      );
      expect(gf('GF-01', child).status).toBe('UNKNOWN');
      expect(
        gf(
          'GF-01',
          { ...child, incapacityDocumentedAndLivingAsDependant: false },
          { birthDate: '2000-01-01' },
        ).status,
      ).toBe('UNKNOWN');
      expect(
        gf('GF-01', {
          ...child,
          dependent: true,
          incapacityDocumentedAndLivingAsDependant: false,
        }).status,
      ).toBe('MET');
      expect(
        gf(
          'GF-01',
          {
            ...child,
            dependent: false,
            incapacityDocumentedAndLivingAsDependant: false,
          },
          { birthDate: '2000-01-01' },
        ).status,
      ).toBe('NOT_MET');
      expect(
        gf('GF-01', { stage, relationship: 'descendant', dependent: true })
          .status,
      ).toBe('MET');
    },
  );
  test('Ο.3 checks the resident Greek minor’s birthday and the applicant sibling’s own birthday', () => {
    const parent = {
      stage: 'initial',
      relationship: 'parent-of-resident-greek-minor',
    } as const;
    expect(gf('GF-01', parent).status).toBe('UNKNOWN');
    expect(
      gf('GF-01', { ...parent, greekRelativeBirthDate: '2008-11-24' }).status,
    ).toBe('MET');
    expect(
      gf('GF-01', { ...parent, greekRelativeBirthDate: '2008-11-23' }).status,
    ).toBe('NOT_MET');
    const sibling = {
      ...parent,
      relationship: 'minor-sibling-of-resident-greek-minor',
      greekRelativeBirthDate: '2015-06-01',
    } as const;
    expect(gf('GF-01', sibling).status).toBe('UNKNOWN');
    expect(gf('GF-01', sibling, { birthDate: '2008-11-24' }).status).toBe(
      'MET',
    );
    expect(gf('GF-01', sibling, { birthDate: '2008-11-23' }).status).toBe(
      'NOT_MET',
    );
    expect(
      gf(
        'GF-01',
        { ...sibling, stage: 'permanent', initialCardGrantedOn: '2021-11-23' },
        { birthDate: '2008-11-23' },
      ).status,
    ).toBe('MET');
  });
  test('Ο.3 checks the age of a sibling at expiry for the single additional term', () => {
    const renewal = {
      stage: 'renewal',
      relationship: 'minor-sibling-of-resident-greek-minor',
      priorCardExpiry: '2026-12-15',
      permanentRightAtCardExpiry: false,
      ordinaryRenewalDocumentsReady: true,
      siblingExtensionAlreadyGranted: false,
    } as const;
    expect(gf('GF-08', renewal, { birthDate: '2005-12-16' }).status).toBe(
      'MET',
    );
    expect(gf('GF-08', renewal, { birthDate: '2005-12-15' }).status).toBe(
      'NOT_MET',
    );
    expect(gf('GF-08', renewal).status).toBe('UNKNOWN');
    expect(
      gf(
        'GF-08',
        { ...renewal, siblingExtensionAlreadyGranted: true },
        { birthDate: '2005-12-16' },
      ).status,
    ).toBe('NOT_MET');
  });
  test('initial recognised relation, age/dependency and application for public cover', () => {
    expect(gf('GF-01', { stage: 'initial' }).status).toBe('MET');
    expect(gf('GF-01', { registeredInGreece: false }).status).toBe('NOT_MET');
    expect(
      gf(
        'GF-01',
        { relationship: 'descendant', dependent: false },
        { birthDate: '2005-11-24' },
      ).status,
    ).toBe('MET');
    expect(
      gf(
        'GF-01',
        { relationship: 'descendant', dependent: false },
        { birthDate: '2005-11-23' },
      ).status,
    ).toBe('NOT_MET');
    expect(
      gf(
        'GF-02',
        { stage: 'initial', appliedForFullPublicCover: true },
        { insurance: undefined },
      ).status,
    ).toBe('MET');
    expect(
      gf(
        'GF-02',
        { stage: 'initial', appliedForFullPublicCover: false },
        { insurance: { kind: 'uninsured' } },
      ).status,
    ).toBe('NOT_MET');
  });
  test('five-year inclusive anniversary, actual residence interruption and unresolved longer absences', () => {
    expect(gf('GF-03', {}).status).toBe('MET');
    expect(gf('GF-03', { residenceFrom: '2021-11-24' })).toMatchObject({
      status: 'NOT_MET',
      explanation: expect.stringContaining('2026-11-24'),
    });
    expect(gf('GF-03', { maxAnnualAbsenceMonths: 7 })).toMatchObject({
      status: 'UNKNOWN',
      pendingDetails: ['PD-314'],
    });
    expect(
      gf('GF-03', {
        maxAnnualAbsenceMonths: 12,
        extendedAbsence: 'single-serious-reason',
        extendedAbsenceMonths: 12,
      }).status,
    ).toBe('MET');
    expect(
      gf('GF-03', {
        maxAnnualAbsenceMonths: 11,
        extendedAbsence: 'compulsory-service',
      }).status,
    ).toBe('MET');
    expect(
      gf('GF-03', {
        priorCardExpiry: '2023-11-23',
        interruptionAfterExpiryYears: 2,
      }).status,
    ).toBe('MET');
    expect(
      gf('GF-03', {
        priorCardExpiry: '2023-11-23',
        interruptionAfterExpiryYears: 2.01,
      }).status,
    ).toBe('NOT_MET');
  });
  test('divorce duration counts to filing of divorce, two-month retained-card window counts from dissolution', () => {
    const r: NonNullable<Greek['retention']> = {
      basis: 'divorce',
      marriageFrom: '2022-09-01',
      greeceResidenceFrom: '2024-09-01',
      divorceDurationEnd: '2025-09-01',
      eventDate: '2026-09-23',
      livelihood: 'employment',
    };
    expect(gf('GF-04', { stage: 'retained', retention: r }).status).toBe('MET');
    for (const patch of [
      { marriageFrom: '2022-09-02' },
      { greeceResidenceFrom: '2024-09-02' },
      { eventDate: '2026-09-22' },
      { livelihood: 'none' },
    ] as const)
      expect(
        gf('GF-04', { stage: 'retained', retention: { ...r, ...patch } })
          .status,
      ).toBe('NOT_MET');
    expect(
      gf('GF-04', {
        stage: 'retained',
        retention: {
          basis: 'widowhood',
          greeceResidenceFrom: '2025-11-23',
          eventDate: simulationDate,
          livelihood: 'qualifying-family',
        },
      }).status,
    ).toBe('MET');
  });
  test('permanent card loss strictly after two years, previous conviction pending assessment', () => {
    expect(
      gf('GF-05', { stage: 'maintain', longestAbsenceAfterPrYears: 2 }).status,
    ).toBe('MET');
    expect(
      gf('GF-05', { stage: 'maintain', longestAbsenceAfterPrYears: 2.01 })
        .status,
    ).toBe('NOT_MET');
    expect(gf('GF-05', {}, { publicOrder: 'review' })).toMatchObject({
      status: 'UNKNOWN',
      pendingDetails: ['PD-301'],
    });
  });
  test('€0 filing and €16 card, €50 fine first applies a day after the one-year anniversary', () => {
    expect(
      gf('GF-06', { priorCardExpiry: '2025-11-23' }).explanation,
    ).toContain('No late filing fine.');
    expect(gf('GF-06', { priorCardExpiry: '2025-11-22' }).explanation).toMatch(
      /€0.*€16.*Add €50/,
    );
    expect(gf('GF-06', { priorCardExpiry: undefined }).explanation).toContain(
      'possible €50',
    );
  });
});

describe('Ν EU family', () => {
  test.each([
    [
      {
        relationship: 'registered-partner',
        partnershipRecognisedAsMarriageEquivalent: true,
      },
      'MET',
    ],
    [{ relationship: 'registered-partner' }, 'UNKNOWN'],
    [
      { relationship: 'ascendant', dependent: true, studentSponsor: false },
      'MET',
    ],
    [
      { relationship: 'ascendant', dependent: false, studentSponsor: false },
      'NOT_MET',
    ],
    [
      { relationship: 'ascendant', dependent: true, studentSponsor: true },
      'UNKNOWN',
    ],
    [
      {
        relationship: 'ascendant',
        dependent: true,
        studentSponsor: true,
        extendedFamilyRecognised: true,
      },
      'MET',
    ],
    [
      { relationship: 'durable-partner', extendedFamilyRecognised: false },
      'NOT_MET',
    ],
    [
      { relationship: 'durable-partner', extendedFamilyRecognised: true },
      'MET',
    ],
    [{ relationship: 'extended-family' }, 'UNKNOWN'],
    [
      { relationship: 'extended-family', extendedFamilyRecognised: true },
      'MET',
    ],
    [
      { relationship: 'descendant', studentSponsor: true, dependent: false },
      'NOT_MET',
    ],
    [{ relationship: 'descendant', dependent: true }, 'MET'],
    [
      {
        relationship: 'descendant',
        incapacityDocumentedAndLivingAsDependant: true,
      },
      'MET',
    ],
    [
      {
        relationship: 'other',
        qualifyingNonGreekEuSponsorAndRelationship: true,
      },
      'NOT_MET',
    ],
  ] as const)('EU family relationship %j gives %s', (facts, expected) => {
    expect(ef('EF-01', facts).status).toBe(expected);
  });
  test.each([
    ['2000-11-24', 'MET'],
    ['2000-11-23', 'NOT_MET'],
    [undefined, 'UNKNOWN'],
  ] as const)(
    'permanent Ν checks a descendant born on %s at the start of treaty residence',
    (birthDate, status) => {
      const euFamily = {
        ...european,
        relationship: 'descendant',
        studentSponsor: false,
        dependent: false,
      } as const;
      const result = evaluateGreeceFull({
        filingDocuments: { formReady: true, feeReceiptReady: true },
        pathways: ['GR-EU-FAMILY-PR'],
        simulationDate,
        birthDate,
        euFamily,
        citizenship: 'third-country',
        publicOrder: 'clear',
        passport: { kind: 'exception-granted' },
        biometrics: 'provided',
      }).columns[0].pathways[0];
      expect(result.checks.find((x) => x.id === 'EF-01')?.status).toBe(status);
      expect(result.status).toBe(status);
    },
  );
  test.each([
    ['2008-11-24', 'MET'],
    ['2008-11-23', 'NOT_MET'],
    [undefined, 'UNKNOWN'],
  ] as const)(
    'access in Greece checks the child’s birthday %s',
    (childBirthDate, status) => {
      expect(
        ef('EF-04', {
          stage: 'retained',
          retention: {
            basis: 'access-in-greece',
            childBirthDate,
            eventDate: '2025-01-01',
            livelihood: 'employment',
          },
        }).status,
      ).toBe(status);
    },
  );
  test.each([
    ['1965-06-20', 'MET'],
    ['1965-06-21', 'NOT_MET'],
    [undefined, 'UNKNOWN'],
  ] as const)(
    'retirement without statutory pension rights uses the worker’s birthday %s at cessation',
    (sponsorBirthDate, expected) => {
      expect(
        ef('EF-02', {
          residenceFrom: '2022-01-01',
          early: {
            basis: 'self-employed-retirement-without-pension',
            sponsorBirthDate,
            eventDate: '2025-06-20',
            greekSpouseDurationExemption: true,
            livedTogetherAtEvent: true,
          },
        }).status,
      ).toBe(expected);
    },
  );
  test('evidence of treaty residence and regular five years', () => {
    expect(ef('EF-01', {}).status).toBe('MET');
    expect(ef('EF-01', { sponsorExercisedTreatyRights: false }).status).toBe(
      'NOT_MET',
    );
    expect(ef('EF-02', {}).status).toBe('MET');
    expect(ef('EF-02', { residenceFrom: '2021-11-24' })).toMatchObject({
      status: 'NOT_MET',
      explanation: expect.stringContaining('2026-11-24'),
    });
  });
  test('early retirement: over three years and at least twelve working months', () => {
    const early: NonNullable<EU['early']> = {
      basis: 'retirement',
      eventDate: simulationDate,
      sponsorResidentFrom: '2023-11-22',
      precedingWorkMonths: 12,
      livedTogetherAtEvent: true,
      greekSpouseDurationExemption: false,
    };
    const a: Partial<EU> = { residenceFrom: '2023-11-22', early };
    expect(ef('EF-02', a).status).toBe('MET');
    expect(
      ef('EF-02', {
        ...a,
        early: { ...early, sponsorResidentFrom: '2023-11-23' },
      }).status,
    ).toBe('NOT_MET');
    expect(
      ef('EF-02', { ...a, early: { ...early, precedingWorkMonths: 11 } })
        .status,
    ).toBe('NOT_MET');
    expect(
      ef('EF-02', {
        ...a,
        early: {
          ...early,
          basis: 'permanent-incapacity',
          sponsorResidentFrom: '2024-11-23',
        },
      }).status,
    ).toBe('NOT_MET');
    expect(
      ef('EF-02', {
        ...a,
        early: {
          ...early,
          basis: 'occupational-incapacity',
          sponsorResidentFrom: undefined,
        },
      }).status,
    ).toBe('MET');
  });
  test('absence limits, prior-card expiry and right after acquisition use independent clocks', () => {
    expect(ef('EF-03', {}).status).toBe('MET');
    expect(ef('EF-03', { maxOrdinaryAnnualAbsenceMonths: 6.01 }).status).toBe(
      'NOT_MET',
    );
    expect(ef('EF-03', { seriousAbsenceCount: 2 }).status).toBe('NOT_MET');
    expect(ef('EF-03', { maxSeriousAbsenceMonths: 12.01 }).status).toBe(
      'NOT_MET',
    );
    expect(ef('EF-03', { priorCardExpiry: '2025-11-23' }).status).toBe('MET');
    expect(ef('EF-03', { priorCardExpiry: '2025-11-22' }).status).toBe('MET');
    expect(
      ef('EF-03', { stage: 'maintain', longestAbsenceAfterPrYears: 2 }).status,
    ).toBe('MET');
    expect(
      ef('EF-03', { stage: 'maintain', longestAbsenceAfterPrYears: 2.01 })
        .status,
    ).toBe('NOT_MET');
  });
  test('employment retention, individual pension/resource assessment and fraud', () => {
    const r: NonNullable<EU['retention']> = {
      basis: 'custody',
      eventDate: simulationDate,
      livelihood: 'employment',
    };
    expect(ef('EF-04', { stage: 'retained', retention: r }).status).toBe('MET');
    expect(
      ef('EF-04', {
        stage: 'retained',
        retention: { ...r, livelihood: 'resources' },
      }),
    ).toMatchObject({ status: 'UNKNOWN', pendingDetails: ['PD-316'] });
    expect(
      ef('EF-04', { stage: 'retained', retention: { ...r, basis: 'none' } })
        .status,
    ).toBe('NOT_MET');
    expect(ef('EF-05', {}).status).toBe('MET');
    expect(ef('EF-05', { shamOrFraud: true }).status).toBe('NOT_MET');
    expect(ef('EF-05', {}, { publicOrder: 'review' }).status).toBe('UNKNOWN');
  });
  test('EU documents and costs apply the amended fine after a full year', () => {
    expect(ef('EF-06', {})).toMatchObject({
      status: 'MET',
      explanation: expect.stringContaining('card €16'),
    });
    expect(
      ef('EF-06', { priorCardExpiry: '2026-11-22' }).explanation,
    ).not.toContain('Late fine');
    expect(
      ef('EF-06', { priorCardExpiry: '2025-11-22' }).explanation,
    ).toContain('Late fine €50');
    expect(ef('EF-06', { rightsDocumentsReady: false }).status).toBe('NOT_MET');
  });
});

describe('property and family reviews through evaluateGreeceFull', () => {
  const full = (
    id: Parameters<typeof propertyFamilyChecks>[0],
    patch: Partial<GrFullRequest> = {},
  ) =>
    evaluateGreeceFull({
      filingDocuments: { formReady: true, feeReceiptReady: true },
      simulationDate,
      locale: 'en',
      pathways: [id],
      citizenship: 'third-country',
      birthDate: '1985-11-23',
      passport: {
        kind: 'recognised',
        issuedOn: '2021-01-01',
        expiresOn: '2030-01-01',
        expectedDeparture: '2027-01-01',
        blankPages: 2,
      },
      insurance,
      publicOrder: 'clear',
      biometrics: 'awaiting-appointment',
      publicHealth: 'cleared',
      entry: 'permit',
      greekFamily: greek,
      goldenVisa: investor,
      euFamily: european,
      ...patch,
    }).columns[0].pathways[0];
  function verify(
    path: ReturnType<typeof full>,
    rule: string,
    status: 'MET' | 'NOT_MET' | 'UNKNOWN' | 'FUTURE',
    earliestDate?: string,
  ) {
    const check = path.checks.find((x) => x.id === rule);
    expect(check?.status, rule).toBe(status === 'FUTURE' ? 'NOT_MET' : status);
    if (status === 'FUTURE')
      expect(check?.explanation, rule).toContain(earliestDate);
    expect(path.status).toBe(status);
    expect(path.earliestDate).toBe(earliestDate);
  }

  test('Ν counts only the residence years before acquisition and honours documented trip exceptions', () => {
    const run = (trips: GrFullRequest['trips']) =>
      full('GR-EU-FAMILY-PR', { trips });
    const long = { departed: '2023-12-01', returned: '2024-08-05' };
    verify(
      run([{ departed: '2017-01-01', returned: '2021-11-23' }]),
      'EF-03',
      'MET',
    );
    verify(run([long]), 'EF-03', 'UNKNOWN');
    verify(
      run([{ ...long, familyAbsenceReason: 'ordinary' }]),
      'EF-02',
      'FUTURE',
      '2029-08-05',
    );
    for (const familyAbsenceReason of [
      'compulsory-service',
      'serious-reason',
    ] as const)
      verify(run([{ ...long, familyAbsenceReason }]), 'EF-03', 'MET');
    verify(
      run([
        {
          departed: '2022-12-01',
          returned: '2023-04-01',
          familyAbsenceReason: 'ordinary',
        },
        {
          departed: '2023-06-01',
          returned: '2023-10-01',
          familyAbsenceReason: 'ordinary',
        },
      ]),
      'EF-02',
      'FUTURE',
      '2028-04-01',
    );
    verify(
      run([
        {
          departed: '2023-08-01',
          returned: '2024-03-01',
          familyAbsenceReason: 'ordinary',
        },
      ]),
      'EF-03',
      'MET',
    );
  });

  test('Μ.3 resolves travel in the claimed joint residence period and after expiry separately', () => {
    const run = (trips: GrFullRequest['trips'], extra: Partial<Greek> = {}) =>
      full('GR-GREEK-FAMILY-PR', {
        trips,
        greekFamily: { ...greek, ...extra },
      });
    const long = { departed: '2023-12-01', returned: '2024-08-05' };
    verify(
      run([{ departed: '2016-01-01', returned: '2021-11-22' }]),
      'GF-03',
      'MET',
    );
    verify(run([long]), 'GF-03', 'UNKNOWN');
    verify(
      run([{ ...long, familyAbsenceReason: 'compulsory-service' }]),
      'GF-03',
      'MET',
    );
    verify(
      run([{ departed: '2021-01-01', returned: '2026-02-02' }], {
        residenceFrom: '2015-11-23',
        priorCardExpiry: '2024-01-01',
        interruptionAfterExpiryYears: 0,
      }),
      'GF-03',
      'NOT_MET',
    );
  });

  test('permanent family rights assess only consecutive days after actual acquisition', () => {
    const acquired = {
      stage: 'maintain',
      permanentRightAcquiredOn: '2023-01-01',
      longestAbsenceAfterPrYears: 0,
    } as const;
    for (const [returned, status] of [
      ['2025-01-01', 'MET'],
      ['2025-01-02', 'NOT_MET'],
    ] as const) {
      const trips = [{ departed: '2017-11-23', returned }];
      verify(
        full('GR-GREEK-FAMILY-PR', { greekFamily: acquired, trips }),
        'GF-05',
        status,
      );
      verify(
        full('GR-EU-FAMILY-PR', {
          euFamily: { ...acquired, shamOrFraud: false },
          trips,
        }),
        'EF-03',
        status,
      );
    }
  });

  test.each(['2026-11-24', '2027-09-30', '2027-10-01'] as const)(
    'a documented return opens a new joint residence window on %s',
    (simulationDate) => {
      const trips = [
        {
          departed: '2022-01-01',
          returned: '2022-10-01',
          familyAbsenceReason: 'ordinary',
        },
      ] satisfies GrFullRequest['trips'];
      const due = '2027-10-01';
      const status = simulationDate < due ? 'FUTURE' : 'MET';
      const earliest = status === 'FUTURE' ? due : undefined;
      const priorCardExpiry = '2027-12-10';
      verify(
        full('GR-EU-FAMILY-PR', {
          simulationDate,
          trips,
          euFamily: { ...european, priorCardExpiry },
        }),
        'EF-02',
        status,
        earliest,
      );
      verify(
        full('GR-GREEK-FAMILY-PR', {
          simulationDate,
          trips,
          greekFamily: { ...greek, priorCardExpiry },
        }),
        'GF-03',
        status,
        earliest,
      );
    },
  );

  test('Ν can qualify again on a documented return after losing an early right', () => {
    const run = (simulationDate: string) =>
      full('GR-EU-FAMILY-PR', {
        simulationDate,
        euFamily: {
          ...european,
          residenceFrom: '2019-01-01',
          priorCardExpiry: '2032-12-10',
          early: {
            basis: 'occupational-incapacity',
            eventDate: '2019-06-01',
            livedTogetherAtEvent: true,
          },
        },
        trips: [
          {
            departed: '2020-01-01',
            returned: '2022-10-01',
            familyAbsenceReason: 'ordinary',
          },
        ],
      });
    verify(run('2026-11-24'), 'EF-02', 'FUTURE', '2027-10-01');
    verify(run('2027-10-01'), 'EF-02', 'MET');
  });

  test.each([
    ['2027-05-02', 'MET'],
    ['2027-05-03', 'UNKNOWN'],
    ['2027-08-01', 'UNKNOWN'],
  ] as const)(
    'Ν checks a single serious absence across the anniversary through %s',
    (returned, status) => {
      const path = full('GR-EU-FAMILY-PR', {
        simulationDate: returned,
        euFamily: { ...european, priorCardExpiry: '2027-12-10' },
        trips: [
          {
            departed: '2026-05-01',
            returned,
            familyAbsenceReason: 'serious-reason',
          },
        ],
      });
      verify(path, 'EF-03', status);
      if (status === 'UNKNOWN') expect(path.pendingDetails).toContain('PD-315');
    },
  );

  test('Ν resolves a disputed serious absence once a separate period qualifies', () => {
    const run = (
      simulationDate: string,
      maxSeriousAbsenceMonths: number,
    ) =>
      full('GR-EU-FAMILY-PR', {
        simulationDate,
        passport: { kind: 'exception-granted' },
        euFamily: {
          ...european,
          maxSeriousAbsenceMonths,
          priorCardExpiry: '2033-12-10',
        },
        trips: [
          {
            departed: '2026-05-01',
            returned: '2027-08-01',
            familyAbsenceReason: 'serious-reason',
          },
        ],
      });
    verify(run('2027-08-01', 15), 'EF-03', 'UNKNOWN');
    verify(run('2032-07-31', 12), 'EF-03', 'UNKNOWN');
    verify(run('2032-08-01', 12), 'EF-03', 'MET');
  });

  test('a later documented five-year period can qualify a family after an earlier interruption', () => {
    const residenceFrom = '2012-01-01';
    const trips = [
      {
        departed: '2012-03-01',
        returned: '2016-05-01',
        familyAbsenceReason: 'ordinary',
      },
    ] as const;
    verify(
      full('GR-GREEK-FAMILY-PR', {
        greekFamily: { ...greek, residenceFrom },
        trips: [...trips],
      }),
      'GF-03',
      'MET',
    );
    verify(
      full('GR-EU-FAMILY-PR', {
        euFamily: { ...european, residenceFrom },
        trips: [...trips],
      }),
      'EF-03',
      'MET',
    );
    verify(
      full('GR-EU-FAMILY-PR', {
        euFamily: {
          ...european,
          residenceFrom,
          relationship: 'primary-carer-of-mobile-eu-minor',
          primaryCare: {
            childBirthDate: '2001-01-01',
            residenceBasis: 'permanent',
          },
        },
        trips: [...trips],
      }),
      'EF-01',
      'NOT_MET',
    );
  });

  test('a long absence between the joint-residence anniversary and the first Μ.3 filing needs a grant date', () => {
    const base = {
      ...greek,
      residenceFrom: '2010-01-01',
      priorCardExpiry: '2026-12-15',
    };
    const trips = [{ departed: '2022-02-01', returned: '2025-01-01' }];
    verify(
      full('GR-GREEK-FAMILY-PR', { greekFamily: base, trips }),
      'GF-03',
      'UNKNOWN',
    );
    verify(
      full('GR-GREEK-FAMILY-PR', {
        greekFamily: { ...base, permanentRightAcquiredOn: '2021-01-01' },
        trips,
      }),
      'GF-03',
      'NOT_MET',
    );
  });

  test('Ν uses a qualified occupational event independently of the applicant’s earlier five-year absences', () => {
    const euFamily = {
      ...european,
      residenceFrom: '2020-01-01',
      early: {
        basis: 'occupational-incapacity',
        eventDate: '2025-01-01',
        livedTogetherAtEvent: true,
      },
    } as const;
    const trips = [
      {
        departed: '2020-02-01',
        returned: '2022-10-01',
        familyAbsenceReason: 'ordinary',
      },
    ] as const;
    verify(
      full('GR-EU-FAMILY-PR', { euFamily, trips: [...trips] }),
      'EF-03',
      'MET',
    );
  });

  test('Ν uses both bounds when an earlier acquisition is possible', () => {
    const euFamily = {
      ...european,
      residenceFrom: '2012-01-01',
      early: undefined,
      longestAbsenceAfterPrYears: 0,
    };
    const run = (departed: string, returned: string) =>
      full('GR-EU-FAMILY-PR', {
        euFamily,
        trips: [
          { departed, returned, familyAbsenceReason: 'compulsory-service' },
        ],
      });
    verify(run('2022-01-01', '2025-01-01'), 'EF-03', 'NOT_MET');
    verify(run('2015-01-01', '2017-06-01'), 'EF-03', 'UNKNOWN');
    verify(run('2006-01-01', '2010-01-01'), 'EF-03', 'MET');
  });

  test('Β.5 requires the application stage even with a previous investor card on record', () => {
    for (const permits of [
      undefined,
      [],
      [{ kind: 'investor', from: '2021-01-10', to: '2026-12-10' }],
    ] satisfies GrFullRequest['permits'][]) {
      verify(
        full('GR-GOLDEN-VISA', {
          permits,
          goldenVisa: { ...investor, stage: undefined },
        }),
        'GV-STAGE',
        'UNKNOWN',
      );
    }
  });

  test('Ν cannot exclude loss since an undated or unconfirmed earlier acquisition using the ordinary anniversary', () => {
    for (const early of [
      undefined,
      { basis: 'occupational-incapacity', eventDate: '2022-01-01' },
    ] satisfies EU['early'][]) {
      verify(
        full('GR-EU-FAMILY-PR', { euFamily: { ...european, early } }),
        'EF-03',
        'UNKNOWN',
      );
      verify(
        full('GR-EU-FAMILY-PR', {
          euFamily: { ...european, early, longestAbsenceAfterPrYears: 0 },
        }),
        'EF-03',
        'MET',
      );
    }
  });

  test('Ο.3 conversion checks the child at the original grant and the prior retained-right filing on its actual date', () => {
    const relative: Greek = {
      ...greek,
      relationship: 'parent-of-resident-greek-minor',
      greekRelativeBirthDate: '2019-01-01',
    };
    verify(
      full('GR-GREEK-FAMILY-PR', { greekFamily: relative }),
      'GF-01',
      'UNKNOWN',
    );
    verify(
      full('GR-GREEK-FAMILY-PR', {
        greekFamily: { ...relative, initialCardGrantedOn: '2020-01-01' },
      }),
      'GF-01',
      'MET',
    );
    const retention: NonNullable<Greek['retention']> = {
      basis: 'widowhood',
      eventDate: '2026-10-01',
      greeceResidenceFrom: '2021-01-01',
      livelihood: 'employment',
    };
    verify(
      full('GR-GREEK-FAMILY-PR', {
        greekFamily: { ...greek, retention },
      }),
      'GF-04',
      'UNKNOWN',
    );
    verify(
      full('GR-GREEK-FAMILY-PR', {
        greekFamily: {
          ...greek,
          retention: { ...retention, applicationDate: '2026-11-01' },
        },
      }),
      'GF-04',
      'MET',
    );
  });

  test.each([
    [0, 'MET'],
    [2, 'MET'],
    [3, 'NOT_MET'],
    [undefined, 'UNKNOWN'],
  ] as const)(
    'Ν first permanent card checks %s years away since acquiring the right',
    (years, status) => {
      for (const priorCardIssued of [false, true]) {
        const path = full('GR-EU-FAMILY-PR', {
          simulationDate: '2026-11-24',
          euFamily: {
            ...european,
            residenceFrom: '2017-01-01',
            priorCardIssued,
            priorCardExpiry: priorCardIssued ? '2026-12-31' : undefined,
            longestAbsenceAfterPrYears: years,
          },
        });
        verify(path, 'EF-03', status);
      }
    },
  );

  test('Ν counts post-acquisition absence from an earlier occupational event', () => {
    const euFamily = {
      ...european,
      early: {
        basis: 'occupational-incapacity',
        eventDate: '2023-10-10',
        livedTogetherAtEvent: true,
      },
    } as const;
    verify(full('GR-EU-FAMILY-PR', { euFamily }), 'EF-03', 'UNKNOWN');
    verify(
      full('GR-EU-FAMILY-PR', {
        euFamily: { ...euFamily, longestAbsenceAfterPrYears: 3 },
      }),
      'EF-03',
      'NOT_MET',
    );
  });

  test('Ν distinguishes the ordinary card insurance document from ongoing cover for a primary carer', () => {
    verify(
      full('GR-EU-FAMILY-PR', { insurance: { kind: 'uninsured' } }),
      'EF-06',
      'NOT_MET',
    );
    verify(
      full('GR-EU-FAMILY-PR', {
        euFamily: {
          ...european,
          relationship: 'primary-carer-of-mobile-eu-minor',
          primaryCare: {
            childBirthDate: '2012-07-01',
            residenceBasis: 'permanent',
          },
        },
        insurance: { kind: 'uninsured' },
      }),
      'EF-06',
      'MET',
    );
  });

  test.each([
    [true, 'MET'],
    [false, 'NOT_MET'],
    [undefined, 'UNKNOWN'],
  ] as const)(
    'Greek first and retained cards require their own supporting evidence (%s)',
    (ready, status) => {
      verify(
        full('GR-GREEK-FAMILY-PR', {
          greekFamily: {
            ...greek,
            stage: 'initial',
            stableResidenceInGreece: true,
            initialFamilyDocumentsReady: ready,
          },
        }),
        'GF-01',
        status,
      );
      verify(
        full('GR-GREEK-FAMILY-PR', {
          greekFamily: {
            ...greek,
            stage: 'retained',
            retainedRightDocumentsReady: ready,
            retention: {
              basis: 'divorce',
              marriageFrom: '2020-02-01',
              greeceResidenceFrom: '2021-01-01',
              divorceDurationEnd: '2026-06-01',
              eventDate: simulationDate,
              livelihood: 'employment',
            },
          },
        }),
        'GF-04',
        status,
      );
    },
  );

  test.each([
    [true, 'MET'],
    [false, 'NOT_MET'],
    [undefined, 'UNKNOWN'],
  ] as const)(
    'Β.5 checks supporting evidence for the selected acquisition or renewal (%s)',
    (ready, status) => {
      for (const title of [
        'wholly-owned-eu-company',
        'qualifying-company-timeshare',
      ] as const) {
        verify(
          full('GR-GOLDEN-VISA', {
            goldenVisa: {
              ...investor,
              title,
              companyOwnershipDocumentsReady: ready,
              eotLeaseAcknowledgment: true,
            },
          }),
          'GV-03',
          status,
        );
      }
      verify(
        full('GR-GOLDEN-VISA', {
          goldenVisa: {
            ...investor,
            kind: 'construction',
            constructionDocumentsReady: ready,
          },
        }),
        'GV-03',
        status,
      );
      const renewal = renewInvestment({ renewalUseDeclarationsReady: ready });
      expect(renewal.checks.find((x) => x.id === 'GV-08')?.status).toBe(status);
      expect(renewal.status).toBe(status);
      for (const stage of ['initial', 'renewal'] as const) {
        const family = [
          {
            kind: 'spouse',
            birthDate: '1990-01-01',
            filingDocumentsReady: ready,
          },
        ] as const;
        const path =
          stage === 'renewal'
            ? renewInvestment({ family: [...family] })
            : full('GR-GOLDEN-VISA', {
                goldenVisa: { ...investor, family: [...family] },
              });
        expect(path.checks.find((x) => x.id === 'GV-09')?.status).toBe(status);
        expect(path.status).toBe(status);
      }
    },
  );

  test('Ν ordinary first card checks entry date, health timing and evidence', () => {
    const euFamily = {
      ...european,
      stage: 'initial',
      arrivedOn: '2026-05-01',
    } as const;
    const run = (
      patch: Partial<EU>,
      publicHealth: GrFullRequest['publicHealth'] = 'cleared',
    ) =>
      full('GR-EU-FAMILY-PR', {
        euFamily: { ...euFamily, ...patch },
        entry: 'short-stay',
        publicHealth,
      });
    verify(run({}), 'EF-07', 'MET');
    verify(run({ rightsDocumentsReady: false }), 'EF-06', 'NOT_MET');
    verify(run({ arrivedOn: undefined }), 'EF-07', 'UNKNOWN');
    verify(
      run({ publicHealthConditionBeganOn: '2026-08-01' }, 'possible-risk'),
      'EF-08',
      'UNKNOWN',
    );
    verify(
      run({ publicHealthConditionBeganOn: '2026-08-02' }, 'possible-risk'),
      'EF-08',
      'MET',
    );
    expect(
      run({ arrivedOn: '2025-11-22' }).checks.find((x) => x.id === 'EF-07')
        ?.explanation,
    ).toContain('Late fine €50');
  });

  test('Ν ordinary renewal verifies spouse evidence, including the alternative at separation', () => {
    const partnerRenewal = {
      separationOn: '2026-09-01',
      marriageFrom: '2023-09-01',
      greeceResidenceFrom: '2025-09-01',
      sponsorConfirmsContinuingRelationship: false,
      resourcesAssessment: 'accepted',
    } as const;
    const run = (patch: Partial<EU>) =>
      full('GR-EU-FAMILY-PR', {
        euFamily: {
          ...european,
          stage: 'renewal',
          permanentRightAcquired: false,
          partnerRenewal,
          ...patch,
        },
      });
    verify(run({}), 'EF-07', 'MET');
    verify(
      run({
        partnerRenewal: { ...partnerRenewal, marriageFrom: '2023-09-02' },
      }),
      'EF-07',
      'NOT_MET',
    );
    verify(
      run({
        partnerRenewal: { ...partnerRenewal, resourcesAssessment: 'pending' },
      }),
      'EF-07',
      'UNKNOWN',
    );
    verify(run({ permanentRightAcquired: true }), 'EF-07', 'NOT_MET');
    verify(
      run({
        relationship: 'durable-partner',
        extendedFamilyRecognised: true,
        partnerRenewal: undefined,
      }),
      'EF-07',
      'MET',
    );
  });

  test('Ν presentation of the old permanent card is required only for an actual card renewal', () => {
    for (const rightsDocumentsReady of [true, false, undefined]) {
      const euFamily = {
        stage: 'permanent-renewal',
        longestAbsenceAfterPrYears: 2,
        rightsDocumentsReady,
        shamOrFraud: false,
      } as const;
      const run = (patch: Partial<EU>) =>
        full('GR-EU-FAMILY-PR', {
          euFamily: { ...euFamily, ...patch },
          insurance: { kind: 'uninsured' },
        });
      verify(
        run({}),
        'EF-06',
        rightsDocumentsReady === undefined
          ? 'UNKNOWN'
          : rightsDocumentsReady
            ? 'MET'
            : 'NOT_MET',
      );
      verify(run({ stage: 'maintain' }), 'EF-03', 'MET');
      verify(run({ longestAbsenceAfterPrYears: 3 }), 'EF-03', 'NOT_MET');
    }
  });

  test('Ν uses the 2012 amendment from publication for a first permanent card filed over one year after former expiry', () => {
    const euFamily = {
      ...european,
      residenceFrom: '2006-01-01',
      priorCardExpiry: '2011-04-09',
      longestAbsenceAfterPrYears: 0,
    };
    const run = (date: string) =>
      full('GR-EU-FAMILY-PR', {
        simulationDate: date,
        euFamily,
        passport: { kind: 'exception-granted' },
      });
    verify(run('2012-04-10'), 'EF-03', 'UNKNOWN');
    verify(run('2012-04-11'), 'EF-03', 'MET');
    expect(
      run('2012-04-11').checks.find((x) => x.id === 'EF-06')?.explanation,
    ).toContain('Late fine €50');
  });

  test('Ν recognises the primary carer on whom a mobile EU child depends', () => {
    const care = {
      childBirthDate: '2014-05-01',
      residenceBasis: 'self-sufficient',
      sufficientResourcesForBoth: true,
      comprehensiveCoverForBoth: true,
    } as const;
    const family = {
      ...european,
      relationship: 'primary-carer-of-mobile-eu-minor',
      dependent: false,
      primaryCare: care,
    } as const;
    const assess = (patch: Partial<EU>) =>
      full('GR-EU-FAMILY-PR', { euFamily: { ...family, ...patch } });
    verify(assess({}), 'EF-01', 'MET');
    verify(
      assess({
        relationship: undefined,
        qualifyingNonGreekEuSponsor: undefined,
        qualifyingNonGreekEuSponsorAndRelationship: true,
      }),
      'EF-01',
      'MET',
    );
    verify(assess({ relationship: 'ascendant' }), 'EF-01', 'NOT_MET');
    verify(assess({ sponsorExercisedTreatyRights: false }), 'EF-01', 'NOT_MET');
    verify(
      assess({ qualifyingResidenceDocumented: undefined }),
      'EF-01',
      'UNKNOWN',
    );
    verify(
      assess({ primaryCare: { ...care, sufficientResourcesForBoth: false } }),
      'EF-01',
      'NOT_MET',
    );
    verify(
      assess({ primaryCare: { ...care, comprehensiveCoverForBoth: false } }),
      'EF-01',
      'NOT_MET',
    );
    verify(
      assess({
        primaryCare: { ...care, comprehensiveCoverForBoth: undefined },
      }),
      'EF-01',
      'UNKNOWN',
    );
    verify(
      assess({ primaryCare: { ...care, childBirthDate: undefined } }),
      'EF-01',
      'UNKNOWN',
    );
    // The child held permanent residence throughout this period of care.
    verify(
      assess({
        primaryCare: {
          childBirthDate: care.childBirthDate,
          residenceBasis: 'permanent',
        },
      }),
      'EF-01',
      'MET',
    );
  });

  test('Ν checks minority during the qualifying period of care, including on a later claim', () => {
    const assess = (childBirthDate: string) =>
      full('GR-EU-FAMILY-PR', {
        euFamily: {
          ...european,
          residenceFrom: '2020-11-23',
          relationship: 'primary-carer-of-mobile-eu-minor',
          primaryCare: {
            childBirthDate,
            residenceBasis: 'self-sufficient',
            sufficientResourcesForBoth: true,
            comprehensiveCoverForBoth: true,
          },
        },
      });
    // Five years completed in November 2025, a year before the application.
    verify(assess('2007-11-24'), 'EF-01', 'MET');
    verify(assess('2007-11-23'), 'EF-01', 'MET');
    verify(assess('2007-11-22'), 'EF-01', 'NOT_MET');
    verify(assess('2022-11-23'), 'EF-01', 'NOT_MET');
  });

  test('Ν applies the prior-card deadline only if a residence card was issued', () => {
    const assess = (patch: Partial<EU>) =>
      full('GR-EU-FAMILY-PR', {
        euFamily: {
          ...european,
          relationship: 'primary-carer-of-mobile-eu-minor',
          primaryCare: {
            childBirthDate: '2014-05-01',
            residenceBasis: 'self-sufficient',
            sufficientResourcesForBoth: true,
            comprehensiveCoverForBoth: true,
          },
          priorCardExpiry: undefined,
          priorCardIssued: false,
          ...patch,
        },
      });
    const neverIssued = assess({});
    verify(neverIssued, 'EF-01', 'MET');
    verify(neverIssued, 'EF-03', 'MET');
    expect(
      neverIssued.checks.find((check) => check.id === 'EF-06')?.explanation,
    ).not.toContain('Late fine');
    verify(assess({ priorCardIssued: true }), 'EF-03', 'UNKNOWN');
    verify(assess({ priorCardIssued: undefined }), 'EF-03', 'UNKNOWN');
    verify(assess({ maxOrdinaryAnnualAbsenceMonths: 7 }), 'EF-03', 'NOT_MET');
    verify(
      assess({ qualifyingResidenceDocumented: false }),
      'EF-01',
      'NOT_MET',
    );
    verify(assess({ rightsDocumentsReady: undefined }), 'EF-06', 'UNKNOWN');
  });

  test('Ο.3 first grant and ordinary renewal accept the same registered partner and apply their own evidence lists', () => {
    const partner = {
      relationship: 'registered-partner',
      partnershipConcludedAt: 'greek-consulate',
      genuineRelationship: true,
    } as const;
    const initial = full('GR-GREEK-FAMILY-PR', {
      greekFamily: {
        ...partner,
        stage: 'initial',
        initialFamilyDocumentsReady: true,
        stableResidenceInGreece: true,
      },
    });
    verify(initial, 'GF-01', 'MET');
    const renew = (facts: Partial<Greek>, cover = insurance) =>
      full('GR-GREEK-FAMILY-PR', {
        greekFamily: {
          ...partner,
          stage: 'renewal',
          priorCardExpiry: '2026-12-15',
          permanentRightAtCardExpiry: false,
          ordinaryRenewalDocumentsReady: true,
          ...facts,
        },
        insurance: cover,
      });
    verify(renew({}), 'GF-08', 'MET');
    verify(renew({ ordinaryRenewalDocumentsReady: false }), 'GF-08', 'NOT_MET');
    verify(
      renew({ ordinaryRenewalDocumentsReady: undefined }),
      'GF-08',
      'UNKNOWN',
    );
    verify(renew({ permanentRightAtCardExpiry: true }), 'GF-08', 'NOT_MET');
    verify(
      renew({ permanentRightAtCardExpiry: undefined }),
      'GF-08',
      'UNKNOWN',
    );
    verify(renew({}, { kind: 'uninsured' }), 'GF-08', 'NOT_MET');
  });

  test.each([
    ['2005-07-01', 'NOT_MET', 'NOT_MET'],
    ['2005-07-15', 'NOT_MET', 'NOT_MET'],
    ['2005-07-16', 'FUTURE', 'MET'],
    [undefined, 'UNKNOWN', 'UNKNOWN'],
  ] as const)(
    'Β.5 renewal reassesses the accompanying child born on %s when the filing window opens',
    (birthDate, forecast, atWindow) => {
      const run = (day: string) =>
        full('GR-GOLDEN-VISA', {
          simulationDate: day,
          permits: [{ kind: 'investor', from: '2021-09-15', to: '2026-09-15' }],
          currentCardExpiresOn: '2026-09-15',
          goldenVisa: {
            ...investor,
            stage: 'renewal',
            originalGrantTier: 'standard',
            retainsInvestment: true,
            registrationProofSubmittedAtGrant: true,
            family: [
              {
                kind: 'child',
                birthDate,
                filingDocumentsReady: true,
                unmarriedWithRequiredCustody: true,
                convertingPreviousFamilyCard: false,
                incapacityDocumentedAndLivingAsDependant: false,
              },
            ],
          },
        });
      const projected = run('2026-06-20');
      const actual = run('2026-07-15');
      expect(projected.status).toBe(forecast);
      expect(actual.status).toBe(atWindow);
      for (const result of [projected, actual]) {
        expect(
          result.checks.find((check) => check.id === 'GV-09')?.status,
        ).toBe(atWindow);
        expect(result.earliestDate).toBe(
          atWindow === 'MET' ? '2026-07-15' : undefined,
        );
      }
    },
  );

  test.each([
    [undefined, 'UNKNOWN'],
    ['possible-risk', 'UNKNOWN'],
    ['entry-refused', 'NOT_MET'],
    ['cleared', 'MET'],
  ] as const)(
    'Β.5 initial purchase checks public health (%s) on either visa route',
    (publicHealth, status) => {
      for (const entry of ['national-visa', 'short-stay'] as const) {
        const path = full('GR-GOLDEN-VISA', { entry, publicHealth });
        verify(path, 'C-04', status);
      }
    },
  );

  test.each([
    [undefined, 'UNKNOWN'],
    ['possible-risk', 'UNKNOWN'],
    ['cleared', 'MET'],
  ] as const)(
    'Β.5 change of use on a valid permit checks public health (%s)',
    (publicHealth, status) => {
      const path = full('GR-GOLDEN-VISA', {
        entry: 'permit',
        permits: [{ kind: 'regular', from: '2026-01-01', to: '2027-01-01' }],
        goldenVisa: {
          ...investor,
          kind: 'conversion',
          qualifyingValueEur: 250000,
          conversionComplete: true,
          conversionActDate: '2024-04-05',
        },
        publicHealth,
      });
      verify(path, 'C-04', status);
    },
  );

  test.each([
    [false, 'NOT_MET'],
    [undefined, 'UNKNOWN'],
    [true, 'MET'],
    ['application-receipt', 'MET'],
    ['lawyer-application-certificate', 'MET'],
  ] as const)(
    'Β.5 initial purchase registration evidence %s',
    (registeredTransferEvidence, status) => {
      for (const kind of ['standard', 'conversion'] as const) {
        const result = full('GR-GOLDEN-VISA', {
          goldenVisa: {
            ...investor,
            kind,
            qualifyingValueEur: kind === 'conversion' ? 250000 : 800000,
            conversionComplete: true,
            conversionActDate: '2024-04-05',
            registeredTransferEvidence,
          },
        });
        verify(result, 'GV-03', status);
      }
    },
  );

  test('Β.5 accepts a registration application receipt on the decision effective date, including pending filings', () => {
    const goldenVisa = {
      ...investor,
      registeredTransferEvidence: 'application-receipt',
    } as const;
    verify(
      full('GR-GOLDEN-VISA', { simulationDate: '2025-11-10', goldenVisa }),
      'GV-03',
      'NOT_MET',
    );
    for (const e9DeclarationCopy of [true, false]) {
      verify(
        full('GR-GOLDEN-VISA', {
          simulationDate: '2025-11-11',
          entry: 'receipt',
          goldenVisa: {
            ...goldenVisa,
            overseasFilingDate: '2025-11-10',
            overseasEvidenceCompletedOn: '2025-11-11',
            e9DeclarationCopy,
          },
        }),
        'GV-03',
        e9DeclarationCopy ? 'MET' : 'NOT_MET',
      );
    }
  });

  test.each([
    ['2024-04-04', false, 'MET'],
    ['2024-04-05', false, 'NOT_MET'],
    ['2025-06-01', false, 'NOT_MET'],
    ['2025-11-10', true, 'MET'],
    ['2025-11-10', false, 'NOT_MET'],
    ['2025-11-10', undefined, 'UNKNOWN'],
    ['2025-11-11', true, 'MET'],
    ['2025-11-11', false, 'NOT_MET'],
    ['2025-11-11', undefined, 'UNKNOWN'],
  ] as const)(
    'Β.5 purchase filed on %s with Ε9 evidence %s',
    (simulationDate, e9DeclarationCopy, status) => {
      verify(
        full('GR-GOLDEN-VISA', {
          simulationDate,
          goldenVisa: {
            ...investor,
            originalConditionsStillMet: true,
            e9DeclarationCopy,
          },
        }),
        'GV-03',
        status,
      );
    },
  );

  test.each([
    [true, 'MET'],
    [false, 'NOT_MET'],
    [undefined, 'UNKNOWN'],
  ] as const)(
    'Β.5 initial property declaration Ε9 (%s)',
    (e9DeclarationCopy, status) => {
      for (const kind of ['standard', 'conversion'] as const) {
        const result = full('GR-GOLDEN-VISA', {
          goldenVisa: {
            ...investor,
            kind,
            qualifyingValueEur: kind === 'conversion' ? 250000 : 800000,
            conversionComplete: true,
            conversionActDate: '2024-04-05',
            e9DeclarationCopy,
          },
        });
        verify(result, 'GV-03', status);
      }
    },
  );

  test.each([
    [false, 'NOT_MET'],
    [undefined, 'UNKNOWN'],
    [true, 'MET'],
    ['application-receipt', 'MET'],
    ['lawyer-application-certificate', 'MET'],
  ] as const)(
    'Β.5 initial tourist lease registration (%s) with no Ε9',
    (registeredTransferEvidence, status) => {
      verify(
        full('GR-GOLDEN-VISA', {
          goldenVisa: {
            ...investor,
            title: 'qualifying-tourist-lease',
            e9DeclarationCopy: false,
            eotLeaseAcknowledgment: true,
            registeredTransferEvidence,
          },
        }),
        'GV-03',
        status,
      );
    },
  );

  test.each([
    [true, 'MET'],
    [false, 'NOT_MET'],
    [undefined, 'UNKNOWN'],
  ] as const)(
    'Β.5 initial tourist lease with ΕΟΤ acknowledgment %s',
    (eotLeaseAcknowledgment, status) => {
      for (const simulationDate of ['2025-11-10', '2025-11-11'] as const) {
        verify(
          full('GR-GOLDEN-VISA', {
            simulationDate,
            goldenVisa: {
              ...investor,
              title: 'qualifying-tourist-lease',
              touristLeaseKind: 'timeshare',
              e9DeclarationCopy: false,
              eotLeaseAcknowledgment,
            },
          }),
          'GV-03',
          status,
        );
      }
    },
  );

  test.each([
    ['2025-11-10', 'long-term-complex', false, 'UNKNOWN'],
    ['2025-11-10', undefined, false, 'UNKNOWN'],
    ['2025-11-10', 'long-term-complex', true, 'MET'],
    ['2025-11-11', 'long-term-complex', false, 'NOT_MET'],
    ['2025-11-11', undefined, false, 'NOT_MET'],
    ['2025-11-11', undefined, undefined, 'UNKNOWN'],
  ] as const)(
    'Β.5 lease filed %s with kind %s and ΕΟΤ evidence %s',
    (simulationDate, touristLeaseKind, eotLeaseAcknowledgment, status) => {
      const result = full('GR-GOLDEN-VISA', {
        simulationDate,
        goldenVisa: {
          ...investor,
          title: 'qualifying-tourist-lease',
          touristLeaseKind,
          eotLeaseAcknowledgment,
          e9DeclarationCopy: false,
        },
      });
      verify(result, 'GV-03', status);
      const pending = result.checks.find(
        (check) => check.id === 'GV-03',
      )?.pendingDetails;
      expect(pending ?? []).toEqual(
        simulationDate === '2025-11-10' && status === 'UNKNOWN'
          ? ['PD-307']
          : [],
      );
    },
  );

  test.each([
    ['2025-11-10', 'MET'],
    ['2025-11-11', 'NOT_MET'],
  ] as const)(
    'Β.5 ownership renewal without Ε9 on %s',
    (simulationDate, status) => {
      const result = full('GR-GOLDEN-VISA', {
        simulationDate,
        permits: [{ kind: 'investor', from: '2020-12-01', to: '2025-12-01' }],
        currentCardExpiresOn: '2025-12-01',
        goldenVisa: {
          ...investor,
          stage: 'renewal',
          regime: 'legacy-card',
          originalConditionsStillMet: true,
          retainsInvestment: true,
          e9DeclarationCopy: false,
        },
      });
      expect(result.checks.find((check) => check.id === 'GV-08')?.status).toBe(
        status,
      );
      expect(result.status).toBe(status);
      expect(result.earliestDate).toBe(
        status === 'MET' ? simulationDate : undefined,
      );
    },
  );

  const renewalDate = '2031-11-23';
  function renewInvestment(answers: Partial<Investor>) {
    return full('GR-GOLDEN-VISA', {
      simulationDate: renewalDate,
      permits: [{ kind: 'investor', from: '2026-12-01', to: '2031-12-01' }],
      currentCardExpiresOn: '2031-12-01',
      passport: { kind: 'exception-granted' },
      goldenVisa: {
        ...investor,
        stage: 'renewal',
        originalGrantTier: 'standard',
        retainsInvestment: true,
        ...answers,
      },
    });
  }

  test('Β.5 uses the original grant to assess restoration and office use, and checks construction evidence where the kind is unknown', () => {
    verify(
      renewInvestment({
        originalGrantTier: undefined,
        listedRestorationComplete: false,
      }),
      'GV-08',
      'UNKNOWN',
    );
    verify(
      renewInvestment({
        originalGrantTier: 'listed',
        listedRestorationComplete: false,
      }),
      'GV-08',
      'NOT_MET',
    );
    verify(
      renewInvestment({
        originalGrantTier: undefined,
        listedRestorationComplete: true,
      }),
      'GV-08',
      'MET',
      renewalDate,
    );
    verify(
      renewInvestment({
        originalGrantTier: undefined,
        use: 'business-office',
      }),
      'GV-04',
      'UNKNOWN',
    );
    verify(renewInvestment({ kind: undefined }), 'GV-08', 'UNKNOWN');
    verify(
      renewInvestment({ kind: undefined, constructionDocumentsReady: true }),
      'GV-08',
      'MET',
      renewalDate,
    );
  });

  test.each([
    [true, undefined, 'MET'],
    [false, true, 'MET'],
    [false, 'application-receipt', 'NOT_MET'],
    [false, 'lawyer-application-certificate', 'NOT_MET'],
    [false, false, 'NOT_MET'],
    [false, undefined, 'UNKNOWN'],
    [undefined, 'application-receipt', 'UNKNOWN'],
    [undefined, true, 'MET'],
  ] as const)(
    'Β.5 renewal registration proof at grant %s and evidence at renewal %s',
    (registrationProofSubmittedAtGrant, registeredTransferEvidence, status) => {
      for (const facts of [
        { kind: 'standard' },
        { kind: 'conversion' },
        { title: 'qualifying-tourist-lease', e9DeclarationCopy: false },
      ] as const) {
        const result = renewInvestment({
          ...facts,
          registrationProofSubmittedAtGrant,
          registeredTransferEvidence,
        });
        expect(result.checks.find((item) => item.id === 'GV-08')?.status).toBe(
          status,
        );
        expect(result.status).toBe(status);
        expect(result.earliestDate).toBe(
          status === 'MET' ? renewalDate : undefined,
        );
      }
    },
  );

  test.each([
    [false, 'NOT_MET'],
    [undefined, 'UNKNOWN'],
  ] as const)(
    'Β.5 renewal requires Ε9 for ownership (%s)',
    (e9DeclarationCopy, status) => {
      for (const kind of ['standard', 'conversion'] as const) {
        verify(renewInvestment({ kind, e9DeclarationCopy }), 'GV-08', status);
      }
      expect(
        renewInvestment({
          title: 'qualifying-tourist-lease',
          e9DeclarationCopy,
        }).status,
      ).toBe('MET');
    },
  );

  test('Β.5 conversion uses the certified permit, file update or revision date and the filing date', () => {
    const converted: Investor = {
      ...investor,
      kind: 'conversion',
      qualifyingValueEur: 250000,
      mainAreaSqm: 47,
      conversionComplete: true,
      conversionCompletedOn: '2023-06-01',
    };
    const run = (facts: Partial<Investor>, req: Partial<GrFullRequest> = {}) =>
      full('GR-GOLDEN-VISA', {
        ...req,
        goldenVisa: { ...converted, ...facts },
      });
    const neverUpdated = { conversionActDate: '2023-06-01' } as const;
    const revised = { conversionActDate: '2024-04-05' } as const;
    verify(run(neverUpdated), 'GV-01', 'NOT_MET');
    verify(run({ conversionActDate: '2024-04-04' }), 'GV-01', 'NOT_MET');
    verify(run(revised), 'GV-01', 'MET');
    const islandConversion = run({ ...revised, zone: 'other-island' });
    verify(islandConversion, 'GV-01', 'MET');
    expect(islandConversion.pendingDetails).not.toContain('PD-306');
    verify(run({ conversionActDate: '2026-11-24' }), 'GV-01', 'NOT_MET');
    const unknown = run({});
    verify(unknown, 'GV-01', 'UNKNOWN');
    expect(
      unknown.checks.find((check) => check.id === 'GV-01')?.pendingDetails,
    ).toEqual(['PD-306']);
    expect(
      run(revised).checks.find((check) => check.id === 'GV-01')?.sources,
    ).toContainEqual(expect.objectContaining({ srcId: 'SRC-375' }));
    verify(run(revised, { simulationDate: '2025-11-10' }), 'GV-01', 'NOT_MET');
    verify(run(revised, { simulationDate: '2025-11-11' }), 'GV-01', 'MET');
    verify(
      run(
        { conversionCompletedOn: '2024-04-05' },
        { simulationDate: '2025-11-10' },
      ),
      'GV-01',
      'MET',
    );
    verify(
      run(
        {
          ...revised,
          overseasFilingDate: '2025-11-10',
          overseasEvidenceCompletedOn: '2026-01-01',
        },
        { entry: 'receipt' },
      ),
      'GV-01',
      'NOT_MET',
    );
    verify(
      run(
        {
          conversionActDate: '2026-01-01',
          overseasFilingDate: '2025-11-23',
          overseasEvidenceCompletedOn: '2026-01-01',
        },
        { entry: 'receipt' },
      ),
      'GV-01',
      'NOT_MET',
    );
  });

  test('Β.5 an earlier conversion can qualify at the ordinary price and floor area for the zone', () => {
    const oldConversion: Investor = {
      ...investor,
      kind: 'conversion',
      conversionComplete: true,
      conversionActDate: '2023-06-01',
    };
    const run = (facts: Partial<Investor>) =>
      full('GR-GOLDEN-VISA', { goldenVisa: { ...oldConversion, ...facts } });
    verify(run({ qualifyingValueEur: 799999 }), 'GV-01', 'NOT_MET');
    verify(run({ mainAreaSqm: 119.99 }), 'GV-02', 'NOT_MET');
    verify(run({ use: 'business-office' }), 'GV-01', 'MET');
    verify(
      run({ zone: 'other-mainland', qualifyingValueEur: 400000 }),
      'GV-01',
      'MET',
    );
    for (const zone of [undefined, 'other-island'] as const) {
      const atHighestPrice = run({ zone, conversionActDate: undefined });
      verify(atHighestPrice, 'GV-01', 'MET');
      verify(atHighestPrice, 'GV-02', 'MET');
      expect(atHighestPrice.pendingDetails).not.toContain('PD-306');
    }
    const unknownZone = run({ zone: undefined, qualifyingValueEur: 799999 });
    verify(unknownZone, 'GV-01', 'UNKNOWN');
    expect(unknownZone.pendingDetails).toContain('PD-306');
    const unknownTitle = run({
      conversionActDate: undefined,
      title: undefined,
    });
    verify(unknownTitle, 'GV-01', 'UNKNOWN');
    expect(unknownTitle.pendingDetails).not.toContain('PD-306');
    verify(
      run({ conversionActDate: undefined, mainAreaSqm: 119.99 }),
      'GV-02',
      'UNKNOWN',
    );
  });

  test('2. Athens purchase filed by an overseas representative can receive a receipt before cover and biometrics', () => {
    const req = {
      entry: 'outside',
      overseasInvestorMandate: true,
      insurance: { kind: 'uninsured' },
      biometrics: undefined,
    } as const;
    const filing = full('GR-GOLDEN-VISA', req);
    for (const rule of ['C-02', 'C-05', 'C-07', 'GV-06'])
      verify(filing, rule, 'MET');
    expect(filing.checks.find((x) => x.id === 'GV-06')?.explanation).toContain(
      'before grant',
    );
    expect(filing.checks.find((x) => x.id === 'GV-01')?.explanation).toContain(
      'single property purchase or qualifying tourist lease',
    );
    const goldenVisa = {
      ...investor,
      overseasFilingDate: '2025-11-23',
      overseasEvidenceCompletedOn: simulationDate,
    };
    const decision = { ...req, goldenVisa, entry: 'receipt' } as const;
    verify(full('GR-GOLDEN-VISA', decision), 'GV-06', 'NOT_MET');
    verify(full('GR-GOLDEN-VISA', { ...decision, insurance }), 'C-07', 'MET');
    verify(
      full('GR-GOLDEN-VISA', {
        ...decision,
        insurance,
        simulationDate: '2026-11-24',
        goldenVisa: {
          ...goldenVisa,
          overseasEvidenceCompletedOn: '2026-11-24',
        },
      }),
      'C-07',
      'NOT_MET',
    );
  });

  test.each(['inheritance', 'parental-gift'] as const)(
    'adult %s uses registered assessed value instead of a purchase payment',
    (acquisition) => {
      const transfer = {
        ...investor,
        acquisition,
        assessedValueEur: 800000,
        registeredTransferEvidence: true,
        fullyPaidAndConditionsReleased: false,
        payment: undefined,
        payer: undefined,
        qualifyingValueEur: undefined,
      };
      const run = (
        a: Partial<Investor> = {},
        req: Partial<GrFullRequest> = {},
      ) =>
        full('GR-GOLDEN-VISA', { goldenVisa: { ...transfer, ...a }, ...req });
      verify(run(), 'GV-01', 'MET');
      verify(run(), 'GV-03', 'MET');
      verify(run({ assessedValueEur: 799999 }), 'GV-01', 'NOT_MET');
      verify(run({ assessedValueEur: undefined }), 'GV-01', 'UNKNOWN');
      verify(
        run({ registeredTransferEvidence: undefined }),
        'GV-03',
        'UNKNOWN',
      );
      verify(run({ acquisition: undefined }), 'GV-03', 'UNKNOWN');
      verify(run({ title: undefined }), 'GV-03', 'UNKNOWN');
      verify(
        run({}, { birthDate: '2008-11-24' }),
        'GV-03',
        'FUTURE',
        '2026-11-24',
      );
    },
  );

  test.each([
    ['sharing-economy-short-let', 'NOT_MET'],
    ['short-sublet', 'NOT_MET'],
    ['sublet-terms-unknown', 'UNKNOWN'],
    ['long-tourist-sublet-with-services', 'MET'],
    [undefined, 'UNKNOWN'],
  ] as const)(
    'property use %s has an independent filing outcome',
    (use, status) => {
      verify(
        full('GR-GOLDEN-VISA', { goldenVisa: { ...investor, use } }),
        'GV-04',
        status,
      );
    },
  );

  test('6. departure of EU parent on 1 October preserves residence for the child and actual custodian until studies end', () => {
    const retention = {
      basis: 'custody',
      eventDate: '2026-10-01',
      livelihood: 'none',
    } as const;
    const schooling = {
      sponsorEvent: 'departure',
      applicant: 'parent-with-actual-custody',
      childResidesInGreece: true,
      childStillEnrolledInGreece: true,
    } as const;
    const run = (facts: Partial<NonNullable<EU['schooling']>>) =>
      full('GR-EU-FAMILY-PR', {
        euFamily: {
          ...european,
          stage: 'retained',
          retention,
          schooling: { ...schooling, ...facts },
        },
      });
    verify(run({}), 'EF-04', 'MET');
    verify(run({ sponsorEvent: 'death', applicant: 'child' }), 'EF-04', 'MET');
    verify(run({ applicant: undefined }), 'EF-04', 'UNKNOWN');
    verify(run({ applicant: 'other' }), 'EF-04', 'NOT_MET');
    verify(run({ childResidesInGreece: false }), 'EF-04', 'NOT_MET');
    verify(run({ childStillEnrolledInGreece: undefined }), 'EF-04', 'UNKNOWN');
    verify(run({ childStillEnrolledInGreece: false }), 'EF-04', 'NOT_MET');
  });
  test('both family permanent residence clocks mature at the five-year anniversary', () => {
    for (const [id, rule, patch] of [
      [
        'GR-GREEK-FAMILY-PR',
        'GF-03',
        {
          greekFamily: {
            ...greek,
            residenceFrom: '2021-11-24',
            priorCardExpiry: '2026-11-24',
          },
        },
      ],
      [
        'GR-EU-FAMILY-PR',
        'EF-02',
        { euFamily: { ...european, residenceFrom: '2021-11-24' } },
      ],
    ] as const) {
      verify(full(id, patch), rule, 'FUTURE', '2026-11-24');
      verify(full(id, { ...patch, simulationDate: '2026-11-24' }), rule, 'MET');
    }
  });
  test('investment limits and incapacity exception use the law on the simulation date', () => {
    const historical = {
      ...investor,
      originalConditionsStillMet: true,
      qualifyingValueEur: 500000,
      use: 'short-sublet',
    } as const;
    verify(
      full('GR-GOLDEN-VISA', {
        goldenVisa: historical,
        simulationDate: '2024-04-04',
      }),
      'GV-10',
      'MET',
    );
    const changed = full('GR-GOLDEN-VISA', {
      goldenVisa: historical,
      simulationDate: '2024-04-05',
    });
    verify(changed, 'GV-01', 'NOT_MET');
    verify(changed, 'GV-04', 'NOT_MET');
    const goldenVisa = {
      ...investor,
      family: [
        {
          kind: 'child',
          birthDate: '2001-11-23',
          filingDocumentsReady: true,
          convertingPreviousFamilyCard: false,
          incapacityDocumentedAndLivingAsDependant: true,
        },
      ],
    } satisfies Investor;
    verify(
      full('GR-GOLDEN-VISA', { goldenVisa, simulationDate: '2026-02-05' }),
      'GV-09',
      'NOT_MET',
    );
    verify(
      full('GR-GOLDEN-VISA', { goldenVisa, simulationDate: '2026-02-06' }),
      'GV-09',
      'MET',
    );
  });
  test.each([
    [true, 'MET'],
    [false, 'NOT_MET'],
    [undefined, 'UNKNOWN'],
  ] as const)(
    'historical Μ.2 conversion of a Greek family card needs its old card and passport evidence (%s)',
    (historicalConversionDocumentsReady, status) => {
      const path = full('GR-GREEK-FAMILY-PR', {
        simulationDate: '2026-02-05',
        greekFamily: {
          ...greek,
          residenceFrom: '2020-02-05',
          longestConsecutiveAbsenceYears: 0,
          historicalConversionDocumentsReady,
        },
      });
      verify(path, 'GF-03', status);
    },
  );
  test('Greek family conversion before the reform requires health cover under the earlier Μ.2 provisions', () => {
    const greekFamily = {
      ...greek,
      residenceFrom: '2021-02-05',
      priorCardExpiry: '2026-03-31',
      longestConsecutiveAbsenceYears: 0,
    };
    const uninsured = { kind: 'uninsured' } as const;
    verify(
      full('GR-GREEK-FAMILY-PR', {
        greekFamily,
        insurance: uninsured,
        simulationDate: '2026-02-05',
      }),
      'GF-03',
      'NOT_MET',
    );
    verify(
      full('GR-GREEK-FAMILY-PR', {
        greekFamily,
        insurance: uninsured,
        simulationDate: '2026-02-06',
      }),
      'GF-03',
      'MET',
    );
  });
  test('the old card expiry and passport pages do not prove the historical Μ.2 dossier contains the former card', () => {
    verify(
      full('GR-GREEK-FAMILY-PR', {
        simulationDate: '2026-02-05',
        greekFamily: {
          ...greek,
          residenceFrom: '2020-02-05',
          longestConsecutiveAbsenceYears: 0,
          historicalConversionDocumentsReady: undefined,
        },
        tenYear: { travelDocumentPagesReady: true },
      }),
      'GF-03',
      'UNKNOWN',
    );
  });
  test.each([
    ['standard', 'MET'],
    ['conversion', 'NOT_MET'],
    [undefined, 'UNKNOWN'],
  ] as const)(
    'Β.5 office use at renewal follows the original %s tier for a converted property',
    (originalGrantTier, status) => {
      for (const use of [
        'business-office',
        'long-tourist-sublet-with-services',
      ] as const) {
        const result = full('GR-GOLDEN-VISA', {
          permits: [{ kind: 'investor', from: '2024-09-01', to: '2026-12-01' }],
          currentCardExpiresOn: '2026-12-01',
          goldenVisa: {
            ...investor,
            kind: 'conversion',
            stage: 'renewal',
            originalGrantTier,
            retainsInvestment: true,
            use,
          },
        });
        expect(result.checks.find((x) => x.id === 'GV-04')?.status).toBe(
          status,
        );
        expect(result.status).toBe(status);
        expect(result.earliestDate).toBe(
          status === 'MET' ? simulationDate : undefined,
        );
      }
    },
  );

  test('current investment renewal verifies continued title without the original acquisition dossier', () => {
    const renew = (patch: Partial<Investor> = {}) =>
      full('GR-GOLDEN-VISA', {
        permits: [{ kind: 'investor', from: '2024-09-01', to: '2026-12-01' }],
        currentCardExpiresOn: '2026-12-01',
        goldenVisa: {
          stage: 'renewal',
          regime: 'current',
          originalGrantTier: 'standard',
          kind: 'standard',
          title: 'sole',
          renewalUseDeclarationsReady: true,
          retainsInvestment: true,
          registrationProofSubmittedAtGrant: true,
          e9DeclarationCopy: true,
          family: [],
          use: 'residential-or-long-let',
          worksInGreeceUnderThisPermit: false,
          ...patch,
        },
      });
    const renewal = renew();
    expect(renewal.checks.find((x) => x.id === 'GV-08')?.status).toBe('MET');
    expect(renewal.checks.map((x) => x.id)).not.toContain('GV-03');
    expect(renewal.status).toBe('MET');
    expect(renewal.earliestDate).toBe(simulationDate);
    verify(renew({ retainsInvestment: false }), 'GV-08', 'NOT_MET');
    verify(renew({ retainsInvestment: undefined }), 'GV-08', 'UNKNOWN');
    verify(renew({ title: undefined }), 'GV-08', 'UNKNOWN');
    verify(renew({ title: 'ineligible' }), 'GV-08', 'NOT_MET');
    verify(
      renew({ title: 'ineligible', retainsInvestment: undefined }),
      'GV-08',
      'NOT_MET',
    );
  });
  test('both permanent family rights use the known post-acquisition absence without requiring a start date', () => {
    for (const [years, status] of [
      [2, 'MET'],
      [2.01, 'NOT_MET'],
      [undefined, 'UNKNOWN'],
    ] as const) {
      const residence = {
        stage: 'maintain',
        longestAbsenceAfterPrYears: years,
      } as const;
      verify(
        full('GR-GREEK-FAMILY-PR', { greekFamily: residence }),
        'GF-05',
        status,
      );
      verify(
        full('GR-EU-FAMILY-PR', {
          euFamily: { ...residence, shamOrFraud: false },
        }),
        'EF-03',
        status,
      );
    }
  });
  test.each([
    [false, 'NOT_MET'],
    [true, 'MET'],
    [undefined, 'UNKNOWN'],
  ] as const)(
    'Ο.3 first filing after lawful short entry checks whether the applicant lives in Greece on a stable basis (%s)',
    (stableResidenceInGreece, status) => {
      const path = full('GR-GREEK-FAMILY-PR', {
        entry: 'short-stay',
        greekFamily: {
          stage: 'initial',
          relationship: 'spouse',
          registeredInGreece: true,
          genuineRelationship: true,
          initialFamilyDocumentsReady: true,
          qualifyingResidenceDocumented: false,
          stableResidenceInGreece,
        },
      });
      expect(path.checks.find((check) => check.id === 'C-02')?.status).toBe(
        'MET',
      );
      expect(path.checks.find((check) => check.id === 'GF-01')?.status).toBe(
        'MET',
      );
      verify(path, 'GF-07', status);
    },
  );
  test('Ο.3 first filing accepts the explicitly deferred public insurance application receipt', () => {
    verify(
      full('GR-GREEK-FAMILY-PR', {
        greekFamily: {
          ...greek,
          stage: 'initial',
          stableResidenceInGreece: true,
        },
        entry: 'short-stay',
        insurance: undefined,
        deferredInitialEvidence: ['public-insurance-application'],
      }),
      'GF-02',
      'MET',
    );
  });
});
