import {
  careWorkerOccupations,
  earnedSettlement2026_11 as es,
  healthEducationTransitionalExamples,
  nationalPayScaleBelowRqf6Occupations,
} from '@uk-immigration/policy-data';
import { continuousRun, episodeOn } from '../residence';
import { defineRule, textFor } from '../rule';
import type { ImmigrationEpisode } from '../types';
import { gbp } from './es-contribution';

// One-off transitional arrangements (SRC-001 Chapter 8, p41–p45).

const CARE_CODES = careWorkerOccupations.occupations
  .map((o) => o.socCode)
  .join(' / ');

const isCareWorker = (e: ImmigrationEpisode) =>
  e.route === 'SKILLED_WORKER' &&
  e.role === 'MAIN' &&
  careWorkerOccupations.occupations.some((o) => o.socCode === e.socCode);

export const esTransitionalCareWorker = defineRule(
  {
    id: 'ES-TRANSITIONAL-CARE-WORKER',
    ruleSetId: 'earned-settlement-2026-11',
    title: 'care worker 过渡安排（保留 5 年）',
    titleEn: `Care worker transitional arrangements (retain ${es.values.pathwayYears5.value} years)`,
    sources: [
      { srcId: 'SRC-001', locator: 'p42' },
      { srcId: 'SRC-001', locator: 'p43' },
      { srcId: 'SRC-012', locator: 'cover' },
      ...careWorkerOccupations.sources,
    ],
    pendingDetails: ['PD-035', 'PD-036'],
  },
  ({ timeline, simulationDate, locale }) => {
    const L = textFor({ locale });
    const current = episodeOn(timeline, simulationDate);
    const threshold = es.values.careWorkerSalaryThreshold.value;
    if (
      current?.route === 'SKILLED_WORKER' &&
      current.role === 'MAIN' &&
      !current.socCode
    ) {
      return current.salary !== undefined && current.salary < threshold
        ? {
            status: 'FAIL',
            explanation: L(
              `薪资 ${gbp(current.salary)} 低于 care worker 过渡安排要求的 ${gbp(threshold)}。`,
              `Salary of ${gbp(current.salary)} is below the ${gbp(threshold)} required for the care worker transitional arrangement.`,
            ),
          }
        : {
            status: 'UNKNOWN',
            explanation: L(
              '请补充当前担保岗位的 SOC 2020 代码，以判断能否适用 care worker 过渡安排。',
              'Provide the SOC 2020 code of the current sponsored job to assess the care worker transitional arrangement.',
            ),
          };
    }
    if (!current || !isCareWorker(current)) {
      return {
        status: 'FAIL',
        explanation: L(
          `当前不是 care worker（SOC 2020 ${CARE_CODES}）的 Skilled Worker 签证，不适用 care worker 过渡安排。`,
          `The current permission is not a Skilled Worker visa as a care worker (SOC 2020 ${CARE_CODES}), so the care worker transitional arrangements do not apply.`,
        ),
      };
    }
    const cutoff = es.values.whitePaperPublished.value;
    const first = continuousRun(timeline, simulationDate, isCareWorker)
      .episodes[0];
    const entered = first.validFrom;
    const assumptions = [
      L(
        `截止点取 Immigration White Paper 的发布日 ${cutoff}（PD-035）；截止前开始的连续 care worker 许可用起始日近似判断，职业按 SOC 2020 ${CARE_CODES} 认定（PD-036）。`,
        `The cut-off is the Immigration White Paper publication date, ${cutoff} (PD-035). For continuous care worker permission that started before the cut-off, the start date is used as a proxy for route entry, with occupation identified by SOC 2020 ${CARE_CODES} (PD-036).`,
      ),
    ];
    if (entered >= cutoff) {
      // Known facts settle the case before the unsettled cut-off question.
      if (current.salary !== undefined && current.salary < threshold) {
        return {
          status: 'FAIL',
          explanation: L(
            `薪资 ${gbp(current.salary)} 低于 care worker 过渡安排要求的 ${gbp(threshold)}。`,
            `Salary of ${gbp(current.salary)} is below the ${gbp(threshold)} required for the care worker transitional arrangement.`,
          ),
          assumptions,
        };
      }
      const priorCareWork = timeline.episodes.some(
        (e) => isCareWorker(e) && e.validFrom < cutoff,
      );
      // SW 1.2(d): the CoS is issued before the application.
      if (
        !priorCareWork &&
        first.sponsorshipCertificateDate &&
        first.sponsorshipCertificateDate >= cutoff
      ) {
        return {
          status: 'FAIL',
          explanation: L(
            `care worker 许可的 CoS 于 ${first.sponsorshipCertificateDate} 签发，申请不可能早于截止点 ${cutoff}（SRC-004 SW 1.2(d)），不属过渡群体。`,
            `The CoS for the care worker permission was issued on ${first.sponsorshipCertificateDate}, so the application cannot predate the ${cutoff} cut-off (SRC-004 SW 1.2(d)); the transitional group does not apply.`,
          ),
          sources: [
            { srcId: 'SRC-001', locator: 'p42' },
            { srcId: 'SRC-004', locator: 'SW 1.2(d)' },
          ],
          assumptions,
        };
      }
      return priorCareWork
        ? {
            status: 'UNKNOWN',
            explanation: L(
              `截止点 ${cutoff} 前曾是 care worker，但当前这段 care worker 许可自 ${entered} 起，是否仍属过渡群体未定。`,
              `Was a care worker before the cut-off of ${cutoff}, but the current care worker permission runs from ${entered}; whether this still falls within the transitional group is not settled.`,
            ),
            pendingDetails: ['PD-036'],
            assumptions,
          }
        : {
            status: 'UNKNOWN',
            explanation: L(
              `care worker 许可从 ${entered} 起，位于截止点 ${cutoff} 当日或之后。仅凭许可日期无法排除在截止前申请；跨截止点时以申请、获批还是入境日为准仍待公布。`,
              `Care worker permission starts on ${entered}, on or after the ${cutoff} cut-off. That date alone cannot rule out an application before the cut-off. Which date governs across the cut-off (application, grant or arrival) remains unsettled.`,
            ),
            pendingDetails: ['PD-036'],
            assumptions,
          };
    }
    if (current.salary === undefined) {
      return {
        status: 'UNKNOWN',
        explanation: L(
          `自 ${entered} 起在截止点前进入 care worker 路线；未填写薪资，无法判断是否达到 ${gbp(threshold)}。`,
          `Entered the care worker route on ${entered}, before the cut-off; salary not provided, so whether it reaches ${gbp(threshold)} cannot be determined.`,
        ),
        assumptions,
      };
    }
    if (current.salary < threshold) {
      return {
        status: 'FAIL',
        explanation: L(
          `薪资 ${gbp(current.salary)} 低于过渡安排要求的 ${gbp(threshold)}，满 ${es.values.pathwayYears5.value} 年时不能凭此定居。仅限从事该行业真实工作，才可再申请一次 ${es.values.pathwayYears5.value} 年 Health and Care 签证，之后可再申请定居（p43；p45 案例 B）。`,
          `Salary of ${gbp(current.salary)} is below the ${gbp(threshold)} required, so settlement on this basis is unavailable after ${es.values.pathwayYears5.value} years. A further ${es.values.pathwayYears5.value}-year Health and Care visa can be applied for once, only for genuine work in the sector, before applying again for settlement (p43; p45 Individual B).`,
        ),
        sources: [
          {
            srcId: 'SRC-001',
            locator: 'p42–p43, Care workers; p45, Individual B',
          },
        ],
        assumptions,
      };
    }
    return {
      status: 'PASS',
      explanation: L(
        `自 ${entered} 起在截止点 ${cutoff} 前进入 care worker 路线，薪资 ${gbp(current.salary)} 达到 ${gbp(threshold)}，保留 5 年合格期；仍须满足犯罪记录、B2 英语等强化最低要求。`,
        `Entered the care worker route on ${entered}, before the cut-off of ${cutoff}, with a salary of ${gbp(current.salary)} that reaches ${gbp(threshold)}: the 5-year qualifying period is retained. The strengthened minimum requirements, such as criminality and B2 English, still apply.`,
      ),
      assumptions: [
        ...assumptions,
        L(
          '过渡安排另要求满足担保与雇佣要求（p42），本工具未核实。',
          'The transitional arrangements also require the sponsorship and employment requirements to be met (p42); this tool does not check them.',
        ),
      ],
    };
  },
);

