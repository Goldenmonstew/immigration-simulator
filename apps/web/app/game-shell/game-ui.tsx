'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import type { TranslationKey } from '../../i18n';
import { useTranslation } from '../../i18n/locale';
import { zhCN } from '../../i18n/zh-CN';
import type { Text } from '@uk-immigration/game/core';
import styles from '../uk/game/game.module.css';

export function localText(text: Text, locale: string) {
  return locale === 'en' ? text.en : text.zhCN;
}
/** A country can reword a shared game string under `<country>.game.…`. */
export function gameKey(country: string, key: TranslationKey) {
  const own = `${country}.${key}`;
  return (own in zhCN ? own : key) as TranslationKey;
}
export function useGameText(country: string) {
  const { t, locale } = useTranslation();
  return {
    locale,
    t: (key: TranslationKey) => t(gameKey(country, key)),
  };
}
export const iconPaths = {
  check: 'M5 12l4 4L19 6',
  mail: 'M3 5h18v14H3z M3 5l9 7 9-7',
  home: 'M3 11l9-8 9 8 M5 10v11h5v-7h4v7h5V10',
  plane: 'M22 2L9 10l-7-1 6 5 2 8 3-8z M8 14L22 2',
  lock: 'M6 10h12v11H6z M8 10V6a4 4 0 0 1 8 0v4 M12 14v3',
  sound: 'M3 9h4l5-4v14l-5-4H3z M16 8a6 6 0 0 1 0 8 M19 5a10 10 0 0 1 0 14',
  muted: 'M3 9h4l5-4v14l-5-4H3z M16 9l6 6 M22 9l-6 6',
  fast: 'M3 5l8 7-8 7z M13 5l8 7-8 7z',
  moon: 'M20 15A9 9 0 0 1 9 4a9 9 0 1 0 11 11z',
  money: 'M3 5h16v4 M3 5v14h18V9H3 M16 14h2',
  mood: 'M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z M8 9h.01 M16 9h.01 M8 14q4 5 8 0',
  health: 'M12 21S2 15 2 8a5 5 0 0 1 10-1A5 5 0 0 1 22 8c0 7-10 13-10 13z',
  english: 'M3 3h7q2 0 2 2 0-2 2-2h7v16h-7q-2 0-2 2-0-2-2-2H3z M12 5v16',
  japanese: 'M3 3h7q2 0 2 2 0-2 2-2h7v16h-7q-2 0-2 2-0-2-2-2H3z M12 5v16',
  career: 'M3 7h18v14H3z M8 7V3h8v4 M3 12q9 6 18 0 M12 12v4',
  visa: 'M5 2h14v20H5z M16 10a4 4 0 1 1-8 0 4 4 0 0 1 8 0z M8 18h8',
  sunny:
    'M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0z M12 1v3 M12 20v3 M1 12h3 M20 12h3 M4 4l2 2 M18 18l2 2 M4 20l2-2 M18 6l2-2',
  cloudy: 'M7 19a5 5 0 1 1 0-10 7 7 0 0 1 13 2 4 4 0 0 1-1 8z',
  rain: 'M7 15a4 4 0 1 1 0-8 6 6 0 0 1 11 1 3.5 3.5 0 0 1 0 7z M7 18l-1 3 M12 18l-1 3 M17 18l-1 3',
  snow: 'M12 2v20 M3 7l18 10 M3 17L21 7 M9 3l3 3 3-3 M9 21l3-3 3 3 M3 10l4-1-1-4 M18 19l-1-4 4-1 M3 14l4 1-1 4 M18 5l-1 4 4 1',
  // A koru, the unfurling fern frond, for New Zealand's te reo.
  tereo: 'M12 21c-5 0-9-4-9-9s4-9 9-9c4 0 7 3 7 7 0 3-2 5-5 5-2 0-4-2-4-4 0-1 1-2 2-2',
};
export function GameIcon({ name }: { name: keyof typeof iconPaths }) {
  return (
    <svg
      className={styles.icon}
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d={iconPaths[name]} />
    </svg>
  );
}
export const clockTime = (minute: number) =>
  `${Math.floor(minute / 60)
    .toString()
    .padStart(2, '0')}:${(minute % 60).toString().padStart(2, '0')}`;
export const dayDate = (date: string, locale: string) =>
  new Intl.DateTimeFormat(locale === 'en' ? 'en-GB' : 'zh-CN', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(date));
export function signedWith(money: (value: number) => string) {
  return (value: number, key: string) =>
    `${value > 0 ? '+' : value < 0 ? '−' : ''}${key === 'money' ? money(Math.abs(value)) : Math.abs(value)}`;
}
// Pathway statuses from every country result share these colours.
export function outcomeColor(outcome: string) {
  return outcome === 'LIKELY_ELIGIBLE' || outcome === 'MET'
    ? '#00703c'
    : outcome === 'LIKELY_NOT_ELIGIBLE' ||
        outcome === 'REQUIRES_REGULATED_REVIEW' ||
        outcome === 'NOT_MET'
      ? '#b52b1a'
      : '#956d00';
}
export function useTouchPointer() {
  const [touch, setTouch] = useState(false);
  useEffect(() => {
    const media = window.matchMedia('(pointer: coarse)');
    const update = () => setTouch(media.matches);
    update();
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);
  return touch;
}
export function Modal({
  title,
  children,
  onClose,
  wide = false,
  dialogue = false,
  sheet = false,
}: {
  title: string;
  children: ReactNode;
  onClose?: () => void;
  wide?: boolean;
  dialogue?: boolean;
  sheet?: boolean;
}) {
  const { t } = useTranslation();
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    const dialog = ref.current!;
    dialog.showModal();
    dialog.focus({ preventScroll: true });
    return () => {
      dialog.close();
      previous?.focus({ preventScroll: true });
    };
  }, []);
  return (
    <dialog
      ref={ref}
      id={sheet ? 'game-destinations' : undefined}
      tabIndex={-1}
      className={`${styles.modal} ${wide ? styles.wideModal : ''} ${dialogue ? styles.dialogueModal : ''} ${sheet ? styles.destinationSheet : ''}`}
      aria-labelledby="game-dialog-heading"
      onCancel={(event) => {
        event.preventDefault();
        onClose?.();
      }}
    >
      <header className={dialogue ? styles.dialogueHeader : styles.modalHeader}>
        <h2
          id="game-dialog-heading"
          className={dialogue ? styles.srOnly : undefined}
        >
          {title}
        </h2>
        {onClose && (
          <button className={styles.close} onClick={onClose}>
            {t('game.close')}
          </button>
        )}
      </header>
      {children}
    </dialog>
  );
}
