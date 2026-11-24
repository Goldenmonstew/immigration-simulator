import {
  portugal2026_11,
  portugalFull2026_11,
} from '@uk-immigration/policy-data';
import type { SourceRef } from '@uk-immigration/policy-data';
import type { CountryCheck, CountryPathway } from './country-result';
import type { PtPathway } from './portugal';
import type { PtFullRequest, PtOfficialReview } from './portugal-full-types';
import { textFor } from './rule';
import type { IsoDate } from './types';

export const time = portugal2026_11.values;
export const p = portugalFull2026_11.values;
export type Verdict = boolean | undefined;

export function all(...facts: Verdict[]): Verdict {
  return facts.includes(false)
    ? false
    : facts.includes(undefined)
      ? undefined
      : true;
}

export function any(...facts: Verdict[]): Verdict {
  return facts.includes(true)
    ? true
    : facts.includes(undefined)
      ? undefined
      : false;
}

export function reviewed(review?: PtOfficialReview): Verdict {
  return review === 'clear' ? true : review === 'barred' ? false : undefined;
}

export function compare<T>(
  value: T | undefined,
  predicate: (value: T) => boolean,
): Verdict {
  return value === undefined ? undefined : predicate(value);
}

export function src(srcId: string, locator: string, url?: string): SourceRef {
  return url ? { srcId, locator, url } : { srcId, locator };
}

export function fullContext(req: PtFullRequest) {
  const L = textFor(req);
  const at = req.simulationDate;
  const check = (
    id: string,
    result: Verdict,
    zh: string,
    en: string,
    sources: SourceRef[],
    pd: string[] = [],
    detail?: string,
  ): CountryCheck => {
    const title = L(zh, en);
    const explanation =
      detail ??
      (result === undefined
        ? L(
            `待确认：缺少「${zh}」所需资料或主管机关结论。`,
            `Pending: evidence or an authority finding for “${en}” is missing.`,
          )
        : result
          ? L(`已满足「${zh}」。`, `The evidence satisfies “${en}”.`)
          : L(`未满足「${zh}」。`, `The evidence does not satisfy “${en}”.`));
    return {
      id: `PT-${id}`,
      title,
      status: result === undefined ? 'UNKNOWN' : result ? 'MET' : 'NOT_MET',
      explanation:
        result === undefined && pd.length
          ? `${explanation} (${pd.join(', ')})`
          : explanation,
      sources,
      ...(result === undefined && pd.length ? { pendingDetails: pd } : {}),
    };
  };

  const pilotChecks = (pilot: PtPathway, ids: string[]) =>
    pilot.checks.map((c, index) =>
      check(
        ids[index],
        c.met,
        c.text,
        c.text,
        c.sources,
        pilot.pendingDetails,
        pilot.summary,
      ),
    );

  const pathway = (
    id: string,
    title: string,
    checks: CountryCheck[],
    options: {
      timeChecks?: CountryCheck[];
      pilot?: PtPathway;
      /** Time state from a chosen alternate calculation or stage. */
      timing?: { status: CountryPathway['status']; earliestDate?: IsoDate };
      notes?: CountryCheck[];
      applicable?: Verdict;
    } = {},
  ): CountryPathway => {
    const timing = options.timing ?? options.pilot;
    const status =
      options.applicable === false || timing?.status === 'NOT_APPLICABLE'
        ? 'NOT_APPLICABLE'
        : checks.some((c) => c.status === 'NOT_MET') ||
            timing?.status === 'NOT_MET'
          ? 'NOT_MET'
          : checks.some((c) => c.status === 'UNKNOWN') ||
              timing?.status === 'UNKNOWN'
            ? 'UNKNOWN'
            : timing?.status === 'FUTURE'
              ? 'FUTURE'
              : 'MET';
    const allChecks = [
      ...(options.timeChecks ?? []),
      ...checks,
      ...(options.notes ?? []),
    ];
    const pendingDetails = [
      ...new Set([
        ...(options.pilot?.pendingDetails ?? []),
        ...allChecks.flatMap((c) => c.pendingDetails ?? []),
      ]),
    ];
    const summary =
      timing?.status === 'FUTURE' && status !== 'FUTURE'
        ? L(
            '下列时间项为居留时间预测。完整资格同时取决于其他条件。',
            'The time checks below provide a residence projection. Full eligibility also depends on the other requirements.',
          )
        : status === 'MET'
          ? L(
              '所选手续的实体条件已满足。',
              'The substantive requirements for the selected procedure are met.',
            )
          : status === 'FUTURE'
            ? L(
                '其他实体条件已满足，仍需达到时间条件。',
                'The other substantive requirements are met, and the time requirement is still outstanding.',
              )
            : status === 'NOT_APPLICABLE'
              ? L(
                  '当前身份或手续不适用此路径。',
                  'This pathway does not apply to the current status or procedure.',
                )
              : status === 'NOT_MET'
                ? L(
                    '至少一项实体条件未满足。',
                    'At least one substantive requirement is not met.',
                  )
                : L(
                    '至少一项实体条件待确认。',
                    'At least one substantive requirement needs confirmation.',
                  );
    return {
      id,
      title,
      status,
      summary,
      checks: allChecks,
      earliestDate:
        status === 'MET'
          ? (timing?.earliestDate ?? at)
          : status === 'FUTURE'
            ? timing?.earliestDate
            : undefined,
      assumptions: options.pilot?.assumptions ?? [],
      ...(pendingDetails.length ? { pendingDetails } : {}),
    };
  };

  return { req, L, at, check, pilotChecks, pathway };
}
export type PtFullContext = ReturnType<typeof fullContext>;

export function nationalityLaw(at: IsoDate, pending?: IsoDate) {
  if (pending && pending > at) return 'uncertain';
  const filed = pending ?? at;
  if (filed < time.oldTextFrom.value || pending === time.lawInForce.value)
    return 'uncertain';
  return filed < time.lawInForce.value ? 'old' : 'new';
}
