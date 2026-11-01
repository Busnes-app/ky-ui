import { test, expect } from '@playwright/test';

// Drift rules A1-A8: positions are measured from the frame's own box, at KyCalendar's 1440x900.
const box = locator => locator.boundingBox();
const desktop = async (page, testInfo) => {
  test.skip(!testInfo.project.name.endsWith('-1280'), 'desktop geometry');
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/');
  await page.locator('.ky-app').evaluate(el => el.scrollIntoView({ block: 'start' }));
};
const phone = async (page, testInfo) => {
  test.skip(!testInfo.project.name.endsWith('-390'), 'phone geometry');
  await page.goto('/');
  await page.locator('.ky-app').evaluate(el => el.scrollIntoView({ block: 'start' }));
};

test('A1 brand row sits at KyCalendar positions with nothing under it', async ({ page }, testInfo) => {
  await desktop(page, testInfo);
  const app = await box(page.locator('.ky-app'));
  const brand = await box(page.locator('.ky-brand'));
  const mark = await box(page.locator('.ky-brand > svg'));
  const first = await box(page.locator('.ky-nav > .ky-nav-item').first());
  expect(Math.abs(brand.y + brand.height / 2 - app.y - 43)).toBeLessThanOrEqual(2);
  expect(Math.abs(first.y + first.height / 2 - app.y - 107)).toBeLessThanOrEqual(2);
  expect([mark.width, mark.height]).toEqual([28, 28]);
  expect(mark.x - app.x).toBe(24);
  // The brand row holds the mark and the name only; the nav follows it directly.
  expect(await page.locator('.ky-brand').evaluate(el => [...el.children].map(child => child.tagName))).toEqual(['svg', 'SPAN']);
  expect(await page.locator('.ky-mobile-head').evaluate(el => el.nextElementSibling.className)).toBe('ky-nav');
});

test('A2 nav rows: fixed icon box, row height, plain section labels, bar on the active row only', async ({ page }, testInfo) => {
  await desktop(page, testInfo);
  const items = page.locator('.ky-nav > .ky-nav-item');
  const sidebar = await box(page.locator('.ky-sidebar'));
  const rows = await items.evaluateAll(els => els.map(el => {
    const r = el.getBoundingClientRect();
    const icon = el.querySelector('svg').getBoundingClientRect();
    const label = el.querySelector('span').getBoundingClientRect();
    const style = getComputedStyle(el);
    return {
      x: r.x, y: r.y, height: r.height, iconX: icon.x - r.x, iconW: icon.width, iconH: icon.height, labelX: label.x - r.x,
      size: style.fontSize, bar: style.boxShadow, bg: style.backgroundColor, color: style.color,
      iconColor: getComputedStyle(el.querySelector('svg')).color, current: el.getAttribute('aria-current'),
    };
  }));
  const accent = await page.evaluate(() => {
    const probe = document.createElement('span');
    probe.style.color = 'var(--accent)';
    document.body.append(probe);
    const color = getComputedStyle(probe).color;
    probe.remove();
    return color;
  });
  expect(rows.length).toBe(4);
  for (const row of rows) {
    expect(row).toMatchObject({ height: 40, iconX: 16, iconW: 16, iconH: 16, labelX: 40, size: '14px' });
    expect(row.x - sidebar.x).toBe(16);
    expect(row.iconColor).toBe(row.color);
    expect(row.iconColor).not.toBe(accent);
    if (row.current) expect(row.bar).toContain('inset');
    else expect([row.bar, row.bg]).toEqual(['none', 'rgba(0, 0, 0, 0)']);
  }
  expect(rows[1].y - rows[0].y).toBe(44);
  const section = page.locator('.ky-nav-section');
  await expect(section).toHaveText('Administration');
  expect(await section.evaluate(el => [el.tagName, el.children.length, !!el.closest('details, button')])).toEqual(['P', 0, false]);
});

