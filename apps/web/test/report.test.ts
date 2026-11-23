import { afterEach, expect, test, vi } from 'vitest';

afterEach(() => {
  vi.unstubAllGlobals();
  vi.resetModules();
});

async function load(hostname: string, webdriver = false) {
  const beacon = vi.fn(() => true);
  vi.stubGlobal('window', {});
  vi.stubGlobal('location', { hostname, pathname: '/uk/result' });
  vi.stubGlobal('navigator', {
    webdriver,
    userAgent: 'test',
    sendBeacon: beacon,
  });
  const report = await import('../lib/report');
  return { ...report, beacon };
}

const sentBodies = async (beacon: ReturnType<typeof vi.fn>) =>
  Promise.all(
    beacon.mock.calls.map(async (call) =>
      JSON.parse(await (call[1] as Blob).text()),
    ),
  );

test('only the error type and React code are described, never its text', async () => {
  const { describe, codeLocation } = await load('localhost');
  expect(
    describe(new TypeError('Alice Smith, alice@example.com, salary 55123')),
  ).toBe('TypeError');
  expect(
    describe(
      new Error(
        'Minified React error #418; visit https://react.dev/errors/418?x=1',
      ),
    ),
  ).toBe('Error react#418');
  expect(describe('free text from a rejection')).toBe('string');
  const custom = new Error('x');
  custom.name = 'Alice Smith';
  expect(describe(custom)).toBe('Error');
  expect(
    codeLocation('https://x.dev/a.js#s=Alice:alice@example.com:12:34'),
  ).toBe('/a.js:12:34');
  expect(describe(undefined)).toBe('undefined');
  expect(
    codeLocation(
      'https://uk-immigration-simulator.pages.dev/_next/static/chunks/a.js?v=1#s=secret:12:34',
    ),
  ).toBe('/_next/static/chunks/a.js:12:34');
});

test('reports on the site only, without error text, deduplicated and capped at five', async () => {
  const { reportError, beacon } = await load(
    'uk-immigration-simulator.pages.dev',
  );
  reportError(
    'error',
    new Error('Minified React error #418'),
    'https://x/a.js:1:1',
  );
  reportError(
    'error',
    new Error('Minified React error #423'),
    'https://x/a.js:1:1',
  );
  reportError(
    'error',
    new Error('Minified React error #423'),
    'https://x/a.js:1:1',
  );
  for (let i = 0; i < 10; i++)
    reportError('error', new TypeError('secret'), `https://x/b.js:${i}:1`);
  expect(beacon).toHaveBeenCalledTimes(5);
  const bodies = await sentBodies(beacon);
  expect(bodies.map((body) => body.message)).toEqual([
    'Error react#418',
    'Error react#423',
    'TypeError',
    'TypeError',
    'TypeError',
  ]);
  expect(JSON.stringify(bodies)).not.toContain('secret');
});

test('never reports locally, from other hosts, or from automated browsers', async () => {
  for (const [host, webdriver] of [
    ['localhost', false],
    ['evil.pages.dev', false],
    ['evilwanruncong.uk', false],
    ['staging.uk-immigration-simulator.pages.dev', true],
  ] as const) {
    const { reportError, beacon } = await load(host, webdriver);
    reportError('error', new Error('boom'));
    expect(beacon).not.toHaveBeenCalled();
    vi.resetModules();
  }
});
