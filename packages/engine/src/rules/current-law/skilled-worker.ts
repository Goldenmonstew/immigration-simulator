import {
  currentLaw2026_11 as cl,
  goingRates,
  healthAndCareAsheOccupations,
  immigrationSalaryListOccupations,
  nationalPayScaleOccupations,
} from '@uk-immigration/policy-data';
import { fullYears } from '../../dates';
import {
  applicationLocationIssue,
  continuousRun,
  episodeOn,
  currentResidence,
  permissionChanges,
  settledBy,
  timelineAtFiling,
} from '../../residence';
import type { CurrentResidence } from '../../residence';
import { defineRule, runRule, textFor } from '../../rule';
import type { Lang } from '../../rule';
import { gbp } from '../es-contribution';
import { clEnglish, clKol } from './english';
import {
  childFiling,
  jointApplication,
  noJointApplication,
} from './dependants';
import type { GoingRate, Route } from '@uk-immigration/policy-data';
import type {
  ImmigrationEpisode,
  IsoDate,
  RuleContext,
  RuleId,
  RuleOutcome,
  RuleResult,
} from '../../types';
import {
  crResidenceSources,
  residenceAssumptions,
  residenceCompleted,
  residencePending,
  RULE_SET,
  absenceAssumption,
  isSkilledWorker,
  isSkilledWorkerDependant,
  onSkilledWorker,
  onSkilledWorkerChild,
  onSkilledWorkerPartner,
} from './shared';

// SW 21.2(a)–(h): permission (not as a dependant) on any combination of these
// routes counts towards the 5 years. Representative of an Overseas Business
// and Tier 1 are not in Route; SW 21.2(i) is not modelled.
const SW_QUALIFYING_ROUTES: Route[] = [
  'SKILLED_WORKER',
  'GLOBAL_TALENT',
  'INNOVATOR_FOUNDER',
  'MINISTER_OF_RELIGION',
  'INTERNATIONAL_SPORTSPERSON',
  'SCALE_UP',
];

export const countsForSkilledWorker = (e: ImmigrationEpisode) =>
  e.role === 'MAIN' && SW_QUALIFYING_ROUTES.includes(e.route);

/**
 * Start of the continuous SW 21.2 period ending on the simulation date, while
 * on Skilled Worker.
 */
export function skilledWorkerResidence(
  { timeline, simulationDate }: RuleContext,
  notBefore?: IsoDate,
): CurrentResidence | undefined {
  if (!onSkilledWorker(timeline, simulationDate)) return undefined;
  return currentResidence(
    timeline,
    simulationDate,
    countsForSkilledWorker,
    cl.values.skilledWorkerQualifyingYears.value,
    { appliesOn: isSkilledWorker, notBefore },
  );
}

export const clSwResidence5Y = defineRule(
  {
    id: 'CL-SW-RESIDENCE-5Y',
    ruleSetId: RULE_SET,
    title: 'Skilled Worker 连续 5 年',
    titleEn: `${cl.values.skilledWorkerQualifyingYears.value} continuous years as a Skilled Worker`,
    sources: [
      { srcId: 'SRC-004', locator: 'SW 21.1' },
      { srcId: 'SRC-004', locator: 'SW 21.2' },
      { srcId: 'SRC-004', locator: 'SW 22.1' },
      ...crResidenceSources,
    ],
    pendingDetails: [],
  },
  (ctx) => {
    const L = textFor(ctx);
    const years = cl.values.skilledWorkerQualifyingYears.value;
    const residence = skilledWorkerResidence(ctx);
    const assumptions = [
      L(
        '连续期合并 SW 21.2 列出的 Skilled Worker、Global Talent、Innovator Founder、T2 Minister of Religion、International Sportsperson、Scale-up 主申请人许可；Representative of an Overseas Business 与 Tier 1 本工具无法填写，不计入；SW 21.2(i) 的等待决定期间未建模。',
        'The continuous period combines main applicant permission on the routes listed in SW 21.2: Skilled Worker, Global Talent, Innovator Founder, T2 Minister of Religion, International Sportsperson and Scale-up. Representative of an Overseas Business and Tier 1 cannot be entered in this tool and are not counted; time awaiting a decision under SW 21.2(i) is not modelled.',
      ),
      ...(ctx.timeline.absences.length > 0 ? [absenceAssumption(L)] : []),
    ];
    if (!residence) {
      return {
        status: 'FAIL',
        explanation: L(
          '当前不是 Skilled Worker 主申请人许可。',
          'Current permission is not as a Skilled Worker main applicant.',
        ),
        assumptions,
      };
    }
    assumptions.push(
      ...residenceAssumptions(ctx.timeline, ctx.simulationDate, residence, L),
    );
    const { start } = residence;
    return residence.applicationDate === ctx.simulationDate
      ? {
          status: 'PASS',
          explanation: L(
            `自 ${start} 起连续持可计入 Skilled Worker 定居的许可（SW 21.2），${residenceCompleted(residence, ctx.simulationDate, years, L)}。`,
            `Continuous permission counting towards Skilled Worker settlement (SW 21.2) since ${start}: ${residenceCompleted(residence, ctx.simulationDate, years, L)}.`,
          ),
          assumptions,
        }
      : {
          status: 'FAIL',
          explanation: L(
            `自 ${start} 起连续持可计入 Skilled Worker 定居的许可（SW 21.2），${residencePending(residence, years, L)}。`,
            `Continuous permission counting towards Skilled Worker settlement (SW 21.2) since ${start}: ${residencePending(residence, years, L)}.`,
          ),
          assumptions,
        };
  },
);

