import { IE_PERMISSION_KINDS } from '@uk-immigration/engine';
import type {
  IePermission,
  IeTrip,
  IrelandBurden,
  IrelandCharacter,
  IrelandCitizenship,
  IrelandFamily,
  IrelandFullPathwayId,
  IrelandFullRequest,
  IrelandLtr,
  IrelandRegistration,
  IrelandResidencePeriod,
  IrelandTreatyActivity,
  IrelandTreatyResidence,
  IrelandWcatt,
  IrelandWorkPermit,
  IrelandWorkUpgrade,
} from '@uk-immigration/engine';

// Every question maps onto one property of the engine request. The record key
// is the property name; labels default to it (ie.field.<label>), options use
// ie.option.<label>.<value>. A list or multi-select left undefined is
// unanswered; an empty array is a confirmed "none".
export type IrelandField = {
  label?: string;
  hint?: string;
  required?: boolean;
  /** Option label (ie.option.<label>.<blank>) for an unanswered choice. */
  blank?: string;
  /** Upper bound for a number. */
  max?: number;
  /** Shown only when one of these pathways is selected. */
  paths?: readonly IrelandFullPathwayId[];
} & (
  | {
      type:
        | 'boolean'
        | 'date'
        | 'datetime'
        | 'number'
        | 'integer'
        | 'dates'
        | 'numbers';
    }
  | { type: 'choice' | 'multi'; options: readonly string[] }
  | { type: 'group' | 'list'; fields: IrelandFields }
);
export type IrelandFields = Record<string, IrelandField>;
// Compile-time coverage: every property of the engine type has a question.
type Fields<T> = { [K in keyof T]-?: IrelandField };
type Extra = Pick<
  IrelandField,
  'label' | 'hint' | 'required' | 'blank' | 'max' | 'paths'
>;

const bool = (extra?: Extra): IrelandField => ({ type: 'boolean', ...extra });
const date = (extra?: Extra): IrelandField => ({ type: 'date', ...extra });
const number = (extra?: Extra): IrelandField => ({ type: 'number', ...extra });
const integer = (extra?: Extra): IrelandField => ({
  type: 'integer',
  ...extra,
});
const numbers = (extra?: Extra): IrelandField => ({
  type: 'numbers',
  ...extra,
});
const dates = (extra?: Extra): IrelandField => ({ type: 'dates', ...extra });
const choice = (options: readonly string[], extra?: Extra): IrelandField => ({
  type: 'choice',
  options,
  ...extra,
});
const multi = (options: readonly string[], extra?: Extra): IrelandField => ({
  type: 'multi',
  options,
  ...extra,
});
function group<T>(fields: Fields<T>, extra?: Extra): IrelandField {
  return { type: 'group', fields, ...extra };
}
function list<T>(fields: Fields<T>, extra?: Extra): IrelandField {
  return { type: 'list', fields, ...extra };
}
const required = { required: true } as const;

export const NATURALISATION_PATHS = [
  'IE-NATURALISATION',
  'IE-SPOUSE',
  'IE-MINOR-BORN-IN-STATE',
  'IE-MINOR-NATURALISED-PARENT',
  'IE-IRISH-ASSOCIATIONS',
  'IE-PROTECTION',
  'IE-PUBLIC-SERVICE',
] as const satisfies readonly IrelandFullPathwayId[];
export const WORK_PATHS = [
  'IE-STAMP4-21',
  'IE-STAMP4-57',
] as const satisfies readonly IrelandFullPathwayId[];
export const FAMILY_PATHS = [
  'IE-STAMP4-INDEPENDENT-FAMILY',
  'IE-STAMP4-IRISH-FAMILY',
] as const satisfies readonly IrelandFullPathwayId[];
const LTR_PATHS = [
  'IE-LTR-PRINCIPAL',
  'IE-LTR-FAMILY',
] as const satisfies readonly IrelandFullPathwayId[];
export const RESIDENCE_PATHS = [
  'IE-STAMP5',
  ...LTR_PATHS,
] as const satisfies readonly IrelandFullPathwayId[];
export const TREATY_PATHS = [
  'IE-EU-PERMANENT',
  'IE-WA-PERMANENT',
] as const satisfies readonly IrelandFullPathwayId[];
// Permission and travel records feed every pathway except EU and WA residence.
const STAMP_RECORD_PATHS = [
  ...NATURALISATION_PATHS,
  ...WORK_PATHS,
  ...FAMILY_PATHS,
  ...RESIDENCE_PATHS,
];
/** Pathway groups in questionnaire order. */
export const PATHWAY_GROUPS = {
  naturalisation: NATURALISATION_PATHS,
  stamps: [...WORK_PATHS, ...FAMILY_PATHS, ...RESIDENCE_PATHS],
  treaty: TREATY_PATHS,
} as const;

