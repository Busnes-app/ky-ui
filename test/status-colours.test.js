import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { ciede2000, contrast, deltaE, evaluate, mix, readHalves } from '../scripts/check-status-colours.mjs';

test('CIEDE2000 matches Sharma, Wu and Dalal reference pairs', () => {
  for (const [a, b, expected] of [
    [[50, 2.6772, -79.7751], [50, 0, -82.7485], 2.0425],
    [[50, 2.5, 0], [50, 0, -2.5], 4.3065],
    [[50, -0.001, 2.49], [50, 0.0011, -2.49], 4.7461],
    [[60.2574, -34.0099, 36.2677], [60.4626, -34.1751, 39.4387], 1.2644],
    [[2.0776, 0.0795, -1.135], [0.9033, -0.0636, -0.5514], 0.9082],
  ]) assert.equal(ciede2000(a, b).toFixed(4), expected.toFixed(4));
  assert.equal(Math.round(deltaE('#000000', '#ffffff')), 100);
});

test('contrast and color-mix follow WCAG and CSS', () => {
  assert.equal(contrast('#000000', '#ffffff').toFixed(2), '21.00');
  assert.equal(mix('#ff0000', 12, '#ffffff'), '#ffe0e0');
});

test('all twelve halves pass, and the old rust-like danger fails', () => {
  assert.equal(readHalves().length, 12);
  assert.deepEqual(evaluate(readHalves()).failures, []);
  const css = readFileSync(new URL('../src/tokens.css', import.meta.url), 'utf8');
  const { failures } = evaluate(readHalves(css.replace(/--ky-danger-light: #[0-9a-f]{6}/, '--ky-danger-light: #b42318')));
  assert.ok(failures.some(f => f.startsWith('busnes-light: ΔE accent–danger')), failures.join('\n'));
});
