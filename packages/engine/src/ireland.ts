import { ireland2026_11 as ie } from '@uk-immigration/policy-data';
import { addDays, addMonths, addYears, daysBetween } from './dates';
import { Days, HORIZON_YEARS, afterYears } from './pilot';
import type { PilotPathway, PilotResult, PilotStatus } from './pilot';
import { textFor } from './rule';
import type { IsoDate, Locale } from './types';

// Ireland pilot (phase 19, task 68): naturalisation (Irish Nationality and
// Citizenship Act 1956 s15, s15C, s16A), naturalisation as the spouse or
// civil partner of an Irish citizen (s15A), and ISD policy on Stamp 4
// upgrades and Stamp 5. Character, intention to reside, the ceremony and the
// 2026 draft bill's longer periods are out of scope.

/**
 * stamp1: Stamp 1 or 1H on an employment permit (not ICT), a Hosting
 * Agreement or a business; stamp1g-graduate: Third Level Graduate Programme;
 * stamp1g-spouse: spouse or partner of an employment permit holder (CSEP,
 * GEP, Multi-Site GEP doctor) or researcher; stamp1g-ict: spouse or partner
 * of an ICT permit holder; stamp4d: Stamp 4D or
 * 4S; student: Stamp 2 or 2A; protection-applicant: waiting for an
 * international protection decision; ni-residence: lawful residence in
 * Northern Ireland (s15A only); other: temporary protection and the rest.
 */
export const IE_PERMISSION_KINDS = [
  'stamp1',
  'stamp1-ict',
  'stamp1g-graduate',
  'stamp1g-spouse',
  'stamp1g-ict',
  'stamp1a',
  'stamp0',
  'stamp3',
  'stamp4',
  'stamp4d',
  'stamp4-eufam',
  'stamp5',
  'student',
  'protection-applicant',
  'ni-residence',
  'other',
] as const;
export type IePermissionKind = (typeof IE_PERMISSION_KINDS)[number];

/**
 * csep: 21 months (CSEP, researcher, Multi-Site GEP doctor); gep: 57 months
 * (GEP, ICT); spouse-1g: 5 years on Stamp 1G; wcatt: Stamp 5.
 */
export const IE_STAMP4_ROUTES = [
  'none',
  'csep',
  'gep',
  'spouse-1g',
  'wcatt',
] as const;
export type IeStamp4Route = (typeof IE_STAMP4_ROUTES)[number];

export interface IePermission {
  kind: IePermissionKind;
  from: IsoDate;
  /** Last day of validity; absent = renewed on time. */
  to?: IsoDate;
}

/** Left Ireland on `departed`, came back on `returned`. */
export interface IeTrip {
  departed: IsoDate;
  returned: IsoDate;
}

export interface IeRequest {
  simulationDate: IsoDate;
  permissions: IePermission[];
  trips: IeTrip[];
  /** Married to, or civil partner of, an Irish citizen since this date. */
  marriedOn?: IsoDate;
  stamp4Route: IeStamp4Route;
  /** Routes csep and gep: started work in the State on that permit. */
  employmentStart?: IsoDate;
  locale?: Locale;
}

export type IePathwayId = 'IE-NATURALISATION' | 'IE-SPOUSE' | 'IE-STAMP4';
export type IePathway = PilotPathway<IePathwayId>;
export type IeResult = PilotResult<IePathwayId>;

const v = ie.values;
type Verdict = 'yes' | 'maybe' | 'no';

// Reckonable for naturalisation: residence in the State on a valid
// permission (s15(1)(c)) that s16A(1) and ISD's "Time That Does Not Count"
// (Stamp 2 and 2A, no permission, awaiting a protection decision) leave in.
// Stamp 1A mixes training with work, so the study exclusion (s16A(1)(b))
// may reach it; `other` is unknown (PD-114).
const RECKONABLE: IePermissionKind[] = [
  'stamp0',
  'stamp1',
  'stamp1-ict',
  'stamp1g-graduate',
  'stamp1g-spouse',
  'stamp1g-ict',
  'stamp3',
  'stamp4',
  'stamp4d',
  'stamp4-eufam',
  'stamp5',
];
const UNCERTAIN: IePermissionKind[] = ['stamp1a', 'other'];
// Counted towards Stamp 5 by SRC-097's list; Stamp 0, 1A, 4 EUFam, ICT
// Stamp 1 and ICT family 1G are listed as not counting; `other` is
// uncertain, the list being indicative (PD-114).
const WCATT: IePermissionKind[] = [
  'stamp1',
  'stamp1g-graduate',
  'stamp1g-spouse',
  'stamp3',
  'stamp4',
  'stamp4d',
  'stamp5',
];

