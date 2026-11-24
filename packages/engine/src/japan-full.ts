import { japanFull2026_11 } from '@uk-immigration/policy-data';
import type { JpTrip } from './japan';
import { assessJapanNaturalisation } from './japan-full-naturalisation';
import type { JpFullNaturalisationRequest } from './japan-full-naturalisation';
import { assessJapanPr } from './japan-full-pr';
import type { JpFullPrRequest } from './japan-full-pr';
import { assessJapanReentry } from './japan-full-reentry';
import type {
  JpFullReentryRequest,
  JpTripConflict,
} from './japan-full-reentry';
import { filingContext } from './japan-full-shared';
import type { JpFullContext, JpFullResult } from './japan-full-shared';
import {
  japanDepartureByRoute,
  japanTripAnswerFields,
  japanTripOccurrences,
  sameJapanTrip,
} from './japan-trip-answers';

export interface JpFullRequest extends JpFullContext {
  /** A no-trips comparison can retain matched history as evidence for re-entry. */
  tripsForReentryOnly?: boolean;
  permanentResidence?: JpFullPrRequest;
  naturalisation?: JpFullNaturalisationRequest;
  reentry?: JpFullReentryRequest[];
}

const labels = {
  stayExpiry: ['在留届满日', 'expiry of stay'],
  renewalPending: [
    '出境时续期是否仍待决',
    'renewal status at departure',
  ],
  renewalDecisionOn: ['续期处分日', 'renewal decision date'],
  specialPermanentResident: [
    '出境时的特別永住者身份',
    'special permanent resident status at departure',
  ],
  newLandingOn: ['实际重新上陆日', 'actual new landing date'],
  departure: [
    '出境方式及みなし出境声明',
    'departure method and deemed re-entry declaration',
  ],
  reentryPermit: [
    '返日时普通许可的效力与证件记录',
    'ordinary permit validity on return and the permit record',
  ],
} as const satisfies Record<JpTripConflict['field'], readonly [string, string]>;

function discrepancy(
  field: JpTripConflict['field'],
  values: (string | boolean)[] = [],
): JpTripConflict {
  const [zh, en] = labels[field];
  const dates = values.filter((value) => typeof value === 'string').join(' / ');
  return {
    field,
    notice: [
      `同一趟行程的${zh}记录不一致${dates ? `（${dates}）` : ''}。请核对两处记录。`,
      `The records for this trip disagree about ${en}${dates ? ` (${dates})` : ''}. Check both records.`,
    ],
  };
}

function tripConflicts(trip: JpTrip, routes: JpFullReentryRequest[]) {
  const conflicts: JpTripConflict[] = [];
  for (const [historyKey, routeKey] of japanTripAnswerFields) {
    const answers = [
      trip[historyKey],
      ...routes.map((route) => route[routeKey]),
    ];
    // Comparisons saved before the original itinerary was retained have a second expiry.
    if (historyKey === 'stayExpiry') {
      answers.push(trip.reentryStayExpiry);
      for (const route of routes)
        if (route.route === 'deemed') answers.push(route.historyStayExpiry);
    }
    const known = [...new Set(answers.filter((answer) => answer != null))];
    if (known.length > 1) conflicts.push(discrepancy(historyKey, known));
    else if (
      historyKey === 'stayExpiry' &&
      known.length &&
      routes.some(
        (route) =>
          route.stayIndefinite === true ||
          route.specialPermanentResident === true,
      )
    )
      conflicts.push(discrepancy(historyKey, known));
  }
  if (
    routes.length &&
    trip.newLandingOn &&
    trip.newLandingOn !== trip.returned &&
    !conflicts.some(({ field }) => field === 'newLandingOn')
  )
    conflicts.push(
      discrepancy('newLandingOn', [trip.returned, trip.newLandingOn]),
    );
  const deemed = routes.find((route) => route.route === 'deemed');
  if (
    trip.departure &&
    deemed?.declaredIntentAtDeparture !== undefined &&
    (trip.departure === 'deemed') !== deemed.declaredIntentAtDeparture
  )
    conflicts.push(discrepancy('departure'));
  return conflicts;
}

