import { expect, test, vi } from 'vitest';
import * as engine from '@uk-immigration/engine';
import {
  activePersonDraft,
  createDraft,
  draftReducer,
  runSimulation,
  shortCircuitKeys,
  stepSequence,
  taxYearsBefore,
  validateStep,
  visibleIncomeYears,
} from '../lib/questionnaire';
import { draftStorage } from '../lib/storage';
import { en } from '../i18n/en';
import { zhCN } from '../i18n/zh-CN';

test.each(['MAIN', 'DEPENDANT'] as const)(
  'restoring completed %s inputs opens the last applicant step and can go back',
  (role) => {
    const saved = createDraft();
    saved.completed = true;
    saved.step = 1;
    saved.principalStep = 3;
    saved.timeline.episodes = [
      {
        route: 'SKILLED_WORKER',
        role,
        validFrom: '2020-01-01',
        validTo: '2099-01-01',
      },
    ];
    saved.timeline.nationality = 'CHN';
    saved.principal = createDraft().timeline;
    const restored = draftReducer(createDraft(), {
      type: 'restore',
      draft: saved,
    });
    const sequence = stepSequence(restored);
    expect(restored.step).toBe(sequence.at(-1));
    expect(restored.step).toBe(8);
    expect(restored.principalStep).toBeUndefined();
    expect(restored.principal).toEqual(saved.principal);
    expect(
      draftReducer(restored, { type: 'step', step: sequence.at(-2)! }).step,
    ).toBe(7);
    expect(saved.step).toBe(1);
  },
);

test('review49-2 #2: a completed draft with a code off the list reopens that person’s basic details', () => {
  const saved = { ...createDraft(), completed: true, step: 8 };
  saved.timeline.dateOfBirth = '1990-01-01';
  saved.timeline.nationality = 'DDR';
  const own = draftReducer(createDraft(), { type: 'restore', draft: saved });
  expect(own).toMatchObject({ step: 0, completed: false });
  expect(validateStep(own).nationality).toBe('error.nationality');

  saved.timeline.nationality = 'DEU';
  saved.timeline.episodes = [
    {
      route: 'SKILLED_WORKER',
      role: 'DEPENDANT',
      dependantOf: 'PARTNER',
      validFrom: '2020-01-01',
      validTo: '2099-01-01',
    },
  ];
  saved.principal = { ...createDraft().timeline, nationality: 'DDR' };
  saved.principalCompleted = true;
  const principal = draftReducer(createDraft(), {
    type: 'restore',
    draft: saved,
  });
  expect(principal).toMatchObject({
    step: 9,
    principalStep: 0,
    completed: false,
  });
  expect(validateStep(activePersonDraft(principal)).nationality).toBe(
    'error.nationality',
  );
  // review49-3 #1: returning without finishing the principal's steps keeps
  // the principal unfinished, so the final step sends the user back.
  expect(principal.principalCompleted).toBe(false);
  expect(
    draftReducer(principal, { type: 'principal-return' }).principalCompleted,
  ).toBe(false);
  // A shared draft may mark the principal done without any details.
  const missing = draftReducer(createDraft(), {
    type: 'restore',
    draft: { ...saved, principal: undefined },
  });
  expect(missing).toMatchObject({ step: 9, principalCompleted: false });
  expect(missing.principalStep).toBeUndefined();
  expect(zhCN['error.nationality']).toContain('名单');
  expect(en['error.nationality']).toContain('from the list');
});

test('an unfinished draft resumes its applicant or principal step', () => {
  const draft = { ...createDraft(), step: 9, principalStep: 4 };
  expect(draftReducer(createDraft(), { type: 'restore', draft })).toEqual(
    draft,
  );
});

test('normal submission sends the entered timeline and selected income window to evaluate', () => {
  const draft = draftReducer(createDraft(), {
    type: 'date',
    date: '2026-11-04',
  });
  draft.screening = {
    criminality: 'no',
    breach: 'no',
    debt: 'no',
    protection: 'no',
  };
  draft.timeline.dateOfBirth = '1991-08-19';
  draft.timeline.nationality = 'CHN';
  draft.timeline.episodes = [
    {
      route: 'SKILLED_WORKER',
      role: 'MAIN',
      validFrom: '2021-06-01',
      validTo: '2027-06-01',
      salary: 61234.56,
    },
  ];
  draft.timeline.incomeYears = [
    { taxYear: '2025-26', earnings: 0 },
    { taxYear: '2010-11', earnings: 1 },
  ];
  const evaluate = vi.spyOn(engine, 'evaluate');
  runSimulation(draft);
  expect(evaluate).toHaveBeenCalledExactlyOnceWith({
    locale: 'zh-CN',
    ruleSetIds: ['current-law-2026-11', 'earned-settlement-2026-11'],
    simulationDate: '2026-11-04',
    timeline: {
      ...draft.timeline,
      incomeYears: [
        { taxYear: '2025-26', earnings: 0 },
        { taxYear: '2024-25' },
        { taxYear: '2023-24' },
        { taxYear: '2022-23' },
        { taxYear: '2021-22' },
        { taxYear: '2020-21' },
        { taxYear: '2019-20' },
      ],
      governmentDebt: { outstanding: false },
    },
  });
  evaluate.mockRestore();
});