const place = ['state', 'northern-ireland', 'elsewhere'] as const;
const character = group<IrelandCharacter>({
  record: choice(['none', 'conviction-or-other', 'awaiting-trial']),
  disclosed: bool(),
  officialFinding: bool(),
});
const burden = group<IrelandBurden>({
  benefit: choice([
    'none',
    'prsi-only',
    'non-insurance',
    'means-tested',
    'other',
  ]),
  officialUndueBurden: bool(),
});
const periods = (extra?: Extra) =>
  list<IrelandResidencePeriod>(
    { from: date(required), to: date({ hint: 'to' }) },
    extra,
  );

// The stage is asked on each pathway's own step (IrelandStages).
export const registrationFields = {
  basis: choice(['required', 'exempt', 'minister-directed'], {
    label: 'registrationBasis',
  }),
  checklistComplete: bool(),
  irpExpiresOn: date({ hint: 'irpExpiresOn' }),
  validPermission: bool(),
  renewalPending: bool(),
  addressCurrent: bool(),
  passportValid: bool(),
  registrationDate: date(),
  feeExemption: choice(['confirmed', 'none', 'protection-mapping-uncertain']),
  feePrepared: bool(),
} satisfies Fields<Omit<IrelandRegistration, 'stage'>>;

type Spouse = NonNullable<IrelandCitizenship['spouse']>;
type Minor = NonNullable<IrelandCitizenship['minor']>;
type Association = NonNullable<IrelandCitizenship['association']>;
type Protection = NonNullable<IrelandCitizenship['protection']>;
type Evidence = NonNullable<IrelandCitizenship['residenceEvidence']>;

