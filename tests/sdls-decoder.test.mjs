// SDLS inside TM and TC Transfer Frames — CCSDS 355.0-B-2, 132.0-B-3 § 6.3, 232.0-B-4 § 6.3.
// SDLS has no frame of its own, so every vector here is a TM or TC frame carrying its fields.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { loadSrc } from './load.mjs';

const { decodeTm, decodeTc, parseHex, crc16, TM_DECODE, TC_DECODE } = loadSrc(
  ['lib/bits.js', 'protocols/sdls.js', 'protocols/tm.js', 'protocols/tc.js'],
  ['decodeTm', 'decodeTc', 'parseHex', 'crc16', 'TM_DECODE', 'TC_DECODE']);

const AUTH = 1, ENC = 2, AE = 3;
const bytes = (hex) => { const { bytes: b, err } = parseHex(hex); assert.equal(err, ''); return b; };
const toHex = (b) => b.map(x => x.toString(16).padStart(2, '0')).join(' ');
const withFecf = (hex) => { const b = bytes(hex); const c = crc16(b, 0, b.length); return toHex([...b, c >> 8, c & 0xFF]); };

const tm = (hex, set) => decodeTm(bytes(hex), { frameLen: 0, fecf: 1, secSvc: 0, secIv: 0, secSn: 0, secPl: 0, secMac: 0, ...set });
const tc = (hex, set) => decodeTc(bytes(hex), { fecf: 1, seg: 1, maxLen: 1024, secSvc: 0, secIv: 0, secSn: 0, secPl: 0, secMac: 0, ...set });
// A TC frame with the Frame Length and FECF filled in.
const tcFrame = (data, ccf = 0) => {
  const d = bytes(data), total = 5 + d.length + 2;
  return withFecf(toHex([0x20 | (ccf << 4), 0x2A, 0x04 | ((total - 1) >> 8), (total - 1) & 0xFF, 0, ...d]));
};
const TM_HDR = '02 A3 11 05 18 00 ';   // VC 1, OCF present, FHP 0
const OCF = ' 01 00 00 05';

const field = (r, fid) => r.fields.find(f => f.fid === fid);
const refs = (r, level) => r.checks.filter(c => c.level === level).map(c => c.ref);
const layout = (r, from) => r.fields.slice(from).map(f => [f.fid, f.off / 8, f.raw]);
const example = (spec, label) => spec.examples.find(x => x.l === label);

test('TM: Secondary Header → Security Header → Frame Data → Security Trailer → OCF → FECF (132.0 § 6.3, 355.0 figure 5-1)', () => {
  const r = tm(withFecf('02 A3 11 05 98 00 02 A1 B2 00 07 AA BB 11 22 33 C1 C2 C3 C4 C5 C6 C7 C8' + OCF), { secSvc: AE, secIv: 2, secMac: 8 });
  assert.deepEqual(layout(r, 11).filter(x => !['shvn', 'shlen'].includes(x[0])).map(x => x.slice(0, 2)), [
    ['shdf', 7], ['spi', 9], ['iv', 11], ['df', 13], ['mac', 16], ['ocf', 24], ['fecf', 28]]);
  assert.equal(field(r, 'spi').value, '7');
  assert.equal(field(r, 'iv').raw, 'AABB');
  assert.equal(field(r, 'df').raw, '112233');
  assert.equal(field(r, 'mac').raw, 'C1C2C3C4C5C6C7C8');
  assert.deepEqual(refs(r, 'err'), []);
});

test('TC: Segment Header → Security Header → User Data → Security Trailer → FECF (232.0 § 6.3, 355.0 figure 5-2)', () => {
  const r = tc(tcFrame('C5 00 07 00 00 00 2A 11 22 33 C1 C2 C3 C4 C5 C6 C7 C8'), { secSvc: AUTH, secSn: 4, secMac: 8 });
  assert.deepEqual(layout(r, 10).map(x => x.slice(0, 2)), [['spi', 6], ['sqn', 8], ['tcud', 12], ['mac', 15], ['tcfecf', 23]]);
  assert.equal(field(r, 'tcsqf').off, 40);
  assert.equal(field(r, 'tcud').raw, '112233');
  assert.deepEqual(refs(r, 'err'), []);
});

