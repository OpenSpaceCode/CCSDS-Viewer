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

test('every diagram, field page, EP procedure, builder and decoder view renders', () => {
  for (const p of ['tm', 'tc', 'spp', 'sdls']) assert.ok(render({ proto: p, view: 'diagram' }).v);
  for (const fid of Object.keys(proto.F)) assert.equal(render({ view: 'field', fid }).v.showField, true, fid);
  for (const epId of Object.keys(proto.EP_DEF)) assert.equal(render({ view: 'ep', epId }).v.showEpDiagram, true, epId);
  for (const bProto of proto.BUILD_ORDER) assert.equal(render({ view: 'build', bProto }).v.showBuilder, true, bProto);
  for (const id of proto.DECODE_ORDER.filter(id => !proto.DECODE_SPECS[id].soon))
    for (const x of proto.DECODE_SPECS[id].examples) assert.ok(render({ view: 'decode', dProto: id, dHex: { [id]: x.hex } }).v.dHasFields, x.l);
});

test('field pages reference existing maps, parents and children', () => {
  for (const [id, f] of Object.entries(proto.F)) {
    assert.ok(proto.MAPS[f.map], id + ' → map ' + f.map);
    for (const k of f.kids) assert.ok(proto.F[k], id + ' → kid ' + k);
    if (f.parent && !proto.CRUMB_NAMES[f.parent]) assert.ok(proto.F[f.parent], id + ' → parent ' + f.parent);
  }
});

test('decoded fields link to existing reference pages', () => {
  for (const id of proto.DECODE_ORDER.filter(id => !proto.DECODE_SPECS[id].soon))
    for (const x of proto.DECODE_SPECS[id].examples)
      for (const f of render({ view: 'decode', dProto: id, dHex: { [id]: x.hex } }).v.dFields)
        if (f.fid) assert.ok(proto.F[f.fid], x.l + ' → ' + f.fid);
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
