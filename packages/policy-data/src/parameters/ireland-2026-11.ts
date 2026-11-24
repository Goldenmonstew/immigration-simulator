import type { Parameter } from '../types';

// Ireland pilot (phase 19, task 68): Irish Nationality and Citizenship Act
// 1956 as revised (SRC-091), with Immigration Service Delivery guidance on
// counting (SRC-095) and on Stamp 4 and Stamp 5 (SRC-096, SRC-097), which
// are policy, not statute. The 2026 General Scheme (SRC-098) is a draft.
const ISD_GUIDE =
  'https://www.irishimmigration.ie/how-to-become-an-irish-citizen-guide/';
const ISD_CALCULATOR = 'https://irishimmigration.ie/residency-calculator';
const ISD_STAMPS =
  'https://www.irishimmigration.ie/registering-your-immigration-permission/information-on-registering/immigration-permission-stamps/';
const ISD_STAMP4 =
  'https://www.irishimmigration.ie/registering-your-immigration-permission/how-to-renew-your-current-permission/information-on-stamp-4-upgrades/';
const GENERAL_SCHEME =
  'https://assets.gov.ie/static/documents/cadca21c/General_Scheme_of_the_Irish_Nationality_and_Citizenship_Amendment_Bill_2026.pdf';

export const ireland2026_11 = {
  asOf: '2026-11-22',
  values: {
    // One year's continuous residence immediately before applying (s15, and
    // in the island of Ireland for spouses, s15A).
    continuousYears: {
      value: 1,
      sources: [
        { srcId: 'SRC-091', locator: 's15(1)(c) (p19)' },
        { srcId: 'SRC-091', locator: 's15A(1)(e) (p21)' },
      ],
    },
    // Then a total residence within this many years before that year...
    priorWindowYears: {
      value: { general: 8, spouse: 4 },
      sources: [
        { srcId: 'SRC-091', locator: 's15(1)(c) (p19)' },
        { srcId: 'SRC-091', locator: 's15A(1)(f) (p21)' },
      ],
    },
    // ...of 4 years (general) or 2 years (spouse), in days; ISD adds a day
    // for each 29 February.
    priorResidenceDays: {
      value: { general: 1460, spouse: 730 },
      sources: [
        { srcId: 'SRC-091', locator: 's15(1)(c) (p19), s15A(1)(f) (p21)' },
        {
          srcId: 'SRC-095',
          locator: "Guide: What is 'Reckonable Residency'",
          url: ISD_GUIDE,
        },
        {
          srcId: 'SRC-095',
          locator: 'Calculator: 1095 or 1096 days over 5 years',
          url: ISD_CALCULATOR,
        },
      ],
    },
    // Days not present in the continuous year that still count as residence
    // (s15C(3)(a))...
    absenceDays: {
      value: 70,
      sources: [
        { srcId: 'SRC-091', locator: 's15C(1)–(3)(a) (p23)' },
        {
          srcId: 'SRC-095',
          locator: 'Guide: 70 Days Absence Rule',
          url: ISD_GUIDE,
        },
      ],
    },
    // ...plus up to this many more when the Minister accepts exceptional
    // circumstances (s15C(3)(b), (5)); over the total ISD has no discretion.
    exceptionalDays: {
      value: 30,
      sources: [
        { srcId: 'SRC-091', locator: 's15C(3)(b), (5) (p23)' },
        {
          srcId: 'SRC-095',
          locator: 'Guide: 70 Days Absence Rule',
          url: ISD_GUIDE,
        },
      ],
    },
    // Spouses and civil partners: married or in partnership this long.
    marriageYears: {
      value: 3,
      sources: [{ srcId: 'SRC-091', locator: 's15A(1)(c) (p20)' }],
    },
    // Stamp 4 upgrade: months from starting employment in the State.
    stamp4Months: {
      value: { csep: 21, gep: 57 },
      sources: [
        {
          srcId: 'SRC-096',
          locator: 'Stamp 4 upgrades: Eligibility criteria',
          url: ISD_STAMP4,
        },
      ],
    },
    // The 57-month rule for GEPs applies from this ISD notice; the earlier
    // rule is not in the register.
    gepRuleFrom: {
      value: '2024-04-03',
      sources: [
        {
          srcId: 'SRC-096',
          locator: 'Update to eligibility requirements for Stamp 4 upgrades',
          url: 'https://www.irishimmigration.ie/update-to-eligibility-requirements-for-stamp-4-upgrades/',
        },
      ],
    },
    // The upgrade page lists ICT in the 57-month group; its current text is
    // only evidenced from its last change on this date, so earlier ICT
    // dates are uncertain (PD-116).
    ictRuleFrom: {
      value: '2026-02-25',
      sources: [
        {
          srcId: 'SRC-096',
          locator:
            'Information on Stamp 4 upgrades: Eligibility criteria (v); dateModified 2026-02-25',
          url: ISD_STAMP4,
        },
      ],
    },
    // Spouses or partners of employment permit holders (CSEP, GEP, ICT) and
    // researchers on Stamp 1G.
    spouse1gYears: {
      value: 5,
      sources: [
        {
          srcId: 'SRC-096',
          locator: 'Immigration permission/stamps: Stamp 1G',
          url: ISD_STAMPS,
        },
        {
          srcId: 'SRC-096',
          locator:
            'Notice 2024-05-15: GEP and ICT spouses and partners on Stamp 1G',
          url: 'https://www.irishimmigration.ie/attention-eligible-spouses-and-partners-of-general-employment-permit-and-intra-corporate-transferee-irish-employment-permit-holders/',
        },
        {
          srcId: 'SRC-096',
          locator:
            'Joining family FAQ 30: When can I get a Stamp 4 permission?',
          url: 'https://www.irishimmigration.ie/coming-to-join-family-in-ireland/frequently-asked-questions-for-joining-family/',
        },
      ],
    },
    // Stamp 5 (without condition as to time): months of legal residence...
    wcattMonths: {
      value: 96,
      sources: [{ srcId: 'SRC-097', locator: 'Introduction; Eligibility' }],
    },
    // ...with absences of no more than this many months in a year.
    wcattAbsenceMonths: {
      value: 4,
      sources: [
        {
          srcId: 'SRC-097',
          locator:
            'FAQ: What are the conditions attached to my Stamp 5 permission',
        },
      ],
    },
    // Draft only (General Scheme, Heads 5 and 6): not used in any date.
    draftBill: {
      value: {
        continuousYears: 2,
        windowYears: 10,
        totalYears: 6,
        spouseMarriageYears: 5,
        spouseContinuousYears: 2,
        spouseWindowYears: 5,
        spouseTotalYears: 3,
      },
      sources: [
        {
          srcId: 'SRC-098',
          locator: 'General Scheme Head 5 (p7)',
          url: GENERAL_SCHEME,
        },
        {
          srcId: 'SRC-098',
          locator: 'General Scheme Head 6 (p11)',
          url: GENERAL_SCHEME,
        },
        {
          srcId: 'SRC-098',
          locator:
            'Oireachtas press release 2026-11-19 (pre-legislative scrutiny)',
          url: 'https://www.oireachtas.ie/en/press-centre/press-releases/20261119-joint-committee-on-justice-home-affairs-and-migration-to-meet-for-pre-legislative-scrutiny-of-the-general-scheme-of-the-irish-nationality-and-citizenship-amendment-bill-2026/',
        },
      ],
    },
  },
} satisfies {
  asOf: string;
  values: Record<string, Parameter<number | string | Record<string, number>>>;
};

