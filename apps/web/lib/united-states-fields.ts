import type { UsFullPathwayId } from '@uk-immigration/engine';
import type { usFormZh } from '../i18n/countries/united-states-form';

type Suffix<P extends string> =
  Extract<
    keyof typeof usFormZh,
    `us.${P}.${string}`
  > extends `us.${P}.${infer S}`
    ? S
    : never;
export type UsFieldLabel = Suffix<'field'>;
export type UsOption = Suffix<'option'>;
type Hint = Suffix<'hint'>;

// The questionnaire stores answers in the shape of UsFullRequest, apart from
// the month and ground tables, which are lists here and records in the request.
export interface UsAnswers {
  pathway?: UsFullPathwayId;
  conditional?: string;
}
export interface FieldContext {
  draft: UsAnswers;
  record: Record<string, unknown>;
}
export type UsField = {
  name: string;
  label: UsFieldLabel;
  hint?: Hint;
  required?: boolean | ((draft: UsAnswers) => boolean);
  when?: (context: FieldContext) => boolean;
  // Extra values accepted in place of a date, number, finding or details.
  alternatives?: readonly UsOption[];
  // Amounts such as net income can be negative.
  signed?: true;
} & (
  | {
      type:
        | 'boolean'
        | 'date'
        | 'month'
        | 'number'
        | 'integer'
        | 'text'
        | 'review'
        | 'dates';
    }
  | {
      type: 'choice';
      options: readonly UsOption[];
      radio?: true;
      // Field-specific wording for a shared option value.
      labels?: Partial<Record<UsOption, UsOption>>;
    }
  | { type: 'group' | 'list'; fields: UsField[] }
);

type Plain = Exclude<UsField['type'], 'choice' | 'group' | 'list'>;
// A field named differently from its label must name the label.
type Options<N extends string> = Partial<UsField> &
  (N extends UsFieldLabel ? unknown : { label: UsFieldLabel });
const field =
  (type: Plain) =>
  <N extends string>(name: N, options = {} as Options<N>): UsField =>
    ({ name, label: name, type, ...options }) as UsField;
const bool = field('boolean');
const date = field('date');
const number = field('number');
const integer = field('integer');
const review = field('review');
const choice = <N extends string>(
  name: N,
  options: readonly UsOption[],
  extra = {} as Options<N>,
): UsField =>
  ({ name, label: name, type: 'choice', options, ...extra }) as UsField;
const group = <N extends string>(
  name: N,
  fields: UsField[],
  extra = {} as Options<N>,
): UsField =>
  ({ name, label: name, type: 'group', fields, ...extra }) as UsField;
const list = <N extends string>(
  name: N,
  fields: UsField[],
  extra = {} as Options<N>,
): UsField =>
  ({ name, label: name, type: 'list', fields, ...extra }) as UsField;
const flags = (...names: UsFieldLabel[]) => names.map((name) => bool(name));

export const usPathways = [
  'US-NATURALIZATION',
  'US-SPOUSE',
  'US-MILITARY',
  'US-CONDITIONS',
  'US-TRAVEL',
  'US-FAMILY',
  'US-EMPLOYMENT',
  'US-ADJUSTMENT',
  'US-HUMANITARIAN',
] as const satisfies readonly UsFullPathwayId[];

const naturalizationPaths: readonly string[] = [
  'US-NATURALIZATION',
  'US-SPOUSE',
  'US-MILITARY',
];
const permanentResidentPaths: readonly string[] = [
  ...naturalizationPaths,
  'US-CONDITIONS',
  'US-TRAVEL',
];
const immigrantPaths: readonly string[] = [
  'US-FAMILY',
  'US-EMPLOYMENT',
  'US-ADJUSTMENT',
];
const familyBases: readonly unknown[] = [
  'immediate-relative',
  'family-preference',
];

const get = (record: unknown, path: readonly string[]): unknown =>
  path.reduce<unknown>(
    (value, key) =>
      value && typeof value === 'object'
        ? (value as Record<string, unknown>)[key]
        : undefined,
    record,
  );
const process = (draft: UsAnswers) => get(draft, ['admission', 'process']);
const basis = (draft: UsAnswers) =>
  get(draft, ['admission', 'adjustmentBasis']);
const category = (draft: UsAnswers) => get(draft, ['employment', 'category']);

export const isNaturalization = (draft: UsAnswers) =>
  naturalizationPaths.includes(draft.pathway ?? '');
export const isPermanentResident = (draft: UsAnswers) =>
  permanentResidentPaths.includes(draft.pathway ?? '');
export const isImmigrant = (draft: UsAnswers) =>
  immigrantPaths.includes(draft.pathway ?? '');
export const isConsular = (draft: UsAnswers) =>
  isImmigrant(draft) && process(draft) === 'consular';
// The engine assesses an I-485 for adjustment and for refugee or asylee status.
export const isI485 = (draft: UsAnswers) =>
  draft.pathway === 'US-HUMANITARIAN' ||
  (isImmigrant(draft) && process(draft) === 'adjustment');
