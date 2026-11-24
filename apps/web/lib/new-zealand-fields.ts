import { NZ_RESIDENT_CATEGORIES } from '@uk-immigration/engine';
// Questions mirror the request read by evaluateNewZealandFull. Each name is the
// request key at its position; the label key nz.f.<label> defaults to that name.
type Label = string;
export type NzOption = string | number;

export type NzField = {
  name: string;
  label: Label;
  required?: boolean;
  /** Questions for one member of a union; hidden answers are not sent. */
  when?: (record: Record<string, unknown>) => boolean;
} & (
  | { type: 'boolean' | 'date' | 'number' | 'text' | 'numbers' }
  | { type: 'choice' | 'multi'; options: readonly NzOption[]; set?: string }
  // A date or number, or one fixed alternative such as "not yet" or "indefinite".
  | {
      type: 'date-or' | 'number-or';
      alternative: null | 'indefinite' | 'completed';
      /** The date is sent as { [wrap]: date }. */
      wrap?: string;
    }
  | { type: 'tuple'; options?: readonly string[] }
  | { type: 'group' | 'list'; fields: NzField[] }
);

const field =
  (type: 'boolean' | 'date' | 'number' | 'text' | 'numbers') =>
  (
    name: string,
    extra: { label?: Label; required?: boolean } = {},
  ): NzField => ({
    name,
    label: extra.label ?? name,
    type,
    ...extra,
  });
const bool = field('boolean');
const date = field('date');
const num = field('number');
const text = field('text');
const numbers = field('numbers');
const flags = (...names: string[]) => names.map((name) => bool(name));
const counts = (...names: string[]) => names.map((name) => num(name));
const choice = (
  name: string,
  options: readonly NzOption[],
  extra: { label?: Label; required?: boolean; set?: string } = {},
): NzField => ({
  name,
  label: (extra.label ?? name) as Label,
  type: 'choice',
  options,
  ...extra,
});
const group = (
  name: string,
  fields: NzField[],
  extra: { label?: Label; when?: NzField['when'] } = {},
): NzField => ({
  name,
  label: (extra.label ?? name) as Label,
  type: 'group',
  fields,
  ...extra,
});
const list = (name: string, fields: NzField[], label = name): NzField => ({
  name,
  label: label as Label,
  type: 'list',
  fields,
});
const when =
  (key: string, ...values: unknown[]) =>
  (field: NzField): NzField => ({
    ...field,
    when: (record) => values.includes(record[key]),
  });

const assessment = ['accepted', 'declined', 'pending'] as const;
const decision = ['granted', 'declined', 'pending'] as const;
const tests = ['ielts', 'toefl', 'pte', 'cambridge', 'oet'] as const;
export const oetGrades = ['A', 'B', 'C+', 'C', 'D', 'E'] as const;

export const tripFields = [
  date('departed', { required: true }),
  date('returned', { required: true }),
];

const residentVisa = group('residentVisa', [
  date('granted', { label: 'residentGranted', required: true }),
  choice('category', NZ_RESIDENT_CATEGORIES, {
    label: 'residentCategory',
    required: true,
  }),
]);

const historyConditions = choice('conditions', ['none', 'met', 'outstanding'], {
  label: 'historyConditions',
  set: 'cond',
});

export const historyFields: NzField[] = [
  date('firstArrival'),
  residentVisa,
  date('permanentResidentVisa'),
  date('travelConditionsEnd'),
  historyConditions,
  bool('nonPrincipal'),
  list('trips', tripFields),
];

// Facts about the resident visa record read by all three resident pathways.
export const residentRecordFields: NzField[] = [
  choice('grantLocation', ['onshore', 'offshore']),
  {
    name: 'firstResidentEntry',
    label: 'firstResidentEntry',
    type: 'date-or',
    alternative: null,
  },
  bool('currentlyInNz'),
  choice('firstEntryClass', ['standard', 'pacific-quota', 'aip-child']),
  {
    name: 'parentFirstEntry',
    label: 'parentFirstEntry',
    type: 'date-or',
    alternative: 'completed',
    wrap: 'deadline',
  },
  date('parentTravelEnd'),
  bool('restrictedEntry'),
];

