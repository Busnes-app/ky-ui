import { test, expect } from '@playwright/test';

test('sign-in card pairs every label with its field', async ({ page }) => {
  await page.goto('/');
  const auth = page.getByRole('region', { name: 'Sign-in screen' });
  await expect(auth.getByRole('combobox', { name: 'Color theme' })).toBeVisible();
  await expect(auth.getByRole('heading', { level: 1, name: 'KyCalendar' })).toBeVisible();
  const card = auth.locator('.ky-auth-card');
  await expect(card).toBeVisible();
  await expect(card.getByLabel('Username', { exact: true })).toHaveAttribute('autocomplete', 'username');
  await expect(card.getByLabel('Password', { exact: true })).toHaveAttribute('autocomplete', 'current-password');
  const pairs = await page.locator('.ky-auth-card :is(input, select, textarea)').evaluateAll(fields => fields.map(field => ({
    id: field.id,
    unique: document.querySelectorAll(`[id="${field.id}"]`).length === 1,
    labels: [...field.labels].map(label => label.htmlFor),
  })));
  expect(pairs.length).toBeGreaterThan(0);
  for (const pair of pairs) expect(pair).toEqual({ id: pair.id, unique: true, labels: [pair.id] });
  const submit = card.getByRole('button', { name: 'Sign in', exact: true });
  const [cardBox, submitBox] = [await card.boundingBox(), await submit.boundingBox()];
  expect(cardBox.width).toBeLessThanOrEqual(360);
  expect(submitBox.width).toBeCloseTo(cardBox.width - 2 * 24 - 2, 0);
  await expect(card.getByRole('link', { name: 'Continue with KySignOn' })).toHaveCSS('border-top-style', 'solid');
  await submit.focus();
  await expect(submit).toHaveCSS('outline-style', 'solid');
});

test('About opens and closes from the keyboard and names itself', async ({ page }) => {
  await page.goto('/');
  const trigger = page.getByRole('button', { name: '© 2026 · MIT License' });
  const about = page.getByRole('dialog', { name: 'About KyCalendar' });
  await expect(about).toBeHidden();
  await trigger.focus();
  await page.keyboard.press('Enter');
  await expect(about).toBeVisible();
  expect(await about.evaluate(el => el.matches(':modal'))).toBe(true);
  const close = about.getByRole('button', { name: 'Close', exact: true });
  await expect(close).toBeFocused();
  await expect(close).toHaveCSS('border-top-style', 'solid');
  await expect(about.getByRole('textbox', { name: 'MIT License' })).toHaveValue(/Permission is hereby granted/);
  expect(await about.evaluate(el => getComputedStyle(el, '::backdrop').backdropFilter)).toBe('none');
  await page.keyboard.press('Escape');
  await expect(about).toBeHidden();
  await expect(trigger).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(close).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(about).toBeHidden();
  await expect(trigger).toBeFocused();
});

test('shell text stays readable and nothing overflows at 390px or 1440px', async ({ page }) => {
  await page.goto('/');
  const ratios = await page.locator('.ky-auth-brand p, .ky-auth-check, .ky-auth-link, .ky-auth-help, .ky-auth-submit, .ky-user-role, .ky-user-signout, .ky-license-link, .ky-page-lede, .ky-page-action, .ky-about-version, .ky-about-meta').evaluateAll(els => {
    const ctx = document.createElement('canvas').getContext('2d', { willReadFrequently: true });
    const rgba = color => {
      ctx.clearRect(0, 0, 1, 1);
      ctx.fillStyle = color;
      ctx.fillRect(0, 0, 1, 1);
      return [...ctx.getImageData(0, 0, 1, 1).data];
    };
    const luminance = color => rgba(color).slice(0, 3).map(v => v / 255).map(v => v <= .04045 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4).reduce((sum, v, i) => sum + v * [.2126, .7152, .0722][i], 0);
    return els.map(el => {
      let surface = el;
      while (surface.parentElement && rgba(getComputedStyle(surface).backgroundColor)[3] === 0) surface = surface.parentElement;
      const [ink, bg] = [luminance(getComputedStyle(el).color), luminance(getComputedStyle(surface).backgroundColor)];
      return [el.className, (Math.max(ink, bg) + .05) / (Math.min(ink, bg) + .05)];
    });
  });
  for (const [name, ratio] of ratios) expect(ratio, name).toBeGreaterThanOrEqual(4.5);
  for (const width of [390, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `page at ${width}`).toBe(true);
    const head = page.locator('.ky-page-head');
    const action = await head.locator('.ky-page-action').boundingBox();
    const title = await head.locator('.ky-page-title').boundingBox();
    if (width === 390) expect(action.y).toBeGreaterThan(title.y + title.height);
    else expect(action.y).toBeLessThan(title.y + title.height);
    await page.getByRole('button', { name: '© 2026 · MIT License' }).click();
    const box = await page.getByRole('dialog', { name: 'About KyCalendar' }).boundingBox();
    expect(box.x).toBeGreaterThanOrEqual(0);
    expect(box.x + box.width).toBeLessThanOrEqual(width);
    await page.keyboard.press('Escape');
  }
});

test('shell evidence captures at 1440x900', async ({ page }, testInfo) => {
  test.skip(!testInfo.project.name.endsWith('-1280'), 'desktop captures only');
  const scheme = testInfo.project.use.colorScheme;
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/');
  const shot = (part, target = page) => target.screenshot({ path: testInfo.outputPath(`shell-${part}-${scheme}.png`), animations: 'disabled' });
  await shot('signin', page.getByRole('region', { name: 'Sign-in screen' }));
  await shot('sidebar', page.locator('.ky-sidebar'));
  await page.locator('.ky-page-head').evaluate(el => el.scrollIntoView({ block: 'center' }));
  const head = await page.locator('.ky-page-head').boundingBox();
  await page.screenshot({ path: testInfo.outputPath(`shell-pagehead-${scheme}.png`), clip: { x: head.x - 32, y: head.y - 32, width: head.width + 64, height: head.height + 64 } });
  await page.locator('.ky-app').scrollIntoViewIfNeeded();
  await page.getByRole('button', { name: '© 2026 · MIT License' }).click();
  await expect(page.getByRole('dialog', { name: 'About KyCalendar' })).toBeVisible();
  await shot('about');
});
