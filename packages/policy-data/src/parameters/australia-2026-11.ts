import type { Parameter } from '../types';

// Australia pilot (phase 17): Migration Regulations 1994 Compilation No. 291
// (SRC-062) and Australian Citizenship Act 2007 Compilation No. 37 (SRC-061).
export const australia2026_11 = {
  asOf: '2026-11-21',
  values: {
    // Subclass 191, Regional Provisional Visas stream: years holding the
    // current 491 or 494 visa.
    regionalProvisionalYears: {
      value: 3,
      sources: [
        { srcId: 'SRC-062', locator: 'Sch 1 item 1139(3)(c)(ii)' },
        { srcId: 'SRC-063', locator: 'Eligibility → Have an eligible visa' },
      ],
    },
    // Hong Kong streams: years holding the current 457, 482 or 485 visa, and
    // years usually resident in Australia immediately before applying.
    hongKongIndependentYears: {
      value: 4,
      sources: [
        { srcId: 'SRC-062', locator: 'Sch 1 item 1137(4L)(e)(iii)' },
        { srcId: 'SRC-062', locator: '189.242' },
      ],
    },
    // The Hong Kong streams' 457, 482 and 485 visas allow a stay of this many
    // years from when they came into effect (granted from 9 July 2020).
    // Applications in the Hong Kong streams may be made from this date.
    hongKongStreamsFrom: {
      value: '2022-03-05',
      sources: [
        { srcId: 'SRC-062', locator: 'Sch 1 item 1137(4L)(b)' },
        { srcId: 'SRC-062', locator: 'Sch 1 item 1139(3)(bb)(i)' },
      ],
    },
    // Visas granted from this date must allow the 5-year stay; earlier ones
    // must not allow a stay after hongKongOldVisaUntil.
    hongKongNewVisaFrom: {
      value: '2020-07-09',
      sources: [
        { srcId: 'SRC-062', locator: 'Sch 1 item 1137(4M)(c)' },
        { srcId: 'SRC-062', locator: 'Sch 1 item 1139(3A)(c)' },
      ],
    },
    hongKongOldVisaUntil: {
      value: '2025-07-08',
      sources: [
        { srcId: 'SRC-062', locator: 'Sch 1 item 1137(4M)(c)(i)' },
        { srcId: 'SRC-062', locator: 'Sch 1 item 1139(3A)(c)(i)' },
      ],
    },
    hongKongVisaYears: {
      value: 5,
      sources: [
        { srcId: 'SRC-062', locator: 'Sch 1 item 1137(4M)(c)(ii)' },
        { srcId: 'SRC-062', locator: 'Sch 1 item 1139(3A)(c)(ii)' },
      ],
    },
    hongKongRegionalYears: {
      value: 3,
      sources: [
        { srcId: 'SRC-062', locator: 'Sch 1 item 1139(3)(ca)(iii)' },
        { srcId: 'SRC-062', locator: '191.231(2)' },
        { srcId: 'SRC-062', locator: '191.232' },
      ],
    },
    // Subclass 186 Temporary Residence Transition stream: in the window
    // before applying, 457/482 visas and full-time sponsored work for a
    // total of the held years.
    trtWindowYears: {
      value: 3,
      sources: [
        { srcId: 'SRC-062', locator: '186.226(1)' },
        { srcId: 'SRC-062', locator: '186.227(1)' },
      ],
    },
    trtHeldYears: {
      value: 2,
      sources: [
        { srcId: 'SRC-062', locator: '186.226(1)' },
        { srcId: 'SRC-062', locator: '186.227(1)' },
        {
          srcId: 'SRC-064',
          locator:
            'Eligibility → Have 2 years eligible sponsored employment in the 3 years prior to your application',
        },
      ],
    },
    // Age at application must be below this, unless in an exempt class.
    trtMaxAge: {
      value: 45,
      sources: [{ srcId: 'SRC-062', locator: '186.221' }],
    },
    // Partner visas: years since the combined application, unless already in
    // a long-term partner relationship when applying (reg 1.03).
    partnerWaitYears: {
      value: 2,
      sources: [
        { srcId: 'SRC-062', locator: '801.221(2)(d), (6A)' },
        { srcId: 'SRC-062', locator: '100.221(2)(c), (5)' },
        { srcId: 'SRC-065', locator: 'Eligibility → Visa requirements' },
      ],
    },
    // Resident Return visa: days in Australia as a permanent visa holder in
    // the window before applying; arrival and departure days count.
    rrvWindowYears: {
      value: 5,
      sources: [{ srcId: 'SRC-062', locator: '155.212(2)' }],
    },
    rrvPresenceDays: {
      value: 730,
      sources: [
        { srcId: 'SRC-062', locator: '155.212(2)' },
        {
          srcId: 'SRC-066',
          locator:
            'Eligibility → Option 1: Present in Australia for 2 of the last 5 years',
        },
      ],
    },
    // Permanent visas let the holder travel to and enter Australia for this
    // many years from grant; so does a 155 granted under 155.212(2).
    travelFacilityYears: {
      value: 5,
      sources: [
        { srcId: 'SRC-062', locator: '100.511' },
        { srcId: 'SRC-062', locator: '186.511' },
        { srcId: 'SRC-062', locator: '189.511' },
        { srcId: 'SRC-062', locator: '190.511' },
        { srcId: 'SRC-062', locator: '191.511' },
        { srcId: 'SRC-062', locator: '801.511' },
        { srcId: 'SRC-062', locator: '155.511(b)' },
      ],
    },
    // Citizenship by conferral, general residence requirement.
    citizenshipMinAge: {
      value: 18,
      sources: [{ srcId: 'SRC-061', locator: 's21(2)(a)' }],
    },
    citizenshipResidenceYears: {
      value: 4,
      sources: [
        { srcId: 'SRC-061', locator: 's22(1)(a)–(b)' },
        { srcId: 'SRC-068', locator: 'p5 §3.3' },
      ],
    },
    // "12 months" of absences in the 4 years, counted as 365 days.
    citizenshipAbsenceDays: {
      value: 365,
      sources: [
        { srcId: 'SRC-061', locator: 's22(1A)' },
        { srcId: 'SRC-068', locator: 'p6 scenario' },
      ],
    },
    citizenshipPermanentMonths: {
      value: 12,
      sources: [
        { srcId: 'SRC-061', locator: 's22(1)(c)' },
        { srcId: 'SRC-061', locator: 's22(1B)(c)' },
      ],
    },
    citizenshipRecentAbsenceDays: {
      value: 90,
      sources: [{ srcId: 'SRC-061', locator: 's22(1B)(b)' }],
    },
  },
} satisfies {
  asOf: string;
  values: Record<string, Parameter<number | string>>;
};
export const australiaSkilledParameters = {
  english: {
    value: {
      newTestsFrom: '2025-08-07',
      skilledYears: 3,
      functionalMonths: 12,
      passports: ['CA', 'NZ', 'IE', 'GB', 'US'],
      // Listening, reading, writing, speaking at each level, from Schedule 2.
      current: {
        ielts: [
          [6, 6, 6, 6],
          [7, 7, 7, 7],
          [8, 8, 8, 8],
        ],
        pte: [
          [47, 48, 51, 54],
          [58, 59, 69, 76],
          [69, 70, 85, 88],
        ],
        toefl: [
          [16, 16, 19, 19],
          [22, 22, 26, 24],
          [26, 27, 30, 28],
        ],
        cambridge: [
          [163, 163, 170, 179],
          [175, 179, 193, 194],
          [186, 190, 210, 208],
        ],
        celpip: [
          [7, 7, 7, 7],
          [9, 8, 10, 8],
          [10, 10, 12, 10],
        ],
        oet: [
          [290, 310, 290, 330],
          [350, 360, 380, 360],
          [390, 400, 420, 400],
        ],
        languagecert: [
          [57, 60, 64, 70],
          [67, 71, 78, 82],
          [80, 83, 89, 89],
        ],
        met: [
          [56, 55, 57, 48],
          [61, 63, 74, 59],
        ],
      },
      legacy: {
        ielts: [
          [6, 6, 6, 6],
          [7, 7, 7, 7],
          [8, 8, 8, 8],
        ],
        pte: [
          [50, 50, 50, 50],
          [65, 65, 65, 65],
          [79, 79, 79, 79],
        ],
        toefl: [
          [12, 13, 21, 18],
          [24, 24, 27, 23],
          [28, 29, 30, 26],
        ],
        cambridge: [
          [169, 169, 169, 169],
          [185, 185, 185, 185],
          [200, 200, 200, 200],
        ],
        // Legacy OET uses letter grades, unlike the numerical current test.
        oet: ['B', 'B', 'A'],
      },
      functional: {
        ielts: 4.5,
        pte: 24,
        toefl: 26,
        celpip: 5,
        oet: 1020,
        languagecert: 38,
        met: 38,
      },
      legacyFunctional: { ielts: 4.5, pte: 30, toefl: 32, cambridge: 147 },
      primaryPlusSecondaryYears: 3,
      secondaryYears: 5,
      australianTertiaryYears: 1,
      tertiaryAwardYears: 2,
    },
    sources: [
      { srcId: 'SRC-200', locator: 'vol 1 regs 1.15C, 1.15D, 1.15EA, 5.17' },
      { srcId: 'SRC-205', locator: 'ss 6–8, Sch 1' },
      { srcId: 'SRC-206', locator: 'ss 7–11, Schs 2–3' },
    ],
  },
  employer: {
    value: {
      maxAge: 45,
      positionYears: 2,
      nominationMonths: 6,
      experienceYears: 3,
      assessmentYears: 3,
      transitionalAge: 50,
      lastLegacyApplication: '2024-06-30',
      marketSalaryExemption: 250000,
      salaryThresholds: [
        { from: '2024-12-07', to: '2025-06-30', salary: 73150 },
        { from: '2025-07-01', to: '2026-06-30', salary: 76515 },
        { from: '2026-07-01', to: '2027-06-30', salary: 79423 },
      ],
    },
    sources: [
      {
        srcId: 'SRC-200',
        locator: 'vol 1 reg 5.19(5), (9); vol 2 cls 186.221–223, 186.231–234',
      },
      {
        srcId: 'SRC-203',
        locator: 'ss 5–6, definitions of legacy and transitional workers',
      },
      { srcId: 'SRC-210', locator: 's 5, annual earnings' },
      {
        srcId: 'SRC-214',
        locator: 'Core Skills Income Threshold, ENS nominations by date lodged',
      },
    ],
  },
  points: {
    value: {
      pass: 65,
      maxAge: 45,
      assessmentYears: 3,
      ageBands: [
        [18, 25],
        [25, 30],
        [33, 25],
        [40, 15],
        [45, 0],
      ],
      overseasMonths: [
        [36, 5],
        [60, 10],
        [96, 15],
      ],
      australianMonths: [
        [12, 5],
        [36, 10],
        [60, 15],
        [96, 20],
      ],
      workYearsWindow: 10,
      workCap: 20,
      english: { competent: 0, proficient: 10, superior: 20, below: 0 },
      professionalYearMonths: 12,
      professionalWindowMonths: 48,
      professional: 5,
      education: {
        none: 0,
        diplomaTradeOrAssessed: 10,
        bachelor: 15,
        doctorate: 20,
      },
      specialist: 10,
      specialistStudyYears: 2,
      study: 5,
      studyYears: 2,
      studyMonths: 16,
      communityLanguage: 5,
      regionalStudy: 5,
      partner: { none: 0, competent: 5, skilled: 10, singleOrAustralian: 10 },
      nomination: 5,
    },
    sources: [
      {
        srcId: 'SRC-200',
        locator:
          'vol 1 regs 1.15F, 2.26AC, Sch 1 items 1137(4B), 1138(4); vol 2 cls 189.222–224, 190.212–214; vol 3 Sch 6D Parts 1–12',
      },
      { srcId: 'SRC-201', locator: 's 6, pool and pass marks' },
    ],
  },
  innovation: {
    value: { adultAge: 18, exceptionalBenefitAge: 55 },
    sources: [
      {
        srcId: 'SRC-200',
        locator:
          'vol 3 cl 858.212(2)(f); vol 1 Sch 1 items 1113(2), 1137(4), 1139(2)',
      },
    ],
  },
};

