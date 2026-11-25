'use client';

import type { createArt } from './art';
import type { GameSave } from './session';
import type { GameCountry, GameKinds, State } from './types';
import styles from '../uk/game/game.module.css';
import { localText, useGameText } from './game-ui';
import { WelcomeIntro } from './welcome';

export function createCharacterSelect<K extends GameKinds>(
  c: GameCountry<K>,
  {
    portraitPath,
    townBanner,
  }: Pick<ReturnType<typeof createArt>, 'portraitPath' | 'townBanner'>,
) {
  return function CharacterSelect({
    saves,
    onSelect,
  }: {
    saves: Record<string, GameSave<State<K>>>;
    onSelect: (id: string, action: 'new' | 'continue') => void;
  }) {
    const { t, locale } = useGameText(c.id);
    return (
      <section className={styles.welcome}>
        <WelcomeIntro country={c.id} banner={townBanner} />
        <h2>{t('game.chooseCharacter')}</h2>
        <div className={styles.characters}>
          {c.game.characters.map((character) => (
            <article key={character.id} className={styles.character}>
              <span className={styles.portraitFrame}>
                <span
                  className={styles.portrait}
                  style={{
                    backgroundImage: `url("${portraitPath(character.id)}")`,
                  }}
                  role="img"
                  aria-label={localText(character.name, locale)}
                />
              </span>
              <div className={styles.characterBody}>
                <h3>{localText(character.name, locale)}</h3>
                <p>{localText(character.intro, locale)}</p>
                <div className={styles.buttons}>
                  {saves[character.id]?.state && (
                    <button
                      className={styles.button}
                      onClick={() => onSelect(character.id, 'continue')}
                    >
                      {t('game.continue')}
                    </button>
                  )}
                  <button
                    className={
                      saves[character.id]?.state
                        ? styles.secondary
                        : styles.button
                    }
                    onClick={() => onSelect(character.id, 'new')}
                  >
                    {t('game.startAs').replace(
                      '{name}',
                      localText(character.name, locale),
                    )}
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    );
  };
}
