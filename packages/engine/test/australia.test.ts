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

  test('not confirming full-time sponsored work leaves it unknown', () => {
    const p = pathway(
      { visas: [{ subclass: '482', from: '2025-06-01' }] },
      'AU-186-TRT',
    );
    expect(p.status).toBe('UNKNOWN');
    expect(p.earliestDate).toBeUndefined();
    expect(p.summary).toContain('2027-06-01');
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
        visas: [{ subclass: '189', from: '2020-01-01' }],
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
        visas: [{ subclass: '189', from: '2021-01-01' }],
        trips: [{ departed: '2021-01-01', returned: '2024-01-02' }],
      },
      'AU-RRV',
    );
    // 2021-01-01 and every day from 2024-01-02 to 2025-12-31.
    expect(away.checks[0].text).toContain(`${1 + 730}`);
  });

  test('days also on a temporary visa do not count (155.212(2)(b))', () => {
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
    // 1,826 days from 2021-11-21 to 2026-11-20, less 41 to 2021-12-31.
    expect(p.checks[0].text).toContain('1785');
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
        visas: [{ subclass: '189', from: '2019-01-01' }],
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
        visas: [{ subclass: '189', from: '2019-01-01' }],
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
