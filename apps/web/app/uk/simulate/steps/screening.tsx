'use client';

import { breachTypeNames } from '@uk-immigration/policy-data';
import type { ImmigrationBreach } from '@uk-immigration/engine';
import { screeningKeys } from '../../../../lib/questionnaire';
import site from '../../../site.module.css';
import styles from '../../../simulate/form.module.css';
import type { FormKit } from '../form-kit';
import { Field } from '../../../simulate/field';

export function ScreeningStep({ form }: { form: FormKit }) {
  const {
    t,
    locale,
    errors,
    active,
    timeline,
    update,
    fieldProps,
    screen,
    updateBreach,
    dateField,
    remove,
  } = form;
  return (
    <>
      <p>{t('screening.hint')}</p>
      {screeningKeys.map((key) => (
        <fieldset
          key={key}
          className={`${styles.fieldset} ${errors[key] ? styles.invalid : ''}`}
          aria-describedby={`${key}-hint ${errors[key] ? `${key}-error` : ''}`}
        >
          <legend className={styles.legend}>{t(`screening.${key}`)}</legend>
          <p id={`${key}-hint`} className={styles.hint}>
            {key === 'breach' ? t('screening.breachHint') : null}
          </p>
          {errors[key] && (
            <p id={`${key}-error`} className={styles.error}>
              {t(errors[key])}
            </p>
          )}
          <div className={styles.radios}>
            {(['yes', 'no'] as const).map((answer, index) => (
              <label key={answer}>
                <input
                  id={index === 0 ? key : `${key}-no`}
                  type="radio"
                  name={key}
                  value={answer}
                  checked={active.screening[key] === answer}
                  aria-invalid={errors[key] ? true : undefined}
                  onChange={() => screen(key, answer)}
                />
                {t(`form.${answer}`)}
              </label>
            ))}
          </div>
        </fieldset>
      ))}
      {active.screening.breach === 'yes' && (
        <section aria-labelledby="breaches-heading">
          <h2 id="breaches-heading">{t('breaches.title')}</h2>
          {timeline.immigrationBreaches.map((breach, index) => (
            <fieldset key={index} className={styles.entry}>
              <legend>
                {t('breaches.item')} {index + 1}
              </legend>
              <Field id={`breach-${index}-type`} label={t('breaches.type')}>
                <select
                  id={`breach-${index}-type`}
                  value={breach.type}
                  onChange={(event) =>
                    updateBreach(index, {
                      type: event.target.value as ImmigrationBreach['type'],
                      article31: undefined,
                    })
                  }
                >
                  {Object.entries(breachTypeNames).map(([type, name]) => (
                    <option key={type} value={type}>
                      {name[locale]}
                    </option>
                  ))}
                </select>
              </Field>
              {dateField(
                `breach-${index}-date`,
                t('breaches.date'),
                breach.date,
                (date) => updateBreach(index, { date }),
                true,
              )}
              {breach.type === 'ILLEGAL_ENTRY' && (
                <Field
                  id={`breach-${index}-article31`}
                  label={t('breaches.article31')}
                >
                  <select
                    id={`breach-${index}-article31`}
                    value={
                      breach.article31 === undefined
                        ? ''
                        : breach.article31
                          ? 'yes'
                          : 'no'
                    }
                    onChange={(event) =>
                      updateBreach(index, {
                        article31:
                          event.target.value === ''
                            ? undefined
                            : event.target.value === 'yes',
                      })
                    }
                  >
                    <option value="">{t('form.unknown')}</option>
                    <option value="yes">{t('form.yes')}</option>
                    <option value="no">{t('form.no')}</option>
                  </select>
                </Field>
              )}
              {remove(`${t('breaches.item')} ${index + 1}`, () =>
                update({
                  immigrationBreaches: timeline.immigrationBreaches.filter(
                    (_, i) => i !== index,
                  ),
                }),
              )}
            </fieldset>
          ))}
          {errors.breaches && (
            <p id="breaches-error" className={styles.error}>
              {t(errors.breaches)}
            </p>
          )}
          <button
            {...fieldProps('breaches')}
            type="button"
            className={site.secondary}
            onClick={() =>
              update({
                immigrationBreaches: [
                  ...timeline.immigrationBreaches,
                  { type: 'OVERSTAYING', date: '' },
                ],
              })
            }
          >
            {t('breaches.add')}
          </button>
        </section>
      )}
    </>
  );
}
