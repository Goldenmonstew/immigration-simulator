'use client';

import { preload } from 'react-dom';
import { useGameText } from './game-ui';
import styles from '../uk/game/game.module.css';

// No game code here, so the page's static HTML already has the title and
// town banner (the largest paint) before the game scripts arrive.
export function WelcomeIntro({
  country,
  banner,
}: {
  country: string;
  banner: string;
}) {
  const { t, locale } = useGameText(country);
  preload(banner, { as: 'image', fetchPriority: 'high' });
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
        style={{ backgroundImage: `url("${banner}")` }}
        aria-hidden="true"
      />
    </div>
  );
}

export function WelcomeLoading({
  country,
  banner,
}: {
  country: string;
  banner: string;
}) {
  const { t } = useGameText(country);
  return (
    <section className={styles.welcome}>
      <WelcomeIntro country={country} banner={banner} />
      <p role="status">{t('game.loading')}</p>
    </section>
  );
}
