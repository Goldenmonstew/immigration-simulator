import { renderToStaticMarkup } from 'react-dom/server';
import { expect, test } from 'vitest';
import UnitedStatesPage from '../app/united-states/page';
import UnitedStatesPolicyPage from '../app/united-states/policy/page';
import { GET as offlinePages } from '../app/offline-pages.json/route';
import sitemap from '../app/sitemap';
import Home from '../app/page';
import { ResultView } from '../components/result-view';
import { UnitedStatesWhatIfControls } from '../app/united-states/whatif/controls';
import { t } from '../i18n';
import { usFormEn, usFormZh } from '../i18n/countries/united-states-form';
import { LocaleContext } from '../i18n/locale';
import { decodeDraft, encodeDraft } from '../lib/share';
import type { UsDraft } from '../lib/united-states-draft';
import {
  unitedStatesRequest,
  unitedStatesSteps,
} from '../lib/united-states-draft';
import { usStepDefinitions, type UsField } from '../lib/united-states-fields';
import { unitedStatesModule as us } from '../lib/united-states-module';
import { japanModule } from '../lib/japan-module';
import { sourceUrls } from '../lib/sources';
import { gapRules } from '../lib/gap-summary';

const render = (node: React.ReactNode, locale: 'zh-CN' | 'en' = 'zh-CN') =>
  renderToStaticMarkup(
    <LocaleContext value={{ locale, setLocale: () => {} }}>
      {node}
    </LocaleContext>,
  );

const pathwayOf = (draft: UsDraft, locale: 'zh-CN' | 'en' = 'zh-CN') =>
  us.run(draft, locale).columns[0].pathways[0];

// A green card holder abroad, returning on a valid card after seven weeks.
export const travelDraft = (returned = '2026-12-20'): UsDraft => ({
  version: 1,
  step: 13,
  completed: true,
  simulationDate: '2026-11-21',
  pathway: 'US-TRAVEL',
  dateOfBirth: '1990-05-01',
  permanentResident: '2022-03-01',
  conditional: 'none',
  trips: [{ departed: '2026-11-01', returned }],
  travel: {
    registration: 'registered',
    carryingEvidence: true,
    movedOn: 'no-move',
    cardExpiresOn: '2032-03-01',
    otherReplacementGround: false,
    admissionTriggers: 'none',
    deportability: 'cleared',
    returnDocument: 'green-card',
    documentValidAtReturn: true,
    abandonment: 'cleared',
    feeForm: 'ar11',
  },
  fees: { relief: 'none' },
});

const naturalizationDraft: UsDraft = {
  version: 1,
  step: 13,
  completed: true,
  simulationDate: '2026-11-21',
  pathway: 'US-NATURALIZATION',
  dateOfBirth: '1990-05-01',
  permanentResident: '2022-03-01',
  conditional: 'none',
  stateResidenceFrom: '2020-01-01',
  trips: [],
};

test.each(['zh-CN', 'en'] as const)(
  'the home page links to the questionnaire and policy in %s',
  (locale) => {
    const html = render(<UnitedStatesPage />, locale);
    expect(html).toContain('href="/united-states/simulate"');
    expect(html).toContain('href="/united-states/policy"');
    expect(html).toContain(t('us.title', locale));
    expect(html).toContain(t('us.outOfScope', locale));
    expect(render(<Home />, locale)).toContain('href="/united-states"');
  },
);

test('all five United States pages are in the offline and sitemap lists', async () => {
  const offline = await offlinePages().json();
  const paths = sitemap().map(({ url }) => new URL(url).pathname);
  for (const sub of ['', '/simulate', '/result', '/whatif', '/policy']) {
    expect(offline).toContain('/united-states' + sub);
    expect(paths).toContain('/united-states' + sub);
  }
});

test('every question has wording in both languages', () => {
  const keys = new Set<string>();
  const collect = (fields: UsField[]) => {
    for (const field of fields) {
      keys.add('us.field.' + field.label);
      if (field.hint) keys.add('us.hint.' + field.hint);
      for (const option of field.alternatives ?? [])
        keys.add('us.option.' + option);
      if (field.type === 'choice')
        for (const option of field.options)
          keys.add('us.option.' + (field.labels?.[option] ?? option));
      if (field.type === 'group' || field.type === 'list')
        collect(field.fields);
    }
  };
  for (const definition of usStepDefinitions) {
    keys.add('us.step.' + definition.title);
    keys.add('us.intro.' + definition.title);
    for (const section of definition.sections) {
      collect(section.fields);
      if (section.title) keys.add('us.section.' + section.title);
    }
  }
  for (const key of keys) {
    expect(usFormZh, key).toHaveProperty([key]);
    expect(usFormEn, key).toHaveProperty([key]);
  }
});