// A VAWA basis on the family path and an SIJ basis on the employment path
// replace the I-130 or I-140 petition in the engine.
export const hasFamilyPetition = (draft: UsAnswers) =>
  (draft.pathway === 'US-FAMILY' && basis(draft) !== 'vawa') ||
  (draft.pathway === 'US-ADJUSTMENT' && familyBases.includes(basis(draft)));
export const hasEmploymentPetition = (draft: UsAnswers) =>
  (draft.pathway === 'US-EMPLOYMENT' && basis(draft) !== 'sij') ||
  (draft.pathway === 'US-ADJUSTMENT' && basis(draft) === 'employment');
// A blank petition status on an employment-based I-485 would date the
// petition from the I-485 receipt.
const isEmploymentAdjustment = (draft: UsAnswers) =>
  isImmigrant(draft) &&
  process(draft) === 'adjustment' &&
  hasEmploymentPetition(draft);

const inDraft =
  (test: (draft: UsAnswers) => boolean) =>
  ({ draft }: FieldContext) =>
    test(draft);
const inRecord =
  (name: string, values: readonly unknown[]) =>
  ({ record }: FieldContext) =>
    values.includes(record[name]);
const forCategories =
  (...values: string[]) =>
  ({ draft }: FieldContext) =>
    values.includes(category(draft) as string);
const employerCategories = ['eb1b', 'eb1c', 'eb2-perm', 'eb3'];
const selfPetitionCategories = ['eb1a', 'eb2-niw'];
const i140Categories = [...employerCategories, ...selfPetitionCategories];
const onlyAdjustment = inDraft(
  (draft) => isImmigrant(draft) && process(draft) === 'adjustment',
);
const onlyConsular = inDraft(isConsular);
const onlyPathway =
  (...pathways: string[]) =>
  ({ draft }: FieldContext) =>
    pathways.includes(draft.pathway ?? '');

// Step 0. Every questionnaire assesses one pathway.
export const startFields: UsField[] = [
  date('simulationDate', { required: true, hint: 'simulationDate' }),
  choice('pathway', usPathways, {
    required: true,
    radio: true,
    hint: 'pathway',
  }),
  date('dateOfBirth', {
    hint: 'dateOfBirth',
    required: (draft) =>
      draft.pathway === 'US-NATURALIZATION' || draft.pathway === 'US-SPOUSE',
  }),
];
export const startAdmissionFields: UsField[] = [
  choice('process', ['adjustment', 'consular'], {
    required: true,
    hint: 'process',
  }),
  choice(
    'adjustmentBasis',
    [
      'immediate-relative',
      'family-preference',
      'employment',
      'vawa',
      'sij',
      '245i',
      'other',
    ],
    {
      hint: 'adjustmentBasis',
      required: (draft) => draft.pathway === 'US-ADJUSTMENT',
    },
  ),
];

// Step 1. Green card facts and travel shared by the time calculations.
export const greenCardFields: UsField[] = [
  date('permanentResident', {
    hint: 'permanentResident',
    required: (draft) => draft.pathway !== 'US-MILITARY',
  }),
  choice('conditional', ['none', 'marriage', 'investor'], {
    hint: 'conditional',
    labels: { none: 'regular' },
    required: (draft) => draft.pathway === 'US-CONDITIONS',
  }),
  date('principalConditional', {
    hint: 'principalConditional',
    when: onlyPathway('US-CONDITIONS'),
  }),
  bool('separatePetition', {
    hint: 'separatePetition',
    when: onlyPathway('US-CONDITIONS'),
  }),
  group(
    'marriage',
    [
      date('married', { required: true }),
      date('spouseCitizenSince', { hint: 'spouseCitizenSince' }),
    ],
    { when: onlyPathway('US-SPOUSE'), required: true },
  ),
];
export const tripFields: UsField[] = [
  date('departed', { required: true }),
  date('returned', { required: true, hint: 'returned' }),
  group(
    'i485Travel',
    [
      choice(
        'route',
        [
          'advance-parole',
          'nonimmigrant',
          'tps',
          'refugee-travel-document',
          'other-209',
          'none',
        ],
        { required: true },
      ),
      review('evidence', { label: 'travelEvidence' }),
      bool('inRemovalProceedings'),
    ],
    { when: inDraft(isI485), hint: 'i485Travel' },
  ),
];
export const tripList = list('trips', tripFields, { hint: 'trips' });

// Step 2. Military naturalization (INA 328 and 329).
export const militaryFields: UsField[] = [
  choice('basis', ['peacetime', 'hostilities'], { required: true }),
  list('service', [
    date('from', { required: true, label: 'serviceFrom' }),
    date('to', { label: 'serviceTo' }),
  ]),
  number('honorableServiceYears'),
  ...flags('eligibleServiceComponent', 'honorableService'),
  choice('evidence', ['n426', 'dd214-or-ngb22', 'none'], {
    label: 'militaryEvidence',
  }),
  date('separatedOn', { alternatives: ['serving'] }),
  ...flags('lprAtInterview', 'qualifyingLocationAtEnlistment'),
  review('backgroundCheck'),
  bool('lateResidenceMet'),
];

