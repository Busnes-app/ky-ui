import test from "node:test";
import assert from "node:assert/strict";
import { applyTheme, normalizeTheme, readStoredTheme, resolveTheme } from "../src/theme.js";

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
