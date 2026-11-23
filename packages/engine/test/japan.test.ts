import { describe, expect, test } from 'vitest';
import { evaluateJapan } from '../src';
import type { JpPathwayId, JpRequest } from '../src';

// In Japan since 2016-06-01, on a work status since 2019-10-01, born
// 1990-05-05. Guideline switch: applications from 2027-04-01.
const base: JpRequest = {
  simulationDate: '2026-11-22',
  stayStart: '2016-06-01',
  trips: [],
  pr: { route: 'general', statusStart: '2019-10-01' },
  naturalisation: { route: 'general', dateOfBirth: '1990-05-05' },
};

function pathway(req: Partial<JpRequest>, id: JpPathwayId) {
  const result = evaluateJapan({ ...base, ...req });
  const found = result.pathways.find((p) => p.id === id);
  if (!found) throw new Error(`missing ${id}`);
  return found;
}
const pr = (req: Partial<JpRequest>) => pathway(req, 'JP-PR');
const nat = (req: Partial<JpRequest>) => pathway(req, 'JP-NATURALISATION');

describe('永住許可, general route (10 years, 5 on a work status)', () => {
  test('met on the simulation date under the old guideline', () => {
    const p = pr({});
    expect(p.status).toBe('MET');
    expect(p.earliestDate).toBe('2026-11-22');
    expect(p.checks.every((c) => c.met)).toBe(true);
    // Applying from 2027-04-01 follows the new guideline.
    expect(p.summary).toContain('2027-04-01');
  });

  test('10 years of stay on the anniversary', () => {
    const p = pr({ stayStart: '2017-04-01' });
    expect(p.status).toBe('FUTURE');
    expect(p.earliestDate).toBe('2027-04-01');
  });

  test('5 years on a work or residence status', () => {
    const p = pr({ pr: { route: 'general', statusStart: '2023-01-15' } });
    expect(p.earliestDate).toBe('2028-01-15');
    expect(p.checks[1].met).toBe(false);
  });

  test('not within 10 years', () => {
    const p = pr({ stayStart: '2027-01-01' });
    expect(p.status).toBe('NOT_MET');
    expect(p.earliestDate).toBeUndefined();
  });

  test('a trip under the old guideline, which sets no limit (PD-132)', () => {
    const p = pr({
      trips: [{ departed: '2025-08-01', returned: '2025-08-20' }],
    });
    expect(p.status).toBe('UNKNOWN');
    expect(p.earliestDate).toBeUndefined();
    expect(p.summary).toContain('2026-11-22');
    // From 2027-04-01 the 18 days abroad are under the new limits.
    expect(p.summary).toContain('2027-04-01');
    expect(p.checks[2].met).toBeUndefined();
    expect(p.pendingDetails).toContain('PD-132');
  });

  test('an absence of more than 6 months under the new guideline', () => {
    // Abroad 2024-01-11 to 2024-07-10; it leaves the 10 years on 2034-07-11.
    const p = pr({
      stayStart: '2017-04-01',
      trips: [{ departed: '2024-01-10', returned: '2024-07-11' }],
    });
    expect(p.status).toBe('UNKNOWN');
    expect(p.summary).toContain('2027-04-01');
    expect(p.summary).toContain('2034-07-11');
  });

  test('under 181 days even with travel days is not half a year', () => {
    // 2024-01-10 to 2024-07-07: 180 days counting both travel days, and 6
    // calendar months span 181 to 184 days.
    const p = pr({
      stayStart: '2017-04-01',
      trips: [{ departed: '2024-01-10', returned: '2024-07-07' }],
    });
    expect(p.status).toBe('FUTURE');
    expect(p.earliestDate).toBe('2027-04-01');
  });

  // Six trips of 152 whole days abroad each: 912 days, and 30 calendar
  // months span 911 to 915 days.
  const trips = [
    { departed: '2018-01-01', returned: '2018-06-03' },
    { departed: '2019-01-01', returned: '2019-06-03' },
    { departed: '2020-01-01', returned: '2020-06-02' },
    { departed: '2021-01-01', returned: '2021-06-03' },
    { departed: '2022-01-01', returned: '2022-06-03' },
    { departed: '2023-01-01', returned: '2023-06-03' },
  ];
  const later = {
    simulationDate: '2027-06-01',
    stayStart: '2015-01-01',
    pr: { route: 'general', statusStart: '2015-01-01' },
  } as const;

  test('2 years 6 months abroad in total is uncertain from 911 days', () => {
    const p = pr({ ...later, trips });
    expect(p.status).toBe('UNKNOWN');
    expect(p.checks[3].text).toContain('912');
    expect(p.checks[3].text).toContain('911–915');
    expect(p.checks[3].met).toBeUndefined();
    // Counting travel days, each trip is 154 days: 924 in all. From
    // 2028-01-15 the window starts on 2018-01-15: 140 + 5 × 154 = 910.
    expect(p.summary).toContain('2028-01-15');
  });

  test('915 days or more reaches 30 months', () => {
    const p = pr({
      ...later,
      trips: [
        ...trips.slice(0, 5),
        { departed: '2023-01-01', returned: '2023-06-06' },
      ],
    });
    expect(p.checks[3].met).toBe(false);
  });
});

