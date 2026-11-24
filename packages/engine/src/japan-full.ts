import { japanFull2026_11 } from '@uk-immigration/policy-data';
import { jpTripLapses, type JpTrip } from './japan';
import { assessJapanNaturalisation } from './japan-full-naturalisation';
import type { JpFullNaturalisationRequest } from './japan-full-naturalisation';
import { assessJapanPr } from './japan-full-pr';
import type { JpFullPrRequest } from './japan-full-pr';
import { assessJapanReentry, deemedTripPermission } from './japan-full-reentry';
import type { JpFullReentryRequest } from './japan-full-reentry';
import { filingContext } from './japan-full-shared';
import type { JpFullContext, JpFullResult } from './japan-full-shared';

export interface JpFullRequest extends JpFullContext {
  permanentResidence?: JpFullPrRequest;
  naturalisation?: JpFullNaturalisationRequest;
  reentry?: JpFullReentryRequest[];
}

type DeemedRoute = Extract<JpFullReentryRequest, { route: 'deemed' }>;
const sameTrip = (trip: JpTrip, route: JpFullReentryRequest) =>
  !!trip.departed &&
  !!trip.returned &&
  trip.departed === route.departureOn &&
  trip.returned === (route.returnOn ?? route.newLandingOn);
const sameDeemedTrip = (
  trip: JpTrip,
  route: JpFullReentryRequest,
): route is DeemedRoute => route.route === 'deemed' && sameTrip(trip, route);

/** A renewal decision belongs to the trip. An edit can also clear the date. */
export function shareJapanRenewalDecisions<T extends JpFullReentryRequest>(
  trips: JpTrip[],
  routes: T[],
  edited?: JpTrip | T['route'],
) {
  const history = trips.map((trip) => {
    if (trip === edited) return trip;
    const matching = routes.filter((route) => sameTrip(trip, route));
    const changed = matching.find((route) => route.route === edited);
    const date = changed
      ? changed.renewalDecisionOn
      : (trip.renewalDecisionOn ??
        matching.find((r) => r.renewalDecisionOn)?.renewalDecisionOn);
    return date === trip.renewalDecisionOn
      ? trip
      : { ...trip, renewalDecisionOn: date };
  });
  const reentry = routes.map((route) => {
    const trip = history.find((trip) => sameTrip(trip, route));
    if (
      !trip ||
      route.renewalDecisionOn === (trip.renewalDecisionOn ?? undefined)
    )
      return route;
    return { ...route, renewalDecisionOn: trip.renewalDecisionOn ?? undefined };
  });
  return { trips: history, reentry };
}

/** Reconcile departure status (SRC-442 art. 23(2)) and permit evidence for the same itinerary. */
export function resolveJapanDeemedTripStatuses<T extends JpFullReentryRequest>(
  trips: JpTrip[],
  routes: T[],
) {
  const shared = shareJapanRenewalDecisions(trips, routes);
  const matches = (
    trip: JpTrip,
    route: JpFullReentryRequest,
  ): route is DeemedRoute =>
    sameDeemedTrip(trip, route) &&
    (trip.departure === 'deemed' || route.declaredIntentAtDeparture === true);
  const history = shared.trips.map((trip) => {
    // SRC-110 art. 20(6), SRC-116 Q61. A full assessment needs the
    // actual decision when return falls within the possible special period.
    if (trip.stayExpiry && trip.renewalPending && !trip.renewalDecisionOn)
      trip = { ...trip, renewalDecisionOn: null };
    const landings = routes.filter(
      (route) => route.newLandingOn && sameTrip(trip, route),
    );
    const landing =
      landings.find((route) => route.newLandingOn !== trip.returned) ??
      landings[0];
    if (landing) trip = { ...trip, newLandingOn: landing.newLandingOn };
    const matched = routes.filter((route) => matches(trip, route));
    if (!matched.length) return trip;
    const answers = new Set([
      trip.specialPermanentResident,
      ...matched.map((route) => route.specialPermanentResident),
    ]);
    answers.delete(undefined);
    return {
      ...trip,
      specialPermanentResident:
        answers.size === 1 ? [...answers][0] : undefined,
    };
  });
  const reentry = shared.reentry.map((route) => {
    const trip = history.find((trip) => sameTrip(trip, route));
    if (!trip) return route;
    if (trip.newLandingOn)
      route = { ...route, newLandingOn: trip.newLandingOn };
    if (!matches(trip, route)) return route;
    return {
      ...route,
      specialPermanentResident: trip.specialPermanentResident,
      stayExpiresOn: route.stayExpiresOn ?? trip.stayExpiry,
      historyStayExpiry: trip.stayExpiry,
      timelyRenewalPending: route.timelyRenewalPending ?? trip.renewalPending,
    };
  });
  // Resolve the evidence while the original itinerary still matches. A comparison
  // can subsequently change the return date for the re-entry route alone.
  const resolvedTrips = history.map((trip) => {
    const matched = reentry.filter((route) => sameDeemedTrip(trip, route));
    if (
      !matched.length ||
      (trip.departure !== 'deemed' &&
        !matched.some((route) => route.declaredIntentAtDeparture === true))
    )
      return trip;
    const answers = new Set(matched.map(deemedTripPermission));
    const eligible = answers.size === 1 ? [...answers][0] : undefined;
    // A failed deemed departure does not invalidate an independently reported ordinary permit.
    if (trip.departure === 'permit' && eligible !== true) return trip;
    // SRC-110 art. 20(6), SRC-116 Q61. Both assessments use the same
    // original stay and decision, including a decision date still unknown.
    const stay =
      matched.find(
        (route) => trip.stayExpiry && route.stayExpiresOn !== trip.stayExpiry,
      ) ?? matched[0];
    if (stay.stayExpiresOn)
      trip = {
        ...trip,
        stayExpiry: trip.stayExpiry ?? stay.stayExpiresOn,
        reentryStayExpiry: stay.stayExpiresOn,
        renewalPending: stay.timelyRenewalPending,
        renewalDecisionOn: stay.renewalDecisionOn ?? null,
      };
    if (eligible === false) return { ...trip, departure: 'none' as const };
    // Even with valid documents the history may already prove the return was late.
    if (eligible === true || jpTripLapses(trip, 'deemed') === true)
      return { ...trip, departure: 'deemed' as const };
    return { ...trip, departure: undefined };
  });
  return { trips: resolvedTrips, reentry };
}

/** Evaluates selected routes for one person at the requested filing date. */
export function evaluateJapanFull(req: JpFullRequest): JpFullResult {
  const { L } = filingContext(req);
  const pr = req.permanentResidence;
  const naturalisation = req.naturalisation;
  const { trips, reentry } = resolveJapanDeemedTripStatuses(
    req.trips,
    req.reentry ?? [],
  );
  const history = { ...req, trips };
  return {
    policyAsOf: japanFull2026_11.asOf,
    columns: [
      {
        id: japanFull2026_11.ruleSetId,
        title: L('日本现行及已公布规则', 'Japan’s current and published rules'),
        pathways: [
          ...(pr?.routes.map((route) =>
            assessJapanPr(history, route, pr.evidence ?? {}),
          ) ?? []),
          ...(naturalisation?.routes.map((route) =>
            assessJapanNaturalisation(
              history,
              route,
              naturalisation.evidence ?? {},
            ),
          ) ?? []),
          ...reentry.map((route) => assessJapanReentry(req, route)),
        ],
      },
    ],
  };
}
