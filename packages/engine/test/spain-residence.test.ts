import { describe, expect, test } from 'vitest';
import { evaluateSpainFull } from '../src';
import type { EsFullRequest } from '../src/spain-full';
import { evaluateSpain } from '../src/spain';
import type { EsRequest, EsPathway } from '../src/spain';
import {
  familyResourcesCheck,
  insuranceCheck,
  residencePath,
} from '../src/spain-residence';
import type { EsEuPeriod, EsResidenceFacts } from '../src/spain-residence';

const base: EsRequest = {
  simulationDate: '2026-11-23',
  route: 'general',
  permits: [{ from: '2021-11-23' }],
  trips: [],
  locale: 'en',
};
const ready: EsResidenceFacts = {
  thirdCountryRegime: true,
  entryRestrictionsClear: true,
  noReturnCommitmentClear: true,
  validIdentityDocument: true,
  competentOfficeAndApplication: true,
  criminalCertificatesWhereRequired: true,
  securityDecision: 'clear',
  nationalAlternatives: [],
  schooling: { children: [] },
  resources: { familySize: 2, eligibleMonthlyIncome: 900, stable: true },
  insurance: {
    kind: 'public',
    proof: true,
    entitledOrAuthorized: true,
    validFrom: '2021-01-01',
  },
  fee: {
    amount: 21.87,
    paid: true,
    workingDaysAfterAdmission: 10,
    exemptPublicGuardian: false,
  },
};
const cache = new Map<string, EsPathway>();
function assess(
  kind: 'L' | 'E',
  facts: EsResidenceFacts = {},
  opts: Partial<EsFullRequest> = {},
) {
  const r = {
    ...base,
    timeRecordsComplete: true,
    ...opts,
    residence: { ...ready, ...facts },
  };
  const key = JSON.stringify([r.permits, r.trips, r.locale, r.simulationDate]);
  if (!cache.has(key)) cache.set(key, evaluateSpain(r).pathways[0]);
  return residencePath(r, cache.get(key)!, kind);
}
const row = (p: ReturnType<typeof assess>, id: string) => {
  const c = p.checks.find((c) => c.id === 'ES-' + id);
  if (!c) throw new Error('Missing ' + id);
  return c;
};