describe('永住許可 special routes and the 2027-04-01 switch', () => {
  test('spouse: 3 years married and 1 year of stay before the switch', () => {
    const p = pr({
      stayStart: '2025-10-01',
      pr: { route: 'spouse', marriedLifeFrom: '2023-12-01' },
    });
    expect(p.status).toBe('FUTURE');
    expect(p.earliestDate).toBe('2026-12-01');
    // Applying from 2027-04-01: 5 years married, 3 years of stay.
    expect(p.summary).toContain('2028-12-01');
  });

  test('spouse: 2027-03-31 is the last day for the old rule', () => {
    const at = (marriedLifeFrom: string) =>
      pr({ stayStart: '2024-01-01', pr: { route: 'spouse', marriedLifeFrom } })
        .earliestDate;
    expect(at('2024-03-31')).toBe('2027-03-31');
    expect(at('2024-04-01')).toBe('2029-04-01');
  });

  test('child: 1 year before the switch, 3 years after', () => {
    const at = (stayStart: string) =>
      pr({ stayStart, pr: { route: 'child' } }).earliestDate;
    expect(at('2026-02-01')).toBe('2027-02-01');
    expect(at('2026-05-01')).toBe('2029-05-01');
  });

  test('teijusha: 5 years as 定住者', () => {
    const p = pr({ pr: { route: 'teijusha', statusStart: '2022-03-01' } });
    expect(p.earliestDate).toBe('2027-03-01');
  });

  test('refugee: 5 years after recognition', () => {
    const p = pr({ pr: { route: 'refugee', statusStart: '2021-11-22' } });
    expect(p.status).toBe('MET');
  });

  test('highly skilled: 3 years at 70 points, 1 year at 80', () => {
    expect(
      pr({ pr: { route: 'hsp70', statusStart: '2024-05-10' } }).earliestDate,
    ).toBe('2027-05-10');
    expect(
      pr({ pr: { route: 'hsp80', statusStart: '2025-11-22' } }).status,
    ).toBe('MET');
  });

  test('the new absence test on a special route is uncertain (PD-133)', () => {
    const p = pr({
      simulationDate: '2027-06-01',
      pr: { route: 'refugee', statusStart: '2019-01-01' },
      trips: [{ departed: '2022-01-01', returned: '2022-09-01' }],
    });
    expect(p.status).toBe('UNKNOWN');
    expect(p.checks[1].met).toBeUndefined();
    expect(p.summary).toContain('PD-133');
  });
});

