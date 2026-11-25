import {
  IRELAND_FULL_PATHWAY_TITLES,
  type IePermission,
  type IeTrip,
  type IrelandFullPathwayId,
  type IrelandFullRequest,
  type IrelandRegistration,
} from '@uk-immigration/engine';
import type { TranslationKey } from '../i18n';
import type { CountryDraft, DraftReadMode } from './country-module';
import {
  FAMILY_PATHS,
  NATURALISATION_PATHS,
  RESIDENCE_PATHS,
  TREATY_PATHS,
  WORK_PATHS,
  topFields,
  type IrelandField,
  type IrelandFields,
  type IrelandStages,
} from './ireland-fields';
import { today, validDate } from './questionnaire';

export interface IrelandDraft
  extends
    CountryDraft,
    IrelandStages,
    Omit<
      IrelandFullRequest,
      'locale' | 'pathways' | 'permissions' | 'trips' | 'simulationDate'
    > {
  pathways: IrelandFullPathwayId[];
  /** Undefined until answered; an empty list confirms there are none. */
  permissions?: IePermission[];
  trips?: IeTrip[];
}

export const IRELAND_PATHWAYS = Object.keys(
  IRELAND_FULL_PATHWAY_TITLES,
) as IrelandFullPathwayId[];

export function createIrelandDraft(): IrelandDraft {
  return {
    version: 1,
    step: 0,
    completed: false,
    simulationDate: today(),
    pathways: [],
  };
}

type TopName = keyof typeof topFields;
const steps: {
  title: TranslationKey;
  fields: TopName[];
  paths?: readonly IrelandFullPathwayId[];
}[] = [
  {
    title: 'ie.form.step0',
    fields: ['simulationDate', 'dateOfBirth', 'birthplace', 'currentLocation'],
  },
  {
    title: 'ie.form.step1',
    fields: ['permissions', 'trips', 'registration'],
  },
  {
    title: 'ie.form.step2',
    fields: ['marriedOn', 'citizenship'],
    paths: NATURALISATION_PATHS,
  },
  {
    title: 'ie.form.step3',
    fields: ['workStage', 'employmentStart', 'work'],
    paths: WORK_PATHS,
  },
  { title: 'ie.form.step4', fields: ['family'], paths: FAMILY_PATHS },
  {
    title: 'ie.form.step5',
    fields: ['stamp5Stage', 'stamp5', 'ltrStage', 'ltr'],
    paths: RESIDENCE_PATHS,
  },
  {
    title: 'ie.form.step6',
    fields: ['euStage', 'eu', 'waStage', 'wa'],
    paths: TREATY_PATHS,
  },
];

const selected = (
  paths: readonly IrelandFullPathwayId[] | undefined,
  draft: Pick<IrelandDraft, 'pathways'>,
) => !paths || paths.some((id) => draft.pathways.includes(id));

export function irelandSteps(draft: IrelandDraft) {
  return steps.flatMap(({ title, paths }, step) =>
    selected(paths, draft) ? [{ step, title }] : [],
  );
}

export function stepFields(step: number) {
  return steps[step].fields;
}

