import { describe, expect, test } from 'vitest';
import { propertyFamilyChecks } from '../src/greece-property-family';
import type { GrPropertyFamilyAnswers } from '../src/greece-property-family';
import type { GrFullRequest } from '../src/greece-full';
import { grContext } from '../src/greece-rules';
import type { GrInsurance } from '../src/greece-rules';

const simulationDate = '2026-11-23';
const insurance: GrInsurance = {
  kind: 'private',
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
  propertyCount: 1,
  builtOrBuildingPermit: true,
  mainAreaSqm: 120,
  fullyPaidAndConditionsReleased: true,
  payment: 'bank-transfer',
  payer: 'applicant',
  notarialEvidence: true,
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
  residenceFrom: '2021-11-23',
  qualifyingResidenceDocumented: true,
  priorCardExpiry: '2026-11-23',
  maxAnnualAbsenceMonths: 6,
};
const european: EU = {
  stage: 'permanent',
  qualifyingNonGreekEuSponsorAndRelationship: true,
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
    expect(gv('GV-01', { zone: 'other-island' })).toMatchObject({
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
      gv('GV-04', { kind: 'conversion', use: 'business-office' }).status,
    ).toBe('NOT_MET');
    expect(gv('GV-05', {}).status).toBe('MET');
    expect(gv('GV-05', { worksInGreeceUnderThisPermit: true }).status).toBe(
      'NOT_MET',
    );
  });
  test('private insurance extends to each dependant; public insurance alone fails', () => {
    const family: Investor['family'] = [{ kind: 'spouse-partner', age: 34 }];
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
  test('under 21 and unmarried, recognised incapacity, and previous family card converting at 21', () => {
    const child = {
      kind: 'child',
      age: 20,
      unmarriedWithRequiredCustody: true,
    } as const;
    const at21 = {
      ...child,
      age: 21,
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
          { ...at21, age: 25, incapacityDocumentedAndLivingAsDependant: true },
        ],
      }).status,
    ).toBe('MET');
    expect(gv('GV-09', { family: undefined }).status).toBe('UNKNOWN');
  });
  test('family cost includes all four cards, minor exemption and per-person visa cost', () => {
    const family: Investor['family'] = [
      { kind: 'ascendant', age: 70 },
      { kind: 'child', age: 17 },
      { kind: 'child', age: 21, convertingPreviousFamilyCard: true },
    ];
    // 2000 + 150 + 0 + 450 + 4 × 16 + 2 × 180 = 3024.
    expect(gv('GV-07', { family, nationalVisas: 2 }).explanation).toContain(
      'Total €3024',
    );
    expect(gv('GV-07', {}).explanation).toContain('Total €2016');
    expect(gv('GV-07', { family: undefined }).explanation).not.toContain(
      'Total €',
    );
  });
  test('renewal requires continued ownership and completed restoration by first renewal', () => {
    const listed: Partial<Investor> = {
      stage: 'renewal',
      kind: 'listed',
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
    expect(gf('GF-03', { residenceFrom: '2021-11-24' }).status).toBe('NOT_MET');
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
  test('evidence of treaty residence and regular five years', () => {
    expect(ef('EF-01', {}).status).toBe('MET');
    expect(ef('EF-01', { sponsorExercisedTreatyRights: false }).status).toBe(
      'NOT_MET',
    );
    expect(ef('EF-02', {}).status).toBe('MET');
    expect(ef('EF-02', { residenceFrom: '2021-11-24' }).status).toBe('NOT_MET');
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
    expect(ef('EF-03', { priorCardExpiry: '2025-11-22' })).toMatchObject({
      status: 'UNKNOWN',
      pendingDetails: ['PD-315'],
    });
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
  test('EU documents and costs have only a maximum fine', () => {
    expect(ef('EF-06', {})).toMatchObject({
      status: 'MET',
      explanation: expect.stringContaining('card €16'),
    });
    expect(
      ef('EF-06', { priorCardExpiry: '2026-11-22' }).explanation,
    ).toContain('up to €150');
    expect(ef('EF-06', { rightsDocumentsReady: false }).status).toBe('NOT_MET');
  });
});
