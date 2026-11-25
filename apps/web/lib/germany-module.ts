import {
  DE_PROCEDURE_CHECKS,
  evaluateGermanyFull,
  type CountryCheck,
  type Locale,
} from '@uk-immigration/engine';
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

// Fees, the solemn declaration and certificate after approval, and the
// procedural notes that do not decide a pathway are shown apart; only
// requirements and time requirements are gaps.
function checkKind(id: string): CountryCheck['kind'] {
  if (/^DE-C(6[5-9]|7[01])(-|$)/.test(id)) return 'budget';
  if (id === 'DE-C54') return 'afterApproval';
  if (DE_PROCEDURE_CHECKS.has(id)) return 'information';
  if (
    id.endsWith('-time') ||
    ['DE-C13', 'DE-C28', 'DE-C44', 'DE-C55'].includes(id)
  )
    return 'time';
  return 'requirement';
}

function run(draft: GermanyDraft, locale: Locale) {
  const confirmed = activeGermanyAnswers(draft);
  const result = evaluateGermanyFull({
    ...confirmed,
    routes: confirmed.routes.length ? confirmed.routes : undefined,
    locale,
  });
  for (const pathway of result.columns[0].pathways)
    for (const check of pathway.checks) check.kind = checkKind(check.id);
  return result;
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