/** The relevant row of the table in SW 24.3 (row E is not modelled). */
interface SalaryRow {
  row: 'A' | 'B' | 'C' | 'D';
  /** General salary, GBP per year. */
  threshold: number;
  /** Why this row applies, for explanations. */
  reason: string;
  /** Lower rows might apply but `socCode` is missing. */
  socMissing: boolean;
  /** Start of the continuous Skilled Worker (not SW 21.2) permission. */
  skilledWorkerFrom: IsoDate;
  assumptions: string[];
}

const inTable = (rows: { socCode: string }[], soc: string | undefined) =>
  soc !== undefined && rows.some((r) => r.socCode === soc);

/** Undefined unless on Skilled Worker on the simulation date. */
function settlementSalaryRow({
  timeline,
  simulationDate,
  locale,
}: RuleContext): SalaryRow | undefined {
  const L = textFor({ locale });
  const current = episodeOn(timeline, simulationDate);
  if (!current || !isSkilledWorker(current)) return undefined;
  const v = cl.values;
  const soc = current.socCode;
  const skilledWorkerFrom = continuousRun(
    timeline,
    simulationDate,
    isSkilledWorker,
  ).episodes[0].validFrom;
  const table3 = inTable(nationalPayScaleOccupations.rows, soc);
  const ashe = inTable(healthAndCareAsheOccupations.occupations, soc);
  // SW 4.2(b)(ii)
  const pre2024 =
    skilledWorkerFrom < v.skilledWorkerPre2024RulesBefore.value &&
    simulationDate < v.skilledWorkerPre2024ApplicationsBefore.value;
  // Declared answer first; otherwise derived from the SOC code (SRC-019),
  // counting only entries not removed before the date of application.
  const islEntries = immigrationSalaryListOccupations.entries.filter(
    (e) => e.socCode === soc,
  );
  const islInForce = islEntries.filter(
    (e) => e.removalDate === undefined || e.removalDate >= simulationDate,
  );
  const islUndeclared = current.immigrationSalaryList === undefined;
  const islDerived = islUndeclared && islInForce.length > 0;
  const isl = current.immigrationSalaryList ?? islDerived;
  const removalDates = (entries: typeof islEntries) =>
    [...new Set(entries.flatMap((e) => e.removalDate ?? []))].join(
      L('、', ', '),
    );
  const inForceDates = removalDates(islInForce);
  const islRemovalNote = inForceDates
    ? L(
        `清单条目的移除日期为 ${inForceDates}，已按申请日比较。`,
        ` The list entry’s removal date is ${inForceDates}, compared with the date of application.`,
      )
    : '';
  const pre2024Reason = L(
    `自 ${skilledWorkerFrom} 起连续持 Skilled Worker 许可，早于 ${v.skilledWorkerPre2024RulesBefore.value}，且申请日早于 ${v.skilledWorkerPre2024ApplicationsBefore.value}（SW 4.2(b)(ii)）`,
    `continuous Skilled Worker permission since ${skilledWorkerFrom}, before ${v.skilledWorkerPre2024RulesBefore.value}, with the application before ${v.skilledWorkerPre2024ApplicationsBefore.value} (SW 4.2(b)(ii))`,
  );
  const asheReason = L(
    `SOC ${soc} 属 Health and Care ASHE salary job（SW A1.1）`,
    `SOC ${soc} is a Health and Care ASHE salary job (SW A1.1)`,
  );
  const b42Reason = pre2024 ? pre2024Reason : asheReason;
  const assumptions = [
    L(
      'SW 24.3 row E（5 年期含 Tier 2 (General) 下的 STEM 类 SOC 2010 职业）未建模。',
      'SW 24.3 row E (a 5-year period including STEM occupations under SOC 2010 on Tier 2 (General)) is not modelled.',
    ),
    ...(islDerived
      ? [
          L(
            `未申报是否在 Immigration Salary List 上；SOC ${soc} 在清单职业表中，按职业代码推导为在清单上。清单对岗位 / 地区的限制（criteria）未核对，可在问卷里申报覆盖。${islRemovalNote}`,
            `Not declared whether the job is on the Immigration Salary List; SOC ${soc} is in the list’s occupation table, so the job is derived to be on the list from its occupation code. The list’s job / region restrictions (criteria) are not checked; a declaration in the questionnaire overrides this.${islRemovalNote}`,
          ),
        ]
      : islUndeclared && islEntries.length > 0
        ? [
            L(
              `未申报是否在 Immigration Salary List 上；SOC ${soc} 的清单条目移除日期为 ${removalDates(islEntries)}，早于申请日，按不在清单处理。`,
              `Not declared whether the job is on the Immigration Salary List; the list entry for SOC ${soc} has a removal date of ${removalDates(islEntries)}, before the date of application, so the job is treated as not on the list.`,
            ),
          ]
        : islUndeclared
          ? [
              L(
                '未申报是否在 Immigration Salary List 上，按不在清单处理。',
                'Not declared whether the job is on the Immigration Salary List; treated as not on the list.',
              ),
            ]
          : []),
    ...(ashe && !pre2024
      ? [
          L(
            `SOC ${soc} 在 SW A1.1 的 Health and Care ASHE salary job 职业列表内，假设雇主属 SW A1.1(a)–(f) 列出的类型。`,
            `SOC ${soc} is on the Health and Care ASHE salary job list in SW A1.1; the employer is assumed to be of a type listed in SW A1.1(a)–(f).`,
          ),
        ]
      : []),
    ...(pre2024
      ? [
          L(
            `"${v.skilledWorkerPre2024RulesBefore.value} 前按当时规则获批"按连续 Skilled Worker 许可的起始日判断（SW 4.2(b)(ii)）。`,
            `“Granted under the rules in place before ${v.skilledWorkerPre2024RulesBefore.value}” is judged by the start of the continuous Skilled Worker permission (SW 4.2(b)(ii)).`,
          ),
        ]
      : []),
  ];
  const base = {
    socMissing: soc === undefined,
    skilledWorkerFrom,
    assumptions,
  };
  if (table3) {
    return {
      ...base,
      socMissing: false,
      row: 'D',
      threshold: v.skilledWorkerSettlementSalaryRowD.value,
      reason: L(
        `SOC ${soc} 是 Appendix Skilled Occupations Table 3 的医疗 / 教育职业`,
        `SOC ${soc} is a health / education occupation in Appendix Skilled Occupations Table 3`,
      ),
    };
  }
  if (isl && (pre2024 || ashe)) {
    return {
      ...base,
      socMissing: false,
      row: 'D',
      threshold: v.skilledWorkerSettlementSalaryRowD.value,
      reason: L(
        // A space where Chinese meets Latin text (the ASHE reason starts with "SOC").
        `岗位在 Immigration Salary List 上，且${/^[A-Za-z]/.test(b42Reason) ? ' ' : ''}${b42Reason}`,
        `the job is on the Immigration Salary List, and ${b42Reason}`,
      ),
    };
  }
  if (pre2024 || ashe) {
    return {
      ...base,
      row: 'C',
      threshold: v.skilledWorkerSettlementSalaryRowC.value,
      reason: b42Reason,
    };
  }
  if (isl) {
    return {
      ...base,
      row: 'B',
      threshold: v.skilledWorkerSettlementSalaryRowB.value,
      reason: L(
        '岗位在 Immigration Salary List 上',
        'the job is on the Immigration Salary List',
      ),
    };
  }
  return {
    ...base,
    row: 'A',
    threshold: v.skilledWorkerGeneralSalaryThreshold.value,
    reason: L('不适用 rows B–E', 'rows B–E do not apply'),
  };
}

