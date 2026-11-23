import { describe, expect, test } from 'vitest';
import { evaluateGermanyFull, type DeFullRequest } from '../src/germany-full';
import {
  blueCardTimeInputs,
  mobilityChecks,
  retainedTitle,
} from '../src/germany-mobility';
import type { DeMobilityAnswers } from '../src/germany-mobility';

const day = '2026-11-23';
const request = (
  mobility: DeMobilityAnswers,
  simulationDate = day,
): DeFullRequest => ({ simulationDate, mobility });
type Blue = NonNullable<DeMobilityAnswers['blueCard']>;
type Freedom = NonNullable<DeMobilityAnswers['freedom']>;
type Title = NonNullable<DeMobilityAnswers['titles']>[number];
type Trip = NonNullable<Title['trips']>[number];
const status = (route: string, id: string, req: DeFullRequest) =>
  mobilityChecks(route, req).find((c) => c.id === 'DE-' + id)?.status;
const blue = (id: string, fields: Blue, date = day) =>
  status('R03', id, request({ blueCard: fields }, date));
const free = (id: string, fields: Freedom, date = day) =>
  status('R18', id, request({ freedom: fields }, date));
const active: Blue = {
  cardHeldAtDecision: true,
  fastTrack: true,
  language: 'B1',
  genuineEmployment: true,
  jobInGermanyMatchesQualification: true,
  requiredLicencesHeld: true,
  noExclusionUnder19f: true,
  contractMonths: 6,
  qualification: 'academic',
  recognisedQualification: true,
  isco: '2411',
  jobChangeDecision: 'clear',
  renewal: false,
  applicationOn: day,
  degreeOn: '2015-01-01',
  employmentAgencyApproved: false,
  countableAnnualGross: 50700,
};

const fullBlue = (overrides: Partial<Blue>, simulationDate = day) =>
  evaluateGermanyFull({
    simulationDate,
    routes: ['R03'],
    firstEntry: '2024-08-01',
    permits: [{ kind: 'blue-card', from: '2024-08-01' }],
    trips: [],
    common: {
      identityEstablished: true,
      nationalityEstablishedOrNotRequired: true,
      capableOrRepresented: true,
      passport: 'valid',
      entry: 'required-visa-and-disclosed',
      livelihoodConfirmed: true,
      insurance: ['statutory'],
      security: 'no-known-ground',
      employmentAuthorisedOrNotRequired: true,
      permanentProfessionalPermissionOrNotRequired: true,
      knowledgeEvidence: 'school',
      housing: { authorityAccepted: true },
    },
    mobility: { blueCard: { ...active, ...overrides } },
  }).columns[0].pathways[0];

const employment = {
  firstMonth: '2025-01',
  lastMonth: '2025-10',
  payBand: 'standard' as const,
  countableAnnualGross: 51000,
  qualifyingWork: true,
  pensionForSameMonths: true,
};

