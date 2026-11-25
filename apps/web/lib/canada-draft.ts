import type {
  CaFullPathwayId,
  CaFullRequest,
  Locale,
} from '@uk-immigration/engine';
import type { TranslationKey } from '../i18n';
import type { CountryDraft } from './country-module';
import {
  canadaGoals,
  canadaSteps,
  canadaStepsFor,
  initialPrGoals,
  visibleSections,
  type CanadaDraftShape,
  type CanadaField,
} from './canada-fields';
import { today, validDate } from './questionnaire';

export interface CanadaDraft extends CountryDraft, CanadaDraftShape {}
type Errors = Record<string, TranslationKey>;
type Answers = Record<string, unknown>;

export const CANADA_DRAFT_VERSION = 1;

export function createCanadaDraft(): CanadaDraft {
  return {
    version: CANADA_DRAFT_VERSION,
    step: 0,
    completed: false,
    simulationDate: today(),
    goals: [],
    answers: {},
  };
}

export function canadaQuestionnaireSteps(draft: CanadaDraft) {
  return canadaStepsFor(draft).map(({ step, title }) => ({
    step,
    title: `ca.step.${title}` as const,
  }));
}

export function canadaRequest(
  draft: CanadaDraft,
  locale: Locale,
): CaFullRequest {
  const { answers } = activeCanadaAnswers(draft);
  const { pnp } = answers;
  return {
    ...answers,
    // The form asks for a percentage; the engine compares a fraction with
    // the one-third share in IRPR s87(5)–(6) (SRC-261).
    ...(pnp?.equityShare !== undefined && {
      pnp: { ...pnp, equityShare: pnp.equityShare / 100 },
    }),
    simulationDate: draft.simulationDate,
    locale,
  };
}

function activeRecord(fields: CanadaField[], record: Answers, goals: string[]) {
  const active: Answers = {};
  for (const field of fields) {
    const value = activeValue(field, record[field.name], goals);
    if (value !== undefined) active[field.name] = value;
  }
  return active;
}

function activeValue(field: CanadaField, value: unknown, goals: string[]) {
  if (field.type === 'group' && isRecord(value))
    return activeRecord(field.fields, value, goals);
  if (field.type === 'list' && Array.isArray(value))
    return value.map((row: Answers) => activeRecord(field.fields, row, goals));
  if (field.type === 'routes' && isRecord(value)) {
    const routes: Answers = {};
    for (const route of goals)
      if (value[route] !== undefined)
        routes[route] = activeValue(field.field, value[route], goals);
    return Object.keys(routes).length ? routes : undefined;
  }
  return value;
}

// The questionnaire keeps answers on steps, groups and routes the user has
// since hidden. Only the visible answers are assessed, checked and shared.
export function activeCanadaAnswers(draft: CanadaDraft): CanadaDraft {
  let answers: Answers = {};
  for (const step of canadaStepsFor(draft))
    for (const section of visibleSections(step, draft)) {
      const source = answersAt(draft.answers, section.path);
      if (source === undefined) continue;
      answers = withAnswersAt(answers, section.path, {
        ...answersAt(answers, section.path),
        ...activeRecord(section.fields, source, draft.goals),
      });
    }
  return { ...draft, answers };
}

export function answersAt(answers: object, path: string[]) {
  let record: unknown = answers;
  for (const key of path) record = (record as Answers | undefined)?.[key];
  return record as Answers | undefined;
}

// Replace the record at a path, dropping empty parents so blank stays unanswered.
export function withAnswersAt<T extends object>(
  answers: T,
  path: string[],
  record: Answers | undefined,
): T {
  if (!path.length) return (record ?? {}) as T;
  const [key, ...rest] = path;
  const current = (answers as Answers)[key] as Answers | undefined;
  const next = rest.length
    ? withAnswersAt(current ?? {}, rest, record)
    : record;
  const copy = { ...answers } as Answers;
  if (next && Object.keys(next).length) copy[key] = next;
  else delete copy[key];
  return copy as T;
}

export const sectionId = (path: string[]) => ['ca', ...path].join('-');

