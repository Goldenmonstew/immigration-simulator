import {
  evaluateJapanFull,
  isJapanReturnComparison,
  japanTripOccurrences,
  type Locale,
} from '@uk-immigration/engine';
import { japanFull2026_11 } from '@uk-immigration/policy-data';
import { t } from '../i18n';
import type { CountryModule } from './country-module';
import {
  activeJapanAnswers,
  clearUnconfirmedJapanDeclaration,
  createJapanDraft,
  decodeJapanDraft,
  invalidJapanFactStep,
  japanDepartureStatus,
  ordinaryFilingDays,
  restoreStoredJapanDraft,
  validateJapanStep,
  type JapanDraft,
} from './japan-draft';
import { readJapanAnswers, storeJapanAnswers } from './japan-stored-answers';
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

function factCorrection(draft: JapanDraft, locale: Locale) {
  const invalid = invalidJapanFactStep(draft);
  if (invalid)
    return {
      reason: invalid.reason,
      message: t(invalid.message, locale).replace(
        '{step}',
        t(invalid.title, locale),
      ),
    };
}

function run(draft: JapanDraft, locale: Locale) {
  const confirmed = clearUnconfirmedJapanDeclaration(activeJapanAnswers(draft));
  const shortCircuit = factCorrection(confirmed, locale);
  if (shortCircuit)
    return { policyAsOf: japanFull2026_11.asOf, columns: [], shortCircuit };
  const deemed = confirmed.reentry.find((route) => route.route === 'deemed');
  const departure = deemed && japanDepartureStatus(confirmed, deemed);
  const itineraries = japanTripOccurrences(
    confirmed,
    deemed?.departureOn && departure
      ? { route: deemed, departed: departure.departed }
      : undefined,
  );
  const result = evaluateJapanFull({ ...confirmed, locale }, itineraries);
  const formatter = new Intl.NumberFormat(locale);
  for (const pathway of result.columns[0].pathways) {
    const trip = confirmed.reentry.find(
      (route) => pathway.id === 'jp.reentry.' + route.route,
    );
    const usesFilingDate =
      !trip ||
      (trip.route === 'ordinary'
        ? !ordinaryFilingDays(confirmed, trip)?.held
        : trip.route === 'refugee-travel-document');
    if (
      usesFilingDate &&
      confirmed.hypotheticalFiling &&
      confirmed.applicationDate
    )
      pathway.summary +=
        ' ' +
        t('jp.result.hypotheticalFiling', locale).replace(
          '{date}',
          confirmed.applicationDate,
        );
    if (trip?.returnOn && isJapanReturnComparison(trip))
      pathway.summary +=
        ' ' +
        t('jp.result.hypotheticalReturn', locale).replace(
          '{date}',
          trip.returnOn,
        );
    for (const check of pathway.checks)
      check.explanation = formatCheckAmounts(
        check.id,
        check.explanation,
        formatter,
      );
  }
  const deemedJourney = itineraries.reentry.find(
    (route) => route.route === 'deemed',
  );
  if (
    departure &&
    deemedJourney?.departureOn &&
    deemedJourney.declaredIntentAtDeparture === undefined
  ) {
    const pathway = result.columns[0].pathways.find(
      (item) => item.id === 'jp.reentry.deemed',
    );
    if (pathway)
      pathway.summary = [
        pathway.summary,
        t(departure.hint, locale).replace('{date}', deemedJourney.departureOn),
      ].join(' ');
  }
  return result;
}

export const japanModule: CountryModule<JapanDraft, JapanWhatIf> = {
  id: 'jp',
  version: 1,
  createDraft: createJapanDraft,
  storedAnswers: { encode: storeJapanAnswers, decode: readJapanAnswers },
  activeAnswers: activeJapanAnswers,
  restoreStoredDraft: restoreStoredJapanDraft,
  validateStep: validateJapanStep,
  decodeDraft: decodeJapanDraft,
  incompleteResultMessage(draft, locale) {
    return (
      factCorrection(draft, locale)?.message ??
      t('jp.result.finishQuestionnaire', locale)
    );
  },
  run,
  whatif: japanWhatIf,
  policy: japanPolicy,
};
