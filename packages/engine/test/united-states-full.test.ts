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
  petitionStatus: 'approved',
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
  initialSupplementJIncluded: true,
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
  employment: { ...employment, i140FiledOn: '2026-07-01' },
  admission: {
    ...admission,
    adjustmentBasis: 'employment',
    lawfulAdmissionFor245k: true,
  },
  fees: f.fees,
};
const withEmployment = (
  overrides: Partial<UsEmploymentAnswers>,
  petitionStatus?: UsAdmissionAnswers['petitionStatus'],
): UsFullRequest => ({
  ...e,
  employment: { ...employment, ...overrides },
  admission: { ...e.admission, petitionStatus },
});

const pendingPetition = (request: UsFullRequest): UsFullRequest => ({
  ...request,
  admission: { ...request.admission, petitionStatus: 'pending' },
});
const eb1a = withEmployment(
  {
    category: 'eb1a',
    internationalAward: false,
    extraordinaryEvidenceCount: 3,
    extraordinaryFinalMerits: 'cleared',
    continuesWorkInField: true,
    benefitsUnitedStates: true,
  },
  'approved',
);
const eb5 = withEmployment(
  {
    category: 'eb5',
    investment: {
      ...investor,
      project: 'tea',
      capitalUsd: 800000,
      qualifiesAsNewEnterprise: true,
    },
  },
  'approved',
);
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
      giftTransferred: 'cleared',
    },
  }),
  admission: {
    ...admission,
    process: 'consular',
    nvcDs260: 'submitted',
    nvcCivilDocuments: 'complete',
  },
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
    other: { ...n, dateOfBirth: '2008-11-24', permanentResident: undefined },
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
    other: { ...n, stateResidenceFrom: undefined },
    otherStatus: 'UNKNOWN',
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
    other: pendingPetition({
      ...eb1a,
      employment: { ...eb1a.employment, extraordinaryEvidenceCount: 2 },
    }),
    otherStatus: 'NOT_MET',
  },
  {
    id: 'C30-SELF-PETITION-MERITS',
    met: eb1a,
    other: pendingPetition({
      ...eb1a,
      employment: { ...eb1a.employment, extraordinaryFinalMerits: 'pending' },
    }),
    otherStatus: 'UNKNOWN',
  },
  {
    id: 'C31-INVESTMENT-AMOUNT',
    met: eb5,
    other: pendingPetition({ ...eb5, simulationDate: '2027-01-01' }),
    otherStatus: 'UNKNOWN',
  },
  {
    id: 'C31-INVESTMENT-PROJECT',
    met: eb5,
    other: pendingPetition({
      ...eb5,
      employment: {
        ...eb5.employment,
        investment: { ...eb5.employment!.investment, atRisk: false },
      },
    }),
    otherStatus: 'NOT_MET',
  },
  {
    id: 'C31-INVESTMENT-JOBS',
    met: eb5,
    other: pendingPetition({
      ...eb5,
      employment: {
        ...eb5.employment,
        investment: {
          ...eb5.employment!.investment,
          minimumWeeklyHours: 34,
          jobCreationPlan: 'none',
        },
      },
    }),
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
    met: { ...e, admission: { ...e.admission, qualifyingViolationsDays: 180 } },
    other: {
      ...e,
      admission: { ...e.admission, qualifyingViolationsDays: 181 },
    },
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
      path({ ...req, naturalization: { ...natural, oath: 'refuses' } }),
    ).toMatchObject({
      status: 'FUTURE',
      approvalStatus: 'NOT_MET',
      earliestDate: '2026-12-01',
    });
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
        sWitness: false,
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
    const unknownWitness: UsFullRequest = {
      ...t,
      travel: {
        ...travel,
        deportabilityFacts: {
          ...late,
          singleCimt: { ...late.singleCimt, sWitness: undefined },
        },
      },
    };
    expect(condition(unknownWitness, 'C21-DEPORTABILITY').status).toBe(
      'UNKNOWN',
    );
    expect(path(unknownWitness).status).toBe('UNKNOWN');
    expect(path(unknownWitness).earliestDate).toBeUndefined();
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

  test('Gold Card allocation and petition date cutoffs', () => {
    expect(condition(gold, 'C32-GOLD-ALLOCATION').pendingDetails).toEqual([
      'PD-266',
    ]);
    expect(path(gold)).toMatchObject({
      status: 'MET',
      approvalStatus: 'UNKNOWN',
    });
    expect(
      condition(
        { ...eb5, simulationDate: '2026-12-31' },
        'C31-INVESTMENT-AMOUNT',
      ).status,
    ).toBe('MET');
    expect(
      condition(
        pendingPetition({
          ...eb5,
          admission: { ...eb5.admission, petitionFiledOn: '2026-11-23' },
          employment: {
            ...eb5.employment,
            investment: {
              ...eb5.employment!.investment,
              project: 'standard',
              capitalUsd: 1049999,
            },
          },
        }),
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
        {
          ...short,
          simulationDate: '2026-11-22',
          fees: { channel: 'online', onlineCategoryAvailable: 'cleared' },
        },
        'C40-IMMIGRATION-HISTORY',
      ).status,
    ).toBe('NOT_MET');
    expect(condition(short, 'C40-IMMIGRATION-HISTORY').status).toBe('MET');
    const long = withAdmission({
      unlawfulDeparture: { leftOn: '2016-11-23', qualifyingDays: 365 },
    });
    expect(
      condition(
        {
          ...long,
          simulationDate: '2026-11-22',
          fees: { channel: 'online', onlineCategoryAvailable: 'cleared' },
        },
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
      nvcDs260: 'submitted',
      nvcCivilDocuments: 'complete',
      decisionOn: time.simulationDate,
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
    ).toBe('NOT_MET');
  });
});

describe('review86-1 regressions', () => {
  test('active-duty I-864 income depends on the sponsored relative', () => {
    const lowIncome = {
      ...support,
      activeDuty: true,
      household: { region: 'contiguous' as const, size: 2, incomeUsd: 23000 },
    };
    const adult: UsFullRequest = {
      ...f,
      family: {
        ...family,
        relationship: 'married-child',
        beneficiaryAge: 25,
        childRelationship: 'biological',
      },
      support: lowIncome,
    };
    const income = condition(adult, 'C25-SUPPORT-INCOME');
    expect(income.status).toBe('NOT_MET');
    expect(income.explanation).toContain('USD 27050');
    expect(path(adult)).toMatchObject({
      status: 'NOT_MET',
      approvalStatus: 'NOT_MET',
    });
    expect(path(adult).earliestDate).toBeUndefined();

    const minor: UsFullRequest = {
      ...adult,
      family: {
        ...adult.family,
        relationship: 'unmarried-child',
        beneficiaryAge: 20,
      },
    };
    expect(condition(minor, 'C25-SUPPORT-INCOME').status).toBe('MET');
    expect(condition(minor, 'C25-SUPPORT-INCOME').explanation).toContain(
      'USD 21640',
    );
    expect(path(minor)).toMatchObject({
      status: 'MET',
      approvalStatus: 'MET',
      earliestDate: time.simulationDate,
    });

    const agedOut: UsFullRequest = {
      ...minor,
      family: { ...minor.family, beneficiaryAge: 21, cspaAge: 20 },
    };
    expect(condition(agedOut, 'C25-SUPPORT-INCOME').status).toBe('NOT_MET');
    expect(condition(agedOut, 'C33-VISA-AND-ENTRY').status).toBe('MET');
  });

  test('paper I-751 gets Monday receipt inside the window while online can file Saturday', () => {
    const saturday = { ...conditions, simulationDate: '2026-11-21' };
    expect(condition(saturday, 'TIME-CONDITIONS-FILING').status).toBe(
      'NOT_MET',
    );
    expect(condition(saturday, 'C16-I751-FILING').status).toBe('MET');
    expect(path(saturday)).toMatchObject({
      status: 'FUTURE',
      approvalStatus: 'FUTURE',
      earliestDate: '2026-11-23',
    });
    const online: UsFullRequest = { ...saturday, fees: { channel: 'online' } };
    expect(condition(online, 'TIME-CONDITIONS-FILING').status).toBe('MET');
    expect(path(online)).toMatchObject({
      status: 'MET',
      approvalStatus: 'MET',
      earliestDate: '2026-11-21',
    });
  });

  test('paper receipt applies to holiday filings across paths, including I-751 waivers and I-829', () => {
    const waiver: UsFullRequest = {
      ...conditions,
      conditions: {
        marriage: { ...marriage, filing: 'hardship', waiverBasis: 'cleared' },
      },
    };
    const employed = withEmployment(
      { i140FiledOn: '2026-07-01', wagePeriodThrough: '2026-11-27' },
      'approved',
    );
    for (const request of [
      n,
      spouse,
      conditions,
      waiver,
      i829,
      f,
      employed,
      p7,
      h,
      m,
    ]) {
      const result = path({
        ...request,
        simulationDate: '2026-11-26',
        fees: { channel: 'paper' },
      });
      expect(result, request.pathway).toMatchObject({
        status: 'FUTURE',
        earliestDate: '2026-11-27',
      });
    }
    const i829NoChannel = {
      ...i829,
      simulationDate: '2026-11-26',
      fees: undefined,
    };
    expect(path(i829NoChannel)).toMatchObject({
      status: 'FUTURE',
      earliestDate: '2026-11-27',
    });
    const returning: UsFullRequest = {
      ...t,
      simulationDate: '2026-11-26',
      fees: { channel: 'paper' },
    };
    expect(path(returning)).toMatchObject({
      status: 'MET',
      earliestDate: '2026-11-26',
    });
    expect(path(returning).approvalStatus).toBeUndefined();
  });

  test('pending I-751 permits N-400 filing while approval awaits a decision', () => {
    const pending: UsFullRequest = {
      ...spouse,
      permanentResident: '2023-11-23',
      conditional: 'marriage',
      naturalization: {
        ...spouse.naturalization,
        conditionalStatusResolved: false,
      },
    };
    expect(condition(pending, 'C02-LAWFUL-LPR')).toMatchObject({
      status: 'UNKNOWN',
      filingStatus: 'MET',
      pendingDetails: ['PD-274'],
    });
    expect(path(pending)).toMatchObject({
      status: 'MET',
      approvalStatus: 'UNKNOWN',
      earliestDate: time.simulationDate,
    });
    expect(
      path({
        ...pending,
        naturalization: {
          ...pending.naturalization,
          conditionalStatusResolved: true,
        },
      }).approvalStatus,
    ).toBe('MET');
  });

  test('passing both exams is sufficient when a requested N-648 is denied', () => {
    const denied = withNatural({
      disability: {
        requested: true,
        months: 12,
        illegalDrugCause: false,
        clinicianCertified: true,
        englishWaived: 'barred',
        civicsWaived: 'barred',
      },
    });
    expect(condition(denied, 'C05-N648')).toMatchObject({
      status: 'NOT_MET',
      informational: true,
    });
    expect(condition(denied, 'C03-ENGLISH').status).toBe('MET');
    expect(condition(denied, 'C04-CIVICS').status).toBe('MET');
    expect(path(denied)).toMatchObject({
      status: 'MET',
      approvalStatus: 'MET',
      earliestDate: time.simulationDate,
    });
    const preparing: UsFullRequest = {
      ...denied,
      naturalization: {
        ...denied.naturalization,
        english: 'preparing',
        civics: 'preparing',
      },
    };
    expect(path(preparing)).toMatchObject({
      status: 'MET',
      approvalStatus: 'UNKNOWN',
      earliestDate: time.simulationDate,
    });
  });

  test('SIJ is exempt from the status interruption bar, with independent bars still checked', () => {
    const sij = withAdmission({
      adjustmentBasis: 'sij',
      legalEntry: 'without-inspection',
      entryException: 'cleared',
      qualifyingViolationsDays: 365,
      otherAdjustmentBar: 'none',
    });
    expect(condition(sij, 'C34-ADJUSTMENT-BARS').status).toBe('MET');
    expect(path(sij)).toMatchObject({
      status: 'MET',
      approvalStatus: 'MET',
      earliestDate: time.simulationDate,
    });
    const barred: UsFullRequest = {
      ...sij,
      admission: { ...sij.admission, otherAdjustmentBar: 'barred' },
    };
    expect(condition(barred, 'C34-ADJUSTMENT-BARS').status).toBe('NOT_MET');
    expect(path(barred)).toMatchObject({
      status: 'NOT_MET',
      approvalStatus: 'NOT_MET',
    });
    expect(path(barred).earliestDate).toBeUndefined();
  });

  test('I-485 does not restart PERM validity after a timely I-140', () => {
    const approved = withEmployment(
      { permCertifiedOn: '2025-06-01', i140FiledOn: '2025-07-01' },
      'approved',
    );
    expect(condition(approved, 'C28-OFFER-PERM').status).toBe('MET');
    expect(path(approved)).toMatchObject({
      status: 'MET',
      approvalStatus: 'MET',
      earliestDate: time.simulationDate,
    });
    const missing = withEmployment(
      { permCertifiedOn: '2025-06-01' },
      'approved',
    );
    expect(condition(missing, 'C28-OFFER-PERM')).toMatchObject({
      status: 'MET',
      filingStatus: 'MET',
    });
    expect(path(missing)).toMatchObject({
      status: 'MET',
      approvalStatus: 'MET',
      earliestDate: time.simulationDate,
    });
    const late = withEmployment(
      { permCertifiedOn: '2025-06-01', i140FiledOn: '2025-11-29' },
      'pending',
    );
    expect(condition(late, 'C28-OFFER-PERM').status).toBe('NOT_MET');
    expect(path(late).approvalStatus).toBe('NOT_MET');
  });

  test('missing CSPA age leaves immediate-relative eligibility open when both charts are closed', () => {
    const child: UsFullRequest = {
      ...f,
      family: {
        ...family,
        relationship: 'unmarried-child',
        beneficiaryAge: 21,
        childRelationship: 'biological',
      },
      admission: {
        ...admission,
        adjustmentBasis: 'family-preference',
        visaAtFiling: 'unavailable',
        visaAtDecision: 'unavailable',
      },
    };
    for (const pathway of ['US-FAMILY', 'US-ADJUSTMENT'] as const) {
      const request = { ...child, pathway };
      expect(condition(request, 'C33-VISA-AND-ENTRY')).toMatchObject({
        status: 'UNKNOWN',
        filingStatus: 'UNKNOWN',
        pendingDetails: ['PD-272'],
      });
      expect(path(request)).toMatchObject({
        status: 'UNKNOWN',
        approvalStatus: 'UNKNOWN',
      });
      expect(path(request).earliestDate).toBeUndefined();
    }
    const locked = { ...child, family: { ...child.family, cspaAge: 20 } };
    expect(condition(locked, 'C33-VISA-AND-ENTRY').status).toBe('MET');
    expect(path(locked)).toMatchObject({
      status: 'MET',
      approvalStatus: 'MET',
      earliestDate: time.simulationDate,
    });
  });

  test.each([
    ['individual', 2000000],
    ['company', 3000000],
  ] as const)(
    'Gold Card adds a fixed dependent gift for a %s donor',
    (donor, threshold) => {
      const dependent = {
        ...gold,
        employment: {
          ...gold.employment,
          gold: {
            ...gold.employment!.gold,
            donor,
            includedPeople: 2,
            processingFundsUsd: 30000,
          },
        },
      };
      const gift = condition(dependent, 'C32-GOLD-GIFT');
      expect(gift.status).toBe('NOT_MET');
      expect(gift.explanation).toContain(`USD ${threshold}`);
      expect(gift.pendingDetails).toBeUndefined();
      expect(condition(dependent, 'C44-I140G').explanation).toContain(
        'USD 30000',
      );
      expect(path(dependent)).toMatchObject({
        status: 'NOT_MET',
        approvalStatus: 'NOT_MET',
      });
      expect(path(dependent).earliestDate).toBeUndefined();
      const funded = {
        ...dependent,
        employment: {
          ...dependent.employment,
          gold: { ...dependent.employment.gold, giftUsd: threshold },
        },
      };
      expect(condition(funded, 'C32-GOLD-GIFT').status).toBe('MET');
      expect(path(funded)).toMatchObject({
        status: 'MET',
        approvalStatus: 'UNKNOWN',
        earliestDate: time.simulationDate,
      });
    },
  );

  test('retrogression and decision-time humanitarian presence do not move the filing date', () => {
    const retrogressed: UsFullRequest = {
      ...e,
      admission: {
        ...e.admission,
        visaAtDecision: 'unavailable',
        discretion: 'pending',
      },
    };
    expect(condition(retrogressed, 'C33-VISA-AND-ENTRY')).toMatchObject({
      status: 'NOT_MET',
      filingStatus: 'MET',
    });
    expect(path(retrogressed)).toMatchObject({
      status: 'MET',
      approvalStatus: 'NOT_MET',
      earliestDate: time.simulationDate,
    });
    const unpublished: UsFullRequest = {
      ...retrogressed,
      admission: { ...retrogressed.admission, visaAtFiling: 'future-bulletin' },
    };
    expect(condition(unpublished, 'C33-VISA-AND-ENTRY')).toMatchObject({
      status: 'NOT_MET',
      filingStatus: 'UNKNOWN',
      pendingDetails: ['PD-272'],
    });
    expect(path(unpublished)).toMatchObject({
      status: 'UNKNOWN',
      approvalStatus: 'NOT_MET',
    });
    expect(path(unpublished).earliestDate).toBeUndefined();
    for (const status of ['refugee', 'asylee'] as const) {
      const short: UsFullRequest = {
        ...h,
        humanitarian: {
          ...human,
          status,
          presenceDays: 364,
          refugeeDefinitionOrDerivative: true,
          firmlyResettled: false,
          discretion: 'cleared',
        },
      };
      expect(condition(short, 'C41-HUMANITARIAN-PRESENCE')).toMatchObject({
        status: 'NOT_MET',
        filingStatus: 'NOT_APPLICABLE',
      });
      expect(path(short)).toMatchObject({
        status: 'MET',
        approvalStatus: 'FUTURE',
        earliestDate: time.simulationDate,
        approvalEarliestDate: '2026-11-24',
      });
    }
  });

  test('initial EB-5 uses expected investment and documented projected jobs, separately from I-829', () => {
    const facts = {
      ...eb5.employment!.investment,
      sustainmentYears: 0.5,
      qualifyingJobs: 0,
    };
    const unproven = pendingPetition({
      ...eb5,
      admission: { ...eb5.admission, petitionFiledOn: '2026-11-02' },
      employment: { ...eb5.employment, investment: facts },
    });
    expect(condition(unproven, 'C31-INVESTMENT-PROJECT')).toMatchObject({
      status: 'UNKNOWN',
      pendingDetails: ['PD-278'],
    });
    expect(condition(unproven, 'C31-INVESTMENT-JOBS')).toMatchObject({
      status: 'UNKNOWN',
      pendingDetails: ['PD-278'],
    });
    expect(path(unproven).earliestDate).toBeUndefined();
    const plan: UsFullRequest = {
      ...unproven,
      employment: {
        ...unproven.employment,
        investment: {
          ...facts,
          expectedSustainmentYears: 2,
          jobCreationPlan: {
            evidence: 'cleared',
            qualifyingJobs: 10,
            minimumWeeklyHours: 35,
          },
        },
      },
    };
    expect(condition(plan, 'C31-INVESTMENT-PROJECT').status).toBe('MET');
    expect(condition(plan, 'C31-INVESTMENT-JOBS').status).toBe('MET');
    expect(path(plan)).toMatchObject({
      status: 'MET',
      approvalStatus: 'UNKNOWN',
      earliestDate: time.simulationDate,
    });
    const removal = {
      ...i829,
      conditions: { investor: { ...investor, ...plan.employment!.investment } },
    };
    expect(condition(removal, 'C17-CAPITAL').status).toBe('NOT_MET');
    expect(condition(removal, 'C17-JOBS').status).toBe('UNKNOWN');
    expect(path(removal).status).toBe('NOT_MET');
    expect(path(removal).earliestDate).toBeUndefined();
  });

  test('applies a paper N-336 fee waiver and cites the separate DS-117 fee item', () => {
    const waiver: UsFullRequest = {
      ...n,
      fees: {
        channel: 'paper',
        relief: 'waiver',
        receivesMeansTestedBenefit: true,
      },
    };
    expect(condition(waiver, 'C44-N336')).toMatchObject({
      status: 'MET',
      explanation: 'Scheduled form fee: USD 0.',
    });
    expect(path(waiver)).toMatchObject({
      status: 'MET',
      approvalStatus: 'MET',
      earliestDate: time.simulationDate,
    });
    const ds117: UsFullRequest = {
      ...t,
      travel: { ...travel, feeForm: 'ds117' },
    };
    expect(condition(ds117, 'C44-DS117')).toMatchObject({
      status: 'MET',
      explanation: 'Scheduled form fee: USD 180.',
      sources: [{ srcId: 'SRC-317', locator: '22 CFR 22.1, item 35(a)' }],
    });
  });
});

