'use client';

import { withCount } from '../../i18n';
import { useTranslation } from '../../i18n/locale';
import {
  currentEvent,
  resolve,
  type GameEvent,
  type GameState,
} from '@uk-immigration/game';
import { visaStatus } from './session';
import styles from './game.module.css';
import { localText } from './game-ui';
import { EffectHints } from './location-menu';

export function EventNotes({ choices }: { choices: GameEvent['choices'] }) {
  const { locale } = useTranslation();
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
export function VisaReminder({
  state,
  onVisit,
}: {
  state: GameState;
  onVisit?: () => void;
}) {
  const { t } = useTranslation();
  return (
    <section>
      <h3>{t('game.visaReminderTitle')}</h3>
      <p>
        {withCount(t('game.visaReminder'), 'count', visaStatus(state).months)}
      </p>
      <button className={styles.secondary} onClick={onVisit}>
        {t('game.visaVisit')}
      </button>
    </section>
  );
}
export function EventCard({
  state,
  onChange,
}: {
  state: GameState;
  onChange: (next: GameState) => void;
}) {
  const { locale } = useTranslation();
  const event = currentEvent(state)!;
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
            onClick={() => onChange(resolve(state, choice.id))}
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
