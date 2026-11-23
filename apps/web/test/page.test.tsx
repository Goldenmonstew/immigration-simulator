import { readFileSync } from 'node:fs';
import { renderToStaticMarkup } from 'react-dom/server';
import { expect, test } from 'vitest';
import type { DecisionOutcome, SimulationResult } from '@uk-immigration/engine';
import HubPage, { metadata as hubMetadata } from '../app/page';
import { metadata as rootMetadata } from '../app/layout';
import Home from '../app/uk/page';
import { ResultView } from '../components/result-view';
import { SiteShell } from '../components/site-shell';
import { t } from '../i18n';
import type { TranslationKey } from '../i18n';
import { LocaleContext } from '../i18n/locale';
import { routeGroupNames } from '../i18n/routes';
import { policyAsOf } from '../lib/policy';
import { mockResults } from '../lib/mock-results';
import { countryPath, siteCountries } from '../lib/site-countries';
import { sourceUrls } from '../lib/sources';
import { createDraft, runSimulation } from '../lib/questionnaire';

test.each(['zh-CN', 'en'] as const)(
  'hub page renders 11 country cards, links, shell navigation and bilingual copy in %s',
  (locale) => {
    const html = renderToStaticMarkup(
      <LocaleContext value={{ locale, setLocale: () => {} }}>
        <SiteShell>
          <HubPage />
        </SiteShell>
      </LocaleContext>,
    );
    for (const key of [
      'site.name',
      'site.shortName',
      'site.navigation',
      'hub.title',
      'hub.intro',
      'hub.badge.rules',
      'hub.badge.whatif',
      'hub.badge.sources',
      'hub.badge.game',
      'hub.badge.local',
      'hub.countriesTitle',
      'hub.beforeTitle',
      'hub.prepare',
      'hub.privacy',
      'hub.disclaimerTitle',
      'hub.disclaimer',
    ] as const) {
      expect(html).toContain(t(key, locale));
    }
    expect(html).not.toContain(t('site.allCountries', locale));
    expect(html).toContain(`<a href="/uk/about">${t('about.link', locale)}</a>`);
    if (locale === 'zh-CN') {
      expect(html).toContain(t('hub.disclaimerEnglish', locale));
    } else {
      expect(html).not.toMatch(/[\u3400-\u9fff：、（）]/);
    }
    expect(html).not.toMatch(/试点|\bpilots?\b/i);
    expect(html.match(/<article\b/g)).toHaveLength(siteCountries.length);

    for (const { id, nameKey, hasGame } of siteCountries) {
      const name = t(nameKey, locale);
      expect(html).toContain(`<h3 id="country-${id}">${name}</h3>`);
      expect(html).toContain(t(`hub.${id}.code` as TranslationKey, locale));
      expect(html).toContain(t(`hub.${id}.desc` as TranslationKey, locale));
      for (const pathLabel of t(
        `hub.${id}.paths` as TranslationKey,
        locale,
      ).split(' · ')) {
        expect(html).toContain(`<li>${pathLabel}</li>`);
      }
      const calcAria = t('hub.calculateAria', locale).replace(
        '{country}',
        name,
      );
      expect(html).toContain(`href="${countryPath(id)}"`);
      expect(html).toContain(`aria-label="${calcAria}"`);
      const gameHref = `href="${countryPath(id, 'game')}"`;
      if (hasGame) {
        const gameAria = t('hub.playGameAria', locale).replace(
          '{country}',
          name,
        );
        expect(html).toContain(gameHref);
        expect(html).toContain(`aria-label="${gameAria}"`);
      } else {
        expect(html).not.toContain(gameHref);
      }
    }
  },
);

test('site metadata and manifest use the multi-country name and hub intro', () => {
  const manifest = JSON.parse(
    readFileSync(
      new URL('../public/manifest.webmanifest', import.meta.url),
      'utf8',
    ),
  ) as { name: string; short_name: string };
  expect(t('site.name')).toBe('移民路径模拟');
  expect(t('site.name', 'en')).toBe('Immigration Path Simulator');
  expect(t('site.shortName')).toBe('移民模拟');
  expect(t('site.shortName', 'en')).toBe('Path Sim');
  expect(rootMetadata.description).toBe(t('hub.intro'));
  expect(hubMetadata.description).toBe(t('hub.intro'));
  expect(manifest.name).toBe('移民路径模拟');
  expect(manifest.short_name).toBe('移民模拟');
});

test('homepage presents policy status, disclaimer, privacy and the questionnaire entry', () => {
  const html = renderToStaticMarkup(<Home />);
  for (const text of [
    policyAsOf,
    t('policy.CURRENT_LAW'),
    t('policy.ANNOUNCED_NOT_IN_FORCE'),
    t('home.disclaimerEnglish'),
    t('home.privacy'),
  ])
    expect(html).toContain(text);
  expect(html).toContain('href="/uk/simulate"');
  expect(html).not.toContain('mock=');
  expect(html).toMatch(/<details[^>]*><summary>建模范围<\/summary>/);
  expect(html).not.toMatch(/<details[^>]*\bopen/);
});

