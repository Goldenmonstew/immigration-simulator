import {
  clearJapanPrFilingEvidence,
  clearJapanTalentMaintenance,
  isJapanReturnComparison,
  japanOrdinaryFiling,
  japanTalentHistoricalDate,
  nextCounterFilingDay,
  japanTripReturnOn,
  jpStayLimit,
  sameJapanTrip,
  shareJapanTripAnswers,
  type JpFullRequest,
  type JpFullNaturalisationRoute,
  type JpFullPrRoute,
  type JpFullReentryRequest,
  type JpPrCommonEvidence,
  type JpNaturalisationEvidence,
} from '@uk-immigration/engine';
import { readJapanAnswers } from './japan-stored-answers';
import type { TranslationKey } from '../i18n';
import type { CountryDraft, DraftReadMode } from './country-module';
import { today, validDate } from './questionnaire';
import {
  basicFields,
  tripList,
  prRouteFields,
  natRouteFields,
  travelRouteFields,
  prStatusSections,
  prFilingSections,
  natSections,
  type JapanField,
} from './japan-fields';

interface JapanReturnRecord {
  // A return entered as a past fact in the questionnaire, independent of what-if dates.
  recordedReturnOn?: string;
}

export interface JapanDraft
  extends CountryDraft, Omit<JpFullRequest, 'locale'> {
  answerFormat?: 'explicit';
  hypotheticalFiling?: true;
  trips: (JpFullRequest['trips'][number] & JapanReturnRecord)[];
  permanentResidence: { routes: JpFullPrRoute[]; evidence: JpPrCommonEvidence };
  naturalisation: {
    routes: JpFullNaturalisationRoute[];
    evidence: JpNaturalisationEvidence;
  };
  reentry: (JpFullReentryRequest &
    JapanReturnRecord & {
      // Null records an explicit "to confirm"; older drafts can omit the question.
      alreadyDeparted?: boolean | null;
      declarationForDepartureOn?: string;
    })[];
}

export function createJapanDraft(): JapanDraft {
  return {
    version: 1,
    answerFormat: 'explicit',
    step: 0,
    completed: false,
    simulationDate: today(),
    stayStart: '',
    trips: [],
    permanentResidence: { routes: [], evidence: {} },
    naturalisation: { routes: [], evidence: {} },
    reentry: [],
  };
}

type Dates = Pick<JapanDraft, 'simulationDate' | 'applicationDate'>;
type Ordinary = Extract<JpFullReentryRequest, { route: 'ordinary' }>;
const requestedDay = (draft: Dates) =>
  draft.applicationDate ?? draft.simulationDate;

export function changedJapanAnswer(previous: unknown, next: unknown) {
  return previous !== undefined && previous !== '' && previous !== next;
}

export function ordinaryFilingDays(draft: Dates, route: Ordinary) {
  const requested = requestedDay(draft);
  if (!validDate(requested)) return undefined;
  return japanOrdinaryFiling(route, draft.simulationDate, requested);
}

export function residenceFilingDay(draft: Dates) {
  const requested = requestedDay(draft);
  return validDate(requested)
    ? nextCounterFilingDay(requested).date
    : undefined;
}

// Legacy shares contain bare booleans for the originally requested date.
export function ordinaryAnswersForDate(
  draft: Dates,
  route: Ordinary,
  previous = draft,
  original = route,
): Ordinary {
  const days = ordinaryFilingDays(draft, route);
  const recorded = ordinaryFilingDays(previous, original);
  if (route.lawfulStatus !== undefined) {
    if (
      changedJapanAnswer(
        original.lawfulStatusOn ?? recorded?.statusEvidenceOn,
        days?.statusDate,
      )
    )
      route = { ...route, lawfulStatus: undefined, lawfulStatusOn: undefined };
    else if (days && days.statusEvidenceOn !== days.statusDate)
      route = { ...route, lawfulStatusOn: days.statusDate };
  }
  if (
    route.inJapanWhenApplying !== undefined ||
    route.excludedStatusOrDetention !== undefined
  ) {
    if (
      changedJapanAnswer(
        original.filingEvidenceOn ?? recorded?.filingEvidenceOn,
        days?.date,
      )
    )
      route = {
        ...route,
        inJapanWhenApplying: undefined,
        excludedStatusOrDetention: undefined,
        filingEvidenceOn: undefined,
      };
    else if (days && days.filingEvidenceOn !== days.date)
      route = { ...route, filingEvidenceOn: days.date };
  }
  return route;
}

