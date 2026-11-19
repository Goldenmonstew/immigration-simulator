import { describe, expect, test } from 'vitest';
import { evaluate } from '../src/evaluate';
import type { PersonTimeline } from '../src/types';
import { asDependant, SIMULATION_DATE, timeline } from './helpers';

function result(overrides: Partial<PersonTimeline>) {
  return evaluate({
    timeline: timeline(overrides),
    simulationDate: SIMULATION_DATE,
  });
}

describe('short circuits', () => {
  test('a criminal record stops both columns', () => {
    const r = result({ criminalRecord: [{ date: '2021-05-01' }] });
    expect(r.shortCircuit?.reason).toBe('CRIMINALITY');
    expect(r.byRuleSet['earned-settlement-2026-11']?.outcome).toBe(
      'REQUIRES_REGULATED_REVIEW',
    );
    expect(r.byRuleSet['current-law-2026-11']?.outcome).toBe(
      'REQUIRES_REGULATED_REVIEW',
    );
  });

  test('A6#11 criminality warning distinguishes UK, overseas and minor offences in both languages', () => {
    const applicant = timeline({ criminalRecord: [{ date: '2021-05-01' }] });
    for (const [locale, matching] of [
      ['zh-CN', ['英国境内的成年犯罪记录', '海外定罪须核对', '未成年时的犯罪']],
      [
        'en',
        [
          'adult criminal record in the UK',
          'whether the conduct is also an offence in the UK',
          'offences committed as a minor',
        ],
      ],
    ] as const) {
      const r = evaluate({
        timeline: applicant,
        simulationDate: SIMULATION_DATE,
        locale,
      });
      expect(r.shortCircuit?.reason).toBe('CRIMINALITY');
      for (const phrase of matching) {
        expect(r.shortCircuit?.message.toLowerCase()).toContain(
          phrase.toLowerCase(),
        );
      }
    }
  });

  test.each([
    ['BEREAVED_PARTNER', 'PD-051', 'B1'],
    ['BEREAVED_PARTNER', 'PD-051', 'A2'],
    ['DOMESTIC_ABUSE_VICTIM', 'PD-027', 'B1'],
    ['AFGHAN_SCHEMES', 'PD-028', 'B1'],
    ['WINDRUSH', 'PD-028', 'B1'],
  ] as const)(
    'A4#7 and A6#11 strengthened requirements are unsettled on %s (%s, %s)',
    (route, detail, cefrLevel) => {
      const applicant = timeline({
        episodes: [{ ...timeline().episodes[1], route }],
        english: { cefrLevel },
      });
      for (const locale of ['zh-CN', 'en'] as const) {
        const r = evaluate({
          timeline: applicant,
          simulationDate: SIMULATION_DATE,
          locale,
        });
        expect(r.shortCircuit).toMatchObject({
          reason: 'OUTSIDE_FRAMEWORK',
          message: expect.stringContaining(detail),
        });
        const a = r.byRuleSet['earned-settlement-2026-11']!;
        expect(a.outcome).toBe('REQUIRES_REGULATED_REVIEW');
        expect(
          a.rules.find((rule) => rule.id === 'ES-ENGLISH-B2'),
        ).toMatchObject({ status: 'UNKNOWN', pendingDetails: [detail] });
        expect(
          a.rules.find((rule) => rule.id === 'ES-CRIMINALITY')?.status,
        ).toBe('UNKNOWN');
      }
    },
  );

  test('an outside-framework route stops only the Earned Settlement column', () => {
    const r = result({
      episodes: [
        {
          route: 'HONG_KONG_BNO',
          role: 'MAIN',
          validFrom: '2022-01-01',
          validTo: '2027-01-01',
        },
      ],
    });
    expect(r.shortCircuit?.reason).toBe('OUTSIDE_FRAMEWORK');
    expect(r.shortCircuit?.message).toContain('B2 英语要求仍适用');
    expect(r.byRuleSet['earned-settlement-2026-11']?.outcome).toBe(
      'REQUIRES_REGULATED_REVIEW',
    );
    expect(r.byRuleSet['current-law-2026-11']?.outcome).not.toBe(
      'REQUIRES_REGULATED_REVIEW',
    );
  });

  test('a legacy UK Resettlement Scheme arrival is outside the framework', () => {
    const r = result({
      episodes: [
        {
          route: 'SAFE_AND_LEGAL',
          role: 'MAIN',
          validFrom: '2024-01-01',
          validTo: '2029-01-01',
          resettlementScheme: 'UK_RESETTLEMENT_SCHEME',
        },
      ],
    });
    expect(r.shortCircuit?.reason).toBe('OUTSIDE_FRAMEWORK');
    // PD-045: B2 for groups outside the framework vs A2 for UKRS refugees.
    expect(r.shortCircuit?.message).toContain('PD-045');
    expect(r.shortCircuit?.message).toContain('A2');
    expect(r.shortCircuit?.message).not.toContain('B2 英语要求仍适用');
    expect(r.byRuleSet['earned-settlement-2026-11']?.outcome).toBe(
      'REQUIRES_REGULATED_REVIEW',
    );
  });

  // Contracts §16.3 (5.2 report §4): Legacy Safe and Legal is a protection
  // route under current law, so illegal entry only stops Earned Settlement.
  describe('illegal entry as an adult on Legacy Safe and Legal Routes', () => {
    const illegalEntry = [
      { type: 'ILLEGAL_ENTRY' as const, date: '2021-10-01' },
    ];
    const legacyUkrs = {
      route: 'SAFE_AND_LEGAL' as const,
      role: 'MAIN' as const,
      validFrom: '2021-11-04',
      validTo: '2029-01-01',
      resettlementScheme: 'UK_RESETTLEMENT_SCHEME' as const,
    };

    test.each([
      ['a UK Resettlement Scheme arrival before 2027-04-06', legacyUkrs],
      [
        'a Legacy Safe and Legal permission entered as such',
        {
          route: 'LEGACY_SAFE_AND_LEGAL' as const,
          role: 'MAIN' as const,
          validFrom: '2021-11-04',
          validTo: '2029-01-01',
        },
      ],
    ])(
      '%s: outside the framework; current law gives the STP result',
      (_, episode) => {
        const r = result({
          episodes: [episode],
          immigrationBreaches: illegalEntry,
        });
        expect(r.shortCircuit?.reason).toBe('OUTSIDE_FRAMEWORK');
        expect(r.byRuleSet['earned-settlement-2026-11']?.outcome).toBe(
          'REQUIRES_REGULATED_REVIEW',
        );
        expect(r.byRuleSet['current-law-2026-11']).toMatchObject({
          outcome: 'LIKELY_ELIGIBLE',
          pathwayYears: 5,
        });
      },
    );

    test("a dependant copies the principal's OUTSIDE_FRAMEWORK, not IMMIGRATION_BREACH", () => {
      const r = evaluate({
        timeline: timeline({ episodes: asDependant('PARTNER') }),
        principal: timeline({
          episodes: [legacyUkrs],
          immigrationBreaches: illegalEntry,
        }),
        simulationDate: SIMULATION_DATE,
      });
      expect(r.shortCircuit?.reason).toBe('OUTSIDE_FRAMEWORK');
      expect(r.shortCircuit?.message).toMatch(/^主申请人：/);
      expect(r.byRuleSet['current-law-2026-11']?.outcome).not.toBe(
        'REQUIRES_REGULATED_REVIEW',
      );
    });

    test('other routes outside the framework still stop both columns', () => {
      const r = result({
        episodes: [
          {
            route: 'HONG_KONG_BNO',
            role: 'MAIN',
            validFrom: '2021-11-04',
            validTo: '2029-01-01',
          },
        ],
        immigrationBreaches: illegalEntry,
      });
      expect(r.shortCircuit?.reason).toBe('IMMIGRATION_BREACH');
      expect(r.byRuleSet['current-law-2026-11']?.outcome).toBe(
        'REQUIRES_REGULATED_REVIEW',
      );
    });
  });

  test("a principal's criminal record stops both of the dependant's columns", () => {
    const r = evaluate({
      timeline: timeline({ episodes: asDependant('PARTNER') }),
      principal: timeline({ criminalRecord: [{ date: '2021-05-01' }] }),
      simulationDate: SIMULATION_DATE,
    });
    expect(r.shortCircuit?.reason).toBe('CRIMINALITY');
    expect(r.shortCircuit?.message).toMatch(/^主申请人：/);
    expect(r.byRuleSet['earned-settlement-2026-11']?.outcome).toBe(
      'REQUIRES_REGULATED_REVIEW',
    );
    expect(r.byRuleSet['current-law-2026-11']?.outcome).toBe(
      'REQUIRES_REGULATED_REVIEW',
    );
  });

  test("the dependant's own short circuit takes precedence", () => {
    const r = evaluate({
      timeline: timeline({
        episodes: asDependant('PARTNER'),
        criminalRecord: [{ date: '2021-05-01' }],
      }),
      principal: timeline({
        immigrationBreaches: [{ type: 'ILLEGAL_ENTRY', date: '2015-01-01' }],
      }),
      simulationDate: SIMULATION_DATE,
    });
    expect(r.shortCircuit?.reason).toBe('CRIMINALITY');
    expect(r.shortCircuit?.message).not.toMatch(/^主申请人/);
  });

  test("a principal's short circuit is ignored for a main applicant", () => {
    const r = evaluate({
      timeline: timeline(),
      principal: timeline({ criminalRecord: [{ date: '2021-05-01' }] }),
      simulationDate: SIMULATION_DATE,
    });
    expect(r.shortCircuit).toBeUndefined();
  });

  test('no short circuit by default', () => {
    expect(result({}).shortCircuit).toBeUndefined();
  });
});
