import { renderToStaticMarkup } from 'react-dom/server';
import { expect, test } from 'vitest';
import { evaluateSpain } from '@uk-immigration/engine';
import SpainPage from '../app/spain/page';
import { PilotResult } from '../app/pilot/pilot-result';
import Home from '../app/page';
import { t } from '../i18n';
import { LocaleContext } from '../i18n/locale';
import { emptyEsForm, esRequest, validateEsForm } from '../lib/spain';
import type { EsForm } from '../lib/spain';
import { sourceUrls } from '../lib/sources';

const render = (node: React.ReactNode, locale: 'zh-CN' | 'en') =>
  renderToStaticMarkup(
    <LocaleContext value={{ locale, setLocale: () => {} }}>
      {node}
    </LocaleContext>,
  );

const filled: EsForm = {
  ...emptyEsForm('2026-11-21'),
  dateOfBirth: '1990-05-01',
  permits: [{ from: '2020-03-15', to: '', study: false }],
};

test.each(['zh-CN', 'en'] as const)('the form renders in %s', (locale) => {
  const html = render(<SpainPage />, locale);
  for (const key of [
    'es.title',
    'es.basics',
    'es.permits',
    'es.study',
    'es.trips',
    'es.route',
    'es.submit',
  ] as const)
    expect(html).toContain(t(key, locale));
});

test('home links to the Spain pilot', () => {
  expect(render(<Home />, 'zh-CN')).toContain('href="/spain"');
});

test('validation marks missing and out-of-order dates', () => {
  expect(
    validateEsForm({
      ...emptyEsForm('2026-11-21'),
      route: 'marriage',
      permits: [{ from: '2022-01-01', to: '2021-01-01', study: false }],
    }),
  ).toEqual({
    'es-date-of-birth': 'es.error.date',
    'es-married-on': 'es.error.date',
    'es-permit-0-to': 'es.error.order',
  });
  expect(validateEsForm(filled)).toEqual({});
});

test('the request carries study stays and the marriage date', () => {
  const request = esRequest(
    {
      ...filled,
      route: 'marriage',
      marriedOn: '2025-06-01',
      permits: [{ from: '2018-09-01', to: '2020-03-14', study: true }],
    },
    'en',
  );
  expect(request.permits).toEqual([
    { from: '2018-09-01', to: '2020-03-14', study: true },
  ]);
  expect(request.marriedToSpaniard).toBe('2025-06-01');
  expect(esRequest(filled, 'en')).not.toHaveProperty('marriedToSpaniard');
});

test.each(['zh-CN', 'en'] as const)('results render in %s', (locale) => {
  const result = evaluateSpain(esRequest(filled, locale));
  const html = render(<PilotResult result={result} />, locale);
  expect(html.match(/data-pathway=/g)).toHaveLength(2);
  expect(html).toContain('data-pathway="ES-LONG-TERM" data-status="MET"');
  expect(html).toContain('data-pathway="ES-NATIONALITY" data-status="FUTURE"');
  expect(html).toContain(`href="${sourceUrls['SRC-083']}"`);
  expect(html).toContain('PD-097');
});
