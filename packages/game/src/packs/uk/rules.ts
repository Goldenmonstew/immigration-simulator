import {
  evaluate,
  type DecisionOutcome,
  type ImmigrationEpisode,
  type RuleSetId,
} from '@uk-immigration/engine';
import { RULE_SET_IDS } from '@uk-immigration/policy-data';
import { addDays, addMonths, dayMs } from '../../calendar';
import type { EvaluationAdapter } from '../../content-pack';
import type { GameState, IsoDate, Progress, FestivalId } from '../../types';
import type { UkEffect } from './effects';

export type UkRules = EvaluationAdapter<
  GameState['timeline'],
  GameState['result'],
  UkEffect,
  RuleSetId,
  DecisionOutcome,
  FestivalId
>;

function taxYearOf(date: IsoDate) {
  const year = Number(date.slice(0, 4)) - (date.slice(5) < '04-06' ? 1 : 0);
  return `${year}-${String((year + 1) % 100).padStart(2, '0')}`;
}
export function episodeAt(state: GameState, date = state.date) {
  return state.timeline.episodes
    .filter((e) => e.validFrom <= date && date <= e.validTo)
    .sort((a, c) => c.validFrom.localeCompare(a.validFrom))[0];
}

/** Remaining calendar months rounded down; zero on the last valid day. */
function visaMonthsLeft(state: GameState): number {
  const episode = episodeAt(state);
  if (!episode) return 0;
  const full =
    (Number(episode.validTo.slice(0, 4)) - Number(state.date.slice(0, 4))) *
      12 +
    Number(episode.validTo.slice(5, 7)) -
    Number(state.date.slice(5, 7));
  const anchor = addMonths(state.date, full);
  return Math.max(
    0,
    Math.floor(
      full + (Date.parse(episode.validTo) - Date.parse(anchor)) / dayMs / 31,
    ),
  );
}

function recordIncome(
  state: GameState,
  date: IsoDate,
  earnings?: number,
  partnerEarnings?: number,
) {
  const taxYear = taxYearOf(date);
  let income = state.timeline.incomeYears.find((y) => y.taxYear === taxYear);
  if (!income) {
    income = { taxYear };
    state.timeline.incomeYears.push(income);
  }
  if (earnings !== undefined) income.earnings = earnings;
  if (partnerEarnings !== undefined) income.partnerEarnings = partnerEarnings;
}
function syncSalary(state: GameState, salary: number) {
  // A granted future renewal keeps the same job's latest salary.
  for (const e of state.timeline.episodes.filter(
    (e) => e.validTo >= state.date,
  ))
    e.salary = salary;
  // Fictional annualised gross-income model, consistent with the v1 scenario.
  recordIncome(state, state.date, salary);
}

function progress(state: GameState): Progress<RuleSetId, DecisionOutcome> {
  const start = Math.min(
    ...state.timeline.episodes.map((e: ImmigrationEpisode) =>
      Date.parse(e.validFrom),
    ),
  );
  return Object.fromEntries(
    RULE_SET_IDS.map((id) => {
      const result = state.result.byRuleSet[id];
      const target = result?.earliestDate && Date.parse(result.earliestDate);
      const percent =
        result?.outcome === 'LIKELY_ELIGIBLE'
          ? 100
          : target && target > start
            ? ((Date.parse(state.date) - start) / (target - start)) * 100
            : 0;
      return [
        id,
        {
          outcome: result?.outcome ?? 'INSUFFICIENT_INFORMATION',
          ...(result?.earliestDate && { earliestDate: result.earliestDate }),
          percent: Math.round(Math.max(0, Math.min(100, percent))),
        },
      ];
    }),
  ) as Progress<RuleSetId, DecisionOutcome>;
}

