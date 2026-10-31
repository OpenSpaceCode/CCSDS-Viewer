// TC Transfer Frame decoder — CCSDS 232.0-B-4 test vectors.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { loadSrc } from './load.mjs';

const { decodeTc, parseHex, crc16, TC_DECODE } = loadSrc(['lib/bits.js', 'protocols/sdls.js', 'protocols/tc.js'], ['decodeTc', 'parseHex', 'crc16', 'TC_DECODE']);

const DEFAULTS = { fecf: 1, seg: 1, maxLen: 1024, secSvc: 0, secIv: 0, secSn: 4, secPl: 0, secMac: 16 };
const bytes = (hex) => { const { bytes: b, err } = parseHex(hex); assert.equal(err, ''); return b; };
const decode = (hex, set = {}) => decodeTc(bytes(hex), { ...DEFAULTS, ...set });
const toHex = (b) => b.map(x => x.toString(16).padStart(2, '0')).join(' ');
// Builds a frame from its fields, with the Frame Length and a correct FECF filled in, so a vector states only what it tests.
const frame = ({ tfvn = 0, bf = 1, ccf = 0, rsvd = 0, scid = 42, vcid = 1, fsn = 0, fecf = true, len }, data) => {
  const d = bytes(data), total = 5 + d.length + (fecf ? 2 : 0), c = len === undefined ? total - 1 : len;
  const b = [(tfvn << 6) | (bf << 5) | (ccf << 4) | (rsvd << 2) | (scid >> 8), scid & 0xFF, (vcid << 2) | (c >> 8), c & 0xFF, fsn, ...d];
  if (fecf) { const crc = crc16(b, 0, b.length); b.push(crc >> 8, crc & 0xFF); }
  return toHex(b);
};
const field = (r, fid) => r.fields.find(f => f.fid === fid);
const fids = (r) => r.fields.map(f => f.fid);
const refs = (r, level) => r.checks.filter(c => c.level === level).map(c => c.ref);
const example = (label) => TC_DECODE.examples.find(x => x.l === label).hex;

test('primary header fields (§ 4.1.2)', () => {
  const r = decode(frame({ bf: 0, scid: 0x2AB, vcid: 37, fsn: 200 }, 'C5 11 22'));
  assert.equal(field(r, 'tcvn').value, '0');
  assert.equal(field(r, 'tcbf').value, '0');
  assert.equal(field(r, 'tcccf').value, '0');
  assert.equal(field(r, 'tcrsvd').value, '0');
  assert.equal(field(r, 'tcscid').value, String(0x2AB));
  assert.equal(field(r, 'tcvcid').value, '37');
  assert.equal(field(r, 'tcflen').value, '9');
  assert.equal(field(r, 'tcfsn').value, '200');
  assert.deepEqual(r.fields.slice(0, 8).map(f => [f.fid, f.off, f.bits]), [
    ['tcvn', 0, 2], ['tcbf', 2, 1], ['tcccf', 3, 1], ['tcrsvd', 4, 2], ['tcscid', 6, 10], ['tcvcid', 16, 6], ['tcflen', 22, 10], ['tcfsn', 32, 8]]);
});

test('combined Bypass and Control Command Flags (table 4-1)', () => {
  const type = (bf, ccf, data) => decode(frame({ bf, ccf }, data)).checks.find(c => c.ref === 'TABLE 4-1');
  assert.match(type(0, 0, 'C5 11').msg, /^Type-AD/);
  assert.match(type(1, 0, 'C5 11').msg, /^Type-BD/);
  assert.match(type(1, 1, '00').msg, /^Type-BC/);
  assert.equal(type(0, 1, '00').level, 'err');
});

