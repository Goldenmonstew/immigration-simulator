'use client';

import { Children, useState, type ReactNode } from 'react';
import { AssessmentColumns } from '../../components/result-view';
import { useTranslation } from '../../i18n/locale';
import {
  activities,
  doActivity,
  festivals,
  places,
  peopleAt,
  townsfolk,
  npcAt,
  npcs,
  items,
  type Effect,
  type Activity,
  type GameState,
  type PlaceId,
} from '@uk-immigration/game';
import { isPlaceOpen } from './session';
import styles from './game.module.css';
import { localText, signed, clockTime } from './game-ui';

export function EffectHints({ effects }: { effects: Effect[] }) {
  const { t, locale } = useTranslation();
  return (
    <span className={styles.hints}>
      {effects.map((effect, index) => (
        <span key={index}>
          {effect.type === 'stat'
            ? `${t(`game.${effect.key}`)} ${signed(effect.delta, effect.key)}`
            : effect.type === 'money'
              ? signed(effect.delta, 'money')
              : effect.type === 'item'
                ? `${localText(items.find((i) => i.id === effect.item)?.name ?? { zhCN: '物品', en: 'Item' }, locale)} ${effect.delta > 0 ? '+' : ''}${effect.delta}`
                : effect.type === 'friendship'
                  ? `${localText(npcs.find((n) => n.id === effect.npc)!.name, locale)} ${effect.delta > 0 ? '+' : ''}${effect.delta}`
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
export function LocationMenu({
  state,
  location,
  onChange,
  onTalk,
  children,
}: {
  state: GameState;
  location: PlaceId;
  onChange: (next: GameState) => void;
  onTalk?: (npc: string) => void;
  children?: ReactNode;
}) {
  const { t, locale } = useTranslation();
  const [endingAction, setEndingAction] = useState<Activity>();
  const place = places.find((p) => p.id === location)!;
  const open = isPlaceOpen(state, place);
  const people = [
    ...new Set([
      ...peopleAt(state, location),
      ...(location === 'green' && state.day.festival
        ? townsfolk(state)
            .filter((npc) => npcAt(state, npc.id) === 'green-stall')
            .map((npc) => npc.id)
        : []),
    ]),
  ];
  const available = activities(state, location).sort(
    (a, b) => Number(b.id === 'extend') - Number(a.id === 'extend'),
  );
  const tooLate =
    place.hours &&
    activities(
      {
        ...state,
        day: { ...state.day, minute: place.hours.opens },
      },
      location,
    ).some((action) => state.day.minute + action.minutes > place.hours!.closes);
  if (endingAction)
    return (
      <>
        <h3>{localText(endingAction.label, locale)}</h3>
        <p>{t('game.endingConfirm')}</p>
        <div className={styles.buttons}>
          <button
            className={styles.button}
            onClick={() => {
              setEndingAction(undefined);
              onChange(doActivity(state, endingAction.id));
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
            <AssessmentColumns
              result={state.result}
              simulationDate={state.date}
              idPrefix="town-"
            />
          ) : (
            <>
              {location === 'station' && <p>{t('game.travelRecall')}</p>}
              {location === 'green' &&
                festivals
                  .filter((f) => f.id === state.day.festival)
                  .map((f) => (
                    <section key={f.id} className={styles.festivalIntro}>
                      <h3>{localText(f.name, locale)}</h3>
                      <p>{localText(f.text, locale)}</p>
                    </section>
                  ))}
              {!available.length && Children.toArray(children).length === 0 && (
                <p role="status">
                  {location === 'visa'
                    ? t('game.noVisaActions')
                    : tooLate
                      ? t('game.tooLate').replace(
                          '{time}',
                          clockTime(place.hours!.closes),
                        )
                      : t('game.noActions')}
                </p>
              )}
              <div className={styles.choices}>
                {available.map((action) => (
                  <button
                    key={action.id}
                    className={styles.choice}
                    onClick={() =>
                      action.effects.some((effect) => effect.type === 'ending')
                        ? setEndingAction(action)
                        : onChange(doActivity(state, action.id))
                    }
                  >
                    <strong>{localText(action.label, locale)}</strong>
                    <small>
                      {t('game.minutes').replace(
                        '{count}',
                        String(action.minutes),
                      )}
                    </small>
                    <EffectHints effects={action.effects} />
                  </button>
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
                  {localText(npcs.find((n) => n.id === id)!.name, locale)} ·{' '}
                  {t('game.talk')}
                </button>
              ))}
            </section>
          )}
        </>
      )}
    </>
  );
}
