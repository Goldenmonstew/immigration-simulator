import type { Parameter, ParameterSet, SourceRef } from '../types';

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
          url: 'https://ia37rg02wpsa01.blob.core.windows.net/fek/01/2026/20260100090.pdf',
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
          url: 'https://ia37rg02wpsa01.blob.core.windows.net/fek/01/2026/20260100090.pdf',
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
          url: 'https://ia37rg02wpsa01.blob.core.windows.net/fek/01/2026/20260100090.pdf',
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
          url: 'https://ia37rg02wpsa01.blob.core.windows.net/fek/01/2024/20240100049.pdf',
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
          url: 'https://ia37rg02wpsa01.blob.core.windows.net/fek/01/2026/20260100017.pdf',
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
          url: 'https://ia37rg02wpsa01.blob.core.windows.net/fek/01/2026/20260100017.pdf',
        },
      ],
    },
    lateFinePerMonthEur: {
      value: 100,
      sources: [
        {
          srcId: 'SRC-087',
          locator: 'ν. 5275/2026 άρθ. 12 (άρθ. 11 παρ. 1, p18)',
          url: 'https://ia37rg02wpsa01.blob.core.windows.net/fek/01/2026/20260100017.pdf',
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
          url: 'https://ia37rg02wpsa01.blob.core.windows.net/fek/01/2010/20100100049.pdf',
        },
        {
          srcId: 'SRC-088',
          locator: 'ν. 4674/2020 άρθ. 94 (p51)',
          url: 'https://ia37rg02wpsa01.blob.core.windows.net/fek/01/2020/20200100053.pdf',
        },
        {
          srcId: 'SRC-088',
          locator: 'ν. 4531/2018 άρθ. 31 παρ. 3 (άρθ. 5 παρ. 3, p119)',
          url: 'https://ia37rg02wpsa01.blob.core.windows.net/fek/01/2018/20180100062.pdf',
        },
      ],
    },
  },
} satisfies {
  asOf: string;
  values: Record<string, Parameter<number | Record<string, number>>>;
};

