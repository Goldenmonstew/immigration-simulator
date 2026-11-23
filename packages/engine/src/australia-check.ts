import type { CountryCheck } from './country-result';
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
