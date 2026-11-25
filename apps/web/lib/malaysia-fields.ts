import type {
  MyFamilyTie,
  MyMm2hCategory,
  MyPassKind,
  MyPathwayId,
  MyTrip,
} from '@uk-immigration/engine';
import type { myFormZh } from '../i18n/countries/malaysia-form';
import { COUNTRY_ALPHA2 } from './countries';

type Suffix<P extends string> =
  Extract<
    keyof typeof myFormZh,
    `my.${P}.${string}`
  > extends `my.${P}.${infer S}`
    ? S
    : never;
export type MyFieldLabel = Suffix<'field'>;
export type MyHint = Suffix<'hint'>;
export type MySectionId = Suffix<'section'>;

// The engine reads ISO 3166-1 alpha-2 codes, or "stateless".
export const MY_NATIONALITIES = [
  ...new Set(Object.values(COUNTRY_ALPHA2).filter((code) => code !== 'MY')),
  'stateless',
];

export const MY_TARGETS = [
  'pr-wife',
  'pr-husband',
  'pr-child',
  'pr-was',
  'pr-rep',
  'cit-naturalisation',
  'cit-wife',
  'cit-child',
  'rp-family',
  'pass-spouse',
  'pass-mm2h',
  'pass-rpt',
  'pass-pvip',
  'pass-de-rantau',
  'pass-employment',
] as const;
export type MyTarget = (typeof MY_TARGETS)[number];

export const myPathwayByTarget: Record<MyTarget, MyPathwayId> = {
  'pr-wife': 'my.pr.wife',
  'pr-husband': 'my.pr.husband',
  'pr-child': 'my.pr.child',
  'pr-was': 'my.pr.was',
  'pr-rep': 'my.pr.rep-family',
  'cit-naturalisation': 'my.cit.naturalisation',
  'cit-wife': 'my.cit.wife-registration',
  'cit-child': 'my.cit.child-registration',
  'rp-family': 'my.rp.family',
  'pass-spouse': 'my.pass.spouse-ltsvp',
  'pass-mm2h': 'my.pass.mm2h',
  'pass-rpt': 'my.pass.rpt',
  'pass-pvip': 'my.pass.pvip',
  'pass-de-rantau': 'my.pass.de-rantau',
  'pass-employment': 'my.pass.employment',
};

// The first step lists the routes under these headings.
export const myTargetGroups = {
  pr: ['pr-wife', 'pr-husband', 'pr-child', 'pr-was', 'pr-rep'],
  citizenship: ['cit-naturalisation', 'cit-wife', 'cit-child'],
  passes: [
    'rp-family',
    'pass-spouse',
    'pass-mm2h',
    'pass-rpt',
    'pass-pvip',
    'pass-de-rantau',
    'pass-employment',
  ],
} as const satisfies Record<string, readonly MyTarget[]>;

interface When {
  name: string;
  values: readonly unknown[];
}

export type MalaysiaField = {
  name: string;
  label: MyFieldLabel;
  hint?: MyHint;
  required?: boolean;
  // Shown only while a sibling answer in the same record has one of these values.
  when?: When;
  // Shown only when one of these routes is assessed, as only they read it.
  for?: readonly MyTarget[];
  // Also shown, whatever the answers above, while the REP route is assessed
  // and its relation is one of these: that route reads the answer by its own
  // relation, not by the tie.
  rep?: readonly string[];
  // A date that has passed: on or before the simulation date.
  past?: boolean;
} & (
  | { type: 'boolean' | 'date' | 'number' | 'integer' | 'country' }
  | {
      type: 'choice';
      options: readonly string[];
      // Option labels are `my.option.<set>.<value>`.
      set: string;
    }
  | { type: 'list'; fields: MalaysiaField[] }
);

type Extra = Partial<
  Pick<
    MalaysiaField,
    'name' | 'hint' | 'required' | 'when' | 'for' | 'rep' | 'past'
  >
>;