// Citizenship questions are split into sections; together they cover the type.
export const citizenshipSections = {
  natEligibility: {
    entitlement: choice([
      'none',
      'already-citizen',
      'birth-descent-or-fbr',
      'uncertain',
    ]),
    recognisedEarlyMarriage: bool(),
    character,
    vetting: choice([
      'completed',
      'authorised',
      'outstanding',
      'pending-review',
    ]),
    vettingRequired: bool(),
    intendToReside: choice(place),
    willingToDeclare: bool(),
    declarationCompleted: bool(),
    approvedAlternativeDeclaration: bool(),
  },
  natDocuments: {
    identityDocuments: multi([
      'validPassport',
      'irp',
      'licence',
      'servicesCard',
      'ppsLetter',
      'euId',
      'protectionId',
    ]),
    passportExpiredOn: date(),
    alternativeIdentityEvidence: bool(),
    birthCertificateOrAcceptedAlternative: bool(),
    prescribedFormAndWitness: bool(),
    refereeCount: integer(),
    residenceEvidence: group<Evidence>(
      {
        requiredYears: numbers(required),
        years: list<Evidence['years'][number]>(
          {
            year: integer(required),
            strong: integer(required),
            supporting: integer(required),
          },
          { label: 'evidenceYears', ...required },
        ),
        affidavit: bool({ label: 'residencyAffidavit' }),
      },
      { hint: 'residenceEvidence' },
    ),
    residence: list<NonNullable<IrelandCitizenship['residence']>[number]>(
      {
        from: date(required),
        to: date({ hint: 'to' }),
        basis: choice(['reckonable', 'excluded', 'uncertain'], {
          label: 'residenceBasis',
          ...required,
        }),
      },
      { hint: 'residence' },
    ),
    unregisteredResidenceEvidence: list<{ from: string; to: string }>(
      { from: date(required), to: date(required) },
      { hint: 'unregisteredResidenceEvidence' },
    ),
  },
  natProcess: {
    applicationFeePrepared: bool(),
    approved: bool(),
    certificateFeePaid: bool(),
    certificateIssuedOn: date(),
    survivorFeeConditions: bool(),
    additionalEvidence: group<
      NonNullable<IrelandCitizenship['additionalEvidence']>
    >({
      requestedOn: date(required),
      deadline: date(),
      suppliedOn: date(),
    }),
    addressUpdated: bool(),
  },
  natSpouse: {
    spouse: group<Spouse>(
      {
        relationship: choice(['spouse', 'civil-partner', 'de-facto', 'ended'], {
          label: 'spouseRelationship',
        }),
        irishCitizen: bool(),
        recognised: bool(),
        livingTogether: bool(),
        affidavit: bool({ label: 'spouseAffidavit' }),
        jointAddressEvidenceMonths: integer(),
        jointAddressDocuments: integer(),
        postingPeriods: periods({ label: 'postingPeriods' }),
        postingUnconfirmed: bool(),
        waiver: choice(['none', 'pending', 'denied', 'granted']),
        waivedConditions: multi(['marriage', 'continuous', 'prior', 'intent']),
      },
      { paths: ['IE-SPOUSE'] },
    ),
  },
  natMinor: {
    minor: group<Minor>(
      {
        // Irish associations and public service read it for applicants under 18.
        authorisedRepresentative: bool(),
        listedSeriousOffence: bool({ paths: ['IE-MINOR-BORN-IN-STATE'] }),
        backgroundFormPrepared: bool({ paths: ['IE-MINOR-BORN-IN-STATE'] }),
        characterWaived: bool({ paths: ['IE-MINOR-BORN-IN-STATE'] }),
        declarationWaived: bool({ paths: ['IE-MINOR-BORN-IN-STATE'] }),
        naturalisedParentCertificateOn: date({
          paths: ['IE-MINOR-NATURALISED-PARENT'],
        }),
        relationshipAndConsentEvidence: bool({
          paths: ['IE-MINOR-NATURALISED-PARENT'],
        }),
        childResidenceAndSchoolEvidence: bool({
          paths: ['IE-MINOR-NATURALISED-PARENT'],
        }),
        parentRouteWaiverGranted: bool({
          paths: ['IE-MINOR-NATURALISED-PARENT'],
        }),
      },
      {
        hint: 'minor',
        paths: [
          'IE-MINOR-BORN-IN-STATE',
          'IE-MINOR-NATURALISED-PARENT',
          'IE-IRISH-ASSOCIATIONS',
          'IE-PUBLIC-SERVICE',
        ],
      },
    ),
  },
  natAssociation: {
    association: group<Association>(
      {
        qualifyingRelationship: bool(),
        relativeEligibleAtRelevantDate: bool(),
        waiverGranted: bool(),
        evidence: group<NonNullable<Association['evidence']>>(
          {
            residenceYears: number(required),
            taxResident: bool(required),
            currentlyResident: bool(required),
            visits: integer(required),
            residentFamily: bool(required),
            significantContribution: bool(required),
            nfqLevel: integer(),
            juniorCertificate: bool(required),
            leavingCertificate: bool(required),
            irishInsurance: bool(required),
            prsiContributions: integer(required),
            irishPension: bool(required),
            fullIrishLicence: bool(required),
            activeIrishBank: bool(required),
          },
          { label: 'associationEvidence' },
        ),
      },
      { paths: ['IE-IRISH-ASSOCIATIONS'] },
    ),
  },
  natProtection: {
    // Identity evidence and the certification fee exemption apply on every
    // naturalisation route; the residence rules only on the refugee route.
    protection: group<Protection>(
      {
        kind: choice(
          [
            'convention-refugee',
            'programme-refugee',
            'stateless',
            'subsidiary',
            'pending',
            'none',
          ],
          { label: 'protectionKind' },
        ),
        grantOn: date({ label: 'protectionGrantOn', paths: ['IE-PROTECTION'] }),
        validRecognition: bool(),
        identityEvidence: group<NonNullable<Protection['identityEvidence']>>({
          nationalPassportUnavailable: bool(),
          certifiedIrishTravelDocument: bool(),
          refugeeStatusLetter: bool(),
          witnessedPassportAffidavit: bool(),
        }),
        certificationFeeExemptionConfirmed: bool(),
        waiverGranted: bool({ paths: ['IE-PROTECTION'] }),
        waiverPending: bool({ paths: ['IE-PROTECTION'] }),
        waivedResidenceConditions: multi(['continuous', 'prior'], {
          hint: 'waivedResidenceConditions',
          paths: ['IE-PROTECTION'],
        }),
      },
      { hint: 'protection' },
    ),
  },
  natPublicService: {
    publicService: group<NonNullable<IrelandCitizenship['publicService']>>(
      {
        qualifyingIrishPublicAppointment: bool(),
        residesAbroadDuringService: bool(),
        appointmentEvidence: bool(),
        waiverGranted: bool(),
      },
      { paths: ['IE-PUBLIC-SERVICE'] },
    ),
  },
};
export const citizenshipFields: Fields<IrelandCitizenship> = {
  ...citizenshipSections.natEligibility,
  ...citizenshipSections.natDocuments,
  ...citizenshipSections.natProcess,
  ...citizenshipSections.natSpouse,
  ...citizenshipSections.natMinor,
  ...citizenshipSections.natAssociation,
  ...citizenshipSections.natProtection,
  ...citizenshipSections.natPublicService,
};

