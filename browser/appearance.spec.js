import { test, expect } from '@playwright/test';
import { THEME_CATALOG } from '../src/themes.js';

test('Appearance cards support native keyboard selection, persistence and visible focus', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('radio')).toHaveCount(THEME_CATALOG.length + 1);
  const light = page.getByRole('radio', { name: 'Busnes Light', exact: false });
  const dark = page.getByRole('radio', { name: 'Busnes Dark', exact: false });
  await light.check();
  await light.focus();
  await page.keyboard.press('ArrowRight');
  await expect(dark).toBeChecked();
  await expect(dark).toBeFocused();
  await expect(dark.locator('..')).toHaveCSS('outline-style', 'solid');
  await page.reload();
  await expect(dark).toBeChecked();
  await expect(page.locator('body')).toHaveCSS('background-color', 'rgb(24, 35, 38)');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test('Appearance selection stays visible in forced colors and follows changes from another tab', async ({ page, context }) => {
  await page.goto('/');
  const other = await context.newPage();
  await other.goto('/');
  await other.getByRole('radio', { name: 'Busnes Light', exact: false }).check();
  const selected = page.getByRole('radio', { name: 'Busnes Light', exact: false });
  await expect(selected).toBeChecked();
  await page.emulateMedia({ forcedColors: 'active' });
  await expect(selected.locator('..')).toHaveCSS('outline-style', 'solid');
  await expect(selected).toBeVisible();
  await page.emulateMedia({ forcedColors: 'none' });
  await page.getByRole('combobox').selectOption('legacy');
  await expect(page.locator('.ky-appearance-mode').first()).toHaveCSS('color', 'rgb(221, 221, 255)');
});

test('full catalog starts in system mode and all previews fit the viewport', async ({ page }, testInfo) => {
  await page.goto('/');
  await expect(page.getByRole('radio')).toHaveCount(THEME_CATALOG.length + 1);
  await expect(page.getByRole('radio', { name: 'Match system', exact: false })).toBeChecked();
  const previewColors = await page.locator('[data-ky-preview]').evaluateAll(elements => elements.map(el => ({
    bg: getComputedStyle(el).getPropertyValue('--ky-preview-bg').trim(),
    accent: getComputedStyle(el).getPropertyValue('--ky-preview-accent').trim(),
  })));
  expect(previewColors.every(color => color.bg && color.accent)).toBe(true);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.locator('.ky-appearance').screenshot({ path: testInfo.outputPath('appearance-catalog.png') });
});
