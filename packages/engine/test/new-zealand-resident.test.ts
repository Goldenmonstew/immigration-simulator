import { describe, expect, it } from 'vitest';
import { evaluateNewZealand, type NzRequest } from '../src/new-zealand';
import {
  evaluateNewZealandFull,
  type NzFullRequest,
} from '../src/new-zealand-full';
import type { NzResidentAnswers } from '../src/new-zealand-resident';

type Travel = NonNullable<NzResidentAnswers['travel']>;
type Prv = NonNullable<NzResidentAnswers['prv']>;
type Citizen = NonNullable<NzResidentAnswers['citizenship']>;
const base: NzFullRequest = {
  simulationDate: '2026-11-23',
  dateOfBirth: '1990-01-01',
  firstArrival: '2019-01-01',
  residentVisa: { granted: '2020-01-01', category: 'general' },
  trips: [],
  nonPrincipal: false,
  common: {
    character: 'clear',
    residenceFiling: {
      currentVisa: 'other-eligible-temporary-or-resident',
      statutoryBar: 'none',
      atImmigrationControlArea: false,
      hasOmittedRelationshipVisaDependant: false,
    },
    dependants: [],
    identityDocuments: true,
    requiredFeePaid: true,
  },
};
const prvReady: Prv = {
  role: 'principal',
  conditions: 'none',
  deportationLiability: 'none',
  furtherPoliceEvidence: 'not-requested',
  otherCommitments: [],
};
const citizenReady: Citizen = {
  fullCapacity: true,
  character: 'clear',
  foreignPoliceEvidence: 'not-requested',
  understandsResponsibilities: true,
  english: 'evidenced',
  residenceIntent: 'nz-or-realm',
  identityDocumentsAndWitness: true,
  oath: 'willing',
  presenceException: 'none',
  feeCategory: 'standard',
};
function pathway(
  id: string,
  resident: NzResidentAnswers,
  req: Partial<NzFullRequest> = {},
) {
  return evaluateNewZealandFull({
    ...base,
    ...req,
    resident: {
      ...resident,
      travel: {
        currentlyInNz: true,
        restrictedEntry: false,
        firstEntryClass: 'standard',
        ...resident.travel,
      },
    },
  }).columns[0].pathways.find((p) => p.id === id)!;
}
function check(p: ReturnType<typeof pathway>, id: string) {
  return p.checks.find((c) => c.id === id)!;
}
function expectOutcome(
  path: ReturnType<typeof pathway>,
  id: string,
  status: 'MET' | 'UNKNOWN' | 'NOT_MET',
  date = base.simulationDate,
) {
  expect(check(path, id).status, id).toBe(status);
  expect(path.status, path.id).toBe(status);
  expect(path.earliestDate, path.id).toBe(status === 'MET' ? date : undefined);
}
const travel = (
  t: Travel,
  req: Partial<NzFullRequest> = {},
  pr: Prv = prvReady,
) => pathway('NZ-TRAVEL', { travel: t, prv: pr }, req);
const prv = (pr: Prv, req: Partial<NzFullRequest> = {}) =>
  pathway('NZ-PRV', { prv: { ...prvReady, ...pr } }, req);
const citizen = (
  c: Citizen,
  req: Partial<NzFullRequest> = {},
  pr: Prv = prvReady,
) =>
  pathway(
    'NZ-CITIZENSHIP',
    { citizenship: { ...citizenReady, ...c }, prv: pr },
    req,
  );