export const auFamilyParameters = {
  deFactoMonths: {
    value: 12,
    sources: [{ srcId: 'SRC-200', locator: 'reg 2.03A(3)' }],
  },
  longRelationshipYears: {
    value: 3,
    sources: [
      {
        srcId: 'SRC-200',
        locator: 'reg 1.03 long-term partner relationship (b)',
      },
    ],
  },
  longRelationshipChildYears: {
    value: 2,
    sources: [
      {
        srcId: 'SRC-200',
        locator: 'reg 1.03 long-term partner relationship (a)',
      },
    ],
  },
  partnerAdultAge: {
    value: 18,
    sources: [
      {
        srcId: 'SRC-200',
        locator: 'regs 2.03A(2), 1.20KB(1); 309.213; 820.211(2)',
      },
    ],
  },
  maximumOtherSponsorships: {
    value: 1,
    sources: [{ srcId: 'SRC-200', locator: 'reg 1.20J(1)(a)' }],
  },
  sponsorshipIntervalYears: {
    value: 5,
    sources: [
      {
        srcId: 'SRC-200',
        locator: 'regs 1.20J(1)(b)–(c), 1.20KA(2); 309.212(2); 820.211(2B)',
      },
    ],
  },
  significantSentenceMonths: {
    value: 12,
    sources: [
      { srcId: 'SRC-200', locator: 'reg 1.20KD' },
      { srcId: 'SRC-061', locator: 's 3 serious prison sentence' },
    ],
  },
  returnAbsenceYears: {
    value: 5,
    sources: [{ srcId: 'SRC-200', locator: '155.212(3), (3A)' }],
  },
  shortReturnMinDays: {
    value: 1,
    sources: [{ srcId: 'SRC-200', locator: '157.212(2)(a)' }],
  },
  shortReturnMonths: {
    value: 3,
    sources: [{ srcId: 'SRC-200', locator: '157.213, 157.511' }],
  },
  seniorTestAge: {
    value: 60,
    sources: [{ srcId: 'SRC-061', locator: 's 21(4)(a)(i)' }],
  },
  pledgeAge: {
    value: 16,
    sources: [{ srcId: 'SRC-061', locator: 's 26(1)(a)' }],
  },
  citizenshipTest: {
    value: { total: 20, pass: 15, values: 5, minutes: 45 },
    sources: [{ srcId: 'SRC-215', locator: 'About the test; Pass the test' }],
  },
  sentenceBarYears: {
    value: 2,
    sources: [{ srcId: 'SRC-061', locator: 's 24(6)(c)' }],
  },
  repeatBarYears: {
    value: 10,
    sources: [{ srcId: 'SRC-061', locator: 's 24(6)(d)' }],
  },
  formerCitizenBarMonths: {
    value: 12,
    sources: [{ srcId: 'SRC-061', locator: 's 24(7)' }],
  },
  pledgeMonths: {
    value: 12,
    sources: [{ srcId: 'SRC-061', locator: 's 25(3)' }],
  },
  scvFrom: {
    value: '2023-07-01',
    sources: [
      { srcId: 'SRC-216', locator: 'Direct pathway to Australian citizenship' },
    ],
  },
};

