import { renderToStaticMarkup } from 'react-dom/server';
import { expect, test } from 'vitest';
import {
  evaluatePortugalFull,
  type PtFullRequest,
} from '@uk-immigration/engine';
import Home from '../app/page';
import { GET as offlinePages } from '../app/offline-pages.json/route';
import PortugalPage from '../app/portugal/page';
import PortugalPolicyPage from '../app/portugal/policy/page';
import PortugalSimulatePage from '../app/portugal/simulate/page';
import sitemap from '../app/sitemap';
import { ResultView } from '../components/result-view';
import { WhatIfView } from '../components/whatif-lab';
import { t, type TranslationKey } from '../i18n';
import { LocaleContext } from '../i18n/locale';
import { gapRules } from '../lib/gap-summary';
import { readPageResult } from '../lib/page-result';
import {
  activePortugalAnswers,
  clearHiddenPortugalAnswers,
  portugalStepList,
  type PortugalDraft,
} from '../lib/portugal-draft';
import { portugalSteps, type PortugalField } from '../lib/portugal-fields';
import { portugalModule as pt } from '../lib/portugal-module';
import { decodeDraft, encodeDraft } from '../lib/share';
import { sourceUrls } from '../lib/sources';
import { ukModule } from '../lib/uk-module';

const render = (node: React.ReactNode, locale: 'zh-CN' | 'en' = 'zh-CN') =>
  renderToStaticMarkup(
    <LocaleContext value={{ locale, setLocale: () => {} }}>
      {node}
    </LocaleContext>,
  );
const step = (draft: PortugalDraft, errors = pt.validateStep(draft)) =>
  render(
    PortugalSimulatePage().props.children({
      draft,
      errors,
      update: () => {},
    }),
  );
const pathway = (draft: PortugalDraft, id: string, locale = 'zh-CN' as const) =>
  pt.run(draft, locale).columns[0].pathways.find((item) => item.id === id)!;

// Evidence that meets the common residence requirements (engine fixture).
const residence: PortugalDraft['residence'] = {
  means: {
    region: 'mainland',
    otherAdults: 1,
    dependantChildren: 1,
    supportedMonths: 12,
    monthlyEligibleEur: 1473.84,
    confirmedMonthlyMinimumEur: 1473.84,
    stable: true,
    solidarityReliance: false,
  },
  accommodation: 'documented',
  language: { kind: 'pla', level: 'A2', recognized: true },
  healthCoverage: 'sns-proof',
  tax: 'compliant',
  socialSecurity: 'recognized-arrangement',
  travelDocumentValid: true,
  criminalRecordAvailable: true,
  statusCancellation: 'clear',
  criminalSentence: {
    totalYears: 1,
    scope: 'complete',
    permanentWindowVerified: true,
  },
  generalRefusal: {
    sisAlert: false,
    ucfeExclusion: false,
    longestFinalPortuguesePrisonYears: 1,
    comparablePortugueseConvictions: 1,
  },
  fees: { column: 'right', paid: true, exemption: 'none' },
};

function permanentDraft(
  permit: NonNullable<PortugalDraft['permits']>[number] = {
    kind: 'temporary',
    from: '2015-10-01',
    to: '2027-01-22',
  },
): PortugalDraft {
  return {
    ...pt.createDraft(),
    step: 3,
    completed: true,
    simulationDate: '2026-11-23',
    route: 'other',
    targets: ['permanent'],
    permits: [permit],
    trips: [],
    residence,
  };
}

// The scenario the end-to-end test fills in through the questionnaire.
function partnerDraft(targets: PortugalDraft['targets']): PortugalDraft {
  return {
    ...pt.createDraft(),
    step: 8,
    completed: true,
    simulationDate: '2026-11-23',
    route: 'other',
    targets,
    ...(targets.includes('naturalisation')
      ? { permits: [{ kind: 'temporary', from: '2020-01-01' }], trips: [] }
      : {}),
    nationality: {
      crime: { record: 'none' },
      security: 'clear',
      sanctions: 'clear',
    },
    partner: {
      kind: 'marriage',
      relationshipFrom: '2025-06-01',
      current: true,
      portuguesePartner: true,
      partnerPortugueseSince: '1990-01-01',
      registrationAccepted: true,
      connectionReview: 'clear',
      foreignService: 'none',
    },
  };
}

