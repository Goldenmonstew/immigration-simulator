import type {
  Locale,
  UsAdmissionAnswers,
  UsFullRequest,
  UsReview,
  UsTravelAnswers,
} from '@uk-immigration/engine';
import type { TranslationKey } from '../i18n';
import type { CountryDraft, DraftReadMode } from './country-module';
import { today, validDate } from './questionnaire';
import {
  isI485,
  isPermanentResident,
  usPathways,
  usStepDefinitions,
  valueAt,
  type UsAnswers,
  type UsField,
} from './united-states-fields';

type Availability = NonNullable<UsAdmissionAnswers['visaAtDecision']>;
type MonthRow = { month: string; availability: Availability };
type GroundRow = { ground: string; finding: UsReview };
type Tables =
  | 'visaAtFilingByMonth'
  | 'visaAtDecisionByMonth'
  | 'otherInadmissibilityByGround';
// Month and ground tables are edited as rows and become records for the engine.
export type UsAdmissionDraft = Omit<UsAdmissionAnswers, Tables> & {
  visaAtFilingByMonth?: MonthRow[];
  visaAtDecisionByMonth?: MonthRow[];
  otherInadmissibilityByGround?: GroundRow[];
};
export type UsDraft = CountryDraft &
  Omit<
    Partial<UsFullRequest>,
    'locale' | 'simulationDate' | 'admission' | 'travel'
  > & {
    admission?: UsAdmissionDraft;
    travel?: Omit<UsTravelAnswers, 'admission'> & {
      admission?: UsAdmissionDraft;
    };
  };

type Answers = Record<string, unknown>;
type Errors = Record<string, TranslationKey>;

const isRecord = (value: unknown): value is Answers =>
  !!value && typeof value === 'object' && !Array.isArray(value);

export function createUnitedStatesDraft(): UsDraft {
  return { version: 1, step: 0, completed: false, simulationDate: today() };
}

export const isRequired = (field: UsField, draft: UsAnswers) =>
  typeof field.required === 'function'
    ? field.required(draft)
    : !!field.required;

export function unitedStatesSteps(draft: UsDraft) {
  return usStepDefinitions.flatMap((definition, step) =>
    step === 0 || (draft.pathway && definition.when(draft))
      ? [
          {
            step,
            title: `us.step.${definition.title}` as TranslationKey,
          },
        ]
      : [],
  );
}

function visibleSections(draft: UsDraft) {
  return unitedStatesSteps(draft).flatMap(({ step }) =>
    usStepDefinitions[step].sections.filter(
      (section) => !section.when || section.when(draft),
    ),
  );
}

// Keep only answers that a visible question asked for, including nested rows.
function pruneRecord(fields: UsField[], record: Answers, draft: UsDraft) {
  const active: Answers = {};
  for (const field of fields) {
    const value = record[field.name];
    if (value === undefined || (field.when && !field.when({ draft, record })))
      continue;
    if (field.type === 'group' && isRecord(value))
      active[field.name] = pruneRecord(field.fields, value, draft);
    else if (field.type === 'list' && Array.isArray(value))
      active[field.name] = value.map((row) =>
        isRecord(row) ? pruneRecord(field.fields, row, draft) : row,
      );
    else active[field.name] = value;
  }
  return active;
}

function mergeAt(target: Answers, path: readonly string[], values: Answers) {
  let record = target;
  for (const key of path) {
    if (!isRecord(record[key])) record[key] = {};
    record = record[key] as Answers;
  }
  Object.assign(record, values);
}

export function activeUnitedStatesAnswers(draft: UsDraft): UsDraft {
  const { version, step, completed, simulationDate } = draft;
  const active: Answers = { version, step, completed, simulationDate };
  for (const section of visibleSections(draft)) {
    const record = valueAt(draft, section.path);
    if (!isRecord(record)) continue;
    const values = pruneRecord(section.fields, record, draft);
    if (Object.keys(values).length) mergeAt(active, section.path, values);
  }
  return active as unknown as UsDraft;
}

