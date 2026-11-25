'use client';

import type { TranslationKey } from '../../../i18n';
import { useTranslation } from '../../../i18n/locale';
import { has, type GreeceDraft } from '../../../lib/greece-draft';
import {
  asAnswered,
  greeceFocusControls as ids,
  greekLevels,
  salaryYearPublished,
  type GreekLevel,
  type GreeceWhatIf,
} from '../../../lib/greece-whatif';
import type { WhatIfControlsProps } from '../../../lib/whatif';
import styles from '../../uk/whatif/whatif.module.css';

type Amount =
  | 'netEur'
  | 'grossAnnualEur'
  | 'grossPayEur'
  | 'sponsorPersonalNetEur'
  | 'qualifyingValueEur';

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
  const describedBy = (...items: (string | false | undefined)[]) =>
    items.filter(Boolean).join(' ') || undefined;
  const amount = (
    key: Amount,
    id: string,
    label: TranslationKey,
    hint?: TranslationKey,
  ) => (
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
        aria-describedby={describedBy(
          hint && `${id}-hint`,
          errors[key] && `${key}-error`,
        )}
      />
      {hint && (
        <p id={`${id}-hint`} className={styles.hint}>
          {t(hint)}
        </p>
      )}
      {error(key)}
    </div>
  );
  // The "as answered" option keeps a questionnaire answer the select cannot show.
  const answeredOption = (shown: boolean) =>
    shown && <option value={asAnswered}>{t('gr.whatif.asAnswered')}</option>;
  const settlement = has(afterDraft, 'GR-LONG-TERM', 'GR-TEN-YEAR');
  const work = afterDraft.work;
  const family = afterDraft.familyTcn;
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
          aria-describedby={describedBy(
            knobs.answered.familyYears && `${ids.date}-hint`,
            knobs.answered.blueCardYears && `${ids.date}-blue-card-hint`,
            errors.date && 'date-error',
          )}
        />
        {knobs.answered.familyYears && (
          <p id={`${ids.date}-hint`} className={styles.hint}>
            {t('gr.whatif.yearCounts')}
          </p>
        )}
        {knobs.answered.blueCardYears && (
          <p id={`${ids.date}-blue-card-hint`} className={styles.hint}>
            {t('gr.whatif.blueCardYears')}
          </p>
        )}
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
                  GreeceWhatIf['greekLevel'] | undefined,
              })
            }
          >
            {answeredOption(knobs.answered.language)}
            <option value="">{t('gr.form.unknown')}</option>
            {greekLevels.map((level: GreekLevel) => (
              <option key={level} value={level}>
                {t(`gr.option.${level}`)}
              </option>
            ))}
          </select>
        </div>
      )}
      {settlement &&
        amount(
          'netEur',
          ids.income,
          'gr.whatif.income',
          'gr.whatif.incomeYear',
        )}
      {has(afterDraft, 'GR-NATIONALITY') && (
        <div className={styles.field}>
          <label htmlFor={ids.exam}>{t('gr.whatif.exam')}</label>
          <select
            id={ids.exam}
            value={
              knobs.examPassed === undefined ? '' : String(knobs.examPassed)
            }
            onChange={(e) => {
              const value = e.target.value;
              update({
                examPassed:
                  value === ''
                    ? undefined
                    : value === asAnswered
                      ? asAnswered
                      : value === 'true',
              });
            }}
          >
            {answeredOption(knobs.answered.exam)}
            <option value="">{t('gr.form.unknown')}</option>
            <option value="true">{t('gr.option.certificate')}</option>
            <option value="false">{t('gr.option.not-passed')}</option>
          </select>
        </div>
      )}
      {has(afterDraft, 'GR-WORK') &&
        work?.permit === 'E1' &&
        salaryYearPublished(afterDraft.simulationDate) &&
        amount('grossAnnualEur', ids.salary, 'gr.whatif.salary')}
      {has(afterDraft, 'GR-WORK') &&
        work?.permit === 'E4' &&
        work.stage !== 'renewal' &&
        amount(
          'grossPayEur',
          ids.pay,
          work.payBasis === 'daily'
            ? 'gr.whatif.payDaily'
            : work.payBasis === 'monthly'
              ? 'gr.whatif.payMonthly'
              : 'gr.whatif.payBasisMissing',
        )}
      {has(afterDraft, 'GR-FAMILY-TCN') &&
        // FT-02 reads the income on first grant and the evidence on renewal.
        (family?.stage === 'renewal' ? (
          <div className={styles.field}>
            <label htmlFor={ids.sponsor}>
              {t('gr.whatif.sponsorEvidence')}
            </label>
            <select
              id={ids.sponsor}
              value={
                knobs.sponsorEvidence === undefined
                  ? ''
                  : String(knobs.sponsorEvidence)
              }
              onChange={(e) =>
                update({
                  sponsorEvidence:
                    e.target.value === ''
                      ? undefined
                      : e.target.value === 'true',
                })
              }
            >
              <option value="">{t('gr.form.unknown')}</option>
              <option value="true">{t('gr.form.yes')}</option>
              <option value="false">{t('gr.form.no')}</option>
            </select>
          </div>
        ) : (
          amount(
            'sponsorPersonalNetEur',
            ids.sponsor,
            'gr.whatif.sponsorIncome',
          )
        ))}
      {has(afterDraft, 'GR-GOLDEN-VISA') &&
        amount('qualifyingValueEur', ids.investment, 'gr.whatif.investment')}
    </>
  );
}