// Step 3. Naturalization requirements.
export const districtFields: UsField[] = [
  date('stateResidenceFrom', {
    hint: 'stateResidenceFrom',
    when: onlyPathway('US-NATURALIZATION', 'US-SPOUSE'),
  }),
];
export const naturalizationFields: UsField[] = [
  review('lawfulAdmission'),
  choice('removalProcess', ['none', 'pending', 'final']),
  bool('residenceThroughOath'),
  date('interviewOn', {
    hint: 'interviewOn',
    when: onlyPathway('US-NATURALIZATION', 'US-SPOUSE'),
  }),
  bool('conditionalStatusResolved', {
    when: ({ draft }) =>
      draft.conditional === 'marriage' || draft.conditional === 'investor',
  }),
  number('lprResidenceYears', { hint: 'lprResidenceYears' }),
  choice('english', ['passed', 'failed', 'preparing']),
  choice('civics', ['passed', 'failed', 'retest', 'preparing']),
  integer('civicsCorrect'),
  group('disability', [
    bool('requested', { label: 'disabilityRequested' }),
    integer('months', { label: 'disabilityMonths' }),
    ...flags('illegalDrugCause', 'clinicianCertified'),
    review('englishWaived'),
    review('civicsWaived'),
  ]),
];
export const spouseFields: UsField[] = [
  bool('validMarriage'),
  review('livedTogetherRequiredPeriod'),
  ...flags('spouseCitizenRequiredPeriod', 'marriageAndCitizenshipThroughOath'),
];

const crimeFields: UsField[] = [
  bool('unclassifiedRecord'),
  integer('cimtCount'),
  number('cimtMaximumMonths'),
  number('cimtSentenceMonths'),
  integer('cimtAgeAtOffense'),
  date('cimtOffenseOrReleaseOn'),
  integer('convictionCount'),
  number('combinedSentenceMonths'),
  integer('confinementDays'),
  choice('controlledSubstance', ['none', 'single-simple-cannabis', 'other'], {
    labels: { other: 'otherSubstance' },
  }),
  number('cannabisGrams'),
  integer('duiCount'),
];
const partyFields: UsField[] = [
  choice('membership', ['none', 'current', 'former']),
  date('endedOn', { label: 'partyEndedOn' }),
  integer('ageEnded'),
  bool('rulingParty'),
  choice(
    'exception',
    ['involuntary', 'unknowing', 'law', 'necessities', 'none'],
    {
      label: 'partyException',
    },
  ),
  ...flags('functionary', 'noSecurityThreat'),
  review('waiver', { label: 'partyWaiver' }),
];

// Step 4. Good moral character, attachment and oath.
export const characterFields: UsField[] = [
  review('goodMoralCharacter', { hint: 'goodMoralCharacter' }),
  bool('murderConviction'),
  date('aggravatedFelonyConvictedOn', {
    alternatives: ['none', 'unclassified'],
  }),
  bool('persecutionBar'),
  group('statutoryPeriodCrime', crimeFields, { hint: 'crime' }),
  review('otherGmcBar'),
  review('duiPresumptionRebutted'),
  bool('falseOralTestimony'),
  choice('benefitsAndSupport', [
    'clear',
    'fraud',
    'wilful-nonsupport',
    'intentional-reduced-work',
    'review',
  ]),
  bool('constitutionalAttachment'),
  group('party', partyFields),
  choice('selectiveService', [
    'not-required',
    'registered',
    'required-unregistered',
    'review',
  ]),
  review('selectiveNonWillful'),
  review('warDesertionOrAlienageExemption'),
  choice('oath', [
    'willing',
    'affirmation',
    'refuses',
    'modified',
    'disability-waiver',
  ]),
  review('oathApproval'),
  ...flags('titlesRenounced', 'truthfulApplication'),
];

// Step 5. Removing conditions (I-751 or I-829).
const investmentFields: UsField[] = [
  choice('project', ['standard', 'tea', 'infrastructure']),
  number('capitalUsd'),
  review('lawfullySourcedFunds'),
  bool('atRisk'),
  number('sustainmentYears'),
  bool('qualifiesAsNewEnterprise'),
  integer('qualifyingJobs'),
  number('minimumWeeklyHours'),
  ...flags('regionalCenter', 'projectFiled'),
  number('indirectJobsPct'),
  number('shortConstructionIndirectJobsPct'),
];
export const marriageConditionFields: UsField[] = [
  date('marriedOn'),
  review('bonaFide'),
  bool('improperConsideration'),
  choice('filing', [
    'joint',
    'separate-child',
    'death',
    'divorce',
    'abuse',
    'hardship',
  ]),
  ...flags('spouseJoins', 'finalRemovalOrder'),
  review('waiverBasis'),
  review('interviewRequirement'),
  review('lateFilingExcuse'),
];
export const investorConditionFields: UsField[] = [
  ...investmentFields,
  date('originalPetitionFiledOn'),
  review('requiredCapitalFullyInvested'),
  review('continuousInvestmentDuringConditionalResidence'),
  review('jobsAccepted'),
  review('lateFilingExcuse'),
];

