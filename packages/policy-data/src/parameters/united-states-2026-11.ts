import type { Parameter } from '../types';

// United States pilot (phase 18, task 62): INA (8 U.S.C., SRC-079), 8 CFR
// (SRC-080) and the USCIS Policy Manual (SRC-081).
export const unitedStates2026_11 = {
  asOf: '2026-11-21',
  values: {
    // INA 316(a): years of continuous residence after becoming a permanent
    // resident, and days in the United States in that time (30 months).
    naturalizationYears: {
      value: 5,
      sources: [
        { srcId: 'SRC-079', locator: '8 U.S.C. 1427(a)' },
        { srcId: 'SRC-080', locator: '8 CFR 316.2(a)(3)' },
      ],
    },
    physicalPresenceDays: {
      value: 913,
      sources: [
        { srcId: 'SRC-079', locator: '8 U.S.C. 1427(a)' },
        {
          srcId: 'SRC-081',
          locator: 'Vol 12 Part D Ch 4(A)',
          url: 'https://www.uscis.gov/policy-manual/volume-12-part-d-chapter-4',
        },
      ],
    },
    // INA 319(a): spouse of a U.S. citizen (18 months in the United States).
    spouseYears: {
      value: 3,
      sources: [
        {
          srcId: 'SRC-079',
          locator: '8 U.S.C. 1430(a)',
          url: 'https://uscode.house.gov/us/usc/t8/s1430/',
        },
        {
          srcId: 'SRC-081',
          locator: 'Vol 12 Part G Ch 3(A)–(B)',
          url: 'https://www.uscis.gov/policy-manual/volume-12-part-g-chapter-3',
        },
      ],
    },
    spousePresenceDays: {
      value: 548,
      sources: [
        {
          srcId: 'SRC-079',
          locator: '8 U.S.C. 1430(a)',
          url: 'https://uscode.house.gov/us/usc/t8/s1430/',
        },
        {
          srcId: 'SRC-081',
          locator: 'Vol 12 Part G Ch 3(D)',
          url: 'https://www.uscis.gov/policy-manual/volume-12-part-g-chapter-3',
        },
      ],
    },
    // Filing up to this many days before continuous residence is met.
    earlyFilingDays: {
      value: 90,
      sources: [
        {
          srcId: 'SRC-080',
          locator: '8 CFR 334.2(b)',
          url: 'https://www.ecfr.gov/api/versioner/v1/full/2026-11-19/title-8.xml?part=334',
        },
        {
          srcId: 'SRC-081',
          locator: 'Vol 12 Part D Ch 6(D)',
          url: 'https://www.uscis.gov/policy-manual/volume-12-part-d-chapter-6',
        },
      ],
    },
    // An absence of more than this many days is presumed to break
    // continuous residence; one of this many days or more breaks it.
    // An absence of more than this many days is presumed to break continuity
    // (the Policy Manual states 180 days)...
    presumptionDays: {
      value: 180,
      sources: [
        { srcId: 'SRC-079', locator: '8 U.S.C. 1427(b)' },
        { srcId: 'SRC-080', locator: '8 CFR 316.5(c)(1)(i)' },
        { srcId: 'SRC-081', locator: 'Vol 12 Part D Ch 3(C)(1)' },
      ],
    },
    // ...while its worked examples count calendar months (PD-093).
    presumptionMonths: {
      value: 6,
      sources: [
        { srcId: 'SRC-079', locator: '8 U.S.C. 1427(b)' },
        { srcId: 'SRC-080', locator: '8 CFR 316.5(c)(1)(i)' },
        {
          srcId: 'SRC-081',
          locator: 'Vol 12 Part D Ch 3(C)(1) example; Ch 3(C)(3) table',
        },
      ],
    },
    breakDays: {
      value: 365,
      sources: [
        { srcId: 'SRC-080', locator: '8 CFR 316.5(c)(1)(ii)' },
        { srcId: 'SRC-081', locator: 'Vol 12 Part D Ch 3(C)(2)' },
      ],
    },
    stateResidenceMonths: {
      value: 3,
      sources: [
        { srcId: 'SRC-079', locator: '8 U.S.C. 1427(a)' },
        { srcId: 'SRC-080', locator: '8 CFR 316.2(a)(5)' },
      ],
    },
    minAge: {
      value: 18,
      sources: [{ srcId: 'SRC-080', locator: '8 CFR 316.2(a)(1)' }],
    },
    // Conditional residence: the petition is filed in the days before the
    // second anniversary.
    conditionalYears: {
      value: 2,
      sources: [
        {
          srcId: 'SRC-079',
          locator: '8 U.S.C. 1186a(d)(2)(A)',
          url: 'https://uscode.house.gov/us/usc/t8/s1186a/',
        },
        {
          srcId: 'SRC-079',
          locator: '8 U.S.C. 1186b(d)(2)(A)(i)',
          url: 'https://uscode.house.gov/us/usc/t8/s1186b/',
        },
      ],
    },
    // A child is in the parent's joint I-751 only with status from the same
    // day or within this many days after the parent.
    childConcurrentDays: {
      value: 90,
      sources: [
        {
          srcId: 'SRC-080',
          locator: '8 CFR 216.4(a)(2)',
          url: 'https://www.ecfr.gov/api/versioner/v1/full/2026-11-19/title-8.xml?part=216',
        },
      ],
    },
    conditionsWindowDays: {
      value: 90,
      sources: [
        {
          srcId: 'SRC-080',
          locator: '8 CFR 216.4(a)(1)',
          url: 'https://www.ecfr.gov/api/versioner/v1/full/2026-11-19/title-8.xml?part=216',
        },
        {
          srcId: 'SRC-080',
          locator: '8 CFR 216.6(a)(1)(i)',
          url: 'https://www.ecfr.gov/api/versioner/v1/full/2026-11-19/title-8.xml?part=216',
        },
        {
          srcId: 'SRC-082',
          locator: 'When to File Your Petition to Remove Conditions',
        },
      ],
    },
    // A green card is an entry document after an absence of less than this.
    greenCardReturnYears: {
      value: 1,
      sources: [
        {
          srcId: 'SRC-080',
          locator: '8 CFR 211.1(a)(2)',
          url: 'https://www.ecfr.gov/api/versioner/v1/full/2026-11-19/title-8.xml?part=211',
        },
      ],
    },
    // Returning after more than this many days away is seeking admission.
    seekingAdmissionDays: {
      value: 180,
      sources: [
        {
          srcId: 'SRC-079',
          locator: '8 U.S.C. 1101(a)(13)(C)(ii)',
          url: 'https://uscode.house.gov/us/usc/t8/s1101/',
        },
      ],
    },
  },
} satisfies { asOf: string; values: Record<string, Parameter<number>> };
