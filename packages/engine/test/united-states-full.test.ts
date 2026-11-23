import { describe, expect, test } from 'vitest';
import { evaluateUnitedStates, evaluateUnitedStatesFull } from '../src';
import type {
  UsAdmissionAnswers,
  UsConditionsAnswers,
  UsCrime,
  UsEmploymentAnswers,
  UsFamilyAnswers,
  UsFullRequest,
  UsHumanitarianAnswers,
  UsMilitaryAnswers,
  UsNaturalizationAnswers,
  UsRequest,
  UsSupportAnswers,
  UsTravelAnswers,
} from '../src';

const time: UsRequest = {
  simulationDate: '2026-11-23',
  dateOfBirth: '1990-05-01',
  permanentResident: '2018-03-01',
  conditional: 'none',
  stateResidenceFrom: '2018-03-01',
  trips: [],
};
const noCrime: UsCrime = {
  unclassifiedRecord: false,
  cimtCount: 0,
  convictionCount: 0,
  combinedSentenceMonths: 0,
  confinementDays: 0,
  controlledSubstance: 'none',
  duiCount: 0,
};
const natural: UsNaturalizationAnswers = {
  lawfulAdmission: 'cleared',
  removalProcess: 'none',
  residenceThroughOath: true,
  lprResidenceYears: 8,
  english: 'passed',
  civics: 'passed',
  disability: { requested: false },
  goodMoralCharacter: 'cleared',
  murderConviction: false,
  aggravatedFelonyConvictedOn: 'none',
  persecutionBar: false,
  statutoryPeriodCrime: noCrime,
  otherGmcBar: 'cleared',
  falseOralTestimony: false,
  benefitsAndSupport: 'clear',
  constitutionalAttachment: true,
  party: { membership: 'none' },
  selectiveService: 'registered',
  warDesertionOrAlienageExemption: 'cleared',
  oath: 'willing',
  titlesRenounced: true,
  truthfulApplication: true,
};
const n: UsFullRequest = {
  ...time,
  pathway: 'US-NATURALIZATION',
  naturalization: natural,
};
const withNatural = (
  overrides: Partial<UsNaturalizationAnswers>,
): UsFullRequest => ({ ...n, naturalization: { ...natural, ...overrides } });
const spouse: UsFullRequest = {
  ...n,
  pathway: 'US-SPOUSE',
  marriage: { married: '2018-01-01', spouseCitizenSince: '2019-01-01' },
  naturalization: {
    ...natural,
    spouse: {
      validMarriage: true,
      livedTogetherRequiredPeriod: 'cleared',
      spouseCitizenRequiredPeriod: true,
      marriageAndCitizenshipThroughOath: true,
    },
  },
};

const marriage: NonNullable<UsConditionsAnswers['marriage']> = {
  marriedOn: '2024-03-01',
  bonaFide: 'cleared',
  improperConsideration: false,
  filing: 'joint',
  spouseJoins: true,
  finalRemovalOrder: false,
  interviewRequirement: 'cleared',
};
const conditions: UsFullRequest = {
  ...time,
  pathway: 'US-CONDITIONS',
  conditional: 'marriage',
  permanentResident: '2024-12-01',
  conditions: { marriage },
  fees: { channel: 'paper', relief: 'none' },
};
const investor: NonNullable<UsConditionsAnswers['investor']> = {
  originalPetitionFiledOn: '2022-03-15',
  requiredCapitalFullyInvested: 'cleared',
  sustainmentYears: 2,
  atRisk: true,
  lawfullySourcedFunds: 'cleared',
  qualifyingJobs: 10,
  minimumWeeklyHours: 35,
  regionalCenter: false,
};
const i829: UsFullRequest = {
  ...conditions,
  conditional: 'investor',
  conditions: { investor },
};

const travel: UsTravelAnswers = {
  registration: 'registered',
  carryingEvidence: true,
  movedOn: 'no-move',
  cardExpiresOn: '2028-03-01',
  otherReplacementGround: false,
  replacementFiledOn: 'not-filed',
  deportability: 'cleared',
  admissionTriggers: 'none',
  returnDocument: 'green-card',
  documentValidAtReturn: true,
  abandonment: 'cleared',
  feeForm: 'i90',
};
const t: UsFullRequest = {
  ...time,
  pathway: 'US-TRAVEL',
  travel,
  trips: [{ departed: '2026-01-01', returned: '2026-07-01' }],
  fees: { channel: 'online', relief: 'none' },
};
const family: UsFamilyAnswers = {
  petitioner: 'citizen',
  relationship: 'spouse',
  relationshipValid: 'cleared',
  marriageDuringRemoval: false,
  priorMarriageFraud: false,
  adamWalsh: 'cleared',
};
const support: UsSupportAnswers = {
  sponsorAge: 18,
  sponsorStatus: 'citizen',
  activeDuty: false,
  domiciledInUs: 'cleared',
  affidavitSubmitted: true,
  exemption: 'none',
  household: { region: 'contiguous', size: 2, incomeUsd: 27050 },
  qualifyingAssetsUsd: 0,
  jointSponsor: 'barred',
};
const admission: UsAdmissionAnswers = {
  process: 'adjustment',
  qualifyingBasis: 'cleared',
  visaAtFiling: 'available',
  visaAtDecision: 'available',
  legalEntry: 'admitted',
  adjustmentBasis: 'immediate-relative',
  otherAdjustmentBar: 'none',
  qualifyingViolationsDays: 0,
  discretion: 'cleared',
  classAHealth: 'cleared',
  vaccines: 'cleared',
  medicalEvidence: 'cleared',
  i693LinkedToAnotherClosedCase: false,
  publicCharge: 'cleared',
  benefits: 'none',
  crime: noCrime,
  criminalOtherGround: 'cleared',
  drugTraffickingBar: false,
  securityGround: 'clear',
  party: { membership: 'none' },
  immigrationFraud: false,
  falseCitizenship: false,
  unlawfulDeparture: 'none',
  unlawfulReentryBar: false,
  otherInadmissibility: 'cleared',
};
const f: UsFullRequest = {
  ...time,
  pathway: 'US-FAMILY',
  family,
  support,
  admission,
  fees: { channel: 'paper', relief: 'none' },
};
const p7: UsFullRequest = { ...f, pathway: 'US-ADJUSTMENT' };
const withAdmission = (
  overrides: Partial<UsAdmissionAnswers>,
): UsFullRequest => ({ ...p7, admission: { ...admission, ...overrides } });
const employment: UsEmploymentAnswers = {
  category: 'eb2-perm',
  categoryQualifications: 'cleared',
  employmentOffer: true,
  perm: 'certified',
  permCertifiedOn: '2026-05-27',
  recruitmentAndFeesCompliant: true,
  prevailingWageUsd: 60000,
  profferedWageUsd: 60000,
  employerEmployees: 25,
  employerNonprofit: false,
  wageYears: [{ paidUsd: 50000, netIncomeUsd: 10000, netCurrentAssetsUsd: 0 }],
  wagePeriodComplete: true,
  abilityToPayTotality: 'barred',
  officerStatementAccepted: 'barred',
  priorMarriageFraud: false,
  relativePetitioner: false,
  relativeOwnershipPct: 0,
};
const e: UsFullRequest = {
  ...time,
  pathway: 'US-EMPLOYMENT',
  employment,
  admission: {
    ...admission,
    adjustmentBasis: 'employment',
    lawfulAdmissionFor245k: true,
  },
  fees: f.fees,
};
const withEmployment = (
  overrides: Partial<UsEmploymentAnswers>,
): UsFullRequest => ({ ...e, employment: { ...employment, ...overrides } });
const eb1a = withEmployment({
  category: 'eb1a',
  internationalAward: false,
  extraordinaryEvidenceCount: 3,
  extraordinaryFinalMerits: 'cleared',
  continuesWorkInField: true,
  benefitsUnitedStates: true,
});
const eb5 = withEmployment({
  category: 'eb5',
  investment: {
    ...investor,
    project: 'tea',
    capitalUsd: 800000,
    qualifiesAsNewEnterprise: true,
  },
});
const gold: UsFullRequest = {
  ...withEmployment({
    category: 'gold-card',
    gold: {
      registrationAccepted: true,
      includedPeople: 1,
      donor: 'individual',
      giftUsd: 1000000,
      processingFundsUsd: 15000,
      fundsAndWire: 'cleared',
    },
  }),
  admission: { ...admission, process: 'consular' },
  fees: { channel: 'online' },
};
const human: UsHumanitarianAnswers = {
  status: 'refugee',
  presenceDays: 365,
  statusRetained: true,
  alreadyLpr: false,
  waiver: 'cleared',
};
const h: UsFullRequest = {
  ...time,
  pathway: 'US-HUMANITARIAN',
  humanitarian: human,
  admission,
};
const military: UsMilitaryAnswers = {
  basis: 'hostilities',
  service: [{ from: '2001-09-11', to: '2001-09-11' }],
  eligibleServiceComponent: true,
  honorableService: true,
  separatedOn: '2001-09-11',
  evidence: 'dd214-or-ngb22',
  qualifyingLocationAtEnlistment: true,
  backgroundCheck: 'cleared',
};
const m: UsFullRequest = {
  pathway: 'US-MILITARY',
  simulationDate: time.simulationDate,
  military,
  naturalization: {
    ...natural,
    lawfulAdmission: undefined,
    lprResidenceYears: 0,
  },
};

