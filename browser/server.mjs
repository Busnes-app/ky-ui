import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';

const files = {
  '/': ['fixture.html', 'text/html'],
  '/fixture.js': ['fixture.js', 'text/javascript'],
  '/fixture.css': ['fixture.css', 'text/css'],
  '/tokens.css': ['../src/tokens.css', 'text/css'],
  '/navigation.css': ['../src/navigation.css', 'text/css'],
  '/theme.js': ['../src/theme.js', 'text/javascript'],
};
createServer(async (req, res) => {
  const file = Object.hasOwn(files, req.url) ? files[req.url] : undefined;
  if (!file) { res.writeHead(404).end(); return; }
  try {
    const body = await readFile(new URL(file[0], import.meta.url));
    res.writeHead(200, { 'Content-Type': file[1], 'Content-Security-Policy': "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'", 'Cache-Control': 'no-store' }).end(body);
  } catch { res.writeHead(500).end(); }
}).listen(5390, '127.0.0.1');