export const auPublicCriteria = {
  adult: {
    value: 18,
    sources: [
      {
        srcId: 'SRC-200',
        locator:
          'Sch 2 cls 186.213(2), 189.211(2), 190.216(2), 858.221(b); Sch 1 additional applicant charges',
      },
    ],
  },
  regionalValuesAge: {
    value: 16,
    sources: [{ srcId: 'SRC-200', locator: 'Sch 2 cl 191.211(2), (7)' }],
  },
  substantialSentenceMonths: {
    value: 12,
    sources: [{ srcId: 'SRC-211', locator: 's 501(7)(c)–(d), (7A)' }],
  },
  policeGuidance: {
    value: { overAge: 17, months: 12, years: 10 },
    sources: [{ srcId: 'SRC-220', locator: 'Police certificates, para 1' }],
  },
  healthCost: {
    value: 86000,
    sources: [{ srcId: 'SRC-218', locator: 'Significant cost threshold' }],
  },
  documentRefusalYears: {
    value: 3,
    sources: [{ srcId: 'SRC-200', locator: 'Sch 4 PIC 4020(2)' }],
  },
  identityRefusalYears: {
    value: 10,
    sources: [{ srcId: 'SRC-200', locator: 'Sch 4 PIC 4020(2B)' }],
  },
  removalMonths: {
    value: 12,
    sources: [{ srcId: 'SRC-200', locator: 'Sch 5 cl 5002(a)' }],
  },
  sponsoredStudy: {
    value: { shortCourseMonths: 12, yearsOutside: 2 },
    sources: [{ srcId: 'SRC-200', locator: 'Sch 5 cl 5010(3)–(5)' }],
  },
};

