import { expect, test } from 'vitest';
import { PARAMETERS_BY_COUNTRY } from '@uk-immigration/policy-data';
import {
  evaluateNewZealandFull,
  type NzFullRequest,
} from '../src/new-zealand-full';
import {
  createNzContext,
  type NzCommonAnswers,
  type NzDependantAnswers,
  type NzEnglishEvidence,
} from '../src/new-zealand-checks';

const date = '2026-11-23';
const time = { simulationDate: date, dateOfBirth: '1986-11-23' };
const evidence: NzCommonAnswers['evidence'] = {
  medical: { issued: '2026-09-01', limited: false },
  freshMedicalRequested: false,
  freshXrayRequested: false,
  xray: { issued: '2026-09-01' },
  pregnant: false,
  policeCountriesComplete: true,
  police: [{ issued: '2026-07-01' }],
};
const base: NzCommonAnswers = {
  identityDocuments: true,
  requiredFeePaid: true,
  testSpecificallyRequested: false,
  residenceFiling: {
    atImmigrationControlArea: false,
    dependentChildrenUnlawfullyInNz: [],
  },
  dependants: [],
  health: 'clear',
  character: 'clear',
  evidence,
};
const ielts: Extract<NzEnglishEvidence, { method: 'test' }> = {
  method: 'test',
  test: 'ielts',
  score: 6.5,
  inPerson: true,
  date: '2024-11-23',
};

function get(
  id: string,
  answers: NzCommonAnswers,
  category: Parameters<
    ReturnType<typeof createNzContext>['common']
  >[0] = 'skilled',
  dob = time.dateOfBirth,
  registered?: boolean,
) {
  const ctx = createNzContext(
    { ...time, dateOfBirth: dob },
    { ...base, ...answers },
  );
  return ctx.common(category, registered).find((c) => c.id === id)!;
}

test('ten stable pathways are available without assuming an existing visa, registering against the full NZ parameter set', () => {
  const run = (locale: NzFullRequest['locale']) =>
    evaluateNewZealandFull({ simulationDate: date, locale });
  const zh = run('zh-CN'),
    en = run('en');
  const expected = [
    'NZ-TRAVEL',
    'NZ-PRV',
    'NZ-CITIZENSHIP',
    'NZ-SMC',
    'NZ-GREEN-LIST',
    'NZ-SECTOR',
    'NZ-P7',
    'NZ-P8',
    'NZ-P9',
    'NZ-P10',
  ];
  expect(zh.policyAsOf).toBe('2026-11-23');
  const [column] = zh.columns;
  expect(PARAMETERS_BY_COUNTRY.nz[column.id as 'nz.current-law'].asOf).toBe(
    zh.policyAsOf,
  );
  expect(column.pathways.map((p) => p.id)).toEqual(expected);
  for (const [i, p] of column.pathways.entries()) {
    expect(p.status, p.id).toBe('UNKNOWN');
    expect(p.earliestDate, p.id).toBeUndefined();
    const other = en.columns[0].pathways[i];
    expect(p.title).not.toBe(other.title);
    expect(p.checks.map((c) => c.id)).toEqual(other.checks.map((c) => c.id));
    expect(new Set(p.checks.map((c) => c.id)).size).toBe(p.checks.length);
    for (const [j, c] of p.checks.entries()) {
      expect(c.title).not.toBe(other.checks[j].title);
      expect(c.explanation).not.toBe(other.checks[j].explanation);
      expect(c.sources.length).toBeGreaterThan(0);
      expect(c.sources.every((s) => s.locator.length > 0)).toBe(true);
      if (c.status === 'UNKNOWN')
        expect(c.pendingDetails?.length, c.id).toBeGreaterThan(0);
    }
  }
});