function isRecord(value: unknown): value is Answers {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function checkNumber(field: CanadaField, value: unknown) {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < 0)
    return 'ca.error.number';
  if (field.type === 'integer' && !Number.isInteger(value))
    return 'ca.error.integer';
  const max =
    field.type === 'integer' ||
    field.type === 'number' ||
    field.type === 'tuple'
      ? field.max
      : undefined;
  if (max !== undefined && value > max) return 'ca.error.range';
}

// A set of numbers with every entry blank is no answer.
const blankTuple = (field: CanadaField, value: unknown) =>
  field.type === 'tuple' &&
  Array.isArray(value) &&
  value.every((item) => item === null);

// Periods and documents: the second date cannot be before the first.
const orderedDates = [
  ['from', 'to'],
  ['from', 'until'],
  ['departed', 'returned'],
  ['issued', 'expires'],
  ['nominationIssued', 'nominationExpires'],
  ['certificateIssued', 'certificateExpires'],
  ['principalCsqIssued', 'principalCsqExpires'],
] as const;

function checkField(
  field: CanadaField,
  value: unknown,
  id: string,
  errors: Errors,
) {
  if (
    value === undefined ||
    value === null ||
    value === '' ||
    blankTuple(field, value)
  ) {
    if (field.required) errors[id] = 'ca.error.required';
    return;
  }
  switch (field.type) {
    case 'date':
      if (!validDate(value as string)) errors[id] = 'ca.error.date';
      return;
    case 'number':
    case 'integer': {
      const error = checkNumber(field, value);
      if (error) errors[id] = error;
      return;
    }
    case 'extension':
      if (isRecord(value) && !validDate(value.until as string))
        errors[`${id}-until`] = 'ca.error.date';
      return;
    case 'tuple': {
      const items = value as (number | null)[];
      const filled = items.filter((item) => item !== null);
      if (filled.length && filled.length < field.size)
        errors[`${id}-${items.indexOf(null)}`] = 'ca.error.required';
      items.forEach((item, index) => {
        const error = item === null ? undefined : checkNumber(field, item);
        if (error) errors[`${id}-${index}`] = error;
      });
      return;
    }
    case 'dates':
      (value as string[]).forEach((item, index) => {
        if (!validDate(item)) errors[`${id}-${index}`] = 'ca.error.date';
      });
      return;
    case 'group':
      if (isRecord(value)) checkFields(field.fields, value, id, errors);
      return;
    case 'list':
      (value as Answers[]).forEach((row, index) =>
        checkFields(field.fields, row, `${id}-${index}`, errors),
      );
      return;
    case 'routes':
      for (const [route, answer] of Object.entries(value as Answers))
        checkField(field.field, answer, `${id}-${route}`, errors);
      return;
  }
}

function checkFields(
  fields: CanadaField[],
  record: Answers | undefined,
  id: string,
  errors: Errors,
) {
  for (const field of fields)
    checkField(field, record?.[field.name], `${id}-${field.name}`, errors);
  for (const [start, end] of orderedDates) {
    if (!fields.some(({ name }) => name === end)) continue;
    const first = record?.[start] as string | undefined;
    const last = record?.[end] as string | undefined;
    if (first && last && validDate(first) && validDate(last) && last < first)
      errors[`${id}-${end}`] = 'ca.error.order';
  }
}

export function validateCanadaStep(draft: CanadaDraft): Errors {
  const errors: Errors = {};
  const step = canadaSteps.find((item) => item.step === draft.step);
  if (!step) return errors;
  if (step.step === 0) {
    if (!validDate(draft.simulationDate))
      errors['ca-simulationDate'] = 'ca.error.date';
    if (!draft.goals.length) errors['ca-goals'] = 'ca.error.goals';
  }
  const { answers } = activeCanadaAnswers(draft);
  for (const section of visibleSections(step, draft))
    checkFields(
      section.fields,
      answersAt(answers, section.path),
      sectionId(section.path),
      errors,
    );
  return errors;
}

// Share links and stored drafts are external input: keep only typed answers.
function invalid(): never {
  throw new Error('Invalid Canada answer');
}