export const travelFields: NzField[] = [
  choice('action', ['initial', 'variation', 'subsequent'], { set: 'action' }),
  bool('passportCoversInitialConditions'),
  choice('variationBasis', [
    'ordinary',
    'australian',
    'partner',
    'secondment',
    'old-investor',
    'aip',
  ]),
  ...flags(
    'previouslyUsedAustralianVariation',
    'nzCitizenPartnerSupportsInWriting',
    'sameOngoingSponsoredPartnership',
  ),
  num('genuineCohabitationMonths'),
  bool('employerConfirmsSecondmentAndResidence'),
  num('totalSecondmentYears'),
  ...flags(
    'taxConfirmedForAnnualVariation',
    'conditionsCompliedWithToDate',
    'principalQualifiesForTravel',
  ),
  group('atExpiry', [
    bool('eligibleForPrv'),
    choice('variation', ['none', '14-days', '12-months', '24-months']),
    ...flags(
      'secondmentQualified',
      'noEntryRestrictions',
      'conditionsCompliedWith',
      'taxResidenceConfirmed',
    ),
  ]),
  bool('filipinoDairyExceptionClaimed'),
];

export const prvFields: NzField[] = [
  choice(
    'category',
    [
      'ordinary',
      'migrant-investor',
      'parent-retirement',
      'active-investor-plus',
    ],
    { label: 'prvCategory' },
  ),
  date('expiredOn'),
  choice('role', ['principal', 'linked', 'independent', 'independent-review'], {
    label: 'prvRole',
  }),
  bool('principalHoldsPrv'),
  choice(
    'conditions',
    ['none', 'confirmed', 'compliant-pending', 'outstanding', 'breached'],
    { label: 'prvConditions', set: 'prvCond' },
  ),
  choice('deportationLiability', ['none', 'liable', 'suspended']),
  choice('furtherPoliceEvidence', [
    'not-requested',
    'provided',
    'requested-outstanding',
  ]),
  choice('formerResidentIssue', [
    'none',
    'false-identity',
    'deportation-notice',
    'other-adverse',
  ]),
  {
    name: 'otherCommitments',
    label: 'otherCommitments',
    type: 'multi',
    options: ['tax', 'investment', 'legacy-investment', 'business', 'base'],
    set: 'commitment',
  },
  ...flags('taxResidenceConfirmedForWholePeriod', 'treatyResidentElsewhere'),
  ...counts('qualifyingNzInvestmentNzd', 'investmentMonthsAfterGrant'),
  ...flags('oldBusinessInvestorConditionsMet', 'businessFoundedOrPurchased'),
  ...counts(
    'businessSharePercent',
    'successfulBusinessMonthsImmediatelyBeforeApplication',
  ),
  bool('goingConcernAccountsCertified'),
  numbers('includedFamilyDaysInTwoYears'),
  date('homePurchasedOn'),
  bool('stillOwnAndOccupyFamilyHome'),
  num('qualifyingEmploymentMonthsInTwoYears'),
];

export const citizenshipFields: NzField[] = [
  num('ageAtDecision'),
  ...flags('parentCitizenOrAboutToBe', 'fullCapacity'),
  choice('capacityException', ['referred', 'granted', 'declined']),
  bool('entitlementConfirmed'),
  choice('presenceException', [
    'none',
    'exceptional',
    'realm',
    'crown-service',
  ]),
  num('exceptionalResidentDaysInWindow'),
  bool('specialPresenceAcceptedByDia'),
  choice(
    'character',
    [
      'clear',
      'old-conviction',
      'pending-charge',
      'protection-order',
      'other-adverse',
    ],
    { label: 'citizenshipCharacter' },
  ),
  num('longestPrisonYears'),
  date('lastShortSentenceOrParoleOn'),
  date('lastNonCustodialConvictionOn'),
  num('demeritPoints'),
  choice('ministerialConvictionException', ['requested', 'granted']),
  ...counts('overseasMonthsRecent', 'overseasMonthsLong'),
  choice('foreignPoliceEvidence', [
    'provided',
    'not-requested',
    'requested-outstanding',
  ]),
  ...flags('understandsResponsibilities', 'testExemptionConfirmed'),
  choice(
    'english',
    ['evidenced', 'waived', 'interview', 'waiver-requested', 'insufficient'],
    { label: 'citizenshipEnglish', set: 'citizenEnglish' },
  ),
  choice('residenceIntent', [
    'nz-or-realm',
    'documented-overseas-service',
    'accompany-citizen-in-service',
    'long-trip',
    'emigrate',
  ]),
  bool('identityDocumentsAndWitness'),
  choice('oath', ['willing', 'exempt', 'unwilling']),
  choice('feeCategory', ['standard', 'samoa-s7a']),
];

