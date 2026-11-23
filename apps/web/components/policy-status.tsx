'use client';

import type { RuleSet } from '@uk-immigration/engine';
import { useTranslation } from '../i18n/locale';
import type { CountryPolicy } from '../lib/policy';
import styles from '../app/site.module.css';

export function RuleSetStatus({ ruleSet }: { ruleSet: RuleSet }) {
  const { t } = useTranslation();
  return ruleSet.status === 'IN_FORCE_FUTURE_VERSION'
    ? t('policy.IN_FORCE_FUTURE_VERSION.effectiveFrom').replace(
        '{date}',
        ruleSet.effectiveFrom,
      )
    : t(`policy.${ruleSet.status}`);
}

export function PolicyStatus({
  country,
  asOf,
}: {
  country: { policy: CountryPolicy };
  asOf: string;
}) {
  const { t } = useTranslation();
  return (
    <section className={styles.policy} aria-label={t('policy.asOf')}>
      <p>
        {t('policy.asOf')} <time dateTime={asOf}>{asOf}</time>
      </p>
      <div className={styles.badges}>
        {country.policy.displayedRuleSets.map((ruleSet) => (
          <span
            key={ruleSet.id}
            className={`${styles.badge} ${ruleSet.kind === 'ANNOUNCED' ? styles.announced : ''}`}
          >
            <RuleSetStatus ruleSet={ruleSet} />
          </span>
        ))}
      </div>
    </section>
  );
}
