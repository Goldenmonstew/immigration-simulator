import {
  ES_FULL_TARGETS,
  ES_NATIONALITY_ROUTES,
  type EsFreeMovementFacts,
  type EsFullInput,
  type EsFullTarget,
  type EsLongTermCardFacts,
  type EsMobilityFacts,
  type EsNationalityFacts,
  type EsNationalityRoute,
  type EsRecoveryFacts,
  type EsResidenceFacts,
} from '@uk-immigration/engine';
import { spainFull2026_11 } from '@uk-immigration/policy-data';
import type { TranslationKey } from '../i18n';
import type { CountryDraft, DraftReadMode } from './country-module';
import { today, validDate } from './questionnaire';
import {
  spainFreeMovementSections,
  spainHistoryFields,
  spainLongTermCardFields,
  spainMobilitySections,
  spainNatSections,
  spainNatTopFields,
  spainRecoverySections,
  spainResidenceSections,
  spainStep0Fields,
  type SpainField,
} from './spain-fields';

export interface SpainDraft
  extends CountryDraft,
    Omit<EsFullInput, 'locale' | 'targets'> {
  targets: EsFullTarget[];
  nationality: EsNationalityFacts;
  residence: EsResidenceFacts;
  mobility: EsMobilityFacts;
  recovery: EsRecoveryFacts;
  longTermCard: EsLongTermCardFacts;
  freeMovement: EsFreeMovementFacts;
}

export function createSpainDraft(): SpainDraft {
  return {
    version: 1,
    step: 0,
    completed: false,
    simulationDate: today(),
    targets: [],
    nationality: {},
    residence: {},
    mobility: {},
    recovery: {},
    longTermCard: {},
    freeMovement: {},
  };
}

const titles = [
  'es.form.step0',
  'es.form.step1',
  'es.form.step2',
  'es.form.step3',
  'es.form.step4',
  'es.form.step5',
  'es.form.step6',
] as const;

export function hasSpainHistoryTarget(targets: readonly EsFullTarget[]) {
  return targets.some((t) => t === 'N' || t === 'L' || t === 'E' || t === 'U');
}

export function hasSpainResidenceTarget(targets: readonly EsFullTarget[]) {
  return targets.some((t) => t === 'L' || t === 'E');
}

export function hasSpainMobilityTarget(targets: readonly EsFullTarget[]) {
  return targets.some((t) => t === 'M' || t === 'F');
}

export function hasSpainRecoveryOrCardTarget(targets: readonly EsFullTarget[]) {
  return targets.some(
    (t) => t === 'R-N' || t === 'R-E' || t === 'L' || t === 'E' || t === 'M',
  );
}

export function spainSteps(draft: SpainDraft) {
  const { targets } = draft;
  return titles.flatMap((title, step) => {
    const enabled =
      step === 0 ||
      (step === 1
        ? hasSpainHistoryTarget(targets)
        : step === 2
          ? targets.includes('N')
          : step === 3
            ? hasSpainResidenceTarget(targets)
            : step === 4
              ? hasSpainMobilityTarget(targets)
              : step === 5
                ? hasSpainRecoveryOrCardTarget(targets)
                : targets.includes('U'));
    return enabled ? [{ step, title }] : [];
  });
}

export function activeSpainAnswers(draft: SpainDraft): SpainDraft {
  const visible = new Set(spainSteps(draft).map(({ step }) => step));
  const hasHistory = visible.has(1);
  const hasRecovery = draft.targets.some((t) => t === 'R-N' || t === 'R-E');
  const hasCard = draft.targets.some(
    (t) => t === 'L' || t === 'E' || t === 'M',
  );
  return {
    ...draft,
    timeRecordsComplete: hasHistory ? draft.timeRecordsComplete : undefined,
    permits: hasHistory ? draft.permits : undefined,
    trips: hasHistory ? draft.trips : undefined,
    route: visible.has(2) ? draft.route : undefined,
    marriedToSpaniard:
      visible.has(2) && draft.route === 'marriage'
        ? draft.marriedToSpaniard
        : undefined,
    nationality: visible.has(2) ? draft.nationality : {},
    residence: visible.has(3) ? draft.residence : {},
    mobility: visible.has(4) ? draft.mobility : {},
    recovery: visible.has(5) && hasRecovery ? draft.recovery : {},
    longTermCard: visible.has(5) && hasCard ? draft.longTermCard : {},
    freeMovement: visible.has(6) ? draft.freeMovement : {},
  };
}

