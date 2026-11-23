import type {
  Locale,
  PtNationalityRoute,
  PtPermitKind,
  PtRequest,
} from '@uk-immigration/engine';
import { portugal2026_11 as pt } from '@uk-immigration/policy-data';
import type { TranslationKey } from '../i18n';
import { validDate } from './questionnaire';

export interface PtPermitRow {
  kind: PtPermitKind;
  from: string;
  to: string;
}

export interface PtTripRow {
  departed: string;
  returned: string;
}

export interface PtForm {
  simulationDate: string;
  permits: PtPermitRow[];
  trips: PtTripRow[];
  /** Empty until the user picks the group that applies to them. */
  route: PtNationalityRoute | '';
  /** A naturalisation application was pending when the new law came in. */
  pending: boolean;
  appliedOn: string;
  residenceApplied: string;
}

export type PtErrors = Partial<Record<string, TranslationKey>>;

export const emptyPtPermit = (): PtPermitRow => ({
  kind: 'temporary',
  from: '',
  to: '',
});
export const emptyPtTrip = (): PtTripRow => ({ departed: '', returned: '' });

export function emptyPtForm(today: string): PtForm {
  return {
    simulationDate: today,
    permits: [emptyPtPermit()],
    trips: [],
    route: '',
    pending: false,
    appliedOn: '',
    residenceApplied: '',
  };
}

/** Field ids with an error message key; empty when the form can be evaluated. */
export function validatePtForm(form: PtForm): PtErrors {
  const errors: PtErrors = {};
  const date = (id: string, value: string, optional = false) => {
    if (optional && !value) return;
    if (!validDate(value)) errors[id] = 'pt.error.date';
  };
  date('pt-simulation-date', form.simulationDate);
  form.permits.forEach((permit, i) => {
    date(`pt-permit-${i}-from`, permit.from);
    date(`pt-permit-${i}-to`, permit.to, true);
    if (validDate(permit.to) && permit.to < permit.from)
      errors[`pt-permit-${i}-to`] = 'pt.error.order';
  });
  form.trips.forEach((trip, i) => {
    date(`pt-trip-${i}-departed`, trip.departed);
    date(`pt-trip-${i}-returned`, trip.returned);
    if (validDate(trip.returned) && trip.returned < trip.departed)
      errors[`pt-trip-${i}-returned`] = 'pt.error.order';
  });
  if (!form.route) errors['pt-route'] = 'pt.error.route';
  if (form.pending) {
    date('pt-applied-on', form.appliedOn);
    const applied = validDate(form.appliedOn) && form.appliedOn;
    // Applied on the day the new law came in is left open (PD-143).
    if (applied && applied > pt.values.lawInForce.value)
      errors['pt-applied-on'] = 'pt.error.pendingDate';
    else if (applied && applied > form.simulationDate)
      errors['pt-applied-on'] = 'pt.error.afterSimulation';
    date('pt-residence-applied', form.residenceApplied, true);
  }
  return errors;
}

export function ptRequest(form: PtForm, locale: Locale): PtRequest {
  return {
    simulationDate: form.simulationDate,
    permits: form.permits.map((p) => ({
      kind: p.kind,
      from: p.from,
      ...(p.to ? { to: p.to } : {}),
    })),
    trips: form.trips,
    // Validation makes sure a route was picked.
    route: form.route as PtNationalityRoute,
    ...(form.pending
      ? {
          pendingApplication: form.appliedOn,
          ...(form.residenceApplied
            ? { residenceApplied: form.residenceApplied }
            : {}),
        }
      : {}),
    locale,
  };
}
