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
