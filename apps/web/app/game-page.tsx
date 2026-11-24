'use client';

import dynamic from 'next/dynamic';
import { gameAsset, gameArt, type GameCountryId } from '../lib/game-country';
import styles from './uk/game/game.module.css';
import { WelcomeLoading } from './game-shell/welcome';

const gameClients = {
  uk: dynamic(() => import('./uk/game/game-client'), {
    ssr: false,
    loading: () => <GameLoading country="uk" />,
  }),
} satisfies Record<GameCountryId, React.ComponentType>;

function GameLoading({ country }: { country: GameCountryId }) {
  return (
    <div className={styles.game}>
      <WelcomeLoading
        country={country}
        banner={gameAsset(country, `${gameArt[country].town}/town-banner.png`)}
      />
    </div>
  );
}

export function CountryGamePage({ country }: { country: GameCountryId }) {
  const GameClient = gameClients[country];
  return (
    <main id="main" className={styles.main}>
      <GameClient />
    </main>
  );
}
