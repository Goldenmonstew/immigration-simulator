import type { Locale, MyFullRequest } from '@uk-immigration/engine';
import type { TranslationKey } from '../i18n';
import type { CountryDraft, DraftReadMode } from './country-module';
import { today, validDate } from './questionnaire';
import {
  MY_NATIONALITIES,
  MY_TARGETS,
  fieldShown,
  malaysiaSteps,
  myPathwayByTarget,
  scopeOf,
  sectionShown,
  type MalaysiaField,
  type MalaysiaSection,
  type MyPath,
  type MyScope,
  type MyTarget,
} from './malaysia-fields';

type Evidence<K extends keyof MyFullRequest> = NonNullable<MyFullRequest[K]>;

export interface MalaysiaDraft
  extends
    CountryDraft,
    Partial<
      Pick<
        MyFullRequest,
        | 'nationality'
        | 'dateOfBirth'
        | 'passportExpiry'
        | 'passes'
        | 'trips'
        | 'citizenSponsor'
        | 'residencePassSponsor'
        | 'citizenReferees'
        | 'immigrationRecord'
        | 'criminalRecord'
      >
    > {
  targets: MyTarget[];
  // Asked as "ever refused" and the refusal date (engine: null if never).
  prRefused?: boolean;
  prRefusedOn?: string;
  family: Evidence<'family'>;
  evidence: Evidence<'evidence'>;
  language: Evidence<'language'>;
  was: Evidence<'was'>;
  rep: Evidence<'rep'>;
  // Whether a Permit Masuk is held, then its issue date (engine: null if not).
  citizenship: Omit<Evidence<'citizenship'>, 'permanentResidentSince'> & {
    prHeld?: boolean;
    permanentResidentSince?: string;
  };
  mm2h: Evidence<'mm2h'>;
  work: Evidence<'work'>;
  rpt: Evidence<'rpt'>;
  deRantau: Evidence<'deRantau'>;
}

const recordKeys = [
  'family',
  'evidence',
  'language',
  'was',
  'rep',
  'citizenship',
  'mm2h',
  'work',
  'rpt',
  'deRantau',
] as const;

function emptyDraft(
  draft: Pick<
    MalaysiaDraft,
    'version' | 'step' | 'completed' | 'simulationDate' | 'targets'
  >,
): MalaysiaDraft {
  return {
    version: draft.version,
    step: draft.step,
    completed: draft.completed,
    simulationDate: draft.simulationDate,
    targets: draft.targets,
    ...(Object.fromEntries(recordKeys.map((key) => [key, {}])) as Pick<
      MalaysiaDraft,
      (typeof recordKeys)[number]
    >),
  };
}

export function createMalaysiaDraft(): MalaysiaDraft {
  return emptyDraft({
    version: 1,
    step: 0,
    completed: false,
    simulationDate: today(),
    targets: [],
  });
}

export function visibleSections(draft: MalaysiaDraft, step: number) {
  return malaysiaSteps[step].sections.filter((section) =>
    sectionShown(section, draft.targets),
  );
}

export function malaysiaStepList(draft: MalaysiaDraft) {
  return malaysiaSteps.flatMap(({ title }, step) =>
    visibleSections(draft, step).length ? [{ step, title }] : [],
  );
}

export const sectionPrefix = (section: Pick<MalaysiaSection, 'path'>) =>
  ['my', ...section.path].join('-');

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

export function readPath(
  record: object,
  path: MyPath,
): Record<string, unknown> | undefined {
  let value: unknown = record;
  for (const key of path) value = isRecord(value) ? value[key] : undefined;
  return isRecord(value) ? value : undefined;
}

export function writePath<T extends object>(
  record: T,
  path: MyPath,
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
  fields: MalaysiaField[],
  record: Record<string, unknown>,
  scope: MyScope,
): Record<string, unknown> {
  const answers: Record<string, unknown> = {};
  for (const field of fields) {
    const value = record[field.name];
    if (value === undefined || !fieldShown(field, record, scope)) continue;
    answers[field.name] =
      field.type === 'list' && Array.isArray(value)
        ? value.map((row) =>
            isRecord(row) ? shownAnswers(field.fields, row, scope) : row,
          )
        : value;
  }
  return answers;
}