export const jobFields: NzField[] = [
  text('occupationCode'),
  ...flags(
    'genuineOfferInNZ',
    'employerCompliant',
    'accreditedAtApplication',
    'accreditedAtDecision',
  ),
  num('guaranteedWeeklyHours'),
  choice('contract', ['permanent', 'fixed', 'services']),
  ...counts('contractMonths', 'hourlyPay', 'annualPay', 'maximumWeeklyHours'),
  ...flags('sleepHoursExcluded', 'sleepExclusionVerified', 'occupationMatch'),
];

export const feeBand = choice('feeBand', ['A', 'B', 'C'], { set: 'band' });

const wageLock = [date('accrualStarted'), date('visaGranted')];
const smcRoutes = ['points', 'experience', 'trades'] as const;

export const smcFields: NzField[] = [
  choice('route', smcRoutes, { label: 'smcRoute' }),
  choice('invitedRoute', [...smcRoutes, 'none']),
  date('invitedOn'),
  bool('invitationCurrent'),
  choice('eoiDisclosure', ['accurate', 'under-review', 'declined']),
  ...wageLock,
  choice('skillLevel', ['one', 'two-three', 'four-five-or-unlisted']),
  choice('registration', ['held', 'not-required', 'required-missing']),
  ...flags('sr330Registration', 'anzscoQualificationOrSubstitution'),
  num('relevantWorkYears'),
  bool('contractRecordSustainable'),
  num('contractorNZSkilledMonths'),
  bool('independentMidwifeAuthorityAndRegistration'),
  choice('claim', ['income', 'registration', 'qualification']),
  choice('registrationPoints', [0, 3, 4, 5, 6], { set: 'regPoints' }),
  choice('qualification', [
    'doctorate',
    'nz-masters',
    'overseas-masters',
    'nz-postgrad',
    'overseas-postgrad',
    'nz-bachelor',
    'overseas-bachelor',
    'iqa-level10',
    'iqa-level9',
    'iqa-level8',
    'other',
  ]),
  ...flags('qualificationRecognised', 'holdsBachelor'),
  ...counts(
    'nzMastersFullTimeWeeks',
    'pointsMonthsInLast24',
    'pointsMonthsInLast36',
    'pointsMonthsInLast48',
    'directMonthsInLast10Years',
    'directNzMonthsInLast10Years',
    'additionalNzMonthsInWindow',
    'minimumAdditionalHourlyPay',
  ),
  ...flags('workEvidenceVerified', 'tradeListedAtAccrual'),
  num('tradeQualificationLevel'),
  bool('tradeQualificationRelevant'),
  choice('tradeQualificationOrigin', ['nz', 'overseas']),
  num('nzCreditsExcludingRpl'),
  bool('overseasTradeIqa'),
];

const transport = group('transport', [
  bool('qualifyingBeforeRemoval'),
  date('aewvAppliedOn'),
  date('otherWorkVisaGrantedOn'),
  date('offerOn'),
  date('employmentSignedOn'),
  date('startedOn'),
  ...flags('busOperatorEligible', 'classFourFiveVehicleAndLicence'),
]);

export const workPeriodFields: NzField[] = [
  choice('kind', ['tier2', 'care', 'transport', 'high-pay'], {
    required: true,
    set: 'work',
  }),
  num('monthsInWindow', { required: true }),
  ...wageLock,
  text('occupationCode'),
  ...counts('guaranteedWeeklyHours', 'minimumHourlyPay'),
  choice(
    'visa',
    [
      'work',
      'critical-purpose-work',
      'interim-work-renewal',
      'other-interim-work',
      'WI21',
      'WI22',
      'other',
    ],
    { label: 'periodVisa', set: 'visa' },
  ),
  ...flags('occupationRequirementsVerified', 'maintainedRemovedOccupation'),
  num('archivedHourlyFloor'),
  bool('telecomLevelThreeCertificate'),
  date('visaAppliedOn'),
  transport,
];

