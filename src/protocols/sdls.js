// Space Data Link Security Protocol — CCSDS 355.0-B-2.
// Field reference pages, structure maps, breadcrumb names, the SDLS coverage view, and the extension
// used by the Frame Decoder and Frame Builder of each Transfer Frame protocol.

const SDLS_FIELDS = {
  sdhdr: { n: 'Transfer Frame Header(s)', parent: 'sdframe', bits: null, len: 'PER BASE PROTOCOL', pres: 'FROM BASE FRAME', ref: '§ 3.3.2',
    desc: 'The Primary Header (and, for TC/USLP with Segment Headers, the Segment Header) of the underlying Transfer Frame. SDLS leaves these fields in the clear — they are needed to route the frame and to identify the Security Association.',
    q: [
      { t: 'The TM ProcessSecurity Payload shall consist of the portion of the TM Transfer Frame from the first octet of the Transfer Frame Primary Header to the last octet of the Security Trailer, if present, or the last octet of the Transfer Frame Data Field, if the Security Trailer is not present.', ref: '§ 3.3.2.2' },
      { t: 'Transfer Frame fields always included for MAC computation are the Virtual Channel ID, Segment Header (TC only), Security Header (except for the Initialization Vector), and Frame Data Field.', ref: '§ 2.3.2.2' } ],
    sp: [], nt: ['The Security Association applicable to a frame is selected from the Global Virtual Channel ID (Master Channel ID + Virtual Channel ID) and, for TC/USLP, the MAP ID — all carried in these base-protocol headers.'],
    map: 'sdframe', hi: ['sdhdr'], kids: [] },

  sdsh: { n: 'Security Header', parent: 'sdframe', bits: null, len: '≤ 64 OCTETS', pres: 'MANDATORY WHEN SECURITY APPLIED', ref: '§ 4.1.1',
    desc: 'Inserted at the start of the Frame Data area. Carries the SPI that identifies the Security Association, plus the optional Initialization Vector, Sequence Number and Pad Length whose lengths are managed per SA.',
    q: [
      { t: 'The Security Header shall consist of one mandatory field and three optional fields, positioned contiguously, in the following sequence: a) Security Parameter Index (16 bits; mandatory); b) Initialization Vector (octet-aligned, fixed-length for the duration of the SA; optional); c) Sequence Number (octet-aligned, fixed-length for the duration of the SA; optional); d) Pad Length (octet-aligned, fixed-length for the duration of the SA; optional).', ref: '§ 4.1.1.1.3' },
      { t: 'A Security Header shall consist of less than or equal to 64 octets.', ref: '§ 4.1.1.1.4' },
      { t: 'The Security Header is mandatory on a Virtual Channel or MAP whenever authentication, encryption, or authenticated encryption is applied on that Virtual Channel or MAP.', ref: '§ 4.1.1.1.2' } ],
    sp: [], nt: ['The receiver determines the presence and length of the optional fields from the SA identified by the SPI — the field lengths are Managed Parameters, not transmitted.'],
    map: 'sdframe', hi: ['sdsh'], kids: ['spi', 'iv', 'sqn', 'pl'] },

  spi: { n: 'Security Parameter Index', parent: 'sdsh', bits: 'BITS 0–15', len: '16 BITS', pres: 'MANDATORY', ref: '§ 4.1.1.2',
    desc: 'The only mandatory Security Header field. A transmitted index that uniquely identifies the Security Association applicable to the frame — effectively a key into the SA data base shared by sender and receiver.',
    q: [
      { t: 'Bits 0-15 of the Security Header shall contain the SPI.', ref: '§ 4.1.1.2.1' },
      { t: 'The SPI shall be used as an index to identify an SA.', ref: '§ 4.1.1.2.2' },
      { t: 'The values of ‘all zeros’ (0) and ‘all ones’ (65535) for this field are reserved.', ref: '§ 4.1.1.2.3' } ],
    sp: [
      { c: '0 (all zeros)', d: 'Reserved value', ref: '§ 4.1.1.2.3' },
      { c: '65535 (all ones)', d: 'Reserved value', ref: '§ 4.1.1.2.3' } ],
    nt: ['All Transfer Frames having the same SPI on a physical channel share a single SA.'],
    map: 'sdsh', hi: ['spi'], kids: [] },

  iv: { n: 'Initialization Vector', parent: 'sdsh', bits: null, len: 'MANAGED (0…n OCTETS)', pres: 'OPTIONAL', ref: '§ 4.1.1.3',
    desc: 'Carries the initialization vector (or an agreed-upon portion of it) for the cryptographic algorithm. Its length is a managed SA parameter, fixed for the SA’s lifetime; zero octets if no IV is required.',
    q: [
      { t: 'The Initialization Vector field shall follow the Security Parameter Index field, without gap.', ref: '§ 4.1.1.3.1' },
      { t: 'The Initialization Vector field shall contain the initialization vector, or an agreed-upon portion of it, consisting of an integral number of octets.', ref: '§ 4.1.1.3.2' },
      { t: 'If an initialization vector is not required for an SA, the Initialization Vector field shall be zero octets in length.', ref: '§ 4.1.1.3.4' } ],
    sp: [ { c: 'IV = SEQUENCE NUMBER', d: 'In counter-mode algorithms the IV may double as the anti-replay Sequence Number; the Sequence Number field is then zero octets', ref: '§ 2.3.2.3.4 b)' } ],
    nt: ['The Initialization Vector field length is managed and is fixed for the duration of the SA.', 'The IV is the one Security Header field excluded from the MAC computation.'],
    map: 'sdsh', hi: ['iv'], kids: [] },

  sqn: { n: 'Sequence Number', parent: 'sdsh', bits: null, len: 'MANAGED (0…n OCTETS)', pres: 'OPTIONAL', ref: '§ 4.1.1.4',
    desc: 'The anti-replay sequence number. Present when authentication or authenticated encryption is selected; incremented by the sender each frame and checked against a sequence-number window by the receiver.',
    q: [
      { t: 'The Sequence Number field shall follow the Initialization Vector field, without gap.', ref: '§ 4.1.1.4.1' },
      { t: 'The Sequence Number field, if authentication or authenticated encryption is selected for an SA, shall contain the anti-replay sequence number, consisting of an integral number of octets.', ref: '§ 4.1.1.4.2' },
      { t: 'If authentication or authenticated encryption is not selected for an SA, the Sequence Number field shall be zero octets in length.', ref: '§ 4.1.1.4.4' } ],
    sp: [ { c: '0 OCTETS', d: 'When the IV serves as the sequence number (counter-mode), or when authentication is not selected', ref: '§ 4.1.1.4.2 / .4' } ],
    nt: ['A received frame whose sequence number falls outside the managed Sequence Number Window is discarded and the stored value is neither replaced nor incremented (2.3.2.3.3).', 'The interpretation of a sequence number rollover to zero is mission-specific.'],
    map: 'sdsh', hi: ['sqn'], kids: [] },

  pl: { n: 'Pad Length', parent: 'sdsh', bits: null, len: 'MANAGED (0…n OCTETS)', pres: 'OPTIONAL', ref: '§ 4.1.1.5',
    desc: 'The count of fill bytes added during the cryptographic process (e.g. to satisfy a block cipher’s block-size requirement). Zero octets if padding is not required for the SA.',
    q: [
      { t: 'The Pad Length field shall follow the Sequence Number field, without gap.', ref: '§ 4.1.1.5.1' },
      { t: 'The Pad Length field shall contain the count of fill bytes used in the cryptographic process, consisting of an integral number of octets.', ref: '§ 4.1.1.5.2' },
      { t: 'If padding is not required for an SA, the Pad Length field shall be zero octets in length.', ref: '§ 4.1.1.5.3' } ],
    sp: [], nt: ['The Pad Length field length is a managed SA parameter (SA_length_PL).'],
    map: 'sdsh', hi: ['pl'], kids: [] },

  sddata: { n: 'Frame Data Field', parent: 'sdframe', bits: null, len: 'VARIES', pres: 'FROM BASE FRAME', ref: '§ 2.3.3',
    desc: 'The user data area of the underlying Transfer Frame. When the SA includes encryption, SDLS encrypts this field; it is always included (with the headers, except the IV) in the MAC computation.',
    q: [
      { t: 'When the Security Protocol is used for authenticated encryption, the frame data supplied by the user is first encrypted, a current anti-replay sequence number is applied to the Transfer Frame, and lastly a MAC is computed over the resultant Transfer Frame (‘encrypt-then-MAC’).', ref: '§ 2.3.2 / 2.3.3' } ],
    sp: [], nt: ['SDLS applies encryption to the Frame Data Field only; the Security Header and Trailer surround it but are not themselves encrypted.'],
    map: 'sdframe', hi: ['sddata'], kids: [] },

  sdtr: { n: 'Security Trailer', parent: 'sdframe', bits: null, len: 'MANAGED', pres: 'PRESENT FOR AUTH / AUTH-ENC', ref: '§ 4.1.2',
    desc: 'Appended after the Frame Data area. Present whenever authentication or authenticated encryption is applied on the Virtual Channel; carries the Message Authentication Code.',
    q: [
      { t: 'The Security Trailer shall be present on a Virtual Channel or MAP whenever authentication or authenticated encryption is applied on that Virtual Channel.', ref: '§ 4.1.2.2' },
      { t: 'The Security Trailer, if present, shall consist of a MAC (octet-aligned, fixed-length for the duration of the SA).', ref: '§ 4.1.2.3' },
      { t: 'The presence or absence of a Security Trailer on a Virtual Channel or MAP shall remain constant throughout a mission.', ref: '§ 4.1.2.1' } ],
    sp: [], nt: ['The length of the Security Trailer is a Managed Parameter (see section 6).'],
    map: 'sdframe', hi: ['sdtr'], kids: ['mac'] },

  mac: { n: 'Message Authentication Code', parent: 'sdtr', bits: null, len: 'MANAGED', pres: 'OPTIONAL (AUTH / AUTH-ENC)', ref: '§ 4.1.2.3',
    desc: 'The authentication tag protecting frame integrity and data-source authenticity. Computed over the Virtual Channel ID, Segment Header (TC), Security Header (excluding the IV) and Frame Data Field, under the SA’s authentication bit mask.',
    q: [
      { t: 'The Security Trailer, if present, shall consist of a MAC (octet-aligned, fixed-length for the duration of the SA).', ref: '§ 4.1.2.3' },
      { t: 'Transfer Frame fields always included for MAC computation are the Virtual Channel ID, Segment Header (TC only), Security Header (except for the Initialization Vector), and Frame Data Field.', ref: '§ 2.3.2.2' } ],
    sp: [ { c: 'MAC FAILURE', d: 'On verification failure the ProcessSecurity function reports a status code and does not decrypt', ref: '§ 3.3.3.2' } ],
    nt: ['The authentication bit mask must be at least as long as the data from the first octet of the Primary Header to the last octet of the Frame Data Field immediately preceding the MAC (4.2.2.6.2).'],
    map: 'sdtr', hi: ['mac'], kids: [] },
};

