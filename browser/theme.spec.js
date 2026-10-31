import { test, expect } from '@playwright/test';
import { writeFile } from 'node:fs/promises';

test('every catalog palette keeps status text and field borders readable', async ({ page }, testInfo) => {
  await page.goto('/');
  const results = [];
  for (const id of await page.locator('.ky-appearance-radio').evaluateAll(els => els.map(el => el.value).filter(id => id !== 'system'))) {
    await page.locator('#theme').selectOption(id);
    const rows = await page.evaluate(() => {
      const root = getComputedStyle(document.documentElement);
      const probe = document.body.appendChild(document.createElement('span'));
      const context = document.createElement('canvas').getContext('2d');
      const luminance = color => {
        context.fillStyle = color;
        context.fillRect(0, 0, 1, 1);
        const rgb = [...context.getImageData(0, 0, 1, 1).data].slice(0, 3).map(v => v / 255).map(v => v <= .04045 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4);
        return rgb.reduce((sum, v, i) => sum + v * [.2126, .7152, .0722][i], 0);
      };
      const rows = [];
      for (const status of ['danger', 'success', 'warning']) {
        if (!root.getPropertyValue(`--${status}`).trim()) throw new Error(`${status} is unset`);
        probe.style.color = `var(--${status})`;
        const color = getComputedStyle(probe).color;
        for (const token of ['--panel', '--panel-hover']) {
          const ink = luminance(color), surface = luminance(root.getPropertyValue(token));
          rows.push({ status, token, color, minimum: 4.5, ratio: (Math.max(ink, surface) + .05) / (Math.min(ink, surface) + .05) });
        }
      }
      probe.style.border = '1px solid var(--ky-field-border)';
      const color = getComputedStyle(probe).borderTopColor;
      for (const token of ['--bg', '--panel']) {
        const ink = luminance(color), surface = luminance(root.getPropertyValue(token));
        rows.push({ status: 'field border', token, color, minimum: 3, ratio: (Math.max(ink, surface) + .05) / (Math.min(ink, surface) + .05) });
      }
      probe.remove();
      return rows;
    });
    results.push({ id, rows });
    for (const row of rows) expect(row.ratio, `${id} ${row.status} on ${row.token}`).toBeGreaterThanOrEqual(row.minimum);
  }
  const path = testInfo.outputPath('status-contrast.json');
  await writeFile(path, JSON.stringify(results, null, 2) + '\n');
  await testInfo.attach('status-contrast.json', { path, contentType: 'application/json' });
});

test('layout, selected/disabled states, keyboard focus and dialog', async ({ page }, testInfo) => {
  await page.goto('/');
  const selected = page.getByRole('button', { name: 'Records', exact: true });
  const before = await selected.boundingBox();
  await page.getByRole('button', { name: 'Activity', exact: true }).click();
  expect(await selected.boundingBox()).toEqual(before);
  await expect(page.getByRole('button', { name: 'Activity', exact: true })).toHaveAttribute('aria-current', 'page');
  await page.mouse.move(0, 0);
  const activity = page.getByRole('button', { name: 'Activity', exact: true });
  const selectedSurface = await activity.evaluate(el => getComputedStyle(el).backgroundColor);
  await activity.hover();
  await page.screenshot({ path: testInfo.outputPath('selected-hover.png') });
  await expect(activity).toHaveCSS('background-color', selectedSurface);
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
  await page.locator('#theme').selectOption('legacy');
  await expect(page.locator('body')).toHaveCSS('background-color', 'rgb(32, 32, 64)');
  await page.locator('#theme').selectOption('busnes-dark');
  await page.reload();
  await expect(page.locator('body')).toHaveCSS('background-color', 'rgb(24, 35, 38)');
  const other = await context.newPage();
  await other.goto('/');
  await other.locator('#theme').selectOption('busnes-light');
  await expect(page.locator('body')).toHaveCSS('background-color', 'rgb(248, 246, 240)');
});

test('restricted storage still renders the OS theme', async ({ page }) => {
  await page.addInitScript(() => Object.defineProperty(window, 'localStorage', { get() { throw new DOMException('Denied', 'SecurityError'); } }));
  await page.emulateMedia({ colorScheme: 'dark' });
  await page.goto('/');
  await expect(page.locator('body')).toHaveCSS('background-color', 'rgb(24, 35, 38)');
  await expect(page.getByRole('button', { name: 'Records', exact: true })).toBeVisible();
});

test('controls retain geometry, field contrast and readable legacy hover', async ({ page }) => {
  await page.goto('/');
  for (const theme of ['busnes-light', 'busnes-dark', 'legacy']) {
    await page.locator('#theme').selectOption(theme);
    await page.getByRole('button', { name: 'Activity', exact: true }).hover();
    const result = await page.evaluate(() => {
      const probe = document.createElement('input');
      probe.style.cssText = 'box-sizing:border-box;height:var(--ky-control-size);border-radius:var(--ky-control-radius);border:1px solid var(--ky-field-border)';
      document.body.append(probe);
      const style = getComputedStyle(probe);
      const canvas = document.createElement('canvas');
      canvas.width = canvas.height = 1;
      const ctx = canvas.getContext('2d');
      const luminance = color => {
        ctx.fillStyle = color;
        ctx.fillRect(0, 0, 1, 1);
        const rgb = [...ctx.getImageData(0, 0, 1, 1).data].slice(0, 3).map(x => {
          const s = x / 255;
          return s <= .04045 ? s / 12.92 : ((s + .055) / 1.055) ** 2.4;
        });
        return rgb[0] * .2126 + rgb[1] * .7152 + rgb[2] * .0722;
      };
      const root = getComputedStyle(document.documentElement);
      const edge = luminance(style.borderTopColor);
      const ratios = ['--bg', '--panel'].map(token => {
        const surface = luminance(root.getPropertyValue(token));
        return (Math.max(edge, surface) + .05) / (Math.min(edge, surface) + .05);
      });
      const geometry = { height: style.height, radius: style.borderRadius };
      const hovered = getComputedStyle(document.querySelector('nav button:hover'));
      const hoverInk = luminance(hovered.color);
      const hoverSurface = luminance(hovered.backgroundColor);
      const hoverContrast = (Math.max(hoverInk, hoverSurface) + .05) / (Math.min(hoverInk, hoverSurface) + .05);
      probe.remove();
      return { ...geometry, ratios, hoverContrast };
    });
    expect(result.height).toBe('40px');
    expect(result.radius).toBe('8px');
    for (const ratio of result.ratios) expect(ratio).toBeGreaterThanOrEqual(3);
    expect(result.hoverContrast).toBeGreaterThanOrEqual(4.5);
  }
});