// Older requests gave the filing visa and location here; the questionnaire
// asks for them once under common.residenceFiling.
const workResidence: NzField[] = [
  ...wageLock,
  list('periods', workPeriodFields),
  ...flags('distinctMonthsAndEarningsVerified', 'maintainedRemovedOccupation'),
  num('archivedHourlyFloor'),
];

export const greenFields: NzField[] = [
  choice('tier', ['straight', 'work'], { set: 'tier' }),
  ...flags('rowRequirementsVerified', 'telecomLevelThreeCertificate'),
  num('contractorRelevantYears'),
  bool('independentMidwifeAuthorityAndRegistration'),
  ...workResidence,
];

export const sectorFields: NzField[] = [
  choice('category', ['care', 'transport'], { label: 'sectorCategory' }),
  when('category', 'transport')(transport),
  when('category', 'transport')(bool('maritimeCertificateHeld')),
  ...workResidence,
];

const familyEnglish = (name: string): NzField =>
  group(name, [
    choice(
      'method',
      [
        'test',
        'accepted-alternative',
        'alternative-under-review',
        'none',
        'esol-paid',
      ],
      { label: 'englishMethod', required: true, set: 'fmethod' },
    ),
    ...[
      choice('type', tests, { label: 'testName', required: true }),
      num('overall'),
      { name: 'skills', label: 'skills', type: 'tuple' } as NzField,
      {
        name: 'oetGrades',
        label: 'oetGrades',
        type: 'tuple',
        options: oetGrades,
      } as NzField,
      date('date', { label: 'testDate' }),
      bool('atTestCentre'),
    ].map(when('method', 'test')),
  ]);

export const partnerFields: NzField[] = [
  choice('goal', ['resident', 'direct-prv'], { label: 'partnerGoal' }),
  ...counts('partnerAge', 'monthsTogetherAfterBothAdult'),
  ...flags('metInPerson', 'eligibleRelationshipFormAndKinship'),
  choice('genuineStableEvidence', assessment),
  choice('separation', ['none', ...assessment], { set: 'separation' }),
  choice('earlierNonDeclaration', ['none', 'barred-eoi', ...assessment]),
  choice(
    'sponsorStatus',
    ['citizen', 'resident', 'australian-basis', 'other'],
    {
      set: 'sponsor',
    },
  ),
  bool('sponsorPrimarilyResidentInNz'),
  num('previousSuccessfulApplications'),
  date('lastSuccessfulApplication'),
  bool('sponsorFreeOfDeportationLiabilityAndS4Bar'),
  choice('sponsorCharacter', assessment),
  ...flags('sponsorPoliceEvidence', 'earlierCategoryRequiredEnglish'),
  choice('earlierCategoryEnglish', assessment),
  numbers('citizenNzMonthsPerYear'),
  bool('citizenOffshore'),
  date('citizenLastReturn'),
];

export const parentFields: NzField[] = [
  choice('relationship', ['parent', 'grandparent', 'guardian', 'ineligible'], {
    set: 'rel',
  }),
  ...flags(
    'bothBiologicalParentsDeceased',
    'bothDiedAndGuardianshipBeforeAdulthood',
    'mostRecentLegalGuardian',
  ),
  list(
    'children',
    [
      num('age', { label: 'childAge' }),
      ...flags('single', 'hasOwnChildren', 'financiallyDependent'),
    ],
    'parentChildren',
  ),
  choice('eoiChannel', ['online', 'paper']),
  choice('eoi', ['not-filed', 'in-pool', 'expired', 'revoked', 'invited']),
  date('invitationDate'),
  date('selectionDate'),
  choice('scheme', ['child', 'child-and-partner', 'two-children'], {
    set: 'scheme',
  }),
  list('sponsors', [
    num('age', { label: 'sponsorAge' }),
    ...flags('notDependentChild', 'currentUnconditionalCitizenOrResident'),
    num('yearsAsCitizenOrResident'),
    bool('normallyResidentInNz'),
    numbers('nzDaysInEachPriorYear'),
    ...flags('meetsOtherR4Conditions', 'acceptsSupportUndertaking'),
  ]),
  num('jointPartnerCohabitationMonths'),
  bool('jointPartnershipRecognised'),
  num('parentsSponsored'),
  list('incomePeriods', [
    date('from', { label: 'incomeFrom', required: true }),
    numbers('irdIncomePerSponsor', { required: true }),
  ]),
  familyEnglish('applicantEnglish'),
  bool('includesPartner'),
  familyEnglish('partnerEnglish'),
  choice('parentBoost', [
    'never-held',
    'covered',
    'insurer-bank-error-promptly-restored',
    'gap',
  ]),
  bool('outstandingBoostCrownDebt'),
];

