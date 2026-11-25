import { readFileSync } from 'node:fs';
import { renderToStaticMarkup } from 'react-dom/server';
import { expect, test } from 'vitest';
import { RULES, RULE_SETS } from '@uk-immigration/engine';
import {
  currentLaw2026_11,
  earnedSettlement2026_11,
  policyChangelog,
  ROUTE_GROUP_SOURCES,
} from '@uk-immigration/policy-data';
import { esIndividualD } from '../../../packages/policy-data/fixtures/es-individual-d-public-funds';
import AustraliaPolicyPage from '../app/australia/policy/page';
import JapanPolicyPage from '../app/japan/policy/page';
import PolicyPage from '../app/uk/policy/page';
import { ResultView } from '../components/result-view';
import { SiteShell } from '../components/site-shell';
import { LocaleContext } from '../i18n/locale';
import { australiaModule } from '../lib/australia-module';
import { japanModule } from '../lib/japan-module';
import { sourceUrls } from '../lib/sources';
import { ukModule } from '../lib/uk-module';

const parameterSets = [currentLaw2026_11, earnedSettlement2026_11];
const render = (locale: 'zh-CN' | 'en' = 'zh-CN') =>
  renderToStaticMarkup(
    <LocaleContext value={{ locale, setLocale: () => {} }}>
      <SiteShell>
        <PolicyPage />
      </SiteShell>
    </LocaleContext>,
  );

test('policy page enumerates the exported rule sets, parameters, rules, changelog and sources', () => {
  const html = render();
  expect(html.match(/data-rule-set=/g)).toHaveLength(
    Object.keys(RULE_SETS).length,
  );
  expect(html.match(/data-rule=/g)).toHaveLength(
    Object.values(RULES).flat().length,
  );
  expect(html.match(/data-parameter=/g)).toHaveLength(
    parameterSets.reduce(
      (count, set) => count + Object.keys(set.values).length,
      0,
    ),
  );
  expect(html.match(/data-policy-change=/g)).toHaveLength(
    policyChangelog.length,
  );
  for (const ruleSet of Object.values(RULE_SETS)) {
    for (const { meta } of RULES[ruleSet.id]) {
      expect(html).toContain(`data-rule="${meta.id}"`);
      expect(html).toContain(meta.title);
      for (const pending of meta.pendingDetails ?? [])
        expect(html).toContain(pending);
    }
  }
  const dates = [...html.matchAll(/data-policy-change="([^"]+)"/g)].map(
    (match) => match[1],
  );
  expect(dates).toEqual(
    policyChangelog
      .map((change) => change.date)
      .sort()
      .reverse(),
  );
  expect(html).not.toMatch(/href="[^"?#]+\.md(?:[?#"])/);
});

test.each(['zh-CN', 'en'] as const)(
  'parameter and rule groups start collapsed with counts and scrollable table regions in %s',
  (locale) => {
    const html = render(locale);
    expect(html.match(/<details\b/g)).toHaveLength(
      Object.keys(RULE_SETS).length * 2,
    );
    expect(html).not.toMatch(/<details[^>]*\bopen/);
    expect(
      html.match(/<summary[^>]*><h3>[^<]+[（(]\d+[）)]<\/h3><\/summary>/g),
    ).toHaveLength(Object.keys(RULE_SETS).length * 2);
    for (const id of Object.keys(RULE_SETS)) {
      expect(html).toContain(`id="${id}-parameters"`);
      expect(html).toContain(
        `role="region" aria-labelledby="${id}-parameters" tabindex="0"><table`,
      );
    }
  },
);

test('policy page translates all metadata and UI in English, with readable parameter shapes', () => {
  const html = render('en');
  expect(html).not.toMatch(/[\u3400-\u9fff]/);
  expect(html).toContain('href="/uk/policy"');
  for (const { meta } of Object.values(RULES).flat()) {
    expect(meta.titleEn, meta.id).toMatch(/\S/);
    expect(html).toContain(renderToStaticMarkup(<h4>{meta.titleEn}</h4>));
  }
  for (const change of policyChangelog) {
    expect(change.titleEn, change.date).toMatch(/\S/);
    expect(change.summaryEn, change.date).toMatch(/\S/);
    expect(html).toContain(renderToStaticMarkup(<h3>{change.titleEn}</h3>));
    expect(html).toContain(renderToStaticMarkup(<p>{change.summaryEn}</p>));
  }
  const es = earnedSettlement2026_11.values;
  const cl = currentLaw2026_11.values;
  expect(html).toContain(
    `${es.bestYears10Year.value.required} of ${es.bestYears10Year.value.window} years`,
  );
  expect(html).toContain(
    es.earningsThresholdMinimum.value.toLocaleString('en'),
  );
  expect(html).toContain(`dateTime="${es.whitePaperPublished.value}"`);
  expect(html).toContain(cl.skilledWorkerSettlementEnglish.value.cefrLevel);
  expect(html).toContain(
    `dateTime="${cl.skilledWorkerSettlementEnglish.value.applicationsFrom}"`,
  );
});

