import { currentLaw2026_11 as cl } from '@uk-immigration/policy-data';
import {
  addDays,
  addMonths,
  addYears,
  daysBetween,
  overlapDays,
} from './dates';
import type {
  Absence,
  ImmigrationEpisode,
  IsoDate,
  PersonTimeline,
} from './types';

/** The episode valid on `date`; the most recent one if they overlap. */
export function episodeOn(
  timeline: PersonTimeline,
  date: IsoDate,
): ImmigrationEpisode | undefined {
  return timeline.episodes
    .filter((e) => e.validFrom <= date && date <= e.validTo)
    .sort((a, b) => (a.validFrom < b.validFrom ? 1 : -1))[0];
}

/** The person's settlement, if granted on or before `date`. */
export function settledBy(
  timeline: PersonTimeline,
  date: IsoDate,
): PersonTimeline['settled'] {
  const { settled } = timeline;
  return settled && settled.date <= date ? settled : undefined;
}

/** File after arrival on a recorded return day; departure time is unknown. */
export function applicationLocationIssue(
  timeline: PersonTimeline,
  date: IsoDate,
): 'FAIL' | 'UNKNOWN' | undefined {
  if (
    timeline.absences.some(
      (a) => a.from && a.to && a.from < date && date < a.to,
    )
  ) {
    return 'FAIL';
  }
  if (
    timeline.absences.some(
      (a) =>
        a.from === date ||
        (!a.from && (!a.to || date < a.to)) ||
        (!a.to && date >= a.from),
    )
  ) {
    return 'UNKNOWN';
  }
}

export function nextKnownApplicationDate(
  timeline: PersonTimeline,
  from: IsoDate,
): IsoDate | undefined {
  if (!applicationLocationIssue(timeline, from)) return from;
  return timeline.absences
    .flatMap(({ to }) => (to && to >= from ? [to, addDays(to, 1)] : []))
    .sort()
    .find((date) => !applicationLocationIssue(timeline, date));
}

// Consecutive permissions with at most this many uncovered days between them
// count as continuous (engine assumption, PD-053).
const MAX_GAP_DAYS = 1;

export interface Run {
  /** Oldest first; empty when the episode on the date does not count. */
  episodes: ImmigrationEpisode[];
  /** The adjoining earlier episode that does not count, if that ended the run. */
  stoppedAt?: ImmigrationEpisode;
}

type Counts = (episode: ImmigrationEpisode) => boolean;
type AllowsGap = (from: IsoDate, to: IsoDate) => boolean;

export function permissionChanges(timeline: PersonTimeline): IsoDate[] {
  return [
    ...new Set(
      timeline.episodes.flatMap((e) => [e.validFrom, addDays(e.validTo, 1)]),
    ),
  ].sort();
}

/** For a projected filing after the final grant, assume renewal of that grant only. */
export function timelineAtFiling(
  timeline: PersonTimeline,
  date: IsoDate,
): PersonTimeline {
  const lastDay = timeline.episodes
    .map((e) => e.validTo)
    .sort()
    .at(-1);
  if (!lastDay || date <= lastDay) return timeline;
  const lastGrant = episodeOn(timeline, lastDay);
  return {
    ...timeline,
    episodes: timeline.episodes.map((e) =>
      e === lastGrant ? { ...e, validTo: date } : e,
    ),
  };
}

/** Between consecutive grant boundaries episodeOn selects the same permission. */
function effectivePeriods(timeline: PersonTimeline) {
  const changes = permissionChanges(timeline);
  return changes.flatMap((from, i) => {
    const permission = episodeOn(timeline, from);
    return permission
      ? [{ from, to: addDays(changes[i + 1], -1), permission }]
      : [];
  });
}

/** First in-country filing on a matching grant, with any route-specific maturity date. */
export function nextPermissionFiling(
  timeline: PersonTimeline,
  notBefore: IsoDate,
  appliesOn: Counts,
  periodFrom?: (date: IsoDate) => { start: IsoDate; completion: IsoDate },
) {
  const periods = effectivePeriods(timeline);
  for (const period of periods) {
    // Only the last recorded permission may be projected as renewed.
    const last = period === periods.at(-1);
    if ((!last && period.to < notBefore) || !appliesOn(period.permission))
      continue;
    const qualifying = periodFrom?.(period.from);
    const earliest = later(
      notBefore,
      later(period.from, qualifying?.completion ?? period.from),
    );
    if (!last && earliest > period.to) continue;
    const applicationDate = nextKnownApplicationDate(timeline, earliest);
    if (applicationDate && (last || applicationDate <= period.to)) {
      return { start: qualifying?.start ?? period.from, applicationDate };
    }
  }
}

