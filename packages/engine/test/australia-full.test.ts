import { describe, expect, test } from 'vitest';
import {
  australiaFull2026_11,
  PARAMETERS_BY_COUNTRY,
  RULE_SET_IDS_BY_COUNTRY,
} from '@uk-immigration/policy-data';
import {
  AU_FULL_PATHWAYS,
  evaluateAustralia,
  evaluateAustraliaFull,
  type AuFullPathId,
  type AuFullRequest,
} from '../src';

const date = '2026-11-23';
const solo: AuFullRequest = {
  simulationDate: date,
  dateOfBirth: '1990-01-01',
  firstArrival: '2020-01-01',
  visas: [{ subclass: '491', from: '2023-07-01' }],
  trips: [],
  locationAtApplication: 'onshore',
  locationAtDecision: 'onshore',
  noFurtherStay: 'clear',
  visaCompliance: 'complied',
  regional: {
    assessmentYears: [2024, 2025, 2026],
    regionalCondition: 'complied',
    changeNotice: 'complied',
    evidenceAndInterview: 'complied',
  },
  publicInterest: {
    officialPassport: true,
    character: 'clear-history',
    health: 'cleared',
    policeDocuments: 'supplied',
    securityAndForeignPolicy: 'cleared',
    criticalTechnology: 'cleared',
    commonwealthDebt: 'none',
    valuesSigned: true,
    integrity: {
      identityEstablished: true,
      accurateDocuments: true,
      lastIdentityRefusal: null,
      lastDocumentRefusal: null,
    },
    returnBan5001: false,
    removedOn: null,
    sponsoredStudy: { applies: false },
    settlementWithoutUndueDifficulty: true,
    childInterestsSatisfied: true,
  },
};
function path(id: AuFullPathId, r: Partial<AuFullRequest> = {}) {
  return evaluateAustraliaFull({ simulationDate: date, ...r, pathway: id })
    .columns[0].pathways[0];
}
function get(id: AuFullPathId, key: string, r: Partial<AuFullRequest>) {
  return path(id, r).checks.find((c) => c.id === key)!;
}

test('all eleven paths have stable bilingual check IDs, registered locators and no decision on an empty questionnaire', () => {
  const en = evaluateAustraliaFull({ simulationDate: date, locale: 'en' });
  const zh = evaluateAustraliaFull({ simulationDate: date });
  expect(en.policyAsOf).toBe('2026-11-23');
  expect(en.columns.map((c) => c.id)).toEqual(RULE_SET_IDS_BY_COUNTRY.au);
  expect(
    PARAMETERS_BY_COUNTRY.au[
      en.columns[0].id as typeof australiaFull2026_11.ruleSetId
    ],
  ).toBe(australiaFull2026_11);
  expect(en.columns[0].pathways.map((p) => p.id)).toEqual(AU_FULL_PATHWAYS);
  expect(AU_FULL_PATHWAYS).toHaveLength(11);
  for (const [i, p] of en.columns[0].pathways.entries()) {
    const chinese = zh.columns[0].pathways[i];
    expect(p.status, p.id).toBe('UNKNOWN');
    expect(p.title).not.toBe(chinese.title);
    expect(new Set(p.checks.map((c) => c.id)).size).toBe(p.checks.length);
    expect(p.checks.map((c) => c.id)).toEqual(chinese.checks.map((c) => c.id));
    for (const [j, c] of p.checks.entries()) {
      expect(c.title && chinese.checks[j].title, c.id).toBeTruthy();
      expect(c.explanation, c.id).not.toBe(chinese.checks[j].explanation);
      expect(c.sources.length, c.id).toBeGreaterThan(0);
      expect(
        c.sources.every((s) => /^SRC-\d+$/.test(s.srcId) && s.locator),
      ).toBe(true);
    }
  }
});

