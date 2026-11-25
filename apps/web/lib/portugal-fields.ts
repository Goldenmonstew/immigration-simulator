import {
  PT_NATIONALITY_ROUTES,
  PT_PERMIT_KINDS,
  type PtFreeMovementEvidence,
  type PtFullRequest,
  type PtInvestment,
  type PtInvestmentEvidence,
  type PtLanguageEvidence,
  type PtLongTermEvidence,
  type PtMeansEvidence,
  type PtOfficialReview,
  type PtPartnerEvidence,
  type PtRenewalEvidence,
  type PtResidenceEvidence,
} from '@uk-immigration/engine';
import type { ptFormZh } from '../i18n/countries/portugal-form';

type Suffix<P extends string> =
  Extract<
    keyof typeof ptFormZh,
    `pt.${P}.${string}`
  > extends `pt.${P}.${infer S}`
    ? S
    : never;
export type PtFieldLabel = Suffix<'field'>;
export type PtHint = Suffix<'hint'>;
export type PtSectionId = Suffix<'section'>;

export const PT_TARGETS = [
  'naturalisation',
  'permanent',
  'long-term',
  'investment',
  'renewal',
  'free-movement',
  'partner',
] as const;
export type PtTarget = (typeof PT_TARGETS)[number];

export const ptPathwayByTarget: Record<PtTarget, string> = {
  naturalisation: 'PT-NATURALISATION',
  permanent: 'PT-PERMANENT',
  'long-term': 'PT-EU-LONG-TERM',
  investment: 'PT-GOLDEN-VISA',
  renewal: 'PT-TEMPORARY-RENEWAL',
  'free-movement': 'PT-FREE-MOVEMENT-PERMANENT',
  partner: 'PT-PARTNER-NATIONALITY',
};

interface When {
  name: string;
  values: readonly unknown[];
}

export type PortugalField = {
  name: string;
  label: PtFieldLabel;
  hint?: PtHint;
  required?: boolean;
  // Shown only while a sibling answer in the same record has one of these values.
  when?: When;
  // A filing that has happened: on or before the simulation date.
  filed?: boolean;
} & (
  | { type: 'boolean' | 'date' | 'number' | 'integer' | 'percent' }
  | {
      type: 'choice' | 'multi';
      options: readonly string[];
      // Option labels are `pt.option.<set>.<value>`.
      set: string;
    }
  | { type: 'group' | 'list'; fields: PortugalField[] }
);

interface Extra {
  name?: string;
  hint?: PtHint;
  required?: boolean;
  when?: When;
  filed?: boolean;
}

const base = (label: PtFieldLabel, extra: Extra = {}) => ({
  ...extra,
  name: extra.name ?? label,
  label,
});
const bool = (label: PtFieldLabel, extra?: Extra): PortugalField => ({
  ...base(label, extra),
  type: 'boolean',
});
const date = (label: PtFieldLabel, extra?: Extra): PortugalField => ({
  ...base(label, extra),
  type: 'date',
});
const number = (label: PtFieldLabel, extra?: Extra): PortugalField => ({
  ...base(label, extra),
  type: 'number',
});
const integer = (label: PtFieldLabel, extra?: Extra): PortugalField => ({
  ...base(label, extra),
  type: 'integer',
});
const percent = (label: PtFieldLabel, extra?: Extra): PortugalField => ({
  ...base(label, extra),
  type: 'percent',
});
const choice = (
  label: PtFieldLabel,
  options: readonly string[],
  extra?: Extra & { set?: string },
): PortugalField => ({
  ...base(label, extra),
  type: 'choice',
  options,
  set: extra?.set ?? label,
});
const multi = (
  label: PtFieldLabel,
  options: readonly string[],
): PortugalField => ({ ...base(label), type: 'multi', options, set: label });
const group = (
  label: PtFieldLabel,
  fields: PortugalField[],
  extra?: Extra,
): PortugalField => ({ ...base(label, extra), type: 'group', fields });
const list = (
  label: PtFieldLabel,
  fields: PortugalField[],
  extra?: Extra,
): PortugalField => ({ ...base(label, extra), type: 'list', fields });
const on = (name: string, ...values: unknown[]): When => ({ name, values });

