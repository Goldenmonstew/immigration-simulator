import { renderToStaticMarkup } from 'react-dom/server';
import { expect, test } from 'vitest';
import CanadaPage from '../app/canada/page';
import CanadaPolicyPage from '../app/canada/policy/page';
import CanadaSimulatePage from '../app/canada/simulate/page';
import { GET as offlinePages } from '../app/offline-pages.json/route';
import Home from '../app/page';
import sitemap from '../app/sitemap';
import { ResultView } from '../components/result-view';
import { WhatIfView } from '../components/whatif-lab';
import { t, type TranslationKey } from '../i18n';
import { en } from '../i18n/en';
import { LocaleContext } from '../i18n/locale';
import { zhCN } from '../i18n/zh-CN';
import type { CanadaDraft } from '../lib/canada-draft';
import {
  canadaGoals,
  canadaSteps,
  type CanadaField,
} from '../lib/canada-fields';
import { canadaModule as ca } from '../lib/canada-module';
import { decodeDraft, encodeDraft } from '../lib/share';
import { sourceUrls } from '../lib/sources';
import { ukModule } from '../lib/uk-module';

const render = (node: React.ReactNode, locale: 'zh-CN' | 'en' = 'zh-CN') =>
  renderToStaticMarkup(
    <LocaleContext value={{ locale, setLocale: () => {} }}>
      {node}
    </LocaleContext>,
  );

// Became PR in 2020, then lived abroad from 2021 to mid-2025.
function residencyDraft(): CanadaDraft {
  return {
    ...ca.createDraft(),
    step: 2,
    completed: true,
    simulationDate: '2026-11-24',
    goals: ['CA-RESIDENCY'],
    answers: {
      permanentResident: '2020-01-10',
      trips: [{ departed: '2021-01-04', returned: '2025-06-01' }],
      residence: {
        prStatus: 'valid',
        prConditionsFulfilled: true,
        prDays: { credits: [], exclusions: [] },
        humanitarianRelief: 'none',
      },
    },
  };
}

const pathway = (draft: CanadaDraft, id: string) =>
  ca.run(draft, 'zh-CN').columns[0].pathways.find((item) => item.id === id)!;

test.each(['zh-CN', 'en'] as const)(
  'Canada home links to the questionnaire and sources in %s',
  (locale) => {
    const html = render(<CanadaPage />, locale);
    expect(html).toContain(t('ca.title', locale));
    expect(html).toContain('href="/canada/simulate"');
    expect(html).toContain('href="/canada/policy"');
    expect(render(<Home />, locale)).toContain(t('hub.ca.desc', locale));
  },
);

test('all five Canada pages are exported in the offline and sitemap lists', async () => {
  const offline = await offlinePages().json();
  const paths = sitemap().map(({ url }) => new URL(url).pathname);
  for (const path of [
    '/canada',
    '/canada/simulate',
    '/canada/result',
    '/canada/whatif',
    '/canada/policy',
  ]) {
    expect(offline).toContain(path);
    expect(paths).toContain(path);
  }
});

test('every question, option, section and step has Chinese and English text', () => {
  const keys = new Set<string>();
  const walk = (field: CanadaField) => {
    keys.add(`ca.field.${field.label}`);
    if (field.type === 'choice' || field.type === 'extension')
      for (const option of field.options)
        keys.add(`ca.option.${field.set}.${option}`);
    if (field.type === 'group' || field.type === 'list')
      field.fields.forEach(walk);
    if (field.type === 'routes') walk(field.field);
  };
  for (const step of canadaSteps) {
    keys.add(`ca.step.${step.title}`);
    for (const section of step.sections) {
      keys.add(`ca.section.${section.id}`);
      section.fields.forEach(walk);
    }
  }
  for (const goal of canadaGoals) keys.add(`ca.goal.${goal}`);
  for (const answer of ['filed', 'not-required', 'not-filed', 'uncertain'])
    keys.add(`ca.option.taxAnswer.${answer}`);
  for (const key of keys) {
    expect(zhCN[key as TranslationKey], key).toMatch(/\S/);
    expect(en[key as TranslationKey], key).toMatch(/\S/);
  }
});

