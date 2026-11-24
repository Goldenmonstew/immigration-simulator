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
  for (const pathway of result.columns[0].pathways) {
    // The main status is for filing (or return). Approval is shown alongside.
    if (pathway.approvalStatus)
      pathway.summary +=
        ' ' +
        t('us.result.approval', locale).replace(
          '{status}',
          t(`country.status.${pathway.approvalStatus}`, locale).replace(
            '{date}',
            pathway.approvalEarliestDate ?? t('result.undetermined', locale),
          ),
        );
    // A return date is not a filing date.
    if (pathway.id === 'US-TRAVEL') pathway.travelDate = null;
  }
  return result;
}

export const unitedStatesModule: CountryModule<UsDraft, UnitedStatesWhatIf> = {
  id: 'us',
  version: 1,
  createDraft: createUnitedStatesDraft,
  activeAnswers: activeUnitedStatesAnswers,
  validateStep: validateUnitedStatesStep,
  decodeDraft: decodeUnitedStatesDraft,
  run,
  whatif: unitedStatesWhatIf,
  policy: unitedStatesPolicy,
};
