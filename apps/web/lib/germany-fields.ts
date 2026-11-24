import {
  DE_PERMIT_KINDS,
  DE_UNLIMITED_KINDS,
  type DeFullRoute,
  type DePermitKind,
} from '@uk-immigration/engine';
import type { deFormZh } from '../i18n/countries/germany-form';

type Suffix<P extends string> =
  Extract<
    keyof typeof deFormZh,
    `de.${P}.${string}`
  > extends `de.${P}.${infer S}`
    ? S
    : never;
export type GermanyFieldName = Suffix<'field'>;
export type GermanyOption = Suffix<'option'>;
export type GermanyHint = Suffix<'form'>;

export type GermanyField = {
  name: string;
  label: GermanyFieldName;
  hint?: GermanyHint;
  required?: boolean;
  actualDate?: true;
  when?: (record: Record<string, unknown>) => boolean;
} & (
  | {
      type:
        | 'boolean'
        | 'date'
        | 'month'
        | 'text'
        | 'number'
        | 'integer'
        | 'number-list'
        | 'integer-list';
    }
  | {
      type: 'nullable-date';
      nullLabel: 'validAtSimulation' | 'ordinaryReturnLimit';
    }
  | { type: 'choice' | 'choice-list'; options: readonly GermanyOption[] }
  | { type: 'group' | 'list'; fields: GermanyField[] }
);

const bool = (
  name: GermanyFieldName,
  required = false,
  when?: GermanyField['when'],
): GermanyField => ({
  name,
  label: name,
  type: 'boolean',
  required,
  when,
});
const flags = (...names: GermanyFieldName[]) => names.map((name) => bool(name));
const date = (
  name: GermanyFieldName,
  required = false,
  label = name,
  hint?: GermanyHint,
  when?: GermanyField['when'],
): GermanyField => ({ name, label, required, hint, when, type: 'date' });
const actualDate = (...args: Parameters<typeof date>): GermanyField => ({
  ...date(...args),
  actualDate: true,
});
const nullableDate = (
  name: GermanyFieldName,
  nullLabel: 'validAtSimulation' | 'ordinaryReturnLimit',
): GermanyField => ({
  name,
  label: name,
  type: 'nullable-date',
  nullLabel,
});
const month = (name: GermanyFieldName, required = false): GermanyField => ({
  name,
  label: name,
  required,
  type: 'month',
});
const text = (name: GermanyFieldName): GermanyField => ({
  name,
  label: name,
  type: 'text',
});
const number = (
  name: GermanyFieldName,
  required = false,
  when?: GermanyField['when'],
): GermanyField => ({
  name,
  label: name,
  type: 'number',
  required,
  when,
});
const integer = (
  name: GermanyFieldName,
  required = false,
  when?: GermanyField['when'],
): GermanyField => ({
  name,
  label: name,
  type: 'integer',
  required,
  when,
});
const integerList = (
  name: GermanyFieldName,
  when?: GermanyField['when'],
): GermanyField => ({
  name,
  label: name,
  type: 'integer-list',
  when,
});
const numberList = (name: GermanyFieldName): GermanyField => ({
  name,
  label: name,
  type: 'number-list',
});
const choice = (
  name: GermanyFieldName,
  options: readonly GermanyOption[],
  required = false,
  when?: GermanyField['when'],
): GermanyField => ({
  name,
  label: name,
  type: 'choice',
  options,
  required,
  when,
});
const choiceList = (
  name: GermanyFieldName,
  options: readonly GermanyOption[],
): GermanyField => ({
  name,
  label: name,
  type: 'choice-list',
  options,
});
const group = (
  name: GermanyFieldName,
  fields: GermanyField[],
  when?: GermanyField['when'],
): GermanyField => ({
  name,
  label: name,
  type: 'group',
  fields,
  when,
});
const list = (
  name: GermanyFieldName,
  fields: GermanyField[],
  hint?: GermanyHint,
): GermanyField => ({
  name,
  label: name,
  type: 'list',
  fields,
  hint,
});

