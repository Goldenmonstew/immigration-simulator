'use client';

import Link from 'next/link';
import type { TranslationKey } from '../i18n';
import { useTranslation } from '../i18n/locale';
import { countryPath, siteCountries } from '../lib/site-countries';
import styles from './site.module.css';

const badgeKeys = [
  'hub.badge.rules',
  'hub.badge.whatif',
  'hub.badge.sources',
  'hub.badge.game',
  'hub.badge.local',
] as const;

export default function HubContent() {
  const { t, locale } = useTranslation();
  return (
    <main id="main" className={styles.main}>
      <div className={styles.hubHero}>
        <h1>{t('hub.title')}</h1>
        <p className={styles.lead}>{t('hub.intro')}</p>
        <ul className={styles.badges}>
          {badgeKeys.map((key) => (
            <li key={key} className={styles.badge}>
              {t(key)}
            </li>
          ))}
        </ul>
      </div>
      <section className={styles.countrySection} aria-labelledby="hub-countries">
        <h2 id="hub-countries">{t('hub.countriesTitle')}</h2>
        <div className={styles.countryGrid}>
          {siteCountries.map(({ id, nameKey, hasGame }) => {
            const name = t(nameKey);
            const code = t(`hub.${id}.code` as TranslationKey);
            const paths = t(`hub.${id}.paths` as TranslationKey).split(' · ');
            const desc = t(`hub.${id}.desc` as TranslationKey);
            return (
              <article
                key={id}
                className={styles.countryCard}
                aria-labelledby={`country-${id}`}
              >
                <div className={styles.countryCardHeader}>
                  <span className={styles.countryCode} aria-hidden="true">
                    {code}
                  </span>
                  <h3 id={`country-${id}`}>{name}</h3>
                </div>
                <ul className={styles.countryPaths}>
                  {paths.map((path) => (
                    <li key={path}>{path}</li>
                  ))}
                </ul>
                <p className={styles.countryDesc}>{desc}</p>
                <div className={styles.countryActions}>
                  <Link
                    className={styles.button}
                    href={countryPath(id)}
                    aria-label={t('hub.calculateAria').replace(
                      '{country}',
                      name,
                    )}
                  >
                    {t('hub.calculate')}
                  </Link>
                  {hasGame && (
                    <Link
                      className={styles.gameButton}
                      href={countryPath(id, 'game')}
                      aria-label={t('hub.playGameAria').replace(
                        '{country}',
                        name,
                      )}
                    >
                      {t('hub.playGame')}
                    </Link>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </section>
      <div className={styles.narrow}>
        <section className={styles.section} aria-labelledby="hub-before">
          <h2 id="hub-before">{t('hub.beforeTitle')}</h2>
          <p>{t('hub.prepare')}</p>
          <p className={styles.notice}>{t('hub.privacy')}</p>
        </section>
        <section className={styles.section} aria-labelledby="hub-disclaimer">
          <h2 id="hub-disclaimer">{t('hub.disclaimerTitle')}</h2>
          <p>
            {t('hub.disclaimer')}{' '}
            <Link href={countryPath('uk', 'about')}>{t('about.link')}</Link>
          </p>
          {locale === 'zh-CN' && (
            <p lang="en" className={styles.muted}>
              {t('hub.disclaimerEnglish')}
            </p>
          )}
        </section>
      </div>
    </main>
  );
}