function withoutHidden(
  fields: MalaysiaField[],
  record: Record<string, unknown>,
  scope: MyScope,
): Record<string, unknown> {
  let next = record;
  for (const field of fields) {
    const value = record[field.name];
    if (value === undefined) continue;
    let kept: unknown = value;
    if (!fieldShown(field, record, scope)) kept = undefined;
    else if (field.type === 'list' && Array.isArray(value)) {
      const rows = value.map((row) =>
        isRecord(row) ? withoutHidden(field.fields, row, scope) : row,
      );
      if (rows.some((row, i) => row !== value[i])) kept = rows;
    }
    if (kept === value) continue;
    next = { ...next, [field.name]: kept };
    if (kept === undefined) delete next[field.name];
  }
  return next;
}

// Changing an answer clears the questions it hides (a sibling answer's
// `when`, or the REP relation). Answers for routes no longer chosen are kept
// for when they return.
export function clearHiddenMalaysiaAnswers(draft: MalaysiaDraft) {
  let next = draft;
  for (const { step } of malaysiaStepList(draft))
    for (const section of visibleSections(draft, step)) {
      const record = readPath(next, section.path);
      // Fields of other routes stay; only the answers decide here.
      const scope = { ...scopeOf(next), targets: MY_TARGETS };
      const kept = record && withoutHidden(section.fields, record, scope);
      if (kept !== record) next = writePath(next, section.path, kept!);
    }
  return next;
}

// The editable draft may keep answers for a route or branch the user later
// left. Assessment and sharing only use the questions that are still shown.
export function activeMalaysiaAnswers(draft: MalaysiaDraft): MalaysiaDraft {
  let active = emptyDraft(draft);
  for (const { step } of malaysiaStepList(draft))
    for (const section of visibleSections(draft, step)) {
      const source = readPath(draft, section.path);
      const answers =
        source && shownAnswers(section.fields, source, scopeOf(draft));
      if (!answers || !Object.keys(answers).length) continue;
      active = writePath(active, section.path, {
        ...readPath(active, section.path),
        ...answers,
      });
    }
  return active;
}

export function malaysiaRequest(
  draft: MalaysiaDraft,
  locale: Locale,
): MyFullRequest {
  const answers = activeMalaysiaAnswers(draft);
  const { prRefused, prRefusedOn } = answers;
  const { prHeld, permanentResidentSince, ...citizenship } =
    answers.citizenship;
  // The engine ignores the draft's own bookkeeping keys.
  return {
    ...answers,
    locale,
    pathways: answers.targets.map((target) => myPathwayByTarget[target]),
    previousPrRefusalOn:
      prRefused === false ? null : prRefused ? prRefusedOn : undefined,
    citizenship: {
      ...citizenship,
      permanentResidentSince:
        prHeld === false ? null : prHeld ? permanentResidentSince : undefined,
    },
  };
}

// The REP participant is a citizen, so each REP relation matches one tie.
const repTies = {
  wife: 'wife-of-citizen',
  husband: 'husband-of-citizen',
  child: 'child-of-citizen',
} as const;
const familyFields = malaysiaSteps
  .flatMap((step) => step.sections)
  .find((section) => section.id === 'family')!.fields;
// Whether a route other than REP shows the question, by the tie answer.
const byTie = (name: string, draft: MalaysiaDraft) =>
  fieldShown(
    { ...familyFields.find((field) => field.name === name)!, rep: undefined },
    draft.family,
    scopeOf(draft),
  );

/**
 * The family step's note when the tie and the REP relation both use its
 * marriage or child answers: shared, or in conflict when the two disagree.
 */
export function familyNote(draft: MalaysiaDraft): TranslationKey | undefined {
  const relation = draft.rep.relation;
  if (!draft.targets.includes('pr-rep') || !relation || relation === 'none')
    return undefined;
  if (draft.family.tie === undefined || !byTie('tie', draft)) return undefined;
  if (draft.family.tie !== repTies[relation]) return 'my.form.familyConflict';
  return byTie(relation === 'child' ? 'childRelation' : 'separated', draft)
    ? 'my.form.familyShared'
    : undefined;
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
    errors[id] ??= 'my.error.order';
}

