import {
  currentLaw2026_11 as cl,
  goingRates,
  healthAndCareAsheOccupations,
  immigrationSalaryListOccupations,
  nationalPayScaleOccupations,
  table3DirectPayOccupations,
} from '@uk-immigration/policy-data';
import { fullYears } from '../../dates';
import {
  continuousRun,
  episodeOn,
  currentResidence,
  settledBy,
} from '../../residence';
import type { CurrentResidence } from '../../residence';
import { defineRule, textFor } from '../../rule';
import type { Lang } from '../../rule';
import { gbp } from '../es-contribution';
import type { GoingRate, Route } from '@uk-immigration/policy-data';
import type {
  ImmigrationEpisode,
  IsoDate,
  RuleContext,
  RuleId,
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
  isSkilledWorkerPartner,
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
export function skilledWorkerResidence({
  timeline,
  simulationDate,
}: RuleContext): CurrentResidence | undefined {
  if (!onSkilledWorker(timeline, simulationDate)) return undefined;
  return currentResidence(
    timeline,
    simulationDate,
    countsForSkilledWorker,
    cl.values.skilledWorkerQualifyingYears.value,
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

/** SW 24.3 row E (Tier 2 STEM) is outside the model. */
type SalaryRow = 'A' | 'B' | 'C' | 'D';

const SALARY_THRESHOLDS = {
  A: cl.values.skilledWorkerGeneralSalaryThreshold,
  B: cl.values.skilledWorkerSettlementSalaryRowB,
  C: cl.values.skilledWorkerSettlementSalaryRowC,
  D: cl.values.skilledWorkerSettlementSalaryRowD,
};

const inTable = (rows: { socCode: string }[], soc: string | undefined) =>
  soc !== undefined && rows.some((r) => r.socCode === soc);

function wasSponsoredOnIsl(episode: ImmigrationEpisode): boolean | undefined {
  if (episode.immigrationSalaryList !== undefined) {
    return episode.immigrationSalaryList;
  }
  const entries = immigrationSalaryListOccupations.entries.filter(
    (entry) => entry.socCode === episode.socCode,
  );
  if (!episode.socCode) return undefined;
  const eligible = entries.filter(
    (entry) =>
      !entry.removalDate ||
      !episode.sponsorshipCertificateDate ||
      episode.sponsorshipCertificateDate < entry.removalDate,
  );
  if (eligible.length === 0) return false;
  if (
    eligible.some(
      (entry) =>
        entry.criteria === 'all jobs' &&
        entry.nations === 'England, Scotland, Wales and Northern Ireland' &&
        (!entry.removalDate ||
          (episode.sponsorshipCertificateDate ?? episode.validFrom) <
            entry.removalDate),
    )
  )
    return true;
  return undefined;
}

/** HC 590 implementation retained the old rules where the CoS predated the change. */
function underPre2024Rules(first: ImmigrationEpisode): boolean | undefined {
  const cutoff = cl.values.skilledWorkerPre2024RulesBefore.value;
  if (first.sponsorshipCertificateDate)
    return first.sponsorshipCertificateDate < cutoff;
  return first.validFrom < cutoff ? true : undefined;
}

function settlementSalaryRows({
  timeline,
  simulationDate,
  locale,
}: RuleContext) {
  const current = episodeOn(timeline, simulationDate);
  if (!current || !isSkilledWorker(current)) return undefined;
  const L = textFor({ locale });
  const first = continuousRun(timeline, simulationDate, isSkilledWorker)
    .episodes[0];
  const pre2024 = underPre2024Rules(first);
  const transitional =
    simulationDate < cl.values.skilledWorkerPre2024ApplicationsBefore.value &&
    pre2024;
  const soc = current.socCode;
  const table3 = inTable(nationalPayScaleOccupations.rows, soc);
  const ashe = inTable(healthAndCareAsheOccupations.occupations, soc);
  const isl = wasSponsoredOnIsl(current);
  const lowerRows = ashe || transitional;
  const assumptions = [
    L(
      'SW 24.3 row E（5 年期含 Tier 2 (General) 下的 STEM 类 SOC 2010 职业）未建模。',
      'SW 24.3 row E (a 5-year period including STEM occupations under SOC 2010 on Tier 2 (General)) is not modelled.',
    ),
  ];
  if (!table3 && isl !== false && current.immigrationSalaryList === undefined) {
    assumptions.push(
      isl
        ? L(
            '按最近一次许可的 CoS 签发日（未填时以早于移除日的许可起始日佐证）和 SRC-019 上适用全英国及该 SOC 全部岗位的条目判断 ISL。',
            'ISL is assessed for the latest grant from its CoS issue date (or a permission start before removal) and the SRC-019 entry covering all jobs in that SOC across the UK.',
          )
        : L(
            '最近一次许可的 ISL 资格待确认。请核对 CoS 签发日、岗位和工作地区，或确认最近一次许可的担保记录（SW 24.3 rows B/D，SRC-019）。',
            'ISL status for the most recent permission is unconfirmed. Check the CoS issue date, job and UK nation, or confirm the sponsorship record for that grant (SW 24.3 rows B/D, SRC-019).',
          ),
    );
  }
  if (!table3 && ashe && transitional !== true) {
    assumptions.push(
      L(
        `SOC ${soc} 属 Health and Care ASHE 职业列表，按 SW A1.1(a)–(m) 假设其担保、雇用或服务安排符合要求。`,
        `SOC ${soc} is on the Health and Care ASHE list. The sponsorship, employment or service arrangements are assumed to meet SW A1.1(a)–(m).`,
      ),
    );
  }
  if (!table3 && !ashe && transitional !== false) {
    assumptions.push(
      transitional
        ? L(
            '连续 Skilled Worker 许可的首段按过渡日前的规则获批，且申请日在过渡期限内（SW 4.2(b)(ii)）。',
            'The first grant in the continuous Skilled Worker period was made under the earlier rules and the application is within the transition deadline (SW 4.2(b)(ii)).',
          )
        : L(
            '连续 Skilled Worker 许可的首段是否按旧规则获批待确认（SW 4.2(b)(ii)）。',
            'It is unconfirmed whether the first grant in the continuous Skilled Worker period was made under the earlier rules (SW 4.2(b)(ii)).',
          ),
    );
  }
  const rows: SalaryRow[] = table3 ? ['D'] : [];
  if (!table3) {
    if (lowerRows !== true) {
      if (isl !== true) rows.push('A');
      if (isl !== false) rows.push('B');
    }
    if (lowerRows !== false) {
      if (isl !== true) rows.push('C');
      if (isl !== false) rows.push('D');
    }
  }
  return { current, first, pre2024, table3, isl, rows, assumptions };
}

function salaryStatus(statuses: RuleResult['status'][]): RuleResult['status'] {
  return statuses.every((status) => status === statuses[0])
    ? statuses[0]
    : 'UNKNOWN';
}

export const clSwSalary = defineRule(
  {
    id: 'CL-SW-SALARY',
    ruleSetId: RULE_SET,
    title: 'Skilled Worker 定居薪资（general salary）',
    titleEn: 'Skilled Worker settlement salary (general salary)',
    sources: [
      { srcId: 'SRC-004', locator: 'SW 24.3' },
      { srcId: 'SRC-004', locator: 'SW 4.2(b)' },
      { srcId: 'SRC-004', locator: 'SW 11.1–11.3' },
      { srcId: 'SRC-004', locator: 'SW A1.1' },
      { srcId: 'SRC-017', locator: 'Table 3' },
      immigrationSalaryListOccupations.source,
    ],
    pendingDetails: [],
  },
  (ctx) => {
    const L = textFor(ctx);
    const facts = settlementSalaryRows(ctx);
    if (!facts) {
      return {
        status: 'FAIL',
        explanation: L(
          '当前不是 Skilled Worker 主申请人许可。',
          'Current permission is not as a Skilled Worker main applicant.',
        ),
      };
    }
    const {
      current: { salary, socCode },
      rows,
      assumptions,
    } = facts;
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
    const thresholds = rows
      .map((row) => `row ${row}: ${gbp(SALARY_THRESHOLDS[row].value)}`)
      .join(L('；', '; '));
    const status = salaryStatus(
      rows.map((row) =>
        salary >= SALARY_THRESHOLDS[row].value ? 'PASS' : 'FAIL',
      ),
    );
    if (status === 'UNKNOWN' || (!socCode && status === 'FAIL')) {
      return {
        status: 'UNKNOWN',
        explanation: L(
          `当前年薪 ${gbp(salary)}。核对职业代码、最近一次担保及旧规资格后，才能确定 SW 24.3 的一般薪资门槛（${thresholds}）。`,
          `Current salary is ${gbp(salary)}. Check the occupation code, most recent sponsorship and transitional eligibility to determine the general salary threshold under SW 24.3 (${thresholds}).`,
        ),
        assumptions,
      };
    }
    return {
      status,
      explanation: L(
        `当前年薪 ${gbp(salary)}，${status === 'PASS' ? '达到' : '低于'} SW 24.3 的一般薪资门槛（${thresholds}）。`,
        `The current salary of ${gbp(salary)} ${status === 'PASS' ? 'meets' : 'is below'} the general salary threshold under SW 24.3 (${thresholds}).`,
      ),
      assumptions,
    };
  },
);

// Going-rate tables for each SW 24.3 row, in lookup order (row D's Table 3
// occupations use the national pay scales in Tables 3–5, not extracted).
const GOING_RATE_TABLES: Record<SalaryRow, GoingRate['table'][]> = {
  A: ['1', '1a'],
  B: ['1', '1a'],
  C: ['2', '2aa', '2a'],
  D: ['2', '2aa', '2a'],
};

/** SW 6.1 and SRC-017 Tables 1a, 2aa and 2a. */
function rateIsAvailable(
  rate: GoingRate,
  facts: NonNullable<ReturnType<typeof settlementSalaryRows>>,
) {
  const { first, current, isl, pre2024 } = facts;
  if (rate.table === '2a') return pre2024 === true;
  if (rate.table !== '1a' && rate.table !== '2aa') return true;
  const exception = current.skilledWorkerSponsorshipException;
  return (
    first.validFrom < cl.values.skilledWorkerPre2025RulesBefore.value ||
    (rate.table === '2aa' && pre2024 === true) ||
    isl === true ||
    exception === 'TEMPORARY_SHORTAGE_LIST' ||
    exception === (rate.table === '1a' ? 'OPTION_D' : 'OPTION_I')
  );
}

export const clSwGoingRate = defineRule(
  {
    id: 'CL-SW-GOING-RATE',
    ruleSetId: RULE_SET,
    title: 'Skilled Worker 定居薪资（going rate）',
    titleEn: 'Skilled Worker settlement salary (going rate)',
    sources: [
      { srcId: 'SRC-004', locator: 'SW 24.3' },
      { srcId: 'SRC-004', locator: 'SW 6.1–6.1A, SW 11.1–11.3' },
      { srcId: 'SRC-004', locator: 'SW 14.4' },
      goingRates.source,
      { srcId: 'SRC-017', locator: 'Table 3, going rate column' },
      immigrationSalaryListOccupations.source,
    ],
    pendingDetails: [],
  },
  (ctx) => {
    const L = textFor(ctx);
    const facts = settlementSalaryRows(ctx);
    if (!facts) {
      return {
        status: 'FAIL',
        explanation: L(
          '当前不是 Skilled Worker 主申请人许可。',
          'Current permission is not as a Skilled Worker main applicant.',
        ),
      };
    }
    const {
      current: { socCode, salary },
      rows,
      table3,
    } = facts;
    if (socCode === undefined) {
      return {
        status: 'UNKNOWN',
        explanation: L(
          '未填写当前 Skilled Worker 工作的 SOC 2020 职业代码，无法查 going rate。',
          'SOC 2020 code for the current Skilled Worker job not provided, so the going rate cannot be looked up.',
        ),
      };
    }
    if (table3) {
      const directlyListed = table3DirectPayOccupations[socCode];
      const payBasis =
        directlyListed === 'SOME_JOBS'
          ? L(
              '部分岗位由 Table 3 直接列金额，其余须查 Table 4',
              'Table 3 lists amounts for some jobs; the others use Table 4',
            )
          : directlyListed === 'ALL_JOBS'
            ? L(
                'Table 3 按岗位、地区和薪级列出金额',
                'Table 3 lists amounts by job, nation and grade',
              )
            : L(
                '薪级须查 Table 4 / 5',
                'The relevant pay band is in Table 4 / 5',
              );
      return {
        status: 'UNKNOWN',
        explanation: L(
          `SOC ${socCode}：${payBasis}，本工具无法核对适用的 going rate（SRC-017 Tables 3–5）。`,
          `SOC ${socCode}: ${payBasis}. This tool cannot check the applicable going rate (SRC-017 Tables 3–5).`,
        ),
      };
    }
    if (salary === undefined) {
      return {
        status: 'UNKNOWN',
        explanation: L(
          '未填写当前 Skilled Worker 工作的年薪。',
          'Salary for the current Skilled Worker job not provided.',
        ),
      };
    }
    const assumptions = [
      L(
        'going rate 按标准工时的全额年薪比较，未按实际工时折算（SW 14.4）。',
        'The going rate is compared as the full annual salary for standard hours, without pro-rating for actual hours (SW 14.4).',
      ),
    ];
    const rates = rows.map((row) =>
      GOING_RATE_TABLES[row]
        .map((table) =>
          goingRates.rows.find(
            (r) => r.table === table && r.socCode === socCode,
          ),
        )
        .find((rate) => rate && rateIsAvailable(rate, facts)),
    );
    if (rates.some((rate) => rate?.table === '2a')) {
      assumptions.push(
        L(
          'Table 2a 还要求为同一 sponsor 工作（SW 6.1(f)），本工具未核对。',
          'Table 2a also requires working for the same sponsor (SW 6.1(f)); this tool does not check this.',
        ),
      );
    }
    const status = salaryStatus(
      rates.map((rate) =>
        !rate ? 'UNKNOWN' : salary >= rate.goingRate ? 'PASS' : 'FAIL',
      ),
    );
    const thresholds = rates
      .flatMap((rate, index) =>
        rate
          ? [`row ${rows[index]}, Table ${rate.table}: ${gbp(rate.goingRate)}`]
          : [],
      )
      .join(L('；', '; '));
    return {
      status,
      explanation:
        status === 'UNKNOWN'
          ? L(
              `无法确定 SOC ${socCode} 适用的 going rate。请核对 SW 24.3 的薪资行、职业代码与许可记录；Table 1a / 2aa 可按旧规资格或适用的 Option D / I、Temporary Shortage List 担保例外（SW 6.1）。`,
              `The going rate for SOC ${socCode} cannot be confirmed. Check the row under SW 24.3, the occupation and the permission history; Tables 1a / 2aa allow transitional eligibility or the applicable Option D / I or Temporary Shortage List sponsorship exception (SW 6.1).`,
            )
          : L(
              `SOC ${socCode} 的 going rate（${thresholds}）；当前年薪 ${gbp(salary)}，${status === 'PASS' ? '已达到' : '低于要求'}。`,
              `The going rate for SOC ${socCode} (${thresholds}); the current salary of ${gbp(salary)} ${status === 'PASS' ? 'meets it' : 'is below it'}.`,
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

/**
 * SW 39.1(b): P has settled. Met when P settled from Skilled Worker
 * permission and the dependant then held permission as P's partner or child
 * (SW 39.1(b)(ii), born in the UK before P settled, is not modelled).
 */
function settledPrincipal(
  ctx: RuleContext,
):
  { met: boolean | undefined; date: IsoDate; explanation: string } | undefined {
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
  if (
    then &&
    isSkilledWorkerDependant(then) &&
    then.dependantOf === undefined
  ) {
    return {
      met: undefined,
      date: settled.date,
      explanation: L(
        '主申请人定居时，本人的 Skilled Worker dependant 许可未注明家属身份（SW 39.1(b)）。',
        'The relationship on the Skilled Worker dependant permission held when the principal settled is unavailable (SW 39.1(b)).',
      ),
    };
  }
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
): CurrentResidence | undefined {
  const { timeline, simulationDate } = ctx;
  if (!ctx.principal || !onSkilledWorkerPartner(timeline, simulationDate)) {
    return undefined;
  }
  const settled = settledPrincipal(ctx);
  const principalDate = settled
    ? settled.date
    : principalApplicationDate(ctx, 'CL-SW-RESIDENCE-5Y');
  if (settled ? !settled.met : !principalDate) return undefined;
  const own = currentResidence(
    timeline,
    simulationDate,
    isSkilledWorkerPartner,
    cl.values.skilledWorkerQualifyingYears.value,
  )!;
  const applicationDate =
    principalDate && principalDate > own.applicationDate
      ? principalDate
      : own.applicationDate;
  return { ...own, applicationDate };
}

export const clSwPartner5Y = defineRule(
  {
    id: 'CL-SW-PARTNER-5Y',
    ruleSetId: RULE_SET,
    title: 'Skilled Worker dependent partner 连续 5 年并与主申请人一同定居',
    titleEn: `${cl.values.skilledWorkerQualifyingYears.value} continuous years as a Skilled Worker dependent partner, settling with the principal applicant`,
    sources: [
      { srcId: 'SRC-004', locator: 'SW 39.1' },
      { srcId: 'SRC-004', locator: 'SW 38.1–38.2' },
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
        `只计连续的 Skilled Worker dependent partner 许可，假设填报的伴侣许可都属于同一主申请人；Appendix Relationship with Partner（SW 39.3）未核对。`,
        'Only continuous Skilled Worker dependent partner permission is counted, assuming the declared partner permissions were with the same principal applicant; Appendix Relationship with Partner (SW 39.3) is not checked.',
      ),
      ...(settled ? [] : [settledPrincipalAssumption(L)]),
      ...(timeline.absences.length > 0 ? [absenceAssumption(L)] : []),
    ];
    const residence = skilledWorkerPartnerResidence(ctx);
    if (residence && residence.applicationDate > simulationDate) {
      const possible = currentResidence(
        timeline,
        simulationDate,
        (e) =>
          isSkilledWorkerDependant(e) &&
          (e.dependantOf === undefined || e.dependantOf === 'PARTNER'),
        years,
      );
      if (
        possible &&
        possible.applicationDate < residence.applicationDate &&
        possible.start < residence.start
      ) {
        return {
          status: 'UNKNOWN',
          explanation: L(
            '较早的 Skilled Worker dependant 许可未注明家属身份，须确认是否为同一主申请人的伴侣许可（SW 42.1）。',
            'Earlier Skilled Worker dependant permissions do not specify the relationship. Check whether they were as the same principal applicant’s partner (SW 42.1).',
          ),
          assumptions,
        };
      }
    }
    assumptions.push(
      ...residenceAssumptions(timeline, simulationDate, residence, L),
    );
    if (settled) {
      return settled.met
        ? {
            status: 'PASS',
            explanation: L(
              `${settled.explanation}；本人的 dependent partner 合格期为 ${years} 年，可从 ${residence!.applicationDate} 起申请（SW 42.1）。`,
              `${settled.explanation}; they can apply from ${residence!.applicationDate} based on their own ${years}-year qualifying period (SW 42.1).`,
            ),
            assumptions,
          }
        : {
            status: settled.met === false ? 'FAIL' : 'UNKNOWN',
            explanation: settled.explanation,
            assumptions,
          };
    }
    if (!residence) {
      return withoutPrincipalPathway(ctx, 'dependent partner', assumptions);
    }
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
export function skilledWorkerChildDate(ctx: RuleContext): IsoDate | undefined {
  if (
    !ctx.principal ||
    !onSkilledWorkerChild(ctx.timeline, ctx.simulationDate)
  ) {
    return undefined;
  }
  const settled = settledPrincipal(ctx);
  if (settled) return settled.met ? settled.date : undefined;
  return principalApplicationDate(ctx, 'CL-SW-RESIDENCE-5Y');
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
    const date = skilledWorkerChildDate(ctx);
    if (!date) {
      return withoutPrincipalPathway(ctx, 'dependent child', assumptions);
    }
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
