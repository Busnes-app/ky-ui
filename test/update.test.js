import test from 'node:test';
import assert from 'node:assert/strict';
import { buildAssets, pageAssets, watchForUpdate } from '../src/update.js';

// Node has no DOMParser, so these tests inject a stand-in that returns a fake document for each
// page. Real HTML parsing (comments, case, inline scripts, icons) is checked in Chromium by
// browser/update.spec.js.
const LOADED = '<html>loaded</html>';
const NEWER = '<html>newer</html>';
const ASSETS = {
  [LOADED]: ['/assets/index-AAAA.css', '/assets/ky-ui/themes-browser.js', '/assets/index-1111.js'],
  [NEWER]: ['/assets/index-AAAA.css', '/assets/ky-ui/themes-browser.js', '/assets/index-2222.js'],
};
const fakeDocument = (urls = [], noscript = []) => {
  const nodes = [...urls, ...noscript].map(url => ({ localName: url.endsWith('.css') ? 'link' : 'script', getAttribute: () => url, closest: () => (noscript.includes(url) ? {} : null) }));
  return { selectors: [], querySelectorAll(selector) { this.selectors.push(selector); return nodes; } };
};
class FakeParser {
  static calls = [];
  parseFromString(html, type) { FakeParser.calls.push([html, type]); return fakeDocument(ASSETS[html]); }
}

test('buildAssets parses the HTML as text/html and reads it as pageAssets reads the live page', () => {
  FakeParser.calls = [];
  assert.deepEqual(buildAssets(LOADED, new FakeParser()), ASSETS[LOADED]);
  assert.deepEqual(FakeParser.calls, [[LOADED, 'text/html']]);
  assert.deepEqual(buildAssets('<p>Signed out</p>', new FakeParser()), []);
  const doc = fakeDocument(['/a.js', '', '/b.css']);
  const parser = { parseFromString: () => doc };
  assert.deepEqual(buildAssets('<html>', parser), ['/a.js', '/b.css'], 'empty URLs are skipped, order kept');
  assert.deepEqual(doc.selectors, ['script[src], link[rel~="stylesheet"][href]']);
  // DOMParser runs without scripting, so <noscript> content is elements there and text live.
  assert.deepEqual(buildAssets('<html>', { parseFromString: () => fakeDocument(['/a.js'], ['/nojs.css']) }), ['/a.js'], 'noscript assets are skipped');
  assert.throws(() => buildAssets(LOADED), /DOMParser/, 'no parser outside a browser');
});

// Just enough DOM and window for the watcher: the start-up assets, events, a timer and the notice.
function fixture(html = LOADED) {
  const listeners = { doc: {}, view: {} };
  const on = bucket => (type, fn) => { (bucket[type] ??= new Set()).add(fn); };
  const off = bucket => (type, fn) => { bucket[type]?.delete(fn); };
  const element = tagName => ({
    tagName, children: [], attrs: {}, listeners: {}, textContent: '', removed: false,
    setAttribute(name, value) { this.attrs[name] = value; },
    append(...nodes) { this.children.push(...nodes); },
    addEventListener(type, fn) { this.listeners[type] = fn; },
    remove() { this.removed = true; },
  });
  const view = {
    DOMParser: FakeParser, navigator: { onLine: true }, reloads: 0, timer: null, cleared: false,
    location: { reload() { view.reloads++; } },
    setInterval(fn) { view.timer = fn; return 1; },
    clearInterval() { view.cleared = true; },
    timeouts: [],
    setTimeout(fn, ms) { view.timeouts.push({ fn, ms, cleared: false }); return view.timeouts.length; },
    clearTimeout(id) { if (view.timeouts[id - 1]) view.timeouts[id - 1].cleared = true; },
    addEventListener: on(listeners.view), removeEventListener: off(listeners.view),
  };
  const doc = {
    defaultView: view, visibilityState: 'visible', body: element('body'),
    querySelectorAll: () => fakeDocument(ASSETS[html]).querySelectorAll(), createElement: element,
    addEventListener: on(listeners.doc), removeEventListener: off(listeners.doc),
  };
  const requests = [];
  let served = { status: 200, type: 'text/html; charset=utf-8', body: LOADED };
  const fetch = async (url, init) => {
    requests.push({ url, init });
    if (served instanceof Error) throw served;
    if (served instanceof Promise) await served;
    return { ok: served.status >= 200 && served.status < 300, headers: { get: () => served.type }, text: async () => served.body };
  };
  const fire = async (bucket, type) => { for (const fn of listeners[bucket][type] ?? []) fn(); await new Promise(resolve => setImmediate(resolve)); };
  const notice = () => doc.body.children.find(node => node.attrs.role === 'status' || node.className === 'ky-update');
  return { doc, view, fetch, requests, listeners, fire, notice, serve: next => { served = next; } };
}

test('pageAssets reads scripts and stylesheets from the live document', () => {
  const { doc } = fixture();
  assert.deepEqual(pageAssets(doc), ASSETS[LOADED]);
});