describe('regional residence and income years', () => {
  test('three years, three notices and confirmed non-time conditions pass with an unknown fee estimate', () => {
    const p = path('AU-191', solo);
    expect(p.checks.filter((c) => c.status !== 'MET').map((c) => c.id)).toEqual(
      ['AU-FEES-APPLICATION'],
    );
    expect(p.status).toBe('MET');
    expect(p.earliestDate).toBe(date);
    expect(
      path('AU-191', {
        ...solo,
        regional: { ...solo.regional, assessmentYears: [2024, 2025] },
      }).status,
    ).toBe('NOT_MET');
    expect(
      path('AU-191', {
        ...solo,
        publicInterest: {
          ...solo.publicInterest,
          health: 'no-known-condition',
        },
      }).status,
    ).toBe('UNKNOWN');
  });

  test('only distinct completed overlapping years count, including a one-day overlap', () => {
    const r = {
      ...solo,
      visas: [{ subclass: '491' as const, from: '2023-06-30' }],
      regional: { assessmentYears: [2023, 2023, 2024, 2026] },
    };
    expect(
      get('AU-191', 'AU-191-tax-notices', {
        ...r,
        simulationDate: '2026-06-30',
      }).status,
    ).toBe('NOT_MET');
    expect(
      get('AU-191', 'AU-191-tax-notices', {
        ...r,
        simulationDate: '2026-07-01',
      }).status,
    ).toBe('MET');
    expect(
      get('AU-191', 'AU-191-tax-notices', {
        ...r,
        visas: [...r.visas, { subclass: '482', from: '2024-07-01' }],
      }).status,
    ).toBe('NOT_MET');
    expect(
      get('AU-191', 'AU-191-tax-notices', {
        ...r,
        regional: { ...r.regional, disputedAssessment: true },
      }).pendingDetails,
    ).toEqual(['PD-212']);
  });

  test.each([
    [
      'regionalCondition',
      'outside-region',
      'AU-191-regional-activity',
      'NOT_MET',
    ],
    [
      'regionalCondition',
      'class-claimed',
      'AU-191-regional-activity',
      'UNKNOWN',
    ],
    ['changeNotice', 'minor-breach', 'AU-191-change-notice', 'UNKNOWN'],
    ['evidenceAndInterview', 'not-complied', 'AU-191-evidence', 'NOT_MET'],
  ] as const)('%s=%s', (key, value, id, expected) => {
    expect(
      get('AU-191', id, {
        ...solo,
        regional: { ...solo.regional, [key]: value },
      }).status,
    ).toBe(expected);
  });
  test('a lapse of required insurance refers compliance to review', () => {
    expect(
      get('AU-191', 'AU-prior-visa-compliance', {
        ...solo,
        publicInterest: { temporaryInsurance: 'lapsed' },
      }),
    ).toMatchObject({ status: 'UNKNOWN', pendingDetails: ['PD-204'] });
  });

  test('regional stream opened on 16 November 2022', () => {
    expect(
      get('AU-191', 'AU-stream-open', { simulationDate: '2022-11-15' }).status,
    ).toBe('NOT_MET');
    expect(
      get('AU-191', 'AU-stream-open', { simulationDate: '2022-11-16' }).status,
    ).toBe('MET');
  });
});

const nominatedSkills = {
  invitations: {
    'AU-190': { issued: '2026-11-15', deadline: '2027-01-13', score: 65 },
  },
  occupationList: 'MLTSSL',
  occupationInInvitation: { 'AU-190': true },
  assessment: { kind: 'positive', issued: '2026-10-01' },
  nomination: 'active',
  points: {
    overseasMonths: 96,
    australianMonths: 0,
    professionalMonths: 0,
    education: 'bachelor',
    specialistStudyYears: 0,
    australianStudy: { qualifying: false },
    communityLanguageCredential: false,
    partner: 'singleOrAustralian',
  },
} satisfies NonNullable<AuFullRequest['skills']>;