export function datedJapanAnswers(
  draft: JapanDraft,
  previous = draft,
): JapanDraft {
  const reentry = draft.reentry.map((route) => {
    // Older comparisons sometimes kept only the independently recorded return.
    if (
      route.recordedReturnOn &&
      validDate(route.recordedReturnOn) &&
      route.recordedReturnOn !== route.returnOn &&
      !isJapanReturnComparison(route)
    )
      route = { ...route, comparisonHistoryReturnOn: route.recordedReturnOn };
    if (route.route !== 'ordinary') return route;
    if (changedJapanAnswer(requestedDay(previous), requestedDay(draft)))
      route = { ...route, onlineConcurrentEligibleApplication: undefined };
    return ordinaryAnswersForDate(draft, route, previous);
  });
  if (reentry.some((route, i) => route !== draft.reentry[i]))
    draft = { ...draft, reentry };
  if (!hasJapanResidenceRoute(draft)) return draft;
  const day = residenceFilingDay(draft);
  if (
    !changedJapanAnswer(
      previous.residenceEvidenceOn ?? requestedDay(previous),
      day,
    )
  ) {
    return day !== (draft.residenceEvidenceOn ?? requestedDay(draft))
      ? { ...draft, residenceEvidenceOn: day }
      : draft;
  }
  const pr = draft.permanentResidence;
  const nat = draft.naturalisation;
  return {
    ...draft,
    residenceEvidenceOn: day,
    permanentResidence: {
      ...pr,
      routes: pr.routes.map((route) => {
        const next = clearJapanTalentMaintenance(route);
        if (
          (next.route === 'hsp70' ||
            next.route === 'hsp80' ||
            next.route === 'j-skip') &&
          changedJapanAnswer(requestedDay(previous), requestedDay(draft))
        ) {
          const past = day && japanTalentHistoricalDate(next.route, day);
          return {
            ...next,
            current: changedJapanAnswer(next.current?.on, day)
              ? undefined
              : next.current,
            historical: changedJapanAnswer(next.historical?.on, past)
              ? undefined
              : next.historical,
          };
        }
        return next;
      }),
      evidence: clearJapanPrFilingEvidence(pr.evidence),
    },
    naturalisation: {
      ...nat,
      routes: nat.routes.map((route) =>
        route.route === 'spouse'
          ? { ...route, stillJapaneseSpouse: undefined }
          : route,
      ),
      evidence: {
        ...nat.evidence,
        inJapan: undefined,
        lawfulDomicile: undefined,
      },
    },
  };
}

export function withJapanFilingDate(
  draft: JapanDraft,
  applicationDate: string | undefined,
  simulationDate = draft.simulationDate,
): JapanDraft {
  return datedJapanAnswers(
    clearUnconfirmedJapanDeclaration({
      ...draft,
      simulationDate,
      applicationDate,
      hypotheticalFiling:
        applicationDate === draft.applicationDate
          ? draft.hypotheticalFiling
          : undefined,
    }),
    draft,
  );
}

export function hasJapanResidenceRoute(draft: JapanDraft): boolean {
  return !!(
    draft.permanentResidence.routes.length || draft.naturalisation.routes.length
  );
}

function hasRecordedJapanReturn(
  draft: JapanDraft,
  route: JapanDraft['reentry'][number],
  asOf: string,
) {
  const duringTrip = (on?: string) =>
    !!on &&
    validDate(on) &&
    !!route.departureOn &&
    route.departureOn <= on &&
    on <= asOf;
  const hasReturnFact = (
    record: JapanReturnRecord & { newLandingOn?: string },
  ) => duringTrip(record.newLandingOn) || duringTrip(record.recordedReturnOn);
  if (hasReturnFact(route)) return true;
  if (
    hasJapanResidenceRoute(draft) &&
    draft.trips.some(
      (trip) => sameJapanTrip(trip, route) && hasReturnFact(trip),
    )
  )
    return true;
  return draft.reentry.some(
    (other) =>
      sameJapanTrip(
        { departed: other.departureOn, returned: japanTripReturnOn(other) },
        route,
      ) && hasReturnFact(other),
  );
}

