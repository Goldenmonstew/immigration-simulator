import { describe, expect, test } from 'vitest';
import { evaluate } from '../src/evaluate';
import {
  esBritishConnection,
  esEarnings10Y,
  esEarnings3Y,
  esEarnings5Y,
  esPublicFunds,
  esPublicService,
} from '../src/rules/es-contribution';
import type { ImmigrationEpisode, IncomeYear } from '../src/types';
import { asDependant, run, SIMULATION_DATE, timeline } from './helpers';

// SIMULATION_DATE 2026-11-04 is in 2026-27, so windows end with 2025-26.
const LAST_SEVEN = [
  '2019-20',
  '2020-21',
  '2021-22',
  '2022-23',
  '2023-24',
  '2024-25',
  '2025-26',
];
const ES = 'earned-settlement-2026-11';

/** Income for the last tax years, newest last; earlier years get `before`. */
function income(recent: (number | undefined)[], before?: number): IncomeYear[] {
  return LAST_SEVEN.map((taxYear, i) => {
    const j = i - (LAST_SEVEN.length - recent.length);
    return { taxYear, earnings: j >= 0 ? recent[j] : before };
  });
}

describe('ES-EARNINGS-5Y', () => {
  test('£50,270 does not meet, £50,271 and £50,272 do', () => {
    const at = (amount: number) =>
      run(esEarnings5Y, {
        incomeYears: income([amount, amount, amount, amount, amount], 0),
      }).status;
    expect(at(50270)).toBe('FAIL');
    expect(at(50271)).toBe('PASS');
    expect(at(50272)).toBe('PASS');
  });

  test('3 of 5 years pass, 2 of 5 fail', () => {
    expect(
      run(esEarnings5Y, { incomeYears: income([0, 60000, 60000, 0, 60000], 0) })
        .status,
    ).toBe('PASS');
    // On a tax-year start nothing is left in the current year; otherwise the
    // unrecorded current part year leaves one missing year open (PD-006).
    const short = { incomeYears: income([60000, 0, 0, 0, 60000], 0) };
    expect(run(esEarnings5Y, short, '2026-04-06').status).toBe('FAIL');
    expect(run(esEarnings5Y, short).status).toBe('UNKNOWN');
  });

  test('2 met plus 1 missing is unknown from missing input', () => {
    const result = run(esEarnings5Y, {
      incomeYears: income([undefined, 0, 0, 60000, 60000], 0),
    });
    expect(result.status).toBe('UNKNOWN');
    expect(result.pendingDetails).toBeUndefined();
  });

  test('A5#3: a decisive tax year straddling the five-year window is unknown', () => {
    const input = {
      incomeYears: income([50271, 0, 50271, 0, 50271], 0),
    };
    expect(run(esEarnings5Y, input)).toMatchObject({
      status: 'UNKNOWN',
      pendingDetails: ['PD-006'],
    });
    expect(run(esEarnings5Y, input, '2026-04-06').status).toBe('PASS');
    expect(
      run(esEarnings5Y, {
        incomeYears: [
          ...income([0, 0, 50271, 0, 50271], 0),
          { taxYear: '2026-27', earnings: 50271 },
        ],
      }),
    ).toMatchObject({ status: 'UNKNOWN', pendingDetails: ['PD-006'] });
    expect(
      run(esEarnings5Y, {
        incomeYears: [
          ...income([undefined, 0, 50271, 0, 50271], 0),
          { taxYear: '2026-27', earnings: 50271 },
        ],
      }).status,
    ).toBe('UNKNOWN');
  });
});

describe('ES-EARNINGS-3Y', () => {
  test('3 of the last 4 years at £125,141 pass; 2 fail', () => {
    expect(
      run(esEarnings3Y, { incomeYears: income([0, 125141, 125141, 125141], 0) })
        .status,
    ).toBe('PASS');
    expect(
      run(
        esEarnings3Y,
        { incomeYears: income([125141, 0, 0, 125141], 125141) },
        '2026-04-06',
      ).status,
    ).toBe('FAIL');
  });
});

