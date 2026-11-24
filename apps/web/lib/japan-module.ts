import {
  evaluateJapanFull,
  japanTripOccurrences,
  type Locale,
} from '@uk-immigration/engine';
import { japanFull2026_11 } from '@uk-immigration/policy-data';
import { t } from '../i18n';
import type { CountryModule } from './country-module';
import {
  activeJapanAnswers,
  canConfirmJapanDeparture,
  clearUnconfirmedJapanDeclaration,
  createJapanDraft,
  decodeJapanDraft,
  invalidJapanFactStep,
  restoreStoredJapanDraft,
  validateJapanStep,
  type JapanDraft,
} from './japan-draft';
import { japanPolicy } from './japan-policy';
import { japanWhatIf, type JapanWhatIf } from './japan-whatif';

function formatCheckAmounts(
  id: string,
  text: string,
  formatter: Intl.NumberFormat,
) {
  const group = (amount: string) => formatter.format(Number(amount));
  // The pension check labels three slash-separated amounts with one currency.
  if (id === 'jp.pr.projected-pension')
    return text.replace(/\d+(?= \/ )|(?<= \/ )\d+/g, group);
  return text.replace(/\b(?:JPY|CNY) \d+(?:–\d+)?/g, (amounts) =>
    amounts.replace(/\d+/g, group),
  );
}

function run(draft: JapanDraft, locale: Locale) {
  const confirmed = clearUnconfirmedJapanDeclaration(activeJapanAnswers(draft));
  const invalid = invalidJapanFactStep(confirmed);
  if (invalid)
    return {
      policyAsOf: japanFull2026_11.asOf,
      columns: [],
      shortCircuit: {
        reason: invalid.reason,
        message: t(invalid.message, locale).replace(
          '{step}',
          t(invalid.title, locale),
        ),
      },
    };
  const deemed = confirmed.reentry.find((route) => route.route === 'deemed');
  const itineraries = japanTripOccurrences(
    confirmed,
    deemed?.departureOn
      ? { route: deemed, departed: canConfirmJapanDeparture(confirmed, deemed) }
      : undefined,
  );
  const result = evaluateJapanFull({ ...confirmed, locale }, itineraries);
  const formatter = new Intl.NumberFormat(locale);
  for (const pathway of result.columns[0].pathways)
    for (const check of pathway.checks)
      check.explanation = formatCheckAmounts(
        check.id,
        check.explanation,
        formatter,
      );
  const deemedJourney = itineraries.reentry.find(
    (route) => route.route === 'deemed',
  );
  if (
    deemedJourney?.departureOn &&
    deemedJourney.declaredIntentAtDeparture === undefined
  ) {
    const hint = deemedJourney.occurrence.departed
      ? 'jp.result.confirmDeparture'
      : 'jp.result.plannedDeparture';
    const pathway = result.columns[0].pathways.find(
      (item) => item.id === 'jp.reentry.deemed',
    );
    if (pathway)
      pathway.summary = [
        pathway.summary,
        t(hint, locale).replace('{date}', deemedJourney.departureOn),
      ].join(' ');
  }
  return result;
}

export const japanModule: CountryModule<JapanDraft, JapanWhatIf> = {
  id: 'jp',
  version: 1,
  createDraft: createJapanDraft,
  activeAnswers: activeJapanAnswers,
  restoreStoredDraft: restoreStoredJapanDraft,
  validateStep: validateJapanStep,
  decodeDraft: decodeJapanDraft,
  run,
  whatif: japanWhatIf,
  policy: japanPolicy,
};