test('drafts round-trip in their own share envelope and invalid drafts are rejected', () => {
  const draft = travelDraft();
  const encoded = encodeDraft(us, draft);
  expect(decodeDraft(us, encoded)).toEqual(draft);
  expect(decodeDraft(japanModule, encoded)).toBeUndefined();
  expect(
    decodeDraft(us, encodeDraft(japanModule, japanModule.createDraft())),
  ).toBeUndefined();
  const fresh = us.createDraft();
  expect(us.decodeDraft(fresh)).toEqual(fresh);
  for (const bad of [
    null,
    { ...draft, version: 2 },
    { ...draft, pathway: 'US-LOTTERY' },
    { ...draft, step: 2 },
    { ...draft, trips: 'none' },
    { ...draft, travel: { ...draft.travel, deportability: 'yes' } },
    { ...draft, fees: [] },
  ])
    expect(us.decodeDraft(bad)).toBeUndefined();
  // A saved draft that no longer validates reopens at the failing step.
  const incomplete = { ...draft, permanentResident: undefined };
  expect(us.decodeDraft(incomplete)).toMatchObject({
    completed: false,
    step: 1,
  });
  expect(us.decodeDraft(incomplete, true)).toBeUndefined();
});

test('answers for questions that are not shown stay out of the assessment and the link', () => {
  const draft: UsDraft = {
    ...travelDraft(),
    naturalization: { english: 'passed' },
    employment: { category: 'eb3' },
    travel: { ...travelDraft().travel, permitFiledOn: '2026-01-01' },
  };
  const active = us.activeAnswers!(draft);
  expect(active).not.toHaveProperty('naturalization');
  expect(active).not.toHaveProperty('employment');
  expect(active.travel).not.toHaveProperty('permitFiledOn');
  expect(decodeDraft(us, encodeDraft(us, draft))).toEqual(travelDraft());
});

test('the pathway, the green card date and the employment petition status are required', () => {
  const fresh = us.createDraft();
  expect(unitedStatesSteps(fresh)).toHaveLength(1);
  expect(us.validateStep(fresh)).toEqual({ 'us-pathway': 'us.error.required' });
  const chosen = { ...fresh, pathway: 'US-NATURALIZATION' as const };
  expect(us.validateStep(chosen)).toEqual({
    'us-dateOfBirth': 'us.error.required',
  });
  expect(us.validateStep({ ...chosen, step: 1 })).toEqual({
    'us-permanentResident': 'us.error.required',
  });
  expect(unitedStatesSteps(chosen).map(({ step }) => step)).toEqual([
    0, 1, 3, 4, 13,
  ]);
  const family: UsDraft = {
    ...fresh,
    pathway: 'US-FAMILY',
    admission: { process: 'consular' },
  };
  expect(unitedStatesSteps(family).map(({ step }) => step)).toEqual([
    0, 1, 7, 10, 11, 12, 13,
  ]);
  expect(us.validateStep({ ...family, step: 10 })).toEqual({});
  expect(
    us.validateStep({
      ...family,
      step: 10,
      admission: { process: 'consular', petitionStatus: 'filed-with-i485' },
    }),
  ).toEqual({ 'us-admission-petitionStatus': 'us.error.consularPetition' });
});

test('trips must be in order, after the green card and must not overlap', () => {
  const draft = { ...travelDraft(), step: 1 };
  expect(us.validateStep(draft)).toEqual({});
  expect(
    us.validateStep({
      ...draft,
      trips: [
        { departed: '2026-09-01', returned: '2026-09-20' },
        { departed: '2026-11-01', returned: '2026-10-20' },
        { departed: '2021-01-01', returned: '2021-02-01' },
        { departed: '2026-09-10', returned: '2026-09-25' },
        { departed: '' as string, returned: '2026-11-05' },
      ],
    }),
  ).toEqual({
    'us-trips-1-returned': 'us.error.order',
    'us-trips-2-departed': 'us.error.beforeGreenCard',
    'us-trips-3-departed': 'us.error.overlap',
    'us-trips-4-departed': 'us.error.entered',
  });
});

const employmentDraft = (employment: UsDraft['employment']): UsDraft => ({
  ...us.createDraft(),
  simulationDate: '2026-11-21',
  step: 8,
  pathway: 'US-EMPLOYMENT',
  admission: { process: 'adjustment', petitionStatus: 'approved' },
  employment: {
    category: 'eb3',
    perm: 'certified',
    permRecruitment: { laborCertificationFiledOn: '2025-07-01' },
    ...employment,
  },
});