describe('ES-EARNINGS-10Y', () => {
  test('5 of 7 years pass, 4 of 7 fail', () => {
    expect(
      run(esEarnings10Y, {
        incomeYears: income([0, 20000, 20000, 0, 20000, 20000, 20000]),
      }).status,
    ).toBe('PASS');
    expect(
      run(
        esEarnings10Y,
        { incomeYears: income([20000, 0, 0, 0, 20000, 20000, 20000]) },
        '2026-04-06',
      ).status,
    ).toBe('FAIL');
  });

  test('A5#2: amounts alone do not establish eligibility to combine earnings', () => {
    const at = (partnerEarnings: number) =>
      LAST_SEVEN.map((taxYear, index) => ({
        taxYear,
        earnings: 9000,
        ...(index >= 2 && { partnerEarnings }),
      }));
    const incomeYears = at(16142);
    expect(run(esEarnings10Y, { incomeYears })).toMatchObject({
      status: 'UNKNOWN',
      pendingDetails: ['PD-010'],
    });
    expect(run(esEarnings10Y, { incomeYears: at(16141) }).status).toBe('FAIL');
    const work = timeline({
      episodes: [{ ...timeline().episodes[1], validFrom: '2016-11-04' }],
      incomeYears,
    });
    expect(
      evaluate({ timeline: work, simulationDate: SIMULATION_DATE }).byRuleSet[
        ES
      ],
    ).toMatchObject({ outcome: 'POTENTIALLY_ELIGIBLE', pathwayYears: 10 });
    expect(
      run(esEarnings10Y, {
        incomeYears: incomeYears.map((year) => ({ ...year, earnings: 20000 })),
      }).status,
    ).toBe('PASS');
  });

  test('age 65 and the health exemption pass without income', () => {
    expect(
      run(esEarnings10Y, { incomeYears: [], dateOfBirth: '1961-11-04' }).status,
    ).toBe('PASS');
    expect(
      run(esEarnings10Y, { incomeYears: [], dateOfBirth: '1961-11-05' }).status,
    ).toBe('UNKNOWN');
    expect(
      run(esEarnings10Y, { incomeYears: [], earningsExemptHealth: true })
        .status,
    ).toBe('PASS');
  });
  test('A5#11: an adult child dependant needs no income (p29)', () => {
    const child = run(esEarnings10Y, {
      dateOfBirth: '2004-06-01',
      episodes: asDependant('PARENT'),
      incomeYears: [],
    });
    expect(child.status).toBe('PASS');
    expect(child.sources).toEqual([{ srcId: 'SRC-001', locator: 'p29' }]);
    expect(child.assumptions?.join('')).toContain('PD-059');
  });

  test('a partner dependant still needs the minimum income', () => {
    expect(
      run(esEarnings10Y, { episodes: asDependant('PARTNER'), incomeYears: [] })
        .status,
    ).toBe('UNKNOWN');
  });
});

describe('ES-BRITISH-CONNECTION', () => {
  const family: ImmigrationEpisode[] = [
    {
      route: 'FAMILY_PARTNER_OR_PARENT',
      role: 'MAIN',
      validFrom: '2022-01-01',
      validTo: '2027-06-30',
    },
  ];

  test('partner of a British citizen on a family route passes', () => {
    expect(
      run(esBritishConnection, {
        episodes: family,
        relationships: [
          { type: 'PARTNER', otherPartyStatus: 'BRITISH_CITIZEN' },
        ],
      }).status,
    ).toBe('PASS');
  });

  test('partner who is settled but not British fails', () => {
    expect(
      run(esBritishConnection, {
        episodes: family,
        relationships: [{ type: 'PARTNER', otherPartyStatus: 'SETTLED' }],
      }).status,
    ).toBe('FAIL');
  });

  test('A5#7: a British father does not qualify a settled partner’s Appendix FM applicant', () => {
    const input = timeline({
      episodes: [
        {
          ...family[0],
          familyPermission: 'PARTNER_FIVE_YEAR',
          validFrom: '2016-11-04',
        },
      ],
      incomeYears: income(LAST_SEVEN.map(() => 20000)),
      relationships: [
        { type: 'PARTNER', otherPartyStatus: 'SETTLED' },
        { type: 'PARENT', otherPartyStatus: 'BRITISH_CITIZEN' },
      ],
    });
    expect(run(esBritishConnection, input).status).toBe('FAIL');
    expect(
      evaluate({ timeline: input, simulationDate: SIMULATION_DATE }).byRuleSet[
        ES
      ],
    ).toMatchObject({ outcome: 'LIKELY_ELIGIBLE', pathwayYears: 10 });
    expect(
      run(esBritishConnection, {
        ...input,
        episodes: [{ ...input.episodes[0], familyPermission: 'PARENT' }],
        relationships: [
          ...input.relationships,
          { type: 'CHILD', otherPartyStatus: 'BRITISH_CITIZEN' },
        ],
      }).status,
    ).toBe('PASS');
  });

  test('UK Ancestry passes; a British partner on a work route does not count', () => {
    expect(
      run(esBritishConnection, {
        episodes: [{ ...family[0], route: 'UK_ANCESTRY' }],
      }).status,
    ).toBe('PASS');
    expect(
      run(esBritishConnection, {
        relationships: [
          { type: 'PARTNER', otherPartyStatus: 'BRITISH_CITIZEN' },
        ],
      }).status,
    ).toBe('FAIL');
  });
});