test('tax year window uses completed years on either side of 6 April', () => {
  expect(taxYearsBefore('2026-04-05')).toEqual([
    '2024-25',
    '2023-24',
    '2022-23',
    '2021-22',
    '2020-21',
    '2019-20',
    '2018-19',
  ]);
  expect(taxYearsBefore('2026-04-06')).toEqual([
    '2025-26',
    '2024-25',
    '2023-24',
    '2022-23',
    '2021-22',
    '2020-21',
    '2019-20',
  ]);
});

test('changing simulation date preserves entered income; blanks and zero remain distinct', () => {
  let draft = draftReducer(createDraft(), { type: 'date', date: '2026-11-04' });
  draft = draftReducer(draft, {
    type: 'timeline',
    patch: {
      incomeYears: [
        { taxYear: '2025-26', earnings: 0, partnerEarnings: 20000 },
      ],
    },
  });
  draft = draftReducer(draft, { type: 'date', date: '2027-04-06' });
  expect(visibleIncomeYears(draft)[0]).toEqual({ taxYear: '2026-27' });
  expect(visibleIncomeYears(draft)[1]).toEqual({
    taxYear: '2025-26',
    earnings: 0,
    partnerEarnings: 20000,
  });
  draft = draftReducer(draft, { type: 'date', date: '2026-11-04' });
  expect(visibleIncomeYears(draft)[0].earnings).toBe(0);
});

test.each(shortCircuitKeys)(
  'a yes to %s short-circuits without inventing event details',
  (key) => {
    const draft = draftReducer(createDraft(), {
      type: 'screening',
      key,
      answer: 'yes',
    });
    expect(runSimulation(draft).shortCircuit?.message).toBeTruthy();
    expect(runSimulation(draft).byRuleSet).toEqual({});
    expect(draft.timeline.criminalRecord).toEqual([]);
    expect(draft.timeline.immigrationBreaches).toEqual([]);
    expect(draft.timeline.episodes).toEqual([]);
  },
);

test.each(['yes', 'no'] as const)(
  'A4#6b government debt = %s reaches the engine with the existing questionnaire fields',
  (debt) => {
    const draft = draftReducer(createDraft(), {
      type: 'date',
      date: '2026-11-04',
    });
    draft.screening = {
      criminality: 'no',
      breach: 'no',
      protection: 'no',
      debt,
    };
    draft.timeline = {
      ...draft.timeline,
      dateOfBirth: '1991-08-19',
      nationality: 'CHN',
      episodes: [
        {
          route: 'SKILLED_WORKER',
          role: 'MAIN',
          validFrom: '2025-01-01',
          validTo: '2031-01-01',
          salary: 55000,
        },
      ],
      incomeYears: visibleIncomeYears(draft).map((row) => ({
        ...row,
        earnings: 55000,
      })),
      english: { cefrLevel: 'B2' },
      lifeInTheUk: { passed: true },
    };
    const result = runSimulation(draft);
    expect(result.shortCircuit).toBeUndefined();
    expect(result.byRuleSet['current-law-2026-11']).toMatchObject({
      pathwayYears: 5,
      earliestDate: '2029-12-04',
    });
    const earned = result.byRuleSet['earned-settlement-2026-11'];
    expect(earned).toMatchObject({
      outcome: 'LIKELY_NOT_ELIGIBLE',
      routeGroup: 'CORE_PERMISSION',
      pathwayYears: 5,
      earliestDate: '2030-01-01',
    });
    const debtRule = earned?.rules.find((rule) => rule.id === 'ES-DEBT');
    if (debt === 'yes') {
      expect(debtRule).toMatchObject({
        status: 'UNKNOWN',
        pendingDetails: ['PD-018'],
      });
    } else {
      expect(debtRule?.status).toBe('PASS');
    }
  },
);