test('identity and lodging need every included person, and an explicitly unpaid mandatory fee prevents filing', () => {
  expect(get('NZ-IDENTITY', {}).status).toBe('MET');
  expect(get('NZ-IDENTITY', { requiredFeePaid: undefined })).toMatchObject({
    status: 'UNKNOWN',
    pendingDetails: ['PD-220'],
  });
  expect(get('NZ-IDENTITY', { dependants: undefined }).status).toBe('UNKNOWN');
  expect(
    get('NZ-IDENTITY', { dependants: [{ identityDocuments: false }] }).status,
  ).toBe('NOT_MET');
  expect(get('NZ-IDENTITY', { requiredFeePaid: false }).status).toBe('NOT_MET');
});

test('NZ$81,000 is a strict cost threshold; one non-waivable condition affects the whole application', () => {
  expect(get('NZ-C1', { medicalCostNzd: 81000 }).status).toBe('MET');
  expect(get('NZ-C1', { medicalCostNzd: 81001 }).status).toBe('UNKNOWN');
  expect(
    get('NZ-C1', { dependants: [{ health: 'excluded-from-waiver' }] }).status,
  ).toBe('NOT_MET');
  expect(
    get('NZ-C1', { health: 'needs-assessment', medicalCostNzd: 100 }).status,
  ).toBe('UNKNOWN');
  expect(
    get('NZ-C1', { health: 'assessed-unacceptable', medicalWaiver: 'granted' })
      .status,
  ).toBe('MET');
  expect(
    get('NZ-C1', { health: 'assessed-unacceptable', medicalWaiver: 'declined' })
      .status,
  ).toBe('NOT_MET');
  for (const category of ['partner', 'parent'] as const)
    expect(
      get(
        'NZ-C1',
        { health: 'assessed-unacceptable', familyOmission: true },
        category,
      ).status,
    ).toBe('NOT_MET');
  expect(
    get(
      'NZ-C1',
      { health: 'assessed-unacceptable', familyOmission: false },
      'partner',
    ).status,
  ).toBe('UNKNOWN');
  expect(
    get(
      'NZ-C1',
      { health: 'assessed-unacceptable', familyOmission: false },
      'parent',
    ).status,
  ).toBe('UNKNOWN');
});

test('medical evidence uses calendar months, the under-11 exemption, pregnancy, certificate type and TB exposure', () => {
  const status = (
    e: NzCommonAnswers['evidence'],
    dob = time.dateOfBirth,
    category: 'skilled' | 'partner' = 'skilled',
  ) =>
    get('NZ-C1-EVIDENCE', { evidence: e, familyOmission: false }, category, dob)
      .status;
  expect(
    status({ ...evidence, medical: { limited: false, issued: '2026-08-24' } }),
  ).toBe('MET');
  expect(
    status({
      ...evidence,
      medical: { limited: false, issued: '2026-08-23', reusable: false },
    }),
  ).toBe('NOT_MET');
  expect(
    status({
      ...evidence,
      medical: { limited: false, issued: '2023-11-24', reusable: true },
    }),
  ).toBe('MET');
  expect(
    status({
      ...evidence,
      medical: { limited: false, issued: '2023-11-23', reusable: true },
    }),
  ).toBe('NOT_MET');
  expect(status({ ...evidence, medical: { issued: date } })).toBe('UNKNOWN');
  expect(
    status({
      ...evidence,
      medical: { issued: '2023-11-24', limited: false, reusable: true },
      freshMedicalRequested: undefined,
    }),
  ).toBe('UNKNOWN');
  const reused = {
    ...evidence,
    xray: { issued: '2025-11-23', reusable: true },
  };
  expect(
    status({
      ...reused,
      consecutiveMonthsInTbRiskCountries: 5,
      freshXrayRequested: undefined,
    }),
  ).toBe('UNKNOWN');
  expect(status({ ...reused, consecutiveMonthsInTbRiskCountries: 5 })).toBe(
    'MET',
  );
  expect(status({ ...reused, consecutiveMonthsInTbRiskCountries: 6 })).toBe(
    'NOT_MET',
  );
  expect(status({ ...evidence, xray: undefined }, '2015-11-24')).toBe('MET');
  expect(status({ ...evidence, xray: undefined }, '2015-11-23')).toBe(
    'UNKNOWN',
  );
  expect(status({ ...evidence, xray: undefined, pregnant: true })).toBe('MET');
  expect(
    status({ ...evidence, medical: { issued: date, limited: true } }),
  ).toBe('NOT_MET');
  expect(
    status(
      { ...evidence, medical: { issued: date, limited: true } },
      time.dateOfBirth,
      'partner',
    ),
  ).toBe('MET');
});

