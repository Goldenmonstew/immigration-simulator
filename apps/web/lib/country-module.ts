import type {
  CountryPathway,
  CountryResult,
  DecisionOutcome,
  Locale,
} from '@uk-immigration/engine';
import type { TranslationKey } from '../i18n';
import type { CountryPolicy } from './policy';
import type { CountryId } from './site-countries';
import type { CountryWhatIf } from './whatif';

export interface CountryDraft {
  version: number;
  step: number;
  completed: boolean;
  simulationDate: string;
}

export interface CountryModule<D extends CountryDraft, K> {
  id: CountryId;
  version: number;
  createDraft(): D;
  // Project an editable draft onto the answers used for assessment and sharing.
  activeAnswers?(draft: D): D;
  // Return a new draft when a local correction needs to be persisted.
  restoreStoredDraft?(draft: D, forResult?: boolean): D;
  validateStep(draft: D): Record<string, TranslationKey>;
  decodeDraft(value: unknown, forResult?: boolean): D | undefined;
  run(draft: D, locale: Locale): CountryResult;
  whatif: CountryWhatIf<D, K>;
  policy: CountryPolicy;
  principal?(draft: D, locale: Locale): CountryResult | undefined;
  resultNotes?(draft?: D): { notices: TranslationKey[]; dependant?: boolean };
  advice?: {
    text: TranslationKey;
    sourceId: string;
    linkLabel: TranslationKey;
  };
}

// Existing labels, styles and issue reports use the UK engine's status names.
export const checkLabelStatus = {
  MET: 'PASS',
  NOT_MET: 'FAIL',
  UNKNOWN: 'UNKNOWN',
} as const;

export function isDecisionOutcome(
  status: CountryPathway['status'],
): status is DecisionOutcome {
  return !(
    status === 'MET' ||
    status === 'NOT_MET' ||
    status === 'UNKNOWN' ||
    status === 'FUTURE' ||
    status === 'NOT_APPLICABLE'
  );
}

export function pathwayTitle(
  pathway: CountryPathway,
  t: (key: TranslationKey) => string,
) {
  return isDecisionOutcome(pathway.status)
    ? t(`outcome.${pathway.status}`)
    : t(`country.status.${pathway.status}`).replace(
        '{date}',
        pathway.earliestDate ?? t('result.undetermined'),
      );
}

export function pathwayDate(pathway?: CountryPathway) {
  if (!pathway || pathway.travelDate === null) return undefined;
  return pathway.travelDate
    ? {
        label: `country.${pathway.travelDate.kind}` as const,
        date: pathway.travelDate.date,
      }
    : { label: 'result.earliest' as const, date: pathway.earliestDate };
}
