import { japan2026_11, japanFull2026_11 } from '@uk-immigration/policy-data';
import type { SourceRef } from '@uk-immigration/policy-data';
import type {
  CountryCheck,
  CountryPathway,
  CountryResult,
} from './country-result';
import { addDays } from './dates';
import { evaluateJapanTimeline, jpOfficeClosed, jpTripLapses } from './japan';
import type { JpNaturalisationRequest, JpPrRequest, JpRequest } from './japan';
import { afterYears } from './pilot';
import type { PilotCheck, PilotPathway, PilotStatus } from './pilot';
import { textFor } from './rule';
import type { IsoDate } from './types';

export type JpFullCheck = CountryCheck & {
  kind: 'requirement' | 'factor' | 'information';
  applicable?: false;
  fee?: {
    currency: 'JPY' | 'CNY';
    amount: number;
    possibleReducedAmount?: number;
  };
};

export interface JpFullPathway extends CountryPathway {
  checks: JpFullCheck[];
  timeStatus?: PilotStatus;
  timeEarliestDate?: IsoDate;
}

export interface JpFullResult extends CountryResult {
  columns: (CountryResult['columns'][number] & { pathways: JpFullPathway[] })[];
}

export interface JpFullContext extends Omit<
  JpRequest,
  'pr' | 'naturalisation'
> {
  dateOfBirth?: IsoDate;
  /** Days and ages are evaluated on the filing date. Defaults to simulationDate. */
  applicationDate?: IsoDate;
  /** Reference date for filing-day PR and naturalisation answers in the questionnaire. */
  residenceEvidenceOn?: IsoDate;
}

export type JpFiling =
  'self' | 'legal-representative' | 'approved-intermediary' | 'other';
export type JpPayment = 'on-time' | 'lawful-exemption' | 'late-paid' | 'unpaid';

export const old = japan2026_11.values;
export const full = japanFull2026_11.values;
export type JpText = (zh: string, en: string) => string;

export const ref = (
  srcId: string,
  locator: string,
  url?: string,
): SourceRef => ({ srcId, locator, ...(url ? { url } : {}) });

export const guideline = (locator: string) =>
  ref('SRC-114', locator, 'https://www.moj.go.jp/isa/content/001471577.pdf');

export function all(...values: (boolean | undefined)[]): boolean | undefined {
  return values.includes(false)
    ? false
    : values.includes(undefined)
      ? undefined
      : true;
}

export function any(...values: (boolean | undefined)[]): boolean | undefined {
  return values.includes(true)
    ? true
    : values.includes(undefined)
      ? undefined
      : false;
}

export const threshold = (value: number | undefined, minimum: number) =>
  value === undefined ? undefined : value >= minimum;

export const ageAtLeast = (
  born: IsoDate | undefined,
  on: IsoDate,
  age: number,
) => (born === undefined ? undefined : on >= afterYears(born, age));

export const paidOnTime = (value?: JpPayment) =>
  value === undefined
    ? undefined
    : value === 'on-time' || value === 'lawful-exemption';