test('police documents reflect age, all required countries, issue dates, and prior partnership submissions', () => {
  const status = (
    e: NzCommonAnswers['evidence'],
    dob = time.dateOfBirth,
    route: 'skilled' | 'partner' = 'skilled',
  ) => get('NZ-C2-POLICE', { evidence: e }, route, dob).status;
  expect(status({}, '2009-11-24')).toBe('MET');
  expect(status({}, '2009-11-23')).toBe('UNKNOWN');
  expect(status({ ...evidence, policeCountriesComplete: false })).toBe(
    'NOT_MET',
  );
  expect(status({ ...evidence, police: [] })).toBe('NOT_MET');
  expect(status({ ...evidence, police: [{ issued: '2026-05-24' }] })).toBe(
    'MET',
  );
  expect(status({ ...evidence, police: [{ issued: '2026-05-23' }] })).toBe(
    'NOT_MET',
  );
  const prior = (issued: string) => ({
    ...evidence,
    police: [{ issued, reusable: true }],
  });
  expect(status(prior('2024-11-24'), time.dateOfBirth, 'partner')).toBe('MET');
  expect(status(prior('2024-11-23'), time.dateOfBirth, 'partner')).toBe(
    'NOT_MET',
  );
  expect(status({ policeWaiverGranted: true })).toBe('MET');
});

test('a second country reaches the police evidence threshold at twelve cumulative months', () => {
  const police = (months: number, citizen: boolean) =>
    get('NZ-C2-POLICE', {
      evidence: {
        policeCountriesComplete: true,
        police: [
          { isCitizenshipCountry: true, issued: date },
          {
            isCitizenshipCountry: citizen,
            monthsInCountryDuringLookback: months,
            provided: false,
          },
        ],
      },
    }).status;
  expect(police(11, false)).toBe('MET');
  expect(police(12, false)).toBe('NOT_MET');
  expect(police(0, true)).toBe('NOT_MET');
});

test('statutory custody bars, a granted special direction and an ordinary character waiver have distinct effects', () => {
  const sentence = (
    convictionDate: string,
    imprisonmentMonths: number,
    more: NzCommonAnswers = {},
  ) =>
    get('NZ-C2', {
      convictions: [{ convictionDate, imprisonmentMonths }],
      ...more,
    }).status;
  expect(sentence('2000-01-01', 60)).toBe('NOT_MET');
  expect(sentence('2000-01-01', 59)).toBe('UNKNOWN');
  expect(sentence('2016-11-24', 12)).toBe('NOT_MET');
  expect(sentence('2016-11-24', 11)).toBe('UNKNOWN');
  expect(sentence('2016-11-22', 12, { characterWaiver: 'granted' })).toBe(
    'MET',
  );
  expect(sentence('2024-01-01', 60, { characterWaiver: 'granted' })).toBe(
    'NOT_MET',
  );
  expect(
    sentence('2024-01-01', 60, {
      specialDirection: 'granted',
      characterWaiver: 'granted',
    }),
  ).toBe('MET');
  expect(
    get('NZ-C2', { dependants: [{ character: 'pending-charge' }] }).status,
  ).toBe('UNKNOWN');
  expect(
    get('NZ-C2', { character: 'statutory-bar', specialDirection: 'pending' })
      .status,
  ).toBe('UNKNOWN');
  expect(
    get('NZ-C2', { character: 'waiver-required', characterWaiver: 'declined' })
      .status,
  ).toBe('NOT_MET');
  expect(get('NZ-C2', { character: 'security-review' }).pendingDetails).toEqual(
    ['PD-231'],
  );
});

