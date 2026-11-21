import { currentLaw2026_11 as cl } from '@uk-immigration/policy-data';
import { episodeOn, currentResidence } from '../../residence';
import type { CurrentResidence } from '../../residence';
import { defineRule, textFor } from '../../rule';
import type { ImmigrationEpisode, RuleContext } from '../../types';
import {
  crResidenceSources,
  residenceAssumptions,
  residenceCompleted,
  residencePending,
  RULE_SET,
  absenceAssumption,
  onInnovatorFounder,
} from './shared';

/**
 * Start of the continuous Innovator Founder main applicant permission
 * (INNF 18.1) ending on the simulation date, while on that route (INNF 19.1,
 * CR 3.1).
 */
export function innovatorFounderResidence({
  timeline,
  simulationDate,
}: RuleContext): CurrentResidence | undefined {
  if (!onInnovatorFounder(timeline, simulationDate)) return undefined;
  return currentResidence(
    timeline,
    simulationDate,
    (e) => e.route === 'INNOVATOR_FOUNDER' && e.role === 'MAIN',
    cl.values.innovatorFounderQualifyingYears.value,
  );
}

export const clInnovatorResidence3Y = defineRule(
  {
    id: 'CL-INNOVATOR-RESIDENCE-3Y',
    ruleSetId: RULE_SET,
    title: 'Innovator Founder 连续 3 年',
    titleEn: `${cl.values.innovatorFounderQualifyingYears.value} continuous years as an Innovator Founder`,
    sources: [
      { srcId: 'SRC-027', locator: 'INNF 18.1' },
      { srcId: 'SRC-027', locator: 'INNF 19.1' },
      ...crResidenceSources,
    ],
    pendingDetails: [],
  },
  (ctx) => {
    const L = textFor(ctx);
    const years = cl.values.innovatorFounderQualifyingYears.value;
    const residence = innovatorFounderResidence(ctx);
    if (!residence) {
      return {
        status: 'FAIL',
        explanation: L(
          '当前不是 Innovator Founder 主申请人许可。',
          'Current permission is not as an Innovator Founder main applicant.',
        ),
      };
    }
    const assumptions =
      ctx.timeline.absences.length > 0 ? [absenceAssumption(L)] : [];
    assumptions.push(
      ...residenceAssumptions(ctx.timeline, ctx.simulationDate, residence, L),
    );
    const { start } = residence;
    return residence.applicationDate === ctx.simulationDate
      ? {
          status: 'PASS',
          explanation: L(
            `自 ${start} 起连续持 Innovator Founder 许可，${residenceCompleted(residence, ctx.simulationDate, years, L)}（INNF 18.1）。`,
            `Continuous Innovator Founder permission since ${start}: ${residenceCompleted(residence, ctx.simulationDate, years, L)} (INNF 18.1).`,
          ),
          assumptions,
        }
      : {
          status: 'FAIL',
          explanation: L(
            `自 ${start} 起连续持 Innovator Founder 许可，${residencePending(residence, years, L)}（INNF 18.1）。`,
            `Continuous Innovator Founder permission since ${start}: ${residencePending(residence, years, L)} (INNF 18.1).`,
          ),
          assumptions,
        };
  },
);

// INNF 17.1(f): the sub-paragraph of each business criterion.
const INNOVATOR_CRITERIA: Record<
  NonNullable<ImmigrationEpisode['innovatorSettlementCriteria']>[number],
  string
> = {
  INVESTMENT: 'i',
  CUSTOMERS: 'ii',
  RESEARCH_AND_IP: 'iii',
  REVENUE: 'iv',
  EXPORT_REVENUE: 'v',
  JOBS: 'vi',
  JOBS_WITH_SALARY: 'vii',
};

