// The published site: reference pages made from the viewer's tables, each a real page a search can land on.
import { test, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { sitePages } from '../site.mjs';
import { loadComponent } from './load.mjs';

const pages = sitePages();
const Component = loadComponent();
const proto = new Component({});
const refPages = Object.entries(pages).filter(([path]) => path !== 'index.html');
const text = (html) => html.replace(/<style[\s\S]*?<\/style>/g, '').replace(/<[^>]+>/g, ' ').replace(/&amp;/g, '&').replace(/\s+/g, ' ');
const hrefs = (html) => [...html.matchAll(/href="([^"]+)"/g)].map(m => m[1].replace(/&amp;/g, '&'));

test('there is the viewer, and a page per protocol', () => {
  assert.deepEqual(Object.keys(pages), ['index.html', 'spp/index.html', 'tm/index.html', 'tc/index.html', 'sdls/index.html', 'sdls-ep/index.html']);
  assert.match(pages['index.html'], /__bundler_thumbnail/, 'the index is the viewer itself');
});

test('each page has its own title, description and address', () => {
  const titles = new Set(), descriptions = new Set();
  for (const [path, html] of refPages) {
    const title = html.match(/<title>(.*?)<\/title>/)[1], description = html.match(/<meta name="description" content="([^"]+)">/)[1];
    titles.add(title); descriptions.add(description);
    assert.ok(description.length >= 50 && description.length <= 160, path + ': ' + description.length);
    assert.match(title, /CCSDS \d{3}\.\d-B-\d/, path);
    assert.ok(html.includes('<link rel="canonical" href="https://openspacecode.github.io/CCSDS-Viewer/' + path.replace('index.html', '') + '">'), path);
    assert.equal((html.match(/<h1>/g) || []).length, 1, path);
  }
  assert.equal(titles.size, refPages.length);
  assert.equal(descriptions.size, refPages.length);
});