function path(request: UsFullRequest) {
  const result = evaluateUnitedStatesFull({ ...request, locale: 'en' });
  expect(result.policyAsOf).toBe('2026-11-23');
  expect(result.columns).toHaveLength(1);
  const [pathway] = result.columns[0].pathways;
  expect(pathway.id).toBe(request.pathway);
  return pathway;
}

function condition(request: UsFullRequest, id: string) {
  const hit = path(request).checks.find((item) => item.id === `US-${id}`);
  expect(hit, `Missing ${id}`).toBeDefined();
  return hit!;
}

type CheckCase = {
  id: string;
  met: UsFullRequest;
  other: UsFullRequest;
  otherStatus: 'NOT_MET' | 'UNKNOWN';
};
const cases: CheckCase[] = [
  {
    id: 'C01-AGE',
    met: { ...n, dateOfBirth: '2008-11-23' },
    other: { ...n, dateOfBirth: '2008-11-24' },
    otherStatus: 'NOT_MET',
  },
  {
    id: 'C02-LAWFUL-LPR',
    met: n,
    other: withNatural({ removalProcess: 'pending' }),
    otherStatus: 'NOT_MET',
  },
  {
    id: 'C03-ENGLISH',
    met: n,
    other: withNatural({ english: 'failed' }),
    otherStatus: 'NOT_MET',
  },
  {
    id: 'C04-CIVICS',
    met: n,
    other: withNatural({ civics: 'retest' }),
    otherStatus: 'UNKNOWN',
  },
  {
    id: 'C05-N648',
    met: n,
    other: withNatural({
      disability: {
        requested: true,
        months: 11,
        illegalDrugCause: false,
        clinicianCertified: true,
      },
    }),
    otherStatus: 'NOT_MET',
  },
  {
    id: 'C06-GMC',
    met: n,
    other: withNatural({ goodMoralCharacter: 'pending' }),
    otherStatus: 'UNKNOWN',
  },
  {
    id: 'C07-PERMANENT-GMC-BARS',
    met: withNatural({ aggravatedFelonyConvictedOn: '1990-11-28' }),
    other: withNatural({ aggravatedFelonyConvictedOn: '1990-11-29' }),
    otherStatus: 'NOT_MET',
  },
  {
    id: 'C08-STATUTORY-GMC-BARS',
    met: withNatural({
      statutoryPeriodCrime: { ...noCrime, confinementDays: 179 },
    }),
    other: withNatural({
      statutoryPeriodCrime: { ...noCrime, confinementDays: 180 },
    }),
    otherStatus: 'NOT_MET',
  },
  {
    id: 'C09-ATTACHMENT',
    met: n,
    other: withNatural({ constitutionalAttachment: false }),
    otherStatus: 'NOT_MET',
  },
  {
    id: 'C10-SELECTIVE-SERVICE',
    met: n,
    other: {
      ...withNatural({ selectiveService: 'required-unregistered' }),
      dateOfBirth: '2000-11-24',
    },
    otherStatus: 'NOT_MET',
  },
  {
    id: 'C11-MILITARY-BARS',
    met: n,
    other: withNatural({ warDesertionOrAlienageExemption: 'barred' }),
    otherStatus: 'NOT_MET',
  },
  {
    id: 'C12-OATH',
    met: n,
    other: withNatural({ oath: 'modified', oathApproval: 'pending' }),
    otherStatus: 'UNKNOWN',
  },
  {
    id: 'C13-MARITAL-UNION',
    met: spouse,
    other: {
      ...spouse,
      naturalization: {
        ...natural,
        spouse: {
          ...spouse.naturalization!.spouse,
          marriageAndCitizenshipThroughOath: false,
        },
      },
    },
    otherStatus: 'NOT_MET',
  },
  {
    id: 'C14-TRUTHFULNESS',
    met: n,
    other: withNatural({ truthfulApplication: false }),
    otherStatus: 'NOT_MET',
  },
  {
    id: 'C14-RESIDENCE-THROUGH-OATH',
    met: n,
    other: withNatural({ residenceThroughOath: false }),
    otherStatus: 'NOT_MET',
  },
  {
    id: 'C14-DISTRICT',
    met: { ...n, stateResidenceFrom: '2026-08-23' },
    other: { ...n, stateResidenceFrom: '2026-08-24' },
    otherStatus: 'NOT_MET',
  },
  {
    id: 'C15-BONA-FIDE-MARRIAGE',
    met: conditions,
    other: {
      ...conditions,
      conditions: { marriage: { ...marriage, marriedOn: '2022-12-01' } },
    },
    otherStatus: 'NOT_MET',
  },
  {
    id: 'C16-I751-FILING',
    met: conditions,
    other: {
      ...conditions,
      conditions: {
        marriage: { ...marriage, filing: 'divorce', waiverBasis: 'pending' },
      },
    },
    otherStatus: 'UNKNOWN',
  },
  {
    id: 'C17-CAPITAL',
    met: i829,
    other: {
      ...i829,
      conditions: { investor: { ...investor, sustainmentYears: 1.99 } },
    },
    otherStatus: 'NOT_MET',
  },
  {
    id: 'C17-JOBS',
    met: i829,
    other: {
      ...i829,
      conditions: { investor: { ...investor, qualifyingJobs: 9 } },
    },
    otherStatus: 'UNKNOWN',
  },
  {
    id: 'C18-REGISTRATION',
    met: t,
    other: {
      ...t,
      travel: { ...travel, registration: 'diplomatic-child-review' },
    },
    otherStatus: 'UNKNOWN',
  },
  {
    id: 'C19-ADDRESS',
    met: {
      ...t,
      travel: {
        ...travel,
        movedOn: '2026-11-10',
        addressReportedOn: '2026-11-20',
      },
    },
    other: {
      ...t,
      travel: {
        ...travel,
        movedOn: '2026-11-10',
        addressReportedOn: '2026-11-21',
      },
    },
    otherStatus: 'NOT_MET',
  },
  {
    id: 'C19-REPLACEMENT',
    met: t,
    other: { ...t, travel: { ...travel, cardExpiresOn: '2026-11-22' } },
    otherStatus: 'NOT_MET',
  },
  {
    id: 'C20-SEEKING-ADMISSION',
    met: t,
    other: { ...t, travel: { ...travel, admissionTriggers: 'unclassified' } },
    otherStatus: 'UNKNOWN',
  },
  {
    id: 'C21-DEPORTABILITY',
    met: t,
    other: { ...t, travel: { ...travel, deportability: 'barred' } },
    otherStatus: 'NOT_MET',
  },
  {
    id: 'C22-RETURN-DOCUMENT',
    met: t,
    other: {
      ...t,
      trips: [{ departed: '2025-07-01', returned: '2026-07-01' }],
    },
    otherStatus: 'NOT_MET',
  },
  {
    id: 'C22-RESIDENCE-INTENT',
    met: t,
    other: { ...t, travel: { ...travel, abandonment: 'pending' } },
    otherStatus: 'UNKNOWN',
  },
  {
    id: 'C23-RELATIONSHIP',
    met: f,
    other: {
      ...f,
      family: { ...family, relationship: 'parent', petitionerAge: 20 },
    },
    otherStatus: 'NOT_MET',
  },
  {
    id: 'C24-PETITION-BARS',
    met: f,
    other: { ...f, family: { ...family, priorMarriageFraud: true } },
    otherStatus: 'NOT_MET',
  },
  {
    id: 'C25-SUPPORT-INCOME',
    met: f,
    other: {
      ...f,
      support: {
        ...support,
        household: { ...support.household, incomeUsd: 27049 },
      },
    },
    otherStatus: 'NOT_MET',
  },
  {
    id: 'C26-SPONSOR',
    met: f,
    other: { ...f, support: { ...support, sponsorAge: 17 } },
    otherStatus: 'NOT_MET',
  },
  {
    id: 'C27-SUPPORT-EXEMPTION',
    met: {
      ...f,
      support: {
        exemption: 'quarters',
        qualifyingQuarters: 40,
        exemptionEvidence: 'cleared',
      },
    },
    other: {
      ...f,
      support: {
        exemption: 'quarters',
        qualifyingQuarters: 39,
        exemptionEvidence: 'cleared',
      },
    },
    otherStatus: 'NOT_MET',
  },
  {
    id: 'C28-OFFER-PERM',
    met: e,
    other: withEmployment({ permCertifiedOn: '2026-05-26' }),
    otherStatus: 'NOT_MET',
  },
  {
    id: 'C29-ABILITY-TO-PAY',
    met: e,
    other: withEmployment({
      wageYears: [
        { paidUsd: 50000, netIncomeUsd: 9999, netCurrentAssetsUsd: 0 },
      ],
    }),
    otherStatus: 'NOT_MET',
  },
  {
    id: 'C30-SELF-PETITION-EVIDENCE',
    met: eb1a,
    other: {
      ...eb1a,
      employment: { ...eb1a.employment, extraordinaryEvidenceCount: 2 },
    },
    otherStatus: 'NOT_MET',
  },
  {
    id: 'C30-SELF-PETITION-MERITS',
    met: eb1a,
    other: {
      ...eb1a,
      employment: { ...eb1a.employment, extraordinaryFinalMerits: 'pending' },
    },
    otherStatus: 'UNKNOWN',
  },
  {
    id: 'C31-INVESTMENT-AMOUNT',
    met: eb5,
    other: { ...eb5, simulationDate: '2027-01-01' },
    otherStatus: 'UNKNOWN',
  },
  {
    id: 'C31-INVESTMENT-PROJECT',
    met: eb5,
    other: {
      ...eb5,
      employment: {
        ...eb5.employment,
        investment: { ...eb5.employment!.investment, atRisk: false },
      },
    },
    otherStatus: 'NOT_MET',
  },
  {
    id: 'C31-INVESTMENT-JOBS',
    met: eb5,
    other: {
      ...eb5,
      employment: {
        ...eb5.employment,
        investment: { ...eb5.employment!.investment, minimumWeeklyHours: 34 },
      },
    },
    otherStatus: 'NOT_MET',
  },
  {
    id: 'C32-GOLD-PROCESS',
    met: gold,
    other: { ...gold, admission: { ...admission, process: 'adjustment' } },
    otherStatus: 'NOT_MET',
  },
  {
    id: 'C32-GOLD-GIFT',
    met: gold,
    other: {
      ...gold,
      employment: {
        ...gold.employment,
        gold: { ...gold.employment!.gold, giftUsd: 999999 },
      },
    },
    otherStatus: 'NOT_MET',
  },
  {
    id: 'C33-VISA-AND-ENTRY',
    met: p7,
    other: withAdmission({ legalEntry: 'without-inspection' }),
    otherStatus: 'NOT_MET',
  },
  {
    id: 'C34-ADJUSTMENT-BARS',
    met: withAdmission({
      adjustmentBasis: 'employment',
      lawfulAdmissionFor245k: true,
      qualifyingViolationsDays: 180,
    }),
    other: withAdmission({
      adjustmentBasis: 'employment',
      lawfulAdmissionFor245k: true,
      qualifyingViolationsDays: 181,
    }),
    otherStatus: 'NOT_MET',
  },
  {
    id: 'C35-DISCRETION',
    met: p7,
    other: withAdmission({ discretion: 'pending' }),
    otherStatus: 'UNKNOWN',
  },
  {
    id: 'C36-HEALTH',
    met: p7,
    other: withAdmission({ i693LinkedToAnotherClosedCase: true }),
    otherStatus: 'NOT_MET',
  },
  {
    id: 'C37-PUBLIC-CHARGE',
    met: p7,
    other: withAdmission({
      publicCharge: 'pending',
      benefits: 'post-change-means-tested',
    }),
    otherStatus: 'UNKNOWN',
  },
  {
    id: 'C38-CRIMINAL-INADMISSIBILITY',
    met: p7,
    other: withAdmission({
      drugTraffickingBar: true,
      criminalWaiver: 'cleared',
    }),
    otherStatus: 'NOT_MET',
  },
  {
    id: 'C39-SECURITY',
    met: p7,
    other: withAdmission({ securityGround: 'nonwaivable' }),
    otherStatus: 'NOT_MET',
  },
  {
    id: 'C40-IMMIGRATION-HISTORY',
    met: withAdmission({
      unlawfulDeparture: {
        leftOn: '2025-01-01',
        qualifyingDays: 180,
        voluntaryBeforeProceedings: true,
      },
    }),
    other: withAdmission({
      unlawfulDeparture: {
        leftOn: '2025-01-01',
        qualifyingDays: 181,
        voluntaryBeforeProceedings: true,
      },
    }),
    otherStatus: 'NOT_MET',
  },
  {
    id: 'C41-HUMANITARIAN-PRESENCE',
    met: h,
    other: { ...h, humanitarian: { ...human, presenceDays: 364 } },
    otherStatus: 'NOT_MET',
  },
  {
    id: 'C41-HUMANITARIAN-STATUS',
    met: h,
    other: {
      ...h,
      humanitarian: { ...human, status: 'asylee', firmlyResettled: true },
    },
    otherStatus: 'NOT_MET',
  },
  {
    id: 'C42-HUMANITARIAN-WAIVER',
    met: h,
    other: { ...h, humanitarian: { ...human, waiver: 'pending' } },
    otherStatus: 'UNKNOWN',
  },
  {
    id: 'C43-SERVICE',
    met: m,
    other: {
      ...m,
      military: {
        ...military,
        service: [{ from: '2001-09-10', to: '2001-09-10' }],
      },
    },
    otherStatus: 'NOT_MET',
  },
  {
    id: 'C43-LPR-OR-ENLISTMENT',
    met: m,
    other: {
      ...m,
      military: { ...military, qualifyingLocationAtEnlistment: false },
      naturalization: { ...natural, lawfulAdmission: 'barred' },
    },
    otherStatus: 'NOT_MET',
  },
  {
    id: 'C43-CERTIFICATION',
    met: m,
    other: { ...m, military: { ...military, evidence: 'none' } },
    otherStatus: 'NOT_MET',
  },
  {
    id: 'C43-FILING-BASIS',
    met: m,
    other: {
      ...m,
      military: { ...military, basis: 'peacetime', separatedOn: undefined },
    },
    otherStatus: 'UNKNOWN',
  },
  {
    id: 'C44-I485',
    met: f,
    other: { ...f, fees: { channel: 'online' } },
    otherStatus: 'UNKNOWN',
  },
  {
    id: 'C45-FEE-RELIEF',
    met: f,
    other: { ...f, fees: { channel: 'paper', relief: 'reduced' } },
    otherStatus: 'NOT_MET',
  },
];

