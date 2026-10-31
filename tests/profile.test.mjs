// Mission profile model: schema, validation, JSON round trip and layout, with no UI.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { loadSrc } from './load.mjs';

const names = ['profileNew', 'profileValidate', 'profileToJson', 'profileParse', 'profileFileName', 'profileSet', 'profileGet', 'profileSettings', 'profileLayout', 'profileFieldLabel', 'profileBuildValues', 'profileFrameNote', 'profileWarnings', 'profileCoverage', 'PROFILE_FIELDS', 'PROFILE_FORMAT', 'profileFieldError'];
const P = loadSrc(['lib/bits.js', 'protocols/sdls.js', 'lib/profile.js'], names);

const withValues = (changes) => Object.entries(changes).reduce((p, [k, v]) => P.profileSet(p, k, v), P.profileNew());
const file = (p = P.profileNew()) => JSON.parse(P.profileToJson(p));
const field = (lay, key) => lay.fields.find(f => f.key === key);
const label = (p, proto, key) => P.profileFieldLabel(field(P.profileLayout(p, proto), key));
const ae = { 'tm.sdls.service': 'authenticated-encryption' };

test('a new profile is valid, and every schema field has a value in it', () => {
  assert.deepEqual(P.profileValidate(file()).errors, []);
  for (const f of P.PROFILE_FIELDS) assert.notEqual(P.profileGet(P.profileNew(), f.path), undefined, f.path);
});

test('JSON round trip keeps every value', () => {
  const p = withValues({ name: 'Sentinel-X', scid: 321, 'tm.frameLen': 1115, 'tm.secondaryHeaderLen': 8, 'tm.ocf': true, 'tm.fecf': false, 'tm.sdls.service': 'authentication', 'tm.sdls.sn': 4,
    'tc.maxFrameLen': 512, 'tc.segmentHeader': false, 'tc.sdls.service': 'encryption', 'tc.sdls.sn': 0, 'tc.sdls.mac': 0, 'tc.sdls.iv': 16, 'spp.timeCodeLen': 7, 'spp.ancillaryLen': 3, 'spp.maxPacketLen': 2048 });
  const back = P.profileParse(P.profileToJson(p));
  assert.deepEqual(back.errors, []);
  assert.deepEqual(back.profile, p);
});

test('the file says what it is', () => {
  const f = file();
  assert.equal(f.format, P.PROFILE_FORMAT);
  assert.equal(f.version, 1);
  assert.equal(P.profileValidate(f).profile.format, undefined, 'format and version are not profile data');
});

test('anything that is not a profile is refused, with a reason', () => {
  assert.match(P.profileParse('{not json').errors[0], /not valid JSON/);
  for (const text of ['null', '[]', '12', '"x"']) assert.match(P.profileParse(text).errors[0], /does not hold a JSON object/, text);
  assert.match(P.profileParse('{}').errors[0], /not a mission profile/);
  assert.match(P.profileValidate({ ...file(), format: 'other' }).errors[0], /not a mission profile/);
  assert.match(P.profileValidate({ ...file(), version: 2 }).errors[0], /Unsupported profile version 2/);
});

test('a missing field is an error, never silently defaulted', () => {
  const f = file(); delete f.tm.frameLen; delete f.tc.sdls; delete f.scid;
  const r = P.profileValidate(f);
  assert.equal(r.profile, null);
  for (const path of ['scid', 'tm.frameLen', 'tc.sdls.service', 'tc.sdls.mac']) assert.ok(r.errors.includes(path + ' is missing.'), path);
});

test('wrong types and out-of-range values are errors, all reported at once', () => {
  const bad = { ...file(), name: 7, scid: 1024 };
  bad.tm = { ...bad.tm, frameLen: '1115', ocf: 'yes', secondaryHeaderLen: 1 };
  bad.tc = { ...bad.tc, maxFrameLen: 2000 };
  bad.tc.sdls = { ...bad.tc.sdls, service: 'magic', iv: 33, sn: 1, mac: 4 };
  bad.spp = { ...bad.spp, timeCodeLen: 1.5, maxPacketLen: 3 };
  const { profile, errors } = P.profileValidate(bad);
  assert.equal(profile, null);
  for (const m of [/^name must be text/, /^scid must be 0–1023/, /^tm\.frameLen must be a whole number/, /^tm\.ocf must be true or false/, /^tm\.secondaryHeaderLen cannot be 1/,
    /^tc\.maxFrameLen must be 5–1024/, /^tc\.sdls\.service must be one of/, /^tc\.sdls\.iv must be 0–32/, /^tc\.sdls\.sn cannot be 1/, /^tc\.sdls\.mac cannot be 4/, /^spp\.timeCodeLen must be a whole number/, /^spp\.maxPacketLen must be 7–65542/])
    assert.ok(errors.some(e => m.test(e)), m.source);
  assert.equal(errors.length, 12);
});

