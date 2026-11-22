import { describe, expect, test } from 'vitest';
import { evaluateAustralia } from '../src';
import type { AuPathwayId, AuRequest } from '../src';

const base: AuRequest = {
  simulationDate: '2026-11-21',
  dateOfBirth: '1990-05-01',
  firstArrival: '2020-02-01',
  visas: [],
  trips: [],
};

function pathway(req: Partial<AuRequest>, id: AuPathwayId) {
  const result = evaluateAustralia({ ...base, ...req });
  const found = result.pathways.find((p) => p.id === id);
  if (!found) throw new Error(`missing ${id}`);
  return found;
}

describe('subclass 191 (Sch 1 item 1139(3)(c))', () => {
  test('3 years on the current 491 is in the future', () => {
    const p = pathway(
      { visas: [{ subclass: '491', from: '2024-03-01', to: '2029-02-28' }] },
      'AU-191',
    );
    expect(p.status).toBe('FUTURE');
    expect(p.earliestDate).toBe('2027-03-01');
    expect(p.checks[0].met).toBe(false);
  });

  test('already 3 years on a 494', () => {
    const p = pathway(
      { visas: [{ subclass: '494', from: '2023-06-01', to: '2028-05-31' }] },
      'AU-191',
    );
    expect(p.status).toBe('MET');
    expect(p.earliestDate).toBe('2026-11-21');
  });

  test('the visa ends before 3 years', () => {
    const p = pathway(
      { visas: [{ subclass: '491', from: '2024-03-01', to: '2026-12-31' }] },
      'AU-191',
    );
    expect(p.status).toBe('NOT_MET');
    expect(p.earliestDate).toBeUndefined();
  });

  test('no 491 or 494 on the simulation date', () => {
    const p = pathway(
      { visas: [{ subclass: '482', from: '2024-03-01' }] },
      'AU-191',
    );
    expect(p.status).toBe('NOT_APPLICABLE');
  });
});

describe('Hong Kong streams (Sch 1 items 1137(4L), 1139(3)(ca))', () => {
  // First arrival 2020-02-01; a 482 from 2021-03-01 with no end date.
  const hk = (regional: boolean, extra: Partial<AuRequest> = {}) => ({
    simulationDate: '2025-01-01',
    visas: [{ subclass: '482' as const, from: '2021-03-01' }],
    hongKong: regional ? { regionalSince: '2020-02-01' } : {},
    ...extra,
  });

  test('not shown unless the Hong Kong questions are answered', () => {
    const result = evaluateAustralia({
      ...base,
      ...hk(true),
      hongKong: undefined,
    });
    expect(result.pathways.map((p) => p.id)).not.toContain('AU-189-HK');
  });

  test('189: 4 years on the visa and in Australia', () => {
    const p = pathway(hk(false), 'AU-189-HK');
    expect(p.status).toBe('FUTURE');
    expect(p.earliestDate).toBe('2025-03-01');
  });

  test('191: 3 years, only in regional areas', () => {
    const p = pathway(hk(true), 'AU-191-HK');
    expect(p.status).toBe('MET');
    expect(p.checks.every((c) => c.met)).toBe(true);
    expect(p.pendingDetails).toBeUndefined();
    const city = pathway(hk(false), 'AU-191-HK');
    expect(city.status).toBe('NOT_MET');
    expect(city.summary).toContain('189');
  });

  test('191: the regional years move with the application date', () => {
    // Moved from Sydney to a regional area on 2024-06-01.
    const p = pathway(
      {
        simulationDate: '2026-11-22',
        firstArrival: '2021-07-01',
        visas: [{ subclass: '482', from: '2022-12-01', to: '2027-11-30' }],
        hongKong: { regionalSince: '2024-06-01' },
      },
      'AU-191-HK',
    );
    expect(p.status).toBe('FUTURE');
    expect(p.earliestDate).toBe('2027-06-01');
  });

  test('a visa with no end date runs 5 years', () => {
    // Moved on 2025-06-01: 3 regional years only from 2028-06-01, after the
    // 5-year 482 from 2022-12-01 ends on 2027-11-30.
    const at = (to?: string) =>
      pathway(
        {
          simulationDate: '2026-11-22',
          firstArrival: '2021-07-01',
          visas: [
            { subclass: '482', from: '2022-12-01', ...(to ? { to } : {}) },
          ],
          hongKong: { regionalSince: '2025-06-01' },
        },
        'AU-191-HK',
      ).status;
    expect(at()).toBe('NOT_MET');
    expect(at('2027-11-30')).toBe('NOT_MET');
  });

  test('residence counts from the first arrival', () => {
    // Arrived 2022-06-01: 3 years in Australia only from 2025-06-01.
    const p = pathway(
      hk(true, {
        firstArrival: '2022-06-01',
        visas: [{ subclass: '485', from: '2022-06-01' }],
      }),
      'AU-191-HK',
    );
    expect(p.earliestDate).toBe('2025-06-01');
  });

  test('trips make usual residence uncertain (PD-108)', () => {
    const p = pathway(
      hk(true, { trips: [{ departed: '2023-07-01', returned: '2023-07-20' }] }),
      'AU-191-HK',
    );
    expect(p.status).toBe('UNKNOWN');
    expect(p.summary).toContain('2025-01-01');
    expect(p.pendingDetails).toContain('PD-108');
  });

  test('the visa ends before the years are reached', () => {
    const p = pathway(
      hk(false, {
        visas: [{ subclass: '482', from: '2021-03-01', to: '2024-12-31' }],
        simulationDate: '2024-06-01',
      }),
      'AU-189-HK',
    );
    expect(p.status).toBe('NOT_MET');
  });

  test('a permanent visa makes it not applicable', () => {
    const p = pathway(
      hk(true, {
        visas: [
          { subclass: '482', from: '2021-03-01', to: '2024-04-30' },
          { subclass: '191', from: '2024-05-01' },
        ],
      }),
      'AU-191-HK',
    );
    expect(p.status).toBe('NOT_APPLICABLE');
  });
});

