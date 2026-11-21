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
  graduateApplicationDate,
  graduateApplication,
  graduateNextStep,
  graduateSalaries,
  graduateSalaryPreview,
} from '../src/graduate-route';
import { graduate, graduateRecruitment } from '../src/characters/graduate';
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
  test('task 35: the low offer meets Option E only within the SW 12.3 total; negotiating meets Option A', () => {
    let state = offer(true);
    // One year of Graduate plus the 36-month grant is exactly 4 years on the
    // quarter's start date, which the game uses for applications and grants.
    expect(state.date).toBe('2027-09-15');
    const onTime = graduateApplication(state);
    expect(onTime.optionA.status).toBe('FAIL');
    expect(onTime.optionE.status).toBe('PASS');
    const switched = doActivity(atVisa(state), 'graduate-switch');
    expect(switched.timeline.episodes.at(-1)).toMatchObject({
      route: 'SKILLED_WORKER',
      validFrom: '2027-09-15',
      validTo: '2030-09-14',
      salary: graduateSalaries.low,
    });
    // The preview states the grant and the CoS end it is derived from.
    const preview = doActivity(atVisa(state), 'graduate-check-offer').outcome!
      .text!;
    for (const copy of [preview.zhCN, preview.en]) {
      expect(copy).toContain('2030-09-14');
      expect(copy).toContain('2030-08-31');
    }
    expect(onTime.grantedUntil).toBe('2030-09-14');
    // A quarter later, without negotiating, the total is over 4 years.
    const later = clear(completeQuarter(state));
    const late = graduateApplication(later);
    expect(late.status).toBe('FAIL');
    expect(late.optionE.explanation).toContain('SW 12.3');
    expect(
      activities(atVisa(later), 'visa').map((action) => action.id),
    ).not.toContain('graduate-switch');
    const checked = doActivity(atVisa(state), 'graduate-check-offer');
    expect(checked.timeline).toEqual(state.timeline);
    expect(checked.outcome?.text?.zhCN).toContain(
      graduateSalaries.low.toLocaleString('en-GB'),
    );
    const values = currentLaw2026_11.values;
    const salary = `£${values.skilledWorkerNewEntrantSalaryThreshold.value.toLocaleString('en-GB')}`;
    const percent = `${values.skilledWorkerNewEntrantGoingRatePercent.value}%`;
    const years = values.skilledWorkerNewEntrantMaxCombinedYears.value;
    const { zhCN, en } = checked.outcome!.text!;
    for (const value of [
      salary,
      percent,
      `${years} 年`,
      'SW 12.2(f)',
      'SW 12.3',
    ])
      expect(zhCN).toContain(value);
    for (const value of [
      salary,
      percent,
      `${years} years`,
      'SW 12.2(f)',
      'SW 12.3',
    ])
      expect(en).toContain(value);
    state = job(completeQuarter(state));
    expect(state.flags).toContain('graduate-negotiated');
    expect(graduateApplication(state).optionA.status).toBe('PASS');
    expect(
      activities(atVisa(clear(state)), 'visa').map((action) => action.id),
    ).toContain('graduate-switch');
  });
  test('A7#5 the £44,200 offer preview cites switch rules and states the weekly hours in both languages', () => {
    const before = atVisa(offer());
    const after = doActivity(before, 'graduate-check-offer');
    const { zhCN, en } = after.outcome!.text!;
    for (const copy of [zhCN, en]) {
      expect(copy).toContain('£44,200');
      expect(copy).toContain('SRC-004');
      expect(copy).toContain('SW 4.2 Option A');
      expect(copy).toContain('SRC-017');
      expect(copy).toContain('Table 1');
      expect(copy).not.toContain('SW 24.3');
    }
    expect(zhCN).toContain('每周 37.5 小时');
    expect(en).toContain('37.5-hour week');
    expect(after.timeline).toEqual(before.timeline);
    expect(activities(after, 'visa').map((action) => action.id)).toContain(
      'graduate-switch',
    );
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
  test('playtest #7: the job search shows its progress and next step until the switch', () => {
    const start = newGame('graduate', 17);
    expect(graduateNextStep(start)?.zhCN).toContain('还没投递');
    const ready = offer();
    expect(ready.flags).toContain('graduate-cos-ready');
    expect(graduateNextStep(ready)?.en).toContain('CoS received');
    for (const step of [
      ['graduate-applied', '已投递'],
      ['graduate-interviewed', '面试已完成'],
      ['graduate-sponsor-confirmed', '雇主同意担保'],
      ['graduate-offer-reviewed', 'Certificate of Sponsorship'],
    ] as const)
      expect(
        graduateNextStep({ ...start, flags: [...start.flags, step[0]] })?.zhCN,
      ).toContain(step[1]);
    const switched = doActivity(atVisa(ready), 'graduate-switch');
    expect(graduateNextStep(switched)).toBeUndefined();
    // review40-1 #3: after today's job search, wait for next quarter's workday.
    const applied = job(start);
    expect(applied.day.done).toContain('graduate-job-search');
    expect(graduateNextStep(applied)?.zhCN).toContain('下一季的工作日');
    expect(graduateNextStep(applied)?.en).toContain("next quarter's workday");
    expect(graduateNextStep(start)?.zhCN).not.toContain('下一季');
  });

  test('playtest #8: the offer check gives the verdicts before the premise', () => {
    const preview = graduateSalaryPreview({ ...offer(), locale: 'zh-CN' });
    expect(preview.startsWith('标准档')).toBe(true);
    expect(preview.split('\n')[1]).toMatch(/^新入职者档/);
  });

  test('playtest #9 and P2: after the switch, job-hunting cards stop and an overstay ends without the Graduate advice', () => {
    const switched = doActivity(atVisa(offer()), 'graduate-switch');
    const hunting = graduate.events.filter((event) =>
      event.forbids?.includes('graduate-switched'),
    );
    expect(hunting.map((event) => event.id)).toContain(
      'graduate-life-cover-letter',
    );
    let state = switched;
    while (!state.ending && state.year < 9)
      state = completeQuarter(clear(state));
    expect(state.ending).toBe('overstayed');
    expect(state.log.at(-1)?.text.zhCN).not.toContain('Graduate');
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