describe('application and grant', () => {
  test('190 projects the end of an ongoing 491 lock and rechecks the invitation on that day', () => {
    const invitation = nominatedSkills.invitations['AU-190'];
    const request: AuFullRequest = {
      ...solo,
      visas: [{ subclass: '491', from: '2023-12-01' }],
      permissibleOnshoreVisa: true,
      regionalLockException: 'none',
      english: { passport: 'GB', test: 'none' },
      fees: { additionalAdults: 0, additionalMinors: 0 },
      skills: nominatedSkills,
    };
    const before = path('AU-190', request);
    expect(before.checks.find((c) => c.id === 'AU-regional-lock')?.status).toBe(
      'NOT_MET',
    );
    expect(before).toMatchObject({
      status: 'FUTURE',
      earliestDate: '2026-12-01',
    });
    const due = path('AU-190', { ...request, simulationDate: '2026-12-01' });
    expect(due.checks.find((c) => c.id === 'AU-regional-lock')?.status).toBe(
      'MET',
    );
    expect(due).toMatchObject({ status: 'MET', earliestDate: '2026-12-01' });
    const expired = path('AU-190', {
      ...request,
      publicInterest: { ...request.publicInterest, health: undefined },
      skills: {
        ...request.skills,
        invitations: { 'AU-190': { ...invitation, deadline: '2026-11-30' } },
      },
    });
    expect(expired.checks.find((c) => c.id === 'AU-PIC-HEALTH')?.status).toBe(
      'UNKNOWN',
    );
    expect(
      expired.checks.find((c) => c.id === 'AU-190-invitation')?.status,
    ).toBe('MET');
    expect(expired.status).toBe('NOT_MET');
    expect(expired.earliestDate).toBeUndefined();
  });
  test('155 projects the rolling residence window when there is no alternative return basis', () => {
    const request: AuFullRequest = {
      ...solo,
      firstArrival: '2025-01-01',
      visas: [{ subclass: '189', from: '2025-01-01' }],
      rrv: {
        status: 'current-pr',
        returnApplicationBar: false,
        ties: 'none',
        familyBasis: 'none',
        compassionateDeparture: 'none',
      },
    };
    const before = path('AU-RRV', request);
    const beforeResidence = before.checks.find(
      (c) => c.id === 'AU-RRV-option-residence',
    );
    expect(beforeResidence?.explanation).toContain('691');
    expect(beforeResidence?.status).toBe('NOT_MET');
    expect(before.checks.find((c) => c.id === 'AU-RRV-basis')?.status).toBe(
      'NOT_MET',
    );
    expect(before).toMatchObject({
      status: 'FUTURE',
      earliestDate: '2027-01-01',
    });
    const due = path('AU-RRV', { ...request, simulationDate: '2027-01-01' });
    expect(
      due.checks.find((c) => c.id === 'AU-RRV-option-residence')?.status,
    ).toBe('MET');
    expect(due.checks.find((c) => c.id === 'AU-RRV-basis')?.status).toBe('MET');
    expect(due).toMatchObject({ status: 'MET', earliestDate: '2027-01-01' });
  });
  test.each([
    'AU-186-DE',
    'AU-189-PT',
    'AU-190',
    'AU-858',
    'AU-PARTNER',
  ] as const)('%s checks actual years on the last substantive visa', (id) => {
    const r: AuFullRequest = {
      ...solo,
      visas: [{ subclass: '494', from: '2023-11-24' }],
      regionalLockException: 'none',
      partner: { stream: 'onshore' },
    };
    expect(get(id, 'AU-regional-lock', r).status).toBe('NOT_MET');
    expect(
      get(id, 'AU-regional-lock', { ...r, simulationDate: '2026-11-24' })
        .status,
    ).toBe('MET');
    expect(
      get(id, 'AU-regional-lock', { ...r, regionalLockException: 'claimed' })
        .status,
    ).toBe(id === 'AU-PARTNER' ? 'NOT_MET' : 'UNKNOWN');
    expect(
      get(id, 'AU-regional-lock', {
        ...r,
        simulationDate: '2027-01-01',
        visas: [
          { subclass: '491', from: '2023-11-24', to: '2025-11-23' },
          { subclass: 'bridging', from: '2025-11-24' },
        ],
      }).status,
    ).toBe('NOT_MET');
  });
  test('partner lock uses original lodgement; offshore partner is exempt', () => {
    const r = {
      ...solo,
      partnerApplication: {
        lodged: '2024-11-23',
        stream: 'onshore' as const,
        longTermRelationship: true,
      },
    };
    expect(get('AU-PARTNER', 'AU-regional-lock', r).status).toBe('NOT_MET');
    expect(
      get('AU-PARTNER', 'AU-regional-lock', {
        ...r,
        partnerApplication: { ...r.partnerApplication, stream: 'offshore' },
      }),
    ).toBeUndefined();
  });
  test('apply and decide location are separate; onshore 189 PT needs a qualifying visa', () => {
    expect(
      get('AU-189-PT', 'AU-lodgement-location', {
        locationAtApplication: 'onshore',
        permissibleOnshoreVisa: false,
      }).status,
    ).toBe('NOT_MET');
    expect(
      get('AU-189-PT', 'AU-lodgement-location', {
        locationAtApplication: 'offshore',
      }).status,
    ).toBe('MET');
    expect(
      get('AU-191', 'AU-grant-location', {
        ...solo,
        locationAtDecision: 'clearance',
      }).status,
    ).toBe('NOT_MET');
  });
});

test('Hong Kong retains the old holding, residence and regional checks and separates passport and visa terms', () => {
  const complete = {
    simulationDate: date,
    dateOfBirth: '1990-01-01',
    firstArrival: '2020-01-01',
    visas: [{ subclass: '485' as const, from: '2022-11-23' }],
    trips: [],
    hongKong: { regionalSince: '2023-11-23' },
  };
  for (const id of ['AU-189-HK', 'AU-191-HK'] as const) {
    const p = path(id, complete);
    const legacy = evaluateAustralia(complete).pathways.find(
      (p) => p.id === id,
    )!;
    expect(
      p.checks
        .filter((c) => c.id.startsWith(id + '-time-'))
        .map((c) => c.explanation),
    ).toEqual(legacy.checks.map((c) => c.text));
    expect(legacy.status).toBe('MET');
    expect(
      get(id, 'AU-HK-passport', { ...complete, hongKongPassport: false })
        .status,
    ).toBe('NOT_MET');
    expect(
      get(id, 'AU-HK-primary-visa', {
        ...complete,
        hongKongPrimaryVisaTerms: false,
      }).status,
    ).toBe('NOT_MET');
    expect(
      get(id, id + '-time-residence', {
        ...complete,
        trips: [{ departed: '2026-10-01', returned: '2026-10-03' }],
      }).pendingDetails,
    ).toEqual(['PD-108']);
    expect(
      get(id, id + '-time-residence', { ...complete, trips: undefined }).status,
    ).toBe('UNKNOWN');
  }
  expect(
    get('AU-191-HK', 'AU-191-HK-time-regional', { ...complete, hongKong: {} })
      .status,
  ).toBe('UNKNOWN');
  expect(
    get('AU-189-HK', 'AU-stream-open', { simulationDate: '2022-03-04' }).status,
  ).toBe('NOT_MET');
});

