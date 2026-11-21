import { expect, test } from 'vitest';
import { evaluate } from '../src/evaluate';
import {
  clEnglish,
  clFamilyResidence,
  clKol,
  clSwGoingRate,
  clSwResidence5Y,
  clSwSalary,
} from '../src/rules/current-law';
import type { ImmigrationEpisode, PersonTimeline } from '../src/types';
import { run, SIMULATION_DATE, timeline } from './helpers';

function permit(extra: Partial<ImmigrationEpisode> = {}): ImmigrationEpisode {
  return {
    route: 'SKILLED_WORKER',
    role: 'MAIN',
    validFrom: '2021-10-01',
    validTo: '2032-01-01',
    socCode: '2136',
    salary: 60000,
    ...extra,
  };
}

function current(
  overrides: Partial<PersonTimeline>,
  simulationDate = SIMULATION_DATE,
  principal?: PersonTimeline,
) {
  return evaluate({
    timeline: timeline(overrides),
    principal,
    simulationDate,
    locale: 'en',
  }).byRuleSet['current-law-2026-11']!;
}

test('A1#2 ISL uses the latest permission CoS, excluding the removal date and unconfirmed job criteria', () => {
  const latest = permit({
    validFrom: '2027-01-01',
    socCode: '2112',
    salary: 41000,
  });
  const previous = permit({ validTo: '2026-12-30', route: 'GLOBAL_TALENT' });
  const options = (sponsorshipCertificateDate?: string, socCode = '2112') => ({
    episodes: [previous, { ...latest, sponsorshipCertificateDate, socCode }],
  });
  const filing = '2027-01-01';
  expect(run(clSwSalary, options('2026-12-30'), filing)).toMatchObject({
    status: 'PASS',
    explanation: expect.stringContaining('row B'),
  });
  expect(run(clSwGoingRate, options('2026-12-30'), filing).status).toBe('PASS');
  expect(run(clSwSalary, options('2026-12-31'), filing).status).toBe('FAIL');
  expect(run(clSwSalary, options(), filing).status).toBe('UNKNOWN');
  expect(run(clSwSalary, options('2026-12-30', '2111'), filing).status).toBe(
    'UNKNOWN',
  );
});

test('A1#3 Health and Care ASHE explains the sponsorship, employment or service assumption', () => {
  const facts = {
    episodes: [
      permit({
        socCode: '2114',
        salary: 48000,
        validFrom: '2024-08-01',
        sponsorshipCertificateDate: '2024-07-20',
      }),
    ],
  };
  const result = run(clSwGoingRate, facts);
  expect(result.status).toBe('PASS');
  expect(run(clSwSalary, facts).assumptions?.join(' ')).toContain(
    'SW A1.1(a)–(m)',
  );
});

test('A1#4 a permission starting after the change may have been granted under the old rules', () => {
  const first = permit({ validFrom: '2024-04-10', salary: 35000 });
  const filing = '2029-04-10';
  const facts = (sponsorshipCertificateDate?: string) => ({
    episodes: [{ ...first, sponsorshipCertificateDate }],
  });
  expect(run(clSwSalary, facts('2024-04-03'), filing)).toMatchObject({
    status: 'PASS',
    explanation: expect.stringContaining('row C'),
  });
  expect(run(clSwGoingRate, facts('2024-04-03'), filing).status).toBe('PASS');
  expect(run(clSwSalary, facts(), filing).status).toBe('UNKNOWN');
  expect(run(clSwGoingRate, facts(), filing).status).toBe('UNKNOWN');
  expect(run(clSwSalary, facts('2024-04-04'), filing).status).toBe('FAIL');
  expect(run(clSwSalary, facts('2024-04-03'), '2030-04-04').status).toBe(
    'FAIL',
  );
});

