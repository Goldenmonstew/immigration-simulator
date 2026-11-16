import { currentLaw2026_11 as cl } from '@uk-immigration/policy-data';
import { addYears, fullYears, fullYearsEn } from '../../dates';
import { continuousRun } from '../../residence';
import { defineRule, textFor } from '../../rule';
import type { IsoDate, RuleContext } from '../../types';
import { RULE_SET, isProtection, onProtection } from './shared';

/**
 * Start of the continuous period with refugee status or humanitarian
 * protection (STP 3.1) ending on the simulation date, while a protection main
 * applicant. Appendix Settlement Protection does not refer to Appendix
 * Continuous Residence, so absences do not restart it (PD-071).
 */
export function protectionStart({
  timeline,
  simulationDate,
}: RuleContext): IsoDate | undefined {
  if (!onProtection(timeline, simulationDate)) return undefined;
  return continuousRun(timeline, simulationDate, isProtection).episodes[0]
    .validFrom;
}

export const clProtectionResidence5Y = defineRule(
  {
    id: 'CL-PROTECTION-RESIDENCE-5Y',
    ruleSetId: RULE_SET,
    title: '连续 5 年持 refugee status 或 humanitarian protection',
    titleEn: `${cl.values.protectionQualifyingYears.value} continuous years with refugee status or humanitarian protection`,
    sources: [
      { srcId: 'SRC-023', locator: 'STP 1.3' },
      { srcId: 'SRC-023', locator: 'STP 3.1' },
    ],
    pendingDetails: ['PD-071', 'PD-073'],
  },
  (ctx) => {
    const L = textFor(ctx);
    const years = cl.values.protectionQualifyingYears.value;
    const start = protectionStart(ctx);
    if (!start) {
      return {
        status: 'FAIL',
        explanation: L(
          '当前不是以主申请人身份持 refugee status 或 humanitarian protection 的许可。',
          'Current permission is not as a main applicant with refugee status or humanitarian protection.',
        ),
      };
    }
    const assumptions = [
      L(
        'STP 1.3 按申请庇护的日期列明许可类别：2022-06-28 前申请的为 refugee 或 humanitarian protection 许可，此后申请的为 refugee permission to stay；本工具不区分 refugee 与 humanitarian protection，按你持有所列许可处理。2022-06-28 及以后申请庇护而获 humanitarian protection 的，STP 1.3(b) 未列明（PD-073）。',
        'STP 1.3 lists the permission by the date of the asylum application: refugee or humanitarian protection permission for applications before 2022-06-28, and refugee permission to stay for later ones. This tool does not tell refugee status and humanitarian protection apart, and assumes you hold a listed permission. Humanitarian protection following an asylum application made on or after 2022-06-28 is not listed in STP 1.3(b) (PD-073).',
      ),
      ...(ctx.timeline.absences.length > 0
        ? [
            L(
              'Appendix Settlement Protection 未引用 Appendix Continuous Residence，也没有规定多长的缺席会中断 STP 3.1 的连续期间；本工具不因缺席重新起算（PD-071）。',
              'Appendix Settlement Protection does not refer to Appendix Continuous Residence and does not say what absence breaks the continuous period in STP 3.1; this tool does not restart the period for absences (PD-071).',
            ),
          ]
        : []),
    ];
    const due = addYears(start, years);
    return due <= ctx.simulationDate
      ? {
          status: 'PASS',
          explanation: L(
            `自 ${start} 起在英国连续持 refugee status 或 humanitarian protection，已满 ${years} 年（STP 3.1）。`,
            `Continuously in the UK with refugee status or humanitarian protection since ${start}: ${years} years completed (STP 3.1).`,
          ),
          assumptions,
        }
      : {
          status: 'FAIL',
          explanation: L(
            `自 ${start} 起在英国连续持 refugee status 或 humanitarian protection，截至 ${ctx.simulationDate} 满 ${fullYears(start, ctx.simulationDate)} 年；${due} 满 ${years} 年（STP 3.1）。`,
            `Continuously in the UK with refugee status or humanitarian protection since ${start}: ${fullYearsEn(start, ctx.simulationDate)} by ${ctx.simulationDate}; ${years} years are completed on ${due} (STP 3.1).`,
          ),
          assumptions,
        };
  },
);

export const clProtectionStatus = defineRule(
  {
    id: 'CL-PROTECTION-STATUS',
    ruleSetId: RULE_SET,
    title: '保护身份未被撤销或放弃',
    titleEn: 'Protection status not revoked or renounced',
    sources: [
      { srcId: 'SRC-023', locator: 'STP 4.1' },
      { srcId: 'SRC-023', locator: 'STP 4.2' },
      { srcId: 'SRC-023', locator: 'STP 5.2' },
    ],
    pendingDetails: [],
  },
  (ctx) => {
    const L = textFor(ctx);
    const renewal = L(
      '不满足定居要求、但仍有权享有 refugee status 或 humanitarian protection 时，会再获至少 30 个月的保护许可（STP 5.2）。',
      'If the settlement requirements are not met but the person is still entitled to refugee status or humanitarian protection, a further period of at least 30 months of protection permission is granted (STP 5.2).',
    );
    if (ctx.timeline.protectionStatusRevoked) {
      return {
        status: 'FAIL',
        explanation: L(
          '申报 refugee status 或 humanitarian protection 已被撤销或已放弃；STP 4.1 要求未被撤销或放弃。',
          'Refugee status or humanitarian protection declared as revoked or renounced; STP 4.1 requires that it has not been.',
        ),
        assumptions: [renewal],
      };
    }
    return {
      status: 'PASS',
      explanation: L(
        '未申报撤销或放弃，按仍持有 refugee status 或 humanitarian protection 处理（STP 4.1）。',
        'No revocation or renunciation declared, so refugee status or humanitarian protection is taken as still held (STP 4.1).',
      ),
      assumptions: [
        L(
          '审理定居申请时会做 safe return review（STP 4.2），核查个人情况或原籍国状况是否已变化到可撤销或不续期保护身份，结果无法预判。',
          'A safe return review is carried out when the settlement application is considered (STP 4.2), checking whether personal circumstances or country conditions have changed so that protection could be revoked or not renewed; its outcome cannot be predicted.',
        ),
        renewal,
      ],
    };
  },
);
