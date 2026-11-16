import { describe, expect, test } from 'vitest';
import { evaluate } from '@uk-immigration/engine';
import { currentLaw2026_11 } from '@uk-immigration/policy-data';
import {
  activities,
  currentEvent,
  doActivity,
  enter,
  fastForward,
  newGame,
  resolve,
  talk,
} from '../src';
import type { GameState } from '../src';
import {
  graduate,
  graduateApplicationDate,
  graduateRecruitment,
  graduateSalaryChecks,
  graduateSalaries,
} from '../src/characters/graduate';
import { graduateHeartEvents } from '../src/characters/graduate-flatmate';
import { extensionCost } from '../src/locations';
import { clear, completeQuarter, drain } from './helpers';

const restore = (state: GameState): GameState =>
  JSON.parse(JSON.stringify(state));
function job(state: GameState, choice?: string) {
  const before = drain(state);
  const atWork = drain(
    enter({ ...before, day: { ...before.day, minute: 540 } }, 'work'),
  );
  const interview = doActivity(atWork, 'graduate-job-search');
  expect(interview.pendingEvent).toBeDefined();
  return resolve(
    restore(interview),
    choice ?? currentEvent(interview)!.choices[0].id,
  );
}
function offer(low = false) {
  let state = newGame('graduate', 17);
  for (let stage = 0; stage < 5; stage++) {
    state = job(state, low && stage === 3 ? 'keep' : undefined);
    if (stage < 4) state = completeQuarter(state);
  }
  return clear(state);
}
function atVisa(state: GameState) {
  return enter({ ...state, day: { ...state.day, minute: 600 } }, 'visa');
}