test.each([
  ['1a', '5235', 'OPTION_D', true],
  ['2aa', '6135', 'OPTION_I', true],
  ['1a', '3131', 'TEMPORARY_SHORTAGE_LIST', false],
] as const)(
  'A1#5 Table %s accepts %s with %s on the recent sponsorship',
  (table, socCode, exception, isl) => {
    const latest = permit({
      validFrom: '2026-01-01',
      sponsorshipCertificateDate: '2025-12-15',
      socCode,
      salary: isl ? 35000 : 42000,
      immigrationSalaryList: isl,
      skilledWorkerSponsorshipException: exception,
    });
    const facts = {
      episodes: [
        permit({
          route: 'GLOBAL_TALENT',
          validFrom: '2021-01-01',
          validTo: '2025-12-31',
        }),
        latest,
      ],
    };
    expect(run(clSwGoingRate, facts)).toMatchObject({
      status: 'PASS',
      explanation: expect.stringContaining(`Table ${table}:`),
    });
    if (exception === 'OPTION_D') {
      expect(
        run(clSwGoingRate, {
          episodes: [
            { ...latest, skilledWorkerSponsorshipException: undefined },
          ],
        }).status,
      ).toBe('PASS');
    }
  },
);

test('A1#6 an England salaried GP uses a directly listed Table 3 rate, while a nurse needs a pay band', () => {
  const gp = permit({ socCode: '2211', salary: 75000 });
  expect(run(clSwSalary, { episodes: [gp] }).status).toBe('PASS');
  expect(run(clSwGoingRate, { episodes: [gp] })).toMatchObject({
    status: 'UNKNOWN',
    explanation: expect.stringContaining('Table 3 按岗位、地区和薪级列出金额'),
  });
  expect(
    run(clSwGoingRate, { episodes: [{ ...gp, socCode: '2231' }] }).explanation,
  ).toContain('薪级须查 Table 4 / 5');
});

const settled = timeline({
  settled: { date: '2026-06-01', route: 'SKILLED_WORKER' },
});

const partner = (extra: Partial<ImmigrationEpisode> = {}) =>
  permit({ role: 'DEPENDANT', dependantOf: 'PARTNER', ...extra });

test('A1#13 child permission does not count for a partner and missing history stays unknown', () => {
  const later = partner({ validFrom: '2024-11-01' });
  const older = partner({
    validFrom: '2021-11-01',
    validTo: '2024-10-31',
    dependantOf: 'PARENT',
  });
  const childHistory = current(
    { episodes: [older, later] },
    SIMULATION_DATE,
    settled,
  );
  expect(childHistory).toMatchObject({
    outcome: 'LIKELY_NOT_ELIGIBLE',
    pathwayYears: 5,
    earliestDate: '2029-10-04',
  });
  const missing = current(
    { episodes: [{ ...older, dependantOf: undefined }, later] },
    SIMULATION_DATE,
    settled,
  );
  expect(
    missing.rules.find((rule) => rule.id === 'CL-SW-PARTNER-5Y')?.status,
  ).toBe('UNKNOWN');
});

test('A1#16 the dependant B2 threshold cites APP SW8 across physical pages 24 and 25', () => {
  const facts = {
    episodes: [partner()],
    english: { cefrLevel: 'B1' as const },
  };
  expect(run(clEnglish, facts, '2027-03-25').status).toBe('PASS');
  const result = run(clEnglish, facts, '2027-03-26');
  expect(result.status).toBe('FAIL');
  expect(result.sources).toContainEqual({
    srcId: 'SRC-007',
    locator: 'pp24–25, APP SW8',
  });
});

test('A1#17 travel endpoints are excluded at 179, 180 and 181 whole days abroad', () => {
  for (const [to, status] of [
    ['2023-06-30', 'PASS'],
    ['2023-07-01', 'PASS'],
    ['2023-07-02', 'FAIL'],
  ]) {
    const result = run(clSwResidence5Y, {
      episodes: [permit()],
      absences: [{ from: '2023-01-01', to }],
    });
    expect(result.status).toBe(status);
  }
});

const family = (extra: Partial<ImmigrationEpisode> = {}) =>
  permit({
    route: 'FAMILY_PARTNER_OR_PARENT',
    familyPermission: 'PARTNER_TEN_YEAR',
    ...extra,
  });

