import { japan2026_11 as jp } from '@uk-immigration/policy-data';
import type { SourceRef } from '@uk-immigration/policy-data';
import {
  addDays,
  addMonths,
  addYears,
  daysBetween,
  overlapDays,
} from './dates';
import { HORIZON_YEARS, afterYears, monthSpan } from './pilot';
import type {
  PilotCheck,
  PilotPathway,
  PilotResult,
  PilotStatus,
} from './pilot';
import { textFor } from './rule';
import type { IsoDate, Locale } from './types';

// Japan pilot (phase 19, task 70): permanent residence (永住許可, Immigration
// Control Act art. 22 and the agency's guidelines), naturalisation (帰化,
// Nationality Act art. 5 and 7) and the re-entry permits that keep a stay
// unbroken (art. 26, 26-2). Points, income, tax and conduct are out of scope.

export const JP_PR_ROUTES = [
  'general',
  'spouse',
  'child',
  'child-birth',
  'teijusha',
  'refugee',
  'hsp70',
  'hsp80',
] as const;
export type JpPrRoute = (typeof JP_PR_ROUTES)[number];

export const JP_NATURALISATION_ROUTES = ['general', 'spouse'] as const;
export type JpNaturalisationRoute = (typeof JP_NATURALISATION_ROUTES)[number];

/** Left Japan on `departed`, came back on `returned`. */
export interface JpTrip {
  departed: IsoDate;
  returned: IsoDate;
  /**
   * Left on a regular re-entry permit (再入国許可) and came back while it was
   * valid; otherwise the deemed permit (みなし再入国許可) applies.
   */
  reentryPermit?: boolean;
  /**
   * Last day of the period of stay held when leaving; absent = it did not
   * end before the return (a permanent resident has none).
   */
  stayExpiry?: IsoDate;
  /**
   * A renewal or change of status was applied for before `stayExpiry` and
   * was still pending when leaving (art. 20(6), FAQ Q61).
   */
  renewalPending?: boolean;
}

/** Both days included. */
export interface JpPeriod {
  from: IsoDate;
  to: IsoDate;
}

export type JpPrRequest =
  | {
      route: 'general';
      /**
       * First day on a work or residence status, held since; 'none' = no
       * such status held yet (such as only Specified Skilled Worker (i)).
       */
      statusStart: IsoDate | 'none';
      /**
       * The same under the 2026-10-01 guideline, which no longer counts
       * Intra-company Transferee and others as work statuses; absent = as
       * `statusStart`, 'none' = no such status held yet.
       */
      newStatusStart?: IsoDate | 'none';
      /**
       * Stays that do not count towards the 10 years, such as temporary
       * Designated Activities (2026-10-01 guideline 第5).
       */
      excluded?: JpPeriod[];
    }
  | {
      route: 'teijusha' | 'refugee' | 'hsp70' | 'hsp80';
      /**
       * teijusha: first day as 定住者; refugee: recognition date; hsp: first
       * day with the points, kept since.
       */
      statusStart: IsoDate;
    }
  /** Spouse of a Japanese national or permanent resident. */
  | { route: 'spouse'; marriedLifeFrom: IsoDate }
  /**
   * Born in Japan, acquiring status after birth (art. 22-2) rather than
   * changing it.
   */
  | { route: 'child-birth'; bornOn: IsoDate }
  | { route: 'child' };

export type JpNaturalisationRequest =
  | {
      route: 'general';
      dateOfBirth: IsoDate;
      /**
       * Age of majority under the home country's law (art. 5(1)(ii));
       * absent = the user confirmed it is no higher than Japan's age.
       */
      homeMajorityAge?: number;
    }
  /** Spouse of a Japanese national: the day the marriage was registered. */
  | { route: 'spouse'; marriedOn: IsoDate };

export interface JpRequest {
  simulationDate: IsoDate;
  /** First day of the current stay in Japan (the landing date). */
  stayStart: IsoDate;
  trips: JpTrip[];
  pr: JpPrRequest;
  naturalisation: JpNaturalisationRequest;
  locale?: Locale;
}

export type JpPathwayId = 'JP-PR' | 'JP-NATURALISATION';
export type JpPathway = PilotPathway<JpPathwayId>;
export type JpResult = PilotResult<JpPathwayId>;

const v = jp.values;
/** English count: "1 trip", "3 trips". */
const count = (n: number, word: string) => `${n} ${word}${n === 1 ? '' : 's'}`;
type Verdict = 'yes' | 'maybe' | 'no';
/** old: the 2026-02-24 guideline; new: the 2026-10-01 one. */
type Guideline = 'old' | 'new';
const NEW_GUIDELINE = 'https://www.moj.go.jp/isa/10_00279.html';

/** A period that must have passed, as it stands on one date. */
interface Need {
  years: number;
  /** A stay in Japan, rather than a marriage. */
  stay: boolean;
  /** maybe: met only on an unsettled reading. */
  state: Verdict;
  text: string;
  sources: SourceRef[];
}

/**
 * Last day on the period of stay held when leaving: with a renewal pending,
 * the status lasts until the decision or 2 months after expiry (art. 20(6)),
 * and a re-entry must come back by then (FAQ Q61; the decision is taken as
 * granted). Undefined when no period of stay was entered.
 */
export const jpStayLimit = (
  t: Pick<JpTrip, 'stayExpiry' | 'renewalPending'>,
): IsoDate | undefined =>
  t.stayExpiry && t.renewalPending
    ? addMonths(t.stayExpiry, v.renewalPendingMonths.value)
    : t.stayExpiry;

const metOf = (state: Verdict) =>
  state === 'yes' ? true : state === 'no' ? false : undefined;

