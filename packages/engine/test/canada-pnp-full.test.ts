import { describe, expect, test } from 'vitest';
import { evaluateCanadaFull } from '../src';
import type { PnpAnswers } from '../src/canada-full/pnp';

const date = '2026-11-23';
type Ontario = NonNullable<PnpAnswers['ontario']>;
const high: Ontario = {
  category: 'high',
  eoi: '2026-08-04',
  invited: '2026-11-01',
  employerFiled: '2026-11-15',
  filed: '2026-11-18',
  employerPortalPosition: true,
  eoiClaimsDocumented: true,
  lawfulStatusIfInCanada: true,
  intendsOntario: true,
  region: 'other',
  activeBusinessYears: 3,
  ontarioPremises: true,
  workPrimarilyInOntario: true,
  lastYearRevenue: 250000,
  priorYearRevenue: 250000,
  localFullTimeCitizensOrPr: 3,
  labourOrdersClear: true,
  recruitmentSatisfiedIfRequired: true,
  offerNoc: '21211',
  permanentEmployeeJob: true,
  urgentBusinessNeed: true,
  labourDisputeUnaffected: true,
  directorApproval: 'approved',
  jobConditionsMaintained: true,
  weeklyHours: 30,
  annualHours: 1560,
  offeredHourlyWage: 30,
  applicableMedianWage: 30,
  currentHourlyWage: 30,
  familyEquityPercent: 9.99,
  equityOnlyFromPay: true,
  licenceRequired: false,
  consecutiveOntarioMonths: 6,
  work: [],
  recentGraduate: false,
  education: 'postsecondary',
  fullTimeStudyYears: 1,
  origin: 'foreign-equivalent',
  designatedEcaDate: '2021-11-19',
  language: { date: '2024-11-19', scores: [6, 6, 6, 6] },
  feePaid: 1500,
};
const base: PnpAnswers = {
  stream: 'ontario-workforce',
  mode: 'base',
  nomination: 'valid',
  intendsNominatingProvince: true,
  investment: 'none',
  nominationExpires: date,
  federalFiled: date,
  viaPrPortal: true,
  ontario: high,
};

function route(pnp: PnpAnswers) {
  return evaluateCanadaFull({
    simulationDate: date,
    pnp,
  }).columns[0].pathways.find((p) => p.id === 'CA-PNP')!;
}
function on(rule: number, patch: Partial<Ontario>) {
  return route({ ...base, ontario: { ...high, ...patch } }).checks.find(
    (c) => c.id === `CA-R${rule}`,
  )!;
}
function federal(rule: number, patch: Partial<PnpAnswers>) {
  return route({ ...base, ...patch }).checks.find(
    (c) => c.id === `CA-R${rule}`,
  )!;
}