test.each(['zh-CN', 'en'] as const)(
  'Portugal home and hub card describe the full routes in %s',
  (locale) => {
    const hub = render(<Home />, locale);
    expect(hub).toContain('href="/portugal"');
    expect(hub).toContain(t('hub.pt.desc', locale));
    const html = render(<PortugalPage />, locale);
    expect(html).toContain('href="/portugal/simulate"');
    expect(html).toContain('href="/portugal/policy"');
    expect(html).toContain(t('pt.title', locale));
    expect(html).toContain(t('pt.privacy', locale));
  },
);

test('all five Portugal pages are in the offline list and sitemap', async () => {
  const offline = await offlinePages().json();
  const paths = sitemap().map(({ url }) => new URL(url).pathname);
  for (const sub of ['', '/simulate', '/result', '/whatif', '/policy']) {
    expect(offline).toContain('/portugal' + sub);
    expect(paths.some((path) => path.endsWith('/portugal' + sub))).toBe(true);
  }
});

test('every question, option, section and step has text in both languages', () => {
  const keys = new Set<string>();
  const collect = (fields: PortugalField[]) => {
    for (const field of fields) {
      keys.add(`pt.field.${field.label}`);
      if (field.hint) keys.add(`pt.hint.${field.hint}`);
      if (field.type === 'choice' || field.type === 'multi')
        for (const option of field.options)
          keys.add(`pt.option.${field.set}.${option}`);
      if (field.type === 'group' || field.type === 'list')
        collect(field.fields);
    }
  };
  for (const { title, sections } of portugalSteps) {
    keys.add(title);
    for (const section of sections) {
      if (section.id !== 'basics' && section.id !== 'history')
        keys.add(`pt.section.${section.id}`);
      collect(section.fields);
    }
  }
  for (const key of keys)
    for (const locale of ['zh-CN', 'en'] as const)
      expect(t(key as TranslationKey, locale), `${key} ${locale}`).toBeTruthy();
});

test('steps follow the chosen routes', () => {
  const draft = pt.createDraft();
  const steps = (targets: PortugalDraft['targets'], patch = {}) =>
    portugalStepList({ ...draft, targets, ...patch }).map(({ step }) => step);
  expect(steps([])).toEqual([0]);
  expect(steps(['partner'])).toEqual([0, 2, 8]);
  expect(steps(['naturalisation', 'partner'])).toEqual([0, 1, 2, 8]);
  expect(steps(['permanent', 'long-term'])).toEqual([0, 1, 3, 4]);
  expect(steps(['investment'])).toEqual([0, 1, 3, 5]);
  expect(steps(['investment'], { investment: { operation: 'renew' } })).toEqual(
    [0, 1, 3, 5, 6],
  );
  expect(steps(['renewal', 'free-movement'])).toEqual([0, 1, 3, 6, 7]);
});