describe('ES-PUBLIC-FUNDS', () => {
  const benefit = (benefitType: string, from: string, to?: string) => ({
    benefitType,
    from,
    to,
  });

  test('Universal Credit in the last 5 years fails and says when it clears', () => {
    const result = run(esPublicFunds, {
      benefits: [benefit('UNIVERSAL_CREDIT', '2023-01-01', '2023-09-30')],
    });
    expect(result.status).toBe('FAIL');
    expect(result.explanation).toContain('2028-10-01');
  });

  test('use ending the day before the 5-year window passes; on its first day fails', () => {
    // Window for 2026-11-04 starts 2021-11-04.
    expect(
      run(esPublicFunds, {
        benefits: [benefit('HOUSING_BENEFIT', '2021-01-01', '2021-11-03')],
      }).status,
    ).toBe('PASS');
    expect(
      run(esPublicFunds, {
        benefits: [benefit('HOUSING_BENEFIT', '2021-01-01', '2021-11-04')],
      }).status,
    ).toBe('FAIL');
  });

  test('statutory payments are ignored; unlisted benefits are unknown for policy reasons', () => {
    expect(
      run(esPublicFunds, {
        benefits: [
          benefit('STATUTORY_MATERNITY_PAY', '2024-01-01', '2024-09-30'),
        ],
      }).status,
    ).toBe('PASS');
    const unlisted = run(esPublicFunds, {
      benefits: [benefit('ASYLUM_SUPPORT', '2024-01-01')],
    });
    expect(unlisted.status).toBe('UNKNOWN');
    expect(unlisted.pendingDetails).toEqual(['PD-013']);
  });

  test('A5#4 and review33e-1 #1: PD-047 applies after a claim; a clean history passes', () => {
    const episodes = [{ ...timeline().episodes[1], validFrom: '2023-01-01' }];
    const input = timeline({
      episodes,
      incomeYears: income([125141, 125141, 125141], 0),
    });
    // p18 only looks for use in the lookback.
    expect(run(esPublicFunds, input).status).toBe('PASS');
    expect(
      evaluate({ timeline: input, simulationDate: SIMULATION_DATE }).byRuleSet[
        ES
      ],
    ).toMatchObject({ outcome: 'LIKELY_ELIGIBLE', pathwayYears: 3 });
    // Individual D (p19): a past claim, then less than five years on a
    // qualifying route.
    const benefits = [benefit('UNIVERSAL_CREDIT', '2020-01-01', '2021-06-30')];
    expect(run(esPublicFunds, { ...input, benefits })).toMatchObject({
      status: 'UNKNOWN',
      pendingDetails: ['PD-047'],
    });
    expect(
      run(esPublicFunds, {
        benefits,
        episodes: [
          {
            ...episodes[0],
            validFrom: '2021-11-04',
            validTo: '2022-12-31',
            route: 'STUDENT',
          },
          ...episodes,
        ],
      }).status,
    ).toBe('UNKNOWN');
    expect(
      run(esPublicFunds, {
        benefits,
        episodes: [
          { ...episodes[0], validFrom: '2021-11-04', validTo: '2022-12-31' },
          ...episodes,
        ],
      }).status,
    ).toBe('PASS');
  });

  test('A5#5: a declared health condition makes a public funds exemption unresolved', () => {
    const benefits = [benefit('PERSONAL_INDEPENDENCE_PAYMENT', '2024-01-01')];
    expect(run(esPublicFunds, { benefits }).status).toBe('FAIL');
    expect(
      run(esPublicFunds, { benefits, earningsExemptHealth: true }),
    ).toMatchObject({
      status: 'UNKNOWN',
      pendingDetails: ['PD-013'],
    });
  });

  test('A5#6: the reported clearance date agrees with the leap-day lookback', () => {
    const input = {
      episodes: [{ ...timeline().episodes[0], validTo: '2030-12-31' }],
      benefits: [benefit('UNIVERSAL_CREDIT', '2023-02-28', '2023-02-28')],
    };
    const dayBefore = run(esPublicFunds, input, '2028-02-29');
    expect(dayBefore.status).toBe('FAIL');
    expect(dayBefore.explanation).toContain('2028-03-01');
    expect(run(esPublicFunds, input, '2028-03-01').status).toBe('PASS');
  });
});

