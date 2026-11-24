import type { IsoDate } from '../types';
import type { UsRequest, UsTrip } from '../united-states';
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

export interface UsFullTrip extends UsTrip {
  /** Evidence for this specific departure and return while I-485 is pending. */
  i485Travel?: {
    route:
      | 'advance-parole'
      | 'nonimmigrant'
      | 'tps'
      | 'refugee-travel-document'
      | 'other-209'
      | 'none';
    /** A cleared finding confirms all conditions of the route, including any required authorization before departure and qualifying inspection and return. Use none only when no route applies. */
    evidence?: UsReview;
    /** Exclusion, deportation or removal proceedings at departure. */
    inRemovalProceedings?: boolean;
  };
}

export type UsI485PendingEvent =
  | {
      on: IsoDate;
      kind: 'qualifying-basis' | 'procedure' | 'nonimmigrant-status-expiry';
      /** Case-specific effect through decision, accounting for any applicable exception or transfer. Examples include loss of a qualifying relationship, withdrawn job offer, abandonment of a proposed endeavor, refugee status termination or a missed required interview. */
      finding?: UsReview;
    }
  | {
      on: IsoDate;
      kind: 'admissibility';
      /** Identifies the newly arising ground when the corresponding admission answer is also supplied. */
      ground?: 'immigrationFraud' | 'falseCitizenship' | 'unlawfulReentryBar';
      /** Case-specific effect through adjudication, including applicable exceptions. */
      finding?: UsReview;
    }
  | {
      on: IsoDate;
      kind: 'unauthorized-employment';
      /** Non-overlapping total since the relevant lawful admission, through this event unless a later coverage date is given. */
      qualifyingViolationsDays?: number;
      /** Coverage of the cumulative record, from the same relevant lawful admission. */
      qualifyingViolationsThrough?: IsoDate;
      /** Case-specific exception when the modeled statutory exemptions do not resolve eligibility. */
      exception?: UsReview;
    };

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
  /** Actual USCIS receipt date for a previously filed I-131 reentry permit. */
  permitFiledOn?: IsoDate;
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
  /** Petitioner's current status. */
  petitioner?: 'citizen' | 'lpr';
  /** Status at the underlying I-130 receipt, if different from or not established by the current status. */
  petitionerAtFiling?: 'citizen' | 'lpr';
  /** Actual U.S. naturalization date of the I-130 petitioner. */
  petitionerNaturalizedOn?: IsoDate;
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
  /** Confirmed CSPA age for the classification being assessed, or pending case-specific determination. */
  cspaAge?: number | 'pending';
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
  /** Household and income evidence for the applicable I-864 assessment date. */
  household?: UsHousehold;
  activeDuty?: boolean;
  /** Net qualifying assets, convertible to cash without undue harm within the permitted period. */
  qualifyingAssetsUsd?: number;
  orphanException?: boolean;
  /** An independently qualified joint sponsor, with their own sufficient household and affidavit. */
  jointSponsor?: UsReview;
}