test('same-year wage records cannot describe the same wages twice', () => {
  const row = { year: 2026, paidUsd: 30000 };
  const errors = (wageYears: object[]) =>
    us.validateStep(
      employmentDraft({
        wageYears: wageYears as never,
        priorityYearProration: { finding: 'cleared' },
      }),
    );
  // Separate periods and year-to-date records are accepted.
  expect(
    errors([
      { ...row, through: '2026-06-30' },
      { ...row, from: '2026-07-01' },
      { year: 2025, through: '2025-06-30', paidUsd: 10000 },
      { year: 2025, paidUsd: 25000 },
    ]),
  ).toEqual({});
  expect(errors([row, { ...row, paidUsd: 50000 }])).toEqual({
    'us-employment-wageYears-1-from': 'us.error.wageOverlap',
  });
  expect(
    errors([
      { ...row, through: '2026-09-30' },
      { ...row, from: '2026-07-01' },
    ]),
  ).toEqual({ 'us-employment-wageYears-1-from': 'us.error.wageOverlap' });
  expect(
    errors([
      { ...row, through: '2026-06-30', paidUsd: 40000 },
      { ...row, paidUsd: 35000 },
    ]),
  ).toEqual({ 'us-employment-wageYears-1-paidUsd': 'us.error.wageCumulative' });
  expect(errors([{ ...row, through: '2025-12-31' }])).toEqual({
    'us-employment-wageYears-0-through': 'us.error.wageYear',
  });
});

test('without accepted proration the priority-date year starts on 1 January', () => {
  const split = {
    wageYears: [
      { year: 2025, through: '2025-06-30', netIncomeUsd: -20000 },
      { year: 2025, from: '2025-07-01', netIncomeUsd: 70000 },
    ],
  };
  expect(us.validateStep(employmentDraft(split))).toEqual({
    'us-employment-wageYears-1-from': 'us.error.wageProration',
  });
  for (const finding of [undefined, 'pending', 'barred'] as const)
    expect(
      us.validateStep(
        employmentDraft({
          ...split,
          ...(finding && { priorityYearProration: { finding } }),
        }),
      ),
    ).toHaveProperty(['us-employment-wageYears-1-from']);
  expect(
    us.validateStep(
      employmentDraft({
        ...split,
        priorityYearProration: { finding: 'cleared' },
      }),
    ),
  ).toEqual({});
  // A priority date on 1 January needs no split.
  expect(
    us.validateStep(
      employmentDraft({
        ...split,
        permRecruitment: { laborCertificationFiledOn: '2025-01-01' },
      }),
    ),
  ).toEqual({});
});

test('a planned return in the future gives the return date, which the comparison can move', () => {
  const future = pathwayOf(travelDraft());
  expect(future).toMatchObject({
    id: 'US-TRAVEL',
    status: 'FUTURE',
    earliestDate: '2026-12-20',
    travelDate: null,
  });
  const knobs = us.whatif.initial(travelDraft());
  expect(knobs).toMatchObject({
    simulationDate: '2026-11-21',
    returnOn: '2026-12-20',
    noTrips: false,
  });
  const after = us.whatif.apply(travelDraft(), {
    ...knobs,
    returnOn: '2027-01-05',
  });
  expect(
    us.whatif.validate(after, { ...knobs, returnOn: '2027-01-05' }),
  ).toEqual({});
  expect(after.trips).toEqual([
    { departed: '2026-11-01', returned: '2027-01-05' },
  ]);
  expect(travelDraft().trips![0].returned).toBe('2026-12-20');
  expect(pathwayOf(after).earliestDate).toBe('2027-01-05');
  expect(
    us.whatif.validate(
      us.whatif.apply(travelDraft(), { ...knobs, returnOn: '2026-10-01' }),
      { ...knobs, returnOn: '2026-10-01' },
    ),
  ).toEqual({ returnOn: 'us.error.order' });
});

test('a completed return meets the assessed requirements', () => {
  const draft = { ...travelDraft('2026-11-10') };
  expect(pathwayOf(draft)).toMatchObject({ status: 'MET' });
  expect(pathwayOf(draft).checks.every((check) => check.status === 'MET')).toBe(
    true,
  );
});

