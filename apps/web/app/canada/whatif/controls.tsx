'use client';

import type { TranslationKey } from '../../../i18n';
import { useTranslation } from '../../../i18n/locale';
import type { CanadaDraft } from '../../../lib/canada-draft';
import { canadaSteps, maxLevel } from '../../../lib/canada-fields';
import {
  canadaFocusControls as ids,
  canadaNumberKnobs,
  type CanadaWhatIf,
} from '../../../lib/canada-whatif';
import type { WhatIfControlsProps } from '../../../lib/whatif';
import styles from '../../uk/whatif/whatif.module.css';

type NumberKnob = keyof typeof canadaNumberKnobs;

const testOutcomes = [
  'passed',
  'not-taken',
  'retry',
  'finally-failed',
] as const;

export function CanadaWhatIfControls({
  afterDraft,
  knobs,
  update,
  errors,
}: WhatIfControlsProps<CanadaDraft, CanadaWhatIf>) {
  const { t } = useTranslation();
  const goals = afterDraft.goals;
  const express = canadaSteps
    .find(({ title }) => title === 'express')!
    .when(afterDraft);
  const describedBy = (field: string, hint?: string) =>
    [hint, errors[field] && `${field}-error`].filter(Boolean).join(' ') ||
    undefined;
  const error = (field: string) =>
    errors[field] && (
      <p id={`${field}-error`} role="alert" className={styles.error}>
        {t(errors[field])}
      </p>
    );
  // A control whose answers are missing explains what to add first, and
  // still receives focus from a condition link.
  const missing = (id: string, label: TranslationKey, note: TranslationKey) => (
    <div className={styles.field}>
      <strong>{t(label)}</strong>
      <p id={id} tabIndex={-1} className={styles.hint}>
        {t(note)}
      </p>
    </div>
  );
  const amount = (field: NumberKnob, label: TranslationKey) => (
    <div className={styles.field}>
      <label htmlFor={ids[field]}>{t(label)}</label>
      <input
        id={ids[field]}
        type="number"
        min="0"
        max={'max' in canadaNumberKnobs[field] ? maxLevel : undefined}
        step={'integer' in canadaNumberKnobs[field] ? 1 : 'any'}
        value={knobs[field] ?? ''}
        onChange={(event) =>
          update({
            [field]: event.target.value
              ? event.target.valueAsNumber
              : undefined,
          })
        }
        aria-invalid={errors[field] ? true : undefined}
        aria-describedby={describedBy(field)}
      />
      {error(field)}
    </div>
  );
  return (
    <>
      <div className={styles.field}>
        <label htmlFor={ids.date}>{t('whatif.date')}</label>
        <input
          id={ids.date}
          type="date"
          value={knobs.simulationDate}
          onChange={(event) => update({ simulationDate: event.target.value })}
          aria-invalid={errors.date ? true : undefined}
          aria-describedby={describedBy('date', 'ca-whatif-date-hint')}
        />
        <p id="ca-whatif-date-hint" className={styles.hint}>
          {t('ca.whatif.dateHint')}
        </p>
        {error('date')}
      </div>
      {(goals.includes('CA-RESIDENCY') || goals.includes('CA-CITIZENSHIP')) &&
        (!afterDraft.answers.trips ? (
          missing(ids.trip, 'ca.whatif.trip', 'ca.whatif.tripNeedsRecord')
        ) : (
          <fieldset className={styles.income}>
            <legend>{t('ca.whatif.trip')}</legend>
            <div className={styles.field}>
              <label htmlFor={ids.trip}>{t('ca.whatif.tripFrom')}</label>
              <input
                id={ids.trip}
                type="date"
                value={knobs.tripFrom}
                onChange={(event) => update({ tripFrom: event.target.value })}
                aria-invalid={errors.trip ? true : undefined}
                aria-describedby={describedBy('trip')}
              />
            </div>
            <div className={styles.field}>
              <label htmlFor="ca-whatif-trip-to">{t('ca.whatif.tripTo')}</label>
              <input
                id="ca-whatif-trip-to"
                type="date"
                value={knobs.tripTo}
                onChange={(event) => update({ tripTo: event.target.value })}
                aria-invalid={errors.trip ? true : undefined}
                aria-describedby={describedBy('trip')}
              />
            </div>
            {error('trip')}
          </fieldset>
        ))}
      {goals.includes('CA-CITIZENSHIP') && (
        <>
          {amount('citizenshipLevel', 'ca.whatif.citizenshipLevel')}
          <div className={styles.field}>
            <label htmlFor={ids.citizenshipTest}>
              {t('ca.whatif.citizenshipTest')}
            </label>
            <select
              id={ids.citizenshipTest}
              value={knobs.citizenshipTest ?? ''}
              onChange={(event) =>
                update({
                  citizenshipTest:
                    (event.target.value as CanadaWhatIf['citizenshipTest']) ||
                    undefined,
                })
              }
            >
              <option value="">{t('form.unknown')}</option>
              {testOutcomes.map((outcome) => (
                <option key={outcome} value={outcome}>
                  {t(`ca.option.testOutcome.${outcome}`)}
                </option>
              ))}
            </select>
          </div>
        </>
      )}
      {express && (
        <>
          {amount('eeLanguage', 'ca.whatif.eeLanguage')}
          {afterDraft.answers.express?.round
            ? amount('crs', 'ca.whatif.crs')
            : missing(ids.crs, 'ca.whatif.crs', 'ca.whatif.crsNeedsRound')}
          {amount('eeFunds', 'ca.whatif.eeFunds')}
        </>
      )}
      {goals.includes('CA-AIP') && amount('aipFunds', 'ca.whatif.aipFunds')}
      {goals.includes('CA-QC-PSTQ') && (
        <>
          {amount('qcFunds', 'ca.whatif.qcFunds')}
          {amount('qcFrench', 'ca.whatif.qcFrench')}
        </>
      )}
      {goals.includes('CA-FAMILY') && amount('income', 'ca.whatif.income')}
    </>
  );
}
