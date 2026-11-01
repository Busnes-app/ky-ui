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
  const ratios = await page.locator('.ky-auth-brand p, .ky-auth-check, .ky-auth-link, .ky-auth-help, .ky-auth-submit, .ky-user-name, .ky-user-role, .ky-user-signout, .ky-icon-button, .ky-license-link, .ky-page-lede, .ky-page-action, .ky-about-version, .ky-about-meta').evaluateAll(els => {
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

// Account footer and Settings (0.10.0). The footer shows on desktop; the phone header holds the
// same icon buttons at 720px and narrower.
const isDesktop = testInfo => testInfo.project.name.endsWith('-1280');
const accountButtons = (page, testInfo) => page.locator(isDesktop(testInfo) ? '.ky-user-actions .ky-icon-button' : '.ky-mobile-actions .ky-icon-button');

test('account footer is one row at the sidebar width: identity, then Settings and Sign out', async ({ page }, testInfo) => {
  test.skip(!isDesktop(testInfo), 'the footer is desktop only');
  await page.goto('/');
  const row = await page.locator('.ky-sidebar .ky-user').evaluate(el => {
    const rect = node => node.getBoundingClientRect();
    const sidebar = el.closest('.ky-sidebar');
    const pad = getComputedStyle(sidebar);
    const [copy, actions] = [el.querySelector('.ky-user-copy'), el.querySelector('.ky-user-actions')];
    const lines = [...copy.children].map(line => ({ cls: line.className, overflow: getComputedStyle(line).textOverflow, clipped: line.scrollWidth > line.clientWidth }));
    return {
      width: rect(el).width, inner: sidebar.clientWidth - parseFloat(pad.paddingLeft) - parseFloat(pad.paddingRight),
      right: rect(el).right, copy: rect(copy).toJSON(), actions: rect(actions).toJSON(), lines,
      names: [...actions.querySelectorAll('.ky-icon-button')].map(button => button.getAttribute('aria-label')),
      licence: rect(el.parentElement.querySelector('.ky-license-link')).top, bottom: rect(el).bottom,
    };
  });
  expect(row.width).toBe(row.inner);
  expect(Math.abs((row.copy.top + row.copy.bottom) / 2 - (row.actions.top + row.actions.bottom) / 2)).toBeLessThanOrEqual(1);
  expect(row.actions.right).toBe(row.right);
  expect(row.copy.right).toBeLessThanOrEqual(row.actions.left - 8);
  expect(row.names).toEqual(['Settings', 'Sign out']);
  // The fixture name is too long for the row: it ellipsizes, and the role would too.
  expect(row.lines).toEqual([
    { cls: 'ky-user-name', overflow: 'ellipsis', clipped: true },
    { cls: 'ky-user-role', overflow: 'ellipsis', clipped: false },
  ]);
  expect(row.licence).toBeGreaterThanOrEqual(row.bottom);
});

test('account icon buttons have names, titles and at least 40px targets', async ({ page }, testInfo) => {
  await page.goto('/');
  await expect(page.locator('.ky-sidebar').getByRole('button', { name: 'Settings', exact: true })).toBeVisible();
  await expect(page.locator('.ky-sidebar').getByRole('button', { name: 'Sign out', exact: true })).toBeVisible();
  const buttons = await accountButtons(page, testInfo).evaluateAll(els => els.map(el => {
    const r = el.getBoundingClientRect();
    return { name: el.getAttribute('aria-label'), title: el.title, text: el.innerText, icon: el.querySelector('svg')?.getAttribute('aria-hidden'), w: r.width, h: r.height };
  }));
  expect(buttons.map(button => button.name)).toEqual(['Settings', 'Sign out']);
  for (const button of buttons) expect(button).toEqual({ name: button.name, title: button.name, text: '', icon: 'true', w: 40, h: 40 });
});

test.describe('on a touch screen', () => {
  test.use({ hasTouch: true, isMobile: true });
  test('account icon buttons grow to 44px', async ({ page }, testInfo) => {
    await page.goto('/');
    expect(await page.evaluate(() => matchMedia('(pointer: coarse)').matches)).toBe(true);
    const sizes = await accountButtons(page, testInfo).evaluateAll(els => els.map(el => [el.offsetWidth, el.offsetHeight]));
    expect(sizes).toEqual([[44, 44], [44, 44]]);
  });
});

test('account icon buttons and Settings tabs show an unclipped focus ring', async ({ page }, testInfo) => {
  await page.goto('/');
  for (const target of await accountButtons(page, testInfo).all()) {
    await target.focus();
    const ring = await target.evaluate(el => {
      const style = getComputedStyle(el);
      const probe = document.createElement('span');
      probe.style.color = 'var(--accent)';
      document.body.append(probe);
      const accent = getComputedStyle(probe).color;
      probe.remove();
      // The ring's outer box must stay inside every ancestor that clips.
      const r = el.getBoundingClientRect();
      const grow = parseFloat(style.outlineOffset) + parseFloat(style.outlineWidth);
      const clipped = [];
      for (let node = el.parentElement; node && node !== document.body; node = node.parentElement) {
        const s = getComputedStyle(node);
        if (s.overflowX === 'visible' && s.overflowY === 'visible') continue;
        const c = node.getBoundingClientRect();
        if (r.left - grow < c.left || r.right + grow > c.right || r.top - grow < c.top || r.bottom + grow > c.bottom) clipped.push(node.className);
      }
      return { visible: el.matches(':focus-visible'), style: style.outlineStyle, width: style.outlineWidth, accent: style.outlineColor === accent, clipped };
    });
    expect(ring, await target.getAttribute('aria-label')).toEqual({ visible: true, style: 'solid', width: '2px', accent: true, clipped: [] });
  }
  // Tabs scroll, so each ring sits inside its tab. Chromium leaves a partly visible tab where
  // it is on focus, as in the phone navigation, so the check is that most of it shows.
  for (const tab of await page.locator('.ky-settings-tabs > .ky-nav-item').all()) {
    await tab.focus();
    const ring = await tab.evaluate(el => {
      const style = getComputedStyle(el);
      const [r, row] = [el.getBoundingClientRect(), el.parentElement.getBoundingClientRect()];
      const shown = Math.min(r.right, row.right) - Math.max(r.left, row.left);
      return { visible: el.matches(':focus-visible'), style: style.outlineStyle, width: style.outlineWidth, offset: style.outlineOffset, mostlyShown: shown >= r.width * 0.75 };
    });
    expect(ring, await tab.innerText()).toEqual({ visible: true, style: 'solid', width: '2px', offset: '-2px', mostlyShown: true });
  }
});

test('the open Settings button reads like the current navigation row, not an accent fill', async ({ page }, testInfo) => {
  await page.goto('/');
  const look = locator => locator.evaluate(el => {
    const style = getComputedStyle(el);
    return { background: style.backgroundColor, bar: style.boxShadow };
  });
  const settings = accountButtons(page, testInfo).first();
  await expect(settings).toHaveAttribute('aria-current', 'page');
  const current = await look(page.locator('body > nav .ky-nav-item[aria-current="page"]'));
  const button = await look(settings);
  expect(button).toEqual(current);
  expect(button.bar).toContain(isDesktop(testInfo) ? '3px 0px 0px 0px inset' : '0px -3px 0px 0px inset');
  expect(button.background).not.toBe(await page.locator('.ky-page-head .ky-page-action').evaluate(el => getComputedStyle(el).backgroundColor));
});

test('long names never overflow the footer in any palette half', async ({ page }, testInfo) => {
  test.skip(!isDesktop(testInfo), 'the footer is desktop only');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  const ids = await page.locator('.ky-appearance-radio').evaluateAll(els => els.map(el => el.value).filter(id => id !== 'system' && !id.endsWith('-pair')));
  expect(ids).toHaveLength(12);
  for (const id of ids) {
    await page.locator('#theme').selectOption(id);
    const fit = await page.locator('.ky-sidebar .ky-user').evaluate(el => {
      const box = el.getBoundingClientRect();
      const parts = [...el.querySelectorAll('.ky-user-copy, .ky-user-name, .ky-user-role, .ky-icon-button')].map(part => [part.className, part.getBoundingClientRect()]);
      return {
        scrolls: el.scrollWidth > el.clientWidth,
        outside: parts.filter(([, r]) => r.left < box.left || r.right > box.right).map(([name]) => name),
        buttons: [...el.querySelectorAll('.ky-icon-button')].map(b => b.offsetWidth),
        nameShown: el.querySelector('.ky-user-name').clientWidth,
      };
    });
    expect(fit, id).toEqual({ scrolls: false, outside: [], buttons: [40, 40], nameShown: fit.nameShown });
    expect(fit.nameShown, id).toBeGreaterThanOrEqual(80);
  }
});

test('Settings page: head, then section tabs in order, then the section', async ({ page }) => {
  await page.goto('/');
  const head = await page.locator('.ky-page-head').boundingBox();
  const tabs = page.getByRole('navigation', { name: 'Settings sections' });
  const tabsBox = await tabs.boundingBox();
  const section = await page.getByRole('region', { name: 'Phones & apps' }).boundingBox();
  expect(tabsBox.y).toBeGreaterThan(head.y + head.height);
  expect(section.y).toBeGreaterThanOrEqual(tabsBox.y + tabsBox.height);
  const items = await tabs.locator('.ky-nav-item').evaluateAll(els => els.map(el => ({ text: el.textContent, y: el.getBoundingClientRect().y, current: el.getAttribute('aria-current'), bar: getComputedStyle(el).boxShadow })));
  expect(items.map(item => item.text).slice(0, 3)).toEqual(['Account', 'Phones & apps', 'Appearance']);
  for (const item of items) {
    expect(item.y).toBe(items[0].y);
    if (item.current) expect(item.bar).toContain('0px -3px 0px 0px inset');
    else expect(item.bar).toBe('none');
  }
  expect(items.filter(item => item.current)).toHaveLength(1);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test('pre-0.10 user block keeps its text Sign out on its own full-width row', async ({ page }) => {
  await page.goto('/');
  const legacy = page.getByRole('region', { name: 'Legacy user block' });
  const signout = legacy.getByRole('button', { name: 'Sign out', exact: true });
  await expect(signout).toBeVisible();
  const [user, copy, out] = await Promise.all([legacy.locator('.ky-user'), legacy.locator('.ky-user-copy'), signout].map(l => l.boundingBox()));
  expect(out.y).toBeGreaterThanOrEqual(copy.y + copy.height);
  expect(out.width).toBe(user.width);
  expect(await legacy.locator('.ky-user').evaluate(el => el.scrollWidth <= el.clientWidth)).toBe(true);
});
