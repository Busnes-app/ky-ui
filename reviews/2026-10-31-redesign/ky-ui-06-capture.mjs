// ky-ui 0.9.0 evidence: the shell fixture's sidebar footer, its Settings page and the phone
// header, light and dark. Run from the ky-ui root under the browser lock:
//   node reviews/2026-10-31-redesign/ky-ui-06-capture.mjs <before|after>
import { chromium } from '@playwright/test';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const stage = process.argv[2];
if (!['before', 'after'].includes(stage)) throw new Error('usage: ky-ui-06-capture.mjs <before|after>');
const root = fileURLToPath(new URL('../../', import.meta.url));
const out = name => fileURLToPath(new URL(`screenshots/ky-ui-06-${stage}-${name}.png`, import.meta.url));
const url = 'http://127.0.0.1:5390/';
const server = spawn(process.execPath, ['browser/server.mjs'], { cwd: root, stdio: 'inherit' });
const browser = await chromium.launch();
try {
  for (let tries = 0; !(await fetch(url).then(r => r.ok, () => false)); tries++) {
    if (tries > 50) throw new Error('fixture server did not start');
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  const open = async (width, height, colorScheme, deviceScaleFactor = 1) => {
    const page = await browser.newPage({ viewport: { width, height }, colorScheme, deviceScaleFactor, reducedMotion: 'reduce' });
    await page.goto(url);
    await page.locator('.ky-app').evaluate(el => el.scrollIntoView({ block: 'start' }));
    return page;
  };
  for (const scheme of ['light', 'dark']) {
    const desktop = await open(1440, 900, scheme);
    await desktop.locator('.ky-app').screenshot({ path: out(`settings-desktop-${scheme}`) });
    await desktop.close();

    const zoomed = await open(1440, 900, scheme, 2);
    const side = await zoomed.locator('.ky-sidebar').boundingBox();
    const foot = await zoomed.locator('.ky-sidebar-foot').boundingBox();
    const top = foot.y - 24;
    await zoomed.screenshot({ path: out(`footer-desktop-${scheme}`), clip: { x: side.x, y: top, width: side.width, height: side.y + side.height - top } });
    await zoomed.close();

    const phone = await open(390, 844, scheme, 2);
    await phone.locator('.ky-sidebar').screenshot({ path: out(`phonehead-${scheme}`) });
    await phone.locator('.ky-app').screenshot({ path: out(`settings-phone-${scheme}`) });
    await phone.close();
  }
} finally {
  await browser.close();
  server.kill();
}