test.each(cases)(
  '$id checks a supported case and an adverse or unresolved case',
  ({ id, met, other, otherStatus }) => {
    const positive = condition(met, id);
    const negative = condition(other, id);
    expect(positive.status).toBe('MET');
    expect(negative.status).toBe(otherStatus);
    expect(positive.sources.length).toBeGreaterThan(0);
    if (negative.status === 'UNKNOWN')
      expect(negative.pendingDetails?.length).toBeGreaterThan(0);
    const chinese = evaluateUnitedStatesFull({
      ...met,
      locale: 'zh-CN',
    }).columns[0].pathways[0].checks.find((c) => c.id === positive.id);
    expect(chinese?.status).toBe(positive.status);
    expect(chinese?.title).not.toBe(positive.title);
    expect(chinese?.explanation).not.toBe(positive.explanation);
  },
);

describe('naturalization boundaries and pilot reuse', () => {
  test('same residence checks, one legacy date, all non-time findings still required', () => {
    const req = { ...n, permanentResident: '2022-03-01' };
    const legacy = evaluateUnitedStates(req as UsRequest).pathways[0];
    const result = path(req);
    expect(result.status).toBe('FUTURE');
    expect(result.earliestDate).toBe('2026-12-01'); // March 1, 2027 minus 90 days
    expect(result.earliestDate).toBe(legacy.earliestDate);
    expect(result.checks.slice(0, 3).map((c) => c.status)).toEqual(
      legacy.checks.slice(0, 3).map((c) => (c.met ? 'MET' : 'NOT_MET')),
    );
    const missing = path({
      ...req,
      naturalization: { ...natural, goodMoralCharacter: undefined },
    });
    expect(missing.status).toBe('UNKNOWN');
    expect(missing.earliestDate).toBeUndefined();
    expect(
      path({ ...req, naturalization: { ...natural, oath: 'refuses' } }).status,
    ).toBe('NOT_MET');
  });

  test.each([
    ['1976-11-23', 20, 'MET'],
    ['1976-11-24', 20, 'NOT_MET'],
    ['1976-11-23', 19.9, 'NOT_MET'],
    ['1971-11-23', 15, 'MET'],
    ['1971-11-24', 15, 'NOT_MET'],
  ] as const)(
    'English exemption for birth %s and %s years of residence',
    (dateOfBirth, lprResidenceYears, result) => {
      expect(
        condition(
          {
            ...withNatural({ english: 'failed', lprResidenceYears }),
            dateOfBirth,
          },
          'C03-ENGLISH',
        ).status,
      ).toBe(result);
    },
  );

  test('old test is six of ten, new test is twelve of twenty, special test is six of ten', () => {
    const input = withNatural({ civics: undefined, civicsCorrect: 6 });
    expect(
      condition({ ...input, simulationDate: '2025-10-19' }, 'C04-CIVICS')
        .explanation,
    ).toContain('100');
    expect(
      condition({ ...input, simulationDate: '2025-10-19' }, 'C04-CIVICS')
        .status,
    ).toBe('MET');
    expect(
      condition({ ...input, simulationDate: '2025-10-20' }, 'C04-CIVICS')
        .status,
    ).toBe('NOT_MET');
    expect(
      condition(
        withNatural({ civics: undefined, civicsCorrect: 11 }),
        'C04-CIVICS',
      ).status,
    ).toBe('NOT_MET');
    expect(
      condition(
        withNatural({ civics: undefined, civicsCorrect: 12 }),
        'C04-CIVICS',
      ).status,
    ).toBe('MET');
    expect(
      condition(
        {
          ...withNatural({
            civics: undefined,
            civicsCorrect: 6,
            lprResidenceYears: 20,
          }),
          dateOfBirth: '1961-11-23',
        },
        'C04-CIVICS',
      ).status,
    ).toBe('MET');
  });

  test('N-648 needs twelve months and only waives the approved test', () => {
    const request = withNatural({
      english: 'failed',
      civics: 'failed',
      disability: {
        requested: true,
        months: 12,
        illegalDrugCause: false,
        clinicianCertified: true,
        englishWaived: 'cleared',
        civicsWaived: 'barred',
      },
    });
    expect(condition(request, 'C05-N648').status).toBe('MET');
    expect(condition(request, 'C03-ENGLISH').status).toBe('MET');
    expect(condition(request, 'C04-CIVICS').status).toBe('NOT_MET');
  });

  test('party lookback, Selective Service lookbacks and multiple DUI', () => {
    expect(
      condition(
        withNatural({
          party: { membership: 'former', ageEnded: 20, endedOn: '2016-11-22' },
        }),
        'C09-ATTACHMENT',
      ).status,
    ).toBe('MET');
    expect(
      condition(
        withNatural({
          party: { membership: 'former', ageEnded: 20, endedOn: '2016-11-23' },
        }),
        'C09-ATTACHMENT',
      ).status,
    ).toBe('NOT_MET');
    const filing = {
      ...withNatural({ selectiveService: 'required-unregistered' }),
      dateOfBirth: '1997-11-23',
    };
    expect(condition(filing, 'C10-SELECTIVE-SERVICE').status).toBe('UNKNOWN');
    expect(
      condition(
        {
          ...spouse,
          dateOfBirth: filing.dateOfBirth,
          naturalization: {
            ...spouse.naturalization,
            selectiveService: 'required-unregistered',
          },
        },
        'C10-SELECTIVE-SERVICE',
      ).status,
    ).toBe('MET');
    expect(
      condition(
        withNatural({ statutoryPeriodCrime: { ...noCrime, duiCount: 2 } }),
        'C08-STATUTORY-GMC-BARS',
      ).status,
    ).toBe('UNKNOWN');
    expect(
      condition(
        withNatural({
          statutoryPeriodCrime: {
            ...noCrime,
            controlledSubstance: 'single-simple-cannabis',
            cannabisGrams: 30,
          },
        }),
        'C08-STATUTORY-GMC-BARS',
      ).status,
    ).toBe('MET');
  });

  test('missing spouse and removal-of-conditions answers stay unknown', () => {
    expect(path({ ...n, pathway: 'US-SPOUSE' }).status).toBe('UNKNOWN');
    expect(path({ ...conditions, conditional: undefined }).status).toBe(
      'UNKNOWN',
    );
    expect(path({ ...conditions, conditional: 'none' }).status).toBe(
      'NOT_APPLICABLE',
    );
  });

  test('peacetime service and late residence at six months', () => {
    const request: UsFullRequest = {
      ...m,
      dateOfBirth: '1980-01-01',
      conditional: 'none',
      naturalization: natural,
      military: {
        ...military,
        basis: 'peacetime',
        honorableServiceYears: 1,
        separatedOn: '2026-05-23',
        lprAtInterview: true,
      },
    };
    expect(path(request).status).toBe('MET');
    expect(
      condition(
        {
          ...request,
          military: { ...request.military, honorableServiceYears: 0.99 },
        },
        'C43-SERVICE',
      ).status,
    ).toBe('NOT_MET');
    const late = { ...request, simulationDate: '2026-11-24' };
    expect(condition(late, 'C43-LATE-RESIDENCE').status).toBe('UNKNOWN');
    expect(
      condition(
        { ...late, military: { ...late.military, lateResidenceMet: true } },
        'C43-LATE-RESIDENCE',
      ).status,
    ).toBe('MET');
  });
});

