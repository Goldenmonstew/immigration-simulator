import type { Metadata } from 'next';
import { t } from '../../i18n';
import CanadaContent from './canada-content';

export const metadata: Metadata = {
  description: t('ca.intro'),
  openGraph: {
    title: t('ca.title'),
    description: t('ca.intro'),
    type: 'website',
  },
};

export default function Page() {
  return <CanadaContent />;
}