test.each([
  ['ielts', 6.5, 6],
  ['toefl', 79, 78],
  ['pte', 58, 57],
  ['cambridge', 176, 175],
] as const)('principal %s pass mark and one step below', (test, pass, fail) => {
  expect(
    get('NZ-C3', { english: { ...ielts, test, score: pass } }).status,
  ).toBe('MET');
  expect(
    get('NZ-C3', { english: { ...ielts, test, score: fail } }).status,
  ).toBe('NOT_MET');
});
test('only actual in-person results in time qualify, including the separate SMC registration window', () => {
  expect(get('NZ-C3', { english: { ...ielts, inPerson: false } }).status).toBe(
    'NOT_MET',
  );
  expect(
    get('NZ-C3', { english: { ...ielts, date: '2024-11-22' } }).status,
  ).toBe('NOT_MET');
  const old = { english: { ...ielts, date: '2021-11-23' } };
  expect(get('NZ-C3', old, 'smc', time.dateOfBirth, true).status).toBe('MET');
  expect(get('NZ-C3', old, 'smc', time.dateOfBirth, false).status).toBe(
    'NOT_MET',
  );
  expect(get('NZ-C3', old, 'smc').status).toBe('UNKNOWN');
  expect(
    get(
      'NZ-C3',
      { english: { ...ielts, date: '2021-11-22' } },
      'smc',
      time.dateOfBirth,
      true,
    ).status,
  ).toBe('NOT_MET');
  expect(
    get('NZ-C3', {
      english: { ...ielts, test: 'oet', grades: ['A', 'B', 'C+', 'C+'] },
    }).status,
  ).toBe('MET');
  expect(
    get('NZ-C3', {
      english: { ...ielts, test: 'oet', grades: ['A', 'B', 'C+', 'C'] },
    }).status,
  ).toBe('NOT_MET');
});

test('citizenship/study and qualification evidence have their own conditions and can be superseded by an INZ test request', () => {
  const english: NzEnglishEvidence = {
    method: 'citizenship',
    eligibleCitizenship: true,
    workOrStudyYearsInSixCountries: 5,
  };
  expect(get('NZ-C3', { english }).status).toBe('MET');
  expect(
    get('NZ-C3', { english, testSpecificallyRequested: undefined }).status,
  ).toBe('UNKNOWN');
  expect(
    get('NZ-C3', { english: { ...english, workOrStudyYearsInSixCountries: 4 } })
      .status,
  ).toBe('NOT_MET');
  expect(
    get('NZ-C3', { english, testSpecificallyRequested: true }).status,
  ).toBe('NOT_MET');
  const degree: NzEnglishEvidence = {
    method: 'qualification',
    eligibleCountry: true,
    assessedOrExempt: true,
    academicYearsInSixCountries: 2,
    isBachelor: true,
    level: 7,
  };
  expect(get('NZ-C3', { english: degree }).status).toBe('MET');
  expect(
    get('NZ-C3', { english: { ...degree, academicYearsInSixCountries: 1 } })
      .status,
  ).toBe('NOT_MET');
  expect(
    get('NZ-C3', {
      english: { ...degree, level: 8, academicYearsInSixCountries: 1 },
    }).status,
  ).toBe('MET');
  expect(
    get('NZ-C3', { english: { ...degree, assessedOrExempt: undefined } })
      .status,
  ).toBe('UNKNOWN');
});

