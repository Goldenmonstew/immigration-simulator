import { expect, test } from 'vitest';
import { addDays } from '../src/dates';
import { evaluate } from '../src/evaluate';
import {
  clAncestryResidence5Y,
  clLrResidence10Y,
  clSwResidence5Y,
} from '../src/rules/current-law';
import { longResidence } from '../src/rules/current-law/long-residence';
import { esResidence } from '../src/rules/es-residence';
import type { ImmigrationEpisode, PersonTimeline } from '../src/types';
import { run, timeline } from './helpers';
import { goldenCases } from './golden/cases';

const permit = (
  validFrom: string,
  extra: Partial<ImmigrationEpisode> = {},
): ImmigrationEpisode => ({
  route: 'SKILLED_WORKER',
  role: 'MAIN',
  validFrom,
  validTo: '2032-12-31',
  socCode: '2136',
  salary: 60000,
  ...extra,
});

function current(
  input: Partial<PersonTimeline>,
  simulationDate: string,
  principal?: PersonTimeline,
) {
  return evaluate({
    timeline: timeline(input),
    simulationDate,
    principal,
  }).byRuleSet['current-law-2026-11']!;
}

const family = (
  validFrom: string,
  familyPermission: ImmigrationEpisode['familyPermission'],
) => ({
  episodes: [
    permit(validFrom, { route: 'FAMILY_PARTNER_OR_PARENT', familyPermission }),
  ],
  relationships: [
    { type: 'PARTNER', otherPartyStatus: 'BRITISH_CITIZEN' },
  ] as const,
});

test('A1#7 Skilled Worker and dependent partner can both complete within 28 days', () => {
  const principal = timeline({ episodes: [permit('2021-11-24')] });
  const dependant = permit('2021-11-24', {
    role: 'DEPENDANT',
    dependantOf: 'PARTNER',
  });
  const expected = {
    outcome: 'LIKELY_ELIGIBLE',
    earliestDate: '2026-11-04',
    pathwayYears: 5,
  };
  expect(current(principal, '2026-11-04')).toMatchObject(expected);
  expect(
    current({ episodes: [dependant] }, '2026-11-04', principal),
  ).toMatchObject(expected);
  expect(run(clSwResidence5Y, principal).explanation).toContain('2026-11-24');
});

test('A2#3 SETF ten-year route counts back from the day after applying', () => {
  const { episodes, relationships } = family('2016-11-05', 'PARTNER_TEN_YEAR');
  const a = current(
    { episodes, relationships: [...relationships] },
    '2026-11-04',
  );
  expect(a).toMatchObject({
    outcome: 'LIKELY_ELIGIBLE',
    earliestDate: '2026-11-04',
    pathwayYears: 10,
  });
  expect(a.rules.find((r) => r.id === 'CL-FAMILY-RESIDENCE')?.status).toBe(
    'PASS',
  );
});

test('A3#1 BN(O) distinguishes the 28-day boundary from the anniversary', () => {
  const episodes = [permit('2021-02-02', { route: 'HONG_KONG_BNO' })];
  expect(current({ episodes }, '2026-02-01').outcome).toBe('LIKELY_ELIGIBLE');
  expect(current({ episodes }, '2026-01-04')).toMatchObject({
    outcome: 'LIKELY_NOT_ELIGIBLE',
    earliestDate: '2026-01-05',
  });
  expect(current({ episodes }, '2026-01-05').outcome).toBe('LIKELY_ELIGIBLE');
});

test('A6#1 the Skilled Worker golden boundary and the reference date use separate permissions', () => {
  const start = '2021-06-01';
  expect(current({ episodes: [permit(start)] }, '2026-05-31')).toMatchObject({
    outcome: 'LIKELY_ELIGIBLE',
    earliestDate: '2026-05-31',
  });
  expect(
    run(
      clSwResidence5Y,
      { episodes: [permit(start, { validTo: '2026-05-31' })] },
      '2026-05-31',
    ).status,
  ).toBe('FAIL');
  expect(
    run(
      clSwResidence5Y,
      {
        episodes: [permit(start)],
        absences: [{ from: '2025-12-01', to: '2026-06-30' }],
      },
      '2026-05-31',
    ).status,
  ).toBe('FAIL');
});

