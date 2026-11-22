import type { Metadata } from 'next';
import { t } from '../../i18n';
import SpainContent from './spain-content';

export const metadata: Metadata = {
  description: t('es.intro'),
  openGraph: {
    title: t('es.title'),
    description: t('es.intro'),
    type: 'website',
  },
};

export default function Page() {
  return <SpainContent />;
}
