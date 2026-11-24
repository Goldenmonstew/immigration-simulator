import type { IsoDate } from '../types';
import type { UsRequest } from '../united-states';
import type {
  CountryCheck,
  CountryColumn,
  CountryPathway,
  CountryResult,
} from '../country-result';
import type { PilotStatus } from '../pilot';

export type UsFullPathwayId =
  | 'US-NATURALIZATION'
  | 'US-SPOUSE'
  | 'US-CONDITIONS'
  | 'US-TRAVEL'
  | 'US-FAMILY'
  | 'US-EMPLOYMENT'
  | 'US-ADJUSTMENT'
  | 'US-HUMANITARIAN'
  | 'US-MILITARY';

export interface UsFullCheck extends CountryCheck {
  /** False when the requirement does not apply to either stage. */
  applicable?: boolean;
  /** When omitted, use status for filing as well as approval. */
  filingStatus?: CountryCheck['status'] | 'NOT_APPLICABLE';
  /** Date a currently unmet approval timing requirement can be satisfied. */
  approvalRequirementDate?: IsoDate;
  informational?: true;
}

export interface UsFullPathway extends CountryPathway {
  id: UsFullPathwayId;
  /** Filing eligibility, or return eligibility for US-TRAVEL. */
  status: PilotStatus;
  /** Approval requirements as of the simulation date, based on the supplied facts. */
  approvalStatus?: PilotStatus;
  /** Earliest date the assessed requirements can be met, independent of processing time. */
  approvalEarliestDate?: IsoDate;
  checks: UsFullCheck[];
}

export interface UsFullResult extends CountryResult {
  columns: (Omit<CountryColumn, 'pathways'> & { pathways: UsFullPathway[] })[];
}

export type UsRegion = 'contiguous' | 'alaska' | 'hawaii';
/** A finding or legally qualified evidence. Use pending for facts still requiring substantiation. */
export type UsReview = 'cleared' | 'barred' | 'pending';

export interface UsHousehold {
  region?: UsRegion;
  /** Include all required people once, including sponsored immigrants for I-864. */
  size?: number;
  incomeUsd?: number;
}

export interface UsCrime {
  /** Already classified under U.S. immigration law. Counts include admissions for CIMT where the statute does. */
  unclassifiedRecord?: boolean;
  cimtCount?: number;
  cimtMaximumMonths?: number;
  cimtSentenceMonths?: number;
  cimtAgeAtOffense?: number;
  /** Later of commission and release for the juvenile exception. */
  cimtOffenseOrReleaseOn?: IsoDate;
  convictionCount?: number;
  combinedSentenceMonths?: number;
  /** Includes only qualifying confinement in the applicable GMC period. */
  confinementDays?: number;
  controlledSubstance?: 'none' | 'single-simple-cannabis' | 'other';
  cannabisGrams?: number;
  duiCount?: number;
}

export interface UsPartyMembership {
  membership?: 'none' | 'current' | 'former';
  endedOn?: IsoDate;
  ageEnded?: number;
  rulingParty?: boolean;
  exception?: 'involuntary' | 'unknowing' | 'law' | 'necessities' | 'none';
  functionary?: boolean;
  /** For INA 212(a)(3)(D)(iii), the applicant is free of security concerns. */
  noSecurityThreat?: boolean;
  waiver?: UsReview;
}