// Archive keys from the Greek research dossier; results expose registered SRC ids.
const official = {
  F02: [
    'SRC-350',
    'https://ia37rg02wpsa01.blob.core.windows.net/fek/01/2007/20070100135.pdf',
  ],
  F03: [
    'SRC-088',
    'https://ia37rg02wpsa01.blob.core.windows.net/fek/01/2010/20100100049.pdf',
  ],
  F04: [
    'SRC-351',
    'https://ia37rg02wpsa01.blob.core.windows.net/fek/01/2014/20140100024.pdf',
  ],
  F06: [
    'SRC-352',
    'https://ia37rg02wpsa01.blob.core.windows.net/fek/02/2014/20140202962.pdf',
  ],
  F09: [
    'SRC-088',
    'https://ia37rg02wpsa01.blob.core.windows.net/fek/01/2018/20180100062.pdf',
  ],
  F10: [
    'SRC-088',
    'https://ia37rg02wpsa01.blob.core.windows.net/fek/01/2020/20200100053.pdf',
  ],
  F12: [
    'SRC-353',
    'https://ia37rg02wpsa01.blob.core.windows.net/fek/02/2021/20210201652.pdf',
  ],
  F13: [
    'SRC-354',
    'https://ia37rg02wpsa01.blob.core.windows.net/fek/02/2021/20210203967.pdf',
  ],
  F14: [
    'SRC-355',
    'https://ia37rg02wpsa01.blob.core.windows.net/fek/02/2021/20210205125.pdf',
  ],
  F16: [
    'SRC-086',
    'https://ia37rg02wpsa01.blob.core.windows.net/fek/01/2023/20230100081.pdf',
  ],
  F18: [
    'SRC-086',
    'https://ia37rg02wpsa01.blob.core.windows.net/fek/01/2023/20230100215.pdf',
  ],
  F19: [
    'SRC-360',
    'https://ia37rg02wpsa01.blob.core.windows.net/fek/02/2024/20240201368.pdf',
  ],
  F21: [
    'SRC-356',
    'https://ia37rg02wpsa01.blob.core.windows.net/fek/02/2024/20240201807.pdf',
  ],
  F22: [
    'SRC-357',
    'https://ia37rg02wpsa01.blob.core.windows.net/fek/02/2024/20240201974.pdf',
  ],
  F23: [
    'SRC-087',
    'https://ia37rg02wpsa01.blob.core.windows.net/fek/01/2024/20240100049.pdf',
  ],
  F24: [
    'SRC-358',
    'https://ia37rg02wpsa01.blob.core.windows.net/fek/02/2024/20240202626.pdf',
  ],
  F26: [
    'SRC-359',
    'https://ia37rg02wpsa01.blob.core.windows.net/fek/02/2024/20240205223.pdf',
  ],
  F30: [
    'SRC-360',
    'https://ia37rg02wpsa01.blob.core.windows.net/fek/02/2025/20250201093.pdf',
  ],
  F31: [
    'SRC-361',
    'https://ia37rg02wpsa01.blob.core.windows.net/fek/02/2025/20250201476.pdf',
  ],
  F33: [
    'SRC-362',
    'https://ia37rg02wpsa01.blob.core.windows.net/fek/01/2025/20250100152.pdf',
  ],
  F34: [
    'SRC-089',
    'https://www.ypes.gr/wp-content/uploads/2025/09/20250917-KEI-NOMOS.pdf',
  ],
  F35: [
    'SRC-089',
    'https://www.ypes.gr/wp-content/uploads/2026/02/Proypotheseis20260130.pdf',
  ],
  F36: [
    'SRC-087',
    'https://ia37rg02wpsa01.blob.core.windows.net/fek/01/2026/20260100017.pdf',
  ],
  F37: [
    'SRC-363',
    'https://ia37rg02wpsa01.blob.core.windows.net/fek/02/2026/20260201759.pdf',
  ],
  F38: [
    'SRC-087',
    'https://ia37rg02wpsa01.blob.core.windows.net/fek/01/2026/20260100090.pdf',
  ],
  F40: [
    'SRC-368',
    'https://mitos.gov.gr/index.php/ΔΔ:Μόνιμη_άδεια_διαμονής_επενδυτή_(αλλαγή_χρήσης)_–_Αρχική_χορήγηση',
  ],
  F45: [
    'SRC-364',
    'https://home-affairs.ec.europa.eu/policies/migration-and-asylum/eu-immigration-portal/eu-blue-card/eu-blue-card-greece_en',
  ],
  F46: [
    'SRC-365',
    'https://mitos.gov.gr/index.php/%CE%94%CE%94:%CE%94%CE%B9%CE%BF%CF%81%CE%B3%CE%AC%CE%BD%CF%89%CF%83%CE%B7_%CE%B5%CE%BE%CE%B5%CF%84%CE%AC%CF%83%CE%B5%CF%89%CE%BD_%CE%B5%CE%BB%CE%BB%CE%B7%CE%BD%CE%BF%CE%BC%CE%AC%CE%B8%CE%B5%CE%B9%CE%B1%CF%82_%CE%B3%CE%B9%CE%B1_%CF%80%CE%BF%CE%BB%CE%AF%CF%84%CE%B5%CF%82_%CF%84%CF%81%CE%AF%CF%84%CF%89%CE%BD_%CF%87%CF%89%CF%81%CF%8E%CE%BD,_%CF%80%CF%81%CE%BF%CE%BA%CE%B5%CE%B9%CE%BC%CE%AD%CE%BD%CE%BF%CF%85_%CE%BD%CE%B1_%CF%85%CF%80%CE%B1%CF%87%CE%B8%CE%BF%CF%8D%CE%BD_%CF%83%CF%84%CE%BF_%CE%BA%CE%B1%CE%B8%CE%B5%CF%83%CF%84%CF%8E%CF%82_%CF%84%CE%BF%CF%85_%CE%B5%CF%80%CE%AF_%CE%BC%CE%B1%CE%BA%CF%81%CF%8C%CE%BD_%CE%B4%CE%B9%CE%B1%CE%BC%CE%AD%CE%BD%CE%BF%CE%BD%CF%84%CE%BF%CF%82',
  ],
  F48: [
    'SRC-366',
    'https://mitos.gov.gr/index.php/%CE%94%CE%94:%CE%86%CE%B4%CE%B5%CE%B9%CE%B1_%CE%B4%CE%B9%CE%B1%CE%BC%CE%BF%CE%BD%CE%AE%CF%82_%CF%85%CF%88%CE%B7%CE%BB%CE%AE%CF%82_%CE%B5%CE%B9%CE%B4%CE%AF%CE%BA%CE%B5%CF%85%CF%83%CE%B7%CF%82_(%C2%AB%CE%95.1%C2%BB)_%CE%BA%CE%B1%CF%84%CF%8C%CF%80%CE%B9%CE%BD_%CE%AD%CE%B3%CE%BA%CF%81%CE%B9%CF%83%CE%B7%CF%82_%CE%B1%CE%B9%CF%84%CE%AE%CE%BC%CE%B1%CF%84%CE%BF%CF%82_%CF%84%CE%BF%CF%85_%CE%B5%CF%81%CE%B3%CE%BF%CE%B4%CF%8C%CF%84%CE%B7_%E2%80%93_%CE%91%CF%81%CF%87%CE%B9%CE%BA%CE%AE_%CF%87%CE%BF%CF%81%CE%AE%CE%B3%CE%B7%CF%83%CE%B7',
  ],
  F49: [
    'SRC-367',
    'https://mitos.gov.gr/index.php/%CE%94%CE%94:%CE%86%CE%B4%CE%B5%CE%B9%CE%B1_%CE%B4%CE%B9%CE%B1%CE%BC%CE%BF%CE%BD%CE%AE%CF%82_%CE%BA%CE%B1%CF%84%CF%8C%CF%80%CE%B9%CE%BD_%CE%AD%CE%B3%CE%BA%CF%81%CE%B9%CF%83%CE%B7%CF%82_%CE%BC%CE%B5%CF%84%CE%AC%CE%BA%CE%BB%CE%B7%CF%83%CE%B7%CF%82_%CE%B3%CE%B9%CE%B1_%CE%B5%CE%BE%CE%B1%CF%81%CF%84%CE%B7%CE%BC%CE%AD%CE%BD%CE%B7_%CE%B5%CF%81%CE%B3%CE%B1%CF%83%CE%AF%CE%B1_%E2%80%93_%CE%91%CF%81%CF%87%CE%B9%CE%BA%CE%AE_%CF%87%CE%BF%CF%81%CE%AE%CE%B3%CE%B7%CF%83%CE%B7_(%C2%AB%CE%95.4%C2%BB)',
  ],
  F50: [
    'SRC-369',
    'https://mitos.gov.gr/index.php/%CE%94%CE%94:%CE%95%CE%BE%CE%B5%CF%84%CE%AC%CF%83%CE%B5%CE%B9%CF%82_%CE%B1%CF%80%CF%8C%CE%BA%CF%84%CE%B7%CF%83%CE%B7%CF%82_%CE%A0%CE%B9%CF%83%CF%84%CE%BF%CF%80%CE%BF%CE%B9%CE%B7%CF%84%CE%B9%CE%BA%CE%BF%CF%8D_%CE%95%CF%80%CE%AC%CF%81%CE%BA%CE%B5%CE%B9%CE%B1%CF%82_%CE%93%CE%BD%CF%8E%CF%83%CE%B5%CF%89%CE%BD_%CE%B3%CE%B9%CE%B1_%CE%A0%CE%BF%CE%BB%CE%B9%CF%84%CE%BF%CE%B3%CF%81%CE%AC%CF%86%CE%B7%CF%83%CE%B7',
  ],
  F52: [
    'SRC-370',
    'https://ia37rg02wpsa01.blob.core.windows.net/fek/01/2024/20240100207.pdf',
  ],
  F53: [
    'SRC-371',
    'https://migration.gov.gr/wp-content/uploads/2024/10/9%CE%95%CE%B3%CE%BA%CF%8D%CE%BA%CE%BB%CE%B9%CE%BF%CF%82-Golden-24.9.2024-FINAL.pdf',
  ],
  F55: [
    'SRC-360',
    'https://ia37rg02wpsa01.blob.core.windows.net/fek/02/2024/20240204555.pdf',
  ],
  F56: [
    'SRC-360',
    'https://ia37rg02wpsa01.blob.core.windows.net/fek/02/2026/20260202319.pdf',
  ],
  F54: [
    'SRC-372',
    'https://www.ypes.gr/wp-content/uploads/2026/09/eggr52779-20260924.pdf',
  ],
  F57: [
    'SRC-373',
    'https://www.hellenicparliament.gr/UserFiles/67715b2c-ec81-4f0c-ad6a-476a34d732bd/12574231.pdf',
  ],
  F58: [
    'SRC-374',
    'https://mitos.gov.gr/index.php/ΔΔ:Άδεια_διαμονής_κατόπιν_έγκρισης_μετάκλησης_για_εξαρτημένη_εργασία_–_Ανανέωση_(«Ε.4»)',
  ],
  F59: [
    'SRC-375',
    'https://api.et.gr/apiFEK/2/2025/6014/pdf',
  ],
} as const;