test('A2#4 CR 3.6 disregards a historic absence following a further qualifying grant', () => {
  const absence = { from: '2019-01-01', to: '2019-08-01' };
  const first = family({ validFrom: '2016-11-04' });
  expect(
    run(clFamilyResidence, { episodes: [first], absences: [absence] }).status,
  ).toBe('FAIL');
  const afterGrant = run(clFamilyResidence, {
    episodes: [
      { ...first, validTo: '2020-04-30' },
      family({ validFrom: '2020-05-01' }),
    ],
    absences: [absence],
  });
  expect(afterGrant.status).toBe('PASS');
  expect(afterGrant.sources).toContainEqual({
    srcId: 'SRC-008',
    locator: 'CR 3.6',
  });
});

test('A2#9 qualifying nationality satisfies KoLL and independent Long Residence English', () => {
  const facts = { nationality: 'CAN', english: undefined };
  const appendixFm = current({
    ...facts,
    episodes: [
      family({
        validFrom: '2020-06-01',
        familyPermission: 'PARTNER_FIVE_YEAR',
      }),
    ],
    relationships: [{ type: 'PARTNER', otherPartyStatus: 'SETTLED' }],
  });
  expect(appendixFm).toMatchObject({
    outcome: 'LIKELY_ELIGIBLE',
    pathwayYears: 5,
  });
  expect(
    appendixFm.rules.find((rule) => rule.id === 'CL-ENGLISH')?.explanation,
  ).toContain('KoLL 2.2(a)(i)');
  const longResidence = current({
    ...facts,
    episodes: [
      permit({
        route: 'STUDENT',
        validFrom: '2015-09-01',
        validTo: '2022-01-31',
      }),
      permit({ validFrom: '2022-02-01', salary: 20000 }),
    ],
  });
  expect(longResidence).toMatchObject({
    outcome: 'LIKELY_ELIGIBLE',
    pathwayYears: 10,
  });
  expect(
    longResidence.rules.find((rule) => rule.id === 'CL-ENGLISH')?.explanation,
  ).toContain('EL 4.1');
});

test('A2#10 SETF uses EL/KOL and the application date to assess both conditions', () => {
  const episodes = [
    permit({
      route: 'STUDENT',
      validFrom: '2011-11-04',
      validTo: '2015-10-31',
    }),
    family({ validFrom: '2015-11-01' }),
  ];
  const facts = {
    episodes,
    english: { cefrLevel: 'A2' as const },
    lifeInTheUk: undefined,
  };
  for (const rule of [clEnglish, clKol]) {
    expect(run(rule, facts).status).toBe('UNKNOWN');
    expect(
      run(rule, {
        ...facts,
        englishFifteenYearException: {
          applicationDate: SIMULATION_DATE,
          teacherAssessedAgainst: 'B1',
        },
      }).status,
    ).toBe('PASS');
    expect(
      run(
        rule,
        {
          ...facts,
          englishFifteenYearException: {
            applicationDate: '2027-03-26',
            teacherAssessedAgainst: 'B1',
          },
        },
        '2027-03-26',
      ),
    ).toMatchObject({
      status: 'UNKNOWN',
      explanation: expect.stringContaining('B2'),
    });
    expect(
      run(
        rule,
        {
          ...facts,
          englishFifteenYearException: {
            applicationDate: '2027-03-26',
            teacherAssessedAgainst: 'B2',
          },
        },
        '2027-03-26',
      ).status,
    ).toBe('PASS');
  }
});

