import { renderToStaticMarkup } from 'react-dom/server';
import { expect, test } from 'vitest';
import { evaluateGreece } from '@uk-immigration/engine';
import GreecePage from '../app/greece/page';
import { PilotResult } from '../app/pilot/pilot-result';
import Home from '../app/page';
import { t } from '../i18n';
import { LocaleContext } from '../i18n/locale';
import { emptyGrForm, grRequest, validateGrForm } from '../lib/greece';
import type { GrForm } from '../lib/greece';
import { sourceUrls } from '../lib/sources';

const render = (node: React.ReactNode, locale: 'zh-CN' | 'en') =>
  renderToStaticMarkup(
    <LocaleContext value={{ locale, setLocale: () => {} }}>
      {node}
    </LocaleContext>,
  );

const filled: GrForm = {
  ...emptyGrForm('2026-11-21'),
  permits: [{ kind: 'investor', from: '2020-06-01', to: '2027-05-31' }],
};

test.each(['zh-CN', 'en'] as const)('the form renders in %s', (locale) => {
  const html = render(<GreecePage />, locale);
  for (const key of [
    'gr.title',
    'gr.basics',
    'gr.permits',
    'gr.kind',
    'gr.trips',
    'gr.route',
    'gr.submit',
  ] as const)
    expect(html).toContain(t(key, locale));
});

test('home links to the Greece pilot', () => {
  expect(render(<Home />, 'zh-CN')).toContain('href="/greece"');
});

test('validation marks missing and out-of-order dates', () => {
  expect(
    validateGrForm({
      ...emptyGrForm('2026-11-21'),
      permits: [{ kind: 'regular', from: '2022-01-01', to: '2021-01-01' }],
      trips: [{ departed: '2024-02-10', returned: '' }],
    }),
  ).toEqual({
    'gr-permit-0-to': 'gr.error.order',
    'gr-trip-0-returned': 'gr.error.date',
  });
  expect(validateGrForm(filled)).toEqual({});
});

test('the request leaves out blank end dates', () => {
  expect(
    grRequest(
      { ...filled, permits: [{ kind: 'regular', from: '2020-01-01', to: '' }] },
      'en',
    ).permits,
  ).toEqual([{ kind: 'regular', from: '2020-01-01' }]);
});

test.each(['zh-CN', 'en'] as const)('results render in %s', (locale) => {
  const result = evaluateGreece(grRequest(filled, locale));
  const html = render(<PilotResult result={result} />, locale);
  expect(html.match(/data-pathway=/g)).toHaveLength(3);
  expect(html).toContain('data-pathway="GR-GOLDEN-VISA" data-status="FUTURE"');
  expect(html).toContain('data-pathway="GR-LONG-TERM" data-status="UNKNOWN"');
  expect(html).toContain(`href="${sourceUrls['SRC-087']}"`);
  expect(html).toContain('PD-104');
});
