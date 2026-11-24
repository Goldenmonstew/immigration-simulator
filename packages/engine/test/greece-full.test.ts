import { describe, expect, test } from 'vitest';
import {
  RULE_SET_IDS_BY_COUNTRY,
  PARAMETERS_BY_COUNTRY,
} from '@uk-immigration/policy-data';
import { evaluateGreece, evaluateGreeceFull } from '../src';
import type { GrFullPathwayId, GrFullRequest, GrInsurance } from '../src';

const day = '2026-11-23';
const base = {
  filingDocuments: { formReady: true, feeReceiptReady: true },
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
    issuedOn: '2023-08-13',
    blankPages: 2,
    expectedDeparture: '2033-05-12',
    expiresOn: '2033-08-12',
  },
  longTerm: {
    stage: 'initial',
    category: 'ordinary',
    passportHistory: 'complete',
  },
  goldenVisa: { stage: 'initial' },
  nationality: { stage: 'application' },
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

test.each([
  [true, true, 'MET'],
  [false, true, 'NOT_MET'],
  [undefined, true, 'UNKNOWN'],
  [true, false, 'NOT_MET'],
  [true, undefined, 'UNKNOWN'],
] as const)(
  'paid Μ.1 application checks the form (%s) and fee receipt (%s)',
  (formReady, feeReceiptReady, status) => {
    const result = path('GR-LONG-TERM', {
      filingDocuments: { formReady, feeReceiptReady },
    });
    expect(result.checks.find((c) => c.id === 'C-FILING')?.status).toBe(status);
    expect(result.status).toBe(status);
  },
);

