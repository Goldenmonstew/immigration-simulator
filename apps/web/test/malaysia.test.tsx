import { usePathname } from 'next/navigation';
import { renderToStaticMarkup } from 'react-dom/server';
import { afterEach, expect, test, vi } from 'vitest';
import {
  evaluateMalaysiaFull,
  type CountryPathway,
  type MyFullRequest,
  type MyPassKind,
} from '@uk-immigration/engine';
import { malaysiaFull2026_11 } from '@uk-immigration/policy-data';
import Home from '../app/page';
import { GET as offlinePages } from '../app/offline-pages.json/route';
import MalaysiaPage from '../app/malaysia/page';
import MalaysiaPolicyPage from '../app/malaysia/policy/page';
import MalaysiaSimulatePage from '../app/malaysia/simulate/page';
import { MalaysiaWhatIfControls } from '../app/malaysia/whatif/controls';
import sitemap from '../app/sitemap';
import { ResultView } from '../components/result-view';
import { SiteShell } from '../components/site-shell';
import { WhatIfView } from '../components/whatif-lab';
import { t, type TranslationKey } from '../i18n';
import { LocaleContext } from '../i18n/locale';
import { earliestLabelFor } from '../lib/country-module';
import { gapRules } from '../lib/gap-summary';
import {
  activeMalaysiaAnswers,
  clearHiddenMalaysiaAnswers,
  malaysiaRequest,
  malaysiaStepList,
  type MalaysiaDraft,
} from '../lib/malaysia-draft';
import {
  MY_TARGETS,
  malaysiaSteps,
  myPathwayByTarget,
  myTargetGroups,
  type MalaysiaField,
  type MyTarget,
} from '../lib/malaysia-fields';
import { malaysiaModule as my } from '../lib/malaysia-module';
import type { MalaysiaWhatIf } from '../lib/malaysia-whatif';
import { readPageResult } from '../lib/page-result';
import { decodeDraft, encodeDraft, linkedResultDraft } from '../lib/share';
import { draftStorage } from '../lib/storage';
import { diffPathways } from '../lib/whatif';
import { ukModule } from '../lib/uk-module';
import { portugalModule } from '../lib/portugal-module';

vi.mock('next/navigation', () => ({ usePathname: vi.fn() }));
afterEach(() => {
  vi.unstubAllGlobals();
  vi.mocked(usePathname).mockReset();
});

const render = (node: React.ReactNode, locale: 'zh-CN' | 'en' = 'zh-CN') =>
  renderToStaticMarkup(
    <LocaleContext value={{ locale, setLocale: () => {} }}>
      {node}
    </LocaleContext>,
  );
const step = (draft: MalaysiaDraft, errors = my.validateStep(draft)) =>
  render(
    MalaysiaSimulatePage().props.children({
      draft,
      errors,
      update: () => {},
    }),
  );
const pathways = (draft: MalaysiaDraft, locale: 'zh-CN' | 'en' = 'zh-CN') =>
  my.run(draft, locale).columns[0].pathways;
const pathway = (
  draft: MalaysiaDraft,
  target: MyTarget,
  locale: 'zh-CN' | 'en' = 'zh-CN',
) =>
  pathways(draft, locale).find(
    (item) => item.id === myPathwayByTarget[target],
  )!;
const check = (assessed: CountryPathway, id: string) =>
  assessed.checks.find((item) => item.id === id)!;

// The end-to-end scenario: a permanent resident since 2017 applying for
// naturalisation, who also holds an Employment Pass salary of RM12,000.
function naturalisationDraft(
  targets: MyTarget[] = ['cit-naturalisation', 'pass-employment'],
): MalaysiaDraft {
  return {
    ...my.createDraft(),
    step: 0,
    completed: true,
    simulationDate: '2026-11-25',
    targets,
    nationality: 'CN',
    dateOfBirth: '1985-06-01',
    passes: [],
    trips: [],
    criminalRecord: 'none',
    language: { malay: 'good' },
    citizenship: {
      prHeld: true,
      permanentResidentSince: '2017-03-01',
      intendsToResidePermanently: 'yes',
      qualifyingReferees: 2,
      renounceOtherNationality: 'yes',
      completeTravelRecords: true,
      taxReturnsFiveYears: true,
      inFederationOnMerdekaDay: false,
    },
    work: { basicMonthlySalaryRm: 12_000 },
  };
}

// A citizen's wife on the spouse pass since 2021, married in 2015.
function wifeDraft(
  targets: MyTarget[] = ['pr-wife', 'rp-family', 'pass-spouse'],
): MalaysiaDraft {
  return {
    ...my.createDraft(),
    step: 0,
    completed: true,
    simulationDate: '2026-11-25',
    targets,
    nationality: 'US',
    dateOfBirth: '1988-04-01',
    passportExpiry: '2030-01-01',
    passes: [{ kind: 'ltsvp-spouse', from: '2021-01-01', to: '2027-12-31' }],
    family: {
      tie: 'wife-of-citizen',
      marriedOn: '2015-01-01',
      marriageRegistration: 'malaysia',
      separated: false,
      divorced: false,
    },
    citizenSponsor: true,
    residencePassSponsor: true,
    citizenReferees: 2,
    immigrationRecord: 'clear',
    criminalRecord: 'none',
    prRefused: false,
    evidence: { sponsorIncome: true },
    language: { malay: 'moderate', english: 'good' },
  };
}

test.each(['zh-CN', 'en'] as const)(
  'Malaysia home and hub card describe the routes in %s',
  (locale) => {
    const hub = render(<Home />, locale);
    expect(hub).toContain('href="/malaysia"');
    expect(hub).toContain(t('hub.my.desc', locale));
    expect(hub).toContain(t('my.name', locale));
    const html = render(<MalaysiaPage />, locale);
    expect(html).toContain('href="/malaysia/simulate"');
    expect(html).toContain('href="/malaysia/policy"');
    expect(html).toContain(t('my.title', locale));
    expect(html).toContain(t('my.privacy', locale));
  },
);

test('all five Malaysia pages are in the offline list and sitemap', async () => {
  const offline = await offlinePages().json();
  const paths = sitemap().map(({ url }) => new URL(url).pathname);
  for (const sub of ['', '/simulate', '/result', '/whatif', '/policy']) {
    expect(offline).toContain('/malaysia' + sub);
    expect(paths.some((path) => path.endsWith('/malaysia' + sub))).toBe(true);
  }
});

