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

// Fees, the levy, the citizenship oath and the investor home purchase note
// do not decide a pathway; they are procedural information.
const informationChecks = new Set([
  'NZ-P1-FEE',
  'NZ-P2-7',
  'NZ-P3-7-FEE',
  'NZ-P3-7-OATH',
  'NZ-P4-FEE',
  'NZ-P5-4',
  'NZ-P6-3',
  'NZ-P7-FEE',
  'NZ-P8-5',
  'NZ-P9-4',
  'NZ-P9-HOME',
  'NZ-P10-2',
  'NZ-C6-LEVY',
]);

// The engine assesses all ten pathways; show the ones the user chose.
function run(draft: NzDraft, locale: Locale) {
  const result = evaluateNewZealandFull(nzRequest(draft, locale));
  const chosen = new Set(draft.goals.map((goal) => nzGoalPathways[goal]));
  for (const column of result.columns)
    column.pathways = column.pathways
      .filter((pathway) => chosen.has(pathway.id))
      .map((pathway) => ({
        ...pathway,
        // A pathway a held PRV replaces has no date to apply.
        ...(pathway.status === 'NOT_APPLICABLE' && { travelDate: null }),
        checks: pathway.checks.map((check) =>
          informationChecks.has(check.id)
            ? { ...check, kind: 'information' as const }
            : check,
        ),
      }));
  return result;
}

export const newZealandModule: CountryModule<NzDraft, NzWhatIf> = {
  id: 'nz',
  version: 1,
  scenarioLinks: true,
  createDraft: createNzDraft,
  activeAnswers: activeNzAnswers,
  validateStep: validateNzStep,
  decodeDraft: decodeNzDraft,
  run,
  // The travel conditions date is the first resident entry, not a filing date.
  earliestLabel: 'nz.result.earliest',
  whatif: nzWhatIf,
  policy: newZealandPolicy,
};
