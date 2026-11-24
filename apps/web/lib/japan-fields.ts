import type {
  JpFullNaturalisationRoute,
  JpFullPrRoute,
  JpFullReentryRequest,
} from '@uk-immigration/engine';
import type { jpFormZh } from '../i18n/countries/japan-form';

type Suffix<P extends string> =
  Extract<
    keyof typeof jpFormZh,
    `jp.${P}.${string}`
  > extends `jp.${P}.${infer S}`
    ? S
    : never;
type FieldName = Suffix<'field'>;
export type JapanOption = Suffix<'option'>;
export type JapanField = {
  name: string;
  label: FieldName;
  hint?: Suffix<'form'>;
  required?: boolean;
  actualDate?: true | 'alreadyDeparted';
} & (
  | {
      type:
        | 'boolean'
        | 'date'
        | 'number'
        | 'integer'
        | 'status-date'
        | 'period'
        | 'notice';
    }
  | { type: 'choice'; options: readonly JapanOption[] }
  | { type: 'group' | 'list'; fields: JapanField[] }
);

const bool = (name: FieldName, required = false): JapanField => ({
  name,
  label: name,
  type: 'boolean',
  required,
});
const flags = (...names: FieldName[]) => names.map((name) => bool(name));
const date = (
  name: FieldName,
  required = false,
  label = name,
  hint?: Suffix<'form'>,
): JapanField => ({ name, label, required, hint, type: 'date' });
const actualDate = (...args: Parameters<typeof date>): JapanField => ({
  ...date(...args),
  actualDate: true,
});
const number = (name: FieldName): JapanField => ({
  name,
  label: name,
  type: 'number',
});
const integer = (name: FieldName): JapanField => ({
  name,
  label: name,
  type: 'integer',
});
const choice = (
  name: FieldName,
  options: readonly JapanOption[],
  required = false,
): JapanField => ({ name, label: name, type: 'choice', options, required });
const group = (name: FieldName, fields: JapanField[]): JapanField => ({
  name,
  label: name,
  type: 'group',
  fields,
});
const list = (name: FieldName, fields: JapanField[]): JapanField => ({
  name,
  label: name,
  type: 'list',
  fields,
});

export const basicFields = (hasResidenceRoute: boolean) => [
  date('simulationDate', true),
  ...(hasResidenceRoute ? [actualDate('stayStart', true)] : []),
  date('applicationDate', false, 'applicationDate', 'baseline'),
  actualDate('dateOfBirth'),
];
export const tripFields = [
  date('departed', true),
  date('returned', true),
  actualDate('newLandingOn'),
  choice('departure', ['none', 'deemed', 'permit']),
  bool('reentryPermit'),
  {
    ...bool('specialPermanentResident'),
    label: 'specialAtDeparture',
  } satisfies JapanField,
  date('stayExpiry', false, 'stayExpiry', 'tripExpiry'),
  bool('renewalPending'),
  actualDate(
    'renewalDecisionOn',
    false,
    'renewalDecisionOn',
    'renewalDecisionHint',
  ),
];
export const tripList = {
  name: 'trips',
  label: 'trips',
  type: 'list',
  fields: tripFields,
} satisfies JapanField;
const general: JapanField[] = [
  {
    name: 'statusStart',
    label: 'statusStart',
    type: 'status-date',
    actualDate: true,
    required: true,
    hint: 'dateOrNone',
  },
  {
    name: 'newStatusStart',
    label: 'newStatusStart',
    type: 'status-date',
    actualDate: true,
    required: true,
    hint: 'newStatusHint',
  },
  list('excluded', [actualDate('from', true), actualDate('to', true)]),
];
const talentActivity = [
  date('on', true),
  choice('activity', ['research', 'technical', 'management']),
  bool('qualifyingActivity'),
  integer('remunerationYen'),
  choice('education', [
    'doctorate',
    'businessProfessional',
    'graduate',
    'undergraduate',
    'none',
  ]),
  number('relevantExperienceYears'),
];
const hspSnapshot = [
  ...talentActivity,
  integer('confirmedPoints'),
  bool('complete'),
  integer('age'),
  bool('multipleGraduateFields'),
  integer('patents'),
  integer('qualifyingResearchGrants'),
  integer('qualifyingPublications'),
  bool('equivalentResearch'),
  choice('technicalQualifications', [
    'one',
    'two',
    'equivalent-higher-category',
  ]),
  choice('position', ['representative', 'director']),
  choice('innovationEmployer', ['standard', 'small-business']),
  number('smallBusinessResearchPercent'),
  ...flags('foreignQualification', 'japanHigherEducation'),
  choice('japaneseEvidence', [
    'N1-equivalent',
    'N2-equivalent',
    'foreign-japanese-major',
  ]),
  integer('bjtScore'),
  ...flags('advancedProject', 'designatedUniversity'),
  choice('designatedTraining', ['japanese-higher-education', 'other']),
  ...flags('regionalEmployer', 'designatedFinance'),
  integer('personalInvestmentYen'),
];
const hsp = [
  actualDate('statusStart', true, 'pointsFrom'),
  choice('mode', ['recognised', 'retrospective']),
  actualDate('recognisedOn'),
  integer('recognisedPoints'),
  bool('maintained'),
  group('current', hspSnapshot),
  group('historical', hspSnapshot),
];
const jSkipSnapshot = [...talentActivity, bool('confirmed')];