describe('Blue Card employment and pay, § 18c(2), § 18g', () => {
  test('current card and language are independent of pay and months', () => {
    expect(blue('C19', active)).toBe('MET');
    expect(blue('C19', { ...active, cardHeldAtDecision: false })).toBe(
      'NOT_MET',
    );
    expect(blue('C20', active)).toBe('MET');
    expect(blue('C20', { ...active, language: 'A2' })).toBe('NOT_MET');
    expect(blue('C20', { fastTrack: false, language: 'A1' })).toBe('MET');
    expect(
      blue('C20', {
        fastTrack: true,
        language: 'A1',
        languageWaiverAcceptedForTier: true,
      }),
    ).toBe('MET');
    expect(blue('C20', {})).toBe('UNKNOWN');
  });

  test('reuse permit history, declared title and common language evidence; an unresolved tier is not a failure', () => {
    const history: DeFullRequest = {
      simulationDate: day,
      permits: [{ kind: 'blue-card', from: '2024-01-01' }],
      common: { provenGerman: 'B1' },
      blueCardEmploymentMonths: 21,
    };
    expect(status('R03', 'C19', history)).toBe('MET');
    expect(status('R03', 'C20', history)).toBe('MET');
    expect(status('R03', 'C19-months', history)).toBe('MET');
    expect(status('R03', 'C19-months', { ...history, common: undefined })).toBe(
      'UNKNOWN',
    );
    expect(
      status('R03', 'C19', {
        ...history,
        permits: undefined,
        citizenship: { currentTitle: 'blue-card' },
      }),
    ).toBe('MET');
    expect(
      status('R03', 'C19', {
        ...history,
        permits: [{ kind: 'blue-card', from: '2024-01-01', to: '2025-12-31' }],
      }),
    ).toBe('NOT_MET');
    expect(
      status('R03', 'C19', {
        ...history,
        permits: [
          {
            kind: 'blue-card',
            from: '2024-01-01',
            to: '2025-12-31',
            renewing: true,
          },
        ],
      }),
    ).toBe('UNKNOWN');
  });

  test('credit across a real gap needs a decision if that changes the result', () => {
    const a = {
      firstMonth: '2024-01',
      lastMonth: '2024-12',
      payBand: 'standard' as const,
      countableAnnualGross: 51000,
      qualifyingWork: true,
      pensionForSameMonths: true,
    };
    const b = { ...a, firstMonth: '2025-02', lastMonth: '2025-10' };
    expect(
      blue('C19-months', {
        ...active,
        employment: [a, b],
        creditBeforeInterruption: true,
      }),
    ).toBe('UNKNOWN');
    const fields = {
      ...active,
      employment: [
        { ...a, startedOn: '2024-01-01', endedOn: '2024-12-31' },
        { ...b, startedOn: '2025-02-01', endedOn: '2025-10-31' },
      ],
    };
    expect(blue('C19-months', fields)).toBe('UNKNOWN');
    expect(
      blue('C19-months', { ...fields, creditBeforeInterruption: false }),
    ).toBe('NOT_MET');
    expect(
      blue('C19-months', { ...fields, creditBeforeInterruption: true }),
    ).toBe('MET');
  });

  test('explicit and omitted unemployment have the same result for each pre-gap credit decision', () => {
    const gap = {
      ...employment,
      firstMonth: '2025-11',
      lastMonth: '2025-11',
      qualifyingWork: false,
      pensionForSameMonths: false,
    };
    const resumed = {
      ...employment,
      firstMonth: '2025-12',
      lastMonth: '2026-10',
    };
    const first = {
      ...employment,
      startedOn: '2025-01-01',
      endedOn: '2025-10-31',
    };
    for (const periods of [
      [first, gap, resumed],
      [first, resumed],
    ]) {
      const cases = [
        [undefined, 'UNKNOWN', 'UNKNOWN', undefined],
        [false, 'NOT_MET', 'FUTURE', '2027-09-23'],
        [true, 'MET', 'MET', day],
      ] as const;
      for (const [
        creditBeforeInterruption,
        status,
        routeStatus,
        date,
      ] of cases) {
        const path = fullBlue({
          employment: periods,
          latestRelevantChangeOn: '2025-12-23',
          creditBeforeInterruption,
        });
        const check = path.checks.find((c) => c.id === 'DE-C19-months');
        expect(check?.status).toBe(status);
        expect(path.status).toBe(routeStatus);
        expect(path.earliestDate).toBe(date);
        if (status === 'UNKNOWN')
          expect(check?.pendingDetails).toContain('PD-123');
      }
    }
    const postGap = fullBlue({
      latestRelevantChangeOn: '2025-02-23',
      employment: [
        { ...employment, firstMonth: '2024-12', lastMonth: '2024-12' },
        { ...gap, firstMonth: '2025-01', lastMonth: '2025-01' },
        { ...employment, firstMonth: '2025-02', lastMonth: '2026-10' },
      ],
    });
    expect(postGap).toMatchObject({ status: 'MET', earliestDate: day });
  });

  test('a temporary annual-floor shortfall is credited after a raise when decision pay qualifies', () => {
    const first = {
      ...employment,
      firstMonth: '2024-12',
      lastMonth: '2025-04',
      endedOn: '2025-04-30',
      countableAnnualGross: 46000,
    };
    const raised = {
      ...employment,
      firstMonth: '2025-05',
      startedOn: '2025-05-01',
      lastMonth: '2026-10',
    };
    for (const historicalPayAccepted of [undefined, true]) {
      const path = fullBlue({
        employment: [{ ...first, historicalPayAccepted }, raised],
        employmentStartedOn: '2024-12-01',
        countableAnnualGross: 51000,
      });
      expect(path.checks.find((c) => c.id === 'DE-C19-months')).toMatchObject({
        status: 'MET',
        explanation: expect.stringContaining('已确认 23 月'),
      });
      expect(path).toMatchObject({ status: 'MET', earliestDate: day });
    }
    for (const incomplete of [
      { countableAnnualGross: undefined },
      { latestRelevantChangeOn: '2025-01-01' },
      { latestRelevantChangeOn: '2025-05-01' },
      { employment: [first, { ...raised, countableAnnualGross: undefined }] },
    ]) {
      const path = fullBlue({ employment: [first, raised], ...incomplete });
      expect(path.checks.find((c) => c.id === 'DE-C19-months')).toMatchObject({
        status: 'UNKNOWN',
        pendingDetails: expect.arrayContaining(['PD-350']),
      });
      expect(path.status).toBe('UNKNOWN');
      expect(path.earliestDate).toBeUndefined();
    }
    const payCut = fullBlue({
      employment: [
        { ...first, lastMonth: '2024-12', countableAnnualGross: 51000 },
        { ...first, firstMonth: '2025-01' },
        raised,
      ],
    });
    expect(payCut.checks.find((c) => c.id === 'DE-C19-months')?.status).toBe(
      'NOT_MET',
    );
    expect(payCut.status).toBe('NOT_MET');
    expect(payCut.earliestDate).toBeUndefined();
  });

  test('an unchanged qualifying job needs no change decision; an applicable unresolved change still does', () => {
    const sameJob = {
      employmentStartedOn: '2025-02-01',
      employment: [
        { ...employment, firstMonth: '2025-02', lastMonth: '2026-10' },
      ],
      jobChangeDecision: undefined,
    };
    const unchanged = fullBlue(sameJob);
    expect(unchanged.checks.find((c) => c.id === 'DE-C21-job')?.status).toBe(
      'MET',
    );
    expect(unchanged).toMatchObject({ status: 'MET', earliestDate: day });
    const changed = { ...sameJob, latestRelevantChangeOn: '2025-12-01' };
    const pending = fullBlue(changed);
    expect(pending.checks.find((c) => c.id === 'DE-C21-job')).toMatchObject({
      status: 'UNKNOWN',
      pendingDetails: ['PD-346'],
    });
    expect(pending.status).toBe('UNKNOWN');
    expect(pending.earliestDate).toBeUndefined();
    expect(fullBlue({ ...changed, jobChangeDecision: 'rejected' }).status).toBe(
      'NOT_MET',
    );
    expect(fullBlue({ ...changed, jobChangeDecision: 'clear' }).status).toBe(
      'MET',
    );
    expect(
      fullBlue({ ...changed, latestRelevantChangeOn: '2026-02-01' }).status,
    ).toBe('MET');
  });

  test.each([
    {
      start: '2025-02-24',
      periods: [{ ...employment, firstMonth: '2025-02', lastMonth: '2026-10' }],
      before: '2026-11-10',
      eve: '2026-11-23',
      due: '2026-11-24',
    },
    {
      start: '2024-12-24',
      periods: [
        {
          ...employment,
          firstMonth: '2024-12',
          lastMonth: '2025-04',
          endedOn: '2025-04-30',
          countableAnnualGross: 46000,
        },
        {
          ...employment,
          firstMonth: '2025-05',
          startedOn: '2025-05-01',
          lastMonth: '2026-08',
        },
      ],
      before: '2026-09-10',
      eve: '2026-09-23',
      due: '2026-09-24',
    },
  ])(
    'continuous employment starting on $start matures on $due',
    ({ start, periods, before, eve, due }) => {
      for (const date of [before, eve, due]) {
        const path = fullBlue(
          {
            employmentStartedOn: start,
            employment: periods,
            countableAnnualGross: 51000,
          },
          date,
        );
        expect(path.checks.find((c) => c.id === 'DE-C19-months')).toMatchObject(
          {
            status: date < due ? 'NOT_MET' : 'MET',
            explanation: expect.stringContaining(
              date < due ? '已确认 20 月' : '已确认 21 月',
            ),
          },
        );
        expect(path).toMatchObject({
          status: date < due ? 'FUTURE' : 'MET',
          earliestDate: due,
        });
      }
    },
  );

  test.each([
    ['2026-10-24', '2026-09', 20, 'NOT_MET', 'FUTURE'],
    ['2026-11-01', '2026-10', 20, 'NOT_MET', 'FUTURE'],
    ['2026-11-23', '2026-10', 20, 'NOT_MET', 'FUTURE'],
    ['2026-11-24', '2026-10', 21, 'MET', 'MET'],
  ] as const)(
    'a job resumed mid-month accrues from its actual start on %s',
    (date, lastMonth, count, status, routeStatus) => {
      const previous = {
        ...employment,
        firstMonth: '2024-08',
        lastMonth: '2024-12',
      };
      const resumed = { ...employment, firstMonth: '2025-02', lastMonth };
      const unemployment = {
        ...employment,
        firstMonth: '2025-01',
        lastMonth: '2025-01',
        qualifyingWork: false,
      };
      for (const periods of [
        [previous, resumed],
        [previous, unemployment, resumed],
      ]) {
        const path = fullBlue(
          {
            employmentStartedOn: '2024-08-01',
            latestRelevantChangeOn: '2025-02-24',
            changeReported: true,
            jobChangeDecision: undefined,
            creditBeforeInterruption: false,
            employment: periods,
          },
          date,
        );
        expect(path.checks.find((c) => c.id === 'DE-C19-months')).toMatchObject(
          {
            status,
            explanation: expect.stringContaining(`已确认 ${count} 月`),
          },
        );
        expect(path.status).toBe(routeStatus);
        expect(path.earliestDate).toBe('2026-11-24');
      }
    },
  );

  test('actual dates on adjacent payroll months preserve the interruption', () => {
    const first = {
      ...employment,
      firstMonth: '2025-02',
      lastMonth: '2025-12',
      startedOn: '2025-02-01',
      endedOn: '2025-12-15',
    };
    const second = {
      ...employment,
      firstMonth: '2026-01',
      lastMonth: '2026-10',
      startedOn: '2026-01-15',
    };
    for (const [creditBeforeInterruption, routeStatus, due] of [
      [false, 'FUTURE', '2027-10-15'],
      [true, 'FUTURE', '2026-11-23'],
      [undefined, 'NOT_MET', undefined],
    ] as const) {
      const path = fullBlue(
        {
          employmentStartedOn: first.startedOn,
          latestRelevantChangeOn: second.startedOn,
          changeReported: true,
          creditBeforeInterruption,
          employment: [first, second],
        },
        '2026-11-01',
      );
      expect(path.checks.find((c) => c.id === 'DE-C19-months')?.status).toBe(
        'NOT_MET',
      );
      expect(path.status).toBe(routeStatus);
      expect(path.earliestDate).toBe(due);
    }
    for (const [date, checkStatus, routeStatus] of [
      ['2026-11-22', 'NOT_MET', 'FUTURE'],
      ['2026-11-23', 'MET', 'MET'],
    ] as const) {
      const path = fullBlue(
        { creditBeforeInterruption: true, employment: [first, second] },
        date,
      );
      expect(path.checks.find((c) => c.id === 'DE-C19-months')?.status).toBe(
        checkStatus,
      );
      expect(path.status).toBe(routeStatus);
      expect(path.earliestDate).toBe('2026-11-23');
    }
  });

  test('middle jobs, overlaps and same-month restarts use their own dates', () => {
    const first = {
      ...employment,
      firstMonth: '2024-08',
      lastMonth: '2025-04',
      startedOn: '2024-08-01',
      endedOn: '2025-04-09',
    };
    const middle = {
      ...employment,
      firstMonth: '2025-04',
      lastMonth: '2025-06',
      startedOn: '2025-04-13',
      endedOn: '2025-06-16',
    };
    const last = {
      ...employment,
      firstMonth: '2025-06',
      lastMonth: '2026-10',
      startedOn: '2025-06-13',
    };
    const path = fullBlue({
      employment: [last, middle, first, middle],
      creditBeforeInterruption: false,
    });
    expect(path.checks.find((c) => c.id === 'DE-C19-months')?.status).toBe(
      'NOT_MET',
    );
    expect(path.status).toBe('FUTURE');
    expect(path.earliestDate).toBe('2027-01-13');

    const possibleGap = fullBlue({
      employment: [{ ...first, endedOn: undefined }, middle, last],
      creditBeforeInterruption: false,
    });
    expect(
      possibleGap.checks.find((c) => c.id === 'DE-C19-months')?.status,
    ).toBe('UNKNOWN');
    expect(possibleGap.status).toBe('UNKNOWN');
    expect(possibleGap.earliestDate).toBeUndefined();
  });

  test('the last payroll month can belong to both a departing and a new worker record', () => {
    const path = fullBlue(
      {
        creditBeforeInterruption: false,
        employment: [
          {
            ...employment,
            firstMonth: '2025-01',
            lastMonth: '2026-10',
            startedOn: '2025-01-01',
          },
          {
            ...employment,
            firstMonth: '2026-10',
            lastMonth: '2026-10',
            startedOn: '2026-10-20',
          },
        ],
      },
      '2026-11-01',
    );
    expect(path.checks.find((c) => c.id === 'DE-C19-months')?.status).toBe(
      'UNKNOWN',
    );
    expect(path.status).toBe('UNKNOWN');
    expect(path.earliestDate).toBeUndefined();
  });

  test('a documented interruption prevents a new salary from curing the previous job’s shortfall', () => {
    const path = fullBlue({
      creditBeforeInterruption: true,
      employment: [
        {
          ...employment,
          firstMonth: '2024-12',
          lastMonth: '2025-04',
          startedOn: '2024-12-01',
          endedOn: '2025-04-12',
          countableAnnualGross: 46000,
        },
        {
          ...employment,
          firstMonth: '2025-05',
          lastMonth: '2026-10',
          startedOn: '2025-05-12',
        },
      ],
    });
    expect(path.checks.find((c) => c.id === 'DE-C19-months')?.status).toBe(
      'NOT_MET',
    );
    expect(path.status).toBe('FUTURE');
    expect(path.earliestDate).toBe('2027-01-01');
  });

  test('an unconfirmed short break can change which calendar rule applies', () => {
    const path = fullBlue(
      {
        creditBeforeInterruption: true,
        employment: [
          {
            ...employment,
            firstMonth: '2025-02',
            startedOn: '2025-02-24',
            lastMonth: '2025-08',
          },
          {
            ...employment,
            firstMonth: '2025-08',
            startedOn: '2025-08-04',
            lastMonth: '2026-10',
          },
        ],
      },
      '2026-11-20',
    );
    expect(path.checks.find((c) => c.id === 'DE-C19-months')).toMatchObject({
      status: 'UNKNOWN',
      pendingDetails: expect.arrayContaining(['PD-350']),
    });
    expect(path.status).toBe('UNKNOWN');
    expect(path.earliestDate).toBeUndefined();
  });

  test('an explicit final day limits both accrued work and its projection', () => {
    const period = {
      ...employment,
      firstMonth: '2025-02',
      lastMonth: '2026-11',
      startedOn: '2025-02-24',
      endedOn: '2026-11-12',
    };
    for (const simulationDate of ['2026-11-01', '2026-11-24']) {
      const path = fullBlue({ employment: [period] }, simulationDate);
      expect(path.checks.find((c) => c.id === 'DE-C19-months')?.status).toBe(
        'NOT_MET',
      );
      expect(path.status).toBe('NOT_MET');
      expect(path.earliestDate).toBeUndefined();
    }
  });

  test('a month without the qualifying start day gives bounds, not a precise anniversary', () => {
    const previous = {
      ...employment,
      firstMonth: '2024-08',
      lastMonth: '2024-12',
    };
    const resumed = {
      ...employment,
      firstMonth: '2025-02',
      lastMonth: '2026-10',
    };
    for (const fields of [
      { employment: [resumed] },
      { employment: [previous, resumed], employmentStartedOn: '2024-08-01' },
      {
        employment: [
          {
            ...employment,
            firstMonth: '2025-01',
            lastMonth: '2025-01',
            pensionForSameMonths: false,
          },
          resumed,
        ],
        employmentStartedOn: '2025-01-24',
      },
    ]) {
      const path = fullBlue(
        { ...fields, creditBeforeInterruption: false },
        '2026-11-01',
      );
      expect(path.checks.find((c) => c.id === 'DE-C19-months')).toMatchObject({
        status: 'UNKNOWN',
        pendingDetails: expect.arrayContaining(['PD-350']),
        explanation: expect.stringContaining(
          '已确认 20 月，计入待核月份后至多 21 月',
        ),
      });
      expect(path.status).toBe('UNKNOWN');
      expect(path.earliestDate).toBeUndefined();
      const mature = fullBlue(
        { ...fields, creditBeforeInterruption: false },
        '2026-11-28',
      );
      expect(mature.checks.find((c) => c.id === 'DE-C19-months')?.status).toBe(
        'MET',
      );
      expect(mature).toMatchObject({
        status: 'MET',
        earliestDate: '2026-11-28',
      });
    }
    const before = fullBlue(
      {
        employmentStartedOn: '2024-08-01',
        creditBeforeInterruption: false,
        employment: [previous, { ...resumed, lastMonth: '2026-09' }],
      },
      '2026-10-31',
    );
    expect(before.checks.find((c) => c.id === 'DE-C19-months')?.status).toBe(
      'NOT_MET',
    );
    expect(before.status).toBe('NOT_MET');
    expect(before.earliestDate).toBeUndefined();
  });

  test('a reported change after qualifying work began needs no clearance once the suspension window has closed', () => {
    const change = {
      employmentStartedOn: '2025-02-01',
      latestRelevantChangeOn: '2025-08-01',
      changeReported: true,
      employment: [
        {
          ...employment,
          firstMonth: '2025-02',
          lastMonth: '2025-07',
          endedOn: '2025-07-31',
        },
        { ...employment, firstMonth: '2025-08', lastMonth: '2026-10' },
      ],
    };
    for (const [jobChangeDecision, status] of [
      [undefined, 'MET'],
      ['suspended', 'UNKNOWN'],
      ['rejected', 'NOT_MET'],
    ] as const) {
      const path = fullBlue({ ...change, jobChangeDecision });
      expect(path.checks.find((c) => c.id === 'DE-C19-months')?.status).toBe(
        'MET',
      );
      expect(path.checks.find((c) => c.id === 'DE-C21-job')?.status).toBe(
        status,
      );
      expect(path.status).toBe(status);
      expect(path.earliestDate).toBe(status === 'MET' ? day : undefined);
    }
    for (const [date, status] of [
      ['2026-01-31', 'UNKNOWN'],
      ['2026-02-01', 'MET'],
    ] as const) {
      const path = fullBlue({ ...change, jobChangeDecision: undefined }, date);
      expect(path.checks.find((c) => c.id === 'DE-C21-job')?.status).toBe(
        status,
      );
    }
  });

  test('inclusive salary, six-month contract and § 19f exclusions', () => {
    expect(blue('C21-job', active)).toBe('MET');
    expect(blue('C21-job', { ...active, contractMonths: 5 })).toBe('NOT_MET');
    expect(blue('C21-job', { ...active, noExclusionUnder19f: false })).toBe(
      'NOT_MET',
    );
    expect(blue('C21-job', { ...active, jobChangeDecision: 'suspended' })).toBe(
      'UNKNOWN',
    );
    expect(blue('C21-pay', active)).toBe('MET');
    expect(blue('C21-pay', { ...active, countableAnnualGross: 50699.99 })).toBe(
      'NOT_MET',
    );
    expect(blue('C21-pay', active, '2027-01-01')).toBe('UNKNOWN');
  });

  test('2026 reduced band and approval, shortage ISCO and graduation limits', () => {
    const reduced = {
      ...active,
      isco: '2211',
      employmentAgencyApproved: true,
      countableAnnualGross: 45934.2,
    };
    expect(blue('C21-pay', reduced)).toBe('MET');
    expect(
      blue('C21-pay', { ...reduced, countableAnnualGross: 45934.19 }),
    ).toBe('NOT_MET');
    expect(
      blue('C21-pay', { ...reduced, employmentAgencyApproved: false }),
    ).toBe('NOT_MET');
    const grad = { ...reduced, isco: '2411', degreeOn: '2023-11-23' };
    expect(blue('C21-pay', grad)).toBe('MET');
    expect(blue('C21-pay', { ...grad, degreeOn: '2023-11-22' })).toBe(
      'NOT_MET',
    );
    expect(
      blue('C21-pay', {
        ...reduced,
        isco: '2411',
        renewal: true,
        firstGraduateCardOn: '2024-11-24',
      }),
    ).toBe('MET');
    expect(
      blue('C21-pay', {
        ...reduced,
        isco: '2411',
        renewal: true,
        firstGraduateCardOn: '2024-11-23',
      }),
    ).toBe('NOT_MET');
  });

  test('equivalent tertiary programme and IT experience have distinct minima', () => {
    const tertiary: Blue = {
      ...active,
      qualification: 'equivalent-tertiary',
      tertiaryProgrammeYears: 3,
      tertiaryLevel: 6,
    };
    expect(blue('C21-pay', tertiary)).toBe('MET');
    expect(blue('C21-pay', { ...tertiary, tertiaryLevel: 5 })).toBe('NOT_MET');
    const it: Blue = {
      ...active,
      isco: '2512',
      qualification: 'none',
      employmentAgencyApproved: true,
      itExperienceNeededForJob: true,
      relevantItYearsInLookback: 3,
      countableAnnualGross: 45934.2,
    };
    expect(blue('C21-pay', it)).toBe('MET');
    expect(blue('C21-pay', { ...it, relevantItYearsInLookback: 2 })).toBe(
      'NOT_MET',
    );
    expect(blue('C21-pay', { ...it, isco: '2411' })).toBe('NOT_MET');
  });

  test('credit uses pay for each year and pension for the same months, once per month', () => {
    const history = {
      firstMonth: '2024-01',
      lastMonth: '2025-12',
      startedOn: '2024-01-01',
      endedOn: '2025-12-31',
      countableAnnualGross: 45300,
      payBand: 'standard' as const,
      qualifyingWork: true,
      pensionForSameMonths: true,
    };
    const overlap = {
      ...history,
      firstMonth: '2024-12',
      lastMonth: '2025-09',
      startedOn: '2024-12-01',
      endedOn: '2025-09-30',
      countableAnnualGross: 48300,
    };
    const r = request({
      blueCard: { ...active, employment: [history, overlap] },
    });
    // 12 qualifying months in 2024 plus 9 in 2025; the shared December is counted once.
    expect(blueCardTimeInputs(r)).toEqual({
      germanB1: true,
      blueCardEmploymentMonths: 21,
    });
    expect(status('R03', 'C19-months', r)).toBe('MET');
    expect(
      blue('C19-months', {
        ...active,
        employment: [history, { ...overlap, pensionForSameMonths: false }],
      }),
    ).toBe('NOT_MET');
    const partial = {
      ...active,
      employment: [history, { ...overlap, pensionForSameMonths: undefined }],
    };
    expect(blue('C19-months', partial)).toBe('UNKNOWN');
    expect(
      blueCardTimeInputs(request({ blueCard: partial }))
        .blueCardEmploymentMonths,
    ).toBeUndefined();
    expect(
      blue('C19-months', {
        ...active,
        fastTrack: false,
        employment: [history, overlap],
      }),
    ).toBe('NOT_MET');
  });

  test('unpublished periods do not inherit later rates; confirmed historical exceptions count', () => {
    const past = {
      firstMonth: '2023-01',
      lastMonth: '2024-09',
      payBand: 'reduced' as const,
      countableAnnualGross: 41041.8,
      qualifyingWork: true,
      pensionForSameMonths: true,
    };
    expect(blue('C19-months', { ...active, employment: [past] })).toBe(
      'UNKNOWN',
    );
    expect(
      blue('C19-months', {
        ...active,
        employment: [
          {
            ...past,
            startedOn: '2023-01-01',
            endedOn: '2024-09-30',
            historicalPayAccepted: true,
          },
        ],
      }),
    ).toBe('MET');
    expect(
      blue('C19-months', { ...active, employment: [past] }, '2024-08-31'),
    ).toBe('NOT_MET');
  });
});