function cleanField(field: CanadaField, value: unknown): unknown {
  if (value === undefined) return undefined;
  switch (field.type) {
    case 'boolean':
      return typeof value === 'boolean' ? value : invalid();
    case 'date':
    case 'text':
      return typeof value === 'string' ? value : invalid();
    case 'number':
    case 'integer':
      return typeof value === 'number' && Number.isFinite(value)
        ? value
        : invalid();
    case 'choice':
      return field.options.includes(value as string) ? value : invalid();
    case 'extension':
      if (isRecord(value) && typeof value.until === 'string')
        return { until: value.until };
      return value !== 'until' && field.options.includes(value as string)
        ? value
        : invalid();
    case 'tuple':
      if (
        !Array.isArray(value) ||
        value.length !== field.size ||
        !value.every((item) => item === null || typeof item === 'number')
      )
        invalid();
      return blankTuple(field, value) ? undefined : value;
    case 'dates':
      return Array.isArray(value) &&
        value.every((item) => typeof item === 'string')
        ? value
        : invalid();
    case 'taxYears':
      if (!isRecord(value)) invalid();
      for (const [year, answer] of Object.entries(value))
        if (
          !/^\d{4}$/.test(year) ||
          !['filed', 'not-required', 'not-filed', 'uncertain'].includes(
            answer as string,
          )
        )
          invalid();
      return value;
    case 'group':
      if (value === false && field.allowFalse) return false;
      return cleanRecord(field.fields, value);
    case 'list':
      if (!Array.isArray(value)) invalid();
      return field.nonEmpty && !value.length
        ? undefined
        : value.map((row) => cleanRecord(field.fields, row));
    case 'routes': {
      if (!isRecord(value)) invalid();
      const routes: Answers = {};
      for (const [route, answer] of Object.entries(value)) {
        if (!(initialPrGoals as readonly string[]).includes(route)) invalid();
        const cleaned = cleanField(field.field, answer);
        if (cleaned !== undefined) routes[route] = cleaned;
      }
      return routes;
    }
  }
}

function cleanRecord(fields: CanadaField[], value: unknown): Answers {
  if (!isRecord(value)) invalid();
  const record: Answers = {};
  for (const field of fields) {
    const cleaned = cleanField(field, value[field.name]);
    if (cleaned !== undefined) record[field.name] = cleaned;
  }
  return record;
}

function cleanAnswers(value: unknown): CanadaDraft['answers'] {
  if (!isRecord(value)) invalid();
  let answers: Answers = {};
  for (const step of canadaSteps)
    for (const section of step.sections) {
      const source = answersAt(value, section.path);
      if (source === undefined) continue;
      answers = withAnswersAt(answers, section.path, {
        ...answersAt(answers, section.path),
        ...cleanRecord(section.fields, source),
      });
    }
  return answers;
}

export function decodeCanadaDraft(value: unknown): CanadaDraft | undefined {
  if (
    !isRecord(value) ||
    value.version !== CANADA_DRAFT_VERSION ||
    !canadaSteps.some(({ step }) => step === value.step) ||
    typeof value.completed !== 'boolean' ||
    typeof value.simulationDate !== 'string' ||
    !Array.isArray(value.goals) ||
    value.goals.some((goal) => !canadaGoals.includes(goal as CaFullPathwayId))
  )
    return undefined;
  let answers: CanadaDraft['answers'];
  try {
    answers = cleanAnswers(value.answers);
  } catch {
    return undefined;
  }
  const draft: CanadaDraft = {
    version: CANADA_DRAFT_VERSION,
    step: value.step as number,
    completed: value.completed,
    simulationDate: value.simulationDate,
    goals: canadaGoals.filter((goal) =>
      (value.goals as string[]).includes(goal),
    ),
    answers,
  };
  // A finished draft must still pass every step it shows.
  if (
    draft.completed &&
    canadaStepsFor(draft).some(
      ({ step }) =>
        Object.keys(validateCanadaStep({ ...draft, step })).length > 0,
    )
  )
    return undefined;
  return draft;
}
