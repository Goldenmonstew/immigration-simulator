import { afterEach, expect, test, vi } from 'vitest';
import worker from '../src/index';

const post = (
  body: BodyInit,
  origin = 'https://uk-immigration-simulator.pages.dev',
) =>
  worker.fetch(
    new Request('https://example.test/', {
      method: 'POST',
      headers: { origin },
      body,
    }),
  );

afterEach(() => vi.restoreAllMocks());

test('accepts a report from the site and logs only known string fields', async () => {
  const log = vi.spyOn(console, 'log').mockImplementation(() => {});
  const response = await post(
    JSON.stringify({
      kind: 'error',
      message: 'boom',
      extra: 'dropped',
      page: 7,
    }),
  );
  expect(response.status).toBe(204);
  const logged = JSON.parse(log.mock.calls[0][0] as string);
  expect(logged).toMatchObject({
    event: 'client-error',
    kind: 'error',
    message: 'boom',
    page: '',
  });
  expect(logged).not.toHaveProperty('extra');
});

test('rejects other origins, wrong methods, oversize and malformed bodies', async () => {
  vi.spyOn(console, 'log').mockImplementation(() => {});
  expect((await post('{}', 'https://evil.example')).status).toBe(403);
  expect((await post('{}', 'https://other.pages.dev')).status).toBe(403);
  expect((await post('{}', 'https://evilwanruncong.uk')).status).toBe(403);
  const get = await worker.fetch(
    new Request('https://example.test/', {
      headers: { origin: 'https://wanruncong.uk' },
    }),
  );
  expect(get.status).toBe(405);
  expect((await post('x'.repeat(5000))).status).toBe(413);
  for (const body of [
    'null',
    '[1]',
    '"text"',
    'not json',
    '{"message":{"toString":null}}',
  ]) {
    const status = (await post(body)).status;
    expect([204, 400]).toContain(status);
    if (body !== '{"message":{"toString":null}}') expect(status).toBe(400);
  }
});
