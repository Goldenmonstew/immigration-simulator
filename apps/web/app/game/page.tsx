'use client';

import dynamic from 'next/dynamic';
import styles from './game.module.css';
import { WelcomeLoading } from './welcome';

const GameClient = dynamic(() => import('./game-client'), {
  ssr: false,
  loading: GameLoading,
});
function GameLoading() {
  return (
    <div className={styles.game}>
      <WelcomeLoading />
    </div>
  );
}
export default function GamePage() {
  return (
    <main id="main" className={styles.main}>
      <GameClient />
    </main>
  );
}
