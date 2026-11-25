import { renderToStaticMarkup } from 'react-dom/server';
import { expect, test } from 'vitest';
import { ES_FULL_TARGETS } from '@uk-immigration/engine';
import Home from '../app/page';
import { GET as offlinePages } from '../app/offline-pages.json/route';
import sitemap from '../app/sitemap';
import SpainPage from '../app/spain/page';
import SpainPolicyPage from '../app/spain/policy/page';
import SpainSimulatePage from '../app/spain/simulate/page';
import { ResultView } from '../components/result-view';
import { WhatIfView } from '../components/whatif-lab';
import { t } from '../i18n';
import { LocaleContext } from '../i18n/locale';
import { gapRules } from '../lib/gap-summary';
import { readPageResult } from '../lib/page-result';
import { decodeDraft, encodeDraft } from '../lib/share';
import { sourceUrls } from '../lib/sources';
import type { SpainDraft } from '../lib/spain-draft';
import { spainModule as es } from '../lib/spain-module';
import { ukModule } from '../lib/uk-module';

const render = (node: React.ReactNode, locale: 'zh-CN' | 'en' = 'zh-CN') =>
  renderToStaticMarkup(
    <LocaleContext value={{ locale, setLocale: () => {} }}>
      {node}
    </LocaleContext>,
  );

function longTermMetDraft(): SpainDraft {
  return {
    ...es.createDraft(),
    step: 5,
    completed: true,
    simulationDate: '2026-11-23',
    targets: ['L', 'N', 'E'],
    timeRecordsComplete: true,
    permits: [{ from: '2017-01-01', study: false }],
    trips: [],
    route: 'general',
    residence: {
      thirdCountryRegime: true,
      entryRestrictionsClear: true,
      noReturnCommitmentClear: true,
      residentInSpain: true,
      validIdentityDocument: true,
      competentOfficeAndApplication: true,
      criminalCertificatesWhereRequired: true,
      securityDecision: 'clear',
      nationalAlternatives: [],
      schooling: { children: [] },
      resources: {
        familySize: 2,
        eligibleMonthlyIncome: 950,
        stable: true,
      },
      insurance: {
        kind: 'public',
        entitledOrAuthorized: true,
        validFrom: '2017-01-01',
        proof: true,
      },
    },
    nationality: {
      birthDate: '1990-05-10',
      applicantSignature: 'self',
      necessarySupportProvided: true,
      criminalRecords: {
        spanishRecordOrQuery: true,
        originRecordOrLawfulAlternative: true,
        militaryProcedureIfApplicable: true,
      },
      conductAndSecurityDecision: true,
      deleEvidence: 'dele',
      deleLevel: 'A2',
      examRelief: 'none',
      ccse: {
        correct: 20,
        verifiedPass: true,
        issued: '2026-06-01',
      },
      integrationDecision: true,
      documents: {
        applicationForm: true,
        identity: true,
        birthRecord: true,
        residence: true,
        address: true,
        foreignDocumentFormalities: true,
        previousPassportsIfRequired: true,
      },
      feePaid: true,
      feePaidOn: '2026-11-01',
    },
  };
}

test.each(['zh-CN', 'en'] as const)(
  'Spain home and hub card link to the questionnaire and policy page in %s',
  (locale) => {
    const homeHtml = render(<Home />, locale);
    expect(homeHtml).toContain('href="/spain"');
    const html = render(<SpainPage />, locale);
    expect(html).toContain('href="/spain/simulate"');
    expect(html).toContain('href="/spain/policy"');
    expect(html).toContain(locale === 'en' ? 'Spain' : '西班牙');
  },
);

test('all five Spain pages are exported in the offline and sitemap lists', async () => {
  const offline = await offlinePages().json();
  const paths = sitemap().map(({ url }) => new URL(url).pathname);
  for (const path of [
    '/spain',
    '/spain/simulate',
    '/spain/result',
    '/spain/whatif',
    '/spain/policy',
  ]) {
    expect(offline).toContain(path);
    expect(paths).toContain(path);
  }
});

