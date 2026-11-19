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

/** The consecutive episodes satisfying `counts` that end with the one on `date`. */
export function continuousRun(
  timeline: PersonTimeline,
  date: IsoDate,
  counts: Counts,
  allowsGap: AllowsGap = (from, to) => daysBetween(from, to) < MAX_GAP_DAYS,
): Run {
  const current = episodeOn(timeline, date);
  if (!current || !counts(current)) return { episodes: [] };
  const episodes = [current];
  for (;;) {
    const from = episodes[0].validFrom;
    const previous = timeline.episodes
      .filter((e) => e.validFrom < from && !episodes.includes(e))
      .sort((a, b) => (a.validTo < b.validTo ? 1 : -1))[0];
    if (!previous) return { episodes };
    const firstUncovered = addDays(previous.validTo, 1);
    const lastUncovered = addDays(from, -1);
    if (
      firstUncovered <= lastUncovered &&
      !allowsGap(firstUncovered, lastUncovered)
    ) {
      return { episodes };
    }
    if (!counts(previous)) return { episodes, stoppedAt: previous };
    episodes.unshift(previous);
  }
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
  const changes = [
    ...new Set(
      timeline.episodes.flatMap((e) => [e.validFrom, addDays(e.validTo, 1)]),
    ),
  ].sort();
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

function gapTreatment(
  timeline: PersonTimeline,
  absences: Absence[],
  gap: Absence,
  longResidence: boolean,
  reference: IsoDate,
) {
  // CR 2.1(d), 4.1(d)(v), 4.3: permission immediately before the August
  // grace period and presence in the UK throughout the uncovered days.
  const graceFrom = cl.values.continuousResidenceGracePeriodFrom.value;
  if (
    gap.from >= graceFrom &&
    gap.to <= cl.values.continuousResidenceGracePeriodTo.value &&
    episodeOn(timeline, addDays(graceFrom, -1)) &&
    !absenceDays(absences, gap.from, gap.to)
  ) {
    return 'COUNT';
  }
  // CR 4.1(d)(iii), CR 4.2 and LR 11.2: the travel itself must also
  // satisfy the absence limits, checked on the selected qualifying period.
  if (
    longResidence &&
    absences.some(
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
  applicationDate: IsoDate;
  referenceDate: IsoDate;
  deductedDays: number;
}

/** Compute both the CR 1.1 reference date and the separate application date. */
export function currentResidence(
  timeline: PersonTimeline,
  application: IsoDate,
  counts: Counts,
  years: number,
  {
    longResidence = false,
    ancestryExpiry,
  }: { longResidence?: boolean; ancestryExpiry?: IsoDate } = {},
): CurrentResidence | undefined {
  const absences = unionAbsences(
    timeline.absences.filter((a) => a.from && a.to && a.from <= a.to),
  );
  const limits: AbsenceLimit = longResidence
    ? longResidenceLimit
    : calendarLimit;
  const legacy = limits.legacy;
  const older = legacy ? absences.filter((a) => a.from < legacy.before) : [];
  const { fixed, rolling } = legacy
    ? { fixed: [], rolling: absences.filter((a) => a.from >= legacy.before) }
    : partitionByPermission(timeline, absences);
  const treatment = (from: IsoDate, to: IsoDate, reference: IsoDate) =>
    gapTreatment(timeline, absences, { from, to }, longResidence, reference);
  const runAt = (date: IsoDate) =>
    continuousRun(
      timeline,
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
          older.some(
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
      const trip = absences.find((a) => a.from <= start && start <= a.to);
      if (
        trip &&
        breaks(later(first, trip.from), earlier(reference, trip.to))
      ) {
        start = addDays(trip.to, 1);
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
  if (ancestryExpiry) {
    const run = runAt(ancestryExpiry);
    if (!run.episodes.length) return undefined;
    const result = asOf(run, ancestryExpiry, application);
    return result.completion <= ancestryExpiry ? result : undefined;
  }
  const run = runAt(application);
  if (!run.episodes.length) return undefined;
  const advance = cl.values.continuousResidenceReferenceDays.value;
  for (let day = 0; day <= advance; day++) {
    const reference = addDays(application, day);
    const observed = day === 0 ? run : runAt(reference);
    if (
      !observed.episodes.length ||
      addYears(observed.episodes[0].validFrom, years) > reference
    )
      continue;
    const result = asOf(observed, reference, application);
    if (result.completion <= reference) return result;
  }
  // Projection assumes qualifying permission continues from the application
  // date. Re-anchor CR 3.2 on each projected application date.
  let next = later(
    addDays(application, 1),
    addDays(addYears(run.episodes[0].validFrom, years), -advance),
  );
  const hasFixedAbsences =
    absenceDays(
      fixed,
      run.episodes[0].validFrom,
      fixed.at(-1)?.to ?? application,
    ) > calendarLimit.maxDays;
  for (;;) {
    const reference = addDays(next, advance);
    const result = asOf(run, reference, next);
    if (result.completion <= reference) return result;
    // Without fixed anniversary windows a later reference can only retain or
    // move forward the earliest valid start, so skip dates already ruled out.
    next = hasFixedAbsences
      ? addDays(next, 1)
      : addDays(result.completion, -advance);
  }
}
