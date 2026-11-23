import { renderToStaticMarkup } from 'react-dom/server';
import { expect, test } from 'vitest';
import { evaluateJapan } from '@uk-immigration/engine';
import JapanPage from '../app/japan/page';
import { PilotResult } from '../app/pilot/pilot-result';
import Home from '../app/page';
import { t } from '../i18n';
import { LocaleContext } from '../i18n/locale';
import {
  emptyJpForm,
  emptyJpTrip,
  jpRequest,
  validateJpForm,
} from '../lib/japan';
import type { JpForm } from '../lib/japan';
import { sourceUrls } from '../lib/sources';

const render = (node: React.ReactNode, locale: 'zh-CN' | 'en') =>
  renderToStaticMarkup(
    <LocaleContext value={{ locale, setLocale: () => {} }}>
      {node}
    </LocaleContext>,
  );

const filled: JpForm = {
  ...emptyJpForm('2026-11-22'),
  stayStart: '2025-10-01',
  prRoute: 'spouse',
  marriedLifeFrom: '2023-12-01',
  natRoute: 'general',
  dateOfBirth: '1990-05-05',
};
const trip = (departed: string, returned: string) => ({
  ...emptyJpTrip(),
  departed,
  returned,
});

test.each(['zh-CN', 'en'] as const)('the form renders in %s', (locale) => {
  const html = render(<JapanPage />, locale);
  for (const key of [
    'jp.title',
    'jp.basics',
    'jp.stayStart',
    'jp.prRoute',
    'jp.natRoute',
    'jp.trips',
    'jp.submit',
  ] as const)
    expect(html).toContain(t(key, locale));
});

test('home links to the Japan pilot', () => {
  expect(render(<Home />, 'zh-CN')).toContain('href="/japan"');
});

test('validation asks for the routes and the dates they need', () => {
  expect(
    validateJpForm({
      ...emptyJpForm('2026-11-22'),
      stayStart: '2016-06-01',
      trips: [trip('2024-02-10', '2024-02-01')],
    }),
  ).toEqual({
    // No route is picked for the user.
    'jp-pr-route': 'jp.error.prRoute',
    'jp-nat-route': 'jp.error.natRoute',
    'jp-trip-0-returned': 'jp.error.order',
  });
  // Each spouse route has its own date.
  expect(
    validateJpForm({
      ...filled,
      marriedLifeFrom: '',
      natRoute: 'spouse',
    }),
  ).toEqual({
    'jp-married-life-from': 'jp.error.date',
    'jp-married-on': 'jp.error.date',
  });
  expect(
    validateJpForm({
      ...filled,
      prRoute: 'general',
      excluded: [{ from: '2021-04-01', to: '2020-10-01' }],
    }),
  ).toEqual({
    'jp-status-start': 'jp.error.date',
    'jp-new-status': 'jp.error.newStatus',
    'jp-excluded-0-to': 'jp.error.order',
  });
  expect(validateJpForm(filled)).toEqual({});
});

test('validation catches overlapping trips and an early period of stay', () => {
  expect(
    validateJpForm({
      ...filled,
      trips: [
        trip('2024-01-01', '2024-02-01'),
        { ...trip('2024-01-20', '2024-03-01'), stayExpiry: '2024-01-10' },
        // Leaving on the day of return is not an overlap.
        trip('2024-03-01', '2024-03-05'),
        // A pending renewal needs the expiry it extends.
        { ...trip('2024-04-01', '2024-04-05'), renewalPending: true },
      ],
    }),
  ).toEqual({
    'jp-trip-1-departed': 'jp.error.overlap',
    'jp-trip-1-stayExpiry': 'jp.error.order',
    'jp-trip-3-stayExpiry': 'jp.error.date',
  });
});

test('the request carries each route with its own date', () => {
  const req = jpRequest(
    {
      ...filled,
      prRoute: 'hsp80',
      statusStart: '2025-11-22',
      natRoute: 'spouse',
      marriedOn: '2023-10-01',
      trips: [
        {
          ...trip('2026-01-01', '2026-01-10'),
          reentryPermit: true,
          stayExpiry: '2026-06-30',
          renewalPending: true,
        },
        trip('2026-03-01', '2026-03-05'),
      ],
    },
    'en',
  );
  expect(req.pr).toEqual({ route: 'hsp80', statusStart: '2025-11-22' });
  expect(req.naturalisation).toEqual({
    route: 'spouse',
    marriedOn: '2023-10-01',
  });
  expect(req.trips).toEqual([
    {
      departed: '2026-01-01',
      returned: '2026-01-10',
      stayExpiry: '2026-06-30',
      reentryPermit: true,
      renewalPending: true,
    },
    { departed: '2026-03-01', returned: '2026-03-05' },
  ]);
  expect(
    jpRequest(
      {
        ...filled,
        prRoute: 'general',
        statusStart: '2021-04-01',
        newStatus: 'own',
        newStatusStart: '2024-04-01',
        excluded: [{ from: '2020-10-01', to: '2021-03-31' }],
      },
      'en',
    ).pr,
  ).toEqual({
    route: 'general',
    statusStart: '2021-04-01',
    newStatusStart: '2024-04-01',
    excluded: [{ from: '2020-10-01', to: '2021-03-31' }],
  });
  expect(jpRequest(filled, 'en').pr).toEqual({
    route: 'spouse',
    marriedLifeFrom: '2023-12-01',
  });
});

