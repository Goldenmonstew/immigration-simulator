import { renderToStaticMarkup } from 'react-dom/server';
import { expect, test } from 'vitest';
import { evaluatePortugal } from '@uk-immigration/engine';
import Home from '../app/page';
import { PilotResult } from '../app/pilot/pilot-result';
import PortugalPage from '../app/portugal/page';
import { t } from '../i18n';
import { LocaleContext } from '../i18n/locale';
import { emptyPtForm, ptRequest, validatePtForm } from '../lib/portugal';
import type { PtForm } from '../lib/portugal';
import { sourceUrls } from '../lib/sources';

const render = (node: React.ReactNode, locale: 'zh-CN' | 'en') =>
  renderToStaticMarkup(
    <LocaleContext value={{ locale, setLocale: () => {} }}>
      {node}
    </LocaleContext>,
  );

const filled: PtForm = {
  ...emptyPtForm('2025-06-01'),
  // The current card, then its renewal.
  permits: [
    { kind: 'golden-visa', from: '2024-01-10', to: '2026-01-09' },
    { kind: 'golden-visa', from: '2026-01-10', to: '' },
  ],
  route: 'other',
};

test.each(['zh-CN', 'en'] as const)('the form renders in %s', (locale) => {
  const html = render(<PortugalPage />, locale);
  for (const key of [
    'pt.title',
    'pt.basics',
    'pt.permits',
    'pt.kind',
    'pt.kind.golden-visa',
    'pt.kind.eu-long-term',
    'pt.trips',
    'pt.route',
    'pt.pending',
    'pt.submit',
  ] as const)
    expect(html).toContain(t(key, locale));
});

test('home links to the Portugal pilot', () => {
  expect(render(<Home />, 'zh-CN')).toContain('href="/portugal"');
});

test('validation marks missing and out-of-order dates', () => {
  expect(
    validatePtForm({
      ...emptyPtForm('2026-11-22'),
      permits: [{ kind: 'temporary', from: '2022-01-01', to: '2021-01-01' }],
      trips: [{ departed: '2024-02-10', returned: '' }],
      pending: true,
    }),
  ).toEqual({
    'pt-permit-0-to': 'pt.error.order',
    'pt-trip-0-returned': 'pt.error.date',
    // No nationality group is picked for the user.
    'pt-route': 'pt.error.route',
    // The residence application date may be left blank.
    'pt-applied-on': 'pt.error.date',
  });
  expect(validatePtForm(filled)).toEqual({});
});

test('a pending application must predate the new law and the simulation', () => {
  // review71-1: the box says the application was pending on 2026-05-19.
  const pending = (appliedOn: string, simulationDate = '2026-11-23') =>
    validatePtForm({
      ...filled,
      simulationDate,
      pending: true,
      appliedOn,
    })['pt-applied-on'];
  expect(pending('2026-12-01')).toBe('pt.error.pendingDate');
  expect(pending('2026-05-20')).toBe('pt.error.pendingDate');
  // The day itself stays open (PD-143).
  expect(pending('2026-05-19')).toBeUndefined();
  expect(pending('2025-03-01', '2025-01-01')).toBe('pt.error.afterSimulation');
});

test('EU citizens are a separate group outside the foreigners law', () => {
  const result = evaluatePortugal(
    ptRequest({ ...filled, route: 'eu', permits: [] }, 'zh-CN'),
  );
  const html = render(<PilotResult result={result} />, 'zh-CN');
  expect(html).toContain(
    'data-pathway="PT-EU-LONG-TERM" data-status="NOT_APPLICABLE"',
  );
  expect(render(<PortugalPage />, 'zh-CN')).toContain(t('pt.route.eu'));
  // review71-2: EEA and Swiss citizens, 10 years for naturalisation.
  const eea = evaluatePortugal(
    ptRequest({ ...filled, route: 'eea', permits: [] }, 'en'),
  );
  expect(render(<PilotResult result={eea} />, 'en')).toContain(
    'data-pathway="PT-PERMANENT" data-status="NOT_APPLICABLE"',
  );
  expect(render(<PortugalPage />, 'en')).toContain(t('pt.route.eea', 'en'));
});

test('the request leaves out blank and hidden dates', () => {
  const request = ptRequest(
    {
      ...filled,
      permits: [{ kind: 'temporary', from: '2020-01-01', to: '' }],
      appliedOn: '2024-03-01',
    },
    'en',
  );
  expect(request.permits).toEqual([{ kind: 'temporary', from: '2020-01-01' }]);
  expect(request.pendingApplication).toBeUndefined();
  const pending = ptRequest(
    { ...filled, pending: true, appliedOn: '2024-03-01' },
    'en',
  );
  expect(pending.pendingApplication).toBe('2024-03-01');
  expect(pending).not.toHaveProperty('residenceApplied');
});

test.each(['zh-CN', 'en'] as const)('results render in %s', (locale) => {
  const result = evaluatePortugal(ptRequest(filled, locale));
  const html = render(<PilotResult result={result} />, locale);
  expect(html.match(/data-pathway=/g)).toHaveLength(4);
  // Renewal opens 90 days before the 2026-01-09 expiry.
  expect(html).toContain('data-pathway="PT-GOLDEN-VISA" data-status="FUTURE"');
  expect(html).toContain('2025-10-11');
  expect(html).toContain(
    'data-pathway="PT-NATURALISATION" data-status="FUTURE"',
  );
  expect(html).toContain(`href="${sourceUrls['SRC-124']}"`);
  expect(html).toContain('PD-148');
});