describe('13.2 Graduate character and engine integration', () => {
  test('application date selects the sourced two-year grant from decision day', () => {
    const state = newGame('graduate', 1);
    const values = currentLaw2026_11.values;
    expect(
      graduateApplicationDate <
        values.graduateNonDoctoralShorterGrantFrom.value,
    ).toBe(true);
    expect(values.graduateNonDoctoralEarlyGrantMonths.value).toBe(24);
    expect(state.timeline.episodes.at(-1)).toMatchObject({
      route: 'GRADUATE',
      validFrom: '2026-09-15',
      validTo: '2028-09-14',
    });
    expect(currentEvent(state)?.id).toBe('opening-graduate');
    expect(
      activities(atVisa(clear(state)), 'visa').map((action) => action.id),
    ).not.toContain('extend');
    expect(state.result).toEqual(
      evaluate({
        timeline: state.timeline,
        simulationDate: state.date,
        locale: state.locale,
      }),
    );
  });
  test('job stages are explicit, retryable and survive JSON without issuing free permission', () => {
    const before = drain(newGame('graduate', 2));
    expect(
      activities(atVisa(before), 'visa').map((action) => action.id),
    ).not.toContain('graduate-switch');
    const postponed = job(before, 'later');
    expect(postponed.flags).not.toContain('graduate-applied');
    expect(postponed.timeline).toEqual(before.timeline);
    const applied = job(completeQuarter(restore(postponed)));
    expect(applied.flags).toContain('graduate-applied');
    const interview = job(completeQuarter(applied));
    expect(interview.flags).toContain('graduate-interviewed');
    const prepared = offer();
    expect(prepared.flags).toEqual(
      expect.arrayContaining([
        'graduate-applied',
        'graduate-interviewed',
        'graduate-sponsor-confirmed',
        'graduate-negotiated',
        'graduate-cos-ready',
      ]),
    );
    expect(prepared.timeline.episodes.at(-1)?.route).toBe('GRADUATE');
    expect(
      prepared.log.filter((entry) =>
        graduateRecruitment.some((card) => card.id === entry.id),
      ),
    ).toHaveLength(5);
  });
  test('a low offer fails engine checks; correcting contract and CoS enables the switch', () => {
    let state = offer(true);
    expect(
      graduateSalaryChecks(state).find((rule) => rule.id === 'CL-SW-SALARY')
        ?.status,
    ).toBe('FAIL');
    expect(
      activities(atVisa(state), 'visa').map((action) => action.id),
    ).not.toContain('graduate-switch');
    const checked = doActivity(atVisa(state), 'graduate-check-offer');
    expect(checked.timeline).toEqual(state.timeline);
    expect(checked.outcome?.text?.zhCN).toContain(
      graduateSalaries.low.toLocaleString('en-GB'),
    );
    state = job(completeQuarter(state));
    expect(state.flags).toContain('graduate-negotiated');
    expect(graduateSalaryChecks(state).map((rule) => rule.status)).toEqual([
      'PASS',
      'PASS',
    ]);
    expect(
      activities(atVisa(clear(state)), 'visa').map((action) => action.id),
    ).toContain('graduate-switch');
  });
  test('the visa centre charges the sourced fee and records a continuous new permission and income', () => {
    const before = offer();
    const insufficient = {
      ...before,
      stats: { ...before.stats, money: extensionCost - 1 },
    };
    expect(
      activities(atVisa(insufficient), 'visa').map((action) => action.id),
    ).not.toContain('graduate-switch');
    const after = doActivity(atVisa(restore(before)), 'graduate-switch');
    expect(after.stats.money).toBe(before.stats.money - extensionCost);
    expect(after.flags).toContain('graduate-switched');
    expect(after.timeline.episodes.at(-1)).toMatchObject({
      route: 'SKILLED_WORKER',
      validFrom: before.date,
      salary: graduateSalaries.agreed,
      socCode: '2136',
    });
    expect(after.timeline.episodes.at(-2)!.validTo < before.date).toBe(true);
    expect(
      after.timeline.incomeYears.some(
        (year) => year.earnings === graduateSalaries.agreed,
      ),
    ).toBe(true);
    expect(after.result).toEqual(
      evaluate({
        timeline: after.timeline,
        simulationDate: after.date,
        locale: after.locale,
      }),
    );
    expect(
      activities(after, 'visa').some(
        (action) => action.id === 'graduate-switch',
      ),
    ).toBe(false);
    const switchedAtExpiry = {
      ...before,
      date: '2028-09-14',
      day: { ...before.day, date: '2028-09-14' },
    };
    expect(
      doActivity(atVisa(switchedAtExpiry), 'graduate-switch').ending,
    ).toBeUndefined();
  });
  test('doing nothing reaches actual Graduate expiry and overstay; leaving is a separate ending', () => {
    let state = newGame('graduate', 3);
    for (let q = 0; q < 7; q++) state = completeQuarter(state);
    expect(state.date).toBe('2028-06-15');
    expect(state.ending).toBeUndefined();
    state = completeQuarter(restore(state));
    expect(state.date).toBe('2028-09-15');
    expect(state.ending).toBe('overstayed');
    expect(
      state.timeline.immigrationBreaches.some(
        (breach) => breach.type === 'OVERSTAYING',
      ),
    ).toBe(true);
    expect(state.log.at(-1)?.text.zhCN).toContain('Graduate');
    const leaving = clear(newGame('graduate', 4));
    const left = doActivity(enter(leaving, 'station'), 'leave');
    expect(left.ending).toBe('left');
    expect(left.timeline.immigrationBreaches).toHaveLength(0);
    expect(fastForward(left)).toEqual(left);
  });
  test('Graduate counts for Long Residence but does not advance the Skilled Worker clock', () => {
    const state = doActivity(atVisa(offer()), 'graduate-switch');
    const values = currentLaw2026_11.values;
    const swStart = state.timeline.episodes.at(-1)!.validFrom;
    const swEligibility = new Date(`${swStart}T00:00:00Z`);
    swEligibility.setUTCFullYear(
      swEligibility.getUTCFullYear() +
        values.skilledWorkerQualifyingYears.value,
    );
    const longEligibility = new Date(
      `${graduate.timeline.episodes[0].validFrom}T00:00:00Z`,
    );
    longEligibility.setUTCFullYear(
      longEligibility.getUTCFullYear() +
        values.longResidenceQualifyingYears.value,
    );
    const timeline = structuredClone(state.timeline);
    timeline.lifeInTheUk = { passed: true };
    timeline.episodes.at(-1)!.validTo = '2040-01-01'; // Test fixture covering both assessment dates.
    for (const [date, sw, lr] of [
      ['2031-11-16', 'FAIL', 'FAIL'],
      [swEligibility.toISOString().slice(0, 10), 'PASS', 'FAIL'],
      [longEligibility.toISOString().slice(0, 10), 'PASS', 'PASS'],
    ]) {
      const result = evaluate({ simulationDate: date, timeline });
      const rules = result.byRuleSet['current-law-2026-11']!.rules;
      expect(
        rules.find((rule) => rule.id === 'CL-SW-RESIDENCE-5Y')?.status,
      ).toBe(sw);
      expect(
        rules.find((rule) => rule.id === 'CL-LR-RESIDENCE-10Y')?.status,
      ).toBe(lr);
    }
    const eligible = {
      ...state,
      date: swEligibility.toISOString().slice(0, 10),
      timeline,
    };
    eligible.result = evaluate({
      simulationDate: eligible.date,
      timeline,
      locale: eligible.locale,
    });
    const settled = doActivity(atVisa(eligible), 'settle');
    expect(settled.ending).toBe('settled');
    expect(settled.log.at(-1)?.text.zhCN).toContain('梅芙');
  });
  test('ordinary cards and the five personal scenes retain their authored volume and actual progression', () => {
    expect(
      graduate.events.filter((card) => card.id.startsWith('graduate-life-')),
    ).toHaveLength(60);
    for (const card of graduate.events) {
      expect(card.text.zhCN.length, card.id).toBeLessThanOrEqual(60);
      expect(card.text.en.trim()).not.toBe('');
    }
    let state = clear(newGame('graduate', 5));
    state.friendship.maeve = 1000;
    for (const card of graduateHeartEvents) {
      const before = state.timeline;
      const pending = talk(state, 'maeve');
      expect(currentEvent(pending)?.id).toBe(card.id);
      state = resolve(restore(pending), card.choices[0].id);
      expect(state.timeline).toEqual(before);
      expect(state.flags).toContain(card.choices[0].sets![0]);
      state = clear(completeQuarter(state));
    }
    expect(
      state.firedEvents.filter((id) => id.startsWith('heart-maeve-')),
    ).toHaveLength(5);
  });
});
