import {
  jpStayLimit,
  type JpFullRequest,
  type JpFullNaturalisationRoute,
  type JpFullPrRoute,
  type JpFullReentryRequest,
  type JpPrCommonEvidence,
  type JpNaturalisationEvidence,
} from '@uk-immigration/engine';
import type { TranslationKey } from '../i18n';
import type { CountryDraft } from './country-module';
import { today, validDate } from './questionnaire';
import {
  basicFields,
  tripList,
  prRouteFields,
  natRouteFields,
  travelRouteFields,
  prStatusSections,
  prFilingSections,
  natSections,
  type JapanField,
} from './japan-fields';

export interface JapanDraft
  extends CountryDraft, Omit<JpFullRequest, 'locale'> {
  permanentResidence: { routes: JpFullPrRoute[]; evidence: JpPrCommonEvidence };
  naturalisation: {
    routes: JpFullNaturalisationRoute[];
    evidence: JpNaturalisationEvidence;
  };
  reentry: JpFullReentryRequest[];
}

export function createJapanDraft(): JapanDraft {
  return {
    version: 1,
    step: 0,
    completed: false,
    simulationDate: today(),
    stayStart: '',
    trips: [],
    permanentResidence: { routes: [], evidence: {} },
    naturalisation: { routes: [], evidence: {} },
    reentry: [],
  };
}

const titles = [
  'jp.form.step0',
  'jp.form.step1',
  'jp.form.step2',
  'jp.form.step3',
  'jp.form.step4',
  'jp.form.step5',
  'jp.form.step6',
] as const;
export function japanSteps(draft: JapanDraft) {
  return titles.flatMap((title, step) => {
    const enabled =
      step < 2 ||
      (step <= 4
        ? draft.permanentResidence.routes.length
        : step === 5
          ? draft.naturalisation.routes.length
          : draft.reentry.length);
    return enabled ? [{ step, title }] : [];
  });
}

type Errors = Record<string, TranslationKey>;

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

// The same field definitions describe safe persisted values and the questions shown to users.
// An unfinished draft can contain blank required fields, including a row just added.
function checkFields(
  fields: JapanField[],
  record: object,
  prefix: string,
  required: boolean,
  errors: Errors,
) {
  for (const field of fields) {
    const id = `${prefix}-${field.name}`;
    const value = (record as Record<string, unknown>)[field.name];
    if (
      value === undefined ||
      (value === '' &&
        field.required &&
        (field.type === 'date' || field.type === 'status-date'))
    ) {
      if (required && field.required) errors[id] = 'jp.form.required';
      continue;
    }
    switch (field.type) {
      case 'list':
        if (!Array.isArray(value)) {
          errors[id] = 'jp.form.required';
          break;
        }
        value.forEach((row, i) => {
          if (isRecord(row))
            checkFields(field.fields, row, `${id}-${i}`, required, errors);
          else errors[id] = 'jp.form.required';
        });
        break;
      case 'group':
        if (isRecord(value))
          checkFields(field.fields, value, id, required, errors);
        else errors[id] = 'jp.form.required';
        break;
      case 'choice':
        if (!field.options.some((option) => value === option))
          errors[id] = 'jp.form.required';
        break;
      case 'boolean':
        if (typeof value !== 'boolean') errors[id] = 'jp.form.required';
        break;
      case 'notice':
      case 'status-date':
      case 'date':
        if (field.type === 'notice' && value === null) break;
        if (field.type === 'status-date' && value === 'none') break;
        if (typeof value !== 'string' || !validDate(value))
          errors[id] = 'jp.error.date';
        break;
      case 'period':
      case 'number':
      case 'integer':
        if (field.type === 'period' && value === 'indefinite') break;
        if (
          typeof value !== 'number' ||
          !Number.isFinite(value) ||
          (required && value < 0)
        )
          errors[id] = 'jp.form.numberError';
        else if (
          required &&
          field.type !== 'number' &&
          !Number.isSafeInteger(value)
        )
          errors[id] = 'jp.form.integerError';
        break;
    }
  }
}

