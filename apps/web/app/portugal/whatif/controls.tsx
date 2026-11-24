'use client';

import type { TranslationKey } from '../../../i18n';
import { useTranslation } from '../../../i18n/locale';
import type { PortugalDraft } from '../../../lib/portugal-draft';
import {
  portugalFocusControls as ids,
  type PortugalWhatIf,
} from '../../../lib/portugal-whatif';
import type { WhatIfControlsProps } from '../../../lib/whatif';
import styles from '../../uk/whatif/whatif.module.css';

export function PortugalWhatIfControls({
  afterDraft,
  knobs,
  update,
  errors,
}: WhatIfControlsProps<PortugalDraft, PortugalWhatIf>) {
  const { t } = useTranslation();
  const targets = afterDraft.targets;
  const error = (field: string) =>
    errors[field] && (
      <p id={`${field}-error`} role="alert" className={styles.error}>
        {t(errors[field])}
      </p>
    );
  const choice = (
    field: 'natLanguage' | 'natKnowledge' | 'residenceLanguage',
    label: TranslationKey,
  ) => (
    <div className={styles.field}>
      <label htmlFor={ids[field]}>{t(label)}</label>
      <select
        id={ids[field]}
        value={knobs[field] === undefined ? '' : String(knobs[field])}
        onChange={(event) =>
          update({
            [field]:
              event.target.value === ''
                ? undefined
                : event.target.value === 'true',
          })
        }
      >
        <option value="">{t('form.unknown')}</option>
        <option value="true">{t('form.yes')}</option>
        <option value="false">{t('form.no')}</option>
      </select>
    </div>
  );
  return (
    <>
      <div className={styles.field}>
        <label htmlFor={ids.date}>{t('pt.whatif.date')}</label>
        <input
          id={ids.date}
          type="date"
          value={knobs.simulationDate}
          onChange={(event) => update({ simulationDate: event.target.value })}
          aria-invalid={!!errors.date}
          aria-describedby={
            errors.date
              ? 'pt-whatif-date-hint date-error'
              : 'pt-whatif-date-hint'
          }
        />
        <p id="pt-whatif-date-hint" className={styles.hint}>
          {t('pt.whatif.dateHint')}
        </p>
        {error('date')}
      </div>
      {afterDraft.trips && (
        <label className={styles.checkbox}>
          <input
            id={ids.trips}
            type="checkbox"
            checked={knobs.noTrips}
            onChange={(event) => update({ noTrips: event.target.checked })}
          />
          {t('pt.whatif.noTrips')}
        </label>
      )}
      {targets.includes('naturalisation') && (
        <>
          {choice('natLanguage', 'pt.whatif.natLanguage')}
          {choice('natKnowledge', 'pt.whatif.natKnowledge')}
        </>
      )}
      {(targets.includes('permanent') || targets.includes('long-term')) &&
        choice('residenceLanguage', 'pt.whatif.residenceLanguage')}
      {targets.some(
        (target) =>
          target === 'permanent' ||
          target === 'long-term' ||
          target === 'investment' ||
          target === 'renewal',
      ) && (
        <div className={styles.field}>
          <label htmlFor={ids.income}>{t('pt.whatif.income')}</label>
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
            aria-invalid={!!errors.income}
            aria-describedby={errors.income ? 'income-error' : undefined}
          />
          {error('income')}
        </div>
      )}
    </>
  );
}
