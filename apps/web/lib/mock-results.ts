import type { Locale, SimulationResult } from '@uk-immigration/engine';
import { earnedSettlement2026_11 as es } from '@uk-immigration/policy-data';
import { policyAsOf } from './policy';

/** Handwritten development previews (`/uk/result?mock=1` or `2`). */
export function mockResults(
  locale: Locale,
): Record<'1' | '2', SimulationResult> {
  const L = (zh: string, en: string) => (locale === 'en' ? en : zh);
  return {
    '1': {
      policyAsOf,
      byRuleSet: {
        'current-law-2026-11': {
          outcome: 'LIKELY_ELIGIBLE',
          earliestDate: policyAsOf,
          rules: [
            {
              id: 'MOCK-CL-RESIDENCE',
              title: L('合资格居留', 'Qualifying residence'),
              status: 'PASS',
              explanation: L(
                '虚构示例：输入的居留记录满足此项要求。',
                'Fictional example: the residence entered meets this requirement.',
              ),
              sources: [{ srcId: 'SRC-004', locator: 'SW 21.1–SW 21.2' }],
            },
            {
              id: 'MOCK-CL-LIFE',
              title: 'Life in the UK',
              status: 'PASS',
              explanation: L(
                '虚构示例：已提供通过考试的记录。',
                'Fictional example: a record of passing the test was provided.',
              ),
              sources: [{ srcId: 'SRC-015', locator: 'KOL 2.1' }],
            },
          ],
          assumptions: [
            L(
              '仅用于开发预览；这些规则结果是手写示例。',
              'Development preview only; these rule results are handwritten examples.',
            ),
          ],
        },
        'earned-settlement-2026-11': {
          outcome: 'POTENTIALLY_ELIGIBLE',
          routeGroup: 'CORE_PERMISSION',
          pathwayYears: es.values.pathwayYears5.value,
          rules: [
            {
              id: 'MOCK-ES-EARNINGS',
              title: L('收入历史', 'Earnings history'),
              status: 'PASS',
              explanation: L(
                '虚构示例：收入历史满足该示例路径的计数要求。',
                'Fictional example: the earnings history meets the counting requirement of this example pathway.',
              ),
              sources: [{ srcId: 'SRC-001', locator: 'p16' }],
            },
            {
              id: 'MOCK-ES-RESIDENCE',
              title: L('居留路线', 'Residence route'),
              status: 'PASS',
              explanation: L(
                '虚构示例：记录中的许可属于可计入的路线。',
                'Fictional example: the recorded permission is on a route that counts.',
              ),
              sources: [{ srcId: 'SRC-001', locator: 'p23' }],
            },
            {
              id: 'MOCK-ES-FUNDS',
              title: 'Specified public funds',
              status: 'UNKNOWN',
              explanation: L(
                '虚构示例：政府尚未确定最终纳入范围与豁免。',
                'Fictional example: the government has not yet set the final scope and exemptions.',
              ),
              sources: [{ srcId: 'SRC-001', locator: 'p18' }],
              pendingDetails: ['PD-012', 'PD-013'],
            },
          ],
          assumptions: [
            L(
              '假设已公布改革在模拟日期适用。',
              'Assumes the announced reforms apply on the simulation date.',
            ),
            L(
              '日期仅为展示格式的虚构示例，不是引擎推算。',
              'Dates are fictional display examples, not engine projections.',
            ),
          ],
        },
      },
    },
    '2': {
      policyAsOf,
      byRuleSet: {
        'current-law-2026-11': {
          outcome: 'LIKELY_NOT_ELIGIBLE',
          rules: [
            {
              id: 'MOCK-CL-RESIDENCE',
              title: L('合资格居留', 'Qualifying residence'),
              status: 'FAIL',
              explanation: L(
                '虚构示例：提供的居留期间不足。',
                'Fictional example: the qualifying residence period is too short.',
              ),
              sources: [{ srcId: 'SRC-004', locator: 'SW 21.1' }],
            },
            {
              id: 'MOCK-CL-SALARY',
              title: L('受担保薪资', 'Sponsored salary'),
              status: 'UNKNOWN',
              explanation: L(
                '虚构示例：尚未填写受担保薪资，无法评估此项。',
                'Fictional example: the sponsored salary has not been entered, so this cannot be assessed.',
              ),
              sources: [{ srcId: 'SRC-004', locator: 'SW 24.3' }],
            },
          ],
          assumptions: [
            L(
              '仅用于开发预览；补充薪资信息不会改变此示例中的居留缺口。',
              'Development preview only; adding the salary would not change the residence gap in this example.',
            ),
          ],
        },
        'earned-settlement-2026-11': {
          outcome: 'LIKELY_NOT_ELIGIBLE',
          rules: [
            {
              id: 'MOCK-ES-RESIDENCE',
              title: L('合资格居留', 'Qualifying residence'),
              status: 'FAIL',
              explanation: L(
                '虚构示例：提供的居留期间不足。',
                'Fictional example: the qualifying residence period is too short.',
              ),
              sources: [{ srcId: 'SRC-001', locator: 'p46' }],
            },
            {
              id: 'MOCK-ES-FUNDS',
              title: 'Specified public funds',
              status: 'UNKNOWN',
              explanation: L(
                '虚构示例：政府尚未确定最终纳入范围与豁免（PD-013）。',
                'Fictional example: the government has not yet set the final scope and exemptions (PD-013).',
              ),
              sources: [{ srcId: 'SRC-001', locator: 'p18' }],
            },
          ],
          assumptions: [
            L(
              '假设已公布改革在模拟日期适用；尚未公布的细节保留为未知。',
              'Assumes the announced reforms apply on the simulation date; unpublished details are left as unknown.',
            ),
          ],
        },
      },
    },
  };
}
