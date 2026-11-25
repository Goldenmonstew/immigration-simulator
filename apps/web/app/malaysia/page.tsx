import type { Metadata } from 'next';
import { t } from '../../i18n';
import MalaysiaContent from './malaysia-content';

export const metadata: Metadata = {
  description: t('my.intro'),
  openGraph: {
    title: t('my.title'),
    description: t('my.intro'),
    type: 'website',
  },
};

export default function Page() {
  return <MalaysiaContent />;
}
