'use client';

import type { TranslationKey } from '../../../i18n';
import { useTranslation } from '../../../i18n/locale';
import {
  hasGermanyCitizenshipStep,
  hasGermanyCommonStep,
  type GermanyDraft,
} from '../../../lib/germany-draft';
import {
  germanyFocusControls as ids,
  MIXED,
  type GermanyWhatIf,
} from '../../../lib/germany-whatif';
import type { WhatIfControlsProps } from '../../../lib/whatif';
import styles from '../../uk/whatif/whatif.module.css';

const germanLevels = ['none', 'A1', 'A2', 'B1', 'B2', 'C1', 'C2'] as const;
type NumberKnob =
  | 'orientationScore'
  | 'natScore'
  | 'contributionMonths'
  | 'blueCardMonths'
  | 'annualGrossSalary';

export function GermanyWhatIfControls({
  afterDraft,
  knobs,
  update,
  errors,
}: WhatIfControlsProps<GermanyDraft, GermanyWhatIf>) {
  const { t } = useTranslation();
  const settlement = hasGermanyCommonStep(afterDraft);
  const citizenship = hasGermanyCitizenshipStep(afterDraft);
  const blueCard = afterDraft.routes.includes('R03');
  function error(field: string) {
    return (
      errors[field] && (
        <p id={`${field}-error`} role="alert" className={styles.error}>
          {t(errors[field])}
        </p>
      )
    );
  }
  // Shown only while the selected routes hold different answers.
  const mixed = (value: unknown) =>
    value === MIXED && <option value={MIXED}>{t('de.whatif.mixed')}</option>;
  function level(field: 'provenGerman' | 'natGerman', id: string) {
    const value = knobs[field];
    return (
      <div className={styles.field}>
        <label htmlFor={id}>{t(`de.whatif.${field}`)}</label>
        <select
          id={id}
          value={value ?? ''}
          onChange={(e) =>
            update({
              [field]:
                e.target.value === ''
                  ? undefined
                  : (e.target.value as GermanyWhatIf[typeof field]),
            })
          }
        >
          {mixed(value)}
          <option value="">{t('form.unknown')}</option>
          {germanLevels.map((lvl) => (
            <option key={lvl} value={lvl}>
              {t(`de.option.${lvl}`)}
            </option>
          ))}
        </select>
      </div>
    );
  }
  function yesNo(field: 'livelihoodConfirmed' | 'natLivelihood', id: string) {
    const value = knobs[field];
    return (
      <div className={styles.field}>
        <label htmlFor={id}>{t(`de.whatif.${field}`)}</label>
        <select
          id={id}
          value={value === undefined ? '' : String(value)}
          onChange={(e) => {
            const answer = e.target.value;
            update({
              [field]:
                answer === ''
                  ? undefined
                  : answer === MIXED
                    ? MIXED
                    : answer === 'true',
            });
          }}
        >
          {mixed(value)}
          <option value="">{t('form.unknown')}</option>
          <option value="true">{t('form.yes')}</option>
          <option value="false">{t('form.no')}</option>
        </select>
      </div>
    );
  }
  function count(
    field: NumberKnob,
    id: string,
    label: TranslationKey,
    errorKey: string,
    max?: number,
  ) {
    return (
      <div className={styles.field}>
        <label htmlFor={id}>{t(label)}</label>
        <input
          id={id}
          type="number"
          min="0"
          max={max}
          step={field === 'annualGrossSalary' ? 'any' : '1'}
          value={knobs[field] ?? ''}
          onChange={(e) =>
            update({
              [field]:
                e.target.value === '' ? undefined : Number(e.target.value),
            })
          }
          aria-invalid={!!errors[errorKey]}
          aria-describedby={errors[errorKey] ? `${errorKey}-error` : undefined}
        />
        {error(errorKey)}
      </div>
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
          aria-describedby={
            errors.date
              ? 'de-whatif-date-hint date-error'
              : 'de-whatif-date-hint'
          }
        />
        <p id="de-whatif-date-hint">{t('de.whatif.dateHint')}</p>
        {error('date')}
      </div>

      {settlement && (
        <>
          {level('provenGerman', ids.german)}
          {count(
            'orientationScore',
            ids.knowledge,
            'de.whatif.knowledge',
            'knowledge',
            33,
          )}
          {count(
            'contributionMonths',
            ids.contributions,
            'de.whatif.contributions',
            'contributions',
          )}
          {yesNo('livelihoodConfirmed', ids.livelihood)}
        </>
      )}

      {blueCard &&
        (afterDraft.mobility?.blueCard?.employment ? (
          <div className={styles.field}>
            <p id={ids.blueCardMonths} tabIndex={-1}>
              {t('de.whatif.blueCardItemised')}
            </p>
          </div>
        ) : (
          count(
            'blueCardMonths',
            ids.blueCardMonths,
            'de.whatif.blueCardMonths',
            'blueCardMonths',
          )
        ))}
      {blueCard &&
        count('annualGrossSalary', ids.salary, 'de.whatif.salary', 'salary')}

      {citizenship && (
        <>
          {level('natGerman', ids.natGerman)}
          {count(
            'natScore',
            ids.natKnowledge,
            'de.whatif.natKnowledge',
            'natKnowledge',
            33,
          )}
          {yesNo('natLivelihood', ids.natLivelihood)}
        </>
      )}

      <label className={styles.checkbox}>
        <input
          id={ids.trips}
          type="checkbox"
          checked={knobs.noTrips}
          onChange={(e) => update({ noTrips: e.target.checked })}
          aria-describedby="de-whatif-trips-hint"
        />
        {t('de.whatif.noTrips')}
      </label>
      <p id="de-whatif-trips-hint">{t('de.whatif.noTripsHint')}</p>
    </>
  );
}
