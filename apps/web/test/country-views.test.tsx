import { renderToStaticMarkup } from 'react-dom/server';
import { expect, test } from 'vitest';
import type { CountryPathway } from '@uk-immigration/engine';
import { esP31IndividualAPartnerArrivesTogether as partner } from '../../../packages/policy-data/fixtures/es-p31-individual-a-partner-arrives-together';
import { ResultView } from '../components/result-view';
import { PolicyPage } from '../components/policy-page';
import type { CountryPolicy, PolicyRuleSet } from '../lib/policy';
import { WhatIfView } from '../components/whatif-lab';
import { t } from '../i18n';
import { japanModule } from '../lib/japan-module';
import type { JapanDraft } from '../lib/japan-draft';
import type { CountryModule } from '../lib/country-module';
import { ukModule } from '../lib/uk-module';
import {
  parseWhatIfFocus,
  rememberWhatIfTarget,
  takeWhatIfTarget,
} from '../lib/whatif';

test('a country focus is consumed only by its own lab', () => {
  const target = { focus: 'score', ruleId: 'check-score' };
  rememberWhatIfTarget('ca', target);
  expect(takeWhatIfTarget('uk', 'score')).toEqual({ focus: 'score' });
  expect(takeWhatIfTarget('ca', 'score')).toBe(target);
  expect(
    parseWhatIfFocus({ score: 'score-control' }, 'income'),
  ).toBeUndefined();
});

const draft = {
  version: 1,
  completed: true,
  step: 0,
  simulationDate: '2026-01-01',
  score: 0,
};
const path = (id: string, met: boolean): CountryPathway => ({
  id,
  title: id,
  status: met ? 'MET' : 'NOT_MET',
  checks: [
    {
      id: 'check-score',
      title: `${id} score`,
      explanation: '',
      sources: [],
      status: met ? 'MET' : 'NOT_MET',
    },
  ],
  assumptions: [],
});
const country: CountryModule<typeof draft, { score: number }> = {
  id: 'ca',
  version: 1,
  createDraft: () => draft,
  validateStep: () => ({}),
  decodeDraft: () => undefined,
  policy: {
    ruleSets: [],
    displayedRuleSets: [],
    parameters: {},
    rules: {},
    changelog: [],
    sourceUrls: {},
  },
  run: ({ score }) => ({
    policyAsOf: '2026-01-01',
    columns: [
      {
        id: 'a',
        title: 'Column A',
        pathways: score
          ? [path('Beta', true), path('Alpha', false), path('Added', true)]
          : [path('Alpha', true), path('Beta', false), path('Removed', true)],
      },
      { id: 'b', title: 'Column B', pathways: [path('Gamma', true)] },
    ],
  }),
  whatif: {
    focusControls: { score: 'score-control' },
    focusForRule: () => 'score',
    initial: (draft, target) => ({
      score: target?.ruleId === 'check-score' ? 1 : draft.score,
    }),
    apply: (draft, knobs) => ({ ...draft, ...knobs }),
    validate: () => ({}),
    Controls: ({ knobs }) => (
      <input id="score-control" readOnly value={knobs.score} />
    ),
  },
};
test('a module with its own controls compares multiple paths by id across columns', () => {
  const html = renderToStaticMarkup(
    <WhatIfView country={country} draft={draft} target={{ focus: 'score' }} />,
  );
  expect(html).toContain('id="score-control" readOnly="" value="1"');
  expect(html).toContain('href="/canada/result"');
  for (const heading of ['Alpha', 'Beta', 'Gamma', 'Added', 'Removed'])
    expect(html).toContain(`<h3>${heading}</h3>`);
  const met = t('country.status.MET');
  expect(html.split('<h3>Added</h3>')[1]).toContain(
    `>—</span><span aria-hidden="true">→</span><span>${met}</span>`,
  );
  expect(html.split('<h3>Removed</h3>')[1]).toContain(
    `>${met}</span><span aria-hidden="true">→</span><span>—</span>`,
  );
  expect(html).toContain('data-status="PASS"><strong>Beta score</strong>');
  expect(html).toContain('data-status="FAIL"><strong>Alpha score</strong>');
  expect(html).not.toContain('whatif-earnings');
});

test('the UK date control shows a missing assessment in both columns when dependant screening stops the run', () => {
  const ukDraft = {
    ...ukModule.createDraft(),
    ...structuredClone(partner.request),
    completed: true,
    principalCompleted: true,
    simulationDate: '2026-11-23',
  };
  ukDraft.screening = { criminality: 'no', breach: 'no', debt: 'no' };
  ukDraft.principalScreening = { ...ukDraft.screening, criminality: 'yes' };
  ukDraft.timeline.episodes.at(-1)!.validTo = '2025-11-22';
  ukDraft.timeline.episodes.push({
    route: 'SKILLED_WORKER',
    role: 'MAIN',
    validFrom: '2025-11-23',
    validTo: '2028-11-22',
  });
  const baseline = renderToStaticMarkup(
    <WhatIfView country={ukModule} draft={ukDraft} />,
  );
  const outcomeRow = `<dt>${t('whatif.outcome')}</dt>`;
  expect(baseline.split(outcomeRow)).toHaveLength(3);
  expect(baseline).toContain(`<dt>${t('result.earliest')}</dt>`);

  const date = '2024-11-23';
  const adjusted = renderToStaticMarkup(
    <WhatIfView
      country={ukModule}
      draft={ukDraft}
      target={{ focus: 'date', assessment: { earliestDate: date } }}
    />,
  );
  expect(adjusted).toMatch(new RegExp(`id="whatif-date"[^>]*value="${date}"`));
  for (const { id } of ukModule.policy.displayedRuleSets) {
    const column = adjusted
      .split(`aria-labelledby="${id}-heading"`)[1]
      .split('</section>')[0];
    expect(column).toContain(t('result.missingAssessment'));
    expect(column).not.toContain(outcomeRow);
  }
});

