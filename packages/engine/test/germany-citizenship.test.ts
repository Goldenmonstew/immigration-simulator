import { describe, expect, test } from 'vitest';
import { evaluateGermanyFull, type DeFullRequest } from '../src/germany-full';
import {
  citizenshipAdvisoryIds,
  citizenshipChecks,
  citizenshipTimeOverride,
  type DeCitizenshipAnswers,
} from '../src/germany-citizenship';

const base: DeFullRequest = {
  simulationDate: '2026-11-23',
  birthDate: '1990-11-23',
};
const standard: DeCitizenshipAnswers = {
  applicationOn: '2026-01-01',
  foreignNationalOrStateless: true,
  identityAndNationalityEstablished: true,
  canActWithoutGuardian: true,
  lawfulHabitualResidence: true,
  currentTitle: 'blue-card',
  countedResidenceSince: '2021-11-23',
  constitutionalAndLoyaltyDeclaration: true,
  historicalResponsibilityDeclaration: true,
  sustainableHouseholdSupport: true,
  withoutSgbIIorXII: true,
  incomeException: 'none',
  languageException: 'none',
  germanEvidence: 'B1',
  knowledge: { kind: 'lid', correct: 17 },
  criminalRecord: { kind: 'none' },
  exclusionReview: 'cleared',
  solemnDeclaration: true,
  certificateHandedOver: true,
};

function find(
  id: string,
  patch: DeCitizenshipAnswers,
  route = 'R07',
  dates: Partial<DeFullRequest> = {},
) {
  const c = citizenshipChecks(route, {
    ...base,
    ...dates,
    citizenship: { ...standard, ...patch },
  }).find((c) => c.id === 'DE-' + id);
  if (!c) throw new Error('Missing ' + id);
  return c;
}

function citizenshipRoute(
  from: string,
  citizenship: Partial<DeCitizenshipAnswers>,
  dates: Partial<DeFullRequest> = {},
) {
  return evaluateGermanyFull({
    ...base,
    routes: ['R07'],
    firstEntry: from,
    permits: [{ kind: 'blue-card', from }],
    trips: [],
    mobility: {
      titles: [
        { kind: 'blue-card', validTo: null, noOtherLossEvent: true, trips: [] },
      ],
    },
    citizenship: { ...standard, ...citizenship },
    ...dates,
  }).columns[0].pathways[0];
}