describe('re-entry permits', () => {
  const lapsing = {
    stayStart: '2015-01-01',
    pr: { route: 'general', statusStart: '2015-01-01' },
  } as const;

  test('past the deemed permit year the stay starts again', () => {
    const p = pr({
      ...lapsing,
      trips: [{ departed: '2020-03-01', returned: '2021-03-02' }],
    });
    expect(p.status).toBe('FUTURE');
    expect(p.earliestDate).toBe('2031-03-02');
    expect(p.checks[0].text).toContain('2021-03-02');
    expect(p.summary).toContain('2021-03-02');
  });

  test('back on the same date a year later keeps the stay', () => {
    const p = pr({
      ...lapsing,
      trips: [{ departed: '2020-03-01', returned: '2021-03-01' }],
    });
    // Not broken, but a year abroad: the old guideline sets no limit and
    // the new one counts it until it leaves the 10 years.
    expect(p.status).toBe('UNKNOWN');
    expect(p.summary).toContain('2031-03-01');
  });

  test('a regular re-entry permit keeps the stay past a year', () => {
    const p = pr({
      ...lapsing,
      trips: [
        { departed: '2020-03-01', returned: '2021-06-01', reentryPermit: true },
      ],
    });
    expect(p.status).toBe('UNKNOWN');
    expect(p.summary).toContain('2031-06-01');
    expect(p.summary).not.toContain('2021-06-01 重新起算');
  });

  test('from 29 February the deemed permit ends on 28 February', () => {
    const at = (returned: string) =>
      pr({
        stayStart: '2010-01-01',
        pr: { route: 'general', statusStart: '2010-01-01' },
        trips: [{ departed: '2024-02-29', returned }],
      });
    expect(at('2025-02-28').status).toBe('UNKNOWN');
    const lapsed = at('2025-03-01');
    expect(lapsed.status).toBe('FUTURE');
    expect(lapsed.earliestDate).toBe('2035-03-01');
  });

  test('a lapse also restarts naturalisation', () => {
    const p = nat({
      ...lapsing,
      trips: [{ departed: '2020-03-01', returned: '2021-03-02' }],
    });
    expect(p.status).toBe('FUTURE');
    expect(p.earliestDate).toBe('2031-03-02');
    expect(p.summary).toContain('2021-03-02');
  });
});

describe('帰化, general (art. 5 and the 10-year practice)', () => {
  test('met on the simulation date', () => {
    const p = nat({});
    expect(p.status).toBe('MET');
    expect(p.checks.every((c) => c.met)).toBe(true);
  });

  test('10 years of stay from 2026-04-01, with the legal date shown', () => {
    const p = nat({ stayStart: '2019-01-10' });
    expect(p.status).toBe('FUTURE');
    expect(p.earliestDate).toBe('2029-01-10');
    expect(p.checks[0].met).toBe(true);
    expect(p.checks[2].met).toBe(false);
    // By years alone the Nationality Act is met on the simulation date.
    expect(p.summary).toContain('按年限最早 2026-11-22');
  });

  test('aged 18 on the birthday', () => {
    const p = nat({
      stayStart: '2010-03-01',
      naturalisation: { route: 'general', dateOfBirth: '2010-03-01' },
    });
    expect(p.earliestDate).toBe('2028-03-01');
  });

  test('trips leave continuity uncertain (PD-138)', () => {
    const p = nat({
      trips: [{ departed: '2023-05-01', returned: '2023-05-10' }],
    });
    expect(p.status).toBe('UNKNOWN');
    expect(p.earliestDate).toBeUndefined();
    expect(p.summary).toContain('2026-11-22');
    // 8 whole days abroad.
    expect(p.summary).toContain('8 天');
    expect(p.checks[0].met).toBeUndefined();
    expect(p.checks[2].met).toBeUndefined();
  });

  test('not within 10 years, though the law alone is met', () => {
    const p = nat({ stayStart: '2027-01-01' });
    expect(p.status).toBe('NOT_MET');
    expect(p.summary).toContain('2032-01-01');
  });
});

describe('帰化, spouse of a Japanese national (art. 7)', () => {
  test('3 years of residence, the 10-year practice unclear (PD-137)', () => {
    const p = nat({
      stayStart: '2022-01-01',
      naturalisation: { route: 'spouse', marriedOn: '2023-06-01' },
    });
    expect(p.status).toBe('UNKNOWN');
    expect(p.checks[0].met).toBe(true);
    expect(p.checks[1].met).toBeUndefined();
    expect(p.summary).toContain('2026-11-22');
    expect(p.summary).toContain('2032-01-01');
  });

  test('3 years married and 1 year of domicile', () => {
    const at = (marriedOn: string) =>
      nat({
        stayStart: '2025-08-01',
        naturalisation: { route: 'spouse', marriedOn },
      });
    expect(at('2023-06-01').checks[0].met).toBe(true);
    const p = at('2024-01-01');
    expect(p.checks[0].met).toBe(false);
    expect(p.summary).toContain('2027-01-01');
  });

  test('met with 10 years of stay', () => {
    const p = nat({
      stayStart: '2015-01-01',
      naturalisation: { route: 'spouse', marriedOn: '2025-01-01' },
    });
    expect(p.status).toBe('MET');
  });
});

