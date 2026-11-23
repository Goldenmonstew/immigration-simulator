import type { Parameter, ParameterSet, SourceRef } from '../types';

// Germany pilot (phase 19, task 69): Aufenthaltsgesetz (SRC-100),
// Staatsangehörigkeitsgesetz (SRC-101) and BGB § 191 (SRC-102), with the
// federal guidance in SRC-104 to SRC-109.

const aufenthG = (locator: string, section: string): SourceRef => ({
  srcId: 'SRC-100',
  locator,
  url: `https://www.gesetze-im-internet.de/aufenthg_2004/__${section}.html`,
});
const stAG = (locator: string, section: string): SourceRef => ({
  srcId: 'SRC-101',
  locator,
  url: `https://www.gesetze-im-internet.de/stag/__${section}.html`,
});

export const germany2026_11 = {
  asOf: '2026-11-22',
  values: {
    // Niederlassungserlaubnis (§ 9): years holding a residence permit and
    // months of pension contributions.
    generalYears: {
      value: 5,
      sources: [
        aufenthG('§ 9 Abs. 2 Satz 1 Nr. 1', '9'),
        { srcId: 'SRC-109', locator: 'In Deutschland niederlassen' },
      ],
    },
    generalContributionMonths: {
      value: 60,
      sources: [aufenthG('§ 9 Abs. 2 Satz 1 Nr. 3', '9')],
    },
    // § 9 Abs. 4: each stay abroad that did not end the permit counts up to
    // this many months...
    abroadCreditMonths: {
      value: 6,
      sources: [
        aufenthG('§ 9 Abs. 4 Nr. 2', '9'),
        { srcId: 'SRC-108', locator: 'Nr. 9.4.2 (p69–p70)' },
      ],
    },
    // ...and earlier time, when a settlement permit lapsed abroad, up to
    // this many years.
    priorSettlementCreditYears: {
      value: 4,
      sources: [
        aufenthG('§ 9 Abs. 4 Nr. 1', '9'),
        { srcId: 'SRC-108', locator: 'Nr. 9.4.1.3 (p69)' },
      ],
    },
    // § 18c Abs. 1: skilled workers (§§ 18a, 18b, 18d, 18g permits).
    skilledYears: {
      value: 3,
      sources: [aufenthG('§ 18c Abs. 1 Satz 1 Nr. 1', '18c')],
    },
    skilledContributionMonths: {
      value: 36,
      sources: [aufenthG('§ 18c Abs. 1 Satz 1 Nr. 3', '18c')],
    },
    // After vocational training or a degree completed in Germany.
    skilledTrainedYears: {
      value: 2,
      sources: [aufenthG('§ 18c Abs. 1 Satz 2', '18c')],
    },
    skilledTrainedContributionMonths: {
      value: 24,
      sources: [aufenthG('§ 18c Abs. 1 Satz 2', '18c')],
    },
    // § 18c Abs. 2: months employed on a Blue Card, with contributions for
    // the same period; fewer with German at B1.
    blueCardMonths: {
      value: 27,
      sources: [
        aufenthG('§ 18c Abs. 2 Satz 1', '18c'),
        { srcId: 'SRC-107', locator: 'Nr. 18c.2.1.1 (p117)' },
        {
          srcId: 'SRC-109',
          locator: 'Die Blaue Karte EU',
          url: 'https://www.bamf.de/DE/Themen/MigrationAufenthalt/ZuwandererDrittstaaten/Migrathek/BlaueKarteEU/blauekarteeu-node.html',
        },
      ],
    },
    blueCardB1Months: {
      value: 21,
      sources: [
        aufenthG('§ 18c Abs. 2 Satz 3', '18c'),
        { srcId: 'SRC-107', locator: 'Nr. 18c.2.1.1 (p117)' },
      ],
    },
    // § 28 Abs. 2: family of a German, years holding the family permit.
    germanFamilyYears: {
      value: 3,
      sources: [
        aufenthG('§ 28 Abs. 2 Satz 1', '28'),
        { srcId: 'SRC-108', locator: 'Nr. 28.2.3 (p165)' },
      ],
    },
    // § 26 Abs. 3: recognised refugees and people granted asylum, counting
    // the asylum procedure; fewer years with German at C1.
    refugeeYears: {
      value: 5,
      sources: [aufenthG('§ 26 Abs. 3 Satz 1 Nr. 1, Satz 2', '26')],
    },
    refugeeC1Years: {
      value: 3,
      sources: [aufenthG('§ 26 Abs. 3 Satz 3 Nr. 1, Nr. 3, Satz 4', '26')],
    },
    // Daueraufenthalt-EU (§ 9a): years with a residence title.
    euLongTermYears: {
      value: 5,
      sources: [
        aufenthG('§ 9a Abs. 2 Satz 1 Nr. 1', '9a'),
        { srcId: 'SRC-108', locator: 'Nr. 9a.2.1.1.1 (p71)' },
      ],
    },
    // § 9b: absences count when each is at most this many months in a row...
    euSingleAbsenceMonths: {
      value: 6,
      sources: [aufenthG('§ 9b Abs. 1 Satz 1 Nr. 1 Buchst. b', '9b')],
    },
    // ...and they total no more than this many months.
    euTotalAbsenceMonths: {
      value: 10,
      sources: [aufenthG('§ 9b Abs. 1 Satz 1 Nr. 1 Buchst. b', '9b')],
    },
    // § 51: a title lapses when you do not come back within this many
    // months (Nr. 7)...
    lapseMonths: {
      value: 6,
      sources: [
        aufenthG('§ 51 Abs. 1 Nr. 7', '51'),
        { srcId: 'SRC-108', locator: 'Nr. 51.1.6.6 (p236)' },
      ],
    },
    // ...12 for a Blue Card...
    blueCardLapseMonths: {
      value: 12,
      sources: [aufenthG('§ 51 Abs. 10 Satz 1', '51')],
    },
    // ...and Daueraufenthalt-EU after this many months in a row outside the
    // EU (more after a Blue Card), or years outside Germany.
    euLapseMonths: {
      value: 12,
      sources: [aufenthG('§ 51 Abs. 9 Satz 1 Nr. 3', '51')],
    },
    euLapseBlueCardMonths: {
      value: 24,
      sources: [aufenthG('§ 51 Abs. 9 Satz 1 Nr. 3', '51')],
    },
    euLapseYears: {
      value: 6,
      sources: [aufenthG('§ 51 Abs. 9 Satz 1 Nr. 4', '51')],
    },
    // Einbürgerung: years of lawful habitual residence by route.
    naturalisationYears: {
      value: { general: 5, spouse: 3 },
      sources: [
        stAG('§ 10 Abs. 1 Satz 1', '10'),
        stAG('§ 9 Abs. 1 Satz 1', '9'),
        { srcId: 'SRC-106', locator: 'Nr. 10.1.0 Rdn. 1 (p44)' },
        {
          srcId: 'SRC-109',
          locator: 'Einbürgerung',
          url: 'https://www.bamf.de/DE/Themen/Integration/ZugewanderteTeilnehmende/Einbuergerung/einbuergerung-node.html',
        },
      ],
    },
    // Married to (or partnered with) a German for this many years.
    spouseMarriageYears: {
      value: 2,
      sources: [
        stAG('§ 9 Abs. 1 Satz 1', '9'),
        { srcId: 'SRC-106', locator: 'Nr. 9.1 Rdn. 6 (p42)' },
      ],
    },
    // § 12b: absences up to this many months do not interrupt residence.
    naturalisationAbsenceMonths: {
      value: 6,
      sources: [
        stAG('§ 12b Abs. 1 Satz 1', '12b'),
        { srcId: 'SRC-106', locator: 'Nr. 12b.1.1 Rdn. 18 (p97)' },
      ],
    },
    // § 12b Abs. 2: after an interruption, earlier residence may be counted
    // up to this many years (two thirds of 3 years for spouses).
    priorResidenceCreditYears: {
      value: { general: 3, spouse: 2 },
      sources: [
        stAG('§ 12b Abs. 2 Satz 1', '12b'),
        { srcId: 'SRC-106', locator: 'Nr. 9.1 Rdn. 5 (p42)' },
        { srcId: 'SRC-106', locator: 'Nr. 12b.2.1 Rdn. 24 (p98)' },
      ],
    },
    // StARModG in force: 5 years instead of 8 from this date.
    fiveYearsFrom: {
      value: '2024-06-27',
      sources: [
        { srcId: 'SRC-106', locator: 'Deckblatt (p1)' },
        { srcId: 'SRC-104', locator: 'BT-Drs. 21/537 (p6)' },
      ],
    },
    // The 3-year route (§ 10 Abs. 3 StAG) was struck out from this date.
    turboAbolishedFrom: {
      value: '2025-10-30',
      sources: [
        {
          srcId: 'SRC-104',
          locator: 'BGBl. 2025 I Nr. 256 Art. 1, Art. 6 Abs. 1',
          url: 'https://www.recht.bund.de/bgbl/1/2025/256/VO.html',
        },
        {
          srcId: 'SRC-104',
          locator: 'BMI Gesetzgebungsverfahren: Gesetz ist verkündet',
          url: 'https://www.bmi.bund.de/SharedDocs/gesetzgebungsverfahren/DE/VII5/gesetz-6-aenderung-des-staatsangehoerigkeitsrechts.html',
        },
        stAG('§ 10 Abs. 3 (weggefallen)', '10'),
      ],
    },
    // Months and years that need not run in one stretch: a month is 30
    // days, a year 365.
    daysPerMonth: {
      value: 30,
      sources: [
        {
          srcId: 'SRC-102',
          locator: 'BGB § 191',
          url: 'https://www.gesetze-im-internet.de/bgb/__191.html',
        },
      ],
    },
    daysPerYear: {
      value: 365,
      sources: [
        {
          srcId: 'SRC-102',
          locator: 'BGB § 191',
          url: 'https://www.gesetze-im-internet.de/bgb/__191.html',
        },
      ],
    },
  },
} satisfies {
  asOf: string;
  values: Record<string, Parameter<number | string | Record<string, number>>>;
};