test('versioned drafts round-trip inside their country envelope and migrate legacy form payloads', () => {
  const draft = longTermMetDraft();
  const encoded = encodeDraft(es, draft);
  expect(decodeDraft(es, encoded)).toEqual(draft);
  expect(decodeDraft(ukModule, encoded)).toBeUndefined();
  expect(
    decodeDraft(es, encodeDraft(ukModule, ukModule.createDraft())),
  ).toBeUndefined();

  const fresh = es.createDraft();
  expect(es.decodeDraft(fresh)).toEqual(fresh);

  // Legacy time-only EsForm objects migrate cleanly to version 1 SpainDraft.
  const migrated = es.decodeDraft({
    simulationDate: '2026-11-21',
    permits: [{ from: '2020-03-15', to: '', study: false }],
    trips: [{ departed: '2023-07-01', returned: '2023-07-10' }],
    route: 'marriage',
    marriedOn: '2025-06-01',
  });
  expect(migrated).toMatchObject({
    version: 1,
    completed: true,
    simulationDate: '2026-11-21',
    targets: ['L', 'N'],
    timeRecordsComplete: true,
    permits: [{ from: '2020-03-15' }],
    trips: [{ departed: '2023-07-01', returned: '2023-07-10' }],
    route: 'marriage',
    marriedToSpaniard: '2025-06-01',
  });

  for (const bad of [
    null,
    { ...draft, version: 2 },
    { ...draft, step: 9 },
    { ...draft, targets: ['MADE-UP'] },
    { ...draft, permits: [{ from: 'not-a-date' }] },
    { ...draft, trips: [{ departed: '2025-05-10', returned: '2025-05-01' }] },
  ])
    expect(es.decodeDraft(bad)).toBeUndefined();
});

test('step validation checks targets, simulation date and date ordering across steps', () => {
  const fresh = es.createDraft();
  expect(es.validateStep(fresh)).toEqual({
    'es-targets': 'es.form.routeError',
  });
  expect(
    es.validateStep({
      ...fresh,
      simulationDate: 'invalid',
      targets: ['L'],
    }),
  ).toEqual({
    'es-simulationDate': 'es.error.date',
  });

  const step1 = {
    ...fresh,
    step: 1,
    targets: ['L'] as SpainDraft['targets'],
    timeRecordsComplete: true,
    permits: [{ from: '2024-05-10', to: '2024-05-01', study: false }],
    trips: [{ departed: '2024-08-10', returned: '2024-08-01' }],
  };
  expect(es.validateStep(step1)).toEqual({
    'es-permits-0-to': 'es.error.order',
    'es-trips-0-returned': 'es.error.order',
  });
  expect(
    es.validateStep({
      ...step1,
      permits: [{ from: '2024-05-01', to: '2024-05-10', study: false }],
      trips: [{ departed: '2024-08-01', returned: '2024-08-10' }],
    }),
  ).toEqual({});
});

test('run produces MET, FUTURE and UNKNOWN pathways for typical inputs', () => {
  const draft = longTermMetDraft();
  const result = es.run(draft, 'zh-CN');
  const pathways = result.columns[0].pathways;
  const nationalLt = pathways.find((p) => p.id === 'ES-LONG-TERM')!;
  const nationality = pathways.find((p) => p.id === 'ES-NATIONALITY')!;
  const euLt = pathways.find((p) => p.id === 'ES-LONG-TERM-EU')!;

  // 1) MET: 6+ years of continuous residence since 2020-01-01 satisfies L and E on 2026-11-23.
  expect(nationalLt).toMatchObject({
    status: 'MET',
    earliestDate: '2026-11-23',
    pathwayCompletionDate: '2026-11-23',
  });
  expect(euLt).toMatchObject({
    status: 'MET',
    earliestDate: '2026-11-23',
  });

  // 2) FUTURE: general nationality requires 10 years (2027-01-01) -> FUTURE 2027-01-01!
  expect(nationality).toMatchObject({
    status: 'FUTURE',
    earliestDate: '2027-01-01',
    pathwayCompletionDate: '2027-01-01',
  });

  // 3) UNKNOWN: omitting security decision leaves L in UNKNOWN while preserving pathwayCompletionDate.
  const unknownResult = es.run(
    {
      ...draft,
      targets: ['L'],
      residence: { ...draft.residence, securityDecision: undefined },
    },
    'en',
  );
  const unknownLt = unknownResult.columns[0].pathways[0];
  expect(unknownLt).toMatchObject({
    id: 'ES-LONG-TERM',
    status: 'UNKNOWN',
    pathwayCompletionDate: '2026-11-23',
  });
  expect(unknownLt.earliestDate).toBeUndefined();
});