test('A3 content starts at sidebar plus inset and the page head spans it', async ({ page }, testInfo) => {
  await desktop(page, testInfo);
  const app = await box(page.locator('.ky-app'));
  const content = page.locator('.ky-content');
  const head = await box(page.locator('.ky-page-head'));
  expect(head.x - app.x).toBe(272);
  const inner = await content.evaluate(el => {
    const style = getComputedStyle(el);
    return { width: el.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight), max: style.maxWidth, inset: style.paddingLeft };
  });
  expect(head.width).toBe(inner.width);
  expect(inner).toMatchObject({ inset: '32px', max: '1216px' });
});

test('A4 sign-in theme picker: KyCalendar control, top-right at a fixed offset', async ({ page }, testInfo) => {
  await desktop(page, testInfo);
  const auth = page.getByRole('region', { name: 'Sign-in screen' });
  const frame = await box(auth);
  const picker = auth.getByRole('combobox', { name: 'Color theme' });
  const r = await box(picker);
  expect(r.y - frame.y).toBe(16);
  expect(frame.x + frame.width - (r.x + r.width)).toBe(16);
  expect(r.height).toBe(40);
  const style = await picker.evaluate(el => {
    const s = getComputedStyle(el);
    return [s.paddingRight, s.paddingLeft, s.borderTopWidth, s.borderTopStyle, s.borderRadius, s.fontSize, s.appearance, s.backgroundImage.match(/linear-gradient/g)?.length];
  });
  expect(style).toEqual(['40px', '12px', '1px', 'solid', '8px', '14px', 'none', 2]);
});

test('A5-A7 sign-in brand keeps its offset whatever the card holds', async ({ page }, testInfo) => {
  await desktop(page, testInfo);
  const offsets = [];
  for (const name of ['Sign-in screen', 'Password-only sign-in']) {
    const auth = page.getByRole('region', { name });
    const [frame, mark, card, check] = await Promise.all([auth, auth.locator('.ky-auth-brand > svg'), auth.locator('.ky-auth-card'), auth.locator('.ky-auth-check')].map(box));
    offsets.push({ mark: mark.y - frame.y, card: card.height, check: check.height });
    // A6/A7: no licence or footer on sign-in; at most one help line.
    await expect(auth.locator('.ky-license-link, footer')).toHaveCount(0);
    expect(await auth.locator('.ky-auth-help').count()).toBeLessThanOrEqual(1);
  }
  const [full, short] = offsets;
  expect(short.card).toBeLessThan(full.card);
  expect(short.mark).toBe(full.mark);
  // KyCalendar's mark top is 241px at 1440x900.
  expect(Math.abs(full.mark - 241)).toBeLessThanOrEqual(2);
  // A6: an empty check line keeps the passed line's height.
  expect(short.check).toBe(full.check);
  await expect(page.locator('.ky-auth-check[data-ky-state="passed"]')).toHaveText('Browser check passed');
  const help = await box(page.locator('.ky-auth-help'));
  expect(help.height).toBeLessThan(2 * 13 * 1.5);
});