export interface UsNaturalizationAnswers {
  /** A missing or disputed admission record is pending. */
  lawfulAdmission?: UsReview;
  removalProcess?: 'none' | 'pending' | 'final';
  residenceThroughOath?: boolean;
  /** N-400 examination date, when known, for the early-filing district rule. */
  interviewOn?: IsoDate;
  /** True when conditions were removed; false for a pending petition with status maintained. */
  conditionalStatusResolved?: boolean;
  /** Total time living in the U.S. while an LPR, measured at N-400 filing. */
  lprResidenceYears?: number;
  english?: 'passed' | 'failed' | 'preparing';
  civics?: 'passed' | 'failed' | 'retest' | 'preparing';
  civicsCorrect?: number;
  disability?: {
    requested?: boolean;
    months?: number;
    illegalDrugCause?: boolean;
    clinicianCertified?: boolean;
    englishWaived?: UsReview;
    civicsWaived?: UsReview;
  };
  /** Assessment of the entire record through the oath, for this route's statutory period. */
  goodMoralCharacter?: UsReview;
  murderConviction?: boolean;
  aggravatedFelonyConvictedOn?: IsoDate | 'none' | 'unclassified';
  persecutionBar?: boolean;
  statutoryPeriodCrime?: UsCrime;
  otherGmcBar?: UsReview;
  duiPresumptionRebutted?: UsReview;
  falseOralTestimony?: boolean;
  benefitsAndSupport?:
    | 'clear'
    | 'fraud'
    | 'wilful-nonsupport'
    | 'intentional-reduced-work'
    | 'review';
  constitutionalAttachment?: boolean;
  party?: UsPartyMembership;
  selectiveService?:
    'not-required' | 'registered' | 'required-unregistered' | 'review';
  selectiveNonWillful?: UsReview;
  warDesertionOrAlienageExemption?: UsReview;
  oath?:
    'willing' | 'affirmation' | 'refuses' | 'modified' | 'disability-waiver';
  oathApproval?: UsReview;
  titlesRenounced?: boolean;
  /** Includes truthfulness and disclosure of material facts on the N-400. */
  truthfulApplication?: boolean;
  spouse?: {
    validMarriage?: boolean;
    livedTogetherRequiredPeriod?: UsReview;
    spouseCitizenRequiredPeriod?: boolean;
    /** Marriage and citizenship must continue to, or have continued through, the oath. */
    marriageAndCitizenshipThroughOath?: boolean;
  };
}

export interface UsConditionsAnswers {
  marriage?: {
    marriedOn?: IsoDate;
    bonaFide?: UsReview;
    improperConsideration?: boolean;
    filing?:
      'joint' | 'separate-child' | 'death' | 'divorce' | 'abuse' | 'hardship';
    spouseJoins?: boolean;
    finalRemovalOrder?: boolean;
    waiverBasis?: UsReview;
    interviewRequirement?: UsReview;
    lateFilingExcuse?: UsReview;
  };
  investor?: UsInvestmentAnswers & {
    originalPetitionFiledOn?: IsoDate;
    requiredCapitalFullyInvested?: UsReview;
    /** Pre-RIA evidence that the investment has been sustained during conditional residence to date. */
    continuousInvestmentDuringConditionalResidence?: UsReview;
    /** Job creation within a reasonable time, retention for a qualifying troubled business, or exceptional circumstances. */
    jobsAccepted?: UsReview;
    lateFilingExcuse?: UsReview;
  };
}

export interface UsInvestmentAnswers {
  project?: 'standard' | 'tea' | 'infrastructure';
  capitalUsd?: number;
  lawfullySourcedFunds?: UsReview;
  atRisk?: boolean;
  sustainmentYears?: number;
  qualifiesAsNewEnterprise?: boolean;
  qualifyingJobs?: number;
  minimumWeeklyHours?: number;
  regionalCenter?: boolean;
  projectFiled?: boolean;
  indirectJobsPct?: number;
  shortConstructionIndirectJobsPct?: number;
}