export const germanyFull2026_11 = {
  ruleSetId: 'de.current-law-2026-11',
  asOf: '2026-11-23',
  values: {
    ...germany2026_11.values,
    monthlyNeeds2026: {
      value: {
        single: 563,
        partner: 506,
        otherAdult: 451,
        child14to17: 471,
        child6to13: 390,
        childUnder6: 357,
      },
      sources: [
        {
          srcId: 'SRC-426',
          locator: 'RBSFV 2026 §§ 1–2; BMAS, Regelbedarf im Jahr 2026',
        },
      ],
    },
    pensionCeiling2026: {
      value: 101400,
      sources: [
        { srcId: 'SRC-425', locator: 'SVBezGrV 2026 § 4 Abs. 1–2, § 5' },
        { srcId: 'SRC-436', locator: 'SGB VI §§ 159–160' },
      ],
    },
    monthlyNeedsYear: {
      value: '2026',
      sources: [{ srcId: 'SRC-426', locator: 'RBSFV 2026 § 2' }],
    },
    basicGerman: {
      value: 'A1',
      sources: [aufenthG('§ 2 Abs. 9; § 18c Abs. 2 Satz 1', '2')],
    },
    refugeeGerman: {
      value: 'A2',
      sources: [aufenthG('§ 2 Abs. 10; § 26 Abs. 3 Satz 1 Nr. 4', '26')],
    },
    settlementGerman: {
      value: 'B1',
      sources: [aufenthG('§ 2 Abs. 11; § 9 Abs. 2 Satz 1 Nr. 7', '9')],
    },
    refugeeFastGerman: {
      value: 'C1',
      sources: [aufenthG('§ 2 Abs. 12; § 26 Abs. 3 Satz 3 Nr. 3', '26')],
    },
    orientationPass: {
      value: 15,
      sources: [
        {
          srcId: 'SRC-432',
          locator: 'ZQ DaZ, Abschluss des Integrationskurses, Druckseite 180',
        },
        { srcId: 'SRC-412', locator: 'IntV § 17 Abs. 1–2' },
      ],
    },
    familyTransitionDay: {
      value: '2013-09-05',
      sources: [aufenthG('§ 104 Abs. 8', '104')],
    },
    resettlementTransitionThrough: {
      value: '2015-07-31',
      sources: [aufenthG('§ 104 Abs. 5', '104')],
    },
    housingGuidance: {
      value: {
        omitUnderAge: 2,
        childBoundary: 6,
        childArea: 10,
        olderArea: 12,
        shortfallFraction: 0.1,
      },
      sources: [
        aufenthG('§ 2 Abs. 4', '2'),
        { srcId: 'SRC-108', locator: 'Nr. 2.4.0–2.4.3' },
      ],
    },
    registrationWeeks: {
      value: 2,
      sources: [{ srcId: 'SRC-413', locator: 'BMG § 17 Abs. 1' }],
    },
    oldTitleBefore: {
      value: '2005-01-01',
      sources: [aufenthG('§ 104 Abs. 2', '104')],
    },
    settlementFees: {
      value: {
        general: 113,
        academic: 147,
        business: 124,
        familyChild: 55,
        euLongTerm: 109,
        advanceShare: 0.5,
        minorShare: 0.5,
        euCertificate: 10,
      },
      sources: [
        { srcId: 'SRC-410', locator: '§§ 44, 44a, 47 Abs. 3, 49, 50 Abs. 1' },
      ],
    },
    feeScheduleFrom: {
      value: '2017-09-01',
      sources: [
        {
          srcId: 'SRC-434',
          locator: 'BGBl. I 2017 S.2350; BT-Drs. 18/12050 Art. 2–3',
        },
      ],
    },
    identityCardFees: {
      value: { age: 24, under: 27.6, standard: 46 },
      sources: [
        {
          srcId: 'SRC-433',
          locator: 'PAuswGebV § 1 Abs. 1; BGBl. 2026 I Nr. 31 Art. 4, 10',
        },
        { srcId: 'SRC-410', locator: '§§ 45c, 52a' },
      ],
    },
    cardFeesFrom: {
      value: '2026-02-07',
      sources: [
        { srcId: 'SRC-433', locator: 'BGBl. 2026 I Nr. 31 Art. 4, 10 Abs. 1' },
      ],
    },
    expressFee: {
      value: 35,
      sources: [{ srcId: 'SRC-410', locator: '§ 45a' }],
    },
    expressFrom: {
      value: '2023-11-01',
      sources: [
        {
          srcId: 'SRC-434',
          locator: 'BGBl. 2023 I Nr. 290 Art. 3 Nr. 3, Art. 13 Abs. 3',
        },
      ],
    },
    naturalisationFees: {
      value: { standard: 255, childJoining: 51, minimumOnWithdrawal: 25 },
      sources: [stAG('§ 38 Abs. 2–4', '38')],
    },
    naturalisationFeesFrom: {
      value: '2002-01-01',
      sources: [
        {
          srcId: 'SRC-411',
          locator: 'BT-Drs. 20/8575, Antwort 34 (Druckseite 24)',
        },
      ],
    },
    testFee: {
      value: 25,
      sources: [{ srcId: 'SRC-411', locator: 'EinbTestV §§ 2, 3, 5' }],
    },
    testFeeFrom: {
      value: '2008-09-01',
      sources: [{ srcId: 'SRC-411', locator: 'EinbTestV § 5' }],
    },
    externalOrientationFee: {
      value: 25,
      sources: [
        {
          srcId: 'SRC-432',
          locator: 'LiD Durchführungshinweise Nr. 4 Abs. 4, Nr. 12',
        },
      ],
    },
    orientationFeeFrom: {
      value: '2019-01-01',
      sources: [
        { srcId: 'SRC-432', locator: 'LiD Durchführungshinweise Nr. 4 Abs. 4' },
      ],
    },
    integrationCourseShare: {
      value: {
        personal: 0.5,
        employee: 0.33,
        oneChildAddition: 0.1,
        multipleChildrenAddition: 0.2,
      },
      sources: [
        { srcId: 'SRC-412', locator: 'IntV § 9 Abs. 1–2, § 20 Abs. 6' },
      ],
    },
    citizenshipProcedureAge: {
      value: 16,
      sources: [stAG('§ 34 Satz 1; § 10 Abs. 4 Satz 2; § 37', '34')],
    },
    citizenshipMinorAge: {
      value: 18,
      sources: [
        stAG('§ 9 Abs. 1 Satz 3, Abs. 2; § 10 Abs. 2', '9'),
        { srcId: 'SRC-106', locator: 'Nr. 6 Rdn. 1; Nr. 10.2 Rdn. 142–144' },
      ],
    },
    citizenshipFullTime: {
      value: { required: 20, window: 24 },
      sources: [stAG('§ 10 Abs. 1 Satz 1 Nr. 3 Buchst. b–c', '10')],
    },
    legacyWestWorkerArrivalBy: {
      value: '1974-06-30',
      sources: [stAG('§ 10 Abs. 1 Satz 1 Nr. 3a, Abs. 4 Satz 3', '10')],
    },
    legacyEastWorkerArrivalBy: {
      value: '1990-06-13',
      sources: [stAG('§ 10 Abs. 1 Satz 1 Nr. 3a, Abs. 4 Satz 3', '10')],
    },
    legacyLivelihoodApplicationBy: {
      value: '2023-08-23',
      sources: [stAG('§ 40a', '40a')],
    },
    citizenshipLanguageLevel: {
      value: 'B1',
      sources: [stAG('§ 10 Abs. 4 Satz 1', '10')],
    },
    citizenshipKnowledgeTest: {
      value: { required: 17, total: 33, stateQuestions: 3, minutes: 60 },
      sources: [
        { srcId: 'SRC-411', locator: 'EinbTestV § 1 Abs. 1–4' },
        { srcId: 'SRC-412', locator: 'IntV § 17 Abs. 5' },
      ],
    },
    citizenshipConvictions: {
      value: { fineDayRates: 90, probationMonths: 3 },
      sources: [stAG('§ 12a Abs. 1 Satz 1 Nr. 2–3, Sätze 2–4', '12a')],
    },
    citizenshipSpouseException: {
      value: { publicInterestMarriageYears: 3, endedApplicationYears: 1 },
      sources: [stAG('§ 9 Abs. 1 Satz 2, Abs. 2', '9')],
    },
    citizenshipFamilyGuidance: {
      value: {
        spouseYears: 4,
        relationshipYears: 2,
        childYears: 3,
        youngChildAge: 6,
        youngChildLifeShare: 0.5,
      },
      sources: [
        {
          srcId: 'SRC-106',
          locator: 'Nr. 9.1 Rdn. 8; Nr. 10.2 Rdn. 138–145 (pp72–73)',
        },
      ],
    },
    blueCardCeilingShares: {
      value: { standard: 0.5, reduced: 0.453 },
      sources: [
        aufenthG('§ 18g Abs. 1 Sätze 1–2, Abs. 2 Nr. 1, Abs. 7', '18g'),
      ],
    },
    blueCardStandardPay: {
      value: { '2024': 45300, '2025': 48300, '2026': 50700 },
      sources: [
        aufenthG('§ 18g Abs. 1 Satz 1, Abs. 7', '18g'),
        {
          srcId: 'SRC-425',
          locator: 'SVBezGrV 2024 § 4 Abs. 1 Nr. 1; SVBezGrV 2026 § 4 Abs. 1',
        },
        {
          srcId: 'SRC-420',
          locator: 'BAnz AT 04.12.2024 B2, 18.12.2025 B3, jeweils p1',
        },
      ],
    },
    blueCardReducedPay: {
      value: { '2024': 41041.8, '2025': 43759.8, '2026': 45934.2 },
      sources: [
        aufenthG('§ 18g Abs. 1 Satz 2, Abs. 2 Nr. 1, Abs. 7', '18g'),
        { srcId: 'SRC-425', locator: 'SVBezGrV 2024 § 4 Abs. 1 Nr. 1' },
        {
          srcId: 'SRC-420',
          locator: 'BAnz AT 04.12.2024 B2, 18.12.2025 B3, jeweils p1',
        },
      ],
    },
    blueCardJob: {
      value: {
        minimumContractMonths: 6,
        recentDegreeYears: 3,
        renewalMonths: 24,
        experienceYears: 3,
        experienceWindowYears: 7,
        tertiaryYears: 3,
        tertiaryLevel: 6,
        jobChangeMonths: 12,
        suspensionDays: 30,
      },
      sources: [
        aufenthG('§ 18g Abs. 1 Sätze 2, 5, Abs. 2 Nr. 3, Abs. 3, 4, 6', '18g'),
      ],
    },
    blueCardLanguage: {
      value: ['A1', 'B1'],
      sources: [aufenthG('§ 2 Abs. 9, 11; § 18c Abs. 2 Sätze 1, 3', '18c')],
    },
    blueCardShortageGroups: {
      value: [
        '132',
        '133',
        '134',
        '21',
        '221',
        '222',
        '225',
        '226',
        '23',
        '25',
      ],
      sources: [aufenthG('§ 18g Abs. 1 Satz 2 Nr. 1, ISCO-08', '18g')],
    },
    blueCardItGroups: {
      value: ['133', '25'],
      sources: [aufenthG('§ 18g Abs. 2, ISCO-08', '18g')],
    },
    freeMovementPeriods: {
      value: {
        residenceYears: 5,
        ordinaryAbsenceMonths: 6,
        importantAbsenceMonths: 12,
        jobseekingMonths: 6,
        retirementAge: 65,
        retirementResidenceYears: 3,
        retirementWorkMonths: 12,
        disabilityResidenceYears: 2,
        frontierWorkYears: 3,
        bereavementResidenceYears: 2,
        lossYears: 2,
        cardIssueMonths: 6,
      },
      sources: [
        {
          srcId: 'SRC-422',
          locator:
            'FreizügG/EU § 2 Abs. 2 Nr. 1a; § 4a Abs. 1–7; § 5 Abs. 5 Satz 2',
        },
      ],
    },
    permanentTitleAbsence: {
      value: {
        longResidenceYears: 15,
        olderResidentAge: 60,
        returnMonths: 3,
        coercionMaximumYears: 10,
        longVisaDays: 90,
      },
      sources: [aufenthG('§ 51 Abs. 1 letzter Halbsatz, Abs. 2–4, 9–10', '51')],
    },
    skilledCurrentFrom: {
      value: '2024-03-01',
      sources: [
        {
          srcId: 'SRC-439',
          locator: 'BGBl. 2023 I Nr. 217 Art. 2 Nr. 12, Art. 12 Abs. 1',
        },
      ],
    },
    protectionNoticeFrom: {
      value: '2026-06-12',
      sources: [
        {
          srcId: 'SRC-438',
          locator: 'BGBl. 2026 I Nr. 111 Art. 2 Nr. 12, Art. 13 Abs. 2',
        },
      ],
    },
    refugeeBerlinBenefitShare: {
      value: { ordinary: 0.5, accelerated: 0.25 },
      sources: [
        {
          srcId: 'SRC-428',
          locator:
            'Voraussetzungen: Gesicherter Lebensunterhalt durch eigenes Einkommen (Stand 2026-11-23)',
        },
      ],
    },
    retirementAge: {
      value: {
        earlierYears: 65,
        standardYears: 67,
        firstRaisedCohort: 1947,
        firstStandardCohort: 1964,
      },
      sources: [
        {
          srcId: 'SRC-423',
          locator: 'SGB VI § 35 Satz 2, § 235 Abs. 2 Sätze 1–3',
        },
      ],
    },
    retirementAdditionalMonths: {
      value: {
        '1947': 1,
        '1948': 2,
        '1949': 3,
        '1950': 4,
        '1951': 5,
        '1952': 6,
        '1953': 7,
        '1954': 8,
        '1955': 9,
        '1956': 10,
        '1957': 11,
        '1958': 12,
        '1959': 14,
        '1960': 16,
        '1961': 18,
        '1962': 20,
        '1963': 22,
      },
      sources: [
        { srcId: 'SRC-423', locator: 'SGB VI § 235 Abs. 2 Satz 2, Tabelle' },
      ],
    },
    euMobility: {
      value: {
        germanBlueYears: 2,
        maxConsecutiveMonthsOutsideEu: 12,
        maxTotalMonthsOutsideEu: 18,
        studyCredit: 0.5,
      },
      sources: [aufenthG('§ 9b Abs. 2 Sätze 1–5, Abs. 1 Satz 1 Nr. 4', '9b')],
    },
    businessYears: {
      value: 3,
      sources: [aufenthG('§ 21 Abs. 4 Satz 2', '21')],
    },
    childSettlement: {
      value: {
        birthday: 16,
        adulthood: 18,
        years: 5,
        offenceWindowYears: 3,
        youthMonths: 6,
        prisonMonths: 3,
        fineUnits: 90,
      },
      sources: [
        aufenthG('§ 35 Abs. 1–4; § 26 Abs. 3 Satz 5, Abs. 4 Satz 4', '35'),
        {
          srcId: 'SRC-418',
          locator: 'Voraussetzungen (16. Lebensjahr, volljährig)',
        },
      ],
    },
    skilledSpouse: {
      value: { permitYears: 3, weeklyHours: 20 },
      sources: [aufenthG('§ 9 Abs. 3a Satz 1 Nr. 2–3', '9')],
    },
    civilServiceYears: {
      value: 3,
      sources: [aufenthG('§ 19c Abs. 4 Satz 3', '19c')],
    },
    initialSkilledSalary: {
      value: { age: 45, year: 2026, annualGross: 55770, ceilingShare: 0.55 },
      sources: [
        aufenthG('§ 18 Abs. 2 Satz 1 Nr. 5, Sätze 2–3', '18'),
        { srcId: 'SRC-425', locator: 'BAnz AT 18.12.2025 B2 p.1' },
      ],
    },
    initialEntrepreneurPensionAge: {
      value: 45,
      sources: [aufenthG('§ 21 Abs. 3', '21')],
    },
  },
} satisfies ParameterSet;
