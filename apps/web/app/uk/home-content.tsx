'use client';

import Link from 'next/link';
import { PolicyStatus } from '../../components/policy-status';
import { SavedScenarios } from '../../components/saved-scenarios';
import { useTranslation } from '../../i18n/locale';
import { ukModule } from '../../lib/uk-module';
import { policyAsOf } from '../../lib/uk-policy';
import { countryPath } from '../../lib/site-countries';
import { townBanner } from './game/art';
import styles from '../site.module.css';

export default function Home() {
  const { t, locale } = useTranslation();
  return (
    <main id="main" className={styles.main}>
      <PolicyStatus country={ukModule} asOf={policyAsOf} />
      <div className={styles.homeHero}>
        <div className={styles.narrow}>
          <h1>{t('home.title')}</h1>
          <p className={styles.lead}>{t('home.intro')}</p>
          <details className={styles.scope}>
            <summary>{t('home.scopeTitle')}</summary>
            <p>{t('home.scope')}</p>
          </details>
          <div className={`${styles.actions} ${styles.homeActions}`}>
            <Link
              className={styles.button}
              href={countryPath('uk', 'simulate')}
            >
              {t('home.start')}
            </Link>
          </div>
        </div>
        <Link className={styles.gameEntry} href={countryPath('uk', 'game')}>
          <span
            className={styles.gameBanner}
            style={{ backgroundImage: `url("${townBanner}")` }}
            aria-hidden="true"
          />
          <span className={styles.gameEntryTitle}>{t('game.entry')}</span>
          <span className={styles.gameEntryDesc}>{t('game.entryDesc')}</span>
        </Link>
      </div>
      <div className={styles.narrow}>
        <SavedScenarios country={ukModule} />
        <section className={styles.section}>
          <h2>{t('home.before')}</h2>
          <p>{t('home.prepare')}</p>
          <p className={styles.notice}>{t('home.privacy')}</p>
        </section>
        <section className={styles.section}>
          <h2>{t('home.disclaimerTitle')}</h2>
          <p>
            {t('home.disclaimer')}{' '}
            <Link href={countryPath('uk', 'about')}>{t('about.link')}</Link>
          </p>
          {locale === 'zh-CN' && (
            <p lang="en" className={styles.muted}>
              {t('home.disclaimerEnglish')}
            </p>
          )}
        </section>
      </div>
    </main>
  );
}
