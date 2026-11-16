import { afterEach, expect, test, vi } from 'vitest';

afterEach(() => {
  vi.unstubAllGlobals();
  vi.resetModules();
});

async function load(hostname: string, webdriver = false) {
  const beacon = vi.fn(() => true);
  vi.stubGlobal('window', {});
  vi.stubGlobal('location', { hostname, pathname: '/result' });
  vi.stubGlobal('navigator', {
    webdriver,
    userAgent: 'test',
    sendBeacon: beacon,
  });
  const report = await import('../lib/report');
  return { ...report, beacon };
}

test('scrub removes URL queries, hashes and digits', async () => {
  const { scrub } = await load('localhost');
  expect(
    scrub(
      'failed https://x.dev/result?salary=55123#s=share-secret on 2026-11-16',
    ),
  ).toBe('failed https://x.dev/result on #-#-#');
  expect(scrub('bad ?a=1 and #frag')).toBe('bad  and ');
});

test('reports on the site only, scrubbed, deduplicated and capped at five', async () => {
  const { reportError, beacon } = await load(
    'uk-immigration-simulator.pages.dev',
  );
  reportError('error', 'salary 55123 is invalid');
  reportError('error', 'salary 41000 is invalid');
  for (let i = 0; i < 10; i++)
    reportError('error', `other ${String.fromCharCode(97 + i)}`);
  expect(beacon).toHaveBeenCalledTimes(5);
  const first = (beacon.mock.calls[0] as unknown as [string, Blob])[1];
  const body = JSON.parse(await first.text());
  expect(body).toMatchObject({
    page: '/result',
    message: 'salary # is invalid',
  });
});

test('never reports locally, from other hosts, or from automated browsers', async () => {
  for (const [host, webdriver] of [
    ['localhost', false],
    ['evil.pages.dev', false],
    ['evilwanruncong.uk', false],
    ['staging.uk-immigration-simulator.pages.dev', true],
  ] as const) {
    const { reportError, beacon } = await load(host, webdriver);
    reportError('error', 'boom');
    expect(beacon).not.toHaveBeenCalled();
    vi.resetModules();
  }
});