test('every question, option, section, step and route has text in both languages', () => {
  const keys = new Set<string>(['my.form.scope', 'my.form.stateless']);
  const collect = (fields: MalaysiaField[]) => {
    for (const field of fields) {
      keys.add(`my.field.${field.label}`);
      if (field.hint) keys.add(`my.hint.${field.hint}`);
      if (field.type === 'choice')
        for (const option of field.options)
          keys.add(`my.option.${field.set}.${option}`);
      if (field.type === 'list') collect(field.fields);
    }
  };
  for (const { title, sections } of malaysiaSteps) {
    keys.add(title);
    for (const section of sections) {
      if (!['basics', 'passes', 'trips'].includes(section.id))
        keys.add(`my.section.${section.id}`);
      collect(section.fields);
    }
  }
  for (const target of MY_TARGETS) keys.add(`my.target.${target}`);
  for (const group of Object.keys(myTargetGroups))
    keys.add(`my.targetGroup.${group}`);
  expect(Object.values(myTargetGroups).flat().sort()).toEqual(
    [...MY_TARGETS].sort(),
  );
  for (const key of keys)
    for (const locale of ['zh-CN', 'en'] as const) {
      const text = t(key as TranslationKey, locale);
      expect(text, `${key} ${locale}`).toBeTruthy();
      expect(text, `${key} ${locale}`).not.toBe(key);
    }
});

test('steps follow the routes that read their answers', () => {
  const draft = my.createDraft();
  const steps = (targets: MyTarget[]) =>
    malaysiaStepList({ ...draft, targets }).map(({ step }) => step);
  expect(steps([])).toEqual([0]);
  expect(steps(['pass-pvip'])).toEqual([0]);
  expect(steps(['cit-naturalisation'])).toEqual([0, 1, 3, 5]);
  expect(steps(['cit-child'])).toEqual([0, 2, 5]);
  expect(steps(['pr-wife'])).toEqual([0, 1, 2, 3]);
  expect(steps(['pr-rep'])).toEqual([0, 2, 3, 4]);
  expect(steps(['pass-spouse'])).toEqual([0, 2, 3]);
  expect(steps(['pass-mm2h', 'pass-rpt'])).toEqual([0, 1, 6]);
  expect(steps([...MY_TARGETS])).toEqual([0, 1, 2, 3, 4, 5, 6]);
});

test('each step requires its own answers and tells unanswered lists from confirmed none', () => {
  const fresh = { ...my.createDraft(), simulationDate: '' };
  expect(fresh.passes).toBeUndefined();
  expect(fresh.trips).toBeUndefined();
  expect(my.validateStep(fresh)).toEqual({
    'my-simulationDate': 'my.form.required',
    'my-targets': 'my.form.routeError',
  });
  const history: MalaysiaDraft = {
    ...naturalisationDraft(),
    step: 1,
    passes: undefined,
    trips: undefined,
  };
  expect(my.validateStep(history)).toEqual({
    'my-passes': 'my.form.listRequired',
    'my-trips': 'my.form.listRequired',
  });
  expect(
    my.validateStep({
      ...history,
      passes: [{ kind: 'employment', from: '2022-01-01', to: '2021-01-01' }],
      trips: [{ departed: '2024-02-10' } as never],
    }),
  ).toEqual({
    'my-passes-0-to': 'my.error.order',
    'my-trips-0-returned': 'my.form.required',
  });
  expect(my.validateStep({ ...history, passes: [], trips: [] })).toEqual({});

  // Unanswered stays open; confirmed none is a fact the engine can judge.
  const was = { ...wifeDraft(['pr-was']), family: { tie: 'none' as const } };
  const qualifying = (passes?: MalaysiaDraft['passes']) =>
    check(pathway({ ...was, passes }, 'pr-was'), 'my.pr.qualifying-pass');
  expect(malaysiaRequest({ ...was, passes: undefined }, 'zh-CN').passes).toBe(
    undefined,
  );
  expect(qualifying(undefined).status).toBe('UNKNOWN');
  expect(qualifying([]).status).toBe('NOT_MET');

  expect(
    my.validateStep({
      ...naturalisationDraft(),
      step: 0,
      dateOfBirth: '2027-01-01',
    }),
  ).toEqual({ 'my-dateOfBirth': 'my.error.afterSimulation' });
  const records: MalaysiaDraft = { ...wifeDraft(), step: 3, prRefused: true };
  expect(my.validateStep(records)).toEqual({
    'my-prRefusedOn': 'my.form.required',
  });
  expect(
    my.validateStep({
      ...records,
      prRefusedOn: '2026-12-01',
      citizenReferees: 1.5,
    }),
  ).toEqual({
    'my-prRefusedOn': 'my.error.afterSimulation',
    'my-citizenReferees': 'my.error.integer',
  });
  expect(my.validateStep({ ...records, prRefusedOn: '2026-01-01' })).toEqual(
    {},
  );
  expect(
    my.validateStep({
      ...naturalisationDraft(),
      step: 5,
      citizenship: { prHeld: true },
    }),
  ).toEqual({ 'my-citizenship-permanentResidentSince': 'my.form.required' });
  expect(
    my.validateStep({
      ...naturalisationDraft(),
      step: 6,
      work: { basicMonthlySalaryRm: -1 },
    }),
  ).toEqual({ 'my-work-basicMonthlySalaryRm': 'my.error.number' });
});

test('the questionnaire renders the fields the end-to-end flow uses', () => {
  const draft = naturalisationDraft();
  const first = step({ ...draft, step: 0 });
  for (const id of [
    'my-simulationDate',
    'my-nationality',
    'my-dateOfBirth',
    'my-targets',
    'my-target-cit-naturalisation',
    'my-target-pass-employment',
    'my-target-pr-wife',
  ])
    expect(first).toContain(`id="${id}"`);
  // Passport validity is asked only for routes that read it.
  expect(first).not.toContain('id="my-passportExpiry"');
  expect(first).toMatch(/<option value="CN"[^>]*>中国<\/option>/);
  expect(first).toContain(
    `<option value="stateless">${t('my.form.stateless')}</option>`,
  );
  expect(first).not.toContain('<option value="MY">');
  expect(step({ ...draft, step: 0, targets: ['pr-wife'] })).toContain(
    'id="my-passportExpiry"',
  );
  const history = step({
    ...draft,
    step: 1,
    passes: undefined,
    trips: undefined,
  });
  expect(history).toContain('id="my-passes"');
  expect(history).toContain('id="my-trips"');
  expect(history).toContain(t('my.form.noRecords'));
  expect(history).not.toContain(t('my.form.emptyConfirmed'));
  expect(history).toContain(`${t('my.form.add')} · ${t('my.field.passes')}`);
  const rows = step({
    ...draft,
    step: 1,
    passes: [{ kind: 'employment', from: '2014-01-01', to: '2028-12-31' }],
  });
  for (const id of ['my-passes-0-kind', 'my-passes-0-from', 'my-passes-0-to'])
    expect(rows).toContain(`id="${id}"`);
  // The trips were confirmed as none.
  expect(rows).toContain(t('my.form.emptyConfirmed'));
  const records = step({ ...draft, step: 3 });
  expect(records).toContain('id="my-criminalRecord"');
  expect(records).toContain('id="my-language-malay"');
  // Only the permanent residence routes read these.
  expect(records).not.toContain('id="my-immigrationRecord"');
  expect(records).not.toContain('id="my-language-english"');
  expect(records).toContain(t('my.hint.sensitive'));
  const citizenship = step({ ...draft, step: 5 });
  for (const id of [
    'my-citizenship-prHeld',
    'my-citizenship-permanentResidentSince',
    'my-citizenship-intendsToResidePermanently',
    'my-citizenship-qualifyingReferees',
    'my-citizenship-renounceOtherNationality',
    'my-citizenship-completeTravelRecords',
    'my-citizenship-taxReturnsFiveYears',
    'my-citizenship-inFederationOnMerdekaDay',
  ])
    expect(citizenship).toContain(`id="${id}"`);
  expect(citizenship).toContain(t('my.hint.permanentResidentSince'));
  expect(
    step({ ...draft, step: 5, citizenship: { prHeld: false } }),
  ).not.toContain('id="my-citizenship-permanentResidentSince"');
  const work = step({ ...draft, step: 6 });
  expect(work).toContain('id="my-work-basicMonthlySalaryRm"');
  expect(work).not.toContain('id="my-mm2h-category"');
  // Separation and divorce are separate questions; sponsors by route.
  const family = step({ ...wifeDraft(), step: 2 });
  for (const id of [
    'my-family-tie',
    'my-family-marriedOn',
    'my-family-marriageRegistration',
    'my-family-separated',
    'my-family-divorced',
    'my-citizenSponsor',
    'my-residencePassSponsor',
  ])
    expect(family).toContain(`id="${id}"`);
  expect(family).not.toContain('id="my-family-childRelation"');
  const rep = step({
    ...wifeDraft(['pr-rep', 'pr-was']),
    step: 4,
    rep: { relation: 'child' },
  });
  expect(rep).toContain('id="my-rep-participantSponsor"');
  expect(rep).toContain('id="my-was-citizenSponsor"');
  expect(rep).not.toContain('id="my-rep-marriedBeforeRepApplication"');
});