export function japanDepartureStatus(
  draft: JapanDraft,
  route: JapanDraft['reentry'][number],
) {
  const { departureOn, alreadyDeparted } = route;
  const current = today();
  const asOf = draft.simulationDate < current ? draft.simulationDate : current;
  const due = !!departureOn && departureOn <= asOf;
  const legacyDateOnly =
    draft.answerFormat === undefined && alreadyDeparted === undefined;
  const actualDeclaration =
    due &&
    !legacyDateOnly &&
    alreadyDeparted !== false &&
    route.route === 'deemed' &&
    typeof route.declaredIntentAtDeparture === 'boolean' &&
    route.declarationForDepartureOn === departureOn;
  const recordedReturn = due && hasRecordedJapanReturn(draft, route, asOf);
  const departed =
    due &&
    (alreadyDeparted ??
      (actualDeclaration ||
        (legacyDateOnly && departureOn < asOf) ||
        recordedReturn));
  const pending = due && !legacyDateOnly && !departed && departureOn < current;
  return {
    date: departureOn,
    departed,
    conflictingReturn: alreadyDeparted === false && recordedReturn,
    actualDeclaration,
    askIfDeparted: due && (departureOn === asOf || !legacyDateOnly),
    hint: departed
      ? 'jp.result.confirmDeparture'
      : pending
        ? 'jp.result.unconfirmedDeparture'
        : 'jp.result.plannedDeparture',
  } as const;
}

// A date-tagged answer from an older draft could still describe a planned departure.
export function clearUnconfirmedJapanDeclaration(
  draft: JapanDraft,
): JapanDraft {
  const deemed = Array.isArray(draft.reentry)
    ? draft.reentry.find((route) => route?.route === 'deemed')
    : undefined;
  if (
    deemed?.declaredIntentAtDeparture === undefined ||
    japanDepartureStatus(draft, deemed).actualDeclaration
  )
    return draft;
  return {
    ...draft,
    reentry: draft.reentry.map((route) =>
      route === deemed
        ? {
            ...deemed,
            declaredIntentAtDeparture: undefined,
            declarationForDepartureOn: undefined,
          }
        : route,
    ),
  };
}

const titles = [
  'jp.form.step0',
  'jp.form.step1',
  'jp.form.step2',
  'jp.form.step3',
  'jp.form.step4',
  'jp.form.step5',
  'jp.form.step6',
] as const;
export function japanSteps(draft: JapanDraft) {
  return titles.flatMap((title, step) => {
    const enabled =
      step === 0 ||
      (step === 1
        ? hasJapanResidenceRoute(draft)
        : step <= 4
          ? draft.permanentResidence.routes.length
          : step === 5
            ? draft.naturalisation.routes.length
            : draft.reentry.length);
    return enabled ? [{ step, title }] : [];
  });
}

// The local questionnaire may keep answers for a route the user deselected.
// Only evidence from currently visible steps can leave that editing context.
export function activeJapanAnswers(draft: JapanDraft): JapanDraft {
  draft = datedJapanAnswers(draft);
  const visible = japanSteps(draft).map(({ step }) => step);
  const history = visible.includes(1);
  const trips = history ? draft.trips : [];
  const deemed = draft.reentry.find((route) => route.route === 'deemed');
  return {
    ...draft,
    stayStart: history ? draft.stayStart : '',
    trips: trips.map((trip) => {
      if (
        trip.reentryStayExpiry === undefined ||
        (deemed && sameJapanTrip(trip, deemed))
      )
        return trip;
      const active = { ...trip };
      delete active.reentryStayExpiry;
      return active;
    }),
    permanentResidence: visible.includes(2)
      ? draft.permanentResidence
      : { routes: [], evidence: {} },
    naturalisation: visible.includes(5)
      ? draft.naturalisation
      : { routes: [], evidence: {} },
    reentry: draft.reentry.map((route) => {
      if (trips.some((trip) => sameJapanTrip(trip, route))) return route;
      const active = { ...route };
      // The original return distinguishes trips leaving on the same day even
      // when a hypothetical return now coincides with a different record.
      const anotherRecordOnDeparture =
        route.departureOn &&
        (trips.some((trip) => trip.departed === route.departureOn) ||
          draft.reentry.some(
            (other) =>
              other !== route && other.departureOn === route.departureOn,
          ));
      if (!anotherRecordOnDeparture && route.departureOn) {
        // The departure date stands on its own. Keep the return hypothetical
        // even when no other record needs its original date for matching.
        if (route.returnOn && isJapanReturnComparison(route))
          active.hypotheticalReturn = true;
        delete active.comparisonHistoryReturnOn;
      }
      if (active.route === 'deemed') delete active.historyStayExpiry;
      return active;
    }),
  };
}

