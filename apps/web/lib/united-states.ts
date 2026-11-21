import type { Locale, UsConditional, UsRequest } from '@uk-immigration/engine';
import type { TranslationKey } from '../i18n';
import { validDate } from './questionnaire';

export interface UsTripRow {
  departed: string;
  returned: string;
}

export interface UsForm {
  simulationDate: string;
  dateOfBirth: string;
  permanentResident: string;
  conditional: UsConditional;
  stateResidenceFrom: string;
  married: boolean;
  marriedOn: string;
  spouseCitizenSince: string;
  trips: UsTripRow[];
}

export type UsErrors = Partial<Record<string, TranslationKey>>;

export const emptyUsTrip = (): UsTripRow => ({ departed: '', returned: '' });

export function emptyUsForm(today: string): UsForm {
  return {
    simulationDate: today,
    dateOfBirth: '',
    permanentResident: '',
    conditional: 'none',
    stateResidenceFrom: '',
    married: false,
    marriedOn: '',
    spouseCitizenSince: '',
    trips: [],
  };
}

/** Field ids with an error message key; empty when the form can be evaluated. */
export function validateUsForm(form: UsForm): UsErrors {
  const errors: UsErrors = {};
  const date = (id: string, value: string, optional = false) => {
    if (optional && !value) return;
    if (!validDate(value)) errors[id] = 'us.error.date';
  };
  date('us-simulation-date', form.simulationDate);
  date('us-date-of-birth', form.dateOfBirth);
  date('us-permanent-resident', form.permanentResident);
  date('us-state-residence-from', form.stateResidenceFrom, true);
  if (form.married) {
    date('us-married-on', form.marriedOn);
    date('us-spouse-citizen-since', form.spouseCitizenSince, true);
  }
  form.trips.forEach((trip, i) => {
    date(`us-trip-${i}-departed`, trip.departed);
    date(`us-trip-${i}-returned`, trip.returned);
    if (validDate(trip.returned) && trip.returned < trip.departed)
      errors[`us-trip-${i}-returned`] = 'us.error.order';
  });
  return errors;
}

export function usRequest(form: UsForm, locale: Locale): UsRequest {
  return {
    simulationDate: form.simulationDate,
    dateOfBirth: form.dateOfBirth,
    permanentResident: form.permanentResident,
    conditional: form.conditional,
    ...(form.stateResidenceFrom
      ? { stateResidenceFrom: form.stateResidenceFrom }
      : {}),
    ...(form.married
      ? {
          marriage: {
            married: form.marriedOn,
            ...(form.spouseCitizenSince
              ? { spouseCitizenSince: form.spouseCitizenSince }
              : {}),
          },
        }
      : {}),
    trips: form.trips,
    locale,
  };
}
