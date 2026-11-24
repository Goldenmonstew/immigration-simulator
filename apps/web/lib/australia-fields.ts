import {
  AU_FULL_PATHWAYS,
  AU_PERMANENT_SUBCLASSES,
  AU_TEMPORARY_SUBCLASSES,
  type AuFullPathId,
} from '@uk-immigration/engine';
import type { auFormZh } from '../i18n/countries/australia-form';

type Suffix<P extends string> =
  Extract<
    keyof typeof auFormZh,
    `au.${P}.${string}`
  > extends `au.${P}.${infer S}`
    ? S
    : never;

export type AuFieldName = Suffix<'field'>;
export type AuOption = Suffix<'option'>;
export type AuSectionName = Suffix<'section'>;

export type AustraliaField = {
  name: string;
  label: AuFieldName;
  hint?: Suffix<'form'>;
  required?: boolean;
} & (
  | {
      type:
        | 'boolean'
        | 'date'
        | 'number'
        | 'integer'
        | 'null-date'
        | 'year-list'
        | 'pathway';
    }
  | {
      type: 'status-date';
      literals: readonly ('none' | 'never' | 'ongoing')[];
    }
  | { type: 'choice'; options: readonly AuOption[] }
  | { type: 'group' | 'list'; fields: AustraliaField[] }
  | {
      type: 'union-group';
      literals: readonly AuOption[];
      fields: AustraliaField[];
    }
);

const bool = (name: AuFieldName, required = false): AustraliaField => ({
  name,
  label: name,
  type: 'boolean',
  required,
});
const date = (
  name: AuFieldName,
  required = false,
  label: AuFieldName = name,
  hint?: Suffix<'form'>,
): AustraliaField => ({ name, label, required, hint, type: 'date' });
const nullDate = (
  name: AuFieldName,
  hint?: Suffix<'form'>,
): AustraliaField => ({
  name,
  label: name,
  hint,
  type: 'null-date',
});
const statusDate = (
  name: AuFieldName,
  literals: readonly ('none' | 'never' | 'ongoing')[],
): AustraliaField => ({
  name,
  label: name,
  type: 'status-date',
  literals,
});
const number = (
  name: AuFieldName,
  label: AuFieldName = name,
): AustraliaField => ({
  name,
  label,
  type: 'number',
});
const integer = (
  name: AuFieldName,
  label: AuFieldName = name,
): AustraliaField => ({
  name,
  label,
  type: 'integer',
});
const choice = (
  name: string,
  options: readonly AuOption[],
  label: AuFieldName = name as AuFieldName,
  required = false,
): AustraliaField => ({
  name,
  label,
  type: 'choice',
  options,
  required,
});
const group = (
  name: string,
  fields: AustraliaField[],
  label: AuFieldName = name as AuFieldName,
): AustraliaField => ({
  name,
  label,
  type: 'group',
  fields,
});

const subclasses = [
  ...AU_TEMPORARY_SUBCLASSES,
  ...AU_PERMANENT_SUBCLASSES,
] as const satisfies readonly AuOption[];

const locations = ['onshore', 'offshore', 'clearance'] as const;
const noFurtherStayOptions = [
  'clear',
  'waived',
  'waiver-pending',
  'barred',
] as const;
const section48Options = [
  'none',
  'qualifying-refusal',
  'qualifying-cancellation',
] as const;
const complianceOptions = ['complied', 'minor-breach', 'not-complied'] as const;
const findingOptions = ['confirmed', 'refused', 'pending'] as const;

export const step0Fields: AustraliaField[] = [
  date('simulationDate', true, 'simulationDate', 'simulationDateHint'),
  { name: 'pathway', label: 'pathway', type: 'pathway' },
  date('dateOfBirth'),
  date('firstArrival'),
  choice('locationAtApplication', locations),
  choice('locationAtDecision', locations),
  bool('permissibleOnshoreVisa'),
  choice('noFurtherStay', noFurtherStayOptions),
  choice('section48History', section48Options),
  choice('regionalLockException', ['instrument-confirmed', 'claimed', 'none']),
  choice('visaCompliance', complianceOptions),
  bool('sponsoredFullTime'),
  bool('hongKongPassport'),
  bool('hongKongPrimaryVisaTerms'),
  {
    name: 'visas',
    label: 'visas',
    hint: 'visasHint',
    type: 'list',
    fields: [
      choice('subclass', subclasses, 'subclass', true),
      date('from', true),
      date('to'),
    ],
  },
  {
    name: 'trips',
    label: 'trips',
    hint: 'tripsHint',
    type: 'list',
    fields: [date('departed', true), date('returned', true)],
  },
];