test('field values allowed by table 6-1 are accepted at both ends', () => {
  const f = (path) => P.PROFILE_FIELDS.find(x => x.path === path);
  for (const [path, ok, no] of [['tm.sdls.iv', [0, 1, 32], [33]], ['tm.sdls.sn', [0, 2, 8], [1, 9]], ['tm.sdls.pl', [0, 1, 2], [3]], ['tm.sdls.mac', [0, 8, 64], [7, 65]], ['tm.secondaryHeaderLen', [0, 2, 64], [1, 65]]]) {
    for (const v of ok) assert.equal(P.profileFieldError(f(path), v), '', path + ' ' + v);
    for (const v of no) assert.notEqual(P.profileFieldError(f(path), v), '', path + ' ' + v);
  }
});

test('unknown extra fields are ignored, and do not reach the profile', () => {
  const r = P.profileValidate({ ...file(), comment: 'by hand', tm: { ...file().tm, notes: 'x' } });
  assert.deepEqual(r.errors, []);
  assert.equal(r.profile.comment, undefined);
  assert.equal(r.profile.tm.notes, undefined);
});

test('the export name comes from the mission', () => {
  assert.equal(P.profileFileName(withValues({ name: 'Sentinel X / Phase 2' })), 'sentinel-x-phase-2.mission-profile.json');
  assert.equal(P.profileFileName(withValues({ name: '///' })), 'mission.mission-profile.json');
});

test('decoder settings per protocol', () => {
  const p = withValues({ scid: 77, 'tm.frameLen': 1115, 'tm.ocf': true, 'tm.fecf': false, 'tm.secondaryHeaderLen': 8, ...ae, 'tc.maxFrameLen': 512, 'tc.segmentHeader': false, 'spp.timeCodeLen': 7, 'spp.ancillaryLen': 3, 'spp.maxPacketLen': 2048 });
  assert.deepEqual(P.profileSettings(p, 'tm'), { frameLen: 1115, fecf: 0, secSvc: 3, secIv: 12, secSn: 0, secPl: 0, secMac: 16, expect: { scid: 77, ocf: true, shLen: 8 } });
  assert.deepEqual(P.profileSettings(p, 'tc'), { fecf: 1, seg: 0, maxLen: 512, secSvc: 0, secIv: 0, secSn: 4, secPl: 0, secMac: 16, expect: { scid: 77 } });
  assert.deepEqual(P.profileSettings(p, 'spp'), { tcfLen: 7, adfLen: 3, maxLen: 2048 });
});

test('TM layout: real offsets for a fixed frame, in the order of 132.0 figure 6-1', () => {
  const p = withValues({ 'tm.frameLen': 100, 'tm.secondaryHeaderLen': 8, 'tm.ocf': true, ...ae });
  const lay = P.profileLayout(p, 'tm');
  assert.deepEqual(lay.fields.map(f => [f.key, f.len, f.from, f.to]), [
    ['ph', 6, 0, 5], ['sh', 8, 6, 13], ['sech', 14, 14, 27], ['data', 50, 28, 77], ['sect', 16, 78, 93], ['ocf', 4, 94, 97], ['fecf', 2, 98, 99]]);
  assert.equal(lay.dataRoom, 50);
});

test('TM layout: lengths always add up to the frame', () => {
  for (const sh of [0, 2, 64]) for (const ocf of [true, false]) for (const fecf of [true, false]) for (const service of ['none', 'authentication', 'encryption', 'authenticated-encryption']) {
    const p = withValues({ 'tm.frameLen': 1115, 'tm.secondaryHeaderLen': sh, 'tm.ocf': ocf, 'tm.fecf': fecf, 'tm.sdls.service': service });
    const fields = P.profileLayout(p, 'tm').fields.filter(f => f.len);
    assert.equal(fields.reduce((n, f) => n + f.len, 0), 1115);
    fields.reduce((at, f) => { assert.equal(f.from, at, f.key); return f.to + 1; }, 0);
  }
});

test('TM layout without a frame length: the head is known, the tail is measured from the end', () => {
  const p = withValues({ 'tm.ocf': true, ...ae });
  assert.equal(label(p, 'tm', 'ph'), '6 OCTETS · 0–5');
  assert.equal(label(p, 'tm', 'sech'), '14 OCTETS · 6–19');
  assert.equal(label(p, 'tm', 'data'), 'VARIES · FROM 20');
  assert.equal(label(p, 'tm', 'sect'), '16 OCTETS · END−22');
  assert.equal(label(p, 'tm', 'ocf'), '4 OCTETS · END−6');
  assert.equal(label(p, 'tm', 'fecf'), '2 OCTETS · END−2');
  assert.equal(label(p, 'tm', 'sh'), 'ABSENT');
});

