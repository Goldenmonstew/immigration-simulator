const allowedOrigin =
  /^https:\/\/(([a-z0-9-]+\.)?uk-immigration-simulator\.pages\.dev|wanruncong\.uk)$/;
const fields = ['kind', 'page', 'message', 'source', 'version', 'ua'] as const;

export default {
  async fetch(request: Request): Promise<Response> {
    const origin = request.headers.get('origin') ?? '';
    if (!allowedOrigin.test(origin)) return new Response(null, { status: 403 });
    const headers = { 'access-control-allow-origin': origin };
    if (request.method !== 'POST')
      return new Response(null, { status: 405, headers });
    const text = await request.text();
    if (text.length > 4000) return new Response(null, { status: 413, headers });
    let body: Record<string, unknown>;
    try {
      body = JSON.parse(text);
    } catch {
      return new Response(null, { status: 400, headers });
    }
    const report = Object.fromEntries(
      fields.map((field) => [field, String(body[field] ?? '').slice(0, 1000)]),
    );
    console.log(JSON.stringify({ event: 'client-error', origin, ...report }));
    return new Response(null, { status: 204, headers });
  },
};