test('naturalization with open requirements is pending and lists them with sources', () => {
  const pathway = pathwayOf(naturalizationDraft);
  expect(pathway.status).toBe('UNKNOWN');
  expect(pathway.earliestDate).toBeUndefined();
  const english = pathway.checks.find((check) => check.id === 'US-C03-ENGLISH');
  expect(english?.status).toBe('UNKNOWN');
  expect(pathway.summary).toContain(
    t('us.result.approval').replace('{status}', t('country.status.UNKNOWN')),
  );
  const html = render(
    <ResultView
      country={us}
      result={us.run(naturalizationDraft, 'zh-CN')}
      draft={naturalizationDraft}
    />,
  );
  expect(html).toContain('一般入籍');
  expect(html).toContain(`href="${sourceUrls['SRC-291']}"`);
  // Passing the tests in a comparison resolves those checks only.
  const knobs = us.whatif.initial(naturalizationDraft);
  const after = us.whatif.apply(naturalizationDraft, {
    ...knobs,
    english: 'passed',
    civics: 'passed',
  });
  expect(after.naturalization).toEqual({
    english: 'passed',
    civics: 'passed',
  });
  const checks = pathwayOf(after).checks;
  expect(checks.find((check) => check.id === 'US-C03-ENGLISH')?.status).toBe(
    'MET',
  );
  expect(checks.find((check) => check.id === 'US-C04-CIVICS')?.status).toBe(
    'MET',
  );
  expect(naturalizationDraft).not.toHaveProperty('naturalization');
  expect(us.whatif.focusForRule('US-C03-ENGLISH', 'US-NATURALIZATION')).toBe(
    'english',
  );
  expect(us.whatif.focusForRule('US-TIME-TRAVEL', 'US-TRAVEL')).toBe(
    'returnOn',
  );
});

test('removing conditions before the window shows the earliest filing date and the approval stage', () => {
  const draft: UsDraft = {
    version: 1,
    step: 13,
    completed: true,
    simulationDate: '2026-11-21',
    pathway: 'US-CONDITIONS',
    dateOfBirth: '1990-05-01',
    permanentResident: '2025-06-01',
    conditional: 'marriage',
    trips: [],
    conditions: {
      marriage: {
        marriedOn: '2024-01-01',
        bonaFide: 'cleared',
        improperConsideration: false,
        filing: 'joint',
        spouseJoins: true,
        finalRemovalOrder: false,
      },
    },
    fees: {
      channel: 'online',
      relief: 'none',
      onlineCategoryAvailable: 'cleared',
    },
  };
  const pathway = pathwayOf(draft, 'en');
  expect(pathway).toMatchObject({
    status: 'FUTURE',
    earliestDate: '2027-03-03',
    approvalStatus: 'UNKNOWN',
  });
  expect(pathway.summary).toContain(
    t('us.result.approval', 'en').replace(
      '{status}',
      t('country.status.UNKNOWN', 'en'),
    ),
  );
  // Moving the assessment date into the window meets the filing timing. The
  // outcome stays open while approval requirements are (review96-1 #6).
  const knobs = us.whatif.initial(draft);
  const later = us.whatif.apply(draft, {
    ...knobs,
    simulationDate: '2027-03-10',
  });
  expect(pathwayOf(later)).toMatchObject({
    status: 'UNKNOWN',
    approvalStatus: 'UNKNOWN',
    earliestDate: '2027-03-10',
  });
  expect(pathwayOf(later).summary).toContain(
    t('us.result.approval').replace('{status}', t('country.status.UNKNOWN')),
  );
});

test('month and ground tables become records for the engine', () => {
  const draft: UsDraft = {
    ...us.createDraft(),
    simulationDate: '2026-11-21',
    pathway: 'US-ADJUSTMENT',
    admission: {
      process: 'adjustment',
      adjustmentBasis: 'other',
      visaAtFilingByMonth: [{ month: '2026-11', availability: 'available' }],
      otherInadmissibilityByGround: [{ ground: '6(C)', finding: 'cleared' }],
    },
  };
  expect(unitedStatesRequest(draft, 'en').admission).toMatchObject({
    visaAtFilingByMonth: { '2026-11': 'available' },
    otherInadmissibilityByGround: { '6(C)': 'cleared' },
  });
  expect(
    us.validateStep({
      ...draft,
      step: 10,
      admission: {
        ...draft.admission,
        petitionStatus: 'pending',
        visaAtFilingByMonth: [
          { month: '2026-11', availability: 'available' },
          { month: '2026-11', availability: 'unavailable' },
        ],
      },
    }),
  ).toEqual({
    'us-admission-visaAtFilingByMonth-1-month': 'us.error.duplicate',
  });
  expect(
    us.validateStep({
      ...draft,
      step: 12,
      admission: {
        ...draft.admission,
        otherInadmissibilityByGround: [{ ground: '4', finding: 'cleared' }],
      },
    }),
  ).toEqual({
    'us-admission-otherInadmissibilityByGround-0-ground': 'us.error.ground',
  });
});

test('result explanations do not repeat the condition title', () => {
  for (const draft of [travelDraft(), naturalizationDraft])
    for (const locale of ['zh-CN', 'en'] as const)
      for (const check of pathwayOf(draft, locale).checks)
        expect(check.explanation.startsWith(check.title), check.id).toBe(false);
});

