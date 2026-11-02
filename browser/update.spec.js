import { test, expect } from '@playwright/test';

// Update notice: a tab left open across a deploy offers a reload, and never reloads by itself.
const contrast = (a, b) => {
  const lum = ([r, g, b]) => [r, g, b].map(v => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }).reduce((sum, v, i) => sum + v * [0.2126, 0.7152, 0.0722][i], 0);
  const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m);
  return (x + 0.05) / (y + 0.05);
};
const rgb = value => value.match(/[\d.]+/g).slice(0, 3).map(Number);
const focus = page => page.evaluate(() => window.dispatchEvent(new Event('focus')));
const open = async (page, testInfo) => {
  const id = `${testInfo.project.name}-${testInfo.title.length}-${Date.now()}`;
  const errors = [];
  page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
  await page.goto(`/update/?id=${id}`);
  await page.waitForFunction(() => typeof window.stopWatching === 'function');
  return { id, errors, notice: page.getByRole('status') };
};

test('the same build stays quiet; a deploy shows the notice without reloading', async ({ page, request }, testInfo) => {
  const { id, errors, notice } = await open(page, testInfo);
  await page.locator('#note').fill('unsaved work');
  await page.waitForTimeout(150);
  await focus(page);
  await page.waitForTimeout(300);
  await expect(page.locator('.ky-update')).toHaveCount(0);

  await request.post(`/update/release?id=${id}`);
  await page.waitForTimeout(150);
  await focus(page);
  await expect(notice).toHaveText(/KyIdentity was updated\. Reload to use the new version\./);
  await expect(page.locator('#note')).toHaveValue('unsaved work');
  await expect(notice.getByRole('button', { name: 'Reload' })).toBeVisible();
  await expect(notice.getByRole('button', { name: 'Dismiss' })).toBeVisible();
  expect(errors, 'no CSP or console errors').toEqual([]);

  // Sizes, overflow and contrast in the scheme under test.
  const box = await notice.boundingBox();
  const viewport = page.viewportSize();
  expect(box.x).toBeGreaterThanOrEqual(0);
  expect(box.x + box.width).toBeLessThanOrEqual(viewport.width);
  expect(box.y + box.height).toBeLessThanOrEqual(viewport.height);
  for (const name of ['Reload', 'Dismiss']) expect((await notice.getByRole('button', { name }).boundingBox()).height).toBeGreaterThanOrEqual(40);
  const colours = await notice.evaluate(el => {
    const reload = el.querySelector('.ky-update-reload');
    return { text: getComputedStyle(el).color, panel: getComputedStyle(el).backgroundColor, button: getComputedStyle(reload).color, accent: getComputedStyle(reload).backgroundColor };
  });
  expect(contrast(rgb(colours.text), rgb(colours.panel))).toBeGreaterThanOrEqual(4.5);
  expect(contrast(rgb(colours.button), rgb(colours.accent))).toBeGreaterThanOrEqual(4.5);
  await page.screenshot({ path: testInfo.outputPath(`update-${testInfo.project.name}.png`) });

  // Keyboard: both buttons are reachable and show the shared focus ring.
  await notice.getByRole('button', { name: 'Reload' }).focus();
  await page.keyboard.press('Tab');
  await expect(notice.getByRole('button', { name: 'Dismiss' })).toBeFocused();
  const ring = await notice.getByRole('button', { name: 'Dismiss' }).evaluate(el => getComputedStyle(el).outlineStyle);
  expect(ring).toBe('solid');
});

test('Dismiss removes the notice; Reload loads the new build', async ({ page, request }, testInfo) => {
  const { id, notice } = await open(page, testInfo);
  await request.post(`/update/release?id=${id}`);
  await page.waitForTimeout(150);
  await focus(page);
  await notice.getByRole('button', { name: 'Dismiss' }).click();
  await expect(page.locator('.ky-update')).toHaveCount(0);

  await page.reload();
  await page.waitForFunction(() => typeof window.stopWatching === 'function');
  await request.post(`/update/release?id=${id}`);
  await page.waitForTimeout(150);
  await focus(page);
  await Promise.all([page.waitForEvent('load'), notice.getByRole('button', { name: 'Reload' }).click()]);
  await expect(page.locator('script[src="/update-fixture.js?build=3"]')).toHaveCount(1);
  await expect(page.locator('.ky-update')).toHaveCount(0);
});

test('offline, the check stays quiet', async ({ page, context, request }, testInfo) => {
  const { id } = await open(page, testInfo);
  await request.post(`/update/release?id=${id}`);
  await context.setOffline(true);
  await page.waitForTimeout(150);
  await focus(page);
  await page.waitForTimeout(300);
  await expect(page.locator('.ky-update')).toHaveCount(0);
  await context.setOffline(false);
  await expect(page.getByRole('status')).toBeVisible();
});

test('buildAssets parses fetched HTML with DOMParser: comments, icons and inline scripts are not assets', async ({ page }, testInfo) => {
  const { errors } = await open(page, testInfo);
  const assets = await page.evaluate(async () => {
    const { buildAssets, pageAssets } = await import('/update.js');
    const html = `<!doctype html><html><head>
<!-- <script src="/assets/commented-out.js"></script> -->
<link rel="icon" href="/favicon.ico">
<link rel="stylesheet" crossorigin href="/assets/index-AAAA.css">
<script src="/assets/ky-ui/themes-browser.js"></script>
<script type="module" crossorigin src='/assets/index-1111.js'></script>
<script>window.parsedScriptRan = true;</script>
</head><body><div id="root"></div></body></html>`;
    return {
      page: buildAssets(html),
      commentOnly: buildAssets('<!-- <script src="/old.js"></script> --><p>Signed out</p>'),
      unclosedComment: buildAssets('<p>x</p><!-- <script src="/old.js"></script>'),
      upper: buildAssets('<SCRIPT>inline()</SCRIPT><LINK REL="preload stylesheet" HREF=/a.css>'),
      live: pageAssets(),
      ran: window.parsedScriptRan ?? false,
    };
  });
  expect(assets.page).toEqual(['/assets/index-AAAA.css', '/assets/ky-ui/themes-browser.js', '/assets/index-1111.js']);
  expect(assets.commentOnly).toEqual([]);
  expect(assets.unclosedComment).toEqual([]);
  expect(assets.upper).toEqual(['/a.css']);
  expect(assets.live, 'the live page ignores its commented-out script too').toEqual(['/tokens.css', '/navigation.css', '/shell.css', expect.stringMatching(/^\/update-fixture\.js\?build=1$/)]);
  expect(assets.ran, 'parsing runs no script').toBe(false);
  expect(errors, 'no CSP or console errors').toEqual([]);
});