function admissionRequest({
  visaAtFilingByMonth,
  visaAtDecisionByMonth,
  otherInadmissibilityByGround,
  ...answers
}: UsAdmissionDraft): UsAdmissionAnswers {
  const months = (rows: MonthRow[]) =>
    Object.fromEntries(rows.map((row) => [row.month, row.availability]));
  return {
    ...answers,
    ...(visaAtFilingByMonth && {
      visaAtFilingByMonth: months(visaAtFilingByMonth),
    }),
    ...(visaAtDecisionByMonth && {
      visaAtDecisionByMonth: months(visaAtDecisionByMonth),
    }),
    ...(otherInadmissibilityByGround && {
      otherInadmissibilityByGround: Object.fromEntries(
        otherInadmissibilityByGround.map((row) => [row.ground, row.finding]),
      ),
    }),
  };
}

export function unitedStatesRequest(
  draft: UsDraft,
  locale: Locale,
): UsFullRequest {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { version, step, completed, admission, travel, ...answers } =
    activeUnitedStatesAnswers(draft);
  return {
    ...answers,
    pathway: answers.pathway!,
    admission: admission && admissionRequest(admission),
    travel: travel && {
      ...travel,
      admission: travel.admission && admissionRequest(travel.admission),
    },
    locale,
  };
}

function checkFields(
  fields: UsField[],
  record: Answers,
  prefix: string,
  draft: UsDraft,
  submitting: boolean,
  errors: Errors,
) {
  for (const field of fields) {
    if (field.when && !field.when({ draft, record })) continue;
    const id = `${prefix}-${field.name}`;
    const value = record[field.name];
    if (value === undefined || value === '') {
      if (!submitting) continue;
      if (value === '') errors[id] = 'us.error.entered';
      else if (isRequired(field, draft) && field.type === 'group') {
        for (const child of field.fields)
          if (child.required)
            errors[`${id}-${child.name}`] = 'us.error.required';
      } else if (isRequired(field, draft)) errors[id] = 'us.error.required';
      continue;
    }
    if (field.alternatives?.includes(value as never)) continue;
    switch (field.type) {
      case 'group':
        if (isRecord(value))
          checkFields(field.fields, value, id, draft, submitting, errors);
        else errors[id] = 'us.error.required';
        break;
      case 'list':
      case 'dates':
        if (!Array.isArray(value)) {
          errors[id] = 'us.error.required';
          break;
        }
        value.forEach((row: unknown, index) => {
          const rowId = `${id}-${index}`;
          if (field.type === 'dates') {
            if (typeof row !== 'string') errors[id] = 'us.error.required';
            else if (submitting && !validDate(row))
              errors[rowId] = 'us.error.date';
          } else if (field.type === 'list' && isRecord(row))
            checkFields(field.fields, row, rowId, draft, submitting, errors);
          else errors[id] = 'us.error.required';
        });
        break;
      case 'choice':
        if (!field.options.includes(value as never))
          errors[id] = 'us.error.required';
        break;
      case 'review':
        if (!['cleared', 'barred', 'pending'].includes(value as string))
          errors[id] = 'us.error.required';
        break;
      case 'boolean':
        if (typeof value !== 'boolean') errors[id] = 'us.error.required';
        break;
      case 'text':
        if (typeof value !== 'string') errors[id] = 'us.error.required';
        break;
      case 'month':
        if (typeof value !== 'string' || !/^\d{4}-(0[1-9]|1[0-2])$/.test(value))
          errors[id] = 'us.error.month';
        break;
      case 'date':
        if (typeof value !== 'string' || !validDate(value))
          errors[id] = 'us.error.date';
        break;
      case 'number':
      case 'integer':
        if (typeof value !== 'number' || !Number.isFinite(value))
          errors[id] = 'us.error.number';
        else if (submitting && value < 0 && !field.signed)
          errors[id] = 'us.error.number';
        else if (
          submitting &&
          field.type === 'integer' &&
          !Number.isInteger(value)
        )
          errors[id] = 'us.error.integer';
        break;
    }
  }
}

const date = (value: unknown) =>
  typeof value === 'string' && validDate(value) ? value : undefined;

