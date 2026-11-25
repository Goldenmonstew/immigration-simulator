import { isValidElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { expect, test, vi } from 'vitest';
import type { CountryPathway } from '@uk-immigration/engine';
import CanadaPage from '../app/canada/page';
import CanadaPolicyPage from '../app/canada/policy/page';
import CanadaSimulatePage from '../app/canada/simulate/page';
import { GET as offlinePages } from '../app/offline-pages.json/route';
import Home from '../app/page';
import sitemap from '../app/sitemap';
import { ResultView } from '../components/result-view';
import { SiteShell } from '../components/site-shell';
import { WhatIfView } from '../components/whatif-lab';
import { t, type TranslationKey } from '../i18n';
import { en } from '../i18n/en';
import { LocaleContext } from '../i18n/locale';
import { zhCN } from '../i18n/zh-CN';
import { canadaRequest, type CanadaDraft } from '../lib/canada-draft';
import {
  canadaGoals,
  canadaSteps,
  type CanadaField,
} from '../lib/canada-fields';
import { canadaModule as ca } from '../lib/canada-module';
import { earliestLabelFor } from '../lib/country-module';
import { gapRules } from '../lib/gap-summary';
import { readPageResult } from '../lib/page-result';
import { decodeDraft, encodeDraft } from '../lib/share';
import { sourceUrls } from '../lib/sources';
import { draftStorage } from '../lib/storage';
import { ukModule } from '../lib/uk-module';

const render = (node: React.ReactNode, locale: 'zh-CN' | 'en' = 'zh-CN') =>
  renderToStaticMarkup(
    <LocaleContext value={{ locale, setLocale: () => {} }}>
      {node}
    </LocaleContext>,
  );

const navigation = vi.hoisted(() => ({ pathname: null as string | null }));
vi.mock('next/navigation', async (original) => ({
  ...(await original<typeof import('next/navigation')>()),
  usePathname: () => navigation.pathname,
}));

// Keep each rendered input's change handler so a test can type into it.
type Change = (event: { target: { value: string } }) => void;
const inputs = new Map<string, Change>();
vi.mock('../app/simulate/field', async (original) => {
  const { Field } = await original<typeof import('../app/simulate/field')>();
  return {
    Field: (props: Parameters<typeof Field>[0]) => {
      if (isValidElement<{ onChange: Change }>(props.children))
        inputs.set(props.id, props.children.props.onChange);
      return <Field {...props} />;
    },
  };
});

function form(
  draft: CanadaDraft,
  update: (patch: Partial<CanadaDraft>) => void = () => {},
  errors = ca.validateStep(draft),
) {
  inputs.clear();
  return render(CanadaSimulatePage().props.children({ draft, errors, update }));
}

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

// review95-1 #5: a required score set is one question with its own error.
test('a blank required score set is reported on its fieldset and cannot be bypassed', () => {
  const id = 'ca-pnp-ontario-language-scores';
  const draft: CanadaDraft = {
    ...ca.createDraft(),
    step: 6,
    simulationDate: '2026-11-24',
    goals: ['CA-PNP'],
    answers: {
      pnp: {
        stream: 'ontario-workforce',
        ontario: { language: { date: '2026-01-01' } as never },
      },
    },
  };
  expect(ca.validateStep(draft)).toEqual({ [id]: 'ca.error.required' });
  const html = form(draft);
  expect(html).toMatch(
    new RegExp(
      `<fieldset id="${id}" [^>]*tabindex="-1" aria-invalid="true" aria-describedby="${id}-error">`,
    ),
  );
  expect(html).toContain(`<p id="${id}-error"`);
  expect(html).toContain(t('ca.error.required'));

  // Four blank scores are no answer at all, in the form and in a share.
  const blank: CanadaDraft = {
    ...draft,
    answers: {
      pnp: {
        stream: 'ontario-workforce',
        ontario: {
          language: {
            date: '2026-01-01',
            scores: [null, null, null, null] as never,
          },
        },
      },
    },
  };
  expect(ca.validateStep(blank)).toEqual({ [id]: 'ca.error.required' });
  expect(ca.decodeDraft({ ...blank, completed: true })).toBeUndefined();
  expect(ca.decodeDraft(blank)?.answers.pnp?.ontario?.language).toEqual({
    date: '2026-01-01',
  });
  const job = {
    from: '2024-01-01',
    to: '2024-12-31',
    noc: '21231',
    teer: 1,
    dailyHours: Array(7).fill(null),
  };
  expect(
    ca.decodeDraft({
      ...draft,
      step: 7,
      goals: ['CA-EE-CEC'],
      answers: { express: { workHistory: [job] } },
    })?.answers.express?.workHistory,
  ).toEqual([{ from: '2024-01-01', to: '2024-12-31', noc: '21231', teer: 1 }]);
});

// review95-1 risk 2: periods and documents cannot end before they start.
test('periods and documents cannot end before they start, and values results stay within the test', () => {
  const draft: CanadaDraft = {
    ...ca.createDraft(),
    simulationDate: '2026-11-24',
    goals: ['CA-PNP', 'CA-QC-PSTQ', 'CA-AIP'],
    answers: {
      federal: {
        principal: {
          foreignStays: [
            {
              from: '2024-01-01',
              until: '2023-12-31',
              currentCountry: false,
              certificateIssued: '2024-02-01',
              certificateExpires: '2024-01-31',
            },
          ],
        },
      },
      pnp: { nominationIssued: '2026-06-01', nominationExpires: '2026-05-31' },
      quebec: {
        principalCsqIssued: '2026-06-01',
        principalCsqExpires: '2026-05-31',
        accompanyingCsqs: [
          { status: 'valid', issued: '2026-06-01', expires: '2026-05-31' },
        ],
        principalValues: {
          online: {
            completed: '2026-06-01',
            correctAnswers: 21,
            attempt: 'first',
          },
        },
      },
      atlantic: {
        endorsement: {
          province: 'NS',
          issued: '2026-06-01',
          expires: '2026-05-31',
        },
      },
    },
  };
  expect(ca.validateStep({ ...draft, step: 5 })).toEqual({
    'ca-federal-principal-foreignStays-0-until': 'ca.error.order',
    'ca-federal-principal-foreignStays-0-certificateExpires': 'ca.error.order',
  });
  expect(ca.validateStep({ ...draft, step: 6 })).toEqual({
    'ca-pnp-nominationExpires': 'ca.error.order',
  });
  expect(ca.validateStep({ ...draft, step: 8 })).toEqual({
    'ca-quebec-principalValues-online-correctAnswers': 'ca.error.range',
    'ca-quebec-principalCsqExpires': 'ca.error.order',
    'ca-quebec-accompanyingCsqs-0-expires': 'ca.error.order',
  });
  expect(ca.validateStep({ ...draft, step: 9 })).toEqual({
    'ca-atlantic-endorsement-expires': 'ca.error.order',
  });
  // The same day is allowed.
  const sameDay = structuredClone(draft);
  sameDay.answers.atlantic!.endorsement!.expires = '2026-06-01';
  expect(ca.validateStep({ ...sameDay, step: 9 })).toEqual({});
});

// review95-1 risk 5 and suggestion 3: typed text and the extension date.
test('typed codes drop surrounding spaces and an extension asks for its date', () => {
  const draft: CanadaDraft = {
    ...ca.createDraft(),
    step: 6,
    simulationDate: '2026-11-24',
    goals: ['CA-PNP'],
    answers: { pnp: { stream: 'ontario-workforce' } },
  };
  let patch: Partial<CanadaDraft> = {};
  form(draft, (next) => (patch = next));
  inputs.get('ca-pnp-ontario-offerNoc')!({ target: { value: ' 21231 ' } });
  expect(patch.answers?.pnp?.ontario?.offerNoc).toBe('21231');
  inputs.get('ca-pnp-ontario-offerNoc')!({ target: { value: '   ' } });
  expect(patch.answers?.pnp?.ontario).toBeUndefined();

  const extension = 'ca-federal-principal-exam-instructionExtension-until';
  const html = form({
    ...draft,
    step: 5,
    answers: {
      federal: {
        principal: { exam: { instructionExtension: { until: '' } } },
      },
    },
  });
  expect(html).toContain(`${t('ca.field.extensionUntil')} *</label>`);
  expect(html).toMatch(new RegExp(`id="${extension}"[^>]* required=""`));
});

// review95-1 #3 and suggestion 3: labels say what the engine counts.
test('Quebec sponsored groups include the new group and the other labels match the form', () => {
  expect(t('ca.field.sponsoredGroups')).toContain('本次新增');
  expect(t('ca.field.sponsoredGroups', 'en')).toContain('this new');
  expect(t('ca.option.applicationClass.family')).toBe('家庭类（Family Class）');
  expect(t('ca.option.applicationClass.family', 'en')).toBe('Family class');
  // Signing on any day but 1 January lists the signing year too.
  expect(t('ca.form.taxYearsHint')).toContain('签署当年');
  expect(t('ca.form.taxYearsHint', 'en')).toContain('signing year');
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

// review95-1 #1: the form asks for a percentage, the engine compares a fraction.
test.each([
  [1, 0.01, 'NOT_MET'],
  [33.33, 0.3333, 'NOT_MET'],
  [33.34, 0.3334, 'MET'],
  [100, 1, 'MET'],
] as const)(
  'an equity share of %s%% reaches the engine as %s',
  (percent, fraction, status) => {
    const draft: CanadaDraft = {
      ...ca.createDraft(),
      simulationDate: '2026-11-24',
      goals: ['CA-PNP'],
      answers: {
        pnp: {
          stream: 'other',
          nomination: 'valid',
          nominationIssued: '2026-06-01',
          nominationExpires: '2027-06-01',
          intendsNominatingProvince: true,
          investment: 'business',
          equityShare: percent,
          equityInvestment: 0,
          activeOngoingManagement: true,
          noRedemptionOption: true,
          capitalInActiveBusinessInNominatingProvince: true,
          investmentExceptionDocumented: true,
        },
        federal: { applications: { 'CA-PNP': { filedOn: '2026-10-01' } } },
      },
    };
    expect(canadaRequest(draft, 'zh-CN').pnp?.equityShare).toBeCloseTo(
      fraction,
      10,
    );
    // The draft and its share link keep the percentage the user entered.
    expect(
      decodeDraft(ca, encodeDraft(ca, draft))?.answers.pnp?.equityShare,
    ).toBe(percent);
    expect(
      pathway(draft, 'CA-PNP').checks.find(({ id }) => id === 'CA-R45')?.status,
    ).toBe(status);
  },
);

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
    ['CA-R03', 'NOT_MET', 'time'],
    ['CA-R04', 'UNKNOWN', 'information'],
    ['CA-R05', 'UNKNOWN', 'information'],
  ]);

  expect(
    pathway({ ...draft, simulationDate: '2027-12-31' }, 'CA-RESIDENCY'),
  ).toMatchObject({ status: 'MET' });

  // Without the humanitarian answer, the shortfall cannot be settled, and
  // relief could meet the obligation before the projected day (review95-2 #1).
  const { humanitarianRelief, ...residence } = draft.answers.residence!;
  expect(humanitarianRelief).toBe('none');
  const pending = pathway(
    { ...draft, answers: { ...draft.answers, residence } },
    'CA-RESIDENCY',
  );
  expect(pending.status).toBe('UNKNOWN');
  expect(pending.checks.find((check) => check.id === 'CA-R03')?.status).toBe(
    'UNKNOWN',
  );
  expect(pending.timeStatus).toBeUndefined();
  expect(pending.timeEarliestDate).toBeUndefined();
  expect(pending.earliestDate).toBeUndefined();
  expect(pending.pendingDetails).toContain('PD-240');

  expect(
    ca.run({ ...draft, answers: { citizenshipStatus: 'citizen' } }, 'en'),
  ).toMatchObject({
    columns: [],
    shortCircuit: { reason: 'CANADIAN_CITIZENSHIP_STATUS' },
  });
});

