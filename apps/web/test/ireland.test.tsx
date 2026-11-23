import { renderToStaticMarkup } from 'react-dom/server';
import { expect, test } from 'vitest';
import { evaluateIreland } from '@uk-immigration/engine';
import IrelandPage from '../app/ireland/page';
import { PilotResult } from '../app/pilot/pilot-result';
import Home from '../app/page';
import { t } from '../i18n';
import { LocaleContext } from '../i18n/locale';
import { emptyIeForm, ieRequest, validateIeForm } from '../lib/ireland';
import type { IeForm } from '../lib/ireland';
import { sourceUrls } from '../lib/sources';

const render = (node: React.ReactNode, locale: 'zh-CN' | 'en') =>
  renderToStaticMarkup(
    <LocaleContext value={{ locale, setLocale: () => {} }}>
      {node}
    </LocaleContext>,
  );

const filled: IeForm = {
  ...emptyIeForm('2026-11-22'),
  permissions: [{ kind: 'stamp1', from: '2021-03-01', to: '' }],
  stamp4Route: 'csep',
  employmentStart: '2025-03-15',
};

test.each(['zh-CN', 'en'] as const)('the form renders in %s', (locale) => {
  const html = render(<IrelandPage />, locale);
  for (const key of [
    'ie.title',
    'ie.basics',
    'ie.permits',
    'ie.kind',
    'ie.kind.student',
    'ie.kind.stamp1g-spouse',
    'ie.kind.ni-residence',
    'ie.trips',
    'ie.marriedOn',
    'ie.stamp4Route',
    'ie.submit',
  ] as const)
    expect(html).toContain(t(key, locale));
});

test('home links to the Ireland pilot', () => {
  expect(render(<Home />, 'zh-CN')).toContain('href="/ireland"');
});

test('validation marks missing, out-of-order and required dates', () => {
  expect(
    validateIeForm({
      ...emptyIeForm('2026-11-22'),
      permissions: [{ kind: 'stamp4', from: '2022-01-01', to: '2021-01-01' }],
      trips: [{ departed: '2024-02-10', returned: '' }],
      marriedOn: '2024-13-01',
    }),
  ).toEqual({
    'ie-permit-0-to': 'ie.error.order',
    'ie-trip-0-returned': 'ie.error.date',
    'ie-married-on': 'ie.error.date',
    // No Stamp 4 choice is made for the user.
    'ie-stamp4-route': 'ie.error.route',
  });
  expect(
    validateIeForm({ ...filled, employmentStart: '' })['ie-employment-start'],
  ).toBe('ie.error.date');
  expect(validateIeForm(filled)).toEqual({});
  // The start of work is only asked for the 21- and 57-month routes.
  expect(
    validateIeForm({ ...filled, stamp4Route: 'wcatt', employmentStart: '' }),
  ).toEqual({});
});

test('the request leaves out blank optional dates', () => {
  const req = ieRequest({ ...filled, stamp4Route: 'none' }, 'en');
  expect(req.permissions).toEqual([{ kind: 'stamp1', from: '2021-03-01' }]);
  expect(req).not.toHaveProperty('marriedOn');
  expect(req).not.toHaveProperty('employmentStart');
  expect(ieRequest(filled, 'en').employmentStart).toBe('2025-03-15');
});

test.each(['zh-CN', 'en'] as const)('results render in %s', (locale) => {
  const result = evaluateIreland(ieRequest(filled, locale));
  const html = render(<PilotResult result={result} />, locale);
  expect(html.match(/data-pathway=/g)).toHaveLength(3);
  expect(html).toContain('data-pathway="IE-NATURALISATION" data-status="MET"');
  expect(html).toContain('data-pathway="IE-STAMP4" data-status="FUTURE"');
  expect(html).toContain(`href="${sourceUrls['SRC-091']}"`);
  expect(html).toContain('PD-116');
});
