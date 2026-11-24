import type { Locale, NzFullRequest } from '@uk-immigration/engine';
import type { TranslationKey } from '../i18n';
import type { CountryDraft } from './country-module';
import { today, validDate } from './questionnaire';
import {
  citizenshipFields,
  dependantFields,
  englishFields,
  englishOtherFields,
  evidenceFields,
  feeBand,
  feeFields,
  filingFields,
  greenFields,
  healthFields,
  historyFields,
  investorFields,
  jobFields,
  lodgementFields,
  parentFields,
  partnerFields,
  prvFields,
  religiousFields,
  residentRecordFields,
  sectorFields,
  smcFields,
  travelFields,
  type NzField,
} from './new-zealand-fields';

export const nzGoalGroups = {
  resident: ['travel', 'prv', 'citizenship'],
  skilled: ['smc', 'green', 'sector'],
  family: ['partner', 'parent', 'investor', 'religious'],
} as const;
export type NzGoal = (typeof nzGoalGroups)[keyof typeof nzGoalGroups][number];
export const nzGoals: NzGoal[] = Object.values(nzGoalGroups).flat();
export const nzGoalPathways: Record<NzGoal, string> = {
  travel: 'NZ-TRAVEL',
  prv: 'NZ-PRV',
  citizenship: 'NZ-CITIZENSHIP',
  smc: 'NZ-SMC',
  green: 'NZ-GREEN-LIST',
  sector: 'NZ-SECTOR',
  partner: 'NZ-P7',
  parent: 'NZ-P8',
  investor: 'NZ-P9',
  religious: 'NZ-P10',
};

export type NzAnswers = Omit<NzFullRequest, 'simulationDate' | 'locale'>;
export interface NzDraft extends CountryDraft {
  version: 1;
  goals: NzGoal[];
  answers: NzAnswers;
}

type Record_ = Record<string, unknown>;
type Errors = Record<string, TranslationKey>;
export interface NzSection {
  path: string[];
  /** Shown only for these goals; omitted for every selection. */
  goals?: readonly NzGoal[];
  fields: NzField[];
}

const residenceGoals: NzGoal[] = [
  ...nzGoalGroups.skilled,
  ...nzGoalGroups.family,
];
// Citizenship is not a visa application: it reads only the fee from the
// filing step and none of the health, character or family answers.
const visaGoals = nzGoals.filter((goal) => goal !== 'citizenship');
const dependants: NzField = {
  name: 'dependants',
  label: 'dependants',
  type: 'list',
  fields: dependantFields,
};

// Steps without goals apply to every selection.
export const nzStepDefinitions: {
  key: string;
  goals?: readonly NzGoal[];
  sections: NzSection[];
}[] = [
  {
    key: 'basics',
    sections: [
      {
        path: [],
        fields: [{ name: 'dateOfBirth', label: 'dateOfBirth', type: 'date' }],
      },
    ],
  },
  {
    key: 'history',
    goals: nzGoalGroups.resident,
    sections: [
      { path: [], fields: historyFields },
      { path: ['resident', 'travel'], fields: residentRecordFields },
    ],
  },
  // The resident pathways share one record, so each reads these answers.
  {
    key: 'travel',
    goals: nzGoalGroups.resident,
    sections: [{ path: ['resident', 'travel'], fields: travelFields }],
  },
  {
    key: 'prv',
    goals: nzGoalGroups.resident,
    sections: [{ path: ['resident', 'prv'], fields: prvFields }],
  },
  {
    key: 'citizenship',
    goals: ['citizenship'],
    sections: [
      { path: ['resident', 'citizenship'], fields: citizenshipFields },
    ],
  },
  {
    key: 'job',
    goals: nzGoalGroups.skilled,
    sections: [
      { path: ['skilled', 'job'], fields: jobFields },
      { path: ['skilled'], fields: [feeBand] },
    ],
  },
  {
    key: 'smc',
    goals: ['smc'],
    sections: [{ path: ['skilled', 'smc'], fields: smcFields }],
  },
  {
    key: 'green',
    goals: ['green'],
    sections: [{ path: ['skilled', 'green'], fields: greenFields }],
  },
  {
    key: 'sector',
    goals: ['sector'],
    sections: [{ path: ['skilled', 'sector'], fields: sectorFields }],
  },
  {
    key: 'partner',
    goals: ['partner'],
    sections: [{ path: ['family', 'partner'], fields: partnerFields }],
  },
  {
    key: 'parent',
    goals: ['parent'],
    sections: [{ path: ['family', 'parent'], fields: parentFields }],
  },
  {
    key: 'investor',
    goals: ['investor'],
    sections: [{ path: ['family', 'investment'], fields: investorFields }],
  },
  {
    key: 'religious',
    goals: ['religious'],
    sections: [{ path: ['family', 'religious'], fields: religiousFields }],
  },
  {
    key: 'filing',
    sections: [
      {
        path: ['common', 'residenceFiling'],
        goals: visaGoals,
        fields: filingFields,
      },
      { path: ['common'], goals: visaGoals, fields: lodgementFields },
      { path: ['common'], fields: feeFields },
    ],
  },
  {
    key: 'health',
    goals: visaGoals,
    sections: [
      { path: ['common'], fields: healthFields },
      { path: ['common', 'evidence'], fields: evidenceFields },
    ],
  },
  {
    key: 'english',
    goals: residenceGoals,
    sections: [
      { path: ['common', 'english'], fields: englishFields },
      { path: ['common'], fields: englishOtherFields },
    ],
  },
  {
    key: 'family',
    goals: visaGoals,
    sections: [{ path: ['common'], fields: [dependants] }],
  },
];

