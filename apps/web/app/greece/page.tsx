import type { Metadata } from 'next';
import { t } from '../../i18n';
import GreeceContent from './greece-content';

export const metadata: Metadata = {
  description: t('gr.intro'),
  openGraph: {
    title: t('gr.title'),
    description: t('gr.intro'),
    type: 'website',
  },
};

export default function Page() {
  return <GreeceContent />;
}
