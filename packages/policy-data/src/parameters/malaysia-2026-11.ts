import type { Parameter, RuleSetId, SourceRef } from '../types';

// Malaysia full version (phase 20, task 113). Permanent residence (Permit
// Masuk) follows the Immigration Act (SRC-503) and the 2025 guideline
// (SRC-505, SRC-506); citizenship follows the unamended Part III of the
// Federal Constitution (SRC-500), because Act A1752 (SRC-501) is not yet in
// force (SRC-502). PDF locators are physical pages.

const guide = (locator: string): SourceRef => ({ srcId: 'SRC-505', locator });
const rep = (locator: string): SourceRef => ({ srcId: 'SRC-506', locator });
const constitution = (locator: string): SourceRef => ({
  srcId: 'SRC-500',
  locator,
});

export const malaysiaFull2026_11 = {
  asOf: '2026-11-24',
  ruleSetId: 'my.current-law-2026-11',
  values: {
    // Permit Masuk: passport validity at application, for every category.
    prPassportMonths: {
      value: 12,
      sources: [
        guide('§5.1(a) p18'),
        guide('§5.2(a) p19'),
        guide('§5.3(b) p20'),
        guide('§5.4(a) p21'),
      ],
    },
    // Wife of a citizen: years married, and more than this many months on
    // the wife-of-citizen social visit pass, still valid when applying.
    prWife: {
      value: { marriageYears: 3, ltsvpMonths: 12 },
      sources: [guide('§5.1(c)–(d) p18')],
    },
    // Husband of a citizen: years married, and years on the husband-of-citizen
    // pass without a break longer than `maxGapMonths`.
    prHusband: {
      value: { marriageYears: 5, ltsvpYears: 5, maxGapMonths: 6 },
      sources: [guide('§5.2(c)–(d) p19')],
    },
    // Biological child of a citizen: under this age, more than this many
    // months on a qualifying pass.
    prChild: {
      value: { underAge: 18, passMonths: 12 },
      sources: [guide('§5.3(a), (d) p20')],
    },
    // Fully foreign national (WAS): years on qualifying passes, breaks of at
    // most `maxGapMonths`; spouse and children under `childUnderAge` hold a
    // pass for more than `dependantPassMonths`.
    prWas: {
      value: {
        passYears: 5,
        maxGapMonths: 6,
        dependantPassMonths: 12,
        childUnderAge: 18,
      },
      sources: [guide('§5.4(b), (e)–(f) p21')],
    },
    prReferees: {
      value: 2,
      sources: [guide('附录 C1 第 10 项 p59'), guide('附录 C3 第 6 项 p61')],
    },
    prAppealDays: {
      value: 30,
      sources: [
        { srcId: 'SRC-503', locator: 's.10(3) p18' },
        guide('§8.1 p25'),
      ],
    },
    prReapplyYears: { value: 1, sources: [guide('§8.4 p25')] },
    // Target time from the acknowledgement of receipt to a result.
    prProcessingMonths: { value: 6, sources: [guide('§7.1 p24')] },
    prCollection: {
      value: { approvalValidMonths: 6, collectionDays: 30 },
      sources: [guide('§7.4 p24'), guide('§10.2, §10.5 p28')],
    },
    // Absence after which a new Permit Masuk notice stamp is deferred.
    prAbsenceMonths: { value: 6, sources: [guide('§11.6 p29')] },
    prFeeRm: {
      value: 120,
      sources: [guide('§9.1 p26'), rep('§11.1 p25')],
    },
    // Permit Masuk deposit (Wang Cagaran) by nationality (ISO 3166-1 alpha-2,
    // or 'stateless') for the fully foreign category (Appendix B3) and REP
    // family (Lampiran 9, the same table); refundable after holding the
    // Permit Masuk for `refundYears`.
    prDepositRm: {
      value: {
        otherCountries: 1500,
        refundYears: 2,
        byNationality: {
          US: 2000,
          CA: 2000,
          NG: 2000,
          CN: 1500,
          VN: 1500,
          YE: 1500,
          stateless: 1500,
          JP: 1000,
          KR: 1000,
          MO: 1000,
          BD: 750,
          IN: 750,
          PK: 750,
          PH: 750,
          MM: 750,
          LK: 750,
          NP: 750,
          ID: 500,
          TH: 300,
          SG: 200,
        } as Record<string, number>,
      },
      sources: [
        guide('附录 B3 p57'),
        guide('§9.2–9.3 p26'),
        rep('§11.3–11.4 p25'),
        rep('Lampiran 9 p36'),
      ],
    },
    // Returning Expert Programme (REP) family members.
    rep: {
      value: {
        wifeMarriageYears: 3,
        husbandMarriageYears: 5,
        childUnderAge: 18,
        passportMonths: 12,
        referees: 2,
        refereeMinAge: 21,
        ltsvpFeePerYearRm: 90,
        prFeeRm: 120,
      },
      sources: [
        rep('§4, §5.1–5.3 p16'),
        rep('§5.4–5.7 p17'),
        rep('§11.1 p25'),
        { srcId: 'SRC-526', locator: '权益第 04 项' },
      ],
    },
    // Residence Pass (Immigration Regulations 1963 reg. 16A): Category 3
    // citizen family, Category 4 permanent resident family.
    residencePass: {
      value: {
        passportMonths: 6,
        citizenFamilyYears: 3,
        prFamilyYears: 5,
        childMaxAge: 18,
        sponsorMinAge: 21,
        feeRm: 500,
        feeYears: 5,
      },
      sources: [
        {
          srcId: 'SRC-508',
          locator:
            'Residence Pass Categories、Conditions to apply、Payment Rates',
        },
      ],
    },
    // Article 19(1) and (3): age, residence within the window including the
    // months immediately before applying; JPN referees.
    naturalisation: {
      value: {
        minAge: 21,
        residenceYears: 10,
        windowYears: 12,
        recentMonths: 12,
        referees: 2,
        refereeMinAge: 21,
        refereeKnownYears: 10,
      },
      sources: [
        constitution('Art. 19(1) p44'),
        constitution('Art. 19(3) p46'),
        { srcId: 'SRC-512', locator: 'Conditions；清单第 4 项' },
      ],
    },
    // Second Schedule Part III s.20(1)(a): absences shorter than this count
    // as residence.
    shortAbsenceMonths: {
      value: 6,
      sources: [constitution('附表二第三部分 s.20(1)–(3) p372–373')],
    },
    // Article 15(1): residence throughout the years before applying.
    // Article 26(2): marriage dissolved within this many years of the
    // marriage, other than by death.
    wifeRegistration: {
      value: { residenceYears: 2, dissolutionYears: 2 },
      sources: [constitution('Art. 15(1) p39'), constitution('Art. 26(2) p54')],
    },
    // Article 18(1): anyone registered at this age or over takes the First
    // Schedule oath first.
    registrationOathAge: {
      value: 18,
      sources: [constitution('Art. 18(1) p42')],
    },
    // Article 15(2) and 15A: under this age on the application date.
    childRegistration: {
      value: { underAge: 21 },
      sources: [
        constitution('Art. 15(2) p39'),
        constitution('Art. 15A p40'),
        { srcId: 'SRC-514', locator: 'Conditions / Syarat' },
      ],
    },
    citizenshipFeesRm: {
      value: {
        application: 10,
        naturalisationCertificate: 300,
        naturalisationCertificateMerdeka: 200,
        merdekaDay: '1957-08-31',
        wifeCertificate: 300,
        childCertificate: 100,
      },
      sources: [
        { srcId: 'SRC-512', locator: 'Fees' },
        { srcId: 'SRC-513', locator: 'Fees' },
        { srcId: 'SRC-514', locator: 'Fees / Bayaran' },
      ],
    },
    // Article 25(1)(c), 25(2): deprivation of citizenship by naturalisation.
    deprivation: {
      value: { withinYears: 5, prisonMonths: 12, fineRm: 5000, abroadYears: 5 },
      sources: [
        constitution('Art. 25(1)(c) p52'),
        constitution('Art. 25(2) p54'),
      ],
    },
    // Act A1752: assented and gazetted, not yet in force on `asOf`. New
    // Article 18(1a): a minor registered takes the oath within `oathMonths`
    // of turning 18.
    constitutionAmendment2025: {
      value: {
        royalAssent: '2025-03-07',
        gazetted: '2025-03-20',
        newMinAge: 18,
        oathMonths: 48,
      },
      sources: [
        {
          srcId: 'SRC-501',
          locator: 's.1(2) p3、ss.2–3 p3–4、s.5 p4、s.6 p5、s.8 p6、s.12 p8',
        },
        { srcId: 'SRC-502', locator: '修订表 A1752 COMMENCEMENTREMARK' },
      ],
    },
    // Long-term social visit pass for a citizen's spouse.
    spouseLtsvp: {
      value: { minMonths: 6, maxYears: 5, feePerYearRm: 90 },
      sources: [
        { srcId: 'SRC-509', locator: 'LTSVP Introduction' },
        rep('§11.1 p25'),
      ],
    },
    // Security bond by nationality. The Immigration table and MDEC's table
    // of the same name agree on `byNationality` and the default.
    // `mdecOnly` is MDEC's: the Immigration table lists Japan, South Korea,
    // Macao and Hong Kong under RM1,000 and again under RM750, and does not
    // list the seven countries MDEC puts at RM750.
    securityBondRm: {
      value: {
        otherCountries: 1500,
        byNationality: {
          CA: 2000,
          US: 2000,
          CO: 2000,
          AO: 2000,
          BF: 2000,
          BI: 2000,
          CM: 2000,
          CF: 2000,
          CG: 2000,
          CD: 2000,
          CI: 2000,
          DJ: 2000,
          GQ: 2000,
          ER: 2000,
          ET: 2000,
          GW: 2000,
          GH: 2000,
          LR: 2000,
          ML: 2000,
          MZ: 2000,
          NE: 2000,
          NG: 2000,
          RW: 2000,
          EH: 2000,
          ID: 500,
          TH: 300,
          SG: 200,
        } as Record<string, number>,
        mdecOnly: {
          JP: 1000,
          KR: 1000,
          MO: 1000,
          HK: 1000,
          BD: 750,
          IN: 750,
          MM: 750,
          NP: 750,
          PK: 750,
          PH: 750,
          LK: 750,
        } as Record<string, number>,
      },
      sources: [
        { srcId: 'SRC-510', locator: '费率表及 NOTE' },
        { srcId: 'SRC-528', locator: 'v11 Section D Q2 p15' },
      ],
    },
    // MM2H (2024 conditions). SEZ/SFZ deposits differ below and from
    // `sezOlderAge`.
    mm2hAge: {
      value: { platinum: 25, gold: 25, silver: 25, sez: 21, sezOlderAge: 50 },
      sources: [
        { srcId: 'SRC-517', locator: '一般条件 (ii) p1' },
        { srcId: 'SRC-518', locator: '年龄、定存 p1' },
      ],
    },
    mm2hDepositUsd: {
      value: {
        platinum: 1_000_000,
        gold: 500_000,
        silver: 150_000,
        sez: 65_000,
        sezOlder: 32_000,
        withdrawalPercent: 50,
      },
      sources: [
        { srcId: 'SRC-517', locator: '财务条件 p2、p7、p12' },
        { srcId: 'SRC-518', locator: '财务条件 p1' },
      ],
    },
    mm2hParticipationFeeRm: {
      value: { platinum: 200_000, gold: 3_000, silver: 1_000, sez: 1_000 },
      sources: [
        { srcId: 'SRC-517', locator: '参与费 p2、p7、p12' },
        { srcId: 'SRC-518', locator: '参与费 p1–2' },
      ],
    },
    // Minimum residence value, years before resale, years after the pass
    // endorsement to complete the purchase (Platinum, Gold, Silver).
    mm2hProperty: {
      value: {
        platinum: 2_000_000,
        gold: 1_000_000,
        silver: 600_000,
        resaleYears: 10,
        purchaseYears: 1,
      },
      sources: [
        { srcId: 'SRC-517', locator: '购房 p2–3、p7–8、p12–13' },
        { srcId: 'SRC-518', locator: '购房 p2' },
        { srcId: 'SRC-522', locator: '第 A–B 点 p1' },
      ],
    },
    // Days in Malaysia per year; the website exempts those aged `exemptAge`
    // or over.
    mm2hStay: {
      value: { days: 90, exemptAge: 50 },
      sources: [
        { srcId: 'SRC-517', locator: '最低停留 p3、p8、p13' },
        { srcId: 'SRC-518', locator: '最低停留 p2' },
        { srcId: 'SRC-524', locator: '申请规定 03；总表 Minimum Days' },
      ],
    },
    mm2hPassYears: {
      value: { platinum: 20, gold: 15, silver: 5, sez: 10 },
      sources: [
        { srcId: 'SRC-517', locator: '准证 p4、p9、p14' },
        { srcId: 'SRC-518', locator: '准证 p3' },
      ],
    },
    // Renewed every `everyYears` once the maximum term is reached.
    mm2hRenewalFeeRm: {
      value: {
        platinum: 5_000,
        gold: 3_000,
        silver: 1_500,
        sez: 300,
        everyYears: 5,
      },
      sources: [
        { srcId: 'SRC-517', locator: '续签 p6、p11、p16' },
        { srcId: 'SRC-518', locator: '续签 p5' },
        { srcId: 'SRC-524', locator: '总表 Renewal Fee' },
      ],
    },
    // Children under `childUnconditionalAge`; older children up to
    // `childMaxAge` if single and not working.
    mm2hDependants: {
      value: {
        childUnconditionalAge: 21,
        childMaxAge: 34,
        childMaxAgeOther: 35,
      },
      sources: [
        { srcId: 'SRC-517', locator: '受养人 p4、p9、p14' },
        { srcId: 'SRC-521', locator: 'Dependents' },
      ],
    },
    // Good conduct certificates for the principal and dependants aged
    // `minAge` or over, with at least `validMonths` left; health insurance
    // for those aged `insuranceMaxAge` or under.
    mm2hScreening: {
      value: { minAge: 18, validMonths: 6, insuranceMaxAge: 60 },
      sources: [
        { srcId: 'SRC-519', locator: '第 5 项' },
        { srcId: 'SRC-520', locator: 'p12（印刷 p22–23）、p26' },
        { srcId: 'SRC-522', locator: '第 E(i) 点 p2' },
      ],
    },
    // Immigration Regulations Third Schedule V(vii)–(viia) from 2022-03-16.
    mm2hPassFeesRm: {
      value: {
        principalPerYear: 500,
        principalIssuance: 5_000,
        dependantPerYear: 500,
        dependantIssuance: 2_500,
      },
      sources: [
        { srcId: 'SRC-504', locator: 'reg. 2，附表三 V(vii)–(viia) p5–6' },
        { srcId: 'SRC-524', locator: '总表 Processing Fee' },
      ],
    },
    mm2hSystemFeeRm: {
      value: { amount: 500, from: '2025-08-01' },
      sources: [{ srcId: 'SRC-523', locator: '公告正文' }],
    },
    // Residence Pass-Talent eligibility and term.
    rpt: {
      value: {
        workYears: 3,
        epValidityMonths: 3,
        taxYears: 2,
        basicSalaryRm: 15_000,
        experienceYears: 5,
        passYears: 10,
        dependantUnderAge: 18,
      },
      sources: [{ srcId: 'SRC-525', locator: 'Eligibility 及权益 01–04' }],
    },
    // DE Rantau: the tech threshold rose in FAQ version 11.
    deRantauIncomeUsd: {
      value: {
        tech: 36_000,
        techFrom: '2026-11-01',
        techBefore: 24_000,
        nonTech: 60_000,
      },
      sources: [
        { srcId: 'SRC-528', locator: 'v11 Section A Q3 p1' },
        {
          srcId: 'SRC-528',
          locator: 'v10 Section A Q3 p1',
          url: 'https://www.mdec.my/api/media/file/DE-Rantau_Pass_FAQ_v10.pdf',
        },
      ],
    },
    deRantau: {
      value: {
        minAge: 18,
        passportMonths: 14,
        contractMonths: 3,
        maxMonths: 48,
        excludedNationality: 'IL',
        initialMinMonths: 3,
        initialMaxMonths: 12,
        renewals: 3,
        renewalMonths: 12,
        childUnderAge: 18,
        processingFeeRm: 1_080,
        dependantFeeRm: 540,
        passFeeQuarterRm: 90,
        passFeeQuarterMonths: 3,
        passFeeYearRm: 360,
      },
      sources: [
        {
          srcId: 'SRC-528',
          locator: 'v11 Section A Q4、Q7–Q10 p2、Q13、Q16 p3',
        },
        { srcId: 'SRC-528', locator: 'v11 Section B Q3 p4' },
        { srcId: 'SRC-528', locator: 'v11 Section D Q1 p14' },
      ],
    },
    // Employment Pass minimum basic monthly salary by category: revised
    // policy for applications from `revisedFrom`.
    employmentPass: {
      value: {
        revisedFrom: '2026-06-01',
        successionPlanFrom: '2027-01-01',
        revised: { category1: 20_000, category2: 10_000, category3: 5_000 },
        previous: { category1: 10_000, category2: 5_000, category3: 3_000 },
        minPassMonths: 1,
        maxPassMonths: 60,
        childUnderAge: 18,
      },
      sources: [
        { srcId: 'SRC-527', locator: 'At a Glance、EP 特征 p3' },
        { srcId: 'SRC-527', locator: '主要变化 p4' },
        { srcId: 'SRC-527', locator: '雇佣期 p5' },
        { srcId: 'SRC-527', locator: '分类表 p6' },
      ],
    },
  },
} satisfies {
  asOf: string;
  ruleSetId: RuleSetId;
  values: Record<string, Parameter<unknown>>;
};