test('what-if controls adjust simulation date, household size, income, absences and exams', () => {
  const draft = longTermMetDraft();
  const baseKnobs = es.whatif.initial(draft);
  expect(baseKnobs).toMatchObject({
    simulationDate: '2026-11-23',
    noTrips: false,
    natRoute: 'general',
    delePassed: true,
    ccsePassed: true,
    familySize: 2,
    monthlyIncome: 950,
    healthCover: true,
    conductCleared: true,
  });

  // Increasing household size from 2 (threshold €900) to 3 (threshold €1,200) with €950/month flips ES-E05 from MET to NOT_MET.
  const threePerson = es.whatif.apply(draft, {
    ...baseKnobs,
    familySize: 3,
  });
  const euAfterSize = es
    .run(threePerson, 'en')
    .columns[0].pathways.find((p) => p.id === 'ES-LONG-TERM-EU')!;
  expect(euAfterSize.status).toBe('NOT_MET');
  expect(euAfterSize.checks.find((c) => c.id === 'ES-E05')?.status).toBe(
    'NOT_MET',
  );

  // Raising monthly income to €1,250 restores ES-E05 to MET.
  const higherIncome = es.whatif.apply(draft, {
    ...baseKnobs,
    familySize: 3,
    monthlyIncome: 1250,
  });
  const euAfterIncome = es
    .run(higherIncome, 'en')
    .columns[0].pathways.find((p) => p.id === 'ES-LONG-TERM-EU')!;
  expect(euAfterIncome.status).toBe('MET');

  // Advancing simulationDate to 2027-01-01 makes general citizenship MET, while past CCSE expiry (2030-07-01) makes ES-N12 NOT_MET.
  const atTenYears = es.whatif.apply(draft, {
    ...baseKnobs,
    simulationDate: '2027-01-01',
  });
  expect(
    es
      .run(atTenYears, 'zh-CN')
      .columns[0].pathways.find((p) => p.id === 'ES-NATIONALITY')?.status,
  ).toBe('MET');

  const afterCcseExpiry = es.whatif.apply(draft, {
    ...baseKnobs,
    simulationDate: '2030-07-01',
  });
  const natExpired = es
    .run(afterCcseExpiry, 'zh-CN')
    .columns[0].pathways.find((p) => p.id === 'ES-NATIONALITY')!;
  expect(natExpired.checks.find((c) => c.id === 'ES-N12')?.status).toBe(
    'NOT_MET',
  );

  // noTrips clears disqualifying absences in comparison.
  const withLongTrip: SpainDraft = {
    ...draft,
    trips: [{ departed: '2024-01-01', returned: '2024-09-01' }],
  };
  expect(
    es
      .run(withLongTrip, 'en')
      .columns[0].pathways.find((p) => p.id === 'ES-LONG-TERM')?.status,
  ).toBe('FUTURE');
  const clearedTrips = es.whatif.apply(withLongTrip, {
    ...es.whatif.initial(withLongTrip),
    noTrips: true,
  });
  expect(
    es
      .run(clearedTrips, 'en')
      .columns[0].pathways.find((p) => p.id === 'ES-LONG-TERM')?.status,
  ).toBe('MET');

  // Render WhatIfView and verify comparison markup.
  const whatifHtml = render(
    <WhatIfView
      country={{
        ...es,
        whatif: {
          ...es.whatif,
          initial: () => ({ ...baseKnobs, familySize: 3 }),
        },
      }}
      draft={draft}
    />,
    'en',
  );
  expect(whatifHtml).toContain('Changed to not met / unknown (1)</h3>');
  expect(whatifHtml).toContain('ES-E05');
});