function australianVisaTariff(
  locator: string,
  standard: readonly [number, number, number],
  pacific: readonly [number, number, number],
  second: number,
) {
  return {
    value: { standard, pacific, second },
    sources: [{ srcId: 'SRC-200', locator }],
  };
}

// First instalments are ordered primary / additional adult / additional minor.
// The second instalment is per chargeable adult, subject to each item's exemptions.
export const auCharges = {
  effectiveFrom: {
    value: '2026-07-01',
    sources: [
      {
        srcId: 'SRC-066',
        locator:
          'Cost concession for eligible Pacific Island and Timor-Leste Resident Return visa applicants',
      },
      {
        srcId: 'SRC-217',
        locator: 'p 1, annual fee indexation; form design date 07/26',
      },
      { srcId: 'SRC-200', locator: 'Sch 1, visa application charges' },
    ],
  },
  employer: australianVisaTariff(
    'Sch 1 item 1114B(2)',
    [6140, 3070, 1535],
    [5035, 2515, 1260],
    4890,
  ),
  independent: australianVisaTariff(
    'Sch 1 item 1137(3)–(4), (4J)–(4K)',
    [6135, 3070, 1540],
    [5030, 2515, 1260],
    4885,
  ),
  nominated: australianVisaTariff(
    'Sch 1 item 1138(2)',
    [6140, 3070, 1535],
    [5035, 2515, 1260],
    4885,
  ),
  regional: australianVisaTariff(
    'Sch 1 item 1139(2)(a)(i)–(ii), (b)',
    [630, 315, 160],
    [515, 260, 135],
    0,
  ),
  regionalHk: australianVisaTariff(
    'Sch 1 item 1139(2)(a)(iii)–(iv), (b)',
    [6135, 3065, 1535],
    [5030, 2515, 1260],
    4885,
  ),
  partner: australianVisaTariff(
    'Sch 1 items 1124B(2), 1129(2), 1214C(2), 1220A(2)',
    [11710, 5860, 2935],
    [9600, 4805, 2405],
    0,
  ),
  currentProspectiveMarriage: australianVisaTariff(
    'Sch 1 item 1124B(2)(a)(viii)–(xi)',
    [1955, 980, 485],
    [1600, 805, 400],
    0,
  ),
  formerProspectiveMarriage: australianVisaTariff(
    'Sch 1 item 1124B(2)(a)(xii)–(xv)',
    [2475, 1235, 625],
    [2030, 1015, 510],
    0,
  ),
  innovation: australianVisaTariff(
    'Sch 1 item 1113(2)',
    [6235, 3120, 1560],
    [5110, 2560, 1280],
    4890,
  ),
  returnVisa: {
    value: { standard: 1475, pacific: 505, nonInternet: 80 },
    sources: [
      { srcId: 'SRC-200', locator: 'Sch 1 item 1128(2); reg 2.12C(7)–(9)' },
    ],
  },
  nomination: {
    value: 540,
    sources: [{ srcId: 'SRC-200', locator: 'reg 5.37(2)–(3)' }],
  },
  trainingLevy: {
    value: { turnover: 10000000, small: 3000, other: 5000 },
    sources: [{ srcId: 'SRC-204', locator: 's 6(2)' }],
  },
  citizenship: {
    value: {
      general: 595,
      generalConcession: 85,
      other: 365,
      otherConcession: 40,
      childWithParentAge: 16,
      defenceDays: 90,
      priorApplicationFrom: '2007-10-01',
      seniorAge: 60,
    },
    sources: [
      { srcId: 'SRC-209', locator: 'Sch 3 items 5–18' },
      { srcId: 'SRC-061', locator: 's 21(4)(a)(i)' },
      { srcId: 'SRC-217', locator: 'p 1, Forms 1300t and 1290' },
    ],
  },
};

