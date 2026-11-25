import { renderToStaticMarkup } from 'react-dom/server';
import { afterEach, expect, test, vi } from 'vitest';
import GreecePage from '../app/greece/page';
import GreecePolicyPage from '../app/greece/policy/page';
import GreeceSimulatePage from '../app/greece/simulate/page';
import { GreeceWhatIfControls } from '../app/greece/whatif/controls';
import Home from '../app/page';
import { GET as offlinePages } from '../app/offline-pages.json/route';
import sitemap from '../app/sitemap';
import { ResultView } from '../components/result-view';
import { WhatIfView } from '../components/whatif-lab';
import { t, type TranslationKey } from '../i18n';
import { LocaleContext } from '../i18n/locale';
import {
  activeGreeceAnswers,
  createGreeceDraft,
  decodeGreeceDraft,
  greeceRequest,
  greeceSteps,
  type GreeceDraft,
} from '../lib/greece-draft';
import {
  basicFields,
  commonSections,
  euFamilySections,
  familyTcnSections,
  goldenVisaSections,
  greekFamilySections,
  historyFields,
  nationalitySections,
  routeField,
  settlementFields,
  tripList,
  workSections,
  type GreeceField,
} from '../lib/greece-fields';
import { greeceModule as gr } from '../lib/greece-module';
import { japanModule } from '../lib/japan-module';
import { decodeDraft, encodeDraft } from '../lib/share';
import { draftStorage, readScenarios, saveScenario } from '../lib/storage';

afterEach(() => {
  vi.unstubAllGlobals();
});

const render = (node: React.ReactNode, locale: 'zh-CN' | 'en' = 'zh-CN') =>
  renderToStaticMarkup(
    <LocaleContext value={{ locale, setLocale: () => {} }}>
      {node}
    </LocaleContext>,
  );

// The same answers are entered by the e2e walk-through (apps/e2e/tests/greece.spec.ts).
function longTermDraft(from = '2022-06-01'): GreeceDraft {
  return {
    ...createGreeceDraft(),
    step: 3,
    completed: true,
    simulationDate: '2026-11-23',
    birthDate: '1985-04-07',
    citizenship: 'third-country',
    pathways: ['GR-LONG-TERM'],
    permits: [{ kind: 'regular', from }],
    trips: [],
    entry: 'permit',
    passport: {
      kind: 'recognised',
      issuedOn: '2023-08-13',
      expiresOn: '2033-08-12',
      blankPages: 2,
      expectedDeparture: '2033-05-12',
    },
    publicOrder: 'clear',
    filingDocuments: { formReady: true, feeReceiptReady: true },
    biometrics: 'awaiting-appointment',
    changes: [],
    insurance: { kind: 'public', coversFamily: true },
    longTerm: {
      stage: 'initial',
      category: 'ordinary',
      passportHistory: 'complete',
    },
    integration: { basis: 'language', greekLevel: 'B1' },
    residenceIncome: {
      netEur: 12880,
      dependants: 0,
      regularAndDocumented: true,
    },
  };
}

const longTerm = (draft: GreeceDraft, locale: 'zh-CN' | 'en' = 'zh-CN') =>
  gr.run(draft, locale).columns[0].pathways[0];

test.each(['zh-CN', 'en'] as const)(
  'the Greece home links to the questionnaire and policy page in %s',
  (locale) => {
    const html = render(<GreecePage />, locale);
    expect(html).toContain(t('gr.title', locale));
    expect(html).toContain('href="/greece/simulate"');
    expect(html).toContain('href="/greece/policy"');
    expect(render(<Home />, locale)).toContain(t('hub.gr.desc', locale));
  },
);

test('all five Greece pages are in the offline list and the sitemap', async () => {
  const offline = await offlinePages().json();
  const paths = sitemap().map(({ url }) => new URL(url).pathname);
  for (const path of ['', '/simulate', '/result', '/whatif', '/policy']) {
    expect(offline).toContain('/greece' + path);
    expect(paths).toContain('/greece' + path);
  }
});

test('every question, option and hint has Chinese and English text', () => {
  const all: GreeceField[] = [
    ...basicFields,
    ...Object.values(historyFields).flat(),
    tripList(true),
    ...Object.values(commonSections(true, true)).flat(),
    ...Object.values(settlementFields),
    routeField,
    ...[
      nationalitySections,
      goldenVisaSections,
      greekFamilySections,
      euFamilySections,
      workSections,
      familyTcnSections,
    ].flatMap((sections) => Object.values(sections).flat()),
  ];
  const keys = new Set<string>();
  const walk = (fields: GreeceField[]) => {
    for (const field of fields) {
      keys.add(`gr.field.${field.label}`);
      if (field.hint) keys.add(`gr.hint.${field.hint}`);
      if (field.type === 'group' || field.type === 'list') walk(field.fields);
      if (field.type === 'choice' || field.type === 'choice-set')
        for (const option of field.options)
          keys.add(
            `gr.option.${(field.type === 'choice' && field.labels?.[option]) || option}`,
          );
      if (field.type === 'boolean')
        for (const option of field.extra ?? []) keys.add(`gr.option.${option}`);
      if (field.type === 'date-or') keys.add(`gr.option.${field.alternative}`);
    }
  };
  walk(all);
  expect(keys.size).toBeGreaterThan(500);
  for (const key of keys) {
    expect(t(key as TranslationKey), key).toMatch(/\S/);
    expect(t(key as TranslationKey, 'en'), key).toMatch(/\S/);
  }
});

