import type {
  IePermissionKind,
  IeRequest,
  IeStamp4Route,
  Locale,
} from '@uk-immigration/engine';
import type { TranslationKey } from '../i18n';
import { validDate } from './questionnaire';

export interface IePermissionRow {
  kind: IePermissionKind;
  from: string;
  to: string;
}

export interface IeTripRow {
  departed: string;
  returned: string;
}

export interface IeForm {
  simulationDate: string;
  permissions: IePermissionRow[];
  trips: IeTripRow[];
  /** Empty when not married to, or a civil partner of, an Irish citizen. */
  marriedOn: string;
  /** Empty until the user picks one ("none" included). */
  stamp4Route: IeStamp4Route | '';
  employmentStart: string;
}

export type IeErrors = Partial<Record<string, TranslationKey>>;

/** Routes counted from the day work started on the permit. */
export const fromEmployment = (route: IeForm['stamp4Route']) =>
  route === 'csep' || route === 'gep';

export const emptyIePermission = (): IePermissionRow => ({
  kind: 'stamp1',
  from: '',
  to: '',
});
export const emptyIeTrip = (): IeTripRow => ({ departed: '', returned: '' });

export function emptyIeForm(today: string): IeForm {
  return {
    simulationDate: today,
    permissions: [emptyIePermission()],
    trips: [],
    marriedOn: '',
    stamp4Route: '',
    employmentStart: '',
  };
}

/** Field ids with an error message key; empty when the form can be evaluated. */
export function validateIeForm(form: IeForm): IeErrors {
  const errors: IeErrors = {};
  const date = (id: string, value: string, optional = false) => {
    if (optional && !value) return;
    if (!validDate(value)) errors[id] = 'ie.error.date';
  };
  date('ie-simulation-date', form.simulationDate);
  form.permissions.forEach((p, i) => {
    date(`ie-permit-${i}-from`, p.from);
    date(`ie-permit-${i}-to`, p.to, true);
    if (validDate(p.to) && p.to < p.from)
      errors[`ie-permit-${i}-to`] = 'ie.error.order';
  });
  form.trips.forEach((trip, i) => {
    date(`ie-trip-${i}-departed`, trip.departed);
    date(`ie-trip-${i}-returned`, trip.returned);
    if (validDate(trip.returned) && trip.returned < trip.departed)
      errors[`ie-trip-${i}-returned`] = 'ie.error.order';
  });
  date('ie-married-on', form.marriedOn, true);
  if (!form.stamp4Route) errors['ie-stamp4-route'] = 'ie.error.route';
  if (fromEmployment(form.stamp4Route))
    date('ie-employment-start', form.employmentStart);
  return errors;
}

export function ieRequest(form: IeForm, locale: Locale): IeRequest {
  return {
    simulationDate: form.simulationDate,
    permissions: form.permissions.map((p) => ({
      kind: p.kind,
      from: p.from,
      ...(p.to ? { to: p.to } : {}),
    })),
    trips: form.trips,
    ...(form.marriedOn ? { marriedOn: form.marriedOn } : {}),
    // Validation makes sure a route was picked.
    stamp4Route: form.stamp4Route as IeStamp4Route,
    ...(fromEmployment(form.stamp4Route)
      ? { employmentStart: form.employmentStart }
      : {}),
    locale,
  };
}