const reviews = [
  'clear',
  'barred',
  'pending',
] as const satisfies readonly PtOfficialReview[];
const review = (label: PtFieldLabel, extra?: Extra) =>
  choice(label, reviews, { ...extra, set: 'review' });
const compliance = [
  'compliant',
  'recognized-arrangement',
  'exempt',
  'arrears',
  'pending',
] as const satisfies readonly NonNullable<PtResidenceEvidence['tax']>[];
const tripRows = [
  date('departed', { required: true }),
  date('returned', { required: true }),
];

const languageKinds = [
  'accepted',
  'ciple',
  'pla',
  'portuguese-school',
  'foreign-portuguese-school',
  'basic-course',
  'pan',
  'recognized-ple-test',
  'dual-certificate',
  'other',
  'none',
] as const satisfies readonly PtLanguageEvidence['kind'][];
const languageFields = [
  choice('languageKind', languageKinds, { name: 'kind' }),
  bool('languageRecognized', {
    name: 'recognized',
    when: on(
      'kind',
      'pla',
      'basic-course',
      'portuguese-school',
      'foreign-portuguese-school',
      'recognized-ple-test',
      'dual-certificate',
    ),
  }),
  choice('languageLevel', ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'], {
    name: 'level',
    when: on('kind', 'pla', 'basic-course'),
  }),
  integer('schoolYears', { when: on('kind', 'portuguese-school') }),
  number('courseHours', { when: on('kind', 'dual-certificate') }),
  bool('accommodationRequested', { when: on('kind', 'none') }),
];

export const basicFields = [
  date('simulationDate', { required: true, hint: 'simulationDate' }),
  choice('route', PT_NATIONALITY_ROUTES, { required: true, hint: 'route' }),
  date('birthDate', { hint: 'birthDate' }),
];

export const historyFields = [
  list(
    'permits',
    [
      choice('permitKind', PT_PERMIT_KINDS, { name: 'kind', required: true }),
      date('permitFrom', { name: 'from', required: true }),
      date('permitTo', { name: 'to', hint: 'permitTo' }),
    ],
    { required: true, hint: 'permits' },
  ),
  list('trips', tripRows, { required: true, hint: 'trips' }),
];

const crime = group('crime', [
  review('crimeReview', { name: 'review' }),
  choice('crimeRecord', ['none', 'conviction'], { name: 'record' }),
  ...(
    [
      bool('crimeFinal', { name: 'final' }),
      bool('crimeImprisonment', { name: 'imprisonment' }),
      bool('crimeEffective', { name: 'effective' }),
      number('crimeYears', { name: 'years' }),
      bool('punishableInPortugal'),
      choice('crimeCategory', ['specified-serious-offence', 'other'], {
        name: 'category',
      }),
      bool('suspendedOrRehabilitationUnclear'),
    ] satisfies PortugalField[]
  ).map((field) => ({ ...field, when: on('record', 'conviction') })),
]);

const meansSources = [
  'employment',
  'self-employment',
  'pension',
  'savings',
  'scholarship',
  'support',
  'contributory-benefit',
  'solidarity-benefit',
  'other',
] as const satisfies readonly NonNullable<PtMeansEvidence['sources']>[number][];

const investmentKinds = [
  'jobs',
  'research',
  'culture',
  'fund',
  'company',
  'legacy',
] as const satisfies readonly PtInvestment['kind'][];
const investmentOption = group(
  'investmentOption',
  [
    choice('investmentKind', investmentKinds, { name: 'kind' }),
    integer('jobs', { when: on('kind', 'jobs') }),
    bool('lowDensity', { when: on('kind', 'jobs', 'research', 'culture') }),
    number('eur', {
      when: on('kind', 'research', 'culture', 'fund', 'company'),
    }),
    bool('recipientQualified', { when: on('kind', 'research', 'culture') }),
    number('maturityYears', { when: on('kind', 'fund') }),
    percent('portugalShare', { when: on('kind', 'fund') }),
    bool('portugueseLaw', { when: on('kind', 'fund') }),
    choice('transaction', ['incorporation', 'capital-increase'], {
      when: on('kind', 'company'),
    }),
    integer('permanentJobsCreated', { when: on('kind', 'company') }),
    integer('jobsMaintained', { when: on('kind', 'company') }),
    integer('permanentJobsMaintained', { when: on('kind', 'company') }),
    bool('jobPeriodConfirmed', { when: on('kind', 'company') }),
    bool('portugueseCompany', { when: on('kind', 'company') }),
    choice('historicalType', ['capital', 'property', 'renovation'], {
      when: on('kind', 'legacy'),
    }),
    date('originalApplication', { when: on('kind', 'legacy') }),
    bool('protectedProceeding', { when: on('kind', 'legacy') }),
    review('transition', { when: on('kind', 'legacy') }),
  ],
  { name: 'investment' },
);

