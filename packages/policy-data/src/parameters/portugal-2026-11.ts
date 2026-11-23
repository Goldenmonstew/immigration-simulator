import type { Parameter } from '../types';

// Portugal pilot (phase 19, task 71): the nationality law (Lei 37/81) as
// amended by Lei Orgânica 1/2026 (SRC-120) and its earlier text (SRC-121),
// and the foreigners law (Lei 23/2007, SRC-123) with its regulation
// (SRC-124, SRC-125).
const LEI_62_2026 =
  'https://files.diariodarepublica.pt/1s/2026/09/17600/0006000111.pdf';

export const portugal2026_11 = {
  asOf: '2026-11-22',
  values: {
    // Naturalisation: years of legal residence by nationality.
    nationalityYears: {
      value: { cplp: 7, eu: 7, eea: 10, other: 10, stateless: 4 },
      sources: [
        { srcId: 'SRC-120', locator: 'art. 6 n.º 1 b) (p2), n.º 3 (p3)' },
      ],
    },
    // The counted periods must fall within this many years.
    nationalityIntervalYears: {
      value: { cplp: 9, eu: 9, eea: 12, other: 12, stateless: 6 },
      sources: [{ srcId: 'SRC-120', locator: 'art. 15 n.º 3 (p5)' }],
    },
    // Applications pending on this date keep the earlier text of the law.
    lawInForce: {
      value: '2026-05-19',
      sources: [
        { srcId: 'SRC-120', locator: 'LO 1/2026 art. 7 n.º 2, art. 8 (p7)' },
        {
          srcId: 'SRC-127',
          locator: 'Regulamentação complementar',
        },
      ],
    },
    // The earlier text (LO 1/2024) applies to applications made from this
    // date until the current law came into force.
    oldTextFrom: {
      value: '2024-04-01',
      sources: [
        { srcId: 'SRC-121', locator: 'LO 1/2024 art. 9 (p5)' },
        { srcId: 'SRC-122', locator: 'fundamentação D.5' },
      ],
    },
    // Earlier text (LO 1/2024): years, counted from the residence
    // application, within this interval.
    oldNationalityYears: {
      value: 5,
      sources: [{ srcId: 'SRC-121', locator: 'art. 6 n.º 1 b) (p8)' }],
    },
    oldIntervalYears: {
      value: 15,
      sources: [{ srcId: 'SRC-121', locator: 'art. 15 n.º 3–4 (p13)' }],
    },
    // Permanent residence (art. 80): years holding temporary residence.
    permanentYears: {
      value: 5,
      sources: [{ srcId: 'SRC-123', locator: 'art. 80 n.º 1 a) (p67)' }],
    },
    // A temporary permit may be cancelled after an absence of this many
    // months in a row, or this many in all, while it is valid...
    temporaryAbsenceMonths: {
      value: 6,
      sources: [
        { srcId: 'SRC-123', locator: 'art. 85 n.º 2 a) (p69)' },
        {
          srcId: 'SRC-123',
          locator: 'Lei 62/2026 art. 4 (art. 85, p8)',
          url: LEI_62_2026,
        },
      ],
    },
    temporaryAbsenceTotalMonths: {
      value: 8,
      sources: [{ srcId: 'SRC-123', locator: 'art. 85 n.º 2 a) (p69)' }],
    },
    // ...and a permanent one after this many months in a row, or this many
    // within any period of this many years.
    permanentAbsenceMonths: {
      value: 24,
      sources: [{ srcId: 'SRC-123', locator: 'art. 85 n.º 2 b) (p69)' }],
    },
    permanentAbsenceTotalMonths: {
      value: 30,
      sources: [{ srcId: 'SRC-123', locator: 'art. 85 n.º 2 b) (p69)' }],
    },
    permanentAbsenceWindowYears: {
      value: 3,
      sources: [{ srcId: 'SRC-123', locator: 'art. 85 n.º 2 b) (p69)' }],
    },
    // EU long-term residence (art. 126): years immediately before applying,
    // with each absence under this many months...
    longTermYears: {
      value: 5,
      sources: [{ srcId: 'SRC-123', locator: 'art. 126 n.º 1 a) (p101)' }],
    },
    longTermSingleAbsenceMonths: {
      value: 6,
      sources: [{ srcId: 'SRC-123', locator: 'art. 126 n.º 4 (p101)' }],
    },
    // ...and no more than this many months in all.
    longTermTotalAbsenceMonths: {
      value: 10,
      sources: [{ srcId: 'SRC-123', locator: 'art. 126 n.º 4 (p101)' }],
    },
    // EU long-term resident status is lost after this many months in a row
    // outside the EU, or this many years in a row outside Portugal.
    longTermLossEuMonths: {
      value: 12,
      sources: [{ srcId: 'SRC-123', locator: 'art. 131 n.º 1 c) (p103)' }],
    },
    longTermLossYears: {
      value: 6,
      sources: [{ srcId: 'SRC-123', locator: 'art. 131 n.º 1 e) (p103)' }],
    },
    // Golden visa (ARI, art. 90-A): each renewal lasts this many years.
    goldenVisaRenewalYears: {
      value: 2,
      sources: [{ srcId: 'SRC-123', locator: 'art. 90-A n.º 2 (p72)' }],
    },
    // The investment is kept for this many years from the grant.
    goldenVisaInvestmentYears: {
      value: 5,
      sources: [
        { srcId: 'SRC-123', locator: 'art. 3 n.º 1 d) (p27)' },
        { srcId: 'SRC-124', locator: 'art. 65-B (p3)' },
      ],
    },
    // Minimum stays for renewal: this many days in the first year, then
    // this many days in each following period of two years.
    goldenVisaFirstPeriodYears: {
      value: 1,
      sources: [{ srcId: 'SRC-124', locator: 'art. 65-C a) (p3)' }],
    },
    goldenVisaFirstPeriodDays: {
      value: 7,
      sources: [{ srcId: 'SRC-124', locator: 'art. 65-C a) (p3)' }],
    },
    goldenVisaLaterPeriodYears: {
      value: 2,
      sources: [{ srcId: 'SRC-124', locator: 'art. 65-C b) (p3)' }],
    },
    goldenVisaLaterPeriodDays: {
      value: 14,
      sources: [
        { srcId: 'SRC-124', locator: 'art. 65-C b) (p3)' },
        // Cross-check only, not archived (SRC-126 notes).
        {
          srcId: 'SRC-126',
          locator: 'Perguntas frequentes ARI, n.º 24',
          url: 'https://aima.gov.pt/pt/a-aima/perguntas-frequentes-faqs/autorizacao-de-residencia-para-investimento-ari',
        },
      ],
    },
    // The right of residence lasts this many months after a temporary
    // residence card expires.
    residenceRightMonths: {
      value: 6,
      sources: [
        {
          srcId: 'SRC-126',
          locator: 'Esclarecimento: Direito de Residência',
          url: 'https://aima.gov.pt/pt/noticias/direito-de-residencia',
        },
        {
          srcId: 'SRC-125',
          locator: 'Decreto Regulamentar 84/2007 art. 63.º n.º 14',
        },
      ],
    },
    // Renewal: apply no later than this many days before expiry...
    renewalDeadlineDays: {
      value: 30,
      sources: [
        { srcId: 'SRC-123', locator: 'art. 78 n.º 1 (p66)' },
        {
          srcId: 'SRC-123',
          locator: 'Lei 62/2026 art. 4 (art. 78, p7)',
          url: LEI_62_2026,
        },
      ],
    },
    // ...and from this many days before it (regulation; consolidated text
    // only, PD-149).
    renewalWindowDays: {
      value: 90,
      sources: [
        {
          srcId: 'SRC-125',
          locator: 'Decreto Regulamentar 84/2007 art. 63.º n.º 16',
        },
      ],
    },
  },
} satisfies {
  asOf: string;
  values: Record<string, Parameter<number | string | Record<string, number>>>;
};