test.each(['zh-CN', 'en'] as const)(
  'questionnaire, result view and policy page render in %s with only Spanish sources',
  (locale) => {
    const draft = longTermMetDraft();
    const simHtml = render(
      SpainSimulatePage().props.children({
        draft: { ...draft, step: 0 },
        errors: {},
        update: () => {},
      }),
      locale,
    );
    expect(simHtml).toContain('id="es-target-N"');
    expect(simHtml).toContain('id="es-target-U"');

    const shared = readPageResult(es, locale, encodeDraft(es, draft));
    const resultHtml = render(
      <ResultView country={es} result={shared.result!} draft={shared.draft} />,
      locale,
    );
    expect(resultHtml).toContain('2027-01-01');
    expect(resultHtml).toContain(`href="${sourceUrls['SRC-083']}"`);

    const policyHtml = render(<SpainPolicyPage />, locale);
    expect(policyHtml).toContain(
      locale === 'en' ? 'Policy basis for Spain' : '西班牙政策依据',
    );
    expect(policyHtml.match(/data-pathway=/g)).toHaveLength(8);
    expect(policyHtml.match(/data-rule=/g)).toHaveLength(101);
    expect(policyHtml.match(/data-policy-change=/g)).toHaveLength(3);
    expect(policyHtml).toContain('data-source="SRC-083"');
    expect(policyHtml).toContain('data-source="SRC-327"');
    expect(policyHtml).not.toContain('data-source="SRC-001"');
    expect(policyHtml).not.toContain('data-source="SRC-110"');

    // Every source cited across all 8 pathways is listed in the Spain policy page.
    const allTargetsResult = render(
      <ResultView
        country={es}
        result={es.run({ ...draft, targets: [...ES_FULL_TARGETS] }, locale)}
        draft={draft}
      />,
      locale,
    );
    const cited = new Set(allTargetsResult.match(/\bSRC-\d+\b/g));
    expect(cited.size).toBeGreaterThan(15);
    for (const id of cited) {
      expect(policyHtml).toContain(`data-source="${id}"`);
    }
  },
);

test.each(['zh-CN', 'en'] as const)(
  'fees and follow-up steps are labelled as such, and a held permanent right shows when it was acquired (%s)',
  (locale) => {
    const draft: SpainDraft = {
      ...es.createDraft(),
      completed: true,
      simulationDate: '2026-11-24',
      targets: ['U'],
      timeRecordsComplete: true,
      trips: [],
      freeMovement: {
        person: 'eu-eea-swiss',
        residenceFrom: '2017-01-01',
        noExecutedExpulsion: true,
        history: [
          { from: '2017-01-01', basis: 'employment', documented: true },
        ],
        noOfficialRestriction: true,
      },
    };
    const result = es.run(draft, locale);
    expect(result.columns[0].pathways[0]).toMatchObject({
      status: 'MET',
      earliestDate: '2026-11-24',
      pathwayCompletionDate: '2022-01-01',
    });
    const html = render(
      <ResultView country={es} result={result} draft={draft} />,
      locale,
    );
    expect(html).toContain(
      locale === 'en'
        ? 'Permanent residence was acquired on 2022-01-01.'
        : '已于 2022-01-01 取得永久居留权。',
    );
    expect(html).toContain(
      locale === 'en'
        ? 'Fees, cards, post-grant steps and branch details (these do not decide this pathway)'
        : '费用、办卡、获批后手续与分支明细（不决定本路径结论）',
    );
    expect(html).not.toContain(
      locale === 'en' ? 'Other pathways (shows why' : '其他路径的条件',
    );
  },
);

// Direct national grounds stay listed until the applicant rules them out.
function openGroundsDraft(): SpainDraft {
  const draft = longTermMetDraft();
  return {
    ...draft,
    residence: { ...draft.residence, nationalAlternatives: undefined },
  };
}