describe('StAG common entitlement conditions', () => {
  test('complete record and stable translated IDs; an unanswered condition names its pending detail', () => {
    const req = { ...base, citizenship: standard };
    const zh = citizenshipChecks('R07', req);
    const en = citizenshipChecks('R07', { ...req, locale: 'en' });
    expect(zh.every((c) => c.status === 'MET')).toBe(true);
    expect(zh.map((c) => c.id)).toEqual(en.map((c) => c.id));
    for (const [i, c] of en.entries()) {
      expect(c.title).not.toBe(zh[i].title);
      expect(c.explanation).not.toBe(zh[i].explanation);
      expect(c.sources.every((s) => s.locator.length > 0)).toBe(true);
    }
    for (const c of citizenshipChecks('R07', {
      simulationDate: base.simulationDate,
    })) {
      expect(c.status).toBe('UNKNOWN');
      expect(c.pendingDetails?.length).toBeGreaterThan(0);
    }
  });

  test('identity, application date and statutory capacity at filing', () => {
    expect(
      find('C46', { identityAndNationalityEstablished: false }).status,
    ).toBe('NOT_MET');
    const birthDate = '2010-11-23';
    expect(
      find(
        'C46',
        { applicationOn: '2026-11-22', representedByLaw: false },
        'R07',
        { birthDate },
      ).status,
    ).toBe('NOT_MET');
    expect(
      find(
        'C46',
        { applicationOn: '2026-11-22', representedByLaw: true },
        'R07',
        { birthDate },
      ).status,
    ).toBe('MET');
    expect(
      find(
        'C46',
        { applicationOn: '2026-11-23', representedByLaw: false },
        'R07',
        { birthDate },
      ).status,
    ).toBe('MET');
    expect(
      find('C46-application', { applicationOn: '2026-11-24' }).status,
    ).toBe('NOT_MET');
  });

  test('§ 10 status is checked at decision, including the independent Swiss right', () => {
    expect(find('C47', { currentTitle: 'swiss-agreement' }).status).toBe('MET');
    expect(find('C47', { currentTitle: 'unverified' }).status).toBe('UNKNOWN');
    expect(find('C47', { currentTitle: 'excluded-title' }).status).toBe(
      'NOT_MET',
    );
    expect(find('C47', { lawfulHabitualResidence: false }).status).toBe(
      'NOT_MET',
    );
  });

  test('declarations, security decision and final handover are separate', () => {
    expect(
      find('C48', { historicalResponsibilityDeclaration: false }).status,
    ).toBe('NOT_MET');
    expect(
      find('C48', {
        historicalResponsibilityDeclaration: false,
        canActWithoutGuardian: false,
      }).status,
    ).toBe('MET');
    expect(find('C53', { exclusionReview: 'excluded' }).status).toBe('NOT_MET');
    expect(find('C53', { exclusionReview: 'pending' }).status).toBe('UNKNOWN');
    expect(find('C54', { certificateHandedOver: false }).status).toBe(
      'NOT_MET',
    );
    expect(citizenshipAdvisoryIds.has('DE-C54')).toBe(true);
  });

  test('full time now and 20 of the last 24 months; partner must also live with a minor child', () => {
    const worker: DeCitizenshipAnswers = {
      withoutSgbIIorXII: false,
      exceptionForecastAccepted: true,
      incomeException: 'worker',
    };
    expect(
      find('C49', {
        ...worker,
        fullTime: { workingFullTimeNow: true, monthsInWindow: 19 },
      }).status,
    ).toBe('NOT_MET');
    expect(
      find('C49', {
        ...worker,
        fullTime: { workingFullTimeNow: true, monthsInWindow: 20 },
      }).status,
    ).toBe('MET');
    expect(
      find('C49', {
        ...worker,
        fullTime: { workingFullTimeNow: false, monthsInWindow: 24 },
      }).status,
    ).toBe('NOT_MET');
    const partner: DeCitizenshipAnswers = {
      ...worker,
      incomeException: 'partner',
      partnerFullTime: { workingFullTimeNow: true, monthsInWindow: 20 },
    };
    expect(
      find('C49', { ...partner, livesWithPartnerAndMinorChild: true }).status,
    ).toBe('MET');
    expect(
      find('C49', { ...partner, livesWithPartnerAndMinorChild: false }).status,
    ).toBe('NOT_MET');
    expect(
      find('C49', {
        ...partner,
        livesWithPartnerAndMinorChild: true,
        exceptionForecastAccepted: undefined,
      }).status,
    ).toBe('UNKNOWN');
  });

  test('historic workers, spouses and more favourable historic livelihood rules', () => {
    const historic: DeCitizenshipAnswers = {
      incomeException: 'legacy-worker',
      withoutSgbIIorXII: false,
      exceptionForecastAccepted: true,
      benefitsNotAttributable: true,
    };
    expect(
      find('C49', {
        ...historic,
        historicalWorker: {
          kind: 'west-agreement',
          applicant: 'worker',
          workerArrivedOn: '1974-06-30',
        },
      }).status,
    ).toBe('MET');
    expect(
      find('C49', {
        ...historic,
        historicalWorker: {
          kind: 'west-agreement',
          applicant: 'worker',
          workerArrivedOn: '1974-07-01',
        },
      }).status,
    ).toBe('NOT_MET');
    expect(
      find('C49', {
        ...historic,
        historicalWorker: {
          kind: 'east-contract',
          applicant: 'spouse',
          spouseJoinedInConnection: true,
          workerArrivedOn: '1990-06-13',
        },
      }).status,
    ).toBe('MET');
    expect(
      find('C49', {
        ...historic,
        historicalWorker: {
          kind: 'east-contract',
          applicant: 'spouse',
          spouseJoinedInConnection: false,
          workerArrivedOn: '1990-06-13',
        },
      }).status,
    ).toBe('NOT_MET');
    expect(
      find('C49', {
        ...historic,
        incomeException: 'none',
        applicationOn: '2023-08-23',
      }).status,
    ).toBe('MET');
    expect(
      find('C49', {
        ...historic,
        incomeException: 'none',
        applicationOn: '2023-08-24',
      }).status,
    ).toBe('NOT_MET');
  });

  test('B1, age at completion, approved oral and medical exceptions', () => {
    const low: DeCitizenshipAnswers = {
      germanEvidence: 'A2',
      ageAppropriateGerman: true,
    };
    expect(find('C50', low).status).toBe('NOT_MET');
    expect(find('C50', low, 'R07', { birthDate: '2010-11-24' }).status).toBe(
      'MET',
    );
    expect(find('C50', low, 'R07', { birthDate: '2010-11-23' }).status).toBe(
      'NOT_MET',
    );
    expect(
      find('C50', {
        ...low,
        languageException: 'approved-oral-hardship',
        oralEverydayGerman: true,
      }).status,
    ).toBe('MET');
    expect(
      find('C50', {
        ...low,
        languageException: 'approved-oral-hardship',
        oralEverydayGerman: false,
      }).status,
    ).toBe('NOT_MET');
    expect(find('C50', { ...low, languageException: 'pending' }).status).toBe(
      'UNKNOWN',
    );
    expect(
      find('C50', { ...low, languageException: 'medical-age-accepted' }).status,
    ).toBe('MET');
  });

  test('17 of 33 for LiD or the naturalisation test; a school qualification and a statutory exemption work separately', () => {
    for (const kind of ['lid', 'naturalisation-test'] as const) {
      expect(find('C51', { knowledge: { kind, correct: 16 } }).status).toBe(
        'NOT_MET',
      );
      expect(find('C51', { knowledge: { kind, correct: 17 } }).status).toBe(
        'MET',
      );
      expect(find('C51', { knowledge: { kind, correct: 34 } }).status).toBe(
        'UNKNOWN',
      );
    }
    expect(
      find('C51', { knowledge: { kind: 'accepted-equivalent' } }).status,
    ).toBe('MET');
    expect(
      find('C51', {
        knowledge: { kind: 'none' },
        languageException: 'approved-oral-hardship',
      }).status,
    ).toBe('MET');
    expect(
      find('C51', { knowledge: { kind: 'none' } }, 'R07', {
        birthDate: '2010-11-24',
      }).status,
    ).toBe('MET');
  });

  test('sentences, hate motives, foreign proceedings and § 12a individual decisions', () => {
    const fines = { kind: 'fines', judgmentFoundHateMotive: false } as const;
    const custody = {
      kind: 'custody',
      judgmentFoundHateMotive: false,
      suspendedAndRemitted: true,
    } as const;
    expect(
      find('C52', { criminalRecord: { ...fines, dayRates: [60, 30] } }).status,
    ).toBe('MET');
    expect(
      find('C52', { criminalRecord: { ...fines, dayRates: [60, 31] } }).status,
    ).toBe('UNKNOWN');
    expect(
      find('C52', {
        criminalRecord: {
          ...fines,
          dayRates: [60, 31],
          lowerCombinedDayRates: 80,
        },
      }).status,
    ).toBe('MET');
    expect(
      find('C52', {
        criminalRecord: {
          ...fines,
          dayRates: [1],
          judgmentFoundHateMotive: true,
        },
      }).status,
    ).toBe('NOT_MET');
    expect(
      find('C52', { criminalRecord: { ...custody, months: 3 } }).status,
    ).toBe('MET');
    expect(
      find('C52', {
        criminalRecord: { ...custody, months: 4, disregardExcess: 'accepted' },
      }).status,
    ).toBe('NOT_MET');
    expect(
      find('C52', {
        criminalRecord: { ...custody, months: 1, suspendedAndRemitted: false },
      }).status,
    ).toBe('NOT_MET');
    expect(
      find('C52', {
        criminalRecord: {
          kind: 'mixed-sentences',
          prisonDays: 45,
          fineDayRates: [45],
          allCustodySuspendedAndRemitted: true,
          judgmentFoundHateMotive: false,
        },
      }).status,
    ).toBe('MET');
    expect(
      find('C52', {
        criminalRecord: {
          kind: 'mixed-sentences',
          prisonDays: 45,
          fineDayRates: [67],
          allCustodySuspendedAndRemitted: true,
          judgmentFoundHateMotive: false,
          disregardExcess: 'accepted',
        },
      }).status,
    ).toBe('NOT_MET');
    expect(
      find('C52', { criminalRecord: { kind: 'foreign-record' } }).status,
    ).toBe('UNKNOWN');
    expect(
      find('C52', { criminalRecord: { kind: 'pending-proceedings' } }).status,
    ).toBe('UNKNOWN');
  });
});