const permitFields = {
  applicationDate: date({ label: 'permitApplicationDate' }),
  termMonths: integer(),
  renewal: bool({ label: 'permitRenewal' }),
  feePrepared: bool({ label: 'permitFeePrepared' }),
  tier: choice(
    [
      'csep',
      'csepGraduate',
      'csepHigh',
      'gep',
      'gepLower',
      'gepGraduate',
      'ict',
      'ictTrainee',
    ],
    { label: 'permitTier' },
  ),
  occupationEligible: bool(),
  recognisedQualifications: bool(),
  employerEligible: bool(),
  eeaStaffShare: number({ hint: 'eeaStaffShare', max: 1 }),
  staffShareExemption: bool(),
  graduateNfqLevel: integer(),
  graduateAwardOn: date(),
  irishRegisteredQualification: bool(),
  offerFrom: date(),
  offerEnd: date(),
  labourMarketTestOrExemption: bool(),
  foreignEmploymentFrom: date(),
  transferOn: date(),
  associatedEmployersAndAssignment: bool(),
  hoursPerWeek: number(),
  eligibleAnnualRemuneration: number({ hint: 'remuneration' }),
  eligibleHourlyRemuneration: number(),
  baseWageLawMet: bool(),
  publicPayAgreement: group<
    NonNullable<IrelandWorkPermit['publicPayAgreement']>
  >({ annual: number(required), hourly: number(required) }),
  publicPayAgreementUnconfirmed: bool(),
} satisfies Fields<IrelandWorkPermit>;

export const workSections = {
  workUpgrade: {
    basis: choice(['csep', 'hosting', 'multi-site-doctor', 'gep', 'ict'], {
      label: 'workBasis',
    }),
    validCorrespondingPermission: bool(),
    employedInState: bool(),
    passportIrpAndPermits: bool(),
    payslipAndRevenueEvidence: bool(),
    employerLetterOn: date({ hint: 'employerLetterOn' }),
    recordsConsistent: bool(),
    termsComplied: bool(),
    character,
    permissionRevoked: bool(),
    isdApproved: bool(),
    hostingAgreementValid: bool(),
    doctorPermitAndQualificationsValid: bool(),
  },
  workPermit: {
    permitApplication: group<IrelandWorkPermit>(permitFields, {
      hint: 'permitApplication',
    }),
  },
};
export const workFields: Fields<IrelandWorkUpgrade> = {
  ...workSections.workUpgrade,
  ...workSections.workPermit,
};

// The registration stage is asked as familyStage.
type Application = Omit<
  NonNullable<IrelandFamily['application']>,
  'registrationStage'
>;
type Housing = NonNullable<Application['housing']>;
// Family facts; the sponsor's permission grant date (grantOn) is not read by the engine.
type FamilyQuestions = Omit<IrelandFamily, 'grantOn' | 'application'> & {
  application?: Application;
};