export const englishFields: AustraliaField[] = [
  choice('passport', ['CA', 'NZ', 'IE', 'GB', 'US', 'other']),
  bool('functionalDeterminedAtInterview'),
  date('functionalApplicationDate'),
  {
    name: 'education',
    label: 'education',
    type: 'union-group',
    literals: ['none'],
    fields: [
      bool('allPrimaryInEnglish'),
      number('secondaryYearsInEnglish'),
      number('australianTertiaryYearsInEnglish'),
      number('completedAwardYearsInEnglish'),
    ],
  },
  {
    name: 'test',
    label: 'test',
    type: 'union-group',
    literals: ['none', 'not-yet'],
    fields: [
      choice(
        'name',
        [
          'ielts',
          'pte',
          'toefl',
          'cambridge',
          'celpip',
          'oet',
          'languagecert',
          'met',
        ],
        'name',
        true,
      ),
      date('date'),
      choice('format', ['approved', 'unapproved', 'single-skill-retake']),
      number('listening'),
      number('reading'),
      number('writing'),
      number('speaking'),
      number('overall'),
      choice('legacyOetLowestGrade', ['A', 'B', 'C', 'D', 'E']),
    ],
  },
];

export const feeFields: AustraliaField[] = [
  bool('pacificRegionalPassport'),
  integer('additionalAdults'),
  integer('additionalMinors'),
  bool('chargeablePrimaryApplicant'),
  integer('chargeableAdditionalAdults'),
  bool('additionalInstalmentsPaid'),
  bool('religiousNominationExemption'),
  number('employerAnnualTurnover'),
  bool('regionalPosition'),
  bool('paperReturnApplication'),
  choice('partnerCategory', [
    'ordinary',
    'qualifying-current-300',
    'qualifying-former-300',
  ]),
  group('citizenship', [
    choice('concessionCard', ['none', 'holder', 'listed-dependant']),
    bool('includedWithResponsibleParent'),
    integer('qualifyingPermanentForcesDays'),
    bool('otherExemption'),
    statusDate('previousApplicationWithTest', ['none']),
  ]),
];

const assessmentGroup = group('assessment', [
  choice('kind', ['positive', 'negative', '485', 'awaiting'], 'kind', true),
  date('issued'),
  date('expires'),
]);

export const nominationFields: AustraliaField[] = [
  choice('status', ['pending', 'approved', 'withdrawn', 'refused']),
  date('lodged'),
  date('approved'),
  bool('positionAvailable'),
  bool('fullTimeRenewable'),
  number('offeredYears'),
  number('annualSalary'),
  number('acceptedMarketRate'),
  choice('licensing', ['unregulated', 'licensed-or-eligible', 'ineligible']),
];

export const employerCommonFields: AustraliaField[] = [
  choice('exemption', [
    'none',
    'academic',
    'science',
    'regional-doctor',
    'legacy-457',
    'transitional-457',
    'high-income-457-482',
    '444-461',
  ]),
  choice('sponsorshipConduct', [
    'clear',
    'being-assessed',
    'disregarded',
    'adverse',
  ]),
  bool('trtPrimaryVisa'),
  bool('trtOccupationMatches'),
  choice('trtSkillsDemonstration', [
    'not-requested',
    'demonstrated',
    'outstanding',
  ]),
  bool('csolOccupation'),
  assessmentGroup,
  number('fullTimeExperienceYears'),
];

const invitationUnion = (
  name: string,
  label: AuFieldName,
  includeScore = true,
): AustraliaField => ({
  name,
  label,
  type: 'union-group',
  literals: ['awaiting'],
  fields: [
    date('issued', true),
    date('deadline'),
    ...(includeScore ? [integer('score')] : []),
  ],
});