describe('Spanish national long-term residence, arts. 183–184', () => {
  test('all common checks on the exact fifth anniversary; payment and the candidate date stay inspectable', () => {
    const p = assess('L');
    expect(p.status).toBe('MET');
    for (const id of [
      'L01',
      'L01-PERMIT',
      'L01-SINGLE',
      'L01-TOTAL',
      'L10',
      'L11',
      'L12',
      'L12-CERT',
      'L13',
      'L14',
    ])
      expect(row(p, id).status).toBe('MET');
    expect(row(p, 'L14').title).toContain('21.87');
    const early = assess('L', {}, { simulationDate: '2026-11-22' });
    expect(row(early, 'L01').status).toBe('NOT_MET');
    expect(early.summary).toContain('2026-11-23');
    expect(early.pathwayCompletionDate).toBe('2026-11-23');
    expect(early.earliestDate).toBe('2026-11-23');
  });

  test('a classified study stay contributes no ordinary national residence', () => {
    const [p] = evaluateSpainFull({
      simulationDate: base.simulationDate,
      targets: ['L'],
      residence: {
        ...ready,
        tripDetails: [],
        periods: [
          {
            territory: 'spain',
            kind: 'study',
            from: '2019-01-01',
            to: '2023-11-22',
          },
          { territory: 'spain', kind: 'residence', from: '2023-11-23' },
        ],
      },
    }).columns[0].pathways;
    for (const id of ['L01', 'L01-PERMIT', 'L-BASIS'])
      expect(row(p, id).status).toBe('NOT_MET');
    expect([p.status, p.earliestDate, p.pathwayCompletionDate]).toEqual([
      'FUTURE',
      '2028-11-23',
      '2028-11-23',
    ]);
  });

  test('a child in the primary entry cohort needs enrolment evidence by the residence anniversary', () => {
    const run = (simulationDate: string, primarySchoolStartsOn?: string) =>
      evaluateSpainFull({
        ...base,
        simulationDate,
        targets: ['L'],
        residence: {
          ...ready,
          schooling: {
            children: [
              {
                birthDate: '2020-12-10',
                standardSpanishSchooling: true,
                enrolledWithProof: false,
                primarySchoolStartsOn,
              },
            ],
          },
        },
      }).columns[0].pathways[0];
    for (const date of ['2026-08-31', '2026-11-23']) {
      const path = run(date);
      expect([
        path.status,
        path.pathwayCompletionDate,
        path.earliestDate,
      ]).toEqual(['UNKNOWN', '2026-11-23', undefined]);
      expect(row(path, 'L13').status).toBe(
        date === '2026-08-31' ? 'MET' : 'UNKNOWN',
      );
      expect(path.pendingDetails).toContain('PD-288');
    }
    expect(row(run('2026-09-08'), 'L13').status).toBe('UNKNOWN');
    expect(row(run('2026-09-08', '2026-09-09'), 'L13').status).toBe('MET');
    expect(row(run('2026-09-09', '2026-09-09'), 'L13').status).toBe('UNKNOWN');
  });

  test('ordinary absences age out of the cumulative limit before another five full years', () => {
    const trips = [2022, 2023, 2024, 2025, 2026].map((year) => ({
      departed: `${year}-06-25`,
      returned: `${year}-09-01`,
      reason: 'ordinary' as const,
      irregularExit: false,
    }));
    const run = (simulationDate: string) =>
      evaluateSpainFull({
        ...base,
        simulationDate,
        targets: ['L'],
        permits: [{ from: '2017-01-01' }],
        trips,
        residence: { ...ready, tripDetails: trips },
      }).columns[0].pathways[0];
    const path = run('2026-11-23');
    expect([
      row(path, 'L01-SINGLE').status,
      row(path, 'L01-TOTAL').status,
    ]).toEqual(['MET', 'NOT_MET']);
    expect([
      path.status,
      path.pathwayCompletionDate,
      path.earliestDate,
    ]).toEqual(['FUTURE', '2027-07-28', '2027-07-28']);
    const boundary = run('2027-07-27');
    expect([
      boundary.status,
      boundary.pathwayCompletionDate,
      boundary.earliestDate,
    ]).toEqual(['UNKNOWN', '2027-07-28', undefined]);
    const filing = run('2027-07-28');
    expect([
      filing.status,
      filing.pathwayCompletionDate,
      filing.earliestDate,
    ]).toEqual(['MET', '2027-07-28', '2027-07-28']);
  });

  test('late filing freezes the residence and absence windows at the last covered day', () => {
    const trips = [
      { departed: '2021-10-01', returned: '2022-03-01' },
      { departed: '2023-01-01', returned: '2023-07-01' },
    ].map((trip) => ({
      ...trip,
      reason: 'ordinary' as const,
      irregularExit: false,
    }));
    for (const simulationDate of ['2026-10-01', '2026-10-29']) {
      const [national, eu] = evaluateSpainFull({
        ...base,
        simulationDate,
        targets: ['L', 'E'],
        permits: [{ from: '2021-04-01', to: '2026-09-30' }],
        // The detailed history can include journeys omitted from the pilot input.
        trips: [trips[0]],
        residence: { ...ready, tripDetails: trips },
      }).columns[0].pathways;
      for (const path of [national, eu])
        expect([
          path.status,
          path.pathwayCompletionDate,
          path.earliestDate,
        ]).toEqual(['NOT_MET', undefined, undefined]);
      expect(row(national, 'L11').status).toBe('MET');
      expect(row(national, 'L01-PERMIT').status).toBe('MET');
      expect(row(national, 'L01-SINGLE').status).toBe('MET');
      expect(row(national, 'L01-TOTAL')).toMatchObject({
        status: 'NOT_MET',
        title: expect.stringContaining('330 days'),
      });
    }
  });

  test('projects five continuous years from the return after an overlong ordinary trip', () => {
    const trip = {
      departed: '2022-01-01',
      returned: '2022-08-01',
      reason: 'ordinary' as const,
      irregularExit: false,
    };
    const run = (simulationDate: string) =>
      evaluateSpainFull({
        ...base,
        simulationDate,
        targets: ['L'],
        permits: [{ from: '2017-01-01' }],
        trips: [trip],
        residence: { ...ready, tripDetails: [trip] },
      }).columns[0].pathways[0];
    const path = run('2026-11-23');
    expect(row(path, 'L01-PERMIT').status).toBe('MET');
    expect(row(path, 'L01-SINGLE').status).toBe('NOT_MET');
    expect([
      path.status,
      path.pathwayCompletionDate,
      path.earliestDate,
    ]).toEqual(['FUTURE', '2027-08-01', '2027-08-01']);
    expect(run('2027-08-01').status).toBe('MET');
  });

  test.each([
    ['clear', 'MET', 'FUTURE', '2027-01-01'],
    ['pending', 'UNKNOWN', 'UNKNOWN', undefined],
    ['threat', 'NOT_MET', 'NOT_MET', undefined],
  ] as const)(
    'only the residence duration can be projected with a %s security decision',
    (securityDecision, security, status, earliest) => {
      const [p] = evaluateSpainFull({
        ...base,
        targets: ['L'],
        permits: [{ from: '2022-01-01' }],
        residence: { ...ready, securityDecision },
      }).columns[0].pathways;
      expect([
        row(p, 'L01').status,
        row(p, 'L-BASIS').status,
        row(p, 'L12').status,
      ]).toEqual(['NOT_MET', 'NOT_MET', security]);
      expect([p.status, p.earliestDate, p.pathwayCompletionDate]).toEqual([
        status,
        earliest,
        '2027-01-01',
      ]);
    },
  );

  test.each(['L', 'E'] as const)(
    '%s extends the expired permit through an official holiday and the following weekend',
    (target) => {
      const run = (officeHolidays?: string[], simulationDate = '2026-05-04') =>
        evaluateSpainFull({
          ...base,
          simulationDate,
          targets: [target],
          permits: [{ from: '2021-02-01', to: '2026-02-01' }],
          residence: { ...ready, officeHolidays },
        }).columns[0].pathways[0];
      const filing = target === 'L' ? 'L11' : 'E07';
      const duration = target === 'L' ? 'L01' : 'E01';
      for (const [path, expected] of [
        [run(['2026-05-01']), 'MET'],
        [run(), 'UNKNOWN'],
        [run([]), 'NOT_MET'],
        [run(['2026-05-01'], '2026-05-05'), 'NOT_MET'],
      ] as const) {
        expect([
          row(path, duration).status,
          row(path, filing).status,
          path.status,
        ]).toEqual([expected, expected, expected]);
        expect(path.earliestDate).toBe(
          expected === 'MET' ? '2026-05-04' : undefined,
        );
        if (expected === 'UNKNOWN')
          expect(row(path, filing).pendingDetails).toContain('PD-285');
      }
    },
  );

  test('unknown records do not establish ordinary residence; a direct basis can still qualify', () => {
    const missing = assess('L', {}, { timeRecordsComplete: false });
    expect(row(missing, 'L01').status).toBe('UNKNOWN');
    const direct = assess(
      'L',
      {
        nationalAlternatives: ['former-spaniard'],
        lostSpanishNationalityOfOriginDocumented: true,
      },
      { timeRecordsComplete: false },
    );
    expect(direct.status).toBe('MET');
    expect(row(direct, 'L01').status).toBe('UNKNOWN');
  });

  test('ordinary, lawful work and mixed absences have distinct limits', () => {
    const trips = [
      { departed: '2022-01-01', returned: '2022-07-01' },
      { departed: '2023-01-01', returned: '2023-07-01' },
      { departed: '2024-01-01', returned: '2024-06-01' },
    ];
    const ordinary = trips.map((t) => ({
      ...t,
      reason: 'ordinary' as const,
      irregularExit: false,
    }));
    const work = trips.map((t) => ({
      ...t,
      reason: 'work' as const,
      irregularExit: false,
    }));
    expect(
      row(assess('L', { tripDetails: ordinary }, { trips }), 'L01').status,
    ).toBe('NOT_MET');
    expect(
      row(assess('L', { tripDetails: work }, { trips }), 'L01').status,
    ).toBe('MET');
    expect(
      row(
        assess(
          'L',
          { tripDetails: [ordinary[0], ...work.slice(1)] },
          { trips },
        ),
        'L01',
      ).pendingDetails,
    ).toContain('PD-285');
    expect(
      row(
        assess(
          'L',
          { tripDetails: [{ ...work[0], irregularExit: true }] },
          { trips: [trips[0]] },
        ),
        'L01',
      ).status,
    ).toBe('NOT_MET');
  });

  test('projects the cumulative work limit using documented work trips', () => {
    const trips = [2022, 2023, 2024, 2025, 2026].map((year) => ({
      departed: `${year}-05-01`,
      returned: `${year}-09-01`,
      reason: 'work' as const,
      irregularExit: false,
    }));
    const run = (simulationDate: string) =>
      evaluateSpainFull({
        ...base,
        targets: ['L'],
        simulationDate,
        permits: [{ from: '2017-01-01' }],
        trips,
        residence: { ...ready, tripDetails: trips },
      }).columns[0].pathways[0];
    const result = run(base.simulationDate);
    expect([
      result.status,
      result.pathwayCompletionDate,
      result.earliestDate,
    ]).toEqual(['FUTURE', '2027-07-05', '2027-07-05']);
    expect(run('2027-07-05').status).toBe('MET');
  });

  test.each(['force-majeure', 'cooperation'] as const)(
    '%s can preserve continuity only with the requisite decision or evidence',
    (reason) => {
      const trip = {
        departed: '2022-01-01',
        returned: '2022-08-01',
        irregularExit: false,
        reason,
      };
      for (const [evidence, expected] of [
        [true, 'MET'],
        [false, 'NOT_MET'],
        [undefined, 'UNKNOWN'],
      ] as const) {
        const p = assess(
          'L',
          { tripDetails: [{ ...trip, exceptionDocumented: evidence }] },
          { trips: [trip] },
        );
        expect(row(p, 'L01').status).toBe('NOT_MET');
        expect(row(p, 'L02').status).toBe(expected);
        expect(row(p, 'L-BASIS').status).toBe(expected);
      }
    },
  );

  test('each direct legal basis can stand alone, independently of five ordinary years', () => {
    type Ground = NonNullable<EsResidenceFacts['nationalAlternatives']>[number];
    const proofs: [Ground, string, EsResidenceFacts, EsResidenceFacts][] = [
      [
        'retirement',
        'L03',
        { spanishContributoryRetirement: true },
        { spanishContributoryRetirement: false },
      ],
      [
        'disability',
        'L04',
        { disabilityBenefit: 'spanish-contributory-absolute-or-severe' },
        { disabilityBenefit: 'other' },
      ],
      [
        'spanish-birth',
        'L05',
        { bornInSpainDocumented: true },
        { bornInSpainDocumented: false },
      ],
      [
        'former-spaniard',
        'L06',
        { lostSpanishNationalityOfOriginDocumented: true },
        { lostSpanishNationalityOfOriginDocumented: false },
      ],
      [
        'public-care',
        'L07',
        { spanishPublicGuardianship: { from: '2021-11-23' } },
        { spanishPublicGuardianship: { from: '2021-11-24' } },
      ],
      [
        'protection',
        'L08',
        { validRecognizedProtectionInEu: true },
        { validRecognizedProtectionInEu: false },
      ],
      [
        'contribution',
        'L09',
        { contributionDecision: 'granted' },
        { contributionDecision: 'refused' },
      ],
    ];
    for (const [ground, id, met, failed] of proofs) {
      const facts = {
        nationalAlternatives: [ground],
        residentInSpain: true,
        inSpain: true,
        birthDate: '2008-11-23',
      };
      const opts = { permits: [{ from: '2023-11-23' }] };
      const p = assess('L', { ...facts, ...met }, opts);
      expect(row(p, id).status, id).toBe('MET');
      expect(p.status, id).toBe('MET');
      const n = assess('L', { ...facts, ...failed }, opts);
      expect(row(n, id).status, id).toBe('NOT_MET');
      expect([n.status, n.earliestDate], id).toEqual(['FUTURE', '2028-11-23']);
    }
    const annuity = assess('L', {
      nationalAlternatives: ['disability'],
      residentInSpain: true,
      disabilityBenefit: 'analogous-spanish',
      analogousLifelongNonCapitalisable: true,
    });
    expect(row(annuity, 'L04').pendingDetails).toContain('PD-286');
    const late = assess('L', {
      nationalAlternatives: ['spanish-birth'],
      residentInSpain: true,
      birthDate: '2008-11-22',
      bornInSpainDocumented: true,
    });
    expect(row(late, 'L05').pendingDetails).toContain('PD-287');
  });

  test.each(['spanish-birth', 'public-care'] as const)(
    'projects the documented %s basis on reaching majority',
    (ground) => {
      const run = (simulationDate: string) =>
        evaluateSpainFull({
          ...base,
          targets: ['L'],
          simulationDate,
          permits: [{ from: '2023-11-23' }],
          residence: {
            ...ready,
            residentInSpain: true,
            birthDate: '2008-12-01',
            nationalAlternatives: [ground],
            bornInSpainDocumented: true,
            spanishPublicGuardianship: { from: '2021-10-01' },
          },
        }).columns[0].pathways[0];
      const result = run(base.simulationDate);
      expect([
        result.status,
        result.pathwayCompletionDate,
        result.earliestDate,
      ]).toEqual(['FUTURE', '2028-11-23', '2026-12-01']);
      expect(run('2026-12-01').status).toBe('MET');
    },
  );

  test('school enrolment, the one-month cure period and foreign schooling', () => {
    const child = {
      birthDate: '2020-11-23',
      standardSpanishSchooling: true,
      enrolledWithProof: false,
    };
    const p = (childBirth: string, noticeDate: string, standard = true) =>
      row(
        assess('L', {
          schooling: {
            children: [
              {
                ...child,
                birthDate: childBirth,
                standardSpanishSchooling: standard,
              },
            ],
            noticeDate,
          },
        }),
        'L13',
      );
    expect(p('2020-11-24', '2026-09-20').status).toBe('NOT_MET');
    expect(p('2020-11-23', '2026-10-23').status).toBe('UNKNOWN');
    expect(p('2020-11-23', '2026-10-22').status).toBe('UNKNOWN'); // Sunday rolls to Monday 23rd.
    expect(p('2020-11-23', '2026-10-20').status).toBe('NOT_MET');
    expect(p('2010-11-23', '2026-09-01').status).toBe('MET');
    expect(p('2015-11-23', '2026-10-22', false).pendingDetails).toContain(
      'PD-288',
    );
  });

  test.each(['L', 'E'] as const)(
    '%s distinguishes evidence, security decisions, filing and fees',
    (k) => {
      const p = assess(k, {
        entryRestrictionsClear: false,
        criminalCertificatesWhereRequired: false,
        securityDecision: 'pending',
        validIdentityDocument: false,
        fee: {
          exemptPublicGuardian: false,
          paid: true,
          amount: 21.87,
          workingDaysAfterAdmission: 11,
        },
      });
      const ids =
        k === 'L'
          ? ['L10', 'L11', 'L12', 'L12-CERT', 'L14']
          : ['E01-SCOPE', 'E07', 'E08', 'E08-CERT', 'E09'];
      expect(ids.map((id) => row(p, id).status)).toEqual([
        'NOT_MET',
        'NOT_MET',
        'UNKNOWN',
        'NOT_MET',
        'NOT_MET',
      ]);
      expect(p.status).toBe('NOT_MET');
      expect(
        row(assess(k, { securityDecision: 'threat' }), ids[2]).status,
      ).toBe('NOT_MET');
      const noFee = assess(k, { fee: undefined });
      expect(noFee.status).toBe('MET');
      expect(row(noFee, ids[4]).status).toBe('UNKNOWN');
    },
  );
});

