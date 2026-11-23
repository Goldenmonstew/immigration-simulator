import { renderToStaticMarkup } from 'react-dom/server';
import { expect, test } from 'vitest';
import type { CountryPathway } from '@uk-immigration/engine';
import { esP31IndividualAPartnerArrivesTogether as partner } from '../../../packages/policy-data/fixtures/es-p31-individual-a-partner-arrives-together';
import { ResultView } from '../components/result-view';
import { PolicyPage } from '../components/policy-page';
import type { CountryPolicy, PolicyRuleSet } from '../lib/policy';
import { WhatIfView } from '../components/whatif-lab';
import { t } from '../i18n';
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
    '/canada/about',
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
        values: { exampleList: { value: ['Alpha', 'Beta'], sources } },
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
});
