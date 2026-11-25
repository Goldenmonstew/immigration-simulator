import {
  evaluateNewZealandFull,
  type CountryCheck,
  type CountryResult,
  type Locale,
} from '@uk-immigration/engine';
import type { CountryModule } from './country-module';
import {
  activeNzAnswers,
  createNzDraft,
  decodeNzDraft,
  nzGoalPathways,
  nzRequest,
  validateNzStep,
  type NzDraft,
  type NzGoal,
} from './new-zealand-draft';
import { newZealandPolicy } from './new-zealand-policy';
import { nzWhatIf, type NzWhatIf } from './new-zealand-whatif';

// Fees and the immigration levy are a budget; the oath, investment retention
// and the Business Investor residence criteria follow an approval; the longer
// travel provision is one of two grounds (being in New Zealand is the other).
// Other conditions the engine leaves out of a pathway's decision are notes.
// Only requirements and time requirements are gaps.
const budgetChecks = new Set([
  'NZ-P1-FEE',
  'NZ-P2-7',
  'NZ-P3-7-FEE',
  'NZ-P4-FEE',
  'NZ-P5-4',
  'NZ-P6-3',
  'NZ-P7-FEE',
  'NZ-P8-5',
  'NZ-P9-4',
  'NZ-P10-2',
  'NZ-C6-LEVY',
]);
const afterApprovalChecks = new Set([
  'NZ-P3-7-OATH',
  'NZ-P9-2',
  'NZ-P9-3',
  'NZ-P9-3-OPERATIONS',
  'NZ-P9-3-ENGLISH',
]);
// Periods and dates the engine projects a pathway date from.
const timeChecks = new Set([
  'NZ-P1-1',
  'NZ-P1-1-TRAVEL',
  'NZ-P2-1',
  'NZ-P2-2',
  'NZ-P2-3',
  'NZ-P2-JOINT-DATE',
  'NZ-P3-1-PRESENCE',
]);

function checkKind(id: string, decides: boolean): CountryCheck['kind'] {
  if (budgetChecks.has(id)) return 'budget';
  if (id === 'NZ-P1-3') return 'alternative';
  if (!decides)
    return afterApprovalChecks.has(id) ? 'afterApproval' : 'information';
  return timeChecks.has(id) ? 'time' : 'requirement';
}

// The engine assesses all ten pathways; show the ones the user chose, with
// every condition grouped on its pathway. The town game shows its own
// assessment through the same function.
export function presentNewZealandResult(
  result: CountryResult,
  goals: readonly NzGoal[],
): CountryResult {
  const chosen = new Set(goals.map((goal) => nzGoalPathways[goal]));
  return {
    ...result,
    columns: result.columns.map((column) => ({
      ...column,
      pathways: column.pathways
        .filter((pathway) => chosen.has(pathway.id))
        .map(({ decidedBy, ...pathway }) => ({
          ...pathway,
          // A pathway a held PRV replaces has no date to apply.
          ...(pathway.status === 'NOT_APPLICABLE' && { travelDate: null }),
          checks: pathway.checks.map((check) => ({
            ...check,
            kind: checkKind(
              check.id,
              !decidedBy || decidedBy.includes(check.id),
            ),
          })),
        })),
    })),
  };
}

function run(draft: NzDraft, locale: Locale) {
  return presentNewZealandResult(
    evaluateNewZealandFull(nzRequest(draft, locale)),
    draft.goals,
  );
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
  // The travel conditions date is the first resident entry, not a filing date;
  // the other pathways keep the earliest application date.
  earliestLabel: { 'NZ-TRAVEL': 'nz.result.earliest' },
  whatif: nzWhatIf,
  policy: newZealandPolicy,
};
