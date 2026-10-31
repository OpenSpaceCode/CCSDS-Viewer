// Frame Builder: SDLS and the Segment Header as parts of the TM and TC frames.
// Round trips feed the Builder's bytes to the Frame Decoder through the same render path the page uses.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { loadComponent } from './load.mjs';

const Component = loadComponent();
const AUTH = '1', ENC = '2', AE = '3';

const build = (bProto, vals = {}) => {
  const c = new Component({});
  c.state = { ...c.state, view: 'build', bProto, bVals: { [bProto]: vals } };
  return c.renderVals();
};
const decode = (dProto, hex, set) => {
  const c = new Component({});
  c.state = { ...c.state, view: 'decode', dProto, dHex: { [dProto]: hex }, dSet: { [dProto]: set } };
  return c.renderVals();
};
const section = (v, name) => [...v.bSections, ...v.bAfter].find(s => s.name === name);
const fieldIn = (v, id) => [...v.bSections, ...v.bAfter].flatMap(s => s.list).find(f => f.id === id);
const abbrs = (v) => v.bRibbon.map(r => r.abbr);
const lengths = (v, id) => fieldIn(v, id).octOpts.map(o => Number(o.v));
const row = (v, fid) => v.dFields.find(f => f.fid === fid);
const errors = (v) => v.dChecks.filter(c => c.label === 'ERROR' || c.label === 'WARN').map(c => c.msg);

test('SDLS is part of the TM and TC builders, not a builder of its own', () => {
  const c = new Component({});
  assert.deepEqual(c.BUILD_ORDER, ['tm', 'tc', 'spp']);
  assert.equal(c.BUILD_SPECS.sdls, undefined);
  assert.ok(section(build('tm'), 'SECURITY HEADER'));
  assert.ok(section(build('tc'), 'SECURITY HEADER'));
  assert.equal(section(build('spp'), 'SECURITY HEADER'), undefined, 'SDLS applies to Transfer Frames, not to Space Packets');
});

test('with SDLS not in use, only the setting shows and nothing is transmitted', () => {
  const v = build('tm');
  const s = section(v, 'SECURITY HEADER');
  assert.equal(s.off, true);
  assert.deepEqual(s.list.map(f => f.id), ['secSvc']);
  assert.equal(s.list[0].bitsLabel, 'MANAGED');
  assert.equal(section(v, 'SECURITY TRAILER'), undefined);
  assert.equal(v.bTotalLabel, '48 BITS · 6 OCTETS');
});

test('choosing a service starts from the annex E baseline of the protocol', () => {
  const tm = build('tm', { secSvc: AE });
  assert.equal(fieldIn(tm, 'secIv').nb / 8, 12);
  assert.equal(fieldIn(tm, 'secSn').nb, 0);
  assert.equal(fieldIn(tm, 'secPl').nb, 0);
  assert.equal(fieldIn(tm, 'secMac').nb / 8, 16);
  const tc = build('tc', { secSvc: AUTH });
  assert.equal(fieldIn(tc, 'secIv').nb, 0);
  assert.equal(fieldIn(tc, 'secSn').nb / 8, 4);
  assert.equal(fieldIn(tc, 'secMac').nb / 8, 16);
});

test('fields go on the wire in the order of the Standard', () => {
  const tm = build('tm', { secSvc: AE, shf: '1', payload__oct: '2', secSn__oct: '2', secPl__oct: '1' });
  assert.deepEqual(abbrs(tm).slice(11), ['SHVN', 'SHLEN', 'SHDF', 'SPI', 'IV', 'SN', 'PL', 'DATA', 'MAC']);
  const tc = build('tc', { secSvc: AE, payload__oct: '2', secIv__oct: '2', secPl__oct: '1' });
  assert.deepEqual(abbrs(tc).slice(8), ['SEQF', 'MAP', 'SPI', 'IV', 'SN', 'PL', 'DATA', 'MAC']);
});

test('only the lengths the service allows are offered (355.0 table 6-1, § 4.1)', () => {
  const auth = build('tm', { secSvc: AUTH });
  assert.deepEqual(lengths(auth, 'secSn'), [2, 3, 4, 5, 6, 7, 8], 'authentication needs a Sequence Number');
  assert.equal(lengths(auth, 'secMac')[0], 8);
  assert.equal(lengths(auth, 'secMac').at(-1), 64);
  assert.equal(lengths(auth, 'secIv').at(-1), 32);
  assert.deepEqual(lengths(auth, 'secPl'), [0, 1, 2]);

  const ae = build('tm', { secSvc: AE });
  assert.deepEqual(lengths(ae, 'secSn'), [0, 2, 3, 4, 5, 6, 7, 8], 'an IV may serve as the Sequence Number');
  const noIv = build('tm', { secSvc: AE, secIv__oct: '0' });
  assert.deepEqual(lengths(noIv, 'secSn'), [2, 3, 4, 5, 6, 7, 8], 'without an IV, nothing else can');
  assert.equal(fieldIn(noIv, 'secSn').nb / 8, 2);

  const enc = build('tm', { secSvc: ENC });
  assert.equal(fieldIn(enc, 'secSn'), undefined, 'no Sequence Number without authentication');
  assert.equal(fieldIn(enc, 'secMac'), undefined);
  assert.equal(section(enc, 'SECURITY TRAILER'), undefined);
});

