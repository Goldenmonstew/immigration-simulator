import type { grFormZh } from '../i18n/countries/greece-form';

type Suffix<P extends string> =
  Extract<
    keyof typeof grFormZh,
    `gr.${P}.${string}`
  > extends `gr.${P}.${infer S}`
    ? S
    : never;
export type GreeceLabel = Suffix<'field'>;
export type GreeceOption = Suffix<'option'>;
export type GreeceHint = Suffix<'hint'>;
export type GreeceSection = Suffix<'section'>;

type Answers = Record<string, unknown>;
export type GreeceField = {
  name: string;
  label: GreeceLabel;
  hint?: GreeceHint;
  required?: boolean;
  // Hidden questions are cleared and not validated.
  when?: (answers: Answers) => boolean;
} & (
  | { type: 'boolean'; extra?: readonly GreeceOption[] }
  | { type: 'date' | 'number' | 'integer' }
  | { type: 'date-or'; alternative: GreeceOption }
  | {
      type: 'choice' | 'choice-set';
      options: readonly GreeceOption[];
      // Option values shared by several questions can read differently here.
      labels?: Partial<Record<GreeceOption, GreeceOption>>;
    }
  | { type: 'group' | 'list'; fields: GreeceField[] }
);

interface Options {
  label?: GreeceLabel;
  hint?: GreeceHint;
  required?: boolean;
  when?: (answers: Answers) => boolean;
}
const base = (name: string, o: Options = {}) => ({
  name,
  label: o.label ?? (name as GreeceLabel),
  hint: o.hint,
  required: o.required,
  when: o.when,
});
const req = { required: true };
const bool = (name: string, o?: Options): GreeceField => ({
  ...base(name, o),
  type: 'boolean',
});
const flags = (...names: GreeceLabel[]) => names.map((name) => bool(name));
const date = (name: string, o?: Options): GreeceField => ({
  ...base(name, o),
  type: 'date',
});
const dateOr = (
  name: string,
  alternative: GreeceOption,
  o?: Options,
): GreeceField => ({ ...base(name, o), type: 'date-or', alternative });
const num = (name: string, o?: Options): GreeceField => ({
  ...base(name, o),
  type: 'number',
});
const int = (name: string, o?: Options): GreeceField => ({
  ...base(name, o),
  type: 'integer',
});
const choice = (
  name: string,
  options: readonly GreeceOption[],
  o?: Options & { labels?: Partial<Record<GreeceOption, GreeceOption>> },
): GreeceField => ({
  ...base(name, o),
  type: 'choice',
  options,
  labels: o?.labels,
});
const group = (
  name: string,
  fields: GreeceField[],
  o?: Options,
): GreeceField => ({ ...base(name, o), type: 'group', fields });
const list = (
  name: string,
  fields: GreeceField[],
  o?: Options,
): GreeceField => ({ ...base(name, o), type: 'list', fields });
const is =
  (key: string, ...values: unknown[]) =>
  (answers: Answers) =>
    values.includes(answers[key]);

export const basicFields: GreeceField[] = [
  date('simulationDate', { ...req, hint: 'simulationDate' }),
  date('birthDate'),
  choice('citizenship', [
    'third-country',
    'stateless',
    'eu',
    'eea-swiss',
    'greek',
  ]),
];

const permitFields: GreeceField[] = [
  choice('kind', ['regular', 'investor', 'study', 'temporary'], {
    ...req,
    label: 'permitKind',
  }),
  date('from', { ...req, label: 'permitFrom' }),
  date('to', { label: 'permitTo', hint: 'permitTo' }),
  date('issuedOn', { label: 'permitIssuedOn', hint: 'permitIssuedOn' }),
  choice('purpose', ['family-reunification', 'other'], {
    label: 'permitPurpose',
    when: is('kind', 'regular'),
  }),
];
// The family routes classify each absence; other routes only need the dates.
export const tripList = (family: boolean) =>
  list(
    'trips',
    [
      date('departed', req),
      date('returned', req),
      ...(family
        ? [
            choice(
              'familyAbsenceReason',
              ['ordinary', 'compulsory-service', 'serious-reason'],
              { hint: 'familyAbsenceReason' },
            ),
          ]
        : []),
    ],
    { hint: 'trips' },
  );
