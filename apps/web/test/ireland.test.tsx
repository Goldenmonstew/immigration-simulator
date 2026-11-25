import { renderToStaticMarkup } from 'react-dom/server';
import { expect, test, vi } from 'vitest';
import { usePathname } from 'next/navigation';
import {
  IRELAND_CONDITION_IDS,
  evaluateIrelandFull,
  type IrelandFullPathwayId,
} from '@uk-immigration/engine';
import IrelandPage from '../app/ireland/page';
import IrelandPolicyPage from '../app/ireland/policy/page';
import { toggleOption } from '../app/ireland/simulate/fields';
import IrelandSimulatePage from '../app/ireland/simulate/page';
import { IrelandWhatIfControls } from '../app/ireland/whatif/controls';
import { GET as offlinePages } from '../app/offline-pages.json/route';
import Home from '../app/page';
import sitemap from '../app/sitemap';
import { ResultView } from '../components/result-view';
import { SiteShell } from '../components/site-shell';
import { gapRules } from '../lib/gap-summary';
import { t, type TranslationKey } from '../i18n';
import { LocaleContext } from '../i18n/locale';
import {
  IRELAND_PATHWAYS,
  activeIrelandAnswers,
  irelandRequest,
  irelandSteps,
  shownField,
  type IrelandDraft,
} from '../lib/ireland-draft';
import {
  familySections,
  topFields,
  type IrelandField,
  type IrelandFields,
} from '../lib/ireland-fields';
import { irelandModule as ie } from '../lib/ireland-module';
import { japanModule } from '../lib/japan-module';
import { readPageResult } from '../lib/page-result';
import { decodeDraft, encodeDraft } from '../lib/share';
import { draftStorage } from '../lib/storage';
import { irelandFull2026_11 } from '@uk-immigration/policy-data';

vi.mock('next/navigation', async (importOriginal) => ({
  ...(await importOriginal<typeof import('next/navigation')>()),
  usePathname: vi.fn(),
}));

const day = '2026-11-23';
const render = (node: React.ReactNode, locale: 'zh-CN' | 'en' = 'zh-CN') =>
  renderToStaticMarkup(
    <LocaleContext value={{ locale, setLocale: () => {} }}>
      {node}
    </LocaleContext>,
  );
const good = { record: 'none', disclosed: true } as const;
const registration = {
  basis: 'required',
  irpExpiresOn: '2027-01-31',
  validPermission: true,
  passportValid: true,
  addressCurrent: true,
  registrationDate: day,
  feeExemption: 'none',
  feePrepared: true,
} as const;
// Work Stamp 4 after 21 months on a Critical Skills permit (SRC-096).
const workDraft: IrelandDraft = {
  version: 1,
  step: 3,
  completed: true,
  simulationDate: day,
  pathways: ['IE-STAMP4-21'],
  dateOfBirth: '1990-01-01',
  currentLocation: 'state',
  permissions: [{ kind: 'stamp1-csep', from: '2025-05-20' }],
  trips: [],
  employmentStart: '2025-05-20',
  registration,
  work: {
    basis: 'csep',
    validCorrespondingPermission: true,
    employedInState: true,
    passportIrpAndPermits: true,
    payslipAndRevenueEvidence: true,
    employerLetterOn: '2026-08-23',
    recordsConsistent: true,
    termsComplied: true,
    character: good,
    permissionRevoked: false,
    isdApproved: true,
  },
};
// Ordinary naturalisation with every statutory and procedural fact confirmed.
const naturalisationDraft: IrelandDraft = {
  version: 1,
  step: 2,
  completed: true,
  simulationDate: day,
  pathways: ['IE-NATURALISATION'],
  dateOfBirth: '1985-01-01',
  currentLocation: 'state',
  permissions: [{ kind: 'stamp4', from: '2016-01-01' }],
  trips: [],
  registration: { ...registration, irpExpiresOn: '2027-01-01' },
  citizenship: {
    entitlement: 'none',
    character: good,
    vetting: 'completed',
    intendToReside: 'state',
    willingToDeclare: true,
    identityDocuments: ['validPassport'],
    birthCertificateOrAcceptedAlternative: true,
    prescribedFormAndWitness: true,
    refereeCount: 3,
    residenceEvidence: {
      requiredYears: [2025],
      years: [{ year: 2025, strong: 1, supporting: 1 }],
    },
    applicationFeePrepared: true,
    approved: true,
    certificateFeePaid: true,
    addressUpdated: true,
    survivorFeeConditions: false,
  },
};

function pathway(
  draft: IrelandDraft,
  id: string,
  locale: 'zh-CN' | 'en' = 'zh-CN',
) {
  return ie.run(draft, locale).columns[0].pathways.find((p) => p.id === id)!;
}

test.each(['zh-CN', 'en'] as const)(
  'the Ireland home page renders in %s',
  (locale) => {
    const html = render(<IrelandPage />, locale);
    expect(html).toContain('href="/ireland/simulate"');
    expect(html).toContain('href="/ireland/policy"');
    for (const key of ['ie.title', 'ie.intro', 'ie.prepare'] as const)
      expect(html).toContain(t(key, locale).replaceAll('’', '’'));
    expect(render(<Home />, locale)).toContain('href="/ireland"');
  },
);

test('all five Ireland pages are in the offline list and sitemap', async () => {
  const offline = await offlinePages().json();
  const paths = sitemap().map(({ url }) => new URL(url).pathname);
  for (const sub of ['', '/simulate', '/result', '/whatif', '/policy']) {
    expect(offline).toContain('/ireland' + sub);
    expect(paths).toContain('/ireland' + sub);
  }
});

test('every question, hint and option has Chinese and English wording', () => {
  const missing: string[] = [];
  const need = (key: string) => {
    for (const locale of ['zh-CN', 'en'] as const)
      if (!t(key as TranslationKey, locale)) missing.push(`${locale} ${key}`);
  };
  const walk = (fields: IrelandFields) => {
    for (const [name, field] of Object.entries(fields)) {
      const label = field.label ?? name;
      need(`ie.field.${label}`);
      if (field.hint) need(`ie.hint.${field.hint}`);
      if (field.type === 'choice' || field.type === 'multi')
        for (const option of field.options)
          need(`ie.option.${label}.${option}`);
      if (field.blank) need(`ie.option.${label}.${field.blank}`);
      if (field.type === 'group' || field.type === 'list') walk(field.fields);
    }
  };
  walk(topFields);
  for (const section of familySections)
    need(`ie.form.section.${section.title}`);
  for (let step = 0; step < 7; step++) {
    need(`ie.form.step${step}`);
    need(`ie.form.intro${step}`);
  }
  need('ie.form.intro1Treaty');
  expect(missing).toEqual([]);
});

test('every questionnaire step renders its questions with ids that match validation', () => {
  const all: IrelandDraft = {
    ...naturalisationDraft,
    pathways: [...IRELAND_PATHWAYS],
    trips: [{ departed: '2026-01-02', returned: '2025-12-31' }],
  };
  const steps = irelandSteps(all);
  expect(steps.map(({ step }) => step)).toEqual([0, 1, 2, 3, 4, 5, 6]);
  for (const { step, title } of steps) {
    const draft = { ...all, step };
    const html = render(
      IrelandSimulatePage().props.children({
        draft,
        errors: ie.validateStep(draft),
        update: () => {},
      }),
      'en',
    );
    expect(html).not.toContain('undefined');
    expect(t(title, 'en')).toBeTruthy();
    for (const id of Object.keys(ie.validateStep(draft)))
      expect(html).toContain(`id="${id}"`);
  }
  const step0 = render(
    IrelandSimulatePage().props.children({
      draft: { ...ie.createDraft(), simulationDate: day },
      errors: {},
      update: () => {},
    }),
  );
  for (const id of [
    'ie-simulationDate',
    'ie-dateOfBirth',
    'ie-currentLocation',
    'ie-pathway-IE-STAMP4-21',
    'ie-pathways',
  ])
    expect(step0).toContain(`id="${id}"`);
});

