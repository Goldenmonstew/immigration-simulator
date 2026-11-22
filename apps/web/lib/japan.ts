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
  reentryPermit: boolean;
}

export interface JpForm {
  simulationDate: string;
  stayStart: string;
  /** Empty until the user picks the route that applies to them. */
  prRoute: JpPrRoute | '';
  /** The status, recognition or points date the route counts from. */
  statusStart: string;
  /** Spouse routes, for permanent residence and naturalisation alike. */
  marriedOn: string;
  natRoute: JpNaturalisationRoute | '';
  dateOfBirth: string;
  trips: JpTripRow[];
}

export type JpErrors = Partial<Record<string, TranslationKey>>;

export const emptyJpTrip = (): JpTripRow => ({
  departed: '',
  returned: '',
  reentryPermit: false,
});

export function emptyJpForm(today: string): JpForm {
  return {
    simulationDate: today,
    stayStart: '',
    prRoute: '',
    statusStart: '',
    marriedOn: '',
    natRoute: '',
    dateOfBirth: '',
    trips: [],
  };
}

/** Routes that count from a status, recognition or points date. */
export const needsStatusStart = (route: JpForm['prRoute']) =>
  route !== '' && route !== 'spouse' && route !== 'child';

/** Field ids with an error message key; empty when the form can be evaluated. */
export function validateJpForm(form: JpForm): JpErrors {
  const errors: JpErrors = {};
  const date = (id: string, value: string) => {
    if (!validDate(value)) errors[id] = 'jp.error.date';
  };
  date('jp-simulation-date', form.simulationDate);
  date('jp-stay-start', form.stayStart);
  if (!form.prRoute) errors['jp-pr-route'] = 'jp.error.prRoute';
  if (needsStatusStart(form.prRoute)) date('jp-status-start', form.statusStart);
  // One marriage date serves both spouse routes, under the first of them.
  if (form.prRoute === 'spouse') date('jp-married-on', form.marriedOn);
  if (!form.natRoute) errors['jp-nat-route'] = 'jp.error.natRoute';
  if (form.natRoute === 'general') date('jp-date-of-birth', form.dateOfBirth);
  if (form.natRoute === 'spouse' && form.prRoute !== 'spouse')
    date('jp-married-on', form.marriedOn);
  form.trips.forEach((trip, i) => {
    date(`jp-trip-${i}-departed`, trip.departed);
    date(`jp-trip-${i}-returned`, trip.returned);
    if (validDate(trip.returned) && trip.returned < trip.departed)
      errors[`jp-trip-${i}-returned`] = 'jp.error.order';
  });
  return errors;
}

export function jpRequest(form: JpForm, locale: Locale): JpRequest {
  // Validation makes sure both routes and their dates are filled in.
  const pr: JpRequest['pr'] =
    form.prRoute === 'spouse'
      ? { route: 'spouse', marriedOn: form.marriedOn }
      : form.prRoute === 'child'
        ? { route: 'child' }
        : {
            route: form.prRoute as Exclude<JpPrRoute, 'spouse' | 'child'>,
            statusStart: form.statusStart,
          };
  return {
    simulationDate: form.simulationDate,
    stayStart: form.stayStart,
    trips: form.trips.map((t) => ({
      departed: t.departed,
      returned: t.returned,
      ...(t.reentryPermit ? { reentryPermit: true } : {}),
    })),
    pr,
    naturalisation:
      form.natRoute === 'spouse'
        ? { route: 'spouse', marriedOn: form.marriedOn }
        : { route: 'general', dateOfBirth: form.dateOfBirth },
    locale,
  };
}