// The same definitions describe the questions and the values a stored or
// shared draft may contain. An unfinished draft keeps blank required answers,
// reversed dates, dates after the simulation date and out-of-range numbers
// until its step is submitted.
function checkFields(
  fields: MalaysiaField[],
  record: Record<string, unknown>,
  prefix: string,
  scope: MyScope,
  submitting: boolean,
  errors: Errors,
  asOf?: string,
) {
  for (const field of fields) {
    if (!fieldShown(field, record, scope)) continue;
    const id = `${prefix}-${field.name}`;
    const value = record[field.name];
    if (value === undefined || value === '') {
      if (submitting && field.required)
        errors[id] =
          field.type === 'list' ? 'my.form.listRequired' : 'my.form.required';
      continue;
    }
    switch (field.type) {
      case 'list':
        if (!Array.isArray(value)) {
          errors[id] = 'my.form.required';
          break;
        }
        value.forEach((row, i) => {
          if (!isRecord(row)) {
            errors[id] = 'my.form.required';
            return;
          }
          checkFields(
            field.fields,
            row,
            `${id}-${i}`,
            scope,
            submitting,
            errors,
            asOf,
          );
          if (!submitting) return;
          order(errors, `${id}-${i}-to`, row.from, row.to);
          order(errors, `${id}-${i}-returned`, row.departed, row.returned);
        });
        break;
      case 'choice':
        if (!field.options.includes(value as string))
          errors[id] = 'my.form.required';
        break;
      case 'country':
        if (!MY_NATIONALITIES.includes(value as string))
          errors[id] = 'my.form.required';
        break;
      case 'boolean':
        if (typeof value !== 'boolean') errors[id] = 'my.form.required';
        break;
      case 'date':
        if (typeof value !== 'string' || !validDate(value))
          errors[id] = 'my.error.date';
        else if (field.past && asOf && value > asOf)
          errors[id] = 'my.error.afterSimulation';
        break;
      default:
        if (
          typeof value !== 'number' ||
          !Number.isFinite(value) ||
          (submitting && value < 0)
        )
          errors[id] = 'my.error.number';
        else if (
          submitting &&
          field.type === 'integer' &&
          !Number.isInteger(value)
        )
          errors[id] = 'my.error.integer';
    }
  }
}

function checkStep(draft: MalaysiaDraft, step: number, submitting: boolean) {
  const errors: Errors = {};
  const asOf =
    submitting && validDate(draft.simulationDate)
      ? draft.simulationDate
      : undefined;
  // The routes lead the first step, so their error takes focus first.
  if (step === 0 && submitting && !draft.targets.length)
    errors['my-targets'] = 'my.form.routeError';
  for (const section of visibleSections(draft, step))
    checkFields(
      section.fields,
      readPath(draft, section.path) ?? {},
      sectionPrefix(section),
      scopeOf(draft),
      submitting,
      errors,
      asOf,
    );
  return errors;
}

export function validateMalaysiaStep(draft: MalaysiaDraft) {
  return checkStep(draft, draft.step, true);
}

// A saved or shared result must satisfy the same visible steps as a new
// submission. An unsubmitted questionnaire stays editable.
export function restoreStoredMalaysiaDraft(
  draft: MalaysiaDraft,
  forResult = false,
): MalaysiaDraft {
  if (!forResult && !draft.completed) return draft;
  const invalid = malaysiaStepList(draft).find(
    ({ step }) => Object.keys(checkStep(draft, step, true)).length,
  );
  const completed = !invalid;
  const step = invalid?.step ?? draft.step;
  return draft.completed === completed && draft.step === step
    ? draft
    : { ...draft, completed, step };
}

function validTargets(value: unknown): value is MyTarget[] {
  return (
    Array.isArray(value) &&
    new Set(value).size === value.length &&
    value.every((item) => MY_TARGETS.includes(item))
  );
}

export function decodeMalaysiaDraft(
  value: unknown,
  mode: DraftReadMode = false,
): MalaysiaDraft | undefined {
  if (
    !isRecord(value) ||
    value.version !== 1 ||
    typeof value.step !== 'number' ||
    !Number.isInteger(value.step) ||
    value.step < 0 ||
    value.step >= malaysiaSteps.length ||
    typeof value.completed !== 'boolean' ||
    typeof value.simulationDate !== 'string' ||
    !validTargets(value.targets) ||
    recordKeys.some((key) => value[key] !== undefined && !isRecord(value[key]))
  )
    return undefined;
  const draft = {
    ...value,
    ...Object.fromEntries(recordKeys.map((key) => [key, value[key] ?? {}])),
  } as unknown as MalaysiaDraft;
  if (
    malaysiaSteps.some(
      (_, step) => Object.keys(checkStep(draft, step, false)).length,
    )
  )
    return undefined;
  const restored = restoreStoredMalaysiaDraft(draft, !!mode);
  if (!malaysiaStepList(restored).some(({ step }) => step === restored.step))
    return undefined;
  if (
    !restored.completed &&
    mode !== 'show-correction' &&
    (mode || draft.completed)
  )
    return undefined;
  return restored;
}