describe('EU long-term residence under art. 176', () => {
  const project = (simulationDate: string, facts: EsResidenceFacts) =>
    evaluateSpainFull({
      simulationDate,
      targets: ['E'],
      residence: {
        ...ready,
        resources: { stable: true, sufficiencyDecision: 'accepted' },
        tripDetails: [],
        ...facts,
      },
    }).columns[0].pathways[0];
  const studyThenResidence: EsEuPeriod[] = [
    { territory: 'spain', kind: 'study', from: '2020-11-25', to: '2022-11-22' },
    { territory: 'spain', kind: 'residence', from: '2022-11-23' },
  ];
  test.each<[string, EsResidenceFacts, string]>([
    ['half-credit study', { periods: studyThenResidence }, '2026-11-24'],
    [
      'recent Spanish Blue Card years',
      {
        periods: [
          {
            territory: 'other-eu',
            kind: 'blue-card',
            from: '2020-01-01',
            to: '2024-11-23',
          },
          { territory: 'spain', kind: 'blue-card', from: '2024-11-24' },
        ],
        blueMobility: { exercisedLawfully: true, priorPeriodsDocumented: true },
      },
      '2026-11-24',
    ],
    [
      'overlong ordinary absence',
      {
        periods: [
          { territory: 'spain', kind: 'residence', from: '2017-01-01' },
        ],
        tripDetails: [
          {
            departed: '2022-01-01',
            returned: '2022-08-01',
            reason: 'ordinary',
            irregularExit: false,
          },
        ],
      },
      '2027-08-01',
    ],
    [
      'rolling total of ordinary absences',
      {
        periods: [
          { territory: 'spain', kind: 'residence', from: '2017-01-01' },
        ],
        tripDetails: [2022, 2023, 2024, 2025, 2026].map((year) => ({
          departed: `${year}-06-25`,
          returned: `${year}-09-01`,
          reason: 'ordinary',
          irregularExit: false,
        })),
      },
      '2027-07-28',
    ],
  ])('projects %s to its first verified date', (_label, facts, date) => {
    const p = project('2026-11-23', facts);
    expect(row(p, 'E-TIME').status).toBe('NOT_MET');
    expect([p.status, p.pathwayCompletionDate, p.earliestDate]).toEqual([
      'FUTURE',
      date,
      date,
    ]);
    expect(project(date, facts).status).toBe('MET');
  });
  test('a half-credit candidate cannot outlast the evidence of insurance', () => {
    const p = project('2026-11-23', {
      periods: studyThenResidence,
      insurance: { ...ready.insurance, validTo: '2026-11-23' },
    });
    expect([p.status, p.pathwayCompletionDate, p.earliestDate]).toEqual([
      'NOT_MET',
      '2026-11-24',
      undefined,
    ]);
  });
  test('insurance starting after the residence candidate delays filing until coverage begins', () => {
    const facts = {
      periods: studyThenResidence,
      insurance: { ...ready.insurance, validFrom: '2026-11-25' },
    };
    const p = project('2026-11-23', facts);
    expect([p.status, p.pathwayCompletionDate, p.earliestDate]).toEqual([
      'FUTURE',
      '2026-11-24',
      '2026-11-25',
    ]);
    expect(project('2026-11-25', facts).status).toBe('MET');
  });
  test('a permit gap on the insurance start date requires a new qualifying residence period', () => {
    const facts: EsResidenceFacts = {
      periods: [
        {
          territory: 'spain',
          kind: 'residence',
          from: '2021-11-24',
          to: '2026-12-01',
        },
        { territory: 'spain', kind: 'residence', from: '2027-07-01' },
      ],
      officeHolidays: [],
      insurance: { ...ready.insurance, validFrom: '2027-06-01' },
    };
    const p = project('2026-11-23', facts);
    expect([p.status, p.pathwayCompletionDate, p.earliestDate]).toEqual([
      'FUTURE',
      '2026-11-24',
      '2032-07-01',
    ]);
    expect(row(project('2027-06-01', facts), 'E07').status).toBe('NOT_MET');
    expect(project('2032-07-01', facts).status).toBe('MET');
    const expired = project('2026-11-23', {
      ...facts,
      insurance: { ...facts.insurance, validTo: '2032-06-30' },
    });
    expect([expired.status, expired.earliestDate]).toEqual([
      'NOT_MET',
      undefined,
    ]);
  });
  test('a deciding half-day rounding question remains open on the filing date', () => {
    const p = project('2026-11-23', {
      periods: [
        { ...studyThenResidence[0], from: '2020-11-24' },
        studyThenResidence[1],
      ],
    });
    expect([p.status, p.pathwayCompletionDate, p.earliestDate]).toEqual([
      'UNKNOWN',
      '2026-11-24',
      undefined,
    ]);
    expect(p.pendingDetails).toContain('PD-285');
  });
  test('an unpublished filing-year resource threshold leaves only the residence candidate', () => {
    const p = project('2026-11-23', {
      periods: [{ territory: 'spain', kind: 'residence', from: '2022-01-01' }],
      resources: ready.resources,
    });
    expect([p.status, p.pathwayCompletionDate, p.earliestDate]).toEqual([
      'UNKNOWN',
      '2027-01-01',
      undefined,
    ]);
    expect(p.pendingDetails).toContain('PD-290');
  });
  test('ordinary fifth anniversary, gap and special purpose-only permits', () => {
    const p = assess('E');
    expect(p.status).toBe('MET');
    for (const id of [
      'E01',
      'E01-SCOPE',
      'E05',
      'E06',
      'E07',
      'E08',
      'E08-CERT',
      'E09',
    ])
      expect(row(p, id).status, id).toBe('MET');
    const period: EsEuPeriod = {
      territory: 'spain',
      kind: 'residence',
      from: '2021-11-24',
    };
    expect(row(assess('E', { periods: [period] }), 'E01').status).toBe(
      'NOT_MET',
    );
    expect(
      row(
        assess('E', {
          periods: [{ ...period, from: '2018-01-01', kind: 'temporary-only' }],
        }),
        'E01',
      ).status,
    ).toBe('NOT_MET');
    expect(
      row(
        assess('E', {
          periods: [{ ...period, from: '2018-01-01', kind: 'unclassified' }],
        }),
        'E01',
      ).pendingDetails,
    ).toContain('PD-289');
  });
  test('half credit, required Spanish residence, a lost day and overlapping permissions', () => {
    const periods: EsEuPeriod[] = [
      {
        territory: 'spain',
        kind: 'study',
        from: '2020-11-23',
        to: '2022-11-22',
      },
      { territory: 'spain', kind: 'residence', from: '2022-11-23' },
    ];
    expect(row(assess('E', { periods }), 'E02').status).toBe('MET');
    expect(row(assess('E', { periods }), 'E01').status).toBe('MET');
    // 730 half-credit days give 365 days. Duplicating the same record adds nothing.
    const short = { ...periods[0], from: '2020-11-25' };
    expect(
      row(assess('E', { periods: [short, short, periods[1]] }), 'E01').status,
    ).toBe('NOT_MET');
    expect(
      row(
        assess('E', {
          periods: [{ ...periods[0], from: '2010-01-01', to: undefined }],
          residentInSpain: false,
        }),
        'E02',
      ).status,
    ).toBe('NOT_MET');
    expect(
      row(
        assess('E', {
          periods: [{ ...periods[0], from: '2020-11-24' }, periods[1]],
        }),
        'E01',
      ).status,
    ).toBe('UNKNOWN');
  });
  test('Spanish grant credits its linked asylum application, excluding a denied or unclassified period', () => {
    const wait: EsEuPeriod = {
      territory: 'spain',
      kind: 'asylum-wait',
      from: '2021-11-23',
      to: '2023-11-22',
      protectionGranted: true,
    };
    const grant: EsEuPeriod = {
      territory: 'spain',
      kind: 'protection',
      from: '2023-11-23',
    };
    for (const [granted, expected] of [
      [true, 'MET'],
      [false, 'NOT_MET'],
      [undefined, 'UNKNOWN'],
    ] as const) {
      const p = assess('E', {
        periods: [{ ...wait, protectionGranted: granted }, grant],
      });
      expect(row(p, 'E04').status).toBe(expected);
      expect(row(p, 'E01').status).toBe(expected);
    }
  });
  test('Blue Card mobility needs both five EU years and the immediately preceding two Spanish Blue Card years', () => {
    const blueMobility = {
      exercisedLawfully: true,
      priorPeriodsDocumented: true,
      firstCardFrom: '2023-11-23',
      moveDate: '2024-11-23',
      movedPreviously: false,
    };
    const periods: EsEuPeriod[] = [
      {
        territory: 'other-eu',
        kind: 'research',
        from: '2021-11-23',
        to: '2023-11-22',
      },
      {
        territory: 'other-eu',
        kind: 'blue-card',
        from: '2023-11-23',
        to: '2024-11-22',
      },
      { territory: 'spain', kind: 'blue-card', from: '2024-11-23' },
    ];
    const p = assess('E', { periods, blueMobility });
    expect(row(p, 'E01').status).toBe('NOT_MET');
    expect(row(p, 'E03').status).toBe('MET');
    expect(p.status).toBe('MET');
    expect(
      row(
        assess('E', {
          periods,
          blueMobility: { ...blueMobility, moveDate: '2024-11-22' },
        }),
        'E03',
      ).status,
    ).toBe('NOT_MET');
    expect(
      row(
        assess('E', {
          periods: [
            ...periods.slice(0, 2),
            { ...periods[2], from: '2024-11-24' },
          ],
          blueMobility,
        }),
        'E03',
      ).status,
    ).toBe('NOT_MET');
    const trip = {
      departed: '2022-01-01',
      returned: '2023-01-01',
      outsideEu: true,
    };
    expect(
      row(assess('E', { periods, blueMobility, tripDetails: [trip] }), 'E03')
        .status,
    ).toBe('MET');
    expect(
      row(
        assess('E', {
          periods,
          blueMobility,
          tripDetails: [{ ...trip, returned: '2023-01-02' }],
        }),
        'E03',
      ).status,
    ).toBe('NOT_MET');
    expect(
      row(
        assess('E', {
          periods,
          blueMobility,
          tripDetails: [
            { ...trip, departed: '2025-05-01', returned: '2025-05-06' },
          ],
        }),
        'E03',
      ).pendingDetails,
    ).toContain('PD-285');
  });
  test('regular income comparisons follow 600/month IPREM plus the art. 67 family factors; uncertain cases stay open', () => {
    for (const id of ['ES-E05', 'ES-F03'] as const) {
      const calc = (n: number, euros: number) =>
        familyResourcesCheck(
          base,
          { familySize: n, eligibleMonthlyIncome: euros, stable: true },
          id,
        ).status;
      for (const [n, threshold] of [
        [2, 900],
        [3, 1200],
        [4, 1500],
      ]) {
        expect(calc(n, threshold)).toBe('MET');
        expect(calc(n, threshold - 0.01)).toBe('NOT_MET');
      }
      expect(calc(1, 2400)).toBe('UNKNOWN');
      expect(
        familyResourcesCheck(
          { ...base, simulationDate: '2027-01-01' },
          ready.resources,
          id,
        ).status,
      ).toBe('UNKNOWN');
      expect(
        familyResourcesCheck(
          base,
          {
            ...ready.resources,
            eligibleMonthlyIncome: 10,
            reduction: 'pending',
          },
          id,
        ).pendingDetails,
      ).toContain('PD-290');
    }
  });
  test('count verified eligible household income, exclude aid and leave asset conversion to the authority', () => {
    const resources = {
      familySize: 2,
      stable: true,
      income: [
        {
          kind: 'net-business' as const,
          eligibleHouseholdMember: true,
          amount: 700,
        },
        {
          kind: 'gross-pension' as const,
          eligibleHouseholdMember: true,
          amount: 190,
        },
        {
          kind: 'study-or-housing-aid' as const,
          eligibleHouseholdMember: true,
          amount: 500,
        },
        {
          kind: 'gross-pay' as const,
          eligibleHouseholdMember: false,
          amount: 800,
        },
      ],
    };
    expect(familyResourcesCheck(base, resources, 'ES-E05').status).toBe(
      'NOT_MET',
    );
    expect(
      familyResourcesCheck(
        base,
        { ...resources, sixMonthAverageAssets: 10_000 },
        'ES-E05',
      ).status,
    ).toBe('UNKNOWN');
    expect(
      familyResourcesCheck(
        base,
        {
          ...resources,
          income: [
            ...resources.income,
            {
              kind: 'taxable-capital-gain',
              eligibleHouseholdMember: true,
              amount: 10,
            },
          ],
        },
        'ES-F03',
      ).status,
    ).toBe('MET');
    expect(
      familyResourcesCheck(
        base,
        { familySize: 1, stable: true, sufficiencyDecision: 'accepted' },
        'ES-E05',
      ).status,
    ).toBe('MET');
  });
  test('private insurance starts and expires on the inclusive dates, uncertain coverage goes to PD-291', () => {
    const f = {
      kind: 'private' as const,
      proof: true,
      entitledOrAuthorized: true,
      equivalentCoverage: true,
      validFrom: '2026-11-23',
      validTo: '2026-11-23',
    };
    const c = (d: string, cover = f) =>
      insuranceCheck({ simulationDate: d }, cover, 'ES-E06');
    expect(c('2026-11-23').status).toBe('MET');
    expect(c('2026-11-24').status).toBe('NOT_MET');
    expect(c('2026-11-22').status).toBe('NOT_MET');
    expect(
      insuranceCheck(base, { ...f, equivalentCoverage: undefined }, 'ES-E06')
        .pendingDetails,
    ).toContain('PD-291');
  });
});
