import { evaluateAustraliaFull, type Locale } from '@uk-immigration/engine';
import { t } from '../i18n';
import type { CountryModule } from './country-module';
import {
  activeAustraliaAnswers,
  createAustraliaDraft,
  decodeAustraliaDraft,
  validateAustraliaStep,
  type AustraliaDraft,
} from './australia-draft';
import { australiaPolicy } from './australia-policy';
import { australiaWhatIf, type AustraliaWhatIf } from './australia-whatif';

function run(draft: AustraliaDraft, locale: Locale) {
  const confirmed = activeAustraliaAnswers(draft);
  return evaluateAustraliaFull({
    ...confirmed,
    trips: confirmed.noTrips ? [] : confirmed.trips,
    locale,
  });
}

export const australiaModule: CountryModule<AustraliaDraft, AustraliaWhatIf> = {
  id: 'au',
  version: 1,
  createDraft: createAustraliaDraft,
  activeAnswers: activeAustraliaAnswers,
  validateStep: validateAustraliaStep,
  decodeDraft: decodeAustraliaDraft,
  incompleteResultMessage(_draft, locale) {
    return t('au.result.finishQuestionnaire', locale);
  },
  run,
  whatif: australiaWhatIf,
  policy: australiaPolicy,
};