/** The consecutive episodes satisfying `counts` that end with the one on `date`. */
export function continuousRun(
  timeline: PersonTimeline,
  date: IsoDate,
  counts: Counts,
  allowsGap: AllowsGap = (from, to) => daysBetween(from, to) < MAX_GAP_DAYS,
): Run {
  return runThrough(effectivePeriods(timeline), date, counts, allowsGap);
}

function runThrough(
  periods: ReturnType<typeof effectivePeriods>,
  date: IsoDate,
  counts: Counts,
  allowsGap: AllowsGap,
): Run {
  const episodes: ImmigrationEpisode[] = [];
  const index = periods.findIndex((p) => p.from <= date && date <= p.to);
  for (let i = index; i >= 0; i--) {
    const { from, to, permission } = periods[i];
    if (i < index) {
      const gapFrom = addDays(to, 1);
      const gapTo = addDays(periods[i + 1].from, -1);
      if (gapFrom <= gapTo && !allowsGap(gapFrom, gapTo)) break;
    }
    if (!counts(permission)) {
      return i === index ? { episodes } : { episodes, stoppedAt: permission };
    }
    episodes.unshift({ ...permission, validFrom: from, validTo: to });
  }
  return { episodes };
}

interface AbsenceLimit {
  maxDays: number;
  windowMonths: number;
  /** Long Residence only (SRC-008 CR 3.3). */
  legacy?: { before: IsoDate; maxSingleDays: number; maxTotalDays: number };
}

const calendarLimit = {
  maxDays: cl.values.continuousResidenceMaxAbsenceDays.value,
  windowMonths: cl.values.continuousResidenceWindowMonths.value,
};

const longResidenceLimit: AbsenceLimit = {
  ...calendarLimit,
  legacy: {
    before: cl.values.longResidenceLegacyAbsenceBefore.value,
    maxSingleDays: cl.values.longResidenceLegacyMaxSingleAbsenceDays.value,
    maxTotalDays: cl.values.longResidenceLegacyMaxTotalAbsenceDays.value,
  },
};

const earlier = (a: IsoDate, b: IsoDate) => (a < b ? a : b);
const later = (a: IsoDate, b: IsoDate) => (a > b ? a : b);

function unionAbsences(absences: Absence[]): Absence[] {
  const merged: Absence[] = [];
  for (const absence of [...absences].sort((a, b) =>
    a.from.localeCompare(b.from),
  )) {
    const last = merged.at(-1);
    if (last && absence.from <= last.to) last.to = later(last.to, absence.to);
    else merged.push({ ...absence });
  }
  return merged;
}

/** CR 3.1: travel days are excluded before clipping or splitting a trip. */
function wholeDayTrips(trips: Absence[]): Absence[] {
  return trips
    .filter(({ from, to }) => from && to && daysBetween(from, to) > 1)
    .map(({ from, to }) => ({ from: addDays(from, 1), to: addDays(to, -1) }));
}

function wholeDayAbsences(trips: Absence[]): Absence[] {
  return unionAbsences(wholeDayTrips(trips));
}

function absenceDays(absences: Absence[], from: IsoDate, to: IsoDate): number {
  return absences.reduce(
    (days, a) => days + overlapDays(a.from, a.to, from, to),
    0,
  );
}

function exceedsRollingLimit(
  absences: Absence[],
  start: IsoDate,
  date: IsoDate,
  { maxDays, windowMonths }: AbsenceLimit,
  checkFrom = start,
): boolean {
  if (absenceDays(absences, start, date) <= maxDays) return false;
  // Within one month the left edge advances by at most a day per day.
  // While abroad the count can only fall when the left edge jumps at a
  // month boundary. Check both trip ends and month ends (A4#1).
  return absences.some(({ from, to }) => {
    const end = earlier(to, date);
    let month = `${later(from, checkFrom).slice(0, 7)}-01`;
    let day = later(from, checkFrom);
    while (day <= end) {
      month = addMonths(month, 1);
      const peak = earlier(end, addDays(month, -1));
      const windowStart = later(
        start,
        addDays(addMonths(peak, -windowMonths), 1),
      );
      if (absenceDays(absences, windowStart, peak) > maxDays) return true;
      day = month;
    }
    return false;
  });
}