test('a new build shows one polite notice with Reload and Dismiss; it never reloads by itself', async t => {
  t.mock.timers.enable({ apis: ['Date'] });
  const page = fixture();
  watchForUpdate({ name: 'KyIdentity', doc: page.doc, fetch: page.fetch });
  await page.fire('view', 'focus');
  assert.equal(page.requests.length, 0, 'no request before the interval has passed');

  t.mock.timers.tick(5 * 60_000);
  page.serve({ status: 200, type: 'text/html', body: NEWER });
  await page.fire('view', 'focus');
  assert.equal(page.requests.length, 1);
  const { signal, ...init } = page.requests[0].init;
  assert.deepEqual({ url: page.requests[0].url, init }, { url: '/', init: { cache: 'no-store', credentials: 'same-origin', redirect: 'manual', headers: { Accept: 'text/html' } } });
  assert.ok(signal instanceof AbortSignal, 'a request that never settles is aborted, so checking resumes');
  const notice = page.notice();
  assert.equal(notice.className, 'ky-update');
  assert.equal(notice.attrs.role, 'status');
  const [text, reload, dismiss] = notice.children;
  assert.equal(text.textContent, 'KyIdentity was updated. Reload to use the new version.');
  assert.equal(reload.textContent, 'Reload');
  assert.equal(reload.type, 'button');
  assert.equal(dismiss.attrs['aria-label'], 'Dismiss');
  assert.equal(page.view.reloads, 0);
  reload.listeners.click();
  assert.equal(page.view.reloads, 1);
  dismiss.listeners.click();
  assert.equal(notice.removed, true);

  // Checking stops once the notice is shown.
  assert.equal(page.view.cleared, true);
  for (const bucket of ['doc', 'view']) for (const set of Object.values(page.listeners[bucket])) assert.equal(set.size, 0);
});

test('the same build, an error page, a redirect, a failure or being offline stays quiet', async t => {
  t.mock.timers.enable({ apis: ['Date'] });
  const page = fixture();
  watchForUpdate({ doc: page.doc, fetch: page.fetch, interval: 1000 });
  const attempt = async (served, event = ['view', 'focus']) => {
    page.serve(served);
    t.mock.timers.tick(1000);
    await page.fire(...event);
  };
  await attempt({ status: 200, type: 'text/html', body: LOADED });
  await attempt({ status: 502, type: 'text/html', body: NEWER });
  await attempt({ status: 0, type: null, body: '' }); // An opaque redirect, such as to a sign-in page.
  await attempt({ status: 200, type: 'application/json', body: NEWER });
  await attempt({ status: 200, type: 'text/html', body: '<p>Maintenance</p>' });
  await attempt(new TypeError('Failed to fetch'));
  assert.equal(page.requests.length, 6);
  assert.equal(page.notice(), undefined);

  page.view.navigator.onLine = false;
  await attempt({ status: 200, type: 'text/html', body: NEWER });
  assert.equal(page.requests.length, 6, 'offline: no request');
  page.view.navigator.onLine = true;
  page.doc.visibilityState = 'hidden';
  page.view.timer();
  assert.equal(page.requests.length, 6, 'hidden tab: no request');
  page.doc.visibilityState = 'visible';
  await page.fire('doc', 'visibilitychange');
  assert.equal(page.requests.length, 7, 'becoming visible checks');
  assert.equal(page.notice().children[0].textContent, 'This app was updated. Reload to use the new version.');
});

test('the timer checks a visible tab, and the cleanup stops checking and removes the notice', async t => {
  t.mock.timers.enable({ apis: ['Date'] });
  const page = fixture();
  const stop = watchForUpdate({ doc: page.doc, fetch: page.fetch, url: '/app/', interval: 1000 });
  page.serve({ status: 200, type: 'text/html', body: NEWER });
  t.mock.timers.tick(1000);
  page.view.timer();
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(page.requests[0].url, '/app/');
  const notice = page.notice();
  stop();
  assert.equal(notice.removed, true);
});

test('a check still in flight when the cleanup runs shows nothing', async t => {
  t.mock.timers.enable({ apis: ['Date'] });
  const page = fixture();
  const stop = watchForUpdate({ doc: page.doc, fetch: page.fetch, interval: 1000 });
  let respond;
  page.serve(new Promise(resolve => { respond = resolve; }));
  t.mock.timers.tick(1000);
  page.view.timer();
  assert.equal(page.requests.length, 1);
  stop();
  page.serve({ status: 200, type: 'text/html', body: NEWER });
  respond();
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(page.notice(), undefined);
});

test('a request that never settles is aborted after 30 seconds, and the next check goes ahead', async t => {
  t.mock.timers.enable({ apis: ['Date'] });
  const page = fixture();
  watchForUpdate({ doc: page.doc, fetch: page.fetch, interval: 1000 });
  let hung;
  page.serve(new Promise((resolve, reject) => { hung = reject; }));
  t.mock.timers.tick(1000);
  page.view.timer();
  const { signal } = page.requests[0].init;
  signal.addEventListener('abort', () => hung(signal.reason));
  t.mock.timers.tick(1000);
  page.view.timer();
  assert.equal(page.requests.length, 1, 'busy while the first request hangs');
  const [timeout] = page.view.timeouts;
  assert.equal(timeout.ms, 30_000);
  timeout.fn();
  assert.equal(signal.aborted, true);
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(timeout.cleared, true);
  page.serve({ status: 200, type: 'text/html', body: NEWER });
  t.mock.timers.tick(1000);
  page.view.timer();
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(page.requests.length, 2);
  assert.ok(page.notice(), 'the check after the timeout found the new build');
});
