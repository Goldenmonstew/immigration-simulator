import { describe, expect, test } from 'vitest';
import {
  evaluateAustralia,
  evaluateAustraliaTimeline,
  type AuRequest,
} from '../src/australia';
import {
  citizenshipTimeRequest,
  familyChecks,
  type AuFamilyAnswers,
} from '../src/australia-family';
import {
  evaluateAustraliaFull,
  type AuFullRequest,
} from '../src/australia-full';
import type { CountryCheck } from '../src/country-result';

const base: AuRequest = {
  simulationDate: '2026-11-23',
  dateOfBirth: '1990-01-01',
  firstArrival: '2019-11-23',
  trips: [],
  visas: [{ subclass: '189', from: '2019-11-23' }],
  locale: 'en',
};
const get = (list: CountryCheck[], id: string) => {
  const check = list.find((x) => x.id === id);
  if (!check) throw new Error(`Missing check: ${id}`);
  return check;
};
type Partner = NonNullable<AuFamilyAnswers['partner']>;
type Citizen = NonNullable<AuFamilyAnswers['citizenship']>;
type Rrv = NonNullable<AuFamilyAnswers['rrv']>;

const partner: Partner = {
  stream: 'onshore',
  relationship: 'de-facto',
  relationshipFrom: '2021-11-23',
  partnerAgeAtLodgement: 18,
  relationshipEvidenceAtLodgement: 'confirmed',
  eligiblePartnerStatus: true,
  priorSponsoredPeople: 1,
  lastRelevantPartnerApplication: '2021-11-23',
  parentVisaGrant: 'none',
  subclass204RestrictedAtLodgement: false,
  childOffenceBarApplies: false,
  relevantSentenceMonths: 11,
  consentToDisclosure: true,
  sponsorPoliceCheckIfRequested: true,
  sponsorshipApprovedInForce: true,
  onshoreStatus: 'substantive',
  noFurtherStay: 'clear',
  temporaryStageGranted: true,
  temporaryGrant: { basis: 'ordinary' },
  continuingSponsorship: true,
  relationshipAtDecision: 'continuing',
};
const partnerRequest = {
  ...base,
  visas: [{ subclass: '820' as const, from: '2025-02-15' }],
  partnerApplication: {
    stream: 'onshore' as const,
    lodged: '2025-11-23',
    longTermRelationship: false,
  },
  locationAtApplication: 'onshore' as const,
  partner,
};
function partnerResult(
  changes?: Partial<Partner>,
  request?: Partial<AuFullRequest>,
) {
  const r = {
    ...partnerRequest,
    ...request,
    partner: { ...partner, ...changes },
  };
  return familyChecks('AU-PARTNER', r);
}