/**
 * Earned Settlement projection (PD-054): restart after the trip that broke
 * continuity. Absences count both the departure and the return day.
 */
export function restartAfterAbsences(
  start: IsoDate,
  date: IsoDate,
  absences: Absence[],
): IsoDate {
  const relevant = absences
    .filter((a) => a.to >= start && a.from <= date)
    .sort((a, b) => (a.from < b.from ? -1 : 1));
  let from = start;
  for (const absence of relevant) {
    if (absence.to < from) continue;
    if (
      exceedsRollingLimit(
        relevant,
        from,
        earlier(absence.to, date),
        calendarLimit,
        later(from, absence.from),
      )
    ) {
      from = addDays(absence.to, 1);
    }
  }
  return from;
}

/**
 * CR 3.2 follows the permission in force during the absence. Use the entered
 * permission start as the proxy for the date of grant.
 */
function partitionByPermission(timeline: PersonTimeline, absences: Absence[]) {
  const cutoff = cl.values.continuousResidenceLegacyPermissionBefore.value;
  const fixed: Absence[] = [];
  const rolling: Absence[] = [];
  const changes = permissionChanges(timeline);
  for (const absence of absences) {
    const boundaries = [
      absence.from,
      ...changes.filter((d) => absence.from < d && d <= absence.to),
      addDays(absence.to, 1),
    ];
    for (let i = 0; i < boundaries.length - 1; i++) {
      const from = boundaries[i];
      const permission = episodeOn(timeline, from);
      const periods =
        permission && permission.validFrom < cutoff ? fixed : rolling;
      periods.push({ from, to: addDays(boundaries[i + 1], -1) });
    }
  }
  return { fixed, rolling };
}

function exceedsFixedLimit(
  absences: Absence[],
  start: IsoDate,
  date: IsoDate,
  application: IsoDate,
) {
  const { maxDays, windowMonths } = calendarLimit;
  if (absenceDays(absences, start, date) <= maxDays) return false;
  // CR 3.2: each fixed window ends on an anniversary of the application.
  let months = date > application ? windowMonths : 0;
  let end = addMonths(application, months);
  while (end >= start) {
    months -= windowMonths;
    const from = later(start, addDays(addMonths(application, months), 1));
    if (absenceDays(absences, from, earlier(end, date)) > maxDays) return true;
    end = addMonths(application, months);
  }
  return false;
}

/** CR 2.1(d), 4.1(d)(v), 4.3: lawful presence during the August grace period. */
export function countedGracePeriod(
  timeline: PersonTimeline,
  from: IsoDate,
  to: IsoDate,
) {
  const graceFrom = cl.values.continuousResidenceGracePeriodFrom.value;
  return (
    from >= graceFrom &&
    to <= cl.values.continuousResidenceGracePeriodTo.value &&
    !!episodeOn(timeline, addDays(graceFrom, -1)) &&
    !timeline.absences.some(
      (a) => a.from && a.to && overlapDays(a.from, a.to, from, to) > 0,
    )
  );
}

function gapTreatment(
  timeline: PersonTimeline,
  trips: Absence[],
  gap: Absence,
  longResidence: boolean,
  reference: IsoDate,
) {
  if (countedGracePeriod(timeline, gap.from, gap.to)) return 'COUNT';
  // CR 4.1(d)(iii), CR 4.2 and LR 11.2: the travel itself must also
  // satisfy the absence limits, checked on the selected qualifying period.
  if (
    longResidence &&
    trips.some(
      (a) =>
        a.from < gap.from &&
        gap.to < a.to &&
        a.to <= reference &&
        episodeOn(timeline, a.from) &&
        episodeOn(timeline, a.to),
    )
  )
    return 'DEDUCT';
  // CR 4.1(d)(i), (ii), (iv) require application or decision facts the
  // timeline does not capture. A hole in the declared permissions breaks the run.
  return 'BREAK';
}