test('each step requires its own answers and tells unanswered lists from confirmed none', () => {
  const fresh = { ...pt.createDraft(), simulationDate: '' };
  expect(pt.validateStep(fresh)).toEqual({
    'pt-simulationDate': 'pt.form.required',
    'pt-route': 'pt.form.required',
    'pt-targets': 'pt.form.routeError',
  });
  const history: PortugalDraft = {
    ...permanentDraft(),
    step: 1,
    permits: undefined,
    trips: undefined,
  };
  expect(pt.validateStep(history)).toEqual({
    'pt-permits': 'pt.form.listRequired',
    'pt-trips': 'pt.form.listRequired',
  });
  expect(
    pt.validateStep({
      ...history,
      permits: [{ kind: 'temporary', from: '2022-01-01', to: '2021-01-01' }],
      trips: [{ departed: '2024-02-10' } as never],
    }),
  ).toEqual({
    'pt-permits-0-to': 'pt.error.order',
    'pt-trips-0-returned': 'pt.form.required',
  });
  expect(pt.validateStep({ ...history, permits: [], trips: [] })).toEqual({});

  // Optional evidence lists can be left unanswered, but rows need their dates.
  const nested: PortugalDraft = {
    ...permanentDraft(),
    residence: {
      ...residence,
      criminalSentence: { convictions: [{ years: 1 } as never] },
    },
  };
  expect(pt.validateStep(nested)).toEqual({
    'pt-residence-criminalSentence-convictions-0-date': 'pt.form.required',
  });

  const pending: PortugalDraft = {
    ...partnerDraft(['naturalisation', 'partner']),
    step: 2,
    pendingApplication: '2026-12-01',
  };
  expect(pt.validateStep(pending)).toEqual({
    'pt-pendingApplication': 'pt.error.afterSimulation',
  });
  expect(
    pt.validateStep({
      ...pending,
      pendingApplication: undefined,
      partner: { ...pending.partner, pendingApplication: '2027-01-01' },
      step: 8,
    }),
  ).toEqual({ 'pt-partner-pendingApplication': 'pt.error.afterSimulation' });
  expect(
    pt.validateStep({
      ...pending,
      pendingApplication: undefined,
      step: 5,
      targets: ['investment'],
    }),
  ).toEqual({ 'pt-investment-operation': 'pt.form.required' });
});

test('the questionnaire renders the fields the end-to-end flow uses', () => {
  const draft = partnerDraft(['naturalisation', 'partner']);
  const first = step({ ...draft, step: 0 });
  for (const id of [
    'pt-simulationDate',
    'pt-route',
    'pt-birthDate',
    'pt-target-naturalisation',
    'pt-target-partner',
  ])
    expect(first).toContain(`id="${id}"`);
  const history = step({
    ...draft,
    step: 1,
    permits: undefined,
    trips: undefined,
  });
  expect(history).toContain('id="pt-permits"');
  expect(history).toContain('id="pt-trips"');
  expect(history).toContain(t('pt.form.noRecords'));
  expect(history).toContain(`${t('pt.form.add')} · ${t('pt.field.permits')}`);
  const rows = step({ ...draft, step: 1 });
  for (const id of [
    'pt-permits-0-kind',
    'pt-permits-0-from',
    'pt-permits-0-to',
  ])
    expect(rows).toContain(`id="${id}"`);
  expect(rows).toContain(t('pt.form.emptyConfirmed'));
  const review = step({ ...draft, step: 2 });
  for (const id of [
    'pt-nationality-crime-record',
    'pt-nationality-security',
    'pt-nationality-sanctions',
  ])
    expect(review).toContain(`id="${id}"`);
  // Conviction details appear only after a conviction is recorded.
  expect(review).not.toContain('id="pt-nationality-crime-years"');
  expect(review).toContain(t('pt.section.natReview'));
  const partner = step({ ...draft, step: 8 });
  for (const id of [
    'pt-partner-kind',
    'pt-partner-relationshipFrom',
    'pt-partner-current',
    'pt-partner-portuguesePartner',
    'pt-partner-partnerPortugueseSince',
    'pt-partner-registrationAccepted',
    'pt-partner-connectionReview',
    'pt-partner-foreignService',
  ])
    expect(partner).toContain(`id="${id}"`);
  expect(partner).not.toContain('id="pt-partner-courtRecognition"');
  // A section with an error opens so the field can take focus.
  const missing = step({ ...draft, step: 5, targets: ['investment'] });
  expect(missing).toMatch(/<details open="" [^>]*><summary>手续与申请人/);
});