test('steps require pathways, answered lists, valid dates and ordered periods', () => {
  const blank = { ...ie.createDraft(), simulationDate: '' };
  expect(ie.validateStep(blank)).toEqual({
    'ie-simulationDate': 'ie.error.required',
    'ie-pathways': 'ie.error.pathways',
  });
  const records: IrelandDraft = {
    ...workDraft,
    step: 1,
    permissions: undefined,
    trips: [{ departed: '2026-03-10', returned: '2026-03-01' }],
    registration: { irpExpiresOn: '2027-13-01' },
  };
  expect(ie.validateStep(records)).toEqual({
    'ie-permissions': 'ie.error.list',
    'ie-trips-0-returned': 'ie.error.order',
    'ie-registration-irpExpiresOn': 'ie.error.date',
  });
  // An empty list confirms there are none.
  expect(
    ie.validateStep({ ...records, permissions: [], trips: [], registration }),
  ).toEqual({});
  // A group that has been started must complete its starred questions.
  expect(
    ie.validateStep({
      ...naturalisationDraft,
      citizenship: {
        refereeCount: 1.5,
        residenceEvidence: {
          requiredYears: [2025, ''] as never,
          years: [{}] as never,
        },
      },
    }),
  ).toEqual({
    'ie-citizenship-refereeCount': 'ie.error.number',
    'ie-citizenship-residenceEvidence-requiredYears-1': 'ie.error.required',
    'ie-citizenship-residenceEvidence-years-0-year': 'ie.error.required',
    'ie-citizenship-residenceEvidence-years-0-strong': 'ie.error.required',
    'ie-citizenship-residenceEvidence-years-0-supporting': 'ie.error.required',
  });
  // EU-only drafts do not ask for Stamp permissions or trips.
  expect(
    ie.validateStep({
      ...ie.createDraft(),
      step: 1,
      pathways: ['IE-EU-PERMANENT'],
    }),
  ).toEqual({});
});

test('drafts round-trip in the country envelope and keep unanswered apart from none', () => {
  const draft: IrelandDraft = {
    ...naturalisationDraft,
    pathways: ['IE-NATURALISATION', 'IE-SPOUSE'],
    marriedOn: '2023-11-23',
    citizenship: {
      ...naturalisationDraft.citizenship,
      residence: [],
      spouse: { postingPeriods: [], waivedConditions: [] },
    },
  };
  const decoded = decodeDraft(ie, encodeDraft(ie, draft))!;
  expect(decoded).toEqual(draft);
  expect(decoded.citizenship?.residence).toEqual([]);
  expect(decoded.citizenship?.unregisteredResidenceEvidence).toBeUndefined();
  expect(decodeDraft(japanModule, encodeDraft(ie, draft))).toBeUndefined();
  expect(
    decodeDraft(ie, encodeDraft(japanModule, japanModule.createDraft())),
  ).toBeUndefined();
  const fresh = ie.createDraft();
  expect(ie.decodeDraft(fresh)).toEqual(fresh);
  for (const bad of [
    null,
    { ...draft, version: 2 },
    { ...draft, step: 9 },
    { ...draft, pathways: ['IE-MADE-UP'] },
    { ...draft, trips: 'none' },
    { ...draft, registration: { validPermission: 'yes' } },
    { ...draft, citizenship: { identityDocuments: ['library-card'] } },
  ])
    expect(ie.decodeDraft(bad)).toBeUndefined();
  // A shared result must pass every visible step; a correction keeps the draft.
  const incomplete = { ...draft, permissions: undefined };
  expect(ie.decodeDraft(incomplete, true)).toBeUndefined();
  expect(ie.decodeDraft(incomplete, 'show-correction')).toMatchObject({
    completed: false,
    step: 1,
  });
});

test('results follow the pathway order whatever order they were ticked in', () => {
  const draft = {
    ...naturalisationDraft,
    pathways: ['IE-STAMP5', 'IE-NATURALISATION'],
  } satisfies IrelandDraft;
  expect(ie.run(draft, 'zh-CN').columns[0].pathways.map((p) => p.id)).toEqual([
    'IE-NATURALISATION',
    'IE-STAMP5',
  ]);
});

test('answers for pathways that are not selected stay out of the assessment and the link', () => {
  const draft: IrelandDraft = {
    ...workDraft,
    pathways: ['IE-STAMP4-21', 'IE-EU-PERMANENT'],
    marriedOn: '2020-01-01',
    citizenship: { vetting: 'completed', spouse: { irishCitizen: true } },
    eu: { role: 'citizen', wa: { britishOrQualifyingFamily: true } },
    wa: { role: 'citizen' },
  };
  const active = activeIrelandAnswers(draft);
  expect(active.marriedOn).toBeUndefined();
  expect(active.citizenship).toBeUndefined();
  expect(active.wa).toBeUndefined();
  expect(active.eu).toEqual({ role: 'citizen' });
  expect(active.work).toEqual(workDraft.work);
  const withNaturalisation = activeIrelandAnswers({
    ...draft,
    pathways: ['IE-NATURALISATION'],
  });
  expect(withNaturalisation.citizenship).toEqual({ vetting: 'completed' });
});

test('a fully evidenced ordinary naturalisation is met on the simulation date', () => {
  const route = pathway(naturalisationDraft, 'IE-NATURALISATION');
  expect(route).toMatchObject({ status: 'MET', earliestDate: day });
  expect(route.checks.map((check) => check.id)).toEqual(
    expect.arrayContaining([
      'IE-A01',
      'IE-A12',
      'IE-NAT-CONTINUOUS',
      'IE-NAT-PRIOR',
    ]),
  );
  // No condition repeats its own title as the explanation.
  for (const check of route.checks)
    expect(check.explanation).not.toBe(check.title);
});

test('a work Stamp 4 upgrade is projected after 21 months, with a note about documents', () => {
  const route = pathway(workDraft, 'IE-STAMP4-21');
  expect(route).toMatchObject({ status: 'FUTURE', earliestDate: '2027-02-20' });
  // The time check shows a short title over the engine's full sentence.
  const time = route.checks.find((c) => c.id === 'IE-STAMP4-WORK-TIME')!;
  expect(time).toMatchObject({
    status: 'NOT_MET',
    title: t('ie.policy.rule.stamp4WorkTime'),
  });
  expect(time.explanation).toContain('自 2025-05-20 开始受雇满 21 个月');
  expect(route.summary).toContain(t('ie.result.projectedWork'));
  // The IRP expires before the projected date (PD-321).
  expect(route.summary).toContain('2027-01-31');
  expect(pathway(workDraft, 'IE-STAMP4-21', 'en').summary).toContain(
    t('ie.result.projectedWork', 'en'),
  );
});

