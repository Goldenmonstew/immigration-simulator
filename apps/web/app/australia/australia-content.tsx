'use client';

import Link from 'next/link';
import { PolicyStatus } from '../../components/policy-status';
import { SavedScenarios } from '../../components/saved-scenarios';
import { useTranslation } from '../../i18n/locale';
import { australiaModule } from '../../lib/australia-module';
import { gameArt, gameAsset } from '../../lib/game-country';
import { countryPath } from '../../lib/site-countries';
import styles from '../site.module.css';

export default function AustraliaContent() {
  const { t } = useTranslation();
  const { policy } = australiaModule;
  return (
    <main id="main" className={styles.main}>
      <PolicyStatus
        country={australiaModule}
        asOf={policy.parameters[policy.displayedRuleSets[0].id].asOf}
      />
      <div className={styles.narrow}>
        <h1>{t('au.title')}</h1>
        <p className={styles.lead}>{t('au.intro')}</p>
        <details className={styles.scope}>
          <summary>{t('home.scopeTitle')}</summary>
          <p>{t('au.scope')}</p>
        </details>
        <div className={styles.actions}>
          <Link className={styles.button} href={countryPath('au', 'simulate')}>
            {t('home.start')}
          </Link>
          <Link href={countryPath('au', 'policy')}>{t('site.policy')}</Link>
        </div>
        <Link className={styles.gameEntry} href={countryPath('au', 'game')}>
          <span
            className={styles.gameBanner}
            style={{
              backgroundImage: `url("${gameAsset('au', gameArt.au.banner)}")`,
            }}
            aria-hidden="true"
          />
          <span className={styles.gameEntryTitle}>{t('au.game.entry')}</span>
          <span className={styles.gameEntryDesc}>{t('au.game.entryDesc')}</span>
        </Link>
        <section className={styles.section}>
          <h2>{t('home.before')}</h2>
          <p>{t('au.prepare')}</p>
          <p className={styles.notice}>{t('au.privacy')}</p>
        </section>
        <SavedScenarios country={australiaModule} />
        <section className={styles.section}>
          <h2>{t('home.disclaimerTitle')}</h2>
          <p>{t('home.disclaimer')}</p>
        </section>
      </div>
    </main>
  );
}