export interface UsEmploymentAnswers {
  category?:
    | 'eb1a'
    | 'eb1b'
    | 'eb1c'
    | 'eb2-perm'
    | 'eb2-niw'
    | 'eb3'
    | 'eb5'
    | 'gold-card';
  categoryQualifications?: UsReview;
  /** A valid offer for the petitioned job that the beneficiary intends to accept. */
  employmentOffer?: boolean;
  /** Whether the required, signed Supplement J accompanies the initial I-485. */
  initialSupplementJIncluded?: boolean;
  jobPortability?: {
    /** Start of I-485 pendency for portability on this I-140 basis, using the transfer request receipt when a restart applies. */
    i485PendingSince?: IsoDate;
    /** The petitioned offer was valid when filing on this basis, and the beneficiary intended to accept it. */
    originalOfferValidAtFiling?: boolean;
    /** A bona fide permanent, full-time offer that the beneficiary and employer intend to carry out. */
    newOffer?: boolean;
    sameOrSimilarOccupation?: UsReview;
    /** Actual submission date of the Supplement J portability request for this offer. */
    supplementJFiledOn?: IsoDate;
  };
  perm?: 'certified' | 'schedule-a' | 'pending' | 'none';
  /** Case-specific finding on whether a reported certification remains valid. */
  permCertificationValidity?: UsReview;
  permCertifiedOn?: IsoDate;
  /** Actual receipt date of the underlying I-140, on or before the simulation date. */
  i140FiledOn?: IsoDate;
  prevailingWageUsd?: number;
  profferedWageUsd?: number;
  recruitmentAndFeesCompliant?: boolean;
  permRecruitment?: {
    /** Actual or candidate DOL receipt date of the ordinary PERM application (ETA-9089). */
    laborCertificationFiledOn?: IsoDate;
    stateJobOrder?: { from: IsoDate; through: IsoDate };
    /** Publication dates of the qualifying mandatory advertisements. */
    advertisementDates?: IsoDate[];
    notice?:
      | { method: 'union'; notifiedOn?: IsoDate }
      | {
          method: 'posting';
          /** Complete business dates covered by one uninterrupted posting at the worksite, where no bargaining representative applies. */
          businessDates?: readonly IsoDate[];
        };
    professional?: boolean;
    extraDistinctSteps?: number;
    qualifiedAvailableUsWorker?: boolean;
    employerPaidPermCosts?: boolean;
  };
  employerEmployees?: number;
  employerNonprofit?: boolean;
  officerStatementAccepted?: UsReview;
  /** One entry for each legally required year from the priority date. */
  wageYears?: {
    /** Calendar year of these amounts. Financial periods with other dates can use through. */
    year?: number;
    /** Last date represented by all amounts in this entry, inclusive. */
    through?: IsoDate;
    paidUsd?: number;
    netIncomeUsd?: number;
    netCurrentAssetsUsd?: number;
  }[];
  /** Whether the annual records cover the full required period. False means some records are missing. */
  wagePeriodComplete?: boolean;
  /** Last date covered by the annual records. Defaults to the simulation date. */
  wagePeriodThrough?: IsoDate;
  abilityToPayTotality?: UsReview;
  internationalAward?: boolean;
  extraordinaryEvidenceCount?: number;
  comparableEvidenceAccepted?: UsReview;
  extraordinaryFinalMerits?: UsReview;
  /** Intent to continue the petitioned work or endeavor, with applicable evidence. */
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
    /** Evidence of the full transfer to Commerce for visa issuance. */
    giftTransferred?: UsReview;
  };
  priorMarriageFraud?: boolean;
  /** Whether the applicant filed the I-140 on their own behalf. */
  i140SelfPetition?: boolean;
  relativePetitioner?: boolean;
  relativeOwnershipPct?: number;
}

type UsVisaAvailability = 'available' | 'unavailable' | 'future-bulletin';

type UsOtherInadmissibilityParagraph = 5 | 6 | 7 | 8 | 9 | 10;

type UsI693Evidence = Pick<
  UsAdmissionAnswers,
  'medicalEvidence' | 'i693SignedOn' | 'i693LinkedToAnotherClosedCase'
>;