describe('review70-1', () => {
  test('stays the new guideline leaves out of the 10 years', () => {
    // 継続就職活動 from 2020-10-01 to 2021-03-31: 182 days.
    const excluded = [{ from: '2020-10-01', to: '2021-03-31' }];
    const p = pr({
      simulationDate: '2027-06-01',
      stayStart: '2017-05-01',
      pr: { route: 'general', statusStart: '2021-04-01', excluded },
    });
    expect(p.status).toBe('UNKNOWN');
    expect(p.checks[0].met).toBe(false);
    // Leaving the 182 days out: 2027-05-01 + 182 days. Counting again after
    // them: 2021-04-01 + 10 years.
    expect(p.summary).toContain('2027-10-30');
    expect(p.summary).toContain('2031-04-01');
    expect(p.summary).toContain('PD-134');
  });

  test('the old guideline does not say whether such stays count', () => {
    const p = pr({
      simulationDate: '2027-03-01',
      stayStart: '2016-05-01',
      pr: {
        route: 'general',
        statusStart: '2021-04-01',
        excluded: [{ from: '2020-10-01', to: '2021-03-31' }],
      },
    });
    expect(p.status).toBe('UNKNOWN');
    expect(p.checks[0].met).toBeUndefined();
    expect(p.summary).toContain('2027-03-01');
  });

  test('the deemed permit also ends with the period of stay', () => {
    const base2 = {
      simulationDate: '2027-06-01',
      stayStart: '2016-05-01',
      pr: { route: 'general', statusStart: '2018-05-01' },
    } as const;
    const trip = { departed: '2026-02-01', returned: '2026-04-01' };
    expect(pr({ ...base2, trips: [trip] }).status).toBe('MET');
    const p = pr({ ...base2, trips: [{ ...trip, stayExpiry: '2026-03-01' }] });
    // The stay starts again on 2026-04-01: 10 years on 2036-04-01.
    expect(p.status).toBe('FUTURE');
    expect(p.earliestDate).toBe('2036-04-01');
    expect(p.summary).toContain('2026-03-01');
  });

  test('a regular permit does not outlast the period of stay', () => {
    const p = pr({
      simulationDate: '2027-06-01',
      stayStart: '2016-05-01',
      pr: { route: 'general', statusStart: '2018-05-01' },
      trips: [
        {
          departed: '2026-02-01',
          returned: '2026-04-01',
          reentryPermit: true,
          stayExpiry: '2026-03-01',
        },
      ],
    });
    expect(p.earliestDate).toBe('2036-04-01');
  });

  test('married life for PR, the registration for art. 7', () => {
    const r = evaluateJapan({
      ...base,
      stayStart: '2025-06-01',
      pr: { route: 'spouse', marriedLifeFrom: '2025-06-01' },
      naturalisation: { route: 'spouse', marriedOn: '2023-10-01' },
    });
    // Too late for the old rule; 5 years of married life from 2025-06-01.
    expect(r.pathways[0].status).toBe('FUTURE');
    expect(r.pathways[0].earliestDate).toBe('2030-06-01');
    // Married 3 years on 2026-10-01 with 1 year of domicile on 2026-06-01.
    expect(r.pathways[1].checks[0].met).toBe(true);
  });

  test('exactly six calendar months abroad is uncertain', () => {
    // 2026-03-01 to 2026-09-01: 183 whole days abroad.
    const p = pr({
      simulationDate: '2027-06-01',
      stayStart: '2016-05-01',
      pr: { route: 'general', statusStart: '2018-05-01' },
      trips: [{ departed: '2026-03-01', returned: '2026-09-01' }],
    });
    expect(p.status).toBe('UNKNOWN');
    expect(p.checks[2].met).toBeUndefined();
  });

  test('a long trip that started before the 10 years is uncertain', () => {
    // Only 70 whole days of it fall after 2017-06-01.
    const p = pr({
      simulationDate: '2027-06-01',
      stayStart: '2010-01-01',
      pr: { route: 'general', statusStart: '2010-01-01' },
      trips: [{ departed: '2017-01-10', returned: '2017-08-10' }],
    });
    expect(p.status).toBe('UNKNOWN');
    expect(p.checks[2].met).toBeUndefined();
  });

  test('no application date during a trip', () => {
    const req: Partial<JpRequest> = {
      simulationDate: '2027-05-01',
      stayStart: '2017-06-01',
      pr: { route: 'general', statusStart: '2018-01-01' },
      trips: [{ departed: '2027-05-27', returned: '2027-06-14' }],
    };
    // 10 years on 2027-06-01, but abroad until 2027-06-14.
    const p = pr(req);
    expect(p.status).toBe('FUTURE');
    expect(p.earliestDate).toBe('2027-06-14');
    const n = nat(req);
    expect(n.status).toBe('UNKNOWN');
    expect(n.summary).toContain('2027-06-14');
    expect(n.summary).not.toContain('2027-06-01');
    // Abroad on the simulation date.
    const away = pr({ ...req, simulationDate: '2027-06-05' });
    expect(away.earliestDate).toBe('2027-06-14');
    expect(away.checks.at(-1)?.met).toBe(false);
  });

  test('the 10-year practice applies from 2026-04-01', () => {
    const p = nat({
      simulationDate: '2026-03-01',
      stayStart: '2019-02-01',
      naturalisation: { route: 'general', dateOfBirth: '1990-01-01' },
    });
    // The law is met, but the application may still be pending on
    // 2026-04-01 (PD-137); with the practice, 2019-02-01 + 10 years.
    expect(p.status).toBe('UNKNOWN');
    expect(p.summary).toContain('2026-03-01');
    expect(p.summary).toContain('2029-02-01');
    expect(p.checks[2].met).toBeUndefined();
  });

  test('trips cloud the 10-year line for a spouse too', () => {
    const p = nat({
      simulationDate: '2027-06-01',
      stayStart: '2017-05-01',
      naturalisation: { route: 'spouse', marriedOn: '2021-06-01' },
      trips: [
        { departed: '2023-01-01', returned: '2023-10-01', reentryPermit: true },
      ],
    });
    expect(p.status).toBe('UNKNOWN');
    expect(p.checks[0].met).toBe(true);
    expect(p.checks[1].met).toBeUndefined();
  });

  test('no "met" wording while trips leave naturalisation uncertain', () => {
    const p = nat({
      stayStart: '2018-06-01',
      naturalisation: { route: 'general', dateOfBirth: '1990-01-01' },
      trips: [
        { departed: '2025-03-01', returned: '2025-11-01', reentryPermit: true },
      ],
    });
    expect(p.status).toBe('UNKNOWN');
    expect(p.summary).not.toContain('模拟日已满足');
    expect(p.checks[0].met).toBeUndefined();
  });

  test('art. 7 needs the marriage by the application day', () => {
    const p = nat({
      stayStart: '2020-01-01',
      naturalisation: { route: 'spouse', marriedOn: '2027-01-01' },
    });
    expect(p.checks[0].met).toBe(false);
    expect(p.summary).toContain('2027-01-01');
  });

  test('a 29 February start reaches 10 years on 1 March', () => {
    const p = pr({
      simulationDate: '2028-02-29',
      stayStart: '2028-02-29',
      pr: { route: 'general', statusStart: '2028-02-29' },
    });
    expect(p.earliestDate).toBe('2038-03-01');
  });
});

