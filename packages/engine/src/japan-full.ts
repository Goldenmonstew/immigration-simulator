import { japanFull2026_11 } from '@uk-immigration/policy-data';
import type { JpTrip } from './japan';
import { assessJapanNaturalisation } from './japan-full-naturalisation';
import type { JpFullNaturalisationRequest } from './japan-full-naturalisation';
import { assessJapanPr } from './japan-full-pr';
import type { JpFullPrRequest } from './japan-full-pr';
import { assessJapanReentry } from './japan-full-reentry';
import type { JpFullReentryRequest } from './japan-full-reentry';
import { filingContext } from './japan-full-shared';
import type { JpFullContext, JpFullResult } from './japan-full-shared';

export interface JpFullRequest extends JpFullContext {
  permanentResidence?: JpFullPrRequest;
  naturalisation?: JpFullNaturalisationRequest;
  reentry?: JpFullReentryRequest[];
}

type DeemedRoute = Extract<JpFullReentryRequest, { route: 'deemed' }>;
const sameDeemedTrip = (
  trip: JpTrip,
  route: JpFullReentryRequest,
): route is DeemedRoute =>
  route.route === 'deemed' &&
  trip.departed === route.departureOn &&
  trip.returned === route.returnOn;

/** SRC-442 art. 23(2): share status at departure only for the same deemed trip. */
export function resolveJapanDeemedTripStatuses<T extends JpFullReentryRequest>(
  trips: JpTrip[],
  routes: T[],
) {
  const matches = (trip: JpTrip, route: JpFullReentryRequest) =>
    sameDeemedTrip(trip, route) &&
    (trip.departure === 'deemed' || route.declaredIntentAtDeparture === true);
  const history = trips.map((trip) => {
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
  const reentry = routes.map((route) => {
    const trip = history.find((trip) => matches(trip, route));
    return trip
      ? { ...route, specialPermanentResident: trip.specialPermanentResident }
      : route;
  });
  return { trips: history, reentry };
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
  // SRC-110 art. 26-2(1), SRC-116: the declaration records how the person
  // actually left. Apply it to the matching history only for this assessment.
  const history = {
    ...req,
    trips: trips.map((trip) => {
      const answers = new Set(
        reentry
          .filter((route): route is DeemedRoute => sameDeemedTrip(trip, route))
          .map((route) => route.declaredIntentAtDeparture),
      );
      answers.delete(undefined);
      // A negative deemed declaration does not invalidate a separate ordinary permit.
      if (
        !answers.size ||
        (answers.size === 1 &&
          answers.has(false) &&
          trip.departure !== 'deemed')
      )
        return trip;
      const departure: JpTrip['departure'] =
        answers.size > 1 ? undefined : answers.has(true) ? 'deemed' : 'none';
      return { ...trip, departure };
    }),
  };
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
