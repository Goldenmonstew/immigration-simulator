import { readFileSync } from 'node:fs';
import { renderToStaticMarkup } from 'react-dom/server';
import type { ReactNode } from 'react';
import { expect, test } from 'vitest';
import NewZealandPage from '../app/new-zealand/page';
import NewZealandPolicyPage from '../app/new-zealand/policy/page';
import NewZealandSimulatePage from '../app/new-zealand/simulate/page';
import { GET as offlinePages } from '../app/offline-pages.json/route';
import sitemap from '../app/sitemap';
import { ResultView } from '../components/result-view';
import { WhatIfView } from '../components/whatif-lab';
import { t, type TranslationKey } from '../i18n';
import { nzFormZh } from '../i18n/countries/new-zealand-form';
import { LocaleContext } from '../i18n/locale';
import { japanModule } from '../lib/japan-module';
import {
  nzStepDefinitions,
  nzSteps,
  type NzDraft,
} from '../lib/new-zealand-draft';
import type { NzField } from '../lib/new-zealand-fields';
import { newZealandModule as nz } from '../lib/new-zealand-module';
import { readPageResult } from '../lib/page-result';
import { decodeDraft, encodeDraft } from '../lib/share';
import { ukModule } from '../lib/uk-module';

const render = (node: ReactNode, locale: 'zh-CN' | 'en' = 'zh-CN') =>
  renderToStaticMarkup(
    <LocaleContext value={{ locale, setLocale: () => {} }}>
      {node}
    </LocaleContext>,
  );

const citizenship = {
  fullCapacity: true,
  character: 'clear',
  foreignPoliceEvidence: 'not-requested',
  understandsResponsibilities: true,
  english: 'evidenced',
  residenceIntent: 'nz-or-realm',
  identityDocumentsAndWitness: true,
  oath: 'willing',
  presenceException: 'none',
  feeCategory: 'standard',
} as const;

// The questionnaire filled in by the e2e test: a 166-day trip this year.
function citizenshipDraft(): NzDraft {
  return {
    version: 1,
    step: 0,
    completed: true,
    simulationDate: '2026-11-23',
    goals: ['citizenship'],
    answers: {
      dateOfBirth: '1990-01-01',
      firstArrival: '2019-01-01',
      residentVisa: { granted: '2020-01-01', category: 'general' },
      permanentResidentVisa: '2022-02-01',
      trips: [{ departed: '2026-05-01', returned: '2026-10-15' }],
      resident: { travel: { currentlyInNz: true }, citizenship },
      common: { requiredFeePaid: true },
    },
  };
}

// A resident since 2020 with no trips, assessed for the PRV and the SMC.
function residentDraft(granted = '2020-01-01'): NzDraft {
  return {
    ...citizenshipDraft(),
    goals: ['prv', 'citizenship', 'smc'],
    answers: {
      dateOfBirth: '1990-01-01',
      firstArrival: granted,
      residentVisa: { granted, category: 'general' },
      trips: [],
      resident: {
        travel: { currentlyInNz: true, restrictedEntry: false },
        prv: {
          role: 'principal',
          conditions: 'none',
          deportationLiability: 'none',
          furtherPoliceEvidence: 'not-requested',
          otherCommitments: [],
        },
        citizenship,
      },
      common: {
        requiredFeePaid: true,
        identityDocuments: true,
        character: 'clear',
        dependants: [],
        residenceFiling: {
          currentVisa: 'other-eligible-temporary-or-resident',
          statutoryBar: 'none',
          atImmigrationControlArea: false,
          hasOmittedRelationshipVisaDependant: false,
        },
      },
    },
  };
}

const pathways = (draft: NzDraft, locale: 'zh-CN' | 'en' = 'zh-CN') =>
  nz.run(draft, locale).columns[0].pathways;

test.each(['zh-CN', 'en'] as const)(
  'the New Zealand home links to the questionnaire and sources in %s',
  (locale) => {
    const html = render(<NewZealandPage />, locale);
    expect(html).toContain('href="/new-zealand/simulate"');
    expect(html).toContain('href="/new-zealand/policy"');
    expect(html).toContain(t('nz.title', locale));
  },
);

test('all five New Zealand pages are in the offline list and sitemap', async () => {
  const offline = await offlinePages().json();
  const paths = sitemap().map(({ url }) => new URL(url).pathname);
  for (const sub of ['', '/simulate', '/result', '/whatif', '/policy']) {
    expect(offline).toContain('/new-zealand' + sub);
    expect(paths).toContain('/new-zealand' + sub);
  }
});

