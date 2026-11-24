import type { CefrLevel } from '@uk-immigration/policy-data';
import type { PtRequest, PtTrip } from './portugal';
import type { IsoDate } from './types';

export type PtOfficialReview = 'clear' | 'barred' | 'pending';

export interface PtLanguageEvidence {
  kind:
    | 'accepted'
    | 'ciple'
    | 'pla'
    | 'portuguese-school'
    | 'foreign-portuguese-school'
    | 'basic-course'
    | 'pan'
    | 'recognized-ple-test'
    | 'dual-certificate'
    | 'other'
    | 'none';
  recognized?: boolean;
  level?: CefrLevel;
  schoolYears?: number;
  courseHours?: number;
  accommodationRequested?: boolean;
}

export interface PtNationalityCrime {
  review?: PtOfficialReview;
  record?: 'none' | 'conviction';
  final?: boolean;
  imprisonment?: boolean;
  effective?: boolean;
  years?: number;
  punishableInPortugal?: boolean;
  category?: 'specified-serious-offence' | 'other';
  suspendedOrRehabilitationUnclear?: boolean;
}

export interface PtNationalityEvidence {
  statelessRecognized?: boolean;
  bornInOfficialPortugueseCountry?: boolean;
  officialPortugueseCountryNational?: boolean;
  languagePresumptionDisputed?: boolean;
  language?: PtLanguageEvidence;
  newLanguageAccepted?: boolean;
  cultureAccepted?: boolean;
  civicsAccepted?: boolean;
  declaration?: 'completed' | 'willing' | 'refused';
  crime?: PtNationalityCrime;
  security?: PtOfficialReview;
  sanctions?: PtOfficialReview;
  meansSources?: PtMeansEvidence['sources'];
  meansEvidenceAvailable?: boolean;
  documentsReady?: boolean;
}

export interface PtMeansEvidence {
  region?: 'mainland' | 'madeira' | 'azores';
  otherAdults?: number;
  dependantChildren?: number;
  sources?: (
    | 'employment'
    | 'self-employment'
    | 'pension'
    | 'savings'
    | 'scholarship'
    | 'support'
    | 'contributory-benefit'
    | 'solidarity-benefit'
    | 'other'
  )[];
  stable?: boolean;
  solidarityReliance?: boolean;
  supportedMonths?: number;
  /** Net countable resources, after applicable deductions. */
  monthlyEligibleEur?: number;
  /** Net monthly threshold as confirmed for this applicant, including any accepted relief. */
  confirmedMonthlyMinimumEur?: number;
  /** Includes classification of resources, household and any sponsor. */
  officialAssessment?: PtOfficialReview;
}

export interface PtResidenceEvidence {
  means?: PtMeansEvidence;
  accommodation?: 'documented' | 'alternative-proof' | 'none';
  housingTenure?: 'owned' | 'rented' | 'sublet' | 'hosted' | 'other';
  tax?:
    'compliant' | 'recognized-arrangement' | 'exempt' | 'arrears' | 'pending';
  socialSecurity?: PtResidenceEvidence['tax'];
  healthCoverage?:
    | 'sns-proof'
    | 'valid-insurance'
    | 'number-only'
    | 'unverified-policy'
    | 'none';
  language?: PtLanguageEvidence;
  travelDocumentValid?: boolean;
  criminalRecordAvailable?: boolean;
  statusCancellation?: PtOfficialReview;
  criminalSentence?: {
    /** Qualifying total imposed sentence, including suspended sentences where the applicable rule counts them. */
    totalYears?: number;
    scope?: 'complete' | 'uncertain';
    /** Dates for the Portuguese residence window, required for the permanent route. */
    permanentWindowVerified?: boolean;
    /** Use the qualifying total above or provide the convictions to aggregate. */
    convictions?: {
      date: IsoDate;
      years: number;
      fallsUnderPortugueseRule?: boolean;
      suspended?: boolean;
      expresslyCountedSuspendedOffence?: boolean;
    }[];
  };
  generalRefusal?: {
    review?: PtOfficialReview;
    sisAlert?: boolean;
    ucfeExclusion?: boolean;
    longestFinalPortuguesePrisonYears?: number;
    comparablePortugueseConvictions?: number;
  };
  fees?: {
    column?: 'left' | 'right';
    paid?: boolean;
    exemption?: 'confirmed' | 'unresolved' | 'none';
  };
}