const applicationSections = {
  famChannel: {
    date: date({ label: 'familyApplicationDate' }),
    renewalInsuranceRequired: bool(),
    renewalInsuranceConditionMet: bool(),
    channel: choice(
      [
        'ordinary',
        'spouse-registration',
        'spouse-in-state',
        'de-facto-in-state',
        'de-facto-overseas',
      ],
      { label: 'familyChannel' },
    ),
    entryOrConversionValid: bool(),
    entryOrConversionOnReturn: group<
      NonNullable<Application['entryOrConversionOnReturn']>
    >(
      {
        date: date({ label: 'returnDate', ...required }),
        valid: bool({ label: 'returnBasisValid', ...required }),
      },
      { hint: 'entryOrConversionOnReturn' },
    ),
    spouseInStateEntry: choice(['with-permission', 'spouse-unit']),
    spouseUnitUndueBurdenCleared: bool(),
  },
  famFinances: {
    sponsorResponsible: bool(),
    grossTaxYears: numbers({ hint: 'grossTaxYears' }),
    previousTaxYearNet: number(),
    minorChildren: integer(),
    incomeMaintained: bool(),
    chieflyOnStateSupportYears: integer(),
    verifiedSavingsMaySupplement: bool(),
    noSocialWelfare: bool(),
    differentPartnerGrantOn: date(),
    priorSponsorshipHistoryComplete: bool(),
    sponsorBankMonths: integer(),
  },
  famDocuments: {
    familyEvidenceComplete: bool(),
    addressEvidence: bool(),
    applicantCharacter: { ...character, label: 'applicantCharacter' },
    sponsorCharacter: { ...character, label: 'sponsorCharacter' },
    publicInterestCleared: bool(),
    visa: choice(['single', 'multiple', 'preclearance', 'exempt']),
    visaFeePrepared: bool(),
    visaFeeExempt: bool(),
    insuranceRequiredForEntry: bool(),
    insuranceEvidenceAtEntry: bool(),
    insurance: group<NonNullable<Application['insurance']>>({
      kind: choice(['private', 'travel-bridge'], { label: 'insuranceKind' }),
      hiaAuthorised: bool(),
      coversRequiredPeople: bool(),
      coverageMonths: integer(),
      permissionMonths: integer(),
      hospitalAndMedical: bool(),
      accidentCover: number(),
      illnessCover: number(),
      coversUntilPrivateStarts: bool(),
    }),
    overseasLawfulAndRemainsAbroad: bool(),
    applicationSummaryOn: date(),
    submittedDocumentsOn: date(),
    policeCertificates: group<NonNullable<Application['policeCertificates']>>({
      allRequiredCountriesCovered: bool(),
      issueDates: dates(required),
    }),
  },
  famHousing: {
    housing: group<Housing>({
      kind: choice(
        ['private-owned', 'private-rented', 'excluded-public', 'other-support'],
        { label: 'housingKind' },
      ),
      rooms: list<NonNullable<Housing['rooms']>[number]>({
        floorSquareFeet: number(required),
        ceilingFeet: number(required),
        occupantCount: integer(required),
        oppositeSexOccupantsAtLeastTenNotCouple: bool(),
      }),
      bedroomCount: integer(),
      childrenShareCompatibly: bool(),
      unrelatedAdultsWithChildren: bool(),
      entireHome: bool(),
      titleOrRtbAndAccom1: bool(),
      affordable: bool(),
      evidenceRequestedOn: date(),
      evidenceSubmittedOn: date(),
    }),
  },
};
const applicationFields: Fields<Application> = {
  ...applicationSections.famChannel,
  ...applicationSections.famFinances,
  ...applicationSections.famDocuments,
  ...applicationSections.famHousing,
};