// review95-1 #4 and suggestion 2: a met, inapplicable or undated route has no
// time-only rows and no undetermined earliest date.
test('settled and undated routes show no time rows or undetermined date', () => {
  const met = { ...residencyDraft(), simulationDate: '2027-12-31' };
  const never: CanadaDraft = {
    ...residencyDraft(),
    answers: {
      ...residencyDraft().answers,
      residence: { ...residencyDraft().answers.residence, prStatus: 'never' },
    },
  };
  const family: CanadaDraft = {
    ...residencyDraft(),
    goals: ['CA-FAMILY'],
    answers: { residence: { prStatus: 'never' } },
  };
  for (const [draft, id, status] of [
    [met, 'CA-RESIDENCY', 'MET'],
    [never, 'CA-RESIDENCY', 'NOT_APPLICABLE'],
    [family, 'CA-FAMILY', 'UNKNOWN'],
  ] as const) {
    const assessment = pathway(draft, id);
    expect(assessment.status, id).toBe(status);
    expect(assessment.timeStatus).toBeUndefined();
    expect(assessment.timeEarliestDate).toBeUndefined();
    const html = render(
      <ResultView country={ca} result={ca.run(draft, 'zh-CN')} draft={draft} />,
    );
    // The rows, not the "time requirement" label on a check.
    for (const key of [
      'country.timeConditions',
      'country.timeDate',
      'ca.result.earliest',
      'result.earliest',
    ] as const)
      expect(html, `${id} ${key}`).not.toContain(`<dt>${t(key)}</dt>`);
    expect(html).not.toContain(t('ca.result.earliest'));
    const lab = render(<WhatIfView country={ca} draft={draft} />);
    expect(lab).toContain(t('whatif.unchanged'));
    expect(lab).not.toContain(t('ca.result.earliest'));
    expect(lab).not.toContain(t('result.earliest'));
    expect(lab).not.toContain(t('country.timeDate'));
  }
  // A projected date is still shown for a route that will be met.
  expect(
    render(
      <ResultView
        country={ca}
        result={ca.run(residencyDraft(), 'zh-CN')}
        draft={residencyDraft()}
      />,
    ),
  ).toContain(t('ca.result.earliest'));
});