test('review33a-1 #5 a former UK Ancestry grant does not open a new route', () => {
  const episodes = [
    permit('2019-06-01', { route: 'UK_ANCESTRY', validTo: '2024-06-01' }),
    permit('2024-06-02', { route: 'STUDENT' }),
  ];
  const a = current({ episodes, nationality: 'USA' }, '2026-11-04');
  expect(a.outcome).toBe('INSUFFICIENT_INFORMATION');
  expect(a.rules.map((r) => r.id)).not.toContain('CL-ANCESTRY-RESIDENCE-5Y');

  expect(
    current(
      { episodes: [permit('2019-06-01', { route: 'UK_ANCESTRY' })] },
      '2024-05-04',
    ),
  ).toMatchObject({ outcome: 'LIKELY_ELIGIBLE', earliestDate: '2024-05-04' });
});

test('review33a-1 #1 projected CR 1.1 references respect recorded expiry and switches', () => {
  const sw = permit('2021-06-01', { validTo: '2026-05-15' });
  const student = permit('2026-05-16', { route: 'STUDENT' });
  const facts = { episodes: [sw, student] };
  const before = current(facts, '2026-05-01');
  expect(before).toMatchObject({
    outcome: 'LIKELY_NOT_ELIGIBLE',
    earliestDate: '2031-05-04',
    pathwayYears: 10,
  });
  expect(before.decidedBy).toContain('CL-LR-RESIDENCE-10Y');
  expect(current(facts, before.earliestDate!).outcome).toBe('LIKELY_ELIGIBLE');
  expect(
    current(facts, '2026-05-04').rules.find(
      (r) => r.id === 'CL-SW-RESIDENCE-5Y',
    )?.status,
  ).toBe('FAIL');

  const qualifyingSwitch = {
    episodes: [sw, { ...student, route: 'GLOBAL_TALENT' as const }],
  };
  expect(current(qualifyingSwitch, '2026-05-01').earliestDate).toBe(
    '2026-05-04',
  );
  expect(current(qualifyingSwitch, '2026-05-04').outcome).toBe(
    'LIKELY_ELIGIBLE',
  );

  const noFurtherRecord = { episodes: [sw] };
  expect(current(noFurtherRecord, '2026-05-01')).toMatchObject({
    outcome: 'LIKELY_NOT_ELIGIBLE',
    earliestDate: '2026-05-16',
  });
  expect(current(noFurtherRecord, '2026-05-04').outcome).toBe(
    'LIKELY_NOT_ELIGIBLE',
  );
});

test.each(['SKILLED_WORKER', 'GLOBAL_TALENT'] as const)(
  'review33a-1 #2 %s rechecks historic absence windows for a joint application',
  (route) => {
    const principal = timeline({
      episodes: [
        permit('2021-08-29', {
          route,
          globalTalentEndorsement: 'TECH_NATION',
          globalTalentCriteria: 'EXCEPTIONAL_PROMISE',
        }),
      ],
    });
    const facts = {
      episodes: [
        permit('2017-12-01', {
          route,
          role: 'DEPENDANT',
          dependantOf: 'PARTNER',
        }),
      ],
      absences: [
        { from: '2021-12-01', to: '2022-02-28' },
        { from: '2022-04-01', to: '2022-07-15' },
      ],
    };
    expect(current(principal, '2026-01-01').earliestDate).toBe('2026-08-01');
    const projected = current(facts, '2026-01-01', principal);
    expect(projected.earliestDate).toBe('2026-11-19');
    expect(current(facts, '2026-08-01', principal).outcome).toBe(
      'LIKELY_NOT_ELIGIBLE',
    );
    expect(current(facts, '2026-11-18', principal).outcome).toBe(
      'LIKELY_NOT_ELIGIBLE',
    );
    expect(current(facts, projected.earliestDate!, principal).outcome).toBe(
      'LIKELY_ELIGIBLE',
    );
    const principalAbroad = {
      ...principal,
      absences: [{ from: '2025-12-31', to: '2026-01-02' }],
    };
    const fromAbroad = current(facts, '2026-01-01', principalAbroad);
    expect(fromAbroad.earliestDate).toBe('2026-11-19');
    expect(
      current(facts, fromAbroad.earliestDate!, principalAbroad).outcome,
    ).toBe('LIKELY_ELIGIBLE');
  },
);