test('drafts round-trip in their country envelope and reject other countries', () => {
  const draft = partnerDraft(['naturalisation', 'partner']);
  const encoded = encodeDraft(pt, draft);
  expect(decodeDraft(pt, encoded)).toEqual(activePortugalAnswers(draft));
  expect(decodeDraft(ukModule, encoded)).toBeUndefined();
  expect(
    decodeDraft(pt, encodeDraft(ukModule, ukModule.createDraft())),
  ).toBeUndefined();
  const fresh = pt.createDraft();
  expect(pt.decodeDraft(fresh)).toEqual(fresh);
  expect(pt.decodeDraft({ ...draft, targets: ['mars'] })).toBeUndefined();
  expect(pt.decodeDraft({ ...draft, version: 2 })).toBeUndefined();
  expect(
    pt.decodeDraft({ ...draft, partner: { kind: 'friendship' } }),
  ).toBeUndefined();
  // A completed draft that no longer passes its steps opens for correction only.
  const broken = { ...draft, route: undefined };
  expect(pt.decodeDraft(broken, true)).toBeUndefined();
  expect(pt.decodeDraft(broken, 'show-correction')).toMatchObject({
    completed: false,
    step: 0,
  });
});

test('answers for routes or branches the user left are not assessed or shared', () => {
  const draft: PortugalDraft = {
    ...partnerDraft(['partner']),
    permits: [{ kind: 'temporary', from: '2020-01-01' }],
    nationality: {
      security: 'clear',
      newLanguageAccepted: true,
      crime: { record: 'none', years: 4 },
    },
    residence,
    partner: { kind: 'marriage', courtRecognition: true },
  };
  const active = activePortugalAnswers(draft);
  expect(active.permits).toBeUndefined();
  expect(active.residence).toEqual({});
  // Conviction details are hidden once no conviction is recorded.
  expect(active.nationality).toEqual({
    security: 'clear',
    crime: { record: 'none' },
  });
  expect(active.partner).toEqual({ kind: 'marriage' });
});

// review102-1 problem 1: order, ranges and filing dates are checked when a
// step is submitted, so a reload keeps the answers being corrected.
test('unfinished drafts and hidden answers with value errors reopen as they were', () => {
  const progress: PortugalDraft = {
    ...permanentDraft(),
    completed: false,
    step: 1,
    trips: [{ departed: '2025-05-01', returned: '2025-04-01' }],
  };
  expect(pt.decodeDraft(progress)).toEqual(progress);
  expect(pt.validateStep(progress)).toEqual({
    'pt-trips-0-returned': 'pt.error.order',
  });
  const typed: PortugalDraft = {
    ...permanentDraft(),
    completed: false,
    residence: {
      ...residence,
      means: { ...residence.means, otherAdults: 1.5, monthlyEligibleEur: -1 },
    },
  };
  expect(pt.decodeDraft(typed)).toEqual(typed);
  expect(pt.validateStep(typed)).toEqual({
    'pt-residence-means-otherAdults': 'pt.error.integer',
    'pt-residence-means-monthlyEligibleEur': 'pt.error.number',
  });
  const filing: PortugalDraft = {
    ...partnerDraft(['naturalisation', 'partner']),
    completed: false,
    step: 2,
    pendingApplication: '2026-12-01',
  };
  expect(pt.decodeDraft(filing)).toEqual(filing);

  // A finished result keeps answers hidden by leaving a route.
  const finished: PortugalDraft = {
    ...partnerDraft(['naturalisation']),
    step: 2,
    partner: { kind: 'marriage', pendingApplication: '2026-12-01' },
  };
  expect(pt.decodeDraft(finished)).toEqual(finished);
  expect(pt.decodeDraft(finished, true)).toEqual(finished);
  const partnerOnly: PortugalDraft = {
    ...partnerDraft(['partner']),
    trips: [{ departed: '2025-05-01', returned: '2025-04-01' }],
  };
  expect(pt.decodeDraft(partnerOnly, true)).toEqual(partnerOnly);
  // A shown error still sends a finished result back to its step.
  const broken = { ...progress, completed: true, step: 3 };
  expect(pt.decodeDraft(broken, true)).toBeUndefined();
  expect(pt.decodeDraft(broken, 'show-correction')).toMatchObject({
    completed: false,
    step: 1,
  });
  expect(pt.restoreStoredDraft!(broken)).toMatchObject({
    completed: false,
    step: 1,
  });
});