export const investorFields: NzField[] = [
  choice('route', ['active', 'business'], { label: 'investmentRoute' }),
  group(
    'active',
    [
      choice('category', ['growth', 'balanced'], { label: 'aipCategory' }),
      choice('goal', ['resident', 'investment-conditions'], {
        label: 'aipGoal',
      }),
      ...counts('nominatedFunds', 'totalInvested'),
      choice('qualifyingInvestments', assessment),
      num('qualifyingPhilanthropy'),
      choice('cleanFundsAndTransfer', assessment),
      choice('fitAndProper', assessment),
      date('approvalInPrinciple'),
      date('allInvestmentsCompleted'),
      bool('extensionGranted'),
      date('transferEvidenceFiled'),
      bool('currentContactDetailsProvided'),
      ...counts('eligibleBalancedTopUp', 'residentDaysDuringInvestment'),
      bool('retainedHoldingsAndUpdatedAddress'),
      date('interimEvidenceAndQuestionnaire'),
      date('finalEvidenceAndQuestionnaire'),
    ],
    { when: (record) => record.route === 'active' },
  ),
  group(
    'business',
    [
      choice('stage', ['work', 'residence'], { set: 'stage' }),
      num('workApplicationAge'),
      date('workApplicationDate'),
      familyEnglish('principalEnglish'),
      num('cleanBankruptcyYears'),
      choice('fitAndProper', assessment),
      num('reserveFunds'),
      list('experience', [
        choice('role', ['owner', 'senior-manager'], {
          label: 'experienceRole',
          required: true,
        }),
        num('years', { label: 'experienceYears', required: true }),
        num('weeklyHours', { required: true }),
        num('fullTimeEmployees', { required: true }),
        num('revenue', { required: true }),
      ]),
      choice('targetAndDueDiligence', assessment),
      ...flags('capitalAndOperatingPlan', 'holdsBusinessInvestorWorkVisa'),
      ...counts('acquisitionExcludingRealEstate', 'activeOwnershipMonths'),
      numbers('annualNzDays'),
      bool('retainedOwnershipAndSameApprovedBusiness'),
      choice('solventRegisteredAndCompliant', assessment),
      ...counts('currentFte', 'additionalNzFte', 'additionalJobMonths'),
      bool('workApplicationEvidenceComplete'),
    ],
    { when: (record) => record.route === 'business' },
  ),
];

export const religiousFields: NzField[] = [
  ...flags('inNz', 'holdsQualifyingWorkVisa'),
  ...counts('compliantVisaYears', 'qualifyingTrainingOrWorkYears'),
  choice('eligibleSponsorAndLongTermNeed', assessment),
  ...flags('sponsorshipUndertaking', 'qualifyingReligiousDutiesAndOffer'),
  {
    name: 'offerYears',
    label: 'offerYears',
    type: 'number-or',
    alternative: 'indefinite',
  },
  choice('welfareSinceWorkVisa', [
    'none',
    'claimed-or-granted',
    'tax-credit-or-unclear',
  ]),
  familyEnglish('principalEnglish'),
];

const applicantFiling: NzField[] = [
  bool('filingFromOverseas'),
  choice(
    'currentVisa',
    [
      'work',
      'critical-purpose-work',
      'business-investor-work',
      'religious-work',
      'WI21',
      'WI22',
      'interim',
      'interim-work-renewal',
      'other-interim-work',
      'limited',
      'transit',
      'other-eligible-temporary-or-resident',
      'other',
      'none',
    ],
    { set: 'visa' },
  ),
  choice('statutoryBar', [
    'none',
    'section-150',
    'section-75A-cancellation',
    'liable-for-deportation',
  ]),
];

