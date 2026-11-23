import { describe, expect, test } from 'vitest';
import { commonChecks, auNotes } from '../src/australia-common';
import type { AuFullPathId, AuFullRequest } from '../src/australia-full';
import { feeChecks } from '../src/australia-fees';

const base: AuFullRequest = {
  simulationDate: '2026-11-23',
  dateOfBirth: '1988-11-23',
  locale: 'en',
};
const cleanIntegrity = {
  identityEstablished: true,
  accurateDocuments: true,
  lastIdentityRefusal: null,
  lastDocumentRefusal: null,
};
const good: NonNullable<AuFullRequest['publicInterest']> = {
  officialPassport: true,
  character: 'clear-history',
  health: 'cleared',
  policeDocuments: 'supplied',
  securityAndForeignPolicy: 'cleared',
  criticalTechnology: 'cleared',
  commonwealthDebt: 'arranged',
  valuesSigned: true,
  integrity: cleanIntegrity,
  returnBan5001: false,
  removedOn: null,
  sponsoredStudy: { applies: false },
  childInterestsSatisfied: true,
  permanentSettlementAndSupport: true,
  settlementWithoutUndueDifficulty: true,
};
const common = (id: AuFullPathId, overrides?: Partial<AuFullRequest>) =>
  commonChecks(id, { ...base, ...overrides });
const state = (
  id: string,
  publicInterest: AuFullRequest['publicInterest'],
  path: AuFullPathId = 'AU-858',
  extra?: Partial<AuFullRequest>,
) =>
  common(path, { publicInterest, ...extra }).find((c) => c.id === id)?.status;