const inList = (list: { socCode: string }[], soc: string | undefined) =>
  soc !== undefined && list.some((o) => o.socCode === soc);

const EXAMPLES = healthEducationTransitionalExamples.occupations;

export const esTransitionalHealthEducation = defineRule(
  {
    id: 'ES-TRANSITIONAL-HEALTH-EDUCATION',
    ruleSetId: 'earned-settlement-2026-11',
    title: 'RQF6 以下国家薪级医疗 / 教育岗位过渡安排（保留 5 年）',
    titleEn: `Transitional arrangement for health / education jobs on national pay scales below RQF 6 (retain ${es.values.pathwayYears5.value} years)`,
    sources: [
      { srcId: 'SRC-001', locator: 'p44' },
      { srcId: 'SRC-001', locator: 'p42' },
      { srcId: 'SRC-001', locator: 'p46' },
      { srcId: 'SRC-012', locator: 'cover' },
      ...nationalPayScaleBelowRqf6Occupations.sources,
    ],
    pendingDetails: ['PD-038', 'PD-039'],
  },
  ({ timeline, simulationDate, locale }) => {
    const L = textFor({ locale });
    const current = episodeOn(timeline, simulationDate);
    const soc = current?.socCode;
    const cutoff = es.values.whitePaperPublished.value;
    const arrived = timeline.episodes.map((e) => e.validFrom).sort()[0];
    if (
      current?.route === 'SKILLED_WORKER' &&
      current.role === 'MAIN' &&
      !soc &&
      arrived < cutoff
    ) {
      return {
        status: 'UNKNOWN',
        explanation: L(
          '请补充当前担保岗位的 SOC 2020 代码，以判断能否适用医疗或教育岗位过渡安排。',
          'Provide the SOC 2020 code of the current sponsored job to assess the health or education transitional arrangement.',
        ),
      };
    }
    if (
      current?.route !== 'SKILLED_WORKER' ||
      current.role !== 'MAIN' ||
      !inList(nationalPayScaleBelowRqf6Occupations.occupations, soc)
    ) {
      return {
        status: 'FAIL',
        explanation: L(
          '当前不是 RQF6 以下、国家薪级的医疗 / 教育职业（Appendix Skilled Occupations Table 3a）的 Skilled Worker 签证，不适用该过渡安排。',
          'The current permission is not a Skilled Worker visa in a health / education occupation on a national pay scale below RQF 6 (Appendix Skilled Occupations Table 3a), so this transitional arrangement does not apply.',
        ),
      };
    }
    const examples = EXAMPLES.map((o) =>
      L(`${o.title}（${o.socCode}）`, `${o.title} (${o.socCode})`),
    ).join(L('、', ' and '));
    if (!inList(EXAMPLES, soc)) {
      return {
        status: 'UNKNOWN',
        explanation: L(
          `SOC ${soc} 属 Table 3a 的 RQF6 以下国家薪级职业，但原文只举了 ${examples} 两例，是否适用未定。`,
          `SOC ${soc} is a national pay scale occupation below RQF 6 in Table 3a, but the response only gives ${examples} as examples; whether the arrangement applies is not settled.`,
        ),
        pendingDetails: ['PD-038'],
      };
    }
    const inJob = continuousRun(
      timeline,
      simulationDate,
      (e) => e.route === 'SKILLED_WORKER' && e.socCode === soc,
    ).episodes[0].validFrom;
    const assumptions = [
      L(
        `截止点取 Immigration White Paper 的发布日 ${cutoff}；职业按 SOC 2020 ${EXAMPLES.map((o) => o.socCode).join(' / ')} 认定，"来到英国"按最早一段许可的起始日判断（PD-038、PD-039）。`,
        `The cut-off is taken as the Immigration White Paper publication date, ${cutoff}; the occupation is judged by SOC 2020 ${EXAMPLES.map((o) => o.socCode).join(' / ')}, and “came to the UK” by the start of the earliest permission (PD-038, PD-039).`,
      ),
    ];
    if (inJob < cutoff) {
      return {
        status: 'PASS',
        explanation: L(
          `自 ${inJob} 起以 SOC ${soc} 持 Skilled Worker 签证，早于 White Paper 发布日 ${cutoff}，保留 5 年合格期；仍须满足犯罪记录、B2 英语等强化最低要求。`,
          `Has held a Skilled Worker visa in SOC ${soc} since ${inJob}, before the White Paper publication date of ${cutoff}: the 5-year qualifying period is retained. The strengthened minimum requirements, such as criminality and B2 English, still apply.`,
        ),
        assumptions: [
          ...assumptions,
          L(
            'p44 本节未提强化最低要求；按 Table 1"强制要求适用于所有路径"（p46）处理。"满足签证要求"本工具未核实。',
            'p44 does not mention the strengthened minimum requirements; they are applied following Table 1, “all mandatory requirements apply to all settlement pathways” (p46). Whether the visa requirements are met is not checked by this tool.',
          ),
        ],
      };
    }
    return arrived < cutoff
      ? {
          status: 'UNKNOWN',
          explanation: L(
            `${arrived} 起在英，早于截止点 ${cutoff}，但自 ${inJob} 起才从事 SOC ${soc}；截止前来英、截止后才转入该职业是否适用未定。`,
            `In the UK since ${arrived}, before the cut-off of ${cutoff}, but in SOC ${soc} only since ${inJob}; whether the arrangement applies to someone who came before the cut-off but moved into the occupation after it is not settled.`,
          ),
          pendingDetails: ['PD-039'],
          assumptions,
        }
      : {
          status: 'FAIL',
          explanation: L(
            `${arrived} 起才来英，不早于 White Paper 发布日 ${cutoff}，不适用过渡安排，走标准 Earned Settlement 路径。`,
            `Came to the UK on ${arrived}, not before the White Paper publication date of ${cutoff}: the transitional arrangement does not apply, and the standard Earned Settlement pathways are used.`,
          ),
          assumptions,
        };
  },
);
