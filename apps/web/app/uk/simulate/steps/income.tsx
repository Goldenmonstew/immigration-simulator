'use client';

import { PARAMETERS } from '@uk-immigration/policy-data';
import { visibleIncomeYears } from '../../../../lib/questionnaire';
import styles from '../../../simulate/form.module.css';
import type { FormKit } from '../form-kit';
import { Field } from '../../../simulate/field';

export function IncomeStep({ form }: { form: FormKit }) {
  const {
    t,
    errors,
    setErrors,
    active,
    timeline,
    familyPartnerFiveYear,
    update,
    fieldProps,
    amount,
  } = form;
  return (
    <>
      <p>{t('income.hint')}</p>
      <p className={styles.hint}>{t('income.taxYearHint')}</p>
      <p className={styles.hint}>
        {t('income.simulationDate').replace('{date}', active.simulationDate)}
      </p>
      <p className={styles.hint}>{t('income.partnerHint')}</p>
      {familyPartnerFiveYear && (
        <Field
          id="cash-savings"
          label={t('income.cashSavings')}
          hint={t('income.cashSavingsHint').replace(
            '{base}',
            PARAMETERS[
              'current-law-2026-11'
            ].values.familyPartnerSavingsBase.value.toLocaleString('en-GB'),
          )}
          error={errors['cash-savings']}
        >
          <input
            {...fieldProps('cash-savings', true)}
            type="number"
            inputMode="numeric"
            min="0"
            step="1"
            defaultValue={timeline.cashSavings ?? ''}
            onChange={(event) => {
              const value = amount(event.target.value);
              const valid =
                !event.target.validity.badInput &&
                (value === undefined ||
                  (Number.isInteger(value) && value >= 0));
              setErrors((previous) => {
                const next = { ...previous };
                if (valid) delete next['cash-savings'];
                else next['cash-savings'] = 'error.savings';
                return next;
              });
              update({ cashSavings: valid ? value : undefined });
            }}
          />
        </Field>
      )}
      {visibleIncomeYears(active).map((row, index, rows) => (
        <fieldset className={styles.incomeRow} key={row.taxYear}>
          <legend>{row.taxYear}</legend>
          {index > 0 && (
            <button
              type="button"
              className={styles.copyRow}
              onClick={() =>
                update({
                  incomeYears: timeline.incomeYears.map((year) =>
                    year.taxYear === row.taxYear
                      ? {
                          ...year,
                          earnings: rows[index - 1].earnings,
                          partnerEarnings: rows[index - 1].partnerEarnings,
                        }
                      : year,
                  ),
                })
              }
            >
              {t('income.copyAbove').replace('{year}', rows[index - 1].taxYear)}
            </button>
          )}
          <div className={styles.incomeFields}>
            {(['earnings', 'partnerEarnings'] as const).map((key) => {
              const suffix = key === 'earnings' ? 'earnings' : 'partner';
              const id = `${row.taxYear}-${suffix}`;
              return (
                <Field
                  key={key}
                  id={id}
                  label={t(`income.${suffix}`)}
                  error={errors[id]}
                >
                  <input
                    {...fieldProps(id)}
                    type="number"
                    inputMode="decimal"
                    min="0"
                    step="any"
                    value={row[key] ?? ''}
                    onChange={(event) =>
                      update({
                        incomeYears: timeline.incomeYears.map((year) =>
                          year.taxYear === row.taxYear
                            ? {
                                ...year,
                                [key]: amount(event.target.value),
                              }
                            : year,
                        ),
                      })
                    }
                  />
                </Field>
              );
            })}
          </div>
        </fieldset>
      ))}
    </>
  );
}
