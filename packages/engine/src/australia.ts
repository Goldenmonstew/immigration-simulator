import { australia2026_11 as au } from '@uk-immigration/policy-data';
import type { SourceRef } from '@uk-immigration/policy-data';
import { addDays, addMonths, addYears, daysBetween } from './dates';
import { textFor } from './rule';
import type { IsoDate, Locale } from './types';

// Australia pilot (phase 17): dates the Migration Regulations and the
// Citizenship Act fix by time alone. Points-tested entry visas are out of scope.

export const AU_PERMANENT_SUBCLASSES = [
  '189',
  '190',
  '191',
  '186',
  '801',
  '100',
  '155',
  'other-permanent',
] as const;
export const AU_TEMPORARY_SUBCLASSES = [
  '491',
  '494',
  '482',
  '457',
  '820',
  '309',
  'bridging',
  'other-temporary',
] as const;

export type AuSubclass =
  | (typeof AU_PERMANENT_SUBCLASSES)[number]
  | (typeof AU_TEMPORARY_SUBCLASSES)[number];

export interface AuVisa {
  subclass: AuSubclass;
  /** First day in effect. */
  from: IsoDate;
  /** Last day in effect; absent = still in effect. */
  to?: IsoDate;
}

/** Left Australia on `departed`, came back on `returned`. */
export interface AuTrip {
  departed: IsoDate;
  returned: IsoDate;
}

export interface AuRequest {
  simulationDate: IsoDate;
  dateOfBirth: IsoDate;
  /** First arrival in Australia. */
  firstArrival: IsoDate;
  visas: AuVisa[];
  trips: AuTrip[];
  /**
   * 186 TRT: worked full time in Australia for an approved sponsor, in the
   * visa's occupation, throughout every 457/482 period (no unpaid leave).
   */
  sponsoredFullTime?: boolean;
  /** Combined 820/801 (onshore) or 309/100 (offshore) partner application. */
  partnerApplication?: {
    lodged: IsoDate;
    stream: 'onshore' | 'offshore';
    /** Long-term partner relationship (reg 1.03) when the application was made. */
    longTermRelationship: boolean;
  };
  locale?: Locale;
}

export type AuPathwayId =
  'AU-191' | 'AU-186-TRT' | 'AU-PARTNER' | 'AU-RRV' | 'AU-CITIZENSHIP';

export type AuStatus =
  'MET' | 'FUTURE' | 'NOT_MET' | 'UNKNOWN' | 'NOT_APPLICABLE';

/** One requirement checked on the simulation date. */
export interface AuCheck {
  text: string;
  met: boolean;
  sources: SourceRef[];
}

export interface AuPathway {
  id: AuPathwayId;
  title: string;
  status: AuStatus;
  /** MET: the simulation date; FUTURE: the first later date all checks pass. */
  earliestDate?: IsoDate;
  summary: string;
  checks: AuCheck[];
  /** Requirements this pilot does not check. */
  notChecked: string[];
  assumptions: string[];
  pendingDetails?: string[];
}

export interface AuResult {
  policyAsOf: IsoDate;
  pathways: AuPathway[];
  /** Applies to every projected date. */
  assumptions: string[];
}

const v = au.values;
// Engine search limit for projected dates, not a policy number.
const HORIZON_YEARS = 10;
const PERMANENT = new Set<AuSubclass>(AU_PERMANENT_SUBCLASSES);
const TRT_VISAS = new Set<AuSubclass>(['457', '482']);

/** Daily flags from `start` with prefix sums, for window counts. */
class Days {
  readonly count: number;
  constructor(
    readonly start: IsoDate,
    end: IsoDate,
  ) {
    this.count = daysBetween(start, end) + 1;
  }
  index(d: IsoDate): number {
    return daysBetween(this.start, d);
  }
  date(i: number): IsoDate {
    return addDays(this.start, i);
  }
  /** Prefix sums of `flag` over every day. */
  sums(flag: (i: number) => boolean): number[] {
    const sums = [0];
    for (let i = 0; i < this.count; i++) sums.push(sums[i] + (flag(i) ? 1 : 0));
    return sums;
  }
  /** Days flagged in [from, to], both inclusive. */
  total(sums: number[], from: IsoDate, to: IsoDate): number {
    const a = Math.max(0, this.index(from));
    const b = Math.min(this.count - 1, this.index(to));
    return a > b ? 0 : sums[b + 1] - sums[a];
  }
  /** Flag each day of [from, to] (to absent = to the end). */
  mark(flags: boolean[], from: IsoDate, to?: IsoDate): void {
    const a = Math.max(0, this.index(from));
    const b = Math.min(this.count - 1, to ? this.index(to) : this.count - 1);
    for (let i = a; i <= b; i++) flags[i] = true;
  }
}