export interface PtLongTermEvidence {
  operation?: 'grant' | 'replace' | 'retain' | 'recover';
  basis?: 'ordinary' | 'international-protection' | 'blue-card';
  currentCategory?:
    | 'qualifying'
    | 'study'
    | 'temporary-protection'
    | 'protection-pending'
    | 'seasonal'
    | 'posted-or-temporary-services'
    | 'diplomatic';
  protectionApplicationDate?: IsoDate;
  qualifyingProtectionGranted?: boolean;
  protectionContinuityVerified?: boolean;
  protectionWithdrawal?: PtOfficialReview;
  /** Formal evidence that the relevant legal segments, including any weighted study, have been checked. */
  blueCard?: {
    issuedByPortugal?: boolean;
    continuousQualifyingEuFrom?: IsoDate;
    continuousPortugueseBlueCardFrom?: IsoDate;
    staysVerified?: boolean;
    euAbsences?: PtTrip[];
  };
  /** The trips explicitly accepted as work postings under art. 126(5). */
  acceptedWorkPostings?: PtTrip[];
  publicOrder?: PtOfficialReview;
  memberStateChecks?: PtOfficialReview;
  lossReason?: 'none' | 'absence' | 'fraud' | 'expulsion' | 'another-state';
  lossReview?: PtOfficialReview;
  lossException?: PtOfficialReview;
  formerBlueCard?: boolean;
  euAbsences?: PtTrip[];
}

export type PtInvestment =
  | { kind: 'jobs'; jobs?: number; lowDensity?: boolean }
  | {
      kind: 'research' | 'culture';
      eur?: number;
      lowDensity?: boolean;
      recipientQualified?: boolean;
    }
  | {
      kind: 'fund';
      eur?: number;
      maturityYears?: number;
      portugalShare?: number;
      portugueseLaw?: boolean;
    }
  | {
      kind: 'company';
      eur?: number;
      transaction?: 'incorporation' | 'capital-increase';
      permanentJobsCreated?: number;
      jobsMaintained?: number;
      permanentJobsMaintained?: number;
      jobPeriodConfirmed?: boolean;
      portugueseCompany?: boolean;
    }
  | {
      kind: 'legacy';
      historicalType?: 'capital' | 'property' | 'renovation';
      originalApplication?: IsoDate;
      protectedProceeding?: boolean;
      transition?: PtOfficialReview;
    };

export interface PtInvestmentEvidence {
  operation?: 'grant' | 'renew' | 'convert' | 'replace-permanent';
  holder?: 'investor' | 'family';
  /** The sponsor currently holds a valid residence permit under art. 90-A. */
  sponsorAriValid?: boolean;
  relationshipContinues?: boolean;
  /** The family evidence establishes eligibility for reunification, including any applicable age or dependency requirements. */
  familyEvidenceAccepted?: boolean;
  entry?: 'schengen-visa' | 'visa-free' | 'other-legal' | 'irregular';
  lawfullyInPortugal?: boolean;
  firstEntry?: IsoDate;
  regularizedOn?: IsoDate;
  entryReview?: PtOfficialReview;
  visaRefusalGround?: boolean;
  socialRegistration?: 'registered' | 'not-required' | 'missing';
  qualifyingConviction?: boolean;
  convictionMaximumYears?: number;
  admissionReview?: PtOfficialReview;
  healthReview?: PtOfficialReview;
  domesticImmigrationAlert?: boolean;
  euRestrictiveMeasure?: boolean;
  foreignRecordDate?: IsoDate;
  accompanyingTaxEvidenceDate?: IsoDate;
  documentsReady?: boolean;
  investment?: PtInvestment;
  investedOn?: IsoDate;
  commercialVehicleQualified?: boolean;
  realEstateExposure?: boolean;
  investmentEvidenceAccepted?: boolean;
  maintenance?: 'maintained' | 'ended' | 'changed';
  investmentReview?: PtOfficialReview;
  permanentTerms?: PtOfficialReview;
}

export interface PtRenewalEvidence {
  filedOn?: IsoDate;
  receiptIssuedOn?: IsoDate;
  receiptExtendedThrough?: IsoDate;
  /** True when renewed/submitted after a card expiry under an accepted exception. */
  lateSubmissionAccepted?: boolean;
  residencePermitCancelled?: boolean;
  servingSentence?: boolean;
  expulsionOrdered?: boolean;
  releasedOn?: IsoDate;
  purpose?:
    | 'employment'
    | 'self-employment'
    | 'highly-qualified'
    | 'study'
    | 'research'
    | 'entrepreneur'
    | 'labour-integration'
    | 'blue-card'
    | 'other';
  purposeEvidence?: boolean;
  studyInterruptionAccepted?: boolean;
  studyEnrolled?: boolean;
  studyProgress?: boolean;
  feesAndInternshipEvidence?: boolean;
  contumacia?: 'none' | 'lifted' | 'active';
  publicOrder?: PtOfficialReview;
  euRestrictiveMeasure?: boolean;
}