test('A8 phone header: one row, scrolling tabs with an edge fade, licence after the content', async ({ page }, testInfo) => {
  await phone(page, testInfo);
  const head = page.locator('.ky-mobile-head');
  const headBox = await box(head);
  const brand = await box(head.locator('.ky-brand'));
  const settings = head.getByRole('button', { name: 'Settings', exact: true });
  const signout = head.getByRole('button', { name: 'Sign out', exact: true });
  await expect(settings).toBeVisible();
  await expect(settings).toHaveAttribute('aria-current', 'page');
  await expect(signout).toBeVisible();
  expect(await settings.innerText()).toBe('');
  expect(await signout.innerText()).toBe('');
  const [gear, out] = [await box(settings), await box(signout)];
  // Brand, Settings, Sign out: one row, Sign out last at the head's end edge.
  for (const icon of [gear, out]) expect(Math.abs(icon.y + icon.height / 2 - (brand.y + brand.height / 2))).toBeLessThanOrEqual(1);
  expect(gear.x).toBeGreaterThan(brand.x + brand.width);
  expect(out.x).toBeGreaterThan(gear.x + gear.width);
  expect(out.x + out.width).toBe(headBox.x + headBox.width);
  expect(headBox.height).toBe(40);
  await expect(page.locator('.ky-sidebar .ky-user')).toBeHidden();
  await expect(page.locator('.ky-sidebar .ky-license-link')).toBeHidden();
  await expect(page.locator('.ky-nav-section')).toBeHidden();

  const nav = page.locator('.ky-nav');
  const navBox = await box(nav);
  expect(navBox.y).toBeGreaterThanOrEqual((await box(head)).y + 40);
  const tabs = await nav.locator('.ky-nav-item').evaluateAll(els => els.map(el => {
    const r = el.getBoundingClientRect();
    const icon = el.querySelector('svg').getBoundingClientRect();
    const label = el.querySelector('span').getBoundingClientRect();
    return { y: r.y, height: r.height, side: icon.right <= label.left };
  }));
  for (const tab of tabs) expect(tab).toEqual({ y: tabs[0].y, height: 40, side: true });
  expect(await nav.evaluate(el => [getComputedStyle(el).overflowX, el.scrollWidth > el.clientWidth])).toEqual(['auto', true]);
  const fade = () => nav.evaluate(el => [getComputedStyle(el).getPropertyValue('--ky-fade-start'), getComputedStyle(el).getPropertyValue('--ky-fade-end')]);
  await expect.poll(fade).toEqual(['0px', '56px']);
  await nav.evaluate(el => { el.scrollLeft = el.scrollWidth; });
  await expect.poll(fade).toEqual(['56px', '0px']);

  const foot = page.locator('.ky-content-foot .ky-license-link');
  await expect(foot).toBeVisible();
  const footBox = await box(foot);
  expect(footBox.y).toBeGreaterThan(navBox.y + navBox.height);
  const last = await box(page.locator('.ky-content .fixture-record').last());
  expect(footBox.y).toBeGreaterThan(last.y + last.height);
  expect(footBox.x - (await box(page.locator('.ky-app'))).x).toBe(16);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test('A8 phone tabs draw the focus ring inside the scrolling row', async ({ page }, testInfo) => {
  await phone(page, testInfo);
  const first = page.locator('.ky-nav > .ky-nav-item').first();
  await first.focus();
  await expect(first).toBeFocused();
  // The row clips overflow, so a ring drawn outside the tab would be cut off.
  expect(await first.evaluate(el => getComputedStyle(el).outlineOffset)).toBe('-2px');
});

test('desktop shows no phone parts and no tab fade', async ({ page }, testInfo) => {
  await desktop(page, testInfo);
  await expect(page.locator('.ky-mobile-actions')).toBeHidden();
  await expect(page.locator('.ky-content-foot')).toBeHidden();
  await expect(page.locator('.ky-sidebar .ky-user-actions')).toBeVisible();
  expect(await page.locator('.ky-nav').evaluate(el => getComputedStyle(el).maskImage)).toBe('none');
});

test('drift evidence captures', async ({ page }, testInfo) => {
  const scheme = testInfo.project.use.colorScheme;
  const width = testInfo.project.name.endsWith('-1280') ? 1440 : 390;
  await page.setViewportSize({ width, height: 900 });
  await page.goto('/');
  const shot = (part, locator) => locator.screenshot({ path: testInfo.outputPath(`drift-${part}-${width}-${scheme}.png`), animations: 'disabled' });
  await shot('signin', page.getByRole('region', { name: 'Sign-in screen' }));
  await shot('signin-short', page.getByRole('region', { name: 'Password-only sign-in' }));
  await page.locator('.ky-app').evaluate(el => el.scrollIntoView({ block: 'start' }));
  await shot('app', page.locator('.ky-app'));
});