// Step 6. Keeping permanent residence and returning.
const onReturnDocument = (value: string) => inRecord('returnDocument', [value]);
export const travelFields: UsField[] = [
  choice('registration', [
    'registered',
    'unregistered',
    'diplomatic-child-review',
  ]),
  bool('carryingEvidence'),
  date('movedOn', { alternatives: ['no-move'] }),
  date('addressReportedOn', { alternatives: ['not-reported'] }),
  date('cardExpiresOn'),
  bool('otherReplacementGround'),
  date('replacementFiledOn', { alternatives: ['not-filed'] }),
  choice('replacementReason', ['age-14', 'renewal', 'error-or-not-delivered']),
  choice('admissionTriggers', ['none', 'triggered', 'unclassified'], {
    hint: 'admissionTriggers',
  }),
  review('deportability'),
  group('deportabilityFacts', [
    bool('unclassified', { label: 'unclassifiedGround' }),
    group('singleCimt', [
      date('admittedOn', { required: true }),
      date('committedOn', { required: true }),
      number('possibleSentenceMonths', { required: true }),
      bool('sWitness'),
    ]),
    integer('independentCimtCount'),
    bool('aggravatedFelony'),
    choice('controlledSubstance', ['none', 'single-simple-cannabis', 'other'], {
      labels: { other: 'otherSubstance' },
    }),
    number('cannabisGrams'),
    review('earlyMarriageTermination'),
    review('otherGround', { label: 'otherDeportabilityGround' }),
  ]),
  choice(
    'returnDocument',
    ['green-card', 'reentry-permit', 'sb1', 'continuous-journey', 'none'],
    { hint: 'returnDocument' },
  ),
  bool('documentValidAtReturn'),
  date('permitFiledOn', { when: onReturnDocument('reentry-permit') }),
  bool('permitAppliedInUs', { when: onReturnDocument('reentry-permit') }),
  date('permitIssuedOn', { when: onReturnDocument('reentry-permit') }),
  date('permitExpiresOn', { when: onReturnDocument('reentry-permit') }),
  bool('permitRestrictedToOneYear', {
    when: onReturnDocument('reentry-permit'),
  }),
  bool('permitBiometricsInUs', { when: onReturnDocument('reentry-permit') }),
  review('abandonment', { hint: 'abandonment' }),
  review('sb1OutsideControl', { when: onReturnDocument('sb1') }),
  bool('continuousJourneyStartedInTime', {
    when: onReturnDocument('continuous-journey'),
  }),
  choice('feeForm', ['i90', 'i131', 'ds117', 'i131a', 'ar11', 'g325r']),
];

// Step 7. Family-based petition (I-130).
export const familyFields: UsField[] = [
  choice('petitioner', ['citizen', 'lpr'], {
    required: onlyFamilyPathway,
  }),
  choice('petitionerAtFiling', ['citizen', 'lpr'], {
    hint: 'petitionerAtFiling',
  }),
  date('petitionerNaturalizedOn'),
  choice(
    'relationship',
    ['spouse', 'unmarried-child', 'married-child', 'parent', 'sibling'],
    { required: onlyFamilyPathway },
  ),
  integer('petitionerAge'),
  integer('beneficiaryAge'),
  choice('childRelationship', ['biological', 'step', 'adopted']),
  integer('relationshipEstablishedAtAge'),
  bool('siblingAdoption'),
  number('custodyYears'),
  number('livedTogetherYears'),
  review('relationshipValid'),
  number('cspaAge', { alternatives: ['pending'], hint: 'cspaAge' }),
  date('priorMarriageLprSince', { alternatives: ['not-applicable'] }),
  review('priorMarriageException'),
  bool('marriageDuringRemoval'),
  review('removalMarriageException'),
  number('livedAbroadAfterMarriageYears'),
  bool('priorMarriageFraud'),
  review('adamWalsh'),
];
function onlyFamilyPathway(draft: UsAnswers) {
  return draft.pathway === 'US-FAMILY';
}

// Step 8. Employment-based and investor petitions.
const employer = forCategories(...employerCategories);
const perm = forCategories('eb2-perm', 'eb3');
// The I-140 fee on the employment path depends on the employer, including an
// employer filing for an EB-1A or NIW beneficiary.
const employerFee = (context: FieldContext) =>
  context.draft.pathway === 'US-EMPLOYMENT' &&
  (employer(context) ||
    (forCategories(...selfPetitionCategories)(context) &&
      context.record.i140SelfPetition === false));
