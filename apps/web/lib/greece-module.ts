import {
  evaluateGreeceFull,
  type CountryCheck,
  type Locale,
} from '@uk-immigration/engine';
import { t } from '../i18n';
import type { CountryModule } from './country-module';
import {
  activeGreeceAnswers,
  createGreeceDraft,
  decodeGreeceDraft,
  greeceRequest,
  restoreStoredGreeceDraft,
  validateGreeceStep,
  type GreeceDraft,
} from './greece-draft';
import { greecePolicy } from './greece-policy';
import { greeceWhatIf, type GreeceWhatIf } from './greece-whatif';

// The result already shows the condition title above its explanation. The engine
// falls back to the title (or a sentence around it) when it has nothing to add.
function explanation(check: CountryCheck, locale: Locale) {
  const { title, status } = check;
  const generic =
    locale === 'en'
      ? `More information is needed to assess ${title}.`
      : `请补充或核实“${title}”所需的资料。`;
  let text = check.explanation.replace(
    generic,
    t('gr.result.moreInformation', locale),
  );
  if (text.startsWith(title + ' ')) text = text.slice(title.length + 1);
  else if (text.endsWith(' ' + title)) text = text.slice(0, -title.length - 1);
  else if (text === title)
    text = t(
      status === 'MET'
        ? 'gr.result.met'
        : status === 'NOT_MET'
          ? 'gr.result.notMet'
          : 'gr.result.moreInformation',
      locale,
    );
  return text;
}

function run(draft: GreeceDraft, locale: Locale) {
  const result = evaluateGreeceFull({ ...greeceRequest(draft), locale });
  for (const column of result.columns)
    for (const pathway of column.pathways)
      for (const check of pathway.checks)
        check.explanation = explanation(check, locale);
  return result;
}

export const greeceModule: CountryModule<GreeceDraft, GreeceWhatIf> = {
  id: 'gr',
  version: 1,
  createDraft: createGreeceDraft,
  activeAnswers: activeGreeceAnswers,
  restoreStoredDraft: restoreStoredGreeceDraft,
  validateStep: validateGreeceStep,
  decodeDraft: decodeGreeceDraft,
  incompleteResultMessage(_draft, locale) {
    return t('gr.result.finishQuestionnaire', locale);
  },
  run,
  whatif: greeceWhatIf,
  policy: greecePolicy,
};
