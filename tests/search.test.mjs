// Field search (Ctrl+K): ranking and values through the same render path the page uses, then navigation.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { loadComponent } from './load.mjs';

const Component = loadComponent();
const proto = new Component({});

const open = (text, state = {}) => {
  const c = new Component({});
  c.state = { ...c.state, ...state, qOpen: true, qText: text };
  return { c, v: c.renderVals() };
};
const results = (q) => open(q).v.qResults;
const top = (q) => results(q)[0];
const key = (key) => ({ key, preventDefault() {} });

test('a field is found by its abbreviation, ahead of fields that merely mention it', () => {
  for (const [q, name] of [['FHP', 'First Header Pointer'], ['fhp', 'First Header Pointer'], ['APID', 'Application Process Identifier'],
    ['MCFC', 'Master Channel Frame Count'], ['TFVN', 'Transfer Frame Version Number'], ['CRC', 'Frame Error Control Field'],
    ['SPI', 'Security Parameter Index'], ['N(S)', 'Frame Sequence Number'], ['CLCW', 'Operational Control Field'], ['PDL', 'Packet Data Length']])
    assert.equal(top(q).name, name, q);
});

test('a field is found by name, in any case', () => {
  assert.equal(top('bypass flag').name, 'Bypass Flag');
  assert.equal(top('FIRST HEADER').name, 'First Header Pointer');
  assert.equal(top('master key').name, 'Master Key ID');
});

test('a special value is found in hex, decimal or binary, whichever way it is written (the data holds binary)', () => {
  for (const q of ['0x7FE', '0x7fe', '7FE', '2046', '11111111110']) {
    const r = top(q);
    assert.equal(r.name, 'First Header Pointer', q);
    assert.equal(r.hitCode, '‘11111111110’', q);
    assert.match(r.hitDesc, /Only Idle Data/, q);
  }
});

test('the same value in different protocols finds each of them', () => {
  const names = results('0x7FF').map(r => r.label + ': ' + r.name);
  assert.ok(names.includes('TM SDLP: First Header Pointer'));
  assert.ok(names.includes('SpacePacket: Application Process Identifier'));
});

test('values that are not binary, and groups inside a longer literal', () => {
  assert.equal(top('65535').name, 'Security Parameter Index');
  assert.equal(top('0xFFFF').name, 'Security Parameter Index');
  assert.equal(top('0x82').name, 'Control Commands', 'first octet of Set V(R)');
});

test('short decimals are not treated as values, or ‘11’ would match every flag', () => {
  assert.ok(!results('3').some(r => r.name === 'Segment Length Identifier' && r.hitCode === '‘11’'));
  assert.deepEqual(results('fade'), [], 'a word made of hex letters stays a word');
});

test('a section number finds the field it defines', () => {
  assert.equal(top('4.1.2.7.6').name, 'First Header Pointer');
  assert.equal(top('§ 4.1.2.7.6').name, 'First Header Pointer');
});

test('every word must match, and a protocol narrows the results', () => {
  assert.deepEqual(results('scid').map(r => r.label), ['TM SDLP', 'TC SDLP']);
  assert.deepEqual(results('tc scid').map(r => r.label), ['TC SDLP']);
  assert.deepEqual(results('tm scid').map(r => r.label), ['TM SDLP']);
  assert.equal(top('spacepacket sequence flags').label, 'SpacePacket');
  assert.deepEqual(results('scid zzz'), []);
});

test('results of the same name say which PDU they belong to', () => {
  const spis = results('spi').filter(r => r.label === 'SDLS EP').map(r => r.meta);
  assert.ok(spis.length > 2);
  assert.equal(new Set(spis).size, spis.length, 'each row must be distinguishable');
});

test('a whole Extended Procedures page beats its data field on a tie', () => {
  assert.equal(top('otar').name, 'OTAR Command');
});

test('results are limited, and an empty or unmatched query says so', () => {
  assert.equal(results('sequence').length, proto.Q_LIMIT);
  assert.match(open('sequence').v.qCount, /^First 40/);
  assert.deepEqual(results(''), []);
  assert.match(open('').v.qMessage, /0x7FE/);
  assert.match(open('zzz').v.qMessage, /Nothing matches ‘zzz’/);
  assert.equal(new Component({}).renderVals().qHasResults, false, 'no search work while closed');
});

test('Ctrl+K and Cmd+K toggle it, Escape closes it, and other keys are left alone', () => {
  const c = new Component({});
  let prevented = 0;
  const press = (e) => c.qOnWindowKey({ preventDefault() { prevented++; }, ctrlKey: false, metaKey: false, shiftKey: false, altKey: false, ...e });
  press({ key: 'k', ctrlKey: true });
  assert.equal(c.state.qOpen, true);
  press({ key: 'K', ctrlKey: true });
  assert.equal(c.state.qOpen, false);
  press({ key: 'k', metaKey: true });
  assert.equal(c.state.qOpen, true);
  press({ key: 'Escape' });
  assert.equal(c.state.qOpen, false);
  assert.equal(prevented, 4);
  press({ key: 'k' });
  press({ key: 'k', ctrlKey: true, shiftKey: true });
  press({ key: 'Escape' });
  assert.equal(c.state.qOpen, false);
  assert.equal(prevented, 4, 'plain k, Ctrl+Shift+K and Escape while closed belong to the page or browser');
});