test('separation and divorce, permanent residence and refusals reach the engine as answered', () => {
  const draft = wifeDraft();
  // review114-1 risk 2: the engine reads separation and divorce apart.
  const family = (separated?: boolean, divorced?: boolean) =>
    malaysiaRequest(
      { ...draft, family: { ...draft.family, separated, divorced } },
      'zh-CN',
    ).family;
  expect(family(false, true)).toMatchObject({
    separated: false,
    divorced: true,
  });
  expect(family(true, false)).toMatchObject({
    separated: true,
    divorced: false,
  });
  expect(family(undefined, undefined)).not.toHaveProperty('separated');
  const category = (separated?: boolean, divorced?: boolean) =>
    check(
      pathway(
        {
          ...wifeDraft(['cit-wife']),
          family: { ...draft.family, separated, divorced },
        },
        'cit-wife',
      ),
      'my.cit.category',
    );
  expect(category(false, false).status).toBe('MET');
  expect(category(false, true).status).toBe('NOT_MET');
  expect(category(false, true).explanation).not.toContain('未区分');
  expect([
    category(true, false).status,
    category(true, false).pendingDetails,
  ]).toEqual(['UNKNOWN', ['PD-405']]);

  const request = malaysiaRequest(draft, 'en');
  expect(request.previousPrRefusalOn).toBeNull();
  expect(request.pathways).toEqual([
    'my.pr.wife',
    'my.rp.family',
    'my.pass.spouse-ltsvp',
  ]);
  expect(request.locale).toBe('en');
  expect(
    malaysiaRequest(
      { ...draft, prRefused: true, prRefusedOn: '2026-01-01' },
      'en',
    ).previousPrRefusalOn,
  ).toBe('2026-01-01');
  expect(
    malaysiaRequest({ ...draft, prRefused: undefined }, 'en')
      .previousPrRefusalOn,
  ).toBeUndefined();

  const nat = naturalisationDraft();
  const since = (citizenship: MalaysiaDraft['citizenship']) =>
    malaysiaRequest({ ...nat, citizenship }, 'zh-CN').citizenship
      ?.permanentResidentSince;
  expect(since(nat.citizenship)).toBe('2017-03-01');
  expect(since({ prHeld: false })).toBeNull();
  expect(since({ prHeld: true })).toBeUndefined();
  expect(since({})).toBeUndefined();
  // Blank answers are not sent as facts.
  const blank = malaysiaRequest(
    { ...my.createDraft(), targets: ['pr-wife'] },
    'zh-CN',
  );
  expect(blank.family).toEqual({});
  expect(blank.previousPrRefusalOn).toBeUndefined();
  expect(blank.passes).toBeUndefined();
  expect(blank.citizenSponsor).toBeUndefined();
});

test('answers for routes or branches the user left are not assessed or shared', () => {
  const draft: MalaysiaDraft = {
    ...naturalisationDraft(['cit-naturalisation']),
    mm2h: { category: 'gold', fixedDepositUsd: 500_000 },
    immigrationRecord: 'listed',
    family: { tie: 'none', marriedOn: '2015-01-01' },
    work: { basicMonthlySalaryRm: 12_000 },
  };
  const active = activeMalaysiaAnswers(draft);
  expect(active.mm2h).toEqual({});
  expect(active.work).toEqual({});
  expect(active.family).toEqual({});
  expect(active.immigrationRecord).toBeUndefined();
  expect(active.citizenship).toEqual(draft.citizenship);
  const shared = decodeDraft(my, encodeDraft(my, draft));
  expect(shared?.mm2h).toEqual({});
  expect(shared?.immigrationRecord).toBeUndefined();
  // Within a shown record, a question hidden by another answer is left out.
  const wife: MalaysiaDraft = {
    ...wifeDraft(['pr-wife']),
    family: { tie: 'none', marriedOn: '2015-01-01', separated: true },
  };
  expect(activeMalaysiaAnswers(wife).family).toEqual({ tie: 'none' });
});

// review114-1 problem 1 and risk 3: the REP route reads the marriage and the
// child relationship by its own relation, whatever the tie answer is.
test('the REP relation shows the marriage and child questions it needs', () => {
  const rep = (
    relation: 'wife' | 'husband' | 'child',
    family: MalaysiaDraft['family'],
  ): MalaysiaDraft => ({
    ...my.createDraft(),
    simulationDate: '2026-11-25',
    completed: true,
    targets: ['pr-rep'],
    dateOfBirth: '2015-01-01',
    family,
    rep: {
      relation,
      participantHasSatk: true,
      approvalLetterValidUntil: '2027-06-01',
      marriedBeforeRepApplication: true,
      participantSponsor: true,
      referees: 2,
    },
  });
  const married = {
    marriedOn: '2015-01-01',
    separated: false,
    divorced: false,
  } as const;
  const category = (draft: MalaysiaDraft) =>
    check(pathway(draft, 'pr-rep'), 'my.pr.category');
  // The tie is left blank, set to none, or names another relationship.
  for (const tie of [undefined, 'none', 'child-of-citizen'] as const) {
    const wife = rep('wife', { tie, ...married });
    expect(activeMalaysiaAnswers(wife).family).toMatchObject(married);
    const html = step({ ...wife, step: 2 });
    for (const name of ['marriedOn', 'separated', 'divorced'])
      expect(html, `${tie} ${name}`).toContain(`id="my-family-${name}"`);
    expect(category(wife).status, String(tie)).toBe('MET');
    expect(
      check(pathway(wife, 'pr-rep'), 'my.pr.marriage-duration').status,
    ).toBe('MET');
    // Changing the tie does not clear what the REP route still reads.
    expect(clearHiddenMalaysiaAnswers(wife).family).toEqual(wife.family);
  }
  for (const tie of [undefined, 'none', 'wife-of-citizen'] as const) {
    const child = rep('child', { tie, childRelation: 'biological' });
    expect(activeMalaysiaAnswers(child).family.childRelation).toBe(
      'biological',
    );
    const html = step({ ...child, step: 2 });
    expect(html, String(tie)).toContain('id="my-family-childRelation"');
    // A child does not need the marriage questions.
    expect(html).not.toContain('id="my-family-marriedOn"');
    expect(category(child).status, String(tie)).toBe('MET');
  }
  // Without the REP route, the tie alone decides.
  const wife = {
    ...rep('wife', { tie: 'none', ...married }),
    targets: ['rp-family'] as MyTarget[],
  };
  expect(activeMalaysiaAnswers(wife).family).toEqual({ tie: 'none' });
});