test('TRT uses the old visa and work counts, independently of an age exemption', () => {
  const complete = {
    simulationDate: date,
    dateOfBirth: '1970-01-01',
    firstArrival: '2020-01-01',
    trips: [],
    visas: [{ subclass: '482' as const, from: '2023-11-23' }],
    sponsoredFullTime: true,
    employer: { exemption: 'academic' as const },
  };
  const p = path('AU-186-TRT', complete);
  expect(
    p.checks.filter((c) => c.id.includes('-time-')).map((c) => c.status),
  ).toEqual(['MET', 'MET', 'MET']);
  expect(p.checks.find((c) => c.id === 'AU-186-TRT-age')?.status).toBe('MET');
  expect(
    get('AU-186-TRT', 'AU-186-TRT-time-work', {
      ...complete,
      sponsoredFullTime: false,
    }).pendingDetails,
  ).toEqual(['PD-207']);
  const short = {
    ...complete,
    visas: [{ subclass: '482' as const, from: '2026-01-01' }],
  };
  expect(get('AU-186-TRT', 'AU-186-TRT-time-held', short).status).toBe(
    'NOT_MET',
  );
  expect(
    get('AU-186-TRT', 'AU-186-TRT-time-current', { ...complete, visas: [] })
      .status,
  ).toBe('NOT_MET');
});

test('the residence milestone is projected only when the remaining evidence passes', () => {
  const r = {
    ...solo,
    visas: [{ subclass: '491' as const, from: '2023-11-24' }],
    regional: { ...solo.regional, assessmentYears: [2024, 2025, 2026] },
  };
  expect(path('AU-191', r)).toMatchObject({
    status: 'FUTURE',
    earliestDate: '2026-11-24',
  });
  expect(path('AU-191', { ...r, visaCompliance: undefined })).toMatchObject({
    status: 'UNKNOWN',
  });
  expect(
    path('AU-191', { ...r, visaCompliance: 'not-complied' }),
  ).toMatchObject({ status: 'NOT_MET' });
});

test('positive main-applicant English does not discharge adult dependants’ instalments', () => {
  for (const id of [
    'AU-186-TRT',
    'AU-186-DE',
    'AU-189-PT',
    'AU-190',
    'AU-189-HK',
    'AU-191-HK',
    'AU-858',
  ] as const) {
    const fees = { additionalAdults: 1, chargeableAdditionalAdults: 1 };
    expect(get(id, 'AU-additional-english', { fees }).status).toBe('UNKNOWN');
    expect(
      get(id, 'AU-additional-english', {
        fees: { ...fees, additionalInstalmentsPaid: false },
      }).status,
    ).toBe('NOT_MET');
    expect(
      get(id, 'AU-additional-english', {
        fees: { ...fees, additionalInstalmentsPaid: true },
      }).status,
    ).toBe('MET');
  }
});

test('191 HK regional history is independent of the passport and the regional provisional visa exemption', () => {
  const r: AuFullRequest = {
    simulationDate: date,
    firstArrival: '2020-01-01',
    visas: [{ subclass: '485', from: '2022-11-23' }],
    trips: [],
    regional: { hongKongOnlySince: null, regionalCondition: 'class-confirmed' },
  };
  const checkId = 'AU-191-HK-time-regional';
  expect(get('AU-191-HK', checkId, r).status).toBe('NOT_MET');
  expect(
    get('AU-191-HK', checkId, {
      ...r,
      regional: { hongKongOnlySince: '2023-11-23' },
    }).status,
  ).toBe('MET');
  expect(
    get('AU-191-HK', 'AU-HK-passport', {
      ...r,
      regional: { hongKongOnlySince: '2023-11-23' },
    }).status,
  ).toBe('UNKNOWN');
  expect(
    get('AU-191-HK', checkId, {
      ...r,
      regional: { hongKongRegionalException: 'confirmed' },
    }),
  ).toMatchObject({ status: 'MET' });
});

const nominatedPosition = {
  positionAvailable: true,
  fullTimeRenewable: true,
  offeredYears: 2,
  annualSalary: 79423,
  acceptedMarketRate: 79423,
  licensing: 'unregulated' as const,
} as const;
const approvedNomination = {
  ...nominatedPosition,
  status: 'approved' as const,
  lodged: '2026-07-01',
  approved: '2026-07-10',
} as const;

const directEntry: AuFullRequest = {
  ...solo,
  // A 600 Sponsored Family grant is recorded as other-temporary in the timeline.
  visas: [
    { subclass: 'other-temporary', from: '2026-11-01', to: '2027-01-31' },
  ],
  permissibleOnshoreVisa: true,
  fees: { additionalAdults: 0, additionalMinors: 0 },
  english: { passport: 'US' },
  employer: {
    nominations: { 'AU-186-DE': approvedNomination },
    exemption: 'none',
    sponsorshipConduct: 'clear',
    csolOccupation: true,
    assessment: { kind: 'positive', issued: '2026-01-01' },
    fullTimeExperienceYears: 4,
  },
};

