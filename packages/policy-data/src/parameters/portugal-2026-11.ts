import type { Parameter, SourceRef } from '../types';

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

// Task 92 snapshots. Keep the time-only parameter set and its policy date intact.
function input<T>(
  value: T,
  srcId: string,
  locator: string,
  url?: string,
): Parameter<T> {
  const source: SourceRef = { srcId, locator };
  if (url) source.url = url;
  return { value, sources: [source] };
}

const nationality = 'SRC-120';
const formerNationality = 'SRC-121';
const foreigners = 'SRC-123';
const freeMovement = 'SRC-478';
const feeTable = 'SRC-476';
const moreHousing =
  'https://files.diariodarepublica.pt/1s/2023/10/19400/0000200050.pdf';
const civilCode =
  'https://files.diariodarepublica.pt/1s/1977/11/27301/00010050.pdf';

export const portugalFull2026_11 = {
  asOf: '2026-11-23',
  values: {
    adulthood: input(
      18,
      'SRC-487',
      'DL 496/1977 art. 1 (Código Civil art. 130)',
      civilCode,
    ),
    emancipationReform: input('2025-04-02', 'SRC-487', 'Lei 39/2025 arts. 6–8'),
    nationalityPrisonYears: input(
      3,
      nationality,
      'Lei 37/81 art. 6(1)(f), (14)–(16), pp2–4',
    ),
    oldNationalityPrisonYears: input(
      3,
      formerNationality,
      'Lei 37/81 arts. 6(1)(d), 9(1)(b), pp8–9',
    ),
    basicPortuguese: input(
      'A2',
      'SRC-480',
      'Portaria 183/2020 art. 9, as amended by Portaria 184/2022',
    ),
    oldPortugueseEvidence: input(
      { schoolYears: 2, dualCertificateHours: 100, accommodatedAge: 60 },
      'SRC-470',
      'RNP art. 25(2), (5)–(9)',
    ),
    adultNationalityFee: input(
      { from: '2012-10-01', eur: 250 },
      'SRC-488',
      'arts. 2, 19 (RERN art. 18(2.2.1))',
    ),
    statelessNationalityFee: input(
      0,
      nationality,
      'Lei 37/81 art. 6(3), (12), p3',
    ),
    cipleFee: input(
      95,
      'SRC-482',
      'Detalhes do Exame, price observed 2026-11-23',
    ),
    panFees: input(
      { from: '2014-10-23', registration: 65, inspection: 20, review: 25 },
      'SRC-489',
      'n.os 1–5',
    ),
    householdWeights: input(
      { firstAdult: 1, otherAdult: 0.5, dependant: 0.3 },
      'SRC-473',
      'Portaria 1563/2007 art. 2',
    ),
    residenceMeansMonths: input(
      12,
      'SRC-473',
      'Portaria 1563/2007 arts. 8, 11',
    ),
    purposeMeans: input(
      { ordinaryMonths: 12, housingFactor: 0.5, housingAndMealsFactor: 0.1 },
      'SRC-473',
      'Portaria 1563/2007 arts. 5(1)–(6), 7; reductions apply to the specified categories',
    ),
    incomeEvidenceMonths: input(
      { employee: 3, serviceContract: 6 },
      'SRC-475',
      'Forma de comprovar',
    ),
    minimumWage2026: input(
      { mainland: 920, from: '2026-01-01', until: '2027-01-01' },
      'SRC-474',
      'DL 139/2025 arts. 2–3, 7',
    ),
    madeiraMinimumWage: input(
      980,
      'SRC-474',
      'DLR 1/2026/M arts. 2, 4',
      'https://files.diariodarepublica.pt/1s/2026/02/02300/0001400015.pdf',
    ),
    azoresMinimumWage: input(
      966,
      'SRC-474',
      'Resolução 26/2026, regional comparison, p64',
      'https://files.diariodarepublica.pt/gratuitos/1s/2026/07/14600.pdf',
    ),
    employeeSocialSecurityRate: input(
      0.11,
      'SRC-474',
      'Lei 110/2009 annex art. 53, gazette PDF p12',
      'https://files.diariodarepublica.pt/gratuitos/1s/2009/09/18000.pdf',
    ),
    permanentCrimeWindowYears: input(
      5,
      foreigners,
      'Lei 23/2007 art. 80(1)(b), p67',
    ),
    permanentPrisonYears: input(
      1,
      foreigners,
      'Lei 23/2007 art. 80(1)(b), p67',
    ),
    renewalReceiptDays: input(60, foreigners, 'Lei 23/2007 art. 78(7), p67'),
    renewalReleaseDays: input(30, foreigners, 'Lei 23/2007 art. 79(2), p67'),
    renewalPrisonYears: input(1, foreigners, 'Lei 23/2007 art. 78(2)(d), p66'),
    ariPunishableYears: input(
      1,
      foreigners,
      'Lei 23/2007 art. 77(1)(g), pp65–66',
    ),
    generalRefusal: input(
      { prisonYears: 1, repeatedSentences: 2 },
      'SRC-491',
      'Lei 53/2023 art. 2 (Lei 23/2007 art. 81(3), p10)',
    ),
    blueCard: input(
      {
        from: '2023-10-29',
        euYears: 5,
        portugalYears: 2,
        singleAbsenceMonths: 12,
        totalAbsenceMonths: 18,
        lossEuMonths: 24,
      },
      'SRC-491',
      'Lei 53/2023 arts. 2, 10, gazette p24 (Lei 23/2007 arts. 121-I, 121-J)',
    ),
    longTermRecoveryDecisionMonths: input(
      3,
      foreigners,
      'Lei 23/2007 art. 131(4)–(5), p104',
    ),
    ariEntryDays: input(90, foreigners, 'Lei 23/2007 art. 90-A(1)(b)–(c), p72'),
    ariDocumentAge: input(
      { otherCountryYears: 1, criminalMonths: 3, complianceDays: 45 },
      'SRC-126',
      'ARI · Documentos e requisitos gerais',
    ),
    ariJobs: input(10, foreigners, 'Lei 23/2007 art. 3(1)(d)(ii), p27'),
    ariResearchEur: input(
      500_000,
      foreigners,
      'Lei 23/2007 art. 3(1)(d)(v), p27',
    ),
    ariCultureEur: input(
      250_000,
      foreigners,
      'Lei 23/2007 art. 3(1)(d)(vi), p27',
    ),
    ariFund: input(
      { eur: 500_000, maturityYears: 5, portugalShare: 0.6 },
      foreigners,
      'Lei 56/2023 art. 44 (Lei 23/2007 art. 3(1)(d)(vii))',
      moreHousing,
    ),
    ariCompany: input(
      { eur: 500_000, permanentJobs: 5, maintainedJobs: 10, jobYears: 3 },
      foreigners,
      'Lei 56/2023 art. 44 (Lei 23/2007 art. 3(1)(d)(viii))',
      moreHousing,
    ),
    ariLowDensity: input(
      { reduction: 0.2, peoplePerKm2: 100, gdpShare: 0.75 },
      foreigners,
      'Lei 56/2023 art. 44 (Lei 23/2007 art. 3(2)–(3))',
      moreHousing,
    ),
    ariInvestmentReform: input(
      '2023-10-07',
      foreigners,
      'Lei 56/2023 arts. 42–44, 55',
      moreHousing,
    ),
    ariHistoricalInvestment: input(
      {
        capitalEur: 1_500_000,
        propertyEur: 500_000,
        renovationEur: 350_000,
        buildingYears: 30,
      },
      foreigners,
      'Lei 18/2022 annex art. 3(1)(d)(i), (iii), (iv), p27',
    ),
    freeMovementDescendantAge: input(
      21,
      freeMovement,
      'Lei 37/2006 art. 2(e)(iii), p5717',
    ),
    freeMovementYears: input(
      5,
      freeMovement,
      'Lei 37/2006 arts. 10(1)–(2), 13, pp5719–5720',
    ),
    freeMovementAbsence: input(
      {
        ordinaryMonths: 6,
        ordinaryWindowYears: 1,
        justifiedMonths: 12,
        maxJustifiedAbsences: 1,
        lossYears: 2,
      },
      freeMovement,
      'Lei 37/2006 art. 10(4)–(5), p5719',
    ),
    freeMovementFamilyCardAbsenceMonths: input(
      30,
      freeMovement,
      'Lei 37/2006 art. 17(4), p5721',
    ),
    freeMovementRegistration: input(
      { initialMonths: 3, registrationDays: 30 },
      freeMovement,
      'Lei 37/2006 arts. 6, 14(1), 15(1)–(2), pp5718–5720',
    ),
    workerEarlyResidence: input(
      {
        workMonths: 12,
        retirementResidenceYears: 3,
        disabilityResidenceYears: 2,
        crossBorderYears: 3,
        selfEmployedAge: 60,
      },
      freeMovement,
      'Lei 37/2006 art. 11(1), (4)–(6), pp5719–5720',
    ),
    workerFamilyResidenceYears: input(
      2,
      freeMovement,
      'Lei 37/2006 art. 12(2)(a), p5720',
    ),
    freeMovementProtectionYears: input(
      10,
      freeMovement,
      'Lei 37/2006 art. 24(3), p5722',
    ),
    relationshipYears: input(3, nationality, 'Lei 37/81 art. 3(1), (3), p9'),
    partnerStatementMonths: input(
      3,
      'SRC-483',
      'Documentos necessários · união de facto',
    ),
    oppositionYears: input(
      { relationship: 6, period: 2 },
      nationality,
      'Lei 37/81 arts. 9(2), 10(1), p12',
    ),
    oldOppositionYears: input(
      { relationship: 6, period: 1 },
      formerNationality,
      'Lei 37/81 arts. 9(2)–(3), 10(1), pp9–10',
    ),
    aimaFeeDates: input(
      { from: '2026-03-01', until: '2027-03-01' },
      'SRC-477',
      'Portaria 307/2023 art. 3 and SRC-476 effective-date notice',
    ),
    // Each named fee contains the exact published left and right columns.
    aimaOrdinaryFees: input(
      {
        analysis: [133, 99.8],
        permanent: [351.1, 263.4],
        replace: [61.9, 46.3],
        renew: [114.3, 85.8],
      },
      feeTable,
      'III.1(a), (c), (e), (f), p2',
    ),
    aimaBlueFees: input(
      { analysis: [169.2, 126.9], renew: [160.5, 120.4] },
      feeTable,
      'III.2(a)–(b), p2',
    ),
    aimaLongTermFees: input(
      { analysis: [169.2, 126.9], card: [160.5, 120.4], protected: 0 },
      feeTable,
      'VI.1(a)–(f), p4',
    ),
    aimaInvestmentFees: input(
      {
        analysis: [842.8, 632.1],
        grant: [8418.9, 6314.2],
        renew: [4210.3, 3157.8],
        permanent: [11786.7, 8840],
        replace: [5894.1, 4420.7],
      },
      feeTable,
      'III.3(a)–(e), (i), pp2–3',
    ),
    aimaFeeReductions: input(
      { eligibleDigital: 0.25, assistedInPerson: 0.1 },
      feeTable,
      'XIV · Reduções de taxas',
    ),
    freeMovementFees: input(
      {
        from: '2024-02-21',
        age: 25,
        infantAge: 1,
        olderDigital: 15,
        olderInPerson: 18,
        youngerDigital: 12.5,
        youngerInPerson: 15,
        infantInPerson: 0,
        urgentOlder: 53,
        urgentYounger: 50,
        addressOnly: 3,
      },
      'SRC-479',
      'Portaria 13/2024 art. 2 and Declaração de Retificação 32/2024',
    ),
  },
};
