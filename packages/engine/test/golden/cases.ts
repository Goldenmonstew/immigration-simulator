import type {
  ImmigrationEpisode,
  PersonTimeline,
  SimulationRequest,
} from '../../src/types';

// Typical situations people bring to the simulator, added on top of the
// policy-data fixtures. They carry no expected result: golden.test.ts records
// the engine's current answer for every case and both rule sets, so any change
// in a conclusion shows up as a snapshot diff, and the same cases feed the
// review packet for a regulated adviser (docs/review/adviser-packet.md).

export interface GoldenCase {
  id: string;
  /** One line a reviewer can read without the JSON. */
  title: string;
  request: SimulationRequest;
}

const sw = (
  validFrom: string,
  validTo: string,
  salary = 52000,
  socCode = '2136',
): ImmigrationEpisode => ({
  route: 'SKILLED_WORKER',
  role: 'MAIN',
  validFrom,
  validTo,
  socCode,
  salary,
});

const years = (from: number, to: number, earnings: number) =>
  Array.from({ length: to - from + 1 }, (_, i) => ({
    taxYear: `${from + i}-${String((from + i + 1) % 100).padStart(2, '0')}`,
    earnings,
  }));

/** Adult with clean history, B2 English and Life in the UK passed. */
function person(overrides: Partial<PersonTimeline>): PersonTimeline {
  return {
    dateOfBirth: '1992-04-10',
    nationality: 'IND',
    episodes: [],
    absences: [],
    incomeYears: [],
    benefits: [],
    relationships: [],
    english: { cefrLevel: 'B2' },
    lifeInTheUk: { passed: true },
    criminalRecord: [],
    immigrationBreaches: [],
    governmentDebt: { outstanding: false },
    ...overrides,
  };
}

const swFiveYears = person({
  episodes: [sw('2021-06-01', '2024-05-31'), sw('2024-06-01', '2027-05-31')],
  incomeYears: years(2021, 2025, 52000),
});