describe('Public interest and special return criteria', () => {
  // Adult innovation applicant and accompanying child. Every statutory check can pass;
  // an unanswered form cannot produce a positive result for any of them.
  test.each(
    [
      'PASSPORT',
      'CHARACTER',
      'HEALTH',
      'POLICE',
      'SECURITY',
      'TECHNOLOGY',
      'DEBT',
      'VALUES',
      'INTEGRITY',
      'SETTLEMENT',
      'ESTABLISHMENT',
      'CHILDREN',
    ]
      .map((name) => 'AU-PIC-' + name)
      .concat(['AU-RETURN-5001', 'AU-RETURN-5002', 'AU-RETURN-5010']),
  )('%s uses confirmed and missing evidence', (id) => {
    expect(state(id, good)).toBe('MET');
    expect(state(id, {})).toBe('UNKNOWN');
  });

  test('the PIC matrix differs across streams and from citizenship', () => {
    for (const path of ['AU-186-DE', 'AU-189-PT', 'AU-190'] as const) {
      expect(state('AU-PIC-HEALTH', { health: 'cost-finding' }, path)).toBe(
        'NOT_MET',
      );
      expect(
        state('AU-PIC-HEALTH', { health: 'no-known-condition' }, path),
      ).toBe('UNKNOWN');
    }
    for (const path of [
      'AU-186-TRT',
      'AU-191',
      'AU-189-HK',
      'AU-191-HK',
      'AU-PARTNER',
      'AU-858',
    ] as const) {
      expect(
        common(path, { publicInterest: { health: 'cost-finding' } }).find(
          (c) => c.id === 'AU-PIC-HEALTH',
        ),
      ).toMatchObject({ status: 'UNKNOWN', pendingDetails: ['PD-201'] });
      expect(state('AU-PIC-HEALTH', { health: 'waiver-granted' }, path)).toBe(
        'MET',
      );
      expect(
        state('AU-PIC-HEALTH', { health: 'public-health-failure' }, path),
      ).toBe('NOT_MET');
    }
    expect(common('AU-RRV').map((c) => c.id)).not.toContain('AU-PIC-HEALTH');
    expect(common('AU-CITIZENSHIP').map((c) => c.id)).toEqual([
      'AU-FEES-APPLICATION',
    ]);
    for (const path of ['AU-RRV', 'AU-190', 'AU-PARTNER'] as const)
      expect(common(path).map((c) => c.id)).not.toContain('AU-PIC-TECHNOLOGY');
    expect(common('AU-189-HK').map((c) => c.id)).not.toContain(
      'AU-RETURN-5010',
    );
    expect(
      common('AU-858', { innovation: { securityAssistance: 'accepted' } }).map(
        (c) => c.id,
      ),
    ).not.toContain('AU-PIC-INTEGRITY');
  });

  test('sentence, police request and passport decisions', () => {
    expect(state('AU-PIC-CHARACTER', { prisonSentenceMonths: 11 })).toBe(
      'UNKNOWN',
    );
    expect(state('AU-PIC-CHARACTER', { prisonSentenceMonths: 12 })).toBe(
      'NOT_MET',
    );
    expect(
      state('AU-PIC-CHARACTER', {
        prisonSentenceMonths: 24,
        character: 'favourable-decision',
      }),
    ).toBe('MET');
    expect(state('AU-PIC-POLICE', { policeDocuments: 'outstanding' })).toBe(
      'NOT_MET',
    );
    expect(state('AU-PIC-POLICE', { policeDocuments: 'waiver-pending' })).toBe(
      'UNKNOWN',
    );
    expect(state('AU-PIC-POLICE', { policeDocuments: 'not-requested' })).toBe(
      'MET',
    );
    expect(state('AU-PIC-PASSPORT', { officialPassport: false })).toBe(
      'NOT_MET',
    );
    expect(
      state('AU-PIC-PASSPORT', {
        officialPassport: false,
        passportException: 'accepted',
      }),
    ).toBe('MET');
    expect(
      state('AU-PIC-SECURITY', { securityAndForeignPolicy: 'adverse' }),
    ).toBe('NOT_MET');
    expect(
      state('AU-PIC-TECHNOLOGY', { criticalTechnology: 'sensitive-field' }),
    ).toBe('UNKNOWN');
    expect(state('AU-PIC-DEBT', { commonwealthDebt: 'outstanding' })).toBe(
      'NOT_MET',
    );
  });

  test('16 for 191, 18 for 189, and a minor on the 858 path still needs consent', () => {
    const minor = {
      dateOfBirth: '2010-11-23',
      fees: { additionalAdults: 0, additionalMinors: 0 },
    };
    expect(
      state('AU-PIC-VALUES', { valuesSigned: false }, 'AU-191', minor),
    ).toBe('NOT_MET');
    expect(
      state('AU-PIC-VALUES', { valuesSigned: false }, 'AU-191-HK', {
        ...minor,
        dateOfBirth: '2010-11-24',
      }),
    ).toBe('MET');
    expect(
      state('AU-PIC-VALUES', { valuesSigned: false }, 'AU-189-HK', minor),
    ).toBe('MET');
    expect(
      state('AU-PIC-VALUES', { valuesSigned: false }, 'AU-189-HK', {
        ...minor,
        dateOfBirth: '2008-11-23',
      }),
    ).toBe('NOT_MET');
    expect(state('AU-PIC-CHILDREN', {}, 'AU-858', minor)).toBe('UNKNOWN');
    expect(
      state(
        'AU-PIC-CHILDREN',
        { childInterestsSatisfied: false },
        'AU-858',
        minor,
      ),
    ).toBe('NOT_MET');
  });

  test('PIC 4020 includes the start date of each lookback and only document issues can be waived', () => {
    const status = (changes: Partial<typeof good.integrity>) =>
      state('AU-PIC-INTEGRITY', {
        integrity: { ...cleanIntegrity, ...changes },
      });
    expect(status({ lastDocumentRefusal: '2023-11-22' })).toBe('MET');
    expect(status({ lastDocumentRefusal: '2023-11-23' })).toBe('NOT_MET');
    expect(
      status({ lastDocumentRefusal: '2025-01-01', documentWaiver: 'pending' }),
    ).toBe('UNKNOWN');
    expect(
      status({ lastDocumentRefusal: '2025-01-01', documentWaiver: 'granted' }),
    ).toBe('MET');
    expect(
      status({ lastIdentityRefusal: '2016-11-23', documentWaiver: 'granted' }),
    ).toBe('NOT_MET');
    expect(status({ lastIdentityRefusal: '2016-11-22' })).toBe('MET');
  });

  test('return bars apply by location and use strictly more than twelve months', () => {
    expect(
      state('AU-RETURN-5001', { returnBan5001: true }, 'AU-RRV', {
        locationAtDecision: 'onshore',
      }),
    ).toBeUndefined();
    expect(
      state('AU-RETURN-5001', { returnBan5001: true }, 'AU-RRV', {
        locationAtDecision: 'offshore',
      }),
    ).toBe('NOT_MET');
    expect(state('AU-RETURN-5002', { removedOn: '2025-11-23' })).toBe(
      'NOT_MET',
    );
    expect(state('AU-RETURN-5002', { removedOn: '2025-11-22' })).toBe('MET');
    expect(
      state('AU-RETURN-5002', {
        removedOn: '2026-10-01',
        removalWaiver: 'pending',
      }),
    ).toBe('UNKNOWN');
    const student = (courseMonths: number, yearsOutsideSinceCeasing: number) =>
      state('AU-RETURN-5010', {
        sponsoredStudy: {
          applies: true,
          courseMonths,
          yearsOutsideSinceCeasing,
          support: 'none',
        },
      });
    expect(student(11, 0)).toBe('MET');
    expect(student(12, 1)).toBe('NOT_MET');
    expect(student(12, 2)).toBe('MET');
  });
  test('housing and earlier insurance are explained as obligations with citations', () => {
    expect(
      auNotes('AU-191', {
        ...base,
        publicInterest: { temporaryInsurance: 'lapsed' },
      }).join(' '),
    ).toContain('lapse of cover');
    expect(auNotes('AU-RRV', base).join(' ')).toContain('s 104');
    expect(auNotes('AU-858', { ...base, locale: 'zh-CN' })[1]).toContain(
      '医疗保险',
    );
  });
});

