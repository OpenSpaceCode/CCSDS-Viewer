// TM Transfer Frame decoder — CCSDS 132.0-B-3 test vectors.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { loadSrc } from './load.mjs';

const { decodeTm, parseHex, crc16, oidMismatch, TM_DECODE } = loadSrc(['lib/bits.js', 'protocols/sdls.js', 'protocols/tm.js'], ['decodeTm', 'parseHex', 'crc16', 'oidMismatch', 'TM_DECODE']);

const DEFAULTS = { frameLen: 0, fecf: 1, secSvc: 0, secIv: 12, secSn: 0, secPl: 0, secMac: 16 };
const bytes = (hex) => { const { bytes: b, err } = parseHex(hex); assert.equal(err, ''); return b; };
const decode = (hex, set = {}) => decodeTm(bytes(hex), { ...DEFAULTS, ...set });
// Appends a correct FECF, so a vector only has to state what it tests.
const withFecf = (hex) => { const b = bytes(hex); const c = crc16(b, 0, b.length); return [...b, c >> 8, c & 0xFF].map(x => x.toString(16).padStart(2, '0')).join(' '); };
const field = (r, fid) => r.fields.find(f => f.fid === fid);
const fids = (r) => r.fields.map(f => f.fid);
const refs = (r, level) => r.checks.filter(c => c.level === level).map(c => c.ref);
const example = (label) => TM_DECODE.examples.find(x => x.l === label).hex;

const PN = 'FF FF FF FF 6D B6 D8 61 45 1F 11 F1 97 16 72 3C BE 7E 00 B1';  // annex D
const OID_HDR = '02 AE 13 09 1F FE ';

test('crc16 is the CRC-16 of § 4.1.6.2 (standard check value for "123456789")', () => {
  assert.equal(crc16([...'123456789'].map(c => c.charCodeAt(0)), 0, 9), 0x29B1);
});

test('the syndrome over a frame with a correct FECF is zero (§ 4.1.6.3)', () => {
  const b = bytes(example('Packets · OCF'));
  assert.equal(crc16(b, 0, b.length), 0);
});

test('primary header fields (§ 4.1.2)', () => {
  const r = decode(example('Packets · OCF'));
  assert.equal(field(r, 'vn').value, '0');
  assert.equal(field(r, 'scid').value, '42');
  assert.equal(field(r, 'vcid').value, '1');
  assert.equal(field(r, 'ocff').value, '1');
  assert.equal(field(r, 'mcfc').value, '17');
  assert.equal(field(r, 'vcfc').value, '5');
  assert.equal(field(r, 'shf').value, '0');
  assert.equal(field(r, 'sync').value, '0');
  assert.equal(field(r, 'pof').value, '0');
  assert.equal(field(r, 'slid').value, '3');
  assert.equal(field(r, 'fhp').value, '0');
  assert.deepEqual(r.fields.slice(0, 11).map(f => [f.fid, f.off, f.bits]), [
    ['vn', 0, 2], ['scid', 2, 10], ['vcid', 12, 3], ['ocff', 15, 1], ['mcfc', 16, 8], ['vcfc', 24, 8],
    ['shf', 32, 1], ['sync', 33, 1], ['pof', 34, 1], ['slid', 35, 2], ['fhp', 37, 11]]);
});

test('Trailer is located from the end of the frame (§ 4.1.5.1, § 4.1.6.1.1)', () => {
  const r = decode(example('Packets · OCF'));
  assert.deepEqual(r.fields.slice(11).map(f => [f.fid, f.off / 8, f.bits / 8]), [['df', 6, 18], ['ocf', 24, 4], ['fecf', 28, 2]]);
  assert.equal(field(r, 'ocf').raw, '01000005');
  assert.equal(field(r, 'fecf').raw, 'A84C');
  assert.deepEqual(refs(r, 'err'), []);
});

