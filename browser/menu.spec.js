import { test, expect } from '@playwright/test';

// Settings menu (0.11.0): the gear opens a menu of Settings sections. The footer's opens upward on
// desktop; the phone header's opens downward at 720px and narrower.
const isDesktop = testInfo => testInfo.project.name.endsWith('-1280');
const parts = (page, testInfo) => {
  const scope = page.locator(isDesktop(testInfo) ? '.ky-user-actions' : '.ky-mobile-actions');
  return { gear: scope.getByRole('button', { name: 'Settings', exact: true }), menu: scope.getByRole('menu', { name: 'Settings' }), signout: scope.getByRole('button', { name: 'Sign out', exact: true }) };
};
const load = async (page, testInfo) => {
  await page.goto('/');
  await page.locator('.ky-app').evaluate(el => el.scrollIntoView({ block: 'start' }));
  return parts(page, testInfo);
};

test('the gear is a menu button whose items are the Settings tabs, in order', async ({ page }, testInfo) => {
  const { gear, menu } = await load(page, testInfo);
  await expect(gear).toHaveAttribute('aria-haspopup', 'menu');
  await expect(gear).toHaveAttribute('aria-expanded', 'false');
  await expect(menu).toBeHidden();
  await gear.click();
  await expect(gear).toHaveAttribute('aria-expanded', 'true');
  await expect(menu).toBeVisible();
  const items = await menu.getByRole('menuitem').evaluateAll(els => els.map(el => ({ tag: el.tagName, text: el.textContent, href: el.getAttribute('href'), current: el.getAttribute('aria-current'), tab: el.tabIndex })));
  const tabs = await page.locator('.ky-settings-tabs > .ky-nav-item').evaluateAll(els => els.map(el => ({ text: el.textContent, current: el.getAttribute('aria-current') })));
  expect(items.map(({ text, current }) => ({ text, current }))).toEqual(tabs);
  for (const item of items) expect(item).toMatchObject({ tag: 'A', href: expect.any(String), tab: -1 });
  await gear.click();
  await expect(gear).toHaveAttribute('aria-expanded', 'false');
  await expect(menu).toBeHidden();
});

test('keyboard: Enter, Space and ArrowDown open on the first item; arrows, Home and End move; Escape returns to the gear', async ({ page }, testInfo) => {
  const { gear, menu } = await load(page, testInfo);
  const items = menu.getByRole('menuitem');
  for (const key of ['Enter', ' ', 'ArrowDown']) {
    await gear.focus();
    await page.keyboard.press(key);
    await expect(gear, key).toHaveAttribute('aria-expanded', 'true');
    await expect(items.first(), key).toBeFocused();
    await page.keyboard.press('Escape');
    await expect(menu).toBeHidden();
    await expect(gear).toHaveAttribute('aria-expanded', 'false');
    await expect(gear, key).toBeFocused();
  }
  await page.keyboard.press('ArrowUp');
  await expect(items.last()).toBeFocused();
  await page.keyboard.press('ArrowDown');
  await expect(items.first()).toBeFocused();
  await page.keyboard.press('ArrowDown');
  await expect(items.nth(1)).toBeFocused();
  await page.keyboard.press('End');
  await expect(items.last()).toBeFocused();
  await page.keyboard.press('Home');
  await expect(items.first()).toBeFocused();
  await page.keyboard.press('ArrowUp');
  await expect(items.last()).toBeFocused();
  // The focused item shows the shared ring, inside the row so the panel never clips it.
  const ring = await items.last().evaluate(el => {
    const style = getComputedStyle(el);
    const probe = document.createElement('span');
    probe.style.color = 'var(--accent)';
    document.body.append(probe);
    const accent = getComputedStyle(probe).color;
    probe.remove();
    return { visible: el.matches(':focus-visible'), style: style.outlineStyle, width: style.outlineWidth, offset: style.outlineOffset, accent: style.outlineColor === accent };
  });
  expect(ring).toEqual({ visible: true, style: 'solid', width: '2px', offset: '-2px', accent: true });
  await page.keyboard.press('Escape');
  await expect(gear).toBeFocused();
});

test('Tab closes the menu and moves on to Sign out; a click outside closes it', async ({ page }, testInfo) => {
  const { gear, menu, signout } = await load(page, testInfo);
  await gear.focus();
  await page.keyboard.press('Enter');
  await page.keyboard.press('Tab');
  await expect(menu).toBeHidden();
  await expect(gear).toHaveAttribute('aria-expanded', 'false');
  await expect(signout).toBeFocused();
  await gear.click();
  await expect(menu).toBeVisible();
  const view = page.viewportSize();
  await page.mouse.click(view.width - 10, view.height - 10);
  await expect(menu).toBeHidden();
  await expect(gear).toHaveAttribute('aria-expanded', 'false');
  // Choosing an item closes the menu and leaves focus on the gear for a same-page route.
  await gear.click();
  await menu.getByRole('menuitem', { name: 'Appearance' }).click();
  await expect(menu).toBeHidden();
  await expect(gear).toBeFocused();
});