test('every question, option and hint has its text', () => {
  const keys = new Set(Object.keys(nzFormZh));
  const missing: string[] = [];
  const walk = (fields: NzField[]) => {
    for (const field of fields) {
      if (!keys.has(`nz.f.${field.label}`)) missing.push(field.label);
      if (field.type === 'choice' || field.type === 'multi')
        for (const option of field.options) {
          const key = `nz.o.${field.set ? field.set + '.' : ''}${option}`;
          if (!keys.has(key)) missing.push(key);
        }
      if (field.type === 'date-or' || field.type === 'number-or')
        if (!keys.has(`nz.form.alternative.${field.label}`))
          missing.push(field.label);
      if (field.type === 'group' || field.type === 'list') walk(field.fields);
    }
  };
  for (const { key, sections } of nzStepDefinitions) {
    if (!keys.has(`nz.step.${key}`)) missing.push(key);
    for (const { fields } of sections) walk(fields);
  }
  expect(missing).toEqual([]);
});

test('drafts round-trip in the New Zealand envelope and malformed drafts are rejected', () => {
  const draft = citizenshipDraft();
  const encoded = encodeDraft(nz, draft);
  expect(decodeDraft(nz, encoded)).toEqual(draft);
  expect(decodeDraft(japanModule, encoded)).toBeUndefined();
  expect(decodeDraft(ukModule, encoded)).toBeUndefined();
  expect(
    decodeDraft(nz, encodeDraft(ukModule, ukModule.createDraft())),
  ).toBeUndefined();
  const fresh = nz.createDraft();
  expect(nz.decodeDraft(fresh)).toEqual(fresh);
  const answers = draft.answers;
  for (const bad of [
    null,
    { ...draft, version: 2 },
    { ...draft, step: nzStepDefinitions.length },
    { ...draft, goals: ['made-up'] },
    { ...draft, answers: { ...answers, trips: 'none' } },
    { ...draft, answers: { ...answers, trips: [null] } },
    { ...draft, answers: { ...answers, nonPrincipal: 'yes' } },
    {
      ...draft,
      answers: {
        ...answers,
        residentVisa: { granted: '2020-01-01', category: 'x' },
      },
    },
    // A finished draft must answer every required question it shows.
    { ...draft, answers: { ...answers, trips: [{ departed: '2026-05-01' }] } },
    { ...draft, goals: [] },
  ])
    expect(nz.decodeDraft(bad)).toBeUndefined();
  // Unknown keys and answers to hidden union members are dropped.
  const decoded = nz.decodeDraft({
    ...draft,
    extra: true,
    answers: {
      ...answers,
      extra: 1,
      common: { english: { method: 'none', score: 7 } },
    },
  });
  expect(decoded).not.toHaveProperty('extra');
  expect(decoded?.answers).not.toHaveProperty('extra');
  expect(decoded?.answers.common?.english).toEqual({ method: 'none' });
});

test('steps follow the chosen pathways and validate required answers', () => {
  const fresh = nz.createDraft();
  // Health and family questions appear once a visa pathway is chosen.
  expect(nzSteps(fresh).map(({ title }) => title)).toEqual([
    'nz.step.basics',
    'nz.step.filing',
  ]);
  expect(nz.validateStep(fresh)).toEqual({ 'nz-goals': 'nz.form.goalError' });
  expect(nz.validateStep({ ...fresh, simulationDate: '2026-02-30' })).toEqual({
    'nz-simulationDate': 'nz.error.date',
    'nz-goals': 'nz.form.goalError',
  });
  expect(
    nzSteps({ goals: ['smc'] }).map(({ title }) => title.slice(8)),
  ).toEqual(['basics', 'job', 'smc', 'filing', 'health', 'english', 'family']);

  const draft = citizenshipDraft();
  const step = (key: string) =>
    nzStepDefinitions.findIndex((item) => item.key === key);
  const history = (answers: Partial<NzDraft['answers']>) =>
    nz.validateStep({
      ...draft,
      step: step('history'),
      answers: { ...draft.answers, ...answers },
    });
  expect(history({})).toEqual({});
  expect(
    history({ trips: [{ departed: '2026-05-01', returned: '2026-04-01' }] }),
  ).toEqual({ 'nz-trips-0-returned': 'nz.error.order' });
  expect(history({ trips: [{} as never] })).toEqual({
    'nz-trips-0-departed': 'nz.form.required',
    'nz-trips-0-returned': 'nz.form.required',
  });
  // An optional group needs its required answers once any is given.
  expect(history({ residentVisa: { granted: '2020-01-01' } as never })).toEqual(
    {
      'nz-residentVisa-category': 'nz.form.required',
    },
  );
  expect(history({ firstArrival: '1989-01-01' })).toEqual({
    'nz-firstArrival': 'nz.error.beforeBirth',
  });
  expect(history({ permanentResidentVisa: '2019-12-31' })).toEqual({
    'nz-permanentResidentVisa': 'nz.error.prvOrder',
  });

  const english = (value: object) =>
    nz.validateStep({
      ...draft,
      goals: ['smc'],
      step: step('english'),
      answers: { common: { english: value as never } },
    });
  expect(
    english({ method: 'test', test: 'oet', grades: ['A', null, null, null] }),
  ).toEqual({ 'nz-common-english-grades': 'nz.form.tupleError' });
  expect(english({ method: 'test', score: 7 })).toEqual({
    'nz-common-english-test': 'nz.form.required',
  });
  expect(english({ method: 'test', test: 'ielts', score: -1 })).toEqual({
    'nz-common-english-score': 'nz.form.numberError',
  });
});