test('FECF: correct, corrupted, and absent by mission setting (§ 4.1.6)', () => {
  assert.deepEqual(refs(decode(example('Packets · OCF')), 'ok'), ['§ 4.1.6.3']);
  const bad = decode(example('Bad FECF'));
  assert.deepEqual(refs(bad, 'err'), ['§ 4.1.6.3']);
  assert.match(field(bad, 'fecf').meaning, /^CRC mismatch — computed 0x[0-9A-F]{4}$/);

  const absent = decode(example('Packets · OCF'), { fecf: 0 });
  assert.equal(field(absent, 'fecf'), undefined);
  assert.deepEqual(refs(absent, 'err'), []);
  assert.equal(field(absent, 'ocf').off / 8, 26);  // the OCF moves back: the last 4 octets now
});

test('secondary header: length is carried in-band (§ 4.1.3.2.3)', () => {
  const r = decode(example('Secondary Header · split Packet'));
  assert.equal(field(r, 'shvn').value, '0');
  assert.equal(field(r, 'shlen').value, '2');
  assert.equal(field(r, 'shdf').raw, 'A1B2');
  assert.equal(field(r, 'shdf').off / 8, 7);
});

test('secondary header version and minimum length (§ 4.1.3.2.2.2, § 4.1.3.1.3)', () => {
  assert.ok(refs(decode(withFecf('02 A2 12 06 98 00 42 A1 B2 AA BB')), 'err').includes('§ 4.1.3.2.2.2'));
  assert.ok(refs(decode(withFecf('02 A2 12 06 98 00 00 AA BB')), 'err').includes('§ 4.1.3.1.3'));
  assert.ok(refs(decode('02 A2 12 06 98 00', { fecf: 0 }), 'err').includes('§ 4.1.3.1.1'));
});

test('First Header Pointer splits the Data Field at the first Packet (§ 4.1.2.7.6.3)', () => {
  const r = decode(example('Secondary Header · split Packet'));
  const df = r.fields.filter(f => f.fid === 'df');
  assert.deepEqual(df.map(f => [f.abbr, f.raw]), [['RESID', 'AABBCCDD'], ['PKTS', '0005C00A000311223344']]);
  assert.match(field(r, 'fhp').meaning, /Data Field octet 4 \(frame octet 13\)/);
});

test('First Header Pointer past the Data Field is an error (§ 4.1.2.7.6.3)', () => {
  const r = decode(example('FHP past Data Field'));
  assert.deepEqual(refs(r, 'err'), ['§ 4.1.2.7.6.3']);
  assert.equal(r.fields.filter(f => f.fid === 'df').length, 1);
  // Last valid position is accepted, the next one is not (Data Field of 4 octets).
  assert.deepEqual(refs(decode(withFecf('02 A2 15 08 18 03 11 22 33 44')), 'err'), []);
  assert.deepEqual(refs(decode(withFecf('02 A2 15 08 18 04 11 22 33 44')), 'err'), ['§ 4.1.2.7.6.3']);
});

test('First Header Pointer: no Packet starts here (§ 4.1.2.7.6.4)', () => {
  const r = decode(withFecf('02 A2 15 08 1F FF 11 22 33 44'));
  assert.equal(field(r, 'fhp').meaning, 'No Packet starts in this frame');
  assert.deepEqual(refs(r, 'err'), []);
});

test('the OID recurrence holds for annex D, and for any later window of it', () => {
  const pn = bytes(PN);
  assert.equal(oidMismatch(pn, 0, pn.length), -1);
  assert.equal(oidMismatch(pn, 3, pn.length - 3), -1);
  const broken = [...pn]; broken[10] ^= 0x01;
  assert.equal(oidMismatch(broken, 0, broken.length), 87);
});

test('Only Idle Data frames are checked against the PN sequence (§ 4.1.4.6.2)', () => {
  const good = decode(example('Only Idle Data'));
  assert.equal(field(good, 'df').abbr, 'OID');
  assert.ok(refs(good, 'ok').includes('§ 4.1.4.6.2'));
  const bad = decode(withFecf(OID_HDR + '00'.repeat(20)));
  assert.deepEqual(refs(bad, 'warn'), ['§ 4.1.4.6.2']);
  assert.deepEqual(refs(decode(withFecf(OID_HDR + 'FF FF')), 'info').filter(x => x === '§ 4.1.4.6.2'), ['§ 4.1.4.6.2']);
});

