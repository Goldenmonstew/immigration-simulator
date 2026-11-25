'use client';

import Link from 'next/link';
import { PolicyStatus } from '../../components/policy-status';
import { SavedScenarios } from '../../components/saved-scenarios';
import { useTranslation } from '../../i18n/locale';
import { spainModule } from '../../lib/spain-module';
import { countryPath } from '../../lib/site-countries';
import styles from '../site.module.css';

export default function SpainContent() {
  const { t } = useTranslation();
  const { policy } = spainModule;
  return (
    <main id="main" className={styles.main}>
      <PolicyStatus
        country={spainModule}
        asOf={policy.parameters[policy.displayedRuleSets[0].id].asOf}
      />
      <div className={styles.narrow}>
        <h1>{t('es.title')}</h1>
        <p className={styles.lead}>{t('es.intro')}</p>
        <details className={styles.scope}>
          <summary>{t('home.scopeTitle')}</summary>
          <p>{t('es.scope')}</p>
        </details>
        <div className={styles.actions}>
          <Link className={styles.button} href={countryPath('es', 'simulate')}>
            {t('home.start')}
          </Link>
          <Link href={countryPath('es', 'policy')}>{t('site.policy')}</Link>
        </div>
        <section className={styles.section}>
          <h2>{t('home.before')}</h2>
          <p>{t('es.prepare')}</p>
          <p className={styles.notice}>{t('es.privacy')}</p>
        </section>
        <SavedScenarios country={spainModule} />
        <section className={styles.section}>
          <h2>{t('home.disclaimerTitle')}</h2>
          <p>{t('home.disclaimer')}</p>
        </section>
      </div>
    </main>
  );
}
