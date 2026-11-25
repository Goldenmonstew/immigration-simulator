'use client';

import { Children, useState, type ReactNode } from 'react';
import type { TranslationKey } from '../../i18n';
import type {
  Activity,
  Effect,
  PlaceId,
  TownEffect,
} from '@uk-immigration/game/core';
import { isPlaceOpen } from './session';
import type { GameCountry, GameKinds, State } from './types';
import styles from '../uk/game/game.module.css';
import { localText, signedWith, clockTime, useGameText } from './game-ui';

export function createLocationMenu<K extends GameKinds>(c: GameCountry<K>) {
  const { game } = c;
  const signed = signedWith(c.money);
  type Action = Activity<K['effect'], K['festival']>;
  function EffectHints({ effects }: { effects: Effect<K['effect']>[] }) {
    const { t, locale } = useGameText(c.id);
    return (
      <span className={styles.hints}>
        {(effects as TownEffect[]).map((effect, index) => (
          <span key={index}>
            {effect.type === 'stat'
              ? `${t(`game.${effect.key}` as TranslationKey)} ${signed(effect.delta, effect.key)}`
              : effect.type === 'money'
                ? signed(effect.delta, 'money')
                : effect.type === 'item'
                  ? `${localText(game.items.find((i) => i.id === effect.item)?.name ?? { zhCN: '物品', en: 'Item' }, locale)} ${effect.delta > 0 ? '+' : ''}${effect.delta}`
                  : effect.type === 'friendship'
                    ? `${localText(game.npcs.find((n) => n.id === effect.npc)!.name, locale)} ${effect.delta > 0 ? '+' : ''}${effect.delta}`
                    : effect.type === 'none'
                      ? null
                      : t(
                          effect.type === 'ending'
                            ? 'game.endingEffect'
                            : 'game.timelineEffect',
                        )}
          </span>
        ))}
      </span>
    );
  }
  function LocationMenu({
    state,
    location,
    onChange,
    onTalk,
    children,
  }: {
    state: State<K>;
    location: PlaceId;
    onChange: (next: State<K>) => void;
    onTalk?: (npc: string) => void;
    children?: ReactNode;
  }) {
    const { t, locale } = useGameText(c.id);
    const [endingAction, setEndingAction] = useState<Action>();
    const actionLabel = (action: Action) => {
      const own = c.endingActionText?.(state, action.id);
      return own ? t(own.label) : localText(action.label, locale);
    };
    const npcName = (id: string) =>
      localText(game.npcs.find((n) => n.id === id)!.name, locale);
    const place = game.places.find((p) => p.id === location)!;
    const open = isPlaceOpen(state, place);
    const note = c.placeNote?.(state, location);
    const people = [
      ...new Set([
        ...game.peopleAt(state, location),
        ...(location === 'green' && state.day.festival
          ? game
              .townsfolk(state)
              .filter((npc) => game.npcAt(state, npc.id) === 'green-stall')
              .map((npc) => npc.id)
          : []),
      ]),
    ];
    const available = game
      .activities(state, location)
      .sort((a, b) => Number(b.id === 'extend') - Number(a.id === 'extend'));
    const tooLate =
      place.hours &&
      game
        .activities(
          {
            ...state,
            day: { ...state.day, minute: place.hours.opens },
          },
          location,
        )
        .some(
          (action) => state.day.minute + action.minutes > place.hours!.closes,
        );
    if (endingAction)
      return (
        <>
          <h3>{actionLabel(endingAction)}</h3>
          <p>
            {t(
              c.endingActionText?.(state, endingAction.id)?.confirm ??
                'game.endingConfirm',
            )}
          </p>
          <div className={styles.buttons}>
            <button
              className={styles.button}
              onClick={() => {
                setEndingAction(undefined);
                onChange(game.doActivity(state, endingAction.id));
              }}
            >
              {t('game.confirm')}
            </button>
            <button
              className={styles.secondary}
              onClick={() => setEndingAction(undefined)}
            >
              {t('game.cancel')}
            </button>
          </div>
        </>
      );
    return (
      <>
        <p>
          {t('game.hours')}:{' '}
          {place.hours
            ? `${clockTime(place.hours.opens)}–${clockTime(place.hours.closes)}`
            : t('game.openAllDay')}
          {place.hours?.dayKinds &&
            ` · ${place.hours.dayKinds.map((k) => t(`game.${k}`)).join(', ')}`}
        </p>
        {!open ? (
          <p role="status">{t('game.closed')}</p>
        ) : (
          <>
            {location === 'council' ? (
              c.assessment(state, 'town-')
            ) : (
              <>
                {location === 'station' && <p>{t('game.travelRecall')}</p>}
                {note && <p role="status">{localText(note, locale)}</p>}
                {location === 'green' &&
                  game.festivals
                    .filter((f) => f.id === state.day.festival)
                    .map((f) => (
                      <section key={f.id} className={styles.festivalIntro}>
                        <h3>{localText(f.name, locale)}</h3>
                        <p>{localText(f.text, locale)}</p>
                      </section>
                    ))}
                {!available.length &&
                  Children.toArray(children).length === 0 &&
                  !(location === 'visa' && note) && (
                    <p role="status">
                      {tooLate
                        ? t('game.tooLate').replace(
                            '{time}',
                            clockTime(place.hours!.closes),
                          )
                        : location === 'visa'
                          ? t('game.noVisaActions')
                          : t('game.noActions')}
                    </p>
                  )}
                {available.length > 0 && tooLate && (
                  <p role="status">
                    {t('game.tooLateSome').replace(
                      '{time}',
                      clockTime(place.hours!.closes),
                    )}
                  </p>
                )}
                <div className={styles.choices}>
                  {available.map((action) => (
                    <div key={action.id}>
                      <button
                        className={styles.choice}
                        aria-describedby={
                          action.note && `action-note-${action.id}`
                        }
                        onClick={() =>
                          action.effects.some(
                            (effect) => effect.type === 'ending',
                          )
                            ? setEndingAction(action)
                            : onChange(game.doActivity(state, action.id))
                        }
                      >
                        <strong>{actionLabel(action)}</strong>
                        <small>
                          {t('game.minutes').replace(
                            '{count}',
                            String(action.minutes),
                          )}
                        </small>
                        <EffectHints effects={action.effects} />
                      </button>
                      {action.note && (
                        <p
                          className={styles.eventNotes}
                          id={`action-note-${action.id}`}
                        >
                          <small>{localText(action.note, locale)}</small>
                        </p>
                      )}
                    </div>
                  ))}
                </div>
                {children}
              </>
            )}
            {!!people.length && (
              <section className={styles.people}>
                <h3>{t('game.peopleHere')}</h3>
                {people.map((id) => (
                  <button
                    key={id}
                    className={styles.secondary}
                    onClick={() => onTalk?.(id)}
                  >
                    {npcName(id)} · {t('game.talk')}
                  </button>
                ))}
              </section>
            )}
          </>
        )}
      </>
    );
  }
  return { EffectHints, LocationMenu };
}
