import { renderToStaticMarkup } from 'react-dom/server';
import { expect, test } from 'vitest';
import { evaluateAustralia } from '@uk-immigration/engine';
import AustraliaPage from '../app/australia/page';
import { AustraliaResult } from '../app/australia/australia-content';
import Home from '../app/page';
import { t } from '../i18n';
import { LocaleContext } from '../i18n/locale';
import { auRequest, emptyAuForm, validateAuForm } from '../lib/australia';
import type { AuForm } from '../lib/australia';
import { sourceUrls } from '../lib/sources';

const render = (node: React.ReactNode, locale: 'zh-CN' | 'en') =>
  renderToStaticMarkup(
    <LocaleContext value={{ locale, setLocale: () => {} }}>
      {node}
    </LocaleContext>,
  );

const filled: AuForm = {
  ...emptyAuForm('2026-11-21'),
  dateOfBirth: '1990-05-01',
  firstArrival: '2021-02-01',
  visas: [
    { subclass: '482', from: '2021-02-01', to: '2023-08-31' },
    { subclass: '186', from: '2023-09-01', to: '' },
  ],
  trips: [{ departed: '2025-01-10', returned: '2025-02-10' }],
};

test.each(['zh-CN', 'en'] as const)('the form renders in %s', (locale) => {
  const html = render(<AustraliaPage />, locale);
  for (const key of [
    'au.title',
    'au.basics',
    'au.simulationDate',
    'au.visas',
    'au.trips',
    'au.partner',
    'au.submit',
  ] as const)
    expect(html).toContain(t(key, locale));
});

test('home links to the Australia pilot', () => {
  expect(render(<Home />, 'zh-CN')).toContain('href="/australia"');
});

test('validation marks missing and out-of-order dates', () => {
  const errors = validateAuForm({
    ...emptyAuForm('2026-11-21'),
    visas: [{ subclass: '482', from: '2025-01-01', to: '2024-12-31' }],
    trips: [{ departed: '2025-03-01', returned: '' }],
  });
  expect(errors).toEqual({
    'au-date-of-birth': 'au.error.date',
    'au-first-arrival': 'au.error.date',
    'au-visa-0-to': 'au.error.order',
    'au-trip-0-returned': 'au.error.date',
  });
  expect(validateAuForm(filled)).toEqual({});
  expect(validateAuForm({ ...filled, visas: [] })['au-add-visa']).toBe(
    'au.error.visas',
  );
});

test('the request leaves out blank end dates and an unticked partner', () => {
  const request = auRequest(filled, 'en');
  expect(request.visas[1]).toEqual({ subclass: '186', from: '2023-09-01' });
  expect(request.partnerApplication).toBeUndefined();
  expect(
    auRequest({ ...filled, partner: true, partnerLodged: '2025-03-10' }, 'en')
      .partnerApplication,
  ).toEqual({
    lodged: '2025-03-10',
    stream: 'onshore',
    longTermRelationship: false,
  });
});

test.each(['zh-CN', 'en'] as const)('results render in %s', (locale) => {
  const result = evaluateAustralia(auRequest(filled, locale));
  const html = render(<AustraliaResult result={result} />, locale);
  expect(html).toContain(t('au.resultTitle', locale));
  expect(html.match(/data-pathway=/g)).toHaveLength(5);
  expect(html).toContain('data-pathway="AU-CITIZENSHIP" data-status="MET"');
  expect(html).toContain(t('au.status.MET', locale));
  expect(html).toContain(`href="${sourceUrls['SRC-061']}"`);
  expect(html).toContain('PD-084');
});
