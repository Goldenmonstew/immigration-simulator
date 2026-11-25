import { renderToStaticMarkup } from 'react-dom/server';
import { afterEach, expect, test, vi } from 'vitest';
import { usePathname } from 'next/navigation';
import GermanyPage from '../app/germany/page';
import GermanyPolicyPage from '../app/germany/policy/page';
import GermanySimulatePage from '../app/germany/simulate/page';
import { GET as offlinePages } from '../app/offline-pages.json/route';
import sitemap from '../app/sitemap';
import { ResultView } from '../components/result-view';
import { SiteShell } from '../components/site-shell';
import { WhatIfView } from '../components/whatif-lab';
import { LocaleContext } from '../i18n/locale';
import {
  activeGermanyAnswers,
  createGermanyDraft,
  decodeGermanyDraft,
  restoreStoredGermanyDraft,
  storeGermanyAnswers,
  validateGermanyStep,
  type GermanyDraft,
} from '../lib/germany-draft';
import { germanyModule as de } from '../lib/germany-module';
import { readPageResult } from '../lib/page-result';
import { decodeDraft, encodeDraft, linkedResultDraft } from '../lib/share';
import { draftStorage, readScenarios, saveScenario } from '../lib/storage';
import { ukModule } from '../lib/uk-module';

vi.mock('next/navigation', async (importOriginal) => ({
  ...(await importOriginal<typeof import('next/navigation')>()),
  usePathname: vi.fn(),
}));

afterEach(() => {
  vi.unstubAllGlobals();
});

function sampleDraft(): GermanyDraft {
  return {
    ...createGermanyDraft(),
    step: 5,
    completed: true,
    simulationDate: '2026-11-23',
    birthDate: '1990-06-20',
    firstEntry: '2022-05-23',
    routes: ['R01', 'R02', 'R07'],
    permits: [{ kind: 'skilled', from: '2022-05-23' }],
    trips: [],
    contributionMonths: 60,
    trainedInGermany: true,
    common: {
      identityEstablished: true,
      nationalityEstablishedOrNotRequired: true,
      capableOrRepresented: true,
      passport: 'valid',
      evidenceAndAttendance: true,
      entry: 'required-visa-and-disclosed',
      security: 'no-known-ground',
      benefits: 'none-or-permitted',
      livelihoodConfirmed: true,
      household: {
        members: ['single'],
        countableMonthlyIncome: 1243,
        warmRent: 550,
        additionalNeeds: 50,
        uncoveredPremiums: 80,
        sustainable: true,
        scopeAndDeductionsConfirmed: true,
      },
      insurance: ['statutory', 'family'],
      employmentAuthorisedOrNotRequired: true,
      permanentProfessionalPermissionOrNotRequired: true,
      provenGerman: 'B1',
      orientationScore: 15,
      housing: {
        qualityAndOccupancyConfirmed: true,
        localMinimumM2: 46,
        usableM2: 46,
      },
      address: 'registered',
      transition: 'ordinary',
    },
    settlement: { skilledQualification: true, currentSkilledPost: 'qualified' },
    mobility: {
      titles: [
        {
          kind: 'skilled',
          validTo: '2028-05-22',
          noOtherLossEvent: true,
          trips: [],
        },
      ],
    },
    citizenship: {},
    fees: {},
  };
}

test.each(['zh-CN', 'en'] as const)(
  'Germany home links to the questionnaire and policy sources in %s',
  (locale) => {
    const html = renderToStaticMarkup(
      <LocaleContext value={{ locale, setLocale: () => {} }}>
        <GermanyPage />
      </LocaleContext>,
    );
    expect(html).toContain('href="/germany/simulate"');
    expect(html).toContain('href="/germany/policy"');
    expect(html).toContain(locale === 'en' ? 'Germany' : '德国');
  },
);

test('all five Germany pages are exported in the offline and sitemap lists', async () => {
  const offline = await offlinePages().json();
  const paths = sitemap().map(({ url }) => new URL(url).pathname);
  for (const path of [
    '/germany',
    '/germany/simulate',
    '/germany/result',
    '/germany/whatif',
    '/germany/policy',
  ]) {
    expect(offline).toContain(path);
    expect(paths).toContain(path);
  }
});

test('versioned Germany drafts round-trip, preserve pending null booleans, and migrate legacy time-only drafts', () => {
  const storage = new Map<string, string>();
  vi.stubGlobal('localStorage', {
    getItem: (key: string) => storage.get(key) ?? null,
    setItem: (key: string, json: string) => storage.set(key, json),
  });

  const draft = sampleDraft();
  draft.common = {
    ...draft.common,
    identityEstablished: true,
    capableOrRepresented: undefined,
  };

  draftStorage(de, draft);
  saveScenario(de, '德国永居方案', draft);
  const encoded = encodeDraft(de, draft);

  const rawSaved = JSON.parse(storage.get('de-immigration-draft-v1')!);
  expect(rawSaved.common.identityEstablished).toBe(true);
  expect(rawSaved.common.capableOrRepresented).toBeNull();

  expect(draftStorage(de).draft).toEqual(draft);
  expect(readScenarios(de).scenarios[0].draft).toEqual(draft);
  expect(decodeDraft(de, encoded)).toEqual(draft);
  expect(decodeDraft(ukModule, encoded)).toBeUndefined();
  expect(
    decodeDraft(de, encodeDraft(ukModule, ukModule.createDraft())),
  ).toBeUndefined();

  for (const bad of [
    null,
    { ...draft, version: 2 },
    { ...draft, step: 99 },
    { ...draft, routes: ['INVALID'] },
    { ...draft, permits: 'not-an-array' },
  ]) {
    expect(decodeGermanyDraft(bad)).toBeUndefined();
  }

  // Legacy time-only DeForm / DeRequest migration
  const migrated = decodeGermanyDraft({
    simulationDate: '2026-11-23',
    firstEntry: '2023-01-10',
    settlementRoute: 'blue-card',
    naturalisationRoute: 'general',
    permits: [{ kind: 'blue-card', from: '2023-01-10' }],
    trips: [{ departed: '2024-05-01', returned: '2024-05-15' }],
    contributionMonths: '34',
    blueCardEmploymentMonths: 28,
    germanB1: true,
  });
  expect(migrated).toBeDefined();
  expect(migrated?.completed).toBe(true);
  expect(migrated?.routes).toEqual(['R00', 'R03', 'R06', 'R07']);
  expect(migrated?.contributionMonths).toBe(34);
  expect(migrated?.blueCardEmploymentMonths).toBe(28);
  expect(migrated?.common?.provenGerman).toBe('B1');
});

