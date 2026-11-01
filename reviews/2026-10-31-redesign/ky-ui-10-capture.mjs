// ky-ui 0.11.0 evidence: the Settings gear menu in the shell fixture. Footer open at 1440x900
// (light, dark), phone header open at 390x700 (light), keyboard focus on an item (light). Before
// = 0.10.0, where the gear was a plain link: same views, nothing opens. 2x device scale, reduced
// motion. Run from the ky-ui root under the browser lock:
//   node reviews/2026-10-31-redesign/ky-ui-10-capture.mjs <before|after>
import { chromium } from '@playwright/test';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const stage = process.argv[2];
if (!['before', 'after'].includes(stage)) throw new Error('usage: ky-ui-10-capture.mjs <before|after>');
const root = fileURLToPath(new URL('../../', import.meta.url));
const out = name => fileURLToPath(new URL(`screenshots/ky-ui-10-${stage}-${name}.png`, import.meta.url));
const server = spawn(process.execPath, ['browser/server.mjs'], { cwd: root, stdio: 'ignore' });
await new Promise(resolve => setTimeout(resolve, 800));
const browser = await chromium.launch();
try {
  const shot = async (name, { scheme, width, height = 900, act }) => {
    const page = await browser.newPage({ colorScheme: scheme, viewport: { width, height }, deviceScaleFactor: 2 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('http://127.0.0.1:5390/');
    await page.locator('.ky-app').evaluate(el => el.scrollIntoView({ block: 'start' }));
    const clip = await act(page);
    await page.screenshot({ path: out(name), clip });
    await page.close();
  };
  const gear = page => page.locator(page.viewportSize().width > 720 ? '.ky-user-actions .ky-icon-button' : '.ky-mobile-actions .ky-icon-button').first();
  const open = async page => { if (stage === 'after') await gear(page).click(); };
  const foot = async page => {
    const sidebar = await page.locator('.ky-sidebar').boundingBox();
    return { x: sidebar.x, y: sidebar.y + sidebar.height - 460, width: 560, height: 460 };
  };
  for (const scheme of ['light', 'dark']) {
    await shot(`footer-menu-1440-${scheme}`, { scheme, width: 1440, act: async page => { await open(page); return foot(page); } });
  }
  await shot('phone-header-menu-390-light', { scheme: 'light', width: 390, height: 700, act: async page => { await open(page); return { x: 0, y: 0, width: 390, height: 420 }; } });
  // Focus on Appearance, one row past the open section, so the ring and the current bar both show.
  await shot('keyboard-focus-1440-light', { scheme: 'light', width: 1440, act: async page => {
    await gear(page).focus();
    if (stage === 'after') for (const key of ['Enter', 'ArrowDown', 'ArrowDown']) await page.keyboard.press(key);
    return foot(page);
  } });
} finally {
  await browser.close();
  server.kill();
}
