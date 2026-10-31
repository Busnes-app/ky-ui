// Status colour gate for all twelve halves: WCAG text contrast on bg and panel, pill text on
// its soft tint, and CIEDE2000 distance between the accent and each status colour.
import { readFileSync } from 'node:fs';
import { THEME_CATALOG, THEME_PALETTES } from '../src/themes.js';

const STATUSES = ['danger', 'warning', 'success'];
const MIN_CONTRAST = 4.5;
const MIN_ACCENT_DANGER = 20;
// Warning and success must also read as different from the accent and from each other.
const MIN_OTHER = 10;

const rgb = hex => [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16));
const linear = v => (v /= 255) <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
const luminance = hex => rgb(hex).map(linear).reduce((sum, v, i) => sum + v * [0.2126, 0.7152, 0.0722][i], 0);
export const contrast = (a, b) => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};
// CSS color-mix(in srgb, a p%, b): per-channel interpolation of the encoded values.
export const mix = (a, p, b) => '#' + rgb(a).map((v, i) => Math.round(v * p / 100 + rgb(b)[i] * (1 - p / 100)).toString(16).padStart(2, '0')).join('');

function lab(hex) {
  const [r, g, b] = rgb(hex).map(linear);
  const xyz = [
    (0.4124564 * r + 0.3575761 * g + 0.1804375 * b) / 0.95047,
    0.2126729 * r + 0.7151522 * g + 0.072175 * b,
    (0.0193339 * r + 0.119192 * g + 0.9503041 * b) / 1.08883,
  ].map(t => t > 216 / 24389 ? Math.cbrt(t) : (24389 / 27 * t + 16) / 116);
  return [116 * xyz[1] - 16, 500 * (xyz[0] - xyz[1]), 200 * (xyz[1] - xyz[2])];
}

export const deltaE = (hexA, hexB) => ciede2000(lab(hexA), lab(hexB));

// Sharma, Wu and Dalal (2005), kL = kC = kH = 1.
export function ciede2000([L1, a1, b1], [L2, a2, b2]) {
  const rad = Math.PI / 180;
  const C = (Math.hypot(a1, b1) + Math.hypot(a2, b2)) / 2;
  const G = 0.5 * (1 - Math.sqrt(C ** 7 / (C ** 7 + 25 ** 7)));
  const [ap1, ap2] = [a1 * (1 + G), a2 * (1 + G)];
  const [Cp1, Cp2] = [Math.hypot(ap1, b1), Math.hypot(ap2, b2)];
  const hue = (b, a) => (Math.atan2(b, a) / rad + 360) % 360;
  const [hp1, hp2] = [hue(b1, ap1), hue(b2, ap2)];
  const dL = L2 - L1, dC = Cp2 - Cp1;
  let dh = Cp1 * Cp2 === 0 ? 0 : hp2 - hp1;
  if (dh > 180) dh -= 360; else if (dh < -180) dh += 360;
  const dH = 2 * Math.sqrt(Cp1 * Cp2) * Math.sin(dh * rad / 2);
  const Lm = (L1 + L2) / 2, Cm = (Cp1 + Cp2) / 2;
  let hm = hp1 + hp2;
  if (Cp1 * Cp2 !== 0) hm = Math.abs(hp1 - hp2) > 180 ? (hm + (hm < 360 ? 360 : -360)) / 2 : hm / 2;
  const T = 1 - 0.17 * Math.cos((hm - 30) * rad) + 0.24 * Math.cos(2 * hm * rad) + 0.32 * Math.cos((3 * hm + 6) * rad) - 0.2 * Math.cos((4 * hm - 63) * rad);
  const SL = 1 + 0.015 * (Lm - 50) ** 2 / Math.sqrt(20 + (Lm - 50) ** 2);
  const SC = 1 + 0.045 * Cm, SH = 1 + 0.015 * Cm * T;
  const RT = -2 * Math.sqrt(Cm ** 7 / (Cm ** 7 + 25 ** 7)) * Math.sin(60 * Math.exp(-(((hm - 275) / 25) ** 2)) * rad);
  return Math.sqrt((dL / SL) ** 2 + (dC / SC) ** 2 + (dH / SH) ** 2 + RT * (dC / SC) * (dH / SH));
}

// Busnes values and the shared status defaults live in tokens.css.
export function readHalves(css = readFileSync(new URL('../src/tokens.css', import.meta.url), 'utf8')) {
  const block = selector => {
    const start = css.indexOf(selector);
    if (start < 0) throw new Error(`tokens.css has no ${selector}`);
    return css.slice(start, css.indexOf('}', start));
  };
  const vars = text => Object.fromEntries([...text.matchAll(/--ky-([a-z-]+):\s*(#[0-9a-f]{6})\b/gi)].map(m => [m[1], m[2].toLowerCase()]));
  const shared = vars(block(':root {'));
  const tints = Object.fromEntries([...css.matchAll(/--ky-(\w+)-soft:\s*color-mix\(in srgb, var\(--\1, var\(--ky-\1\)\) (\d+)%, var\(--panel, var\(--ky-panel\)\)\)/g)].map(m => [m[1], Number(m[2])]));
  for (const status of STATUSES) if (!tints[status]) throw new Error(`tokens.css has no --ky-${status}-soft tint of --${status} over --panel`);
  const busnes = { 'busnes-light': vars(block(':root[data-ky-theme="busnes-light"] {')), 'busnes-dark': vars(block(':root[data-ky-theme="busnes-dark"] {')) };
  return THEME_CATALOG.map(({ id, scheme }) => {
    const palette = busnes[id] ?? THEME_PALETTES[id];
    const status = Object.fromEntries(STATUSES.map(s => [s, (busnes[id] ? undefined : palette[s]) ?? shared[`${s}-${scheme}`]]));
    return { id, bg: palette.bg, panel: palette.panel, accent: palette.accent, ...status, tints };
  });
}

export function evaluate(halves) {
  const failures = [], rows = [];
  for (const half of halves) {
    const checks = [];
    for (const s of STATUSES) {
      const soft = mix(half[s], half.tints[s], half.panel);
      checks.push([`${s} on bg`, contrast(half[s], half.bg), MIN_CONTRAST]);
      checks.push([`${s} on panel`, contrast(half[s], half.panel), MIN_CONTRAST]);
      checks.push([`${s} pill on ${s}-soft ${soft}`, contrast(half[s], soft), MIN_CONTRAST]);
    }
    checks.push(['ΔE accent–danger', deltaE(half.accent, half.danger), MIN_ACCENT_DANGER]);
    for (const [a, b] of [['accent', 'warning'], ['accent', 'success'], ['danger', 'warning'], ['danger', 'success'], ['warning', 'success']]) {
      checks.push([`ΔE ${a}–${b}`, deltaE(half[a], half[b]), MIN_OTHER]);
    }
    for (const [name, value, min] of checks) {
      rows.push({ id: half.id, check: name, value: Number(value.toFixed(2)), min });
      if (!(value >= min)) failures.push(`${half.id}: ${name} ${value.toFixed(2)} < ${min}`);
    }
  }
  return { rows, failures };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const { rows, failures } = evaluate(readHalves());
  if (process.argv.includes('--table')) for (const r of rows) console.log(`${r.id.padEnd(13)} ${r.check.padEnd(34)} ${String(r.value).padStart(6)}  (min ${r.min})`);
  if (failures.length) {
    console.error(failures.join('\n'));
    process.exit(1);
  }
  console.log(`status colours: ${rows.length} checks pass across ${new Set(rows.map(r => r.id)).size} halves`);
}
