import { evaluateSpainFull, type Locale } from '@uk-immigration/engine';
import { t } from '../i18n';
import type { CountryModule } from './country-module';
import {
  activeSpainAnswers,
  createSpainDraft,
  decodeSpainDraft,
  restoreStoredSpainDraft,
  spainEngineInput,
  validateSpainStep,
  type SpainDraft,
} from './spain-draft';
import { spainPolicy } from './spain-policy';
import { spainWhatIf, type SpainWhatIf } from './spain-whatif';

function run(draft: SpainDraft, locale: Locale) {
  const result = evaluateSpainFull({ ...spainEngineInput(draft), locale });
  // A held free-movement right is shown from the assessment date; name when it was acquired.
  for (const pathway of result.columns[0].pathways)
    if (
      pathway.id === 'ES-U' &&
      pathway.status === 'MET' &&
      pathway.pathwayCompletionDate &&
      pathway.earliestDate &&
      pathway.pathwayCompletionDate < pathway.earliestDate
    )
      pathway.summary = t('es.result.acquiredOn', locale).replace(
        '{date}',
        pathway.pathwayCompletionDate,
      );
  return result;
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
