import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';

const files = {
  '/': ['fixture.html', 'text/html'],
  '/fixture.js': ['fixture.js', 'text/javascript'],
  '/fixture.css': ['fixture.css', 'text/css'],
  '/tokens.css': ['../src/tokens.css', 'text/css'],
  '/navigation.css': ['../src/navigation.css', 'text/css'],
  '/appearance.css': ['../src/appearance.css', 'text/css'],
  '/appearance-themes.css': ['../src/appearance-themes.css', 'text/css'],
  '/shell.css': ['../src/shell.css', 'text/css'],
  '/themes.js': ['../src/themes.js', 'text/javascript'],
  '/theme.js': ['../src/theme.js', 'text/javascript'],
  '/appmarks.js': ['../src/appmarks.js', 'text/javascript'],
  '/menu.js': ['../src/menu.js', 'text/javascript'],
  '/update.js': ['../src/update.js', 'text/javascript'],
};
// Update notice: /update/?id=<test> is an entry document whose bundle name changes after a
// POST to /update/release?id=<test>, as a deploy changes Vite's hashed name. Its commented-out
// script names a different bundle each build, so a parser that read comments would never be quiet.
const builds = new Map();
const updatePage = (id, build) => `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Update notice fixture</title>
<link rel="stylesheet" href="/tokens.css"><link rel="stylesheet" href="/navigation.css"><link rel="stylesheet" href="/shell.css">
<!-- A commented-out bundle is not an asset: <script src="/update-fixture.js?build=${build + 100}"></script> -->
<script type="module" src="/update-fixture.js?build=${build}"></script></head>
<body><main class="fixture-update"><h1>KyIdentity</h1><label>Unsaved note <textarea id="note"></textarea></label></main></body></html>`;
createServer(async (req, res) => {
  const { pathname, searchParams } = new URL(req.url, 'http://127.0.0.1');
  const id = searchParams.get('id') ?? '';
  const strict = { 'Content-Security-Policy': "default-src 'self'; script-src 'self'; style-src 'self'", 'Cache-Control': 'no-store' };
  if (pathname === '/update/release' && req.method === 'POST') { builds.set(id, (builds.get(id) ?? 1) + 1); res.writeHead(204).end(); return; }
  if (pathname === '/update/') { res.writeHead(200, { 'Content-Type': 'text/html', ...strict }).end(updatePage(id, builds.get(id) ?? 1)); return; }
  if (pathname === '/update-fixture.js') { res.writeHead(200, { 'Content-Type': 'text/javascript', ...strict }).end(await readFile(new URL('update-fixture.js', import.meta.url))); return; }
  const file = Object.hasOwn(files, req.url) ? files[req.url] : undefined;
  if (!file) { res.writeHead(404).end(); return; }
  try {
    const body = await readFile(new URL(file[0], import.meta.url));
    res.writeHead(200, { 'Content-Type': file[1], 'Content-Security-Policy': "default-src 'self'; script-src 'self'; img-src 'self' data:; style-src 'self' 'unsafe-inline'", 'Cache-Control': 'no-store' }).end(body);
  } catch { res.writeHead(500).end(); }
}).listen(5390, '127.0.0.1');