test('footer opens upward over the sidebar; phone header opens downward; neither overflows', async ({ page }, testInfo) => {
  const { gear, menu } = await load(page, testInfo);
  await gear.click();
  const [g, m] = [await gear.boundingBox(), await menu.boundingBox()];
  const width = page.viewportSize().width;
  if (isDesktop(testInfo)) {
    const user = await page.locator('.ky-sidebar .ky-user').boundingBox();
    expect(m.y + m.height).toBeLessThanOrEqual(user.y);
    expect(m.y + m.height).toBeLessThan(g.y);
    // Spans the footer row exactly, so it stays inside the sidebar.
    expect([m.x, m.width]).toEqual([user.x, user.width]);
  } else {
    expect(m.y).toBeGreaterThanOrEqual(g.y + g.height);
    const actions = await page.locator('.ky-mobile-actions').boundingBox();
    expect(m.x + m.width).toBeCloseTo(actions.x + actions.width, 0);
  }
  expect(m.x).toBeGreaterThanOrEqual(0);
  expect(m.x + m.width).toBeLessThanOrEqual(width);
  expect(m.y).toBeGreaterThanOrEqual(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  // Every row is shown whole: nothing clips a label.
  const clipped = await menu.getByRole('menuitem').evaluateAll(els => els.filter(el => el.scrollWidth > el.clientWidth).map(el => el.textContent));
  expect(clipped).toEqual([]);
});

test('menu rows are 40px on a mouse or trackpad', async ({ page }, testInfo) => {
  const { gear, menu } = await load(page, testInfo);
  await gear.click();
  const heights = await menu.getByRole('menuitem').evaluateAll(els => els.map(el => el.offsetHeight));
  expect(heights).toEqual([40, 40, 40, 40]);
});

test.describe('on a touch screen', () => {
  test.use({ hasTouch: true, isMobile: true });
  test('menu rows grow to 44px', async ({ page }, testInfo) => {
    const { gear, menu } = await load(page, testInfo);
    expect(await page.evaluate(() => matchMedia('(pointer: coarse)').matches)).toBe(true);
    await gear.tap();
    await expect(menu).toBeVisible();
    const heights = await menu.getByRole('menuitem').evaluateAll(els => els.map(el => el.offsetHeight));
    expect(heights).toEqual([44, 44, 44, 44]);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  });
});

test('the menu reads and fits in every palette half', async ({ page }, testInfo) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const { gear, menu } = await load(page, testInfo);
  const ids = await page.locator('.ky-appearance-radio').evaluateAll(els => els.map(el => el.value).filter(id => id !== 'system' && !id.endsWith('-pair')));
  expect(ids).toHaveLength(12);
  for (const id of ids) {
    await page.locator('#theme').selectOption(id);
    await page.locator('.ky-app').evaluate(el => el.scrollIntoView({ block: 'start' }));
    await gear.click();
    await expect(menu).toBeVisible();
    const look = await menu.evaluate(el => {
      const ctx = document.createElement('canvas').getContext('2d', { willReadFrequently: true });
      const rgba = color => {
        ctx.clearRect(0, 0, 1, 1);
        ctx.fillStyle = color;
        ctx.fillRect(0, 0, 1, 1);
        return [...ctx.getImageData(0, 0, 1, 1).data];
      };
      // A translucent tint (Nord's) is measured as drawn: over the panel.
      const over = (top, bottom) => { const [t, b] = [rgba(top), rgba(bottom)]; return `rgb(${[0, 1, 2].map(i => Math.round(t[i] * t[3] / 255 + b[i] * (1 - t[3] / 255))).join(',')})`; };
      const lum = color => rgba(color).slice(0, 3).map(v => v / 255).map(v => v <= .04045 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4).reduce((sum, v, i) => sum + v * [.2126, .7152, .0722][i], 0);
      const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)]; return (Math.max(x, y) + .05) / (Math.min(x, y) + .05); };
      const panel = getComputedStyle(el).backgroundColor;
      const items = [...el.querySelectorAll('[role="menuitem"]')].map(item => {
        const style = getComputedStyle(item);
        const surface = over(style.backgroundColor, panel);
        return Math.round(ratio(style.color, surface) * 100) / 100;
      });
      const r = el.getBoundingClientRect();
      return { opaque: rgba(panel)[3] === 255, border: getComputedStyle(el).borderTopStyle, items, inside: r.left >= 0 && r.right <= innerWidth && r.top >= 0 && r.bottom <= innerHeight };
    });
    expect(look, id).toMatchObject({ opaque: true, border: 'solid', inside: true });
    for (const ratio of look.items) expect(ratio, id).toBeGreaterThanOrEqual(4.5);
    await page.keyboard.press('Escape');
  }
});

test('menu evidence captures', async ({ page }, testInfo) => {
  const scheme = testInfo.project.use.colorScheme;
  const { gear } = await load(page, testInfo);
  await gear.focus();
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('ArrowDown');
  const box = await page.locator(isDesktop(testInfo) ? '.ky-sidebar' : '.ky-mobile-head').boundingBox();
  await page.screenshot({ path: testInfo.outputPath(`menu-${isDesktop(testInfo) ? 'footer' : 'phone'}-${scheme}.png`), clip: isDesktop(testInfo) ? { x: 0, y: box.height - 420, width: 480, height: 420 } : { x: 0, y: 0, width: box.width + 32, height: 360 } });
});
