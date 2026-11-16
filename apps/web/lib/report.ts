// Pre-filled GitHub issue links. Nothing is sent automatically: the reader
// reviews the issue form before submitting, and no user inputs are included.
const repo = 'https://github.com/Goldenmonstew/uk-immigration-simulator';

export const buildVersion = process.env.NEXT_PUBLIC_BUILD_SHA || 'dev';

export function issueUrl(title: string, lines: string[]): string {
  const params = new URLSearchParams({
    labels: 'feedback',
    title,
    body: [...lines, `version: ${buildVersion}`].join('\n'),
  });
  return `${repo}/issues/new?${params}`;
}

// Automatic error reports go to a small Cloudflare Worker that only writes a
// log line (kept a few days by Workers Logs). The error text itself is never
// sent, only its type, where it happened (bundle file:line:col, which with the
// version locates the bug) and React's public error code, so inputs cannot
// leave the browser. Local builds and automated browsers never report.
const errorEndpoint =
  'https://uk-immigration-error-report.error-report.workers.dev';
const reportingHost =
  /^((staging|[0-9a-f]{8})\.)?uk-immigration-simulator\.pages\.dev$|^wanruncong\.uk$/;
const sent = new Set<string>();

const knownTypes = new Set([
  'Error',
  'TypeError',
  'RangeError',
  'ReferenceError',
  'SyntaxError',
  'URIError',
  'EvalError',
  'AggregateError',
  'ChunkLoadError',
  'AbortError',
  'NotAllowedError',
  'SecurityError',
  'QuotaExceededError',
  'InvalidStateError',
]);

/** The parts of an error that are safe to send: a known type and React code. */
export function describe(error: unknown): string {
  if (!(error instanceof Error)) return typeof error;
  const name = knownTypes.has(error.name) ? error.name : 'Error';
  const code = /Minified React error #(\d+)/.exec(error.message)?.[1];
  return code ? `${name} react#${code}` : name;
}

/** Reduce a script URL with :line:col to its path and position only. */
export function codeLocation(source: string): string {
  const [, url = source, position = ''] =
    /^(.*?)((?::\d+){0,2})$/.exec(source) ?? [];
  const path = url.replace(/^[a-z]+:\/\/[^/]+/i, '').replace(/[?#].*$/, '');
  return `${path}${position}`;
}

export function reportError(kind: string, error: unknown, source = '') {
  if (
    typeof window === 'undefined' ||
    navigator.webdriver ||
    !reportingHost.test(location.hostname) ||
    sent.size >= 5
  )
    return;
  const message = describe(error);
  const where = codeLocation(source);
  const key = `${kind} ${message} ${where}`;
  if (sent.has(key)) return;
  sent.add(key);
  const body = JSON.stringify({
    kind,
    page: location.pathname,
    message,
    source: where,
    version: buildVersion,
    ua: navigator.userAgent,
  });
  navigator.sendBeacon?.(
    errorEndpoint,
    new Blob([body], { type: 'text/plain' }),
  );
}
