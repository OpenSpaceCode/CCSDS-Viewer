// Space Packet decoder — CCSDS 133.0-B-2 test vectors.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { loadSrc } from './load.mjs';

const { decodeSpp, parseHex, SPP_DECODE } = loadSrc(['lib/bits.js', 'protocols/spp.js'], ['decodeSpp', 'parseHex', 'SPP_DECODE']);

const DEFAULTS = { tcfLen: 4, adfLen: 0, maxLen: 65542 };
const decode = (hex, set = {}) => {
  const { bytes, err } = parseHex(hex);
  assert.equal(err, '');
  return decodeSpp(bytes, { ...DEFAULTS, ...set });
};
const field = (r, fid) => r.fields.find(f => f.fid === fid);
const levels = (r) => r.checks.map(c => c.level);
const refs = (r, level) => r.checks.filter(c => c.level === level).map(c => c.ref);

test('parseHex accepts common dump formats', () => {
  for (const s of ['08 64 C0', '0864c0', '0x08,0x64,0xC0', '08:64:C0', '08-64\n C0'])
    assert.deepEqual(parseHex(s), { bytes: [0x08, 0x64, 0xC0], err: '' });
});

test('parseHex rejects odd digit counts and non-hex characters', () => {
  assert.match(parseHex('08 6').err, /Odd number of hex digits/);
  assert.match(parseHex('08 GG').err, /Not a hex digit: ‘G’/);
});

test('primary header fields (§ 4.1.3)', () => {
  // PVN 000 · TC · no SH · APID 0x1A2 · unsegmented · name 42 · PDL 5
  const r = decode('11 A2 C0 2A 00 05 A1 B2 C3 D4 E5 F6');
  assert.equal(field(r, 'sppvn').value, '0');
  assert.equal(field(r, 'spptype').meaning, 'Telecommand (requesting)');
  assert.equal(field(r, 'spshf').value, '0');
  assert.equal(field(r, 'spapid').value, String(0x1A2));
  assert.equal(field(r, 'spsqf').meaning, 'Unsegmented');
  assert.equal(field(r, 'spcnt').n, 'Packet Sequence Count or Packet Name');
  assert.equal(field(r, 'spcnt').value, '42');
  assert.equal(field(r, 'spdlen').value, '5');
  assert.equal(field(r, 'spud').raw, 'A1B2C3D4E5F6');
  assert.deepEqual(levels(r), ['ok']);
});

test('field positions follow the bit numbering convention (bit 0 = MSB of octet 0)', () => {
  const r = decode('11 A2 C0 2A 00 05 A1 B2 C3 D4 E5 F6');
  assert.deepEqual(r.fields.map(f => [f.fid, f.off, f.bits]), [
    ['sppvn', 0, 3], ['spptype', 3, 1], ['spshf', 4, 1], ['spapid', 5, 11],
    ['spsqf', 16, 2], ['spcnt', 18, 14], ['spdlen', 32, 16], ['spud', 48, 48]]);
});

test('secondary header is split per mission settings (§ 4.1.4.2)', () => {
  const hex = '08 64 C0 01 00 0B 3A 5C 01 00 01 02 03 04 05 06 07 08';
  const r = decode(hex, { tcfLen: 2, adfLen: 2 });
  assert.equal(field(r, 'sptc').raw, '3A5C');
  assert.equal(field(r, 'spad').raw, '0100');
  assert.equal(field(r, 'spud').raw, '0102030405060708');
  assert.deepEqual(levels(r), ['ok']);
});

test('SHF = 1 with no secondary header length configured warns (§ 4.1.4.2.1.4)', () => {
  const r = decode('08 64 C0 01 00 0B 3A 5C 01 00 01 02 03 04 05 06 07 08', { tcfLen: 0 });
  assert.deepEqual(refs(r, 'warn'), ['§ 4.1.4.2.1.4']);
  assert.equal(field(r, 'spud').bits, 12 * 8);
});

