import { renderToStaticMarkup } from 'react-dom/server';
import { expect, test } from 'vitest';
import { evaluateUnitedStates } from '@uk-immigration/engine';
import UnitedStatesPage from '../app/united-states/page';
import { PilotResult } from '../app/pilot/pilot-result';
import Home from '../app/page';
import { t } from '../i18n';
import { LocaleContext } from '../i18n/locale';
import { emptyUsForm, usRequest, validateUsForm } from '../lib/united-states';
import type { UsForm } from '../lib/united-states';
import { sourceUrls } from '../lib/sources';

const render = (node: React.ReactNode, locale: 'zh-CN' | 'en') =>
  renderToStaticMarkup(
    <LocaleContext value={{ locale, setLocale: () => {} }}>
      {node}
    </LocaleContext>,
  );

const filled: UsForm = {
  ...emptyUsForm('2026-11-21'),
  dateOfBirth: '1990-05-01',
  permanentResident: '2021-03-01',
  stateResidenceFrom: '2020-01-01',
  trips: [{ departed: '2024-01-10', returned: '2024-02-10' }],
};

test.each(['zh-CN', 'en'] as const)('the form renders in %s', (locale) => {
  const html = render(<UnitedStatesPage />, locale);
  for (const key of [
    'us.title',
    'us.basics',
    'us.permanentResident',
    'us.conditional',
    'us.married',
    'us.trips',
    'us.submit',
  ] as const)
    expect(html).toContain(t(key, locale));
});

test('home links to the United States pilot', () => {
  expect(render(<Home />, 'zh-CN')).toContain('href="/united-states"');
});

test('validation marks missing and out-of-order dates', () => {
  expect(
    validateUsForm({
      ...emptyUsForm('2026-11-21'),
      permanentResident: '2022-03-01',
      married: true,
      trips: [
        { departed: '2024-02-10', returned: '2024-01-10' },
        { departed: '2021-02-10', returned: '2021-03-10' },
      ],
    }),
  ).toEqual({
    'us-date-of-birth': 'us.error.date',
    'us-married-on': 'us.error.date',
    'us-trip-0-returned': 'us.error.order',
    'us-trip-1-departed': 'us.error.beforeGreenCard',
  });
  expect(validateUsForm(filled)).toEqual({});
});

test('the request leaves out an unticked marriage and blank dates', () => {
  const request = usRequest(filled, 'en');
  expect(request).not.toHaveProperty('marriage');
  expect(
    usRequest({ ...filled, stateResidenceFrom: '' }, 'en'),
  ).not.toHaveProperty('stateResidenceFrom');
  expect(
    usRequest({ ...filled, married: true, marriedOn: '2022-01-01' }, 'en')
      .marriage,
  ).toEqual({ married: '2022-01-01' });
});

test('filing with a principal applicant needs their date', () => {
  const joint = { ...filled, conditional: 'investor' as const, joint: true };
  expect(validateUsForm(joint)).toEqual({
    'us-principal-since': 'us.error.date',
  });
  expect(
    validateUsForm({ ...joint, principalSince: '2099-01-01' })[
      'us-principal-since'
    ],
  ).toBe('us.error.principalOrder');
  expect(
    usRequest({ ...joint, principalSince: '2018-01-01' }, 'en')
      .principalConditional,
  ).toBe('2018-01-01');
  // Ignored once the green card is not conditional.
  expect(
    usRequest(
      { ...joint, conditional: 'none', principalSince: '2018-01-01' },
      'en',
    ),
  ).not.toHaveProperty('principalConditional');
});

test.each(['zh-CN', 'en'] as const)('results render in %s', (locale) => {
  const result = evaluateUnitedStates(usRequest(filled, locale));
  const html = render(<PilotResult result={result} />, locale);
  expect(html.match(/data-pathway=/g)).toHaveLength(4);
  expect(html).toContain('data-pathway="US-NATURALIZATION" data-status="MET"');
  expect(html).toContain(
    'data-pathway="US-SPOUSE" data-status="NOT_APPLICABLE"',
  );
  expect(html).toContain(`href="${sourceUrls['SRC-081']}"`);
  expect(html).toContain('PD-092');
});