test('Μ.1 card renewal requires the form and is exempt from the application fee', () => {
  const result = path('GR-LONG-TERM', {
    longTerm: { stage: 'renewal' },
    filingDocuments: { formReady: true, feeReceiptReady: false },
  });
  expect(result.checks.find((c) => c.id === 'C-FILING')?.status).toBe('MET');
  expect(
    path('GR-EU-FAMILY-PR', {
      euFamily: { stage: 'maintain' },
      filingDocuments: { formReady: false },
    }).checks.some((c) => c.id === 'C-FILING'),
  ).toBe(false);
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
    const expiringPassport = {
      permits,
      passport: {
        ...base.passport,
        expectedDeparture: '2027-05-12',
        expiresOn: '2027-08-12',
      },
    };
    const needsPassport = path(id, expiringPassport);
    const filed = path(id, {
      ...expiringPassport,
      simulationDate: '2029-01-31',
    });
    expect(filed.status).toBe('NOT_MET');
    expect(needsPassport.checks.find((x) => x.id === 'C-01')).toMatchObject({
      status: filed.status,
      explanation: expect.stringContaining('2029-01-31'),
    });
    expect(needsPassport.status).toBe(filed.status);
    expect(needsPassport.earliestDate).toBeUndefined();
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

  test('Article 43 assesses the final Greek residence independently of the Member State total', () => {
    const blueCardMobility: NonNullable<GrFullRequest['blueCardMobility']> = {
      usedLongTermMobility: true,
      greekBlueCardFrom: '2024-11-23',
      priorMemberPeriods: [
        { kind: 'blue-card', from: '2021-11-23', through: '2024-11-22' },
      ],
      otherMemberTrips: [],
    };
    const input = { permits: [], blueCardMobility };
    const longTrip = { departed: '2025-01-01', returned: '2025-08-01' };
    expect(path(id, { ...input, trips: [longTrip] }).status).toBe('UNKNOWN');
    expect(
      path(id, {
        ...input,
        trips: [longTrip],
        blueCardMobility: {
          ...blueCardMobility,
          greekResidenceFrom: '2024-11-23',
        },
      }).status,
    ).toBe('MET');
    expect(
      path(id, {
        ...input,
        trips: [{ departed: '2019-01-01', returned: '2021-11-23' }],
      }).status,
    ).toBe('MET');
  });

  test('a future return cannot lengthen the absence before filing', () => {
    expect(
      path(id, {
        trips: [{ departed: '2026-11-10', returned: '2028-01-01' }],
      }).status,
    ).toBe('MET');
    const pastBreak = { departed: '2020-01-01', returned: '2021-11-24' };
    expect(path(id, { trips: [pastBreak] })).toMatchObject({
      status: 'FUTURE',
      earliestDate: '2026-11-24',
    });
    expect(
      path(id, { trips: [pastBreak], simulationDate: '2026-11-24' }).status,
    ).toBe('MET');
  });

  test('M.1 retention considers only recorded Greek absences since the status grant', () => {
    const input: Partial<GrFullRequest> = {
      currentCardExpiresOn: '2026-12-01',
      longTerm: {
        stage: 'renewal',
        passportHistory: 'complete',
        statusGrantedOn: '2017-01-01',
        otherMemberStateLongTermOrRevocationGround: false,
        continuousOutsideEuMonths: 0,
        continuousOutsideGreeceYears: 0,
      },
    };
    const after = { departed: '2018-01-01', returned: '2024-02-01' };
    expect(path(id, { ...input, trips: [after] }).status).toBe('NOT_MET');
    expect(
      path(id, {
        ...input,
        trips: [{ departed: '2010-01-01', returned: '2017-01-01' }],
      }).status,
    ).toBe('MET');
    for (const [formerBlueCardEndorsement, expected] of [
      [true, 'MET'],
      [false, 'UNKNOWN'],
    ] as const) {
      expect(
        path(id, {
          ...input,
          longTerm: {
            ...input.longTerm,
            formerBlueCardEndorsement,
            continuousOutsideEuMonths: undefined,
          },
          trips: [{ departed: '2024-01-01', returned: '2025-02-01' }],
        }).status,
      ).toBe(expected);
    }
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
        goldenVisa: { stage: 'renewal' as const },
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
      { expiresOn: '2033-08-11' },
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
  test.each(['national-visa', 'short-stay', 'permit'] as const)(
    'only initial procedures listing public health include C-04 with entry %s',
    (entry) => {
      const result = evaluateGreeceFull({
        ...base,
        entry,
        longTerm: { ...base.longTerm, stage: 'initial' },
        goldenVisa: { stage: 'initial' },
        nationality: { stage: 'application' },
        tenYear: { stage: 'initial', basis: 'residence' },
        greekFamily: { stage: 'initial' },
        euFamily: { stage: 'permanent' },
        work: { permit: 'E4', stage: 'initial' },
        familyTcn: { stage: 'initial' },
      });
      const screened = result.columns[0].pathways.filter((p) =>
        p.checks.some((check) => check.id === 'C-04'),
      );
      expect(screened.map((p) => p.id)).toEqual([
        'GR-GOLDEN-VISA',
        'GR-WORK',
        'GR-FAMILY-TCN',
      ]);
    },
  );
  test('renewal, permanent residence and oath use their own common checklists', () => {
    const result = evaluateGreeceFull({
      ...base,
      longTerm: { stage: 'renewal' },
      goldenVisa: { stage: 'renewal' },
      nationality: { stage: 'oath' },
      tenYear: { stage: 'renewal', basis: 'residence' },
      greekFamily: { stage: 'permanent' },
      euFamily: { stage: 'maintain' },
      work: { stage: 'renewal', permit: 'E4' },
      familyTcn: { stage: 'renewal' },
    });
    const ordinaryRenewal = [
      'C-01',
      'C-FILING',
      'C-03',
      'C-06',
      'C-07',
      'C-07-window',
    ];
    const byPath = Object.fromEntries(
      result.columns[0].pathways.map((pathway) => [
        pathway.id,
        pathway.checks
          .map((item) => item.id)
          .filter((key) => key.startsWith('C-')),
      ]),
    );
    expect(byPath).toEqual({
      'GR-LONG-TERM': ['C-01', 'C-FILING', 'C-06', 'C-07', 'C-07-window'],
      'GR-GOLDEN-VISA': ['C-01', 'C-FILING', 'C-03', 'C-05', 'C-06', 'C-07'],
      'GR-NATIONALITY': [],
      'GR-TEN-YEAR': ordinaryRenewal,
      'GR-GREEK-FAMILY-PR': ['C-01', 'C-FILING', 'C-06', 'C-07'],
      'GR-EU-FAMILY-PR': [],
      'GR-WORK': ordinaryRenewal,
      'GR-FAMILY-TCN': ordinaryRenewal,
    });
  });

  test.each(['bereavement', 'divorce', 'hardship'] as const)(
    'Ο.2 initial grant after %s requires the applicant’s own cover',
    (autonomousBasis) => {
      const result = path('GR-FAMILY-TCN', {
        familyTcn: { stage: 'autonomous', autonomousBasis },
        insurance: { kind: 'uninsured' },
      });
      expect(result.checks.find((item) => item.id === 'C-05')?.status).toBe(
        'NOT_MET',
      );
      expect(result.checks.some((item) => item.id === 'FT-04')).toBe(false);
      expect(result.status).toBe('NOT_MET');
    },
  );

  test('initial employment checks lawful entry and public health separately', () => {
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
      check('C-03', { birthDate: undefined, publicOrder: 'adverse' }).status,
    ).toBe('UNKNOWN');
    expect(
      check('C-03', { birthDate: undefined, publicOrder: 'clear' }).status,
    ).toBe('MET');
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
      issuer: 'greek',
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
    expect(check('C-07', { ...missed, birthDate: undefined }).status).toBe(
      'UNKNOWN',
    );
    expect(
      check('C-07', {
        ...missed,
        birthDate: undefined,
        biometrics: 'medical-exemption',
      }).status,
    ).toBe('MET');
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

describe.each([
  {
    lastRejection: '2026-08-15',
    opening: '2027-08-15',
    permits: base.permits,
  },
  {
    lastRejection: 'none',
    opening: '2027-01-01',
    permits: [
      { kind: 'regular', from: '2019-01-01', to: '2019-06-30' },
      { kind: 'regular', from: '2020-01-01' },
    ],
  },
] satisfies {
  lastRejection: string;
  opening: string;
  permits: GrFullRequest['permits'];
}[])(
  'naturalisation filing in a later tax year (last rejection: $lastRejection)',
  ({ lastRejection, opening, permits }) => {
    test.each([
      [[2019, 2020, 2021, 2022, 2023], 'UNKNOWN'],
      [[2019, 2020, 2021, 2022, 2023, 2024], 'FUTURE'],
      [[2020, 2021, 2022, 2023, 2026], 'FUTURE'],
    ] as const)(
      'checks the projected tax window with records for %j',
      (years, projectedStatus) => {
        const nationality = {
          stage: 'application',
          permit: 'listed',
          convictions: [],
          removalOrStatusProceedings: false,
          exam: 'certificate',
          economicActivity: 'stable-declared-work',
          livingResources: 'substantiated',
          incomeByTaxYear: Object.fromEntries(
            years.map((year) => [year, { taxableEur: 8000, dependants: 0 }]),
          ),
          taxAndSocialInsuranceCurrent: true,
          integrationAssessment: 'accepted',
          civilStatusProof: 'legalised-translation',
          hasAmka: true,
          hasTaxAssessments: true,
          lastRejection,
        } satisfies GrFullRequest['nationality'];
        const checkOn = (simulationDate: string) =>
          path('GR-NATIONALITY', { simulationDate, permits, nationality });
        const projection = checkOn(day);
        const onOpening = checkOn(opening);
        const earliestDate = projectedStatus === 'FUTURE' ? opening : undefined;
        const incomeStatus = earliestDate ? 'MET' : 'UNKNOWN';
        for (const result of [projection, onOpening])
          expect(
            result.checks.find((check) => check.id === 'NAT-07')?.status,
          ).toBe(incomeStatus);
        expect(projection.status).toBe(projectedStatus);
        expect(projection.earliestDate).toBe(earliestDate);
        expect(onOpening.status).toBe(earliestDate ? 'MET' : 'UNKNOWN');
        expect(onOpening.earliestDate).toBe(earliestDate);
      },
    );
  },
);

test('nationality uses only full absence days before the actual filing', () => {
  const id = 'GR-NATIONALITY';
  const nationality = {
    stage: 'application',
    pendingApplicationFiledOn: '2025-11-23',
  } as const;
  const assess = (trips: GrFullRequest['trips']) =>
    condition(id, id + '-TIME', { nationality, trips }).status;
  expect(assess([{ departed: '2017-01-01', returned: '2018-11-23' }])).toBe(
    'MET',
  );
  expect(assess([{ departed: '2017-01-01', returned: '2018-11-24' }])).toBe(
    'UNKNOWN',
  );
  expect(assess([{ departed: '2025-11-22', returned: '2026-02-01' }])).toBe(
    'MET',
  );
});

test('reported travel since birth requires verification unless the ordinary nationality window qualifies', () => {
  const id = 'GR-NATIONALITY';
  const nationality = {
    stage: 'application',
    bornAndContinuouslyResident: true,
  } as const;
  const trips = [{ departed: '2010-01-01', returned: '2014-01-01' }];
  expect(
    condition(id, 'NAT-BIRTH-EXEMPTION', { nationality, permits: [], trips })
      .status,
  ).toBe('UNKNOWN');
  expect(condition(id, id + '-TIME', { nationality, trips }).status).toBe(
    'MET',
  );
  expect(
    condition(id, 'NAT-BIRTH-EXEMPTION', {
      nationality,
      trips: [{ departed: '1981-01-01', returned: base.birthDate }],
    }).status,
  ).toBe('MET');
});

test('birth and continuous residence exempt only the general time requirement', () => {
  const p = path('GR-NATIONALITY', {
    permits: [],
    nationality: {
      stage: 'application',
      bornAndContinuouslyResident: true,
      exam: 'not-passed',
    },
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

test('two renewal cards cannot share an unlabelled expiry date', () => {
  const request = {
    ...base,
    pathways: ['GR-WORK', 'GR-LONG-TERM'],
    currentCardExpiresOn: '2026-12-30',
    work: { permit: 'E4', stage: 'renewal', taxesSettledDuringPermit: true },
    longTerm: { stage: 'renewal' },
  } satisfies GrFullRequest;
  const result = evaluateGreeceFull(request);
  for (const route of result.columns[0].pathways)
    expect(
      route.checks.find((check) => check.id === 'C-07-window')?.status,
    ).toBe('UNKNOWN');
});

test('Ε.4 and Μ.2 retain their own renewal windows when filed together', () => {
  const request = {
    ...base,
    simulationDate: '2026-11-24',
    currentCardExpiresOn: '2026-12-30',
    work: { permit: 'E4', stage: 'renewal', taxesSettledDuringPermit: true },
    tenYear: { stage: 'renewal', cardExpiresOn: '2027-01-15' },
    pathways: ['GR-WORK', 'GR-TEN-YEAR'],
  } satisfies GrFullRequest;
  const [work, tenYear] = evaluateGreeceFull(request).columns[0].pathways;
  expect(work.status).toBe('MET');
  for (const [route, opens] of [
    [work, '2026-10-30'],
    [tenYear, '2026-11-15'],
  ] as const) {
    expect(
      route.checks.find((check) => check.id === 'C-07-window'),
    ).toMatchObject({
      status: 'MET',
      explanation: expect.stringContaining(opens),
    });
  }
  const ambiguous = evaluateGreeceFull({
    ...request,
    longTerm: { stage: 'renewal' },
  }).columns[0].pathways;
  expect(
    ambiguous.map(
      (route) => route.checks.find((c) => c.id === 'C-07-window')?.status,
    ),
  ).toEqual(['UNKNOWN', 'MET']);
});

test('dated investor and family grants leave the unlabelled expiry for the employment renewal', () => {
  const result = evaluateGreeceFull({
    ...base,
    currentCardExpiresOn: '2026-12-30',
    renewalForceMajeure: 'none',
    permits: [
      { kind: 'investor', from: '2021-06-01', to: '2026-06-01' },
      {
        kind: 'regular',
        purpose: 'family-reunification',
        from: '2024-04-01',
        to: '2026-04-01',
      },
    ],
    goldenVisa: { stage: 'renewal' },
    familyTcn: { stage: 'renewal' },
    euFamily: { stage: 'permanent-renewal', priorCardExpiry: '2027-01-01' },
    work: { permit: 'E4', stage: 'renewal', taxesSettledDuringPermit: true },
    pathways: ['GR-GOLDEN-VISA', 'GR-FAMILY-TCN', 'GR-WORK'],
  });
  const [golden, family, work] = result.columns[0].pathways;
  expect(
    golden.checks.find((c) => c.id === 'GR-GOLDEN-VISA-TIME')?.status,
  ).toBe('NOT_MET');
  expect(family.checks.find((c) => c.id === 'C-07-window')).toMatchObject({
    status: 'NOT_MET',
    explanation: expect.stringContaining('2026-02-01'),
  });
  expect(work.status).toBe('MET');
});

test('a protected resident confirms a possible article 144(2A) exclusion for a trip that changes the filing date', () => {
  const grantedProtection = {
    claimedOn: '2019-11-24',
    grantedOn: '2020-04-10',
  };
  const request = {
    grantedProtection,
    permits: [{ kind: 'regular', from: '2020-04-10' }],
    trips: [{ departed: '2024-04-10', returned: '2024-04-12' }],
  } satisfies Partial<GrFullRequest>;
  expect(
    path('GR-LONG-TERM', {
      ...request,
      trips: [
        { departed: '2020-04-01', returned: grantedProtection.grantedOn },
      ],
    }).status,
  ).toBe('MET');
  const result = path('GR-LONG-TERM', request);
  expect(
    result.checks.find((check) => check.id === 'GR-LONG-TERM-TIME')?.status,
  ).toBe('UNKNOWN');
  expect(result.status).toBe('UNKNOWN');
  expect(result.earliestDate).toBeUndefined();
  expect(
    path('GR-LONG-TERM', {
      ...request,
      grantedProtection: {
        ...grantedProtection,
        priorResidenceExcludedThrough: 'none',
      },
    }).status,
  ).toBe('MET');
});

test('a future investor card cannot supply the expiry for a current renewal', () => {
  const result = path('GR-GOLDEN-VISA', {
    goldenVisa: { stage: 'renewal' },
    permits: [{ kind: 'investor', from: '2026-12-01', to: '2031-12-01' }],
  });
  expect(
    result.checks.find((check) => check.id === 'GR-GOLDEN-VISA-TIME')?.status,
  ).toBe('UNKNOWN');
  expect(result.earliestDate).toBeUndefined();
});