export const skillsFields: AustraliaField[] = [
  invitationUnion('invitation189', 'invitation189'),
  invitationUnion('invitation190', 'invitation190'),
  choice('occupationList', ['MLTSSL', 'STSOL', 'other']),
  bool('occupationInInvitation189'),
  bool('occupationInInvitation190'),
  assessmentGroup,
  choice('nomination', ['active', 'withdrawn', 'awaiting']),
  group('points', [
    integer('overseasMonths'),
    integer('australianMonths'),
    integer('professionalMonths'),
    choice(
      'education',
      ['none', 'diplomaTradeOrAssessed', 'bachelor', 'doctorate'],
      'pointsEducation',
    ),
    number('specialistStudyYears'),
    group('australianStudy', [
      bool('qualifying', true),
      number('academicYears'),
      integer('calendarMonths'),
    ]),
    bool('regionalCampusAndResidenceNoDistanceStudy'),
    bool('communityLanguageCredential'),
    choice(
      'partner',
      ['none', 'competent', 'skilled', 'singleOrAustralian'],
      'partnerPoints',
    ),
  ]),
];

export const innovationFields: AustraliaField[] = [
  invitationUnion('invitation', 'invitation', false),
  choice('achievement', ['accepted', 'submitted', 'none', 'refused']),
  bool('achievementsMatchInvitation'),
  choice('form1000', ['confirmed', 'awaiting-verification', 'missing']),
  choice('exceptionalBenefit', ['accepted', 'awaiting', 'refused']),
  choice('securityAssistance', ['accepted', 'awaiting', 'refused']),
];

export const regionalFields: AustraliaField[] = [
  { name: 'assessmentYears', label: 'assessmentYears', type: 'year-list' },
  bool('disputedAssessment'),
  choice('regionalCondition', [
    'complied',
    'outside-region',
    'class-confirmed',
    'class-claimed',
  ]),
  choice('changeNotice', complianceOptions),
  choice('evidenceAndInterview', complianceOptions),
  nullDate('hongKongOnlySince', 'hkNullDateHint'),
  choice('hongKongRegionalException', ['confirmed', 'claimed', 'none']),
];

export const partnerFields: AustraliaField[] = [
  date('partnerLodged'),
  choice('stream', ['onshore', 'offshore']),
  bool('longTermRelationship'),
  choice('relationship', ['married', 'de-facto', 'intended-marriage', 'none']),
  bool('marriedByDecision'),
  date('relationshipFrom'),
  bool('sharedDependentChildAtLodgement'),
  integer('partnerAgeAtLodgement'),
  bool('registeredAtLodgement'),
  bool('humanitarianDeFactoException'),
  bool('compassionateDeFactoClaim'),
  choice('relationshipEvidenceAtLodgement', findingOptions),
  bool('eligiblePartnerStatus'),
  bool('eligibleAdultGuardianSponsor'),
  integer('priorSponsoredPeople'),
  statusDate('lastRelevantPartnerApplication', ['none']),
  choice('historyException', findingOptions),
  statusDate('parentVisaGrant', ['none']),
  choice('parentVisaException', findingOptions),
  bool('subclass204RestrictedAtLodgement'),
  bool('childOffenceBarApplies'),
  number('relevantSentenceMonths'),
  choice('sponsorOffenceException', findingOptions),
  bool('consentToDisclosure'),
  bool('sponsorPoliceCheckIfRequested'),
  bool('sponsorshipApprovedInForce'),
  choice('onshoreStatus', [
    'substantive',
    'schedule-3-satisfied',
    'needs-review',
    'transit',
  ]),
  choice('noFurtherStay', noFurtherStayOptions, 'partnerNoFurtherStay'),
  choice('section48History', section48Options, 'partnerSection48History'),
  bool('section48LodgementRequirementsMet'),
  bool('temporaryStageGranted'),
  group('temporaryGrant', [
    choice('basis', ['ordinary', 'ministerial'], 'basis', true),
    date('decisionDate'),
  ]),
  bool('continuingSponsorship'),
  choice('relationshipAtDecision', [
    'continuing',
    'ended',
    'death',
    'family-violence',
    'child-orders',
  ]),
  choice('exceptionEvidence', findingOptions),
  bool('enteredAfterApplication'),
  bool('offshoreHumanitarianRelationshipDisclosed'),
];