test('the new-guideline start: same, own date or not yet held', () => {
  const general: JpForm = {
    ...filled,
    prRoute: 'general',
    statusStart: '2017-04-05',
    newStatusStart: '2024-04-01',
  };
  const pr = (newStatus: JpForm['newStatus']) =>
    jpRequest({ ...general, newStatus }, 'en').pr;
  // A date typed in before switching back to "same" is not sent.
  expect(pr('same')).toEqual({ route: 'general', statusStart: '2017-04-05' });
  expect(pr('own')).toEqual({
    route: 'general',
    statusStart: '2017-04-05',
    newStatusStart: '2024-04-01',
  });
  expect(pr('none')).toEqual({
    route: 'general',
    statusStart: '2017-04-05',
    newStatusStart: 'none',
  });
  expect(
    validateJpForm({ ...general, newStatus: 'own', newStatusStart: '' }),
  ).toEqual({ 'jp-new-status-start': 'jp.error.date' });
  expect(
    validateJpForm({ ...general, newStatus: 'none', newStatusStart: '' }),
  ).toEqual({});
  // Still holding Intra-company Transferee on 2027-05-10.
  const result = evaluateJapan(
    jpRequest(
      {
        ...general,
        simulationDate: '2027-05-10',
        stayStart: '2017-04-05',
        newStatus: 'none',
      },
      'zh-CN',
    ),
  );
  expect(result.pathways[0].status).toBe('NOT_MET');
});

test('the new-guideline start must be chosen', () => {
  // Intra-company Transferee since 2021-04-05; the choice left untouched.
  const ict: JpForm = {
    ...filled,
    simulationDate: '2026-11-23',
    stayStart: '2017-04-05',
    prRoute: 'general',
    statusStart: '2017-04-05',
  };
  expect(validateJpForm(ict)).toEqual({
    'jp-new-status': 'jp.error.newStatus',
  });
  const chosen = { ...ict, newStatus: 'none' as const };
  expect(validateJpForm(chosen)).toEqual({});
  // 10 years on 2027-04-05 fall under the new guideline, never met.
  expect(evaluateJapan(jpRequest(chosen, 'zh-CN')).pathways[0].status).toBe(
    'NOT_MET',
  );
});

test('no status the old guideline counts yet', () => {
  // Only Specified Skilled Worker (i): no old-guideline start to enter.
  const ssw: JpForm = {
    ...filled,
    simulationDate: '2026-11-23',
    stayStart: '2016-01-01',
    prRoute: 'general',
    statusNone: true,
    newStatus: 'same',
  };
  expect(validateJpForm(ssw)).toEqual({});
  const req = jpRequest(ssw, 'zh-CN');
  expect(req.pr).toEqual({ route: 'general', statusStart: 'none' });
  expect(evaluateJapan(req).pathways[0].status).toBe('NOT_MET');
});

test('a child born in Japan applies within 30 days of birth', () => {
  const born = (simulationDate: string): JpForm => ({
    ...filled,
    simulationDate,
    stayStart: '2026-11-10',
    prRoute: 'child-birth',
    bornOn: '2026-11-10',
  });
  expect(validateJpForm({ ...born('2026-11-23'), bornOn: '' })).toEqual({
    'jp-born-on': 'jp.error.date',
  });
  expect(jpRequest(born('2026-11-23'), 'en').pr).toEqual({
    route: 'child-birth',
    bornOn: '2026-11-10',
  });
  const status = (simulationDate: string) =>
    evaluateJapan(jpRequest(born(simulationDate), 'zh-CN')).pathways[0].status;
  // In the window, on its last day (2026-12-10), and after it.
  expect(status('2026-11-23')).toBe('MET');
  expect(status('2026-12-10')).toBe('MET');
  expect(status('2026-12-11')).toBe('NOT_MET');
  const html = render(
    <PilotResult
      result={evaluateJapan(jpRequest(born('2026-11-23'), 'zh-CN'))}
    />,
    'zh-CN',
  );
  // The official page with the filing period.
  expect(html).toContain('16-4.html#midashi04');
});

test('leaving with a renewal pending (FAQ Q61)', () => {
  // Period of stay to 2027-04-20, renewal applied for on 2027-04-10.
  const form = (departed: string, returned: string, pending: boolean) => ({
    ...filled,
    simulationDate: '2027-05-10',
    stayStart: '2016-04-01',
    prRoute: 'general' as const,
    statusStart: '2018-04-01',
    newStatus: 'same' as const,
    trips: [
      {
        ...trip(departed, returned),
        stayExpiry: '2027-04-20',
        renewalPending: pending,
      },
    ],
  });
  // Before the original expiry.
  expect(validateJpForm(form('2027-04-15', '2027-04-30', true))).toEqual({});
  // After it, within the 2 months the status lasts.
  const special = form('2027-05-01', '2027-05-08', true);
  expect(validateJpForm(special)).toEqual({});
  expect(evaluateJapan(jpRequest(special, 'zh-CN')).pathways[0].status).toBe(
    'MET',
  );
  // Without a pending renewal the status had ended before leaving.
  expect(validateJpForm(form('2027-05-01', '2027-05-08', false))).toEqual({
    'jp-trip-0-stayExpiry': 'jp.error.order',
  });
  // Past the special period too.
  expect(validateJpForm(form('2027-06-21', '2027-06-25', true))).toEqual({
    'jp-trip-0-stayExpiry': 'jp.error.specialPeriod',
  });
});

test.each(['zh-CN', 'en'] as const)('results render in %s', (locale) => {
  const result = evaluateJapan(jpRequest(filled, locale));
  const html = render(<PilotResult result={result} />, locale);
  expect(html.match(/data-pathway=/g)).toHaveLength(2);
  // 3 years married and 1 year of stay before the 2027-04-01 switch.
  expect(html).toContain('data-pathway="JP-PR" data-status="FUTURE"');
  expect(html).toContain('2026-12-01');
  expect(html).toContain(`href="${sourceUrls['SRC-113']}"`);
  expect(html).toContain('PD-136');
});