test('a changed answer clears the sub-answers it hides, but not those of other routes', () => {
  const draft: MalaysiaDraft = {
    ...wifeDraft(['pr-wife', 'pass-de-rantau']),
    prRefused: false,
    prRefusedOn: '2025-01-01',
    family: { tie: 'none', marriedOn: '2015-01-01', divorced: true },
    deRantau: { workType: 'remote-employee', foreignClients: true },
    citizenship: { prHeld: false, permanentResidentSince: '2017-01-01' },
    mm2h: { category: 'gold' },
  };
  const cleared = clearHiddenMalaysiaAnswers(draft);
  expect(cleared.prRefusedOn).toBeUndefined();
  expect('prRefusedOn' in cleared).toBe(false);
  expect(cleared.family).toEqual({ tie: 'none' });
  expect(cleared.deRantau).toEqual({ workType: 'remote-employee' });
  // Citizenship and MM2H are not shown for these routes, so they stay.
  expect(cleared.citizenship).toEqual(draft.citizenship);
  expect(cleared.mm2h).toEqual({ category: 'gold' });
  expect(clearHiddenMalaysiaAnswers(wifeDraft())).toEqual(wifeDraft());
});

test('unfinished drafts with value errors reopen as they were, finished ones at the step to fix', () => {
  const progress: MalaysiaDraft = {
    ...naturalisationDraft(),
    completed: false,
    step: 1,
    passes: [{ kind: 'employment', from: '2022-01-01', to: '2021-01-01' }],
    trips: [{ departed: '2025-05-01', returned: '2025-04-01' }],
  };
  expect(my.decodeDraft(progress)).toEqual(progress);
  expect(my.validateStep(progress)).toEqual({
    'my-passes-0-to': 'my.error.order',
    'my-trips-0-returned': 'my.error.order',
  });
  const numbers: MalaysiaDraft = {
    ...naturalisationDraft(),
    completed: false,
    citizenship: {
      ...naturalisationDraft().citizenship,
      qualifyingReferees: 1.5,
    },
    dateOfBirth: '2030-01-01',
  };
  expect(my.decodeDraft(numbers)).toEqual(numbers);
  // A stored draft that does not decode is not replaced by the shell: the
  // shell only writes what it restored.
  const storage = new Map<string, string>();
  vi.stubGlobal('localStorage', {
    getItem: (key: string) => storage.get(key) ?? null,
    setItem: (key: string, json: string) => storage.set(key, json),
  });
  draftStorage(my, progress);
  expect(my.decodeDraft(draftStorage(my).draft)).toEqual(progress);

  const broken = { ...progress, completed: true, step: 6 };
  expect(my.decodeDraft(broken, true)).toBeUndefined();
  expect(my.decodeDraft(broken, 'show-correction')).toMatchObject({
    completed: false,
    step: 1,
  });
  expect(my.restoreStoredDraft!(broken)).toMatchObject({
    completed: false,
    step: 1,
  });
  // Answers hidden by leaving a route do not hold a finished result back.
  const left: MalaysiaDraft = {
    ...naturalisationDraft(['pass-employment']),
    trips: [{ departed: '2025-05-01', returned: '2025-04-01' }],
  };
  expect(my.decodeDraft(left, true)).toEqual(left);
});

test('drafts round-trip in their country envelope and reject other countries', () => {
  const draft = naturalisationDraft();
  const encoded = encodeDraft(my, draft);
  expect(decodeDraft(my, encoded)).toEqual(activeMalaysiaAnswers(draft));
  expect(decodeDraft(ukModule, encoded)).toBeUndefined();
  expect(decodeDraft(portugalModule, encoded)).toBeUndefined();
  expect(
    decodeDraft(my, encodeDraft(ukModule, ukModule.createDraft())),
  ).toBeUndefined();
  expect(
    decodeDraft(my, encodeDraft(portugalModule, portugalModule.createDraft())),
  ).toBeUndefined();
  // A bare draft without an envelope is never read as Malaysian.
  const bare = btoa(JSON.stringify(draft))
    .replaceAll('+', '-')
    .replaceAll('/', '_')
    .replace(/=+$/, '');
  expect(decodeDraft(my, bare)).toBeUndefined();
  const fresh = my.createDraft();
  expect(my.decodeDraft(fresh)).toEqual(fresh);
  expect(my.decodeDraft({ ...draft, targets: ['mars'] })).toBeUndefined();
  expect(my.decodeDraft({ ...draft, version: 2 })).toBeUndefined();
  expect(
    my.decodeDraft({ ...draft, citizenship: { prHeld: 'yes' } }),
  ).toBeUndefined();
  // Nationality is an ISO code from the list, or stateless.
  for (const nationality of [7, 'ZZ', 'MY'])
    expect(my.decodeDraft({ ...draft, nationality })).toBeUndefined();
  expect(my.decodeDraft({ ...draft, nationality: 'stateless' })).toBeDefined();
});

test('opening a Malaysian share link keeps the local draft and result links carry the scenario', () => {
  const storage = new Map<string, string>();
  vi.stubGlobal('localStorage', {
    getItem: (key: string) => storage.get(key) ?? null,
    setItem: (key: string, json: string) => storage.set(key, json),
  });
  const local: MalaysiaDraft = {
    ...my.createDraft(),
    simulationDate: '2026-10-01',
    nationality: 'JP',
  };
  draftStorage(my, local);
  const shared = naturalisationDraft();
  const page = readPageResult(my, 'zh-CN', encodeDraft(my, shared));
  expect(page.shared).toBe(true);
  expect(page.draft?.nationality).toBe('CN');
  expect(JSON.parse(storage.get('my-immigration-draft-v1')!)).toEqual(local);
  expect(draftStorage(my).draft).toEqual(local);
  expect(linkedResultDraft(my, `#draft=${encodeDraft(my, shared)}`)).toEqual({
    draft: activeMalaysiaAnswers(shared),
    resultHash: '',
  });
});

