import test from 'node:test';
import assert from 'node:assert/strict';
import { initMenuButton, initMenuButtons } from '../src/menu.js';

// Just enough DOM for the helper: attributes, listeners, focus, containment and the selectors it uses.
class Node {
  constructor(doc, attrs = {}, text = '') {
    Object.assign(this, { ownerDocument: doc, children: [], parent: null, listeners: {}, attrs: { ...attrs }, textContent: text, hidden: false, tabIndex: 0 });
  }
  append(...nodes) { for (const node of nodes) { node.parent = this; this.children.push(node); } return this; }
  getAttribute(name) { return this.attrs[name] ?? null; }
  setAttribute(name, value) { this.attrs[name] = String(value); }
  addEventListener(type, fn) { (this.listeners[type] ??= new Set()).add(fn); }
  removeEventListener(type, fn) { this.listeners[type]?.delete(fn); }
  dispatch(type, init = {}) {
    const event = { type, target: this, defaultPrevented: false, preventDefault() { this.defaultPrevented = true; }, ...init };
    for (let node = this; node; node = node.parent) for (const fn of node.listeners[type] ?? []) fn(event);
    return event;
  }
  contains(other) { for (let node = other; node; node = node.parent) if (node === this) return true; return false; }
  closest(selector) { for (let node = this; node && node.attrs; node = node.parent) if (node.matches(selector)) return node; return null; }
  matches(selector) { return selector === '[role="menuitem"]' && this.attrs.role === 'menuitem'; }
  all() { return this.children.flatMap(child => [child, ...child.all()]); }
  querySelectorAll(selector) {
    if (selector === '[role="menuitem"]') return this.all().filter(node => node.attrs.role === 'menuitem');
    return this.all().filter(node => node.attrs['aria-haspopup'] === 'menu' && node.attrs['aria-controls']);
  }
  focus() {
    const previous = this.ownerDocument.activeElement;
    if (previous === this) return;
    previous?.dispatch('focusout', { relatedTarget: this });
    this.ownerDocument.activeElement = this;
  }
  click() { this.dispatch('click'); }
}

function fixture() {
  const doc = new Node(null);
  doc.ownerDocument = doc;
  doc.getElementById = id => doc.all().find(node => node.attrs.id === id) ?? null;
  const body = new Node(doc);
  const button = new Node(doc, { 'aria-haspopup': 'menu', 'aria-controls': 'settings-menu', 'aria-expanded': 'false' });
  const menu = new Node(doc, { id: 'settings-menu', role: 'menu' });
  const items = ['Account', 'Phones & apps', 'Appearance', 'Sharing'].map(label => new Node(doc, { role: 'menuitem', href: '#' }, label));
  const signout = new Node(doc);
  menu.append(...items);
  doc.append(body.append(button, menu, signout));
  return { doc, body, button, menu, items, signout, key: (target, key, extra) => target.dispatch('keydown', { key, ...extra }) };
}

test('starts closed with items out of the tab order', () => {
  const { button, menu, items } = fixture();
  initMenuButton(button);
  assert.equal(button.getAttribute('aria-expanded'), 'false');
  assert.equal(menu.hidden, true);
  assert.deepEqual(items.map(item => item.tabIndex), [-1, -1, -1, -1]);
});

test('a click (Enter, Space or a pointer) toggles aria-expanded and focuses the first item', () => {
  const { doc, button, menu, items } = fixture();
  initMenuButton(button);
  button.focus();
  button.click();
  assert.equal(button.getAttribute('aria-expanded'), 'true');
  assert.equal(menu.hidden, false);
  assert.equal(doc.activeElement, items[0]);
  button.click();
  assert.equal(button.getAttribute('aria-expanded'), 'false');
  assert.equal(menu.hidden, true);
});

test('ArrowDown opens on the first item, ArrowUp on the last', () => {
  const { doc, button, items, key } = fixture();
  initMenuButton(button);
  assert.equal(key(button, 'ArrowDown').defaultPrevented, true);
  assert.equal(doc.activeElement, items[0]);
  key(doc.activeElement, 'Escape');
  key(button, 'ArrowUp');
  assert.equal(doc.activeElement, items[3]);
});

test('arrows wrap, Home and End jump, a letter jumps to its item', () => {
  const { doc, button, items, key } = fixture();
  initMenuButton(button);
  key(button, 'ArrowDown');
  key(doc.activeElement, 'ArrowUp');
  assert.equal(doc.activeElement, items[3]);
  key(doc.activeElement, 'ArrowDown');
  assert.equal(doc.activeElement, items[0]);
  key(doc.activeElement, 'ArrowDown');
  assert.equal(doc.activeElement, items[1]);
  key(doc.activeElement, 'End');
  assert.equal(doc.activeElement, items[3]);
  key(doc.activeElement, 'Home');
  assert.equal(doc.activeElement, items[0]);
  key(doc.activeElement, 'a');
  assert.equal(doc.activeElement, items[2]);
  key(doc.activeElement, 'p');
  assert.equal(doc.activeElement, items[1]);
  assert.equal(key(doc.activeElement, 'r', { ctrlKey: true }).defaultPrevented, false);
});

test('Escape closes and returns focus to the gear', () => {
  const { doc, button, menu, key } = fixture();
  initMenuButton(button);
  key(button, 'ArrowDown');
  assert.equal(key(doc.activeElement, 'Escape').defaultPrevented, true);
  assert.equal(menu.hidden, true);
  assert.equal(button.getAttribute('aria-expanded'), 'false');
  assert.equal(doc.activeElement, button);
});

test('Tab closes without stopping the browser moving focus on', () => {
  const { doc, button, menu, key } = fixture();
  initMenuButton(button);
  key(button, 'ArrowDown');
  assert.equal(key(doc.activeElement, 'Tab').defaultPrevented, false);
  assert.equal(menu.hidden, true);
});

test('focus leaving the gear and menu, or a pointer outside, closes it', () => {
  const { doc, body, button, menu, signout, key } = fixture();
  initMenuButton(button);
  key(button, 'ArrowDown');
  signout.focus();
  assert.equal(menu.hidden, true);
  key(button, 'ArrowDown');
  menu.dispatch('pointerdown');
  assert.equal(menu.hidden, false, 'a press inside stays open');
  body.dispatch('pointerdown');
  assert.equal(menu.hidden, true);
  assert.equal(button.getAttribute('aria-expanded'), 'false');
  assert.notEqual(doc.activeElement, button, 'an outside click leaves focus where it lands');
});

test('choosing an item closes the menu and puts focus on the gear; Space chooses too', () => {
  const { doc, button, menu, items, key } = fixture();
  initMenuButton(button);
  let chosen = 0;
  items[1].addEventListener('click', () => { chosen += 1; });
  key(button, 'ArrowDown');
  key(doc.activeElement, 'ArrowDown');
  assert.equal(key(doc.activeElement, ' ').defaultPrevented, true);
  assert.equal(chosen, 1);
  assert.equal(menu.hidden, true);
  assert.equal(doc.activeElement, button);
});

test('cleanup removes every listener; a missing menu is a no-op', () => {
  const { doc, button, menu, key } = fixture();
  const cleanup = initMenuButtons(doc);
  cleanup();
  for (const node of [button, menu, doc]) assert.deepEqual(Object.values(node.listeners).map(set => set.size).filter(Boolean), []);
  key(button, 'ArrowDown');
  assert.equal(menu.hidden, true);
  button.attrs['aria-controls'] = 'nowhere';
  assert.equal(typeof initMenuButton(button), 'function');
});