export function shownField(
  field: IrelandField,
  draft: Pick<IrelandDraft, 'pathways'>,
) {
  return selected(field.paths, draft);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

// Remove answers to questions the selected pathways do not show. EU residence
// does not use the Withdrawal Agreement scope.
function prune(
  fields: IrelandFields,
  record: Record<string, unknown>,
  draft: IrelandDraft,
) {
  const next: Record<string, unknown> = {};
  for (const [name, value] of Object.entries(record)) {
    const field = fields[name];
    if (!field || !shownField(field, draft)) continue;
    if (field.type === 'group' && isRecord(value))
      next[name] = prune(field.fields, value, draft);
    else if (field.type === 'list' && Array.isArray(value))
      next[name] = value.map((row) =>
        isRecord(row) ? prune(field.fields, row, draft) : row,
      );
    else next[name] = value;
  }
  return next;
}

export function activeIrelandAnswers(draft: IrelandDraft): IrelandDraft {
  const visible = new Set(irelandSteps(draft).map(({ step }) => step));
  const answers: Record<string, unknown> = {};
  for (const step of visible)
    for (const name of steps[step].fields)
      answers[name] = (draft as unknown as Record<string, unknown>)[name];
  const active = prune(topFields, answers, draft) as Partial<IrelandDraft>;
  if (active.eu) {
    const eu = { ...active.eu };
    delete eu.wa;
    active.eu = eu;
  }
  return {
    version: draft.version,
    step: draft.step,
    completed: draft.completed,
    pathways: draft.pathways,
    ...active,
    simulationDate: draft.simulationDate,
  };
}

/**
 * The engine request for one pathway, with only the answers that pathway's
 * questions show: its result does not depend on what else is selected.
 */
export function irelandRequest(
  draft: IrelandDraft,
  pathway: IrelandFullPathwayId,
): IrelandFullRequest {
  const active = activeIrelandAnswers({ ...draft, pathways: [pathway] });
  const request: Partial<IrelandDraft> = { ...active };
  for (const key of [
    'version',
    'step',
    'completed',
    'workStage',
    'stamp5Stage',
    'ltrStage',
    'euStage',
    'waStage',
  ] as const)
    delete request[key];
  const stage = registrationStage(active, pathway);
  return {
    ...(request as Omit<IrelandDraft, keyof CountryDraft>),
    simulationDate: active.simulationDate,
    pathways: [pathway],
    permissions: active.permissions ?? [],
    trips: active.trips ?? [],
    registration: stage
      ? { ...active.registration, stage }
      : active.registration,
  };
}

// The engine's registration stage comes from the question on the pathway's
// own step. A Stamp 5 or LTR application is marked 'first' so that other
// answers (renewWithPassport, maintenance.renewal) do not turn it into a renewal.
function registrationStage(
  draft: IrelandDraft,
  pathway: IrelandFullPathwayId,
): IrelandRegistration['stage'] {
  switch (pathway) {
    case 'IE-STAMP4-21':
    case 'IE-STAMP4-57':
      return draft.workStage;
    case 'IE-STAMP5':
      return draft.stamp5Stage ?? 'first';
    case 'IE-LTR-PRINCIPAL':
    case 'IE-LTR-FAMILY':
      return draft.ltrStage ?? 'first';
    case 'IE-EU-PERMANENT':
      return draft.euStage;
    case 'IE-WA-PERMANENT':
      return draft.waStage;
  }
}

type Errors = Record<string, TranslationKey>;
const datetime = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}Z$/;
// Later dates in a record must not come before the earlier ones.
const ordered = [
  ['from', 'to'],
  ['departed', 'returned'],
  ['leftOn', 'returnedOn'],
  ['offerFrom', 'offerEnd'],
] as const;

const number = (value: unknown, integer: boolean) =>
  typeof value === 'number' &&
  Number.isFinite(value) &&
  (!integer || Number.isInteger(value));