export const GERMANY_ROUTE_GROUPS = {
  settlement: [
    'R01',
    'R02',
    'R03',
    'R04',
    'R05',
    'R05-fast',
    'R06',
    'R09',
    'R10',
    'R11',
    'R12',
    'R13',
    'R14',
    'R15',
  ],
  citizenship: ['R07', 'R08', 'R16', 'R17'],
  mobility: ['R00', 'R18'],
} as const satisfies Record<string, readonly DeFullRoute[]>;

const decisionOptions = ['accepted', 'refused', 'pending'] as const;
const rulingOptions = ['granted', 'pending', 'denied'] as const;
const cefrLevels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'] as const;
const hasPermitEndDate = (row: Record<string, unknown>) =>
  !DE_UNLIMITED_KINDS.includes(row.kind as DePermitKind);

export const basicFields = (needsFirstEntry: boolean): GermanyField[] => [
  date('simulationDate', true, 'simulationDate', 'simulationDateHint'),
  ...(needsFirstEntry
    ? [actualDate('firstEntry', true, 'firstEntry', 'firstEntryHint')]
    : [actualDate('firstEntry', false, 'firstEntry', 'firstEntryHint')]),
  actualDate('birthDate'),
];

export const permitFields: GermanyField[] = [
  choice('kind', DE_PERMIT_KINDS, true),
  date('from', true),
  date('to', false, 'to', undefined, hasPermitEndDate),
  bool('renewing', false, hasPermitEndDate),
  bool('protectedResettlement', false, (row) => row.kind === 'resettlement'),
];

export const tripFields: GermanyField[] = [
  date('departed', true),
  date('returned', true),
];

const titleKinds = [
  ...DE_PERMIT_KINDS,
  'blue-card-family',
  'ict',
  'visa',
] as const;

export const titleTripFields: GermanyField[] = [
  date('departed', true),
  date('returned'),
  bool('nonTemporary'),
  nullableDate('approvedReturnBy', 'ordinaryReturnLimit'),
  choice('exception', [
    'none',
    'eu-mobility',
    'military',
    'forced-marriage',
    'refugee-document',
  ]),
  date('militaryDischargedOn'),
  date('coercionEndedOn'),
  bool('qualifiesUnder37'),
  list('outsideArea', [date('from', true), date('to')]),
];

export const titleReviewFields: GermanyField[] = [
  choice('kind', titleKinds, true),
  date('from'),
  nullableDate('validTo', 'validAtSimulation'),
  ...flags('continuingUnder81', 'noOtherLossEvent', 'protectedResettlement'),
  number('lawfulYears'),
  bool('spouseHasQualifyingLongResidence'),
  integer('ageOnDeparture'),
  ...flags(
    'germanSpouseLivingTogether',
    'livelihoodSecured',
    'noListedExpulsionInterest',
    'priorBlueCardOrQualifyingFamilyTitle',
    'multipleEntryVisa',
  ),
  integer('visaDurationDays'),
  list('trips', titleTripFields),
];

export const historyFields: GermanyField[] = [
  list('permits', permitFields, 'permitsHint'),
  list('trips', tripFields, 'tripsHint'),
  list('titles', titleReviewFields, 'titlesHint'),
];

export const householdFields: GermanyField[] = [
  choiceList('members', [
    'single',
    'partner',
    'otherAdult',
    'child14to17',
    'child6to13',
    'childUnder6',
  ]),
  number('countableMonthlyIncome'),
  number('warmRent'),
  number('additionalNeeds'),
  number('uncoveredPremiums'),
  ...flags('sustainable', 'scopeAndDeductionsConfirmed'),
];

