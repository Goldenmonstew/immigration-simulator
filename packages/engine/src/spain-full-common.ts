import { addDays } from './dates';
import type { IsoDate } from './types';
import { spainFull2026_11 } from '@uk-immigration/policy-data';
import type { SourceRef } from '@uk-immigration/policy-data';
import type { CountryCheck, CountryPathway } from './country-result';
import type { Lang } from './rule';

export type Evidence = boolean | undefined;

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
  return {
    id,
    title,
    checks: rows,
    assumptions,
    status: checks.some((c) => c.status === 'NOT_MET')
      ? 'NOT_MET'
      : !checks.length || checks.some((c) => c.status === 'UNKNOWN')
        ? 'UNKNOWN'
        : 'MET',
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