export function grSource(
  document: keyof typeof official,
  locator: string,
): SourceRef {
  const [srcId, url] = official[document];
  return { srcId, url, locator };
}

export const greeceFull2026_11 = {
  ruleSetId: 'gr.current-law-2026-11',
  asOf: '2026-11-23',
  values: {
    ...greece2026_11.values,
    passport: {
      value: { remainingMonths: 3, blankPages: 2, issueYears: 10 },
      sources: [grSource('F16', 'art. 8(a)')],
    },
    privateInsurance: {
      value: {
        disabilityEur: 15000,
        medicalEur: 1500,
        hospitalEur: 10000,
        maxCopayPercent: 20,
        months: 12,
      },
      sources: [
        grSource('F06', 'art. 1 B–D, pp. 35507–35508'),
        grSource('F21', 'art. 2(d)'),
      ],
    },
    changeReporting: {
      value: { months: 2, birthYears: 2, firstFine: 100, repeatFine: 200 },
      sources: [grSource('F16', 'arts. 19(1), 20(1)')],
    },
    cardFormalities: {
      value: {
        fingerprintAge: 6,
        missedAppointments: 2,
        printFee: 16,
        appealFee: 50,
        appealMonths: 2,
        decisionDays: 30,
      },
      sources: [
        grSource('F16', 'arts. 14(6)–(7), 16(2)'),
        grSource('F21', 'art. 2(c)'),
      ],
    },
    migrationCodeFrom: {
      value: '2024-03-31',
      sources: [
        grSource('F18', 'art. 97(3), amending Migration Code art. 179(1)–(2)'),
      ],
    },
    originalProtectionFullCreditMonths: {
      value: 18,
      sources: [grSource('F16', 'art. 144(2), p4194')],
    },
    blueCardMobility: {
      value: {
        memberYears: 5,
        greekYears: 2,
        singleAbsenceMonths: 12,
        totalAbsenceMonths: 18,
      },
      sources: [
        grSource('F16', 'arts. 43(2)–(3), 45, p4138; art. 144(2), p4194'),
      ],
    },
    originalLateRenewal: {
      value: { months: 1, fineEur: 100 },
      sources: [grSource('F16', 'art. 11(1), pp4120–4121')],
    },
    initialEvidenceMonths: {
      value: 6,
      sources: [grSource('F16', 'art. 10(9), p4120')],
    },
    backlogFilingFrom: {
      value: '2022-01-01',
      sources: [grSource('F36', 'arts. 52(1), 69, pp483–484')],
    },
    protectionCreditFrom: {
      value: '2026-06-12',
      sources: [grSource('F38', 'arts. 179, 265(1), 144(2)–(2A) as amended')],
    },
    generalCharacter: {
      value: { sentenceMonths: 12, childScreenAge: 15, listingYears: 5 },
      sources: [grSource('F16', 'arts. 8(c), 15(1)(d)')],
    },
    longTermFamilySupplementPercent: {
      value: 10,
      sources: [
        grSource('F38', 'art. 179, Migration Code art. 144(1)(a)'),
        grSource('F26', 'art. 3'),
      ],
    },
    settlementIntegration: {
      value: {
        consecutiveYears: 12,
        a2ExamAge: 16,
        total: 50,
        sections: 4,
        sectionPercent: 50,
        history: 10,
        fullFee: 50,
        historyFee: 20,
      },
      sources: [
        grSource('F36', 'art. 37, Migration Code art. 160(1)'),
        grSource('F14', 'arts. 3, 12'),
        grSource('F46', 'Prerequisites, Cost'),
      ],
    },
    settlementGreekLevel: {
      value: 'B1',
      sources: [grSource('F36', 'art. 37, Migration Code art. 160(1)(d)')],
    },
    longTermCard: {
      value: {
        initialFee: 150,
        cardFee: 16,
        exemptFee: 0,
        validYears: 5,
        decisionMonths: 6,
        extensionMonths: 3,
        lossEuMonths: 12,
        lossGreeceYears: 6,
      },
      sources: [
        grSource('F16', 'arts. 145(5), 146(1)–(2), 171(1)(στ), 171(2)(a)–(b)'),
        grSource('F21', 'arts. 1, 57'),
        grSource('F36', 'art. 36, Migration Code art. 148(1)'),
      ],
    },
    tenYearCard: {
      value: {
        years: 10,
        grades: 6,
        beforeAge: 23,
        absenceYears: 2,
        ordinaryFee: 900,
        youthFee: 300,
      },
      sources: [
        grSource('F36', 'art. 38, Migration Code art. 161(1), (3), (5), (7)'),
        grSource('F16', 'art. 171(1)(ζ)'),
      ],
    },
    naturalisationScreen: {
      value: {
        adultAge: 18,
        criminalLookbackYears: 10,
        intentionalSentenceMonths: 12,
        listedSentenceMonths: 6,
        rejectionYears: 1,
        oathYears: 1,
      },
      sources: [
        grSource('F34', 'ΚΕΙ arts. 5(1)(a)–(b), 8(3), 9(1)'),
        grSource('F33', 'arts. 97–98'),
      ],
    },
    naturalisationExam: {
      value: {
        language: 40,
        languageMax: 60,
        languagePercent: 66,
        knowledge: 20,
        total: 70,
        oralAge: 62,
        disabilityPercent: 67,
        schoolGrades: 9,
        secondaryGrades: 6,
        fee: 150,
      },
      sources: [
        grSource('F50', 'Κόστος, Π.Ε.Γ.Π. examination'),
        grSource('F30', 'arts. 2, 4, 5, 7(1)–(2), p9379'),
        grSource('F34', 'ΚΕΙ art. 7(1)–(4)'),
        grSource('F33', 'art. 96'),
      ],
    },
    naturalisationFees: {
      value: { initial: 550, repeat: 200, reduced: 100 },
      sources: [grSource('F34', 'ΚΕΙ art. 6(1)(ζ)')],
    },
    examPreviousRulesFrom: {
      value: '2024-03-04',
      sources: [grSource('F19', 'art. 7 and final publication clause')],
    },
    examInterimRulesFrom: {
      value: '2024-08-05',
      sources: [
        grSource('F55', 'art. 7 and final repeal of decision 15478/2024'),
      ],
    },
    examWrittenRulesFrom: {
      value: '2025-03-10',
      sources: [
        grSource('F30', 'art. 7 and final repeal of decision 384/2024'),
      ],
    },
    examCurrentRulesFrom: {
      value: '2026-04-24',
      sources: [grSource('F56', 'arts. 8–9, repeal of decision 10802/2025')],
    },
    naturalisationReformFrom: {
      value: '2025-09-02',
      sources: [grSource('F33', 'arts. 96, 98, 122(1)')],
    },
    economicCircularFrom: {
      value: '2026-09-24',
      sources: [
        grSource('F54', 'heading; pp5–6, pending and new applications'),
      ],
    },
    naturalisationIncomeYears: {
      value: { general: 5, 'three-year': 3, 'twelve-year': 7 },
      sources: [
        grSource('F12', 'art. 1.A.2'),
        grSource('F13', 'amendment 3'),
        grSource('F35', 'p3'),
      ],
    },
    naturalisationIncome: {
      value: {
        firstYear: 2009,
        reducedFrom: 2012,
        restoredFrom: 2019,
        lastYear: 2022,
        standard: 7500,
        reduced: 6500,
        disability: 5500,
        dependantPercent: 10,
      },
      sources: [
        grSource('F35', 'pp3–4, annual income table and notes'),
        grSource('F12', 'art. 1.A'),
        grSource('F13', 'amendments 1–4'),
      ],
    },
    formerBlueCardEuAbsenceMonths: {
      value: 24,
      sources: [grSource('F16', 'art. 43(4), (7)')],
    },
    historyExamGreekLevel: {
      value: 'A2',
      sources: [
        grSource(
          'F14',
          'arts. 5, 12, legacy A under PD 363/1998 or A2 under PD 60/2010',
        ),
      ],
    },
    investorEntryMonths: {
      value: 12,
      sources: [grSource('F16', 'art. 10(11)')],
    },
    gvReformEffective: {
      value: '2024-04-05',
      sources: [grSource('F23', 'arts. 64, 69(1)'), grSource('F53', 'II(γ)')],
    },
    gvConversionDecisionEffective: {
      value: '2025-11-11',
      sources: [grSource('F59', 'arts. 3–4, pp. 75069–75070')],
    },
    gvInvestment: {
      value: {
        highEur: 800000,
        otherEur: 400000,
        specialEur: 250000,
        islandPopulation: 3100,
        minMainAreaSqm: 120,
        factoryIdleYears: 5,
        properties: 1,
      },
      sources: [
        grSource(
          'F23',
          'ν. 5100/2024 art. 64(1), art. 100(1)–(2), pp. 1198–1199',
        ),
        grSource('F53', 'Circular 9/2024, I(Α)–(Β), pp. 1–2'),
        grSource('F40', 'Προϋποθέσεις, 5 (Χρονικές)'),
        grSource('F59', 'art. 2, §§2.1, 2.6(ε), pp. 75064–75065, 75067–75068'),
      ],
    },
    gvLegacyDepositPercent: {
      value: 10,
      sources: [grSource('F23', 'art. 64(4), p. 1200')],
    },
    gvLegacyDepositBy: {
      value: '2024-08-31',
      sources: [grSource('F23', 'art. 64(4), p. 1200')],
    },
    gvLegacyCompleteBy: {
      value: '2025-02-28',
      sources: [
        grSource(
          'F52',
          'ν. 5167/2024 art. 37(1), extending art. 64(4) first sentence',
        ),
      ],
    },
    gvLegacyReplacementBy: {
      value: '2025-04-30',
      sources: [grSource('F23', 'art. 64(4), p. 1200')],
    },
    gvFees: {
      value: {
        main: 2000,
        adultFamily: 150,
        independentChild: 450,
        minor: 0,
        minorAge: 18,
        card: 16,
        visaD: 180,
      },
      sources: [
        grSource('F04', 'art. 1, consular fee schedule A4(b)'),
        grSource('F40', 'Κόστος, initial Β.5 change of use'),
        grSource('F16', 'art. 171(1)(β,γ), (2)(γ)'),
        grSource('F21', 'arts. 2(γ) and 31(1)(στ)'),
      ],
    },
    gvFamily: {
      value: { childAge: 21, independentYears: 3 },
      sources: [grSource('F36', 'art. 29, amending art. 95(2), p. 466')],
    },
    gvFines: {
      value: { prohibitedUse: 50000, listedRestoration: 150000 },
      sources: [
        grSource('F23', 'art. 64, art. 100(2)(δ), (4), (7Α), pp. 1199–1200'),
      ],
    },
    gfPeriods: {
      value: {
        childAge: 21,
        residenceYears: 5,
        interruptionYears: 2,
        lateFeeAfterYears: 1,
        applicationFee: 0,
        lateFee: 50,
        cardYears: 10,
        initialMonths: 3,
      },
      sources: [
        grSource(
          'F36',
          'arts. 9(3), 27–28, art. 93(9),(11) and 93Α(1)–(4), pp. 444–445, 464–466',
        ),
        grSource('F16', 'art. 93(2)–(4),(7)'),
      ],
    },
    familyRetention: {
      value: { marriageYears: 3, inGreeceYears: 1, filingMonths: 2 },
      sources: [
        grSource('F36', 'art. 27(2), art. 93(11), pp. 464–465'),
        grSource('F02', 'arts. 11(2), 12(2)'),
      ],
    },
    efPeriods: {
      value: {
        residenceYears: 5,
        retirementYears: 3,
        priorWorkMonths: 12,
        incapacityYears: 2,
        crossBorderYears: 3,
        ordinaryAbsenceMonths: 6,
        seriousAbsenceMonths: 12,
        seriousAbsences: 1,
        lossYears: 2,
        lateYears: 1,
        maxFine: 150,
        decisionMonths: 6,
        cardYears: 10,
      },
      sources: [grSource('F02', 'arts. 13–15, 17(2)–(5), pp. 2982–2984')],
    },
    gvTransitionalValues: {
      value: { legacyHigh: 500000, legacyOther: 250000 },
      sources: [grSource('F53', 'Circular 9/2024, II(δ), p5')],
    },
    minimumMonthlyGrossEur: {
      value: 920,
      sources: [grSource('F37', 'ΥΑ 8934/2026, operative point α')],
    },
    minimumDailyGrossEur: {
      value: 41.09,
      sources: [grSource('F37', 'ΥΑ 8934/2026, operative point β')],
    },
    minimumWageEffective: {
      value: '2026-04-01',
      sources: [grSource('F37', 'ΥΑ 8934/2026, commencement')],
    },
    previousMonthlyGrossEur: {
      value: 880,
      sources: [grSource('F31', 'ΥΑ 8233/2025, operative point α')],
    },
    previousDailyGrossEur: {
      value: 39.3,
      sources: [grSource('F31', 'ΥΑ 8233/2025, operative point β')],
    },
    previousWageEffective: {
      value: '2025-04-01',
      sources: [grSource('F31', 'ΥΑ 8233/2025, commencement')],
    },
    incomeMethodEffective: {
      value: '2024-09-17',
      sources: [grSource('F26', 'ΚΥΑ 225679/2024, arts. 2–3, 7(1)')],
    },
    annualPayPeriods: {
      value: 14,
      sources: [grSource('F26', 'ΚΥΑ 225679/2024, arts. 2(1), 3(1)')],
    },
    workBlueSalary: {
      value: {
        multiplier: 1.6,
        lastPublishedYear: 2024,
        lastPublishedEur: 31918.83,
      },
      sources: [
        grSource('F16', 'art. 31(1)(α)'),
        grSource(
          'F45',
          'How much do I have to earn to qualify for an EU Blue Card?',
        ),
      ],
    },
    workReformEffective: {
      value: '2026-02-06',
      sources: [
        grSource('F36', 'arts. 12, 19, 21, 28, 37–38, 52, 69 (commencement)'),
      ],
    },
    workContractMonths: {
      value: { blue: 6, employee: 6, employeeBeforeReform: 12 },
      sources: [
        grSource('F16', 'arts. 31(1)(α), 61(3)(α)'),
        grSource('F36', 'art. 21 (art. 61(3)(α))'),
      ],
    },
    workEmployerEffective: {
      value: '2024-05-02',
      sources: [grSource('F24', 'ΚΥΑ 133226/2024, art. 4 (commencement)')],
    },
    workEmployer: {
      value: {
        business: 60000,
        individualOrAgriculture: 22000,
        agencyCapital: 1000000,
        projectWorkers: 500,
      },
      sources: [
        grSource('F24', 'ΚΥΑ 133226/2024, arts. 1–2'),
        grSource('F36', 'arts. 18, 21 (arts. 27(4), 61(7))'),
      ],
    },
    workValidity: {
      value: {
        initialYears: 3,
        blueBeforeReformYears: 2,
        employeeBeforeReformYears: 3,
        blueRenewalYears: 3,
        employeeRenewalYears: 5,
        blueShortContractExtraMonths: 3,
      },
      sources: [
        grSource('F16', 'arts. 13(1), 34(2), 61, pp4122, 4133, 4148'),
        grSource('F36', 'arts. 19, 21 (arts. 34(2), 61(5))'),
      ],
    },
    workFees: {
      value: {
        invitation: 200,
        projectInvitation: 400,
        visa: 180,
        permit: 150,
        print: 16,
        blueDecisionDays: 90,
        consulateNotificationDays: 30,
        employerNotificationDays: 15,
      },
      sources: [
        grSource('F04', 'art. 1, schedule A4(b)'),
        grSource('F48', 'Κόστος, initial Ε.1'),
        grSource('F49', 'Κόστος, initial Ε.4'),
        grSource('F36', 'arts. 18, 21 (arts. 27(3), 61(3), (7))'),
        grSource('F21', 'ΚΥΑ 95391/2024, arts. 2, 4, 7'),
        grSource('F45', 'How much will it cost? / How long will it take?'),
      ],
    },
    familySponsor: {
      value: { years: 2, permitYears: 2, spousePercent: 20, childPercent: 15 },
      sources: [
        grSource('F16', 'arts. 83(1), 84(1)–(2)'),
        grSource('F26', 'ΚΥΑ 225679/2024, art. 2'),
      ],
    },
    familyMembers: {
      value: {
        adultAge: 18,
        investorChildLimit: 21,
        decisionMonths: 9,
        extensionMonths: 3,
      },
      sources: [
        grSource('F16', 'arts. 4(λε), 86(3)'),
        grSource('F36', 'arts. 9(2), 29 (arts. 4(λε), 95(2))'),
      ],
    },
    familyAutonomy: {
      value: {
        residenceYears: 5,
        bereavementYears: 1,
        marriageYears: 3,
        marriageInGreeceYears: 1,
        cardYears: 3,
        childRenewalAge: 21,
        finalChildAge: 24,
        blueGreekYears: 2,
      },
      sources: [
        grSource('F16', 'arts. 90(1)–(5), 42(6)'),
        grSource('F21', 'ΚΥΑ 95391/2024, art. 24(1.3)–(1.4)'),
      ],
    },
    familyFees: {
      value: { permit: 150, childRenewal: 450, nationalVisa: 90 },
      sources: [
        grSource('F04', 'art. 1, schedule A4(b)'),
        grSource('F16', 'art. 171(1)(β), (2)'),
        grSource('F21', 'ΚΥΑ 95391/2024, arts. 23(2), 24(1.3)–(1.4)'),
      ],
    },
    workInvitationAge: {
      value: 18,
      sources: [grSource('F36', 'art. 17 (art. 26(6))')],
    },
    workBlueInterruption: {
      value: {
        serviceYears: 2,
        shortServiceMonths: 3,
        longerServiceMonths: 6,
        protectedLeaveMonths: 12,
      },
      sources: [grSource('F16', 'art. 36(2)–(3)')],
    },
    wage2024Effective: {
      value: '2024-04-01',
      sources: [grSource('F22', 'ΥΑ 25058/2024, commencement')],
    },
    wage2024GrossEur: {
      value: { monthly: 830, daily: 37.07 },
      sources: [grSource('F22', 'ΥΑ 25058/2024, operative points α, β')],
    },
  },
} satisfies ParameterSet;