describe('subclass 186 TRT (186.221, 186.226, 186.227)', () => {
  test('one continuous 482 reaches 2 calendar years', () => {
    const p = pathway(
      {
        visas: [{ subclass: '482', from: '2025-06-01' }],
        sponsoredFullTime: true,
      },
      'AU-186-TRT',
    );
    expect(p.status).toBe('FUTURE');
    expect(p.earliestDate).toBe('2027-06-01');
    expect(p.pendingDetails).toEqual(['PD-085']);
  });

  test('a related bridging visa counts, other visas do not', () => {
    const visas = (bridging: 'bridging-trt' | 'bridging') => [
      { subclass: '482' as const, from: '2024-01-01', to: '2024-12-31' },
      {
        subclass: 'other-temporary' as const,
        from: '2025-01-01',
        to: '2025-06-30',
      },
      { subclass: '482' as const, from: '2025-07-01', to: '2026-03-31' },
      { subclass: bridging, from: '2026-04-01' },
    ];
    const p = pathway(
      {
        simulationDate: '2026-01-01',
        visas: visas('bridging-trt'),
        sponsoredFullTime: true,
      },
      'AU-186-TRT',
    );
    // Separate periods: 366 days in 2024, then from 2025-07-01; 731 in total
    // on 2026-07-01 (730 on 2026-06-30, PD-085).
    expect(p.earliestDate).toBe('2026-07-01');
    expect(p.status).toBe('FUTURE');
    // A bridging visa for another application neither counts nor qualifies.
    expect(
      pathway(
        {
          simulationDate: '2026-01-01',
          visas: visas('bridging'),
          sponsoredFullTime: true,
        },
        'AU-186-TRT',
      ).status,
    ).toBe('NOT_MET');
  });

  test('one whole 2-year period in the window is enough', () => {
    const p = pathway(
      {
        simulationDate: '2028-03-01',
        visas: [
          { subclass: '482', from: '2025-03-01', to: '2027-02-28' },
          { subclass: 'other-temporary', from: '2027-03-01', to: '2028-02-29' },
          { subclass: '482', from: '2028-03-01' },
        ],
        sponsoredFullTime: true,
      },
      'AU-186-TRT',
    );
    expect(p.status).toBe('MET');
  });

  test('work counts only from the first arrival', () => {
    const p = pathway(
      {
        firstArrival: '2025-11-21',
        visas: [{ subclass: '482', from: '2024-06-01' }],
        sponsoredFullTime: true,
      },
      'AU-186-TRT',
    );
    expect(p.checks[0].met).toBe(true);
    expect(p.checks[1].met).toBe(false);
    expect(p.earliestDate).toBe('2027-11-21');
  });

  test('separate periods across a leap day need 731 days (PD-085)', () => {
    const p = pathway(
      {
        visas: [
          { subclass: '482', from: '2026-01-01', to: '2026-12-31' },
          { subclass: '482', from: '2027-03-01' },
        ],
        sponsoredFullTime: true,
      },
      'AU-186-TRT',
    );
    // 365 + 365 days on 2028-02-29; the 2 years before 2028-03-01 have 731.
    expect(p.earliestDate).toBe('2028-03-01');
  });

  test('work outside Australia does not count', () => {
    const p = pathway(
      {
        firstArrival: '2025-11-21',
        visas: [{ subclass: '482', from: '2025-11-21' }],
        trips: [{ departed: '2027-01-01', returned: '2027-04-01' }],
        sponsoredFullTime: true,
      },
      'AU-186-TRT',
    );
    // 407 days to 2027-01-01, then 324 from 2027-04-01: 731 on 2028-02-19.
    expect(p.earliestDate).toBe('2028-02-19');
  });

  test('a period from 29 February runs to the end of February', () => {
    const p = pathway(
      {
        simulationDate: '2026-01-01',
        firstArrival: '2024-02-29',
        visas: [{ subclass: '482', from: '2024-02-29' }],
        sponsoredFullTime: true,
      },
      'AU-186-TRT',
    );
    expect(p.earliestDate).toBe('2026-03-01');
    expect(
      pathway(
        {
          simulationDate: '2026-01-01',
          visas: [{ subclass: '491', from: '2024-02-29', to: '2029-02-27' }],
        },
        'AU-191',
      ).earliestDate,
    ).toBe('2027-03-01');
  });

  test('work starts on return when a 482 is granted after leaving', () => {
    const p = pathway(
      {
        simulationDate: '2026-01-01',
        dateOfBirth: '1990-01-01',
        firstArrival: '2019-01-01',
        visas: [
          { subclass: 'other-temporary', from: '2019-01-01', to: '2023-12-31' },
          { subclass: '482', from: '2024-01-01' },
        ],
        trips: [{ departed: '2024-01-01', returned: '2024-01-02' }],
        sponsoredFullTime: true,
      },
      'AU-186-TRT',
    );
    expect(p.checks[1].text).toContain('730');
    expect(p.earliestDate).toBe('2026-01-02');
  });

  test('work that falls short is reported as such', () => {
    const p = pathway(
      {
        firstArrival: '2024-11-21',
        visas: [{ subclass: '482', from: '2024-11-21', to: '2027-01-31' }],
        trips: [{ departed: '2025-05-01', returned: '2025-08-01' }],
        sponsoredFullTime: true,
      },
      'AU-186-TRT',
    );
    // 162 + 548 = 710 days of work by 2027-01-31, short of 731.
    expect(p.status).toBe('NOT_MET');
    expect(p.summary).toContain('2026-11-21');
  });

  test('anniversaries of other dates stay on the same day', () => {
    expect(
      pathway(
        {
          simulationDate: '2028-02-29',
          visas: [{ subclass: '491', from: '2025-03-01', to: '2030-02-28' }],
        },
        'AU-191',
      ).earliestDate,
    ).toBe('2028-03-01');
    expect(
      pathway(
        {
          simulationDate: '2028-02-29',
          dateOfBirth: '2010-03-01',
          firstArrival: '2019-01-01',
          visas: [{ subclass: '189', from: '2019-01-01' }],
        },
        'AU-CITIZENSHIP',
      ).earliestDate,
    ).toBe('2028-03-01');
  });

  test('late arrival is reported as too little work, not trips', () => {
    const p = pathway(
      {
        firstArrival: '2025-06-01',
        visas: [{ subclass: '482', from: '2024-11-21', to: '2027-01-31' }],
        sponsoredFullTime: true,
      },
      'AU-186-TRT',
    );
    expect(p.status).toBe('NOT_MET');
    expect(p.summary).toContain('入境后');
    expect(p.summary).not.toContain('出境');
  });

  test('without confirmed work, the age message speaks of visa time only', () => {
    const p = pathway(
      {
        dateOfBirth: '1982-01-01',
        firstArrival: undefined,
        visas: [{ subclass: '482', from: '2025-06-01' }],
      },
      'AU-186-TRT',
    );
    expect(p.status).toBe('NOT_MET');
    expect(p.summary).toContain('持签时长到 2027-06-01');
  });

  test('not confirming full-time sponsored work leaves it unknown', () => {
    const p = pathway(
      { visas: [{ subclass: '482', from: '2025-06-01' }] },
      'AU-186-TRT',
    );
    expect(p.status).toBe('UNKNOWN');
    expect(p.earliestDate).toBeUndefined();
    expect(p.summary).toContain('2027-06-01');
    expect(p.checks[1].met).toBeUndefined();
  });

  test('turning 45 first', () => {
    const p = pathway(
      {
        dateOfBirth: '1982-03-01',
        visas: [{ subclass: '482', from: '2025-06-01' }],
        sponsoredFullTime: true,
      },
      'AU-186-TRT',
    );
    expect(p.status).toBe('NOT_MET');
    expect(p.summary).toContain('2027-03-01');
  });
});

