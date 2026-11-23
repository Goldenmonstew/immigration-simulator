import type { CountryCheck } from './country-result';
import type { AuFullRequest } from './australia-full';
import { textFor } from './rule';
import type { Locale } from './types';

/** Missing questionnaire evidence stays unknown. PD references identify policy uncertainty. */
export function checker(locale?: Locale) {
  const text = textFor({ locale });
  return (
    id: string,
    met: boolean | undefined,
    zhTitle: string,
    enTitle: string,
    zhExplanation: string,
    enExplanation: string,
    srcId: string,
    locator: string,
    pd?: string,
  ): CountryCheck => ({
    id,
    title: text(zhTitle, enTitle),
    status: met === undefined ? 'UNKNOWN' : met ? 'MET' : 'NOT_MET',
    explanation: text(zhExplanation, enExplanation),
    sources: [{ srcId, locator }],
    ...(met === undefined && pd ? { pendingDetails: [pd] } : {}),
  });
}

/** Apply the visa condition at lodgement, alongside the route's own visa and location criteria. */
export function withNoFurtherStay(
  r: Pick<AuFullRequest, 'locationAtApplication' | 'noFurtherStay' | 'locale'>,
  check: CountryCheck,
): CountryCheck {
  if (r.locationAtApplication !== 'onshore') return check;
  const condition = r.noFurtherStay;
  if (condition === 'barred' || condition === 'waiver-pending') {
    check.status = 'NOT_MET';
    delete check.pendingDetails;
  } else if (condition === undefined && check.status === 'MET') {
    check.status = 'UNKNOWN';
  }
  check.explanation += textFor(r)(
    ' 核对自最近一次入境以来所持签证。若 8503 等条件限制本次申请，递交前须已获豁免。',
    ' Check visas held since the last entry. A condition such as 8503 that bars this application must have been waived before lodgement.',
  );
  check.sources.push(
    { srcId: 'SRC-069', locator: 'ss 41(2)(a), (2A), 46(1A)(a)–(d)' },
    {
      srcId: 'SRC-200',
      locator:
        'reg 2.05(4), (4AA), (5A); Sch 8 conditions 8503, 8534, 8535, 8540',
    },
  );
  return check;
}
