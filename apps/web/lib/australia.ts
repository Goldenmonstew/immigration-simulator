import type { AuRequest, AuSubclass, Locale } from '@uk-immigration/engine';
import type { TranslationKey } from '../i18n';
import { validDate } from './questionnaire';

export interface AuVisaRow {
  subclass: AuSubclass;
  from: string;
  to: string;
}

export interface AuTripRow {
  departed: string;
  returned: string;
}

export interface AuForm {
  simulationDate: string;
  dateOfBirth: string;
  firstArrival: string;
  visas: AuVisaRow[];
  trips: AuTripRow[];
  sponsoredFullTime: boolean;
  partner: boolean;
  partnerLodged: string;
  partnerStream: 'onshore' | 'offshore';
  longTermRelationship: boolean;
  hongKong: boolean;
  regionalSince: string;
}

export type AuErrors = Partial<Record<string, TranslationKey>>;

export const emptyVisa = (): AuVisaRow => ({
  subclass: '482',
  from: '',
  to: '',
});
export const emptyTrip = (): AuTripRow => ({ departed: '', returned: '' });

export function emptyAuForm(today: string): AuForm {
  return {
    simulationDate: today,
    dateOfBirth: '',
    firstArrival: '',
    visas: [emptyVisa()],
    trips: [],
    sponsoredFullTime: false,
    partner: false,
    partnerLodged: '',
    partnerStream: 'onshore',
    longTermRelationship: false,
    hongKong: false,
    regionalSince: '',
  };
}

/** Field ids with an error message key; empty when the form can be evaluated. */
export function validateAuForm(form: AuForm): AuErrors {
  const errors: AuErrors = {};
  const date = (id: string, value: string, optional = false) => {
    if (optional && !value) return;
    if (!validDate(value)) errors[id] = 'au.error.date';
  };
  date('au-simulation-date', form.simulationDate);
  date('au-date-of-birth', form.dateOfBirth);
  date('au-first-arrival', form.firstArrival, true);
  if (
    validDate(form.firstArrival) &&
    validDate(form.dateOfBirth) &&
    form.firstArrival < form.dateOfBirth
  )
    errors['au-first-arrival'] = 'au.error.beforeBirth';
  form.visas.forEach((visa, i) => {
    date(`au-visa-${i}-from`, visa.from);
    date(`au-visa-${i}-to`, visa.to, true);
    if (validDate(visa.to) && visa.to < visa.from)
      errors[`au-visa-${i}-to`] = 'au.error.order';
  });
  form.trips.forEach((trip, i) => {
    date(`au-trip-${i}-departed`, trip.departed);
    date(`au-trip-${i}-returned`, trip.returned);
    if (validDate(trip.returned) && trip.returned < trip.departed)
      errors[`au-trip-${i}-returned`] = 'au.error.order';
    if (
      validDate(trip.departed) &&
      (!validDate(form.firstArrival) || trip.departed < form.firstArrival)
    )
      errors[`au-trip-${i}-departed`] = 'au.error.beforeArrival';
  });
  if (form.partner) date('au-partner-lodged', form.partnerLodged);
  if (form.hongKong) date('au-regional-since', form.regionalSince, true);
  return errors;
}

export function auRequest(form: AuForm, locale: Locale): AuRequest {
  return {
    simulationDate: form.simulationDate,
    dateOfBirth: form.dateOfBirth,
    ...(form.firstArrival ? { firstArrival: form.firstArrival } : {}),
    visas: form.visas.map((v) => ({
      subclass: v.subclass,
      from: v.from,
      ...(v.to ? { to: v.to } : {}),
    })),
    trips: form.trips,
    sponsoredFullTime: form.sponsoredFullTime,
    ...(form.partner
      ? {
          partnerApplication: {
            lodged: form.partnerLodged,
            stream: form.partnerStream,
            longTermRelationship: form.longTermRelationship,
          },
        }
      : {}),
    ...(form.hongKong
      ? {
          hongKong: form.regionalSince
            ? { regionalSince: form.regionalSince }
            : {},
        }
      : {}),
    locale,
  };
}