describe('residence documents and qualifying categories', () => {
  test('I-751 waiver bypasses the joint window and checks the waiver itself', () => {
    const early = { ...conditions, simulationDate: '2026-06-01' };
    expect(path(early).status).toBe('FUTURE');
    expect(path(early).earliestDate).toBe('2026-09-02'); // December 1 minus 90 days
    const waiver: UsFullRequest = {
      ...early,
      conditions: {
        marriage: { ...marriage, filing: 'abuse', waiverBasis: 'cleared' },
      },
    };
    expect(path(waiver).status).toBe('MET');
    expect(condition(waiver, 'C44-I751').explanation).toContain('USD 0');
    expect(
      path({
        ...waiver,
        conditions: {
          marriage: { ...waiver.conditions!.marriage, finalRemovalOrder: true },
        },
      }).status,
    ).toBe('NOT_MET');
  });

  test('180 full days and valid document vs 181 triggering inspection', () => {
    // Jan 1 to Jul 1 is 181 elapsed days, so only 180 complete days abroad.
    expect(path(t).checks.some((c) => c.id === 'US-C37-PUBLIC-CHARGE')).toBe(
      false,
    );
    const longer = {
      ...t,
      trips: [{ departed: '2026-01-01', returned: '2026-07-02' }],
    };
    expect(condition(longer, 'C37-PUBLIC-CHARGE').status).toBe('UNKNOWN');
    const permit: UsFullRequest = {
      ...longer,
      trips: [{ departed: '2025-07-01', returned: '2026-07-01' }],
      travel: {
        ...travel,
        returnDocument: 'reentry-permit',
        permitAppliedInUs: true,
        permitBiometricsInUs: true,
        admission,
      },
    };
    expect(condition(permit, 'TIME-TRAVEL').status).toBe('NOT_MET'); // pilot's green-card-alone check
    expect(condition(permit, 'C22-RETURN-DOCUMENT').status).toBe('MET');
    expect(path(permit).status).toBe('MET');
  });

  test('one CIMT within five years with a possible 12-month term and two independent CIMTs', () => {
    const facts: NonNullable<UsTravelAnswers['deportabilityFacts']> = {
      unclassified: false,
      independentCimtCount: 1,
      aggravatedFelony: false,
      controlledSubstance: 'none',
      earlyMarriageTermination: 'cleared',
      otherGround: 'cleared',
      singleCimt: {
        admittedOn: '2020-01-01',
        committedOn: '2025-01-01',
        possibleSentenceMonths: 12,
      },
    };
    expect(
      condition(
        { ...t, travel: { ...travel, deportabilityFacts: facts } },
        'C21-DEPORTABILITY',
      ).status,
    ).toBe('NOT_MET');
    const late = {
      ...facts,
      singleCimt: { ...facts.singleCimt!, committedOn: '2025-01-02' },
    };
    expect(
      condition(
        { ...t, travel: { ...travel, deportabilityFacts: late } },
        'C21-DEPORTABILITY',
      ).status,
    ).toBe('MET');
    expect(
      condition(
        {
          ...t,
          travel: {
            ...travel,
            deportabilityFacts: { ...late, independentCimtCount: 2 },
          },
        },
        'C21-DEPORTABILITY',
      ).status,
    ).toBe('NOT_MET');
  });

  test('sponsor parent age and stepchild age are strict boundaries for the applicable relation', () => {
    expect(
      condition(
        {
          ...f,
          family: { ...family, relationship: 'parent', petitionerAge: 21 },
        },
        'C23-RELATIONSHIP',
      ).status,
    ).toBe('MET');
    const step: UsFamilyAnswers = {
      ...family,
      relationship: 'unmarried-child',
      childRelationship: 'step',
      relationshipEstablishedAtAge: 17,
    };
    expect(condition({ ...f, family: step }, 'C23-RELATIONSHIP').status).toBe(
      'MET',
    );
    expect(
      condition(
        { ...f, family: { ...step, relationshipEstablishedAtAge: 18 } },
        'C23-RELATIONSHIP',
      ).status,
    ).toBe('NOT_MET');
  });

  test('I-864 rounds Alaska and Hawaii thresholds and credits the correct assets', () => {
    const assets = {
      ...f,
      support: {
        ...support,
        household: { region: 'contiguous' as const, size: 2, incomeUsd: 26050 },
        qualifyingAssetsUsd: 3000,
      },
    };
    expect(condition(assets, 'C25-SUPPORT-INCOME').status).toBe('MET'); // 3 x $1,000 difference
    expect(
      condition(
        {
          ...assets,
          support: { ...assets.support, qualifyingAssetsUsd: 2999 },
        },
        'C25-SUPPORT-INCOME',
      ).status,
    ).toBe('NOT_MET');
    const alaska = {
      ...f,
      support: {
        ...support,
        household: { region: 'alaska' as const, size: 2, incomeUsd: 33813 },
      },
    };
    expect(condition(alaska, 'C25-SUPPORT-INCOME').explanation).toContain(
      '33813',
    ); // $27,050 x 1.25 = $33,812.50
    expect(
      condition(
        {
          ...alaska,
          support: {
            ...alaska.support,
            household: { ...alaska.support.household, incomeUsd: 33812 },
          },
        },
        'C25-SUPPORT-INCOME',
      ).status,
    ).toBe('NOT_MET');
    const hawaii = {
      ...f,
      support: {
        ...support,
        activeDuty: true,
        household: { region: 'hawaii' as const, size: 2, incomeUsd: 24890 },
      },
    };
    expect(condition(hawaii, 'C25-SUPPORT-INCOME').status).toBe('MET');
    expect(
      condition(
        { ...hawaii, support: { ...hawaii.support, activeDuty: false } },
        'C25-SUPPORT-INCOME',
      ).explanation,
    ).toContain('31113');
  });

  test('NIW bachelor plus five years and three separate merits prongs', () => {
    const niw = withEmployment({
      category: 'eb2-niw',
      degree: 'bachelor',
      progressiveExperienceYears: 5,
      exceptionalEvidenceCount: 0,
      niwProngs: {
        nationalImportance: true,
        wellPositioned: true,
        waiverBeneficial: true,
      },
      niwDetermination: 'cleared',
    });
    expect(condition(niw, 'C30-SELF-PETITION-EVIDENCE').status).toBe('MET');
    expect(
      condition(
        {
          ...niw,
          employment: { ...niw.employment, progressiveExperienceYears: 4.99 },
        },
        'C30-SELF-PETITION-EVIDENCE',
      ).status,
    ).toBe('NOT_MET');
    expect(
      condition(
        {
          ...niw,
          employment: {
            ...niw.employment,
            niwProngs: {
              ...niw.employment!.niwProngs,
              waiverBeneficial: false,
            },
          },
        },
        'C30-SELF-PETITION-MERITS',
      ).status,
    ).toBe('NOT_MET');
  });

  test('Gold Card dependent uncertainty and petition date cutoffs', () => {
    expect(condition(gold, 'C32-GOLD-ALLOCATION').pendingDetails).toEqual([
      'PD-266',
    ]);
    expect(path(gold).status).toBe('UNKNOWN');
    const dependent = {
      ...gold,
      employment: {
        ...gold.employment,
        gold: {
          ...gold.employment!.gold,
          includedPeople: 2,
          processingFundsUsd: 30000,
        },
      },
    };
    expect(condition(dependent, 'C32-GOLD-GIFT').status).toBe('UNKNOWN');
    expect(condition(dependent, 'C44-I140G').explanation).toContain(
      'USD 30000',
    );
    expect(
      condition(
        { ...eb5, simulationDate: '2026-12-31' },
        'C31-INVESTMENT-AMOUNT',
      ).status,
    ).toBe('MET');
    expect(
      condition(
        {
          ...eb5,
          employment: {
            ...eb5.employment,
            investment: {
              ...eb5.employment!.investment,
              project: 'standard',
              capitalUsd: 1049999,
            },
          },
        },
        'C31-INVESTMENT-AMOUNT',
      ).status,
    ).toBe('NOT_MET');
  });
});

