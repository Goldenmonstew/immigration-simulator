import { describe, expect, test } from 'vitest';
import { evaluateGreeceFull } from '../src';
import { grContext } from '../src/greece-rules';
import { settlementChecks } from '../src/greece-settlement';
import type { GrFullRequest } from '../src/greece-full';

type Route = Parameters<typeof settlementChecks>[0];
const lt = 'GR-LONG-TERM';
const ty = 'GR-TEN-YEAR';
const nat = 'GR-NATIONALITY';
const day = '2026-11-23';
const good = {
  simulationDate: day,
  route: 'general',
  birthDate: '1985-05-12',
  trips: [],
  permits: [{ kind: 'regular', from: '2016-11-23' }],
  publicOrder: 'clear',
  insurance: { kind: 'public', coversFamily: true },
  longTerm: { category: 'ordinary', passportHistory: 'complete' },
  residenceIncome: { netEur: 14168, dependants: 3, regularAndDocumented: true },
  integration: { basis: 'language', greekLevel: 'B1' },
  tenYear: { basis: 'residence', residesInGreece: true },
} satisfies GrFullRequest;

function rules(route: Route, r: Partial<GrFullRequest>) {
  return settlementChecks(route, { ...good, ...r }, grContext('en'));
}
function check(route: Route, id: string, r: Partial<GrFullRequest> = {}) {
  return rules(route, r).find((c) => c.id === id)!;
}
function status(route: Route, id: string, r: Partial<GrFullRequest> = {}) {
  return check(route, id, r).status;
}
function full(route: Route, r: Partial<GrFullRequest>) {
  return evaluateGreeceFull({
    ...good,
    citizenship: 'third-country',
    entry: 'permit',
    passport: { kind: 'exception-granted' },
    changes: [],
    biometrics: 'provided',
    ...r,
    pathways: [route],
  }).columns[0].pathways[0];
}
const incomes = (years: number[], taxableEur: number, dependants = 0) =>
  Object.fromEntries(years.map((y) => [y, { taxableEur, dependants }]));

