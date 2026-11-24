import type { Parameter } from '../types';

// Japan pilot (phase 19, task 70): the Immigration Control Act (SRC-110), the
// Nationality Act (SRC-111), the permanent residence guidelines (SRC-113 for
// applications up to 2027-03-31, SRC-114 from 2027-04-01) and the
// naturalisation review practice from 2026-04-01 (SRC-117, SRC-118).
const NEW_GUIDELINE = 'https://www.moj.go.jp/isa/10_00279.html';
const NEW_GUIDELINE_PDF = 'https://www.moj.go.jp/isa/content/001471577.pdf';

const generalStay = [
  { srcId: 'SRC-113', locator: '1(3)ア' },
  {
    srcId: 'SRC-114',
    locator: '第2の5(6) (p7)',
    url: `${NEW_GUIDELINE}#midashi02`,
  },
];
const absence = [
  {
    srcId: 'SRC-114',
    locator: '第2の5(6) (p7)',
    url: `${NEW_GUIDELINE}#midashi02`,
  },
  { srcId: 'SRC-115', locator: '第48号 (p5)' },
];
const spouse = [
  { srcId: 'SRC-113', locator: '2(1)' },
  {
    srcId: 'SRC-114',
    locator: '第3の1 (p9)',
    url: `${NEW_GUIDELINE}#midashi03`,
  },
  { srcId: 'SRC-115', locator: '第63号 (p7)' },
];
const practice = [
  {
    srcId: 'SRC-117',
    locator: 'Q9',
    url: 'https://www.moj.go.jp/MINJI/minji78.html#a09',
  },
  {
    srcId: 'SRC-118',
    locator: '一及び二について',
    url: 'https://www.sangiin.go.jp/japanese/joho1/kousei/syuisyo/221/touh/t221091.htm',
  },
];
const article7 = [{ srcId: 'SRC-111', locator: '第7条' }];
const ageChange = [
  {
    srcId: 'SRC-117',
    locator: 'Q9 能力条件（注）',
    url: 'https://www.moj.go.jp/MINJI/minji78.html#a09',
  },
];
const holidaysLaw = [
  {
    srcId: 'SRC-112',
    locator: '国民の祝日に関する法律 第2条・第3条',
    url: 'https://laws.e-gov.go.jp/law/323AC1000000178',
  },
];
const officeHolidays = [
  {
    srcId: 'SRC-112',
    locator: '行政機関の休日に関する法律 第1条・第2条',
    url: 'https://laws.e-gov.go.jp/law/363AC0000000091',
  },
];

