import type { PtFullRequest } from '@uk-immigration/engine';
import type { TranslationKey } from '../i18n';
import type { CountryDraft, DraftReadMode } from './country-module';
import { today, validDate } from './questionnaire';
import {
  PT_TARGETS,
  fieldShown,
  portugalSteps,
  type PortugalField,
  type PortugalSection,
  type PtPath,
  type PtTarget,
} from './portugal-fields';

type Evidence<K extends keyof PtFullRequest> = NonNullable<PtFullRequest[K]>;

export interface PortugalDraft
  extends
    CountryDraft,
    Partial<
      Pick<
        PtFullRequest,
        | 'route'
        | 'birthDate'
        | 'permits'
        | 'trips'
        | 'pendingApplication'
        | 'residenceApplied'
        | 'emancipation'
        | 'emancipationFrom'
        | 'permanentOperation'
      >
    > {
  targets: PtTarget[];
  nationality: Evidence<'nationality'>;
  residence: Evidence<'residence'>;
  longTerm: Evidence<'longTerm'>;
  investment: Evidence<'investment'>;
  renewal: Evidence<'renewal'>;
  freeMovement: Evidence<'freeMovement'>;
  partner: Evidence<'partner'>;
}

const evidenceKeys = [
  'nationality',
  'residence',
  'longTerm',
  'investment',
  'renewal',
  'freeMovement',
  'partner',
] as const;

function emptyDraft(
  draft: Pick<
    PortugalDraft,
    'version' | 'step' | 'completed' | 'simulationDate' | 'targets'
  >,
): PortugalDraft {
  return {
    version: draft.version,
    step: draft.step,
    completed: draft.completed,
    simulationDate: draft.simulationDate,
    targets: draft.targets,
    nationality: {},
    residence: {},
    longTerm: {},
    investment: {},
    renewal: {},
    freeMovement: {},
    partner: {},
  };
}

export function createPortugalDraft(): PortugalDraft {
  return emptyDraft({
    version: 1,
    step: 0,
    completed: false,
    simulationDate: today(),
    targets: [],
  });
}

export function portugalStepList(draft: PortugalDraft) {
  return portugalSteps.flatMap(({ title, show }, step) =>
    show(draft) ? [{ step, title }] : [],
  );
}

export function visibleSections(draft: PortugalDraft, step: number) {
  return portugalSteps[step].sections.filter(
    (section) => !section.show || section.show(draft),
  );
}

export const sectionPrefix = (section: Pick<PortugalSection, 'path'>) =>
  ['pt', ...section.path].join('-');

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

export function readPath(
  record: object,
  path: PtPath,
): Record<string, unknown> | undefined {
  let value: unknown = record;
  for (const key of path) value = isRecord(value) ? value[key] : undefined;
  return isRecord(value) ? value : undefined;
}

export function writePath<T extends object>(
  record: T,
  path: PtPath,
  value: object,
): T {
  if (!path.length) return value as T;
  const [key, ...rest] = path;
  const current = (record as Record<string, unknown>)[key];
  return {
    ...record,
    [key]: writePath(isRecord(current) ? current : {}, rest, value),
  };
}

function shownAnswers(
  fields: PortugalField[],
  record: Record<string, unknown>,
): Record<string, unknown> {
  const answers: Record<string, unknown> = {};
  for (const field of fields) {
    const value = record[field.name];
    if (value === undefined || !fieldShown(field, record)) continue;
    answers[field.name] =
      field.type === 'group' && isRecord(value)
        ? shownAnswers(field.fields, value)
        : field.type === 'list' && Array.isArray(value)
          ? value.map((row) =>
              isRecord(row) ? shownAnswers(field.fields, row) : row,
            )
          : value;
  }
  return answers;
}

// The editable draft may keep answers for a route or branch the user later
// left. Assessment and sharing only use the questions that are still shown.
export function activePortugalAnswers(draft: PortugalDraft): PortugalDraft {
  let active = emptyDraft(draft);
  for (const { step } of portugalStepList(draft)) {
    for (const section of visibleSections(draft, step)) {
      const source = readPath(draft, section.path);
      const answers = source && shownAnswers(section.fields, source);
      if (!answers || !Object.keys(answers).length) continue;
      active = writePath(active, section.path, {
        ...readPath(active, section.path),
        ...answers,
      });
    }
  }
  return active;
}

type Errors = Record<string, TranslationKey>;

function order(errors: Errors, id: string, start: unknown, end: unknown) {
  if (
    typeof start === 'string' &&
    typeof end === 'string' &&
    validDate(start) &&
    validDate(end) &&
    end < start
  )
    errors[id] ??= 'pt.error.order';
}

