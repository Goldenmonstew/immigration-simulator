import type {
  DeNaturalisationRoute,
  DePermitKind,
  DeRequest,
  DeSettlementRoute,
  Locale,
} from '@uk-immigration/engine';
import { DE_UNLIMITED_KINDS } from '@uk-immigration/engine';
import type { TranslationKey } from '../i18n';
import { validDate } from './questionnaire';

/** Settlement and EU long-term residence have no end date to enter. */
export const hasEndDate = (kind: DePermitKind) =>
  !DE_UNLIMITED_KINDS.includes(kind);

/**
 * § 20 Abs. 2 and § 20a Abs. 5: permits with a statutory maximum, so a
 * blank end date would run on past it; the error when it is left blank.
 */
export const endDateRequired = (
  kind: DePermitKind,
): TranslationKey | undefined =>
  kind === 'job-seeking'
    ? 'de.error.jobSeekingEnd'
    : kind === 'opportunity-card' || kind === 'follow-up-card'
      ? 'de.error.opportunityCardEnd'
      : undefined;

export interface DePermitRow {
  kind: DePermitKind;
  from: string;
  to: string;
  /** Renewal applied for before the end date (§ 81 Abs. 4). */
  renewing: boolean;
}

export interface DeTripRow {
  departed: string;
  returned: string;
}

export interface DeForm {
  simulationDate: string;
  firstEntry: string;
  permits: DePermitRow[];
  trips: DeTripRow[];
  settlementRoute: DeSettlementRoute;
  trainedInGermany: boolean;
  germanB1: boolean;
  germanC1: boolean;
  /** Months of pension contributions; blank = not entered. */
  contributionMonths: string;
  /** Months of Blue Card employment with contributions; blank = not entered. */
  blueCardMonths: string;
  naturalisationRoute: DeNaturalisationRoute;
  marriedOn: string;
  /** Blank = the spouse was German throughout. */
  spouseGermanSince: string;
}

/** Settlement routes that ask for pension contribution months. */
export const contributionRoute = (route: DeSettlementRoute) =>
  route === 'general' || route === 'skilled';

export type DeErrors = Partial<Record<string, TranslationKey>>;

export const emptyDePermit = (): DePermitRow => ({
  kind: 'skilled',
  from: '',
  to: '',
  renewing: false,
});
export const emptyDeTrip = (): DeTripRow => ({ departed: '', returned: '' });

export function emptyDeForm(today: string): DeForm {
  return {
    simulationDate: today,
    firstEntry: '',
    permits: [emptyDePermit()],
    trips: [],
    settlementRoute: 'general',
    trainedInGermany: false,
    germanB1: false,
    germanC1: false,
    contributionMonths: '',
    blueCardMonths: '',
    naturalisationRoute: 'general',
    marriedOn: '',
    spouseGermanSince: '',
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
  date('de-first-entry', form.firstEntry);
  form.permits.forEach((permit, i) => {
    date(`de-permit-${i}-from`, permit.from);
    if (!hasEndDate(permit.kind)) return;
    const capped = endDateRequired(permit.kind);
    if (capped && !permit.to) errors[`de-permit-${i}-to`] = capped;
    else date(`de-permit-${i}-to`, permit.to, true);
    if (validDate(permit.to) && permit.to < permit.from)
      errors[`de-permit-${i}-to`] = 'de.error.order';
  });
  form.trips.forEach((trip, i) => {
    date(`de-trip-${i}-departed`, trip.departed);
    date(`de-trip-${i}-returned`, trip.returned);
    if (validDate(trip.returned) && trip.returned < trip.departed)
      errors[`de-trip-${i}-returned`] = 'de.error.order';
  });
  const months = (id: string, value: string) => {
    if (value && !/^\d{1,3}$/.test(value)) errors[id] = 'de.error.months';
  };
  if (contributionRoute(form.settlementRoute))
    months('de-contributions', form.contributionMonths);
  if (form.settlementRoute === 'blue-card')
    months('de-blue-card-months', form.blueCardMonths);
  if (form.naturalisationRoute === 'spouse') {
    date('de-married-on', form.marriedOn);
    date('de-spouse-german-since', form.spouseGermanSince, true);
  }
  return errors;
}

export function deRequest(form: DeForm, locale: Locale): DeRequest {
  return {
    simulationDate: form.simulationDate,
    firstEntry: form.firstEntry,
    permits: form.permits.map((p) => ({
      kind: p.kind,
      from: p.from,
      ...(p.to && hasEndDate(p.kind) ? { to: p.to } : {}),
      ...(p.renewing && hasEndDate(p.kind) ? { renewing: true } : {}),
    })),
    trips: form.trips,
    settlementRoute: form.settlementRoute,
    ...(contributionRoute(form.settlementRoute) && form.contributionMonths
      ? { contributionMonths: Number(form.contributionMonths) }
      : {}),
    ...(form.settlementRoute === 'blue-card' && form.blueCardMonths
      ? { blueCardEmploymentMonths: Number(form.blueCardMonths) }
      : {}),
    trainedInGermany: form.trainedInGermany,
    germanB1: form.germanB1,
    germanC1: form.germanC1,
    naturalisationRoute: form.naturalisationRoute,
    ...(form.naturalisationRoute === 'spouse'
      ? {
          marriedOn: form.marriedOn,
          ...(form.spouseGermanSince
            ? { spouseGermanSince: form.spouseGermanSince }
            : {}),
        }
      : {}),
    locale,
  };
}