test.each([
  {
    route: {
      route: 'deemed',
      departureOn: '2025-09-02',
      returnOn: '2025-09-30',
      specialPermanentResident: false,
      stayIndefinite: true,
      lawfulStatus: true,
      passportValid: true,
      residentCardOrCertificate: true,
      formalPermitRequired: false,
      alreadyDeparted: true,
      declaredIntentAtDeparture: true,
      declarationForDepartureOn: '2025-09-02',
      permitVoided: false,
    },
    kind: 'departure',
    expected: '2025-09-02',
  },
  {
    route: {
      route: 'refugee-travel-document',
      departureOn: '2025-09-02',
      returnOn: '2025-09-30',
      refugeeRecognition: true,
      hasJapaneseTravelDocument: true,
      permitVoided: false,
      permit: {
        effectiveOn: '2025-04-01',
        expiresOn: '2027-04-01',
        entryDeadline: '2025-10-01',
      },
    },
    kind: 'returnDeadline',
    expected: '2025-10-01',
  },
] satisfies {
  route: JapanDraft['reentry'][number];
  kind: 'departure' | 'returnDeadline';
  expected: string;
}[])(
  'shows the $kind in both views for a completed journey',
  ({ route, kind, expected }) => {
    const travelDraft = {
      ...japanModule.createDraft(),
      simulationDate: '2025-11-01',
      stayStart: '2020-01-01',
      completed: true,
      reentry: [route],
    };
    const result = japanModule.run(travelDraft, 'zh-CN');
    const pathway = result.columns[0].pathways[0];
    expect(pathway.status).toBe('MET');
    expect(pathway.earliestDate).toBeUndefined();
    expect(pathway.travelDate).toEqual({ kind, date: expected });
    const resultHtml = renderToStaticMarkup(
      <ResultView country={japanModule} result={result} draft={travelDraft} />,
    );
    const whatifHtml = renderToStaticMarkup(
      <WhatIfView country={japanModule} draft={travelDraft} />,
    );
    const label = `<dt>${t(`country.${kind}`)}</dt>`;
    for (const html of [resultHtml, whatifHtml]) {
      expect(html).toContain(label);
      expect(html).not.toContain(`<dt>${t('result.earliest')}</dt>`);
    }
    expect(resultHtml.split(label)[1]).toMatch(
      new RegExp(`^<dd><time dateTime="${expected}">${expected}</time></dd>`),
    );
    expect(
      whatifHtml
        .split(label)[1]
        .split('</dd>')[0]
        .match(new RegExp(expected, 'g')),
    ).toHaveLength(2);
  },
);

test('a refugee document with an unconfirmed entry limit has no confirmed return deadline', () => {
  const result = japanModule.run(
    {
      ...japanModule.createDraft(),
      simulationDate: '2025-11-01',
      reentry: [
        {
          route: 'refugee-travel-document',
          permit: { effectiveOn: '2025-04-01', expiresOn: '2027-04-01' },
        },
      ],
    },
    'en',
  );
  const pathway = result.columns[0].pathways[0];
  expect(pathway.travelDate).toEqual({
    kind: 'returnDeadline',
    date: undefined,
  });
  expect(
    pathway.checks.find((row) => row.id === 'jp.reentry.return-continuity')
      ?.explanation,
  ).not.toContain('2027-04-01');
});

