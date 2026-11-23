import { renderToStaticMarkup } from 'react-dom/server';
import { expect, test } from 'vitest';
import { DE_PERMIT_KINDS, evaluateGermany } from '@uk-immigration/engine';
import GermanyPage from '../app/germany/page';
import { PilotResult } from '../app/pilot/pilot-result';
import Home from '../app/page';
import { t } from '../i18n';
import type { TranslationKey } from '../i18n';
import { LocaleContext } from '../i18n/locale';
import {
  deRequest,
  emptyDeForm,
  endDateRequired,
  validateDeForm,
} from '../lib/germany';
import type { DeForm } from '../lib/germany';
import { sourceUrls } from '../lib/sources';

const render = (node: React.ReactNode, locale: 'zh-CN' | 'en') =>
  renderToStaticMarkup(
    <LocaleContext value={{ locale, setLocale: () => {} }}>
      {node}
    </LocaleContext>,
  );

const filled: DeForm = {
  ...emptyDeForm('2026-11-22'),
  firstEntry: '2024-03-01',
  permits: [{ kind: 'blue-card', from: '2024-03-10', to: '', renewing: false }],
  trips: [{ departed: '2025-01-10', returned: '2025-02-10' }],
  settlementRoute: 'blue-card',
  germanB1: true,
  blueCardMonths: '21',
};

test.each(['zh-CN', 'en'] as const)('the form renders in %s', (locale) => {
  const html = render(<GermanyPage />, locale);
  for (const key of [
    'de.title',
    'de.basics',
    'de.firstEntry',
    'de.permits',
    'de.kind',
    'de.trips',
    'de.settlementRoute',
    'de.contributions',
    'de.naturalisationRoute',
    'de.kind.subsidiary',
    'de.kind.humanitarian',
    'de.renewing',
    'de.submit',
  ] as const)
    expect(html).toContain(t(key, locale));
});

test('contributions include comparable pension schemes (review69-10)', () => {
  expect(t('de.contributions')).toContain('可比的保险、养老机构');
  expect(t('de.contributions', 'en')).toContain(
    'comparable insurance or pension scheme',
  );
});

test.each(['zh-CN', 'en'] as const)(
  'every permit type has a label in %s (task 73)',
  (locale) => {
    const html = render(<GermanyPage />, locale);
    for (const kind of DE_PERMIT_KINDS)
      expect(html).toContain(t(`de.kind.${kind}` as TranslationKey, locale));
  },
);

test('§ 20 job seeking needs its expiry; the hint tells § 20 from § 20a (review73-1)', () => {
  expect(
    validateDeForm({
      ...filled,
      permits: [
        { kind: 'job-seeking', from: '2026-09-01', to: '', renewing: false },
      ],
    }),
  ).toEqual({ 'de-permit-0-to': 'de.error.jobSeekingEnd' });
  for (const locale of ['zh-CN', 'en'] as const) {
    const hint = t('de.permitsHint', locale);
    expect(hint).toMatch(/§ 20[）)]/);
    expect(hint).toContain('§ 20a');
    expect(render(<GermanyPage />, locale)).toContain(
      hint.replaceAll('"', '&quot;'),
    );
  }
});

test('a job-search § 20a opportunity card, from form to result (review73-2, review73-3)', () => {
  const form: DeForm = {
    ...emptyDeForm('2026-11-23'),
    firstEntry: '2021-09-01',
    permits: [
      {
        kind: 'skilled',
        from: '2021-09-01',
        to: '2026-08-31',
        renewing: false,
      },
      {
        kind: 'opportunity-card',
        from: '2026-09-01',
        to: '2027-08-31',
        renewing: false,
      },
    ],
    contributionMonths: '60',
  };
  expect(validateDeForm(form)).toEqual({});
  const status = (id: string) =>
    evaluateGermany(deRequest(form, 'zh-CN')).pathways.find((p) => p.id === id)
      ?.status;
  // § 20a Abs. 6 excludes § 9 on the first card; StAG § 10 lists § 20a.
  expect(status('DE-SETTLEMENT')).toBe('NOT_MET');
  expect(status('DE-NATURALISATION')).toBe('NOT_MET');
  // The hint sends the card to its own options (review73-3).
  expect(t('de.permitsHint')).toContain(
    '选"找工作用的机会卡"或"后续机会卡"（再次签发的找工作用机会卡仍选前者），到期日必填',
  );
  expect(t('de.permitsHint', 'en')).toContain(
    'choose “Job-search opportunity card” or “Follow-up opportunity card”',
  );
  // Both cards need their expiry (§ 20a Abs. 5, review73-3).
  for (const kind of ['opportunity-card', 'follow-up-card'] as const)
    expect(
      validateDeForm({
        ...form,
        permits: [{ kind, from: '2026-09-01', to: '', renewing: false }],
      }),
    ).toEqual({ 'de-permit-0-to': 'de.error.opportunityCardEnd' });
});