const residence: Freedom = {
  withinPersonalScope: true,
  periods: [{ from: '2021-11-23', basis: 'work' }],
  importantAbsences: [],
  annualOrdinaryAbsenceMonths: [6],
  early: { basis: 'none' },
  subsequentTrips: [],
  lossDecision: 'clear',
};

describe('free movement, FreizügG/EU § 4a', () => {
  test('ordinary anniversary, scope and non-working resources', () => {
    expect(free('C43', residence)).toBe('MET');
    expect(free('C43', { ...residence, withinPersonalScope: false })).toBe(
      'NOT_MET',
    );
    expect(free('C44', residence)).toBe('MET');
    expect(free('C44', residence, '2026-11-22')).toBe('NOT_MET');
    expect(
      free('C44', {
        ...residence,
        periods: [{ from: '2021-11-23', basis: 'inactive' }],
      }),
    ).toBe('UNKNOWN');
    expect(
      free('C44', {
        ...residence,
        periods: [
          {
            from: '2021-11-23',
            basis: 'inactive',
            resourcesAndInsurance: false,
          },
        ],
      }),
    ).toBe('NOT_MET');
    expect(
      free('C44', { ...residence, annualOrdinaryAbsenceMonths: [7] }),
    ).toBe('NOT_MET');
    expect(
      free('C44', {
        ...residence,
        importantAbsences: [{ months: 12, reasonAccepted: true }],
      }),
    ).toBe('MET');
    expect(
      free('C44', {
        ...residence,
        importantAbsences: [{ months: 13, reasonAccepted: true }],
      }),
    ).toBe('NOT_MET');
    expect(
      free('C44', {
        ...residence,
        permanentRightPreviouslyAcquired: true,
        periods: [],
      }),
    ).toBe('MET');
  });

  test('changes of basis may join, a gap breaks the period', () => {
    const a = {
      from: '2021-11-23',
      to: '2022-05-22',
      basis: 'seeking-work' as const,
    };
    const b = {
      from: '2022-05-23',
      basis: 'family' as const,
      familyRightConfirmed: true,
    };
    expect(free('C44', { ...residence, periods: [a, b] })).toBe('MET');
    expect(
      free('C44', { ...residence, periods: [a, { ...b, from: '2022-05-24' }] }),
    ).toBe('NOT_MET');
    expect(
      free('C44', { ...residence, periods: [{ ...a, to: undefined }] }),
    ).toBe('UNKNOWN');
  });

  test('retained individual rights accrue without continuing to live with the sponsor', () => {
    const periods: Freedom['periods'] = [
      {
        from: '2021-11-23',
        to: '2023-01-12',
        basis: 'family',
        familyRightConfirmed: true,
      },
      {
        from: '2023-01-13',
        basis: 'retained',
        retainedPersonalRightConfirmed: true,
      },
    ];
    expect(free('C44', { ...residence, periods })).toBe('MET');
    expect(
      free('C44', {
        ...residence,
        periods,
        annualOrdinaryAbsenceMonths: [6.1],
      }),
    ).toBe('NOT_MET');
    expect(
      free('C44', {
        ...residence,
        periods: [
          periods[0],
          { ...periods[1], retainedPersonalRightConfirmed: undefined },
        ],
      }),
    ).toBe('UNKNOWN');
  });

  test('retirement, disability, frontier work and a deceased worker’s family', () => {
    const r: Freedom = { ...residence, periods: [] };
    const retired = {
      basis: 'retirement' as const,
      qualifyingWorker: true,
      ageAtRetirement: 65,
      retiredUnderEarlyScheme: false,
      finalMonthsWorked: 12,
      continuousResidenceYearsAtEvent: 3,
      spouseNationalityException: false,
    };
    expect(free('C44', { ...r, early: retired })).toBe('MET');
    expect(
      free('C44', { ...r, early: { ...retired, finalMonthsWorked: 11 } }),
    ).toBe('NOT_MET');
    expect(
      free('C44', {
        ...r,
        early: {
          ...retired,
          finalMonthsWorked: 0,
          spouseNationalityException: true,
        },
      }),
    ).toBe('MET');
    expect(
      free('C44', {
        ...r,
        early: {
          basis: 'disability',
          qualifyingWorker: true,
          ceasedBecauseFullyIncapacitated: true,
          continuousResidenceYearsAtEvent: 2,
        },
      }),
    ).toBe('MET');
    const frontier = {
      basis: 'frontier' as const,
      qualifyingWorker: true,
      continuousGermanWorkYears: 3,
      worksInOtherMemberState: true,
      retainsGermanHome: true,
      returnsWeekly: true,
    };
    expect(free('C44', { ...r, early: frontier })).toBe('MET');
    expect(
      free('C44', { ...r, early: { ...frontier, returnsWeekly: false } }),
    ).toBe('NOT_MET');
    expect(
      free('C44', {
        ...r,
        early: {
          basis: 'bereaved',
          qualifyingWorker: true,
          familyWasResidentWithWorker: true,
          occupationalDeath: true,
        },
      }),
    ).toBe('MET');
    expect(
      free('C44', {
        ...r,
        early: {
          basis: 'family-of-worker',
          familyWasResidentWithWorker: true,
          workerAcquiredEarlyRight: true,
        },
      }),
    ).toBe('MET');
  });

  test('loss needs more than two years for a non-temporary reason or a decision', () => {
    const long = { departed: '2024-11-23', nonTemporary: true };
    expect(free('C45', { ...residence, subsequentTrips: [long] })).toBe('MET');
    expect(
      free('C45', { ...residence, subsequentTrips: [long] }, '2026-11-24'),
    ).toBe('NOT_MET');
    expect(
      free(
        'C45',
        { ...residence, subsequentTrips: [{ ...long, nonTemporary: false }] },
        '2026-11-24',
      ),
    ).toBe('MET');
    expect(free('C45', { ...residence, lossDecision: 'pending' })).toBe(
      'UNKNOWN',
    );
    expect(free('C45', { ...residence, lossDecision: 'lost' })).toBe('NOT_MET');
  });
});