const familyRelationshipFields = {
  relationship: choice(
    ['spouse', 'civil-partner', 'de-facto', 'child', 'other'],
    {
      label: 'familyRelationship',
    },
  ),
  relationshipValidAndGenuine: bool(),
  livingTogether: bool(),
  intendsToLiveTogetherInState: bool(),
  cohabitationFrom: date(),
  compelledSeparation: bool(),
  childUnmarriedDependent: bool(),
  custodyConsent: bool(),
  sponsorAdult: bool(),
  sponsorCategory: choice(['A', 'B', 'C']),
  sponsorIrish: bool(),
  sponsorLawfulAndResident: bool(),
  sponsorQualifyingFrom: date(),
  protectionRelationshipFormedAfterEntry: bool(),
  sponsorNaturalisedOn: date(),
};
const familyPermissionFields = {
  nextRenewalOn: date({ hint: 'nextRenewalOn' }),
  establishedFamilyPermission: bool(),
  dependentPeriods: periods({ label: 'dependentPeriods' }),
  change: group<NonNullable<IrelandFamily['change']>>(
    {
      kind: choice(['separation', 'death', 'domestic-abuse'], {
        label: 'changeKind',
        ...required,
      }),
      endedOn: date(),
      relationshipFrom: date(),
      lastCohabitationFrom: date(),
      notificationWorkingDays: integer(),
      approval: bool({ label: 'changeApproval' }),
      abusePermissionEvidence: bool(),
    },
    { paths: ['IE-STAMP4-INDEPENDENT-FAMILY'] },
  ),
};
export const familyFields: Fields<FamilyQuestions> = {
  ...familyRelationshipFields,
  ...familyPermissionFields,
  application: group<Application>(applicationFields),
};
/** Family sections; application facts are split over four of them. */
export const familySections: {
  title: string;
  path: string[];
  fields: IrelandFields;
}[] = [
  { title: 'famRelationship', path: [], fields: familyRelationshipFields },
  { title: 'famPermission', path: [], fields: familyPermissionFields },
  ...Object.entries(applicationSections).map(([title, fields]) => ({
    title,
    path: ['application'],
    fields,
  })),
];

export const stamp5Fields = {
  nonEea: bool(),
  validPermissionWhileProcessing: bool(),
  termsComplied: bool(),
  character,
  burden,
  employmentEfforts: bool(),
  passportAndIrpEvidence: bool(),
  bankEvidenceMonths: integer(),
  exceptionalTravelConfirmed: bool(),
  longestAnnualAbsenceMonths: number(),
  grantReceived: bool(),
  passportExpiresOn: date(),
  renewWithPassport: bool(),
} satisfies Fields<IrelandWcatt>;

type LtrFamily = NonNullable<IrelandLtr['family']>;
export const ltrFields = {
  registeredPeriods: list<NonNullable<IrelandLtr['registeredPeriods']>[number]>(
    {
      from: date(required),
      to: date({ hint: 'to' }),
      basis: choice(
        [
          'gep',
          'csep',
          'legacy-employment',
          'employment-stamp4',
          'hosting',
          'hosting-stamp4',
          'public-sho-registrar',
          'multi-site-doctor',
          'ict',
          'other-excluded',
          'uncertain',
        ],
        { label: 'ltrBasis', ...required },
      ),
      evidence: bool({ label: 'grantEvidence' }),
    },
    { hint: 'registeredPeriods' },
  ),
  councilRegisteredOn: date(),
  historicPublicDoctorEvidence: bool(),
  employment: choice(['employed', 'self-employed', 'unemployed'], {
    label: 'ltrEmployment',
  }),
  canContinueEmployment: bool(),
  termsComplied: bool(),
  pastBreachUnderReview: bool(),
  validPermission: bool({ label: 'ltrValidPermission' }),
  residenceAndApplicationEvidence: bool(),
  character,
  burden,
  family: group<LtrFamily>(
    {
      eligibleDependentRelationship: bool(),
      principalHoldsLtr: bool(),
      principalQualifyingPeriods: periods({
        label: 'principalQualifyingPeriods',
      }),
      dependentRegisteredPeriods: periods({
        label: 'dependentRegisteredPeriods',
      }),
    },
    { label: 'ltrFamily', paths: ['IE-LTR-FAMILY'] },
  ),
  // Renewal is asked as ltrStage.
  maintenance: group<Omit<NonNullable<IrelandLtr['maintenance']>, 'renewal'>>(
    {
      largestCalendarYearAbsenceDays: integer(),
      tripsPermittedOrExceptionConfirmed: bool(),
      workEffortsAndResidence: bool(),
      previousGrantYearsEvidence: bool(),
    },
    { hint: 'maintenance' },
  ),
  approvalLetterOn: date(),
  feePaidOn: date(),
  familyOrRenewalFeeConfirmed: bool(),
} satisfies Fields<IrelandLtr>;

