'use client';

import { withCount, type TranslationKey } from '../../i18n';
import type { SettlementSource } from '@uk-immigration/game/core';
import { groupedMemories, type DayMemory } from './diary';
import type { createEventCards } from './event-card';
import type { createSession } from './session';
import type { GameCountry, GameKinds, State } from './types';
import styles from '../uk/game/game.module.css';
import { localText, signedWith, outcomeColor, useGameText } from './game-ui';

export interface StateChange<S = State<GameKinds>> {
  before: S;
  after: S;
  diary?: DayMemory[];
  startStats?: Record<string, number>;
}

export function createQuarterSummary<K extends GameKinds>(
  c: GameCountry<K>,
  {
    needsVisaReminder,
    VisaReminder,
  }: Pick<ReturnType<typeof createSession<K>>, 'needsVisaReminder'> &
    Pick<ReturnType<typeof createEventCards<K>>, 'VisaReminder'>,
) {
  const { game } = c;
  const signed = signedWith(c.money);
  const statName = (key: string) => `game.${key}` as TranslationKey;
  function StatChanges({ before, after }: StateChange<State<K>>) {
    const { t } = useGameText(c.id);
    const changed = c.stats.filter(
      (key) => before.stats[key] !== after.stats[key],
    );
    return changed.length ? (
      <ul className={`${styles.deltas} ${styles.animateDeltas}`}>
        {changed.map((key) => (
          <li key={key}>
            <span>{t(statName(key))}</span>
            <strong
              className={
                after.stats[key] > before.stats[key]
                  ? styles.positive
                  : styles.negative
              }
            >
              {signed(after.stats[key] - before.stats[key], key)}
            </strong>
          </li>
        ))}
      </ul>
    ) : (
      <p>{t('game.noChanges')}</p>
    );
  }
  function QuarterSummary({
    before,
    after,
    onContinue,
    onVisit,
    onVisa,
    diary = [],
    startStats,
  }: StateChange<State<K>> & {
    onContinue: () => void;
    onVisit: () => void;
    onVisa?: () => void;
  }) {
    const { t, locale } = useGameText(c.id);
    const settled = after.log
      .slice(before.log.length)
      .filter((entry) => entry.kind === 'quarter');
    const quarters = settled.length
      ? settled
      : [{ year: before.year, quarter: before.quarter }];
    const entries = after.log.filter((entry) =>
      quarters.some(
        (q) => q.year === entry.year && q.quarter === entry.quarter,
      ),
    );
    const net = entries
      .filter((entry) => entry.kind === 'quarter')
      .reduce((sum, entry) => sum + (entry.statDeltas?.money ?? 0), 0);
    const wellbeing = new Map<
      SettlementSource,
      { mood: number; health: number }
    >();
    for (const entry of settled) {
      for (const { source, mood, health } of entry.wellbeing ?? []) {
        const total = wellbeing.get(source) ?? { mood: 0, health: 0 };
        wellbeing.set(source, {
          mood: total.mood + mood,
          health: total.health + health,
        });
      }
    }
    const cleared = settled.reduce(
      (sum, entry) => sum + (entry.clearedPlots ?? 0),
      0,
    );
    const visa = c.visaStatus(after);
    const renewals = entries.filter(
      (entry) => entry.kind === 'action' && entry.id === 'extend',
    );
    const quarterStart = { ...before, stats: startStats ?? before.stats };
    const previous = game.progress(before),
      next = game.progress(after);
    return (
      <>
        <dl className={styles.facts}>
          <div>
            <dt>{t('game.netIncome')}</dt>
            <dd>{signed(net, 'money')}</dd>
          </div>
        </dl>
        <h3>{t('game.quarterChanges')}</h3>
        {after.flags.some(
          (f) => f.startsWith('promotion-') && !before.flags.includes(f),
        ) && (
          <p role="status" className={styles.positive}>
            {t('game.promotion')}
          </p>
        )}
        <StatChanges before={quarterStart} after={after} />
        {wellbeing.size > 0 && (
          <>
            <h3>{t('game.wellbeingAtSettlement')}</h3>
            <ul className={styles.review}>
              {(['mood', 'health'] as const).map((key) => {
                const sources = [...wellbeing]
                  .filter(([, change]) => change[key] !== 0)
                  .sort(([, a], [, b]) => Math.abs(b[key]) - Math.abs(a[key]))
                  .slice(0, 2);
                return (
                  sources.length > 0 && (
                    <li key={key}>
                      <strong>{t(statName(key))}</strong>{' '}
                      {sources
                        .map(
                          ([source, change]) =>
                            `${t(`game.settlementSource.${source}`)} ${signed(change[key], key)}`,
                        )
                        .join(' · ')}
                    </li>
                  )
                );
              })}
            </ul>
          </>
        )}
        <p
          className={
            visa.months <= 6 && !visa.renewed ? styles.urgent : undefined
          }
        >
          {withCount(t('game.visa'), 'count', visa.months)}
        </p>
        {renewals.map((entry, index) => (
          <p key={index}>
            {entry.renewalValidTo
              ? t('game.renewedThrough').replace(
                  '{date}',
                  new Date(entry.renewalValidTo).toLocaleDateString(
                    locale === 'en' ? 'en-GB' : locale,
                    { dateStyle: 'medium', timeZone: 'UTC' },
                  ),
                )
              : t('game.renewedThisSeason')}
          </p>
        ))}
        {needsVisaReminder(after) && (
          <VisaReminder state={after} onVisit={onVisa} />
        )}
        {cleared > 0 && (
          <p>{t('game.cropsCleared').replace('{count}', String(cleared))}</p>
        )}
        <h3>{t('game.daysReview')}</h3>
        {quarters.map((quarter) => (
          <section key={`${quarter.year}:${quarter.quarter}`}>
            {quarters.length > 1 && (
              <h3>
                {t('game.yearQuarter')
                  .replace('{year}', String(quarter.year))
                  .replace('{quarter}', String(quarter.quarter))}
              </h3>
            )}
            {groupedMemories(diary, quarter.year, quarter.quarter).map(
              (moments, day) => (
                <section
                  key={day}
                  aria-label={t('game.day').replace('{day}', String(day + 1))}
                >
                  <h4>{t('game.day').replace('{day}', String(day + 1))}</h4>
                  {moments.length ? (
                    <ul className={styles.review}>
                      {moments.map((entry, index) => (
                        <li key={index}>
                          {localText(entry.text, locale)}
                          {entry.count > 1 && ` × ${entry.count}`}
                          <span className={styles.hints}>
                            {c.stats
                              .filter((key) => entry.statDeltas?.[key])
                              .map((key) => (
                                <small key={key}>
                                  {t(statName(key))}{' '}
                                  {signed(entry.statDeltas![key]!, key)}
                                </small>
                              ))}
                          </span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p>{t('game.noEvents')}</p>
                  )}
                </section>
              ),
            )}
          </section>
        ))}
        {after.year > before.year && (
          <>
            <h3>{t('game.yearSummary')}</h3>
            <p>{t('game.progressChanges')}</p>
            <div className={styles.progressBars}>
              {c.ruleColumns.map(({ id, label }) => (
                <div key={id} className={styles.progressButton}>
                  <strong>{t(label)}</strong>
                  <p>
                    {Math.round(previous[id].percent)}% →{' '}
                    {Math.round(next[id].percent)}%
                  </p>
                  <span className={styles.track} aria-hidden="true">
                    <span
                      style={{
                        width: `${Math.round(previous[id].percent)}%`,
                        backgroundColor: '#7896aa',
                      }}
                    />
                  </span>
                  <span
                    className={styles.track}
                    role="progressbar"
                    aria-label={t(label)}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={Math.round(next[id].percent)}
                  >
                    <span
                      style={{
                        width: `${Math.round(next[id].percent)}%`,
                        backgroundColor: outcomeColor(next[id].outcome),
                      }}
                    />
                  </span>
                  <small>{c.outcomeLabel(next[id], t)}</small>
                </div>
              ))}
            </div>
            {!game.isOver(after) && (
              <p>
                <button className={styles.secondary} onClick={onVisit}>
                  {t('game.councilDetails')}
                </button>
              </p>
            )}
          </>
        )}
        <button className={styles.button} onClick={onContinue}>
          {t(game.isOver(after) ? 'game.seeEnding' : 'game.nextQuarter')}
        </button>
      </>
    );
  }
  return { QuarterSummary };
}