test.each(['result', 'simulate', 'whatif'])(
  'skipping to the main content on /malaysia/%s keeps the scenario fragment',
  (sub) => {
    vi.mocked(usePathname).mockReturnValue(`/malaysia/${sub}`);
    const html = render(
      <SiteShell>
        <main id="main" />
      </SiteShell>,
    );
    expect(html).toContain(`${t('site.skip')}</button>`);
    expect(html).not.toContain('href="#main"');
  },
);

test('results show only the chosen routes with their status and time dates', () => {
  const draft = naturalisationDraft();
  const [naturalisation, employment] = pathways(draft);
  expect(pathways(draft).map((p) => p.id)).toEqual([
    'my.cit.naturalisation',
    'my.pass.employment',
  ]);
  expect(naturalisation).toMatchObject({
    status: 'NOT_MET',
    timeStatus: 'FUTURE',
    timeEarliestDate: '2027-03-01',
    title: '公民身份：归化（宪法第 19 条）',
  });
  expect(check(naturalisation, 'my.cit.residence').status).toBe('NOT_MET');
  expect(employment).toMatchObject({
    status: 'MET',
    earliestDate: '2026-11-25',
  });
  expect(pathway(draft, 'cit-naturalisation', 'en').title).toBe(
    'Citizenship: naturalisation (Article 19)',
  );
  // A met time requirement is dated from the current unbroken period.
  const wife = pathway(wifeDraft(), 'pr-wife');
  expect(wife).toMatchObject({
    status: 'UNKNOWN',
    timeStatus: 'MET',
    timeEarliestDate: '2022-01-02',
  });
  expect(wife.summary).toContain(
    t('my.result.timeMetSince').replace('{date}', '2022-01-02'),
  );
  expect(wife.summary).not.toContain('。 ');
  expect(naturalisation.summary).not.toContain(
    t('my.result.timeMetSince').split('{date}')[0],
  );
  // Explanations never just repeat the condition title, and amounts are
  // grouped.
  const every = {
    ...wifeDraft([...MY_TARGETS]),
    ...naturalisationDraft([...MY_TARGETS]),
  };
  for (const locale of ['zh-CN', 'en'] as const)
    for (const assessed of pathways(every, locale))
      for (const item of assessed.checks) {
        expect(item.explanation.trim()).not.toBe(item.title);
        for (const quoted of [`「${item.title}」`, `“${item.title}”`])
          expect(item.explanation).not.toContain(quoted);
        expect(item.explanation).not.toMatch(/\b(RM|USD)\d{4,}\b/);
      }
  expect(check(naturalisation, 'my.cit.after-grant').explanation).toContain(
    'RM5,000',
  );
});

test('fees, approval terms and notes are labelled apart and left out of the gaps', () => {
  const every = {
    ...wifeDraft([...MY_TARGETS]),
    ...naturalisationDraft([...MY_TARGETS]),
  };
  const kinds = new Map<string, Set<string | undefined>>();
  for (const assessed of pathways(every)) {
    for (const item of assessed.checks) {
      const seen = kinds.get(item.id) ?? new Set();
      kinds.set(
        item.id,
        seen.add(item.applicable === false ? 'n/a' : item.kind),
      );
    }
    for (const gap of gapRules(assessed))
      expect(['requirement', 'time']).toContain(gap.kind);
  }
  expect(kinds.get('my.pr.fee')).toEqual(new Set(['budget']));
  expect(kinds.get('my.pass.security-bond')).toEqual(new Set(['budget']));
  expect(kinds.get('my.pr.after-approval')).toEqual(new Set(['afterApproval']));
  expect(kinds.get('my.cit.after-grant')).toEqual(new Set(['afterApproval']));
  expect(kinds.get('my.pr.processing')).toEqual(new Set(['information']));
  expect(kinds.get('my.pr.means')).toEqual(new Set(['factor']));
  expect(kinds.get('my.cit.residence')).toEqual(new Set(['time']));
  expect(kinds.get('my.pr.spouse-pass')).toEqual(new Set(['time']));
  expect(kinds.get('my.pr.passport')).toEqual(new Set(['requirement']));
  // Every check has a group.
  for (const [id, seen] of kinds) expect(seen.has(undefined), id).toBe(false);

  // Fees the official texts disagree on say so in the explanation.
  const wife = pathway({ ...wifeDraft(), nationality: 'JP' }, 'pass-spouse');
  const bond = check(wife, 'my.pass.security-bond');
  expect(bond).toMatchObject({ status: 'UNKNOWN', pendingDetails: ['PD-411'] });
  expect(bond.explanation).toContain('MDEC');
  const fee = check(pathway(wifeDraft(), 'pr-wife'), 'my.pr.fee');
  expect(fee).toMatchObject({ status: 'UNKNOWN', pendingDetails: ['PD-404'] });
  expect(fee.explanation).toContain('REP 指南写作每年');
});

// Only routes whose time requirements are dated from the current unbroken
// period show the application date under their own label.
test('date labels say what each route’s date is', () => {
  const own = new Set([
    'my.pr.wife',
    'my.pr.husband',
    'my.pr.child',
    'my.pr.was',
    'my.pr.rep-family',
    'my.rp.family',
    'my.pass.rpt',
  ]);
  for (const id of Object.values(myPathwayByTarget))
    expect(earliestLabelFor({ id } as CountryPathway, my.earliestLabel)).toBe(
      own.has(id) ? 'my.result.metOn' : 'result.earliest',
    );
  for (const locale of ['zh-CN', 'en'] as const) {
    const residence = pathway(wifeDraft(), 'rp-family', locale);
    expect(residence).toMatchObject({
      status: 'MET',
      earliestDate: '2026-11-25',
    });
    const html = render(
      <ResultView
        country={my}
        result={my.run(wifeDraft(), locale)}
        draft={wifeDraft()}
      />,
      locale,
    );
    expect(html).toContain(`<dt>${t('my.result.metOn', locale)}</dt>`);
    expect(html).toContain(`<dt>${t('result.earliest', locale)}</dt>`);
    expect(html).toContain(t('my.result.notice', locale));
  }
});

// review114-1 problem 3: once met, the citizenship routes date their time
// requirements on the application date, the other routes from when the
// current unbroken period began; the result note says which is which.
test('the result note tells the citizenship time date from the met-since date', () => {
  const draft = (simulationDate: string, target: MyTarget): MalaysiaDraft => ({
    ...naturalisationDraft([target]),
    simulationDate,
    family: { tie: 'wife-of-citizen', separated: false, divorced: false },
    citizenship: {
      ...naturalisationDraft().citizenship,
      permanentResidentSince: '2016-03-01',
    },
  });
  for (const target of ['cit-naturalisation', 'cit-wife'] as const) {
    expect(pathway(draft('2026-02-28', target), target)).toMatchObject({
      timeStatus: target === 'cit-wife' ? 'MET' : 'FUTURE',
    });
    expect(pathway(draft('2026-06-01', target), target)).toMatchObject({
      timeStatus: 'MET',
      timeEarliestDate: '2026-06-01',
    });
    expect(pathway(draft('2026-06-01', target), target).summary).not.toContain(
      t('my.result.timeMetSince').split('{date}')[0],
    );
  }
  expect(t('my.result.notice')).toContain('归化、公民之妻登记与公民子女登记');
  expect(t('my.result.notice')).toContain('模拟日期本身');
  expect(t('my.result.notice', 'en')).toContain(
    'naturalisation and registration as a citizen’s wife or child',
  );
});

