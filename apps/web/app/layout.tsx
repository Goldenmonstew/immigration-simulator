import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import { t } from '../i18n';
import { LocaleProvider } from '../i18n/locale';
import { SiteShell } from '../components/site-shell';
import { ServiceWorker } from '../components/service-worker';
import { ErrorReporter } from '../components/error-reporter';
import styles from './site.module.css';

export const metadata: Metadata = {
  description: t('home.intro'),
  referrer: 'no-referrer',
  manifest: '/manifest.webmanifest',
  icons: { icon: '/icon.svg', apple: '/icon-192.png' },
  appleWebApp: { capable: true },
  other: { 'apple-mobile-web-app-capable': 'yes' },
};

export const viewport: Viewport = { themeColor: '#16324f' };

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="zh-CN">
      <body className={styles.body}>
        <ServiceWorker />
        <ErrorReporter />
        <LocaleProvider>
          <SiteShell>{children}</SiteShell>
        </LocaleProvider>
      </body>
    </html>
  );
}