test('a length the service does not allow moves to the next allowed one, and the selector agrees', () => {
  // TM's baseline has no Sequence Number, which Authentication does not allow.
  const v = build('tm', { secSvc: AUTH });
  assert.equal(fieldIn(v, 'secSn').nb / 8, 2);
  assert.equal(fieldIn(v, 'secSn').oct, '2');
  const short = build('tm', { secSvc: AE, secMac__oct: '4', secSn__oct: '1' });
  assert.equal(fieldIn(short, 'secMac').nb / 8, 8);
  assert.equal(fieldIn(short, 'secMac').oct, '8');
  assert.equal(fieldIn(short, 'secSn').nb / 8, 2);
});

test('a reserved SPI can be built, for testing, but says so (355.0 § 4.1.1.2.3)', () => {
  for (const spi of ['0', '65535']) assert.match(fieldIn(build('tm', { secSvc: AE, spi }), 'spi').overMsg, /^Reserved by CCSDS/, spi);
  assert.equal(fieldIn(build('tm', { secSvc: AE, spi: '1' }), 'spi').over, false);
  assert.match(fieldIn(build('tm', { secSvc: AE, spi: '70000' }), 'spi').overMsg, /clamped/);
});

test('frames that never carry SDLS get no fields, and say why', () => {
  const typeC = build('tc', { secSvc: AE, ccf: '1' });
  assert.equal(section(typeC, 'SECURITY HEADER').off, true);
  assert.deepEqual(section(typeC, 'SECURITY HEADER').list.map(f => f.id), ['secSvc'], 'the setting stays, as it applies to Type-D frames');
  assert.match(section(typeC, 'SECURITY HEADER').note, /§ 6\.3\.4\.1/);
  assert.equal(section(typeC, 'SECURITY TRAILER'), undefined);
  assert.equal(typeC.bTotalLabel, '40 BITS · 5 OCTETS');

  const oid = build('tm', { secSvc: AE, fhp: '2046' });
  assert.equal(section(oid, 'SECURITY HEADER').off, true);
  assert.match(section(oid, 'SECURITY HEADER').note, /§ 6\.4\.6\.2/);
  assert.equal(oid.bTotalLabel, '48 BITS · 6 OCTETS');

  // With a VCA_SDU the pointer is undefined, so 2046 does not make it an Only Idle Data frame.
  assert.equal(section(build('tm', { secSvc: AE, fhp: '2046', syncf: '1' }), 'SECURITY HEADER').on, true);
});

test('Segment Header: present by default, absent by setting, never in a Type-C frame (232.0 § 4.1.3.2.2)', () => {
  const v = build('tc', { segf: '1', segmap: '5' });
  assert.equal(v.bHex.split(' ')[5], '45', 'flags 01, MAP 000101');
  assert.equal(section(v, 'SEGMENT HEADER').on, true);
  assert.equal(build('tc').bTotalLabel, '48 BITS · 6 OCTETS');

  const absent = build('tc', { seg: '0' });
  assert.equal(section(absent, 'SEGMENT HEADER').off, true);
  assert.equal(absent.bTotalLabel, '40 BITS · 5 OCTETS');

  const typeC = build('tc', { ccf: '1' });
  assert.equal(section(typeC, 'SEGMENT HEADER').off, true);
  assert.match(section(typeC, 'SEGMENT HEADER').note, /§ 4\.1\.3\.2\.2\.1\.3/);
});

test('the payload note follows the service', () => {
  assert.match(build('tm', { secSvc: AUTH }).bPayNote, /stays plaintext/);
  assert.match(build('tm', { secSvc: AE }).bPayNote, /ciphertext/);
  assert.doesNotMatch(build('tm').bPayNote, /plaintext|ciphertext/);
});