test('the policy page lists every condition, United States sources only, under a country title', () => {
  const rules = us.policy.rules['us.current-law-2026-11'];
  const ids = rules.map((rule) => rule.id);
  expect(new Set(ids).size).toBe(ids.length);
  // Including the pending-I-485 condition (review96-1 #7).
  expect(ids).toHaveLength(105);
  expect(ids).toContain('US-I485-PENDING-ELIGIBILITY');
  for (const rule of rules) {
    expect(rule.titleEn, rule.id).toBeTruthy();
    expect(rule.sources.length, rule.id).toBeGreaterThan(0);
  }
  for (const draft of [travelDraft(), naturalizationDraft])
    for (const check of pathwayOf(draft).checks)
      expect(ids).toContain(check.id);
  const sources = Object.keys(us.policy.sourceUrls);
  expect(sources).toContain('SRC-309');
  expect(
    sources.every((id) => {
      const n = Number(id.slice(4));
      return (n >= 79 && n <= 82) || (n >= 290 && n <= 319);
    }),
  ).toBe(true);
  expect(t('us.policy.pageTitle')).toBe('美国政策依据');
  expect(t('us.policy.pageTitle', 'en')).toBe(
    'Policy basis for the United States',
  );
  const html = render(<UnitedStatesPolicyPage />, 'en');
  expect(html).toContain('data-pathway="US-HUMANITARIAN"');
  expect(html).toContain('data-rule="US-C29-ABILITY-TO-PAY"');
  expect(html).toContain('data-source="SRC-315"');
  expect(html).not.toContain('undefined');
});

const immigrantDraft = (
  pathway: 'US-FAMILY' | 'US-EMPLOYMENT' | 'US-ADJUSTMENT',
  admission: UsDraft['admission'],
  extra: Partial<UsDraft> = {},
): UsDraft => ({
  ...us.createDraft(),
  simulationDate: '2026-11-21',
  step: 10,
  pathway,
  admission,
  ...extra,
});

test('questions are shown, kept and required where the engine reads them (review96-1)', () => {
  // A consular decision in a later month uses that month's chart (#1).
  const consular = immigrantDraft(
    'US-FAMILY',
    {
      process: 'consular',
      decisionOn: '2026-12-10',
      visaAtFilingByMonth: [{ month: '2026-11', availability: 'available' }],
      visaAtDecisionByMonth: [{ month: '2026-12', availability: 'available' }],
    },
    { family: { petitioner: 'lpr', relationship: 'spouse' } },
  );
  const consularRequest = unitedStatesRequest(consular, 'en').admission;
  expect(consularRequest?.visaAtDecisionByMonth).toEqual({
    '2026-12': 'available',
  });
  expect(consularRequest).not.toHaveProperty('visaAtFilingByMonth');
  // The petition status can stay open unless a blank answer would date an
  // employment petition from the I-485 receipt (#3).
  expect(us.validateStep(consular)).toEqual({});
  for (const adjustmentBasis of ['245i', 'other'] as const)
    expect(
      us.validateStep(
        immigrantDraft('US-ADJUSTMENT', {
          process: 'adjustment',
          adjustmentBasis,
        }),
      ),
    ).toEqual({});
  expect(
    us.validateStep(immigrantDraft('US-EMPLOYMENT', { process: 'adjustment' })),
  ).toEqual({ 'us-admission-petitionStatus': 'us.error.required' });
  expect(
    us.validateStep(
      immigrantDraft('US-ADJUSTMENT', {
        process: 'adjustment',
        adjustmentBasis: 'employment',
      }),
    ),
  ).toEqual({ 'us-admission-petitionStatus': 'us.error.required' });
  // An employer filing for an EB-1A or NIW beneficiary pays by employer size (#4).
  const eb1a = immigrantDraft(
    'US-EMPLOYMENT',
    { process: 'consular' },
    {
      employment: {
        category: 'eb1a',
        i140SelfPetition: false,
        employerEmployees: 50,
        employerNonprofit: false,
      },
      fees: { channel: 'paper', relief: 'none' },
    },
  );
  expect(unitedStatesRequest(eb1a, 'en').employment).toMatchObject({
    employerEmployees: 50,
    employerNonprofit: false,
  });
  expect(
    pathwayOf(eb1a).checks.find((check) => check.id === 'US-C44-I140')?.status,
  ).toBe('MET');
  const selfPetition = unitedStatesRequest(
    { ...eb1a, employment: { ...eb1a.employment, i140SelfPetition: true } },
    'en',
  ).employment;
  expect(selfPetition).not.toHaveProperty('employerEmployees');
  expect(selfPetition).not.toHaveProperty('employerNonprofit');
  // VAWA on the family path and SIJ on the employment path replace the petition (#10).
  const steps = (draft: UsDraft) =>
    unitedStatesSteps(draft).map(({ step }) => step);
  expect(
    steps(
      immigrantDraft('US-FAMILY', {
        process: 'adjustment',
        adjustmentBasis: 'vawa',
      }),
    ),
  ).toEqual([0, 1, 10, 11, 12, 13]);
  expect(
    steps(
      immigrantDraft('US-EMPLOYMENT', {
        process: 'adjustment',
        adjustmentBasis: 'sij',
      }),
    ),
  ).toEqual([0, 1, 10, 11, 12, 13]);
  // A transfer from an employment basis checks that basis's adjustment bars (risk 1).
  const transfer = (qualifyingBasisAtFiling?: 'cleared') =>
    unitedStatesRequest(
      immigrantDraft('US-FAMILY', {
        process: 'adjustment',
        lawfulNonimmigrantStatusAtFiling: true,
        lawfulAdmissionFor245k: true,
        i485BasisTransfer: {
          originalPetition: {
            adjustmentBasis: 'employment',
            qualifyingBasisAtFiling,
          },
        },
      }),
      'en',
    ).admission;
  expect(transfer()).toMatchObject({
    lawfulNonimmigrantStatusAtFiling: true,
    lawfulAdmissionFor245k: true,
  });
  expect(transfer('cleared')).not.toHaveProperty(
    'lawfulNonimmigrantStatusAtFiling',
  );
  // The interview date is read for consular cases only (suggestion 4).
  const interview = (process: 'adjustment' | 'consular') =>
    unitedStatesRequest(
      immigrantDraft('US-FAMILY', { process, interviewOn: '2027-01-05' }),
      'en',
    ).admission;
  expect(interview('adjustment')).not.toHaveProperty('interviewOn');
  expect(interview('consular')).toHaveProperty('interviewOn', '2027-01-05');
  // A regular green card has no removal-of-conditions step.
  expect(
    steps({
      ...us.createDraft(),
      pathway: 'US-CONDITIONS',
      conditional: 'none',
    }),
  ).toEqual([0, 1, 13]);
});

