'use client';

import Link from 'next/link';
import { PolicyStatus } from '../../components/policy-status';
import { SavedScenarios } from '../../components/saved-scenarios';
import { useTranslation } from '../../i18n/locale';
import { newZealandModule } from '../../lib/new-zealand-module';
import { countryPath } from '../../lib/site-countries';
import styles from '../site.module.css';

export default function NewZealandContent() {
  const { t } = useTranslation();
  const { policy } = newZealandModule;
  return (
    <main id="main" className={styles.main}>
      <PolicyStatus
        country={newZealandModule}
        asOf={policy.parameters[policy.displayedRuleSets[0].id].asOf}
      />
      <div className={styles.narrow}>
        <h1>{t('nz.title')}</h1>
        <p className={styles.lead}>{t('nz.intro')}</p>
        <details className={styles.scope}>
          <summary>{t('home.scopeTitle')}</summary>
          <p>{t('nz.scope')}</p>
        </details>
        <div className={styles.actions}>
          <Link className={styles.button} href={countryPath('nz', 'simulate')}>
            {t('home.start')}
          </Link>
          <Link href={countryPath('nz', 'policy')}>{t('site.policy')}</Link>
        </div>
        <section className={styles.section}>
          <h2>{t('home.before')}</h2>
          <p>{t('nz.prepare')}</p>
          <p className={styles.notice}>{t('nz.privacy')}</p>
        </section>
        <SavedScenarios country={newZealandModule} />
        <section className={styles.section}>
          <h2>{t('home.disclaimerTitle')}</h2>
          <p>{t('home.disclaimer')}</p>
        </section>
      </div>
    </main>
  );
}