export const employmentFields: UsField[] = [
  choice(
    'category',
    ['eb1a', 'eb1b', 'eb1c', 'eb2-perm', 'eb2-niw', 'eb3', 'eb5', 'gold-card'],
    { required: (draft) => draft.pathway === 'US-EMPLOYMENT' },
  ),
  review('categoryQualifications', { when: employer }),
  bool('priorMarriageFraud'),
  date('i140FiledOn', {
    hint: 'i140FiledOn',
    when: forCategories(...i140Categories),
  }),
  date('priorityDate', {
    hint: 'priorityDate',
    when: forCategories(...i140Categories),
  }),
  bool('i140SelfPetition', {
    when: forCategories(...i140Categories),
  }),
  bool('relativePetitioner', { hint: 'relativePetitioner' }),
  number('relativeOwnershipPct'),
  integer('employerEmployees', {
    when: (context) => employer(context) || employerFee(context),
  }),
  bool('employerNonprofit', { when: employerFee }),
  bool('employmentOffer', { when: employer }),
  bool('initialSupplementJIncluded', {
    hint: 'initialSupplementJ',
    when: (context) => employer(context) && onlyAdjustment(context),
  }),
  group(
    'jobPortability',
    [
      date('i485PendingSince'),
      ...flags('originalOfferValidAtFiling', 'newOffer'),
      review('sameOrSimilarOccupation'),
      date('supplementJFiledOn'),
    ],
    {
      hint: 'jobPortability',
      when: (context) => employer(context) && onlyAdjustment(context),
    },
  ),
  choice('perm', ['certified', 'schedule-a', 'pending', 'none'], {
    when: perm,
  }),
  review('permCertificationValidity', { when: perm }),
  date('permCertifiedOn', { when: perm }),
  number('prevailingWageUsd', { when: perm }),
  number('profferedWageUsd', { when: employer }),
  bool('recruitmentAndFeesCompliant', { when: perm }),
  group(
    'permRecruitment',
    [
      date('laborCertificationFiledOn', { hint: 'laborCertificationFiledOn' }),
      group('stateJobOrder', [
        date('from', { required: true, label: 'jobOrderFrom' }),
        date('through', { required: true, label: 'jobOrderThrough' }),
      ]),
      field('dates')('advertisementDates'),
      group('notice', [
        choice('method', ['union', 'posting'], {
          required: true,
          label: 'noticeMethod',
        }),
        date('notifiedOn', { when: inRecord('method', ['union']) }),
        field('dates')('businessDates', {
          when: inRecord('method', ['posting']),
        }),
      ]),
      bool('professional'),
      integer('extraDistinctSteps'),
      ...flags('qualifiedAvailableUsWorker', 'employerPaidPermCosts'),
    ],
    { when: perm },
  ),
  review('officerStatementAccepted', { when: employer }),
  list(
    'wageYears',
    [
      integer('year', { required: true, label: 'wageYear' }),
      date('from', { label: 'wageFrom', hint: 'wageFrom' }),
      date('through', { label: 'wageThrough', hint: 'wageThrough' }),
      number('paidUsd'),
      number('netIncomeUsd', { signed: true }),
      number('netCurrentAssetsUsd', { signed: true }),
    ],
    { hint: 'wageYears', when: employer },
  ),
  bool('wagePeriodComplete', { when: employer }),
  date('wagePeriodThrough', { when: employer }),
  group(
    'priorityYearProration',
    [
      review('finding', { required: true, label: 'prorationFinding' }),
      number('profferedWageUsd', { label: 'proratedWageUsd' }),
    ],
    { hint: 'priorityYearProration', when: employer },
  ),
  review('abilityToPayTotality', { when: employer }),
  bool('internationalAward', { when: forCategories('eb1a') }),
  integer('extraordinaryEvidenceCount', { when: forCategories('eb1a') }),
  review('comparableEvidenceAccepted', { when: forCategories('eb1a') }),
  review('extraordinaryFinalMerits', { when: forCategories('eb1a') }),
  bool('continuesWorkInField', { when: forCategories('eb1a', 'eb2-niw') }),
  bool('benefitsUnitedStates', { when: forCategories('eb1a') }),
  choice('degree', ['advanced', 'bachelor', 'other'], {
    when: forCategories('eb2-niw'),
  }),
  number('progressiveExperienceYears', { when: forCategories('eb2-niw') }),
  integer('exceptionalEvidenceCount', { when: forCategories('eb2-niw') }),
  group(
    'niwProngs',
    flags('nationalImportance', 'wellPositioned', 'waiverBeneficial'),
    { when: forCategories('eb2-niw') },
  ),
  review('niwDetermination', { when: forCategories('eb2-niw') }),
  group(
    'investment',
    [
      ...investmentFields,
      number('expectedSustainmentYears'),
      group(
        'jobCreationPlan',
        [
          review('evidence', { label: 'jobPlanEvidence' }),
          integer('qualifyingJobs'),
          number('minimumWeeklyHours'),
        ],
        { alternatives: ['none'] },
      ),
    ],
    { when: forCategories('eb5') },
  ),
  group(
    'gold',
    [
      bool('registrationAccepted'),
      choice('donor', ['individual', 'company']),
      number('giftUsd'),
      number('processingFundsUsd'),
      integer('includedPeople'),
      review('fundsAndWire'),
      review('giftTransferred'),
    ],
    { when: forCategories('gold-card') },
  ),
];