export const commonSections = {
  commonIdentity: [
    ...flags('identityEstablished', 'nationalityEstablishedOrNotRequired'),
    choice('passport', [
      'valid',
      'recognised-substitute',
      'unconfirmed',
      'none',
    ]),
    bool('capableOrRepresented'),
    choice('humanitarianIdentityOrPassportWaiver', rulingOptions),
    bool('evidenceAndAttendance'),
    choice('entry', [
      'required-visa-and-disclosed',
      'domestic-application',
      'waived',
      'waiver-pending',
      'insufficient',
    ]),
    choice('security', [
      'no-known-ground',
      'authority-cleared',
      'investigation',
      'weighing',
      'refusal-ground',
    ]),
    choice('securityAuthority', ['clear', 'pending', 'refused']),
    choice('address', [
      'registered',
      'authority-accepted',
      'exempt',
      'unverified',
      'wrong-jurisdiction',
    ]),
    actualDate('movedOn'),
    actualDate('registeredOn'),
    choice('transition', [
      'ordinary',
      'pre-2005',
      'pending',
      'authority-applied',
    ]),
  ],
  commonLivelihood: [
    bool('livelihoodConfirmed'),
    choice('benefits', [
      'none-or-permitted',
      'disqualifying-entitlement',
      'unclassified',
    ]),
    choice('livelihoodMedicalWaiver', rulingOptions),
    group('household', householdFields),
    choiceList('insurance', [
      'statutory',
      'family',
      'equivalent-confirmed',
      'unconfirmed',
      'none',
    ]),
    choice('insuranceWaiver', rulingOptions),
  ],
  commonPensionWork: [
    integer('contributionMonths'),
    integer('creditedCareMonths'),
    bool('spouseInHousehold'),
    integer('spouseContributionMonths'),
    bool('recognisedEducation'),
    choice('pensionEquivalentOrMedicalWaiver', rulingOptions),
    ...flags(
      'employmentAuthorisedOrNotRequired',
      'permanentProfessionalPermissionOrNotRequired',
      'spouseEmploymentAuthorised',
      'spouseProfessionalPermission',
    ),
  ],
  commonLanguageHousing: [
    choice('provenGerman', [...cefrLevels, 'none']),
    ...flags(
      'integrationCoursePassed',
      'simpleSpokenGerman',
      'courseRightOrDutyException',
    ),
    choice('languageWaiver', rulingOptions),
    choice('knowledgeEvidence', [
      'school',
      'interview-accepted',
      'none',
      'pending',
    ]),
    integer('orientationScore'),
    choice('knowledgeWaiver', rulingOptions),
    group('housing', [
      bool('authorityAccepted'),
      number('localMinimumM2'),
      number('usableM2'),
      bool('qualityAndOccupancyConfirmed'),
      integerList('householdAges'),
    ]),
  ],
} satisfies Record<string, GermanyField[]>;

export const blueCardEmploymentFields: GermanyField[] = [
  month('firstMonth', true),
  month('lastMonth', true),
  text('jobId'),
  date('startedOn'),
  date('endedOn'),
  number('countableAnnualGross'),
  choice('payBand', ['standard', 'reduced']),
  ...flags(
    'qualifyingWork',
    'pensionForSameMonths',
    'historicalPayAccepted',
    'historicalPayReviewPending',
  ),
];

export const blueCardFields: GermanyField[] = [
  ...flags('fastTrack', 'cardHeldAtDecision'),
  choice('language', ['below-A1', ...cefrLevels]),
  ...flags(
    'languageWaiverAcceptedForTier',
    'languageWaiverPendingForTier',
    'creditBeforeInterruption',
  ),
  number('countableAnnualGross'),
  integer('contractMonths'),
  ...flags(
    'jobInGermanyMatchesQualification',
    'requiredLicencesHeld',
    'genuineEmployment',
    'noExclusionUnder19f',
  ),
  choice('qualification', ['academic', 'equivalent-tertiary', 'none']),
  bool('recognisedQualification'),
  number('tertiaryProgrammeYears'),
  integer('tertiaryLevel'),
  text('isco'),
  actualDate('degreeOn'),
  date('applicationOn'),
  actualDate('firstGraduateCardOn'),
  ...flags('renewal', 'employmentAgencyApproved'),
  number('relevantItYearsInLookback'),
  bool('itExperienceNeededForJob'),
  actualDate('employmentStartedOn'),
  actualDate('latestRelevantChangeOn'),
  bool('changeReported'),
  choice('jobChangeDecision', ['clear', 'suspended', 'rejected']),
  list('employment', blueCardEmploymentFields, 'blueCardEmploymentHint'),
];

