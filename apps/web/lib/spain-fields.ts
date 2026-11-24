import { ES_NATIONALITY_ROUTES } from '@uk-immigration/engine';
import type { esFormZh } from '../i18n/countries/spain-form';

type Suffix<P extends string> =
  Extract<
    keyof typeof esFormZh,
    `es.${P}.${string}`
  > extends `es.${P}.${infer S}`
    ? S
    : never;
export type SpainFieldName = Suffix<'field'>;
export type SpainOption = Suffix<'option'>;

export type SpainField = {
  name: string;
  label: SpainFieldName;
  hint?: Suffix<'form'>;
  required?: boolean;
  /** Household sizes count at least one person. */
  min?: number;
} & (
  | { type: 'boolean' | 'date' | 'number' | 'integer' | 'date-list' }
  | { type: 'choice'; options: readonly SpainOption[] }
  | {
      type: 'multi-choice';
      options: readonly SpainOption[];
      supportsUnknown?: boolean;
    }
  | {
      type: 'group' | 'list';
      fields: SpainField[];
      supportsUnknown?: boolean;
    }
);

const bool = (name: SpainFieldName, required = false): SpainField => ({
  name,
  label: name,
  type: 'boolean',
  required,
});
const flags = (...names: SpainFieldName[]) => names.map((name) => bool(name));
const date = (
  name: SpainFieldName,
  required = false,
  label = name,
  hint?: Suffix<'form'>,
): SpainField => ({ name, label, required, hint, type: 'date' });
const number = (name: SpainFieldName): SpainField => ({
  name,
  label: name,
  type: 'number',
});
const integer = (name: SpainFieldName, min?: number): SpainField => ({
  name,
  label: name,
  type: 'integer',
  min,
});
const choice = (
  name: SpainFieldName,
  options: readonly SpainOption[],
  required = false,
): SpainField => ({ name, label: name, type: 'choice', options, required });
const multiChoice = (
  name: SpainFieldName,
  options: readonly SpainOption[],
  supportsUnknown = false,
): SpainField => ({
  name,
  label: name,
  type: 'multi-choice',
  options,
  supportsUnknown,
});
const group = (name: SpainFieldName, fields: SpainField[]): SpainField => ({
  name,
  label: name,
  type: 'group',
  fields,
});
const list = (
  name: SpainFieldName,
  fields: SpainField[],
  supportsUnknown = true,
): SpainField => ({
  name,
  label: name,
  type: 'list',
  fields,
  supportsUnknown,
});
const dateList = (name: SpainFieldName): SpainField => ({
  name,
  label: name,
  type: 'date-list',
});

export const spainStep0Fields: SpainField[] = [
  date('simulationDate', true, 'simulationDate', 'simulationDateHint'),
];

export const spainHistoryFields: SpainField[] = [
  bool('timeRecordsComplete'),
  list('permits', [date('from', true), date('to'), bool('study', true)]),
  list('trips', [date('departed', true), date('returned', true)]),
];

export const spainNatTopFields: SpainField[] = [
  choice('route', ES_NATIONALITY_ROUTES),
  date('marriedToSpaniard'),
];

export const cefrLevels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'] as const;
const deleExemptCountries = [
  'AR',
  'BO',
  'CL',
  'CO',
  'CR',
  'CU',
  'EC',
  'SV',
  'GT',
  'GQ',
  'HN',
  'MX',
  'NI',
  'PA',
  'PY',
  'PE',
  'PR',
  'DO',
  'UY',
  'VE',
  'OTHER',
] as const;
const origins = [
  'ibero-american',
  'andorra',
  'philippines',
  'equatorial-guinea',
  'portugal',
  'other',
] as const;