// The answers the engine reads.
export function spainEngineInput(draft: SpainDraft): SpainDraft {
  const active = activeSpainAnswers(draft);
  const { schooling } = active.residence;
  // Notice dates apply child by child, so an unconfirmed list stays unconfirmed.
  return schooling && !schooling.children
    ? { ...active, residence: { ...active.residence, schooling: undefined } }
    : active;
}

type Errors = Record<string, TranslationKey>;

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function checkFields(
  fields: SpainField[],
  record: object,
  prefix: string,
  required: boolean,
  errors: Errors,
) {
  const answers = record as Record<string, unknown>;
  const order = (id: string, start?: unknown, end?: unknown) => {
    if (
      typeof start === 'string' &&
      typeof end === 'string' &&
      start &&
      end &&
      validDate(start) &&
      validDate(end) &&
      end < start
    )
      errors[id] ??= 'es.error.order';
  };
  for (const field of fields) {
    const id = `${prefix}-${field.name}`;
    const value = answers[field.name];
    if (value === undefined || (value === '' && field.type === 'date')) {
      if (
        required &&
        (field.required ||
          (field.requiredWith && answers[field.requiredWith] !== undefined))
      )
        errors[id] = 'es.form.required';
      continue;
    }
    switch (field.type) {
      case 'list':
        if (!Array.isArray(value)) {
          errors[id] = 'es.form.required';
          break;
        }
        value.forEach((row, i) => {
          if (isRecord(row)) {
            checkFields(field.fields, row, `${id}-${i}`, required, errors);
            if (required) {
              order(`${id}-${i}-to`, row.from, row.to);
              order(`${id}-${i}-returned`, row.departed, row.returned);
              order(`${id}-${i}-leftSpain`, row.enteredSpain, row.leftSpain);
            }
          } else {
            errors[id] = 'es.form.required';
          }
        });
        break;
      case 'group':
        if (isRecord(value)) {
          checkFields(field.fields, value, id, required, errors);
          if (required) {
            order(`${id}-to`, value.from, value.to);
            order(`${id}-returned`, value.departed, value.returned);
            order(`${id}-validTo`, value.validFrom, value.validTo);
            order(`${id}-validThrough`, value.issued, value.validThrough);
            order(`${id}-cureDeadline`, value.noticeDate, value.cureDeadline);
            order(`${id}-moveDate`, value.firstCardFrom, value.moveDate);
          }
        } else {
          errors[id] = 'es.form.required';
        }
        break;
      case 'choice':
        if (!field.options.some((option) => value === option))
          errors[id] = 'es.form.required';
        break;
      case 'multi-choice':
        if (
          !Array.isArray(value) ||
          !value.every(
            (item) =>
              typeof item === 'string' &&
              (field.name === 'documentedNationalities'
                ? item.length > 0
                : field.options.some((opt) => opt === item)),
          )
        )
          errors[id] = 'es.form.required';
        break;
      case 'date-list':
        if (!Array.isArray(value)) {
          errors[id] = 'es.error.date';
          break;
        }
        // A blank row may still be in progress until the step is submitted.
        value.forEach((item, i) => {
          if (typeof item !== 'string' || ((required || item) && !validDate(item)))
            errors[`${id}-${i}`] = 'es.error.date';
        });
        break;
      case 'boolean':
        if (typeof value !== 'boolean') errors[id] = 'es.form.required';
        break;
      case 'date':
        if (typeof value !== 'string' || !validDate(value))
          errors[id] = 'es.error.date';
        break;
      case 'number':
      case 'integer':
        if (
          typeof value !== 'number' ||
          !Number.isFinite(value) ||
          (required && value < 0)
        )
          errors[id] = 'es.form.numberError';
        else if (
          required &&
          field.type === 'integer' &&
          !Number.isSafeInteger(value)
        )
          errors[id] = 'es.form.integerError';
        else if (required && field.min !== undefined && value < field.min)
          errors[id] = 'es.whatif.invalidFamilySize';
        break;
    }
  }
}

