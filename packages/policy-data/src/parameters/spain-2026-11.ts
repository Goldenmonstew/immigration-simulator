import type { Parameter } from '../types';

// Spain pilot (phase 18, task 63): Reglamento de extranjería (RD 1155/2024,
// SRC-083) and Código Civil (SRC-084).
export const spain2026_11 = {
  asOf: '2026-11-21',
  values: {
    // Residencia de larga duración nacional: years of legal, continuous
    // residence before applying.
    longTermYears: {
      value: 5,
      sources: [{ srcId: 'SRC-083', locator: 'art. 183.1 (p133)' }],
    },
    // Applying within this many months after the permit expired extends it.
    longTermLateMonths: {
      value: 3,
      sources: [
        { srcId: 'SRC-083', locator: 'art. 184.2 (p134–p135)' },
        // Ending on a Saturday or Sunday, it moves to the next working day.
        { srcId: 'SRC-090', locator: 'art. 30.2, 30.4, 30.5 (p29–p30)' },
      ],
    },
    // Absences that do not break continuity: each up to this many months...
    singleAbsenceMonths: {
      value: 6,
      sources: [{ srcId: 'SRC-083', locator: 'art. 183.2 (p133)' }],
    },
    // ...and up to this many months in total within the five years.
    totalAbsenceMonths: {
      value: 10,
      sources: [{ srcId: 'SRC-083', locator: 'art. 183.2 (p133)' }],
    },
    // Nacionalidad por residencia: years of residence by route.
    nationalityYears: {
      value: {
        general: 10,
        refugee: 5,
        ibero: 2,
        marriage: 1,
        'one-year': 1,
      },
      sources: [{ srcId: 'SRC-084', locator: 'art. 22.1–22.2 (p21)' }],
    },
    // Married to a Spanish citizen for this many years when applying.
    marriageYears: {
      value: 1,
      sources: [{ srcId: 'SRC-084', locator: 'art. 22.2.d) (p21)' }],
    },
  },
} satisfies {
  asOf: string;
  values: Record<string, Parameter<number | Record<string, number>>>;
};
