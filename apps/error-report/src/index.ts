const allowedOrigin =
  /^https:\/\/(((staging|[0-9a-f]{8})\.)?uk-immigration-simulator\.pages\.dev|wanruncong\.uk)$/;
const fields = ['kind', 'page', 'message', 'source', 'version', 'ua'] as const;
const maxBytes = 4096;

// Reads at most maxBytes; returns undefined when the body is larger.
async function readLimited(request: Request): Promise<string | undefined> {
  if (Number(request.headers.get('content-length') ?? 0) > maxBytes)
    return undefined;
  const reader = request.body?.getReader();
  if (!reader) return '';
  const chunks: Uint8Array[] = [];
  let size = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > maxBytes) {
      await reader.cancel();
      return undefined;
    }
    chunks.push(value);
  }
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return new TextDecoder().decode(bytes);
}

export default {
  async fetch(request: Request): Promise<Response> {
    const origin = request.headers.get('origin') ?? '';
    if (!allowedOrigin.test(origin)) return new Response(null, { status: 403 });
    const headers = { 'access-control-allow-origin': origin };
    if (request.method !== 'POST')
      return new Response(null, { status: 405, headers });
    let body: unknown;
    try {
      const text = await readLimited(request);
      if (text === undefined)
        return new Response(null, { status: 413, headers });
      body = JSON.parse(text);
    } catch {
      return new Response(null, { status: 400, headers });
    }
    if (typeof body !== 'object' || body === null || Array.isArray(body))
      return new Response(null, { status: 400, headers });
    const record = body as Record<string, unknown>;
    const report = Object.fromEntries(
      fields.map((field) => {
        const value = record[field];
        return [field, typeof value === 'string' ? value.slice(0, 1000) : ''];
      }),
    );
    console.log(JSON.stringify({ event: 'client-error', origin, ...report }));
    return new Response(null, { status: 204, headers });
  },
};