export const japan2026_11 = {
  asOf: '2026-11-22',
  values: {
    // Permanent residence applications from this date follow the 2026-10-01
    // guideline; earlier ones the 2026-02-24 one.
    newGuidelineFrom: {
      value: '2027-04-01',
      sources: [
        { srcId: 'SRC-114', locator: '第6 (p13)', url: NEW_GUIDELINE_PDF },
        {
          srcId: 'SRC-114',
          locator: 'ガイドラインの適用について',
          url: 'https://www.moj.go.jp/isa/applications/procedures/eizyuu_00001.html',
        },
      ],
    },
    // General route: years of continuous stay, and of those, years on a
    // work or residence status (same in both guidelines).
    prStayYears: { value: 10, sources: generalStay },
    prStatusYears: { value: 5, sources: generalStay },
    // From 2027-04-01: in the years before applying, one absence of this
    // many months or more, or this many months in total, counts against.
    absenceWindowYears: { value: 10, sources: absence },
    singleAbsenceMonths: { value: 6, sources: absence },
    totalAbsenceMonths: { value: 30, sources: absence },
    // Spouse of a Japanese national or permanent resident: years of married
    // life and of stay; their children: years of stay. By guideline.
    spouseMarriageYears: { value: { old: 3, new: 5 }, sources: spouse },
    spouseStayYears: { value: { old: 1, new: 3 }, sources: spouse },
    childStayYears: { value: { old: 1, new: 3 }, sources: spouse },
    // Born in Japan: apply to acquire status within this many days of birth.
    birthAcquisitionDays: {
      value: 30,
      sources: [
        { srcId: 'SRC-110', locator: '第22条の2第2項・第4項' },
        {
          srcId: 'SRC-119',
          locator: '申請期間',
          url: 'https://www.moj.go.jp/isa/applications/procedures/16-4.html#midashi04',
        },
      ],
    },
    // A newborn may stay this many days without a status; leaving within
    // them without a re-entry permit needs no application.
    birthStayWithoutStatusDays: {
      value: 60,
      sources: [
        { srcId: 'SRC-110', locator: '第22条の2第1項' },
        {
          srcId: 'SRC-116',
          locator: '出入国審査・在留審査Q&A Q28',
          url: 'https://www.moj.go.jp/isa/immigration/faq/kanri_qa.html#q28',
        },
      ],
    },
    // A statutory filing deadline on a day the offices are closed moves to
    // the next open day: Saturdays, Sundays, national holidays, and these
    // days at the turn of the year (行政機関の休日に関する法律 第1条・第2条).
    yearEndClosureFrom: { value: '12-29', sources: officeHolidays },
    yearEndClosureTo: { value: '01-03', sources: officeHolidays },
    // National holidays and substitute holidays as listed by the National
    // Astronomical Observatory (the equinoxes are not fixed by law),
    // including those moved by special laws in 2019–2021 (the almanac pages
    // were revised for them); years not listed are not known.
    nationalHolidays: {
      value: [
        '2019-01-01',
        '2019-01-14',
        '2019-02-11',
        '2019-03-21',
        '2019-04-29',
        '2019-04-30',
        '2019-05-01',
        '2019-05-02',
        '2019-05-03',
        '2019-05-04',
        '2019-05-05',
        '2019-05-06',
        '2019-07-15',
        '2019-08-11',
        '2019-08-12',
        '2019-09-16',
        '2019-09-23',
        '2019-10-14',
        '2019-10-22',
        '2019-11-03',
        '2019-11-04',
        '2019-11-23',
        '2020-01-01',
        '2020-01-13',
        '2020-02-11',
        '2020-02-23',
        '2020-02-24',
        '2020-03-20',
        '2020-04-29',
        '2020-05-03',
        '2020-05-04',
        '2020-05-05',
        '2020-05-06',
        '2020-07-23',
        '2020-07-24',
        '2020-08-10',
        '2020-09-21',
        '2020-09-22',
        '2020-11-03',
        '2020-11-23',
        '2021-01-01',
        '2021-01-11',
        '2021-02-11',
        '2021-02-23',
        '2021-03-20',
        '2021-04-29',
        '2021-05-03',
        '2021-05-04',
        '2021-05-05',
        '2021-07-22',
        '2021-07-23',
        '2021-08-08',
        '2021-08-09',
        '2021-09-20',
        '2021-09-23',
        '2021-11-03',
        '2021-11-23',
        '2022-01-01',
        '2022-01-10',
        '2022-02-11',
        '2022-02-23',
        '2022-03-21',
        '2022-04-29',
        '2022-05-03',
        '2022-05-04',
        '2022-05-05',
        '2022-07-18',
        '2022-08-11',
        '2022-09-19',
        '2022-09-23',
        '2022-10-10',
        '2022-11-03',
        '2022-11-23',
        '2023-01-01',
        '2023-01-02',
        '2023-01-09',
        '2023-02-11',
        '2023-02-23',
        '2023-03-21',
        '2023-04-29',
        '2023-05-03',
        '2023-05-04',
        '2023-05-05',
        '2023-07-17',
        '2023-08-11',
        '2023-09-18',
        '2023-09-23',
        '2023-10-09',
        '2023-11-03',
        '2023-11-23',
        '2024-01-01',
        '2024-01-08',
        '2024-02-11',
        '2024-02-12',
        '2024-02-23',
        '2024-03-20',
        '2024-04-29',
        '2024-05-03',
        '2024-05-04',
        '2024-05-05',
        '2024-05-06',
        '2024-07-15',
        '2024-08-11',
        '2024-08-12',
        '2024-09-16',
        '2024-09-22',
        '2024-09-23',
        '2024-10-14',
        '2024-11-03',
        '2024-11-04',
        '2024-11-23',
        '2025-01-01',
        '2025-01-13',
        '2025-02-11',
        '2025-02-23',
        '2025-02-24',
        '2025-03-20',
        '2025-04-29',
        '2025-05-03',
        '2025-05-04',
        '2025-05-05',
        '2025-05-06',
        '2025-07-21',
        '2025-08-11',
        '2025-09-15',
        '2025-09-23',
        '2025-10-13',
        '2025-11-03',
        '2025-11-23',
        '2025-11-24',
        '2026-01-01',
        '2026-01-12',
        '2026-02-11',
        '2026-02-23',
        '2026-03-20',
        '2026-04-29',
        '2026-05-03',
        '2026-05-04',
        '2026-05-05',
        '2026-05-06',
        '2026-07-20',
        '2026-08-11',
        '2026-09-21',
        '2026-09-22',
        '2026-09-23',
        '2026-10-12',
        '2026-11-03',
        '2026-11-23',
        '2027-01-01',
        '2027-01-11',
        '2027-02-11',
        '2027-02-23',
        '2027-03-21',
        '2027-03-22',
        '2027-04-29',
        '2027-05-03',
        '2027-05-04',
        '2027-05-05',
        '2027-07-19',
        '2027-08-11',
        '2027-09-20',
        '2027-09-23',
        '2027-10-11',
        '2027-11-03',
        '2027-11-23',
      ],
      sources: [
        ...holidaysLaw,
        ...[2019, 2020, 2021, 2022, 2023, 2024].map((y) => ({
          srcId: 'SRC-112',
          locator: `暦要項 ${y} 国民の祝日`,
          url: `https://eco.mtk.nao.ac.jp/koyomi/yoko/${y}/rekiyou${y % 100}1.html`,
        })),
        {
          srcId: 'SRC-112',
          locator: '暦要項 2025 国民の祝日',
          url: 'https://eco.mtk.nao.ac.jp/koyomi/yoko/2025/rekiyou251.html',
        },
        {
          srcId: 'SRC-112',
          locator: '暦要項 2026 国民の祝日',
          url: 'https://eco.mtk.nao.ac.jp/koyomi/yoko/2026/rekiyou261.html',
        },
        {
          srcId: 'SRC-112',
          locator: '暦要項 2027 国民の祝日',
          url: 'https://eco.mtk.nao.ac.jp/koyomi/yoko/2027/rekiyou271.html',
        },
      ],
    },
    // Years after the lists follow the holidays law: fixed dates, Mondays
    // (month: which Monday), and the equinox days, which are fixed only a
    // year ahead (only predicted here).
    fixedHolidays: {
      value: [
        '01-01',
        '02-11',
        '02-23',
        '04-29',
        '05-03',
        '05-04',
        '05-05',
        '08-11',
        '11-03',
        '11-23',
      ],
      sources: holidaysLaw,
    },
    mondayHolidays: {
      value: { '01': 2, '07': 3, '09': 3, '10': 2 },
      sources: holidaysLaw,
    },
    predictedEquinoxes: {
      value: [
        '2028-03-20',
        '2028-09-22',
        '2029-03-20',
        '2029-09-23',
        '2030-03-20',
        '2030-09-23',
        '2031-03-21',
        '2031-09-23',
        '2032-03-20',
        '2032-09-22',
        '2033-03-20',
        '2033-09-23',
        '2034-03-20',
        '2034-09-23',
        '2035-03-21',
        '2035-09-23',
        '2036-03-20',
        '2036-09-22',
        '2037-03-20',
        '2037-09-23',
        '2038-03-20',
        '2038-09-23',
        '2039-03-21',
        '2039-09-23',
        '2040-03-20',
        '2040-09-22',
        '2041-03-20',
        '2041-09-23',
        '2042-03-20',
        '2042-09-23',
        '2043-03-21',
        '2043-09-23',
        '2044-03-20',
        '2044-09-22',
        '2045-03-20',
        '2045-09-22',
        '2046-03-20',
        '2046-09-23',
        '2047-03-21',
        '2047-09-23',
        '2048-03-20',
        '2048-09-22',
        '2049-03-20',
        '2049-09-22',
        '2050-03-20',
        '2050-09-23',
      ],
      sources: [
        {
          srcId: 'SRC-112',
          locator: '何年後かの春分の日・秋分の日はわかるの？ 表1',
          url: 'https://www.nao.ac.jp/faq/a0301.html',
        },
      ],
    },
    teijushaYears: {
      value: 5,
      sources: [
        { srcId: 'SRC-113', locator: '2(2)' },
        {
          srcId: 'SRC-114',
          locator: '第3の2 (p9)',
          url: `${NEW_GUIDELINE}#midashi03`,
        },
      ],
    },
    refugeeYears: {
      value: 5,
      sources: [
        { srcId: 'SRC-113', locator: '2(3)' },
        {
          srcId: 'SRC-114',
          locator: '第3の3 (p9)',
          url: `${NEW_GUIDELINE}#midashi03`,
        },
      ],
    },
    // Highly skilled professionals: years keeping 70 points, or 80 points or
    // special highly skilled (J-Skip).
    highlySkilledYears: {
      value: { hsp70: 3, hsp80: 1 },
      sources: [
        { srcId: 'SRC-113', locator: '2(6)–(8)' },
        {
          srcId: 'SRC-114',
          locator: '第3の6–8 (p10)',
          url: `${NEW_GUIDELINE}#midashi03`,
        },
      ],
    },
    // A deemed re-entry permit (みなし再入国許可) lasts this many years from
    // the day of departure and cannot be extended.
    deemedReentryYears: {
      value: 1,
      sources: [
        { srcId: 'SRC-110', locator: '第26条の2第2項・第3項' },
        {
          srcId: 'SRC-116',
          locator: 'みなし再入国許可',
          url: 'https://www.moj.go.jp/isa/immigration/procedures/minashisainyukoku_00001.html',
        },
        {
          srcId: 'SRC-116',
          locator: '永住者の在留資格について p5',
          url: 'https://www.moj.go.jp/isa/content/930003741.pdf',
        },
      ],
    },
    // With a renewal or change of status pending at expiry, the status lasts
    // until the decision or this many months after expiry, and a deemed
    // re-entry must come back by then.
    renewalPendingMonths: {
      value: 2,
      sources: [
        { srcId: 'SRC-110', locator: '第20条第6項' },
        {
          srcId: 'SRC-116',
          locator: '出入国審査・在留審査Q&A Q61',
          url: 'https://www.moj.go.jp/isa/immigration/faq/kanri_qa.html#q62',
        },
      ],
    },
    // Naturalisation (art. 5): years of domicile and age.
    naturalisationYears: {
      value: 5,
      sources: [
        { srcId: 'SRC-111', locator: '第5条第1項第1号' },
        {
          srcId: 'SRC-117',
          locator: 'Q9',
          url: 'https://www.moj.go.jp/MINJI/minji78.html#a09',
        },
      ],
    },
    naturalisationAge: {
      value: 18,
      sources: [
        { srcId: 'SRC-111', locator: '第5条第1項第2号' },
        {
          srcId: 'SRC-117',
          locator: 'Q9 能力条件',
          url: 'https://www.moj.go.jp/MINJI/minji78.html#a09',
        },
        {
          srcId: 'SRC-112',
          locator: '年齢計算ニ関スル法律',
          url: 'https://laws.e-gov.go.jp/law/135AC1000000050',
        },
      ],
    },
    // Before this date the age in art. 5(1)(ii) was this one (MOJ Q9 note).
    naturalisationAgeFrom: { value: '2022-04-01', sources: ageChange },
    naturalisationAgeBefore: { value: 20, sources: ageChange },
    // Review practice from this date: in principle this many years of stay.
    naturalisationPracticeYears: { value: 10, sources: practice },
    naturalisationPracticeFrom: {
      value: '2026-04-01',
      sources: [
        { srcId: 'SRC-118', locator: '帰化審査の厳格化' },
        {
          srcId: 'SRC-118',
          locator: '参議院法務委員会 No.120',
          url: 'https://kokkai.ndl.go.jp/api/speech?issueID=122115206X00420260414&speechNumber=120&recordPacking=json',
        },
      ],
    },
    // Spouse of a Japanese national (art. 7): either years of domicile or
    // residence, or years since the wedding plus years of domicile.
    spouseNaturalisationYears: { value: 3, sources: article7 },
    spouseNaturalisationMarriageYears: { value: 3, sources: article7 },
    spouseNaturalisationDomicileYears: { value: 1, sources: article7 },
  },
} satisfies {
  asOf: string;
  values: Record<
    string,
    Parameter<number | string | string[] | Record<string, number>>
  >;
};

