import { describe, expect, test } from 'vitest';
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
  test('a renewal only tests continued status and the print fee', () => {
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
    expect(testRecord({}).status).toBe('NOT_MET');
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