test('step validation enforces route selection, first entry, § 20 / § 20a permit expiry dates, date order, and score ranges', () => {
  const fresh = createGermanyDraft();
  expect(validateGermanyStep(fresh)).toEqual({
    'de-routes': 'de.form.routeError',
  });

  // Fee-only R18 does not require firstEntry on step 0
  expect(
    validateGermanyStep({
      ...fresh,
      routes: ['R18'],
    }),
  ).toEqual({});

  // Timeline route requires firstEntry
  expect(
    validateGermanyStep({
      ...fresh,
      routes: ['R01'],
    }),
  ).toHaveProperty('de-firstEntry', 'de.form.required');

  const withEntry: GermanyDraft = {
    ...fresh,
    simulationDate: '2026-11-23',
    firstEntry: '2022-05-23',
    routes: ['R01', 'R03', 'R07'],
  };
  expect(validateGermanyStep(withEntry)).toEqual({});

  // Step 1: permit expiry required for job-seeking / opportunity-card / follow-up-card and date order
  expect(
    validateGermanyStep({
      ...withEntry,
      step: 1,
      permits: [{ kind: 'job-seeking', from: '2025-01-01' }],
    }),
  ).toHaveProperty('de-permits-0-to', 'de.error.jobSeekingEnd');

  expect(
    validateGermanyStep({
      ...withEntry,
      step: 1,
      permits: [{ kind: 'opportunity-card', from: '2025-01-01' }],
    }),
  ).toHaveProperty('de-permits-0-to', 'de.error.opportunityCardEnd');

  expect(
    validateGermanyStep({
      ...withEntry,
      step: 1,
      permits: [{ kind: 'skilled', from: '2025-06-01', to: '2025-01-01' }],
      trips: [{ departed: '2025-08-10', returned: '2025-08-01' }],
    }),
  ).toMatchObject({
    'de-permits-0-to': 'de.error.order',
    'de-trips-0-returned': 'de.error.order',
  });

  // Step 2: orientationScore range 0..33
  expect(
    validateGermanyStep({
      ...withEntry,
      step: 2,
      common: { orientationScore: 34 },
    }),
  ).toHaveProperty('de-common-orientationScore', 'de.error.score');

  // Step 3: Blue Card payroll month format and order
  expect(
    validateGermanyStep({
      ...withEntry,
      step: 3,
      mobility: {
        blueCard: {
          employment: [{ firstMonth: '2025-13', lastMonth: '2025-06' }],
        },
      },
    }),
  ).toHaveProperty(
    'de-route-R03-blueCard-employment-0-firstMonth',
    'de.form.monthError',
  );

  expect(
    validateGermanyStep({
      ...withEntry,
      step: 3,
      mobility: {
        blueCard: {
          employment: [{ firstMonth: '2025-08', lastMonth: '2025-06' }],
        },
      },
    }),
  ).toHaveProperty(
    'de-route-R03-blueCard-employment-0-lastMonth',
    'de.error.order',
  );

  // Step 4: citizenship naturalisation test score range 0..33
  expect(
    validateGermanyStep({
      ...withEntry,
      step: 4,
      citizenship: {
        knowledge: { kind: 'naturalisation-test', correct: 40 },
      },
    }),
  ).toHaveProperty('de-nat-knowledge-correct', 'de.error.score');

  // restoreStoredGermanyDraft rewinds incomplete drafts to the failing step
  const incompleteCompleted: GermanyDraft = {
    ...fresh,
    step: 2,
    completed: true,
    routes: ['R01'],
  };
  expect(restoreStoredGermanyDraft(incompleteCompleted, true)).toMatchObject({
    completed: false,
    step: 0,
  });
});

