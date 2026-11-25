'use client';

import type { TranslationKey } from '../../../i18n';
import { useTranslation } from '../../../i18n/locale';
import type { MalaysiaDraft } from '../../../lib/malaysia-draft';
import type { MyTarget } from '../../../lib/malaysia-fields';
import {
  malaysiaFocusControls as ids,
  type MalaysiaWhatIf,
} from '../../../lib/malaysia-whatif';
import type { WhatIfControlsProps } from '../../../lib/whatif';
import styles from '../../uk/whatif/whatif.module.css';

export function MalaysiaWhatIfControls({
  afterDraft,
  knobs,
  update,
  errors,
}: WhatIfControlsProps<MalaysiaDraft, MalaysiaWhatIf>) {
  const { t } = useTranslation();
  const assessed = (...targets: MyTarget[]) =>
    targets.some((target) => afterDraft.targets.includes(target));
  const described = (field: string, hint?: string) =>
    [hint, errors[field] && `${field}-error`].filter(Boolean).join(' ') ||
    undefined;
  const error = (field: string) =>
    errors[field] && (
      <p id={`${field}-error`} role="alert" className={styles.error}>
        {t(errors[field])}
      </p>
    );
  const amount = (
    field: 'salary' | 'deRantauIncome' | 'mm2hDeposit',
    label: TranslationKey,
  ) => (
    <div className={styles.field}>
      <label htmlFor={ids[field]}>{t(label)}</label>
      <input
        id={ids[field]}
        type="number"
        min="0"
        step="any"
        value={knobs[field] ?? ''}
        onChange={(event) =>
          update({
            [field]: event.target.value
              ? event.target.valueAsNumber
              : undefined,
          })
        }
        aria-invalid={!!errors[field]}
        aria-describedby={described(field)}
      />
      {error(field)}
    </div>
  );
  return (
    <>
      <div className={styles.field}>
        <label htmlFor={ids.date}>{t('my.whatif.date')}</label>
        <input
          id={ids.date}
          type="date"
          value={knobs.simulationDate}
          onChange={(event) => update({ simulationDate: event.target.value })}
          aria-invalid={!!errors.date}
          aria-describedby={described('date', 'my-whatif-date-hint')}
        />
        <p id="my-whatif-date-hint" className={styles.hint}>
          {t('my.whatif.dateHint')}
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
          {t('my.whatif.noTrips')}
        </label>
      )}
      {assessed('cit-naturalisation', 'cit-wife') && (
        <div className={styles.field}>
          <label htmlFor={ids.prSince}>{t('my.whatif.prSince')}</label>
          <input
            id={ids.prSince}
            type="date"
            value={knobs.prSince ?? ''}
            onChange={(event) =>
              update({ prSince: event.target.value || undefined })
            }
            aria-invalid={!!errors.prSince}
            aria-describedby={described('prSince', 'my-whatif-pr-since-hint')}
          />
          <p id="my-whatif-pr-since-hint" className={styles.hint}>
            {t('my.whatif.prSinceHint')}
          </p>
          {error('prSince')}
        </div>
      )}
      {assessed('pass-rpt', 'pass-employment') &&
        amount('salary', 'my.whatif.salary')}
      {assessed('pass-de-rantau') &&
        amount('deRantauIncome', 'my.whatif.deRantauIncome')}
      {assessed('pass-mm2h') && amount('mm2hDeposit', 'my.whatif.mm2hDeposit')}
    </>
  );
}