export const prRouteFields = {
  general,
  spouse: [actualDate('marriedLifeFrom', true)],
  child: [bool('bornInJapan')],
  'child-birth': [
    actualDate('bornOn', true),
    ...flags('bornInJapan', 'withoutLanding', 'acquisitionAccepted'),
    actualDate('birthRegisteredOn'),
    ...flags('plansToStayPastPermitlessPeriod', 'heldAnotherStatus'),
  ],
  teijusha: [actualDate('statusStart', true, 'longTermFrom')],
  refugee: [actualDate('statusStart', true, 'protectionFrom')],
  hsp70: hsp,
  hsp80: hsp,
  'j-skip': [
    choice('mode', ['recognised', 'retrospective']),
    actualDate('recognisedOn'),
    bool('remainedRecognised'),
    group('current', jSkipSnapshot),
    group('historical', jSkipSnapshot),
  ],
  'international-protection': general,
  'regional-regeneration': [
    ...flags(
      'planRecognised',
      'institutionInArea',
      'designatedInstitutionAndContract',
    ),
    integer('activityNotice'),
    ...flags(
      'activityQualified',
      'comparableJapanesePay',
      'qualifyingTechnologyEducation',
      'designatedItQualification',
    ),
    number('technologyExperienceYears'),
    bool('recognisedContribution'),
  ],
  'structural-zone': flags(
    'recognisedZone',
    'designatedBusiness',
    'recognisedContribution',
  ),
  'japan-contribution': [
    bool('recognisedContribution'),
    choice('category', [
      'government-award',
      'public-service',
      'international-award',
      'diplomatic',
      'international-organisation',
      'prime-director',
      'national-award',
      'cultural-award',
      'world-sport',
      'old-company-management',
      'old-investment',
      'old-professional-contribution',
      'old-cultural-leadership',
      'old-education',
      'old-research',
      'old-international-sport',
      'old-public-interest',
      'old-management',
      'old-growing-sector',
      'other',
    ]),
    number('roleYears'),
    integer('investmentYen'),
    ...flags('designatedCategoryEvidence', 'oldSocialLifeClear'),
  ],
} satisfies Record<JpFullPrRoute['route'], JapanField[]>;

export const natRouteFields = {
  general: [{ ...integer('homeMajorityAge'), required: true }],
  spouse: [actualDate('marriedOn', true), bool('stillJapaneseSpouse')],
  'article-6-former-national-child': [bool('biologicalChildOfFormerNational')],
  'article-6-japan-birth': flags(
    'bornInJapan',
    'biologicalParentBornInJapan',
    'authorityConfirmsOverseasBirthBranch',
  ),
  'article-6-long-residence': [],
  'article-8-japanese-child': [bool('biologicalChildOfJapaneseNational')],
  'article-8-adopted-child': flags(
    'adoptedByJapaneseNational',
    'adoptedWhileMinorUnderHomeLaw',
  ),
  'article-8-former-national': flags(
    'lostJapaneseNationality',
    'lostAfterNaturalising',
  ),
  'article-8-stateless-from-birth': flags(
    'bornInJapan',
    'statelessSinceBirth',
    'domiciledContinuouslySinceBirth',
  ),
  'article-9-special-merit': flags('specialMeritConfirmed', 'dietApproval'),
} satisfies Record<JpFullNaturalisationRoute['route'], JapanField[]>;