test('every questionnaire step renders for all routes in English', () => {
  const draft: CanadaDraft = {
    ...ca.createDraft(),
    goals: canadaGoals,
    answers: {
      pnp: { stream: 'ontario-workforce', mode: 'enhanced' },
      family: { quebec: true },
    },
  };
  for (const { step, title } of canadaSteps) {
    const html = render(
      CanadaSimulatePage().props.children({
        draft: { ...draft, step },
        errors: {},
        update: () => {},
      }),
      'en',
    );
    for (const section of canadaSteps[step].sections)
      expect(html, title).toContain(t(`ca.section.${section.id}`, 'en'));
    expect(html).not.toMatch(/[㐀-鿿]/);
  }
});

test('step validation requires a route and dates, then checks rows, groups and numbers', () => {
  const fresh = ca.createDraft();
  expect(ca.validateStep({ ...fresh, simulationDate: '' })).toEqual({
    'ca-simulationDate': 'ca.error.date',
    'ca-goals': 'ca.error.goals',
  });
  expect(ca.validateStep(residencyDraft())).toEqual({});
  const draft = residencyDraft();
  expect(
    ca.validateStep({
      ...draft,
      step: 1,
      answers: {
        ...draft.answers,
        trips: [
          { departed: '2024-02-10', returned: '2024-01-10' },
          {} as never,
        ],
        residence: {
          ...draft.answers.residence,
          enforcement: { laterFoundCompliant: true } as never,
        },
      },
    }),
  ).toEqual({
    'ca-trips-0-returned': 'ca.error.order',
    'ca-trips-1-departed': 'ca.error.required',
    'ca-trips-1-returned': 'ca.error.required',
    'ca-residence-enforcement-decisionDate': 'ca.error.required',
  });
  expect(
    ca.validateStep({
      ...draft,
      step: 7,
      goals: ['CA-EE-CEC'],
      answers: {
        express: {
          round: { date: '2026-11-01', confirmedCrs: 480.5 },
          primary: { levels: { speaking: 13 } },
          workHistory: [
            {
              from: '2024-01-01',
              to: '2024-12-31',
              noc: '21231',
              teer: 1,
              dailyHours: [0, 8, 8, null, null, null, null] as never,
            },
          ],
        },
      },
    }),
  ).toEqual({
    'ca-express-round-confirmedCrs': 'ca.error.integer',
    'ca-express-primary-levels-speaking': 'ca.error.range',
    'ca-express-workHistory-0-dailyHours-3': 'ca.error.required',
  });
});

test('drafts round-trip in their envelope and reject malformed answers', () => {
  const draft: CanadaDraft = {
    ...residencyDraft(),
    goals: ['CA-RESIDENCY', 'CA-PNP'],
    answers: {
      ...residencyDraft().answers,
      federal: {
        applications: { 'CA-PNP': { filedOn: '2026-10-01', signed: true } },
        principal: { exam: { instructionExtension: { until: '2026-12-01' } } },
        members: [{ relationship: 'child', accompanying: false }],
      },
      pnp: {
        stream: 'ontario-workforce',
        mode: 'base',
        ontario: {
          recentGraduate: false,
          language: { date: '2026-01-01', scores: [7, 7, 8, 9] },
        },
      },
    },
  };
  const encoded = encodeDraft(ca, draft);
  expect(decodeDraft(ca, encoded)).toEqual(draft);
  expect(decodeDraft(ukModule, encoded)).toBeUndefined();
  expect(decodeDraft(ca, encodeDraft(ukModule, ukModule.createDraft()))).toBe(
    undefined,
  );
  // Unknown keys are dropped; typed answers are kept.
  expect(
    ca.decodeDraft({ ...draft, extra: 1, answers: { ...draft.answers, x: 1 } }),
  ).toEqual(draft);
  for (const bad of [
    null,
    { ...draft, version: 2 },
    { ...draft, step: 42 },
    { ...draft, goals: ['CA-MADE-UP'] },
    { ...draft, answers: { trips: 'none' } },
    { ...draft, answers: { residence: { prStatus: 'maybe' } } },
    { ...draft, answers: { residence: { prConditionsFulfilled: 'yes' } } },
    {
      ...draft,
      answers: { federal: { applications: { 'CA-RESIDENCY': {} } } },
    },
    // A finished draft must pass every step it shows.
    { ...draft, answers: { trips: [{ departed: '2024-01-01' }] } },
  ])
    expect(ca.decodeDraft(bad)).toBeUndefined();
});

