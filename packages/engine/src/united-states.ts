import { unitedStates2026_11 as us } from '@uk-immigration/policy-data';
import type { SourceRef } from '@uk-immigration/policy-data';
import { addDays, addMonths, addYears, daysBetween } from './dates';
import { Days, HORIZON_YEARS, afterYears } from './pilot';
import type { PilotPathway, PilotResult, PilotStatus } from './pilot';
import { textFor } from './rule';
import type { IsoDate, Locale } from './types';

// United States pilot (phase 18, task 62): naturalization dates (INA 316(a),
// 319(a)), removing conditions on residence, and how long a green card
// holder has been away. Green card categories and the Visa Bulletin are out
// of scope.

export const US_CONDITIONAL = ['none', 'marriage', 'investor'] as const;
export type UsConditional = (typeof US_CONDITIONAL)[number];

/** Left the United States on `departed`, came back on `returned`. */
export interface UsTrip {
  departed: IsoDate;
  returned: IsoDate;
}

export interface UsRequest {
  simulationDate: IsoDate;
  dateOfBirth: IsoDate;
  /** "Resident since" on the green card. */
  permanentResident: IsoDate;
  conditional: UsConditional;
  /** First day living in the current state or USCIS district. */
  stateResidenceFrom?: IsoDate;
  /** Married to a U.S. citizen and living together. */
  marriage?: { married: IsoDate; spouseCitizenSince?: IsoDate };
  trips: UsTrip[];
  locale?: Locale;
}

export type UsPathwayId =
  'US-NATURALIZATION' | 'US-SPOUSE' | 'US-CONDITIONS' | 'US-TRAVEL';
export type UsPathway = PilotPathway<UsPathwayId>;
export type UsResult = PilotResult<UsPathwayId>;

const v = us.values;
/** 0 = Sunday … 6 = Saturday. */
const weekday = (d: IsoDate) => new Date(`${d}T00:00:00Z`).getUTCDay();
// Legal public holidays, 5 U.S.C. 6103(a): fixed dates, and the nth (or
// last, -1) weekday of a month.
const FIXED_HOLIDAYS = ['01-01', '06-19', '07-04', '11-11', '12-25'];
const FLOATING_HOLIDAYS: [month: number, day: number, nth: number][] = [
  [1, 1, 3],
  [2, 1, 3],
  [5, 1, -1],
  [9, 1, 1],
  [10, 1, 2],
  [11, 4, 4],
];
/** A federal holiday, observed on the Friday or Monday when it falls on a weekend (5 U.S.C. 6103(b)). */
function federalHoliday(d: IsoDate): boolean {
  const [, m, day] = d.split('-').map(Number);
  const wd = weekday(d);
  if (
    FLOATING_HOLIDAYS.some(
      ([month, w, nth]) =>
        month === m &&
        w === wd &&
        (nth > 0
          ? Math.ceil(day / 7) === nth
          : addDays(d, 7).slice(5, 7) !== d.slice(5, 7)),
    )
  )
    return true;
  return [addDays(d, 1), d, addDays(d, -1)].some((h, k) => {
    if (!FIXED_HOLIDAYS.includes(h.slice(5))) return false;
    const hw = weekday(h);
    // k = 0: the holiday is tomorrow (Saturday, observed today, a Friday);
    // k = 2: it was yesterday (Sunday, observed today, a Monday).
    return k === 1 ? hw !== 0 && hw !== 6 : k === 0 ? hw === 6 : hw === 0;
  });
}