const travelCommon = [
  date('returnOn'),
  date('stayExpiresOn'),
  bool('stayIndefinite'),
  {
    ...bool('timelyRenewalPending'),
    label: 'renewalPending',
  } satisfies JapanField,
  actualDate(
    'renewalDecisionOn',
    false,
    'renewalDecisionOn',
    'renewalDecisionHint',
  ),
  ...flags(
    'specialPermanentResident',
    'lawfulStatus',
    'permitVoided',
    'travelDocumentLost',
    'expiryCertificateObtained',
  ),
  actualDate('newLandingOn'),
];
const permitFields = [
  date('effectiveOn'),
  date('expiresOn'),
  date('extendedUntil'),
  bool('extensionApproved'),
];
const consular = [
  bool('consularExtension'),
  choice('consularArea', ['china-mainland', 'other']),
  date('extensionFeeOn'),
];
export const travelRouteFields = {
  ordinary: [
    date('departureOn'),
    ...travelCommon,
    ...flags(
      'excludedStatusOrDetention',
      'inJapanWhenApplying',
      'intendsReturn',
      'passportOrApprovedAlternative',
      'residentCardOrCertificate',
    ),
    group('permit', permitFields),
    choice('visits', ['single', 'multiple']),
    choice('channel', ['counter', 'online']),
    ...flags(
      'onlineConcurrentEligibleApplication',
      'previouslyUsedSingleEntry',
    ),
    ...consular,
  ],
  deemed: [
    { ...date('departureOn'), actualDate: 'alreadyDeparted' },
    bool('alreadyDeparted'),
    ...travelCommon,
    bool('temporaryVisitor'),
    integer('originalStayMonths'),
    ...flags(
      'passportValid',
      'residentCardOrCertificate',
      'formalPermitRequired',
      'declaredIntentAtDeparture',
    ),
  ],
  'refugee-travel-document': [
    date('departureOn'),
    ...travelCommon,
    ...flags('refugeeRecognition', 'hasJapaneseTravelDocument'),
    group('permit', [
      ...permitFields,
      date('entryDeadline'),
      bool('entryDeadlineNotSpecified'),
    ]),
    ...consular,
  ],
} satisfies Record<JpFullReentryRequest['route'], JapanField[]>;

const payment = ['on-time', 'lawful-exemption', 'late-paid', 'unpaid'] as const;
const payments = [
  choice('tax', payment),
  choice('pension', payment),
  choice('publicHealthInsurance', payment),
];
const filer = choice('filer', [
  'self',
  'legal-representative',
  'approved-intermediary',
  'other',
]);
const notice: JapanField[] = [
  actualDate('eventOn', true),
  {
    name: 'notifiedOn',
    label: 'notifiedOn',
    type: 'notice',
    actualDate: true,
    hint: 'noticeHint',
  },
];
const statusKinds = [
  'official',
  'professor',
  'artist',
  'religious',
  'journalist',
  'hsp1',
  'businessManager',
  'legalAccounting',
  'medical',
  'researcher',
  'instructor',
  'engineer',
  'transfer',
  'nursing',
  'entertainer',
  'skilledLabour',
  'specifiedSkilled1',
  'specifiedSkilled2',
  'technicalIntern1',
  'technicalIntern2or3',
  'cultural',
  'student',
  'clinicalTraining',
  'trainee',
  'dependent',
  'designatedActivity',
  'designatedEpa',
  'japaneseFamily',
  'prFamily',
  'teijusha',
  'hsp2',
  'permanent',
  'special-permanent',
  'diplomat',
  'temporary-visitor',
  'none',
  'other',
] as const;
export const prStatusSections = {
  prIdentity: [
    ...flags('japaneseCitizen', 'inJapan'),
    group('status', [
      { ...choice('statusKind', statusKinds, true), name: 'kind' },
      bool('valid'),
      {
        name: 'grantedPeriodMonths',
        label: 'grantedPeriodMonths',
        type: 'period',
      },
      date('expiresOn'),
      ...flags('timelyRenewalPending', 'heldThreeYearPeriodOnTransitionDay'),
      date('transitionPermitExpiresOn'),
      bool('firstApplicationAfterTransition'),
      actualDate('decisionOn'),
      ...flags('authorityConfirmedLongest', 'fitsCurrentCriteria'),
      group('businessManager', [
        ...flags('subjectToRevisedCriteria', 'officeInJapan'),
        integer('eligibleEmployees'),
        integer('assetsYen'),
        ...flags('confirmedB2', 'relevantGraduateDegree'),
        number('managementExperienceYears'),
        bool('planProfessionallyConfirmed'),
      ]),
    ]),
    group('family', [
      choice('relativeStatus', [
        'japanese',
        'permanent',
        'special-permanent',
        'other',
      ]),
      choice('relation', [
        'spouse',
        'biological-child',
        'special-adoption',
        'other-adoption',
        'other',
      ]),
      ...flags('genuineMarriage', 'confirmedStatutoryFamily'),
    ]),
    choice('protectionRecognition', [
      'refugee',
      'complementary-protection',
      'pending',
      'none',
    ]),
    bool('internationalProtectionConfirmed'),
  ],
  prConduct: [
    bool('goodConductConfirmed'),
    choice('criminalHistory', [
      'none',
      'custody',
      'fine',
      'juvenile-order',
      'arrest-only',
      'traffic-penalty',
      'other',
    ]),
    ...flags(
      'nationalInterestConfirmed',
      'absenceReasonsConfirmedReasonable',
      'japanMainHomeIntended',
      'contributionEvidence',
      'statusActivitiesCompliant',
      'residenceCardDutiesCompliant',
    ),
    list('affiliationNotices', notice),
    ...payments,
    list('addressNotices', notice),
    ...flags(
      'actualAddressAndRegister',
      'publicHealthCleared',
      'otherLandingGroundsCleared',
    ),
  ],
};
export const prFilingSections = {
  prFinances: [
    bool('livelihoodConfirmed'),
    integer('applicantAnnualIncomeYen'),
    list('household', [
      choice(
        'relationship',
        ['shared-home-and-budget', 'nonresident-dependant', 'excluded'],
        true,
      ),
      choice('incomeTreatment', [
        'eligible',
        'nonqualifying-activity',
        'parents-not-supporting-applicant',
      ]),
      integer('annualIncomeYen'),
    ]),
    ...flags('householdIncomeConfirmed', 'pendingOnIncomeReviewDate'),
    integer('expectedAnnualPensionYen'),
    integer('spouseExpectedAnnualPensionYen'),
    integer('pensionSupplementAssetsYen'),
    bool('pensionComparisonConfirmed'),
    choice('publicAssistance', [
      'received',
      'none',
      'statutory-insurance',
      'other',
    ]),
    ...flags('publicBurdenConfirmedAcceptable', 'humanitarianCircumstances'),
  ],
  prLanguage: [
    ...flags(
      'qualifyingHspApplicantOrFamily',
      'otherLanguageExemptionConfirmed',
    ),
    number('qualifyingSchoolYears'),
    ...flags(
      'raisingParentB1Confirmed',
      'japaneseB1Confirmed',
      'integrationKnowledgeConfirmed',
    ),
    list('schoolChildren', [
      actualDate('bornOn'),
      choice('attendance', [
        'primary-or-junior-high',
        'not-attending',
        'alternative',
      ]),
      bool('authorityAccepted'),
    ]),
  ],
  prFiling: [
    choice('guarantor', [
      'japanese-resident',
      'permanent-resident',
      'special-permanent-resident',
      'other-resident',
      'none',
    ]),
    ...flags('guarantorDocumentsReady', 'guarantorAcceptedOrWaived'),
    filer,
    ...flags('documentsReady', 'photoReady', 'photoRequiredByAuthority'),
    group('specialPermission', [
      {
        ...choice(
          'permissionKind',
          ['none', 'stay', 'landing-refusal', 'other'],
          true,
        ),
        name: 'kind',
      },
      actualDate('grantedOn'),
    ]),
    choice('feeReduction', [
      'approved',
      'denied',
      'requested',
      'not-requested',
    ]),
    group('integratedCard', [
      bool('requested', true),
      ...flags(
        'immigrationChargeApplies',
        'jLisChargeApplies',
        'electronicCertificate',
      ),
    ]),
  ],
};

