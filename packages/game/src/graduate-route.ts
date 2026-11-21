import { skilledWorkerApplication } from '@uk-immigration/engine';
import type { ImmigrationEpisode } from '@uk-immigration/engine';
import { currentLaw2026_11, goingRates } from '@uk-immigration/policy-data';
import { balance as b } from './balance';
import { locationActions, places } from './locations';
import type { GameState } from './types';

const policy = currentLaw2026_11.values;
// SRC-034 GR 8.1: this fictional MSc graduate applied before 2027-01-01.
export const graduateApplicationDate = '2026-09-01';
// SRC-004 SW 4.2 Option A and SW 8.1. SRC-017 Table 1, SOC 2136. The offer
// is also checked against the new-entrant Option E (SW 12.1–12.3, task 35).
export const generalSalary = policy.skilledWorkerGeneralSalaryThreshold.value;
const graduateOccupation = goingRates.rows.find(
  (row) => row.table === '1' && row.socCode === '2136',
)!;
export const occupationalSalary = graduateOccupation.goingRate!;
export const graduateSalaries = {
  low: generalSalary - 1000,
  // Fictional negotiated offer, not a policy threshold.
  agreed: Math.max(generalSalary, occupationalSalary) + 2500,
};
export function graduateEpisode(state: GameState): ImmigrationEpisode {
  const end = new Date(`${state.date}T00:00:00Z`);
  // Fictional sponsored contract length, like existing Skilled Worker renewals.
  end.setUTCMonth(end.getUTCMonth() + b.extensionMonths);
  end.setUTCDate(end.getUTCDate() - 1);
  return {
    route: 'SKILLED_WORKER',
    role: 'MAIN',
    validFrom: state.date,
    validTo: end.toISOString().slice(0, 10),
    socCode: graduateOccupation.socCode,
    // The CoS is issued for this offer; SOC 2136 is not on the Immigration
    // Salary List (SRC-019).
    sponsorshipCertificateDate: state.date,
    immigrationSalaryList: false,
    salary: state.flags.includes('graduate-negotiated')
      ? graduateSalaries.agreed
      : graduateSalaries.low,
  };
}
/** The engine's Skilled Worker application check (SW 4.2 Options A and E). */
export function graduateApplication(state: GameState) {
  const episode = graduateEpisode(state);
  // SW 18.1: permission runs to 14 days after the CoS end date, so this
  // scenario's CoS ends that many days before the grant.
  const cosEnd = new Date(`${episode.validTo}T00:00:00Z`);
  cosEnd.setUTCDate(
    cosEnd.getUTCDate() - policy.skilledWorkerGrantDaysAfterCos.value,
  );
  return skilledWorkerApplication({
    timeline: {
      ...state.timeline,
      episodes: state.timeline.episodes.filter(
        (e) => e.validFrom <= state.date,
      ),
    },
    applicationDate: state.date,
    // The scenario decides the in-country switch on the day it is made.
    decisionDate: state.date,
    cos: {
      start: state.date,
      end: cosEnd.toISOString().slice(0, 10),
      salary: episode.salary,
      // Fictional full-time contract at the going rate's standard week.
      weeklyHours: policy.goingRateWeeklyHours.value,
      socCode: episode.socCode,
    },
    locale: state.locale,
  });
}

export function graduateSalaryPreview(state: GameState): string {
  const { optionA, optionE } = graduateApplication(state);
  const chinese = state.locale === 'zh-CN';
  const grantedUntil = graduateEpisode(state).validTo;
  const graceDays = policy.skilledWorkerGrantDaysAfterCos.value;
  const cosEnd = new Date(`${grantedUntil}T00:00:00Z`);
  cosEnd.setUTCDate(cosEnd.getUTCDate() - graceDays);
  const cosEndDate = cosEnd.toISOString().slice(0, 10);
  // The game records permission on the quarter's start date, so the
  // application, the decision and the proposed grant all run from it.
  const premise = chinese
    ? `本情景按本季起始日 ${state.date} 递交，若获批，新许可自当日起，拟授予 ${b.extensionMonths} 个月（至 ${grantedUntil}）。许可到 CoS 结束后 ${graceDays} 天（SW 18.1），所以 HR 开具的 CoS 止于 ${cosEndDate}；若下一季再递交，HR 按新季度更新 CoS。`
    : `This scenario applies on the quarter's start date, ${state.date}. If granted, the new permission starts that day for ${b.extensionMonths} months (until ${grantedUntil}). Permission runs to ${graceDays} days after the CoS ends (SW 18.1), so HR's CoS ends on ${cosEndDate}; if the application waits for a later quarter, HR updates the CoS for it.`;
  const verdict = (status: string) =>
    chinese
      ? status === 'PASS'
        ? '符合'
        : status === 'FAIL'
          ? '不符合'
          : '待确认'
      : status === 'PASS'
        ? 'met'
        : status === 'FAIL'
          ? 'not met'
          : 'to be confirmed';
  return [
    chinese
      ? `标准档（SRC-004 SW 4.2 Option A；SRC-017 Table 1）：${verdict(optionA.status)}。${optionA.explanation}`
      : `Standard option (SRC-004 SW 4.2 Option A; SRC-017 Table 1): ${verdict(optionA.status)}. ${optionA.explanation}`,
    chinese
      ? `新入职者档（SRC-004 SW 4.2 Option E、SW 12.1–12.3）：${verdict(optionE.status)}。${optionE.explanation}`
      : `New-entrant option (SRC-004 SW 4.2 Option E, SW 12.1–12.3): ${verdict(optionE.status)}. ${optionE.explanation}`,
    premise,
  ]
    .map((line) => line.trim())
    .join('\n');
}

