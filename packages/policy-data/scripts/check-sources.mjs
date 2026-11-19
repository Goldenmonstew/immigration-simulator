/* global AbortSignal, fetch */

import { Buffer } from 'node:buffer';
import console from 'node:console';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import process from 'node:process';
import { URL } from 'node:url';
import { TextDecoder } from 'node:util';

const register = readFileSync(
  new URL('../../../docs/SOURCES.md', import.meta.url),
  'utf8',
);
const primarySources = register.split('## 一级来源')[1].split('\n## ')[0];
const noteSections = register.split(/^#{2,3} /m);
const counts = { unchanged: 0, changed: 0, failed: 0, dynamic: 0 };
// WHATWG entities.json entries found in policy-sources, plus the frac12 case.
// The Check sources workflow runs this file without installing dependencies.
const namedEntities = new Map([
  ['amp', '&'],
  ['frac12', '½'],
  ['gt', '>'],
  ['ldquo', '“'],
  ['lt', '<'],
  ['quot', '"'],
  ['rdquo', '”'],
  ['rsquo', '’'],
  ['times', '×'],
]);
const windows1252 = new TextDecoder('windows-1252');

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

function decodeEntities(text) {
  return text.replace(
    /&(?:#([0-9]+|[xX][0-9a-fA-F]+);?|([a-zA-Z][a-zA-Z0-9]+);)/g,
    (entity, number, name) => {
      if (name) return namedEntities.get(name) ?? entity;
      const codePoint = Number(number.replace(/^[xX]/, '0x'));
      if (
        codePoint === 0 ||
        codePoint > 0x10ffff ||
        (codePoint >= 0xd800 && codePoint <= 0xdfff)
      ) {
        return '\uFFFD';
      }
      if (codePoint >= 0x80 && codePoint <= 0x9f) {
        return windows1252.decode(Uint8Array.of(codePoint));
      }
      return String.fromCodePoint(codePoint);
    },
  );
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
  const tokens = body[1].split(
    /(<\/?[a-z][a-z\d:-]*\b(?:[^"'<>]|"[^"]*"|'[^']*')*>)/gi,
  );
  const parts = [];
  let text = '';
  for (const [index, token] of tokens.entries()) {
    if (index % 2 === 0) {
      text += decodeEntities(token);
      continue;
    }
    const [, closing, tag] = token.match(/^<(\/?)([a-z][a-z\d:-]*)/i);
    if (closing && /^(td|th|tr)$/i.test(tag)) {
      // Keep table boundaries as separate items so cell text cannot imitate them.
      parts.push(text, tag.toLowerCase());
      text = '';
    } else if (
      /^(address|article|aside|blockquote|br|dd|details|div|dl|dt|fieldset|figcaption|figure|footer|form|h[1-6]|header|hr|li|main|nav|ol|p|pre|section|summary|table|tbody|td|tfoot|th|thead|tr|ul)$/i.test(
        tag,
      )
    ) {
      // Keep spaces at block boundaries without splitting words across inline tags.
      text += ' ';
    }
  }
  parts.push(text);
  return JSON.stringify(parts.map((part) => part.replace(/\s+/g, ' ').trim()));
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
      (hostname === 'www.gov.uk' && pathname.startsWith('/api/content/'))
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
      } else if (
        url.startsWith('https://www.legislation.gov.uk/') &&
        snapshot.endsWith('.html')
      ) {
        // The "up to date ... on or before <date>" status line changes daily.
        normalize = (html) =>
          normalizedBody(html).replace(
            /in force on or before \d{1,2} [A-Z][a-z]+ \d{4}/g,
            'in force on or before <date>',
          );
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
