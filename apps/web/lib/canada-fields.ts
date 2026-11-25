import type { CaFullPathwayId, CaFullRequest } from '@uk-immigration/engine';
import { canadaFull2026_11 } from '@uk-immigration/policy-data';
import type { caFormZh } from '../i18n/countries/canada-form';

type Suffix<P extends string> =
  Extract<
    keyof typeof caFormZh,
    `ca.${P}.${string}`
  > extends `ca.${P}.${infer S}`
    ? S
    : never;
export type CanadaFieldLabel = Suffix<'field'>;
export type CanadaSectionTitle = Suffix<'section'>;
export type CanadaStepTitle = Suffix<'step'>;
export type CanadaAnswers = Omit<CaFullRequest, 'simulationDate' | 'locale'>;

export interface CanadaDraftShape {
  simulationDate: string;
  goals: CaFullPathwayId[];
  answers: CanadaAnswers;
}

export type CanadaField = {
  name: string;
  label: CanadaFieldLabel;
  required?: boolean;
} & (
  | { type: 'boolean' | 'date' | 'text' | 'dates' | 'taxYears' }
  | { type: 'number' | 'integer'; max?: number }
  | { type: 'choice' | 'extension'; options: readonly string[]; set: string }
  | { type: 'tuple'; size: number; max: number }
  | { type: 'group'; fields: CanadaField[]; allowFalse?: boolean }
  // nonEmpty: an answered list always has a row, so there is no "no records".
  | { type: 'list'; fields: CanadaField[]; nonEmpty?: true }
  | { type: 'routes'; field: CanadaField }
);

export interface CanadaSection {
  id: CanadaSectionTitle;
  path: string[];
  fields: CanadaField[];
  when?: (draft: CanadaDraftShape) => boolean;
}

export interface CanadaStep {
  step: number;
  title: CanadaStepTitle;
  when: (draft: CanadaDraftShape) => boolean;
  sections: CanadaSection[];
}

export const residenceGoals = [
  'CA-RESIDENCY',
  'CA-CITIZENSHIP',
  'CA-CIT-MINOR-52',
] as const satisfies CaFullPathwayId[];
export const initialPrGoals = [
  'CA-EE-FSW',
  'CA-EE-CEC',
  'CA-EE-FST',
  'CA-PNP',
  'CA-QC-PSTQ',
  'CA-AIP',
  'CA-FAMILY',
] as const satisfies CaFullPathwayId[];
export const canadaGoals: CaFullPathwayId[] = [
  ...residenceGoals,
  ...initialPrGoals,
];

const v = canadaFull2026_11.values;
export const maxLevel = 12;
// A percentage cannot state the one-third share in IRPR s87(5)–(6)
// (SRC-261) exactly; this is the smallest two-decimal entry that reaches it.
export const equitySharePercent =
  Math.ceil(v.pnpInvestment.value.minEquityShare * 10_000) / 100;

type Label = CanadaFieldLabel;
const bool = (name: string, label = name as Label): CanadaField => ({
  name,
  label,
  type: 'boolean',
});
const flags = (...names: Label[]) => names.map((name) => bool(name));
const date = (name: string, label = name as Label): CanadaField => ({
  name,
  label,
  type: 'date',
});
const dates = (...names: Label[]) => names.map((name) => date(name));
const number = (name: string, label = name as Label): CanadaField => ({
  name,
  label,
  type: 'number',
});
const integer = (
  name: string,
  label = name as Label,
  max?: number,
): CanadaField => ({ name, label, type: 'integer', max });
const text = (name: string, label = name as Label): CanadaField => ({
  name,
  label,
  type: 'text',
});
const choice = (
  name: string,
  set: string,
  options: readonly string[],
  label = name as Label,
): CanadaField => ({ name, label, type: 'choice', set, options });
const group = (
  name: string,
  fields: CanadaField[],
  label = name as Label,
): CanadaField => ({ name, label, type: 'group', fields });
const list = (
  name: string,
  fields: CanadaField[],
  label = name as Label,
): CanadaField => ({ name, label, type: 'list', fields });
const required = (field: CanadaField): CanadaField => ({
  ...field,
  required: true,
});

const decision = ['none', 'pending', 'approved', 'refused'] as const;
const finding = ['clear', 'inadmissible', 'under-review'] as const;
const scope = ['required', 'officially-exempt', 'under-review'] as const;
const provinces = ['NS', 'NB', 'PE', 'NL', 'other'] as const;
const levelSkills = ['listening', 'speaking', 'reading', 'writing'] as const;
const level = (name: string) => integer(name, name as Label, maxLevel);
const teer = (name: string, label = name as Label) => integer(name, label, 5);
const percent = (name: string): CanadaField => ({
  name,
  label: name as Label,
  type: 'number',
  max: 100,
});

const has = (draft: CanadaDraftShape, ...goals: CaFullPathwayId[]) =>
  goals.some((goal) => draft.goals.includes(goal));

// Citizenship and the residency obligation share the travel record.
const adjustments = (name: string) =>
  group(name, [
    list('credits', [
      required(date('from')),
      required(date('to')),
      required(
        choice(
          'evidence',
          'adjustment',
          ['accepted', 'pending'],
          'adjustmentEvidence',
        ),
      ),
    ]),
    list('exclusions', [
      required(date('from')),
      required(date('to')),
      required(
        choice(
          'evidence',
          'adjustment',
          ['accepted', 'pending'],
          'adjustmentEvidence',
        ),
      ),
    ]),
  ]);