test('missing facts leave a naturalisation pending with registered details', () => {
  const draft: IrelandDraft = {
    ...ie.createDraft(),
    simulationDate: day,
    completed: true,
    pathways: ['IE-NATURALISATION'],
    permissions: [{ kind: 'stamp4', from: '2016-01-01' }],
    trips: [],
  };
  const route = pathway(draft, 'IE-NATURALISATION');
  expect(route.status).toBe('UNKNOWN');
  expect(route.earliestDate).toBeUndefined();
  const a01 = route.checks.find((check) => check.id === 'IE-A01')!;
  expect(a01.status).toBe('UNKNOWN');
  expect(route.pendingDetails).toContain('PD-320');
});

test('comparison knobs change a copy of the answers and point to their conditions', () => {
  const knobs = ie.whatif.initial(workDraft);
  expect(knobs).toEqual({
    simulationDate: day,
    noTrips: false,
    employmentStart: '2025-05-20',
    irpExpiresOn: '2027-01-31',
    income: undefined,
  });
  expect(ie.whatif.apply(workDraft, knobs)).toEqual(
    activeIrelandAnswers(workDraft),
  );
  const later = ie.whatif.apply(workDraft, {
    ...knobs,
    employmentStart: '2025-09-10',
  });
  expect(later.employmentStart).toBe('2025-09-10');
  expect(workDraft.employmentStart).toBe('2025-05-20');
  expect(pathway(later, 'IE-STAMP4-21')).toMatchObject({
    status: 'FUTURE',
    earliestDate: '2027-06-10',
  });
  expect(ie.whatif.validate(later, knobs)).toEqual({});
  // Moving the date past the employer letter's validity fails B04.
  const moved = ie.whatif.apply(workDraft, {
    ...knobs,
    simulationDate: '2027-02-20',
  });
  expect(pathway(moved, 'IE-STAMP4-21').status).toBe('NOT_MET');

  const trips = {
    ...naturalisationDraft,
    trips: [{ departed: '2026-01-01', returned: '2026-03-31' }],
  };
  expect(
    ie.whatif.apply(trips, { ...ie.whatif.initial(trips), noTrips: true })
      .trips,
  ).toEqual([]);
  const family: IrelandDraft = {
    ...workDraft,
    pathways: ['IE-STAMP4-IRISH-FAMILY'],
    family: { application: { grossTaxYears: [20000, 25000, 26000] } },
  };
  expect(ie.whatif.initial(family).income).toBe(26000);
  expect(
    ie.whatif.apply(family, { ...ie.whatif.initial(family), income: 30000 })
      .family?.application?.grossTaxYears,
  ).toEqual([20000, 25000, 30000]);
  expect(
    ie.whatif.validate(workDraft, { ...knobs, simulationDate: '', income: -1 }),
  ).toEqual({
    date: 'ie.error.date',
    income: 'ie.error.number',
  });

  expect(ie.whatif.focusForRule('IE-STAMP4-WORK-TIME', 'IE-STAMP4-21')).toBe(
    'employment',
  );
  expect(ie.whatif.focusForRule('IE-NAT-ABSENCES', 'IE-NATURALISATION')).toBe(
    'trips',
  );
  expect(ie.whatif.focusForRule('IE-B17', 'IE-STAMP4-IRISH-FAMILY')).toBe(
    'income',
  );
  const controls = render(
    <IrelandWhatIfControls
      afterDraft={{ ...workDraft, pathways: [...IRELAND_PATHWAYS] }}
      knobs={knobs}
      errors={{}}
      update={() => {}}
    />,
  );
  for (const id of Object.values(ie.whatif.focusControls))
    expect(controls).toContain(`id="${id}"`);
});

test('the Ireland policy page lists pathways, conditions and only Irish sources', () => {
  const { policy } = ie;
  expect(policy.pathways).toHaveLength(16);
  const rules = policy.rules['ie.current-law-2026-11'].map((rule) => rule.id);
  for (const id of IRELAND_CONDITION_IDS) expect(rules).toContain(`IE-${id}`);
  expect(rules).toContain('IE-NAT-ABSENCES');
  const html = render(<IrelandPolicyPage />);
  expect(html).toContain(t('ie.policy.pageTitle'));
  expect(html).toContain('data-source="SRC-091"');
  expect(html).toContain('data-source="SRC-390"');
  expect(html).not.toContain('data-source="SRC-001"');
  expect(html).not.toContain('data-source="SRC-110"');
  expect(render(<IrelandPolicyPage />, 'en')).toContain(
    'Policy basis for Ireland',
  );
  // Every source cited by a result is in the policy page's list.
  const cited = new Set<string>();
  for (const draft of [naturalisationDraft, workDraft]) {
    const all: IrelandDraft = { ...draft, pathways: [...IRELAND_PATHWAYS] };
    const result = render(
      <ResultView country={ie} result={ie.run(all, 'zh-CN')} draft={all} />,
    );
    for (const id of result.match(/\bSRC-\d+\b/g) ?? []) cited.add(id);
  }
  expect(cited).toContain('SRC-094');
  for (const id of cited) expect(html).toContain(`data-source="${id}"`);
});

// A filled-in draft with every question answered (or, when sparse, about two
// thirds of the optional ones), varied by seed so that different engine
// branches run.
const sample = [
  '2015-03-01',
  '2020-06-15',
  '2025-01-10',
  '2026-11-23',
  '2027-03-01',
];
function filled(seed: number, sparse: boolean): IrelandDraft {
  let n = seed;
  const next = () => (n = (n * 1103515245 + 12345) % 2147483648);
  const fill = (fields: IrelandFields) => {
    const record: Record<string, unknown> = {};
    for (const [name, field] of Object.entries(fields)) {
      if (sparse && !field.required && next() % 3 === 0) continue;
      const pick = next();
      switch (field.type) {
        case 'boolean':
          record[name] = pick % 2 === 0;
          break;
        case 'choice':
          record[name] = field.options[pick % field.options.length];
          break;
        case 'multi':
          record[name] = field.options.filter((_, i) => (pick >> i) & 1);
          break;
        case 'date':
          record[name] = sample[pick % sample.length];
          break;
        case 'datetime':
          record[name] = '2020-12-31T23:00Z';
          break;
        case 'number':
          record[name] = [0.2, 3, 60000][pick % 3];
          break;
        case 'integer':
          record[name] = [0, 2, 12][pick % 3];
          break;
        case 'numbers':
          record[name] = [60000, 70000, 80000];
          break;
        case 'dates':
          record[name] = [sample[pick % sample.length]];
          break;
        case 'group':
          record[name] = fill(field.fields);
          break;
        case 'list':
          record[name] = [fill(field.fields), fill(field.fields)];
      }
    }
    // Validation keeps end dates on or after their start.
    for (const [first, last] of [
      ['from', 'to'],
      ['departed', 'returned'],
      ['leftOn', 'returnedOn'],
      ['offerFrom', 'offerEnd'],
    ]) {
      const [from, to] = [record[first], record[last]] as string[];
      if (from && to && to < from) [record[first], record[last]] = [to, from];
    }
    return record;
  };
  return {
    ...(fill(topFields) as Partial<IrelandDraft>),
    version: 1,
    step: 0,
    completed: true,
    simulationDate: day,
    dateOfBirth: seed % 2 ? '2012-05-01' : '1985-01-01',
    // Realistic records keep the residence clocks quick to project.
    permissions:
      seed % 2
        ? [{ kind: 'stamp4', from: '2016-01-01' }]
        : [
            { kind: 'stamp1-csep', from: '2020-06-15', to: '2022-06-14' },
            { kind: 'stamp4', from: '2022-06-15' },
          ],
    trips: seed % 2 ? [] : [{ departed: '2025-07-01', returned: '2025-07-20' }],
    pathways: [...IRELAND_PATHWAYS],
  };
}
const samples = [0, 1, 2, 3, 4, 5].map((seed) => filled(seed, seed >= 3));
// Each sample runs all 16 pathways; CI runners are about three times slower.
const slow = 30_000;