// review95-1 #2: answers left on hidden steps, groups or routes stay local.
test('hidden routes and groups stay out of the engine, validation and share links', () => {
  const draft: CanadaDraft = {
    ...ca.createDraft(),
    step: 10,
    completed: true,
    simulationDate: '2026-11-24',
    goals: ['CA-FAMILY'],
    answers: {
      // Quebec was answered, a blank group row added, then Quebec turned off.
      family: { quebec: false, province: { sponsoredGroups: [{}] as never } },
      // Partial records left on steps for routes that are no longer chosen.
      trips: [{} as never],
      pnp: {
        stream: 'ontario-workforce',
        ontario: { language: { date: '2026-01-01' } as never },
      },
      express: { invitation: { revoked: true } as never },
      federal: {
        applications: {
          'CA-FAMILY': { signed: true },
          'CA-EE-FSW': { biometricPayers: 1.5 },
        },
      },
    },
  };
  expect(() => ca.run(draft, 'zh-CN')).not.toThrow();
  const active = {
    family: { quebec: false },
    federal: { applications: { 'CA-FAMILY': { signed: true } } },
  };
  expect(ca.activeAnswers?.(draft).answers).toEqual(active);
  // The device keeps the hidden answers so a route chosen again reopens them.
  expect(ca.decodeDraft(draft)).toEqual(draft);
  const shared = decodeDraft(ca, encodeDraft(ca, draft))!;
  expect(shared.answers).toEqual(active);
  expect(() => ca.run(shared, 'zh-CN')).not.toThrow();
  // A deselected route's application no longer blocks step 5.
  for (const step of [4, 5, 10])
    expect(ca.validateStep({ ...draft, step }), String(step)).toEqual({});
  expect(
    ca.validateStep({
      ...draft,
      step: 4,
      goals: ['CA-FAMILY', 'CA-EE-FSW'],
    }),
  ).toEqual({
    'ca-federal-applications-CA-EE-FSW-biometricPayers': 'ca.error.integer',
  });
});

test('the result lists only chosen routes, with a future date, a met case and a pending case', () => {
  const draft = residencyDraft();
  const result = ca.run(draft, 'zh-CN');
  expect(result.columns[0].pathways.map((item) => item.id)).toEqual([
    'CA-RESIDENCY',
  ]);
  const future = pathway(draft, 'CA-RESIDENCY');
  expect(future).toMatchObject({
    status: 'FUTURE',
    earliestDate: '2027-06-01',
  });
  // The time-only date is shown only when it differs from the outcome.
  expect(future.timeStatus).toBeUndefined();
  // Card and travel document steps are guidance, not missing requirements.
  expect(
    future.checks.map(({ id, status, kind }) => [id, status, kind]),
  ).toEqual([
    ['CA-R01', 'MET', 'requirement'],
    ['CA-R02', 'NOT_MET', 'information'],
    ['CA-R03', 'NOT_MET', 'requirement'],
    ['CA-R04', 'UNKNOWN', 'information'],
    ['CA-R05', 'UNKNOWN', 'information'],
  ]);

  expect(
    pathway({ ...draft, simulationDate: '2027-12-31' }, 'CA-RESIDENCY'),
  ).toMatchObject({ status: 'MET' });

  // Without the humanitarian answer, the shortfall cannot be settled.
  const { humanitarianRelief, ...residence } = draft.answers.residence!;
  expect(humanitarianRelief).toBe('none');
  const pending = pathway(
    { ...draft, answers: { ...draft.answers, residence } },
    'CA-RESIDENCY',
  );
  expect(pending.status).toBe('UNKNOWN');
  expect(pending).toMatchObject({
    timeStatus: 'FUTURE',
    timeEarliestDate: '2027-06-01',
  });
  expect(pending.earliestDate).toBeUndefined();
  expect(pending.pendingDetails).toContain('PD-240');

  expect(
    ca.run({ ...draft, answers: { citizenshipStatus: 'citizen' } }, 'en'),
  ).toMatchObject({
    columns: [],
    shortCircuit: { reason: 'CANADIAN_CITIZENSHIP_STATUS' },
  });
});

