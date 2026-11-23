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
 * permit; permanent: permanent residence (art. 76); eu-long-term: EU
 * long-term resident status (art. 125–131).
 */
export const PT_PERMIT_KINDS = [
  'temporary',
  'golden-visa',
  'study',
  'visa',
  'permanent',
  'eu-long-term',
] as const;
export type PtPermitKind = (typeof PT_PERMIT_KINDS)[number];

/**
 * cplp: a Portuguese-speaking country; eu: an EU member state; eea: another
 * EEA state or Switzerland (free movement, but not EU for naturalisation).
 */
export const PT_NATIONALITY_ROUTES = [
  'cplp',
  'eu',
  'eea',
  'other',
  'stateless',
] as const;
export type PtNationalityRoute = (typeof PT_NATIONALITY_ROUTES)[number];

export interface PtPermit {
  kind: PtPermitKind;
  from: IsoDate;
  /** Last day of the card; absent = renewed on time. */
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
  'eu-long-term',
];
const TEMPORARY: PtPermitKind[] = ['temporary', 'golden-visa', 'study'];
const FULL: PtPermitKind[] = [
  'temporary',
  'golden-visa',
  'permanent',
  'eu-long-term',
];

const later = (a: IsoDate, b: IsoDate) => (a > b ? a : b);
const earlier = (a: IsoDate, b: IsoDate) => (a < b ? a : b);