test('wage and trip checks read the records as the engine does (review96-1)', () => {
  // A blank end date in the coverage year runs to the coverage date (#5).
  expect(
    us.validateStep(
      employmentDraft({
        profferedWageUsd: 75000,
        permRecruitment: { laborCertificationFiledOn: '2026-01-01' },
        wagePeriodComplete: true,
        wageYears: [
          { year: 2026, through: '2026-11-21', paidUsd: 50000 },
          { year: 2026, paidUsd: 80000 },
        ],
      }),
    ),
  ).toEqual({ 'us-employment-wageYears-1-from': 'us.error.wageOverlap' });
  // An EB-1B petition filed with the I-485 takes its receipt as the priority date (#5).
  const concurrent: UsDraft = {
    ...us.createDraft(),
    simulationDate: '2026-11-23',
    step: 8,
    pathway: 'US-EMPLOYMENT',
    admission: { process: 'adjustment', petitionStatus: 'filed-with-i485' },
    employment: {
      category: 'eb1b',
      profferedWageUsd: 60000,
      wagePeriodComplete: true,
      wageYears: [
        { year: 2026, through: '2026-11-22', netIncomeUsd: -20000 },
        {
          year: 2026,
          from: '2026-11-23',
          through: '2026-11-23',
          netIncomeUsd: 70000,
        },
      ],
    },
  };
  expect(us.validateStep(concurrent)).toEqual({
    'us-employment-wageYears-1-from': 'us.error.wageProration',
  });
  // While proration is undecided, wages paid from the priority date are
  // accepted; net income still covers the whole year (risk 3).
  const afterPriority = (
    finding?: 'pending' | 'barred',
    amounts: object = { paidUsd: 45000 },
  ) =>
    us.validateStep(
      employmentDraft({
        profferedWageUsd: 60000,
        wageYears: [
          { year: 2025, from: '2025-07-01', ...amounts },
          { year: 2026, paidUsd: 60000 },
        ],
        ...(finding && { priorityYearProration: { finding } }),
      }),
    );
  const proration = {
    'us-employment-wageYears-0-from': 'us.error.wageProration',
  };
  expect(afterPriority()).toEqual({});
  expect(afterPriority('pending')).toEqual({});
  expect(afterPriority('barred')).toEqual(proration);
  expect(afterPriority('pending', { netIncomeUsd: 70000 })).toEqual(proration);
  // Years have four digits (risk 4).
  expect(
    us.validateStep(employmentDraft({ wageYears: [{ year: 25, paidUsd: 1 }] })),
  ).toEqual({ 'us-employment-wageYears-0-year': 'us.error.year' });
  // A blank departure is reported once, not as an overlap (risk 4).
  expect(
    us.validateStep({
      ...travelDraft(),
      step: 1,
      trips: [
        { departed: '', returned: '2026-11-05' },
        { departed: '2026-09-01', returned: '2026-09-20' },
      ],
    }),
  ).toEqual({ 'us-trips-0-departed': 'us.error.entered' });
});

