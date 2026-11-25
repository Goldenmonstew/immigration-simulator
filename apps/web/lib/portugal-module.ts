import {
  evaluatePortugalFull,
  type CountryCheck,
  type Locale,
  type PtNationalityRoute,
} from '@uk-immigration/engine';
import { t } from '../i18n';
import type { CountryModule } from './country-module';
import {
  activePortugalAnswers,
  createPortugalDraft,
  decodePortugalDraft,
  restoreStoredPortugalDraft,
  validatePortugalStep,
  type PortugalDraft,
} from './portugal-draft';
import { ptPathwayByTarget } from './portugal-fields';
import { portugalPolicy } from './portugal-policy';
import { portugalWhatIf, type PortugalWhatIf } from './portugal-whatif';

// The engine's fallback sentences quote the condition title, which the result
// already shows above them, and list pending details that also have a badge.
function explanation(check: CountryCheck, locale: Locale) {
  const pending = check.pendingDetails?.length
    ? ` (${check.pendingDetails.join(', ')})`
    : '';
  const text =
    pending && check.explanation.endsWith(pending)
      ? check.explanation.slice(0, -pending.length)
      : check.explanation;
  const title = check.title;
  const generic =
    locale === 'en'
      ? [
          `Pending: evidence or an authority finding for “${title}” is missing.`,
          `The evidence satisfies “${title}”.`,
          `The evidence does not satisfy “${title}”.`,
        ]
      : [
          `待确认：缺少「${title}」所需资料或主管机关结论。`,
          `已满足「${title}」。`,
          `未满足「${title}」。`,
        ];
  return generic.includes(text) ? t(`pt.result.${check.status}`, locale) : text;
}

function run(draft: PortugalDraft, locale: Locale) {
  const answers = activePortugalAnswers(draft);
  const result = evaluatePortugalFull({
    ...answers,
    // The first step requires a nationality before any result is shown.
    route: answers.route as PtNationalityRoute,
    permits: answers.permits ?? [],
    trips: answers.trips ?? [],
    locale,
  });
  const selected = new Set(
    answers.targets.map((target) => ptPathwayByTarget[target]),
  );
  for (const column of result.columns) {
    column.pathways = column.pathways.filter((pathway) =>
      selected.has(pathway.id),
    );
    for (const pathway of column.pathways)
      for (const check of pathway.checks)
        check.explanation = explanation(check, locale);
  }
  return result;
}

export const portugalModule: CountryModule<PortugalDraft, PortugalWhatIf> = {
  id: 'pt',
  version: 1,
  scenarioLinks: true,
  createDraft: createPortugalDraft,
  activeAnswers: activePortugalAnswers,
  restoreStoredDraft: restoreStoredPortugalDraft,
  validateStep: validatePortugalStep,
  decodeDraft: decodePortugalDraft,
  incompleteResultMessage(_draft, locale) {
    return t('pt.result.finishQuestionnaire', locale);
  },
  run,
  // Free-movement dates are when the permanent right is acquired.
  earliestLabel: 'pt.result.earliest',
  whatif: portugalWhatIf,
  policy: portugalPolicy,
};