type Errors = Record<string, TranslationKey>;

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

// The same field definitions describe safe persisted values and the questions shown to users.
// An unfinished draft can contain blank required fields, including a row just added.
function checkFields(
  fields: JapanField[],
  record: object,
  prefix: string,
  required: boolean,
  errors: Errors,
  simulationDate?: string,
) {
  const answers = record as Record<string, unknown>;
  for (const field of fields) {
    const id = `${prefix}-${field.name}`;
    const value = answers[field.name];
    if (
      value === undefined ||
      (value === '' &&
        field.required &&
        (field.type === 'date' || field.type === 'status-date'))
    ) {
      if (required && field.required) errors[id] = 'jp.form.required';
      continue;
    }
    switch (field.type) {
      case 'list':
        if (!Array.isArray(value)) {
          errors[id] = 'jp.form.required';
          break;
        }
        value.forEach((row, i) => {
          if (isRecord(row))
            checkFields(
              field.fields,
              row,
              `${id}-${i}`,
              required,
              errors,
              simulationDate,
            );
          else errors[id] = 'jp.form.required';
        });
        break;
      case 'group':
        if (isRecord(value))
          checkFields(
            field.fields,
            value,
            id,
            required,
            errors,
            simulationDate,
          );
        else errors[id] = 'jp.form.required';
        break;
      case 'choice':
        if (!field.options.some((option) => value === option))
          errors[id] = 'jp.form.required';
        break;
      case 'boolean':
        if (field.name === 'alreadyDeparted' && value === null) break;
        if (typeof value !== 'boolean') errors[id] = 'jp.form.required';
        break;
      case 'notice':
      case 'status-date':
      case 'date':
        // Shared comparisons can store a pending trip decision as null.
        if (
          id.startsWith('jp-trips-') &&
          field.name === 'renewalDecisionOn' &&
          value === null
        )
          break;
        if (field.type === 'notice' && value === null) break;
        if (field.type === 'status-date' && value === 'none') break;
        if (typeof value !== 'string' || !validDate(value))
          errors[id] = 'jp.error.date';
        else if (
          simulationDate &&
          value > simulationDate &&
          (field.actualDate === true ||
            (field.actualDate && answers[field.actualDate] === true))
        )
          errors[id] = 'jp.error.futureFact';
        break;
      case 'period':
      case 'number':
      case 'integer':
        if (field.type === 'period' && value === 'indefinite') break;
        if (
          typeof value !== 'number' ||
          !Number.isFinite(value) ||
          (required && value < 0)
        )
          errors[id] = 'jp.form.numberError';
        else if (
          required &&
          field.type !== 'number' &&
          !Number.isSafeInteger(value)
        )
          errors[id] = 'jp.form.integerError';
        break;
    }
  }
}