const SDLS_MAPS = {
  sdframe: { title: 'WITHIN SECURED TRANSFER FRAME', cells: [
    { id: 'sdhdr', l: 'HEADER(S)', w: 2.4 }, { id: 'sdsh', l: 'SECURITY HEADER', w: 1.8 }, { id: 'sddata', l: 'FRAME DATA', w: 2.4 }, { id: 'sdtr', l: 'SEC. TRAILER', w: 1.8 } ] },
  sdsh: { title: 'WITHIN SECURITY HEADER (≤ 64 OCTETS)', cells: [
    { id: 'spi', l: 'SPI', w: 6 }, { id: 'iv', l: 'INITIALIZATION VECTOR', w: 9 }, { id: 'sqn', l: 'SEQUENCE NUMBER', w: 7 }, { id: 'pl', l: 'PAD LENGTH', w: 5 } ] },
  sdtr: { title: 'WITHIN SECURITY TRAILER', cells: [
    { id: 'mac', l: 'MESSAGE AUTHENTICATION CODE', w: 1 } ] },
};

const SDLS_CRUMBS = {
  sdframe: 'SECURED TRANSFER FRAME',
  sdsh: 'SECURITY HEADER',
  sdtr: 'SECURITY TRAILER'
};

// Field search: abbreviations in common use, by field. Initials of the name are matched without being listed.
const SDLS_ABBR = { sdsh: ['SH'], spi: ['SPI'], iv: ['IV'], sqn: ['SN', 'ARSN'], pl: ['PL'], sdtr: ['ST'], mac: ['MAC'] };