test('186 Direct Entry on the same Sponsored Family visitor visa requires an effective waiver of 8503', () => {
  for (const [noFurtherStay, expected] of [
    ['barred', 'NOT_MET'],
    ['waiver-pending', 'NOT_MET'],
    [undefined, 'UNKNOWN'],
    ['waived', 'MET'],
  ] as const) {
    const result = path('AU-186-DE', { ...directEntry, noFurtherStay });
    expect(
      result.checks.find((c) => c.id === 'AU-lodgement-location')?.status,
    ).toBe(expected);
    expect(result.status).toBe(expected);
    expect(result.earliestDate).toBe(expected === 'MET' ? date : undefined);
  }
  const legacy = path('AU-186-DE', {
    ...directEntry,
    noFurtherStay: undefined,
    partner: { noFurtherStay: 'barred' },
  });
  expect(legacy.status).toBe('NOT_MET');
  expect(legacy.earliestDate).toBeUndefined();
  expect(
    get('AU-186-DE', 'AU-lodgement-location', {
      ...directEntry,
      noFurtherStay: 'waived',
      permissibleOnshoreVisa: false,
    }).status,
  ).toBe('NOT_MET');
});

const bridgingAfterRefusal: AuFullRequest = {
  ...directEntry,
  visas: [
    { subclass: 'other-temporary', from: '2026-01-01', to: '2026-10-31' },
    { subclass: 'bridging', from: '2026-11-01' },
  ],
  section48History: 'qualifying-refusal',
  skills: nominatedSkills,
};

test('section 48 bars 186 DE but lets 190 proceed on the same Bridging A after a student visa refusal under review', () => {
  const all = evaluateAustraliaFull(bridgingAfterRefusal).columns[0].pathways;
  const de = all.find((p) => p.id === 'AU-186-DE')!;
  expect(de.status).toBe('NOT_MET');
  expect(de.earliestDate).toBeUndefined();
  expect(
    de.checks.filter((c) => c.status === 'NOT_MET').map((c) => c.id),
  ).toEqual(['AU-lodgement-s48']);
  const nominated = all.find((p) => p.id === 'AU-190')!;
  expect(nominated).toMatchObject({ status: 'MET', earliestDate: date });
  const withdrawn = path('AU-190', {
    ...bridgingAfterRefusal,
    skills: { ...nominatedSkills, nomination: 'withdrawn' },
  });
  expect(
    withdrawn.checks.find((c) => c.id === 'AU-lodgement-s48')?.status,
  ).toBe('MET');
  expect(withdrawn.status).toBe('NOT_MET');
  expect(withdrawn.earliestDate).toBeUndefined();
});

test('section 48 uses the visa class, place, substantive status and relevant history at lodgement', () => {
  const key = 'AU-lodgement-s48';
  const all = evaluateAustraliaFull({
    ...bridgingAfterRefusal,
    section48History: 'qualifying-cancellation',
    partner: { stream: 'onshore', onshoreStatus: 'schedule-3-satisfied' },
  }).columns[0].pathways;
  for (const p of all) {
    const c = p.checks.find((c) => c.id === key);
    if (p.id === 'AU-CITIZENSHIP') expect(c).toBeUndefined();
    else
      expect(c?.status, p.id).toBe(
        ['AU-190', 'AU-PARTNER'].includes(p.id) ? 'MET' : 'NOT_MET',
      );
  }
  expect(
    get('AU-RRV', key, {
      ...bridgingAfterRefusal,
      visas: undefined,
      rrv: { status: 'current-pr' },
    }).status,
  ).toBe('MET');
  for (const [override, expected] of [
    [{ section48History: undefined }, 'UNKNOWN'],
    [{ section48History: 'none' }, 'MET'],
    [{ visas: undefined }, 'UNKNOWN'],
    [{ visas: [] }, 'NOT_MET'],
    [{ visas: directEntry.visas }, 'MET'],
    [{ locationAtApplication: 'offshore' }, 'MET'],
  ] satisfies [Partial<AuFullRequest>, string][]) {
    const de = path('AU-186-DE', { ...bridgingAfterRefusal, ...override });
    expect(de.checks.find((c) => c.id === key)?.status).toBe(expected);
    expect(de.earliestDate).toBe(expected === 'MET' ? date : undefined);
  }
});

