// Smoke tests over the built component: every view renders, every reference is resolvable,
// and the committed single-file viewer matches src/.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { loadComponent } from './load.mjs';
import { build, OUTPUT } from '../build.mjs';

const Component = loadComponent();
const render = (state) => {
  const c = new Component({});
  c.state = { ...c.state, ...state };
  return { c, v: c.renderVals() };
};
const proto = new Component({});
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

test('BACK from a field page opened in the decoder returns to the decoder', () => {
  const { c, v } = render({ view: 'decode' });
  v.dFields[0].onClick({ currentTarget: { dataset: { dfield: v.dFields[0].fid } } });
  assert.equal(c.state.view, 'field');
  assert.equal(c.renderVals().backLabel, 'FRAME DECODER');
  c.renderVals().back();
  assert.equal(c.state.view, 'decode');
});

test('CCSDS-protocol-viewer.html is up to date with src/ (run: node build.mjs)', () => {
  assert.equal(readFileSync(OUTPUT, 'utf8') === build(), true);
});
