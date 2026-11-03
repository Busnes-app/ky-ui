import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

// The browser projects are Chromium, which has scroll timelines, so the fallback is checked here.
// Outside the @supports block, the 0s fill-both fade would hold its last frame and mask the first tab.
test('the phone tab fade applies only where scroll timelines are supported', async () => {
  const css = await readFile(new URL('../src/navigation.css', import.meta.url), 'utf8');
  const start = css.indexOf('@supports (animation-timeline: scroll())');
  assert.ok(start > 0, 'the fade is gated');
  let end = css.indexOf('{', start);
  for (let depth = 1; depth; ) depth += { '{': 1, '}': -1 }[css[++end]] ?? 0;
  for (const property of ['mask-image', 'animation', 'animation-timeline']) {
    const uses = [...css.matchAll(new RegExp(`^\\s*${property}:`, 'gm'))].map(match => match.index);
    assert.ok(uses.length > 0, property);
    for (const at of uses) assert.ok(at > start && at < end, `${property} outside the @supports block`);
  }
});
