import {
  evaluateAustraliaFull,
  type CountryCheck,
  type CountryResult,
  type Locale,
} from '@uk-immigration/engine';
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

// Time milestones, application requirements, the fee budget, the citizenship
// pledge after approval and the Resident Return alternatives (one is enough)
// are shown apart; only requirements and time requirements are gaps.
function checkKind(id: string): CountryCheck['kind'] {
  if (id.startsWith('AU-FEES-')) return 'budget';
  if (id === 'AU-CIT-pledge') return 'afterApproval';
  if (id.startsWith('AU-RRV-option-')) return 'alternative';
  if (
    id.includes('-time-') ||
    id === 'AU-PARTNER-time' ||
    id === 'AU-regional-lock'
  )
    return 'time';
  return 'requirement';
}

/**
 * The result page's view of an engine result: each check labelled with its
 * kind. The town game shows its assessment through this too.
 */
export function presentAustraliaResult(result: CountryResult): CountryResult {
  for (const pathway of result.columns[0].pathways)
    for (const check of pathway.checks) check.kind = checkKind(check.id);
  return result;
}

function run(draft: AustraliaDraft, locale: Locale) {
  const confirmed = activeAustraliaAnswers(draft);
  return presentAustraliaResult(
    evaluateAustraliaFull({
      ...confirmed,
      trips: confirmed.noTrips ? [] : confirmed.trips,
      locale,
    }),
  );
}

export const australiaModule: CountryModule<AustraliaDraft, AustraliaWhatIf> = {
  id: 'au',
  version: 1,
  scenarioLinks: true,
  createDraft: createAustraliaDraft,
  activeAnswers: activeAustraliaAnswers,
  validateStep: validateAustraliaStep,
  decodeDraft: decodeAustraliaDraft,
  incompleteResultMessage(_draft, locale) {
    return t('au.result.finishQuestionnaire', locale);
  },
  run,
  earliestLabel: 'au.result.earliest',
  resultNotes: () => ({ notices: ['au.result.timing'] }),
  whatif: australiaWhatIf,
  policy: australiaPolicy,
};