describe('partner visa permanent stage (801.221, 100.221)', () => {
  test('2 years after the combined application', () => {
    const p = pathway(
      {
        partnerApplication: {
          lodged: '2025-03-10',
          stream: 'onshore',
          longTermRelationship: false,
        },
      },
      'AU-PARTNER',
    );
    expect(p.status).toBe('FUTURE');
    expect(p.earliestDate).toBe('2027-03-10');
  });

  test('a long-term relationship needs no wait', () => {
    const p = pathway(
      {
        partnerApplication: {
          lodged: '2026-10-01',
          stream: 'offshore',
          longTermRelationship: true,
        },
      },
      'AU-PARTNER',
    );
    expect(p.status).toBe('MET');
    expect(p.summary).toContain('100');
  });
});

describe('Resident Return visa (155.212(2))', () => {
  test('730 days in 5 years is met', () => {
    const p = pathway(
      {
        firstArrival: '2019-06-01',
        visas: [{ subclass: '189', from: '2020-01-01' }],
      },
      'AU-RRV',
    );
    expect(p.status).toBe('MET');
    expect(p.summary).toContain('2025-01-01');
  });

  test('a long absence pushes the date out', () => {
    const p = pathway(
      {
        firstArrival: '2019-06-01',
        // The 189 ends on 2025-01-01 while away (s82(5)); an RRV brings them back.
        visas: [
          { subclass: '189', from: '2020-01-01' },
          { subclass: '155', from: '2025-06-01' },
        ],
        trips: [{ departed: '2022-01-01', returned: '2026-06-01' }],
      },
      'AU-RRV',
    );
    // From 2021-11-21 to 2022-01-01 (42 days) and from 2026-06-01: 730 days
    // on 2028-05-31 once the early days leave the window.
    expect(p.checks[0].text).toContain('215');
    expect(p.status).toBe('FUTURE');
    expect(p.earliestDate).toBe('2028-05-31');
  });

  test('arrival and departure days count as in Australia', () => {
    const away = pathway(
      {
        simulationDate: '2026-01-01',
        firstArrival: '2021-01-01',
        visas: [{ subclass: '189', from: '2020-12-01' }],
        trips: [{ departed: '2021-01-01', returned: '2024-01-02' }],
      },
      'AU-RRV',
    );
    // 2021-01-01 and every day from 2024-01-02 to 2025-12-31.
    expect(away.checks[0].text).toContain(`${1 + 730}`);
  });

  test('a permanent visa ends an earlier temporary visa (s82(2))', () => {
    const p = pathway(
      {
        firstArrival: '2019-06-01',
        visas: [
          { subclass: 'other-temporary', from: '2019-06-01', to: '2021-12-31' },
          { subclass: '189', from: '2020-01-01' },
        ],
      },
      'AU-RRV',
    );
    // The temporary visa ends on 2019-12-31, so all 1,826 days count.
    expect(p.checks[0].text).toContain('1826');
  });

  test('an RRV replaces the earlier permanent visa (s82(2))', () => {
    const p = pathway(
      {
        firstArrival: '2015-06-01',
        visas: [
          { subclass: '189', from: '2015-06-01' },
          { subclass: '155', from: '2025-12-01', to: '2026-11-23' },
        ],
        trips: [{ departed: '2022-01-01', returned: '2026-01-01' }],
      },
      'AU-RRV',
    );
    expect(p.checks[0].text).toContain('366');
    expect(p.status).toBe('NOT_MET');
  });

  test('a permanent visa ends on leaving after its travel facility (s82(6))', () => {
    const p = pathway(
      {
        firstArrival: '2019-01-01',
        visas: [{ subclass: '189', from: '2019-01-01' }],
        trips: [{ departed: '2025-03-01', returned: '2026-12-01' }],
      },
      'AU-RRV',
    );
    expect(p.status).toBe('NOT_APPLICABLE');
  });

  test('an RRV travel facility is not assumed to be 5 years', () => {
    const p = pathway(
      {
        firstArrival: '2015-06-01',
        visas: [
          { subclass: '189', from: '2015-06-01' },
          { subclass: '155', from: '2026-02-01' },
        ],
      },
      'AU-RRV',
    );
    expect(p.summary).toContain('155.511');
    expect(p.summary).not.toContain('2031');
  });

  test('other permanent visas do not get a 5-year estimate', () => {
    const p = pathway(
      {
        firstArrival: '2015-06-01',
        visas: [{ subclass: 'other-permanent', from: '2026-02-01' }],
      },
      'AU-RRV',
    );
    expect(p.summary).not.toContain('2031');
  });

  test('the permanent visa must still be held on the application date', () => {
    const p = pathway(
      {
        firstArrival: '2024-11-25',
        visas: [{ subclass: '189', from: '2024-11-25', to: '2026-11-23' }],
      },
      'AU-RRV',
    );
    expect(p.checks[0].text).toContain('726');
    expect(p.status).toBe('NOT_MET');
  });

  test('leaving after the travel facility ends the visa, even for a day', () => {
    expect(
      pathway(
        {
          simulationDate: '2025-03-02',
          firstArrival: '2019-01-01',
          visas: [{ subclass: '189', from: '2019-01-01' }],
          trips: [{ departed: '2025-03-01', returned: '2025-03-01' }],
        },
        'AU-RRV',
      ).status,
    ).toBe('NOT_APPLICABLE');
  });

  test('not entering before the travel facility runs out ends the visa', () => {
    expect(
      pathway(
        {
          firstArrival: '2024-06-01',
          visas: [{ subclass: '189', from: '2019-01-01' }],
        },
        'AU-RRV',
      ).status,
    ).toBe('NOT_APPLICABLE');
  });

  test('a trip before the 5-year window still ends the visa', () => {
    expect(
      pathway(
        {
          simulationDate: '2023-07-01',
          firstArrival: '2010-01-01',
          visas: [{ subclass: '189', from: '2010-01-01' }],
          trips: [{ departed: '2018-06-01', returned: '2018-06-15' }],
        },
        'AU-RRV',
      ).status,
    ).toBe('NOT_APPLICABLE');
  });

  test('days also on a bridging visa do not count (155.212(2)(b))', () => {
    const p = pathway(
      {
        firstArrival: '2024-11-21',
        visas: [
          { subclass: '189', from: '2024-11-21' },
          { subclass: 'bridging', from: '2026-11-11', to: '2026-11-20' },
        ],
      },
      'AU-RRV',
    );
    expect(p.checks[0].text).toContain('720');
    expect(p.status).toBe('FUTURE');
  });

  test('a bridging visa held while leaving still counts against the RRV', () => {
    const p = pathway(
      {
        simulationDate: '2025-07-02',
        firstArrival: '2023-07-02',
        visas: [
          { subclass: '189', from: '2023-07-02' },
          { subclass: 'bridging', from: '2025-06-30' },
          { subclass: '155', from: '2025-07-01' },
        ],
        trips: [{ departed: '2025-07-01', returned: '2025-07-02' }],
      },
      'AU-RRV',
    );
    expect(p.checks[0].text).toContain('729');
    expect(p.earliestDate).toBe('2025-07-03');
  });

  test('a departure on the first day of the window', () => {
    const p = pathway(
      {
        simulationDate: '2025-07-02',
        firstArrival: '2019-01-01',
        visas: [
          { subclass: '309', from: '2019-01-01' },
          { subclass: '100', from: '2020-07-02' },
        ],
        trips: [{ departed: '2020-07-02', returned: '2023-07-04' }],
      },
      'AU-RRV',
    );
    expect(p.checks[0].text).toContain('729');
    expect(p.earliestDate).toBe('2025-07-03');
  });

  test('no permanent visa', () => {
    expect(
      pathway({ visas: [{ subclass: '482', from: '2024-01-01' }] }, 'AU-RRV')
        .status,
    ).toBe('NOT_APPLICABLE');
  });
});