const base = (label: MyFieldLabel, extra: Extra = {}) => ({
  ...extra,
  name: extra.name ?? label,
  label,
});
const bool = (label: MyFieldLabel, extra?: Extra): MalaysiaField => ({
  ...base(label, extra),
  type: 'boolean',
});
const date = (label: MyFieldLabel, extra?: Extra): MalaysiaField => ({
  ...base(label, extra),
  type: 'date',
});
const number = (label: MyFieldLabel, extra?: Extra): MalaysiaField => ({
  ...base(label, extra),
  type: 'number',
});
const integer = (label: MyFieldLabel, extra?: Extra): MalaysiaField => ({
  ...base(label, extra),
  type: 'integer',
});
const choice = (
  label: MyFieldLabel,
  options: readonly string[],
  extra?: Extra & { set?: string },
): MalaysiaField => ({
  ...base(label, extra),
  type: 'choice',
  options,
  set: extra?.set ?? label,
});
const list = (
  label: MyFieldLabel,
  fields: MalaysiaField[],
  extra?: Extra,
): MalaysiaField => ({ ...base(label, extra), type: 'list', fields });
const on = (name: string, ...values: unknown[]): When => ({ name, values });

// Routes that read each kind of answer (see the engine's assessors).
const PR: MyTarget[] = ['pr-wife', 'pr-husband', 'pr-child', 'pr-was'];
const ALL_PR: MyTarget[] = [...PR, 'pr-rep'];
const PASSES_READ: MyTarget[] = [
  ...PR,
  'rp-family',
  'cit-naturalisation',
  'cit-wife',
  'pass-rpt',
];
const SPOUSE_TIES: MyFamilyTie[] = [
  'wife-of-citizen',
  'husband-of-citizen',
  'spouse-of-pr',
];
const CHILD_TIES: MyFamilyTie[] = ['child-of-citizen', 'child-of-pr'];

const passKinds = [
  'ltsvp-spouse',
  'ltsvp-other',
  'employment',
  'student',
  'professional-visit',
  'residence',
  'dependant',
  'mm2h',
  'pvip',
  'plks',
  'unhcr',
  'imm13',
] as const satisfies readonly MyPassKind[];
const tripReasons = [
  'education',
  'health',
  'government-service',
  'other',
] as const satisfies readonly NonNullable<MyTrip['reason']>[];
const ties = [
  'wife-of-citizen',
  'husband-of-citizen',
  'child-of-citizen',
  'parent-of-citizen',
  'spouse-of-pr',
  'child-of-pr',
  'former-citizen',
  'none',
] as const satisfies readonly MyFamilyTie[];
const levels = ['weak', 'moderate', 'good', 'very-good'] as const;
const mm2hCategories = [
  'platinum',
  'gold',
  'silver',
  'sez',
] as const satisfies readonly MyMm2hCategory[];

/** A path from the draft root to the record a section edits. */
export type MyPath = readonly string[];

export interface MalaysiaSection {
  // The basics have no heading; a list is headed by its own legend.
  id: MySectionId | 'basics' | 'passes' | 'trips';
  path: MyPath;
  fields: MalaysiaField[];
}

export interface MalaysiaStep {
  title: Extract<keyof typeof myFormZh, `my.form.step${string}`>;
  sections: MalaysiaSection[];
}