test('TC layout: the frame varies, so the Data Field is an upper bound', () => {
  const p = withValues({ 'tc.maxFrameLen': 100, 'tc.sdls.service': 'authentication' });
  assert.equal(label(p, 'tc', 'ph'), '5 OCTETS · 0–4');
  assert.equal(label(p, 'tc', 'seg'), '1 OCTET · 5–5');
  assert.equal(label(p, 'tc', 'sech'), '6 OCTETS · 6–11');
  assert.equal(label(p, 'tc', 'data'), 'UP TO 70 OCTETS · FROM 12');
  assert.equal(label(p, 'tc', 'sect'), '16 OCTETS · END−18');
  assert.equal(label(p, 'tc', 'fecf'), '2 OCTETS · END−2');
});

test('Space Packet layout', () => {
  const p = withValues({ 'spp.timeCodeLen': 7, 'spp.ancillaryLen': 3, 'spp.maxPacketLen': 100 });
  assert.equal(label(p, 'spp', 'tcf'), '7 OCTETS · 6–12');
  assert.equal(label(p, 'spp', 'adf'), '3 OCTETS · 13–15');
  assert.equal(label(p, 'spp', 'data'), 'UP TO 84 OCTETS · FROM 16');
});

test('builder values follow the profile', () => {
  const p = withValues({ scid: 77, 'tm.frameLen': 100, 'tm.secondaryHeaderLen': 8, 'tm.ocf': true, ...ae });
  assert.deepEqual(P.profileBuildValues(p, 'tm'), { scid: '77', ocff: '1', fecfOn: '1', shf: '1', shdf__oct: '7', payload__oct: '50', secSvc: '3', secIv__oct: '12', secSn__oct: '0', secPl__oct: '0', secMac__oct: '16' });
  const none = P.profileBuildValues(P.profileNew(), 'tm');
  assert.equal(none.payload__oct, undefined, 'no fixed length, nothing to fill');
  assert.equal(none.shf, '0');
  assert.equal(P.profileBuildValues(withValues({ 'spp.timeCodeLen': 4 }), 'spp').pshf, '1');
  assert.equal(P.profileBuildValues(P.profileNew(), 'spp').pshf, '0');
  assert.equal(P.profileBuildValues(withValues({ scid: 5 }), 'tc').tcscid, '5');
});

test('the frame note compares what was built with what the mission fixes', () => {
  const p = withValues({ 'tm.frameLen': 100, 'tc.maxFrameLen': 50, 'spp.maxPacketLen': 30 });
  assert.equal(P.profileFrameNote(p, 'tm', 100), '');
  assert.match(P.profileFrameNote(p, 'tm', 99), /fixes this frame at 100 octets; it is now 99/);
  assert.equal(P.profileFrameNote(p, 'tc', 50), '');
  assert.match(P.profileFrameNote(p, 'tc', 51), /at most 50 octets; this frame is 51/);
  assert.match(P.profileFrameNote(p, 'spp', 31), /at most 30 octets; this packet is 31/);
  assert.equal(P.profileFrameNote(P.profileNew(), 'tm', 8), '', 'no fixed length, nothing to compare');
});

test('warnings: an inconsistent SA or a frame with no room', () => {
  assert.deepEqual(P.profileWarnings(P.profileNew()), []);
  assert.deepEqual(P.profileWarnings(withValues(ae)), [], 'the annex E baseline is consistent');
  assert.ok(P.profileWarnings(withValues({ 'tm.sdls.service': 'encryption', 'tm.sdls.sn': 2 })).some(w => /^TM: .*zero octets/.test(w.msg)));
  assert.ok(P.profileWarnings(withValues({ 'tc.sdls.service': 'authentication', 'tc.sdls.mac': 0 })).some(w => /^TC: .*Security Trailer/.test(w.msg)));
  assert.ok(P.profileWarnings(withValues({ 'tm.frameLen': 6 })).some(w => /^TM: .*no room/.test(w.msg)));
  assert.ok(P.profileWarnings(withValues({ 'spp.maxPacketLen': 7, 'spp.timeCodeLen': 4 })).some(w => /no room/.test(w.msg)));
});

test('coverage in octets, per service', () => {
  const on = (service) => P.profileCoverage(withValues({ 'tm.frameLen': 100, 'tm.sdls.service': service, 'tm.sdls.sn': 4 }), 'tm').text;
  assert.match(on('authenticated-encryption'), /MAC covers octets 0–81.*Octets 24–81 are encrypted/);
  assert.match(on('authentication'), /MAC covers octets 0–.*Nothing is encrypted/);
  assert.match(P.profileCoverage(withValues({ 'tm.frameLen': 100, 'tm.sdls.service': 'encryption', 'tm.sdls.sn': 0, 'tm.sdls.mac': 0 }), 'tm').text, /^Octets 20–97 are encrypted\. Nothing is authenticated/);
  assert.equal(P.profileCoverage(P.profileNew(), 'tm').on, false);
  assert.match(P.profileCoverage(withValues(ae), 'tm').text, /Frame Data starts at octet 20\. Set the Transfer Frame Length/);
  assert.match(P.profileCoverage(withValues({ 'tc.sdls.service': 'authentication' }), 'tc').text, /at the maximum frame length/);
});