const languageEvidence = (name: string, label = name as Label) =>
  group(
    name,
    [
      choice(
        'test',
        'languageTest',
        [
          'CELPIP-General',
          'IELTS General Training',
          'PTE Core',
          'TEF Canada',
          'TCF Canada',
          'other',
        ],
        'languageTest',
      ),
      date('resultDate'),
      bool('revoked'),
      group('levels', levelSkills.map(level)),
    ],
    label,
  );

const educationEvidence = (name: string, label = name as Label) =>
  group(
    name,
    [
      choice(
        'level',
        'educationLevel',
        [
          'none',
          'secondary',
          'oneYear',
          'twoYears',
          'threeYears',
          'multipleIncludingThreeYears',
          'masters',
          'regulatedTeerOneEntryToPractice',
          'doctorate',
        ],
        'educationLevel',
      ),
      choice(
        'origin',
        'educationOrigin',
        ['Canada', 'foreign'],
        'educationOrigin',
      ),
      date('ecaDate'),
      bool('ecaRevoked'),
      bool('appropriateEca'),
    ],
    label,
  );

const settlementFunds = group('funds', [
  integer('familySize'),
  number('availableAtApplication'),
  number('availableAtIssue'),
  ...flags('verified', 'atIssuance'),
]);

const workHistory = list('workHistory', [
  required(date('from')),
  required(date('to')),
  required(text('noc')),
  required(teer('teer')),
  { name: 'dailyHours', label: 'dailyHours', type: 'tuple', size: 7, max: 24 },
  bool('dutiesConfirmed'),
  choice('pay', 'pay', ['paid', 'unpaid', 'lecturer-stipend']),
  bool('canadianEntityPays'),
  bool('inCanada', 'workInCanada'),
  ...flags(
    'canadianEmployer',
    'remoteWork',
    'authorizedTemporaryResident',
    'fullTimeStudent',
    'selfEmployed',
    'physicianException',
  ),
  date('independentlyQualifiedFrom'),
]);

const personFields = (member: boolean): CanadaField[] => [
  ...(member ? [date('dateOfBirth')] : []),
  group(
    'safety',
    ['security', 'humanRights', 'sanctions', 'organisedCrime'].map((name) =>
      choice(name, 'finding', finding),
    ),
  ),
  choice('criminalFinding', 'finding', finding),
  group('classifiedOffence', [
    required(choice('jurisdiction', 'jurisdiction', ['Canada', 'abroad'])),
    number('maximumCanadianYears'),
    number('imposedMonths'),
    ...flags('ordinaryGroundEstablished', 'outstandingWithoutRelief'),
    date('rehabilitationClockStart'),
  ]),
  choice('publicHealth', 'finding', finding),
  choice('publicSafety', 'finding', finding),
  choice('excessiveDemand', 'finding', finding),
  bool('familyExcessiveDemandExemption'),
  group('exam', [
    ...dates('examOn', 'instructionOn'),
    bool('panelExamComplete'),
    choice('disposition', 'disposition', [
      'exempt',
      'reuse-granted',
      'reuse-requested',
      'follow-up',
      'refused',
    ]),
    date('previousExamOn'),
    bool('inCanada', 'examInCanada'),
    bool('eligiblePreviousMedicalCode'),
    {
      name: 'instructionExtension',
      label: 'instructionExtension',
      type: 'extension',
      set: 'extension',
      options: ['until', 'late-exam-accepted', 'none', 'pending'],
    },
    date('extendedUntil'),
  ]),
  bool('definitiveChecklistSatisfied'),
  list('foreignStays', [
    required(date('from')),
    date('until'),
    required(bool('currentCountry')),
    choice('issuer', 'issuer', ['dubai-police', 'hong-kong-police']),
    ...dates('certificateIssued', 'certificateExpires'),
    {
      name: 'requestLetterStages',
      label: 'requestLetterStages',
      type: 'routes',
      field: choice(
        'stage',
        'letterStage',
        ['explanation-uploaded', 'letter-received'],
        'requestLetterStages',
      ),
    },
    {
      name: 'supplementReceipts',
      label: 'supplementReceipts',
      type: 'routes',
      field: date('receipt', 'supplementReceipts'),
    },
    ...flags('missing', 'exemptionGranted'),
  ]),
  bool('outstandingPoliceRequest'),
  choice('biometrics', 'biometrics', [
    'provided-for-pr',
    'exempt',
    'temporary-only',
    'pending',
    'not-provided',
  ]),
];

const dependentChild = [
  ...flags(
    'unmarriedAndUnpartnered',
    'dependentBeforeCutoffAndContinuing',
    'unableToSupportSelfDueToCondition',
    'custodyAndConsentReady',
  ),
  choice('relocationAuthority', 'relocation', [
    'no-separate-consent-required',
    'prohibited',
  ]),
];

