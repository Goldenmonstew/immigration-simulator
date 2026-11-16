// Minimal static server for the Next export in apps/web/out.
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';

const root = new URL('../web/out/', import.meta.url).pathname;
const port = Number(process.env.E2E_PORT ?? 4300);
const types: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.txt': 'text/plain; charset=utf-8',
  '.ogg': 'audio/ogg',
  '.woff2': 'font/woff2',
  '.ico': 'image/x-icon',
  '.webmanifest': 'application/manifest+json',
};

createServer(async (req, res) => {
  const path = normalize(
    decodeURIComponent(new URL(req.url ?? '/', 'http://x').pathname),
  );
  for (const candidate of [path, `${path}.html`, join(path, 'index.html')]) {
    const file = join(root, candidate);
    try {
      if ((await stat(file)).isFile()) {
        res.writeHead(200, {
          'content-type': types[extname(file)] ?? 'application/octet-stream',
        });
        res.end(await readFile(file));
        return;
      }
    } catch {
      // try the next candidate
    }
  }
  res.writeHead(404, { 'content-type': 'text/html; charset=utf-8' });
  res.end(await readFile(join(root, '404.html')).catch(() => 'not found'));
}).listen(port, () => console.log(`serving ${root} on ${port}`));