test('drafts round-trip through storage, saved scenarios and the share envelope', () => {
  const storage = new Map<string, string>();
  vi.stubGlobal('localStorage', {
    getItem: (key: string) => storage.get(key) ?? null,
    setItem: (key: string, json: string) => storage.set(key, json),
  });
  const draft = longTermDraft();
  draftStorage(gr, draft);
  saveScenario(gr, '希腊长期居留', draft);
  expect(JSON.parse(storage.get('gr-immigration-draft-v1')!)).toEqual(draft);
  expect(readScenarios(gr).scenarios[0].draft).toEqual(draft);

  const encoded = encodeDraft(gr, draft);
  expect(decodeDraft(gr, encoded)).toEqual(draft);
  // A Greek link is not read as a Japanese one, and vice versa.
  expect(decodeDraft(japanModule, encoded)).toBeUndefined();
  expect(
    decodeDraft(gr, encodeDraft(japanModule, japanModule.createDraft())),
  ).toBeUndefined();
});

test('decoding rejects malformed drafts and reopens incomplete result links', () => {
  expect(decodeGreeceDraft({ ...longTermDraft(), version: 2 })).toBeUndefined();
  expect(
    decodeGreeceDraft({ ...longTermDraft(), pathways: 'GR-LONG-TERM' }),
  ).toBeUndefined();
  expect(
    decodeGreeceDraft({ ...longTermDraft(), permits: {} }),
  ).toBeUndefined();
  // A step hidden by the selected routes cannot be the current step.
  expect(decodeGreeceDraft({ ...longTermDraft(), step: 5 })).toBeUndefined();
  const missing = {
    ...longTermDraft(),
    passport: { issuedOn: '2023-08-13' },
  };
  expect(decodeGreeceDraft(missing)).toBeUndefined();
  expect(decodeGreeceDraft(missing, 'show-correction')).toMatchObject({
    completed: false,
    step: 2,
  });
  // An unfinished draft is kept as it is; its steps are checked as the user continues.
  const inProgress = { ...missing, completed: false, step: 1 };
  expect(decodeGreeceDraft(inProgress)).toEqual(inProgress);
});

test('each step validates its answers with Chinese and English messages', () => {
  const blank = { ...createGreeceDraft(), simulationDate: '' };
  expect(gr.validateStep(blank)).toEqual({
    'gr-simulationDate': 'gr.error.required',
    'gr-pathways': 'gr.error.pathways',
  });
  expect(
    gr.validateStep({
      ...longTermDraft(),
      step: 0,
      birthDate: '2027-01-01',
    }),
  ).toEqual({ 'gr-birthDate': 'gr.error.birthAfterSimulation' });
  const history = {
    ...longTermDraft(),
    step: 1,
    permits: [
      { kind: 'regular' as const, from: '2022-06-01', to: '2021-01-01' },
    ],
    trips: [{ departed: '2024-03-01', returned: '' }],
  };
  expect(gr.validateStep(history)).toEqual({
    'gr-permits-0-to': 'gr.error.order',
    'gr-trips-0-returned': 'gr.error.required',
    'gr-tripsComplete': 'gr.error.tripsComplete',
  });
  expect(
    gr.validateStep({
      ...longTermDraft(),
      step: 2,
      passport: { issuedOn: '2023-08-13' } as GreeceDraft['passport'],
      changes: [
        {
          kind: 'ordinary',
          occurredOn: '2025-02-01',
          reportedOn: '2025-01-01',
        },
      ],
      character: { finalSentenceMonths: -1 },
    }),
  ).toEqual({
    'gr-passport-kind': 'gr.error.required',
    'gr-changes-0-reportedOn': 'gr.error.order',
    'gr-character-finalSentenceMonths': 'gr.error.number',
  });
  expect(
    gr.validateStep({
      ...longTermDraft(),
      step: 3,
      residenceIncome: { dependants: 1.5 },
    }),
  ).toEqual({ 'gr-residenceIncome-dependants': 'gr.error.integer' });
  expect(gr.validateStep(longTermDraft())).toEqual({});
  for (const key of [
    'gr.error.required',
    'gr.error.tripsComplete',
    'gr.error.order',
  ] as const)
    expect(t(key, 'en')).not.toBe(t(key));
});