test('review33a-1 #2 and review33a-2 #2 BN(O) relatives find a joint date even when the principal is abroad now', () => {
  const principal = timeline({
    episodes: [permit('2021-11-24', { route: 'HONG_KONG_BNO' })],
    absences: [{ from: '2026-11-01', to: '2026-11-10' }],
  });
  const facts = {
    episodes: [
      permit('2021-12-02', {
        route: 'HONG_KONG_BNO',
        role: 'DEPENDANT',
        dependantOf: 'RELATIVE',
      }),
    ],
    absences: [{ from: '2026-11-10', to: '2026-11-15' }],
  };
  const whileAbroad = current(principal, '2026-11-04');
  expect(whileAbroad.outcome).toBe('LIKELY_NOT_ELIGIBLE');
  expect(
    whileAbroad.rules.find((r) => r.id === 'CL-HKBNO-RESIDENCE-5Y')?.status,
  ).toBe('FAIL');
  for (const date of ['2026-10-25', '2026-11-04']) {
    const projected = current(facts, date, principal);
    expect(projected.earliestDate).toBe('2026-11-15');
    expect(projected.decidedBy).toContain('CL-HKBNO-DEPENDANT');
    expect(current(facts, projected.earliestDate!, principal).outcome).toBe(
      'LIKELY_ELIGIBLE',
    );
  }
  expect(current(facts, '2026-11-14', principal).outcome).toBe(
    'LIKELY_NOT_ELIGIBLE',
  );
  expect(current(facts, '2026-11-16', principal).outcome).toBe(
    'LIKELY_ELIGIBLE',
  );
});

test.each<{ episode: ImmigrationEpisode; source: string }>([
  {
    episode: permit('2021-11-24', { route: 'HONG_KONG_BNO' }),
    source: 'HK 55.2(e)',
  },
  {
    episode: permit('2023-11-24', {
      route: 'GLOBAL_TALENT',
      globalTalentEndorsement: 'RESEARCH_BODY',
    }),
    source: 'GT 8.2(d)',
  },
  {
    episode: permit('2023-11-24', {
      route: 'INNOVATOR_FOUNDER',
      innovatorSettlementCriteria: ['INVESTMENT', 'REVENUE'],
    }),
    source: 'INNF 15.2(d)',
  },
  {
    episode: permit('2016-11-24', {
      route: 'FAMILY_PARTNER_OR_PARENT',
      familyPermission: 'PARTNER_TEN_YEAR',
    }),
    source: 'SETF 1.2(d)',
  },
  {
    episode: permit('2016-11-24', {
      route: 'FAMILY_AND_PRIVATE_LIFE',
      privateLifeRoute: 'ADULT',
    }),
    source: 'PL 11.2(d)',
  },
])(
  'review33a-1 #3 $source checks the actual and projected filing dates',
  ({ episode, source }) => {
    const facts = {
      ...timeline({
        episodes: [episode],
        relationships: [
          ...family('2016-11-24', 'PARTNER_TEN_YEAR').relationships,
        ],
      }),
    };
    const abroad = {
      ...facts,
      absences: [{ from: '2026-11-01', to: '2026-11-10' }],
    };
    const onApplication = current(abroad, '2026-11-04');
    expect(current(facts, '2026-11-04').outcome).toBe('LIKELY_ELIGIBLE');
    expect(onApplication.outcome).toBe('LIKELY_NOT_ELIGIBLE');
    expect(onApplication.rules[0]).toMatchObject({
      id: 'CL-SCOPE',
      status: 'FAIL',
      sources: [{ locator: source }],
    });
    expect(current(abroad, '2026-11-01').outcome).toBe(
      'INSUFFICIENT_INFORMATION',
    );
    expect(current(abroad, '2026-11-10').outcome).toBe('LIKELY_ELIGIBLE');

    const futureTrip = {
      ...facts,
      absences: [{ from: '2026-10-26', to: '2026-11-10' }],
    };
    const projected = current(futureTrip, '2026-10-25');
    expect(projected.earliestDate).toBe('2026-11-10');
    expect(current(futureTrip, projected.earliestDate!).outcome).toBe(
      'LIKELY_ELIGIBLE',
    );
  },
);

test('A3#6 and review33a-1 #4 Long Residence keeps a new departure on the cutoff in the rolling window', () => {
  const episodes = [
    permit('2016-11-04', { route: 'STUDENT', validTo: '2036-11-04' }),
  ];
  const older = { from: '2024-04-10', to: '2024-04-11' };
  const rolling = { from: '2024-04-11', to: '2024-10-10' };
  const facts = { episodes, absences: [older, rolling] };
  expect(current(facts, '2026-11-04').outcome).not.toBe('LIKELY_ELIGIBLE');
  expect(run(clLrResidence10Y, facts).status).toBe('FAIL');
  const projected = longResidence({
    timeline: timeline(facts),
    simulationDate: '2026-11-04',
  });
  expect(projected?.applicationDate).toBe('2034-09-13');
  expect(current(facts, projected!.applicationDate!).outcome).toBe(
    'LIKELY_ELIGIBLE',
  );
  expect(
    current(
      { episodes, absences: [{ from: older.from, to: rolling.to }] },
      '2026-11-04',
    ).outcome,
  ).toBe('LIKELY_ELIGIBLE');
});