const backlogFields: GreeceField[] = [
  date('filedOn', req),
  date('permitEffectiveOn', req),
  choice(
    'category',
    [
      'employment',
      'services-or-project',
      'family',
      'autonomous-family',
      'other',
    ],
    { ...req, label: 'backlogCategory' },
  ),
  bool('typeAReceipt', req),
  bool('pendingAtCommencement', req),
];
export const historyFields = {
  permits: list('permits', permitFields, { hint: 'permits' }),
  permitHistoryComplete: bool('permitHistoryComplete'),
  backlogRenewals: list('backlogRenewals', backlogFields, {
    hint: 'backlogRenewals',
  }),
  renewal: [
    date('currentCardExpiresOn'),
    choice('renewalForceMajeure', ['approved', 'pending', 'none']),
  ],
};

const isPrivate = is('kind', 'private');
const isGap = is('kind', 'gap');
export const commonSections = (
  euFamily: boolean,
  goldenVisa: boolean,
): Partial<Record<GreeceSection, GreeceField[]>> => ({
  identity: [
    choice('entry', [
      'permit',
      'national-visa',
      'short-stay',
      'receipt',
      'outside',
      'unlawful',
      'restricted-permit',
    ]),
    group('passport', [
      choice(
        'kind',
        ['recognised', 'unavailable', 'exception-pending', 'exception-granted'],
        { ...req, label: 'passportKind' },
      ),
      date('issuedOn', { label: 'passportIssuedOn' }),
      date('expiresOn', { label: 'passportExpiresOn' }),
      int('blankPages'),
      date('expectedDeparture', { hint: 'expectedDeparture' }),
    ]),
    ...(euFamily ? [bool('euFamilyEntryEvidenceAccepted')] : []),
    ...(goldenVisa ? [bool('overseasInvestorMandate')] : []),
  ],
  conduct: [
    choice('publicOrder', ['clear', 'review', 'adverse']),
    group('character', [
      num('finalSentenceMonths'),
      bool('repeatOffences'),
      num('seriousSecurityListingYears'),
      bool('seriousListingRemovalRefused'),
    ]),
    choice('publicHealth', ['cleared', 'possible-risk', 'entry-refused']),
  ],
  filing: [
    group('filingDocuments', [
      ...flags('formReady', 'feeReceiptReady', 'feeExemptionDocumented'),
    ]),
    choice('biometrics', [
      'provided',
      'medical-exemption',
      'awaiting-appointment',
    ]),
    int('missedFingerprintAppointments'),
    list(
      'changes',
      [
        choice('kind', ['ordinary', 'birth', 'passport-renewed'], {
          ...req,
          label: 'changeKind',
        }),
        date('occurredOn', req),
        date('reportedOn'),
        date('nextCardFiling', { when: is('kind', 'passport-renewed') }),
      ],
      { hint: 'changes' },
    ),
    {
      ...base('deferredInitialEvidence'),
      type: 'choice-set',
      options: ['public-insurance-application', 'public-hospital-certificate'],
    },
  ],
  insurance: [
    group('insurance', [
      choice('kind', ['public', 'private', 'gap', 'uninsured'], {
        ...req,
        label: 'insuranceKind',
      }),
      bool('coversFamily'),
      choice('issuer', ['greek', 'foreign'], {
        label: 'insurer',
        when: isPrivate,
      }),
      bool('explicitlyCoversGreece', { when: isPrivate }),
      num('disabilityEur', { when: isPrivate }),
      num('medicalEur', { when: isPrivate }),
      num('hospitalEur', { when: isPrivate }),
      num('maxCopayPercent', { when: isPrivate }),
      bool('hasDeductibleOrExclusions', { when: isPrivate }),
      int('policyMonths', { when: isPrivate }),
      choice(
        'gapEvidence',
        ['unemployment-benefit', 'accepted-force-majeure', 'pending', 'none'],
        { when: isGap },
      ),
      bool('activePublicCoverAfterGap', { when: isGap }),
    ]),
  ],
});

