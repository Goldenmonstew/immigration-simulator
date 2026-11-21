import type {
  EsNationalityRoute,
  EsRequest,
  Locale,
} from '@uk-immigration/engine';
import type { TranslationKey } from '../i18n';
import { validDate } from './questionnaire';

export interface EsPermitRow {
  from: string;
  to: string;
  study: boolean;
}

export interface EsTripRow {
  departed: string;
  returned: string;
}

export interface EsForm {
  simulationDate: string;
  permits: EsPermitRow[];
  trips: EsTripRow[];
  route: EsNationalityRoute;
  marriedOn: string;
}

export type EsErrors = Partial<Record<string, TranslationKey>>;

export const emptyEsPermit = (): EsPermitRow => ({
  from: '',
  to: '',
  study: false,
});
export const emptyEsTrip = (): EsTripRow => ({ departed: '', returned: '' });

export function emptyEsForm(today: string): EsForm {
  return {
    simulationDate: today,
    permits: [emptyEsPermit()],
    trips: [],
    route: 'general',
    marriedOn: '',
  };
}

/** Field ids with an error message key; empty when the form can be evaluated. */
export function validateEsForm(form: EsForm): EsErrors {
  const errors: EsErrors = {};
  const date = (id: string, value: string, optional = false) => {
    if (optional && !value) return;
    if (!validDate(value)) errors[id] = 'es.error.date';
  };
  date('es-simulation-date', form.simulationDate);
  if (form.route === 'marriage') date('es-married-on', form.marriedOn);
  form.permits.forEach((permit, i) => {
    date(`es-permit-${i}-from`, permit.from);
    date(`es-permit-${i}-to`, permit.to, true);
    if (validDate(permit.to) && permit.to < permit.from)
      errors[`es-permit-${i}-to`] = 'es.error.order';
  });
  form.trips.forEach((trip, i) => {
    date(`es-trip-${i}-departed`, trip.departed);
    date(`es-trip-${i}-returned`, trip.returned);
    if (validDate(trip.returned) && trip.returned < trip.departed)
      errors[`es-trip-${i}-returned`] = 'es.error.order';
  });
  return errors;
}

export function esRequest(form: EsForm, locale: Locale): EsRequest {
  return {
    simulationDate: form.simulationDate,
    permits: form.permits.map((p) => ({
      from: p.from,
      ...(p.to ? { to: p.to } : {}),
      ...(p.study ? { study: true } : {}),
    })),
    trips: form.trips,
    route: form.route,
    ...(form.route === 'marriage' ? { marriedToSpaniard: form.marriedOn } : {}),
    locale,
  };
}