test('every displayed metadata source and route-group source has a registered clickable URL', () => {
  const refs = [
    ...Object.values(RULE_SETS).flatMap((set) => set.sources),
    ...Object.values(RULES)
      .flat()
      .flatMap((rule) => rule.meta.sources),
    ...parameterSets.flatMap((set) =>
      Object.values(set.values).flatMap((value) => value.sources),
    ),
    ...policyChangelog.flatMap((change) => change.sources),
    ...Object.values(ROUTE_GROUP_SOURCES).flat(),
  ];
  const html = render();
  const listed = [...html.matchAll(/data-source="([^"]+)"/g)].map((m) => m[1]);
  // The original UK catalogue includes background and advice sources as well as rules.
  const originalUkIds = Array.from(
    { length: 60 },
    (_, index) => 'SRC-' + String(index + 1).padStart(3, '0'),
  );
  expect(listed).toEqual(expect.arrayContaining(originalUkIds));
  expect(listed).not.toContain('SRC-110');
  for (const ref of refs) {
    expect(listed).toContain(ref.srcId);
    expect(sourceUrls[ref.srcId], ref.srcId).toMatch(/^https:\/\//);
    expect(html).toContain(`href="${sourceUrls[ref.srcId]}"`);
  }
  const register = readFileSync(
    new URL('../../../docs/SOURCES.md', import.meta.url),
    'utf8',
  );
  const ids = [...register.matchAll(/^\| (SRC-\d+) \|/gm)].map(
    (match) => match[1],
  );
  expect(Object.keys(sourceUrls).sort()).toEqual(ids.sort());
  for (const [id, url] of Object.entries(sourceUrls)) {
    const line = register
      .split('\n')
      .find((line) => line.startsWith(`| ${id} |`));
    expect(line).toContain(url);
  }
});

function expectResultSourcesListed(resultHtml: string, policyHtml: string) {
  const cited = new Set(resultHtml.match(/\bSRC-\d+\b/g));
  // Advice links name the organisation in their label and only expose the URL.
  for (const [id, url] of Object.entries(sourceUrls)) {
    if (resultHtml.includes(`href="${url.replaceAll('&', '&amp;')}"`))
      cited.add(id);
  }
  expect(cited.size).toBeGreaterThan(0);
  for (const id of cited) expect(policyHtml).toContain(`data-source="${id}"`);
}

test('the UK policy catalogue includes every citation and advice link in the rendered result', () => {
  const draft = { ...ukModule.createDraft(), ...esIndividualD.request };
  const result = renderToStaticMarkup(
    <ResultView
      country={ukModule}
      result={ukModule.run(draft, 'zh-CN')}
      draft={draft}
    />,
  );
  expect(result).toContain('SRC-037');
  expect(result).toContain(`href="${sourceUrls['SRC-016']}"`);
  expectResultSourcesListed(result, render());
});

test('the Japan policy catalogue includes every citation in residence, naturalisation and re-entry results', () => {
  const draft = japanModule.createDraft();
  draft.simulationDate = '2027-04-05';
  draft.stayStart = '2014-04-01';
  draft.permanentResidence.routes = [
    { route: 'general', statusStart: draft.stayStart },
  ];
  draft.naturalisation.routes = [{ route: 'general' }];
  draft.reentry = [
    { route: 'ordinary' },
    { route: 'deemed' },
    { route: 'refugee-travel-document' },
  ];
  const result = renderToStaticMarkup(
    <ResultView
      country={japanModule}
      result={japanModule.run(draft, 'zh-CN')}
      draft={draft}
    />,
  );
  expect(result).toContain('SRC-461');
  expectResultSourcesListed(result, renderToStaticMarkup(<JapanPolicyPage />));
});

test('the Australia policy catalogue includes every citation in all eleven pathways without non-Australian sources', () => {
  const draft = australiaModule.createDraft();
  draft.simulationDate = '2026-11-23';
  const result = renderToStaticMarkup(
    <ResultView
      country={australiaModule}
      result={australiaModule.run(draft, 'zh-CN')}
      draft={draft}
    />,
  );
  const policyHtml = renderToStaticMarkup(<AustraliaPolicyPage />);
  expect(result).toContain('SRC-200');
  expectResultSourcesListed(result, policyHtml);
  expect(policyHtml).not.toContain('data-source="SRC-001"');
  expect(policyHtml).not.toContain('data-source="SRC-110"');
});