// review102-1 problem 2.
test('a changed answer clears the sub-answers it hides and empty groups are not assessed', () => {
  const ari: PortugalDraft = {
    ...permanentDraft(),
    step: 5,
    targets: ['investment'],
    investment: {
      operation: 'grant',
      holder: 'investor',
      investment: { jobs: 10 } as never,
    },
  };
  const d06 = (draft: PortugalDraft) =>
    pathway(draft, 'PT-GOLDEN-VISA').checks.find(
      (check) => check.id === 'PT-D06',
    )?.status;
  expect(activePortugalAnswers(ari).investment.investment).toBeUndefined();
  expect(d06(ari)).toBe('UNKNOWN');
  expect(
    d06({ ...ari, investment: { operation: 'grant', holder: 'investor' } }),
  ).toBe('UNKNOWN');
  expect(
    activePortugalAnswers({
      ...partnerDraft(['naturalisation']),
      nationality: { language: { recognized: true } as never },
    }).nationality.language,
  ).toBeUndefined();

  const cleared = clearHiddenPortugalAnswers({
    ...ari,
    targets: ['naturalisation', 'investment'],
    investment: {
      operation: 'renew',
      holder: 'investor',
      foreignRecordDate: '2026-01-01',
      investment: { jobs: 10 } as never,
    },
    nationality: {
      crime: { record: 'none', years: 2 },
      language: { kind: 'none', recognized: true },
    },
    residence: {
      criminalSentence: {
        convictions: [
          {
            date: '2020-01-01',
            years: 1,
            suspended: false,
            expresslyCountedSuspendedOffence: true,
          },
        ],
      },
    },
  });
  expect(cleared.investment).toEqual({
    operation: 'renew',
    holder: 'investor',
  });
  expect(cleared.nationality).toEqual({
    crime: { record: 'none' },
    language: { kind: 'none' },
  });
  expect(cleared.residence.criminalSentence!.convictions).toEqual([
    { date: '2020-01-01', years: 1, suspended: false },
  ]);
  // Answers for a route the user left stay for when it is chosen again.
  const left = { ...ari, targets: ['permanent'] as PortugalDraft['targets'] };
  expect(clearHiddenPortugalAnswers(left).investment).toBe(left.investment);
});

// review102-1 problem 3: a renewal filed after the simulation date has not
// happened yet.
test('a renewal filing date cannot be after the simulation date', () => {
  const renewal: PortugalDraft = {
    ...permanentDraft({
      kind: 'temporary',
      from: '2025-02-01',
      to: '2027-02-01',
    }),
    step: 6,
    simulationDate: '2026-10-01',
    targets: ['renewal'],
    renewal: { filedOn: '2026-12-15' },
  };
  expect(pt.validateStep(renewal)).toEqual({
    'pt-renewal-filedOn': 'pt.error.afterSimulation',
  });
  expect(pt.decodeDraft(renewal, true)).toBeUndefined();
  expect(pt.decodeDraft(renewal, 'show-correction')).toMatchObject({
    completed: false,
    step: 6,
  });
  const filed = {
    ...renewal,
    simulationDate: '2026-11-23',
    renewal: { filedOn: '2026-11-10' },
  };
  expect(pt.validateStep(filed)).toEqual({});
  const knobs = { ...pt.whatif.initial(filed), simulationDate: '2026-10-01' };
  expect(pt.whatif.validate(pt.whatif.apply(filed, knobs), knobs)).toEqual({
    date: 'pt.error.afterSimulation',
  });
});

