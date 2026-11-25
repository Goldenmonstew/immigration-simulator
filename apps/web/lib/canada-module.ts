import {
  evaluateCanadaFull,
  type CaFullCheck,
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
const fees = ['CA-R27', 'CA-R28', 'CA-R54', 'CA-R70', 'CA-R80'];

// Only requirements and the two day counts are gaps. Fees are a budget, the
// oath follows approval unless a grant date is assessed, and arranged
// employment is one of several bases. Other guidance (the day-count
// baseline, PR card and travel document) is information.
function checkKind(check: CaFullCheck): CountryCheck['kind'] {
  if (check.id === 'CA-R03' || check.id === 'CA-R08') return 'time';
  if (!check.advisory) return 'requirement';
  if (fees.includes(check.id)) return 'budget';
  if (check.id === 'CA-R16') return 'afterApproval';
  if (check.id === 'CA-R37') return 'alternative';
  return 'information';
}

// The engine assesses every route; the page shows the routes the user chose.
function run(draft: CanadaDraft, locale: Locale): CountryResult {
  const result = evaluateCanadaFull(canadaRequest(draft, locale));
  return {
    ...result,
    columns: result.columns.map((column) => ({
      ...column,
      pathways: column.pathways
        .filter((pathway) => draft.goals.includes(pathway.id))
        .map((pathway) => {
          const settled =
            pathway.status === 'MET' || pathway.status === 'NOT_APPLICABLE';
          const time = settled
            ? undefined
            : pathway.checks.find((check) => check.timeBaseline)?.timeBaseline;
          // Show the time-only result when other requirements change the
          // outcome, and its date only when it is a projection.
          const timeDiffers =
            time &&
            (time.status !== pathway.status ||
              time.earliestDate !== pathway.earliestDate);
          return {
            ...pathway,
            ...(timeDiffers && {
              timeStatus: time.status,
              ...(time.status === 'FUTURE' && {
                timeEarliestDate: time.earliestDate,
              }),
            }),
            // Only residence and citizenship project a date; a settled route
            // has none. Null marks that no date applies, so no date row shows.
            ...((settled || !datedGoals.includes(pathway.id)) && {
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

export const canadaModule: CountryModule<CanadaDraft, CanadaWhatIf> = {
  id: 'ca',
  version: CANADA_DRAFT_VERSION,
  scenarioLinks: true,
  createDraft: createCanadaDraft,
  activeAnswers: activeCanadaAnswers,
  validateStep: validateCanadaStep,
  decodeDraft: decodeCanadaDraft,
  run,
  earliestLabel: 'ca.result.earliest',
  whatif: canadaWhatIf,
  policy: canadaPolicy,
};