export const clSwSalary = defineRule(
  {
    id: 'CL-SW-SALARY',
    ruleSetId: RULE_SET,
    title: 'Skilled Worker 定居薪资（general salary）',
    titleEn: 'Skilled Worker settlement salary (general salary)',
    sources: [
      { srcId: 'SRC-004', locator: 'SW 24.2' },
      { srcId: 'SRC-004', locator: 'SW 24.3' },
      { srcId: 'SRC-004', locator: 'SW 4.2(b)' },
      { srcId: 'SRC-004', locator: 'SW A1.1' },
      { srcId: 'SRC-017', locator: 'Table 3' },
      immigrationSalaryListOccupations.source,
    ],
    pendingDetails: [],
  },
  (ctx) => {
    const L = textFor(ctx);
    const row = settlementSalaryRow(ctx);
    if (!row) {
      return {
        status: 'FAIL',
        explanation: L(
          '当前不是 Skilled Worker 主申请人许可。',
          'Current permission is not as a Skilled Worker main applicant.',
        ),
      };
    }
    const salary = episodeOn(ctx.timeline, ctx.simulationDate)!.salary;
    const { assumptions } = row;
    if (salary === undefined) {
      return {
        status: 'UNKNOWN',
        explanation: L(
          '未填写当前 Skilled Worker 工作的年薪。',
          'Salary for the current Skilled Worker job not provided.',
        ),
        assumptions,
      };
    }
    const which = L(
      `按 SW 24.3 row ${row.row}（${row.reason}），general salary 门槛 ${gbp(row.threshold)}`,
      `Under SW 24.3 row ${row.row} (${row.reason}), the general salary threshold is ${gbp(row.threshold)}`,
    );
    if (salary >= row.threshold) {
      return {
        status: 'PASS',
        explanation: L(
          `${which}；当前年薪 ${gbp(salary)}，已达到。`,
          `${which}; the current salary of ${gbp(salary)} meets it.`,
        ),
        assumptions,
      };
    }
    return row.socMissing
      ? {
          status: 'UNKNOWN',
          explanation: L(
            `${which}；当前年薪 ${gbp(salary)} 低于此门槛。未填写 SOC 职业代码，若属 Table 3 医疗 / 教育职业或 Health and Care ASHE salary job，适用更低的 row C / D。`,
            `${which}; the current salary of ${gbp(salary)} is below it. SOC code not provided: if the job is a Table 3 health / education occupation or a Health and Care ASHE salary job, the lower rows C / D apply.`,
          ),
          assumptions,
        }
      : {
          status: 'FAIL',
          explanation: L(
            `${which}；当前年薪 ${gbp(salary)}，低于此门槛。`,
            `${which}; the current salary of ${gbp(salary)} is below it.`,
          ),
          assumptions,
        };
  },
);

