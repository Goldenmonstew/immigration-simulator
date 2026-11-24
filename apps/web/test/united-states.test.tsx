import { renderToStaticMarkup } from 'react-dom/server';
import { expect, test } from 'vitest';
import UnitedStatesPage from '../app/united-states/page';
import UnitedStatesPolicyPage from '../app/united-states/policy/page';
import { GET as offlinePages } from '../app/offline-pages.json/route';
import sitemap from '../app/sitemap';
import Home from '../app/page';
import { ResultView } from '../components/result-view';
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

test('the pathway, the green card date and the petition status are required', () => {
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
  expect(us.validateStep({ ...family, step: 10 })).toEqual({
    'us-admission-petitionStatus': 'us.error.required',
  });
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
  ).toEqual({ date: 'us.whatif.invalid' });
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
  // Moving the assessment date into the window meets the filing timing.
  const knobs = us.whatif.initial(draft);
  const later = us.whatif.apply(draft, {
    ...knobs,
    simulationDate: '2027-03-10',
  });
  expect(pathwayOf(later)).toMatchObject({
    status: 'MET',
    earliestDate: '2027-03-10',
  });
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
  expect(ids).toHaveLength(104);
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