test('results show only the chosen routes with met, future and pending dates', () => {
  const met = pathway(permanentDraft(), 'PT-PERMANENT');
  expect(met.status).toBe('MET');
  expect(pt.run(permanentDraft(), 'zh-CN').columns[0].pathways).toHaveLength(1);

  // A renewed card without an end date keeps counting until the five years.
  const future = pathway(
    permanentDraft({ kind: 'temporary', from: '2022-11-22' }),
    'PT-PERMANENT',
  );
  expect(future.status).toBe('FUTURE');
  expect(future.earliestDate).toBe('2027-11-23');

  const pending = pathway(
    {
      ...permanentDraft(),
      residence: { ...residence, accommodation: undefined },
    },
    'PT-PERMANENT',
  );
  expect(pending.status).toBe('UNKNOWN');
  expect(pending.earliestDate).toBeUndefined();
  const housing = pending.checks.find((check) => check.id === 'PT-B04')!;
  expect(housing.status).toBe('UNKNOWN');
  // The engine's fallback sentence only repeats the title and the PD badge.
  expect(housing.explanation).toBe(t('pt.result.UNKNOWN'));
  expect(housing.explanation).not.toContain(housing.title);
  expect(housing.pendingDetails).toEqual(['PD-386']);
  for (const check of [...met.checks, ...pending.checks])
    expect(check.explanation).not.toContain(`「${check.title}」`);

  const shared = partnerDraft(['naturalisation', 'partner']);
  const partner = pathway(shared, 'PT-PARTNER-NATIONALITY');
  expect(partner.status).toBe('FUTURE');
  expect(partner.earliestDate).toBe('2028-06-02');
  expect(partner.title).toBe('与葡萄牙公民结婚或为事实伴侣取得国籍');
  expect(pathway(shared, 'PT-NATURALISATION').status).toBe('UNKNOWN');
  expect(pathway(shared, 'PT-PARTNER-NATIONALITY', 'en' as never).title).toBe(
    'Nationality by marriage or de facto partnership',
  );
});

test('the result page shows the chosen routes under the applicable-law column', () => {
  const draft = partnerDraft(['naturalisation', 'partner']);
  const page = readPageResult(pt, 'zh-CN', draft);
  const html = render(
    <ResultView country={pt} result={page.result!} draft={page.draft} />,
  );
  expect(html).toContain('葡萄牙适用法律');
  expect(html).toContain('与葡萄牙公民结婚或为事实伴侣取得国籍');
  expect(html).toContain(
    t('country.status.FUTURE').replace('{date}', '2028-06-02'),
  );
  expect(html).toContain('新制葡语能力');
  // The end-to-end test follows this link without expanding the list.
  const naturalisation = page.result!.columns[0].pathways[0];
  expect(
    gapRules(naturalisation).findIndex((rule) => rule.id === 'PT-A03'),
  ).toBe(2);
  expect(html).toContain('?focus=natLanguage');
  expect(html).toContain('PD-380');
  const en = render(
    <ResultView country={pt} result={pt.run(draft, 'en')} draft={page.draft} />,
    'en',
  );
  expect(en).toContain('Applicable Portuguese law');
  expect(en).toContain(
    t('country.status.FUTURE', 'en').replace('{date}', '2028-06-02'),
  );
});

