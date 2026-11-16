'use client';

import { useTranslation } from '../../i18n/locale';
import { characters, newGame, type GameState } from '@uk-immigration/game';
import { withGameLocale } from './session';
import { portraitPath, townBanner } from './art';
import styles from './game.module.css';
import { localText } from './game-ui';

export function CharacterSelect({
  saves,
  onChange,
}: {
  saves: Record<string, GameState | undefined>;
  onChange: (state: GameState) => void;
}) {
  const { t, locale } = useTranslation();
  return (
    <section className={styles.welcome}>
      <div className={styles.welcomeIntro}>
        <div>
          <h1>{t('game.title')}</h1>
          {locale === 'zh-CN' && (
            <p className={styles.subtitle} lang="en">
              Immigration Life
            </p>
          )}
          <p className={styles.lead}>{t('game.intro')}</p>
        </div>
        <div
          className={styles.townBanner}
          style={{ backgroundImage: `url("${townBanner}")` }}
          aria-hidden="true"
        />
      </div>
      <h2>{t('game.chooseCharacter')}</h2>
      <div className={styles.characters}>
        {characters.map((character) => (
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
                {saves[character.id] && (
                  <button
                    className={styles.button}
                    onClick={() =>
                      onChange(withGameLocale(saves[character.id]!, locale))
                    }
                  >
                    {t('game.continue')}
                  </button>
                )}
                <button
                  className={
                    saves[character.id] ? styles.secondary : styles.button
                  }
                  onClick={() =>
                    onChange(
                      newGame(character.id, Date.now() % 2 ** 31, locale),
                    )
                  }
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
}
