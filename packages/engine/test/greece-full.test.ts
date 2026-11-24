import { describe, expect, test } from 'vitest';
import {
  RULE_SET_IDS_BY_COUNTRY,
  PARAMETERS_BY_COUNTRY,
} from '@uk-immigration/policy-data';
import { evaluateGreece, evaluateGreeceFull } from '../src';
import type { GrFullPathwayId, GrFullRequest, GrInsurance } from '../src';

const day = '2026-11-23';
const base = {
  simulationDate: day,
  citizenship: 'third-country',
  permits: [{ kind: 'regular', from: '2018-01-01' }],
  trips: [],
  route: 'general',
  entry: 'permit',
  birthDate: '1985-04-07',
  publicOrder: 'clear',
  changes: [],
  biometrics: 'awaiting-appointment',
  insurance: { kind: 'public', coversFamily: true },
  passport: {
    kind: 'recognised',
    issuedOn: '2018-03-14',
    blankPages: 2,
    expectedDeparture: '2027-05-12',
    expiresOn: '2027-08-12',
  },
  longTerm: { category: 'ordinary', passportHistory: 'complete' },
  residenceIncome: { netEur: 12880, dependants: 0, regularAndDocumented: true },
  integration: { basis: 'language', greekLevel: 'B1' },
} satisfies GrFullRequest;

function path(id: GrFullPathwayId, patch: Partial<GrFullRequest> = {}) {
  return evaluateGreeceFull({ ...base, ...patch, pathways: [id] }).columns[0]
    .pathways[0];
}
function condition(
  id: GrFullPathwayId,
  key: string,
  patch: Partial<GrFullRequest>,
) {
  const check = path(id, patch).checks.find((x) => x.id === key);
  expect(check, key).toBeDefined();
  return check!;
}

test('one registered Greek law column; eight stable bilingual, sourced pathways with incomplete answers', () => {
  const run = (locale: 'en' | 'zh-CN') =>
    evaluateGreeceFull({ simulationDate: day, locale });
  const [zh, en] = [run('zh-CN'), run('en')];
  expect(RULE_SET_IDS_BY_COUNTRY.gr).toEqual([en.columns[0].id]);
  expect(en.policyAsOf).toBe(
    PARAMETERS_BY_COUNTRY.gr['gr.current-law-2026-11'].asOf,
  );
  expect(zh.columns).toHaveLength(1);
  expect(en.columns[0].pathways.map((x) => x.id)).toEqual([
    'GR-LONG-TERM',
    'GR-GOLDEN-VISA',
    'GR-NATIONALITY',
    'GR-TEN-YEAR',
    'GR-GREEK-FAMILY-PR',
    'GR-EU-FAMILY-PR',
    'GR-WORK',
    'GR-FAMILY-TCN',
  ]);
  en.columns[0].pathways.forEach((p, i) => {
    const other = zh.columns[0].pathways[i];
    expect(p.status, p.id).toBe('UNKNOWN');
    expect(p.title).not.toBe(other.title);
    expect(p.checks.map((x) => x.id)).toEqual(other.checks.map((x) => x.id));
    expect(new Set(p.checks.map((x) => x.id)).size).toBe(p.checks.length);
    p.checks.forEach((check, j) => {
      expect(check.title, check.id).not.toBe(other.checks[j].title);
      expect(check.explanation, check.id).not.toBe(other.checks[j].explanation);
      expect(check.sources.length, check.id).toBeGreaterThan(0);
      expect(
        check.sources.every((s) => s.locator && /^SRC-\d+$/.test(s.srcId)),
      ).toBe(true);
    });
  });
});

