import type { Metadata } from 'next';
import { t } from '../../i18n';
import GermanyContent from './germany-content';

export const metadata: Metadata = {
  description: t('de.intro'),
  openGraph: {
    title: t('de.title'),
    description: t('de.intro'),
    type: 'website',
  },
};

export default function Page() {
  return <GermanyContent />;
}
