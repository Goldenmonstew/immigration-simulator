'use client';

import { useTranslation } from '../../../i18n/locale';
import type { AustraliaDraft } from '../../../lib/australia-draft';
import {
  australiaFocusControls as ids,
  type AustraliaWhatIf,
} from '../../../lib/australia-whatif';
import type { WhatIfControlsProps } from '../../../lib/whatif';
import styles from '../../uk/whatif/whatif.module.css';

const healthOptions = [
  'cleared',
  'no-known-condition',
  'cost-risk',
  'cost-finding',
  'waiver-granted',
  'waiver-refused',
  'public-health-failure',
] as const;

export function AustraliaWhatIfControls({
  afterDraft,
  knobs,
  update,
  errors,
}: WhatIfControlsProps<AustraliaDraft, AustraliaWhatIf>) {
  const { t } = useTranslation();
  const nominations = afterDraft.employer?.nominations;
  const nominated = !!(
    nominations?.['AU-186-TRT'] || nominations?.['AU-186-DE']
  );

  function error(field: string) {
    return (
      errors[field] && (
        <p id={`${field}-error`} role="alert" className={styles.error}>
          {t(errors[field])}
        </p>
      )
    );
  }

  return (
    <>
      <div className={styles.field}>
        <label htmlFor={ids.date}>{t('au.whatif.date')}</label>
        <input
          id={ids.date}
          type="date"
          value={knobs.simulationDate}
          onChange={(e) => update({ simulationDate: e.target.value })}
          aria-invalid={!!errors.date}
          aria-describedby={
            errors.date
              ? 'au-whatif-date-hint date-error'
              : 'au-whatif-date-hint'
          }
        />
        <p id="au-whatif-date-hint">{t('au.whatif.dateHint')}</p>
        {error('date')}
      </div>

      <label className={styles.checkbox}>
        <input
          id={ids.trips}
          type="checkbox"
          checked={knobs.noTrips}
          onChange={(e) => update({ noTrips: e.target.checked })}
        />
        {t('au.whatif.noTrips')}
      </label>

      <div className={styles.field}>
        <label htmlFor={ids.english}>{t('au.whatif.english')}</label>
        <select
          id={ids.english}
          value={knobs.ieltsBand === undefined ? '' : String(knobs.ieltsBand)}
          onChange={(e) =>
            update({
              ieltsBand:
                e.target.value === '' ? undefined : Number(e.target.value),
            })
          }
        >
          <option value="">{t('au.whatif.englishBaseline')}</option>
          <option value="4.5">{t('au.whatif.english45')}</option>
          <option value="6">{t('au.whatif.english6')}</option>
          <option value="7">{t('au.whatif.english7')}</option>
          <option value="8">{t('au.whatif.english8')}</option>
        </select>
      </div>

      <div className={styles.field}>
        <label htmlFor={ids.salary}>{t('au.whatif.salary')}</label>
        <input
          id={ids.salary}
          type="number"
          min="0"
          step="1"
          value={knobs.annualSalary ?? ''}
          onChange={(e) =>
            update({
              annualSalary:
                e.target.value === '' ? undefined : Number(e.target.value),
            })
          }
          aria-invalid={!!errors.salary}
          aria-describedby={
            [
              nominated ? '' : 'au-whatif-salary-hint',
              errors.salary ? 'salary-error' : '',
            ]
              .filter(Boolean)
              .join(' ') || undefined
          }
        />
        {!nominated && (
          <p id="au-whatif-salary-hint">{t('au.whatif.noNomination')}</p>
        )}
        {error('salary')}
      </div>

      <div className={styles.field}>
        <label htmlFor={ids.taxYears}>{t('au.whatif.taxYears')}</label>
        <select
          id={ids.taxYears}
          value={
            knobs.taxNoticeCount === undefined
              ? ''
              : String(knobs.taxNoticeCount)
          }
          onChange={(e) =>
            update({
              taxNoticeCount:
                e.target.value === '' ? undefined : Number(e.target.value),
            })
          }
        >
          <option value="">{t('au.whatif.taxYearsBaseline')}</option>
          <option value="0">0</option>
          <option value="1">1</option>
          <option value="2">2</option>
          <option value="3">3</option>
        </select>
      </div>

      <div className={styles.field}>
        <label htmlFor={ids.citizenshipTest}>
          {t('au.whatif.citizenshipTest')}
        </label>
        <select
          id={ids.citizenshipTest}
          value={
            knobs.citizenshipTestPassed === undefined
              ? ''
              : String(knobs.citizenshipTestPassed)
          }
          onChange={(e) =>
            update({
              citizenshipTestPassed:
                e.target.value === '' ? undefined : e.target.value === 'true',
            })
          }
        >
          <option value="">{t('form.unknown')}</option>
          <option value="true">{t('form.yes')}</option>
          <option value="false">{t('form.no')}</option>
        </select>
      </div>

      <div className={styles.field}>
        <label htmlFor={ids.health}>{t('au.whatif.health')}</label>
        <select
          id={ids.health}
          value={knobs.health ?? ''}
          onChange={(e) =>
            update({
              health:
                e.target.value === ''
                  ? undefined
                  : (e.target.value as AustraliaWhatIf['health']),
            })
          }
        >
          <option value="">{t('form.unknown')}</option>
          {healthOptions.map((opt) => (
            <option key={opt} value={opt}>
              {t(`au.option.${opt}`)}
            </option>
          ))}
        </select>
      </div>
    </>
  );
}