function checkTripRenewals(draft: JapanDraft, step: number, errors: Errors) {
  const records = [
    ...draft.trips.map((trip, index) => ({
      departed: trip.departed,
      returned: trip.returned,
      pending: trip.renewalPending,
      decision: trip.renewalDecisionOn,
      pendingField: `jp-trips-${index}-renewalPending`,
      decisionField: `jp-trips-${index}-renewalDecisionOn`,
      step: 1,
    })),
    ...draft.reentry.map((route) => ({
      departed: route.departureOn,
      returned: japanTripReturnOn(route),
      pending: route.timelyRenewalPending,
      decision: route.renewalDecisionOn,
      pendingField: `jp-travel-${route.route}-timelyRenewalPending`,
      decisionField: `jp-travel-${route.route}-renewalDecisionOn`,
      step: 6,
    })),
  ];
  // Check the entered answers themselves, even when conflicting copies cannot be shared.
  for (const decided of records) {
    if (
      !decided.decision ||
      !validDate(decided.decision) ||
      !decided.departed ||
      !validDate(decided.departed) ||
      decided.decision >= decided.departed
    )
      continue;
    for (const pending of records) {
      if (pending.pending !== true) continue;
      if (
        decided !== pending &&
        (!decided.returned ||
          !validDate(decided.returned) ||
          pending.departed !== decided.departed ||
          pending.returned !== decided.returned)
      )
        continue;
      if (decided.step === step)
        errors[decided.decisionField] ??= 'jp.error.renewalBeforeDeparture';
      if (pending.step === step)
        errors[pending.pendingField] ??= 'jp.error.renewalBeforeDeparture';
    }
  }
}

function checkStep(
  stored: JapanDraft,
  step: number,
  submitting: boolean,
  checkActualDates = submitting,
) {
  const errors: Errors = {};
  const draft = checkActualDates ? activeJapanAnswers(stored) : stored;
  const { permanentResidence: pr, naturalisation: nat } = draft;
  const { trips, reentry } =
    checkActualDates && (step === 1 || step === 6)
      ? shareJapanTripAnswers(draft.trips, draft.reentry)
      : draft;
  const asOf =
    checkActualDates && validDate(draft.simulationDate)
      ? draft.simulationDate
      : undefined;
  if (asOf && (step === 0 || step === 6)) {
    const ordinary = reentry.find((route) => route.route === 'ordinary');
    const requested = draft.applicationDate ?? asOf;
    if (
      ordinary?.permit?.effectiveOn &&
      validDate(ordinary.permit.effectiveOn) &&
      validDate(requested) &&
      japanOrdinaryFiling(ordinary, asOf, requested).afterEffectiveDate
    )
      errors[
        step === 0
          ? 'jp-applicationDate'
          : 'jp-travel-ordinary-permit-effectiveOn'
      ] = 'jp.error.filingAfterPermit';
  }
  const fields = (definitions: JapanField[], values: object, prefix: string) =>
    checkFields(definitions, values, prefix, submitting, errors, asOf);
  const order = (id: string, start?: string, end?: string) => {
    if (start && end && validDate(start) && validDate(end) && end < start)
      errors[id] ??= 'jp.error.order';
  };
  switch (step) {
    case 0:
      fields(basicFields(hasJapanResidenceRoute(draft)), draft, 'jp');
      if (
        submitting &&
        !pr.routes.length &&
        !nat.routes.length &&
        !reentry.length
      )
        errors['jp-routes'] = 'jp.form.routeError';
      break;
    case 1:
      fields([tripList], { trips }, 'jp');
      if (!submitting) break;
      trips.forEach((trip, i) => {
        const prefix = 'jp-trips-' + i + '-';
        order(prefix + 'returned', trip.departed, trip.returned);
        order(prefix + 'newLandingOn', trip.departed, trip.newLandingOn);
        if (trip.renewalPending && !trip.stayExpiry)
          errors[prefix + 'stayExpiry'] = 'jp.error.date';
        const limit =
          trip.stayExpiry &&
          validDate(trip.stayExpiry) &&
          jpStayLimit({
            stayExpiry: trip.stayExpiry,
            renewalPending: trip.renewalPending ?? true,
          });
        if (limit && validDate(trip.departed) && trip.departed > limit)
          errors[prefix + 'stayExpiry'] =
            trip.renewalPending !== false
              ? 'jp.error.specialPeriod'
              : 'jp.error.order';
        if (
          trips
            .slice(0, i)
            .some(
              (previous) =>
                trip.departed < previous.returned &&
                previous.departed < trip.returned,
            )
        )
          errors[prefix + 'departed'] = 'jp.error.overlap';
      });
      break;
    case 2:
      for (const route of pr.routes) {
        const prefix = 'jp-pr-' + route.route;
        fields(prRouteFields[route.route], route, prefix);
        if (
          submitting &&
          (route.route === 'general' ||
            route.route === 'international-protection')
        ) {
          if (
            route.statusStart === 'none' &&
            route.newStatusStart &&
            route.newStatusStart !== 'none'
          )
            errors[prefix + '-newStatusStart'] ??= 'jp.error.newWithoutOld';
          else if (
            route.newStatusStart &&
            validDate(route.statusStart) &&
            validDate(route.newStatusStart) &&
            route.newStatusStart < route.statusStart
          )
            errors[prefix + '-newStatusStart'] ??= 'jp.error.newBeforeOld';
          route.excluded?.forEach((row, i) =>
            order(prefix + '-excluded-' + i + '-to', row.from, row.to),
          );
        }
      }
      break;
    case 3:
    case 4:
      for (const section of Object.values(
        step === 3 ? prStatusSections : prFilingSections,
      ))
        fields(section, pr.evidence, 'jp-pr');
      if (submitting && step === 3)
        for (const key of ['affiliationNotices', 'addressNotices'] as const)
          pr.evidence[key]?.forEach((row, i) =>
            order(
              'jp-pr-' + key + '-' + i + '-notifiedOn',
              row.eventOn,
              row.notifiedOn ?? undefined,
            ),
          );
      break;
    case 5:
      for (const route of nat.routes) {
        fields(natRouteFields[route.route], route, 'jp-nat-' + route.route);
        if (
          submitting &&
          route.route === 'general' &&
          route.homeMajorityAge !== undefined &&
          (!Number.isInteger(route.homeMajorityAge) ||
            route.homeMajorityAge < 1 ||
            route.homeMajorityAge > 99)
        )
          errors['jp-nat-general-homeMajorityAge'] = 'jp.error.age';
      }
      for (const section of Object.values(natSections))
        fields(section, nat.evidence, 'jp-nat');
      break;
    case 6:
      for (const route of reentry) {
        const prefix = 'jp-travel-' + route.route;
        fields(travelRouteFields[route.route], route, prefix);
        if (
          route.hypotheticalReturn !== undefined &&
          route.hypotheticalReturn !== true
        )
          errors[prefix + '-returnOn'] = 'jp.error.date';
        if (
          route.comparisonHistoryReturnOn !== undefined &&
          route.comparisonHistoryReturnOn !== '' &&
          (typeof route.comparisonHistoryReturnOn !== 'string' ||
            !validDate(route.comparisonHistoryReturnOn))
        )
          errors[prefix + '-returnOn'] = 'jp.error.date';
        if (route.route === 'deemed') {
          const departure = japanDepartureStatus(draft, route);
          if (checkActualDates && departure.conflictingReturn)
            errors[prefix + '-alreadyDeparted'] = 'jp.error.departureConflict';
          if (
            route.declaredIntentAtDeparture !== undefined &&
            !departure.departed
          )
            errors[prefix + '-declaredIntentAtDeparture'] =
              'jp.form.declarationError';
        }
        if (!submitting) continue;
        order(prefix + '-returnOn', route.departureOn, route.returnOn);
        order(prefix + '-newLandingOn', route.departureOn, route.newLandingOn);
        if (route.route !== 'deemed' && route.permit) {
          order(
            prefix + '-permit-expiresOn',
            route.permit.effectiveOn,
            route.permit.expiresOn,
          );
          order(
            prefix + '-permit-extendedUntil',
            route.permit.expiresOn,
            route.permit.extendedUntil,
          );
        }
      }
      break;
  }
  if (checkActualDates && (step === 1 || step === 6))
    checkTripRenewals(draft, step, errors);
  return errors;
}