describe('review86-2 regressions', () => {
  test('pre-RIA I-829 can be filed before the conditional residence sustainment period ends', () => {
    const early: UsFullRequest = {
      ...i829,
      permanentResident: '2024-11-30',
      conditions: {
        investor: {
          ...investor,
          originalPetitionFiledOn: '2022-03-14',
          continuousInvestmentDuringConditionalResidence: 'cleared',
        },
      },
    };
    expect(condition(early, 'C17-CAPITAL')).toMatchObject({
      status: 'NOT_MET',
      filingStatus: 'MET',
    });
    expect(path(early)).toMatchObject({
      status: 'MET',
      earliestDate: '2026-11-23',
      approvalStatus: 'FUTURE',
      approvalEarliestDate: '2026-11-30',
    });
    expect(path({ ...early, simulationDate: '2026-11-30' })).toMatchObject({
      approvalStatus: 'MET',
      approvalEarliestDate: '2026-11-30',
    });
  });

  test.each([
    [n, '2022-01-01', 4.89],
    [spouse, '2024-01-01', 2.89],
  ] as const)(
    'early N-400 filing keeps the full residence anniversary for approval (%#)',
    (request, permanentResident, lprResidenceYears) => {
      const early = {
        ...request,
        permanentResident,
        naturalization: { ...request.naturalization, lprResidenceYears },
      };
      expect(path(early)).toMatchObject({
        status: 'MET',
        earliestDate: '2026-11-23',
        approvalStatus: 'FUTURE',
        approvalEarliestDate: '2027-01-01',
      });
      expect(path({ ...early, simulationDate: '2027-01-01' })).toMatchObject({
        status: 'MET',
        earliestDate: '2027-01-01',
        approvalStatus: 'MET',
        approvalEarliestDate: '2027-01-01',
      });
      const pendingExam = {
        ...early,
        naturalization: {
          ...early.naturalization,
          english: 'preparing' as const,
        },
      };
      expect(path(pendingExam)).toMatchObject({
        status: 'MET',
        earliestDate: '2026-11-23',
        approvalStatus: 'UNKNOWN',
      });
      expect(path(pendingExam).approvalEarliestDate).toBeUndefined();
    },
  );

  test('defaults paper-only applications to their paper receipt day', () => {
    const saturday = '2026-11-21';
    const asylee: UsFullRequest = {
      ...h,
      humanitarian: {
        ...human,
        status: 'asylee',
        refugeeDefinitionOrDerivative: true,
        firmlyResettled: false,
        discretion: 'cleared',
      },
    };
    const noOnlineAccess: UsFullRequest = {
      ...p7,
      fees: { onlineCategoryAvailable: 'barred' },
    };
    const sij: UsFullRequest = {
      ...p7,
      family: undefined,
      admission: { ...admission, adjustmentBasis: 'sij' },
      fees: undefined,
    };
    const paperRelief: UsFullRequest = { ...n, fees: { relief: 'reduced' } };
    for (const request of [
      h,
      asylee,
      noOnlineAccess,
      sij,
      { ...eb5, fees: undefined },
      paperRelief,
    ]) {
      expect(path({ ...request, simulationDate: saturday })).toMatchObject({
        status: 'FUTURE',
        earliestDate: '2026-11-23',
        approvalStatus: 'FUTURE',
        approvalEarliestDate: '2026-11-23',
      });
    }
    for (const request of [
      n,
      spouse,
      m,
      { ...conditions, fees: undefined },
      { ...p7, fees: { onlineCategoryAvailable: 'cleared' as const } },
    ]) {
      expect(path({ ...request, simulationDate: saturday })).toMatchObject({
        status: 'MET',
        approvalStatus: 'MET',
        earliestDate: saturday,
      });
    }
  });

  test('keeps registration, address reporting and replacement as separate travel obligations', () => {
    const returning: UsFullRequest = {
      ...t,
      trips: [{ departed: '2026-11-15', returned: '2026-11-23' }],
      travel: {
        ...travel,
        movedOn: '2026-11-01',
        addressReportedOn: 'not-reported',
        cardExpiresOn: '2027-03-01',
        carryingEvidence: false,
      },
    };
    expect(condition(returning, 'C22-RETURN-DOCUMENT').status).toBe('MET');
    for (const id of ['C18-REGISTRATION', 'C19-ADDRESS', 'C19-REPLACEMENT']) {
      expect(condition(returning, id)).toMatchObject({
        status: 'NOT_MET',
        informational: true,
      });
    }
    expect(path(returning)).toMatchObject({
      status: 'MET',
      earliestDate: '2026-11-23',
    });
    expect(path(returning).approvalStatus).toBeUndefined();
    const noDocument = {
      ...returning,
      travel: { ...returning.travel, documentValidAtReturn: false },
    };
    expect(path(noDocument).status).toBe('NOT_MET');
    expect(path(noDocument).earliestDate).toBeUndefined();
  });

  test('requires the actual receipt month for paper I-485 in all three preference pathways', () => {
    const preference: UsFullRequest = {
      ...f,
      family: {
        ...family,
        petitioner: 'lpr',
        priorMarriageLprSince: 'not-applicable',
      },
      support: { ...support, sponsorStatus: 'lpr' },
      admission: { ...admission, adjustmentBasis: 'family-preference' },
    };
    const employed = withEmployment(
      { i140FiledOn: '2026-07-01', wagePeriodThrough: '2026-11-02' },
      'approved',
    );
    for (const request of [
      preference,
      employed,
      { ...preference, pathway: 'US-ADJUSTMENT' as const },
    ]) {
      const monthEnd = { ...request, simulationDate: '2026-10-31' };
      expect(path(monthEnd), request.pathway).toMatchObject({
        status: 'UNKNOWN',
        approvalStatus: 'UNKNOWN',
        pendingDetails: expect.arrayContaining(['PD-272']),
      });
      expect(path(monthEnd).earliestDate).toBeUndefined();
      expect(path(monthEnd).approvalEarliestDate).toBeUndefined();
      const withNovember = (
        availability: 'available' | 'unavailable' | 'future-bulletin',
        finalAction?: 'available' | 'unavailable' | 'future-bulletin',
      ) => ({
        ...monthEnd,
        admission: {
          ...monthEnd.admission,
          visaAtFilingByMonth: { '2026-11': availability },
          visaAtDecisionByMonth: { '2026-11': finalAction },
        },
      });
      const missingFinalAction = path(withNovember('available'));
      expect(missingFinalAction, request.pathway).toMatchObject({
        status: 'FUTURE',
        earliestDate: '2026-11-02',
        approvalStatus: 'UNKNOWN',
        pendingDetails: expect.arrayContaining(['PD-272']),
      });
      expect(missingFinalAction.approvalEarliestDate).toBeUndefined();
      const retrogressed = path(withNovember('available', 'unavailable'));
      expect(retrogressed).toMatchObject({
        status: 'FUTURE',
        earliestDate: '2026-11-02',
        approvalStatus: 'NOT_MET',
      });
      expect(retrogressed.approvalEarliestDate).toBeUndefined();
      expect(
        path(withNovember('available', 'available')),
        request.pathway,
      ).toMatchObject({
        status: 'FUTURE',
        earliestDate: '2026-11-02',
        approvalStatus: 'FUTURE',
        approvalEarliestDate: '2026-11-02',
      });
      const unavailable = path(withNovember('unavailable'));
      expect(unavailable).toMatchObject({
        status: 'NOT_MET',
        approvalStatus: 'NOT_MET',
      });
      expect(unavailable.earliestDate).toBeUndefined();
      expect(path(withNovember('future-bulletin')).status).toBe('UNKNOWN');
      expect(
        path({
          ...monthEnd,
          fees: { channel: 'online', onlineCategoryAvailable: 'cleared' },
        }),
      ).toMatchObject({
        status: 'MET',
        earliestDate: '2026-10-31',
        approvalStatus: 'MET',
      });
    }
    expect(path({ ...f, simulationDate: '2026-10-31' })).toMatchObject({
      status: 'FUTURE',
      earliestDate: '2026-11-02',
      approvalStatus: 'FUTURE',
    });
    const consular: UsFullRequest = {
      ...preference,
      pathway: 'US-ADJUSTMENT',
      simulationDate: '2026-10-31',
      admission: {
        ...preference.admission,
        process: 'consular',
        nvcDs260: 'submitted',
        nvcCivilDocuments: 'complete',
        decisionOn: '2026-10-31',
        visaAtFilingByMonth: { '2026-10': 'unavailable' },
      },
    };
    expect(path(consular)).toMatchObject({
      status: 'MET',
      earliestDate: '2026-10-31',
      approvalStatus: 'MET',
      approvalEarliestDate: '2026-10-31',
    });
  });

  test.each([
    ['C36-HEALTH', { classAHealth: 'barred' }],
    ['C38-CRIMINAL-INADMISSIBILITY', { criminalOtherGround: 'barred' }],
    ['C39-SECURITY', { securityGround: 'other-bar' }],
    ['C40-IMMIGRATION-HISTORY', { immigrationFraud: true }],
  ] satisfies [string, Partial<UsAdmissionAnswers>][])(
    'a pending INA 209(c) waiver only holds approval for %s',
    (id, ground) => {
      const pending: UsFullRequest = {
        ...h,
        humanitarian: { ...human, waiver: 'pending' },
        admission: { ...admission, ...ground },
      };
      expect(condition(pending, id)).toMatchObject({
        status: 'UNKNOWN',
        filingStatus: 'MET',
      });
      expect(path(pending)).toMatchObject({
        status: 'MET',
        earliestDate: '2026-11-23',
        approvalStatus: 'UNKNOWN',
      });
      expect(path(pending).approvalEarliestDate).toBeUndefined();

      const ready: UsFullRequest = {
        ...pending,
        humanitarian: {
          ...pending.humanitarian,
          waiverFiling: 'cleared',
          waiver: undefined,
        },
      };
      expect(path(ready)).toMatchObject({
        status: 'MET',
        earliestDate: '2026-11-23',
        approvalStatus: 'UNKNOWN',
      });

      const noMaterials: UsFullRequest = {
        ...pending,
        humanitarian: { ...pending.humanitarian, waiverFiling: 'barred' },
      };
      expect(path(noMaterials)).toMatchObject({
        status: 'NOT_MET',
        approvalStatus: 'UNKNOWN',
      });
      expect(path(noMaterials).earliestDate).toBeUndefined();
      const granted: UsFullRequest = {
        ...pending,
        humanitarian: { ...pending.humanitarian, waiver: 'cleared' },
      };
      expect(path(granted)).toMatchObject({
        status: 'MET',
        earliestDate: '2026-11-23',
        approvalStatus: 'MET',
        approvalEarliestDate: '2026-11-23',
      });
    },
  );

  test('a pending humanitarian waiver cannot override a nonwaivable ground', () => {
    const pending: UsFullRequest = {
      ...h,
      humanitarian: { ...human, waiver: 'pending' },
      admission: {
        ...admission,
        drugTraffickingBar: true,
        securityGround: 'nonwaivable',
      },
    };
    expect(path(pending)).toMatchObject({
      status: 'NOT_MET',
      approvalStatus: 'NOT_MET',
    });
    expect(path(pending).earliestDate).toBeUndefined();
    expect(path(pending).approvalEarliestDate).toBeUndefined();
  });
});

describe('review86-3 regressions', () => {
  test.each([
    [
      n,
      { ...n, naturalization: { ...natural, lawfulAdmission: undefined } },
      'C02-LAWFUL-LPR',
    ],
    [
      spouse,
      {
        ...spouse,
        naturalization: {
          ...spouse.naturalization,
          spouse: {
            ...spouse.naturalization?.spouse,
            livedTogetherRequiredPeriod: 'pending',
          },
        },
      },
      'C13-MARITAL-UNION',
    ],
    [
      conditions,
      {
        ...conditions,
        conditions: { marriage: { ...marriage, filing: 'separate-child' } },
      },
      'C16-I751-FILING',
    ],
    [
      t,
      { ...t, travel: { ...travel, documentValidAtReturn: undefined } },
      'C22-RETURN-DOCUMENT',
    ],
    [
      f,
      { ...f, family: { ...family, relationship: undefined } },
      'C24-PETITION-BARS',
    ],
    [
      e,
      withEmployment({ relativePetitioner: undefined }),
      'C27-SUPPORT-EXEMPTION',
    ],
    [p7, withAdmission({ medicalEvidence: 'pending' }), 'C36-HEALTH'],
    [p7, withAdmission({ medicalEvidence: undefined }), 'C36-HEALTH'],
    [
      p7,
      withAdmission({
        classAHealth: 'barred',
        healthWaiver: 'cleared',
        vaccines: 'pending',
      }),
      'C36-HEALTH',
    ],
    [
      p7,
      withAdmission({ drugTraffickingBar: undefined }),
      'C38-CRIMINAL-INADMISSIBILITY',
    ],
    [
      h,
      {
        ...h,
        humanitarian: { ...human, waiver: 'pending' },
        admission: {
          ...admission,
          drugTraffickingBar: undefined,
          criminalOtherGround: 'barred',
        },
      },
      'C38-CRIMINAL-INADMISSIBILITY',
    ],
    [
      m,
      { ...m, military: { ...military, honorableService: undefined } },
      'C43-SERVICE',
    ],
  ] satisfies [UsFullRequest, UsFullRequest, string][])(
    'keeps missing evidence unknown (%#)',
    (complete, incomplete, id) => {
      expect(condition(complete, id).status).toBe('MET');
      expect(path(complete)).toMatchObject({
        status: 'MET',
        earliestDate: time.simulationDate,
      });
      expect(condition(incomplete, id).status).toBe('UNKNOWN');
      const outcome = path(incomplete);
      expect(outcome.status).toBe('UNKNOWN');
      expect(outcome.approvalStatus).toBe(
        incomplete.pathway === 'US-TRAVEL' ? undefined : 'UNKNOWN',
      );
      expect(outcome.earliestDate).toBeUndefined();
      expect(outcome.approvalEarliestDate).toBeUndefined();
    },
  );

  test('rejects a selected unavailable online channel and suppresses both dates', () => {
    const saturday = '2026-11-21';
    const blocked: UsFullRequest[] = [
      { ...h, fees: { channel: 'online' } },
      { ...p7, fees: { channel: 'online', onlineCategoryAvailable: 'barred' } },
      { ...n, fees: { channel: 'online', relief: 'reduced' } },
      { ...i829, fees: { channel: 'online' } },
      {
        ...eb5,
        fees: { channel: 'online', onlineCategoryAvailable: 'cleared' },
      },
    ];
    for (const request of blocked) {
      const result = path({ ...request, simulationDate: saturday });
      expect(result, request.pathway).toMatchObject({
        status: 'NOT_MET',
        approvalStatus: 'NOT_MET',
      });
      expect(result.earliestDate).toBeUndefined();
      expect(result.approvalEarliestDate).toBeUndefined();
    }
    for (const available of [undefined, 'pending'] as const) {
      const result = path({
        ...p7,
        simulationDate: saturday,
        fees: { channel: 'online', onlineCategoryAvailable: available },
      });
      expect(result).toMatchObject({
        status: 'UNKNOWN',
        approvalStatus: 'UNKNOWN',
        pendingDetails: expect.arrayContaining(['PD-267']),
      });
      expect(result.earliestDate).toBeUndefined();
      expect(result.approvalEarliestDate).toBeUndefined();
    }
    expect(
      path({
        ...p7,
        simulationDate: saturday,
        fees: { channel: 'online', onlineCategoryAvailable: 'cleared' },
      }),
    ).toMatchObject({
      status: 'MET',
      earliestDate: saturday,
      approvalStatus: 'MET',
      approvalEarliestDate: saturday,
    });
  });

  test('a timely pending I-140 permits filing under either basis answer, while approval waits', () => {
    for (const qualifyingBasis of ['cleared', 'pending'] as const) {
      const pending: UsFullRequest = {
        ...withEmployment({ i140FiledOn: '2026-07-01' }),
        admission: {
          ...e.admission,
          qualifyingBasis,
          petitionStatus: 'pending',
        },
      };
      expect(condition(pending, 'C33-VISA-AND-ENTRY')).toMatchObject({
        filingStatus: 'MET',
        status: 'UNKNOWN',
      });
      expect(path(pending)).toMatchObject({
        status: 'MET',
        earliestDate: time.simulationDate,
        approvalStatus: 'UNKNOWN',
      });
      expect(path(pending).approvalEarliestDate).toBeUndefined();
      const unavailable: UsFullRequest = {
        ...pending,
        admission: { ...pending.admission, visaAtFiling: 'unavailable' },
      };
      expect(path(unavailable)).toMatchObject({
        status: 'NOT_MET',
        approvalStatus: 'NOT_MET',
      });
      expect(path(unavailable).earliestDate).toBeUndefined();
      expect(path(unavailable).approvalEarliestDate).toBeUndefined();
    }
    const approved = withEmployment({ i140FiledOn: '2026-07-01' }, 'approved');
    expect(path(approved)).toMatchObject({
      status: 'MET',
      earliestDate: time.simulationDate,
      approvalStatus: 'MET',
      approvalEarliestDate: time.simulationDate,
    });
  });

  test('other supported concurrent cases can file while their underlying petition is pending', () => {
    const withBasis = (
      adjustmentBasis: UsAdmissionAnswers['adjustmentBasis'],
    ): UsFullRequest => ({
      ...p7,
      family: undefined,
      admission: { ...admission, adjustmentBasis },
    });
    const preference: UsFullRequest = {
      ...f,
      family: {
        ...family,
        petitioner: 'lpr',
        priorMarriageLprSince: 'not-applicable',
      },
      support: { ...support, sponsorStatus: 'lpr' },
      admission: { ...admission, adjustmentBasis: 'family-preference' },
    };
    for (const request of [
      f,
      preference,
      eb1a,
      eb5,
      withBasis('vawa'),
      withBasis('sij'),
    ]) {
      for (const petitionStatus of ['pending', 'filed-with-i485'] as const) {
        const result = path({
          ...request,
          admission: {
            ...request.admission,
            qualifyingBasis: 'pending',
            petitionStatus,
            petitionFiledOn:
              request === eb5 && petitionStatus === 'pending'
                ? '2026-11-02'
                : undefined,
          },
        });
        expect(
          result,
          `${request.pathway}/${request.admission?.adjustmentBasis}`,
        ).toMatchObject({
          status: 'MET',
          earliestDate: time.simulationDate,
          approvalStatus: 'UNKNOWN',
        });
        expect(result.approvalEarliestDate).toBeUndefined();
      }
    }
    const unclassified = path({
      ...p7,
      admission: {
        ...p7.admission,
        adjustmentBasis: 'other',
        qualifyingBasis: 'pending',
        petitionStatus: 'pending',
      },
    });
    expect(unclassified).toMatchObject({
      status: 'UNKNOWN',
      approvalStatus: 'UNKNOWN',
    });
    expect(unclassified.earliestDate).toBeUndefined();
    expect(unclassified.approvalEarliestDate).toBeUndefined();
  });

  test('uses the separately supplied adjudication month even when filing is current', () => {
    const input: UsFullRequest = {
      ...e,
      employment: { ...e.employment, wagePeriodThrough: '2026-12-15' },
      admission: { ...e.admission, decisionOn: '2026-12-15' },
    };
    expect(path(input)).toMatchObject({
      status: 'MET',
      earliestDate: time.simulationDate,
      approvalStatus: 'UNKNOWN',
    });
    expect(path(input).approvalEarliestDate).toBeUndefined();
    expect(
      path({
        ...input,
        admission: {
          ...input.admission,
          visaAtDecisionByMonth: { '2026-12': 'available' },
        },
      }),
    ).toMatchObject({
      status: 'MET',
      earliestDate: time.simulationDate,
      approvalStatus: 'FUTURE',
      approvalEarliestDate: '2026-12-15',
    });
  });

  test.each([
    [n, '2022-01-01'],
    [spouse, '2024-01-01'],
  ] as const)(
    'uses the examination for an eligible early N-400 filing (%#)',
    (request, permanentResident) => {
      const moved = {
        ...request,
        permanentResident,
        stateResidenceFrom: '2026-10-01',
      };
      expect(path(moved)).toMatchObject({
        status: 'MET',
        earliestDate: time.simulationDate,
        approvalStatus: 'UNKNOWN',
      });
      expect(path(moved).approvalEarliestDate).toBeUndefined();
      expect(condition(moved, 'C14-DISTRICT')).toMatchObject({
        filingStatus: 'MET',
        status: 'UNKNOWN',
        pendingDetails: ['PD-096'],
      });
      const withInterview = (interviewOn: string) =>
        path({
          ...moved,
          naturalization: { ...moved.naturalization, interviewOn },
        });
      expect(withInterview('2026-12-31')).toMatchObject({
        status: 'MET',
        earliestDate: time.simulationDate,
        approvalStatus: 'NOT_MET',
      });
      expect(withInterview('2026-12-31').approvalEarliestDate).toBeUndefined();
      expect(withInterview('2027-01-01')).toMatchObject({
        status: 'MET',
        earliestDate: time.simulationDate,
        approvalStatus: 'FUTURE',
        approvalEarliestDate: '2027-01-01',
      });
      expect(
        path({ ...moved, stateResidenceFrom: '2026-10-02' }),
      ).toMatchObject({
        status: 'FUTURE',
        earliestDate: '2027-01-02',
        approvalStatus: 'FUTURE',
        approvalEarliestDate: '2027-01-02',
      });
      expect(
        evaluateUnitedStates({
          ...time,
          permanentResident,
          stateResidenceFrom: '2026-10-01',
          marriage: request.marriage,
        }).pathways.find((item) => item.id === request.pathway),
      ).toMatchObject({ status: 'FUTURE', earliestDate: '2027-01-01' });
    },
  );
});

const authorizedConsular: UsFullRequest = {
  ...f,
  admission: {
    ...admission,
    process: 'consular',
    petitionStatus: 'approved',
    nvcDs260: 'submitted',
    nvcCivilDocuments: 'complete',
  },
};

describe('review86-4 regressions', () => {
  const consular = authorizedConsular;
  test.each([
    ['unavailable', 'NOT_MET'],
    [undefined, 'UNKNOWN'],
    ['future-bulletin', 'UNKNOWN'],
  ] as const)(
    'uses NVC authorization for an immediate relative (%s)',
    (visaAtFiling, status) => {
      const request: UsFullRequest = {
        ...consular,
        admission: { ...consular.admission, visaAtFiling },
      };
      expect(condition(request, 'C33-VISA-AND-ENTRY')).toMatchObject({
        filingStatus: status,
        status,
      });
      const result = path(request);
      expect(result).toMatchObject({ status, approvalStatus: status });
      expect(result.earliestDate).toBeUndefined();
      expect(result.approvalEarliestDate).toBeUndefined();
    },
  );

  test('uses a confirmed future NVC opening independently of the adjudication chart', () => {
    const opensOn = '2026-12-01';
    const request: UsFullRequest = {
      ...withEmployment({
        i140FiledOn: '2026-07-01',
        wagePeriodThrough: '2027-01-05',
      }),
      admission: {
        ...e.admission,
        process: 'consular',
        petitionStatus: 'approved',
        nvcDs260: 'submitted',
        nvcCivilDocuments: 'complete',
        visaAtFiling: 'unavailable',
        nvcFilingOpensOn: opensOn,
      },
    };
    const awaitingChart = path(request);
    expect(awaitingChart).toMatchObject({
      status: 'FUTURE',
      earliestDate: opensOn,
      approvalStatus: 'UNKNOWN',
    });
    expect(awaitingChart.approvalEarliestDate).toBeUndefined();
    const withChart: UsFullRequest = {
      ...request,
      admission: {
        ...request.admission,
        visaAtDecisionByMonth: { '2026-12': 'available' },
      },
    };
    for (const decisionOn of [undefined, '2026-11-30', opensOn]) {
      const candidate = {
        ...withChart,
        admission: { ...withChart.admission, decisionOn },
      };
      expect(condition(candidate, 'C33-VISA-AND-ENTRY')).toMatchObject({
        filingStatus: 'MET',
        status: 'UNKNOWN',
        pendingDetails: ['PD-272'],
      });
      const result = path(candidate);
      expect(result).toMatchObject({
        status: 'FUTURE',
        earliestDate: opensOn,
        approvalStatus: 'UNKNOWN',
      });
      expect(result.approvalEarliestDate).toBeUndefined();
    }
    const decisionOn = '2027-01-05';
    const withDecision: UsFullRequest = {
      ...withChart,
      admission: { ...withChart.admission, decisionOn },
    };
    expect(path(withDecision).approvalStatus).toBe('UNKNOWN');
    expect(path(withDecision).approvalEarliestDate).toBeUndefined();
    const withDecisionChart = path({
      ...withDecision,
      admission: {
        ...withDecision.admission,
        visaAtDecisionByMonth: { '2027-01': 'available' },
      },
    });
    expect(withDecisionChart).toMatchObject({
      status: 'FUTURE',
      earliestDate: opensOn,
      approvalStatus: 'FUTURE',
      approvalEarliestDate: decisionOn,
    });
  });

  test.each([
    ['C36-HEALTH', { medicalEvidence: 'pending' }],
    ['C36-HEALTH', { medicalEvidence: undefined, vaccines: undefined }],
    ['C37-PUBLIC-CHARGE', { publicCharge: 'pending' }],
    ['C39-SECURITY', { securityGround: 'pending' }],
  ] satisfies [string, Partial<UsAdmissionAnswers>][])(
    'keeps interview evidence in the approval stage (%s, %#)',
    (id, overrides) => {
      const request: UsFullRequest = {
        ...consular,
        admission: {
          ...consular.admission,
          decisionOn: '2026-12-10',
          ...overrides,
        },
      };
      expect(condition(request, id)).toMatchObject({
        filingStatus: 'NOT_APPLICABLE',
        status: 'UNKNOWN',
      });
      const result = path(request);
      expect(result).toMatchObject({
        status: 'MET',
        earliestDate: time.simulationDate,
        approvalStatus: 'UNKNOWN',
      });
      expect(result.approvalEarliestDate).toBeUndefined();
    },
  );

  test('still requires applicable I-864 evidence for NVC filing', () => {
    const result = path({
      ...consular,
      support: { ...support, affidavitSubmitted: false },
    });
    expect(result).toMatchObject({
      status: 'NOT_MET',
      approvalStatus: 'NOT_MET',
    });
    expect(result.earliestDate).toBeUndefined();
    expect(result.approvalEarliestDate).toBeUndefined();
  });

  test.each(['vawa', 'sij'] as const)(
    'exempts an approved %s adjustment basis from public charge',
    (adjustmentBasis) => {
      const request: UsFullRequest = {
        ...p7,
        family: undefined,
        support: undefined,
        admission: {
          ...admission,
          adjustmentBasis,
          petitionStatus: 'approved',
          publicCharge: undefined,
        },
      };
      const publicCharge = condition(request, 'C37-PUBLIC-CHARGE');
      expect(publicCharge).toMatchObject({
        applicable: false,
        filingStatus: 'NOT_APPLICABLE',
      });
      expect(publicCharge.pendingDetails).toBeUndefined();
      const result = path(request);
      expect(result).toMatchObject({
        status: 'MET',
        earliestDate: time.simulationDate,
        approvalStatus: 'MET',
        approvalEarliestDate: time.simulationDate,
        pendingDetails: [],
      });
    },
  );

  test.each(['pending', 'approved', undefined] as const)(
    'treats an I-140 receipt after the simulation date as inconsistent (%s)',
    (petitionStatus) => {
      const request = withEmployment(
        { permCertifiedOn: '2026-06-01', i140FiledOn: '2026-11-24' },
        petitionStatus,
      );
      expect(condition(request, 'C33-VISA-AND-ENTRY')).toMatchObject({
        filingStatus: 'UNKNOWN',
        status: 'UNKNOWN',
        pendingDetails: ['PD-272'],
      });
      expect(condition(request, 'C28-OFFER-PERM')).toMatchObject({
        status: 'UNKNOWN',
        pendingDetails: ['PD-277'],
      });
      const result = path(request);
      expect(result).toMatchObject({
        status: 'UNKNOWN',
        approvalStatus: 'UNKNOWN',
      });
      expect(result.earliestDate).toBeUndefined();
      expect(result.approvalEarliestDate).toBeUndefined();
    },
  );
});

describe('review86-5 regressions', () => {
  test('uses the planned return date for the full assessment and preserves legacy timing', () => {
    const returned = '2026-12-01';
    const trips = [{ departed: '2026-11-20', returned }];
    const request = { ...t, trips };
    expect(path(request)).toMatchObject({
      status: 'FUTURE',
      earliestDate: returned,
    });
    expect(path(request).approvalStatus).toBeUndefined();
    expect(path({ ...request, simulationDate: returned })).toMatchObject({
      status: 'MET',
      earliestDate: returned,
    });
    expect(
      evaluateUnitedStates({ ...time, trips }).pathways.find(
        (item) => item.id === 'US-TRAVEL',
      ),
    ).toMatchObject({ status: 'MET', earliestDate: time.simulationDate });
  });

  test('checks admission on the planned return day and omits the date when documents fail', () => {
    const returned = '2026-12-05';
    const request: UsFullRequest = {
      ...t,
      trips: [{ departed: '2026-11-28', returned }],
      travel: {
        ...travel,
        admissionTriggers: 'triggered',
        admission: {
          ...admission,
          unlawfulDeparture: { leftOn: '2016-12-01', qualifyingDays: 400 },
        },
      },
      fees: { channel: 'paper' },
    };
    expect(condition(request, 'C40-IMMIGRATION-HISTORY').status).toBe('MET');
    expect(path(request)).toMatchObject({
      status: 'FUTURE',
      earliestDate: returned,
    });
    const invalid = path({
      ...request,
      travel: { ...request.travel, documentValidAtReturn: false },
    });
    expect(invalid.status).toBe('NOT_MET');
    expect(invalid.earliestDate).toBeUndefined();
  });

  test('an approved I-140 establishes historical PERM compliance without a receipt date', () => {
    const request: UsFullRequest = {
      ...e,
      employment: { ...employment, permCertifiedOn: '2025-10-01' },
      admission: { ...e.admission, petitionStatus: 'approved' },
    };
    expect(condition(request, 'C33-VISA-AND-ENTRY').status).toBe('MET');
    expect(condition(request, 'C28-OFFER-PERM')).toMatchObject({
      filingStatus: 'MET',
      status: 'MET',
    });
    expect(path(request)).toMatchObject({
      status: 'MET',
      earliestDate: time.simulationDate,
      approvalStatus: 'MET',
      approvalEarliestDate: time.simulationDate,
    });
    const withReceipt = {
      ...request,
      employment: { ...request.employment, i140FiledOn: '2025-11-01' },
    };
    expect(condition(withReceipt, 'C28-OFFER-PERM').status).toBe('MET');
    expect(path(withReceipt)).toMatchObject({
      status: 'MET',
      approvalStatus: 'MET',
      approvalEarliestDate: time.simulationDate,
    });
  });

  test.each(['without-inspection', undefined] as const)(
    'treats approved SIJ as paroled for adjustment (%s)',
    (legalEntry) => {
      const request: UsFullRequest = {
        ...p7,
        family: undefined,
        support: undefined,
        admission: {
          ...admission,
          adjustmentBasis: 'sij',
          petitionStatus: 'approved',
          legalEntry,
          publicCharge: undefined,
        },
      };
      expect(condition(request, 'C33-VISA-AND-ENTRY')).toMatchObject({
        filingStatus: 'MET',
        status: 'MET',
      });
      expect(path(request)).toMatchObject({
        status: 'MET',
        earliestDate: time.simulationDate,
        approvalStatus: 'MET',
        approvalEarliestDate: time.simulationDate,
      });
    },
  );

  test.each([
    ['missing', 'NOT_MET', 'NOT_MET'],
    [undefined, 'UNKNOWN', 'UNKNOWN'],
    ['nonavailability-explained', 'MET', 'UNKNOWN'],
  ] as const)(
    'checks civil documents before filing with NVC (%s)',
    (nvcCivilDocuments, status, approvalStatus) => {
      const request: UsFullRequest = {
        ...authorizedConsular,
        admission: {
          ...authorizedConsular.admission,
          nvcCivilDocuments,
          decisionOn: '2026-12-10',
          medicalEvidence:
            nvcCivilDocuments === 'nonavailability-explained'
              ? 'cleared'
              : 'pending',
        },
      };
      expect(condition(request, 'C33-VISA-AND-ENTRY').filingStatus).toBe('MET');
      expect(condition(request, 'NVC-CIVIL-DOCUMENTS').status).toBe(
        approvalStatus,
      );
      const result = path(request);
      expect(result).toMatchObject({ status, approvalStatus });
      expect(result.earliestDate).toBe(
        status === 'MET' ? time.simulationDate : undefined,
      );
      expect(result.approvalEarliestDate).toBeUndefined();
    },
  );
});

