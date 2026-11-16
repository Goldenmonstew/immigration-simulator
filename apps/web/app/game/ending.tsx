'use client';

import Link from 'next/link';
import { AssessmentColumns } from '../../components/result-view';
import { useTranslation } from '../../i18n/locale';
import { encodeDraft } from '../../lib/share';
import {
  achievements,
  characters,
  narrative,
  newGame,
  type GameState,
} from '@uk-immigration/game';
import { gameDraft, endingMemories, itemIcon } from './session';
import { portraitPath } from './art';
import styles from './game.module.css';
import { localText } from './game-ui';

export function LifeMemories({ state }: { state: GameState }) {
  const { t, locale } = useTranslation();
  const { friends, furnishings, crops, dishes, flowerbed, photo } =
    endingMemories(state);
  if (
    !friends.length &&
    !furnishings.length &&
    !crops.length &&
    !dishes.length &&
    !flowerbed &&
    !photo
  )
    return null;
  return (
    <section aria-labelledby="life-memories-heading">
      <h2 id="life-memories-heading">{t('game.lifeMemories')}</h2>
      <div className={styles.memoryGrid}>
        {!!friends.length && (
          <article className={styles.memoryCard}>
            <h3>{t('game.memoryFriends')}</h3>
            <ul>
              {friends.map((npc) => (
                <li key={npc.id}>
                  <span
                    className={styles.memoryPortrait}
                    role="img"
                    aria-label={localText(npc.name, locale)}
                    style={{
                      backgroundImage: `url("${portraitPath(npc.id, 'happy')}")`,
                    }}
                  />
                  <span>{localText(npc.name, locale)}</span>
                </li>
              ))}
            </ul>
          </article>
        )}
        {!!furnishings.length && (
          <article className={styles.memoryCard}>
            <h3>{t('game.memoryHome')}</h3>
            <ul>
              {furnishings.map((item) => (
                <li key={item.id}>
                  <span
                    className={styles.itemIcon}
                    aria-hidden="true"
                    style={{
                      backgroundImage: `url("/game/assets/indoor/${item.atlas}")`,
                      backgroundSize: `${item.frames * 32}px 32px`,
                      backgroundPosition: `${-item.frame * 32}px 0`,
                    }}
                  />
                  <span>{localText(item.name, locale)}</span>
                </li>
              ))}
            </ul>
          </article>
        )}
        {photo && (
          <article className={styles.memoryCard}>
            <h3>{t('game.memoryLunch')}</h3>
            <span
              className={styles.memoryPhoto}
              aria-hidden="true"
              style={{
                backgroundImage: `url("${itemIcon('community-lunch-photo')}")`,
              }}
            />
            <p>{t('game.memoryLunchText')}</p>
          </article>
        )}
        {!!crops.length && (
          <article className={styles.memoryCard}>
            <h3>{t('game.memoryGarden')}</h3>
            <ul>
              {crops.map((item) => (
                <li key={item.id}>
                  <span
                    className={styles.itemIcon}
                    aria-hidden="true"
                    style={{
                      backgroundImage: `url("${itemIcon(item.id)}")`,
                      backgroundSize: '192px 32px',
                      backgroundPosition: '-160px 0',
                    }}
                  />
                  <span>{localText(item.name, locale)}</span>
                </li>
              ))}
            </ul>
          </article>
        )}
        {!!dishes.length && (
          <article className={styles.memoryCard}>
            <h3>{t('game.memoryDishes')}</h3>
            <ul>
              {dishes.map((item) => (
                <li key={item.id}>
                  <span
                    className={styles.itemIcon}
                    aria-hidden="true"
                    style={{
                      backgroundImage: `url("${itemIcon(item.id)}")`,
                      backgroundSize: '32px 32px',
                    }}
                  />
                  <span>{localText(item.name, locale)}</span>
                </li>
              ))}
            </ul>
          </article>
        )}
        {flowerbed && (
          <article className={styles.memoryCard}>
            <h3>{t('game.memoryFlowerbed')}</h3>
            <p>{t('game.memoryFlowerbedText')}</p>
          </article>
        )}
      </div>
    </section>
  );
}
export function Ending({
  state,
  onChange,
}: {
  state: GameState;
  onChange: (next: GameState | undefined) => void;
}) {
  const { t, locale } = useTranslation();
  return (
    <section className={styles.ending}>
      <h1>{t('game.ending')}</h1>
      {narrative(state).map((line, index) => (
        <p key={index} className={styles.story}>
          {localText(line, locale)}
        </p>
      ))}
      <LifeMemories state={state} />
      <div className={styles.buttons}>
        <Link
          className={styles.button}
          href={`/result#s=${encodeDraft(gameDraft(state))}`}
        >
          {t('game.openTimeline')}
        </Link>
        <button
          className={styles.secondary}
          onClick={() =>
            onChange(newGame(state.characterId, Date.now() % 2 ** 31, locale))
          }
        >
          {t('game.replay')}
        </button>
        <button
          className={styles.secondary}
          onClick={() => onChange(undefined)}
        >
          {t('game.changeCharacter')}
        </button>
      </div>
      <h2>{t('game.achievements')}</h2>
      <div className={styles.achievementColumns}>
        {[true, false].map((earned) => {
          const items = [
            ...achievements,
            ...(characters.find(
              (character) => character.id === state.characterId,
            )!.achievements ?? []),
          ].filter((item) => state.achievements.includes(item.id) === earned);
          const list = items.length ? (
            <ul>
              {items.map((item) => (
                <li key={item.id}>
                  <strong>{localText(item.name, locale)}</strong>
                  <p>{localText(item.description, locale)}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p>{t('game.noAchievements')}</p>
          );
          return earned ? (
            <section key="earned">
              <h3>
                {t('game.earned')} ({items.length})
              </h3>
              {list}
            </section>
          ) : (
            <details key="unearned">
              <summary>
                {t('game.unearned')} ({items.length})
              </summary>
              {list}
            </details>
          );
        })}
      </div>
      {state.result.shortCircuit && (
        <p className={styles.notice}>{state.result.shortCircuit.message}</p>
      )}
      <AssessmentColumns
        result={state.result}
        simulationDate={state.date}
        idPrefix="ending-"
      />
    </section>
  );
}
