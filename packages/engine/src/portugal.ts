import { portugal2026_11 as pt } from '@uk-immigration/policy-data';
import { addDays, addMonths, addYears, daysBetween } from './dates';
import { Days, HORIZON_YEARS, afterYears, monthSpan } from './pilot';
import type { PilotPathway, PilotResult, PilotStatus } from './pilot';
import { textFor } from './rule';
import type { IsoDate, Locale } from './types';

// Portugal pilot (phase 19, task 71): naturalisation (Lei 37/81 art. 6, 15 as
// amended by LO 1/2026, and the earlier text for applications pending when it
// came into force), permanent residence (Lei 23/2007 art. 80), EU long-term
// residence (art. 125–126) and the golden visa (ARI, art. 90-A) minimum stays
// and renewal. Language, income, criminal record and investment are out of
// scope.

/**
 * temporary: ordinary temporary residence (work, family and others);
 * golden-visa: residence for investment (ARI); study: study, unpaid
 * traineeship or volunteering; visa: a residence visa before the first
 * permit; permanent: permanent residence or EU long-term resident status.
 */
export const PT_PERMIT_KINDS = [
  'temporary',
  'golden-visa',
  'study',
  'visa',
  'permanent',
] as const;
export type PtPermitKind = (typeof PT_PERMIT_KINDS)[number];

/** cplp-eu: a Portuguese-speaking country or the EU. */
export const PT_NATIONALITY_ROUTES = ['cplp-eu', 'other', 'stateless'] as const;
export type PtNationalityRoute = (typeof PT_NATIONALITY_ROUTES)[number];

export interface PtPermit {
  kind: PtPermitKind;
  from: IsoDate;
  /** Last day of validity; absent = renewed on time. */
  to?: IsoDate;
}

/** Left Portugal on `departed`, came back on `returned`. */
export interface PtTrip {
  departed: IsoDate;
  returned: IsoDate;
}

export interface PtRequest {
  simulationDate: IsoDate;
  permits: PtPermit[];
  trips: PtTrip[];
  route: PtNationalityRoute;
  /**
   * A naturalisation application made on this date and still pending when
   * LO 1/2026 came into force.
   */
  pendingApplication?: IsoDate;
  /** The first temporary residence permit was applied for on this date. */
  residenceApplied?: IsoDate;
  locale?: Locale;
}

export type PtPathwayId =
  'PT-NATURALISATION' | 'PT-PERMANENT' | 'PT-EU-LONG-TERM' | 'PT-GOLDEN-VISA';
export type PtPathway = PilotPathway<PtPathwayId>;
export type PtResult = PilotResult<PtPathwayId>;

const v = pt.values;
type Verdict = 'yes' | 'maybe' | 'no';

// Kinds of residence title each count rests on.
const TITLES: PtPermitKind[] = [
  'temporary',
  'golden-visa',
  'study',
  'permanent',
];
const TEMPORARY: PtPermitKind[] = ['temporary', 'golden-visa', 'study'];
const FULL: PtPermitKind[] = ['temporary', 'golden-visa', 'permanent'];

