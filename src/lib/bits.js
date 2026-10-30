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