test('run produces MET, FUTURE, and UNKNOWN pathways and What-if knobs update status and dates', () => {
  const draft = sampleDraft();
  const baseline = de.run(draft, 'zh-CN');
  const pathways = baseline.columns[0].pathways;

  const r02 = pathways.find((p) => p.id === 'DE-R02');
  const r01 = pathways.find((p) => p.id === 'DE-R01');
  const r07 = pathways.find((p) => p.id === 'DE-R07');

  // DE-R02 (§ 18c Abs. 1 skilled worker settlement, 24 months trained in Germany) is MET
  expect(r02?.status).toBe('MET');
  expect(r02?.earliestDate).toBe('2026-11-23');

  // DE-R01 (§ 9 general settlement) has all non-time conditions MET and reaches 5 years on 2027-05-23 -> FUTURE
  expect(r01?.status).toBe('FUTURE');
  expect(r01?.earliestDate).toBe('2027-05-23');

  // DE-R07 (§ 10 StAG naturalisation) is short of five years' residence and its declarations are unconfirmed -> NOT_MET with pending details
  expect(r07?.status).toBe('NOT_MET');
  expect(r07?.pendingDetails?.length).toBeGreaterThan(0);

  // Leaving the German certificate blank makes DE-R02 UNKNOWN instead of MET
  const noGerman = de
    .run(
      { ...draft, common: { ...draft.common, provenGerman: undefined } },
      'zh-CN',
    )
    .columns[0].pathways.find((p) => p.id === 'DE-R02');
  expect(noGerman?.status).toBe('UNKNOWN');
  expect(noGerman?.earliestDate).toBeUndefined();

  // What-if initial, validate, focusForRule, and apply
  const initialKnobs = de.whatif.initial(draft);
  expect(initialKnobs).toMatchObject({
    simulationDate: '2026-11-23',
    noTrips: false,
    provenGerman: 'B1',
    orientationScore: 15,
    contributionMonths: 60,
    livelihoodConfirmed: true,
  });

  expect(
    de.whatif.validate(draft, { ...initialKnobs, simulationDate: 'bad' }),
  ).toHaveProperty('date', 'de.whatif.invalidDate');
  expect(
    de.whatif.validate(draft, { ...initialKnobs, orientationScore: 35 }),
  ).toHaveProperty('knowledge', 'de.whatif.invalidScore');

  expect(de.whatif.focusForRule('DE-C13', 'DE-R01')).toBe('date');
  expect(de.whatif.focusForRule('DE-C05', 'DE-R01')).toBe('contributions');
  expect(de.whatif.focusForRule('DE-C08', 'DE-R01')).toBe('german');
  expect(de.whatif.focusForRule('DE-C09', 'DE-R01')).toBe('knowledge');
  expect(de.whatif.focusForRule('DE-C19-months', 'DE-R03')).toBe(
    'blueCardMonths',
  );
  expect(de.whatif.focusForRule('DE-C21-pay', 'DE-R03')).toBe('salary');
  expect(de.whatif.focusForRule('DE-C03', 'DE-R01')).toBe('livelihood');
  expect(de.whatif.focusForRule('DE-C63-time', 'DE-R01')).toBe('trips');

  // Advancing simulationDate to 2027-06-01 moves DE-R01 from FUTURE to MET
  const nextKnobs = {
    ...initialKnobs,
    simulationDate: '2027-06-01',
    provenGerman: 'C1' as const,
    noTrips: true,
  };
  const modifiedDraft = de.whatif.apply(draft, nextKnobs);
  const compared = de.run(modifiedDraft, 'zh-CN');
  const comparedR01 = compared.columns[0].pathways.find(
    (p) => p.id === 'DE-R01',
  );
  expect(comparedR01?.status).toBe('MET');
  expect(comparedR01?.earliestDate).toBe('2027-06-01');

  // Render ResultView and WhatIfView
  const resultHtml = renderToStaticMarkup(
    <LocaleContext value={{ locale: 'zh-CN', setLocale: () => {} }}>
      <ResultView country={de} result={baseline} draft={draft} />
    </LocaleContext>,
  );
  expect(resultHtml).toContain('2027-05-23');
  expect(resultHtml).toContain('技术人员定居');

  const whatIfHtml = renderToStaticMarkup(
    <LocaleContext value={{ locale: 'zh-CN', setLocale: () => {} }}>
      <WhatIfView
        country={{ ...de, whatif: { ...de.whatif, initial: () => nextKnobs } }}
        draft={draft}
      />
    </LocaleContext>,
  );
  expect(whatIfHtml).toContain('id="de-whatif-date"');
  expect(whatIfHtml).toContain(
    '2027-05-23</span><span aria-hidden="true">→</span><span>2027-06-01',
  );
});

test('Germany policy page renders rule set, pathways, and only Germany-cited official sources', () => {
  const allRoutesDraft: GermanyDraft = {
    ...createGermanyDraft(),
    simulationDate: '2026-11-23',
    firstEntry: '2021-01-01',
    routes: [
      'R00',
      'R01',
      'R02',
      'R03',
      'R04',
      'R05',
      'R05-fast',
      'R06',
      'R07',
      'R08',
      'R09',
      'R10',
      'R11',
      'R12',
      'R13',
      'R14',
      'R15',
      'R16',
      'R17',
      'R18',
    ],
    permits: [{ kind: 'blue-card', from: '2021-01-01' }],
  };
  const assessed = de.run(allRoutesDraft, 'zh-CN');
  const policySources = new Set(Object.keys(de.policy.sourceUrls));

  for (const pathway of assessed.columns[0].pathways) {
    for (const check of pathway.checks) {
      for (const source of check.sources) {
        expect(policySources.has(source.srcId)).toBe(true);
      }
    }
  }

  expect(policySources.has('SRC-100')).toBe(true);
  expect(policySources.has('SRC-410')).toBe(true);
  expect(policySources.has('SRC-001')).toBe(false);
  expect(policySources.has('SRC-110')).toBe(false);

  const html = renderToStaticMarkup(
    <LocaleContext value={{ locale: 'zh-CN', setLocale: () => {} }}>
      <GermanyPolicyPage />
    </LocaleContext>,
  );
  expect(html).toContain('<h1>德国政策依据</h1>');
  expect(html).toContain('de.current-law-2026-11');
  expect(html).toContain('data-source="SRC-100"');
  expect(html).toContain('data-source="SRC-410"');
  expect(html).not.toContain('data-source="SRC-001"');
});

test('Germany questionnaire renders steps and activeGermanyAnswers strips inactive route fields', () => {
  const draft = sampleDraft();
  draft.step = 0;
  const step0Html = renderToStaticMarkup(
    <LocaleContext value={{ locale: 'zh-CN', setLocale: () => {} }}>
      {GermanySimulatePage().props.children({
        draft,
        errors: { 'de-routes': 'de.form.routeError' },
        update: () => {},
      })}
    </LocaleContext>,
  );
  expect(step0Html).toContain('id="de-routes"');
  expect(step0Html).toContain('id="de-route-R01"');
  expect(step0Html).toContain('id="de-route-R18"');

  const dirty: GermanyDraft = {
    ...draft,
    routes: ['R03'],
    marriedOn: '2023-01-01',
    citizenship: { sustainableHouseholdSupport: true },
  };
  const cleaned = activeGermanyAnswers(dirty);
  expect(cleaned.marriedOn).toBeUndefined();
  expect(cleaned.citizenship).toEqual({});
});