export const spainNatSections = {
  natRoute: [
    choice('refugeeStatus', [
      'recognised-in-spain',
      'foreign-recognition-under-review',
      'asylum-applicant',
      'subsidiary-protection',
      'stateless',
      'none',
    ]),
    date('refugeeEvidenceIssued'),
    choice('originalNationalityForPermit', [...origins, 'authority-review']),
    bool('sephardicEvidenceAccepted'),
    date('spouseSpanishFrom'),
    bool('unseparatedAndCohabitationDocumented'),
    list('diplomaticPosting', [date('from', true), date('to')]),
    choice('oneYearGround', [
      'birth',
      'missed-option',
      'guardianship',
      'widowed',
      'descent',
    ]),
    bool('spanishCivilBirthRecord'),
    choice('optionBasis', [
      'ordinary',
      'never-expires',
      'late-emancipation',
      'support-ended',
      'official-expiry',
      'none',
    ]),
    bool('optionUnexercisedAndDocumented'),
    date('optionEventDate'),
    bool('qualifyingGuardianshipDocumented'),
    date('guardianshipFrom'),
    date('guardianshipTo'),
    date('widowSpanishSpouseDied'),
    ...flags('widowUnseparatedAtDeath', 'widowCertificatesAndCohabitation'),
    bool('bornOutsideSpain'),
    choice('spanishByOriginAncestor', ['parent', 'grandparent', 'none']),
    bool('descentChainDocumented'),
  ],
  natCapacity: [
    date('birthDate'),
    bool('emancipated'),
    choice('applicantSignature', [
      'self',
      'assisted',
      'representative',
      'authorised-agent',
    ]),
    ...flags(
      'representationDocumented',
      'necessarySupportProvided',
      'continuityDecision',
    ),
    group(
      'criminalRecords',
      flags(
        'spanishRecordOrQuery',
        'originRecordOrLawfulAlternative',
        'militaryProcedureIfApplicable',
      ),
    ),
    bool('conductAndSecurityDecision'),
  ],
  natExams: [
    choice('deleEvidence', [
      'dele',
      'registered-official-equivalent',
      'equivalence-pending',
      'none',
    ]),
    choice('deleLevel', cefrLevels),
    multiChoice('documentedNationalities', deleExemptCountries),
    group('ccse', [
      integer('correct'),
      bool('verifiedPass'),
      date('issued'),
      date('validThrough'),
    ]),
    choice('examRelief', [
      'none',
      'spanish-eso-diploma',
      'full-dispensation',
      'judicial-exemption-confirmed',
      'adapted-exams',
      'denied',
      'pending',
    ]),
    date('dispensaRequestedOn'),
    bool('registeredWithSchoolOrCareCentre'),
    date('primarySchoolStartsOn'),
    ...flags('schoolOrCareCertificateIfRequired', 'integrationDecision'),
    group('examBooking', [
      date('date'),
      choice('deleCountry', ['ES', 'OTHER']),
      choice('deleLevel', cefrLevels),
      date('ccseRetakeFrom'),
    ]),
  ],
  natFiling: [
    group(
      'documents',
      flags(
        'applicationForm',
        'identity',
        'birthRecord',
        'residence',
        'address',
        'foreignDocumentFormalities',
        'previousPassportsIfRequired',
      ),
    ),
    bool('feePaid'),
    date('feePaidOn'),
    date('followUpDate'),
    date('grantNotifiedOn'),
    date('declarationOn'),
    bool('declarationCompleted'),
    date('confirmedDeclarationDeadline'),
    ...flags(
      'notarialSuspensionAwaitingConfirmation',
      'canDeclareInPerson',
      'oathOrMilitaryEvidence',
    ),
    choice('renunciationBasis', [...origins, 'french', 'spanish-sephardic']),
    ...flags(
      'declaredRenunciation',
      'civilNeighbourhoodChosen',
      'competentRegistryOrNotary',
    ),
    date('registeredOn'),
    bool('registrationCompleted'),
  ],
} satisfies Record<string, SpainField[]>;

export const applicationFeeFields: SpainField[] = [
  ...flags('exemptPublicGuardian', 'paid'),
  number('amount'),
  integer('workingDaysAfterAdmission'),
];