describe('admission, fees and pathway results', () => {
  test('criminal petty-offense max and sentence are inclusive and single cannabis needs a waiver', () => {
    const petty = {
      ...noCrime,
      cimtCount: 1,
      convictionCount: 1,
      cimtMaximumMonths: 12,
      cimtSentenceMonths: 6,
      cimtAgeAtOffense: 18,
    };
    expect(
      condition(withAdmission({ crime: petty }), 'C38-CRIMINAL-INADMISSIBILITY')
        .status,
    ).toBe('MET');
    expect(
      condition(
        withAdmission({ crime: { ...petty, cimtSentenceMonths: 7 } }),
        'C38-CRIMINAL-INADMISSIBILITY',
      ).status,
    ).toBe('NOT_MET');
    expect(
      condition(
        withAdmission({
          crime: {
            ...noCrime,
            controlledSubstance: 'single-simple-cannabis',
            cannabisGrams: 30,
          },
        }),
        'C38-CRIMINAL-INADMISSIBILITY',
      ).status,
    ).toBe('NOT_MET');
  });

  test('unlawful presence bars expire on the third or tenth anniversary of departure', () => {
    const short = withAdmission({
      unlawfulDeparture: {
        leftOn: '2023-11-23',
        qualifyingDays: 364,
        voluntaryBeforeProceedings: true,
      },
    });
    expect(
      condition(
        { ...short, simulationDate: '2026-11-22' },
        'C40-IMMIGRATION-HISTORY',
      ).status,
    ).toBe('NOT_MET');
    expect(condition(short, 'C40-IMMIGRATION-HISTORY').status).toBe('MET');
    const long = withAdmission({
      unlawfulDeparture: { leftOn: '2016-11-23', qualifyingDays: 365 },
    });
    expect(
      condition(
        { ...long, simulationDate: '2026-11-22' },
        'C40-IMMIGRATION-HISTORY',
      ).status,
    ).toBe('NOT_MET');
    expect(condition(long, 'C40-IMMIGRATION-HISTORY').status).toBe('MET');
    expect(
      condition(
        withAdmission({
          falseCitizenship: true,
          falseCitizenshipException: false,
          immigrationWaiver: 'cleared',
        }),
        'C40-IMMIGRATION-HISTORY',
      ).status,
    ).toBe('NOT_MET');
  });

  test('consular cases omit adjustment discretion and a future bulletin keeps the decision unknown', () => {
    const consular = withAdmission({
      process: 'consular',
      adjustmentBasis: 'employment',
      visaAtDecision: 'future-bulletin',
      publicCharge: 'pending',
    });
    const checks = path(consular).checks;
    expect(checks.some((item) => item.id === 'US-C35-DISCRETION')).toBe(false);
    expect(condition(consular, 'C37-PUBLIC-CHARGE').pendingDetails).toEqual([
      'PD-273',
    ]);
    expect(condition(consular, 'C33-VISA-AND-ENTRY').pendingDetails).toEqual([
      'PD-272',
    ]);
    expect(path(consular).status).toBe('UNKNOWN');
  });

  test('H.R. 1 asylum annual fee has its own effective date and advance parole exception', () => {
    expect(
      condition(
        { ...h, fees: { hr1: 'asylum-annual', filingOn: '2026-10-15' } },
        'C44-HR1',
      ).explanation,
    ).toContain('USD 102');
    expect(
      condition(
        { ...h, fees: { hr1: 'asylum-annual', filingOn: '2026-10-16' } },
        'C44-HR1',
      ).explanation,
    ).toContain('USD 105');
    expect(
      condition(
        { ...p7, fees: { hr1: 'parole', pendingI485AdvanceParole: true } },
        'C44-HR1',
      ).explanation,
    ).toContain('USD 0');
  });

  test('EB-5 fee switch uses filing date; new regional initial fee is $7,850 + $1,100', () => {
    expect(
      condition(
        { ...i829, fees: { channel: 'paper', filingOn: '2026-11-29' } },
        'C44-I829',
      ).explanation,
    ).toContain('USD 3750');
    expect(
      condition(
        { ...i829, fees: { channel: 'paper', filingOn: '2026-11-30' } },
        'C44-I829',
      ).explanation,
    ).toContain('USD 5000');
    const rc = {
      ...eb5,
      employment: {
        ...eb5.employment,
        investment: { ...eb5.employment!.investment, regionalCenter: true },
      },
      fees: {
        channel: 'paper' as const,
        filingOn: '2026-11-30',
        eb5Amendment: false,
      },
    };
    expect(condition(rc, 'C44-EB5-PETITION').explanation).toContain('USD 8950');
  });

  test('N-400 waiver at 150%, reduced at 400%, and available channels', () => {
    const fees = {
      channel: 'paper' as const,
      relief: 'waiver' as const,
      receivesMeansTestedBenefit: false,
      extremeFinancialHardship: 'barred' as const,
      household: { region: 'contiguous' as const, size: 2, incomeUsd: 32460 },
    };
    expect(condition({ ...n, fees }, 'C44-N400').explanation).toContain(
      'USD 0',
    ); // 21640 x 1.5
    expect(
      condition(
        {
          ...n,
          fees: { ...fees, household: { ...fees.household, incomeUsd: 32461 } },
        },
        'C45-FEE-RELIEF',
      ).status,
    ).toBe('NOT_MET');
    const reduced = {
      ...fees,
      relief: 'reduced' as const,
      household: { ...fees.household, incomeUsd: 86560 },
    };
    expect(
      condition({ ...n, fees: reduced }, 'C44-N400').explanation,
    ).toContain('USD 380'); // 21640 x 4
    expect(
      condition(
        {
          ...n,
          fees: {
            ...reduced,
            household: { ...reduced.household, incomeUsd: 86561 },
          },
        },
        'C44-N400',
      ).explanation,
    ).toContain('USD 760');
    expect(
      condition({ ...n, fees: { ...reduced, channel: 'online' } }, 'C44-N400')
        .explanation,
    ).toContain('USD 710');
  });

  test('standard, child and exempt I-485 cases plus petitioner size surcharge', () => {
    const child = {
      ...f,
      dateOfBirth: '2012-11-24',
      fees: { channel: 'paper' as const, applyingWithParent: true },
    };
    expect(condition(child, 'C44-I485').explanation).toContain('USD 950');
    expect(
      condition({ ...child, dateOfBirth: '2012-11-23' }, 'C44-I485')
        .explanation,
    ).toContain('USD 1440');
    expect(condition(h, 'C44-I485').explanation).toContain('USD 0');
    expect(condition(e, 'C44-I140').explanation).toContain('USD 1015'); // $715 + $300 at 25 employees
    expect(
      condition(withEmployment({ employerEmployees: 26 }), 'C44-I140')
        .explanation,
    ).toContain('USD 1315');
  });

  test('each selected pathway returns one localized result with distinct checks', () => {
    for (const request of [n, spouse, conditions, i829, t, f, e, p7, h, m]) {
      const output = path(request);
      expect(
        output.status,
        `${request.pathway} ${output.checks
          .filter((item) => item.status !== 'MET')
          .map((item) => item.id)
          .join(', ')}`,
      ).toBe('MET');
      expect(new Set(output.checks.map((item) => item.id)).size).toBe(
        output.checks.length,
      );
    }
  });

  test('an incomplete household is unknown, but a definite bar wins over missing inputs', () => {
    expect(
      path({ pathway: 'US-FAMILY', simulationDate: time.simulationDate })
        .status,
    ).toBe('UNKNOWN');
    expect(
      path({
        pathway: 'US-FAMILY',
        simulationDate: time.simulationDate,
        family: { priorMarriageFraud: true },
      }).status,
    ).toBe('NOT_MET');
    expect(
      path({ ...n, fees: { channel: 'online', relief: 'reduced' } }).status,
    ).toBe('MET');
  });
});

