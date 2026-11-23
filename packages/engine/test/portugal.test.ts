import { describe, expect, test } from 'vitest';
import { evaluatePortugal } from '../src';
import type { PtPathwayId, PtRequest } from '../src';

// A temporary residence permit from 2020-03-15, renewed on time.
const base: PtRequest = {
  simulationDate: '2024-01-01',
  permits: [{ kind: 'temporary', from: '2020-03-15' }],
  trips: [],
  route: 'other',
};

function pathway(req: Partial<PtRequest>, id: PtPathwayId) {
  const result = evaluatePortugal({ ...base, ...req });
  const found = result.pathways.find((p) => p.id === id);
  if (!found) throw new Error(`missing ${id}`);
  return found;
}

describe('naturalisation, current law (Lei 37/81 art. 6, 15)', () => {
  test('10 years for other nationals, from the day after the start', () => {
    // 2020-03-15 not counted; 10 years end on 2030-03-15 (art. 279 b–c).
    const p = pathway({}, 'PT-NATURALISATION');
    expect(p.status).toBe('FUTURE');
    expect(p.earliestDate).toBe('2030-03-16');
  });

  test('7 years for Portuguese-speaking nationals', () => {
    const p = pathway({ route: 'cplp' }, 'PT-NATURALISATION');
    expect(p.earliestDate).toBe('2027-03-16');
  });

  test('EU citizens: 7 years, but their EU registration is not modelled', () => {
    const p = pathway({ route: 'eu' }, 'PT-NATURALISATION');
    expect(p.status).toBe('UNKNOWN');
    expect(p.earliestDate).toBeUndefined();
    expect(p.summary).toContain('art. 15 n.º 2');
    expect(p.summary).toContain('2027-03-16');
  });

  test('4 years for stateless people', () => {
    expect(
      pathway(
        { route: 'stateless', simulationDate: '2024-03-15' },
        'PT-NATURALISATION',
      ).earliestDate,
    ).toBe('2024-03-16');
    const met = pathway(
      { route: 'stateless', simulationDate: '2024-03-16' },
      'PT-NATURALISATION',
    );
    expect(met.status).toBe('MET');
    expect(met.checks[0].met).toBe(true);
  });

  test('from 29 February the years end on the last day of February', () => {
    const p = pathway(
      { route: 'cplp', permits: [{ kind: 'temporary', from: '2020-02-29' }] },
      'PT-NATURALISATION',
    );
    expect(p.earliestDate).toBe('2027-03-01');
  });

  test('from 28 February, 29 February of a leap year is the day after', () => {
    // review71-1: 2021-02-28 + 7 years ends on 2028-02-28.
    const p = pathway(
      {
        route: 'cplp',
        simulationDate: '2026-11-22',
        permits: [{ kind: 'temporary', from: '2021-02-28' }],
      },
      'PT-NATURALISATION',
    );
    expect(p.earliestDate).toBe('2028-02-29');
  });

  test('periods with a gap add up within the 9-year interval', () => {
    const permits: PtRequest['permits'] = [
      { kind: 'temporary', from: '2016-01-01', to: '2018-12-31' },
      { kind: 'temporary', from: '2020-01-01' },
    ];
    const p = pathway(
      { route: 'cplp', simulationDate: '2023-01-01', permits },
      'PT-NATURALISATION',
    );
    // 1,095 days from 2016-01-02 to 2018-12-31, plus 1,462 from 2020-01-02
    // to 2024-01-02, make 2,557: the most days 7 years can have.
    expect(p.status).toBe('FUTURE');
    expect(p.earliestDate).toBe('2024-01-03');
    // Counting the 6 months after the card expired (to 2019-06-30), 1,276
    // + 1,280 days reach 2,556 on 2023-07-05.
    expect(p.summary).toContain('2023-07-05');
    expect(p.pendingDetails).toContain('PD-145');
    // On 2024-01-02 the 2,556 days are the fewest 7 years can have.
    const edge = pathway(
      { route: 'cplp', simulationDate: '2024-01-02', permits },
      'PT-NATURALISATION',
    );
    expect(edge.status).toBe('UNKNOWN');
    expect(edge.checks[0].met).toBeUndefined();
    expect(edge.summary).toContain('2024-01-03');
  });

  test('periods outside the 12-year interval no longer count', () => {
    const p = pathway(
      {
        simulationDate: '2026-11-22',
        permits: [
          { kind: 'temporary', from: '2010-01-01', to: '2014-12-31' },
          { kind: 'temporary', from: '2020-01-01' },
        ],
      },
      'PT-NATURALISATION',
    );
    // Only 10 unbroken years from 2020-01-01 reach it.
    expect(p.earliestDate).toBe('2030-01-02');
    expect(p.summary).not.toContain('2030-01-01');
  });

  test('a residence visa before the permit is uncertain (PD-140)', () => {
    const p = pathway(
      {
        route: 'cplp',
        simulationDate: '2026-06-01',
        permits: [
          { kind: 'visa', from: '2019-06-01', to: '2019-09-30' },
          { kind: 'temporary', from: '2019-10-01' },
        ],
      },
      'PT-NATURALISATION',
    );
    expect(p.status).toBe('FUTURE');
    expect(p.earliestDate).toBe('2026-10-02');
    expect(p.summary).toContain('2026-06-02');
  });

  test('met today only with the visa: unknown, with the sure date', () => {
    // review71-1: 7 years from 2019-08-01 counting the visa, from
    // 2019-12-01 without it.
    const p = pathway(
      {
        route: 'cplp',
        simulationDate: '2026-11-22',
        permits: [
          { kind: 'visa', from: '2019-08-01', to: '2019-11-30' },
          { kind: 'temporary', from: '2019-12-01' },
        ],
      },
      'PT-NATURALISATION',
    );
    expect(p.status).toBe('UNKNOWN');
    expect(p.earliestDate).toBeUndefined();
    expect(p.checks[0].met).toBeUndefined();
    expect(p.summary).toContain('2026-12-02');
    expect(p.summary).toContain('模拟日可能已经满足');
  });

  test('absences make the date uncertain (PD-144)', () => {
    const p = pathway(
      {
        route: 'cplp',
        trips: [{ departed: '2022-05-01', returned: '2022-05-15' }],
      },
      'PT-NATURALISATION',
    );
    expect(p.status).toBe('UNKNOWN');
    expect(p.earliestDate).toBeUndefined();
    expect(p.summary).toContain('2027-03-16');
    expect(p.summary).toContain('合计 13 天');
    expect(p.pendingDetails).toContain('PD-144');
  });

  test('trips only inside an uncounted gap leave the result alone', () => {
    // review71-1: 4 years to 2020-12-31 and 5 from 2021-11-01 make 7.
    const req: Partial<PtRequest> = {
      route: 'cplp',
      simulationDate: '2026-11-22',
      permits: [
        { kind: 'temporary', from: '2017-01-01', to: '2020-12-31' },
        { kind: 'temporary', from: '2021-11-01' },
      ],
    };
    expect(pathway(req, 'PT-NATURALISATION').status).toBe('MET');
    const inGap = pathway(
      { ...req, trips: [{ departed: '2021-03-01', returned: '2021-03-21' }] },
      'PT-NATURALISATION',
    );
    expect(inGap.status).toBe('MET');
    expect(inGap.pendingDetails).not.toContain('PD-144');
    const counted = pathway(
      { ...req, trips: [{ departed: '2019-03-01', returned: '2019-03-21' }] },
      'PT-NATURALISATION',
    );
    expect(counted.status).toBe('UNKNOWN');
    expect(counted.summary).toContain('合计 19 天');
  });

  test('a trip covering the filing day makes it uncertain (PD-144)', () => {
    // review71-5: away from 2026-11-22; filing on 11-22 and 11-23 agree.
    const abroad = (simulationDate: string) =>
      pathway(
        {
          simulationDate,
          permits: [{ kind: 'temporary', from: '2015-01-01' }],
          trips: [{ departed: '2026-11-21', returned: '2026-12-01' }],
        },
        'PT-NATURALISATION',
      );
    for (const day of ['2026-11-22', '2026-11-23']) {
      const p = abroad(day);
      expect(p.status).toBe('UNKNOWN');
      expect(p.checks[0].met).toBeUndefined();
      expect(p.pendingDetails).toContain('PD-144');
    }
    // Leaving on the filing day itself: still in Portugal that day.
    const leaving = pathway(
      {
        simulationDate: '2026-11-22',
        permits: [{ kind: 'temporary', from: '2015-01-01' }],
        trips: [{ departed: '2026-11-22', returned: '2026-12-01' }],
      },
      'PT-NATURALISATION',
    );
    expect(leaving.status).toBe('MET');
  });

  test('legal residence is needed on the application day', () => {
    // The card expired on 2025-12-31; the 6 months after it ended on
    // 2026-06-30.
    const p = pathway(
      {
        route: 'stateless',
        simulationDate: '2026-11-22',
        permits: [{ kind: 'temporary', from: '2018-01-01', to: '2025-12-31' }],
      },
      'PT-NATURALISATION',
    );
    expect(p.status).toBe('NOT_MET');
  });

  test('card just expired and abroad on the filing day: both named', () => {
    // Task 75: the summary names the grace (PD-145) and the trip (PD-144).
    const p = pathway(
      {
        route: 'cplp',
        simulationDate: '2026-11-22',
        permits: [{ kind: 'temporary', from: '2018-11-01', to: '2026-10-31' }],
        trips: [{ departed: '2026-11-21', returned: '2026-12-01' }],
      },
      'PT-NATURALISATION',
    );
    expect(p.status).toBe('UNKNOWN');
    expect(p.summary).toContain('PD-145');
    expect(p.summary).toContain('1 次出境');
    expect(p.pendingDetails).toEqual(
      expect.arrayContaining(['PD-144', 'PD-145']),
    );
  });

  test('within 6 months of a card expiring: unknown (PD-145)', () => {
    // review71-1: the right of residence lasts to 2027-04-30.
    const p = pathway(
      {
        route: 'cplp',
        simulationDate: '2026-11-22',
        permits: [{ kind: 'temporary', from: '2018-11-01', to: '2026-10-31' }],
      },
      'PT-NATURALISATION',
    );
    expect(p.status).toBe('UNKNOWN');
    expect(p.checks[0].met).toBeUndefined();
    expect(p.pendingDetails).toContain('PD-145');
  });
});