describe('provincial nominee class and Ontario Workforce Priority', () => {
  test('known base and Ontario evidence meets each applicable provincial rule; the selected category controls the checks', () => {
    const checks = route(base).checks;
    for (const id of [45, 46, 47, 48, 49, 50, 51, 54])
      expect(checks.find((c) => c.id === `CA-R${id}`)?.status).toBe('MET');
    for (const id of [52, 53])
      expect(checks.find((c) => c.id === `CA-R${id}`)).toBeUndefined();
    expect(federal(45, { nomination: 'pending' })).toMatchObject({
      status: 'UNKNOWN',
      pendingDetails: ['PD-250'],
    });
    expect(
      on(47, {
        invited: '2026-11-24',
        employerFiled: '2026-11-26',
        filed: '2026-11-29',
      }).status,
    ).toBe('UNKNOWN');
    expect(federal(45, { nominationIssued: '2026-11-24' }).status).toBe(
      'UNKNOWN',
    );
    expect(federal(45, { nominationExpires: '2026-11-22' }).status).toBe(
      'NOT_MET',
    );
    expect(federal(45, { nomination: 'withdrawn' }).status).toBe('NOT_MET');
    expect(federal(46, { nominationExpires: '2026-11-22' }).status).toBe(
      'NOT_MET',
    );
    expect(federal(46, { mode: 'enhanced' }).status).toBe('UNKNOWN');
    expect(
      federal(46, {
        mode: 'enhanced',
        qualifiesUnderlyingEeProgram: true,
        electronicNominationMatchedAndAccepted: true,
      }).status,
    ).toBe('MET');
    expect(
      route({ ...base, stream: 'other' }).checks.some((c) => c.id === 'CA-R48'),
    ).toBe(false);
  });
  test('active investment exception needs every limb, with either equity threshold', () => {
    const investment: Partial<PnpAnswers> = {
      investment: 'business',
      activeOngoingManagement: true,
      noRedemptionOption: true,
      capitalInActiveBusinessInNominatingProvince: true,
      investmentExceptionDocumented: true,
      equityInvestment: 999999,
      equityShare: 1 / 3,
    };
    expect(federal(45, investment).status).toBe('MET');
    expect(federal(45, { ...investment, equityShare: 0.3333 }).status).toBe(
      'NOT_MET',
    );
    expect(
      federal(45, {
        ...investment,
        equityShare: 0.3,
        equityInvestment: 1000000,
      }).status,
    ).toBe('MET');
    expect(
      federal(45, { ...investment, noRedemptionOption: false }).status,
    ).toBe('NOT_MET');
  });
  test.each<[number, Partial<Ontario>]>([
    [47, { employerFiled: '2026-11-16' }],
    [47, { filed: '2026-11-19' }],
    [47, { filed: '2026-11-14' }],
    [48, { priorYearRevenue: 249999, lastYearRevenue: 800000 }],
    [48, { activeBusinessYears: 2.99 }],
    [
      48,
      { region: 'gta', lastYearRevenue: 1000000, localFullTimeCitizensOrPr: 4 },
    ],
    [48, { region: 'designated-division', lastYearRevenue: 499999 }],
    [49, { weeklyHours: 29.9 }],
    [49, { annualHours: 1559 }],
    [49, { offeredHourlyWage: 29.99 }],
    [49, { familyEquityPercent: 10 }],
    [50, { consecutiveOntarioMonths: 5.99 }],
    [51, { designatedEcaDate: '2021-11-18' }],
    [51, { language: { date: '2026-10-01', scores: [6, 5, 8, 8] } }],
    [54, { feePaid: 1499 }],
  ])('R%i rejects below-rule evidence %j', (rule, patch) =>
    expect(on(rule, patch).status).toBe('NOT_MET'),
  );
  test('GTA and designated division only need the most recent year; provincial fee follows address', () => {
    expect(
      on(48, {
        region: 'gta',
        lastYearRevenue: 1000000,
        priorYearRevenue: 0,
        localFullTimeCitizensOrPr: 5,
      }).status,
    ).toBe('MET');
    expect(
      on(48, {
        region: 'designated-division',
        lastYearRevenue: 500000,
        priorYearRevenue: 0,
      }).status,
    ).toBe('MET');
    expect(on(54, { region: 'gta', feePaid: 2000 })).toMatchObject({
      status: 'MET',
      explanation: expect.stringContaining('2000'),
    });
  });
  test('recent graduate, statutory NOC mappings, obligatory licence, driver and trade exceptions', () => {
    const grad: Ontario['recentGraduate'] = {
      eligibleOntarioInstitution: true,
      graduation: '2025-06-30',
      credential: 'degree-diploma',
      fullTimeYears: 2,
    };
    expect(
      on(50, { consecutiveOntarioMonths: 3, recentGraduate: grad }).status,
    ).toBe('MET');
    expect(
      on(49, {
        recentGraduate: grad,
        applicableMedianWage: 40,
        applicableLowWage: 30,
      }).status,
    ).toBe('MET');
    expect(on(51, { recentGraduate: grad, language: undefined }).status).toBe(
      'MET',
    );
    expect(
      on(50, {
        consecutiveOntarioMonths: 0,
        offerNoc: '33103',
        work: [{ noc: '31120', months: 24 }],
      }).status,
    ).toBe('MET');
    expect(
      on(50, {
        consecutiveOntarioMonths: 0,
        offerNoc: '33103',
        work: [{ noc: '31120', months: 23.9 }],
      }).status,
    ).toBe('NOT_MET');
    expect(
      on(50, {
        consecutiveOntarioMonths: 0,
        licenceRequired: true,
        validLicence: true,
      }).status,
    ).toBe('MET');
    expect(
      on(50, {
        consecutiveOntarioMonths: 3,
        offerNoc: '73300',
        licenceRequired: true,
        validLicence: true,
        recentGraduate: grad,
      }).status,
    ).toBe('NOT_MET');
    expect(
      on(51, {
        offerNoc: '73300',
        education: 'secondary',
        language: { date: '2026-05-23', scores: [5, 5, 5, 5] },
      }),
    ).toMatchObject({ status: 'UNKNOWN', pendingDetails: ['PD-251'] });
    expect(
      on(51, {
        offerNoc: '63200',
        education: 'secondary',
        language: { date: '2026-05-23', scores: [5, 5, 5, 5] },
      }).status,
    ).toBe('MET');
  });
  test('lower-skilled months, school and four language scores are independent of a licence', () => {
    const lower: Partial<Ontario> = {
      category: 'lower',
      offerNoc: '44101',
      lowerOntarioMonths: 9,
      education: 'secondary',
      language: { date: '2026-10-19', scores: [4, 4, 4, 4] },
      licenceRequired: true,
      validLicence: true,
    };
    expect(on(52, lower).status).toBe('MET');
    expect(on(52, { ...lower, lowerOntarioMonths: 8.99 }).status).toBe(
      'NOT_MET',
    );
    expect(
      on(52, {
        ...lower,
        language: { date: '2026-11-01', scores: [4, 4, 4, 3] },
      }).status,
    ).toBe('NOT_MET');
  });
  test('self-employed physicians use their own filing and licence branch', () => {
    const physician: Partial<Ontario> = {
      category: 'physician',
      employerFiled: undefined,
      employerPortalPosition: undefined,
      selfEmployedPhysician: true,
      cpsoGoodStanding: true,
      physicianLicence: 'provisional',
      ohipBillingEligible: true,
    };
    expect(on(47, physician).status).toBe('MET');
    expect(on(53, physician).status).toBe('MET');
    expect(
      on(53, { ...physician, physicianLicence: 'postgraduate' }).status,
    ).toBe('NOT_MET');
    expect(
      on(53, { ...physician, ohipBillingEligible: undefined }).status,
    ).toBe('UNKNOWN');
    expect(
      route({ ...base, ontario: { ...high, ...physician } }).checks.some(
        (c) => c.id === 'CA-R49',
      ),
    ).toBe(false);
  });
});
