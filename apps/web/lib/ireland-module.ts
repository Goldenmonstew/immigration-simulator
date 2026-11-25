import { evaluateIrelandFull, type Locale } from '@uk-immigration/engine';
import { t } from '../i18n';
import type { CountryModule } from './country-module';
import {
  IRELAND_PATHWAYS,
  activeIrelandAnswers,
  createIrelandDraft,
  decodeIrelandDraft,
  irelandRequest,
  restoreStoredIrelandDraft,
  validateIrelandStep,
  type IrelandDraft,
} from './ireland-draft';
import { WORK_PATHS } from './ireland-fields';
import { irelandPolicy, irelandTimeRuleTitles } from './ireland-policy';
import { irelandWhatIf, type IrelandWhatIf } from './ireland-whatif';

function run(draft: IrelandDraft, locale: Locale) {
  const result = evaluateIrelandFull({
    simulationDate: draft.simulationDate,
    permissions: [],
    trips: [],
    pathways: [],
    locale,
  });
  // Each pathway is assessed on its own answers, in the fixed pathway order.
  result.columns[0].pathways = IRELAND_PATHWAYS.filter((id) =>
    draft.pathways.includes(id),
  ).flatMap(
    (id) =>
      evaluateIrelandFull({ ...irelandRequest(draft, id), locale }).columns[0]
        .pathways,
  );
  for (const pathway of result.columns[0].pathways) {
    // A projected date assumes the documents are still valid on that day.
    if (pathway.status === 'FUTURE')
      pathway.summary = [
        pathway.summary,
        t(
          (WORK_PATHS as readonly string[]).includes(pathway.id)
            ? 'ie.result.projectedWork'
            : 'ie.result.projected',
          locale,
        ),
      ]
        .filter(Boolean)
        .join(' ');
    // Checks without their own explanation repeat the condition title. Time
    // checks keep their sentence as the explanation under a short title.
    for (const check of pathway.checks) {
      const short = irelandTimeRuleTitles[check.id];
      if (check.explanation === check.title) {
        if (short) check.title = t(short, locale);
        else
          check.explanation = t(
            check.status === 'MET'
              ? 'ie.result.checkMet'
              : check.status === 'NOT_MET'
                ? 'ie.result.checkNotMet'
                : 'ie.result.checkUnknown',
            locale,
          );
      }
      // The earlier Stamp 1G clock is shown for reference only (task 89).
      if (check.id === 'IE-FAMILY-LEGACY-TIME')
        check.explanation = `${t('ie.result.legacyReference', locale)} ${check.explanation}`;
    }
  }
  return result;
}

export const irelandModule: CountryModule<IrelandDraft, IrelandWhatIf> = {
  id: 'ie',
  version: 1,
  scenarioLinks: true,
  createDraft: createIrelandDraft,
  activeAnswers: activeIrelandAnswers,
  restoreStoredDraft: restoreStoredIrelandDraft,
  validateStep: validateIrelandStep,
  decodeDraft: decodeIrelandDraft,
  incompleteResultMessage(_draft, locale) {
    return t('ie.result.finishQuestionnaire', locale);
  },
  run,
  whatif: irelandWhatIf,
  policy: irelandPolicy,
};