test('reopening starts a fresh search', () => {
  const { c, v } = open('fhp');
  v.qOnKey(key('ArrowDown'));
  c.qHide();
  c.qShow();
  assert.equal(c.state.qText, '');
  assert.equal(c.state.qIdx, 0);
});

test('arrow keys move the selection and wrap; typing resets it; Enter opens it', () => {
  const { c, v } = open('scid');
  const active = () => c.renderVals().qResults.findIndex(r => r.active === 'true');
  assert.equal(active(), 0);
  c.renderVals().qOnKey(key('ArrowDown'));
  assert.equal(active(), 1);
  c.renderVals().qOnKey(key('ArrowDown'));
  assert.equal(active(), 0, 'wraps at the end');
  c.renderVals().qOnKey(key('ArrowUp'));
  assert.equal(active(), 1, 'wraps at the start');
  c.renderVals().qOnKey(key('Enter'));
  assert.equal(c.state.fid, 'tcscid');
  assert.equal(c.state.qOpen, false);
  assert.ok(v.qInputRef === c.qInputRef, 'stable, so the input is focused once and not on every render');
});

test('Enter with no results does nothing', () => {
  const { c, v } = open('zzz');
  v.qOnKey(key('Enter'));
  assert.equal(c.state.qOpen, true);
  assert.equal(c.state.view, 'diagram');
});

test('opening a result shows its page under the right protocol', () => {
  const go = (q, state) => { const { c, v } = open(q, state); v.qResults[0].onClick(); return c; };
  assert.deepEqual([go('fhp').state.fid, go('fhp').state.proto, go('fhp').state.view], ['fhp', 'tm', 'field']);
  assert.equal(go('apid').state.proto, 'spp');
  assert.equal(go('tc scid').state.proto, 'tc');
  assert.equal(go('65535').state.proto, 'sdls');
  const ep = go('otar');
  assert.equal(ep.state.view, 'ep');
  assert.equal(ep.state.epId, 'otar');
  assert.equal(ep.state.epOpen, true);
});

test('BACK from a result returns to where the search was opened', () => {
  const backFrom = (view, extra = {}) => {
    const { c, v } = open('fhp', { view, ...extra });
    v.qResults[0].onClick();
    const page = c.renderVals();
    const label = page.backLabel;
    page.back();
    return [label, c.state.view];
  };
  assert.deepEqual(backFrom('decode'), ['FRAME DECODER', 'decode']);
  assert.deepEqual(backFrom('build'), ['FRAME BUILDER', 'build']);
  assert.deepEqual(backFrom('diagram'), ['FRAME DIAGRAM', 'diagram']);
});

test('BACK from an Extended Procedures field goes to the PDU that owns it', () => {
  const { c, v } = open('master key');
  v.qResults[0].onClick();
  assert.equal(c.state.fid, 'mkid');
  assert.equal(c.state.epId, 'otar');
  const page = c.renderVals();
  assert.equal(page.backLabel, 'PDU DIAGRAM');
  page.back();
  assert.equal(c.state.view, 'ep');
  assert.equal(c.renderVals().showEpDiagram, true);
});

test('every field and procedure can be found by its name, and opens a page that renders', () => {
  // Searches, then clicks each result of exactly that name: names repeat across protocols and PDUs.
  const opened = (name) => {
    const rows = (c) => c.renderVals().qResults.filter(r => r.name === name);
    const fresh = () => { const c = new Component({}); c.Q_LIMIT = 1000; c.state = { ...c.state, qOpen: true, qText: name }; return c; };
    return rows(fresh()).map((_, i) => {
      const c = fresh();
      rows(c)[i].onClick();
      const v = c.renderVals();
      assert.ok(v.showField || v.showEpDiagram, name + ' opened nothing');
      return c.state.view === 'ep' ? 'ep:' + c.state.epId : c.state.fid;
    });
  };
  for (const [id, f] of Object.entries(proto.F)) assert.ok(opened(f.n).includes(id), f.n + ' (' + id + ') not reachable');
  for (const [id, p] of Object.entries(proto.EP_DEF)) assert.ok(opened(p.name).includes('ep:' + id), p.name + ' not reachable');
  assert.equal(proto.qIndex().length, Object.keys(proto.F).length + Object.keys(proto.EP_DEF).length);
});

test('each field is listed under the protocol of the Standard it comes from', () => {
  const labels = (id) => proto.qIndex().filter(e => e.id === id && e.kind === 'field').map(e => e.label);
  for (const [id, label] of [['fhp', 'TM SDLP'], ['tcmap', 'TC SDLP'], ['spapid', 'SpacePacket'], ['spi', 'SDLS'], ['iv', 'SDLS'], ['mac', 'SDLS'], ['mkid', 'SDLS EP']])
    assert.deepEqual(labels(id), [label], id);
});