// The same definitions describe the questions and the values a stored or
// shared draft may contain. Unfinished drafts may leave required answers blank.
function checkFields(
  fields: PortugalField[],
  record: Record<string, unknown>,
  prefix: string,
  submitting: boolean,
  errors: Errors,
) {
  for (const field of fields) {
    if (!fieldShown(field, record)) continue;
    const id = `${prefix}-${field.name}`;
    const value = record[field.name];
    if (value === undefined || value === '') {
      if (submitting && field.required)
        errors[id] =
          field.type === 'list' ? 'pt.form.listRequired' : 'pt.form.required';
      continue;
    }
    switch (field.type) {
      case 'list':
        if (!Array.isArray(value)) {
          errors[id] = 'pt.form.required';
          break;
        }
        value.forEach((row, i) => {
          if (!isRecord(row)) {
            errors[id] = 'pt.form.required';
            return;
          }
          checkFields(field.fields, row, `${id}-${i}`, submitting, errors);
          order(errors, `${id}-${i}-to`, row.from, row.to);
          order(errors, `${id}-${i}-returned`, row.departed, row.returned);
        });
        break;
      case 'group':
        if (isRecord(value))
          checkFields(field.fields, value, id, submitting, errors);
        else errors[id] = 'pt.form.required';
        break;
      case 'choice':
        if (!field.options.includes(value as string))
          errors[id] = 'pt.form.required';
        break;
      case 'multi':
        if (
          !Array.isArray(value) ||
          !value.every((item) => field.options.includes(item))
        )
          errors[id] = 'pt.form.required';
        break;
      case 'boolean':
        if (typeof value !== 'boolean') errors[id] = 'pt.form.required';
        break;
      case 'date':
        if (typeof value !== 'string' || !validDate(value))
          errors[id] = 'pt.error.date';
        break;
      default:
        if (typeof value !== 'number' || !Number.isFinite(value) || value < 0)
          errors[id] = 'pt.error.number';
        else if (field.type === 'integer' && !Number.isInteger(value))
          errors[id] = 'pt.error.integer';
        else if (field.type === 'percent' && value > 1)
          errors[id] = 'pt.error.percent';
    }
  }
}

function checkStep(draft: PortugalDraft, step: number, submitting: boolean) {
  const errors: Errors = {};
  for (const section of visibleSections(draft, step))
    checkFields(
      section.fields,
      readPath(draft, section.path) ?? {},
      sectionPrefix(section),
      submitting,
      errors,
    );
  if (step === 0 && submitting && !draft.targets.length)
    errors['pt-targets'] = 'pt.form.routeError';
  const afterSimulation = (id: string, filed?: string) => {
    if (
      filed &&
      validDate(filed) &&
      validDate(draft.simulationDate) &&
      filed > draft.simulationDate
    )
      errors[id] ??= 'pt.error.afterSimulation';
  };
  if (step === 2 && draft.targets.includes('naturalisation'))
    afterSimulation('pt-pendingApplication', draft.pendingApplication);
  if (step === 8)
    afterSimulation(
      'pt-partner-pendingApplication',
      draft.partner.pendingApplication,
    );
  return errors;
}

export function validatePortugalStep(draft: PortugalDraft) {
  return checkStep(draft, draft.step, true);
}

// A saved or shared result must satisfy the same visible steps as a new
// submission. An unsubmitted questionnaire stays editable.
export function restoreStoredPortugalDraft(
  draft: PortugalDraft,
  forResult = false,
): PortugalDraft {
  if (!forResult && !draft.completed) return draft;
  const invalid = portugalStepList(draft).find(
    ({ step }) => Object.keys(checkStep(draft, step, true)).length,
  );
  const completed = !invalid;
  const step = invalid?.step ?? draft.step;
  return draft.completed === completed && draft.step === step
    ? draft
    : { ...draft, completed, step };
}

function validTargets(value: unknown): value is PtTarget[] {
  return (
    Array.isArray(value) &&
    new Set(value).size === value.length &&
    value.every((item) => PT_TARGETS.includes(item))
  );
}

export function decodePortugalDraft(
  value: unknown,
  mode: DraftReadMode = false,
): PortugalDraft | undefined {
  if (
    !isRecord(value) ||
    value.version !== 1 ||
    typeof value.step !== 'number' ||
    !Number.isInteger(value.step) ||
    value.step < 0 ||
    value.step >= portugalSteps.length ||
    typeof value.completed !== 'boolean' ||
    typeof value.simulationDate !== 'string' ||
    !validTargets(value.targets) ||
    evidenceKeys.some(
      (key) => value[key] !== undefined && !isRecord(value[key]),
    )
  )
    return undefined;
  const draft = {
    ...value,
    ...Object.fromEntries(evidenceKeys.map((key) => [key, value[key] ?? {}])),
  } as unknown as PortugalDraft;
  if (
    portugalSteps.some(
      (_, step) => Object.keys(checkStep(draft, step, false)).length,
    )
  )
    return undefined;
  const restored = restoreStoredPortugalDraft(draft, !!mode);
  if (!portugalStepList(restored).some(({ step }) => step === restored.step))
    return undefined;
  if (
    !restored.completed &&
    mode !== 'show-correction' &&
    (mode || draft.completed)
  )
    return undefined;
  return restored;
}
