import {
  evaluateCanadaFull,
  type CaFullCheck,
  type CaFullResult,
  type CountryCheck,
  type CountryResult,
  type Locale,
} from '@uk-immigration/engine';
import type { CountryModule } from './country-module';
import {
  activeCanadaAnswers,
  CANADA_DRAFT_VERSION,
  canadaRequest,
  createCanadaDraft,
  decodeCanadaDraft,
  validateCanadaStep,
  type CanadaDraft,
} from './canada-draft';
import { canadaPolicy } from './canada-policy';
import { canadaWhatIf, type CanadaWhatIf } from './canada-whatif';

const datedGoals = ['CA-RESIDENCY', 'CA-CITIZENSHIP'];
const timeChecks = ['CA-R03', 'CA-R08'];
const fees = ['CA-R27', 'CA-R28', 'CA-R54', 'CA-R70', 'CA-R80'];

// Only requirements and the two day counts are gaps. Fees are a budget, the
// oath follows approval unless a grant date is assessed, and arranged
// employment is one of several bases. Other guidance (the day-count
// baseline, PR card and travel document) is information.
function checkKind(check: CaFullCheck): CountryCheck['kind'] {
  if (timeChecks.includes(check.id)) return 'time';
  if (!check.advisory) return 'requirement';
  if (fees.includes(check.id)) return 'budget';
  if (check.id === 'CA-R16') return 'afterApproval';
  if (check.id === 'CA-R37') return 'alternative';
  return 'information';
}

// The engine assesses every route; the page shows the routes the user chose.
// The town game shows its own assessment through the same function.
export function presentCanadaResult(
  result: CaFullResult,
  goals: readonly string[],
): CountryResult {
  return {
    ...result,
    columns: result.columns.map((column) => ({
      ...column,
      pathways: column.pathways
        .filter((pathway) => goals.includes(pathway.id))
        .map((pathway) => {
          const settled =
            pathway.status === 'MET' || pathway.status === 'NOT_APPLICABLE';
          const dated = datedGoals.includes(pathway.id);
          // The time row reports the day-count requirement (CA-R03, CA-R08),
          // which counts credited and excluded periods, not the ordinary
          // baseline. It projects a date only for a day still ahead.
          const check =
            !settled && dated
              ? pathway.checks.find((item) => timeChecks.includes(item.id))
              : undefined;
          const time = check && {
            status: check.earliestDate ? ('FUTURE' as const) : check.status,
            earliestDate: check.earliestDate,
          };
          // Shown when other requirements change the outcome; an unknown day
          // count is already listed as a gap.
          const timeDiffers =
            time &&
            time.status !== 'UNKNOWN' &&
            (time.status !== pathway.status ||
              time.earliestDate !== pathway.earliestDate);
          return {
            ...pathway,
            ...(timeDiffers && {
              timeStatus: time.status,
              timeEarliestDate: time.earliestDate,
            }),
            // Only residence and citizenship project a date; a settled route
            // has none. Null marks that no date applies, so no date row shows.
            ...((settled || !dated) && {
              travelDate: null,
            }),
            checks: pathway.checks.map((check) => ({
              ...check,
              kind: checkKind(check),
            })),
          };
        }),
    })),
  };
}

function run(draft: CanadaDraft, locale: Locale): CountryResult {
  return presentCanadaResult(
    evaluateCanadaFull(canadaRequest(draft, locale)),
    draft.goals,
  );
}

export const canadaModule: CountryModule<CanadaDraft, CanadaWhatIf> = {
  id: 'ca',
  version: CANADA_DRAFT_VERSION,
  scenarioLinks: true,
  createDraft: createCanadaDraft,
  activeAnswers: activeCanadaAnswers,
  validateStep: validateCanadaStep,
  decodeDraft: decodeCanadaDraft,
  run,
  // The residency obligation's date is when it is met, not an application
  // date. Citizenship checks every requirement on that signing day, so it
  // keeps the shared earliest application date.
  earliestLabel: { 'CA-RESIDENCY': 'ca.result.earliest' },
  whatif: canadaWhatIf,
  policy: canadaPolicy,
};