test('no further stay applies across onshore visa lodgements and only at lodgement', () => {
  for (const [noFurtherStay, expected] of [
    ['barred', 'NOT_MET'],
    ['waived', 'MET'],
  ] as const) {
    const request: AuFullRequest = {
      ...solo,
      permissibleOnshoreVisa: true,
      noFurtherStay,
      partner: { stream: 'onshore', onshoreStatus: 'substantive' },
    };
    const onshore = evaluateAustraliaFull(request).columns[0].pathways;
    const offshore = evaluateAustraliaFull({
      ...request,
      locationAtApplication: 'offshore',
      partner: { stream: 'offshore' },
    }).columns[0].pathways;
    for (const [index, result] of onshore.entries()) {
      if (result.id === 'AU-CITIZENSHIP') {
        expect(result).toEqual(offshore[index]);
        continue;
      }
      const key =
        result.id === 'AU-PARTNER'
          ? 'AU-PARTNER-onshore-status'
          : result.id === 'AU-RRV'
            ? 'AU-RRV-clearance'
            : 'AU-lodgement-location';
      expect(result.checks.find((c) => c.id === key)?.status, result.id).toBe(
        expected,
      );
      expect(
        offshore[index].checks.find((c) => c.id === key)?.status,
        result.id,
      ).toBe('MET');
    }
  }
});

function combinedPartner(stream: 'onshore' | 'offshore'): AuFullRequest {
  return {
    ...solo,
    visas: [
      { subclass: stream === 'offshore' ? '309' : '820', from: '2025-06-01' },
    ],
    partnerApplication: {
      stream,
      lodged: '2024-11-01',
      longTermRelationship: false,
    },
    locationAtApplication: stream,
    publicInterest: {
      ...solo.publicInterest,
      permanentSettlementAndSupport: true,
    },
    partner: {
      relationship: 'married',
      relationshipAtDecision: 'continuing',
      partnerAgeAtLodgement: 30,
      relationshipEvidenceAtLodgement: 'confirmed',
      eligiblePartnerStatus: true,
      priorSponsoredPeople: 0,
      lastRelevantPartnerApplication: 'none',
      parentVisaGrant: 'none',
      subclass204RestrictedAtLodgement: false,
      childOffenceBarApplies: false,
      relevantSentenceMonths: 0,
      consentToDisclosure: true,
      sponsorPoliceCheckIfRequested: true,
      sponsorshipApprovedInForce: true,
      onshoreStatus: 'substantive',
      noFurtherStay: 'clear',
      temporaryStageGranted: true,
      temporaryGrant: { basis: 'ordinary' },
    },
  };
}

test('a dated partner lodgement and a proposed visa lodgement can have different conditions', () => {
  const request = combinedPartner('onshore');
  for (const [current, original, proposed, combined] of [
    ['waived', 'barred', 'MET', 'NOT_MET'],
    [undefined, 'waived', 'UNKNOWN', 'MET'],
    ['waived', undefined, 'MET', 'UNKNOWN'],
  ] as const) {
    const paths = evaluateAustraliaFull({
      ...request,
      permissibleOnshoreVisa: true,
      noFurtherStay: current,
      partner: { ...request.partner, noFurtherStay: original },
    }).columns[0].pathways;
    expect(
      paths
        .find((p) => p.id === 'AU-186-DE')
        ?.checks.find((c) => c.id === 'AU-lodgement-location')?.status,
    ).toBe(proposed);
    expect(
      paths
        .find((p) => p.id === 'AU-PARTNER')
        ?.checks.find((c) => c.id === 'AU-PARTNER-onshore-status')?.status,
    ).toBe(combined);
  }
});

test.each(['offshore', 'onshore'] as const)(
  '%s partner permanent stage requires its own nomination or sponsorship to project and meet the anniversary',
  (stream) => {
    const request = combinedPartner(stream);
    for (const [continuingSponsorship, continuity] of [
      [false, 'NOT_MET'],
      [undefined, 'UNKNOWN'],
      [true, 'MET'],
    ] as const) {
      for (const simulationDate of ['2026-10-31', '2026-11-01', '2026-11-02']) {
        const result = path('AU-PARTNER', {
          ...request,
          simulationDate,
          partner: { ...request.partner, continuingSponsorship },
        });
        const before = simulationDate < '2026-11-01';
        expect(
          result.checks.find((c) => c.id === 'AU-PARTNER-continuity')?.status,
        ).toBe(continuity);
        expect(
          result.checks.find((c) => c.id === 'AU-PARTNER-time')?.status,
        ).toBe(before ? 'NOT_MET' : 'MET');
        expect(result.status).toBe(
          continuingSponsorship && before ? 'FUTURE' : continuity,
        );
        expect(result.earliestDate).toBe(
          continuingSponsorship
            ? before
              ? '2026-11-01'
              : simulationDate
            : undefined,
        );
      }
    }
  },
);