export interface CurrentResidence {
  start: IsoDate;
  before?: ImmigrationEpisode;
  completion: IsoDate;
  applicationDate?: IsoDate;
  referenceDate: IsoDate;
  deductedDays: number;
  reliesOnSection3C?: true;
}

/** Compute both the CR 1.1 reference date and the separate application date. */
export function currentResidence(
  timeline: PersonTimeline,
  application: IsoDate,
  counts: Counts,
  years: number,
  {
    longResidence = false,
    appliesOn = counts,
    notBefore = application,
    ancestryExpiry,
    countedTrips = timeline.absences,
    checkLocation = true,
    allowSection3C = false,
  }: {
    longResidence?: boolean;
    appliesOn?: Counts;
    notBefore?: IsoDate;
    ancestryExpiry?: IsoDate;
    countedTrips?: Absence[];
    checkLocation?: boolean;
    allowSection3C?: boolean;
  } = {},
): CurrentResidence | undefined {
  const trips = timeline.absences
    .filter((a) => a.from && a.to && a.from <= a.to)
    .sort((a, b) => a.from.localeCompare(b.from));
  const absences = wholeDayAbsences(countedTrips);
  const limits: AbsenceLimit = longResidence
    ? longResidenceLimit
    : calendarLimit;
  const legacy = limits.legacy;
  // CR 3.3: classify each departure before excluding travel days. Keep each
  // departure for the single-trip cap; only totals merge overlapping days.
  const olderTrips = legacy
    ? wholeDayTrips(countedTrips.filter((a) => a.from < legacy.before))
    : [];
  const older = unionAbsences(olderTrips);
  const { fixed, rolling } = legacy
    ? {
        fixed: [],
        rolling: wholeDayAbsences(
          countedTrips.filter((a) => a.from >= legacy.before),
        ),
      }
    : partitionByPermission(timeline, absences);
  const treatment = (from: IsoDate, to: IsoDate, reference: IsoDate) =>
    gapTreatment(timeline, trips, { from, to }, longResidence, reference);
  const periods = effectivePeriods(timeline);
  const runAt = (date: IsoDate) =>
    runThrough(
      periods,
      date,
      counts,
      (from, to) => treatment(from, to, date) !== 'BREAK',
    );
  const asOf = (
    run: Run,
    reference: IsoDate,
    applied: IsoDate,
  ): CurrentResidence => {
    const first = run.episodes[0].validFrom;
    const breaks = (start: IsoDate, end = reference) => {
      if (legacy) {
        if (
          olderTrips.some(
            (a) => overlapDays(a.from, a.to, start, end) > legacy.maxSingleDays,
          ) ||
          absenceDays(older, start, earlier(end, addDays(legacy.before, -1))) >
            legacy.maxTotalDays
        )
          return true;
      }
      return (
        exceedsFixedLimit(fixed, start, end, applied) ||
        exceedsRollingLimit(rolling, start, end, limits)
      );
    };
    // Trimming the left edge only removes absence days. Find the first start
    // that fits all limits, including when an older trip straddles that edge.
    let start = first;
    if (breaks(first)) {
      let end = reference;
      while (start < end) {
        const mid = addDays(start, Math.floor(daysBetween(start, end) / 2));
        if (breaks(mid)) start = addDays(mid, 1);
        else end = mid;
      }
      // A trip that breaks continuity on its own cannot provide the start
      // of the new period while the applicant is still on that same trip.
      for (const trip of wholeDayTrips(countedTrips)) {
        if (
          trip.from <= start &&
          start <= trip.to &&
          breaks(later(first, trip.from), earlier(reference, trip.to))
        ) {
          start = addDays(trip.to, 1);
        }
      }
    }
    let deductedDays = 0;
    for (let i = 1; i < run.episodes.length; i++) {
      const from = addDays(run.episodes[i - 1].validTo, 1);
      const to = addDays(run.episodes[i].validFrom, -1);
      if (from <= to && treatment(from, to, reference) === 'DEDUCT') {
        deductedDays += overlapDays(from, to, start, reference);
      }
    }
    return {
      start,
      before: run.stoppedAt,
      completion: addDays(addYears(start, years), deductedDays),
      applicationDate: applied,
      referenceDate: reference,
      deductedDays,
    };
  };
  // CR 1.1(d) uses an historical reference for a current application.
  if (ancestryExpiry) {
    const run = runAt(ancestryExpiry);
    if (!run.episodes.length) return undefined;
    const result = asOf(run, ancestryExpiry, application);
    return result.completion <= ancestryExpiry ? result : undefined;
  }
  const run = runAt(application);
  if (!run.episodes.length) return undefined;
  const advance = cl.values.continuousResidenceReferenceDays.value;
  const earliestStart = timeline.episodes
    .filter(counts)
    .map((e) => e.validFrom)
    .sort()[0];
  const firstReference = addYears(earliestStart, years);
  const lastRecorded = timeline.episodes
    .map((e) => e.validTo)
    .sort()
    .at(-1)!;
  const lastPermission = episodeOn(timeline, lastRecorded)!;
  const renewal = appliesOn(lastPermission) && counts(lastPermission);
  const lastRun = renewal ? runAt(lastRecorded) : undefined;
  const fixedWindowsMatter =
    absenceDays(fixed, earliestStart, fixed.at(-1)?.to ?? application) >
    calendarLimit.maxDays;
  const changes = permissionChanges(timeline);
  const referenceChanges = [
    ...changes,
    ...absences.flatMap((a) => [a.from, a.to]),
    // CR 4.1(d)(iii) can apply only once the applicant has returned.
    ...trips.map((a) => a.to),
  ].sort();
  let firstPossibleReference = firstReference;
  let applied = later(notBefore, addDays(firstReference, -advance));
  while (applied <= lastRecorded || renewal) {
    if (checkLocation) {
      const next = nextKnownApplicationDate(timeline, applied);
      if (!next) break;
      applied = next;
      if (applied > lastRecorded && !renewal) break;
    }
    const permission =
      applied <= lastRecorded ? episodeOn(timeline, applied) : lastPermission;
    if (!permission || !appliesOn(permission)) {
      const change = changes.find((day) => day > applied);
      if (!change) break;
      applied = change;
      continue;
    }
    const end = addDays(applied, advance);
    // An in-time application can extend the permission held at filing
    // under Immigration Act 1971 s3C while the decision is pending.
    // Use this only beyond the last recorded grant (never over a known gap).
    const inTime = applied <= lastRecorded;
    const mayExtend =
      allowSection3C && renewal && permission === lastPermission;
    const lastReference =
      inTime && !mayExtend ? earlier(end, lastRecorded) : end;
    let reference = later(applied, firstPossibleReference);
    while (reference <= lastReference) {
      const section3C = inTime && reference > lastRecorded;
      if (
        section3C &&
        timeline.absences.some(
          ({ from, to }) =>
            (!from || from <= reference) && (!to || to > applied),
        )
      )
        break;
      const qualifying = reference > lastRecorded ? lastRun! : runAt(reference);
      const start = qualifying.episodes[0]?.validFrom;
      let completion = start && addYears(start, years);
      if (completion && completion <= reference) {
        const result = asOf(qualifying, reference, applied);
        if (result.completion <= reference) {
          return section3C ? { ...result, reliesOnSection3C: true } : result;
        }
        completion = result.completion;
      }
      // Between recorded changes the completion date is stable. Recheck
      // each reference during travel, when the number of absent days changes.
      const change = referenceChanges.find((day) => day > reference);
      reference = absences.some((a) => a.from <= reference && reference < a.to)
        ? addDays(reference, 1)
        : completion && change
          ? earlier(completion, change)
          : (completion ?? change ?? addDays(reference, 1));
      // CR 3.2 fixed windows have to be recalculated for the next filing.
      if (!fixedWindowsMatter) firstPossibleReference = reference;
    }
    if (
      lastReference === lastRecorded &&
      firstPossibleReference > lastRecorded
    ) {
      applied = addDays(lastRecorded, 1);
      continue;
    }
    applied = later(
      addDays(applied, 1),
      addDays(firstPossibleReference, -advance),
    );
  }
  return { ...asOf(run, application, application), applicationDate: undefined };
}
