import type { Metadata } from 'next';
import { t } from '../../i18n';
import PortugalContent from './portugal-content';

export const metadata: Metadata = {
  description: t('pt.intro'),
  openGraph: {
    title: t('pt.title'),
    description: t('pt.intro'),
    type: 'website',
  },
};

export default function Page() {
  return <PortugalContent />;
}