const condition = (
  result: ReturnType<typeof de.run>,
  route: string,
  id: string,
) =>
  result.columns[0].pathways
    .find((pathway) => pathway.id === route)
    ?.checks.find((check) => check.id === id);

test('criminal fines and mixed sentences require their day-rate lists instead of crashing the result (review100-1 #1)', () => {
  const base: GermanyDraft = { ...sampleDraft(), step: 4 };
  for (const [record, list] of [
    [{ kind: 'fines' }, 'dayRates'],
    [{ kind: 'mixed-sentences', prisonDays: 30 }, 'fineDayRates'],
  ] as const) {
    const draft = {
      ...base,
      citizenship: { criminalRecord: record },
    } as unknown as GermanyDraft;
    expect(validateGermanyStep(draft)).toHaveProperty(
      `de-nat-criminalRecord-${list}`,
      'de.form.required',
    );
    // A completed draft missing the list goes back to step 4 instead of running.
    expect(
      restoreStoredGermanyDraft({ ...draft, step: 5 }, true),
    ).toMatchObject({ completed: false, step: 4 });
  }
  const run = (criminalRecord: object) =>
    condition(
      de.run(
        { ...base, citizenship: { criminalRecord } } as GermanyDraft,
        'zh-CN',
      ),
      'DE-R07',
      'DE-C52',
    )?.status;
  // A confirmed empty list stays unknown; prison days alone are evaluated.
  expect(run({ kind: 'fines', dayRates: [] })).toBe('UNKNOWN');
  expect(
    run({
      kind: 'mixed-sentences',
      prisonDays: 30,
      fineDayRates: [],
      judgmentFoundHateMotive: false,
      allCustodySuspendedAndRemitted: true,
    }),
  ).toBe('MET');
});

test('historical worker answers are only required when a worker category applies (review100-1 #7)', () => {
  const step4 = (historicalWorker: object) =>
    validateGermanyStep({
      ...sampleDraft(),
      step: 4,
      citizenship: { incomeException: 'legacy-worker', historicalWorker },
    } as unknown as GermanyDraft);
  expect(step4({ kind: 'none' })).toEqual({});
  expect(step4({ kind: 'west-agreement' })).toEqual({
    'de-nat-historicalWorker-applicant': 'de.form.required',
  });
  expect(step4({ kind: 'west-agreement', applicant: 'worker' })).toEqual({});
});

test('migrated legacy drafts are checked step by step and reopen at the failing step (review100-1 #8)', () => {
  const legacy = decodeGermanyDraft({
    simulationDate: '2026-11-23',
    settlementRoute: 'general',
    permits: [],
    trips: [],
  });
  expect(legacy).toMatchObject({ completed: false, step: 0 });
  expect(validateGermanyStep(legacy!)).toEqual({
    'de-firstEntry': 'de.form.required',
  });
});

test('residence history lists start unanswered so "no trips" differs from "not sure" (review100-1 #2)', () => {
  const fresh = createGermanyDraft();
  expect(fresh.permits).toBeUndefined();
  expect(fresh.trips).toBeUndefined();

  const status = (draft: Partial<GermanyDraft>, route: string, id: string) =>
    condition(
      de.run(
        {
          ...fresh,
          simulationDate: '2026-11-23',
          ...draft,
        } as GermanyDraft,
        'zh-CN',
      ),
      route,
      id,
    )?.status;
  const r01 = {
    routes: ['R01'],
    firstEntry: '2021-01-01',
    permits: [{ kind: 'skilled', from: '2021-01-01' }],
  } as Partial<GermanyDraft>;
  expect(status(r01, 'DE-R01', 'DE-C13')).toBe('UNKNOWN');
  expect(status({ ...r01, trips: [] }, 'DE-R01', 'DE-C13')).toBe('MET');
  expect(
    status(
      { routes: ['R00'], firstEntry: '2022-05-23' },
      'DE-R00',
      'DE-C63-time',
    ),
  ).toBe('UNKNOWN');
  expect(
    status({ routes: ['R03'], firstEntry: '2022-05-23' }, 'DE-R03', 'DE-C19'),
  ).toBe('UNKNOWN');

  // Every history list, including trips under a single document, can be
  // confirmed empty and returned to pending.
  const step1 = (draft: Partial<GermanyDraft>) =>
    renderToStaticMarkup(
      <LocaleContext value={{ locale: 'zh-CN', setLocale: () => {} }}>
        {GermanySimulatePage().props.children({
          draft: { ...fresh, routes: ['R01'], step: 1, ...draft },
          errors: {},
          update: () => {},
        })}
      </LocaleContext>,
    );
  const count = (html: string, text: string) => html.split(text).length - 1;
  const unanswered = step1({
    mobility: { titles: [{ kind: 'skilled' }] },
  });
  expect(count(unanswered, '确认无此项记录')).toBe(3);
  expect(unanswered).not.toContain('已确认为无记录。');
  const confirmed = step1({
    permits: [],
    trips: [],
    mobility: { titles: [{ kind: 'skilled', trips: [] }] },
  });
  expect(count(confirmed, '已确认为无记录。')).toBe(3);
  expect(count(confirmed, '恢复为待确认')).toBe(3);
});