/** Match raw answers before applying a comparison's alternative return date. */
export function evaluateJapanFull(
  req: JpFullRequest,
  itineraries = japanTripOccurrences(req),
): JpFullResult {
  const { L } = filingContext(req);
  const travel = new Map<
    JpFullReentryRequest,
    ReturnType<typeof assessJapanReentry>['pathway']
  >();
  const conflictNotices: string[] = [];
  const trips = itineraries.trips.map((original) => {
    const trip: JpTrip = { ...original, assessedReturn: undefined };
    const matches = itineraries.reentry.filter((route) =>
      sameJapanTrip(trip, route),
    );
    const conflicts = tripConflicts(trip, matches);
    // SRC-110 art. 20(6), SRC-116 Q61: a pending decision date is unknown.
    if (trip.stayExpiry && trip.renewalPending && !trip.renewalDecisionOn)
      trip.renewalDecisionOn = null;
    const deemed = matches.find((route) => route.route === 'deemed');
    const method =
      trip.departure ??
      (deemed?.declaredIntentAtDeparture ? 'deemed' : undefined);
    // Selecting a route for assessment alone does not establish how the traveller left.
    const used = matches.find(
      (route) => japanDepartureByRoute[route.route] === method,
    );
    trip.departure = method;
    if (used) {
      const evidence = assessJapanReentry(
        req,
        { ...used, returnOn: trip.returned, occurrence: original.occurrence },
        { conflicts, departure: method, permitOnReturn: trip.reentryPermit },
      );
      if (
        used.route === 'ordinary' &&
        trip.reentryPermit !== undefined &&
        evidence.permitValidOnReturn !== undefined &&
        trip.reentryPermit !== evidence.permitValidOnReturn
      )
        conflicts.push(discrepancy('reentryPermit'));
      trip.assessedReturn = {
        continued: evidence.validity,
        explanation: evidence.returnCheck.explanation,
      };
      if (
        !conflicts.length &&
        original.occurrence.returned === used.occurrence.returned &&
        trip.returned === (used.returnOn ?? used.newLandingOn)
      )
        travel.set(used, evidence.pathway);
    }
    if (conflicts.length) {
      const explanation = conflicts.map(({ notice }) => L(...notice)).join(' ');
      if (!req.tripsForReentryOnly) conflictNotices.push(explanation);
      trip.assessedReturn = { explanation };
      if (conflicts.some(({ field }) => field === 'departure'))
        trip.departure = undefined;
    }
    for (const route of matches) {
      if (travel.has(route)) continue;
      const sameReturn =
        trip.returned === (route.returnOn ?? route.newLandingOn);
      const permit =
        original.departure === 'permit' && sameReturn
          ? original.reentryPermit
          : undefined;
      travel.set(
        route,
        assessJapanReentry(req, route, {
          conflicts,
          permitOnReturn: permit,
          departure: method,
        }).pathway,
      );
    }
    return trip;
  });
  const history = { ...req, trips: req.tripsForReentryOnly ? [] : trips };
  return {
    policyAsOf: japanFull2026_11.asOf,
    columns: [
      {
        id: japanFull2026_11.ruleSetId,
        title: L('日本现行及已公布规则', 'Japan’s current and published rules'),
        pathways: [
          ...(req.permanentResidence?.routes.map((route) =>
            assessJapanPr(
              history,
              route,
              req.permanentResidence?.evidence ?? {},
            ),
          ) ?? []),
          ...(req.naturalisation?.routes.map((route) => {
            const assessment = assessJapanNaturalisation(
              history,
              route,
              req.naturalisation?.evidence ?? {},
            );
            for (const notice of conflictNotices)
              if (!assessment.summary?.includes(notice))
                assessment.summary = [assessment.summary, notice]
                  .filter(Boolean)
                  .join(' ');
            return assessment;
          }) ?? []),
          ...itineraries.reentry.map(
            (route) =>
              travel.get(route) ?? assessJapanReentry(req, route).pathway,
          ),
        ],
      },
    ],
  };
}