describe('review70-2', () => {
  test('the new guideline counts work statuses from its own date', () => {
    // Intra-company Transferee from 2021-04-05 to 2024-03-31 counts under
    // the old guideline only.
    const at = (newStatusStart?: string) =>
      pr({
        simulationDate: '2027-03-30',
        stayStart: '2017-04-05',
        pr: { route: 'general', statusStart: '2017-04-05', newStatusStart },
      }).earliestDate;
    // 10 years on 2027-04-05 falls under the new guideline: 2024-04-01 + 5.
    expect(at('2024-04-01')).toBe('2029-04-01');
    // Left blank, the same start serves both guidelines.
    expect(at()).toBe('2027-04-05');
  });

  test('a deemed re-entry with a renewal pending (FAQ Q61)', () => {
    const req: Partial<JpRequest> = {
      simulationDate: '2027-05-10',
      stayStart: '2016-04-01',
      pr: { route: 'general', statusStart: '2018-04-01' },
    };
    const trip = {
      departed: '2027-04-15',
      returned: '2027-04-30',
      stayExpiry: '2027-04-20',
    };
    const pending = { ...req, trips: [{ ...trip, renewalPending: true }] };
    expect(pr(pending).status).toBe('MET');
    // Naturalisation still sees a trip in the 10 years.
    expect(nat(pending).status).toBe('UNKNOWN');
    // Without the pending renewal the status ended on 2027-04-20.
    const lapsed = pr({ ...req, trips: [trip] });
    expect(lapsed.status).toBe('FUTURE');
    expect(lapsed.earliestDate).toBe('2037-04-30');
    // A pending renewal keeps the status 2 months after expiry, no longer.
    const late = pr({
      ...req,
      simulationDate: '2027-07-01',
      trips: [{ ...trip, returned: '2027-06-21', renewalPending: true }],
    });
    expect(late.summary).toContain('2027-06-20');
    expect(late.summary).toContain('2027-06-21 重新起算');
  });

  test('a spouse 10-year date with trips is only a candidate', () => {
    const p = nat({
      simulationDate: '2027-06-01',
      stayStart: '2019-05-01',
      naturalisation: { route: 'spouse', marriedOn: '2023-06-01' },
      trips: [{ departed: '2022-11-15', returned: '2022-12-01' }],
    });
    expect(p.status).toBe('UNKNOWN');
    expect(p.summary).toContain('候选日是 2029-05-01');
    expect(p.summary).not.toContain('最早 2029-05-01');
  });

  test('a total near 30 months on the travel-day reading is uncertain', () => {
    // 903 whole days abroad, 915 counting both travel days.
    const p = pr({
      simulationDate: '2027-06-01',
      stayStart: '2015-01-01',
      pr: { route: 'general', statusStart: '2015-01-01' },
      trips: [
        { departed: '2018-01-01', returned: '2018-06-01' },
        { departed: '2019-01-01', returned: '2019-06-01' },
        { departed: '2020-01-01', returned: '2020-05-31' },
        { departed: '2021-01-01', returned: '2021-06-01' },
        { departed: '2022-01-01', returned: '2022-06-01' },
        { departed: '2023-01-01', returned: '2023-06-04' },
      ],
    });
    expect(p.status).toBe('UNKNOWN');
    expect(p.checks[3].text).toContain('903');
    expect(p.checks[3].text).toContain('915');
    expect(p.checks[3].met).toBeUndefined();
  });

  test('a trip under way on the simulation date counts so far', () => {
    const p = pr({
      simulationDate: '2027-05-10',
      stayStart: '2010-01-01',
      pr: { route: 'general', statusStart: '2010-01-01' },
      trips: [{ departed: '2027-05-01', returned: '2027-12-01' }],
    });
    // 8 whole days abroad by 2027-05-10.
    expect(p.checks[2].met).toBe(true);
    expect(p.checks.at(-1)?.met).toBe(false);
  });
});