test('accompanying family has an age cutoff and four different ESOL charges; plans are not proof of prepayment', () => {
  const member = (
    dob: string,
    score: number,
    esol: 'planned' | 'paid-and-signed' | 'declined',
  ) =>
    get('NZ-C3-FAMILY', {
      dependants: [{ dateOfBirth: dob, english: { ...ielts, score }, esol }],
    });
  expect(member('2010-11-24', 0, 'declined').status).toBe('MET');
  expect(member('2010-11-23', 4.5, 'declined').status).toBe('NOT_MET');
  expect(member('2010-11-23', 5, 'declined').status).toBe('MET');
  const unknown = get('NZ-C3-FAMILY', {
    dependants: [{ dateOfBirth: '2000-01-01', esol: 'planned' }],
  });
  expect(unknown.status).toBe('UNKNOWN');
  expect(unknown.explanation).not.toContain('6,795');
  for (const [score, charge] of [
    [4.5, '1,735'],
    [4, '3,420'],
    [3.5, '5,110'],
    [3, '6,795'],
  ] as const) {
    expect(member('2010-11-23', score, 'paid-and-signed')).toMatchObject({
      status: 'MET',
      explanation: expect.stringContaining(charge),
    });
    expect(member('2010-11-23', score, 'planned').status).toBe('NOT_MET');
  }
});

test('housing is informational and a statutory levy exemption affects the budget independently of eligibility', () => {
  expect(get('NZ-C4', {}).status).toBe('MET');
  expect(get('NZ-C4', { identityDocuments: false }, 'partner').status).toBe(
    'MET',
  );
  expect(get('NZ-C6-LEVY', {})).toMatchObject({
    status: 'UNKNOWN',
    pendingDetails: ['PD-225'],
  });
  expect(get('NZ-C6-LEVY', { levyBasis: 'samoan-citizen' })).toMatchObject({
    status: 'MET',
    explanation: expect.stringContaining('免征'),
  });
  expect(get('NZ-C6-LEVY', { levyBasis: 'ordinary' }).explanation).toContain(
    '缴纳',
  );
});

const tierOne: NzFullRequest = {
  ...time,
  skilled: {
    green: { tier: 'straight', rowRequirementsVerified: true },
    job: {
      occupationCode: '261313',
      occupationMatch: true,
      employerCompliant: true,
      accreditedAtApplication: true,
      genuineOfferInNZ: true,
      guaranteedWeeklyHours: 40,
      contract: 'permanent',
      hourlyPay: 105,
    },
  },
};

function tierOnePath(answers: NzCommonAnswers) {
  return evaluateNewZealandFull({
    ...tierOne,
    common: { ...base, english: ielts, ...answers },
  }).columns[0].pathways.find((p) => p.id === 'NZ-GREEN-LIST')!;
}

test.each([
  [true, 'MET', date],
  [false, 'NOT_MET', undefined],
  [undefined, 'UNKNOWN', undefined],
] as const)(
  'Tier 1 lodging fee %s controls the condition, path and date',
  (requiredFeePaid, status, earliest) => {
    const path = tierOnePath({ requiredFeePaid });
    const check = path.checks.find((c) => c.id === 'NZ-IDENTITY');
    expect(check?.status).toBe(status);
    if (requiredFeePaid === undefined)
      expect(check?.pendingDetails).toEqual(['PD-220']);
    expect(path.status).toBe(status);
    expect(path.earliestDate).toBe(earliest);
  },
);

const child: NzDependantAnswers = {
  relation: 'child',
  dateOfBirth: '2001-11-23',
  single: true,
  hasOwnChildren: false,
  financiallyDependent: true,
  identityDocuments: true,
  health: 'clear',
  character: 'clear',
  evidence,
  english: ielts,
};