test('each route and group shows its own field and option wording (review100-1 #4)', () => {
  const page = (draft: Partial<GermanyDraft>, locale: 'zh-CN' | 'en') =>
    renderToStaticMarkup(
      <LocaleContext value={{ locale, setLocale: () => {} }}>
        {GermanySimulatePage().props.children({
          draft: { ...createGermanyDraft(), ...draft } as GermanyDraft,
          errors: {},
          update: () => {},
        })}
      </LocaleContext>,
    );
  const unescape = (text: string) =>
    text.replaceAll('&#x27;', "'").replaceAll('&amp;', '&');
  const option = (html: string, id: string, value: string) => {
    const select = html.match(
      new RegExp(`<select[^>]* id="${id}"[^>]*>(.*?)</select>`),
    )?.[1];
    return unescape(
      select?.match(
        new RegExp(`<option value="${value}"[^>]*>(.*?)</option>`),
      )?.[1] ?? `missing ${id} ${value}`,
    );
  };
  const label = (html: string, id: string) =>
    unescape(
      html.match(new RegExp(`<label for="${id}">(.*?)</label>`))?.[1] ??
        `missing ${id}`,
    );
  const settlement = (locale: 'zh-CN' | 'en') =>
    page(
      {
        step: 3,
        routes: ['R05', 'R06', 'R10', 'R11', 'R13', 'R15', 'R18'],
        settlement: {
          euMobility: {
            periods: [{ kind: 'ineligible', from: '', until: '' }],
          },
          childJudgments: [{ kind: 'fine', judgmentDate: '', amount: 0 }],
        },
        mobility: {
          freedom: {
            periods: [{ from: '' }],
            subsequentTrips: [{ departed: '' }],
          },
        },
      } as Partial<GermanyDraft>,
      locale,
    );
  const citizenship = (locale: 'zh-CN' | 'en') =>
    page(
      {
        step: 4,
        routes: ['R08', 'R16'],
        citizenship: {
          incomeException: 'legacy-worker',
          historicalWorker: { kind: 'west-agreement' },
          spouse: { status: 'died' },
        },
      } as Partial<GermanyDraft>,
      locale,
    );
  const fees = (locale: 'zh-CN' | 'en') =>
    page({ step: 5, routes: ['R01'], fees: { integration: 'course' } }, locale);
  const cases: [
    (locale: 'zh-CN' | 'en') => string,
    string,
    string | undefined,
    string,
  ][] = [
    [
      citizenship,
      'de-nat-R08-spouse-endedOn',
      undefined,
      '婚姻或登记伴侣关系依法终结之日，或德国籍配偶去世之日',
    ],
    [
      settlement,
      'de-route-R11-childEducation',
      'school',
      '在读普通学校，目标为认可的学校毕业文凭',
    ],
    [
      settlement,
      'de-route-R11-childPermitBasis',
      'family',
      '家庭原因居留许可（AufenthG 第 2 章第 6 节）',
    ],
    [
      settlement,
      'de-route-R11-childPermitBasis',
      'humanitarian',
      '人道、政治或国际法原因居留许可（第 2 章第 5 节，含 § 25 Abs. 1–2 保护身份）',
    ],
    [
      settlement,
      'de-route-R18-freedom-periods-0-basis',
      'family',
      '作为欧盟／EEA 公民的家庭成员',
    ],
    [
      citizenship,
      'de-nat-R16-family-relation',
      'other',
      '其他亲属关系（不适用随同入籍）',
    ],
    [
      citizenship,
      'de-nat-R16-family-relation',
      'child',
      '主申请人的未成年子女',
    ],
    [
      citizenship,
      'de-nat-currentTitle',
      'unverified',
      '居留头衔或适用条文尚待核实',
    ],
    [
      settlement,
      'de-route-R15-formerSpouseMaintenance',
      'insufficient',
      '扶养款与本人收入合计不足以维持生计',
    ],
    [
      settlement,
      'de-route-R06-euRetirementProvision',
      'under-review',
      '主管机关仍在审核中',
    ],
    [
      settlement,
      'de-route-R06-euCareCover',
      'inadequate',
      '保障不足或尚未建立',
    ],
    [
      settlement,
      'de-route-R13-stateConsent',
      'not-required',
      '依法无需州主管机关同意',
    ],
    [
      settlement,
      'de-route-R11-childSchoolCredit',
      'ordinary',
      '未另行认定：境外上学天数不计入，可计期间相应顺延',
    ],
    [fees, 'de-fees-reduction', 'ordinary', '无减免，按法定标准收费'],
    [
      citizenship,
      'de-nat-incomeException',
      'partner',
      '配偶或登记伴侣近 24 个月内全职工作至少 20 个月，且与申请人及未成年子女共同生活（§ 10 Abs. 1 Nr. 3c）',
    ],
    [
      citizenship,
      'de-nat-historicalWorker-applicant',
      'worker',
      '申请人本人即该历史劳工',
    ],
    [
      citizenship,
      'de-nat-historicalWorker-applicant',
      'spouse',
      '申请人为该劳工的配偶',
    ],
    [
      settlement,
      'de-route-R06-euMobility-periods-0-kind',
      'ineligible',
      '不可按 § 9b 计入的居留期间',
    ],
    [
      settlement,
      'de-route-R05-protectionTitle',
      'other',
      '其他居留许可（不属上列保护或重新安置身份）',
    ],
    [
      settlement,
      'de-route-R10-businessPermit',
      'other',
      '其他居留许可（非 § 21）',
    ],
    [
      settlement,
      'de-route-R15-formerSpousePermanentTitle',
      'other',
      '其他（非永久）居留许可',
    ],
    [
      settlement,
      'de-route-R06-euMobility-periods-0-kind',
      undefined,
      '该期间的居留类别（§ 9b） *',
    ],
    [settlement, 'de-route-R11-childJudgments-0-kind', undefined, '裁判类型 *'],
    [
      settlement,
      'de-route-R18-freedom-subsequentTrips-0-nonTemporary',
      undefined,
      '本次离德在性质上属非暂时性原因（§ 4a Abs. 7 FreizügG/EU）',
    ],
    [citizenship, 'de-nat-historicalWorker-kind', undefined, '历史劳工类别 *'],
    [citizenship, 'de-nat-knowledge-kind', undefined, '知识证明方式 *'],
    [citizenship, 'de-nat-criminalRecord-kind', undefined, '刑事记录情形 *'],
    [fees, 'de-fees-courseExemption', 'ordinary', '未获免除，按普通标准分担'],
  ];
  for (const [render, id, value, zh] of cases) {
    const html = render('zh-CN');
    expect(value ? option(html, id, value) : label(html, id)).toBe(zh);
    expect(
      value ? option(render('en'), id, value) : label(render('en'), id),
    ).not.toMatch(
      /^missing|guest worker|contracted last working day|co-insurance|Registration evidence|without the required visa|licence is under review|retirement provision is not established|regulated work|first arrival on or after|Regelbedarfsstufe|Completed a recognised German school|lasting purpose|does not qualify under §§ 18a|Permit or document type|§ 51 Abs. 1 Nr. 6/,
    );
  }
  // Group headings are distinct too.
  const zh = settlement('zh-CN');
  expect(zh).toContain('自由流动居住期间及每段的权利依据');
  const r18 = zh.slice(
    zh.indexOf('<h2>自由流动永久居住权（§ 4a FreizügG/EU）</h2>'),
  );
  expect(r18).toContain('<h2>');
  expect(r18).not.toContain('跨欧盟居留与离欧区间明细');
});