test(
  'each pathway sees every answer the engine reads for it, whatever else is selected',
  () => {
    const differences: string[] = [];
    for (const [seed, draft] of samples.entries()) {
      const together = ie.run(draft, 'en').columns[0].pathways;
      for (const id of IRELAND_PATHWAYS) {
        const request = irelandRequest(draft, id);
        // The same answers without removing questions hidden for this pathway.
        const unpruned = evaluateIrelandFull({
          ...draft,
          permissions: draft.permissions ?? [],
          trips: draft.trips ?? [],
          registration: {
            ...draft.registration,
            stage: request.registration?.stage,
          },
          family: request.family?.application?.registrationStage
            ? {
                ...draft.family,
                application: {
                  ...draft.family?.application,
                  registrationStage:
                    request.family.application.registrationStage,
                },
              }
            : draft.family,
          pathways: [id],
          locale: 'en',
        }).columns[0].pathways[0];
        const pruned = evaluateIrelandFull({ ...request, locale: 'en' })
          .columns[0].pathways[0];
        if (JSON.stringify(pruned) !== JSON.stringify(unpruned))
          differences.push(`hidden answer read: seed ${seed} ${id}`);
        const alone = ie.run({ ...draft, pathways: [id] }, 'en').columns[0]
          .pathways[0];
        if (
          JSON.stringify(alone) !==
          JSON.stringify(together.find((pathway) => pathway.id === id))
        )
          differences.push(`depends on other pathways: seed ${seed} ${id}`);
      }
    }
    expect(differences).toEqual([]);
  },
  slow,
);

test('minors on the Irish associations and public service routes can be represented', () => {
  const minor: IrelandDraft = {
    ...naturalisationDraft,
    dateOfBirth: '2014-03-01',
    citizenship: {
      ...naturalisationDraft.citizenship,
      minor: { authorisedRepresentative: true },
    },
  };
  for (const id of ['IE-IRISH-ASSOCIATIONS', 'IE-PUBLIC-SERVICE'] as const) {
    const draft = { ...minor, pathways: [id] };
    const a01 = pathway(draft, id).checks.find((c) => c.id === 'IE-A01');
    expect(a01?.status).toBe('MET');
    const html = render(
      IrelandSimulatePage().props.children({
        draft,
        errors: {},
        update: () => {},
      }),
    );
    expect(html).toContain(
      'id="ie-citizenship-minor-authorisedRepresentative"',
    );
    // Questions and sections only other routes use stay hidden.
    expect(html).not.toContain('id="ie-citizenship-minor-characterWaived"');
    expect(html).not.toContain(t('ie.form.section.natSpouse'));
    // The result does not change when another minor route is also selected.
    expect(
      pathway({ ...draft, pathways: [id, 'IE-MINOR-BORN-IN-STATE'] }, id),
    ).toEqual(pathway(draft, id));
  }
});

test('a recognised refugee on ordinary naturalisation can confirm the fee exemption', () => {
  const draft: IrelandDraft = {
    ...naturalisationDraft,
    citizenship: {
      ...naturalisationDraft.citizenship,
      protection: {
        kind: 'convention-refugee',
        validRecognition: true,
        certificationFeeExemptionConfirmed: true,
      },
    },
  };
  const a10 = pathway(draft, 'IE-NATURALISATION').checks.find(
    (c) => c.id === 'IE-A10',
  )!;
  expect(a10.status).toBe('MET');
  expect(a10.explanation).toContain('€0');
  expect(
    pathway(
      { ...draft, pathways: ['IE-NATURALISATION', 'IE-PROTECTION'] },
      'IE-NATURALISATION',
    ),
  ).toEqual(pathway(draft, 'IE-NATURALISATION'));
});

test('first registration and renewal are chosen on each pathway’s own step', () => {
  const stage1 = render(
    IrelandSimulatePage().props.children({
      draft: { ...workDraft, step: 1 },
      errors: {},
      update: () => {},
    }),
  );
  expect(stage1).not.toContain('id="ie-registration-stage"');
  // An IRP renewal answer kept from elsewhere does not replace the upgrade.
  const stale = {
    ...workDraft,
    registration: { ...registration, stage: 'renewal' },
  } satisfies IrelandDraft;
  expect(pathway(stale, 'IE-STAMP4-21')).toEqual(
    pathway(workDraft, 'IE-STAMP4-21'),
  );
  expect(pathway(workDraft, 'IE-STAMP4-21').title).toBe(
    '就业类 Stamp 4（CSEP、研究员、多地点 GEP 医师）',
  );
  const renewal = pathway(
    { ...workDraft, workStage: 'renewal' },
    'IE-STAMP4-21',
  );
  expect(renewal.title).toBe('现有许可续期');
  expect(renewal.checks.map((c) => c.id)).toContain('IE-IRP-CHECKLIST');
  expect(
    pathway({ ...workDraft, workStage: 'first' }, 'IE-STAMP4-21').title,
  ).toBe('首次登记');

  // Stamp 5 and LTR stay applications unless their own step says renewal.
  const residence: IrelandDraft = {
    ...workDraft,
    pathways: ['IE-STAMP5', 'IE-LTR-PRINCIPAL', 'IE-EU-PERMANENT'],
    permissions: [{ kind: 'stamp1-csep', from: '2016-01-01' }],
    stamp5: { renewWithPassport: true },
    ltr: { maintenance: { renewal: true } as never },
    eu: { role: 'citizen' },
  };
  const ids = (id: string, draft = residence) =>
    pathway(draft, id).checks.map((c) => c.id);
  expect(ids('IE-STAMP5')).toContain('IE-WCATT-TIME');
  expect(ids('IE-LTR-PRINCIPAL')).toContain('IE-C01');
  expect(ids('IE-LTR-PRINCIPAL')).not.toContain('IE-IRP-RENEWAL-WINDOW');
  expect(ids('IE-EU-PERMANENT')).not.toContain('IE-IRP-RENEWAL-WINDOW');
  const renewing: IrelandDraft = {
    ...residence,
    stamp5Stage: 'renewal',
    ltrStage: 'renewal',
    euStage: 'renewal',
  };
  expect(ids('IE-STAMP5', renewing)).not.toContain('IE-WCATT-TIME');
  expect(ids('IE-STAMP5', renewing)).toContain('IE-IRP-RENEWAL-WINDOW');
  expect(ids('IE-LTR-PRINCIPAL', renewing)).toContain('IE-IRP-RENEWAL-WINDOW');
  expect(ids('IE-EU-PERMANENT', renewing)).toContain('IE-IRP-RENEWAL-WINDOW');
  for (const [step, names] of [
    [3, ['workStage']],
    [5, ['stamp5Stage', 'ltrStage']],
    [6, ['euStage']],
  ] as const) {
    const html = render(
      IrelandSimulatePage().props.children({
        draft: { ...renewing, pathways: [...IRELAND_PATHWAYS], step },
        errors: {},
        update: () => {},
      }),
    );
    for (const name of names) expect(html).toContain(`id="ie-${name}"`);
  }
});

