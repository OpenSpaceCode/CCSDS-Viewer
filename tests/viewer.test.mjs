// Smoke tests over the built component: every view renders, every reference is resolvable,
// and the committed single-file viewer matches src/.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { loadComponent, loadSrc } from './load.mjs';
import { build, OUTPUT } from '../build.mjs';

const Component = loadComponent();
const render = (state) => {
  const c = new Component({});
  c.state = { ...c.state, ...state };
  return { c, v: c.renderVals() };
};
const proto = new Component({});
const { BLUE_BOOKS } = loadSrc(['lib/bluebook-pages.js', 'lib/bluebooks.js'], ['BLUE_BOOKS']);
// The state after clicking an example: its frame, with the mission settings the example brings.
const exampleState = (id, x) => ({ view: 'decode', dProto: id, dHex: { [id]: x.hex }, dSet: { [id]: { ...proto.DECODE_SPECS[id].exampleSet, ...x.set } } });

test('every diagram, field page, EP procedure, builder and decoder view renders', () => {
  for (const p of ['tm', 'tc', 'spp', 'sdls']) assert.ok(render({ proto: p, view: 'diagram' }).v);
  for (const fid of Object.keys(proto.F)) assert.equal(render({ view: 'field', fid }).v.showField, true, fid);
  for (const epId of Object.keys(proto.EP_DEF)) assert.equal(render({ view: 'ep', epId }).v.showEpDiagram, true, epId);
  for (const bProto of proto.BUILD_ORDER) assert.equal(render({ view: 'build', bProto }).v.showBuilder, true, bProto);
  for (const id of proto.DECODE_ORDER)
    for (const x of proto.DECODE_SPECS[id].examples) assert.ok(render(exampleState(id, x)).v.dHasFields, x.l);
});

test('field pages reference existing maps, parents and children', () => {
  for (const [id, f] of Object.entries(proto.F)) {
    assert.ok(proto.MAPS[f.map], id + ' → map ' + f.map);
    for (const k of f.kids) assert.ok(proto.F[k], id + ' → kid ' + k);
    if (f.parent && !proto.CRUMB_NAMES[f.parent]) assert.ok(proto.F[f.parent], id + ' → parent ' + f.parent);
  }
});

test('decoded fields link to existing reference pages', () => {
  for (const id of proto.DECODE_ORDER)
    for (const x of proto.DECODE_SPECS[id].examples)
      for (const f of render(exampleState(id, x)).v.dFields)
        if (f.fid) assert.ok(proto.F[f.fid], x.l + ' → ' + f.fid);
});

test('SDLS is part of the TM and TC decoders, not a decoder of its own', () => {
  assert.deepEqual(proto.DECODE_ORDER, ['spp', 'tm', 'tc']);
  assert.equal(proto.DECODE_SPECS.sdls, undefined);
  const ids = (id, svc) => render({ view: 'decode', dProto: id, dSet: { [id]: { secSvc: String(svc) } } }).v.dSettingsList.map(s => s.id);
  for (const id of ['tm', 'tc']) {
    assert.ok(!ids(id, 0).includes('secIv'), 'lengths are hidden while SDLS is not in use');
    assert.ok(['secIv', 'secSn', 'secPl', 'secMac'].every(k => ids(id, 3).includes(k)));
  }
});

test('clicking an example applies its mission settings, and a plain one switches SDLS off', () => {
  const { c, v } = render({ view: 'decode', dProto: 'tm' });
  const click = (view, label) => view.dExamples.find(x => x.l === label).onClick();
  click(v, 'SDLS · baseline');
  assert.equal(c.state.dSet.tm.secSvc, '3');
  const secured = c.renderVals();
  assert.equal(secured.dSummary, 'VALID TM TRANSFER FRAME');
  assert.ok(secured.dFields.some(f => f.fid === 'spi'));
  assert.ok(secured.dFields.some(f => f.fid === 'mac'));
  click(secured, 'Packets · OCF');
  const plain = c.renderVals();
  assert.equal(c.state.dSet.tm.secSvc, '0');
  assert.equal(plain.dSummary, 'VALID TM TRANSFER FRAME');
  assert.ok(!plain.dFields.some(f => f.fid === 'spi'));
});

test('the decoder starts empty on every protocol, with no example loaded', () => {
  for (const id of proto.DECODE_ORDER) {
    const { v } = render({ view: 'decode', dProto: id });
    assert.equal(v.dHexText, '', id);
    assert.equal(v.dSummary, 'NO INPUT', id);
    assert.equal(v.dHasFields, false, id);
    assert.deepEqual(v.dChecks, [], id);
  }
});

