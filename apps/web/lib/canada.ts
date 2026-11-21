import type { CaRequest, Locale } from '@uk-immigration/engine';
import type { TranslationKey } from '../i18n';
import { validDate } from './questionnaire';

export interface CaPeriodRow {
  from: string;
  to: string;
}

export interface CaTripRow {
  departed: string;
  returned: string;
}

export interface CaForm {
  simulationDate: string;
  dateOfBirth: string;
  permanentResident: string;
  periods: CaPeriodRow[];
  trips: CaTripRow[];
}

export type CaErrors = Partial<Record<string, TranslationKey>>;

export const emptyCaPeriod = (): CaPeriodRow => ({ from: '', to: '' });
export const emptyCaTrip = (): CaTripRow => ({ departed: '', returned: '' });

export function emptyCaForm(today: string): CaForm {
  return {
    simulationDate: today,
    dateOfBirth: '',
    permanentResident: '',
    periods: [],
    trips: [],
  };
}

/** Field ids with an error message key; empty when the form can be evaluated. */
export function validateCaForm(form: CaForm): CaErrors {
  const errors: CaErrors = {};
  const date = (id: string, value: string, optional = false) => {
    if (optional && !value) return;
    if (!validDate(value)) errors[id] = 'ca.error.date';
  };
  date('ca-simulation-date', form.simulationDate);
  date('ca-date-of-birth', form.dateOfBirth);
  date('ca-permanent-resident', form.permanentResident);
  form.periods.forEach((period, i) => {
    date(`ca-period-${i}-from`, period.from);
    date(`ca-period-${i}-to`, period.to, true);
    if (validDate(period.to) && period.to < period.from)
      errors[`ca-period-${i}-to`] = 'ca.error.order';
    if (validDate(period.from) && period.from >= form.permanentResident)
      errors[`ca-period-${i}-from`] = 'ca.error.afterPr';
  });
  form.trips.forEach((trip, i) => {
    date(`ca-trip-${i}-departed`, trip.departed);
    date(`ca-trip-${i}-returned`, trip.returned);
    if (validDate(trip.returned) && trip.returned < trip.departed)
      errors[`ca-trip-${i}-returned`] = 'ca.error.order';
  });
  return errors;
}

export function caRequest(form: CaForm, locale: Locale): CaRequest {
  return {
    simulationDate: form.simulationDate,
    dateOfBirth: form.dateOfBirth,
    permanentResident: form.permanentResident,
    temporaryPeriods: form.periods.map((p) => ({
      from: p.from,
      ...(p.to ? { to: p.to } : {}),
    })),
    trips: form.trips,
    locale,
  };
}
