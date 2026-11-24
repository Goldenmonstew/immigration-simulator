import { greeceFull2026_11 } from '@uk-immigration/policy-data';
import type { SourceRef } from '@uk-immigration/policy-data';
import type { CountryCheck } from './country-result';
import { addDays, addMonths, fullYears } from './dates';
import type { GrTrip } from './greece';
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
  issuer?: 'greek' | 'foreign';
  /** The insurer explicitly covers residence in Greece for the required risks and benefits. */
  explicitlyCoversGreece?: boolean;
  /** Active public insurance at filing, when kind is 'gap'. */
  activePublicCoverAfterGap?: boolean;
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

/** Full days abroad within [from, until). Departure and return days are in Greece. */
export function absencePeriods(
  trips: GrTrip[],
  from?: IsoDate,
  until?: IsoDate,
) {
  const periods: { from: IsoDate; until: IsoDate }[] = [];
  for (const trip of [...trips].sort((a, b) =>
    a.departed.localeCompare(b.departed),
  )) {
    const first =
      from && trip.departed < from ? from : addDays(trip.departed, 1);
    const end = until && until < trip.returned ? until : trip.returned;
    if (first >= end) continue;
    const last = periods.at(-1);
    if (last && first <= last.until) {
      if (end > last.until) last.until = end;
    } else periods.push({ from: first, until: end });
  }
  return periods;
}

// Articles 43(3) and 144(3): a disqualifying stay breaks continuity until
// return. The break can first affect a filing once the single limit is reached.
export function residenceBreaks(trips: GrTrip[], months: number) {
  return absencePeriods(trips)
    .map((a) => ({ reachedOn: addMonths(a.from, months), returned: a.until }))
    .filter((a) => a.reachedOn <= a.returned);
}

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
export function ageOn(
  birthDate: IsoDate | undefined,
  date: IsoDate | undefined,
) {
  return birthDate && date ? fullYears(birthDate, date) : undefined;
}
export function underAgeOn(
  birthDate: IsoDate | undefined,
  on: IsoDate | undefined,
  limit: number,
): Answer {
  const age = ageOn(birthDate, on);
  return age === undefined ? undefined : age >= 0 && age < limit;
}
export function insuranceMet(
  insurance: GrInsurance | undefined,
  mode: 'either' | 'private' | 'work',
  renewal = false,
): Answer {
  if (!insurance) return undefined;
  if (insurance.kind === 'uninsured') return false;
  // SRC-356 art. 2(δ), p. 2. Public cover without an issuer is the existing
  // national scheme input. An imported private policy needs territorial evidence.
  const domestic =
    insurance.issuer === 'greek' ||
    (insurance.issuer === undefined && insurance.kind !== 'private');
  const territory = domestic || insurance.explicitlyCoversGreece;
  let pastCoverage: Answer = true;
  if (
    renewal &&
    (insurance.kind === 'gap' || insurance.gapEvidence !== undefined)
  ) {
    pastCoverage =
      insurance.gapEvidence === 'none'
        ? false
        : insurance.gapEvidence === 'unemployment-benefit' ||
          insurance.gapEvidence === 'accepted-force-majeure' ||
          undefined;
  }
  if (insurance.kind === 'public' || insurance.kind === 'gap') {
    return all(
      mode !== 'private',
      territory,
      insurance.kind === 'public' || insurance.activePublicCoverAfterGap,
      pastCoverage,
    );
  }
  if (mode === 'work') return all(territory, pastCoverage, undefined);
  const p = greeceFull2026_11.values.privateInsurance.value;
  const atLeast = (n: number | undefined, floor: number) =>
    n === undefined ? undefined : n >= floor;
  return all(
    territory,
    pastCoverage,
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
