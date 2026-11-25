'use client';

import Link from 'next/link';
import { PolicyStatus } from '../../components/policy-status';
import { SavedScenarios } from '../../components/saved-scenarios';
import { useTranslation } from '../../i18n/locale';
import { gameArt, gameAsset } from '../../lib/game-country';
import { greeceModule } from '../../lib/greece-module';
import { countryPath } from '../../lib/site-countries';
import styles from '../site.module.css';

export default function GreeceContent() {
  const { t } = useTranslation();
  const { policy } = greeceModule;
  return (
    <main id="main" className={styles.main}>
      <PolicyStatus
        country={greeceModule}
        asOf={policy.parameters[policy.displayedRuleSets[0].id].asOf}
      />
      <div className={styles.narrow}>
        <h1>{t('gr.title')}</h1>
        <p className={styles.lead}>{t('gr.intro')}</p>
        <details className={styles.scope}>
          <summary>{t('home.scopeTitle')}</summary>
          <p>{t('gr.scope')}</p>
        </details>
        <div className={styles.actions}>
          <Link className={styles.button} href={countryPath('gr', 'simulate')}>
            {t('home.start')}
          </Link>
          <Link href={countryPath('gr', 'policy')}>{t('site.policy')}</Link>
        </div>
        <Link className={styles.gameEntry} href={countryPath('gr', 'game')}>
          <span
            className={styles.gameBanner}
            style={{
              backgroundImage: `url("${gameAsset('gr', gameArt.gr.banner)}")`,
            }}
            aria-hidden="true"
          />
          <span className={styles.gameEntryTitle}>{t('gr.game.entry')}</span>
          <span className={styles.gameEntryDesc}>{t('gr.game.entryDesc')}</span>
        </Link>
        <section className={styles.section}>
          <h2>{t('home.before')}</h2>
          <p>{t('gr.prepare')}</p>
          <p className={styles.notice}>{t('gr.privacy')}</p>
        </section>
        <SavedScenarios country={greeceModule} />
        <section className={styles.section}>
          <h2>{t('home.disclaimerTitle')}</h2>
          <p>{t('home.disclaimer')}</p>
        </section>
      </div>
    </main>
  );
}
