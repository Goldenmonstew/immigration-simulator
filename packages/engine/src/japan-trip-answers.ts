import type { JpTrip } from './japan';
import type { JpFullReentryRequest } from './japan-full-reentry';

export const sameJapanTrip = (trip: JpTrip, route: JpFullReentryRequest) =>
  !!trip.departed &&
  !!trip.returned &&
  trip.departed === route.departureOn &&
  trip.returned ===
    (route.comparisonHistoryReturnOn ?? route.returnOn ?? route.newLandingOn);

export const japanTripAnswerFields = [
  ['stayExpiry', 'stayExpiresOn'],
  ['renewalPending', 'timelyRenewalPending'],
  ['renewalDecisionOn', 'renewalDecisionOn'],
  ['specialPermanentResident', 'specialPermanentResident'],
  ['newLandingOn', 'newLandingOn'],
] as const satisfies ReadonlyArray<
  readonly [keyof JpTrip, keyof JpFullReentryRequest]
>;

type TripEdit<T> =
  | { history: JpTrip; field: string }
  | { travel: T; previous: T; field: string };

/** Missing copies may inherit one agreed answer. Only an explicit edit resolves a disagreement. */
export function shareJapanTripAnswers<T extends JpFullReentryRequest>(
  trips: JpTrip[],
  routes: T[],
  edited?: TripEdit<T>,
) {
  const correctedExpiryTrips =
    edited && 'history' in edited && edited.field === 'stayExpiry'
      ? [edited.history]
      : edited && 'travel' in edited && edited.field === 'stayExpiresOn'
        ? trips.filter((trip) => sameJapanTrip(trip, edited.travel))
        : [];
  const reentry = routes.map((route) => {
    if (
      route.route === 'deemed' &&
      route.historyStayExpiry &&
      ((edited &&
        'travel' in edited &&
        edited.travel === route &&
        edited.field === 'stayExpiresOn') ||
        correctedExpiryTrips.some((trip) => sameJapanTrip(trip, route)))
    )
      return { ...route, historyStayExpiry: undefined };
    return route;
  });
  const history = trips.map((trip) => {
    const matches = routes.filter((route) => sameJapanTrip(trip, route));
    // If the landing date was the only return date, clearing/changing it
    // detaches this route from its old itinerary. Remove its old copy too.
    const detachedLanding =
      edited &&
      'travel' in edited &&
      edited.field === 'newLandingOn' &&
      sameJapanTrip(trip, edited.previous) &&
      !matches.includes(edited.travel)
        ? edited.previous.newLandingOn
        : undefined;
    let result = trip;
    if (trip.reentryStayExpiry && correctedExpiryTrips.includes(trip)) {
      result = { ...result };
      delete result.reentryStayExpiry;
    }
    if (detachedLanding) {
      if (result.newLandingOn === detachedLanding) {
        result = { ...result };
        delete result.newLandingOn;
      }
      for (const route of matches) {
        if (route.newLandingOn !== detachedLanding) continue;
        const i = routes.indexOf(route);
        reentry[i] = { ...reentry[i] };
        delete reentry[i].newLandingOn;
      }
    }
    if (!matches.length) return result;
    for (const [historyKey, travelKey] of japanTripAnswerFields) {
      if (detachedLanding && historyKey === 'newLandingOn') continue;
      let answer: string | boolean | undefined;
      if (
        edited &&
        'history' in edited &&
        edited.history === trip &&
        edited.field === historyKey
      )
        answer = trip[historyKey] ?? undefined;
      else if (
        edited &&
        'travel' in edited &&
        matches.includes(edited.travel) &&
        edited.field === travelKey
      )
        answer = edited.travel[travelKey];
      else {
        const known = new Set([
          trip[historyKey],
          ...matches.map((route) => route[travelKey]),
        ]);
        known.delete(null);
        known.delete(undefined);
        if (known.size !== 1) continue;
        answer = [...known][0] ?? undefined;
      }
      if (result[historyKey] !== answer) {
        result = { ...result, [historyKey]: answer };
        if (answer === undefined) delete result[historyKey];
      }
      for (const route of matches) {
        if (route[travelKey] === answer) continue;
        const i = routes.indexOf(route);
        reentry[i] = { ...reentry[i], [travelKey]: answer };
        if (answer === undefined) delete reentry[i][travelKey];
      }
    }
    return result;
  });
  return { trips: history, reentry };
}