test('A2#10 KoLL requires the specified permit history and does not exempt a Canadian from the test', () => {
  const evidence = {
    applicationDate: SIMULATION_DATE,
    teacherAssessedAgainst: 'B1' as const,
  };
  const short = family({
    familyPermission: 'PARTNER_FIVE_YEAR',
    validFrom: '2015-11-01',
  });
  const facts = {
    english: { cefrLevel: 'A2' as const },
    lifeInTheUk: undefined,
    englishFifteenYearException: evidence,
  };
  const otherHistory = {
    ...facts,
    episodes: [
      permit({
        route: 'STUDENT',
        validFrom: '2011-11-04',
        validTo: '2015-10-31',
      }),
      short,
    ],
  };
  expect(run(clEnglish, otherHistory).status).toBe('FAIL');
  const qualifying = {
    ...facts,
    episodes: [{ ...short, validFrom: '2011-11-04' }],
  };
  expect(run(clEnglish, qualifying).status).toBe('PASS');
  expect(run(clKol, qualifying).status).toBe('PASS');
  expect(run(clKol, { ...qualifying, nationality: 'CAN' }).status).toBe(
    'UNKNOWN',
  );
});

test('A6#5 the settled principal’s criminal record does not replace the partner’s SW 38 suitability check', () => {
  const principal = { ...settled, criminalRecord: [{ date: '2026-10-01' }] };
  const timelineOfPartner = timeline({ episodes: [partner()] });
  const assess = (criminalRecord: PersonTimeline['criminalRecord']) =>
    evaluate({
      timeline: { ...timelineOfPartner, criminalRecord },
      principal,
      simulationDate: SIMULATION_DATE,
    });
  expect(assess([]).byRuleSet['current-law-2026-11']?.outcome).toBe(
    'LIKELY_ELIGIBLE',
  );
  expect(assess([]).byRuleSet['earned-settlement-2026-11']?.outcome).toBe(
    'REQUIRES_REGULATED_REVIEW',
  );
  expect(
    assess([{ date: '2026-11-01' }]).byRuleSet['current-law-2026-11']?.outcome,
  ).toBe('REQUIRES_REGULATED_REVIEW');
});

test('A6#6 projection retains unmet B2 and missing Life in the UK, and checks age at filing', () => {
  const facts = {
    episodes: [permit({ validFrom: '2023-06-01' })],
    english: { cefrLevel: 'B1' as const },
    lifeInTheUk: undefined,
  };
  const projected = current(facts);
  expect(projected.earliestDate).toBe('2028-05-04');
  expect(projected.rules).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        id: 'CL-ENGLISH',
        status: 'FAIL',
        explanation: expect.stringContaining('B2'),
      }),
      expect.objectContaining({ id: 'CL-KOL', status: 'UNKNOWN' }),
    ]),
  );
  expect(
    projected.assumptions.filter((line) => line.startsWith('Still to be met')),
  ).toHaveLength(2);
  const older = current({ ...facts, dateOfBirth: '1963-05-04' });
  expect(older.earliestDate).toBe(projected.earliestDate);
  expect(
    older.rules
      .filter((rule) => ['CL-ENGLISH', 'CL-KOL'].includes(rule.id))
      .map((rule) => rule.status),
  ).toEqual(['PASS', 'PASS']);
  expect(older.assumptions.join(' ')).not.toContain('B2');
  const alreadyUnderB2 = current(
    { ...facts, dateOfBirth: '1963-05-04' },
    '2027-04-01',
  );
  expect(alreadyUnderB2.earliestDate).toBe(projected.earliestDate);
  expect(
    alreadyUnderB2.rules.find((rule) => rule.id === 'CL-ENGLISH')?.status,
  ).toBe('PASS');
});

test('review33b-1 #1 a recorded renewal keeps the conditional date when B2 and Life in the UK are still to be met', () => {
  const single = {
    episodes: [permit({ validFrom: '2023-06-01' })],
    english: { cefrLevel: 'B1' as const },
    lifeInTheUk: undefined,
  };
  const renewed = {
    ...single,
    episodes: [
      permit({ validFrom: '2023-06-01', validTo: '2026-12-31' }),
      permit({ validFrom: '2027-01-01' }),
    ],
  };
  for (const facts of [single, renewed]) {
    const forecast = current(facts);
    expect(forecast).toMatchObject({
      outcome: 'LIKELY_NOT_ELIGIBLE',
      earliestDate: '2028-05-04',
    });
    expect(forecast.decidedBy).toContain('CL-SW-RESIDENCE-5Y');
    expect(forecast.assumptions.join('\n')).toMatch(/B2/);
    expect(forecast.assumptions.join('\n')).toMatch(/Life in the UK/);
  }
});

