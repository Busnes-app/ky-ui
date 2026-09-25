import { test, expect } from '@playwright/test';

test('layout, selected/disabled states, keyboard focus and dialog', async ({ page }, testInfo) => {
  await page.goto('/');
  const selected = page.getByRole('button', { name: 'Records', exact: true });
  const before = await selected.boundingBox();
  await page.getByRole('button', { name: 'Activity', exact: true }).click();
  expect(await selected.boundingBox()).toEqual(before);
  await expect(page.getByRole('button', { name: 'Activity', exact: true })).toHaveAttribute('aria-current', 'page');
  await expect(page.getByRole('button', { name: 'Unavailable' })).toBeDisabled();
  await selected.focus();
  await page.keyboard.press('Tab');
  const active = page.locator(':focus');
  await expect(active).toHaveText('Activity');
  await expect(active).toHaveCSS('outline-style', 'solid');
  await expect(page.getByRole('alert')).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.getByRole('button', { name: 'Open dialog' }).click();
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole('textbox')).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(dialog).not.toBeVisible();
  await expect(page.getByRole('button', { name: 'Open dialog' })).toBeFocused();
  await page.screenshot({ path: testInfo.outputPath('populated-error.png'), fullPage: true });
});

test('OS following, explicit persistence, legacy switching and cross-tab changes', async ({ page, context }) => {
  await page.goto('/');
  await page.emulateMedia({ colorScheme: 'dark' });
  await expect(page.locator('body')).toHaveCSS('background-color', 'rgb(24, 35, 38)');
  await page.emulateMedia({ colorScheme: 'light' });
  await expect(page.locator('body')).toHaveCSS('background-color', 'rgb(248, 246, 240)');
  await page.getByLabel('Theme').selectOption('legacy');
  await expect(page.locator('body')).toHaveCSS('background-color', 'rgb(32, 32, 64)');
  await page.getByLabel('Theme').selectOption('busnes-dark');
  await page.reload();
  await expect(page.locator('body')).toHaveCSS('background-color', 'rgb(24, 35, 38)');
  const other = await context.newPage();
  await other.goto('/');
  await other.getByLabel('Theme').selectOption('busnes-light');
  await expect(page.locator('body')).toHaveCSS('background-color', 'rgb(248, 246, 240)');
});

test('restricted storage still renders the OS theme', async ({ page }) => {
  await page.addInitScript(() => Object.defineProperty(window, 'localStorage', { get() { throw new DOMException('Denied', 'SecurityError'); } }));
  await page.emulateMedia({ colorScheme: 'dark' });
  await page.goto('/');
  await expect(page.locator('body')).toHaveCSS('background-color', 'rgb(24, 35, 38)');
  await expect(page.getByRole('button', { name: 'Records', exact: true })).toBeVisible();
});