test('answers for pathways that were not chosen are neither assessed nor shared', () => {
  const draft = {
    ...citizenshipDraft(),
    answers: {
      ...citizenshipDraft().answers,
      skilled: { job: { hourlyPay: 40 } },
    },
  };
  const active = nz.activeAnswers!(draft);
  expect(active.answers).not.toHaveProperty('skilled');
  expect(active.answers.resident?.citizenship).toEqual(citizenship);
  const shared = decodeDraft(nz, encodeDraft(nz, draft));
  expect(shared?.answers).not.toHaveProperty('skilled');
});

test('results cover a met, a future and a pending pathway, only for the chosen goals', () => {
  const met = pathways(
    nz.whatif.apply(residentDraft(), {
      ...nz.whatif.initial(residentDraft()),
    }),
  );
  expect(met.map((path) => path.id)).toEqual([
    'NZ-PRV',
    'NZ-CITIZENSHIP',
    'NZ-SMC',
  ]);
  expect(met[0]).toMatchObject({ status: 'MET', earliestDate: '2026-11-23' });
  expect(met[1]).toMatchObject({ status: 'MET', earliestDate: '2026-11-23' });
  const smc = met[2];
  expect(smc.status).toBe('UNKNOWN');
  expect(smc.earliestDate).toBeUndefined();
  expect(smc.checks.find((check) => check.id === 'NZ-C3')).toMatchObject({
    status: 'UNKNOWN',
    pendingDetails: expect.arrayContaining([expect.stringMatching(/^PD-/)]),
  });
  expect(smc.pendingDetails?.length).toBeGreaterThan(0);

  const [prv] = pathways(residentDraft('2025-11-01'));
  expect(prv).toMatchObject({ status: 'FUTURE', earliestDate: '2027-11-01' });

  const [citizen] = pathways(citizenshipDraft(), 'en');
  expect(citizen).toMatchObject({
    id: 'NZ-CITIZENSHIP',
    status: 'FUTURE',
    earliestDate: '2027-06-12',
  });
  // Condition text explains the requirement instead of restating its title.
  for (const path of [...met, citizen])
    for (const check of path.checks)
      expect(check.explanation.startsWith(check.title), check.id).toBe(false);
});

