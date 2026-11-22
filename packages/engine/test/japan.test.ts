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

  test('back on the same date 6 months later is not half a year', () => {
    const p = pr({
      stayStart: '2017-04-01',
      trips: [{ departed: '2024-01-10', returned: '2024-07-10' }],
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
    // From 2028-01-04 the window starts on 2018-01-04: 150 + 5 × 152 = 910.
    expect(p.summary).toContain('2028-01-04');
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
      pr: { route: 'spouse', marriedOn: '2023-12-01' },
    });
    expect(p.status).toBe('FUTURE');
    expect(p.earliestDate).toBe('2026-12-01');
    // Applying from 2027-04-01: 5 years married, 3 years of stay.
    expect(p.summary).toContain('2028-12-01');
  });

  test('spouse: 2027-03-31 is the last day for the old rule', () => {
    const at = (marriedOn: string) =>
      pr({ stayStart: '2024-01-01', pr: { route: 'spouse', marriedOn } })
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
    expect(p.summary).toContain('模拟日已满足');
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

test('English text', () => {
  const result = evaluateJapan({ ...base, locale: 'en' });
  expect(result.pathways[0].title).toBe('Permanent residence (永住許可)');
  expect(result.pathways[1].summary).toContain(
    'You meet the time requirements for naturalisation',
  );
});