describe('filing and evidence exceptions', () => {
  test('I-751 on Monday after a Sunday filing cutoff depends on the channel', () => {
    const caseInput = { ...conditions, permanentResident: '2024-11-23' };
    expect(path(caseInput).status).toBe('MET');
    expect(path({ ...caseInput, fees: { channel: 'online' } }).status).toBe(
      'NOT_MET',
    );
    expect(path({ ...caseInput, fees: undefined }).status).toBe('UNKNOWN');
  });

  test('I-829 uses paper and I-751 hardship does not require bona fide marriage evidence', () => {
    expect(condition(i829, 'C17-I829-PAPER').status).toBe('MET');
    expect(
      condition({ ...i829, fees: { channel: 'online' } }, 'C17-I829-PAPER')
        .status,
    ).toBe('NOT_MET');
    const hardship: UsFullRequest = {
      ...conditions,
      conditions: {
        marriage: {
          ...marriage,
          filing: 'hardship',
          bonaFide: undefined,
          improperConsideration: undefined,
          waiverBasis: 'cleared',
        },
      },
    };
    expect(path(hardship).status).toBe('MET');
  });

  test('ordinary permit expiry and acceptance of qualifying medical or criminal waivers', () => {
    const permit: UsFullRequest = {
      ...t,
      travel: {
        ...travel,
        returnDocument: 'reentry-permit',
        documentValidAtReturn: undefined,
        permitAppliedInUs: true,
        permitBiometricsInUs: true,
        permitIssuedOn: '2024-07-02',
        permitRestrictedToOneYear: false,
      },
    };
    expect(condition(permit, 'C22-RETURN-DOCUMENT').status).toBe('MET');
    expect(
      condition(
        {
          ...permit,
          travel: { ...permit.travel, permitIssuedOn: '2024-06-30' },
        },
        'C22-RETURN-DOCUMENT',
      ).status,
    ).toBe('NOT_MET');
    const pending = withAdmission({
      classAHealth: 'barred',
      healthWaiver: 'pending',
    });
    expect(condition(pending, 'C36-HEALTH').status).toBe('UNKNOWN');
    const cannabis = {
      ...noCrime,
      controlledSubstance: 'single-simple-cannabis' as const,
      cannabisGrams: 30,
    };
    expect(
      condition(
        withAdmission({ crime: cannabis, criminalWaiver: 'cleared' }),
        'C38-CRIMINAL-INADMISSIBILITY',
      ).status,
    ).toBe('MET');
    expect(
      condition(
        withAdmission({ crime: cannabis, criminalWaiver: 'pending' }),
        'C38-CRIMINAL-INADMISSIBILITY',
      ).status,
    ).toBe('UNKNOWN');
  });

  test('Hawaii sponsor table uses its published increment beyond eight people', () => {
    // $80,088 + $8,163 = $88,251.
    const household = { region: 'hawaii' as const, size: 9, incomeUsd: 88251 };
    expect(
      condition(
        { ...f, support: { ...support, household } },
        'C25-SUPPORT-INCOME',
      ).status,
    ).toBe('MET');
    expect(
      condition(
        {
          ...f,
          support: {
            ...support,
            household: { ...household, incomeUsd: 88250 },
          },
        },
        'C25-SUPPORT-INCOME',
      ).status,
    ).toBe('NOT_MET');
  });

  test('PERM mandatory recruitment dates and professional steps', () => {
    const permRecruitment = {
      stateJobOrderDays: 30,
      advertisements: 2,
      professional: true,
      mandatoryRecruitmentDaysBeforeFiling: [30, 180],
      noticeWorkdays: 10,
      extraDistinctSteps: 3,
      qualifiedAvailableUsWorker: false,
      employerPaidPermCosts: true,
    };
    expect(
      condition(withEmployment({ permRecruitment }), 'C28-OFFER-PERM').status,
    ).toBe('MET');
    expect(
      condition(
        withEmployment({
          permRecruitment: {
            ...permRecruitment,
            mandatoryRecruitmentDaysBeforeFiling: [29, 180],
          },
        }),
        'C28-OFFER-PERM',
      ).status,
    ).toBe('NOT_MET');
    expect(
      condition(
        withEmployment({
          permRecruitment: { ...permRecruitment, extraDistinctSteps: 2 },
        }),
        'C28-OFFER-PERM',
      ).status,
    ).toBe('NOT_MET');
    expect(
      condition(
        withEmployment({
          permRecruitment: {
            ...permRecruitment,
            qualifiedAvailableUsWorker: undefined,
          },
        }),
        'C28-OFFER-PERM',
      ).status,
    ).toBe('UNKNOWN');
  });
});