// Going-rate tables for each SW 24.3 row, in lookup order (row D's Table 3
// occupations use the national pay scales in Tables 3–5, not extracted).
const GOING_RATE_TABLES: Record<SalaryRow['row'], GoingRate['table'][]> = {
  A: ['1', '1a'],
  B: ['1', '1a'],
  C: ['2', '2aa', '2a'],
  D: ['2', '2aa', '2a'],
};

/** Additional tables only cover those first granted before a date (SW 6.1). */
function grantedBefore(table: GoingRate['table']): IsoDate | undefined {
  if (table === '1a' || table === '2aa') {
    return cl.values.skilledWorkerPre2025RulesBefore.value;
  }
  return table === '2a'
    ? cl.values.skilledWorkerPre2024RulesBefore.value
    : undefined;
}

export const clSwGoingRate = defineRule(
  {
    id: 'CL-SW-GOING-RATE',
    ruleSetId: RULE_SET,
    title: 'Skilled Worker 定居薪资（going rate）',
    titleEn: 'Skilled Worker settlement salary (going rate)',
    sources: [
      { srcId: 'SRC-004', locator: 'SW 24.3' },
      { srcId: 'SRC-004', locator: 'SW 6.1' },
      { srcId: 'SRC-004', locator: 'SW 14.4' },
      goingRates.source,
      immigrationSalaryListOccupations.source,
    ],
    pendingDetails: [],
  },
  (ctx) => {
    const L = textFor(ctx);
    const row = settlementSalaryRow(ctx);
    if (!row) {
      return {
        status: 'FAIL',
        explanation: L(
          '当前不是 Skilled Worker 主申请人许可。',
          'Current permission is not as a Skilled Worker main applicant.',
        ),
      };
    }
    const { socCode, salary } = episodeOn(ctx.timeline, ctx.simulationDate)!;
    const assumptions = [
      L(
        'going rate 按每周 37.5 小时的全额年薪比较，未按实际工时折算（SW 14.4）。',
        'The going rate is compared as the full annual salary for a 37.5-hour week, not pro-rated for actual hours (SW 14.4).',
      ),
    ];
    if (socCode === undefined) {
      return {
        status: 'UNKNOWN',
        explanation: L(
          '未填写当前 Skilled Worker 工作的 SOC 2020 职业代码，无法查 going rate。',
          'SOC 2020 code for the current Skilled Worker job not provided, so the going rate cannot be looked up.',
        ),
        assumptions,
      };
    }
    if (row.row === 'D' && inTable(nationalPayScaleOccupations.rows, socCode)) {
      return {
        status: 'UNKNOWN',
        explanation: L(
          `SOC ${socCode} 是 Table 3 医疗 / 教育职业，going rate 按国家薪级（Appendix Skilled Occupations Table 3–5）确定；Table 4 / 5 的薪级本工具未提取，无法核对。`,
          `SOC ${socCode} is a Table 3 health / education occupation, whose going rate is set by national pay scales (Appendix Skilled Occupations Tables 3–5); this tool has not extracted the pay scales in Tables 4 / 5, so it cannot check them.`,
        ),
        assumptions,
      };
    }
    if (salary === undefined) {
      return {
        status: 'UNKNOWN',
        explanation: L(
          '未填写当前 Skilled Worker 工作的年薪。',
          'Salary for the current Skilled Worker job not provided.',
        ),
        assumptions,
      };
    }
    const tables = GOING_RATE_TABLES[row.row];
    const found = tables.flatMap((table) =>
      goingRates.rows.filter((r) => r.table === table && r.socCode === socCode),
    );
    const rate = found.find((r) => {
      const before = grantedBefore(r.table);
      return before === undefined || row.skilledWorkerFrom < before;
    });
    const tableNames = tables.map((t) => `Table ${t}`).join(' / ');
    if (!rate) {
      return {
        status: 'UNKNOWN',
        explanation:
          found.length > 0
            ? L(
                `SOC ${socCode} 只在 Table ${found[0].table}，该表只适用于 ${grantedBefore(found[0].table)} 前获批并连续持有 Skilled Worker 许可者；与所填的起始日 ${row.skilledWorkerFrom} 不符，请核对职业代码与许可记录。`,
                `SOC ${socCode} is only in Table ${found[0].table}, which applies only to people granted Skilled Worker permission before ${grantedBefore(found[0].table)} who have held it continuously since; this does not match the start date entered, ${row.skilledWorkerFrom}. Please check the occupation code and permission history.`,
              )
            : L(
                `SOC ${socCode} 不在 SW 24.3 row ${row.row} 适用的 ${tableNames} 中，无法确定 going rate。`,
                `SOC ${socCode} is not in ${tableNames}, which apply to SW 24.3 row ${row.row}, so the going rate cannot be determined.`,
              ),
        assumptions,
      };
    }
    if (rate.table === '2a') {
      assumptions.push(
        L(
          'Table 2a 还要求为同一 sponsor 工作（SW 6.1(f)），本工具未核对。',
          'Table 2a also requires working for the same sponsor (SW 6.1(f)); this tool does not check this.',
        ),
      );
    }
    const which = L(
      `按 SW 24.3 row ${row.row} 查 Appendix Skilled Occupations Table ${rate.table}，SOC ${socCode}（${rate.title}）的 going rate 为 ${gbp(rate.goingRate)}`,
      `Under SW 24.3 row ${row.row}, Appendix Skilled Occupations Table ${rate.table} gives a going rate of ${gbp(rate.goingRate)} for SOC ${socCode} (${rate.title})`,
    );
    return salary >= rate.goingRate
      ? {
          status: 'PASS',
          explanation: L(
            `${which}；当前年薪 ${gbp(salary)}，已达到。`,
            `${which}; the current salary of ${gbp(salary)} meets it.`,
          ),
          assumptions,
        }
      : {
          status: 'FAIL',
          explanation: L(
            `${which}；当前年薪 ${gbp(salary)}，低于 going rate。`,
            `${which}; the current salary of ${gbp(salary)} is below the going rate.`,
          ),
          assumptions,
        };
  },
);

