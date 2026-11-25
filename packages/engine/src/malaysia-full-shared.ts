import { malaysiaFull2026_11 } from '@uk-immigration/policy-data';
import type { SourceRef } from '@uk-immigration/policy-data';
import type { CountryCheck, CountryPathway } from './country-result';
import { addDays, addMonths, addYears, daysBetween, fullYears } from './dates';
import type { PilotStatus } from './pilot';
import { textFor, type Lang } from './rule';
import type { IsoDate, Locale } from './types';

export const v = malaysiaFull2026_11.values;

/** Passes and cards as the Permit Masuk guideline names them. */
export type MyPassKind =
  /** Social visit pass as the wife or husband of a citizen. */
  | 'ltsvp-spouse'
  /** Any other long-term social visit pass. */
  | 'ltsvp-other'
  | 'employment'
  | 'student'
  /** Professional visit pass, including the DE Rantau Nomad Pass. */
  | 'professional-visit'
  /** Residence Pass (reg. 16A) or Residence Pass-Talent. */
  | 'residence'
  | 'dependant'
  | 'mm2h'
  | 'pvip'
  /** Temporary employment visit pass (PLKS). */
  | 'plks'
  | 'unhcr'
  | 'imm13';

/** `to` is the last valid day. Enter planned renewals as further periods. */
export interface MyPassPeriod {
  kind: MyPassKind;
  from: IsoDate;
  to: IsoDate;
}

/** A period outside Malaysia; `returned` is the first day back. */
export interface MyTrip {
  departed: IsoDate;
  returned: IsoDate;
  reason?: 'education' | 'health' | 'government-service' | 'other';
}

export type MyFamilyTie =
  | 'wife-of-citizen'
  | 'husband-of-citizen'
  | 'child-of-citizen'
  | 'parent-of-citizen'
  | 'spouse-of-pr'
  | 'child-of-pr'
  | 'former-citizen'
  | 'none';

export type MyPathwayId =
  | 'my.pr.wife'
  | 'my.pr.husband'
  | 'my.pr.child'
  | 'my.pr.was'
  | 'my.pr.rep-family'
  | 'my.rp.family'
  | 'my.cit.naturalisation'
  | 'my.cit.wife-registration'
  | 'my.cit.child-registration'
  | 'my.pass.spouse-ltsvp'
  | 'my.pass.mm2h'
  | 'my.pass.rpt'
  | 'my.pass.pvip'
  | 'my.pass.de-rantau'
  | 'my.pass.employment';

type Level = 'weak' | 'moderate' | 'good' | 'very-good';
export type MyMm2hCategory = 'platinum' | 'gold' | 'silver' | 'sez';

export interface MyFullRequest {
  simulationDate: IsoDate;
  locale?: Locale;
  /** Ages, passes and residence are checked on this date. Defaults to simulationDate. */
  applicationDate?: IsoDate;
  /** Omit to assess every pathway. */
  pathways?: MyPathwayId[];
  dateOfBirth?: IsoDate;
  /** ISO 3166-1 alpha-2 code, or 'stateless'. */
  nationality?: string;
  passportExpiry?: IsoDate;
  /** Every pass held in Malaysia, past, current and planned. */
  passes?: MyPassPeriod[];
  trips?: MyTrip[];
  family?: {
    tie?: MyFamilyTie;
    marriedOn?: IsoDate;
    marriageRegistration?: 'malaysia' | 'foreign-only';
    separatedOrDivorced?: boolean;
    /** For a child of a citizen. */
    childRelation?: 'biological' | 'step' | 'adopted';
  };
  /**
   * The citizen spouse or parent the category names will sponsor and attend
   * (permanent residence as a wife, husband or child; spouse LTSVP). Other
   * pathways name other sponsors and ask separately.
   */
  citizenSponsor?: boolean;
  /**
   * A Malaysian aged 21 or over, of Sabah or Sarawak origin for applications
   * there, will sponsor a Residence Pass and attend.
   */
  residencePassSponsor?: boolean;
  /** Citizens who will provide their MyKad as referees for permanent residence. */
  citizenReferees?: number;
  /** 'listed': on the Immigration Department's suspect list or blacklist. */
  immigrationRecord?: 'clear' | 'listed' | 'other-adverse';
  /** Any criminal conviction in any country; no details are collected. */
  criminalRecord?: 'none' | 'convicted';
  /** Date of the last permanent residence refusal; null if never refused. */
  previousPrRefusalOn?: IsoDate | null;
  evidence?: {
    applicantIncome?: boolean;
    sponsorIncome?: boolean;
    malaysianTaxReturns?: boolean;
  };
  language?: { malay?: Level; english?: Level };
  was?: {
    regulatorRecognition?: boolean;
    criticalOccupation?: boolean;
    /** A Malaysian citizen will sponsor and attend. */
    citizenSponsor?: boolean;
  };
  rep?: {
    relation?: 'wife' | 'husband' | 'child' | 'none';
    participantHasSatk?: boolean;
    approvalLetterValidUntil?: IsoDate;
    marriedBeforeRepApplication?: boolean;
    /** The REP participant spouse or parent will sponsor and attend. */
    participantSponsor?: boolean;
    /** Citizen referees aged 21 or over. */
    referees?: number;
  };
  citizenship?: {
    /**
     * Date the Permit Masuk was issued, as on the MyPR card or the permit;
     * null when no permanent residence is held. Approval alone does not
     * count: the applicant stays on a pass until the permit is issued.
     */
    permanentResidentSince?: IsoDate | null;
    intendsToResidePermanently?: 'yes' | 'no' | 'undecided';
    /** Referees meeting every JPN condition. */
    qualifyingReferees?: number;
    renounceOtherNationality?: 'yes' | 'no' | 'unsure';
    completeTravelRecords?: boolean;
    taxReturnsFiveYears?: boolean;
    inFederationOnMerdekaDay?: boolean;
  };
  mm2h?: {
    category?: MyMm2hCategory;
    fromCountryWithDiplomaticRelations?: boolean;
    viaLicensedOperator?: boolean;
    fixedDepositUsd?: number;
    /** Value of the residence bought or to be bought. */
    propertyValueRm?: number;
    daysPerYear?: number;
    goodConductCertificates?: boolean;
    healthInsurance?: boolean;
    dependants?: number;
    needsToWork?: boolean;
  };
  work?: { basicMonthlySalaryRm?: number };
  rpt?: {
    taxYearsPaid?: number;
    qualification?: boolean;
    totalExperienceYears?: number;
  };
  deRantau?: {
    talent?: 'tech' | 'non-tech';
    annualIncomeUsd?: number;
    workType?: 'remote-employee' | 'freelancer';
    employerRegisteredInMalaysia?: boolean;
    contractStart?: IsoDate;
    dependants?: number;
  };
}