function checkStep(draft: JapanDraft, step: number, submitting: boolean) {
  const errors: Errors = {};
  const { permanentResidence: pr, naturalisation: nat, reentry } = draft;
  const fields = (definitions: JapanField[], values: object, prefix: string) =>
    checkFields(definitions, values, prefix, submitting, errors);
  const order = (id: string, start?: string, end?: string) => {
    if (start && end && validDate(start) && validDate(end) && end < start)
      errors[id] = 'jp.error.order';
  };
  switch (step) {
    case 0:
      fields(basicFields, draft, 'jp');
      if (
        submitting &&
        !pr.routes.length &&
        !nat.routes.length &&
        !reentry.length
      )
        errors['jp-route-pr-general'] = 'jp.form.routeError';
      break;
    case 1:
      fields([tripList], draft, 'jp');
      if (!submitting) break;
      draft.trips.forEach((trip, i) => {
        const prefix = 'jp-trips-' + i + '-';
        order(prefix + 'returned', trip.departed, trip.returned);
        if (trip.renewalPending && !trip.stayExpiry)
          errors[prefix + 'stayExpiry'] = 'jp.error.date';
        const limit =
          trip.stayExpiry && validDate(trip.stayExpiry) && jpStayLimit(trip);
        if (limit && validDate(trip.departed) && trip.departed > limit)
          errors[prefix + 'stayExpiry'] = trip.renewalPending
            ? 'jp.error.specialPeriod'
            : 'jp.error.order';
        if (
          draft.trips
            .slice(0, i)
            .some(
              (previous) =>
                trip.departed < previous.returned &&
                previous.departed < trip.returned,
            )
        )
          errors[prefix + 'departed'] = 'jp.error.overlap';
        if (
          pr.routes.some((r) => r.route === 'child-birth') &&
          trip.departure &&
          trip.reentryPermit !== (trip.departure === 'permit')
        )
          errors[prefix + 'departure'] = 'jp.form.tripPermitError';
      });
      break;
    case 2:
      for (const route of pr.routes) {
        const prefix = 'jp-pr-' + route.route;
        fields(prRouteFields[route.route], route, prefix);
        if (
          submitting &&
          (route.route === 'general' ||
            route.route === 'international-protection')
        ) {
          if (
            route.statusStart === 'none' &&
            route.newStatusStart &&
            route.newStatusStart !== 'none'
          )
            errors[prefix + '-newStatusStart'] = 'jp.error.newWithoutOld';
          else if (
            route.newStatusStart &&
            validDate(route.statusStart) &&
            validDate(route.newStatusStart) &&
            route.newStatusStart < route.statusStart
          )
            errors[prefix + '-newStatusStart'] = 'jp.error.newBeforeOld';
          route.excluded?.forEach((row, i) =>
            order(prefix + '-excluded-' + i + '-to', row.from, row.to),
          );
        }
      }
      break;
    case 3:
    case 4:
      for (const section of Object.values(
        step === 3 ? prStatusSections : prFilingSections,
      ))
        fields(section, pr.evidence, 'jp-pr');
      if (submitting && step === 3)
        for (const key of ['affiliationNotices', 'addressNotices'] as const)
          pr.evidence[key]?.forEach((row, i) =>
            order(
              'jp-pr-' + key + '-' + i + '-notifiedOn',
              row.eventOn,
              row.notifiedOn ?? undefined,
            ),
          );
      break;
    case 5:
      for (const route of nat.routes) {
        fields(natRouteFields[route.route], route, 'jp-nat-' + route.route);
        if (
          submitting &&
          route.route === 'general' &&
          route.homeMajorityAge !== undefined &&
          (!Number.isInteger(route.homeMajorityAge) ||
            route.homeMajorityAge < 1 ||
            route.homeMajorityAge > 99)
        )
          errors['jp-nat-general-homeMajorityAge'] = 'jp.error.age';
      }
      for (const section of Object.values(natSections))
        fields(section, nat.evidence, 'jp-nat');
      break;
    case 6:
      for (const route of reentry) {
        const prefix = 'jp-travel-' + route.route;
        fields(travelRouteFields[route.route], route, prefix);
        if (!submitting) continue;
        order(prefix + '-returnOn', route.departureOn, route.returnOn);
        if (
          route.route === 'deemed' &&
          route.declaredIntentAtDeparture !== undefined &&
          (!route.departureOn ||
            route.departureOn > draft.simulationDate ||
            (draft.applicationDate &&
              route.departureOn > draft.applicationDate))
        )
          errors[prefix + '-declaredIntentAtDeparture'] =
            'jp.form.declarationError';
        if (route.route !== 'deemed' && route.permit) {
          order(
            prefix + '-permit-expiresOn',
            route.permit.effectiveOn,
            route.permit.expiresOn,
          );
          order(
            prefix + '-permit-extendedUntil',
            route.permit.expiresOn,
            route.permit.extendedUntil,
          );
        }
      }
      break;
  }
  return errors;
}

export function validateJapanStep(draft: JapanDraft) {
  return checkStep(draft, draft.step, true);
}

function validRoutes(value: unknown, definitions: object) {
  if (!Array.isArray(value)) return false;
  const selected = new Set<string>();
  return value.every((route) => {
    if (
      !isRecord(route) ||
      typeof route.route !== 'string' ||
      !Object.hasOwn(definitions, route.route) ||
      selected.has(route.route)
    )
      return false;
    selected.add(route.route);
    return true;
  });
}

export function decodeJapanDraft(value: unknown): JapanDraft | undefined {
  if (
    !isRecord(value) ||
    value.version !== 1 ||
    typeof value.step !== 'number' ||
    !Number.isInteger(value.step) ||
    value.step < 0 ||
    value.step >= titles.length ||
    typeof value.completed !== 'boolean' ||
    typeof value.simulationDate !== 'string' ||
    typeof value.stayStart !== 'string' ||
    !Array.isArray(value.trips) ||
    !value.trips.every(isRecord) ||
    !isRecord(value.permanentResidence) ||
    !isRecord(value.permanentResidence.evidence) ||
    !validRoutes(value.permanentResidence.routes, prRouteFields) ||
    !isRecord(value.naturalisation) ||
    !isRecord(value.naturalisation.evidence) ||
    !validRoutes(value.naturalisation.routes, natRouteFields) ||
    !validRoutes(value.reentry, travelRouteFields)
  )
    return undefined;
  const draft = value as unknown as JapanDraft;
  if (!japanSteps(draft).some(({ step }) => step === draft.step))
    return undefined;
  // Validate containers before checking date relationships across their rows.
  if (titles.some((_, i) => Object.keys(checkStep(draft, i, false)).length))
    return undefined;
  if (
    draft.completed &&
    japanSteps(draft).some(
      ({ step }) => Object.keys(checkStep(draft, step, true)).length,
    )
  )
    return undefined;
  return draft;
}