describe('combined partner application and permanent stage', () => {
  test('assesses both stages with a long-term relationship at lodgement', () => {
    expect(partnerResult().filter((x) => x.status !== 'MET')).toEqual([]);
  });
  test.each<[string, Partial<Partner>, CountryCheck['status']]>([
    [
      'relationship',
      {
        relationshipFrom: '2024-11-24',
        registeredAtLodgement: false,
        humanitarianDeFactoException: false,
        compassionateDeFactoClaim: false,
      },
      'NOT_MET',
    ],
    ['relationship', { relationshipFrom: '2024-11-23' }, 'MET'],
    [
      'relationship',
      { relationshipFrom: '2025-11-20', registeredAtLodgement: true },
      'MET',
    ],
    [
      'relationship',
      { relationshipFrom: '2025-11-20', compassionateDeFactoClaim: true },
      'UNKNOWN',
    ],
    ['relationship', { partnerAgeAtLodgement: 17 }, 'NOT_MET'],
    ['evidence', { relationshipEvidenceAtLodgement: 'pending' }, 'UNKNOWN'],
    ['sponsor-status', { eligiblePartnerStatus: false }, 'NOT_MET'],
    [
      'sponsor-status',
      {
        relationship: 'married',
        partnerAgeAtLodgement: 17,
        eligibleAdultGuardianSponsor: true,
      },
      'MET',
    ],
    ['sponsorship-history', { priorSponsoredPeople: 2 }, 'NOT_MET'],
    [
      'sponsorship-history',
      { lastRelevantPartnerApplication: '2021-11-24' },
      'NOT_MET',
    ],
    [
      'sponsorship-history',
      { priorSponsoredPeople: 2, historyException: 'pending' },
      'UNKNOWN',
    ],
    ['parent-visa', { parentVisaGrant: '2021-11-24' }, 'NOT_MET'],
    ['parent-visa', { parentVisaGrant: '2021-11-23' }, 'MET'],
    ['humanitarian-bar', { subclass204RestrictedAtLodgement: true }, 'NOT_MET'],
    ['sponsor-offences', { relevantSentenceMonths: 12 }, 'NOT_MET'],
    ['sponsor-offences', { childOffenceBarApplies: true }, 'NOT_MET'],
    ['disclosure', { consentToDisclosure: false }, 'NOT_MET'],
    ['sponsorship', { sponsorshipApprovedInForce: false }, 'NOT_MET'],
    ['onshore-status', { onshoreStatus: 'needs-review' }, 'UNKNOWN'],
    ['onshore-status', { noFurtherStay: 'waiver-pending' }, 'NOT_MET'],
    ['temporary-stage', { temporaryStageGranted: false }, 'NOT_MET'],
    ['continuity', { relationshipAtDecision: 'ended' }, 'NOT_MET'],
    ['continuity', { continuingSponsorship: false }, 'NOT_MET'],
    ['continuity', { relationshipAtDecision: 'family-violence' }, 'UNKNOWN'],
    [
      'time',
      { relationshipFrom: '2023-11-24', sharedDependentChildAtLodgement: true },
      'NOT_MET',
    ],
    [
      'time',
      { relationshipFrom: '2023-11-23', sharedDependentChildAtLodgement: true },
      'MET',
    ],
    [
      'time',
      {
        relationshipFrom: '2022-11-24',
        sharedDependentChildAtLodgement: false,
      },
      'NOT_MET',
    ],
    [
      'time',
      {
        relationshipFrom: '2022-11-23',
        sharedDependentChildAtLodgement: false,
      },
      'MET',
    ],
    [
      'time',
      {
        relationshipFrom: '2024-11-23',
        relationshipAtDecision: 'death',
        exceptionEvidence: 'confirmed',
      },
      'MET',
    ],
  ])('%s with %j → %s', (key, input, status) => {
    expect(get(partnerResult(input), 'AU-PARTNER-' + key).status).toBe(status);
  });
  test('onshore and offshore location and family violence exceptions differ', () => {
    expect(
      get(
        partnerResult({}, { locationAtApplication: 'offshore' }),
        'AU-PARTNER-location',
      ).status,
    ).toBe('NOT_MET');
    const offshore = {
      partnerApplication: {
        ...partnerRequest.partnerApplication,
        stream: 'offshore' as const,
      },
      locationAtApplication: 'offshore' as const,
    };
    const x = partnerResult(
      {
        relationshipAtDecision: 'family-violence',
        exceptionEvidence: 'confirmed',
        enteredAfterApplication: false,
      },
      offshore,
    );
    expect(get(x, 'AU-PARTNER-continuity').status).toBe('NOT_MET');
    expect(get(x, 'AU-PARTNER-onshore-status').status).toBe('MET');
  });
});

