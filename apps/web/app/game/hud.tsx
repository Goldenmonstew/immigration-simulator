'use client';

import { type ReactNode } from 'react';
import type { RuleSetId } from '@uk-immigration/engine';
import { useTranslation } from '../../i18n/locale';
import { displayedRuleSets } from '../../lib/policy';
import {
  places,
  npcs,
  characters,
  progress,
  type GameState,
  type StatKey,
} from '@uk-immigration/game';
import { statKeys, visaStatus } from './session';
import type { Interaction } from './scene';
import styles from './game.module.css';
import {
  localText,
  GameIcon,
  dayDate,
  money,
  outcomeColor,
  clockTime,
  useTouchPointer,
} from './game-ui';

export function ControlHint() {
  const { t } = useTranslation();
  const touch = useTouchPointer();
  return (
    <p className={styles.controls}>
      {t(touch ? 'game.touchControls' : 'game.controls')}
    </p>
  );
}
export function InteractButton({
  interaction,
  onInteract,
}: {
  interaction: Interaction;
  onInteract: () => void;
}) {
  const { t, locale } = useTranslation();
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
              (interaction.kind === 'npc' ? npcs : places).find(
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
export function StatusBar({
  state,
  children,
}: {
  state: GameState;
  children?: ReactNode;
}) {
  const { t, locale } = useTranslation();
  const name = characters.find((item) => item.id === state.characterId)!.name;
  const { months, renewed } = visaStatus(state);
  const urgent = months <= 6 && !renewed;
  const visa = (compact = false) => (
    <span
      className={urgent ? `${styles.urgent} ${styles.visaFlash}` : styles.visa}
      aria-label={t('game.visa').replace('{count}', String(months))}
      title={urgent ? t('game.visaUrgent') : undefined}
    >
      {compact && <GameIcon name="visa" />}
      {t(compact ? 'game.visaShort' : 'game.visa').replace(
        '{count}',
        String(months),
      )}
    </span>
  );
  const icons: Record<StatKey, ReactNode> = {
    money: '£',
    mood: <GameIcon name="mood" />,
    health: <GameIcon name="health" />,
    english: <GameIcon name="english" />,
    career: <GameIcon name="career" />,
  };
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
            {localText(name, locale)} · Y{state.year}{' '}
            {t(`game.season${state.quarter}`)} D{state.day.index + 1}
          </span>
        </div>
        <strong className={styles.clock}>{clockTime(state.day.minute)}</strong>
        <span
          role="img"
          title={t(`game.${state.day.weather}`)}
          aria-label={t(`game.${state.day.weather}`)}
        >
          <GameIcon name={state.day.weather} />
        </span>
        <span className={styles.desktopOnly}>
          {t('game.day').replace('{day}', String(state.day.index + 1))}
        </span>
        <span className={styles.desktopOnly}>{visa()}</span>
        <div className={styles.hudActions}>{children}</div>
      </div>
      <div className={styles.hudBottom}>
        <span className={styles.mobileOnly}>{visa(true)}</span>
        <div className={styles.stats}>
          {statKeys.map((key) => (
            <div className={styles.stat} data-stat={key} key={key}>
              <div>
                <span className={styles.statLabel}>
                  <span aria-hidden="true">{icons[key]} </span>
                  {t(`game.${key}`)}
                </span>
                {key !== 'money' && (
                  <span className={styles.statIcon} aria-hidden="true">
                    {icons[key]}
                  </span>
                )}
                <strong>
                  {key === 'money' ? money(state.stats[key]) : state.stats[key]}
                </strong>
              </div>
              <meter
                aria-label={t(`game.${key}`)}
                min={key === 'money' ? Math.min(0, state.stats.money) : 0}
                max={key === 'money' ? Math.max(10000, state.stats.money) : 100}
                value={state.stats[key]}
              />
            </div>
          ))}
        </div>
      </div>
    </header>
  );
}
export function ProgressBars({
  state,
  onOpen,
}: {
  state: GameState;
  onOpen: (id: RuleSetId) => void;
}) {
  const { t } = useTranslation();
  const bars = progress(state);
  return (
    <div className={styles.progressBars}>
      {displayedRuleSets.map(({ id }, index) => (
        <button
          className={styles.progressButton}
          key={id}
          onClick={() => onOpen(id)}
        >
          <span>
            {t(index === 0 ? 'game.currentLaw' : 'game.reform')}
            <strong>
              {bars[id].earliestDate ? `${Math.round(bars[id].percent)}%` : '—'}
            </strong>
          </span>
          {bars[id].earliestDate && (
            <span
              className={styles.track}
              role="progressbar"
              aria-label={t(index === 0 ? 'game.currentLaw' : 'game.reform')}
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
          <small>{t(`outcome.${bars[id].outcome}`)}</small>
          {bars[id].outcome === 'INSUFFICIENT_INFORMATION' && (
            <small className={styles.missingRules}>
              {t('game.missingRules').replace(
                '{rules}',
                state.result.byRuleSet[id]!.rules.filter(
                  (rule) => rule.status === 'UNKNOWN',
                )
                  .map((rule) => rule.title)
                  .join(' · '),
              )}
            </small>
          )}
        </button>
      ))}
    </div>
  );
}
export function ProgressDetail({
  state,
  id,
  onVisit,
}: {
  state: GameState;
  id: RuleSetId;
  onVisit: () => void;
}) {
  const { t } = useTranslation();
  const assessment = state.result.byRuleSet[id]!;
  return (
    <>
      <p className={styles.lead}>{t(`outcome.${assessment.outcome}`)}</p>
      <dl className={styles.facts}>
        <div>
          <dt>{t('result.pathway')}</dt>
          <dd>
            {assessment.pathwayYears === undefined
              ? t('result.undetermined')
              : `${assessment.pathwayYears} ${t('result.years')}`}
          </dd>
        </div>
        <div>
          <dt>{t('result.earliest')}</dt>
          <dd>{assessment.earliestDate ?? t('result.undetermined')}</dd>
        </div>
      </dl>
      <p>{t('game.progressHint')}</p>
      <button className={styles.button} onClick={onVisit}>
        {t('game.councilDetails')}
      </button>
    </>
  );
}