const integrationBasis = [
  'school',
  'second-chance-school',
  'greek-degree',
  'greek-language-degree-abroad',
  'language',
  'pegp',
  'family-pr',
  'expatriate-card',
  'a2',
  'history',
  'residence',
  'none',
] as const;
const examBasis = is('basis', 'a2', 'history');
const levels = ['legacy-A', 'A1', 'A2', 'B1', 'B2', 'C1', 'C2'] as const;
export const settlementFields = {
  longTerm: group('longTerm', [
    choice('stage', ['initial', 'renewal', 'reacquisition']),
    choice(
      'category',
      [
        'ordinary',
        'protected',
        'investor',
        'study',
        'temporary',
        'asylum-pending',
        'diplomatic',
      ],
      { label: 'ltCategory' },
    ),
    choice('passportHistory', [
      'complete',
      'official-substitute',
      'substitute-pending',
      'missing',
    ]),
    choice(
      'lossReason',
      ['absence-from-eu', 'other-member-state-status', 'other'],
      {
        when: is('stage', 'reacquisition'),
      },
    ),
    bool('lossEvidenceReady', { when: is('stage', 'reacquisition') }),
    bool('convertingTenYearCard'),
    date('statusGrantedOn'),
    num('continuousOutsideEuMonths'),
    num('continuousOutsideGreeceYears'),
    bool('formerBlueCardEndorsement'),
    bool('otherMemberStateLongTermOrRevocationGround'),
  ]),
  grantedProtection: group('grantedProtection', [
    date('claimedOn', req),
    date('grantedOn', req),
    dateOr('priorResidenceExcludedThrough', 'none'),
  ]),
  blueCardMobility: group('blueCardMobility', [
    bool('usedLongTermMobility'),
    date('greekBlueCardFrom'),
    date('greekBlueCardThrough'),
    date('greekResidenceFrom'),
    list('priorMemberPeriods', [
      date('from', req),
      date('through', req),
      choice('issuer', ['greece', 'other-member-state'], {
        label: 'periodIssuer',
      }),
      choice(
        'kind',
        [
          'blue-card',
          'highly-qualified',
          'researcher',
          'student',
          'international-protection',
        ],
        { ...req, label: 'periodKind' },
      ),
    ]),
    list('otherMemberTrips', [date('departed', req), date('returned', req)]),
  ]),
  integration: group('integration', [
    choice('basis', integrationBasis, { ...req, label: 'integrationBasis' }),
    choice('greekLevel', levels, {
      when: is('basis', 'language', 'history'),
    }),
    bool('a2Certificate', { when: is('basis', 'a2') }),
    bool('historyCertificate', { when: is('basis', 'history') }),
    date('a2ExamOn', { when: examBasis }),
    num('a2Total', { when: is('basis', 'a2') }),
    int('a2SectionsAtPassMark', { when: is('basis', 'a2') }),
    num('historyPoints', { when: is('basis', 'history') }),
    date('continuousFrom', { when: is('basis', 'residence') }),
    bool('continuityDuringTravelConfirmed', { when: is('basis', 'residence') }),
    bool('includesStudyOrDisputedGap', {
      when: is('basis', 'residence'),
      hint: 'disputedGap',
    }),
    bool('legacyTwelveLawfulYears', { when: is('basis', 'residence') }),
  ]),
  residenceIncome: group('residenceIncome', [
    num('netEur', { hint: 'netEur' }),
    int('dependants'),
    bool('regularAndDocumented'),
  ]),
  tenYear: group('tenYear', [
    choice('stage', ['initial', 'renewal']),
    choice('basis', ['residence', 'birth-school', 'unaccompanied-minor'], {
      label: 'tenYearBasis',
    }),
    bool('hasPriorCard'),
    date('cardExpiresOn'),
    bool('residesInGreece'),
    date('qualifyingResidenceFrom', { hint: 'qualifyingResidenceFrom' }),
    bool('disputedPermitGap', { hint: 'disputedGap' }),
    bool('bornInGreece'),
    int('greekGrades'),
    date('schoolCompletedOn'),
    int('greekSecondaryGrades'),
    bool('inSecondarySchoolAtReform'),
    bool('birthOrSchoolEvidenceReady'),
    bool('unaccompaniedEntryEvidence'),
    bool('taxAndInsuranceClearance'),
    bool('travelDocumentPagesReady', { hint: 'travelDocumentPages' }),
    bool('legacyTenLawfulYears'),
    bool('legacyEconomicAndSocialIntegration'),
  ]),
};

export const routeField = choice(
  'route',
  ['general', 'three-year', 'twelve-year'],
  { hint: 'route' },
);
const isExam = (...kinds: string[]) => is('exam', ...kinds);
export const nationalitySections: Partial<
  Record<GreeceSection, GreeceField[]>
