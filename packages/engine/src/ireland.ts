import { ireland2026_11 as ie } from '@uk-immigration/policy-data';
import { addDays, addMonths, addYears, daysBetween } from './dates';
import { Days, HORIZON_YEARS, afterYears, monthSpan } from './pilot';
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
 * Agreement or a business; stamp1g: graduate programme, or spouse or partner
 * of a CSEP holder or researcher; student: Stamp 2 or 2A;
 * protection-applicant: waiting for an international protection decision;
 * other: Stamp 1A, 4D, 4 EUFam, temporary protection and the rest.
 */
export const IE_PERMISSION_KINDS = [
  'stamp1',
  'stamp1-ict',
  'stamp1g',
  'stamp0',
  'stamp3',
  'stamp4',
  'stamp5',
  'student',
  'protection-applicant',
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

// Reckonable for naturalisation (ISD guide); study and protection applicants
// are excluded by s16A(1)(b)–(d); `other` is uncertain (PD-114).
const RECKONABLE: IePermissionKind[] = [
  'stamp0',
  'stamp1',
  'stamp1-ict',
  'stamp1g',
  'stamp3',
  'stamp4',
  'stamp5',
];
// Counted towards Stamp 5 (SRC-097): not ICT Stamp 1, Stamp 0 or study.
const WCATT: IePermissionKind[] = [
  'stamp1',
  'stamp1g',
  'stamp3',
  'stamp4',
  'stamp5',
];

export function evaluateIreland(req: IeRequest): IeResult {
  const L = textFor(req);
  const sim = req.simulationDate;
  const days = new Days(
    addDays(
      addYears(
        sim,
        -(v.continuousYears.value + v.priorWindowYears.value.general),
      ),
      -1,
    ),
    addYears(sim, HORIZON_YEARS),
  );
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
  const holds = (kinds: IePermissionKind[]) => (i: number) =>
    kinds.some((k) => byKind[k][i]);
  const reckonable = holds(RECKONABLE);
  const sums = {
    sure: days.sums(reckonable),
    maybe: days.sums(holds([...RECKONABLE, 'other'])),
    sureHome: days.sums((i) => reckonable(i) && !away[i]),
    away: days.sums((i) => away[i]),
    leap: days.sums((i) => days.date(i).endsWith('-02-29')),
    stamp1g: days.sums(holds(['stamp1g'])),
    wcattSure: days.sums(holds(WCATT)),
    wcattMaybe: days.sums(holds([...WCATT, 'other'])),
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
  const statusOf = (earliest?: IsoDate, possible?: IsoDate): PilotStatus =>
    earliest
      ? earliest === sim
        ? 'MET'
        : 'FUTURE'
      : possible
        ? 'UNKNOWN'
        : 'NOT_MET';
  const projection = L(
    '最早日期假设模拟日之后一直在爱尔兰（已录入的未来出境除外），没有到期日的许可都按时续期。',
    'Projected dates assume you stay in Ireland after the simulation date (apart from trips you entered) and that permissions without an end date are renewed on time.',
  );
  const hasOther = req.permissions.some((p) => p.kind === 'other');
  const pathways: IePathway[] = [];
  const draft = v.draftBill.value;

  // ---------- Naturalisation, s15 and s15A ----------
  const naturalise = (
    id: 'IE-NATURALISATION' | 'IE-SPOUSE',
    notBefore?: IsoDate,
  ) => {
    const route = id === 'IE-SPOUSE' ? 'spouse' : 'general';
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
        sure: covered(sums.sure, from, d),
        maybe: covered(sums.maybe, from, d),
        away: days.total(sums.away, from, addDays(d, -1)),
        // Strict: days abroad left out; wide: uncertain permissions in.
        strict: days.total(sums.sureHome, priorFrom, priorTo),
        wide: days.total(sums.maybe, priorFrom, priorTo),
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
      status: statusOf(earliest, possible),
      earliestDate: earliest,
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
            `递交前 ${year} 年（${f.from} 至 ${f.to}）每天都持计入入籍的许可，递交当天也持有（学生 Stamp 2／2A、等待国际保护决定的期间与许可之间的空档不计）`,
            `A reckonable permission on every day of the year before applying (${f.from} to ${f.to}) and on the application day (student Stamp 2 or 2A, time waiting for a protection decision and gaps between permissions do not count)`,
          ),
          met: f.sure ? true : f.maybe ? undefined : false,
          sources: [
            v.continuousYears.sources[spouse ? 1 : 0],
            { srcId: 'SRC-091', locator: 's16A(1) (p26)' },
            { srcId: 'SRC-093', locator: 's295(b) (s16A(1)(d))' },
            {
              srcId: 'SRC-095',
              locator: 'Guide: Permissions that do not count',
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
          '出入境当天不算缺席（s15C(5)："day" 不含不足一日；ISD 指南）。许可到期后到续期前的空档不计入，连续一年因此中断（ISD 指南）。此前几年里的出境是否减少"累计居住"法条和指南都没写：严格读法扣除，较宽读法不扣（PD-112）；闰日按期间内的 2 月 29 日各加 1 天，较宽读法不加（PD-113）。',
          'Departure and return days are not absences (s15C(5): a "day" does not include part of a day; ISD guide). A gap after a permission expires and before it is renewed does not count and breaks the continuous year (ISD guide). Whether trips abroad reduce the "total residence" in the earlier years is not stated: the strict reading deducts them, the wide one does not (PD-112); the strict reading adds a day for each 29 February in the period, the wide one does not (PD-113).',
        ),
        ...(spouse
          ? [
              L(
                '配偶路径按"爱尔兰岛"（含北爱尔兰）计算，本试点只按你录入的爱尔兰许可与出境记录计算：在北爱尔兰居住的时间不计入、去北爱尔兰按出境计（较严，PD-115）。',
                'The spouse route counts residence in the island of Ireland (Northern Ireland included); this pilot only uses the Irish permissions and trips you entered, so time living in Northern Ireland is not counted and trips there count as absences (stricter, PD-115).',
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
        ...(hasOther ? ['PD-114'] : []),
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
        // From the 29th–31st into a shorter month: the last day of that
        // month or the 1st of the next (PD-116).
        const possible = addMonths(start, months);
        const sure =
          possible.slice(8) === start.slice(8)
            ? possible
            : addDays(possible, 1);
        const status: PilotStatus =
          sim >= sure ? 'MET' : sim >= possible ? 'UNKNOWN' : 'FUTURE';
        pathways.push({
          id: 'IE-STAMP4',
          title,
          status,
          earliestDate:
            status === 'MET' ? sim : status === 'FUTURE' ? sure : undefined,
          summary:
            (status === 'MET'
              ? L(
                  `模拟日已满 ${months} 个月，可以申请把许可续为 Stamp 4。`,
                  `You have completed ${months} months on the simulation date and can renew your permission as Stamp 4.`,
                )
              : status === 'FUTURE'
                ? L(
                    `满 ${months} 个月、可申请 Stamp 4 的最早日期是 ${sure}。`,
                    `The earliest date you complete ${months} months and can apply for Stamp 4 is ${sure}.`,
                  )
                : L(
                    `从月末起算的 ${months} 个月在 ${possible} 还是 ${sure} 届满，ISD 没有说明。`,
                    `ISD does not say whether ${months} months from a month-end start end on ${possible} or ${sure}.`,
                  )) +
            (status === 'FUTURE' && possible < sure
              ? L(
                  `从月末起算，也可能是 ${possible}（PD-116）。`,
                  ` Counting from a month-end start, it may be ${possible} (PD-116).`,
                )
              : '') +
            L(policy, ` ${policy}`),
          checks: [
            {
              text:
                route === 'csep'
                  ? L(
                      `凭 Critical Skills Employment Permit、研究员 Hosting Agreement 或 NCHD 医生的多地点 General Employment Permit，自 ${start} 开始受雇满 ${months} 个月（${sure}）`,
                      `${months} months from starting work on ${start} on a Critical Skills Employment Permit, a researcher’s Hosting Agreement or a Multi-Site General Employment Permit as a non-consultant hospital doctor (${sure})`,
                    )
                  : L(
                      `凭 General Employment Permit 或公司内调（ICT）自 ${start} 开始受雇满 ${months} 个月（${sure}）`,
                      `${months} months from starting work on ${start} on a General Employment Permit or an Intra-Company Transfer (${sure})`,
                    ),
              met:
                status === 'MET'
                  ? true
                  : status === 'UNKNOWN'
                    ? undefined
                    : false,
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
              '仍凭该许可受雇、持有效的 Stamp 1 或 1H，以及续期所需文件',
              'Still being employed on that permit with a valid Stamp 1 or 1H, and the documents for renewal',
            ),
          ],
          assumptions: [
            L(
              `"满 ${months} 个月"按日历月计、开始受雇当天算第一天（Interpretation Act 2005 s18(h)、附表"month"），开始日期以 Revenue 的 Employment Detail Summary 为准；先持其他许可、后转 Stamp 1 的，按该雇佣许可的有效期起算（ISD）。`,
              `"${months} months" are calendar months with the first day of work counted (Interpretation Act 2005 s18(h) and Schedule "month"); the start date is the one in Revenue’s Employment Detail Summary, and if you moved to Stamp 1 from another permission it runs from the validity of that employment permit (ISD).`,
            ),
            L(
              '21 个月与 57 个月两类不可互换：GEP、ICT 的受雇时间不计入 21 个月（ISD）。换雇主、中断或两类混合时怎样起算没有写明（PD-116）。',
              'The 21-month and 57-month groups are not interchangeable: time on a GEP or ICT does not count towards 21 months (ISD). How a change of employer, a break or a mixed history is counted is not stated (PD-116).',
            ),
          ],
          pendingDetails: ['PD-116'],
        });
      }
    } else if (route === 'spouse-1g') {
      const years = v.spouse1gYears.value;
      const ok = (d: IsoDate) => covered(sums.stamp1g, addYears(d, -years), d);
      const earliest = firstDate(ok);
      pathways.push({
        id: 'IE-STAMP4',
        title: L(
          'Stamp 1G 配偶或伴侣转 Stamp 4',
          'Stamp 4 for spouses and partners on Stamp 1G',
        ),
        status: statusOf(earliest),
        earliestDate: earliest,
        summary:
          (earliest === sim
            ? L(
                `模拟日已连续持 Stamp 1G 满 ${years} 年，可以申请 Stamp 4。`,
                `You have held Stamp 1G for ${years} years on the simulation date and can apply for Stamp 4.`,
              )
            : earliest
              ? L(
                  `连续持 Stamp 1G 满 ${years} 年、可申请 Stamp 4 的最早日期是 ${earliest}。`,
                  `The earliest date you will have held Stamp 1G for ${years} years and can apply for Stamp 4 is ${earliest}.`,
                )
              : L(
                  `按现有记录，10 年内达不到连续持 Stamp 1G ${years} 年。`,
                  `With your record you will not hold Stamp 1G for ${years} years in a row within 10 years.`,
                )) + L(policy, ` ${policy}`),
        checks: [
          {
            text: L(
              `${addYears(sim, -years)} 起每天都持 Stamp 1G，递交当天仍持有`,
              `Stamp 1G on every day since ${addYears(sim, -years)}, still held on the application day`,
            ),
            met: ok(sim),
            sources: v.spouse1gYears.sources,
          },
        ],
        notChecked: [
          L(
            '持 Stamp 1G 的依据：须是 Critical Skills Employment Permit 持有人或 Hosting Agreement 研究员的配偶或事实伴侣',
            'The basis of your Stamp 1G: you must be the spouse or de facto partner of a Critical Skills Employment Permit holder or a researcher on a Hosting Agreement',
          ),
        ],
        assumptions: [
          L(
            '"5 年"按连续持有计，许可之间有空档即重新起算；ISD 原文只写"after 5 years on a Stamp 1G"（PD-118）。',
            '"5 years" is taken as held without a break, so a gap between permissions starts the count again; ISD only says "after 5 years on a Stamp 1G" (PD-118).',
          ),
          projection,
        ],
        pendingDetails: ['PD-118'],
      });
    } else {
      const months = v.wcattMonths.value;
      const [fewest, most] = monthSpan(v.wcattAbsenceMonths.value);
      // Days abroad in the 12 months from each day.
      const yearAway = Array.from({ length: days.count }, (_, i) => {
        const a = days.date(i);
        return days.total(sums.away, a, addDays(addYears(a, 1), -1));
      });
      /** Most days abroad in a calendar year, and in any 12 months, in [from, to]. */
      const absences = (from: IsoDate, to: IsoDate) => {
        let calendar = 0;
        for (
          let y = Number(from.slice(0, 4));
          y <= Number(to.slice(0, 4));
          y++
        ) {
          const a = `${y}-01-01` > from ? `${y}-01-01` : from;
          const b = `${y}-12-31` < to ? `${y}-12-31` : to;
          calendar = Math.max(calendar, days.total(sums.away, a, b));
        }
        let rolling = 0;
        const last = days.index(addYears(addDays(to, 1), -1));
        for (let i = days.index(from); i <= last; i++)
          rolling = Math.max(rolling, yearAway[i]);
        return { calendar, rolling };
      };
      const verdict = (d: IsoDate): Verdict => {
        const from = addMonths(d, -months);
        const to = addDays(d, -1);
        if (!covered(sums.wcattMaybe, from, d)) return 'no';
        const sure = covered(sums.wcattSure, from, d);
        // Few days abroad in all: no year can exceed the limit.
        if (days.total(sums.away, from, to) <= fewest)
          return sure ? 'yes' : 'maybe';
        const a = absences(from, to);
        if (a.calendar > most) return 'no';
        return sure && a.rolling <= fewest ? 'yes' : 'maybe';
      };
      const earliest = firstDate((d) => verdict(d) === 'yes');
      const possible = firstDate((d) => verdict(d) !== 'no');
      const from = addMonths(sim, -months);
      const a = absences(from, addDays(sim, -1));
      const unsure = possible && (!earliest || possible < earliest);
      pathways.push({
        id: 'IE-STAMP4',
        title: L(
          'Stamp 5（without condition as to time）',
          'Stamp 5 (without condition as to time)',
        ),
        status: statusOf(earliest, possible),
        earliestDate: earliest,
        summary:
          (earliest === sim
            ? L(
                `模拟日已有 ${months} 个月的合法居留，可以申请 Stamp 5。`,
                `You have ${months} months of legal residence on the simulation date and can apply for Stamp 5.`,
              )
            : earliest
              ? L(
                  `满 ${months} 个月合法居留、可申请 Stamp 5 的最早日期是 ${earliest}。`,
                  `The earliest date with ${months} months of legal residence to apply for Stamp 5 is ${earliest}.`,
                )
              : L(
                  `按现有记录，10 年内达不到可确定的 ${months} 个月合法居留。`,
                  `With your record you will not have ${months} months of legal residence that can be confirmed within 10 years.`,
                )) +
          (unsure
            ? L(
                `若待确认的许可计入、或"每年不超过 ${v.wcattAbsenceMonths.value} 个月"按日历年读，最早 ${possible}（PD-114、PD-117）。`,
                ` Counting uncertain permissions, or reading "${v.wcattAbsenceMonths.value} months in a year" as a calendar year, it could be ${possible} (PD-114, PD-117).`,
              )
            : '') +
          L(policy, ` ${policy}`),
        checks: [
          {
            text: L(
              `递交前 ${months} 个月（${from} 起）每天都持可计入 Stamp 5 的许可（Stamp 1、1H、1G、3、4；ICT 的 Stamp 1、Stamp 0、学生许可不计），递交当天仍持有`,
              `A permission that counts for Stamp 5 on every day of the ${months} months before applying (from ${from}) and on the application day (Stamp 1, 1H, 1G, 3 or 4; not ICT Stamp 1, Stamp 0 or student permissions)`,
            ),
            met: covered(sums.wcattSure, from, sim)
              ? true
              : covered(sums.wcattMaybe, from, sim)
                ? undefined
                : false,
            sources: v.wcattMonths.sources,
          },
          {
            text: L(
              `每年不在境内不超过 ${v.wcattAbsenceMonths.value} 个月（${fewest}–${most} 天）：按日历年最多 ${a.calendar} 天，按任意连续 12 个月最多 ${a.rolling} 天`,
              `No more than ${v.wcattAbsenceMonths.value} months (${fewest}–${most} days) absent in a year: at most ${a.calendar} days in a calendar year, ${a.rolling} in any 12 months`,
            ),
            met:
              a.rolling <= fewest
                ? true
                : a.calendar > most
                  ? false
                  : undefined,
            sources: v.wcattAbsenceMonths.sources,
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
            `${months} 个月按连续持有计，许可之间有空档即重新起算（PD-118）；Stamp 4D、4S 请选"其他"，按待确认处理（PD-114）。`,
            `The ${months} months are taken as held without a break, so a gap starts the count again (PD-118); choose "other" for Stamp 4D or 4S, which are treated as uncertain (PD-114).`,
          ),
          L(
            `"每年不超过 ${v.wcattAbsenceMonths.value} 个月"指日历年还是任意 12 个月、几天算 ${v.wcattAbsenceMonths.value} 个月都没写：任意 12 个月都不超过 ${fewest} 天才算满足，日历年超过 ${most} 天算不满足，其间待确认（PD-117）。出入境当天不算缺席。`,
            `Whether "${v.wcattAbsenceMonths.value} months in a year" means a calendar year or any 12 months, and how many days make ${v.wcattAbsenceMonths.value} months, is not stated: no more than ${fewest} days in any 12 months is met, over ${most} in a calendar year is not, and in between it is uncertain (PD-117). Departure and return days are not absences.`,
          ),
          projection,
        ],
        pendingDetails: [...(hasOther ? ['PD-114'] : []), 'PD-117', 'PD-118'],
      });
    }
  }

  return { policyAsOf: ie.asOf, pathways };
}
