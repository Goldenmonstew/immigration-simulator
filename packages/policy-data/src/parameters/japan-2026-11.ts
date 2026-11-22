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
          srcId: 'SRC-112',
          locator: '年齢計算ニ関スル法律',
          url: 'https://laws.e-gov.go.jp/law/135AC1000000050',
        },
      ],
    },
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
  values: Record<string, Parameter<number | string | Record<string, number>>>;
};
