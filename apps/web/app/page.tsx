import type { Metadata } from 'next';
import { t } from '../i18n';
import HubContent from './hub-content';

export const metadata: Metadata = {
  description: t('hub.intro'),
  openGraph: {
    title: t('site.name'),
    description: t('hub.intro'),
    type: 'website',
  },
};

export default function Page() {
  return <HubContent />;
}