> = {
  natApplication: [
    choice('stage', ['application', 'oath']),
    choice(
      'permit',
      ['listed', 'investor', 'other-definitive', 'temporary', 'receipt'],
      { label: 'natPermit' },
    ),
    choice('shortRouteBasis', [
      'eu',
      'greek-spouse-with-child',
      'parent-of-greek-child-born-in-greece',
      'stateless',
      'none',
    ]),
    date('childBirthDate', { label: 'greekChildBirthDate' }),
    bool('bornAndContinuouslyResident'),
    date('pendingApplicationFiledOn', { hint: 'pendingApplicationFiledOn' }),
    dateOr('lastRejection', 'none'),
    bool('preReformObjectionException'),
    group('diplomaticSpouse', [
      bool('qualifyingServiceDocumented'),
      dateOr('yearInGreeceCompletedOn', 'not-completed'),
      list('periods', [date('from', req), date('through', req)], {
        ...req,
        label: 'postingPeriods',
      }),
    ]),
  ],
  natConduct: [
    list('convictions', [
      bool('final', req),
      choice(
        'offence',
        ['listed', 'other-intentional', 'other', 'classification-pending'],
        { ...req, labels: { listed: 'listed-offence' } },
      ),
      date('offenceDate', req),
      num('sentenceMonths', req),
    ]),
    bool('removalOrStatusProceedings'),
  ],
  natExam: [
    choice('exam', [
      'certificate',
      'written',
      'oral',
      'school-exemption',
      'not-passed',
    ]),
    date('examOn', { when: isExam('written', 'oral') }),
    num('languagePoints', { when: isExam('written') }),
    num('knowledgePoints', { when: isExam('written') }),
    bool('oralPassed', { when: isExam('oral') }),
    bool('knowledgeDocumentReady'),
    num('disabilityPercent'),
    bool('certifiedLearningDisability'),
    bool('barredFromExam'),
    int('greekSchoolGrades'),
    int('greekSecondaryGrades'),
    bool('greekTaughtUniversityDegree'),
  ],
  natEconomy: [
    list(
      'incomeYears',
      [
        int('year', { ...req, label: 'taxYear' }),
        num('taxableEur', req),
        int('dependants', req),
        num('welfareEur'),
      ],
      { hint: 'incomeYears' },
    ),
    bool('taxAndSocialInsuranceCurrent'),
    choice('economicActivity', [
      'stable-declared-work',
      'recurring-seasonal',
      'other-continuing-lawful-activity',
      'dependent-supported-by-household',
      'occasional-only',
      'undeclared-only',
      'none',
    ]),
    choice('livingResources', [
      'substantiated',
      'evidence-pending',
      'unexplained-spending',
      'benefits-only-without-special-reason',
    ]),
    choice('integrationAssessment', ['accepted', 'adverse', 'evidence-only']),
  ],
  natFiling: [
    choice('civilStatusProof', [
      'legalised-translation',
      'domestic-birth-record',
      'recognised-protection-substitute',
      'missing',
    ]),
    ...flags('hasAmka', 'hasTaxAssessments'),
    choice('feeClass', ['ordinary', 'reduced']),
    date('publicationDate'),
    dateOr('oathDate', 'not-taken'),
  ],
};