test('the family step asks what to assess, and a renewal answer does not replace the change to independent Stamp 4', () => {
  // review99-2 problem 1: independent Stamp 4 from family reunification.
  const family: IrelandDraft = {
    ...workDraft,
    step: 4,
    pathways: ['IE-STAMP4-INDEPENDENT-FAMILY'],
    permissions: [{ kind: 'stamp4', from: '2019-01-01' }],
    family: {
      relationship: 'spouse',
      establishedFamilyPermission: true,
      sponsorLawfulAndResident: true,
      dependentPeriods: [{ from: '2019-01-01' }],
      nextRenewalOn: '2026-12-20',
    },
  };
  const id = 'IE-STAMP4-INDEPENDENT-FAMILY';
  const independent = pathway(family, id);
  expect(independent).toMatchObject({
    status: 'FUTURE',
    earliestDate: '2026-12-20',
    title: '家庭团聚转独立 Stamp 4',
  });
  expect(independent.checks.map((c) => c.id)).toEqual(
    expect.arrayContaining(['IE-B11', 'IE-B12']),
  );
  // A stage answer kept in the family application from before is ignored.
  const stale: IrelandDraft = {
    ...family,
    family: { ...family.family, application: { registrationStage: 'renewal' } },
  };
  expect(pathway(stale, id)).toEqual(independent);
  const irish: IrelandDraft = {
    ...family,
    pathways: ['IE-STAMP4-IRISH-FAMILY'],
    family: { relationship: 'spouse', sponsorIrish: true },
  };
  expect(
    pathway(
      {
        ...irish,
        family: {
          ...irish.family,
          application: { registrationStage: 'renewal' },
        },
      },
      'IE-STAMP4-IRISH-FAMILY',
    ),
  ).toEqual(pathway(irish, 'IE-STAMP4-IRISH-FAMILY'));

  // The family step asks it first; unanswered is the application or change.
  expect(topFields.familyStage).toMatchObject({
    blank: 'new',
    hint: 'familyStage',
  });
  const html = render(
    IrelandSimulatePage().props.children({
      draft: family,
      errors: {},
      update: () => {},
    }),
  );
  expect(html).toContain('id="ie-familyStage"');
  expect(html.indexOf('id="ie-familyStage"')).toBeLessThan(
    html.indexOf(t('ie.form.section.famRelationship')),
  );
  expect(html).toContain(t('ie.option.familyStage.new'));
  expect(html).not.toContain('registrationStage');
  for (const key of ['ie.hint.familyStage', 'ie.form.intro4'] as const)
    expect(t(key)).toContain('转独立');

  // Renewal and first registration are chosen here.
  const renewal = pathway({ ...family, familyStage: 'renewal' }, id);
  expect(renewal.title).toBe('现有家庭许可续期');
  expect(renewal.checks.map((c) => c.id)).not.toContain('IE-B12');
  const first: IrelandDraft = {
    ...family,
    familyStage: 'first',
    family: { ...family.family, application: { channel: 'ordinary' } },
  };
  expect(pathway(first, id).title).toBe('首次登记');
  expect(ie.validateStep(first)).toEqual({});
  // A first registration needs a channel that has one; otherwise the answer
  // would quietly assess the application instead.
  for (const channel of [
    undefined,
    'spouse-in-state',
    'de-facto-in-state',
  ] as const)
    expect(
      ie.validateStep({
        ...first,
        family: { ...first.family, application: { channel } },
      }),
    ).toEqual({ 'ie-familyStage': 'ie.error.familyFirstChannel' });
  expect(t('ie.error.familyFirstChannel')).toContain(
    t('ie.form.section.famChannel'),
  );
});

// Leaf questions and innermost groups shown for one pathway, as draft paths.
type Unit = { path: string[]; field: IrelandField };
function units(
  fields: IrelandFields,
  draft: IrelandDraft,
  path: string[] = [],
): Unit[] {
  return Object.entries(fields).flatMap(([name, field]): Unit[] => {
    if (!shownField(field, draft)) return [];
    const at = [...path, name];
    if (field.type === 'group') {
      const inner = units(field.fields, draft, at);
      return Object.values(field.fields).some((f) => f.type === 'group')
        ? inner
        : [{ path: at, field }, ...inner];
    }
    return ['boolean', 'choice', 'date', 'integer', 'number'].includes(
      field.type,
    )
      ? [{ path: at, field }]
      : [];
  });
}
const answerAt = (draft: IrelandDraft, path: string[]) =>
  path.reduce<unknown>(
    (value, key) => (value as Record<string, unknown> | undefined)?.[key],
    draft,
  );
function withAnswer(
  draft: IrelandDraft,
  path: string[],
  value: unknown,
): IrelandDraft {
  const copy = structuredClone(draft) as unknown as Record<string, unknown>;
  let record = copy;
  for (const key of path.slice(0, -1))
    record = (record[key] ??= {}) as Record<string, unknown>;
  if (value === undefined) delete record[path.at(-1)!];
  else record[path.at(-1)!] = value;
  return copy as unknown as IrelandDraft;
}
const within = (outer: string[], inner: string[]) =>
  outer.every((key, i) => inner[i] === key);