/**
 * P's current-law result rests on the candidate whose residence rule is
 * `residence`, so P settles on that route (contracts §16.2).
 */
export const principalSettlesBy = (ctx: RuleContext, residence: RuleId) =>
  ctx.principal?.result.byRuleSet[RULE_SET]?.decidedBy?.includes(residence) ??
  false;

/** The date the principal can apply on the route the dependant relies on. */
export function principalApplicationDate(
  ctx: RuleContext,
  residence: RuleId,
): IsoDate | undefined {
  if (!principalSettlesBy(ctx, residence)) return undefined;
  return ctx.principal?.result.byRuleSet[RULE_SET]?.earliestDate;
}

/** SW 24.2–24.3, 39.1(a): P must qualify on the actual (possibly joint) filing day. */
export function skilledWorkerFiling(
  ctx: RuleContext,
  jointFrom?: IsoDate,
): (CurrentResidence & { requirements?: RuleOutcome[] }) | undefined {
  let residence = skilledWorkerResidence(ctx, jointFrom);
  if (!residence?.applicationDate) return residence;
  const changes = permissionChanges(ctx.timeline);
  const current = episodeOn(ctx.timeline, ctx.simulationDate);
  const newGrant = changes.some((day) => {
    if (day <= ctx.simulationDate) return false;
    const effective = episodeOn(ctx.timeline, day);
    return effective && effective !== current;
  });
  const location = applicationLocationIssue(ctx.timeline, ctx.simulationDate);
  if (!jointFrom && !newGrant && !location) return residence;
  // A date recovered from an uncertain departure needs confirmation. Other
  // forecasts, joint ones included, can carry outstanding evidence, which
  // keeps a dependant's result UNKNOWN (pendingOnJointDay).
  const requirePass = location === 'UNKNOWN';
  while (residence?.applicationDate) {
    const date = residence.applicationDate;
    const filing = {
      ...ctx,
      timeline: timelineAtFiling(ctx.timeline, date),
      simulationDate: date,
    };
    const requirements = [clSwSalary, clSwGoingRate, clEnglish, clKol].map(
      (rule) => runRule(rule, filing),
    );
    if (
      requirements.every(
        (r) => r.status === 'PASS' || (!requirePass && r.status === 'UNKNOWN'),
      )
    )
      return { ...residence, requirements };
    const change = changes.find((d) => d > date);
    if (!change) break;
    residence = skilledWorkerResidence(ctx, change);
  }
}

/** P's requirements still to be confirmed on the joint filing day. */
const pendingOnJointDay = (joint?: {
  applicationDate?: IsoDate;
  principal?: { requirements?: RuleOutcome[] };
}) =>
  joint?.principal?.requirements?.filter((r) => r.status === 'UNKNOWN') ?? [];

const pendingJoint = (
  L: Lang,
  date: IsoDate,
  pending: RuleOutcome[],
  assumptions: string[],
): Omit<RuleResult, 'sources'> => {
  const titles = pending.map((r) => `「${r.title}」`).join('');
  const titlesEn = pending.map((r) => `“${r.title}”`).join(', ');
  return {
    status: 'UNKNOWN',
    explanation: L(
      `可在 ${date} 与主申请人一同申请，前提是主申请人当日的${titles}得到确认（SW 39.1(a)）。`,
      `They could apply together with the principal applicant on ${date} if the principal applicant’s ${titlesEn} can be confirmed for that day (SW 39.1(a)).`,
    ),
    assumptions,
  };
};

