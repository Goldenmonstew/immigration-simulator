import { addDays } from '../dates';
import type { IsoDate } from '../types';
import { all, checksFor, cumulativeDaysAt, reviewed, s, v } from './check';
import type { Answer } from './check';
import { immediateRelative, isI140Category } from './petition';
import type { AdjustmentCategory, preapprovedFacts } from './petition';
import type { UsFullRequest, UsFullTrip, UsI485PendingEvent } from './types';

function travelPreservesApplication(
  trip: UsFullTrip,
  decision: IsoDate,
  humanitarian: boolean,
  section245: boolean,
): Answer {
  const evidence = trip.i485Travel;
  if (!evidence) return undefined;
  if (
    section245 &&
    (evidence.inRemovalProceedings || evidence.route === 'none')
  )
    return false;
  const applicable = humanitarian
    ? evidence.route === 'refugee-travel-document' ||
      evidence.route === 'other-209'
    : evidence.route === 'advance-parole' ||
      evidence.route === 'nonimmigrant' ||
      evidence.route === 'tps';
  return applicable &&
    trip.returned < decision &&
    evidence.evidence === 'cleared'
    ? true
    : undefined;
}

type EmploymentEvent = Extract<
  UsI485PendingEvent,
  { kind: 'unauthorized-employment' }
>;

function within245k(events: EmploymentEvent[], decision: IsoDate): Answer {
  const limit = v.adjustment.value.kDays;
  // All reports count non-overlapping days from the same relevant lawful admission.
  let maximum = Infinity;
  let minimum = 0;
  for (const event of events) {
    const total = event.qualifyingViolationsDays;
    const through = event.qualifyingViolationsThrough ?? event.on;
    if (total === undefined || through < event.on || through > decision)
      continue;
    // A same-day event without explicit coverage may include the decision day's violation.
    const firstPossibleDecision =
      through === decision && !event.qualifyingViolationsThrough
        ? addDays(decision, -1)
        : decision;
    minimum = Math.max(
      minimum,
      cumulativeDaysAt(total, through, firstPossibleDecision).minimum,
    );
    maximum = Math.min(
      maximum,
      cumulativeDaysAt(total, through, decision).maximum,
    );
  }
  if (minimum > maximum) return undefined;
  return minimum > limit ? false : maximum <= limit ? true : undefined;
}

export function i485PendencyChecks(
  request: UsFullRequest,
  receipt: IsoDate,
  decision: IsoDate,
  category: AdjustmentCategory,
  facts: ReturnType<typeof preapprovedFacts>,
  filed: boolean,
) {
  const check = checksFor(request);
  const humanitarian = request.pathway === 'US-HUMANITARIAN';
  const inWindow = (on: IsoDate) => receipt <= on && on <= decision;
  const trips = request.trips?.filter(({ departed }) => inWindow(departed));
  const travelUnknown = trips === undefined && (filed || receipt < decision);
  const events = request.admission?.i485PendingEvents?.filter(({ on }) =>
    inWindow(on),
  );
  const employment = events?.filter(
    (event) => event.kind === 'unauthorized-employment',
  );
  const coveredViolations = employment?.length
    ? within245k(employment, decision)
    : undefined;
  const atBoundary = (on: IsoDate, answer: Answer): Answer =>
    on === receipt || on === decision ? answer === true || undefined : answer;
  const applicableBasis =
    category !== undefined && category !== 'ambiguous' && category !== 'other';
  const transfer = request.admission?.i485BasisTransfer;
  const immediate = immediateRelative(
    request,
    category,
    transfer?.approvedOn ?? receipt,
    facts,
    decision,
  );
  const adjustmentBarExempt =
    humanitarian ||
    immediate === true ||
    category === 'vawa' ||
    category === 'sij' ||
    category === '245i';
  const eventResult = (event: UsI485PendingEvent): Answer => {
    if (event.kind === 'nonimmigrant-status-expiry')
      return event.finding
        ? reviewed(event.finding)
        : humanitarian || applicableBasis || undefined;
    if (event.kind !== 'unauthorized-employment')
      return reviewed(event.finding);
    if (adjustmentBarExempt) return true;
    if (event.exception !== undefined) return reviewed(event.exception);
    if (category !== 'employment')
      return immediate === false && applicableBasis ? false : undefined;
    const job = request.employment?.category;
    const eligibleEmployment = job
      ? isI140Category(job) || job === 'eb5'
      : request.employment?.i140FiledOn !== undefined || undefined;
    return all(
      eligibleEmployment,
      request.admission?.lawfulAdmissionFor245k,
      coveredViolations,
    );
  };
  const filingOrderUnknown = events?.some(
    (event) =>
      event.on === receipt &&
      (event.kind === 'qualifying-basis' || event.kind === 'admissibility') &&
      event.finding !== 'cleared',
  );
  return [
    ...(travelUnknown || trips?.length
      ? [
          check(
            'I485-PENDING-TRAVEL',
            'I-485 待决期间离境与返美',
            'Departure and return while Form I-485 is pending',
            trips &&
              all(
                ...trips.map((trip) =>
                  atBoundary(
                    trip.departed,
                    travelPreservesApplication(
                      trip,
                      decision,
                      humanitarian,
                      applicableBasis,
                    ),
                  ),
                ),
              ),
            humanitarian
              ? s.humanitarianPendingTravel
              : s.adjustmentPendingTravel,
            'PD-274',
            travelUnknown
              ? [
                  '请提供待决期间的旅行记录，或确认期间没有离境。',
                  'Supply travel records for the pending period or confirm that there was no departure.',
                ]
              : humanitarian
                ? [
                    '核对每次离境的难民旅行证件或适用的 INA 209 返美依据，以及裁决前的返美记录。',
                    'Verify the refugee travel document or applicable INA 209 return basis and the return record for each departure before adjudication.',
                  ]
                : [
                    '逐次核对离境前获批的 Advance Parole 和合资格返美，或适用的非移民身份或 TPS 例外。若确认无适用依据，待决申请视为放弃。',
                    'For each departure, verify prior Advance Parole and qualifying return, or an applicable nonimmigrant or TPS exception. A departure with no applicable basis abandons the pending application.',
                  ],
            'NOT_APPLICABLE',
          ),
        ]
      : []),
    ...(events?.length
      ? [
          check(
            'I485-PENDING-ELIGIBILITY',
            'I-485 待决期间的资格与程序',
            'Eligibility and case requirements while Form I-485 is pending',
            all(
              ...events.map((event) =>
                atBoundary(event.on, eventResult(event)),
              ),
            ),
            [
              ...s.adjustmentOngoingEligibility,
              ...(humanitarian
                ? s.humanitarian
                : s.adjustmentPendingEmployment),
            ],
            'PD-274',
            [
              '核对收件后至裁决的适用事件，包括资格基础、准入和程序，以及按类别处理的未经授权就业。',
              'Review applicable events from receipt through adjudication, including changes to the qualifying basis, admissibility, procedural requirements and category-specific unauthorized employment bars.',
            ],
            filingOrderUnknown ? 'UNKNOWN' : 'NOT_APPLICABLE',
          ),
        ]
      : []),
  ];
}