describe('long-term eligibility through the public entry point', () => {
  const id = 'GR-LONG-TERM';
  test('combines time and all current eligibility conditions; a notification fine does not erase eligibility', () => {
    const good = path(id);
    expect(good.status).toBe('MET');
    expect(good.earliestDate).toBe(day);
    const late = path(id, {
      changes: [
        {
          kind: 'ordinary',
          occurredOn: '2026-06-30',
          reportedOn: '2026-08-31',
        },
      ],
    });
    expect(late.checks.find((x) => x.id === 'C-06')?.status).toBe('NOT_MET');
    expect(late.status).toBe('MET');
    expect(path(id, { insurance: undefined }).status).toBe('UNKNOWN');
    expect(
      path(id, { insurance: { kind: 'uninsured' }, publicOrder: undefined })
        .status,
    ).toBe('NOT_MET');
  });

  test('only a time-only shortfall yields FUTURE; missing trips do not silently mean no trips', () => {
    const permits = [{ kind: 'regular' as const, from: '2024-01-31' }];
    const future = path(id, { permits });
    expect(future.status).toBe('FUTURE');
    expect(future.earliestDate).toBe('2029-01-31');
    const unresolved = path(id, { permits, integration: undefined });
    expect(unresolved.status).toBe('UNKNOWN');
    expect(unresolved.earliestDate).toBeUndefined();
    expect(
      unresolved.checks.find((x) => x.id === id + '-TIME')?.explanation,
    ).toContain(future.earliestDate);
    expect(path(id, { trips: undefined }).status).toBe('UNKNOWN');
  });

  test('credits only the M.1 pre-grant period and drops time before an art. 144(2A) exclusion', () => {
    const permits = [{ kind: 'regular' as const, from: '2023-09-13' }];
    const grantedProtection = {
      claimedOn: '2021-11-23',
      grantedOn: '2023-09-13',
    };
    expect(path(id, { permits, grantedProtection }).status).toBe('MET');
    const after = path(id, {
      permits,
      grantedProtection: {
        ...grantedProtection,
        priorResidenceExcludedThrough: '2025-01-31',
      },
    });
    expect(after.earliestDate).toBe('2030-02-01');
    expect(
      condition('GR-NATIONALITY', 'NAT-TIME-RESIDENCE', {
        permits,
        grantedProtection,
      }).status,
    ).toBe('NOT_MET');
    expect(
      condition(id, id + '-TIME', {
        permits,
        grantedProtection: { ...grantedProtection, grantedOn: '2027-01-01' },
      }).status,
    ).toBe('NOT_MET');
  });

  test('Article 43 long-term mobility combines the German and Greek Blue Cards only for M.1', () => {
    const mobility: NonNullable<GrFullRequest['blueCardMobility']> = {
      usedLongTermMobility: true,
      greekBlueCardFrom: '2024-11-23',
      priorMemberPeriods: [
        { kind: 'blue-card', from: '2021-11-23', through: '2024-11-22' },
      ],
      otherMemberTrips: [],
    };
    const permits = [{ kind: 'regular' as const, from: '2024-11-23' }];
    const assess = (
      simulationDate: string,
      changes: Partial<typeof mobility> = {},
    ) =>
      path(id, {
        simulationDate,
        permits,
        blueCardMobility: { ...mobility, ...changes },
      });
    const eligible = assess(day);
    expect(eligible).toMatchObject({ status: 'MET', earliestDate: day });
    for (const key of [
      'LT-TIME-RESIDENCE',
      'LT-TIME-SINGLE-ABSENCE',
      'LT-TIME-TOTAL-ABSENCE',
      id + '-TIME',
    ]) {
      expect(eligible.checks.find((x) => x.id === key)).toMatchObject({
        status: 'MET',
        sources: expect.arrayContaining([
          expect.objectContaining({
            srcId: 'SRC-086',
            locator: expect.stringContaining('43(2)'),
          }),
        ]),
      });
    }
    const shortGreek = assess('2026-11-22', {
      priorMemberPeriods: [
        { kind: 'researcher', from: '2020-11-23', through: '2024-11-22' },
      ],
    });
    expect(shortGreek).toMatchObject({ status: 'FUTURE', earliestDate: day });
    expect(
      shortGreek.checks.find((x) => x.id === 'LT-TIME-RESIDENCE'),
    ).toMatchObject({
      status: 'NOT_MET',
      explanation: expect.stringContaining(day),
    });
    expect(assess(day, { usedLongTermMobility: false })).toMatchObject({
      status: 'FUTURE',
      earliestDate: '2029-11-23',
    });
    expect(assess(day, { otherMemberTrips: undefined }).status).toBe('UNKNOWN');
    const gap = assess(day, {
      priorMemberPeriods: [
        { kind: 'blue-card', from: '2021-11-23', through: '2024-11-21' },
      ],
    });
    expect(gap).toMatchObject({ status: 'FUTURE', earliestDate: '2029-11-23' });
    const absent = assess(day, {
      otherMemberTrips: [{ departed: '2022-01-01', returned: '2023-02-01' }],
    });
    expect(absent.earliestDate! > day).toBe(true);
    expect(
      path('GR-NATIONALITY', {
        permits,
        blueCardMobility: mobility,
      }).checks.find((x) => x.id === 'NAT-TIME-RESIDENCE'),
    ).toMatchObject({
      status: 'NOT_MET',
      explanation: expect.stringContaining('2031-11-23'),
    });
  });

  test('Article 43 uses the separate absence limits and half-weights study in another Member State', () => {
    const mobile: NonNullable<GrFullRequest['blueCardMobility']> = {
      usedLongTermMobility: true,
      greekBlueCardFrom: '2024-11-23',
      greekBlueCardThrough: day,
      priorMemberPeriods: [
        { kind: 'student', from: '2015-01-01', through: '2024-11-22' },
      ],
      otherMemberTrips: [{ departed: '2021-01-01', returned: '2021-08-01' }],
    };
    const run = (blueCardMobility: typeof mobile) =>
      path(id, { permits: [], blueCardMobility });
    expect(run(mobile)).toMatchObject({ status: 'MET', earliestDate: day });
    const tooLong = run({
      ...mobile,
      otherMemberTrips: [{ departed: '2020-12-31', returned: '2022-01-01' }],
    });
    expect(
      tooLong.checks.find((x) => x.id === 'LT-TIME-SINGLE-ABSENCE')?.status,
    ).toBe('NOT_MET');
    expect(tooLong.status).toBe('NOT_MET');
    expect(tooLong.earliestDate).toBeUndefined();
    const tooLittle = run({
      ...mobile,
      priorMemberPeriods: [
        { kind: 'student', from: '2021-11-23', through: '2024-11-22' },
      ],
    });
    expect(
      tooLittle.checks.find((x) => x.id === 'LT-TIME-RESIDENCE')?.status,
    ).toBe('NOT_MET');
    expect(tooLittle.status).toBe('NOT_MET');
    expect(tooLittle.earliestDate).toBeUndefined();
  });

  test('confirmed Article 52 backlog periods also bridge the two cards for M.1', () => {
    const union = path(id, {
      permits: [
        { kind: 'regular', from: '2016-11-01', to: '2023-09-01' },
        { kind: 'regular', from: '2026-05-01' },
      ],
      backlogRenewals: [
        {
          filedOn: '2023-08-31',
          permitEffectiveOn: '2026-05-01',
          category: 'employment',
          typeAReceipt: true,
          pendingAtCommencement: true,
        },
      ],
    });
    expect(union).toMatchObject({ status: 'MET', earliestDate: day });
    expect(
      union.checks.find((x) => x.id === 'LT-TIME-RESIDENCE'),
    ).toMatchObject({
      status: 'MET',
      sources: expect.arrayContaining([
        expect.objectContaining({ locator: expect.stringContaining('52(1)') }),
      ]),
    });
  });

  test('the original protection rule gives half credit before the June 2026 amendment', () => {
    const result = path(id, {
      simulationDate: '2026-06-11',
      permits: [{ kind: 'regular', from: '2021-12-11' }],
      grantedProtection: { claimedOn: '2020-12-11', grantedOn: '2021-12-11' },
    });
    expect(result).toMatchObject({
      status: 'FUTURE',
      earliestDate: '2026-06-12',
    });
    expect(
      path(id, {
        simulationDate: '2026-06-12',
        permits: [{ kind: 'regular', from: '2021-12-11' }],
        grantedProtection: { claimedOn: '2020-12-11', grantedOn: '2021-12-11' },
      }),
    ).toMatchObject({ status: 'MET', earliestDate: '2026-06-12' });
  });

  test('the original, bilingual time checks are reproduced, including a late golden-visa renewal', () => {
    for (const locale of ['zh-CN', 'en'] as const) {
      const req = {
        ...base,
        locale,
        permits: [
          ...base.permits,
          { kind: 'investor' as const, from: '2020-11-11', to: '2026-11-11' },
        ],
      };
      const old = evaluateGreece(req);
      const full = evaluateGreeceFull(req);
      for (const pilot of old.pathways) {
        const p = full.columns[0].pathways.find((x) => x.id === pilot.id)!;
        const checks = p.checks.slice(0, pilot.checks.length);
        expect(checks.map((x) => x.title)).toEqual(
          pilot.checks.map((x) => x.text),
        );
        expect(checks.map((x) => x.sources)).toEqual(
          pilot.checks.map((x) => x.sources),
        );
        expect(checks.map((x) => x.status)).toEqual(
          pilot.checks.map((x) =>
            x.met === undefined ? 'UNKNOWN' : x.met ? 'MET' : 'NOT_MET',
          ),
        );
        expect(
          p.checks.find((x) => x.id === pilot.id + '-TIME')?.explanation,
        ).toBe(pilot.summary);
      }
      const gv = full.columns[0].pathways.find(
        (x) => x.id === 'GR-GOLDEN-VISA',
      )!;
      expect(gv.checks.find((x) => x.id === 'GV-TIME-LATE')?.status).toBe(
        'MET',
      );
      expect(
        gv.checks.find((x) => x.id === 'GR-GOLDEN-VISA-TIME')?.status,
      ).toBe('MET');
    }
  });
});