test.each([
  ['25th birthday', {}, 'NOT_MET'],
  ['day before 25', { dateOfBirth: '2001-11-24' }, 'MET'],
  ['relationship omitted', { relation: undefined }, 'UNKNOWN'],
  ['another relative', { relation: 'other' }, 'NOT_MET'],
  ['partner evidence missing', { relation: 'partner' }, 'UNKNOWN'],
  [
    'partner recognised',
    { relation: 'partner', partnershipRequirementsMet: true },
    'MET',
  ],
  [
    'partner ineligible',
    { relation: 'partner', partnershipRequirementsMet: false },
    'NOT_MET',
  ],
  [
    'minor with own child',
    { dateOfBirth: '2008-11-24', hasOwnChildren: true },
    'MET',
  ],
  ['minor not single', { dateOfBirth: '2008-11-24', single: false }, 'NOT_MET'],
  [
    '18 with own child',
    { dateOfBirth: '2008-11-23', hasOwnChildren: true },
    'NOT_MET',
  ],
  [
    '20 and self-supporting',
    { dateOfBirth: '2005-11-24', financiallyDependent: false },
    'MET',
  ],
  [
    '21 and self-supporting',
    { dateOfBirth: '2005-11-23', financiallyDependent: false },
    'NOT_MET',
  ],
  [
    '21 and dependence unanswered',
    { dateOfBirth: '2005-11-23', financiallyDependent: undefined },
    'UNKNOWN',
  ],
  [
    'single unanswered',
    { dateOfBirth: '2006-11-23', single: undefined },
    'UNKNOWN',
  ],
  [
    'own children unanswered',
    { dateOfBirth: '2006-11-23', hasOwnChildren: undefined },
    'UNKNOWN',
  ],
] satisfies [string, Partial<NzDependantAnswers>, string][])(
  'R2.1 Tier 1 with %s',
  (_label, change, status) => {
    const path = tierOnePath({ dependants: [{ ...child, ...change }] });
    expect(path.checks.find((c) => c.id === 'NZ-DEPENDANTS')?.status).toBe(
      status,
    );
    expect(path.status).toBe(status);
    expect(path.earliestDate).toBe(status === 'MET' ? date : undefined);
  },
);

test.each([
  ['2018-11-23', undefined, 'UNKNOWN'],
  ['2018-11-23', 'none', 'NOT_MET'],
  ['2018-11-23', 'right-evidenced', 'MET'],
  ['2018-11-23', 'consent-evidenced', 'MET'],
  ['2018-11-23', 'not-required', 'MET'],
  ['2010-11-24', 'none', 'NOT_MET'],
  ['2010-11-23', 'none', 'MET'],
] as const)(
  'Tier 1 child born %s, relocation authority %s',
  (dateOfBirth, relocationAuthority, status) => {
    const path = tierOnePath({
      dependants: [{ ...child, dateOfBirth, relocationAuthority }],
    });
    expect(path.checks.find((c) => c.id === 'NZ-DEPENDANTS')?.status).toBe(
      status,
    );
    expect(path.status).toBe(status);
    expect(path.earliestDate).toBe(status === 'MET' ? date : undefined);
  },
);

const affectedChild = {
  dateOfBirth: '2010-11-24',
  lackOfRemovalRightDemonstrated: true,
};
test.each([
  ['unanswered', undefined, 'UNKNOWN'],
  ['no affected children', [], 'MET'],
  ['under 16, proven lack of rights', [affectedChild], 'MET'],
  [
    'under 16, no proof',
    [{ ...affectedChild, lackOfRemovalRightDemonstrated: false }],
    'NOT_MET',
  ],
  [
    'under 16, unanswered rights',
    [{ dateOfBirth: affectedChild.dateOfBirth }],
    'UNKNOWN',
  ],
  ['unknown age', [{ lackOfRemovalRightDemonstrated: true }], 'UNKNOWN'],
  [
    'another child turns 16 today',
    [affectedChild, { ...affectedChild, dateOfBirth: '2010-11-23' }],
    'NOT_MET',
  ],
] satisfies [
  string,
  NonNullable<
    NzCommonAnswers['residenceFiling']
  >['dependentChildrenUnlawfullyInNz'],
  string,
][])(
  'R5.125 ordinary filing, no accompanying applicants, %s',
  (_label, children, status) => {
    const path = tierOnePath({
      residenceFiling: {
        atImmigrationControlArea: false,
        dependentChildrenUnlawfullyInNz: children,
      },
    });
    const condition = path.checks.find((c) => c.id === 'NZ-R5-125');
    expect(condition?.status).toBe(status);
    if (status === 'UNKNOWN')
      expect(condition?.pendingDetails).toContain('PD-234');
    expect(path.status).toBe(status);
    expect(path.earliestDate).toBe(status === 'MET' ? date : undefined);
  },
);