describe('M.1 long-term grant and retention', () => {
  test('current category, all-family insurance, public-order discretion and past passports', () => {
    for (const c of rules(lt, {})) expect(c.status, c.id).toBe('MET');
    expect(
      check(lt, 'LT-01', { longTerm: { category: 'investor' } }).pendingDetails,
    ).toEqual(['PD-101']);
    expect(
      status(lt, 'LT-01', { longTerm: { category: 'asylum-pending' } }),
    ).toBe('NOT_MET');
    expect(status(lt, 'LT-01', { longTerm: { category: 'protected' } })).toBe(
      'MET',
    );
    expect(
      status(lt, 'LT-03', {
        insurance: { kind: 'public', coversFamily: false },
      }),
    ).toBe('NOT_MET');
    expect(
      status(lt, 'LT-03', {
        insurance: { kind: 'public' },
        residenceIncome: { dependants: 0 },
      }),
    ).toBe('MET');
    expect(
      check(lt, 'LT-05', { publicOrder: 'review' }).pendingDetails,
    ).toEqual(['PD-301']);
    expect(status(lt, 'LT-05', { publicOrder: 'adverse' })).toBe('NOT_MET');
    expect(
      status(lt, 'LT-06', { longTerm: { passportHistory: 'missing' } }),
    ).toBe('UNKNOWN');
    expect(check(lt, 'LT-06').explanation).toMatch(/€150.*€0.*€16/);
    expect(check(lt, 'LT-08').explanation).toMatch(/no separate floor-area/i);
  });

  test.each([
    [12880, 0, 'MET'],
    [12879.99, 0, 'UNKNOWN'],
    [14168, 1, 'MET'],
    [14168, 3, 'MET'],
    [14167.99, 3, 'UNKNOWN'],
    [0, 0, 'NOT_MET'],
  ] as const)(
    'previous tax year net %s, %s dependants: %s',
    (netEur, dependants, s) => {
      const c = check(lt, 'LT-02', {
        residenceIncome: { netEur, dependants, regularAndDocumented: true },
      });
      expect(c.status).toBe(s);
      if (s === 'UNKNOWN') expect(c.pendingDetails).toContain('PD-304');
    },
  );
  test('annual uplift takes effect on the first of April', () => {
    const r = {
      residenceIncome: {
        netEur: 12320,
        dependants: 0,
        regularAndDocumented: true,
      },
    };
    expect(status(lt, 'LT-02', { ...r, simulationDate: '2026-03-31' })).toBe(
      'MET',
    );
    expect(status(lt, 'LT-02', { ...r, simulationDate: '2026-04-01' })).toBe(
      'UNKNOWN',
    );
  });
  test('the income method and expanded integration credentials apply from their own commencement dates', () => {
    const historical = full(lt, { simulationDate: '2024-09-16' });
    const income = historical.checks.find((c) => c.id === 'LT-02');
    expect(income?.status).toBe('UNKNOWN');
    expect(income?.pendingDetails).toContain('PD-304');
    expect(historical.status).toBe('UNKNOWN');
    expect(historical.earliestDate).toBeUndefined();
    expect(full(lt, { simulationDate: '2024-09-17' })).toMatchObject({
      status: 'MET',
      earliestDate: '2024-09-17',
    });
    for (const basis of ['second-chance-school', 'greek-degree'] as const) {
      expect(
        full(lt, { simulationDate: '2026-02-05', integration: { basis } })
          .status,
      ).toBe('NOT_MET');
      expect(
        full(lt, { simulationDate: '2026-02-06', integration: { basis } }),
      ).toMatchObject({ status: 'MET', earliestDate: '2026-02-06' });
    }
  });
  test('the archived 2024 wage is also usable for a historical previous tax year', () => {
    expect(
      status(lt, 'LT-02', {
        simulationDate: '2024-11-23',
        residenceIncome: {
          netEur: 11620,
          dependants: 0,
          regularAndDocumented: true,
        },
      }),
    ).toBe('MET');
  });
  test('A2 requires both marks; the history-only sitting accepts modern A2 or legacy A', () => {
    const base = { basis: 'a2', a2Total: 50, a2SectionsAtPassMark: 4 } as const;
    expect(
      status(lt, 'LT-04', { integration: base, birthDate: '2010-11-23' }),
    ).toBe('MET');
    expect(
      status(lt, 'LT-04', { integration: base, birthDate: '2010-11-24' }),
    ).toBe('NOT_MET');
    expect(
      status(lt, 'LT-04', {
        integration: { ...base, a2SectionsAtPassMark: 3 },
      }),
    ).toBe('NOT_MET');
    expect(status(lt, 'LT-04', { integration: { ...base, a2Total: 49 } })).toBe(
      'NOT_MET',
    );
    const hist = {
      basis: 'history',
      greekLevel: 'A2',
      historyPoints: 10,
    } as const;
    expect(status(lt, 'LT-04', { integration: hist })).toBe('MET');
    expect(
      status(lt, 'LT-04', { integration: { ...hist, greekLevel: 'legacy-A' } }),
    ).toBe('MET');
    expect(
      status(lt, 'LT-04', { integration: { ...hist, greekLevel: 'A1' } }),
    ).toBe('NOT_MET');
    expect(
      status(lt, 'LT-04', { integration: { ...hist, historyPoints: 9 } }),
    ).toBe('NOT_MET');
  });
  test('twelve consecutive years: date and disputed credit', () => {
    const e = {
      basis: 'residence',
      continuousFrom: '2014-11-23',
      includesStudyOrDisputedGap: false,
    } as const;
    expect(status(lt, 'LT-04', { integration: e })).toBe('MET');
    expect(
      status(lt, 'LT-04', {
        integration: { ...e, continuousFrom: '2014-11-24' },
      }),
    ).toBe('NOT_MET');
    expect(
      check(lt, 'LT-04', {
        integration: { ...e, includesStudyOrDisputedGap: true },
      }).pendingDetails,
    ).toEqual(['PD-305']);
    expect(
      status(lt, 'LT-04', {
        integration: { basis: 'language', greekLevel: 'A2' },
      }),
    ).toBe('NOT_MET');
  });
  test('a declared historical twelve-year total settles the integration check without a start date', () => {
    for (const [legacyTwelveLawfulYears, expected] of [
      [false, 'NOT_MET'],
      [true, 'MET'],
      [undefined, 'UNKNOWN'],
    ] as const) {
      const result = full(lt, {
        simulationDate: '2026-02-05',
        integration: { basis: 'residence', legacyTwelveLawfulYears },
      });
      expect(result.checks.find((c) => c.id === 'LT-04')?.status).toBe(
        expected,
      );
      expect(result.status).toBe(expected);
      if (expected !== 'MET') expect(result.earliestDate).toBeUndefined();
    }
  });
  test('renewal checks the passport history and continued status with an adverse or unresolved public-order finding', () => {
    const renewal = {
      stage: 'renewal',
      passportHistory: 'complete',
      continuousOutsideEuMonths: 0,
      continuousOutsideGreeceYears: 0,
      otherMemberStateLongTermOrRevocationGround: false,
    } as const;
    const request = { longTerm: renewal, currentCardExpiresOn: '2026-12-01' };
    for (const [passportHistory, expected] of [
      ['complete', 'MET'],
      ['official-substitute', 'MET'],
      ['missing', 'NOT_MET'],
      [undefined, 'UNKNOWN'],
    ] as const) {
      const result = full(lt, {
        ...request,
        longTerm: { ...renewal, passportHistory },
      });
      expect(result.checks.find((c) => c.id === 'LT-06')?.status).toBe(
        expected,
      );
      expect(result.status).toBe(expected);
    }
    for (const [publicOrder, expected] of [
      ['clear', 'MET'],
      ['adverse', 'NOT_MET'],
      ['review', 'UNKNOWN'],
      [undefined, 'UNKNOWN'],
    ] as const) {
      const result = full(lt, { ...request, publicOrder });
      expect(result.checks.find((c) => c.id === 'LT-07')?.status).toBe(
        expected,
      );
      expect(result.status).toBe(expected);
    }
  });
  test('a renewal only tests retained status and renewal documents', () => {
    const e = {
      stage: 'renewal',
      continuousOutsideEuMonths: 11,
      continuousOutsideGreeceYears: 6,
      formerBlueCardEndorsement: false,
      otherMemberStateLongTermOrRevocationGround: false,
    } as const;
    expect(rules(lt, { longTerm: e }).map((c) => c.id)).toEqual([
      'LT-06',
      'LT-07',
      'LT-08',
    ]);
    expect(status(lt, 'LT-07', { longTerm: e })).toBe('MET');
    expect(check(lt, 'LT-06', { longTerm: e }).explanation).toMatch(/€0.*€16/);
    expect(
      status(lt, 'LT-07', {
        longTerm: { ...e, continuousOutsideEuMonths: 12 },
      }),
    ).toBe('NOT_MET');
    expect(
      status(lt, 'LT-07', {
        longTerm: {
          ...e,
          continuousOutsideEuMonths: 24,
          formerBlueCardEndorsement: true,
        },
      }),
    ).toBe('MET');
    expect(
      status(lt, 'LT-07', {
        longTerm: { ...e, continuousOutsideGreeceYears: 6.01 },
      }),
    ).toBe('NOT_MET');
  });
});