export const freeMovementFields: GermanyField[] = [
  ...flags('withinPersonalScope', 'permanentRightPreviouslyAcquired'),
  list('periods', [
    date('from', true),
    date('to'),
    choice('basis', [
      'work',
      'self-employment',
      'services',
      'seeking-work',
      'inactive',
      'family',
      'retained',
      'none',
    ]),
    bool('seekingWithGenuineProspects'),
    date('searchSince'),
    ...flags(
      'resourcesAndInsurance',
      'familyRightConfirmed',
      'retainedPersonalRightConfirmed',
    ),
  ]),
  numberList('annualOrdinaryAbsenceMonths'),
  list('importantAbsences', [number('months', true), bool('reasonAccepted')]),
  group('early', [
    choice(
      'basis',
      [
        'none',
        'retirement',
        'disability',
        'frontier',
        'bereaved',
        'family-of-worker',
      ],
      true,
    ),
    bool('qualifyingWorker', false, (r) =>
      Boolean(r.basis && r.basis !== 'none'),
    ),
    number('continuousResidenceYearsAtEvent', false, (r) =>
      Boolean(r.basis && r.basis !== 'none'),
    ),
    number('finalMonthsWorked', false, (r) =>
      Boolean(r.basis && r.basis !== 'none'),
    ),
    integer('ageAtRetirement', false, (r) =>
      Boolean(r.basis && r.basis !== 'none'),
    ),
    bool('retiredUnderEarlyScheme', false, (r) =>
      Boolean(r.basis && r.basis !== 'none'),
    ),
    bool('ceasedBecauseFullyIncapacitated', false, (r) =>
      Boolean(r.basis && r.basis !== 'none'),
    ),
    bool('occupationalInjuryWithGermanPension', false, (r) =>
      Boolean(r.basis && r.basis !== 'none'),
    ),
    bool('spouseNationalityException', false, (r) =>
      Boolean(r.basis && r.basis !== 'none'),
    ),
    number('continuousGermanWorkYears', false, (r) =>
      Boolean(r.basis && r.basis !== 'none'),
    ),
    bool('worksInOtherMemberState', false, (r) =>
      Boolean(r.basis && r.basis !== 'none'),
    ),
    bool('retainsGermanHome', false, (r) =>
      Boolean(r.basis && r.basis !== 'none'),
    ),
    bool('returnsWeekly', false, (r) => Boolean(r.basis && r.basis !== 'none')),
    bool('familyWasResidentWithWorker', false, (r) =>
      Boolean(r.basis && r.basis !== 'none'),
    ),
    bool('occupationalDeath', false, (r) =>
      Boolean(r.basis && r.basis !== 'none'),
    ),
    bool('survivingPartnerNationalityException', false, (r) =>
      Boolean(r.basis && r.basis !== 'none'),
    ),
    bool('workerAcquiredEarlyRight', false, (r) =>
      Boolean(r.basis && r.basis !== 'none'),
    ),
  ]),
  list('subsequentTrips', [
    date('departed', true),
    date('returned'),
    bool('nonTemporary'),
  ]),
  choice('lossDecision', ['clear', 'pending', 'lost']),
];