// Which part of each base frame SDLS authenticates and which part it encrypts (CCSDS 355.0-B-2, figures 5-1..5-4).
// mac: 'in' = inside the Authentication Payload · 'mask' = inside it but zeroed by the SA authentication bit mask · 'out' = outside.
const SDLS_COVERAGE_ORDER = ['tm', 'tc', 'aos', 'uslp'];
const SDLS_COVERAGE = {
  tm: { tab: 'TM', name: 'TM TRANSFER FRAME', fig: 'FIGURE 5-1 · § 5.1', base: 'CCSDS 132.0-B-3',
    note: 'MAC is computed over Primary Header, Secondary Header, Security Header, and Frame Data. MAC is not computed over ASM (not shown), OCF, or ECF. Encryption is done on Frame Data only.',
    cells: [
      { k: 'ph', n: 'TRANSFER FRAME PRIMARY HEADER', len: '6 OCTETS', w: 1.55, mac: 'in', enc: false, pay: true },
      { k: 'sh', n: 'SECONDARY HEADER', sub: 'optional', len: '2–64 OCT', w: 1.15, mac: 'in', enc: false, pay: true },
      { k: 'sech', n: 'SECURITY HEADER', sub: 'SDLS', len: 'MANAGED', w: 1.25, mac: 'in', enc: false, pay: true },
      { k: 'data', n: 'FRAME DATA FIELD', len: 'VARIES', w: 3, mac: 'in', enc: true, pay: true },
      { k: 'sect', n: 'SECURITY TRAILER', sub: 'MAC · optional', len: 'MANAGED', w: 1.25, mac: 'out', enc: false, pay: false },
      { k: 'ocf', n: 'OCF', sub: 'opt.', len: '4 OCT', w: 0.8, mac: 'out', enc: false, pay: false },
      { k: 'fecf', n: 'FECF', sub: 'opt.', len: '2 OCT', w: 0.8, mac: 'out', enc: false, pay: false } ] },
  tc: { tab: 'TC', name: 'TC TRANSFER FRAME', fig: 'FIGURE 5-2 · § 5.2', base: 'CCSDS 232.0-B-4',
    note: 'MAC is computed over Primary Header, Segment Header, Security Header, and Frame Data. MAC is not computed over CLTU Start Sequence (not shown) or ECF. Encryption is done on Frame Data only.',
    cells: [
      { k: 'ph', n: 'TRANSFER FRAME PRIMARY HEADER', len: '5 OCTETS', w: 1.55, mac: 'in', enc: false, pay: true },
      { k: 'seg', n: 'SEGMENT HEADER', sub: 'MAP channels', len: '1 OCT', w: 0.95, mac: 'in', enc: false, pay: true },
      { k: 'sech', n: 'SECURITY HEADER', sub: 'SDLS', len: 'MANAGED', w: 1.25, mac: 'in', enc: false, pay: true },
      { k: 'data', n: 'FRAME DATA', len: 'VARIES', w: 3, mac: 'in', enc: true, pay: true },
      { k: 'sect', n: 'SECURITY TRAILER', sub: 'MAC · optional', len: 'MANAGED', w: 1.25, mac: 'out', enc: false, pay: false },
      { k: 'fecf', n: 'FECF', sub: 'opt.', len: '2 OCT', w: 0.8, mac: 'out', enc: false, pay: false } ] },
  aos: { tab: 'AOS', name: 'AOS TRANSFER FRAME', fig: 'FIGURE 5-3 · § 5.3', base: 'CCSDS 732.0-B-4',
    note: 'MAC is computed over Primary Header, Security Header, and Frame Data. Insert Zone is masked out. MAC is not computed over ASM (not shown), OCF, or ECF. Encryption is done on Frame Data only.',
    cells: [
      { n: 'TRANSFER FRAME PRIMARY HEADER', len: '6–8 OCT', w: 1.55, mac: 'in', enc: false, pay: true },
      { n: 'INSERT ZONE', sub: 'optional', len: 'MANAGED', w: 1.15, mac: 'mask', enc: false, pay: true },
      { n: 'SECURITY HEADER', sub: 'SDLS', len: 'MANAGED', w: 1.25, mac: 'in', enc: false, pay: true },
      { n: 'FRAME DATA', len: 'VARIES', w: 3, mac: 'in', enc: true, pay: true },
      { n: 'SECURITY TRAILER', sub: 'MAC · optional', len: 'MANAGED', w: 1.25, mac: 'out', enc: false, pay: false },
      { n: 'OCF', sub: 'opt.', len: '4 OCT', w: 0.8, mac: 'out', enc: false, pay: false },
      { n: 'FECF', sub: 'opt.', len: '2 OCT', w: 0.8, mac: 'out', enc: false, pay: false } ] },
  uslp: { tab: 'USLP', name: 'USLP TRANSFER FRAME', fig: 'FIGURE 5-4 · § 5.4', base: 'CCSDS 732.1-B-2',
    note: 'MAC is computed over Primary Header, Security Header, and Frame Data. Insert Zone is masked out. MAC is not computed over ASM (not shown), OCF, or ECF. Encryption is done on Transfer Frame Data Field only.',
    cells: [
      { n: 'TRANSFER FRAME PRIMARY HEADER', len: '4–14 OCT', w: 1.55, mac: 'in', enc: false, pay: true },
      { n: 'INSERT ZONE', sub: 'optional', len: 'MANAGED', w: 1.15, mac: 'mask', enc: false, pay: true },
      { n: 'SECURITY HEADER', sub: 'SDLS', len: 'MANAGED', w: 1.25, mac: 'in', enc: false, pay: true },
      { n: 'TRANSFER FRAME DATA FIELD', len: 'VARIES', w: 3, mac: 'in', enc: true, pay: true },
      { n: 'SECURITY TRAILER', sub: 'MAC · optional', len: 'MANAGED', w: 1.25, mac: 'out', enc: false, pay: false },
      { n: 'OCF', sub: 'opt.', len: '4 OCT', w: 0.8, mac: 'out', enc: false, pay: false },
      { n: 'FECF', sub: 'opt.', len: '2/4 OCT', w: 0.8, mac: 'out', enc: false, pay: false } ] }
};

