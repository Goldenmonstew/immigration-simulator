import { renderToStaticMarkup } from 'react-dom/server';
import { expect, test } from 'vitest';
import type { RuleOutcome, SettlementAssessment } from '@uk-immigration/engine';
import { GapSummary } from '../components/gap-summary';
import { ResultView } from '../components/result-view';
import { clHkbnoFiveYears } from '../../../packages/policy-data/fixtures/cl-hkbno-five-years';
import { clFamilyFiveYearChildProjected } from '../../../packages/policy-data/fixtures/cl-family-five-year-child-projected';
import { esP45IndividualCCareWorkerAfterCutoff as skilledWorker } from '../../../packages/policy-data/fixtures/es-p45-individual-c-care-worker-after-cutoff';
import {
  createDraft,
  runPrincipalSimulation,
  runSimulation,
} from '../lib/questionnaire';
import { LocaleContext } from '../i18n/locale';
import { t } from '../i18n';
import { firstSentence, gapRules, remainingTime } from '../lib/gap-summary';

const rule = (
  id: string,
  status: RuleOutcome['status'],
  pendingDetails?: string[],
): RuleOutcome => ({
  id,
  status,
  title: id,
  explanation: 'First sentence. Second sentence.',
  sources: [],
  pendingDetails,
});
const rules = [
  rule('ES-EARNINGS-10Y', 'FAIL'),
  rule('CL-ENGLISH', 'UNKNOWN'),
  rule('ES-PUBLIC-FUNDS', 'UNKNOWN', ['PD-013']),
  rule('CL-KOL', 'PASS'),
];
const assessment = (
  patch: Partial<SettlementAssessment> = {},
): SettlementAssessment => ({
  outcome: 'INSUFFICIENT_INFORMATION',
  rules,
  assumptions: [],
  ...patch,
});
const render = (
  value: SettlementAssessment,
  locale: 'en' | 'zh-CN' = 'zh-CN',
) =>
  renderToStaticMarkup(
    <LocaleContext value={{ locale, setLocale: () => {} }}>
      <GapSummary assessment={value} simulationDate="2026-11-04" canWhatIf />
    </LocaleContext>,
  );

test('likely eligible only shows the all-modelled-requirements sentence, even with failed alternatives', () => {
  const html = render(assessment({ outcome: 'LIKELY_ELIGIBLE' }));
  expect(html).toContain(t('gap.met'));
  expect(html).not.toContain('ES-EARNINGS');
  expect(html).not.toContain('/whatif');
});

test.each([
  'LIKELY_NOT_ELIGIBLE',
  'POTENTIALLY_ELIGIBLE',
  'INSUFFICIENT_INFORMATION',
] as const)(
  '%s without a date shows failures and distinguishes the two unknown kinds',
  (outcome) => {
    const html = render(assessment({ outcome }));
    expect(html).toContain('ES-EARNINGS-10Y');
    expect(html).toContain('CL-ENGLISH（补填信息）');
    expect(html).toContain('ES-PUBLIC-FUNDS（待政府明确）');
    expect(html).not.toContain('CL-KOL');
    expect(html).toContain('First sentence.');
    expect(html).not.toContain('Second sentence.');
  },
);

test('task 49 / A6#6: a projected date shows the wait and keeps requirements still to confirm', () => {
  const html = render(
    assessment({
      outcome: 'LIKELY_NOT_ELIGIBLE',
      earliestDate: '2028-01-04',
      pathwayYears: 5,
    }),
  );
  expect(html).toContain('按当前情况最早 2028-01-04');
  expect(html).toContain('1 年 2 个月');
  expect(html).toContain('ES-EARNINGS-10Y');
  expect(html).toContain('CL-ENGLISH（补填信息）');
});

