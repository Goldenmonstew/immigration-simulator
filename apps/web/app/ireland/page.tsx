import type { Metadata } from 'next';
import { t } from '../../i18n';
import IrelandContent from './ireland-content';

export const metadata: Metadata = {
  description: t('ie.intro'),
  openGraph: {
    title: t('ie.title'),
    description: t('ie.intro'),
    type: 'website',
  },
};

export default function Page() {
  return <IrelandContent />;
}
