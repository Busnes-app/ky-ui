import { test, expect } from '@playwright/test';

const phone = testInfo => testInfo.project.name.endsWith('-390');
const visibleRail = page => page.locator('.ky-app-rail:visible');

test('one Apps rail shows: the sidebar foot on desktop, the page end on phones', async ({ page }, testInfo) => {
  await page.goto('/');
  await expect(page.getByRole('navigation', { name: 'Apps', exact: true })).toHaveCount(1);
  const rail = visibleRail(page);
  await expect(rail).toHaveCount(1);
  expect(await rail.evaluate(el => el.parentElement.className)).toBe(phone(testInfo) ? 'ky-content-foot' : 'ky-sidebar-foot');
  // Above the user block on desktop, above the licence line on phones.
  const next = phone(testInfo) ? '.ky-content-foot .ky-license-link' : '.ky-sidebar-foot .ky-user';
  expect((await rail.boundingBox()).y).toBeLessThan((await page.locator(next).boundingBox()).y);
  await expect(rail.locator('.ky-app-rail-label')).toHaveText('Apps');
  await expect(rail.locator('.ky-app-rail-label')).toHaveCSS('font-size', '13px');
});

test('each app link is named, titled, sized and its mark loads under the CSP', async ({ page }, testInfo) => {
  await page.goto('/');
  const links = visibleRail(page).getByRole('link');
  await expect(links).toHaveCount(7);
  const facts = await links.evaluateAll(els => els.map(el => {
    const box = el.getBoundingClientRect();
    const img = el.querySelector('img');
    return { name: el.getAttribute('aria-label'), title: el.title, alt: img.alt, loaded: img.complete && img.naturalWidth > 0, w: box.width, h: box.height, imgW: img.getBoundingClientRect().width };
  }));
  for (const fact of facts) {
    expect(fact.name).toMatch(/^Ky/);
    expect(fact.title).toBe(fact.name);
    expect(fact.alt).toBe('');
    expect(fact.loaded, fact.name).toBe(true);
    expect(fact.imgW).toBe(24);
    expect(Math.min(fact.w, fact.h)).toBeGreaterThanOrEqual(phone(testInfo) ? 40 : 36);
  }
  await expect(visibleRail(page).getByRole('link', { name: 'KyTasks' })).toHaveAttribute('href', 'https://kytasks.example.test/sso');
});

test('the current app has an accent ring; keyboard focus draws the shared outline', async ({ page }) => {
  await page.goto('/');
  const rail = visibleRail(page);
  const current = rail.locator('a[aria-current="page"]');
  await expect(current).toHaveCount(1);
  await expect(current).toHaveAccessibleName('KyCalendar');
  const accent = await page.locator('#shell-head .ky-page-action').evaluate(el => getComputedStyle(el).backgroundColor);
  await expect(current).toHaveCSS('border-top-color', accent);
  await expect(rail.getByRole('link', { name: 'KyPost' })).toHaveCSS('border-top-style', 'none');
  const post = rail.getByRole('link', { name: 'KyPost' });
  await post.focus();
  await page.keyboard.press('Tab');
  await page.keyboard.press('Shift+Tab');
  await expect(post).toBeFocused();
  await expect(post).toHaveCSS('outline-style', 'solid');
  await expect(post).toHaveCSS('outline-color', accent);
  await expect(post).toHaveCSS('outline-offset', '2px');
});

test('the current ring survives forced colors', async ({ page }) => {
  await page.emulateMedia({ forcedColors: 'active' });
  await page.goto('/');
  const rail = visibleRail(page);
  await expect(rail.getByRole('link', { name: 'KyCalendar' })).toHaveCSS('border-top-width', '2px');
  await expect(rail.getByRole('link', { name: 'KyPost' })).toHaveCSS('border-top-width', '0px');
});

test('app rail evidence captures', async ({ page }, testInfo) => {
  const scheme = testInfo.project.use.colorScheme;
  const width = phone(testInfo) ? 390 : 1440;
  await page.setViewportSize({ width, height: 900 });
  await page.goto('/');
  const shot = (part, locator) => locator.screenshot({ path: testInfo.outputPath(`rail-${part}-${width}-${scheme}.png`), animations: 'disabled' });
  if (phone(testInfo)) {
    await page.locator('.ky-content-foot').scrollIntoViewIfNeeded();
    const foot = await page.locator('.ky-content-foot').boundingBox();
    const rows = await page.locator('.fixture-record').last().boundingBox();
    await page.screenshot({ path: testInfo.outputPath(`rail-foot-${width}-${scheme}.png`), clip: { x: 0, y: rows.y, width, height: foot.y + foot.height - rows.y } });
  } else {
    await shot('sidebar', page.locator('.ky-sidebar'));
  }
});