test('what-if controls change copies of the draft and point to their conditions', () => {
  const { whatif } = pt;
  const draft = partnerDraft(['naturalisation', 'partner']);
  const knobs = whatif.initial(draft);
  expect(knobs).toEqual({
    simulationDate: '2026-11-23',
    noTrips: false,
    natLanguage: undefined,
    natKnowledge: undefined,
    residenceLanguage: undefined,
    income: undefined,
  });
  expect(whatif.apply(draft, knobs)).toEqual(activePortugalAnswers(draft));
  const later = whatif.apply(draft, { ...knobs, simulationDate: '2028-07-01' });
  expect(
    whatif.validate(later, { ...knobs, simulationDate: '2028-07-01' }),
  ).toEqual({});
  const after = pathway(later, 'PT-PARTNER-NATIONALITY');
  expect(after.status).toBe('MET');
  expect(after.earliestDate).toBe('2028-07-01');
  expect(draft.simulationDate).toBe('2026-11-23');

  const language = whatif.apply(draft, {
    ...knobs,
    natLanguage: true,
    natKnowledge: true,
  });
  expect(language.nationality).toMatchObject({
    newLanguageAccepted: true,
    cultureAccepted: true,
    civicsAccepted: true,
  });
  expect(
    pathway(language, 'PT-NATURALISATION').checks.find(
      (check) => check.id === 'PT-A03',
    )!.status,
  ).toBe('MET');

  const permanent = permanentDraft();
  const residenceKnobs = whatif.initial(permanent);
  expect(residenceKnobs.income).toBe(1473.84);
  expect(residenceKnobs.residenceLanguage).toBeUndefined();
  const poorer = whatif.apply(permanent, { ...residenceKnobs, income: 1000 });
  expect(
    pathway(poorer, 'PT-PERMANENT').checks.find((c) => c.id === 'PT-B03')!
      .status,
  ).toBe('NOT_MET');
  const noLanguage = whatif.apply(permanent, {
    ...residenceKnobs,
    residenceLanguage: false,
  });
  expect(noLanguage.residence.language).toEqual({ kind: 'none' });
  const travelling: PortugalDraft = {
    ...permanent,
    trips: [{ departed: '2020-01-01', returned: '2020-12-01' }],
  };
  expect(
    whatif.apply(travelling, { ...whatif.initial(travelling), noTrips: true })
      .trips,
  ).toEqual([]);
  expect(
    whatif.validate(permanent, { ...residenceKnobs, simulationDate: 'x' }),
  ).toEqual({ date: 'pt.error.date' });
  const filed = { ...draft, pendingApplication: '2026-10-01' };
  expect(
    whatif.validate(
      whatif.apply(filed, { ...knobs, simulationDate: '2026-09-01' }),
      { ...knobs, simulationDate: '2026-09-01' },
    ),
  ).toEqual({ date: 'pt.error.afterSimulation' });

  expect(whatif.focusForRule('PT-A03', 'PT-NATURALISATION')).toBe(
    'natLanguage',
  );
  expect(whatif.focusForRule('PT-G01', 'PT-PARTNER-NATIONALITY')).toBe('date');
  expect(whatif.focusForRule('PT-B03', 'PT-PERMANENT')).toBe('income');
  const every: PortugalDraft = {
    ...permanentDraft(),
    targets: ['naturalisation', 'permanent', 'partner'],
  };
  const controls = render(<WhatIfView country={pt} draft={every} />);
  for (const focus of Object.values(whatif.focusControls))
    expect(controls).toContain(`id="${focus}"`);
});