test('steps follow the selected routes', () => {
  const titles = (pathways: GreeceDraft['pathways']) =>
    greeceSteps({ ...createGreeceDraft(), pathways }).map(({ step }) => step);
  expect(titles([])).toEqual([0, 1, 2]);
  expect(titles(['GR-LONG-TERM'])).toEqual([0, 1, 2, 3]);
  expect(titles(['GR-NATIONALITY', 'GR-WORK'])).toEqual([0, 1, 2, 4, 7]);
  expect(
    titles([
      'GR-GOLDEN-VISA',
      'GR-GREEK-FAMILY-PR',
      'GR-EU-FAMILY-PR',
      'GR-FAMILY-TCN',
    ]),
  ).toEqual([0, 1, 2, 5, 6, 7]);
});

test('the request keeps answers for selected routes and keys income by tax year', () => {
  const request = greeceRequest({
    ...longTermDraft(),
    pathways: ['GR-NATIONALITY'],
    route: 'general',
    trips: [
      {
        departed: '2025-01-01',
        returned: '2025-01-10',
        familyAbsenceReason: 'ordinary',
      },
    ],
    tripsComplete: true,
    goldenVisa: { stage: 'initial' },
    nationality: {
      stage: 'application',
      incomeYears: [
        { year: 2024, taxableEur: 15000, dependants: 1 },
        { year: 2025, taxableEur: 16000, dependants: 1, welfareEur: 200 },
      ],
    },
  });
  expect(request.longTerm).toBeUndefined();
  expect(request.integration).toBeUndefined();
  expect(request.goldenVisa).toBeUndefined();
  expect(request.trips).toEqual([
    { departed: '2025-01-01', returned: '2025-01-10' },
  ]);
  expect(request.nationality).toEqual({
    stage: 'application',
    incomeByTaxYear: {
      2024: { taxableEur: 15000, dependants: 1 },
      2025: { taxableEur: 16000, dependants: 1, welfareEur: 200 },
    },
  });
  expect(request).not.toHaveProperty('tripsComplete');
  expect(request).not.toHaveProperty('step');
  expect(activeGreeceAnswers(longTermDraft()).longTerm).toBeDefined();
});

test('run returns met, future and to-be-confirmed routes without repeating condition titles', () => {
  const met = longTerm(longTermDraft('2018-01-01'));
  expect(met.status).toBe('MET');
  expect(met.earliestDate).toBe('2026-11-23');

  const future = longTerm(longTermDraft());
  expect(future.status).toBe('FUTURE');
  expect(future.earliestDate).toBe('2027-06-01');
  const residence = future.checks.find((c) => c.id === 'LT-TIME-RESIDENCE')!;
  expect(residence.status).toBe('NOT_MET');
  expect(residence.explanation).toBe('最早日期为 2027-06-01。');

  const unknown = longTerm({ ...longTermDraft(), insurance: undefined });
  expect(unknown.status).toBe('UNKNOWN');
  expect(unknown.checks.find((c) => c.id === 'C-05')?.status).toBe('UNKNOWN');

  for (const locale of ['zh-CN', 'en'] as const) {
    const result = gr.run({ ...longTermDraft(), longTerm: {} }, locale);
    expect(result.columns[0].title).toBe(t('gr.policy.title', locale));
    for (const check of result.columns[0].pathways[0].checks) {
      expect(check.explanation, check.id).not.toBe(check.title);
      expect(check.explanation, check.id).not.toContain(`“${check.title}”`);
      expect(check.explanation, check.id).not.toContain(
        `assess ${check.title}`,
      );
    }
  }
  expect(
    longTerm(
      { ...longTermDraft('2018-01-01'), longTerm: {} },
      'en',
    ).checks.find((c) => c.id === 'LT-STAGE')?.explanation,
  ).toBe(t('gr.result.moreInformation', 'en'));
});

test('a trip list is used only once it is confirmed complete', () => {
  const trips = [{ departed: '2025-01-01', returned: '2025-09-01' }];
  const unconfirmed = longTerm({ ...longTermDraft('2018-01-01'), trips });
  expect(unconfirmed.status).toBe('UNKNOWN');
  expect(
    unconfirmed.checks.find((c) => c.id === 'GR-LONG-TERM-TIME')?.status,
  ).toBe('UNKNOWN');
  const confirmed = longTerm({
    ...longTermDraft('2018-01-01'),
    trips,
    tripsComplete: true,
  });
  expect(confirmed.status).toBe('FUTURE');
  expect(confirmed.earliestDate).toBe('2030-09-01');
});

