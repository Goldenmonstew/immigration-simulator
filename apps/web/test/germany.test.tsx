import { renderToStaticMarkup } from 'react-dom/server';
import { afterEach, expect, test, vi } from 'vitest';
import GermanyPage from '../app/germany/page';
import GermanyPolicyPage from '../app/germany/policy/page';
import GermanySimulatePage from '../app/germany/simulate/page';
import { GET as offlinePages } from '../app/offline-pages.json/route';
import sitemap from '../app/sitemap';
import { ResultView } from '../components/result-view';
import { WhatIfView } from '../components/whatif-lab';
import { LocaleContext } from '../i18n/locale';
import {
  activeGermanyAnswers,
  createGermanyDraft,
  decodeGermanyDraft,
  restoreStoredGermanyDraft,
  validateGermanyStep,
  type GermanyDraft,
} from '../lib/germany-draft';
import { germanyModule as de } from '../lib/germany-module';
import { decodeDraft, encodeDraft } from '../lib/share';
import { draftStorage, readScenarios, saveScenario } from '../lib/storage';
import { ukModule } from '../lib/uk-module';

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
          validTo: null,
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
