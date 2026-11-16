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
// log line (kept a few days by Workers Logs). No inputs, query strings or
// hashes are sent; local and test builds never report.
const errorEndpoint =
  'https://uk-immigration-error-report.error-report.workers.dev';
const sent = new Set<string>();

export function reportError(kind: string, message: string, source = '') {
  if (
    typeof window === 'undefined' ||
    !/(\.pages\.dev|wanruncong\.uk)$/.test(location.hostname) ||
    sent.size >= 5 ||
    sent.has(message)
  )
    return;
  sent.add(message);
  const body = JSON.stringify({
    kind,
    page: location.pathname,
    message: message.slice(0, 500),
    source: source.replace(/[?#].*$/, ''),
    version: buildVersion,
    ua: navigator.userAgent,
  });
  navigator.sendBeacon?.(
    errorEndpoint,
    new Blob([body], { type: 'text/plain' }),
  );
}