// Requests that reach every branch of evaluatePortugalFull.
const at = '2026-11-23';
const base: PtFullRequest = {
  simulationDate: at,
  route: 'other',
  birthDate: '1990-01-01',
  permits: [{ kind: 'temporary', from: '2015-10-01', to: '2027-01-22' }],
  trips: [],
};
const branches: PtFullRequest[] = [
  {
    ...base,
    residence: { statusCancellation: 'clear' },
    longTerm: { basis: 'ordinary' },
    investment: {
      operation: 'grant',
      holder: 'investor',
      investment: { kind: 'jobs' },
    },
    renewal: {
      receiptIssuedOn: at,
      filedOn: '2026-11-01',
      releasedOn: '2026-10-01',
      purpose: 'study',
    },
    partner: { kind: 'marriage' },
  },
  {
    ...base,
    route: 'stateless',
    longTerm: { basis: 'international-protection' },
    investment: { operation: 'grant', holder: 'family' },
    freeMovement: { basis: 'retained-family' },
    partner: { kind: 'civil-partnership' },
  },
  {
    ...base,
    pendingApplication: '2026-01-15',
    residenceApplied: '2022-12-01',
    permits: [
      { kind: 'temporary', from: '2023-01-01' },
      { kind: 'permanent', from: '2025-06-01' },
    ],
    permanentOperation: 'replace',
    longTerm: { basis: 'blue-card' },
    investment: { operation: 'grant', investment: { kind: 'research' } },
    freeMovement: {
      basis: 'early-worker',
      earlyWorker: { reason: 'retirement' },
    },
    partner: { kind: 'marriage', pendingApplication: '2026-01-15' },
  },
  {
    ...base,
    pendingApplication: '2026-05-19',
    permits: [
      { kind: 'temporary', from: '2015-10-01', to: '2021-01-01' },
      { kind: 'eu-long-term', from: '2021-01-02' },
      { kind: 'golden-visa', from: '2025-01-10', to: '2027-01-09' },
    ],
    investment: { investment: { kind: 'legacy' } },
    freeMovement: { basis: 'early-family' },
    partner: { pendingApplication: '2026-05-19' },
  },
  {
    ...base,
    longTerm: { operation: 'recover' },
    investment: { operation: 'convert' },
    freeMovement: {
      operation: 'retain',
      permanentRightAcquiredOn: '2020-01-01',
    },
  },
  ...(['culture', 'fund', 'company'] as const).map((kind): PtFullRequest => ({
    ...base,
    investment: { operation: 'grant', investment: { kind } as never },
  })),
  { ...base, investment: { operation: 'grant' } },
  { ...base, investment: { operation: 'replace-permanent' } },
];

test('the policy page lists every engine condition with its sources and pending details', () => {
  const rules = new Map(
    pt.policy.rules['pt.current-law'].map((rule) => [rule.id, rule]),
  );
  const seen = new Set<string>();
  for (const request of branches)
    for (const locale of ['zh-CN', 'en'] as const)
      for (const path of evaluatePortugalFull({ ...request, locale }).columns[0]
        .pathways)
        for (const check of path.checks) {
          seen.add(check.id);
          const rule = rules.get(check.id);
          expect(rule, check.id).toBeDefined();
          for (const source of check.sources)
            expect(rule!.sources, check.id).toContainEqual(source);
          for (const pd of check.pendingDetails ?? [])
            expect(rule!.pendingDetails, check.id).toContain(pd);
        }
  expect([...rules.keys()].sort()).toEqual([...seen].sort());
  expect(seen.size).toBe(108);

  // Only Portuguese sources appear, and each has an archived address.
  const used = new Set(
    [...rules.values()].flatMap((rule) =>
      rule.sources.map((source) => source.srcId),
    ),
  );
  expect(Object.keys(pt.policy.sourceUrls).sort()).toEqual(
    Object.keys(sourceUrls)
      .filter(
        (id) =>
          used.has(id) ||
          pt.policy.ruleSets[0].sources.some((s) => s.srcId === id) ||
          Object.values(pt.policy.parameters['pt.current-law'].values).some(
            (parameter) => parameter.sources.some((s) => s.srcId === id),
          ) ||
          pt.policy.changelog.some((change) =>
            change.sources.some((s) => s.srcId === id),
          ),
      )
      .sort(),
  );
  for (const id of Object.keys(pt.policy.sourceUrls)) {
    const n = Number(id.slice(4));
    expect(id, id).toMatch(/^SRC-\d+$/);
    expect((n >= 120 && n <= 127) || (n >= 470 && n <= 499), id).toBe(true);
  }
  for (const id of used) expect(pt.policy.sourceUrls[id], id).toBeTruthy();
});

test.each(['zh-CN', 'en'] as const)(
  'the Portugal policy page shows its title, routes and sources in %s',
  (locale) => {
    const html = render(<PortugalPolicyPage />, locale);
    expect(html).toContain(t('pt.policy.pageTitle', locale));
    expect(html).toContain(t('pt.target.partner', locale));
    expect(html).toContain('data-source="SRC-120"');
    expect(html).toContain('data-rule="PT-G01"');
    expect(html).not.toContain('data-source="SRC-001"');
    expect(html).toContain(t('pt.policy.nationalityChange', locale));
  },
);