test('secondary header longer than the data field is an error (§ 4.1.4.2)', () => {
  const r = decode('08 64 C0 01 00 01 3A 5C');
  assert.deepEqual(refs(r, 'err'), ['§ 4.1.4.2']);
});

test('secondary header without user data is allowed (§ 4.1.4.3.2)', () => {
  const r = decode('08 64 C0 01 00 03 3A 5C 01 00');
  assert.equal(field(r, 'spud'), undefined);
  assert.deepEqual(refs(r, 'info'), ['§ 4.1.4.3.2']);
  assert.equal(refs(r, 'err').length, 0);
});

test('Packet Data Length vs. received octets (§ 4.1.3.5.2)', () => {
  const truncated = decode('00 05 C0 0A 00 09 11 22 33 44');
  assert.deepEqual(refs(truncated, 'err'), ['§ 4.1.3.5.2']);
  assert.match(field(truncated, 'spud').meaning, /^Truncated — 4 of 10 octets/);

  const extra = decode('00 05 C0 0A 00 01 AA BB 00 05 C0 0B 00 01 CC DD');
  assert.deepEqual(refs(extra, 'warn'), ['§ 4.1.3.5.2']);
  const after = extra.fields.at(-1);
  assert.equal(after.extra, true);
  assert.equal(after.off, 8 * 8);
  assert.equal(after.bits, 8 * 8);
});

test('minimum lengths (§ 4.1.3.1, § 4.1.2.2)', () => {
  assert.deepEqual(refs(decode('00 05 C0'), 'err'), ['§ 4.1.3.1']);
  assert.equal(decode('00 05 C0').fields.length, 0);
  assert.deepEqual(refs(decode('00 05 C0 0A 00 00'), 'err'), ['§ 4.1.2.2']);
  assert.deepEqual(decode(''), { fields: [], checks: [] });
});

test('version number other than 000 is an error (§ 4.1.3.2.2)', () => {
  assert.deepEqual(refs(decode('E0 05 C0 0A 00 00 FF'), 'err'), ['§ 4.1.3.2.2']);
});

test('Idle Packet: APID all ones, SHF must be 0 (§ 4.1.3.3.4.4, § 4.1.3.3.3.4)', () => {
  const idle = decode('07 FF C0 00 00 03 55 55 55 55');
  assert.deepEqual(refs(idle, 'info'), ['§ 4.1.3.3.4.4']);
  assert.equal(field(idle, 'spud').abbr, 'IDLE');
  assert.equal(refs(idle, 'err').length, 0);

  const bad = decode('0F FF C0 00 00 04 55 55 55 55 55', { tcfLen: 0 });
  assert.ok(refs(bad, 'err').includes('§ 4.1.3.3.3.4'));
});

test('segmented packets are flagged (§ 4.1.3.4.2)', () => {
  assert.deepEqual(refs(decode('00 05 40 0A 00 00 FF'), 'info'), ['§ 4.1.3.4.2']);
});

test('mission Maximum Packet Length (table 5-1)', () => {
  assert.deepEqual(refs(decode('11 A2 C0 2A 00 05 A1 B2 C3 D4 E5 F6', { maxLen: 10 }), 'warn'), ['TABLE 5-1']);
});

test('built-in examples decode as labelled', () => {
  const byLabel = Object.fromEntries(SPP_DECODE.examples.map(x => [x.l, decode(x.hex)]));
  assert.deepEqual(levels(byLabel['TM · Secondary Header']), ['ok']);
  assert.deepEqual(levels(byLabel['TC · no Secondary Header']), ['ok']);
  assert.deepEqual(levels(byLabel['Idle Packet']), ['info', 'ok']);
  assert.deepEqual(levels(byLabel['Truncated']), ['err']);
  assert.deepEqual(levels(byLabel['Two packets']), ['warn']);
});