describe('StAG specific pathways', () => {
  test('the five-year projection follows the confirmed § 12b start', () => {
    const start = '2022-08-01';
    for (const countedResidenceSince of [undefined, start]) {
      const route = citizenshipRoute(start, { countedResidenceSince });
      const check = route.checks.find((c) => c.id === 'DE-C55');
      expect(check?.status).toBe('NOT_MET');
      expect(check?.pendingDetails).toBeUndefined();
      expect(route.status).toBe('FUTURE');
      expect(route.earliestDate).toBe('2027-08-01');
      expect(route.pendingDetails).not.toContain('PD-128');
    }
    const laterStart = citizenshipRoute(start, {
      countedResidenceSince: '2022-10-01',
    });
    expect(laterStart.checks.find((c) => c.id === 'DE-C55')?.status).toBe(
      'NOT_MET',
    );
    expect(laterStart).toMatchObject({
      status: 'FUTURE',
      earliestDate: '2027-10-01',
    });
    expect(laterStart.summary).toContain('2027-10-01');
    const expiredByAnniversary = citizenshipRoute(
      start,
      {
        countedResidenceSince: '2022-10-01',
      },
      { permits: [{ kind: 'blue-card', from: start, to: '2027-09-30' }] },
    );
    expect(
      expiredByAnniversary.checks.find((c) => c.id === 'DE-C55')?.status,
    ).toBe('NOT_MET');
    expect(expiredByAnniversary.status).toBe('NOT_MET');
    expect(expiredByAnniversary.earliestDate).toBeUndefined();
  });

  test.each([
    [undefined, '2027-09-30', 'NOT_MET'],
    ['2027-09-30', undefined, 'NOT_MET'],
    ['2027-11-01', '2027-09-30', 'NOT_MET'],
    ['2027-09-30', '2027-11-01', 'NOT_MET'],
    [undefined, '2027-10-01', 'FUTURE'],
    ['2027-10-01', undefined, 'FUTURE'],
  ] as const)(
    'the same Blue Card expires at the earlier recorded limit (%s, %s)',
    (to, validTo, status) => {
      const from = '2022-08-01';
      const route = citizenshipRoute(
        from,
        { countedResidenceSince: '2022-10-01' },
        {
          permits: [{ kind: 'blue-card', from, to }],
          mobility: {
            titles: [
              { kind: 'blue-card', validTo, noOtherLossEvent: true, trips: [] },
            ],
          },
        },
      );
      expect(route.checks.find((c) => c.id === 'DE-C63-current')?.status).toBe(
        'MET',
      );
      expect(route.checks.find((c) => c.id === 'DE-C55')?.status).toBe(
        'NOT_MET',
      );
      expect(route.status).toBe(status);
      expect(route.earliestDate).toBe(
        status === 'FUTURE' ? '2027-10-01' : undefined,
      );
    },
  );

  test.each([
    ['2027-09-30', undefined],
    ['2026-10-31', true],
  ] as const)(
    'the current expiry %s respects documented continuation and a later Blue Card',
    (validTo, continuingUnder81) => {
      const from = '2022-08-01';
      const route = citizenshipRoute(
        from,
        { countedResidenceSince: '2022-10-01' },
        {
          permits: [
            { kind: 'blue-card', from },
            { kind: 'blue-card', from: '2027-10-01' },
          ],
          mobility: {
            titles: [
              {
                kind: 'blue-card',
                validTo,
                continuingUnder81,
                noOtherLossEvent: true,
                trips: [],
              },
            ],
          },
        },
      );
      expect(route).toMatchObject({
        status: 'FUTURE',
        earliestDate: '2027-10-01',
      });
    },
  );

  test('a confirmed residence start preserves the § 9 projection for a continuing German marriage', () => {
    const start = '2024-08-01';
    for (const countedResidenceSince of [undefined, start]) {
      const route = citizenshipRoute(
        start,
        {
          countedResidenceSince,
          spouse: {
            status: 'continuing',
            recognisedGermanRelationship: true,
            genuineFamilyLife: true,
          },
        },
        {
          routes: ['R08'],
          marriedOn: '2023-11-01',
          spouseGermanSince: '2023-11-01',
        },
      );
      expect(route.checks.find((c) => c.id === 'DE-C56')?.status).toBe('MET');
      expect(route.checks.find((c) => c.id === 'DE-C56-time')?.status).toBe(
        'NOT_MET',
      );
      expect(route).toMatchObject({
        status: 'FUTURE',
        earliestDate: '2027-08-01',
      });
    }
  });

  test.each([
    [90, undefined, 'MET'],
    [111, undefined, 'UNKNOWN'],
    [111, 'accepted', 'MET'],
    [111, 'refused', 'NOT_MET'],
    [112, 'accepted', 'NOT_MET'],
    [120, undefined, 'NOT_MET'],
    [120, 'accepted', 'NOT_MET'],
  ] as const)(
    'a final fine of %i day rates with decision %s gives %s',
    (dayRates, disregardExcess, status) => {
      const route = citizenshipRoute('2021-11-23', {
        criminalRecord: {
          kind: 'fines',
          dayRates: [dayRates],
          judgmentFoundHateMotive: false,
          disregardExcess,
        },
      });
      const check = route.checks.find((c) => c.id === 'DE-C52');
      expect(check?.status).toBe(status);
      expect(route.status).toBe(status);
      expect(route.earliestDate).toBe(
        status === 'MET' ? base.simulationDate : undefined,
      );
      if (status === 'UNKNOWN') {
        expect(check?.pendingDetails).toContain('PD-345');
        expect(route.pendingDetails).toContain('PD-345');
      } else {
        expect(check?.pendingDetails).toBeUndefined();
        expect(route.pendingDetails).not.toContain('PD-345');
      }
    },
  );

  test('ordinary § 10 uses the existing timeline by default and confirmed periods for Swiss rights', () => {
    expect(citizenshipTimeOverride('R07', base)).toBe('pilot');
    const input = (from: string) =>
      ({
        ...base,
        citizenship: {
          currentTitle: 'swiss-agreement',
          countedResidenceSince: from,
        },
      }) as const;
    expect(citizenshipTimeOverride('R07', input('2021-11-23'))).toBe(true);
    expect(citizenshipTimeOverride('R07', input('2021-11-24'))).toBe(false);
    expect(
      citizenshipTimeOverride('R07', {
        ...base,
        citizenship: { currentTitle: 'swiss-agreement' },
      }),
    ).toBeUndefined();
    expect(
      citizenshipTimeOverride('R07', {
        ...input('2021-11-23'),
        simulationDate: '2025-10-29',
      }),
    ).toBeUndefined();
  });

  test('a still-pending pre-repeal accelerated application needs review only if the ordinary period is short', () => {
    const citizenship: DeCitizenshipAnswers = {
      applicationOn: '2025-10-29',
      historicAcceleratedApplicationPending: true,
    };
    expect(
      citizenshipTimeOverride('R07', { ...base, citizenship }, false),
    ).toBeUndefined();
    expect(citizenshipTimeOverride('R07', { ...base, citizenship }, true)).toBe(
      'pilot',
    );
    expect(
      citizenshipTimeOverride(
        'R07',
        {
          ...base,
          citizenship: { ...citizenship, applicationOn: '2025-10-30' },
        },
        false,
      ),
    ).toBe('pilot');
  });

  test('§ 9 marriage residence reduction requires three years of marriage and an authority ruling', () => {
    const req: DeFullRequest = {
      ...base,
      marriedOn: '2023-11-23',
      citizenship: {
        countedResidenceSince: '2025-01-01',
        spouse: { publicInterestShortening: 'accepted' },
      },
    };
    expect(citizenshipTimeOverride('R08', req)).toBe(true);
    expect(
      citizenshipTimeOverride('R08', { ...req, marriedOn: '2023-11-24' }),
    ).toBe(false);
    expect(
      citizenshipTimeOverride('R08', {
        ...req,
        citizenship: {
          ...req.citizenship,
          spouse: { publicInterestShortening: 'pending' },
        },
      }),
    ).toBeUndefined();
    expect(
      find(
        'C56',
        {
          spouse: {
            status: 'continuing',
            genuineFamilyLife: true,
            recognisedGermanRelationship: true,
          },
        },
        'R08',
      ).status,
    ).toBe('MET');
    expect(
      find(
        'C56',
        {
          spouse: {
            status: 'continuing',
            genuineFamilyLife: false,
            recognisedGermanRelationship: true,
          },
        },
        'R08',
      ).status,
    ).toBe('NOT_MET');
    expect(
      find('C57', { spouse: { status: 'continuing' } }, 'R08').status,
    ).toBe('MET');
  });

  test('§ 9(2) applies by filing, not handover; marriage duration stops on death or legal termination', () => {
    const spouse = {
      status: 'died',
      endedOn: '2025-09-12',
      sharedGermanChildBornOn: '2015-01-01',
      custodyAndFamilyLifeWithChild: true,
    } as const;
    expect(
      find('C57', { spouse, applicationOn: '2026-09-12' }, 'R08').status,
    ).toBe('MET');
    expect(
      find('C57', { spouse, applicationOn: '2026-09-13' }, 'R08').status,
    ).toBe('NOT_MET');
    expect(
      find(
        'C57',
        { spouse: { ...spouse, custodyAndFamilyLifeWithChild: undefined } },
        'R08',
      ).status,
    ).toBe('UNKNOWN');
    const req = {
      ...base,
      citizenship: { spouse, countedResidenceSince: '2018-01-01' },
    };
    expect(
      citizenshipTimeOverride('R08', { ...req, marriedOn: '2023-09-12' }),
    ).toBe(true);
    expect(
      citizenshipTimeOverride('R08', { ...req, marriedOn: '2023-09-13' }),
    ).toBe(false);
  });

  test('linked spouses are possible under § 10 only; R16 approval is independently required', () => {
    const family = {
      mainRoute: 'section-10',
      mainNaturalisationAndTimelyJointApplication: true,
      relation: 'spouse-or-registered-partner',
      actualFamilyLifeSince: '2024-11-23',
    } as const;
    expect(find('C58', { family }, 'R16').status).toBe('MET');
    expect(
      find('C58', { family: { ...family, mainRoute: 'section-9' } }, 'R16')
        .status,
    ).toBe('NOT_MET');
    expect(
      find(
        'C58-guidance',
        { family, countedResidenceSince: '2022-11-23' },
        'R16',
      ).status,
    ).toBe('MET');
    expect(
      find(
        'C58-guidance',
        { family, countedResidenceSince: '2022-11-24' },
        'R16',
      ).status,
    ).toBe('NOT_MET');
    expect(find('C58-decision', { family }, 'R16').status).toBe('UNKNOWN');
    expect(
      find(
        'C58-decision',
        { family: { ...family, decision: 'accepted' } },
        'R16',
      ).status,
    ).toBe('MET');
    expect(citizenshipAdvisoryIds.has('DE-C58-guidance')).toBe(true);
  });

  test('linked children under six: immediately preceding half of life; older children: three years or individual eligibility', () => {
    const family = {
      mainRoute: 'section-9',
      relation: 'child',
      custodyAndFamilyLife: true,
      mainNaturalisationAndTimelyJointApplication: true,
    } as const;
    const child = (birthDate: string, start: string) =>
      find('C58-guidance', { family, countedResidenceSince: start }, 'R16', {
        birthDate,
      }).status;
    // 2022-11-23 to 2026-11-23 = 1461 days; half requires at least 731 immediately preceding days.
    expect(child('2022-11-23', '2024-11-22')).toBe('MET');
    expect(child('2022-11-23', '2024-11-23')).toBe('NOT_MET');
    expect(child('2020-11-23', '2023-11-23')).toBe('MET');
    expect(child('2020-11-23', '2023-11-24')).toBe('NOT_MET');
    expect(child('2010-11-23', '2018-01-01')).toBe('UNKNOWN');
    expect(
      find('C58', { family }, 'R16', { birthDate: '2008-11-23' }).status,
    ).toBe('NOT_MET');
  });

  test('§ 8 has independent accommodation, support, integration guidance and a discretionary decision', () => {
    const discretionary = {
      accommodation: true,
      sustainableSupportIncludingInsurance: true,
      decision: 'accepted',
    } as const;
    expect(
      citizenshipChecks('R17', {
        ...base,
        citizenship: { ...standard, discretionary },
      }).every((c) => c.status === 'MET'),
    ).toBe(true);
    expect(
      find('C59', { discretionary: { accommodation: false } }, 'R17').status,
    ).toBe('NOT_MET');
    expect(
      find(
        'C60',
        {
          discretionary: {
            sustainableSupportIncludingInsurance: false,
            maintenanceWaiver: 'none',
          },
        },
        'R17',
      ).status,
    ).toBe('NOT_MET');
    expect(
      find(
        'C60',
        {
          discretionary: {
            sustainableSupportIncludingInsurance: false,
            maintenanceWaiver: 'accepted',
          },
        },
        'R17',
      ).status,
    ).toBe('MET');
    expect(
      find(
        'C52',
        {
          criminalRecord: { kind: 'bar-confirmed' },
          discretionary: { convictionWaiver: 'accepted' },
        },
        'R17',
      ).status,
    ).toBe('MET');
    expect(
      find(
        'C52',
        {
          criminalRecord: { kind: 'pending-proceedings' },
          discretionary: { convictionWaiver: 'accepted' },
        },
        'R17',
      ).status,
    ).toBe('UNKNOWN');
    expect(
      find(
        'C61-guidance',
        {
          countedResidenceSince: '2021-11-24',
          discretionary: { integrationException: 'refused' },
        },
        'R17',
      ).status,
    ).toBe('NOT_MET');
    expect(
      find('C61-guidance', { currentTitle: 'section-23a-hardship' }, 'R17')
        .status,
    ).toBe('MET');
    expect(
      find('C62', { discretionary: { decision: 'refused' } }, 'R17').status,
    ).toBe('NOT_MET');
    expect(find('C62', {}, 'R17').status).toBe('UNKNOWN');
  });
});
