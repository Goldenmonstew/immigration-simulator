'use client';

import {
  type CefrLevel,
  earnedSettlement2026_11,
} from '@uk-immigration/policy-data';
import { withCount } from '../../../i18n';
import { useTranslation } from '../../../i18n/locale';
import { punct } from '../../../i18n/punctuation';
import {
  type Draft,
  type Errors,
  validateStep,
  visibleIncomeYears,
} from '../../../lib/questionnaire';
import type { CountryWhatIf, WhatIfControlsProps } from '../../../lib/whatif';
import {
  type WhatIf,
  focusControls,
  focusForRule,
  initialWhatIf,
  applyWhatIf,
  tripDays,
  validTrip,
} from '../../../lib/uk-whatif';
import site from '../../site.module.css';
import styles from './whatif.module.css';

const incomePresets = [
  earnedSettlement2026_11.values.earningsThresholdMinimum.value,
  earnedSettlement2026_11.values.earningsThreshold5Year.value,
  earnedSettlement2026_11.values.earningsThreshold3Year.value,
];
const maxIncome =
  earnedSettlement2026_11.values.earningsThreshold3Year.value * 2;
const money = (amount: number) => `£${amount.toLocaleString('en-GB')}`;

export function UkWhatIfControls({
  afterDraft,
  knobs: whatIf,
  errors,
  update,
}: WhatIfControlsProps<Draft, WhatIf>) {
  const { t, locale } = useTranslation();
  const p = punct(locale);
  const { simulationDate: dateError, earnings: incomeError } = errors;
  return (
    <>
      <div className={styles.field}>
        <label htmlFor="whatif-date">{t('whatif.date')}</label>
        <input
          id="whatif-date"
          type="date"
          value={whatIf.simulationDate}
          aria-invalid={!!dateError}
          aria-describedby={dateError ? 'whatif-date-error' : undefined}
          onChange={(event) => update({ simulationDate: event.target.value })}
        />
        {dateError && (
          <p id="whatif-date-error" role="alert" className={styles.error}>
            {t(dateError)}
          </p>
        )}
      </div>
      <fieldset className={styles.income}>
        <legend>{t('whatif.income')}</legend>
        <label className={styles.checkbox}>
          <input
            type="checkbox"
            checked={whatIf.incomeEnabled}
            onChange={(event) =>
              update({ incomeEnabled: event.target.checked })
            }
          />
          {t('whatif.enableIncome')}
        </label>
        <p className={styles.hint}>{t('whatif.incomeHint')}</p>
        <div className={styles.field}>
          <label htmlFor="whatif-years">{t('whatif.incomeYears')}</label>
          <select
            id="whatif-years"
            disabled={!whatIf.incomeEnabled}
            value={whatIf.incomeYears}
            onChange={(event) =>
              update({ incomeYears: Number(event.target.value) })
            }
          >
            {Array.from({ length: 7 }, (_, i) => i + 1).map((years) => (
              <option key={years} value={years}>
                {years}
              </option>
            ))}
          </select>
        </div>
        <div className={styles.field}>
          <label htmlFor="whatif-earnings">{t('whatif.earnings')}</label>
          <input
            id="whatif-earnings"
            type="number"
            min="0"
            step="any"
            disabled={!whatIf.incomeEnabled}
            value={whatIf.earnings ?? ''}
            aria-invalid={!!incomeError}
            aria-describedby={incomeError ? 'whatif-income-error' : undefined}
            onChange={(event) =>
              update({
                earnings:
                  event.target.value === ''
                    ? undefined
                    : event.target.valueAsNumber,
              })
            }
          />
          <label htmlFor="whatif-income-slider">
            {t('whatif.incomeSlider')}
          </label>
          <input
            id="whatif-income-slider"
            type="range"
            min="0"
            max={maxIncome}
            step="500"
            disabled={!whatIf.incomeEnabled}
            value={whatIf.earnings ?? 0}
            onChange={(event) =>
              update({ earnings: event.target.valueAsNumber })
            }
          />
          {incomeError && (
            <p id="whatif-income-error" role="alert" className={styles.error}>
              {t(incomeError)}
            </p>
          )}
        </div>
        <div className={styles.presets}>
          {incomePresets.map((amount) => (
            <button
              key={amount}
              type="button"
              className={site.secondary}
              onClick={() => update({ incomeEnabled: true, earnings: amount })}
            >
              {money(amount)}
            </button>
          ))}
        </div>
        <p className={styles.hint}>
          {t('date.incomeWindow')}
          {p.colon}
          {visibleIncomeYears(afterDraft)
            .map((row) => row.taxYear)
            .join(p.list)}
        </p>
      </fieldset>
      <div className={styles.field}>
        <label htmlFor="whatif-english">{t('english.level')}</label>
        <select
          id="whatif-english"
          value={
            whatIf.english
              ? 'exempt' in whatIf.english
                ? 'exempt'
                : whatIf.english.cefrLevel
              : ''
          }
          onChange={(event) =>
            update({
              english:
                event.target.value === ''
                  ? undefined
                  : event.target.value === 'exempt'
                    ? { exempt: true }
                    : { cefrLevel: event.target.value as CefrLevel },
            })
          }
        >
          <option value="">{t('form.unknown')}</option>
          {['A1', 'A2', 'B1', 'B2', 'C1', 'C2'].map((level) => (
            <option key={level} value={level}>
              {level}
            </option>
          ))}
          <option value="exempt">{t('english.exempt')}</option>
        </select>
      </div>
      <div className={styles.field}>
        <label htmlFor="whatif-life">{t('english.life')}</label>
        <select
          id="whatif-life"
          value={
            whatIf.lifeInTheUk
              ? 'passed' in whatIf.lifeInTheUk
                ? 'passed'
                : 'exempt'
              : ''
          }
          onChange={(event) =>
            update({
              lifeInTheUk:
                event.target.value === ''
                  ? undefined
                  : event.target.value === 'passed'
                    ? { passed: true }
                    : { exempt: true },
            })
          }
        >
          <option value="">{t('form.unknown')}</option>
          <option value="passed">{t('english.passed')}</option>
          <option value="exempt">{t('english.exempt')}</option>
        </select>
      </div>
      <label className={styles.checkbox}>
        <input
          type="checkbox"
          checked={whatIf.noPublicFunds}
          id="whatif-public-funds"
          onChange={(event) => update({ noPublicFunds: event.target.checked })}
        />
        {t('whatif.noPublicFunds')}
      </label>
      <label className={styles.checkbox}>
        <input
          type="checkbox"
          checked={whatIf.noAbsences}
          onChange={(event) => update({ noAbsences: event.target.checked })}
        />
        {t('whatif.noAbsences')}
      </label>
      <label className={styles.checkbox}>
        <input
          type="checkbox"
          checked={!!whatIf.trip}
          onChange={(event) =>
            update({
              // Start empty: the trip counts only once both dates are set.
              trip: event.target.checked ? { from: '', to: '' } : undefined,
            })
          }
        />
        {t('whatif.trip')}
      </label>
      {whatIf.trip && (
        <div className={styles.tripFields}>
          <div className={styles.field}>
            <label htmlFor="whatif-trip-from">{t('whatif.tripFrom')}</label>
            <input
              id="whatif-trip-from"
              type="date"
              value={whatIf.trip.from}
              onChange={(event) =>
                update({
                  trip: { ...whatIf.trip!, from: event.target.value },
                })
              }
            />
          </div>
          <div className={styles.field}>
            <label htmlFor="whatif-trip-to">{t('whatif.tripTo')}</label>
            <input
              id="whatif-trip-to"
              type="date"
              value={whatIf.trip.to}
              onChange={(event) =>
                update({
                  trip: { ...whatIf.trip!, to: event.target.value },
                })
              }
            />
          </div>
          <p className={site.muted} role="status">
            {!whatIf.trip.from || !whatIf.trip.to
              ? t('whatif.tripIncomplete')
              : !validTrip(whatIf.trip)
                ? t('whatif.tripInvalid')
                : withCount(
                    t('whatif.tripDays'),
                    'days',
                    tripDays(whatIf.trip),
                  )}
          </p>
        </div>
      )}
    </>
  );
}
export const ukWhatIf: CountryWhatIf<Draft, WhatIf> = {
  focusControls,
  focusForRule,
  initial: initialWhatIf,
  apply: applyWhatIf,
  validate(afterDraft, controls) {
    const errors: Errors = {};
    const dateError = validateStep({ ...afterDraft, step: 8 }).simulationDate;
    if (dateError) errors.simulationDate = dateError;
    if (
      controls.incomeEnabled &&
      (controls.earnings === undefined ||
        !Number.isFinite(controls.earnings) ||
        controls.earnings < 0)
    )
      errors.earnings = 'error.number';
    return errors;
  },
  Controls: UkWhatIfControls,
};
