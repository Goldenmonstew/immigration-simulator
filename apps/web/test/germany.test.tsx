import { renderToStaticMarkup } from 'react-dom/server';
import { expect, test } from 'vitest';
import { evaluateGermany } from '@uk-immigration/engine';
import GermanyPage from '../app/germany/page';
import { PilotResult } from '../app/pilot/pilot-result';
import Home from '../app/page';
import { t } from '../i18n';
import { LocaleContext } from '../i18n/locale';
import { deRequest, emptyDeForm, validateDeForm } from '../lib/germany';
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
  permits: [{ kind: 'blue-card', from: '2024-03-10', to: '' }],
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
    'de.submit',
  ] as const)
    expect(html).toContain(t(key, locale));
});

test('home links to the Germany pilot', () => {
  expect(render(<Home />, 'zh-CN')).toContain('href="/germany"');
});

test('validation marks dates, order, months and the marriage date', () => {
  expect(
    validateDeForm({
      ...emptyDeForm('2026-11-22'),
      permits: [{ kind: 'skilled', from: '2022-01-01', to: '2021-01-01' }],
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
      permits: [{ kind: 'skilled', from: '2020-01-01', to: '' }],
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