function checkStep(draft: SpainDraft, step: number, submitting: boolean) {
  const errors: Errors = {};
  const fields = (definitions: SpainField[], values: object, prefix: string) =>
    checkFields(definitions, values, prefix, submitting, errors);
  const order = (id: string, start?: string, end?: string) => {
    if (start && end && validDate(start) && validDate(end) && end < start)
      errors[id] ??= 'es.error.order';
  };
  switch (step) {
    case 0:
      fields(spainStep0Fields, draft, 'es');
      if (submitting && !draft.targets.length)
        errors['es-targets'] = 'es.form.routeError';
      break;
    case 1:
      fields(spainHistoryFields, draft, 'es');
      break;
    case 2:
      fields(spainNatTopFields, draft, 'es-nat');
      for (const section of Object.values(spainNatSections))
        fields(section, draft.nationality, 'es-nat');
      if (submitting) {
        order(
          'es-nat-guardianshipTo',
          draft.nationality.guardianshipFrom,
          draft.nationality.guardianshipTo,
        );
        const correct = draft.nationality.ccse?.correct;
        if (
          typeof correct === 'number' &&
          correct > spainFull2026_11.values.nationalityCcseQuestions.value
        )
          errors['es-nat-ccse-correct'] ??= 'es.form.ccseCorrectError';
      }
      break;
    case 3:
      for (const section of Object.values(spainResidenceSections))
        fields(section, draft.residence, 'es-res');
      break;
    case 4:
      for (const section of Object.values(spainMobilitySections))
        fields(section, draft.mobility, 'es-mob');
      break;
    case 5:
      if (draft.targets.some((t) => t === 'R-N' || t === 'R-E')) {
        for (const section of Object.values(spainRecoverySections))
          fields(section, draft.recovery, 'es-rec');
      }
      if (draft.targets.some((t) => t === 'L' || t === 'E' || t === 'M')) {
        fields(spainLongTermCardFields, draft.longTermCard, 'es-ltc');
      }
      break;
    case 6:
      for (const section of Object.values(spainFreeMovementSections))
        fields(section, draft.freeMovement, 'es-fm');
      if (submitting) {
        order(
          'es-fm-previouslyCohabitedUntil',
          draft.freeMovement.previouslyCohabitedFrom,
          draft.freeMovement.previouslyCohabitedUntil,
        );
      }
      break;
  }
  return errors;
}

export function validateSpainStep(draft: SpainDraft) {
  return checkStep(draft, draft.step, true);
}

export function restoreStoredSpainDraft(
  draft: SpainDraft,
  forResult = false,
): SpainDraft {
  if (!forResult && !draft.completed) return draft;
  const invalid = spainSteps(draft).find(
    ({ step }) => Object.keys(checkStep(draft, step, true)).length > 0,
  );
  const completed = !invalid;
  const step = invalid?.step ?? draft.step;
  return draft.completed === completed && draft.step === step
    ? draft
    : { ...draft, completed, step };
}

function validTargets(value: unknown): value is EsFullTarget[] {
  if (!Array.isArray(value)) return false;
  const seen = new Set<string>();
  return value.every((item) => {
    if (
      typeof item !== 'string' ||
      !ES_FULL_TARGETS.includes(item as EsFullTarget) ||
      seen.has(item)
    )
      return false;
    seen.add(item);
    return true;
  });
}