export interface MyContext {
  req: MyFullRequest;
  date: IsoDate;
  L: Lang;
}

export function context(req: MyFullRequest): MyContext {
  return {
    req,
    date: req.applicationDate ?? req.simulationDate,
    L: textFor(req),
  };
}

export type MyKind = 'requirement' | 'factor' | 'information';
export type MyCheck = CountryCheck & { kind: MyKind };

export const ref = (srcId: string, locator: string): SourceRef => ({
  srcId,
  locator,
});

export function check(
  id: string,
  title: string,
  met: boolean | undefined,
  sources: readonly SourceRef[],
  explanation: string,
  pendingDetails: string[] = [],
  kind: MyKind = 'requirement',
): MyCheck {
  return {
    id,
    title,
    status: met === undefined ? 'UNKNOWN' : met ? 'MET' : 'NOT_MET',
    explanation,
    sources: [...sources],
    kind,
    ...(met === undefined && pendingDetails.length ? { pendingDetails } : {}),
  };
}

/** Information whose content is known unless `known` is false. */
export function info(
  id: string,
  title: string,
  sources: readonly SourceRef[],
  explanation: string,
  known = true,
  pendingDetails: string[] = [],
): MyCheck {
  return check(
    id,
    title,
    known ? true : undefined,
    sources,
    explanation,
    pendingDetails,
    'information',
  );
}

export function withFee(c: MyCheck, amount: number | undefined): MyCheck {
  return amount === undefined ? c : { ...c, fee: { currency: 'MYR', amount } };
}

export function inapplicable(c: MyCheck, reason: string): MyCheck {
  return {
    ...c,
    pendingDetails: undefined,
    status: 'MET',
    kind: 'information',
    applicable: false,
    explanation: reason,
  };
}

type Answer = boolean | undefined;
export const all = (...values: Answer[]): Answer =>
  values.includes(false)
    ? false
    : values.includes(undefined)
      ? undefined
      : true;
export const atLeast = (value: number | undefined, minimum: number): Answer =>
  value === undefined ? undefined : value >= minimum;
export const age = (born: IsoDate | undefined, on: IsoDate) =>
  born === undefined ? undefined : fullYears(born, on);
/** The first day on which someone born on `born` is `years` old in full years. */
export function birthday(born: IsoDate, years: number) {
  const d = addYears(born, years);
  return fullYears(born, d) < years ? addDays(d, 1) : d;
}
export const not = (value: Answer): Answer =>
  value === undefined ? undefined : !value;

/** The latest date, undefined if any is unknown, null if any can never come. */
export function latest(...dates: (IsoDate | null | undefined)[]) {
  if (dates.includes(null)) return null;
  if (dates.includes(undefined)) return undefined;
  return (dates as IsoDate[]).reduce((a, b) => (a > b ? a : b));
}

// ---------- Date spans: [start, end) ----------

export interface Span {
  start: IsoDate;
  end: IsoDate;
}

export function union(spans: Span[]): Span[] {
  const sorted = spans
    .filter((s) => s.start < s.end)
    .sort((a, b) => (a.start < b.start ? -1 : a.start > b.start ? 1 : 0));
  const out: Span[] = [];
  for (const s of sorted) {
    const last = out[out.length - 1];
    if (last && s.start <= last.end) {
      if (s.end > last.end) last.end = s.end;
    } else out.push({ ...s });
  }
  return out;
}