export const clInnovatorEndorsement = defineRule(
  {
    id: 'CL-INNOVATOR-ENDORSEMENT',
    ruleSetId: RULE_SET,
    title: 'Innovator Founder 定居背书',
    titleEn: 'Innovator Founder settlement endorsement',
    sources: [
      { srcId: 'SRC-027', locator: 'INNF 15.2(e)' },
      { srcId: 'SRC-027', locator: 'INNF 17.1' },
      { srcId: 'SRC-027', locator: 'INNF 17.2' },
      { srcId: 'SRC-027', locator: 'INNF 17.3' },
      { srcId: 'SRC-027', locator: 'INNF 17.4' },
      { srcId: 'SRC-027', locator: 'INNF 17.5' },
    ],
    pendingDetails: [],
  },
  (ctx) => {
    const L = textFor(ctx);
    const required = cl.values.innovatorFounderSettlementCriteriaMinimum.value;
    const episode = episodeOn(ctx.timeline, ctx.simulationDate);
    const declared = episode?.innovatorSettlementCriteria;
    const endorser = episode?.innovatorSettlementEndorser;
    if (endorser === 'LEGACY_DIFFERENT') {
      return {
        status: 'FAIL',
        explanation: L(
          '定居背书信由另一家 Legacy Endorsing Body 出具。INNF 17.5 要求它与支持上次获批许可的机构相同。',
          'A different Legacy Endorsing Body issued the settlement letter. INNF 17.5 requires the body that supported the last grant of permission.',
        ),
      };
    }
    if (!declared) {
      return {
        status: 'UNKNOWN',
        explanation: L(
          `未填写业务已满足 INNF 17.1(f) 的哪几项；定居背书须至少满足 ${required} 项。`,
          `Not provided which of the INNF 17.1(f) business criteria have been met; the settlement endorsement needs at least ${required}.`,
        ),
      };
    }
    // The same criterion cannot count twice (INNF 17.2).
    const met = [...new Set(declared)].map(
      (c) => `INNF 17.1(f)(${INNOVATOR_CRITERIA[c]})`,
    );
    const list = met.length > 0 ? met.join(L('、', ', ')) : L('无', 'none');
    if (met.length < required) {
      return {
        status: 'FAIL',
        explanation: L(
          `业务已满足 ${met.length} 项（${list}），INNF 17.1(f) 须至少 ${required} 项。`,
          `The business has met ${met.length} of the criteria (${list}); INNF 17.1(f) requires at least ${required}.`,
        ),
      };
    }
    if (endorser === undefined) {
      return {
        status: 'UNKNOWN',
        explanation: L(
          '已达到业务项目数要求。请确认定居背书信是否由 Legacy Endorsing Body 出具，以及如是，是否由支持上次获批许可的同一机构出具（INNF 17.5）。',
          'The business meets the minimum number of criteria. Confirm whether a Legacy Endorsing Body issued the settlement letter and, if so, whether it supported the last grant of permission (INNF 17.5).',
        ),
      };
    }
    const endorserCheck =
      endorser === 'LEGACY_SAME'
        ? L(
            '定居背书信由支持上次获批许可的同一 Legacy Endorsing Body 出具（INNF 17.5）。',
            'The same Legacy Endorsing Body supported the last grant and issued the settlement letter (INNF 17.5).',
          )
        : L(
            '定居背书信由一般 Endorsing Body 出具。INNF 17.5 的同一机构条件适用于 Legacy Endorsing Body。',
            'A non-legacy Endorsing Body issued the settlement letter. The same-body condition in INNF 17.5 applies to Legacy Endorsing Bodies.',
          );
    return {
      status: 'PASS',
      explanation: L(
        `业务已满足 ${met.length} 项（${list}），达到 INNF 17.1(f) 的至少 ${required} 项。${endorserCheck}`,
        `The business has met ${met.length} of the criteria (${list}), at least the ${required} required by INNF 17.1(f). ${endorserCheck}`,
      ),
      assumptions: [
        L(
          '按 endorsing body 会确认 INNF 17.1(a)–(e)（对照原业务计划有显著成果、在 Companies House 登记且你是 director 或 member、仍在经营、未来至少 12 个月可持续、你在日常管理中起关键作用）处理；背书信须在申请前 3 个月内签发且未撤回（INNF 15.2(e)）。团队成员不能共用同一项（INNF 17.3），岗位须存在满 12 个月、每周至少 30 小时等（INNF 17.4），均未核实。',
          'Assumes the endorsing body will confirm INNF 17.1(a)–(e) (significant achievements against the business plan, registration with Companies House with you as a director or member, active trading, sustainability for at least the next 12 months, and your key role in day-to-day management); the endorsement letter must be issued no more than 3 months before the application and not withdrawn (INNF 15.2(e)). That team members cannot share a criterion (INNF 17.3) and that jobs must have existed for 12 months with at least 30 hours a week (INNF 17.4) are not checked.',
        ),
      ],
    };
  },
);