// The values the end-to-end tests assert.
test('the result page shows the end-to-end scenario and links its gaps to the date control', () => {
  const draft = naturalisationDraft();
  const page = readPageResult(my, 'zh-CN', draft);
  const html = render(
    <ResultView country={my} result={page.result!} draft={page.draft} />,
  );
  expect(html).toContain('马来西亚现行规则');
  expect(html).toContain('公民身份：归化（宪法第 19 条）');
  expect(html).toContain('就业准证（Employment Pass）');
  expect(html).toContain(t('country.status.NOT_MET'));
  expect(html).toContain(
    t('country.status.FUTURE').replace('{date}', '2027-03-01'),
  );
  expect(html).toContain('<time dateTime="2027-03-01">2027-03-01</time>');
  const naturalisation = page.result!.columns[0].pathways[0];
  expect(gapRules(naturalisation)[0].id).toBe('my.cit.residence');
  expect(html).toContain('?focus=date');
  expect(html).toContain('PD-414');
  const en = render(
    <ResultView country={my} result={my.run(draft, 'en')} draft={page.draft} />,
    'en',
  );
  expect(en).toContain('Current Malaysian rules');
  expect(en).toContain(
    t('country.status.FUTURE', 'en').replace('{date}', '2027-03-01'),
  );
});

const knobChanges: Partial<MalaysiaWhatIf>[] = [
  { simulationDate: '2030-01-01' },
  { noTrips: true },
  { prSince: '2016-03-01' },
  { prSince: undefined },
  { salary: 30_000 },
  { deRantauIncome: 100_000 },
  { mm2hDeposit: 2_000_000 },
];

test('what-if controls only change their own answers, and never the routes or the person assessed', () => {
  const { whatif } = my;
  const draft: MalaysiaDraft = {
    ...wifeDraft([...MY_TARGETS]),
    ...naturalisationDraft([...MY_TARGETS]),
    trips: [{ departed: '2020-01-01', returned: '2020-12-01' }],
    deRantau: { talent: 'tech', annualIncomeUsd: 40_000 },
    mm2h: { category: 'gold', fixedDepositUsd: 100_000 },
  };
  const knobs = whatif.initial(draft);
  expect(knobs).toEqual({
    simulationDate: '2026-11-25',
    noTrips: false,
    prSince: '2017-03-01',
    salary: 12_000,
    deRantauIncome: 40_000,
    mm2hDeposit: 100_000,
  });
  // An untouched comparison keeps every answer and every route the same.
  const untouched = whatif.apply(draft, knobs);
  expect(untouched).toEqual(activeMalaysiaAnswers(draft));
  const before = pathways(draft);
  const after = pathways(untouched);
  before.forEach((item, i) =>
    expect(diffPathways(item, after[i]).changed, item.id).toBe(false),
  );
  for (const change of knobChanges) {
    const next = whatif.apply(draft, { ...knobs, ...change });
    expect(next.targets).toEqual(draft.targets);
    expect(next.family).toEqual(activeMalaysiaAnswers(draft).family);
    expect(next.dateOfBirth).toBe(draft.dateOfBirth);
    expect(next.nationality).toBe(draft.nationality);
    expect(pathways(next).map((p) => p.id)).toEqual(before.map((p) => p.id));
    expect(draft).toEqual({
      ...wifeDraft([...MY_TARGETS]),
      ...naturalisationDraft([...MY_TARGETS]),
      trips: [{ departed: '2020-01-01', returned: '2020-12-01' }],
      deRantau: { talent: 'tech', annualIncomeUsd: 40_000 },
      mm2h: { category: 'gold', fixedDepositUsd: 100_000 },
    });
  }
  expect(whatif.apply(draft, { ...knobs, noTrips: true }).trips).toEqual([]);
  expect(whatif.apply(draft, { ...knobs, salary: 30_000 }).work).toEqual({
    basicMonthlySalaryRm: 30_000,
  });
  // A MyPR date given where none is held assumes one.
  const noPr = {
    ...naturalisationDraft(['cit-naturalisation']),
    citizenship: { prHeld: false },
  };
  expect(whatif.initial(noPr).prSince).toBeUndefined();
  expect(
    whatif.apply(noPr, { ...whatif.initial(noPr), prSince: '2015-01-01' })
      .citizenship,
  ).toEqual({ prHeld: true, permanentResidentSince: '2015-01-01' });
});

// review114-1 problem 2: clearing the MyPR control returns to the
// questionnaire's answer, and its own errors stay on it.
test('clearing the MyPR date returns to the questionnaire answer', () => {
  const { whatif } = my;
  const held = naturalisationDraft(['cit-naturalisation']);
  const knobs = { ...whatif.initial(held), prSince: undefined };
  const cleared = whatif.apply(held, knobs);
  expect(cleared.citizenship).toEqual(held.citizenship);
  expect(whatif.validate(cleared, knobs)).toEqual({});
  const none = {
    ...held,
    citizenship: { ...held.citizenship, prHeld: false },
  };
  expect(
    whatif.apply(none, { ...whatif.initial(none), prSince: undefined })
      .citizenship,
  ).toEqual(activeMalaysiaAnswers(none).citizenship);
  for (const locale of ['zh-CN', 'en'] as const)
    expect(t('my.whatif.prSinceHint', locale)).toMatch(
      locale === 'en' ? /questionnaire/ : /问卷/,
    );
  // An invalid date is reported on the MyPR control, not the date.
  const bad = { ...whatif.initial(held), prSince: '2016-02-30' };
  const errors = whatif.validate(whatif.apply(held, bad), bad);
  expect(errors).toEqual({ prSince: 'my.error.date' });
  const html = render(
    <MalaysiaWhatIfControls
      afterDraft={activeMalaysiaAnswers(held)}
      knobs={bad}
      errors={errors}
      update={() => {}}
    />,
  );
  expect(html).toMatch(
    /id="my-whatif-pr-since" type="date" aria-invalid="true" aria-describedby="my-whatif-pr-since-hint prSince-error"/,
  );
  expect(html).toMatch(/id="my-whatif-date" type="date" aria-invalid="false"/);
});

