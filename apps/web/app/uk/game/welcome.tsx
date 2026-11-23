'use client';

import { preload } from 'react-dom';
import { useTranslation } from '../../../i18n/locale';
import { townBanner } from './art';
import styles from './game.module.css';

// No game code here, so the page's static HTML already has the title and
// town banner (the largest paint) before the game scripts arrive.
export function WelcomeIntro() {
  const { t, locale } = useTranslation();
  preload(townBanner, { as: 'image', fetchPriority: 'high' });
  return (
    <div className={styles.welcomeIntro}>
      <div>
        <h1>{t('game.title')}</h1>
        {locale === 'zh-CN' && (
          <p className={styles.subtitle} lang="en">
            Immigration Life
          </p>
        )}
        <p className={styles.lead}>{t('game.intro')}</p>
      </div>
      <div
        className={styles.townBanner}
        style={{ backgroundImage: `url("${townBanner}")` }}
        aria-hidden="true"
      />
    </div>
  );
}

export function WelcomeLoading() {
  const { t } = useTranslation();
  return (
    <section className={styles.welcome}>
      <WelcomeIntro />
      <p role="status">{t('game.loading')}</p>
    </section>
  );
}