test('comparison controls change only the moved answers and move the date', () => {
  const draft = residencyDraft();
  const { whatif } = ca;
  const initial = whatif.initial(draft);
  expect(whatif.apply(draft, initial)).toEqual(draft);
  const trip = whatif.apply(draft, {
    ...initial,
    tripFrom: '2026-12-01',
    tripTo: '2027-03-01',
  });
  expect(trip.answers.trips).toEqual([
    ...draft.answers.trips!,
    { departed: '2026-12-01', returned: '2027-03-01' },
  ]);
  expect(draft.answers.trips).toHaveLength(1);
  expect(pathway(trip, 'CA-RESIDENCY').earliestDate).toBe('2027-08-29');

  const citizenship = { ...draft, goals: ['CA-CITIZENSHIP' as const] };
  const language = whatif.apply(citizenship, {
    ...whatif.initial(citizenship),
    citizenshipLevel: 4,
    citizenshipTest: 'passed',
  });
  expect(language.answers.residence).toMatchObject({
    language: { evidence: 'accepted-levels', speaking: 4, listening: 4 },
    test: { outcome: 'passed' },
  });
  const funds = whatif.apply(draft, { ...initial, eeFunds: 20000, income: 1 });
  expect(funds.answers.express?.funds?.availableAtApplication).toBe(20000);
  expect(funds.answers.family?.federalIncome?.eligibleNoaIncome).toBe(1);

  expect(
    whatif.validate(draft, {
      ...initial,
      simulationDate: '2026-02-30',
      tripFrom: '2027-01-02',
      tripTo: '2027-01-01',
      crs: -1,
    }),
  ).toEqual({
    date: 'ca.error.date',
    trip: 'ca.whatif.invalidDates',
    crs: 'ca.whatif.invalidNumber',
  });
  expect(whatif.focusForRule('CA-R03', 'CA-RESIDENCY')).toBe('date');
  expect(whatif.focusForRule('CA-R10', 'CA-CITIZENSHIP')).toBe(
    'citizenshipLevel',
  );
});

test.each(['zh-CN', 'en'] as const)(
  'results and the comparison render conditions, sources and the control link in %s',
  (locale) => {
    const draft = residencyDraft();
    const result = ca.run(draft, locale);
    const html = render(
      <ResultView country={ca} result={result} draft={draft} />,
      locale,
    );
    for (const check of result.columns[0].pathways[0].checks)
      expect(html).toContain(check.title);
    expect(html).toContain('2027-06-01');
    expect(html).toContain(`href="${sourceUrls['SRC-075']}"`);
    expect(html).toContain('href="/canada/whatif?focus=date"');
    expect(html).toContain('href="/canada/policy"');
    const lab = render(
      <WhatIfView country={ca} draft={draft} target={{ focus: 'date' }} />,
      locale,
    );
    expect(lab).toContain('id="ca-whatif-date"');
    expect(lab).toContain('id="ca-whatif-trip-from"');
    expect(lab).not.toContain('id="ca-whatif-citizenship-level"');
  },
);

test('the policy page lists Canadian routes, all conditions and only Canadian sources', () => {
  expect(t('ca.policy.pageTitle')).toBe('加拿大政策依据');
  expect(t('ca.policy.pageTitle', 'en')).toBe('Policy basis for Canada');
  const html = render(<CanadaPolicyPage />);
  expect(html.match(/data-pathway=/g)).toHaveLength(canadaGoals.length);
  expect(html.match(/data-rule=/g)).toHaveLength(80);
  for (let n = 1; n <= 80; n++)
    expect(html).toContain(`data-rule="CA-R${String(n).padStart(2, '0')}"`);
  const listed = [...html.matchAll(/data-source="([^"]+)"/g)].map((m) => m[1]);
  expect(listed).toEqual(Object.keys(ca.policy.sourceUrls));
  expect(listed).toContain('SRC-075');
  expect(listed).toContain('SRC-279');
  expect(listed).not.toContain('SRC-001');
  expect(listed).not.toContain('SRC-110');
  expect(html.match(/data-policy-change=/g)).toHaveLength(3);
  const english = render(<CanadaPolicyPage />, 'en');
  expect(english).toContain('Physical residency baseline');
  expect(english).toContain(t('ca.goal.CA-AIP', 'en'));
});
