import type { Parameter } from '../types';

// New Zealand pilot (phase 18, task 60): Immigration Instructions (SRC-072)
// and Citizenship Act 1977 s8 (SRC-070).
export const newZealand2026_11 = {
  asOf: '2026-11-21',
  values: {
    // Permanent resident visa: months holding the resident visa, and months
    // since the first day in New Zealand as a resident, at application.
    prvHeldMonths: {
      value: 24,
      sources: [{ srcId: 'SRC-072', locator: 'RV2.5(a)(i)' }],
    },
    prvFirstDayMonths: {
      value: 24,
      sources: [{ srcId: 'SRC-072', locator: 'RV2.5(b)' }],
    },
    // Days in New Zealand as a resident in each of the two 12-month portions
    // of the 24 months before applying.
    prvPortionDays: {
      value: 184,
      sources: [{ srcId: 'SRC-072', locator: 'RV2.5.1' }],
    },
    // The same, on the tax residence route.
    prvTaxPortionDays: {
      value: 41,
      sources: [{ srcId: 'SRC-072', locator: 'RV2.5.5(a)' }],
    },
    // Offshore grant: first entry within this many years of the grant.
    firstEntryYears: {
      value: 1,
      sources: [{ srcId: 'SRC-072', locator: 'R5.66.1(a)' }],
    },
    // Multiple-entry travel conditions, years from the first day in New
    // Zealand as a resident, by residence category.
    travelYears: {
      value: {
        general: 2,
        parent: 10,
        'religious-worker': 5,
        'aip-growth': 4,
        'aip-balanced': 6,
      },
      sources: [{ srcId: 'SRC-072', locator: 'R5.66.5(a)' }],
    },
    citizenshipMinAge: {
      value: 16,
      sources: [{ srcId: 'SRC-070', locator: 's8(1)(a)' }],
    },
    citizenshipWindowYears: {
      value: 5,
      sources: [{ srcId: 'SRC-070', locator: 's8(2)(b)(i)' }],
    },
    citizenshipTotalDays: {
      value: 1350,
      sources: [
        { srcId: 'SRC-070', locator: 's8(2)(b)(i)' },
        { srcId: 'SRC-073', locator: 'What are the presence requirements? 2' },
      ],
    },
    citizenshipYearDays: {
      value: 240,
      sources: [
        { srcId: 'SRC-070', locator: 's8(2)(b)(ii)' },
        { srcId: 'SRC-073', locator: 'What are the presence requirements? 2' },
      ],
    },
  },
} satisfies {
  asOf: string;
  values: Record<string, Parameter<number | Record<string, number>>>;
};
