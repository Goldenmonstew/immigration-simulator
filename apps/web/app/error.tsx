'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslation } from '../i18n/locale';
import { issueUrl } from '../lib/report';
import styles from './site.module.css';

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const { t } = useTranslation();
  const pathname = usePathname();
  const report = issueUrl(
    `[error] ${pathname}: ${error.message.slice(0, 80)}`,
    [
      `page: ${pathname}`,
      `error: ${error.message}`,
      ...(error.digest ? [`digest: ${error.digest}`] : []),
      `browser: ${typeof navigator === 'undefined' ? '' : navigator.userAgent}`,
    ],
  );
  return (
    <main id="main" className={styles.main}>
      <div className={styles.narrow}>
        <h1>{t('error.title')}</h1>
        <p>{t('error.body')}</p>
        <p className={styles.actions}>
          <button type="button" className={styles.button} onClick={reset}>
            {t('error.retry')}
          </button>
          <Link className={styles.secondary} href="/">
            {t('error.home')}
          </Link>
        </p>
        <p>
          <a href={report} target="_blank" rel="noreferrer">
            {t('error.report')}
          </a>
        </p>
        <p className={styles.muted}>{t('error.privacy')}</p>
      </div>
    </main>
  );
}
