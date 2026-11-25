'use client';

import Link from 'next/link';
import { PolicyStatus } from '../../components/policy-status';
import { SavedScenarios } from '../../components/saved-scenarios';
import { useTranslation } from '../../i18n/locale';
import { germanyModule } from '../../lib/germany-module';
import { countryPath } from '../../lib/site-countries';
import styles from '../site.module.css';

export default function GermanyContent() {
  const { t } = useTranslation();
  const { policy } = germanyModule;
  return (
    <main id="main" className={styles.main}>
      <PolicyStatus
        country={germanyModule}
        asOf={policy.parameters[policy.displayedRuleSets[0].id].asOf}
      />
      <div className={styles.narrow}>
        <h1>{t('de.title')}</h1>
        <p className={styles.lead}>{t('de.intro')}</p>
        <details className={styles.scope}>
          <summary>{t('home.scopeTitle')}</summary>
          <p>{t('de.scope')}</p>
        </details>
        <div className={styles.actions}>
          <Link className={styles.button} href={countryPath('de', 'simulate')}>
            {t('home.start')}
          </Link>
          <Link href={countryPath('de', 'policy')}>{t('site.policy')}</Link>
        </div>
        <section className={styles.section}>
          <h2>{t('home.before')}</h2>
          <p>{t('de.prepare')}</p>
          <p className={styles.notice}>{t('de.privacy')}</p>
        </section>
        <SavedScenarios country={germanyModule} />
        <section className={styles.section}>
          <h2>{t('home.disclaimerTitle')}</h2>
          <p>{t('home.disclaimer')}</p>
        </section>
      </div>
    </main>
  );
}