type Treaty = IrelandTreatyResidence;
type Early = NonNullable<Treaty['early']>;
type Retention = NonNullable<Treaty['retention']>;
type TreatyDocument = NonNullable<Treaty['document']>;
export const treatySections = {
  treatyBasis: {
    role: choice(['citizen', 'family'], { label: 'treatyRole' }),
    qualifyingNationality: bool(),
    regulatedFreeMovementBasis: bool(),
    returningIrishOrDualNationality: bool(),
    qualifyingSponsor: bool(),
    sponsorStudent: bool(),
    relationship: choice(
      [
        'spouse',
        'civil-partner',
        'descendant',
        'ascendant',
        'other-dependent',
        'durable-partner',
        'care',
      ],
      { label: 'treatyRelationship' },
    ),
    dependency: bool(),
    relationshipEvidence: bool(),
    permittedFamilyApproval: bool(),
    nonEuFamily: bool(),
  },
  treatyResidence: {
    activities: list<IrelandTreatyActivity>(
      {
        from: date(required),
        to: date({ hint: 'to' }),
        basis: choice(
          [
            'initial',
            'employed',
            'self-employed',
            'self-sufficient',
            'student',
            'family',
            'retained-family',
            'registered-involuntary-unemployment',
            'temporary-incapacity',
            'vocational-training',
            'jobseeker',
            'ineligible',
          ],
          { label: 'activityBasis', ...required },
        ),
        verified: bool({ label: 'activityVerified' }),
        sufficientResources: bool(),
        comprehensiveSicknessInsurance: bool(),
        recognisedEducation: bool(),
        sufficientIdentity: bool(),
        unreasonableBurden: bool(),
        enteredOn: date(),
        previousWorkerFrom: date(),
        employmentEndedOn: date(),
        shortFixedTerm: bool(),
        trainingRelatedOrInvoluntary: bool(),
      },
      { hint: 'activities' },
    ),
    residenceAndTravelComplete: bool(),
    absences: list<NonNullable<Treaty['absences']>[number]>(
      {
        leftOn: date(required),
        returnedOn: date(),
        reason: choice(['temporary', 'military', 'important'], {
          label: 'absenceReason',
        }),
        exceptionConfirmed: bool(),
      },
      { label: 'treatyAbsences' },
    ),
    acquisition: choice(['ordinary', 'early', 'retained'], {
      blank: 'default',
    }),
    early: group<Early>({
      kind: choice(['retired', 'incapacity', 'frontier', 'worker-death'], {
        label: 'earlyKind',
      }),
      eventOn: date(),
      residenceFrom: date(),
      workFrom: date(),
      pensionAgeOrEarlyRetirementConfirmed: bool(),
      workerOrSelfEmployed: bool(),
      permanentIncapacityConfirmed: bool(),
      statePaidOccupationalInjuryBenefit: bool(),
      irishSpouseOrCivilPartner: bool(),
      homeInStateAndWeeklyReturns: bool(),
      worksInOtherMemberState: bool(),
      coResidingQualifiedFamily: bool(),
      occupationalDeath: bool(),
    }),
    retention: group<Retention>({
      event: choice(
        ['death', 'departure', 'dissolution', 'child-education-only'],
        {
          label: 'retentionEvent',
        },
      ),
      eventOn: date(),
      relationshipFrom: date(),
      livedInStateAsFamilyFrom: date(),
      sponsorHadRightOfResidence: bool(),
      sponsorStillInStateAtProceedings: bool(),
      custodyGranted: bool(),
      particularlyDifficultCircumstancesConfirmed: bool(),
      contactRightMustBeInState: bool(),
      contactChildDob: date(),
      personalBasis: choice(['work', 'self-support', 'qualified-family']),
      economicBasisConfirmed: bool(),
      resourcesAndCsi: bool(),
      determination: bool(),
    }),
  },
  treatyWa: {
    wa: group<NonNullable<Treaty['wa']>>(
      {
        britishOrQualifyingFamily: bool(),
        relevantStart: { type: 'datetime', hint: 'relevantStart' } as const,
        protectedBeforeAndContinued: bool(),
        familyCategory: choice([
          'already-resident',
          'prior-relationship',
          'later-child',
          'retention',
          'permitted-relative',
          'necessary-carer',
        ]),
        qualifyingFamilyEventConfirmed: bool(),
        recognisedWaScope: bool(),
        postLossScopeConfirmed: bool(),
      },
      { label: 'waScope' },
    ),
  },
  treatyDocument: {
    document: group<TreatyDocument>(
      {
        inState: bool({ label: 'documentInState' }),
        currentCardCategory: choice(['ordinary', 'permanent']),
        identityAndResidenceEvidence: bool(),
        currentCardExpiresOn: date(),
        filedOn: date(),
        addressAndStatusNotified: bool(),
        prolongedAbsenceNotified: bool(),
        publicInterest: choice(['clear', 'pending', 'restricting-order']),
        examRequested: bool(),
        examDone: bool(),
        priorPermanentRightOn: date(),
        postGrantAbsence: group<
          NonNullable<TreatyDocument['postGrantAbsence']>
        >({
          from: date({ label: 'absenceFrom', ...required }),
          returnedOn: date(),
        }),
        extraFeeRequested: bool(),
      },
      { label: 'treatyDocument' },
    ),
  },
};
export const treatyFields: Fields<Treaty> = {
  ...treatySections.treatyBasis,
  ...treatySections.treatyResidence,
  ...treatySections.treatyWa,
  ...treatySections.treatyDocument,
};