export function evaluatePortugal(req: PtRequest): PtResult {
  const L = textFor(req);
  const sim = req.simulationDate;
  const pending = req.pendingApplication;
  const longest = Math.max(
    v.oldIntervalYears.value,
    ...Object.values(v.nationalityIntervalYears.value),
  );
  const first = pending && pending < sim ? pending : sim;
  const days = new Days(
    addDays(addYears(first, -longest), -1),
    addYears(sim, HORIZON_YEARS),
  );
  const end = days.date(days.count - 1);
  const flags = () => new Array<boolean>(days.count).fill(false);
  /** A permit without an end date lasts until its renewal (the next one of the same kind) starts. */
  const lastDay = (permit: PtPermit) => {
    const next = req.permits
      .filter((p) => p.kind === permit.kind && p.from > permit.from)
      .map((p) => p.from)
      .sort()[0];
    return permit.to ?? (next ? addDays(next, -1) : end);
  };
  const byKind = Object.fromEntries(
    PT_PERMIT_KINDS.map((k) => [k, flags()]),
  ) as Record<PtPermitKind, boolean[]>;
  for (const permit of req.permits)
    days.mark(byKind[permit.kind], permit.from, lastDay(permit));
  const holds = (kinds: PtPermitKind[]) => (i: number) =>
    kinds.some((k) => byKind[k][i]);
  // Departure and return days count as days in Portugal (PD-146).
  const away = flags();
  for (const trip of req.trips)
    days.mark(away, addDays(trip.departed, 1), addDays(trip.returned, -1));
  const awaySums = days.sums((i) => away[i]);

  const covered = (s: number[], from: IsoDate, to: IsoDate) =>
    days.total(s, from, to) === daysBetween(from, to) + 1;
  const tripsIn = (from: IsoDate, to: IsoDate) =>
    req.trips.filter(
      (t) => addDays(t.departed, 1) <= to && addDays(t.returned, -1) >= from,
    );
  const tooLong = (t: PtTrip, months: number) =>
    t.returned > addMonths(t.departed, months);
  /**
   * First day of the `n` years that must be complete before `d`: the day a
   * period starts is not counted and it ends with the same date `n` years
   * on (Código Civil art. 279 b–c, PD-142).
   */
  const yearsBefore = (d: IsoDate, n: number) => addDays(addYears(d, -n), -1);
  const firstDate = (ok: (d: IsoDate) => boolean): IsoDate | undefined => {
    for (let i = days.index(sim); i < days.count; i++) {
      const d = days.date(i);
      if (ok(d)) return d;
    }
    return undefined;
  };
  const statusOf = (earliest?: IsoDate): PilotStatus =>
    !earliest ? 'NOT_MET' : earliest === sim ? 'MET' : 'FUTURE';
  const projection = L(
    '最早日期假设模拟日之后一直在葡萄牙（已录入的未来出境除外），没有到期日的许可都按时续期。',
    'Projected dates assume you stay in Portugal after the simulation date (apart from trips you entered) and that permits without an end date are renewed on time.',
  );
  const pathways: PtPathway[] = [];

  // ---------- Naturalisation (Lei 37/81 art. 6 n.º 1 b, art. 15) ----------
  {
    // The earlier text also counts the wait from the application for the
    // first temporary residence permit, once granted (old art. 15 n.º 4).
    const applied = flags();
    const appliedOn = req.residenceApplied;
    const granted =
      appliedOn &&
      req.permits
        .filter((p) => TEMPORARY.includes(p.kind) && p.from >= appliedOn)
        .map((p) => p.from)
        .sort()[0];
    if (appliedOn && granted)
      days.mark(applied, appliedOn, addDays(granted, -1));
    const titled = holds(TITLES);
    const titledOrVisa = holds([...TITLES, 'visa']);
    const count = (held: (i: number) => boolean) => {
      // For each day, where the stretch of residence through it started
      // (the next day when it is not held).
      const run: number[] = [];
      for (let i = 0; i < days.count; i++)
        run.push(!held(i) ? i + 1 : i > 0 && held(i - 1) ? run[i - 1] : i);
      return {
        held,
        run,
        all: days.sums(held),
        // Each period of residence starts counting the day after (art. 279 b).
        counted: days.sums((i) => held(i) && i > 0 && held(i - 1)),
      };
    };
    type Count = ReturnType<typeof count>;
    interface Assessment {
      verdict: Verdict;
      /** Start of the period the verdict rests on. */
      from: IsoDate;
    }
    /**
     * Legal residence on `d` and `years` of it within the `interval` years
     * before (art. 15 n.º 3). One unbroken stretch is counted by the
     * calendar; periods with gaps are added up in days, and a total between
     * the fewest and most days `years` years can have is uncertain (PD-141).
     */
    const assess = (years: number, interval: number, extra?: boolean[]) => {
      const sure = count((i) => titled(i) || !!extra?.[i]);
      // Residence visas are listed in art. 15 n.º 1, but the count now
      // starts with the residence title (PD-140).
      const maybe = count((i) => titledOrVisa(i) || !!extra?.[i]);
      const [fewest, most] = monthSpan(years * 12);
      const judge = (c: Count, d: IsoDate): Assessment => {
        const unbroken = yearsBefore(d, years);
        if (!c.held(days.index(d))) return { verdict: 'no', from: unbroken };
        if (covered(c.all, unbroken, addDays(d, -1)))
          return { verdict: 'yes', from: unbroken };
        // Without earlier periods in the interval, the calendar decides.
        const from = addYears(d, -interval);
        const stretch = days.date(c.run[days.index(d) - 1]);
        if (!days.total(c.counted, from, addDays(stretch, -1)))
          return { verdict: 'no', from: unbroken };
        const n = days.total(c.counted, from, addDays(d, -1));
        return {
          verdict: n >= most ? 'yes' : n >= fewest ? 'maybe' : 'no',
          from,
        };
      };
      return (d: IsoDate): Assessment => {
        const a = judge(sure, d);
        if (a.verdict !== 'no') return a;
        const b = judge(maybe, d);
        return { verdict: b.verdict === 'no' ? 'no' : 'maybe', from: b.from };
      };
    };
    const tripsBefore = (from: IsoDate, d: IsoDate) => {
      const trips = tripsIn(from, addDays(d, -1));
      return {
        count: trips.length,
        absent: days.total(awaySums, from, addDays(d, -1)),
      };
    };

    const inForce = v.lawInForce.value;
    const law: 'old' | 'unclear' | 'new' = !pending
      ? 'new'
      : pending < inForce
        ? 'old'
        : pending === inForce
          ? 'unclear'
          : 'new';
    const years = v.nationalityYears.value[req.route];
    const interval = v.nationalityIntervalYears.value[req.route];
    const current = assess(years, interval);
    const earliest = firstDate((d) => current(d).verdict === 'yes');
    const possible = firstDate((d) => current(d).verdict !== 'no');
    const span = earliest && tripsBefore(current(earliest).from, earliest);
    const unsure = !!span && span.count > 0;
    const now = current(sim).verdict;
    const newSummary =
      (earliest === sim
        ? L(
            `模拟日已有 ${years} 年合法居留（${interval} 年内累计）。`,
            `You have ${years} years of legal residence (within ${interval} years) on the simulation date.`,
          )
        : earliest
          ? unsure
            ? L(
                `仅按居留许可计算的候选递交日是 ${earliest}。`,
                `Counting residence permits alone, the candidate application date is ${earliest}.`,
              )
            : L(
                `合法居留满 ${years} 年的最早递交日是 ${earliest}。`,
                `The earliest application date with ${years} years of legal residence is ${earliest}.`,
              )
          : L(
              `按现有记录，${HORIZON_YEARS} 年内达不到 ${years} 年的合法居留。`,
              `With your record you will not reach ${years} years of legal residence within ${HORIZON_YEARS} years.`,
            )) +
      (possible && (!earliest || possible < earliest)
        ? L(
            `若把居留签证期间计入，或分段累计时按较宽的年天换算，最早 ${possible}，原文未写明（PD-140、PD-141）。`,
            ` Counting time on a residence visa, or converting years to days generously when periods are added up, it could be ${possible}; the law does not say (PD-140, PD-141).`,
          )
        : '') +
      (unsure && span
        ? L(
            `计入的期间里有 ${span.count} 次出境、合计 ${span.absent} 天；国籍法没有规定缺席上限，影响待确认（PD-144）。`,
            ` In the counted period you have ${span.count} trips abroad, ${span.absent} days in all; the nationality law sets no limit on absences, so their effect is uncertain (PD-144).`,
          )
        : '');
    const newCheck = {
      text: L(
        `递交当天合法居留，且前 ${interval} 年内累计合法居留满 ${years} 年（自居留证件起算，中断的期间可以相加）`,
        `Legal residence on the application day, and ${years} years of legal residence within the ${interval} years before (counted from the residence title; periods with gaps add up)`,
      ),
      met: now === 'yes' ? true : now === 'maybe' ? undefined : false,
      sources: [
        ...v.nationalityYears.sources,
        ...v.nationalityIntervalYears.sources,
        { srcId: 'SRC-120', locator: 'art. 15 n.º 1 (p14)' },
        { srcId: 'SRC-122', locator: 'fundamentação D.5' },
      ],
    };
    const common = {
      id: 'PT-NATURALISATION' as const,
      title: L('入籍（naturalização）', 'Naturalisation (naturalização)'),
      notChecked: [
        L(
          '成年；葡萄牙语言与文化、历史和国家象征的测试或证书，公民权利义务知识，庄严声明（art. 6 n.º 1 a、c–e）',
          'Being an adult; the test or certificate on Portuguese language, culture, history and national symbols, knowledge of rights and duties, and the solemn declaration (art. 6 n.º 1 a, c–e)',
        ),
        L(
          '刑事记录、安全威胁、国际制裁与生计能力（art. 6 n.º 1 f–i）',
          'Criminal record, security threats, international sanctions and means of subsistence (art. 6 n.º 1 f–i)',
        ),
        L(
          '婚姻、在葡出生的子女、后裔等其他途径（art. 3、art. 6 n.º 2、8），"葡语国家"的范围，以及欧盟公民按欧盟居留制度登记的期间怎么证明（art. 15 n.º 2）',
          'Other routes such as marriage, children born in Portugal and descendants (art. 3, art. 6 n.º 2, 8), which countries count as Portuguese-speaking, and how EU citizens prove residence registered under the EU rules (art. 15 n.º 2)',
        ),
      ],
    };
    const newAssumptions = [
      L(
        '现行法自取得居留证件起算（"自申请居留许可之日起算"的旧 art. 15 n.º 4 已废止）；按录入的许可生效日起算，批准日、制卡日与居留签证期间的差别待新国籍条例明确（PD-140）。递交当天须合法居留。',
        'Under the current law the count starts with the residence title (old art. 15 n.º 4, counting from the residence application, was repealed); it starts on the permit dates you entered, and the difference between the grant, the card and time on a residence visa awaits the new nationality regulation (PD-140). You must be legally resident on the application day.',
      ),
      L(
        `连续居留时按日历计：起算日当天不计，满 ${years} 年对应日的次日起可以递交（Código Civil art. 279，PD-142）。有空档时把 ${interval} 年内各段（每段起算日不计）的天数相加，按以递交日为终点的 ${interval} 年计（PD-141）。`,
        `Unbroken residence is counted by the calendar: the start day does not count, and you can apply from the day after the same date ${years} years on (Código Civil art. 279, PD-142). With gaps, the days of each period (without its start day) within ${interval} years are added up, taking the ${interval} years as those ending on the application date (PD-141).`,
      ),
      projection,
    ];

    const newStatus: PilotStatus =
      unsure || (!earliest && possible) ? 'UNKNOWN' : statusOf(earliest);
    const newPending = [
      'PD-140',
      'PD-141',
      'PD-142',
      ...(unsure ? ['PD-144'] : []),
    ];

    if (law === 'new') {
      pathways.push({
        ...common,
        status: newStatus,
        earliestDate: unsure ? undefined : earliest,
        summary:
          (pending
            ? L(
                `${inForce} 起递交的申请适用现行法。`,
                `Applications made from ${inForce} fall under the current law. `,
              )
            : '') + newSummary,
        checks: [newCheck],
        assumptions: newAssumptions,
        pendingDetails: newPending,
      });
    } else {
      const oldYears = v.oldNationalityYears.value;
      const oldInterval = v.oldIntervalYears.value;
      const at = pending as IsoDate;
      const old = assess(oldYears, oldInterval, applied)(at);
      const oldSpan = tripsBefore(old.from, at);
      const oldUnsure = old.verdict === 'yes' && oldSpan.count > 0;
      // A pending application that falls short leaves a new one under the
      // current law.
      const fallback = law === 'old' && old.verdict === 'no';
      pathways.push({
        ...common,
        status:
          law === 'unclear' || old.verdict === 'maybe' || oldUnsure
            ? 'UNKNOWN'
            : old.verdict === 'yes'
              ? 'MET'
              : newStatus,
        earliestDate: fallback && !unsure ? earliest : undefined,
        summary:
          (law === 'unclear'
            ? L(
                `申请恰在 ${inForce}（新法施行当天）递交，适用旧法还是现行法没有明文（PD-143）。按旧法，`,
                `The application was made on ${inForce}, the day the new law came into force; whether the earlier or the current text applies is not stated (PD-143). Under the earlier text, `,
              )
            : L(
                `申请在 ${at} 递交、${inForce} 仍在审理，适用旧法：`,
                `The application was made on ${at} and was pending on ${inForce}, so the earlier text applies: `,
              )) +
          (old.verdict === 'yes'
            ? L(
                `递交时已有 ${oldYears} 年合法居留。`,
                `you had ${oldYears} years of legal residence when you applied.`,
              )
            : old.verdict === 'maybe'
              ? L(
                  `递交时的 ${oldYears} 年合法居留待确认（居留签证期间或年天换算，PD-140、PD-141）。`,
                  `whether you had ${oldYears} years of legal residence when you applied is uncertain (time on a residence visa or converting years to days, PD-140, PD-141).`,
                )
              : L(
                  `递交时不满 ${oldYears} 年合法居留。重新递交的申请适用现行法：`,
                  `you did not have ${oldYears} years of legal residence when you applied. A new application falls under the current law: `,
                ) + newSummary) +
          (oldUnsure
            ? L(
                `计入的期间里有 ${oldSpan.count} 次出境、合计 ${oldSpan.absent} 天；国籍法没有规定缺席上限，影响待确认（PD-144）。`,
                ` In the counted period you have ${oldSpan.count} trips abroad, ${oldSpan.absent} days in all; the nationality law sets no limit on absences, so their effect is uncertain (PD-144).`,
              )
            : ''),
        checks: [
          {
            text: L(
              `递交日（${at}）递交当天合法居留，且前 ${oldInterval} 年内累计合法居留满 ${oldYears} 年（旧法；获批的临时居留可自申请之日起算）`,
              `Legal residence on the application date (${at}), and ${oldYears} years of it within the ${oldInterval} years before (earlier text; an approved temporary residence permit counts from its application)`,
            ),
            met:
              old.verdict === 'yes'
                ? true
                : old.verdict === 'maybe'
                  ? undefined
                  : false,
            sources: [
              ...v.oldNationalityYears.sources,
              ...v.oldIntervalYears.sources,
              ...v.lawInForce.sources,
            ],
          },
          ...(fallback ? [newCheck] : []),
        ],
        assumptions: [
          L(
            `旧法从申请首张临时居留许可之日起算（以获批为前提）；填了申请日期的，从该日到许可生效前一天计入。起算日当天不计（Código Civil art. 279，PD-142）；有空档时把 ${oldInterval} 年内各段的天数相加（PD-141）。`,
            `The earlier text counts from the application for the first temporary residence permit, once granted; if you entered that date, the time from it to the day before the permit started counts. The start day does not count (Código Civil art. 279, PD-142); with gaps, the days of each period within ${oldInterval} years are added up (PD-141).`,
          ),
          ...(old.verdict === 'no' ? newAssumptions : []),
        ],
        pendingDetails: [
          ...newPending.filter((id) => id !== 'PD-144' || old.verdict === 'no'),
          ...(law === 'unclear' ? ['PD-143'] : []),
          ...(oldUnsure ? ['PD-144'] : []),
        ],
      });
    }
  }

  // ---------- Permanent residence (Lei 23/2007 art. 80) ----------
  {
    const years = v.permanentYears.value;
    const title = L(
      '永久居留（autorização de residência permanente）',
      'Permanent residence (autorização de residência permanente)',
    );
    const permanent = req.permits.find(
      (p) => p.kind === 'permanent' && p.from <= sim && lastDay(p) >= sim,
    );
    if (permanent) {
      // Art. 85 n.º 2 b: 24 months in a row, or 30 within any 3 years.
      const windowYears = v.permanentAbsenceWindowYears.value;
      const [fewest, most] = monthSpan(v.permanentAbsenceTotalMonths.value);
      const to = lastDay(permanent);
      let worst = 0;
      const last = days.index(to);
      for (let i = Math.max(0, days.index(permanent.from)); i <= last; i++) {
        const d = days.date(i);
        const from = addDays(addYears(d, -windowYears), 1);
        worst = Math.max(
          worst,
          days.total(
            awaySums,
            from < permanent.from ? permanent.from : from,
            d,
          ),
        );
      }
      const long = tripsIn(permanent.from, to).some((t) =>
        tooLong(t, v.permanentAbsenceMonths.value),
      );
      pathways.push({
        id: 'PT-PERMANENT',
        title,
        status: 'NOT_APPLICABLE',
        summary: L(
          `记录中已有 ${permanent.from} 起的永久居留，许可本身没有期限（art. 76 n.º 1）。`,
          `Your record has permanent residence from ${permanent.from}; the permit itself has no time limit (art. 76 n.º 1).`,
        ),
        checks: [
          {
            text: L(
              `没有连续 ${v.permanentAbsenceMonths.value} 个月、或任意 ${windowYears} 年内累计 ${v.permanentAbsenceTotalMonths.value} 个月的出境（最多的 ${windowYears} 年里出境 ${worst} 天；超过时许可可被注销，art. 85 n.º 2 b）`,
              `No absence of ${v.permanentAbsenceMonths.value} months in a row, or ${v.permanentAbsenceTotalMonths.value} months within any ${windowYears} years (${worst} days abroad in the worst ${windowYears} years; beyond that the permit may be cancelled, art. 85 n.º 2 b)`,
            ),
            met:
              long || worst >= most
                ? false
                : worst >= fewest
                  ? undefined
                  : true,
            sources: [
              ...v.permanentAbsenceMonths.sources,
              { srcId: 'SRC-123', locator: 'art. 76 n.º 1 (p65)' },
            ],
          },
        ],
        notChecked: [
          L(
            '注销须"无正当理由"，在境外从事职业、经营、文化或社会活动的不注销（art. 85 n.º 2、4）',
            'Cancellation needs absence "without good reason", and does not apply to time abroad in professional, business, cultural or social activity (art. 85 n.º 2, 4)',
          ),
        ],
        assumptions: [
          L(
            '月数没有换算成天数的规定：超过最多天数算超过，介于最少与最多天数之间待确认；出入境当天按在葡萄牙计（PD-146）。',
            'Months have no day count in the law: beyond the most days they can have counts as over, and between the fewest and most it is uncertain; departure and return days count as days in Portugal (PD-146).',
          ),
        ],
        pendingDetails: ['PD-146'],
      });
    } else {
      const tempSums = days.sums(holds(TEMPORARY));
      // Holding temporary residence for the years and on the application day.
      const ok = (d: IsoDate) => covered(tempSums, yearsBefore(d, years), d);
      const earliest = firstDate(ok);
      // A temporary permit before the counted years means a gap broke them.
      const gap =
        !!earliest &&
        earliest !== sim &&
        req.permits.some(
          (p) =>
            TEMPORARY.includes(p.kind) && p.from < yearsBefore(earliest, years),
        );
      // Art. 85 n.º 2 a: within each temporary permit's validity.
      const [fewest, most] = monthSpan(v.temporaryAbsenceTotalMonths.value);
      const flagged = req.permits
        .filter((p) => TEMPORARY.includes(p.kind))
        .map((p) => {
          const to = lastDay(p);
          const absent = days.total(awaySums, p.from, to);
          const over =
            absent >= most ||
            tripsIn(p.from, to).some((t) =>
              tooLong(t, v.temporaryAbsenceMonths.value),
            );
          return { p, absent, over, near: !over && absent >= fewest };
        })
        .filter((x) => x.over || x.near);
      const worst = flagged.find((x) => x.over) ?? flagged[0];
      pathways.push({
        id: 'PT-PERMANENT',
        title,
        status: statusOf(earliest),
        earliestDate: earliest,
        summary:
          (earliest === sim
            ? L(
                `模拟日已持临时居留许可满 ${years} 年。`,
                `You have held temporary residence for ${years} years on the simulation date.`,
              )
            : earliest
              ? L(
                  `持临时居留许可满 ${years} 年的最早递交日是 ${earliest}。`,
                  `The earliest application date after ${years} years of temporary residence is ${earliest}.`,
                )
              : L(
                  `按现有记录，${HORIZON_YEARS} 年内达不到持临时居留许可满 ${years} 年。`,
                  `With your record you will not reach ${years} years of temporary residence within ${HORIZON_YEARS} years.`,
                )) +
          (gap
            ? L(
                '更早的临时居留因许可之间有空档未计入；续期期间的空档是否中断，法条没写（PD-145）。',
                ' Earlier temporary residence is left out because of a gap between permits; whether a gap while renewing breaks the years is not stated (PD-145).',
              )
            : '') +
          (worst
            ? L(
                `${worst.p.from} 起的许可期内出境合计 ${worst.absent} 天，许可可能被注销（不自动失效，不改变上面的日期）。`,
                ` During the permit from ${worst.p.from} you were abroad ${worst.absent} days in all, so the permit may be cancelled (it does not lapse by itself, and the date above is unchanged).`,
              )
            : ''),
        checks: [
          {
            text: L(
              `递交前 ${years} 年一直持临时居留许可（含黄金签证、学习），递交当天仍持有`,
              `Temporary residence (golden visa and study included) throughout the ${years} years before applying and on the application day`,
            ),
            met: ok(sim),
            sources: [
              ...v.permanentYears.sources,
              { srcId: 'SRC-123', locator: 'art. 74 n.º 1 (p65)' },
              {
                srcId: 'SRC-126',
                locator: 'Autorização de Residência Permanente (art. 80.º)',
                url: 'https://aima.gov.pt/pt/viver/autorizacao-de-residencia-permanente-art-80-o',
              },
            ],
          },
          {
            text: L(
              `每张临时居留许可的有效期内没有连续 ${v.temporaryAbsenceMonths.value} 个月或累计 ${v.temporaryAbsenceTotalMonths.value} 个月的出境（超过时许可可被注销）`,
              `No absence of ${v.temporaryAbsenceMonths.value} months in a row or ${v.temporaryAbsenceTotalMonths.value} months in all during any temporary permit (beyond that the permit may be cancelled)`,
            ),
            // Whether this applies to the golden visa is unclear (PD-146).
            met: flagged.some((x) => x.over && x.p.kind !== 'golden-visa')
              ? false
              : flagged.length
                ? undefined
                : true,
            sources: [
              ...v.temporaryAbsenceMonths.sources,
              ...v.temporaryAbsenceTotalMonths.sources,
            ],
          },
        ],
        notChecked: [
          L(
            '近 5 年刑期、生计、住房、基础葡萄牙语（art. 80 n.º 1 b–e）',
            'Prison sentences in the last 5 years, means of subsistence, accommodation and basic Portuguese (art. 80 n.º 1 b–e)',
          ),
          L(
            '注销须"无正当理由"，在境外从事职业、经营、文化或社会活动的不注销（art. 85 n.º 2、4）；2023 年 10 月起停收的房产类黄金签证旧案的特别规则（Lei 56/2023 art. 42）',
            'Cancellation needs absence "without good reason", and does not apply to time abroad in professional, business, cultural or social activity (art. 85 n.º 2, 4); special rules for real estate golden visas no longer accepted since October 2023 (Lei 56/2023 art. 42)',
          ),
        ],
        assumptions: [
          L(
            `学习、黄金签证许可都是临时居留许可（art. 74 n.º 1），居留签证期间不计。起算日当天不计，满 ${years} 年对应日的次日起可以递交（Código Civil art. 279，PD-142）；许可之间有空档即重新起算（PD-145）。`,
            `Study and golden visa permits are temporary residence permits (art. 74 n.º 1); time on a residence visa does not count. The start day does not count, so you can apply from the day after the same date ${years} years on (Código Civil art. 279, PD-142); a gap between permits starts the count again (PD-145).`,
          ),
          L(
            '出境只作注销风险提示（"可以"注销，art. 85 n.º 2）：月数没有换算成天数的规定，介于最少与最多天数之间的待确认；出入境当天按在葡萄牙计；对黄金签证是否适用不明（PD-146）。',
            'Absences are only a cancellation risk (the permit "may" be cancelled, art. 85 n.º 2): months have no day count in the law, so totals between the fewest and most days are uncertain; departure and return days count as days in Portugal; whether this applies to the golden visa is unclear (PD-146).',
          ),
          projection,
        ],
        pendingDetails: ['PD-142', ...(gap ? ['PD-145'] : []), 'PD-146'],
      });
    }
  }

  // ---------- EU long-term residence (Lei 23/2007 art. 125–126) ----------
  {
    const years = v.longTermYears.value;
    const [totalMin, totalMax] = monthSpan(v.longTermTotalAbsenceMonths.value);
    const fullSums = days.sums(holds(FULL));
    const studySums = days.sums(holds([...FULL, 'study']));
    const facts = (d: IsoDate) => {
      const from = yearsBefore(d, years);
      const to = addDays(d, -1);
      return {
        from,
        legal: covered(fullSums, from, to),
        withStudy: covered(studySums, from, to),
        // A study permit holder cannot apply (art. 125 n.º 2 a).
        holding: holds(FULL)(days.index(d)),
        long: tripsIn(from, to).filter((t) =>
          tooLong(t, v.longTermSingleAbsenceMonths.value),
        ),
        absent: days.total(awaySums, from, to),
      };
    };
    const verdict = (d: IsoDate): Verdict => {
      const f = facts(d);
      if (!f.holding || !f.withStudy || f.long.length || f.absent > totalMax)
        return 'no';
      return f.legal && f.absent <= totalMin ? 'yes' : 'maybe';
    };
    const earliest = firstDate((d) => verdict(d) === 'yes');
    const possible = firstDate((d) => verdict(d) !== 'no');
    const f = facts(sim);
    pathways.push({
      id: 'PT-EU-LONG-TERM',
      title: L(
        '欧盟长期居民（estatuto de residente de longa duração）',
        'EU long-term resident status (estatuto de residente de longa duração)',
      ),
      // Only uncertain readings reach a date: unknown, not unmet.
      status: !earliest && possible ? 'UNKNOWN' : statusOf(earliest),
      earliestDate: earliest,
      summary:
        (earliest === sim
          ? L(
              '模拟日已满足欧盟长期居民的时间条件。',
              'You meet the time requirements for EU long-term resident status on the simulation date.',
            )
          : earliest
            ? L(
                `满足欧盟长期居民时间条件的最早递交日是 ${earliest}。`,
                `The earliest application date that meets the time requirements for EU long-term resident status is ${earliest}.`,
              )
            : L(
                `按现有记录，${HORIZON_YEARS} 年内达不到欧盟长期居民的时间条件。`,
                `With your record you will not meet the time requirements for EU long-term resident status within ${HORIZON_YEARS} years.`,
              )) +
        (possible && (!earliest || possible < earliest)
          ? L(
              `学习等期间按一半计入、或出境合计按 ${v.longTermTotalAbsenceMonths.value} 个月的较宽口径时，最早可能是 ${possible}，原文没有写怎么换算（PD-147）。`,
              ` With study time counted at half, or reading the ${v.longTermTotalAbsenceMonths.value} months of absence generously, it could be as early as ${possible}; the law does not say how to convert (PD-147).`,
            )
          : ''),
      checks: [
        {
          text: L(
            `递交前 ${years} 年一直持临时居留、黄金签证或永久居留许可（学习、无薪实习、志愿期间按一半计），递交当天不是学习类许可`,
            `Temporary residence, golden visa or permanent residence throughout the ${years} years before applying (study, unpaid traineeship or volunteering at half), and not a study permit on the application day`,
          ),
          met:
            f.legal && f.holding
              ? true
              : f.withStudy && f.holding
                ? undefined
                : false,
          sources: [
            ...v.longTermYears.sources,
            {
              srcId: 'SRC-123',
              locator: 'art. 125 n.º 2 a) (p100), art. 126 n.º 3 (p101)',
            },
            {
              srcId: 'SRC-126',
              locator: 'Estatuto de residente de longa duração (art. 125.º)',
              url: 'https://aima.gov.pt/pt/viver/aquisicao-do-estatuto-de-residente-de-longa-duracao-erld-art-125-o',
            },
          ],
        },
        {
          text: L(
            `自 ${f.from} 起每次出境都短于 ${v.longTermSingleAbsenceMonths.value} 个月`,
            `Every absence since ${f.from} shorter than ${v.longTermSingleAbsenceMonths.value} months`,
          ),
          met: f.long.length === 0,
          sources: v.longTermSingleAbsenceMonths.sources,
        },
        {
          text: L(
            `自 ${f.from} 起出境合计 ${f.absent} 天（不超过 ${v.longTermTotalAbsenceMonths.value} 个月，即 ${totalMin}–${totalMax} 天以内）`,
            `${f.absent} days abroad since ${f.from} (${v.longTermTotalAbsenceMonths.value} months at most, ${totalMin}–${totalMax} days)`,
          ),
          met:
            f.absent <= totalMin
              ? true
              : f.absent > totalMax
                ? false
                : undefined,
          sources: v.longTermTotalAbsenceMonths.sources,
        },
      ],
      notChecked: [
        L(
          '稳定收入、医疗保险、住房、基础葡萄牙语（art. 126 n.º 1 b–e）',
          'Stable income, health insurance, accommodation and basic Portuguese (art. 126 n.º 1 b–e)',
        ),
        L(
          '国际保护自庇护申请日起算（art. 126 n.º 1 a），临时保护、季节工、派遣与外交身份不能申请（art. 125 n.º 2），因工作派遣的出境照计（art. 126 n.º 5）',
          'International protection counted from the asylum application (art. 126 n.º 1 a), temporary protection, seasonal and posted workers and diplomatic status being excluded (art. 125 n.º 2), and absences for posted work still counting (art. 126 n.º 5)',
        ),
        L(
          '取得后离开欧盟连续 12 个月或离开葡萄牙连续 6 年会失去身份（art. 131）',
          'Losing the status after 12 months in a row outside the EU or 6 years in a row outside Portugal (art. 131)',
        ),
      ],
      assumptions: [
        L(
          `${years} 年从递交日往回数，起算日当天不计（Código Civil art. 279，PD-142）；出入境当天按在葡萄牙计。单次出境按离境日起的日历月判断，合计出境没有换算成天数的规定（PD-147）。`,
          `The ${years} years are counted back from the application date, and the start day does not count (Código Civil art. 279, PD-142); departure and return days count as days in Portugal. A single absence is measured in calendar months from the day you left, and total absence has no day count in the law (PD-147).`,
        ),
        L(
          '学习等期间不作为满足条件的依据，全额计入后的日期在摘要另列（折半怎么换算未写明，PD-147）；合法居民指持居留证件的人（art. 3 n.º 1 v），居留签证期间不计；许可之间有空档即中断。',
          'Study and similar time is not relied on, and the date counting it in full is shown separately (how to halve it is not stated, PD-147); a legal resident holds a residence title (art. 3 n.º 1 v), so time on a residence visa does not count; any gap between permits breaks continuity.',
        ),
        projection,
      ],
      pendingDetails: ['PD-142', 'PD-147'],
    });
  }

  // ---------- Golden visa (ARI, art. 90-A; DR 84/2007 art. 65-C) ----------
  {
    const title = L(
      '黄金签证（ARI）的最低停留与续期',
      'Golden visa (ARI): minimum stays and renewal',
    );
    // Each renewal replaces the card before it: the latest card started by
    // the simulation date, else the first one to come.
    const cards = req.permits
      .filter((p) => p.kind === 'golden-visa')
      .sort((a, b) => (a.from < b.from ? -1 : 1));
    const current = cards.filter((p) => p.from <= sim).at(-1) ?? cards[0];
    if (!current || !current.to) {
      pathways.push({
        id: 'PT-GOLDEN-VISA',
        title,
        status: current ? 'UNKNOWN' : 'NOT_APPLICABLE',
        summary: current
          ? L(
              '请填写当前黄金签证许可卡上的到期日，才能算出续期时间。',
              'Enter the expiry date on your current golden visa card to work out the renewal dates.',
            )
          : L(
              '记录中没有黄金签证（投资居留许可）。',
              'Your record has no golden visa (residence permit for investment).',
            ),
        checks: [],
        notChecked: [],
        assumptions: [],
      });
    } else {
      const expiry = current.to;
      const granted = cards[0].from;
      const opens = addDays(expiry, -v.renewalWindowDays.value);
      const deadline = addDays(expiry, -v.renewalDeadlineDays.value);
      const timing: PilotStatus =
        sim < opens ? 'FUTURE' : sim <= deadline ? 'MET' : 'NOT_MET';
      // Minimum stays from the grant: the first year, then each later period
      // (2 years in the regulation, each year on AIMA's page), up to expiry.
      const firstYears = v.goldenVisaFirstPeriodYears.value;
      const periods = (step: number) => {
        const list = [
          {
            from: granted,
            to: addDays(afterYears(granted, firstYears), -1),
            need: v.goldenVisaFirstPeriodDays.value,
          },
        ];
        for (let n = firstYears; afterYears(granted, n) <= expiry; n += step)
          list.push({
            from: afterYears(granted, n),
            to: addDays(afterYears(granted, n + step), -1),
            need: v.goldenVisaLaterPeriodDays.value,
          });
        return list.map((p) => ({
          ...p,
          stayed:
            daysBetween(p.from, p.to) + 1 - days.total(awaySums, p.from, p.to),
        }));
      };
      const short = (step: number) =>
        periods(step).filter((p) => p.stayed < p.need);
      const lawShort = short(v.goldenVisaLaterPeriodYears.value)[0];
      // AIMA's page asks for 14 days in each later year.
      const aimaShort = short(1)[0];
      const stays = !aimaShort ? true : !lawShort ? undefined : false;
      const status: PilotStatus =
        stays === false
          ? 'NOT_MET'
          : stays === undefined && timing !== 'NOT_MET'
            ? 'UNKNOWN'
            : timing;
      const kept = afterYears(granted, v.goldenVisaInvestmentYears.value);
      const shortText = (p: {
        from: IsoDate;
        to: IsoDate;
        stayed: number;
        need: number;
      }) =>
        L(
          `${p.from} 至 ${p.to} 在葡萄牙 ${p.stayed} 天，少于 ${p.need} 天`,
          `${p.stayed} days in Portugal from ${p.from} to ${p.to}, fewer than ${p.need}`,
        );
      pathways.push({
        id: 'PT-GOLDEN-VISA',
        title,
        status,
        earliestDate:
          status === 'FUTURE' ? opens : status === 'MET' ? sim : undefined,
        summary:
          (timing === 'NOT_MET'
            ? L(
                `许可到期日是 ${expiry}，须在到期前 ${v.renewalDeadlineDays.value} 天（${deadline}）前申请续期，这一期限已过；逾期递交的后果不在试点范围。`,
                `The permit expires on ${expiry} and renewal had to be applied for by ${deadline}, ${v.renewalDeadlineDays.value} days before; that has passed, and what happens to a late application is out of scope.`,
              )
            : L(
                `续期申请在 ${opens} 至 ${deadline} 之间递交（到期日 ${expiry}），续期后每次 ${v.goldenVisaRenewalYears.value} 年。`,
                `Apply to renew from ${opens} to ${deadline} (the permit expires on ${expiry}); each renewal lasts ${v.goldenVisaRenewalYears.value} years.`,
              )) +
          (lawShort
            ? L(
                `最低停留不足：${shortText(lawShort)}，续期可能被拒。`,
                ` Minimum stay not met: ${shortText(lawShort)}, so renewal may be refused.`,
              )
            : aimaShort
              ? L(
                  `按条例的 ${v.goldenVisaLaterPeriodYears.value} 年期计已满足最低停留；按 AIMA 页面"此后每年 ${v.goldenVisaLaterPeriodDays.value} 天"的写法，${shortText(aimaShort)}（PD-148）。`,
                  ` The minimum stays are met in the regulation's ${v.goldenVisaLaterPeriodYears.value}-year periods; on AIMA's page, which asks for ${v.goldenVisaLaterPeriodDays.value} days in each later year, ${shortText(aimaShort)} (PD-148).`,
                )
              : '') +
          L(
            `投资须自 ${granted} 起维持 ${v.goldenVisaInvestmentYears.value} 年（到 ${kept}），本试点不检查投资。`,
            ` The investment must be kept for ${v.goldenVisaInvestmentYears.value} years from ${granted} (to ${kept}); this pilot does not check it.`,
          ),
        checks: [
          {
            text: L(
              `在续期期间内（${opens} 至 ${deadline}）`,
              `Within the renewal period (${opens} to ${deadline})`,
            ),
            met: timing === 'MET',
            sources: [
              ...v.renewalDeadlineDays.sources,
              ...v.renewalWindowDays.sources,
              ...v.goldenVisaRenewalYears.sources,
            ],
          },
          {
            text: L(
              `最低停留：第 1 年在葡萄牙至少 ${v.goldenVisaFirstPeriodDays.value} 天，此后每 ${v.goldenVisaLaterPeriodYears.value} 年至少 ${v.goldenVisaLaterPeriodDays.value} 天（连续或分段）`,
              `Minimum stays: at least ${v.goldenVisaFirstPeriodDays.value} days in Portugal in the first year, then ${v.goldenVisaLaterPeriodDays.value} days in each ${v.goldenVisaLaterPeriodYears.value}-year period (in one go or not)`,
            ),
            met: stays,
            sources: [
              ...v.goldenVisaFirstPeriodDays.sources,
              ...v.goldenVisaLaterPeriodDays.sources,
            ],
          },
        ],
        notChecked: [
          L(
            '投资金额与是否仍维持（art. 3 n.º 1 d、art. 90-A n.º 2），续期的其他条件（art. 78 n.º 2），家属许可；2023 年 10 月起停收的房产类旧案（Lei 56/2023 art. 42）',
            'The investment amount and whether it is kept (art. 3 n.º 1 d, art. 90-A n.º 2), other renewal conditions (art. 78 n.º 2) and family members; real estate golden visas no longer accepted since October 2023 (Lei 56/2023 art. 42)',
          ),
        ],
        assumptions: [
          L(
            '授予日按第一张黄金签证卡的生效日；第 1 年和之后各期从授予日起按日历计，出入境当天按在葡萄牙计；条例的期间划分沿用首张 1 年的旧制，与现行首张期限怎么对应没写（PD-148）。',
            'The grant date is taken as the start of your first golden visa card; the first year and the later periods run from it by the calendar, and departure and return days count as days in Portugal; the regulation’s periods follow the old one-year first card, and how they fit the current first card is not stated (PD-148).',
          ),
          L(
            `到期前 ${v.renewalDeadlineDays.value} 天是法律期限（art. 78 n.º 1）；最早到期前 ${v.renewalWindowDays.value} 天来自条例编纂版，公报原文未取得（PD-149）。`,
            `${v.renewalDeadlineDays.value} days before expiry is the legal deadline (art. 78 n.º 1); the earliest date, ${v.renewalWindowDays.value} days before, comes from a consolidated text of the regulation, as the official gazette text was not obtained (PD-149).`,
          ),
          projection,
        ],
        pendingDetails: ['PD-148', 'PD-149'],
      });
    }
  }

  return { policyAsOf: pt.asOf, pathways };
}