const familyKinds = [
  'spouse',
  'registered-partner',
  'ascendant',
  'child',
  'other',
] as const;
export const goldenVisaSections: Partial<Record<GreeceSection, GreeceField[]>> =
  {
    gvApplication: [
      choice('stage', ['initial', 'renewal']),
      date('overseasFilingDate'),
      date('overseasEvidenceCompletedOn'),
      choice('regime', ['current', 'legacy-card', 'transition']),
      choice('originalGrantTier', ['standard', 'conversion', 'listed'], {
        labels: { listed: 'listed-building' },
      }),
      bool('originalConditionsStillMet'),
      choice('legacyZone', ['legacy-high', 'legacy-other']),
      num('depositPercent'),
      date('depositDate'),
      date('closingDate'),
      bool('replacementProperty'),
    ],
    gvProperty: [
      choice(
        'kind',
        [
          'standard',
          'construction',
          'conversion',
          'factory-conversion',
          'listed',
        ],
        { label: 'investmentKind', labels: { listed: 'listed-building' } },
      ),
      choice('zone', ['named-high-cost', 'other-mainland', 'other-island']),
      int('censusPopulation'),
      int('propertyCount'),
      num('qualifyingValueEur', { hint: 'qualifyingValueEur' }),
      choice('acquisition', ['purchase', 'inheritance', 'parental-gift']),
      num('assessedValueEur'),
      choice('title', [
        'sole',
        'spouses',
        'own-share',
        'wholly-owned-eu-company',
        'qualifying-tourist-lease',
        'qualifying-company-timeshare',
        'ineligible',
      ]),
      choice('touristLeaseKind', ['timeshare', 'long-term-complex']),
      bool('eotLeaseAcknowledgment'),
      bool('builtOrBuildingPermit'),
      num('mainAreaSqm'),
      bool('conversionComplete'),
      date('conversionCompletedOn'),
      date('conversionActDate'),
      num('factoryIdleYears'),
      bool('fullyPaidAndConditionsReleased'),
    ],
    gvEvidence: [
      choice('payment', [
        'bank-transfer',
        'crossed-cheque',
        'greek-pos',
        'other',
      ]),
      choice('payer', [
        'applicant',
        'spouse-partner',
        'relative-within-second-degree',
        'other',
      ]),
      bool('notarialEvidence'),
      {
        ...base('registeredTransferEvidence'),
        type: 'boolean',
        extra: ['application-receipt', 'lawyer-application-certificate'],
      },
      bool('registrationProofSubmittedAtGrant'),
      bool('e9DeclarationCopy'),
      bool('companyOwnershipDocumentsReady'),
      bool('constructionDocumentsReady'),
      bool('renewalUseDeclarationsReady'),
    ],
    gvUse: [
      choice('use', [
        'residential-or-long-let',
        'short-let-or-short-sublet',
        'sharing-economy-short-let',
        'short-sublet',
        'sublet-terms-unknown',
        'long-tourist-sublet-with-services',
        'business-office',
      ]),
      bool('worksInGreeceUnderThisPermit'),
      bool('retainsInvestment'),
      bool('listedRestorationComplete'),
    ],
    gvFamily: [
      list('family', [
        choice('kind', familyKinds, { ...req, label: 'memberKind' }),
        date('birthDate'),
        bool('filingDocumentsReady'),
        bool('unmarriedWithRequiredCustody'),
        bool('incapacityDocumentedAndLivingAsDependant'),
        bool('convertingPreviousFamilyCard'),
      ]),
      int('nationalVisas'),
    ],
  };

const retention = group('retention', [
  choice(
    'basis',
    [
      'widowhood',
      'divorce',
      'custody',
      'access-in-greece',
      'domestic-violence',
      'none',
    ],
    { label: 'retentionBasis' },
  ),
  date('eventDate'),
  date('childBirthDate'),
  date('applicationDate'),
  date('marriageFrom'),
  date('divorceDurationEnd', { hint: 'divorceDurationEnd' }),
  date('greeceResidenceFrom'),
  choice('livelihood', [
    'employment',
    'qualifying-family',
    'resources',
    'none',
  ]),
  choice('resourcesAssessment', ['accepted', 'rejected', 'pending']),
]);
const familyResidence = [
  date('residenceFrom', { hint: 'residenceFrom' }),
  bool('qualifyingResidenceDocumented'),
  date('priorCardExpiry'),
  date('permanentRightAcquiredOn'),
  num('longestAbsenceAfterPrYears'),
];
export const greekFamilySections: Partial<
  Record<GreeceSection, GreeceField[]>
> = {
  familyRelation: [
    choice(
      'stage',
      ['initial', 'renewal', 'permanent', 'retained', 'maintain'],
      {
        labels: { permanent: 'permanent-card' },
      },
    ),
    choice('relationship', [
      'spouse',
      'registered-partner',
      'descendant',
      'child-with-incapacity',
      'ascendant',
      'parent-of-resident-greek-minor',
      'minor-sibling-of-resident-greek-minor',
      'dependent-needs-personal-care',
      'other',
    ]),
    bool('registeredInGreece'),
    choice('partnershipConcludedAt', ['greece', 'greek-consulate', 'other']),
    date('greekRelativeBirthDate'),
    ...flags(
      'dependent',
      'incapacityDocumentedAndLivingAsDependant',
      'genuineRelationship',
    ),
  ],
  familyResidence: [
    ...familyResidence,
    date('initialFilingFrom'),
    bool('stableResidenceInGreece'),
    date('initialCardGrantedOn'),
    bool('permanentRightAtCardExpiry'),
    bool('siblingExtensionAlreadyGranted'),
    num('interruptionAfterExpiryYears'),
    num('longestConsecutiveAbsenceYears'),
    num('maxAnnualAbsenceMonths', { hint: 'annualSummary' }),
    choice(
      'extendedAbsence',
      ['compulsory-service', 'single-serious-reason', 'ordinary'],
      { hint: 'extendedAbsence' },
    ),
    num('extendedAbsenceMonths'),
  ],
  familyDocuments: flags(
    'appliedForFullPublicCover',
    'initialFamilyDocumentsReady',
    'ordinaryRenewalDocumentsReady',
    'retainedRightDocumentsReady',
    'historicalConversionDocumentsReady',
  ),
  familyRetention: [retention],
};