export interface UsTravelAnswers {
  registration?: 'registered' | 'unregistered' | 'diplomatic-child-review';
  carryingEvidence?: boolean;
  movedOn?: IsoDate | 'no-move';
  addressReportedOn?: IsoDate | 'not-reported';
  cardExpiresOn?: IsoDate;
  /** Loss, damage, legal name change, incorrect data or another I-90 replacement ground. */
  otherReplacementGround?: boolean;
  replacementFiledOn?: IsoDate | 'not-filed';
  replacementReason?: 'age-14' | 'renewal' | 'error-or-not-delivered';
  /** Covers the non-time triggers of INA 101(a)(13)(C), including criminal relief. */
  admissionTriggers?: 'none' | 'triggered' | 'unclassified';
  /** Assessed under INA 237, including address, status, criminal and national security grounds. */
  deportability?: UsReview;
  deportabilityFacts?: {
    /** Classified convictions and other grounds under INA 237. */
    unclassified?: boolean;
    singleCimt?: {
      admittedOn: IsoDate;
      committedOn: IsoDate;
      possibleSentenceMonths: number;
      sWitness?: boolean;
    };
    independentCimtCount?: number;
    aggravatedFelony?: boolean;
    controlledSubstance?: UsCrime['controlledSubstance'];
    cannabisGrams?: number;
    earlyMarriageTermination?: UsReview;
    otherGround?: UsReview;
  };
  returnDocument?:
    'green-card' | 'reentry-permit' | 'sb1' | 'continuous-journey' | 'none';
  documentValidAtReturn?: boolean;
  permitAppliedInUs?: boolean;
  permitIssuedOn?: IsoDate;
  permitExpiresOn?: IsoDate;
  /** Includes any applicable reduced validity and conditions on shorter permits. */
  permitRestrictedToOneYear?: boolean;
  permitBiometricsInUs?: boolean;
  abandonment?: UsReview;
  sb1OutsideControl?: UsReview;
  continuousJourneyStartedInTime?: boolean;
  /** Return-specific answers apply to the most recent trip by return date. */
  /** Required when that return triggers a new admission decision. */
  admission?: UsAdmissionAnswers;
  feeForm?: 'i90' | 'i131' | 'ds117' | 'i131a' | 'ar11' | 'g325r';
}

export interface UsFamilyAnswers {
  petitioner?: 'citizen' | 'lpr';
  relationship?:
    'spouse' | 'unmarried-child' | 'married-child' | 'parent' | 'sibling';
  petitionerAge?: number;
  beneficiaryAge?: number;
  childRelationship?: 'biological' | 'step' | 'adopted';
  relationshipEstablishedAtAge?: number;
  siblingAdoption?: boolean;
  custodyYears?: number;
  livedTogetherYears?: number;
  relationshipValid?: UsReview;
  /** CSPA age using the applicable visa chart and seek-to-acquire rule, if determined. */
  cspaAge?: number;
  priorMarriageLprSince?: IsoDate | 'not-applicable';
  priorMarriageException?: UsReview;
  marriageDuringRemoval?: boolean;
  removalMarriageException?: UsReview;
  livedAbroadAfterMarriageYears?: number;
  priorMarriageFraud?: boolean;
  adamWalsh?: UsReview;
}

export interface UsSupportAnswers {
  exemption?:
    'none' | 'quarters' | 'citizenship-on-admission' | 'widow' | 'vawa';
  qualifyingQuarters?: number;
  exemptionEvidence?: UsReview;
  sponsorAge?: number;
  relationshipToBeneficiary?:
    'spouse' | 'unmarried-child' | 'married-child' | 'other';
  sponsorStatus?: 'citizen' | 'national' | 'lpr' | 'other';
  beneficiaryAge?: number;
  domiciledInUs?: UsReview;
  affidavitSubmitted?: boolean;
  household?: UsHousehold;
  activeDuty?: boolean;
  /** Net qualifying assets, convertible to cash without undue harm within the permitted period. */
  qualifyingAssetsUsd?: number;
  orphanException?: boolean;
  /** An independently qualified joint sponsor, with their own sufficient household and affidavit. */
  jointSponsor?: UsReview;
}