// PR since mid-2023 with no trips; the citizenship day records are unanswered.
function citizenshipDraft(): CanadaDraft {
  return {
    ...ca.createDraft(),
    step: 2,
    completed: true,
    simulationDate: '2026-11-24',
    goals: ['CA-CITIZENSHIP'],
    answers: {
      dateOfBirth: '1990-01-01',
      permanentResident: '2023-06-01',
      trips: [],
      temporaryPeriods: [],
      residence: { prStatus: 'valid' },
    },
  };
}
const withResidence = (
  draft: CanadaDraft,
  residence: NonNullable<CanadaDraft['answers']['residence']>,
): CanadaDraft => ({
  ...draft,
  answers: {
    ...draft.answers,
    residence: { ...draft.answers.residence, ...residence },
  },
});
const timeCheck = (assessment: CountryPathway) =>
  assessment.checks.find((check) => check.kind === 'time')!;
const factRow = (key: TranslationKey, value: string) =>
  `<dt>${t(key)}</dt><dd>${value}</dd>`;

// review95-2 #1: the time row reports the checks labelled as time
// requirements (CA-R03, CA-R08), which count credited and excluded periods,
// so the row and those checks never disagree.
test('the time row follows the time requirement checks', () => {
  const html = (draft: CanadaDraft) =>
    render(
      <ResultView country={ca} result={ca.run(draft, 'zh-CN')} draft={draft} />,
    );
  // Unanswered credited and excluded periods leave the day count unknown.
  const { prDays, ...residence } = residencyDraft().answers.residence!;
  expect(prDays).toBeDefined();
  const residency = {
    ...residencyDraft(),
    answers: { ...residencyDraft().answers, residence },
  };
  for (const [draft, id, check] of [
    [citizenshipDraft(), 'CA-CITIZENSHIP', 'CA-R08'],
    [residency, 'CA-RESIDENCY', 'CA-R03'],
  ] as const) {
    const assessment = pathway(draft, id);
    expect(assessment.status, id).toBe('UNKNOWN');
    expect(timeCheck(assessment)).toMatchObject({
      id: check,
      status: 'UNKNOWN',
    });
    expect(assessment.timeStatus, id).toBeUndefined();
    expect(assessment.timeEarliestDate, id).toBeUndefined();
    expect(gapRules(assessment).map((rule) => rule.id)).toContain(check);
    for (const key of ['country.timeConditions', 'country.timeDate'] as const)
      expect(html(draft), `${id} ${key}`).not.toContain(`<dt>${t(key)}</dt>`);
  }

  // Confirmed with no records, CA-R08 is met and the row says so.
  const confirmed = withResidence(citizenshipDraft(), {
    citizenshipDays: { credits: [], exclusions: [] },
  });
  const met = pathway(confirmed, 'CA-CITIZENSHIP');
  expect(met.status).toBe('UNKNOWN');
  expect(timeCheck(met).status).toBe('MET');
  expect(met.timeStatus).toBe('MET');
  expect(html(confirmed)).toContain(
    factRow('country.timeConditions', t('country.status.MET')),
  );

  // Short of the days, CA-R08 projects when they are met.
  const short = {
    ...confirmed,
    answers: { ...confirmed.answers, permanentResident: '2024-06-01' },
  };
  const future = pathway(short, 'CA-CITIZENSHIP');
  expect(timeCheck(future).status).toBe('NOT_MET');
  expect(future).toMatchObject({
    status: 'UNKNOWN',
    timeStatus: 'FUTURE',
    timeEarliestDate: '2027-06-01',
  });
  expect(html(short)).toContain(
    factRow(
      'country.timeDate',
      '<time dateTime="2027-06-01">2027-06-01</time>',
    ),
  );
});