describe('required facts at filing', () => {
  const subsequent: Travel = {
    action: 'subsequent',
    variationBasis: 'ordinary',
    atExpiry: { eligibleForPrv: true, variation: 'none' },
  };
  const former: Prv = {
    ...prvReady,
    expiredOn: '2026-10-01',
    formerResidentIssue: 'none',
  };
  it.each([
    ['onshore work visa', false, 'work', 'MET'],
    ['onshore Interim Visa', false, 'interim-work-renewal', 'NOT_MET'],
    ['offshore without a visa', true, 'none', 'MET'],
  ] as const)(
    'checks ordinary RV2 and RV4 filing for %s',
    (_label, filingFromOverseas, currentVisa, status) => {
      const req = {
        common: {
          ...base.common,
          residenceFiling: {
            ...base.common?.residenceFiling,
            filingFromOverseas,
            currentVisa,
          },
        },
      };
      // Both applications use a former resident who is still within the RV2 grace period.
      for (const path of [prv(former, req), travel(subsequent, req, former)]) {
        expectOutcome(path, 'NZ-RESIDENCE-FILING', status);
      }
    },
  );
  it('allows a former resident to lodge alone at the border under RV4', () => {
    const common = {
      ...base.common,
      residenceFiling: {
        statutoryBar: 'none' as const,
        atImmigrationControlArea: true,
        visaWaiverAtControlArea: true,
        dependentChildrenUnlawfullyInNz: [{ dateOfBirth: '2008-10-01' }],
      },
    };
    const alone = travel(subsequent, { common }, former);
    expectOutcome(alone, 'NZ-FAMILY-FILING', 'MET');
    expect(alone.checks.some((c) => c.id === 'NZ-R5-125')).toBe(false);
    for (const [visaWaiverAtControlArea, status] of [
      [undefined, 'UNKNOWN'],
      [false, 'NOT_MET'],
    ] as const)
      expectOutcome(
        travel(
          subsequent,
          {
            common: {
              ...common,
              residenceFiling: {
                ...common.residenceFiling,
                visaWaiverAtControlArea,
              },
            },
          },
          former,
        ),
        'NZ-RESIDENCE-FILING',
        status,
      );
    const joint = travel(
      subsequent,
      {
        common: {
          ...common,
          dependants: [
            {
              relation: 'partner',
              partnershipRequirementsMet: true,
              identityDocuments: true,
            },
          ],
        },
      },
      former,
    );
    expectOutcome(joint, 'NZ-FAMILY-FILING', 'NOT_MET');
  });
  it.each([true, false, undefined])(
    'uses the actual payment answer (%s) for each application',
    (requiredFeePaid) => {
      const req = { common: { ...base.common, requiredFeePaid } };
      const status =
        requiredFeePaid === undefined
          ? 'UNKNOWN'
          : requiredFeePaid
            ? 'MET'
            : 'NOT_MET';
      for (const result of [
        travel({ action: 'variation', variationBasis: 'ordinary' }, req),
        travel(subsequent, req, former),
        prv({}, req),
        citizen({}, req),
      ]) {
        expectOutcome(result, 'NZ-FILING-FEE', status);
        if (requiredFeePaid === undefined)
          expect(check(result, 'NZ-FILING-FEE').pendingDetails).toEqual([
            'PD-220',
          ]);
      }
      expect(
        travel(
          { passportCoversInitialConditions: true },
          { ...req, travelConditionsEnd: base.simulationDate },
        ).status,
      ).toBe('MET');
    },
  );
  it.each([false, undefined])(
    'checks lodging documents (%s) and the original grant separately',
    (identityDocuments) => {
      const req = { common: { ...base.common, identityDocuments } };
      const status = identityDocuments === undefined ? 'UNKNOWN' : 'NOT_MET';
      for (const result of [
        travel({ action: 'variation', variationBasis: 'ordinary' }, req),
        travel(subsequent, req, former),
        prv({}, req),
      ])
        expectOutcome(result, 'NZ-IDENTITY', status);
      expectOutcome(
        travel(
          { passportCoversInitialConditions: identityDocuments },
          { travelConditionsEnd: base.simulationDate },
        ),
        'NZ-P1-1-PASSPORT',
        status,
      );
    },
  );
  it('applies R2.1 to inclusion in a further visa application without disqualifying a former secondary applicant filing alone', () => {
    const child = {
      relation: 'child' as const,
      dateOfBirth: '2001-11-23',
      single: true,
      hasOwnChildren: false,
      financiallyDependent: true,
      identityDocuments: true,
      character: 'clear' as const,
    };
    const req = { common: { ...base.common, dependants: [child] } };
    for (const result of [
      travel({ action: 'variation', variationBasis: 'ordinary' }, req),
      travel(subsequent, req, former),
      prv({}, req),
    ])
      expectOutcome(result, 'NZ-DEPENDANTS', 'NOT_MET');
    expectOutcome(
      prv(
        { role: 'linked', principalHoldsPrv: true },
        { dateOfBirth: child.dateOfBirth },
      ),
      'NZ-P2-6',
      'MET',
    );
  });
  it('keeps mandatory residence inclusion separate from eligibility for a special travel variation', () => {
    const variation: Travel = {
      action: 'variation',
      variationBasis: 'partner',
      nzCitizenPartnerSupportsInWriting: true,
      sameOngoingSponsoredPartnership: true,
      genuineCohabitationMonths: 12,
    };
    const req = {
      common: {
        ...base.common,
        residenceFiling: {
          atImmigrationControlArea: false,
          hasOmittedRelationshipVisaDependant: true,
        },
      },
    };
    expectOutcome(prv({}, req), 'NZ-FAMILY-FILING', 'NOT_MET');
    expectOutcome(
      travel(subsequent, req, former),
      'NZ-FAMILY-FILING',
      'NOT_MET',
    );
    const baseline = travel(variation);
    expectOutcome(baseline, 'NZ-P1-3', 'MET');
    expect(travel(variation, req)).toEqual(baseline);
  });
  it('requires an answer on entry bans for permanent residence and distinguishes outstanding DIA evidence', () => {
    for (const restrictedEntry of [true, undefined]) {
      expectOutcome(
        pathway('NZ-PRV', { prv: prvReady, travel: { restrictedEntry } }),
        'NZ-P2-5',
        restrictedEntry === true ? 'NOT_MET' : 'UNKNOWN',
      );
    }
    expectOutcome(
      citizen({ foreignPoliceEvidence: 'requested-outstanding' }),
      'NZ-P3-3-POLICE',
      'NOT_MET',
    );
    expectOutcome(
      citizen({ foreignPoliceEvidence: undefined }),
      'NZ-P3-3-POLICE',
      'UNKNOWN',
    );
  });
});

