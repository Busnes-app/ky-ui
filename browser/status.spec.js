import { test, expect } from '@playwright/test';

// Measures the rendered pills, not the token source: scripts/check-status-colours.mjs covers that.
test('status pills stay readable, marked and distinct from the accent in every half', async ({ page }, testInfo) => {
  // Theme changes animate colour; reduced motion keeps measurements and captures settled.
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  const row = page.getByRole('region', { name: 'Status and actions' });
  const ids = await page.locator('.ky-appearance-radio').evaluateAll(els => els.map(el => el.value).filter(id => id !== 'system' && !id.endsWith('-pair')));
  expect(ids).toHaveLength(12);
  for (const id of ids) {
    await page.locator('#theme').selectOption(id);
    const pills = await row.locator('.ky-status').evaluateAll(els => {
      const context = document.createElement('canvas').getContext('2d', { willReadFrequently: true });
      const channels = color => {
        context.clearRect(0, 0, 1, 1);
        context.fillStyle = color;
        context.fillRect(0, 0, 1, 1);
        return [...context.getImageData(0, 0, 1, 1).data].slice(0, 3);
      };
      const luminance = color => channels(color).map(v => v / 255).map(v => v <= .04045 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4).reduce((sum, v, i) => sum + v * [.2126, .7152, .0722][i], 0);
      const accent = channels(getComputedStyle(document.querySelector('.ky-page-action')).backgroundColor);
      return els.map(el => {
        const style = getComputedStyle(el);
        const [ink, surface] = [luminance(style.color), luminance(style.backgroundColor)];
        const marker = el.querySelector('svg') ? 'icon' : getComputedStyle(el, '::before').content === '""' ? 'dot' : 'none';
        return { text: el.textContent.trim(), status: el.dataset.kyStatus ?? 'neutral', ratio: (Math.max(ink, surface) + .05) / (Math.min(ink, surface) + .05), marker, sameAsAccent: channels(style.color).every((v, i) => v === accent[i]) };
      });
    });
    for (const pill of pills) {
      expect(pill.ratio, `${id} ${pill.text}`).toBeGreaterThanOrEqual(4.5);
      expect(pill.marker, `${id} ${pill.text}`).not.toBe('none');
      expect(pill.sameAsAccent, `${id} ${pill.text}`).toBe(false);
    }
    if (testInfo.project.name === 'light-1280') await row.screenshot({ path: testInfo.outputPath(`status-${id}.png`) });
  }
});