// SDLS has no frame of its own: the TM or TC protocol calls it, and it only adds a Security Header and Trailer inside
// that frame (§ 3.1, § 4.1). Their field lengths are not in the frame either; the SPI selects a Security Association
// that holds them. So one SA is configured as a setting, and each frame's decoder and builder embeds the fields.
const SDLS_NONE = 0, SDLS_AUTH = 1, SDLS_ENC = 2, SDLS_AE = 3;
const SDLS_SERVICES = [{ v: SDLS_NONE, l: 'Not in use' }, { v: SDLS_AUTH, l: 'Authentication' }, { v: SDLS_ENC, l: 'Encryption' }, { v: SDLS_AE, l: 'Authenticated Encryption' }];
const SDLS_SA_NOTE = 'SA service type. The lengths below describe that one Security Association';

// Allowed lengths in octets when the field is used (table 6-1).
const SDLS_LEN = { iv: [1, 32], sn: [2, 8], pl: [1, 2], mac: [8, 64] };

// Applied when loading an example that does not use SDLS, so settings left over from one that does cannot misplace its fields.
const SDLS_OFF = { secSvc: SDLS_NONE };

// baseline: the protocol's annex E lengths, as the defaults once a service is selected.
function sdlsSettings(baseline) {
  const on = (set) => set.secSvc !== SDLS_NONE;
  const length = (id, n, ref, max, note, def) => ({ id, n, ref, unit: 'octets', def, min: 0, max, note, showIf: on });
  return [
    { id: 'secSvc', n: 'Space Data Link Security', ref: '355.0 TABLE 6-1', def: SDLS_NONE,
      opts: SDLS_SERVICES,
      note: SDLS_SA_NOTE + ', and apply to every frame decoded here.' },
    length('secIv', 'Initialization Vector length', '355.0 TABLE 6-1', SDLS_LEN.iv[1], 'SA_length_IV: 1–32 octets, 0 = not used.', baseline.iv),
    length('secSn', 'Sequence Number length', '355.0 TABLE 6-1', SDLS_LEN.sn[1], 'SA_length_SN: 2–8 octets, 0 = not used.', baseline.sn),
    length('secPl', 'Pad Length field length', '355.0 TABLE 6-1', SDLS_LEN.pl[1], 'SA_length_PL: 1–2 octets, 0 = not used.', baseline.pl),
    length('secMac', 'MAC length', '355.0 TABLE 6-1', SDLS_LEN.mac[1], 'SA_length_MAC: 8–64 octets, 0 = no Security Trailer.', baseline.mac)
  ];
}