export const goldenCases: GoldenCase[] = [
  {
    id: 'G-SW-5Y-ON-DAY',
    title:
      'Skilled Worker since 2021-06-01 on £52,000 (SOC 2136), applies the day 5 years are completed',
    request: { simulationDate: '2026-06-01', timeline: swFiveYears },
  },
  {
    id: 'G-SW-5Y-DAY-BEFORE',
    title: 'Same Skilled Worker, applies one day before 5 years',
    request: { simulationDate: '2026-05-31', timeline: swFiveYears },
  },
  {
    id: 'G-SW-ABSENCE-200-DAYS',
    title:
      'Same Skilled Worker, 200 days outside the UK in one 12-month period',
    request: {
      simulationDate: '2026-06-01',
      timeline: {
        ...swFiveYears,
        absences: [{ from: '2023-01-10', to: '2023-07-28' }],
      },
    },
  },
  {
    id: 'G-SW-NO-ENGLISH-LITUK',
    title: 'Same Skilled Worker, English and Life in the UK test not provided',
    request: {
      simulationDate: '2026-06-01',
      timeline: { ...swFiveYears, english: undefined, lifeInTheUk: undefined },
    },
  },
  {
    id: 'G-SW-B1-AFTER-2027-03-26',
    title:
      'Skilled Worker since 2022-04-01 with B1 English, applies on 2027-04-01 (after the B2 date)',
    request: {
      simulationDate: '2027-04-01',
      timeline: person({
        episodes: [
          sw('2022-04-01', '2025-03-31'),
          sw('2025-04-01', '2028-03-31'),
        ],
        incomeYears: years(2022, 2026, 52000),
        english: { cefrLevel: 'B1' },
      }),
    },
  },
  {
    id: 'G-SW-PRE-2024-SALARY-BEFORE-CUTOFF',
    title:
      'Skilled Worker since 2024-01-15 on £41,000, applies 2029-01-15 (old-salary window open)',
    request: {
      simulationDate: '2029-01-15',
      timeline: person({
        dateOfBirth: '1996-03-02',
        nationality: 'CHN',
        episodes: [
          sw('2024-01-15', '2027-01-14', 41000, '2134'),
          sw('2027-01-15', '2030-01-14', 41000, '2134'),
        ],
        incomeYears: years(2024, 2028, 41000),
      }),
    },
  },
  {
    id: 'G-SW-PRE-2024-SALARY-AFTER-CUTOFF',
    title:
      'Same Skilled Worker on £41,000, applies 2030-04-04 (the day the old-salary window closes)',
    request: {
      simulationDate: '2030-04-04',
      timeline: person({
        dateOfBirth: '1996-03-02',
        nationality: 'CHN',
        episodes: [
          sw('2024-01-15', '2027-01-14', 41000, '2134'),
          sw('2027-01-15', '2030-01-14', 41000, '2134'),
          sw('2030-01-15', '2033-01-14', 41000, '2134'),
        ],
        incomeYears: years(2024, 2029, 41000),
      }),
    },
  },
  {
    id: 'G-SW-CARE-WORKER',
    title:
      'Care worker (SOC 6135) on Skilled Worker since 2021-09-01 at £25,000',
    request: {
      simulationDate: '2026-09-01',
      timeline: person({
        nationality: 'NGA',
        episodes: [
          sw('2021-09-01', '2024-08-31', 25000, '6135'),
          sw('2024-09-01', '2027-08-31', 25000, '6135'),
        ],
        incomeYears: years(2021, 2025, 25000),
      }),
    },
  },
  {
    id: 'G-STUDENT-GRADUATE-SW',
    title:
      'Student 2019–2022, Graduate 2022–2024, then Skilled Worker; applies 2026-11-16',
    request: {
      simulationDate: '2026-11-16',
      timeline: person({
        dateOfBirth: '1998-07-01',
        nationality: 'MYS',
        episodes: [
          {
            route: 'STUDENT',
            role: 'MAIN',
            validFrom: '2019-09-15',
            validTo: '2022-09-14',
          },
          {
            route: 'GRADUATE',
            role: 'MAIN',
            validFrom: '2022-09-15',
            validTo: '2024-09-14',
          },
          sw('2024-09-15', '2027-09-14', 45000, '2134'),
        ],
        incomeYears: years(2024, 2025, 45000),
      }),
    },
  },
  {
    id: 'G-LONG-RESIDENCE-10Y',
    title:
      'Student 2016–2020, Graduate 2020–2022, Skilled Worker since 2022; 10 years lawful residence on 2026-09-15',
    request: {
      simulationDate: '2026-09-15',
      timeline: person({
        dateOfBirth: '1997-11-20',
        nationality: 'PAK',
        episodes: [
          {
            route: 'STUDENT',
            role: 'MAIN',
            validFrom: '2016-09-15',
            validTo: '2020-09-14',
          },
          {
            route: 'GRADUATE',
            role: 'MAIN',
            validFrom: '2020-09-15',
            validTo: '2022-09-14',
          },
          sw('2022-09-15', '2027-09-14', 48000, '2134'),
        ],
        incomeYears: years(2022, 2025, 48000),
      }),
    },
  },
  {
    id: 'G-VISIT-ONLY',
    title: 'Only visit visas, no qualifying residence',
    request: {
      simulationDate: '2026-11-16',
      timeline: person({
        nationality: 'USA',
        episodes: [
          {
            route: 'VISIT',
            role: 'MAIN',
            validFrom: '2026-06-01',
            validTo: '2026-11-30',
          },
        ],
      }),
    },
  },
  {
    id: 'G-HKBNO-ONE-MONTH-SHORT',
    title:
      'Hong Kong BN(O) Status Holder since 2021-12-01, applies 2026-11-01 (one month short of 5 years)',
    request: {
      simulationDate: '2026-11-01',
      timeline: person({
        dateOfBirth: '1980-05-05',
        nationality: 'HKG',
        english: { cefrLevel: 'B1' },
        episodes: [
          {
            route: 'HONG_KONG_BNO',
            role: 'MAIN',
            validFrom: '2021-12-01',
            validTo: '2026-11-30',
          },
        ],
      }),
    },
  },
  {
    id: 'G-FAMILY-10Y-PARTNER',
    title:
      'Partner of a British citizen on the 10-year Appendix FM route since 2016-10-01',
    request: {
      simulationDate: '2026-10-01',
      timeline: person({
        nationality: 'BRA',
        relationships: [
          { type: 'PARTNER', otherPartyStatus: 'BRITISH_CITIZEN' },
        ],
        episodes: [
          {
            route: 'FAMILY_PARTNER_OR_PARENT',
            role: 'MAIN',
            familyPermission: 'PARTNER_TEN_YEAR',
            validFrom: '2016-10-01',
            validTo: '2029-03-31',
          },
        ],
      }),
    },
  },
  {
    id: 'G-FAMILY-5Y-LOW-INCOME',
    title:
      'Partner of a British citizen on the 5-year Appendix FM route, household income £21,000 and no savings',
    request: {
      simulationDate: '2026-08-01',
      timeline: person({
        nationality: 'PHL',
        relationships: [
          { type: 'PARTNER', otherPartyStatus: 'BRITISH_CITIZEN' },
        ],
        episodes: [
          {
            route: 'FAMILY_PARTNER_OR_PARENT',
            role: 'MAIN',
            familyPermission: 'PARTNER_FIVE_YEAR',
            validFrom: '2021-08-01',
            validTo: '2027-01-31',
          },
        ],
        incomeYears: years(2021, 2025, 9000).map((y) => ({
          ...y,
          partnerEarnings: 12000,
        })),
        cashSavings: 0,
      }),
    },
  },
  {
    id: 'G-GLOBAL-TALENT-3Y',
    title:
      'Global Talent (exceptional talent) since 2023-08-01, applies after 3 years',
    request: {
      simulationDate: '2026-08-01',
      timeline: person({
        nationality: 'KOR',
        episodes: [
          {
            route: 'GLOBAL_TALENT',
            role: 'MAIN',
            validFrom: '2023-08-01',
            validTo: '2028-07-31',
            globalTalentEndorsement: 'TECH_NATION',
            globalTalentCriteria: 'EXCEPTIONAL_TALENT',
          },
        ],
        incomeYears: years(2023, 2025, 70000),
      }),
    },
  },
  {
    id: 'G-REFUGEE-5Y',
    title: 'Refugee status since 2021-07-01, applies after 5 years',
    request: {
      simulationDate: '2026-07-01',
      timeline: person({
        nationality: 'SDN',
        english: undefined,
        lifeInTheUk: undefined,
        asylumSupportRepayment: 'NOT_REQUIRED',
        episodes: [
          {
            route: 'CORE_PROTECTION',
            role: 'MAIN',
            validFrom: '2021-07-01',
            validTo: '2026-07-31',
          },
        ],
      }),
    },
  },
  {
    id: 'G-SW-PARTNER',
    title:
      'Dependent partner (earning £26,000) of the 5-year Skilled Worker (G-SW-5Y-ON-DAY), applies the same day',
    request: {
      simulationDate: '2026-06-01',
      principal: swFiveYears,
      timeline: person({
        dateOfBirth: '1993-09-09',
        incomeYears: years(2021, 2025, 26000),
        relationships: [{ type: 'PARTNER', otherPartyStatus: 'OTHER' }],
        episodes: swFiveYears.episodes.map(({ validFrom, validTo }) => ({
          route: 'SKILLED_WORKER',
          role: 'DEPENDANT',
          validFrom,
          validTo,
          dependantOf: 'PARTNER',
        })),
      }),
    },
  },
  {
    id: 'G-SW-CHILD',
    title:
      'Child (born 2015) of the 5-year Skilled Worker, dependant since 2021-06-01',
    request: {
      simulationDate: '2026-06-01',
      principal: swFiveYears,
      timeline: person({
        dateOfBirth: '2015-02-14',
        english: undefined,
        lifeInTheUk: undefined,
        relationships: [{ type: 'PARENT', otherPartyStatus: 'OTHER' }],
        episodes: swFiveYears.episodes.map(({ validFrom, validTo }) => ({
          route: 'SKILLED_WORKER',
          role: 'DEPENDANT',
          validFrom,
          validTo,
          dependantOf: 'PARENT',
        })),
      }),
    },
  },
  {
    id: 'G-SW-AGED-66-NO-ENGLISH',
    title:
      'Skilled Worker aged 66 on the application date, no English test or Life in the UK test',
    request: {
      simulationDate: '2026-06-01',
      timeline: {
        ...swFiveYears,
        dateOfBirth: '1960-03-01',
        english: undefined,
        lifeInTheUk: undefined,
      },
    },
  },
  {
    id: 'G-CRIMINAL-RECORD',
    title: 'Same Skilled Worker with a criminal conviction in 2024',
    request: {
      simulationDate: '2026-06-01',
      timeline: { ...swFiveYears, criminalRecord: [{ date: '2024-02-01' }] },
    },
  },
  {
    id: 'G-OVERSTAY-BREACH',
    title:
      'Same Skilled Worker who overstayed for a period in 2020 before the current permission',
    request: {
      simulationDate: '2026-06-01',
      timeline: {
        ...swFiveYears,
        immigrationBreaches: [{ type: 'OVERSTAYING', date: '2020-03-01' }],
      },
    },
  },
  {
    id: 'G-UNIVERSAL-CREDIT',
    title:
      'Same Skilled Worker who received Universal Credit for 8 months in 2023',
    request: {
      simulationDate: '2026-06-01',
      timeline: {
        ...swFiveYears,
        benefits: [
          {
            benefitType: 'UNIVERSAL_CREDIT',
            from: '2023-03-01',
            to: '2023-10-31',
          },
        ],
      },
    },
  },
];