test('changing the MyPR date moves the naturalisation date in the comparison', () => {
  const { whatif } = my;
  const draft = naturalisationDraft(['cit-naturalisation']);
  const knobs = { ...whatif.initial(draft), prSince: '2016-03-01' };
  const after = pathway(whatif.apply(draft, knobs), 'cit-naturalisation');
  expect(after).toMatchObject({
    timeStatus: 'MET',
    timeEarliestDate: '2026-11-25',
  });
  expect(whatif.validate(whatif.apply(draft, knobs), knobs)).toEqual({});
  for (const locale of ['zh-CN', 'en'] as const) {
    const html = render(<WhatIfView country={my} draft={draft} />, locale);
    expect(html).toContain(`<dt>${t('country.timeDate', locale)}</dt>`);
    expect(html).toContain(t('my.whatif.dateHint', locale));
    expect(html).toContain(t('whatif.unchanged', locale));
  }
  expect(whatif.focusForRule('my.cit.residence', 'my.cit.naturalisation')).toBe(
    'date',
  );
  expect(
    whatif.focusForRule('my.pass.salary-category', 'my.pass.employment'),
  ).toBe('salary');
  expect(whatif.focusForRule('my.pr.fee', 'my.pr.wife')).toBeUndefined();
  expect(
    whatif.validate(draft, { ...whatif.initial(draft), simulationDate: 'x' }),
  ).toEqual({ date: 'my.error.date' });
  expect(
    whatif.validate(draft, { ...whatif.initial(draft), salary: -1 }),
  ).toEqual({ salary: 'my.error.number' });
  // A date before the birth date no longer fits the questionnaire.
  const early = { ...whatif.initial(draft), simulationDate: '1980-01-01' };
  expect(whatif.validate(whatif.apply(draft, early), early)).toEqual({
    date: 'my.error.afterSimulation',
  });
});

test('each control shows only for the routes that read it', () => {
  const controls = (targets: MyTarget[], trips?: MalaysiaDraft['trips']) => {
    const draft = { ...naturalisationDraft(targets), trips };
    return render(
      <MalaysiaWhatIfControls
        afterDraft={activeMalaysiaAnswers(draft)}
        knobs={my.whatif.initial(draft)}
        errors={{}}
        update={() => {}}
      />,
    );
  };
  const ids = my.whatif.focusControls;
  const pvip = controls(['pass-pvip']);
  expect(pvip).toContain(`id="${ids.date}"`);
  for (const id of [
    ids.trips,
    ids.prSince,
    ids.salary,
    ids.deRantauIncome,
    ids.mm2hDeposit,
  ])
    expect(pvip).not.toContain(`id="${id}"`);
  const every = controls([...MY_TARGETS], []);
  for (const id of Object.values(ids)) expect(every).toContain(`id="${id}"`);
  expect(controls(['pass-employment'])).toContain(`id="${ids.salary}"`);
  expect(controls(['pass-employment'])).not.toContain(`id="${ids.prSince}"`);
  // Every condition linked to a control is on a route that shows it.
  const draft = {
    ...wifeDraft([...MY_TARGETS]),
    ...naturalisationDraft([...MY_TARGETS]),
  };
  for (const target of MY_TARGETS) {
    const html = controls([target], []);
    for (const item of pathway({ ...draft, targets: [target] }, target)
      .checks) {
      const focus = my.whatif.focusForRule(item.id, myPathwayByTarget[target]);
      if (focus)
        expect(html, `${target} ${item.id}`).toContain(
          `id="${ids[focus as keyof typeof ids]}"`,
        );
    }
  }
});

// Random answers over every request field, in a fixed sequence.
function randomRequests(count: number, start: number): MyFullRequest[] {
  let seed = start;
  const random = () => (seed = (seed * 48271) % 2147483647) / 2147483647;
  const pick = <T,>(items: readonly T[]): T =>
    items[Math.floor(random() * items.length)];
  const maybe = <T,>(value: () => T) => (random() < 0.25 ? undefined : value());
  const yes = () => random() < 0.6;
  const day = (from: number, to: number) =>
    `${from + Math.floor(random() * (to - from + 1))}-${String(1 + Math.floor(random() * 12)).padStart(2, '0')}-${String(1 + Math.floor(random() * 28)).padStart(2, '0')}`;
  const after = (start: string, years: number) => {
    const end = day(
      Number(start.slice(0, 4)),
      Number(start.slice(0, 4)) + years,
    );
    return end > start ? end : start;
  };
  const kinds: MyPassKind[] = [
    'ltsvp-spouse',
    'ltsvp-other',
    'employment',
    'student',
    'professional-visit',
    'residence',
    'dependant',
    'mm2h',
    'pvip',
    'plks',
    'unhcr',
    'imm13',
  ];
  return Array.from({ length: count }, () => ({
    simulationDate: day(2025, 2028),
    dateOfBirth: maybe(() => day(1950, 2012)),
    nationality: maybe(() =>
      pick(['US', 'JP', 'IN', 'ID', 'SG', 'GB', 'IL', 'CN', 'HK', 'stateless']),
    ),
    passportExpiry: maybe(() => day(2025, 2032)),
    passes: maybe(() =>
      Array.from({ length: Math.floor(random() * 4) }, () => {
        const from = day(2012, 2027);
        return { kind: pick(kinds), from, to: after(from, 6) };
      }),
    ),
    trips: maybe(() =>
      Array.from({ length: Math.floor(random() * 3) }, () => {
        const departed = day(2014, 2027);
        return {
          departed,
          returned: after(departed, 2),
          reason: maybe(() =>
            pick([
              'education',
              'health',
              'government-service',
              'other',
            ] as const),
          ),
        };
      }),
    ),
    family: maybe(() => ({
      tie: maybe(() =>
        pick([
          'wife-of-citizen',
          'husband-of-citizen',
          'child-of-citizen',
          'parent-of-citizen',
          'spouse-of-pr',
          'child-of-pr',
          'former-citizen',
          'none',
        ] as const),
      ),
      marriedOn: maybe(() => day(2000, 2027)),
      marriageRegistration: maybe(() =>
        pick(['malaysia', 'foreign-only'] as const),
      ),
      separated: maybe(() => random() < 0.3),
      divorced: maybe(() => random() < 0.2),
      childRelation: maybe(() =>
        pick(['biological', 'step', 'adopted'] as const),
      ),
    })),
    citizenSponsor: maybe(yes),
    residencePassSponsor: maybe(yes),
    citizenReferees: maybe(() => Math.floor(random() * 4)),
    immigrationRecord: maybe(() =>
      pick(['clear', 'listed', 'other-adverse'] as const),
    ),
    criminalRecord: maybe(() => pick(['none', 'convicted'] as const)),
    previousPrRefusalOn: maybe(() => (random() < 0.5 ? null : day(2020, 2027))),
    evidence: maybe(() => ({
      applicantIncome: maybe(yes),
      sponsorIncome: maybe(yes),
      malaysianTaxReturns: maybe(yes),
    })),
    language: maybe(() => ({
      malay: maybe(() =>
        pick(['weak', 'moderate', 'good', 'very-good'] as const),
      ),
      english: maybe(() =>
        pick(['weak', 'moderate', 'good', 'very-good'] as const),
      ),
    })),
    was: maybe(() => ({
      regulatorRecognition: maybe(yes),
      criticalOccupation: maybe(yes),
      citizenSponsor: maybe(yes),
    })),
    rep: maybe(() => ({
      relation: maybe(() =>
        pick(['wife', 'husband', 'child', 'none'] as const),
      ),
      participantHasSatk: maybe(yes),
      approvalLetterValidUntil: maybe(() => day(2025, 2028)),
      marriedBeforeRepApplication: maybe(yes),
      participantSponsor: maybe(yes),
      referees: maybe(() => Math.floor(random() * 4)),
    })),
    citizenship: maybe(() => ({
      permanentResidentSince: maybe(() =>
        random() < 0.3 ? null : day(2008, 2027),
      ),
      intendsToResidePermanently: maybe(() =>
        pick(['yes', 'no', 'undecided'] as const),
      ),
      qualifyingReferees: maybe(() => Math.floor(random() * 4)),
      renounceOtherNationality: maybe(() =>
        pick(['yes', 'no', 'unsure'] as const),
      ),
      completeTravelRecords: maybe(yes),
      taxReturnsFiveYears: maybe(yes),
      inFederationOnMerdekaDay: maybe(() => random() < 0.2),
    })),
    mm2h: maybe(() => ({
      category: maybe(() =>
        pick(['platinum', 'gold', 'silver', 'sez'] as const),
      ),
      fromCountryWithDiplomaticRelations: maybe(yes),
      viaLicensedOperator: maybe(yes),
      fixedDepositUsd: maybe(() =>
        pick([10_000, 32_000, 65_000, 150_000, 2_000_000]),
      ),
      propertyValueRm: maybe(() => pick([100_000, 600_000, 3_000_000])),
      daysPerYear: maybe(() => pick([0, 30, 90, 200])),
      goodConductCertificates: maybe(yes),
      healthInsurance: maybe(yes),
      dependants: maybe(() => Math.floor(random() * 4)),
      needsToWork: maybe(() => random() < 0.3),
    })),
    work: maybe(() => ({
      basicMonthlySalaryRm: maybe(() =>
        pick([3_000, 5_000, 10_000, 15_000, 20_000, 25_000]),
      ),
    })),
    rpt: maybe(() => ({
      taxYearsPaid: maybe(() => Math.floor(random() * 4)),
      qualification: maybe(yes),
      totalExperienceYears: maybe(() => Math.floor(random() * 10)),
    })),
    deRantau: maybe(() => ({
      talent: maybe(() => pick(['tech', 'non-tech'] as const)),
      annualIncomeUsd: maybe(() =>
        pick([20_000, 24_000, 36_000, 60_000, 80_000]),
      ),
      workType: maybe(() => pick(['remote-employee', 'freelancer'] as const)),
      employerRegisteredInMalaysia: maybe(() => random() < 0.3),
      foreignClients: maybe(yes),
      contractStart: maybe(() => day(2024, 2027)),
      dependants: maybe(() => Math.floor(random() * 3)),
    })),
  }));
}

