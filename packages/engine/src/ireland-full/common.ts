import { irelandFull2026_11 as full } from '@uk-immigration/policy-data';
import type { CountryCheck, CountryPathway } from '../country-result';
import { addDays, addMonths, daysBetween } from '../dates';
import type { IePathway } from '../ireland';
import { afterYears } from '../pilot';
import { textFor } from '../rule';
import type { IsoDate, Locale } from '../types';
import { irelandCondition } from './conditions';
import type { IrelandConditionId } from './conditions';

export interface IrelandResidencePeriod {
  from: IsoDate;
  /** Last day covered. Omit for an ongoing period. */
  to?: IsoDate;
}

export interface IrelandRegistration {
  basis?: 'required' | 'exempt' | 'minister-directed';
  validPermission?: boolean;
  renewalPending?: boolean;
  addressCurrent?: boolean;
  passportValid?: boolean;
  registrationDate?: IsoDate;
  feeExemption?: 'confirmed' | 'none' | 'protection-mapping-uncertain';
  feePrepared?: boolean;
}

export interface IrelandCharacter {
  record?: 'none' | 'conviction-or-other' | 'awaiting-trial';
  disclosed?: boolean;
  officialFinding?: boolean;
}

export function all(...values: (boolean | undefined)[]) {
  return values.includes(false)
    ? false
    : values.includes(undefined)
      ? undefined
      : true;
}

export function any(...values: (boolean | undefined)[]) {
  return values.includes(true)
    ? true
    : values.includes(undefined)
      ? undefined
      : false;
}

export function ageAtLeast(
  dob: IsoDate | undefined,
  day: IsoDate,
  age: number,
) {
  return dob === undefined ? undefined : day >= afterYears(dob, age);
}

export function assessment(day: IsoDate, locale: Locale | undefined) {
  const L = textFor({ locale });
  const checks: CountryCheck[] = [];
  const required: CountryCheck[] = [];
  let timeResult:
    | Pick<
        IePathway,
        'status' | 'earliestDate' | 'summary' | 'assumptions' | 'pendingDetails'
      >
    | undefined;

  function add(
    id: IrelandConditionId,
    met: boolean | undefined,
    explanation?: string,
    pendingDetails?: string[],
    affectsEligibility = true,
  ) {
    const meta = irelandCondition(id);
    const title = L(meta.zh, meta.en);
    const check: CountryCheck = {
      id: meta.id,
      title,
      status: met === undefined ? 'UNKNOWN' : met ? 'MET' : 'NOT_MET',
      explanation:
        explanation ??
        (met === undefined
          ? L(
              `缺少可确认「${title}」的资料。`,
              `More information is needed to assess ${title.toLowerCase()}.`,
            )
          : title),
      sources: meta.sources,
      ...(met === undefined && pendingDetails?.length
        ? { pendingDetails }
        : {}),
    };
    checks.push(check);
    if (affectsEligibility) required.push(check);
  }

  function time(
    result: IePathway,
    ids: string[],
    unknownPds: string[][] = [],
    affectsEligibility = true,
  ) {
    if (affectsEligibility) timeResult = result;
    for (const [index, id] of ids.entries()) {
      const previous = result.checks[index];
      checks.push({
        id: `IE-${id}`,
        title:
          previous?.text ??
          L('居住或受雇时间', 'Residence or employment period'),
        explanation: previous?.text ?? result.summary,
        status:
          previous?.met === undefined
            ? 'UNKNOWN'
            : previous.met
              ? 'MET'
              : 'NOT_MET',
        sources: previous?.sources ?? [
          {
            srcId: id.endsWith('SPOUSE-MARRIAGE') ? 'SRC-091' : 'SRC-096',
            locator: id.endsWith('SPOUSE-MARRIAGE')
              ? 's15A(1)(c)'
              : 'Stamp 4 upgrades: Eligibility criteria',
          },
        ],
        ...(previous?.met === undefined && unknownPds[index]?.length
          ? { pendingDetails: unknownPds[index] }
          : {}),
      });
    }
  }

  function finish(
    id: string,
    title: string,
    applicable: boolean | undefined = true,
  ): CountryPathway {
    const timeStatus = timeResult?.status ?? 'MET';
    const status =
      applicable === false
        ? 'NOT_APPLICABLE'
        : required.some((check) => check.status === 'NOT_MET') ||
            timeStatus === 'NOT_MET'
          ? 'NOT_MET'
          : applicable === undefined ||
              required.some((check) => check.status === 'UNKNOWN') ||
              timeStatus === 'UNKNOWN' ||
              timeStatus === 'NOT_APPLICABLE'
            ? 'UNKNOWN'
            : timeStatus;
    const pendingDetails = [
      ...new Set([
        ...(timeResult?.pendingDetails ?? []),
        ...checks.flatMap((check) => check.pendingDetails ?? []),
      ]),
    ];
    return {
      id,
      title,
      status,
      checks,
      earliestDate:
        status === 'MET'
          ? day
          : status === 'FUTURE'
            ? timeResult?.earliestDate
            : undefined,
      summary: timeResult?.summary,
      assumptions: timeResult?.assumptions ?? [],
      pendingDetails,
    };
  }

  return { L, day, add, time, finish };
}

