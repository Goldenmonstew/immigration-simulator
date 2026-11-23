import type {
  JpNaturalisationRoute,
  JpPrRoute,
  JpRequest,
  Locale,
} from '@uk-immigration/engine';
import type { TranslationKey } from '../i18n';
import { validDate } from './questionnaire';

export interface JpTripRow {
  departed: string;
  returned: string;
  /** Period of stay held when leaving; blank for permanent residents. */
  stayExpiry: string;
  reentryPermit: boolean;
  /** A renewal applied for before the expiry was pending when leaving. */
  renewalPending: boolean;
}

/** A stay that does not count towards the 10 years. */
export interface JpExcludedRow {
  from: string;
  to: string;
}

export interface JpForm {
  simulationDate: string;
  stayStart: string;
  /** Empty until the user picks the route that applies to them. */
  prRoute: JpPrRoute | '';
  /** The status, recognition or points date the route counts from. */
  statusStart: string;
  /** General route: the start under the new guideline, if different. */
  newStatusStart: string;
  /** General route only. */
  excluded: JpExcludedRow[];
  /** Spouse route for permanent residence: married life from. */
  marriedLifeFrom: string;
  natRoute: JpNaturalisationRoute | '';
  dateOfBirth: string;
  /** Spouse route for naturalisation: the registered marriage. */
  marriedOn: string;
  trips: JpTripRow[];
}

export type JpErrors = Partial<Record<string, TranslationKey>>;

export const emptyJpTrip = (): JpTripRow => ({
  departed: '',
  returned: '',
  stayExpiry: '',
  reentryPermit: false,
  renewalPending: false,
});
export const emptyJpExcluded = (): JpExcludedRow => ({ from: '', to: '' });

export function emptyJpForm(today: string): JpForm {
  return {
    simulationDate: today,
    stayStart: '',
    prRoute: '',
    statusStart: '',
    newStatusStart: '',
    excluded: [],
    marriedLifeFrom: '',
    natRoute: '',
    dateOfBirth: '',
    marriedOn: '',
    trips: [],
  };
}

/** Routes that count from a status, recognition or points date. */
export const needsStatusStart = (route: JpForm['prRoute']) =>
  route !== '' && route !== 'spouse' && route !== 'child';

/** Field ids with an error message key; empty when the form can be evaluated. */
export function validateJpForm(form: JpForm): JpErrors {
  const errors: JpErrors = {};
  const date = (id: string, value: string, optional = false) => {
    if (optional && !value) return;
    if (!validDate(value)) errors[id] = 'jp.error.date';
  };
  /** `later` must not be before `earlier`. */
  const order = (id: string, earlier: string, later: string) => {
    if (validDate(earlier) && validDate(later) && later < earlier)
      errors[id] = 'jp.error.order';
  };
  date('jp-simulation-date', form.simulationDate);
  date('jp-stay-start', form.stayStart);
  if (!form.prRoute) errors['jp-pr-route'] = 'jp.error.prRoute';
  if (needsStatusStart(form.prRoute)) date('jp-status-start', form.statusStart);
  if (form.prRoute === 'general') {
    date('jp-new-status-start', form.newStatusStart, true);
    form.excluded.forEach((row, i) => {
      date(`jp-excluded-${i}-from`, row.from);
      date(`jp-excluded-${i}-to`, row.to);
      order(`jp-excluded-${i}-to`, row.from, row.to);
    });
  }
  if (form.prRoute === 'spouse')
    date('jp-married-life-from', form.marriedLifeFrom);
  if (!form.natRoute) errors['jp-nat-route'] = 'jp.error.natRoute';
  if (form.natRoute === 'general') date('jp-date-of-birth', form.dateOfBirth);
  if (form.natRoute === 'spouse') date('jp-married-on', form.marriedOn);
  form.trips.forEach((trip, i) => {
    date(`jp-trip-${i}-departed`, trip.departed);
    date(`jp-trip-${i}-returned`, trip.returned);
    // A pending renewal only matters against the expiry it extends.
    date(`jp-trip-${i}-stayExpiry`, trip.stayExpiry, !trip.renewalPending);
    order(`jp-trip-${i}-returned`, trip.departed, trip.returned);
    order(`jp-trip-${i}-stayExpiry`, trip.departed, trip.stayExpiry);
    // Overlapping trips would count the same days twice.
    if (
      form.trips
        .slice(0, i)
        .some(
          (t) =>
            validDate(t.returned) &&
            validDate(trip.returned) &&
            trip.departed < t.returned &&
            t.departed < trip.returned,
        )
    )
      errors[`jp-trip-${i}-departed`] = 'jp.error.overlap';
  });
  return errors;
}

export function jpRequest(form: JpForm, locale: Locale): JpRequest {
  // Validation makes sure both routes and their dates are filled in.
  const pr: JpRequest['pr'] =
    form.prRoute === 'spouse'
      ? { route: 'spouse', marriedLifeFrom: form.marriedLifeFrom }
      : form.prRoute === 'child'
        ? { route: 'child' }
        : form.prRoute === 'general'
          ? {
              route: 'general',
              statusStart: form.statusStart,
              ...(form.newStatusStart
                ? { newStatusStart: form.newStatusStart }
                : {}),
              ...(form.excluded.length ? { excluded: form.excluded } : {}),
            }
          : {
              route: form.prRoute as 'teijusha' | 'refugee' | 'hsp70' | 'hsp80',
              statusStart: form.statusStart,
            };
  return {
    simulationDate: form.simulationDate,
    stayStart: form.stayStart,
    trips: form.trips.map((t) => ({
      departed: t.departed,
      returned: t.returned,
      ...(t.stayExpiry ? { stayExpiry: t.stayExpiry } : {}),
      ...(t.reentryPermit ? { reentryPermit: true } : {}),
      ...(t.renewalPending ? { renewalPending: true } : {}),
    })),
    pr,
    naturalisation:
      form.natRoute === 'spouse'
        ? { route: 'spouse', marriedOn: form.marriedOn }
        : { route: 'general', dateOfBirth: form.dateOfBirth },
    locale,
  };
}
