import { irelandFull2026_11 as full } from '@uk-immigration/policy-data';
import type { CountryCheck, CountryPathway } from '../country-result';
import { addDays, addMonths, daysBetween } from '../dates';
import type { IePathway, IePermission } from '../ireland';
import { afterYears, monthSpan } from '../pilot';
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
  /** Evaluate the checklist for an existing grant instead of applying for a work Stamp 4 upgrade. */
  stage?: 'first' | 'renewal';
  checklistComplete?: boolean;
  /** Expiry printed on the current IRP, distinct from the registration or appointment date. */
  irpExpiresOn?: IsoDate;
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
  const requirementStatuses: CountryCheck['status'][] = [];
  let readyOn = day;
  let timeResult:
    | Pick<
        IePathway,
        'status' | 'earliestDate' | 'summary' | 'assumptions' | 'pendingDetails'
      >
    | undefined;

  function recordRequirement(status: CountryCheck['status'], availableOn?: IsoDate) {
    if (availableOn && availableOn > day) {
      if (availableOn > readyOn) readyOn = availableOn;
    } else {
      requirementStatuses.push(status);
    }
  }

  function add(
    id: IrelandConditionId,
    met: boolean | undefined,
    explanation?: string,
    pendingDetails?: string[],
    requirement: boolean | { availableOn: IsoDate } = true,
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
    if (requirement) {
      recordRequirement(
        check.status,
        typeof requirement === 'object' ? requirement.availableOn : undefined,
      );
    }
  }

  function time(
    result: IePathway,
    ids: string[],
    unknownPds: string[][] = [],
    affectsEligibility = true,
  ) {
    if (affectsEligibility) {
      timeResult = result;
      if (result.status === 'FUTURE') recordRequirement('UNKNOWN', result.earliestDate);
      else if (result.status !== 'MET') {
        recordRequirement(result.status === 'NOT_MET' ? 'NOT_MET' : 'UNKNOWN');
      }
    }
    for (const [index, id] of ids.entries()) {
      const previous = result.checks[index];
      const check: CountryCheck = {
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
      };
      checks.push(check);
      if (affectsEligibility && result.status === 'MET') recordRequirement(check.status);
    }
  }

  function finish(
    id: string,
    title: string,
    applicable: boolean | undefined = true,
  ): CountryPathway {
    const status =
      applicable === false
        ? 'NOT_APPLICABLE'
        : requirementStatuses.includes('NOT_MET')
          ? 'NOT_MET'
          : applicable === undefined || requirementStatuses.includes('UNKNOWN')
            ? 'UNKNOWN'
            : readyOn > day
              ? 'FUTURE'
              : 'MET';
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
        status === 'MET' ? day : status === 'FUTURE' ? readyOn : undefined,
      summary: timeResult?.summary,
      assumptions: timeResult?.assumptions ?? [],
      pendingDetails,
    };
  }

  return { L, day, add, time, finish };
}

export type IrelandAssessment = ReturnType<typeof assessment>;

export function renewalWindow(
  a: IrelandAssessment,
  inState: boolean | undefined,
  expiry: IsoDate | undefined,
  permissions: IePermission[],
) {
  const active = permissions.filter(
    ({ kind, from, to }) =>
      kind !== 'ni-residence' && from <= a.day && (!to || a.day <= to),
  );
  const expires = expiry ?? (active.length === 1 ? active[0].to : undefined);
  const weeks = full.registration.value.earlyRenewalWeeks;
  const opens = expires && addDays(expires, -weeks * 7);
  const inWindow = opens && expires && expires >= a.day ? opens <= a.day : undefined;
  const waiting = inState === true && inWindow === false;
  a.add(
    'IRP-RENEWAL-WINDOW',
    all(inState, inWindow),
    opens
      ? a.L(
          `须在爱尔兰共和国线上递交。续期从 IRP 到期前 ${weeks} 周开放，即 ${opens}。旧卡已过期时须核对现行许可（PD-321）。`,
          `Apply online from the Republic of Ireland. Renewal opens ${weeks} weeks before IRP expiry, on ${opens}. If the card has expired, confirm current permission (PD-321).`,
        )
      : a.L(
          '须在爱尔兰共和国线上递交，并确认当前 IRP 到期日（PD-321）。',
          'Apply online from the Republic of Ireland and confirm the expiry date of the current IRP (PD-321).',
        ),
    ['PD-321'],
    waiting && opens ? { availableOn: opens } : true,
  );
  return opens;
}

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
  checkedByChecklist = false,
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
  if (!checkedByChecklist) a.add(
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

/** Deduplicate registration and preserve uncertainty when partial months decide the result. */
export function registeredMonths(
  periods: readonly IrelandResidencePeriod[],
  day: IsoDate,
  months: number,
) {
  const ranges = mergePeriods(periods, addDays(day, -1));
  let wholeMonths = 0;
  let partialDays = 0;
  for (const { from, to } of ranges) {
    const end = addDays(to, 1);
    let count = 0;
    while (addMonths(from, count + 1) <= end) {
      count++;
      if (wholeMonths + count >= months) return true;
    }
    wholeMonths += count;
    partialDays += daysBetween(addMonths(from, count), end);
  }
  if (ranges.length <= 1) return false;
  const [shortest, longest] = monthSpan(1);
  const remaining = months - wholeMonths;
  if (partialDays >= remaining * longest) return true;
  return partialDays >= remaining * shortest ? undefined : false;
}