test('R5.125 starts on the effective day, exempts control-area lodgement and leaves an unknown venue open if decisive', () => {
  const affected = {
    dependentChildrenUnlawfullyInNz: [{ dateOfBirth: '2008-10-01' }],
  };
  const checkOn = (simulationDate: string) =>
    evaluateNewZealandFull({
      ...tierOne,
      simulationDate,
      common: {
        ...base,
        residenceFiling: { ...affected, atImmigrationControlArea: false },
      },
    })
      .columns[0].pathways.find((p) => p.id === 'NZ-GREEN-LIST')!
      .checks.find((c) => c.id === 'NZ-R5-125');
  expect(checkOn('2026-11-11')).toBeUndefined();
  expect(checkOn('2026-11-12')?.status).toBe('NOT_MET');
  expect(tierOnePath({ residenceFiling: affected }).status).toBe('UNKNOWN');
  const border = tierOnePath({
    residenceFiling: { atImmigrationControlArea: true },
  });
  expect(border.checks.some((c) => c.id === 'NZ-R5-125')).toBe(false);
  expect(border.status).toBe('MET');
});

test('applies child rules to the relevant immigration paths and stages', () => {
  const common = {
    ...base,
    dependants: [
      {
        ...child,
        dateOfBirth: '2018-11-23',
        relocationAuthority: 'none' as const,
      },
    ],
    residenceFiling: {
      atImmigrationControlArea: false,
      dependentChildrenUnlawfullyInNz: [{ dateOfBirth: '2008-10-01' }],
    },
  };
  function paths(request: Partial<NzFullRequest>) {
    return evaluateNewZealandFull({ ...tierOne, common, ...request }).columns[0]
      .pathways;
  }
  const ordinary = paths({
    family: { investment: { route: 'active' } },
    resident: { travel: { action: 'subsequent' } },
  });
  for (const path of ordinary) {
    const condition = (id: string) =>
      path.checks.find((c) => c.id === id)?.status;
    expect(condition('NZ-R5-125'), path.id).toBe(
      ['NZ-TRAVEL', 'NZ-PRV', 'NZ-CITIZENSHIP'].includes(path.id)
        ? undefined
        : 'NOT_MET',
    );
    expect(condition('NZ-DEPENDANTS'), path.id).toBe(
      path.id === 'NZ-CITIZENSHIP' ? undefined : 'NOT_MET',
    );
  }
  for (const stage of ['work', 'residence'] as const) {
    const { checks } = paths({
      family: { investment: { route: 'business', business: { stage } } },
    }).find((p) => p.id === 'NZ-P9')!;
    expect(checks.find((c) => c.id === 'NZ-DEPENDANTS')?.status).toBe(
      'NOT_MET',
    );
    expect(checks.find((c) => c.id === 'NZ-R5-125')?.status).toBe(
      stage === 'work' ? undefined : 'NOT_MET',
    );
  }
  const variation = paths({ resident: { travel: { action: 'variation' } } })[0];
  expect(variation.checks.find((c) => c.id === 'NZ-DEPENDANTS')?.status).toBe(
    'NOT_MET',
  );
  expect(variation.checks.some((c) => c.id === 'NZ-R5-125')).toBe(false);
  const monitoring = paths({
    family: {
      investment: {
        route: 'active',
        active: { goal: 'investment-conditions' },
      },
    },
  }).find((p) => p.id === 'NZ-P9')!;
  expect(monitoring.checks.some((c) => c.id === 'NZ-R5-125')).toBe(false);
});