test('the expiry label says required where the form requires it (review73-4)', () => {
  for (const kind of DE_PERMIT_KINDS)
    expect(!!endDateRequired(kind)).toBe(
      ['job-seeking', 'opportunity-card', 'follow-up-card'].includes(kind),
    );
  expect(t('de.toRequired')).toBe('到期日期（必填）');
  expect(t('de.toRequired', 'en')).toBe('Valid until (required)');
});

test('home links to Germany', () => {
  expect(render(<Home />, 'zh-CN')).toContain('href="/germany"');
});

test('validation marks dates, order, months and the marriage date', () => {
  expect(
    validateDeForm({
      ...emptyDeForm('2026-11-22'),
      permits: [
        {
          kind: 'skilled',
          from: '2022-01-01',
          to: '2021-01-01',
          renewing: false,
        },
      ],
      trips: [{ departed: '2024-02-10', returned: '' }],
      contributionMonths: '12.5',
      naturalisationRoute: 'spouse',
      spouseGermanSince: '2020-13-01',
    }),
  ).toEqual({
    'de-first-entry': 'de.error.date',
    'de-permit-0-to': 'de.error.order',
    'de-trip-0-returned': 'de.error.date',
    'de-contributions': 'de.error.months',
    'de-married-on': 'de.error.date',
    'de-spouse-german-since': 'de.error.date',
  });
  expect(validateDeForm(filled)).toEqual({});
  // Only the months field shown for the route is checked.
  expect(
    validateDeForm({ ...filled, contributionMonths: 'x', blueCardMonths: 'x' }),
  ).toEqual({ 'de-blue-card-months': 'de.error.months' });
});

test('the request leaves out blanks and hidden fields', () => {
  const req = deRequest(
    {
      ...filled,
      blueCardMonths: '',
      contributionMonths: '40',
      marriedOn: '2020-01-01',
      permits: [
        { kind: 'skilled', from: '2020-01-01', to: '', renewing: false },
      ],
    },
    'en',
  );
  expect(req.permits).toEqual([{ kind: 'skilled', from: '2020-01-01' }]);
  expect(req.firstEntry).toBe('2024-03-01');
  // Contributions are not asked on the Blue Card route.
  expect(req.contributionMonths).toBeUndefined();
  expect(req.blueCardEmploymentMonths).toBeUndefined();
  // The marriage date only goes with the spouse route.
  expect(req.marriedOn).toBeUndefined();
  expect(deRequest(filled, 'en').blueCardEmploymentMonths).toBe(21);
  // A renewal applied for before expiry goes with the permit (review69-4).
  expect(
    deRequest(
      {
        ...filled,
        permits: [
          {
            kind: 'skilled',
            from: '2020-01-01',
            to: '2026-03-31',
            renewing: true,
          },
        ],
      },
      'en',
    ).permits,
  ).toEqual([
    { kind: 'skilled', from: '2020-01-01', to: '2026-03-31', renewing: true },
  ]);
  // Settlement and EU long-term residence have no end date (review69-3).
  const unlimited = {
    ...filled,
    permits: [
      {
        kind: 'settlement' as const,
        from: '2025-01-01',
        to: '2026-10-31',
        renewing: false,
      },
    ],
  };
  expect(deRequest(unlimited, 'en').permits).toEqual([
    { kind: 'settlement', from: '2025-01-01' },
  ]);
  expect(
    validateDeForm({
      ...unlimited,
      permits: [
        {
          kind: 'eu-long-term',
          from: '2025-01-01',
          to: '2024-01-01',
          renewing: false,
        },
      ],
    }),
  ).toEqual({});
  const spouse = deRequest(
    {
      ...filled,
      naturalisationRoute: 'spouse',
      marriedOn: '2020-01-01',
      spouseGermanSince: '2021-05-01',
    },
    'en',
  );
  expect([spouse.marriedOn, spouse.spouseGermanSince]).toEqual([
    '2020-01-01',
    '2021-05-01',
  ]);
});

test.each(['zh-CN', 'en'] as const)('results render in %s', (locale) => {
  const result = evaluateGermany(deRequest(filled, locale));
  const html = render(<PilotResult result={result} />, locale);
  expect(html.match(/data-pathway=/g)).toHaveLength(4);
  // 21 months on the Blue Card from 2024-03-10.
  expect(html).toContain('data-pathway="DE-SETTLEMENT" data-status="MET"');
  expect(html).toContain('data-pathway="DE-TRAVEL" data-status="MET"');
  expect(html).toContain(
    'data-pathway="DE-NATURALISATION" data-status="FUTURE"',
  );
  expect(html).toContain(`href="${sourceUrls['SRC-108']}"`);
  expect(html).toContain('PD-123');
});