const returnRequest: AuFullRequest = {
  ...base,
  locationAtApplication: 'onshore',
  locationAtDecision: 'offshore',
  noFurtherStay: 'clear',
};
function returnResult(rrv: Rrv, overrides?: Partial<AuFullRequest>) {
  return familyChecks('AU-RRV', { ...returnRequest, ...overrides, rrv });
}
describe('resident return alternatives', () => {
  test('detects a qualifying current PR from the unchanged time calculation', () => {
    const old = evaluateAustralia(base).pathways.find((x) => x.id === 'AU-RRV');
    const out = familyChecks(
      'AU-RRV',
      { ...returnRequest, rrv: { returnApplicationBar: false } },
      old,
    );
    for (const key of [
      'status',
      'valid-application',
      'clearance',
      'basis',
      'option-residence',
    ])
      expect(get(out, 'AU-RRV-' + key).status).toBe('MET');
    expect(get(out, 'AU-RRV-option-residence').explanation).toBe(
      old?.checks[0].text,
    );
  });
  test('former citizens and former permanent residents can use verified qualifying days', () => {
    for (const status of ['former-pr', 'former-citizen'] as const) {
      expect(
        get(returnResult({ status, qualifyingDays: 730 }), 'AU-RRV-basis')
          .status,
      ).toBe('MET');
      expect(
        get(returnResult({ status, qualifyingDays: 729 }), 'AU-RRV-basis')
          .status,
      ).toBe('UNKNOWN');
    }
    expect(
      get(returnResult({ status: 'cancelled-pr' }), 'AU-RRV-status').status,
    ).toBe('NOT_MET');
    expect(
      get(
        returnResult({ returnApplicationBar: true }),
        'AU-RRV-valid-application',
      ).status,
    ).toBe('NOT_MET');
    expect(
      get(
        returnResult({}, { locationAtDecision: 'clearance' }),
        'AU-RRV-clearance',
      ).status,
    ).toBe('NOT_MET');
  });
  test('an adverse or pending basis cannot veto an independent family or ties basis', () => {
    expect(
      get(returnResult({ familyBasis: 'qualifying-155' }), 'AU-RRV-basis')
        .status,
    ).toBe('MET');
    expect(
      get(returnResult({ familyBasis: 'none' }), 'AU-RRV-option-family').status,
    ).toBe('NOT_MET');
    const ties: Rrv = {
      qualifyingDays: 0,
      ties: 'confirmed',
      tiesDepartureRequirements: true,
      continuousAbsenceYears: 4,
    };
    expect(get(returnResult(ties), 'AU-RRV-option-ties').status).toBe('MET');
    expect(
      get(
        returnResult({
          ...ties,
          continuousAbsenceYears: 5,
          longAbsenceReasons: 'pending',
        }),
        'AU-RRV-option-ties',
      ).pendingDetails,
    ).toEqual(['PD-216']);
  });
  test('157 includes a one-day boundary and a separate offshore absence test for family applicants too', () => {
    const short: Rrv = {
      qualifyingDays: 1,
      compassionateDeparture: 'confirmed',
      familyBasis: 'none',
    };
    expect(get(returnResult(short), 'AU-RRV-option-short').status).toBe('MET');
    expect(
      get(returnResult({ ...short, qualifyingDays: 0 }), 'AU-RRV-option-short')
        .status,
    ).toBe('NOT_MET');
    const offshore = { locationAtApplication: 'offshore' as const };
    expect(
      get(
        returnResult(
          { familyBasis: 'qualifying-157', absentSince: '2026-08-23' },
          offshore,
        ),
        'AU-RRV-basis',
      ).status,
    ).toBe('MET');
    expect(
      get(
        returnResult(
          {
            familyBasis: 'qualifying-157',
            absentSince: '2026-08-22',
            compassionateAbsence: 'refused',
          },
          offshore,
        ),
        'AU-RRV-option-short',
      ).status,
    ).toBe('NOT_MET');
    expect(
      get(
        returnResult({ ...short, qualifyingDays: 0, ties: 'none' }),
        'AU-RRV-basis',
      ).status,
    ).toBe('NOT_MET');
  });
});

