'use client';

import { withCount } from '../../i18n';
import type { GameEvent } from '@uk-immigration/game/core';
import type { GameCountry, GameKinds, State } from './types';
import styles from '../uk/game/game.module.css';
import { localText, useGameText } from './game-ui';
import type { createLocationMenu } from './location-menu';

export function createEventCards<K extends GameKinds>(
  c: GameCountry<K>,
  {
    EffectHints,
  }: Pick<ReturnType<typeof createLocationMenu<K>>, 'EffectHints'>,
) {
  const { game } = c;
  function EventNotes({
    choices,
  }: {
    choices: GameEvent<K['effect'], K['festival']>['choices'];
  }) {
    const { locale } = useGameText(c.id);
    const notes = [
      ...new Set(
        choices.flatMap((choice) =>
          choice.note ? [localText(choice.note, locale)] : [],
        ),
      ),
    ];
    return notes.length ? (
      <p className={styles.eventNotes}>
        <small>{notes.join(' ')}</small>
      </p>
    ) : null;
  }
  function VisaReminder({
    state,
    onVisit,
  }: {
    state: State<K>;
    onVisit?: () => void;
  }) {
    const { t } = useGameText(c.id);
    return (
      <section>
        <h3>{t('game.visaReminderTitle')}</h3>
        <p>
          {withCount(
            t('game.visaReminder'),
            'count',
            c.visaStatus(state).months,
          )}
        </p>
        <button className={styles.secondary} onClick={onVisit}>
          {t('game.visaVisit')}
        </button>
      </section>
    );
  }
  function EventCard({
    state,
    onChange,
  }: {
    state: State<K>;
    onChange: (next: State<K>) => void;
  }) {
    const { locale } = useGameText(c.id);
    const event = game.currentEvent(state)!;
    return (
      <>
        {localText(event.text, locale)
          .split('\n')
          .map((paragraph, index) => (
            <p key={index} className={styles.lead}>
              {paragraph}
            </p>
          ))}
        <div className={styles.choices}>
          {event.choices.map((choice) => (
            <button
              className={styles.choice}
              key={choice.id}
              onClick={() => onChange(game.resolve(state, choice.id))}
            >
              <strong>{localText(choice.label, locale)}</strong>
              <EffectHints effects={choice.effects} />
            </button>
          ))}
        </div>
        <EventNotes choices={event.choices} />
      </>
    );
  }
  return { EventNotes, VisaReminder, EventCard };
}
