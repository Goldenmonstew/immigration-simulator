'use client';

import type { TranslationKey } from '../../../i18n';
import { useTranslation } from '../../../i18n/locale';
import type { NzDraft } from '../../../lib/new-zealand-draft';
import {
  has,
  lastTripIndex,
  nzFocusControls as ids,
  type NzWhatIf,
} from '../../../lib/new-zealand-whatif';
import type { WhatIfControlsProps } from '../../../lib/whatif';
import styles from '../../uk/whatif/whatif.module.css';

const citizenshipEnglish = [
  'evidenced',
  'waived',
  'interview',
  'waiver-requested',
  'insufficient',
];

export function NzWhatIfControls({
  afterDraft,
  knobs,
  update,
  errors,
}: WhatIfControlsProps<NzDraft, NzWhatIf>) {
  const { t } = useTranslation();
  const error = (key: string) =>
    errors[key] && (
      <p
        id={`${ids[key as keyof typeof ids]}-error`}
        role="alert"
        className={styles.error}
      >
        {t(errors[key])}
      </p>
    );
  const described = (key: keyof typeof ids, hint?: boolean) =>
    [hint && `${ids[key]}-hint`, errors[key] && `${ids[key]}-error`]
      .filter(Boolean)
      .join(' ') || undefined;
  const amount = (
    key: 'english' | 'pay' | 'partner' | 'invested',
    knob: 'englishScore' | 'hourlyPay' | 'partnerMonths' | 'invested',
    label: TranslationKey,
    hint?: TranslationKey,
  ) => (
    <div className={styles.field}>
      <label htmlFor={ids[key]}>{t(label)}</label>
      {hint && <p id={`${ids[key]}-hint`}>{t(hint)}</p>}
      <input
        id={ids[key]}
        type="number"
        min="0"
        step="any"
        value={knobs[knob] ?? ''}
        onChange={(event) => {
          // Empty or partly typed numbers have no value yet.
          const value = event.target.valueAsNumber;
          update({ [knob]: Number.isNaN(value) ? undefined : value });
        }}
        aria-invalid={errors[key] ? true : undefined}
        aria-describedby={described(key, !!hint)}
      />
      {error(key)}
    </div>
  );
  const resident = has(afterDraft, 'travel', 'prv', 'citizenship');
  return (
    <>
      <div className={styles.field}>
        <label htmlFor={ids.date}>{t('nz.whatif.date')}</label>
        <p id={`${ids.date}-hint`}>{t('nz.whatif.dateHint')}</p>
        <input
          id={ids.date}
          type="date"
          value={knobs.date}
          onChange={(event) => update({ date: event.target.value })}
          aria-invalid={errors.date ? true : undefined}
          aria-describedby={described('date', true)}
        />
        {error('date')}
      </div>
      {resident && (
        <label className={styles.checkbox}>
          <input
            id={ids.trips}
            type="checkbox"
            checked={knobs.noTrips}
            onChange={(event) => update({ noTrips: event.target.checked })}
          />
          {t('nz.whatif.noTrips')}
        </label>
      )}
      {resident && !knobs.noTrips && lastTripIndex(afterDraft) >= 0 && (
        <div className={styles.field}>
          <label htmlFor={ids.lastReturn}>{t('nz.whatif.lastReturn')}</label>
          <input
            id={ids.lastReturn}
            type="date"
            value={knobs.lastReturn ?? ''}
            onChange={(event) =>
              update({ lastReturn: event.target.value || undefined })
            }
            aria-invalid={errors.lastReturn ? true : undefined}
            aria-describedby={described('lastReturn')}
          />
          {error('lastReturn')}
        </div>
      )}
      {has(afterDraft, 'citizenship') && (
        <div className={styles.field}>
          <label htmlFor={ids.citizenshipEnglish}>
            {t('nz.f.citizenshipEnglish')}
          </label>
          <select
            id={ids.citizenshipEnglish}
            value={knobs.citizenshipEnglish ?? ''}
            onChange={(event) =>
              update({ citizenshipEnglish: event.target.value || undefined })
            }
          >
            <option value="">{t('nz.form.unknown')}</option>
            {citizenshipEnglish.map((option) => (
              <option key={option} value={option}>
                {t(`nz.o.citizenEnglish.${option}` as TranslationKey)}
              </option>
            ))}
          </select>
        </div>
      )}
      {has(afterDraft, 'smc', 'green', 'sector') && (
        <>
          {amount(
            'english',
            'englishScore',
            'nz.whatif.englishScore',
            'nz.whatif.englishHint',
          )}
          {amount('pay', 'hourlyPay', 'nz.f.hourlyPay')}
        </>
      )}
      {has(afterDraft, 'partner') &&
        amount('partner', 'partnerMonths', 'nz.f.monthsTogetherAfterBothAdult')}
      {has(afterDraft, 'investor') &&
        afterDraft.answers.family?.investment?.route === 'active' &&
        amount('invested', 'invested', 'nz.f.totalInvested')}
    </>
  );
}