describe('naturalisation, application pending on 2026-05-19 (LO 1/2026 art. 7)', () => {
  // review71-1: a permit from 2021-07-01, applied for naturalisation on
  // 2026-05-01.
  const pending: Partial<PtRequest> = {
    simulationDate: '2026-11-22',
    permits: [{ kind: 'temporary', from: '2021-07-01' }],
    pendingApplication: '2026-05-01',
  };

  test('permit time alone is short: ask for the residence application', () => {
    const p = pathway(pending, 'PT-NATURALISATION');
    expect(p.status).toBe('UNKNOWN');
    expect(p.checks[0].met).toBeUndefined();
    expect(p.summary).toContain('请填写');
  });

  test('the earlier text counts from the residence application', () => {
    const p = pathway(
      { ...pending, residenceApplied: '2021-03-01' },
      'PT-NATURALISATION',
    );
    expect(p.status).toBe('MET');
    expect(p.checks[0].met).toBe(true);
    // 5 years before 2026-05-01, from the day after 2021-04-30.
    expect(
      pathway(
        { ...pending, residenceApplied: '2021-04-30' },
        'PT-NATURALISATION',
      ).status,
    ).toBe('MET');
  });

  test('met on the record but with a trip: worded as the record alone', () => {
    // Task 75: the summary matches the unknown status.
    const p = pathway(
      {
        ...pending,
        residenceApplied: '2021-03-01',
        trips: [{ departed: '2023-05-01', returned: '2023-05-15' }],
      },
      'PT-NATURALISATION',
    );
    expect(p.status).toBe('UNKNOWN');
    expect(p.summary).toContain('仅按居留记录计算，递交时已满 5 年');
    expect(p.pendingDetails).toContain('PD-144');
  });

  test('resting on the grace after the card: its trips are named too', () => {
    // review75-1: card to 2026-04-30, away 2026-05-02 to 05-07, applied on
    // 2026-05-12.
    const p = pathway(
      {
        simulationDate: '2026-11-22',
        permits: [{ kind: 'temporary', from: '2020-05-01', to: '2026-04-30' }],
        pendingApplication: '2026-05-12',
        trips: [{ departed: '2026-05-01', returned: '2026-05-08' }],
      },
      'PT-NATURALISATION',
    );
    expect(p.status).toBe('UNKNOWN');
    expect(p.summary).toContain('1 次出境');
    expect(p.pendingDetails).toEqual(
      expect.arrayContaining(['PD-144', 'PD-145']),
    );
  });

  test('one day short: a new application falls under the current law', () => {
    const p = pathway(
      { ...pending, residenceApplied: '2021-05-01' },
      'PT-NATURALISATION',
    );
    expect(p.checks[0].met).toBe(false);
    // 10 years from 2021-07-01 under the current law.
    expect(p.status).toBe('FUTURE');
    expect(p.earliestDate).toBe('2031-07-02');
    expect(p.checks).toHaveLength(2);
  });

  test('applied before LO 1/2024 came into force: not modelled', () => {
    const p = pathway(
      { ...pending, pendingApplication: '2024-03-01' },
      'PT-NATURALISATION',
    );
    expect(p.status).toBe('UNKNOWN');
    expect(p.summary).toContain('2024-04-01');
    expect(p.pendingDetails).toContain('PD-143');
  });

  test('applied on the day the law came into force: unclear (PD-143)', () => {
    const p = pathway(
      { ...pending, pendingApplication: '2026-05-19' },
      'PT-NATURALISATION',
    );
    expect(p.status).toBe('UNKNOWN');
    expect(p.pendingDetails).toContain('PD-143');
  });

  test('applied after it: the current law', () => {
    const p = pathway(
      { ...pending, pendingApplication: '2026-06-01' },
      'PT-NATURALISATION',
    );
    expect(p.earliestDate).toBe('2031-07-02');
    expect(p.summary).toContain('2026-05-19');
  });
});

