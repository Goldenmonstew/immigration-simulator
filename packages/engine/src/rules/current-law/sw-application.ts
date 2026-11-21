import {
  currentLaw2026_11 as cl,
  goingRates,
} from '@uk-immigration/policy-data';
import { addDays, addYears, daysBetween } from '../../dates';
import { effectivePeriods } from '../../residence';
import { textFor } from '../../rule';
import type { IsoDate, Locale, PersonTimeline, RuleResult } from '../../types';
import { gbp } from '../es-contribution';
import type { SourceRef } from '@uk-immigration/policy-data';

// A Skilled Worker application from the game's Graduate scenario (task 35):
// SW 4.2 Options A and E with SW 12.2(f) and SW 12.3. Kept apart from the
// settlement salary rules (SW 24.3), whose meaning does not change.

export interface SkilledWorkerApplication {
  /** Permissions held before applying. */
  timeline: PersonTimeline;
  applicationDate: IsoDate;
  /** An in-country grant starts on the decision date (SRC-050 §23.1). */
  decisionDate?: IsoDate;
  cos?: {
    start?: IsoDate;
    end?: IsoDate;
    /** Salary counted under SW 14.1–14.3 (guaranteed basic pay). */
    salary?: number;
    weeklyHours?: number;
    socCode?: string;
  };
  locale?: Locale;
}

export type ApplicationCheck = Omit<RuleResult, 'assumptions'>;

export interface SkilledWorkerApplicationResult {
  /** PASS when either option is met. */
  status: RuleResult['status'];
  optionA: ApplicationCheck;
  optionE: ApplicationCheck;
  /** SW 18.1: until this many days after the CoS end date. */
  grantedUntil?: IsoDate;
}

const v = cl.values;
const COUNTED = ['GRADUATE', 'SKILLED_WORKER'];

const combine = (
  checks: ApplicationCheck[],
  sources: SourceRef[],
): ApplicationCheck => {
  const status = checks.some((c) => c.status === 'FAIL')
    ? 'FAIL'
    : checks.some((c) => c.status === 'UNKNOWN')
      ? 'UNKNOWN'
      : 'PASS';
  const pendingDetails = [
    ...new Set(checks.flatMap((c) => c.pendingDetails ?? [])),
  ];
  return {
    status,
    explanation: checks.map((c) => c.explanation).join(''),
    sources,
    ...(pendingDetails.length > 0 && { pendingDetails }),
  };
};

