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
  function check(
    id: string,
    zhTitle: string,
    enTitle: string,
    met: Answer,
    sources: SourceRef[],
    zhExplanation?: string,
    enExplanation?: string,
    pendingDetails?: string[],
  ): CountryCheck {
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
    return {
      id,
      title,
      status: met === undefined ? 'UNKNOWN' : met ? 'MET' : 'NOT_MET',
      explanation,
      sources,
      ...(met === undefined && pendingDetails?.length
        ? { pendingDetails }
        : {}),
    };
  }
  return { check, L };
}
export type GrContext = ReturnType<typeof grContext>;