test('round trip TM, authenticated encryption, with a Secondary Header', () => {
  const v = build('tm', { secSvc: AE, shf: '1', spi: '7', secIv: '0102030405060708090A0B0C', payload__oct: '4', payload: 'CAFEF00D', secMac: 'AB'.repeat(16) });
  const d = decode('tm', v.bHex, { fecf: '0', secSvc: AE });
  assert.deepEqual(errors(d), []);
  assert.equal(row(d, 'spi').value, '7');
  assert.equal(row(d, 'iv').raw, '0102030405060708090A0B0C');
  assert.equal(row(d, 'shdf').raw, 'A1B2');
  assert.equal(row(d, 'df').raw, 'CAFEF00D');
  assert.match(row(d, 'df').meaning, /ciphertext$/);
  assert.equal(row(d, 'mac').raw, 'AB'.repeat(12) + '…');
});

test('round trip TC, authentication, with a Segment Header', () => {
  const total = 5 + 1 + 6 + 4 + 16;
  const v = build('tc', { secSvc: AUTH, tcflen: String(total - 1), segf: '1', segmap: '9', spi: '2', secSn: '0000012C', payload__oct: '4', payload: 'CAFEF00D' });
  assert.equal(v.bTotalLabel, total * 8 + ' BITS · ' + total + ' OCTETS');
  const d = decode('tc', v.bHex, { fecf: '0', secSvc: AUTH });
  assert.deepEqual(errors(d), []);
  assert.equal(row(d, 'tcsqf').value, '1');
  assert.equal(row(d, 'tcmap').value, '9');
  assert.equal(row(d, 'spi').value, '2');
  assert.equal(row(d, 'sqn').meaning, 'Anti-replay count = 300');
  assert.equal(row(d, 'tcud').raw, 'CAFEF00D');
  assert.doesNotMatch(row(d, 'tcud').meaning, /ciphertext/);
});

test('round trip for every service and length combination the builder offers', () => {
  for (const [proto, base] of [['tm', {}], ['tc', { seg: '0' }]]) for (const svc of [AUTH, ENC, AE]) {
    const probe = build(proto, { ...base, secSvc: svc, secIv__oct: '32' });
    const pick = (id) => fieldIn(probe, id) ? [lengths(probe, id)[0], lengths(probe, id).at(-1)] : [0];
    for (const iv of pick('secIv')) for (const sn of pick('secSn')) for (const pl of pick('secPl')) for (const mac of pick('secMac')) {
      if (svc === AE && iv === 0 && sn === 0) continue;   // not offered: see the test on allowed lengths
      const lens = { secIv__oct: String(iv), secSn__oct: String(sn), secPl__oct: String(pl), secMac__oct: String(mac) };
      const total = (proto === 'tm' ? 6 : 5) + 2 + iv + sn + pl + 3 + mac;
      const vals = { ...base, secSvc: svc, ...lens, payload__oct: '3', payload: '112233', secPl: pl ? '00'.repeat(pl) : '', ...(proto === 'tc' ? { tcflen: String(total - 1) } : {}) };
      const v = build(proto, vals);
      assert.equal(v.bTotalLabel, total * 8 + ' BITS · ' + total + ' OCTETS');
      const set = { fecf: '0', secSvc: svc, secIv: String(iv), secSn: String(sn), secPl: String(pl), secMac: String(mac), ...base };
      const d = decode(proto, v.bHex, set);
      const label = [proto, svc, iv, sn, pl, mac].join('/');
      assert.deepEqual(errors(d), [], label);
      assert.equal(row(d, proto === 'tm' ? 'df' : 'tcud').raw, '112233', label);
    }
  }
});

test('TM OCF: built only when the flag is set, as four octets of entered hex (132.0 § 4.1.5)', () => {
  const off = build('tm', { payload__oct: '2', payload: 'AABB' });
  assert.equal(section(off, 'OPERATIONAL CONTROL FIELD').off, true);
  assert.equal(fieldIn(off, 'ocf'), undefined);
  assert.equal(off.bHex, '02 A2 11 05 18 00 AA BB', 'nothing is added without the flag');

  const on = build('tm', { ocff: '1', payload__oct: '2', payload: 'AABB', ocf: '01000005' });
  assert.equal(on.bHex, '02 A3 11 05 18 00 AA BB 01 00 00 05');
  assert.equal(fieldIn(on, 'ocf').nb, 32);
  assert.equal(fieldIn(on, 'ocf').bitsLabel, '32 BITS');
  assert.equal(fieldIn(on, 'ocf').isHex, true);
  assert.deepEqual(fieldIn(on, 'ocf').octOpts, [], 'the length is fixed');
  assert.equal(on.bRibbon.at(-1).abbr, 'OCF');
  assert.equal(on.bRibbon.filter(r => r.abbr === 'OCF').length, 1, 'the flag has its own label, OCFF');
});

