import test from "node:test";
import assert from "node:assert/strict";
import { applyTheme, normalizeTheme, readStoredTheme, resolveTheme, readChoice, saveChoice, watchChoice } from "../src/theme.js";

test("restricted storage getter cannot prevent theme application", () => {
  const original = Object.getOwnPropertyDescriptor(globalThis, 'localStorage');
  Object.defineProperty(globalThis, 'localStorage', { configurable: true, get() { throw new Error('denied'); } });
  try {
    assert.equal(readChoice('existing-product-key'), null);
    assert.doesNotThrow(() => saveChoice('existing-product-key', 'Patina'));
    const root = { dataset: {}, style: {} };
    assert.equal(applyTheme(undefined, { document: { documentElement: root }, prefersDark: true }), 'busnes-dark');
  } finally {
    if (original) Object.defineProperty(globalThis, 'localStorage', original);
    else delete globalThis.localStorage;
  }
});

test("theme watcher follows OS only without a choice and disposes listeners", (t) => {
  const windowEvents = new EventTarget();
  const media = new EventTarget();
  for (const [key, value] of Object.entries({ addEventListener: windowEvents.addEventListener.bind(windowEvents), removeEventListener: windowEvents.removeEventListener.bind(windowEvents), matchMedia: () => media })) {
    const original = Object.getOwnPropertyDescriptor(globalThis, key);
    Object.defineProperty(globalThis, key, { configurable: true, value });
    t.after(() => { if (original) Object.defineProperty(globalThis, key, original); else delete globalThis[key]; });
  }
  let explicit = false, calls = 0;
  const stop = watchChoice('product-theme', () => calls++, () => explicit);
  media.dispatchEvent(new Event('change'));
  explicit = true;
  media.dispatchEvent(new Event('change'));
  const event = new Event('storage');
  Object.defineProperty(event, 'key', { value: 'product-theme' });
  windowEvents.dispatchEvent(event);
  assert.equal(calls, 2);
  stop();
  windowEvents.dispatchEvent(event);
  assert.equal(calls, 2);
});

test("normalizes unknown choices to system", () => {
  assert.equal(normalizeTheme("unknown"), "system");
  assert.equal(normalizeTheme("busnes-dark"), "busnes-dark");
});

test("resolves system against the operating system preference", () => {
  assert.equal(resolveTheme("system", false), "busnes-light");
  assert.equal(resolveTheme("system", true), "busnes-dark");
  assert.equal(resolveTheme("busnes-light", true), "busnes-light");
});

test("reads only the supported stored value", () => {
  assert.equal(readStoredTheme({ getItem: () => "busnes-dark" }), "busnes-dark");
  assert.equal(readStoredTheme({ getItem: () => "patina" }), "system");
});

test("applies and persists a theme without requiring a browser", () => {
  const root = { dataset: {}, style: {} };
  const writes = [];
  const resolved = applyTheme("busnes-dark", {
    document: { documentElement: root },
    storage: { setItem: (key, value) => writes.push([key, value]) },
    prefersDark: false,
  });

  assert.equal(resolved, "busnes-dark");
  assert.equal(root.dataset.kyTheme, "busnes-dark");
  assert.equal(root.style.colorScheme, "dark");
  assert.deepEqual(writes, [["ky-theme", "busnes-dark"]]);
});

test("leaves system mode on the OS-driven CSS path", () => {
  const root = { dataset: { kyTheme: "busnes-dark" }, style: {} };
  assert.equal(applyTheme("system", {
    document: { documentElement: root },
    persist: false,
    prefersDark: true,
  }), "busnes-dark");
  assert.equal("kyTheme" in root.dataset, false);
});
