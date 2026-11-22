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
}

export type JpPrRequest =
  | {
      route: Exclude<JpPrRoute, 'spouse' | 'child'>;
      /**
       * general: first day on a work or residence status; teijusha: first
       * day as 定住者; refugee: recognition date; hsp: first day with the
       * points, kept since.
       */
      statusStart: IsoDate;
    }
  /** Spouse of a Japanese national or permanent resident: married life from. */
  | { route: 'spouse'; marriedOn: IsoDate }
  | { route: 'child' };

export type JpNaturalisationRequest =
  | { route: 'general'; dateOfBirth: IsoDate }
  /** Spouse of a Japanese national: the wedding day. */
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

/** A period that must have passed: `years` from `from`. */
interface Need {
  from: IsoDate;
  years: number;
  /** A stay in Japan, rather than a marriage. */
  stay: boolean;
  text: string;
  sources: SourceRef[];
}

export function evaluateJapan(req: JpRequest): JpResult {
  const L = textFor(req);
  const sim = req.simulationDate;
  const horizon = daysBetween(sim, addYears(sim, HORIZON_YEARS));
  const switchDate = v.newGuidelineFrom.value;
  const lastOld = addDays(switchDate, -1);
  const guideline = (d: IsoDate): Guideline => (d < switchDate ? 'old' : 'new');
  const passed = (d: IsoDate, n: Need) => d >= afterYears(n.from, n.years);

  // Leaving without a regular permit and staying out past the deemed
  // permit's year ends the status (art. 26-2(2)); the stay starts again on
  // return (PD-136).
  const lapsed = req.trips
    .filter(
      (t) =>
        !t.reentryPermit &&
        t.returned > addYears(t.departed, v.deemedReentryYears.value),
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
  /**
   * Trips under way on any day of [from, to], travel days included; a lapse
   * is left out, since the stay counted starts on its return.
   */
  const tripsTouching = (from: IsoDate, to: IsoDate) =>
    req.trips.filter(
      (t) => !lapsed.includes(t) && t.departed <= to && t.returned >= from,
    );
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
    L(
      `${t.departed} 至 ${t.returned} 的出境没有再入国许可、超过みなし再入国许可的 ${v.deemedReentryYears.value} 年期限，在留资格消灭，连续在留从 ${t.returned} 重新起算。`,
      ` The trip from ${t.departed} to ${t.returned} had no re-entry permit and went past the ${v.deemedReentryYears.value}-year deemed permit, so the status ended and the unbroken stay starts again on ${t.returned}.`,
    ),
  );
  const projection = L(
    '最早日期假设模拟日之后一直在日本（已录入的未来出境除外），在留资格按时更新，婚姻等身份持续。',
    'Projected dates assume you stay in Japan after the simulation date (apart from trips you entered), renew your status on time and stay married where that counts.',
  );
  const anniversary = L(
    '年限按周年计：起算日 N 年后的同一天起算满足（2 月 29 日起算的取 3 月 1 日）；按民法初日不算入的严格读法可能晚一天，审查实际怎么数没有公开（PD-130）。',
    'Years run to the anniversary: N years after the start date counts as met (from 29 February, 1 March). On the strict Civil Code reading, which leaves out the first day, it could be a day later; how the authorities count is not published (PD-130).',
  );
  const reentry = L(
    `出境没有勾选"持再入国许可"的，按みなし再入国许可：须在出国日 ${v.deemedReentryYears.value} 年后的同一天之前返回，超过即在留资格消灭、连续在留从返回日重新起算；假设这期间在留期限没有先到期（みなし许可不超过在留期限），勾选的按在许可有效期内返回计（PD-136）。`,
    `A trip without "re-entry permit" ticked uses the deemed permit: you must be back by the same date ${v.deemedReentryYears.value} year after leaving, or the status ends and the unbroken stay starts again when you return. This assumes your period of stay did not end first (the deemed permit never runs past it); a ticked trip is taken as returning while the permit was valid (PD-136).`,
  );
  const pathways: JpPathway[] = [];

  // ---------- Permanent residence (art. 22, guidelines) ----------
  {
    const pr = req.pr;
    const special = pr.route !== 'general';
    const needs = (d: IsoDate): Need[] => {
      const g = guideline(d);
      const stay = stayFrom(d);
      const stayNeed = (years: number, sources: SourceRef[]): Need => ({
        from: stay,
        years,
        stay: true,
        text: L(
          `自 ${stay} 起在日本连续在留满 ${years} 年`,
          `${years} year${years === 1 ? '' : 's'} of unbroken stay in Japan since ${stay}`,
        ),
        sources,
      });
      switch (pr.route) {
        case 'general': {
          const from = since(d, pr.statusStart);
          const years = v.prStatusYears.value;
          return [
            stayNeed(v.prStayYears.value, v.prStayYears.sources),
            {
              from,
              years,
              stay: true,
              text: L(
                `其中自 ${from} 起以就労资格或居住资格连续在留满 ${years} 年`,
                `Of that, ${years} years in a row on a work or residence status since ${from}`,
              ),
              sources: v.prStatusYears.sources,
            },
          ];
        }
        case 'spouse': {
          const years = v.spouseMarriageYears.value[g];
          return [
            {
              from: pr.marriedOn,
              years,
              stay: false,
              text: L(
                `自 ${pr.marriedOn} 起实际婚姻生活满 ${years} 年`,
                `${years} years of married life since ${pr.marriedOn}`,
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
            from,
            years,
            stay: true,
            text: L(
              `自 ${from} 起${zh}满 ${years} 年`,
              `${years} year${years === 1 ? '' : 's'} ${en} since ${from}`,
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
    const oldTrips = (d: IsoDate) =>
      tripsTouching(addYears(d, -stayYears(d)), addDays(d, -1));
    const [totalMin, totalMax] = monthSpan(v.totalAbsenceMonths.value);
    const absences = (d: IsoDate) => {
      const from = addYears(d, -v.absenceWindowYears.value);
      const to = addDays(d, -1);
      return {
        long: tripsIn(from, to).filter(
          (t) =>
            t.returned > addMonths(t.departed, v.singleAbsenceMonths.value),
        ),
        days: daysAbroad(from, to),
      };
    };
    const verdict = (d: IsoDate): Verdict => {
      if (!needs(d).every((n) => passed(d, n))) return 'no';
      if (guideline(d) === 'old') return oldTrips(d).length ? 'maybe' : 'yes';
      const a = absences(d);
      return a.long.length || a.days >= totalMin ? 'maybe' : 'yes';
    };
    const earliest = firstDate((d) => verdict(d) === 'yes');
    const possible = firstDate((d) => verdict(d) !== 'no');
    const status = statusOf(earliest, possible);
    const years = v.absenceWindowYears.value;
    const months = v.singleAbsenceMonths.value;
    const total = v.totalAbsenceMonths.value;
    const applies = special
      ? L(
          '这一出境标准写在一般路径下，是否也适用于本特例没有写明（PD-133）。',
          ' The guideline sets this test under the general route; whether it also applies here is not stated (PD-133).',
        )
      : '';
    /** Why the date `d` is uncertain. */
    const reason = (d: IsoDate) => {
      if (guideline(d) === 'old')
        return L(
          `但前 ${stayYears(d)} 年里有 ${oldTrips(d).length} 次出境，${lastOld} 前递交适用的指南没有出境天数标准（PD-132）。`,
          ` but you have ${count(oldTrips(d).length, 'trip')} abroad in the ${count(stayYears(d), 'year')} before it, and the guideline for applications up to ${lastOld} sets no limit on absences (PD-132).`,
        );
      const a = absences(d);
      return (
        L(
          `但前 ${years} 年里${a.long.length ? `有 ${a.long.length} 次单次 ${months} 个月以上的出境、` : ''}出境合计 ${a.days} 天；${switchDate} 起的指南对无合理理由单次出境 ${months} 个月以上或合计 ${total} 个月以上的原则上消极评价，是否有合理理由个案判断（PD-131）。`,
          ` but in the ${years} years before it you have ${a.long.length ? `${count(a.long.length, 'trip')} of ${months} months or more and ` : ''}${a.days} days abroad in all; from ${switchDate} the guideline counts against you, unless there is a reasonable reason, one absence of ${months} months or more or ${total} months in total (PD-131).`,
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
            `${shown} 按 ${lastOld} 前递交适用的 2026-02-24 版指南计算；${switchDate} 起递交适用 2026-10-01 版${repeated ? '' : newDate ? `，最早 ${newDate}` : '，10 年内达不到'}。`,
            ` ${shown} follows the 2026-02-24 guideline, which covers applications up to ${lastOld}; from ${switchDate} the 2026-10-01 guideline applies${repeated ? '' : newDate ? `, with ${newDate} the earliest date` : ', which you will not meet within 10 years'}.`,
          )
        : '';
    const g = guideline(sim);
    const a = absences(sim);
    const absenceChecks: PilotCheck[] =
      g === 'old'
        ? [
            {
              text: oldTrips(sim).length
                ? L(
                    `前 ${stayYears(sim)} 年有 ${oldTrips(sim).length} 次出境；${lastOld} 前递交适用的指南没有出境天数标准`,
                    `${count(oldTrips(sim).length, 'trip')} abroad in the past ${count(stayYears(sim), 'year')}; the guideline for applications up to ${lastOld} sets no limit on absences`,
                  )
                : L(
                    `前 ${stayYears(sim)} 年没有出境`,
                    `No trips abroad in the past ${count(stayYears(sim), 'year')}`,
                  ),
              met: oldTrips(sim).length ? undefined : true,
              sources: [{ srcId: 'SRC-113', locator: '1(3)ア, 2' }],
            },
          ]
        : [
            {
              text: L(
                `前 ${years} 年没有单次 ${months} 个月以上的出境`,
                `No absence of ${months} months or more in the past ${years} years`,
              ),
              met: a.long.length ? (special ? undefined : false) : true,
              sources: v.singleAbsenceMonths.sources,
            },
            {
              text: L(
                `前 ${years} 年出境合计 ${a.days} 天（合计达到 ${total} 个月，即 ${totalMin}–${totalMax} 天的，原则上消极评价）`,
                `${a.days} days abroad in the past ${years} years (${total} months in total, ${totalMin}–${totalMax} days, counts against you)`,
              ),
              met:
                a.days < totalMin
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
            )
          : status === 'FUTURE'
            ? L(
                `满足永住许可时间条件的最早递交日是 ${earliest}。`,
                `The earliest application date that meets the time requirements for permanent residence is ${earliest}.`,
              )
            : status === 'UNKNOWN'
              ? L(
                  `按年限计算的候选递交日是 ${possible}，`,
                  `Counting years alone, the candidate application date is ${possible},`,
                ) +
                reason(possible!) +
                (earliest
                  ? L(
                      `不受这一点影响的最早递交日是 ${earliest}。`,
                      ` The earliest date without this doubt is ${earliest}.`,
                    )
                  : '')
              : L(
                  '按现有记录，10 年内达不到永住许可的时间条件。',
                  'With your record you will not meet the time requirements for permanent residence within 10 years.',
                )) +
        version +
        lapseNotes.join(''),
      checks: [
        ...needs(sim).map((n) => ({
          text: n.text,
          met: passed(sim, n),
          sources: n.sources,
        })),
        ...absenceChecks,
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
          `按递交日选指南：${lastOld} 前递交适用 2026-02-24 版，${switchDate} 起适用 2026-10-01 版（配偶者婚姻 ${v.spouseMarriageYears.value.old} 年改 ${v.spouseMarriageYears.value.new} 年、在留 ${v.spouseStayYears.value.old} 年改 ${v.spouseStayYears.value.new} 年，实子等 ${v.childStayYears.value.old} 年改 ${v.childStayYears.value.new} 年，并新增出境标准）。旧版没有出境天数标准，期间内有出境的待确认（PD-132）。`,
          `The guideline depends on the application date: up to ${lastOld} the 2026-02-24 version, from ${switchDate} the 2026-10-01 version (spouses ${v.spouseMarriageYears.value.old} → ${v.spouseMarriageYears.value.new} years of marriage and ${v.spouseStayYears.value.old} → ${v.spouseStayYears.value.new} years of stay, children ${v.childStayYears.value.old} → ${v.childStayYears.value.new} years, and a new test for absences). The old version sets no limit on absences, so trips in the period leave the date uncertain (PD-132).`,
        ),
        L(
          `新版出境标准看递交日前 ${years} 年：单次出境按离境日起 ${months} 个日历月判断（回来日期晚于 ${months} 个月后的同一天即算）；合计按整天在境外的天数，少于 ${totalMin} 天算未达到 ${total} 个月，${totalMax} 天及以上算达到；出入境当天按在日本计。达到的原则上消极评价，有合理理由的个案判断，结果待确认（PD-131）。`,
          `The new absence test looks at the ${years} years before applying: a single absence is measured as ${months} calendar months from the day you left (back after the same date ${months} months later counts); the total is in whole days abroad, under ${totalMin} days is short of ${total} months and ${totalMax} days or more reaches it; departure and return days count as days in Japan. Reaching it counts against you unless there is a reasonable reason, decided case by case, so the result is uncertain (PD-131).`,
        ),
        anniversary,
        reentry,
        ...(pr.route === 'general'
          ? [
              L(
                `就労资格或居住资格的范围由你自行确认：${switchDate} 起递交的，就労资格不含技能実習、育成就労、特定技能1号、企業内転勤与部分特定活動（PD-134）。`,
                `Check yourself that your status counts as a work or residence status: for applications from ${switchDate} work statuses exclude Technical Intern Training, Employment for Skill Development, Specified Skilled Worker (i), Intra-company Transferee and some Designated Activities (PD-134).`,
              ),
            ]
          : []),
        ...(pr.route === 'spouse'
          ? [
              L(
                '婚姻生活从你填写的日期起算；指南写的是"实体婚姻生活"，以登记日还是同居日起算没有写明（PD-135）。',
                'Married life runs from the date you entered; the guideline says "married life in substance" and does not say whether it starts at registration or when you began living together (PD-135).',
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
    const legal = (d: IsoDate) => {
      const stay = stayFrom(d);
      return nat.route === 'general'
        ? d >= afterYears(stay, v.naturalisationYears.value) &&
            d >= afterYears(nat.dateOfBirth, v.naturalisationAge.value)
        : d >= afterYears(stay, v.spouseNaturalisationYears.value) ||
            married(d);
    };
    const practice = (d: IsoDate) =>
      d >= afterYears(stayFrom(d), practiceYears);
    /** Years before `d` in which trips leave continuity uncertain. */
    const windowYears = (d: IsoDate) =>
      nat.route === 'general'
        ? practiceYears
        : married(d)
          ? v.spouseNaturalisationDomicileYears.value
          : v.spouseNaturalisationYears.value;
    const trips = (d: IsoDate) =>
      tripsTouching(addYears(d, -windowYears(d)), addDays(d, -1));
    const verdict = (d: IsoDate): Verdict => {
      if (!legal(d) || (nat.route === 'general' && !practice(d))) return 'no';
      return !practice(d) || trips(d).length ? 'maybe' : 'yes';
    };
    const earliest = firstDate((d) => verdict(d) === 'yes');
    const possible = firstDate((d) => verdict(d) !== 'no');
    const status = statusOf(earliest, possible);
    const legalDate = firstDate(legal);
    const practiceDate = firstDate((d) => legal(d) && practice(d));
    const stay = stayFrom(sim);
    const tripNote = (d: IsoDate) => {
      const found = trips(d);
      const days = daysAbroad(addYears(d, -windowYears(d)), addDays(d, -1));
      return found.length
        ? L(
            `这 ${windowYears(d)} 年里有 ${found.length} 次出境、合计 ${days} 天；法律与官方说明都没有"引き続き"允许多少出境的标准（PD-138）。`,
            ` In those ${count(windowYears(d), 'year')} you have ${count(found.length, 'trip')} abroad, ${days} days in all; neither the law nor official guidance says how much absence "continuous" allows (PD-138).`,
          )
        : '';
    };
    const main =
      status === 'MET'
        ? L(
            '模拟日已满足帰化的时间条件。',
            'You meet the time requirements for naturalisation on the simulation date.',
          )
        : status === 'FUTURE'
          ? L(
              `满足帰化时间条件的最早递交日是 ${earliest}。`,
              `The earliest application date that meets the time requirements for naturalisation is ${earliest}.`,
            )
          : status === 'UNKNOWN'
            ? L(
                `按年限计算的候选递交日是 ${possible}。`,
                `Counting years alone, the candidate application date is ${possible}.`,
              ) +
              (practice(possible!)
                ? ''
                : L(
                    `${practiceFrom} 起法务省在帰化审查中原则要求在留 ${practiceYears} 年以上，是否也适用于日本人配偶者没有说明；若适用，${practiceDate ? `最早 ${practiceDate}` : '10 年内达不到'}（PD-137）。`,
                    ` From ${practiceFrom} the Ministry of Justice in principle requires ${practiceYears} years of stay in its review; whether this also applies to spouses of Japanese nationals is not stated, and if it does, ${practiceDate ? `the earliest date is ${practiceDate}` : 'you will not meet it within 10 years'} (PD-137).`,
                  )) +
              tripNote(possible!)
            : L(
                '按现有记录，10 年内达不到帰化的时间条件。',
                'With your record you will not meet the time requirements for naturalisation within 10 years.',
              );
    const lawOnly =
      nat.route === 'general' &&
      legalDate &&
      (!possible || legalDate < possible)
        ? L(
            `国籍法本身只要求住所 ${v.naturalisationYears.value} 年、年满 ${v.naturalisationAge.value} 岁，${legalDate === sim ? '模拟日已满足' : `最早 ${legalDate}`}；${practiceFrom} 起法务省在审查中原则要求在留 ${practiceYears} 年以上，例外个案判断（PD-137）。`,
            ` The Nationality Act itself asks only for ${v.naturalisationYears.value} years of domicile and age ${v.naturalisationAge.value}, ${legalDate === sim ? 'which you meet on the simulation date' : `met from ${legalDate}`}; from ${practiceFrom} the Ministry of Justice in principle requires ${practiceYears} years of stay in its review, with exceptions decided case by case (PD-137).`,
          )
        : '';
    const checks: PilotCheck[] =
      nat.route === 'general'
        ? [
            {
              text: L(
                `自 ${stay} 起在日本连续有住所满 ${v.naturalisationYears.value} 年`,
                `${v.naturalisationYears.value} years of continuous domicile in Japan since ${stay}`,
              ),
              met: sim >= afterYears(stay, v.naturalisationYears.value),
              sources: v.naturalisationYears.sources,
            },
            {
              text: L(
                `年满 ${v.naturalisationAge.value} 岁（${afterYears(nat.dateOfBirth, v.naturalisationAge.value)} 起）`,
                `Aged ${v.naturalisationAge.value} or over (from ${afterYears(nat.dateOfBirth, v.naturalisationAge.value)})`,
              ),
              met:
                sim >= afterYears(nat.dateOfBirth, v.naturalisationAge.value),
              sources: v.naturalisationAge.sources,
            },
            {
              text: L(
                `按 ${practiceFrom} 起的审查运用，自 ${stay} 起原则在留满 ${practiceYears} 年`,
                `Under the review practice from ${practiceFrom}, in principle ${practiceYears} years of stay since ${stay}`,
              ),
              met: practice(sim),
              sources: [
                ...v.naturalisationPracticeYears.sources,
                ...v.naturalisationPracticeFrom.sources,
              ],
            },
          ]
        : [
            {
              text: L(
                `国籍法第 7 条：自 ${stay} 起在日本连续有住所或居所满 ${v.spouseNaturalisationYears.value} 年；或结婚（${nat.marriedOn}）满 ${v.spouseNaturalisationMarriageYears.value} 年且连续有住所满 ${v.spouseNaturalisationDomicileYears.value} 年`,
                `Nationality Act art. 7: ${v.spouseNaturalisationYears.value} years of continuous domicile or residence in Japan since ${stay}, or ${v.spouseNaturalisationMarriageYears.value} years since the wedding (${nat.marriedOn}) with ${v.spouseNaturalisationDomicileYears.value} year of continuous domicile`,
              ),
              met: legal(sim),
              sources: v.spouseNaturalisationYears.sources,
            },
            {
              text: L(
                `若 ${practiceFrom} 起的审查运用也适用于配偶者：自 ${stay} 起在留满 ${practiceYears} 年`,
                `If the review practice from ${practiceFrom} also applies to spouses: ${practiceYears} years of stay since ${stay}`,
              ),
              met: practice(sim) ? true : undefined,
              sources: [
                ...v.naturalisationPracticeYears.sources,
                ...v.naturalisationPracticeFrom.sources,
              ],
            },
          ];

    pathways.push({
      id: 'JP-NATURALISATION',
      title: L('帰化（入籍）', 'Naturalisation (帰化)'),
      status,
      earliestDate: status === 'UNKNOWN' ? undefined : earliest,
      summary: main + lawOnly + lapseNotes.join(''),
      checks,
      notChecked: [
        L(
          '素行、生计、放弃原国籍（重国籍防止）、宪法遵守（国籍法第5条第1項第3–6号），日语能力与"融入日本社会"的其他事项，以及 2026-04 起延长的纳税与社保缴纳审查期间',
          'Conduct, livelihood, giving up your current nationality, respect for the Constitution (art. 5(1)(iii)–(vi)), Japanese language and the other parts of "integration into Japanese society", and the longer review of tax and social insurance payments from 2026-04',
        ),
        L(
          '第 6、8 条的其他简易情形（如在日本出生、日本国民之子），以及 2026-04-01 前已递交的申请是否适用新运用',
          'The other simplified cases in art. 6 and 8 (such as being born in Japan or a child of a Japanese national), and whether applications made before 2026-04-01 follow the new practice',
        ),
      ],
      assumptions: [
        L(
          '住所与在留都从你填写的本次在留开始日起算，不区分住所与居所；住所须合法，即一直持有在留资格（PD-139）。',
          'Domicile and stay both run from the start of your current stay as entered, without telling domicile from residence; domicile must be lawful, that is on a valid status throughout (PD-139).',
        ),
        L(
          `法律与官方说明都没有出境天数标准，计入的年限内有出境的待确认（${nat.route === 'general' ? `前 ${practiceYears} 年` : `前 ${v.spouseNaturalisationYears.value} 年，结婚满 ${v.spouseNaturalisationMarriageYears.value} 年后为前 ${v.spouseNaturalisationDomicileYears.value} 年`}，PD-138）。`,
          `There is no limit on absences in the law or official guidance, so trips in the counted years leave the date uncertain (${nat.route === 'general' ? `the past ${practiceYears} years` : `the past ${v.spouseNaturalisationYears.value} years, or the past ${v.spouseNaturalisationDomicileYears.value} year once ${v.spouseNaturalisationMarriageYears.value} years married`}, PD-138).`,
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
