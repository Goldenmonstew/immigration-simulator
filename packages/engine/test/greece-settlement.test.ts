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
const tenYearDocuments = {
  travelDocumentPagesReady: true,
  taxAndInsuranceClearance: true,
  birthOrSchoolEvidenceReady: true,
};
const good = {
  filingDocuments: { formReady: true, feeReceiptReady: true },
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
  tenYear: { ...tenYearDocuments, basis: 'residence', residesInGreece: true },
} satisfies GrFullRequest;

function request(route: Route, r: Partial<GrFullRequest>): GrFullRequest {
  const req = { ...good, ...r };
  if (route === lt)
    return { ...req, longTerm: { stage: 'initial', ...req.longTerm } };
  if (route === ty)
    return { ...req, tenYear: { stage: 'initial', ...req.tenYear } };
  return { ...req, nationality: { stage: 'application', ...req.nationality } };
}
function rules(route: Route, r: Partial<GrFullRequest>) {
  return settlementChecks(route, request(route, r), grContext('en'));
}
function check(route: Route, id: string, r: Partial<GrFullRequest> = {}) {
  return rules(route, r).find((c) => c.id === id)!;
}
function status(route: Route, id: string, r: Partial<GrFullRequest> = {}) {
  return check(route, id, r).status;
}
function full(route: Route, r: Partial<GrFullRequest>) {
  return evaluateGreeceFull(
    request(route, {
      citizenship: 'third-country',
      entry: 'permit',
      passport: { kind: 'exception-granted' },
      changes: [],
      biometrics: 'provided',
      ...r,
      tenYear: {
        ...tenYearDocuments,
        residesInGreece: true,
        ...(r.tenYear ?? good.tenYear),
      },
      pathways: [route],
    }),
  ).columns[0].pathways[0];
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
    ).toBe('NOT_MET');
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
  test.each([
    ['2021-04-01', '2026-04-01', 12320, 'UNKNOWN'],
    ['2021-05-01', '2026-05-01', 12320, 'UNKNOWN'],
    ['2021-05-01', '2026-05-01', 12880, 'MET'],
  ] as const)(
    'ordinary M.1 residence from %s allows filing on %s only with sufficient income (€%s)',
    (from, filing, netEur, incomeStatus) => {
      const request: Partial<GrFullRequest> = {
        permits: [{ kind: 'regular', from, to: '2026-11-01' }],
        residenceIncome: { netEur, dependants: 0, regularAndDocumented: true },
      };
      const forecast = full(lt, { ...request, simulationDate: '2026-03-31' });
      const filed = full(lt, { ...request, simulationDate: filing });
      for (const result of [forecast, filed]) {
        const income = result.checks.find((c) => c.id === 'LT-02');
        expect(income?.status).toBe(incomeStatus);
        if (incomeStatus === 'UNKNOWN') {
          expect(income?.pendingDetails).toContain('PD-304');
          expect(result.pendingDetails).toContain('PD-304');
          expect(result.earliestDate).toBeUndefined();
        } else {
          expect(result.earliestDate).toBe(filing);
        }
      }
      expect(forecast.status).toBe(
        incomeStatus === 'MET' ? 'FUTURE' : 'UNKNOWN',
      );
      expect(filed.status).toBe(incomeStatus);
    },
  );
  test.each([
    ['2021-04-01', '2022-04-01', '2026-06-12'],
    ['2021-08-01', '2022-08-01', '2026-08-01'],
  ])(
    'protection claimed on %s and granted on %s gives the first lawful filing on %s under article 179',
    (claimedOn, grantedOn, filing) => {
      const request: Partial<GrFullRequest> = {
        longTerm: { category: 'protected', passportHistory: 'complete' },
        permits: [{ kind: 'regular', from: grantedOn }],
        grantedProtection: { claimedOn, grantedOn },
      };
      expect(
        full(lt, { ...request, simulationDate: '2026-06-11' }),
      ).toMatchObject({
        status: 'FUTURE',
        earliestDate: filing,
      });
      expect(full(lt, { ...request, simulationDate: filing })).toMatchObject({
        status: 'MET',
        earliestDate: filing,
      });
    },
  );
  test('a forecast spanning both 2026 amendments applies the exclusion of earlier residence', () => {
    const filing = '2028-01-01';
    const request: Partial<GrFullRequest> = {
      longTerm: { category: 'protected', passportHistory: 'complete' },
      permits: [{ kind: 'regular', from: '2022-08-01' }],
      grantedProtection: {
        claimedOn: '2021-08-01',
        grantedOn: '2022-08-01',
        priorResidenceExcludedThrough: '2022-12-31',
      },
    };
    expect(
      full(lt, { ...request, simulationDate: '2026-02-05' }),
    ).toMatchObject({
      status: 'FUTURE',
      earliestDate: filing,
    });
    expect(full(lt, { ...request, simulationDate: filing }).status).toBe('MET');
  });
  test('an article 52 credit advances the forecast only when the recorded renewal takes effect', () => {
    const filing = '2026-05-01';
    const request: Partial<GrFullRequest> = {
      permits: [
        { kind: 'regular', from: '2019-01-01', to: '2022-01-01' },
        { kind: 'regular', from: filing },
      ],
      backlogRenewals: [
        {
          filedOn: '2022-01-02',
          permitEffectiveOn: filing,
          category: 'employment',
          typeAReceipt: true,
          pendingAtCommencement: true,
        },
      ],
    };
    expect(
      full(lt, { ...request, simulationDate: '2026-02-05' }),
    ).toMatchObject({
      status: 'FUTURE',
      earliestDate: filing,
    });
    expect(full(lt, { ...request, simulationDate: filing }).status).toBe('MET');
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
    const base = {
      basis: 'a2',
      a2ExamOn: day,
      a2Total: 50,
      a2SectionsAtPassMark: 4,
    } as const;
    expect(
      status(lt, 'LT-04', { integration: base, birthDate: '2010-11-23' }),
    ).toBe('MET');
    expect(
      status(lt, 'LT-04', { integration: base, birthDate: '2010-11-24' }),
    ).toBe('NOT_MET');
    expect(
      status(lt, 'LT-04', {
        integration: { ...base, a2ExamOn: '2026-11-22' },
        birthDate: '2010-11-23',
      }),
    ).toBe('NOT_MET');
    expect(
      status(lt, 'LT-04', { integration: base, birthDate: undefined }),
    ).toBe('UNKNOWN');
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
      a2ExamOn: day,
      greekLevel: 'A2',
      historyPoints: 10,
    } as const;
    for (const [birthDate, expected] of [
      ['2010-11-23', 'NOT_MET'],
      ['2010-11-22', 'MET'],
      [undefined, 'UNKNOWN'],
    ] as const) {
      const request = {
        birthDate,
        integration: { ...hist, a2ExamOn: '2026-11-22' },
      };
      expect(
        full(lt, request).checks.find((c) => c.id === 'LT-04')?.status,
      ).toBe(expected);
      expect(
        full(ty, request).checks.find((c) => c.id === 'TY-02')?.status,
      ).toBe(expected);
    }
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
  test.each(['a2', 'history'] as const)(
    '%s raw results need the sitting date',
    (basis) => {
      const integration = {
        basis,
        greekLevel: 'A2',
        historyPoints: 10,
        a2Total: 50,
        a2SectionsAtPassMark: 4,
      } as const;
      for (const [a2ExamOn, expected] of [
        [undefined, 'UNKNOWN'],
        [day, 'MET'],
      ] as const) {
        const path = full(lt, { integration: { ...integration, a2ExamOn } });
        expect(path.checks.find((item) => item.id === 'LT-04')?.status).toBe(
          expected,
        );
      }
    },
  );
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
  test.each([
    [0, false, 'MET', 'NOT_MET'],
    [12, false, 'NOT_MET', 'MET'],
    [14, false, 'NOT_MET', 'MET'],
    [14, true, 'MET', 'NOT_MET'],
    [15, false, 'UNKNOWN', 'UNKNOWN'],
    [undefined, false, 'UNKNOWN', 'UNKNOWN'],
  ] as const)(
    'M.1 checks %s post-grant months outside the EU against the same trip (former Blue Card %s)',
    (
      continuousOutsideEuMonths,
      formerBlueCardEndorsement,
      renewal,
      reacquisition,
    ) => {
      for (const [stage, id, expected] of [
        ['renewal', 'LT-07', renewal],
        ['reacquisition', 'LT-REACQUISITION', reacquisition],
      ] as const) {
        const path = full(lt, {
          simulationDate: '2026-11-24',
          currentCardExpiresOn: '2026-12-01',
          trips: [{ departed: '2023-01-01', returned: '2024-03-02' }],
          longTerm: {
            stage,
            statusGrantedOn: '2021-12-01',
            passportHistory: 'complete',
            otherMemberStateLongTermOrRevocationGround: false,
            continuousOutsideGreeceYears: 14 / 12,
            continuousOutsideEuMonths,
            formerBlueCardEndorsement,
            lossReason: 'absence-from-eu',
            lossEvidenceReady: true,
          },
        });
        expect(path.checks.find((check) => check.id === id)?.status).toBe(
          expected,
        );
        expect(path.status).toBe(expected);
        expect(path.earliestDate).toBeUndefined();
      }
    },
  );
  test.each([
    ['2023-06-01', '2023-06-17', 0.5, 'MET', 'NOT_MET'],
    ['2023-01-01', '2024-01-19', 12.5, 'NOT_MET', 'MET'],
    ['2023-06-01', '2023-06-08', 0.5, 'UNKNOWN', 'UNKNOWN'],
  ] as const)(
    'M.1 compares %s to %s with %s reported months outside the EU',
    (departed, returned, months, renewal, reacquisition) => {
      for (const [stage, rule, expected] of [
        ['renewal', 'LT-07', renewal],
        ['reacquisition', 'LT-REACQUISITION', reacquisition],
      ] as const) {
        const path = full(lt, {
          simulationDate: '2026-11-24',
          currentCardExpiresOn: '2026-12-01',
          trips: [{ departed, returned }],
          longTerm: {
            stage,
            statusGrantedOn: '2021-12-01',
            passportHistory: 'complete',
            formerBlueCardEndorsement: false,
            otherMemberStateLongTermOrRevocationGround: false,
            continuousOutsideGreeceYears: months / 12,
            continuousOutsideEuMonths: months,
            lossReason: 'absence-from-eu',
            lossEvidenceReady: true,
          },
        });
        expect(path.checks.find((check) => check.id === rule)?.status).toBe(
          expected,
        );
        expect(path.status).toBe(expected);
      }
    },
  );
  test('M.1 flags reported post-grant absences longer than any recorded Greek absence', () => {
    const longTerm = {
      passportHistory: 'complete',
      formerBlueCardEndorsement: false,
      otherMemberStateLongTermOrRevocationGround: false,
      continuousOutsideGreeceYears: 7,
      continuousOutsideEuMonths: 84,
      lossReason: 'absence-from-eu',
      lossEvidenceReady: true,
    } as const;
    const past = { departed: '2012-01-01', returned: '2019-01-01' };
    for (const [trips, statusGrantedOn] of [
      [[past], '2019-01-01'],
      [[past], undefined],
      [[{ departed: '2020-01-01', returned: '2020-02-01' }], undefined],
      [[{ departed: '2020-01-01', returned: '2021-02-01' }], '2019-01-01'],
      [
        [
          { departed: '2017-01-01', returned: '2020-09-02' },
          { departed: '2021-01-01', returned: '2024-09-02' },
        ],
        '2016-01-01',
      ],
    ] as const) {
      for (const [stage, id] of [
        ['renewal', 'LT-07'],
        ['reacquisition', 'LT-REACQUISITION'],
      ] as const) {
        const path = full(lt, {
          longTerm: { ...longTerm, statusGrantedOn, stage },
          currentCardExpiresOn: '2026-12-01',
          trips: [...trips],
        });
        expect(path.checks.find((item) => item.id === id)?.status).toBe(
          'UNKNOWN',
        );
        expect(path.status).toBe('UNKNOWN');
      }
    }
  });
  test('short recorded trips cannot bound an unreported EU duration when a longer Greek absence is declared', () => {
    for (const [stage, id] of [
      ['renewal', 'LT-07'],
      ['reacquisition', 'LT-REACQUISITION'],
    ] as const) {
      const path = full(lt, {
        currentCardExpiresOn: '2026-12-01',
        trips: [{ departed: '2025-04-01', returned: '2025-04-08' }],
        longTerm: {
          stage,
          statusGrantedOn: '2021-12-01',
          passportHistory: 'complete',
          otherMemberStateLongTermOrRevocationGround: false,
          continuousOutsideGreeceYears: 2,
          formerBlueCardEndorsement: false,
          lossReason: 'absence-from-eu',
          lossEvidenceReady: true,
        },
      });
      expect(path.checks.find((check) => check.id === id)?.status).toBe(
        'UNKNOWN',
      );
      expect(path.status).toBe('UNKNOWN');
    }
  });
  test('a reported Greek absence must fit between the grant and filing dates when trips are supplied', () => {
    const shortTrip = [{ departed: '2026-11-01', returned: '2026-11-08' }];
    for (const [statusGrantedOn, trips, expected] of [
      ['2026-10-24', shortTrip, 'UNKNOWN'],
      ['2021-12-01', shortTrip, 'MET'],
      ['2026-10-24', undefined, 'MET'],
    ] as const) {
      const path = full(lt, {
        simulationDate: '2026-11-24',
        currentCardExpiresOn: '2026-12-01',
        trips,
        longTerm: {
          stage: 'renewal',
          statusGrantedOn,
          passportHistory: 'complete',
          otherMemberStateLongTermOrRevocationGround: false,
          continuousOutsideGreeceYears: 2,
          continuousOutsideEuMonths: 0,
        },
      });
      expect(path.checks.find((check) => check.id === 'LT-07')?.status).toBe(
        expected,
      );
      expect(path.status).toBe(expected);
      expect(path.earliestDate).toBeUndefined();
    }
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
  test('the M.2 residence record must cover the projected filing date, including the expiry day', () => {
    const permit = {
      kind: 'regular',
      from: '2016-11-24',
      to: '2027-11-24',
    } as const;
    const integration = {
      basis: 'residence',
      continuousFrom: permit.from,
      includesStudyOrDisputedGap: false,
    } as const;
    const filing = '2028-11-24';
    const records = { permits: [permit], integration };
    const path = full(ty, records);
    const filed = full(ty, { ...records, simulationDate: filing });
    expect(filed.status).toBe('NOT_MET');
    expect(path.status).toBe(filed.status);
    expect(path.earliestDate).toBeUndefined();
    expect(path.checks.find((c) => c.id === 'TY-01')).toMatchObject({
      status: filed.status,
      explanation: expect.stringContaining(filing),
    });
    const renewal = {
      kind: 'regular',
      from: '2027-11-25',
      to: filing,
    } as const;
    const covered = { permits: [permit, renewal], integration };
    expect(full(ty, covered)).toMatchObject({
      status: 'FUTURE',
      earliestDate: filing,
    });
    expect(full(ty, { ...covered, simulationDate: filing }).status).toBe('MET');
  });

  test('an M.2 filing projected across the reform uses the integration rule in force on filing', () => {
    const request = {
      permits: [{ kind: 'regular', from: '2016-02-10', to: '2027-01-01' }],
      tenYear: { ...good.tenYear, legacyEconomicAndSocialIntegration: true },
      integration: { basis: 'none' },
    } satisfies Partial<GrFullRequest>;
    for (const simulationDate of ['2026-02-05', '2026-02-10']) {
      const path = full(ty, { ...request, simulationDate });
      expect(path.checks.find((c) => c.id === 'TY-02')?.status).toBe('NOT_MET');
      expect(path.status).toBe('NOT_MET');
      expect(path.earliestDate).toBeUndefined();
    }
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
  test.each([
    ['2026-02-05', 0, 'MET'],
    ['2026-02-06', 0, 'NOT_MET'],
    ['2026-06-01', 0, 'NOT_MET'],
    ['2026-06-01', undefined, 'UNKNOWN'],
    // Sufficient on commencement in February, below the gross upper bound on filing in June.
    ['2026-06-01', 12320, 'UNKNOWN'],
    ['2026-06-01', 12880, 'MET'],
  ] as const)(
    'an ordinary M.2 expiring on %s with income %s has filing-day result %s (articles 38 and 45(18))',
    (expiry, netEur, expected) => {
      const request: Partial<GrFullRequest> = {
        tenYear: {
          stage: 'renewal',
          basis: 'residence',
          hasPriorCard: true,
          cardExpiresOn: expiry,
        },
        residenceIncome: { netEur, dependants: 0, regularAndDocumented: true },
      };
      const simulationDate =
        expiry === '2026-02-05' ? '2026-02-04' : '2026-02-05';
      const forecast = full(ty, { ...request, simulationDate });
      const filed = full(ty, { ...request, simulationDate: expiry });
      expect(filed.checks.find((c) => c.id === 'TY-04')?.status).toBe(expected);
      expect(filed.status).toBe(expected);
      expect(forecast.status).toBe(expected === 'MET' ? 'FUTURE' : expected);
      expect(forecast.earliestDate).toBe(
        expected === 'MET' ? expiry : undefined,
      );
      if (expected === 'MET') {
        expect(forecast.checks.find((c) => c.id === 'TY-04')).toMatchObject({
          status: 'NOT_MET',
          explanation: expect.stringContaining(expiry),
        });
      } else {
        expect(forecast.checks.find((c) => c.id === 'TY-04')?.status).toBe(
          expected,
        );
        expect(filed.earliestDate).toBeUndefined();
      }
    },
  );
  test('a school-based M.2 can use the new renewal window before its original conversion date', () => {
    const request: Partial<GrFullRequest> = {
      tenYear: {
        stage: 'renewal',
        basis: 'birth-school',
        hasPriorCard: true,
        cardExpiresOn: '2026-06-01',
      },
      residenceIncome: undefined,
    };
    expect(
      full(ty, { ...request, simulationDate: '2026-02-05' }),
    ).toMatchObject({
      status: 'FUTURE',
      earliestDate: '2026-04-01',
    });
    expect(full(ty, { ...request, simulationDate: '2026-04-01' }).status).toBe(
      'MET',
    );
  });
  test('an M.2 forecast made after commencement uses the income evidence threshold on expiry', () => {
    const request: Partial<GrFullRequest> = {
      tenYear: {
        stage: 'renewal',
        basis: 'residence',
        hasPriorCard: true,
        cardExpiresOn: '2026-06-01',
      },
      residenceIncome: {
        netEur: 12320,
        dependants: 0,
        regularAndDocumented: true,
      },
    };
    for (const simulationDate of ['2026-02-06', '2026-06-01']) {
      const result = full(ty, { ...request, simulationDate });
      expect(result.checks.find((c) => c.id === 'TY-04')).toMatchObject({
        status: 'UNKNOWN',
        pendingDetails: ['PD-304'],
      });
      expect(result.status).toBe('UNKNOWN');
      expect(result.earliestDate).toBeUndefined();
    }
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
      schoolCompletedOn: '2008-05-11',
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
    ).toBe('UNKNOWN');
    expect(
      status(ty, 'TY-01', {
        tenYear: { ...e, schoolCompletedOn: '2008-05-12' },
      }),
    ).toBe('NOT_MET');
    expect(status(ty, 'TY-01', { tenYear: e, birthDate: undefined })).toBe(
      'UNKNOWN',
    );
    expect(
      status(ty, 'TY-01', { tenYear: { ...e, schoolCompletedOn: undefined } }),
    ).toBe('UNKNOWN');
    expect(
      status(ty, 'TY-01', {
        tenYear: { ...e, bornInGreece: true },
        birthDate: undefined,
      }),
    ).toBe('MET');
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
  test('current permits do not settle residence in Greece or a disputed continuity record', () => {
    for (const tenYear of [
      { ...good.tenYear, residesInGreece: undefined },
      { ...good.tenYear, disputedPermitGap: true },
    ]) {
      const result = full(ty, { tenYear });
      expect(result.checks.find((item) => item.id === 'TY-01')?.status).toBe(
        'UNKNOWN',
      );
      expect(result.status).toBe('UNKNOWN');
      expect(result.earliestDate).toBeUndefined();
    }
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
  test('ordinary M.2 initial filing counts only absence inside the qualifying decade', () => {
    const request = {
      simulationDate: '2026-11-24',
      permits: [{ kind: 'regular', from: '2016-03-01' }],
      tenYear: { ...good.tenYear, stage: 'initial' },
      integration: { basis: 'pegp' },
    } satisfies Partial<GrFullRequest>;
    const run = (
      departed: string,
      returned: string,
      qualifyingResidenceFrom?: string,
    ) =>
      full(ty, {
        ...request,
        tenYear: { ...request.tenYear, qualifyingResidenceFrom },
        trips: [{ departed, returned }],
      });
    for (const returned of ['2015-03-01', '2016-11-24']) {
      const result = run('2012-01-01', returned);
      expect(result.checks.find((c) => c.id === 'TY-05')?.status).toBe('MET');
      expect(result.status).toBe('MET');
    }
    // Only the part from 2016-11-24 falls inside the decade. It is shorter than
    // two years, but the card alone does not settle the separate residence test.
    const overlap = run('2012-01-01', '2017-09-01');
    expect(overlap.checks.find((c) => c.id === 'TY-05')?.status).toBe('MET');
    expect(overlap.status).toBe('UNKNOWN');
    expect(run('2012-01-01', '2017-09-01', '2016-03-01').status).toBe('MET');
    expect(run('2012-01-01', '2018-11-24', '2016-03-01').status).toBe(
      'NOT_MET',
    );
  });
  test.each([
    ['2023-11-24', '2026-10-24', 'UNKNOWN'],
    ['2021-10-24', '2023-10-24', 'UNKNOWN'],
    ['2024-10-24', '2026-10-23', 'MET'],
    ['2024-11-25', '2027-01-01', 'MET'],
    ['2024-11-24', '2026-11-24', 'NOT_MET'],
  ] as const)(
    'birth/school M.2 initial filing with travel from %s to %s is %s',
    (departed, returned, expected) => {
      for (const evidence of [
        { bornInGreece: true },
        {
          bornInGreece: false,
          greekGrades: 6,
          schoolCompletedOn: '2008-05-11',
        },
      ]) {
        const result = full(ty, {
          simulationDate: '2026-11-24',
          tenYear: { basis: 'birth-school', ...evidence },
          trips: [{ departed, returned }],
        });
        const absence = result.checks.find((item) => item.id === 'TY-05');
        expect(absence?.status).toBe(expected);
        expect(result.status).toBe(expected);
        if (expected === 'UNKNOWN') {
          expect(absence?.pendingDetails).toContain('PD-312');
          expect(result.earliestDate).toBeUndefined();
        }
      }
    },
  );
  test('M.2 conversion and birth/school renewal use their own card windows', () => {
    const tenYear = {
      stage: 'renewal',
      hasPriorCard: true,
      cardExpiresOn: day,
    } as const;
    const run = (
      basis: 'residence' | 'birth-school',
      departed: string,
      returned: string,
    ) =>
      full(ty, {
        tenYear: { ...tenYear, basis },
        trips: [{ departed, returned }],
      });
    expect(run('residence', '2017-01-01', '2020-01-01').status).toBe('MET');
    expect(run('birth-school', '2012-01-01', '2015-01-01').status).toBe('MET');
    expect(run('birth-school', '2017-01-01', '2020-01-01').status).toBe(
      'NOT_MET',
    );
  });
  test('the residence-based integration alternative checks travel only in its own qualifying period', () => {
    const integration = {
      basis: 'residence',
      continuousFrom: '2010-01-01',
      includesStudyOrDisputedGap: false,
    } as const;
    for (const route of [lt, ty] as const) {
      const id = route === lt ? 'LT-04' : 'TY-02';
      const inside = [{ departed: '2015-01-01', returned: '2016-09-01' }];
      expect(status(route, id, { integration, trips: inside })).toBe('UNKNOWN');
      expect(
        status(route, id, {
          integration: {
            ...integration,
            continuityDuringTravelConfirmed: true,
          },
          trips: inside,
        }),
      ).toBe('MET');
      expect(
        status(route, id, {
          integration,
          trips: [{ departed: '2012-01-01', returned: '2014-11-23' }],
        }),
      ).toBe('MET');
    }
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
  test.each([
    ['2008-11-24', 'MET'],
    ['2008-11-23', 'NOT_MET'],
    [undefined, 'UNKNOWN'],
  ] as const)(
    'parental responsibility on filing depends on the Greek-born child’s birthday %s',
    (childBirthDate, expected) => {
      const nationality = {
        permit: 'listed',
        shortRouteBasis: 'parent-of-greek-child-born-in-greece',
        childBirthDate,
      } as const;
      expect(status(nat, 'NAT-02', { route: 'three-year', nationality })).toBe(
        expected,
      );
      expect(
        status(nat, 'NAT-02', {
          route: 'three-year',
          nationality: {
            ...nationality,
            shortRouteBasis: 'greek-spouse-with-child',
          },
        }),
      ).toBe('MET');
    },
  );
  const satisfactory: NonNullable<GrFullRequest['nationality']> = {
    stage: 'application',
    permit: 'listed',
    convictions: [],
    removalOrStatusProceedings: false,
    exam: 'certificate',
    knowledgeDocumentReady: true,
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
  test.each(['oral', 'written'] as const)(
    'the filing date cannot establish a %s examination date',
    (exam) => {
      const answers = {
        ...satisfactory,
        exam,
        languagePoints: 40,
        knowledgePoints: 30,
        oralPassed: true,
        certifiedLearningDisability: false,
        barredFromExam: false,
      };
      for (const [examOn, expected] of [
        [undefined, 'UNKNOWN'],
        [day, 'MET'],
      ] as const) {
        const path = full(nat, { nationality: { ...answers, examOn } });
        expect(path.checks.find((item) => item.id === 'NAT-05')?.status).toBe(
          expected,
        );
        expect(path.status).toBe(expected);
      }
    },
  );
  test('missing procedure cannot confirm M.1, M.2 or naturalisation eligibility', () => {
    for (const [id, patch] of [
      [lt, { longTerm: { ...good.longTerm, stage: undefined } }],
      [ty, { tenYear: { ...good.tenYear, stage: undefined } }],
      [nat, { nationality: { ...satisfactory, stage: undefined } }],
    ] as const) {
      const path = full(id, patch);
      expect(
        path.checks.find((item) => item.id.endsWith('-STAGE'))?.status,
      ).toBe('UNKNOWN');
      expect(path.status).toBe('UNKNOWN');
      expect(path.earliestDate).toBeUndefined();
    }
  });
  test('naturalisation counts only evidenced diplomatic or consular spouse postings on the three- and seven-year routes', () => {
    const returned = '2026-11-23';
    const posting = {
      periods: [{ from: '2023-01-01', through: '2026-11-22' }],
      qualifyingServiceDocumented: true,
      yearInGreeceCompletedOn: '2022-01-01',
    } as const;
    const facts: Partial<GrFullRequest> = {
      permits: [
        { kind: 'regular', from: '2018-01-01', to: '2022-12-31' },
        { kind: 'regular', from: returned },
      ],
      trips: [{ departed: '2022-12-31', returned }],
      nationality: {
        ...satisfactory,
        diplomaticSpouse: { ...posting, periods: [...posting.periods] },
      },
    };
    expect(full(nat, facts).status).toBe('MET');
    expect(full(nat, { ...facts, trips: [] }).status).toBe('MET');
    expect(
      full(nat, {
        ...facts,
        nationality: {
          ...facts.nationality,
          shortRouteBasis: 'greek-spouse-with-child',
        },
        route: 'three-year',
      }).status,
    ).toBe('MET');
    expect(full(nat, { ...facts, route: 'twelve-year' }).status).not.toBe(
      'MET',
    );
    expect(
      full(nat, {
        ...facts,
        trips: [
          ...facts.trips!,
          { departed: '2020-01-01', returned: '2020-05-01' },
        ],
      }).status,
    ).toBe('UNKNOWN');
    for (const patch of [
      { qualifyingServiceDocumented: false },
      { yearInGreeceCompletedOn: 'not-completed' },
    ] as const) {
      expect(
        full(nat, {
          ...facts,
          nationality: {
            ...facts.nationality,
            diplomaticSpouse: {
              ...facts.nationality!.diplomaticSpouse!,
              ...patch,
            },
          },
        }).status,
      ).not.toBe('MET');
    }
    expect(
      full(nat, {
        ...facts,
        nationality: {
          ...facts.nationality,
          diplomaticSpouse: {
            ...facts.nationality!.diplomaticSpouse!,
            yearInGreeceCompletedOn: undefined,
          },
        },
      }).status,
    ).toBe('UNKNOWN');
    expect(
      full(nat, { ...facts, permits: facts.permits!.slice(0, 1) }).status,
    ).toBe('NOT_MET');
    expect(full(nat, { ...facts, simulationDate: '2026-11-22' })).toMatchObject(
      { status: 'FUTURE', earliestDate: returned },
    );
  });
  test.each([
    [day, '2027-02-01', 'NOT_MET', 'NOT_MET', undefined],
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
      if (simulationDate === day && documentStatus === 'NOT_MET')
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
    expect(path.checks.find((c) => c.id === 'NAT-07')).toMatchObject({
      status: 'UNKNOWN',
      explanation: expect.stringContaining('2038-11-23'),
    });
    expect(path.status).toBe('UNKNOWN');
    expect(path.earliestDate).toBeUndefined();
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
          examOn: day,
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
      examOn: '2025-09-01',
      oralPassed: true,
      certifiedLearningDisability: false,
      barredFromExam: false,
      lastRejection: '2025-08-01',
      preReformObjectionException: true,
    };
    const review = {
      nationality,
      simulationDate: '2025-09-01',
      permits: [{ kind: 'regular', from: '2018-09-03' }],
    } satisfies Partial<GrFullRequest>;
    expect(status(nat, 'NAT-06', review)).toBe('NOT_MET');
    expect(check(nat, 'NAT-11', review)).toMatchObject({
      status: 'NOT_MET',
      explanation: expect.stringContaining('2026-08-01'),
    });
    expect(full(nat, review).status).toBe('NOT_MET');
    expect(full(nat, { ...review, simulationDate: '2026-01-01' }).status).toBe(
      'NOT_MET',
    );
    // A sitting after the reform uses the amended disability threshold.
    const newSitting = { ...nationality, examOn: '2025-09-02' };
    expect(full(nat, { ...review, nationality: newSitting })).toMatchObject({
      status: 'FUTURE',
      earliestDate: '2026-01-01',
    });
    expect(
      full(nat, {
        ...review,
        nationality: newSitting,
        simulationDate: '2025-09-03',
      }).status,
    ).toBe('UNKNOWN');
    expect(
      full(nat, {
        ...review,
        nationality: newSitting,
        simulationDate: '2026-01-01',
      }).status,
    ).toBe('MET');
    const after = full(nat, {
      nationality: {
        ...newSitting,
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
            examOn: day,
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
      examOn: day,
      oralPassed: true,
      barredFromExam: false,
      disabilityPercent: 66,
      certifiedLearningDisability: false,
    } as const;
    for (const [birthDate, expected] of [
      ['1965-01-01', 'NOT_MET'],
      ['1964-12-31', 'MET'],
    ] as const) {
      const result = full(nat, { nationality: oral, birthDate });
      for (const id of ['NAT-05', 'NAT-06']) {
        expect(result.checks.find((c) => c.id === id)?.status).toBe(expected);
      }
    }
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
  test('historic disability income uses evidenced welfare only when taxable income alone is insufficient', () => {
    for (const [taxableEur, welfareEur, expected] of [
      [5200, undefined, 'UNKNOWN'],
      [5200, 0, 'NOT_MET'],
      [5200, 300, 'MET'],
      [5500, undefined, 'MET'],
    ] as const) {
      const result = full(nat, {
        simulationDate: '2023-11-23',
        route: 'three-year',
        nationality: {
          disabilityPercent: 67,
          taxAndSocialInsuranceCurrent: true,
          incomeByTaxYear: Object.fromEntries(
            [2020, 2021, 2022].map((year) => [
              year,
              { taxableEur, welfareEur, dependants: 0 },
            ]),
          ),
        },
      });
      expect(result.checks.find((check) => check.id === 'NAT-07')?.status).toBe(
        expected,
      );
    }
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
  test.each([
    [false, 'NOT_MET'],
    [undefined, 'UNKNOWN'],
    [true, 'MET'],
  ] as const)(
    'naturalisation checks the issued knowledge document and the filing fee receipt (%s)',
    (ready, expected) => {
      const nationality = {
        ...satisfactory,
        exam: 'school-exemption',
        greekTaughtUniversityDegree: true,
        knowledgeDocumentReady: ready,
      } as const;
      const evidence = full(nat, { nationality });
      expect(evidence.checks.find((x) => x.id === 'NAT-09')?.status).toBe(
        expected,
      );
      expect(evidence.status).toBe(expected);
      const fee = full(nat, {
        nationality: satisfactory,
        filingDocuments: { formReady: true, feeReceiptReady: ready },
      });
      expect(fee.checks.find((x) => x.id === 'NAT-10')?.status).toBe(expected);
      expect(fee.status).toBe(expected);
    },
  );
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

describe('Greek settlement filing checklists', () => {
  test.each([
    [true, 'MET'],
    [false, 'NOT_MET'],
    [undefined, 'UNKNOWN'],
  ] as const)(
    'M.1 reacquisition accepts the evidence for the actual loss reason (%s)',
    (lossEvidenceReady, expected) => {
      for (const facts of [
        {
          lossReason: 'absence-from-eu',
          continuousOutsideEuMonths: 12,
          formerBlueCardEndorsement: false,
        },
        { lossReason: 'other-member-state-status' },
      ] as const) {
        const path = full(lt, {
          longTerm: { stage: 'reacquisition', ...facts, lossEvidenceReady },
          permits: undefined,
        });
        expect(
          path.checks.find((x) => x.id === 'LT-REACQUISITION')?.status,
        ).toBe(expected);
        expect(path.status).toBe(expected);
      }
    },
  );
  test('M.1 requires actual loss of the previous Greek status on a qualifying ground', () => {
    for (const facts of [
      { lossReason: 'absence-from-eu', continuousOutsideEuMonths: 11 },
      {
        lossReason: 'absence-from-eu',
        continuousOutsideEuMonths: 18,
        formerBlueCardEndorsement: true,
      },
      { lossReason: 'other' },
    ] as const) {
      expect(
        full(lt, {
          longTerm: {
            stage: 'reacquisition',
            ...facts,
            lossEvidenceReady: true,
          },
        }).status,
      ).toBe('NOT_MET');
    }
  });
  test.each([
    ['complete', 'MET'],
    ['official-substitute', 'MET'],
    ['substitute-pending', 'UNKNOWN'],
    ['missing', 'NOT_MET'],
    [undefined, 'UNKNOWN'],
  ] as const)(
    'M.1 initial filing checks passport documents as well as trip dates (%s)',
    (passportHistory, expected) => {
      expect(
        full(lt, { longTerm: { ...good.longTerm, passportHistory } }).status,
      ).toBe(expected);
    },
  );
  test.each([
    [true, 'MET'],
    [false, 'NOT_MET'],
    [undefined, 'UNKNOWN'],
  ] as const)(
    'M.2 checks the evidence specific to each filing (%s)',
    (ready, expected) => {
      for (const tenYear of [
        { ...good.tenYear, travelDocumentPagesReady: ready },
        { ...good.tenYear, taxAndInsuranceClearance: ready },
        {
          basis: 'birth-school',
          bornInGreece: true,
          birthOrSchoolEvidenceReady: ready,
        },
        {
          basis: 'residence',
          stage: 'renewal',
          hasPriorCard: true,
          cardExpiresOn: day,
          travelDocumentPagesReady: ready,
        },
      ] as const) {
        const path = full(ty, { tenYear });
        expect(path.checks.find((c) => c.id === 'TY-DOCUMENTS')?.status).toBe(
          expected,
        );
        expect(path.status).toBe(expected);
      }
    },
  );
  test('M.2 unaccompanied former minors must document entry, ages, Greek secondary studies and transitional eligibility', () => {
    const tenYear = {
      basis: 'unaccompanied-minor',
      unaccompaniedEntryEvidence: true,
      inSecondarySchoolAtReform: true,
      greekSecondaryGrades: 3,
      schoolCompletedOn: '2026-05-31',
    } as const;
    const facts = { tenYear, birthDate: '2007-06-01' };
    expect(full(ty, facts).status).toBe('MET');
    expect(
      full(ty, {
        ...facts,
        tenYear: { ...tenYear, birthOrSchoolEvidenceReady: false },
      }).status,
    ).toBe('NOT_MET');
    for (const patch of [
      { unaccompaniedEntryEvidence: false },
      { greekSecondaryGrades: 2 },
      { inSecondarySchoolAtReform: false },
    ]) {
      expect(
        full(ty, { ...facts, tenYear: { ...tenYear, ...patch } }).status,
      ).toBe('NOT_MET');
    }
    expect(
      full(ty, {
        ...facts,
        tenYear: { ...tenYear, inSecondarySchoolAtReform: undefined },
      }).status,
    ).toBe('UNKNOWN');
    expect(
      full(ty, {
        ...facts,
        simulationDate: '2026-02-05',
        tenYear: {
          ...tenYear,
          inSecondarySchoolAtReform: undefined,
          schoolCompletedOn: '2025-05-31',
        },
      }).status,
    ).toBe('MET');
  });
  test.each([
    [false, 'NOT_MET'],
    [undefined, 'UNKNOWN'],
    [true, 'MET'],
  ] as const)(
    'M.1 integration exam scores need the issued evidence (%s)',
    (issued, expected) => {
      for (const integration of [
        {
          basis: 'a2',
          a2Certificate: issued,
          a2Total: 70,
          a2SectionsAtPassMark: 4,
        },
        {
          basis: 'history',
          historyCertificate: issued,
          greekLevel: 'A2',
          historyPoints: 15,
        },
      ] as const) {
        const path = full(lt, { integration });
        expect(
          path.checks.find((x) => x.id === 'LT-INTEGRATION-DOCUMENT')?.status,
        ).toBe(expected);
        expect(path.status).toBe(expected);
      }
    },
  );
});
