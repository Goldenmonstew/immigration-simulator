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