test('an empty rule list renders without implying eligibility', () => {
  const html = renderToStaticMarkup(
    <ResultView
      result={{
        policyAsOf,
        byRuleSet: {
          'current-law-2026-11': {
            outcome: 'INSUFFICIENT_INFORMATION',
            rules: [],
            assumptions: [],
          },
          'earned-settlement-2026-11': {
            outcome: 'INSUFFICIENT_INFORMATION',
            rules: [],
            assumptions: [],
          },
        },
      }}
    />,
  );
  expect(html).toContain(t('outcome.INSUFFICIENT_INFORMATION'));
  expect(html).toContain(t('result.noRules'));
  expect(html).toContain(t('result.undetermined'));
  expect(html).toContain(t('result.noAssumptions'));
  expect(html).not.toContain('<details');
});

test.each<DecisionOutcome>([
  'LIKELY_ELIGIBLE',
  'LIKELY_NOT_ELIGIBLE',
  'POTENTIALLY_ELIGIBLE',
  'INSUFFICIENT_INFORMATION',
  'POLICY_NOT_YET_IN_FORCE',
  'REQUIRES_REGULATED_REVIEW',
])('renders outcome %s with its explanation', (outcome) => {
  const result: SimulationResult = {
    policyAsOf,
    byRuleSet: {
      'current-law-2026-11': { outcome, rules: [], assumptions: [] },
    },
  };
  const html = renderToStaticMarkup(<ResultView result={result} />);
  expect(html).toContain(t(`outcome.${outcome}`));
  expect(html).toContain(t(`outcome.${outcome}.description`));
});

test('a frontend short circuit without assessments shows only advice', () => {
  const html = renderToStaticMarkup(
    <ResultView
      result={{
        policyAsOf,
        byRuleSet: {},
        shortCircuit: {
          reason: 'PROTECTION',
          message: '需要专业审查的测试情景',
        },
      }}
    />,
  );
  expect(html).toContain('需要专业审查的测试情景');
  expect(html).toContain(t('result.advice'));
  expect(html).not.toContain(t('result.pathway'));
  expect(html).not.toContain(t('outcome.LIKELY_ELIGIBLE'));
});

test.each([
  // A Hong Kong BN(O) main applicant is assessed under current law (§12).
  ['HONG_KONG_BNO', 'MAIN', 'OUTSIDE_FRAMEWORK', 'LIKELY_NOT_ELIGIBLE'],
  ['CORE_PROTECTION', 'DEPENDANT', 'PROTECTION', 'INSUFFICIENT_INFORMATION'],
] as const)(
  'engine short circuit for %s retains both assessment columns',
  (route, role, reason, currentLaw) => {
    const draft = createDraft();
    draft.simulationDate = '2026-11-04';
    draft.timeline.dateOfBirth = '1991-08-19';
    draft.timeline.episodes = [
      { route, role, validFrom: '2025-01-01', validTo: '2031-01-01' },
    ];
    const result = runSimulation(draft);
    expect(result.shortCircuit?.reason).toBe(reason);
    expect(result.byRuleSet['current-law-2026-11']?.outcome).toBe(currentLaw);
    expect(result.byRuleSet['earned-settlement-2026-11']?.outcome).toBe(
      'REQUIRES_REGULATED_REVIEW',
    );
    const html = renderToStaticMarkup(<ResultView result={result} />);
    expect(html).toContain(result.shortCircuit!.message);
    expect(html).toContain('id="current-law-2026-11-heading"');
    expect(html).toContain('id="earned-settlement-2026-11-heading"');
    expect(html).toContain(t(`outcome.${currentLaw}`));
    expect(html).toContain(t('outcome.REQUIRES_REGULATED_REVIEW'));
    for (const assessment of Object.values(result.byRuleSet)) {
      expect(assessment.rules.length).toBeGreaterThan(0);
      for (const rule of assessment.rules) expect(html).toContain(rule.title);
    }
  },
);

test('previews render rules, assumptions, dates, source links and group order', () => {
  const positive = renderToStaticMarkup(
    <ResultView result={mockResults('zh-CN')['1']} mock />,
  );
  expect(positive).toContain(t('result.mock'));
  expect(positive).toContain('SRC-001 p16');
  expect(positive).toContain(sourceUrls['SRC-001']);
  expect(positive).toContain(`dateTime="${policyAsOf}"`);
  expect(positive).toContain(routeGroupNames.CORE_PERMISSION['zh-CN']);
  expect(positive).toContain('政府未定细节：PD-012、PD-013');
  expect(positive).toContain('<details><summary>假设清单（2 条）</summary>');
  const groups = [
    ...positive.matchAll(
      /<details([^>]*)><summary><h4>(.*?)<\/h4><\/summary>/g,
    ),
  ];
  expect(groups).toHaveLength(6);
  for (const [index, group] of groups.entries())
    expect(group[1].includes('open=""')).toBe(index % 3 !== 2);
  const sources = [
    ...positive.matchAll(/<details([^>]*)><summary>来源（(\d+)）<\/summary>/g),
  ];
  expect(sources.length).toBeGreaterThan(0);
  for (const source of sources) expect(source[1]).not.toContain('open');
  const negative = renderToStaticMarkup(
    <ResultView result={mockResults('zh-CN')['2']} mock />,
  );
  expect(negative.indexOf('data-status="FAIL"')).toBeLessThan(
    negative.indexOf('data-status="UNKNOWN"'),
  );
  expect(negative).toContain('PD-013');
});
