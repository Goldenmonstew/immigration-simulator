'use client';

import { countryPath } from '../../../lib/site-countries';
import { steps } from '../../../lib/questionnaire';
import site from '../../site.module.css';
import styles from '../../simulate/form.module.css';
import { useFormKit } from './form-kit';
import { BasicStep } from './steps/basic';
import { ScreeningStep } from './steps/screening';
import { EpisodesStep } from './steps/episodes';
import { AbsencesStep } from './steps/absences';
import { IncomeStep } from './steps/income';
import { BenefitsStep } from './steps/benefits';
import { RelationshipsStep } from './steps/relationships';
import { EnglishStep } from './steps/english';
import { DateStep } from './steps/date';
import { PrincipalStep } from './steps/principal';
import { asset } from '../../../lib/asset';

export default function SimulatePage() {
  const form = useFormKit();
  const {
    t,
    draft,
    dispatch,
    ready,
    storageAvailable,
    errors,
    setErrors,
    heading,
    active,
    editingPrincipal,
    sequence,
    position,
    goTo,
    submit,
  } = form;
  return (
    <main id="main" className={site.main}>
      <div className={site.narrow}>
        {!ready ? (
          <p role="status">{t('result.loading')}</p>
        ) : (
          <>
            {editingPrincipal && (
              <aside className={site.notice} aria-label={t('principal.banner')}>
                <strong>{t('principal.banner')}</strong>
                <p>
                  {t('principal.sharedDate')}{' '}
                  <time>{draft.simulationDate}</time>
                </p>
                <button
                  type="button"
                  className={site.secondary}
                  onClick={() => {
                    setErrors({});
                    dispatch({ type: 'principal-return' });
                  }}
                >
                  {t('principal.return')}
                </button>
              </aside>
            )}
            <p id="form-progress-label" className={styles.progress}>
              {t('form.step')} {position + 1} {t('form.of')} {sequence.length} —{' '}
              {t('form.title')}
            </p>
            <div
              className={styles.stepProgress}
              role="progressbar"
              aria-labelledby="form-progress-label"
              aria-valuemin={0}
              aria-valuemax={sequence.length}
              aria-valuenow={position + 1}
            >
              <span
                style={{
                  width: `${((position + 1) / sequence.length) * 100}%`,
                }}
              />
            </div>
            <h1 ref={heading} tabIndex={-1}>
              {t(`step.${steps[active.step]}`)}
            </h1>
            <p
              className={
                storageAvailable
                  ? styles.saved
                  : `${site.notice} ${site.warning}`
              }
              role="status"
            >
              {t(storageAvailable ? 'form.saved' : 'form.storageUnavailable')}
            </p>
            <form onSubmit={submit} noValidate autoComplete="off">
              {Object.keys(errors).length > 0 && (
                <div role="alert" className={styles.errorSummary}>
                  <p>{t('form.fixErrors')}</p>
                </div>
              )}

              {active.step === 0 && <BasicStep form={form} />}

              {active.step === 1 && <ScreeningStep form={form} />}

              {active.step === 2 && <EpisodesStep form={form} />}

              {active.step === 9 && <PrincipalStep form={form} />}

              {active.step === 3 && <AbsencesStep form={form} />}

              {active.step === 4 && <IncomeStep form={form} />}

              {active.step === 5 && <BenefitsStep form={form} />}

              {active.step === 6 && <RelationshipsStep form={form} />}

              {active.step === 7 && <EnglishStep form={form} />}

              {active.step === 8 && <DateStep form={form} />}

              <div className={site.actions}>
                <button type="submit" className={site.button}>
                  {t(
                    position === sequence.length - 1
                      ? editingPrincipal
                        ? 'principal.finish'
                        : 'form.results'
                      : 'form.continue',
                  )}
                </button>
                {position > 0 ? (
                  <button
                    type="button"
                    className={site.secondary}
                    onClick={() => goTo(sequence[position - 1])}
                  >
                    {t('form.back')}
                  </button>
                ) : (
                  <a href={asset(countryPath('uk'))}>{t('site.home')}</a>
                )}
              </div>
            </form>
          </>
        )}
      </div>
    </main>
  );
}