export const euFamilySections: Partial<Record<GreeceSection, GreeceField[]>> = {
  familyRelation: [
    choice(
      'stage',
      [
        'initial',
        'renewal',
        'permanent',
        'permanent-renewal',
        'retained',
        'maintain',
      ],
      { labels: { permanent: 'permanent-card' } },
    ),
    ...flags('qualifyingNonGreekEuSponsor', 'sponsorExercisedTreatyRights'),
    bool('studentSponsor'),
    choice('relationship', [
      'spouse',
      'registered-partner',
      'descendant',
      'ascendant',
      'primary-carer-of-mobile-eu-minor',
      'durable-partner',
      'extended-family',
      'other',
    ]),
    ...flags(
      'partnershipRecognisedAsMarriageEquivalent',
      'dependent',
      'incapacityDocumentedAndLivingAsDependant',
      'extendedFamilyRecognised',
      'shamOrFraud',
    ),
    group('primaryCare', [
      date('childBirthDate'),
      choice('residenceBasis', [
        'self-sufficient',
        'worker-or-self-employed',
        'permanent',
      ]),
      ...flags('sufficientResourcesForBoth', 'comprehensiveCoverForBoth'),
    ]),
  ],
  familyResidence: [
    date('arrivedOn'),
    ...familyResidence,
    bool('priorCardIssued'),
    bool('permanentRightAcquired'),
    num('maxOrdinaryAnnualAbsenceMonths', { hint: 'annualSummary' }),
    int('seriousAbsenceCount', { hint: 'seriousAbsence' }),
    num('maxSeriousAbsenceMonths', { hint: 'seriousAbsence' }),
    group('early', [
      choice(
        'basis',
        [
          'none',
          'retirement',
          'self-employed-retirement-without-pension',
          'permanent-incapacity',
          'occupational-incapacity',
          'worker-death',
          'occupational-death',
          'cross-border-worker',
        ],
        { ...req, label: 'earlyBasis' },
      ),
      date('eventDate'),
      date('sponsorBirthDate'),
      date('sponsorResidentFrom'),
      num('precedingWorkMonths'),
      ...flags(
        'livedTogetherAtEvent',
        'greekSpouseDurationExemption',
        'survivingSpouseLostGreekNationalityByMarriage',
        'weeklyReturnAndPriorContinuousWork',
      ),
    ]),
  ],
  familyDocuments: [
    bool('appliedForFullPublicCover'),
    date('publicHealthConditionBeganOn'),
    bool('rightsDocumentsReady'),
  ],
  familyRetention: [
    retention,
    group('partnerRenewal', [
      bool('sponsorConfirmsContinuingRelationship'),
      date('separationOn'),
      date('marriageFrom'),
      date('greeceResidenceFrom'),
      choice('resourcesAssessment', ['accepted', 'rejected', 'pending']),
    ]),
    group('schooling', [
      choice('sponsorEvent', ['departure', 'death']),
      choice('applicant', ['child', 'parent-with-actual-custody', 'other'], {
        label: 'schoolingApplicant',
      }),
      ...flags('childResidesInGreece', 'childStillEnrolledInGreece'),
    ]),
  ],
};