describe('common permit rules', () => {
  const id = 'GR-WORK';
  const check = (key: string, req: Partial<GrFullRequest>) =>
    condition(id, key, {
      work: { permit: 'E4', stage: 'initial', admission: 'ordinary' },
      ...req,
    });
  test('passport document bounds and pending exceptions; naturalisation only needs the identity document', () => {
    const pass = base.passport;
    expect(
      check('C-01', { passport: { ...pass, issuedOn: '2016-11-23' } }).status,
    ).toBe('MET');
    for (const patch of [
      { issuedOn: '2016-11-22' },
      { blankPages: 1 },
      { expiresOn: '2027-08-11' },
    ]) {
      expect(check('C-01', { passport: { ...pass, ...patch } }).status).toBe(
        'NOT_MET',
      );
    }
    expect(
      check('C-01', { passport: { kind: 'exception-granted' } }).status,
    ).toBe('MET');
    expect(
      check('C-01', { passport: { kind: 'exception-pending' } }).pendingDetails,
    ).toEqual(['PD-300']);
    expect(
      check('C-01', { passport: { ...pass, expectedDeparture: undefined } })
        .status,
    ).toBe('UNKNOWN');
    expect(
      condition('GR-NATIONALITY', 'C-01', {
        passport: { kind: 'recognised', expiresOn: day },
      }).status,
    ).toBe('MET');
  });
  test('national-visa, in-country and health screening apply at first entry', () => {
    expect(check('C-02', { entry: 'short-stay' }).status).toBe('NOT_MET');
    expect(
      check('C-02', {
        entry: 'short-stay',
        work: { permit: 'E1', stage: 'initial' },
      }).status,
    ).toBe('MET');
    expect(check('C-02', { entry: 'receipt' }).status).toBe('UNKNOWN');
    expect(
      check('C-04', { entry: 'national-visa', publicHealth: 'possible-risk' })
        .pendingDetails,
    ).toEqual(['PD-302']);
    expect(
      check('C-04', { entry: 'national-visa', publicHealth: 'entry-refused' })
        .status,
    ).toBe('NOT_MET');
    expect(
      check('C-04', { entry: 'national-visa', publicHealth: 'cleared' }).status,
    ).toBe('MET');
    expect(
      path(id, {
        work: { permit: 'E4', stage: 'renewal' },
        publicHealth: 'entry-refused',
      }).checks.some((x) => x.id === 'C-04'),
    ).toBe(false);
  });
  test('sanctions are distinguished from a decision about the person', () => {
    expect(
      check('C-03', {
        publicOrder: 'review',
        character: { finalSentenceMonths: 12 },
      }).pendingDetails,
    ).toEqual(['PD-301']);
    expect(check('C-03', { publicOrder: 'clear' }).status).toBe('MET');
    expect(
      check('C-03', { character: { seriousSecurityListingYears: 6 } }).status,
    ).toBe('NOT_MET');
    expect(
      check('C-03', { character: { seriousSecurityListingYears: 5 } }).status,
    ).toBe('MET');
    expect(
      check('C-03', { birthDate: '2011-11-24', publicOrder: undefined }).status,
    ).toBe('MET');
    expect(
      check('C-03', { birthDate: '2011-11-23', publicOrder: undefined }).status,
    ).toBe('UNKNOWN');
  });
  test('insurance checks all three limits, maximum participation, exclusions and term', () => {
    const policy: GrInsurance = {
      kind: 'private',
      disabilityEur: 15000,
      medicalEur: 1500,
      hospitalEur: 10000,
      maxCopayPercent: 20,
      policyMonths: 12,
      hasDeductibleOrExclusions: false,
    };
    const coverage = (insurance: GrInsurance) =>
      condition('GR-GOLDEN-VISA', 'C-05', { insurance }).status;
    expect(coverage(policy)).toBe('MET');
    for (const patch of [
      { disabilityEur: 14999 },
      { medicalEur: 1499 },
      { hospitalEur: 9999 },
      { maxCopayPercent: 21 },
      { policyMonths: 11 },
      { hasDeductibleOrExclusions: true },
    ])
      expect(coverage({ ...policy, ...patch })).toBe('NOT_MET');
    expect(coverage({ ...policy, medicalEur: undefined })).toBe('UNKNOWN');
  });
  test('change deadlines use calendar months/years and passport renewals have their own filing date', () => {
    const report = (
      kind: 'ordinary' | 'birth' | 'passport-renewed',
      occurredOn: string,
      reportedOn: string,
      nextCardFiling?: string,
    ) =>
      check('C-06', {
        changes: [{ kind, occurredOn, reportedOn, nextCardFiling }],
      }).status;
    expect(report('ordinary', '2026-06-30', '2026-08-30')).toBe('MET');
    expect(report('ordinary', '2026-06-30', '2026-08-31')).toBe('NOT_MET');
    expect(report('birth', '2024-04-20', '2026-04-20')).toBe('MET');
    expect(report('birth', '2024-04-20', '2026-04-21')).toBe('NOT_MET');
    expect(
      report('passport-renewed', '2026-01-03', '2026-10-20', '2026-10-20'),
    ).toBe('MET');
  });
  test('fingerprinting from the sixth birthday, exemption and two missed appointments', () => {
    const missed = { biometrics: undefined, missedFingerprintAppointments: 2 };
    expect(check('C-07', { ...missed, birthDate: '2020-11-24' }).status).toBe(
      'MET',
    );
    expect(check('C-07', { ...missed, birthDate: '2020-11-23' }).status).toBe(
      'NOT_MET',
    );
    expect(
      check('C-07', { ...missed, biometrics: 'medical-exemption' }).status,
    ).toBe('MET');
    expect(
      check('C-07', { biometrics: undefined, missedFingerprintAppointments: 1 })
        .status,
    ).toBe('UNKNOWN');
  });
  test('ordinary renewal windows preserve calendar-month edges and the M.1 exception', () => {
    const request: Partial<GrFullRequest> = {
      work: { permit: 'E4', stage: 'renewal' },
      currentCardExpiresOn: '2026-08-23',
    };
    expect(check('C-07-window', request).status).toBe('MET');
    expect(
      check('C-07-window', { ...request, simulationDate: '2026-11-24' }).status,
    ).toBe('NOT_MET');
    expect(
      check('C-07-window', {
        ...request,
        simulationDate: '2026-11-24',
        renewalForceMajeure: 'pending',
      }).status,
    ).toBe('UNKNOWN');
    expect(
      condition('GR-LONG-TERM', 'C-07-window', {
        currentCardExpiresOn: '2026-08-23',
        longTerm: { stage: 'renewal' },
      }).status,
    ).toBe('NOT_MET');
  });
});

