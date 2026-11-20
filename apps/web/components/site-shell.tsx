'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';
import type { ReactNode } from 'react';
import { useTranslation } from '../i18n/locale';
import { buildVersion } from '../lib/report';
import styles from '../app/site.module.css';
import game from '../app/game/game.module.css';

export function SiteShell({ children }: { children: ReactNode }) {
  const { t, locale, setLocale } = useTranslation();
  const pathname = usePathname();
  const isGame = pathname === '/game' || pathname === '/game/';
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
      <a className={styles.skip} href="#main">
        {t('site.skip')}
      </a>
      <header className={isGame ? game.siteHeader : styles.header}>
        <div className={isGame ? game.siteHeaderInner : styles.headerInner}>
          <Link href="/">
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
          </Link>
          {!isGame && (
            <nav
              className={styles.navigation}
              aria-label={t('site.navigation')}
            >
              <Link href="/policy">{t('site.policy')}</Link>
              <Link href="/about">{t('site.about')}</Link>
            </nav>
          )}
          <div
            className={isGame ? game.languages : styles.languages}
            role="group"
            aria-label={t('site.language')}
          >
            <button
              type="button"
              lang="zh-CN"
              aria-pressed={locale === 'zh-CN'}
              aria-label={t('site.chinese')}
              onClick={() => setLocale('zh-CN')}
            >
              <span className={styles.fullLabel}>{t('site.chinese')}</span>
              <span className={styles.compactLabel}>
                {t('site.chineseShort')}
              </span>
            </button>
            <button
              type="button"
              lang="en"
              aria-pressed={locale === 'en'}
              aria-label="English"
              onClick={() => setLocale('en')}
            >
              <span className={styles.fullLabel}>English</span>
              <span className={styles.compactLabel}>EN</span>
            </button>
          </div>
        </div>
      </header>
      {children}
      <footer className={`${styles.footer} ${isGame ? game.siteFooter : ''}`}>
        <p>{t('site.footer')}</p>
        <p className={styles.footerLinks}>
          <Link href="/policy">{t('site.policy')}</Link>
          <Link href="/about">{t('site.about')}</Link>
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
