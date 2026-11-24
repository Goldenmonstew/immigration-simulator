import { greeceFull2026_11 } from '@uk-immigration/policy-data';
import { addDays, addYears, daysBetween } from './dates';
import type { GrPathway, GrTrip } from './greece';
import {
  absencePeriods,
  residenceBreaks,
  type GrContext,
} from './greece-rules';
import { Days, HORIZON_YEARS, monthSpan } from './pilot';
import type { IsoDate } from './types';

/** Article 45 long-term mobility. The Greek dates describe the current unbroken Blue Card period. */
export interface GrBlueCardMobility {
  usedLongTermMobility?: boolean;
  greekBlueCardFrom?: IsoDate;
  greekBlueCardThrough?: IsoDate;
  /** Established start of continuous lawful residence in Greece on the Greek Blue Card. */
  greekResidenceFrom?: IsoDate;
  /** Qualifying residence before the current Greek Blue Card, including earlier periods in Greece. */
  priorMemberPeriods?: {
    from: IsoDate;
    through: IsoDate;
    /** Only permits issued by Greece engage the domestic article 90(1) exclusion. */
    issuer?: 'greece' | 'other-member-state';
    kind:
      | 'blue-card'
      | 'highly-qualified'
      | 'researcher'
      | 'student'
      | 'international-protection';
  }[];
  /** Temporary absences from the other Member States of residence, excluding the move to Greece. */
  otherMemberTrips?: GrTrip[];
}

export function blueMobilityTiming(
  mobility: GrBlueCardMobility,
  greekTrips: GrTrip[] | undefined,
  sim: IsoDate,
  { L }: GrContext,
): GrPathway {
  const { value: rule, sources } = greeceFull2026_11.values.blueCardMobility;
  const from = mobility.greekBlueCardFrom;
  const title = L('蓝卡跨成员国居留', 'Long-term mobility on an EU Blue Card');
  const residence = L(
    `成员国合计 ${rule.memberYears} 年，递件前连续 ${rule.greekYears} 年持希腊蓝卡；符合条件的学习居留折半。`,
    `${rule.memberYears} years across Member States including the final ${rule.greekYears} continuous years on a Greek Blue Card. Eligible study counts at half weight.`,
  );
  const single = L(
    `每次离境须短于 ${rule.singleAbsenceMonths} 个月。`,
    `Each absence must be shorter than ${rule.singleAbsenceMonths} months.`,
  );
  const total = L(
    `合计离境不超过 ${rule.totalAbsenceMonths} 个月。`,
    `Absences must total at most ${rule.totalAbsenceMonths} months.`,
  );
  const checks: GrPathway['checks'] = [residence, single, total].map(
    (text) => ({ text, sources }),
  );
  const result: GrPathway = {
    id: 'GR-LONG-TERM',
    title,
    status: 'UNKNOWN',
    checks,
    summary: L(
      '请补充长期流动手续、成员国居留及离境记录。',
      'Provide the long-term mobility decision, residence periods and absences in the Member States.',
    ),
    assumptions: [],
    notChecked: [],
  };
  if (
    !from ||
    !mobility.priorMemberPeriods ||
    !greekTrips ||
    !mobility.otherMemberTrips
  )
    return result;
  // A study day contributes one half-day. Overlapping permits contribute at most one full day.
  const days = new Days(
    addDays(addYears(sim, -2 * rule.memberYears), -1),
    addYears(sim, HORIZON_YEARS),
  );
  const full: boolean[] = [];
  const study: boolean[] = [];
  days.mark(full, from, mobility.greekBlueCardThrough);
  for (const period of mobility.priorMemberPeriods)
    days.mark(
      period.kind === 'student' ? study : full,
      period.from,
      period.through,
    );
  const credits = [0];
  const runStart: number[] = [];
  for (let i = 0; i < days.count; i++) {
    const weight = full[i] ? 2 : study[i] ? 1 : 0;
    credits.push(credits[i] + weight);
    runStart.push(weight ? (runStart[i - 1] ?? i) : i + 1);
  }
  const trips = [...greekTrips, ...mobility.otherMemberTrips];
  const breaks = residenceBreaks(trips, rule.singleAbsenceMonths);
  const away: boolean[] = [];
  for (const trip of trips)
    days.mark(away, addDays(trip.departed, 1), addDays(trip.returned, -1));
  const absenceDays = days.sums((i) => away[i]);
  const [min, max] = monthSpan(rule.totalAbsenceMonths);
  const greekAnniversary = addYears(from, rule.greekYears);
  for (let i = days.index(sim); i < days.count; i++) {
    const date = days.date(i);
    const anniversary = addYears(date, -rule.memberYears);
    const need = 2 * daysBetween(anniversary, date);
    let start = runStart[i - 1];
    const enough = credits[i] - credits[start] >= need;
    if (enough) {
      // Select the shortest uninterrupted qualifying window ending immediately before filing.
      let high = i;
      while (start < high) {
        const mid = Math.ceil((start + high) / 2);
        if (credits[i] - credits[mid] >= need) start = mid;
        else high = mid - 1;
      }
    } else start = days.index(anniversary);
    const held =
      date >= greekAnniversary &&
      (!mobility.greekBlueCardThrough || date <= mobility.greekBlueCardThrough);
    const absence = absenceDays[i] - absenceDays[start];
    const withinSingle =
      !absence ||
      !breaks.some((a) => a.returned > days.date(start) && a.reachedOn <= date);
    const withinTotal =
      absence <= min ? true : absence > max ? false : undefined;
    // Article 43(3) relaxes absences for the Member State total in (2)(a).
    // Card validity alone does not establish the separate Greek residence in (2)(b).
    const greekResidence = mobility.greekResidenceFrom
      ? date >= addYears(mobility.greekResidenceFrom, rule.greekYears)
      : !absencePeriods(greekTrips, addYears(date, -rule.greekYears), date)
          .length || undefined;
    if (date === sim) {
      checks[0].met = enough && held && greekResidence;
      checks[1].met = withinSingle;
      checks[2].met = withinTotal;
    }
    if (
      !enough ||
      !held ||
      greekResidence === false ||
      !withinSingle ||
      withinTotal === false
    )
      continue;
    if (greekResidence === undefined) {
      result.summary = L(
        '最后一段希腊蓝卡有效期内有离境记录。请核实以蓝卡在希连续合法居留的实际起日。',
        'Travel overlaps the final Greek Blue Card period. Confirm when continuous lawful residence in Greece on that card began.',
      );
      return result;
    }
    if (withinTotal === undefined || mobility.usedLongTermMobility !== true) {
      if (withinTotal === undefined) {
        result.pendingDetails = ['PD-305'];
        result.summary = L(
          '累计离境月数处于按日换算的边界，须核实。',
          'The total absence is on the boundary of the calendar-month conversion.',
        );
      }
      return result;
    }
    result.status = date === sim ? 'MET' : 'FUTURE';
    result.earliestDate = date;
    result.summary = L(
      `蓝卡跨成员国期间计入后可于 ${date} 递件。`,
      `The filing date with qualifying Blue Card mobility periods is ${date}.`,
    );
    return result;
  }
  result.status = 'NOT_MET';
  result.summary = L(
    '录入的居留与离境期间未达到蓝卡累计条件。',
    'The recorded periods do not satisfy the cumulative Blue Card requirements.',
  );
  return result;
}