describe('RV1.20 joint PRV application', () => {
  const recent = {
    firstArrival: '2025-11-01',
    residentVisa: { granted: '2025-11-01', category: 'general' as const },
    trips: [],
  };
  const application = {
    ...recent,
    prv: prvReady,
    travel: { currentlyInNz: true, restrictedEntry: false },
  };
  const partner = {
    relation: 'partner' as const,
    residenceFiling: base.common?.residenceFiling,
    partnershipRequirementsMet: true,
    identityDocuments: true,
    character: 'clear' as const,
    dateOfBirth: '1992-05-01',
    prvApplication: application,
  };
  type Included = NonNullable<
    NonNullable<NzFullRequest['common']>['dependants']
  >[number];
  const together = (
    person: Included | Included[],
    main: Partial<NzFullRequest> = {},
  ) =>
    prv(
      {},
      {
        firstArrival: '2018-01-01',
        residentVisa: { granted: '2018-01-01', category: 'general' },
        ...main,
        common: {
          ...base.common,
          dependants: Array.isArray(person) ? person : [person],
        },
      },
    );

  it('assesses each original principal in their own right, with the same date as filing alone', () => {
    const joint = together(partner);
    const alone = prv(prvReady, {
      ...recent,
      dateOfBirth: partner.dateOfBirth,
    });
    expect(check(joint, 'NZ-P2-1').status).toBe('MET');
    expect(check(joint, 'NZ-P2-PARTNER').status).toBe('NOT_MET');
    expect(alone.status).toBe('FUTURE');
    expect(joint.status).toBe(alone.status);
    expect(joint.earliestDate).toBe('2027-11-01');
    expect(joint.earliestDate).toBe(alone.earliestDate);
    expectOutcome(
      together(partner, { simulationDate: '2027-11-01' }),
      'NZ-P2-PARTNER',
      'MET',
      '2027-11-01',
    );
  });
  it('requires the partner’s original role and own timeline and checks non-time restrictions', () => {
    expectOutcome(
      together({ ...partner, prvApplication: undefined }),
      'NZ-P2-PARTNER',
      'UNKNOWN',
    );
    expectOutcome(
      together({
        ...partner,
        prvApplication: {
          ...application,
          prv: { ...prvReady, role: undefined },
        },
      }),
      'NZ-P2-PARTNER',
      'UNKNOWN',
    );
    expectOutcome(
      together({ ...partner, prvApplication: { prv: prvReady } }),
      'NZ-P2-PARTNER',
      'UNKNOWN',
    );
    expectOutcome(
      together({
        ...partner,
        prvApplication: {
          ...application,
          prv: { ...prvReady, conditions: 'breached' },
        },
      }),
      'NZ-P2-PARTNER',
      'NOT_MET',
    );
    expectOutcome(
      together({ ...partner, partnershipRequirementsMet: false }),
      'NZ-DEPENDANTS',
      'NOT_MET',
    );
  });
  it('uses the original principal for a linked partner and checks their own entry', () => {
    const linked = {
      ...application,
      linkedToJointPrincipal: true,
      prv: { ...prvReady, role: 'linked' as const },
    };
    expectOutcome(
      together({
        ...partner,
        prvApplication: { ...linked, linkedToJointPrincipal: false },
      }),
      'NZ-P2-PARTNER',
      'UNKNOWN',
    );
    expectOutcome(
      together({
        ...partner,
        prvApplication: {
          ...linked,
          linkedToJointPrincipal: false,
          prv: { ...linked.prv, principalHoldsPrv: false },
        },
      }),
      'NZ-P2-PARTNER',
      'NOT_MET',
    );
    expectOutcome(
      together({ ...partner, prvApplication: linked }),
      'NZ-P2-PARTNER',
      'MET',
    );
    expectOutcome(
      together({
        ...partner,
        prvApplication: {
          ...linked,
          travel: { ...linked.travel, firstResidentEntry: null },
        },
      }),
      'NZ-P2-PARTNER',
      'NOT_MET',
    );
  });
  const child: Included = {
    relation: 'child',
    residenceFiling: base.common?.residenceFiling,
    dateOfBirth: '2017-02-01',
    identityDocuments: true,
    character: 'clear',
    single: true,
    relocationAuthority: 'right-evidenced',
    prvApplication: application,
  };
  const linkedChild = {
    ...child,
    prvApplication: {
      ...application,
      linkedToJointPrincipal: true,
      prv: { ...prvReady, role: 'linked' as const },
    },
  };

  it.each([undefined, '2025-11-01'])(
    'projects the independently granted child’s date with firstResidentEntry = %s',
    (firstResidentEntry) => {
      const travel = { ...application.travel, firstResidentEntry };
      const alone = pathway(
        'NZ-PRV',
        { prv: prvReady, travel },
        {
          ...recent,
          dateOfBirth: child.dateOfBirth,
        },
      );
      const family = [
        linkedChild,
        { ...child, prvApplication: { ...application, travel } },
      ];
      const joint = together(family);
      expect(check(joint, 'NZ-P2-CHILD-1').status).toBe('MET');
      expect(check(joint, 'NZ-P2-CHILD-2').status).toBe('NOT_MET');
      expect(check(joint, 'NZ-P2-1').status).toBe('MET');
      for (const path of [alone, joint]) {
        expect(path.status).toBe('FUTURE');
        expect(path.earliestDate).toBe('2027-11-01');
      }
      expectOutcome(
        together(family, { simulationDate: '2027-11-01' }),
        'NZ-P2-CHILD-2',
        'MET',
        '2027-11-01',
      );
    },
  );

  it.each([undefined, '2027-11-03'])(
    'preserves the joint date before the recorded trip causes expiry (expiredOn = %s)',
    (expiredOn) => {
      const result = together({
        ...child,
        prvApplication: {
          ...application,
          trips: [{ departed: '2027-11-02', returned: '2027-11-06' }],
          prv: { ...prvReady, expiredOn },
        },
      });
      expect(check(result, 'NZ-P2-CHILD-1').status).toBe('NOT_MET');
      expect(result.status).toBe('FUTURE');
      expect(result.earliestDate).toBe('2027-11-01');
    },
  );

  const departureDayGrant = {
    ...application,
    firstArrival: '2020-01-01',
    trips: [{ departed: '2025-11-01', returned: '2025-12-01' }],
  };
  it.each([
    ['offshore', undefined, '2027-12-01'],
    ['offshore', '2025-12-01', '2027-12-01'],
    [undefined, '2025-12-01', '2027-12-01'],
    ['onshore', undefined, '2027-11-01'],
  ] as const)(
    'uses the first resident day for a grant on departure (location %s, explicit entry %s)',
    (grantLocation, firstResidentEntry, due) => {
      const travel: Travel = {
        ...application.travel,
        firstEntryClass: 'standard',
        grantLocation,
        firstResidentEntry,
      };
      const family = {
        ...child,
        prvApplication: { ...departureDayGrant, travel },
      };
      const alone = pathway(
        'NZ-PRV',
        { prv: prvReady, travel },
        departureDayGrant,
      );
      for (const result of [alone, together(family)]) {
        expect(result.status).toBe('FUTURE');
        expect(result.earliestDate).toBe(due);
      }
      expectOutcome(
        together(family, { simulationDate: due }),
        'NZ-P2-CHILD-1',
        'MET',
        due,
      );
    },
  );
  it('withholds a joint date if a grant and departure cannot be ordered', () => {
    const family = {
      ...child,
      prvApplication: {
        ...departureDayGrant,
        travel: { ...application.travel, firstEntryClass: 'standard' as const },
      },
    };
    const result = together(family, { simulationDate: '2027-11-01' });
    expectOutcome(result, 'NZ-P2-CHILD-1', 'UNKNOWN');
    expect(check(result, 'NZ-P2-CHILD-1').pendingDetails).toContain('PD-222');
    expect(together(family).earliestDate).toBeUndefined();
    const legacy = evaluateNewZealand({
      simulationDate: base.simulationDate,
      dateOfBirth: child.dateOfBirth!,
      ...departureDayGrant,
    }).pathways.find((path) => path.id === 'NZ-PRV');
    expect(legacy?.status).toBe('FUTURE');
    expect(legacy?.earliestDate).toBe('2027-11-01');
  });

  it('uses the reported first resident entry when the travel history suggests an earlier date', () => {
    const family = {
      ...child,
      prvApplication: {
        ...application,
        travel: {
          ...application.travel,
          firstEntryClass: 'standard' as const,
          firstResidentEntry: '2026-02-01',
        },
      },
    };
    expectOutcome(
      together(family, { simulationDate: '2027-11-01' }),
      'NZ-P2-CHILD-1',
      'NOT_MET',
    );
    expectOutcome(
      together(family, { simulationDate: '2028-02-01' }),
      'NZ-P2-CHILD-1',
      'MET',
      '2028-02-01',
    );
  });

  it('requires the child’s original role, own residence history and applicable evidence', () => {
    expectOutcome(
      together({ ...child, prvApplication: undefined }),
      'NZ-P2-CHILD-1',
      'UNKNOWN',
    );
    expectOutcome(
      together({ ...child, prvApplication: { prv: prvReady } }),
      'NZ-P2-CHILD-1',
      'UNKNOWN',
    );
    expectOutcome(
      together({
        ...child,
        prvApplication: {
          ...application,
          prv: { ...prvReady, conditions: 'breached' },
        },
      }),
      'NZ-P2-CHILD-1',
      'NOT_MET',
    );
    expectOutcome(together(linkedChild), 'NZ-P2-CHILD-1', 'MET');
    expectOutcome(
      together({
        ...linkedChild,
        prvApplication: {
          ...linkedChild.prvApplication,
          travel: { ...application.travel, firstResidentEntry: null },
        },
      }),
      'NZ-P2-CHILD-1',
      'NOT_MET',
    );
  });

  it.each([true, false])(
    'rechecks the age of every child on the joint date (partner included: %s)',
    (withPartner) => {
      const readyPartner = {
        ...partner,
        prvApplication: {
          ...application,
          firstArrival: '2018-01-01',
          residentVisa: { granted: '2018-01-01', category: 'general' as const },
        },
      };
      const ageingChild = {
        ...linkedChild,
        hasOwnChildren: false,
        financiallyDependent: true,
      };
      const family = (dateOfBirth: string) => [
        ...(withPartner ? [readyPartner] : []),
        { ...ageingChild, dateOfBirth },
      ];
      for (const birth of ['2002-02-01', '2002-11-01']) {
        const joint = together(family(birth), recent);
        expect(check(joint, 'NZ-DEPENDANTS').status).toBe('MET');
        expectOutcome(joint, 'NZ-P2-JOINT-DATE', 'NOT_MET');
        expectOutcome(
          together(family(birth), { ...recent, simulationDate: '2027-11-01' }),
          'NZ-DEPENDANTS',
          'NOT_MET',
        );
      }
      const eligible = together(family('2002-11-02'), recent);
      expect(eligible.status).toBe('FUTURE');
      expect(eligible.earliestDate).toBe('2027-11-01');
      expectOutcome(
        together(family('2002-11-02'), {
          ...recent,
          simulationDate: '2027-11-01',
        }),
        'NZ-DEPENDANTS',
        'MET',
        '2027-11-01',
      );
    },
  );

  it('rules out a joint date when a child with an unanswered original role must already have aged out', () => {
    const joint = together(
      {
        ...linkedChild,
        prvApplication: undefined,
        dateOfBirth: '2002-02-01',
        hasOwnChildren: false,
        financiallyDependent: true,
      },
      recent,
    );
    expect(check(joint, 'NZ-P2-CHILD-1').status).toBe('UNKNOWN');
    expectOutcome(joint, 'NZ-P2-JOINT-DATE', 'NOT_MET');
  });

  it('rechecks an earlier qualifying child’s expiry grace when a sibling sets the joint date', () => {
    const former = {
      ...child,
      prvApplication: {
        ...application,
        firstArrival: '2019-01-01',
        residentVisa: { granted: '2020-01-01', category: 'general' as const },
        travelConditionsEnd: '2026-12-01',
        trips: [{ departed: '2026-11-29', returned: '2026-12-07' }],
      },
    };
    const joint = together([former, child]);
    expect(check(joint, 'NZ-P2-CHILD-1').status).toBe('MET');
    expectOutcome(joint, 'NZ-P2-JOINT-DATE', 'NOT_MET');
    expectOutcome(
      together([former, child], { simulationDate: '2027-11-01' }),
      'NZ-P2-CHILD-1',
      'NOT_MET',
    );
  });
  it('withholds a date when ageing into the financial dependency test needs more evidence', () => {
    const family = {
      ...linkedChild,
      dateOfBirth: '2006-05-01',
      hasOwnChildren: false,
    };
    const joint = together(family, recent);
    expect(check(joint, 'NZ-DEPENDANTS').status).toBe('MET');
    expectOutcome(joint, 'NZ-P2-JOINT-DATE', 'UNKNOWN');
    expectOutcome(
      together(family, { ...recent, simulationDate: '2027-11-01' }),
      'NZ-DEPENDANTS',
      'UNKNOWN',
    );
  });
  it('does not project a joint date after the first applicant’s visa has lapsed outside the grace period', () => {
    const joint = together(partner, {
      travelConditionsEnd: '2026-12-01',
      trips: [{ departed: '2026-11-29', returned: '2026-12-07' }],
    });
    expect(joint.status).toBe('NOT_MET');
    expect(joint.summary).toContain('2027-11-01');
    expect(joint.earliestDate).toBeUndefined();
  });
});