export const nzSectionShown = (
  { goals }: NzSection,
  draft: Pick<NzDraft, 'goals'>,
) => !goals || goals.some((goal) => draft.goals.includes(goal));

export function nzSteps(draft: Pick<NzDraft, 'goals'>) {
  return nzStepDefinitions
    .map(({ key, goals }, step) => ({
      step,
      title: `nz.step.${key}` as TranslationKey,
      goals,
    }))
    .filter(
      ({ goals }) => !goals || goals.some((goal) => draft.goals.includes(goal)),
    )
    .map(({ step, title }) => ({ step, title }));
}

export function createNzDraft(): NzDraft {
  return {
    version: 1,
    step: 0,
    completed: false,
    simulationDate: today(),
    goals: [],
    answers: {},
  };
}

const isRecord = (value: unknown): value is Record_ =>
  value !== null && typeof value === 'object' && !Array.isArray(value);

export function recordAt(answers: object, path: string[]): Record_ {
  let record = answers as Record_;
  for (const key of path) record = isRecord(record[key]) ? record[key] : {};
  return record;
}

export function withRecordAt<T extends object>(
  answers: T,
  path: string[],
  record: Record_,
): T {
  if (!path.length) return record as T;
  const [key, ...rest] = path;
  const current = answers as Record_;
  return {
    ...current,
    [key]: withRecordAt(recordAt(current, [key]), rest, record),
  } as T;
}

// One tree of every question, built from the sections at their paths.
function answerTree(): NzField[] {
  const root: NzField[] = [];
  for (const { sections } of nzStepDefinitions) {
    for (const { path, fields } of sections) {
      let level = root;
      for (const key of path) {
        let node = level.find((field) => field.name === key);
        if (!node) {
          node = { name: key, label: key, type: 'group', fields: [] };
          level.push(node);
        }
        level = (node as { fields: NzField[] }).fields;
      }
      level.push(...fields);
    }
  }
  return root;
}
const tree = answerTree();

const visible = (field: NzField, record: Record_) =>
  !field.when || field.when(record);

// Drop the answers a change hides, so hidden questions cannot block a step.
export function withoutHidden(fields: NzField[], record: Record_): Record_ {
  const kept = { ...record };
  for (const field of fields)
    if (!visible(field, kept)) delete kept[field.name];
  return kept;
}

// Keep only the questions shown for the current answers; drop empty groups.
function prune(fields: NzField[], record: Record_): Record_ {
  const kept: Record_ = {};
  for (const field of fields) {
    const value = record[field.name];
    if (value === undefined || !visible(field, record)) continue;
    if (field.type === 'group') {
      const inner = prune(field.fields, value as Record_);
      if (Object.keys(inner).length) kept[field.name] = inner;
    } else if (field.type === 'list') {
      kept[field.name] = (value as Record_[]).map((row) =>
        prune(field.fields, row),
      );
    } else kept[field.name] = value;
  }
  return kept;
}