test('comparison controls drive the engine and keep answers tied to the assessment date (review96-1)', () => {
  const f2a = (admission: UsDraft['admission']) =>
    immigrantDraft(
      'US-FAMILY',
      {
        process: 'adjustment',
        petitionStatus: 'approved',
        decisionOn: '2027-02-01',
        ...admission,
      },
      { family: { petitioner: 'lpr', relationship: 'spouse' } },
    );
  const decisionMonths = (draft: UsDraft) =>
    unitedStatesRequest(draft, 'en').admission?.visaAtDecisionByMonth;
  const visa = (draft: UsDraft) =>
    pathwayOf(draft).checks.find(
      (check) => check.id === 'US-C33-VISA-AND-ENTRY',
    )?.status;
  // The decision-month chart drives the knob and the engine (#2).
  const charted = f2a({
    visaAtDecisionByMonth: [{ month: '2027-02', availability: 'unavailable' }],
  });
  const knobs = us.whatif.initial(charted);
  expect(knobs.visaAtDecision).toBe('unavailable');
  const available = us.whatif.apply(charted, {
    ...knobs,
    visaAtDecision: 'available',
  });
  expect(decisionMonths(available)).toEqual({ '2027-02': 'available' });
  expect(visa(charted)).toBe('NOT_MET');
  expect(visa(available)).not.toBe('NOT_MET');
  const blank = f2a({});
  expect(us.whatif.initial(blank).visaAtDecision).toBeUndefined();
  expect(
    decisionMonths(
      us.whatif.apply(blank, {
        ...us.whatif.initial(blank),
        visaAtDecision: 'available',
      }),
    ),
  ).toEqual({ '2027-02': 'available' });
  // A later decision date keeps the availability the knob shows (#2).
  const sameMonth = f2a({
    decisionOn: '2026-11-30',
    visaAtDecision: 'available',
  });
  const sameKnobs = us.whatif.initial(sameMonth);
  expect(sameKnobs.visaAtDecision).toBe('available');
  expect(
    decisionMonths(
      us.whatif.apply(sameMonth, { ...sameKnobs, decisionOn: '2027-01-15' }),
    ),
  ).toEqual({ '2027-01': 'available' });
  // Answers for the assessment date stay with that date when it moves (risk 5).
  const bound = f2a({
    decisionOn: undefined,
    visaAtFiling: 'available',
    visaAtDecision: 'available',
  });
  const moved = us.whatif.apply(bound, {
    ...us.whatif.initial(bound),
    simulationDate: '2027-01-10',
    visaAtDecision: undefined,
  });
  expect(moved.admission).toMatchObject({
    visaAtFilingByMonth: [{ month: '2026-11', availability: 'available' }],
    visaAtDecisionByMonth: [{ month: '2026-11', availability: 'available' }],
  });
  expect(moved.admission).not.toHaveProperty('visaAtFiling');
  expect(moved.admission).not.toHaveProperty('visaAtDecision');
  const refugee: UsDraft = {
    ...us.createDraft(),
    simulationDate: '2026-11-21',
    pathway: 'US-HUMANITARIAN',
    humanitarian: { status: 'refugee', presenceDays: 300 },
  };
  expect(
    us.whatif.apply(refugee, {
      ...us.whatif.initial(refugee),
      simulationDate: '2027-01-10',
    }).humanitarian,
  ).toMatchObject({ presenceDays: 300, presenceThrough: '2026-11-21' });
  const wages = employmentDraft({ wageYears: [{ year: 2026, paidUsd: 1 }] });
  expect(
    us.whatif.apply(wages, {
      ...us.whatif.initial(wages),
      simulationDate: '2027-01-10',
    }).employment,
  ).toMatchObject({ wagePeriodThrough: '2026-11-21' });
  // Untouched controls leave the result as it is.
  for (const draft of [
    travelDraft(),
    naturalizationDraft,
    charted,
    blank,
    sameMonth,
    bound,
    refugee,
    wages,
  ])
    expect(
      us.run(us.whatif.apply(draft, us.whatif.initial(draft)), 'en'),
    ).toEqual(us.run(draft, 'en'));
  // A cleared return date is an error, not the old date (#8).
  const travelKnobs = us.whatif.initial(travelDraft());
  expect(
    us.whatif.validate(
      us.whatif.apply(travelDraft(), { ...travelKnobs, returnOn: '' }),
      { ...travelKnobs, returnOn: '' },
    ),
  ).toEqual({ returnOn: 'us.error.date' });
  // Without a trip, the return-date link lands on an explanation (risk 2).
  const noTrip = { ...travelDraft(), trips: undefined };
  expect(us.whatif.focusForRule('US-TIME-TRAVEL', 'US-TRAVEL')).toBe(
    'returnOn',
  );
  const controls = (draft: UsDraft) =>
    render(
      <UnitedStatesWhatIfControls
        afterDraft={draft}
        knobs={us.whatif.initial(draft)}
        errors={{}}
        update={() => {}}
      />,
    );
  expect(controls(noTrip)).toMatch(
    /<p id="us-whatif-return" tabindex="-1"[^>]*>问卷里没有出入境记录/,
  );
  expect(controls(travelDraft())).toContain(
    'id="us-whatif-return" type="date"',
  );
  // The date hint is announced with the date (suggestion 4).
  expect(controls(travelDraft())).toContain(
    'aria-describedby="us-whatif-date-hint"',
  );
});