test('checks are grouped as time, requirements, fees, post-grant steps and alternative grounds', () => {
  const draft = { ...openGroundsDraft(), targets: [...ES_FULL_TARGETS] };
  const pathways = es.run(draft, 'zh-CN').columns[0].pathways;
  const kinds = new Map<string, string | undefined>();
  for (const pathway of pathways) {
    for (const check of pathway.checks) {
      expect(check.kind, check.id).toBeDefined();
      kinds.set(check.id, check.kind);
    }
    // Only requirements and time requirements can be gaps.
    for (const rule of gapRules(pathway))
      expect(['requirement', 'time']).toContain(rule.kind);
  }
  expect(
    Object.fromEntries(
      [
        'ES-N01',
        'ES-N15',
        'ES-N16',
        'ES-N17',
        'ES-N18',
        'ES-L-BASIS',
        'ES-L01',
        'ES-L01-TOTAL',
        'ES-L03',
        'ES-L09',
        'ES-L14',
        'ES-E-TIME',
        'ES-E01',
        'ES-E05',
        'ES-E09',
        'ES-M01',
        'ES-M09',
        'ES-M09-card',
        'ES-M10',
        'ES-M11',
        'ES-F01-grant',
        'ES-F05',
        'ES-F05-effective',
        'ES-F05-card-fee',
        'ES-R01',
        'ES-R08',
        'ES-R09',
        'ES-T01',
        'ES-T02',
        'ES-U04',
        'ES-U13',
      ].map((id) => [id, kinds.get(id)]),
    ),
  ).toEqual({
    'ES-N01': 'time',
    // The application fee is paid before filing and decides the pathway.
    'ES-N15': 'requirement',
    'ES-N16': 'budget',
    'ES-N17': 'afterApproval',
    'ES-N18': 'afterApproval',
    'ES-L-BASIS': 'requirement',
    'ES-L01': 'time',
    'ES-L01-TOTAL': 'time',
    'ES-L03': 'alternative',
    'ES-L09': 'alternative',
    'ES-L14': 'budget',
    'ES-E-TIME': 'time',
    'ES-E01': 'time',
    'ES-E05': 'requirement',
    'ES-E09': 'budget',
    'ES-M01': 'requirement',
    'ES-M09': 'afterApproval',
    'ES-M09-card': 'afterApproval',
    'ES-M10': 'budget',
    'ES-M11': 'information',
    'ES-F01-grant': 'information',
    'ES-F05': 'budget',
    'ES-F05-effective': 'afterApproval',
    'ES-F05-card-fee': 'budget',
    'ES-R01': 'requirement',
    'ES-R08': 'budget',
    'ES-R09': 'afterApproval',
    'ES-T01': 'afterApproval',
    'ES-T02': 'afterApproval',
    'ES-U04': 'time',
    'ES-U13': 'afterApproval',
  });
});

test.each(['zh-CN', 'en'] as const)(
  'result checks show their group, and an acquired permanent right lists the ordinary period as an alternative ground (%s)',
  (locale) => {
    const draft: SpainDraft = {
      ...es.createDraft(),
      completed: true,
      simulationDate: '2026-11-24',
      targets: ['U'],
      timeRecordsComplete: true,
      trips: [],
      freeMovement: {
        person: 'eu-eea-swiss',
        residenceFrom: '2017-01-01',
        noExecutedExpulsion: true,
        history: [
          { from: '2017-01-01', basis: 'employment', documented: true },
        ],
        noOfficialRestriction: true,
        acquiredOn: '2022-01-01',
      },
    };
    const [pathway] = es.run(draft, locale).columns[0].pathways;
    const kind = (id: string) =>
      pathway.checks.find((check) => check.id === id)?.kind;
    expect(pathway.decidedBy).toContain('ES-U04-basis');
    expect(pathway.decidedBy).not.toContain('ES-U04');
    expect([kind('ES-U04-basis'), kind('ES-U04'), kind('ES-U13')]).toEqual([
      'requirement',
      'alternative',
      'afterApproval',
    ]);
    const html = render(
      <ResultView
        country={es}
        result={es.run({ ...openGroundsDraft(), targets: ['L'] }, locale)}
        draft={draft}
      />,
      locale,
    );
    for (const group of ['budget', 'afterApproval', 'alternative'] as const)
      expect(html).toContain(`· ${t(`country.check.${group}`, locale)}`);
  },
);