// Additional permanent residence, naturalisation and travel checks. The pilot
// continues to use japan2026_11 above, including its original policy date.
export const japanFull2026_11 = {
  asOf: '2026-11-23',
  ruleSetId: 'jp.current-law-2026-11',
  values: {
    incomeReview: {
      value: {
        filingsFrom: '2026-04-01',
        pendingOn: '2026-10-01',
        householdSizeForAdjustment: 5,
      },
      sources: [
        {
          srcId: 'SRC-114',
          locator: '第2の4(2)、第2の5(7)、第6 (p4–5, p7–8, p13)',
        },
        { srcId: 'SRC-115', locator: '第69号 (p8)' },
      ],
    },
    pensionComparisonYears: {
      value: 30,
      sources: [{ srcId: 'SRC-114', locator: '第2の4(3) (p5)' }],
    },
    longestPeriod: {
      value: {
        deemedMonths: 36,
        transitionOn: '2027-03-31',
        maximumMonths: {
          official: 60,
          professor: 60,
          artist: 60,
          religious: 60,
          journalist: 60,
          hsp1: 60,
          businessManager: 60,
          legalAccounting: 60,
          medical: 60,
          researcher: 60,
          instructor: 60,
          engineer: 60,
          transfer: 60,
          nursing: 60,
          entertainer: 36,
          skilledLabour: 60,
          specifiedSkilled1: 36,
          specifiedSkilled2: 36,
          technicalIntern1: 12,
          technicalIntern2or3: 24,
          cultural: 36,
          student: 51,
          clinicalTraining: 24,
          trainee: 12,
          dependent: 60,
          designatedActivity: 60,
          designatedEpa: 36,
          japaneseFamily: 60,
          prFamily: 60,
          teijusha: 60,
        },
      },
      sources: [
        { srcId: 'SRC-440', locator: '別表第2' },
        { srcId: 'SRC-114', locator: '第2の5(6) 注4 (p7)' },
      ],
    },
    immigrationDuties: {
      value: { addressDays: 14, affiliationDays: 14, cardCarryingAge: 16 },
      sources: [
        { srcId: 'SRC-110', locator: '第19条の7–9、第19条の16、第23条第5項' },
      ],
    },
    severeSentenceYears: {
      value: 1,
      sources: [{ srcId: 'SRC-110', locator: '第5条第1項第4号' }],
    },
    businessManager: {
      value: {
        from: '2025-10-16',
        employees: 1,
        businessAssetsYen: 30_000_000,
        language: 'B2',
        experienceYears: 3,
      },
      sources: [
        { srcId: 'SRC-452', locator: '経営・管理、主な改正内容・経過措置' },
      ],
    },
    prLanguage: {
      value: { level: 'B1', educationYears: 6 },
      sources: [{ srcId: 'SRC-114', locator: '第2の5(8) (p8)' }],
    },
    schoolAge: {
      value: {
        entryAge: 6,
        exitAge: 15,
        schoolYearStart: '04-01',
        schoolYearEnd: '03-31',
      },
      sources: [
        { srcId: 'SRC-454', locator: '学校教育法第17条' },
        { srcId: 'SRC-112', locator: '年齢計算ニ関スル法律、民法第143条' },
      ],
    },
    prFiling: {
      value: {
        selfFilingAge: 18,
        collectionAge: 16,
        photoChangeOn: '2026-06-14',
        photoAgeBefore: 16,
        photoAge: 1,
        birthRegistrationDays: 14,
      },
      sources: [
        { srcId: 'SRC-119', locator: '申請提出者' },
        { srcId: 'SRC-440', locator: '第22条第2項、第25条' },
        { srcId: 'SRC-450', locator: '家族ルート「写真」' },
        { srcId: 'SRC-447', locator: '第49条' },
      ],
    },
    evidenceYears: {
      value: {
        regular: { tax: 5, insurance: 2 },
        spouse: { tax: 3, insurance: 2 },
        child: { tax: 1, insurance: 1 },
        hsp70: { tax: 3, insurance: 2 },
        hsp80: { tax: 1, insurance: 1 },
        jSkipRetrospective: { tax: 1, insurance: 1 },
        naturalisationLocal: { tax: 5, insurance: 2, driving: 5 },
      },
      sources: [
        { srcId: 'SRC-450', locator: '概要表第7–17行、各ルートの提出書類' },
        {
          srcId: 'SRC-449',
          locator: '5-(2)「納税」「公的年金・公的医療保険」',
        },
        { srcId: 'SRC-459', locator: '納税・社会保険料' },
        { srcId: 'SRC-445', locator: '帰化のてびき「運転記録証明書」' },
      ],
    },
    fees: {
      value: {
        historicalFrom: '2024-06-10',
        firstChange: '2025-04-01',
        reform: '2026-10-01',
        refugeeChange: '2026-07-01',
        prHistorical: 8_000,
        prBeforeReform: 10_000,
        pr: 200_000,
        prReduced: 20_000,
        prCeiling: 300_000,
        acquisition: 0,
        card: 1_900,
        cardFunction: 600,
        cardCertificate: 800,
        reentryHistorical: { single: 3_000, multiple: 6_000 },
        reentryCounter: { single: 4_000, multiple: 7_000 },
        reentryOnline: { single: 3_500, multiple: 6_500 },
        paymentProcessing: 220,
        deemed: 0,
        naturalisation: 0,
        refugeeTravelBefore: 5_000,
        refugeeTravel: 4_800,
        reentryExtensionRange: [2_900, 3_100],
        refugeeExtensionRange: [2_400, 2_600],
        chinaReentryExtension: 145,
        chinaRefugeeExtension: 120,
      },
      sources: [
        { srcId: 'SRC-110', locator: '第67・68条' },
        { srcId: 'SRC-443', locator: '第25条・附則（各施行版）' },
        { srcId: 'SRC-444', locator: '料金表、Q11・減額' },
        { srcId: 'SRC-119', locator: '手数料 注4–5' },
        { srcId: 'SRC-445', locator: '帰化許可申請「手数料」' },
        { srcId: 'SRC-455', locator: '再入国許可・決済手数料' },
        { srcId: 'SRC-457', locator: '手数料' },
        {
          srcId: 'SRC-462',
          locator: '政令第1条第1項第5・6号、省令別表第5・6行',
        },
      ],
    },
    hsp: {
      value: {
        tableFrom: '2024-06-10',
        routePoints: { hsp70: 70, hsp80: 80 },
        minSalary: 3_000_000,
        education: {
          research: {
            doctorate: 30,
            businessProfessional: 20,
            graduate: 20,
            undergraduate: 10,
            none: 0,
          },
          technical: {
            doctorate: 30,
            businessProfessional: 25,
            graduate: 20,
            undergraduate: 10,
            none: 0,
          },
          management: {
            doctorate: 20,
            businessProfessional: 25,
            graduate: 20,
            undergraduate: 10,
            none: 0,
          },
        },
        experience: {
          research: [
            [7, 15],
            [5, 10],
            [3, 5],
          ],
          technical: [
            [10, 20],
            [7, 15],
            [5, 10],
            [3, 5],
          ],
          management: [
            [10, 25],
            [7, 20],
            [5, 15],
            [3, 10],
          ],
        },
        age: [
          [30, 15, 4_000_000],
          [35, 10, 5_000_000],
          [40, 5, 6_000_000],
        ],
        olderSalaryFloor: 8_000_000,
        salary: [
          [10_000_000, 40],
          [9_000_000, 35],
          [8_000_000, 30],
          [7_000_000, 25],
          [6_000_000, 20],
          [5_000_000, 15],
          [4_000_000, 10],
        ],
        managementSalary: [
          [30_000_000, 50],
          [25_000_000, 40],
          [20_000_000, 30],
          [15_000_000, 20],
          [10_000_000, 10],
        ],
        research: {
          patents: 1,
          grants: 3,
          publications: 3,
          categoriesForHigher: 2,
          researchSingle: 20,
          researchMultiple: 25,
          technical: 15,
        },
        qualifications: { two: 10, one: 5 },
        positions: { representative: 10, director: 5, none: 0 },
        bonus: {
          multiFieldGraduateDegree: 5,
          innovationEmployer: 10,
          innovationSmallEmployer: 20,
          researchSmallEmployer: 5,
          foreignQualification: 5,
          japanHigherEducation: 10,
          japaneseN1: 15,
          japaneseN2: 10,
          advancedProject: 10,
          designatedUniversity: 10,
          designatedTraining: 5,
          regionalEmployer: 10,
          designatedFinance: 10,
          personalInvestment: 5,
        },
        researchSpendPercentExclusive: 3,
        personalInvestmentYen: 100_000_000,
        bjtN1: 480,
        bjtN2: 400,
      },
      sources: [
        {
          srcId: 'SRC-448',
          locator:
            '高度専門職省令第1条第1項第1–3号各表、ポイント計算表 p3（印刷 p2）・注4–5、Q4–9',
        },
      ],
    },
    jSkip: {
      value: {
        from: '2023-04-21',
        stayYears: 1,
        specialistExperience: 10,
        managerExperience: 5,
        specialistSalary: 20_000_000,
        managerSalary: 40_000_000,
      },
      sources: [
        {
          srcId: 'SRC-449',
          locator: '特別高度人材省令本則第1・2号、附則、永住申請 5-(1)–(2)',
        },
        { srcId: 'SRC-114', locator: '第3の8 (p10)' },
      ],
    },
    exceptionalPr: {
      value: {
        regenerationYears: 3,
        zoneYears: 3,
        contributionYears: 5,
        researchActivity: 36,
        technologyActivity: 37,
        technologyExperience: 10,
        earlierPublicServiceYears: 3,
        publicServiceYears: 5,
        primeDirectorYears: 5,
        earlierThreeYearContribution: 3,
        earlierInvestmentYen: 100_000_000,
        earlierManagementYears: 5,
      },
      sources: [
        { srcId: 'SRC-113', locator: '2(4)–(5)' },
        { srcId: 'SRC-114', locator: '第3の4・5・9、第4 (p9–11)' },
        { srcId: 'SRC-453', locator: '対日貢献ガイドライン第1–8節 (p1–3)' },
        { srcId: 'SRC-458', locator: '特定活動告示第36・37号、別表第6–8' },
      ],
    },
    simplifiedNaturalisation: {
      value: {
        article6ChildYears: 3,
        article6JapanBirthYears: 3,
        article6ResidenceYears: 10,
        article8AdoptionYears: 1,
        article8StatelessYears: 3,
        selfFilingAge: 15,
        familyRegistrationMonths: 1,
      },
      sources: [
        { srcId: 'SRC-111', locator: '第6・8・18条' },
        { srcId: 'SRC-446', locator: '第2条' },
        { srcId: 'SRC-447', locator: '第102条の2' },
      ],
    },
    reentry: {
      value: {
        ordinaryYears: 5,
        ordinaryExtendedYears: 6,
        specialPermanentYears: 6,
        specialPermanentExtendedYears: 7,
        specialPermanentDeemedYears: 2,
        extensionYears: 1,
        deemedExcludedMonths: 3,
        refugeeTravelMinYears: 1,
        refugeeTravelMaxYears: 5,
        refugeeEntryMinMonths: 3,
      },
      sources: [
        {
          srcId: 'SRC-110',
          locator: '第19条の3、第26条、第26条の2、第61条の2の15',
        },
        { srcId: 'SRC-442', locator: '第23条第1–2項' },
      ],
    },
  },
} as const;