// applies: false for frames that never carry SDLS fields, whatever the settings say.
function sdlsLayout(set, applies) {
  const on = applies && set.secSvc !== SDLS_NONE;
  return { on,
    hdr: on ? 2 + set.secIv + set.secSn + set.secPl : 0,
    trl: on ? set.secMac : 0,
    encrypted: on && set.secSvc !== SDLS_AUTH };
}

// Is this a Security Association the Standard allows?
function sdlsCheckSettings(check, set) {
  const auth = set.secSvc !== SDLS_ENC;
  if (set.secSn > 0 && set.secSn < SDLS_LEN.sn[0]) check('warn', 'Sequence Number length of 1 octet is outside the allowed 2–8 octets.', '355.0 TABLE 6-1');
  if (set.secMac > 0 && set.secMac < SDLS_LEN.mac[0]) check('warn', 'MAC length of ' + oct(set.secMac) + ' is outside the allowed 8–64 octets.', '355.0 TABLE 6-1');
  if (!auth && set.secSn > 0) check('err', 'Encryption without authentication has no anti-replay check, so the Sequence Number field shall be zero octets.', '355.0 § 4.1.1.4.4');
  if (!auth && set.secMac > 0) check('warn', 'Encryption without authentication produces no MAC, yet a MAC length is set.', '355.0 § 4.2.3.3');
  if (auth && set.secMac === 0) check('err', 'A Security Trailer shall be present whenever authentication or authenticated encryption is applied, but the MAC length is 0.', '355.0 § 4.1.2.2');
  // With authenticated encryption an incrementing IV may serve as the Sequence Number (note to § 4.1.1.4.2).
  if (auth && set.secSn === 0 && !(set.secSvc === SDLS_AE && set.secIv > 0)) check('warn', 'No anti-replay Sequence Number: the field is 0 octets' + (set.secSvc === SDLS_AE ? ', and there is no IV to serve as one.' : '.'), '355.0 § 4.1.1.4.2');
}