// The page lists conditions from answer sets that reach every branch; random
// answers in a fixed sequence check that no source or pending detail the
// engine can cite is missing, and nothing is listed the engine does not cite.
test('the policy page lists exactly the sources and pending details the engine cites', () => {
  const rules = new Map(
    my.policy.rules[malaysiaFull2026_11.ruleSetId].map((rule) => [
      rule.id,
      rule,
    ]),
  );
  const cited = new Map<string, Set<string>>();
  // Two boundaries random dates rarely reach: the DE Rantau applicant's 18th
  // birthday (PD-430), and fully foreign pass years that only reach five by
  // counting a break of under six months (PD-407).
  const boundaries: MyFullRequest[] = [
    { simulationDate: '2026-05-01', dateOfBirth: '2008-05-01' },
    {
      simulationDate: '2026-11-24',
      family: { tie: 'none' },
      passes: [
        { kind: 'employment', from: '2021-09-01', to: '2023-11-30' },
        { kind: 'employment', from: '2024-05-01', to: '2027-12-31' },
      ],
    },
  ];
  for (const request of [...boundaries, ...randomRequests(4000, 20261125)])
    for (const assessed of evaluateMalaysiaFull(request).columns[0].pathways)
      for (const item of assessed.checks) {
        const entry = cited.get(item.id) ?? new Set();
        cited.set(item.id, entry);
        for (const source of item.sources)
          entry.add(`${source.srcId} ${source.locator}`);
        for (const pending of item.pendingDetails ?? []) entry.add(pending);
      }
  const listed = new Map(
    [...rules.values()].map((rule) => [
      rule.id,
      new Set([
        ...rule.sources.map((source) => `${source.srcId} ${source.locator}`),
        ...rule.pendingDetails,
      ]),
    ]),
  );
  expect(listed).toEqual(cited);
  expect(cited.size).toBe(92);

  // Only Malaysian sources appear, each with an address.
  for (const [id, url] of Object.entries(my.policy.sourceUrls)) {
    expect(id).toMatch(/^SRC-5\d\d$/);
    expect(url).toMatch(/^https:\/\//);
  }
  for (const rule of rules.values()) {
    expect(rule.title).toBeTruthy();
    expect(rule.titleEn).toMatch(/^[\x20-\x7E’“”–—]+$/);
  }
}, 30_000);

test.each(['zh-CN', 'en'] as const)(
  'the policy page shows nested parameters with named fields and Malaysian sources (%s)',
  (locale) => {
    const values = my.policy.parameters[malaysiaFull2026_11.ruleSetId].values;
    for (const [name, parameter] of Object.entries(values)) {
      const shown = my.policy.displayParameter!(name, locale);
      if (typeof parameter.value !== 'object') continue;
      expect(shown, name).toBeDefined();
      const text = JSON.stringify(shown);
      expect(text, name).not.toContain('my.param.');
      expect(text, name).not.toContain('my.option.');
      // No raw field name of the parameter is left as a label.
      for (const field of Object.keys(parameter.value as object))
        expect(Object.keys(shown as object), `${name}.${field}`).not.toContain(
          field,
        );
    }
    expect(my.policy.displayParameter!('prFeeRm', locale)).toBe('RM 120');
    const deposit = my.policy.displayParameter!(
      'prDepositRm',
      locale,
    ) as Record<string, Record<string, string>[]>;
    expect(deposit[t('my.param.byNationality', locale)]).toContainEqual({
      [t('my.param.nationality', locale)]:
        locale === 'en' ? 'Singapore' : '新加坡',
      [t('my.param.amount', locale)]: 'RM 200',
    });
    const html = render(<MalaysiaPolicyPage />, locale);
    expect(html).toContain(t('my.policy.pageTitle', locale));
    expect(html).toContain('data-source="SRC-500"');
    expect(html).toContain('data-source="SRC-528"');
    expect(html).not.toContain('data-source="SRC-001"');
    expect(html).toContain('data-rule="my.cit.residence"');
    expect(html).toContain('data-pathway="my.pass.de-rantau"');
    expect(html).toContain(t('my.policy.change.employmentPass', locale));
    expect(html).toContain('RM20,000');
  },
);