test('review33a-2 #1 Long Residence checks permission at every return and later departure', () => {
  const facts = {
    episodes: [
      permit('2015-11-04', { route: 'STUDENT', validTo: '2019-06-01' }),
      permit('2019-06-10', { route: 'STUDENT' }),
    ],
    absences: [
      { from: '2019-05-01', to: '2019-06-05' },
      { from: '2019-06-05', to: '2019-07-01' },
    ],
  };
  expect(current(facts, '2026-11-04').outcome).not.toBe('LIKELY_ELIGIBLE');
  const projected = longResidence({
    timeline: timeline(facts),
    simulationDate: '2026-11-04',
  });
  expect(projected).toMatchObject({
    start: '2019-06-10',
    applicationDate: '2029-05-13',
    deductedDays: 0,
  });
  expect(current(facts, projected!.applicationDate!).outcome).toBe(
    'LIKELY_ELIGIBLE',
  );
  expect(
    current(
      { ...facts, absences: [{ from: '2019-05-01', to: '2019-07-01' }] },
      '2026-11-04',
    ).outcome,
  ).toBe('LIKELY_ELIGIBLE');
});

test('review33a-2 #1 Long Residence applies the single-absence limit to each of two 101-day trips', () => {
  const from = '2019-01-01';
  const returnAndDepart = addDays(from, 100);
  const to = addDays(returnAndDepart, 100);
  const episodes = [permit('2016-11-04', { route: 'STUDENT' })];
  const trips = [
    { from, to: returnAndDepart },
    { from: returnAndDepart, to },
  ];
  const facts = { episodes, absences: trips };
  expect(current(facts, '2026-11-04')).toMatchObject({
    outcome: 'LIKELY_ELIGIBLE',
    earliestDate: '2026-11-04',
  });
  const total548 = [
    ...trips,
    { from: '2017-01-01', to: addDays('2017-01-01', 173) },
    { from: '2021-01-01', to: addDays('2021-01-01', 172) },
  ];
  expect(current({ episodes, absences: total548 }, '2026-11-04').outcome).toBe(
    'LIKELY_ELIGIBLE',
  );
  expect(
    current({ episodes, absences: [{ from, to }] }, '2026-11-04').outcome,
  ).not.toBe('LIKELY_ELIGIBLE');
});

test('review33a-2 #3 BN(O) can rely on section 3C only for a valid in-time filing still pending at completion', () => {
  const { timeline: facts } = goldenCases.find(
    (c) => c.id === 'G-HKBNO-ONE-MONTH-SHORT',
  )!.request;
  const before = current(facts, '2026-11-01');
  expect(before).toMatchObject({
    outcome: 'LIKELY_NOT_ELIGIBLE',
    earliestDate: '2026-11-03',
    pathwayYears: 5,
  });
  expect(before.assumptions).toContainEqual(
    expect.stringContaining('Immigration Act 1971 section 3C'),
  );
  for (const filing of [before.earliestDate!, '2026-11-30']) {
    const a = current(facts, filing);
    expect(a).toMatchObject({
      outcome: 'LIKELY_ELIGIBLE',
      earliestDate: filing,
      pathwayYears: 5,
    });
    expect(a.rules.find((r) => r.id === 'CL-HKBNO-RESIDENCE-5Y')?.status).toBe(
      'PASS',
    );
  }
  expect(current(facts, '2026-12-01').outcome).toBe('INSUFFICIENT_INFORMATION');
  const postExpiryTravel = {
    ...facts,
    absences: [{ from: '2026-12-01', to: '2026-12-02' }],
  };
  const gap = {
    ...facts,
    episodes: [
      ...facts.episodes,
      permit('2026-12-02', { route: 'HONG_KONG_BNO' }),
    ],
  };
  const switchOfRoute = {
    ...facts,
    episodes: [...facts.episodes, permit('2026-12-01', { route: 'STUDENT' })],
  };
  for (const recorded of [postExpiryTravel, gap, switchOfRoute]) {
    const a = current(recorded, '2026-11-03');
    expect(a.rules.find((r) => r.id === 'CL-HKBNO-RESIDENCE-5Y')?.status).toBe(
      'FAIL',
    );
    expect(a.assumptions).not.toContainEqual(
      expect.stringContaining('section 3C'),
    );
  }
});