describe('resident travel conditions and subsequent residence', () => {
  const openTripRecord: Partial<NzFullRequest> = {
    firstArrival: '2020-01-01',
    residentVisa: { granted: '2025-10-01', category: 'general' },
    trips: [],
  };
  const initialTravel: Travel = {
    action: 'initial',
    firstEntryClass: 'standard',
    passportCoversInitialConditions: true,
  };
  const openTripTravel = { ...initialTravel, currentlyInNz: false };
  it.each([
    ['unreported current location', {}, {}, 'UNKNOWN'],
    ['currently onshore', { currentlyInNz: true }, {}, 'MET'],
    [
      'unconfirmed grant location while abroad',
      { currentlyInNz: false },
      {},
      'UNKNOWN',
    ],
    [
      'offshore grant and no first entry',
      {
        currentlyInNz: false,
        grantLocation: 'offshore',
        firstResidentEntry: null,
      },
      {},
      'NOT_MET',
    ],
    [
      'onshore grant before leaving',
      { currentlyInNz: false, grantLocation: 'onshore' },
      {},
      'MET',
    ],
    [
      'arrival on another visa after the first-entry deadline',
      { currentlyInNz: true, grantLocation: 'offshore' },
      { firstArrival: '2026-11-01' },
      'NOT_MET',
    ],
  ] as const)(
    'checks first entry and multiple-entry conditions for %s',
    (_label, evidence, record, status) => {
      const path = evaluateNewZealandFull({
        ...base,
        ...openTripRecord,
        ...record,
        resident: { travel: { ...initialTravel, ...evidence } },
      }).columns[0].pathways.find((p) => p.id === 'NZ-TRAVEL')!;
      expectOutcome(path, 'NZ-P1-1', status);
      expect(check(path, 'NZ-P1-1-TRAVEL').status).toBe(status);
      if (status === 'NOT_MET')
        expect(check(path, 'NZ-P1-1-TRAVEL').explanation).toContain('从未生效');
    },
  );

  it.each([
    ['2025-10-01', undefined, 'UNKNOWN'],
    ['2025-10-01', '2025-10-01', 'MET'],
    ['2025-10-02', undefined, 'MET'],
  ] as const)(
    'checks an offshore grant with return on %s and reported resident entry %s',
    (returned, firstResidentEntry, status) => {
      const path = travel(
        { ...openTripTravel, grantLocation: 'offshore', firstResidentEntry },
        { ...openTripRecord, trips: [{ departed: '2025-09-01', returned }] },
      );
      expectOutcome(path, 'NZ-P1-1', status);
      expect(check(path, 'NZ-P1-1-TRAVEL').status).toBe(status);
    },
  );

  it.each([
    ['2026-09-30', 'standard', 'UNKNOWN', 'FUTURE', '2026-09-30'],
    ['2026-10-01', 'standard', 'NOT_MET', 'NOT_MET', undefined],
    ['2026-09-30', undefined, 'UNKNOWN', 'UNKNOWN', undefined],
  ] as const)(
    'checks a planned first arrival on %s with entry class %s',
    (firstArrival, firstEntryClass, checkStatus, pathStatus, earliest) => {
      const path = travel(
        { ...openTripTravel, grantLocation: 'offshore', firstEntryClass },
        { ...openTripRecord, firstArrival, simulationDate: '2026-09-01' },
      );
      expect(check(path, 'NZ-P1-1').status).toBe(checkStatus);
      expect(check(path, 'NZ-P1-1-TRAVEL').status).toBe(checkStatus);
      expect(path.status).toBe(pathStatus);
      expect(path.earliestDate).toBe(earliest);
    },
  );

  it.each([
    ['2025-09-01', '2025-09-10', 'UNKNOWN'],
    ['2025-11-01', '2025-11-10', 'MET'],
    ['2026-12-01', '2026-12-10', 'UNKNOWN'],
  ] as const)(
    'checks whether a return on %s–%s rules out being abroad at grant',
    (departed, returned, status) => {
      const path = travel(openTripTravel, {
        ...openTripRecord,
        trips: [{ departed, returned }],
      });
      expectOutcome(path, 'NZ-P1-1', status);
    },
  );

  it('keeps first entry unconfirmed if the visa lapsed just after its first-entry deadline', () => {
    const path = travel(openTripTravel, openTripRecord, {
      ...prvReady,
      expiredOn: '2026-10-01',
    });
    expect(check(path, 'NZ-P1-1').status).toBe('UNKNOWN');
    expect(path.status).toBe('NOT_MET');
    expect(path.earliestDate).toBeUndefined();
  });

  const reviewRecord: Partial<NzFullRequest> = {
    firstArrival: '2018-01-01',
    residentVisa: { granted: '2018-01-01', category: 'general' },
    travelConditionsEnd: '2026-06-30',
    trips: [],
  };
  const reviewPath = (
    id: string,
    location: boolean | undefined,
    expiredOn?: string,
  ) =>
    pathway(
      id,
      {
        travel: {
          currentlyInNz: location,
          passportCoversInitialConditions: true,
        },
        prv: { ...prvReady, formerResidentIssue: 'none', expiredOn },
        citizenship: citizenReady,
      },
      reviewRecord,
    );

  it.each([
    ['NZ-TRAVEL', 'NZ-P1-1-TRAVEL', 'NOT_MET', 'NOT_MET', 'NOT_MET'],
    ['NZ-PRV', 'NZ-P2-1', 'UNKNOWN', 'UNKNOWN', 'MET'],
    ['NZ-CITIZENSHIP', 'NZ-P3-1-STATUS', 'NOT_MET', 'UNKNOWN', 'MET'],
  ] as const)(
    'assesses the open trip after expiry for %s without inventing a lapse date',
    (id, condition, offshore, unreportedLocation, onshore) => {
      expectOutcome(reviewPath(id, false), condition, offshore);
      expectOutcome(reviewPath(id, undefined), condition, unreportedLocation);
      expectOutcome(reviewPath(id, true), condition, onshore);
    },
  );

  it('uses the actual offshore lapse date at 90 and 91 days, and does not count an undated absence', () => {
    expectOutcome(reviewPath('NZ-PRV', false, '2026-08-25'), 'NZ-P2-1', 'MET');
    expectOutcome(
      reviewPath('NZ-PRV', false, '2026-08-24'),
      'NZ-P2-1',
      'NOT_MET',
    );
    expect(
      check(reviewPath('NZ-CITIZENSHIP', false), 'NZ-P3-1-PRESENCE').status,
    ).toBe('UNKNOWN');
  });

  it('keeps the visa valid through its last travel day and uses the lapse date of a recorded trip', () => {
    const req = {
      ...reviewRecord,
      trips: [{ departed: '2026-06-25', returned: '2026-07-03' }],
    };
    const t = { passportCoversInitialConditions: true, currentlyInNz: false };
    expectOutcome(
      travel(t, { ...req, simulationDate: '2026-06-30' }),
      'NZ-P1-1-TRAVEL',
      'MET',
      '2026-06-30',
    );
    expectOutcome(
      travel(t, { ...req, simulationDate: '2026-07-01' }),
      'NZ-P1-1-TRAVEL',
      'NOT_MET',
    );
    const laterTrip = {
      ...req,
      trips: [{ departed: '2026-07-01', returned: '2026-07-03' }],
    };
    expectOutcome(
      travel(t, { ...laterTrip, simulationDate: '2026-07-01' }),
      'NZ-P1-1-TRAVEL',
      'NOT_MET',
    );
    expectOutcome(
      travel(t, { ...laterTrip, simulationDate: '2026-07-02' }),
      'NZ-P1-1-TRAVEL',
      'NOT_MET',
    );
  });

  it('retains initial travel, separates passport, and uses the shorter Pacific first-entry deadline', () => {
    expect(
      travel(
        { passportCoversInitialConditions: true },
        { travelConditionsEnd: base.simulationDate },
      ).status,
    ).toBe('MET');
    expect(
      check(
        travel({ passportCoversInitialConditions: false }),
        'NZ-P1-1-PASSPORT',
      ).status,
    ).toBe('NOT_MET');
    const t: Travel = {
      firstEntryClass: 'pacific-quota',
      passportCoversInitialConditions: true,
    };
    const offshore = {
      ...base,
      residentVisa: { granted: '2025-01-01', category: 'general' as const },
    };
    expect(
      check(travel(t, { ...offshore, firstArrival: '2025-03-31' }), 'NZ-P1-1')
        .status,
    ).toBe('MET');
    expect(
      check(travel(t, { ...offshore, firstArrival: '2025-04-01' }), 'NZ-P1-1')
        .status,
    ).toBe('NOT_MET');
    expectOutcome(
      travel(
        { ...t, firstEntryClass: undefined },
        { ...offshore, firstArrival: '2025-04-01' },
      ),
      'NZ-P1-1',
      'UNKNOWN',
    );
    const lapse = travel(t, {
      ...offshore,
      firstArrival: '2025-03-01',
      travelConditionsEnd: '2025-04-01',
      trips: [{ departed: '2025-03-15', returned: '2025-05-01' }],
    });
    expect(check(lapse, 'NZ-P1-1-TRAVEL').status).toBe('NOT_MET');
    const child = travel(
      {
        firstEntryClass: 'aip-child',
        parentFirstEntry: 'completed',
        parentTravelEnd: '2028-01-31',
        passportCoversInitialConditions: true,
      },
      {
        ...offshore,
        firstArrival: '2026-02-01',
      },
    );
    expect(check(child, 'NZ-P1-1').status).toBe('MET');
    expect(check(child, 'NZ-P1-1-TRAVEL').explanation).toContain('2028-01-31');
  });
  it('distinguishes a secure onshore variation from the longer period and an offshore ban', () => {
    const banned: Travel = {
      action: 'variation',
      variationBasis: 'ordinary',
      restrictedEntry: true,
    };
    const onshore = travel(banned);
    expect(onshore.status).toBe('MET');
    expect(check(onshore, 'NZ-P1-3').status).toBe('NOT_MET');
    expect(check(onshore, 'NZ-P1-FEE').pendingDetails).toEqual(['PD-225']);
    expect(
      check(travel({ ...banned, currentlyInNz: false }), 'NZ-P1-2').status,
    ).toBe('NOT_MET');
    expect(
      check(travel({ ...banned, restrictedEntry: false }), 'NZ-P1-3').status,
    ).toBe('MET');
  });
  it('recognises documented special variation, with one year of partnership or eight total years secondment', () => {
    const recent = {
      residentVisa: { granted: '2026-10-01', category: 'general' as const },
    };
    const p: Travel = {
      action: 'variation',
      variationBasis: 'partner',
      nzCitizenPartnerSupportsInWriting: true,
      sameOngoingSponsoredPartnership: false,
      restrictedEntry: false,
    };
    expect(
      check(travel({ ...p, genuineCohabitationMonths: 12 }, recent), 'NZ-P1-3')
        .status,
    ).toBe('MET');
    expect(
      check(travel({ ...p, genuineCohabitationMonths: 11 }, recent), 'NZ-P1-3')
        .status,
    ).toBe('NOT_MET');
    const s: Travel = {
      ...p,
      variationBasis: 'secondment',
      employerConfirmsSecondmentAndResidence: true,
    };
    expect(
      check(travel({ ...s, totalSecondmentYears: 8 }, recent), 'NZ-P1-3')
        .status,
    ).toBe('MET');
    expect(
      check(travel({ ...s, totalSecondmentYears: 8.01 }, recent), 'NZ-P1-3')
        .status,
    ).toBe('NOT_MET');
    expect(
      check(travel({ ...p, variationBasis: 'aip' }, recent), 'NZ-P1-3')
        .pendingDetails,
    ).toEqual(['PD-221']);
  });
  it('requires valid recovery grounds at expiry, within the strict PRV window, plus former-holder review', () => {
    const t: Travel = {
      action: 'subsequent',
      variationBasis: 'ordinary',
      restrictedEntry: false,
      atExpiry: { eligibleForPrv: true, variation: 'none' },
    };
    const pr: Prv = {
      ...prvReady,
      expiredOn: '2024-11-24',
      formerResidentIssue: 'none',
    };
    expect(travel(t, {}, pr).status).toBe('MET');
    expect(
      check(
        travel(
          t,
          {},
          { ...pr, furtherPoliceEvidence: 'requested-outstanding' },
        ),
        'NZ-RV-POLICE',
      ).status,
    ).toBe('NOT_MET');
    expect(
      check(travel(t, {}, { ...pr, expiredOn: '2024-11-23' }), 'NZ-P1-4')
        .status,
    ).toBe('NOT_MET');
    expect(
      check(
        travel(t, {}, { ...pr, formerResidentIssue: 'false-identity' }),
        'NZ-RV-FORMER',
      ).status,
    ).toBe('NOT_MET');
    expect(
      check(
        travel(t, {}, { ...pr, formerResidentIssue: 'other-adverse' }),
        'NZ-RV-FORMER',
      ).status,
    ).toBe('UNKNOWN');
    expect(travel({ ...t, firstResidentEntry: null }, {}, pr).status).toBe(
      'NOT_MET',
    );
  });
});

