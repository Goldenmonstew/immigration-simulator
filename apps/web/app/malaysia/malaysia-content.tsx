'use client';

import Link from 'next/link';
import { PolicyStatus } from '../../components/policy-status';
import { SavedScenarios } from '../../components/saved-scenarios';
import { useTranslation } from '../../i18n/locale';
import { malaysiaModule } from '../../lib/malaysia-module';
import { countryPath } from '../../lib/site-countries';
import styles from '../site.module.css';

export default function MalaysiaContent() {
  const { t } = useTranslation();
  const { policy } = malaysiaModule;
  return (
    <main id="main" className={styles.main}>
      <PolicyStatus
        country={malaysiaModule}
        asOf={policy.parameters[policy.displayedRuleSets[0].id].asOf}
      />
      <div className={styles.narrow}>
        <h1>{t('my.title')}</h1>
        <p className={styles.lead}>{t('my.intro')}</p>
        <details className={styles.scope}>
          <summary>{t('home.scopeTitle')}</summary>
          <p>{t('my.scope')}</p>
        </details>
        <div className={styles.actions}>
          <Link className={styles.button} href={countryPath('my', 'simulate')}>
            {t('home.start')}
          </Link>
          <Link href={countryPath('my', 'policy')}>{t('site.policy')}</Link>
        </div>
        <section className={styles.section}>
          <h2>{t('home.before')}</h2>
          <p>{t('my.prepare')}</p>
          <p className={styles.notice}>{t('my.privacy')}</p>
        </section>
        <SavedScenarios country={malaysiaModule} />
        <section className={styles.section}>
          <h2>{t('home.disclaimerTitle')}</h2>
          <p>{t('home.disclaimer')}</p>
        </section>
      </div>
    </main>
  );
}