describe('permanent residence (Lei 23/2007 art. 80)', () => {
  test('5 years of temporary residence', () => {
    const p = pathway({}, 'PT-PERMANENT');
    expect(p.status).toBe('FUTURE');
    expect(p.earliestDate).toBe('2025-03-16');
    expect(
      pathway({ simulationDate: '2026-11-22' }, 'PT-PERMANENT').status,
    ).toBe('MET');
  });

  test('golden visa and study permits are temporary residence', () => {
    const p = pathway(
      {
        permits: [
          { kind: 'study', from: '2019-09-01', to: '2021-08-31' },
          { kind: 'golden-visa', from: '2021-09-01' },
        ],
      },
      'PT-PERMANENT',
    );
    expect(p.earliestDate).toBe('2024-09-02');
  });

  test('a gap within 6 months of expiry: met today only if bridged', () => {
    const p = pathway(
      {
        permits: [
          { kind: 'temporary', from: '2018-01-01', to: '2020-12-31' },
          { kind: 'temporary', from: '2021-03-01' },
        ],
      },
      'PT-PERMANENT',
    );
    expect(p.status).toBe('UNKNOWN');
    expect(p.earliestDate).toBeUndefined();
    expect(p.summary).toContain('2026-03-02');
    expect(p.pendingDetails).toContain('PD-145');
  });

  test('a longer gap starts the years again', () => {
    const p = pathway(
      {
        permits: [
          { kind: 'temporary', from: '2018-01-01', to: '2020-06-30' },
          { kind: 'temporary', from: '2021-03-01' },
        ],
      },
      'PT-PERMANENT',
    );
    expect(p.status).toBe('FUTURE');
    expect(p.earliestDate).toBe('2026-03-02');
  });

  test('6 months away may cancel the permit but leaves the date', () => {
    const p = pathway(
      {
        permits: [
          { kind: 'temporary', from: '2020-03-15', to: '2022-03-14' },
          { kind: 'temporary', from: '2022-03-15' },
        ],
        trips: [{ departed: '2021-01-10', returned: '2021-07-11' }],
      },
      'PT-PERMANENT',
    );
    expect(p.earliestDate).toBe('2025-03-16');
    expect(p.checks[1].met).toBe(false);
    expect(p.summary).toContain('2020-03-15');
  });

  test('just under 6 months raises no warning', () => {
    const p = pathway(
      { trips: [{ departed: '2021-01-10', returned: '2021-07-10' }] },
      'PT-PERMANENT',
    );
    expect(p.checks[1].met).toBe(true);
  });

  test('a trip across a renewal counts within each permit', () => {
    // review71-1: away 2024-04-02 to 2024-06-30 and 2024-07-01 to
    // 2024-11-30, under 6 months on each permit.
    const p = pathway(
      {
        simulationDate: '2026-11-22',
        permits: [
          { kind: 'temporary', from: '2022-07-01', to: '2024-06-30' },
          { kind: 'temporary', from: '2024-07-01' },
        ],
        trips: [{ departed: '2024-04-01', returned: '2024-12-01' }],
      },
      'PT-PERMANENT',
    );
    expect(p.checks[1].met).toBe(true);
  });

  test('8 months in all over one permit', () => {
    const p = pathway(
      {
        permits: [{ kind: 'temporary', from: '2020-03-15', to: '2022-03-14' }],
        simulationDate: '2021-06-01',
        trips: [
          { departed: '2020-05-01', returned: '2020-09-15' },
          { departed: '2021-01-10', returned: '2021-05-20' },
        ],
      },
      'PT-PERMANENT',
    );
    // 136 + 129 = 265 days abroad: more than 8 months can have.
    expect(p.checks[1].met).toBe(false);
  });

  test('planned trips are a forecast, not a breach on the simulation date', () => {
    // Task 75: away from 2027-01-11, 6 months on 2027-07-10.
    const p = pathway(
      {
        simulationDate: '2026-11-22',
        trips: [{ departed: '2027-01-10', returned: '2027-07-20' }],
      },
      'PT-PERMANENT',
    );
    expect(p.status).toBe('MET');
    expect(p.checks[1].met).toBe(true);
    expect(p.summary).toContain('2027-07-10');
    // Holding permanent residence: 24 months away on 2029-01-01.
    const held = pathway(
      {
        simulationDate: '2026-11-22',
        permits: [{ kind: 'permanent', from: '2022-01-01' }],
        trips: [{ departed: '2027-01-01', returned: '2029-02-01' }],
      },
      'PT-PERMANENT',
    );
    expect(held.status).toBe('NOT_APPLICABLE');
    expect(held.checks[0].met).toBe(true);
    expect(held.summary).toContain('2029-01-01');
  });

  test('permanent residence for investment is not cancelled for absences', () => {
    // review75-2: DR 84/2007 art. 65-K; Lei 56/2023 art. 42 n.º 4.
    const req: Partial<PtRequest> = {
      permits: [
        { kind: 'golden-visa', from: '2020-10-01', to: '2022-09-30' },
        { kind: 'golden-visa', from: '2022-10-01', to: '2024-09-30' },
        { kind: 'golden-visa', from: '2024-10-01', to: '2026-09-30' },
        { kind: 'ari-permanent', from: '2026-10-01' },
      ],
      trips: [{ departed: '2027-01-10', returned: '2029-01-20' }],
    };
    for (const simulationDate of ['2026-11-22', '2029-01-11']) {
      const p = pathway({ ...req, simulationDate }, 'PT-PERMANENT');
      expect(p.status).toBe('NOT_APPLICABLE');
      expect(p.checks[0].met).toBe(true);
      expect(p.summary).not.toContain('2029-01-10');
    }
  });

  test('from the switch to permanent residence for investment, no renewal', () => {
    // review75-3: the same record before and after 2026-10-01.
    const permits: PtRequest['permits'] = [
      { kind: 'golden-visa', from: '2020-10-01', to: '2022-09-30' },
      { kind: 'golden-visa', from: '2022-10-01', to: '2024-09-30' },
      { kind: 'golden-visa', from: '2024-10-01', to: '2026-09-30' },
      { kind: 'ari-permanent', from: '2026-10-01' },
    ];
    // Renewal opens 90 days before 2026-09-30.
    const before = pathway(
      { simulationDate: '2026-07-01', permits },
      'PT-GOLDEN-VISA',
    );
    expect(before.status).toBe('FUTURE');
    expect(before.earliestDate).toBe('2026-07-02');
    for (const simulationDate of ['2026-10-01', '2026-11-22'])
      expect(
        pathway({ simulationDate, permits }, 'PT-GOLDEN-VISA').status,
      ).toBe('NOT_APPLICABLE');
  });

  test('a switch recorded before renewal opens makes renewal unnecessary', () => {
    // review75-4: renewal would open on 2026-07-02; the switch is 06-15.
    const p = pathway(
      {
        simulationDate: '2026-06-01',
        permits: [
          { kind: 'golden-visa', from: '2020-10-01', to: '2022-09-30' },
          { kind: 'golden-visa', from: '2022-10-01', to: '2024-09-30' },
          { kind: 'golden-visa', from: '2024-10-01', to: '2026-09-30' },
          { kind: 'ari-permanent', from: '2026-06-15' },
        ],
      },
      'PT-GOLDEN-VISA',
    );
    expect(p.status).toBe('NOT_APPLICABLE');
    expect(p.summary).toContain('2026-06-15');
    expect(p.summary).toContain('2026-07-02');
  });

  test('the latest permanent residence decides, not the row order', () => {
    // review75-4: ordinary from 2021-01-01, for investment from 2026-01-01.
    const ordinary = {
      kind: 'permanent' as const,
      from: '2021-01-01',
      to: '2025-12-31',
    };
    const investment = { kind: 'ari-permanent' as const, from: '2026-01-01' };
    for (const permits of [
      [ordinary, investment],
      [investment, ordinary],
    ]) {
      const p = pathway(
        {
          simulationDate: '2026-11-22',
          permits,
          trips: [{ departed: '2022-01-01', returned: '2024-02-01' }],
        },
        'PT-PERMANENT',
      );
      expect(p.summary).toContain('2026-01-01');
      expect(p.checks[0].met).toBe(true);
    }
  });

  test('a golden visa forecast names the unconfirmed limit (PD-146)', () => {
    // review75-1: 6 months away on 2027-07-10 during the ARI card.
    const p = pathway(
      {
        simulationDate: '2026-11-22',
        permits: [
          { kind: 'golden-visa', from: '2025-08-10', to: '2027-08-10' },
        ],
        trips: [{ departed: '2027-01-10', returned: '2027-07-20' }],
      },
      'PT-PERMANENT',
    );
    expect(p.checks[1].met).toBe(true);
    expect(p.summary).toContain('2027-07-10');
    expect(p.summary).toContain('对黄金签证是否适用不明');
  });

  test('for the golden visa the absence rule is uncertain (PD-146)', () => {
    const p = pathway(
      {
        permits: [{ kind: 'golden-visa', from: '2020-03-15' }],
        trips: [{ departed: '2021-01-10', returned: '2021-07-11' }],
      },
      'PT-PERMANENT',
    );
    expect(p.checks[1].met).toBeUndefined();
    expect(p.earliestDate).toBe('2025-03-16');
  });

  test('not met when temporary residence ended', () => {
    const p = pathway(
      {
        simulationDate: '2026-11-22',
        permits: [{ kind: 'temporary', from: '2022-01-01', to: '2025-12-31' }],
      },
      'PT-PERMANENT',
    );
    expect(p.status).toBe('NOT_MET');
    expect(p.checks[0].met).toBe(false);
  });

  test('a residence visa does not count', () => {
    const p = pathway(
      {
        permits: [
          { kind: 'visa', from: '2019-06-01', to: '2020-03-14' },
          { kind: 'temporary', from: '2020-03-15' },
        ],
      },
      'PT-PERMANENT',
    );
    expect(p.earliestDate).toBe('2025-03-16');
  });

  test('permanent residence held: absences of 24 months (art. 85 n.º 2 b)', () => {
    const p = pathway(
      {
        simulationDate: '2026-11-22',
        permits: [
          { kind: 'temporary', from: '2016-01-01', to: '2021-12-31' },
          { kind: 'permanent', from: '2022-01-01' },
        ],
        trips: [{ departed: '2023-01-01', returned: '2025-01-03' }],
      },
      'PT-PERMANENT',
    );
    expect(p.status).toBe('NOT_APPLICABLE');
    expect(p.checks[0].met).toBe(false);
    const fine = pathway(
      {
        simulationDate: '2026-11-22',
        permits: [{ kind: 'permanent', from: '2022-01-01' }],
      },
      'PT-PERMANENT',
    );
    expect(fine.checks[0].met).toBe(true);
  });

  test('an expired permanent card does not end permanent residence', () => {
    // review71-1: the permit has no time limit (art. 76 n.º 1–2).
    const p = pathway(
      {
        simulationDate: '2026-11-22',
        permits: [
          { kind: 'temporary', from: '2016-10-01', to: '2021-09-30' },
          { kind: 'permanent', from: '2021-10-01', to: '2026-09-30' },
        ],
      },
      'PT-PERMANENT',
    );
    expect(p.status).toBe('NOT_APPLICABLE');
  });

  test('EU citizens fall outside the foreigners law (art. 4 n.º 2 a)', () => {
    // review71-1: a French citizen with no permits.
    for (const id of [
      'PT-PERMANENT',
      'PT-EU-LONG-TERM',
      'PT-GOLDEN-VISA',
    ] as const)
      expect(pathway({ route: 'eu', permits: [] }, id).status).toBe(
        'NOT_APPLICABLE',
      );
    expect(
      pathway({ route: 'eu', permits: [] }, 'PT-EU-LONG-TERM').summary,
    ).toContain('art. 125 n.º 1');
  });
});