test('citizenship selects the applicable permit population and a restricted permit still allows B.5', () => {
  expect(path('GR-WORK', { citizenship: 'eu' }).status).toBe('NOT_APPLICABLE');
  expect(path('GR-NATIONALITY', { citizenship: 'greek' }).status).toBe(
    'NOT_APPLICABLE',
  );
  expect(
    condition('GR-NATIONALITY', 'GR-APPLICANT', { citizenship: 'eu' }).status,
  ).toBe('MET');
  expect(
    condition('GR-GOLDEN-VISA', 'C-02', { entry: 'restricted-permit' }).status,
  ).toBe('MET');
  expect(
    condition('GR-WORK', 'C-02', {
      entry: 'short-stay',
      work: { permit: 'E4', stage: 'initial' },
    }).status,
  ).toBe('UNKNOWN');
});

test('B.5 permits filing from abroad by duly authorised mandate', () => {
  for (const [overseasInvestorMandate, status] of [
    [true, 'MET'],
    [false, 'NOT_MET'],
    [undefined, 'UNKNOWN'],
  ] as const) {
    const check = condition('GR-GOLDEN-VISA', 'C-02', {
      entry: 'outside',
      overseasInvestorMandate,
      locale: 'en',
    });
    expect(check.status).toBe(status);
    expect(check.explanation).toContain('12 months');
  }
});

