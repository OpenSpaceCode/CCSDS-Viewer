// Space Data Link Security Protocol — CCSDS 355.0-B-2.
// Field reference pages, structure maps, breadcrumb names, Frame Builder spec and the SDLS coverage view.

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

const SDLS_BUILD = { name: 'SDLS SECURITY HEADER', tab: 'SDLS',
  note: 'CCSDS 355.0-B-2 § 4.1 — the SDLS Security Header carries a 16-bit SPI followed by three fields whose lengths are Managed Parameters, set per Security Association. Set a length to zero octets to omit that field entirely.',
  fields: [
    { id: 'spi', n: 'Security Parameter Index', bits: 16, def: 1, abbr: 'SPI' },
    { id: 'sdiv', n: 'Initialization Vector', bits: 0, def: 0, abbr: 'IV', varOct: true, defOct: 2, maxOct: 8 },
    { id: 'sdsn', n: 'Sequence Number', bits: 0, def: 0, abbr: 'SN', varOct: true, defOct: 2, maxOct: 8 },
    { id: 'sdpl', n: 'Pad Length', bits: 0, def: 0, abbr: 'PL', varOct: true, defOct: 1, maxOct: 2 } ],
  pay: { name: 'SECURED DATA FIELD', field: 'Secured Data Field', abbr: 'DATA', note: 'Optional. The data protected by the Security Association — plaintext or ciphertext, depending on the service. Give its length in octets and its content as raw hex; leave the length at 0 to build the Security Header only.' } };

// Which part of each base frame SDLS authenticates and which part it encrypts (CCSDS 355.0-B-2, figures 5-1..5-4).
// mac: 'in' = inside the Authentication Payload · 'mask' = inside it but zeroed by the SA authentication bit mask · 'out' = outside.
const SDLS_COVERAGE_ORDER = ['tm', 'tc', 'aos', 'uslp'];
const SDLS_COVERAGE = {
  tm: { tab: 'TM', name: 'TM TRANSFER FRAME', fig: 'FIGURE 5-1 · § 5.1', base: 'CCSDS 132.0-B-3',
    note: 'MAC is computed over Primary Header, Secondary Header, Security Header, and Frame Data. MAC is not computed over ASM (not shown), OCF, or ECF. Encryption is done on Frame Data only.',
    cells: [
      { n: 'TRANSFER FRAME PRIMARY HEADER', len: '6 OCTETS', w: 1.55, mac: 'in', enc: false, pay: true },
      { n: 'SECONDARY HEADER', sub: 'optional', len: '2–64 OCT', w: 1.15, mac: 'in', enc: false, pay: true },
      { n: 'SECURITY HEADER', sub: 'SDLS', len: 'MANAGED', w: 1.25, mac: 'in', enc: false, pay: true },
      { n: 'FRAME DATA FIELD', len: 'VARIES', w: 3, mac: 'in', enc: true, pay: true },
      { n: 'SECURITY TRAILER', sub: 'MAC · optional', len: 'MANAGED', w: 1.25, mac: 'out', enc: false, pay: false },
      { n: 'OCF', sub: 'opt.', len: '4 OCT', w: 0.8, mac: 'out', enc: false, pay: false },
      { n: 'FECF', sub: 'opt.', len: '2 OCT', w: 0.8, mac: 'out', enc: false, pay: false } ] },
  tc: { tab: 'TC', name: 'TC TRANSFER FRAME', fig: 'FIGURE 5-2 · § 5.2', base: 'CCSDS 232.0-B-4',
    note: 'MAC is computed over Primary Header, Segment Header, Security Header, and Frame Data. MAC is not computed over CLTU Start Sequence (not shown) or ECF. Encryption is done on Frame Data only.',
    cells: [
      { n: 'TRANSFER FRAME PRIMARY HEADER', len: '5 OCTETS', w: 1.55, mac: 'in', enc: false, pay: true },
      { n: 'SEGMENT HEADER', sub: 'MAP channels', len: '1 OCT', w: 0.95, mac: 'in', enc: false, pay: true },
      { n: 'SECURITY HEADER', sub: 'SDLS', len: 'MANAGED', w: 1.25, mac: 'in', enc: false, pay: true },
      { n: 'FRAME DATA', len: 'VARIES', w: 3, mac: 'in', enc: true, pay: true },
      { n: 'SECURITY TRAILER', sub: 'MAC · optional', len: 'MANAGED', w: 1.25, mac: 'out', enc: false, pay: false },
      { n: 'FECF', sub: 'opt.', len: '2 OCT', w: 0.8, mac: 'out', enc: false, pay: false } ] },
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