test('RESET SETTINGS restores the current protocol’s defaults, and nothing else', () => {
  const hex = '02 A3 11 05 18 00 AA BB';
  const { c, v } = render({ view: 'decode', dProto: 'tm', dHex: { tm: hex, tc: '20 2A' },
    dSet: { tm: { frameLen: '40', fecf: '0', secSvc: '3', secIv: '8' }, tc: { seg: '0' } } });
  assert.equal(v.dSettingsList.find(s => s.id === 'secIv').value, '8');
  v.dResetSettings();
  const after = c.renderVals();
  for (const s of proto.DECODE_SPECS.tm.settings.filter(s => !s.showIf))
    assert.equal(after.dSettingsList.find(x => x.id === s.id).value, String(s.def), s.id);
  assert.equal(after.dSettingsList.find(s => s.id === 'secIv'), undefined, 'SDLS is back to not in use, so its lengths hide');
  assert.equal(after.dHexText, hex, 'the input stays, and is decoded again with the defaults');
  assert.deepEqual(c.state.dSet.tc, { seg: '0' }, 'other protocols keep theirs');
  assert.equal(c.state.dHex.tc, '20 2A');
});

test('after RESET SETTINGS, SDLS lengths start from the baseline again', () => {
  const { c, v } = render({ view: 'decode', dProto: 'tm', dSet: { tm: { secSvc: '3', secIv: '8' } } });
  v.dResetSettings();
  c.renderVals().dSettingsList.find(s => s.id === 'secSvc').onInput({ target: { value: '3' } });
  assert.equal(c.renderVals().dSettingsList.find(s => s.id === 'secIv').value, '12');
});

test('BACK from a field page opened in the decoder returns to the decoder', () => {
  const { c, v } = render(exampleState('spp', proto.DECODE_SPECS.spp.examples[0]));
  v.dFields[0].onClick({ currentTarget: { dataset: { dfield: v.dFields[0].fid } } });
  assert.equal(c.state.view, 'field');
  assert.equal(c.renderVals().backLabel, 'FRAME DECODER');
  c.renderVals().back();
  assert.equal(c.state.view, 'decode');
});

test('the page is titled, both while it unpacks and once it has', () => {
  const html = readFileSync(OUTPUT, 'utf8');
  assert.match(html, /<title>CCSDS Protocol Viewer<\/title>/, 'the shell');
  assert.match(html, /<title>CCSDS Protocol Viewer<\\u002Ftitle>/, 'the template inside it');
  assert.ok(!html.includes('Bundled Page'));
});

test('search engines and link previews get a description and the one address of the page', () => {
  const html = readFileSync(OUTPUT, 'utf8'), shellHead = html.slice(0, html.indexOf('</head>'));
  const description = shellHead.match(/<meta name="description" content="([^"]+)">/);
  assert.ok(description, 'in the head of the file as served, without running its script');
  assert.ok(description[1].length >= 50 && description[1].length <= 160, 'search results cut longer ones: ' + description[1].length);
  assert.match(shellHead, /<link rel="canonical" href="https:\/\/openspacecode\.github\.io\/CCSDS-Viewer\/">/);
});

test('without a script the page still says what it is, with every book it covers and its features', () => {
  const html = readFileSync(OUTPUT, 'utf8'), body = html.slice(html.indexOf('<body>'), html.indexOf('<script', html.indexOf('<body>')));
  const text = body.replace(/<svg[\s\S]*?<\/svg>/, '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
  for (const book of Object.values(BLUE_BOOKS)) {
    assert.ok(text.includes(book.code), book.code + ' is named');
    assert.ok(body.includes('href="' + book.url + '"'), book.code + ' is linked, at the address the viewer links to');
  }
  for (const word of ['Frame Builder', 'Frame Decoder', 'Mission profiles', 'cheat sheet', 'needs JavaScript']) assert.ok(text.includes(word), word);
  assert.ok(html.slice(html.indexOf('<noscript>'), html.indexOf('</noscript>')).includes('#__bundler_thumbnail{display:none}'), 'nothing covers it then');
  assert.ok(html.indexOf('<noscript>') < html.indexOf('</head>'), 'the head stays valid: only style in its noscript');
  assert.ok(!html.slice(html.indexOf('<noscript>'), html.indexOf('</noscript>')).includes('<div'), 'a div there would end the head early');
});

test('CCSDS-protocol-viewer.html is up to date with src/ (run: node build.mjs)', () => {
  assert.equal(readFileSync(OUTPUT, 'utf8') === build(), true);
});