test('review33b-1 #2 a joint date recovered on the departure day rechecks the dependant’s English on that date', () => {
  const principal = timeline({
    episodes: [permit({ validFrom: '2022-06-01' })],
  });
  const partner = (cefrLevel: 'B1' | 'B2') => ({
    episodes: [
      permit({
        validFrom: '2022-06-01',
        role: 'DEPENDANT',
        dependantOf: 'PARTNER',
      }),
    ],
    english: { cefrLevel },
    absences: [{ from: SIMULATION_DATE, to: '2026-11-20' }],
  });
  expect(current(partner('B2'), SIMULATION_DATE, principal)).toMatchObject({
    outcome: 'INSUFFICIENT_INFORMATION',
    earliestDate: '2027-05-04',
  });
  // SW 44.1: B2 applies on 2027-05-04, so B1 cannot keep the joint date.
  expect(
    current(partner('B1'), SIMULATION_DATE, principal).earliestDate,
  ).not.toBe('2027-05-04');
});

test('review33b-1 #3 a day without permission ends the pre-April 2024 salary cohort (SW 4.2(b)(ii))', () => {
  const episodes = [
    permit({ validFrom: '2023-08-01', validTo: '2024-06-01', salary: 35000 }),
    permit({
      validFrom: '2024-06-03',
      sponsorshipCertificateDate: '2024-05-15',
      salary: 35000,
    }),
  ];
  const after = current({ episodes }, '2029-08-01');
  expect(after.rules.find((r) => r.id === 'CL-SW-SALARY')?.status).toBe('FAIL');
  expect(after.outcome).not.toBe('LIKELY_ELIGIBLE');
  const continuous = [{ ...episodes[0], validTo: '2024-06-02' }, episodes[1]];
  expect(
    current({ episodes: continuous }, '2029-08-01').rules.find(
      (r) => r.id === 'CL-SW-SALARY',
    )?.status,
  ).toBe('PASS');
});

test('review33b-2 a joint forecast keeps the date while the principal’s B2 is still to be met; the day itself does not pass', () => {
  const principal = timeline({
    episodes: [permit({ validFrom: '2021-11-04' })],
    english: { cefrLevel: 'B1' },
  });
  const partner = {
    episodes: [
      permit({
        validFrom: '2022-06-01',
        role: 'DEPENDANT',
        dependantOf: 'PARTNER',
      }),
    ],
    english: { cefrLevel: 'B2' as const },
  };
  const forecast = current(partner, SIMULATION_DATE, principal);
  expect(forecast).toMatchObject({
    outcome: 'LIKELY_NOT_ELIGIBLE',
    earliestDate: '2027-05-04',
  });
  expect(
    forecast.rules.find((r) => r.id === 'CL-SW-PARTNER-5Y')?.explanation,
  ).toContain('2027-05-04');
  const onTheDay = current(partner, '2027-05-04', principal);
  expect(onTheDay.outcome).not.toBe('LIKELY_ELIGIBLE');
  expect(
    onTheDay.rules.find((r) => r.id === 'CL-SW-PARTNER-5Y')?.status,
  ).not.toBe('PASS');
  const qualified = timeline({ ...principal, english: { cefrLevel: 'B2' } });
  expect(current(partner, '2027-05-04', qualified).outcome).toBe(
    'LIKELY_ELIGIBLE',
  );
});

