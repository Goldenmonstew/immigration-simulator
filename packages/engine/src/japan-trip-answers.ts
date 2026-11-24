import type { IsoDate } from './types';
import type { JpTrip } from './japan';
import type { JpFullReentryRequest } from './japan-full-reentry';

export const japanDepartureByRoute = {
  deemed: 'deemed',
  ordinary: 'permit',
  'refugee-travel-document': 'refugee-travel-document',
} as const satisfies Record<JpFullReentryRequest['route'], string>;

export type JapanDeparture =
  'none' | (typeof japanDepartureByRoute)[keyof typeof japanDepartureByRoute];

export const japanTripReturnOn = (route: JpFullReentryRequest) =>
  route.comparisonHistoryReturnOn ?? route.returnOn ?? route.newLandingOn;

export const sameJapanTrip = (
  trip: { departed?: IsoDate; returned?: IsoDate },
  route: JpFullReentryRequest,
) =>
  !!trip.departed &&
  !!trip.returned &&
  trip.departed === route.departureOn &&
  trip.returned === japanTripReturnOn(route);

export interface JpTripOccurrence {
  departed: boolean;
  returned: boolean;
}

export interface JpItineraries {
  trips: (JpTrip & { occurrence: JpTripOccurrence })[];
  reentry: (JpFullReentryRequest & { occurrence: JpTripOccurrence })[];
}

export function japanTripOccurrence(
  asOf: IsoDate,
  departureOn?: IsoDate,
  returnOn?: IsoDate,
  confirmedDeparture?: boolean,
): JpTripOccurrence {
  const returnedByDate = !!returnOn && returnOn <= asOf;
  // A recorded return also establishes that departure occurred, even if its date is blank.
  const departed =
    confirmedDeparture ?? (departureOn ? departureOn <= asOf : returnedByDate);
  return { departed, returned: departed && returnedByDate };
}

/** Resolve each itinerary before evaluating the selected pathways and filing dates. */
export function japanTripOccurrences(
  request: {
    simulationDate: IsoDate;
    trips: JpTrip[];
    reentry?: JpFullReentryRequest[];
  },
  confirmation?: { route: JpFullReentryRequest; departed: boolean },
): JpItineraries {
  const routes = request.reentry ?? [];
  const shared = shareJapanTripAnswers(request.trips, routes);
  const occurrences = new Map<string, JpTripOccurrence>();
  const occurrence = (
    departure?: IsoDate,
    returned?: IsoDate,
    confirmed?: boolean,
  ) => {
    const key = `${departure}/${returned}/${confirmed}`;
    let value = occurrences.get(key);
    if (!value) {
      value = japanTripOccurrence(
        request.simulationDate,
        departure,
        returned,
        confirmed,
      );
      occurrences.set(key, value);
    }
    return value;
  };
  return {
    trips: shared.trips.map((trip) => ({
      ...trip,
      occurrence: occurrence(
        trip.departed,
        trip.returned,
        confirmation && sameJapanTrip(trip, confirmation.route)
          ? confirmation.departed
          : undefined,
      ),
    })),
    reentry: shared.reentry.map((route, index) => {
      const original = {
        departed: route.departureOn,
        returned: japanTripReturnOn(route),
      };
      const confirmed =
        confirmation &&
        (routes[index] === confirmation.route ||
          sameJapanTrip(original, confirmation.route));
      return {
        ...route,
        occurrence: occurrence(
          route.departureOn,
          route.returnOn ?? route.newLandingOn,
          confirmed ? confirmation.departed : undefined,
        ),
      };
    }),
  };
}

export const japanTripAnswerFields = [
  ['stayExpiry', 'stayExpiresOn'],
  ['renewalPending', 'timelyRenewalPending'],
  ['renewalDecisionOn', 'renewalDecisionOn'],
  ['specialPermanentResident', 'specialPermanentResident'],
  ['newLandingOn', 'newLandingOn'],
] as const satisfies ReadonlyArray<
  readonly [keyof JpTrip, keyof JpFullReentryRequest]
>;

/** Resolve agreed answers for display and assessment without modifying the entered records. */
export function shareJapanTripAnswers<T extends JpFullReentryRequest>(
  trips: JpTrip[],
  routes: T[],
) {
  const reentry = [...routes];
  const history = trips.map((trip) => {
    const matches = routes.filter((route) => sameJapanTrip(trip, route));
    if (!matches.length) return trip;
    let result = trip;
    for (const [historyKey, travelKey] of japanTripAnswerFields) {
      const known = new Set([
        trip[historyKey],
        ...matches.map((route) => route[travelKey]),
      ]);
      known.delete(null);
      known.delete(undefined);
      if (known.size !== 1) continue;
      const answer = [...known][0];
      if (result[historyKey] !== answer)
        result = { ...result, [historyKey]: answer };
      for (const route of matches) {
        if (route[travelKey] === answer) continue;
        const i = routes.indexOf(route);
        reentry[i] = { ...reentry[i], [travelKey]: answer };
      }
    }
    return result;
  });
  return { trips: history, reentry };
}

/** Keep the corrected answer at its source and discard superseded answers for this trip. */
export function editJapanTripAnswer<T extends JpFullReentryRequest>(
  trips: JpTrip[],
  reentry: T[],
  edited: { history: JpTrip; field: string } | { travel: T; field: string },
) {
  const keys = japanTripAnswerFields.find(
    ([history, travel]) =>
      edited.field === ('history' in edited ? history : travel),
  );
  if (!keys) return { trips, reentry };
  const [historyKey, travelKey] = keys;
  const answer =
    'history' in edited ? edited.history[historyKey] : edited.travel[travelKey];
  const matches =
    'history' in edited
      ? [edited.history]
      : trips.filter((trip) => sameJapanTrip(trip, edited.travel));
  function correct<R extends object>(
    record: R,
    key: string,
    oldExpiry: string,
  ): R {
    const next = { ...record } as R & Record<string, unknown>;
    if (answer == null || next[key] !== answer) delete next[key];
    if (historyKey === 'stayExpiry') delete next[oldExpiry];
    return next;
  }
  return {
    trips: trips.map((trip) =>
      matches.includes(trip)
        ? correct(trip, historyKey, 'reentryStayExpiry')
        : trip,
    ),
    reentry: reentry.map((route) =>
      matches.some((trip) => sameJapanTrip(trip, route)) ||
      ('travel' in edited && edited.travel === route)
        ? correct(route, travelKey, 'historyStayExpiry')
        : route,
    ),
  };
}