describe('M.2 acquisition and conversion', () => {
  test('a qualifying backlog renewal bridges the two E.4 cards under article 52(1)', () => {
    const permits: GrFullRequest['permits'] = [
      { kind: 'regular', from: '2016-11-01', to: '2023-09-01' },
      { kind: 'regular', from: '2026-05-01' },
    ];
    const backlog = {
      filedOn: '2023-08-28',
      permitEffectiveOn: '2026-05-01',
      category: 'employment',
      typeAReceipt: true,
      pendingAtCommencement: true,
    } as const;
    const path = full(ty, { permits, backlogRenewals: [backlog] });
    expect(path.checks.find((c) => c.id === 'TY-01')).toMatchObject({
      status: 'MET',
    });
    expect(path.status).toBe('MET');
    expect(path.earliestDate).toBeUndefined();
    for (const patch of [
      { filedOn: '2021-12-31' },
      { pendingAtCommencement: false },
      { typeAReceipt: false },
      { category: 'other' },
    ] as const) {
      const later = full(ty, {
        permits,
        backlogRenewals: [{ ...backlog, ...patch }],
      });
      expect(later.checks.find((c) => c.id === 'TY-01')).toMatchObject({
        status: 'NOT_MET',
        explanation: expect.stringContaining('2036-05-01'),
      });
      expect(later).toMatchObject({
        status: 'FUTURE',
        earliestDate: '2036-05-01',
      });
    }
  });
  test('the latest of the ten-year and twelve-year integration anniversaries controls the filing date', () => {
    const path = full(ty, {
      permits: [{ kind: 'regular', from: '2016-11-24' }],
      integration: {
        basis: 'residence',
        continuousFrom: '2016-11-24',
        includesStudyOrDisputedGap: false,
      },
    });
    expect(path.checks.find((c) => c.id === 'TY-01')).toMatchObject({
      status: 'NOT_MET',
      explanation: expect.stringContaining('2026-11-24'),
    });
    expect(path.checks.find((c) => c.id === 'TY-02')).toMatchObject({
      status: 'NOT_MET',
      explanation: expect.stringContaining('2028-11-24'),
    });
    expect(path).toMatchObject({
      status: 'FUTURE',
      earliestDate: '2028-11-24',
    });
    expect(
      full(ty, { permits: [{ kind: 'regular', from: '2016-11-24', to: day }] })
        .status,
    ).toBe('NOT_MET');
  });
  test('the original article 161 integration and conversion rules apply before commencement', () => {
    const r = {
      simulationDate: '2026-02-05',
      permits: [{ kind: 'regular' as const, from: '2015-01-01' }],
      tenYear: { ...good.tenYear, legacyEconomicAndSocialIntegration: true },
      integration: { basis: 'none' as const },
    };
    const prior = full(ty, r);
    expect(prior.checks.find((c) => c.id === 'TY-02')?.status).toBe('MET');
    expect(prior.status).toBe('MET');
    expect(prior.earliestDate).toBeUndefined();
    expect(full(ty, { ...r, simulationDate: '2026-02-06' }).status).toBe(
      'NOT_MET',
    );
    const renewal = {
      stage: 'renewal',
      basis: 'residence',
      cardExpiresOn: '2026-02-05',
      hasPriorCard: true,
    } as const;
    expect(
      full(ty, {
        ...r,
        tenYear: renewal,
        currentCardExpiresOn: renewal.cardExpiresOn,
        residenceIncome: undefined,
      }).status,
    ).toBe('MET');
    const expiry = '2026-12-01';
    const upcoming = full(ty, {
      tenYear: { ...renewal, cardExpiresOn: expiry },
      currentCardExpiresOn: expiry,
    });
    expect(upcoming.checks.find((c) => c.id === 'TY-04')).toMatchObject({
      status: 'NOT_MET',
      explanation: expect.stringContaining(expiry),
    });
    expect(upcoming).toMatchObject({ status: 'FUTURE', earliestDate: expiry });
  });
  test('ten years on definitive permits, study ambiguity and integration', () => {
    for (const c of rules(ty, {})) expect(c.status, c.id).toBe('MET');
    expect(
      status(ty, 'TY-01', {
        permits: [{ kind: 'regular', from: '2016-11-24' }],
      }),
    ).toBe('NOT_MET');
    expect(
      check(ty, 'TY-01', { permits: [{ kind: 'study', from: '2016-11-23' }] })
        .pendingDetails,
    ).toEqual(['PD-312']);
    expect(status(ty, 'TY-02', { integration: { basis: 'none' } })).toBe(
      'NOT_MET',
    );
    expect(status(ty, 'TY-03', { insurance: { kind: 'uninsured' } })).toBe(
      'NOT_MET',
    );
    expect(check(ty, 'TY-06').explanation).toMatch(/€900.*€300.*€16/);
  });
  test('birth or six grades strictly before age 23 bypasses ordinary duration and language', () => {
    const e = {
      basis: 'birth-school',
      residesInGreece: true,
      bornInGreece: false,
      greekGrades: 6,
      ageAtSchoolCompletion: 22,
    } as const;
    expect(status(ty, 'TY-01', { tenYear: e, permits: [] })).toBe('MET');
    expect(check(ty, 'TY-02', { tenYear: e })).toBeUndefined();
    expect(
      status(ty, 'TY-01', { tenYear: { ...e, residesInGreece: false } }),
    ).toBe('NOT_MET');
    expect(
      status(ty, 'TY-01', {
        tenYear: { ...e, residesInGreece: undefined },
        permits: [],
      }),
    ).toBe('UNKNOWN');
    expect(
      status(ty, 'TY-01', {
        tenYear: { ...e, residesInGreece: undefined },
        entry: 'permit',
      }),
    ).toBe('MET');
    expect(
      status(ty, 'TY-01', { tenYear: { ...e, ageAtSchoolCompletion: 23 } }),
    ).toBe('NOT_MET');
    expect(status(ty, 'TY-01', { tenYear: { ...e, greekGrades: 5 } })).toBe(
      'NOT_MET',
    );
    expect(
      status(ty, 'TY-01', {
        tenYear: {
          basis: 'birth-school',
          bornInGreece: true,
          residesInGreece: true,
        },
      }),
    ).toBe('MET');
  });
  test('continuous absence of exactly two years bars M.2; future travel does not', () => {
    for (const [returned, expected] of [
      ['2025-11-22', 'MET'],
      ['2025-11-23', 'NOT_MET'],
    ]) {
      expect(
        status(ty, 'TY-05', { trips: [{ departed: '2023-11-23', returned }] }),
      ).toBe(expected);
    }
    expect(
      status(ty, 'TY-05', {
        trips: [{ departed: '2027-03-01', returned: '2031-03-01' }],
      }),
    ).toBe('MET');
    expect(status(ty, 'TY-05', { trips: undefined })).toBe('UNKNOWN');
  });
  test('conversion at expiry counts full days in the last five years; an uncertain ten-month total stays unknown', () => {
    const tenYear = {
      stage: 'renewal',
      basis: 'residence',
      hasPriorCard: true,
    } as const;
    const r = { tenYear, currentCardExpiresOn: day };
    const first = { departed: '2024-02-01', returned: '2024-07-01' }; // 150 full days.
    const second = { departed: '2025-02-01', returned: '2025-07-02' }; // 150 full days.
    expect(status(ty, 'TY-04', { ...r, trips: [first, second] })).toBe('MET');
    expect(
      check(ty, 'TY-04', {
        ...r,
        trips: [first, { ...second, returned: '2025-07-06' }],
      }).pendingDetails,
    ).toContain('PD-102'); // 150 + 154.
    expect(
      status(ty, 'TY-04', {
        ...r,
        trips: [first, { ...second, returned: '2025-07-09' }],
      }),
    ).toBe('NOT_MET'); // 150 + 157.
  });
  test('a missing prior card prevents renewal on either basis even when the category is unanswered', () => {
    const result = full(ty, {
      tenYear: { stage: 'renewal', hasPriorCard: false, cardExpiresOn: day },
    });
    expect(result.checks.find((c) => c.id === 'TY-04')?.status).toBe('NOT_MET');
    expect(result.status).toBe('NOT_MET');
    expect(result.earliestDate).toBeUndefined();
  });
  test('residence M.2 conversion needs a previous card, final five years of absences and income; school-card renewal does not', () => {
    const e = {
      stage: 'renewal',
      basis: 'residence',
      hasPriorCard: true,
      cardExpiresOn: day,
    } as const;
    expect(status(ty, 'TY-04', { tenYear: e })).toBe('MET');
    expect(
      status(ty, 'TY-04', { tenYear: { ...e, hasPriorCard: false } }),
    ).toBe('NOT_MET');
    expect(
      status(ty, 'TY-04', {
        tenYear: e,
        trips: [{ departed: '2024-01-01', returned: '2024-07-02' }],
      }),
    ).toBe('NOT_MET');
    expect(
      status(ty, 'TY-04', {
        tenYear: e,
        trips: [{ departed: '2010-01-01', returned: '2010-07-02' }],
      }),
    ).toBe('MET');
    expect(
      check(ty, 'TY-04', {
        tenYear: e,
        residenceIncome: {
          netEur: 12100,
          dependants: 0,
          regularAndDocumented: true,
        },
      }).pendingDetails,
    ).toContain('PD-304');
    expect(
      status(ty, 'TY-04', {
        tenYear: { ...e, basis: 'birth-school' },
        residenceIncome: undefined,
      }),
    ).toBe('MET');
  });
});