// Step 9. Refugee and asylee adjustment (INA 209).
export const humanitarianFields: UsField[] = [
  choice('status', ['refugee', 'asylee'], {
    required: true,
    label: 'humanitarianStatus',
  }),
  integer('presenceDays', { hint: 'presenceDays' }),
  date('presenceThrough'),
  ...flags(
    'statusRetained',
    'alreadyLpr',
    'refugeeDefinitionOrDerivative',
    'firmlyResettled',
  ),
  review('discretion', { label: 'humanitarianDiscretion' }),
  review('waiverFiling'),
  review('waiver', {
    label: 'humanitarianWaiver',
    alternatives: ['not-needed'],
  }),
];

// Step 10. Adjustment of status or consular processing.
const visaOptions = ['available', 'unavailable', 'future-bulletin'] as const;
const monthTable = (
  name: UsFieldLabel,
  when: (context: FieldContext) => boolean,
) =>
  list(
    name,
    [
      field('month')('month', { required: true }),
      choice('availability', visaOptions, { required: true }),
    ],
    { when },
  );
export const pendingEventFields: UsField[] = [
  date('on', { required: true, label: 'eventOn' }),
  choice(
    'kind',
    [
      'qualifying-basis',
      'procedure',
      'nonimmigrant-status-expiry',
      'admissibility',
      'unauthorized-employment',
    ],
    { required: true, label: 'eventKind' },
  ),
  review('finding', {
    label: 'eventFinding',
    when: ({ record }) => record.kind !== 'unauthorized-employment',
  }),
  choice(
    'ground',
    ['immigrationFraud', 'falseCitizenship', 'unlawfulReentryBar'],
    { label: 'eventGround', when: inRecord('kind', ['admissibility']) },
  ),
  integer('qualifyingViolationsDays', {
    label: 'eventViolationDays',
    when: inRecord('kind', ['unauthorized-employment']),
  }),
  date('qualifyingViolationsThrough', {
    when: inRecord('kind', ['unauthorized-employment']),
  }),
  review('exception', {
    label: 'eventException',
    when: inRecord('kind', ['unauthorized-employment']),
  }),
];
// A transfer from an employment basis checks that basis's bars at filing. A
// confirmed original basis fills blank answers, but a reported bar still applies.
const fromEmploymentBasis = (draft: UsAnswers) =>
  get(draft, [
    'admission',
    'i485BasisTransfer',
    'originalPetition',
    'adjustmentBasis',
  ]) === 'employment';
const i485Events = list('i485PendingEvents', pendingEventFields, {
  hint: 'i485PendingEvents',
});
export const processFields: UsField[] = [
  choice('petitionStatus', ['filed-with-i485', 'pending', 'approved'], {
    required: isEmploymentAdjustment,
    hint: 'petitionStatus',
  }),
  date('petitionFiledOn', { hint: 'petitionFiledOn' }),
  review('qualifyingBasis'),
  date('i485FiledOn', { hint: 'i485FiledOn', when: onlyAdjustment }),
  choice('i485ApplicantRole', ['principal', 'derivative'], {
    when: (context) =>
      onlyAdjustment(context) && hasEmploymentPetition(context.draft),
  }),
  choice('visaAtFiling', visaOptions, { hint: 'visaAtFiling' }),
  date('nvcFilingOpensOn', { when: onlyConsular }),
  choice('nvcDs260', ['submitted', 'not-submitted'], { when: onlyConsular }),
  choice(
    'nvcCivilDocuments',
    ['complete', 'missing', 'nonavailability-explained'],
    {
      when: onlyConsular,
    },
  ),
  // Consular filing uses current availability; every decision uses the
  // decision month's chart.
  monthTable('visaAtFilingByMonth', onlyAdjustment),
  choice('visaAtDecision', visaOptions, { hint: 'visaAtDecision' }),
  monthTable('visaAtDecisionByMonth', inDraft(isImmigrant)),
  date('interviewOn', { label: 'visaInterviewOn', when: onlyConsular }),
  date('decisionOn', { hint: 'decisionOn' }),
  choice('legalEntry', ['admitted', 'paroled', 'without-inspection'], {
    when: onlyAdjustment,
  }),
  review('entryException', { when: onlyAdjustment }),
  choice('otherAdjustmentBar', ['none', 'vwp', 'barred', 'review'], {
    when: onlyAdjustment,
  }),
  integer('qualifyingViolationsDays', {
    hint: 'qualifyingViolationsDays',
    when: onlyAdjustment,
  }),
  ...['lawfulNonimmigrantStatusAtFiling', 'lawfulAdmissionFor245k'].map(
    (name) =>
      bool(name as UsFieldLabel, {
        when: (context: FieldContext) =>
          onlyAdjustment(context) &&
          (hasEmploymentPetition(context.draft) ||
            fromEmploymentBasis(context.draft)),
      }),
  ),
  review('discretion', { when: onlyAdjustment }),
  group(
    'i485BasisTransfer',
    [
      date('approvedOn', { label: 'transferApprovedOn' }),
      group('originalPetition', [
        date('filedOn', { label: 'originalFiledOn' }),
        choice(
          'adjustmentBasis',
          [
            'immediate-relative',
            'family-preference',
            'employment',
            'vawa',
            'sij',
            '245i',
            'other',
          ],
          { label: 'originalBasis' },
        ),
        review('qualifyingBasisAtFiling'),
        bool('employmentOfferAtFiling'),
        review('abilityToPayAtFiling'),
        choice('visaAtFiling', visaOptions, { label: 'originalVisaAtFiling' }),
        review('entryException', { label: 'originalEntryException' }),
        review('healthWaiverAtFiling'),
        review('criminalWaiverAtFiling'),
        review('immigrationWaiverAtFiling'),
        review('vawaUnlawfulPresenceExceptionAtFiling'),
      ]),
    ],
    { hint: 'i485BasisTransfer', when: onlyAdjustment },
  ),
  { ...i485Events, when: onlyAdjustment },
];
export const humanitarianProcessFields: UsField[] = [
  date('i485FiledOn', { hint: 'i485FiledOn' }),
  date('decisionOn', { hint: 'decisionOn' }),
  i485Events,
];