test('A1#9 and A6#2 an ordinary one-day permission gap restarts Skilled Worker residence', () => {
  for (const [started, expired, renewed, applied, earliestDate] of [
    ['2021-11-04', '2023-10-30', '2023-11-01', '2026-11-04', '2028-10-04'],
    ['2021-06-01', '2024-05-30', '2024-06-01', '2026-06-01', '2029-05-04'],
  ]) {
    const episodes = [permit(started, { validTo: expired }), permit(renewed)];
    const a = current({ episodes }, applied);
    expect(a).toMatchObject({ outcome: 'LIKELY_NOT_ELIGIBLE', earliestDate });
    expect(a.assumptions.some((text) => text.includes('CR 4.1(d)(i)'))).toBe(
      true,
    );
  }
});

test('A3#5 Long Residence breaks at an ordinary gap and deducts a 27-day eligible overseas gap', () => {
  const student = (from: string, to?: string) =>
    permit(from, { route: 'STUDENT', ...(to && { validTo: to }) });
  const ordinary = {
    episodes: [student('2016-11-04', '2021-10-30'), student('2021-11-01')],
  };
  expect(run(clLrResidence10Y, ordinary).status).toBe('FAIL');
  const overseas = timeline({
    episodes: [student('2014-11-04', '2018-03-01'), student('2018-03-29')],
    absences: [{ from: '2018-02-20', to: '2018-03-31' }],
  });
  expect(run(clLrResidence10Y, overseas).status).toBe('PASS');
  expect(
    longResidence({ timeline: overseas, simulationDate: '2024-11-02' }),
  ).toMatchObject({
    deductedDays: 27,
    completion: '2024-12-01',
    applicationDate: '2024-11-03',
  });
  expect(
    run(clLrResidence10Y, {
      ...overseas,
      absences: [{ from: '2018-02-20', to: '2019-03-31' }],
    }).status,
  ).toBe('FAIL');
});

test('A6#2 CR 4.3 counts the August grace period only with prior permission and UK presence', () => {
  const episodes = [
    permit('2019-11-04', { validTo: '2020-07-31' }),
    permit('2020-09-01'),
  ];
  expect(run(clSwResidence5Y, { episodes }, '2024-10-07').status).toBe('PASS');
  expect(
    run(
      clSwResidence5Y,
      { episodes: [{ ...episodes[0], validTo: '2020-08-15' }, episodes[1]] },
      '2024-10-07',
    ).status,
  ).toBe('PASS');
  expect(
    run(
      clSwResidence5Y,
      {
        episodes,
        absences: [{ from: '2020-07-29', to: '2020-08-08' }],
      },
      '2024-10-07',
    ).status,
  ).toBe('FAIL');
});

test('A1#8 an old trip outside the five-year period does not reset the period after the later trip', () => {
  const a = current(
    {
      episodes: [permit('2021-01-01')],
      absences: [
        { from: '2021-02-01', to: '2021-05-10' },
        { from: '2021-09-01', to: '2021-12-09' },
      ],
    },
    '2026-06-01',
  );
  expect(a).toMatchObject({
    outcome: 'LIKELY_ELIGIBLE',
    earliestDate: '2026-06-01',
  });
  expect(a.rules.find((r) => r.id === 'CL-SW-RESIDENCE-5Y')?.status).toBe(
    'PASS',
  );
});

test('A3#6 Long Residence counts old absences only within the selected ten years', () => {
  const episodes = [permit('2014-11-04', { route: 'STUDENT' })];
  const absences = [2015, 2018, 2020, 2022].map((year) => {
    const from = `${year}-01-03`;
    return { from, to: addDays(from, 149) };
  });
  expect(current({ episodes, absences }, '2026-11-04')).toMatchObject({
    outcome: 'LIKELY_ELIGIBLE',
    pathwayYears: 10,
  });
});

test('A3#6 the crossing trip counts only its pre-cutoff days towards 548, and keeps the 184-day cap', () => {
  const episodes = [permit('2016-11-04', { route: 'STUDENT' })];
  const historic = ['2017-01-01', '2019-01-01', '2021-01-01'].map((from) => ({
    from,
    to: addDays(from, 179),
  }));
  const cross = { from: '2024-04-03', to: '2024-04-24' };
  expect(
    run(clLrResidence10Y, { episodes, absences: [...historic, cross] }).status,
  ).toBe('PASS');
  expect(
    run(clLrResidence10Y, {
      episodes,
      absences: [...historic, { ...cross, from: '2024-04-02' }],
    }).status,
  ).toBe('FAIL');
  const crossing = { from: '2024-04-10', to: addDays('2024-04-10', 183) };
  expect(run(clLrResidence10Y, { episodes, absences: [crossing] }).status).toBe(
    'PASS',
  );
  expect(
    run(clLrResidence10Y, {
      episodes,
      absences: [{ ...crossing, to: addDays(crossing.to, 1) }],
    }).status,
  ).toBe('FAIL');
  expect(
    run(clLrResidence10Y, {
      episodes,
      absences: [{ ...crossing, from: '2024-04-11' }],
    }).status,
  ).toBe('FAIL');
});

