'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';
import type { ReactNode } from 'react';
import { useTranslation } from '../i18n/locale';
import {
  countryPath,
  siteCountries,
  sitePagePaths,
} from '../lib/site-countries';
import { buildVersion } from '../lib/report';
import styles from '../app/site.module.css';
import game from '../app/uk/game/game.module.css';
import { asset } from '../lib/asset';

function focusMain() {
  const main = document.getElementById('main');
  if (!main) return;
  main.tabIndex = -1;
  main.focus({ preventScroll: true });
  main.scrollIntoView({ block: 'start' });
}

export function SiteShell({ children }: { children: ReactNode }) {
  const { t, locale, setLocale } = useTranslation();
  const pathname = usePathname();
  const cleanPath = (pathname ?? '/').replace(/\/+$/, '') || '/';
  const isGame = cleanPath === '/game' || cleanPath.endsWith('/game');
  const isJapanScenario = ['result', 'simulate', 'whatif'].some(
    (page) => cleanPath === countryPath('jp', page),
  );
  const firstSegment = cleanPath.split('/')[1] ?? '';
  const currentCountry = siteCountries.find(
    (country) => country.slug === firstSegment,
  );
  const policyPage = countryPath(currentCountry?.id ?? 'uk', 'policy');
  const policyLink = sitePagePaths.includes(policyPage)
    ? policyPage
    : countryPath('uk', 'policy');
  const languages = [
    ['zh-CN', t('site.chinese'), t('site.chineseShort')],
    ['en', 'English', 'EN'],
  ] as const;
  useEffect(() => {
    let details: [HTMLDetailsElement, boolean][] | undefined;
    const beforePrint = () => {
      if (details) return;
      details = Array.from(document.querySelectorAll('details'), (element) => [
        element,
        element.open,
      ]);
      details.forEach(([element]) => {
        element.open = true;
      });
    };
    const afterPrint = () => {
      details?.forEach(([element, open]) => {
        element.open = open;
      });
      details = undefined;
    };
    window.addEventListener('beforeprint', beforePrint);
    window.addEventListener('afterprint', afterPrint);
    return () => {
      afterPrint();
      window.removeEventListener('beforeprint', beforePrint);
      window.removeEventListener('afterprint', afterPrint);
    };
  }, []);
  return (
    <div className={isGame ? game.theme : styles.shell}>
      <title>{t('site.name')}</title>
      {isJapanScenario ? (
        <button type="button" className={styles.skip} onClick={focusMain}>
          {t('site.skip')}
        </button>
      ) : (
        <a className={styles.skip} href="#main">
          {t('site.skip')}
        </a>
      )}
      <header className={isGame ? game.siteHeader : styles.header}>
        <div className={isGame ? game.siteHeaderInner : styles.headerInner}>
          <a
            href={asset(isGame ? countryPath(currentCountry?.id ?? 'uk') : '/')}
          >
            {isGame ? (
              t('game.returnSimulator')
            ) : (
              <>
                <span className={styles.fullLabel}>{t('site.name')}</span>
                <span className={styles.compactLabel}>
                  {t('site.shortName')}
                </span>
              </>
            )}
          </a>
          {!isGame && (
            <nav
              className={styles.navigation}
              aria-label={t('site.navigation')}
            >
              {cleanPath !== '/' && (
                <Link href="/">{t('site.allCountries')}</Link>
              )}
              <Link href={policyLink}>{t('site.policy')}</Link>
              <Link href={countryPath('uk', 'about')}>{t('site.about')}</Link>
            </nav>
          )}
          <div
            className={isGame ? game.languages : styles.languages}
            role="group"
            aria-label={t('site.language')}
          >
            {languages.map(([language, full, short]) => (
              <button
                key={language}
                type="button"
                lang={language}
                aria-pressed={locale === language}
                onClick={() => setLocale(language)}
              >
                <span className={styles.fullLabel}>{full}</span>{' '}
                <span
                  className={styles.compactLabel}
                  aria-hidden={full.toLowerCase().includes(short.toLowerCase())}
                >
                  {short}
                </span>
              </button>
            ))}
          </div>
        </div>
      </header>
      {children}
      <footer className={`${styles.footer} ${isGame ? game.siteFooter : ''}`}>
        <p>{t('site.footer')}</p>
        <p className={styles.footerLinks}>
          <Link href={policyLink}>{t('site.policy')}</Link>
          <Link href={countryPath('uk', 'about')}>{t('site.about')}</Link>
          <a
            href="https://github.com/Goldenmonstew/uk-immigration-simulator/issues/new?template=feedback.md"
            target="_blank"
            rel="noreferrer"
          >
            {t('site.feedback')}
          </a>
          <span>{t('site.version').replace('{version}', buildVersion)}</span>
        </p>
      </footer>
    </div>
  );
}
