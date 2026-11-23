import { describe, expect, test } from 'vitest';
import { evaluateCanadaFull, type CaFullRequest } from '../src';
import type { ResidenceAnswers } from '../src/canada-full/residence';

const today = '2026-11-23';
const base: CaFullRequest = {
  simulationDate: today,
  dateOfBirth: '1980-01-01',
  permanentResident: '2015-01-01',
  temporaryPeriods: [],
  trips: [],
  locale: 'en',
};
const clear: ResidenceAnswers = {
  prStatus: 'valid',
  prConditionsFulfilled: true,
  prDays: { credits: [], exclusions: [] },
  humanitarianRelief: 'none',
  adultSigned: true,
  citizenshipDays: { credits: [], exclusions: [] },
  taxYears: { 2022: 'filed', 2023: 'not-required', 2024: 'filed' },
  language: { evidence: 'accepted-levels', speaking: 4, listening: 4 },
  test: { correct: 15 },
  noEffectiveRemovalOrder: true,
  noEffectiveSecurityDeclaration: true,
  returnAuthorizedIfRequired: true,
  noCurrentSentenceOrProbation: true,
  noProhibitedCanadianProceedings: true,
  noEquivalentForeignProceedings: true,
  noWarCrimesProceedingsOrConviction: true,
  history: {
    convictions: [],
    misrepresentationBars: [],
    revocations: [],
    noCurrentMisrepresentation: true,
    specialProhibitionCleared: true,
    classificationsConfirmed: true,
  },
  identityAndDeclarationsReady: true,
  fingerprintAndCourtRequestsSatisfied: true,
  policeStays: [],
  citizenshipFeesPaid: true,
  grantDate: today,
  oath: 'taken',
  stillEligibleAtGrant: true,
};
function path(
  id: string,
  answers: ResidenceAnswers = {},
  over: Partial<CaFullRequest> = {},
) {
  return evaluateCanadaFull({
    ...base,
    ...over,
    residence: { ...clear, ...answers },
  }).columns[0].pathways.find((p) => p.id === id)!;
}
const check = (p: ReturnType<typeof path>, id: string) =>
  p.checks.find((c) => c.id === `CA-R${id}`)!;
const cit = (answers?: ResidenceAnswers, over?: Partial<CaFullRequest>) =>
  path('CA-CITIZENSHIP', answers, over);
const pr = (answers?: ResidenceAnswers, over?: Partial<CaFullRequest>) =>
  path('CA-RESIDENCY', answers, over);