test('A3#3 CR 3.2 UK Ancestry fixed periods follow the actual application anniversary', () => {
  const absences = [
    { from: '2021-11-01', to: '2022-02-15' },
    { from: '2022-03-15', to: '2022-06-30' },
  ];
  const old = permit('2016-03-01', { route: 'UK_ANCESTRY' });
  expect(
    run(clAncestryResidence5Y, { episodes: [old], absences }, '2026-03-01')
      .status,
  ).toBe('PASS');
  expect(
    run(
      clAncestryResidence5Y,
      {
        episodes: [
          { ...old, validTo: '2021-02-01' },
          { ...old, validFrom: '2021-02-02' },
        ],
        absences,
      },
      '2026-03-01',
    ).status,
  ).toBe('FAIL');
});

test('A6#3 old Tier 2 permission uses fixed periods and overlapping dates count once', () => {
  const old = permit('2017-12-01');
  const absences = [
    { from: '2021-12-01', to: '2022-02-28' },
    { from: '2022-04-01', to: '2022-07-15' },
  ];
  expect(
    run(clSwResidence5Y, { episodes: [old], absences }, '2026-01-01').status,
  ).toBe('PASS');
  const trip = { from: '2024-01-01', to: '2024-04-04' };
  expect(
    run(clSwResidence5Y, {
      absences: [trip, trip, { from: '2024-01-05', to: '2024-03-01' }],
    }).status,
  ).toBe('PASS');
});

test('A4#1 the reform rolling peak can fall before the trip ends', () => {
  const result = run(
    esResidence,
    {
      episodes: [permit('2020-01-01')],
      absences: [
        { from: '2024-02-29', to: '2024-03-01' },
        { from: '2024-09-03', to: '2025-03-01' },
      ],
    },
    '2030-01-01',
  );
  expect(result.explanation).toContain('自 2025-03-02 起');
});

test('A1#12 Skilled Worker main and partner fail abroad but can file on return', () => {
  const principal = timeline({ episodes: [permit('2021-11-04')] });
  const dependant = permit('2021-11-04', {
    role: 'DEPENDANT',
    dependantOf: 'PARTNER',
  });
  for (const episodes of [principal.episodes, [dependant]]) {
    const abroad = [{ from: '2026-11-01', to: '2026-11-10' }];
    const a = current({ episodes, absences: abroad }, '2026-11-04', principal);
    expect(a.outcome).toBe('LIKELY_NOT_ELIGIBLE');
    expect(a.rules[0]).toMatchObject({ id: 'CL-SCOPE', status: 'FAIL' });
    expect(a.earliestDate).toBe('2026-11-10');
    expect(
      current({ episodes, absences: abroad }, '2026-11-01', principal).outcome,
    ).toBe('INSUFFICIENT_INFORMATION');
    expect(
      current({ episodes, absences: abroad }, a.earliestDate!, principal)
        .outcome,
    ).toBe('LIKELY_ELIGIBLE');
  }
});

test('A2#2 and review33a-2 #4 five-year Appendix FM finds the first filing date in the UK and states the partner assumption', () => {
  const { episodes, relationships } = family('2021-11-04', 'PARTNER_FIVE_YEAR');
  const facts = { episodes, relationships: [...relationships] };
  const absences = [{ from: '2026-11-01', to: '2026-11-10' }];
  const abroad = { ...facts, absences };
  const projected = current(abroad, '2026-10-25');
  expect(projected.earliestDate).toBe('2026-11-10');
  expect(projected.decidedBy).toContain('CL-FAMILY-RESIDENCE');
  expect(current(abroad, '2026-11-04').outcome).toBe('LIKELY_NOT_ELIGIBLE');
  expect(current(abroad, '2026-11-01').rules[0].status).toBe('UNKNOWN');
  expect(current(abroad, projected.earliestDate!).outcome).toBe(
    'LIKELY_ELIGIBLE',
  );
  expect(current(abroad, '2026-11-11').outcome).toBe('LIKELY_ELIGIBLE');
  expect(current(facts, '2026-11-03').outcome).toBe('LIKELY_NOT_ELIGIBLE');
  const noSponsorTravelHistory = current(facts, '2026-11-04');
  expect(noSponsorTravelHistory.outcome).toBe('LIKELY_ELIGIBLE');
  expect(
    noSponsorTravelHistory.rules.find((r) => r.id === 'CL-FAMILY-RELATIONSHIP')
      ?.status,
  ).toBe('PASS');
  expect(noSponsorTravelHistory.assumptions).toContain(
    '假设申请日你的伴侣也在英国（Appendix FM R-ILRP.1.1(a)）。',
  );
  const english = evaluate({
    timeline: timeline(facts),
    simulationDate: '2026-11-04',
    locale: 'en',
  }).byRuleSet['current-law-2026-11']!;
  expect(english.assumptions).toContain(
    'This assumes your partner is also in the UK on the date you apply (Appendix FM R-ILRP.1.1(a)).',
  );
});