export function evaluateUnitedStates(req: UsRequest): UsResult {
  const L = textFor(req);
  const sim = req.simulationDate;
  const lpr = req.permanentResident;
  const days = new Days(
    addYears(sim, -v.naturalizationYears.value),
    addYears(sim, HORIZON_YEARS),
  );
  // Departure and return days are days in the United States (PM 12 D.4;
  // D.3 footnote 24).
  const away = new Array<boolean>(days.count).fill(false);
  for (const trip of req.trips)
    days.mark(away, addDays(trip.departed, 1), addDays(trip.returned, -1));
  const present = days.sums((i) => days.date(i) >= lpr && !away[i]);

  /** Longest absence after LPR inside [from, to], in days. */
  const longestAbsence = (from: IsoDate, to: IsoDate) => {
    const start = from > lpr ? from : lpr;
    let longest = 0;
    for (const trip of req.trips) {
      const a = addDays(trip.departed, 1);
      const b = addDays(trip.returned, -1);
      const lo = a > start ? a : start;
      const hi = b < to ? b : to;
      if (lo <= hi) longest = Math.max(longest, daysBetween(lo, hi) + 1);
    }
    return longest;
  };

  const firstDate = (ok: (d: IsoDate) => boolean): IsoDate | undefined => {
    for (let i = days.index(sim); i < days.count; i++) {
      const d = days.date(i);
      if (ok(d)) return d;
    }
    return undefined;
  };
  const statusOf = (earliest?: IsoDate): PilotStatus =>
    !earliest ? 'NOT_MET' : earliest === sim ? 'MET' : 'FUTURE';
  const adult = afterYears(req.dateOfBirth, v.minAge.value);
  const stateFrom =
    req.stateResidenceFrom &&
    addMonths(req.stateResidenceFrom, v.stateResidenceMonths.value);
  const projection = L(
    '最早日期假设模拟日之后一直在美国（已录入的未来出境除外）。',
    'Projected dates assume you stay in the United States after the simulation date, apart from trips you entered.',
  );
  const travelDays = L(
    '离境日与返美日都算在美国（PM 12 D.4）；离境天数只算整天在境外的日子（PM 12 D.3 注 24）。',
    'The days you leave and come back count as days in the United States (PM 12 D.4); an absence counts only the full days abroad (PM 12 D.3 note 24).',
  );
  const conditionalNote =
    req.conditional === 'none'
      ? []
      : [
          L(
            '条件绿卡期间计入入籍年限，但入籍获批前须先批准取消条件的申请（I-751／I-829）',
            'Time as a conditional resident counts, but the petition to remove conditions (I-751 or I-829) must be approved before naturalization',
          ),
        ];

  /** Naturalization after `years` with `need` days in the United States. */
  const naturalization = (
    years: number,
    need: number,
    extra: (d: IsoDate) => boolean,
  ) => {
    const residence = afterYears(lpr, years);
    const earlyFrom = addDays(residence, -v.earlyFilingDays.value);
    const count = (d: IsoDate) =>
      days.total(present, addYears(d, -years), addDays(d, -1));
    const absence = (d: IsoDate) =>
      longestAbsence(addYears(d, -years), addDays(d, -1));
    const ok = (limit: number) => (d: IsoDate) =>
      d >= earlyFrom &&
      d >= adult &&
      (!stateFrom || d >= stateFrom) &&
      count(d) >= need &&
      absence(d) <= limit &&
      extra(d);
    const earliest = firstDate(ok(v.presumptionDays.value));
    // Absences of more than 180 days but under a year can be rebutted.
    const rebuttable = firstDate(ok(v.breakDays.value - 1));
    return {
      residence,
      earlyFrom,
      earliest,
      rebuttable:
        rebuttable && (!earliest || rebuttable < earliest)
          ? rebuttable
          : undefined,
      count: count(sim),
      absence: absence(sim),
    };
  };

  const summaryOf = (
    n: { earliest?: IsoDate; rebuttable?: IsoDate },
    what: [string, string],
  ) =>
    (!stateFrom && n.earliest
      ? L(
          `如果已在所在州或 USCIS 辖区住满 3 个月，${what[0]}最早可递交日是 ${n.earliest}；请填写起住日以确认。`,
          `If you have lived in your state or USCIS district for 3 months, the earliest date to file ${what[1]} is ${n.earliest}; enter the start date to confirm it.`,
        )
      : n.earliest === sim
        ? L(
            `模拟日递交${what[0]}已满足时间条件。`,
            `Filing ${what[1]} on the simulation date meets the time requirements.`,
          )
        : n.earliest
          ? L(
              `${what[0]}最早可递交日是 ${n.earliest}。`,
              `The earliest date to file ${what[1]} is ${n.earliest}.`,
            )
          : L(
              `按现有记录，10 年内达不到${what[0]}的时间条件。`,
              `With your record you will not meet the time requirements for ${what[1]} within 10 years.`,
            )) +
    (n.rebuttable && stateFrom
      ? L(
          `如能证明离境超过 180 天但不满 1 年期间没有放弃居住（推定可反驳），最早 ${n.rebuttable}。`,
          ` If you can show you did not abandon your residence during an absence of more than 180 days but under a year (the presumption can be rebutted), the earliest date is ${n.rebuttable}.`,
        )
      : '');

  const residenceChecks = (
    n: ReturnType<typeof naturalization>,
    years: number,
    need: number,
    sources: { years: SourceRef[]; days: SourceRef[] },
  ) => [
    {
      text: L(
        `取得永居满 ${years} 年（${n.residence}；可提前 90 天递交，即 ${n.earlyFrom} 起）`,
        `${years} years since you became a permanent resident (${n.residence}; you can file 90 days early, from ${n.earlyFrom})`,
      ),
      met: sim >= n.earlyFrom,
      sources: [...sources.years, ...v.earlyFilingDays.sources],
    },
    {
      text: L(
        `前 ${years} 年最长一次离境 ${n.absence} 天（超过 180 天推定中断，满 365 天即中断）`,
        `Longest absence in the past ${years} years: ${n.absence} days (more than 180 is presumed to break continuity; 365 or more breaks it)`,
      ),
      met: n.absence <= v.presumptionDays.value,
      sources: [...v.presumptionDays.sources, ...v.breakDays.sources],
    },
    {
      text: L(
        `前 ${years} 年在美国 ${n.count} 天（至少 ${need} 天）`,
        `${n.count} days in the United States in the past ${years} years (${need} at least)`,
      ),
      met: n.count >= need,
      sources: sources.days,
    },
    {
      text: L(`年满 18 岁（${adult}）`, `Aged 18 or over (from ${adult})`),
      met: sim >= adult,
      sources: v.minAge.sources,
    },
    {
      text: stateFrom
        ? L(
            `在所在州或 USCIS 辖区住满 3 个月（${stateFrom}）`,
            `3 months in your state or USCIS district (on ${stateFrom})`,
          )
        : L(
            '在所在州或 USCIS 辖区住满 3 个月（未填起住日）',
            '3 months in your state or USCIS district (no start date entered)',
          ),
      met: stateFrom ? sim >= stateFrom : undefined,
      sources: v.stateResidenceMonths.sources,
    },
  ];

  const naturalizationNotChecked = [
    L(
      '英语与公民考试、良好品行、拥护宪法（INA 312、316(a)(3)）',
      'English and civics tests, good moral character and attachment to the Constitution (INA 312, 316(a)(3))',
    ),
    L(
      '递交后到宣誓须一直连续居住（INA 316(a)(2)）；多次短期离境、在境外长期居住等是否放弃居住，由官员综合判断',
      'Continuous residence from filing to the oath (INA 316(a)(2)); whether frequent short trips or living abroad mean you abandoned your residence is decided case by case',
    ),
    L(
      '获批的 N-470（为在境外工作保留居住）、军人与政府外派的例外',
      'An approved N-470 to preserve residence for work abroad, and exceptions for the military and government service',
    ),
    ...conditionalNote,
  ];
  const naturalizationAssumptions = [
    travelDays,
    L(
      `时间窗口从递交日往回数，不含递交当天；离境天数按窗口内的部分计（PM 12 D.3 示例）。只算取得永居之后在美国的日子：提前递交时窗口里永居之前的日子不计（PD-092）。`,
      `Windows are counted back from the filing date, not including it, and only the part of an absence inside the window counts (PM 12 D.3 examples). Only days after you became a permanent resident count: when filing early, days before that in the window are left out (PD-092).`,
    ),
    L(
      '"超过 6 个月""不满 1 年"按天数计（超过 180 天、不满 365 天，PM 12 D.3）；PM 另有按月计的写法，在已核对的 PM 示例中按天数得出的日期不早于按月计，有时晚一天（PD-093）。3 个月州居住按日历月计，提前递交时也要求递交前住满（PD-096）。',
      '"More than 6 months" and "less than 1 year" are counted in days (more than 180, under 365; PM 12 D.3); the PM also counts in months, and in the PM examples checked, counting in days never gives an earlier date and is sometimes a day later (PD-093). The 3 months in your state are calendar months, and are required before filing even when filing early (PD-096).',
    ),
  ];
  const assumptions = [...naturalizationAssumptions, projection];

  const pathways: UsPathway[] = [];

  // ---------- Naturalization, INA 316(a) ----------
  {
    const n = naturalization(
      v.naturalizationYears.value,
      v.physicalPresenceDays.value,
      () => true,
    );
    pathways.push({
      id: 'US-NATURALIZATION',
      title: L('入籍（一般，5 年）', 'Naturalization (general, 5 years)'),
      // Without the state residence date the result rests on it (PD-096).
      status: !stateFrom && n.earliest ? 'UNKNOWN' : statusOf(n.earliest),
      earliestDate: stateFrom ? n.earliest : undefined,
      summary: summaryOf(n, ['入籍申请（N-400）', 'your N-400']),
      checks: residenceChecks(
        n,
        v.naturalizationYears.value,
        v.physicalPresenceDays.value,
        {
          years: v.naturalizationYears.sources,
          days: v.physicalPresenceDays.sources,
        },
      ),
      notChecked: naturalizationNotChecked,
      assumptions,
      pendingDetails: ['PD-092', 'PD-093', 'PD-096'],
    });
  }

  // ---------- Spouse of a U.S. citizen, INA 319(a) ----------
  {
    const title = L(
      '入籍（美国公民配偶，3 年）',
      'Naturalization (spouse of a U.S. citizen, 3 years)',
    );
    const m = req.marriage;
    if (!m) {
      pathways.push({
        id: 'US-SPOUSE',
        title,
        status: 'NOT_APPLICABLE',
        summary: L(
          '没有填写与美国公民的婚姻。',
          'You did not enter a marriage to a U.S. citizen.',
        ),
        checks: [],
        notChecked: [],
        assumptions: [],
      });
    } else {
      const years = v.spouseYears.value;
      const married = afterYears(m.married, years);
      const citizen = m.spouseCitizenSince
        ? afterYears(m.spouseCitizenSince, years)
        : undefined;
      // The marriage and the spouse's citizenship cannot be filed early.
      const n = naturalization(
        years,
        v.spousePresenceDays.value,
        (d) => d >= married && (!citizen || d >= citizen),
      );
      pathways.push({
        id: 'US-SPOUSE',
        title,
        // Without the state residence date the result rests on it (PD-096).
        status: !stateFrom && n.earliest ? 'UNKNOWN' : statusOf(n.earliest),
        earliestDate: stateFrom ? n.earliest : undefined,
        summary: summaryOf(n, ['配偶类入籍申请', 'as the spouse of a citizen']),
        checks: [
          ...residenceChecks(n, years, v.spousePresenceDays.value, {
            years: v.spouseYears.sources,
            days: v.spousePresenceDays.sources,
          }),
          {
            text: L(
              `结婚满 3 年（${married}）`,
              `Married for 3 years (on ${married})`,
            ),
            met: sim >= married,
            sources: v.spouseYears.sources,
          },
          ...(citizen
            ? [
                {
                  text: L(
                    `配偶成为美国公民满 3 年（${citizen}）`,
                    `Your spouse a U.S. citizen for 3 years (on ${citizen})`,
                  ),
                  met: sim >= citizen,
                  sources: v.spouseYears.sources,
                },
              ]
            : []),
        ],
        notChecked: [
          L(
            '递交前 3 年一直同住（living in marital union），递交后到宣誓配偶仍是美国公民、婚姻存续',
            'Living in marital union for the 3 years before filing, and your spouse staying a citizen and the marriage continuing until the oath',
          ),
          ...naturalizationNotChecked,
        ],
        assumptions: [
          ...naturalizationAssumptions,
          L(
            '结婚与配偶公民身份的 3 年不能提前 90 天（PM 12 G.3(E)）；没填配偶入籍日期的按出生即为公民计。',
            'The 3 years of marriage and of your spouse’s citizenship cannot be met 90 days early (PM 12 G.3(E)); with no date for your spouse’s citizenship, they are taken to be a citizen by birth.',
          ),
          projection,
        ],
        pendingDetails: ['PD-092', 'PD-093', 'PD-096'],
      });
    }
  }

  // ---------- Removing conditions, INA 216(d)(2), 216A(d)(2) ----------
  {
    const title = L(
      '取消绿卡条件（I-751／I-829）',
      'Removing conditions on residence (I-751 or I-829)',
    );
    if (req.conditional === 'none') {
      pathways.push({
        id: 'US-CONDITIONS',
        title,
        status: 'NOT_APPLICABLE',
        summary: L('不是条件绿卡。', 'Your green card is not conditional.'),
        checks: [],
        notChecked: [],
        assumptions: [],
      });
    } else {
      const anniversary = afterYears(lpr, v.conditionalYears.value);
      const opens = addDays(anniversary, -v.conditionsWindowDays.value);
      const closes = addDays(anniversary, -1);
      const form = req.conditional === 'marriage' ? 'I-751' : 'I-829';
      // Paper filings due on a Saturday, Sunday or federal holiday are on
      // time the next business day (PM 1 B.6(E); 5 U.S.C. 6103).
      let paperUntil = closes;
      while (
        weekday(paperUntil) === 0 ||
        weekday(paperUntil) === 6 ||
        federalHoliday(paperUntil)
      )
        paperUntil = addDays(paperUntil, 1);
      const status: PilotStatus =
        sim < opens
          ? 'FUTURE'
          : sim <= closes
            ? 'MET'
            : sim <= paperUntil
              ? 'UNKNOWN'
              : 'NOT_MET';
      pathways.push({
        id: 'US-CONDITIONS',
        title,
        status,
        earliestDate:
          status === 'NOT_MET' ? undefined : sim < opens ? opens : sim,
        summary:
          status === 'UNKNOWN'
            ? L(
                `${form} 的递交期最后一天 ${closes} 是周末或联邦假日：纸质递交在 ${paperUntil} 前送达仍算按时，网上递交不顺延（PD-094）。`,
                `The last day of the ${form} filing period, ${closes}, is a weekend or federal holiday: a paper filing received by ${paperUntil} is still on time, but online filing is not extended (PD-094).`,
              )
            : status === 'NOT_MET'
              ? L(
                  `${form} 须在 ${opens} 至 ${closes} 之间递交；此后递交须说明正当理由，未递交的条件身份在 ${anniversary} 终止。`,
                  `The ${form} had to be filed from ${opens} to ${closes}; filing later needs good cause, and without it conditional status ends on ${anniversary}.`,
                )
              : L(
                  `${form} 的递交期是 ${opens} 至 ${closes}（绿卡两周年 ${anniversary} 前 90 天）。`,
                  `The ${form} filing period is ${opens} to ${closes} (the 90 days before the second anniversary, ${anniversary}).`,
                ),
        checks: [
          {
            text: L(
              `在递交期内（${opens} 至 ${closes}）`,
              `Within the filing period (${opens} to ${closes})`,
            ),
            met: status === 'MET',
            sources: [
              ...v.conditionalYears.sources,
              ...v.conditionsWindowDays.sources,
              {
                srcId: 'SRC-081',
                locator: 'Vol 1 Part B Ch 6(E)',
                url: 'https://www.uscis.gov/policy-manual/volume-1-part-b-chapter-6',
              },
              {
                srcId: 'SRC-079',
                locator: '5 U.S.C. 6103',
                url: 'https://uscode.house.gov/us/usc/t5/s6103/',
              },
            ],
          },
        ],
        notChecked: [
          L(
            '婚姻真实或投资仍满足要求；豁免联名的 I-751 可随时递交；EB-5 追加投资的另行起算',
            'Whether the marriage is genuine or the investment still qualifies; a waiver I-751 can be filed at any time; later EB-5 investments start their own period',
          ),
        ],
        assumptions: [
          L(
            '递交期最后一天按两周年前一天计，两周年当天能否递交原文未写；最后一天是周末或联邦假日（5 U.S.C. 6103）的，纸质递交按 USCIS 一般规则顺延到下一个工作日，网上递交不顺延；取得永居日为 2 月 29 日的，两周年取 3 月 1 日（PD-094）。',
            'The last day is taken as the day before the second anniversary; whether the anniversary itself counts is not stated. If the last day is a weekend or federal holiday (5 U.S.C. 6103), a paper filing is extended to the next business day under the general USCIS rule, but online filing is not; a 29 February start has its anniversary on 1 March (PD-094).',
          ),
        ],
        pendingDetails: ['PD-094'],
      });
    }
  }

  // ---------- Time abroad on a green card ----------
  {
    const trips = req.trips.filter((t) => t.returned > lpr);
    const yearLong = trips.filter(
      (t) => t.returned >= afterYears(t.departed, v.greenCardReturnYears.value),
    );
    const long = trips.filter(
      (t) =>
        daysBetween(t.departed, t.returned) - 1 > v.seekingAdmissionDays.value,
    );
    pathways.push({
      id: 'US-TRAVEL',
      title: L('持绿卡离境的时长', 'Time abroad on a green card'),
      status: yearLong.length ? 'UNKNOWN' : 'MET',
      earliestDate: yearLong.length ? undefined : sim,
      summary:
        (yearLong.length
          ? L(
              `${yearLong.map((t) => `${t.departed} 至 ${t.returned}`).join('、')} 离境满 1 年：除连续行程中途跨过周年的情形（8 CFR 211.3）外，仅凭绿卡不能回美，须有有效的回美证（签发起 2 年内）或申请返美居民签证 SB-1，是否放弃永居要个案判断。`,
              `Away a year or more (${yearLong.map((t) => `${t.departed} to ${t.returned}`).join(', ')}): unless a continuous journey that set out before the anniversary only arrives after it (8 CFR 211.3), a green card alone cannot be used to return; you need a valid reentry permit (2 years from issue) or a returning resident (SB-1) visa, and whether you abandoned residence is decided case by case.`,
            )
          : L(
              '录入的每次离境都不满 1 年：持有效、未过期的绿卡可凭卡回美（条件绿卡过期后，凭取消条件申请的收据可延期使用）。',
              'Every trip you entered is under a year: a valid, unexpired green card can be used to return (after a conditional card expires, the receipt for the petition to remove conditions extends it).',
            )) +
        (long.length
          ? L(
              `离境超过 180 天的（${long.map((t) => t.departed).join('、')} 出发），返美时按寻求入境审查，并影响入籍的连续居住。`,
              ` Trips of more than 180 days (leaving ${long.map((t) => t.departed).join(', ')}) mean you are treated as seeking admission when you return, and they affect continuous residence for naturalization.`,
            )
          : ''),
      checks: [
        {
          text: L(
            '每次离境不满 1 年（持有效、未过期的绿卡可凭卡回美）',
            'Every trip under a year (a valid, unexpired green card can be used to return)',
          ),
          met: !yearLong.length,
          sources: [
            ...v.greenCardReturnYears.sources,
            ...v.seekingAdmissionDays.sources,
          ],
        },
      ],
      notChecked: [
        L(
          '绿卡是否仍有效；是否持有回美证、能否获得 SB-1，以及是否已放弃永居（看离境目的、意图与在美联系）；周年前出发、连续行程在周年当天或之后抵达的另有规定（8 CFR 211.3）',
          'Whether your green card is still valid; whether you hold a reentry permit, can get an SB-1 visa, or have abandoned residence (which depends on your purpose, intent and ties); a continuous journey that set out before the anniversary and arrives on or after it is treated separately (8 CFR 211.3)',
        ),
      ],
      assumptions: [
        L(
          '"不满 1 年"按返美日早于离境日的周年计；"超过 180 天"按整天在境外的天数计（PD-095）。',
          '"Less than 1 year" means coming back before the anniversary of leaving; "more than 180 days" counts full days abroad (PD-095).',
        ),
      ],
      pendingDetails: ['PD-095'],
    });
  }

  return { policyAsOf: us.asOf, pathways };
}