/**
 * What each pathway group assesses, asked on its own step. Unanswered is a new
 * application or upgrade; the engine reads it as the registration stage.
 */
export interface IrelandStages {
  workStage?: 'first' | 'renewal';
  /** 'application' also assesses a family application with independent Stamp 4. */
  familyStage?: 'application' | 'first' | 'renewal';
  stamp5Stage?: 'renewal';
  ltrStage?: 'renewal';
  euStage?: 'renewal';
  waStage?: 'renewal';
}
const stage = (
  options: readonly string[],
  paths: readonly IrelandFullPathwayId[],
  // Each hint lists the answers the chosen stage reads as met when blank.
  hint: string,
) => choice(options, { hint, blank: 'new', paths });

type TopQuestions = Omit<IrelandFullRequest, 'locale' | 'pathways'> &
  IrelandStages;
export const topFields = {
  simulationDate: date({ hint: 'simulationDate', ...required }),
  dateOfBirth: date(),
  birthplace: choice(place),
  currentLocation: choice(place, { hint: 'currentLocation' }),
  permissions: list<IePermission>(
    {
      kind: choice(IE_PERMISSION_KINDS, {
        label: 'permissionKind',
        ...required,
      }),
      from: date(required),
      to: date({ hint: 'permissionTo' }),
    },
    { hint: 'permissions', paths: STAMP_RECORD_PATHS, ...required },
  ),
  trips: list<IeTrip>(
    { departed: date(required), returned: date(required) },
    { hint: 'trips', paths: STAMP_RECORD_PATHS, ...required },
  ),
  marriedOn: date({ hint: 'marriedOn', paths: ['IE-SPOUSE'] }),
  workStage: stage(['first', 'renewal'], WORK_PATHS, 'workStage'),
  employmentStart: date({ hint: 'employmentStart', paths: WORK_PATHS }),
  registration: group<Omit<IrelandRegistration, 'stage'>>(registrationFields),
  citizenship: group<IrelandCitizenship>(citizenshipFields, {
    paths: NATURALISATION_PATHS,
  }),
  work: group<IrelandWorkUpgrade>(workFields, { paths: WORK_PATHS }),
  familyStage: stage(
    ['application', 'first', 'renewal'],
    FAMILY_PATHS,
    'familyStage',
  ),
  family: group<FamilyQuestions>(familyFields, { paths: FAMILY_PATHS }),
  stamp5Stage: stage(['renewal'], ['IE-STAMP5'], 'stamp5Stage'),
  stamp5: group<IrelandWcatt>(stamp5Fields, { paths: ['IE-STAMP5'] }),
  ltrStage: stage(['renewal'], LTR_PATHS, 'ltrStage'),
  ltr: group<IrelandLtr>(ltrFields, { paths: LTR_PATHS }),
  euStage: stage(['renewal'], ['IE-EU-PERMANENT'], 'treatyStage'),
  eu: group<Treaty>(treatyFields, { paths: ['IE-EU-PERMANENT'] }),
  waStage: stage(['renewal'], ['IE-WA-PERMANENT'], 'treatyStage'),
  wa: group<Treaty>(treatyFields, { paths: ['IE-WA-PERMANENT'] }),
} satisfies Fields<TopQuestions>;
