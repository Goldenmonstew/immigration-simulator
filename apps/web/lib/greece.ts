import type {
  GrNationalityRoute,
  GrPermitKind,
  GrRequest,
  Locale,
} from '@uk-immigration/engine';
import type { TranslationKey } from '../i18n';
import { validDate } from './questionnaire';

export interface GrPermitRow {
  kind: GrPermitKind;
  from: string;
  to: string;
}

export interface GrTripRow {
  departed: string;
  returned: string;
}

export interface GrForm {
  simulationDate: string;
  dateOfBirth: string;
  permits: GrPermitRow[];
  trips: GrTripRow[];
  route: GrNationalityRoute;
}

export type GrErrors = Partial<Record<string, TranslationKey>>;

export const emptyGrPermit = (): GrPermitRow => ({
  kind: 'regular',
  from: '',
  to: '',
});
export const emptyGrTrip = (): GrTripRow => ({ departed: '', returned: '' });

export function emptyGrForm(today: string): GrForm {
  return {
    simulationDate: today,
    dateOfBirth: '',
    permits: [emptyGrPermit()],
    trips: [],
    route: 'general',
  };
}

/** Field ids with an error message key; empty when the form can be evaluated. */
export function validateGrForm(form: GrForm): GrErrors {
  const errors: GrErrors = {};
  const date = (id: string, value: string, optional = false) => {
    if (optional && !value) return;
    if (!validDate(value)) errors[id] = 'gr.error.date';
  };
  date('gr-simulation-date', form.simulationDate);
  date('gr-date-of-birth', form.dateOfBirth);
  form.permits.forEach((permit, i) => {
    date(`gr-permit-${i}-from`, permit.from);
    date(`gr-permit-${i}-to`, permit.to, true);
    if (validDate(permit.to) && permit.to < permit.from)
      errors[`gr-permit-${i}-to`] = 'gr.error.order';
  });
  form.trips.forEach((trip, i) => {
    date(`gr-trip-${i}-departed`, trip.departed);
    date(`gr-trip-${i}-returned`, trip.returned);
    if (validDate(trip.returned) && trip.returned < trip.departed)
      errors[`gr-trip-${i}-returned`] = 'gr.error.order';
  });
  return errors;
}

export function grRequest(form: GrForm, locale: Locale): GrRequest {
  return {
    simulationDate: form.simulationDate,
    dateOfBirth: form.dateOfBirth,
    permits: form.permits.map((p) => ({
      kind: p.kind,
      from: p.from,
      ...(p.to ? { to: p.to } : {}),
    })),
    trips: form.trips,
    route: form.route,
    locale,
  };
}