function sdlsHeaderFields(h, b, pos, set, dataLen) {
  const page = { proto: 'sdls' };
  const complete = (from, count) => b.length >= from + count;
  if (complete(pos, 2)) {
    const spi = h.bitField('spi', 'Security Parameter Index', 'SPI', pos * 8, 16, v => v === 0 || v === 0xFFFF ? 'Reserved by CCSDS' : 'Identifies the Security Association', page);
    if (spi === 0 || spi === 0xFFFF) h.check('err', 'SPI ' + spi + ' is reserved by CCSDS for future use — valid values are 1–65534.', '355.0 § 4.1.1.2.3');
  } else h.octField('spi', 'Security Parameter Index', 'SPI', pos, 2, 'Identifies the Security Association', page);
  pos += 2;
  if (set.secIv) { h.octField('iv', 'Initialization Vector', 'IV', pos, set.secIv, 'Input to the cryptographic algorithm', page); pos += set.secIv; }
  if (set.secSn) {
    const count = complete(pos, set.secSn) ? ' = ' + BigInt('0x' + hexStr(b, pos, set.secSn)) : '';
    h.octField('sqn', 'Sequence Number', 'SN', pos, set.secSn, 'Anti-replay count' + count, page);
    pos += set.secSn;
  }
  if (set.secPl) {
    const whole = complete(pos, set.secPl);
    const pad = whole ? readBits(b, pos * 8, set.secPl * 8) : 0;
    h.octField('pl', 'Pad Length', 'PL', pos, set.secPl, whole ? oct(pad) + ' of fill in the Frame Data' : 'Count of fill octets', page);
    if (whole && pad > dataLen) h.check('warn', 'Pad Length is ' + oct(pad) + ', more than the ' + oct(dataLen) + ' of Frame Data it is removed from.', '355.0 § 4.1.1.5.2');
  }
}