export function evaluatePortugal(req: PtRequest): PtResult {
  const L = textFor(req);
  const sim = req.simulationDate;
  const pending = req.pendingApplication;
  // Free movement: outside the foreigners law (art. 4 n.º 2 a).
  const eu = req.route === 'eu' || req.route === 'eea';
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
  /**
   * The last day a permit counts: permanent residence and EU long-term
   * resident status have no time limit whatever the card says (art. 76
   * n.º 1–2, art. 130 n.º 2); one without an end date lasts until its
   * renewal (the next one of the same kind) starts.
   */
  const lastDay = (permit: PtPermit) => {
    if (permit.kind === 'permanent' || permit.kind === 'eu-long-term')
      return end;
    const next = req.permits
      .filter((p) => p.kind === permit.kind && p.from > permit.from)
      .map((p) => p.from)
      .sort()[0];
    return permit.to ?? (next ? addDays(next, -1) : end);
  };
  const byKind = Object.fromEntries(
    PT_PERMIT_KINDS.map((k) => [k, flags()]),
  ) as Record<PtPermitKind, boolean[]>;
  // The right of residence lasts some months after a temporary card expires
  // (SRC-126); how that time counts is uncertain (PD-145). It keeps
  // continuity, but is a permit to apply with only after a permit other than
  // study and until a newer permit replaces it.
  const grace = flags();
  const graceToApply = flags();
  for (const permit of req.permits) {
    days.mark(byKind[permit.kind], permit.from, lastDay(permit));
    if (!permit.to || !TEMPORARY.includes(permit.kind)) continue;
    const until = addMonths(permit.to, v.residenceRightMonths.value);
    days.mark(grace, addDays(permit.to, 1), until);
    const next = req.permits
      .filter((p) => p.kind !== 'visa' && p.from > permit.from)
      .map((p) => p.from)
      .sort()[0];
    if (permit.kind !== 'study')
      days.mark(
        graceToApply,
        addDays(permit.to, 1),
        next ? earlier(addDays(next, -1), until) : until,
      );
  }
  const holds = (kinds: PtPermitKind[]) => (i: number) =>
    kinds.some((k) => byKind[k][i]);
  // The grace only fills days without a valid permit: on other days the
  // permit held decides how the day counts.
  for (let i = 0; i < days.count; i++) if (holds(TITLES)(i)) grace[i] = false;
  const orGrace = (held: (i: number) => boolean) => (i: number) =>
    held(i) || grace[i];
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
  /** Some trip keeps you abroad `months` in a row within [from, to]. */
  const longAway = (from: IsoDate, to: IsoDate, months: number) =>
    req.trips.some((t) => {
      const a = later(addDays(t.departed, 1), from);
      const b = earlier(addDays(t.returned, -1), to);
      return a <= b && b >= addMonths(addDays(a, -1), months);
    });
  /** The first day some trip from `from` on has kept you abroad `months`. */
  const awayFor = (from: IsoDate, months: number) =>
    req.trips
      .map((t) => {
        const a = later(addDays(t.departed, 1), from);
        const d = addMonths(addDays(a, -1), months);
        return d <= addDays(t.returned, -1) ? d : '';
      })
      .filter(Boolean)
      .sort()[0] as IsoDate | undefined;
  /**
   * First day of the `n` years that must be complete before `d`: the day a
   * period starts is not counted, and it ends with the same date `n` years
   * on, or the end of February without one (Código Civil art. 279 b–c,
   * PD-142).
   */
  const yearsBefore = (d: IsoDate, n: number) => {
    const last = addDays(d, -1);
    const start = addYears(last, -n);
    const next = addDays(start, 1);
    return addYears(next, n) <= last ? next : start;
  };
  const firstDate = (ok: (d: IsoDate) => boolean): IsoDate | undefined => {
    for (let i = days.index(sim); i < days.count; i++) {
      const d = days.date(i);
      if (ok(d)) return d;
    }
    return undefined;
  };
  /**
   * From the first date met for sure and the first met under an uncertain
   * reading: met on the simulation date only under that reading is unknown.
   */
  const statusOf = (earliest?: IsoDate, possible?: IsoDate): PilotStatus =>
    earliest === sim
      ? 'MET'
      : possible === sim
        ? 'UNKNOWN'
        : earliest
          ? 'FUTURE'
          : possible
            ? 'UNKNOWN'
            : 'NOT_MET';
  /** The date under an uncertain reading, when it comes before the sure one. */
  const maybeNote = (
    earliest: IsoDate | undefined,
    possible: IsoDate | undefined,
    zh: string,
    en: string,
    pds: string[],
  ) =>
    !possible || (earliest && possible >= earliest)
      ? ''
      : possible === sim
        ? L(
            `${zh}，模拟日可能已经满足，原文未写明（${pds.join('、')}）。`,
            ` ${en}, you may already qualify on the simulation date; the rules do not say (${pds.join(', ')}).`,
          )
        : L(
            `${zh}，最早可能是 ${possible}，原文未写明（${pds.join('、')}）。`,
            ` ${en}, it could be as early as ${possible}; the rules do not say (${pds.join(', ')}).`,
          );
  const projection = L(
    '最早日期假设模拟日之后一直在葡萄牙（已录入的未来出境除外），没有到期日的许可都按时续期。',
    'Projected dates assume you stay in Portugal after the simulation date (apart from trips you entered) and that permits without an end date are renewed on time.',
  );
  const notForEu = (id: PtPathwayId, title: string, extra = '') => ({
    id,
    title,
    status: 'NOT_APPLICABLE' as const,
    summary: L(
      `外国人法不适用于欧盟、欧洲经济区国家以及与欧盟有人员自由流动协定的国家（如瑞士）的国民（art. 4 n.º 2 a）${extra}；这些国民按自由流动制度登记居留。`,
      `The foreigners law does not apply to nationals of the EU, the EEA or a country with a free movement agreement with the EU such as Switzerland (art. 4 n.º 2 a)${extra}; they register their residence under the free movement rules.`,
    ),
    checks: [],
    notChecked: [],
    assumptions: [],
  });
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
        // Days abroad while resident.
        away: days.sums((i) => away[i] && held(i)),
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
      // starts with the residence title (PD-140); the months after a card
      // expires are uncertain too (PD-145).
      const maybe = count(
        (i) => titled(i) || byKind.visa[i] || grace[i] || !!extra?.[i],
      );
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
      return {
        sure,
        at: (d: IsoDate): Assessment => {
          const a = judge(sure, d);
          if (a.verdict !== 'no') return a;
          const b = judge(maybe, d);
          return {
            verdict: b.verdict === 'no' ? 'no' : 'maybe',
            from: b.from,
          };
        },
      };
    };
    /**
     * Trips abroad on days of counted residence from `from` up to and
     * including the filing day `d`: being here counts for legal residence
     * (art. 15 n.º 1, PD-144).
     */
    const tripsUpTo = (c: Count, from: IsoDate, d: IsoDate) => {
      const trips = req.trips.filter((t) => {
        const a = later(addDays(t.departed, 1), from);
        const b = earlier(addDays(t.returned, -1), d);
        return a <= b && days.total(c.away, a, b) > 0;
      });
      return { count: trips.length, absent: days.total(c.away, from, d) };
    };

    const inForce = v.lawInForce.value;
    const oldFrom = v.oldTextFrom.value;
    const law: 'before' | 'old' | 'unclear' | 'new' = !pending
      ? 'new'
      : pending < oldFrom
        ? 'before'
        : pending < inForce
          ? 'old'
          : pending === inForce
            ? 'unclear'
            : 'new';
    const years = v.nationalityYears.value[req.route];
    const interval = v.nationalityIntervalYears.value[req.route];
    const current = assess(years, interval);
    const earliest = firstDate((d) => current.at(d).verdict === 'yes');
    const possible = firstDate((d) => current.at(d).verdict !== 'no');
    const span =
      earliest && tripsUpTo(current.sure, current.at(earliest).from, earliest);
    const trips = !!span && span.count > 0;
    const unsure = trips || eu;
    const nowAt = current.at(sim);
    // Trips make a verdict met on the calendar uncertain (PD-144).
    const now =
      nowAt.verdict === 'yes' &&
      tripsUpTo(current.sure, nowAt.from, sim).count > 0
        ? 'maybe'
        : nowAt.verdict;
    const newStatus: PilotStatus = unsure
      ? 'UNKNOWN'
      : statusOf(earliest, possible);
    const newSummary =
      (eu
        ? L(
            `欧盟、欧洲经济区与瑞士公民按自由流动制度登记居留，不持外国人法的居留许可，表单也无法录入这类登记；它怎么计入 ${years} 年，试点没有建模（art. 15 n.º 2，PD-140）。`,
            `EU, EEA and Swiss citizens register their residence under the free movement rules rather than holding permits under the foreigners law, and the form cannot record that registration; how it counts towards the ${years} years is not modelled (art. 15 n.º 2, PD-140). `,
          )
        : '') +
      (earliest === sim && !unsure
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
      maybeNote(
        earliest,
        possible,
        '若把居留签证期间、居留卡到期后的 6 个月计入，或分段累计时按较宽的年天换算',
        'Counting time on a residence visa or the months after a card expired, or converting years to days generously when periods are added up',
        ['PD-140', 'PD-141', 'PD-145'],
      ) +
      (trips && span
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
      // EU registration is not modelled (PD-140).
      met:
        now === 'yes' && !eu ? true : now === 'no' && !eu ? false : undefined,
      sources: [
        ...v.nationalityYears.sources,
        ...v.nationalityIntervalYears.sources,
        { srcId: 'SRC-120', locator: 'art. 15 n.º 1–2 (p5, p14)' },
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
        '法条：合法居留指持外国人法规定的证件、签证或许可在葡萄牙的人（art. 15 n.º 1），"自申请居留许可之日起算"的旧 art. 15 n.º 4 已废止。判决理由：宪法法院认为取得居留证件即开始计算（D.5）。试点假设：按录入的许可生效日起算；居留签证期间、居留卡到期后 6 个月内的居留权不作为满足条件的依据，计入后的日期另列（PD-140、PD-145）。递交当天须合法居留。',
        'The law: legal residence means being in Portugal on a title, visa or permit under the foreigners law (art. 15 n.º 1), and old art. 15 n.º 4, counting from the residence application, was repealed. The Constitutional Court’s reasoning: the count starts when the residence title is obtained (D.5). The pilot’s assumption: the count starts on the permit dates you entered; time on a residence visa and the right of residence in the months after a card expires are not relied on, and the date counting them is shown separately (PD-140, PD-145). You must be legally resident on the application day.',
      ),
      L(
        `连续居留按日历计：起算日当天不计，满 ${years} 年对应日的次日起可以递交（Código Civil art. 279，PD-142）。有空档时把 ${interval} 年内各段（每段起算日不计）的天数相加，按以递交日为终点的 ${interval} 年计（PD-141）。`,
        `Unbroken residence is counted by the calendar: the start day does not count, and you can apply from the day after the same date ${years} years on (Código Civil art. 279, PD-142). With gaps, the days of each period (without its start day) within ${interval} years are added up, taking the ${interval} years as those ending on the application date (PD-141).`,
      ),
      projection,
    ];
    const newPending = [
      'PD-140',
      'PD-141',
      'PD-142',
      ...(trips ? ['PD-144'] : []),
      ...(possible && (!earliest || possible < earliest) ? ['PD-145'] : []),
    ];

    if (law === 'new') {
      pathways.push({
        ...common,
        status: newStatus,
        earliestDate: newStatus === 'UNKNOWN' ? undefined : earliest,
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
    } else if (law === 'before') {
      pathways.push({
        ...common,
        status: 'UNKNOWN',
        summary: L(
          `申请在 ${pending} 递交，早于 LO 1/2024 施行（${oldFrom}），适用更早的文本，试点没有建模（PD-143）。`,
          `The application was made on ${pending}, before LO 1/2024 came into force (${oldFrom}), so an even earlier text applies; the pilot does not model it (PD-143).`,
        ),
        checks: [],
        assumptions: [],
        pendingDetails: ['PD-143'],
      });
    } else {
      const oldYears = v.oldNationalityYears.value;
      const oldInterval = v.oldIntervalYears.value;
      const at = pending as IsoDate;
      const oldLaw = assess(oldYears, oldInterval, applied);
      const old = oldLaw.at(at);
      const oldSpan = tripsUpTo(oldLaw.sure, old.from, at);
      const oldTrips = old.verdict === 'yes' && oldSpan.count > 0;
      // Short on permit time alone: the residence application may make it up.
      const ask = old.verdict === 'no' && !appliedOn;
      // Short anyway: a new application falls under the current law, which
      // decides the status when the earlier text clearly applied.
      const showNew = old.verdict === 'no' && !ask;
      const fallback = law === 'old' && showNew;
      pathways.push({
        ...common,
        status: fallback
          ? newStatus
          : old.verdict === 'yes' && law === 'old' && !oldTrips
            ? 'MET'
            : 'UNKNOWN',
        earliestDate:
          fallback && newStatus !== 'UNKNOWN' ? earliest : undefined,
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
                  `递交时的 ${oldYears} 年合法居留待确认（居留签证、居留卡到期后的期间或年天换算，PD-140、PD-141、PD-145）。`,
                  `whether you had ${oldYears} years of legal residence when you applied is uncertain (time on a residence visa, after a card expired, or converting years to days, PD-140, PD-141, PD-145).`,
                )
              : ask
                ? L(
                    `仅按许可生效日计算，递交时不满 ${oldYears} 年；旧法从申请首张临时居留许可之日起算，请填写这个日期再算。`,
                    `counting from the permit start alone, you had less than ${oldYears} years when you applied; the earlier text counts from the application for your first temporary residence permit, so enter that date and try again.`,
                  )
                : L(
                    `递交时不满 ${oldYears} 年合法居留。重新递交的申请适用现行法：`,
                    `you did not have ${oldYears} years of legal residence when you applied. A new application falls under the current law: `,
                  ) + newSummary) +
          (oldTrips
            ? L(
                `计入的期间里有 ${oldSpan.count} 次出境、合计 ${oldSpan.absent} 天；国籍法没有规定缺席上限，影响待确认（PD-144）。`,
                ` In the counted period you have ${oldSpan.count} trips abroad, ${oldSpan.absent} days in all; the nationality law sets no limit on absences, so their effect is uncertain (PD-144).`,
              )
            : ''),
        checks: [
          {
            text: L(
              `递交日（${at}）当天合法居留，且前 ${oldInterval} 年内累计合法居留满 ${oldYears} 年（旧法；获批的临时居留可自申请之日起算）`,
              `Legal residence on the application date (${at}), and ${oldYears} years of it within the ${oldInterval} years before (earlier text; an approved temporary residence permit counts from its application)`,
            ),
            met:
              old.verdict === 'yes' && !oldTrips
                ? true
                : old.verdict !== 'no' || ask
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
          ...(showNew ? newAssumptions : []),
        ],
        pendingDetails: [
          ...(showNew ? newPending : ['PD-140', 'PD-141', 'PD-142']),
          ...(law === 'unclear' ? ['PD-143'] : []),
          ...(oldTrips ? ['PD-144'] : []),
          ...(old.verdict === 'maybe' ? ['PD-145'] : []),
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
      (p) => p.kind === 'permanent' && p.from <= sim,
    );
    if (eu) {
      pathways.push(notForEu('PT-PERMANENT', title));
    } else if (permanent) {
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
          days.total(awaySums, later(from, permanent.from), d),
        );
      }
      const long = longAway(permanent.from, to, v.permanentAbsenceMonths.value);
      pathways.push({
        id: 'PT-PERMANENT',
        title,
        status: 'NOT_APPLICABLE',
        summary: L(
          `记录中已有 ${permanent.from} 起的永久居留，许可本身没有期限，卡面到期只需换发（art. 76 n.º 1–2）。`,
          `Your record has permanent residence from ${permanent.from}; the permit itself has no time limit, and an expired card only needs renewing (art. 76 n.º 1–2).`,
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
              { srcId: 'SRC-123', locator: 'art. 76 n.º 1–2 (p65)' },
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
      const temporary = holds(TEMPORARY);
      const sure = days.sums(temporary);
      const maybe = days.sums(orGrace(temporary));
      // Holding temporary residence for the years and on the application day.
      const ok = (s: number[]) => (d: IsoDate) =>
        covered(s, yearsBefore(d, years), d);
      const earliest = firstDate(ok(sure));
      const possible = firstDate(ok(maybe));
      const status = statusOf(earliest, possible);
      // Art. 85 n.º 2 a: within each temporary permit's validity.
      const [fewest, most] = monthSpan(v.temporaryAbsenceTotalMonths.value);
      const flagged = req.permits
        .filter((p) => TEMPORARY.includes(p.kind))
        .map((p) => {
          const to = lastDay(p);
          const absent = days.total(awaySums, p.from, to);
          const over =
            absent >= most ||
            longAway(p.from, to, v.temporaryAbsenceMonths.value);
          return { p, absent, over, near: !over && absent >= fewest };
        })
        .filter((x) => x.over || x.near);
      const worst = flagged.find((x) => x.over) ?? flagged[0];
      pathways.push({
        id: 'PT-PERMANENT',
        title,
        status,
        earliestDate: status === 'UNKNOWN' ? undefined : earliest,
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
          maybeNote(
            earliest,
            possible,
            `若居留卡到期后 ${v.residenceRightMonths.value} 个月内仍有居留权的期间也算持有许可`,
            `Counting the ${v.residenceRightMonths.value} months of residence right after a card expires as holding a permit`,
            ['PD-145'],
          ) +
          (worst
            ? L(
                `${worst.p.from} 起的许可期内出境合计 ${worst.absent} 天，许可可能被注销（不自动失效，不改变上面的日期）。`,
                ` During the permit from ${worst.p.from} you were abroad ${worst.absent} days in all, so the permit may be cancelled (it does not lapse by itself, and the date above is unchanged).`,
              )
            : '') +
          (req.permits.some((p) => p.kind === 'eu-long-term' && p.from <= sim)
            ? L(
                '记录中已有欧盟长期居民身份（另一种没有期限的身份，见下一项）；国内永久居留仍按 art. 80 另算。',
                ' Your record already has EU long-term resident status (another status without a time limit, see below); national permanent residence is still worked out under art. 80.',
              )
            : ''),
        checks: [
          {
            text: L(
              `递交前 ${years} 年一直持临时居留许可（含黄金签证、学习），递交当天仍持有`,
              `Temporary residence (golden visa and study included) throughout the ${years} years before applying and on the application day`,
            ),
            met: ok(sure)(sim) ? true : ok(maybe)(sim) ? undefined : false,
            sources: [
              ...v.permanentYears.sources,
              { srcId: 'SRC-123', locator: 'art. 74 n.º 1 (p65)' },
              {
                srcId: 'SRC-126',
                locator: 'Autorização de Residência Permanente (art. 80.º)',
                url: 'https://aima.gov.pt/pt/viver/autorizacao-de-residencia-permanente-art-80-o',
              },
              ...v.residenceRightMonths.sources,
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
            `学习、黄金签证许可都是临时居留许可（art. 74 n.º 1），居留签证期间不计。起算日当天不计，满 ${years} 年对应日的次日起可以递交（Código Civil art. 279，PD-142）；许可之间有空档即重新起算，卡到期后 ${v.residenceRightMonths.value} 个月内仍有居留权的期间不作为满足条件的依据（PD-145）。`,
            `Study and golden visa permits are temporary residence permits (art. 74 n.º 1); time on a residence visa does not count. The start day does not count, so you can apply from the day after the same date ${years} years on (Código Civil art. 279, PD-142); a gap between permits starts the count again, and the ${v.residenceRightMonths.value} months of residence right after a card expires are not relied on (PD-145).`,
          ),
          L(
            '出境只作注销风险提示（"可以"注销，art. 85 n.º 2），按每张许可的有效期分开计：月数没有换算成天数的规定，介于最少与最多天数之间的待确认；出入境当天按在葡萄牙计；对黄金签证是否适用不明（PD-146）。',
            'Absences are only a cancellation risk (the permit "may" be cancelled, art. 85 n.º 2), counted separately for each permit: months have no day count in the law, so totals between the fewest and most days are uncertain; departure and return days count as days in Portugal; whether this applies to the golden visa is unclear (PD-146).',
          ),
          projection,
        ],
        pendingDetails: ['PD-142', 'PD-145', 'PD-146'],
      });
    }
  }

  // ---------- EU long-term residence (Lei 23/2007 art. 125–126) ----------
  {
    const years = v.longTermYears.value;
    const title = L(
      '欧盟长期居民（estatuto de residente de longa duração）',
      'EU long-term resident status (estatuto de residente de longa duração)',
    );
    const longTerm = req.permits.find(
      (p) => p.kind === 'eu-long-term' && p.from <= sim,
    );
    if (eu) {
      pathways.push(
        notForEu(
          'PT-EU-LONG-TERM',
          title,
          L(
            '，这一身份只给第三国国民（art. 125 n.º 1）',
            ', and this status is only for third-country nationals (art. 125 n.º 1)',
          ),
        ),
      );
    } else if (longTerm) {
      // Loss (art. 131 n.º 1 c, e): 12 months in a row outside the EU, or 6
      // years in a row outside Portugal; trips do not say where you went.
      const lossYears = v.longTermLossYears.value;
      const lossMonths = v.longTermLossEuMonths.value;
      // Checked with trips up to the simulation date; planned trips that
      // would reach a limit later are a forecast.
      const lostAll = awayFor(longTerm.from, lossYears * 12);
      const lostEu = awayFor(longTerm.from, lossMonths);
      const lostSoonAll = !!lostAll && lostAll > sim;
      const lostSoonEu = !!lostEu && lostEu > sim;
      pathways.push({
        id: 'PT-EU-LONG-TERM',
        title,
        status: 'NOT_APPLICABLE',
        summary:
          L(
            `记录中已有 ${longTerm.from} 起的欧盟长期居民身份，身份本身没有期限，卡面到期只需换发（art. 130 n.º 2）。`,
            `Your record has EU long-term resident status from ${longTerm.from}; the status has no time limit, and an expired card only needs renewing (art. 130 n.º 2).`,
          ) +
          (lostSoonEu || lostSoonAll
            ? L(
                `按已录入的计划出境，${[
                  lostSoonEu
                    ? `${lostEu} 离开葡萄牙满 ${lossMonths} 个月，若这段时间在欧盟以外会失去身份（出境记录分不出是否在欧盟内，待确认）`
                    : '',
                  lostSoonAll
                    ? `${lostAll} 离开葡萄牙满 ${lossYears} 年，会失去身份`
                    : '',
                ]
                  .filter(Boolean)
                  .join(
                    '；',
                  )}。有特殊或例外理由（例如在原籍国从事职业、经营、文化或社会活动）的缺席不失去身份（art. 131 n.º 2–3）。`,
                ` With the trips you plan, ${[
                  lostSoonEu
                    ? `you will have been away from Portugal ${lossMonths} months on ${lostEu}, and lose the status if that time is outside the EU (trips do not say, so this is uncertain)`
                    : '',
                  lostSoonAll
                    ? `you will have been away from Portugal ${lossYears} years on ${lostAll} and lose the status`
                    : '',
                ]
                  .filter(Boolean)
                  .join(
                    '; ',
                  )}. Absences for specific or exceptional reasons, such as professional, business, cultural or social activity in your country of origin, do not lose the status (art. 131 n.º 2–3).`,
              )
            : ''),
        checks: [
          {
            text: L(
              `没有离开葡萄牙连续 ${lossYears} 年，也没有离开欧盟连续 ${lossMonths} 个月（出境记录分不出是否在欧盟内；超过时失去身份，art. 131 n.º 1 c、e）`,
              `No absence from Portugal of ${lossYears} years in a row, nor from the EU of ${lossMonths} months in a row (trips do not say whether you stayed in the EU; beyond that the status is lost, art. 131 n.º 1 c, e)`,
            ),
            met:
              lostAll && lostAll <= sim
                ? false
                : lostEu && lostEu <= sim
                  ? undefined
                  : true,
            sources: [
              ...v.longTermLossEuMonths.sources,
              ...v.longTermLossYears.sources,
              { srcId: 'SRC-123', locator: 'art. 130 n.º 2 (p102)' },
            ],
          },
        ],
        notChecked: [
          L(
            '有特殊或例外理由的缺席不失去身份（art. 131 n.º 2–3）',
            'Absences for specific or exceptional reasons do not lose the status (art. 131 n.º 2–3)',
          ),
        ],
        assumptions: [
          L(
            '检查只看模拟日以前的出境，计划中的出境只在摘要里预告；按离境日起的日历月、年判断，出入境当天按在葡萄牙计（PD-146）。',
            'The check looks only at time abroad up to the simulation date, and planned trips are shown as a forecast in the summary; measured in calendar months and years from the day you left, with departure and return days counted as days in Portugal (PD-146).',
          ),
        ],
        pendingDetails: ['PD-146'],
      });
    } else {
      const [totalMin, totalMax] = monthSpan(
        v.longTermTotalAbsenceMonths.value,
      );
      // Full permits count in full and study at half (art. 126 n.º 3,
      // worked out in half days, PD-147). For a last day `to`, the start of
      // the shortest unbroken stretch ending there worth `need` half days.
      const halfCredit = (full: (i: number) => boolean) => {
        const fullSums = days.sums(full);
        const studySums = days.sums((i) => byKind.study[i] && !full(i));
        const run: number[] = [];
        for (let i = 0; i < days.count; i++)
          run.push(
            !full(i) && !byKind.study[i]
              ? -1
              : i > 0 && run[i - 1] >= 0
                ? run[i - 1]
                : i,
          );
        const credit = (a: number, k: number) =>
          2 * (fullSums[k + 1] - fullSums[a]) + studySums[k + 1] - studySums[a];
        return (to: IsoDate, need: number): IsoDate | undefined => {
          const k = days.index(to);
          if (k < 0 || run[k] < 0 || credit(run[k], k) < need) return undefined;
          let lo = run[k];
          let hi = k;
          while (lo < hi) {
            const mid = (lo + hi + 1) >> 1;
            if (credit(mid, k) >= need) lo = mid;
            else hi = mid - 1;
          }
          return days.date(lo);
        };
      };
      const full = holds(FULL);
      const sureFrom = halfCredit(full);
      // The months after a temporary card expires are uncertain (PD-145).
      const maybeFrom = halfCredit(orGrace(full));
      const single = v.longTermSingleAbsenceMonths.value;
      // Trips count up to the day before applying: one still under way is
      // judged by its length so far.
      const absences = (start: IsoDate, to: IsoDate) => ({
        start,
        long: tripsIn(start, to).filter(
          (t) =>
            earlier(addDays(t.returned, -1), to) >=
            addMonths(t.departed, single),
        ),
        absent: days.total(awaySums, start, to),
      });
      // A trip entered for later that will reach the single absence limit.
      const breach = req.trips
        .filter((t) => addMonths(t.departed, single) < t.returned)
        .map((t) => addMonths(t.departed, single))
        .filter((d) => d >= sim)
        .sort()[0];
      const facts = (d: IsoDate) => {
        const from = yearsBefore(d, years);
        const to = addDays(d, -1);
        const need = 2 * (daysBetween(from, to) + 1);
        const i = days.index(d);
        // A study permit holder cannot apply (art. 125 n.º 2 a).
        const sure = full(i) ? sureFrom(to, need) : undefined;
        const maybe =
          full(i) || graceToApply[i] ? maybeFrom(to, need) : undefined;
        return {
          sure: sure ? absences(sure, to) : undefined,
          maybe: maybe ? absences(maybe, to) : undefined,
          shown: absences(sure ?? maybe ?? from, to),
        };
      };
      const judge = (a?: ReturnType<typeof absences>): Verdict =>
        !a || a.long.length || a.absent > totalMax
          ? 'no'
          : a.absent <= totalMin
            ? 'yes'
            : 'maybe';
      const verdict = (d: IsoDate): Verdict => {
        const f = facts(d);
        const sure = judge(f.sure);
        return sure === 'yes'
          ? 'yes'
          : sure === 'maybe' || judge(f.maybe) !== 'no'
            ? 'maybe'
            : 'no';
      };
      const earliest = firstDate((d) => verdict(d) === 'yes');
      const possible = firstDate((d) => verdict(d) !== 'no');
      const status = statusOf(earliest, possible);
      const f = facts(sim);
      pathways.push({
        id: 'PT-EU-LONG-TERM',
        title,
        status,
        earliestDate: status === 'UNKNOWN' ? undefined : earliest,
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
          maybeNote(
            earliest,
            possible,
            `若出境合计按 ${v.longTermTotalAbsenceMonths.value} 个月的较宽口径，或居留卡到期后 ${v.residenceRightMonths.value} 个月内的期间也算`,
            `Reading the ${v.longTermTotalAbsenceMonths.value} months of absence generously, or counting the ${v.residenceRightMonths.value} months after a card expires`,
            ['PD-145', 'PD-147'],
          ) +
          (breach
            ? L(
                `按已录入的出境，${breach} 离开葡萄牙满 ${single} 个月，之后递交的，这次出境会打断连续居留（art. 126 n.º 4）。`,
                ` With the trips you entered, you will have been away ${single} months on ${breach}; after that, this absence breaks continuous residence for an application (art. 126 n.º 4).`,
              )
            : ''),
        checks: [
          {
            text: L(
              `递交前 ${years} 年一直持临时居留、黄金签证或永久居留许可（学习、无薪实习、志愿期间按一半计），递交当天不是学习类许可`,
              `Temporary residence, golden visa or permanent residence throughout the ${years} years before applying (study, unpaid traineeship or volunteering at half), and not a study permit on the application day`,
            ),
            met: f.sure ? true : f.maybe ? undefined : false,
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
              `自 ${f.shown.start} 起每次出境都短于 ${v.longTermSingleAbsenceMonths.value} 个月`,
              `Every absence since ${f.shown.start} shorter than ${v.longTermSingleAbsenceMonths.value} months`,
            ),
            met: f.shown.long.length === 0,
            sources: v.longTermSingleAbsenceMonths.sources,
          },
          {
            text: L(
              `自 ${f.shown.start} 起出境合计 ${f.shown.absent} 天（不超过 ${v.longTermTotalAbsenceMonths.value} 个月，即 ${totalMin}–${totalMax} 天以内）`,
              `${f.shown.absent} days abroad since ${f.shown.start} (${v.longTermTotalAbsenceMonths.value} months at most, ${totalMin}–${totalMax} days)`,
            ),
            met:
              f.shown.absent <= totalMin
                ? true
                : f.shown.absent > totalMax
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
            `学习等期间按一半计，按半天精确折算（art. 126 n.º 3，PD-147）；折半使计入期间超过 ${years} 年时，出境上限按整段期间检查。合法居民指持居留证件的人（art. 3 n.º 1 v），居留签证期间不计；许可之间有空档即中断，卡到期后 ${v.residenceRightMonths.value} 个月内的期间不作为满足条件的依据（PD-145）。`,
            `Study and similar time counts at half, worked out in half days (art. 126 n.º 3, PD-147); when that makes the counted period longer than ${years} years, the absence limits are checked over all of it. A legal resident holds a residence title (art. 3 n.º 1 v), so time on a residence visa does not count; any gap between permits breaks continuity, and the ${v.residenceRightMonths.value} months after a card expires are not relied on (PD-145).`,
          ),
          projection,
        ],
        pendingDetails: ['PD-142', 'PD-145', 'PD-147'],
      });
    }
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
    if (eu) {
      pathways.push(notForEu('PT-GOLDEN-VISA', title));
    } else if (!current || !current.to) {
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
      const inPortugal = (from: IsoDate, to: IsoDate) =>
        from > to
          ? 0
          : daysBetween(from, to) + 1 - days.total(awaySums, from, to);
      // Minimum stays from the grant: the first year, then each later period
      // (2 years in the regulation, each year on AIMA's page) that starts
      // before the card expires.
      // Days up to the simulation date are counted as spent; a period not
      // yet met gets the day it would be, staying on after that (PD-148).
      const firstYears = v.goldenVisaFirstPeriodYears.value;
      const reading = (step: number) => {
        const periods = [
          {
            from: granted,
            to: addDays(afterYears(granted, firstYears), -1),
            need: v.goldenVisaFirstPeriodDays.value,
          },
        ];
        // A period starting on the expiry day belongs to the next card.
        for (let n = firstYears; afterYears(granted, n) < expiry; n += step)
          periods.push({
            from: afterYears(granted, n),
            to: addDays(afterYears(granted, n + step), -1),
            need: v.goldenVisaLaterPeriodDays.value,
          });
        type Stay = (typeof periods)[number] & { stayed: number };
        let short: Stay | undefined;
        let pending: (Stay & { date: IsoDate }) | undefined;
        for (const p of periods) {
          const stayed = inPortugal(p.from, earlier(p.to, sim));
          if (stayed >= p.need) continue;
          let date: IsoDate | undefined;
          const last = days.index(p.to);
          for (
            let i = Math.max(days.index(p.from), days.index(sim) + 1);
            i <= last && !date;
            i++
          )
            if (inPortugal(p.from, days.date(i)) >= p.need) date = days.date(i);
          if (!date) {
            if (!short) short = { ...p, stayed: inPortugal(p.from, p.to) };
          } else if (!pending || date > pending.date)
            pending = { ...p, stayed, date };
        }
        return {
          short,
          pending,
          // When the stays are all met, staying on after the simulation date.
          date: short ? undefined : later(opens, pending?.date ?? sim),
        };
      };
      const law = reading(v.goldenVisaLaterPeriodYears.value);
      // AIMA's page asks for 14 days in each later year.
      const aima = reading(1);
      // Both readings fall short by the renewal deadline: not met.
      const late = !!law.date && law.date > deadline;
      const status: PilotStatus =
        law.short || sim > deadline || late
          ? 'NOT_MET'
          : aima.date && aima.date <= deadline
            ? aima.date === sim
              ? 'MET'
              : law.date === sim
                ? 'UNKNOWN'
                : 'FUTURE'
            : 'UNKNOWN';
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
      const pendingText = (p: {
        from: IsoDate;
        to: IsoDate;
        stayed: number;
        need: number;
        date: IsoDate;
      }) =>
        L(
          `${p.from} 至 ${p.to} 截至模拟日在葡萄牙 ${p.stayed} 天，还差 ${p.need - p.stayed} 天，按之后一直在葡萄牙推算 ${p.date} 达到`,
          `${p.stayed} days in Portugal from ${p.from} up to the simulation date, ${p.need - p.stayed} short of ${p.need} for the period to ${p.to}; staying on, you reach it on ${p.date}`,
        );
      const aimaNote = (text: string) =>
        L(
          `按 AIMA 页面"此后每年 ${v.goldenVisaLaterPeriodDays.value} 天"的写法，${text}（PD-148）。`,
          ` On AIMA's page, which asks for ${v.goldenVisaLaterPeriodDays.value} days in each later year, ${text} (PD-148).`,
        );
      pathways.push({
        id: 'PT-GOLDEN-VISA',
        title,
        status,
        earliestDate:
          status === 'FUTURE' ? aima.date : status === 'MET' ? sim : undefined,
        summary:
          (sim > deadline
            ? L(
                `许可到期日是 ${expiry}，须在到期前 ${v.renewalDeadlineDays.value} 天（${deadline}）前申请续期，这一期限已过；逾期递交的后果不在试点范围。`,
                `The permit expires on ${expiry} and renewal had to be applied for by ${deadline}, ${v.renewalDeadlineDays.value} days before; that has passed, and what happens to a late application is out of scope.`,
              )
            : L(
                `续期申请在 ${opens} 至 ${deadline} 之间递交（到期日 ${expiry}），续期后每次 ${v.goldenVisaRenewalYears.value} 年。`,
                `Apply to renew from ${opens} to ${deadline} (the permit expires on ${expiry}); each renewal lasts ${v.goldenVisaRenewalYears.value} years.`,
              )) +
          (law.short
            ? L(
                `最低停留不足：${shortText(law.short)}，续期可能被拒。`,
                ` Minimum stay not met: ${shortText(law.short)}, so renewal may be refused.`,
              )
            : (law.pending
                ? L(
                    `最低停留尚未满足：${pendingText(law.pending)}${late ? `，晚于续期期限 ${deadline}，续期可能被拒` : ''}。`,
                    ` Minimum stay not yet met: ${pendingText(law.pending)}${late ? `, after the renewal deadline of ${deadline}, so renewal may be refused` : ''}.`,
                  )
                : '') +
              (aima.short
                ? aimaNote(shortText(aima.short))
                : aima.pending && !law.pending
                  ? aimaNote(pendingText(aima.pending))
                  : '')) +
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
            met: sim >= opens && sim <= deadline,
            sources: [
              ...v.renewalDeadlineDays.sources,
              ...v.renewalWindowDays.sources,
              ...v.goldenVisaRenewalYears.sources,
            ],
          },
          {
            text: L(
              `最低停留：第 1 年在葡萄牙至少 ${v.goldenVisaFirstPeriodDays.value} 天，此后每 ${v.goldenVisaLaterPeriodYears.value} 年至少 ${v.goldenVisaLaterPeriodDays.value} 天（连续或分段，截至模拟日）`,
              `Minimum stays: at least ${v.goldenVisaFirstPeriodDays.value} days in Portugal in the first year, then ${v.goldenVisaLaterPeriodDays.value} days in each ${v.goldenVisaLaterPeriodYears.value}-year period (in one go or not, up to the simulation date)`,
            ),
            met:
              !aima.short && !aima.pending
                ? true
                : law.short || law.pending
                  ? false
                  : undefined,
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
            '授予日按第一张黄金签证卡的生效日；第 1 年和之后各期从授予日起按日历计，截至模拟日只算实际停留，未满的期间按之后一直在葡萄牙推算达到的日期；出入境当天按在葡萄牙计。条例的期间划分沿用首张 1 年的旧制，与现行首张期限怎么对应没写；条例写法满足、AIMA 写法不满足的输出待确认（PD-148）。',
            'The grant date is taken as the start of your first golden visa card; the first year and the later periods run from it by the calendar. Only days up to the simulation date count as spent, and a period not yet met gets the date it would be met if you stay on; departure and return days count as days in Portugal. The regulation’s periods follow the old one-year first card, and how they fit the current first card is not stated; met under the regulation but not on AIMA’s page is shown as uncertain (PD-148).',
          ),
          L(
            `到期前 ${v.renewalDeadlineDays.value} 天是法律期限（art. 78 n.º 1）；最早到期前 ${v.renewalWindowDays.value} 天来自条例的编纂版，公报原文未存档（PD-149）。`,
            `${v.renewalDeadlineDays.value} days before expiry is the legal deadline (art. 78 n.º 1); the earliest date, ${v.renewalWindowDays.value} days before, comes from a consolidated text of the regulation, as the official gazette text is not archived (PD-149).`,
          ),
          projection,
        ],
        pendingDetails: ['PD-148', 'PD-149'],
      });
    }
  }

  return { policyAsOf: pt.asOf, pathways };
}