/** Where Nora's job search stands and what to do next (playtest #7). */
export function graduateNextStep(
  state: GameState,
): { zhCN: string; en: string } | undefined {
  const current = state.timeline.episodes.find(
    (e) => e.validFrom <= state.date && e.validTo >= state.date,
  );
  if (
    state.characterId !== 'graduate' ||
    current?.route !== 'GRADUATE' ||
    state.flags.includes('graduate-switched')
  )
    return undefined;
  const has = (flag: string) => state.flags.includes(flag);
  const cos = has('graduate-cos-ready');
  // [progress, next step], Chinese then English.
  const [progress, step] = cos
    ? [
        ['已拿到 CoS', 'CoS received'],
        [
          '在签证中心核对转签条件，符合就转 Skilled Worker；不符合可回公司与 HR 重谈薪资。',
          'check the switch at the visa centre and switch to Skilled Worker if it is met; if not, reopen the salary talk with HR at work.',
        ],
      ]
    : has('graduate-offer-reviewed')
      ? [
          ['合同已核对', 'contract checked'],
          [
            '工作日到公司，等 HR 发来 Certificate of Sponsorship（CoS）的参考号。',
            'on a workday, go to work and wait for HR to send your Certificate of Sponsorship (CoS) reference number.',
          ],
        ]
      : has('graduate-sponsor-confirmed')
        ? [
            ['雇主同意担保', 'the employer will sponsor you'],
            [
              '工作日到公司核对合同上的年薪。',
              'on a workday, check the salary in the contract at work.',
            ],
          ]
        : has('graduate-interviewed')
          ? [
              ['面试已完成', 'interview done'],
              [
                '工作日到公司问 HR 是否担保。',
                'on a workday, ask HR at work about sponsorship.',
              ],
            ]
          : has('graduate-applied')
            ? [
                ['已投递', 'application sent'],
                [
                  '工作日到公司参加面试。',
                  'on a workday, go to work for the interview.',
                ],
              ]
            : [
                ['还没投递', 'nothing sent yet'],
                [
                  '工作日到公司投简历；Graduate 许可不能续签，到期前要递交转 Skilled Worker 的有效申请。',
                  'on a workday, apply for jobs at work; Graduate permission cannot be extended, so make a valid application to switch to Skilled Worker before it expires.',
                ],
              ];
  const say = (zh: string, en: string) => ({
    zhCN: `求职进度：${progress[0]}。${zh}`,
    en: `Job search: ${progress[1]}. ${en}`,
  });
  // Job search and salary talks happen at work, once, on the quarter's one
  // workday (its first day). Quarters start on the same day of the month.
  const search = locationActions.find((a) => a.id === 'graduate-job-search')!;
  const workdayLeft =
    state.day.kind === 'workday' &&
    !state.day.done.includes('graduate-job-search') &&
    state.day.minute + search.minutes <=
      places.find((p) => p.id === 'work')!.hours!.closes;
  const [year, month, day] = state.date.split('-').map(Number);
  const nextQuarter = new Date(
    Date.UTC(year, month - 1 + b.monthsPerQuarter, day),
  )
    .toISOString()
    .slice(0, 10);
  // No workday left before the permission ends: say what is still possible.
  if (!workdayLeft && current.validTo < nextQuarter)
    return cos
      ? say(
          '许可在下一季前到期，来不及再回公司重谈。下一步：在签证中心核对，符合就转 Skilled Worker。',
          'Your permission ends before next quarter, so there is no time to reopen the salary talk. Next: check at the visa centre and switch to Skilled Worker if it qualifies.',
        )
      : say(
          '许可在下一季前到期，这一季已没有工作日，求职来不及推进到拿到 CoS。',
          'Your permission ends before next quarter and this quarter has no workday left, so the job search cannot reach a CoS in time.',
        );
  const next = say(`下一步：${step[0]}`, `Next: ${step[1]}`);
  if (!state.day.done.includes('graduate-job-search')) return next;
  return cos
    ? {
        zhCN: `${next.zhCN}今天仍可在签证中心核对；如需回公司重谈薪资，要等下一季的工作日。`,
        en: `${next.en} You can still check the switch at the visa centre today; a salary talk at work has to wait for next quarter's workday.`,
      }
    : {
        zhCN: `${next.zhCN}今天已经跑过一次求职，下一季的工作日再去公司。`,
        en: `${next.en} Today's job search is done; go to work again on next quarter's workday.`,
      };
}