export interface UsEmploymentAnswers {
  category?: 'eb2-perm' | 'eb3' | 'eb1a' | 'eb2-niw' | 'eb5' | 'gold-card';
  categoryQualifications?: UsReview;
  employmentOffer?: boolean;
  perm?: 'certified' | 'schedule-a' | 'pending' | 'none';
  permCertifiedOn?: IsoDate;
  /** Actual receipt date of the underlying I-140, on or before the simulation date. */
  i140FiledOn?: IsoDate;
  prevailingWageUsd?: number;
  profferedWageUsd?: number;
  recruitmentAndFeesCompliant?: boolean;
  permRecruitment?: {
    stateJobOrderDays?: number;
    advertisements?: number;
    mandatoryRecruitmentDaysBeforeFiling?: number[];
    noticeWorkdays?: number;
    professional?: boolean;
    extraDistinctSteps?: number;
    qualifiedAvailableUsWorker?: boolean;
    employerPaidPermCosts?: boolean;
  };
  employerEmployees?: number;
  employerNonprofit?: boolean;
  officerStatementAccepted?: UsReview;
  /** One entry for each covered year from the priority date. */
  wageYears?: {
    paidUsd: number;
    netIncomeUsd?: number;
    netCurrentAssetsUsd?: number;
  }[];
  wagePeriodComplete?: boolean;
  abilityToPayTotality?: UsReview;
  internationalAward?: boolean;
  extraordinaryEvidenceCount?: number;
  comparableEvidenceAccepted?: UsReview;
  extraordinaryFinalMerits?: UsReview;
  continuesWorkInField?: boolean;
  benefitsUnitedStates?: boolean;
  degree?: 'advanced' | 'bachelor' | 'other';
  progressiveExperienceYears?: number;
  exceptionalEvidenceCount?: number;
  niwProngs?: {
    nationalImportance?: boolean;
    wellPositioned?: boolean;
    waiverBeneficial?: boolean;
  };
  niwDetermination?: UsReview;
  investment?: UsInvestmentAnswers & {
    /** Total expected time at risk, including the period already completed. */
    expectedSustainmentYears?: number;
    /** Initial I-526/I-526E evidence of projected qualifying employment. */
    jobCreationPlan?:
      | 'none'
      | {
          evidence?: UsReview;
          qualifyingJobs?: number;
          minimumWeeklyHours?: number;
        };
  };
  gold?: {
    registrationAccepted?: boolean;
    donor?: 'individual' | 'company';
    giftUsd?: number;
    processingFundsUsd?: number;
    includedPeople?: number;
    fundsAndWire?: UsReview;
  };
  priorMarriageFraud?: boolean;
  relativePetitioner?: boolean;
  relativeOwnershipPct?: number;
}

type UsVisaAvailability = 'available' | 'unavailable' | 'future-bulletin';

export interface UsAdmissionAnswers {
  /** Bare prospective applications have no favourable discretionary finding yet. */
  process?: 'adjustment' | 'consular';
  /** USCIS filing chart for the simulation month, or NVC authorization to submit consular documents. */
  visaAtFiling?: UsVisaAvailability;
  /** Confirmed future opening date for NVC submission, when not yet authorized. */
  nvcFilingOpensOn?: IsoDate;
  /** CEAC submission of Form DS-260 for all visa applicants included in the case. */
  nvcDs260?: 'submitted' | 'not-submitted';
  /** Readiness of required civil documents for all applicants, after country-specific exceptions. */
  nvcCivilDocuments?: 'complete' | 'missing' | 'nonavailability-explained';
  /** USCIS filing chart by YYYY-MM; required for a receipt in a different month. */
  visaAtFilingByMonth?: Partial<Record<string, UsVisaAvailability>>;
  /** Final Action Dates status as of the simulation date. */
  visaAtDecision?: UsVisaAvailability;
  /** Final Action Dates by YYYY-MM, using the month of adjudication. */
  visaAtDecisionByMonth?: Partial<Record<string, UsVisaAvailability>>;
  /** Adjudication date to assess, after the interview for a consular case. */
  decisionOn?: IsoDate;
  qualifyingBasis?: UsReview;
  /** Status of the underlying petition, including an I-140 with an unknown receipt date. */
  petitionStatus?: 'filed-with-i485' | 'pending' | 'approved';
  legalEntry?: 'admitted' | 'paroled' | 'without-inspection';
  adjustmentBasis?:
    | 'immediate-relative'
    | 'family-preference'
    | 'employment'
    | 'vawa'
    | 'sij'
    | '245i'
    | 'other';
  entryException?: UsReview;
  otherAdjustmentBar?: 'none' | 'vwp' | 'barred' | 'review';
  qualifyingViolationsDays?: number;
  lawfulAdmissionFor245k?: boolean;
  discretion?: UsReview;
  classAHealth?: UsReview;
  vaccines?: UsReview;
  medicalEvidence?: UsReview;
  i693SignedOn?: IsoDate;
  i693LinkedToAnotherClosedCase?: boolean;
  healthWaiver?: UsReview;
  /** Confirmed exemption for the current application or admission, including any conditions at adjudication. */
  publicChargeExempt?: boolean;
  publicCharge?: UsReview;
  benefits?:
    | 'none'
    | 'pre-change-cash-or-institutional'
    | 'pre-change-other'
    | 'post-change-means-tested';
  crime?: UsCrime;
  criminalOtherGround?: UsReview;
  drugTraffickingBar?: boolean;
  criminalWaiver?: UsReview;
  securityGround?: 'clear' | 'nonwaivable' | 'other-bar' | 'pending';
  party?: UsPartyMembership;
  immigrationFraud?: boolean;
  falseCitizenship?: boolean;
  falseCitizenshipException?: boolean;
  unlawfulDeparture?:
    | {
        leftOn: IsoDate;
        qualifyingDays: number;
        /** Required for the shorter bar. */
        voluntaryBeforeProceedings?: boolean;
      }
    | 'none';
  unlawfulReentryBar?: boolean;
  otherInadmissibility?: UsReview;
  immigrationWaiver?: UsReview;
}