function checkOrder(errors: Errors, id: string, start: unknown, end: unknown) {
  const from = date(start);
  const to = date(end);
  if (from && to && to < from) errors[id] ??= 'us.error.order';
}

function checkTrips(draft: UsDraft, errors: Errors) {
  const trips = Array.isArray(draft.trips) ? draft.trips : [];
  const since = isPermanentResident(draft)
    ? date(draft.permanentResident)
    : undefined;
  trips.forEach((trip, index) => {
    const id = `us-trips-${index}`;
    checkOrder(errors, `${id}-returned`, trip.departed, trip.returned);
    if (since && date(trip.departed) && trip.departed < since)
      errors[`${id}-departed`] ??= 'us.error.beforeGreenCard';
    if (
      trips
        .slice(0, index)
        .some(
          (other) =>
            trip.departed < other.returned && other.departed < trip.returned,
        )
    )
      errors[`${id}-departed`] ??= 'us.error.overlap';
  });
  const principal = date(draft.principalConditional);
  const resident = date(draft.permanentResident);
  if (principal && resident && principal > resident)
    errors['us-principalConditional'] = 'us.error.principalOrder';
}

// The engine combines same-year wage records by period. Records for the same
// wages must not conflict, and without accepted proration the priority-date
// year is assessed from 1 January (SRC-305, 6 USCIS-PM E.4(C)–(D)).
function checkWages(draft: UsDraft, errors: Errors) {
  const employment = draft.employment ?? {};
  const rows = Array.isArray(employment.wageYears) ? employment.wageYears : [];
  const periods = rows.map((row, index) => {
    const id = `us-employment-wageYears-${index}`;
    if (typeof row.year !== 'number' || !Number.isInteger(row.year))
      return undefined;
    const start = `${row.year}-01-01`;
    const end = `${row.year}-12-31`;
    for (const key of ['from', 'through'] as const) {
      const value = date(row[key]);
      if (value && (value < start || value > end))
        errors[`${id}-${key}`] ??= 'us.error.wageYear';
    }
    checkOrder(errors, `${id}-through`, row.from, row.through);
    return {
      id,
      year: row.year,
      from: date(row.from) ?? start,
      through: date(row.through) ?? end,
      paid: row.paidUsd,
    };
  });
  periods.forEach((current, index) => {
    if (!current) return;
    for (const other of periods.slice(0, index)) {
      if (!other || other.year !== current.year) continue;
      const overlap =
        current.from <= other.through && other.from <= current.through;
      // Year-to-date records share a start date and end on different days.
      const cumulative =
        current.from === other.from && current.through !== other.through;
      if (overlap && !cumulative)
        errors[`${current.id}-from`] ??= 'us.error.wageOverlap';
      else if (
        cumulative &&
        current.paid !== undefined &&
        other.paid !== undefined &&
        (current.through > other.through
          ? current.paid < other.paid
          : current.paid > other.paid)
      )
        errors[`${current.id}-paidUsd`] ??= 'us.error.wageCumulative';
    }
  });
  const priority = recordedPriorityDate(draft);
  if (
    !priority ||
    priority.endsWith('-01-01') ||
    employment.priorityYearProration?.finding === 'cleared'
  )
    return;
  const year = Number(priority.slice(0, 4));
  for (const period of periods)
    if (period?.year === year && period.from !== `${year}-01-01`)
      errors[`${period.id}-from`] ??= 'us.error.wageProration';
}

// Matches the engine's recorded priority date for the petition (8 CFR 204.5(d)).
function recordedPriorityDate(draft: UsDraft) {
  const employment = draft.employment ?? {};
  const ordinaryPerm =
    (employment.category === 'eb2-perm' || employment.category === 'eb3') &&
    employment.perm !== 'schedule-a';
  const i140 = employment.i140FiledOn ?? draft.admission?.petitionFiledOn;
  return date(
    (ordinaryPerm
      ? employment.permRecruitment?.laborCertificationFiledOn
      : i140) ?? employment.priorityDate,
  );
}