export const healthCoverFields: SpainField[] = [
  choice('kind', ['public', 'private', 'none', 'other']),
  ...flags('entitledOrAuthorized', 'equivalentCoverage'),
  date('validFrom'),
  date('validTo'),
  bool('proof'),
];

export const familyResourcesFields: SpainField[] = [
  integer('familySize', 1),
  number('eligibleMonthlyIncome'),
  list('income', [
    choice(
      'kind',
      [
        'gross-pay',
        'net-business',
        'taxable-capital-gain',
        'gross-pension',
        'maintenance-for-person-joining',
        'study-or-housing-aid',
        'other-maintenance',
        'social-assistance',
      ],
      true,
    ),
    number('amount'),
    bool('eligibleHouseholdMember'),
  ]),
  bool('stable'),
  choice('reduction', ['granted', 'pending', 'none']),
  bool('additionalAssetsUnderReview'),
  number('sixMonthAverageAssets'),
  choice('sufficiencyDecision', ['accepted', 'refused']),
];

export const spainResidenceSections = {
  resCommon: [
    ...flags(
      'thirdCountryRegime',
      'entryRestrictionsClear',
      'noReturnCommitmentClear',
      'inSpain',
      'residentInSpain',
      'validIdentityDocument',
      'competentOfficeAndApplication',
    ),
    date('permitExpiry'),
    bool('filingWindowAccepted'),
    dateList('officeHolidays'),
    bool('criminalCertificatesWhereRequired'),
    choice('securityDecision', ['clear', 'threat', 'pending']),
    group('fee', applicationFeeFields),
  ],
  resNational: [
    multiChoice(
      'nationalAlternatives',
      [
        'retirement',
        'disability',
        'spanish-birth',
        'former-spaniard',
        'public-care',
        'protection',
        'contribution',
      ],
      true,
    ),
    bool('spanishContributoryRetirement'),
    choice('disabilityBenefit', [
      'spanish-contributory-absolute-or-severe',
      'analogous-spanish',
      'other',
    ]),
    ...flags(
      'analogousLifelongNonCapitalisable',
      'analogousSufficiencyAccepted',
    ),
    date('birthDate'),
    ...flags(
      'bornInSpainDocumented',
      'birthRouteContinuityAccepted',
      'atMajorityAccepted',
      'lostSpanishNationalityOfOriginDocumented',
    ),
    group('spanishPublicGuardianship', [date('from', true), date('to')]),
    bool('validRecognizedProtectionInEu'),
    choice('contributionDecision', ['granted', 'refused', 'proposed']),
    group('schooling', [
      list('children', [
        date('birthDate'),
        bool('standardSpanishSchooling'),
        date('primarySchoolStartsOn'),
        bool('enrolledWithProof'),
      ]),
      date('noticeDate'),
      date('cureDeadline'),
    ]),
  ],
  resEu: [
    list('periods', [
      date('from', true),
      date('to'),
      choice('territory', ['spain', 'other-eu'], true),
      choice(
        'kind',
        [
          'residence',
          'study',
          'volunteering',
          'training',
          'blue-card',
          'highly-qualified',
          'research',
          'protection',
          'asylum-wait',
          'temporary-only',
          'unclassified',
        ],
        true,
      ),
      bool('protectionGranted'),
      date('protectionDecisionDate'),
    ]),
    list('tripDetails', [
      date('departed', true),
      date('returned', true),
      choice('reason', ['ordinary', 'work', 'force-majeure', 'cooperation']),
      ...flags('exceptionDocumented', 'irregularExit', 'outsideEu'),
    ]),
    group('blueMobility', [
      bool('exercisedLawfully'),
      date('firstCardFrom'),
      date('moveDate'),
      ...flags('movedPreviously', 'priorPeriodsDocumented'),
    ]),
    group('resources', familyResourcesFields),
    group('insurance', healthCoverFields),
  ],
} satisfies Record<string, SpainField[]>;