test('task 49 / A6#7: a conditional completion is not shown as the earliest date', () => {
  const html = render(
    assessment({
      outcome: 'LIKELY_NOT_ELIGIBLE',
      pathwayYears: 20,
      pathwayCompletionDate: '2041-06-01',
      publicFundsReassessmentDate: '2028-11-01',
    }),
  );
  expect(html).toContain('条件满期日 2041-06-01');
  expect(html).toContain('2028-11-01 起可按较短路径重新评估');
  expect(html).not.toContain('按当前情况最早 2041-06-01');
});

test.each(['POTENTIALLY_ELIGIBLE', 'LIKELY_NOT_ELIGIBLE'] as const)(
  '%s with decidedBy only lists gaps from the selected pathway in rule order',
  (outcome) => {
    const value = assessment({
      outcome,
      earliestDate: '2028-01-04',
      pathwayYears: 5,
      decidedBy: ['CL-SW-RESIDENCE-5Y', 'CL-ENGLISH', 'CL-KOL'],
      rules: [
        rule('CL-LR-RESIDENCE-10Y', 'FAIL'),
        rule('CL-SW-RESIDENCE-5Y', 'FAIL'),
        ...rules.slice(1),
      ],
    });
    expect(gapRules(value).map((item) => item.id)).toEqual([
      'CL-SW-RESIDENCE-5Y',
      'CL-ENGLISH',
    ]);
    const html = render(value);
    expect(html).toContain('CL-SW-RESIDENCE-5Y');
    expect(html).toContain('href="/whatif?focus=date"');
    expect(html).not.toContain('CL-LR-RESIDENCE-10Y');
    expect(html).not.toContain('ES-PUBLIC-FUNDS');
    expect(html).not.toContain('CL-KOL');
  },
);

test('without decidedBy all rules remain eligible for the summary', () => {
  expect(gapRules(assessment())).toEqual(rules.slice(0, 3));
  expect(
    gapRules(
      assessment({
        outcome: 'LIKELY_NOT_ELIGIBLE',
        earliestDate: '2028-01-04',
      }),
    ),
  ).toEqual(rules.slice(0, 3));
});

test.each(['zh-CN', 'en'] as const)(
  'HK BN(O) before the CR 1.1 window explains early filing and keeps Long Residence in why in %s',
  (locale) => {
    const draft = {
      ...createDraft(),
      ...structuredClone(clHkbnoFiveYears.request),
      simulationDate: '2026-01-01',
      completed: true,
    };
    const result = runSimulation(draft, locale);
    const current = result.byRuleSet['current-law-2026-11']!;
    expect(current.outcome).toBe('LIKELY_NOT_ELIGIBLE');
    expect(gapRules(current).map((item) => item.id)).toEqual([
      'CL-HKBNO-RESIDENCE-5Y',
    ]);
    const alternative = current.rules.find(
      (item) => item.id === 'CL-LR-RESIDENCE-10Y',
    )!;
    expect(alternative.status).toBe('FAIL');
    expect(render(current, locale)).not.toContain(alternative.title);
    const html = renderToStaticMarkup(
      <LocaleContext value={{ locale, setLocale: () => {} }}>
        <ResultView result={result} draft={draft} />
      </LocaleContext>,
    );
    expect(html).toContain(alternative.title);
    expect(html).toContain(
      locale === 'en'
        ? 'you can apply up to 28 days before completing the qualifying period (CR 1.1(b))'
        : '可在合格居留期满前最多 28 天递交（CR 1.1(b)）',
    );
    if (locale === 'en') expect(html).not.toMatch(/[\u3400-\u9fff：、（）]/);
  },
);

