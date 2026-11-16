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
// log line (kept a few days by Workers Logs). Messages are scrubbed of URL
// queries/hashes and digits so inputs such as salaries or dates never leave the
// browser; local builds and automated browsers never report.
const errorEndpoint =
  'https://uk-immigration-error-report.error-report.workers.dev';
const reportingHost =
  /^((staging|[0-9a-f]{8})\.)?uk-immigration-simulator\.pages\.dev$|^wanruncong\.uk$/;
const sent = new Set<string>();

export function scrub(text: string, limit = 200): string {
  return text
    .replace(/([a-z]+:\/\/[^\s?#]*)[?#]\S*/gi, '$1')
    .replace(/[?#][^\s]*/g, '')
    .replace(/\d+/g, '#')
    .slice(0, limit);
}

export function reportError(kind: string, message: string, source = '') {
  if (
    typeof window === 'undefined' ||
    navigator.webdriver ||
    !reportingHost.test(location.hostname) ||
    sent.size >= 5
  )
    return;
  const clean = scrub(message);
  if (sent.has(clean)) return;
  sent.add(clean);
  const body = JSON.stringify({
    kind,
    page: location.pathname,
    message: clean,
    source: scrub(source),
    version: buildVersion,
    ua: navigator.userAgent,
  });
  navigator.sendBeacon?.(
    errorEndpoint,
    new Blob([body], { type: 'text/plain' }),
  );
}