test('all four Security Header fields appear in order, and absent ones are not shown (355.0 § 4.1.1.1.3)', () => {
  const r = tc(tcFrame('C5 00 07 A1 A2 00 2A 05 11 22 33 C1 C2 C3 C4 C5 C6 C7 C8'), { secSvc: AE, secIv: 2, secSn: 2, secPl: 1, secMac: 8 });
  assert.deepEqual(r.fields.slice(10).map(f => f.fid), ['spi', 'iv', 'sqn', 'pl', 'tcud', 'mac', 'tcfecf']);
  const noIv = tc(tcFrame('C5 00 07 00 2A 11 22 C1 C2 C3 C4 C5 C6 C7 C8'), { secSvc: AUTH, secSn: 2, secMac: 8 });
  assert.equal(field(noIv, 'iv'), undefined);
  assert.equal(field(noIv, 'pl'), undefined);
});

test('SDLS fields are decoded, and link to the SDLS pages', () => {
  const r = tc(tcFrame('C5 12 34 00 00 01 00 05 11 22 33 44 55 66 C1 C2 C3 C4 C5 C6 C7 C8'), { secSvc: AE, secSn: 4, secPl: 1, secMac: 8 });
  assert.equal(field(r, 'spi').value, String(0x1234));
  assert.equal(field(r, 'spi').off, 6 * 8);
  assert.equal(field(r, 'spi').bits, 16);
  assert.equal(field(r, 'sqn').meaning, 'Anti-replay count = 256');
  assert.equal(field(r, 'pl').meaning, '5 octets of fill in the Frame Data');
  for (const f of ['spi', 'sqn', 'pl', 'mac']) assert.equal(field(r, f).proto, 'sdls', f);
});

test('an 8-octet Sequence Number keeps its exact value', () => {
  const r = tc(tcFrame('C5 00 07 FF FF FF FF FF FF FF FF 11 C1 C2 C3 C4 C5 C6 C7 C8'), { secSvc: AUTH, secSn: 8, secMac: 8 });
  assert.equal(field(r, 'sqn').meaning, 'Anti-replay count = 18446744073709551615');
});

test('reserved SPI values 0 and 65535 are errors (355.0 § 4.1.1.2.3)', () => {
  const frame = (spi) => tcFrame('C5 ' + spi + ' 00 00 00 2A 11 C1 C2 C3 C4 C5 C6 C7 C8');
  const set = { secSvc: AUTH, secSn: 4, secMac: 8 };
  for (const spi of ['00 00', 'FF FF']) {
    const r = tc(frame(spi), set);
    assert.deepEqual(refs(r, 'err'), ['355.0 § 4.1.1.2.3'], spi);
    assert.equal(field(r, 'spi').meaning, 'Reserved by CCSDS');
  }
  for (const spi of ['00 01', 'FF FE']) assert.deepEqual(refs(tc(frame(spi), set), 'err'), [], spi);
});

test('Service Type decides what is plaintext (355.0 § 5)', () => {
  const frame = withFecf(TM_HDR + '00 07 A1 A2 00 2A 11 22 33 C1 C2 C3 C4 C5 C6 C7 C8' + OCF);
  const authn = tm(frame, { secSvc: AUTH, secSn: 2, secMac: 8, secIv: 2 });
  assert.doesNotMatch(field(authn, 'df').meaning, /ciphertext/);
  assert.match(authn.checks.find(c => c.ref === '355.0 § 5.1').msg, /^Authentication — the Frame Data is plaintext\. The MAC covers octets 0–14/);

  const ae = tm(frame, { secSvc: AE, secSn: 2, secMac: 8, secIv: 2 });
  assert.match(field(ae, 'df').meaning, /ciphertext$/);
  assert.match(ae.checks.find(c => c.ref === '355.0 § 5.1').msg, /^Authenticated Encryption — octets 12–14 \(Frame Data\) are ciphertext; .* The MAC covers octets 0–14/);

  const enc = tm(withFecf(TM_HDR + '00 07 A1 A2 11 22 33' + OCF), { secSvc: ENC, secIv: 2 });
  assert.match(field(enc, 'df').meaning, /ciphertext$/);
  const msg = enc.checks.find(c => c.ref === '355.0 § 5.1').msg;
  assert.match(msg, /^Encryption — octets 10–12 \(Frame Data\) are ciphertext/);
  assert.doesNotMatch(msg, /MAC/);
});