const mobilityApplicationCommon: SpainField[] = [
  date('filedOn'),
  bool('beforeEntry'),
  date('enteredOn'),
  dateList('officeHolidays'),
  ...flags(
    'thirdCountryNational',
    'validPassportOrTravelDocument',
    'signedEx11',
    'competentOffice',
  ),
];

const mobilityGrantFields: SpainField[] = [
  date('notifiedOn'),
  bool('inSpainWhenNotified'),
  date('enteredAfterGrantOn'),
  date('registeredSocialSecurityOn'),
  date('appliedForCardOn'),
  date('permitEnd'),
  choice('cardCategory', [
    'initial-temporary',
    'renewed-temporary',
    'public-ward',
  ]),
  number('cardFeePaidEur'),
];

export const spainMobilitySections = {
  mobCommon: [
    choice('otherMemberStatus', [
      'eu-long-term',
      'national-only',
      'none',
      'unconfirmed',
    ]),
    choice('purpose', [
      'non-working',
      'employment',
      'self-employment',
      'exempt-work',
    ]),
  ],
  mobHolder: [
    group('holder', [
      ...mobilityApplicationCommon,
      ...flags('statusDocument', 'noRefusalAlert', 'noReturnBar'),
      choice('securityDecision', ['cleared', 'adverse', 'pending']),
      group('nonWorking', [
        integer('dependants'),
        number('monthlyNonWorkIncome'),
        number('availableCapitalEur'),
        integer('confirmedCoverageMonths'),
        ...flags(
          'sourceAndAvailabilityDocumented',
          'accommodationAvailable',
          'accommodationDocumented',
        ),
      ]),
      group('employment', [
        date('birthDate'),
        ...flags(
          'minorConditionsAndConsent',
          'signedContinuousContract',
          'startsWhenPermitEffective',
          'compliesWithCollectiveAgreement',
          'qualifiedForOccupation',
        ),
        number('annualGrossSalary'),
        group('employer', [
          choice('kind', ['individual', 'company']),
          ...flags('taxAndSocialSecurityCurrent', 'projectAndPayrollSupported'),
          integer('householdSize', 1),
          number('monthlyResourcesAfterGrossSalary'),
        ]),
      ]),
      group(
        'selfEmployment',
        flags(
          'businessPermits',
          'professionalQualifications',
          'investmentAndJobsSupported',
        ),
      ),
      group('exemptWork', [
        choice('basis', [
          'public-research',
          'university',
          'cultural-institution',
          'intergovernmental-cooperation',
          'correspondent',
          'scientific-mission',
          'religious',
          'international-organisation-representative',
          'eu-posting',
          'specific-performance',
          'none',
        ]),
        ...flags(
          'activityAndInstitutionQualify',
          'formalEvidence',
          'specificPerformanceAccepted',
        ),
      ]),
      group('healthCover', [
        ...healthCoverFields,
        bool('coversFamilyMember'),
      ]),
      group('fee', applicationFeeFields),
      ...flags(
        'separateWorkFeeRequired',
        'separateWorkFeePaid',
        'spanishEuLongTermGranted',
      ),
      group('grant', mobilityGrantFields),
    ]),
  ],
  mobFamily: [
    group('family', [
      ...mobilityApplicationCommon,
      ...flags('priorFamilyUnitAndResidenceProved', 'noRefusalAlert'),
      date('principalFiledOn'),
      choice('principalDecision', ['granted', 'refused', 'pending']),
      group('relationship', [
        choice('kind', [
          'spouse',
          'partner',
          'child',
          'represented',
          'ascendant',
          'other',
        ]),
        date('birthDate'),
        ...flags(
          'soleGenuineUnseparatedSpouse',
          'previousMarriagesResolved',
          'exclusivePartnershipEffectiveInSpain',
          'childOfSponsorOrPartner',
          'adoptionRecognisedIfApplicable',
        ),
        choice('custodyArrangement', ['child-of-both', 'sole', 'shared']),
        choice('relocationPermission', [
          'consent',
          'court-order',
          'not-granted',
        ]),
        ...flags(
          'soleCustodyAndSupportIfApplicable',
          'disabledAndUnableToProvideForSelf',
          'legalRepresentationValidInSpain',
          'unableToProvideForSelfDueToHealth',
          'dependentFirstDegreeAscendant',
          'residenceInSpainNecessary',
          'humanitarianGroundsApproved',
        ),
      ]),
      group('resources', familyResourcesFields),
      group('healthCover', healthCoverFields),
      group('fee', applicationFeeFields),
      group('grant', mobilityGrantFields),
    ]),
  ],
} satisfies Record<string, SpainField[]>;

