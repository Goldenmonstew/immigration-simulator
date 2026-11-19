/* global AbortSignal, fetch */

import { Buffer } from 'node:buffer';
import console from 'node:console';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import process from 'node:process';
import { URL } from 'node:url';

const register = readFileSync(
  new URL('../../../docs/SOURCES.md', import.meta.url),
  'utf8',
);
const primarySources = register.split('## 一级来源')[1].split('\n## ')[0];
const noteSections = register.split(/^#{2,3} /m);
const counts = { unchanged: 0, changed: 0, failed: 0, dynamic: 0 };
const namedEntities = new Map(
  Object.entries({
    amp: '&',
    AMP: '&',
    apos: "'",
    gt: '>',
    GT: '>',
    lt: '<',
    LT: '<',
    quot: '"',
    QUOT: '"',
    nbsp: '\u00a0',
    ensp: '\u2002',
    emsp: '\u2003',
    thinsp: '\u2009',
    ndash: '–',
    mdash: '—',
    lsquo: '‘',
    rsquo: '’',
    ldquo: '“',
    rdquo: '”',
    hellip: '…',
    bull: '•',
    middot: '·',
    pound: '£',
    euro: '€',
    copy: '©',
    reg: '®',
    trade: '™',
  }),
);

// GitHub-hosted runners timed out on the larger PDFs at 30 s: allow 120 s
// and retry once.
async function fetchWithRetry(url) {
  for (let attempt = 0; ; attempt++) {
    try {
      return await fetch(url, { signal: AbortSignal.timeout(120000) });
    } catch (error) {
      if (attempt > 0) throw error;
    }
  }
}

function sha256(value) {
  return createHash('sha256').update(value).digest('hex');
}

function normalizedBody(html) {
  const cleaned = html
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(
      /<(script|style|noscript|template)\b[^>]*>[\s\S]*?<\/\1\s*>/gi,
      '',
    );
  const body =
    cleaned.match(/<main\b[^>]*>([\s\S]*?)<\/main\s*>/i) ??
    cleaned.match(/<body\b[^>]*>([\s\S]*?)<\/body\s*>/i);
  if (!body) throw new Error('HTML has no main or body element');
  return (
    body[1]
      // Keep spaces at block boundaries without splitting words across inline tags.
      .replace(
        /<\/?([a-z][a-z\d:-]*)\b(?:[^"'<>]|"[^"]*"|'[^']*')*>/gi,
        (_, tag) =>
          /^(address|article|aside|blockquote|br|dd|details|div|dl|dt|fieldset|figcaption|figure|footer|form|h[1-6]|header|hr|li|main|nav|ol|p|pre|section|summary|table|tbody|td|tfoot|th|thead|tr|ul)$/i.test(
            tag,
          )
            ? ' '
            : '',
      )
      .replace(
        /&(?:#(\d+|[xX][\da-fA-F]+);?|([a-zA-Z][a-zA-Z\d]+);)/g,
        (entity, number, name) => {
          if (name) return namedEntities.get(name) ?? entity;
          const codePoint = Number(
            number.startsWith('x') || number.startsWith('X')
              ? `0${number}`
              : number,
          );
          if (
            codePoint === 0 ||
            codePoint > 0x10ffff ||
            (codePoint >= 0xd800 && codePoint <= 0xdfff)
          ) {
            return '\uFFFD';
          }
          return String.fromCodePoint(codePoint);
        },
      )
      .replace(/\s+/g, ' ')
      .trim()
  );
}

function hansardBody(json) {
  return JSON.parse(json)
    .Items.filter((item) => item.ItemType === 'Contribution')
    .map((item) => item.Value)
    .join('\n');
}

function writtenQuestionBody(json) {
  const { uin, dateTabled, dateAnswered, questionText, answerText } =
    JSON.parse(json).value;
  if (typeof questionText !== 'string' || typeof answerText !== 'string') {
    throw new Error('Written question JSON has no question or answer text');
  }
  return JSON.stringify({
    uin,
    dateTabled,
    dateAnswered,
    questionText,
    answerText,
  });
}

function jsonSnapshotUrl(notes) {
  const urls = notes?.match(/https:\/\/[^\s`）)]+/g);
  return urls?.find((url) => {
    const { hostname, pathname } = new URL(url);
    return (
      (hostname === 'hansard-api.parliament.uk' &&
        pathname.endsWith('.json')) ||
      (hostname === 'questions-statements-api.parliament.uk' &&
        pathname.startsWith('/api/writtenquestions/questions/')) ||
      (hostname === 'www.gov.uk' && pathname.startsWith('/api/content/')) ||
      (hostname === 'committees-api.parliament.uk' &&
        /^\/api\/OralEvidence\/\d+$/.test(pathname))
    );
  });
}

for (const row of primarySources.match(/^\| SRC-\d+ \|.*$/gm)) {
  const columns = row.split('|').map((column) => column.trim());
  const id = columns[1];
  const notes = noteSections.find((section) => section.startsWith(`${id} `));
  const snapshotUrls = new Map(
    Array.from(
      notes?.matchAll(
        /^- `(policy-sources\/[^`]+)` → <(https:\/\/[^>\s]+)>$/gm,
      ) ?? [],
      ([, snapshot, url]) => [snapshot, url],
    ),
  );
  const urls = columns[4]?.match(/https:\/\/[^\s；，（）]+/g) ?? [];
  const snapshots = [
    ...columns[7].matchAll(
      /`(policy-sources\/[^`]+)`（sha256 `([a-f0-9]{64})`）/g,
    ),
  ];
  const pdfUrls = urls.filter((url) => url.endsWith('.pdf'));

  for (const [index, [, snapshot, expected]] of snapshots.entries()) {
    const label = `${id} ${snapshot}`;
    try {
      let url = snapshotUrls.get(snapshot);
      if (!url) {
        if (snapshot.endsWith('.json')) url = jsonSnapshotUrl(notes);
        else url = snapshot.endsWith('.pdf') ? pdfUrls[index] : urls[index];
      }
      if (!url) throw new Error('Missing snapshot URL in source register');

      let normalize;
      if (snapshot.endsWith('.json')) {
        if (url.startsWith('https://hansard-api.parliament.uk/')) {
          normalize = hansardBody;
        } else if (
          url.startsWith('https://questions-statements-api.parliament.uk/')
        ) {
          normalize = writtenQuestionBody;
        }
      } else if (
        url.startsWith('https://www.gov.uk/') &&
        snapshot.endsWith('.html')
      ) {
        normalize = normalizedBody;
      }
      const response = await fetchWithRetry(url);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status} ${response.statusText}`);
      }
      const bytes =
        url.startsWith('https://committees-api.parliament.uk/api/') &&
        new URL(url).pathname.includes('/Document/')
          ? Buffer.from((await response.json()).data, 'base64')
          : Buffer.from(await response.arrayBuffer());
      const actual = sha256(bytes);
      console.log(
        `${label}: raw sha256 (expected ${expected}, actual ${actual})`,
      );
      if (id === 'SRC-011') {
        counts.dynamic++;
        console.log(`${label}: dynamic (动态列表，不计入 changed)`);
      } else if (normalize) {
        const local = sha256(
          normalize(
            readFileSync(
              new URL(`../../../${snapshot}`, import.meta.url),
              'utf8',
            ),
          ),
        );
        const remote = sha256(normalize(bytes.toString('utf8')));
        if (local === remote) {
          counts.unchanged++;
          const reason =
            actual === expected
              ? '原始 hash 与正文均一致'
              : '原始 hash 变、正文一致';
          console.log(`${label}: unchanged (${reason})`);
        } else {
          counts.changed++;
          console.log(
            `${label}: changed (正文变; normalized sha256 expected ${local}, actual ${remote})`,
          );
        }
      } else if (actual === expected) {
        counts.unchanged++;
        console.log(`${label}: unchanged`);
      } else {
        counts.changed++;
        console.log(
          `${label}: changed (expected ${expected}, actual ${actual})`,
        );
      }
    } catch (error) {
      counts.failed++;
      const reason = error.cause?.message ?? error.message;
      console.log(`${label}: fetch failed (${reason})`);
    }
  }
}

console.log(
  `Summary: ${counts.unchanged} unchanged / ${counts.changed} changed / ${counts.failed} fetch failed / ${counts.dynamic} dynamic`,
);
process.exitCode = counts.changed || counts.failed ? 1 : 0;
