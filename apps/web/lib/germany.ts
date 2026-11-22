import type {
  DeNaturalisationRoute,
  DePermitKind,
  DeRequest,
  DeSettlementRoute,
  Locale,
} from '@uk-immigration/engine';
import type { TranslationKey } from '../i18n';
import { validDate } from './questionnaire';

export interface DePermitRow {
  kind: DePermitKind;
  from: string;
  to: string;
}

export interface DeTripRow {
  departed: string;
  returned: string;
}

export interface DeForm {
  simulationDate: string;
  permits: DePermitRow[];
  trips: DeTripRow[];
  settlementRoute: DeSettlementRoute;
  trainedInGermany: boolean;
  germanB1: boolean;
  germanC1: boolean;
  /** Months of pension contributions; blank = not entered. */
  contributionMonths: string;
  naturalisationRoute: DeNaturalisationRoute;
  marriedOn: string;
}

export type DeErrors = Partial<Record<string, TranslationKey>>;

export const emptyDePermit = (): DePermitRow => ({
  kind: 'skilled',
  from: '',
  to: '',
});
export const emptyDeTrip = (): DeTripRow => ({ departed: '', returned: '' });

export function emptyDeForm(today: string): DeForm {
  return {
    simulationDate: today,
    permits: [emptyDePermit()],
    trips: [],
    settlementRoute: 'general',
    trainedInGermany: false,
    germanB1: false,
    germanC1: false,
    contributionMonths: '',
    naturalisationRoute: 'general',
    marriedOn: '',
  };
}

/** Field ids with an error message key; empty when the form can be evaluated. */
export function validateDeForm(form: DeForm): DeErrors {
  const errors: DeErrors = {};
  const date = (id: string, value: string, optional = false) => {
    if (optional && !value) return;
    if (!validDate(value)) errors[id] = 'de.error.date';
  };
  date('de-simulation-date', form.simulationDate);
  form.permits.forEach((permit, i) => {
    date(`de-permit-${i}-from`, permit.from);
    date(`de-permit-${i}-to`, permit.to, true);
    if (validDate(permit.to) && permit.to < permit.from)
      errors[`de-permit-${i}-to`] = 'de.error.order';
  });
  form.trips.forEach((trip, i) => {
    date(`de-trip-${i}-departed`, trip.departed);
    date(`de-trip-${i}-returned`, trip.returned);
    if (validDate(trip.returned) && trip.returned < trip.departed)
      errors[`de-trip-${i}-returned`] = 'de.error.order';
  });
  if (form.contributionMonths && !/^\d{1,3}$/.test(form.contributionMonths))
    errors['de-contributions'] = 'de.error.months';
  if (form.naturalisationRoute === 'spouse')
    date('de-married-on', form.marriedOn);
  return errors;
}

export function deRequest(form: DeForm, locale: Locale): DeRequest {
  return {
    simulationDate: form.simulationDate,
    permits: form.permits.map((p) => ({
      kind: p.kind,
      from: p.from,
      ...(p.to ? { to: p.to } : {}),
    })),
    trips: form.trips,
    settlementRoute: form.settlementRoute,
    ...(form.contributionMonths
      ? { contributionMonths: Number(form.contributionMonths) }
      : {}),
    trainedInGermany: form.trainedInGermany,
    germanB1: form.germanB1,
    germanC1: form.germanC1,
    naturalisationRoute: form.naturalisationRoute,
    ...(form.naturalisationRoute === 'spouse'
      ? { marriedOn: form.marriedOn }
      : {}),
    locale,
  };
}
