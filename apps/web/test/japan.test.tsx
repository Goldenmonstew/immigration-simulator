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
      ],
    }),
  ).toEqual({
    'jp-trip-1-departed': 'jp.error.overlap',
    'jp-trip-1-stayExpiry': 'jp.error.order',
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
    },
    { departed: '2026-03-01', returned: '2026-03-05' },
  ]);
  expect(
    jpRequest(
      {
        ...filled,
        prRoute: 'general',
        statusStart: '2021-04-01',
        excluded: [{ from: '2020-10-01', to: '2021-03-31' }],
      },
      'en',
    ).pr,
  ).toEqual({
    route: 'general',
    statusStart: '2021-04-01',
    excluded: [{ from: '2020-10-01', to: '2021-03-31' }],
  });
  expect(jpRequest(filled, 'en').pr).toEqual({
    route: 'spouse',
    marriedLifeFrom: '2023-12-01',
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