test(
  'stage hints list exactly the answers the engine reads as met when blank',
  () => {
    // Every answer the hint names, as dotted draft paths (review99-2 problem 2).
    type Item = {
      zh: string;
      en: string;
      paths: string[][];
      only?: IrelandFullPathwayId[];
      /** Only for this answer to the stage question. */
      when?: 'first' | 'renewal';
    };
    const item = (
      zh: string,
      en: string,
      paths: string[],
      only?: IrelandFullPathwayId[],
      when?: Item['when'],
    ): Item => ({
      zh,
      en,
      paths: paths.map((path) => path.split('.')),
      only,
      when,
    });
    const validIrp = item(
      'IRP 登记的有效许可',
      'valid permission in the IRP section',
      ['registration.validPermission'],
    );
    const shared = (group: string) => [
      item('遵守许可条件', 'compliance with permission conditions', [
        `${group}.termsComplied`,
      ]),
      item(
        '品格（刑事记录与披露）',
        'character (criminal record and disclosure)',
        [`${group}.character`],
      ),
      item('公帑负担', 'burden on the State', [`${group}.burden`]),
    ];
    const treatyItems = (group: string, id: IrelandFullPathwayId) => [
      item(
        '住址与身份变化通知',
        'address and status notices',
        [`${group}.document.addressAndStatusNotified`],
        [id],
      ),
      item(
        '长期出境通知',
        'prolonged absence notices',
        [`${group}.document.prolongedAbsenceNotified`],
        [id],
      ),
      item(
        '公共政策与安全审查',
        'public policy and security review',
        [`${group}.document.publicInterest`],
        [id],
      ),
    ];
    const listed: Record<string, Item[]> = {
      stamp5Stage: [
        validIrp,
        item('已获批 Stamp 5', 'Stamp 5 granted', ['stamp5.grantReceived']),
        item('护照与 IRP 材料', 'passport and IRP evidence', [
          'stamp5.passportAndIrpEvidence',
        ]),
        ...shared('stamp5'),
        item('就业或积极求职', 'working or seeking work', [
          'stamp5.employmentEfforts',
        ]),
        item(
          '获批后单一年度最长出境月数',
          'longest time abroad in a grant year',
          ['stamp5.longestAnnualAbsenceMonths'],
        ),
      ],
      ltrStage: [
        validIrp,
        item('IRP 登记的护照', 'passport in the IRP section', [
          'registration.passportValid',
        ]),
        item('IRP 登记的住址', 'address in the IRP section', [
          'registration.addressCurrent',
        ]),
        item('IRP 登记的清单材料', 'checklist documents in the IRP section', [
          'registration.checklistComplete',
        ]),
        ...shared('ltr'),
        item(
          '出境情况（最长出境天数与是否在允许范围内）',
          'travel (most days abroad and whether within the limit)',
          [
            'ltr.maintenance.largestCalendarYearAbsenceDays',
            'ltr.maintenance.tripsPermittedOrExceptionConfirmed',
          ],
        ),
        item(
          '主申请人持续就业或求职并在境内居住',
          'for the principal, working or seeking work and living in the State',
          ['ltr.maintenance.workEffortsAndResidence'],
          ['IE-LTR-PRINCIPAL'],
        ),
      ],
      treatyStage: [
        validIrp,
        ...treatyItems('eu', 'IE-EU-PERMANENT'),
        ...treatyItems('wa', 'IE-WA-PERMANENT'),
      ],
      workStage: [],
      familyStage: [
        item(
          '与担保人的关系（家庭团聚转独立 Stamp 4 未填时按非 de facto 核对，不查共同住址）',
          'relationship to the sponsor (for independent Stamp 4 from family reunification, blank is checked as not de facto, without joint address)',
          ['family.relationship'],
          ['IE-STAMP4-INDEPENDENT-FAMILY'],
          'first',
        ),
      ],
    };
    // Drafts that answer every question the stage reads favourably.
    const irp = {
      basis: 'required',
      irpExpiresOn: '2026-12-31',
      validPermission: true,
      passportValid: true,
      addressCurrent: true,
      checklistComplete: true,
      registrationDate: day,
      feeExemption: 'none',
      feePrepared: true,
    } as const;
    const base: IrelandDraft = {
      version: 1,
      step: 0,
      completed: true,
      simulationDate: day,
      pathways: [],
      dateOfBirth: '1980-01-01',
      birthplace: 'elsewhere',
      currentLocation: 'state',
      permissions: [{ kind: 'stamp4', from: '2015-01-01' }],
      trips: [],
      registration: irp,
    };
    const ltr = {
      validPermission: true,
      termsComplied: true,
      character: good,
      burden: { benefit: 'none' },
      family: { eligibleDependentRelationship: true, principalHoldsLtr: true },
      maintenance: {
        largestCalendarYearAbsenceDays: 0,
        tripsPermittedOrExceptionConfirmed: true,
        workEffortsAndResidence: true,
        previousGrantYearsEvidence: true,
      },
    } as const;
    const treaty = {
      role: 'family',
      nonEuFamily: true,
      document: {
        inState: true,
        currentCardCategory: 'permanent',
        identityAndResidenceEvidence: true,
        addressAndStatusNotified: true,
        prolongedAbsenceNotified: true,
        publicInterest: 'clear',
      },
    } as const;
    const work: Partial<IrelandDraft> = {
      permissions: [{ kind: 'stamp1-csep', from: '2025-05-20' }],
    };
    const spouse = {
      relationship: 'spouse',
      sponsorIrish: false,
      establishedFamilyPermission: true,
      application: {
        familyEvidenceComplete: true,
        channel: 'ordinary',
        entryOrConversionValid: true,
      },
    } as const;
    const irishPartner = {
      relationship: 'de-facto',
      sponsorIrish: true,
      establishedFamilyPermission: true,
      livingTogether: true,
      application: {
        familyEvidenceComplete: true,
        addressEvidence: true,
        channel: 'de-facto-overseas',
        entryOrConversionValid: true,
      },
    } as const;
    const cases: [string, IrelandFullPathwayId, Partial<IrelandDraft>][] = [
      [
        'stamp5Stage',
        'IE-STAMP5',
        {
          stamp5Stage: 'renewal',
          permissions: [{ kind: 'stamp5', from: '2020-01-01' }],
          stamp5: {
            grantReceived: true,
            passportAndIrpEvidence: true,
            termsComplied: true,
            character: good,
            burden: { benefit: 'none' },
            employmentEfforts: true,
            longestAnnualAbsenceMonths: 1,
          },
        },
      ],
      ['ltrStage', 'IE-LTR-PRINCIPAL', { ltrStage: 'renewal', ltr }],
      ['ltrStage', 'IE-LTR-FAMILY', { ltrStage: 'renewal', ltr }],
      ['treatyStage', 'IE-EU-PERMANENT', { euStage: 'renewal', eu: treaty }],
      ['treatyStage', 'IE-WA-PERMANENT', { waStage: 'renewal', wa: treaty }],
      ['workStage', 'IE-STAMP4-21', { ...work, workStage: 'renewal' }],
      ['workStage', 'IE-STAMP4-21', { ...work, workStage: 'first' }],
      [
        'familyStage',
        'IE-STAMP4-INDEPENDENT-FAMILY',
        { familyStage: 'renewal', family: spouse },
      ],
      [
        'familyStage',
        'IE-STAMP4-INDEPENDENT-FAMILY',
        { familyStage: 'first', family: spouse },
      ],
      [
        'familyStage',
        'IE-STAMP4-IRISH-FAMILY',
        { familyStage: 'renewal', family: irishPartner },
      ],
      [
        'familyStage',
        'IE-STAMP4-IRISH-FAMILY',
        { familyStage: 'first', family: irishPartner },
      ],
    ];
    const stageKeys = [
      'workStage',
      'familyStage',
      'stamp5Stage',
      'ltrStage',
      'euStage',
      'waStage',
    ];
    const problems: string[] = [];
    for (const [hint, id, answers] of cases) {
      const draft: IrelandDraft = { ...base, ...answers, pathways: [id] };
      // The pathway status and date, and the deciding checks not yet met.
      const seen = new Map<string, string>();
      const outcome = (next: IrelandDraft) => {
        const key = JSON.stringify(next);
        if (!seen.has(key)) {
          const route = pathway(next, id);
          seen.set(
            key,
            JSON.stringify([
              route.status,
              route.earliestDate,
              ...route.checks
                .filter(
                  (c) =>
                    (c.kind === 'requirement' || c.kind === 'time') &&
                    c.status !== 'MET',
                )
                .map((c) => `${c.id} ${c.status}`),
            ]),
          );
        }
        return seen.get(key)!;
      };
      const before = outcome(draft);
      const blank = (paths: string[][]) =>
        outcome(
          paths.reduce(
            (next, path) => withAnswer(next, path, undefined),
            draft,
          ),
        );
      // Questions in groups the draft answers (a new group needs its starred
      // questions first).
      const shown = units(topFields, draft).filter(
        ({ path }) =>
          path[0] !== 'simulationDate' &&
          !stageKeys.includes(path[0]) &&
          (path.length === 1 ||
            answerAt(draft, path.slice(0, -1)) !== undefined),
      );
      const leaves = shown.filter(({ field }) => field.type !== 'group');
      // An answer is read when another answer to it changes the result.
      const read = ({ path, field }: Unit) =>
        field.type === 'boolean'
          ? outcome(withAnswer(draft, path, true)) !==
            outcome(withAnswer(draft, path, false))
          : (field.type === 'choice'
              ? field.options
              : field.type === 'date'
                ? ['2000-01-01', day, '2040-01-01']
                : [0, 1000]
            ).some(
              (value) => outcome(withAnswer(draft, path, value)) !== before,
            );
      const stageAnswer = stageKeys
        .map((key) => answers[key as keyof IrelandDraft])
        .find(Boolean);
      const items = listed[hint].filter(
        (item) =>
          (!item.only || item.only.includes(id)) &&
          (!item.when || item.when === stageAnswer),
      );
      // Where you are falls back to the treaty document's own answer.
      const fallback: Record<string, string[]> = {
        currentLocation: [
          id === 'IE-WA-PERMANENT' ? 'wa' : 'eu',
          'document',
          'inState',
        ],
      };
      for (const { path, field } of shown) {
        // A choice whose blank option names its meaning is not a hidden "yes".
        if (field.blank) continue;
        const other = fallback[path.join('.')];
        if (
          other &&
          answerAt(draft, other) !== undefined &&
          blank([path, other]) !== before
        )
          continue;
        const asMet =
          field.type === 'group'
            ? answerAt(draft, path) !== undefined &&
              blank([path]) === before &&
              leaves.some((leaf) => within(path, leaf.path) && read(leaf))
            : field.type === 'boolean'
              ? read({ path, field }) &&
                blank([path]) === outcome(withAnswer(draft, path, true))
              : answerAt(draft, path) !== undefined &&
                blank([path]) === before &&
                read({ path, field });
        if (
          asMet &&
          !items.some((item) => item.paths.some((p) => within(p, path)))
        )
          problems.push(`${id} ${hint}: ${path.join('.')} is met when blank`);
      }
      for (const item of items) {
        if (blank(item.paths) !== before)
          problems.push(`${id} ${hint}: ${item.zh} is not met when blank`);
        if (
          !leaves.some(
            (leaf) =>
              item.paths.some((p) => within(p, leaf.path)) && read(leaf),
          )
        )
          problems.push(`${id} ${hint}: ${item.zh} is not read`);
      }
    }
    expect(problems).toEqual([]);
    // The hint lists the items after its colon, separated by semicolons.
    for (const [hint, items] of Object.entries(listed)) {
      const zh = t(`ie.hint.${hint}` as TranslationKey, 'zh-CN');
      const en = t(`ie.hint.${hint}` as TranslationKey, 'en');
      const names = [...new Map(items.map((item) => [item.zh, item])).values()];
      if (!names.length) {
        expect(zh, hint).not.toContain('按满足核对');
        expect(en, hint).not.toContain('count as met');
        continue;
      }
      expect(zh.slice(zh.lastIndexOf('：') + 1, -1).split('；'), hint).toEqual(
        names.map((item) => item.zh),
      );
      expect(en.slice(en.lastIndexOf(': ') + 2, -1).split('; '), hint).toEqual(
        names.map((item) => item.en),
      );
    }
    expect(topFields.workStage.hint).toBe('workStage');
    expect(topFields.familyStage.hint).toBe('familyStage');
    expect(topFields.stamp5Stage.hint).toBe('stamp5Stage');
    expect(topFields.ltrStage.hint).toBe('ltrStage');
    expect(topFields.euStage.hint).toBe('treatyStage');
    expect(topFields.waStage.hint).toBe('treatyStage');
  },
  slow,
);