/**
 * SW 39.1(b): P has settled. Met when P settled from Skilled Worker
 * permission and the dependant then held permission as P's partner or child
 * (SW 39.1(b)(ii), born in the UK before P settled, is not modelled).
 */
function settledPrincipal(
  ctx: RuleContext,
): { met: boolean; date: IsoDate; explanation: string } | undefined {
  const settled =
    ctx.principal && settledBy(ctx.principal.timeline, ctx.simulationDate);
  if (!settled) return undefined;
  const L = textFor(ctx);
  const now = episodeOn(ctx.timeline, ctx.simulationDate)!;
  const who = now.dependantOf === 'PARTNER' ? 'partner' : 'child';
  if (settled.route !== 'SKILLED_WORKER') {
    return {
      met: false,
      date: settled.date,
      explanation: L(
        `主申请人 ${settled.date} 定居时持有的不是 Skilled Worker 许可，不能按 SW 39.1(b) 作为其 Skilled Worker dependant 定居。`,
        `The principal applicant did not hold Skilled Worker permission when they settled on ${settled.date}, so settlement as their Skilled Worker dependant under SW 39.1(b) is not possible.`,
      ),
    };
  }
  const then = episodeOn(ctx.timeline, settled.date);
  return then &&
    isSkilledWorkerDependant(then) &&
    then.dependantOf === now.dependantOf
    ? {
        met: true,
        date: settled.date,
        explanation: L(
          `主申请人已于 ${settled.date} 作为 Skilled Worker 定居，当时本人持有其 dependent ${who} 许可（SW 39.1(b)）`,
          `The principal applicant settled as a Skilled Worker on ${settled.date}, when this person held permission as their dependent ${who} (SW 39.1(b))`,
        ),
      }
    : {
        met: false,
        date: settled.date,
        explanation: L(
          `主申请人 ${settled.date} 作为 Skilled Worker 定居时，本人未持有其 Skilled Worker dependent ${who} 许可，不能按 SW 39.1(b) 定居。`,
          `When the principal applicant settled as a Skilled Worker on ${settled.date}, this person did not hold permission as their Skilled Worker dependent ${who}, so settlement under SW 39.1(b) is not possible.`,
        ),
      };
}

const settledPrincipalAssumption = (L: Lang) =>
  L(
    '主申请人尚未定居时，只判断与主申请人同时获批（SW 39.1(a)）；若其已定居，须在主申请人信息里填写定居日期与路线（SW 39.1(b)）。',
    'While the principal applicant has not settled, only being granted at the same time as them is assessed (SW 39.1(a)); if they have already settled, enter their settlement date and route in the principal applicant’s details (SW 39.1(b)).',
  );

/** Why a dependant cannot settle with P under SW 39.1(a). */
function withoutPrincipalPathway(
  { simulationDate, principal, locale }: RuleContext,
  who: string,
  assumptions: string[],
): Omit<RuleResult, 'sources'> {
  const L = textFor({ locale });
  const principalOnSw = onSkilledWorker(principal!.timeline, simulationDate);
  if (!principalOnSw) {
    return {
      status: 'UNKNOWN',
      explanation: L(
        '主申请人当前不是 Skilled Worker 主申请人许可；若其已作为 Skilled Worker 定居，请填写主申请人的定居日期与路线（SW 39.1(b)）。',
        'The principal applicant does not currently hold Skilled Worker permission as a main applicant; if they have already settled as a Skilled Worker, enter their settlement date and route (SW 39.1(b)).',
      ),
      assumptions,
    };
  }
  const result = principal!.result.byRuleSet[RULE_SET];
  return result?.outcome === 'LIKELY_NOT_ELIGIBLE'
    ? {
        status: 'FAIL',
        explanation: L(
          `主申请人目前不能作为 Skilled Worker 定居，${who} 不能按 SW 39.1(a) 随其定居。`,
          `The principal applicant cannot currently settle as a Skilled Worker, so the ${who} cannot settle with them under SW 39.1(a).`,
        ),
        assumptions,
      }
    : {
        status: 'UNKNOWN',
        // With decidedBy, P's result rests on another pathway (§16.2).
        explanation: result?.decidedBy
          ? L(
              `主申请人的现行法律结论不是按 Skilled Worker 路线得出的（例如按 Long Residence），${who} 随其按 SW 39.1(a) 定居的时间无法判断。`,
              `The principal applicant’s current-rules result is not on the Skilled Worker route (for example, it is under Long Residence), so when the ${who} could settle with them under SW 39.1(a) cannot be determined.`,
            )
          : L(
              '主申请人的信息不足以判断其能否作为 Skilled Worker 定居。',
              'The principal applicant’s details are not enough to determine whether they can settle as a Skilled Worker.',
            ),
        assumptions,
      };
}

/**
 * The start the dependent partner can apply 5 years after: their own
 * continuous dependant period (SW 42.1, SW 43.1), but not before P completes
 * the Skilled Worker period (SW 39.1(a)). Undefined unless P has a Skilled
 * Worker pathway.
 */