const application: CanadaField = {
  name: 'applications',
  label: 'applications',
  type: 'routes',
  field: group('application', [
    date('filedOn'),
    ...flags(
      'signed',
      'allFamilyDeclared',
      'changesReported',
      'validIdentityAndTravelDocuments',
      'applicationEvidenceComplete',
      'processingFeesPaid',
    ),
    date('paymentOn'),
    bool('newFeeScheduleConfirmed'),
    integer('biometricPayers'),
    ...flags(
      'singleEligibleFamilyApplyingTogether',
      'rightFeeExemptForPrincipal',
    ),
    number('assessedTotalByIrcc'),
    number('amountPaidIncludingBiometrics'),
  ]),
};

const valuesAttestation = [
  bool('confirmedDisabilityExemption'),
  ...dates('issued', 'requestDate', 'authorisedSessionCompleted'),
  group(
    'online',
    [
      required(date('completed')),
      required(
        integer(
          'correctAnswers',
          'correctAnswers',
          v.quebecSelection.value.valuesQuestions,
        ),
      ),
      required(choice('attempt', 'attempt', ['first', 'second', 'final'])),
      date('previousAttempt'),
      bool('validStudyOrWorkPermit'),
    ],
    'valuesOnline',
  ),
  ...flags('refused', 'revoked'),
];

const quebecFrench = (name: string, label = name as Label) =>
  group(
    name,
    [
      choice(
        'evidence',
        'qcFrenchEvidence',
        ['approved-test', 'accepted-education', 'unrecognised'],
        'qcFrenchEvidence',
      ),
      date('testDate'),
      bool('revoked'),
      ...levelSkills.map(level),
    ],
    label,
  );

const csqStatus = ['valid', 'pending', 'expired', 'revoked'] as const;