function checkTables(
  admission: UsAdmissionDraft,
  prefix: string,
  errors: Errors,
) {
  for (const [name, key] of [
    ['visaAtFilingByMonth', 'month'],
    ['visaAtDecisionByMonth', 'month'],
    ['otherInadmissibilityByGround', 'ground'],
  ] as const) {
    const rows: Answers[] = Array.isArray(admission[name])
      ? (admission[name] as Answers[])
      : [];
    const seen = new Set<unknown>();
    rows.forEach((row, index) => {
      const id = `${prefix}-${name}-${index}-${key}`;
      if (
        key === 'ground' &&
        typeof row.ground === 'string' &&
        row.ground &&
        !/^(5|6|7|8|9|10)(\(.+\))?$/.test(row.ground)
      )
        errors[id] ??= 'us.error.ground';
      if (seen.has(row[key])) errors[id] ??= 'us.error.duplicate';
      seen.add(row[key]);
    });
  }
}

function checkStep(draft: UsDraft, step: number, submitting: boolean): Errors {
  const errors: Errors = {};
  for (const section of usStepDefinitions[step].sections) {
    if (section.when && !section.when(draft)) continue;
    const record = valueAt(draft, section.path);
    const prefix = ['us', ...section.path].join('-');
    if (record !== undefined && !isRecord(record)) {
      errors[prefix] = 'us.error.required';
      continue;
    }
    checkFields(
      section.fields,
      record ?? {},
      prefix,
      draft,
      submitting,
      errors,
    );
  }
  if (!submitting) return errors;
  const title = usStepDefinitions[step].title;
  if (title === 'status') checkTrips(draft, errors);
  if (title === 'military')
    draft.military?.service?.forEach((period, index) =>
      checkOrder(
        errors,
        `us-military-service-${index}-to`,
        period.from,
        period.to,
      ),
    );
  if (title === 'employment') {
    const order = draft.employment?.permRecruitment?.stateJobOrder;
    checkOrder(
      errors,
      'us-employment-permRecruitment-stateJobOrder-through',
      order?.from,
      order?.through,
    );
    checkWages(draft, errors);
  }
  if (title === 'process' && draft.admission) {
    checkTables(draft.admission, 'us-admission', errors);
    if (
      draft.admission.process === 'consular' &&
      draft.admission.petitionStatus === 'filed-with-i485'
    )
      errors['us-admission-petitionStatus'] = 'us.error.consularPetition';
  }
  if (title === 'admissibility') {
    if (draft.admission && draft.pathway !== 'US-TRAVEL')
      checkTables(draft.admission, 'us-admission', errors);
    if (draft.travel?.admission && draft.pathway === 'US-TRAVEL')
      checkTables(draft.travel.admission, 'us-travel-admission', errors);
  }
  return errors;
}

export function validateUnitedStatesStep(draft: UsDraft) {
  return checkStep(draft, draft.step, true);
}

// The first visible step a completed draft fails, if any.
export function invalidUnitedStatesStep(draft: UsDraft) {
  return unitedStatesSteps(draft).find(
    ({ step }) => Object.keys(checkStep(draft, step, true)).length,
  );
}

export function decodeUnitedStatesDraft(
  value: unknown,
  mode: DraftReadMode = false,
): UsDraft | undefined {
  if (
    !isRecord(value) ||
    value.version !== 1 ||
    typeof value.step !== 'number' ||
    !Number.isInteger(value.step) ||
    value.step < 0 ||
    value.step >= usStepDefinitions.length ||
    typeof value.completed !== 'boolean' ||
    typeof value.simulationDate !== 'string' ||
    (value.pathway !== undefined &&
      !usPathways.includes(value.pathway as never))
  )
    return undefined;
  const draft = value as unknown as UsDraft;
  // Stored answers must have the types the questions write.
  if (
    usStepDefinitions.some(
      (_, step) => Object.keys(checkStep(draft, step, false)).length,
    ) ||
    !unitedStatesSteps(draft).some(({ step }) => step === draft.step)
  )
    return undefined;
  const invalid = draft.completed ? invalidUnitedStatesStep(draft) : undefined;
  // Results and shared links need a completed, valid questionnaire.
  if (mode) return draft.completed && !invalid ? draft : undefined;
  return invalid ? { ...draft, completed: false, step: invalid.step } : draft;
}

export { isI485 };