describe('ES-PUBLIC-SERVICE', () => {
  const job = (
    socCode: string,
    validFrom: string,
    validTo: string,
  ): ImmigrationEpisode => ({
    route: 'SKILLED_WORKER',
    role: 'MAIN',
    validFrom,
    validTo,
    socCode,
    salary: 35000,
  });

  test('nurse for 5 years passes', () => {
    expect(
      run(esPublicService, {
        episodes: [job('2231', '2021-11-04', '2027-01-31')],
      }).status,
    ).toBe('PASS');
  });

  test('nurse since the start of qualifying residence passes before 5 years', () => {
    const result = run(esPublicService, {
      episodes: [job('2461', '2023-03-01', '2028-01-31')],
    });
    expect(result.status).toBe('PASS');
    expect(result.explanation).toContain('Social workers');
  });

  test('switched into a nursing job during qualifying residence is unknown (PD-012)', () => {
    const result = run(esPublicService, {
      episodes: [
        job('2136', '2020-01-01', '2023-12-31'),
        job('2231', '2024-01-01', '2028-01-31'),
      ],
    });
    expect(result.status).toBe('UNKNOWN');
    expect(result.pendingDetails).toEqual(['PD-012']);
  });

  test('a job outside Annex C fails', () => {
    expect(run(esPublicService).status).toBe('FAIL');
  });

  test('A5#8: moving out of Annex C after completing five years is unknown', () => {
    const result = run(esPublicService, {
      episodes: [
        job('2231', '2020-11-01', '2023-10-31'),
        job('2231', '2023-11-01', '2025-11-01'),
        job('2136', '2025-11-02', '2028-01-31'),
      ],
    });
    expect(result).toMatchObject({
      status: 'UNKNOWN',
      pendingDetails: ['PD-012'],
    });
  });
});

test('review33e-1 #2 and review33e-2: one year short is left open for the unrecorded current tax year (PD-006)', () => {
  const result = run(esEarnings5Y, {
    incomeYears: income([0, 0, 0, 50271, 50271]),
  });
  expect(result).toMatchObject({
    status: 'UNKNOWN',
    pendingDetails: ['PD-006'],
  });
  // Two or more years short still fails.
  expect(
    run(esEarnings5Y, { incomeYears: income([0, 0, 0, 0, 50271]) }).status,
  ).toBe('FAIL');
  // A benefit that starts after the application date is not a past claim.
  expect(
    run(esPublicFunds, {
      episodes: [{ ...timeline().episodes[1], validFrom: '2023-01-01' }],
      benefits: [
        {
          benefitType: 'UNIVERSAL_CREDIT',
          from: '2027-01-01',
          to: '2027-06-30',
        },
      ],
    }).status,
  ).toBe('PASS');
});