test('TC: the MAC covers the Segment Header too, and encryption leaves it in clear (355.0 figure 5-2)', () => {
  const r = tc(tcFrame('C5 00 07 00 2A 11 22 33 C1 C2 C3 C4 C5 C6 C7 C8'), { secSvc: AE, secSn: 2, secMac: 8 });
  assert.match(r.checks.find(c => c.ref === '355.0 § 5.2').msg, /octets 10–12 \(Frame Data\) are ciphertext.*The MAC covers octets 0–12/);
  assert.match(field(r, 'tcud').meaning, /ciphertext$/);
});

test('the First Header Pointer counts from the Frame Data, after the Security Header (132.0 § 6.3.5)', () => {
  const r = tm(withFecf('02 A2 11 05 18 02 00 07 00 2A 11 22 33 44 C1 C2 C3 C4 C5 C6 C7 C8'), { secSvc: AUTH, secSn: 2, secMac: 8 });
  assert.match(field(r, 'fhp').meaning, /Data Field octet 2 \(frame octet 12\)/);
  assert.deepEqual(r.fields.filter(f => f.fid === 'df').map(f => f.raw), ['1122', '3344']);
});

test('Security Association consistency with the Service Type (355.0 § 4.1)', () => {
  const frame = withFecf(TM_HDR + '00 07 '.padEnd(6) + '11 22 33 44 55 66 77 88 99 AA BB CC DD EE FF 10 20 30 40 50' + OCF);
  const c = (set) => tm(frame, set);
  // Authentication needs a trailer, and encryption alone does not allow a Sequence Number.
  assert.ok(refs(c({ secSvc: AUTH, secSn: 2, secMac: 0 }), 'err').includes('355.0 § 4.1.2.2'));
  assert.ok(refs(c({ secSvc: AE, secIv: 12, secMac: 0 }), 'err').includes('355.0 § 4.1.2.2'));
  assert.ok(refs(c({ secSvc: ENC, secSn: 2 }), 'err').includes('355.0 § 4.1.1.4.4'));
  assert.deepEqual(refs(c({ secSvc: ENC, secIv: 2, secMac: 8 }), 'warn'), ['355.0 § 4.2.3.3']);
  // Anti-replay: authentication needs a Sequence Number; with authenticated encryption an IV can serve as one (annex E1).
  assert.deepEqual(refs(c({ secSvc: AUTH, secSn: 0, secMac: 8 }), 'warn'), ['355.0 § 4.1.1.4.2']);
  assert.deepEqual(refs(c({ secSvc: AE, secSn: 0, secIv: 0, secMac: 8 }), 'warn'), ['355.0 § 4.1.1.4.2']);
  assert.deepEqual(refs(c({ secSvc: AE, secSn: 0, secIv: 2, secMac: 8 }), 'warn'), []);
});

test('lengths outside table 6-1 are flagged', () => {
  const frame = withFecf(TM_HDR + '00 07 '.padEnd(6) + '11 22 33 44 55 66 77 88 99 AA BB CC DD EE FF 10 20 30 40 50' + OCF);
  assert.deepEqual(refs(tm(frame, { secSvc: AUTH, secSn: 1, secMac: 8 }), 'warn'), ['355.0 TABLE 6-1']);
  assert.deepEqual(refs(tm(frame, { secSvc: AUTH, secSn: 2, secMac: 7 }), 'warn'), ['355.0 TABLE 6-1']);
  assert.deepEqual(refs(tm(frame, { secSvc: AUTH, secSn: 2, secMac: 8 }), 'warn'), []);
});

test('Pad Length larger than the Frame Data is flagged (355.0 § 4.1.1.5.2)', () => {
  const frame = (pad) => tcFrame('C5 00 07 00 2A ' + pad + ' 11 22 33 C1 C2 C3 C4 C5 C6 C7 C8');
  const set = { secSvc: AE, secSn: 2, secPl: 1, secMac: 8 };
  assert.deepEqual(refs(tc(frame('03'), set), 'warn'), []);
  assert.deepEqual(refs(tc(frame('04'), set), 'warn'), ['355.0 § 4.1.1.5.2']);
});