test('VCA_SDU: POF, SLID and FHP are undefined, so they are not checked (§ 4.1.2.7.3–6)', () => {
  const r = decode(example('VCA_SDU'));
  assert.equal(field(r, 'df').meaning, 'One VCA_SDU');
  assert.match(field(r, 'fhp').meaning, /^Undefined/);
  assert.deepEqual(refs(r, 'err'), []);
  assert.deepEqual(refs(decode(withFecf('02 A4 14 07 77 FF 48 65')), 'err'), []);
});

test('Synchronization Flag 0 requires SLID ‘11’; POF is reserved (§ 4.1.2.7.5.2, § 4.1.2.7.4)', () => {
  assert.deepEqual(refs(decode(withFecf('02 A2 15 08 10 00 11 22')), 'err'), ['§ 4.1.2.7.5.2']);
  assert.deepEqual(refs(decode(withFecf('02 A2 15 08 38 00 11 22')), 'warn'), ['§ 4.1.2.7.4']);
});

test('version number other than 00 is an error (§ 4.1.2.2.2.2)', () => {
  assert.deepEqual(refs(decode(withFecf('42 A2 15 08 18 00 11 22')), 'err'), ['§ 4.1.2.2.2.2']);
});

test('mission Transfer Frame Length (§ 4.1.1.2)', () => {
  const hex = example('Packets · OCF');
  assert.deepEqual(refs(decode(hex), 'info'), ['TABLE 5-1']);
  assert.ok(refs(decode(hex, { frameLen: 30 }), 'ok').includes('§ 4.1.1.2'));

  // Truncated: the Trailer stays where the mission says it is, so it is reported as missing, not misread.
  const short = decode(hex, { frameLen: 40 });
  assert.deepEqual(refs(short, 'err'), ['§ 4.1.1.2']);
  assert.equal(field(short, 'df').bits / 8, 24);
  assert.match(field(short, 'df').meaning, /^Truncated — 24 of 28 octets/);
  assert.equal(field(short, 'ocf').value, 'MISSING');
  assert.match(field(short, 'ocf').meaning, /Report type unknown$/);
  assert.equal(field(short, 'fecf').value, 'MISSING');

  // Next frame's octets follow: the Trailer is still found, and the CRC only covers this frame.
  const long = decode(hex + ' 02 A3', { frameLen: 30 });
  assert.deepEqual(refs(long, 'warn'), ['§ 4.1.1.2']);
  assert.deepEqual(refs(long, 'err'), []);
  assert.equal(long.fields.at(-1).extra, true);
  assert.equal(long.fields.at(-1).off / 8, 30);
});

test('a frame too short for its own headers and trailers is an error (§ 4.1.4.2)', () => {
  const r = decode('02 A3 11 05 18 00 AA BB');
  assert.deepEqual(refs(r, 'err'), ['§ 4.1.4.2']);
  assert.deepEqual(fids(r).filter(f => ['df', 'ocf', 'fecf'].includes(f)), []);
  assert.deepEqual(refs(decode('02 A3 11'), 'err'), ['§ 4.1.2.1']);
  assert.deepEqual(decode(''), { fields: [], checks: [] });
});

test('OCF report type comes from its first two bits (§ 4.1.5.4, § 4.1.5.5)', () => {
  const ocf = (first) => field(decode(withFecf('02 A3 11 05 18 00 11 22 ' + first + ' 00 00 05')), 'ocf').meaning;
  assert.match(ocf('01'), /^Type-1 Report/);
  assert.match(ocf('41'), /^Type-1 Report/);
  assert.match(ocf('81'), /^Type-2 Report — project-specific/);
  assert.match(ocf('C1'), /^Type-2 Report — SDLS/);
});

test('built-in examples decode as labelled', () => {
  const errs = (label) => refs(decode(example(label)), 'err');
  for (const l of ['Packets · OCF', 'Secondary Header · split Packet', 'Only Idle Data', 'VCA_SDU']) assert.deepEqual(errs(l), [], l);
  assert.deepEqual(errs('Bad FECF'), ['§ 4.1.6.3']);
  assert.deepEqual(errs('FHP past Data Field'), ['§ 4.1.2.7.6.3']);
});