test.each([
  {
    permitVoided: true,
    returnOn: '2025-03-30',
    extensionApproved: false,
    status: 'NOT_MET',
    detail: '已失效',
  },
  {
    permitVoided: false,
    returnOn: '2025-04-02',
    extensionApproved: true,
    status: 'UNKNOWN',
    detail: '返日期限待确认',
  },
])(
  'refugee travel results and details agree when the document is $status',
  ({ permitVoided, returnOn, extensionApproved, status, detail }) => {
    const travelDraft = {
      ...japanModule.createDraft(),
      simulationDate: '2025-11-01',
      stayStart: '2020-01-01',
      completed: true,
      reentry: [
        {
          route: 'refugee-travel-document' as const,
          departureOn: '2025-03-01',
          returnOn,
          permitVoided,
          refugeeRecognition: true,
          hasJapaneseTravelDocument: true,
          permit: {
            effectiveOn: '2024-04-01',
            expiresOn: '2025-04-01',
            entryDeadlineNotSpecified: true,
            extensionApproved,
          },
        },
      ],
    };
    const result = japanModule.run(travelDraft, 'zh-CN');
    const pathway = result.columns[0].pathways[0];
    expect(pathway.status).toBe(status);
    for (const id of ['refugee-document-validity', 'return-continuity']) {
      const check = pathway.checks.find((row) => row.id === `jp.reentry.${id}`);
      expect(check?.status).toBe(status);
      expect(check?.explanation).toContain(detail);
      expect(check?.explanation).not.toContain('2025-04-01');
    }
    const deadlineLabel = `<dt>${t('country.returnDeadline')}</dt>`;
    const resultHtml = renderToStaticMarkup(
      <ResultView country={japanModule} result={result} draft={travelDraft} />,
    );
    const whatifHtml = renderToStaticMarkup(
      <WhatIfView country={japanModule} draft={travelDraft} />,
    );
    for (const html of [resultHtml, whatifHtml]) {
      expect(html).not.toContain(`<dt>${t('result.earliest')}</dt>`);
      if (permitVoided) {
        expect(html).not.toContain(deadlineLabel);
      } else {
        expect(html.split(deadlineLabel)[1].split('</dd>')[0]).toContain(
          t('result.undetermined'),
        );
      }
    }
  },
);

test('path columns keep their checks, pending details and country-specific links', () => {
  const result = country.run(draft, 'en');
  const beta = result.columns[0].pathways[1];
  beta.summary = 'Path summary';
  beta.assumptions = ['Path assumption'];
  beta.notChecked = ['An unmodelled condition'];
  beta.pendingDetails = ['PD-TEST'];
  beta.checks[0].sources = [
    { srcId: 'SRC-TEST', locator: 'p1', url: 'https://example.org/check' },
  ];
  const html = renderToStaticMarkup(
    <ResultView country={country} result={result} draft={draft} />,
  );
  for (const text of [
    'Beta score',
    beta.summary,
    ...beta.assumptions,
    ...beta.notChecked,
    ...beta.pendingDetails,
  ])
    expect(html).toContain(text);
  for (const url of [
    '/canada/whatif?focus=score',
    '/canada/policy',
    'https://example.org/check',
  ])
    expect(html).toContain(`href="${url}"`);
  expect(html).not.toContain('Immigration Advice Authority');
});

test('the policy page lists only the supplied rule sets, parameters, rules, changes and sources', () => {
  const id = 'ca.example';
  const sources = [{ srcId: 'SRC-TEST', locator: 'p1' }];
  const ruleSet: PolicyRuleSet = {
    id,
    kind: 'LAW',
    status: 'CURRENT_LAW',
    title: { en: 'Example law', 'zh-CN': '示例规则' },
    sources,
  };
  const policy: CountryPolicy = {
    ruleSets: [ruleSet],
    displayedRuleSets: [ruleSet],
    parameters: {
      [id]: {
        ruleSetId: id,
        asOf: draft.simulationDate,
        values: {
          exampleList: { value: ['Alpha', 'Beta'], sources },
          referenceYear: { value: 2026, sources },
          annualIncome: { value: 12345, sources },
          incomeHistory: {
            value: { firstYear: 2009, reducedFrom: 2012, standard: 7500 },
            sources,
          },
          ageBands: {
            value: [
              { age: 18, points: 25 },
              { age: 25, points: 30 },
            ],
            sources,
          },
        },
      },
    },
    rules: {
      [id]: [
        {
          id: 'check-score',
          ruleSetId: id,
          title: '示例条件',
          sources,
          pendingDetails: [],
        },
      ],
    },
    changelog: [
      {
        date: draft.simulationDate,
        title: '示例变更',
        summary: '示例说明',
        sources,
      },
    ],
    sourceUrls: { 'SRC-TEST': 'https://example.org/source' },
  };
  const html = renderToStaticMarkup(<PolicyPage country={{ policy }} />);
  for (const content of [
    'ca.example',
    '示例规则',
    'exampleList',
    'Alpha、Beta',
    'check-score',
    '示例变更',
    '示例说明',
    'https://example.org/source',
  ])
    expect(html).toContain(content);
  expect(html).not.toContain('current-law-2026-11');
  expect(html.match(/data-source=/g)).toHaveLength(1);
  // Without a registered country title the page keeps the generic heading.
  expect(html).toContain(`<h1>${t('policyPage.title')}</h1>`);
  expect(
    renderToStaticMarkup(<PolicyPage country={{ id: 'gr', policy }} />),
  ).toContain(`<h1>${t('policyPage.title')}</h1>`);
  // Calendar years keep their digits; amounts are grouped.
  for (const text of [
    '>2026<',
    '>12,345<',
    'firstYear 2009、reducedFrom 2012、standard 7,500',
    '<th scope="col">age</th><th scope="col">points</th>',
    '<td>18</td><td>25</td>',
  ])
    expect(html).toContain(text);
  expect(html).not.toContain('2,026');
});
