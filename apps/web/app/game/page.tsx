'use client';

import dynamic from 'next/dynamic';
import { useTranslation } from '../../i18n/locale';
import styles from './game.module.css';

const GameClient = dynamic(() => import('./game-client'), {
  ssr: false,
  loading: GameLoading,
});
function GameLoading() {
  const { t } = useTranslation();
  return <p role="status">{t('game.loading')}</p>;
}
export default function GamePage() {
  return (
    <main id="main" className={styles.main}>
      <GameClient />
    </main>
  );
}