export function evaluateIreland(req: IeRequest): IeResult {
  const L = textFor(req);
  const sim = req.simulationDate;
  const first = [
    addYears(
      sim,
      -(v.continuousYears.value + v.priorWindowYears.value.general),
    ),
    ...req.permissions.map((p) => p.from),
  ].sort()[0];
  // From the earliest permission, so that time before a gap can be added up.
  const days = new Days(addDays(first, -1), addYears(sim, HORIZON_YEARS));
  const flags = () => new Array<boolean>(days.count).fill(false);
  const byKind = Object.fromEntries(
    IE_PERMISSION_KINDS.map((k) => [k, flags()]),
  ) as Record<IePermissionKind, boolean[]>;
  // One permission at a time: one without an end date is renewed on time
  // until the next permission starts.
  for (const p of req.permissions) {
    const next = req.permissions
      .map((q) => q.from)
      .filter((from) => from > p.from)
      .sort()[0];
    days.mark(byKind[p.kind], p.from, p.to ?? (next && addDays(next, -1)));
  }
  // Departure and return days are not absences (s15C(5); ISD guide).
  const away = flags();
  for (const t of req.trips)
    days.mark(away, addDays(t.departed, 1), addDays(t.returned, -1));
  // Away from the island of Ireland (s15A): a trip spanning a whole period
  // of residence in Northern Ireland records a move within the island, so
  // its days there are not absences; any other trip, including one from
  // Northern Ireland, leaves the island (s15C(2)–(3)).
  const ni = byKind['ni-residence'];
  const niPeriods: [number, number][] = [];
  for (let i = 0; i < days.count; i++)
    if (ni[i] && (i === 0 || !ni[i - 1])) niPeriods.push([i, i]);
    else if (ni[i]) niPeriods[niPeriods.length - 1][1] = i;
  const offIsland = flags();
  for (const t of req.trips) {
    const move = niPeriods.some(
      ([a, b]) => days.index(t.departed) <= a && days.index(t.returned) > b,
    );
    for (
      let i = Math.max(0, days.index(t.departed) + 1);
      i <= Math.min(days.count - 1, days.index(t.returned) - 1);
      i++
    )
      if (!(move && ni[i])) offIsland[i] = true;
  }
  const holds = (kinds: IePermissionKind[]) => (i: number) =>
    kinds.some((k) => byKind[k][i]);
  const sums = {
    leap: days.sums((i) => days.date(i).endsWith('-02-29')),
  };
  const covered = (s: number[], from: IsoDate, to: IsoDate) =>
    days.total(s, from, to) === daysBetween(from, to) + 1;
  const firstDate = (ok: (d: IsoDate) => boolean): IsoDate | undefined => {
    for (let i = days.index(sim); i < days.count; i++) {
      const d = days.date(i);
      if (ok(d)) return d;
    }
    return undefined;
  };
  /**
   * The status and its date from the first date met on a sure reading and
   * the first on a wider one: unknown when the simulation date itself, or
   * only a later date, depends on the wider reading.
   */
  const outcome = (earliest?: IsoDate, possible?: IsoDate) => {
    const status: PilotStatus =
      earliest === sim
        ? 'MET'
        : possible === sim || (!earliest && possible)
          ? 'UNKNOWN'
          : earliest
            ? 'FUTURE'
            : 'NOT_MET';
    return {
      status,
      earliestDate:
        status === 'MET' || status === 'FUTURE' ? earliest : undefined,
    };
  };
  /**
   * For each day held on `flag`, the first day of the unbroken stretch it is
   * in; -1 when not held.
   */
  const stretchStart = (flag: (i: number) => boolean) => {
    const start: number[] = [];
    for (let i = 0; i < days.count; i++)
      start.push(!flag(i) ? -1 : i > 0 && start[i - 1] >= 0 ? start[i - 1] : i);
    return start;
  };
  const projection = L(
    '最早日期假设模拟日之后一直在爱尔兰（已录入的未来出境除外），没有到期日的许可都按时续期。',
    'Projected dates assume you stay in Ireland after the simulation date (apart from trips you entered) and that permissions without an end date are renewed on time.',
  );
  const has = (kinds: IePermissionKind[]) =>
    req.permissions.some((p) => kinds.includes(p.kind));
  const pathways: IePathway[] = [];
  const draft = v.draftBill.value;

  // ---------- Naturalisation, s15 and s15A ----------
  const naturalise = (
    id: 'IE-NATURALISATION' | 'IE-SPOUSE',
    notBefore?: IsoDate,
  ) => {
    const route = id === 'IE-SPOUSE' ? 'spouse' : 'general';
    // Living in Northern Ireland: residence in the island of Ireland for
    // s15A only, and no residence in the State even on an unexpired Irish
    // permission (s15(1)(c)).
    const inState = (kinds: IePermissionKind[]) => {
      const held = holds(kinds);
      return (i: number) => (ni[i] ? route === 'spouse' : held(i));
    };
    const reckonable = inState(RECKONABLE);
    const sure = days.sums(reckonable);
    const maybe = days.sums(inState([...RECKONABLE, ...UNCERTAIN]));
    const absent = route === 'spouse' ? offIsland : away;
    const absentSums = days.sums((i) => absent[i]);
    const sureHome = days.sums((i) => reckonable(i) && !absent[i]);
    const windowYears = v.priorWindowYears.value[route];
    const priorDays = v.priorResidenceDays.value[route];
    const year = v.continuousYears.value;
    const maxAway = v.absenceDays.value + v.exceptionalDays.value;
    const facts = (d: IsoDate) => {
      const from = addYears(d, -year);
      const priorFrom = addYears(from, -windowYears);
      const priorTo = addDays(from, -1);
      return {
        from,
        to: addDays(d, -1),
        priorFrom,
        priorTo,
        // The whole year and the application day on a reckonable permission.
        sure: covered(sure, from, d),
        maybe: covered(maybe, from, d),
        away: days.total(absentSums, from, addDays(d, -1)),
        // Strict: days abroad left out; wide: uncertain permissions in.
        strict: days.total(sureHome, priorFrom, priorTo),
        wide: days.total(maybe, priorFrom, priorTo),
        need: priorDays + days.total(sums.leap, priorFrom, priorTo),
      };
    };
    const verdict = (d: IsoDate): Verdict => {
      const f = facts(d);
      if (
        (notBefore && d < notBefore) ||
        !f.maybe ||
        f.away > maxAway ||
        f.wide < priorDays
      )
        return 'no';
      return f.sure && f.away <= v.absenceDays.value && f.strict >= f.need
        ? 'yes'
        : 'maybe';
    };
    const earliest = firstDate((d) => verdict(d) === 'yes');
    const possible = firstDate((d) => verdict(d) !== 'no');
    const f = facts(sim);
    const p = possible && facts(possible);
    const wider =
      p && (!earliest || possible < earliest)
        ? [
            p.away > v.absenceDays.value &&
              L(
                `那 ${year} 年缺席 ${p.away} 天，须部长认定例外情况（PD-111）`,
                `${p.away} days absent in that year, which needs the Minister to accept exceptional circumstances (PD-111)`,
              ),
            !p.sure &&
              L(
                '计入了待确认的许可（PD-114）',
                'counting permissions whose status is uncertain (PD-114)',
              ),
            p.strict < p.need &&
              L(
                `此前 ${windowYears} 年按较宽口径计（计入待确认的许可、不扣出境、闰日不另加天，PD-112、PD-113）`,
                `the ${windowYears} years before that counted widely (uncertain permissions in, days abroad not deducted, no extra day for 29 February; PD-112, PD-113)`,
              ),
          ].filter((s) => s !== false)
        : [];
    const spouse = id === 'IE-SPOUSE';
    const now = spouse
      ? L(
          `模拟日已满足配偶入籍的居住时间条件（${year} 年连续居住，此前 ${windowYears} 年内累计 ${priorDays} 天）。`,
          `You meet the residence requirements for naturalisation as a spouse or civil partner on the simulation date (${year} year’s continuous residence, and ${priorDays} days in the ${windowYears} years before it).`,
        )
      : L(
          `模拟日已满足入籍的居住时间条件（${year} 年连续居住，此前 ${windowYears} 年内累计 ${priorDays} 天）。`,
          `You meet the residence requirements for naturalisation on the simulation date (${year} year’s continuous residence, and ${priorDays} days in the ${windowYears} years before it).`,
        );
    return {
      ...outcome(earliest, possible),
      summary:
        (earliest === sim
          ? now
          : earliest
            ? L(
                `满足居住时间条件的最早递交日是 ${earliest}。`,
                `The earliest application date that meets the residence requirements is ${earliest}.`,
              )
            : possible
              ? L(
                  '按严格读法，10 年内达不到居住时间条件。',
                  'On a strict reading you will not meet the residence requirements within 10 years.',
                )
              : L(
                  '按现有记录，10 年内达不到居住时间条件。',
                  'With your record you will not meet the residence requirements within 10 years.',
                )) +
        (wider.length
          ? L(
              `按较宽读法最早 ${possible}：${wider.join('；')}。`,
              ` On a wider reading it could be ${possible}: ${wider.join('; ')}.`,
            )
          : '') +
        (spouse
          ? L(
              `另：2026 年的修法草案（General Scheme，尚在立法前审查、未成为法律）拟改为婚姻满 ${draft.spouseMarriageYears} 年、${draft.spouseContinuousYears} 年连续居住加此前 ${draft.spouseWindowYears} 年内累计 ${draft.spouseTotalYears} 年；本结果按现行法（PD-119）。`,
              ` Note: the 2026 draft bill (General Scheme, still at pre-legislative scrutiny and not law) would require ${draft.spouseMarriageYears} years of marriage, ${draft.spouseContinuousYears} years’ continuous residence and ${draft.spouseTotalYears} years in the ${draft.spouseWindowYears} years before that; this result follows the current law (PD-119).`,
            )
          : L(
              `另：2026 年的修法草案（General Scheme，尚在立法前审查、未成为法律）拟改为 ${draft.continuousYears} 年连续居住加此前 ${draft.windowYears} 年内累计 ${draft.totalYears} 年；本结果按现行法（PD-119）。`,
              ` Note: the 2026 draft bill (General Scheme, still at pre-legislative scrutiny and not law) would require ${draft.continuousYears} years’ continuous residence and ${draft.totalYears} years in the ${draft.windowYears} years before that; this result follows the current law (PD-119).`,
            )),
      checks: [
        {
          text: L(
            `递交前 ${year} 年（${f.from} 至 ${f.to}）每天都持计入入籍的许可${spouse ? '或在北爱尔兰合法居住' : ''}，递交当天也是（学生 Stamp 2／2A、等待国际保护决定的期间与许可之间的空档不计）`,
            `A reckonable permission${spouse ? ' or lawful residence in Northern Ireland' : ''} on every day of the year before applying (${f.from} to ${f.to}) and on the application day (student Stamp 2 or 2A, time waiting for a protection decision and gaps between permissions do not count)`,
          ),
          met: f.sure ? true : f.maybe ? undefined : false,
          sources: [
            v.continuousYears.sources[spouse ? 1 : 0],
            { srcId: 'SRC-091', locator: 's16A(1) (p26)' },
            { srcId: 'SRC-093', locator: 's295(b) (s16A(1)(d))' },
            {
              srcId: 'SRC-095',
              locator:
                'Guide: Time That Does Not Count; Permissions that do not count',
            },
          ],
        },
        {
          text: L(
            `这 ${year} 年里不在境内 ${f.away} 天（出入境当天不算；${v.absenceDays.value} 天以内满足，再多 ${v.exceptionalDays.value} 天以内须部长认定例外情况，超过 ${maxAway} 天不符合）`,
            `${f.away} days absent in that year (departure and return days not included; up to ${v.absenceDays.value} days is fine, up to ${v.exceptionalDays.value} more needs the Minister to accept exceptional circumstances, over ${maxAway} does not qualify)`,
          ),
          met:
            f.away <= v.absenceDays.value
              ? true
              : f.away <= maxAway
                ? undefined
                : false,
          sources: [...v.absenceDays.sources, v.exceptionalDays.sources[0]],
        },
        {
          text: L(
            `此前 ${windowYears} 年（${f.priorFrom} 至 ${f.priorTo}）持计入许可且在境内 ${f.strict} 天，须 ${priorDays} 天、期间每个 2 月 29 日另加 1 天，共 ${f.need} 天（较宽口径 ${f.wide} 天）`,
            `${f.strict} days on a reckonable permission and in Ireland in the ${windowYears} years before that (${f.priorFrom} to ${f.priorTo}); ${priorDays} days are needed plus one for each 29 February in them, ${f.need} in all (${f.wide} on the wide reading)`,
          ),
          met:
            f.strict >= f.need ? true : f.wide >= priorDays ? undefined : false,
          sources: [
            v.priorWindowYears.sources[spouse ? 1 : 0],
            v.priorResidenceDays.sources[spouse ? 2 : 1],
          ],
        },
      ],
      assumptions: [
        L(
          `${year} 年从递交日往回数到上一年的同一日，不含递交当天（ISD 示例：2025-11-11 递交，看 2024-11-11 至 2025-11-10）；递交当天须持有效许可。"递交日"具体指哪一天法条没有定义（PD-110）。官方计算器把递交当天也算 1 天，本试点不这样算。`,
          'The year is counted back from the application date to the same date a year earlier, not including the application day (ISD example: applying on 2025-11-11, check 2024-11-11 to 2025-11-10); you need a valid permission on the application day. The law does not define which day is the "date of the application" (PD-110). The official calculator also counts the application day; this pilot does not.',
        ),
        L(
          '出入境当天不算缺席（s15C(5)："day" 不含不足一日；ISD 指南）。许可到期后到续期前的空档不计入，连续一年因此中断（ISD 指南）。凡在境内持有效许可、不属 s16A(1) 与 ISD"Time That Does Not Count"所列情形（学生 Stamp 2／2A、无许可、等待保护决定）的居住都计入，包括 Stamp 4 EUFam、4D 与 ICT 许可持有人配偶的 1G；Stamp 1A 兼有培训，可能落入学习类排除，与"其他"一样待确认（PD-114）。住在北爱尔兰的日子不算在国家居住，即使爱尔兰许可尚未到期。此前几年里的出境是否减少"累计居住"法条和指南都没写：严格读法扣除，较宽读法不扣（PD-112）；闰日按期间内的 2 月 29 日各加 1 天，较宽读法不加（PD-113）。',
          'Departure and return days are not absences (s15C(5): a "day" does not include part of a day; ISD guide). A gap after a permission expires and before it is renewed does not count and breaks the continuous year (ISD guide). Residence in the State on any valid permission that s16A(1) and ISD’s "Time That Does Not Count" (student Stamp 2 or 2A, no permission, awaiting a protection decision) leave in counts, Stamp 4 EUFam, 4D and 1G for partners of ICT permit holders included; Stamp 1A combines training with work and may fall under the study exclusion, so like "other" it is uncertain (PD-114). Days living in Northern Ireland are not residence in the State, even on an unexpired Irish permission. Whether trips abroad reduce the "total residence" in the earlier years is not stated: the strict reading deducts them, the wide one does not (PD-112); the strict reading adds a day for each 29 February in the period, the wide one does not (PD-113).',
        ),
        ...(spouse
          ? [
              L(
                '配偶路径按"爱尔兰岛"（含北爱尔兰）计算：录入为"在北爱尔兰合法居住"的期间计入（只用于配偶路径）。出境记录覆盖整段北爱尔兰居住的，视为岛内搬迁，这段时间不算缺席；住在北爱尔兰期间离开爱尔兰岛的出行照常算缺席（s15C(2)–(3)）；只是去北爱尔兰的短途行程也按缺席计（较严，PD-115）。',
                'The spouse route counts residence in the island of Ireland (Northern Ireland included): periods entered as "lawful residence in Northern Ireland" count (for this route only). A trip spanning a whole period of residence in Northern Ireland is taken as a move within the island, so that time is not an absence; trips off the island while living in Northern Ireland are absences as usual (s15C(2)–(3)); short visits to Northern Ireland also count as absences (stricter, PD-115).',
              ),
            ]
          : []),
        projection,
      ],
      pendingDetails: [
        'PD-110',
        'PD-111',
        'PD-112',
        'PD-113',
        ...(has(UNCERTAIN) ? ['PD-114'] : []),
        ...(spouse ? ['PD-115'] : []),
        'PD-119',
      ],
    };
  };

  pathways.push({
    id: 'IE-NATURALISATION',
    title: L(
      '入籍（naturalisation，1956 年法 s15）',
      'Naturalisation (1956 Act s15)',
    ),
    ...naturalise('IE-NATURALISATION'),
    notChecked: [
      L(
        '成年、良好品格、继续居住的意愿、效忠声明与入籍仪式（s15(1)(a)、(b)、(d)、(e)），以及部长的绝对裁量',
        'Full age, good character, intention to keep living in the State, the declaration of fidelity and the citizenship ceremony (s15(1)(a), (b), (d), (e)), and the Minister’s absolute discretion',
      ),
      L(
        '各年居住证明材料、费用；难民与无国籍人（s16，部长裁量与政策年限）和在境内出生的未成年人（s15B）不在范围内',
        'Proof of residence for each year and fees; refugees and stateless people (s16, ministerial discretion and policy periods) and minors born in the State (s15B) are out of scope',
      ),
    ],
  });

  // ---------- Spouse or civil partner, s15A ----------
  {
    const title = L(
      '爱尔兰公民的配偶或民事伴侣入籍（s15A）',
      'Naturalisation as the spouse or civil partner of an Irish citizen (s15A)',
    );
    if (!req.marriedOn) {
      pathways.push({
        id: 'IE-SPOUSE',
        title,
        status: 'NOT_APPLICABLE',
        summary: L(
          '没有填写与爱尔兰公民结婚或登记民事伴侣的日期。',
          'You did not enter a date of marriage or civil partnership with an Irish citizen.',
        ),
        checks: [],
        notChecked: [],
        assumptions: [],
      });
    } else {
      const since = afterYears(req.marriedOn, v.marriageYears.value);
      const result = naturalise('IE-SPOUSE', since);
      pathways.push({
        id: 'IE-SPOUSE',
        title,
        ...result,
        checks: [
          {
            text: L(
              `与爱尔兰公民结婚或登记民事伴侣满 ${v.marriageYears.value} 年（${since} 起）`,
              `Married to, or in a civil partnership with, an Irish citizen for ${v.marriageYears.value} years (from ${since} on)`,
            ),
            met: sim >= since,
            sources: v.marriageYears.sources,
          },
          ...result.checks,
        ],
        notChecked: [
          L(
            '同住并由配偶提交声明、婚姻在爱尔兰法下有效存续（s15A(1)(c)、(d)），成年、良好品格、继续居住的意愿与入籍仪式',
            'Living together with your spouse’s affidavit, and a marriage recognised as subsisting (s15A(1)(c), (d)); full age, good character, intention to keep living in the island of Ireland and the ceremony',
          ),
          L(
            '随配偶在公共服务岗位外派期间的境外居住（s15A(4)）',
            'Residence abroad with a spouse in the public service (s15A(4))',
          ),
        ],
      });
    }
  }

  // ---------- Stamp 4 upgrade and Stamp 5 (ISD policy) ----------
  {
    const route = req.stamp4Route;
    const policy = L(
      '这是司法部移民服务署（ISD）的行政政策，不是法条，以 ISD 页面为准。',
      'This is Immigration Service Delivery (ISD) policy, not statute; ISD’s pages are what count.',
    );
    if (route === 'none') {
      pathways.push({
        id: 'IE-STAMP4',
        title: L('Stamp 4／Stamp 5', 'Stamp 4 or Stamp 5'),
        status: 'NOT_APPLICABLE',
        summary: L(
          '你选择了不计算 Stamp 4 升级或 Stamp 5。',
          'You chose not to work out a Stamp 4 upgrade or Stamp 5.',
        ),
        checks: [],
        notChecked: [],
        assumptions: [],
      });
    } else if (route === 'csep' || route === 'gep') {
      const months = v.stamp4Months.value[route];
      const title = L(
        'Stamp 4 升级（雇佣许可、Hosting Agreement 持有人）',
        'Stamp 4 upgrade (employment permit and Hosting Agreement holders)',
      );
      const start = req.employmentStart;
      if (!start) {
        pathways.push({
          id: 'IE-STAMP4',
          title,
          status: 'UNKNOWN',
          summary: L(
            '请填写在爱尔兰凭该许可开始工作的日期，才能算出升级时间。',
            'Enter the date you started work in Ireland on that permit to work out the upgrade date.',
          ),
          checks: [],
          notChecked: [],
          assumptions: [],
        });
      } else {
        // The permit for this route: Stamp 1 or 1H, and ICT for the
        // 57-month group.
        const permit = holds(
          route === 'csep' ? ['stamp1'] : ['stamp1', 'stamp1-ict'],
        );
        // Work started under another permission counts until the move to
        // Stamp 1, from the employment permit's validity (SRC-096).
        const lawful = holds(
          IE_PERMISSION_KINDS.filter(
            (k) => k !== 'ni-residence' && k !== 'protection-applicant',
          ),
        );
        const from0 = Math.max(0, days.index(start));
        let moved = from0;
        while (moved < days.count && !permit(moved)) moved++;
        const held = (i: number) =>
          permit(i) || (i >= from0 && i < moved && lawful(i));
        const heldSums = days.sums(held);
        const stretch = stretchStart(held);
        // Calendar days in the months from the start of work.
        const span = daysBetween(start, addMonths(start, months));
        /** Counted from the start of work, or from the end of a later gap in the permit. */
        const countFrom = (d: IsoDate) => {
          const s = stretch[days.index(d)];
          return s < 0
            ? undefined
            : start > days.date(s)
              ? start
              : days.date(s);
        };
        const verdict = (d: IsoDate): Verdict => {
          const from = countFrom(d);
          // Renewing as Stamp 4: the permit is held on the application day.
          if (!from || !permit(days.index(d))) return 'no';
          // From the 29th–31st into a shorter month: that month's last day
          // or the 1st of the next (PD-116).
          const end = addMonths(from, months);
          if (d >= (end.slice(8) === from.slice(8) ? end : addDays(end, 1)))
            return 'yes';
          // A month-end start, or the time on both sides of a gap added up.
          return d >= end ||
            (d > start && days.total(heldSums, start, addDays(d, -1)) >= span)
            ? 'maybe'
            : 'no';
        };
        const earliest = firstDate((d) => verdict(d) === 'yes');
        const possible = firstDate((d) => verdict(d) !== 'no');
        const missing =
          sim > start
            ? daysBetween(start, sim) -
              days.total(heldSums, start, addDays(sim, -1))
            : 0;
        const now = verdict(sim);
        pathways.push({
          id: 'IE-STAMP4',
          title,
          ...outcome(earliest, possible),
          summary:
            (earliest === sim
              ? L(
                  `模拟日已满 ${months} 个月；何时能递交续为 Stamp 4，以 ISD 的续期安排为准。`,
                  `You have completed ${months} months on the simulation date; when you can apply to renew as Stamp 4 follows ISD’s renewal arrangements.`,
                )
              : earliest
                ? L(
                    `满 ${months} 个月的最早日期是 ${earliest}。`,
                    `The earliest date you complete ${months} months is ${earliest}.`,
                  )
                : L(
                    `按现有记录，10 年内达不到凭该许可受雇满 ${months} 个月。`,
                    `With your record you will not complete ${months} months on that permit within 10 years.`,
                  )) +
            (possible && possible !== earliest
              ? L(
                  countFrom(possible) === start
                    ? `若从月末起算按当月最后一天届满，最早 ${possible}（PD-116）。`
                    : `若许可空档前后的受雇时间可以累加，最早 ${possible}（PD-116）。`,
                  countFrom(possible) === start
                    ? ` If months from a month-end start end on the last day of the month, it could be ${possible} (PD-116).`
                    : ` If the time on both sides of a gap in the permit can be added up, it could be ${possible} (PD-116).`,
                )
              : '') +
            (missing > 0
              ? L(
                  `自 ${start} 起有 ${missing} 天没有该许可，这些天不计入。`,
                  ` Since ${start} there are ${missing} days without that permit, which do not count.`,
                )
              : '') +
            L(policy, ` ${policy}`),
          checks: [
            {
              text:
                route === 'csep'
                  ? L(
                      `凭 Critical Skills Employment Permit、研究员 Hosting Agreement 或 NCHD 医生的多地点 General Employment Permit（Stamp 1 或 1H），自 ${start} 开始受雇满 ${months} 个月，其间每天都持该许可（转为 Stamp 1 之前凭其他合法许可工作的日子也算，如学生许可、毕业生 1G；庇护申请期间与北爱尔兰居住不算），递交当天持该许可`,
                      `${months} months from starting work on ${start} on a Critical Skills Employment Permit, a researcher’s Hosting Agreement or a Multi-Site General Employment Permit as a non-consultant hospital doctor (Stamp 1 or 1H), holding it every day since (before moving to Stamp 1, days worked on another valid permission such as a student permission or graduate 1G also count; not time awaiting a protection decision or living in Northern Ireland) and on the application day`,
                    )
                  : L(
                      `凭 General Employment Permit 或公司内调（ICT）的 Stamp 1，自 ${start} 开始受雇满 ${months} 个月，其间每天都持该许可（转为 Stamp 1 之前凭其他合法许可工作的日子也算，如学生许可、毕业生 1G；庇护申请期间与北爱尔兰居住不算），递交当天持该许可`,
                      `${months} months from starting work on ${start} on a General Employment Permit or an Intra-Company Transfer (Stamp 1), holding it every day since (before moving to Stamp 1, days worked on another valid permission such as a student permission or graduate 1G also count; not time awaiting a protection decision or living in Northern Ireland) and on the application day`,
                    ),
              met: now === 'yes' ? true : now === 'maybe' ? undefined : false,
              sources: [
                ...v.stamp4Months.sources,
                {
                  srcId: 'SRC-094',
                  locator: 's18(h) (p10); Schedule Part 1 "month" (p14)',
                },
              ],
            },
          ],
          notChecked: [
            L(
              '仍凭该许可受雇，以及续期所需文件',
              'Still being employed on that permit, and the documents for renewal',
            ),
          ],
          assumptions: [
            L(
              `"满 ${months} 个月"按日历月计、开始受雇当天算第一天（Interpretation Act 2005 s18(h)、附表"month"），开始日期以 Revenue 的 Employment Detail Summary 为准；先持其他许可、后转 Stamp 1 的，按该雇佣许可的有效期起算（ISD）。`,
              `"${months} months" are calendar months with the first day of work counted (Interpretation Act 2005 s18(h) and Schedule "month"); the start date is the one in Revenue’s Employment Detail Summary, and if you moved to Stamp 1 from another permission it runs from the validity of that employment permit (ISD).`,
            ),
            L(
              '只计持该许可（Stamp 1 或 1H，57 个月一类含 ICT）的日子，转 Stamp 1 之前凭其他许可工作的日子也计入（ISD 按雇佣许可的有效期起算），递交当天须持该许可；开始工作后许可有空档的，确定日期从空档后重新起算，空档前后能否累加没有写明，累加后的日期另列（PD-116）。21 个月与 57 个月两类不可互换：GEP、ICT 的受雇时间不计入 21 个月（ISD）；换雇主或两类混合时怎样计没有写明。',
              'Only days holding that permit (Stamp 1 or 1H, with ICT in the 57-month group) count, plus days worked on another permission before moving to Stamp 1 (ISD counts from the employment permit’s validity), and you hold the permit on the application day. After a gap in the permit since starting work, the definite date counts again from the end of the gap; whether time on both sides can be added up is not stated, so that date is shown separately (PD-116). The 21-month and 57-month groups are not interchangeable: time on a GEP or ICT does not count towards 21 months (ISD); a change of employer or a mixed history is not covered.',
            ),
            projection,
          ],
          pendingDetails: ['PD-116'],
        });
      }
    } else if (route === 'spouse-1g') {
      const years = v.spouse1gYears.value;
      const held = holds(['stamp1g-spouse', 'stamp1g-ict']);
      const heldSums = days.sums(held);
      const verdict = (d: IsoDate): Verdict => {
        const from = addYears(d, -years);
        if (covered(heldSums, from, d)) return 'yes';
        // Time on both sides of a gap added up (PD-118).
        return held(days.index(d)) &&
          days.total(heldSums, days.date(0), addDays(d, -1)) >=
            daysBetween(from, d)
          ? 'maybe'
          : 'no';
      };
      const earliest = firstDate((d) => verdict(d) === 'yes');
      const possible = firstDate((d) => verdict(d) !== 'no');
      const now = verdict(sim);
      pathways.push({
        id: 'IE-STAMP4',
        title: L(
          'Stamp 1G 配偶或伴侣转 Stamp 4',
          'Stamp 4 for spouses and partners on Stamp 1G',
        ),
        ...outcome(earliest, possible),
        summary:
          (earliest === sim
            ? L(
                `模拟日已作为配偶或伴侣连续持 Stamp 1G 满 ${years} 年；ISD 要求满期后在下一次网上续期时申请 Stamp 4。`,
                `You have held Stamp 1G as a spouse or partner for ${years} years on the simulation date; ISD has you apply for Stamp 4 at your next online renewal after that.`,
              )
            : earliest
              ? L(
                  `作为配偶或伴侣连续持 Stamp 1G 满 ${years} 年的最早日期是 ${earliest}；ISD 要求满期后在下一次网上续期时申请 Stamp 4。`,
                  `The earliest date you will have held Stamp 1G as a spouse or partner for ${years} years is ${earliest}; ISD has you apply for Stamp 4 at your next online renewal after that.`,
                )
              : L(
                  `按现有记录，10 年内达不到作为配偶或伴侣连续持 Stamp 1G ${years} 年。`,
                  `With your record you will not hold Stamp 1G as a spouse or partner for ${years} years in a row within 10 years.`,
                )) +
          (possible && possible !== earliest
            ? L(
                `若空档前后的 Stamp 1G 时间可以累加，最早 ${possible}（PD-118）。`,
                ` If Stamp 1G time on both sides of a gap can be added up, it could be ${possible} (PD-118).`,
              )
            : '') +
          L(policy, ` ${policy}`),
        checks: [
          {
            text: L(
              `${addYears(sim, -years)} 起每天都作为雇佣许可持有人（CSEP、GEP、ICT 等）或研究员的配偶、伴侣持 Stamp 1G，递交当天仍持有（毕业生计划的 1G 不计）`,
              `Stamp 1G as the spouse or partner of an employment permit holder (CSEP, GEP, ICT and so on) or researcher on every day since ${addYears(sim, -years)} and on the application day (graduate programme 1G does not count)`,
            ),
            met: now === 'yes' ? true : now === 'maybe' ? undefined : false,
            sources: v.spouse1gYears.sources,
          },
        ],
        notChecked: [
          L(
            '配偶或伴侣仍持雇佣许可或 Hosting Agreement，以及按家庭团聚政策获批',
            'Your spouse or partner still holding an employment permit or Hosting Agreement, and your grant under the family reunification policy',
          ),
        ],
        assumptions: [
          L(
            '"5 年"只计配偶、伴侣类的 Stamp 1G（ISD 把它与毕业生计划的 1G 分为两类；2024-05-15 起 GEP、ICT 持有人的配偶、伴侣也给 1G，同样满 5 年可转 Stamp 4），按连续持有计；此前以 Stamp 3 居住的时间不计（ISD 家庭团聚 FAQ 第 30 问写的是在家庭团聚许可下满 5 年，可能包括这段时间，本试点从严，日期可能偏晚），许可之间有空档时，空档前后能否累加没写，累加后的日期另列（PD-118）。',
            '"5 years" counts only Stamp 1G as a spouse or partner (ISD lists it apart from graduate programme 1G; since 2024-05-15 spouses and partners of GEP and ICT holders also get 1G with the same 5-year point), held without a break; earlier time on Stamp 3 does not count (ISD’s family reunification FAQ 30 speaks of 5 years on a family reunification permission, which may include it; this pilot is stricter, so its date may be later), and after a gap between permissions, whether time on both sides can be added up is not stated, so that date is shown separately (PD-118).',
          ),
          projection,
        ],
        pendingDetails: ['PD-118'],
      });
    } else {
      const months = v.wcattMonths.value;
      // Legal residence in the State: not while living in Northern Ireland.
      const counts = holds(WCATT);
      const uncertain = holds([...WCATT, 'other']);
      const sure = days.sums((i) => !ni[i] && counts(i));
      const wide = (i: number) => !ni[i] && uncertain(i);
      const wideSums = days.sums(wide);
      const verdict = (d: IsoDate): Verdict => {
        const from = addMonths(d, -months);
        if (covered(sure, from, d)) return 'yes';
        // Uncertain permissions in, or time on both sides of a gap added up
        // (PD-114, PD-118).
        return wide(days.index(d)) &&
          days.total(wideSums, days.date(0), addDays(d, -1)) >=
            daysBetween(from, d)
          ? 'maybe'
          : 'no';
      };
      const earliest = firstDate((d) => verdict(d) === 'yes');
      const possible = firstDate((d) => verdict(d) !== 'no');
      const from = addMonths(sim, -months);
      const now = verdict(sim);
      pathways.push({
        id: 'IE-STAMP4',
        title: L(
          'Stamp 5（without condition as to time）',
          'Stamp 5 (without condition as to time)',
        ),
        ...outcome(earliest, possible),
        summary:
          (earliest === sim
            ? L(
                `模拟日已有连续 ${months} 个月的合法居留，可以申请 Stamp 5。`,
                `You have ${months} months of legal residence without a break on the simulation date and can apply for Stamp 5.`,
              )
            : earliest
              ? L(
                  `连续 ${months} 个月合法居留、可申请 Stamp 5 的最早日期是 ${earliest}。`,
                  `The earliest date with ${months} months of legal residence without a break to apply for Stamp 5 is ${earliest}.`,
                )
              : L(
                  `按现有记录，10 年内达不到连续 ${months} 个月的合法居留。`,
                  `With your record you will not have ${months} months of legal residence without a break within 10 years.`,
                )) +
          (possible && possible !== earliest
            ? L(
                `若"其他"类许可计入、或空档前后的居留可以累加，最早 ${possible}（PD-114、PD-118）。`,
                ` Counting "other" permissions, or adding up residence on both sides of a gap, it could be ${possible} (PD-114, PD-118).`,
              )
            : '') +
          L(policy, ` ${policy}`),
        checks: [
          {
            text: L(
              `递交前 ${months} 个月（${from} 起）每天都持可计入 Stamp 5 的许可，递交当天仍持有（计入 Stamp 1、1H、1G、3、4、4D、4S；不计 Stamp 0、1A、4 EUFam、ICT 的 Stamp 1、ICT 家属的 1G 与学生许可）`,
              `A permission that counts for Stamp 5 on every day of the ${months} months before applying (from ${from}) and on the application day (Stamp 1, 1H, 1G, 3, 4, 4D and 4S count; Stamp 0, 1A, 4 EUFam, ICT Stamp 1, ICT family 1G and student permissions do not)`,
            ),
            met: now === 'yes' ? true : now === 'maybe' ? undefined : false,
            sources: v.wcattMonths.sources,
          },
        ],
        notChecked: [
          L(
            '良好品格、没有成为国家负担、遵守以往许可的条件，申请时仍在爱尔兰合法居留',
            'Good character, not being a burden on the State, having kept to the conditions of earlier permissions, and living legally in Ireland when you apply',
          ),
        ],
        assumptions: [
          L(
            `${months} 个月按连续持有计，住在北爱尔兰的日子不算在国家合法居留；许可之间有空档时，空档前后能否累加没写，累加后的日期另列（PD-118）。"其他"类许可是否计入待确认（PD-114）。`,
            `The ${months} months are taken as held without a break, and days living in Northern Ireland are not legal residence in the State; after a gap, whether residence on both sides can be added up is not stated, so that date is shown separately (PD-118). Whether "other" permissions count is uncertain (PD-114).`,
          ),
          L(
            `"每年在境外不超过 ${v.wcattAbsenceMonths.value} 个月"是获批后 Stamp 5 的居住条件，不用于判断能否申请；申请前的出境是否减少 ${months} 个月没有写，本试点不扣除（PD-117）。`,
            `"No more than ${v.wcattAbsenceMonths.value} months abroad in a year" is a condition of Stamp 5 once granted, not of applying for it; whether trips before applying reduce the ${months} months is not stated, and this pilot does not deduct them (PD-117).`,
          ),
          projection,
        ],
        pendingDetails: [
          ...(has(['other']) ? ['PD-114'] : []),
          'PD-117',
          'PD-118',
        ],
      });
    }
  }

  return { policyAsOf: ie.asOf, pathways };
}