test.each(['offshore', 'onshore'] as const)(
  '%s ministerial partner grant uses the decision anniversary and needs evidence of the applicable clock',
  (stream) => {
    const request = combinedPartner(stream);
    const assess = (
      simulationDate: string,
      temporaryGrant?: NonNullable<AuFullRequest['partner']>['temporaryGrant'],
    ) =>
      path('AU-PARTNER', {
        ...request,
        simulationDate,
        partner: {
          ...request.partner,
          continuingSponsorship: true,
          temporaryGrant,
        },
      });
    const grant = { basis: 'ministerial', decisionDate: '2025-05-15' } as const;
    for (const simulationDate of [
      '2026-11-01',
      '2027-05-14',
      '2027-05-15',
      '2027-05-16',
    ]) {
      const result = assess(simulationDate, grant);
      const before = simulationDate < '2027-05-15';
      expect(
        result.checks.find((c) => c.id === 'AU-PARTNER-time')?.status,
      ).toBe(before ? 'NOT_MET' : 'MET');
      expect(result.status).toBe(before ? 'FUTURE' : 'MET');
      expect(result.earliestDate).toBe(before ? '2027-05-15' : simulationDate);
    }
    for (const incomplete of [undefined, { basis: 'ministerial' }] as const) {
      const result = assess('2027-05-16', incomplete);
      expect(
        result.checks.find((c) => c.id === 'AU-PARTNER-time')?.status,
      ).toBe('UNKNOWN');
      expect(result.status).toBe('UNKNOWN');
      expect(result.earliestDate).toBeUndefined();
    }
    const special = path('AU-PARTNER', {
      ...request,
      simulationDate: '2027-05-15',
      partner: {
        ...request.partner,
        temporaryGrant: grant,
        continuingSponsorship: false,
      },
    });
    expect(special.status).toBe('MET');
  },
);

test('820 checks section 48 partner lodgement evidence at the original application only', () => {
  const request = combinedPartner('onshore');
  for (const [requirements, expected] of [
    [true, 'MET'],
    [false, 'NOT_MET'],
    [undefined, 'UNKNOWN'],
  ] as const) {
    const original = {
      ...request,
      section48History: 'none' as const,
      partner: {
        ...request.partner,
        section48History: 'qualifying-refusal' as const,
        onshoreStatus: 'schedule-3-satisfied' as const,
        section48LodgementRequirementsMet: requirements,
        continuingSponsorship: true,
      },
    };
    expect(path('AU-PARTNER', original).status).toBe(expected);
    expect(
      path('AU-PARTNER', {
        ...original,
        section48History: 'qualifying-cancellation',
        partner: { ...original.partner, section48History: 'none' },
      }).status,
    ).toBe('MET');
  }
});

test('an ordinary long-term partner can qualify on the proposed combined lodgement day', () => {
  const request = combinedPartner('onshore');
  expect(
    path('AU-PARTNER', {
      ...request,
      simulationDate: '2024-10-31',
      visas: [
        { subclass: 'other-temporary', from: '2024-01-01', to: '2024-10-31' },
        { subclass: '820', from: '2024-11-01' },
      ],
      partnerApplication: {
        stream: 'onshore',
        lodged: '2024-11-01',
        longTermRelationship: true,
      },
      partner: { ...request.partner, continuingSponsorship: true },
    }),
  ).toMatchObject({ status: 'FUTURE', earliestDate: '2024-11-01' });
});

test('100.226 preserves early offshore decisions and recognised relationship-ending exceptions', () => {
  const request = combinedPartner('offshore');
  const assess = (simulationDate: string, changes: AuFullRequest['partner']) =>
    path('AU-PARTNER', {
      ...request,
      simulationDate,
      partner: { ...request.partner, continuingSponsorship: false, ...changes },
    });
  for (const changes of [
    { relationshipFrom: '2020-01-01' },
    { offshoreHumanitarianRelationshipDisclosed: true },
  ]) {
    expect(assess('2026-10-31', changes)).toMatchObject({
      status: 'MET',
      earliestDate: '2026-10-31',
    });
    const due = assess('2026-11-01', changes);
    expect(due.status).toBe('NOT_MET');
    expect(due.earliestDate).toBeUndefined();
  }
  expect(
    assess('2026-11-01', {
      relationshipAtDecision: 'death',
      exceptionEvidence: 'confirmed',
    }),
  ).toMatchObject({ status: 'MET', earliestDate: '2026-11-01' });
});

