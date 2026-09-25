export const THEMES = Object.freeze(["system", "busnes-light", "busnes-dark"]);
export const THEME_STORAGE_KEY = "ky-theme";

export function normalizeTheme(value) {
  return THEMES.includes(value) ? value : "system";
}

export function resolveTheme(choice, prefersDark = false) {
  const normalized = normalizeTheme(choice);
  return normalized === "system"
    ? (prefersDark ? "busnes-dark" : "busnes-light")
    : normalized;
}

function safeStorage(storage) {
  return storage && (typeof storage.getItem === "function" || typeof storage.setItem === "function")
    ? storage
    : null;
}

export function readStoredTheme(storage = globalThis.localStorage) {
  const candidate = safeStorage(storage);
  let value = null;
  try {
    if (typeof candidate?.getItem === "function") value = candidate.getItem(THEME_STORAGE_KEY);
  } catch {
    value = null;
  }
  return normalizeTheme(value);
}

export function applyTheme(choice = readStoredTheme(), options = {}) {
  const document = options.document ?? globalThis.document;
  if (!document?.documentElement) return "system";

  const storage = safeStorage(options.storage ?? globalThis.localStorage);
  const normalized = normalizeTheme(choice);
  const prefersDark = options.prefersDark ?? globalThis.matchMedia?.("(prefers-color-scheme: dark)")?.matches ?? false;
  const resolved = resolveTheme(normalized, prefersDark);

  if (normalized === "system") delete document.documentElement.dataset.kyTheme;
  else document.documentElement.dataset.kyTheme = resolved;
  document.documentElement.style.colorScheme = resolved === "busnes-dark" ? "dark" : "light";
  if (options.persist !== false && typeof storage?.setItem === "function") {
    try {
      storage.setItem(THEME_STORAGE_KEY, normalized);
    } catch {
      // Storage can be unavailable in private or restricted browser contexts.
    }
  }
  return resolved;
}