describe('ΚΕΙ naturalisation', () => {
  const satisfactory: NonNullable<GrFullRequest['nationality']> = {
    permit: 'listed',
    convictions: [],
    removalOrStatusProceedings: false,
    exam: 'certificate',
    disabilityPercent: 67,
    economicActivity: 'stable-declared-work',
    livingResources: 'substantiated',
    incomeByTaxYear: incomes([2021, 2022, 2023, 2024, 2025], 5500),
    taxAndSocialInsuranceCurrent: true,
    integrationAssessment: 'accepted',
    civilStatusProof: 'legalised-translation',
    hasAmka: true,
    hasTaxAssessments: true,
    feeClass: 'ordinary',
    lastRejection: 'none',
  };
  test.each([
    [day, '2027-02-01', 'UNKNOWN', 'UNKNOWN', undefined],
    [day, '2027-08-15', 'MET', 'FUTURE', '2027-08-15'],
    ['2027-08-15', '2027-02-01', 'NOT_MET', 'NOT_MET', undefined],
    ['2027-08-15', '2032-02-01', 'MET', 'MET', '2027-08-15'],
  ] as const)(
    'reapplication on %s with a passport expiring on %s',
    (simulationDate, expiresOn, documentStatus, status, earliestDate) => {
      const path = full(nat, {
        simulationDate,
        passport: { kind: 'recognised', expiresOn },
        permits: [{ kind: 'regular', from: '2016-01-01', to: '2027-12-01' }],
        nationality: { ...satisfactory, lastRejection: '2026-08-15' },
      });
      const document = path.checks.find((c) => c.id === 'C-01');
      expect(document?.status).toBe(documentStatus);
      if (documentStatus === 'UNKNOWN')
        expect(document?.explanation).toContain('2027-08-15');
      expect(path.status).toBe(status);
      expect(path.earliestDate).toBe(earliestDate);
    },
  );

  test('a twelve-year residence wait extends past the ten-year horizon of the time-only entry', () => {
    const path = full(nat, {
      route: 'twelve-year',
      permits: [
        { kind: 'regular', from: '2019-01-01', to: '2025-12-31' },
        { kind: 'regular', from: day },
      ],
      nationality: {
        ...satisfactory,
        permit: 'other-definitive',
        incomeByTaxYear: incomes(
          [2019, 2020, 2021, 2022, 2023, 2024, 2025],
          5500,
        ),
      },
    });
    expect(
      path.checks.find((c) => c.id === 'NAT-TIME-RESIDENCE'),
    ).toMatchObject({
      status: 'NOT_MET',
      explanation: expect.stringContaining('2038-11-23'),
    });
    expect(path).toMatchObject({
      status: 'FUTURE',
      earliestDate: '2038-11-23',
    });
  });

  test('rejection on 15 August 2026 sets the first refiling date one year later', () => {
    const nationality = {
      ...satisfactory,
      lastRejection: '2026-08-15',
      preReformObjectionException: false,
    };
    const path = full(nat, { nationality });
    expect(path.checks.find((c) => c.id === 'NAT-11')).toMatchObject({
      status: 'NOT_MET',
      explanation: expect.stringContaining('2027-08-15'),
    });
    expect(path).toMatchObject({
      status: 'FUTURE',
      earliestDate: '2027-08-15',
    });
    const expired = full(nat, {
      nationality,
      permits: [{ kind: 'regular', from: '2016-01-01', to: '2027-08-14' }],
    });
    expect(
      expired.checks.find((c) => c.id === 'NAT-11')?.explanation,
    ).toContain('2027-08-15');
    expect(expired.status).toBe('NOT_MET');
    expect(expired.earliestDate).toBeUndefined();
    const anniversary = full(nat, {
      simulationDate: '2027-08-15',
      nationality,
    });
    expect(anniversary.checks.find((c) => c.id === 'NAT-11')?.status).toBe(
      'MET',
    );
    expect(anniversary).toMatchObject({
      status: 'MET',
      earliestDate: '2027-08-15',
    });
  });
  test('the last day in the criminal lookback can include leap day', () => {
    const nationality = {
      ...satisfactory,
      convictions: [
        {
          final: true,
          offence: 'other-intentional' as const,
          offenceDate: '2018-02-28',
          sentenceMonths: 12,
        },
      ],
      incomeByTaxYear: incomes([2022, 2023, 2024, 2025, 2026], 6000),
    };
    const blocked = full(nat, { nationality, simulationDate: '2028-02-29' });
    expect(blocked.checks.find((c) => c.id === 'NAT-03')).toMatchObject({
      status: 'NOT_MET',
      explanation: expect.stringContaining('2028-03-01'),
    });
    expect(blocked).toMatchObject({
      status: 'FUTURE',
      earliestDate: '2028-03-01',
    });
    expect(
      full(nat, { nationality, simulationDate: '2028-03-01' }),
    ).toMatchObject({ status: 'MET', earliestDate: '2028-03-01' });
  });
  test('a pending file retains the filing date for residence, majority and the criminal lookback', () => {
    const filing = '2025-08-01';
    const r = {
      simulationDate: '2027-02-01',
      passport: { kind: 'recognised' as const, expiresOn: filing },
      permits: [{ kind: 'regular' as const, from: '2019-02-01' }],
      nationality: {
        ...satisfactory,
        pendingApplicationFiledOn: filing,
        disabilityPercent: 0,
        incomeByTaxYear: incomes([2020, 2021, 2022, 2023, 2024], 1000),
      },
    };
    const path = full(nat, r);
    expect(path.checks.find((c) => c.id === 'C-01')?.status).toBe('MET');
    expect(path.checks.find((c) => c.id === 'NAT-TIME-RESIDENCE')?.status).toBe(
      'NOT_MET',
    );
    expect(path.checks.find((c) => c.id === 'NAT-07')?.status).toBe('MET');
    expect(path.status).toBe('NOT_MET');
    expect(path.earliestDate).toBeUndefined();
    const underage = full(nat, {
      ...r,
      birthDate: '2007-08-02',
      nationality: {
        ...r.nationality,
        convictions: [
          {
            final: true,
            offence: 'other-intentional',
            offenceDate: '2016-02-01',
            sentenceMonths: 12,
          },
        ],
        lastRejection: '2025-01-01',
      },
    });
    for (const id of ['NAT-01', 'NAT-03', 'NAT-11'])
      expect(underage.checks.find((c) => c.id === id)?.status).toBe('NOT_MET');
    expect(underage.earliestDate).toBeUndefined();
  });
  test.each([
    [39.59, 31, 'NOT_MET'],
    [39.6, 31, 'UNKNOWN'],
    [39.9, 31, 'UNKNOWN'],
    [39.9, 30, 'NOT_MET'],
    [40, 30, 'MET'],
  ] as const)(
    'written PEGP language %s, knowledge %s: %s',
    (languagePoints, knowledgePoints, status) => {
      const path = full(nat, {
        nationality: {
          ...satisfactory,
          exam: 'written',
          languagePoints,
          knowledgePoints,
          barredFromExam: false,
        },
      });
      const result = path.checks.find((c) => c.id === 'NAT-05');
      expect(result?.status).toBe(status);
      expect(result?.pendingDetails).toEqual(
        status === 'UNKNOWN' ? ['PD-309'] : undefined,
      );
      expect(path.status).toBe(status);
      expect(path.earliestDate).toBe(status === 'MET' ? day : undefined);
    },
  );
  test('the oral disability boundary and historic objections exception start with law 5225', () => {
    const nationality = {
      ...satisfactory,
      exam: 'oral' as const,
      oralPassed: true,
      certifiedLearningDisability: false,
      barredFromExam: false,
      lastRejection: '2025-08-01',
      preReformObjectionException: true,
    };
    const before = full(nat, { nationality, simulationDate: '2025-09-01' });
    expect(before.checks.find((c) => c.id === 'NAT-06')?.status).toBe(
      'NOT_MET',
    );
    expect(before.checks.find((c) => c.id === 'NAT-11')).toMatchObject({
      status: 'NOT_MET',
      explanation: expect.stringContaining('2026-08-01'),
    });
    expect(before.status).toBe('NOT_MET');
    expect(before.earliestDate).toBeUndefined();
    const after = full(nat, {
      nationality: {
        ...nationality,
        incomeByTaxYear: incomes([2019, 2020, 2021, 2022, 2023], 5500),
      },
      simulationDate: '2025-09-02',
    });
    for (const id of ['NAT-05', 'NAT-06', 'NAT-11'])
      expect(after.checks.find((c) => c.id === id)?.status).toBe('MET');
    expect(after).toMatchObject({ status: 'MET', earliestDate: '2025-09-02' });
  });
  test.each([
    ['2024-03-03', undefined],
    ['2024-03-04', '20240201368.pdf'],
    ['2024-08-04', '20240201368.pdf'],
    ['2024-08-05', '20240204555.pdf'],
    ['2025-03-09', '20240204555.pdf'],
    ['2025-03-10', '20250201093.pdf'],
    ['2026-04-23', '20250201093.pdf'],
    ['2026-04-24', '20260202319.pdf'],
  ] as const)(
    'the written exam uses the marking order in force on %s',
    (examOn, officialFile) => {
      const path = full(nat, {
        nationality: {
          ...satisfactory,
          exam: 'written',
          examOn,
          languagePoints: 40,
          knowledgePoints: 30,
          certifiedLearningDisability: false,
          barredFromExam: false,
        },
      });
      const result = path.checks.find((c) => c.id === 'NAT-05');
      expect(result?.status).toBe(officialFile ? 'MET' : 'UNKNOWN');
      if (officialFile)
        expect(result?.sources.some((s) => s.url?.endsWith(officialFile))).toBe(
          true,
        );
      else expect(result?.pendingDetails).toContain('PD-309');
      expect(path.status).toBe(officialFile ? 'MET' : 'UNKNOWN');
      expect(path.earliestDate).toBe(officialFile ? day : undefined);
    },
  );
  test('all twelve citizenship conditions have sourced results in both languages', () => {
    const r = { ...good, nationality: satisfactory };
    const en = rules(nat, r);
    const zh = settlementChecks(nat, r, grContext('zh-CN'));
    expect(en.map((c) => c.id)).toEqual(
      Array.from(
        { length: 12 },
        (_, i) => 'NAT-' + String(i + 1).padStart(2, '0'),
      ),
    );
    for (const [i, c] of en.entries()) {
      expect(c.status, c.id).toBe('MET');
      expect(c.id).toBe(zh[i].id);
      expect(c.title).not.toBe(zh[i].title);
      expect(
        c.sources.every((s) => s.locator.length && s.srcId.startsWith('SRC-')),
      ).toBe(true);
    }
  });
  test('birthday and route-specific status, including three-year category', () => {
    expect(status(nat, 'NAT-01', { birthDate: '2008-11-24' })).toBe('NOT_MET');
    expect(status(nat, 'NAT-01', { birthDate: '2008-11-23' })).toBe('MET');
    const work = { permit: 'other-definitive' } as const;
    expect(status(nat, 'NAT-02', { nationality: work })).toBe('NOT_MET');
    expect(
      status(nat, 'NAT-02', { nationality: work, route: 'twelve-year' }),
    ).toBe('MET');
    expect(
      status(nat, 'NAT-02', {
        nationality: { permit: 'receipt' },
        route: 'twelve-year',
      }),
    ).toBe('NOT_MET');
    expect(
      status(nat, 'NAT-02', {
        nationality: { permit: 'listed', shortRouteBasis: 'none' },
        route: 'three-year',
      }),
    ).toBe('NOT_MET');
    expect(
      status(nat, 'NAT-02', {
        nationality: { permit: 'listed', shortRouteBasis: 'eu' },
        route: 'three-year',
      }),
    ).toBe('MET');
  });
  test('final judgments, the date of the intentional offence, and lifetime listed offences', () => {
    const record = {
      final: true,
      offence: 'other-intentional',
      offenceDate: '2016-11-23',
      sentenceMonths: 12,
    } as const;
    type RecordAnswer = NonNullable<
      NonNullable<GrFullRequest['nationality']>['convictions']
    >[number];
    const testRecord = (over: Partial<RecordAnswer>) =>
      check(nat, 'NAT-03', {
        nationality: { convictions: [{ ...record, ...over }] },
      });
    expect(testRecord({})).toMatchObject({
      status: 'NOT_MET',
      explanation: expect.stringContaining('2026-11-24'),
    });
    expect(testRecord({ final: false }).status).toBe('MET');
    expect(
      status(nat, 'NAT-03', {
        nationality: {
          convictions: [{ ...record, offenceDate: '2016-11-22' }],
        },
      }),
    ).toBe('MET');
    expect(
      status(nat, 'NAT-03', {
        nationality: { convictions: [{ ...record, sentenceMonths: 11 }] },
      }),
    ).toBe('MET');
    expect(
      testRecord({
        offence: 'listed',
        sentenceMonths: 6,
        offenceDate: '1998-02-12',
      }).status,
    ).toBe('NOT_MET');
    expect(
      testRecord({
        offence: 'listed',
        sentenceMonths: 5,
        offenceDate: '1998-02-12',
      }).status,
    ).toBe('MET');
    expect(
      testRecord({
        offence: 'classification-pending',
        sentenceMonths: 6,
        offenceDate: '1998-02-12',
      }).pendingDetails,
    ).toEqual(['PD-301']);
    expect(
      status(nat, 'NAT-04', {
        nationality: { removalOrStatusProceedings: true },
      }),
    ).toBe('NOT_MET');
    expect(
      status(nat, 'NAT-04', {
        nationality: { removalOrStatusProceedings: false },
        publicOrder: 'review',
      }),
    ).toBe('UNKNOWN');
  });
  test.each([
    [40, 30, 'MET'],
    [50, 20, 'MET'],
    [39, 31, 'NOT_MET'],
    [51, 19, 'NOT_MET'],
    [40, 29, 'NOT_MET'],
  ] as const)(
    'PEGP scores %s + %s = %s',
    (languagePoints, knowledgePoints, s) => {
      expect(
        status(nat, 'NAT-05', {
          nationality: {
            exam: 'written',
            languagePoints,
            knowledgePoints,
            barredFromExam: false,
          },
        }),
      ).toBe(s);
    },
  );
  test('oral accommodation distinguishes age/disability from actually passing; Greek education exempts', () => {
    const oral = {
      exam: 'oral',
      oralPassed: true,
      barredFromExam: false,
      disabilityPercent: 66,
      certifiedLearningDisability: false,
    } as const;
    expect(
      status(nat, 'NAT-06', { nationality: oral, birthDate: '1964-12-31' }),
    ).toBe('NOT_MET');
    expect(
      status(nat, 'NAT-06', { nationality: oral, birthDate: '1963-12-31' }),
    ).toBe('MET');
    expect(
      status(nat, 'NAT-06', {
        nationality: { ...oral, disabilityPercent: 67 },
      }),
    ).toBe('MET');
    expect(
      status(nat, 'NAT-05', {
        nationality: { ...oral, disabilityPercent: 67, oralPassed: false },
      }),
    ).toBe('NOT_MET');
    const school = {
      exam: 'school-exemption',
      greekSchoolGrades: 8,
      greekSecondaryGrades: 5,
      greekTaughtUniversityDegree: false,
    } as const;
    expect(status(nat, 'NAT-06', { nationality: school })).toBe('NOT_MET');
    expect(
      status(nat, 'NAT-06', {
        nationality: { ...school, greekSchoolGrades: 9 },
      }),
    ).toBe('MET');
    expect(
      status(nat, 'NAT-05', {
        nationality: { ...school, greekSecondaryGrades: 6 },
      }),
    ).toBe('MET');
  });
  test('year-specific dependent adjustment, unpublished thresholds and fixed disability threshold', () => {
    const r = {
      simulationDate: '2023-11-23',
      route: 'three-year',
      nationality: {
        taxAndSocialInsuranceCurrent: true,
        incomeByTaxYear: incomes([2020, 2021, 2022], 9000, 2),
      },
    } as const;
    expect(status(nat, 'NAT-07', r)).toBe('MET');
    expect(
      status(nat, 'NAT-07', {
        ...r,
        nationality: {
          ...r.nationality,
          disabilityPercent: 0,
          incomeByTaxYear: incomes([2020, 2021, 2022], 8999.99, 2),
        },
      }),
    ).toBe('NOT_MET');
    expect(
      check(nat, 'NAT-07', {
        ...r,
        simulationDate: '2026-09-23',
        nationality: {
          ...r.nationality,
          incomeByTaxYear: incomes([2023, 2024, 2025], 9000),
        },
      }).pendingDetails,
    ).toContain('PD-310');
    const disabled = Object.fromEntries(
      [2023, 2024, 2025].map((y) => [
        y,
        { taxableEur: 5200, welfareEur: 300, dependants: 2 },
      ]),
    );
    expect(
      status(nat, 'NAT-07', {
        ...r,
        simulationDate: day,
        nationality: {
          ...r.nationality,
          incomeByTaxYear: disabled,
          disabilityPercent: 67,
          livingResources: 'substantiated',
          economicActivity: 'other-continuing-lawful-activity',
        },
      }),
    ).toBe('MET');
    expect(
      status(nat, 'NAT-07', {
        nationality: { taxAndSocialInsuranceCurrent: false },
      }),
    ).toBe('NOT_MET');
  });
  test('five qualifying years in seven need not be the most recent five; twelve-year route needs seven qualifying years', () => {
    const base = {
      simulationDate: '2023-11-23',
      nationality: {
        taxAndSocialInsuranceCurrent: true,
        incomeByTaxYear: incomes([2016, 2017, 2018, 2019, 2021], 7500),
      },
    };
    expect(status(nat, 'NAT-07', base)).toBe('MET');
    expect(check(nat, 'NAT-07', { ...base, route: 'twelve-year' }).status).toBe(
      'UNKNOWN',
    );
    const seven = incomes([2011, 2012, 2013, 2016, 2018, 2019, 2021], 7500);
    expect(
      status(nat, 'NAT-07', {
        ...base,
        route: 'twelve-year',
        nationality: {
          taxAndSocialInsuranceCurrent: true,
          incomeByTaxYear: seven,
        },
      }),
    ).toBe('MET');
    expect(
      check(nat, 'NAT-07', {
        simulationDate: '2026-09-23',
        nationality: satisfactory,
      }).explanation,
    ).toContain('PD-311');
  });
  test('2026 circular: even high documented income needs sustained activity and compliance', () => {
    const e = {
      incomeByTaxYear: incomes([2023, 2024, 2025], 60000),
      taxAndSocialInsuranceCurrent: true,
      livingResources: 'substantiated',
    } as const;
    const r = { route: 'three-year', nationality: e } as const;
    expect(status(nat, 'NAT-07', r)).toBe('UNKNOWN');
    expect(
      status(nat, 'NAT-07', {
        ...r,
        nationality: { ...e, economicActivity: 'occasional-only' },
      }),
    ).toBe('NOT_MET');
    expect(
      status(nat, 'NAT-07', {
        ...r,
        nationality: {
          ...e,
          economicActivity: 'stable-declared-work',
          taxAndSocialInsuranceCurrent: false,
        },
      }),
    ).toBe('NOT_MET');
    expect(
      status(nat, 'NAT-07', {
        ...r,
        nationality: {
          ...e,
          economicActivity: 'stable-declared-work',
          taxAndSocialInsuranceCurrent: undefined,
        },
      }),
    ).toBe('UNKNOWN');
  });
  test('new assessment applies to pending cases from 24 September, independently of a shortfall', () => {
    const e = {
      pendingApplicationFiledOn: '2023-01-10',
      incomeByTaxYear: incomes([2020, 2021, 2022], 4000),
      disabilityPercent: 0,
      taxAndSocialInsuranceCurrent: true,
      economicActivity: 'recurring-seasonal',
      livingResources: 'substantiated',
    } as const;
    const r = { route: 'three-year', nationality: e } as const;
    expect(status(nat, 'NAT-07', { ...r, simulationDate: '2026-09-23' })).toBe(
      'NOT_MET',
    );
    expect(status(nat, 'NAT-07', { ...r, simulationDate: '2026-09-24' })).toBe(
      'MET',
    );
    expect(
      check(nat, 'NAT-07', r).sources.some(
        (source) => source.srcId === 'SRC-372',
      ),
    ).toBe(true);
    expect(
      status(nat, 'NAT-07', {
        ...r,
        nationality: { ...e, livingResources: 'unexplained-spending' },
      }),
    ).toBe('UNKNOWN');
    expect(
      status(nat, 'NAT-07', {
        ...r,
        nationality: {
          ...e,
          livingResources: 'benefits-only-without-special-reason',
        },
      }),
    ).toBe('NOT_MET');
    expect(
      status(nat, 'NAT-07', {
        ...r,
        nationality: {
          ...e,
          economicActivity: 'dependent-supported-by-household',
        },
      }),
    ).toBe('UNKNOWN');
  });
  test('current ordinary tax years have no extrapolated minimum; evidence can support lower earnings', () => {
    const r = {
      route: 'three-year',
      nationality: {
        taxAndSocialInsuranceCurrent: true,
        incomeByTaxYear: incomes([2023, 2024, 2025], 6000),
        economicActivity: 'stable-declared-work',
        livingResources: 'substantiated',
      },
    } as const;
    expect(status(nat, 'NAT-07', r)).toBe('MET');
    expect(
      status(nat, 'NAT-07', {
        ...r,
        nationality: { ...r.nationality, livingResources: 'evidence-pending' },
      }),
    ).toBe('UNKNOWN');
    expect(
      status(nat, 'NAT-07', {
        ...r,
        nationality: {
          ...r.nationality,
          incomeByTaxYear: incomes([2024, 2025], 6000),
        },
      }),
    ).toBe('UNKNOWN');
  });
  test('social integration, records and identity documents', () => {
    expect(
      status(nat, 'NAT-08', {
        nationality: { integrationAssessment: 'adverse' },
      }),
    ).toBe('NOT_MET');
    expect(
      check(nat, 'NAT-08', {
        nationality: { integrationAssessment: 'evidence-only' },
        trips: [{ departed: '2025-02-01', returned: '2025-03-01' }],
      }).pendingDetails,
    ).toContain('PD-106');
    expect(
      status(nat, 'NAT-09', {
        nationality: { ...satisfactory, hasAmka: false },
      }),
    ).toBe('NOT_MET');
    expect(
      status(nat, 'NAT-09', {
        nationality: {
          ...satisfactory,
          civilStatusProof: 'recognised-protection-substitute',
        },
      }),
    ).toBe('MET');
  });
  test('fees, one-year rejection period and old-committee exceptions', () => {
    expect(
      check(nat, 'NAT-10', { nationality: satisfactory }).explanation,
    ).toMatch(/€550.*€150/);
    expect(
      check(nat, 'NAT-10', {
        nationality: { ...satisfactory, lastRejection: '2025-11-23' },
      }).explanation,
    ).toMatch(/€200/);
    expect(
      check(nat, 'NAT-10', {
        nationality: { ...satisfactory, feeClass: 'reduced' },
      }).explanation,
    ).toMatch(/€100/);
    expect(
      status(nat, 'NAT-11', { nationality: { lastRejection: '2025-11-23' } }),
    ).toBe('MET');
    expect(
      status(nat, 'NAT-11', { nationality: { lastRejection: '2025-11-24' } }),
    ).toBe('NOT_MET');
    expect(
      status(nat, 'NAT-11', {
        nationality: {
          lastRejection: '2025-11-24',
          preReformObjectionException: true,
        },
      }),
    ).toBe('MET');
  });
  test('publication is not acquisition; oath must have occurred by the assessment date within the year', () => {
    const e = { stage: 'oath', publicationDate: '2025-10-01' } as const;
    expect(check(nat, 'NAT-12', { nationality: e }).explanation).toMatch(
      /consular.*declaration/,
    );
    expect(rules(nat, { nationality: e }).map((c) => [c.id, c.status])).toEqual(
      [['NAT-12', 'UNKNOWN']],
    );
    expect(
      status(nat, 'NAT-12', { nationality: { ...e, oathDate: 'not-taken' } }),
    ).toBe('NOT_MET');
    expect(
      status(nat, 'NAT-12', { nationality: { ...e, oathDate: '2026-10-01' } }),
    ).toBe('MET');
    expect(
      status(nat, 'NAT-12', { nationality: { ...e, oathDate: '2026-10-02' } }),
    ).toBe('NOT_MET');
    expect(
      status(nat, 'NAT-12', {
        simulationDate: '2026-09-30',
        nationality: { ...e, oathDate: '2026-10-01' },
      }),
    ).toBe('NOT_MET');
  });
});
