'use client';

import Link from 'next/link';
import { PolicyStatus } from '../../components/policy-status';
import { SavedScenarios } from '../../components/saved-scenarios';
import { useTranslation } from '../../i18n/locale';
import { canadaModule } from '../../lib/canada-module';
import { gameArt, gameAsset } from '../../lib/game-country';
import { countryPath } from '../../lib/site-countries';
import styles from '../site.module.css';

export default function CanadaContent() {
  const { t } = useTranslation();
  const { policy } = canadaModule;
  return (
    <main id="main" className={styles.main}>
      <PolicyStatus
        country={canadaModule}
        asOf={policy.parameters[policy.displayedRuleSets[0].id].asOf}
      />
      <div className={styles.narrow}>
        <h1>{t('ca.title')}</h1>
        <p className={styles.lead}>{t('ca.intro')}</p>
        <details className={styles.scope}>
          <summary>{t('home.scopeTitle')}</summary>
          <p>{t('ca.scope')}</p>
        </details>
        <div className={styles.actions}>
          <Link className={styles.button} href={countryPath('ca', 'simulate')}>
            {t('home.start')}
          </Link>
          <Link href={countryPath('ca', 'policy')}>{t('site.policy')}</Link>
        </div>
        <Link className={styles.gameEntry} href={countryPath('ca', 'game')}>
          <span
            className={styles.gameBanner}
            style={{
              backgroundImage: `url("${gameAsset('ca', gameArt.ca.banner)}")`,
            }}
            aria-hidden="true"
          />
          <span className={styles.gameEntryTitle}>{t('ca.game.entry')}</span>
          <span className={styles.gameEntryDesc}>{t('ca.game.entryDesc')}</span>
        </Link>
        <section className={styles.section}>
          <h2>{t('home.before')}</h2>
          <p>{t('ca.prepare')}</p>
          <p className={styles.notice}>{t('ca.privacy')}</p>
        </section>
        <SavedScenarios country={canadaModule} />
        <section className={styles.section}>
          <h2>{t('home.disclaimerTitle')}</h2>
          <p>{t('home.disclaimer')}</p>
        </section>
      </div>
    </main>
  );
}