export const spainRecoverySections = {
  recStatus: [
    choice('previousStatus', ['national', 'eu', 'neither']),
    choice('ground', [
      'outside-eu',
      'another-eu-status',
      'outside-spain',
      'voluntary-return',
      'expired-card',
      'other',
    ]),
    choice('lossDecision', ['confirmed', 'retained', 'pending']),
    date('outsideSpainSince'),
    bool('derivedFromReunification'),
    date('birthDate'),
    date('returnCommitmentFrom'),
    list('visitsDuringCommitment', [
      date('enteredSpain', true),
      date('leftSpain', true),
    ]),
    bool('visitsLawful'),
  ],
  recFiling: [
    choice('place', ['spain', 'consulate']),
    ...flags(
      'correctOfficeAndSignedForm',
      'lawfulStay',
      'noEntryAlert',
      'recognizedTravelDocument',
    ),
    date('passportExpires'),
    ...flags(
      'subjectToCriminalRecordRequirement',
      'clearRecordsInAllCountries',
      'publicOrderAndSecurityCleared',
      'publicHealthCleared',
      'consularRequirementsConflict',
      'regularResourcesDocumented',
      'resourcesAcceptedAsSufficient',
    ),
    group('insurance', healthCoverFields),
    group('fee', applicationFeeFields),
    choice('consularVisa', [
      'issued-and-paid',
      'confirmed-exempt',
      'refused',
      'unconfirmed',
    ]),
    date('lawfulEntry'),
    date('grantNotification'),
    date('cardApplied'),
    dateList('officeHolidays'),
  ],
} satisfies Record<string, SpainField[]>;

export const spainLongTermCardFields: SpainField[] = [
  choice('operation', ['first', 'renew']),
  date('triggerDate'),
  date('expiry'),
  date('applied'),
  bool('validIdAndPhoto'),
  number('cardFeePaid'),
  ...flags('publicWard', 'nationalConditionsRetained'),
  date('birthDate'),
  bool('validityConfirmedAtAgeBoundary'),
  choice('decision', ['lost', 'held', 'pending']),
  bool('otherLossGround'),
  list('absences', [
    date('departed', true),
    date('returned'),
    choice('area', ['outside-eu', 'outside-spain'], true),
  ]),
  list('outsideSpainPeriods', [date('departed', true), date('returned')]),
  ...flags(
    'formerBlueCardOrQualifyingFamily',
    'qualifyingCooperation',
    'shortReturnDisputed',
  ),
  dateList('officeHolidays'),
];

const freeMovementPeriodFields: SpainField[] = [
  date('from', true),
  date('to'),
  choice(
    'basis',
    [
      'employment',
      'self-employment',
      'resources',
      'student',
      'temporary-incapacity',
      'unemployed',
      'training',
      'qualifying-family',
      'other',
    ],
    true,
  ),
  ...flags(
    'documented',
    'allRiskInsurance',
    'sufficientMeansAccepted',
    'singleHousehold',
  ),
  number('annualMeans'),
  ...flags('recognizedCourse', 'resourceDeclaration'),
  date('employmentStarted'),
  ...flags(
    'involuntaryAndRegistered',
    'fixedTermUnderOneYear',
    'continuedWorkerStatusRecognized',
    'trainingRelatedOrInvoluntaryUnemployment',
  ),
];