// Migrate legacy time-only Spain form payloads if opened or imported.
function migrateLegacySpainForm(
  value: Record<string, unknown>,
): SpainDraft | undefined {
  if (
    value.version !== undefined ||
    typeof value.simulationDate !== 'string' ||
    !validDate(value.simulationDate) ||
    !Array.isArray(value.permits) ||
    !Array.isArray(value.trips)
  )
    return undefined;
  if (!ES_NATIONALITY_ROUTES.includes(value.route as EsNationalityRoute))
    return undefined;
  const route = value.route as EsNationalityRoute;
  const married =
    typeof value.marriedOn === 'string' && validDate(value.marriedOn)
      ? value.marriedOn
      : typeof value.marriedToSpaniard === 'string' &&
          validDate(value.marriedToSpaniard)
        ? value.marriedToSpaniard
        : undefined;
  const permits = value.permits.flatMap((row) =>
    isRecord(row) && typeof row.from === 'string' && validDate(row.from)
      ? [
          {
            from: row.from,
            ...(typeof row.to === 'string' && row.to ? { to: row.to } : {}),
            study: row.study === true,
          },
        ]
      : [],
  );
  const trips = value.trips.flatMap((row) =>
    isRecord(row) &&
    typeof row.departed === 'string' &&
    typeof row.returned === 'string' &&
    validDate(row.departed) &&
    validDate(row.returned)
      ? [{ departed: row.departed, returned: row.returned }]
      : [],
  );
  if (
    permits.length !== value.permits.length ||
    trips.length !== value.trips.length
  )
    return undefined;
  return {
    ...createSpainDraft(),
    completed: true,
    simulationDate: value.simulationDate,
    targets: ['L', 'N'],
    timeRecordsComplete: true,
    permits,
    trips,
    route,
    ...(route === 'marriage' && married ? { marriedToSpaniard: married } : {}),
  };
}

export function decodeSpainDraft(
  value: unknown,
  mode: DraftReadMode = false,
): SpainDraft | undefined {
  if (!isRecord(value)) return undefined;
  const legacy = migrateLegacySpainForm(value);
  if (legacy) return decodeSpainDraft(legacy, mode);
  if (
    value.version !== 1 ||
    typeof value.step !== 'number' ||
    !Number.isInteger(value.step) ||
    value.step < 0 ||
    value.step >= titles.length ||
    typeof value.completed !== 'boolean' ||
    typeof value.simulationDate !== 'string' ||
    !validTargets(value.targets) ||
    (value.nationality !== undefined && !isRecord(value.nationality)) ||
    (value.residence !== undefined && !isRecord(value.residence)) ||
    (value.mobility !== undefined && !isRecord(value.mobility)) ||
    (value.recovery !== undefined && !isRecord(value.recovery)) ||
    (value.longTermCard !== undefined && !isRecord(value.longTermCard)) ||
    (value.freeMovement !== undefined && !isRecord(value.freeMovement))
  )
    return undefined;
  const draft: SpainDraft = {
    ...(value as unknown as SpainDraft),
    nationality: (value.nationality as EsNationalityFacts) ?? {},
    residence: (value.residence as EsResidenceFacts) ?? {},
    mobility: (value.mobility as EsMobilityFacts) ?? {},
    recovery: (value.recovery as EsRecoveryFacts) ?? {},
    longTermCard: (value.longTermCard as EsLongTermCardFacts) ?? {},
    freeMovement: (value.freeMovement as EsFreeMovementFacts) ?? {},
  };
  // Answers kept for a deselected route are checked again if it is reselected.
  if (
    spainSteps(draft).some(
      ({ step }) => Object.keys(checkStep(draft, step, false)).length > 0,
    )
  )
    return undefined;
  const restored = restoreStoredSpainDraft(draft, !!mode);
  if (!spainSteps(restored).some(({ step }) => step === restored.step))
    return undefined;
  if (
    !restored.completed &&
    mode !== 'show-correction' &&
    (mode || draft.completed)
  )
    return undefined;
  return restored;
}