// Step 11. Affidavit of support (I-864).
const householdFields = [
  choice('region', ['contiguous', 'alaska', 'hawaii']),
  integer('size', { label: 'householdSize' }),
  number('incomeUsd', { label: 'householdIncomeUsd' }),
];
export const supportFields: UsField[] = [
  choice(
    'exemption',
    ['none', 'quarters', 'citizenship-on-admission', 'widow', 'vawa'],
    { label: 'supportExemption' },
  ),
  integer('qualifyingQuarters', { when: inRecord('exemption', ['quarters']) }),
  review('exemptionEvidence', {
    when: inRecord('exemption', [
      'quarters',
      'citizenship-on-admission',
      'widow',
      'vawa',
    ]),
  }),
  integer('sponsorAge'),
  choice('relationshipToBeneficiary', [
    'spouse',
    'unmarried-child',
    'married-child',
    'other',
  ]),
  choice('sponsorStatus', ['citizen', 'national', 'lpr', 'other']),
  integer('beneficiaryAge', { label: 'supportBeneficiaryAge' }),
  review('domiciledInUs'),
  bool('affidavitSubmitted'),
  group('household', householdFields, { hint: 'supportHousehold' }),
  bool('activeDuty'),
  number('qualifyingAssetsUsd'),
  bool('orphanException'),
  review('jointSponsor'),
];

// Step 12. Inadmissibility grounds (INA 212), for immigrants and returns.
const i693Fields = [
  review('medicalEvidence'),
  date('i693SignedOn'),
  bool('i693LinkedToAnotherClosedCase'),
];
export const admissibilityFields: UsField[] = [
  review('classAHealth'),
  review('vaccines'),
  ...i693Fields,
  group('i693AtFiling', i693Fields, { when: inDraft(isI485) }),
  group('i693AtDecision', i693Fields, { when: inDraft(isI485) }),
  review('healthWaiver'),
  bool('publicChargeExempt'),
  review('publicCharge'),
  choice('benefits', [
    'none',
    'pre-change-cash-or-institutional',
    'pre-change-other',
    'post-change-means-tested',
  ]),
  group('crime', crimeFields, { hint: 'crime' }),
  review('criminalOtherGround'),
  bool('drugTraffickingBar'),
  review('criminalWaiver'),
  choice('securityGround', ['clear', 'nonwaivable', 'other-bar', 'pending']),
  group('party', partyFields),
  ...flags('immigrationFraud', 'falseCitizenship', 'falseCitizenshipException'),
  group(
    'unlawfulDeparture',
    [
      date('leftOn', { required: true }),
      integer('qualifyingDays', { required: true }),
      bool('voluntaryBeforeProceedings'),
    ],
    { alternatives: ['none'] },
  ),
  review('vawaUnlawfulPresenceException'),
  bool('unlawfulReentryBar'),
  review('otherInadmissibility'),
  list(
    'otherInadmissibilityByGround',
    [
      field('text')('ground', { required: true, hint: 'ground' }),
      review('finding', { required: true, label: 'groundFinding' }),
    ],
    { hint: 'otherInadmissibilityByGround' },
  ),
  review('immigrationWaiver'),
];