function sdlsTrailerField(h, pos, set) {
  h.octField('mac', 'Message Authentication Code', 'MAC', pos, set.secMac, 'Not verified — that needs the SA key', { proto: 'sdls' });
}

// What this frame's service protects. dataStart/dataEnd are the octets of Frame Data; the MAC covers all that precedes the trailer.
function sdlsCoverage(check, set, dataStart, dataEnd, ref) {
  const range = (a, z) => 'octets ' + a + '–' + z;
  const mac = 'The MAC covers ' + range(0, dataEnd - 1) + ', less any bits zeroed by the SA’s authentication mask. It is not verified here: that needs the key.';
  const cipher = range(dataStart, dataEnd - 1) + ' (Frame Data) are ciphertext; the headers stay in clear.';
  check('info', set.secSvc === SDLS_AUTH ? 'Authentication — the Frame Data is plaintext. ' + mac
    : set.secSvc === SDLS_ENC ? 'Encryption — ' + cipher
    : 'Authenticated Encryption — ' + cipher + ' ' + mac, ref);
}

// Frame Builder extension. Where the decoder reports an inconsistent SA, the builder only offers the lengths that the
// chosen service allows. It performs no cryptography: the IV, the MAC and any ciphertext are entered as raw hex.
const SDLS_BUILD_SERVICE = { id: 'secSvc', n: 'Space Data Link Security', abbr: 'SEC', bits: 0, def: SDLS_NONE, setting: true, opts: SDLS_SERVICES };

// octOf resolves a field's current length.
function sdlsBuildFields(svc, baseline, octOf) {
  const range = ([lo, hi], withZero) => [...(withZero ? [0] : []), ...Array.from({ length: hi - lo + 1 }, (_, i) => lo + i)];
  const field = (id, n, abbr, values, defOct, defHex) => ({ id, n, abbr, bits: 0, def: 0, kind: 'hex', varOct: true, octValues: values, defOct, maxOct: values[values.length - 1], defHex });
  const spi = { id: 'spi', n: 'Security Parameter Index', bits: 16, def: 1, abbr: 'SPI',
    warn: (v) => v === 0 || v === 0xFFFF ? 'Reserved by CCSDS for future use — valid values are 1–65534.' : '' };
  const iv = field('secIv', 'Initialization Vector', 'IV', range(SDLS_LEN.iv, true), baseline.iv, baseline.iv ? 'A0A1A2A3A4A5A6A7A8A9AAAB' : '');
  const pl = field('secPl', 'Pad Length', 'PL', range(SDLS_LEN.pl, true), baseline.pl, '');
  // Encryption alone has neither a Sequence Number (§ 4.1.1.4.4) nor a MAC. Authentication needs both (§ 4.1.1.4.2, § 4.1.2.2),
  // except that with authenticated encryption an incrementing IV, if there is one, may serve as the Sequence Number.
  if (svc === SDLS_ENC) return { hdr: [spi, iv, pl], trl: [] };
  const sn = field('secSn', 'Sequence Number', 'SN', range(SDLS_LEN.sn, svc === SDLS_AE && octOf(iv) > 0), baseline.sn, baseline.sn ? '0000002A' : '');
  const mac = field('secMac', 'Message Authentication Code', 'MAC', range(SDLS_LEN.mac, false), baseline.mac, 'C0C1C2C3C4C5C6C7C8C9CACBCCCDCECF');
  return { hdr: [spi, iv, sn, pl], trl: [mac] };
}

function sdlsBuildNote(svc) {
  if (svc === SDLS_NONE) return 'SDLS is not in use on this channel, so no Security Header or Trailer is transmitted. Select a service type to build them. The lengths then describe one Security Association.';
  return 'Set by the Security Association: the SPI selects it, and the lengths of the fields below are fixed for its duration. Nothing is computed here — enter the values as raw hex.';
}

function sdlsBuildPayloadNote(svc) {
  return svc === SDLS_AUTH ? ' With Authentication the content stays plaintext.' : ' With this service the content is ciphertext — enter it already encrypted.';
}

const SDLS_BUILD_TRAILER_NOTE = 'The MAC follows the Frame Data. It covers everything before it, and is entered as raw hex — no authentication is computed here.';
