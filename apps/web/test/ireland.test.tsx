import { renderToStaticMarkup } from 'react-dom/server';
import { expect, test } from 'vitest';
import { IRELAND_CONDITION_IDS } from '@uk-immigration/engine';
import IrelandPage from '../app/ireland/page';
import IrelandPolicyPage from '../app/ireland/policy/page';
import IrelandSimulatePage from '../app/ireland/simulate/page';
import { IrelandWhatIfControls } from '../app/ireland/whatif/controls';
import { GET as offlinePages } from '../app/offline-pages.json/route';
import Home from '../app/page';
import sitemap from '../app/sitemap';
import { ResultView } from '../components/result-view';
import { t, type TranslationKey } from '../i18n';
import { LocaleContext } from '../i18n/locale';
import {
  IRELAND_PATHWAYS,
  activeIrelandAnswers,
  irelandSteps,
  type IrelandDraft,
} from '../lib/ireland-draft';
import {
  familySections,
  topFields,
  type IrelandFields,
} from '../lib/ireland-fields';
import { irelandModule as ie } from '../lib/ireland-module';
import { japanModule } from '../lib/japan-module';
import { decodeDraft, encodeDraft } from '../lib/share';

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
  expect(route.summary).toContain(t('ie.result.projected'));
  // The IRP expires before the projected date (PD-321).
  expect(route.summary).toContain('2027-01-31');
  expect(pathway(workDraft, 'IE-STAMP4-21', 'en').summary).toContain(
    t('ie.result.projected', 'en'),
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
    vetting: undefined,
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
  const vetting = ie.whatif.apply(naturalisationDraft, {
    ...ie.whatif.initial(naturalisationDraft),
    vetting: 'outstanding',
  });
  expect(vetting.citizenship?.vetting).toBe('outstanding');
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