test('naturalisation oath is assessed independently of application conditions and prior rejection', () => {
  const oath = { stage: 'oath', publicationDate: '2025-11-23' } as const;
  const completed = path('GR-NATIONALITY', {
    permits: undefined,
    citizenship: 'stateless',
    nationality: { ...oath, oathDate: day, lastRejection: '2026-11-01' },
  });
  expect(completed.status).toBe('MET');
  expect(completed.checks.map((c) => c.id)).toEqual(['GR-APPLICANT', 'NAT-12']);
  expect(
    path('GR-NATIONALITY', {
      simulationDate: '2026-11-24',
      nationality: { ...oath, oathDate: '2026-11-24' },
    }).status,
  ).toBe('NOT_MET');
  expect(path('GR-NATIONALITY', { nationality: oath }).status).toBe('UNKNOWN');
});

test('birth and continuous residence exempt only the general time requirement', () => {
  const p = path('GR-NATIONALITY', {
    permits: [],
    nationality: { bornAndContinuouslyResident: true, exam: 'not-passed' },
  });
  expect(p.checks.find((c) => c.id === 'NAT-BIRTH-EXEMPTION')?.status).toBe(
    'MET',
  );
  expect(p.checks.some((c) => c.id === 'GR-NATIONALITY-TIME')).toBe(false);
  expect(p.status).toBe('NOT_MET');
});

