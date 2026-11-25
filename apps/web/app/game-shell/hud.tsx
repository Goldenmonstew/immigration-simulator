'use client';

import { type ReactNode } from 'react';
import { withCount, type TranslationKey } from '../../i18n';
import type { Interaction } from './scene';
import type { GameCountry, GameKinds, State } from './types';
import styles from '../uk/game/game.module.css';
import {
  localText,
  GameIcon,
  dayDate,
  outcomeColor,
  clockTime,
  useGameText,
  useTouchPointer,
  iconPaths,
} from './game-ui';

export function createHud<K extends GameKinds>(c: GameCountry<K>) {
  const { game } = c;
  const statName = (key: string) => `game.${key}` as TranslationKey;
  function ControlHint() {
    const { t } = useGameText(c.id);
    const touch = useTouchPointer();
    return (
      <p className={styles.controls}>
        {t(touch ? 'game.touchControls' : 'game.controls')}
      </p>
    );
  }
  function InteractButton({
    interaction,
    onInteract,
  }: {
    interaction: Interaction;
    onInteract: () => void;
  }) {
    const { t, locale } = useGameText(c.id);
    const touch = useTouchPointer();
    const name =
      interaction.kind === 'surprise'
        ? localText(interaction.name, locale)
        : interaction.kind === 'home'
          ? t(
              interaction.id === 'exit'
                ? 'game.exitHome'
                : `game.${interaction.id}`,
            )
          : interaction.kind === 'plot'
            ? t('game.plot').replace('{count}', String(interaction.id + 1))
            : localText(
                (interaction.kind === 'npc' ? game.npcs : game.places).find(
                  (p) => p.id === interaction.id,
                )!.name,
                locale,
              );
    const label =
      interaction.kind === 'home' && interaction.id === 'exit'
        ? name
        : t('game.interact').replace('{name}', name);
    return (
      <button className={styles.interactButton} onClick={onInteract}>
        {!touch && <span aria-hidden="true">[E] </span>}
        {label}
      </button>
    );
  }
  function StatusBar({
    state,
    children,
  }: {
    state: State<K>;
    children?: ReactNode;
  }) {
    const { t, locale } = useGameText(c.id);
    const name = game.characters.find(
      (item) => item.id === state.characterId,
    )!.name;
    const { months, renewed, pending } = c.visaStatus(state);
    const urgent = months <= 6 && !renewed && !pending;
    const visa = (compact = false) => (
      <span
        className={
          urgent ? `${styles.urgent} ${styles.visaFlash}` : styles.visa
        }
        aria-label={
          pending
            ? t('game.visaPending')
            : withCount(t('game.visa'), 'count', months)
        }
        title={urgent ? t('game.visaUrgent') : undefined}
      >
        {compact && <GameIcon name="visa" />}
        {pending
          ? t(compact ? 'game.visaPendingShort' : 'game.visaPending')
          : withCount(
              t(compact ? 'game.visaShort' : 'game.visa'),
              'count',
              months,
            )}
      </span>
    );
    const icon = (key: string) => (
      <GameIcon name={key as keyof typeof iconPaths} />
    );
    return (
      <header className={styles.hud}>
        <div className={styles.hudTop}>
          <div className={styles.hudContext}>
            <strong className={styles.desktopOnly}>
              {localText(name, locale)}
            </strong>
            <span className={styles.desktopOnly}>
              {t('game.yearQuarter')
                .replace('{year}', String(state.year))
                .replace('{quarter}', String(state.quarter))}{' '}
              · {t(`game.season${state.quarter}`)}
            </span>
            <time className={styles.desktopOnly} dateTime={state.day.date}>
              {dayDate(state.day.date, locale)}
            </time>
            <span
              className={styles.mobileOnly}
              title={`${localText(name, locale)} · ${dayDate(state.day.date, locale)}`}
            >
              {localText(name, locale)}
              <span className={styles.mobileDate}>
                Y{state.year} {t(`game.season${state.quarter}`)} D
                {state.day.index + 1}
              </span>
            </span>
          </div>
          <div className={styles.hudTime}>
            <strong className={styles.clock}>
              {clockTime(state.day.minute)}
            </strong>
            <span
              role="img"
              title={t(`game.${state.day.weather}`)}
              aria-label={t(`game.${state.day.weather}`)}
            >
              <GameIcon name={state.day.weather} />
            </span>
          </div>
          <span className={styles.desktopOnly}>
            {t('game.day').replace('{day}', String(state.day.index + 1))}
          </span>
          <span className={styles.desktopOnly}>{visa()}</span>
          <div className={styles.hudActions}>{children}</div>
        </div>
        <div className={styles.hudBottom}>
          <span className={styles.mobileOnly}>{visa(true)}</span>
          <div className={styles.stats}>
            {c.stats.map((key) => (
              <div className={styles.stat} data-stat={key} key={key}>
                <div>
                  <span className={styles.statLabel}>
                    <span aria-hidden="true">
                      {key === 'money' ? c.moneySymbol : icon(key)}{' '}
                    </span>
                    {t(statName(key))}
                  </span>
                  <span className={styles.statIcon} aria-hidden="true">
                    {icon(key)}
                  </span>
                  <strong>
                    {key === 'money'
                      ? c.money(state.stats[key])
                      : state.stats[key]}
                  </strong>
                </div>
                <meter
                  aria-label={t(statName(key))}
                  min={key === 'money' ? Math.min(0, state.stats.money) : 0}
                  max={
                    key === 'money'
                      ? Math.max(c.moneyMeter, state.stats.money)
                      : 100
                  }
                  value={state.stats[key]}
                />
              </div>
            ))}
          </div>
        </div>
      </header>
    );
  }
  function ProgressBars({
    state,
    onOpen,
  }: {
    state: State<K>;
    onOpen: (id: K['rule']) => void;
  }) {
    const { t } = useGameText(c.id);
    const bars = game.progress(state);
    return (
      <div className={styles.progressBars}>
        {c.ruleColumns.map(({ id, label }) => (
          <button
            className={styles.progressButton}
            key={id}
            onClick={() => onOpen(id)}
          >
            <span>
              {t(label)}
              <strong>
                {bars[id].earliestDate
                  ? `${Math.round(bars[id].percent)}%`
                  : '—'}
              </strong>
            </span>
            {bars[id].earliestDate && (
              <span
                className={styles.track}
                role="progressbar"
                aria-label={t(label)}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={Math.round(bars[id].percent)}
              >
                <span
                  style={{
                    width: `${Math.round(bars[id].percent)}%`,
                    backgroundColor: outcomeColor(bars[id].outcome),
                  }}
                />
              </span>
            )}
            <small>{c.outcomeLabel(bars[id], t)}</small>
            {c.missingRules(state, id) && (
              <small className={styles.missingRules}>
                {t('game.missingRules').replace(
                  '{rules}',
                  c.missingRules(state, id)!.join(' · '),
                )}
              </small>
            )}
          </button>
        ))}
      </div>
    );
  }
  function ProgressDetail({
    state,
    id,
    onVisit,
  }: {
    state: State<K>;
    id: K['rule'];
    onVisit: () => void;
  }) {
    const { t } = useGameText(c.id);
    return (
      <>
        {c.progressDetail(state, id, t)}
        <p>{t('game.progressHint')}</p>
        <button className={styles.button} onClick={onVisit}>
          {t('game.councilDetails')}
        </button>
      </>
    );
  }
  return {
    ControlHint,
    InteractButton,
    StatusBar,
    ProgressBars,
    ProgressDetail,
  };
}
