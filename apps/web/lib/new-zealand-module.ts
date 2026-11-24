import { evaluateNewZealandFull, type Locale } from '@uk-immigration/engine';
import type { CountryModule } from './country-module';
import {
  activeNzAnswers,
  createNzDraft,
  decodeNzDraft,
  nzGoalPathways,
  nzRequest,
  validateNzStep,
  type NzDraft,
} from './new-zealand-draft';
import { newZealandPolicy } from './new-zealand-policy';
import { nzWhatIf, type NzWhatIf } from './new-zealand-whatif';

// The engine assesses all ten pathways; show the ones the user chose.
function run(draft: NzDraft, locale: Locale) {
  const result = evaluateNewZealandFull(nzRequest(draft, locale));
  const chosen = new Set(draft.goals.map((goal) => nzGoalPathways[goal]));
  for (const column of result.columns)
    column.pathways = column.pathways.filter((pathway) =>
      chosen.has(pathway.id),
    );
  return result;
}

export const newZealandModule: CountryModule<NzDraft, NzWhatIf> = {
  id: 'nz',
  version: 1,
  createDraft: createNzDraft,
  activeAnswers: activeNzAnswers,
  validateStep: validateNzStep,
  decodeDraft: decodeNzDraft,
  run,
  whatif: nzWhatIf,
  policy: newZealandPolicy,
};