describe('review86-6 regressions', () => {
  test.each([
    ['not-submitted', 'NOT_MET', 'NOT_MET'],
    [undefined, 'UNKNOWN', 'UNKNOWN'],
    ['submitted', 'MET', 'UNKNOWN'],
  ] as const)(
    'requires DS-260 submission even if civil documents are ready (%s)',
    (nvcDs260, status, approvalStatus) => {
      const request: UsFullRequest = {
        ...authorizedConsular,
        admission: {
          ...authorizedConsular.admission,
          nvcDs260,
          decisionOn: '2026-12-10',
          medicalEvidence: 'pending',
        },
      };
      expect(condition(request, 'NVC-DS-260').status).toBe(status);
      const result = path(request);
      expect(result).toMatchObject({ status, approvalStatus });
      expect(result.earliestDate).toBe(
        status === 'MET' ? time.simulationDate : undefined,
      );
      expect(result.approvalEarliestDate).toBeUndefined();
      if (nvcDs260 === undefined)
        expect(condition(request, 'NVC-DS-260').pendingDetails).toEqual([
          'PD-272',
        ]);
    },
  );

  test.each([undefined, '2026-11-22'] as const)(
    'keeps approval unknown without a consular decision on or after filing (%s)',
    (decisionOn) => {
      const request: UsFullRequest = {
        ...authorizedConsular,
        admission: { ...authorizedConsular.admission, decisionOn },
      };
      expect(condition(request, 'C33-VISA-AND-ENTRY')).toMatchObject({
        filingStatus: 'MET',
        status: 'UNKNOWN',
        pendingDetails: ['PD-272'],
      });
      const result = path(request);
      expect(result).toMatchObject({
        status: 'MET',
        earliestDate: time.simulationDate,
        approvalStatus: 'UNKNOWN',
      });
      expect(result.approvalEarliestDate).toBeUndefined();
    },
  );

  test.each([
    ['filed-with-i485', 'available', 'MET', 'UNKNOWN'],
    ['pending', 'available', 'MET', 'UNKNOWN'],
    ['pending', 'unavailable', 'NOT_MET', 'NOT_MET'],
  ] as const)(
    'checks SIJ filing after entry without inspection (%s, %s)',
    (petitionStatus, visaAtFiling, status, approvalStatus) => {
      const request: UsFullRequest = {
        ...p7,
        family: undefined,
        support: undefined,
        admission: {
          ...admission,
          adjustmentBasis: 'sij',
          qualifyingBasis: 'pending',
          petitionStatus,
          legalEntry: 'without-inspection',
          visaAtFiling,
          publicCharge: undefined,
        },
      };
      expect(condition(request, 'C33-VISA-AND-ENTRY')).toMatchObject({
        filingStatus: status,
        status: approvalStatus,
      });
      const result = path(request);
      expect(result).toMatchObject({ status, approvalStatus });
      expect(result.earliestDate).toBe(
        status === 'MET' ? time.simulationDate : undefined,
      );
      expect(result.approvalEarliestDate).toBeUndefined();
    },
  );

  test.each([
    [undefined, 'UNKNOWN', 'UNKNOWN'],
    ['2026-11-30', 'NOT_MET', 'NOT_MET'],
    ['2026-12-01', 'MET', 'FUTURE'],
    ['2026-12-10', 'MET', 'FUTURE'],
  ] as const)(
    'checks expiry of the unlawful-presence bar at consular adjudication (%s)',
    (decisionOn, immigrationStatus, approvalStatus) => {
      const request: UsFullRequest = {
        ...authorizedConsular,
        admission: {
          ...authorizedConsular.admission,
          unlawfulDeparture: { leftOn: '2016-12-01', qualifyingDays: 400 },
          decisionOn,
        },
      };
      expect(condition(request, 'C40-IMMIGRATION-HISTORY')).toMatchObject({
        filingStatus: 'NOT_APPLICABLE',
        status: immigrationStatus,
      });
      const result = path(request);
      expect(result).toMatchObject({
        status: 'MET',
        earliestDate: time.simulationDate,
        approvalStatus,
      });
      expect(result.approvalEarliestDate).toBe(
        approvalStatus === 'FUTURE' ? decisionOn : undefined,
      );
    },
  );
});

describe('review86-7 regressions', () => {
  test.each([
    ['complete', 'MET', 'UNKNOWN'],
    ['missing', 'NOT_MET', 'NOT_MET'],
  ] as const)(
    'checks NVC civil documents separately from pending criminal review (%s)',
    (nvcCivilDocuments, status, approvalStatus) => {
      const request: UsFullRequest = {
        ...authorizedConsular,
        admission: {
          ...authorizedConsular.admission,
          decisionOn: '2026-12-10',
          criminalOtherGround: 'pending',
          nvcCivilDocuments,
        },
      };
      expect(condition(request, 'C38-CRIMINAL-INADMISSIBILITY')).toMatchObject({
        filingStatus: 'NOT_APPLICABLE',
        status: 'UNKNOWN',
        pendingDetails: ['PD-269'],
      });
      expect(condition(request, 'NVC-CIVIL-DOCUMENTS').status).toBe(status);
      const result = path(request);
      expect(result).toMatchObject({ status, approvalStatus });
      expect(result.earliestDate).toBe(
        status === 'MET' ? time.simulationDate : undefined,
      );
      expect(result.approvalEarliestDate).toBeUndefined();
    },
  );

  test.each([
    [undefined, undefined, 'UNKNOWN', 'UNKNOWN'],
    ['2026-11-30', undefined, 'UNKNOWN', 'UNKNOWN'],
    ['2026-12-01', undefined, 'MET', 'FUTURE'],
    ['2026-12-10', '2026-11-30', 'UNKNOWN', 'UNKNOWN'],
    ['2026-12-10', '2026-12-01', 'MET', 'FUTURE'],
    ['2026-12-10', '2026-12-11', 'UNKNOWN', 'UNKNOWN'],
    ['2026-12-10', undefined, 'MET', 'FUTURE'],
  ] as const)(
    'checks former party membership at formal visa application (%s, %s)',
    (decisionOn, interviewOn, securityStatus, approvalStatus) => {
      const request: UsFullRequest = {
        ...authorizedConsular,
        admission: {
          ...authorizedConsular.admission,
          decisionOn,
          interviewOn,
          party: {
            membership: 'former',
            endedOn: '2024-12-01',
            ageEnded: 30,
            rulingParty: false,
            noSecurityThreat: true,
          },
        },
      };
      expect(condition(request, 'C39-SECURITY')).toMatchObject({
        filingStatus: 'NOT_APPLICABLE',
        status: securityStatus,
      });
      const result = path(request);
      expect(result).toMatchObject({
        status: 'MET',
        earliestDate: time.simulationDate,
        approvalStatus,
      });
      expect(result.approvalEarliestDate).toBe(
        approvalStatus === 'FUTURE' ? decisionOn : undefined,
      );
      if (interviewOn === '2026-12-01') {
        expect(
          path({ ...request, simulationDate: '2026-12-02' }),
        ).toMatchObject({
          approvalStatus: 'FUTURE',
          approvalEarliestDate: decisionOn,
        });
      }
    },
  );

  test.each([
    [undefined, 'UNKNOWN'],
    ['2026-12-01', 'NOT_MET'],
    ['2026-12-02', 'MET'],
  ] as const)(
    'uses the formal visa application date for the juvenile CIMT exception (%s)',
    (decisionOn, status) => {
      const request: UsFullRequest = {
        ...authorizedConsular,
        admission: {
          ...authorizedConsular.admission,
          decisionOn,
          crime: {
            ...noCrime,
            convictionCount: 1,
            cimtCount: 1,
            cimtAgeAtOffense: 17,
            cimtOffenseOrReleaseOn: '2021-12-01',
            cimtMaximumMonths: 24,
            cimtSentenceMonths: 7,
          },
        },
      };
      expect(condition(request, 'C38-CRIMINAL-INADMISSIBILITY')).toMatchObject({
        filingStatus: 'NOT_APPLICABLE',
        status,
      });
      expect(path(request).status).toBe('MET');
    },
  );

  test('uses the I-485 receipt for the domestic filing-date exceptions', () => {
    const request = {
      ...withAdmission({
        i693SignedOn: '2026-11-23',
        unlawfulDeparture: { leftOn: '2016-11-23', qualifyingDays: 400 },
        party: {
          membership: 'former',
          endedOn: '2024-11-23',
          ageEnded: 30,
          rulingParty: false,
          noSecurityThreat: true,
        },
        crime: {
          ...noCrime,
          convictionCount: 1,
          cimtCount: 1,
          cimtAgeAtOffense: 17,
          cimtOffenseOrReleaseOn: '2021-11-22',
          cimtMaximumMonths: 24,
          cimtSentenceMonths: 7,
        },
      }),
      simulationDate: '2026-11-22',
    };
    for (const id of [
      'C36-HEALTH',
      'C38-CRIMINAL-INADMISSIBILITY',
      'C39-SECURITY',
      'C40-IMMIGRATION-HISTORY',
    ]) {
      expect(condition(request, id).status).toBe('MET');
    }
    expect(path(request)).toMatchObject({
      status: 'FUTURE',
      earliestDate: '2026-11-23',
      approvalStatus: 'FUTURE',
      approvalEarliestDate: '2026-11-23',
    });
  });

  test('rechecks the same I-693 for validity at adjustment adjudication', () => {
    const request: UsFullRequest = {
      ...withAdmission({
        i693SignedOn: '2022-11-01',
        decisionOn: '2024-11-04',
      }),
      simulationDate: '2024-10-31',
      support: { ...support, jointSponsor: 'cleared' },
    };
    expect(condition(request, 'C36-HEALTH')).toMatchObject({
      filingStatus: 'MET',
      status: 'NOT_MET',
    });
    const result = path(request);
    expect(result).toMatchObject({
      status: 'MET',
      earliestDate: request.simulationDate,
      approvalStatus: 'NOT_MET',
    });
    expect(result.approvalEarliestDate).toBeUndefined();
  });

  test('retains the consular decision date for the unlawful-presence bar after an earlier interview', () => {
    const request: UsFullRequest = {
      ...authorizedConsular,
      admission: {
        ...authorizedConsular.admission,
        interviewOn: '2026-11-30',
        decisionOn: '2026-12-10',
        unlawfulDeparture: { leftOn: '2016-12-01', qualifyingDays: 400 },
      },
    };
    expect(condition(request, 'C40-IMMIGRATION-HISTORY')).toMatchObject({
      filingStatus: 'NOT_APPLICABLE',
      status: 'MET',
    });
    expect(path(request)).toMatchObject({
      status: 'MET',
      earliestDate: time.simulationDate,
      approvalStatus: 'FUTURE',
      approvalEarliestDate: '2026-12-10',
    });
  });

  test('selects the domestic public-charge rules by the I-485 postmark', () => {
    const request: UsFullRequest = {
      ...withAdmission({ decisionOn: '2026-09-28' }),
      simulationDate: '2026-09-21',
      fees: { ...p7.fees, filingOn: '2026-09-17' },
    };
    expect(condition(request, 'C37-PUBLIC-CHARGE')).toMatchObject({
      filingStatus: 'NOT_APPLICABLE',
      status: 'MET',
      explanation: expect.stringContaining('The prior policy'),
    });
  });
});

describe('review86-8 regressions', () => {
  test('defaults self-filed concurrent I-130 and I-485 to paper unless online filing is confirmed', () => {
    const request: UsFullRequest = {
      ...f,
      simulationDate: '2026-11-21',
      admission: { ...admission, petitionStatus: 'filed-with-i485' },
    };
    for (const fees of [
      undefined,
      { onlineCategoryAvailable: 'pending' },
      { channel: 'paper' },
    ] as const) {
      expect(path({ ...request, fees })).toMatchObject({
        status: 'FUTURE',
        earliestDate: '2026-11-23',
        approvalStatus: 'UNKNOWN',
      });
    }
    for (const channel of [undefined, 'online'] as const) {
      expect(
        path({
          ...request,
          fees: { channel, onlineCategoryAvailable: 'cleared' },
        }),
      ).toMatchObject({ status: 'MET', earliestDate: '2026-11-21' });
    }
    expect(
      path({
        ...request,
        fees: { channel: 'online', onlineCategoryAvailable: 'barred' },
      }),
    ).toMatchObject({ status: 'NOT_MET', approvalStatus: 'NOT_MET' });
  });

  test('requires confirmation for a standalone I-485 when the channel is omitted', () => {
    for (const request of [f, e, p7]) {
      for (const onlineCategoryAvailable of [undefined, 'pending'] as const) {
        const result = path({
          ...request,
          simulationDate: '2026-11-21',
          fees: { onlineCategoryAvailable },
        });
        expect(result).toMatchObject({
          status: 'UNKNOWN',
          approvalStatus: 'UNKNOWN',
          pendingDetails: expect.arrayContaining(['PD-267']),
        });
        expect(result.earliestDate).toBeUndefined();
        expect(result.approvalEarliestDate).toBeUndefined();
      }
    }
  });

  test('assesses former party membership and the juvenile CIMT exception at a known consular interview before decision', () => {
    const request: UsFullRequest = {
      ...authorizedConsular,
      admission: {
        ...authorizedConsular.admission,
        interviewOn: '2026-12-01',
        party: {
          membership: 'former',
          endedOn: '2024-12-01',
          ageEnded: 30,
          rulingParty: false,
          noSecurityThreat: true,
        },
        crime: {
          ...noCrime,
          convictionCount: 1,
          cimtCount: 1,
          cimtAgeAtOffense: 17,
          cimtOffenseOrReleaseOn: '2021-11-30',
          cimtMaximumMonths: 24,
          cimtSentenceMonths: 7,
        },
      },
    };
    for (const id of ['C38-CRIMINAL-INADMISSIBILITY', 'C39-SECURITY']) {
      expect(condition(request, id)).toMatchObject({
        filingStatus: 'NOT_APPLICABLE',
        status: 'MET',
      });
    }
    const result = path(request);
    expect(result).toMatchObject({
      status: 'MET',
      earliestDate: time.simulationDate,
      approvalStatus: 'UNKNOWN',
    });
    expect(result.approvalEarliestDate).toBeUndefined();
  });

  test('selects the N-400 civics test by receipt when a Sunday paper filing reaches the cutoff', () => {
    const request: UsFullRequest = {
      ...withNatural({ civics: undefined, civicsCorrect: 6 }),
      simulationDate: '2025-10-19',
    };
    const paper: UsFullRequest = { ...request, fees: { channel: 'paper' } };
    expect(path(paper)).toMatchObject({
      status: 'FUTURE',
      earliestDate: '2025-10-20',
      approvalStatus: 'NOT_MET',
    });
    expect(condition(paper, 'C04-CIVICS').status).toBe('NOT_MET');
    expect(condition(request, 'C04-CIVICS').status).toBe('MET');
    expect(
      condition(
        { ...request, fees: { onlineCategoryAvailable: 'pending' } },
        'C04-CIVICS',
      ).status,
    ).toBe('UNKNOWN');
  });

  test.each([
    ['2024-10-15', 'MET', '2024-10-15'],
    ['2024-11-29', 'MET', '2024-11-29'],
    ['2024-12-01', 'UNKNOWN', undefined],
    ['2024-12-02', 'UNKNOWN', undefined],
  ] as const)(
    'requires applicable I-693 evidence at filing only from the receipt cutoff (%s)',
    (simulationDate, status, earliestDate) => {
      const request: UsFullRequest = {
        ...withAdmission({
          medicalEvidence: 'pending',
          classAHealth: 'pending',
          vaccines: 'pending',
        }),
        simulationDate,
        support: { ...support, jointSponsor: 'cleared' },
      };
      expect(condition(request, 'C36-HEALTH')).toMatchObject({
        status: 'UNKNOWN',
        filingStatus: status,
        pendingDetails: ['PD-275'],
      });
      const result = path(request);
      expect(result).toMatchObject({ status, approvalStatus: 'UNKNOWN' });
      expect(result.earliestDate).toBe(earliestDate);
      expect(result.approvalEarliestDate).toBeUndefined();
    },
  );

  test('applies the historical I-693 filing rule to refugee and asylee adjustment', () => {
    for (const status of ['refugee', 'asylee'] as const) {
      const request: UsFullRequest = {
        ...h,
        simulationDate: '2024-11-29',
        humanitarian: {
          ...human,
          status,
          refugeeDefinitionOrDerivative: true,
          firmlyResettled: false,
          discretion: 'cleared',
        },
        admission: {
          ...admission,
          medicalEvidence: 'pending',
          classAHealth: 'pending',
          vaccines: 'pending',
        },
      };
      expect(path(request)).toMatchObject({
        status: 'MET',
        earliestDate: '2024-11-29',
        approvalStatus: 'UNKNOWN',
      });
      expect(path({ ...request, simulationDate: '2024-12-01' })).toMatchObject({
        status: 'UNKNOWN',
        approvalStatus: 'UNKNOWN',
      });
    }
  });
});

describe('review86-9 regressions', () => {
  test('uses the N-400 receipt date for the 65/20 civics test', () => {
    const request: UsFullRequest = {
      ...withNatural({
        civics: undefined,
        civicsCorrect: 6,
        lprResidenceYears: 21,
      }),
      simulationDate: '2026-11-22',
      dateOfBirth: '1961-11-23',
    };
    const paper: UsFullRequest = { ...request, fees: { channel: 'paper' } };
    expect(condition(paper, 'C04-CIVICS').status).toBe('MET');
    expect(path(paper)).toMatchObject({
      status: 'FUTURE',
      earliestDate: '2026-11-23',
      approvalStatus: 'FUTURE',
    });
    expect(
      condition({ ...request, fees: { channel: 'online' } }, 'C04-CIVICS')
        .status,
    ).toBe('NOT_MET');
    expect(
      condition(
        { ...request, fees: { onlineCategoryAvailable: 'pending' } },
        'C04-CIVICS',
      ),
    ).toMatchObject({ status: 'UNKNOWN', pendingDetails: ['PD-271'] });
  });

  test('excludes fraud, false citizenship and unlawful presence for an approved SIJ adjustment', () => {
    const approvedSij = withAdmission({
      adjustmentBasis: 'sij',
      petitionStatus: 'approved',
      legalEntry: 'without-inspection',
      immigrationFraud: true,
      falseCitizenship: true,
      falseCitizenshipException: false,
      unlawfulDeparture: { leftOn: '2026-01-01', qualifyingDays: 365 },
    });
    expect(condition(approvedSij, 'C33-VISA-AND-ENTRY').status).toBe('MET');
    expect(condition(approvedSij, 'C40-IMMIGRATION-HISTORY')).toMatchObject({
      filingStatus: 'MET',
      status: 'MET',
    });
    expect(path(approvedSij)).toMatchObject({
      status: 'MET',
      earliestDate: time.simulationDate,
      approvalStatus: 'MET',
      approvalEarliestDate: time.simulationDate,
    });
    expect(
      condition(
        {
          ...approvedSij,
          admission: { ...approvedSij.admission, unlawfulReentryBar: true },
        },
        'C40-IMMIGRATION-HISTORY',
      ),
    ).toMatchObject({ filingStatus: 'NOT_MET', status: 'NOT_MET' });
    expect(
      condition(
        {
          ...approvedSij,
          admission: {
            ...approvedSij.admission,
            otherInadmissibility: 'pending',
          },
        },
        'C40-IMMIGRATION-HISTORY',
      ),
    ).toMatchObject({
      filingStatus: 'UNKNOWN',
      status: 'UNKNOWN',
      pendingDetails: ['PD-274'],
    });
  });

  test('applies SIJ exemptions only to the identified inadmissibility grounds', () => {
    const request = withAdmission({
      adjustmentBasis: 'sij',
      petitionStatus: 'approved',
      otherInadmissibilityByGround: {
        '5(A)': 'barred',
        '6(A)(i)': 'barred',
        '6(D)': 'barred',
        '7(A)(i)': 'pending',
      },
    });
    expect(condition(request, 'C40-IMMIGRATION-HISTORY').status).toBe('MET');
    expect(
      condition(
        withAdmission({
          ...request.admission,
          otherInadmissibilityByGround: {
            ...request.admission?.otherInadmissibilityByGround,
            '9(A)': 'barred',
          },
        }),
        'C40-IMMIGRATION-HISTORY',
      ).status,
    ).toBe('NOT_MET');
    expect(
      condition(
        withAdmission({
          ...request.admission,
          adjustmentBasis: 'immediate-relative',
        }),
        'C40-IMMIGRATION-HISTORY',
      ).status,
    ).toBe('NOT_MET');
  });

  test('applies the VAWA entry exemption but checks fraud and conditional unlawful-presence relief separately', () => {
    const inputs = {
      adjustmentBasis: 'vawa',
      petitionStatus: 'approved',
      legalEntry: 'without-inspection',
      publicCharge: 'barred',
      otherInadmissibilityByGround: { '6(A)(i)': 'barred' },
    } as const;
    const request = withAdmission(inputs);
    expect(condition(request, 'C37-PUBLIC-CHARGE').applicable).toBe(false);
    expect(condition(request, 'C40-IMMIGRATION-HISTORY').status).toBe('MET');
    expect(
      condition(
        withAdmission({ ...inputs, immigrationFraud: true }),
        'C40-IMMIGRATION-HISTORY',
      ).status,
    ).toBe('NOT_MET');
    const unlawfulDeparture = { leftOn: '2026-01-01', qualifyingDays: 365 };
    for (const [vawaUnlawfulPresenceException, status] of [
      [undefined, 'UNKNOWN'],
      ['cleared', 'MET'],
      ['barred', 'NOT_MET'],
    ] as const) {
      expect(
        condition(
          withAdmission({
            ...inputs,
            unlawfulDeparture,
            vawaUnlawfulPresenceException,
          }),
          'C40-IMMIGRATION-HISTORY',
        ),
      ).toMatchObject({ filingStatus: status, status });
    }
    const consular = withAdmission({
      ...inputs,
      process: 'consular',
      decisionOn: time.simulationDate,
      otherInadmissibilityByGround: undefined,
      unlawfulDeparture,
      vawaUnlawfulPresenceException: 'cleared',
    });
    expect(condition(consular, 'C37-PUBLIC-CHARGE').applicable).toBe(false);
    expect(condition(consular, 'C40-IMMIGRATION-HISTORY')).toMatchObject({
      filingStatus: 'NOT_APPLICABLE',
      status: 'MET',
    });
  });

  test.each(['refugee', 'asylee'] as const)(
    'applies the INA 209(c) exemptions and retains applicable grounds for %s',
    (status) => {
      const request: UsFullRequest = {
        ...h,
        humanitarian: {
          ...human,
          status,
          waiver: 'not-needed',
          refugeeDefinitionOrDerivative: true,
          firmlyResettled: false,
          discretion: 'cleared',
        },
        admission: {
          ...admission,
          publicCharge: 'barred',
          otherInadmissibilityByGround: {
            '5(A)': 'barred',
            '5(B)': 'barred',
            '7(A)(i)': 'pending',
          },
        },
      };
      expect(condition(request, 'C37-PUBLIC-CHARGE').applicable).toBe(false);
      expect(condition(request, 'C40-IMMIGRATION-HISTORY').status).toBe('MET');
      expect(path(request)).toMatchObject({
        status: 'MET',
        approvalStatus: 'MET',
      });
      expect(
        condition(
          {
            ...request,
            admission: { ...request.admission, immigrationFraud: true },
          },
          'C40-IMMIGRATION-HISTORY',
        ),
      ).toMatchObject({ filingStatus: 'NOT_MET', status: 'NOT_MET' });
      expect(
        condition(
          {
            ...request,
            humanitarian: { ...request.humanitarian, waiver: 'cleared' },
            admission: {
              ...request.admission,
              otherInadmissibilityByGround: {
                '9(A)': 'barred',
                '10(A)': 'pending',
              },
            },
          },
          'C40-IMMIGRATION-HISTORY',
        ),
      ).toMatchObject({ filingStatus: 'UNKNOWN', status: 'UNKNOWN' });
    },
  );
});

