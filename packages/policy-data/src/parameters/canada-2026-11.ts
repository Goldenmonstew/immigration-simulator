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

// Full assessment uses its own policy date; the time-only entry retains its original version.
export const canadaFull2026_11 = {
  ruleSetId: 'ca.current-law-2026-11' as const,
  asOf: '2026-11-23',
  values: {
    ...canada2026_11.values,
    federalCriminality: {
      value: {
        seriousMaximumYears: 10,
        seriousSentenceMonthsExclusive: 6,
        rehabilitationYears: 5,
        misrepresentationYears: 5,
      },
      sources: [
        {
          srcId: 'SRC-261',
          locator: 'IRPA ss.36(1)–(3), 40(2); IRPR ss.17–19',
        },
      ],
    },
    federalMedical: {
      value: {
        referenceYear: 2026,
        fiveYearCost: 144390,
        annualCost: 28878,
        instructionDays: 30,
        validMonths: 12,
        reuseYears: 5,
        reuseFrom: '2022-10-05',
        reuseUntil: '2029-10-05',
      },
      sources: [
        {
          srcId: 'SRC-266',
          locator:
            'Medical inadmissibility, Excessive demand cost threshold; Medical exams for permanent residents, When to get your medical exam / How long your medical results are good for; Temporary public policy on IMEs, Effective date',
        },
      ],
    },
    federalPolice: {
      value: {
        minAge: 18,
        lookbackYearsEE: 10,
        stayMonths: 6,
        currentCertificateMonths: 6,
        atlanticUsualCertificateYears: 1,
        dubaiCertificateMonths: 3,
        biometricsMinAge: 14,
        biometricsMaxAge: 79,
      },
      sources: [
        {
          srcId: 'SRC-277',
          locator:
            'Police certificates for Express Entry: Who needs police certificates, If you need a request letter, When the certificate must be issued (current country / any other country)',
        },
        {
          srcId: 'SRC-266',
          locator:
            'Biometrics: Who needs to give their biometrics, Exemptions; When to get a police certificate, How long your police certificate is valid / If you need a request letter; IMM 0199 and IMM 5690, p.3 item 11',
        },
        {
          srcId: 'SRC-266',
          locator:
            'Hong Kong SAR, Police certificates and IRCC requirements, bullets 1–3 (266j); Dubai Police, Police Clearance Certificate, service description, last sentence (266k)',
        },
        { srcId: 'SRC-274', locator: 'Guide 5289, Police certificates' },
        {
          srcId: 'SRC-279',
          locator:
            'IMM 0155, p.4 item 19; AIP Apply for permanent residence, Police certificates and clearances, paragraphs 1–2 (279e)',
        },
      ],
    },
    federalFees: {
      value: {
        from: '2026-04-30',
        nextAdjustment: '2028-04-30',
        economicAdult: 990,
        economicChild: 270,
        right: 600,
        sponsorship: 90,
        familyPartner: 570,
        familyAccompanyingPartner: 660,
        familyPrincipalChild: 90,
        familyAccompanyingChild: 180,
        biometric: 85,
        biometricFamilyCap: 170,
      },
      sources: [
        {
          srcId: 'SRC-264',
          locator:
            'Fee list: Economic immigration, Family reunification, Right of permanent residence fee, Biometrics; Fee changes: April 30, 2026',
        },
        {
          srcId: 'SRC-261',
          locator: 'IRPR ss.294(d), 295, 301, 303–304, 315.1',
        },
      ],
    },

    firstPrCardDays: {
      value: 180,
      sources: [{ srcId: 'SRC-261', locator: 'IRPR s.58(1)\u2013(2)' }],
    },
    prDocumentFee: {
      value: 50,
      sources: [{ srcId: 'SRC-261', locator: 'IRPR ss.308, 315' }],
    },
    prtdAppealPresenceDays: {
      value: 365,
      sources: [{ srcId: 'SRC-261', locator: 'IRPA s.31(3)(c)' }],
    },
    citTaxYears: {
      value: 3,
      sources: [
        { srcId: 'SRC-074', locator: 'Citizenship Act s.5(1)(c)(iii)' },
      ],
    },
    citListeningSpeakingLevel: {
      value: 4,
      sources: [
        {
          srcId: 'SRC-263',
          locator: 'Citizenship language evidence: CLB/NCLC level',
        },
      ],
    },
    citTestFormat: {
      value: { questions: 20, minutes: 45, correct: 15, attempts: 3 },
      sources: [
        {
          srcId: 'SRC-263',
          locator:
            'Citizenship test: Test format and passing score; If you do not pass',
        },
      ],
    },
    citSignatureOathAge: {
      value: 14,
      sources: [
        {
          srcId: 'SRC-260',
          locator:
            'Citizenship Act ss.5(1.04), 3(1)(c); Citizenship Regulations (No. 2) s.4',
        },
      ],
    },
    citAdultProcessingFee: {
      value: 530,
      sources: [
        {
          srcId: 'SRC-264',
          locator: 'Fee list: Citizenship \u2013 application fees',
        },
      ],
    },
    citRightFee: {
      value: 123,
      sources: [
        {
          srcId: 'SRC-264',
          locator: 'Fee list: Right of citizenship fee from March 31, 2026',
        },
      ],
    },
    citRightFeeFrom: {
      value: '2026-03-31',
      sources: [
        {
          srcId: 'SRC-264',
          locator: '2026 Right of citizenship fee adjustment',
        },
      ],
    },
    citMinorApplicationFee: {
      value: 100,
      sources: [
        { srcId: 'SRC-264', locator: 'Fee list: Minor citizenship grant' },
      ],
    },
    citConvictionYears: {
      value: 4,
      sources: [
        { srcId: 'SRC-260', locator: 'Citizenship Act s.22(2)\u2013(3)' },
      ],
    },
    citMisrepresentationYears: {
      value: 5,
      sources: [{ srcId: 'SRC-260', locator: 'Citizenship Act s.22(1)(e.2)' }],
    },
    citRevocationYears: {
      value: 10,
      sources: [{ srcId: 'SRC-260', locator: 'Citizenship Act s.22(1)(f)' }],
    },
    citPoliceLookbackYears: {
      value: 4,
      sources: [{ srcId: 'SRC-262', locator: 'Guide CIT 0002 Q16' }],
    },
    citPoliceSingleStayDays: {
      value: 183,
      sources: [{ srcId: 'SRC-262', locator: 'Guide CIT 0002 Q16' }],
    },
    citCafYears: {
      value: 3,
      sources: [
        { srcId: 'SRC-260', locator: 'Citizenship Act s.5(1.2)\u2013(1.3)' },
      ],
    },
    citCafWindowYears: {
      value: 6,
      sources: [
        { srcId: 'SRC-260', locator: 'Citizenship Act s.5(1.2)\u2013(1.3)' },
      ],
    },
    citPrePrDailyCredit: {
      value: 0.5,
      sources: [{ srcId: 'SRC-074', locator: 'Citizenship Act s.5(1.001)(a)' }],
    },
    familyConvictionYears: {
      value: 5,
      sources: [{ srcId: 'SRC-261', locator: 'IRPR s.133(2)(b), (3)(b)' }],
    },
    familyPartnerBarYears: {
      value: 5,
      sources: [{ srcId: 'SRC-261', locator: 'IRPR s.130(3)' }],
    },
    familyAdultAge: {
      value: 18,
      sources: [
        {
          srcId: 'SRC-274',
          locator: 'Who can sponsor; who you can sponsor: spouse and partners',
        },
      ],
    },
    familyPartnerMonths: {
      value: 12,
      sources: [
        {
          srcId: 'SRC-274',
          locator:
            'Who you can sponsor: common-law and conjugal partners; IRPR s.1',
        },
      ],
    },
    familyChildAge: {
      value: 22,
      sources: [{ srcId: 'SRC-261', locator: 'IRPR s.2: dependent child' }],
    },
    childConsentAgeLimit: {
      value: 18,
      sources: [
        {
          srcId: 'SRC-274',
          locator: 'IMM 5533, p.6 item 3, For Minor Child(ren) (274g)',
        },
        {
          srcId: 'SRC-266',
          locator:
            "IMM 0199 and IMM 5690, p.3 item 10, Children's Information (266h/i)",
        },
        {
          srcId: 'SRC-279',
          locator: "IMM 0155, p.4 item 18, Children's Information (279b)",
        },
      ],
    },
    familyUndertaking: {
      value: { partnerYears: 3, childYears: 10, childEndAge: 25 },
      sources: [{ srcId: 'SRC-261', locator: 'IRPR s.132(1)(b)' }],
    },
    familyQcUndertaking: {
      value: {
        youngAge: 16,
        youngYears: 10,
        youngEndAge: 18,
        olderYears: 3,
        olderEndAge: 25,
        integrationMin: 18,
        integrationMax: 55,
      },
      sources: [
        {
          srcId: 'SRC-275',
          locator:
            'Term of undertaking; form A-0546-GF: Dur\u00e9e de l\u2019engagement; Welcome and integration plan',
        },
      ],
    },
    familyIncomeTable: {
      value: [30526, 38002, 46720, 56724, 64336, 72560, 80784],
      sources: [
        { srcId: 'SRC-274', locator: 'IMM 1283: Federal Income Table, 2025' },
      ],
    },
    familyIncomeExtra: {
      value: 8224,
      sources: [{ srcId: 'SRC-274', locator: 'IMM 1283: More than 7 persons' }],
    },
    familyQuebecIncome: {
      value: {
        own: [29642, 40015, 49401, 56819, 63237],
        ownExtra: 6418,
        groups: [
          [0, 10261, 16262],
          [21682, 29131, 32895],
          [31796, 35617, 38450],
        ],
        extraChild: [5422, 3760, 2823],
        extraAdult: 10107,
        fromDate: '2026-01-01',
        toDate: '2026-12-31',
      },
      sources: [
        {
          srcId: 'SRC-275',
          locator:
            'Calculating the amounts you need: Tables A and B, January 1 to December 31, 2026',
        },
      ],
    },
    familyQcFees: {
      value: { principal: 335, additional: 135 },
      sources: [
        {
          srcId: 'SRC-275',
          locator: 'Spouse / dependent child: Paying the fees, January 1, 2026',
        },
      ],
    },
    familyQcIntakeCap: {
      value: 13300,
      sources: [
        {
          srcId: 'SRC-275',
          locator:
            'Application intake schedule: Reception period and number of applications',
        },
      ],
    },
    familyQcIntakeThrough: {
      value: '2028-06-30',
      sources: [
        {
          srcId: 'SRC-275',
          locator:
            'Application intake schedule: Reception period and number of applications',
        },
      ],
    },
    familyQcIntakeSchedule: {
      value: [
        { opens: '2026-07-02', lettersThrough: '2024-07-31' },
        { opens: '2026-09-01', lettersThrough: '2025-01-31' },
        { opens: '2026-11-01', lettersThrough: '2025-06-30' },
        { opens: '2027-01-01', lettersThrough: '2025-08-31' },
        { opens: '2027-03-01', lettersThrough: '2025-10-31' },
        { opens: '2027-05-01', lettersThrough: '2025-11-30' },
        { opens: '2027-07-01', lettersThrough: '2025-12-31' },
        { opens: '2027-09-01', lettersThrough: '2026-02-28' },
        { opens: '2027-11-01', lettersThrough: '2026-05-31' },
        { opens: '2028-01-01', lettersThrough: '2026-08-31' },
        { opens: '2028-03-01', lettersThrough: '2026-12-31' },
        { opens: '2028-05-01', lettersThrough: '2027-05-27' },
      ],
      sources: [
        {
          srcId: 'SRC-275',
          locator:
            'Application Intake Schedule, table: eligibility letter or qualifying inland AOR',
        },
      ],
    },

    economicOccupations: {
      value: {
        doctors: ['31100', '31101', '31102'],
        lecturer: '41200',
        architect: '21200',
        pharmacist: '31120',
        nursingOffers: ['33102', '44101'],
        nursingLaw: ['31301', '32101'],
        nursingGuide: ['31301', '31201'],
        tradeGroups: ['72', '73', '82', '83', '92', '93', '6320', '62200'],
        excludedTradeGroups: ['726', '932'],
      },
      sources: [
        { srcId: 'SRC-261', locator: 'IRPR §§87.2(1), 87.3(6)(d)' },
        {
          srcId: 'SRC-267',
          locator: 'ee-fst / Skilled trades work experience',
        },
        { srcId: 'SRC-269', locator: 'ee-amendment-2 / NOC 41200' },
        {
          srcId: 'SRC-270',
          locator:
            'aip-job / Exemptions for health care workers; aip-education / Jobs that need a special ECA',
        },
        { srcId: 'SRC-279', locator: 'ee-doctors / Part 2' },
      ],
    },
    eeCategorySelection: {
      value: {
        currentListFrom: '2026-11-17',
        lookbackYears: 3,
        skilledMonths: 12,
        militaryServiceYears: 10,
        militaryOfferYears: 3,
        militaryEducationYears: 2,
        occupations: {
          healthcare: [
            '31100',
            '31101',
            '31102',
            '31103',
            '31110',
            '31111',
            '31112',
            '31120',
            '31121',
            '31200',
            '31201',
            '31202',
            '31203',
            '31209',
            '31300',
            '31301',
            '31302',
            '31303',
            '32101',
            '32102',
            '32103',
            '32104',
            '32109',
            '32111',
            '32120',
            '32121',
            '32122',
            '32123',
            '32124',
            '32129',
            '32201',
            '33101',
            '33102',
            '33103',
            '41300',
            '41301',
            '42201',
          ],
          stem: [
            '20011',
            '21220',
            '21300',
            '21301',
            '21310',
            '21321',
            '21331',
            '22300',
            '22301',
            '22310',
            '63100',
          ],
          trades: [
            '22303',
            '70010',
            '70011',
            '72100',
            '72102',
            '72106',
            '72200',
            '72201',
            '72300',
            '72302',
            '72310',
            '72311',
            '72320',
            '72400',
            '72401',
            '72402',
            '72422',
            '72501',
            '72999',
            '73100',
            '73110',
            '73112',
            '73113',
            '82021',
            '63201',
          ],
          education: ['41220', '41221', '42202', '42203', '43100'],
          transport: ['72404', '72600', '22313', '72410'],
          physicians: ['31100', '31101', '31102'],
          seniorManagers: ['00012', '00013', '00014', '00015'],
          military: ['40042', '42102', '43204'],
          researchers: ['41200'],
        },
      },
      sources: [
        {
          srcId: 'SRC-276',
          locator:
            'category-rounds / Who is eligible for each category, individual NOC tables and Skilled military recruits',
        },
        {
          srcId: 'SRC-269',
          locator:
            'ee-amendment-2, November 17, 2026 / researchers with Canadian work experience',
        },
      ],
    },
    eeProcedure: {
      value: {
        profileYears: 1,
        invitationDays: 60,
        testYears: 2,
        ecaYears: 5,
        frenchCategoryLevel: 7,
      },
      sources: [
        { srcId: 'SRC-269', locator: 'ee-mi §§4–7' },
        { srcId: 'SRC-277', locator: 'ee-apply, invitation to apply' },
        { srcId: 'SRC-268', locator: 'ee-language / ee-eca, validity' },
        {
          srcId: 'SRC-276',
          locator: 'category-rounds, French-language proficiency',
        },
      ],
    },
    eeWork: {
      value: {
        weeklyHours: 30,
        annualHours: 1560,
        yearMonths: 12,
        fswWindow: 10,
        cecWindow: 3,
        fstWindow: 5,
        fstYears: 2,
        skilledTeerMax: 3,
        higherTeerMax: 1,
      },
      sources: [
        { srcId: 'SRC-261', locator: 'IRPR §§73, 75, 87.1–87.2' },
        {
          srcId: 'SRC-267',
          locator: 'ee-fsw, ee-cec, ee-fst / Work experience',
        },
      ],
    },
    eeLanguage: {
      value: { fsw: 7, cecHigher: 7, cecOther: 5, fstOral: 5, fstWritten: 4 },
      sources: [
        { srcId: 'SRC-268', locator: 'ee-language, Minimum language levels' },
      ],
    },
    fswSelection: {
      value: {
        pass: 67,
        minAge: 18,
        fullAgeThrough: 35,
        agePoints: 12,
        education: {
          none: 0,
          secondary: 5,
          oneYear: 15,
          twoYears: 19,
          threeYears: 21,
          multiple: 22,
          mastersOrProfessional: 23,
          doctorate: 25,
        },
        firstLanguage: { minimum: 7, initialPoints: 4, maxPoints: 6 },
        secondLanguage: { minimum: 5, points: 4 },
        work: [0, 9, 11, 11, 13, 13, 15],
        arranged: 10,
        adaptability: {
          cap: 10,
          applicantWork: 10,
          otherFactor: 5,
          spouseLanguage: 4,
        },
      },
      sources: [
        { srcId: 'SRC-261', locator: 'IRPR §§76–83' },
        { srcId: 'SRC-267', locator: 'ee-fsw, Selection factors' },
      ],
    },
    eeOffers: {
      value: {
        fswEmployers: 1,
        fstEmployers: 2,
        monthsAfterPr: 12,
        lmiaPolicyFrom: '2026-11-03',
        lecturerStipendFrom: '2026-11-17',
        physicianPolicyFrom: '2023-04-25',
      },
      sources: [
        { srcId: 'SRC-261', locator: 'IRPR §§82, 87.2(3)(d)' },
        {
          srcId: 'SRC-269',
          locator: 'ee-lmia-policy Parts 1–2; ee-amendment-2; ee-changes',
        },
        { srcId: 'SRC-279', locator: 'ee-doctors Parts 1–2' },
      ],
    },
    eeFunds: {
      value: {
        amounts: [15263, 19001, 23360, 28362, 32168, 36280, 40392],
        additional: 4112,
        published: '2025-07-07',
      },
      sources: [
        {
          srcId: 'SRC-268',
          locator: 'ee-funds, How much money you need, July 7 2025 table',
        },
      ],
    },
    atlanticWork: {
      value: {
        window: 5,
        maxTeer: 4,
        graduateYears: 2,
        residenceMonths: 16,
        excludedStudyPercent: 50,
        maxOwnershipPercent: 50,
        graduateMaxDistancePercent: 50,
        higherLanguage: 5,
        otherLanguage: 4,
        minPostsecondaryYears: 1,
      },
      sources: [
        { srcId: 'SRC-261', locator: 'IRPR §87.3(3)–(9)' },
        {
          srcId: 'SRC-270',
          locator:
            'aip-work, Ineligible studies; aip-job; aip-education; aip-language',
        },
      ],
    },
    atlanticFunds: {
      value: {
        amounts: [3815, 4750, 5840, 7090, 8042, 9070, 10098],
        additional: 1028,
        published: '2025-07-29',
      },
      sources: [
        {
          srcId: 'SRC-270',
          locator: 'aip-funds, How much money you need, July 29 2025 table',
        },
      ],
    },

    pnpInvestment: {
      value: { minEquityShare: 1 / 3, minEquityInvestment: 1_000_000 },
      sources: [
        {
          srcId: 'SRC-261',
          locator: 'IRPR s87(5)–(6): active investment exception',
        },
      ],
    },
    ontarioWorkforce: {
      value: {
        driverNocs: ['73300', '73301'],
        engineeringOfferPrefix: '223',
        engineeringWorkPrefix: '213',
        pharmacyAssistantNoc: '33103',
        pharmacistNoc: '31120',
        nurseAideNoc: '33102',
        acceptedNursingNocs: ['31301', '32101'],
        tradePrefixes: ['72', '73', '82', '83', '93', '6320', '62200'],
        excludedTradePrefixes: ['726', '932'],

        eoiOpens: '2026-08-04',
        employerDays: 14,
        applicantDays: 17,
        businessYears: 3,
        gtaRevenue: 1_000_000,
        designatedRevenue: 500_000,
        otherRevenue: 250_000,
        gtaEmployees: 5,
        outsideEmployees: 3,
        hoursPerWeek: 30,
        hoursPerYear: 1560,
        equityPercentExclusive: 10,
        highTeerMax: 3,
        teerMax: 5,
        graduateWindowYears: 3,
        graduateStudyYears: 2,
        sameJobMonths: 6,
        graduateJobMonths: 3,
        relatedJobMonths: 24,
        lowerTeerMonths: 9,
        highLanguage: 6,
        tradeLanguage: 5,
        lowerLanguage: 4,
        languageYears: 2,
        ecaYears: 5,
        postsecondaryYears: 1,
        gtaFee: 2000,
        outsideFee: 1500,
      },
      sources: [
        {
          srcId: 'SRC-272',
          locator:
            'O. Reg. 422/17 ss1, 4–7, 15–16; Workforce Priority: Steps to apply; 2026 program updates, August 4; OINP application process: Cost to apply',
        },
        {
          srcId: 'SRC-279',
          locator: 'OINP employer guide: requirements and deadlines',
        },
      ],
    },
    quebecSelection: {
      value: {
        minimumAge: 18,
        responseDays: 30,
        filingDays: 60,
        recognitionWindowYears: 1,
        valuesDays: 60,
        valuesYears: 2,
        valuesQuestions: 20,
        valuesPassPercent: 75,
        valuesHours: 3,
        retryDays: 14,
        languageYears: 2,
        highOral: 7,
        highWritten: 5,
        lowerOral: 5,
        partnerOral: 4,
        highFeerMax: 2,
        feerMax: 5,
        internshipMonths: 3,
        highWorkMonths: 12,
        lowerWorkMonths: 24,
        lowerLocalMonths: 12,
        lowerOutsideMax: 12,
        talentWorkMonths: 36,
        educationYears: 1,
        vocationalHours: 900,
        lowerSecondaryHours: 600,
        universityCredits: 30,
        equivalenceYears: 5,
      },
      sources: [
        {
          srcId: 'SRC-273',
          locator:
            'PSTQ Requirements: General requirements, Streams 1–4; Applying: Actions to be taken; Values and Online assessment; Demonstrate your knowledge of French',
        },
        {
          srcId: 'SRC-278',
          locator:
            'Québec Gazette, PSTQ arts.32.1–32.14 (PDF pp.3–5, printed pp.4959–4961), procedure amendment and exigences',
        },
      ],
    },
    quebecSelection2026: {
      value: {
        from: '2026-01-01',
        to: '2026-12-31',
        single: [3957, 5318, 6002, 6687],
        couple: [5803, 6500, 7016, 7531],
        extraMinorSingle: 685,
        extraMinorCouple: 516,
        extraAdultCouple: 1845,
        principalFee: 940,
        memberFee: 201,
      },
      sources: [
        {
          srcId: 'SRC-273',
          locator:
            'Financial self-sufficiency scale 2026 (quebec-funds.pdf), p.1; Applying: Paying the fees for examining an application',
        },
      ],
    },
  },
} satisfies {
  ruleSetId: string;
  asOf: string;
  values: Record<string, Parameter<unknown>>;
};