test('the text is there without any script, with no template left over', () => {
  for (const [path, html] of refPages) {
    assert.ok(!html.includes('<script'), path);
    // ‘undefined’ and ‘null’ are words of the Blue Books too, so only a value standing alone is a fault.
    assert.ok(!/>\s*(undefined|null|NaN)\s*<|· (undefined|null)\b|\b(undefined|null) ·|\[object|\{\{/.test(html), path);
  }
});

test('every field of TM, TC, Space Packet and SDLS is on its page, with its position and its special values', () => {
  for (const [label, slug] of [['TM SDLP', 'tm'], ['TC SDLP', 'tc'], ['SpacePacket', 'spp'], ['SDLS', 'sdls']]) {
    const html = pages[slug + '/index.html'], source = proto.Q_SOURCES.find(s => s.label === label);
    for (const [id, f] of Object.entries(source.fields)) {
      assert.ok(html.includes('<section id="' + id + '">'), slug + ' ' + id);
      assert.ok(text(html).includes(f.n), slug + ' ' + f.n);
      assert.ok(text(html).includes(f.desc), slug + ' desc of ' + id);
      for (const x of f.sp) assert.ok(text(html).includes(x.d), slug + ' ' + x.c);
    }
  }
});

test('a search for the First Header Pointer finds what it wants on the TM page', () => {
  const tm = text(pages['tm/index.html']);
  assert.match(tm, /First Header Pointer FHP BITS 37–47 · 11 BITS · MANDATORY · § 4\.1\.2\.7\.6/);
  assert.match(tm, /‘11111111111’ No Packet starts/);
  assert.match(pages['tm/index.html'], /<title>TM Space Data Link Protocol fields · CCSDS 132\.0-B-3 \|/);
  assert.match(tm, /CCSDS 132\.0-B-3 · Issue 3, October 2021/);
  assert.match(text(pages['tc/index.html']), /Issue 4, October 2021 · COR\. 1 October 2023 · EC 1 October 2024/);
});

test('every procedure of the Extended Procedures is listed, with its identification and its fields', () => {
  const html = pages['sdls-ep/index.html'];
  for (const [id, p] of Object.entries(proto.EP_DEF)) {
    assert.ok(html.includes('<section id="' + id + '">'), id);
    assert.ok(text(html).includes(p.name), id);
    assert.ok(html.includes('#/ep/' + id), id);
  }
  assert.ok(text(html).includes('Extended Procedures PDU Header'));
  assert.ok(text(html).includes(proto.F.mkid.n), 'a field of OTAR');
});

test('section anchors are unique, so links to them are not ambiguous', () => {
  for (const [path, html] of refPages) {
    const ids = [...html.matchAll(/ id="([^"]+)"/g)].map(m => m[1]);
    assert.equal(new Set(ids).size, ids.length, path);
  }
});

test('links lead somewhere: to another page here, into the viewer, or to the exact Blue Book page', () => {
  for (const [path, html] of refPages) {
    for (const href of hrefs(html)) {
      if (/^https:\/\/ccsds\.org\/Pubs\/\w+\.pdf(#page=\d+)?$/.test(href) || href === 'https://github.com/OpenSpaceCode/CCSDS-Viewer' || href === '../') continue;
      if (href.startsWith('https://openspacecode.github.io/')) continue;
      const m = href.match(/^\.\.\/(.*)$/);
      assert.ok(m, path + ': ' + href);
      if (m[1].startsWith('#')) {
        const c = deepLink(m[1]);
        assert.ok(c.view, path + ': ' + href + ' opens nothing');
      } else assert.ok(pages[m[1] + 'index.html'], path + ': ' + href);
    }
  }
});

test('the viewer’s summary links to each reference page, so a crawler can find them', () => {
  const html = pages['index.html'], body = html.slice(html.indexOf('<body>'), html.indexOf('<script', html.indexOf('<body>')));
  for (const slug of ['spp', 'tm', 'tc', 'sdls', 'sdls-ep']) assert.ok(body.includes('href="' + slug + '/"'), slug);
});

// ---- entering the viewer from a link
function deepLink(hash) {
  const calls = [];
  globalThis.location = { hash, pathname: '/CCSDS-Viewer/', search: '' };
  globalThis.history = { replaceState: (a, b, url) => calls.push(url) };
  const state = new Component({}).state;
  return { ...state, cleared: calls };
}
afterEach(() => { delete globalThis.location; delete globalThis.history; delete globalThis.sessionStorage; });

test('a link opens the protocol, field or procedure it names', () => {
  assert.deepEqual([deepLink('#/tm').view, deepLink('#/tm').proto], ['diagram', 'tm']);
  assert.deepEqual([deepLink('#/spp').proto, deepLink('#/sdls').proto], ['spp', 'sdls']);
  const f = deepLink('#/field/fhp');
  assert.deepEqual([f.view, f.fid, f.proto], ['field', 'fhp', 'tm']);
  assert.equal(deepLink('#/field/tcmap').proto, 'tc');
  assert.equal(deepLink('#/field/mkid').proto, 'sdls', 'Extended Procedures live under SDLS in the sidebar');
  const e = deepLink('#/ep/otar');
  assert.deepEqual([e.view, e.epId, e.epOpen], ['ep', 'otar', true]);
  assert.deepEqual([deepLink('#/sdls-ep').proto, deepLink('#/sdls-ep').epOpen], ['sdls', true]);
});

test('every field of the viewer can be linked to, and each opens a page that renders', () => {
  for (const id of Object.keys(proto.F)) {
    globalThis.location = { hash: '#/field/' + id, pathname: '/', search: '' };
    globalThis.history = { replaceState() {} };
    const v = new Component({}).renderVals();
    assert.equal(v.showField, true, id);
  }
});

test('BACK from an Extended Procedures field reached by link goes to the procedure that owns it', () => {
  globalThis.location = { hash: '#/field/mkid', pathname: '/', search: '' };
  globalThis.history = { replaceState() {} };
  const c = new Component({});
  assert.equal(c.state.epId, 'otar');
  assert.equal(c.state.epOpen, true);
  const v = c.renderVals();
  assert.equal(v.backLabel, 'PDU DIAGRAM');
  v.back();
  assert.equal(c.state.view, 'ep');
  assert.equal(c.state.epId, 'otar');
});

test('the link is used once: it is cleared, so a refresh stays wherever the user went', () => {
  assert.deepEqual(deepLink('#/field/fhp').cleared, ['/CCSDS-Viewer/']);
});

test('a link wins over the saved page, and only that', () => {
  const saved = { view: 'decode', dProto: 'tc', dHex: { tc: '20 2A' }, scroll: 900 };
  globalThis.sessionStorage = { getItem: () => JSON.stringify(saved), setItem() {} };
  const s = deepLink('#/tm');
  assert.equal(s.view, 'diagram');
  assert.equal(s.proto, 'tm');
  assert.deepEqual(s.dHex, { tc: '20 2A' }, 'what was entered stays');
  globalThis.location = { hash: '#/tm', pathname: '/', search: '' };
  assert.equal(new Component({}).scrollToRestore, 0, 'and it opens at the top');
});

test('anything else in the address changes nothing', () => {
  for (const hash of ['', '#', '#tm', '#/nope', '#/field/nope', '#/ep/nope', '#/field/constructor', '#/field', '#/tm/extra', '#/<x>']) {
    const s = deepLink(hash);
    assert.equal(s.view, 'diagram', hash);
    assert.equal(s.fid, null, hash);
    assert.equal(s.proto, 'spp', hash);
  }
});

test('a browser that refuses to change the address still opens the page', () => {
  globalThis.location = { hash: '#/tc', pathname: '/', search: '' };
  globalThis.history = { replaceState() { throw new Error('denied'); } };
  assert.equal(new Component({}).state.proto, 'tc');
});
