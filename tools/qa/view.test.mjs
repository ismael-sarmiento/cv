// Local URL/state contracts; no browser, network or generated HTML changes.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { runInNewContext } from 'node:vm';

const source = (await readFile(new URL('../../js/view.js', import.meta.url), 'utf8')).replaceAll('export ', '');
function fixture(href, reduced = false) {
  const current = new URL(href), classes = new Set(), attributes = new Map(), scrolls = [];
  let click;
  const api = runInNewContext(source + '\n({setView,initView,isSummary});', {
    URL, URLSearchParams, location: current,
    history: { state: { keep: 'history state' }, replaceState(state, _title, url) {
      assert.equal(state.keep, 'history state'); current.href = url.href;
    } },
    document: {
      body: { classList: { toggle(name, on) { if (on) classes.add(name); else classes.delete(name); }, contains: name => classes.has(name) } },
      querySelector: () => ({ setAttribute: (key, value) => attributes.set(key, value) }),
      getElementById: id => ['timeline', 'story', 'contact', 'summary'].includes(id)
        ? { closest: () => ['timeline', 'story'].includes(id) ? {} : null } : null,
      addEventListener(_event, handler) { click = handler; },
    },
    matchMedia: () => ({ matches: reduced }), window: { scrollTo: options => scrolls.push({ ...options }) },
  });
  return { ...api, url: current, attributes, scrolls, button: () => click({ target: { closest: () => ({}) } }) };
}

test('direct summary links remove hidden anchors but retain visible sections and other URL parameters', () => {
  for (const [anchor, expected] of [['timeline', ''], ['story', ''], ['contact', '#contact'], ['summary', '#summary']]) {
    const h = fixture(`https://example.test/cv/?view=summary&lang=en&source=profile#${anchor}`);
    h.initView();
    assert.equal(h.isSummary(), true);
    assert.equal(h.url.hash, expected);
    assert.equal(h.url.searchParams.get('lang'), 'en');
    assert.equal(h.url.searchParams.get('source'), 'profile');
    assert.equal(h.attributes.get('aria-pressed'), 'true');
    assert.equal(h.scrolls.length, 0);
  }
});
test('mode button clears the old anchor in both directions and retains the scroll motion preference', () => {
  for (const reduced of [false, true]) {
    const h = fixture('https://example.test/cv/?lang=en#timeline', reduced);
    h.initView(); h.button();
    assert.equal(h.isSummary(), true); assert.equal(h.url.hash, '');
    assert.equal(h.url.searchParams.get('view'), 'summary');
    h.url.hash = '#contact'; h.button();
    assert.equal(h.isSummary(), false); assert.equal(h.url.hash, '');
    assert.equal(h.url.searchParams.has('view'), false); assert.equal(h.url.searchParams.get('lang'), 'en');
    assert.equal(h.attributes.get('aria-pressed'), 'false');
    assert.deepEqual(h.scrolls, [{ top: 0, behavior: reduced ? 'auto' : 'smooth' }, { top: 0, behavior: reduced ? 'auto' : 'smooth' }]);
  }
});
test('leaving summary programmatically preserves an anchor for normal detail navigation', () => {
  const h = fixture('https://example.test/cv/?view=summary&lang=en#timeline');
  h.setView(false);
  assert.equal(h.url.hash, '#timeline');
  assert.equal(h.url.searchParams.has('view'), false);
  assert.equal(h.url.searchParams.get('lang'), 'en');
  assert.equal(h.scrolls.length, 0);
});