// Answers for steps the selected goals hide are not assessed or shared.
export function activeNzAnswers(draft: NzDraft): NzDraft {
  const shown = new Set(nzSteps(draft).map(({ step }) => step));
  let answers = draft.answers;
  nzStepDefinitions.forEach(({ sections }, step) => {
    for (const section of sections) {
      if (shown.has(step) && nzSectionShown(section, draft)) continue;
      const { path, fields } = section;
      const record = { ...recordAt(answers, path) };
      for (const field of fields) delete record[field.name];
      answers = withRecordAt(answers, path, record);
    }
  });
  return { ...draft, answers: prune(tree, answers as Record_) as NzAnswers };
}

export function nzRequest(draft: NzDraft, locale: Locale): NzFullRequest {
  return {
    ...activeNzAnswers(draft).answers,
    simulationDate: draft.simulationDate,
    locale,
  };
}

const isNumber = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value);

// Structure checks guard stored and shared drafts; validation adds the
// questionnaire's required answers, dates and ranges.
function checkFields(
  fields: NzField[],
  record: Record_,
  prefix: string,
  errors: Errors,
  validate: boolean,
  // An optional group needs its required answers once a shown one is given.
  enforceRequired = fields.some(
    (field) => visible(field, record) && record[field.name] !== undefined,
  ),
) {
  for (const field of fields) {
    if (!visible(field, record)) continue;
    const id = `${prefix}-${field.name}`;
    const value = record[field.name];
    if (value === undefined) {
      if (validate && enforceRequired && field.required)
        errors[id] = 'nz.form.required';
      continue;
    }
    const invalid = (key: TranslationKey = 'nz.form.required') => {
      errors[id] = key;
    };
    const date = (text: unknown) =>
      typeof text !== 'string'
        ? invalid()
        : validate && !validDate(text) && invalid('nz.error.date');
    const amount = (number: unknown) =>
      !isNumber(number)
        ? invalid('nz.form.numberError')
        : validate && number < 0 && invalid('nz.form.numberError');
    switch (field.type) {
      case 'group':
        if (!isRecord(value)) invalid();
        else checkFields(field.fields, value, id, errors, validate);
        break;
      case 'list':
        if (!Array.isArray(value)) invalid();
        else
          value.forEach((row, i) => {
            if (!isRecord(row)) return invalid();
            checkFields(
              field.fields,
              row,
              `${id}-${i}`,
              errors,
              validate,
              true,
            );
            if (
              validate &&
              typeof row.departed === 'string' &&
              typeof row.returned === 'string' &&
              row.returned < row.departed
            )
              errors[`${id}-${i}-returned`] = 'nz.error.order';
          });
        break;
      case 'boolean':
        if (typeof value !== 'boolean') invalid();
        break;
      case 'text':
        if (typeof value !== 'string') invalid();
        break;
      case 'date':
        date(value);
        break;
      case 'number':
        amount(value);
        break;
      case 'date-or':
        if (value === field.alternative) break;
        if (!field.wrap) date(value);
        else if (!isRecord(value)) invalid();
        else date(value[field.wrap]);
        break;
      case 'number-or':
        if (value !== field.alternative) amount(value);
        break;
      case 'choice':
        if (!field.options.includes(value as string)) invalid();
        break;
      case 'multi':
        if (
          !Array.isArray(value) ||
          value.some((item) => !field.options.includes(item))
        )
          invalid();
        break;
      case 'numbers':
      case 'tuple': {
        const items = Array.isArray(value) ? value : [];
        const entry = (item: unknown) =>
          item === null ||
          (field.type === 'tuple' && field.options
            ? field.options.includes(item as string)
            : isNumber(item));
        if (
          !Array.isArray(value) ||
          (field.type === 'tuple' && value.length !== 4) ||
          !items.every(entry)
        )
          invalid();
        else if (validate && field.required && !items.length) invalid();
        else if (validate && items.includes(null))
          invalid(
            field.type === 'tuple'
              ? 'nz.form.tupleError'
              : 'nz.form.numberError',
          );
        else if (validate && items.some((item) => isNumber(item) && item < 0))
          invalid('nz.form.numberError');
        break;
      }
    }
  }
}

