import {
  evaluateUnitedStatesFull,
  type Locale,
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

function run(draft: UsDraft, locale: Locale): UsFullResult {
  const result = evaluateUnitedStatesFull(unitedStatesRequest(draft, locale));
  const separator = locale === 'zh-CN' ? '' : ' ';
  for (const pathway of result.columns[0].pathways) {
    // Fees and procedural reminders do not decide the pathway, so only time
    // and other requirements are gaps.
    for (const check of pathway.checks)
      check.kind = check.id.startsWith('US-TIME-')
        ? 'time'
        : /^US-C4[45]-/.test(check.id)
          ? 'budget'
          : check.informational
            ? 'information'
            : 'requirement';
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
    // Meeting the filing requirements is not meeting the pathway when
    // approval is unmet or open: the outcome shows the approval stage.
    if (
      pathway.status === 'MET' &&
      (pathway.approvalStatus === 'NOT_MET' ||
        pathway.approvalStatus === 'UNKNOWN')
    )
      pathway.status = pathway.approvalStatus;
  }
  return result;
}

export const unitedStatesModule: CountryModule<UsDraft, UnitedStatesWhatIf> = {
  id: 'us',
  version: 1,
  scenarioLinks: true,
  earliestLabel: { 'US-TRAVEL': 'us.result.returnDate' },
  createDraft: createUnitedStatesDraft,
  activeAnswers: activeUnitedStatesAnswers,
  validateStep: validateUnitedStatesStep,
  decodeDraft: decodeUnitedStatesDraft,
  run,
  whatif: unitedStatesWhatIf,
  policy: unitedStatesPolicy,
};