test('review33b-1 / task 53: a confirmed Option D or I is an ISL job (SW 4.2), and a removal before the CoS leaves the same-job exception open (SW 11.2)', () => {
  // Scotland-only entry: without the option the ISL stays unconfirmed.
  const scotland = permit({
    validFrom: '2026-01-01',
    sponsorshipCertificateDate: '2025-12-15',
    socCode: '5235',
    salary: 35000,
  });
  const facts = (episode: ImmigrationEpisode) => ({
    episodes: [
      permit({
        route: 'GLOBAL_TALENT',
        validFrom: '2021-01-01',
        validTo: '2025-12-31',
      }),
      episode,
    ],
  });
  const unconfirmed = run(clSwSalary, facts(scotland));
  const optionD = run(
    clSwSalary,
    facts({ ...scotland, skilledWorkerSponsorshipException: 'OPTION_D' }),
  );
  expect(optionD.status).not.toBe(unconfirmed.status);
  expect(unconfirmed.assumptions?.join()).toContain('ISL 资格待确认');
  expect(optionD.assumptions?.join()).not.toContain('ISL 资格待确认');
  expect(optionD.assumptions?.join()).toContain('Option D／I');
  // SOC 2112 left the list on 2026-12-31; the previous grant was on it.
  const before = permit({
    validFrom: '2024-06-01',
    validTo: '2027-01-14',
    sponsorshipCertificateDate: '2024-05-01',
    socCode: '2112',
    salary: 41000,
  });
  const after = permit({
    validFrom: '2027-01-15',
    validTo: '2030-01-14',
    sponsorshipCertificateDate: '2027-01-10',
    socCode: '2112',
    salary: 41000,
  });
  const renewal = run(clSwSalary, { episodes: [before, after] }, '2027-06-01');
  expect(renewal.status).toBe('UNKNOWN');
  expect(renewal.assumptions?.join()).toContain('SW 11.2');
  // review53-1: an undeclared previous grant keeps the exception open; one
  // confirmed off the list does not.
  const scotlandBefore = permit({
    validFrom: '2024-06-01',
    validTo: '2027-01-14',
    sponsorshipCertificateDate: '2024-05-01',
    socCode: '5235',
    salary: 35000,
  });
  const scotlandAfter = {
    ...scotlandBefore,
    validFrom: '2027-01-15',
    validTo: '2030-01-14',
    sponsorshipCertificateDate: '2026-12-31',
  };
  const open = run(
    clSwSalary,
    { episodes: [scotlandBefore, scotlandAfter] },
    '2027-06-01',
  );
  expect(open.status).toBe('UNKNOWN');
  expect(open.assumptions?.join()).toContain('SW 11.2');
  expect(
    run(
      clSwSalary,
      {
        episodes: [
          { ...scotlandBefore, immigrationSalaryList: false },
          scotlandAfter,
        ],
      },
      '2027-06-01',
    ).assumptions?.join(),
  ).not.toContain('SW 11.2');
  // A different job after the removal is not on the list.
  expect(
    run(
      clSwSalary,
      { episodes: [before, { ...after, socCode: '2113' }] },
      '2027-06-01',
    ).assumptions?.join(),
  ).not.toContain('SW 11.2');
});

test('review33b-1 / task 53: a recorded Appendix FM grant after the simulation date applies CR 3.6 from that date', () => {
  const fm = (validFrom: string, validTo: string): ImmigrationEpisode => ({
    route: 'FAMILY_PARTNER_OR_PARENT',
    role: 'MAIN',
    validFrom,
    validTo,
    familyPermission: 'PARTNER_TEN_YEAR',
  });
  const facts = {
    episodes: [fm('2016-08-01', '2026-11-09'), fm('2026-11-10', '2029-05-09')],
    relationships: [
      {
        type: 'PARTNER' as const,
        otherPartyStatus: 'BRITISH_CITIZEN' as const,
      },
    ],
    // More than 180 days abroad before 2022-06-20 (CR 3.6).
    absences: [{ from: '2018-01-01', to: '2018-08-31' }],
  };
  expect(current(facts, '2026-11-04')).toMatchObject({
    pathwayYears: 10,
    earliestDate: '2026-11-10',
  });
  expect(current(facts, '2026-11-10')).toMatchObject({
    outcome: 'LIKELY_ELIGIBLE',
    earliestDate: '2026-11-10',
  });
});