export const workSections: Partial<Record<GreeceSection, GreeceField[]>> = {
  workCategory: [
    choice('permit', ['E1', 'E4'], { label: 'workPermit' }),
    choice('stage', ['initial', 'renewal']),
    choice('admission', [
      'ordinary',
      'domestic-switch',
      'strategic-project',
      'blue-card-mobility',
    ]),
    group('mobility', [
      date('residenceFrom', { label: 'mobilityResidenceFrom' }),
      date('enteredGreeceOn'),
      ...flags('previousMove', 'validForeignBlueCardCopy'),
    ]),
    group('switchVisa', [
      choice('kind', ['standalone-Z', 'leads-to-permit'], {
        ...req,
        label: 'switchVisaKind',
      }),
      date('expiresOn', { label: 'switchVisaExpiresOn' }),
    ]),
    bool('sameJobOnGreekHighlyQualifiedPermit'),
  ],
  workContract: [
    num('contractMonths'),
    ...flags(
      'contractDocumented',
      'fullTimeEmployment',
      'hiringNotificationFiled',
      'hasCurrentEmploymentContract',
    ),
    num('grossAnnualEur'),
    choice('payBasis', ['monthly', 'daily']),
    num('grossPayEur'),
    choice('qualification', [
      'regulated-recognised',
      'unregulated-documented',
      'previously-verified-in-Greece',
      'missing',
    ]),
    bool('permanentAddressAvailable'),
  ],
  workEmployer: [
    bool('employerApproval'),
    choice('employer', [
      'private-individual',
      'agriculture',
      'business',
      'agency',
    ]),
    int('sponsoredWorkers'),
    num('employerLastYearGrossEur'),
    ...flags('taxEvidenceSupportsContractPay', 'occupationMatchesBusiness'),
    choice('agriculturalStaffingCertificate', [
      'provided',
      'not-required',
      'missing',
    ]),
    num('agencyCapitalEur'),
    ...flags('agencyManagementClear', 'hostContractAndTaxEvidence'),
    ...flags('quotaAvailable', 'projectCertified'),
    int('projectWorkersTotal'),
  ],
  workRenewal: [
    choice('blueRenewalInterruption', [
      'unemployment',
      'illness-disability-parental-leave',
    ]),
    num('blueCardYears'),
    num('interruptionMonths'),
    ...flags(
      'protectedLeaveAccepted',
      'taxesSettledDuringPermit',
      'insuranceApplicationFiled',
      'activePublicCoverAfterGap',
    ),
  ],
};

export const familyTcnSections: Partial<Record<GreeceSection, GreeceField[]>> =
  {
    tcnSponsor: [
      choice('stage', ['initial', 'renewal', 'autonomous']),
      choice('sponsor', [
        'ordinary',
        'blue-card',
        'intra-corporate',
        'special-employment',
        'investor',
        'researcher',
        'refugee',
        'excluded',
      ]),
      num('sponsorLawfulYears'),
      date('sponsorLawfulFrom'),
      num('sponsorPermitDurationYears'),
      ...flags('sponsorPermitLeadsToPermanentResidence', 'sponsorPermitValid'),
      choice('sponsorRenewal', ['pending', 'valid-certificate']),
      bool('jointInitialApplication'),
      num('sponsorPersonalNetEur', { hint: 'sponsorPersonalNetEur' }),
      ...flags('stableIncome', 'priorYearTaxAndInsuranceEvidence'),
    ],
    tcnFamily: [
      choice('member', [
        'spouse',
        'registered-partner',
        'child',
        'ascendant',
        'other',
      ]),
      bool('spouseIncluded'),
      int('childrenIncluded'),
      bool('bothParentsLawfullyInGreece'),
      choice('housingDocument', ['E9', 'Taxisnet', 'E2', 'none']),
      ...flags(
        'housingMeetsFamilyNeeds',
        'unmarriedChildWithCustodyAndConsent',
        'adultChildIncapacityDependencyProved',
        'soleEligibleSpouse',
        'formedLegallyInGreece',
        'relationshipAndDocumentsGenuine',
      ),
      date('relationshipCertificateIssuedOn'),
      ...flags('unchangedFamilyDeclaration', 'birthRecordProvesAge'),
      bool('familyLifeContinues'),
    ],
    tcnAutonomous: [
      choice(
        'autonomousBasis',
        ['residence', 'bereavement', 'divorce', 'hardship', 'child'],
        { labels: { child: 'child-card' } },
      ),
      ...flags(
        'previousFamilyCard',
        'previousAutonomousChildCard',
        'otherResidencePermitGranted',
        'appliedForFullPublicCover',
        'privateCoverPermitted',
      ),
      num('familyResidenceYears'),
      date('firstFamilyPermitIssuedOn'),
      num('yearsSinceFirstFamilyPermit'),
      date('familyResidenceFrom'),
      num('blueFamilyYearsInEU'),
      date('blueFamilyResidenceFrom'),
      date('sponsorDiedOn'),
      num('priorMarriageYears'),
      num('priorMarriageYearsInGreece'),
      bool('hardshipDocumented'),
    ],
  };
