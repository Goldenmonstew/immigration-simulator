import { evaluateJapanFull, type Locale } from '@uk-immigration/engine';
import { t } from '../i18n';
import type { CountryModule } from './country-module';
import {
  createJapanDraft,
  decodeJapanDraft,
  validateJapanStep,
  type JapanDraft,
} from './japan-draft';
import { japanPolicy } from './japan-policy';
import { japanWhatIf, type JapanWhatIf } from './japan-whatif';

function run(draft: JapanDraft, locale: Locale) {
  const result = evaluateJapanFull({ ...draft, locale });
  const planned = draft.reentry.find(
    (travel) => travel.route === 'deemed',
  )?.departureOn;
  if (planned && planned > draft.simulationDate) {
    const pathway = result.columns[0].pathways.find(
      (item) => item.id === 'jp.reentry.deemed',
    );
    if (pathway)
      pathway.summary = [
        pathway.summary,
        t('jp.result.plannedDeparture', locale).replace('{date}', planned),
      ].join(' ');
  }
  return result;
}

export const japanModule: CountryModule<JapanDraft, JapanWhatIf> = {
  id: 'jp',
  version: 1,
  createDraft: createJapanDraft,
  validateStep: validateJapanStep,
  decodeDraft: decodeJapanDraft,
  run,
  whatif: japanWhatIf,
  policy: japanPolicy,
};