// review95-2 risk 2: an application already signed is checked on its
// signing day, so no earlier projected date is shown.
test('a citizenship application signed before the simulation date shows no past date', () => {
  const draft = withResidence(citizenshipDraft(), {
    citizenshipDays: { credits: [], exclusions: [] },
    signingDate: '2026-01-10',
  });
  const assessment = pathway(draft, 'CA-CITIZENSHIP');
  expect(assessment.status).toBe('NOT_MET');
  expect(timeCheck(assessment).status).toBe('NOT_MET');
  expect(assessment.timeStatus).toBeUndefined();
  expect(assessment.timeEarliestDate).toBeUndefined();
  const html = render(
    <ResultView country={ca} result={ca.run(draft, 'zh-CN')} draft={draft} />,
  );
  for (const key of ['country.timeConditions', 'country.timeDate'] as const)
    expect(html, key).not.toContain(`<dt>${t(key)}</dt>`);
  expect(html).not.toContain(
    t('country.status.FUTURE').replace('{date}', '2026-05-31'),
  );
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

// Citizenship, Express Entry and Quebec answers the comparison controls move.
function comparisonDraft(): CanadaDraft {
  const { answers } = residencyDraft();
  return {
    ...residencyDraft(),
    goals: ['CA-CITIZENSHIP', 'CA-EE-CEC', 'CA-QC-PSTQ'],
    answers: {
      ...answers,
      dateOfBirth: '1990-01-01',
      residence: {
        ...answers.residence,
        language: { evidence: 'accepted-levels', speaking: 5, listening: 6 },
        test: { outcome: 'passed', correct: 18 },
      },
      express: {
        round: { date: '2026-11-01', confirmedCrs: 480 },
        primary: {
          levels: { listening: 9, speaking: 9, reading: 9, writing: 9 },
        },
        funds: { availableAtApplication: 15000 },
      },
      quebec: {
        availableFunds: 5000,
        french: {
          evidence: 'approved-test',
          listening: 7,
          speaking: 7,
          reading: 7,
          writing: 7,
        },
      },
    },
  };
}

// review95-1 #6: every accepted comparison can be shared and reopened.
test('comparison controls accept only answers a share link can reopen', () => {
  const draft = comparisonDraft();
  expect(decodeDraft(ca, encodeDraft(ca, draft))).toBeDefined();
  const { whatif } = ca;
  const initial = whatif.initial(draft);
  expect(
    whatif.validate(draft, {
      ...initial,
      citizenshipLevel: 4.5,
      eeLanguage: 13,
      qcFrench: 13,
      crs: 500.5,
    }),
  ).toEqual({
    citizenshipLevel: 'ca.error.integer',
    eeLanguage: 'ca.error.range',
    qcFrench: 'ca.error.range',
    crs: 'ca.error.integer',
  });
  const knobs = {
    ...initial,
    simulationDate: '2027-03-01',
    tripFrom: '2026-12-01',
    tripTo: '2026-12-10',
    citizenshipLevel: 12,
    citizenshipTest: 'retry',
    eeLanguage: 12,
    qcFrench: 0,
    crs: 500,
    eeFunds: 1.5,
    qcFunds: 0,
  } as const;
  const after = whatif.apply(draft, knobs);
  expect(whatif.validate(after, knobs)).toEqual({});
  expect(decodeDraft(ca, encodeDraft(ca, after))).toEqual(
    ca.activeAnswers!(after),
  );
  const html = render(<WhatIfView country={ca} draft={draft} />);
  for (const id of ['citizenship-level', 'ee-language', 'qc-french'])
    expect(html).toMatch(new RegExp(`id="ca-whatif-${id}"[^>]* max="12"`));
});

test('comparison controls clear answers, drop the old test score and keep unknown travel unknown', () => {
  const draft = comparisonDraft();
  const { whatif } = ca;
  const initial = whatif.initial(draft);
  expect(whatif.apply(draft, initial)).toEqual(draft);
  expect(render(<WhatIfView country={ca} draft={draft} />)).toContain(
    t('whatif.unchanged'),
  );
  const r11 = (compared: CanadaDraft) =>
    pathway(compared, 'CA-CITIZENSHIP').checks.find(
      ({ id }) => id === 'CA-R11',
    )!.status;
  expect(r11(draft)).toBe('MET');
  for (const [outcome, status] of [
    ['finally-failed', 'NOT_MET'],
    ['not-taken', 'UNKNOWN'],
    [undefined, 'UNKNOWN'],
  ] as const) {
    const after = whatif.apply(draft, { ...initial, citizenshipTest: outcome });
    expect(after.answers.residence?.test).toEqual(outcome ? { outcome } : {});
    expect(r11(after), String(outcome)).toBe(status);
  }

  // Clearing a box clears the answer it controls.
  const cleared = whatif.apply(draft, {
    ...initial,
    citizenshipLevel: undefined,
    eeLanguage: undefined,
    crs: undefined,
    eeFunds: undefined,
    qcFunds: undefined,
    qcFrench: undefined,
  });
  expect(cleared.answers.residence?.language).toEqual({
    evidence: 'accepted-levels',
  });
  expect(cleared.answers.express).toEqual({
    round: { date: '2026-11-01' },
    primary: {},
    funds: {},
  });
  expect(cleared.answers.quebec).toEqual({
    french: { evidence: 'approved-test' },
  });
  expect(render(<WhatIfView country={ca} draft={cleared} />)).toContain(
    t('whatif.unchanged'),
  );

  // Without a travel record one added trip cannot stand for the whole history.
  const { trips, ...unknown } = residencyDraft().answers;
  expect(trips).toHaveLength(1);
  const noTrips = { ...residencyDraft(), answers: unknown };
  const added = whatif.apply(noTrips, {
    ...whatif.initial(noTrips),
    tripFrom: '2026-12-01',
    tripTo: '2026-12-10',
  });
  expect(added.answers.trips).toBeUndefined();
  expect(pathway(added, 'CA-RESIDENCY').status).toBe('UNKNOWN');
  const lab = render(
    <WhatIfView country={ca} draft={noTrips} target={{ focus: 'trip' }} />,
  );
  expect(lab).toMatch(/<p id="ca-whatif-trip-from" tabindex="-1"/);
  expect(lab).toContain(t('ca.whatif.tripNeedsRecord'));
});

test('condition links go only to controls that can change them', () => {
  const { whatif } = ca;
  // CA-R31 checks test and ECA validity, not the levels.
  expect(whatif.focusForRule('CA-R31', 'CA-EE-CEC')).toBeUndefined();
  expect(whatif.focusForRule('CA-R41', 'CA-EE-CEC')).toBe('eeLanguage');
  // Without a round, the CRS link lands on a note saying what to add first.
  const draft = comparisonDraft();
  const { round, ...express } = draft.answers.express!;
  expect(round).toBeDefined();
  const lab = render(
    <WhatIfView
      country={ca}
      draft={{ ...draft, answers: { ...draft.answers, express } }}
      target={{ focus: 'crs' }}
    />,
  );
  expect(lab).toMatch(/<p id="ca-whatif-crs" tabindex="-1"/);
  expect(lab).toContain(t('ca.whatif.crsNeedsRound'));
  expect(render(<WhatIfView country={ca} draft={draft} />)).toMatch(
    /<input id="ca-whatif-crs"/,
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

// review95-1 risk 1: pending details that need a later fee year, a PR older
// than the window or a 29 February date are listed on the policy page too.
test('policy conditions list pending details from later fee years and the time baselines', () => {
  const rules = ca.policy.rules[ca.policy.displayedRuleSets[0].id];
  const pending = (id: string) =>
    rules.find((rule) => rule.id === id)!.pendingDetails;
  for (const id of ['CA-R27', 'CA-R28', 'CA-R80'])
    expect(pending(id), id).toContain('PD-258');
  expect(pending('CA-R02')).toEqual(
    expect.arrayContaining(['PD-089', 'PD-091']),
  );
  expect(pending('CA-R08')).toEqual(
    expect.arrayContaining(['PD-090', 'PD-091']),
  );
});

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

// review95-1 risk 3: a scenario link opens without replacing the draft on
// this device, and result, edit and comparison links carry the scenario.
test('opening a Canadian share link keeps the local draft', () => {
  expect(ca.scenarioLinks).toBe(true);
  const storage = new Map<string, string>();
  vi.stubGlobal('localStorage', {
    getItem: (key: string) => storage.get(key) ?? null,
    setItem: (key: string, json: string) => storage.set(key, json),
  });
  const local: CanadaDraft = {
    ...ca.createDraft(),
    simulationDate: '2026-10-01',
    goals: ['CA-FAMILY'],
  };
  draftStorage(ca, local);
  const page = readPageResult(ca, 'zh-CN', encodeDraft(ca, residencyDraft()));
  expect(page.shared).toBe(true);
  expect(page.draft?.simulationDate).toBe('2026-11-24');
  expect(JSON.parse(storage.get('ca-immigration-draft-v1')!)).toEqual(local);
  expect(draftStorage(ca).draft).toEqual(local);
  vi.unstubAllGlobals();
});

test('skipping to the main content keeps the scenario fragment on Canadian scenario pages', () => {
  const shell = (pathname: string) => {
    navigation.pathname = pathname;
    return render(
      <SiteShell>
        <main id="main" />
      </SiteShell>,
    );
  };
  for (const page of ['simulate', 'result', 'whatif']) {
    const html = shell(`/canada/${page}`);
    expect(html, page).toMatch(/<button[^>]*>跳到主要内容<\/button>/);
    expect(html, page).not.toContain('href="#main"');
  }
  expect(shell('/canada/policy')).toContain('href="#main"');
  navigation.pathname = null;
});

// The residency obligation's date is when it is met, not a filing date.
// Citizenship checks every requirement on that signing day, so its date is
// the shared earliest application date (review95-2).
test.each(['zh-CN', 'en'] as const)(
  'the projected date is labelled as the date the requirements are met in %s',
  (locale) => {
    expect(t('ca.result.earliest', locale)).toMatch(/\S/);
    const citizenship = citizenshipDraft();
    expect(
      earliestLabelFor(
        pathway(citizenship, 'CA-CITIZENSHIP'),
        ca.earliestLabel,
      ),
    ).toBe('result.earliest');
    const filing = render(
      <ResultView
        country={ca}
        result={ca.run(citizenship, locale)}
        draft={citizenship}
      />,
      locale,
    );
    expect(filing).toContain(`<dt>${t('result.earliest', locale)}</dt>`);
    expect(filing).not.toContain(t('ca.result.earliest', locale));
    const draft = residencyDraft();
    const html = render(
      <ResultView country={ca} result={ca.run(draft, locale)} draft={draft} />,
      locale,
    );
    expect(html).toContain(
      `${t('ca.result.earliest', locale)}${locale === 'en' ? ': ' : '：'}2027-06-01`,
    );
    expect(html).not.toContain(t('result.earliest', locale));
    const lab = render(
      <WhatIfView country={ca} draft={draft} target={{ focus: 'date' }} />,
      locale,
    );
    expect(lab).toContain(t('ca.result.earliest', locale));
    expect(lab).not.toContain(t('result.earliest', locale));
  },
);

// Fees, the oath after approval and arranged employment (one of several bases)
// are listed apart from the requirements and time requirements that are gaps.
test('checks are grouped by kind and only requirements and time are gaps', () => {
  const draft: CanadaDraft = {
    ...ca.createDraft(),
    completed: true,
    simulationDate: '2026-11-24',
    goals: canadaGoals,
    answers: {
      pnp: { stream: 'ontario-workforce', mode: 'enhanced' },
      family: { quebec: true },
    },
  };
  const kinds = (next: CanadaDraft) =>
    new Map(
      ca
        .run(next, 'zh-CN')
        .columns[0].pathways.flatMap((item) =>
          item.checks.map((check) => [check.id, check.kind]),
        ),
    );
  const grouped = kinds(draft);
  expect(Object.fromEntries(grouped)).toMatchObject({
    'CA-R01': 'requirement',
    'CA-R02': 'information',
    'CA-R03': 'time',
    'CA-R04': 'information',
    'CA-R05': 'information',
    'CA-R08': 'time',
    'CA-R16': 'afterApproval',
    'CA-R17': 'requirement',
    'CA-R18': 'information',
    'CA-R27': 'budget',
    'CA-R28': 'budget',
    'CA-R37': 'alternative',
    'CA-R54': 'budget',
    'CA-R70': 'budget',
    'CA-R80': 'budget',
  });

  expect([...grouped.values()]).not.toContain(undefined);
  // With a grant date the oath and eligibility at grant decide the route.
  expect(
    kinds({
      ...draft,
      answers: { ...draft.answers, residence: { grantDate: '2027-01-01' } },
    }).get('CA-R16'),
  ).toBe('requirement');

  const fsw: CanadaDraft = { ...draft, goals: ['CA-EE-FSW'] };
  const route = pathway(fsw, 'CA-EE-FSW');
  const gaps = gapRules(route).map((check) => check.id);
  expect(gaps).toContain('CA-R20');
  expect(gaps).not.toContain('CA-R27');
  expect(gaps).not.toContain('CA-R37');
  const html = render(
    <ResultView country={ca} result={ca.run(fsw, 'zh-CN')} draft={fsw} />,
  );
  for (const key of [
    'country.check.budget',
    'country.check.alternative',
  ] as const)
    expect(html).toContain(t(key));
});

// Positional tables (by family size, years of work, adults and children)
// are shown with labelled rows and columns, never as bare number lists.
test.each(['zh-CN', 'en'] as const)(
  'policy parameters show positional tables by meaning in %s',
  (locale) => {
    const policy = ca.policy;
    const label = (key: string) => t(key as TranslationKey, locale);
    const shown = (name: string) =>
      policy.displayParameter?.(name, locale) ??
      policy.parameters[policy.displayedRuleSets[0].id].values[name].value;
    const size = label('ca.policy.familySize');
    const amount = label('ca.policy.amount');
    expect(shown('familyIncomeTable')).toEqual(
      [30526, 38002, 46720, 56724, 64336, 72560, 80784].map((value, i) => ({
        [size]: i + 1,
        [amount]: value,
      })),
    );
    expect(shown('eeFunds')).toMatchObject({
      amounts: expect.arrayContaining([{ [size]: 1, [amount]: 15263 }]),
      additional: 4112,
    });
    expect(shown('atlanticFunds')).toMatchObject({
      amounts: expect.arrayContaining([{ [size]: 7, [amount]: 10098 }]),
    });
    const years = label('ca.policy.workYears');
    const points = label('ca.policy.points');
    expect(shown('fswSelection')).toMatchObject({
      pass: 67,
      work: [
        { [years]: '0', [points]: 0 },
        { [years]: '1', [points]: 9 },
        { [years]: '2', [points]: 11 },
        { [years]: '3', [points]: 11 },
        { [years]: '4', [points]: 13 },
        { [years]: '5', [points]: 13 },
        { [years]: '6+', [points]: 15 },
      ],
    });
    const children = (n: number) =>
      label('ca.policy.children').replace('{n}', String(n));
    const quebec = shown('familyQuebecIncome') as Record<string, unknown>;
    expect(quebec.own).toEqual(
      [29642, 40015, 49401, 56819, 63237].map((value, i) => ({
        [size]: i + 1,
        [amount]: value,
      })),
    );
    expect(quebec.groups).toEqual([
      {
        [label('ca.field.adults')]: 0,
        [children(0)]: 0,
        [children(1)]: 10261,
        [children(2)]: 16262,
        [label('ca.policy.extraChild')]: 5422,
      },
      {
        [label('ca.field.adults')]: 1,
        [children(0)]: 21682,
        [children(1)]: 29131,
        [children(2)]: 32895,
        [label('ca.policy.extraChild')]: 3760,
      },
      {
        [label('ca.field.adults')]: 2,
        [children(0)]: 31796,
        [children(1)]: 35617,
        [children(2)]: 38450,
        [label('ca.policy.extraChild')]: 2823,
      },
    ]);
    expect(quebec).not.toHaveProperty('extraChild');
    const minors = label('ca.policy.minorChildren');
    expect(shown('quebecSelection2026')).toMatchObject({
      single: [3957, 5318, 6002, 6687].map((value, i) => ({
        [minors]: i,
        [amount]: value,
      })),
      couple: [5803, 6500, 7016, 7531].map((value, i) => ({
        [minors]: i,
        [amount]: value,
      })),
    });
    expect(
      (shown('familyQcIntakeSchedule') as Record<string, string>[])[0],
    ).toEqual({
      [label('ca.policy.intakeOpens')]: '2026-07-02',
      [label('ca.policy.lettersThrough')]: '2024-07-31',
    });

    // No numeric or nested list is left without labels.
    const bare = (value: unknown): boolean =>
      Array.isArray(value)
        ? value.some(
            (item) =>
              typeof item === 'number' || Array.isArray(item) || bare(item),
          )
        : typeof value === 'object' && value !== null
          ? Object.values(value).some(bare)
          : false;
    for (const name of Object.keys(
      policy.parameters[policy.displayedRuleSets[0].id].values,
    ))
      expect(bare(shown(name)), name).toBe(false);

    const html = render(<CanadaPolicyPage />, locale);
    for (const header of [size, amount, years, points, minors])
      expect(html).toContain(`<th scope="col">${header}</th>`);
    expect(html).not.toContain('lettersThrough');
    // Calendar years keep their digits; amounts are grouped.
    expect(html).toContain('referenceYear 2026');
    expect(html).toContain(`fiveYearCost ${(144390).toLocaleString(locale)}`);
  },
);