export function skilledWorkerApplication(
  input: SkilledWorkerApplication,
): SkilledWorkerApplicationResult {
  const L = textFor({ locale: input.locale });
  const { cos, applicationDate, decisionDate } = input;
  const row = goingRates.rows.find(
    (r) => r.table === '1' && r.socCode === cos?.socCode,
  );
  // SRC-017 Table 1 introduction: rates are pro-rated for other hours.
  const proRated = (rate?: number) =>
    rate !== undefined && cos?.weeklyHours !== undefined
      ? (rate * cos.weeklyHours) / v.goingRateWeeklyHours.value
      : undefined;

  // Option E uses the 70% column, floored at an hourly minimum (Table 1
  // introduction), not 70% of the going rate column.
  const pay = (
    threshold: number,
    published: number | undefined,
    column: { zh: string; en: string },
    option: string,
  ): ApplicationCheck => {
    const sources = [{ srcId: 'SRC-004', locator: `SW 4.2 Option ${option}` }];
    const rate = proRated(published);
    if (cos?.salary === undefined || rate === undefined)
      return {
        status: 'UNKNOWN',
        explanation: L(
          '缺 CoS 上的年薪、每周工时或 Table 1 的 going rate，无法核对薪资。',
          'The CoS salary, weekly hours or Table 1 going rate is missing, so pay cannot be checked.',
        ),
        sources,
      };
    const meets = cos.salary >= threshold && cos.salary >= rate;
    return {
      status: meets ? 'PASS' : 'FAIL',
      explanation: L(
        `年薪 ${gbp(cos.salary)}${meets ? '达到' : '未达到'} ${gbp(threshold)} 与 ${column.zh}（按每周 ${cos.weeklyHours} 小时折算为 ${gbp(Math.ceil(rate))}）。`,
        `A salary of ${gbp(cos.salary)} ${meets ? 'meets' : 'does not meet'} both ${gbp(threshold)} and ${column.en} (${gbp(Math.ceil(rate))} for ${cos.weeklyHours} hours a week). `,
      ),
      sources,
    };
  };

  const optionA = combine(
    [
      pay(
        v.skilledWorkerGeneralSalaryThreshold.value,
        row?.goingRate,
        { zh: 'going rate', en: 'the going rate' },
        'A',
      ),
    ],
    [
      { srcId: 'SRC-004', locator: 'SW 4.2 Option A' },
      { srcId: 'SRC-017', locator: 'Table 1' },
    ],
  );

  // SW 12.2(f): the most recent permission, disregarding visits, was as a
  // Graduate and, if expired, expired less than 2 years before applying.
  const latest = input.timeline.episodes
    .filter((e) => e.route !== 'VISIT' && e.validFrom <= applicationDate)
    .sort((a, b) => a.validFrom.localeCompare(b.validFrom))
    .at(-1);
  const expiryYears = v.skilledWorkerNewEntrantGraduateExpiryYears.value;
  const graduate: ApplicationCheck =
    latest?.route !== 'GRADUATE'
      ? {
          status: 'FAIL',
          explanation: L(
            '最近一次许可不是 Graduate，不符合 SW 12.2(f)。',
            'The most recent permission was not as a Graduate, so SW 12.2(f) is not met. ',
          ),
          sources: [],
        }
      : latest.validTo >= applicationDate ||
          latest.validTo > addYears(applicationDate, -expiryYears)
        ? {
            status: 'PASS',
            explanation: L(
              '最近一次许可是 Graduate，符合 SW 12.2(f)。',
              'The most recent permission was as a Graduate, meeting SW 12.2(f). ',
            ),
            sources: [],
          }
        : {
            status: 'FAIL',
            explanation: L(
              `Graduate 许可于 ${latest.validTo} 到期，距申请日已满 ${expiryYears} 年，不符合 SW 12.2(f)。`,
              `The Graduate permission expired on ${latest.validTo}, ${expiryYears} or more years before applying, so SW 12.2(f) is not met. `,
            ),
            sources: [],
          };

  // SW 12.3: Skilled Worker, Graduate and Tier 2 permission (recorded here as
  // Skilled Worker) may not exceed 4 years in total, gaps excluded.
  const grantedUntil =
    cos?.start && cos.end
      ? addDays(cos.end, v.skilledWorkerGrantDaysAfterCos.value)
      : undefined;
  const maxYears = v.skilledWorkerNewEntrantMaxCombinedYears.value;
  let combined: ApplicationCheck;
  if (!decisionDate || !grantedUntil) {
    combined = {
      status: 'UNKNOWN',
      explanation: L(
        '缺预计决定日或 CoS 起止日期，无法核算 SW 12.3 的合计期限。',
        'The expected decision date or the CoS dates are missing, so the SW 12.3 total cannot be calculated. ',
      ),
      sources: [],
    };
  } else {
    const held = effectivePeriods(input.timeline).filter(
      (p) => COUNTED.includes(p.permission.route) && p.from < decisionDate,
    );
    // The new grant replaces the permission it follows from the decision date.
    const days = (extendTo?: IsoDate) =>
      held.reduce((total, p) => {
        const end = p.to < decisionDate ? p.to : addDays(decisionDate, -1);
        return total + daysBetween(p.from, end) + 1;
      }, 0) +
      (extendTo ? daysBetween(extendTo, decisionDate) : 0) +
      daysBetween(decisionDate, grantedUntil) +
      1;
    const first = held[0]?.from ?? decisionDate;
    const limit = daysBetween(first, addYears(first, maxYears));
    // An in-time application keeps expired permission under section 3C until
    // the decision; PD-081 leaves how it counts open.
    const last = held.at(-1);
    const section3C =
      last && last.to < addDays(decisionDate, -1) && last.to >= applicationDate
        ? addDays(last.to, 1)
        : undefined;
    const total = days();
    const withSection3C = section3C ? days(section3C) : total;
    // With gaps, a leap day can fall in or out of the counted days: within a
    // day of the limit the result depends on PD-081's day-by-day reckoning.
    const gaps = held.some((p, i) => {
      const next = held[i + 1]?.from ?? decisionDate;
      return addDays(p.to < decisionDate ? p.to : decisionDate, 1) < next;
    });
    // A leap day moves the total by at most one day either way, so only
    // totals at the limit or one day over can flip.
    const nearLimit = gaps && (total === limit || total === limit + 1);
    const years = L(`${maxYears} 年`, `${maxYears} years`);
    combined =
      !nearLimit && total <= limit && withSection3C <= limit
        ? {
            status: 'PASS',
            explanation: L(
              `获批后 Skilled Worker 与 Graduate 许可合计 ${total} 天，未超过 ${years}（SW 12.3）。`,
              `Skilled Worker and Graduate permission would total ${total} days once granted, within ${years} (SW 12.3). `,
            ),
            sources: [],
          }
        : !nearLimit && total > limit
          ? {
              status: 'FAIL',
              explanation: L(
                `获批后 Skilled Worker 与 Graduate 许可合计 ${total} 天（含拟授予的许可至 ${grantedUntil}），超过 ${years}（SW 12.3）。`,
                `Skilled Worker and Graduate permission would total ${total} days once granted (including the proposed grant until ${grantedUntil}), more than ${years} (SW 12.3). `,
              ),
              sources: [],
            }
          : {
              status: 'UNKNOWN',
              explanation: nearLimit
                ? L(
                    `许可之间有空档，合计 ${total} 天与 ${years} 上限只差一天以内。不连续期间逐日如何计算待明确（PD-081）。`,
                    `With gaps between permissions, the total of ${total} days is within a day of the ${years} limit. How non-continuous periods are counted day by day is not settled (PD-081). `,
                  )
                : L(
                    `不计 section 3C 延续期时合计 ${total} 天，计入则超过 ${years}。延续期在 SW 12.3 下如何计算待明确（PD-081）。`,
                    `The total is ${total} days without the section 3C extension and more than ${years} with it. How the extension counts under SW 12.3 is not settled (PD-081). `,
                  ),
              sources: [],
              pendingDetails: ['PD-081'],
            };
  }

  const optionE = combine(
    [
      pay(
        v.skilledWorkerNewEntrantSalaryThreshold.value,
        row?.newEntrantRate,
        {
          zh: `Table 1 的 Option E 列（going rate 的 ${v.skilledWorkerNewEntrantGoingRatePercent.value}%，含每小时最低额）`,
          en: `the Table 1 option E column (${v.skilledWorkerNewEntrantGoingRatePercent.value}% of the going rate, with the hourly minimum)`,
        },
        'E',
      ),
      graduate,
      combined,
    ],
    [
      { srcId: 'SRC-004', locator: 'SW 4.2 Option E' },
      { srcId: 'SRC-004', locator: 'SW 12.1–12.3' },
      { srcId: 'SRC-004', locator: 'SW 18.1' },
      { srcId: 'SRC-017', locator: 'Table 1' },
    ],
  );
  const status =
    optionA.status === 'PASS' || optionE.status === 'PASS'
      ? 'PASS'
      : optionA.status === 'UNKNOWN' || optionE.status === 'UNKNOWN'
        ? 'UNKNOWN'
        : 'FAIL';
  return {
    status,
    optionA,
    optionE,
    ...(grantedUntil && { grantedUntil }),
  };
}