describe('permanent residence', () => {
  it('returns the existing standard projection only when all other eligibility is established', () => {
    expect(prv({}).status).toBe('MET');
    expect(
      check(
        pathway('NZ-PRV', { prv: prvReady, travel: { restrictedEntry: true } }),
        'NZ-P2-5',
      ).status,
    ).toBe('NOT_MET');
    expect(
      check(
        prv({ furtherPoliceEvidence: 'requested-outstanding' }),
        'NZ-RV-POLICE',
      ).status,
    ).toBe('NOT_MET');
    const req = {
      simulationDate: '2024-02-28',
      residentVisa: { granted: '2022-03-01', category: 'general' as const },
    };
    const before = prv({}, req);
    expect(check(before, 'NZ-P2-1').status).toBe('NOT_MET');
    expect(before.status).toBe('FUTURE');
    expect(before.earliestDate).toBe('2024-02-29');
    expect(check(prv({ conditions: 'breached' }, req), 'NZ-P2-4').status).toBe(
      'NOT_MET',
    );
    expect(prv({ conditions: 'breached' }, req).earliestDate).toBeUndefined();
    expect(
      check(prv({ deportationLiability: 'suspended' }), 'NZ-P2-5').status,
    ).toBe('NOT_MET');
    expect(check(prv({}), 'NZ-P2-7').status).toBe('UNKNOWN');
  });
  it('reuses the 183/184-day leap-year boundary and the projected day in the legacy output', () => {
    const record: NzRequest = {
      simulationDate: '2024-05-19',
      dateOfBirth: '1990-01-01',
      firstArrival: '2020-01-10',
      residentVisa: { granted: '2022-05-19', category: 'general' },
      trips: [{ departed: '2023-05-19', returned: '2023-11-18' }],
      locale: 'en',
    };
    for (const simulationDate of ['2024-05-19', '2024-05-20']) {
      const request = { ...record, simulationDate };
      const old = evaluateNewZealand(request).pathways.find(
        (p) => p.id === 'NZ-PRV',
      )!;
      const full = prv({}, request);
      expect(full.status).toBe(old.status);
      expect(full.earliestDate).toBe('2024-05-20');
      expect(full.earliestDate).toBe(old.earliestDate);
      const raw = old.checks.filter((c) =>
        c.sources.some((s) => s.locator === 'RV2.5.1'),
      );
      for (const row of raw)
        expect(check(full, 'NZ-P2-2').explanation).toContain(row.text);
    }
  });

  it('uses 90 days for ordinary visas and three calendar months for RV2.10', () => {
    const pr = { formerResidentIssue: 'none' as const };
    expect(
      check(prv({ ...pr, expiredOn: '2026-08-25' }), 'NZ-P2-1').status,
    ).toBe('MET');
    expect(
      check(prv({ ...pr, expiredOn: '2026-08-24' }), 'NZ-P2-1').status,
    ).toBe('NOT_MET');
    expect(
      check(
        prv({ ...pr, category: 'parent-retirement', expiredOn: '2026-08-23' }),
        'NZ-P2-3',
      ).status,
    ).toBe('MET');
    expect(
      check(
        prv({ ...pr, category: 'parent-retirement', expiredOn: '2026-08-22' }),
        'NZ-P2-3',
      ).status,
    ).toBe('NOT_MET');
  });
  // 41 days immediately before each end of the two 365-day windows. Travel dates count.
  const limited: Partial<NzFullRequest> = {
    travelConditionsEnd: '2030-01-01',
    trips: [
      { departed: '2024-11-22', returned: '2025-10-13' },
      { departed: '2025-11-22', returned: '2026-10-13' },
    ],
  };
  it('distinguishes 41 days and IRD confirmation or a DTA determination from 184 days', () => {
    const pr: Prv = {
      otherCommitments: ['tax'],
      taxResidenceConfirmedForWholePeriod: true,
      treatyResidentElsewhere: false,
    };
    expect(check(prv(pr, limited), 'NZ-P2-2').status).toBe('MET');
    expect(
      check(prv({ ...pr, treatyResidentElsewhere: true }, limited), 'NZ-P2-2')
        .status,
    ).toBe('NOT_MET');
    expect(
      check(
        prv({ ...pr, taxResidenceConfirmedForWholePeriod: undefined }, limited),
        'NZ-P2-2',
      ).status,
    ).toBe('UNKNOWN');
    expect(
      check(prv({ ...pr, otherCommitments: [] }, limited), 'NZ-P2-2').status,
    ).toBe('NOT_MET');
  });
  it('allows investment, certified business or an established base to independently satisfy commitment', () => {
    const invest: Prv = {
      otherCommitments: ['investment'],
      qualifyingNzInvestmentNzd: 1_000_000,
      investmentMonthsAfterGrant: 24,
    };
    const business: Prv = {
      otherCommitments: ['business'],
      businessFoundedOrPurchased: false,
      businessSharePercent: 25,
      successfulBusinessMonthsImmediatelyBeforeApplication: 12,
      goingConcernAccountsCertified: true,
    };
    const home: Prv = {
      otherCommitments: ['base'],
      includedFamilyDaysInTwoYears: [184, 200],
      stillOwnAndOccupyFamilyHome: false,
      qualifyingEmploymentMonthsInTwoYears: 9,
    };
    for (const v of [invest, business, home])
      expect(prv(v, limited).status).toBe('MET');
    for (const v of [
      { ...invest, qualifyingNzInvestmentNzd: 999_999 },
      { ...invest, investmentMonthsAfterGrant: 23 },
      { ...business, businessSharePercent: 24.99 },
      { ...home, includedFamilyDaysInTwoYears: [183, 200] },
      { ...home, qualifyingEmploymentMonthsInTwoYears: 8 },
    ])
      expect(check(prv(v, limited), 'NZ-P2-2').status).toBe('NOT_MET');
  });
  it('linked partners do not need their own 730 days, while uncertain independent evidence needs review', () => {
    const req = {
      nonPrincipal: true,
      residentVisa: { granted: '2026-11-22', category: 'general' as const },
    };
    expect(prv({ role: 'linked', principalHoldsPrv: true }, req).status).toBe(
      'MET',
    );
    expect(prv({ role: 'linked', principalHoldsPrv: false }, req).status).toBe(
      'NOT_MET',
    );
    expect(
      check(prv({ role: 'independent-review' }, req), 'NZ-P2-6').status,
    ).toBe('UNKNOWN');
    expect(check(prv({ role: 'independent' }, req), 'NZ-P2-1').status).toBe(
      'NOT_MET',
    );
  });
});