const fees = {
  pacificRegionalPassport: false,
  additionalAdults: 1,
  additionalMinors: 1,
  chargeableAdditionalAdults: 1,
};
const cost = (id: AuFullPathId, input: Partial<AuFullRequest>) =>
  feeChecks(id, { ...base, ...input })[0];
describe('AUD budget at the research date', () => {
  // Standard family of three, including one adult secondary instalment where applicable.
  test.each([
    ['AU-186-TRT', 15635],
    ['AU-186-DE', 15635],
    ['AU-189-PT', 15630],
    ['AU-190', 15630],
    ['AU-189-HK', 15630],
    ['AU-191', 1105],
    ['AU-191-HK', 15620],
    ['AU-858', 15805],
    ['AU-PARTNER', 20505],
  ] as const)('%s family total, and missing inputs', (route, expected) => {
    expect(
      cost(route, {
        fees: { ...fees, partnerCategory: 'ordinary' },
        english: { passport: 'US' },
      }),
    ).toMatchObject({
      status: 'MET',
      explanation: expect.stringContaining(
        'Family total AUD ' + expected.toLocaleString('en-AU'),
      ),
    });
    expect(cost(route, {})).toMatchObject({ status: 'UNKNOWN' });
  });
  test('189 HK and 191 HK Pacific first instalments include the dependants’ discount', () => {
    for (const route of ['AU-189-HK', 'AU-191-HK'] as const) {
      expect(
        cost(route, {
          fees: { ...fees, pacificRegionalPassport: true },
          english: {
            passport: 'other',
            education: 'none',
            test: 'none',
            functionalDeterminedAtInterview: false,
          },
        }).explanation,
      ).toContain('Family total AUD 18,575'); // 5030 + 2515 + 1260 + 2 × 4885
    }
  });
  test('employer pays nomination and SAF separately, changing at exactly AUD 10 million', () => {
    const employer = (
      path: 'AU-186-TRT' | 'AU-186-DE',
      turnover: number,
      regional: boolean,
    ) =>
      feeChecks(path, {
        ...base,
        fees: { employerAnnualTurnover: turnover, regionalPosition: regional },
      })[1];
    expect(employer('AU-186-TRT', 9999999, true).explanation).toContain(
      'Employer total AUD 3,000',
    );
    expect(employer('AU-186-TRT', 10000000, false).explanation).toContain(
      'Employer total AUD 5,540',
    );
    expect(employer('AU-186-DE', 9999999, true).explanation).toContain(
      'Employer total AUD 3,540',
    );
    expect(feeChecks('AU-186-DE', base)[1].status).toBe('UNKNOWN');
  });
  test('onshore category distinguishes valid and former prospective marriage visa', () => {
    const f = { ...fees, additionalAdults: 0, additionalMinors: 0 };
    expect(
      cost('AU-PARTNER', {
        partner: { stream: 'onshore' },
        fees: { ...f, partnerCategory: 'qualifying-current-300' },
      }).explanation,
    ).toContain('Family total AUD 1,955.');
    expect(
      cost('AU-PARTNER', {
        partner: { stream: 'onshore' },
        fees: { ...f, partnerCategory: 'qualifying-former-300' },
      }).explanation,
    ).toContain('Family total AUD 2,475.');
    expect(
      cost('AU-PARTNER', {
        partner: { stream: 'offshore' },
        fees: { ...f, partnerCategory: 'qualifying-current-300' },
      }).explanation,
    ).toContain('Family total AUD 11,710.');
  });
  test('each RRV application has its own charge and optional paper surcharge', () => {
    expect(cost('AU-RRV', {}).status).toBe('UNKNOWN');
    expect(
      cost('AU-RRV', {
        fees: { pacificRegionalPassport: false, paperReturnApplication: false },
      }).explanation,
    ).toContain('Each application costs AUD 1,475.');
    expect(
      cost('AU-RRV', {
        fees: { pacificRegionalPassport: true, paperReturnApplication: true },
      }).explanation,
    ).toContain('Each application costs AUD 585.');
  });
  test('citizenship form, resit, included minor and 90 days of service', () => {
    const standard = {
      concessionCard: 'none',
      otherExemption: false,
      qualifyingPermanentForcesDays: 89,
      previousApplicationWithTest: 'none',
    } as const;
    const adult = {
      citizenship: { medicalBranch: 'none' } as const,
      fees: { citizenship: standard },
    };
    expect(cost('AU-CITIZENSHIP', {}).status).toBe('UNKNOWN');
    expect(cost('AU-CITIZENSHIP', adult).explanation).toContain(
      'This application costs AUD 595.',
    );
    expect(
      cost('AU-CITIZENSHIP', { ...adult, dateOfBirth: '1966-11-23' })
        .explanation,
    ).toContain('This application costs AUD 365.');
    expect(
      cost('AU-CITIZENSHIP', {
        ...adult,
        fees: {
          citizenship: {
            ...standard,
            previousApplicationWithTest: '2015-10-01',
          },
        },
      }).explanation,
    ).toContain('This application costs AUD 365.');
    expect(
      cost('AU-CITIZENSHIP', {
        ...adult,
        fees: {
          citizenship: { ...standard, qualifyingPermanentForcesDays: 90 },
        },
      }).explanation,
    ).toContain('This application costs AUD 0.');
    expect(
      cost('AU-CITIZENSHIP', {
        dateOfBirth: '2010-11-24',
        fees: {
          citizenship: { ...standard, includedWithResponsibleParent: true },
        },
      }).explanation,
    ).toContain('This application costs AUD 0.');
    expect(
      cost('AU-CITIZENSHIP', {
        dateOfBirth: '2010-11-23',
        fees: {
          citizenship: { ...standard, includedWithResponsibleParent: true },
        },
      }).explanation,
    ).toContain('This application costs AUD 365.');
  });
});

test('fees distinguish a historical combined lodgement, current tariff and future projection', () => {
  const app = (lodged: string) =>
    cost('AU-PARTNER', {
      fees: { ...fees, partnerCategory: 'ordinary' },
      partnerApplication: {
        lodged,
        stream: 'onshore',
        longTermRelationship: false,
      },
    });
  expect(app('2026-06-30')).toMatchObject({
    status: 'UNKNOWN',
    explanation: expect.stringContaining('historical tariff or receipt'),
  });
  expect(app('2025-04-01').explanation).toContain(
    'Additional permanent-stage charge AUD 0',
  );
  expect(app('2026-07-01')).toMatchObject({
    status: 'MET',
    explanation: expect.stringContaining('Rates effective 2026-07-01'),
  });
  expect(
    cost('AU-RRV', {
      simulationDate: '2028-07-01',
      fees: { paperReturnApplication: false, pacificRegionalPassport: false },
    }),
  ).toMatchObject({
    status: 'UNKNOWN',
    explanation: expect.stringContaining('future lodgement may change'),
  });
  expect(auNotes('AU-RRV', base).join(' ')).toContain(
    'may still request police certificates',
  );
});