export const settlementRouteFields = {
  R02: [
    bool('trainedInGermany'),
    bool('skilledQualification'),
    choice('currentSkilledPost', [
      'qualified',
      'research',
      'blue-card',
      'proposed',
      'ended',
      'ineligible',
      'unconfirmed',
    ]),
    choice('skilledAlternativePension', decisionOptions),
    group('initialSkilledPermit', [
      date('appliedOn', true),
      ...flags(
        'jobAndQualificationRecognised',
        'occupationalLicenceAndBA',
        'genuineOfferConfirmed',
      ),
      number('annualGrossSalary'),
      bool('adequatePension'),
      choice('publicInterestException', decisionOptions),
    ]),
  ],
  R03: [
    integer('blueCardEmploymentMonths'),
    bool('germanB1'),
    group('blueCard', blueCardFields),
  ],
  R04: [
    choice('germanFamilyBasis', [
      'spouse',
      'child',
      'parent',
      'other-recognised',
      'none',
    ]),
    bool('germanFamilyLifeInGermany'),
    actualDate('germanChildBirthDate'),
    ...flags('familyChildUnmarried', 'parentCareRecognised'),
    choice('continuedFamilyBasis', decisionOptions),
    choice('germanFamilyIncomeException', [
      'approved',
      'parent-own-income',
      'pending',
      'none',
    ]),
    ...flags(
      'parentOwnIncomeSufficient',
      'householdShortfallOnlyGermanMembers',
    ),
  ],
  R05: [
    bool('germanC1'),
    choice('protectionTitle', [
      'section25-asylum',
      'section25-refugee',
      'section23-4',
      'legacy-resettlement',
      'other',
    ]),
    bool('resettlementWithdrawalGrounds'),
    choice('bamfNotice', [
      'confirmed-none',
      'only-applicant-unaware',
      'deprivation',
      'revocation',
      'withdrawal',
    ]),
    group('refugeeIncome', [
      choice('ordinaryDecision', decisionOptions),
      choice('acceleratedDecision', decisionOptions),
      bool('berlin'),
      number('totalMonthlyIncome'),
      number('monthlySgbIIXII'),
      bool('sustainable'),
      choice('medicalExemption', decisionOptions),
      bool('unraisedRetirementAge'),
    ]),
  ],
  R06: [
    choice('euExcludedStatus', [
      'none',
      'excluded-humanitarian',
      'pending-protection',
      'temporary',
      'diplomatic',
      'unconfirmed',
    ]),
    ...flags('euRegularIncome', 'euTaxDutiesFulfilled'),
    choice('euWorkLicences', [
      'satisfied',
      'not-required',
      'missing',
      'under-review',
    ]),
    choice('euRetirementProvision', [
      'adequate-own',
      'adequate-cohabiting-spouse',
      'medical-exemption',
      'inadequate',
      'under-review',
    ]),
    choice('euCareCover', [
      'statutory',
      'equivalent-accepted',
      'inadequate',
      'under-review',
    ]),
    group('euMobility', [
      ...flags('personalScope', 'immediatelyPriorOtherStateBlueCard'),
      actualDate('germanBlueSince'),
      list('periods', [
        choice(
          'kind',
          [
            'german-blue',
            'other-eu-blue',
            'higher-employment',
            'research',
            'study',
            'protection',
            'outside-eu',
            'ineligible',
            'unconfirmed',
          ],
          true,
        ),
        date('from', true),
        date('until', true),
      ]),
    ]),
  ],
  R09: [
    bool('humanitarianCurrentTitle'),
    actualDate('humanitarianCreditedSince'),
    choice('humanitarianDecision', decisionOptions),
  ],
  R10: [
    choice('businessPermit', [
      'entrepreneur',
      'freelance',
      'mixed-or-ancillary',
      'other',
    ]),
    actualDate('continuousBusinessSince'),
    choice('businessSustainability', decisionOptions),
    choice('businessGrant', decisionOptions),
    group('initialBusinessPermit', [
      date('appliedOn', true),
      ...flags(
        'economicOrRegionalNeed',
        'positiveEconomicImpact',
        'financingSecured',
      ),
      choice('alternativeLegalBasis', decisionOptions),
      bool('adequatePension'),
    ]),
  ],
  R11: [
    choice('childPermitBasis', ['family', 'humanitarian', 'other']),
    choice('childHumanitarianReferral', decisionOptions),
    actualDate('childPermitSince'),
    integer('childForeignSchoolDays'),
    choice('childSchoolCredit', [
      'ordinary',
      'recognised-full',
      'under-review',
    ]),
    ...flags('childLanguageB1', 'childSecureLivelihood'),
    choice('childEducation', [
      'school',
      'vocational',
      'university',
      'unconfirmed',
      'none',
    ]),
    choice('childLanguageMedicalWaiver', decisionOptions),
    choice('childLivelihoodMedicalWaiver', decisionOptions),
    ...flags('childPersonalExpulsionInterest', 'childYouthSentenceDeferred'),
    list('childJudgments', [
      choice('kind', ['youth', 'prison', 'fine'], true),
      actualDate('judgmentDate', true),
      bool('intentional'),
      number('amount', true),
    ]),
    bool('childDependsOnSgbIIXIIorVIII'),
    choice('childExceptionDecision', decisionOptions),
  ],
  R12: [
    ...flags('spouseHoldsSkilledSettlement', 'spousalCommunityContinues'),
    actualDate('qualifyingSpousePermitSince'),
    number('regularWeeklyHours'),
    choice('irregularHoursAssessment', decisionOptions),
  ],
  R13: [
    bool('highlyQualifiedAcademic'),
    choice('exceptionalAcademicPost', decisionOptions),
    choice('stateConsent', ['given', 'not-required', 'refused', 'pending']),
    choice('integrationProspects', decisionOptions),
  ],
  R14: [
    choice('civilAppointment', ['beamter', 'employee', 'unconfirmed']),
    actualDate('civilServicePermitSince'),
  ],
  R15: [
    actualDate('formerFamilyLifeEnded'),
    choice('formerSpousePermanentTitle', [
      'settlement',
      'eu-long-term',
      'other',
      'unconfirmed',
    ]),
    choice('formerSpouseMaintenance', [
      'own-funds-enforceable-and-sufficient',
      'insufficient',
      'third-party',
      'under-review',
    ]),
  ],
  R18: [group('freedom', freeMovementFields)],
} as const;