export function validateJapanStep(draft: JapanDraft) {
  return checkStep(draft, draft.step, true);
}

// Older local results and saved scenarios can be opened without questionnaire submission.
export function invalidJapanFactStep(draft: JapanDraft) {
  for (const step of japanSteps(draft)) {
    const errors = Object.values(checkStep(draft, step.step, false, true));
    if (errors.includes('jp.error.departureConflict'))
      return {
        ...step,
        reason: 'departure-conflict',
        message: 'jp.error.departureConflict',
      } as const;
    if (errors.includes('jp.error.filingAfterPermit'))
      return {
        ...step,
        reason: 'filing-after-permit',
        message: 'jp.error.filingAfterPermit',
      } as const;
    if (errors.includes('jp.error.futureFact'))
      return {
        ...step,
        reason: 'future-fact-date',
        message: 'jp.result.correctFutureFact',
      } as const;
    if (errors.includes('jp.error.renewalBeforeDeparture'))
      return {
        ...step,
        reason: 'renewal-before-departure',
        message: 'jp.result.correctRenewalAtDeparture',
      } as const;
  }
}

export function restoreStoredJapanDraft(
  draft: JapanDraft,
  forResult = false,
): JapanDraft {
  let confirmed = datedJapanAnswers(clearUnconfirmedJapanDeclaration(draft));
  // Older forms could store permit validity without recording the departure method.
  if (
    confirmed.trips.some(
      (trip) => !trip.departure && trip.reentryPermit !== undefined,
    )
  ) {
    confirmed = {
      ...confirmed,
      trips: confirmed.trips.map((trip) => {
        if (trip.departure || trip.reentryPermit === undefined) return trip;
        const next = { ...trip };
        delete next.reentryPermit;
        return next;
      }),
    };
  }
  // Older travel-only drafts could be saved on the shared trip-history step.
  if (
    confirmed.step === 1 &&
    confirmed.reentry.length &&
    !hasJapanResidenceRoute(confirmed)
  )
    confirmed = { ...confirmed, step: 6 };
  // An unsubmitted questionnaire stays editable. A saved or shared result must
  // satisfy the same visible steps as a new submission, including old answers.
  if (!forResult && !confirmed.completed) return confirmed;
  const invalid = japanSteps(confirmed).find(
    ({ step }) => Object.keys(checkStep(confirmed, step, true)).length,
  );
  const completed = !invalid;
  const step = invalid?.step ?? confirmed.step;
  return confirmed.completed === completed && confirmed.step === step
    ? confirmed
    : { ...confirmed, completed, step };
}