// Step 13. Fees and filing method.
const relief = (...values: string[]) => inRecord('relief', values);
export const feeFields: UsField[] = [
  choice('channel', ['online', 'paper'], { hint: 'channel' }),
  date('filingOn', { hint: 'filingOn' }),
  review('onlineCategoryAvailable'),
  choice('relief', ['none', 'waiver', 'reduced']),
  group('household', householdFields, {
    label: 'feeHousehold',
    when: relief('waiver', 'reduced'),
  }),
  bool('receivesMeansTestedBenefit', { when: relief('waiver') }),
  review('extremeFinancialHardship', { when: relief('waiver') }),
  bool('applyingWithParent', { when: inDraft(isI485) }),
  bool('premiumProcessing', {
    when: (context) =>
      context.draft.pathway === 'US-EMPLOYMENT' &&
      forCategories(...i140Categories)(context),
  }),
  bool('eb5Amendment', {
    when: (context) =>
      context.draft.pathway === 'US-EMPLOYMENT' &&
      forCategories('eb5')(context),
  }),
  bool('specialFeeExemption', {
    when: inDraft((draft) => isI485(draft) || isConsular(draft)),
  }),
  bool('adjustmentSupplementA', { when: onlyAdjustment }),
  choice(
    'consularFeeCategory',
    ['family', 'employment', 'other', 'diversity'],
    {
      when: onlyConsular,
    },
  ),
  choice('travelForm', ['advance-parole', 'refugee-document'], {
    when: inDraft(isI485),
  }),
  choice('hr1', [
    'asylum-initial',
    'asylum-annual',
    'work-initial',
    'work-renewal-asylum',
    'work-renewal-other',
    'tps',
    'sij',
    'parole',
    'i94',
  ]),
  bool('pendingI485AdvanceParole', { when: inRecord('hr1', ['parole']) }),
];

export interface UsSection {
  path: readonly string[];
  fields: UsField[];
  title?: Suffix<'section'>;
  when?: (draft: UsAnswers) => boolean;
}
export interface UsStep {
  title: Suffix<'step'> & Suffix<'intro'>;
  when: (draft: UsAnswers) => boolean;
  sections: UsSection[];
}

const onPath =
  (...pathways: string[]) =>
  (draft: UsAnswers) =>
    pathways.includes(draft.pathway ?? '');

// Step numbers are stored in drafts. Visible steps follow this order.
export const usStepDefinitions: UsStep[] = [
  {
    title: 'start',
    when: () => true,
    sections: [
      { path: [], fields: startFields },
      { path: ['admission'], fields: startAdmissionFields, when: isImmigrant },
    ],
  },
  {
    title: 'status',
    when: () => true,
    sections: [
      {
        path: [],
        fields: greenCardFields,
        title: 'greenCard',
        when: isPermanentResident,
      },
      { path: [], fields: [tripList], title: 'trips' },
    ],
  },
  {
    title: 'military',
    when: onPath('US-MILITARY'),
    sections: [{ path: ['military'], fields: militaryFields }],
  },
  {
    title: 'naturalization',
    when: isNaturalization,
    sections: [
      { path: [], fields: districtFields },
      { path: ['naturalization'], fields: naturalizationFields },
      {
        path: ['naturalization', 'spouse'],
        fields: spouseFields,
        title: 'spouse',
        when: onPath('US-SPOUSE'),
      },
    ],
  },
  {
    title: 'character',
    when: isNaturalization,
    sections: [{ path: ['naturalization'], fields: characterFields }],
  },
  {
    title: 'conditions',
    when: (draft) =>
      draft.pathway === 'US-CONDITIONS' &&
      (draft.conditional === 'marriage' || draft.conditional === 'investor'),
    sections: [
      {
        path: ['conditions', 'marriage'],
        fields: marriageConditionFields,
        title: 'marriageConditions',
        when: (draft) => draft.conditional === 'marriage',
      },
      {
        path: ['conditions', 'investor'],
        fields: investorConditionFields,
        title: 'investorConditions',
        when: (draft) => draft.conditional === 'investor',
      },
    ],
  },
  {
    title: 'travel',
    when: onPath('US-TRAVEL'),
    sections: [{ path: ['travel'], fields: travelFields }],
  },
  {
    title: 'family',
    when: hasFamilyPetition,
    sections: [{ path: ['family'], fields: familyFields }],
  },
  {
    title: 'employment',
    when: hasEmploymentPetition,
    sections: [{ path: ['employment'], fields: employmentFields }],
  },
  {
    title: 'humanitarian',
    when: onPath('US-HUMANITARIAN'),
    sections: [
      { path: ['humanitarian'], fields: humanitarianFields },
      { path: ['admission'], fields: humanitarianProcessFields },
    ],
  },
  {
    title: 'process',
    when: isImmigrant,
    sections: [{ path: ['admission'], fields: processFields }],
  },
  {
    title: 'support',
    when: isImmigrant,
    sections: [{ path: ['support'], fields: supportFields }],
  },
  {
    title: 'admissibility',
    when: (draft) =>
      isImmigrant(draft) ||
      draft.pathway === 'US-HUMANITARIAN' ||
      draft.pathway === 'US-TRAVEL',
    sections: [
      {
        path: ['admission'],
        fields: admissibilityFields,
        when: (draft) => draft.pathway !== 'US-TRAVEL',
      },
      {
        path: ['travel', 'admission'],
        fields: admissibilityFields,
        title: 'returnAdmission',
        when: onPath('US-TRAVEL'),
      },
    ],
  },
  {
    title: 'fees',
    when: (draft) => !!draft.pathway,
    sections: [{ path: ['fees'], fields: feeFields }],
  },
];

export { get as valueAt };
