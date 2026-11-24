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

describe('property and family reviews through evaluateGreeceFull', () => {
  const full = (
    id: Parameters<typeof propertyFamilyChecks>[0],
    patch: Partial<GrFullRequest> = {},
  ) =>
    evaluateGreeceFull({
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
    if (earliestDate) expect(check?.explanation, rule).toContain(earliestDate);
    expect(path.status).toBe(status);
    expect(path.earliestDate).toBe(earliestDate);
  }

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
        { greekFamily: { ...greek, residenceFrom: '2021-11-24' } },
      ],
      [
        'GR-EU-FAMILY-PR',
        'EF-02',
        { euFamily: { ...european, residenceFrom: '2021-11-24' } },
      ],
    ] as const) {
      verify(full(id, patch), rule, 'FUTURE', '2026-11-24');
      verify(
        full(id, {
          ...patch,
          simulationDate: '2026-11-24',
          greekFamily: {
            ...greek,
            residenceFrom: '2021-11-24',
            priorCardExpiry: '2026-11-24',
          },
        }),
        rule,
        'MET',
      );
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
          age: 25,
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
  test('current investment renewal verifies continued title without the original acquisition dossier', () => {
    const renew = (patch: Partial<Investor> = {}) =>
      full('GR-GOLDEN-VISA', {
        permits: [{ kind: 'investor', from: '2024-09-01', to: '2026-12-01' }],
        currentCardExpiresOn: '2026-12-01',
        goldenVisa: {
          stage: 'renewal',
          regime: 'current',
          kind: 'standard',
          retainsInvestment: true,
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
  test('Ο.3 first filing accepts the explicitly deferred public insurance application receipt', () => {
    verify(
      full('GR-GREEK-FAMILY-PR', {
        greekFamily: { ...greek, stage: 'initial' },
        entry: 'short-stay',
        insurance: undefined,
        deferredInitialEvidence: ['public-insurance-application'],
      }),
      'GF-02',
      'MET',
    );
  });
});