function validRoutes(value: unknown, definitions: object) {
  if (!Array.isArray(value)) return false;
  const selected = new Set<string>();
  return value.every((route) => {
    if (
      !isRecord(route) ||
      typeof route.route !== 'string' ||
      !Object.hasOwn(definitions, route.route) ||
      selected.has(route.route)
    )
      return false;
    selected.add(route.route);
    return true;
  });
}

export function decodeJapanDraft(
  value: unknown,
  mode: DraftReadMode = false,
): JapanDraft | undefined {
  if (
    !isRecord(value) ||
    value.version !== 1 ||
    (value.answerFormat !== undefined && value.answerFormat !== 'explicit') ||
    (value.hypotheticalFiling !== undefined &&
      value.hypotheticalFiling !== true) ||
    typeof value.step !== 'number' ||
    !Number.isInteger(value.step) ||
    value.step < 0 ||
    value.step >= titles.length ||
    typeof value.completed !== 'boolean' ||
    typeof value.simulationDate !== 'string' ||
    typeof value.stayStart !== 'string' ||
    (value.tripsForReentryOnly !== undefined &&
      typeof value.tripsForReentryOnly !== 'boolean') ||
    !Array.isArray(value.trips) ||
    !value.trips.every(isRecord) ||
    !isRecord(value.permanentResidence) ||
    !isRecord(value.permanentResidence.evidence) ||
    !validRoutes(value.permanentResidence.routes, prRouteFields) ||
    !isRecord(value.naturalisation) ||
    !isRecord(value.naturalisation.evidence) ||
    !validRoutes(value.naturalisation.routes, natRouteFields) ||
    !validRoutes(value.reentry, travelRouteFields)
  )
    return undefined;
  let draft = readJapanAnswers(value as unknown as JapanDraft);
  // Discard older declarations when the departure still needs confirmation.
  const deemed = draft.reentry.find((route) => route.route === 'deemed');
  if (deemed && japanDepartureStatus(draft, deemed).askIfDeparted)
    draft = clearUnconfirmedJapanDeclaration(draft);
  // Validate containers before checking date relationships across their rows.
  if (titles.some((_, i) => Object.keys(checkStep(draft, i, false)).length))
    return undefined;
  const restored = restoreStoredJapanDraft(draft, !!mode);
  if (!japanSteps(restored).some(({ step }) => step === restored.step))
    return undefined;
  if (
    !restored.completed &&
    mode !== 'show-correction' &&
    (mode || draft.completed)
  )
    return undefined;
  return restored;
}