const grant = on('operation', 'grant');

/** A path from the draft root to the record a section edits. */
export type PtPath = readonly string[];

export interface PortugalSection {
  // The first two steps show their questions without collapsible sections.
  id: PtSectionId | 'basics' | 'history';
  path: PtPath;
  fields: PortugalField[];
  show?: (draft: PtSectionDraft) => boolean;
}

// The answers a section may depend on. Kept structural to avoid a cycle with the draft module.
export interface PtSectionDraft {
  targets: readonly PtTarget[];
  permits?: PtFullRequest['permits'];
  longTerm: PtLongTermEvidence;
  investment: PtInvestmentEvidence;
  freeMovement: PtFreeMovementEvidence;
}

const has = (target: PtTarget) => (draft: PtSectionDraft) =>
  draft.targets.includes(target);

export interface PortugalStep {
  title: Extract<keyof typeof ptFormZh, `pt.form.step${string}`>;
  show: (draft: PtSectionDraft) => boolean;
  sections: PortugalSection[];
}

const longTermOperation = (draft: PtSectionDraft) =>
  draft.longTerm.operation ??
  (draft.permits?.some((permit) => permit.kind === 'eu-long-term')
    ? 'retain'
    : 'grant');

export const portugalSteps: PortugalStep[] = [
  {
    title: 'pt.form.step0',
    show: () => true,
    sections: [{ id: 'basics', path: [], fields: basicFields }],
  },
  {
    title: 'pt.form.step1',
    show: (draft) => draft.targets.some((target) => target !== 'partner'),
    sections: [{ id: 'history', path: [], fields: historyFields }],
  },
  {
    title: 'pt.form.step2',
    show: (draft) =>
      draft.targets.includes('naturalisation') ||
      draft.targets.includes('partner'),
    sections: [
      {
        id: 'natFiling',
        path: [],
        show: has('naturalisation'),
        fields: [
          date('pendingApplication', {
            hint: 'pendingApplication',
            filed: true,
          }),
          date('residenceApplied', { hint: 'residenceApplied' }),
          choice('emancipation', ['recognized', 'none', 'uncertain'], {
            hint: 'emancipation',
          }),
          date('emancipationFrom', { when: on('emancipation', 'recognized') }),
        ],
      },
      {
        id: 'natStatus',
        path: ['nationality'],
        show: has('naturalisation'),
        fields: [
          bool('statelessRecognized'),
          bool('officialPortugueseCountryNational', {
            hint: 'officialPortugueseCountryNational',
          }),
          bool('bornInOfficialPortugueseCountry'),
          bool('languagePresumptionDisputed'),
        ],
      },
      {
        id: 'natLanguage',
        path: ['nationality'],
        show: has('naturalisation'),
        fields: [
          group('nationalityLanguage', languageFields, { name: 'language' }),
          bool('newLanguageAccepted'),
          bool('cultureAccepted'),
          bool('civicsAccepted'),
          choice('declaration', ['completed', 'willing', 'refused']),
        ],
      },
      {
        id: 'natMeans',
        path: ['nationality'],
        show: has('naturalisation'),
        fields: [
          multi('meansSources', meansSources),
          bool('meansEvidenceAvailable'),
          bool('nationalityDocuments', { name: 'documentsReady' }),
        ],
      },
      {
        id: 'natReview',
        path: ['nationality'],
        fields: [crime, review('security'), review('sanctions')],
      },
    ],
  },
  {
    title: 'pt.form.step3',
    show: (draft) =>
      draft.targets.some(
        (target) =>
          target === 'permanent' ||
          target === 'long-term' ||
          target === 'investment' ||
          target === 'renewal',
      ),
    sections: [
      {
        id: 'resProcedure',
        path: [],
        show: has('permanent'),
        fields: [
          choice('permanentOperation', ['grant', 'replace', 'retain'], {
            hint: 'operation',
          }),
        ],
      },
      {
        id: 'resMeans',
        path: ['residence', 'means'],
        fields: [
          choice('region', ['mainland', 'madeira', 'azores']),
          integer('otherAdults'),
          integer('dependantChildren'),
          number('monthlyEligibleEur', { hint: 'monthlyEligibleEur' }),
          number('confirmedMonthlyMinimumEur', {
            hint: 'confirmedMonthlyMinimumEur',
          }),
          integer('supportedMonths'),
          bool('stable'),
          bool('solidarityReliance'),
          review('officialAssessment'),
        ],
      },
      {
        id: 'resHome',
        path: ['residence'],
        fields: [
          choice('accommodation', ['documented', 'alternative-proof', 'none']),
          choice('healthCoverage', [
            'sns-proof',
            'valid-insurance',
            'number-only',
            'unverified-policy',
            'none',
          ]),
          group('residenceLanguage', languageFields, { name: 'language' }),
        ],
      },
      {
        id: 'resCompliance',
        path: ['residence'],
        fields: [
          choice('tax', compliance, { set: 'compliance' }),
          choice('socialSecurity', compliance, { set: 'compliance' }),
          bool('travelDocumentValid'),
          bool('criminalRecordAvailable'),
          review('statusCancellation'),
        ],
      },
      {
        id: 'resSentence',
        path: ['residence', 'criminalSentence'],
        fields: [
          choice('sentenceScope', ['complete', 'uncertain'], { name: 'scope' }),
          number('totalYears', { hint: 'totalYears' }),
          bool('permanentWindowVerified'),
          list('convictions', [
            date('convictionDate', { name: 'date', required: true }),
            number('convictionYears', { name: 'years', required: true }),
            bool('fallsUnderPortugueseRule'),
            bool('suspended'),
            bool('expresslyCountedSuspendedOffence', {
              when: on('suspended', true),
            }),
          ]),
        ],
      },
      {
        id: 'resRefusal',
        path: ['residence', 'generalRefusal'],
        fields: [
          review('refusalReview', { name: 'review' }),
          bool('sisAlert'),
          bool('ucfeExclusion'),
          number('longestFinalPortuguesePrisonYears'),
          integer('comparablePortugueseConvictions'),
        ],
      },
      {
        id: 'resFees',
        path: ['residence', 'fees'],
        fields: [
          choice('feeColumn', ['left', 'right'], { name: 'column' }),
          choice('feeExemption', ['confirmed', 'unresolved', 'none'], {
            name: 'exemption',
          }),
          bool('feePaid', { name: 'paid' }),
        ],
      },
    ],
  },
  {
    title: 'pt.form.step4',
    show: has('long-term'),
    sections: [
      {
        id: 'ltProcedure',
        path: ['longTerm'],
        fields: [
          choice(
            'longTermOperation',
            ['grant', 'replace', 'retain', 'recover'],
            { name: 'operation', hint: 'operation' },
          ),
          choice(
            'longTermBasis',
            ['ordinary', 'international-protection', 'blue-card'],
            { name: 'basis' },
          ),
          choice('currentCategory', [
            'qualifying',
            'study',
            'temporary-protection',
            'protection-pending',
            'seasonal',
            'posted-or-temporary-services',
            'diplomatic',
          ] satisfies NonNullable<PtLongTermEvidence['currentCategory']>[]),
        ],
      },
      {
        id: 'ltProtection',
        path: ['longTerm'],
        show: (draft) => draft.longTerm.basis === 'international-protection',
        fields: [
          date('protectionApplicationDate'),
          bool('qualifyingProtectionGranted'),
          bool('protectionContinuityVerified'),
          review('protectionWithdrawal'),
        ],
      },
      {
        id: 'ltBlueCard',
        path: ['longTerm', 'blueCard'],
        show: (draft) => draft.longTerm.basis === 'blue-card',
        fields: [
          bool('issuedByPortugal'),
          date('continuousQualifyingEuFrom'),
          date('continuousPortugueseBlueCardFrom'),
          bool('staysVerified'),
          list('blueCardEuAbsences', tripRows, {
            name: 'euAbsences',
            hint: 'euAbsences',
          }),
        ],
      },
      {
        id: 'ltReview',
        path: ['longTerm'],
        fields: [
          list('acceptedWorkPostings', tripRows, {
            hint: 'acceptedWorkPostings',
          }),
          review('longTermPublicOrder', { name: 'publicOrder' }),
          review('memberStateChecks'),
        ],
      },
      {
        id: 'ltLoss',
        path: ['longTerm'],
        show: (draft) => longTermOperation(draft) !== 'grant',
        fields: [
          choice('lossReason', [
            'none',
            'absence',
            'fraud',
            'expulsion',
            'another-state',
          ]),
          review('lossReview'),
          review('lossException'),
          bool('formerBlueCard'),
          list('longTermEuAbsences', tripRows, {
            name: 'euAbsences',
            hint: 'euAbsences',
          }),
        ],
      },
    ],
  },
  {
    title: 'pt.form.step5',
    show: has('investment'),
    sections: [
      {
        id: 'invProcedure',
        path: ['investment'],
        fields: [
          choice(
            'investmentOperation',
            ['grant', 'renew', 'convert', 'replace-permanent'],
            { name: 'operation', required: true },
          ),
          choice('holder', ['investor', 'family']),
        ],
      },
      {
        id: 'invFamily',
        path: ['investment'],
        show: (draft) =>
          draft.investment.holder === 'family' &&
          (draft.investment.operation === 'grant' ||
            draft.investment.operation === 'renew'),
        fields: [
          choice('sponsorAriStatus', ['approved', 'pending', 'refused'], {
            when: grant,
          }),
          bool('sponsorAriValid', { when: grant }),
          bool('relationshipContinues'),
          bool('familyEvidenceAccepted'),
          choice('familyApplicationChannel', ['abroad', 'in-portugal'], {
            when: grant,
          }),
        ],
      },
      {
        id: 'invEntry',
        path: ['investment'],
        show: (draft) => draft.investment.operation === 'grant',
        fields: [
          choice('entry', [
            'schengen-visa',
            'visa-free',
            'other-legal',
            'irregular',
          ]),
          bool('lawfullyInPortugal'),
          date('firstEntry'),
          date('regularizedOn', { hint: 'regularizedOn' }),
          review('entryReview'),
          bool('visaRefusalGround'),
          choice('socialRegistration', [
            'registered',
            'not-required',
            'missing',
          ]),
        ],
      },
      {
        id: 'invReview',
        path: ['investment'],
        show: (draft) => draft.investment.operation === 'grant',
        fields: [
          bool('qualifyingConviction'),
          number('convictionMaximumYears', {
            when: on('qualifyingConviction', true),
          }),
          review('admissionReview'),
          review('healthReview'),
          bool('domesticImmigrationAlert'),
          bool('euRestrictiveMeasure'),
        ],
      },
      {
        id: 'invDocuments',
        path: ['investment'],
        show: (draft) =>
          draft.investment.operation === 'grant' ||
          draft.investment.operation === 'renew',
        fields: [
          date('foreignRecordDate', { when: grant }),
          date('accompanyingTaxEvidenceDate', { when: grant }),
          bool('investmentDocuments', { name: 'documentsReady' }),
        ],
      },
      {
        id: 'invInvestment',
        path: ['investment'],
        show: (draft) =>
          draft.investment.holder !== 'family' &&
          (draft.investment.operation === 'grant' ||
            draft.investment.operation === 'renew'),
        fields: [
          investmentOption,
          date('investedOn', { when: grant }),
          bool('commercialVehicleQualified', { when: grant }),
          bool('realEstateExposure', { when: grant }),
          bool('investmentEvidenceAccepted', { when: grant }),
        ],
      },
      {
        id: 'invRenewal',
        path: ['investment'],
        show: (draft) => draft.investment.operation === 'renew',
        fields: [
          choice('maintenance', ['maintained', 'ended', 'changed']),
          review('investmentReview'),
        ],
      },
      {
        id: 'invPermanent',
        path: ['investment'],
        show: (draft) =>
          draft.investment.operation === 'convert' ||
          draft.investment.operation === 'replace-permanent',
        fields: [review('permanentTerms')],
      },
    ],
  },
  {
    title: 'pt.form.step6',
    show: (draft) =>
      draft.targets.includes('renewal') ||
      (draft.targets.includes('investment') &&
        draft.investment.operation === 'renew'),
    sections: [
      {
        id: 'renFiling',
        path: ['renewal'],
        show: has('renewal'),
        fields: [
          date('filedOn', { hint: 'filedOn', filed: true }),
          bool('lateSubmissionAccepted'),
          date('receiptIssuedOn'),
          date('receiptExtendedThrough'),
          date('releasedOn', { hint: 'releasedOn' }),
        ],
      },
      {
        id: 'renPurpose',
        path: ['renewal'],
        show: has('renewal'),
        fields: [
          choice('purpose', [
            'employment',
            'self-employment',
            'highly-qualified',
            'study',
            'research',
            'entrepreneur',
            'labour-integration',
            'blue-card',
            'other',
          ] satisfies NonNullable<PtRenewalEvidence['purpose']>[]),
          bool('purposeEvidence'),
          bool('studyInterruptionAccepted', { when: on('purpose', 'study') }),
          bool('studyEnrolled', { when: on('purpose', 'study') }),
          bool('studyProgress', { when: on('purpose', 'study') }),
          bool('feesAndInternshipEvidence', { when: on('purpose', 'study') }),
        ],
      },
      {
        id: 'renReview',
        path: ['renewal'],
        fields: [
          bool('residencePermitCancelled'),
          bool('servingSentence'),
          bool('expulsionOrdered', { when: on('servingSentence', true) }),
          choice('contumacia', ['none', 'lifted', 'active']),
          review('renewalPublicOrder', { name: 'publicOrder' }),
          bool('euRestrictiveMeasure'),
        ],
      },
    ],
  },
  {
    title: 'pt.form.step7',
    show: has('free-movement'),
    sections: [
      {
        id: 'fmStatus',
        path: ['freeMovement'],
        fields: [
          choice('freeMovementOperation', ['grant', 'retain'], {
            name: 'operation',
          }),
          date('permanentRightAcquiredOn', {
            hint: 'permanentRightAcquiredOn',
          }),
          choice(
            'applicant',
            ['eu-eea-swiss', 'third-country-family', 'andorra', 'other'],
            { hint: 'applicant' },
          ),
          choice(
            'freeMovementBasis',
            ['ordinary', 'retained-family', 'early-worker', 'early-family'],
            { name: 'basis' },
          ),
        ],
      },
      {
        id: 'fmFamily',
        path: ['freeMovement'],
        fields: [
          choice('relationship', [
            'spouse',
            'partner',
            'descendant',
            'ascendant',
            'other-family',
          ]),
          bool('relationshipVerified'),
          review('otherFamilyPermission', {
            when: on('relationship', 'other-family'),
          }),
          bool('sponsorEligible'),
          bool('accompaniesOrJoins'),
          bool('dependant'),
          date('derivedResidenceFrom'),
          bool('qualifyingResidenceWithSponsor'),
          bool('sponsorResidenceBasisEstablished'),
        ],
      },
      {
        id: 'fmResidence',
        path: ['freeMovement'],
        fields: [
          date('continuousResidenceFrom'),
          list(
            'absences',
            [
              ...tripRows,
              choice('absenceReason', ['ordinary', 'military', 'justified'], {
                name: 'reason',
              }),
              bool('absenceAccepted', { name: 'accepted' }),
            ],
            { hint: 'absences' },
          ),
          bool('expulsionExecuted'),
          review('historicalBasisReview'),
          choice('residenceBasis', [
            'worker',
            'self-employed',
            'student',
            'self-sufficient',
            'family',
            'retained-worker',
          ]),
          bool('identityAtEntryValid'),
          bool('enrolledInRecognizedSchool', {
            when: on('residenceBasis', 'student'),
          }),
          bool('sufficientResources'),
          bool('healthInsuranceRequired'),
          bool('healthInsuranceCovered'),
          bool('workerStatusRetained', {
            when: on('residenceBasis', 'retained-worker'),
          }),
        ],
      },
      {
        id: 'fmRetained',
        path: ['freeMovement'],
        show: (draft) => draft.freeMovement.basis === 'retained-family',
        fields: [
          choice('retentionEvent', [
            'death',
            'departure',
            'divorce',
            'annulment',
            'partnership-ended',
          ]),
          bool('retainedAsSchoolChildOrCarer'),
          choice('retainedBasis', [
            'worker',
            'self-employed',
            'resources-and-insurance',
            'qualifying-household',
            'none',
          ]),
        ],
      },
      {
        id: 'fmEarlyWorker',
        path: ['freeMovement', 'earlyWorker'],
        show: (draft) => draft.freeMovement.basis === 'early-worker',
        fields: [
          choice(
            'earlyReason',
            ['retirement', 'permanent-disability', 'cross-border'],
            { name: 'reason' },
          ),
          date('retiredOn', { when: on('reason', 'retirement') }),
          bool('retirementQualifies', { when: on('reason', 'retirement') }),
          bool('selfEmployedWithoutPension', {
            when: on('reason', 'retirement'),
          }),
          date('ceasedWorkOn', { when: on('reason', 'permanent-disability') }),
          bool('occupationalBenefit', {
            when: on('reason', 'permanent-disability'),
          }),
          bool('otherMemberStateWork', { when: on('reason', 'cross-border') }),
          date('otherMemberStateWorkFrom', {
            when: on('reason', 'cross-border'),
          }),
          bool('returnsWeekly', { when: on('reason', 'cross-border') }),
          date('earlyResidenceFrom', { name: 'continuousResidenceFrom' }),
          date('creditedWorkFrom'),
          bool('portuguesePartnerException'),
        ],
      },
      {
        id: 'fmEarlyFamily',
        path: ['freeMovement', 'earlyFamily'],
        show: (draft) => draft.freeMovement.basis === 'early-family',
        fields: [
          bool('residedInPortugalWithWorker'),
          bool('workerEarlyRight'),
          bool('workerDiedWhileWorking'),
          date('workerResidenceFrom'),
          date('deathDate'),
          bool('occupationalDeath'),
          bool('survivorLostPortugueseNationality'),
        ],
      },
      {
        id: 'fmDocuments',
        path: ['freeMovement'],
        fields: [
          choice(
            'freeMovementDocuments',
            [
              'standard',
              'accepted-alternative',
              'missing-or-expired',
            ] satisfies NonNullable<PtFreeMovementEvidence['documents']>[],
            {
              name: 'documents',
            },
          ),
          review('publicRestrictions'),
          choice('feeMode', ['digital', 'in-person', 'urgent', 'address-only']),
          bool('freeMovementFeePaid', { name: 'feePaid' }),
        ],
      },
    ],
  },
  {
    title: 'pt.form.step8',
    show: has('partner'),
    sections: [
      {
        id: 'partnerRelationship',
        path: ['partner'],
        fields: [
          choice(
            'partnerKind',
            ['marriage', 'civil-partnership', 'none'] satisfies NonNullable<
              PtPartnerEvidence['kind']
            >[],
            {
              name: 'kind',
            },
          ),
          date('relationshipFrom'),
          bool('current'),
          bool('portuguesePartner'),
          date('partnerPortugueseSince', { hint: 'partnerPortugueseSince' }),
          bool('registrationAccepted', { when: on('kind', 'marriage') }),
          bool('courtRecognition', { when: on('kind', 'civil-partnership') }),
          date('partnerStatementDate', {
            when: on('kind', 'civil-partnership'),
          }),
          date('partnerPending', {
            name: 'pendingApplication',
            hint: 'partnerPending',
            filed: true,
          }),
        ],
      },
      {
        id: 'partnerOpposition',
        path: ['partner'],
        fields: [
          bool('effectiveLinksEvidence'),
          bool('commonPortugueseChild'),
          review('connectionReview'),
          choice('foreignService', [
            'none',
            'technical-or-compulsory',
            'nontechnical-or-voluntary',
            'unclear',
          ]),
          review('serviceReview'),
          bool('partnerDocuments', { name: 'documentsReady' }),
        ],
      },
    ],
  },
];

export function fieldShown(field: PortugalField, record: object) {
  return (
    !field.when ||
    field.when.values.includes(
      (record as Record<string, unknown>)[field.when.name],
    )
  );
}