test('the legacy Stamp 1G clock and other checks that do not decide a pathway stay out of the gaps', () => {
  const draft: IrelandDraft = {
    ...workDraft,
    pathways: ['IE-STAMP4-INDEPENDENT-FAMILY'],
    permissions: [{ kind: 'stamp4', from: '2019-01-01' }],
    family: {
      relationship: 'spouse',
      establishedFamilyPermission: true,
      sponsorLawfulAndResident: true,
      dependentPeriods: [{ from: '2019-01-01' }],
      nextRenewalOn: '2026-12-20',
    },
  };
  const route = pathway(draft, 'IE-STAMP4-INDEPENDENT-FAMILY');
  expect(route).toMatchObject({ status: 'FUTURE', earliestDate: '2026-12-20' });
  const legacy = route.checks.find((c) => c.id === 'IE-FAMILY-LEGACY-TIME')!;
  expect(legacy).toMatchObject({ kind: 'information', status: 'NOT_MET' });
  expect(legacy.title).toBe(t('ie.policy.rule.familyLegacyTime'));
  expect(legacy.title).toContain('旧计时参考');
  expect(legacy.explanation.startsWith(t('ie.result.legacyReference'))).toBe(
    true,
  );
  expect(gapRules(route).map((c) => c.id)).not.toContain(
    'IE-FAMILY-LEGACY-TIME',
  );
  expect(ie.whatif.focusForRule('IE-FAMILY-LEGACY-TIME', route.id)).toBe(
    undefined,
  );
  const html = render(
    <ResultView country={ie} result={ie.run(draft, 'zh-CN')} draft={draft} />,
  );
  const gap = html.slice(html.indexOf(t('gap.title')));
  expect(gap.slice(0, gap.indexOf('</section>'))).not.toContain(legacy.title);

  // e-vetting never decides naturalisation, so it has no comparison control.
  const vetting = pathway(
    {
      ...naturalisationDraft,
      citizenship: {
        ...naturalisationDraft.citizenship,
        vetting: 'outstanding',
      },
    },
    'IE-NATURALISATION',
  );
  expect(vetting.status).toBe('MET');
  expect(vetting.checks.find((c) => c.id === 'IE-A03')?.kind).toBe(
    'information',
  );
  expect(ie.whatif.focusForRule('IE-A03', vetting.id)).toBeUndefined();
  expect(Object.keys(ie.whatif.focusControls)).not.toContain('vetting');
  for (const check of [...route.checks, ...vetting.checks])
    expect(check.kind, check.id).toBeDefined();
});

test(
  'the policy page lists every pending detail a condition can show in results',
  () => {
    const listed = new Map(
      ie.policy.rules['ie.current-law-2026-11'].map((rule) => [
        rule.id,
        rule.pendingDetails ?? [],
      ]),
    );
    const empty: IrelandDraft = {
      ...ie.createDraft(),
      simulationDate: day,
      pathways: [...IRELAND_PATHWAYS],
      permissions: [],
      trips: [],
    };
    const drafts: IrelandDraft[] = [
      ...samples,
      ...[6, 7, 8, 9].map((seed) => filled(seed, true)),
      empty,
      {
        ...empty,
        workStage: 'renewal',
        stamp5Stage: 'renewal',
        ltrStage: 'renewal',
        euStage: 'renewal',
        waStage: 'renewal',
      },
      { ...empty, workStage: 'first' },
      // Family renewal and first registration, and a spouse whose posting is
      // not yet confirmed (review99-1).
      { ...empty, familyStage: 'renewal', family: { relationship: 'child' } },
      {
        ...empty,
        familyStage: 'renewal',
        family: { relationship: 'spouse', sponsorIrish: true },
      },
      {
        ...empty,
        familyStage: 'first',
        family: { application: { channel: 'ordinary' } },
      },
      {
        ...empty,
        marriedOn: '2020-01-01',
        permissions: [{ kind: 'stamp4', from: '2025-01-01' }],
        trips: [{ departed: '2025-12-01', returned: '2026-03-31' }],
        citizenship: { spouse: { postingUnconfirmed: true } },
      },
    ];
    const missing = new Set<string>();
    for (const draft of drafts)
      for (const route of ie.run(draft, 'en').columns[0].pathways)
        for (const check of route.checks)
          for (const detail of check.pendingDetails ?? [])
            if (!listed.get(check.id)?.includes(detail))
              missing.add(`${check.id} ${detail}`);
    expect([...missing].sort()).toEqual([]);
  },
  slow,
);

test('clearing the last ticked option returns a multiple choice to unanswered', () => {
  expect(toggleOption(undefined, 'prior', true)).toEqual(['prior']);
  expect(toggleOption([], 'prior', true)).toEqual(['prior']);
  expect(toggleOption(['continuous', 'prior'], 'prior', false)).toEqual([
    'continuous',
  ]);
  // Only the "Confirm there are none" button records an empty answer.
  expect(toggleOption(['continuous'], 'continuous', false)).toBeUndefined();
});