test.each(['zh-CN', 'en'] as const)(
  'a five-year partner child summary follows the parent date in %s',
  (locale) => {
    const draft = {
      ...createDraft(),
      ...structuredClone(clFamilyFiveYearChildProjected.request),
      completed: true,
    };
    const current = runSimulation(draft, locale).byRuleSet[
      'current-law-2026-11'
    ]!;
    const parent = runPrincipalSimulation(draft, locale)!.byRuleSet[
      'current-law-2026-11'
    ]!;
    const date = clFamilyFiveYearChildProjected.expected.earliestDate!;
    expect(current.outcome).toBe('LIKELY_NOT_ELIGIBLE');
    expect(current.earliestDate).toBe(date);
    expect(current.earliestDate).toBe(parent.earliestDate);
    expect(current.decidedBy).toContain('CL-FAMILY-CHILD');
    const html = render(current, locale);
    expect(html).toContain(t('gap.earliest', locale).replace('{date}', date));
    expect(html).not.toContain('Long Residence');
    if (locale === 'en') expect(html).not.toMatch(/[\u3400-\u9fff：、（）]/);
  },
);

test.each(['REQUIRES_REGULATED_REVIEW', 'POLICY_NOT_YET_IN_FORCE'] as const)(
  '%s does not get an actionable summary',
  (outcome) => {
    expect(render(assessment({ outcome }))).toBe('');
  },
);

test('more than five rows are collapsed, counting the projected date', () => {
  const many = Array.from({ length: 6 }, (_, index) =>
    rule(`RULE-${index}`, 'FAIL'),
  );
  const html = render(assessment({ rules: many }));
  expect(html).toContain('aria-expanded="false"');
  expect(html.match(/class="[^"]*gapCollapsed[^"]*"/g)).toHaveLength(1);
  const dated = render(
    assessment({
      rules: many,
      outcome: 'LIKELY_NOT_ELIGIBLE',
      earliestDate: '2028-01-04',
    }),
  );
  expect(dated.match(/class="[^"]*gapCollapsed[^"]*"/g)).toHaveLength(2);
  expect(render(assessment({ rules: many.slice(0, 5) }))).not.toContain(
    'aria-expanded',
  );
});

test('links contain only mapped control keys and unmapped rules have no action', () => {
  const html = render(
    assessment({ rules: [...rules, rule('ES-DEBT', 'FAIL')] }),
  );
  expect(html.match(/href="[^"]+"/g)).toEqual([
    'href="/whatif?focus=income"',
    'href="/whatif?focus=english"',
    'href="/whatif?focus=publicFunds"',
  ]);
  const readOnly = renderToStaticMarkup(
    <GapSummary assessment={assessment()} />,
  );
  expect(readOnly).not.toContain('/whatif');
});

test.each([
  'LIKELY_ELIGIBLE',
  'LIKELY_NOT_ELIGIBLE',
  'POTENTIALLY_ELIGIBLE',
  'INSUFFICIENT_INFORMATION',
] as const)('English %s summary contains no Chinese', (outcome) => {
  const html = render(assessment({ outcome }), 'en');
  expect(html).toContain('What is missing');
  expect(html).not.toMatch(/[\u3400-\u9fff：、（）]/);
  expect(
    render(
      assessment({ outcome, earliestDate: '2028-01-04', pathwayYears: 5 }),
      'en',
    ),
  ).not.toMatch(/[\u3400-\u9fff：、（）]/);
});

test.each([
  ['2026-11-04', '2026-11-04', 0, 0],
  ['2026-11-04', '2026-01-01', 0, 0],
  ['2026-11-04', '2026-11-05', 0, 1],
  ['2026-11-04', '2028-01-04', 1, 2],
  ['2026-11-04', '2028-01-05', 1, 3],
  ['2026-01-31', '2026-02-28', 0, 1],
  ['2028-01-31', '2028-02-29', 0, 1],
  ['2028-02-29', '2029-02-28', 1, 0],
  ['2026-12-31', '2027-01-01', 0, 1],
])(
  'calendar wait %s to %s is %i years %i months',
  (from, to, years, months) => {
    expect(remainingTime(from, to)).toEqual({ years, months });
  },
);

