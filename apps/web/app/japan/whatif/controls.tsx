'use client';

import { useTranslation } from '../../../i18n/locale';
import type { TranslationKey } from '../../../i18n';
import type { JapanDraft } from '../../../lib/japan-draft';
import {
  japanFocusControls as ids,
  type JapanWhatIf,
} from '../../../lib/japan-whatif';
import type { WhatIfControlsProps } from '../../../lib/whatif';
import styles from '../../uk/whatif/whatif.module.css';

export function JapanWhatIfControls({
  afterDraft,
  knobs,
  update,
  errors,
}: WhatIfControlsProps<JapanDraft, JapanWhatIf>) {
  const { t } = useTranslation();
  function choice(
    field:
      | 'prJapaneseB1'
      | 'prHousehold'
      | 'natJapanese'
      | 'natLivelihood'
      | 'interview',
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
        <label htmlFor={ids.date}>{t('jp.whatif.date')}</label>
        <input
          id={ids.date}
          type="date"
          value={knobs.applicationDate}
          onChange={(e) => update({ applicationDate: e.target.value })}
          aria-invalid={!!errors.date}
          aria-describedby={errors.date ? 'date-error' : undefined}
        />
        {error('date')}
      </div>
      {!!afterDraft.permanentResidence.routes.length && (
        <>
          {choice('prJapaneseB1', ids.prJapanese, 'jp.whatif.prJapanese')}
          <div className={styles.field}>
            <label htmlFor={ids.income}>{t('jp.whatif.prIncome')}</label>
            <input
              id={ids.income}
              type="number"
              min="0"
              step="1"
              value={knobs.prIncome ?? ''}
              onChange={(e) =>
                update({
                  prIncome: e.target.value ? e.target.valueAsNumber : undefined,
                })
              }
              aria-invalid={!!errors.income}
              aria-describedby={errors.income ? 'income-error' : undefined}
            />
            {error('income')}
          </div>
          {choice('prHousehold', ids.household, 'jp.whatif.prHousehold')}
        </>
      )}
      {!!afterDraft.naturalisation.routes.length && (
        <>
          {choice('natJapanese', ids.natJapanese, 'jp.whatif.natJapanese')}
          {choice('interview', ids.interview, 'jp.whatif.interview')}
          {choice('natLivelihood', ids.livelihood, 'jp.whatif.natLivelihood')}
        </>
      )}
      {(!!afterDraft.permanentResidence.routes.length ||
        !!afterDraft.naturalisation.routes.length) && (
        <label className={styles.checkbox}>
          <input
            id={ids.trips}
            type="checkbox"
            checked={knobs.noTrips}
            onChange={(e) => update({ noTrips: e.target.checked })}
          />
          {t('jp.whatif.noTrips')}
        </label>
      )}
      {afterDraft.reentry.map(({ route }) => (
        <div className={styles.field} key={route}>
          <label htmlFor={ids[route]}>{t(`jp.whatif.return.${route}`)}</label>
          <input
            type="date"
            id={ids[route]}
            value={knobs.returns[route] ?? ''}
            onChange={(e) =>
              update({ returns: { ...knobs.returns, [route]: e.target.value } })
            }
            aria-invalid={!!errors[route]}
            aria-describedby={errors[route] ? `${route}-error` : undefined}
          />
          {error(route)}
        </div>
      ))}
    </>
  );
}