export function check(
  id: string,
  title: string,
  met: boolean | undefined,
  sources: readonly SourceRef[],
  explanation: string,
  pendingDetails: string[] = [],
  kind: JpFullCheck['kind'] = 'requirement',
): JpFullCheck {
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

export function inapplicable(c: JpFullCheck, reason: string): JpFullCheck {
  return {
    ...c,
    pendingDetails: undefined,
    status: 'MET',
    kind: 'information',
    applicable: false,
    explanation: reason,
  };
}

export function fromPilot(
  id: string,
  title: string,
  c: PilotCheck,
  pending?: string[],
): JpFullCheck {
  return check(id, title, c.met, c.sources, c.text, pending);
}

export function filingContext(req: JpFullContext) {
  const date = req.applicationDate ?? req.simulationDate;
  const L = textFor(req);
  return { date, L };
}

export function nextCounterFilingDay(date: IsoDate) {
  let closed = jpOfficeClosed(date);
  while (closed === 'yes') {
    date = addDays(date, 1);
    closed = jpOfficeClosed(date);
  }
  return { date, open: closed === 'no' ? true : undefined };
}

export function scheduleFiling(
  result: JpFullPathway,
  L: JpText,
  assessOnDate: (date: IsoDate) => JpFullPathway,
  candidateDate = result.earliestDate,
): JpFullPathway {
  if (candidateDate === undefined) return result;

  const { date: next, open } = nextCounterFilingDay(candidateDate);
  if (open === undefined)
    return {
      ...result,
      earliestDate: undefined,
      summary:
        result.summary +
        L(
          '候选递交日的窗口开放情况待确认（PD-370）。',
          ' Confirm whether the counter opens on the proposed filing date (PD-370).',
        ),
      pendingDetails: [...new Set([...(result.pendingDetails ?? []), 'PD-370'])],
    };
  if (next === candidateDate) return result;

  const filing = {
    ...assessOnDate(next),
    timeStatus: result.timeStatus,
    timeEarliestDate: result.timeEarliestDate,
  };
  // Date-specific answers can be checked even when the residence timeline is unresolved.
  if (!filing.earliestDate && result.timeStatus && result.timeStatus !== 'MET')
    return filing;
  return {
    ...filing,
    summary:
      filing.summary +
      (filing.earliestDate
        ? L(
            `按窗口日历，最早可从 ${next} 起考虑递交。`,
            ` The next open day to consider for filing is ${next}.`,
          )
        : L(
            `按已录入资料，无法确认可在下一个窗口受理日 ${next} 递交。`,
            ` The evidence does not confirm that you can file on the next open day, ${next}.`,
          )),
  };
}

export function pilotFor(
  req: JpFullContext,
  selection: { pr: JpPrRequest } | { naturalisation: JpNaturalisationRequest },
): PilotPathway {
  const { date } = filingContext(req);
  const defaults = {
    pr: { route: 'child' },
    naturalisation: { route: 'general', dateOfBirth: req.dateOfBirth ?? date },
  } satisfies Pick<JpRequest, 'pr' | 'naturalisation'>;
  const result = evaluateJapanTimeline(
    { ...req, ...defaults, ...selection },
    false,
    date,
  );
  return result.pathways['pr' in selection ? 0 : 1];
}

export function continuity(req: JpFullContext, date: IsoDate) {
  const lapsed = req.trips.filter((t) => jpTripLapses(t) === true);
  const uncertain = req.trips.filter((t) => jpTripLapses(t) === undefined);
  const latestReturn = (start: IsoDate, t: JpRequest['trips'][number]) =>
    t.departed < date && t.returned > start ? t.returned : start;
  const stay = lapsed.reduce(latestReturn, req.stayStart);
  const possibleRestart = uncertain.reduce(latestReturn, stay);
  return {
    yearsSince: (from: IsoDate, years: number) => {
      if (date < afterYears(from > stay ? from : stay, years)) return false;
      return date >=
        afterYears(from > possibleRestart ? from : possibleRestart, years)
        ? true
        : undefined;
    },
    abroad: req.trips.some((t) => t.departed < date && date < t.returned),
    hasTripsSince: (since: IsoDate) =>
      req.trips.some(
        (t) => !lapsed.includes(t) && t.departed < date && t.returned >= since,
      ),
  };
}

export function assemblePathway(
  id: string,
  title: string,
  filingDate: IsoDate | undefined,
  checks: JpFullCheck[],
  L: JpText,
  pilot?: PilotPathway,
  notApplicable = false,
): JpFullPathway {
  const required = checks.filter(
    (condition) => condition.kind === 'requirement',
  );
  const status: PilotStatus =
    notApplicable || pilot?.status === 'NOT_APPLICABLE'
      ? 'NOT_APPLICABLE'
      : required.some((condition) => condition.status === 'NOT_MET')
        ? 'NOT_MET'
        : required.some((condition) => condition.status === 'UNKNOWN')
          ? 'UNKNOWN'
          : 'MET';
  const overview = {
    NOT_APPLICABLE: L(
      '所选路径不适用。',
      'The selected pathway does not apply.',
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
  };
  return {
    id,
    title,
    checks,
    status,
    ...(status === 'MET' && filingDate ? { earliestDate: filingDate } : {}),
    ...(pilot
      ? { timeStatus: pilot.status, timeEarliestDate: pilot.earliestDate }
      : {}),
    summary: [overview[status], pilot?.summary].filter(Boolean).join(' '),
    pendingDetails: [
      ...new Set(checks.flatMap((condition) => condition.pendingDetails ?? [])),
    ],
    assumptions: pilot?.assumptions ?? [],
  };
}