test('TM OCF: nothing is computed, and the default is all zeros', () => {
  assert.equal(build('tm', { ocff: '1' }).bHex, '02 A3 11 05 18 00 00 00 00 00');
  assert.equal(build('tm', { ocff: '1', ocf: 'DEADBEEF' }).bHex, '02 A3 11 05 18 00 DE AD BE EF', 'whatever is entered goes on the wire as it is');
});

test('TM OCF: wrong-length input is padded or cut, and says so', () => {
  const short = build('tm', { ocff: '1', ocf: 'AB' });
  assert.equal(short.bHex, '02 A3 11 05 18 00 AB 00 00 00');
  assert.match(fieldIn(short, 'ocf').overMsg, /Zero-padded to 4 octets/);
  const long = build('tm', { ocff: '1', ocf: '0102030405' });
  assert.equal(long.bHex, '02 A3 11 05 18 00 01 02 03 04');
  assert.match(fieldIn(long, 'ocf').overMsg, /Extra digits ignored/);
});

test('TM OCF: the note states the report the first bits declare, as the decoder does', () => {
  const note = (ocf) => section(build('tm', { ocff: '1', ocf }), 'OPERATIONAL CONTROL FIELD').note;
  for (const [ocf, type] of [['01000005', 'Type-1 Report — CLCW'], ['41000000', 'Type-1 Report — CLCW'], ['81000000', 'Type-2 Report — project-specific'], ['C1000000', 'Type-2 Report — SDLS Frame Security Report']]) {
    assert.match(note(ocf), new RegExp(type), ocf);
    assert.equal(row(decode('tm', '02 A3 11 05 18 00 AA BB ' + ocf.match(/../g).join(' '), { fecf: '0' }), 'ocf').meaning, type, ocf);
  }
  assert.match(section(build('tm', { ocff: '1' }), 'OPERATIONAL CONTROL FIELD').note, /Type-1 Report/, 'before anything is typed');
  assert.match(note(''), /Type-1 Report/);
  assert.match(note('8'), /Type-2 Report — project-specific/, 'half an octet still sets the type bits');
});

test('TM OCF comes after the Security Trailer, outside what SDLS protects (132.0 § 6.3.7.2)', () => {
  const v = build('tm', { ocff: '1', secSvc: AE, payload__oct: '2' });
  assert.deepEqual(abbrs(v).slice(-3), ['DATA', 'MAC', 'OCF']);
  assert.deepEqual(v.bAfter.map(s => s.name), ['SECURITY TRAILER', 'OPERATIONAL CONTROL FIELD']);
});

test('round trip TM with an OCF, with and without SDLS', () => {
  const plain = decode('tm', build('tm', { ocff: '1', payload__oct: '4', payload: 'CAFEF00D', ocf: '81ABCDEF' }).bHex, { fecf: '0' });
  assert.deepEqual(errors(plain), []);
  assert.equal(row(plain, 'df').raw, 'CAFEF00D');
  assert.equal(row(plain, 'ocf').raw, '81ABCDEF');
  assert.equal(row(plain, 'ocf').meaning, 'Type-2 Report — project-specific');

  const secure = decode('tm', build('tm', { ocff: '1', secSvc: AE, payload__oct: '4', payload: 'CAFEF00D', ocf: '01000005' }).bHex, { fecf: '0', secSvc: AE });
  assert.deepEqual(errors(secure), []);
  assert.equal(row(secure, 'df').raw, 'CAFEF00D');
  assert.equal(row(secure, 'ocf').raw, '01000005');
  assert.ok(secure.dFields.findIndex(f => f.fid === 'mac') < secure.dFields.findIndex(f => f.fid === 'ocf'));
});

test('an Only Idle Data frame can still carry an OCF (132.0 § 4.1.4.6.3, note 1)', () => {
  const v = build('tm', { ocff: '1', fhp: '2046', secSvc: AE, ocf: '01000005' });
  assert.equal(section(v, 'SECURITY HEADER').off, true);
  assert.equal(section(v, 'OPERATIONAL CONTROL FIELD').on, true);
  assert.equal(v.bHex, '02 A3 11 05 1F FE 01 00 00 05');
});

test('only TM has an OCF section', () => {
  for (const p of ['tc', 'spp']) assert.equal(section(build(p), 'OPERATIONAL CONTROL FIELD'), undefined, p);
});

test('RESET clears the SDLS settings too', () => {
  const c = new Component({});
  c.state = { ...c.state, view: 'build', bProto: 'tm', bVals: { tm: { secSvc: AE } } };
  assert.equal(section(c.renderVals(), 'SECURITY HEADER').on, true);
  c.renderVals().bReset();
  assert.equal(section(c.renderVals(), 'SECURITY HEADER').off, true);
});
