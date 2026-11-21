import type { Parameter } from '../types';

// Canada pilot (phase 18, task 61): Immigration and Refugee Protection Act
// s28 (SRC-075) and Citizenship Act s5 (SRC-074), current to 2026-10-29.
export const canada2026_11 = {
  asOf: '2026-11-21',
  values: {
    // Residency obligation: days in Canada in each five-year period.
    prObligationDays: {
      value: 730,
      sources: [{ srcId: 'SRC-075', locator: 's28(2)(a)(i)' }],
    },
    prWindowYears: {
      value: 5,
      sources: [{ srcId: 'SRC-075', locator: 's28(1)–(2)(b)' }],
    },
    // Citizenship: days of physical presence in the years before applying.
    citizenshipDays: {
      value: 1095,
      sources: [{ srcId: 'SRC-074', locator: 's5(1)(c)(i)' }],
    },
    citizenshipWindowYears: {
      value: 5,
      sources: [{ srcId: 'SRC-074', locator: 's5(1)(c)(i)' }],
    },
    // Days before becoming a permanent resident count half, up to this many.
    preResidenceCreditCap: {
      value: 365,
      sources: [{ srcId: 'SRC-074', locator: 's5(1.001)(a)' }],
    },
    // Language and knowledge apply from this age to below the maximum.
    languageMinAge: {
      value: 18,
      sources: [{ srcId: 'SRC-074', locator: 's5(1)(d)–(e)' }],
    },
    languageMaxAge: {
      value: 55,
      sources: [{ srcId: 'SRC-074', locator: 's5(1)(d)–(e)' }],
    },
  },
} satisfies { asOf: string; values: Record<string, Parameter<number>> };