test('EEA and Swiss citizens also fall outside the foreigners law', () => {
  // review71-2: a Norwegian with only a free-movement registration.
  for (const id of [
    'PT-PERMANENT',
    'PT-EU-LONG-TERM',
    'PT-GOLDEN-VISA',
  ] as const)
    expect(pathway({ route: 'eea', permits: [] }, id).status).toBe(
      'NOT_APPLICABLE',
    );
  // Not EU nationals for naturalisation: 10 years, registration not modelled.
  const p = pathway({ route: 'eea', permits: [] }, 'PT-NATURALISATION');
  expect(p.status).toBe('UNKNOWN');
  expect(p.summary).toContain('10 年');
  expect(p.summary).toContain('art. 15 n.º 2');
});

describe('EU long-term residence (Lei 23/2007 art. 125–126)', () => {
  test('5 years immediately before applying', () => {
    const p = pathway({}, 'PT-EU-LONG-TERM');
    expect(p.status).toBe('FUTURE');
    expect(p.earliestDate).toBe('2025-03-16');
  });

  test('an absence just under 6 months keeps continuity', () => {
    const p = pathway(
      { trips: [{ departed: '2022-01-10', returned: '2022-07-10' }] },
      'PT-EU-LONG-TERM',
    );
    expect(p.earliestDate).toBe('2025-03-16');
  });

  test('6 months or more: count again once it leaves the 5 years', () => {
    const p = pathway(
      { trips: [{ departed: '2022-01-10', returned: '2022-07-11' }] },
      'PT-EU-LONG-TERM',
    );
    // Away from 2022-01-11 to 2022-07-10; the 5 years from the day after
    // 2022-07-11 end on 2027-07-11.
    expect(p.earliestDate).toBe('2027-07-12');
    expect(p.checks[1].met).toBe(false);
  });

  test('absences between the fewest and most days of 10 months', () => {
    const p = pathway(
      {
        simulationDate: '2026-11-22',
        trips: [
          { departed: '2022-04-30', returned: '2022-10-01' },
          { departed: '2023-01-31', returned: '2023-07-04' },
        ],
      },
      'PT-EU-LONG-TERM',
    );
    // 153 + 153 = 306 days abroad: 10 months have 303 to 306 days, so the
    // simulation date is met only on a generous reading.
    expect(p.checks[2].met).toBeUndefined();
    expect(p.status).toBe('UNKNOWN');
    // From 2027-05-05 the 5 years start on 2022-05-04: 150 + 153 = 303.
    expect(p.summary).toContain('2027-05-05');
  });

  test('study counts at half (art. 126 n.º 3)', () => {
    const permits: PtRequest['permits'] = [
      { kind: 'study', from: '2019-01-01', to: '2022-12-31' },
      { kind: 'temporary', from: '2023-01-01' },
    ];
    // For 2026-01-02 the 1,827 days from 2021-01-01 need 3,654 half days:
    // 1,097 work days give 2,194, and 1,460 of the 1,461 study days the rest.
    const p = pathway(
      { simulationDate: '2024-01-01', permits },
      'PT-EU-LONG-TERM',
    );
    expect(p.status).toBe('FUTURE');
    expect(p.earliestDate).toBe('2026-01-02');
    // review71-1: met on 2026-11-22.
    const met = pathway(
      { simulationDate: '2026-11-22', permits },
      'PT-EU-LONG-TERM',
    );
    expect(met.status).toBe('MET');
    expect(met.checks[0].met).toBe(true);
  });

  test('within 6 months of a card expiring: unknown (PD-145)', () => {
    const p = pathway(
      {
        simulationDate: '2026-11-22',
        permits: [{ kind: 'temporary', from: '2019-01-01', to: '2026-10-31' }],
      },
      'PT-EU-LONG-TERM',
    );
    expect(p.status).toBe('UNKNOWN');
    expect(p.pendingDetails).toContain('PD-145');
  });

  test('EU long-term resident status already held (art. 130–131)', () => {
    // review71-2: a 7-month stay in Spain does not lose the status.
    const req: Partial<PtRequest> = {
      simulationDate: '2026-11-22',
      permits: [
        { kind: 'temporary', from: '2020-01-01', to: '2021-12-31' },
        { kind: 'temporary', from: '2022-01-01', to: '2025-01-01' },
        { kind: 'eu-long-term', from: '2025-01-02' },
      ],
      trips: [{ departed: '2025-03-01', returned: '2025-10-01' }],
    };
    const p = pathway(req, 'PT-EU-LONG-TERM');
    expect(p.status).toBe('NOT_APPLICABLE');
    expect(p.earliestDate).toBeUndefined();
    expect(p.summary).toContain('2025-01-02');
    expect(p.checks[0].met).toBe(true);
    // The permanent residence node no longer calls it an art. 76 permit.
    const permanent = pathway(req, 'PT-PERMANENT');
    expect(permanent.status).not.toBe('NOT_APPLICABLE');
    expect(permanent.summary).not.toContain('art. 76');
    expect(permanent.summary).toContain('欧盟长期居民');
    // 12 months away may lose it outside the EU; 6 years away loses it.
    const year = pathway(
      { ...req, trips: [{ departed: '2025-03-01', returned: '2026-03-02' }] },
      'PT-EU-LONG-TERM',
    );
    expect(year.checks[0].met).toBeUndefined();
    // An expired card does not end the status (art. 130 n.º 2).
    expect(
      pathway(
        {
          simulationDate: '2026-11-22',
          permits: [
            { kind: 'eu-long-term', from: '2020-01-01', to: '2025-01-01' },
          ],
        },
        'PT-EU-LONG-TERM',
      ).status,
    ).toBe('NOT_APPLICABLE');
  });

  test('the months after a study permit are no permit to apply with', () => {
    // review71-2: work to 2026-03-31, then study to 2026-10-31.
    const p = pathway(
      {
        simulationDate: '2026-11-22',
        permits: [
          { kind: 'temporary', from: '2021-04-01', to: '2026-03-31' },
          { kind: 'study', from: '2026-04-01', to: '2026-10-31' },
        ],
      },
      'PT-EU-LONG-TERM',
    );
    expect(p.status).toBe('NOT_MET');
  });

  test('continuous study counts the same as one card or two', () => {
    // review71-4: the first card's grace must not count study days in full.
    // For 2027-01-02 the 1,827 days from 2022-01-01 need 3,654 half days:
    // 1,097 work days give 2,194, and 1,460 of the 1,461 study days the rest.
    const work = { kind: 'temporary' as const, from: '2024-01-01' };
    const one = pathway(
      {
        simulationDate: '2026-11-22',
        permits: [
          { kind: 'study', from: '2020-01-01', to: '2023-12-31' },
          work,
        ],
      },
      'PT-EU-LONG-TERM',
    );
    const two = pathway(
      {
        simulationDate: '2026-11-22',
        permits: [
          { kind: 'study', from: '2020-01-01', to: '2021-12-31' },
          { kind: 'study', from: '2022-01-01', to: '2023-12-31' },
          work,
        ],
      },
      'PT-EU-LONG-TERM',
    );
    expect(one.status).toBe('FUTURE');
    expect(one.earliestDate).toBe('2027-01-02');
    expect(two.status).toBe(one.status);
    expect(two.earliestDate).toBe(one.earliestDate);
    expect(two.summary).toBe(one.summary);
  });

  test('a trip under way on the simulation date counts so far', () => {
    // review71-4: 20 days abroad by 2026-11-22; 6 months on 2027-05-01.
    const p = pathway(
      {
        simulationDate: '2026-11-22',
        permits: [{ kind: 'temporary', from: '2019-01-01' }],
        trips: [{ departed: '2026-11-01', returned: '2027-07-01' }],
      },
      'PT-EU-LONG-TERM',
    );
    expect(p.status).toBe('MET');
    expect(p.checks[1].met).toBe(true);
    expect(p.summary).toContain('2027-05-01');
  });

  test('each planned trip gets its own loss forecast', () => {
    // review75-1: a past year away must not hide the next one.
    const p = pathway(
      {
        simulationDate: '2026-11-22',
        permits: [{ kind: 'eu-long-term', from: '2019-01-01' }],
        trips: [
          { departed: '2021-01-01', returned: '2022-02-01' },
          { departed: '2027-01-01', returned: '2033-02-01' },
        ],
      },
      'PT-EU-LONG-TERM',
    );
    expect(p.checks[0].met).toBeUndefined();
    expect(p.summary).toContain('2028-01-01');
    expect(p.summary).toContain('2033-01-01');
    expect(p.summary).toContain('art. 129 n.º 9');
    expect(p.summary).toContain('art. 131 n.º 6');
  });

  test('a planned trip is followed past the calculation horizon', () => {
    // review75-3: 6 years on 2037-01-01, after 2036-11-22.
    const p = pathway(
      {
        simulationDate: '2026-11-22',
        permits: [{ kind: 'eu-long-term', from: '2019-01-01' }],
        trips: [{ departed: '2031-01-01', returned: '2037-02-01' }],
      },
      'PT-EU-LONG-TERM',
    );
    expect(p.summary).toContain('2032-01-01');
    expect(p.summary).toContain('2037-01-01');
  });

  test('every planned trip that reaches 12 months is listed', () => {
    // review75-2: 12 months on 2028-01-01 and 2030-01-01, 6 years on
    // 2035-01-01.
    const p = pathway(
      {
        simulationDate: '2026-11-22',
        permits: [{ kind: 'eu-long-term', from: '2019-01-01' }],
        trips: [
          { departed: '2027-01-01', returned: '2028-02-01' },
          { departed: '2029-01-01', returned: '2035-02-01' },
        ],
      },
      'PT-EU-LONG-TERM',
    );
    expect(p.summary).toContain('2028-01-01、2030-01-01');
    expect(p.summary).toContain('2035-01-01');
  });

  test('a newer study permit ends the grace of the work permit before', () => {
    // review71-3: on 2026-11-22 only the study permit is held.
    const p = pathway(
      {
        simulationDate: '2026-11-22',
        permits: [
          { kind: 'temporary', from: '2021-09-01', to: '2023-08-31' },
          { kind: 'temporary', from: '2023-09-01', to: '2026-08-31' },
          { kind: 'study', from: '2026-09-01', to: '2028-08-31' },
        ],
      },
      'PT-EU-LONG-TERM',
    );
    expect(p.status).toBe('NOT_MET');
  });

  test('planned trips are a forecast, not a loss on the simulation date', () => {
    // review71-3: away from 2027-01-02, 6 years on 2033-01-01.
    const p = pathway(
      {
        simulationDate: '2026-11-22',
        permits: [{ kind: 'eu-long-term', from: '2025-01-01' }],
        trips: [{ departed: '2027-01-01', returned: '2033-01-03' }],
      },
      'PT-EU-LONG-TERM',
    );
    expect(p.status).toBe('NOT_APPLICABLE');
    expect(p.checks[0].met).toBe(true);
    expect(p.summary).toContain('2033-01-01');
    // Task 75: 12 months away on 2028-01-01 comes first, and may lose it
    // outside the EU; the exceptions are named.
    expect(p.summary).toContain('2028-01-01');
    expect(p.summary).toContain('art. 131 n.º 2–3');
    // The same 6 years already behind you: lost.
    const lost = pathway(
      {
        simulationDate: '2026-11-22',
        permits: [{ kind: 'eu-long-term', from: '2015-01-01' }],
        trips: [{ departed: '2016-01-01', returned: '2022-01-03' }],
      },
      'PT-EU-LONG-TERM',
    );
    expect(lost.checks[0].met).toBe(false);
  });

  test('a study permit holder cannot apply', () => {
    const p = pathway(
      {
        simulationDate: '2026-11-22',
        permits: [{ kind: 'study', from: '2015-01-01' }],
      },
      'PT-EU-LONG-TERM',
    );
    expect(p.status).toBe('NOT_MET');
  });
});