export const filingFields: NzField[] = [
  ...applicantFiling,
  ...flags(
    'atImmigrationControlArea',
    'visaWaiverAtControlArea',
    'eligibleForFirstResidenceAtControlArea',
    'hasOmittedRelationshipVisaDependant',
  ),
  list('dependentChildrenUnlawfullyInNz', [
    date('dateOfBirth', { label: 'childBirth' }),
    bool('lackOfRemovalRightDemonstrated'),
  ]),
];

export const lodgementFields: NzField[] = [
  bool('identityDocuments'),
  bool('requiredFeePaid'),
  choice('levyBasis', [
    'ordinary',
    'samoan-citizen',
    'refugee-or-protected',
    'confirmed-exemption',
    'under-review',
  ]),
];

const certificate = [date('issued'), bool('reusable')];
export const evidenceFields: NzField[] = [
  group('medical', [
    ...certificate,
    bool('limited'),
    choice('generalAsLimited', assessment),
  ]),
  group('xray', certificate),
  bool('pregnant'),
  num('consecutiveMonthsInTbRiskCountries'),
  ...flags(
    'freshMedicalRequested',
    'freshXrayRequested',
    'policeCountriesComplete',
  ),
  list('police', [
    ...certificate,
    bool('isCitizenshipCountry'),
    num('monthsInCountryDuringLookback'),
    bool('provided'),
  ]),
  bool('policeWaiverGranted'),
];

export const healthFields: NzField[] = [
  choice('health', [
    'clear',
    'assessed-acceptable',
    'assessed-unacceptable',
    'excluded-from-waiver',
    'needs-assessment',
  ]),
  num('medicalCostNzd'),
  choice('medicalWaiver', decision),
  bool('familyOmission'),
  choice('character', [
    'clear',
    'statutory-bar',
    'waiver-required',
    'pending-charge',
    'security-review',
    'sanctions-review',
  ]),
  list('convictions', [
    date('convictionDate', { required: true }),
    num('imprisonmentMonths', { required: true }),
  ]),
  choice('specialDirection', decision),
  choice('characterWaiver', decision),
];

const testOnly = when('method', 'test');
export const englishFields: NzField[] = [
  choice('method', ['test', 'citizenship', 'qualification', 'none'], {
    label: 'englishMethod',
    required: true,
    set: 'method',
  }),
  ...[
    choice('test', tests, { label: 'testName', required: true }),
    num('score'),
    {
      name: 'grades',
      label: 'oetGrades',
      type: 'tuple',
      options: oetGrades,
    } as NzField,
    date('date', { label: 'testDate' }),
    bool('inPerson'),
  ].map(testOnly),
  ...[bool('eligibleCitizenship'), num('workOrStudyYearsInSixCountries')].map(
    when('method', 'citizenship'),
  ),
  ...[
    num('level'),
    ...flags('isBachelor', 'eligibleCountry'),
    num('academicYearsInSixCountries'),
    bool('assessedOrExempt'),
  ].map(when('method', 'qualification')),
];

export const englishOtherFields: NzField[] = [
  bool('testSpecificallyRequested'),
  choice('religiousEnglishBackground', assessment),
  bool('registeredForSmc'),
  choice('esol', ['paid-and-signed', 'declined', 'planned']),
];

export const dependantFields: NzField[] = [
  choice('relation', ['partner', 'child', 'other']),
  date('dateOfBirth'),
  bool('partnershipRequirementsMet'),
  choice(
    'relocationAuthority',
    ['right-evidenced', 'consent-evidenced', 'not-required', 'none'],
    { set: 'relocation' },
  ),
  ...flags('single', 'hasOwnChildren', 'financiallyDependent'),
  group('residenceFiling', applicantFiling, { label: 'dependantFiling' }),
  bool('identityDocuments'),
  ...healthFields,
  group('evidence', evidenceFields),
  group('english', englishFields),
  ...englishOtherFields,
  group('prvApplication', [
    date('firstArrival'),
    residentVisa,
    date('travelConditionsEnd'),
    historyConditions,
    list('trips', tripFields),
    group('travel', [...residentRecordFields, ...travelFields], {
      label: 'travelEvidence',
    }),
    group('prv', prvFields, { label: 'prvEvidence' }),
    bool('linkedToJointPrincipal'),
  ]),
];