export interface UsHumanitarianAnswers {
  status?: 'refugee' | 'asylee';
  /** Qualifying days after refugee admission or asylum grant, as of the simulation date. */
  presenceDays?: number;
  statusRetained?: boolean;
  alreadyLpr?: boolean;
  refugeeDefinitionOrDerivative?: boolean;
  firmlyResettled?: boolean;
  discretion?: UsReview;
  /** Whether the evidence for a needed INA 209(c) waiver can be submitted with the application. */
  waiverFiling?: UsReview;
  /** The decision on the waiver, or confirmation that no waiver is needed. */
  waiver?: UsReview | 'not-needed';
}

export interface UsMilitaryAnswers {
  basis?: 'peacetime' | 'hostilities';
  service?: { from: IsoDate; to?: IsoDate }[];
  /** Certified qualifying service, excluding any breaks in service. */
  honorableServiceYears?: number;
  eligibleServiceComponent?: boolean;
  honorableService?: boolean;
  evidence?: 'n426' | 'dd214-or-ngb22' | 'none';
  separatedOn?: IsoDate | 'serving';
  lprAtInterview?: boolean;
  qualifyingLocationAtEnlistment?: boolean;
  backgroundCheck?: UsReview;
  /** Ordinary residence including the military-service credit in INA 328(d). */
  lateResidenceMet?: boolean;
}

export interface UsFeeAnswers {
  channel?: 'online' | 'paper';
  /** Fee schedule date based on the form's filing or postmark rule. */
  filingOn?: IsoDate;
  relief?: 'none' | 'waiver' | 'reduced';
  household?: UsHousehold;
  receivesMeansTestedBenefit?: boolean;
  extremeFinancialHardship?: UsReview;
  applyingWithParent?: boolean;
  onlineCategoryAvailable?: UsReview;
  premiumProcessing?: boolean;
  eb5Amendment?: boolean;
  specialFeeExemption?: boolean;
  adjustmentSupplementA?: boolean;
  consularFeeCategory?: 'family' | 'employment' | 'other' | 'diversity';
  travelForm?: 'advance-parole' | 'refugee-document';
  /** Ancillary H.R. 1 fees, where separately relevant. */
  hr1?:
    | 'asylum-initial'
    | 'asylum-annual'
    | 'work-initial'
    | 'work-renewal-asylum'
    | 'work-renewal-other'
    | 'tps'
    | 'sij'
    | 'parole'
    | 'i94';
  pendingI485AdvanceParole?: boolean;
}

export interface UsFullRequest extends Partial<
  Omit<UsRequest, 'simulationDate'>
> {
  pathway: UsFullPathwayId;
  /** Date on which eligibility to file or return is tested. */
  simulationDate: IsoDate;
  naturalization?: UsNaturalizationAnswers;
  conditions?: UsConditionsAnswers;
  travel?: UsTravelAnswers;
  family?: UsFamilyAnswers;
  support?: UsSupportAnswers;
  employment?: UsEmploymentAnswers;
  admission?: UsAdmissionAnswers;
  humanitarian?: UsHumanitarianAnswers;
  military?: UsMilitaryAnswers;
  fees?: UsFeeAnswers;
}
