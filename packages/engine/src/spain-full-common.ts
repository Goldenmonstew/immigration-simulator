import { addDays, fullYears } from './dates';
import type { IsoDate, Locale } from './types';
import { spainFull2026_11 } from '@uk-immigration/policy-data';
import type { SourceRef } from '@uk-immigration/policy-data';
import type { CountryCheck, CountryPathway } from './country-result';
import type { Lang } from './rule';
import { textFor } from './rule';

export type Evidence = boolean | undefined;

export function ofCompulsorySchoolAge(
  person: { birthDate?: IsoDate; primarySchoolStartsOn?: IsoDate },
  date: IsoDate,
): Evidence {
  if (!person.birthDate || person.birthDate > date) return undefined;
  const v = spainFull2026_11.values;
  const [year, month] = date.split('-').map(Number);
  const entryYear =
    Number(person.birthDate.slice(0, 4)) + v.schoolAgeFrom.value;
  if (year !== entryYear)
    return (
      year > entryYear &&
      fullYears(person.birthDate, date) < v.schoolAgeUntil.value
    );
  if (person.primarySchoolStartsOn) return date >= person.primarySchoolStartsOn;
  return month === v.primarySchoolStartMonth.value
    ? undefined
    : month > v.primarySchoolStartMonth.value;
}

export function firstFutureDate(
  after: IsoDate,
  through: IsoDate,
  met: (date: IsoDate) => boolean,
): IsoDate | undefined {
  for (let date = addDays(after, 1); date <= through; date = addDays(date, 1)) {
    if (met(date)) return date;
  }
  return undefined;
}

/** Keep today's check rows. Only the complete assessment on the candidate day can establish a filing date. */
function projectFilingDate(
  today: CountryPathway,
  date: IsoDate,
  atFiling: CountryPathway,
  locale?: Locale,
): CountryPathway {
  if (atFiling.status === 'MET')
    return { ...today, status: 'FUTURE', earliestDate: date };
  const outstanding = atFiling.checks.filter(
    (c) => atFiling.decidedBy?.includes(c.id) && c.status !== 'MET',
  );
  const ids = outstanding.map((c) => c.id).join(', ');
  return {
    ...today,
    status: atFiling.status,
    earliestDate: undefined,
    pendingDetails: [
      ...new Set([
        ...(today.pendingDetails ?? []),
        ...outstanding.flatMap((c) => c.pendingDetails ?? []),
      ]),
    ],
    summary: textFor({ locale })(
      `按已填事实，在候选日 ${date} 仍需满足或核实 ${ids}。`,
      `At the candidate filing date of ${date}, the following requirements still need to be met or confirmed: ${ids}.`,
    ),
  };
}

export function all(...facts: Evidence[]): Evidence {
  if (facts.includes(false)) return false;
  return facts.includes(undefined) ? undefined : true;
}

export function any(...facts: Evidence[]): Evidence {
  if (facts.includes(true)) return true;
  return facts.includes(undefined) ? undefined : false;
}

export function check(
  L: Lang,
  id: string,
  zh: string,
  en: string,
  met: Evidence,
  sources: SourceRef[],
  pd: string[] = [],
): CountryCheck {
  const title = L(zh, en);
  const status = met === undefined ? 'UNKNOWN' : met ? 'MET' : 'NOT_MET';
  const result =
    met === undefined
      ? L(
          '待确认，请补充本项所列事实、证明或机关认定',
          'Unconfirmed. Supply the facts, documents or official finding specified here',
        )
      : met
        ? L('已满足', 'Met')
        : L('未满足', 'Not met');
  return {
    id,
    title,
    status,
    explanation: result + L('。', '. ') + title,
    sources,
    ...(met === undefined && pd.length ? { pendingDetails: pd } : {}),
  };
}

export function pathway(
  id: string,
  title: string,
  checks: CountryCheck[],
  info: CountryCheck[] = [],
  assumptions: string[] = [],
): CountryPathway {
  const rows = [...checks, ...info];
  const decisions = checks.map((c) => c.status);
  const status = decisions.includes('NOT_MET')
    ? 'NOT_MET'
    : !decisions.length || decisions.includes('UNKNOWN')
      ? 'UNKNOWN'
      : 'MET';
  return {
    id,
    title,
    checks: rows,
    assumptions,
    status,
    decidedBy: checks.map((c) => c.id),
    pendingDetails: [...new Set(rows.flatMap((c) => c.pendingDetails ?? []))],
  };
}

export interface EsApplicationFee {
  exemptPublicGuardian?: boolean;
  paid?: boolean;
  amount?: number;
  /** Official local working days elapsed between admission and payment. */
  workingDaysAfterAdmission?: number;
}

export function applicationFee(
  L: Lang,
  id: string,
  facts: EsApplicationFee | undefined,
  filedOn: IsoDate,
  recovery = false,
): CountryCheck {
  const v = spainFull2026_11.values;
  const amount = recovery ? v.recoveryFeeEur : v.applicationFeeEur;
  const days = v.paymentWorkingDays.value;
  if (filedOn < v.feeScheduleFrom.value)
    return check(
      L,
      id,
      '请核实递交当日适用的居留费表。',
      'Verify the fee schedule in effect on the filing date.',
      facts?.exemptPublicGuardian === true ? true : undefined,
      [...v.feeScheduleFrom.sources, { srcId: 'SRC-320', locator: 'art. 47' }],
    );
  const payment = all(
    facts?.paid,
    facts?.amount === undefined ? undefined : facts.amount === amount.value,
    facts?.workingDaysAfterAdmission === undefined
      ? undefined
      : facts.workingDaysAfterAdmission >= 0 &&
          facts.workingDaysAfterAdmission <= days,
  );
  return check(
    L,
    id,
    `受理后 ${days} 个工作日内缴 790-052 §${recovery ? '2.7' : '2.6'} 的 ${amount.value} 欧元并留存收据；依法必须代未成年人申请的公共保护机构免缴。`,
    `Pay €${amount.value} under 790-052 §${recovery ? '2.7' : '2.6'} within ${days} working days of admission and keep the receipt. A public child protection body legally required to apply is exempt.`,
    any(facts?.exemptPublicGuardian, payment),
    [
      ...amount.sources,
      ...v.paymentWorkingDays.sources,
      { srcId: 'SRC-320', locator: 'art. 47' },
    ],
  );
}

export function byFilingDeadline(
  day: IsoDate,
  anniversary: IsoDate,
  holidays?: IsoDate[],
) {
  let last = anniversary;
  while (
    [0, 6].includes(new Date(last + 'T00:00:00Z').getUTCDay()) ||
    holidays?.includes(last)
  ) {
    last = addDays(last, 1);
  }
  // A local holiday can extend, but cannot shorten, this minimum filing window.
  return day <= last ? true : holidays ? false : undefined;
}

/** Try dated changes to filing conditions in order, preserving unresolved earlier eligibility. */
export function projectFilingDates(
  today: CountryPathway,
  day: IsoDate,
  dates: (IsoDate | undefined)[],
  assess: (date: IsoDate) => CountryPathway,
  locale?: Locale,
): CountryPathway {
  if (today.status !== 'NOT_MET') return today;
  const candidates = dates.filter((d): d is IsoDate => !!d && d > day);
  let result = today;
  for (const date of [...new Set(candidates)].sort()) {
    result = projectFilingDate(today, date, assess(date), locale);
    if (result.status !== 'NOT_MET') break;
  }
  return result;
}