export type IrelandAssessment = ReturnType<typeof assessment>;

export function character(facts?: IrelandCharacter) {
  if (facts?.disclosed === false || facts?.officialFinding === false)
    return false;
  if (facts?.record === 'awaiting-trial') return undefined;
  if (facts?.officialFinding === true) return true;
  return facts?.record === 'none' && facts.disclosed === true
    ? true
    : undefined;
}

export function registration(
  a: IrelandAssessment,
  input: IrelandRegistration | undefined,
  dob: IsoDate | undefined,
  bornInState?: boolean,
  exemption?: boolean,
  requirePermission = true,
) {
  const p = full.registration.value;
  const age = ageAtLeast(dob, a.day, p.usualMinAge);
  const exempt =
    input?.basis === 'minister-directed'
      ? false
      : input?.basis === 'exempt' || bornInState === true || age === false
        ? true
        : input?.basis === 'required'
          ? false
          : undefined;
  const permission =
    input?.validPermission === false && input.renewalPending
      ? undefined
      : input?.validPermission;
  a.add(
    'B01',
    all(
      requirePermission ? permission : true,
      exempt === true
        ? true
        : all(
            exempt === false ? true : undefined,
            input?.addressCurrent,
            input?.passportValid,
          ),
    ),
    a.L(
      `核对合法许可、登记义务、护照与住址。一般可提前 ${p.earlyRenewalWeeks} 周续期。若旧卡到期且续期待决，须核对正式延续证明（PD-321）。`,
      `Check lawful permission, registration duties, passport and address. Renewal generally opens ${p.earlyRenewalWeeks} weeks early. An expired card with a pending renewal needs evidence of legal extension (PD-321).`,
    ),
    ['PD-321'],
  );
  const feeDay = input?.registrationDate;
  const adult = feeDay ? ageAtLeast(dob, feeDay, p.feeMinAge) : undefined;
  const noFee =
    exemption === true ||
    input?.feeExemption === 'confirmed' ||
    adult === false ||
    exempt === true;
  const amount =
    !feeDay ||
    feeDay < p.feeFrom ||
    input?.feeExemption === 'protection-mapping-uncertain'
      ? undefined
      : noFee
        ? p.exempt
        : input?.feeExemption === 'none' && adult === true
          ? p.fee
          : undefined;
  a.add(
    'B02',
    amount === undefined
      ? undefined
      : amount === p.exempt
        ? true
        : input?.feePrepared,
    amount === undefined
      ? a.L(
          '请确认登记日及豁免依据。保护身份映射或历史费率待确认（PD-323、PD-339）。',
          'Confirm the registration date and exemption basis. Protection categories and historical fees may require confirmation (PD-323, PD-339).',
        )
      : a.L(
          `本次登记费 €${amount}。`,
          `Registration fee for this appointment: €${amount}.`,
        ),
    amount === undefined ? ['PD-323', 'PD-339'] : undefined,
    false,
  );
}

/** Merge overlapping and adjacent inclusive ranges, clipped to the assessment day. */
export function mergePeriods(
  periods: readonly IrelandResidencePeriod[],
  day: IsoDate,
) {
  const ranges: { from: IsoDate; to: IsoDate }[] = [];
  for (const period of [...periods].sort((a, b) =>
    a.from.localeCompare(b.from),
  )) {
    const to = period.to && period.to < day ? period.to : day;
    if (period.from > to) continue;
    const last = ranges.at(-1);
    if (last && period.from <= addDays(last.to, 1)) {
      if (to > last.to) last.to = to;
    } else ranges.push({ from: period.from, to });
  }
  return ranges;
}

export function covers(
  periods: readonly IrelandResidencePeriod[],
  from: IsoDate,
  to: IsoDate,
) {
  return mergePeriods(periods, to).some(
    (range) => range.from <= from && range.to === to,
  );
}

/** Accumulate registered periods using the calendar months ending on the filing day. */
export function registeredMonths(
  periods: readonly IrelandResidencePeriod[],
  day: IsoDate,
  months: number,
) {
  const ranges = mergePeriods(periods, addDays(day, -1));
  if (ranges.some(({ from, to }) => addMonths(from, months) <= addDays(to, 1)))
    return true;
  const total = ranges.reduce(
    (sum, { from, to }) => sum + daysBetween(from, addDays(to, 1)),
    0,
  );
  return total >= daysBetween(addMonths(day, -months), day);
}