export function evaluateAustralia(req: AuRequest): AuResult {
  const L = textFor(req);
  const sim = req.simulationDate;
  const days = new Days(
    addYears(sim, -v.rrvWindowYears.value),
    addYears(sim, HORIZON_YEARS),
  );
  const flags = () => new Array<boolean>(days.count).fill(false);

  const permanent = flags();
  const visa = flags();
  const trtVisa = flags();
  const visas = [...req.visas].sort((a, b) => (a.from < b.from ? -1 : 1));
  visas.forEach((x, n) => {
    days.mark(visa, x.from, x.to);
    if (PERMANENT.has(x.subclass)) days.mark(permanent, x.from, x.to);
    // 186.226(1)(d): a bridging visa counts after a 457/482 substantive visa.
    const previous = visas
      .slice(0, n)
      .filter((p) => p.subclass !== 'bridging')
      .at(-1);
    if (
      TRT_VISAS.has(x.subclass) ||
      (x.subclass === 'bridging' &&
        previous &&
        TRT_VISAS.has(previous.subclass))
    )
      days.mark(trtVisa, x.from, x.to);
  });
  // Departure and return days count as days in Australia for the RRV
  // (SRC-066); citizenship counts the departure day as absent (PD-084).
  const away = flags();
  const awayCitizenship = flags();
  for (const t of req.trips) {
    if (t.returned > t.departed) {
      days.mark(awayCitizenship, t.departed, addDays(t.returned, -1));
      if (daysBetween(t.departed, t.returned) > 1)
        days.mark(away, addDays(t.departed, 1), addDays(t.returned, -1));
    }
  }
  const arrived = (i: number) => days.date(i) >= req.firstArrival;
  const sums = {
    permanentPresent: days.sums((i) => permanent[i] && arrived(i) && !away[i]),
    unlawful: days.sums((i) => arrived(i) && !away[i] && !visa[i]),
    notPermanent: days.sums((i) => !permanent[i]),
    absent: days.sums((i) => awayCitizenship[i]),
    trt: days.sums((i) => trtVisa[i]),
  };

  /** First date from the simulation date on which `ok` holds. */
  const firstDate = (ok: (d: IsoDate) => boolean): IsoDate | undefined => {
    for (let i = days.index(sim); i < days.count; i++) {
      const d = days.date(i);
      if (ok(d)) return d;
    }
    return undefined;
  };

  const projection = L(
    '最早日期假设模拟日之后一直在澳（已录入的未来出境除外），签证按录入的起止日。',
    'Projected dates assume you stay in Australia after the simulation date (apart from trips you entered) and that each visa runs for the dates entered.',
  );

  const pathways: AuPathway[] = [];
  const statusOf = (earliest?: IsoDate): AuStatus =>
    !earliest ? 'NOT_MET' : earliest === sim ? 'MET' : 'FUTURE';

  // ---------- Subclass 191 ----------
  {
    const title = L(
      '191 永居（地区临时签证转永居）',
      'Subclass 191 permanent residence (from a regional provisional visa)',
    );
    const current = visas
      .filter(
        (x) => (x.subclass === '491' || x.subclass === '494') && x.from <= sim,
      )
      .filter((x) => !x.to || x.to >= sim)
      .at(-1);
    const notChecked = [
      L(
        '遵守签证条件，包括地区居住与工作的条件 8579（191.221）',
        'Complying with your visa conditions, including condition 8579 on living and working in regional areas (191.221)',
      ),
      L(
        '3 个相关财年的 ATO 税务评估通知；没有最低收入要求（191.222；SRC-063）',
        'ATO notices of assessment for 3 relevant income years; there is no minimum income (191.222; SRC-063)',
      ),
      L(
        '健康、品格等公共利益条件',
        'Health, character and other public interest criteria',
      ),
    ];
    if (!current) {
      pathways.push({
        id: 'AU-191',
        title,
        status: 'NOT_APPLICABLE',
        summary: L(
          '模拟日没有持有 491 或 494 签证。',
          'You do not hold a subclass 491 or 494 visa on the simulation date.',
        ),
        checks: [],
        notChecked,
        assumptions: [],
      });
    } else {
      const due = addYears(current.from, v.regionalProvisionalYears.value);
      const reachable = !current.to || current.to >= due;
      const earliest = reachable ? (due > sim ? due : sim) : undefined;
      pathways.push({
        id: 'AU-191',
        title,
        status: statusOf(earliest),
        earliestDate: earliest,
        summary: reachable
          ? L(
              `持当前 ${current.subclass} 签证满 3 年的日期是 ${due}，届时须仍持有该签证。`,
              `You will have held your current subclass ${current.subclass} visa for 3 years on ${due}; you must still hold it then.`,
            )
          : L(
              `当前 ${current.subclass} 签证在 ${current.to} 到期，早于持满 3 年的 ${due}。`,
              `Your current subclass ${current.subclass} visa ends on ${current.to}, before you would have held it for 3 years on ${due}.`,
            ),
        checks: [
          {
            text: L(
              `已持有当前 ${current.subclass} 签证满 3 年（${due} 满）`,
              `Held the current subclass ${current.subclass} visa for 3 years (on ${due})`,
            ),
            met: sim >= due,
            sources: v.regionalProvisionalYears.sources,
          },
        ],
        notChecked,
        assumptions: [],
      });
    }
  }

  // ---------- Subclass 186 Temporary Residence Transition ----------
  {
    const title = L(
      '186 雇主担保永居（临时居民过渡类别）',
      'Subclass 186 Temporary Residence Transition stream',
    );
    const notChecked = [
      L(
        '雇主提名已获批，并在获批后 6 个月内递交（186.223）',
        'An approved nomination, with the application made within 6 months of approval (186.223)',
      ),
      L('Competent English（186.222）', 'Competent English (186.222)'),
      L(
        '健康、品格等公共利益条件',
        'Health, character and other public interest criteria',
      ),
    ];
    const birthday45 = addYears(req.dateOfBirth, v.trtMaxAge.value);
    const required = (d: IsoDate) =>
      daysBetween(addYears(d, -v.trtHeldYears.value), d);
    const held = (d: IsoDate) =>
      days.total(
        sums.trt,
        addYears(d, -v.trtWindowYears.value),
        addDays(d, -1),
      );
    const assumptions = [
      L(
        '"合计 2 年"按申请日前 2 个日历年的天数计；签证分成多段时，可能比按 730 天计晚一天（PD-085）。',
        '"A total of 2 years" is counted as the days in the 2 calendar years before the application date; with several separate visa periods this can be one day later than counting 730 days (PD-085).',
      ),
      L(
        '457／482 之后的 bridging visa 视为因申请 457、482、186 或 187 签证而获发（186.226(1)(d)）。',
        'A bridging visa after a 457/482 is treated as granted because you applied for a 457, 482, 186 or 187 visa (186.226(1)(d)).',
      ),
    ];
    if (!visas.some((x) => TRT_VISAS.has(x.subclass))) {
      pathways.push({
        id: 'AU-186-TRT',
        title,
        status: 'NOT_APPLICABLE',
        summary: L(
          '记录中没有 457 或 482 签证。',
          'Your record has no subclass 457 or 482 visa.',
        ),
        checks: [],
        notChecked,
        assumptions: [],
      });
    } else {
      const earliestHeld = firstDate((d) => held(d) >= required(d));
      const earliest =
        earliestHeld && earliestHeld < birthday45 ? earliestHeld : undefined;
      const status: AuStatus =
        earliest && !req.sponsoredFullTime ? 'UNKNOWN' : statusOf(earliest);
      const summary = !earliestHeld
        ? L(
            '按录入的签证，3 年内持 457／482 合计达不到 2 年。',
            'With the visas entered, you will not hold a 457/482 visa for a total of 2 years within 3 years.',
          )
        : !earliest
          ? L(
              `持 457／482 合计满 2 年的日期 ${earliestHeld} 已满 45 岁（${birthday45}）；只有文书列明的豁免类别可以申请。`,
              `You reach 2 years on a 457/482 visa on ${earliestHeld}, after turning 45 on ${birthday45}; only exempt classes in a legislative instrument can apply.`,
            )
          : req.sponsoredFullTime
            ? L(
                `3 年内持 457／482 合计满 2 年的最早日期是 ${earliest}；须在 ${birthday45} 满 45 岁之前递交。`,
                `The earliest date with a total of 2 years on a 457/482 visa within 3 years is ${earliest}; apply before you turn 45 on ${birthday45}.`,
              )
            : L(
                `持 457／482 的时间在 ${earliest} 达到 2 年，但你没有确认一直全职为担保雇主工作；须另算全职受雇时间（186.227）。`,
                `Your 457/482 time reaches 2 years on ${earliest}, but you have not confirmed full-time work for your sponsor throughout; count your full-time sponsored work separately (186.227).`,
              );
      pathways.push({
        id: 'AU-186-TRT',
        title,
        status,
        earliestDate: earliest,
        summary,
        checks: [
          {
            text: L(
              `前 3 年持 457／482 合计 ${held(sim)} 天（需 ${required(sim)} 天）`,
              `${held(sim)} days on a 457/482 visa in the past 3 years (${required(sim)} needed)`,
            ),
            met: held(sim) >= required(sim),
            sources: v.trtHeldYears.sources,
          },
          {
            text: L(
              '一直全职为担保雇主工作（按你的回答）',
              'Full-time work for your sponsor throughout (your answer)',
            ),
            met: !!req.sponsoredFullTime,
            sources: [{ srcId: 'SRC-062', locator: '186.227(1)' }],
          },
          {
            text: L(
              `申请时未满 45 岁（${birthday45} 满 45 岁）`,
              `Under 45 when applying (you turn 45 on ${birthday45})`,
            ),
            met: sim < birthday45,
            sources: v.trtMaxAge.sources,
          },
        ],
        notChecked,
        assumptions: [...assumptions, projection],
        pendingDetails: ['PD-085'],
      });
    }
  }

  // ---------- Partner visa permanent stage ----------
  {
    const title = L(
      '伴侣签永久阶段（801／100）',
      'Partner visa permanent stage (subclass 801 or 100)',
    );
    const p = req.partnerApplication;
    if (!p) {
      pathways.push({
        id: 'AU-PARTNER',
        title,
        status: 'NOT_APPLICABLE',
        summary: L(
          '没有录入伴侣签申请。',
          'You have not entered a partner visa application.',
        ),
        checks: [],
        notChecked: [],
        assumptions: [],
      });
    } else {
      const temporary = p.stream === 'onshore' ? '820' : '309';
      const permanentVisa = p.stream === 'onshore' ? '801' : '100';
      const due = p.longTermRelationship
        ? p.lodged
        : addYears(p.lodged, v.partnerWaitYears.value);
      const earliest = due > sim ? due : sim;
      pathways.push({
        id: 'AU-PARTNER',
        title,
        status: statusOf(earliest),
        earliestDate: earliest,
        summary: p.longTermRelationship
          ? L(
              `递交时已是长期伴侣关系，${permanentVisa} 不受递交满 2 年的限制。`,
              `You were in a long-term partner relationship when you applied, so the 2-year wait for the ${permanentVisa} does not apply.`,
            )
          : L(
              `${permanentVisa} 永久阶段自 ${due}（递交满 2 年）起评估；移民局也可能更早拒签，或因特殊情形更早批准。`,
              `The ${permanentVisa} permanent stage is assessed from ${due}, 2 years after you applied; the department can refuse earlier, or approve earlier in special circumstances.`,
            ),
        checks: [
          {
            text: p.longTermRelationship
              ? L(
                  '递交时已是长期伴侣关系（有共同子女满 2 年，否则满 3 年）',
                  'Long-term partner relationship when applying (2 years with a child of both of you, otherwise 3 years)',
                )
              : L(
                  `递交满 2 年（${due} 满）`,
                  `2 years since you applied (on ${due})`,
                ),
            met: sim >= due,
            sources: v.partnerWaitYears.sources,
          },
        ],
        notChecked: [
          L(
            `届时仍持 ${temporary} 签证，仍与担保伴侣保持关系并受其担保`,
            `Still holding the ${temporary} visa, still in the relationship and sponsored by your partner`,
          ),
          L(
            '健康、品格等公共利益条件',
            'Health, character and other public interest criteria',
          ),
        ],
        assumptions: [],
      });
    }
  }

  // ---------- Resident Return visa ----------
  const permanentNow = visas
    .filter((x) => PERMANENT.has(x.subclass) && x.from <= sim)
    .filter((x) => !x.to || x.to >= sim);
  {
    const title = L(
      '回头签 RRV（155，5 年旅行便利）',
      'Resident Return visa (subclass 155, 5-year travel facility)',
    );
    const notChecked = [
      L(
        '不满 2 年时按与澳洲的实质联系申请（155.212(3)、(3A)），最多给 1 年旅行便利',
        'Applying on substantial ties instead (155.212(3), (3A)), which gives at most a 1-year travel facility',
      ),
      L('公共利益条件 4021', 'Public interest criterion 4021'),
    ];
    if (!permanentNow.length) {
      pathways.push({
        id: 'AU-RRV',
        title,
        status: 'NOT_APPLICABLE',
        summary: L(
          '模拟日没有持有永久签证。',
          'You do not hold a permanent visa on the simulation date.',
        ),
        checks: [],
        notChecked,
        assumptions: [],
      });
    } else {
      const present = (d: IsoDate) =>
        days.total(
          sums.permanentPresent,
          addYears(d, -v.rrvWindowYears.value),
          addDays(d, -1),
        );
      const earliest = firstDate((d) => present(d) >= v.rrvPresenceDays.value);
      const latest = permanentNow[permanentNow.length - 1];
      const facilityEnds = addYears(latest.from, v.travelFacilityYears.value);
      pathways.push({
        id: 'AU-RRV',
        title,
        status: statusOf(earliest),
        earliestDate: earliest,
        summary: L(
          `当前永久签证的旅行便利自 ${latest.from} 起 5 年，约到 ${facilityEnds}（以签证通知或 VEVO 为准）；此后出境，须持 RRV 才能以永久居民身份返澳。` +
            (earliest
              ? `5 年内在澳满 730 天的最早递交日是 ${earliest}。`
              : '按现有记录达不到 5 年内在澳 730 天。'),
          `The travel facility on your current permanent visa runs 5 years from ${latest.from}, to about ${facilityEnds} (check your grant notice or VEVO); after that you need an RRV to come back as a permanent resident.` +
            (earliest
              ? ` The earliest application date with 730 days in Australia in 5 years is ${earliest}.`
              : ' With your record you will not reach 730 days in Australia in 5 years.'),
        ),
        checks: [
          {
            text: L(
              `前 5 年以永久签证持有人身份在澳 ${present(sim)} 天（需 730 天）`,
              `${present(sim)} days in Australia as a permanent visa holder in the past 5 years (730 needed)`,
            ),
            met: present(sim) >= v.rrvPresenceDays.value,
            sources: v.rrvPresenceDays.sources,
          },
        ],
        notChecked,
        assumptions: [
          L(
            '入境日与出境日都计为在澳（SRC-066）。旅行便利以最近一份永久签证（含 RRV）录入的起始日为批准日，按 5 年计。',
            'Arrival and departure days both count as days in Australia (SRC-066). The travel facility is counted as 5 years from the start date you entered for your latest permanent visa (including an RRV).',
          ),
          projection,
        ],
      });
    }
  }

  // ---------- Citizenship by conferral ----------
  {
    const title = L(
      '入籍（一般居住要求）',
      'Citizenship by conferral (general residence requirement)',
    );
    const notChecked = [
      L(
        '入籍考试、英语基础知识、品格，以及打算在澳居住或保持联系（s21(2)(d)–(h)）',
        'The citizenship test, basic English, character, and intending to live in or keep close ties with Australia (s21(2)(d)–(h))',
      ),
      L(
        '居住要求的豁免与部长裁量（s22(2)–(11)、s22A–22C）',
        'Exemptions and ministerial discretion (s22(2)–(11), s22A–22C)',
      ),
    ];
    if (!visas.some((x) => PERMANENT.has(x.subclass))) {
      pathways.push({
        id: 'AU-CITIZENSHIP',
        title,
        status: 'NOT_APPLICABLE',
        summary: L(
          '记录中没有永久签证；入籍须先持永久签证满 12 个月。',
          'Your record has no permanent visa; you need 12 months on a permanent visa before citizenship.',
        ),
        checks: [],
        notChecked,
        assumptions: [],
      });
    } else {
      const adult = addYears(req.dateOfBirth, v.citizenshipMinAge.value);
      const fourYears = addYears(
        req.firstArrival,
        v.citizenshipResidenceYears.value,
      );
      const facts = (d: IsoDate) => {
        const start = addYears(d, -v.citizenshipResidenceYears.value);
        const recent = addMonths(d, -v.citizenshipPermanentMonths.value);
        return {
          absent: days.total(sums.absent, start, addDays(d, -1)),
          unlawful: days.total(sums.unlawful, start, addDays(d, -1)),
          notPermanent: days.total(sums.notPermanent, recent, d),
          recentAbsent: days.total(sums.absent, recent, addDays(d, -1)),
        };
      };
      const ok = (d: IsoDate) => {
        const f = facts(d);
        return (
          d >= adult &&
          d >= fourYears &&
          f.absent <= v.citizenshipAbsenceDays.value &&
          f.unlawful === 0 &&
          f.notPermanent === 0 &&
          f.recentAbsent <= v.citizenshipRecentAbsenceDays.value
        );
      };
      const earliest = firstDate(ok);
      const f = facts(sim);
      pathways.push({
        id: 'AU-CITIZENSHIP',
        title,
        status: statusOf(earliest),
        earliestDate: earliest,
        summary: earliest
          ? L(
              `满足一般居住要求的最早递交日是 ${earliest}。`,
              `The earliest application date that meets the general residence requirement is ${earliest}.`,
            )
          : L(
              '按现有记录，10 年内达不到一般居住要求。',
              'With your record you will not meet the general residence requirement within 10 years.',
            ),
        checks: [
          {
            text: L(
              `年满 18 岁（${adult}）`,
              `Aged 18 or over (from ${adult})`,
            ),
            met: sim >= adult,
            sources: v.citizenshipMinAge.sources,
          },
          {
            text: L(
              `首次入境满 4 年（${fourYears}）`,
              `4 years since you first arrived (on ${fourYears})`,
            ),
            met: sim >= fourYears,
            sources: v.citizenshipResidenceYears.sources,
          },
          {
            text: L(
              `前 4 年出境合计 ${f.absent} 天（上限 365 天）`,
              `${f.absent} days outside Australia in the past 4 years (365 at most)`,
            ),
            met: f.absent <= v.citizenshipAbsenceDays.value,
            sources: v.citizenshipAbsenceDays.sources,
          },
          {
            text: L(
              `前 4 年在澳期间一直持有签证（无签证 ${f.unlawful} 天）`,
              `A visa throughout your time in Australia in the past 4 years (${f.unlawful} days without one)`,
            ),
            met: f.unlawful === 0,
            sources: [{ srcId: 'SRC-061', locator: 's22(1)(b)' }],
          },
          {
            text: L(
              '前 12 个月及递交日一直持永久签证',
              'A permanent visa throughout the past 12 months and on the application date',
            ),
            met: f.notPermanent === 0,
            sources: [
              ...v.citizenshipPermanentMonths.sources,
              { srcId: 'SRC-061', locator: 's21(2)(b)(i)' },
            ],
          },
          {
            text: L(
              `前 12 个月出境合计 ${f.recentAbsent} 天（上限 90 天）`,
              `${f.recentAbsent} days outside Australia in the past 12 months (90 at most)`,
            ),
            met: f.recentAbsent <= v.citizenshipRecentAbsenceDays.value,
            sources: v.citizenshipRecentAbsenceDays.sources,
          },
        ],
        notChecked,
        assumptions: [
          L(
            '出境天数按入境日减出境日计，即出境当天计为不在澳；移民局 SOP 正文称两天都计为在澳，按此最早日期可能提前，每次出境最多一天（PD-084）。',
            'Days outside Australia are counted as the return date minus the departure date, so the departure day counts as away; the department’s SOP text says both days count as in Australia, which could move the date earlier by up to one day per trip (PD-084).',
          ),
          projection,
        ],
        pendingDetails: ['PD-084'],
      });
    }
  }

  return { policyAsOf: au.asOf, pathways, assumptions: [projection] };
}
