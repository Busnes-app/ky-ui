import test from 'node:test';
import assert from 'node:assert/strict';
import { stat } from 'node:fs/promises';
import { appMark, appMarks } from '../src/appmarks.js';

const ids = ['kypost', 'kycalendar', 'kydrive', 'kynotes', 'kymessage', 'kymessage-chat', 'kyidentity', 'kydns', 'kypulse', 'kyrecovery', 'kyyard'];

test('every suite client ID has a mark: a badge SVG or a 64px PNG', () => {
  assert.deepEqual(Object.keys(appMarks).sort(), [...ids].sort());
  assert.ok(Object.isFrozen(appMarks));
  assert.equal(appMarks['kymessage-chat'], appMarks.kymessage);
  for (const id of ids) {
    const mark = appMark(id);
    assert.equal(mark, appMarks[id]);
    if (mark.startsWith('data:image/svg+xml,')) {
      const svg = decodeURIComponent(mark.slice(19));
      assert.match(svg, /^<svg xmlns="http:\/\/www\.w3\.org\/2000\/svg" viewBox="163 162 927 928">.*<\/svg>$/, id);
      assert.doesNotMatch(svg, /<script|on\w+=|href/i, id);
    } else {
      const png = Buffer.from(mark.replace(/^data:image\/png;base64,/, ''), 'base64');
      assert.equal(png.subarray(1, 4).toString(), 'PNG', id);
      assert.deepEqual([png.readUInt32BE(16), png.readUInt32BE(20)], [64, 64], id);
    }
  }
});

test('unknown IDs get a letter badge that cannot carry markup', () => {
  const letter = id => decodeURIComponent(appMark(id).slice(19)).match(/<text[^>]*>(.*)<\/text>/)[1];
  assert.equal(letter('kytasks'), 'T');
  assert.equal(letter('grafana'), 'G');
  assert.equal(letter('ky'), 'K');
  assert.equal(letter('constructor'), 'C');
  assert.equal(letter('__proto__'), '?');
  assert.equal(letter('<script>'), '?');
  assert.equal(letter(''), '?');
});

test('the marks module stays under 60 KB', async () => {
  assert.ok((await stat(new URL('../src/appmarks.js', import.meta.url))).size < 60_000);
});