describe('golden visa (ARI) renewal and minimum stays', () => {
  const card = {
    permits: [
      { kind: 'golden-visa' as const, from: '2024-01-10', to: '2026-01-09' },
    ],
  };

  test('no golden visa: not applicable', () => {
    expect(pathway({}, 'PT-GOLDEN-VISA').status).toBe('NOT_APPLICABLE');
  });

  test('no expiry entered: unknown', () => {
    const p = pathway(
      { permits: [{ kind: 'golden-visa', from: '2024-01-10' }] },
      'PT-GOLDEN-VISA',
    );
    expect(p.status).toBe('UNKNOWN');
  });

  test('renewal from 90 to 30 days before expiry', () => {
    const p = pathway(
      { ...card, simulationDate: '2025-06-01' },
      'PT-GOLDEN-VISA',
    );
    expect(p.status).toBe('FUTURE');
    expect(p.earliestDate).toBe('2025-10-11');
    expect(p.summary).toContain('2025-12-10');
    // The investment is kept for 5 years from the grant.
    expect(p.summary).toContain('2029-01-10');
    expect(
      pathway({ ...card, simulationDate: '2025-12-10' }, 'PT-GOLDEN-VISA')
        .status,
    ).toBe('MET');
    expect(
      pathway({ ...card, simulationDate: '2025-12-11' }, 'PT-GOLDEN-VISA')
        .status,
    ).toBe('NOT_MET');
  });

  test('7 days in the first year', () => {
    const away = (returned: string) =>
      pathway(
        {
          ...card,
          simulationDate: '2025-11-01',
          trips: [{ departed: '2024-01-12', returned }],
        },
        'PT-GOLDEN-VISA',
      );
    // 366 days from 2024-01-10 to 2025-01-09; away from 2024-01-13.
    const ok = away('2025-01-05'); // 358 days away, 8 in Portugal
    expect(ok.status).toBe('MET');
    expect(ok.checks[1].met).toBe(true);
    const short = away('2025-01-07'); // 360 days away, 6 in Portugal
    expect(short.status).toBe('NOT_MET');
    expect(short.checks[1].met).toBe(false);
    expect(short.summary).toContain('2024-01-10 至 2025-01-09 在葡萄牙 6 天');
  });

  test('only days up to the simulation date count as spent', () => {
    // 3 days to 2025-01-12, then 8 from 2025-10-25 to 2025-11-01: 11 of 14,
    // reached on 2025-11-04 staying on.
    const p = pathway(
      {
        ...card,
        simulationDate: '2025-11-01',
        trips: [{ departed: '2025-01-12', returned: '2025-10-25' }],
      },
      'PT-GOLDEN-VISA',
    );
    expect(p.status).toBe('FUTURE');
    expect(p.earliestDate).toBe('2025-11-04');
    expect(p.checks[1].met).toBe(false);
    expect(p.summary).toContain('还差 3 天');
  });

  test('the reviewed case: 3 days in the second year is not yet met', () => {
    // review71-1: away 2025-12-03 to 2026-10-14; 2025-12-01, 12-02 and
    // 2026-10-15 make 3 days, 14 on 2026-10-26.
    const p = pathway(
      {
        simulationDate: '2026-10-15',
        permits: [
          { kind: 'golden-visa', from: '2024-12-01', to: '2026-11-30' },
        ],
        trips: [{ departed: '2025-12-02', returned: '2026-10-15' }],
      },
      'PT-GOLDEN-VISA',
    );
    expect(p.status).toBe('FUTURE');
    expect(p.earliestDate).toBe('2026-10-26');
  });

  test('both readings short by the renewal deadline: not met', () => {
    // review71-2: 2025-12-01, 12-02 and the return day make 3 days; staying
    // on, 14 come 11 days after returning. The deadline is 2026-10-31.
    const back = (returned: string) =>
      pathway(
        {
          simulationDate: returned,
          permits: [
            { kind: 'golden-visa', from: '2024-12-01', to: '2026-11-30' },
          ],
          trips: [{ departed: '2025-12-02', returned }],
        },
        'PT-GOLDEN-VISA',
      );
    const late = back('2026-10-28'); // 14 days on 2026-11-08
    expect(late.status).toBe('NOT_MET');
    expect(late.summary).toContain('2026-11-08');
    const onDeadline = back('2026-10-20'); // 14 days on 2026-10-31
    expect(onDeadline.status).toBe('FUTURE');
    expect(onDeadline.earliestDate).toBe('2026-10-31');
    expect(back('2026-10-21').status).toBe('NOT_MET'); // on 2026-11-01
  });

  test('14 days per 2-year period, not per year (art. 65-C)', () => {
    // review75-1: 12 days in the year from 2023-01-10, but plenty in the 2
    // years from it; AIMA's FAQ n.º 24 also counts 2-year periods.
    const p = pathway(
      {
        simulationDate: '2025-11-01',
        permits: [
          { kind: 'golden-visa', from: '2022-01-10', to: '2024-01-09' },
          { kind: 'golden-visa', from: '2024-01-10', to: '2026-01-09' },
        ],
        trips: [{ departed: '2023-01-12', returned: '2024-01-01' }],
      },
      'PT-GOLDEN-VISA',
    );
    expect(p.status).toBe('MET');
    expect(p.checks[1].met).toBe(true);
    // review75-1: 8 days in the year from 2024-09-01, renewing in 2026.
    const renewal = pathway(
      {
        simulationDate: '2026-07-01',
        permits: [
          { kind: 'golden-visa', from: '2022-09-01', to: '2024-08-31' },
          { kind: 'golden-visa', from: '2024-09-01', to: '2026-09-01' },
        ],
        trips: [{ departed: '2024-09-08', returned: '2025-09-01' }],
      },
      'PT-GOLDEN-VISA',
    );
    expect(renewal.status).toBe('MET');
  });

  test('a period starting on the expiry day belongs to the next card', () => {
    // Task 75: a card valid to the second anniversary of the grant
    // (2026-01-10) is renewed by 2025-12-11; the year from 2026-01-10 is
    // not part of it.
    const p = pathway(
      {
        simulationDate: '2025-11-01',
        permits: [
          { kind: 'golden-visa', from: '2024-01-10', to: '2026-01-10' },
        ],
      },
      'PT-GOLDEN-VISA',
    );
    expect(p.status).toBe('MET');
    expect(p.checks[1].met).toBe(true);
    expect(p.summary).toContain('2025-10-12');
    expect(p.summary).toContain('2025-12-11');
  });

  test('a period starting after the renewal deadline is not required', () => {
    // review75-2: renewed late, the card to 2029-01-12 is renewed by
    // 2028-12-13; the period from 2029-01-10 belongs to the next card.
    const p = pathway(
      {
        simulationDate: '2028-11-01',
        permits: [
          { kind: 'golden-visa', from: '2024-01-10', to: '2026-01-10' },
          { kind: 'golden-visa', from: '2027-01-12', to: '2029-01-12' },
        ],
      },
      'PT-GOLDEN-VISA',
    );
    expect(p.status).toBe('MET');
    expect(p.summary).toContain('2028-12-13');
  });

  test('the renewed card in force is used', () => {
    const p = pathway(
      {
        simulationDate: '2027-11-01',
        permits: [
          { kind: 'golden-visa', from: '2024-01-10', to: '2026-01-09' },
          { kind: 'golden-visa', from: '2026-01-10', to: '2028-01-09' },
        ],
      },
      'PT-GOLDEN-VISA',
    );
    expect(p.status).toBe('MET');
    expect(p.summary).toContain('2028-01-09');
  });
});

test('English text', () => {
  const result = evaluatePortugal({ ...base, route: 'cplp', locale: 'en' });
  expect(result.policyAsOf).toBe('2026-11-22');
  expect(result.pathways.map((p) => p.id)).toEqual([
    'PT-NATURALISATION',
    'PT-PERMANENT',
    'PT-EU-LONG-TERM',
    'PT-GOLDEN-VISA',
  ]);
  expect(result.pathways[0].summary).toBe(
    'The earliest application date with 7 years of legal residence is 2027-03-16.',
  );
});
