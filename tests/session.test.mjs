// The page survives a refresh: state saved on leaving comes back in the next instance. Closing the tab clears sessionStorage.
import { test, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { loadComponent } from './load.mjs';

const Component = loadComponent();
const KEY = 'ccsds-viewer.session';
let store;

beforeEach(() => {
  store = {};
  globalThis.sessionStorage = { getItem: (k) => (k in store ? store[k] : null), setItem: (k, v) => { store[k] = v; } };
});
afterEach(() => { delete globalThis.sessionStorage; });

const refresh = (state) => {
  const before = new Component({});
  before.state = { ...before.state, ...state };
  before.sessionSave();
  return new Component({});
};
const seed = (data) => { store[KEY] = JSON.stringify(data); return new Component({}); };

test('with nothing saved, the app opens as it always has', () => {
  const c = new Component({});
  assert.equal(c.state.proto, 'spp');
  assert.equal(c.state.view, 'diagram');
  assert.deepEqual(c.state.bVals, {});
});

test('the Builder comes back with its protocol and every entered value', () => {
  const bVals = { tm: { scid: '77', ocff: '1', ocf: '81ABCDEF', secSvc: '3', secIv__oct: '8', payload__oct: '4', payload: 'CAFEF00D' }, tc: { seg: '0' } };
  const c = refresh({ view: 'build', bProto: 'tm', bVals });
  assert.equal(c.state.view, 'build');
  assert.equal(c.state.bProto, 'tm');
  assert.deepEqual(c.state.bVals, bVals);
  const v = c.renderVals();
  assert.equal(v.showBuilder, true);
  assert.ok(v.bHex.includes('CA FE F0 0D') && v.bHex.endsWith('81 AB CD EF'));
});

test('the Decoder comes back with its input and mission settings', () => {
  const hex = '02 A3 11 05 18 00 08 64 C0 01 00 0B 3A 5C 01 00 01 02 03 04 05 06 07 08 01 00 00 05 A8 4C';
  const c = refresh({ view: 'decode', dProto: 'tm', dHex: { tm: hex, spp: 'AA' }, dSet: { tm: { frameLen: '30', secSvc: '0' } } });
  const v = c.renderVals();
  assert.equal(v.showDecoder, true);
  assert.equal(v.dHexText, hex);
  assert.equal(v.dSummary, 'VALID TM TRANSFER FRAME');
  assert.equal(c.state.dHex.spp, 'AA', 'other tabs keep theirs');
  assert.equal(c.state.dSet.tm.frameLen, '30');
});

test('every kind of page comes back', () => {
  assert.equal(refresh({ proto: 'tc', view: 'diagram' }).renderVals().showTcDiagram, true);
  const field = refresh({ proto: 'tm', view: 'field', fid: 'fhp', retView: 'decode' });
  assert.equal(field.renderVals().showField, true);
  assert.equal(field.renderVals().fieldName, 'First Header Pointer');
  assert.equal(field.renderVals().backLabel, 'FRAME DECODER', 'BACK still leads where it did');
  const ep = refresh({ proto: 'sdls', view: 'ep', epId: 'otar', epOpen: true });
  assert.equal(ep.renderVals().showEpDiagram, true);
  assert.equal(ep.state.epOpen, true);
});

test('expanded sections come back, including choices set to false', () => {
  const c = refresh({ proto: 'tm', view: 'diagram', phOpen: false, shOpen: true, sdCov: 'tc' });
  assert.equal(c.state.phOpen, false);
  assert.equal(c.state.shOpen, true);
  assert.equal(c.state.sdCov, 'tc');
});

test('passing things do not come back: search and tooltips', () => {
  const c = refresh({ qOpen: true, qText: 'fhp', tip: { id: 'scid', x: 1, y: 2 } });
  assert.equal(c.state.qOpen, false);
  assert.equal(c.state.qText, '');
  assert.equal(c.state.tip, null);
});

test('the scroll position comes back once, on mount', () => {
  const before = new Component({});
  before.mainEl = { scrollTop: 640 };
  before.sessionSave();
  const c = new Component({});
  c.mainEl = { scrollTop: 0 };
  globalThis.window = { addEventListener() {}, removeEventListener() {} };
  try {
    c.componentDidMount();
    assert.equal(c.mainEl.scrollTop, 640);
    c.mainEl.scrollTop = 10;
    c.componentDidMount();
    assert.equal(c.mainEl.scrollTop, 10, 'a later mount must not jump back');
  } finally { delete globalThis.window; }
});

test('whatever this build no longer has is dropped, and the page still renders', () => {
  const c = seed({ view: 'build', bProto: 'sdls', dProto: 'sdls', proto: 'aos', sdCov: 'nope', retView: 'x', epId: 'gone', bVals: { tm: { scid: '9' } } });
  assert.equal(c.state.bProto, 'spp', 'a removed tab falls back to the default');
  assert.equal(c.state.dProto, 'spp');
  assert.equal(c.state.proto, 'spp');
  assert.equal(c.state.sdCov, 'tm');
  assert.equal(c.state.retView, null);
  assert.equal(c.state.epId, null);
  assert.equal(c.state.bVals.tm.scid, '9', 'the rest is kept');
  assert.equal(c.renderVals().showBuilder, true);
});

test('a page that no longer exists falls back to a diagram', () => {
  for (const data of [{ view: 'field', fid: 'gone' }, { view: 'field' }, { view: 'ep', epId: 'gone' }, { view: 'nope' }]) {
    const c = seed({ proto: 'tm', ...data });
    assert.equal(c.state.view, 'diagram', JSON.stringify(data));
    assert.equal(c.renderVals().showDiagram, true, JSON.stringify(data));
  }
});

test('field ids are not mistaken for built-in object properties', () => {
  assert.equal(seed({ view: 'field', fid: 'constructor' }).state.view, 'diagram');
  assert.equal(seed({ bProto: '__proto__' }).state.bProto, 'spp');
});

test('values of the wrong type are dropped', () => {
  const c = seed({ bVals: 'x', dHex: [1], dSet: null, fid: 42 });
  assert.deepEqual(c.state.bVals, {});
  assert.deepEqual(c.state.dHex, {});
  assert.deepEqual(c.state.dSet, {});
  assert.equal(c.state.fid, null);
  assert.ok(c.renderVals());
});

test('damaged data starts from the defaults', () => {
  for (const raw of ['{not json', 'null', '"text"', '12']) {
    store[KEY] = raw;
    const c = new Component({});
    assert.equal(c.state.view, 'diagram', raw);
    assert.equal(c.state.proto, 'spp', raw);
  }
});

test('storage that throws never breaks the page', () => {
  globalThis.sessionStorage = { getItem() { throw new Error('blocked'); }, setItem() { throw new Error('full'); } };
  const c = new Component({});
  assert.equal(c.state.view, 'diagram');
  assert.doesNotThrow(() => c.sessionSave());
  delete globalThis.sessionStorage;
  const none = new Component({});
  assert.doesNotThrow(() => none.sessionSave(), 'no storage at all');
  assert.equal(none.state.view, 'diagram');
});