// Task 89 uses the same time rules as ireland2026_11 where the pathways overlap.
export const irelandFull2026_11 = {
  asOf: '2026-11-23',
  naturalisation: {
    age: {
      value: {
        adult: 18,
        minorCharacter: 14,
        minorForm: 10,
        dependentStudentMax: 23,
      },
      sources: [
        { srcId: 'SRC-401', locator: 's2' },
        { srcId: 'SRC-091', locator: 's15B(1)–(3)' },
        { srcId: 'SRC-380', locator: 'S.I. 498/2023 Form 11 §5' },
        { srcId: 'SRC-095', locator: 'Proof of residence: Young adults' },
      ],
    },
    minor: {
      value: {
        from: '2023-07-31',
        formBirthFrom: '2005-01-01',
        priorYears: 2,
        windowYears: 8,
      },
      sources: [
        { srcId: 'SRC-091', locator: 'ss6–6B, 15B(1)(c), 15C, 16A' },
        { srcId: 'SRC-092', locator: 'S.I. 389/2023 art. 2' },
        { srcId: 'SRC-380', locator: 'S.I. 498/2023 Form 11' },
      ],
    },
    identity: {
      value: {
        minimum: 150,
        validPassport: 150,
        expiredRecent: 75,
        expiredOlder: 50,
        expiredBoundaryDays: 365,
        irp: 75,
        licence: 10,
        servicesCard: 25,
        ppsLetter: 25,
        euId: 50,
        protectionId: 50,
        referees: 3,
        formFrom: '2023-10-16',
      },
      sources: [
        { srcId: 'SRC-095', locator: 'Citizenship Identity Scorecard' },
        { srcId: 'SRC-381', locator: 'Proof of identity' },
        { srcId: 'SRC-380', locator: 'S.I. 498/2023 reg. 2 and Form 8 §11.1' },
      ],
    },
    proof: {
      value: {
        minimum: 150,
        strong: 100,
        supporting: 50,
        jointMonths: 3,
        jointDocuments: 3,
        replyDays: 28,
        vettingFrom: '2021-03-30',
      },
      sources: [
        {
          srcId: 'SRC-095',
          locator:
            '150-Point Rule; Statutory Declaration for Spouses or Civil Partners; Deadlines for Additional Documents',
        },
        { srcId: 'SRC-381', locator: 'Proof of residence' },
        { srcId: 'SRC-382', locator: 'What is e-Vetting?' },
      ],
    },
    fee: {
      value: {
        from: '2011-11-10',
        apply: 175,
        adult: 950,
        minorOrSurvivor: 200,
        exempt: 0,
      },
      sources: [{ srcId: 'SRC-380', locator: 'S.I. 569/2011 regs. 1(2), 13' }],
    },
    refugee: {
      value: { changedOn: '2025-12-08', previousYears: 3, currentYears: 5, continuousYears: 1 },
      sources: [
        { srcId: 'SRC-095', locator: 'Reckonable Residence for Refugees or people with international protection' },
        {
          srcId: 'SRC-381',
          locator:
            'Changes to citizenship for people granted International Protection',
        },
      ],
    },
    association: {
      value: {
        requiredCategories: 2,
        minimumShare: 0.5,
        residencePoints: 5,
        residenceMax: 25,
        taxPoints: 10,
        visitYears: 10,
        visitPoints: 3,
        visitMax: 15,
        residentFamily: 60,
        contribution: 30,
        qualification: 10,
        minNfq: 6,
        maxNfq: 10,
        insurance: 10,
        prsiBatch: 10,
        prsiPoints: 2,
        prsiMax: 20,
        pension: 20,
        licence: 5,
        bank: 5,
        maxByCategory: [50, 60, 60, 60],
      },
      sources: [
        {
          srcId: 'SRC-400',
          locator: 'December 2025 guidance Step 3 and Table 1 (p3)',
        },
      ],
    },
  },
  registration: {
    value: {
      usualMinAge: 16,
      feeMinAge: 18,
      feeFrom: '2025-09-05',
      fee: 300,
      exempt: 0,
      earlyRenewalWeeks: 12,
    },
    sources: [
      {
        srcId: 'SRC-383',
        locator: 'Immigration Act ss9, 19; S.I. 421/2025 regs. 1, 3–5',
      },
      { srcId: 'SRC-384', locator: 'Online renewal: When should I submit a Renewal Application?' },
    ],
  },
  work: {
    upgrade: {
      value: {
        employerLetterMonths: 3,
        shortGroupRenewYears: 2,
        longGroupRenewYears: 1,
      },
      sources: [
        {
          srcId: 'SRC-384',
          locator: 'Stamp 4 Registrations and Renewals (1)–(2)',
        },
      ],
    },
    permit: {
      value: {
        from: '2026-03-01',
        csep: { annual: 40904, hourly: 20.17 },
        csepGraduate: { annual: 36848, hourly: 18.17 },
        csepHigh: { annual: 68911, hourly: 33.98 },
        gep: { annual: 36605, hourly: 18.05 },
        gepLower: { annual: 32691, hourly: 16.12 },
        gepGraduate: { annual: 34009, hourly: 16.77 },
        ict: { annual: 49523, hourly: 24.42 },
        ictTrainee: { annual: 36605, hourly: 18.05 },
        graduateLevel: 8,
        graduateMonths: 12,
        csepOfferYears: 2,
        eeaShare: 0.5,
        ictPriorMonths: 6,
        ictTraineePriorMonths: 1,
        ictMinimumHours: 20,
        ictTraineeMaxMonths: 12,
        standardHours: 39,
        weeks: 52,
      },
      sources: [
        {
          srcId: 'SRC-393',
          locator:
            'Act ss2–4, 21–24, 47–48; S.I. 444/2024 regs. 25–27, 42–46; S.I. 643/2025 regs. 2, 5–9, 21 and Schedule 8 (pp9–11)',
        },
        {
          srcId: 'SRC-394',
          locator:
            'Eligibility criteria; Remuneration criteria; Labour Market Needs Test',
        },
      ],
    },
    fees: {
      value: {
        from: '2024-09-02',
        shortMonths: 6,
        middleMonths: 24,
        longMonths: 36,
        csep: 1000,
        newShort: 500,
        newMiddle: 1000,
        gepRenewShort: 750,
        gepRenewLong: 1500,
        ictRenewShort: 500,
        ictRenewMiddle: 1000,
        ictRenewLong: 1500,
      },
      sources: [
        {
          srcId: 'SRC-393',
          locator:
            'Act ss36(2)(a), 55; S.I. 444/2024 regs. 1, 7 and Schedule 1',
        },
      ],
    },
  },
  family: {
    versions: {
      value: { revisedFrom: '2025-11-26', currentFrom: '2026-06-12' },
      sources: [{ srcId: 'SRC-385', locator: 'Policy Document Archive' }],
    },
    relationship: {
      value: {
        adult: 18,
        deFactoYears: 2,
        changeSponsorYears: 5,
        specializedChangeYears: 7,
        independentResidenceYears: 5,
        naturalisedSponsorDependentYears: 3,
        endRelationshipYears: 3,
        coResidenceYears: 2,
        notifyWorkingDays: 21,
        categoryCWaitMonths: 12,
        protectionWaitYears: 2,
        deFactoGrantYears: 1,
      },
      sources: [
        {
          srcId: 'SRC-387',
          locator: 'June 2026 §§5–7, 16–17, footnote 41 and Appendix C',
        },
        {
          srcId: 'SRC-388',
          locator: 'Am I eligible?; Who can sponsor me?; What happens next?',
        },
      ],
    },
    income: {
      value: {
        categoryA: 75000,
        previousCategoryA: 40000,
        specializedCategoryA: 40000,
        categoryC: 30000,
        taxYearsA: 3,
        relianceYears: 2,
        childrenTableYear: '2026',
        categoryCWithChildren: [
          39780, 45032, 50284, 55016, 61568, 67600, 74672, 79664,
        ],
      },
      sources: [
        {
          srcId: 'SRC-387',
          locator:
            'June 2026 §§9–10 and Appendix D; November 2025 §10; 2016 §17',
        },
        { srcId: 'SRC-386', locator: 'Financial Thresholds and Table 1' },
        {
          srcId: 'SRC-388',
          locator: 'Irish spouse scheme: Am I eligible? — Where you do not have permission to be in Ireland; Overseas de facto: Who can sponsor me?',
        },
      ],
    },
    housing: {
      value: {
        childrenPerRoom: 2,
        oppositeSexAge: 10,
        cubicFeetPerPerson: 400,
        maxCeilingFeet: 8,
        replyMonths: 6,
      },
      sources: [
        { srcId: 'SRC-387', locator: 'June 2026 §9 and Appendix E' },
        { srcId: 'SRC-402', locator: 's63' },
      ],
    },
    evidence: {
      value: {
        clearanceLookbackYears: 5,
        clearanceValidityMonths: 6,
        firstRegistrationInsuranceMonths: 12,
        travelCoverEach: 25000,
        submitDays: 30,
        sponsorBankMonths: 6,
        singleVisa: 60,
        multiVisa: 100,
        exempt: 0,
        abuseApplication: 0,
      },
      sources: [
        {
          srcId: 'SRC-388',
          locator:
            'How do I apply?; Medical insurance; Police clearance; Who can sponsor me?',
        },
        { srcId: 'SRC-384', locator: 'First registration: Stamp 4' },
        { srcId: 'SRC-406', locator: 'Visa Fees; Visa fee exemptions' },
        { srcId: 'SRC-399', locator: 'Independent immigration permission' },
      ],
    },
  },
  wcatt: {
    value: { bankMonths: 6 },
    sources: [
      { srcId: 'SRC-097', locator: 'Required documents; application form p1' },
    ],
  },
  ltr: {
    value: {
      months: 60,
      grantYears: 5,
      travelDays: 90,
      doctorTransition: '2014-03-01',
      hostingExampleYears: 2,
      stamp4ExampleYears: 3,
      fee: 500,
      payDays: 28,
    },
    sources: [
      {
        srcId: 'SRC-398',
        locator:
          'Conditions; Eligibility; Hosting Agreement and medical doctors FAQs; conditions of permission; fee on approval',
      },
    ],
  },
  treaty: {
    value: {
      euFrom: '2016-02-01',
      transitionEnd: '2020-12-31T23:00:00Z',
      ordinaryYears: 5,
      descendantAge: 21,
      contactChildAge: 18,
      initialMonths: 3,
      retainedWorkerMonths: 6,
      workerFirstYears: 1,
      absenceWindowMonths: 12,
      absenceMonths: 6,
      importantAbsenceMonths: 12,
      retirementResidenceYears: 3,
      retirementWorkMonths: 12,
      incapacityResidenceYears: 2,
      frontierYears: 3,
      deathResidenceYears: 2,
      retainedRelationYears: 3,
      retainedInStateYears: 1,
      euLossYears: 2,
      waLossYears: 5,
      documentYears: 10,
      absenceNoticeMonths: 1,
      absenceNoticeDays: 7,
      temporaryStampMonths: 6,
      healthReviewMonths: 3,
      waFee: 0,
    },
    sources: [
      { srcId: 'SRC-390', locator: 'regs. 1–6, 9–15, 18–20' },
      { srcId: 'SRC-391', locator: 'EUTR3 pp2–3; EUTR5' },
      {
        srcId: 'SRC-392',
        locator:
          'Agreement Arts. 9–10, 15; S.I. 728/2020 regs. 5–7, 10–12; Brexit FAQ',
      },
    ],
  },
} as const;
