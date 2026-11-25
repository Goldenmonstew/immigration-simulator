import {
  evaluateSpainFull,
  type CountryCheck,
  type Locale,
} from '@uk-immigration/engine';
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

const budget = [
  'ES-N16',
  'ES-L14',
  'ES-E09',
  'ES-M10',
  'ES-M10-work-fee',
  'ES-F05',
  'ES-F05-card-fee',
  'ES-R08',
];
const afterApproval = [
  'ES-N17',
  'ES-N18',
  'ES-M09',
  'ES-M09-card',
  'ES-F05-effective',
  'ES-F05-effective-card',
  'ES-R08-visa',
  'ES-R09',
  'ES-T01',
  'ES-T02',
  'ES-U13',
];
const time = [
  'ES-N01',
  'ES-L01',
  'ES-L01-PERMIT',
  'ES-L01-SINGLE',
  'ES-L01-TOTAL',
  'ES-L02',
  'ES-E-TIME',
  'ES-E01',
  'ES-E02',
  'ES-E03',
  'ES-E04',
  'ES-U04',
];
// Direct national grounds and early free-movement bases, plus the ordinary
// free-movement period once another acquisition basis decides the pathway.
const alternative = /^ES-(L0[3-9]|U0[4-9]|U1[01])$/;

// Fees, steps after a grant, procedural notes and grounds of which one is
// enough are shown apart; only requirements and time requirements are gaps.
function checkKind(id: string, decides: boolean): CountryCheck['kind'] {
  if (budget.includes(id)) return 'budget';
  if (afterApproval.includes(id)) return 'afterApproval';
  if (id === 'ES-M11' || id === 'ES-F01-grant') return 'information';
  if (!decides && alternative.test(id)) return 'alternative';
  return time.includes(id) ? 'time' : 'requirement';
}

function run(draft: SpainDraft, locale: Locale) {
  const result = evaluateSpainFull({ ...spainEngineInput(draft), locale });
  for (const pathway of result.columns[0].pathways)
    for (const check of pathway.checks)
      check.kind = checkKind(
        check.id,
        pathway.decidedBy?.includes(check.id) ?? true,
      );
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
  scenarioLinks: true,
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