test('one approved 186 nomination supports only its own stream in a full comparison', () => {
  const oldRecord = {
    ...nominatedPosition,
    nomination: 'approved' as const,
    nominationLodged: approvedNomination.lodged,
    nominationApproved: approvedNomination.approved,
  };
  const request: AuFullRequest = {
    ...solo,
    firstArrival: '2023-11-23',
    visas: [{ subclass: '482', from: '2023-11-23' }],
    sponsoredFullTime: true,
    permissibleOnshoreVisa: true,
    fees: { additionalAdults: 0, additionalMinors: 0 },
    english: { passport: 'US' },
    employer: {
      exemption: 'none',
      sponsorshipConduct: 'clear',
      trtPrimaryVisa: true,
      trtOccupationMatches: true,
      trtSkillsDemonstration: 'not-requested',
      csolOccupation: true,
      assessment: { kind: 'positive', issued: '2026-01-01' },
      fullTimeExperienceYears: 4,
    },
  };
  const trt = 'AU-186-TRT';
  const de = 'AU-186-DE';
  for (const [nominations, trtStatus, deStatus] of [
    [{ [trt]: approvedNomination }, 'MET', 'NOT_MET'],
    [{ [de]: approvedNomination }, 'NOT_MET', 'MET'],
    [
      {
        [trt]: approvedNomination,
        [de]: { ...approvedNomination, status: 'withdrawn' },
      },
      'MET',
      'NOT_MET',
    ],
    [
      {
        [trt]: approvedNomination,
        [de]: {
          ...approvedNomination,
          lodged: '2026-08-03',
          approved: '2026-08-10',
        },
      },
      'MET',
      'MET',
    ],
    [{}, 'NOT_MET', 'NOT_MET'],
    [undefined, 'UNKNOWN', 'UNKNOWN'],
  ] as const) {
    const employer = nominations
      ? { ...request.employer, nominations }
      : { ...request.employer, ...oldRecord };
    const paths = evaluateAustraliaFull({ ...request, employer }).columns[0]
      .pathways;
    for (const [id, expected] of [
      [trt, trtStatus],
      [de, deStatus],
    ] as const) {
      const p = paths.find((p) => p.id === id)!;
      expect(
        p.checks.find((c) => c.id === id + '-nomination')?.status,
        id,
      ).toBe(expected);
      expect(p.status, id).toBe(expected);
      expect(p.earliestDate, id).toBe(expected === 'MET' ? date : undefined);
    }
  }
});

test('858 functional English uses the reported IELTS band with or without component scores', () => {
  const assess = (
    components?: [number, number, number, number],
    overall?: number,
  ) =>
    path('AU-858', {
      ...solo,
      visas: [],
      locationAtApplication: 'offshore',
      locationAtDecision: 'offshore',
      fees: { additionalAdults: 0, additionalMinors: 0 },
      publicInterest: {
        ...solo.publicInterest,
        permanentSettlementAndSupport: true,
      },
      english: {
        passport: 'other',
        education: 'none',
        test: {
          name: 'ielts',
          date: '2026-06-01',
          format: 'approved',
          components,
          overall,
        },
      },
      secondInstalmentPaid: false,
      innovation: {
        invitation: { issued: '2026-11-01', deadline: date },
        achievement: 'accepted',
        achievementsMatchInvitation: true,
        form1000: 'confirmed',
      },
    });
  for (const [result, expected] of [
    [assess(undefined, 4.5), 'MET'],
    [assess([4, 4, 4, 5], 4.5), 'MET'],
    [assess([4, 4, 4, 5]), 'MET'],
    [assess([4, 4, 4, 4.5]), 'NOT_MET'],
  ] as const) {
    const check = result.checks.find(
      (c) => c.id === 'AU-858-functional-english',
    )!;
    expect(check.status).toBe(expected);
    expect(check.sources.map((source) => source.srcId)).toContain('SRC-229');
    expect(result.status).toBe(expected);
    expect(result.earliestDate).toBe(expected === 'MET' ? date : undefined);
  }
});

test('TRT projects a confirmed age-exempt worker; an expiring nomination still blocks the projected date', () => {
  const r: AuFullRequest = {
    ...solo,
    dateOfBirth: '1970-01-01',
    visas: [{ subclass: '482', from: '2024-11-24' }],
    sponsoredFullTime: true,
    permissibleOnshoreVisa: true,
    fees: { additionalAdults: 0, additionalMinors: 0 },
    english: { passport: 'US' },
    employer: {
      exemption: 'academic',
      nominations: { 'AU-186-TRT': approvedNomination },
      sponsorshipConduct: 'clear',
      trtPrimaryVisa: true,
      trtOccupationMatches: true,
      trtSkillsDemonstration: 'not-requested',
    },
  };
  expect(path('AU-186-TRT', r)).toMatchObject({
    status: 'FUTURE',
    earliestDate: '2026-11-24',
  });
  const expiring = {
    ...r,
    employer: {
      ...r.employer,
      nominations: {
        'AU-186-TRT': {
          ...approvedNomination,
          lodged: '2026-05-20',
          approved: '2026-05-23',
        },
      },
    },
  };
  expect(path('AU-186-TRT', expiring).status).toBe('NOT_MET');
  expect(path('AU-186-TRT', expiring).earliestDate).toBeUndefined();
});

test('an unfinished partner questionnaire does not force a negative long-term relationship declaration', () => {
  const r: AuFullRequest = {
    simulationDate: date,
    partnerApplication: { stream: 'onshore', lodged: '2026-08-01' },
    partner: {
      relationshipAtDecision: 'continuing',
      temporaryGrant: { basis: 'ordinary' },
    },
  };
  expect(get('AU-PARTNER', 'AU-PARTNER-time', r).status).toBe('UNKNOWN');
  expect(
    get('AU-PARTNER', 'AU-PARTNER-time', {
      ...r,
      partnerApplication: { stream: 'onshore', lodged: '2024-11-23' },
    }).status,
  ).toBe('MET');
});