test('results show the approval stage and keep procedural notes out of the gaps (review96-1)', () => {
  const noCrime = {
    unclassifiedRecord: false,
    cimtCount: 0,
    convictionCount: 0,
    combinedSentenceMonths: 0,
    confinementDays: 0,
    controlledSubstance: 'none',
    duiCount: 0,
  } as const;
  // Every filing requirement is met; the English test was failed (#6).
  const failedEnglish: UsDraft = {
    ...naturalizationDraft,
    simulationDate: '2026-11-23',
    permanentResident: '2018-03-01',
    stateResidenceFrom: '2018-03-01',
    naturalization: {
      lawfulAdmission: 'cleared',
      removalProcess: 'none',
      residenceThroughOath: true,
      lprResidenceYears: 8,
      english: 'failed',
      civics: 'passed',
      disability: { requested: false },
      goodMoralCharacter: 'cleared',
      murderConviction: false,
      aggravatedFelonyConvictedOn: 'none',
      persecutionBar: false,
      statutoryPeriodCrime: noCrime,
      otherGmcBar: 'cleared',
      falseOralTestimony: false,
      benefitsAndSupport: 'clear',
      constitutionalAttachment: true,
      party: { membership: 'none' },
      selectiveService: 'registered',
      warDesertionOrAlienageExemption: 'cleared',
      oath: 'willing',
      titlesRenounced: true,
      truthfulApplication: true,
    },
    fees: { channel: 'paper', relief: 'none' },
  };
  const failed = pathwayOf(failedEnglish);
  expect(failed).toMatchObject({
    status: 'NOT_MET',
    approvalStatus: 'NOT_MET',
    earliestDate: '2026-11-23',
  });
  expect(failed.summary).toBe(
    '所填资料满足已评估的递交条件。' +
      t('us.result.approval').replace('{status}', t('country.status.NOT_MET')),
  );
  const failedHtml = render(
    <ResultView
      country={us}
      result={us.run(failedEnglish, 'zh-CN')}
      draft={failedEnglish}
    />,
  );
  expect(failedHtml).not.toContain(t('gap.met'));
  expect(failedHtml).toContain('?focus=english');
  // Fees and other procedural notes are not gaps (#6).
  const notes = travelDraft();
  delete notes.travel!.registration;
  delete notes.travel!.feeForm;
  const pathway = pathwayOf(notes);
  expect(pathway.status).toBe('FUTURE');
  const kind = (id: string) =>
    pathway.checks.find((check) => check.id === id)?.kind;
  expect(kind('US-C18-REGISTRATION')).toBe('information');
  expect(kind('US-TIME-TRAVEL')).toBe('requirement');
  for (const check of pathway.checks)
    if (/^US-C4[45]-/.test(check.id))
      expect(check.kind, check.id).toBe('information');
  expect(gapRules(pathway)).toEqual([]);
  // The return date is named as the planned return (#6).
  expect(pathway.summary).toContain(
    t('us.result.returnOn').replace('{date}', '2026-12-20'),
  );
  // Pending details use the country wording, not the UK one (#6).
  const pendingHtml = render(
    <ResultView
      country={us}
      result={us.run(naturalizationDraft, 'zh-CN')}
      draft={naturalizationDraft}
    />,
  );
  expect(pendingHtml).toContain(t('pilot.pending'));
  expect(pendingHtml).not.toContain(t('gap.pending'));
  expect(pendingHtml).not.toContain(t('result.pendingDetails'));
  // Chinese sentences are joined without a space (suggestion 4).
  for (const draft of [travelDraft(), naturalizationDraft, failedEnglish])
    expect(pathwayOf(draft).summary).not.toMatch(/。 /);
});