export interface PtFreeMovementEvidence {
  operation?: 'grant' | 'retain';
  permanentRightAcquiredOn?: IsoDate;
  basis?: 'ordinary' | 'retained-family' | 'early-worker' | 'early-family';
  applicant?: 'eu-eea-swiss' | 'third-country-family' | 'andorra' | 'other';
  sponsorEligible?: boolean;
  relationship?:
    'spouse' | 'partner' | 'descendant' | 'ascendant' | 'other-family';
  relationshipVerified?: boolean;
  /** Individual residence permission for an art. 3(2) other-family case. */
  otherFamilyPermission?: PtOfficialReview;
  accompaniesOrJoins?: boolean;
  /** Dependency during qualifying residence, where required. */
  dependant?: boolean;
  continuousResidenceFrom?: IsoDate;
  livedWithSponsor?: boolean;
  absences?: (PtTrip & {
    reason?: 'ordinary' | 'military' | 'justified';
    accepted?: boolean;
  })[];
  expulsionExecuted?: boolean;
  /** Accepted art. 7/9 evidence covering the whole required residence period. */
  historicalBasisReview?: PtOfficialReview;
  residenceBasis?:
    | 'worker'
    | 'self-employed'
    | 'student'
    | 'self-sufficient'
    | 'family'
    | 'retained-worker';
  identityAtEntryValid?: boolean;
  enrolledInRecognizedSchool?: boolean;
  sponsorResidenceBasisEstablished?: boolean;
  sufficientResources?: boolean;
  healthInsuranceRequired?: boolean;
  healthInsuranceCovered?: boolean;
  workerStatusRetained?: boolean;
  retentionEvent?:
    'death' | 'departure' | 'divorce' | 'annulment' | 'partnership-ended';
  retainedAsSchoolChildOrCarer?: boolean;
  retainedBasis?:
    | 'worker'
    | 'self-employed'
    | 'resources-and-insurance'
    | 'qualifying-household'
    | 'none';
  earlyWorker?: {
    reason?: 'retirement' | 'permanent-disability' | 'cross-border';
    retirementQualifies?: boolean;
    selfEmployedWithoutPension?: boolean;
    continuousResidenceFrom?: IsoDate;
    creditedWorkFrom?: IsoDate;
    portuguesePartnerException?: boolean;
    occupationalBenefit?: boolean;
    otherMemberStateWork?: boolean;
    returnsWeekly?: boolean;
  };
  earlyFamily?: {
    livedWithWorker?: boolean;
    workerEarlyRight?: boolean;
    workerDiedWhileWorking?: boolean;
    workerResidenceFrom?: IsoDate;
    deathDate?: IsoDate;
    occupationalDeath?: boolean;
    survivorLostPortugueseNationality?: boolean;
  };
  documents?: 'standard' | 'accepted-alternative' | 'missing-or-expired';
  publicRestrictions?: PtOfficialReview;
  feeMode?: 'digital' | 'in-person' | 'urgent' | 'address-only';
  feePaid?: boolean;
}

export interface PtPartnerEvidence {
  kind?: 'marriage' | 'civil-partnership' | 'none';
  relationshipFrom?: IsoDate;
  current?: boolean;
  portuguesePartner?: boolean;
  partnerPortugueseSince?: IsoDate;
  registrationAccepted?: boolean;
  courtRecognition?: boolean;
  partnerStatementDate?: IsoDate;
  effectiveLinksEvidence?: boolean;
  commonPortugueseChild?: boolean;
  connectionReview?: PtOfficialReview;
  foreignService?:
    | 'none'
    | 'technical-or-compulsory'
    | 'nontechnical-or-voluntary'
    | 'unclear';
  serviceReview?: PtOfficialReview;
  documentsReady?: boolean;
  /** A declaration made on this date and still pending at the nationality reform. */
  pendingApplication?: IsoDate;
}

export interface PtFullRequest extends PtRequest {
  birthDate?: IsoDate;
  emancipation?: 'recognized' | 'none' | 'uncertain';
  emancipationFrom?: IsoDate;
  nationality?: PtNationalityEvidence;
  residence?: PtResidenceEvidence;
  permanentOperation?: 'grant' | 'replace' | 'retain';
  longTerm?: PtLongTermEvidence;
  investment?: PtInvestmentEvidence;
  renewal?: PtRenewalEvidence;
  freeMovement?: PtFreeMovementEvidence;
  partner?: PtPartnerEvidence;
}
