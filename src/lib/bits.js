// Octet/bit helpers shared by the Frame Decoder. Octets are arrays of 0–255; bit 0 is the MSB of octet 0.

// Accepts '08 64 C0 01', '0x08,0x64', '08:64', multi-line dumps; rejects anything else.
function parseHex(text) {
  const s = String(text || '').replace(/(^|[^0-9a-fA-F])0[xX]/g, '$1').replace(/[\s,:;_\-]/g, '');
  const bad = s.match(/[^0-9a-fA-F]/);
  if (bad) return { bytes: [], err: 'Not a hex digit: ‘' + bad[0] + '’.' };
  if (s.length % 2) return { bytes: [], err: 'Odd number of hex digits (' + s.length + ') — the last octet is incomplete.' };
  const bytes = [];
  for (let i = 0; i < s.length; i += 2) bytes.push(parseInt(s.slice(i, i + 2), 16));
  return { bytes, err: '' };
}

function readBits(b, off, n) {
  let v = 0;
  for (let i = off; i < off + n; i++) v = v * 2 + ((b[i >> 3] >> (7 - (i & 7))) & 1);
  return v;
}

function binStr(b, off, n) { return readBits(b, off, n).toString(2).padStart(n, '0'); }

function hexStr(b, from, count, cap) {
  const n = Math.min(count, cap || count);
  let s = '';
  for (let i = from; i < from + n; i++) s += b[i].toString(16).toUpperCase().padStart(2, '0');
  return s + (count > n ? '…' : '');
}

function oct(n) { return n + (n === 1 ? ' octet' : ' octets'); }

// CRC-16 with G(X) = X^16 + X^12 + X^5 + 1 and the register preset to all ones (FECF of TM and TC frames).
function crc16(b, from, count) {
  let crc = 0xFFFF;
  for (let i = from; i < from + count; i++) {
    crc ^= b[i] << 8;
    for (let k = 0; k < 8; k++) crc = crc & 0x8000 ? ((crc << 1) ^ 0x1021) & 0xFFFF : (crc << 1) & 0xFFFF;
  }
  return crc;
}

// Collects a decoder's result. bitField/octField/fecfField append to `fields` in wire order.
function decodeHelpers(b) {
  const fields = [], checks = [];
  const check = (level, msg, ref) => checks.push({ level, msg, ref });
  // opts: extra (received but not part of the PDU), proto (protocol whose diagram the field's page belongs to).
  const bitField = (fid, n, abbr, off, bits, meaning, opts) => {
    const v = readBits(b, off, bits);
    fields.push({ fid, n, abbr, off, bits, value: String(v), raw: binStr(b, off, bits), meaning: meaning(v), ...opts });
    return v;
  };
  // Octet-aligned field of `want` octets at `from`, clipped to what was received.
  const octField = (fid, n, abbr, from, want, meaning, opts) => {
    const have = Math.max(0, Math.min(want, b.length - from));
    fields.push({ fid, n, abbr, off: from * 8, bits: have * 8, octets: true, ...opts,
      value: have ? oct(have) : 'MISSING',
      raw: have ? hexStr(b, from, have, 12) : '—',
      meaning: have < want ? 'Truncated — ' + have + ' of ' + oct(want) + ' received. ' + meaning : meaning });
    return have;
  };
  // Frame Error Control Field at `pos`, covering everything before it. Not checked if it was not fully received.
  const fecfField = (fid, pos, ref) => {
    const complete = b.length >= pos + 2;
    const got = complete ? (b[pos] << 8) | b[pos + 1] : 0, crc = complete ? crc16(b, 0, pos) : 0;
    const hex = (v) => '0x' + v.toString(16).toUpperCase().padStart(4, '0');
    octField(fid, 'Frame Error Control Field', 'FECF', pos, 2, !complete ? 'CRC not checked' : got === crc ? 'CRC correct' : 'CRC mismatch — computed ' + hex(crc));
    if (complete && got === crc) check('ok', 'Frame Error Control Field is correct: CRC = ' + hex(crc) + '.', ref);
    else if (complete) check('err', 'Frame Error Control Field mismatch: received ' + hex(got) + ', computed ' + hex(crc) + '. The frame is corrupted, or this channel has no FECF — if so, set it to Absent.', ref);
  };
  return { fields, checks, check, bitField, octField, fecfField };
}
