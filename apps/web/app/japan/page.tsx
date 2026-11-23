import type { Metadata } from 'next';
import { t } from '../../i18n';
import JapanContent from './japan-content';

export const metadata: Metadata = {
  description: t('jp.intro'),
  openGraph: {
    title: t('jp.title'),
    description: t('jp.intro'),
    type: 'website',
  },
};

export default function Page() {
  return <JapanContent />;
}
