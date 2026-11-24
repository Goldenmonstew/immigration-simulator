'use client';

import {
  ES_NATIONALITY_ROUTES,
  type EsNationalityRoute,
} from '@uk-immigration/engine';
import { useTranslation } from '../../../i18n/locale';
import type { TranslationKey } from '../../../i18n';
import type { SpainDraft } from '../../../lib/spain-draft';
import {
  spainFocusControls as ids,
  spainMobilityPurpose,
  type SpainWhatIf,
} from '../../../lib/spain-whatif';
import type { WhatIfControlsProps } from '../../../lib/whatif';
import styles from '../../uk/whatif/whatif.module.css';

export function SpainWhatIfControls({
  afterDraft,
  knobs,
  update,
  errors,
}: WhatIfControlsProps<SpainDraft, SpainWhatIf>) {
  const { t } = useTranslation();
  const targets = afterDraft.targets;
  const purpose = spainMobilityPurpose(afterDraft);
  const has = (...items: typeof targets) =>
    targets.some((item) => items.includes(item));
  const hasNat = has('N');
  // M reads card absences (ES-T02).
  const hasTrips = has('N', 'L', 'E', 'U', 'M');
  const hasResources = has('E', 'F') || purpose === 'non-working';
  const hasSalary = purpose === 'employment';
  const hasInsurance = has('E', 'F', 'R-E') || purpose === 'non-working';
  const hasConduct = has('N', 'L', 'E', 'M', 'R-N', 'R-E', 'U');

  function choice(
    field: 'delePassed' | 'ccsePassed' | 'healthCover' | 'conductCleared',
    id: string,
    label: TranslationKey,
  ) {
    const value = knobs[field];
    return (
      <div className={styles.field}>
        <label htmlFor={id}>{t(label)}</label>
        <select
          id={id}
          value={value === undefined ? '' : String(value)}
          onChange={(e) =>
            update({
              [field]:
                e.target.value === '' ? undefined : e.target.value === 'true',
            })
          }
        >
          <option value="">{t('form.unknown')}</option>
          <option value="true">{t('form.yes')}</option>
          <option value="false">{t('form.no')}</option>
        </select>
      </div>
    );
  }

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
        <label htmlFor={ids.date}>{t('es.whatif.date')}</label>
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
      {hasTrips && (
        <label className={styles.checkbox}>
          <input
            id={ids.trips}
            type="checkbox"
            checked={knobs.noTrips}
            onChange={(e) => update({ noTrips: e.target.checked })}
          />
          {t('es.whatif.noTrips')}
        </label>
      )}
      {hasNat && (
        <>
          <div className={styles.field}>
            <label htmlFor={ids.natRoute}>{t('es.whatif.natRoute')}</label>
            <select
              id={ids.natRoute}
              value={knobs.natRoute ?? ''}
              onChange={(e) =>
                update({
                  natRoute:
                    e.target.value === ''
                      ? undefined
                      : (e.target.value as EsNationalityRoute),
                })
              }
            >
              <option value="">{t('form.unknown')}</option>
              {ES_NATIONALITY_ROUTES.map((route) => (
                <option key={route} value={route}>
                  {t(`es.option.${route}`)}
                </option>
              ))}
            </select>
          </div>
          {choice('delePassed', ids.dele, 'es.whatif.dele')}
          {choice('ccsePassed', ids.ccse, 'es.whatif.ccse')}
        </>
      )}
      {hasResources && (
        <div className={styles.field}>
          <label htmlFor={ids.familySize}>{t('es.whatif.familySize')}</label>
          <input
            id={ids.familySize}
            type="number"
            min="1"
            step="1"
            value={knobs.familySize ?? ''}
            onChange={(e) =>
              update({
                familySize: e.target.value ? e.target.valueAsNumber : undefined,
              })
            }
            aria-invalid={!!errors.familySize}
            aria-describedby={
              errors.familySize ? 'familySize-error' : undefined
            }
          />
          {error('familySize')}
        </div>
      )}
      {hasResources && (
        <div className={styles.field}>
          <label htmlFor={ids.income}>{t('es.whatif.income')}</label>
          <input
            id={ids.income}
            type="number"
            min="0"
            step="any"
            value={knobs.monthlyIncome ?? ''}
            onChange={(e) =>
              update({
                monthlyIncome: e.target.value
                  ? e.target.valueAsNumber
                  : undefined,
              })
            }
            aria-invalid={!!errors.income}
            aria-describedby={errors.income ? 'income-error' : undefined}
          />
          {error('income')}
        </div>
      )}
      {hasSalary && (
        <div className={styles.field}>
          <label htmlFor={ids.salary}>{t('es.whatif.salary')}</label>
          <input
            id={ids.salary}
            type="number"
            min="0"
            step="any"
            value={knobs.annualSalary ?? ''}
            onChange={(e) =>
              update({
                annualSalary: e.target.value
                  ? e.target.valueAsNumber
                  : undefined,
              })
            }
            aria-invalid={!!errors.salary}
            aria-describedby={errors.salary ? 'salary-error' : undefined}
          />
          {error('salary')}
        </div>
      )}
      {hasInsurance &&
        choice('healthCover', ids.insurance, 'es.whatif.insurance')}
      {hasConduct && choice('conductCleared', ids.conduct, 'es.whatif.conduct')}
    </>
  );
}
