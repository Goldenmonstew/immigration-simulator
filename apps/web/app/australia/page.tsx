import type { Metadata } from 'next';
import { t } from '../../i18n';
import AustraliaContent from './australia-content';

export const metadata: Metadata = {
  description: t('au.intro'),
  openGraph: {
    title: t('au.title'),
    description: t('au.intro'),
    type: 'website',
  },
};

export default function Page() {
  return <AustraliaContent />;
}