const language = ['independent', 'needs-help', 'unable'] as const;
export const natSections = {
  natDomicile: [
    ...flags('japaneseCitizen', 'inJapan', 'lawfulDomicile'),
    actualDate('domicileFrom', false, 'domicileFrom', 'domicileHint'),
    actualDate('residenceFrom', false, 'residenceFrom', 'domicileHint'),
    ...flags('capacityUnderHomeLaw', 'goodConductConfirmed'),
    choice('criminalOrTrafficHistory', [
      'none',
      'relevant-record',
      'uncertain',
    ]),
    bool('livelihoodConfirmed'),
  ],
  natIntegration: [
    choice('nationality', [
      'confirmed-stateless',
      'all-nationalities-lost-on-naturalisation',
      'will-retain-nationality',
    ]),
    ...flags(
      'cannotLoseNationalityByOwnChoice',
      'ministerialExceptionConfirmed',
      'constitutionalConditionConfirmed',
      'integratedIntoJapanConfirmed',
    ),
    group('japaneseLanguage', [
      choice('speaking', language),
      choice('reading', language),
      choice('writing', language),
      bool('authorityConfirmed'),
    ]),
    bool('requiredInterviewAndAssessmentComplete'),
  ],
  natFiling: [
    ...payments,
    ...flags(
      'residenceEvidenceReady',
      'healthInsuranceEvidenceReady',
      'motivationReady',
      'oathReady',
      'plansToLiveInJapan',
    ),
    filer,
    ...flags(
      'filedAtJurisdictionalBureau',
      'writtenDocumentsAndTranslationsReady',
    ),
    actualDate('officialGazetteOn'),
    actualDate('familyRegistrationOn'),
  ],
};
