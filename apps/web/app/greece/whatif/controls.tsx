'use client';

import type { TranslationKey } from '../../../i18n';
import { useTranslation } from '../../../i18n/locale';
import { has, type GreeceDraft } from '../../../lib/greece-draft';
import {
  greeceFocusControls as ids,
  greekLevels,
  type GreekLevel,
  type GreeceWhatIf,
} from '../../../lib/greece-whatif';
import type { WhatIfControlsProps } from '../../../lib/whatif';
import styles from '../../uk/whatif/whatif.module.css';

type Amount =
  'netEur' | 'grossAnnualEur' | 'sponsorPersonalNetEur' | 'qualifyingValueEur';

export function GreeceWhatIfControls({
  afterDraft,
  knobs,
  update,
  errors,
}: WhatIfControlsProps<GreeceDraft, GreeceWhatIf>) {
  const { t } = useTranslation();
  const error = (field: string) =>
    errors[field] && (
      <p id={`${field}-error`} role="alert" className={styles.error}>
        {t(errors[field])}
      </p>
    );
  const amount = (key: Amount, id: string, label: TranslationKey) => (
    <div className={styles.field}>
      <label htmlFor={id}>{t(label)}</label>
      <input
        id={id}
        type="number"
        min="0"
        step="any"
        value={knobs[key] ?? ''}
        onChange={(e) =>
          update({
            [key]: e.target.value === '' ? undefined : Number(e.target.value),
          })
        }
        aria-invalid={errors[key] ? true : undefined}
        aria-describedby={errors[key] ? `${key}-error` : undefined}
      />
      {error(key)}
    </div>
  );
  const settlement = has(afterDraft, 'GR-LONG-TERM', 'GR-TEN-YEAR');
  return (
    <>
      <div className={styles.field}>
        <label htmlFor={ids.date}>{t('gr.whatif.date')}</label>
        <input
          id={ids.date}
          type="date"
          value={knobs.simulationDate}
          onChange={(e) => update({ simulationDate: e.target.value })}
          aria-invalid={errors.date ? true : undefined}
          aria-describedby={errors.date ? 'date-error' : undefined}
        />
        {error('date')}
      </div>
      <label className={styles.checkbox}>
        <input
          id={ids.trips}
          type="checkbox"
          checked={knobs.noTrips}
          onChange={(e) => update({ noTrips: e.target.checked })}
        />
        {t('gr.whatif.noTrips')}
      </label>
      {settlement && (
        <div className={styles.field}>
          <label htmlFor={ids.language}>{t('gr.whatif.language')}</label>
          <select
            id={ids.language}
            value={knobs.greekLevel ?? ''}
            onChange={(e) =>
              update({
                greekLevel: (e.target.value || undefined) as
                  GreekLevel | undefined,
              })
            }
          >
            <option value="">{t('gr.form.unknown')}</option>
            {greekLevels.map((level) => (
              <option key={level} value={level}>
                {t(`gr.option.${level}`)}
              </option>
            ))}
          </select>
        </div>
      )}
      {settlement && amount('netEur', ids.income, 'gr.whatif.income')}
      {has(afterDraft, 'GR-NATIONALITY') && (
        <div className={styles.field}>
          <label htmlFor={ids.exam}>{t('gr.whatif.exam')}</label>
          <select
            id={ids.exam}
            value={
              knobs.examPassed === undefined ? '' : String(knobs.examPassed)
            }
            onChange={(e) =>
              update({
                examPassed:
                  e.target.value === '' ? undefined : e.target.value === 'true',
              })
            }
          >
            <option value="">{t('gr.form.unknown')}</option>
            <option value="true">{t('gr.option.certificate')}</option>
            <option value="false">{t('gr.option.not-passed')}</option>
          </select>
        </div>
      )}
      {has(afterDraft, 'GR-WORK') &&
        amount('grossAnnualEur', ids.salary, 'gr.whatif.salary')}
      {has(afterDraft, 'GR-FAMILY-TCN') &&
        amount(
          'sponsorPersonalNetEur',
          ids.sponsorIncome,
          'gr.whatif.sponsorIncome',
        )}
      {has(afterDraft, 'GR-GOLDEN-VISA') &&
        amount('qualifyingValueEur', ids.investment, 'gr.whatif.investment')}
    </>
  );
}