const citizen: Citizen = {
  medicalBranch: 'none',
  permanentAtDecision: true,
  confinementEnded: 'none',
  test: { correct: 15, valuesCorrect: 5 },
  character: 'confirmed',
  policeCertificatesIfRequired: true,
  identity: 'confirmed',
  securityBar: false,
  currentCriminalBar: false,
  lastPrisonSentence: 'none',
  mostRecentCessation: 'never',
  intention: 'reside',
  inAustraliaAtApproval: true,
  willingToPledge: true,
};
const citizenTimeline = evaluateAustraliaTimeline(base);
const oldCit = citizenTimeline.result.pathways.find(
  (x) => x.id === 'AU-CITIZENSHIP',
);
function citizenResult(
  c?: Partial<Citizen>,
  overrides?: Partial<AuFullRequest>,
) {
  return familyChecks(
    'AU-CITIZENSHIP',
    { ...base, ...overrides, citizenship: { ...citizen, ...c } },
    oldCit,
    citizenTimeline.citizenshipResidence,
  );
}
describe('citizenship by conferral', () => {
  test('recent permanent grant establishes PR at application before the final residence year is complete', () => {
    const request: AuFullRequest = {
      ...base,
      pathway: 'AU-CITIZENSHIP',
      firstArrival: '2020-01-01',
      visas: [
        { subclass: '482', from: '2020-01-01' },
        { subclass: '189', from: '2026-01-01' },
      ],
      citizenship: citizen,
    };
    const result = (simulationDate: string) =>
      evaluateAustraliaFull({ ...request, simulationDate }).columns[0]
        .pathways[0];
    const before = result('2026-11-23');
    expect(get(before.checks, 'AU-CIT-pr').status).toBe('MET');
    expect(get(before.checks, 'AU-CIT-time-permanent').status).toBe('NOT_MET');
    expect(before).toMatchObject({
      status: 'FUTURE',
      earliestDate: '2027-01-01',
    });
    const due = result('2027-01-01');
    expect(get(due.checks, 'AU-CIT-pr').status).toBe('MET');
    expect(get(due.checks, 'AU-CIT-time-permanent').status).toBe('MET');
    expect(due).toMatchObject({ status: 'MET', earliestDate: '2027-01-01' });
    const expired = evaluateAustraliaFull({
      ...request,
      simulationDate: '2027-01-01',
      visas: [{ subclass: '189', from: '2020-01-01', to: '2026-12-31' }],
    }).columns[0].pathways[0];
    expect(get(expired.checks, 'AU-CIT-time-permanent').status).toBe('MET');
    expect(get(expired.checks, 'AU-CIT-pr').status).toBe('NOT_MET');
    expect(expired.status).toBe('NOT_MET');
    expect(expired.earliestDate).toBeUndefined();
  });
  test('the ordinary case passes every statutory check, using the five original residence checks', () => {
    const out = citizenResult();
    expect(out.filter((x) => x.status !== 'MET')).toEqual([]);
    const checks = out.filter((x) => x.id.startsWith('AU-CIT-time-'));
    expect(checks).toHaveLength(5);
    for (const [i, check] of checks.entries()) {
      if (check.id === 'AU-CIT-time-permanent') {
        expect(check.explanation).toContain('before the application day');
      } else expect(check.explanation).toBe(oldCit?.checks[i + 1].text);
    }
  });
  test.each<[string, Partial<Citizen>, CountryCheck['status']]>([
    ['branch', { medicalBranch: 'sensory-claimed' }, 'UNKNOWN'],
    ['pr', { permanentAtDecision: false }, 'NOT_MET'],
    ['confinement', { confinementEnded: '2022-11-24' }, 'NOT_MET'],
    ['confinement', { confinementEnded: '2022-11-23' }, 'MET'],
    [
      'confinement',
      { confinementEnded: '2022-11-24', confinementDiscretion: 'pending' },
      'UNKNOWN',
    ],
    ['test', { test: { correct: 14, valuesCorrect: 5 } }, 'NOT_MET'],
    ['test', { test: { correct: 19, valuesCorrect: 4 } }, 'NOT_MET'],
    ['test', { test: 'retest-pending' }, 'UNKNOWN'],
    [
      'test',
      { test: 'awaiting', medicalBranch: 'incapacity-confirmed' },
      'MET',
    ],
    [
      'understanding',
      { understandsApplication: false, medicalBranch: 'sensory-confirmed' },
      'NOT_MET',
    ],
    ['character', { character: 'no-known-record' }, 'UNKNOWN'],
    ['police', { policeCertificatesIfRequired: false }, 'NOT_MET'],
    ['identity', { identity: 'pending' }, 'UNKNOWN'],
    ['security', { securityBar: true }, 'NOT_MET'],
    ['criminal-bars', { currentCriminalBar: true }, 'NOT_MET'],
    ['prior-cessation', { mostRecentCessation: '2025-11-24' }, 'NOT_MET'],
    ['prior-cessation', { mostRecentCessation: '2025-11-23' }, 'MET'],
    ['intention', { intention: 'links-claimed' }, 'UNKNOWN'],
    ['at-approval', { inAustraliaAtApproval: false }, 'NOT_MET'],
    [
      'at-approval',
      { inAustraliaAtApproval: false, approvalAbroadException: 'confirmed' },
      'MET',
    ],
    ['pledge', { willingToPledge: false }, 'NOT_MET'],
  ])('%s with %j → %s', (key, answers, status) => {
    expect(get(citizenResult(answers), 'AU-CIT-' + key).status).toBe(status);
  });
  test.each([
    [11, '2026-11-01', false, 'MET'],
    [12, '2024-11-24', false, 'NOT_MET'],
    [12, '2024-11-23', false, 'MET'],
    [12, '2016-11-24', true, 'NOT_MET'],
    [12, '2016-11-23', true, 'MET'],
  ] as const)(
    'sentence %i months, first free day %s, repeat %s',
    (months, firstFreeDay, seriousRepeatOffender, status) => {
      expect(
        get(
          citizenResult({
            lastPrisonSentence: { months, firstFreeDay, seriousRepeatOffender },
          }),
          'AU-CIT-criminal-bars',
        ).status,
      ).toBe(status);
    },
  );
  test('age categories change the test, minor evidence and pledge independently', () => {
    for (const [dob, testStatus, pledgeStatus, minorStatus] of [
      ['2010-11-24', 'MET', 'MET', 'UNKNOWN'],
      ['2010-11-23', 'MET', 'NOT_MET', 'UNKNOWN'],
      ['2008-11-24', 'MET', 'NOT_MET', 'UNKNOWN'],
      ['2008-11-23', 'UNKNOWN', 'NOT_MET', 'MET'],
      ['1966-11-24', 'UNKNOWN', 'NOT_MET', 'MET'],
      ['1966-11-23', 'MET', 'NOT_MET', 'MET'],
    ] as const) {
      const out = citizenResult(
        { willingToPledge: false, test: 'awaiting' },
        { dateOfBirth: dob },
      );
      expect(get(out, 'AU-CIT-test').status).toBe(testStatus);
      expect(get(out, 'AU-CIT-pledge').status).toBe(pledgeStatus);
      expect(get(out, 'AU-CIT-minor-evidence').status).toBe(minorStatus);
    }
  });
  test('incomplete adult history and undecided statutory exceptions cannot clear time checks', () => {
    const noHistory = {
      simulationDate: base.simulationDate,
      dateOfBirth: base.dateOfBirth,
    };
    for (const decision of [undefined, 'pending', 'confirmed'] as const) {
      const out = familyChecks('AU-CITIZENSHIP', {
        ...noHistory,
        citizenship: { otherResidenceBasis: decision },
      });
      const time = out.filter((x) => x.id.startsWith('AU-CIT-time-'));
      expect(time).toHaveLength(5);
      expect(
        time.every(
          (x) => x.status === (decision === 'confirmed' ? 'MET' : 'UNKNOWN'),
        ),
      ).toBe(true);
      if (decision === 'pending')
        expect(time.every((x) => x.pendingDetails?.includes('PD-219'))).toBe(
          true,
        );
    }
    const child = familyChecks('AU-CITIZENSHIP', {
      ...noHistory,
      dateOfBirth: '2011-01-01',
      citizenship: {
        permanentAtApplication: true,
        permanentAtDecision: true,
        minorEvidence: 'confirmed',
      },
    });
    expect(
      child
        .filter((x) => x.id.startsWith('AU-CIT-time-'))
        .every((x) => x.status === 'MET'),
    ).toBe(true);
    expect(get(child, 'AU-CIT-pr').status).toBe('MET');
    const teen = citizenResult(
      { intention: 'no-links', minorEvidence: 'pending' },
      { dateOfBirth: '2009-01-01' },
    );
    expect(get(teen, 'AU-CIT-intention').status).toBe('MET');
    expect(get(teen, 'AU-CIT-minor-evidence').status).toBe('UNKNOWN');
  });
  test('use qualifying SCV history only for citizenship; the reform does not apply before commencement', () => {
    const scv = { firstGrant: '2019-11-23', continuousEligible: true };
    const original: AuRequest = {
      ...base,
      simulationDate: '2023-07-01',
      firstArrival: '2017-07-01',
      visas: [{ subclass: 'other-temporary', from: '2017-07-01' }],
    };
    const r = { ...original, citizenship: { ...citizen, scv } };
    const adjusted = citizenshipTimeRequest(r, original);
    const reentries = {
      ...original,
      visas: [
        ...original.visas,
        { subclass: 'other-temporary' as const, from: '2023-06-01' },
      ],
    };
    expect(citizenshipTimeRequest(r, reentries).visas).toEqual(adjusted.visas);
    expect(original.visas).toHaveLength(1);
    const adjustedTimeline = evaluateAustraliaTimeline(adjusted);
    const old = adjustedTimeline.result.pathways.find(
      (x) => x.id === 'AU-CITIZENSHIP',
    );
    expect(
      familyChecks(
        'AU-CITIZENSHIP',
        r,
        old,
        adjustedTimeline.citizenshipResidence,
      )
        .filter((x) => x.id.startsWith('AU-CIT-time-'))
        .every((x) => x.status === 'MET'),
    ).toBe(true);
    expect(
      citizenshipTimeRequest({ ...r, simulationDate: '2023-06-30' }, original),
    ).toBe(original);
    const recent = citizenshipTimeRequest(
      { ...r, citizenship: { scv: { ...scv, firstGrant: '2022-07-02' } } },
      original,
    );
    const recentTimeline = evaluateAustraliaTimeline(recent);
    const result = recentTimeline.result.pathways.find(
      (x) => x.id === 'AU-CITIZENSHIP',
    );
    expect(
      get(
        familyChecks(
          'AU-CITIZENSHIP',
          r,
          result,
          recentTimeline.citizenshipResidence,
        ),
        'AU-CIT-time-permanent',
      ).status,
    ).toBe('NOT_MET');
  });
});
