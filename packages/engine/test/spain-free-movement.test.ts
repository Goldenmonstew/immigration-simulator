import { describe, expect, test } from 'vitest';
import { freeMovementPath } from '../src/spain-free-movement';
import type { EsFreeMovementFacts } from '../src/spain-free-movement';
import { evaluateSpainFull } from '../src/spain-full';
import type { EsFullRequest } from '../src/spain-full';

const request: EsFullRequest = {
  simulationDate: '2026-11-23',
  route: 'general',
  permits: [],
  trips: [],
};
const worker: EsFreeMovementFacts = {
  person: 'eu-eea-swiss',
  residenceFrom: '2021-11-23',
  noExecutedExpulsion: true,
  history: [{ from: '2021-11-23', basis: 'employment', documented: true }],
  noOfficialRestriction: true,
};
const family: EsFreeMovementFacts = {
  person: 'third-country-family',
  sponsor: 'eu-eea-swiss',
  accompanyingOrJoining: true,
  relationship: 'spouse',
  relationshipDocumented: true,
  jointResidenceFrom: '2021-11-23',
};
function assess(
  facts: EsFreeMovementFacts = {},
  req: Partial<EsFullRequest> = {},
) {
  return freeMovementPath({
    ...request,
    ...req,
    freeMovement: { ...worker, ...facts },
  });
}
function row(
  id: string,
  facts: EsFreeMovementFacts,
  req: Partial<EsFullRequest> = {},
) {
  const result = assess(facts, req);
  const check = result.checks.find((c) => c.id === 'ES-' + id);
  if (!check) throw new Error('Missing check ES-' + id);
  return check;
}