const ordinaryTrip: Trip = {
  departed: '2025-01-01',
  returned: '2025-07-01',
  exception: 'none',
  nonTemporary: false,
  approvedReturnBy: null,
};
const ordinary: Title = {
  kind: 'skilled',
  validTo: null,
  noOtherLossEvent: true,
  trips: [ordinaryTrip],
};
const survived = (title: Title) => retainedTitle(request({ titles: [title] }));
const onTrip = (t: Title, fields: Partial<Trip>) =>
  survived({ ...t, trips: [{ ...ordinaryTrip, ...fields }] });
const permanent: Title = {
  ...ordinary,
  kind: 'settlement',
  lawfulYears: 15,
  ageOnDeparture: 60,
  livelihoodSecured: false,
  germanSpouseLivingTogether: false,
  noListedExpulsionInterest: true,
};
describe('independent permit retention, § 51', () => {
  test('concurrent documents of one kind keep distinct IDs, labels and outcomes across locales', () => {
    const titles = [ordinary, { ...ordinary, noOtherLossEvent: false }];
    for (const locale of ['zh-CN', 'en'] as const) {
      const path = evaluateGermanyFull({
        ...request({ titles }),
        routes: ['R00'],
        locale,
      }).columns[0].pathways[0];
      const docs = path.checks.filter((c) => c.id.startsWith('DE-C63-skilled'));
      expect(docs.map((c) => [c.id, c.status])).toEqual([
        ['DE-C63-skilled', 'MET'],
        ['DE-C63-skilled-2', 'NOT_MET'],
      ]);
      expect(docs[0].title).not.toBe(docs[1].title);
      expect(docs[1].title).toContain(
        locale === 'en' ? 'skilled worker permit' : '技术工人许可',
      );
      expect(path).toMatchObject({ status: 'MET', earliestDate: day });
    }
  });

  test('ordinary return deadline is inclusive; non-temporary departure is independent', () => {
    expect(survived(ordinary)).toBe(true);
    expect(status('R00', 'C63-skilled', request({ titles: [ordinary] }))).toBe(
      'MET',
    );
    expect(
      status(
        'R00',
        'C63-skilled',
        request({ titles: [{ ...ordinary, noOtherLossEvent: false }] }),
      ),
    ).toBe('NOT_MET');
    expect(status('R00', 'C63', request({}))).toBe('UNKNOWN');
    expect(onTrip(ordinary, { returned: '2025-07-02' })).toBe(false);
    expect(onTrip(ordinary, { nonTemporary: true })).toBe(false);
    expect(
      onTrip(ordinary, {
        returned: '2025-07-02',
        approvedReturnBy: '2025-07-02',
      }),
    ).toBe(true);
    expect(
      onTrip(ordinary, { returned: '2025-07-02', approvedReturnBy: undefined }),
    ).toBeUndefined();
    expect(
      onTrip(
        { ...ordinary, kind: 'blue-card-family' },
        { returned: '2026-01-01' },
      ),
    ).toBe(true);
    expect(
      onTrip(
        { ...ordinary, kind: 'blue-card-family' },
        { returned: '2026-01-02' },
      ),
    ).toBe(false);
    expect(
      survived({
        ...ordinary,
        validTo: '2026-11-22',
        continuingUnder81: false,
      }),
    ).toBe(false);
    expect(
      survived({ ...ordinary, validTo: '2026-11-22', continuingUnder81: true }),
    ).toBe(true);
  });

  test('mobility, protected travel documents, compulsory service and forced marriage', () => {
    expect(
      onTrip(
        { ...ordinary, kind: 'study' },
        { returned: '2025-10-01', exception: 'eu-mobility' },
      ),
    ).toBe(true);
    expect(
      onTrip(
        { ...ordinary, kind: 'protection' },
        { nonTemporary: true, exception: 'refugee-document' },
      ),
    ).toBe(true);
    expect(
      onTrip(
        {
          ...ordinary,
          kind: 'visa',
          multipleEntryVisa: false,
          visaDurationDays: 91,
        },
        { nonTemporary: true },
      ),
    ).toBe(true);
    expect(
      onTrip(
        {
          ...ordinary,
          kind: 'visa',
          multipleEntryVisa: false,
          visaDurationDays: 90,
        },
        { nonTemporary: true },
      ),
    ).toBe(false);
    expect(
      onTrip(ordinary, {
        returned: '2025-10-01',
        exception: 'military',
        militaryDischargedOn: '2025-07-01',
      }),
    ).toBe(true);
    expect(
      onTrip(ordinary, {
        returned: '2025-10-02',
        exception: 'military',
        militaryDischargedOn: '2025-07-01',
      }),
    ).toBe(false);
    expect(
      onTrip(ordinary, {
        nonTemporary: true,
        exception: 'forced-marriage',
        coercionEndedOn: '2025-04-01',
        qualifiesUnder37: true,
      }),
    ).toBe(true);
    expect(
      onTrip(ordinary, {
        nonTemporary: true,
        exception: 'forced-marriage',
        coercionEndedOn: '2025-03-31',
        qualifiesUnder37: true,
      }),
    ).toBe(false);
  });

  test('60 and 15 years, and the separate German spouse exception', () => {
    expect(onTrip(permanent, { returned: '2026-01-01' })).toBe(true);
    expect(
      onTrip({ ...permanent, ageOnDeparture: 59 }, { returned: '2026-01-01' }),
    ).toBe(false);
    expect(
      onTrip(
        { ...permanent, livelihoodSecured: true },
        { returned: '2026-01-02', nonTemporary: true },
      ),
    ).toBe(true);
    expect(
      onTrip(
        {
          ...permanent,
          lawfulYears: 14,
          spouseHasQualifyingLongResidence: false,
          livelihoodSecured: true,
        },
        { returned: '2026-01-02' },
      ),
    ).toBe(false);
    expect(
      onTrip(
        { ...permanent, germanSpouseLivingTogether: true },
        { nonTemporary: true },
      ),
    ).toBe(true);
  });

  test('EU long-term closed grounds, regional clock and concurrent titles', () => {
    const trip = {
      ...ordinaryTrip,
      returned: '2026-01-02',
      outsideArea: [{ from: '2025-01-01', to: '2026-01-02' }],
    };
    const eu: Title = {
      ...permanent,
      kind: 'eu-long-term',
      priorBlueCardOrQualifyingFamilyTitle: false,
      trips: [trip],
    };
    expect(survived(eu)).toBe(false);
    expect(
      survived({ ...eu, priorBlueCardOrQualifyingFamilyTitle: true }),
    ).toBe(true);
    expect(survived({ ...eu, trips: [{ ...trip, outsideArea: [] }] })).toBe(
      true,
    );
    expect(
      survived({ ...eu, trips: [{ ...trip, outsideArea: undefined }] }),
    ).toBeUndefined();
    expect(
      survived({
        ...eu,
        trips: [{ ...trip, departed: '2019-01-01', outsideArea: [] }],
      }),
    ).toBe(false);
    const both = request({ titles: [eu, { ...permanent, trips: [] }] });
    expect(retainedTitle(both, 'eu-long-term')).toBe(false);
    expect(retainedTitle(both, 'settlement')).toBe(true);
    expect(retainedTitle(both)).toBe(true);
    expect(status('R00', 'C64-eu-long-term', both)).toBe('NOT_MET');
    expect(status('R00', 'C64-settlement', both)).toBe('MET');
  });
});
