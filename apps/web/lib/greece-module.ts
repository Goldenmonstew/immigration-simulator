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

const budgets = new Set([
  'FT-06',
  'GF-06',
  'GV-07',
  'NAT-10',
  'TY-06',
  'WK-09',
]);

// Time summaries, filing windows and waits are time conditions. The ordinary
// and late investor renewal windows are alternatives (the summary decides).
// The change-reporting duty only risks a fine and does not bar filing. A fee
// note or the oath after the decision still bars the route while it is not
// met (missing receipt, unknown age, open oath), so it stays a requirement.
function checkKind(check: CountryCheck): CountryCheck['kind'] {
  const { id } = check;
  if (id === 'GV-TIME-RENEWAL' || id === 'GV-TIME-LATE') return 'alternative';
  if (id.includes('-TIME') || id === 'C-07-window' || id === 'NAT-11')
    return 'time';
  if (id === 'C-06') return 'information';
  if (check.status !== 'MET') return 'requirement';
  if (budgets.has(id)) return 'budget';
  if (id === 'NAT-12') return 'afterApproval';
  return 'requirement';
}

function run(draft: GreeceDraft, locale: Locale) {
  const result = evaluateGreeceFull({ ...greeceRequest(draft), locale });
  for (const column of result.columns)
    for (const pathway of column.pathways)
      for (const check of pathway.checks) {
        check.explanation = explanation(check, locale);
        check.kind = checkKind(check);
      }
  return result;
}

export const greeceModule: CountryModule<GreeceDraft, GreeceWhatIf> = {
  id: 'gr',
  version: 1,
  scenarioLinks: true,
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