test.each([
  ['HONG_KONG_BNO', 'CL-HKBNO-DEPENDANT', '2021-12-02'],
  ['SKILLED_WORKER', 'CL-SW-CHILD', '2021-12-02'],
  ['GLOBAL_TALENT', 'CL-GT-DEPENDANT', '2023-12-02'],
  ['FAMILY_PARTNER_OR_PARENT', 'CL-FAMILY-CHILD', '2016-12-02'],
] as const)(
  'review33a-3 #1 %s child can file on return before switching to Student',
  (route, rule, from) => {
    const principal = timeline({
      episodes: [
        permit(from, {
          route,
          globalTalentEndorsement: 'RESEARCH_BODY',
          familyPermission: 'PARTNER_TEN_YEAR',
        }),
      ],
      relationships: [...family(from, 'PARTNER_TEN_YEAR').relationships],
    });
    const facts = {
      dateOfBirth: '2015-01-01',
      episodes: [
        permit('2024-01-01', {
          route,
          role: 'DEPENDANT',
          dependantOf: 'PARENT',
          validTo: '2026-11-04',
        }),
        permit('2026-11-05', { route: 'STUDENT', validTo: '2040-01-01' }),
      ],
      absences: [{ from: '2026-02-01', to: '2026-11-04' }],
    };
    const projected = current(facts, '2026-11-01', principal);
    expect(projected.earliestDate).toBe('2026-11-04');
    expect(projected.decidedBy).toContain(rule);
    expect(current(facts, '2026-11-03', principal).outcome).toBe(
      'LIKELY_NOT_ELIGIBLE',
    );
    const filed = current(facts, projected.earliestDate!, principal);
    expect(filed.outcome).toBe('LIKELY_ELIGIBLE');
    expect(filed.decidedBy).toContain(rule);
    expect(
      current(facts, '2026-11-05', principal).rules.map((r) => r.id),
    ).not.toContain(rule);
  },
);

test('review33a-3 #2 BN(O) departure-day uncertainty preserves a later joint return date', () => {
  const principal = timeline({
    episodes: [permit('2021-11-24', { route: 'HONG_KONG_BNO' })],
    absences: [{ from: '2026-11-01', to: '2026-11-10' }],
  });
  const facts = {
    episodes: [
      permit('2021-12-02', {
        route: 'HONG_KONG_BNO',
        role: 'DEPENDANT',
        dependantOf: 'RELATIVE',
      }),
    ],
    absences: [{ from: '2026-11-10', to: '2026-11-15' }],
  };
  const departing = current(principal, '2026-11-01');
  expect(departing.rules[0].status).toBe('UNKNOWN');
  expect(departing).toMatchObject({
    outcome: 'INSUFFICIENT_INFORMATION',
    earliestDate: '2026-11-10',
  });
  const projected = current(facts, '2026-11-01', principal);
  expect(projected.earliestDate).toBe('2026-11-15');
  expect(projected.decidedBy).toContain('CL-HKBNO-DEPENDANT');
  expect(current(facts, '2026-11-14', principal).outcome).toBe(
    'LIKELY_NOT_ELIGIBLE',
  );
  const filed = current(facts, projected.earliestDate!, principal);
  expect(filed.outcome).toBe('LIKELY_ELIGIBLE');
  expect(filed.decidedBy).toContain('CL-HKBNO-DEPENDANT');
  const noReturn = { ...principal, absences: [{ from: '2026-11-01', to: '' }] };
  expect(current(facts, '2026-11-01', noReturn).earliestDate).toBeUndefined();
  expect(
    current(facts, '2026-11-01', { ...principal, english: undefined })
      .earliestDate,
  ).toBeUndefined();
});

