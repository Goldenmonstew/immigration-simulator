'use client';

import type { TranslationKey } from '../../../i18n';
import { useTranslation } from '../../../i18n/locale';
import type { IrelandDraft } from '../../../lib/ireland-draft';
import { FAMILY_PATHS, WORK_PATHS } from '../../../lib/ireland-fields';
import {
  irelandFocusControls as ids,
  type IrelandWhatIf,
} from '../../../lib/ireland-whatif';
import type { WhatIfControlsProps } from '../../../lib/whatif';
import styles from '../../uk/whatif/whatif.module.css';

export function IrelandWhatIfControls({
  afterDraft,
  knobs,
  update,
  errors,
}: WhatIfControlsProps<IrelandDraft, IrelandWhatIf>) {
  const { t } = useTranslation();
  const has = (paths: readonly string[]) =>
    afterDraft.pathways.some((id) => paths.includes(id));
  const described = (field: string, hint?: string) =>
    [hint, errors[field] && `${field}-error`].filter(Boolean).join(' ') ||
    undefined;
  const error = (field: string) =>
    errors[field] && (
      <p id={`${field}-error`} role="alert" className={styles.error}>
        {t(errors[field])}
      </p>
    );
  const date = (
    field: 'employment' | 'irp',
    knob: 'employmentStart' | 'irpExpiresOn',
    label: TranslationKey,
  ) => (
    <div className={styles.field}>
      <label htmlFor={ids[field]}>{t(label)}</label>
      <input
        id={ids[field]}
        type="date"
        value={knobs[knob] ?? ''}
        onChange={(e) => update({ [knob]: e.target.value || undefined })}
        aria-invalid={!!errors[field]}
        aria-describedby={described(field)}
      />
      {error(field)}
    </div>
  );
  return (
    <>
      <div className={styles.field}>
        <label htmlFor={ids.date}>{t('ie.whatif.date')}</label>
        <input
          id={ids.date}
          type="date"
          value={knobs.simulationDate}
          onChange={(e) => update({ simulationDate: e.target.value })}
          aria-invalid={!!errors.date}
          aria-describedby={described('date', 'ie-whatif-date-hint')}
        />
        <p id="ie-whatif-date-hint" className={styles.hint}>
          {t('ie.whatif.dateHint')}
        </p>
        {error('date')}
      </div>
      {afterDraft.trips !== undefined && (
        <label className={styles.checkbox}>
          <input
            id={ids.trips}
            type="checkbox"
            checked={knobs.noTrips}
            onChange={(e) => update({ noTrips: e.target.checked })}
          />
          {t('ie.whatif.noTrips')}
        </label>
      )}
      {has(WORK_PATHS) &&
        date('employment', 'employmentStart', 'ie.whatif.employmentStart')}
      {date('irp', 'irpExpiresOn', 'ie.whatif.irpExpiresOn')}
      {has(FAMILY_PATHS) && (
        <div className={styles.field}>
          <label htmlFor={ids.income}>{t('ie.whatif.income')}</label>
          <input
            id={ids.income}
            type="number"
            min="0"
            step="any"
            value={knobs.income ?? ''}
            onChange={(e) =>
              update({
                income: e.target.value ? e.target.valueAsNumber : undefined,
              })
            }
            aria-invalid={!!errors.income}
            aria-describedby={described('income', 'ie-whatif-income-hint')}
          />
          <p id="ie-whatif-income-hint" className={styles.hint}>
            {t('ie.whatif.incomeHint')}
          </p>
          {error('income')}
        </div>
      )}
    </>
  );
}