describe('Canadian residency obligation and document branches', () => {
  test('physical baseline, substantiated additions, disputed days and overlapping evidence', () => {
    // Ordinary 5y window: [2021-11-23, 2026-11-23), back 2024-11-24 -> 729 days.
    const trip = {
      trips: [{ departed: '2020-01-01', returned: '2024-11-24' }],
    };
    const none = pr({}, trip);
    expect(check(none, '02').explanation).toContain('729');
    expect(check(none, '02').status).toBe('NOT_MET');
    expect(none).toMatchObject({
      status: 'FUTURE',
      earliestDate: '2026-11-24',
    });
    const day = { from: '2024-11-23', to: '2024-11-23' };
    const tentative = pr(
      {
        prDays: { credits: [{ ...day, evidence: 'pending' }], exclusions: [] },
      },
      trip,
    );
    expect(check(tentative, '03').explanation).toContain('729 to 730');
    expect(tentative.status).toBe('UNKNOWN');
    expect(check(tentative, '03').pendingDetails).toContain('PD-240');
    const confirmed = pr(
      {
        prDays: {
          credits: [
            { ...day, evidence: 'accepted' },
            { ...day, evidence: 'accepted' },
          ],
          exclusions: [],
        },
      },
      trip,
    );
    expect(check(confirmed, '03').explanation).toContain('730 to 730');
    expect(confirmed.status).toBe('MET');
    expect(pr({ humanitarianRelief: 'approved' }, trip).status).toBe('MET');
    expect(check(pr({ prStatus: 'under-review' }), '01').status).toBe(
      'UNKNOWN',
    );
    expect(pr({ prStatus: 'lost' }).status).toBe('NOT_MET');
    expect(check(pr(), '02').status).toBe('MET');
  });
  test('Crown and enforcement date ranges are included only once and only when material', () => {
    const one = {
      from: '2024-11-22',
      to: '2024-11-22',
      evidence: 'pending',
    } as const;
    expect(
      check(pr({ prDays: { credits: [], exclusions: [one] } }), '03').status,
    ).toBe('MET');
    const excluded = {
      from: '2021-11-23',
      to: '2024-11-23',
      evidence: 'accepted',
    } as const;
    expect(
      check(pr({ prDays: { credits: [], exclusions: [excluded] } }), '03')
        .status,
    ).toBe('NOT_MET');
  });
  test('first card 180 days; a PRTD can use an open appeal with recent presence', () => {
    const card = {
      kind: 'first',
      canadianAddress: true,
      inCanada: true,
      photosAndSignaturesReady: true,
      firstCardDetailsDate: '2026-06-30',
    } as const;
    const over = { permanentResident: '2026-01-01' };
    expect(check(pr({ card }, over), '04').status).toBe('MET');
    expect(
      check(
        pr({ card: { ...card, firstCardDetailsDate: '2026-07-01' } }, over),
        '04',
      ).status,
    ).toBe('NOT_MET');
    const t = {
      outsideCanada: true,
      lacksValidCard: true,
      lastInCanada: '2025-11-23',
      appealOpenOrPending: true,
      travelAndResidencyEvidenceReady: true,
      paid: true,
    };
    const noDays = {
      trips: [{ departed: '2019-01-01', returned: '2026-12-01' }],
    };
    expect(check(pr({ prtd: t }, noDays), '05').status).toBe('MET');
    expect(
      check(pr({ prtd: { ...t, lastInCanada: '2025-11-22' } }, noDays), '05')
        .status,
    ).toBe('NOT_MET');
    expect(
      check(pr({ prtd: { ...t, paid: false } }, noDays), '05').status,
    ).toBe('NOT_MET');
  });
});
describe('Canadian citizenship grants', () => {
  test('adult grant checks, final grant conditions and informational items', () => {
    const adult = cit();
    expect(adult.status).toBe('MET');
    for (const c of adult.checks) {
      expect(c.status, c.id).toBe('MET');
      expect(c.sources.length).toBeGreaterThan(0);
    }
    expect(check(adult, '17').explanation).toContain('653');
    for (const [id, input] of [
      ['06', { adultSigned: false }],
      ['07', { prConditionsFulfilled: false }],
      ['12', { returnAuthorizedIfRequired: false }],
      ['13', { noCurrentSentenceOrProbation: false }],
      [
        '14',
        { history: { ...clear.history, noCurrentMisrepresentation: false } },
      ],
      ['15', { identityAndDeclarationsReady: false }],
      ['16', { oath: 'refused' }],
      ['17', { citizenshipFeesPaid: false }],
    ] as const)
      expect(check(cit(input), id).status, id).toBe('NOT_MET');
    expect(check(cit({ citizenshipFeesPaid: undefined }), '17').status).toBe(
      'UNKNOWN',
    );
    expect(check(cit(), '18').explanation).toContain('no independent income');
    expect(cit({ test: { outcome: 'not-taken' } }).status).toBe('UNKNOWN');
    expect(
      cit({
        test: { outcome: 'not-taken' },
        noCurrentSentenceOrProbation: false,
      }).status,
    ).toBe('NOT_MET');
  });
  test('payment at filing affects eligibility independently of the fee quote', () => {
    const applicant = { dateOfBirth: '1960-01-01' };
    const beforeGrant: ResidenceAnswers = {
      grantDate: undefined,
      oath: 'waiting',
    };
    for (const [citizenshipFeesPaid, status] of [
      [false, 'NOT_MET'],
      [undefined, 'UNKNOWN'],
      [true, 'MET'],
    ] as const) {
      const result = cit({ ...beforeGrant, citizenshipFeesPaid }, applicant);
      expect(check(result, '17').status).toBe(status);
      expect(result.status).toBe(status);
    }
    const unquoted = cit(beforeGrant, {
      ...applicant,
      simulationDate: '2026-11-24',
    });
    expect(check(unquoted, '17').explanation).toContain(
      'Confirm the fee schedule',
    );
    expect(unquoted.status).toBe('MET');
  });
  test('only a projected time requirement gives the whole grant a future date', () => {
    const applicant = { permanentResident: '2024-01-01' };
    const beforeGrant: ResidenceAnswers = {
      grantDate: undefined,
      oath: 'waiting',
    };
    const future = cit(beforeGrant, applicant);
    expect(check(future, '08').status).toBe('NOT_MET');
    expect(future).toMatchObject({
      status: 'FUTURE',
      earliestDate: '2026-12-31',
    });
    for (const [citizenshipFeesPaid, status] of [
      [false, 'NOT_MET'],
      [undefined, 'UNKNOWN'],
    ] as const) {
      const result = cit({ ...beforeGrant, citizenshipFeesPaid }, applicant);
      expect(result.status).toBe(status);
      expect(result.earliestDate).toBeUndefined();
    }
    const excludedDay = {
      from: today,
      to: today,
      evidence: 'accepted',
    } as const;
    const adjusted = cit(
      {
        ...beforeGrant,
        citizenshipDays: { credits: [], exclusions: [excludedDay] },
      },
      applicant,
    );
    expect(check(adjusted, '08').timeBaseline?.earliestDate).toBe('2026-12-31');
    expect(adjusted.earliestDate).toBeUndefined();
  });
  test('ordinary physical baseline 1,094.5 then 1,095; disputed credit and exclusions', () => {
    const over = {
      simulationDate: '2026-11-30',
      permanentResident: '2024-06-01',
      temporaryPeriods: [{ from: '2023-06-02', to: '2024-05-31' }],
    };
    expect(check(cit({}, over), '08').status).toBe('NOT_MET');
    expect(check(cit({}, over), '08').explanation).toContain('1094.5');
    const next = { ...over, simulationDate: '2026-12-01' };
    expect(check(cit({}, next), '08').status).toBe('MET');
    const pending = {
      from: '2026-11-01',
      to: '2026-11-02',
      evidence: 'pending',
    } as const;
    const uncertain = check(
      cit({ citizenshipDays: { credits: [], exclusions: [pending] } }, next),
      '08',
    );
    expect(uncertain.status).toBe('UNKNOWN');
    expect(uncertain.pendingDetails).toContain('PD-241');
  });
  test('tax year window follows signing including partial and non-required years', () => {
    const answers: ResidenceAnswers = {
      signingDate: '2026-01-01',
      taxYears: {
        2020: 'filed',
        2021: 'filed',
        2022: 'not-required',
        2023: 'not-filed',
        2024: 'not-filed',
        2025: 'not-filed',
        2026: 'filed',
      },
    };
    expect(check(cit(answers), '09').status).toBe('NOT_MET');
    expect(
      check(cit({ ...answers, signingDate: '2026-01-02' }), '09').status,
    ).toBe('MET');
    expect(
      check(
        cit({ ...answers, taxYears: { 2021: 'filed', 2022: 'not-required' } }),
        '09',
      ).pendingDetails,
    ).toContain('PD-242');
  });
  test('language and test use age at signing, both language components and official evidence', () => {
    const bad: ResidenceAnswers = {
      language: { evidence: 'accepted-levels', speaking: 4, listening: 3 },
      test: { correct: 14, outcome: 'finally-failed' },
    };
    for (const [dob, expected] of [
      ['2008-11-24', 'MET'],
      ['2008-11-23', 'NOT_MET'],
      ['1971-11-24', 'NOT_MET'],
      ['1971-11-23', 'MET'],
    ]) {
      const p = cit(bad, { dateOfBirth: dob });
      expect(check(p, '10').status).toBe(expected);
      expect(check(p, '11').status).toBe(expected);
    }
    expect(
      check(
        cit({
          language: { evidence: 'self-assessed', speaking: 5, listening: 5 },
        }),
        '10',
      ).status,
    ).toBe('UNKNOWN');
    expect(
      check(
        cit({ test: { outcome: 'retry', correct: 14, attemptsUsed: 2 } }),
        '11',
      ).status,
    ).toBe('UNKNOWN');
    expect(
      check(
        cit({ language: { waiver: 'approved' }, test: { waiver: 'approved' } }),
        '11',
      ).status,
    ).toBe('MET');
  });
  test('pending waivers stay open until an official decision', () => {
    const pending = cit({
      language: { waiver: 'pending' },
      test: { waiver: 'pending' },
      oath: 'waiting',
      oathWaiver: 'pending',
      grantDate: '2026-11-23',
    });
    for (const n of ['10', '11', '16'])
      expect(check(pending, n).pendingDetails).toContain('PD-259');
  });
  test('conviction at the lookback boundary or after filing; police certificate at 183 days', () => {
    const hist = (d: string) => ({
      history: { ...clear.history, convictions: [d] },
    });
    expect(check(cit(hist('2022-11-22')), '14').status).toBe('MET');
    expect(check(cit(hist('2022-11-23')), '14').status).toBe('NOT_MET');
    expect(
      check(cit({ ...hist('2026-09-01'), signingDate: '2026-07-01' }), '14')
        .status,
    ).toBe('NOT_MET');
    const stay = {
      from: '2025-01-01',
      to: '2025-07-01',
      certificateOrExceptionAccepted: false,
    };
    expect(check(cit({ policeStays: [stay] }), '15').status).toBe('MET');
    expect(
      check(cit({ policeStays: [{ ...stay, to: '2025-07-02' }] }), '15').status,
    ).toBe('NOT_MET');
  });
  test('5(2) exempts ordinary presence and taxes; oath age is at grant, joint parent still pending', () => {
    const over = { dateOfBirth: '2012-11-24', permanentResident: '2026-11-15' };
    const answers: ResidenceAnswers = {
      parentageConfirmed: true,
      parent: 'citizen',
      authorizedRepresentativeSigned: true,
      grantDate: today,
      oath: 'waiting',
    };
    const p = path('CA-CIT-MINOR-52', answers, over);
    expect(p.status).toBe('MET');
    expect(check(p, '17').explanation).toContain('100');
    expect(check(p, '08').status).toBe('MET');
    expect(check(p, '09').status).toBe('MET');
    expect(
      check(
        path('CA-CIT-MINOR-52', { ...answers, grantDate: '2026-11-24' }, over),
        '16',
      ).status,
    ).toBe('UNKNOWN');
    expect(
      check(
        path(
          'CA-CIT-MINOR-52',
          { ...answers, parent: 'co-applicant-pending' },
          over,
        ),
        '06',
      ).status,
    ).toBe('UNKNOWN');
    expect(
      check(
        path('CA-CIT-MINOR-52', { ...answers, parent: 'not-citizen' }, over),
        '06',
      ).status,
    ).toBe('NOT_MET');
  });
  test('documented CAF secondment substitutes for PR, ordinary residence and filing, not criminal restrictions', () => {
    const caf = {
      route: 'attached-or-seconded',
      serviceConfirmed: true,
      yearsOfQualifyingService: 3,
      signedForDate: today,
    } as const;
    const p = cit(
      { caf, prStatus: 'never', taxYears: {}, citizenshipDays: undefined },
      { permanentResident: undefined },
    );
    expect(p.status).toBe('MET');
    expect(
      check(cit({ caf: { ...caf, yearsOfQualifyingService: 2.99 } }), '19')
        .status,
    ).toBe('NOT_MET');
    expect(
      check(cit({ caf: { ...caf, serviceConfirmed: undefined } }), '19').status,
    ).toBe('UNKNOWN');
    const member = { ...caf, route: 'pr-member', release: 'other' } as const;
    expect(
      check(cit({ caf: member }, { permanentResident: '2026-01-01' }), '08')
        .status,
    ).toBe('NOT_MET');
  });
});

test('IRPR s.62 counts the report date and excludes only later days, unless later found compliant', () => {
  // Rolling window starts 2021-11-23; its 730th day is 2023-11-22.
  const e = { decisionDate: '2023-11-22', laterFoundCompliant: false };
  expect(check(pr({ enforcement: e }), '03').status).toBe('MET');
  const earlier = { ...e, decisionDate: '2023-11-21' };
  expect(check(pr({ enforcement: earlier }), '03').status).toBe('NOT_MET');
  expect(
    check(
      pr({ enforcement: { ...earlier, laterFoundCompliant: undefined } }),
      '03',
    ).status,
  ).toBe('UNKNOWN');
  expect(
    check(pr({ enforcement: { ...earlier, laterFoundCompliant: true } }), '03')
      .status,
  ).toBe('MET');
});