// The same definitions check stored values (type only) and submitted steps
// (required answers and ranges too).
function checkFields(
  fields: IrelandFields,
  record: Record<string, unknown>,
  prefix: string,
  submit: boolean,
  errors: Errors,
  draft: IrelandDraft,
) {
  for (const [name, field] of Object.entries(fields)) {
    if (submit && !shownField(field, draft)) continue;
    const id = `${prefix}-${name}`;
    const value = record[name];
    if (value === undefined || value === '') {
      if (submit && field.required)
        errors[id] =
          field.type === 'list' ? 'ie.error.list' : 'ie.error.required';
      continue;
    }
    const range = (ok: boolean) => {
      if (submit && !ok) errors[id] = 'ie.error.number';
    };
    switch (field.type) {
      case 'boolean':
        if (typeof value !== 'boolean') errors[id] = 'ie.error.required';
        break;
      case 'choice':
        if (!field.options.includes(value as string))
          errors[id] = 'ie.error.required';
        break;
      case 'multi':
        if (
          !Array.isArray(value) ||
          new Set(value).size !== value.length ||
          value.some((item) => !field.options.includes(item))
        )
          errors[id] = 'ie.error.required';
        break;
      case 'date':
        if (typeof value !== 'string' || !validDate(value))
          errors[id] = 'ie.error.date';
        break;
      case 'datetime':
        if (
          typeof value !== 'string' ||
          !datetime.test(value) ||
          Number.isNaN(Date.parse(value))
        )
          errors[id] = 'ie.error.date';
        break;
      case 'number':
      case 'integer':
        if (!number(value, false)) errors[id] = 'ie.error.number';
        else if (
          submit &&
          field.max !== undefined &&
          (value as number) > field.max
        )
          errors[id] = 'ie.error.fraction';
        else
          range(
            (value as number) >= 0 && number(value, field.type === 'integer'),
          );
        break;
      case 'dates':
      case 'numbers':
        if (!Array.isArray(value)) {
          errors[id] = 'ie.error.required';
          break;
        }
        value.forEach((item, i) => {
          const at = `${id}-${i}`;
          if (item === '') {
            // A row just added has no answer yet.
            if (submit) errors[at] = 'ie.error.required';
          } else if (field.type === 'dates') {
            if (typeof item !== 'string' || !validDate(item))
              errors[at] = 'ie.error.date';
          } else if (!number(item, false) || (submit && item < 0))
            errors[at] = 'ie.error.number';
        });
        break;
      case 'group':
        if (isRecord(value))
          checkFields(field.fields, value, id, submit, errors, draft);
        else errors[id] = 'ie.error.required';
        break;
      case 'list':
        if (!Array.isArray(value)) {
          errors[id] = 'ie.error.list';
          break;
        }
        value.forEach((row, i) => {
          if (isRecord(row))
            checkFields(field.fields, row, `${id}-${i}`, submit, errors, draft);
          else errors[id] = 'ie.error.list';
        });
        break;
    }
  }
  for (const [first, last] of ordered) {
    const from = record[first];
    const to = record[last];
    if (
      typeof from === 'string' &&
      typeof to === 'string' &&
      validDate(from) &&
      validDate(to) &&
      to < from
    )
      errors[`${prefix}-${last}`] = 'ie.error.order';
  }
}

function checkStep(draft: IrelandDraft, step: number, submit: boolean) {
  const errors: Errors = {};
  const fields = Object.fromEntries(
    steps[step].fields.map((name) => [name, topFields[name]]),
  );
  checkFields(
    fields,
    draft as unknown as Record<string, unknown>,
    'ie',
    submit,
    errors,
    draft,
  );
  if (step === 0 && submit && !draft.pathways.length)
    errors['ie-pathways'] = 'ie.error.pathways';
  return errors;
}

export function validateIrelandStep(draft: IrelandDraft) {
  return checkStep(draft, draft.step, true);
}

// A saved or shared result must pass the same visible steps as a new submission.
export function restoreStoredIrelandDraft(
  draft: IrelandDraft,
  forResult = false,
): IrelandDraft {
  if (!forResult && !draft.completed) return draft;
  const invalid = irelandSteps(draft).find(
    ({ step }) => Object.keys(checkStep(draft, step, true)).length,
  );
  const completed = !invalid;
  const step = invalid?.step ?? draft.step;
  return draft.completed === completed && draft.step === step
    ? draft
    : { ...draft, completed, step };
}

export function decodeIrelandDraft(
  value: unknown,
  mode: DraftReadMode = false,
): IrelandDraft | undefined {
  if (
    !isRecord(value) ||
    value.version !== 1 ||
    typeof value.step !== 'number' ||
    !Number.isInteger(value.step) ||
    value.step < 0 ||
    value.step >= steps.length ||
    typeof value.completed !== 'boolean' ||
    typeof value.simulationDate !== 'string' ||
    !Array.isArray(value.pathways) ||
    new Set(value.pathways).size !== value.pathways.length ||
    !value.pathways.every((id) => IRELAND_PATHWAYS.includes(id))
  )
    return undefined;
  const draft = value as unknown as IrelandDraft;
  if (
    steps.some((_, step) => Object.keys(checkStep(draft, step, false)).length)
  )
    return undefined;
  const restored = restoreStoredIrelandDraft(draft, !!mode);
  if (!irelandSteps(restored).some(({ step }) => step === restored.step))
    return undefined;
  if (
    !restored.completed &&
    mode !== 'show-correction' &&
    (mode || draft.completed)
  )
    return undefined;
  return restored;
}