test('the policy page shows the full-time work exception in months (review100-1 #3)', () => {
  for (const [locale, text] of [
    ['zh-CN', 'requiredMonths 20、windowMonths 24'],
    ['en', 'requiredMonths 20, windowMonths 24'],
  ] as const) {
    const html = renderToStaticMarkup(
      <LocaleContext value={{ locale, setLocale: () => {} }}>
        <GermanyPolicyPage />
      </LocaleContext>,
    );
    const row = html.match(
      /<tr data-parameter="citizenshipFullTime">(.*?)<\/tr>/,
    )?.[1];
    expect(row).toContain(text);
    expect(row).not.toMatch(/年|years/);
  }
});

test('answers hidden by deselected routes or earlier choices are not assessed or shared (review100-1 #6)', () => {
  const base = sampleDraft();
  // germanB1 is only asked for the Blue Card route.
  const r01 = { ...base, routes: ['R01'], germanB1: true } as GermanyDraft;
  r01.common = { ...r01.common, provenGerman: undefined };
  expect(activeGermanyAnswers(r01).germanB1).toBeUndefined();
  expect(condition(de.run(r01, 'zh-CN'), 'DE-R01', 'DE-C08')?.status).toBe(
    'UNKNOWN',
  );

  // Citizenship alone hides the common settlement step and its budget.
  const r07: GermanyDraft = {
    ...base,
    routes: ['R07'],
    citizenship: { withoutSgbIIorXII: true },
  };
  expect(activeGermanyAnswers(r07).common).toEqual({});
  expect(condition(de.run(r07, 'zh-CN'), 'DE-R07', 'DE-C49')?.status).toBe(
    'UNKNOWN',
  );
  expect(condition(de.run(base, 'zh-CN'), 'DE-R07', 'DE-C49')).toBeDefined();

  const pruned = activeGermanyAnswers({
    ...base,
    routes: ['R07', 'R18'],
    settlement: { ...base.settlement, childEducation: 'school' },
    citizenship: {
      incomeException: 'none',
      fullTime: { workingFullTimeNow: true, monthsInWindow: 24 },
      spouse: { status: 'continuing' },
      family: { relation: 'child' },
      discretionary: { accommodation: true },
      germanEvidence: 'B1',
    },
    fees: { reduction: 'ordinary', assessedFee: 20 },
  });
  expect(pruned.settlement).toEqual({});
  expect(pruned.citizenship).toEqual({
    incomeException: 'none',
    germanEvidence: 'B1',
  });
  expect(pruned.fees).toEqual({ reduction: 'ordinary' });

  // Stored answers only write each object's own fields.
  const minimal: GermanyDraft = {
    ...createGermanyDraft(),
    simulationDate: '2026-11-23',
    completed: true,
    step: 5,
    firstEntry: '2022-05-23',
    routes: ['R01'],
    permits: [{ kind: 'skilled', from: '2022-05-23' }],
  };
  const stored = JSON.parse(
    new TextDecoder().decode(
      Uint8Array.from(
        atob(
          encodeDraft(de, minimal).replaceAll('-', '+').replaceAll('_', '/'),
        ),
        (c) => c.charCodeAt(0),
      ),
    ),
  ).draft;
  expect(stored.settlement).toEqual({});
  expect(stored.mobility).toEqual({});
  expect(stored.permits).toEqual([
    { kind: 'skilled', from: '2022-05-23', renewing: null },
  ]);
  expect(decodeDraft(de, encodeDraft(de, minimal))).toEqual(
    activeGermanyAnswers(minimal),
  );
  expect(encodeDraft(de, minimal).length).toBeLessThan(1000);
});

