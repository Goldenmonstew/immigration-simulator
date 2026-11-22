'use client';

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { useTranslation } from '../i18n/locale';
import { issueUrl, reportError } from '../lib/report';
import styles from './site.module.css';
import { asset } from '../lib/asset';

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const { t } = useTranslation();
  // After a deploy the old page's lazily loaded files are gone and only a fresh
  // page load finds the new ones. Other errors keep reset(), which keeps
  // in-memory state such as a draft that storage refused.
  const retry =
    error.name === 'ChunkLoadError' ? () => window.location.reload() : reset;
  const pathname = usePathname();
  useEffect(() => {
    reportError('boundary', error, error.digest ?? '');
  }, [error]);
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
          <button type="button" className={styles.button} onClick={retry}>
            {t('error.retry')}
          </button>
          <a className={styles.secondary} href={asset('/')}>
            {t('error.home')}
          </a>
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