test('Segment Header per mission setting (§ 4.1.3.2.2)', () => {
  const r = decode(frame({}, '43 DE AD'));
  assert.equal(field(r, 'tcsqf').value, '1');
  assert.equal(field(r, 'tcsqf').meaning, 'First portion of a service data unit');
  assert.equal(field(r, 'tcmap').value, '3');
  assert.equal(field(r, 'tcsqf').off, 40);
  assert.equal(field(r, 'tcmap').off, 42);
  assert.equal(field(r, 'tcud').raw, 'DEAD');

  const none = decode(frame({}, '43 DE AD'), { seg: 0 });
  assert.equal(field(none, 'tcsqf'), undefined);
  assert.equal(field(none, 'tcud').raw, '43DEAD');
});

test('Sequence Flags follow table 4-2', () => {
  const flags = (first) => field(decode(frame({}, first + ' 11')), 'tcsqf').meaning;
  assert.match(flags('00'), /^Continuing/);
  assert.match(flags('40'), /^First/);
  assert.match(flags('80'), /^Last/);
  assert.match(flags('C0'), /^No segmentation/);
});

test('Control Commands: Unlock and Set V(R) (§ 4.1.3.3)', () => {
  const unlock = decode(example('Type-BC · Unlock'));
  assert.equal(field(unlock, 'tccc').meaning, 'Unlock');
  assert.equal(field(unlock, 'tccc').raw, '00');
  const setVr = decode(example('Type-BC · Set V(R)'));
  assert.equal(field(setVr, 'tccc').meaning, 'Set V(R) — V(R) = 42');
  assert.deepEqual(refs(unlock, 'err'), []);
  assert.deepEqual(refs(setVr, 'err'), []);
});

test('other Control Command bit combinations are reserved (§ 4.1.3.3.4)', () => {
  for (const data of ['01', '00 00', '82 01 2A', '82 00', '83 00 01'])
    assert.deepEqual(refs(decode(frame({ ccf: 1 }, data)), 'err'), ['§ 4.1.3.3.4'], data);
});

test('Type-C frames have no Segment Header (§ 4.1.3.2.2.1.3)', () => {
  const r = decode(frame({ ccf: 1 }, '82 00 2A'), { seg: 1 });
  assert.equal(field(r, 'tcsqf'), undefined);
  assert.equal(field(r, 'tccc').raw, '82002A');
  assert.deepEqual(refs(r, 'err'), []);
});

test('Frame Length is the frame’s own: FECF is found from it, not from the input end (§ 4.1.2.7)', () => {
  const r = decode(example('Type-BD · Segment'));
  assert.deepEqual(r.fields.slice(8).map(f => [f.fid, f.off / 8 | 0, f.bits / 8]), [['tcsqf', 5, 0.25], ['tcmap', 5, 0.75], ['tcud', 6, 12], ['tcfecf', 18, 2]]);
  assert.ok(refs(r, 'ok').includes('§ 4.4.9.3.3'));
});

test('truncated frames are reported and the FECF is not checked (§ 4.4.9.2.5)', () => {
  const r = decode(example('Truncated'));
  assert.deepEqual(refs(r, 'err'), ['§ 4.4.9.2.5']);
  assert.equal(field(r, 'tcfecf').value, 'MISSING');
  assert.equal(field(r, 'tcfecf').meaning, 'Truncated — 0 of 2 octets received. CRC not checked');
  assert.match(field(r, 'tcud').meaning, /^Truncated — 9 of 12 octets/);
});

test('up to 6 octets of 01010101 after the frame are Fill Data (§ 4.4.9.2.6)', () => {
  const r = decode(example('Fill Data'));
  assert.deepEqual(refs(r, 'warn'), []);
  assert.deepEqual(refs(r, 'err'), []);
  assert.ok(refs(r, 'info').includes('§ 4.4.9.2.6'));
  const last = r.fields.at(-1);
  assert.equal(last.abbr, 'FILL');
  assert.equal(last.extra, true);
  assert.ok(refs(r, 'ok').includes('§ 4.1.4.3'), 'CRC covers the frame only');
});