test('row errors, staff shares, tax years and projected dates are explained', () => {
  // Each date or number row names its own error for screen readers.
  const draft: IrelandDraft = {
    ...naturalisationDraft,
    citizenship: {
      residenceEvidence: { requiredYears: [2025, ''] as never, years: [] },
    },
  };
  const html = render(
    IrelandSimulatePage().props.children({
      draft,
      errors: ie.validateStep(draft),
      update: () => {},
    }),
  );
  expect(html).toContain(
    'aria-describedby="ie-citizenship-residenceEvidence-requiredYears-1-error"',
  );
  // The EEA staff share is a fraction between 0 and 1.
  const share = (eeaStaffShare: number) =>
    ie.validateStep({
      ...workDraft,
      work: { ...workDraft.work, permitApplication: { eeaStaffShare } },
    })['ie-work-permitApplication-eeaStaffShare'];
  expect(share(0.25)).toBeUndefined();
  expect(share(25)).toBe('ie.error.fraction');
  // Tax year rows and policy summaries follow the parameters.
  const income = irelandFull2026_11.family.income.value;
  for (const locale of ['zh-CN', 'en'] as const) {
    expect(t('ie.hint.grossTaxYears', locale)).toContain(
      String(income.taxYearsA),
    );
    expect(t('ie.policy.change.family2026Summary', locale)).toContain(
      `€${income.categoryA.toLocaleString('en')}`,
    );
  }
  // Only work upgrades mention the employer’s letter.
  const later: IrelandDraft = {
    ...naturalisationDraft,
    permissions: [{ kind: 'stamp4', from: '2021-12-01' }],
  };
  const naturalisation = pathway(later, 'IE-NATURALISATION');
  expect(naturalisation.status).toBe('FUTURE');
  expect(naturalisation.summary).toContain(t('ie.result.projected'));
  expect(naturalisation.summary).not.toContain('雇主信');
  expect(pathway(workDraft, 'IE-STAMP4-21').summary).toContain(
    t('ie.result.projectedWork'),
  );
  // The IRP control notes that EU and WA cards use their own expiry.
  const controls = render(
    <IrelandWhatIfControls
      afterDraft={{ ...workDraft, pathways: ['IE-EU-PERMANENT'] }}
      knobs={ie.whatif.initial(workDraft)}
      errors={{}}
      update={() => {}}
    />,
  );
  expect(controls).toContain('aria-describedby="ie-whatif-irp-hint"');
  expect(controls).toContain(t('ie.whatif.irpHint'));
});

test('opening an Irish share link keeps the local draft and the skip link keeps the scenario', () => {
  const storage = new Map<string, string>();
  vi.stubGlobal('localStorage', {
    getItem: (key: string) => storage.get(key) ?? null,
    setItem: (key: string, json: string) => storage.set(key, json),
  });
  try {
    const local: IrelandDraft = {
      ...ie.createDraft(),
      simulationDate: '2026-10-01',
      dateOfBirth: '1985-01-01',
    };
    draftStorage(ie, local);
    const page = readPageResult(ie, 'zh-CN', encodeDraft(ie, workDraft));
    expect(page.shared).toBe(true);
    expect(page.result?.columns[0].pathways[0]).toMatchObject({
      id: 'IE-STAMP4-21',
      status: 'FUTURE',
      earliestDate: '2027-02-20',
    });
    expect(JSON.parse(storage.get('ie-immigration-draft-v1')!)).toEqual(local);
    expect(draftStorage(ie).draft).toEqual(local);
  } finally {
    vi.unstubAllGlobals();
  }

  // Skipping the header on a scenario page must not replace the #s= fragment.
  for (const page of ['result', 'simulate', 'whatif']) {
    vi.mocked(usePathname).mockReturnValue(`/ireland/${page}`);
    const html = render(
      <SiteShell>
        <main id="main" />
      </SiteShell>,
    );
    expect(html, page).toContain(`<button type="button"`);
    expect(html, page).not.toContain('href="#main"');
  }
  vi.mocked(usePathname).mockReturnValue('/ireland/policy');
  expect(
    render(
      <SiteShell>
        <main id="main" />
      </SiteShell>,
    ),
  ).toContain('href="#main"');
});

test('fees, post-grant steps and time conditions carry their own groups and stay out of the gaps only when they do not decide', () => {
  const draft: IrelandDraft = {
    ...naturalisationDraft,
    citizenship: {
      ...naturalisationDraft.citizenship,
      applicationFeePrepared: false,
    },
  };
  const route = pathway(draft, 'IE-NATURALISATION');
  expect(route.status).toBe('MET');
  const kind = (id: string) => route.checks.find((c) => c.id === id)?.kind;
  expect(kind('IE-A09')).toBe('budget');
  expect(kind('IE-NAT-CONTINUOUS')).toBe('time');
  expect(kind('IE-A01')).toBe('requirement');
  expect(gapRules(route).map((c) => c.id)).toEqual([]);
  const html = render(
    <ResultView country={ie} result={ie.run(draft, 'zh-CN')} draft={draft} />,
  );
  for (const key of [
    'country.check.budget',
    'country.check.time',
    'country.check.requirement',
    'country.check.information',
  ] as const)
    expect(html, key).toContain(t(key));
  // A time condition still to be met stays in the gaps.
  const work = pathway(workDraft, 'IE-STAMP4-21');
  expect(gapRules(work).map((c) => c.id)).toContain('IE-STAMP4-WORK-TIME');
  expect(work.checks.find((c) => c.id === 'IE-B02')?.kind).toBe('budget');
});

test('the policy page labels association points and the net income table for children', () => {
  const { maxByCategory } = irelandFull2026_11.naturalisation.association.value;
  const income = irelandFull2026_11.family.income.value;
  const thresholds = income.categoryCWithChildren;
  for (const locale of ['zh-CN', 'en'] as const) {
    const html = render(<IrelandPolicyPage />, locale);
    const list = locale === 'en' ? ', ' : '、';
    // No bare positional lists.
    expect(html).not.toContain(maxByCategory.join(list));
    expect(html).not.toContain(
      thresholds.map((n) => n.toLocaleString(locale)).join(list),
    );
    const cell = (text: string | number) => `<td>${text}</td>`;
    const header = (text: string) => `<th scope="col">${text}</th>`;
    expect(html).toContain(header(t('ie.policy.category', locale)));
    expect(html).toContain(header(t('ie.policy.maxPoints', locale)));
    // Category order follows SRC-400 Table 1.
    expect(html).toMatch(
      new RegExp(
        [
          'ie.policy.association.experiential',
          'ie.policy.association.family',
          'ie.policy.association.cultural',
          'ie.policy.association.establishment',
        ]
          .map(
            (key, i) =>
              `${cell(t(key as TranslationKey, locale))}${cell(maxByCategory[i])}`,
          )
          .join('[^]*?'),
      ),
    );
    expect(html).toContain(header(t('ie.policy.children', locale)));
    expect(html).toContain(
      header(
        t('ie.policy.minimumNetIncome', locale).replace(
          '{year}',
          income.childrenTableYear,
        ),
      ),
    );
    expect(html).toContain(
      `${cell(1)}${cell(`€${thresholds[0].toLocaleString(locale)}`)}`,
    );
    expect(html).toContain(
      `${cell(`${thresholds.length}+`)}${cell(`€${thresholds.at(-1)!.toLocaleString(locale)}`)}`,
    );
  }
});