test('first sentences preserve decimal rule references and both languages', () => {
  expect(firstSentence('按 SW 22A.1 核对。下一句。', 'zh-CN')).toBe(
    '按 SW 22A.1 核对。',
  );
  expect(
    firstSentence('See SW 22A.1 for details. Another sentence.', 'en'),
  ).toBe('See SW 22A.1 for details.');
  expect(firstSentence('No punctuation', 'en')).toBe('No punctuation');
  expect(firstSentence('', 'en')).toBe('');
});

test('a real Skilled Worker assessment with missing English offers the English control in both languages', () => {
  const draft = {
    ...createDraft(),
    ...structuredClone(skilledWorker.request),
    completed: true,
  };
  draft.timeline.english = undefined;
  for (const locale of ['zh-CN', 'en'] as const) {
    const assessment = runSimulation(draft, locale).byRuleSet[
      'current-law-2026-11'
    ]!;
    expect(assessment.outcome).toBe('INSUFFICIENT_INFORMATION');
    const html = render(assessment, locale);
    expect(html).toContain('href="/whatif?focus=english"');
    if (locale === 'zh-CN') expect(html).toContain('定居英语要求（补填信息）');
    else expect(html).not.toMatch(/[\u3400-\u9fff：、（）]/);
  }
});

test.each(['zh-CN', 'en'] as const)(
  'task 49 / playtest #2: the result names the pathway it rests on and sets other pathways apart in %s',
  (locale) => {
    const draft = {
      ...createDraft(),
      ...structuredClone(clHkbnoFiveYears.request),
      simulationDate: '2026-01-01',
      completed: true,
    };
    const result = runSimulation(draft, locale);
    const html = renderToStaticMarkup(
      <LocaleContext value={{ locale, setLocale: () => {} }}>
        <ResultView result={result} draft={draft} />
      </LocaleContext>,
    );
    expect(html).toContain(
      locale === 'en'
        ? 'Based on the 5-year pathway ('
        : '结论依据：5 年路径（',
    );
    expect(html).toContain(
      locale === 'en'
        ? 'Other pathways (shows why they were not used)'
        : '其他路径的条件（可看这些路径为何未被采用）',
    );
  },
);

test.each(['zh-CN', 'en'] as const)(
  'review49-1 #2: a 20-year conclusion names public funds as what rules out shorter pathways in %s',
  (locale) => {
    const draft = {
      ...createDraft(),
      simulationDate: '2026-11-04',
      completed: true,
    };
    draft.screening = { criminality: 'no', breach: 'no', debt: 'no' };
    draft.timeline = {
      ...draft.timeline,
      dateOfBirth: '1990-01-01',
      nationality: 'IND',
      episodes: [
        {
          route: 'SKILLED_WORKER',
          role: 'MAIN',
          validFrom: '2021-06-01',
          validTo: '2027-05-31',
          socCode: '2136',
          salary: 52000,
        },
      ],
      incomeYears: draft.timeline.incomeYears.map((year) => ({
        ...year,
        earnings: 52000,
      })),
      benefits: [
        {
          benefitType: 'UNIVERSAL_CREDIT',
          from: '2023-01-01',
          to: '2023-10-31',
        },
      ],
      english: { cefrLevel: 'B2' },
      lifeInTheUk: { passed: true },
    };
    const result = runSimulation(draft, locale);
    const reform = result.byRuleSet['earned-settlement-2026-11']!;
    expect(reform.pathwayCompletionDate).toBe('2041-06-01');
    const html = renderToStaticMarkup(
      <LocaleContext value={{ locale, setLocale: () => {} }}>
        <ResultView result={result} draft={draft} />
      </LocaleContext>,
    );
    const title = (id: string) => reform.rules.find((r) => r.id === id)!.title;
    expect(html).toContain(t('result.shorterBlocked', locale));
    // review49-2 #1: each shorter pathway lists its own failed requirements.
    expect(html).toContain(
      locale === 'en'
        ? `<li>5-year pathway (earnings) – not met: ${title('ES-PUBLIC-FUNDS')}</li>`
        : `<li>5 年路径（收入）——未满足：${title('ES-PUBLIC-FUNDS')}</li>`,
    );
    expect(html).toContain(
      locale === 'en'
        ? `<li>5-year pathway (British connection) – not met: ${title('ES-BRITISH-CONNECTION')}`
        : `<li>5 年路径（British connection）——未满足：${title('ES-BRITISH-CONNECTION')}`,
    );
    expect(html).toMatch(
      new RegExp(
        `<li>10[^<]*${title('ES-PUBLIC-FUNDS').replace(/[()]/g, '.')}</li>`,
      ),
    );
    expect(html).toContain('2041-06-01');
    expect(html).toContain('2028-11-01');
  },
);

