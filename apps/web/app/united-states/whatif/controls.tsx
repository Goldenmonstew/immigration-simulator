'use client';

import type { TranslationKey } from '../../../i18n';
import { useTranslation } from '../../../i18n/locale';
import type { UsDraft } from '../../../lib/united-states-draft';
import {
  isImmigrant,
  isNaturalization,
} from '../../../lib/united-states-fields';
import {
  latestTrip,
  unitedStatesFocusControls as ids,
  type UnitedStatesWhatIf,
} from '../../../lib/united-states-whatif';
import type { WhatIfControlsProps } from '../../../lib/whatif';
import styles from '../../uk/whatif/whatif.module.css';

type Choice = 'english' | 'civics' | 'visaAtDecision';
const choices: Record<Choice, readonly string[]> = {
  english: ['passed', 'failed', 'preparing'],
  civics: ['passed', 'failed', 'retest', 'preparing'],
  visaAtDecision: ['available', 'unavailable', 'future-bulletin'],
};

export function UnitedStatesWhatIfControls({
  afterDraft,
  knobs,
  update,
  errors,
}: WhatIfControlsProps<UsDraft, UnitedStatesWhatIf>) {
  const { t } = useTranslation();
  const error = (key: string) =>
    errors[key] && (
      <p id={`us-whatif-${key}-error`} role="alert" className={styles.error}>
        {t(errors[key])}
      </p>
    );
  const described = (key: string) =>
    errors[key] ? `us-whatif-${key}-error` : undefined;
  const select = (field: Choice, id: string, label: TranslationKey) => (
    <div className={styles.field}>
      <label htmlFor={id}>{t(label)}</label>
      <select
        id={id}
        value={knobs[field] ?? ''}
        onChange={(event) =>
          update({ [field]: event.target.value || undefined })
        }
      >
        <option value="">{t('us.form.unknown')}</option>
        {choices[field].map((option) => (
          <option key={option} value={option}>
            {t(`us.option.${option}` as TranslationKey)}
          </option>
        ))}
      </select>
    </div>
  );
  const date = (
    field: 'simulationDate' | 'returnOn' | 'decisionOn',
    id: string,
    key: string,
    label: TranslationKey,
  ) => (
    <div className={styles.field}>
      <label htmlFor={id}>{t(label)}</label>
      <input
        id={id}
        type="date"
        value={knobs[field] ?? ''}
        onChange={(event) => update({ [field]: event.target.value })}
        aria-invalid={errors[key] ? true : undefined}
        aria-describedby={described(key)}
      />
      {error(key)}
    </div>
  );
  const travel =
    afterDraft.pathway === 'US-TRAVEL' &&
    latestTrip(afterDraft.trips) !== undefined;
  return (
    <>
      {date('simulationDate', ids.date, 'date', 'us.whatif.date')}
      <p className={styles.hint}>{t('us.whatif.dateHint')}</p>
      <label className={styles.checkbox}>
        <input
          id={ids.trips}
          type="checkbox"
          checked={knobs.noTrips}
          onChange={(event) => update({ noTrips: event.target.checked })}
        />
        {t('us.whatif.noTrips')}
      </label>
      {travel &&
        !knobs.noTrips &&
        date('returnOn', ids.returnOn, 'returnOn', 'us.whatif.returnOn')}
      {isNaturalization(afterDraft) && (
        <>
          {select('english', ids.english, 'us.field.english')}
          {select('civics', ids.civics, 'us.field.civics')}
        </>
      )}
      {isImmigrant(afterDraft) && (
        <>
          <div className={styles.field}>
            <label htmlFor={ids.income}>{t('us.whatif.income')}</label>
            <input
              id={ids.income}
              type="number"
              min="0"
              step="any"
              value={knobs.income ?? ''}
              onChange={(event) =>
                update({
                  income: event.target.value
                    ? event.target.valueAsNumber
                    : undefined,
                })
              }
              aria-invalid={errors.income ? true : undefined}
              aria-describedby={described('income')}
            />
            {error('income')}
          </div>
          {date('decisionOn', ids.decision, 'decision', 'us.whatif.decisionOn')}
          {select('visaAtDecision', ids.visa, 'us.field.visaAtDecision')}
        </>
      )}
    </>
  );
}