test('Visit retains the engine route failure without inventing an OUTSIDE_FRAMEWORK short circuit', () => {
  const draft = createDraft();
  draft.simulationDate = '2026-11-04';
  draft.timeline.dateOfBirth = '1991-08-19';
  draft.timeline.episodes = [
    {
      route: 'VISIT',
      role: 'MAIN',
      validFrom: '2026-10-01',
      validTo: '2027-03-01',
    },
  ];
  const result = runSimulation(draft);
  expect(result.shortCircuit).toBeUndefined();
  expect(result.byRuleSet['current-law-2026-11']).toMatchObject({
    outcome: 'INSUFFICIENT_INFORMATION',
    rules: [expect.objectContaining({ id: 'CL-SCOPE' })],
  });
  const earned = result.byRuleSet['earned-settlement-2026-11'];
  expect(earned?.outcome).toBe('LIKELY_NOT_ELIGIBLE');
  expect(
    earned?.rules.find((rule) => rule.id === 'ES-ROUTE-GROUP')?.status,
  ).toBe('FAIL');
});

test('field validation rejects missing screening, reversed dates and invalid amounts', () => {
  const draft = createDraft();
  expect(validateStep(draft)).toHaveProperty('dob');
  draft.step = 1;
  expect(Object.keys(validateStep(draft))).toHaveLength(3);
  draft.step = 2;
  draft.timeline.episodes = [
    {
      route: 'SKILLED_WORKER',
      role: 'MAIN',
      validFrom: '2026-02-28',
      validTo: '2026-02-27',
      salary: -1,
      socCode: '123',
    },
  ];
  expect(Object.keys(validateStep(draft))).toEqual([
    'episode-0-to',
    'episode-0-soc',
    'episode-0-salary',
  ]);
  draft.timeline.episodes[0] = {
    ...draft.timeline.episodes[0],
    validTo: '2027-02-28',
    salary: 0,
    socCode: undefined,
  };
  expect(validateStep(draft)).toEqual({});
});

test('draft round trip retains inputs and unavailable storage retains in-memory draft', () => {
  const stored = new Map<string, string>();
  vi.stubGlobal('localStorage', {
    setItem: (key: string, value: string) => stored.set(key, value),
    getItem: (key: string) => stored.get(key) ?? null,
  });
  const draft = createDraft();
  draft.timeline.nationality = 'CHN';
  draft.step = 4;
  expect(draftStorage(draft).available).toBe(true);
  expect(draftStorage().draft).toEqual(draft);
  vi.stubGlobal('localStorage', {
    setItem: () => {
      throw new Error('unavailable');
    },
    getItem: () => {
      throw new Error('unavailable');
    },
  });
  draft.timeline.nationality = 'IND';
  expect(draftStorage(draft)).toEqual({ draft, available: false });
  expect(draftStorage().draft?.timeline.nationality).toBe('IND');
  vi.unstubAllGlobals();
});

test.each([true, false, undefined])(
  'the applicant Skilled Worker ISL = %s is preserved in the engine request',
  (immigrationSalaryList) => {
    const original = createDraft();
    const draft = draftReducer(original, {
      type: 'timeline',
      patch: {
        episodes: [
          {
            route: 'SKILLED_WORKER',
            role: 'MAIN',
            validFrom: '2021-04-06',
            validTo: '2027-04-05',
            immigrationSalaryList,
          },
        ],
      },
    });
    const evaluate = vi.spyOn(engine, 'evaluate');
    try {
      runSimulation(draft, 'en');
      expect(evaluate).toHaveBeenLastCalledWith(
        expect.objectContaining({
          locale: 'en',
          timeline: expect.objectContaining({
            episodes: draft.timeline.episodes,
          }),
        }),
      );
      expect(draft.timeline.episodes[0].immigrationSalaryList).toBe(
        immigrationSalaryList,
      );
      expect(original.timeline.episodes).toEqual([]);
    } finally {
      evaluate.mockRestore();
    }
  },
);

test('task 49: questionnaire hints explain the ISL, the applicant role, public funds and the income years', () => {
  for (const dict of [zhCN, en]) {
    expect(dict['episodes.immigrationSalaryListLink']).toContain(
      'Appendix Immigration Salary List',
    );
    expect(dict['episodes.immigrationSalaryListHint']).toContain('SOC');
    expect(dict['episodes.roleHint']).toBeTruthy();
    expect(dict['benefits.hint']).toContain('Statutory Maternity Pay');
    expect(dict['income.simulationDate']).toContain('{date}');
    expect(dict['income.copyAbove']).toContain('{year}');
  }
});