test.each([
  ['i90', 'I90', '415'],
  ['i131', 'I131', '630'],
  ['ds117', 'DS117', '180'],
  ['i131a', 'I131A', '575'],
  ['ar11', 'AR11', '0'],
  ['g325r', 'G325R', '0'],
] as const)(
  '%s fee is quoted when a compatible channel is selected',
  (feeForm, id, expected) => {
    const channel =
      feeForm === 'i131' || feeForm === 'ds117' ? 'paper' : 'online';
    const request: UsFullRequest = {
      ...t,
      travel: { ...travel, feeForm },
      fees: { channel, relief: 'none' },
    };
    expect(condition(request, `C44-${id}`).explanation).toContain(
      `USD ${expected}`,
    );
    if (feeForm === 'g325r' || feeForm === 'i131') {
      const incompatible = channel === 'online' ? 'paper' : 'online';
      expect(
        condition({ ...request, fees: { channel: incompatible } }, `C44-${id}`)
          .status,
      ).toBe('UNKNOWN');
    }
  },
);

test('consular family fees and optional employment premium processing', () => {
  const consular: UsFullRequest = {
    ...f,
    admission: { ...admission, process: 'consular' },
  };
  const fees = [
    ['I130', '675'],
    ['I864', '120'],
    ['IMMIGRANT-VISA', '325'],
    ['IMMIGRANT-FEE', '235'],
  ] as const;
  for (const [id, usd] of fees)
    expect(condition(consular, `C44-${id}`).explanation).toContain(
      `USD ${usd}`,
    );
  expect(
    condition(
      { ...e, fees: { ...e.fees, premiumProcessing: true } },
      'C44-I907',
    ).explanation,
  ).toContain('USD 2965');
  expect(
    condition({ ...n, fees: { channel: 'online' } }, 'C44-N336').explanation,
  ).toContain('USD 780');
  expect(condition(m, 'C44-N336').explanation).toContain('USD 0');
});

test('replacement applies within six months and when the card is lost', () => {
  const expiry = { ...t, travel: { ...travel, cardExpiresOn: '2027-05-23' } };
  expect(
    condition({ ...expiry, simulationDate: '2026-11-22' }, 'C19-REPLACEMENT')
      .status,
  ).toBe('MET');
  expect(condition(expiry, 'C19-REPLACEMENT').status).toBe('NOT_MET');
  expect(
    condition(
      { ...t, travel: { ...travel, otherReplacementGround: true } },
      'C19-REPLACEMENT',
    ).status,
  ).toBe('NOT_MET');
  expect(
    condition(
      {
        ...expiry,
        travel: { ...expiry.travel, replacementFiledOn: '2026-11-23' },
      },
      'C19-REPLACEMENT',
    ).status,
  ).toBe('MET');
});