export const auRegionalParameters = {
  relevantAssessments: {
    value: 3,
    sources: [
      { srcId: 'SRC-200', locator: '191.111, 191.222(1)–(4)' },
      { srcId: 'SRC-063', locator: 'Satisfy the income requirement' },
    ],
  },
  incomeYearEnd: {
    value: '06-30',
    sources: [
      {
        srcId: 'SRC-200',
        locator: '191.111 (income year, relevant income year)',
      },
    ],
  },
  changeNoticeDays: {
    value: 14,
    sources: [{ srcId: 'SRC-200', locator: 'Sch 8 condition 8578' }],
  },
  evidenceRequestDays: {
    value: 28,
    sources: [{ srcId: 'SRC-200', locator: 'Sch 8 condition 8580' }],
  },
  lockYears: {
    value: 3,
    sources: [
      {
        srcId: 'SRC-200',
        locator:
          '186.232A, 189.224A, 190.215A, 858.213; Sch 1 item 1214C(3)(h)',
      },
    ],
  },
  regionalApplicationsFrom: {
    value: '2022-11-16',
    sources: [{ srcId: 'SRC-200', locator: 'Sch 1 item 1139(3)(ba)' }],
  },
};

export const australiaFull2026_11 = {
  ruleSetId: 'au.current-law-2026-11',
  asOf: '2026-11-23',
  values: {
    ...australia2026_11.values,
    ...auRegionalParameters,
    ...auFamilyParameters,
    ...auPublicCriteria,
    ...auCharges,
    skilledEmployer: australiaSkilledParameters.employer,
    skilledInnovation: australiaSkilledParameters.innovation,
    skilledPoints: australiaSkilledParameters.points,
    skilledEnglish: australiaSkilledParameters.english,
  },
} as const;