export function skilledWorkerPartnerResidence(
  ctx: RuleContext,
):
  | (CurrentResidence & { principal?: { requirements?: RuleOutcome[] } })
  | undefined {
  const { timeline, simulationDate } = ctx;
  if (!ctx.principal || !onSkilledWorkerPartner(timeline, simulationDate)) {
    return undefined;
  }
  const settled = settledPrincipal(ctx);
  const principalDate = settled
    ? settled.date
    : principalApplicationDate(ctx, 'CL-SW-RESIDENCE-5Y');
  if (settled ? !settled.met : !principalDate) return undefined;
  const ownFrom = (notBefore?: IsoDate) =>
    currentResidence(
      timeline,
      simulationDate,
      isSkilledWorkerDependant,
      cl.values.skilledWorkerQualifyingYears.value,
      {
        notBefore,
        appliesOn: (e) =>
          isSkilledWorkerDependant(e) && e.dependantOf === 'PARTNER',
      },
    );
  return settled
    ? ownFrom()
    : jointApplication(principalDate!, ownFrom, (notBefore) =>
        skilledWorkerFiling(
          {
            timeline: ctx.principal!.timeline,
            simulationDate,
            locale: ctx.locale,
          },
          notBefore,
        ),
      );
}

export const clSwPartner5Y = defineRule(
  {
    id: 'CL-SW-PARTNER-5Y',
    ruleSetId: RULE_SET,
    title: 'Skilled Worker dependent partner 连续 5 年并与主申请人一同定居',
    titleEn: `${cl.values.skilledWorkerQualifyingYears.value} continuous years as a Skilled Worker dependent partner, settling with the principal applicant`,
    sources: [
      { srcId: 'SRC-004', locator: 'SW 39.1' },
      { srcId: 'SRC-004', locator: 'SW 42.1' },
      { srcId: 'SRC-004', locator: 'SW 43.1' },
      ...crResidenceSources,
    ],
    pendingDetails: [],
  },
  (ctx) => {
    const { timeline, simulationDate, principal } = ctx;
    const L = textFor(ctx);
    const years = cl.values.skilledWorkerQualifyingYears.value;
    if (!onSkilledWorkerPartner(timeline, simulationDate)) {
      return {
        status: 'FAIL',
        explanation: L(
          '当前不是 Skilled Worker 的 dependent partner 许可。',
          'Current permission is not as a Skilled Worker dependent partner.',
        ),
      };
    }
    if (!principal) {
      return {
        status: 'UNKNOWN',
        explanation: L(
          '填写主申请人信息后可判断。',
          'This can be assessed once the principal applicant’s details are provided.',
        ),
      };
    }
    const settled = settledPrincipal(ctx);
    const assumptions = [
      L(
        `只计连续的 Skilled Worker dependant 许可，假设整段都是同一主申请人的 dependent partner；Appendix Relationship with Partner（SW 39.3）未核对。`,
        'Only continuous Skilled Worker dependant permission is counted, assuming all of it was as the same principal applicant’s dependent partner; Appendix Relationship with Partner (SW 39.3) is not checked.',
      ),
      ...(settled ? [] : [settledPrincipalAssumption(L)]),
      ...(timeline.absences.length > 0 ? [absenceAssumption(L)] : []),
    ];
    const residence = skilledWorkerPartnerResidence(ctx);
    assumptions.push(
      ...residenceAssumptions(timeline, simulationDate, residence, L),
    );
    if (settled) {
      if (settled.met && !residence?.applicationDate) {
        return {
          status: 'FAIL',
          explanation: residencePending(residence!, years, L),
          assumptions,
        };
      }
      return settled.met
        ? {
            status: 'PASS',
            explanation: L(
              `${settled.explanation}；本人的 dependent partner 合格期为 ${years} 年，可从 ${residence!.applicationDate} 起申请（SW 42.1）。`,
              `${settled.explanation}; they can apply from ${residence!.applicationDate} based on their own ${years}-year qualifying period (SW 42.1).`,
            ),
            assumptions,
          }
        : { status: 'FAIL', explanation: settled.explanation, assumptions };
    }
    if (!residence) {
      return principalApplicationDate(ctx, 'CL-SW-RESIDENCE-5Y')
        ? noJointApplication(L, assumptions)
        : withoutPrincipalPathway(ctx, 'dependent partner', assumptions);
    }
    const pending = pendingOnJointDay(residence);
    if (pending.length)
      return pendingJoint(L, residence.applicationDate!, pending, assumptions);
    return {
      status: 'PASS',
      explanation: L(
        `与主申请人一同定居：按本人与主申请人各自的 ${years} 年合格期，可从 ${residence.applicationDate} 起一同申请（SW 39.1(a)、SW 42.1）。`,
        `Settling with the principal applicant: they can apply from ${residence.applicationDate}, based on their respective ${years}-year qualifying periods (SW 39.1(a), SW 42.1).`,
      ),
      assumptions,
    };
  },
);