describe('review86-10 regressions', () => {
  test.each([
    ['I-140', withEmployment({ i140FiledOn: '2026-07-01' })],
    [
      'I-130',
      {
        ...f,
        admission: {
          ...f.admission,
          petitionStatus: undefined,
          petitionFiledOn: '2026-07-01',
        },
      },
    ],
  ] satisfies [string, UsFullRequest][])(
    'C33 permits adjustment filing with an %s receipt but unknown approval',
    (_, request) => {
      expect(condition(request, 'C33-VISA-AND-ENTRY')).toMatchObject({
        filingStatus: 'MET',
        status: 'UNKNOWN',
        pendingDetails: ['PD-272'],
      });
      const result = path(request);
      expect(result).toMatchObject({
        status: 'MET',
        earliestDate: time.simulationDate,
        approvalStatus: 'UNKNOWN',
      });
      expect(result.approvalEarliestDate).toBeUndefined();
    },
  );

  test('C40 requires comprehensive coverage when the aggregate review is pending', () => {
    const complete = {
      '5': 'cleared',
      '6': 'cleared',
      '7': 'cleared',
      '8': 'cleared',
      '9': 'cleared',
      '10': 'cleared',
    } as const;
    for (const otherInadmissibilityByGround of [
      {},
      { '9(A)': 'cleared' },
      { ...complete, '10': undefined, '10(A)': 'cleared' },
    ] as const) {
      const request: UsFullRequest = {
        ...f,
        admission: {
          ...f.admission,
          petitionStatus: 'approved',
          otherInadmissibility: 'pending',
          otherInadmissibilityByGround,
        },
      };
      expect(condition(request, 'C40-IMMIGRATION-HISTORY')).toMatchObject({
        filingStatus: 'UNKNOWN',
        status: 'UNKNOWN',
        pendingDetails: ['PD-274'],
      });
      const result = path(request);
      expect(result).toMatchObject({
        status: 'UNKNOWN',
        approvalStatus: 'UNKNOWN',
      });
      expect(result.earliestDate).toBeUndefined();
      expect(result.approvalEarliestDate).toBeUndefined();
    }
    expect(
      condition(
        withAdmission({
          otherInadmissibility: 'pending',
          otherInadmissibilityByGround: complete,
        }),
        'C40-IMMIGRATION-HISTORY',
      ),
    ).toMatchObject({ filingStatus: 'MET', status: 'MET' });
    expect(
      condition(
        withAdmission({
          adjustmentBasis: 'sij',
          petitionStatus: 'approved',
          otherInadmissibility: 'pending',
          otherInadmissibilityByGround: {
            ...complete,
            '5': undefined,
            '5(B)': 'cleared',
            '5(C)': 'cleared',
            '6': undefined,
            '6(B)': 'cleared',
            '6(E)': 'cleared',
            '6(F)': 'cleared',
            '6(G)': 'cleared',
            '7': undefined,
            '9': undefined,
            '9(A)(i)': 'cleared',
            '9(A)(ii)': 'cleared',
          },
        }),
        'C40-IMMIGRATION-HISTORY',
      ),
    ).toMatchObject({ filingStatus: 'MET', status: 'MET' });
  });

  test.each([
    ['55/15', '1971-11-23', 16],
    ['50/20', '1976-11-23', 21],
  ] as const)(
    'C03 evaluates %s on the N-400 receipt date',
    (_, birth, years) => {
      const request: UsFullRequest = {
        ...withNatural({ english: 'failed', lprResidenceYears: years }),
        simulationDate: '2026-11-22',
        dateOfBirth: birth,
      };
      const paper: UsFullRequest = { ...request, fees: { channel: 'paper' } };
      expect(path(paper).earliestDate).toBe('2026-11-23');
      expect(condition(paper, 'C03-ENGLISH').status).toBe('MET');
      expect(
        condition({ ...request, fees: { channel: 'online' } }, 'C03-ENGLISH')
          .status,
      ).toBe('NOT_MET');
      expect(
        condition(
          { ...request, fees: { onlineCategoryAvailable: 'pending' } },
          'C03-ENGLISH',
        ),
      ).toMatchObject({ status: 'UNKNOWN', pendingDetails: ['PD-271'] });
    },
  );

  test.each([
    { petitionStatus: 'filed-with-i485' },
    { petitionStatus: 'pending' },
    { petitionFiledOn: '2026-07-01' },
  ] as const)(
    'SIJ with petition evidence %j can file under C33 while C40 awaits a finding',
    (petition) => {
      const request = withAdmission({
        adjustmentBasis: 'sij',
        petitionStatus: undefined,
        ...petition,
        qualifyingBasis: 'pending',
        legalEntry: 'without-inspection',
        publicCharge: 'barred',
        immigrationFraud: true,
        falseCitizenship: true,
        unlawfulDeparture: { leftOn: '2026-01-01', qualifyingDays: 365 },
        otherInadmissibilityByGround: { '6(D)': 'barred' },
      });
      expect(condition(request, 'C33-VISA-AND-ENTRY')).toMatchObject({
        filingStatus: 'MET',
        status: 'UNKNOWN',
      });
      expect(condition(request, 'C40-IMMIGRATION-HISTORY')).toMatchObject({
        filingStatus: 'UNKNOWN',
        status: 'UNKNOWN',
        pendingDetails: ['PD-274'],
      });
      expect(condition(request, 'C37-PUBLIC-CHARGE')).toMatchObject({
        status: 'UNKNOWN',
        pendingDetails: ['PD-274'],
      });
      const result = path(request);
      expect(result).toMatchObject({
        status: 'UNKNOWN',
        approvalStatus: 'UNKNOWN',
      });
      expect(result.earliestDate).toBeUndefined();
      expect(result.approvalEarliestDate).toBeUndefined();
      expect(
        path({
          ...request,
          admission: {
            ...request.admission,
            petitionStatus: 'approved',
            qualifyingBasis: 'cleared',
          },
        }),
      ).toMatchObject({
        status: 'MET',
        approvalStatus: 'MET',
        approvalEarliestDate: time.simulationDate,
      });
      expect(
        condition(
          {
            ...request,
            admission: { ...request.admission, unlawfulReentryBar: true },
          },
          'C40-IMMIGRATION-HISTORY',
        ),
      ).toMatchObject({ filingStatus: 'NOT_MET', status: 'NOT_MET' });
    },
  );
});

describe('review86-11 regressions', () => {
  // Map each input to the report column. Explicit lack of authorization blocks.
  const scenarios = [
    ['adjustment', undefined, undefined, 0],
    ['consular', 'available', 'submitted', 1],
    ['consular', 'available', undefined, 2],
    ['consular', 'available', 'not-submitted', 2],
    ['consular', undefined, 'submitted', 3],
    ['consular', undefined, undefined, 4],
    ['consular', undefined, 'not-submitted', 4],
    ['consular', 'unavailable', 'submitted', undefined],
    ['consular', 'unavailable', undefined, undefined],
    ['consular', 'unavailable', 'not-submitted', undefined],
  ] as const;
  const met = ['MET', 'MET'] as const;
  const canFile = ['MET', 'UNKNOWN'] as const;
  const unknown = ['UNKNOWN', 'UNKNOWN'] as const;
  const blocked = ['NOT_MET', 'NOT_MET'] as const;
  const matrix = [
    ['approved', undefined, met, met, met, unknown, unknown],
    ['approved', '2026-07-01', met, met, met, unknown, unknown],
    ['pending', undefined, canFile, met, blocked, blocked, blocked],
    ['pending', '2026-07-01', canFile, met, blocked, blocked, blocked],
    ['filed-with-i485', undefined, canFile, met, blocked, blocked, blocked],
    ['filed-with-i485', '2026-07-01', canFile, met, blocked, blocked, blocked],
    [undefined, undefined, canFile, met, unknown, unknown, unknown],
    [undefined, '2026-07-01', canFile, met, unknown, unknown, unknown],
  ] as const;

  test.each(
    matrix.flatMap(([petitionStatus, petitionFiledOn, ...expected]) =>
      scenarios.flatMap(([process, authorization, nvcDs260, column]) =>
        (['explicit', 'inferred'] as const).map((basisSource) => ({
          basisSource,
          petitionStatus,
          petitionFiledOn,
          process,
          authorization,
          nvcDs260,
          c33: column === undefined ? blocked : expected[column],
        })),
      ),
    ),
  )(
    'C33 $basisSource $process: petition=$petitionStatus receipt=$petitionFiledOn NVC=$authorization DS-260=$nvcDs260',
    ({
      basisSource,
      petitionStatus,
      petitionFiledOn,
      process,
      authorization,
      nvcDs260,
      c33,
    }) => {
      const consular = process === 'consular';
      const decisionOn = consular ? '2026-12-10' : time.simulationDate;
      const request: UsFullRequest = {
        ...p7,
        admission: {
          ...admission,
          adjustmentBasis:
            basisSource === 'explicit' ? 'immediate-relative' : undefined,
          process,
          petitionStatus,
          petitionFiledOn,
          visaAtFiling: consular ? authorization : 'available',
          interviewOn: consular ? decisionOn : undefined,
          decisionOn,
          nvcDs260,
          nvcCivilDocuments: consular ? 'complete' : undefined,
        },
      };
      const [filing, approval] = c33;
      const withDs260 = (status: typeof filing) => {
        if (!consular || nvcDs260 === 'submitted') return status;
        return nvcDs260 === 'not-submitted' || status === 'NOT_MET'
          ? 'NOT_MET'
          : 'UNKNOWN';
      };
      const overallFiling = withDs260(filing);
      const overallApproval = withDs260(approval);
      const result = path(request);
      expect(condition(request, 'C33-VISA-AND-ENTRY')).toMatchObject({
        filingStatus: filing,
        status: approval,
      });
      expect(result).toMatchObject({
        status: overallFiling,
        approvalStatus:
          overallApproval === 'MET' && consular ? 'FUTURE' : overallApproval,
      });
      expect(result.earliestDate).toBe(
        overallFiling === 'MET' ? time.simulationDate : undefined,
      );
      expect(result.approvalEarliestDate).toBe(
        overallApproval === 'MET' ? decisionOn : undefined,
      );
    },
  );

  test('C33 can file EB-2 PERM with no petition status or receipt but cannot date approval', () => {
    const request: UsFullRequest = {
      ...e,
      employment: { ...employment, i140FiledOn: undefined },
      admission: { ...e.admission, petitionStatus: undefined },
    };
    expect(condition(request, 'C33-VISA-AND-ENTRY')).toMatchObject({
      filingStatus: 'MET',
      status: 'UNKNOWN',
      pendingDetails: ['PD-272'],
    });
    expect(path(request)).toMatchObject({
      status: 'MET',
      earliestDate: time.simulationDate,
      approvalStatus: 'UNKNOWN',
    });
    expect(path(request).approvalEarliestDate).toBeUndefined();
  });

  test('C33 preserves a cleared adjustment basis without an underlying petition', () => {
    const request = withAdmission({
      adjustmentBasis: 'other',
      petitionStatus: undefined,
    });
    expect(condition(request, 'C33-VISA-AND-ENTRY')).toMatchObject({
      filingStatus: 'MET',
      status: 'MET',
    });
  });

  test.each([
    ['barred', undefined, 'UNKNOWN'],
    ['barred', { '6(D)': 'barred' }, 'UNKNOWN'],
    ['barred', { '6': 'barred', '6(D)': 'barred' }, 'UNKNOWN'],
    ['pending', { '6(D)': 'barred' }, 'UNKNOWN'],
    ['barred', { '6(D)': 'barred', '9(A)': 'barred' }, 'NOT_MET'],
  ] as const)(
    'C40 resolves SIJ aggregate %s with findings %j',
    (otherInadmissibility, otherInadmissibilityByGround, expected) => {
      const request = withAdmission({
        adjustmentBasis: 'sij',
        petitionStatus: 'filed-with-i485',
        qualifyingBasis: 'pending',
        legalEntry: 'without-inspection',
        otherInadmissibility,
        otherInadmissibilityByGround,
      });
      expect(condition(request, 'C33-VISA-AND-ENTRY').filingStatus).toBe('MET');
      expect(condition(request, 'C40-IMMIGRATION-HISTORY')).toMatchObject({
        filingStatus: expected,
        status: expected,
        ...(expected === 'UNKNOWN' ? { pendingDetails: ['PD-274'] } : {}),
      });
      expect(path(request)).toMatchObject({
        status: expected,
        approvalStatus: expected,
      });
      expect(path(request).earliestDate).toBeUndefined();
      expect(path(request).approvalEarliestDate).toBeUndefined();
    },
  );

  test('C40 uses a complete SIJ review to isolate a stowaway bar', () => {
    const request = withAdmission({
      adjustmentBasis: 'sij',
      petitionStatus: 'pending',
      qualifyingBasis: 'pending',
      legalEntry: 'without-inspection',
      otherInadmissibility: 'barred',
      otherInadmissibilityByGround: {
        '5': 'cleared',
        '6(A)': 'cleared',
        '6(B)': 'cleared',
        '6(D)': 'barred',
        '6(E)': 'cleared',
        '6(F)': 'cleared',
        '6(G)': 'cleared',
        '7': 'cleared',
        '8': 'cleared',
        '9': 'cleared',
        '10': 'cleared',
      },
    });
    expect(condition(request, 'C40-IMMIGRATION-HISTORY')).toMatchObject({
      filingStatus: 'UNKNOWN',
      status: 'UNKNOWN',
      pendingDetails: ['PD-274'],
    });
    const approved: UsFullRequest = {
      ...request,
      admission: {
        ...request.admission,
        petitionStatus: 'approved',
        qualifyingBasis: 'cleared',
      },
    };
    expect(condition(approved, 'C40-IMMIGRATION-HISTORY')).toMatchObject({
      filingStatus: 'MET',
      status: 'MET',
    });
    expect(path(approved)).toMatchObject({
      status: 'MET',
      approvalStatus: 'MET',
      approvalEarliestDate: time.simulationDate,
    });
  });
});

describe('review86-12 regressions', () => {
  test('C33 derives the petition requirement for a U.S. citizen spouse in the generic path', () => {
    const request = withAdmission({
      adjustmentBasis: undefined,
      petitionStatus: undefined,
      petitionFiledOn: undefined,
      visaAtFiling: undefined,
      visaAtDecision: undefined,
    });
    expect(condition(request, 'C33-VISA-AND-ENTRY')).toMatchObject({
      filingStatus: 'MET',
      status: 'UNKNOWN',
    });
    expect(path(request)).toMatchObject({
      status: 'MET',
      earliestDate: time.simulationDate,
      approvalStatus: 'UNKNOWN',
    });
    expect(path(request).approvalEarliestDate).toBeUndefined();
  });

  test('C33 uses the reported I-140 in the generic path and leaves unclassified approval undated', () => {
    const request: UsFullRequest = {
      ...withAdmission({
        adjustmentBasis: undefined,
        petitionStatus: undefined,
      }),
      family: undefined,
    };
    const withI140: UsFullRequest = {
      ...request,
      employment: {
        i140FiledOn: '2026-07-01',
        relativePetitioner: false,
        relativeOwnershipPct: 0,
      },
    };
    for (const input of [request, withI140]) {
      expect(condition(input, 'C33-VISA-AND-ENTRY')).toMatchObject({
        filingStatus: 'MET',
        status: 'UNKNOWN',
      });
      expect(path(input)).toMatchObject({
        status: input.employment ? 'UNKNOWN' : 'MET',
        approvalStatus: 'UNKNOWN',
      });
      expect(path(input).earliestDate).toBe(
        input.employment ? undefined : time.simulationDate,
      );
      expect(path(input).approvalEarliestDate).toBeUndefined();
    }
    const approved: UsFullRequest = {
      ...withI140,
      admission: { ...withI140.admission, petitionStatus: 'approved' },
    };
    expect(path(approved)).toMatchObject({
      status: 'UNKNOWN',
      approvalStatus: 'UNKNOWN',
    });
    expect(path(approved).approvalEarliestDate).toBeUndefined();
  });

  const trip = { departed: '2026-11-20', returned: '2026-12-01' } as const;

  test('C33 projects the family I-485 receipt and approval from the return date', () => {
    const request: UsFullRequest = { ...f, trips: [trip] };
    expect(condition(request, 'TIME-I485-PRESENCE')).toMatchObject({
      status: 'NOT_MET',
      explanation: expect.stringContaining(trip.returned),
    });
    expect(condition(request, 'C33-VISA-AND-ENTRY').filingStatus).toBe('MET');
    expect(path(request)).toMatchObject({
      status: 'FUTURE',
      earliestDate: trip.returned,
      approvalStatus: 'FUTURE',
      approvalEarliestDate: trip.returned,
    });
    expect(path({ ...request, simulationDate: trip.returned })).toMatchObject({
      status: 'MET',
      earliestDate: trip.returned,
      approvalStatus: 'MET',
      approvalEarliestDate: trip.returned,
    });
  });

  test('C33 rechecks the paper receipt date after return using the new filing and decision month', () => {
    const request: UsFullRequest = {
      ...e,
      employment: { ...e.employment, wagePeriodThrough: '2026-12-02' },
      trips: [
        { departed: '2026-11-30', returned: '2026-12-02' },
        { departed: '2026-11-20', returned: '2026-11-28' },
      ],
    };
    const missingCharts = path(request);
    expect(missingCharts).toMatchObject({
      status: 'UNKNOWN',
      approvalStatus: 'UNKNOWN',
    });
    expect(missingCharts.earliestDate).toBeUndefined();
    expect(missingCharts.approvalEarliestDate).toBeUndefined();
    expect(
      path({
        ...request,
        admission: {
          ...request.admission,
          visaAtFilingByMonth: { '2026-12': 'available' },
          visaAtDecisionByMonth: { '2026-12': 'available' },
        },
      }),
    ).toMatchObject({
      status: 'FUTURE',
      earliestDate: '2026-12-02',
      approvalStatus: 'FUTURE',
      approvalEarliestDate: '2026-12-02',
    });
  });

  test.each([f, h])(
    'requires an itinerary for the $pathway I-485',
    (request) => {
      const result = path({ ...request, trips: undefined });
      expect(result).toMatchObject({
        status: 'UNKNOWN',
        approvalStatus: 'UNKNOWN',
      });
      expect(result.earliestDate).toBeUndefined();
      expect(result.approvalEarliestDate).toBeUndefined();
    },
  );

  test.each([
    [365, trip.returned],
    [363, '2026-12-02'],
  ])(
    'projects humanitarian filing and approval from return with %s days accrued',
    (presenceDays, approvalEarliestDate) => {
      expect(
        path({ ...h, humanitarian: { ...human, presenceDays }, trips: [trip] }),
      ).toMatchObject({
        status: 'FUTURE',
        earliestDate: trip.returned,
        approvalStatus: 'FUTURE',
        approvalEarliestDate,
      });
    },
  );

  test.each([n, spouse, m, conditions, i829])(
    'does not impose an I-485 filing-location condition on $pathway',
    (request) => {
      const result = path({ ...request, trips: [trip] });
      expect(result.status).toBe('MET');
      expect(result.earliestDate).toBe(time.simulationDate);
    },
  );

  test('C22 corroborates the historical I-131 receipt location against the trip', () => {
    const request: UsFullRequest = {
      ...t,
      travel: {
        ...travel,
        returnDocument: 'reentry-permit',
        permitAppliedInUs: true,
        permitBiometricsInUs: true,
        permitFiledOn: '2026-02-01',
      },
    };
    expect(condition(request, 'C22-RETURN-DOCUMENT').status).toBe('NOT_MET');
    expect(path(request).earliestDate).toBeUndefined();
    expect(
      condition(
        {
          ...request,
          travel: { ...request.travel, permitFiledOn: '2025-12-15' },
        },
        'C22-RETURN-DOCUMENT',
      ).status,
    ).toBe('MET');
  });

  test.each([undefined, 'approved'] as const)(
    'C37 and C40 use the VAWA consular approval evidence (petition status %s)',
    (petitionStatus) => {
      const request: UsFullRequest = {
        ...authorizedConsular,
        pathway: 'US-ADJUSTMENT',
        trips: [trip],
        admission: {
          ...authorizedConsular.admission,
          adjustmentBasis: 'vawa',
          petitionStatus,
          publicCharge: undefined,
          unlawfulDeparture: { leftOn: '2025-03-01', qualifyingDays: 365 },
          vawaUnlawfulPresenceException: 'cleared',
          decisionOn: '2026-12-10',
          visaAtDecisionByMonth: { '2026-12': 'available' },
        },
      };
      expect(condition(request, 'C33-VISA-AND-ENTRY')).toMatchObject({
        filingStatus: 'MET',
        status: 'MET',
      });
      expect(condition(request, 'C37-PUBLIC-CHARGE').applicable).toBe(false);
      expect(condition(request, 'C40-IMMIGRATION-HISTORY')).toMatchObject({
        filingStatus: 'NOT_APPLICABLE',
        status: 'MET',
      });
      expect(path(request)).toMatchObject({
        status: 'MET',
        earliestDate: time.simulationDate,
        approvalStatus: 'FUTURE',
        approvalEarliestDate: '2026-12-10',
      });
    },
  );
});

describe('review86-13 regressions', () => {
  test.each(['immediate-relative', undefined] as const)(
    'requires inspected entry for a U.S. citizen spouse with basis %s',
    (adjustmentBasis) => {
      const request = withAdmission({
        adjustmentBasis,
        legalEntry: 'without-inspection',
      });
      expect(condition(request, 'C33-VISA-AND-ENTRY')).toMatchObject({
        filingStatus: 'NOT_MET',
        status: 'NOT_MET',
      });
      expect(path(request)).toMatchObject({
        status: 'NOT_MET',
        approvalStatus: 'NOT_MET',
      });
      expect(path(request).earliestDate).toBeUndefined();
      expect(path(request).approvalEarliestDate).toBeUndefined();
    },
  );

  test.each(['US-ADJUSTMENT', 'US-EMPLOYMENT'] as const)(
    'uses the same I-864 and INA 245(k) rules for explicit and inferred employment in %s',
    (pathway) => {
      for (const adjustmentBasis of ['employment', undefined] as const) {
        const request: UsFullRequest = {
          ...e,
          pathway,
          admission: {
            ...e.admission,
            adjustmentBasis,
            qualifyingViolationsDays: 30,
          },
        };
        for (const id of [
          'C25-SUPPORT-INCOME',
          'C26-SPONSOR',
          'C27-SUPPORT-EXEMPTION',
          'C33-VISA-AND-ENTRY',
          'C34-ADJUSTMENT-BARS',
        ]) {
          expect(
            condition(request, id).status,
            `${id} (${adjustmentBasis})`,
          ).toBe('MET');
        }
        expect(path(request)).toMatchObject({
          status: 'MET',
          earliestDate: time.simulationDate,
          approvalStatus: 'MET',
          approvalEarliestDate: time.simulationDate,
        });
      }
    },
  );

  test.each(['US-EMPLOYMENT', 'US-ADJUSTMENT'] as const)(
    'checks concurrent PERM against the in-country receipt in %s',
    (pathway) => {
      const request: UsFullRequest = {
        ...e,
        pathway,
        employment,
        admission: {
          ...e.admission,
          petitionStatus: 'filed-with-i485',
          visaAtFilingByMonth: { '2026-12': 'available' },
          visaAtDecisionByMonth: { '2026-12': 'available' },
        },
      };
      expect(condition(request, 'C28-OFFER-PERM').status).toBe('MET');
      expect(path(request).earliestDate).toBe(time.simulationDate);
      const delayed: UsFullRequest = {
        ...request,
        trips: [{ departed: '2026-11-20', returned: '2026-12-01' }],
      };
      expect(condition(delayed, 'C28-OFFER-PERM').status).toBe('NOT_MET');
      expect(path(delayed)).toMatchObject({
        status: 'NOT_MET',
        approvalStatus: 'NOT_MET',
      });
      expect(path(delayed).earliestDate).toBeUndefined();
      expect(path(delayed).approvalEarliestDate).toBeUndefined();
      const alreadyFiled: UsFullRequest = {
        ...delayed,
        employment: {
          ...employment,
          i140FiledOn: '2026-07-01',
          wagePeriodThrough: '2026-12-01',
        },
        admission: { ...delayed.admission, petitionStatus: 'approved' },
      };
      expect(condition(alreadyFiled, 'C28-OFFER-PERM').status).toBe('MET');
      expect(path(alreadyFiled)).toMatchObject({
        status: 'FUTURE',
        earliestDate: '2026-12-01',
        approvalStatus: 'FUTURE',
        approvalEarliestDate: '2026-12-01',
      });
    },
  );

  test('rechecks age at the actual filing dates for I-130 and I-864', () => {
    const request: UsFullRequest = {
      ...f,
      dateOfBirth: '2005-11-30',
      family: {
        ...family,
        relationship: 'unmarried-child',
        beneficiaryAge: 20,
        childRelationship: 'biological',
      },
      support: {
        ...support,
        activeDuty: true,
        household: { region: 'contiguous', size: 2, incomeUsd: 23000 },
      },
      admission: {
        ...admission,
        petitionStatus: 'filed-with-i485',
        visaAtFiling: 'unavailable',
        visaAtFilingByMonth: { '2026-12': 'unavailable' },
      },
    };
    expect(condition(request, 'C33-VISA-AND-ENTRY').filingStatus).toBe('MET');
    expect(condition(request, 'C25-SUPPORT-INCOME').status).toBe('MET');
    expect(path(request).earliestDate).toBe(time.simulationDate);
    const delayed: UsFullRequest = {
      ...request,
      trips: [{ departed: '2026-11-20', returned: '2026-12-01' }],
    };
    expect(condition(delayed, 'C33-VISA-AND-ENTRY').filingStatus).toBe(
      'NOT_MET',
    );
    expect(condition(delayed, 'C25-SUPPORT-INCOME').status).toBe('NOT_MET');
    expect(path(delayed).earliestDate).toBeUndefined();
    const previouslyFiled: UsFullRequest = {
      ...delayed,
      admission: {
        ...delayed.admission,
        petitionStatus: 'approved',
        petitionFiledOn: '2026-07-01',
      },
    };
    expect(condition(previouslyFiled, 'C33-VISA-AND-ENTRY').filingStatus).toBe(
      'MET',
    );
    expect(condition(previouslyFiled, 'C25-SUPPORT-INCOME').status).toBe(
      'NOT_MET',
    );
  });

  test('does not date filing when I-693 expires before the in-country receipt', () => {
    const request: UsFullRequest = {
      ...withAdmission({
        adjustmentBasis: 'vawa',
        i693SignedOn: '2023-10-31',
        visaAtFilingByMonth: { '2025-11': 'available' },
        visaAtDecisionByMonth: { '2025-11': 'available' },
      }),
      simulationDate: '2025-10-30',
    };
    expect(condition(request, 'C36-HEALTH').filingStatus).toBe('MET');
    expect(path(request).earliestDate).toBe(request.simulationDate);
    const delayed: UsFullRequest = {
      ...request,
      trips: [{ departed: '2025-10-29', returned: '2025-11-03' }],
    };
    expect(condition(delayed, 'C36-HEALTH')).toMatchObject({
      filingStatus: 'NOT_MET',
      status: 'NOT_MET',
    });
    expect(path(delayed).earliestDate).toBeUndefined();
    expect(path(delayed).approvalEarliestDate).toBeUndefined();
  });

  test('rechecks I-485 child fees at the in-country receipt', () => {
    const request: UsFullRequest = {
      ...f,
      dateOfBirth: '2012-11-30',
      fees: { ...f.fees, applyingWithParent: true },
    };
    expect(condition(request, 'C44-I485').explanation).toContain('USD 950');
    const delayed: UsFullRequest = {
      ...request,
      trips: [{ departed: '2026-11-20', returned: '2026-12-01' }],
    };
    expect(condition(delayed, 'C44-I485').explanation).toContain('USD 1440');
    expect(path(delayed).earliestDate).toBe('2026-12-01');
  });

  test('keeps I-864 pending when a sponsor’s reported age cannot resolve the later receipt', () => {
    const request: UsFullRequest = {
      ...f,
      support: { ...support, sponsorAge: 17 },
    };
    expect(condition(request, 'C26-SPONSOR').status).toBe('NOT_MET');
    const delayed: UsFullRequest = {
      ...request,
      trips: [{ departed: '2026-11-20', returned: '2026-12-01' }],
    };
    expect(condition(delayed, 'C26-SPONSOR')).toMatchObject({
      status: 'UNKNOWN',
      pendingDetails: ['PD-276'],
    });
    expect(path(delayed).earliestDate).toBeUndefined();
  });

  test('rechecks the EB-5 threshold when a prospective joint receipt moves into the next schedule', () => {
    const request: UsFullRequest = {
      ...eb5,
      simulationDate: '2026-12-31',
      admission: {
        ...eb5.admission,
        petitionStatus: 'filed-with-i485',
        visaAtFilingByMonth: { '2027-01': 'available' },
        visaAtDecisionByMonth: { '2027-01': 'available' },
      },
    };
    expect(condition(request, 'C31-INVESTMENT-AMOUNT').status).toBe('MET');
    expect(path(request).earliestDate).toBe(request.simulationDate);
    const delayed: UsFullRequest = {
      ...request,
      trips: [{ departed: '2026-12-29', returned: '2027-01-01' }],
    };
    expect(condition(delayed, 'C31-INVESTMENT-AMOUNT')).toMatchObject({
      status: 'UNKNOWN',
      pendingDetails: ['PD-264'],
    });
    expect(path(delayed).earliestDate).toBeUndefined();
    const alreadyFiled: UsFullRequest = {
      ...delayed,
      admission: {
        ...delayed.admission,
        petitionStatus: 'approved',
        petitionFiledOn: '2026-10-01',
      },
    };
    expect(condition(alreadyFiled, 'C31-INVESTMENT-AMOUNT').status).toBe('MET');
    expect(path(alreadyFiled).earliestDate).toBe('2027-01-04');
  });

  test('evaluates the N-400 minimum age on the future receipt date', () => {
    const request = { ...n, dateOfBirth: '2008-11-24' } as const;
    expect(condition(request, 'C01-AGE').status).toBe('MET');
    expect(path(request)).toMatchObject({
      status: 'FUTURE',
      earliestDate: '2026-11-24',
      approvalStatus: 'FUTURE',
      approvalEarliestDate: '2026-11-24',
    });
  });
});