export const malaysiaSteps: MalaysiaStep[] = [
  {
    title: 'my.form.step0',
    sections: [
      {
        id: 'basics',
        path: [],
        fields: [
          date('simulationDate', { required: true, hint: 'simulationDate' }),
          {
            ...base('nationality', {
              hint: 'nationality',
              for: ['pr-was', 'pr-rep', 'pass-spouse', 'pass-de-rantau'],
            }),
            type: 'country',
          },
          date('dateOfBirth', {
            past: true,
            for: [
              'pr-child',
              'pr-rep',
              'rp-family',
              'cit-naturalisation',
              'cit-wife',
              'cit-child',
              'pass-mm2h',
              'pass-de-rantau',
            ],
          }),
          date('passportExpiry', {
            for: [...ALL_PR, 'rp-family', 'pass-de-rantau'],
          }),
        ],
      },
    ],
  },
  {
    title: 'my.form.step1',
    sections: [
      {
        id: 'passes',
        path: [],
        fields: [
          list(
            'passes',
            [
              choice('passKind', passKinds, { name: 'kind', required: true }),
              date('passFrom', { name: 'from', required: true }),
              date('passTo', { name: 'to', required: true }),
            ],
            { required: true, hint: 'passes', for: PASSES_READ },
          ),
        ],
      },
      {
        id: 'trips',
        path: [],
        fields: [
          list(
            'trips',
            [
              date('departed', { required: true }),
              date('returned', { required: true }),
              choice('tripReason', tripReasons, { name: 'reason' }),
            ],
            {
              required: true,
              hint: 'trips',
              for: ['cit-naturalisation', 'cit-wife'],
            },
          ),
        ],
      },
    ],
  },
  {
    title: 'my.form.step2',
    sections: [
      {
        id: 'repRelation',
        path: ['rep'],
        fields: [
          choice('repRelation', ['wife', 'husband', 'child', 'none'], {
            name: 'relation',
            for: ['pr-rep'],
          }),
        ],
      },
      {
        id: 'family',
        path: ['family'],
        fields: [
          choice('tie', ties, {
            hint: 'tie',
            for: [...PR, 'rp-family', 'cit-wife', 'cit-child', 'pass-spouse'],
          }),
          date('marriedOn', {
            when: on('tie', ...SPOUSE_TIES),
            for: ['pr-wife', 'pr-husband'],
            rep: ['wife', 'husband'],
          }),
          choice('marriageRegistration', ['malaysia', 'foreign-only'], {
            when: on('tie', ...SPOUSE_TIES),
            for: ['pr-wife', 'pr-husband', 'cit-wife', 'pass-spouse'],
          }),
          ...(['separated', 'divorced'] as const).map((label) =>
            bool(label, {
              when: on('tie', ...SPOUSE_TIES),
              for: [
                'pr-wife',
                'pr-husband',
                'rp-family',
                'cit-wife',
                'pass-spouse',
              ],
              rep: ['wife', 'husband'],
            }),
          ),
          choice('childRelation', ['biological', 'step', 'adopted'], {
            when: on('tie', ...CHILD_TIES),
            for: ['pr-child', 'rp-family'],
            rep: ['child'],
          }),
        ],
      },
      {
        id: 'sponsors',
        path: [],
        fields: [
          bool('citizenSponsor', {
            hint: 'citizenSponsor',
            for: ['pr-wife', 'pr-husband', 'pr-child', 'pass-spouse'],
          }),
          bool('residencePassSponsor', {
            hint: 'residencePassSponsor',
            for: ['rp-family'],
          }),
        ],
      },
    ],
  },
  {
    title: 'my.form.step3',
    sections: [
      {
        id: 'records',
        path: [],
        fields: [
          choice('immigrationRecord', ['clear', 'listed', 'other-adverse'], {
            hint: 'sensitive',
            for: ALL_PR,
          }),
          choice('criminalRecord', ['none', 'convicted'], {
            hint: 'sensitive',
            for: [...ALL_PR, 'cit-naturalisation', 'cit-wife'],
          }),
          bool('prRefused', { hint: 'prRefused', for: PR }),
          date('prRefusedOn', {
            when: on('prRefused', true),
            for: PR,
            required: true,
            past: true,
          }),
          integer('citizenReferees', {
            hint: 'citizenReferees',
            for: ['pr-wife', 'pr-husband', 'pr-was'],
          }),
        ],
      },
      {
        id: 'evidence',
        path: ['evidence'],
        fields: (
          ['applicantIncome', 'sponsorIncome', 'malaysianTaxReturns'] as const
        ).map((label) => bool(label, { for: [...PR, 'pass-spouse'] })),
      },
      {
        id: 'language',
        path: ['language'],
        fields: [
          choice('malay', levels, {
            set: 'level',
            hint: 'selfRating',
            for: [...PR, 'cit-naturalisation'],
          }),
          choice('english', levels, {
            set: 'level',
            hint: 'selfRating',
            for: PR,
          }),
        ],
      },
    ],
  },
  {
    title: 'my.form.step4',
    sections: [
      {
        id: 'was',
        path: ['was'],
        fields: (
          [
            'regulatorRecognition',
            'criticalOccupation',
            'wasCitizenSponsor',
          ] as const
        ).map((label) =>
          bool(label, {
            name: label === 'wasCitizenSponsor' ? 'citizenSponsor' : label,
            for: ['pr-was'],
          }),
        ),
      },
      {
        id: 'rep',
        path: ['rep'],
        fields: [
          bool('participantHasSatk', { for: ['pr-rep'] }),
          date('approvalLetterValidUntil', { for: ['pr-rep'] }),
          bool('marriedBeforeRepApplication', {
            when: on('relation', 'wife', 'husband'),
            for: ['pr-rep'],
          }),
          bool('participantSponsor', { for: ['pr-rep'] }),
          integer('repReferees', {
            name: 'referees',
            hint: 'repReferees',
            for: ['pr-rep'],
          }),
        ],
      },
    ],
  },
  {
    title: 'my.form.step5',
    sections: [
      {
        id: 'citizenship',
        path: ['citizenship'],
        fields: [
          bool('prHeld', { for: ['cit-naturalisation', 'cit-wife'] }),
          date('permanentResidentSince', {
            hint: 'permanentResidentSince',
            when: on('prHeld', true),
            for: ['cit-naturalisation', 'cit-wife'],
            required: true,
          }),
          choice('intendsToResidePermanently', ['yes', 'no', 'undecided'], {
            for: ['cit-naturalisation', 'cit-wife'],
          }),
          integer('qualifyingReferees', {
            hint: 'qualifyingReferees',
            for: ['cit-naturalisation'],
          }),
          choice('renounceOtherNationality', ['yes', 'no', 'unsure'], {
            for: ['cit-naturalisation', 'cit-wife', 'cit-child'],
          }),
          ...(
            [
              'completeTravelRecords',
              'taxReturnsFiveYears',
              'inFederationOnMerdekaDay',
            ] as const
          ).map((label) => bool(label, { for: ['cit-naturalisation'] })),
        ],
      },
    ],
  },
  {
    title: 'my.form.step6',
    sections: [
      {
        id: 'mm2h',
        path: ['mm2h'],
        fields: [
          choice('mm2hCategory', mm2hCategories, { name: 'category' }),
          bool('fromCountryWithDiplomaticRelations'),
          bool('viaLicensedOperator'),
          number('fixedDepositUsd'),
          number('propertyValueRm', { hint: 'propertyValueRm' }),
          integer('daysPerYear'),
          bool('goodConductCertificates'),
          bool('healthInsurance'),
          integer('mm2hDependants', { name: 'dependants' }),
          bool('needsToWork'),
        ].map((field) => ({ ...field, for: ['pass-mm2h'] })),
      },
      {
        id: 'work',
        path: ['work'],
        fields: [
          number('basicMonthlySalaryRm', {
            for: ['pass-rpt', 'pass-employment'],
          }),
        ],
      },
      {
        id: 'rpt',
        path: ['rpt'],
        fields: [
          integer('taxYearsPaid'),
          bool('qualification'),
          number('totalExperienceYears'),
        ].map((field) => ({ ...field, for: ['pass-rpt'] })),
      },
      {
        id: 'deRantau',
        path: ['deRantau'],
        fields: [
          choice('talent', ['tech', 'non-tech']),
          number('annualIncomeUsd'),
          choice('workType', ['remote-employee', 'freelancer']),
          bool('employerRegisteredInMalaysia', {
            when: on('workType', 'remote-employee'),
          }),
          bool('foreignClients', { when: on('workType', 'freelancer') }),
          date('contractStart', { hint: 'contractStart' }),
          integer('deRantauDependants', { name: 'dependants' }),
        ].map((field) => ({ ...field, for: ['pass-de-rantau'] })),
      },
    ],
  },
];

/** The routes assessed and the REP relation, which decide what is shown. */
export interface MyScope {
  targets: readonly MyTarget[];
  repRelation?: unknown;
}
export const scopeOf = (draft: {
  targets: readonly MyTarget[];
  rep?: { relation?: unknown };
}): MyScope => ({ targets: draft.targets, repRelation: draft.rep?.relation });

const assessed = (field: MalaysiaField, targets: readonly MyTarget[]) =>
  !field.for ||
  field.for.some((target) => targets.includes(target)) ||
  (!!field.rep && targets.includes('pr-rep'));

export function fieldShown(
  field: MalaysiaField,
  record: object,
  { targets, repRelation }: MyScope,
) {
  const byRep =
    !!field.rep &&
    targets.includes('pr-rep') &&
    field.rep.includes(repRelation as string);
  const byTie =
    (!field.for || field.for.some((target) => targets.includes(target))) &&
    (!field.when ||
      field.when.values.includes(
        (record as Record<string, unknown>)[field.when.name],
      ));
  return byRep || byTie;
}

export const sectionShown = (
  section: MalaysiaSection,
  targets: readonly MyTarget[],
) => section.fields.some((field) => assessed(field, targets));