/** A child has no qualifying period and can apply with the principal. */
export function skilledWorkerChildFiling(ctx: RuleContext) {
  if (
    !ctx.principal ||
    !onSkilledWorkerChild(ctx.timeline, ctx.simulationDate)
  ) {
    return undefined;
  }
  const settled = settledPrincipal(ctx);
  if (settled)
    return settled.met ? { applicationDate: settled.date } : undefined;
  const due = principalApplicationDate(ctx, 'CL-SW-RESIDENCE-5Y');
  if (!due) return undefined;
  const { timeline, simulationDate, locale } = ctx;
  return jointApplication(
    due,
    (notBefore) => childFiling(timeline, notBefore, 'SKILLED_WORKER'),
    (notBefore) =>
      skilledWorkerFiling(
        { timeline: ctx.principal!.timeline, simulationDate, locale },
        notBefore,
      ),
  );
}

export const clSwChild = defineRule(
  {
    id: 'CL-SW-CHILD',
    ruleSetId: RULE_SET,
    title: 'Skilled Worker dependent child 与主申请人一同定居',
    titleEn:
      'Skilled Worker dependent child settling with the principal applicant',
    sources: [
      { srcId: 'SRC-004', locator: 'SW 39.1' },
      { srcId: 'SRC-004', locator: 'SW 41A.1' },
      { srcId: 'SRC-018', locator: 'CHI 1.1' },
      { srcId: 'SRC-018', locator: 'CHI 1.2' },
      { srcId: 'SRC-018', locator: 'CHI 1A.1' },
      { srcId: 'SRC-018', locator: 'CHI 2.1' },
    ],
    pendingDetails: [],
  },
  (ctx) => {
    const { timeline, simulationDate, principal } = ctx;
    const L = textFor(ctx);
    if (!onSkilledWorkerChild(timeline, simulationDate)) {
      return {
        status: 'FAIL',
        explanation: L(
          '当前不是 Skilled Worker 的 dependent child 许可。',
          'Current permission is not as a Skilled Worker dependent child.',
        ),
      };
    }
    if (!principal) {
      return {
        status: 'UNKNOWN',
        explanation: L(
          '填写主申请人信息后可判断。',
          'This can be assessed once the principal applicant’s details are provided.',
        ),
      };
    }
    const settled = settledPrincipal(ctx);
    const minor =
      fullYears(timeline.dateOfBirth, simulationDate) <
      cl.values.settlementMinorAge.value;
    const assumptions = [
      L(
        '假设子女未 leading an independent life（CHI 1A.1）。',
        'The child is assumed not to be leading an independent life (CHI 1A.1).',
      ),
      ...(minor
        ? [
            L(
              '假设子女有符合英国法律的照护与住宿安排（CHI 2.1）。',
              'The child is assumed to have care and accommodation arrangements that comply with UK law (CHI 2.1).',
            ),
          ]
        : []),
      L(
        '只看申请日当天的 Skilled Worker dependent child 许可，假设是同一主申请人的子女；另一位家长须同时获批定居、已定居或为英国公民，除非主申请人负唯一抚养责任等（CHI 4.3，经 SW 39.4），本工具未核对。',
        'Only the Skilled Worker dependent child permission on the date of application is checked, assuming the child is the same principal applicant’s; the other parent must be granted settlement at the same time, already be settled or be a British citizen, unless the principal applicant has sole responsibility or similar (CHI 4.3, via SW 39.4); this tool does not check this.',
      ),
      settled
        ? L(
            '在英国出生、主申请人定居前出生的子女（SW 39.1(b)(ii)）未建模。',
            'Children born in the UK before the principal applicant settled (SW 39.1(b)(ii)) are not modelled.',
          )
        : settledPrincipalAssumption(L),
    ];
    const age = minor
      ? L(
          `申请日未满 ${cl.values.settlementMinorAge.value} 岁（CHI 1.1）`,
          `Under ${cl.values.settlementMinorAge.value} on the date of application (CHI 1.1)`,
        )
      : L(
          `申请日已满 ${cl.values.settlementMinorAge.value} 岁，但当前持有的是 dependent child 许可（CHI 1.2(a)）`,
          `Aged ${cl.values.settlementMinorAge.value} or over on the date of application, but currently holding dependent child permission (CHI 1.2(a))`,
        );
    if (settled) {
      return settled.met
        ? {
            status: 'PASS',
            explanation: L(
              `${age}；${settled.explanation}，可申请定居。`,
              `${age}; ${settled.explanation}, so they can apply for settlement.`,
            ),
            assumptions,
          }
        : { status: 'FAIL', explanation: settled.explanation, assumptions };
    }
    const filing = skilledWorkerChildFiling(ctx);
    const date = filing?.applicationDate;
    if (!date) {
      return principalApplicationDate(ctx, 'CL-SW-RESIDENCE-5Y')
        ? noJointApplication(L, assumptions)
        : withoutPrincipalPathway(ctx, 'dependent child', assumptions);
    }
    const pending = pendingOnJointDay(filing);
    if (pending.length) return pendingJoint(L, date, pending, assumptions);
    return {
      status: 'PASS',
      explanation: L(
        `${age}；随主申请人定居：可在 ${date} 与主申请人一同申请（SW 39.1(a)、SW 41A.1）；子女本人没有居留年限要求。`,
        `${age}; settling with the principal applicant: they can apply together on ${date} (SW 39.1(a), SW 41A.1); the child has no residence requirement of their own.`,
      ),
      assumptions,
    };
  },
);