test('what-if knobs change a copy of the draft and point conditions at controls', () => {
  const draft = longTermDraft();
  const knobs = gr.whatif.initial(draft);
  expect(knobs).toEqual({
    simulationDate: '2026-11-23',
    noTrips: false,
    greekLevel: 'B1',
    examPassed: undefined,
    netEur: 12880,
    grossAnnualEur: undefined,
    grossPayEur: undefined,
    sponsorPersonalNetEur: undefined,
    sponsorEvidence: undefined,
    qualifyingValueEur: undefined,
    answered: { language: false, exam: false, yearCounts: false },
  });
  expect(gr.whatif.apply(draft, knobs)).toEqual(draft);

  const later = gr.whatif.apply(draft, {
    ...knobs,
    simulationDate: '2027-07-01',
  });
  expect(draft.simulationDate).toBe('2026-11-23');
  expect(longTerm(later).status).toBe('MET');
  expect(longTerm(later).earliestDate).toBe('2027-07-01');

  const a2 = gr.whatif.apply(draft, { ...knobs, greekLevel: 'A2' });
  expect(a2.integration).toEqual({ basis: 'language', greekLevel: 'A2' });
  expect(longTerm(a2).checks.find((c) => c.id === 'LT-04')?.status).toBe(
    'NOT_MET',
  );
  expect(
    gr.whatif.apply(draft, { ...knobs, netEur: 5000 }).residenceIncome?.netEur,
  ).toBe(5000);

  const travelled = {
    ...longTermDraft('2018-01-01'),
    trips: [{ departed: '2025-01-01', returned: '2025-09-01' }],
    tripsComplete: true,
  };
  const stayed = gr.whatif.apply(travelled, {
    ...gr.whatif.initial(travelled),
    noTrips: true,
  });
  expect(stayed.trips).toEqual([]);
  expect(longTerm(stayed).status).toBe('MET');

  const nat = gr.whatif.apply(
    {
      ...draft,
      pathways: ['GR-NATIONALITY'],
      nationality: { exam: 'written' },
    },
    { ...knobs, examPassed: true },
  );
  expect(nat.nationality).toMatchObject({
    exam: 'certificate',
    knowledgeDocumentReady: true,
  });
  expect(gr.whatif.validate(draft, { ...knobs, simulationDate: '' })).toEqual({
    date: 'gr.whatif.invalidDate',
  });
  expect(
    gr.whatif.validate(draft, { ...knobs, qualifyingValueEur: -1 }),
  ).toEqual({ qualifyingValueEur: 'gr.whatif.invalidAmount' });

  expect(gr.whatif.focusForRule('LT-TIME-RESIDENCE', 'GR-LONG-TERM')).toBe(
    'date',
  );
  expect(gr.whatif.focusForRule('GR-NATIONALITY-TIME', 'GR-NATIONALITY')).toBe(
    'date',
  );
  expect(gr.whatif.focusForRule('LT-TIME-TOTAL-ABSENCE', 'GR-LONG-TERM')).toBe(
    'trips',
  );
  expect(gr.whatif.focusForRule('LT-04', 'GR-LONG-TERM')).toBe('language');
  expect(gr.whatif.focusForRule('NAT-05', 'GR-NATIONALITY')).toBe('exam');
  expect(gr.whatif.focusForRule('WK-04', 'GR-WORK')).toBe('pay');
  expect(gr.whatif.focusForRule('GV-01', 'GR-GOLDEN-VISA')).toBe('investment');
  expect(gr.whatif.focusForRule('C-03', 'GR-WORK')).toBeUndefined();
});

test('the result and comparison views show the dates used by the e2e walk-through', () => {
  const draft = longTermDraft();
  const resultHtml = render(
    <ResultView country={gr} result={gr.run(draft, 'zh-CN')} draft={draft} />,
  );
  expect(resultHtml).toContain(t('gr.pathway.GR-LONG-TERM'));
  expect(resultHtml).toContain(
    t('country.status.FUTURE').replace('{date}', '2027-06-01'),
  );
  expect(resultHtml).toContain('dateTime="2027-06-01"');
  expect(resultHtml).toContain('focus=date');

  const knobs = { ...gr.whatif.initial(draft), simulationDate: '2027-07-01' };
  const whatIfHtml = render(
    <WhatIfView
      country={{ ...gr, whatif: { ...gr.whatif, initial: () => knobs } }}
      draft={draft}
    />,
  );
  expect(whatIfHtml).toContain('id="gr-whatif-date"');
  expect(whatIfHtml).toContain(
    '2027-06-01</span><span aria-hidden="true">→</span><span>2027-07-01',
  );
});