export interface UsAdmissionAnswers {
  /** Bare prospective applications have no favourable discretionary finding yet. */
  process?: 'adjustment' | 'consular';
  /** Actual USCIS receipt date of this properly filed I-485. */
  i485FiledOn?: IsoDate;
  /** Additional dated evidence for the pending I-485, including the onset of admissibility grounds. */
  i485PendingEvents?: readonly UsI485PendingEvent[];
  /** Role in an employment-based I-485. Defaults to principal. */
  i485ApplicantRole?: 'principal' | 'derivative';
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
  /** Formal immigrant visa application at interview, when distinct from the decision date. */
  interviewOn?: IsoDate;
  /** Adjudication date to assess. For consular cases without interviewOn, both stages share this date. */
  decisionOn?: IsoDate;
  /** Current eligibility under the basis, including any material changes since petition approval. */
  qualifyingBasis?: UsReview;
  /** Status of the underlying petition, including a still-valid approval with an unknown receipt date. */
  petitionStatus?: 'filed-with-i485' | 'pending' | 'approved';
  /** Actual receipt date for an underlying petition other than I-140. */
  petitionFiledOn?: IsoDate;
  /** An I-485 transfer of underlying basis. The regular petition fields describe the replacement basis. */
  i485BasisTransfer?: {
    /** Date USCIS granted the transfer. Leave unset while unconfirmed. */
    approvedOn?: IsoDate;
    originalPetition?: {
      filedOn?: IsoDate;
      adjustmentBasis?: UsAdmissionAnswers['adjustmentBasis'];
      /** Original basis and supporting evidence at I-485 receipt, including any required petition approval. */
      qualifyingBasisAtFiling?: UsReview;
      /** Valid offer and intent to accept the job under the original petition at I-485 receipt, when required. */
      employmentOfferAtFiling?: boolean;
      /** Original employer's ability to pay its own proffered wage through I-485 receipt, when required. */
      abilityToPayAtFiling?: UsReview;
      /** Availability under the original petition on the chart designated for the I-485 receipt month. */
      visaAtFiling?: UsVisaAvailability;
      entryException?: UsReview;
      /** Case-specific waivers on the original adjustment basis at receipt. */
      healthWaiverAtFiling?: UsReview;
      criminalWaiverAtFiling?: UsReview;
      immigrationWaiverAtFiling?: UsReview;
      vawaUnlawfulPresenceExceptionAtFiling?: UsReview;
    };
  };
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
  /** Qualifying violation days at I-485 filing. Report later employment and its cumulative records under i485PendingEvents. */
  qualifyingViolationsDays?: number;
  /** Lawful nonimmigrant status at I-485 filing, separate from parole or lawful admission. */
  lawfulNonimmigrantStatusAtFiling?: boolean;
  /** Presence pursuant to a lawful admission on the I-485 filing date for INA 245(k). */
  lawfulAdmissionFor245k?: boolean;
  discretion?: UsReview;
  classAHealth?: UsReview;
  vaccines?: UsReview;
  /** Case finding on the required medical report, including a partial I-693 when sufficient. */
  medicalEvidence?: UsReview;
  i693SignedOn?: IsoDate;
  i693LinkedToAnotherClosedCase?: boolean;
  /** Evidence specific to the original report included with this I-485. */
  i693AtFiling?: UsI693Evidence;
  /** Evidence specific to a supplemental report used for the modeled decision. */
  i693AtDecision?: UsI693Evidence;
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
  /** Evidence of the VAWA exception to INA 212(a)(9)(B)(i). */
  vawaUnlawfulPresenceException?: UsReview;
  /** Whether INA 212(a)(9)(C) still bars this applicant after any case-specific relief. */
  unlawfulReentryBar?: boolean;
  otherInadmissibility?: UsReview;
  /** INA 212(a) findings after individual waivers. Complete findings supersede the aggregate when they resolve or explain every applicable ground without a dedicated input. */
  otherInadmissibilityByGround?: Partial<
    Record<
      | `${UsOtherInadmissibilityParagraph}`
      | `${UsOtherInadmissibilityParagraph}(${string})`,
      UsReview
    >
  >;
  immigrationWaiver?: UsReview;
}

export interface UsHumanitarianAnswers {
  status?: 'refugee' | 'asylee';
  /** Qualifying days after refugee admission or asylum grant, through presenceThrough or the simulation date. */
  presenceDays?: number;
  presenceThrough?: IsoDate;
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
  /** Certified qualifying service at filing, excluding any breaks in service. */
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
  /** Filing or postmark date for fees and for I-485 public-charge policy applicability. */
  filingOn?: IsoDate;
  relief?: 'none' | 'waiver' | 'reduced';
  household?: UsHousehold;
  receivesMeansTestedBenefit?: boolean;
  extremeFinancialHardship?: UsReview;
  applyingWithParent?: boolean;
  /** Case-specific online eligibility, including any required representation for concurrent filing. */
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
  Omit<UsRequest, 'simulationDate' | 'trips'>
> {
  pathway: UsFullPathwayId;
  /** Date on which eligibility to file or return is tested. */
  simulationDate: IsoDate;
  /** Omit if travel history is unknown. An empty array confirms no travel. */
  trips?: UsFullTrip[];
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