const freeMovementTripFields: SpainField[] = [
  date('departed', true),
  date('returned', true),
  choice('reason', [
    'ordinary',
    'military',
    'important',
    'cooperation-or-eu-study',
    'unconfirmed',
  ]),
];

export const spainFreeMovementSections = {
  fmIdentity: [
    choice('person', ['eu-eea-swiss', 'third-country-family', 'other']),
    choice('sponsor', ['eu-eea-swiss', 'spanish', 'other']),
    ...flags(
      'spanishFreeMovementConfirmed',
      'transitionalEuRegimeConfirmed',
      'accompanyingOrJoining',
    ),
    choice('relationship', [
      'spouse',
      'registered-partner',
      'descendant',
      'ascendant',
      'extended-relative',
      'durable-partner',
      'other',
    ]),
    ...flags(
      'relationshipDocumented',
      'studentSponsor',
      'dependent',
      'incapacitated',
    ),
    date('birthDate'),
    date('previouslyCohabitedFrom'),
    date('previouslyCohabitedUntil'),
    ...flags(
      'personalCareNecessary',
      'commonChildAndStableCohabitation',
      'extendedFamilyRecognized',
    ),
    date('residenceFrom'),
    date('jointResidenceFrom'),
  ],
  fmHistory: [
    list('history', freeMovementPeriodFields),
    list('trips', freeMovementTripFields),
    ...flags('noExecutedExpulsion', 'continuityAccepted'),
  ],
  fmRetentionEarly: [
    choice('retainedEvent', [
      'sponsor-death',
      'child-in-education',
      'divorce',
    ]),
    date('eventDate'),
    date('divorceProceedingsStartedOn'),
    bool('eventReported'),
    date('priorFamilyResidenceFrom'),
    bool('continuingChildEducationAndCustody'),
    date('relationshipFrom'),
    ...flags(
      'custodyOrAccessInSpain',
      'exceptionalHardshipProved',
      'retainedStatusAccepted',
    ),
    choice('earlyBasis', [
      'retirement',
      'incapacity',
      'cross-border',
      'worker-family',
      'death-at-work',
    ]),
    date('workStopped'),
    date('employmentFrom'),
    bool('qualifiedWorker'),
    date('workerResidenceFrom'),
    group('workerResidenceEvidence', [
      list('history', freeMovementPeriodFields),
      list('trips', freeMovementTripFields),
      ...flags('noExecutedExpulsion', 'continuityAccepted'),
    ]),
    ...flags('pensionContributionsQualified', 'pensionEligibilityDecided'),
    integer('contributionMonths'),
    ...flags(
      'earlyEmployeeRetirement',
      'spanishSpouseExemption',
      'permanentIncapacity',
      'occupationalSpanishBenefit',
      'workingInAnotherMemberState',
      'retainedSpanishHome',
      'returnsAtLeastWeekly',
      'coResidentWithWorker',
      'workerAcquiredEarly',
      'diedDuringWorkBeforePermanent',
      'occupationalDeath',
      'spouseLostSpanishNationalityThroughMarriage',
    ),
  ],
  fmPostCard: [
    date('acquiredOn'),
    group('longestPostAcquisitionAbsence', [
      date('departed', true),
      date('returned', true),
    ]),
    ...flags('postAcquisitionTravelComplete', 'noOfficialRestriction'),
    group('document', [
      ...flags('validIdOrRenewal', 'entitlementDocuments', 'ex19'),
      integer('photos'),
      { ...number('feePaid'), label: 'euDocumentFeePaid' },
      date('priorCardExpiry'),
      date('applied'),
      dateList('officeHolidays'),
    ]),
  ],
} satisfies Record<string, SpainField[]>;