test('the questionnaire renders the ids used by the e2e walk-through', () => {
  const step = (draft: GreeceDraft, errors = {}) =>
    render(
      GreeceSimulatePage().props.children({
        draft,
        errors,
        update: () => {},
      }),
    );
  const draft = longTermDraft();
  const ids = (html: string) =>
    new Set([...html.matchAll(/ id="([^"]+)"/g)].map((match) => match[1]));
  const step0 = ids(step({ ...draft, step: 0 }));
  for (const id of [
    'gr-simulationDate',
    'gr-birthDate',
    'gr-citizenship',
    'gr-pathways',
    'gr-pathway-GR-LONG-TERM',
  ])
    expect(step0, id).toContain(id);
  const step1 = ids(
    step({
      ...draft,
      step: 1,
      trips: [{ departed: '2025-01-01', returned: '2025-01-10' }],
    }),
  );
  for (const id of [
    'gr-permits',
    'gr-permits-0-kind',
    'gr-permits-0-from',
    'gr-trips',
    'gr-trips-0-departed',
    'gr-tripsComplete',
    'gr-backlogRenewals',
  ])
    expect(step1, id).toContain(id);
  const step2 = ids(step({ ...draft, step: 2 }));
  for (const id of [
    'gr-entry',
    'gr-passport-kind',
    'gr-passport-issuedOn',
    'gr-passport-expiresOn',
    'gr-passport-blankPages',
    'gr-passport-expectedDeparture',
    'gr-publicOrder',
    'gr-filingDocuments-formReady',
    'gr-filingDocuments-feeReceiptReady',
    'gr-biometrics',
    'gr-changes',
    'gr-insurance-kind',
    'gr-insurance-coversFamily',
  ])
    expect(step2, id).toContain(id);
  const step3 = ids(step(draft));
  for (const id of [
    'gr-longTerm-stage',
    'gr-longTerm-category',
    'gr-longTerm-passportHistory',
    'gr-integration-basis',
    'gr-integration-greekLevel',
    'gr-residenceIncome-netEur',
    'gr-residenceIncome-dependants',
    'gr-residenceIncome-regularAndDocumented',
  ])
    expect(step3, id).toContain(id);
  expect(step3).not.toContain('id="gr-tenYear-stage"');

  // Every route step renders without errors in English as well.
  const all: GreeceDraft = {
    ...createGreeceDraft(),
    pathways: [
      'GR-LONG-TERM',
      'GR-GOLDEN-VISA',
      'GR-NATIONALITY',
      'GR-TEN-YEAR',
      'GR-GREEK-FAMILY-PR',
      'GR-EU-FAMILY-PR',
      'GR-WORK',
      'GR-FAMILY-TCN',
    ],
    greekFamily: { residenceFrom: '2021-03-15' },
  };
  for (const { step: number, title } of greeceSteps(all)) {
    const html = renderToStaticMarkup(
      <LocaleContext value={{ locale: 'en', setLocale: () => {} }}>
        {GreeceSimulatePage().props.children({
          draft: { ...all, step: number },
          errors: {},
          update: () => {},
        })}
      </LocaleContext>,
    );
    expect(html.length, title).toBeGreaterThan(500);
    expect(html, title).not.toMatch(/gr\.(field|option|hint|section)\./);
    if (number === 6) expect(html).toContain('(2021-03-15)');
  }
});

test('the policy page lists Greek routes, conditions, parameters and only Greek sources', () => {
  const { policy } = gr;
  const id = policy.displayedRuleSets[0].id;
  const ruleIds = policy.rules[id].map((rule) => rule.id);
  for (const ruleId of [
    'C-01',
    'LT-TIME-RESIDENCE',
    'NAT-TIME-RESIDENCE',
    'GV-TIME-RENEWAL',
    'NAT-BIRTH-EXEMPTION',
    'GR-LAW-DATE',
    'TY-05',
    'EF-03',
    'WK-INVITATION-AGE',
    'FT-03',
  ])
    expect(ruleIds).toContain(ruleId);
  expect(new Set(ruleIds).size).toBe(ruleIds.length);
  expect(policy.rules[id].find((rule) => rule.id === 'TY-05')).toMatchObject({
    pendingDetails: ['PD-312'],
  });
  expect(policy.pathways).toHaveLength(8);
  for (const rule of policy.rules[id]) {
    expect(rule.title, rule.id).toMatch(/\S/);
    expect(rule.titleEn, rule.id).not.toMatch(/[㐀-鿿]/);
    expect(rule.sources.length, rule.id).toBeGreaterThan(0);
  }

  const sources = new Set(Object.keys(policy.sourceUrls));
  const assessed = gr.run(
    {
      ...longTermDraft(),
      pathways: [
        'GR-LONG-TERM',
        'GR-GOLDEN-VISA',
        'GR-NATIONALITY',
        'GR-TEN-YEAR',
        'GR-GREEK-FAMILY-PR',
        'GR-EU-FAMILY-PR',
        'GR-WORK',
        'GR-FAMILY-TCN',
      ],
    },
    'zh-CN',
  );
  for (const pathway of assessed.columns[0].pathways)
    for (const check of pathway.checks)
      for (const source of check.sources)
        expect(sources.has(source.srcId), source.srcId).toBe(true);
  expect(sources.has('SRC-086')).toBe(true);
  expect(sources.has('SRC-001')).toBe(false);
  expect(sources.has('SRC-110')).toBe(false);

  const html = render(<GreecePolicyPage />);
  expect(html).toContain('<h1>希腊政策依据</h1>');
  expect(html).toContain('data-source="SRC-350"');
  expect(html).not.toContain('data-source="SRC-001"');
  expect(html.match(/data-policy-change=/g)).toHaveLength(6);
  expect(render(<GreecePolicyPage />, 'en')).toContain(
    '<h1>Policy basis for Greece</h1>',
  );
});

// Review 98-1 reproductions. Each draft starts from the reviewer's inputs.
function routeDraft(patch: Partial<GreeceDraft>): GreeceDraft {
  return {
    ...createGreeceDraft(),
    completed: true,
    simulationDate: '2026-11-24',
    birthDate: '1985-01-01',
    ...patch,
  };
}
const checkOf = (draft: GreeceDraft, id: string) =>
  gr
    .run(draft, 'zh-CN')
    .columns[0].pathways.flatMap((pathway) => pathway.checks)
    .find((check) => check.id === id);
const whatIfControls = (
  draft: GreeceDraft,
  knobs = gr.whatif.initial(draft),
) => {
  const afterDraft = gr.whatif.apply(draft, knobs);
  return render(
    <GreeceWhatIfControls
      afterDraft={afterDraft}
      knobs={knobs}
      errors={gr.whatif.validate(afterDraft, knobs)}
      update={() => {}}
    />,
  );
};
const e4Draft = routeDraft({
  pathways: ['GR-WORK'],
  entry: 'outside',
  work: {
    permit: 'E4',
    stage: 'initial',
    admission: 'ordinary',
    contractMonths: 24,
    contractDocumented: true,
    fullTimeEmployment: true,
    payBasis: 'monthly',
    grossPayEur: 500,
  },
});
const sponsorDraft = routeDraft({
  pathways: ['GR-FAMILY-TCN'],
  familyTcn: {
    stage: 'initial',
    sponsor: 'ordinary',
    sponsorLawfulYears: 1,
    sponsorPermitDurationYears: 2,
    sponsorPermitLeadsToPermanentResidence: true,
    sponsorPermitValid: true,
  },
});
const autonomousDraft = routeDraft({
  pathways: ['GR-FAMILY-TCN'],
  trips: [],
  familyTcn: {
    stage: 'autonomous',
    sponsor: 'ordinary',
    member: 'spouse',
    autonomousBasis: 'residence',
    previousFamilyCard: true,
    familyResidenceYears: 4,
    yearsSinceFirstFamilyPermit: 4,
  },
});
const euFamilyDraft = routeDraft({
  pathways: ['GR-EU-FAMILY-PR'],
  permits: [],
  trips: [
    {
      departed: '2022-01-01',
      returned: '2022-10-01',
      familyAbsenceReason: 'ordinary',
    },
  ],
  tripsComplete: true,
  euFamily: {
    stage: 'permanent',
    relationship: 'spouse',
    qualifyingNonGreekEuSponsor: true,
    sponsorExercisedTreatyRights: true,
    residenceFrom: '2019-01-01',
    qualifyingResidenceDocumented: true,
    priorCardIssued: true,
    priorCardExpiry: '2026-12-31',
    maxOrdinaryAnnualAbsenceMonths: 9,
  },
});
const greekFamilyDraft = routeDraft({
  pathways: ['GR-GREEK-FAMILY-PR'],
  permits: [],
  trips: [],
  greekFamily: {
    stage: 'permanent',
    relationship: 'spouse',
    residenceFrom: '2019-01-01',
    qualifyingResidenceDocumented: true,
    priorCardExpiry: '2025-12-31',
    interruptionAfterExpiryYears: 3,
  },
});

test('each knob changes the answer its linked conditions read (review98-1 item 1)', () => {
  // Ε.4: WK-04 compares monthly or daily pay with the minimum wage.
  expect(checkOf(e4Draft, 'WK-04')?.status).toBe('NOT_MET');
  expect(gr.whatif.focusForRule('WK-04', 'GR-WORK')).toBe('pay');
  const pay = gr.whatif.initial(e4Draft);
  expect(pay.grossPayEur).toBe(500);
  expect(gr.whatif.apply(e4Draft, pay)).toEqual(e4Draft);
  expect(
    checkOf(gr.whatif.apply(e4Draft, { ...pay, grossPayEur: 920 }), 'WK-04')
      ?.status,
  ).toBe('MET');
  const e4Html = whatIfControls(e4Draft);
  expect(e4Html).toContain(
    `<label for="gr-whatif-pay">${t('gr.whatif.payMonthly')}</label>`,
  );
  expect(e4Html).not.toContain('gr-whatif-salary');
  expect(
    whatIfControls({
      ...e4Draft,
      work: { ...e4Draft.work, payBasis: 'daily' },
    }),
  ).toContain(t('gr.whatif.payDaily'));

  // Ε.1: WK-01 compares the annual salary only in a year with a published
  // threshold. Other years stay unknown (PD-317), so no knob is linked.
  expect(gr.whatif.focusForRule('WK-01', 'GR-WORK')).toBeUndefined();
  const e1 = routeDraft({
    pathways: ['GR-WORK'],
    entry: 'outside',
    work: {
      permit: 'E1',
      stage: 'initial',
      admission: 'ordinary',
      grossAnnualEur: 20000,
    },
  });
  expect(checkOf(e1, 'WK-01')?.status).toBe('UNKNOWN');
  expect(whatIfControls(e1)).not.toContain('gr-whatif-salary');
  const published = { ...gr.whatif.initial(e1), simulationDate: '2024-06-01' };
  expect(whatIfControls(e1, published)).toContain('id="gr-whatif-salary"');
  expect(checkOf(gr.whatif.apply(e1, published), 'WK-01')?.status).toBe(
    'NOT_MET',
  );
  expect(
    checkOf(
      gr.whatif.apply(e1, { ...published, grossAnnualEur: 60000 }),
      'WK-01',
    )?.status,
  ).toBe('MET');

  // Ο.1: FT-02 reads the sponsor's income on first grant and the tax and
  // insurance evidence on renewal. The same focus lands on the one that applies.
  expect(gr.whatif.focusForRule('FT-02', 'GR-FAMILY-TCN')).toBe('sponsor');
  const renewal = routeDraft({
    pathways: ['GR-FAMILY-TCN'],
    familyTcn: {
      stage: 'renewal',
      sponsor: 'ordinary',
      priorYearTaxAndInsuranceEvidence: false,
    },
  });
  expect(checkOf(renewal, 'FT-02')?.status).toBe('NOT_MET');
  const evidence = gr.whatif.initial(renewal);
  expect(evidence.sponsorEvidence).toBe(false);
  expect(gr.whatif.apply(renewal, evidence)).toEqual(renewal);
  expect(
    checkOf(
      gr.whatif.apply(renewal, { ...evidence, sponsorEvidence: true }),
      'FT-02',
    )?.status,
  ).toBe('MET');
  expect(whatIfControls(renewal)).toContain('<select id="gr-whatif-sponsor"');
  expect(whatIfControls(renewal)).not.toContain(t('gr.whatif.sponsorIncome'));
  expect(whatIfControls(sponsorDraft)).toContain(
    '<input id="gr-whatif-sponsor" type="number"',
  );

  // Every linked condition names a rendered control.
  for (const [draft, id] of [
    [e4Draft, 'WK-04'],
    [renewal, 'FT-02'],
    [sponsorDraft, 'FT-02'],
    [autonomousDraft, 'FT-07'],
    [euFamilyDraft, 'EF-03'],
    [longTermDraft(), 'LT-02'],
    [longTermDraft(), 'LT-04'],
  ] as const) {
    const focus = gr.whatif.focusForRule(id, draft.pathways[0])!;
    const control = (gr.whatif.focusControls as Record<string, string>)[focus];
    expect(whatIfControls(draft), id).toContain(`id="${control}"`);
  }
});

test('the language and exam knobs keep answers they cannot express (review98-1 suggestion)', () => {
  const written = routeDraft({
    pathways: ['GR-NATIONALITY'],
    nationality: { exam: 'written', languagePoints: 70 },
  });
  const knobs = gr.whatif.initial(written);
  expect(knobs.examPassed).toBe('answered');
  expect(gr.whatif.apply(written, knobs)).toEqual(written);
  expect(whatIfControls(written)).toContain(
    `<option value="answered" selected="">${t('gr.whatif.asAnswered')}</option>`,
  );
  expect(
    gr.whatif.apply(written, { ...knobs, examPassed: true }).nationality,
  ).toMatchObject({ exam: 'certificate', knowledgeDocumentReady: true });

  const a2 = {
    ...longTermDraft(),
    integration: { basis: 'a2' as const, a2Certificate: true },
  };
  const level = gr.whatif.initial(a2);
  expect(level.greekLevel).toBe('answered');
  expect(gr.whatif.apply(a2, level)).toEqual(a2);
  expect(whatIfControls(a2)).toContain(
    `<option value="answered" selected="">${t('gr.whatif.asAnswered')}</option>`,
  );
  // An answer the knob can show directly has no extra option.
  expect(whatIfControls(longTermDraft())).not.toContain('value="answered"');
});

test('assuming no time outside Greece clears each whole absence summary (review98-1 item 2)', () => {
  const stayed = (draft: GreeceDraft) =>
    gr.whatif.apply(draft, { ...gr.whatif.initial(draft), noTrips: true });
  expect(checkOf(euFamilyDraft, 'EF-03')?.status).toBe('NOT_MET');
  const euFamily = {
    ...euFamilyDraft.euFamily,
    maxOrdinaryAnnualAbsenceMonths: undefined,
  };
  for (const summary of [
    { maxOrdinaryAnnualAbsenceMonths: 9 },
    { seriousAbsenceCount: 1, maxSeriousAbsenceMonths: 14 },
    {},
  ]) {
    const draft = { ...euFamilyDraft, euFamily: { ...euFamily, ...summary } };
    expect(
      checkOf(stayed(draft), 'EF-03')?.status,
      JSON.stringify(summary),
    ).toBe('MET');
  }

  // After an Ο.3 card expires, an interruption of residence is time outside Greece too.
  expect(checkOf(greekFamilyDraft, 'GF-03')?.status).toBe('NOT_MET');
  const greekFamily = {
    ...greekFamilyDraft.greekFamily,
    interruptionAfterExpiryYears: undefined,
  };
  for (const summary of [
    { interruptionAfterExpiryYears: 3 },
    { maxAnnualAbsenceMonths: 9 },
    {
      extendedAbsence: 'single-serious-reason' as const,
      extendedAbsenceMonths: 14,
    },
    { longestAbsenceAfterPrYears: 3 },
  ]) {
    const draft = {
      ...greekFamilyDraft,
      greekFamily: { ...greekFamily, ...summary },
    };
    expect(
      checkOf(stayed(draft), 'GF-03')?.status,
      JSON.stringify(summary),
    ).toBe('MET');
  }
});

test('moving the date drops year counts taken on the questionnaire date (review98-1 item 3)', () => {
  const later = (draft: GreeceDraft, simulationDate: string) =>
    gr.whatif.apply(draft, { ...gr.whatif.initial(draft), simulationDate });
  // Ordinary sponsor: one year on 2026-11-24 says nothing about 2029.
  expect(checkOf(sponsorDraft, 'FT-01')?.status).toBe('NOT_MET');
  const moved = later(sponsorDraft, '2029-01-01');
  expect(moved.familyTcn).not.toHaveProperty('sponsorLawfulYears');
  expect(checkOf(moved, 'FT-01')?.status).toBe('UNKNOWN');
  // A start date moves with the comparison date.
  const dated = {
    ...sponsorDraft,
    familyTcn: {
      ...sponsorDraft.familyTcn,
      sponsorLawfulYears: undefined,
      sponsorLawfulFrom: '2025-11-24',
    },
  };
  expect(checkOf(dated, 'FT-01')?.explanation).toContain('2027-11-24');
  expect(checkOf(later(dated, '2029-01-01'), 'FT-01')?.status).toBe('MET');

  // Ο.2 residence: both year counts are as of the questionnaire date.
  expect(checkOf(autonomousDraft, 'FT-07')?.status).toBe('NOT_MET');
  const autonomous = later(autonomousDraft, '2028-12-01');
  expect(autonomous.familyTcn).not.toHaveProperty('familyResidenceYears');
  expect(autonomous.familyTcn).not.toHaveProperty(
    'yearsSinceFirstFamilyPermit',
  );
  expect(checkOf(autonomous, 'FT-07')?.status).toBe('UNKNOWN');
  // Residence before the sponsor's death does not change with the date.
  const bereaved = {
    ...autonomousDraft,
    familyTcn: {
      ...autonomousDraft.familyTcn,
      autonomousBasis: 'bereavement' as const,
      sponsorDiedOn: '2025-01-01',
    },
  };
  expect(later(bereaved, '2028-12-01').familyTcn?.familyResidenceYears).toBe(4);
  const blue = routeDraft({
    pathways: ['GR-WORK'],
    work: { permit: 'E1', stage: 'renewal', blueCardYears: 1 },
  });
  expect(later(blue, '2028-12-01').work).not.toHaveProperty('blueCardYears');
  // The questionnaire date keeps every answer, and the knob explains the rule.
  expect(later(sponsorDraft, '2026-11-24')).toEqual(sponsorDraft);
  expect(whatIfControls(sponsorDraft)).toContain(t('gr.whatif.yearCounts'));
  expect(whatIfControls(dated)).not.toContain(t('gr.whatif.yearCounts'));
});

test('the comparison marks a date before birth and explains the income year (review98-1 risks)', () => {
  const draft = longTermDraft();
  const knobs = { ...gr.whatif.initial(draft), simulationDate: '1984-06-01' };
  expect(gr.whatif.validate(gr.whatif.apply(draft, knobs), knobs)).toEqual({
    date: 'gr.error.birthAfterSimulation',
  });
  expect(whatIfControls(draft, knobs)).toContain('aria-invalid="true"');
  expect(whatIfControls(draft)).toContain(t('gr.whatif.incomeYear'));
});