test.each([
  [day, '2027-03-01', 'FUTURE', '2027-01-01'],
  ['2027-01-01', '2027-03-01', 'MET', undefined],
  ['2025-06-23', '2025-04-01', 'NOT_MET', undefined],
  ['2025-05-01', '2025-04-01', 'MET', undefined],
  ['2026-02-05', '2025-12-05', 'NOT_MET', undefined],
  ['2026-02-06', '2025-12-05', 'MET', undefined],
] as const)(
  'E.4 renewal on %s applies the window for the simulation date, expiry %s',
  (simulationDate, currentCardExpiresOn, status, earliestDate) => {
    const result = path('GR-WORK', {
      simulationDate,
      currentCardExpiresOn,
      renewalForceMajeure: 'none',
      work: {
        permit: 'E4',
        stage: 'renewal',
        contractMonths: 12,
        payBasis: 'monthly',
        grossPayEur: 1500,
        taxesSettledDuringPermit: true,
      },
    });
    const check = result.checks.find((x) => x.id === 'C-07-window');
    expect(check?.status).toBe(status === 'FUTURE' ? 'NOT_MET' : status);
    if (earliestDate) expect(check?.explanation).toContain(earliestDate);
    expect(result.status).toBe(status);
    expect(result.earliestDate).toBe(earliestDate);
  },
);

test('B.5 uses the historical grace period through the full entry only', () => {
  const request = {
    ...base,
    simulationDate: '2025-06-23',
    permits: [
      { kind: 'investor' as const, from: '2020-04-01', to: '2025-04-01' },
    ],
  };
  const result = path('GR-GOLDEN-VISA', {
    ...request,
    goldenVisa: { stage: 'renewal' },
    renewalForceMajeure: 'none',
  });
  expect(
    result.checks.find((x) => x.id === 'GR-GOLDEN-VISA-TIME')?.status,
  ).toBe('NOT_MET');
  expect(result.status).toBe('NOT_MET');
  expect(result.earliestDate).toBeUndefined();
  expect(evaluateGreece(request).pathways[1].status).toBe('MET');
});

test('a simulation before the archived Migration Code requests the rules in force on that day', () => {
  const result = path('GR-WORK', { simulationDate: '2024-03-30' });
  expect(result.checks.find((x) => x.id === 'GR-LAW-DATE')).toMatchObject({
    status: 'UNKNOWN',
    pendingDetails: ['PD-300'],
  });
  expect(result.status).toBe('UNKNOWN');
  expect(result.earliestDate).toBeUndefined();
  expect(
    path('GR-WORK', { simulationDate: '2024-03-31' }).checks.some(
      (x) => x.id === 'GR-LAW-DATE',
    ),
  ).toBe(false);
});
