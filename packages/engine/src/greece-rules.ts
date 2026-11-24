import { greeceFull2026_11 } from '@uk-immigration/policy-data';
import type { SourceRef } from '@uk-immigration/policy-data';
import type { CountryCheck } from './country-result';
import { fullYears } from './dates';
import { textFor } from './rule';
import type { IsoDate, Locale } from './types';

export type GrEntry =
  | 'permit'
  | 'national-visa'
  | 'short-stay'
  /** Migration Code article 10(8) or (11) application receipt. */
  | 'receipt'
  | 'outside'
  | 'unlawful'
  | 'restricted-permit';
export interface GrInsurance {
  /** Public means active national coverage; use gap for a break in the previous permit period. */
  kind: 'public' | 'private' | 'gap' | 'uninsured';
  coversFamily?: boolean;
  gapEvidence?:
    'unemployment-benefit' | 'accepted-force-majeure' | 'pending' | 'none';
  disabilityEur?: number;
  medicalEur?: number;
  hospitalEur?: number;
  /** Highest participation rate across the three benefits. */
  maxCopayPercent?: number;
  hasDeductibleOrExclusions?: boolean;
  policyMonths?: number;
}

type Answer = boolean | undefined;

export function all(...answers: Answer[]): Answer {
  return answers.includes(false)
    ? false
    : answers.includes(undefined)
      ? undefined
      : true;
}
export function any(...answers: Answer[]): Answer {
  return answers.includes(true)
    ? true
    : answers.includes(undefined)
      ? undefined
      : false;
}
export function ageOn(birthDate: IsoDate | undefined, date: IsoDate) {
  return birthDate === undefined ? undefined : fullYears(birthDate, date);
}
export function insuranceMet(
  insurance: GrInsurance | undefined,
  mode: 'either' | 'private' | 'work',
): Answer {
  if (!insurance) return undefined;
  if (insurance.kind === 'uninsured') return false;
  if (insurance.kind === 'public') return mode !== 'private';
  if (insurance.kind === 'gap') {
    if (mode === 'private') return false;
    if (
      insurance.gapEvidence === 'unemployment-benefit' ||
      insurance.gapEvidence === 'accepted-force-majeure'
    )
      return true;
    return insurance.gapEvidence === 'none' ? false : undefined;
  }
  if (mode === 'work') return undefined;
  const p = greeceFull2026_11.values.privateInsurance.value;
  const atLeast = (n: number | undefined, floor: number) =>
    n === undefined ? undefined : n >= floor;
  return all(
    atLeast(insurance.disabilityEur, p.disabilityEur),
    atLeast(insurance.medicalEur, p.medicalEur),
    atLeast(insurance.hospitalEur, p.hospitalEur),
    insurance.maxCopayPercent === undefined
      ? undefined
      : insurance.maxCopayPercent <= p.maxCopayPercent,
    insurance.hasDeductibleOrExclusions === undefined
      ? undefined
      : !insurance.hasDeductibleOrExclusions,
    atLeast(insurance.policyMonths, p.months),
  );
}

export function grContext(locale?: Locale) {
  const L = textFor({ locale });
  const calendarChanges = new Set<IsoDate>();
  // A rule keyed to the filing year changes at New Year unless the relevant date is already fixed.
  function filingYear(review: IsoDate, recordedDate?: IsoDate) {
    const year = Number((recordedDate ?? review).split('-')[0]);
    if (!recordedDate) calendarChanges.add(`${year + 1}-01-01`);
    return year;
  }
  // A dated requirement can survive a change in law even when another fact
  // in the same check prevents a positive forecast under today's law.
  const filingDates = new Map<string, IsoDate>();
  function whenDue(eligible: Answer, due: IsoDate | undefined, today: IsoDate) {
    if (due && due > today) return { eligible, due };
    return eligible && (due ? true : undefined);
  }
  function check(
    id: string,
    zhTitle: string,
    enTitle: string,
    fact: Answer | IsoDate | ReturnType<typeof whenDue>,
    sources: SourceRef[],
    zhExplanation?: string,
    enExplanation?: string,
    pendingDetails?: string[],
  ): CountryCheck {
    const met = typeof fact === 'object' ? fact.eligible && fact.due : fact;
    const title = L(zhTitle, enTitle);
    const explanation =
      zhExplanation !== undefined && enExplanation !== undefined
        ? L(zhExplanation, enExplanation)
        : met === undefined
          ? L(
              `请补充或核实“${zhTitle}”所需的资料。`,
              `More information is needed to assess ${enTitle}.`,
            )
          : title;
    const result: CountryCheck = {
      id,
      title,
      status: met === undefined ? 'UNKNOWN' : met === true ? 'MET' : 'NOT_MET',
      explanation:
        typeof met === 'string' && !explanation.includes(met)
          ? L(
              `${explanation} 最早日期为 ${met}。`,
              `${explanation} Earliest date: ${met}.`,
            )
          : explanation,
      sources,
      ...(met === undefined && pendingDetails?.length
        ? { pendingDetails }
        : {}),
    };
    const due = typeof fact === 'object' ? fact.due : met;
    if (typeof due === 'string') filingDates.set(id, due);
    return result;
  }
  return {
    check,
    L,
    whenDue,
    filingDates,
    filingYear,
    calendarChanges,
  };
}
export type GrContext = ReturnType<typeof grContext>;