describe('filing and evidence exceptions', () => {
  test('I-751 on Monday after a Sunday filing cutoff depends on the channel', () => {
    const caseInput = { ...conditions, permanentResident: '2024-11-23' };
    expect(path(caseInput).status).toBe('MET');
    const online: UsFullRequest = { ...caseInput, fees: { channel: 'online' } };
    expect(path(online)).toMatchObject({
      status: 'UNKNOWN',
      approvalStatus: 'UNKNOWN',
    });
    expect(path(online).earliestDate).toBeUndefined();
    expect(condition(online, 'TIME-CONDITIONS-FILING')).toMatchObject({
      status: 'UNKNOWN',
      pendingDetails: ['PD-094', 'PD-274'],
    });
    for (const [lateFilingExcuse, status] of [
      ['cleared', 'MET'],
      ['barred', 'NOT_MET'],
    ] as const) {
      const request = {
        ...online,
        conditions: { marriage: { ...marriage, lateFilingExcuse } },
      };
      expect(condition(request, 'TIME-CONDITIONS-FILING').status).toBe(status);
      expect(path(request)).toMatchObject({ status, approvalStatus: status });
      expect(path(request).earliestDate).toBe(
        status === 'MET' ? time.simulationDate : undefined,
      );
    }
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
      laborCertificationFiledOn: '2026-05-01',
      stateJobOrder: { from: '2026-03-03', through: '2026-04-01' },
      advertisementDates: ['2025-11-02', '2025-11-09'],
      professional: true,
      notice: { method: 'union', notifiedOn: '2026-04-01' },
      extraDistinctSteps: 3,
      qualifiedAvailableUsWorker: false,
      employerPaidPermCosts: true,
    } satisfies NonNullable<UsEmploymentAnswers['permRecruitment']>;
    expect(
      condition(
        withEmployment({ perm: 'pending', permRecruitment }),
        'C28-OFFER-PERM',
      ).status,
    ).toBe('UNKNOWN');
    expect(
      condition(
        withEmployment({
          perm: 'pending',
          permRecruitment: {
            ...permRecruitment,
            stateJobOrder: { from: '2026-03-04', through: '2026-04-02' },
          },
        }),
        'C28-OFFER-PERM',
      ).status,
    ).toBe('NOT_MET');
    expect(
      condition(
        withEmployment({
          perm: 'pending',
          permRecruitment: { ...permRecruitment, extraDistinctSteps: 2 },
        }),
        'C28-OFFER-PERM',
      ).status,
    ).toBe('NOT_MET');
    expect(
      condition(
        withEmployment({
          perm: 'pending',
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

describe('review86-14 regressions', () => {
  test.each(['US-EMPLOYMENT', 'US-ADJUSTMENT'] as const)(
    'EB-5 in %s needs no I-864 sponsor or employer relationship answers',
    (pathway) => {
      const request: UsFullRequest = {
        ...eb5,
        pathway,
        employment: {
          ...eb5.employment,
          relativePetitioner: undefined,
          relativeOwnershipPct: undefined,
        },
      };
      for (const id of [
        'C25-SUPPORT-INCOME',
        'C26-SPONSOR',
        'C27-SUPPORT-EXEMPTION',
      ]) {
        expect(condition(request, id)).toMatchObject({
          status: 'MET',
          applicable: false,
        });
      }
      expect(path(request)).toMatchObject({
        status: 'MET',
        earliestDate: time.simulationDate,
        approvalStatus: 'MET',
        approvalEarliestDate: time.simulationDate,
      });
      const unrelatedAnswers: UsFullRequest = {
        ...request,
        employment: {
          ...request.employment,
          relativePetitioner: true,
          relativeOwnershipPct: 100,
        },
        support: { exemption: 'quarters', exemptionEvidence: 'barred' },
      };
      expect(path(unrelatedAnswers)).toEqual(path(request));
    },
  );

  const adultChild: UsFullRequest = {
    ...f,
    dateOfBirth: '1999-05-01',
    family: {
      ...family,
      relationship: 'unmarried-child',
      childRelationship: 'biological',
      beneficiaryAge: 27,
    },
    admission: {
      ...admission,
      petitionFiledOn: '2022-07-01',
      adjustmentBasis: 'family-preference',
      visaAtFiling: 'unavailable',
      visaAtDecision: 'unavailable',
    },
  };
  const expectFamilyOutcome = (
    request: UsFullRequest,
    expected: 'MET' | 'NOT_MET' | 'UNKNOWN',
  ) => {
    expect(condition(request, 'C33-VISA-AND-ENTRY')).toMatchObject({
      filingStatus: expected,
      status: expected,
    });
    const result = path(request);
    expect(result.status).toBe(expected);
    expect(result.approvalStatus).toBe(expected);
    const date = expected === 'MET' ? time.simulationDate : undefined;
    expect(result.earliestDate).toBe(date);
    expect(result.approvalEarliestDate).toBe(date);
  };

  test.each(['US-FAMILY', 'US-ADJUSTMENT'] as const)(
    'adult F1 in %s uses DOB and actual I-130 receipt even with no CSPA age',
    (pathway) => {
      expectFamilyOutcome({ ...adultChild, pathway }, 'NOT_MET');
    },
  );

  test.each([
    ['2020-04-30', 'MET'],
    ['2020-05-01', 'NOT_MET'],
    ['2024-01-01', 'NOT_MET'],
    [undefined, 'UNKNOWN'],
  ] as const)(
    'F2A conversion on %s assesses age on that day',
    (on, expected) => {
      const converted: UsFullRequest = {
        ...adultChild,
        family: {
          ...adultChild.family,
          petitionerAtFiling: 'lpr',
          petitionerNaturalizedOn: on,
        },
        admission: { ...adultChild.admission, petitionFiledOn: '2018-05-01' },
      };
      for (const pathway of ['US-FAMILY', 'US-ADJUSTMENT'] as const) {
        expectFamilyOutcome({ ...converted, pathway }, expected);
      }
    },
  );

  test('derives I-130 filing status from naturalization and separates a case-specific CSPA finding', () => {
    const converted: UsFullRequest = {
      ...adultChild,
      family: {
        ...adultChild.family,
        petitioner: undefined,
        petitionerNaturalizedOn: '2024-01-01',
      },
      admission: { ...adultChild.admission, petitionFiledOn: '2018-05-01' },
    };
    expectFamilyOutcome(converted, 'NOT_MET');
    expectFamilyOutcome(
      { ...converted, family: { ...converted.family, cspaAge: 'pending' } },
      'UNKNOWN',
    );
    expectFamilyOutcome(
      { ...converted, family: { ...converted.family, cspaAge: 20 } },
      'MET',
    );
    expectFamilyOutcome(
      {
        ...converted,
        family: {
          ...converted.family,
          petitioner: 'lpr',
          petitionerAtFiling: 'lpr',
          petitionerNaturalizedOn: undefined,
        },
      },
      'NOT_MET',
    );
  });

  test('does not need the missing naturalization date when the child is still under the age limit', () => {
    expectFamilyOutcome(
      {
        ...adultChild,
        dateOfBirth: '2006-05-01',
        family: {
          ...adultChild.family,
          petitionerAtFiling: 'lpr',
          beneficiaryAge: undefined,
        },
        admission: { ...adultChild.admission, petitionFiledOn: '2024-01-01' },
      },
      'MET',
    );
  });

  test('uses proved I-864 applicability and does not treat missing employer facts as no relation', () => {
    const self: UsFullRequest = {
      ...eb1a,
      employment: {
        ...eb1a.employment,
        i140SelfPetition: true,
        relativePetitioner: undefined,
        relativeOwnershipPct: undefined,
      },
    };
    const id = 'C27-SUPPORT-EXEMPTION';
    expect(condition(self, id)).toMatchObject({
      status: 'MET',
      applicable: false,
    });
    expect(path(self).status).toBe('MET');
    const noRelativeEmployer = withEmployment({}, 'approved');
    expect(condition(noRelativeEmployer, id)).toMatchObject({
      status: 'MET',
      applicable: false,
    });
    for (const employment of [
      { relativePetitioner: undefined },
      { relativeOwnershipPct: undefined },
    ]) {
      expect(condition(withEmployment(employment, 'approved'), id).status).toBe(
        'UNKNOWN',
      );
    }
    expect(
      condition(withEmployment({ relativeOwnershipPct: 5 }, 'approved'), id)
        .applicable,
    ).toBeUndefined();
  });

  test('uses known primary petitioner identity and regular income without a separate active-duty answer', () => {
    const request: UsFullRequest = {
      ...f,
      family: { ...family, petitionerAge: 30 },
      support: {
        ...support,
        sponsorAge: undefined,
        sponsorStatus: undefined,
        exemption: undefined,
        activeDuty: undefined,
      },
    };
    expect(condition(request, 'C25-SUPPORT-INCOME').status).toBe('MET');
    expect(condition(request, 'C26-SPONSOR').status).toBe('MET');
    expect(path(request)).toMatchObject({
      status: 'MET',
      approvalStatus: 'MET',
    });
    const incomeOnlyAtActiveRate: UsFullRequest = {
      ...request,
      support: {
        ...request.support,
        household: { region: 'contiguous', size: 2, incomeUsd: 23000 },
      },
    };
    expect(condition(incomeOnlyAtActiveRate, 'C25-SUPPORT-INCOME').status).toBe(
      'UNKNOWN',
    );
  });

  test('the approved Schedule A I-140 does not require original notice dates', () => {
    const request = withEmployment(
      {
        perm: 'schedule-a',
        permCertifiedOn: undefined,
        recruitmentAndFeesCompliant: undefined,
        permRecruitment: {
          notice: { method: 'posting' },
          employerPaidPermCosts: true,
        },
      },
      'approved',
    );
    expect(condition(request, 'C28-OFFER-PERM')).toMatchObject({
      status: 'MET',
      filingStatus: 'MET',
    });
    expect(path(request).approvalStatus).toBe('MET');
  });

  test('derives spouse citizenship duration and age when party membership ended', () => {
    const request: UsFullRequest = {
      ...spouse,
      naturalization: {
        ...spouse.naturalization,
        disability: undefined,
        spouse: {
          ...spouse.naturalization?.spouse,
          spouseCitizenRequiredPeriod: undefined,
        },
      },
    };
    expect(condition(request, 'C05-N648').applicable).toBe(false);
    expect(condition(request, 'C13-MARITAL-UNION').status).toBe('MET');
    const birth = '2007-05-01';
    for (const [endedOn, status] of [
      ['2023-04-30', 'MET'],
      ['2023-05-01', 'NOT_MET'],
    ] as const) {
      const former = withNatural({ party: { membership: 'former', endedOn } });
      expect(
        condition({ ...former, dateOfBirth: birth }, 'C09-ATTACHMENT').status,
      ).toBe(status);
    }
  });

  test('an empty trip history makes return-specific document answers immaterial', () => {
    const request: UsFullRequest = {
      ...t,
      trips: [],
      travel: {
        ...travel,
        returnDocument: 'none',
        documentValidAtReturn: false,
        abandonment: undefined,
      },
    };
    expect(condition(request, 'C22-RETURN-DOCUMENT').status).toBe('MET');
    expect(condition(request, 'C22-RESIDENCE-INTENT').status).toBe('MET');
    expect(path(request).status).toBe('MET');
  });

  test('does not require a waiver answer when all applicable humanitarian grounds are clear', () => {
    const request: UsFullRequest = {
      ...h,
      humanitarian: { ...human, waiver: undefined },
    };
    expect(condition(request, 'C42-HUMANITARIAN-WAIVER').status).toBe('MET');
    expect(path(request)).toMatchObject({
      status: 'MET',
      approvalStatus: 'MET',
    });
  });
});

describe('review86-15 regressions', () => {
  test.each([
    ['2026-10-24', undefined, 'MET'],
    ['2026-05-27', undefined, 'MET'],
    ['2026-11-09', false, 'NOT_MET'],
    ['2026-11-09', true, 'NOT_MET'],
    ['2026-05-26', undefined, 'NOT_MET'],
    ['2026-10-24', false, 'NOT_MET'],
    [undefined, undefined, 'UNKNOWN'],
    [undefined, true, 'UNKNOWN'],
  ] as const)(
    'Schedule A concurrent filing with notice on %s and compliance %s is %s',
    (notifiedOn, compliant, expected) => {
      const request = withEmployment(
        {
          category: 'eb3',
          perm: 'schedule-a',
          permCertifiedOn: undefined,
          recruitmentAndFeesCompliant: compliant,
          permRecruitment: {
            notice: { method: 'union', notifiedOn },
            employerPaidPermCosts: true,
          },
        },
        'filed-with-i485',
      );
      for (const pathway of ['US-EMPLOYMENT', 'US-ADJUSTMENT'] as const) {
        const input = { ...request, pathway };
        const offer = condition(input, 'C28-OFFER-PERM');
        expect(offer.status).toBe(expected);
        if (expected === 'UNKNOWN')
          expect(offer.pendingDetails).toEqual(['PD-277']);
        const result = path(input);
        expect(result.status).toBe(expected);
        expect(result.earliestDate).toBe(
          expected === 'MET' ? time.simulationDate : undefined,
        );
        expect(result.approvalStatus).toBe(
          expected === 'NOT_MET' ? 'NOT_MET' : 'UNKNOWN',
        );
        expect(result.approvalEarliestDate).toBeUndefined();
      }
    },
  );

  test.each([
    [undefined, undefined, 'UNKNOWN'],
    ['citizen', undefined, 'MET'],
    ['lpr', undefined, 'UNKNOWN'],
    [undefined, '2024-01-01', 'NOT_MET'],
  ] as const)(
    'historical I-130 with petitioner status %s and naturalization date %s is %s',
    (petitionerAtFiling, petitionerNaturalizedOn, expected) => {
      for (const pathway of ['US-FAMILY', 'US-ADJUSTMENT'] as const) {
        const request: UsFullRequest = {
          ...f,
          pathway,
          dateOfBirth: '1999-05-01',
          family: {
            ...family,
            relationship: 'unmarried-child',
            childRelationship: 'biological',
            beneficiaryAge: 27,
            petitionerAtFiling,
            petitionerNaturalizedOn,
          },
          admission: {
            ...admission,
            petitionFiledOn: '2018-05-01',
            adjustmentBasis: 'family-preference',
            visaAtFiling: 'unavailable',
            visaAtDecision: 'unavailable',
          },
        };
        const visa = condition(request, 'C33-VISA-AND-ENTRY');
        expect(visa).toMatchObject({
          status: expected,
          filingStatus: expected,
        });
        if (expected === 'UNKNOWN')
          expect(visa.pendingDetails).toEqual(['PD-272']);
        const result = path(request);
        const date = expected === 'MET' ? time.simulationDate : undefined;
        expect(result.status).toBe(expected);
        expect(result.approvalStatus).toBe(expected);
        expect(result.earliestDate).toBe(date);
        expect(result.approvalEarliestDate).toBe(date);
      }
    },
  );

  test.each([
    [false, undefined, 'none', 'NOT_MET'],
    [false, undefined, undefined, 'NOT_MET'],
    [undefined, undefined, 'none', 'UNKNOWN'],
    [false, true, 'none', 'MET'],
  ] as const)(
    'paroled EB-2 with 245(k) lawful admission %s, lawful status %s and other bar %s is %s',
    (
      lawfulAdmissionFor245k,
      lawfulNonimmigrantStatusAtFiling,
      otherAdjustmentBar,
      expected,
    ) => {
      for (const pathway of ['US-EMPLOYMENT', 'US-ADJUSTMENT'] as const) {
        const request: UsFullRequest = {
          ...e,
          pathway,
          admission: {
            ...e.admission,
            legalEntry: 'paroled',
            qualifyingViolationsDays: 0,
            lawfulAdmissionFor245k,
            lawfulNonimmigrantStatusAtFiling,
            otherAdjustmentBar,
          },
        };
        expect(condition(request, 'C33-VISA-AND-ENTRY').status).toBe('MET');
        const bars = condition(request, 'C34-ADJUSTMENT-BARS');
        expect(bars.status).toBe(expected);
        if (expected === 'UNKNOWN')
          expect(bars.pendingDetails).toEqual(['PD-274']);
        const result = path(request);
        const date = expected === 'MET' ? time.simulationDate : undefined;
        expect(result.status).toBe(expected);
        expect(result.approvalStatus).toBe(expected);
        expect(result.earliestDate).toBe(date);
        expect(result.approvalEarliestDate).toBe(date);
      }
    },
  );

  test.each([
    ['EB-2', e],
    ['EB-5', eb5],
  ] as const)('applies a confirmed 245(k) exception to %s', (_, input) => {
    const request: UsFullRequest = {
      ...input,
      admission: {
        ...input.admission,
        lawfulNonimmigrantStatusAtFiling: false,
        lawfulAdmissionFor245k: true,
      },
    };
    expect(condition(request, 'C34-ADJUSTMENT-BARS').status).toBe('MET');
    expect(path(request)).toMatchObject({
      status: 'MET',
      approvalStatus: 'MET',
      earliestDate: time.simulationDate,
      approvalEarliestDate: time.simulationDate,
    });
  });
});

describe('review86-16 regressions', () => {
  const scheduleA: Partial<UsEmploymentAnswers> = {
    category: 'eb3',
    perm: 'schedule-a',
    permCertifiedOn: undefined,
  };

  test.each(['US-EMPLOYMENT', 'US-ADJUSTMENT'] as const)(
    'uses the approved I-140 for historical Schedule A and PERM conditions in %s',
    (pathway) => {
      for (const original of [scheduleA, { perm: 'certified' }] as const) {
        const approved = withEmployment(
          {
            ...original,
            i140FiledOn:
              original.perm === 'schedule-a' ? '2026-07-01' : undefined,
            permCertifiedOn: undefined,
            categoryQualifications: undefined,
            prevailingWageUsd: undefined,
            recruitmentAndFeesCompliant: undefined,
          },
          'approved',
        );
        const request = { ...approved, pathway };
        expect(condition(request, 'C28-OFFER-PERM')).toMatchObject({
          status: 'MET',
          filingStatus: 'MET',
        });
        expect(path(request)).toMatchObject({
          status: 'MET',
          approvalStatus: 'MET',
          earliestDate: time.simulationDate,
          approvalEarliestDate: time.simulationDate,
        });
        for (const [employmentOffer, status] of [
          [false, 'NOT_MET'],
          [undefined, 'UNKNOWN'],
        ] as const) {
          const result = path({
            ...request,
            employment: { ...request.employment, employmentOffer },
          });
          expect(result).toMatchObject({ status, approvalStatus: status });
          expect(result.earliestDate).toBeUndefined();
          expect(result.approvalEarliestDate).toBeUndefined();
        }
        const missingPayEvidence = {
          ...request,
          employment: { ...request.employment, wageYears: [{ paidUsd: 0 }] },
        };
        expect(condition(missingPayEvidence, 'C29-ABILITY-TO-PAY').status).toBe(
          'UNKNOWN',
        );
        expect(path(missingPayEvidence).approvalStatus).toBe('UNKNOWN');
      }
    },
  );

  const postingDates = [
    '2026-10-09',
    '2026-10-13',
    '2026-10-14',
    '2026-10-15',
    '2026-10-16',
    '2026-10-19',
    '2026-10-20',
    '2026-10-21',
    '2026-10-22',
    '2026-10-23',
  ];
  test.each([
    ['union', { method: 'union', notifiedOn: '2026-10-09' }, 'MET'],
    ['posting', { method: 'posting', businessDates: postingDates }, 'MET'],
    [
      'short posting',
      { method: 'posting', businessDates: postingDates.slice(1) },
      'NOT_MET',
    ],
    [
      'duplicate posting day',
      {
        method: 'posting',
        businessDates: [...postingDates.slice(1), postingDates[1]],
      },
      'NOT_MET',
    ],
    ['missing method', undefined, 'UNKNOWN'],
  ] as const)(
    'Schedule A accepts the applicable notice method (%s)',
    (_, notice, status) => {
      const request = withEmployment(
        {
          ...scheduleA,
          permRecruitment: {
            notice,
            employerPaidPermCosts: true,
          },
        },
        'filed-with-i485',
      );
      for (const pathway of ['US-EMPLOYMENT', 'US-ADJUSTMENT'] as const) {
        const input = { ...request, pathway };
        expect(condition(input, 'C28-OFFER-PERM').status).toBe(status);
        expect(path(input).status).toBe(status);
      }
    },
  );

  test.each(['US-EMPLOYMENT', 'US-ADJUSTMENT'] as const)(
    'compares Schedule A notice dates with paper and historical receipts in %s',
    (pathway) => {
      const scheduleAWithNotice = (notifiedOn: string) => ({
        ...scheduleA,
        permRecruitment: { notice: { method: 'union' as const, notifiedOn } },
      });
      const request = withEmployment(
        scheduleAWithNotice('2026-05-26'),
        'filed-with-i485',
      );
      const sunday = { ...request, pathway, simulationDate: '2026-11-22' };
      expect(condition(sunday, 'TIME-PAPER-RECEIPT').explanation).toContain(
        '2026-11-23',
      );
      expect(condition(sunday, 'C28-OFFER-PERM').status).toBe('NOT_MET');
      const result = path(sunday);
      expect(result).toMatchObject({
        status: 'NOT_MET',
        approvalStatus: 'NOT_MET',
      });
      expect(result.earliestDate).toBeUndefined();
      expect(result.approvalEarliestDate).toBeUndefined();
      const historical = withEmployment(
        {
          ...scheduleAWithNotice('2026-05-17'),
          i140FiledOn: '2026-07-01',
        },
        'pending',
      );
      expect(
        condition({ ...historical, pathway }, 'C28-OFFER-PERM').status,
      ).toBe('MET');
    },
  );

  test.each(['US-FAMILY', 'US-ADJUSTMENT'] as const)(
    'checks the qualifying age of a stepchild before concurrent filing in %s',
    (pathway) => {
      const request: UsFullRequest = {
        ...f,
        pathway,
        dateOfBirth: '2007-05-01',
        family: {
          ...family,
          beneficiaryAge: 19,
          relationship: 'unmarried-child',
          childRelationship: 'step',
          relationshipEstablishedAtAge: 19,
          relationshipValid: undefined,
        },
        admission: {
          ...admission,
          adjustmentBasis: undefined,
          qualifyingBasis: 'pending',
          petitionStatus: 'filed-with-i485',
          visaAtFiling: 'unavailable',
          visaAtDecision: 'unavailable',
        },
      };
      expect(condition(request, 'C23-RELATIONSHIP').status).toBe('NOT_MET');
      const result = path(request);
      expect(result).toMatchObject({
        status: 'NOT_MET',
        approvalStatus: 'NOT_MET',
      });
      expect(result.earliestDate).toBeUndefined();
      expect(result.approvalEarliestDate).toBeUndefined();
    },
  );
});

const adjustmentFixtures = [
  { name: 'family', request: f },
  { name: 'adjustment', request: p7 },
  { name: 'consular family', request: authorizedConsular },
  { name: 'EB-2 PERM', request: e },
  { name: 'EB-1A', request: eb1a },
  { name: 'EB-5', request: eb5 },
  { name: 'Gold Card', request: gold },
  ...cases.flatMap(({ id, met, other }) => [
    { name: `${id} supported`, request: met },
    { name: `${id} adverse or unresolved`, request: other },
  ]),
].filter(
  ({ request }) =>
    request.pathway === 'US-FAMILY' ||
    request.pathway === 'US-EMPLOYMENT' ||
    (request.pathway === 'US-ADJUSTMENT' &&
      request.family &&
      request.admission?.adjustmentBasis === 'immediate-relative'),
);

const adjustmentCategoryVariants = adjustmentFixtures.flatMap(
  ({ name, request }) => [
    { name, request, basis: undefined },
    ...(request.pathway === 'US-EMPLOYMENT' && request.employment?.category
      ? [
          {
            name: `${name} with the employment category omitted`,
            request: {
              ...request,
              employment: { ...request.employment, category: undefined },
            },
            basis: 'employment' as const,
          },
        ]
      : []),
  ],
);

test.each(adjustmentCategoryVariants)(
  '$name has identical eligibility checks in its dedicated and general adjustment entries',
  ({ request, basis }) => {
    const dedicated =
      request.pathway === 'US-EMPLOYMENT' ? 'US-EMPLOYMENT' : 'US-FAMILY';
    const common = {
      ...request,
      admission: { ...request.admission, adjustmentBasis: basis },
    };
    const specialized = path({ ...common, pathway: dedicated });
    const inferred = path({ ...common, pathway: 'US-ADJUSTMENT' });
    const eligibilityChecks = (result: typeof specialized) =>
      result.checks.filter((item) => !/^US-C4[45]-/.test(item.id));
    expect(eligibilityChecks(inferred)).toEqual(eligibilityChecks(specialized));
    for (const item of inferred.checks.filter((check) =>
      /^US-C4[45]-/.test(check.id),
    )) {
      const shared = specialized.checks.find((check) => check.id === item.id);
      if (shared) expect(item).toEqual(shared);
    }
    expect(inferred.status).toBe(specialized.status);
    expect(inferred.approvalStatus).toBe(specialized.approvalStatus);
    expect(inferred.earliestDate).toBe(specialized.earliestDate);
    expect(inferred.approvalEarliestDate).toBe(
      specialized.approvalEarliestDate,
    );
  },
);

describe('review86-17 regressions', () => {
  const today = time.simulationDate;
  const met = {
    status: 'MET',
    approvalStatus: 'MET',
    earliestDate: today,
    approvalEarliestDate: today,
  };
  const familyEntries = ['US-FAMILY', 'US-ADJUSTMENT'] as const;
  const employmentEntries = ['US-EMPLOYMENT', 'US-ADJUSTMENT'] as const;

  test.each(familyEntries)(
    'I-130 approval covers historical relationship and petition bars in %s',
    (pathway) => {
      const approved = {
        ...f,
        pathway,
        family: {
          petitioner: 'citizen',
          relationship: 'spouse',
          relationshipValid: 'cleared',
        },
      } satisfies UsFullRequest;
      expect(path({ ...f, pathway })).toMatchObject(met);
      expect(condition(approved, 'C24-PETITION-BARS').status).toBe('MET');
      expect(path(approved)).toMatchObject(met);
      expect(
        condition(pendingPetition(approved), 'C24-PETITION-BARS').status,
      ).toBe('UNKNOWN');

      const adoption: UsFullRequest = {
        ...approved,
        family: {
          ...approved.family,
          relationship: 'unmarried-child',
          childRelationship: 'adopted',
        },
      };
      const adoptionHistory: UsFullRequest = {
        ...adoption,
        family: {
          ...adoption.family,
          relationshipEstablishedAtAge: 8,
          custodyYears: 2,
          livedTogetherYears: 2,
        },
      };
      expect(path(adoptionHistory)).toMatchObject(met);
      expect(condition(adoption, 'C23-RELATIONSHIP').status).toBe('MET');
      expect(path(adoption)).toMatchObject(met);

      for (const [family, status] of [
        [{ relationshipValid: undefined }, 'UNKNOWN'],
        [{ relationshipValid: 'barred' }, 'NOT_MET'],
        [{ priorMarriageFraud: true }, 'NOT_MET'],
        [{ adamWalsh: 'pending' }, 'UNKNOWN'],
      ] as const) {
        const result = path({
          ...approved,
          family: { ...approved.family, ...family },
        });
        expect(result).toMatchObject({ status, approvalStatus: status });
        expect(result.earliestDate).toBeUndefined();
        expect(result.approvalEarliestDate).toBeUndefined();
      }
    },
  );

  test.each(employmentEntries)(
    'DOL certification covers recruitment but preserves other I-140 requirements in %s',
    (pathway) => {
      const details = {
        category: 'eb3',
        perm: 'certified',
        permCertifiedOn: '2026-10-01',
        i140FiledOn: '2026-11-02',
      } as const;
      const full = { ...withEmployment(details, 'pending'), pathway };
      const minimal = {
        ...full,
        employment: {
          ...full.employment,
          recruitmentAndFeesCompliant: undefined,
          prevailingWageUsd: undefined,
        },
      };
      for (const input of [full, minimal]) {
        expect(condition(input, 'C28-OFFER-PERM').status).toBe('MET');
        expect(condition(input, 'C33-VISA-AND-ENTRY')).toMatchObject({
          filingStatus: 'MET',
          status: 'UNKNOWN',
        });
        expect(path(input)).toMatchObject({
          status: 'MET',
          approvalStatus: 'UNKNOWN',
          earliestDate: today,
        });
        expect(path(input).approvalEarliestDate).toBeUndefined();
      }
      for (const [employment, status] of [
        [{ permCertifiedOn: '2025-10-01' }, 'NOT_MET'],
        [{ i140FiledOn: undefined }, 'UNKNOWN'],
        [{ categoryQualifications: undefined }, 'UNKNOWN'],
        [{ employmentOffer: false }, 'NOT_MET'],
      ] as const) {
        const input = {
          ...minimal,
          employment: { ...minimal.employment, ...employment },
        };
        expect(condition(input, 'C28-OFFER-PERM').status).toBe(status);
        expect(path(input)).toMatchObject({ status, approvalStatus: status });
        expect(path(input).earliestDate).toBeUndefined();
        expect(path(input).approvalEarliestDate).toBeUndefined();
      }
      const missingPay = {
        ...minimal,
        employment: { ...minimal.employment, profferedWageUsd: undefined },
      };
      expect(condition(missingPay, 'C29-ABILITY-TO-PAY').status).toBe(
        'UNKNOWN',
      );
      expect(path(missingPay).earliestDate).toBeUndefined();
    },
  );

  test.each([
    ['eb1b', undefined],
    ['eb1c', undefined],
    ['eb2-perm', 'certified'],
    ['eb3', 'certified'],
    ['eb3', 'schedule-a'],
  ] as const)(
    'approved employer I-140 carries classification and any certification (%s, %s)',
    (category, perm) => {
      const full = withEmployment({ category, perm }, 'approved');
      const minimal: UsFullRequest = {
        ...full,
        employment: {
          category,
          employmentOffer: true,
          initialSupplementJIncluded: true,
          abilityToPayTotality: 'cleared',
          relativePetitioner: false,
          relativeOwnershipPct: 0,
        },
      };
      for (const pathway of employmentEntries) {
        expect(path({ ...full, pathway })).toMatchObject(met);
        expect(path({ ...minimal, pathway })).toMatchObject(met);
        expect(
          condition({ ...minimal, pathway }, 'C28-OFFER-PERM'),
        ).toMatchObject({ status: 'MET', filingStatus: 'MET' });
        expect(
          condition({ ...pendingPetition(minimal), pathway }, 'C28-OFFER-PERM')
            .status,
        ).toBe('UNKNOWN');
        const lostOffer = {
          ...minimal,
          pathway,
          employment: { ...minimal.employment, employmentOffer: false },
        };
        expect(path(lostOffer)).toMatchObject({
          status: 'NOT_MET',
          approvalStatus: 'NOT_MET',
        });
        expect(path(lostOffer).approvalEarliestDate).toBeUndefined();
      }
    },
  );

  test.each([
    ['EB-1A', eb1a],
    [
      'EB-2 NIW',
      withEmployment(
        {
          category: 'eb2-niw',
          i140SelfPetition: true,
          degree: 'advanced',
          niwProngs: {
            nationalImportance: true,
            wellPositioned: true,
            waiverBeneficial: true,
          },
          niwDetermination: 'cleared',
          continuesWorkInField: true,
        },
        'approved',
      ),
    ],
  ] as const)(
    '%s approval covers petition evidence and merits, with current intent checked',
    (_, full) => {
      for (const pathway of employmentEntries) {
        expect(path({ ...full, pathway })).toMatchObject(met);
        const {
          category,
          i140SelfPetition,
          relativePetitioner,
          relativeOwnershipPct,
          benefitsUnitedStates,
        } = full.employment!;
        const minimal = {
          ...full,
          pathway,
          employment: {
            category,
            i140SelfPetition,
            relativePetitioner,
            relativeOwnershipPct,
            benefitsUnitedStates,
            continuesWorkInField: true,
          },
        };
        expect(condition(minimal, 'C30-SELF-PETITION-EVIDENCE').status).toBe(
          'MET',
        );
        expect(condition(minimal, 'C30-SELF-PETITION-MERITS')).toMatchObject({
          status: 'MET',
          filingStatus: 'MET',
        });
        expect(path(minimal)).toMatchObject(met);
        expect(
          condition(pendingPetition(minimal), 'C30-SELF-PETITION-EVIDENCE')
            .status,
        ).toBe('UNKNOWN');
        for (const [continuesWorkInField, status] of [
          [false, 'NOT_MET'],
          [undefined, 'UNKNOWN'],
        ] as const) {
          const result = path({
            ...minimal,
            employment: { ...minimal.employment, continuesWorkInField },
          });
          expect(result).toMatchObject({ status, approvalStatus: status });
          expect(result.earliestDate).toBeUndefined();
          expect(result.approvalEarliestDate).toBeUndefined();
        }
      }
    },
  );

  test.each([false, true])(
    'EB-5 approval covers the initial petition (regional center %s)',
    (regionalCenter) => {
      const ids = [
        'C31-INVESTMENT-AMOUNT',
        'C31-INVESTMENT-PROJECT',
        'C31-INVESTMENT-JOBS',
      ];
      for (const pathway of employmentEntries) {
        const full = {
          ...eb5,
          pathway,
          employment: {
            ...eb5.employment,
            investment: {
              ...eb5.employment!.investment,
              regionalCenter,
              projectFiled: regionalCenter,
            },
          },
        };
        const minimal = { ...full, employment: { category: 'eb5' as const } };
        expect(path(full)).toMatchObject(met);
        expect(path(minimal)).toMatchObject(met);
        for (const id of ids) {
          expect(condition(minimal, id).status).toBe('MET');
          expect(condition(pendingPetition(minimal), id).status).toBe(
            'UNKNOWN',
          );
        }
        for (const [qualifyingBasis, status] of [
          ['barred', 'NOT_MET'],
          ['pending', 'UNKNOWN'],
        ] as const) {
          const result = path({
            ...minimal,
            admission: { ...minimal.admission, qualifyingBasis },
          });
          expect(result).toMatchObject({ status, approvalStatus: status });
          expect(result.earliestDate).toBeUndefined();
          expect(result.approvalEarliestDate).toBeUndefined();
        }
      }
    },
  );

  test.each([
    ['vawa', 'US-FAMILY'],
    ['sij', 'US-EMPLOYMENT'],
  ] as const)(
    'approved I-360 establishes %s without original petition details',
    (adjustmentBasis, dedicated) => {
      for (const pathway of [dedicated, 'US-ADJUSTMENT'] as const) {
        const input: UsFullRequest = {
          ...time,
          pathway,
          fees: f.fees,
          admission: {
            ...admission,
            adjustmentBasis,
            legalEntry: 'without-inspection',
            publicCharge: undefined,
          },
        };
        expect(condition(input, 'C33-VISA-AND-ENTRY')).toMatchObject({
          status: 'MET',
          filingStatus: 'MET',
        });
        expect(condition(input, 'C37-PUBLIC-CHARGE').applicable).toBe(false);
        expect(path(input)).toMatchObject(met);
        const backlogged = {
          ...input,
          admission: {
            ...input.admission,
            visaAtDecision: 'unavailable' as const,
          },
        };
        expect(path(backlogged)).toMatchObject({
          status: 'MET',
          approvalStatus: 'NOT_MET',
          earliestDate: today,
        });
        expect(path(backlogged).approvalEarliestDate).toBeUndefined();
        expect(
          path(pendingPetition(input)).approvalEarliestDate,
        ).toBeUndefined();
      }
    },
  );

  test.each(employmentEntries)(
    'approved I-140G preserves the consular transfer requirement in %s',
    (pathway) => {
      const full = {
        ...gold,
        pathway,
        admission: {
          ...gold.admission,
          adjustmentBasis: 'employment',
          petitionStatus: 'approved',
        },
      } satisfies UsFullRequest;
      const minimal = {
        ...full,
        employment: {
          category: 'gold-card',
          relativePetitioner: false,
          relativeOwnershipPct: 0,
          gold: { giftTransferred: 'cleared' },
        },
      } satisfies UsFullRequest;
      const expected = {
        status: 'MET',
        approvalStatus: 'UNKNOWN',
        earliestDate: today,
      };
      expect(path(full)).toMatchObject(expected);
      expect(path(minimal)).toMatchObject(expected);
      expect(path(minimal).approvalEarliestDate).toBeUndefined();
      expect(condition(minimal, 'C32-GOLD-GIFT')).toMatchObject({
        status: 'MET',
        filingStatus: 'MET',
      });
      const unconfirmedTransfer = {
        ...minimal,
        employment: { ...minimal.employment, gold: undefined },
      };
      expect(condition(unconfirmedTransfer, 'C32-GOLD-GIFT')).toMatchObject({
        status: 'UNKNOWN',
        filingStatus: 'MET',
        pendingDetails: ['PD-276'],
      });
    },
  );

  const portability = {
    i485PendingSince: '2026-05-27',
    originalOfferValidAtFiling: true,
    newOffer: true,
    sameOrSimilarOccupation: 'cleared',
    supplementJFiledOn: today,
  } as const;
  const worker = withEmployment(
    {
      category: 'eb3',
      i140FiledOn: '2026-05-27',
      permCertifiedOn: '2026-05-01',
      employmentOffer: false,
      wageYears: undefined,
      abilityToPayTotality: undefined,
      officerStatementAccepted: undefined,
    },
    'approved',
  );
  const portedWorker = {
    ...worker,
    employment: { ...worker.employment, jobPortability: portability },
    admission: {
      ...worker.admission,
      visaAtFilingByMonth: { '2026-05': 'available' as const },
    },
  };

  test.each(employmentEntries)(
    'uses a timely same-or-similar offer under INA §204(j) in %s',
    (pathway) => {
      expect(path({ ...worker, pathway }).approvalStatus).toBe('NOT_MET');
      const approved = { ...portedWorker, pathway };
      expect(condition(approved, 'C28-OFFER-PERM')).toMatchObject({
        status: 'MET',
        filingStatus: 'MET',
      });
      expect(condition(approved, 'C29-ABILITY-TO-PAY').status).toBe('MET');
      expect(path(approved)).toMatchObject(met);

      const pending = pendingPetition(approved);
      expect(condition(pending, 'C28-OFFER-PERM').status).toBe('MET');
      expect(condition(pending, 'C29-ABILITY-TO-PAY').status).toBe('UNKNOWN');
      const documented = {
        ...pending,
        employment: {
          ...pending.employment,
          abilityToPayTotality: 'cleared' as const,
        },
      };
      expect(path(documented)).toMatchObject({
        status: 'MET',
        approvalStatus: 'UNKNOWN',
        earliestDate: today,
      });
      expect(path(documented).approvalEarliestDate).toBeUndefined();
    },
  );

  test.each([
    [
      'day before eligibility',
      { i485PendingSince: '2026-05-28' },
      'MET',
      'NOT_MET',
    ],
    [
      'early Supplement J',
      { supplementJFiledOn: '2026-11-22' },
      'MET',
      'NOT_MET',
    ],
    [
      'unconfirmed Supplement J',
      { supplementJFiledOn: undefined },
      'MET',
      'UNKNOWN',
    ],
    ['no new offer', { newOffer: false }, 'MET', 'NOT_MET'],
    ['unrelated role', { sameOrSimilarOccupation: 'barred' }, 'MET', 'NOT_MET'],
    [
      'classification to be reviewed',
      { sameOrSimilarOccupation: 'pending' },
      'MET',
      'UNKNOWN',
    ],
    [
      'no original offer at filing',
      { originalOfferValidAtFiling: false },
      'NOT_MET',
      'NOT_MET',
    ],
  ] as const)(
    'keeps the INA §204(j) filing and approval requirements separate (%s)',
    (_, answers, filingStatus, status) => {
      for (const pathway of employmentEntries) {
        const input: UsFullRequest = {
          ...portedWorker,
          pathway,
          employment: {
            ...portedWorker.employment,
            abilityToPayTotality: 'cleared',
            jobPortability: { ...portability, ...answers },
          },
        };
        expect(condition(input, 'C28-OFFER-PERM')).toMatchObject({
          status,
          filingStatus,
        });
        const result = path(input);
        expect(result).toMatchObject({
          status: filingStatus,
          approvalStatus: status,
        });
        expect(result.earliestDate).toBe(
          filingStatus === 'MET' ? today : undefined,
        );
        expect(result.approvalEarliestDate).toBeUndefined();
      }
    },
  );
});

describe('review86-18 regressions', () => {
  const today = time.simulationDate;
  const employmentEntries = ['US-EMPLOYMENT', 'US-ADJUSTMENT'] as const;
  const expectStages = (
    request: UsFullRequest,
    status: 'MET' | 'NOT_MET' | 'UNKNOWN',
    approvalStatus = status,
  ) => {
    const result = path(request);
    expect(result).toMatchObject({ status, approvalStatus });
    expect(result.earliestDate).toBe(status === 'MET' ? today : undefined);
    expect(result.approvalEarliestDate).toBe(
      approvalStatus === 'MET' ? today : undefined,
    );
  };
  const ordinaryPerm = {
    category: 'eb3',
    perm: 'certified',
    permCertifiedOn: '2026-10-01',
    i140FiledOn: '2026-11-02',
  } as const;

  test.each([
    [
      'detailed costs only',
      {
        recruitmentAndFeesCompliant: undefined,
        permRecruitment: { employerPaidPermCosts: false },
      },
    ],
    [
      'noncompliant summary',
      {
        recruitmentAndFeesCompliant: false,
        permRecruitment: { employerPaidPermCosts: true },
      },
    ],
    [
      'noncompliant detail despite a cleared summary',
      { permRecruitment: { employerPaidPermCosts: false } },
    ],
    [
      'untimely notice',
      {
        permRecruitment: {
          laborCertificationFiledOn: '2026-10-01',
          notice: { method: 'union', notifiedOn: '2026-09-28' },
        },
      },
    ],
  ] satisfies [string, Partial<UsEmploymentAnswers>][])(
    'DOL certification preserves reported %s',
    (_, conflict) => {
      for (const pathway of employmentEntries) {
        const request = {
          ...withEmployment({ ...ordinaryPerm, ...conflict }, 'pending'),
          pathway,
        };
        expect(condition(request, 'C28-OFFER-PERM').status).toBe('NOT_MET');
        expectStages(request, 'NOT_MET');
      }
    },
  );

  test('I-130 approval preserves reported family history and petition bars', () => {
    for (const pathway of ['US-FAMILY', 'US-ADJUSTMENT'] as const) {
      const spouse = {
        ...f,
        pathway,
        family: { ...family, priorMarriageFraud: true },
      };
      expect(condition(spouse, 'C24-PETITION-BARS').status).toBe('NOT_MET');
      expectStages(spouse, 'NOT_MET');
      const stepchild: UsFullRequest = {
        ...f,
        pathway,
        family: {
          ...family,
          relationship: 'unmarried-child',
          childRelationship: 'step',
          relationshipEstablishedAtAge: 19,
        },
      };
      expect(condition(stepchild, 'C23-RELATIONSHIP').status).toBe('NOT_MET');
      expectStages(stepchild, 'NOT_MET');
    }
  });

  const approvedEmployerConflicts = [
    [
      'EB-1B classification',
      { category: 'eb1b', categoryQualifications: 'barred' },
    ],
    [
      'EB-1C classification',
      { category: 'eb1c', categoryQualifications: 'barred' },
    ],
    [
      'EB-2 PERM wage',
      { ...ordinaryPerm, category: 'eb2-perm', prevailingWageUsd: 61000 },
    ],
    [
      'EB-3 PERM costs',
      {
        ...ordinaryPerm,
        recruitmentAndFeesCompliant: undefined,
        permRecruitment: { employerPaidPermCosts: false },
      },
    ],
    [
      'Schedule A costs',
      {
        ...ordinaryPerm,
        perm: 'schedule-a',
        permRecruitment: { employerPaidPermCosts: false },
      },
    ],
    [
      'Schedule A notice window',
      {
        ...ordinaryPerm,
        perm: 'schedule-a',
        permRecruitment: {
          notice: { method: 'union', notifiedOn: '2026-10-31' },
        },
      },
    ],
  ] satisfies [string, Partial<UsEmploymentAnswers>][];
  test.each(approvedEmployerConflicts)(
    'approved I-140 preserves the reported %s conflict',
    (_, conflict) => {
      for (const pathway of employmentEntries) {
        const request = { ...withEmployment(conflict, 'approved'), pathway };
        expect(condition(request, 'C28-OFFER-PERM')).toMatchObject({
          status: 'NOT_MET',
          filingStatus: 'NOT_MET',
        });
        expectStages(request, 'NOT_MET');
      }
    },
  );

  test('a case-specific review of PERM validity leaves both stages unresolved', () => {
    for (const pathway of employmentEntries) {
      for (const petition of ['pending', 'approved'] as const) {
        const request = {
          ...withEmployment(
            { ...ordinaryPerm, permCertificationValidity: 'pending' },
            petition,
          ),
          pathway,
        };
        expect(condition(request, 'C28-OFFER-PERM')).toMatchObject({
          status: 'UNKNOWN',
          pendingDetails: ['PD-277'],
        });
        expectStages(request, 'UNKNOWN');
      }
    }
  });

  test.each([
    [
      'EB-1A insufficient initial evidence',
      { ...eb1a.employment, extraordinaryEvidenceCount: 2 },
      'C30-SELF-PETITION-EVIDENCE',
    ],
    [
      'EB-1A adverse final merits',
      { ...eb1a.employment, extraordinaryFinalMerits: 'barred' },
      'C30-SELF-PETITION-MERITS',
    ],
    [
      'NIW adverse individual prong',
      {
        category: 'eb2-niw',
        continuesWorkInField: true,
        niwProngs: { nationalImportance: false },
      },
      'C30-SELF-PETITION-MERITS',
    ],
  ] satisfies [string, Partial<UsEmploymentAnswers>, string][])(
    '%s survives petition approval',
    (_, conflict, id) => {
      for (const pathway of employmentEntries) {
        const request = { ...withEmployment(conflict, 'approved'), pathway };
        expect(condition(request, id).status).toBe('NOT_MET');
        expectStages(request, 'NOT_MET');
      }
    },
  );

  test.each([false, true])(
    'EB-5 approval preserves adverse project and capital evidence (regional center %s)',
    (regionalCenter) => {
      const investment = {
        ...eb5.employment!.investment,
        regionalCenter,
        projectFiled: regionalCenter,
      };
      for (const pathway of employmentEntries) {
        for (const [details, id] of [
          [{ lawfullySourcedFunds: 'barred' }, 'C31-INVESTMENT-PROJECT'],
          [{ capitalUsd: 1 }, 'C31-INVESTMENT-AMOUNT'],
          [
            { qualifyingJobs: 0, jobCreationPlan: 'none' },
            'C31-INVESTMENT-JOBS',
          ],
        ] as const) {
          const request: UsFullRequest = {
            ...eb5,
            pathway,
            employment: {
              ...eb5.employment,
              investment: { ...investment, ...details },
            },
            admission: { ...eb5.admission, petitionFiledOn: '2026-05-27' },
          };
          expect(condition(request, id).status).toBe('NOT_MET');
          expectStages(request, 'NOT_MET');
        }
      }
    },
  );

  test.each([
    ['vawa', 'US-FAMILY'],
    ['sij', 'US-EMPLOYMENT'],
  ] as const)(
    'approved I-360 retains an adverse %s basis finding',
    (adjustmentBasis, dedicated) => {
      for (const pathway of [dedicated, 'US-ADJUSTMENT'] as const) {
        const request: UsFullRequest = {
          ...time,
          pathway,
          fees: f.fees,
          admission: {
            ...admission,
            adjustmentBasis,
            qualifyingBasis: 'barred',
          },
        };
        expect(condition(request, 'C33-VISA-AND-ENTRY')).toMatchObject({
          status: 'NOT_MET',
          filingStatus: 'NOT_MET',
        });
        expectStages(request, 'NOT_MET');
      }
    },
  );

  test.each([
    [{ fundsAndWire: 'barred' }, 'C32-GOLD-PROCESS'],
    [{ processingFundsUsd: 1 }, 'C32-GOLD-GIFT'],
  ] as const)(
    'I-140G approval preserves adverse evidence about %s',
    (conflict, id) => {
      for (const pathway of employmentEntries) {
        const request: UsFullRequest = {
          ...gold,
          pathway,
          employment: {
            ...gold.employment,
            gold: { ...gold.employment?.gold, ...conflict },
          },
          admission: {
            ...gold.admission,
            adjustmentBasis: 'employment',
            petitionStatus: 'approved',
          },
        };
        expect(condition(request, id).status).toBe('NOT_MET');
        expectStages(request, 'NOT_MET');
      }
    },
  );

  test.each(employmentEntries)(
    'only the principal with an approved employer petition needs Supplement J with the initial packet in %s',
    (pathway) => {
      for (const [included, status] of [
        [false, 'NOT_MET'],
        [undefined, 'UNKNOWN'],
        [true, 'MET'],
      ] as const) {
        const request = {
          ...withEmployment(
            { ...ordinaryPerm, initialSupplementJIncluded: included },
            'approved',
          ),
          pathway,
        };
        expect(condition(request, 'C28-OFFER-PERM').status).toBe('MET');
        expect(condition(request, 'I485-INITIAL-SUPPLEMENT-J').status).toBe(
          status,
        );
        expectStages(request, status);
      }
      for (const petitionStatus of [
        'pending',
        'filed-with-i485',
        'approved',
      ] as const) {
        const request: UsFullRequest = {
          ...withEmployment(
            { ...ordinaryPerm, initialSupplementJIncluded: false },
            petitionStatus,
          ),
          pathway,
        };
        if (petitionStatus === 'filed-with-i485')
          request.employment!.i140FiledOn = undefined;
        if (petitionStatus === 'approved')
          request.admission!.i485ApplicantRole = 'derivative';
        expect(
          path(request).checks.some(
            (item) => item.id === 'US-I485-INITIAL-SUPPLEMENT-J',
          ),
        ).toBe(false);
        expectStages(
          request,
          'MET',
          petitionStatus === 'approved' ? 'MET' : 'UNKNOWN',
        );
      }
    },
  );

  test.each(employmentEntries)(
    'C33 keeps the original filing month when current visa charts retrogress in %s',
    (pathway) => {
      const approved = withEmployment(
        {
          ...ordinaryPerm,
          i140FiledOn: '2026-05-27',
          permCertifiedOn: '2026-05-01',
          employmentOffer: false,
          initialSupplementJIncluded: undefined,
          jobPortability: {
            i485PendingSince: '2026-05-27',
            originalOfferValidAtFiling: true,
            newOffer: true,
            sameOrSimilarOccupation: 'cleared',
            supplementJFiledOn: today,
          },
        },
        'approved',
      );
      for (const [history, finalAction, filingStatus, status] of [
        ['available', 'unavailable', 'MET', 'NOT_MET'],
        ['available', 'available', 'MET', 'MET'],
        ['unavailable', 'available', 'NOT_MET', 'NOT_MET'],
        [undefined, 'available', 'UNKNOWN', 'UNKNOWN'],
      ] as const) {
        const request: UsFullRequest = {
          ...approved,
          pathway,
          admission: {
            ...approved.admission,
            visaAtFiling: 'unavailable',
            visaAtFilingByMonth: { '2026-05': history },
            visaAtDecision: finalAction,
          },
        };
        expect(condition(request, 'C28-OFFER-PERM')).toMatchObject({
          status: 'MET',
          filingStatus: 'MET',
        });
        expect(condition(request, 'C33-VISA-AND-ENTRY')).toMatchObject({
          filingStatus,
          status,
        });
        expectStages(request, filingStatus, status);
      }
    },
  );

  test('an actual I-485 receipt month also applies without a portability request', () => {
    const approved = withEmployment(
      {
        ...ordinaryPerm,
        i140FiledOn: '2026-10-19',
        initialSupplementJIncluded: undefined,
      },
      'approved',
    );
    for (const pathway of employmentEntries) {
      const request: UsFullRequest = {
        ...approved,
        pathway,
        admission: {
          ...approved.admission,
          i485FiledOn: '2026-10-23',
          visaAtFiling: 'unavailable',
          visaAtFilingByMonth: { '2026-10': 'available' },
          visaAtDecision: 'unavailable',
        },
      };
      expectStages(request, 'MET', 'NOT_MET');
      expect(
        path(request).checks.some(
          (item) => item.id === 'US-I485-INITIAL-SUPPLEMENT-J',
        ),
      ).toBe(false);
    }
  });

  test('a pending I-485 does not roll the current decision into the next paper receipt month', () => {
    const request: UsFullRequest = {
      ...withEmployment(
        {
          ...ordinaryPerm,
          i140FiledOn: '2026-10-19',
          initialSupplementJIncluded: undefined,
        },
        'approved',
      ),
      simulationDate: '2026-10-31',
      admission: {
        ...e.admission,
        i485FiledOn: '2026-10-23',
        visaAtFiling: 'available',
        visaAtDecision: 'available',
        visaAtDecisionByMonth: { '2026-11': 'unavailable' },
      },
    };
    for (const pathway of employmentEntries) {
      expect(path({ ...request, pathway })).toMatchObject({
        status: 'MET',
        approvalStatus: 'MET',
        earliestDate: '2026-10-31',
        approvalEarliestDate: '2026-10-31',
      });
    }
  });
});

describe('review86-19 regressions', () => {
  const entries = ['US-EMPLOYMENT', 'US-ADJUSTMENT'] as const;

  test('checks non-early district residence at the candidate N-400 receipt', () => {
    const input = { ...n, stateResidenceFrom: '2026-08-24' };
    expect(condition(input, 'C14-DISTRICT')).toMatchObject({
      status: 'MET',
      filingStatus: 'MET',
    });
    expect(path(input)).toMatchObject({
      status: 'FUTURE',
      earliestDate: '2026-11-24',
      approvalStatus: 'FUTURE',
      approvalEarliestDate: '2026-11-24',
    });
  });

  test('requires the receipt to identify the investment threshold for a pending EB-5 petition', () => {
    const pending = pendingPetition(eb5);
    expect(condition(pending, 'C31-INVESTMENT-AMOUNT')).toMatchObject({
      status: 'UNKNOWN',
      pendingDetails: ['PD-264'],
    });
    expect(
      condition(
        {
          ...pending,
          admission: { ...pending.admission, petitionFiledOn: '2026-11-02' },
        },
        'C31-INVESTMENT-AMOUNT',
      ).status,
    ).toBe('MET');
  });

  test('does not substitute present humanitarian presence for presence at an earlier decision', () => {
    const input: UsFullRequest = {
      ...h,
      humanitarian: { ...human, presenceDays: 365 },
      admission: {
        ...h.admission,
        i485FiledOn: '2026-10-01',
        decisionOn: '2026-11-01',
      },
    };
    expect(condition(input, 'C41-HUMANITARIAN-PRESENCE')).toMatchObject({
      status: 'UNKNOWN',
      filingStatus: 'NOT_APPLICABLE',
    });
    expect(path(input)).toMatchObject({
      status: 'MET',
      approvalStatus: 'UNKNOWN',
    });
    expect(path(input).approvalEarliestDate).toBeUndefined();
  });

  test.each(entries)(
    'requires the employment subtype before checking initial Supplement J in %s',
    (pathway) => {
      const input: UsFullRequest = {
        ...e,
        pathway,
        employment: {
          ...e.employment,
          category: undefined,
          initialSupplementJIncluded: false,
        },
      };
      expect(condition(input, 'EMPLOYMENT-CATEGORY')).toMatchObject({
        status: 'UNKNOWN',
        pendingDetails: ['PD-277'],
      });
      expect(path(input)).toMatchObject({
        status: 'UNKNOWN',
        approvalStatus: 'UNKNOWN',
      });
      expect(path(input).earliestDate).toBeUndefined();
      expect(path(input).approvalEarliestDate).toBeUndefined();
      expect(
        path(input).checks.some(
          ({ id }) => id === 'US-I485-INITIAL-SUPPLEMENT-J',
        ),
      ).toBe(false);
    },
  );

  test.each(entries)(
    'uses the historical I-485 receipt for medical evidence in %s',
    (pathway) => {
      const worker = withEmployment(
        {
          category: 'eb3',
          permCertifiedOn: '2024-09-01',
          i140FiledOn: '2024-10-01',
        },
        'approved',
      );
      const input: UsFullRequest = {
        ...worker,
        pathway,
        simulationDate: '2024-12-03',
        admission: {
          ...worker.admission,
          i485FiledOn: '2024-11-29',
          visaAtFilingByMonth: { '2024-11': 'available' },
          medicalEvidence: 'pending',
        },
      };
      expect(condition(input, 'C33-VISA-AND-ENTRY')).toMatchObject({
        status: 'MET',
        filingStatus: 'MET',
      });
      expect(condition(input, 'C36-HEALTH')).toMatchObject({
        status: 'UNKNOWN',
        filingStatus: 'MET',
        pendingDetails: ['PD-275'],
      });
      expect(path(input)).toMatchObject({
        status: 'MET',
        earliestDate: input.simulationDate,
        approvalStatus: 'UNKNOWN',
      });
      expect(path(input).approvalEarliestDate).toBeUndefined();
      const postCutoff = {
        ...input,
        admission: { ...input.admission, i485FiledOn: '2024-12-02' },
      };
      expect(condition(postCutoff, 'C36-HEALTH').filingStatus).toBe('UNKNOWN');
      expect(path(postCutoff).status).toBe('UNKNOWN');
      expect(path(postCutoff).earliestDate).toBeUndefined();
    },
  );

  test.each(entries)(
    'applies the self-petitioner intent requirement while NIW is pending in %s',
    (pathway) => {
      const niw = withEmployment(
        {
          category: 'eb2-niw',
          i140SelfPetition: true,
          i140FiledOn: '2026-11-02',
          degree: 'advanced',
          niwProngs: {
            nationalImportance: true,
            wellPositioned: true,
            waiverBeneficial: true,
          },
          niwDetermination: 'pending',
        },
        'pending',
      );
      for (const [continuesWorkInField, status, approvalStatus] of [
        [false, 'NOT_MET', 'NOT_MET'],
        [undefined, 'MET', 'UNKNOWN'],
        [true, 'MET', 'UNKNOWN'],
      ] as const) {
        const input: UsFullRequest = {
          ...niw,
          pathway,
          employment: { ...niw.employment, continuesWorkInField },
          admission: { ...niw.admission, qualifyingBasis: 'pending' },
        };
        expect(condition(input, 'C30-SELF-PETITION-MERITS')).toMatchObject({
          status: approvalStatus,
          filingStatus: status,
        });
        expect(path(input)).toMatchObject({ status, approvalStatus });
        expect(path(input).earliestDate).toBe(
          continuesWorkInField === false ? undefined : input.simulationDate,
        );
        expect(path(input).approvalEarliestDate).toBeUndefined();
      }
    },
  );

  test.each(entries)(
    'uses the adjudication date for job portability in %s',
    (pathway) => {
      const worker = withEmployment(
        {
          category: 'eb3',
          i140FiledOn: '2026-05-27',
          permCertifiedOn: '2026-05-01',
          employmentOffer: false,
          wageYears: undefined,
          abilityToPayTotality: undefined,
          officerStatementAccepted: undefined,
          jobPortability: {
            i485PendingSince: '2026-05-27',
            originalOfferValidAtFiling: true,
            newOffer: true,
            sameOrSimilarOccupation: 'cleared',
            supplementJFiledOn: '2026-11-23',
          },
        },
        'approved',
      );
      for (const [decisionOn, supplementJFiledOn, approvalStatus] of [
        ['2026-06-05', '2026-11-23', 'NOT_MET'],
        ['2026-11-23', '2026-11-24', 'NOT_MET'],
        ['2026-11-23', '2026-11-23', 'MET'],
      ] as const) {
        const input: UsFullRequest = {
          ...worker,
          pathway,
          employment: {
            ...worker.employment,
            jobPortability: {
              ...worker.employment!.jobPortability,
              supplementJFiledOn,
            },
          },
          admission: {
            ...worker.admission,
            decisionOn,
            visaAtFilingByMonth: { '2026-05': 'available' },
            visaAtDecisionByMonth: { '2026-06': 'available' },
          },
        };
        expect(condition(input, 'C28-OFFER-PERM')).toMatchObject({
          status: approvalStatus,
          filingStatus: 'MET',
        });
        expect(condition(input, 'C33-VISA-AND-ENTRY').status).toBe('MET');
        expect(path(input)).toMatchObject({
          status: 'MET',
          earliestDate: input.simulationDate,
          approvalStatus,
        });
        expect(path(input).approvalEarliestDate).toBe(
          approvalStatus === 'MET' ? decisionOn : undefined,
        );
      }
    },
  );
});

describe('review86-20 regressions', () => {
  const familyEntries = ['US-FAMILY', 'US-ADJUSTMENT'] as const;
  const employmentEntries = ['US-EMPLOYMENT', 'US-ADJUSTMENT'] as const;
  const filedFamily = {
    ...f,
    support: { ...support, sponsorAge: 30 },
    admission: {
      ...admission,
      i485FiledOn: '2026-08-03',
      decisionOn: '2026-11-23',
    },
  } satisfies UsFullRequest;
  const originalMedical = {
    medicalEvidence: 'cleared',
    i693SignedOn: '2026-07-31',
    i693LinkedToAnotherClosedCase: false,
  } as const;
  const supplementalMedical = {
    ...originalMedical,
    i693SignedOn: '2026-11-16',
  } as const;

  test.each([
    ['late version only', supplementalMedical, 'UNKNOWN', 'UNKNOWN'],
    [
      'legacy supplemental with explicit original',
      { ...supplementalMedical, i693AtFiling: originalMedical },
      'MET',
      'MET',
    ],
    [
      'explicit supplemental with legacy original',
      { ...originalMedical, i693AtDecision: supplementalMedical },
      'MET',
      'MET',
    ],
    [
      'historical decision predates the legacy supplemental report',
      {
        ...supplementalMedical,
        i693AtFiling: originalMedical,
        decisionOn: '2026-10-01',
      },
      'MET',
      'MET',
    ],
    [
      'supplemental evidence barred',
      {
        i693AtFiling: originalMedical,
        i693AtDecision: { ...supplementalMedical, medicalEvidence: 'barred' },
      },
      'MET',
      'NOT_MET',
    ],
    [
      'original evidence pending',
      {
        i693AtFiling: { medicalEvidence: 'pending' },
        i693AtDecision: supplementalMedical,
      },
      'UNKNOWN',
      'UNKNOWN',
    ],
    [
      'original evidence explicitly barred',
      {
        i693AtFiling: { ...originalMedical, medicalEvidence: 'barred' },
        i693AtDecision: supplementalMedical,
      },
      'NOT_MET',
      'NOT_MET',
    ],
  ] as const)(
    'checks I-693 by version (%s)',
    (_, medical, filing, approval) => {
      for (const pathway of familyEntries) {
        const request = {
          ...filedFamily,
          pathway,
          admission: { ...filedFamily.admission, ...medical },
        };
        expect(condition(request, 'C36-HEALTH')).toMatchObject({
          filingStatus: filing,
          status: approval,
        });
        const result = path(request);
        expect(result).toMatchObject({
          status: filing,
          approvalStatus: approval,
        });
        expect(result.earliestDate).toBe(
          filing === 'MET' ? time.simulationDate : undefined,
        );
        expect(result.approvalEarliestDate).toBe(
          approval === 'MET' ? request.admission.decisionOn : undefined,
        );
      }
    },
  );

  test.each(familyEntries)(
    'checks channels and fees only before I-485 receipt (%s)',
    (pathway) => {
      for (const fees of [
        undefined,
        {
          channel: 'online',
          onlineCategoryAvailable: 'barred',
          adjustmentSupplementA: true,
        },
      ] as const) {
        const filed = path({ ...filedFamily, pathway, fees });
        expect(filed).toMatchObject({
          status: 'MET',
          approvalStatus: 'MET',
          earliestDate: time.simulationDate,
          approvalEarliestDate: filedFamily.admission.decisionOn,
        });
        expect(
          filed.checks.some(({ id }) =>
            [
              'US-FILING-CHANNEL',
              'US-TIME-PAPER-RECEIPT',
              'US-TIME-I485-PRESENCE',
              'US-C44-I485',
              'US-C44-I485A',
              'US-C45-FEE-RELIEF',
            ].includes(id),
          ),
        ).toBe(false);

        const planned = path({
          ...filedFamily,
          pathway,
          fees,
          admission: { ...filedFamily.admission, i485FiledOn: undefined },
        });
        const expected = fees ? 'NOT_MET' : 'UNKNOWN';
        expect(
          planned.checks.find(({ id }) => id === 'US-FILING-CHANNEL')?.status,
        ).toBe(expected);
        expect(planned).toMatchObject({
          status: expected,
          approvalStatus: expected,
        });
      }
    },
  );

  test.each([
    ['incomplete period', false, employment.wageYears, 'UNKNOWN'],
    ['unconfirmed period', undefined, employment.wageYears, 'UNKNOWN'],
    [
      'incomplete year',
      true,
      [{ paidUsd: 50000, netIncomeUsd: 9999 }],
      'UNKNOWN',
    ],
    [
      'wages missing',
      true,
      [{ netIncomeUsd: 9999, netCurrentAssetsUsd: 0 }],
      'UNKNOWN',
    ],
    [
      'financial records independently sufficient',
      true,
      [{ netIncomeUsd: 60000 }],
      'MET',
    ],
    ['complete records', true, employment.wageYears, 'MET'],
    [
      'documented shortfall in a year',
      false,
      [{ paidUsd: 50000, netIncomeUsd: 9999, netCurrentAssetsUsd: 0 }],
      'NOT_MET',
    ],
  ] as const)(
    'checks ability to pay with %s through both entries',
    (_, wagePeriodComplete, wageYears, expected) => {
      for (const pathway of employmentEntries) {
        const request: UsFullRequest = {
          ...e,
          pathway,
          employment: {
            ...e.employment,
            wagePeriodComplete,
            wageYears: wageYears ? [...wageYears] : undefined,
          },
        };
        expect(condition(request, 'C29-ABILITY-TO-PAY').status).toBe(expected);
        const result = path(request);
        expect(result).toMatchObject({
          status: expected,
          approvalStatus: expected,
        });
        if (expected === 'UNKNOWN')
          expect(result.pendingDetails).toContain('PD-277');
      }
    },
  );

  const originalPetition = {
    adjustmentBasis: 'employment',
    filedOn: '2026-05-01',
    qualifyingBasisAtFiling: 'cleared',
    visaAtFiling: 'available',
  } as const;
  const grantedTransfer = {
    originalPetition,
    approvedOn: '2026-08-03',
  } as const;
  const filedWorker = {
    ...e,
    admission: {
      ...e.admission,
      i485FiledOn: '2026-05-27',
      visaAtFilingByMonth: { '2026-05': 'available' },
      decisionOn: '2026-11-23',
    },
  } satisfies UsFullRequest;

  test.each([
    ['without confirmed transfer', {}, 'UNKNOWN', 'UNKNOWN'],
    ['granted transfer', { i485BasisTransfer: grantedTransfer }, 'MET', 'MET'],
    [
      'original immediate relative and different replacement filing chart',
      {
        i485BasisTransfer: {
          ...grantedTransfer,
          originalPetition: {
            ...originalPetition,
            adjustmentBasis: 'immediate-relative',
            visaAtFiling: undefined,
          },
        },
        visaAtFilingByMonth: { '2026-05': 'unavailable' },
      },
      'MET',
      'MET',
    ],
    [
      'missing original petition',
      {
        i485BasisTransfer: { ...grantedTransfer, originalPetition: undefined },
      },
      'UNKNOWN',
      'UNKNOWN',
    ],
    [
      'original visa unavailable',
      {
        i485BasisTransfer: {
          ...grantedTransfer,
          originalPetition: {
            ...originalPetition,
            visaAtFiling: 'unavailable',
          },
        },
      },
      'NOT_MET',
      'NOT_MET',
    ],
    [
      'replacement visa unavailable',
      { i485BasisTransfer: grantedTransfer, visaAtDecision: 'unavailable' },
      'MET',
      'NOT_MET',
    ],
    [
      'replacement petition pending',
      { i485BasisTransfer: grantedTransfer, petitionStatus: 'pending' },
      'MET',
      'UNKNOWN',
    ],
    [
      'approval before transfer',
      {
        i485BasisTransfer: grantedTransfer,
        decisionOn: '2026-07-15',
        visaAtDecisionByMonth: { '2026-07': 'unavailable' },
      },
      'MET',
      'UNKNOWN',
    ],
    [
      'transfer not yet confirmed',
      { i485BasisTransfer: { originalPetition } },
      'MET',
      'UNKNOWN',
    ],
  ] as const)(
    'uses the petition for the relevant C33 stage (%s)',
    (_, facts, filing, approval) => {
      for (const pathway of employmentEntries) {
        const request = {
          ...filedWorker,
          pathway,
          admission: { ...filedWorker.admission, ...facts },
        };
        expect(condition(request, 'C33-VISA-AND-ENTRY')).toMatchObject({
          filingStatus: filing,
          status: approval,
        });
        const result = path(request);
        expect(result).toMatchObject({
          status: filing,
          approvalStatus: approval,
        });
        expect(result.earliestDate).toBe(
          filing === 'MET' ? time.simulationDate : undefined,
        );
        expect(result.approvalEarliestDate).toBe(
          approval === 'MET' ? request.admission.decisionOn : undefined,
        );
      }
    },
  );

  test.each(employmentEntries)(
    'leaves C34 open when admission alone does not establish lawful status (%s)',
    (pathway) => {
      const request = {
        ...e,
        pathway,
        admission: { ...e.admission, lawfulAdmissionFor245k: false },
      };
      expect(condition(request, 'C34-ADJUSTMENT-BARS').status).toBe('UNKNOWN');
      expect(
        condition(
          {
            ...request,
            admission: {
              ...request.admission,
              lawfulNonimmigrantStatusAtFiling: false,
            },
          },
          'C34-ADJUSTMENT-BARS',
        ).status,
      ).toBe('NOT_MET');
    },
  );

  test.each(employmentEntries)(
    'requires the original offer in a pending portability case (%s)',
    (pathway) => {
      const request: UsFullRequest = {
        ...filedWorker,
        pathway,
        employment: {
          ...filedWorker.employment,
          jobPortability: { supplementJFiledOn: '2026-11-23', newOffer: true },
        },
      };
      expect(condition(request, 'C28-OFFER-PERM')).toMatchObject({
        status: 'UNKNOWN',
        filingStatus: 'UNKNOWN',
      });
    },
  );

  test('a late joint I-751 cutoff does not resolve an unreported filing basis', () => {
    const request: UsFullRequest = {
      ...conditions,
      permanentResident: '2024-11-23',
      fees: { channel: 'online' },
      conditions: {
        marriage: {
          ...marriage,
          filing: undefined,
          lateFilingExcuse: 'barred',
        },
      },
    };
    expect(condition(request, 'TIME-CONDITIONS-FILING').status).toBe('UNKNOWN');
    expect(path(request)).toMatchObject({
      status: 'UNKNOWN',
      approvalStatus: 'UNKNOWN',
    });
  });

  test('a received I-140G no longer needs a planned online channel', () => {
    const request: UsFullRequest = {
      ...gold,
      admission: {
        ...gold.admission,
        petitionStatus: 'pending',
        petitionFiledOn: '2026-07-01',
        nvcDs260: undefined,
      },
      fees: undefined,
    };
    expect(condition(request, 'C32-GOLD-PROCESS').status).toBe('MET');
    expect(
      condition(
        {
          ...request,
          admission: { ...request.admission, petitionFiledOn: undefined },
        },
        'C32-GOLD-PROCESS',
      ).status,
    ).toBe('UNKNOWN');
  });
});

describe('review86-21 regressions', () => {
  const originalMedical = {
    medicalEvidence: 'cleared',
    i693SignedOn: '2026-07-31',
    i693LinkedToAnotherClosedCase: false,
  } as const;
  const supplementalMedical = {
    ...originalMedical,
    i693SignedOn: '2026-11-16',
  } as const;
  const medicalReceipt = {
    ...admission,
    i485FiledOn: '2026-08-03',
    decisionOn: '2026-11-23',
  } as const;

  test.each([
    ['late signature only', supplementalMedical, 'UNKNOWN', 'UNKNOWN'],
    [
      'same case at both stages',
      { ...supplementalMedical, i693AtFiling: originalMedical },
      'MET',
      'MET',
    ],
    [
      'replacement tied to a different closed case',
      {
        i693AtFiling: originalMedical,
        i693AtDecision: {
          ...supplementalMedical,
          i693LinkedToAnotherClosedCase: true,
        },
      },
      'MET',
      'NOT_MET',
    ],
    [
      'original tied to a different closed case',
      {
        i693AtFiling: {
          ...originalMedical,
          i693LinkedToAnotherClosedCase: true,
        },
        i693AtDecision: supplementalMedical,
      },
      'NOT_MET',
      'NOT_MET',
    ],
    [
      'unknown linkage at adjudication',
      {
        i693AtFiling: originalMedical,
        i693AtDecision: {
          ...supplementalMedical,
          i693LinkedToAnotherClosedCase: undefined,
        },
      },
      'MET',
      'UNKNOWN',
    ],
  ] as const)(
    'checks partial refugee I-693 evidence by stage (%s)',
    (_, medical, filing, approval) => {
      const request = { ...h, admission: { ...medicalReceipt, ...medical } };
      expect(condition(request, 'C36-HEALTH')).toMatchObject({
        filingStatus: filing,
        status: approval,
      });
      const result = path(request);
      expect(result).toMatchObject({
        status: filing,
        approvalStatus: approval,
      });
      expect(result.earliestDate).toBe(
        filing === 'MET' ? time.simulationDate : undefined,
      );
      expect(result.approvalEarliestDate).toBe(
        approval === 'MET' ? medicalReceipt.decisionOn : undefined,
      );
      if (approval === 'UNKNOWN')
        expect(result.pendingDetails).toContain('PD-275');
    },
  );

  test.each([
    ['family', f],
    ['employment', e],
    ['asylee', { ...h, humanitarian: { ...human, status: 'asylee' } }],
    ['VAWA', withAdmission({ adjustmentBasis: 'vawa' })],
    ['SIJ', withAdmission({ adjustmentBasis: 'sij' })],
    ['other adjustment', withAdmission({ adjustmentBasis: '245i' })],
  ] as const)('uses the same I-693 stage checks for %s', (_, base) => {
    const request = {
      ...base,
      admission: {
        ...medicalReceipt,
        ...base.admission,
        ...supplementalMedical,
      },
    };
    expect(condition(request, 'C36-HEALTH')).toMatchObject({
      filingStatus: 'UNKNOWN',
      status: 'UNKNOWN',
    });
    expect(
      condition(
        {
          ...request,
          admission: { ...request.admission, i693AtFiling: originalMedical },
        },
        'C36-HEALTH',
      ),
    ).toMatchObject({ filingStatus: 'MET', status: 'MET' });
  });

  const originalPetition = {
    adjustmentBasis: 'employment',
    filedOn: '2026-05-01',
    qualifyingBasisAtFiling: 'cleared',
    visaAtFiling: 'available',
  } as const;
  const replacement = {
    ...e,
    admission: {
      ...e.admission,
      i485FiledOn: '2026-05-27',
      decisionOn: '2026-11-23',
      i485BasisTransfer: { originalPetition },
    },
  } satisfies UsFullRequest;

  test.each(['US-EMPLOYMENT', 'US-ADJUSTMENT'] as const)(
    'uses only replacement evidence for approval in %s',
    (pathway) => {
      for (const [adverseEvidence, check] of [
        [{ employmentOffer: false }, 'C28-OFFER-PERM'],
        [{ prevailingWageUsd: 60001 }, 'C28-OFFER-PERM'],
        [
          {
            wageYears: [
              { paidUsd: 50000, netIncomeUsd: 9999, netCurrentAssetsUsd: 0 },
            ],
          },
          'C29-ABILITY-TO-PAY',
        ],
      ] as const) {
        const request = {
          ...replacement,
          pathway,
          employment: {
            ...employment,
            i140FiledOn: '2026-07-01',
            ...adverseEvidence,
            wageYears:
              'wageYears' in adverseEvidence
                ? [...adverseEvidence.wageYears]
                : employment.wageYears,
          },
        };
        expect(condition(request, check)).toMatchObject({
          filingStatus: 'MET',
          status: 'NOT_MET',
        });
        expect(condition(request, 'C33-VISA-AND-ENTRY')).toMatchObject({
          filingStatus: 'MET',
          status: 'UNKNOWN',
        });
        const result = path(request);
        expect(result).toMatchObject({
          status: 'MET',
          earliestDate: time.simulationDate,
          approvalStatus: 'NOT_MET',
        });
        expect(result.approvalEarliestDate).toBeUndefined();
      }
    },
  );

  test.each([
    [{ employmentOfferAtFiling: false }, 'C28-OFFER-PERM', 'NOT_MET'],
    [{ abilityToPayAtFiling: 'pending' }, 'C29-ABILITY-TO-PAY', 'UNKNOWN'],
    [{ abilityToPayAtFiling: 'barred' }, 'C29-ABILITY-TO-PAY', 'NOT_MET'],
  ] as const)(
    'uses a specific original finding ahead of the aggregate (%s)',
    (finding, check, filing) => {
      const request = {
        ...replacement,
        admission: {
          ...replacement.admission,
          i485BasisTransfer: {
            approvedOn: '2026-08-03',
            originalPetition: { ...originalPetition, ...finding },
          },
        },
      };
      expect(condition(request, check)).toMatchObject({
        filingStatus: filing,
        status: 'MET',
      });
      expect(path(request)).toMatchObject({
        status: filing,
        approvalStatus: filing,
      });
    },
  );

  test('the replacement family petitioner and sponsor do not alter the original filing', () => {
    const request = {
      ...f,
      family: { ...family, relationshipValid: 'barred' },
      support: { ...support, affidavitSubmitted: false },
      admission: {
        ...replacement.admission,
        adjustmentBasis: 'immediate-relative',
      },
    } satisfies UsFullRequest;
    for (const check of ['C23-RELATIONSHIP', 'C26-SPONSOR']) {
      expect(condition(request, check)).toMatchObject({
        filingStatus: 'NOT_APPLICABLE',
        status: 'NOT_MET',
      });
    }
    expect(path(request)).toMatchObject({
      status: 'MET',
      approvalStatus: 'NOT_MET',
    });
  });

  test('judges adjustment bars at filing under the original classification', () => {
    const request = {
      ...replacement,
      admission: {
        ...replacement.admission,
        otherAdjustmentBar: 'vwp',
        i485BasisTransfer: {
          originalPetition: {
            ...originalPetition,
            adjustmentBasis: 'immediate-relative',
          },
        },
      },
    } satisfies UsFullRequest;
    expect(condition(request, 'C34-ADJUSTMENT-BARS')).toMatchObject({
      filingStatus: 'MET',
      status: 'NOT_MET',
    });
    expect(path(request)).toMatchObject({
      status: 'MET',
      approvalStatus: 'NOT_MET',
    });
  });

  test('does not count original I-485 pendency toward portability on a replacement I-140', () => {
    const request = {
      ...replacement,
      employment: {
        ...replacement.employment,
        employmentOffer: false,
        jobPortability: {
          originalOfferValidAtFiling: true,
          newOffer: true,
          sameOrSimilarOccupation: 'cleared',
          supplementJFiledOn: '2026-11-23',
        },
      },
      admission: {
        ...replacement.admission,
        i485BasisTransfer: { originalPetition, approvedOn: '2026-08-03' },
      },
    } satisfies UsFullRequest;
    expect(condition(request, 'C28-OFFER-PERM')).toMatchObject({
      filingStatus: 'MET',
      status: 'UNKNOWN',
    });
    expect(
      condition(
        {
          ...request,
          employment: {
            ...request.employment,
            jobPortability: {
              ...request.employment.jobPortability,
              i485PendingSince: '2026-07-02',
            },
          },
        },
        'C28-OFFER-PERM',
      ),
    ).toMatchObject({ filingStatus: 'MET', status: 'NOT_MET' });
  });
});

describe('review86-22 regressions', () => {
  const filed = {
    ...e,
    admission: {
      ...e.admission,
      i485FiledOn: '2026-08-03',
      decisionOn: '2026-11-23',
      lawfulNonimmigrantStatusAtFiling: true,
      visaAtFilingByMonth: { '2026-08': 'available' },
    },
  } satisfies UsFullRequest;
  const absence = { departed: '2026-09-01', returned: '2026-09-08' } as const;

  test.each([
    ['no departure', [], 'MET'],
    ['travel evidence not supplied', [absence], 'UNKNOWN'],
    [
      'travel authorization pending',
      [
        {
          ...absence,
          i485Travel: { route: 'advance-parole', evidence: 'pending' },
        },
      ],
      'UNKNOWN',
    ],
    [
      'applicable nonimmigrant exception',
      [
        {
          ...absence,
          i485Travel: { route: 'nonimmigrant', evidence: 'cleared' },
        },
      ],
      'MET',
    ],
    [
      'qualifying advance parole return',
      [
        {
          ...absence,
          i485Travel: { route: 'advance-parole', evidence: 'cleared' },
        },
      ],
      'MET',
    ],
    [
      'authorized TPS return',
      [{ ...absence, i485Travel: { route: 'tps', evidence: 'cleared' } }],
      'MET',
    ],
    [
      'no applicable exception',
      [{ ...absence, i485Travel: { route: 'none' } }],
      'NOT_MET',
    ],
    [
      'departure during removal proceedings',
      [
        {
          ...absence,
          i485Travel: {
            route: 'advance-parole',
            evidence: 'cleared',
            inRemovalProceedings: true,
          },
        },
      ],
      'NOT_MET',
    ],
    [
      'return after decision',
      [
        {
          departed: absence.departed,
          returned: '2026-11-24',
          i485Travel: { route: 'advance-parole', evidence: 'cleared' },
        },
      ],
      'UNKNOWN',
    ],
  ] as const)('checks pending I-485 travel: %s', (_, trips, approvalStatus) => {
    const request = { ...filed, trips: [...trips] };
    const result = path(request);
    expect(result).toMatchObject({ status: 'MET', approvalStatus });
    expect(result.approvalEarliestDate).toBe(
      approvalStatus === 'MET' ? '2026-11-23' : undefined,
    );
    if (trips.length) {
      expect(condition(request, 'I485-PENDING-TRAVEL')).toMatchObject({
        filingStatus: 'NOT_APPLICABLE',
        status: approvalStatus,
      });
    }
  });

  test('checks every pending trip and excludes trips outside the receipt-to-decision window', () => {
    const allowed = {
      ...absence,
      i485Travel: { route: 'nonimmigrant', evidence: 'cleared' },
    } as const;
    const request: UsFullRequest = {
      ...filed,
      trips: [
        { departed: '2026-07-01', returned: '2026-07-07' },
        allowed,
        {
          departed: '2026-11-24',
          returned: '2026-11-27',
          i485Travel: { route: 'none' },
        },
      ],
    };
    expect(path(request).approvalStatus).toBe('MET');
    expect(
      path({
        ...request,
        trips: [
          ...(request.trips ?? []),
          { departed: '2026-10-01', returned: '2026-10-08' },
        ],
      }).approvalStatus,
    ).toBe('UNKNOWN');
    expect(
      path({
        ...request,
        trips: [
          ...(request.trips ?? []),
          {
            departed: '2026-10-01',
            returned: '2026-10-08',
            i485Travel: { route: 'none' },
          },
        ],
      }).approvalStatus,
    ).toBe('NOT_MET');
  });

  test.each(['refugee', 'asylee'] as const)(
    'does not apply section 245 abandonment to a section 209 %s',
    (status) => {
      const request: UsFullRequest = {
        ...h,
        admission: { ...h.admission, i485FiledOn: '2026-08-03' },
        humanitarian: {
          ...human,
          status,
          refugeeDefinitionOrDerivative: true,
          firmlyResettled: false,
          discretion: 'cleared',
        },
        trips: [{ ...absence, i485Travel: { route: 'none' } }],
      };
      expect(path(request)).toMatchObject({
        status: 'MET',
        approvalStatus: 'UNKNOWN',
      });
      expect(
        path({
          ...request,
          trips: [
            {
              ...absence,
              i485Travel: {
                route: 'refugee-travel-document',
                evidence: 'cleared',
              },
            },
          ],
        }),
      ).toMatchObject({ status: 'MET', approvalStatus: 'MET' });
    },
  );

  test.each([
    ['US-FAMILY', f],
    ['US-ADJUSTMENT', p7],
    ['EB-1A', eb1a],
    ['EB-5', eb5],
    ['INA 209', h],
  ] as const)(
    'checks a dated change in the qualifying basis for %s only at approval',
    (_, fixture) => {
      const request: UsFullRequest = {
        ...fixture,
        ...(fixture.support
          ? { support: { ...fixture.support, sponsorAge: 25 } }
          : {}),
        admission: {
          ...fixture.admission,
          i485FiledOn: '2026-08-03',
          visaAtFilingByMonth: { '2026-08': 'available' },
          lawfulNonimmigrantStatusAtFiling: true,
          i485PendingEvents: [
            { on: '2026-07-31', kind: 'qualifying-basis', finding: 'barred' },
            { on: '2026-11-24', kind: 'qualifying-basis', finding: 'barred' },
          ],
        },
      };
      expect(path(request)).toMatchObject({
        status: 'MET',
        approvalStatus: 'MET',
      });
      const result = path({
        ...request,
        admission: {
          ...request.admission,
          i485PendingEvents: [
            { on: '2026-11-22', kind: 'qualifying-basis', finding: 'barred' },
          ],
        },
      });
      expect(result).toMatchObject({
        status: 'MET',
        approvalStatus: 'NOT_MET',
      });
      expect(result.approvalEarliestDate).toBeUndefined();
    },
  );

  test('distinguishes ordinary status expiration from unauthorized employment under INA 245(k)', () => {
    expect(
      path({
        ...filed,
        admission: {
          ...filed.admission,
          i485PendingEvents: [
            { on: '2026-09-08', kind: 'nonimmigrant-status-expiry' },
          ],
        },
      }),
    ).toMatchObject({ status: 'MET', approvalStatus: 'MET' });
    for (const [qualifyingViolationsDays, approvalStatus] of [
      [180, 'UNKNOWN'],
      [181, 'NOT_MET'],
      [undefined, 'UNKNOWN'],
    ] as const) {
      expect(
        path({
          ...filed,
          admission: {
            ...filed.admission,
            i485PendingEvents: [
              {
                on: '2026-09-08',
                kind: 'unauthorized-employment',
                qualifyingViolationsDays,
              },
            ],
          },
        }),
      ).toMatchObject({ status: 'MET', approvalStatus });
    }
    expect(
      path({
        ...f,
        support: { ...support, sponsorAge: 25 },
        admission: {
          ...f.admission,
          i485FiledOn: '2026-08-03',
          i485PendingEvents: [
            {
              on: '2026-09-08',
              kind: 'unauthorized-employment',
              qualifyingViolationsDays: 181,
            },
          ],
        },
      }),
    ).toMatchObject({ status: 'MET', approvalStatus: 'MET' });
  });

  const originalSij = {
    adjustmentBasis: 'sij',
    filedOn: '2026-07-15',
    qualifyingBasisAtFiling: 'cleared',
    visaAtFiling: 'available',
  } as const;

  test('keeps a pending procedural finding separate from filing and outside consular cases', () => {
    const request: UsFullRequest = {
      ...filed,
      admission: {
        ...filed.admission,
        i485PendingEvents: [{ on: '2026-09-08', kind: 'procedure' }],
      },
    };
    expect(path(request)).toMatchObject({
      status: 'MET',
      approvalStatus: 'UNKNOWN',
    });
    expect(
      condition(request, 'I485-PENDING-ELIGIBILITY').pendingDetails,
    ).toContain('PD-274');
    expect(
      path({
        ...request,
        admission: { ...request.admission, process: 'consular' },
      }).checks.some(({ id }) => id === 'US-I485-PENDING-ELIGIBILITY'),
    ).toBe(false);
  });

  test.each([undefined, '2026-10-01'] as const)(
    'applies the original SIJ exemption to filing when transfer approval is %s',
    (approvedOn) => {
      const request: UsFullRequest = {
        ...filed,
        admission: {
          ...filed.admission,
          falseCitizenship: true,
          falseCitizenshipException: false,
          i485BasisTransfer: { originalPetition: originalSij, approvedOn },
        },
      };
      expect(condition(request, 'C33-VISA-AND-ENTRY').filingStatus).toBe('MET');
      expect(condition(request, 'C40-IMMIGRATION-HISTORY')).toMatchObject({
        filingStatus: 'MET',
        status: 'NOT_MET',
      });
      expect(path(request)).toMatchObject({
        status: 'MET',
        approvalStatus: 'NOT_MET',
      });
      expect(path(request).approvalEarliestDate).toBeUndefined();
      const ineligible = {
        ...request,
        admission: { ...request.admission, unlawfulReentryBar: true },
      };
      expect(
        condition(ineligible, 'C40-IMMIGRATION-HISTORY').filingStatus,
      ).toBe('NOT_MET');
    },
  );

  test('does not grant the replacement SIJ exemption to the original employment filing', () => {
    const request: UsFullRequest = {
      ...filed,
      admission: {
        ...filed.admission,
        adjustmentBasis: 'sij',
        falseCitizenship: true,
        falseCitizenshipException: false,
        i485BasisTransfer: {
          approvedOn: '2026-10-01',
          originalPetition: { ...originalSij, adjustmentBasis: 'employment' },
        },
      },
    };
    expect(condition(request, 'C40-IMMIGRATION-HISTORY')).toMatchObject({
      filingStatus: 'NOT_MET',
      status: 'NOT_MET',
    });
    expect(path(request)).toMatchObject({
      status: 'NOT_MET',
      approvalStatus: 'NOT_MET',
    });
  });

  test('keeps a potentially exempt original ground unknown until the original basis is confirmed', () => {
    const request: UsFullRequest = {
      ...filed,
      admission: {
        ...filed.admission,
        falseCitizenship: true,
        falseCitizenshipException: false,
        i485BasisTransfer: {},
      },
    };
    expect(condition(request, 'C40-IMMIGRATION-HISTORY')).toMatchObject({
      filingStatus: 'UNKNOWN',
      status: 'NOT_MET',
    });
    expect(path(request)).toMatchObject({
      status: 'UNKNOWN',
      approvalStatus: 'NOT_MET',
    });
  });

  test('applies public charge only at decision and uses the replacement category', () => {
    const request: UsFullRequest = {
      ...filed,
      admission: {
        ...filed.admission,
        publicCharge: 'barred',
        i485BasisTransfer: {
          originalPetition: originalSij,
          approvedOn: '2026-10-01',
        },
      },
    };
    expect(condition(request, 'C37-PUBLIC-CHARGE')).toMatchObject({
      filingStatus: 'NOT_APPLICABLE',
      status: 'NOT_MET',
    });
    expect(path(request)).toMatchObject({
      status: 'MET',
      approvalStatus: 'NOT_MET',
    });
  });

  test('uses case-specific admissibility waivers only for their corresponding basis', () => {
    const request: UsFullRequest = {
      ...filed,
      admission: {
        ...filed.admission,
        classAHealth: 'barred',
        criminalOtherGround: 'barred',
        immigrationFraud: true,
        healthWaiver: 'barred',
        criminalWaiver: 'barred',
        immigrationWaiver: 'barred',
        i485BasisTransfer: {
          approvedOn: '2026-10-01',
          originalPetition: {
            ...originalSij,
            adjustmentBasis: 'immediate-relative',
            healthWaiverAtFiling: 'cleared',
            criminalWaiverAtFiling: 'cleared',
            immigrationWaiverAtFiling: 'cleared',
          },
        },
      },
    };
    for (const check of [
      'C36-HEALTH',
      'C38-CRIMINAL-INADMISSIBILITY',
      'C40-IMMIGRATION-HISTORY',
    ]) {
      expect(condition(request, check)).toMatchObject({
        filingStatus: 'MET',
        status: 'NOT_MET',
      });
    }
    expect(path(request)).toMatchObject({
      status: 'MET',
      approvalStatus: 'NOT_MET',
    });
  });
});

describe('review86-23 regressions', () => {
  const filed = {
    ...e,
    admission: {
      ...e.admission,
      i485FiledOn: '2026-08-03',
      decisionOn: '2026-11-23',
      lawfulNonimmigrantStatusAtFiling: true,
      visaAtFilingByMonth: { '2026-08': 'available' },
    },
  } satisfies UsFullRequest;

  test('distinguishes omitted travel history from explicit confirmation of no trips', () => {
    const omitted: UsFullRequest = { ...filed, trips: undefined };
    const result = path(omitted);
    expect(result).toMatchObject({ status: 'MET', approvalStatus: 'UNKNOWN' });
    expect(result.approvalEarliestDate).toBeUndefined();
    expect(condition(omitted, 'I485-PENDING-TRAVEL')).toMatchObject({
      filingStatus: 'NOT_APPLICABLE',
      status: 'UNKNOWN',
      pendingDetails: ['PD-274'],
    });
    expect(path({ ...filed, trips: [] })).toMatchObject({
      status: 'MET',
      approvalStatus: 'MET',
      approvalEarliestDate: '2026-11-23',
    });
  });

  test.each([
    ['before decision', '2026-11-22', 'NOT_MET'],
    ['on decision day', '2026-11-23', 'UNKNOWN'],
    ['after decision', '2026-11-24', 'MET'],
  ] as const)(
    'applies abandonment to a departure %s',
    (_, departed, approvalStatus) => {
      const result = path({
        ...filed,
        trips: [
          { departed, returned: '2026-11-30', i485Travel: { route: 'none' } },
        ],
      });
      expect(result).toMatchObject({ status: 'MET', approvalStatus });
      expect(result.approvalEarliestDate).toBe(
        approvalStatus === 'MET' ? '2026-11-23' : undefined,
      );
    },
  );

  test('requires the order of a departure and a historical receipt on the same day', () => {
    const request: UsFullRequest = {
      ...filed,
      trips: [
        {
          departed: '2026-08-03',
          returned: '2026-08-10',
          i485Travel: { route: 'none' },
        },
      ],
    };
    expect(path(request)).toMatchObject({
      status: 'UNKNOWN',
      approvalStatus: 'UNKNOWN',
    });
  });

  test.each([
    ['receipt', '2026-08-03', 'UNKNOWN'],
    ['decision', '2026-11-23', 'MET'],
  ] as const)(
    'keeps unknown ordering for a basis change on the %s date',
    (_, on, status) => {
      const result = path({
        ...filed,
        admission: {
          ...filed.admission,
          i485PendingEvents: [
            { on, kind: 'qualifying-basis', finding: 'barred' },
          ],
        },
      });
      expect(result).toMatchObject({ status, approvalStatus: 'UNKNOWN' });
      expect(result.approvalEarliestDate).toBeUndefined();
    },
  );

  test.each([
    ['event date only', undefined, 1, 'UNKNOWN'],
    ['coverage ends before decision', '2026-10-01', 180, 'UNKNOWN'],
    ['covered within the cap', '2026-11-23', 180, 'MET'],
    ['covered above the cap', '2026-11-23', 237, 'NOT_MET'],
  ] as const)(
    'uses the section 245(k) cumulative record %s',
    (_, through, total, approvalStatus) => {
      const request: UsFullRequest = {
        ...filed,
        employment: {
          ...filed.employment,
          permCertifiedOn: '2025-10-01',
          i140FiledOn: '2026-02-09',
        },
        admission: {
          ...filed.admission,
          lawfulAdmissionFor245k: true,
          i485FiledOn: '2026-03-02',
          visaAtFilingByMonth: { '2026-03': 'available' },
          i485PendingEvents: [
            {
              on: '2026-04-01',
              kind: 'unauthorized-employment',
              qualifyingViolationsDays: total,
              ...(through ? { qualifyingViolationsThrough: through } : {}),
            },
          ],
        },
      };
      expect(path(request)).toMatchObject({ status: 'MET', approvalStatus });
      expect(path(request).approvalEarliestDate).toBe(
        approvalStatus === 'MET' ? '2026-11-23' : undefined,
      );
      if (!through) {
        const withDecisionDayRecord: UsFullRequest = {
          ...request,
          admission: {
            ...request.admission,
            i485PendingEvents: [
              ...request.admission!.i485PendingEvents!,
              {
                on: '2026-11-23',
                kind: 'unauthorized-employment',
                qualifyingViolationsDays: 237,
              },
            ],
          },
        };
        expect(path(withDecisionDayRecord)).toMatchObject({
          status: 'MET',
          approvalStatus: 'NOT_MET',
        });
      }
    },
  );

  test.each([
    [undefined, 'UNKNOWN'],
    ['2026-12-15', 'MET'],
  ] as const)(
    'checks annual wage coverage through the adjudication date (%s)',
    (wagePeriodThrough, expected) => {
      const request: UsFullRequest = {
        ...filed,
        employment: { ...filed.employment, wagePeriodThrough },
        admission: {
          ...filed.admission,
          decisionOn: '2026-12-15',
          visaAtDecisionByMonth: { '2026-12': 'available' },
        },
      };
      expect(condition(request, 'C29-ABILITY-TO-PAY').status).toBe(expected);
      expect(path(request)).toMatchObject({
        status: 'MET',
        approvalStatus: expected === 'MET' ? 'FUTURE' : 'UNKNOWN',
      });
    },
  );

  test.each([
    [undefined, 364, 'UNKNOWN'],
    ['2026-12-01', 365, 'MET'],
    ['2026-12-01', 364, 'NOT_MET'],
  ] as const)(
    'bounds refugee presence at the stated decision (%s, %s)',
    (presenceThrough, presenceDays, expected) => {
      const request: UsFullRequest = {
        ...h,
        humanitarian: { ...human, presenceThrough, presenceDays },
        admission: { ...h.admission, decisionOn: '2026-12-01' },
      };
      expect(condition(request, 'C41-HUMANITARIAN-PRESENCE').status).toBe(
        expected,
      );
      expect(path(request).approvalStatus).toBe(
        expected === 'MET' ? 'FUTURE' : expected,
      );
    },
  );

  test.each([
    ['before original receipt', '2026-08-02', undefined, 'NOT_MET', 'NOT_MET'],
    ['on original receipt', '2026-08-03', undefined, 'UNKNOWN', 'NOT_MET'],
    ['after transfer', '2026-10-20', undefined, 'MET', 'NOT_MET'],
    ['on decision day', '2026-11-23', 'immigrationFraud', 'MET', 'UNKNOWN'],
    ['after decision', '2026-11-24', 'immigrationFraud', 'MET', 'MET'],
  ] as const)(
    'keeps a fraud event %s in the applicable stages',
    (_, on, ground, status, approvalStatus) => {
      const request: UsFullRequest = {
        ...filed,
        admission: {
          ...filed.admission,
          immigrationFraud: true,
          i485BasisTransfer: {
            approvedOn: '2026-10-01',
            originalPetition: {
              adjustmentBasis: 'immediate-relative',
              filedOn: '2026-07-15',
              qualifyingBasisAtFiling: 'cleared',
              visaAtFiling: 'available',
            },
          },
          i485PendingEvents: [
            { on, kind: 'admissibility', ground, finding: 'barred' },
          ],
        },
      };
      expect(condition(request, 'C40-IMMIGRATION-HISTORY')).toMatchObject({
        filingStatus: status,
        status: approvalStatus,
      });
      expect(path(request)).toMatchObject({ status, approvalStatus });
      expect(path(request).approvalEarliestDate).toBe(
        approvalStatus === 'MET' ? '2026-11-23' : undefined,
      );
    },
  );
});