describe('review70-3', () => {
  const ict = {
    stayStart: '2017-04-05',
    pr: {
      route: 'general',
      statusStart: '2017-04-05',
      newStatusStart: 'none',
    },
  } as const;

  test('no status the new guideline counts: its 5 years never start', () => {
    // Intra-company Transferee since 2021-04-05, still held.
    const p = pr({ ...ict, simulationDate: '2027-05-10' });
    expect(p.status).toBe('NOT_MET');
    expect(p.checks[1].met).toBe(false);
    expect(p.summary).toContain('PD-134');
  });

  test('the old guideline still counts it up to 2027-03-31', () => {
    const p = pr({
      ...ict,
      simulationDate: '2027-03-01',
      stayStart: '2017-02-01',
    });
    expect(p.status).toBe('MET');
    // From 2027-04-01 the new guideline is never met.
    expect(p.summary).toContain('10 年内达不到');
  });

  test('leaving during the renewal special period keeps the stay', () => {
    // Period of stay to 2027-04-20, renewal pending, away 05-01 to 05-08.
    const req: Partial<JpRequest> = {
      simulationDate: '2027-05-10',
      stayStart: '2016-04-01',
      pr: { route: 'general', statusStart: '2018-04-01' },
      trips: [
        {
          departed: '2027-05-01',
          returned: '2027-05-08',
          stayExpiry: '2027-04-20',
          renewalPending: true,
        },
      ],
    };
    expect(pr(req).status).toBe('MET');
    expect(nat(req).status).toBe('UNKNOWN');
  });
});

test('English text', () => {
  const result = evaluateJapan({ ...base, locale: 'en' });
  expect(result.pathways[0].title).toBe('Permanent residence (永住許可)');
  expect(result.pathways[1].summary).toContain(
    'You meet the time requirements for naturalisation',
  );
});