const citizenshipTitles = [
  'permanent-right',
  'swiss-agreement',
  'blue-card',
  'other-eligible',
  'excluded-title',
  'section-23a-hardship',
  'toleration',
  'unverified',
  '16a',
  '16b',
  '16d',
  '16e',
  '16f',
  '17',
  '18f',
  '19',
  '19b',
  '19e',
  '20',
  '20a',
  '22',
  '23a',
  '24',
  '25(3)',
  '25(4)',
  '25(5)',
  '104c',
] as const;

export const citizenshipSections = {
  natIdentity: [
    date('applicationOn'),
    ...flags(
      'historicAcceleratedApplicationPending',
      'foreignNationalOrStateless',
      'identityAndNationalityEstablished',
      'canActWithoutGuardian',
      'representedByLaw',
      'lawfulHabitualResidence',
    ),
    choice('currentTitle', citizenshipTitles),
    actualDate('countedResidenceSince'),
    ...flags(
      'constitutionalAndLoyaltyDeclaration',
      'historicalResponsibilityDeclaration',
      'solemnDeclaration',
      'certificateHandedOver',
    ),
  ],
  natLivelihood: [
    ...flags('sustainableHouseholdSupport', 'withoutSgbIIorXII'),
    choice('incomeException', ['none', 'worker', 'partner', 'legacy-worker']),
    group('fullTime', [bool('workingFullTimeNow'), integer('monthsInWindow')]),
    group('partnerFullTime', [
      bool('workingFullTimeNow'),
      integer('monthsInWindow'),
    ]),
    ...flags('livesWithPartnerAndMinorChild', 'exceptionForecastAccepted'),
    group('historicalWorker', [
      choice('kind', ['west-agreement', 'east-contract', 'none'], true),
      actualDate('workerArrivedOn'),
      choice('applicant', ['worker', 'spouse'], true),
      bool('spouseJoinedInConnection'),
    ]),
    bool('benefitsNotAttributable'),
  ],
  natLanguageConduct: [
    choice('germanEvidence', [
      ...cefrLevels,
      'accepted-equivalent',
      'pending',
      'none',
    ]),
    ...flags('ageAppropriateGerman', 'oralEverydayGerman'),
    choice('languageException', [
      'none',
      'legacy-worker',
      'approved-oral-hardship',
      'medical-age-accepted',
      'pending',
    ]),
    group('knowledge', [
      choice(
        'kind',
        [
          'naturalisation-test',
          'lid',
          'accepted-equivalent',
          'none',
          'pending',
        ],
        true,
      ),
      integer(
        'correct',
        true,
        (r) => r.kind === 'naturalisation-test' || r.kind === 'lid',
      ),
    ]),
    group('criminalRecord', [
      choice(
        'kind',
        [
          'none',
          'juvenile-educational-measure',
          'pending-proceedings',
          'bar-confirmed',
          'foreign-record',
          'security-measure',
          'fines',
          'mixed-sentences',
          'custody',
        ],
        true,
      ),
      choice(
        'disregard',
        decisionOptions,
        false,
        (r) => r.kind === 'foreign-record' || r.kind === 'security-measure',
      ),
      integerList('dayRates', (r) => r.kind === 'fines'),
      integer('lowerCombinedDayRates', false, (r) => r.kind === 'fines'),
      integerList('fineDayRates', (r) => r.kind === 'mixed-sentences'),
      integer('prisonDays', true, (r) => r.kind === 'mixed-sentences'),
      bool(
        'allCustodySuspendedAndRemitted',
        false,
        (r) => r.kind === 'mixed-sentences',
      ),
      integer('lowerCombinedDays', false, (r) => r.kind === 'mixed-sentences'),
      number('months', true, (r) => r.kind === 'custody'),
      bool('suspendedAndRemitted', false, (r) => r.kind === 'custody'),
      bool(
        'judgmentFoundHateMotive',
        false,
        (r) =>
          r.kind === 'fines' ||
          r.kind === 'mixed-sentences' ||
          r.kind === 'custody',
      ),
      choice(
        'disregardExcess',
        decisionOptions,
        false,
        (r) =>
          r.kind === 'fines' ||
          r.kind === 'mixed-sentences' ||
          r.kind === 'custody',
      ),
    ]),
    choice('exclusionReview', ['cleared', 'excluded', 'pending']),
  ],
} satisfies Record<string, GermanyField[]>;

