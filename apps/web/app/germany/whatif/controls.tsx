'use client';

import type { TranslationKey } from '../../../i18n';
import { useTranslation } from '../../../i18n/locale';
import type { GermanyDraft } from '../../../lib/germany-draft';
import {
  germanyFocusControls as ids,
  type GermanyWhatIf,
  type GermanyWhatIfLevel,
} from '../../../lib/germany-whatif';
import type { WhatIfControlsProps } from '../../../lib/whatif';
import styles from '../../uk/whatif/whatif.module.css';

const germanLevels: GermanyWhatIfLevel[] = [
  'none',
  'A1',
  'A2',
  'B1',
  'B2',
  'C1',
  'C2',
];

export function GermanyWhatIfControls({
  knobs,
  update,
  errors,
}: WhatIfControlsProps<GermanyDraft, GermanyWhatIf>) {
  const { t } = useTranslation();
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
        <label htmlFor={ids.date}>{t('de.whatif.date')}</label>
        <input
          id={ids.date}
          type="date"
          value={knobs.simulationDate}
          onChange={(e) => update({ simulationDate: e.target.value })}
          aria-invalid={!!errors.date}
          aria-describedby={errors.date ? 'date-error' : undefined}
        />
        {error('date')}
      </div>

      <div className={styles.field}>
        <label htmlFor={ids.german}>{t('de.whatif.german')}</label>
        <select
          id={ids.german}
          value={knobs.provenGerman ?? ''}
          onChange={(e) =>
            update({
              provenGerman:
                e.target.value === ''
                  ? undefined
                  : (e.target.value as GermanyWhatIfLevel),
            })
          }
        >
          <option value="">{t('form.unknown')}</option>
          {germanLevels.map((lvl) => (
            <option key={lvl} value={lvl}>
              {t(`de.option.${lvl}` as TranslationKey)}
            </option>
          ))}
        </select>
      </div>

      <div className={styles.field}>
        <label htmlFor={ids.knowledge}>{t('de.whatif.knowledge')}</label>
        <input
          id={ids.knowledge}
          type="number"
          min="0"
          max="33"
          step="1"
          value={knobs.orientationScore ?? ''}
          onChange={(e) =>
            update({
              orientationScore:
                e.target.value === '' ? undefined : Number(e.target.value),
            })
          }
          aria-invalid={!!errors.knowledge}
          aria-describedby={errors.knowledge ? 'knowledge-error' : undefined}
        />
        {error('knowledge')}
      </div>

      <div className={styles.field}>
        <label htmlFor={ids.contributions}>
          {t('de.whatif.contributions')}
        </label>
        <input
          id={ids.contributions}
          type="number"
          min="0"
          step="1"
          value={knobs.contributionMonths ?? ''}
          onChange={(e) =>
            update({
              contributionMonths:
                e.target.value === '' ? undefined : Number(e.target.value),
            })
          }
          aria-invalid={!!errors.contributions}
          aria-describedby={
            errors.contributions ? 'contributions-error' : undefined
          }
        />
        {error('contributions')}
      </div>

      <div className={styles.field}>
        <label htmlFor={ids.blueCardMonths}>
          {t('de.whatif.blueCardMonths')}
        </label>
        <input
          id={ids.blueCardMonths}
          type="number"
          min="0"
          step="1"
          value={knobs.blueCardMonths ?? ''}
          onChange={(e) =>
            update({
              blueCardMonths:
                e.target.value === '' ? undefined : Number(e.target.value),
            })
          }
          aria-invalid={!!errors.blueCardMonths}
          aria-describedby={
            errors.blueCardMonths ? 'blueCardMonths-error' : undefined
          }
        />
        {error('blueCardMonths')}
      </div>

      <div className={styles.field}>
        <label htmlFor={ids.salary}>{t('de.whatif.salary')}</label>
        <input
          id={ids.salary}
          type="number"
          min="0"
          step="any"
          value={knobs.annualGrossSalary ?? ''}
          onChange={(e) =>
            update({
              annualGrossSalary:
                e.target.value === '' ? undefined : Number(e.target.value),
            })
          }
          aria-invalid={!!errors.salary}
          aria-describedby={errors.salary ? 'salary-error' : undefined}
        />
        {error('salary')}
      </div>

      <div className={styles.field}>
        <label htmlFor={ids.livelihood}>{t('de.whatif.livelihood')}</label>
        <select
          id={ids.livelihood}
          value={
            knobs.livelihoodConfirmed === undefined
              ? ''
              : String(knobs.livelihoodConfirmed)
          }
          onChange={(e) =>
            update({
              livelihoodConfirmed:
                e.target.value === '' ? undefined : e.target.value === 'true',
            })
          }
        >
          <option value="">{t('form.unknown')}</option>
          <option value="true">{t('form.yes')}</option>
          <option value="false">{t('form.no')}</option>
        </select>
      </div>

      <label className={styles.checkbox}>
        <input
          id={ids.trips}
          type="checkbox"
          checked={knobs.noTrips}
          onChange={(e) => update({ noTrips: e.target.checked })}
        />
        {t('de.whatif.noTrips')}
      </label>
    </>
  );
}