// Steps ask some facts twice for different pathways. The engine prefers one
// answer silently, so a later answer must agree with the earlier one.
function conflicts(draft: NzDraft, key: string, errors: Errors) {
  const { answers } = activeNzAnswers(draft);
  const inNz = answers.resident?.travel?.currentlyInNz;
  const religiousInNz = answers.family?.religious?.inNz;
  const filing = answers.common?.residenceFiling;
  if (
    key === 'religious' &&
    inNz !== undefined &&
    religiousInNz !== undefined &&
    inNz !== religiousInNz
  )
    errors['nz-family-religious-inNz'] ??= 'nz.error.inNzConflict';
  if (key !== 'filing') return;
  const overseas = filing?.filingFromOverseas;
  if (overseas !== undefined && [inNz, religiousInNz].includes(overseas))
    errors['nz-common-residenceFiling-filingFromOverseas'] ??=
      'nz.error.overseasConflict';
  const liability = answers.resident?.prv?.deportationLiability;
  const bar = filing?.statutoryBar;
  if (
    (liability === 'liable' &&
      bar !== undefined &&
      bar !== 'liable-for-deportation') ||
    (liability === 'none' && bar === 'liable-for-deportation')
  )
    errors['nz-common-residenceFiling-statutoryBar'] ??=
      'nz.error.deportationConflict';
}

function checkStep(draft: NzDraft, step: number, validate: boolean) {
  const errors: Errors = {};
  if (step === 0 && validate) {
    if (!validDate(draft.simulationDate))
      errors['nz-simulationDate'] = 'nz.error.date';
    if (!draft.goals.length) errors['nz-goals'] = 'nz.form.goalError';
  }
  for (const section of nzStepDefinitions[step].sections) {
    if (!nzSectionShown(section, draft)) continue;
    const { path, fields } = section;
    checkFields(
      fields,
      recordAt(draft.answers, path),
      ['nz', ...path].join('-'),
      errors,
      validate,
      path.length > 0 ? undefined : true,
    );
  }
  const { answers } = draft;
  const { key } = nzStepDefinitions[step];
  if (validate) conflicts(draft, key, errors);
  if (validate && key === 'history') {
    if (
      answers.firstArrival &&
      answers.dateOfBirth &&
      answers.firstArrival < answers.dateOfBirth
    )
      errors['nz-firstArrival'] ??= 'nz.error.beforeBirth';
    if (
      answers.permanentResidentVisa &&
      answers.residentVisa?.granted &&
      answers.permanentResidentVisa < answers.residentVisa.granted
    )
      errors['nz-permanentResidentVisa'] ??= 'nz.error.prvOrder';
  }
  return errors;
}

export function validateNzStep(draft: NzDraft) {
  return checkStep(draft, draft.step, true);
}

export function decodeNzDraft(value: unknown): NzDraft | undefined {
  if (
    !isRecord(value) ||
    value.version !== 1 ||
    !Number.isInteger(value.step) ||
    (value.step as number) < 0 ||
    (value.step as number) >= nzStepDefinitions.length ||
    typeof value.completed !== 'boolean' ||
    typeof value.simulationDate !== 'string' ||
    !Array.isArray(value.goals) ||
    !value.goals.every((goal) => nzGoals.includes(goal)) ||
    !isRecord(value.answers)
  )
    return undefined;
  const errors: Errors = {};
  checkFields(tree, value.answers, 'nz', errors, false, false);
  if (Object.keys(errors).length) return undefined;
  const draft: NzDraft = {
    version: 1,
    step: value.step as number,
    completed: value.completed,
    simulationDate: value.simulationDate,
    goals: nzGoals.filter((goal) => (value.goals as unknown[]).includes(goal)),
    answers: prune(tree, value.answers) as NzAnswers,
  };
  // A finished draft must pass every step it shows.
  if (
    draft.completed &&
    nzSteps(draft).some(
      ({ step }) => Object.keys(checkStep(draft, step, true)).length,
    )
  )
    return undefined;
  return draft;
}
