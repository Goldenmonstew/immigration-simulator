import { renderToStaticMarkup } from 'react-dom/server';
import { expect, test } from 'vitest';
import { evaluateCanada } from '@uk-immigration/engine';
import CanadaPage from '../app/canada/page';
import { PilotResult } from '../app/pilot/pilot-result';
import Home from '../app/page';
import { t } from '../i18n';
import { LocaleContext } from '../i18n/locale';
import { caRequest, emptyCaForm, validateCaForm } from '../lib/canada';
import type { CaForm } from '../lib/canada';
import { sourceUrls } from '../lib/sources';

const render = (node: React.ReactNode, locale: 'zh-CN' | 'en') =>
  renderToStaticMarkup(
    <LocaleContext value={{ locale, setLocale: () => {} }}>
      {node}
    </LocaleContext>,
  );

const filled: CaForm = {
  ...emptyCaForm('2026-11-21'),
  dateOfBirth: '1990-05-01',
  permanentResident: '2022-03-01',
  periods: [{ from: '2019-09-01', to: '' }],
  trips: [{ departed: '2024-01-10', returned: '2024-02-10' }],
};

test.each(['zh-CN', 'en'] as const)('the form renders in %s', (locale) => {
  const html = render(<CanadaPage />, locale);
  for (const key of [
    'ca.title',
    'ca.basics',
    'ca.permanentResident',
    'ca.periods',
    'ca.trips',
    'ca.submit',
  ] as const)
    expect(html).toContain(t(key, locale));
});

test('home links to the Canada pilot', () => {
  expect(render(<Home />, 'zh-CN')).toContain('href="/canada"');
});

test('validation marks missing and out-of-order dates', () => {
  expect(
    validateCaForm({
      ...emptyCaForm('2026-11-21'),
      permanentResident: '2022-03-01',
      periods: [{ from: '2022-03-01', to: '' }],
      trips: [{ departed: '2024-02-10', returned: '2024-01-10' }],
    }),
  ).toEqual({
    'ca-date-of-birth': 'ca.error.date',
    'ca-period-0-from': 'ca.error.afterPr',
    'ca-trip-0-returned': 'ca.error.order',
  });
  expect(validateCaForm(filled)).toEqual({});
});

test('the request leaves out blank period ends', () => {
  expect(caRequest(filled, 'en').temporaryPeriods).toEqual([
    { from: '2019-09-01' },
  ]);
});

test.each(['zh-CN', 'en'] as const)('results render in %s', (locale) => {
  const result = evaluateCanada(caRequest(filled, locale));
  const html = render(<PilotResult result={result} />, locale);
  expect(html.match(/data-pathway=/g)).toHaveLength(2);
  expect(html).toContain('data-pathway="CA-RESIDENCY" data-status="MET"');
  expect(html).toContain('data-pathway="CA-CITIZENSHIP" data-status="MET"');
  expect(html).toContain(`href="${sourceUrls['SRC-074']}"`);
  expect(html).toContain('PD-090');
});