test('comparison controls change the draft copy that is assessed', () => {
  const draft = citizenshipDraft();
  const initial = nz.whatif.initial(draft);
  expect(initial).toMatchObject({
    date: '2026-11-23',
    noTrips: false,
    lastReturn: '2026-10-15',
    citizenshipEnglish: 'evidenced',
  });
  const earlier = nz.whatif.apply(draft, {
    ...initial,
    lastReturn: '2026-10-01',
  });
  expect(earlier.answers.trips).toEqual([
    { departed: '2026-05-01', returned: '2026-10-01' },
  ]);
  expect(draft.answers.trips?.[0].returned).toBe('2026-10-15');
  expect(pathways(earlier)[0]).toMatchObject({
    status: 'FUTURE',
    earliestDate: '2027-05-29',
  });
  expect(
    pathways(nz.whatif.apply(draft, { ...initial, noTrips: true }))[0],
  ).toMatchObject({ status: 'MET', earliestDate: '2026-11-23' });
  expect(
    pathways(
      nz.whatif.apply(draft, {
        ...initial,
        citizenshipEnglish: 'insufficient',
      }),
    )[0].status,
  ).toBe('NOT_MET');

  const skilled = { ...residentDraft(), goals: ['smc' as const] };
  const scored = nz.whatif.apply(skilled, {
    ...nz.whatif.initial(skilled),
    englishScore: 7,
    hourlyPay: 50,
  });
  expect(scored.answers.common?.english).toEqual({
    method: 'test',
    test: 'ielts',
    inPerson: true,
    date: '2026-11-23',
    score: 7,
  });
  expect(scored.answers.skilled?.job?.hourlyPay).toBe(50);

  expect(
    nz.whatif.validate(earlier, { ...initial, lastReturn: '2026-04-01' }),
  ).toEqual({ lastReturn: 'nz.error.order' });
  expect(nz.whatif.validate(draft, { ...initial, date: '' })).toEqual({
    date: 'nz.error.date',
  });
  expect(nz.whatif.focusForRule('NZ-P3-1-PRESENCE', 'NZ-CITIZENSHIP')).toBe(
    'trips',
  );
  expect(nz.whatif.focusForRule('NZ-C3', 'NZ-SMC')).toBe('english');
});

test.each(['zh-CN', 'en'] as const)(
  'result, comparison and questionnaire pages render New Zealand answers in %s',
  (locale) => {
    const draft = citizenshipDraft();
    const { result } = readPageResult(nz, locale, encodeDraft(nz, draft));
    const html = render(
      <ResultView country={nz} result={result!} draft={draft} />,
      locale,
    );
    expect(html).toContain(t('nz.policy.title', locale));
    expect(html).toContain('2027-06-12');
    expect(html).toContain('?focus=trips');
    const comparison = render(
      <WhatIfView country={nz} draft={draft} target={{ focus: 'trips' }} />,
      locale,
    );
    expect(comparison).toContain('id="nz-whatif-last-return"');
    expect(comparison).toContain('value="2026-10-15"');

    const step = (index: number) =>
      render(
        NewZealandSimulatePage().props.children({
          draft: { ...draft, step: index },
          errors: {},
          update: () => {},
        }),
        locale,
      );
    expect(step(0)).toContain('id="nz-goal-citizenship"');
    const history = step(1);
    expect(history).toContain('id="nz-trips-0-returned"');
    expect(history).toContain('id="nz-resident-travel-currentlyInNz"');
    expect(history).toContain(t('nz.h.trips', locale));
  },
);

test('the policy page lists every pathway and condition with New Zealand sources only', () => {
  const engine = ['checks', 'resident', 'skilled', 'family'].flatMap((file) =>
    readFileSync(
      new URL(
        `../../../packages/engine/src/new-zealand-${file}.ts`,
        import.meta.url,
      ),
      'utf8',
    ).match(/'NZ-[A-Z0-9-]+'/g)!,
  );
  const { policy } = nz;
  const pathwayIds = policy.pathways!.map((path) => path.id);
  expect(pathwayIds).toHaveLength(10);
  const conditions = new Set(
    engine
      .map((id) => id.slice(1, -1))
      .filter((id) => !pathwayIds.includes(id)),
  );
  const rules = policy.rules['nz.current-law'];
  expect(new Set(rules.map((rule) => rule.id))).toEqual(conditions);
  for (const rule of rules) {
    expect(rule.titleEn).not.toBe(rule.title);
    expect(rule.sources.length).toBeGreaterThan(0);
  }
  const sources = Object.keys(policy.sourceUrls);
  expect(sources).toContain('SRC-070');
  expect(sources).toContain('SRC-252');
  for (const other of [japanModule, ukModule])
    expect(sources.filter((id) => id in other.policy.sourceUrls)).toEqual([]);
  expect(policy.changelog.map((change) => change.date)).toEqual([
    '2026-11-12',
    '2026-08-28',
    '2026-08-24',
  ]);
  const html = render(<NewZealandPolicyPage />, 'en');
  expect(html.match(/data-pathway=/g)).toHaveLength(10);
  expect(html.match(/data-source=/g)).toHaveLength(sources.length);
  expect(t('nz.policy.pageTitle' as TranslationKey)).toBe('新西兰政策依据');
  expect(t('nz.policy.pageTitle' as TranslationKey, 'en')).toBe(
    'Policy basis for New Zealand',
  );
});
