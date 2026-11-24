import { evaluateJapanFull, type Locale } from '@uk-immigration/engine';
import { t } from '../i18n';
import type { CountryModule } from './country-module';
import {
  canConfirmJapanDeparture,
  clearUnconfirmedJapanDeclaration,
  createJapanDraft,
  decodeJapanDraft,
  validateJapanStep,
  type JapanDraft,
} from './japan-draft';
import { japanPolicy } from './japan-policy';
import { japanWhatIf, type JapanWhatIf } from './japan-whatif';

function run(draft: JapanDraft, locale: Locale) {
  const confirmed = clearUnconfirmedJapanDeclaration(draft);
  const result = evaluateJapanFull({ ...confirmed, locale });
  const deemed = confirmed.reentry.find((route) => route.route === 'deemed');
  if (deemed?.departureOn && deemed.declaredIntentAtDeparture === undefined) {
    const hint = canConfirmJapanDeparture(confirmed, deemed.departureOn)
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
  restoreStoredDraft: clearUnconfirmedJapanDeclaration,
  validateStep: validateJapanStep,
  decodeDraft: decodeJapanDraft,
  run,
  whatif: japanWhatIf,
  policy: japanPolicy,
};