export const citizenshipRouteFields = {
  R08: [
    actualDate('marriedOn'),
    actualDate('spouseGermanSince'),
    group('spouse', [
      choice('status', ['continuing', 'died', 'legally-ended', 'unrecognised']),
      ...flags('recognisedGermanRelationship', 'genuineFamilyLife'),
      choice('prolongedSeparationPeriod', decisionOptions),
      actualDate('endedOn'),
      actualDate('sharedGermanChildBornOn'),
      bool('custodyAndFamilyLifeWithChild'),
      choice('publicInterestShortening', decisionOptions),
    ]),
  ],
  R16: [
    group('family', [
      choice('mainRoute', ['section-9', 'section-10']),
      choice('relation', ['spouse-or-registered-partner', 'child', 'other']),
      bool('mainNaturalisationAndTimelyJointApplication'),
      actualDate('actualFamilyLifeSince'),
      ...flags('custodyAndFamilyLife', 'independentlyEligible'),
      choice('decision', decisionOptions),
    ]),
  ],
  R17: [
    group('discretionary', [
      ...flags('accommodation', 'sustainableSupportIncludingInsurance'),
      choice('maintenanceWaiver', [...decisionOptions, 'none']),
      choice('convictionWaiver', [...decisionOptions, 'none']),
      choice('integrationException', decisionOptions),
      choice('decision', decisionOptions),
    ]),
  ],
} as const;

export const feeFields: GermanyField[] = [
  date('applicationDate'),
  choice('stage', [
    'application',
    'withdrawn-before-review',
    'after-substantive-review',
    'jurisdiction-or-capacity-only',
  ]),
  choice('reduction', [
    'ordinary',
    'section52-protection-or-admission',
    'association-right',
    'authority-set',
    'pending',
  ]),
  number('assessedFee'),
  number('paid'),
  ...flags('expressAccepted', 'personalTaxableIncome'),
  choice('euDocument', ['certificate', 'family-card', 'replacement']),
  choice('citizenshipTest', ['already-proved-or-exempt', 'bamf', 'state']),
  number('stateTestQuote'),
  choice('integration', [
    'none',
    'covered-first-exam',
    'external-lid',
    'course',
    'commercial-or-repeat',
  ]),
  number('providerQuote'),
  number('courseReimbursementBase'),
  choice('courseExemption', ['granted', 'pending', 'ordinary']),
  number('employeeGrossAnnual'),
  integer('qualifyingChildren'),
];