describe('permanent residence under EU free movement', () => {
  const fullPath = (
    facts: EsFreeMovementFacts,
    simulationDate = request.simulationDate,
  ) =>
    evaluateSpainFull({
      ...request,
      simulationDate,
      targets: ['U'],
      freeMovement: { ...worker, ...facts },
    }).columns[0].pathways[0];

  function outcome(facts: EsFreeMovementFacts, simulationDate: string) {
    const { status, pathwayCompletionDate, earliestDate } = fullPath(
      facts,
      simulationDate,
    );
    return [status, pathwayCompletionDate, earliestDate];
  }

  function expectDatedAcquisition(
    facts: EsFreeMovementFacts,
    eventDate: string,
    eventStatus: 'MET' | 'UNKNOWN' | 'NOT_MET',
  ) {
    const date = eventStatus === 'MET' ? eventDate : undefined;
    expect(outcome(facts, request.simulationDate)).toEqual([
      eventStatus === 'MET' ? 'FUTURE' : eventStatus,
      date,
      date,
    ]);
    expect(outcome(facts, eventDate)).toEqual([eventStatus, date, date]);
  }

  test.each<[string, EsFreeMovementFacts, string]>([
    [
      'continuous employment',
      {
        residenceFrom: '2022-01-01',
        history: [
          { from: '2022-01-01', basis: 'employment', documented: true },
        ],
      },
      '2027-01-01',
    ],
    [
      'a fresh period after a disqualifying ordinary absence',
      {
        trips: [
          {
            departed: '2022-01-01',
            returned: '2022-08-01',
            reason: 'ordinary',
          },
        ],
      },
      '2027-08-01',
    ],
    [
      'joint residence starting after the worker’s arrival',
      { ...family, jointResidenceFrom: '2021-12-10' },
      '2026-12-10',
    ],
    [
      'reacquisition after losing an earlier right',
      {
        acquiredOn: '2014-01-01',
        trips: [
          {
            departed: '2019-01-01',
            returned: '2022-02-01',
            reason: 'ordinary',
          },
        ],
      },
      '2027-02-01',
    ],
    [
      'a dated early retirement before five years',
      {
        earlyBasis: 'retirement',
        employmentFrom: '2023-01-01',
        residenceFrom: '2023-01-01',
        workStopped: '2026-12-01',
        earlyEmployeeRetirement: true,
        qualifiedWorker: true,
      },
      '2026-12-01',
    ],
  ])(
    'projects %s and verifies eligibility on the completion date',
    (_, facts, date) => {
      const result = fullPath(facts);
      expect([
        result.status,
        result.pathwayCompletionDate,
        result.earliestDate,
      ]).toEqual(['FUTURE', date, date]);
      expect(fullPath(facts, date).status).toBe('MET');
    },
  );

  test('a descendant aging out before the joint residence anniversary has no filing date', () => {
    const facts: EsFreeMovementFacts = {
      ...family,
      jointResidenceFrom: '2022-01-01',
      relationship: 'descendant',
      birthDate: '2005-12-20',
      studentSponsor: false,
      dependent: false,
      incapacitated: false,
    };
    const result = fullPath(facts);
    expect(result.pathwayCompletionDate).toBe('2027-01-01');
    expect(result.status).toBe('NOT_MET');
    expect(result.earliestDate).toBeUndefined();
    expect(fullPath(facts, '2027-01-01').status).toBe('NOT_MET');
  });

  test('a dated family retention event can follow the ordinary residence anniversary', () => {
    const facts: EsFreeMovementFacts = {
      ...family,
      retainedEvent: 'divorce',
      residenceFrom: '2022-01-01',
      eventDate: '2027-02-01',
      eventReported: true,
      priorFamilyResidenceFrom: '2023-01-01',
      custodyOrAccessInSpain: true,
    };
    const result = fullPath(facts);
    expect([
      result.status,
      result.pathwayCompletionDate,
      result.earliestDate,
    ]).toEqual(['FUTURE', '2027-01-01', '2027-02-01']);
    expect(fullPath(facts, '2027-02-01').status).toBe('MET');
  });

  test('a possible earlier acquisition or an incomplete employment period cannot establish an earliest day', () => {
    const history: NonNullable<EsFreeMovementFacts['history']> = [
      { from: '2022-01-01', basis: 'employment', documented: true },
    ];
    const pending = fullPath({ history, earlyBasis: 'worker-family' });
    expect(pending.status).toBe('UNKNOWN');
    expect(pending.pathwayCompletionDate).toBe('2027-01-01');
    expect(pending.earliestDate).toBeUndefined();
    const expired = fullPath({
      history: [{ ...history[0], to: '2026-12-30' }],
    });
    expect(expired.status).toBe('NOT_MET');
    expect(expired.pathwayCompletionDate).toBeUndefined();
    expect(expired.earliestDate).toBeUndefined();
  });

  test('five completed years establish permanent residence before retirement without a certificate', () => {
    const retired: EsFreeMovementFacts = {
      residenceFrom: '2017-01-01',
      history: [
        {
          from: '2017-01-01',
          to: '2021-12-31',
          basis: 'employment',
          documented: true,
        },
        { from: '2022-01-01', basis: 'other', documented: true },
      ],
    };
    for (const returned of ['2025-01-01', '2025-01-02']) {
      const kept = returned === '2025-01-01';
      const p = fullPath({
        ...retired,
        trips: [{ departed: '2023-01-01', returned }],
      });
      expect(p.checks.find((c) => c.id === 'ES-U05')?.status).toBe('MET');
      expect(p.checks.find((c) => c.id === 'ES-U04-retention')?.status).toBe(
        kept ? 'MET' : 'NOT_MET',
      );
      expect(p.status).toBe(kept ? 'MET' : 'NOT_MET');
      expect(p.pathwayCompletionDate).toBe(kept ? '2022-01-01' : undefined);
      expect(p.earliestDate).toBe(kept ? request.simulationDate : undefined);
    }
    const p = fullPath(retired);
    expect(p.checks.find((c) => c.id === 'ES-U05')?.status).toBe('MET');
    expect(p.status).toBe('MET');
    expect(p.pathwayCompletionDate).toBe('2022-01-01');
    expect(p.earliestDate).toBe(request.simulationDate);
  });

  test('retained residence uses the start of divorce proceedings for the marriage and Spanish residence periods', () => {
    const divorced: EsFreeMovementFacts = {
      ...family,
      retainedEvent: 'divorce',
      relationshipFrom: '2021-11-23',
      priorFamilyResidenceFrom: '2021-11-23',
      eventDate: '2025-02-01',
      eventReported: true,
      custodyOrAccessInSpain: false,
      exceptionalHardshipProved: false,
      history: [
        {
          from: '2021-11-23',
          to: '2025-01-31',
          basis: 'qualifying-family',
          documented: true,
        },
        { from: '2025-02-01', basis: 'employment', documented: true },
      ],
    };
    for (const [divorceProceedingsStartedOn, expected] of [
      ['2024-10-10', 'NOT_MET'],
      ['2024-11-23', 'MET'],
      [undefined, 'UNKNOWN'],
    ] as const) {
      const p = fullPath({ ...divorced, divorceProceedingsStartedOn });
      expect(p.checks.find((c) => c.id === 'ES-U06')?.status).toBe(expected);
      expect(p.status).toBe(expected);
      expect(p.earliestDate).toBe(
        expected === 'MET' ? request.simulationDate : undefined,
      );
      expect(p.pathwayCompletionDate).toBe(
        expected === 'MET' ? request.simulationDate : undefined,
      );
    }
  });

  test('early retirement establishes the day from which permanent residence can be lost', () => {
    const retired: EsFreeMovementFacts = {
      earlyBasis: 'retirement',
      residenceFrom: '2021-01-01',
      employmentFrom: '2021-01-01',
      workStopped: '2024-01-02',
      qualifiedWorker: true,
      earlyEmployeeRetirement: true,
      history: [],
    };
    for (const returned of ['2026-03-01', '2026-02-01']) {
      const kept = returned === '2026-02-01';
      const facts = {
        ...retired,
        trips: [
          { departed: '2024-02-01', returned, reason: 'ordinary' as const },
        ],
      };
      const inferred = fullPath(facts);
      const documented = fullPath({ ...facts, acquiredOn: '2024-01-02' });
      expect(inferred.checks.find((c) => c.id === 'ES-U07')?.status).toBe(
        'MET',
      );
      expect(inferred.status).toBe(kept ? 'MET' : 'NOT_MET');
      expect(
        inferred.checks.find((c) => c.id === 'ES-U04-retention')?.status,
      ).toBe(inferred.status);
      expect(inferred.pathwayCompletionDate).toBe(
        kept ? '2024-01-02' : undefined,
      );
      expect(inferred.earliestDate).toBe(
        kept ? request.simulationDate : undefined,
      );
      expect(documented.status).toBe(inferred.status);
    }
    const regained = fullPath({
      ...retired,
      acquiredOn: '2014-01-01',
      trips: [
        { departed: '2016-01-01', returned: '2021-01-01', reason: 'ordinary' },
      ],
    });
    expect(regained.status).toBe('MET');
    expect(regained.pathwayCompletionDate).toBe('2024-01-02');
  });

  test('retirement cannot use residence before a disqualifying absence', () => {
    const retirement: EsFreeMovementFacts = {
      earlyBasis: 'retirement',
      residenceFrom: '2023-01-01',
      employmentFrom: '2024-10-01',
      workStopped: '2026-12-01',
      qualifiedWorker: true,
      pensionEligibilityDecided: true,
      spanishSpouseExemption: false,
      history: [
        {
          from: '2023-01-01',
          to: '2024-09-30',
          basis: 'qualifying-family',
          documented: true,
        },
        {
          from: '2024-10-01',
          to: '2026-12-01',
          basis: 'employment',
          documented: true,
        },
      ],
      trips: [
        { departed: '2024-03-01', returned: '2024-10-01', reason: 'ordinary' },
      ],
    };
    for (const day of [request.simulationDate, '2026-12-01']) {
      const p = fullPath(retirement, day);
      expect(p.checks.find((c) => c.id === 'ES-U07')?.status).toBe('NOT_MET');
      expect(p.status).toBe('NOT_MET');
      expect(p.pathwayCompletionDate).toBeUndefined();
      expect(p.earliestDate).toBeUndefined();
    }
    for (const [workStopped, expected] of [
      ['2027-10-01', 'NOT_MET'],
      ['2027-10-02', 'MET'],
    ] as const) {
      const p = fullPath(
        { ...retirement, workStopped, history: [] },
        workStopped,
      );
      expect(p.checks.find((c) => c.id === 'ES-U07')?.status).toBe(expected);
    }
    const returnsAcrossAnniversary = fullPath({
      ...retirement,
      trips: [
        { departed: '2023-09-01', returned: '2024-05-01', reason: 'ordinary' },
      ],
    });
    expect(returnsAcrossAnniversary.status).toBe('FUTURE');
    expect(returnsAcrossAnniversary.earliestDate).toBe('2026-12-01');
    const pendingReason = fullPath(
      {
        ...retirement,
        trips: [
          {
            departed: '2024-03-01',
            returned: '2024-10-01',
            reason: 'unconfirmed',
          },
        ],
      },
      '2026-12-01',
    );
    expect(pendingReason.checks.find((c) => c.id === 'ES-U07')?.status).toBe(
      'UNKNOWN',
    );
    expect(pendingReason.earliestDate).toBeUndefined();
    const restartedYears = fullPath(
      {
        ...retirement,
        residenceFrom: '2021-01-01',
        employmentFrom: '2025-06-01',
        history: [
          { from: '2021-01-01', basis: 'employment', documented: true },
        ],
        trips: [
          {
            departed: '2021-02-01',
            returned: '2021-10-01',
            reason: 'ordinary',
          },
          {
            departed: '2024-11-01',
            returned: '2025-06-01',
            reason: 'ordinary',
          },
        ],
      },
      '2026-12-01',
    );
    expect(restartedYears.checks.find((c) => c.id === 'ES-U07')?.status).toBe(
      'NOT_MET',
    );
    const confirmedExcess = fullPath(
      {
        ...retirement,
        trips: [
          {
            departed: '2024-01-10',
            returned: '2024-05-15',
            reason: 'ordinary',
          },
          {
            departed: '2024-06-01',
            returned: '2024-09-01',
            reason: 'ordinary',
          },
          {
            departed: '2025-01-01',
            returned: '2025-02-01',
            reason: 'unconfirmed',
          },
        ],
      },
      '2026-12-01',
    );
    expect(confirmedExcess.checks.find((c) => c.id === 'ES-U07')?.status).toBe(
      'NOT_MET',
    );
  });

  test('family acquiring with a worker needs the acquisition date to place a long absence', () => {
    const trip = { departed: '2024-02-01', returned: '2026-03-01' };
    const facts: EsFreeMovementFacts = {
      ...family,
      earlyBasis: 'worker-family',
      coResidentWithWorker: true,
      workerAcquiredEarly: true,
      history: [],
      trips: [trip],
    };
    expect(fullPath(facts).status).toBe('UNKNOWN');
    expect(
      fullPath({ ...facts, longestPostAcquisitionAbsence: trip }).status,
    ).toBe('NOT_MET');
  });

  test('a co-resident family member derives early acquisition from the worker’s established right', () => {
    for (const [workerAcquiredEarly, status] of [
      [true, 'MET'],
      [false, 'NOT_MET'],
      [undefined, 'UNKNOWN'],
    ] as const) {
      const facts: EsFreeMovementFacts = {
        ...family,
        residenceFrom: '2026-11-01',
        jointResidenceFrom: '2026-11-01',
        history: undefined,
        trips: [],
        earlyBasis: 'worker-family',
        coResidentWithWorker: true,
        workerAcquiredEarly,
      };
      for (const day of [request.simulationDate, '2026-12-01']) {
        expect(outcome(facts, day)).toEqual([
          status,
          undefined,
          status === 'MET' ? day : undefined,
        ]);
      }
    }
  });

  test.each(['retirement', 'incapacity'] as const)(
    '%s distinguishes an unanswered pre-employment basis from a break or documented family residence',
    (earlyBasis) => {
      const residenceFrom = '2023-01-01';
      const employmentFrom = '2025-06-01';
      const workStopped = '2026-12-01';
      const facts: EsFreeMovementFacts = {
        earlyBasis,
        residenceFrom,
        employmentFrom,
        workStopped,
        qualifiedWorker: true,
        pensionEligibilityDecided: true,
        permanentIncapacity: true,
        occupationalSpanishBenefit: false,
        spanishSpouseExemption: false,
        history: undefined,
      };
      const employment = {
        from: employmentFrom,
        basis: 'employment' as const,
        documented: true,
      };
      for (const [basis, status] of [
        [undefined, 'UNKNOWN'],
        ['other', 'NOT_MET'],
        ['qualifying-family', 'MET'],
      ] as const) {
        const history = basis && [
          { from: residenceFrom, to: '2025-05-31', basis, documented: true },
          employment,
        ];
        expectDatedAcquisition({ ...facts, history }, workStopped, status);
      }
      // A confirmed worker can qualify on the employment period alone.
      expectDatedAcquisition(
        { ...facts, employmentFrom: residenceFrom },
        workStopped,
        'MET',
      );
      // A confirmed return can rule out even the earliest possible start.
      const interrupted = {
        ...facts,
        trips: [
          {
            departed: '2024-01-01',
            returned: '2025-01-02',
            reason: 'ordinary' as const,
          },
        ],
      };
      expectDatedAcquisition(interrupted, workStopped, 'NOT_MET');
      expectDatedAcquisition(
        { ...facts, spanishSpouseExemption: true },
        workStopped,
        'MET',
      );
      if (earlyBasis === 'incapacity')
        expectDatedAcquisition(
          { ...facts, occupationalSpanishBenefit: true },
          workStopped,
          'MET',
        );
    },
  );

  test.each(['retirement', 'incapacity'] as const)(
    '%s cannot project acquisition across the recorded interruption',
    (earlyBasis) => {
      const retirement = earlyBasis === 'retirement';
      const facts: EsFreeMovementFacts = {
        earlyBasis,
        residenceFrom: '2023-01-01',
        employmentFrom: retirement ? '2025-06-01' : '2025-10-01',
        workStopped: '2026-12-01',
        qualifiedWorker: true,
        pensionEligibilityDecided: true,
        permanentIncapacity: true,
        occupationalSpanishBenefit: false,
        spanishSpouseExemption: false,
        history: retirement
          ? [
              {
                from: '2023-01-01',
                to: '2023-12-31',
                basis: 'employment',
                documented: true,
              },
              {
                from: '2024-01-01',
                to: '2025-05-31',
                basis: 'other',
                documented: true,
              },
              { from: '2025-06-01', basis: 'employment', documented: true },
            ]
          : [{ from: '2023-01-01', basis: 'employment', documented: true }],
        trips: retirement
          ? []
          : [
              {
                departed: '2025-03-01',
                returned: '2025-10-01',
                reason: 'ordinary',
              },
            ],
      };
      for (const day of [request.simulationDate, '2026-12-01']) {
        const p = fullPath(facts, day);
        expect([p.status, p.pathwayCompletionDate, p.earliestDate]).toEqual([
          'NOT_MET',
          undefined,
          undefined,
        ]);
        expect(
          p.checks.find((c) => c.id === (retirement ? 'ES-U07' : 'ES-U08'))
            ?.status,
        ).toBe('NOT_MET');
      }
      const anniversary = retirement ? '2028-06-01' : '2027-10-01';
      const next = retirement ? '2028-06-02' : '2027-10-02';
      for (const [workStopped, expected] of [
        [anniversary, 'NOT_MET'],
        [next, 'MET'],
      ] as const) {
        const p = fullPath({ ...facts, workStopped }, workStopped);
        expect(p.status).toBe(expected);
        expect(p.pathwayCompletionDate).toBe(
          expected === 'MET' ? workStopped : undefined,
        );
        expect(p.earliestDate).toBe(p.pathwayCompletionDate);
      }
    },
  );

  test('cross-border work requires its own employment duration and a confirmed move to foreign work', () => {
    const workStopped = '2026-12-01';
    for (const [employmentFrom, on] of [
      ['2023-12-01', 'MET'],
      ['2025-06-01', 'NOT_MET'],
      [undefined, 'UNKNOWN'],
    ] as const) {
      const facts: EsFreeMovementFacts = {
        earlyBasis: 'cross-border',
        residenceFrom: '2023-01-01',
        history: undefined,
        qualifiedWorker: true,
        employmentFrom,
        workStopped,
        workingInAnotherMemberState: true,
        retainedSpanishHome: true,
        returnsAtLeastWeekly: true,
      };
      // The last day of Spanish work does not date the start of foreign work.
      expect(outcome(facts, request.simulationDate)).toEqual([
        'NOT_MET',
        undefined,
        undefined,
      ]);
      expect(outcome(facts, workStopped)).toEqual([
        on,
        undefined,
        on === 'MET' ? workStopped : undefined,
      ]);
    }
  });

  test('cross-border work counts from the last lawful return and requires work throughout the period', () => {
    const facts: EsFreeMovementFacts = {
      earlyBasis: 'cross-border',
      residenceFrom: '2020-01-01',
      employmentFrom: '2022-07-01',
      qualifiedWorker: true,
      workingInAnotherMemberState: true,
      retainedSpanishHome: true,
      returnsAtLeastWeekly: true,
      history: [
        {
          from: '2022-07-01',
          to: '2028-03-15',
          basis: 'employment',
          documented: true,
        },
        {
          from: '2021-01-01',
          to: '2022-06-30',
          basis: 'other',
          documented: true,
        },
        {
          from: '2020-01-01',
          to: '2020-12-31',
          basis: 'employment',
          documented: true,
        },
      ],
      // This trip crosses January, but lies within one year of the July restart.
      trips: [
        { departed: '2024-08-15', returned: '2025-03-15', reason: 'ordinary' },
      ],
    };
    for (const [workStopped, expected] of [
      ['2028-03-14', 'NOT_MET'],
      ['2028-03-15', 'MET'],
    ] as const) {
      const p = fullPath({ ...facts, workStopped }, workStopped);
      expect(p.checks.find((c) => c.id === 'ES-U09')?.status).toBe(expected);
      expect(p.earliestDate).toBe(expected === 'MET' ? workStopped : undefined);
    }
    const workStopped = '2026-12-01';
    const priorWork = {
      from: '2023-01-01',
      to: '2024-11-30',
      basis: 'employment' as const,
      documented: true,
    };
    const resumed = {
      from: '2024-12-02',
      to: workStopped,
      basis: 'employment' as const,
      documented: true,
    };
    for (const [basis, expected] of [
      ['temporary-incapacity', 'MET'],
      ['qualifying-family', 'NOT_MET'],
    ] as const) {
      const p = fullPath(
        {
          ...facts,
          trips: [],
          workStopped,
          history: [
            resumed,
            { from: '2024-12-01', to: '2024-12-01', basis, documented: true },
            priorWork,
          ],
        },
        workStopped,
      );
      expect(p.checks.find((c) => c.id === 'ES-U09')?.status).toBe(expected);
    }
  });

  test('death in service uses the worker’s own residence, travel and inclusive anniversary', () => {
    const facts: EsFreeMovementFacts = {
      ...family,
      earlyBasis: 'death-at-work',
      coResidentWithWorker: true,
      diedDuringWorkBeforePermanent: true,
      workerResidenceFrom: '2021-01-01',
      occupationalDeath: false,
      spouseLostSpanishNationalityThroughMarriage: false,
      history: [],
      trips: [],
      workerResidenceEvidence: {
        history: [
          {
            from: '2021-01-01',
            to: '2023-12-31',
            basis: 'other',
            documented: true,
          },
          { from: '2024-01-01', basis: 'employment', documented: true },
        ],
        trips: [
          {
            departed: '2025-03-01',
            returned: '2025-10-01',
            reason: 'ordinary',
          },
        ],
        noExecutedExpulsion: true,
      },
    };
    for (const [eventDate, expected] of [
      ['2026-12-01', 'NOT_MET'],
      ['2027-10-01', 'MET'],
    ] as const) {
      expectDatedAcquisition({ ...facts, eventDate }, eventDate, expected);
    }
    const eventDate = '2026-12-01';
    const missingWorkerHistory: EsFreeMovementFacts = {
      ...facts,
      eventDate,
      residenceFrom: '2025-01-01',
      history: [
        {
          from: '2025-01-01',
          to: eventDate,
          basis: 'qualifying-family',
          documented: true,
        },
      ],
      workerResidenceEvidence: undefined,
    };
    expectDatedAcquisition(missingWorkerHistory, eventDate, 'UNKNOWN');
    for (const ground of [
      { occupationalDeath: true },
      { spouseLostSpanishNationalityThroughMarriage: true },
    ]) {
      expectDatedAcquisition(
        { ...missingWorkerHistory, ...ground },
        eventDate,
        'MET',
      );
    }
  });

  test('an unresolved break can affect the residence year of a later confirmed absence', () => {
    const facts: EsFreeMovementFacts = {
      earlyBasis: 'retirement',
      residenceFrom: '2021-01-01',
      employmentFrom: '2021-01-01',
      workStopped: '2026-12-01',
      qualifiedWorker: true,
      pensionEligibilityDecided: true,
      spanishSpouseExemption: false,
      history: [{ from: '2021-01-01', basis: 'employment', documented: true }],
    };
    for (const [reason, expected] of [
      ['military', 'MET'],
      ['ordinary', 'NOT_MET'],
      ['unconfirmed', 'UNKNOWN'],
    ] as const) {
      const p = fullPath(
        {
          ...facts,
          trips: [
            {
              departed: '2024-11-01',
              returned: '2025-06-01',
              reason: 'ordinary',
            },
            { departed: '2021-02-01', returned: '2021-10-01', reason },
          ],
        },
        '2026-12-01',
      );
      expect(p.checks.find((c) => c.id === 'ES-U07')?.status).toBe(expected);
    }
  });

  test('unresolved or missing residence evidence cannot establish an early acquisition date', () => {
    const workStopped = '2026-12-01';
    const facts: EsFreeMovementFacts = {
      earlyBasis: 'incapacity',
      workStopped,
      residenceFrom: '2023-01-01',
      qualifiedWorker: true,
      permanentIncapacity: true,
      occupationalSpanishBenefit: false,
      spanishSpouseExemption: false,
    };
    const later = {
      from: '2025-06-01',
      basis: 'employment' as const,
      documented: true,
    };
    const earlier = {
      from: '2023-01-01',
      to: '2025-05-31',
      basis: 'resources' as const,
      allRiskInsurance: true,
      documented: true,
    };
    for (const [sufficientMeansAccepted, expected] of [
      [false, 'NOT_MET'],
      [undefined, 'UNKNOWN'],
      [true, 'MET'],
    ] as const) {
      const p = fullPath(
        { ...facts, history: [later, { ...earlier, sufficientMeansAccepted }] },
        workStopped,
      );
      expect(p.checks.find((c) => c.id === 'ES-U08')?.status).toBe(expected);
      expect(p.earliestDate).toBe(expected === 'MET' ? workStopped : undefined);
    }
    const projected = fullPath({ ...facts, history: [later, earlier] });
    expect(projected.status).toBe('UNKNOWN');
    expect(projected.earliestDate).toBeUndefined();
    const missing = fullPath({ ...facts, history: undefined }, workStopped);
    expect(missing.checks.find((c) => c.id === 'ES-U08')?.status).toBe(
      'UNKNOWN',
    );
    expect(missing.earliestDate).toBeUndefined();
    const exempt = fullPath(
      { ...facts, history: [later], spanishSpouseExemption: true },
      workStopped,
    );
    expect(exempt.earliestDate).toBe(workStopped);
  });

  test('a separate lawful basis after cessation can still establish ordinary permanent residence', () => {
    const facts: EsFreeMovementFacts = {
      earlyBasis: 'incapacity',
      qualifiedWorker: true,
      permanentIncapacity: true,
      occupationalSpanishBenefit: false,
      spanishSpouseExemption: false,
      residenceFrom: '2025-06-01',
      workStopped: '2026-12-01',
      history: [
        { from: '2025-06-01', basis: 'employment', documented: true },
        {
          from: '2026-12-02',
          basis: 'resources',
          sufficientMeansAccepted: true,
          allRiskInsurance: true,
          documented: true,
        },
      ],
    };
    for (const day of [request.simulationDate, '2026-12-01', '2030-06-01']) {
      const p = fullPath(facts, day);
      expect(p.checks.find((c) => c.id === 'ES-U08')?.status).toBe('NOT_MET');
      expect(p.status).toBe(day === '2030-06-01' ? 'MET' : 'FUTURE');
      expect(p.earliestDate).toBe('2030-06-01');
    }
  });

  test('a recorded ordinary absence still interrupts incapacity when the U trip list omits it', () => {
    const trip = {
      departed: '2025-03-01',
      returned: '2025-10-01',
      reason: 'ordinary' as const,
    };
    for (const trips of [[], undefined]) {
      const p = evaluateSpainFull({
        ...request,
        targets: ['U'],
        simulationDate: '2026-12-01',
        timeRecordsComplete: false,
        residence: { tripDetails: [trip] },
        freeMovement: {
          ...worker,
          residenceFrom: '2023-01-01',
          history: [
            { from: '2023-01-01', basis: 'employment', documented: true },
          ],
          earlyBasis: 'incapacity',
          workStopped: '2026-12-01',
          permanentIncapacity: true,
          qualifiedWorker: true,
          occupationalSpanishBenefit: false,
          spanishSpouseExemption: false,
          trips,
        },
      }).columns[0].pathways[0];
      expect(p.checks.find((c) => c.id === 'ES-U08')?.status).toBe('NOT_MET');
      expect(p.earliestDate).toBeUndefined();
    }
  });

  test('historical acquisition respects leap-day starts, residence gaps and returns after a loss', () => {
    const facts: EsFreeMovementFacts = {
      residenceFrom: '2015-01-01',
      history: [
        {
          from: '2015-01-01',
          to: '2015-12-31',
          basis: 'employment',
          documented: true,
        },
        { from: '2016-02-29', basis: 'employment', documented: true },
      ],
    };
    const leap = fullPath(facts);
    expect(leap.checks.find((c) => c.id === 'ES-U04')?.status).toBe('MET');
    expect(leap.status).toBe('MET');
    expect(leap.pathwayCompletionDate).toBe('2021-03-01');
    const afterInterruption = fullPath({
      ...facts,
      trips: [
        { departed: '2017-06-01', returned: '2018-06-01', reason: 'ordinary' },
      ],
    });
    expect(afterInterruption.status).toBe('MET');
    expect(afterInterruption.pathwayCompletionDate).toBe('2023-06-01');
    const reacquired = fullPath({
      residenceFrom: '2010-01-01',
      history: [{ from: '2010-01-01', basis: 'employment', documented: true }],
      trips: [
        { departed: '2016-01-01', returned: '2021-04-01', reason: 'ordinary' },
      ],
    });
    expect(
      reacquired.checks.find((c) => c.id === 'ES-U04-retention')?.status,
    ).toBe('MET');
    expect(reacquired.status).toBe('MET');
    expect(reacquired.pathwayCompletionDate).toBe('2026-04-01');
  });

  test('U01 checks the regime and an individual Spanish sponsor’s free movement or transitional basis', () => {
    expect(row('U01', {}).status).toBe('MET');
    expect(row('U01', { person: 'other' }).status).toBe('NOT_MET');
    const spanish: EsFreeMovementFacts = {
      ...family,
      sponsor: 'spanish',
      transitionalEuRegimeConfirmed: false,
    };
    expect(row('U01', spanish).pendingDetails).toContain('PD-297');
    expect(
      row('U01', { ...spanish, spanishFreeMovementConfirmed: false }).status,
    ).toBe('NOT_MET');
    expect(
      row('U01', { ...spanish, spanishFreeMovementConfirmed: true }).status,
    ).toBe('MET');
    expect(
      row('U01', { ...spanish, transitionalEuRegimeConfirmed: true }).status,
    ).toBe('MET');
  });
  test('U02 distinguishes dependency at 21 and the narrower student family circle', () => {
    const child: EsFreeMovementFacts = {
      ...family,
      relationship: 'descendant',
      birthDate: '2005-11-24',
      studentSponsor: false,
      dependent: false,
      incapacitated: false,
    };
    expect(row('U02', child).status).toBe('MET');
    expect(row('U02', { ...child, birthDate: '2005-11-23' }).status).toBe(
      'NOT_MET',
    );
    expect(row('U02', { ...child, studentSponsor: true }).status).toBe(
      'NOT_MET',
    );
    expect(
      row('U02', { ...child, studentSponsor: true, dependent: true }).status,
    ).toBe('MET');
    expect(
      row('U02', {
        ...family,
        relationship: 'ascendant',
        studentSponsor: true,
        dependent: true,
      }).status,
    ).toBe('NOT_MET');
    expect(
      row('U02', {
        ...family,
        relationship: 'ascendant',
        studentSponsor: false,
        dependent: true,
      }).status,
    ).toBe('MET');
  });
  test('U03 tests 24 months in the household, one year for a durable partner, and recognition', () => {
    const extended: EsFreeMovementFacts = {
      ...family,
      relationship: 'extended-relative',
      previouslyCohabitedFrom: '2024-11-23',
      previouslyCohabitedUntil: '2026-11-23',
      personalCareNecessary: false,
      dependent: false,
    };
    expect(row('U03', extended).status).toBe('UNKNOWN');
    expect(
      row('U03', { ...extended, extendedFamilyRecognized: true }).status,
    ).toBe('MET');
    expect(
      row('U03', { ...extended, previouslyCohabitedFrom: '2024-11-24' }).status,
    ).toBe('NOT_MET');
    const partner: EsFreeMovementFacts = {
      ...extended,
      relationship: 'durable-partner',
      previouslyCohabitedFrom: '2025-11-23',
      commonChildAndStableCohabitation: false,
    };
    expect(row('U03', partner).status).toBe('UNKNOWN');
    expect(
      row('U03', { ...partner, previouslyCohabitedFrom: '2025-11-24' }).status,
    ).toBe('NOT_MET');
    expect(
      row('U03', {
        ...partner,
        commonChildAndStableCohabitation: true,
        extendedFamilyRecognized: true,
      }).status,
    ).toBe('MET');
  });
  test('U04 requires five years, distinguishes annual absence and the twelve-month exception', () => {
    expect(assess().status).toBe('MET');
    expect(row('U04', { residenceFrom: '2021-11-24' }).status).toBe('NOT_MET');
    expect(row('U04', { noExecutedExpulsion: false }).status).toBe('NOT_MET');
    expect(
      row('U04', { ...family, jointResidenceFrom: '2021-11-24' }).status,
    ).toBe('NOT_MET');
    const six = {
      departed: '2024-03-01',
      returned: '2024-09-01',
      reason: 'ordinary' as const,
    };
    expect(row('U04', { trips: [six] }).status).toBe('MET');
    expect(
      row('U04', { trips: [{ ...six, returned: '2024-09-02' }] }).status,
    ).toBe('NOT_MET');
    expect(
      row('U04', {
        trips: [{ ...six, returned: '2025-03-01', reason: 'important' }],
      }).status,
    ).toBe('MET');
    expect(
      row('U04', {
        trips: [{ ...six, returned: '2025-03-02', reason: 'important' }],
      }).status,
    ).toBe('NOT_MET');
    expect(
      row('U04', {
        trips: [{ ...six, returned: '2025-03-02', reason: 'military' }],
      }).status,
    ).toBe('MET');
    expect(
      row('U04', {
        trips: [{ ...six, returned: '2025-03-02', reason: 'unconfirmed' }],
      }).pendingDetails,
    ).toContain('PD-298');
    const paired: NonNullable<EsFreeMovementFacts['trips']> = [
      { departed: '2023-01-01', returned: '2023-02-01', reason: 'important' },
      { departed: '2024-02-01', returned: '2024-11-01', reason: 'important' },
    ];
    expect(row('U04', { trips: paired }).status).toBe('MET');
    expect(row('U04', { trips: [...paired].reverse() }).status).toBe('MET');
  });
  test('U04 retention uses only time after acquisition and through the simulation date', () => {
    const acquired: EsFreeMovementFacts = {
      acquiredOn: '2022-01-01',
      history: [],
      residenceFrom: undefined,
      postAcquisitionTravelComplete: true,
    };
    expect(assess(acquired).status).toBe('MET');
    expect(
      assess({
        ...acquired,
        ...family,
        accompanyingOrJoining: false,
        relationshipDocumented: undefined,
      }).status,
    ).toBe('MET');
    expect(
      row('U04-retention', {
        ...acquired,
        longestPostAcquisitionAbsence: {
          departed: '2023-06-01',
          returned: '2025-06-01',
        },
      }).status,
    ).toBe('MET');
    expect(
      row('U04-retention', {
        ...acquired,
        longestPostAcquisitionAbsence: {
          departed: '2023-06-01',
          returned: '2025-06-02',
        },
      }).status,
    ).toBe('NOT_MET');
    expect(
      row('U04-retention', {
        ...acquired,
        longestPostAcquisitionAbsence: {
          departed: '2024-11-23',
          returned: '2027-01-01',
        },
      }).status,
    ).toBe('MET');
    expect(
      row('U04-retention', {
        ...acquired,
        postAcquisitionTravelComplete: undefined,
      }).status,
    ).toBe('UNKNOWN');
  });
  test('U05 requires coverage in each period, recognises overlaps and preserves individual resource assessment', () => {
    type Period = NonNullable<EsFreeMovementFacts['history']>[number];
    const prior: Period = {
      from: '2021-11-23',
      to: '2025-12-31',
      basis: 'employment',
      documented: true,
    };
    const resources: Period = {
      from: '2026-01-01',
      basis: 'resources',
      singleHousehold: true,
      annualMeans: 8803.21,
      allRiskInsurance: true,
      documented: true,
    };
    const status = (period: Period) =>
      row('U05', { history: [prior, period] }).status;
    expect(status(resources)).toBe('MET');
    expect(status({ ...resources, annualMeans: 8803.2 })).toBe('UNKNOWN');
    expect(
      status({
        ...resources,
        annualMeans: 6000,
        sufficientMeansAccepted: true,
      }),
    ).toBe('MET');
    expect(status({ ...resources, allRiskInsurance: false })).toBe('NOT_MET');
    expect(status({ ...resources, from: '2026-01-02' })).toBe('NOT_MET');
    expect(row('U05', { history: undefined }).status).toBe('UNKNOWN');
    expect(
      row('U05', { history: [{ ...prior, to: '2026-02-01' }, resources] })
        .status,
    ).toBe('MET');
    const student: Period = {
      from: '2026-01-01',
      basis: 'student',
      documented: true,
      recognizedCourse: true,
      allRiskInsurance: true,
      resourceDeclaration: true,
    };
    expect(status(student)).toBe('MET');
    expect(status({ ...student, resourceDeclaration: false })).toBe('NOT_MET');
  });
  test('U05 retained worker status uses strictly more than one year and six months for shorter employment', () => {
    const from = '2026-05-23';
    const prior = {
      from: '2021-11-23',
      to: '2026-05-22',
      basis: 'employment' as const,
      documented: true,
    };
    const period = {
      from,
      basis: 'unemployed' as const,
      documented: true,
      involuntaryAndRegistered: true,
      employmentStarted: '2025-05-23',
      fixedTermUnderOneYear: false,
    };
    const req = { simulationDate: '2026-11-23' };
    expect(row('U05', { history: [prior, period] }, req).status).toBe('MET');
    expect(
      row(
        'U05',
        { residenceFrom: '2021-11-24', history: [prior, period] },
        { simulationDate: '2026-11-24' },
      ).status,
    ).toBe('UNKNOWN');
    expect(
      row(
        'U05',
        { history: [prior, { ...period, employmentStarted: '2025-05-22' }] },
        { simulationDate: '2026-11-24' },
      ).status,
    ).toBe('MET');
    expect(
      row(
        'U05',
        { history: [prior, { ...period, involuntaryAndRegistered: false }] },
        req,
      ).status,
    ).toBe('NOT_MET');
  });
  test('U06 death, divorce and a child continuing education can retain a personal right', () => {
    const survivor: EsFreeMovementFacts = {
      ...family,
      retainedEvent: 'sponsor-death',
      eventDate: '2025-11-23',
      eventReported: true,
      priorFamilyResidenceFrom: '2024-11-23',
      accompanyingOrJoining: false,
    };
    expect(row('U06', survivor).status).toBe('MET');
    expect(
      assess({ ...survivor, priorFamilyResidenceFrom: '2021-11-23' }).status,
    ).toBe('MET');
    expect(
      row('U06', { ...survivor, priorFamilyResidenceFrom: '2024-11-24' })
        .pendingDetails,
    ).toContain('PD-299');
    const divorce: EsFreeMovementFacts = {
      ...survivor,
      retainedEvent: 'divorce',
      relationshipFrom: '2022-11-23',
      divorceProceedingsStartedOn: '2025-11-23',
      custodyOrAccessInSpain: false,
      exceptionalHardshipProved: false,
    };
    expect(row('U06', divorce).status).toBe('MET');
    expect(
      row('U06', { ...divorce, relationshipFrom: '2022-11-24' }).status,
    ).toBe('NOT_MET');
    expect(
      row('U06', {
        ...divorce,
        relationshipFrom: '2022-11-24',
        custodyOrAccessInSpain: true,
      }).status,
    ).toBe('MET');
    expect(
      row('U06', {
        ...survivor,
        retainedEvent: 'child-in-education',
        continuingChildEducationAndCustody: true,
      }).status,
    ).toBe('MET');
  });
  test('U07 retirement uses 459 contributions, 65 or 66y10m, 12 months work and strictly over three years', () => {
    const retired: EsFreeMovementFacts = {
      earlyBasis: 'retirement',
      workStopped: '2026-11-23',
      employmentFrom: '2025-11-23',
      qualifiedWorker: true,
      residenceFrom: '2023-11-22',
      earlyEmployeeRetirement: false,
      spanishSpouseExemption: false,
      birthDate: '1961-11-23',
      contributionMonths: 459,
      pensionContributionsQualified: true,
    };
    expect(row('U07', retired).status).toBe('MET');
    expect(assess(retired).status).toBe('MET');
    expect(row('U07', { ...retired, contributionMonths: 458 }).status).toBe(
      'NOT_MET',
    );
    expect(
      row('U07', {
        ...retired,
        contributionMonths: 458,
        birthDate: '1960-01-23',
      }).status,
    ).toBe('MET');
    expect(
      row('U07', {
        ...retired,
        contributionMonths: 458,
        birthDate: '1960-01-24',
      }).status,
    ).toBe('NOT_MET');
    expect(row('U07', { ...retired, residenceFrom: '2023-11-23' }).status).toBe(
      'NOT_MET',
    );
    expect(
      row('U07', { ...retired, employmentFrom: '2025-11-24' }).status,
    ).toBe('NOT_MET');
    expect(
      row('U07', {
        ...retired,
        employmentFrom: '2025-11-24',
        spanishSpouseExemption: true,
      }).pendingDetails,
    ).toContain('PD-299');
    expect(
      row('U07', { ...retired, pensionContributionsQualified: undefined })
        .status,
    ).toBe('UNKNOWN');
  });
  test('U08 and U09 have different residence cutoffs and occupational tests', () => {
    const incapacity: EsFreeMovementFacts = {
      earlyBasis: 'incapacity',
      workStopped: '2026-11-23',
      qualifiedWorker: true,
      permanentIncapacity: true,
      occupationalSpanishBenefit: false,
      spanishSpouseExemption: false,
      residenceFrom: '2024-11-22',
    };
    expect(row('U08', incapacity).status).toBe('MET');
    expect(
      row('U08', { ...incapacity, residenceFrom: '2024-11-23' }).status,
    ).toBe('NOT_MET');
    expect(
      row('U08', {
        ...incapacity,
        residenceFrom: '2026-10-01',
        occupationalSpanishBenefit: true,
      }).status,
    ).toBe('MET');
    const cross: EsFreeMovementFacts = {
      earlyBasis: 'cross-border',
      workStopped: '2026-11-23',
      qualifiedWorker: true,
      employmentFrom: '2023-11-23',
      residenceFrom: '2023-11-23',
      workingInAnotherMemberState: true,
      retainedSpanishHome: true,
      returnsAtLeastWeekly: true,
    };
    expect(row('U09', cross).status).toBe('MET');
    expect(row('U09', { ...cross, employmentFrom: '2023-11-24' }).status).toBe(
      'NOT_MET',
    );
    expect(row('U09', { ...cross, returnsAtLeastWeekly: false }).status).toBe(
      'NOT_MET',
    );
    const undatedTransfer = fullPath({
      ...cross,
      residenceFrom: '2020-01-01',
      employmentFrom: '2020-01-01',
      workStopped: '2024-01-02',
      history: [],
      trips: [{ departed: '2024-02-01', returned: '2026-03-01' }],
    });
    expect(undatedTransfer.status).toBe('UNKNOWN');
    expect(undatedTransfer.pendingDetails).toContain('PD-298');
  });
  test('U10 and U11 use the worker’s evidence and offer alternative statutory grounds', () => {
    const dependent: EsFreeMovementFacts = {
      ...family,
      earlyBasis: 'worker-family',
      coResidentWithWorker: true,
      workerAcquiredEarly: true,
    };
    expect(row('U10', dependent).status).toBe('MET');
    expect(
      row('U10', { ...dependent, workerAcquiredEarly: undefined }).status,
    ).toBe('UNKNOWN');
    const death: EsFreeMovementFacts = {
      ...family,
      earlyBasis: 'death-at-work',
      eventDate: '2026-10-23',
      diedDuringWorkBeforePermanent: true,
      coResidentWithWorker: true,
      workerResidenceFrom: '2024-10-23',
      workerResidenceEvidence: {
        history: [
          { from: '2024-10-23', basis: 'employment', documented: true },
        ],
        trips: [],
        noExecutedExpulsion: true,
      },
      priorFamilyResidenceFrom: '2026-01-01',
      occupationalDeath: false,
      spouseLostSpanishNationalityThroughMarriage: false,
    };
    expect(row('U11', death).status).toBe('MET');
    expect(
      row('U11', { ...death, workerResidenceFrom: '2024-10-24' }).status,
    ).toBe('NOT_MET');
    expect(
      row('U11', {
        ...death,
        workerResidenceFrom: undefined,
        workerResidenceEvidence: undefined,
        occupationalDeath: true,
      }).status,
    ).toBe('MET');
    expect(
      row('U11', {
        ...death,
        workerResidenceFrom: undefined,
        workerResidenceEvidence: undefined,
        spouseLostSpanishNationalityThroughMarriage: true,
      }).status,
    ).toBe('MET');
  });
  test('U12 needs an official result and U13 separates card timing and costs from residence rights', () => {
    expect(row('U12', {}).status).toBe('MET');
    expect(assess({ noOfficialRestriction: false }).status).toBe('NOT_MET');
    expect(assess({ noOfficialRestriction: undefined }).status).toBe('UNKNOWN');
    const doc = {
      officeHolidays: [],
      validIdOrRenewal: true,
      entitlementDocuments: true,
      feePaid: 12,
      ex19: true,
      photos: 3,
      priorCardExpiry: '2026-08-23',
      applied: '2026-11-23',
    };
    expect(row('U13', { ...family, document: doc }).status).toBe('MET');
    expect(
      row('U13', { ...family, document: { ...doc, applied: '2026-07-23' } })
        .status,
    ).toBe('MET');
    expect(
      row('U13', { ...family, document: { ...doc, applied: '2026-07-22' } })
        .status,
    ).not.toBe('MET');
    expect(
      row(
        'U13',
        { ...family, document: { ...doc, applied: '2026-11-24' } },
        { simulationDate: '2026-11-25' },
      ).status,
    ).toBe('NOT_MET');
    expect(
      row(
        'U13',
        { ...family, document: { ...doc, applied: '2026-11-23' } },
        { simulationDate: '2026-11-22' },
      ).status,
    ).not.toBe('MET');
    expect(
      row('U13', { ...family, document: { ...doc, feePaid: 11.99 } }).status,
    ).toBe('NOT_MET');
    expect(
      row('U13', { ...family, document: { ...doc, photos: 2 } }).status,
    ).toBe('NOT_MET');
    expect(assess({ ...family, document: { ...doc, photos: 2 } }).status).toBe(
      'MET',
    );
    expect(
      row('U13', {
        document: {
          feePaid: 12,
          validIdOrRenewal: true,
          entitlementDocuments: true,
        },
      }).status,
    ).toBe('MET');
  });

  test('early acquisition on the worker’s death is independent of personal retention after that death', () => {
    const eventDate = '2026-12-01';
    const survivor: EsFreeMovementFacts = {
      ...family,
      earlyBasis: 'death-at-work',
      eventDate,
      coResidentWithWorker: true,
      diedDuringWorkBeforePermanent: true,
      workerResidenceFrom: '2023-12-01',
      workerResidenceEvidence: {
        history: [
          { from: '2023-12-01', basis: 'employment', documented: true },
        ],
        trips: [],
        noExecutedExpulsion: true,
      },
      residenceFrom: '2026-05-01',
      jointResidenceFrom: '2026-05-01',
      priorFamilyResidenceFrom: '2026-05-01',
      history: [
        {
          from: '2026-05-01',
          to: eventDate,
          basis: 'qualifying-family',
          documented: true,
        },
      ],
      eventReported: true,
    };
    for (const retainedEvent of [undefined, 'sponsor-death'] as const)
      expectDatedAcquisition({ ...survivor, retainedEvent }, eventDate, 'MET');
    // Without early acquisition, ordinary acquisition still requires a retained right.
    const ordinary: EsFreeMovementFacts = {
      ...survivor,
      retainedEvent: 'sponsor-death',
      diedDuringWorkBeforePermanent: false,
      residenceFrom: '2021-11-23',
      history: worker.history,
    };
    for (const [retainedStatusAccepted, status] of [
      [undefined, 'UNKNOWN'],
      [true, 'MET'],
    ] as const) {
      const result = fullPath(
        { ...ordinary, retainedStatusAccepted },
        eventDate,
      );
      expect(result.decidedBy).toContain('ES-U06');
      expect(result.status).toBe(status);
      expect(result.earliestDate).toBe(
        retainedStatusAccepted ? eventDate : undefined,
      );
    }
    const unrelated = {
      ...survivor,
      retainedEvent: 'sponsor-death',
      relationship: 'other',
    } as const;
    expect(fullPath(unrelated, eventDate).status).toBe('NOT_MET');
    const retained = fullPath(
      {
        ...ordinary,
        relationship: 'other',
        diedDuringWorkBeforePermanent: true,
        retainedStatusAccepted: true,
      },
      eventDate,
    );
    expect([
      retained.status,
      retained.pathwayCompletionDate,
      retained.earliestDate,
    ]).toEqual(['MET', '2026-11-23', eventDate]);
    expect(retained.decidedBy).toContain('ES-U06');
  });
});