test('What-if validates facts against the new date and each knob changes only its own answers (review100-1 #5)', () => {
  const draft = sampleDraft();
  const knobs = de.whatif.initial(draft);
  const compare = (next: Partial<typeof knobs>, from = draft) =>
    de.run(
      de.whatif.apply(from, { ...de.whatif.initial(from), ...next }),
      'zh-CN',
    );

  // An earlier date conflicts with the first entry: the date control explains it.
  expect(
    de.whatif.validate(
      de.whatif.apply(draft, { ...knobs, simulationDate: '2022-01-01' }),
      { ...knobs, simulationDate: '2022-01-01' },
    ),
  ).toEqual({ date: 'de.whatif.factAfterDate' });

  // A score replaces a pending or school knowledge answer.
  const pending: GermanyDraft = {
    ...draft,
    common: {
      ...draft.common,
      knowledgeEvidence: 'pending',
      orientationScore: undefined,
    },
  };
  expect(condition(de.run(pending, 'zh-CN'), 'DE-R01', 'DE-C09')?.status).toBe(
    'UNKNOWN',
  );
  expect(
    condition(compare({ orientationScore: 30 }, pending), 'DE-R01', 'DE-C09')
      ?.status,
  ).toBe('MET');

  // Settlement and citizenship knobs are separate, so step 4 can change on its own.
  expect(knobs).toMatchObject({
    provenGerman: 'B1',
    livelihoodConfirmed: true,
    natGerman: undefined,
    // The household budget answers C49 until a value is chosen.
    natLivelihood: 'mixed',
  });
  expect(
    condition(de.run(draft, 'zh-CN'), 'DE-R07', 'DE-C49')?.status,
  ).not.toBe('MET');
  expect(
    condition(compare({ natLivelihood: true }), 'DE-R07', 'DE-C49')?.status,
  ).toBe('MET');
  const natural = compare({ natLivelihood: true, natGerman: 'B1' });
  expect(condition(natural, 'DE-R07', 'DE-C49')?.status).toBe('MET');
  expect(condition(natural, 'DE-R07', 'DE-C50')?.status).toBe('MET');
  expect(de.whatif.focusForRule('DE-C49', 'DE-R07')).toBe('natLivelihood');
  expect(de.whatif.focusForRule('DE-C50', 'DE-R07')).toBe('natGerman');
  expect(de.whatif.focusForRule('DE-C51', 'DE-R07')).toBe('natKnowledge');

  // Clearing livelihood also clears the benefit classification.
  const refused: GermanyDraft = {
    ...draft,
    common: {
      ...draft.common,
      livelihoodConfirmed: false,
      benefits: 'disqualifying-entitlement',
      household: undefined,
    },
  };
  expect(condition(de.run(refused, 'zh-CN'), 'DE-R01', 'DE-C03')?.status).toBe(
    'NOT_MET',
  );
  expect(
    condition(
      compare({ livelihoodConfirmed: undefined }, refused),
      'DE-R01',
      'DE-C03',
    )?.status,
  ).toBe('UNKNOWN');

  // Blue Card months keep the itemised employment, so the job check is unchanged.
  const blue: GermanyDraft = {
    ...createGermanyDraft(),
    completed: true,
    step: 3,
    simulationDate: '2026-11-23',
    firstEntry: '2023-01-01',
    routes: ['R03'],
    permits: [{ kind: 'blue-card', from: '2023-01-01' }],
    trips: [],
    mobility: {
      blueCard: {
        employment: [
          {
            firstMonth: '2023-01',
            lastMonth: '2025-12',
            startedOn: '2023-01-01',
            endedOn: '2025-12-31',
            countableAnnualGross: 60000,
            qualifyingWork: true,
            pensionForSameMonths: true,
          },
        ],
      },
    },
  };
  expect(condition(de.run(blue, 'zh-CN'), 'DE-R03', 'DE-C21-job')?.status).toBe(
    'NOT_MET',
  );
  const months = de.whatif.apply(blue, {
    ...de.whatif.initial(blue),
    blueCardMonths: 27,
  });
  expect(months.mobility?.blueCard?.employment).toHaveLength(1);
  expect(
    condition(de.run(months, 'zh-CN'), 'DE-R03', 'DE-C21-job')?.status,
  ).toBe('NOT_MET');
});

test('What-if clears date-bound confirmations, reads route-specific answers and shows knobs for the chosen routes (review100-1 risks 1, 5, suggestion 2)', () => {
  const draft: GermanyDraft = {
    ...sampleDraft(),
    routes: ['R01', 'R03', 'R07'],
    mobility: {
      titles: [
        {
          kind: 'skilled',
          validTo: null,
          continuingUnder81: true,
          noOtherLossEvent: true,
        },
      ],
      blueCard: { cardHeldAtDecision: true, language: 'C1' },
    },
  };
  const knobs = de.whatif.initial(draft);
  const same = de.whatif.apply(draft, knobs);
  expect(same.mobility?.titles?.[0]).toMatchObject({
    validTo: null,
    continuingUnder81: true,
  });
  expect(same.mobility?.blueCard?.cardHeldAtDecision).toBe(true);
  const later = de.whatif.apply(draft, {
    ...knobs,
    simulationDate: '2027-06-01',
  });
  expect(later.mobility?.titles?.[0].validTo).toBeUndefined();
  expect(later.mobility?.titles?.[0].continuingUnder81).toBeUndefined();
  expect(later.mobility?.blueCard?.cardHeldAtDecision).toBeUndefined();

  // Different German levels for R01 and the Blue Card keep both answers.
  expect(knobs.provenGerman).toBe('mixed');
  expect(same.common?.provenGerman).toBe('B1');
  expect(same.mobility?.blueCard?.language).toBe('C1');
  const unified = de.whatif.apply(draft, { ...knobs, provenGerman: 'B2' });
  expect(unified.common?.provenGerman).toBe('B2');
  expect(unified.mobility?.blueCard?.language).toBe('B2');

  // Route-specific livelihood answers are shown when only that route is chosen.
  const only = (routes: GermanyDraft['routes'], patch: Partial<GermanyDraft>) =>
    de.whatif.initial({ ...sampleDraft(), routes, common: {}, ...patch });
  expect(
    only(['R05'], {
      settlement: { refugeeIncome: { ordinaryDecision: 'accepted' } },
    }).livelihoodConfirmed,
  ).toBe(true);
  expect(
    only(['R11'], { settlement: { childSecureLivelihood: false } })
      .livelihoodConfirmed,
  ).toBe(false);
  expect(
    only(['R17'], {
      citizenship: {
        discretionary: { sustainableSupportIncludingInsurance: true },
      },
    }).natLivelihood,
  ).toBe(true);

  // Assuming no trips also clears foreign school days and periods outside the EU.
  const abroad: GermanyDraft = {
    ...sampleDraft(),
    routes: ['R06', 'R11'],
    settlement: {
      childForeignSchoolDays: 40,
      euMobility: {
        periods: [
          { kind: 'other-eu-blue', from: '2021-01-01', until: '2022-01-01' },
          { kind: 'outside-eu', from: '2022-01-01', until: '2022-03-01' },
          { kind: 'german-blue', from: '2022-03-01', until: '2026-11-23' },
        ],
      },
    },
  };
  const noTrips = de.whatif.apply(abroad, {
    ...de.whatif.initial(abroad),
    noTrips: true,
  });
  expect(noTrips.settlement?.childForeignSchoolDays).toBe(0);
  expect(noTrips.settlement?.euMobility?.periods?.map((p) => p.kind)).toEqual([
    'other-eu-blue',
    'other-eu-blue',
    'german-blue',
  ]);

  // Knobs follow the selected routes.
  const controls = (routes: GermanyDraft['routes']) =>
    renderToStaticMarkup(
      <LocaleContext value={{ locale: 'zh-CN', setLocale: () => {} }}>
        <WhatIfView country={de} draft={{ ...sampleDraft(), routes }} />
      </LocaleContext>,
    );
  const r01 = controls(['R01']);
  expect(r01).toContain('id="de-whatif-livelihood"');
  expect(r01).not.toContain('id="de-whatif-nat-livelihood"');
  expect(r01).not.toContain('id="de-whatif-salary"');
  expect(r01).not.toContain('id="de-whatif-blue-card-months"');
  const r07 = controls(['R07']);
  expect(r07).toContain('id="de-whatif-nat-german"');
  expect(r07).not.toContain('id="de-whatif-german"');
  expect(r07).not.toContain('id="de-whatif-contributions"');
  expect(controls(['R03'])).toContain('id="de-whatif-salary"');
});

