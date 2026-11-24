import { evaluateSpainFull, type Locale } from '@uk-immigration/engine';
import { t } from '../i18n';
import type { CountryModule } from './country-module';
import {
  activeSpainAnswers,
  createSpainDraft,
  decodeSpainDraft,
  restoreStoredSpainDraft,
  validateSpainStep,
  type SpainDraft,
} from './spain-draft';
import { spainPolicy } from './spain-policy';
import { spainWhatIf, type SpainWhatIf } from './spain-whatif';

function run(draft: SpainDraft, locale: Locale) {
  const active = activeSpainAnswers(draft);
  const { schooling } = active.residence;
  return evaluateSpainFull({
    ...active,
    // Notice dates apply child by child, so an unconfirmed list stays unconfirmed.
    residence:
      schooling && !schooling.children
        ? { ...active.residence, schooling: undefined }
        : active.residence,
    locale,
  });
}

export const spainModule: CountryModule<SpainDraft, SpainWhatIf> = {
  id: 'es',
  version: 1,
  createDraft: createSpainDraft,
  activeAnswers: activeSpainAnswers,
  restoreStoredDraft: restoreStoredSpainDraft,
  validateStep: validateSpainStep,
  decodeDraft: decodeSpainDraft,
  incompleteResultMessage(_draft, locale) {
    return t('es.result.finishQuestionnaire', locale);
  },
  run,
  whatif: spainWhatIf,
  policy: spainPolicy,
};