export const canadaSteps: CanadaStep[] = [
  {
    step: 0,
    title: 'basics',
    when: () => true,
    sections: [
      {
        id: 'status',
        path: [],
        fields: [
          choice('citizenshipStatus', 'citizenship', [
            'not-citizen',
            'citizen',
            'possible-by-descent',
          ]),
          date('dateOfBirth'),
          date('permanentResident'),
        ],
      },
      {
        id: 'prStatus',
        path: ['residence'],
        fields: [
          choice('prStatus', 'prStatus', [
            'valid',
            'under-review',
            'lost',
            'never',
          ]),
          bool('prConditionsFulfilled'),
        ],
      },
    ],
  },
  {
    step: 1,
    title: 'presence',
    when: (d) => has(d, 'CA-RESIDENCY', 'CA-CITIZENSHIP'),
    sections: [
      {
        id: 'trips',
        path: [],
        fields: [
          list('trips', [
            required(date('departed')),
            required(date('returned')),
          ]),
        ],
      },
      {
        id: 'temporaryPeriods',
        path: [],
        when: (d) => has(d, 'CA-CITIZENSHIP'),
        fields: [
          list('temporaryPeriods', [
            required(date('from')),
            date('to', 'toBeforePr'),
          ]),
        ],
      },
      {
        id: 'prDays',
        path: ['residence'],
        when: (d) => has(d, 'CA-RESIDENCY'),
        fields: [
          adjustments('prDays'),
          group('enforcement', [
            required(date('decisionDate')),
            bool('laterFoundCompliant'),
          ]),
          choice('humanitarianRelief', 'decision', decision),
        ],
      },
      {
        id: 'citizenshipDays',
        path: ['residence'],
        when: (d) => has(d, 'CA-CITIZENSHIP'),
        fields: [adjustments('citizenshipDays')],
      },
    ],
  },
  {
    step: 2,
    title: 'prDocuments',
    when: (d) => has(d, 'CA-RESIDENCY'),
    sections: [
      {
        id: 'card',
        path: ['residence'],
        fields: [
          group('card', [
            required(
              choice(
                'kind',
                'cardKind',
                ['first', 'renew', 'replace', 'official-error'],
                'cardKind',
              ),
            ),
            ...flags('inCanada', 'canadianAddress'),
            date('firstCardDetailsDate'),
            ...flags(
              'photosAndSignaturesReady',
              'identityAndOldCardEvidenceReady',
              'noDisqualifyingOrderOrMisuse',
              'biometricsIfRequestedReady',
              'paid',
            ),
          ]),
        ],
      },
      {
        id: 'prtd',
        path: ['residence'],
        fields: [
          group('prtd', [
            ...flags('outsideCanada', 'lacksValidCard'),
            date('lastInCanada'),
            ...flags(
              'appealOpenOrPending',
              'travelAndResidencyEvidenceReady',
              'paid',
            ),
          ]),
        ],
      },
    ],
  },
  {
    step: 3,
    title: 'citizenship',
    when: (d) => has(d, 'CA-CITIZENSHIP', 'CA-CIT-MINOR-52'),
    sections: [
      {
        id: 'signing',
        path: ['residence'],
        fields: [
          ...dates('signingDate', 'grantDate'),
          choice('parent', 'parent', [
            'citizen',
            'co-applicant-pending',
            'co-applicant-granted',
            'not-citizen',
          ]),
          ...flags(
            'parentageConfirmed',
            'adultSigned',
            'authorizedRepresentativeSigned',
            'minorCountersignedOrExcused',
          ),
          choice('representativeWaiver', 'decision', decision),
          choice('minorPresenceWaiver', 'decision', decision),
        ],
      },
      {
        id: 'taxYears',
        path: ['residence'],
        when: (d) => has(d, 'CA-CITIZENSHIP'),
        fields: [{ name: 'taxYears', label: 'taxYears', type: 'taxYears' }],
      },
      {
        id: 'citizenshipLanguage',
        path: ['residence'],
        when: (d) => has(d, 'CA-CITIZENSHIP'),
        fields: [
          group(
            'language',
            [
              choice(
                'evidence',
                'citLanguage',
                [
                  'accepted-levels',
                  'accepted-alternative',
                  'self-assessed',
                  'rejected',
                ],
                'citLanguageEvidence',
              ),
              level('speaking'),
              level('listening'),
              choice('waiver', 'decision', decision, 'languageWaiver'),
            ],
            'citizenshipLanguage',
          ),
          group('test', [
            choice(
              'outcome',
              'testOutcome',
              ['passed', 'not-taken', 'retry', 'finally-failed'],
              'testOutcome',
            ),
            integer('correct', 'correct', v.citTestFormat.value.questions),
            integer('attemptsUsed'),
            choice('waiver', 'decision', decision, 'testWaiver'),
          ]),
        ],
      },
      {
        id: 'prohibitions',
        path: ['residence'],
        fields: [
          ...flags(
            'noEffectiveRemovalOrder',
            'noEffectiveSecurityDeclaration',
            'returnAuthorizedIfRequired',
            'noCurrentSentenceOrProbation',
            'noProhibitedCanadianProceedings',
            'noEquivalentForeignProceedings',
          ),
          choice('foreignProceedingsWaiver', 'decision', decision),
          bool('noWarCrimesProceedingsOrConviction'),
          group('history', [
            { name: 'convictions', label: 'convictions', type: 'dates' },
            {
              name: 'misrepresentationBars',
              label: 'misrepresentationBars',
              type: 'dates',
            },
            { name: 'revocations', label: 'revocations', type: 'dates' },
            ...flags(
              'noCurrentMisrepresentation',
              'specialProhibitionCleared',
              'classificationsConfirmed',
            ),
          ]),
        ],
      },
      {
        id: 'citizenshipDocuments',
        path: ['residence'],
        fields: [
          ...flags(
            'identityAndDeclarationsReady',
            'fingerprintAndCourtRequestsSatisfied',
          ),
          list('policeStays', [
            required(date('from')),
            required(date('to')),
            bool('certificateOrExceptionAccepted'),
          ]),
          choice('oath', 'oath', ['taken', 'waiting', 'refused']),
          choice('oathWaiver', 'decision', decision),
          ...flags('stillEligibleAtGrant', 'citizenshipFeesPaid'),
        ],
      },
      {
        id: 'caf',
        path: ['residence'],
        when: (d) => has(d, 'CA-CITIZENSHIP'),
        fields: [
          group('caf', [
            required(
              choice(
                'route',
                'cafRoute',
                ['ordinary', 'pr-member', 'attached-or-seconded'],
                'cafRoute',
              ),
            ),
            bool('serviceConfirmed'),
            date('signedForDate'),
            number('yearsOfQualifyingService'),
            choice('release', 'release', ['serving', 'honourable', 'other']),
          ]),
        ],
      },
    ],
  },
  {
    step: 4,
    title: 'applications',
    when: (d) => has(d, ...initialPrGoals),
    sections: [
      { id: 'applications', path: ['federal'], fields: [application] },
    ],
  },
  {
    step: 5,
    title: 'admissibility',
    when: (d) => has(d, ...initialPrGoals),
    sections: [
      {
        id: 'principal',
        path: ['federal', 'principal'],
        fields: personFields(false),
      },
      {
        id: 'members',
        path: ['federal'],
        fields: [
          list('members', [
            required(
              choice(
                'relationship',
                'memberRelationship',
                ['spouse', 'common-law', 'child', 'grandchild'],
                'memberRelationship',
              ),
            ),
            ...flags(
              'accompanying',
              'relationshipBrokenDown',
              'custodyOrAuthorityUnderSection23',
            ),
            choice('otherAdmissibility', 'finding', finding),
            choice('statutoryFamilyScope', 'scope', scope),
            choice('examinationScope', 'scope', scope),
            ...personFields(true),
            ...dependentChild,
          ]),
        ],
      },
      {
        id: 'federalOther',
        path: ['federal'],
        fields: [
          bool('adequateSupportArrangements'),
          choice('misrepresentation', 'finding', finding),
          date('misrepresentationClockStart'),
          choice('protectionAndCompliance', 'finding', finding),
        ],
      },
    ],
  },
  {
    step: 6,
    title: 'pnp',
    when: (d) => has(d, 'CA-PNP'),
    sections: [
      {
        id: 'nomination',
        path: ['pnp'],
        fields: [
          choice(
            'stream',
            'pnpStream',
            ['ontario-workforce', 'other'],
            'pnpStream',
          ),
          choice('mode', 'pnpMode', ['base', 'enhanced'], 'pnpMode'),
          choice('nomination', 'nomination', [
            'valid',
            'pending',
            'withdrawn',
            'expired',
            'refused',
          ]),
          bool('intendsNominatingProvince'),
          ...dates(
            'nominationIssued',
            'completeNominationApplicationReceived',
            'nominationExpires',
            'federalFiled',
          ),
          ...flags(
            'viaPrPortal',
            'qualifiesUnderlyingEeProgram',
            'electronicNominationMatchedAndAccepted',
          ),
        ],
      },
      {
        id: 'investment',
        path: ['pnp'],
        fields: [
          choice('investment', 'investment', ['none', 'scheme', 'business']),
          percent('equityShare'),
          number('equityInvestment'),
          ...flags(
            'activeOngoingManagement',
            'noRedemptionOption',
            'capitalInActiveBusinessInNominatingProvince',
            'investmentExceptionDocumented',
          ),
        ],
      },
      {
        id: 'ontarioApplication',
        path: ['pnp', 'ontario'],
        when: (d) => d.answers.pnp?.stream === 'ontario-workforce',
        fields: [
          choice(
            'category',
            'ontarioCategory',
            ['high', 'lower', 'physician'],
            'ontarioCategory',
          ),
          ...dates('eoi', 'invited'),
          bool('invitationRevoked'),
          date('employerFiled'),
          date('filed', 'ontarioFiled'),
          ...flags(
            'employerPortalPosition',
            'eoiClaimsDocumented',
            'lawfulStatusIfInCanada',
            'intendsOntario',
          ),
          number('feePaid'),
        ],
      },
      {
        id: 'ontarioEmployer',
        path: ['pnp', 'ontario'],
        when: (d) => d.answers.pnp?.stream === 'ontario-workforce',
        fields: [
          choice('region', 'region', ['gta', 'designated-division', 'other']),
          number('activeBusinessYears'),
          ...flags(
            'ontarioPremises',
            'workPrimarilyInOntario',
            'cvorWithAcceptableRating',
          ),
          number('lastYearRevenue'),
          number('priorYearRevenue'),
          integer('localFullTimeCitizensOrPr'),
          ...flags('labourOrdersClear', 'recruitmentSatisfiedIfRequired'),
        ],
      },
      {
        id: 'ontarioJob',
        path: ['pnp', 'ontario'],
        when: (d) => d.answers.pnp?.stream === 'ontario-workforce',
        fields: [
          text('offerNoc'),
          ...flags(
            'permanentEmployeeJob',
            'urgentBusinessNeed',
            'labourDisputeUnaffected',
          ),
          choice('directorApproval', 'directorApproval', [
            'approved',
            'pending',
            'refused',
          ]),
          bool('jobConditionsMaintained'),
          number('weeklyHours'),
          number('annualHours'),
          number('offeredHourlyWage'),
          number('applicableMedianWage'),
          number('applicableLowWage'),
          number('currentHourlyWage'),
          percent('familyEquityPercent'),
          ...flags('equityOnlyFromPay', 'licenceRequired', 'validLicence'),
        ],
      },
      {
        id: 'ontarioCandidate',
        path: ['pnp', 'ontario'],
        when: (d) => d.answers.pnp?.stream === 'ontario-workforce',
        fields: [
          number('consecutiveOntarioMonths'),
          number('lowerOntarioMonths'),
          list(
            'work',
            [required(text('noc')), required(number('months'))],
            'ontarioWork',
          ),
          {
            ...group('recentGraduate', [
              required(bool('eligibleOntarioInstitution')),
              required(date('graduation')),
              required(
                choice('credential', 'credential', [
                  'degree-diploma',
                  'masters-phd-graduate-certificate',
                  'other',
                ]),
              ),
              number('fullTimeYears'),
            ]),
            allowFalse: true,
          } as CanadaField,
          choice(
            'education',
            'ontarioEducation',
            ['secondary', 'postsecondary', 'ontario-33102-certificate', 'none'],
            'ontarioEducation',
          ),
          number('fullTimeStudyYears'),
          choice(
            'origin',
            'ontarioOrigin',
            ['canadian-eligible', 'foreign-equivalent', 'unrecognised'],
            'ontarioOrigin',
          ),
          date('designatedEcaDate'),
          bool('designatedEcaRevoked'),
          group(
            'language',
            [
              required(date('date', 'testDate')),
              required({
                name: 'scores',
                label: 'scores',
                type: 'tuple',
                size: 4,
                max: maxLevel,
              }),
              bool('revoked'),
            ],
            'ontarioLanguage',
          ),
        ],
      },
      {
        id: 'ontarioPhysician',
        path: ['pnp', 'ontario'],
        when: (d) => d.answers.pnp?.stream === 'ontario-workforce',
        fields: [
          ...flags('selfEmployedPhysician', 'cpsoGoodStanding'),
          choice('physicianLicence', 'physicianLicence', [
            'independent',
            'academic',
            'provisional',
            'postgraduate',
            'none',
          ]),
          bool('ohipBillingEligible'),
        ],
      },
    ],
  },
  {
    step: 7,
    title: 'express',
    when: (d) =>
      has(d, 'CA-EE-FSW', 'CA-EE-CEC', 'CA-EE-FST') ||
      (has(d, 'CA-PNP') && d.answers.pnp?.mode === 'enhanced'),
    sections: [
      {
        id: 'invitation',
        path: ['express'],
        fields: [
          date('profileDate'),
          bool('profileUpdated'),
          group('invitation', [
            required(date('date', 'invitationDate')),
            required(
              choice('program', 'program', [
                'CA-EE-FSW',
                'CA-EE-CEC',
                'CA-EE-FST',
                'CA-PNP',
              ]),
            ),
            date('deadline'),
            bool('revoked'),
          ]),
          date('applicationDate', 'eeApplicationDate'),
          ...flags('completeElectronicApplication', 'qualificationsRetained'),
        ],
      },
      {
        id: 'round',
        path: ['express'],
        fields: [
          group('round', [
            required(date('date', 'roundDate')),
            integer('cutoff'),
            integer('confirmedCrs'),
            text('profileTimestamp'),
            text('tieBreakTimestamp'),
            choice(
              'category',
              'roundCategory',
              [
                'general',
                'program',
                'french',
                'occupation',
                'military',
                'other',
              ],
              'roundCategory',
            ),
            choice(
              'occupationCategory',
              'occupationCategory',
              Object.keys(v.eeCategorySelection.value.occupations).filter(
                (key) => key !== 'military',
              ),
            ),
            list('categoryExperience', [
              required(text('noc')),
              number('months'),
              number('canadianMonths'),
            ]),
            group('military', [
              bool('servingInRecognizedForeignMilitary'),
              number('continuousServiceYears'),
              text('trainedNoc'),
              text('recruitingGroupOfferNoc'),
              number('offerYears'),
              bool('continuousFullTimeOfferInCanada'),
              number('completedPostsecondaryYears'),
              bool('canadianCredentialOrAssessedEquivalent'),
            ]),
            ...flags(
              'roundSpecificRequirementsMet',
              'otherCategoryRequirementsConfirmed',
            ),
          ]),
        ],
      },
      {
        id: 'eeLanguage',
        path: ['express'],
        fields: [
          languageEvidence('primary', 'primaryLanguage'),
          languageEvidence('secondary', 'secondaryLanguage'),
          languageEvidence('french', 'frenchLanguage'),
          languageEvidence('profileLanguage'),
        ],
      },
      {
        id: 'eeEducation',
        path: ['express'],
        fields: [
          educationEvidence('education', 'eeEducation'),
          educationEvidence('profileEducation'),
          bool('usingForeignEducationPoints'),
        ],
      },
      {
        id: 'eeWork',
        path: ['express'],
        fields: [
          workHistory,
          text('primaryNoc'),
          number('fswSelectionWorkYears'),
        ],
      },
      {
        id: 'adaptability',
        path: ['express'],
        fields: [
          group('adaptability', [
            bool('spouseAccompanying'),
            languageEvidence('spouseLanguage'),
            ...flags(
              'applicantStudy',
              'spouseStudy',
              'applicantWork',
              'spouseWork',
              'qualifyingRelative',
            ),
          ]),
        ],
      },
      {
        id: 'eeOffer',
        path: ['express'],
        fields: [
          group('offer', [
            bool('exists'),
            integer('employers'),
            teer('teer', 'offerTeer'),
            text('noc', 'offerNoc'),
            number('weeklyHours'),
            number('monthsAfterPr'),
            ...flags(
              'permanent',
              'continuousPaidNonseasonal',
              'eligibleEmployers',
              'genuineAndAble',
              'oldLmiaOrPermitRequirementsMet',
              'policyExemptionConfirmed',
              'physicianDurationExemption',
              'physicianPaidNonseasonal',
              'fstPermitGroupRequirementsMet',
            ),
          ]),
          ...flags(
            'certificateForTrade',
            'tradeEmploymentRequirementsMet',
            'workAuthorizedInCanada',
          ),
        ],
      },
      {
        id: 'eeFunds',
        path: ['express'],
        fields: [
          bool('fundsExemptionConfirmed'),
          settlementFunds,
          bool('intendsOutsideQuebec'),
        ],
      },
    ],
  },
  {
    step: 8,
    title: 'quebec',
    when: (d) => has(d, 'CA-QC-PSTQ'),
    sections: [
      {
        id: 'qcSelection',
        path: ['quebec'],
        fields: [
          choice(
            'stream',
            'qcStream',
            ['high', 'intermediate', 'regulated', 'talent'],
            'qcStream',
          ),
          integer('feer', 'feer', 5),
          ...flags(
            'intendsQuebec',
            'capableOfProposedJob',
            'noApplicantControlOfEmployer',
            'eligibleIndustry',
            'scholarshipReturnConditionsSatisfiedIfAny',
          ),
        ],
      },
      {
        id: 'qcInvitation',
        path: ['quebec'],
        fields: [
          ...dates('eoi', 'invited'),
          bool('invitationRevoked'),
          date('accepted', 'invitationAccepted'),
          date('filed', 'qcFiled'),
          date('completeSelectionApplicationReceived'),
          ...flags(
            'invitationCriteriaProven',
            'sameInvitedOccupationAndStream',
            'hadRecognitionAtAcceptance',
          ),
          date('officialFilingDeadline'),
          number('feePaid'),
        ],
      },
      {
        id: 'qcFamilyFunds',
        path: ['quebec'],
        fields: [
          bool('accompanyingPartner'),
          integer('accompanyingMinorChildren'),
          integer('accompanyingAdultDependants'),
          ...flags('hasCanadianCitizenDependentChildren', 'contractSigned'),
          number('availableFunds'),
          number('officialContractAmount'),
        ],
      },
      {
        id: 'qcValues',
        path: ['quebec'],
        fields: [
          group('principalValues', valuesAttestation),
          list('familyValues', valuesAttestation),
        ],
      },
      {
        id: 'qcFrench',
        path: ['quebec'],
        fields: [
          quebecFrench('french', 'qcFrench'),
          quebecFrench('partnerFrench'),
        ],
      },
      {
        id: 'qcExperience',
        path: ['quebec'],
        fields: [
          bool('authorisationRequiredInProposedSetting'),
          group(
            'education',
            [
              bool('eligibleDiploma'),
              choice(
                'level',
                'qcEducationLevel',
                ['des', 'vocational', 'college', 'university'],
                'qcEducationLevel',
              ),
              bool('directlyLeadsToOccupation'),
              number('fullTimeYears'),
              date('obtained'),
              bool('fromQuebec'),
              number('hours'),
              number('credits', 'educationCredits'),
              bool('unresolvedEquivalence'),
            ],
            'qcEducation',
          ),
          number('mainOccupationMonths'),
          number('compulsoryInternshipMonths'),
          number('localMainMonths'),
          number('localInternshipMonths'),
          number('outsideRelatedMonths'),
          number('outsideInternshipMonths'),
        ],
      },
      {
        id: 'qcRegulated',
        path: ['quebec'],
        fields: [
          bool('occupationOnRegulatedList'),
          choice('recognition', 'recognition', [
            'valid-licence',
            'partial',
            'full',
            'receipt-only',
            'pending',
            'revoked',
            'refused',
          ]),
          date('recognitionDate'),
          ...flags(
            'exceptionalExpertiseAndTrackRecord',
            'listedAchievement',
            'favourableOfficialPartnerOpinion',
          ),
        ],
      },
      {
        id: 'qcCsq',
        path: ['quebec'],
        fields: [
          choice('principalCsq', 'csq', csqStatus),
          ...dates('principalCsqIssued', 'principalCsqExpires'),
          bool('accompanyingCsqsValid'),
          list('accompanyingCsqs', [
            required(choice('status', 'csq', csqStatus, 'csqStatus')),
            ...dates('issued', 'expires'),
          ]),
          date('federalReceived'),
        ],
      },
    ],
  },
  {
    step: 9,
    title: 'atlantic',
    when: (d) => has(d, 'CA-AIP'),
    sections: [
      {
        id: 'aipEndorsement',
        path: ['atlantic'],
        fields: [
          date('applicationDate', 'aipApplicationDate'),
          date('completeEndorsementApplicationReceived'),
          choice('destination', 'province', provinces),
          choice('jobProvince', 'province', provinces),
          ...flags('settlementPlanGivenToEmployer', 'employerDesignated'),
          group('endorsement', [
            required(
              choice('province', 'province', provinces, 'endorsementProvince'),
            ),
            required(date('issued')),
            required(date('expires')),
            bool('revoked'),
          ]),
        ],
      },
      {
        id: 'aipOffer',
        path: ['atlantic'],
        fields: [
          group(
            'offer',
            [
              text('noc', 'offerNoc'),
              teer('teer', 'offerTeer'),
              number('hoursPerWeek'),
              bool('permanent'),
              number('monthsAfterPr'),
              ...flags('continuousPaidNonseasonal', 'eligibleNamedEmployer'),
              percent('applicantAndPartnerOwnershipPercent'),
              ...flags('ableAndLikelyToAccept', 'genuine'),
            ],
            'aipOffer',
          ),
        ],
      },
      {
        id: 'aipWork',
        path: ['atlantic'],
        fields: [
          workHistory,
          group('graduate', [
            bool('claimsExemption'),
            date('awarded'),
            bool('recognizedInstitution'),
            number('yearsOfStudy'),
            bool('fullTimeThroughout'),
            number('monthsResidentInInstitutionProvinceDuringLastTwoYears'),
            bool('temporaryStatusAndAuthorizationThroughout'),
            percent('distanceLearningPercent'),
            percent('secondLanguageStudyPercent'),
            bool('returnHomeObligation'),
          ]),
        ],
      },
      {
        id: 'aipEducation',
        path: ['atlantic'],
        fields: [
          educationEvidence('education', 'eeEducation'),
          choice('ecaIssuer', 'ecaIssuer', [
            'CACB',
            'MCC',
            'PEBC',
            'general-designated',
            'other',
          ]),
          languageEvidence('language', 'aipLanguage'),
        ],
      },
      {
        id: 'aipFunds',
        path: ['atlantic'],
        fields: [
          settlementFunds,
          ...flags('workingInCanada', 'fundsExemptionAuthorization'),
        ],
      },
    ],
  },
  {
    step: 10,
    title: 'family',
    when: (d) => has(d, 'CA-FAMILY'),
    sections: [
      {
        id: 'familyApplication',
        path: ['family'],
        fields: [
          choice(
            'relationship',
            'familyRelationship',
            ['spouse', 'common-law', 'conjugal', 'child'],
            'familyRelationship',
          ),
          bool('quebec', 'familyQuebec'),
          choice('applicationClass', 'applicationClass', ['family', 'inland']),
          date('filingDate', 'familyFilingDate'),
          ...dates(
            'completeApplicationReceived',
            'permanentResidenceDate',
            'qualifyingTrpStart',
          ),
          ...flags(
            'sponsoredOutsideCanada',
            'cohabitingInCanada',
            'temporaryStatusValid',
          ),
          choice('lackOfStatusPolicy', 'lackOfStatus', [
            'not-applicable',
            'requested',
            'accepted',
            'refused',
          ]),
          bool('multigenerationalDependants'),
        ],
      },
      {
        id: 'sponsor',
        path: ['family'],
        fields: [
          date('sponsorBirthDate'),
          choice('sponsorStatus', 'sponsorStatus', [
            'citizen',
            'pr',
            'registered-indian',
            'other',
          ]),
          ...flags(
            'registeredSponsorAccepted',
            'sponsorInCanada',
            'returnToCanadaConfirmed',
            'noDuplicateSponsorship',
            'sponsorshipFiled',
            'sponsorPreviouslySponsoredAsPartner',
          ),
          date('sponsorContinuousPrOrCitizenSince'),
          bool('noActivePartnerUndertaking'),
          group(
            'sponsor',
            [
              ...flags(
                'notWithdrawn',
                'noRemovalOrder',
                'notDetained',
                'criminalBarCleared',
              ),
              group('conviction', [
                required(
                  choice(
                    'jurisdiction',
                    'convictionJurisdiction',
                    ['canada', 'foreign'],
                    'jurisdiction',
                  ),
                ),
                date('sentenceCompletedOn'),
                ...flags(
                  'finalAcquittal',
                  'effectiveCanadianPardon',
                  'foreignRehabilitationConfirmed',
                ),
              ]),
              ...flags(
                'noProceedingSuspension',
                'noUndertakingOrSupportDefault',
                'immigrationDebtClear',
                'bankruptcyDischargedOrAbsent',
                'socialAssistancePermittedOrAbsent',
              ),
            ],
            'sponsorEligibility',
          ),
        ],
      },
      {
        id: 'relationship',
        path: ['family'],
        fields: [
          ...flags(
            'genuineAndContinuingRelationship',
            'marriageRecognizedAndEligible',
          ),
          date('cohabitationSince'),
          bool('deemedCommonLawAccepted'),
          date('partnershipSince'),
          bool('legalOrPracticalBarriersConfirmed'),
          group(
            'child',
            [
              ...dependentChild,
              ...flags(
                'parentageConfirmed',
                'priorDisclosureExamOrExceptionConfirmed',
              ),
            ],
            'sponsoredChild',
          ),
        ],
      },
      {
        id: 'federalUndertaking',
        path: ['family'],
        fields: [
          bool('federalUndertakingAndAgreementSigned'),
          group('federalIncome', [
            integer('unduplicatedHouseholdSize'),
            number('eligibleNoaIncome'),
            number('eligibleLastYearIncome'),
          ]),
        ],
      },
      {
        id: 'quebecSponsorship',
        path: ['family'],
        when: (d) => d.answers.family?.quebec === true,
        fields: [
          group(
            'province',
            [
              bool('eligibilityLetterOrQualifyingInlandAor'),
              ...dates('letterDate', 'submissionDate'),
              ...flags(
                'sponsorResidenceOrReturnConfirmed',
                'provincialFinancialAndConductBarsClear',
                'custodyConsentIfRequired',
                'undertakingAndAdultDeclarationsSigned',
                'integrationPlanIfRequiredSigned',
              ),
              {
                name: 'additionalSponsoredBirthDates',
                label: 'additionalSponsoredBirthDates',
                type: 'dates',
              },
              choice('mifiDecision', 'mifi', [
                'approved',
                'pending',
                'refused',
              ]),
              integer('ownHouseholdSize'),
              // A new undertaking always adds at least its own group.
              {
                name: 'sponsoredGroups',
                label: 'sponsoredGroups',
                type: 'list',
                fields: [
                  required(integer('adults')),
                  required(integer('children')),
                ],
                nonEmpty: true,
              },
              number('eligibleCanadianIncome'),
              number('eligibleCanadianAssets'),
              ...flags(
                'resourcesSustainable',
                'intakeExemptionConfirmed',
                'intakeCapacityConfirmed',
              ),
              integer('applications', 'qcApplications'),
              integer('additionalPersons'),
              bool('feesPaid'),
            ],
            'qcSponsorship',
          ),
        ],
      },
    ],
  },
];

export function canadaStepsFor(draft: CanadaDraftShape) {
  return canadaSteps.filter((step) => step.when(draft));
}

export function visibleSections(step: CanadaStep, draft: CanadaDraftShape) {
  return step.sections.filter(
    (section) => !section.when || section.when(draft),
  );
}

// Tax years the citizenship windows can reach, ending the day before signing.
export function taxYearRange(draft: CanadaDraftShape) {
  const signing = draft.answers.residence?.signingDate ?? draft.simulationDate;
  const year = Number(signing.slice(0, 4));
  if (!Number.isInteger(year)) return [];
  const window = Math.max(
    v.citizenshipWindowYears.value,
    v.citCafWindowYears.value,
  );
  const last = signing.slice(5) === '01-01' ? year - 1 : year;
  return Array.from(
    { length: last - (year - window) + 1 },
    (_, index) => year - window + index,
  );
}