export const rrvFields: AustraliaField[] = [
  choice(
    'status',
    ['current-pr', 'former-pr', 'former-citizen', 'cancelled-pr', 'never'],
    'rrvStatus',
  ),
  integer('qualifyingDays'),
  choice('ties', ['confirmed', 'refused', 'pending', 'none']),
  bool('tiesDepartureRequirements'),
  number('continuousAbsenceYears'),
  choice('longAbsenceReasons', findingOptions),
  choice('familyBasis', ['qualifying-155', 'qualifying-157', 'none']),
  choice('compassionateDeparture', ['confirmed', 'refused', 'pending', 'none']),
  date('absentSince'),
  choice('compassionateAbsence', findingOptions),
  bool('returnApplicationBar'),
];

export const citizenshipFields: AustraliaField[] = [
  choice('medicalBranch', [
    'none',
    'incapacity-claimed',
    'incapacity-confirmed',
    'sensory-claimed',
    'sensory-confirmed',
  ]),
  bool('understandsApplication'),
  group('scv', [date('firstGrant', true), bool('continuousEligible')]),
  bool('permanentAtApplication'),
  bool('permanentAtDecision'),
  choice('otherResidenceBasis', findingOptions),
  statusDate('confinementEnded', ['none', 'ongoing']),
  choice('confinementDiscretion', findingOptions),
  {
    name: 'test',
    label: 'citizenshipTest',
    type: 'union-group',
    literals: ['awaiting', 'retest-pending'],
    fields: [integer('correct'), integer('valuesCorrect')],
  },
  choice(
    'character',
    ['confirmed', 'refused', 'pending', 'no-known-record', 'record'],
    'citizenshipCharacter',
  ),
  bool('policeCertificatesIfRequired'),
  choice('identity', findingOptions),
  bool('securityBar'),
  bool('currentCriminalBar'),
  {
    name: 'lastPrisonSentence',
    label: 'lastPrisonSentence',
    type: 'union-group',
    literals: ['none'],
    fields: [
      number('months'),
      date('firstFreeDay', true),
      bool('seriousRepeatOffender'),
    ],
  },
  statusDate('mostRecentCessation', ['never']),
  choice('intention', [
    'reside',
    'links-confirmed',
    'links-claimed',
    'no-links',
  ]),
  bool('inAustraliaAtApproval'),
  choice('approvalAbroadException', findingOptions),
  bool('willingToPledge'),
  choice('minorEvidence', findingOptions),
];

export const publicInterestFields: AustraliaField[] = [
  bool('officialPassport'),
  choice('passportException', ['pending', 'accepted']),
  choice('health', [
    'cleared',
    'no-known-condition',
    'cost-risk',
    'cost-finding',
    'waiver-granted',
    'waiver-refused',
    'public-health-failure',
  ]),
  choice('character', [
    'clear-history',
    'other-record',
    'statutory-failure',
    'favourable-decision',
  ]),
  number('prisonSentenceMonths'),
  choice('policeDocuments', [
    'supplied',
    'not-requested',
    'outstanding',
    'waiver-pending',
    'waived',
  ]),
  choice('securityAndForeignPolicy', ['cleared', 'adverse', 'pending']),
  choice('criticalTechnology', [
    'cleared',
    'adverse',
    'pending',
    'sensitive-field',
  ]),
  choice('commonwealthDebt', ['none', 'arranged', 'outstanding']),
  bool('valuesSigned'),
  bool('noOtherApplicantOfValuesAge'),
  bool('childInterestsSatisfied'),
  bool('settlementWithoutUndueDifficulty'),
  bool('permanentSettlementAndSupport'),
  group('integrity', [
    bool('identityEstablished', true),
    bool('accurateDocuments', true),
    nullDate('lastIdentityRefusal', 'refusalNullDateHint'),
    nullDate('lastDocumentRefusal', 'refusalNullDateHint'),
    choice('documentWaiver', ['pending', 'granted']),
  ]),
  bool('returnBan5001'),
  nullDate('removedOn', 'removedNullDateHint'),
  choice('removalWaiver', ['pending', 'granted']),
  group('sponsoredStudy', [
    bool('applies', true),
    number('courseMonths'),
    number('yearsOutsideSinceCeasing'),
    choice('support', ['granted', 'pending', 'none']),
  ]),
  choice('temporaryInsurance', ['maintained', 'not-applicable', 'lapsed']),
];

export { AU_FULL_PATHWAYS, type AuFullPathId };