export function minus(spans: Span[], cuts: Span[]): Span[] {
  let out = union(spans);
  for (const c of union(cuts))
    out = out.flatMap((s) =>
      c.end <= s.start || c.start >= s.end
        ? [s]
        : [
            ...(s.start < c.start ? [{ start: s.start, end: c.start }] : []),
            ...(c.end < s.end ? [{ start: c.end, end: s.end }] : []),
          ],
    );
  return out;
}

export const passSpan = (p: MyPassPeriod): Span => ({
  start: p.from,
  end: addDays(p.to, 1),
});

/** Days of `spans` inside [from, to). */
export const daysIn = (spans: Span[], from: IsoDate, to: IsoDate) =>
  spans.reduce((n, s) => {
    const a = s.start > from ? s.start : from;
    const b = s.end < to ? s.end : to;
    return a < b ? n + daysBetween(a, b) : n;
  }, 0);

export const fullyCovered = (spans: Span[], from: IsoDate, to: IsoDate) =>
  daysIn(spans, from, to) === daysBetween(from, to);

/**
 * The run of passes of `kinds` that is valid on `date`: `start` of the
 * unbroken run, `tolerantStart` when breaks of up to `maxGapMonths` are
 * bridged, `gapDays` in those breaks, and `total` days held before `date`.
 */
export function heldRun(
  passes: MyPassPeriod[] | undefined,
  kinds: readonly MyPassKind[],
  date: IsoDate,
  maxGapMonths = 0,
) {
  if (!passes) return undefined;
  const spans = union(
    passes
      .filter((p) => kinds.includes(p.kind) && p.from <= date)
      .map(passSpan),
  );
  const total = spans.length ? daysIn(spans, spans[0].start, date) : 0;
  const i = spans.findIndex((s) => s.start <= date && date < s.end);
  if (i < 0) return { valid: false as const, total };
  let tolerantStart = spans[i].start;
  let gapDays = 0;
  for (
    let j = i - 1;
    j >= 0 && tolerantStart <= addMonths(spans[j].end, maxGapMonths);
    j--
  ) {
    gapDays += daysBetween(spans[j].end, tolerantStart);
    tolerantStart = spans[j].start;
  }
  return {
    valid: true as const,
    start: spans[i].start,
    tolerantStart,
    gapDays,
    total,
  };
}

// ---------- Pathway assembly ----------

export interface MyPathway extends CountryPathway {
  checks: MyCheck[];
}

export function timing(earliest: IsoDate | null | undefined, date: IsoDate) {
  if (earliest === undefined) return { timeStatus: 'UNKNOWN' as PilotStatus };
  if (earliest === null) return { timeStatus: 'NOT_MET' as PilotStatus };
  return {
    timeStatus: (earliest <= date ? 'MET' : 'FUTURE') as PilotStatus,
    timeEarliestDate: earliest,
  };
}

export function assemble(
  ctx: MyContext,
  id: MyPathwayId,
  title: string,
  checks: MyCheck[],
  options: {
    discretionary?: boolean;
    time?: { timeStatus: PilotStatus; timeEarliestDate?: IsoDate };
    assumptions?: string[];
  } = {},
): MyPathway {
  const { L, date } = ctx;
  const required = checks.filter((c) => c.kind === 'requirement');
  const status: PilotStatus = checks.some(
    (c) => c.id.endsWith('.category') && c.status === 'NOT_MET',
  )
    ? 'NOT_APPLICABLE'
    : required.some((c) => c.status === 'NOT_MET')
      ? 'NOT_MET'
      : required.some((c) => c.status === 'UNKNOWN')
        ? 'UNKNOWN'
        : 'MET';
  const overview = {
    NOT_APPLICABLE: L(
      '按所填身份，此路径不适用。',
      'This pathway does not apply to the circumstances entered.',
    ),
    NOT_MET: L(
      '至少一项适用条件未满足。',
      'At least one applicable requirement is unmet.',
    ),
    UNKNOWN: L(
      '有适用条件待确认。',
      'At least one applicable requirement needs confirmation.',
    ),
    MET: L(
      '已核对的适用条件均满足。',
      'All applicable requirements checked here are met.',
    ),
    FUTURE: '',
  };
  const notes = [overview[status]];
  if (options.discretionary && (status === 'UNKNOWN' || status === 'MET'))
    notes.push(
      L(
        '即使门槛全部满足，是否批准仍由主管机关裁量。',
        'Even when every threshold is met, approval is at the authority’s discretion.',
      ),
    );
  const time = options.time;
  if (status !== 'NOT_APPLICABLE' && time?.timeStatus === 'FUTURE')
    notes.push(
      L(
        `按已录入资料，年限条件最早于 ${time.timeEarliestDate} 满足。`,
        `On the details entered, the time requirements are first met on ${time.timeEarliestDate}.`,
      ),
    );
  return {
    id,
    title,
    status,
    checks,
    ...(status === 'MET' ? { earliestDate: date } : {}),
    ...(time && status !== 'NOT_APPLICABLE' ? time : {}),
    summary: notes.join(' '),
    pendingDetails: [...new Set(checks.flatMap((c) => c.pendingDetails ?? []))],
    assumptions: options.assumptions ?? [],
  };
}
