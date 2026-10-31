// Cheat sheets: their content must agree with the field tables, and every claim must lead to its clause.
import { test, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { loadComponent, loadSrc } from './load.mjs';

const Component = loadComponent();
const { blueBookLink } = loadSrc(['lib/bluebook-pages.js', 'lib/bluebooks.js'], ['blueBookLink']);
const { profileNew, profileSet, profileToJson } = loadSrc(['lib/bits.js', 'protocols/sdls.js', 'lib/profile.js'], ['profileNew', 'profileSet', 'profileToJson']);
const proto = new Component({});
const sheets = Object.entries(proto.CHEAT_SHEETS);
const render = (state) => { const c = new Component({}); c.state = { ...c.state, view: 'cheat', ...state }; return { c, v: c.renderVals() }; };
const on = (doc) => render({ cProto: doc }).v;

let local;
beforeEach(() => { local = {}; globalThis.localStorage = { getItem: (k) => (k in local ? local[k] : null), setItem: (k, v) => { local[k] = v; }, removeItem: (k) => { delete local[k]; } }; });
afterEach(() => { delete globalThis.localStorage; });

test('there is a sheet for every protocol in the sidebar', () => {
  assert.deepEqual(proto.CHEAT_ORDER, ['spp', 'tm', 'tc', 'sdls', 'ep']);
  for (const id of proto.CHEAT_ORDER) { assert.ok(proto.CHEAT_SHEETS[id], id); assert.equal(on(id).cCode, { spp: 'CCSDS 133.0-B-2', tm: 'CCSDS 132.0-B-3', tc: 'CCSDS 232.0-B-4', sdls: 'CCSDS 355.0-B-2', ep: 'CCSDS 355.1-B-1' }[id]); }
});

test('every field named on a sheet exists, in the book of that sheet', () => {
  for (const [doc, s] of sheets) {
    for (const [id] of s.fields) { assert.ok(proto.F[id], doc + ' ' + id); assert.equal(proto.fieldDoc(id), doc, doc + ' ' + id); }
    for (const row of s.rows) for (const c of row) { assert.ok(proto.F[c[2]], doc + ' ' + c[2]); assert.equal(proto.fieldDoc(c[2]), doc, doc + ' ' + c[2]); }
  }
});

test('the bit map agrees with the bit positions of the field pages', () => {
  const span = (text) => { const m = String(text).match(/^BITS? (\d+)(?:–(\d+))?$/); return m ? [Number(m[1]), Number(m[2] === undefined ? m[1] : m[2])] : null; };
  for (const [doc, s] of [['tm', proto.CHEAT_SHEETS.tm], ['tc', proto.CHEAT_SHEETS.tc], ['spp', proto.CHEAT_SHEETS.spp]]) {
    let at = 0;
    for (const row of s.rows) for (const [abbr, bits, fid] of row) {
      assert.deepEqual(span(proto.F[fid].bits), [at, at + bits - 1], doc + ' ' + abbr);
      at += bits;
    }
    assert.equal(at, doc === 'tc' ? 40 : 48, doc + ' header length');
  }
});

test('header rows are whole octets, so the OCT labels are right', () => {
  assert.deepEqual(on('tm').cRows.map(r => r.label), ['OCT 0–1', 'OCT 2–3', 'OCT 4–5']);
  assert.deepEqual(on('tc').cRows.map(r => r.label), ['OCT 0–1', 'OCT 2–3', 'OCT 4']);
  assert.deepEqual(on('spp').cRows.map(r => r.label), ['OCT 0–1', 'OCT 2–3', 'OCT 4–5']);
  assert.deepEqual(on('ep').cRows.map(r => r.label), ['OCT 0–2']);
});

test('the abbreviations match the Frame Builder and the Frame Decoder', () => {
  for (const [doc, s] of [['tm', proto.CHEAT_SHEETS.tm], ['tc', proto.CHEAT_SHEETS.tc], ['spp', proto.CHEAT_SHEETS.spp]]) {
    const builder = proto.BUILD_SPECS[doc].fields.map(f => f.abbr);
    assert.deepEqual(s.rows.flat().map(c => c[0]), builder, doc);
  }
});

test('every field, value and rule leads to its exact clause', () => {
  const missing = [];
  const check = (doc, ref) => { const l = blueBookLink(doc, ref); if (!l || !l.exact) missing.push(doc + ': ' + ref); };
  for (const [doc, s] of sheets) {
    for (const [, , ref] of s.specials) check(doc, ref);
    for (const [, ref] of s.rules) check(doc, ref);
    for (const [id] of s.fields) check(doc, proto.F[id].ref);
  }
  assert.deepEqual(missing, []);
  for (const id of proto.CHEAT_ORDER) for (const row of [...on(id).cFields, ...on(id).cSpecials, ...on(id).cRules]) assert.equal(row.hasLink, true, id + ' ' + row.ref);
});

test('values on the sheets agree with what the decoders enforce', () => {
  const spec = (doc, c) => proto.CHEAT_SHEETS[doc].specials.find(s => s[0] === c);
  assert.match(spec('tm', 'FHP 0x7FF')[1], /‘11111111111’/);
  assert.match(spec('tm', 'FHP 0x7FE')[1], /‘11111111110’/);
  assert.equal(parseInt('11111111111', 2), 0x7FF);
  assert.equal(parseInt('11111111110', 2), 0x7FE);
  assert.match(spec('spp', 'APID 0x7FF')[1], /‘11111111111’/);
  // The baselines stated on the SDLS sheet are the ones both builders start from.
  const base = proto.CHEAT_SHEETS.sdls.specials;
  assert.match(base.find(s => s[0] === 'TM BASELINE')[1], new RegExp('IV ' + proto.BUILD_SPECS.tm.sdls.baseline.iv + ', SN ' + proto.BUILD_SPECS.tm.sdls.baseline.sn + ', PL ' + proto.BUILD_SPECS.tm.sdls.baseline.pl + ', MAC ' + proto.BUILD_SPECS.tm.sdls.baseline.mac));
  assert.match(base.find(s => s[0] === 'TC BASELINE')[1], new RegExp('IV ' + proto.BUILD_SPECS.tc.sdls.baseline.iv + ', SN ' + proto.BUILD_SPECS.tc.sdls.baseline.sn + ', PL ' + proto.BUILD_SPECS.tc.sdls.baseline.pl + ', MAC ' + proto.BUILD_SPECS.tc.sdls.baseline.mac));
  assert.match(proto.CHEAT_SHEETS.ep.fields.find(f => f[0] === 'eplen')[2], /in bits/, 'the length field counts bits, against expectation');
});

test('the sheet shows the revision the links are from', () => {
  assert.equal(on('tc').cRev, 'ISSUE 4 · OCTOBER 2021 · COR. 1 OCTOBER 2023 · EC 1 OCTOBER 2024');
  assert.equal(on('tc').cRevShort, 'Issue 4, October 2021, Cor. 1 October 2023, EC 1 October 2024');
  assert.equal(on('tm').cRevShort, 'Issue 3, October 2021');
  assert.match(on('tm').cUrl, /132x0b3\.pdf$/);
});

test('labels on the sheets stay short enough for their columns', () => {
  assert.equal(on('tc').cFields.find(f => f.id === 'tccc').pos, '1/3 oct');
  assert.equal(on('tm').cFields.find(f => f.id === 'shvn').pos, 'SH 0–1');
  assert.equal(on('tc').cFields.find(f => f.id === 'tcmap').pos, 'SEG 2–7');
});

test('the Extended Procedures sheet lists every procedure, with its identification', () => {
  const v = on('ep');
  assert.equal(v.cHasProcedures, true);
  const items = v.cProcedures.flatMap(g => g.items);
  assert.equal(items.length, Object.keys(proto.EP_DEF).length);
  assert.equal(items.find(p => p.id === 'otar').pi, '‘0001’');
  assert.equal(v.cHasManaged, false, 'it has no managed parameters of its own');
  assert.equal(on('tm').cHasProcedures, false);
});

test('the SDLS sheet shows both frames it sits in, and what each service does', () => {
  const v = on('sdls');
  assert.deepEqual(v.cStrips.map(s => s.title), ['TM TRANSFER FRAME WITH SDLS', 'TC TRANSFER FRAME WITH SDLS']);
  assert.deepEqual(v.cServices.map(s => s.a), ['Authentication', 'Encryption', 'Authenticated Encryption']);
  assert.equal(v.cManaged.find(m => m.id === 'mac').value, '8–64 octets');
});

test('without a profile, managed parameters say what is managed; with one, their values', () => {
  const m = on('tm').cManaged;
  assert.equal(m.find(x => x.id === 'fecf').value, 'Present / Absent');
  assert.equal(m.find(x => x.id === 'frameLen').value, 'N octets');
  assert.equal(m.find(x => x.id === 'secSvc').value, 'Service type', 'kept short, to fit one line');
  assert.equal(m.find(x => x.id === 'secIv'), undefined);
  local['ccsds-viewer.mission-profile'] = profileToJson(['tm.frameLen', 'tm.sdls.service', 'tc.sdls.service'].reduce((p, k, i) => profileSet(p, k, [1115, 'authenticated-encryption', 'authentication'][i]), { ...profileNew(), name: 'Sentinel-X' }));
  const pr = render({ cProto: 'tm', profileOn: true }).v;
  assert.equal(pr.cMission, ' · SENTINEL-X');
  assert.equal(pr.cManagedTitle, 'MANAGED PARAMETERS · SENTINEL-X');
  assert.equal(pr.cManaged.find(x => x.id === 'frameLen').value, '1115 octets');
  assert.equal(pr.cManaged.find(x => x.id === 'secSvc').value, 'Authenticated Encryption');
  assert.equal(pr.cManaged.find(x => x.id === 'secIv').value, '12 octets');
  assert.ok(pr.cStrips[0].cells.some(c => c.n === 'FRAME DATA' && /OCT · 20–/.test(c.len)));
  const sdls = render({ cProto: 'sdls', profileOn: true }).v;
  assert.equal(sdls.cManaged.find(x => x.id === 'iv').value, 'TM 12 · TC 0');
  assert.ok(sdls.cStrips[0].cells.some(c => c.n === 'SECURITY HEADER' && c.len === '14 OCT · 6–19'));
});

test('a field row opens its reference page, and BACK returns to the sheet', () => {
  const { c, v } = render({ cProto: 'tc' });
  v.cFields.find(f => f.id === 'tcmap').onClick();
  assert.equal(c.state.view, 'field');
  assert.equal(c.state.fid, 'tcmap');
  assert.equal(c.state.proto, 'tc');
  const page = c.renderVals();
  assert.equal(page.backLabel, 'CHEAT SHEET');
  page.back();
  assert.equal(c.state.view, 'cheat');
  assert.equal(c.state.cProto, 'tc');
});

test('a procedure row opens its PDU page', () => {
  const { c, v } = render({ cProto: 'ep' });
  v.cProcedures[0].items.find(p => p.id === 'otar').onClick();
  assert.equal(c.state.view, 'ep');
  assert.equal(c.state.epId, 'otar');
  const page = c.renderVals();
  assert.equal(page.epCanGoBack, true);
  assert.equal(page.backLabel, 'CHEAT SHEET');
  page.back();
  assert.equal(c.state.view, 'cheat');
  assert.equal(c.state.cProto, 'ep');
});

test('a PDU page reached any other way has no BACK', () => {
  const { c } = render({ cProto: 'ep', retView: 'cheat', view: 'ep', epId: 'otar' });
  c.openEp('ping');
  assert.equal(c.renderVals().epCanGoBack, false);
});

test('opening the sheets starts on the protocol in view', () => {
  const opened = (state) => { const c = new Component({}); c.state = { ...c.state, ...state }; c.renderVals().cOpen(); return c.state; };
  assert.equal(opened({ view: 'diagram', proto: 'tc' }).cProto, 'tc');
  assert.equal(opened({ view: 'field', fid: 'fhp' }).cProto, 'tm');
  assert.equal(opened({ view: 'field', fid: 'mkid' }).cProto, 'ep');
  assert.equal(opened({ view: 'ep', epId: 'otar' }).cProto, 'ep');
  assert.equal(opened({ view: 'build', bProto: 'spp' }).cProto, 'spp');
  assert.equal(opened({ view: 'decode', dProto: 'tc' }).cProto, 'tc');
  assert.equal(opened({ view: 'profile', cProto: 'sdls' }).cProto, 'sdls', 'otherwise the last one');
});

test('print names the PDF after the book, and restores the page title', () => {
  const { v } = render({ cProto: 'tm' });
  let printedAs = null;
  globalThis.document = { title: 'Bundled Page' };
  globalThis.window = { print: () => { printedAs = globalThis.document.title; } };
  try {
    v.cPrint();
    assert.equal(printedAs, 'CCSDS 132.0-B-3 cheat sheet');
    assert.equal(globalThis.document.title, 'Bundled Page');
  } finally { delete globalThis.document; delete globalThis.window; }
});

test('the printed page leaves the browser no margin for the file path, date and page number', () => {
  assert.match(readFileSync(new URL('../src/views/cheat.html', import.meta.url), 'utf8'), /@page \{ size: A4; margin: 0; \}/);
});

test('no sheet work happens while another page is open', () => {
  const c = new Component({});
  const v = c.renderVals();
  assert.equal(v.showCheat, false);
  assert.equal(v.cFields, undefined);
  assert.equal(typeof v.cOpen, 'function');
});

test('the sheet being viewed survives a refresh; one that no longer exists does not', () => {
  const store = {};
  globalThis.sessionStorage = { getItem: (k) => (k in store ? store[k] : null), setItem: (k, val) => { store[k] = val; } };
  try {
    render({ cProto: 'tc' }).c.sessionSave();
    const again = new Component({});
    assert.equal(again.state.view, 'cheat');
    assert.equal(again.state.cProto, 'tc');
    store['ccsds-viewer.session'] = JSON.stringify({ view: 'cheat', cProto: 'gone' });
    assert.equal(new Component({}).state.cProto, 'spp');
  } finally { delete globalThis.sessionStorage; }
});
