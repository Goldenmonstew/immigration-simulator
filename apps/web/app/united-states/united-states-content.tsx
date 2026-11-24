'use client';

import Link from 'next/link';
import { PolicyStatus } from '../../components/policy-status';
import { SavedScenarios } from '../../components/saved-scenarios';
import { useTranslation } from '../../i18n/locale';
import { gameArt, gameAsset } from '../../lib/game-country';
import { countryPath } from '../../lib/site-countries';
import { unitedStatesModule } from '../../lib/united-states-module';
import styles from '../site.module.css';

export default function UnitedStatesContent() {
  const { t } = useTranslation();
  const { policy } = unitedStatesModule;
  return (
    <main id="main" className={styles.main}>
      <PolicyStatus
        country={unitedStatesModule}
        asOf={policy.parameters[policy.displayedRuleSets[0].id].asOf}
      />
      <div className={styles.narrow}>
        <h1>{t('us.title')}</h1>
        <p className={styles.lead}>{t('us.intro')}</p>
        <details className={styles.scope}>
          <summary>{t('home.scopeTitle')}</summary>
          <p>{t('us.scope')}</p>
          <p>{t('us.outOfScope')}</p>
        </details>
        <div className={styles.actions}>
          <Link className={styles.button} href={countryPath('us', 'simulate')}>
            {t('home.start')}
          </Link>
          <Link href={countryPath('us', 'policy')}>{t('site.policy')}</Link>
        </div>
        <Link className={styles.gameEntry} href={countryPath('us', 'game')}>
          <span
            className={styles.gameBanner}
            style={{
              backgroundImage: `url("${gameAsset('us', gameArt.us.banner)}")`,
            }}
            aria-hidden="true"
          />
          <span className={styles.gameEntryTitle}>{t('us.game.entry')}</span>
          <span className={styles.gameEntryDesc}>{t('us.game.entryDesc')}</span>
        </Link>
        <section className={styles.section}>
          <h2>{t('home.before')}</h2>
          <p>{t('us.prepare')}</p>
          <p className={styles.notice}>{t('us.privacy')}</p>
        </section>
        <SavedScenarios country={unitedStatesModule} />
        <section className={styles.section}>
          <h2>{t('home.disclaimerTitle')}</h2>
          <p>{t('home.disclaimer')}</p>
        </section>
      </div>
    </main>
  );
}
