import {
  evaluateCanadaFull,
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
            // Only residence and citizenship project a date. A null travel
            // date leaves out the date row for settled and undated routes.
            ...((settled || !datedGoals.includes(pathway.id)) && {
              travelDate: null,
            }),
            // Fees, card and travel document steps are guidance, not gaps.
            checks: pathway.checks.map((check) => ({
              ...check,
              kind: check.advisory
                ? ('information' as const)
                : ('requirement' as const),
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
  whatif: canadaWhatIf,
  policy: canadaPolicy,
};
