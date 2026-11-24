'use client';

import Link from 'next/link';
import { PolicyStatus } from '../../components/policy-status';
import { SavedScenarios } from '../../components/saved-scenarios';
import { useTranslation } from '../../i18n/locale';
import { japanModule } from '../../lib/japan-module';
import { countryPath } from '../../lib/site-countries';
import styles from '../site.module.css';

export default function JapanContent() {
  const { t } = useTranslation();
  const { policy } = japanModule;
  return (
    <main id="main" className={styles.main}>
      <PolicyStatus
        country={japanModule}
        asOf={policy.parameters[policy.displayedRuleSets[0].id].asOf}
      />
      <div className={styles.narrow}>
        <h1>{t('jp.title')}</h1>
        <p className={styles.lead}>{t('jp.intro')}</p>
        <details className={styles.scope}>
          <summary>{t('home.scopeTitle')}</summary>
          <p>{t('jp.scope')}</p>
        </details>
        <div className={styles.actions}>
          <Link className={styles.button} href={countryPath('jp', 'simulate')}>
            {t('home.start')}
          </Link>
          <Link href={countryPath('jp', 'policy')}>{t('site.policy')}</Link>
        </div>
        <section className={styles.section}>
          <h2>{t('home.before')}</h2>
          <p>{t('jp.prepare')}</p>
          <p className={styles.notice}>{t('jp.privacy')}</p>
        </section>
        <SavedScenarios country={japanModule} />
        <section className={styles.section}>
          <h2>{t('home.disclaimerTitle')}</h2>
          <p>{t('home.disclaimer')}</p>
        </section>
      </div>
    </main>
  );
}
