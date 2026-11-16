'use client';

import {
  asylumSupportRepaymentNames,
  publicFundsBenefits,
  ROUTE_GROUPS,
} from '@uk-immigration/policy-data';
import type { PersonTimeline } from '@uk-immigration/engine';
import site from '../../site.module.css';
import styles from '../form.module.css';
import type { FormKit } from '../form-kit';
import { Field } from '../field';

export function BenefitsStep({ form }: { form: FormKit }) {
  const {
    t,
    locale,
    timeline,
    familyPartnerFiveYear,
    protectionMain,
    update,
    dateField,
    remove,
  } = form;
  return (
    <>
      <p>{t('benefits.hint')}</p>
      {familyPartnerFiveYear && (
        <div className={styles.checkboxes}>
          <label>
            <input
              id="partner-specified-benefit"
              type="checkbox"
              checked={timeline.partnerSpecifiedBenefit === true}
              onChange={(event) =>
                update({
                  partnerSpecifiedBenefit: event.target.checked
                    ? true
                    : undefined,
                })
              }
            />
            <span>{t('benefits.partnerSpecifiedBenefit')}</span>
          </label>
        </div>
      )}
      {!timeline.benefits.length && (
        <p className={site.muted}>{t('benefits.empty')}</p>
      )}
      {timeline.benefits.map((benefit, index) => (
        <fieldset key={index} className={styles.entry}>
          <legend>
            {t('benefits.item')} {index + 1}
          </legend>
          <Field id={`benefit-${index}-type`} label={t('benefits.type')}>
            <select
              id={`benefit-${index}-type`}
              value={benefit.benefitType}
              onChange={(event) =>
                update({
                  benefits: timeline.benefits.map((row, i) =>
                    i === index
                      ? { ...row, benefitType: event.target.value }
                      : row,
                  ),
                })
              }
            >
              {(['publicFunds', 'notPublicFunds'] as const).map((group) => (
                <optgroup key={group} label={t(`benefits.${group}`)}>
                  {publicFundsBenefits[group].map(({ benefitType, name }) => (
                    <option key={benefitType} value={benefitType}>
                      {name}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </Field>
          {dateField(
            `benefit-${index}-from`,
            t('benefits.from'),
            benefit.from,
            (from) =>
              update({
                benefits: timeline.benefits.map((row, i) =>
                  i === index ? { ...row, from } : row,
                ),
              }),
          )}
          {dateField(
            `benefit-${index}-to`,
            t('benefits.to'),
            benefit.to ?? '',
            (to) =>
              update({
                benefits: timeline.benefits.map((row, i) =>
                  i === index ? { ...row, to: to || undefined } : row,
                ),
              }),
          )}
          {remove(`${t('benefits.item')} ${index + 1}`, () =>
            update({
              benefits: timeline.benefits.filter((_, i) => i !== index),
            }),
          )}
        </fieldset>
      ))}
      <button
        type="button"
        className={site.secondary}
        onClick={() =>
          update({
            benefits: [
              ...timeline.benefits,
              { benefitType: 'UNIVERSAL_CREDIT', from: '' },
            ],
          })
        }
      >
        {t('benefits.add')}
      </button>
      {timeline.episodes.some((episode) =>
        ROUTE_GROUPS[episode.route].some((group) => group === 'PROTECTION'),
      ) && (
        <div className={styles.followUp}>
          <Field
            id="asylum-support"
            label={t('benefits.asylumSupportRepayment')}
          >
            <select
              id="asylum-support"
              value={timeline.asylumSupportRepayment ?? ''}
              onChange={(event) =>
                update({
                  asylumSupportRepayment: (event.target.value ||
                    undefined) as PersonTimeline['asylumSupportRepayment'],
                })
              }
            >
              <option value="">{t('form.unknown')}</option>
              {Object.entries(asylumSupportRepaymentNames).map(
                ([value, name]) => (
                  <option key={value} value={value}>
                    {name[locale]}
                  </option>
                ),
              )}
            </select>
          </Field>
        </div>
      )}
      {protectionMain && (
        <div className={`${styles.followUp} ${styles.checkboxes}`}>
          <label>
            <input
              id="protection-status-revoked"
              type="checkbox"
              checked={timeline.protectionStatusRevoked === true}
              onChange={(event) =>
                update({
                  protectionStatusRevoked: event.target.checked
                    ? true
                    : undefined,
                })
              }
            />
            <span>{t('benefits.protectionStatusRevoked')}</span>
          </label>
        </div>
      )}
    </>
  );
}