test.each(['zh-CN', 'en'] as const)(
  'review49-2 #1: a 10-year conclusion names its earnings rule and the requirements that rule out shorter pathways in %s',
  (locale) => {
    const draft = {
      ...createDraft(),
      simulationDate: '2026-11-04',
      completed: true,
    };
    draft.screening = { criminality: 'no', breach: 'no', debt: 'no' };
    draft.timeline = {
      ...draft.timeline,
      dateOfBirth: '1990-01-01',
      nationality: 'IND',
      episodes: [
        {
          route: 'SKILLED_WORKER',
          role: 'MAIN',
          validFrom: '2021-06-01',
          validTo: '2027-05-31',
          socCode: '2136',
          salary: 30000,
        },
      ],
      incomeYears: draft.timeline.incomeYears.map((year) => ({
        ...year,
        earnings: 30000,
      })),
      english: { cefrLevel: 'B2' },
      lifeInTheUk: { passed: true },
    };
    const result = runSimulation(draft, locale);
    const reform = result.byRuleSet['earned-settlement-2026-11']!;
    expect(reform.pathwayYears).toBe(10);
    const title = (id: string) => reform.rules.find((r) => r.id === id)!.title;
    const html = renderToStaticMarkup(
      <LocaleContext value={{ locale, setLocale: () => {} }}>
        <ResultView result={result} draft={draft} />
      </LocaleContext>,
    );
    expect(html).toContain(
      locale === 'en'
        ? `Based on the 10-year pathway (${title('ES-EARNINGS-10Y')})`
        : `结论依据：10 年路径（${title('ES-EARNINGS-10Y')}）`,
    );
    expect(html).toContain(
      locale === 'en'
        ? `<li>3-year pathway (earnings) – not met: ${title('ES-EARNINGS-3Y')}</li>`
        : `<li>3 年路径（收入）——未满足：${title('ES-EARNINGS-3Y')}</li>`,
    );
    expect(html).toContain(
      locale === 'en'
        ? `<li>5-year pathway (earnings) – not met: ${title('ES-EARNINGS-5Y')}</li>`
        : `<li>5 年路径（收入）——未满足：${title('ES-EARNINGS-5Y')}</li>`,
    );

    // review49-3: a 5-year candidate left open by PD-006 is still to be
    // confirmed, not failed.
    draft.timeline = {
      ...draft.timeline,
      episodes: [{ ...draft.timeline.episodes[0], validFrom: '2016-01-01' }],
      incomeYears: draft.timeline.incomeYears.map((year) => ({
        ...year,
        earnings: ['2021-22', '2022-23'].includes(year.taxYear) ? 60000 : 20000,
      })),
    };
    const open = runSimulation(draft, locale);
    expect(open.byRuleSet['earned-settlement-2026-11']!.pathwayYears).toBe(10);
    expect(
      renderToStaticMarkup(
        <LocaleContext value={{ locale, setLocale: () => {} }}>
          <ResultView result={open} draft={draft} />
        </LocaleContext>,
      ),
    ).toContain(
      locale === 'en'
        ? `<li>5-year pathway (earnings) – still to be confirmed: ${title('ES-EARNINGS-5Y')}</li>`
        : `<li>5 年路径（收入）——待确认：${title('ES-EARNINGS-5Y')}</li>`,
    );
  },
);