describe('citizenship by grant', () => {
  it('meets all ordinary conditions; outstanding s49 blocks despite sufficient presence', () => {
    expect(citizen({}).status).toBe('MET');
    const blocked = citizen({}, {}, { conditions: 'outstanding' });
    expect(check(blocked, 'NZ-P3-1-STATUS').status).toBe('NOT_MET');
    expect(check(blocked, 'NZ-P3-1-PRESENCE').status).toBe('MET');
    expect(blocked.earliestDate).toBeUndefined();
    expect(check(citizen({}), 'NZ-P3-7-FEE').explanation).toContain('641');
    expect(
      check(citizen({}, { simulationDate: '2025-11-23' }), 'NZ-P3-7-FEE')
        .status,
    ).toBe('UNKNOWN');
    expectOutcome(
      citizen({ identityDocumentsAndWitness: false }),
      'NZ-P3-7-IDENTITY',
      'NOT_MET',
    );
    expectOutcome(
      citizen({ identityDocumentsAndWitness: undefined }),
      'NZ-P3-7-IDENTITY',
      'UNKNOWN',
    );
    expect(check(citizen({ oath: 'unwilling' }), 'NZ-P3-7-OATH').status).toBe(
      'NOT_MET',
    );
  });
  it('distinguishes the child cohorts at approval and a parent becoming a citizen', () => {
    const req = {
      dateOfBirth: '2012-11-24',
      residentVisa: { granted: '2026-11-22', category: 'general' as const },
    };
    const child: Citizen = {
      ageAtDecision: 13,
      parentCitizenOrAboutToBe: true,
      english: 'insufficient',
      understandsResponsibilities: false,
      character: 'protection-order',
      oath: 'unwilling',
    };
    expect(citizen(child, req).status).toBe('MET');
    const adolescent = citizen({ ...child, ageAtDecision: 14 }, req);
    for (const id of ['NZ-P3-3', 'NZ-P3-4', 'NZ-P3-5', 'NZ-P3-7-OATH'])
      expect(check(adolescent, id).status).toBe('NOT_MET');
    expect(check(adolescent, 'NZ-P3-1-PRESENCE').status).toBe('MET');
    expect(
      check(citizen({ ...child, ageAtDecision: undefined }, req), 'NZ-P3-2')
        .status,
    ).toBe('UNKNOWN');
    expectOutcome(citizen({ fullCapacity: false }), 'NZ-P3-2', 'NOT_MET');
    expectOutcome(
      citizen({ fullCapacity: false, capacityException: 'referred' }),
      'NZ-P3-2',
      'UNKNOWN',
    );
    expectOutcome(
      citizen({ fullCapacity: false, capacityException: 'granted' }),
      'NZ-P3-2',
      'MET',
    );
  });
  it('enforces the exceptional day floor and reserves discretion for DIA', () => {
    const req = {
      residentVisa: { granted: '2026-01-01', category: 'general' as const },
    };
    const c: Citizen = {
      presenceException: 'exceptional',
      parentCitizenOrAboutToBe: false,
    };
    expect(
      check(
        citizen({ ...c, exceptionalResidentDaysInWindow: 449 }, req),
        'NZ-P3-1-PRESENCE',
      ).status,
    ).toBe('NOT_MET');
    expect(
      check(
        citizen({ ...c, exceptionalResidentDaysInWindow: 450 }, req),
        'NZ-P3-1-PRESENCE',
      ).status,
    ).toBe('UNKNOWN');
    expect(
      check(
        citizen(
          {
            ...c,
            exceptionalResidentDaysInWindow: 450,
            specialPresenceAcceptedByDia: true,
          },
          req,
        ),
        'NZ-P3-1-PRESENCE',
      ).status,
    ).toBe('MET');
  });
  it('separates criminal bars from post-window character review and foreign police evidence', () => {
    const status = (c: Citizen) => check(citizen(c), 'NZ-P3-3').status;
    expect(status({ longestPrisonYears: 5 })).toBe('NOT_MET');
    expect(status({ lastShortSentenceOrParoleOn: '2019-11-24' })).toBe(
      'NOT_MET',
    );
    expect(status({ lastShortSentenceOrParoleOn: '2019-11-23' })).toBe(
      'UNKNOWN',
    );
    expect(status({ lastNonCustodialConvictionOn: '2023-11-24' })).toBe(
      'NOT_MET',
    );
    expect(status({ lastNonCustodialConvictionOn: '2023-11-23' })).toBe(
      'UNKNOWN',
    );
    expect(status({ demeritPoints: 99 })).toBe('MET');
    expect(status({ demeritPoints: 100 })).toBe('UNKNOWN');
    const c = { foreignPoliceEvidence: undefined, overseasMonthsLong: 12 };
    expect(
      check(citizen({ ...c, overseasMonthsRecent: 4 }), 'NZ-P3-3-POLICE')
        .status,
    ).toBe('MET');
    expect(
      check(citizen({ ...c, overseasMonthsRecent: 5 }), 'NZ-P3-3-POLICE')
        .status,
    ).toBe('UNKNOWN');
  });
  it('holds the announced future test open; all other required checks still run', () => {
    const req = { simulationDate: '2027-12-01' };
    const pending = citizen({ ageAtDecision: 64 }, req);
    expect(check(pending, 'NZ-P3-4').pendingDetails).toEqual(['PD-224']);
    expect(pending.status).toBe('UNKNOWN');
    expect(citizen({ ageAtDecision: 65 }, req).status).toBe('UNKNOWN');
    expect(citizen({ ageAtDecision: 66 }, req).status).toBe('MET');
    expect(
      check(citizen({ english: 'waiver-requested' }), 'NZ-P3-5').status,
    ).toBe('UNKNOWN');
    expect(
      check(citizen({ residenceIntent: 'emigrate' }), 'NZ-P3-6').status,
    ).toBe('NOT_MET');
    const en = citizen({}, { locale: 'en' });
    expect(en.checks.map((c) => c.id)).toEqual(
      citizen({}).checks.map((c) => c.id),
    );
    expect(
      en.checks.every((c) => c.sources.every((s) => s.locator.length > 0)),
    ).toBe(true);
  });
});
