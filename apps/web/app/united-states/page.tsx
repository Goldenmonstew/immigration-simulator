import type { Metadata } from 'next';
import { t } from '../../i18n';
import UnitedStatesContent from './united-states-content';

export const metadata: Metadata = {
  description: t('us.intro'),
  openGraph: {
    title: t('us.title'),
    description: t('us.intro'),
    type: 'website',
  },
};

export default function Page() {
  return <UnitedStatesContent />;
}
