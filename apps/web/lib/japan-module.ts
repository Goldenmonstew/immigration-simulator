import { evaluateJapanFull, type Locale } from '@uk-immigration/engine';
import { japanFull2026_11 } from '@uk-immigration/policy-data';
import { t } from '../i18n';
import type { CountryModule } from './country-module';
import {
  canConfirmJapanDeparture,
  clearUnconfirmedJapanDeclaration,
  createJapanDraft,
  decodeJapanDraft,
  futureJapanFactStep,
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
  const confirmed = clearUnconfirmedJapanDeclaration(draft);
  const invalid = futureJapanFactStep(confirmed);
  if (invalid)
    return {
      policyAsOf: japanFull2026_11.asOf,
      columns: [],
      shortCircuit: {
        reason: 'future-fact-date',
        message: t('jp.result.correctFutureFact', locale).replace(
          '{step}',
          t(invalid.title, locale),
        ),
      },
    };
  const result = evaluateJapanFull({ ...confirmed, locale });
  const formatter = new Intl.NumberFormat(locale);
  for (const pathway of result.columns[0].pathways)
    for (const check of pathway.checks)
      check.explanation = formatCheckAmounts(
        check.id,
        check.explanation,
        formatter,
      );
  const deemed = confirmed.reentry.find((route) => route.route === 'deemed');
  if (deemed?.departureOn && deemed.declaredIntentAtDeparture === undefined) {
    const hint = canConfirmJapanDeparture(confirmed, deemed)
      ? 'jp.result.confirmDeparture'
      : 'jp.result.plannedDeparture';
    const pathway = result.columns[0].pathways.find(
      (item) => item.id === 'jp.reentry.deemed',
    );
    if (pathway)
      pathway.summary = [
        pathway.summary,
        t(hint, locale).replace('{date}', deemed.departureOn),
      ].join(' ');
  }
  return result;
}

export const japanModule: CountryModule<JapanDraft, JapanWhatIf> = {
  id: 'jp',
  version: 1,
  createDraft: createJapanDraft,
  restoreStoredDraft: restoreStoredJapanDraft,
  validateStep: validateJapanStep,
  decodeDraft: decodeJapanDraft,
  run,
  whatif: japanWhatIf,
  policy: japanPolicy,
};