test.each(['RELATIVE', 'PARENT'] as const)(
  'review33a-3 #3 BN(O) %s discloses the principal’s section 3C condition for the joint filing',
  (dependantOf) => {
    const principal = goldenCases.find(
      (c) => c.id === 'G-HKBNO-ONE-MONTH-SHORT',
    )!.request.timeline;
    const facts = timeline({
      dateOfBirth: dependantOf === 'PARENT' ? '2015-01-01' : '1990-01-01',
      episodes: [
        permit('2021-12-01', {
          route: 'HONG_KONG_BNO',
          role: 'DEPENDANT',
          dependantOf,
          validTo: '2026-11-30',
        }),
      ],
    });
    const date = current(facts, '2026-11-01', principal).earliestDate;
    expect(date).toBe('2026-11-03');
    expect(current(facts, '2026-11-02', principal).outcome).toBe(
      'LIKELY_NOT_ELIGIBLE',
    );
    for (const simulationDate of ['2026-11-01', date!]) {
      for (const locale of ['zh-CN', 'en'] as const) {
        const a = evaluate({
          timeline: facts,
          principal,
          simulationDate,
          locale,
        }).byRuleSet['current-law-2026-11']!;
        expect(a.decidedBy).toContain('CL-HKBNO-DEPENDANT');
        expect(a.outcome).toBe(
          simulationDate === date ? 'LIKELY_ELIGIBLE' : 'LIKELY_NOT_ELIGIBLE',
        );
        const assumption = a.assumptions.find(
          (line) =>
            line.includes('section 3C') &&
            (locale === 'en' ? /principal applicant/i : /主申请人/).test(line),
        );
        expect(assumption).toContain('2026-12-01');
        expect(assumption).toMatch(locale === 'en' ? /pending/ : /待决定/);
        expect(assumption).toMatch(
          locale === 'en' ? /not withdrawn/ : /未撤回/,
        );
      }
    }
    const coveredPrincipal = {
      ...principal,
      episodes: [{ ...principal.episodes[0], validTo: '2026-12-01' }],
    };
    const covered = current(facts, date!, coveredPrincipal);
    expect(covered.outcome).toBe('LIKELY_ELIGIBLE');
    expect(
      covered.assumptions.some(
        (line) => line.includes('section 3C') && line.includes('主申请人'),
      ),
    ).toBe(false);
  },
);

test('review33a-3 #4 overlapping grants keep the intervening Student period in the Skilled Worker calculation', () => {
  const facts = {
    episodes: [
      permit('2021-06-01', { validTo: '2026-07-01' }),
      permit('2026-05-16', { route: 'STUDENT', validTo: '2026-05-31' }),
      permit('2026-05-30'),
    ],
  };
  const projected = current(facts, '2026-05-04');
  expect(projected.outcome).toBe('LIKELY_NOT_ELIGIBLE');
  expect(
    projected.rules.find((r) => r.id === 'CL-SW-RESIDENCE-5Y')?.status,
  ).toBe('FAIL');
  expect(projected.earliestDate).toBe('2031-05-02');
  expect(current(facts, '2031-05-01').outcome).toBe('LIKELY_NOT_ELIGIBLE');
  const filed = current(facts, projected.earliestDate!);
  expect(filed.outcome).toBe('LIKELY_ELIGIBLE');
  expect(filed.decidedBy).toContain('CL-SW-RESIDENCE-5Y');
  // The older grant resumes once a nested grant expires, under episodeOn.
  const nested = { episodes: [permit('2021-06-01'), facts.episodes[1]] };
  expect(current(nested, '2026-06-01').earliestDate).toBe('2031-05-04');
  const resumed = current(nested, '2031-05-04');
  expect(resumed.outcome).toBe('LIKELY_ELIGIBLE');
  expect(resumed.decidedBy).toContain('CL-SW-RESIDENCE-5Y');
});

test('review33a-3 #5 five-year Appendix FM continues past a return in a permission gap', () => {
  const { episodes, relationships } = family('2021-11-04', 'PARTNER_FIVE_YEAR');
  const facts = {
    episodes: [
      { ...episodes[0], validTo: '2026-11-08' },
      { ...episodes[0], validFrom: '2026-11-12' },
    ],
    relationships: [...relationships],
    absences: [{ from: '2026-11-01', to: '2026-11-10' }],
    cashSavings: 100000,
  };
  const projected = current(facts, '2026-10-25');
  expect(projected.earliestDate).toBe('2031-11-12');
  expect(projected.decidedBy).toContain('CL-FAMILY-RESIDENCE');
  expect(projected.assumptions).toContainEqual(
    expect.stringContaining('自 2026-11-12 起持续居留'),
  );
  expect(current(facts, '2031-11-11').outcome).toBe('LIKELY_NOT_ELIGIBLE');
  const filed = current(facts, projected.earliestDate!);
  expect(filed.outcome).toBe('LIKELY_ELIGIBLE');
  expect(filed.decidedBy).toContain('CL-FAMILY-RESIDENCE');
});
