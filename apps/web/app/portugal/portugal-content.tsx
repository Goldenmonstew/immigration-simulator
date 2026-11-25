'use client';

import Link from 'next/link';
import { PolicyStatus } from '../../components/policy-status';
import { SavedScenarios } from '../../components/saved-scenarios';
import { useTranslation } from '../../i18n/locale';
import { gameArt, gameAsset } from '../../lib/game-country';
import { portugalModule } from '../../lib/portugal-module';
import { countryPath } from '../../lib/site-countries';
import styles from '../site.module.css';

export default function PortugalContent() {
  const { t } = useTranslation();
  const { policy } = portugalModule;
  return (
    <main id="main" className={styles.main}>
      <PolicyStatus
        country={portugalModule}
        asOf={policy.parameters[policy.displayedRuleSets[0].id].asOf}
      />
      <div className={styles.narrow}>
        <h1>{t('pt.title')}</h1>
        <p className={styles.lead}>{t('pt.intro')}</p>
        <details className={styles.scope}>
          <summary>{t('home.scopeTitle')}</summary>
          <p>{t('pt.scope')}</p>
        </details>
        <div className={styles.actions}>
          <Link className={styles.button} href={countryPath('pt', 'simulate')}>
            {t('home.start')}
          </Link>
          <Link href={countryPath('pt', 'policy')}>{t('site.policy')}</Link>
        </div>
        <Link className={styles.gameEntry} href={countryPath('pt', 'game')}>
          <span
            className={styles.gameBanner}
            style={{
              backgroundImage: `url("${gameAsset('pt', gameArt.pt.banner)}")`,
            }}
            aria-hidden="true"
          />
          <span className={styles.gameEntryTitle}>{t('pt.game.entry')}</span>
          <span className={styles.gameEntryDesc}>{t('pt.game.entryDesc')}</span>
        </Link>
        <section className={styles.section}>
          <h2>{t('home.before')}</h2>
          <p>{t('pt.prepare')}</p>
          <p className={styles.notice}>{t('pt.privacy')}</p>
        </section>
        <SavedScenarios country={portugalModule} />
        <section className={styles.section}>
          <h2>{t('home.disclaimerTitle')}</h2>
          <p>{t('home.disclaimer')}</p>
        </section>
      </div>
    </main>
  );
}
