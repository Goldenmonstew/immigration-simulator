import { evaluateJapanFull, type Locale } from '@uk-immigration/engine';
import { t } from '../i18n';
import type { CountryModule } from './country-module';
import {
  canConfirmJapanDeparture,
  clearPlannedJapanDeclaration,
  createJapanDraft,
  decodeJapanDraft,
  validateJapanStep,
  type JapanDraft,
} from './japan-draft';
import { japanPolicy } from './japan-policy';
import { japanWhatIf, type JapanWhatIf } from './japan-whatif';

function run(draft: JapanDraft, locale: Locale) {
  const deemed = draft.reentry.find((route) => route.route === 'deemed');
  const pending =
    deemed && !canConfirmJapanDeparture(draft, deemed.departureOn);
  const result = evaluateJapanFull({
    ...clearPlannedJapanDeclaration(draft),
    locale,
  });
  if (pending && deemed.departureOn) {
    const pathway = result.columns[0].pathways.find(
      (item) => item.id === 'jp.reentry.deemed',
    );
    if (pathway)
      pathway.summary = [
        pathway.summary,
        t('jp.result.plannedDeparture', locale).replace(
          '{date}',
          deemed.departureOn,
        ),
      ].join(' ');
  }
  return result;
}

export const japanModule: CountryModule<JapanDraft, JapanWhatIf> = {
  id: 'jp',
  version: 1,
  createDraft: createJapanDraft,
  restoreStoredDraft: clearPlannedJapanDeclaration,
  validateStep: validateJapanStep,
  decodeDraft: decodeJapanDraft,
  run,
  whatif: japanWhatIf,
  policy: japanPolicy,
};