export function evaluateJapan(req: JpRequest): JpResult {
  const L = textFor(req);
  const sim = req.simulationDate;
  // To the anniversary, so a 29 February date reaches 1 March.
  const horizon = daysBetween(sim, afterYears(sim, HORIZON_YEARS));
  const switchDate = v.newGuidelineFrom.value;
  const lastOld = addDays(switchDate, -1);
  const guideline = (d: IsoDate): Guideline => (d < switchDate ? 'old' : 'new');
  const reached = (d: IsoDate, from: IsoDate, years: number): Verdict =>
    d >= afterYears(from, years) ? 'yes' : 'no';

  // The status ends on a trip past the period of stay, or past the deemed
  // permit's year without a regular permit (art. 26-2(2)); the stay starts
  // again on return (PD-136).
  const pastExpiry = (t: JpTrip) => {
    const limit = jpStayLimit(t);
    return !!limit && t.returned > limit;
  };
  const lapsed = req.trips
    .filter(
      (t) =>
        pastExpiry(t) ||
        (!t.reentryPermit &&
          t.returned > addYears(t.departed, v.deemedReentryYears.value)),
    )
    .sort((a, b) => (a.departed < b.departed ? -1 : 1));
  /** First day of the stay that is unbroken on `d`. */
  const stayFrom = (d: IsoDate) =>
    lapsed
      .filter((t) => t.departed < d)
      .reduce((s, t) => (t.returned > s ? t.returned : s), req.stayStart);
  /** `from`, or the start of the unbroken stay if later. */
  const since = (d: IsoDate, from: IsoDate) => {
    const stay = stayFrom(d);
    return from > stay ? from : stay;
  };
  /** Abroad all day on `d`: applications are made in person in Japan. */
  const abroad = (d: IsoDate) =>
    req.trips.some((t) => t.departed < d && d < t.returned);
  // On a trip under way on the simulation date, the checks describe the
  // planned return, as the projected dates do.
  const ongoing = req.trips.find((t) => t.departed < sim && sim < t.returned);
  const at = ongoing ? ongoing.returned : sim;
  const forecast = ongoing
    ? L(
        `模拟日在境外（${ongoing.departed} 至 ${ongoing.returned} 的出境），检查项按计划返回日 ${at} 计算。`,
        ` You are abroad on the simulation date (the trip from ${ongoing.departed} to ${ongoing.returned}), so the checks are worked out for the planned return on ${at}.`,
      )
    : '';
  /**
   * Trips under way on any day of [from, to], travel days included; a lapse
   * is left out, since the stay counted starts on its return.
   */
  const tripsTouching = (from: IsoDate, to: IsoDate) =>
    req.trips.filter(
      (t) => !lapsed.includes(t) && t.departed <= to && t.returned >= from,
    );
  /** Trips touching the `years` before `d`. */
  const tripsBefore = (d: IsoDate, years: number) =>
    tripsTouching(addYears(d, -years), addDays(d, -1));
  /** Trips with a whole day abroad in [from, to]. */
  const tripsIn = (from: IsoDate, to: IsoDate) =>
    req.trips.filter(
      (t) => addDays(t.departed, 1) <= to && addDays(t.returned, -1) >= from,
    );
  /** Whole days abroad in [from, to]: travel days count as days in Japan. */
  const daysAbroad = (from: IsoDate, to: IsoDate) =>
    req.trips.reduce(
      (n, t) =>
        n +
        overlapDays(addDays(t.departed, 1), addDays(t.returned, -1), from, to),
      0,
    );
  const firstDate = (
    ok: (d: IsoDate) => boolean,
    from: IsoDate = sim,
  ): IsoDate | undefined => {
    for (let i = daysBetween(sim, from); i <= horizon; i++) {
      const d = addDays(sim, i);
      if (ok(d)) return d;
    }
    return undefined;
  };
  // A date reached only on an uncertain reading is not the earliest date.
  const statusOf = (earliest?: IsoDate, possible?: IsoDate): PilotStatus =>
    possible !== earliest
      ? 'UNKNOWN'
      : !earliest
        ? 'NOT_MET'
        : earliest === sim
          ? 'MET'
          : 'FUTURE';
  const lapseNotes = lapsed.map((t) =>
    pastExpiry(t)
      ? L(
          `${t.departed} 至 ${t.returned} 的出境在 ${jpStayLimit(t)} 之后才返回（在留期限${t.renewalPending ? `届满后 ${v.renewalPendingMonths.value} 个月，更新申请中` : ''}），在留资格消灭，连续在留从 ${t.returned} 重新起算。`,
          ` The trip from ${t.departed} to ${t.returned} came back after ${jpStayLimit(t)} (${t.renewalPending ? `${v.renewalPendingMonths.value} months after your period of stay ended, with a renewal pending` : 'the end of your period of stay'}), so the status ended and the unbroken stay starts again on ${t.returned}.`,
        )
      : L(
          `${t.departed} 至 ${t.returned} 的出境没有再入国许可、超过みなし再入国许可的 ${v.deemedReentryYears.value} 年期限，在留资格消灭，连续在留从 ${t.returned} 重新起算。`,
          ` The trip from ${t.departed} to ${t.returned} had no re-entry permit and went past the ${v.deemedReentryYears.value}-year deemed permit, so the status ended and the unbroken stay starts again on ${t.returned}.`,
        ),
  );
  const projection = L(
    '最早日期假设模拟日之后一直在日本（已录入的未来出境除外），在留资格按时更新，婚姻等身份持续。',
    'Projected dates assume you stay in Japan after the simulation date (apart from trips you entered), renew your status on time and stay married where that counts.',
  );
  const anniversary = L(
    '年限按周年计：起算日 N 年后的同一天起算满足（2 月 29 日起算的取 3 月 1 日）；按民法初日不算入的严格读法可能晚一天，审查实际怎么数没有公开。须本人在日本递交，整天在境外的日子不作为递交日（PD-130）。',
    'Years run to the anniversary: N years after the start date counts as met (from 29 February, 1 March). On the strict Civil Code reading, which leaves out the first day, it could be a day later; how the authorities count is not published. You apply in person in Japan, so a day spent wholly abroad is not an application date (PD-130).',
  );
  const reentry = L(
    `出境没有勾选"持再入国许可"的，按みなし再入国许可：须在出国日 ${v.deemedReentryYears.value} 年后的同一天之前返回；填了出境时的在留期限的，返回日也不能晚于该期限（勾选的同样；出境时更新申请中的，为期限届满后 ${v.renewalPendingMonths.value} 个月，假设结果为许可）。超过即在留资格消灭、连续在留从返回日重新起算；没填在留期限的假设它没有先到期，勾选的按在许可有效期内返回计（PD-136）。`,
    `A trip without "re-entry permit" ticked uses the deemed permit: you must be back by the same date ${v.deemedReentryYears.value} year after leaving; if you entered the period of stay you held when leaving, you must also be back by its last day (ticked or not; with a renewal pending when you left, ${v.renewalPendingMonths.value} months after it, assuming the renewal is granted). Otherwise the status ends and the unbroken stay starts again when you return. Without a period of stay entered, it is taken not to have ended first, and a ticked trip is taken as returning while the permit was valid (PD-136).`,
  );
  const inJapan = (sources: SourceRef[]): PilotCheck[] =>
    abroad(sim)
      ? [
          {
            text: L(
              '模拟日在日本（须本人在日本递交）',
              'In Japan on the simulation date (you apply in person in Japan)',
            ),
            met: false,
            sources,
          },
        ]
      : [];
  const listed = new Set(v.nationalHolidays.value);
  const listedYears = new Set(
    v.nationalHolidays.value.map((d) => d.slice(0, 4)),
  );
  const dayOfWeek = (d: IsoDate) => new Date(`${d}T00:00:00Z`).getUTCDay();
  /**
   * National holidays by the holidays law (art. 2, 3) for a year with no
   * almanac list: those sure without the equinoxes, and those once the
   * predicted equinoxes are added.
   */
  const byLaw = (year: string) => {
    const monday = (month: string, nth: number) => {
      let d = `${year}-${month}-01`;
      while (dayOfWeek(d) !== 1) d = addDays(d, 1);
      return addDays(d, 7 * (nth - 1));
    };
    const base = [
      ...v.fixedHolidays.value.map((md) => `${year}-${md}`),
      ...Object.entries(v.mondayHolidays.value).map(([m, n]) => monday(m, n)),
    ];
    // Substitute day after a Sunday holiday (art. 3(2)) and a day between
    // two holidays (art. 3(3)).
    const withRest = (days: IsoDate[]) => {
      const set = new Set(days);
      for (const d of days) {
        if (dayOfWeek(d) === 0) {
          let x = addDays(d, 1);
          while (days.includes(x)) x = addDays(x, 1);
          set.add(x);
        }
        if (days.includes(addDays(d, 2)) && !days.includes(addDays(d, 1)))
          set.add(addDays(d, 1));
      }
      return set;
    };
    return {
      sure: withRest(base),
      withEquinox: withRest([
        ...base,
        ...v.predictedEquinoxes.value.filter((d) => d.startsWith(year)),
      ]),
    };
  };
  const lawYears = new Set(
    v.predictedEquinoxes.value.map((d) => d.slice(0, 4)),
  );
  /**
   * Offices closed on `d` (休日法 第1条): maybe for a day that is a holiday
   * only if the predicted equinox holds, or any weekday in a year neither
   * listed nor predicted.
   */
  const closed = (d: IsoDate): Verdict => {
    const md = d.slice(5);
    const year = d.slice(0, 4);
    if (
      [0, 6].includes(dayOfWeek(d)) ||
      md >= v.yearEndClosureFrom.value ||
      md <= v.yearEndClosureTo.value
    )
      return 'yes';
    if (listedYears.has(year)) return listed.has(d) ? 'yes' : 'no';
    if (!lawYears.has(year)) return 'maybe';
    const law = byLaw(year);
    return law.sure.has(d) ? 'yes' : law.withEquinox.has(d) ? 'maybe' : 'no';
  };
  /**
   * When `d` is (or may be) a closed day, the next open day on which `ok`
   * (the pathway's own test: in Japan, requirements met) also holds. ISA
   * counters take filings on working days; naturalisation is filed in
   * person at the Legal Affairs Bureau.
   */
  const filingNote = (
    d: IsoDate,
    ok: (x: IsoDate) => boolean,
    office: 'isa' | 'bureau',
    candidate = false,
  ) => {
    const state = closed(d);
    if (state === 'no') return '';
    // Only a day that passed the checks, within the search horizon.
    const end = addDays(sim, horizon);
    let open: IsoDate | undefined;
    for (let x = addDays(d, 1); !open && x <= end; x = addDays(x, 1))
      if (closed(x) !== 'yes' && ok(x)) open = x;
    const where = !open
      ? L(
          '之后可递交的开放日超出试点的 10 年计算范围',
          'the next open day you could file on is beyond the 10 years the pilot looks ahead',
        )
      : office === 'isa'
        ? L(
            `窗口在平日受理，最早可在 ${open} 递交（SRC-112、SRC-119）`,
            `the counters take filings on working days, so you can file from ${open} (SRC-112, SRC-119)`,
          )
        : L(
            `之后最早的开放日是 ${open}；帰化须本人到法务局递交，实际日期以法务局的安排为准（SRC-112、SRC-117 Q10）`,
            `the next open day is ${open}; naturalisation is filed in person at the Legal Affairs Bureau, so the actual date depends on the bureau (SRC-112, SRC-117 Q10)`,
          );
    return (
      (candidate
        ? L(`若候选日期 ${d} 成立：`, ` If the candidate date ${d} holds:`)
        : '') +
      (state === 'yes'
        ? L(
            `${d} 是行政机关休日，${where}。`,
            ` ${d} is a day the offices are closed; ${where}.`,
          )
        : L(
            `${d} 按国立天文台的预测是春分日或秋分日（或因此成为休日），若正式公布为休日，${where}。`,
            ` ${d} is a predicted equinox day (or a holiday because of one); if it is confirmed as a holiday, ${where}.`,
          )) +
      (open && closed(open) === 'maybe'
        ? L(
            `${open} 按国立天文台的预测历推算，若正式公布为休日，则顺延到其后的开放日（PD-130）。`,
            ` ${open} rests on the predicted calendar; if it is confirmed as a holiday, it moves to the next open day (PD-130).`,
          )
        : '')
    );
  };
  const pathways: JpPathway[] = [];

  // ---------- Permanent residence (art. 22, guidelines) ----------
  if (req.pr.route === 'child-birth') {
    // Born in Japan: apply to acquire the status within the days after
    // birth (art. 22-2(2), (4)); the guideline's years are for a change.
    const born = req.pr.bornOn;
    const days = v.birthAcquisitionDays.value;
    const raw = addDays(born, days);
    // A deadline on a closed day moves to the next day (休日法 第2条):
    // at least past the days surely closed; a day that may be closed (the
    // equinox of a year not yet listed) leaves it open until an open day.
    let deadline = raw;
    while (closed(deadline) === 'yes') deadline = addDays(deadline, 1);
    const exact = closed(deadline) === 'no';
    let latest = deadline;
    while (latest < sim && closed(latest) !== 'no') latest = addDays(latest, 1);
    // Counting the birth day as the first of the days (a city's example)
    // ends a day earlier; where that changes the answer, it is uncertain
    // (PD-130).
    let early = addDays(raw, -1);
    while (closed(early) === 'yes') early = addDays(early, 1);
    // The child's first trip abroad starting by the deadline: filing is in
    // Japan before it (PD-160).
    const out = req.trips
      .filter((t) => t.departed >= born && t.departed <= deadline)
      .sort((a, b) => (a.departed < b.departed ? -1 : 1))[0];
    const lastDay = out && out.departed < deadline ? out.departed : deadline;
    const canFile = (x: IsoDate) =>
      x <= lastDay && closed(x) !== 'yes' && !abroad(x);
    let fileOn: IsoDate | undefined = sim < born ? born : sim;
    while (fileOn && !canFile(fileOn))
      fileOn = fileOn < lastDay ? addDays(fileOn, 1) : undefined;
    const timeStatus: PilotStatus =
      sim < born
        ? 'FUTURE'
        : sim <= early
          ? 'MET'
          : sim <= deadline
            ? 'UNKNOWN'
            : exact || latest < sim
              ? 'NOT_MET'
              : 'UNKNOWN';
    // No day left to file in Japan: abroad past the deadline, or back
    // within it after leaving (PD-160).
    const stranded = !!out && !fileOn && sim <= deadline;
    const status: PilotStatus = stranded
      ? out.returned > deadline
        ? 'NOT_MET'
        : 'UNKNOWN'
      : timeStatus;
    const when = L(
      `出生之日起 ${days} 日为 ${raw}${deadline === raw ? '' : `，遇行政机关休日顺延至 ${deadline}`}${exact ? '' : lawYears.has(deadline.slice(0, 4)) ? `；${deadline} 是否为春分日或秋分日（或因此成为休日）要到前一年 2 月才正式公布，期限可能再顺延（PD-130）` : `；试点没有收录 ${deadline.slice(0, 4)} 年的国民の祝日，期限可能再顺延（PD-130）`}`,
      `${days} days from birth is ${raw}${deadline === raw ? '' : `, moved to ${deadline} past days the offices are closed`}${exact ? '' : lawYears.has(deadline.slice(0, 4)) ? `; whether ${deadline} is an equinox day (or a holiday because of one) is fixed only in February of the year before, so it may move later still (PD-130)` : `; the pilot does not cover national holidays for ${deadline.slice(0, 4)}, so it may move later still (PD-130)`}`,
    );
    const late = L(
      '已持有其他在留资格的，可改选"实子等（在留资格变更）"按在留年限计算；还没有在留资格的，请尽快联系地方出入国在留管理局。',
      ' If the child already holds another status, choose the child route for a change of status, which counts years of stay; if the child has no status yet, contact the regional immigration services bureau promptly.',
    );
    pathways.push({
      id: 'JP-PR',
      title: L('永住许可（永住許可）', 'Permanent residence (永住許可)'),
      status,
      earliestDate:
        status === 'MET' ? sim : status === 'FUTURE' ? born : undefined,
      summary: stranded
        ? (out.returned > deadline
            ? L(
                `孩子 ${out.departed} 出境、${out.returned} 才回到日本，申请期限（${when}）内已没有能在日本递交的日子；按出生取得的申请由在日本在留的孩子提出（入管法第22条の2第2項，SRC-119 申請提出者）。`,
                `The child left on ${out.departed} and is back only on ${out.returned}, so no day is left within the time allowed (${when}) to file in Japan; the application after birth is made for a child staying in Japan (art. 22-2(2), SRC-119).`,
              )
            : L(
                `孩子 ${out.departed} 出境、${out.returned} 回到日本，仍在申请期限（${when}）内；回国时要经过上陆手续，而第22条の2适用于未经上陆手续在日本在留的人，回国后能否仍按出生取得申请没有写明（PD-160）。`,
                `The child left on ${out.departed} and is back on ${out.returned}, still within the time allowed (${when}); coming back goes through landing, while art. 22-2 covers people staying without landing, and whether the application after birth is still open is not stated (PD-160).`,
              )) + late
        : status === 'NOT_MET'
          ? L(
              `出生后取得在留资格的申请期限（${when}）已过。`,
              `The time to apply to acquire status after birth (${when}) has passed.`,
            ) + late
          : status === 'UNKNOWN' && sim <= deadline
            ? L(
                `出生之日起 ${days} 日按初日不算入到 ${deadline}；若连出生当天算作第 1 天，到 ${early} 为止。入管厅没有写明哪一种，模拟日在这两种期限之间，待确认（PD-130）。`,
                `${days} days from birth run to ${deadline} if the birth day is left out, or to ${early} if it counts as the first day; the agency does not say which, and the simulation date falls between them, so it is uncertain (PD-130).`,
              )
            : status === 'UNKNOWN'
              ? L(
                  `出生后取得在留资格的申请期限至少到 ${deadline}（${when}），模拟日是否仍在期限内待确认。`,
                  `The time to apply to acquire status after birth runs at least to ${deadline} (${when}); whether the simulation date is still within it is uncertain.`,
                ) + late
              : L(
                  `在日本出生的，可在申请期限内申请取得永住者资格，不必等在留年限（${when}）${status === 'MET' ? '；模拟日在期限内' : `；出生后（${born} 起）才能递交`}。`,
                  `Born in Japan, you can apply to acquire permanent resident status within the time allowed, without waiting for years of stay (${when})${status === 'MET' ? '; the simulation date is within it' : `; you can apply from the birth (${born})`}.`,
                ) +
                (out
                  ? L(
                      `孩子计划 ${out.departed} 出境，须在出境前递交。`,
                      ` The child is due to leave on ${out.departed}, so file before that.`,
                    )
                  : '') +
                filingNote(status === 'MET' ? sim : born, canFile, 'isa'),
      checks: [
        {
          text: L(
            `在申请期限内（${born} 至 ${deadline}${exact ? '' : ' 或更晚'}）递交取得在留资格的申请`,
            `Apply to acquire status within the time allowed (${born} to ${deadline}${exact ? '' : ' or later'})`,
          ),
          met: status === 'UNKNOWN' ? undefined : status === 'MET',
          sources: [
            ...v.birthAcquisitionDays.sources,
            ...v.yearEndClosureFrom.sources,
            ...v.nationalHolidays.sources,
          ],
        },
      ],
      notChecked: [
        L(
          '父母是否为日本人、永住者或特別永住者，以及永住是否合于日本国利益等其他要件（入管法第22条第2項、第22条の2第4項）',
          'Whether a parent is a Japanese national, permanent resident or special permanent resident, and the other requirements such as permanent residence being in Japan’s interest (art. 22(2), 22-2(4))',
        ),
      ],
      assumptions: [
        L(
          `${days} 日从出生次日起算（民法初日不算入），到出生后第 ${days} 天为止；落在行政机关休日（周六、周日、国民の祝日与 ${v.yearEndClosureFrom.value} 至 ${v.yearEndClosureTo.value}）的顺延到其后第一个开放日。国民の祝日按国立天文台暦要項收录 ${v.nationalHolidays.value[0].slice(0, 4)}–${v.nationalHolidays.value.at(-1)!.slice(0, 4)} 年；之后的年份按祝日法第2、3条推算，春分日、秋分日只有国立天文台的预测，期限取决于它们时待确认；更早的年份未收录，期限之后的日期待确认。窗口只在平日受理，永住申请不在网上申请范围内（PD-130）。`,
          `The ${days} days run from the day after birth (the Civil Code leaves out the first day), up to the ${days}th day after birth; a deadline on a day the offices are closed (Saturdays, Sundays, national holidays and ${v.yearEndClosureFrom.value} to ${v.yearEndClosureTo.value}) moves to the next open day. National holidays are listed from the National Astronomical Observatory almanac for ${v.nationalHolidays.value[0].slice(0, 4)}–${v.nationalHolidays.value.at(-1)!.slice(0, 4)}; later years follow the holidays law (art. 2, 3), with only predicted equinox days, so a result that turns on one is uncertain; earlier years are not listed, so dates after a deadline there are uncertain. Counters take filings on working days only, and permanent residence cannot be applied for online (PD-130).`,
        ),
      ],
      pendingDetails: ['PD-130', ...(out ? ['PD-160'] : [])],
    });
  } else {
    const pr = req.pr;
    const special = pr.route !== 'general';
    const needs = (d: IsoDate): Need[] => {
      const g = guideline(d);
      const stay = stayFrom(d);
      const stayNeed = (years: number, sources: SourceRef[]): Need => ({
        years,
        stay: true,
        state: reached(d, stay, years),
        text: L(
          `自 ${stay} 起在日本连续在留满 ${years} 年`,
          `${count(years, 'year')} of unbroken stay in Japan since ${stay}`,
        ),
        sources,
      });
      switch (pr.route) {
        case 'general': {
          const years = v.prStayYears.value;
          // Excluded stays (第5の1): counting again after them is sure;
          // under the new guideline, leaving them out of an unbroken stay
          // may be enough, and the old guideline does not mention them
          // (PD-134).
          const excluded = (pr.excluded ?? []).filter(
            (p) => p.from < d && p.to >= stay,
          );
          const restart = excluded.reduce((s, p) => {
            const after = addDays(p.to, 1);
            return after > s ? after : s;
          }, stay);
          const excludedDays = excluded.reduce(
            (n, p) => n + overlapDays(p.from, p.to, stay, addDays(d, -1)),
            0,
          );
          const lenient =
            g === 'new'
              ? addDays(afterYears(stay, years), excludedDays)
              : afterYears(stay, years);
          // No status the guideline counts: its 5 years cannot start
          // (SRC-113 1(3)ア, SRC-114 注2).
          const start =
            g === 'new'
              ? (pr.newStatusStart ?? pr.statusStart)
              : pr.statusStart;
          const none = start === 'none';
          const from = since(d, none ? stay : start);
          const statusYears = v.prStatusYears.value;
          return [
            excluded.length
              ? {
                  years,
                  stay: true,
                  state:
                    reached(d, restart, years) === 'yes'
                      ? 'yes'
                      : d >= lenient
                        ? 'maybe'
                        : 'no',
                  text: L(
                    `自 ${stay} 起在日本连续在留满 ${years} 年，其中 ${excludedDays} 天属不计入 ${years} 年的期间（按其后重新起算，自 ${restart} 起）`,
                    `${years} years of unbroken stay in Japan since ${stay}, ${excludedDays} days of it not counting towards the ${years} years (counting again after them, since ${restart})`,
                  ),
                  sources: [
                    ...v.prStayYears.sources,
                    {
                      srcId: 'SRC-114',
                      locator: '第5の1 (p12)',
                      url: `${NEW_GUIDELINE}#midashi05`,
                    },
                  ],
                }
              : stayNeed(years, v.prStayYears.sources),
            {
              years: statusYears,
              stay: true,
              state: none ? 'no' : reached(d, from, statusYears),
              text: none
                ? g === 'new'
                  ? L(
                      `其中以新版指南认可的就労资格或居住资格连续在留满 ${statusYears} 年：目前持有的资格（如企業内転勤）新版不认可，尚未起算`,
                      `Of that, ${statusYears} years in a row on a status the new guideline counts as work or residence: your current status (such as Intra-company Transferee) does not count, so they have not started`,
                    )
                  : L(
                      `其中以就労资格或居住资格连续在留满 ${statusYears} 年：目前持有的资格（如技能実習、特定技能1号）不算，尚未起算`,
                      `Of that, ${statusYears} years in a row on a work or residence status: your current status (such as Technical Intern Training or Specified Skilled Worker (i)) does not count, so they have not started`,
                    )
                : g === 'new'
                  ? L(
                      `其中自 ${from} 起以新版指南认可的就労资格或居住资格连续在留满 ${statusYears} 年`,
                      `Of that, ${statusYears} years in a row since ${from} on a status the new guideline counts as work or residence`,
                    )
                  : L(
                      `其中自 ${from} 起以就労资格或居住资格连续在留满 ${statusYears} 年`,
                      `Of that, ${statusYears} years in a row on a work or residence status since ${from}`,
                    ),
              sources: v.prStatusYears.sources,
            },
          ];
        }
        case 'spouse': {
          const years = v.spouseMarriageYears.value[g];
          return [
            {
              years,
              stay: false,
              state: reached(d, pr.marriedLifeFrom, years),
              text: L(
                `自 ${pr.marriedLifeFrom} 起实际婚姻生活满 ${years} 年`,
                `${years} years of married life since ${pr.marriedLifeFrom}`,
              ),
              sources: v.spouseMarriageYears.sources,
            },
            stayNeed(v.spouseStayYears.value[g], v.spouseStayYears.sources),
          ];
        }
        case 'child':
          return [
            stayNeed(v.childStayYears.value[g], v.childStayYears.sources),
          ];
        default: {
          const from = since(d, pr.statusStart);
          const need = (
            years: number,
            sources: SourceRef[],
            zh: string,
            en: string,
          ): Need => ({
            years,
            stay: true,
            state: reached(d, from, years),
            text: L(
              `自 ${from} 起${zh}满 ${years} 年`,
              `${count(years, 'year')} ${en} since ${from}`,
            ),
            sources,
          });
          return [
            pr.route === 'teijusha'
              ? need(
                  v.teijushaYears.value,
                  v.teijushaYears.sources,
                  '以定住者资格连续在留',
                  'in a row as a long-term resident (定住者)',
                )
              : pr.route === 'refugee'
                ? need(
                    v.refugeeYears.value,
                    v.refugeeYears.sources,
                    '（认定后）连续在留',
                    'of unbroken stay after recognition',
                  )
                : need(
                    v.highlySkilledYears.value[pr.route],
                    v.highlySkilledYears.sources,
                    '保持所需点数连续在留',
                    'of unbroken stay keeping the points',
                  ),
          ];
        }
      }
    };
    /** Years of stay checked for absences under the old guideline. */
    const stayYears = (d: IsoDate) =>
      Math.max(
        ...needs(d)
          .filter((n) => n.stay)
          .map((n) => n.years),
      );
    const oldTrips = (d: IsoDate) => tripsBefore(d, stayYears(d));
    const years = v.absenceWindowYears.value;
    const months = v.singleAbsenceMonths.value;
    const total = v.totalAbsenceMonths.value;
    // Neither "half a year" nor "2 years 6 months" is given in days: in
    // calendar months they span these days (PD-131).
    const [halfMin, halfMax] = monthSpan(months);
    const [totalMin, totalMax] = monthSpan(total);
    const absences = (d: IsoDate) => {
      const from = addYears(d, -years);
      const to = addDays(d, -1);
      // A trip still under way on `d` counts only as far as `d`.
      const trips = tripsIn(from, to).map((t) =>
        t.returned > d ? { ...t, returned: d } : t,
      );
      return {
        // Half a year whatever the reading: enough whole days abroad, all
        // of them in the window.
        long: trips.filter(
          (t) =>
            daysBetween(t.departed, t.returned) - 1 >= halfMax &&
            addDays(t.departed, 1) >= from,
        ),
        // Not under half a year on every reading, travel days included.
        maybeLong: trips.filter(
          (t) => daysBetween(t.departed, t.returned) + 1 >= halfMin,
        ),
        days: daysAbroad(from, to),
        // With departure and return days counted as days abroad.
        withTravel: req.trips.reduce(
          (n, t) => n + overlapDays(t.departed, t.returned, from, to),
          0,
        ),
      };
    };
    const verdict = (d: IsoDate): Verdict => {
      const states = needs(d).map((n) => n.state);
      if (abroad(d) || states.includes('no')) return 'no';
      if (states.includes('maybe')) return 'maybe';
      if (guideline(d) === 'old') return oldTrips(d).length ? 'maybe' : 'yes';
      const a = absences(d);
      return a.maybeLong.length || a.withTravel >= totalMin ? 'maybe' : 'yes';
    };
    const earliest = firstDate((d) => verdict(d) === 'yes');
    const possible = firstDate((d) => verdict(d) !== 'no');
    const status = statusOf(earliest, possible);
    const applies = special
      ? L(
          '这一出境标准写在一般路径下，是否也适用于本特例没有写明（PD-133）。',
          ' The guideline sets this test under the general route; whether it also applies here is not stated (PD-133).',
        )
      : '';
    /** Why the date `d` is uncertain. */
    const reason = (d: IsoDate) => {
      if (needs(d).some((n) => n.state === 'maybe'))
        return guideline(d) === 'new'
          ? L(
              '但其中有不计入 10 年的期间；新版指南不计入这些期间，但没有说之前与之后的在留能否接续计算（PD-134）。',
              ' but part of the stay does not count towards the 10 years; the new guideline leaves it out but does not say whether the stay before and after it can be added together (PD-134).',
            )
          : L(
              `但其中有你标为不计入 10 年的期间；截至 ${lastOld}（含当日）递交适用的指南没有写这些期间是否计入（PD-134）。`,
              ` but it includes stays you marked as not counting towards the 10 years; the guideline for applications up to ${lastOld} does not say whether they count (PD-134).`,
            );
      if (guideline(d) === 'old')
        return L(
          `但前 ${stayYears(d)} 年里有 ${oldTrips(d).length} 次出境，截至 ${lastOld}（含当日）递交适用的指南没有出境天数标准（PD-132）。`,
          ` but you have ${count(oldTrips(d).length, 'trip')} abroad in the ${count(stayYears(d), 'year')} before it, and the guideline for applications up to ${lastOld} does not specify a numerical limit on absences (PD-132).`,
        );
      const a = absences(d);
      return (
        L(
          `但前 ${years} 年里${a.maybeLong.length ? `有 ${a.maybeLong.length} 次单次可能达到 ${months} 个月的出境、` : ''}出境合计 ${a.days} 天（连出入境当天 ${a.withTravel} 天）；${switchDate} 起的指南对无合理理由单次出境 ${months} 个月以上或合计 ${total} 个月以上的原则上消极评价，是否有合理理由个案判断（PD-131）。`,
          ` but in the ${years} years before it you have ${a.maybeLong.length ? `${count(a.maybeLong.length, 'trip')} that may reach ${months} months and ` : ''}${a.days} days abroad in all (${a.withTravel} with travel days); from ${switchDate} the guideline counts against you, unless there is a reasonable reason, one absence of ${months} months or more or ${total} months in total (PD-131).`,
        ) + applies
      );
    };
    const shown = possible ?? earliest;
    const newDate =
      shown && shown < switchDate
        ? firstDate((d) => verdict(d) === 'yes', switchDate)
        : undefined;
    // An uncertain result has already named this date as the earliest.
    const repeated = status === 'UNKNOWN' && !!newDate && newDate === earliest;
    const version =
      shown && shown < switchDate
        ? L(
            `${shown} 按截至 ${lastOld}（含当日）递交适用的 2026-02-24 版指南计算；${switchDate} 起递交适用 2026-10-01 版${repeated ? '' : newDate ? `，最早 ${newDate}` : '，10 年内达不到'}。`,
            ` ${shown} follows the 2026-02-24 guideline, which covers applications up to ${lastOld}; from ${switchDate} the 2026-10-01 guideline applies${repeated ? '' : newDate ? `, with ${newDate} the earliest date` : ', which you will not meet within 10 years'}.`,
          )
        : '';
    const a = absences(at);
    const absenceChecks: PilotCheck[] =
      guideline(at) === 'old'
        ? [
            {
              text: oldTrips(at).length
                ? L(
                    `前 ${stayYears(at)} 年有 ${oldTrips(at).length} 次出境；截至 ${lastOld}（含当日）递交适用的指南没有出境天数标准`,
                    `${count(oldTrips(at).length, 'trip')} abroad in the past ${count(stayYears(at), 'year')}; the guideline for applications up to ${lastOld} does not specify a numerical limit on absences`,
                  )
                : L(
                    `前 ${stayYears(at)} 年没有出境`,
                    `No trips abroad in the past ${count(stayYears(at), 'year')}`,
                  ),
              met: oldTrips(at).length ? undefined : true,
              sources: [{ srcId: 'SRC-113', locator: '1(3)ア, 2' }],
            },
          ]
        : [
            {
              text: L(
                `前 ${years} 年没有单次 ${months} 个月以上的出境（${months} 个月即 ${halfMin}–${halfMax} 天）`,
                `No absence of ${months} months or more in the past ${years} years (${months} months, ${halfMin}–${halfMax} days)`,
              ),
              met: !a.maybeLong.length
                ? true
                : a.long.length && !special
                  ? false
                  : undefined,
              sources: v.singleAbsenceMonths.sources,
            },
            {
              text: L(
                `前 ${years} 年出境合计 ${a.days} 天，连出入境当天 ${a.withTravel} 天（合计达到 ${total} 个月，即 ${totalMin}–${totalMax} 天的，原则上消极评价）`,
                `${a.days} days abroad in the past ${years} years, ${a.withTravel} with travel days (${total} months in total, ${totalMin}–${totalMax} days, counts against you)`,
              ),
              met:
                a.withTravel < totalMin
                  ? true
                  : a.days >= totalMax && !special
                    ? false
                    : undefined,
              sources: v.totalAbsenceMonths.sources,
            },
          ];

    pathways.push({
      id: 'JP-PR',
      title: L('永住许可（永住許可）', 'Permanent residence (永住許可)'),
      status,
      earliestDate: status === 'UNKNOWN' ? undefined : earliest,
      summary:
        (status === 'MET'
          ? L(
              '模拟日已满足永住许可的时间条件。',
              'You meet the time requirements for permanent residence on the simulation date.',
            ) + filingNote(sim, (x) => verdict(x) === 'yes', 'isa')
          : status === 'FUTURE'
            ? L(
                `最早满足永住许可时间条件的日期是 ${earliest}。`,
                `The earliest date that meets the time requirements for permanent residence is ${earliest}.`,
              ) + filingNote(earliest!, (x) => verdict(x) === 'yes', 'isa')
            : status === 'UNKNOWN'
              ? L(
                  `按年限计算的候选日期是 ${possible}，`,
                  `Counting years alone, the candidate date is ${possible},`,
                ) +
                reason(possible!) +
                (earliest
                  ? L(
                      `不受这一点影响的最早日期是 ${earliest}。`,
                      ` The earliest date without this doubt is ${earliest}.`,
                    )
                  : '') +
                filingNote(possible!, (x) => verdict(x) !== 'no', 'isa', true)
              : L(
                  '按现有记录，10 年内达不到永住许可的时间条件。',
                  'With your record you will not meet the time requirements for permanent residence within 10 years.',
                )) +
        version +
        (pr.route === 'general' && pr.statusStart === 'none'
          ? L(
              `截至 ${lastOld}（含当日）递交适用的旧版指南不把你目前的资格（如技能実習、特定技能1号）算作就労资格，换成认可的资格后才开始计 ${v.prStatusYears.value} 年（PD-134）。`,
              ` Up to ${lastOld} the old guideline does not count your current status (such as Technical Intern Training or Specified Skilled Worker (i)) as a work status, so its ${v.prStatusYears.value} years start only once you hold one it counts (PD-134).`,
            )
          : '') +
        (pr.route === 'general' &&
        (pr.newStatusStart ?? pr.statusStart) === 'none'
          ? L(
              `${switchDate} 起递交适用的新版指南不把你目前的资格（如企業内転勤）算作就労资格，换成认可的资格后才开始计 ${v.prStatusYears.value} 年（PD-134）。`,
              ` From ${switchDate} the new guideline does not count your current status (such as Intra-company Transferee) as a work status, so its ${v.prStatusYears.value} years start only once you hold one it counts (PD-134).`,
            )
          : '') +
        lapseNotes.join('') +
        forecast,
      checks: [
        ...needs(at).map((n) => ({
          text: n.text,
          met: metOf(n.state),
          sources: n.sources,
        })),
        ...absenceChecks,
        ...inJapan([
          { srcId: 'SRC-110', locator: '第22条第1項' },
          { srcId: 'SRC-119', locator: '申請提出者' },
        ]),
      ],
      notChecked: [
        L(
          '素行善良、独立生计与收入水平、纳税与年金等公的义务、现有在留资格是否为最长在留期间（入管法第22条第2項，指南的其他条目）',
          'Good conduct, independent livelihood and income, taxes, pensions and other public duties, and whether your current status has the longest period of stay (art. 22(2) and the rest of the guidelines)',
        ),
        L(
          '你填写的资格、点数或婚姻是否符合该特例（如就労资格与居住资格的范围、高度人才点数、"实子等"的范围），以及新冠期间未能按时再入国的特例',
          'Whether the status, points or marriage you entered qualify for the route (such as which statuses count as work or residence statuses, the highly skilled points, who counts as a child), and the COVID exception for missed re-entry',
        ),
      ],
      assumptions: [
        L(
          `按递交日选指南：截至 ${lastOld}（含当日）递交适用 2026-02-24 版，${switchDate} 起适用 2026-10-01 版（配偶者婚姻 ${v.spouseMarriageYears.value.old} 年改 ${v.spouseMarriageYears.value.new} 年、在留 ${v.spouseStayYears.value.old} 年改 ${v.spouseStayYears.value.new} 年，实子等 ${v.childStayYears.value.old} 年改 ${v.childStayYears.value.new} 年，并新增出境标准）。旧版没有出境天数标准，期间内有出境的待确认（PD-132）。`,
          `The guideline depends on the application date: up to and including ${lastOld} the 2026-02-24 version, from ${switchDate} the 2026-10-01 version (spouses ${v.spouseMarriageYears.value.old} → ${v.spouseMarriageYears.value.new} years of marriage and ${v.spouseStayYears.value.old} → ${v.spouseStayYears.value.new} years of stay, children ${v.childStayYears.value.old} → ${v.childStayYears.value.new} years, and a new test for absences). The old version does not specify a numerical limit on absences, so trips in the period leave the date uncertain (PD-132).`,
        ),
        L(
          `新版出境标准看递交日前 ${years} 年，出入境当天按在日本计。单次：${months} 个日历月是 ${halfMin}–${halfMax} 天，境外整天 ${halfMax} 天以上且整段在这 ${years} 年内的算达到，连出入境当天也不满 ${halfMin} 天的算未达到，其间与跨窗口的长行程待确认；合计：连出入境当天也少于 ${totalMin} 天算未达到 ${total} 个月，境外整天 ${totalMax} 天及以上算达到，其间待确认；模拟日仍在境外的行程只算到模拟日。达到的原则上消极评价，有合理理由的个案判断，结果待确认（PD-131）。`,
          `The new absence test looks at the ${years} years before applying, with departure and return days counted as days in Japan. A single absence: ${months} calendar months are ${halfMin}–${halfMax} days, so ${halfMax} or more whole days abroad, all inside those ${years} years, reaches it, and under ${halfMin} days even counting travel days does not; anything between, or a long trip that started before the window, is uncertain. The total: under ${totalMin} days even counting travel days is short of ${total} months, ${totalMax} or more whole days abroad reaches it, and anything between is uncertain; a trip still under way on the simulation date counts only up to that date. Reaching it counts against you unless there is a reasonable reason, decided case by case, so the result is uncertain (PD-131).`,
        ),
        anniversary,
        reentry,
        ...(pr.route === 'general'
          ? [
              L(
                `就労资格或居住资格的范围由你自行确认：${switchDate} 起递交的，就労资格不含技能実習、育成就労、特定技能1号、企業内転勤与部分特定活動。特例性、临时性的特定活動（如继续就职活动、难民认定申请中）不计入 10 年，请作为不计入期间填写；按其后重新起算的日期作为确定日期，只扣除这些天数的日期待确认（PD-134）。`,
                `Check yourself that your status counts as a work or residence status: for applications from ${switchDate} work statuses exclude Technical Intern Training, Employment for Skill Development, Specified Skilled Worker (i), Intra-company Transferee and some Designated Activities. Exceptional, temporary Designated Activities (such as continued job hunting or a pending refugee claim) do not count towards the 10 years: enter them as excluded stays. Counting again after them gives the sure date; only leaving out those days is uncertain (PD-134).`,
              ),
            ]
          : []),
        ...(pr.route === 'spouse'
          ? [
              L(
                '婚姻年限从你填写的开始实际婚姻生活的日期起算；指南写的是"实体婚姻生活"，以登记日还是同居日起算没有写明（PD-135）。',
                'Married life runs from the date you entered for when married life began; the guideline says "married life in substance" and does not say whether it starts at registration or when you began living together (PD-135).',
              ),
            ]
          : []),
        projection,
      ],
      pendingDetails: [
        'PD-130',
        'PD-131',
        'PD-132',
        ...(special ? ['PD-133'] : ['PD-134']),
        ...(pr.route === 'spouse' ? ['PD-135'] : []),
        'PD-136',
      ],
    });
  }

  // ---------- Naturalisation (Nationality Act art. 5, 7) ----------
  {
    const nat = req.naturalisation;
    const practiceYears = v.naturalisationPracticeYears.value;
    const practiceFrom = v.naturalisationPracticeFrom.value;
    /** Art. 7, second form: years since the wedding and of domicile. */
    const married = (d: IsoDate) =>
      nat.route === 'spouse' &&
      d >=
        afterYears(nat.marriedOn, v.spouseNaturalisationMarriageYears.value) &&
      d >= afterYears(stayFrom(d), v.spouseNaturalisationDomicileYears.value);
    // Art. 5(1)(ii): Japan's age (20 before 2022-04-01, MOJ Q9) and an
    // adult under the home country's law, on the application day.
    const japanAge = (d: IsoDate) =>
      d < v.naturalisationAgeFrom.value
        ? v.naturalisationAgeBefore.value
        : v.naturalisationAge.value;
    const ageOn = (d: IsoDate) =>
      Math.max(
        japanAge(d),
        nat.route === 'general' ? (nat.homeMajorityAge ?? 0) : 0,
      );
    const adultOn = (d: IsoDate) =>
      nat.route === 'general' ? afterYears(nat.dateOfBirth, ageOn(d)) : d;
    /** Adult from the 2022-04-01 age, for an application before it. */
    const adultLater =
      nat.route === 'general'
        ? afterYears(
            nat.dateOfBirth,
            Math.max(v.naturalisationAge.value, nat.homeMajorityAge ?? 0),
          )
        : sim;
    // An application before 2022-04-01 that meets the later age but not the
    // age then may have been decided after the change (PD-161).
    const youngBefore = (d: IsoDate) =>
      nat.route === 'general' &&
      d < v.naturalisationAgeFrom.value &&
      d < adultOn(d) &&
      d >= adultLater;
    // Art. 7 applies to a spouse on the application day.
    const legal = (d: IsoDate) => {
      const stay = stayFrom(d);
      return nat.route === 'general'
        ? d >= afterYears(stay, v.naturalisationYears.value) && d >= adultOn(d)
        : d >= nat.marriedOn &&
            (d >= afterYears(stay, v.spouseNaturalisationYears.value) ||
              married(d));
    };
    const practice = (d: IsoDate) =>
      d >= afterYears(stayFrom(d), practiceYears);
    /** Years the law counts on `d`. */
    const legalYears = (d: IsoDate) =>
      nat.route === 'general'
        ? v.naturalisationYears.value
        : married(d)
          ? v.spouseNaturalisationDomicileYears.value
          : v.spouseNaturalisationYears.value;
    // The 10-year practice is certain only for general applications reviewed
    // from its start; earlier ones may still be pending then (PD-137).
    const verdict = (d: IsoDate): Verdict => {
      if (abroad(d)) return 'no';
      if (!legal(d))
        return youngBefore(d) &&
          d >= afterYears(stayFrom(d), v.naturalisationYears.value)
          ? 'maybe'
          : 'no';
      if (!practice(d))
        return nat.route === 'general' && d >= practiceFrom ? 'no' : 'maybe';
      return tripsBefore(d, practiceYears).length ? 'maybe' : 'yes';
    };
    const earliest = firstDate((d) => verdict(d) === 'yes');
    const possible = firstDate((d) => verdict(d) !== 'no');
    const status = statusOf(earliest, possible);
    const legalDate = firstDate((d) => !abroad(d) && legal(d));
    const practiceDate = firstDate(
      (d) => !abroad(d) && legal(d) && practice(d),
    );
    const stay = stayFrom(at);
    const tripNote = (d: IsoDate) => {
      const n = practice(d) ? practiceYears : legalYears(d);
      const found = tripsBefore(d, n);
      const days = daysAbroad(addYears(d, -n), addDays(d, -1));
      return found.length
        ? L(
            `这 ${n} 年里有 ${found.length} 次出境、合计 ${days} 天；法律与官方说明都没有"引き続き"允许多少出境的标准（PD-138）。`,
            ` In the ${count(n, 'year')} before it you have ${count(found.length, 'trip')} abroad, ${days} days in all; neither the law nor official guidance says how much absence "continuous" allows (PD-138).`,
          )
        : '';
    };
    // Trips in the 10 years leave even that date a candidate (PD-138).
    const practiceLine = practiceDate
      ? tripsBefore(practiceDate, practiceYears).length
        ? L(
            `按年限计算的候选日是 ${practiceDate}，但这 ${practiceYears} 年里的出境仍待确认（PD-138）`,
            `counting years alone the candidate date is ${practiceDate}, though trips in those ${practiceYears} years remain uncertain (PD-138)`,
          )
        : L(`最早 ${practiceDate}`, `the earliest date is ${practiceDate}`)
      : L('10 年内达不到', 'you will not meet it within 10 years');
    const practiceNote = (d: IsoDate) =>
      practice(d)
        ? ''
        : nat.route === 'general'
          ? L(
              `${practiceFrom} 起法务省在帰化审查中原则要求在留 ${practiceYears} 年以上；此前递交、届时尚未审结的申请是否适用没有说明，若适用，${practiceLine}（PD-137）。`,
              ` From ${practiceFrom} the Ministry of Justice in principle requires ${practiceYears} years of stay in its review; whether this applies to applications made earlier and still pending then is not stated, and if it does, ${practiceLine} (PD-137).`,
            )
          : L(
              `${practiceFrom} 起法务省在帰化审查中原则要求在留 ${practiceYears} 年以上，是否也适用于日本人配偶者没有说明；若适用，${practiceLine}（PD-137）。`,
              ` From ${practiceFrom} the Ministry of Justice in principle requires ${practiceYears} years of stay in its review; whether this also applies to spouses of Japanese nationals is not stated, and if it does, ${practiceLine} (PD-137).`,
            );
    const main =
      status === 'MET'
        ? L(
            '模拟日已满足帰化的时间条件。',
            'You meet the time requirements for naturalisation on the simulation date.',
          ) + filingNote(sim, (x) => verdict(x) === 'yes', 'bureau')
        : status === 'FUTURE'
          ? L(
              `最早满足帰化时间条件的日期是 ${earliest}。`,
              `The earliest date that meets the time requirements for naturalisation is ${earliest}.`,
            ) + filingNote(earliest!, (x) => verdict(x) === 'yes', 'bureau')
          : status === 'UNKNOWN'
            ? L(
                `按年限计算的候选日期是 ${possible}。`,
                `Counting years alone, the candidate date is ${possible}.`,
              ) +
              (youngBefore(possible!)
                ? L(
                    `按 ${possible} 递交适用 ${japanAge(possible!)} 岁，那时已满 ${v.naturalisationAge.value} 岁但未满 ${japanAge(possible!)} 岁；${v.naturalisationAgeFrom.value} 起改为 ${v.naturalisationAge.value} 岁，此前递交、之后才审结的申请按哪个年龄审没有写明（PD-161）。`,
                    ` Applying on ${possible} the age was ${japanAge(possible!)}, and you were ${v.naturalisationAge.value} but not yet ${japanAge(possible!)}; from ${v.naturalisationAgeFrom.value} it is ${v.naturalisationAge.value}, and which age applies to an application made before and decided after that is not stated (PD-161).`,
                  )
                : '') +
              practiceNote(possible!) +
              tripNote(possible!) +
              filingNote(possible!, (x) => verdict(x) !== 'no', 'bureau', true)
            : L(
                '按现有记录，10 年内达不到帰化的时间条件。',
                'With your record you will not meet the time requirements for naturalisation within 10 years.',
              );
    const lawOnly =
      nat.route === 'general' &&
      legalDate &&
      (!possible || legalDate < possible)
        ? L(
            `国籍法本身只要求住所 ${v.naturalisationYears.value} 年、年满 ${japanAge(legalDate)} 岁并达到本国法的成年年龄（按 ${ageOn(legalDate)} 岁计），按年限最早 ${legalDate}；${practiceFrom} 起法务省在审查中原则要求在留 ${practiceYears} 年以上，例外个案判断（PD-137）。`,
            ` The Nationality Act itself asks only for ${v.naturalisationYears.value} years of domicile, age ${japanAge(legalDate)} and adulthood under your home country's law (taken as ${ageOn(legalDate)}), which by years alone is from ${legalDate}; from ${practiceFrom} the Ministry of Justice in principle requires ${practiceYears} years of stay in its review, with exceptions decided case by case (PD-137).`,
          )
        : '';
    /** A period reached on the simulation date, unless trips cloud it. */
    const continuous = (ok: boolean, n: number) =>
      !ok ? false : tripsBefore(at, n).length ? undefined : true;
    const practiceCheck: PilotCheck = {
      text:
        nat.route === 'general'
          ? L(
              `按 ${practiceFrom} 起的审查运用，自 ${stay} 起原则在留满 ${practiceYears} 年`,
              `Under the review practice from ${practiceFrom}, in principle ${practiceYears} years of stay since ${stay}`,
            )
          : L(
              `若 ${practiceFrom} 起的审查运用也适用于配偶者：自 ${stay} 起在留满 ${practiceYears} 年`,
              `If the review practice from ${practiceFrom} also applies to spouses: ${practiceYears} years of stay since ${stay}`,
            ),
      met: practice(at)
        ? continuous(true, practiceYears)
        : nat.route === 'general' && at >= practiceFrom
          ? false
          : undefined,
      sources: [
        ...v.naturalisationPracticeYears.sources,
        ...v.naturalisationPracticeFrom.sources,
      ],
    };
    const checks: PilotCheck[] = [
      ...(nat.route === 'general'
        ? [
            {
              text: L(
                `自 ${stay} 起在日本连续有住所满 ${v.naturalisationYears.value} 年`,
                `${v.naturalisationYears.value} years of continuous domicile in Japan since ${stay}`,
              ),
              met: continuous(
                at >= afterYears(stay, v.naturalisationYears.value),
                v.naturalisationYears.value,
              ),
              sources: v.naturalisationYears.sources,
            },
            {
              text:
                L(`按 ${at} 递交：`, `Applying on ${at}: `) +
                (nat.homeMajorityAge
                  ? L(
                      `年满 ${japanAge(at)} 岁并达到本国法的成年年龄 ${nat.homeMajorityAge} 岁（${adultOn(at)} 起）`,
                      `aged ${japanAge(at)} and an adult under your home country's law at ${nat.homeMajorityAge} (from ${adultOn(at)})`,
                    )
                  : L(
                      `年满 ${japanAge(at)} 岁（${adultOn(at)} 起；你确认本国法的成年年龄不高于此）`,
                      `aged ${japanAge(at)} or over (from ${adultOn(at)}; you confirmed your home country's age of majority is no higher)`,
                    )) +
                (at < v.naturalisationAgeFrom.value
                  ? L(
                      `；${v.naturalisationAgeFrom.value} 起递交为 ${v.naturalisationAge.value} 岁（${adultLater} 起）`,
                      `; applying from ${v.naturalisationAgeFrom.value} the age is ${v.naturalisationAge.value} (from ${adultLater})`,
                    )
                  : ''),
              met:
                at >= adultOn(at) ? true : youngBefore(at) ? undefined : false,
              sources: [
                ...v.naturalisationAge.sources,
                ...v.naturalisationAgeFrom.sources,
              ],
            },
          ]
        : [
            {
              text: L(
                `国籍法第 7 条：递交时是日本国民的配偶者（${nat.marriedOn} 登记结婚），且自 ${stay} 起在日本连续有住所或居所满 ${v.spouseNaturalisationYears.value} 年，或结婚满 ${v.spouseNaturalisationMarriageYears.value} 年且连续有住所满 ${v.spouseNaturalisationDomicileYears.value} 年`,
                `Nationality Act art. 7: a spouse of a Japanese national when applying (married on ${nat.marriedOn}), with ${v.spouseNaturalisationYears.value} years of continuous domicile or residence in Japan since ${stay}, or ${v.spouseNaturalisationMarriageYears.value} years married with ${v.spouseNaturalisationDomicileYears.value} year of continuous domicile`,
              ),
              met: continuous(legal(at), legalYears(at)),
              sources: v.spouseNaturalisationYears.sources,
            },
          ]),
      practiceCheck,
      ...inJapan([
        {
          srcId: 'SRC-117',
          locator: 'Q10',
          url: 'https://www.moj.go.jp/MINJI/minji78.html#a10',
        },
      ]),
    ];

    pathways.push({
      id: 'JP-NATURALISATION',
      title: L('帰化（入籍）', 'Naturalisation (帰化)'),
      status,
      earliestDate: status === 'UNKNOWN' ? undefined : earliest,
      summary: main + lawOnly + lapseNotes.join('') + forecast,
      checks,
      notChecked: [
        L(
          '素行、生计、放弃原国籍（重国籍防止）、宪法遵守（国籍法第5条第1項第3–6号），日语能力与"融入日本社会"的其他事项，以及 2026-04 起延长的纳税与社保缴纳审查期间',
          'Conduct, livelihood, giving up your current nationality, respect for the Constitution (art. 5(1)(iii)–(vi)), Japanese language and the other parts of "integration into Japanese society", and the longer review of tax and social insurance payments from 2026-04',
        ),
        L(
          '第 6、8 条的其他简易情形（如在日本出生、日本国民之子）',
          'The other simplified cases in art. 6 and 8 (such as being born in Japan or a child of a Japanese national)',
        ),
      ],
      assumptions: [
        L(
          '住所与在留都从你填写的本次在留开始日起算，不区分住所与居所；住所须合法，即一直持有在留资格（PD-139）。',
          'Domicile and stay both run from the start of your current stay as entered, without telling domicile from residence; domicile must be lawful, that is on a valid status throughout (PD-139).',
        ),
        L(
          `${practiceFrom} 起的审查运用原则要求在留 ${practiceYears} 年：一般帰化在这天起递交的按 ${practiceYears} 年计；此前递交的、以及日本人配偶者是否适用没有说明，只满足国籍法的日期待确认（PD-137）。`,
          `The review practice from ${practiceFrom} in principle requires ${practiceYears} years of stay: general applications made from that day are counted with ${practiceYears} years; whether it applies to earlier applications or to spouses of Japanese nationals is not stated, so a date meeting only the Nationality Act is uncertain (PD-137).`,
        ),
        L(
          `法律与官方说明都没有出境天数标准：前 ${practiceYears} 年内有出境的，连续在留与住所都待确认（PD-138）。`,
          `There is no limit on absences in the law or official guidance: trips in the past ${practiceYears} years leave both the unbroken stay and domicile uncertain (PD-138).`,
        ),
        anniversary,
        reentry,
        projection,
      ],
      pendingDetails: ['PD-130', 'PD-136', 'PD-137', 'PD-138', 'PD-139'],
    });
  }

  return { policyAsOf: jp.asOf, pathways };
}