export const ukRules: UkRules = {
  evaluate: ({ date, timeline, locale }) =>
    evaluate({ simulationDate: date, timeline, locale }),
  progress,
  endingForResult(result) {
    if (result.shortCircuit?.reason === 'CRIMINALITY') return 'criminal';
    if (result.shortCircuit?.reason === 'IMMIGRATION_BREACH')
      return 'overstayed';
  },
  route: (state) => episodeAt(state)?.route,
  visaMonthsLeft,
  canTravel(state, through) {
    const current = episodeAt(state);
    return !!current && through <= current.validTo;
  },
  recordAbsence(state, trip) {
    state.timeline.absences.push({ from: trip.from, to: trip.to });
  },
  earnings(state) {
    const current = episodeAt(state);
    const salary = current?.salary ?? 0;
    const income = state.timeline.incomeYears.find(
      (y) => y.taxYear === taxYearOf(state.date),
    );
    const partnerEarnings = [...state.timeline.incomeYears]
      .filter(
        (y) =>
          y.taxYear <= taxYearOf(state.date) && y.partnerEarnings !== undefined,
      )
      .sort((a, c) => c.taxYear.localeCompare(a.taxYear))[0]?.partnerEarnings;
    if (income?.earnings === undefined && current?.salary !== undefined)
      recordIncome(state, state.date, salary);
    if (income?.partnerEarnings === undefined && partnerEarnings !== undefined)
      recordIncome(state, state.date, undefined, partnerEarnings);
    return (
      salary +
      (current?.route === 'FAMILY_PARTNER_OR_PARENT'
        ? (partnerEarnings ?? 0)
        : 0)
    );
  },
  promote(state, multiplier) {
    const current = episodeAt(state);
    if (current?.salary === undefined) return false;
    syncSalary(state, Math.round(current.salary * multiplier));
    return true;
  },
  expired(state, previousDate) {
    // Check coverage at every boundary, including a future gap, rather than
    // assuming the latest dated episode means permission is continuous.
    let coveredUntil = addDays(previousDate, -1);
    for (const e of [...state.timeline.episodes].sort((a, c) =>
      a.validFrom.localeCompare(c.validFrom),
    )) {
      if (e.validFrom <= addDays(coveredUntil, 1) && e.validTo >= coveredUntil)
        coveredUntil = e.validTo;
    }
    if (coveredUntil < state.date)
      state.timeline.immigrationBreaches.push({
        type: 'OVERSTAYING',
        date: addDays(coveredUntil, 1),
      });
    // The UK engine only short circuits adult illegal entry. Permission expiry
    // ends this story with the assessments returned by the engine intact.
    return coveredUntil < state.date;
  },
  applyEffect(state, e, tools) {
    switch (e.type) {
      case 'absence': {
        const from = addDays(state.date, e.startOffsetDays);
        state.timeline.absences.push({ from, to: addDays(from, e.days - 1) });
        return true;
      }
      case 'income':
        recordIncome(
          state,
          e.taxYear === 'next' ? addMonths(state.date, 12) : state.date,
          e.earnings,
          e.partnerEarnings,
        );
        return true;
      case 'episode': {
        Object.assign(episodeAt(state), e.patch);
        if (e.patch.salary !== undefined) syncSalary(state, e.patch.salary);
        return true;
      }
      case 'newEpisode': {
        const current = episodeAt(state);
        const from =
          e.start === 'afterCurrent' && current
            ? addDays(current.validTo, 1)
            : addDays(state.date, e.gapDays ?? 0);
        if (e.start !== 'afterCurrent') {
          tools.setFlags(state, ['quarter-job-changed']);
          state.timeline.episodes = state.timeline.episodes.filter(
            (episode) => episode.validFrom < state.date,
          );
          if (current) current.validTo = addDays(state.date, -1);
        }
        state.timeline.episodes.push({
          ...e.episode,
          validFrom: from,
          validTo: addDays(addMonths(from, e.durationMonths), -1),
        });
        if (e.start !== 'afterCurrent' && e.episode.salary !== undefined)
          recordIncome(state, from, e.episode.salary);
        return true;
      }
      case 'benefit': {
        const from = addDays(state.date, e.startOffsetDays);
        state.timeline.benefits.push({
          ...e.benefit,
          from,
          ...(e.months !== undefined && {
            to: addDays(addMonths(from, e.months), -1),
          }),
        });
        return true;
      }
      case 'relationship':
        if (e.remove)
          state.timeline.relationships = state.timeline.relationships.filter(
            (r) => r.type !== e.remove,
          );
        if (e.add) state.timeline.relationships.push(e.add);
        return true;
      case 'english': {
        const ranks = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
        const old = state.timeline.english;
        if (
          !old ||
          ('cefrLevel' in old &&
            ranks.indexOf(e.cefrLevel) > ranks.indexOf(old.cefrLevel))
        ) {
          state.timeline.english = { cefrLevel: e.cefrLevel };
          tools.setFlags(state, ['quarter-exam-passed']);
        }
        return true;
      }
      case 'lifeInTheUk':
        if (
          !state.timeline.lifeInTheUk ||
          !('passed' in state.timeline.lifeInTheUk)
        )
          tools.setFlags(state, ['quarter-life-passed']);
        state.timeline.lifeInTheUk = { passed: true };
        return true;
      case 'breach':
        state.timeline.immigrationBreaches.push({
          ...e.breach,
          date: addDays(state.date, e.offsetDays ?? 0),
        });
        return true;
      case 'criminal':
        state.timeline.criminalRecord.push({
          ...e.event,
          date: addDays(state.date, e.offsetDays ?? 0),
        });
        return true;
      case 'timeline':
        Object.assign(state.timeline, e.patch);
        return true;
    }
  },
  afterEffects(state) {
    // A declared savings pot cannot retain money the household has spent.
    if (state.timeline.cashSavings !== undefined) {
      const savings = Math.min(
        state.timeline.cashSavings,
        Math.max(0, state.stats.money),
      );
      if (savings !== state.timeline.cashSavings) {
        state.timeline.cashSavings = savings;
        return true;
      }
    }
    return false;
  },
};