test('other octets after the frame are not Fill Data (§ 4.4.9.2.3)', () => {
  const f = frame({}, 'C5 11 22');
  for (const tail of ['00', '55 55 AA', '55 55 55 55 55 55 55']) {
    const r = decode(f + ' ' + tail);
    assert.deepEqual(refs(r, 'warn'), ['§ 4.4.9.2.3'], tail);
    assert.equal(r.fields.at(-1).abbr, 'EXTRA', tail);
  }
});

test('FECF: correct, corrupted, and absent by mission setting (§ 4.1.4)', () => {
  const good = decode(example('Type-BD · Segment'));
  assert.deepEqual(refs(good, 'ok').filter(x => x === '§ 4.1.4.3'), ['§ 4.1.4.3']);
  assert.equal(field(good, 'tcfecf').meaning, 'CRC correct');

  const bad = decode(example('Bad FECF'));
  assert.deepEqual(refs(bad, 'err'), ['§ 4.1.4.3']);
  assert.match(field(bad, 'tcfecf').meaning, /^CRC mismatch — computed 0x[0-9A-F]{4}$/);

  const absent = decode(frame({ fecf: false }, 'C5 11 22'), { fecf: 0 });
  assert.equal(field(absent, 'tcfecf'), undefined);
  assert.equal(field(absent, 'tcud').raw, '1122');
  assert.deepEqual(refs(absent, 'err'), []);
});

test('version, reserved spare and minimum lengths (§ 4.1.2)', () => {
  assert.deepEqual(refs(decode(frame({ tfvn: 2 }, 'C5 11')), 'err'), ['§ 4.1.2.2.2']);
  assert.deepEqual(refs(decode(frame({ rsvd: 1 }, 'C5 11')), 'err'), ['§ 4.1.2.4.2']);
  assert.deepEqual(refs(decode('20 2A 04'), 'err'), ['§ 4.1.2.1']);
  assert.deepEqual(decode(''), { fields: [], checks: [] });
});

test('a Frame Length too short for the headers and trailers is an error (§ 4.1.1)', () => {
  const r = decode(frame({ fecf: false }, 'C5'));   // 6 octets: header + Segment Header, but the FECF is expected
  assert.ok(refs(r, 'err').includes('§ 4.1.1'));
  assert.deepEqual(fids(r).filter(f => ['tcsqf', 'tcud', 'tcfecf'].includes(f)), []);
  const tiny = decode('20 2A 04 00 00 AA AA AA');     // C = 0: shorter than its own header
  assert.ok(refs(tiny, 'err').includes('§ 4.1.1'));
  assert.equal(tiny.fields.at(-1).off / 8, 5, 'trailing octets must not overlap the header');
});

test('a nonzero Type-B Frame Sequence Number is flagged (§ 4.1.2.8)', () => {
  assert.deepEqual(refs(decode(frame({ fsn: 9 }, 'C5 11')), 'warn'), ['§ 4.1.2.8']);
  assert.deepEqual(refs(decode(frame({ bf: 0, fsn: 9 }, 'C5 11')), 'warn'), []);
});

test('mission Maximum Transfer Frame Length (table 5-1)', () => {
  assert.deepEqual(refs(decode(frame({}, 'C5 11 22 33'), { maxLen: 8 }), 'warn'), ['TABLE 5-1']);
});

test('the longest frame the Frame Length can express is 1024 octets (§ 4.1.2.7)', () => {
  const data = 'C5 ' + '11 '.repeat(1016);
  const r = decode(frame({}, data));
  assert.equal(field(r, 'tcflen').value, '1023');
  assert.equal(field(r, 'tcud').bits / 8, 1016);
  assert.deepEqual(refs(r, 'err'), []);
});

test('built-in examples decode as labelled', () => {
  const errs = (label) => refs(decode(example(label)), 'err');
  for (const l of ['Type-BD · Segment', 'Type-AD · first portion', 'Type-BC · Unlock', 'Type-BC · Set V(R)', 'Fill Data']) assert.deepEqual(errs(l), [], l);
  assert.deepEqual(errs('Truncated'), ['§ 4.4.9.2.5']);
  assert.deepEqual(errs('Bad FECF'), ['§ 4.1.4.3']);
});
