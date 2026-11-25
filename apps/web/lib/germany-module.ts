import { evaluateGermanyFull, type Locale } from '@uk-immigration/engine';
import { t } from '../i18n';
import type { CountryModule } from './country-module';
import {
  activeGermanyAnswers,
  createGermanyDraft,
  decodeGermanyDraft,
  readGermanyAnswers,
  restoreStoredGermanyDraft,
  storeGermanyAnswers,
  validateGermanyStep,
  type GermanyDraft,
} from './germany-draft';
import { germanyPolicy } from './germany-policy';
import { germanyWhatIf, type GermanyWhatIf } from './germany-whatif';

function run(draft: GermanyDraft, locale: Locale) {
  const confirmed = activeGermanyAnswers(draft);
  return evaluateGermanyFull({
    ...confirmed,
    routes: confirmed.routes.length ? confirmed.routes : undefined,
    locale,
  });
}

export const germanyModule: CountryModule<GermanyDraft, GermanyWhatIf> = {
  id: 'de',
  version: 1,
  scenarioLinks: true,
  createDraft: createGermanyDraft,
  storedAnswers: { encode: storeGermanyAnswers, decode: readGermanyAnswers },
  activeAnswers: activeGermanyAnswers,
  restoreStoredDraft: restoreStoredGermanyDraft,
  validateStep: validateGermanyStep,
  decodeDraft: decodeGermanyDraft,
  incompleteResultMessage(_draft, locale) {
    return t('de.result.finishQuestionnaire', locale);
  },
  run,
  // The time conditions are projected; other conditions are assessed on the
  // simulation date. It is not a date from which one may apply.
  earliestLabel: 'de.result.earliest',
  whatif: germanyWhatIf,
  policy: germanyPolicy,
};