test('number lists start empty, report errors on the list and the questionnaire classes exist (review100-1 #9, risk 4)', () => {
  const draft = {
    ...sampleDraft(),
    step: 4,
    citizenship: { criminalRecord: { kind: 'fines', dayRates: [Number.NaN] } },
  } as unknown as GermanyDraft;
  const errors = validateGermanyStep(draft);
  expect(errors).toEqual({
    'de-nat-criminalRecord-dayRates': 'de.form.integerError',
  });
  const html = renderToStaticMarkup(
    <LocaleContext value={{ locale: 'zh-CN', setLocale: () => {} }}>
      {GermanySimulatePage().props.children({
        draft,
        errors,
        update: () => {},
      })}
    </LocaleContext>,
  );
  expect(html).toMatch(
    /<fieldset[^>]* id="de-nat-criminalRecord-dayRates" tabindex="-1" aria-invalid="true" aria-describedby="de-nat-criminalRecord-dayRates-error">/,
  );
  expect(html.split('请填写不小于 0 的整数。').length - 1).toBe(1);
  expect(html).toMatch(
    /<input id="de-nat-criminalRecord-dayRates-0" aria-invalid="true" aria-describedby="de-nat-criminalRecord-dayRates-error"[^>]* value=""/,
  );
  expect(html).toContain('<details open="" class="_evidence_');
  const sections = renderToStaticMarkup(
    <LocaleContext value={{ locale: 'zh-CN', setLocale: () => {} }}>
      {GermanySimulatePage().props.children({
        draft: { ...sampleDraft(), step: 3 },
        errors: {},
        update: () => {},
      })}
    </LocaleContext>,
  );
  expect(sections).toContain('<section class="_section_');

  // An unfinished empty row is not saved.
  const stored = storeGermanyAnswers({
    ...sampleDraft(),
    common: { housing: { householdAges: [5, Number.NaN] } },
  }) as GermanyDraft;
  expect(stored.common?.housing?.householdAges).toEqual([5]);
});

test('a German share link keeps the local draft, and result, edit and comparison links carry the scenario', () => {
  const storage = new Map<string, string>();
  vi.stubGlobal('localStorage', {
    getItem: (key: string) => storage.get(key) ?? null,
    setItem: (key: string, json: string) => storage.set(key, json),
  });
  const local: GermanyDraft = {
    ...createGermanyDraft(),
    simulationDate: '2026-10-01',
    routes: ['R07'],
  };
  draftStorage(de, local);
  const saved = storage.get('de-immigration-draft-v1');
  const shared = sampleDraft();
  const page = readPageResult(de, 'zh-CN', encodeDraft(de, shared));
  expect(page.shared).toBe(true);
  expect(page.draft?.simulationDate).toBe('2026-11-23');
  expect(storage.get('de-immigration-draft-v1')).toBe(saved);
  expect(draftStorage(de).draft).toMatchObject({
    simulationDate: '2026-10-01',
    routes: ['R07'],
  });
  expect(
    linkedResultDraft(de, `#draft=${encodeDraft(de, shared)}`)?.draft,
  ).toMatchObject({
    simulationDate: '2026-11-23',
    routes: ['R01', 'R02', 'R07'],
  });
});

test('skipping to the main content keeps the scenario fragment on Germany scenario pages', () => {
  const render = (path: string) => {
    vi.mocked(usePathname).mockReturnValue(path);
    return renderToStaticMarkup(
      <LocaleContext value={{ locale: 'zh-CN', setLocale: () => {} }}>
        <SiteShell>
          <main id="main">Content</main>
        </SiteShell>
      </LocaleContext>,
    );
  };
  for (const page of ['result', 'simulate', 'whatif']) {
    const html = render(`/germany/${page}`);
    expect(html).toContain('<button type="button"');
    expect(html).not.toContain('href="#main"');
  }
  expect(render('/germany/policy')).toContain('href="#main"');
});
