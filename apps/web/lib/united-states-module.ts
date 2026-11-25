import {
  evaluateUnitedStatesFull,
  type Locale,
  type PilotStatus,
  type UsFullResult,
} from '@uk-immigration/engine';
import { t } from '../i18n';
import type { CountryModule } from './country-module';
import {
  activeUnitedStatesAnswers,
  createUnitedStatesDraft,
  decodeUnitedStatesDraft,
  unitedStatesRequest,
  validateUnitedStatesStep,
  type UsDraft,
} from './united-states-draft';
import { unitedStatesPolicy } from './united-states-policy';
import {
  unitedStatesWhatIf,
  type UnitedStatesWhatIf,
} from './united-states-whatif';

// The outcome is the stage that settles the pathway: a stage that does not
// apply, then an unmet stage, then an open one. Otherwise filing (or return)
// gives the outcome and its date.
const weight = (status?: PilotStatus) =>
  status === 'NOT_APPLICABLE'
    ? 3
    : status === 'NOT_MET'
      ? 2
      : status === 'UNKNOWN'
        ? 1
        : 0;
export const pathwayOutcome = (filing: PilotStatus, approval?: PilotStatus) =>
  approval && weight(approval) > weight(filing) ? approval : filing;

/**
 * The result page's view of an engine result, changed in place: check kinds,
 * amounts and the pathway outcome. The town game shows its assessment through
 * this too.
 */
export function presentUnitedStatesResult(
  result: UsFullResult,
  locale: Locale,
): UsFullResult {
  const separator = locale === 'zh-CN' ? '' : ' ';
  const formatter = new Intl.NumberFormat(locale);
  for (const pathway of result.columns[0].pathways) {
    for (const check of pathway.checks) {
      // Fees and procedural reminders do not decide the pathway, so only
      // time and other requirements are gaps.
      check.kind = check.id.startsWith('US-TIME-')
        ? 'time'
        : /^US-C4[45]-/.test(check.id)
          ? 'budget'
          : check.informational
            ? 'information'
            : 'requirement';
      check.explanation = check.explanation.replace(
        /\bUSD (\d+(?:\.\d+)?)/g,
        (_, amount: string) => `USD ${formatter.format(Number(amount))}`,
      );
    }
    // The travel pathway's date is the planned return (earliestLabel). A
    // completed return has none to show.
    if (pathway.id === 'US-TRAVEL' && pathway.status !== 'FUTURE')
      pathway.travelDate = null;
    // The main status is for filing (or return). Approval is shown alongside.
    if (pathway.approvalStatus)
      pathway.summary +=
        separator +
        t('us.result.approval', locale).replace(
          '{status}',
          t(`country.status.${pathway.approvalStatus}`, locale).replace(
            '{date}',
            pathway.approvalEarliestDate ?? t('result.undetermined', locale),
          ),
        );
    // Meeting the filing requirements, now or later, is not meeting the
    // pathway when approval is unmet or open.
    pathway.status = pathwayOutcome(pathway.status, pathway.approvalStatus);
  }
  return result;
}

const run = (draft: UsDraft, locale: Locale) =>
  presentUnitedStatesResult(
    evaluateUnitedStatesFull(unitedStatesRequest(draft, locale)),
    locale,
  );

export const unitedStatesModule: CountryModule<UsDraft, UnitedStatesWhatIf> = {
  id: 'us',
  version: 1,
  scenarioLinks: true,
  // The date is the planned return for US-TRAVEL and the earliest filing
  // date elsewhere, whatever the approval stage.
  earliestLabel: {
    'US-TRAVEL': 'us.result.returnDate',
    'US-NATURALIZATION': 'us.result.filingDate',
    'US-SPOUSE': 'us.result.filingDate',
    'US-MILITARY': 'us.result.filingDate',
    'US-CONDITIONS': 'us.result.filingDate',
    'US-FAMILY': 'us.result.filingDate',
    'US-EMPLOYMENT': 'us.result.filingDate',
    'US-ADJUSTMENT': 'us.result.filingDate',
    'US-HUMANITARIAN': 'us.result.filingDate',
  },
  createDraft: createUnitedStatesDraft,
  activeAnswers: activeUnitedStatesAnswers,
  validateStep: validateUnitedStatesStep,
  decodeDraft: decodeUnitedStatesDraft,
  run,
  whatif: unitedStatesWhatIf,
  policy: unitedStatesPolicy,
};
