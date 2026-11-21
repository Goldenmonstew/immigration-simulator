import type { Parameter } from '../types';

// Greece pilot (phase 18, task 64): Migration Code ν. 5038/2023 as amended
// (SRC-086, SRC-087) and the Greek Citizenship Code art. 5 (SRC-088).
export const greece2026_11 = {
  asOf: '2026-11-21',
  values: {
    // Long-term residence (Μ1): years of legal, uninterrupted residence
    // immediately before applying.
    longTermYears: {
      value: 5,
      sources: [
        {
          srcId: 'SRC-087',
          locator: 'ν. 5307/2026 άρθ. 179 (άρθ. 144 παρ. 1, p93)',
        },
      ],
    },
    // Absences count when each is shorter than this many months...
    singleAbsenceMonths: {
      value: 6,
      sources: [
        {
          srcId: 'SRC-087',
          locator: 'ν. 5307/2026 άρθ. 179 (άρθ. 144 παρ. 3, p93)',
        },
      ],
    },
    // ...and they total no more than this many months in the five years.
    totalAbsenceMonths: {
      value: 10,
      sources: [
        {
          srcId: 'SRC-087',
          locator: 'ν. 5307/2026 άρθ. 179 (άρθ. 144 παρ. 3, p93)',
        },
      ],
    },
    // Golden visa (Β.5): permit and each renewal last this many years.
    goldenVisaYears: {
      value: 5,
      sources: [
        { srcId: 'SRC-086', locator: 'άρθ. 95 παρ. 1 (p64)' },
        {
          srcId: 'SRC-087',
          locator: 'ν. 5100/2024 άρθ. 64 (άρθ. 100 παρ. 1 p48, παρ. 4 p49)',
        },
      ],
    },
    // Renewal: apply within this many months before expiry...
    renewalWindowMonths: {
      value: 2,
      sources: [
        {
          srcId: 'SRC-087',
          locator: 'ν. 5275/2026 άρθ. 12 (άρθ. 11 παρ. 1, p18)',
        },
      ],
    },
    // ...or late, up to this many months after it, with a fine per month.
    lateRenewalMonths: {
      value: 3,
      sources: [
        {
          srcId: 'SRC-087',
          locator: 'ν. 5275/2026 άρθ. 12 (άρθ. 11 παρ. 1, p18)',
        },
      ],
    },
    lateFinePerMonthEur: {
      value: 100,
      sources: [
        {
          srcId: 'SRC-087',
          locator: 'ν. 5275/2026 άρθ. 12 (άρθ. 11 παρ. 1, p18)',
        },
      ],
    },
    // Naturalisation: years of continuous legal residence by route.
    nationalityYears: {
      value: { general: 7, 'three-year': 3, 'twelve-year': 12 },
      sources: [
        {
          srcId: 'SRC-088',
          locator: 'ν. 3838/2010 άρθ. 2 (άρθ. 5 παρ. 1 δ, p2)',
        },
        { srcId: 'SRC-088', locator: 'ν. 4674/2020 άρθ. 94 (p51)' },
        {
          srcId: 'SRC-088',
          locator: 'ν. 4531/2018 άρθ. 31 παρ. 3 (άρθ. 5 παρ. 3, p119)',
        },
      ],
    },
  },
} satisfies {
  asOf: string;
  values: Record<string, Parameter<number | Record<string, number>>>;
};