describe('citizenship, general residence requirement (s21(2), s22)', () => {
  test('met on the simulation date', () => {
    const p = pathway(
      {
        firstArrival: '2021-02-01',
        visas: [
          { subclass: 'other-temporary', from: '2021-02-01', to: '2023-08-31' },
          { subclass: '189', from: '2023-09-01' },
        ],
      },
      'AU-CITIZENSHIP',
    );
    expect(p.status).toBe('MET');
    expect(p.checks.every((c) => c.met)).toBe(true);
    expect(p.pendingDetails).toBeUndefined();
  });

  test('4 years since first arrival comes last', () => {
    const p = pathway(
      {
        firstArrival: '2023-01-10',
        visas: [
          { subclass: '482', from: '2023-01-10', to: '2025-11-30' },
          { subclass: '186', from: '2025-12-01' },
        ],
      },
      'AU-CITIZENSHIP',
    );
    expect(p.status).toBe('FUTURE');
    expect(p.earliestDate).toBe('2027-01-10');
  });

  test('more than 90 days away in the last 12 months', () => {
    const p = pathway(
      {
        firstArrival: '2019-01-01',
        // An RRV before travelling keeps the permanent visa (s82(6)).
        visas: [
          { subclass: '189', from: '2019-01-01' },
          { subclass: '155', from: '2025-01-01' },
        ],
        trips: [{ departed: '2026-07-01', returned: '2026-10-15' }],
      },
      'AU-CITIZENSHIP',
    );
    expect(p.checks[5].text).toContain('105');
    expect(p.pendingDetails).toBeUndefined();
    // [2026-07-17, 2026-10-14] is 90 days.
    expect(p.earliestDate).toBe('2027-07-17');
  });

  test('a day without a visa in Australia restarts the 4 years', () => {
    const p = pathway(
      {
        firstArrival: '2020-01-01',
        visas: [
          { subclass: 'other-temporary', from: '2020-01-01', to: '2024-05-31' },
          { subclass: '191', from: '2024-07-01' },
        ],
      },
      'AU-CITIZENSHIP',
    );
    expect(p.earliestDate).toBe('2028-07-01');
  });

  test('a gap while outside Australia is not unlawful', () => {
    const p = pathway(
      {
        firstArrival: '2020-01-01',
        visas: [
          { subclass: 'other-temporary', from: '2020-01-01', to: '2024-05-31' },
          { subclass: '191', from: '2024-07-01' },
        ],
        trips: [{ departed: '2024-05-31', returned: '2024-07-01' }],
      },
      'AU-CITIZENSHIP',
    );
    expect(p.status).toBe('MET');
  });

  test('the SOP scenario: 363 days away meets the 4 years', () => {
    const p = pathway(
      {
        simulationDate: '2020-01-01',
        firstArrival: '2016-01-01',
        visas: [
          { subclass: 'other-temporary', from: '2016-01-01', to: '2018-12-31' },
          { subclass: 'other-permanent', from: '2019-01-01' },
        ],
        trips: [
          { departed: '2017-09-07', returned: '2018-06-30' },
          { departed: '2019-03-23', returned: '2019-05-29' },
        ],
      },
      'AU-CITIZENSHIP',
    );
    // 295 + 66 days with both travel days in Australia (the example: 363).
    expect(p.checks[2].text).toContain('361');
    expect(p.status).toBe('MET');
  });

  test('the SOP example count can push the date out (PD-084)', () => {
    const p = pathway(
      {
        firstArrival: '2019-01-01',
        visas: [
          { subclass: '189', from: '2019-01-01' },
          { subclass: '155', from: '2025-01-01' },
        ],
        trips: [
          { departed: '2026-01-15', returned: '2026-02-14' },
          { departed: '2026-04-01', returned: '2026-06-01' },
        ],
      },
      'AU-CITIZENSHIP',
    );
    // 29 + 60 = 89 days; counted as in the example, 91 until 2027-01-16.
    expect(p.status).toBe('MET');
    expect(p.summary).toContain('2027-01-16');
    expect(p.pendingDetails).toEqual(['PD-084']);
  });

  test('a permanent visa granted abroad counts from entry (s5(1))', () => {
    const p = pathway(
      {
        simulationDate: '2026-07-01',
        firstArrival: '2020-01-01',
        visas: [
          { subclass: 'other-temporary', from: '2020-01-01', to: '2025-06-30' },
          { subclass: '100', from: '2025-07-01' },
        ],
        trips: [{ departed: '2025-05-01', returned: '2025-09-01' }],
      },
      'AU-CITIZENSHIP',
    );
    expect(p.earliestDate).toBe('2026-09-01');
  });

  test('a permanent visa from the departure day may come after leaving', () => {
    const p = pathway(
      {
        simulationDate: '2026-07-01',
        firstArrival: '2020-01-01',
        visas: [
          { subclass: 'other-temporary', from: '2020-01-01', to: '2025-07-01' },
          { subclass: '100', from: '2025-07-01' },
        ],
        trips: [{ departed: '2025-07-01', returned: '2025-09-01' }],
      },
      'AU-CITIZENSHIP',
    );
    expect(p.earliestDate).toBe('2026-09-01');
  });

  test('an overnight trip on the day an offshore grant starts', () => {
    const p = pathway(
      {
        simulationDate: '2026-07-01',
        firstArrival: '2020-01-01',
        visas: [
          { subclass: 'other-temporary', from: '2020-01-01', to: '2025-07-01' },
          { subclass: '100', from: '2025-07-01' },
        ],
        trips: [{ departed: '2025-07-01', returned: '2025-07-02' }],
      },
      'AU-CITIZENSHIP',
    );
    expect(p.earliestDate).toBe('2026-07-02');
  });

  test('replacing a permanent visa on the departure day keeps residence', () => {
    const request = {
      simulationDate: '2025-07-02',
      firstArrival: '2020-01-01',
      // The 189's travel facility runs to 2026-01-01.
      visas: [
        { subclass: '189' as const, from: '2021-01-01' },
        { subclass: '155' as const, from: '2025-07-01' },
      ],
      trips: [{ departed: '2025-07-01', returned: '2025-07-15' }],
    };
    expect(pathway(request, 'AU-CITIZENSHIP').status).toBe('MET');
    // After the facility, a 155 from the departure day comes after leaving,
    // so the 189 ends on leaving (s82(6)) and residence breaks that day.
    expect(
      pathway(
        {
          ...request,
          visas: [
            { subclass: '189', from: '2020-01-01' },
            { subclass: '155', from: '2025-07-01' },
          ],
        },
        'AU-CITIZENSHIP',
      ).earliestDate,
    ).toBe('2026-07-02');
  });

  test('a permanent visa that ends on leaving breaks residence that day', () => {
    const p = pathway(
      {
        simulationDate: '2025-03-10',
        firstArrival: '2019-01-01',
        visas: [
          { subclass: '189', from: '2019-01-01' },
          { subclass: '155', from: '2025-03-02' },
        ],
        trips: [{ departed: '2025-03-01', returned: '2025-03-10' }],
      },
      'AU-CITIZENSHIP',
    );
    // No permanent visa from leaving on 03-01 until the 155 during 03-02.
    expect(p.earliestDate).toBe('2026-03-03');
  });

  test('a permanent visa that ended before leaving does not carry over', () => {
    const p = pathway(
      {
        simulationDate: '2025-03-10',
        firstArrival: '2019-01-01',
        visas: [
          { subclass: '189', from: '2021-01-01', to: '2025-02-27' },
          { subclass: 'bridging', from: '2025-02-28', to: '2025-03-01' },
          { subclass: '100', from: '2025-03-02' },
        ],
        trips: [{ departed: '2025-03-01', returned: '2025-03-10' }],
      },
      'AU-CITIZENSHIP',
    );
    expect(p.earliestDate).toBe('2026-03-10');
  });

  test('a new permanent visa on the day one ends on leaving', () => {
    const p = pathway(
      {
        simulationDate: '2025-03-10',
        firstArrival: '2019-01-01',
        visas: [
          { subclass: '189', from: '2019-01-01' },
          { subclass: '155', from: '2025-03-01' },
        ],
        trips: [{ departed: '2025-03-01', returned: '2025-03-10' }],
      },
      'AU-CITIZENSHIP',
    );
    expect(p.earliestDate).toBe('2026-03-02');
  });

  test('time without a visa before leaving on the departure day', () => {
    const p = pathway(
      {
        simulationDate: '2026-07-02',
        firstArrival: '2020-01-01',
        visas: [
          { subclass: 'other-temporary', from: '2020-01-01', to: '2025-06-30' },
          { subclass: '100', from: '2025-07-01' },
        ],
        trips: [{ departed: '2025-07-01', returned: '2025-07-02' }],
      },
      'AU-CITIZENSHIP',
    );
    expect(p.checks[3].text).toContain('1');
    expect(p.earliestDate).toBe('2029-07-02');
  });

  test('replacing a permanent visa on the last day of its facility', () => {
    const p = pathway(
      {
        simulationDate: '2025-03-10',
        firstArrival: '2020-03-02',
        visas: [
          { subclass: '189', from: '2020-03-02' },
          { subclass: '155', from: '2025-03-01' },
        ],
        trips: [{ departed: '2025-03-01', returned: '2025-03-10' }],
      },
      'AU-CITIZENSHIP',
    );
    expect(p.status).toBe('MET');
  });

  test('a facility running out abroad before a new visa starts', () => {
    const request = {
      simulationDate: '2025-03-10',
      firstArrival: '2020-03-02',
      trips: [{ departed: '2025-03-01', returned: '2025-03-10' }],
    };
    // The 189's facility ends on 2025-03-01 while abroad (s82(5)).
    for (const [from, earliest, end] of [
      ['2025-03-02', '2026-03-03', undefined],
      ['2025-03-02', '2026-03-03', '2025-03-01'],
      ['2025-03-05', '2026-03-06', undefined],
    ] as const)
      expect(
        pathway(
          {
            ...request,
            visas: [
              { subclass: '189', from: '2020-03-02', to: end },
              { subclass: '155', from },
            ],
          },
          'AU-CITIZENSHIP',
        ).earliestDate,
      ).toBe(earliest);
  });

  test('a temporary visa in between breaks permanent residence', () => {
    const p = pathway(
      {
        simulationDate: '2025-03-10',
        firstArrival: '2020-04-01',
        visas: [
          { subclass: '189', from: '2020-04-01' },
          { subclass: '482', from: '2025-03-01' },
          { subclass: '155', from: '2025-03-02' },
        ],
        trips: [{ departed: '2025-03-01', returned: '2025-03-10' }],
      },
      'AU-CITIZENSHIP',
    );
    expect(p.earliestDate).toBe('2026-03-03');
  });

  test('a permanent visa granted abroad on the return day', () => {
    const p = pathway(
      {
        simulationDate: '2025-03-02',
        firstArrival: '2019-01-01',
        visas: [
          { subclass: '189', from: '2019-01-01' },
          { subclass: '155', from: '2025-03-02' },
        ],
        trips: [{ departed: '2025-03-01', returned: '2025-03-02' }],
      },
      'AU-CITIZENSHIP',
    );
    expect(p.earliestDate).toBe('2026-03-03');
  });

  test('an RRV that expired abroad before the next one was granted', () => {
    const p = pathway(
      {
        simulationDate: '2025-03-10',
        firstArrival: '2015-04-01',
        visas: [
          { subclass: '189', from: '2015-04-01' },
          { subclass: '155', from: '2020-03-02', to: '2025-03-01' },
          { subclass: '155', from: '2025-03-02' },
        ],
        trips: [{ departed: '2025-02-28', returned: '2025-03-10' }],
      },
      'AU-CITIZENSHIP',
    );
    expect(p.status).toBe('FUTURE');
    expect(p.earliestDate).toBe('2026-03-03');
  });

  test('two permanent visas granted abroad on the departure day', () => {
    const p = pathway(
      {
        simulationDate: '2026-07-01',
        firstArrival: '2020-01-01',
        visas: [
          { subclass: 'other-temporary', from: '2020-01-01', to: '2025-07-01' },
          { subclass: '100', from: '2025-07-01' },
          { subclass: '155', from: '2025-07-01' },
        ],
        trips: [{ departed: '2025-07-01', returned: '2025-07-02' }],
      },
      'AU-CITIZENSHIP',
    );
    expect(p.earliestDate).toBe('2026-07-02');
  });

  test('visas starting the same day follow the order entered', () => {
    expect(
      pathway(
        {
          visas: [
            { subclass: '491', from: '2023-03-01' },
            { subclass: '482', from: '2023-03-01' },
          ],
        },
        'AU-191',
      ).status,
    ).toBe('NOT_APPLICABLE');
  });

  test('not yet arrived', () => {
    const p = pathway(
      {
        firstArrival: undefined,
        visas: [{ subclass: '100', from: '2026-10-01' }],
      },
      'AU-CITIZENSHIP',
    );
    expect(p.status).toBe('NOT_MET');
    expect(p.checks[1].met).toBe(false);
  });

  test('under 18', () => {
    const p = pathway(
      {
        dateOfBirth: '2010-01-01',
        firstArrival: '2019-01-01',
        visas: [{ subclass: '189', from: '2019-01-01' }],
      },
      'AU-CITIZENSHIP',
    );
    expect(p.earliestDate).toBe('2028-01-01');
  });

  test('needs a permanent visa first', () => {
    const p = pathway(
      { visas: [{ subclass: '491', from: '2024-03-01' }] },
      'AU-CITIZENSHIP',
    );
    expect(p.status).toBe('NOT_APPLICABLE');
  });
});

test('a permanent visa holder does not need the permanent residence pathways', () => {
  const result = evaluateAustralia({
    ...base,
    visas: [
      { subclass: '482', from: '2021-02-01', to: '2023-08-31' },
      { subclass: '186', from: '2023-09-01' },
    ],
    partnerApplication: {
      lodged: '2023-01-01',
      stream: 'onshore',
      longTermRelationship: false,
    },
  });
  for (const id of ['AU-191', 'AU-186-TRT', 'AU-PARTNER'])
    expect(result.pathways.find((p) => p.id === id)?.status).toBe(
      'NOT_APPLICABLE',
    );
});

test('a 482 that ended before the simulation date does not apply', () => {
  const p = pathway(
    {
      visas: [
        { subclass: '482', from: '2021-02-01', to: '2023-08-31' },
        { subclass: 'other-temporary', from: '2023-09-01' },
      ],
    },
    'AU-186-TRT',
  );
  expect(p.status).toBe('NOT_APPLICABLE');
});

test('English text', () => {
  const result = evaluateAustralia({
    ...base,
    locale: 'en',
    visas: [{ subclass: '491', from: '2024-03-01', to: '2029-02-28' }],
  });
  expect(result.pathways[0].summary).toContain('3 years on 2027-03-01');
});
