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

test('A6#1 UK Ancestry can refer back to the last UK Ancestry expiry after changing routes', () => {
  const episodes = [
    permit('2019-06-01', { route: 'UK_ANCESTRY', validTo: '2024-06-01' }),
    permit('2024-06-02', { route: 'STUDENT' }),
  ];
  const a = current({ episodes }, '2026-11-04');
  expect(a).toMatchObject({
    outcome: 'LIKELY_ELIGIBLE',
    earliestDate: '2026-11-04',
  });
  expect(a.rules.find((r) => r.id === 'CL-ANCESTRY-RESIDENCE-5Y')?.status).toBe(
    'PASS',
  );
  expect(
    a.assumptions.some(
      (text) => text.includes('2024-06-01') && text.includes('CR 1.1'),
    ),
  ).toBe(true);
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

test('A1#12 Skilled Worker main and partner fail abroad and are unknown on travel days', () => {
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
    expect(a.earliestDate).toBeUndefined();
    expect(
      current({ episodes, absences: abroad }, '2026-11-10', principal).outcome,
    ).toBe('INSUFFICIENT_INFORMATION');
  }
});

test('A2#2 five-year Appendix FM checks applicant presence and states the partner assumption', () => {
  const { episodes, relationships } = family('2021-11-04', 'PARTNER_FIVE_YEAR');
  const facts = { episodes, relationships: [...relationships] };
  const absences = [{ from: '2026-11-01', to: '2026-11-10' }];
  expect(current({ ...facts, absences }, '2026-11-04').outcome).toBe(
    'LIKELY_NOT_ELIGIBLE',
  );
  expect(current({ ...facts, absences }, '2026-11-10').rules[0].status).toBe(
    'UNKNOWN',
  );
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