test('frames that never carry SDLS skip its fields whatever the settings say', () => {
  const set = { secSvc: AE, secIv: 12, secMac: 16 };
  // TM Only Idle Data (132.0 § 6.4.6.2). Its checks must not complain about the unused SA either.
  const oid = tm(example(TM_DECODE, 'Only Idle Data').hex, { ...set, secMac: 0 });
  assert.equal(field(oid, 'spi'), undefined);
  assert.ok(refs(oid, 'info').includes('§ 6.4.6.2'));
  assert.ok(refs(oid, 'ok').includes('§ 4.1.4.6.2'));
  assert.deepEqual(refs(oid, 'err'), []);
  // TC Type-C (232.0 § 6.3.4.1)
  const typeC = tc(example(TC_DECODE, 'Type-BC · Set V(R)').hex, { ...set, secMac: 0 });
  assert.equal(field(typeC, 'spi'), undefined);
  assert.equal(field(typeC, 'tccc').meaning, 'Set V(R) — V(R) = 42');
  assert.ok(refs(typeC, 'info').includes('§ 6.3.4.1'));
  assert.deepEqual(refs(typeC, 'err'), []);
});

test('SDLS off means no SDLS fields or messages, even with lengths set', () => {
  const r = tm(example(TM_DECODE, 'Packets · OCF').hex, { secSvc: 0, secIv: 12, secMac: 16 });
  assert.equal(field(r, 'spi'), undefined);
  assert.equal(field(r, 'df').bits / 8, 18);
  assert.equal(r.checks.filter(c => /355\.0/.test(c.ref)).length, 0);
});

test('a frame too short for its SA is an error, not a misread', () => {
  const r = tm(example(TM_DECODE, 'Packets · OCF').hex, { secSvc: AE, secIv: 12, secMac: 16 });
  assert.ok(refs(r, 'err').includes('§ 4.1.4.2'));
  assert.equal(field(r, 'spi'), undefined);
});

test('a frame cut inside the Security Header reports the SPI missing, not as a value of 0', () => {
  const b = bytes(TM_HDR).concat([0x00]);
  const r = decodeTm(b, { frameLen: 60, fecf: 1, secSvc: AUTH, secIv: 0, secSn: 2, secPl: 0, secMac: 8 });
  assert.match(field(r, 'spi').meaning, /^Truncated — 1 of 2 octets/);
  assert.ok(!refs(r, 'err').includes('355.0 § 4.1.1.2.3'));
  assert.equal(field(r, 'sqn').value, 'MISSING');
  assert.equal(field(r, 'sqn').meaning, 'Truncated — 0 of 2 octets received. Anti-replay count');
});

test('the FECF covers the SDLS fields (132.0 § 6.3.8)', () => {
  const r = tm(example(TM_DECODE, 'SDLS · baseline').hex, example(TM_DECODE, 'SDLS · baseline').set);
  assert.ok(refs(r, 'ok').includes('§ 4.1.6.3'));
  const flipped = bytes(example(TM_DECODE, 'SDLS · baseline').hex); flipped[10] ^= 1;
  assert.deepEqual(refs(decodeTm(flipped, { frameLen: 0, fecf: 1, ...example(TM_DECODE, 'SDLS · baseline').set }), 'err'), ['§ 4.1.6.3']);
});

test('baselines of annex E: TM 14-octet header, TC 6-octet header, both 16-octet MAC', () => {
  const tmEx = example(TM_DECODE, 'SDLS · baseline'), tcEx = example(TC_DECODE, 'SDLS · baseline');
  const a = tm(tmEx.hex, tmEx.set), c = tc(tcEx.hex, tcEx.set);
  assert.equal(field(a, 'iv').bits / 8, 12);
  assert.equal(field(a, 'sqn'), undefined);
  assert.equal(field(a, 'df').off / 8 - field(a, 'spi').off / 8, 14);
  assert.equal(field(a, 'mac').bits / 8, 16);
  assert.equal(field(c, 'sqn').bits / 8, 4);
  assert.equal(field(c, 'iv'), undefined);
  assert.equal(field(c, 'tcud').off / 8 - field(c, 'spi').off / 8, 6);
  assert.equal(field(c, 'mac').bits / 8, 16);
  assert.deepEqual([...refs(a, 'err'), ...refs(a, 'warn'), ...refs(c, 'err'), ...refs(c, 'warn')], []);
  // Selecting a service starts from the same lengths.
  const defaults = (spec) => Object.fromEntries(spec.settings.filter(s => s.id.startsWith('sec') && s.id !== 'secSvc').map(s => [s.id, s.def]));
  assert.deepEqual(defaults(TM_DECODE), { secIv: 12, secSn: 0, secPl: 0, secMac: 16 });
  assert.deepEqual(defaults(TC_DECODE), { secIv: 0, secSn: 4, secPl: 0, secMac: 16 });
});
