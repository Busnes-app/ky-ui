import { test, expect } from '@playwright/test';
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';

test('README bootstrap applies a saved choice under a self-only script policy', async ({ page }) => {
  const readme = await readFile(new URL('../README.md', import.meta.url), 'utf8');
  const html = readme.match(/```html\n([\s\S]*?)\n```/)[1];
  const script = readme.match(/```js\n([\s\S]*?)\n```/)[1];
  const responses = new Map([
    ['/', ['text/html', `<!doctype html><html><head>${html}</head><body>README example</body></html>`]],
    ['/assets/theme-init.js', ['text/javascript', script]],
  ]);
  for (const file of ['tokens.css', 'navigation.css', 'theme.js']) {
    responses.set(`/assets/ky-ui/${file}`, [file.endsWith('.css') ? 'text/css' : 'text/javascript', await readFile(new URL(`../src/${file}`, import.meta.url))]);
  }
  const server = createServer((req, res) => {
    const entry = responses.get(req.url);
    if (!entry) { res.writeHead(404).end(); return; }
    res.writeHead(200, { 'Content-Type': entry[0], 'Content-Security-Policy': "default-src 'self'; script-src 'self'" }).end(entry[1]);
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  try {
    await page.addInitScript(() => {
      localStorage.setItem('ky-theme', 'busnes-dark');
      window.cspViolations = [];
      document.addEventListener('securitypolicyviolation', event => window.cspViolations.push(event.violatedDirective));
    });
    await page.goto(`http://127.0.0.1:${server.address().port}/`);
    await expect(page.locator('html')).toHaveAttribute('data-ky-theme', 'busnes-dark');
    expect(await page.evaluate(() => window.cspViolations)).toEqual([]);
  } finally {
    server.closeAllConnections();
    await new Promise(resolve => server.close(resolve));
  }
});
