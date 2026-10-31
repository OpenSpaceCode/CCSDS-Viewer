// Space Packet Protocol — CCSDS 133.0-B-2.
// Field reference pages, structure maps, breadcrumb names, Frame Builder spec and Frame Decoder.

const SPP_FIELDS = {
  spph: { n: 'Packet Primary Header', parent: 'spframe', bits: 'BITS 0–47', len: '6 OCTETS', pres: 'MANDATORY', ref: '§ 4.1.3',
    desc: 'The mandatory six-octet header of every Space Packet: version number, identification, sequence control and data length.',
    q: [
      { t: 'The Packet Primary Header is mandatory and shall consist of four fields, positioned contiguously, in the following sequence: a) Packet Version Number (3 bits, mandatory); b) Packet Identification Field (13 bits, mandatory); c) Packet Sequence Control Field (16 bits, mandatory); d) Packet Data Length (16 bits, mandatory).', ref: '§ 4.1.3.1' } ],
    sp: [], nt: ['The format of the Packet Primary Header is shown in figure 4-2 of the Standard.'],
    map: 'spframe', hi: ['spph'], kids: ['sppvn', 'sppid', 'sppsc', 'spdlen'] },

  sppvn: { n: 'Packet Version Number', parent: 'spph', bits: 'BITS 0–2', len: '3 BITS', pres: 'MANDATORY', ref: '§ 4.1.3.2',
    desc: 'Identifies the data unit as a Version 1 CCSDS Packet. Always set to ‘000’.',
    q: [
      { t: 'Bits 0–2 of the Packet Primary Header shall contain the (binary encoded) Packet Version Number (PVN).', ref: '§ 4.1.3.2.1' },
      { t: 'This 3-bit field shall identify the data unit as a Space Packet defined by this Recommended Standard; it shall be set to ‘000’.', ref: '§ 4.1.3.2.2' } ],
    sp: [ { c: '‘000’', d: 'Version 1 CCSDS Packet — the only version defined by this Standard', ref: '§ 4.1.3.2.2 NOTE' } ],
    nt: ['The Version Number is used to reserve the possibility of introducing other packet structures.'],
    map: 'spph', hi: ['sppvn'], kids: [] },

  sppid: { n: 'Packet Identification Field', parent: 'spph', bits: 'BITS 3–15', len: '13 BITS', pres: 'MANDATORY', ref: '§ 4.1.3.3',
    desc: 'Identifies the packet: its type (TM/TC), the presence of a Secondary Header, and the APID naming the managed data path.',
    q: [
      { t: 'This 13-bit field shall be sub-divided into three sub-fields as follows: a) Packet Type (1 bit, mandatory); b) Secondary Header Flag (1 bit, mandatory); c) APID (11 bits, mandatory).', ref: '§ 4.1.3.3.1.2' } ],
    sp: [], nt: [],
    map: 'spph', hi: ['spptype', 'spshf', 'spapid'], kids: ['spptype', 'spshf', 'spapid'] },

  spptype: { n: 'Packet Type', parent: 'sppid', bits: 'BIT 3', len: '1 BIT', pres: 'MANDATORY', ref: '§ 4.1.3.3.2',
    desc: 'Distinguishes telemetry (reporting) Packets from telecommand (requesting) Packets.',
    q: [
      { t: 'The Packet Type shall be used to distinguish Packets used for telemetry (or reporting) from Packets used for telecommand (or requesting).', ref: '§ 4.1.3.3.2.2' },
      { t: 'For a telemetry (or reporting) Packet, this bit shall be set to ‘0’; for a telecommand (or requesting) Packet, this bit shall be set to ‘1’.', ref: '§ 4.1.3.3.2.3' } ],
    sp: [
      { c: '‘0’', d: 'Telemetry (reporting) Packet', ref: '§ 4.1.3.3.2.3' },
      { c: '‘1’', d: 'Telecommand (requesting) Packet', ref: '§ 4.1.3.3.2.3' } ],
    nt: ['The exact definition of ‘telemetry Packets’ and ‘telecommand Packets’ needs to be established by the project that uses this protocol.'],
    map: 'spph', hi: ['spptype'], kids: [] },

  spshf: { n: 'Secondary Header Flag', parent: 'sppid', bits: 'BIT 4', len: '1 BIT', pres: 'MANDATORY', ref: '§ 4.1.3.3.3',
    desc: 'Indicates the presence or absence of the Packet Secondary Header within this Space Packet. Static per APID throughout a Mission Phase.',
    q: [
      { t: 'The Secondary Header Flag shall indicate the presence or absence of the Packet Secondary Header within this Space Packet. It shall be ‘1’ if a Packet Secondary Header is present; it shall be ‘0’ if a Packet Secondary Header is not present.', ref: '§ 4.1.3.3.3.2' },
      { t: 'The Secondary Header Flag shall be static with respect to the APID and managed data path throughout a Mission Phase.', ref: '§ 4.1.3.3.3.3' } ],
    sp: [
      { c: '‘1’', d: 'Packet Secondary Header present', ref: '§ 4.1.3.3.3.2' },
      { c: '‘0’', d: 'Packet Secondary Header not present — mandatory value for Idle Packets', ref: '§ 4.1.3.3.3.2 / .4' } ],
    nt: [], map: 'spph', hi: ['spshf'], kids: [] },

  spapid: { n: 'Application Process Identifier', parent: 'sppid', bits: 'BITS 5–15', len: '11 BITS', pres: 'MANDATORY', ref: '§ 4.1.3.3.4',
    desc: 'The naming mechanism for the managed data path; may uniquely identify the sending or receiving application process within a space vehicle.',
    q: [
      { t: 'The APID shall provide the naming mechanism for the managed data path.', ref: '§ 4.1.3.3.4.2' },
      { t: 'For Idle Packets the APID shall be ‘11111111111’, that is, ‘all ones’.', ref: '§ 4.1.3.3.4.4' } ],
    sp: [ { c: '‘11111111111’', d: 'Idle Packet — the only APID value reserved by the CCSDS', ref: '§ 4.1.3.3.4.4' } ],
    nt: ['The APID is unique only within its naming domain (see 2.1.1 and 2.1.3).', 'There are no other restrictions on the selection of APIDs; they are not required to be numbered consecutively.'],
    map: 'spph', hi: ['spapid'], kids: [] },

  sppsc: { n: 'Packet Sequence Control Field', parent: 'spph', bits: 'BITS 16–31', len: '16 BITS', pres: 'MANDATORY', ref: '§ 4.1.3.4',
    desc: 'Sequence Flags plus the Packet Sequence Count or Packet Name — orders the Packets generated by one APID.',
    q: [
      { t: 'This 16-bit field shall be sub-divided into two sub-fields as follows: a) Sequence Flags (2 bits, mandatory); b) Packet Sequence Count or Packet Name (14 bits, mandatory).', ref: '§ 4.1.3.4.1.2' } ],
    sp: [], nt: [],
    map: 'spph', hi: ['spsqf', 'spcnt'], kids: ['spsqf', 'spcnt'] },

  spsqf: { n: 'Sequence Flags', parent: 'sppsc', bits: 'BITS 16–17', len: '2 BITS', pres: 'MANDATORY', ref: '§ 4.1.3.4.2',
    desc: 'May indicate that the User Data in this Packet is a segment of a larger set of application data.',
    q: [
      { t: 'The Sequence Flags shall be set as follows: a) ‘00’ if the Space Packet contains a continuation segment of User Data; b) ‘01’ if the Space Packet contains the first segment of User Data; c) ‘10’ if the Space Packet contains the last segment of User Data; d) ‘11’ if the Space Packet contains unsegmented User Data.', ref: '§ 4.1.3.4.2.2' } ],
    sp: [
      { c: '‘00’', d: 'Continuation segment of User Data', ref: '§ 4.1.3.4.2.2 a)' },
      { c: '‘01’', d: 'First segment of User Data', ref: '§ 4.1.3.4.2.2 b)' },
      { c: '‘10’', d: 'Last segment of User Data', ref: '§ 4.1.3.4.2.2 c)' },
      { c: '‘11’', d: 'Unsegmented User Data — mandatory whenever the Octet String service is invoked', ref: '§ 4.1.3.4.2.2 d) / .3' } ],
    nt: ['The use of the Sequence Flags is not mandatory for the users of the SPP.'],
    map: 'spph', hi: ['spsqf'], kids: [] },

  spcnt: { n: 'Packet Sequence Count or Packet Name', parent: 'sppsc', bits: 'BITS 18–31', len: '14 BITS', pres: 'MANDATORY', ref: '§ 4.1.3.4.3',
    desc: 'For telemetry Packets: a continuous modulo-16384 count per APID. For telecommand Packets: either the count or a free-form 14-bit Packet Name.',
    q: [
      { t: 'The Packet Sequence Count shall provide the sequential binary count of each Space Packet generated by the user application identified by the APID. Packet Sequence Counts are unique and independent per each user application as identified by the APID and are not shared across multiple APIDs.', ref: '§ 4.1.3.4.3.3' },
      { t: 'The Packet Sequence Count shall be continuous (modulo-16384). A re-setting of the Packet Sequence Count before reaching 16383 shall not take place unless it is unavoidable.', ref: '§ 4.1.3.4.3.4' } ],
    sp: [ { c: 'MODULO-16384', d: 'Count range 0–16383; for Type ‘1’ (telecommand) Packets the field may instead hold a Packet Name — any 14-bit binary pattern', ref: '§ 4.1.3.4.3' } ],
    nt: ['The purpose of the Packet Sequence Count is to order the Packets generated by the same user application, even though their order may be disturbed during transport, and to support the detection of missing packets.', 'The Packet Name allows a particular Packet to be identified with respect to others occurring within the same communications session.'],
    map: 'spph', hi: ['spcnt'], kids: [] },

  spdlen: { n: 'Packet Data Length', parent: 'spph', bits: 'BITS 32–47', len: '16 BITS', pres: 'MANDATORY', ref: '§ 4.1.3.5',
    desc: 'A length count C equal to one fewer than the length in octets of the Packet Data Field.',
    q: [
      { t: 'This 16-bit field shall contain a length count C that equals one fewer than the length (in octets) of the Packet Data Field.', ref: '§ 4.1.3.5.2' },
      { t: 'The length count C shall be expressed as: C = (Total Number of Octets in the Packet Data Field) – 1.', ref: '§ 4.1.3.5.3' } ],
    sp: [ { c: 'C = DATA FIELD OCTETS − 1', d: 'Encoded length count — Data Field range 1 to 65536 octets', ref: '§ 4.1.3.5.3' } ],
    nt: [], map: 'spph', hi: ['spdlen'], kids: [] },

  spdf: { n: 'Packet Data Field', parent: 'spframe', bits: null, len: '1 TO 65536 OCTETS', pres: 'MANDATORY', ref: '§ 4.1.4',
    desc: 'Carries the packet content: an optional Packet Secondary Header followed by the User Data Field — at least one of the two must be present.',
    q: [
      { t: 'The Packet Data Field is mandatory and shall consist of at least one of the following two fields, positioned contiguously, in the following sequence: a) Packet Secondary Header (variable length); b) User Data Field (variable length).', ref: '§ 4.1.4.1.1' },
      { t: 'The Packet Data Field shall contain at least one octet.', ref: '§ 4.1.4.1.2' } ],
    sp: [], nt: [],
    map: 'spframe', hi: ['spsh', 'spud'], kids: ['spsh', 'spud'] },

  spsh: { n: 'Packet Secondary Header', parent: 'spdf', bits: null, len: 'VARIABLE', pres: 'OPTIONAL', ref: '§ 4.1.4.2',
    desc: 'A mission-specific means for consistently placing ancillary data (time, position/attitude, format info) in the same location within a Space Packet: a Time Code Field, an Ancillary Data Field, or both.',
    q: [
      { t: 'If present, the Packet Secondary Header shall follow, without gap, the Packet Primary Header.', ref: '§ 4.1.4.2.1.1' },
      { t: 'The Packet Secondary Header shall be mandatory if no User Data Field is present in the Packet; otherwise, it is optional.', ref: '§ 4.1.4.2.1.2' },
      { t: 'If present, the Packet Secondary Header shall consist of either: a) a Time Code Field (variable length) only; b) an Ancillary Data Field (variable length) only; or c) a Time Code Field followed by an Ancillary Data Field.', ref: '§ 4.1.4.2.1.5' } ],
    sp: [],
    nt: ['The Packet Secondary Header is not allowed for Idle Packets.', 'Secondary Header types are registered with SANA (reference [5]); the actual contents are managed at the SPP service user interface.', 'The chosen option shall remain static for a specific managed data path throughout all Mission Phases (4.1.4.2.1.6).'],
    map: 'spframe', hi: ['spsh'], kids: ['sptc', 'spad'] },

  sptc: { n: 'Time Code Field', parent: 'spsh', bits: null, len: 'VARIABLE', pres: 'OPTIONAL', ref: '§ 4.1.4.2.2',
    desc: 'One of the CCSDS segmented or unsegmented binary time codes (reference [3]): an optional P-Field (preamble) plus the mandatory T-Field.',
    q: [
      { t: 'The Time Code Field shall consist of one of the CCSDS segmented binary or unsegmented binary time codes specified in reference [3].', ref: '§ 4.1.4.2.2.2' },
      { t: 'The time code selected shall be fixed for a given managed data path throughout all Mission Phases.', ref: '§ 4.1.4.2.2.3' },
      { t: 'If the characteristics of the chosen time code are fixed, the corresponding P-field need not be present. If the characteristics are allowed to change, the P-field shall be present so as to identify the changes.', ref: '§ 4.1.4.2.2.4' } ],
    sp: [],
    nt: ['Examples of time codes are CCSDS Unsegmented Time Code and CCSDS Day Segmented Time Code; characteristics include ambiguity period, epoch, length, and resolution.'],
    map: 'spsh', hi: ['sptc'], kids: [] },

  spad: { n: 'Ancillary Data Field', parent: 'spsh', bits: null, len: 'VARIABLE', pres: 'OPTIONAL', ref: '§ 4.1.4.2.3',
    desc: 'Mission-defined ancillary information: data needed to interpret the User Data Field, mission-specific header fields, or an extension of the APID naming domain.',
    q: [ { t: 'If present, the Ancillary Data Field shall consist of an integral number of octets.', ref: '§ 4.1.4.2.3' } ],
    sp: [],
    nt: ['The content and format of the data contained in the Ancillary Data Field are not specified in this Recommended Standard.'],
    map: 'spsh', hi: ['spad'], kids: [] },

  spud: { n: 'User Data Field', parent: 'spdf', bits: null, len: 'VARIABLE', pres: 'MANDATORY IF NO SEC. HDR', ref: '§ 4.1.4.3',
    desc: 'The application data supplied by the sending user — or Idle Data in an Idle Packet.',
    q: [
      { t: 'If present, the User Data Field shall follow, without gap, either the Packet Secondary Header (if a Packet Secondary Header is present) or the Packet Primary Header (if a Packet Secondary Header is not present).', ref: '§ 4.1.4.3.1' },
      { t: 'The User Data Field shall be mandatory if a Packet Secondary Header is not present; otherwise, it is optional.', ref: '§ 4.1.4.3.2' },
      { t: 'If the Packet is not an Idle Packet, then the User Data Field shall contain application data supplied by the sending user. If the Packet is an Idle Packet, the User Data Field shall contain Idle Data.', ref: '§ 4.1.4.3.4' } ],
    sp: [],
    nt: ['The bit pattern of Idle Data is set by the mission and is not specified in this Recommended Standard.'],
    map: 'spframe', hi: ['spud'], kids: [] },
};

const SPP_MAPS = {
  spframe: { title: 'WITHIN SPACE PACKET', cells: [
    { id: 'spph', l: 'PRIMARY HEADER', w: 6 }, { id: 'spsh', l: 'SECONDARY HDR', w: 5 }, { id: 'spud', l: 'USER DATA FIELD', w: 8 } ] },
  spph: { title: 'WITHIN PACKET PRIMARY HEADER (48 BITS)', cells: [
    { id: 'sppvn', l: 'VN', w: 3 }, { id: 'spptype', l: 'T', w: 1.3 }, { id: 'spshf', l: 'S', w: 1.3 }, { id: 'spapid', l: 'APID', w: 11 },
    { id: 'spsqf', l: 'SQ', w: 2 }, { id: 'spcnt', l: 'SEQ COUNT / NAME', w: 14 }, { id: 'spdlen', l: 'PACKET DATA LENGTH', w: 16 } ] },
  spsh: { title: 'WITHIN PACKET SECONDARY HEADER', cells: [
    { id: 'sptc', l: 'TIME CODE FIELD', w: 1 }, { id: 'spad', l: 'ANCILLARY DATA FIELD', w: 1 } ] },
};

const SPP_CRUMBS = {
  spframe: 'SPACE PACKET',
  spph: 'PRIMARY HEADER',
  sppid: 'PACKET IDENTIFICATION',
  sppsc: 'SEQUENCE CONTROL',
  spdf: 'PACKET DATA FIELD',
  spsh: 'SECONDARY HEADER'
};

// Field search: abbreviations in common use, by field. Initials of the name are matched without being listed.
const SPP_ABBR = { spph: ['PH'], sppvn: ['PVN'], spptype: ['TYPE'], spshf: ['SHF'], spapid: ['APID'], spsqf: ['SEQF'], spcnt: ['PSC'], spdlen: ['PDL'], spdf: ['PDF'], spsh: ['PSH'], sptc: ['TCF', 'CUC', 'CDS'], spad: ['ADF'], spud: ['UDF'] };

const SPP_BUILD = { name: 'SPACE PACKET PRIMARY HEADER', tab: 'SpacePacket',
  note: 'CCSDS 133.0-B-2 § 4.1.2 — the Space Packet Primary Header is 6 octets, mandatory and fixed in length. Packet Data Length is expressed as the number of octets in the Packet Data Field minus one.',
  fields: [
    { id: 'pvn', n: 'Packet Version Number', bits: 3, def: 0, abbr: 'PVN', kind: 'enum', opts: [{ v: 0, l: '000 · This version' }] },
    { id: 'ptype', n: 'Packet Type', bits: 1, def: 0, abbr: 'TYPE', kind: 'enum', opts: [{ v: 0, l: '0 · Telemetry' }, { v: 1, l: '1 · Telecommand' }] },
    { id: 'pshf', n: 'Secondary Header Flag', bits: 1, def: 0, abbr: 'SHF', kind: 'enum', opts: [{ v: 0, l: '0 · Absent' }, { v: 1, l: '1 · Present' }] },
    { id: 'apid', n: 'Application Process Identifier', bits: 11, def: 100, abbr: 'APID' },
    { id: 'seqf', n: 'Sequence Flags', bits: 2, def: 3, abbr: 'SEQF', kind: 'enum', opts: [{ v: 0, l: '00 · Continuation segment' }, { v: 1, l: '01 · First segment' }, { v: 2, l: '10 · Last segment' }, { v: 3, l: '11 · Unsegmented' }] },
    { id: 'pseq', n: 'Packet Sequence Count', bits: 14, def: 1, abbr: 'PSC' },
    { id: 'pdlen', n: 'Packet Data Length', bits: 16, def: 0, abbr: 'PDL', overridable: true, deriveNote: 'data octets − 1',
      derive: (vals) => Math.max((vals.__frameOct || 7) - 7, 0),
      // With no data there is no right value: C = octets − 1 cannot express zero octets.
      warn: (v, vals) => vals.__frameOct === 6 ? 'The Packet Data Field is empty, but it shall contain at least one octet (§ 4.1.4.1.2). Add User Data or a Secondary Header.' : '',
      overrideNote: (want) => 'Differs from the packet as built: ' + oct(want + 1) + ' in the Packet Data Field, so the derived value is ' + want + '.' } ],
  sec: { flag: 'pshf', name: 'PACKET SECONDARY HEADER', form: 'NO DEFINED FORM · CCSDS 133.0-B-2 § 4.1.3',
    note: 'The Standard fixes no internal structure. The header is an optional Time Code Field followed by an optional Ancillary Data Field, both mission-defined, with at least one of the two present. Set each length in octets and give the content as raw hex.',
    off: 'The Secondary Header Flag is ‘0’, so no Packet Secondary Header is transmitted. Set the flag to ‘1’ above to build one.',
    fields: [
      { id: 'sptcf', n: 'Time Code Field', bits: 0, def: 0, abbr: 'TCF', kind: 'hex', varOct: true, defOct: 4, minOct: 0, maxOct: 32, defHex: '3A5C0100' },
      { id: 'spadf', n: 'Ancillary Data Field', bits: 0, def: 0, abbr: 'ADF', kind: 'hex', varOct: true, defOct: 0, minOct: 0, maxOct: 32, defHex: '' } ] },
  pay: { name: 'PACKET USER DATA FIELD', field: 'User Data Field', abbr: 'USER', note: 'Optional. The User Data Field holds the application data. Give its length in octets and its content as raw hex; leave the length at 0 to build the header only. Packet Data Length above follows it.' } };

// One-page cheat sheet.
const SPP_SHEET = { doc: 'spp', title: 'SPACE PACKET PROTOCOL', layout: 'spp', frameTitle: 'SPACE PACKET · 7 TO 65542 OCTETS',
  frame: [{ n: 'PRIMARY HEADER', len: '6 OCTETS', w: 1.5 }, { n: 'SECONDARY HEADER', len: 'VARIABLE · OPTIONAL', w: 2, opt: true }, { n: 'USER DATA FIELD', len: 'VARIABLE', w: 3.5 }],
  headerTitle: 'PRIMARY HEADER · 6 OCTETS',
  rows: [[['PVN', 3, 'sppvn'], ['TYPE', 1, 'spptype'], ['SHF', 1, 'spshf'], ['APID', 11, 'spapid']], [['SEQF', 2, 'spsqf'], ['PSC', 14, 'spcnt']], [['PDL', 16, 'spdlen']]],
  fields: [
    ['sppvn', 'PVN', '‘000’ only.'], ['spptype', 'TYPE', '0 = telemetry (reporting). 1 = telecommand (requesting).'], ['spshf', 'SHF', '1 = Secondary Header present. Static per APID; 0 for Idle Packets.'], ['spapid', 'APID', 'Names the data path. Unique only within its naming domain.'],
    ['spsqf', 'SEQF', '‘01’ first segment, ‘00’ continuation, ‘10’ last, ‘11’ unsegmented.'], ['spcnt', 'PSC', 'Modulo-16384 count per APID. A telecommand may carry a Packet Name instead.'], ['spdlen', 'PDL', 'C = octets in the Packet Data Field − 1.'],
    ['sptc', 'TCF', 'Optional: a CCSDS time code, fixed per managed data path.'], ['spad', 'ADF', 'Optional: mission-defined ancillary data.'], ['spud', 'UDF', 'Application data, or Idle Data in an Idle Packet.'] ],
  specials: [['APID 0x7FF', '‘11111111111’: Idle Packet, the only reserved APID.', '§ 4.1.3.3.4.4'], ['SEQF ‘11’', 'Always, where the Octet String service is used.', '§ 4.1.3.4.2.3']],
  rules: [['A Packet is 7 to 65542 octets: 6 of header, then a Packet Data Field of 1 to 65536.', '§ 4.1.2.2'], ['The Packet Data Field holds at least one octet.', '§ 4.1.4.1.2'],
    ['The Secondary Header is mandatory if there is no User Data Field.', '§ 4.1.4.2.1.2'], ['The User Data Field is mandatory if there is no Secondary Header.', '§ 4.1.4.3.2'], ['Secondary Header contents are not in the packet: they are set per APID, by management.', '§ 4.1.4.2.1.4'],
    ['A Secondary Header is a Time Code Field, an Ancillary Data Field, or both, in that order.', '§ 4.1.4.2.1.5'], ['The time code’s P-field, if used, is fixed for the data path.', '§ 4.1.4.2.2.5']] };

// Frame Decoder spec — see DECODE_SPECS in component.js for the decode() contract.
const SPP_DECODE = { name: 'SPACE PACKET', tab: 'SpacePacket',
  note: 'CCSDS 133.0-B-2 § 4.1 — a Space Packet is a 6-octet Primary Header followed by a Packet Data Field of 1 to 65536 octets (7 to 65542 octets in total). The Packet Secondary Header has no structure defined by the Standard; its split into Time Code and Ancillary Data Fields comes from the mission settings.',
  setNote: 'The Packet Secondary Header contents are specified by the source end user and provided to the receiver by management (§ 4.1.4.2.1.4, table 5-1). They are applied only when the Secondary Header Flag is ‘1’.',
  settings: [
    { id: 'tcfLen', n: 'Time Code Field length', ref: '§ 4.1.4.2.2', unit: 'octets', def: 4, min: 0, max: 64,
      note: 'CCSDS time code (P-field, if present, + T-field) at the start of the Secondary Header. 0 = no Time Code Field.' },
    { id: 'adfLen', n: 'Ancillary Data Field length', ref: '§ 4.1.4.2.3', unit: 'octets', def: 0, min: 0, max: 1024,
      note: 'Mission-defined ancillary data following the Time Code Field. 0 = no Ancillary Data Field.' },
    { id: 'maxLen', n: 'Maximum Packet Length', ref: 'TABLE 5-1', unit: 'octets', def: 65542, min: 7, max: 65542,
      note: 'Largest packet the mission allows, Primary Header included. The Standard’s limit is 65542.' } ],
  examples: [
    { l: 'TM · Secondary Header', hex: '08 64 C0 01 00 0B 3A 5C 01 00 01 02 03 04 05 06 07 08' },
    { l: 'TC · no Secondary Header', hex: '11 A2 C0 2A 00 05 A1 B2 C3 D4 E5 F6' },
    { l: 'Idle Packet', hex: '07 FF C0 00 00 03 55 55 55 55' },
    { l: 'Truncated', hex: '00 05 C0 0A 00 09 11 22 33 44' },
    { l: 'Two packets', hex: '00 05 C0 0A 00 01 AA BB 00 05 C0 0B 00 01 CC DD' } ],
  decode: decodeSpp };

function decodeSpp(b, set) {
  const { fields, checks, check, bitField, octField } = decodeHelpers(b);

  if (b.length < 6) {
    if (b.length) check('err', 'The Packet Primary Header is 6 octets — only ' + oct(b.length) + ' received, so nothing can be decoded.', '§ 4.1.3.1');
    return { fields, checks };
  }

  const pvn = bitField('sppvn', 'Packet Version Number', 'PVN', 0, 3, v => v === 0 ? 'Version 1 CCSDS Packet' : 'Unknown version — not a CCSDS 133.0 Space Packet');
  const type = bitField('spptype', 'Packet Type', 'TYPE', 3, 1, v => v ? 'Telecommand (requesting)' : 'Telemetry (reporting)');
  const shf = bitField('spshf', 'Secondary Header Flag', 'SHF', 4, 1, v => v ? 'Packet Secondary Header present' : 'No Packet Secondary Header');
  const apid = bitField('spapid', 'Application Process Identifier', 'APID', 5, 11, v => '0x' + v.toString(16).toUpperCase().padStart(3, '0') + (v === 0x7FF ? ' · Idle Packet' : ''));
  const seqf = bitField('spsqf', 'Sequence Flags', 'SEQF', 16, 2, v => ['Continuation segment', 'First segment', 'Last segment', 'Unsegmented'][v]);
  bitField('spcnt', type ? 'Packet Sequence Count or Packet Name' : 'Packet Sequence Count', 'PSC', 18, 14, () => type ? 'Count or name — telecommand packet' : 'Modulo-16384 count per APID');
  const pdl = bitField('spdlen', 'Packet Data Length', 'PDL', 32, 16, v => 'C + 1 = ' + oct(v + 1) + ' in the Packet Data Field');

  const declared = pdl + 1, avail = b.length - 6, total = 6 + declared;
  const idle = apid === 0x7FF;

  if (pvn !== 0) check('err', 'Packet Version Number is ‘' + pvn.toString(2).padStart(3, '0') + '’ — a CCSDS Space Packet carries ‘000’.', '§ 4.1.3.2.2');
  if (idle) {
    check('info', 'APID is all ones — this is an Idle Packet; its User Data Field carries mission-defined Idle Data.', '§ 4.1.3.3.4.4');
    if (shf) check('err', 'Idle Packet with the Secondary Header Flag set — the flag shall be ‘0’ for Idle Packets.', '§ 4.1.3.3.3.4');
  }
  if (seqf !== 3) check('info', 'Sequence Flags ‘' + seqf.toString(2).padStart(2, '0') + '’ — this packet carries one segment of a larger block of user data. Segmentation is not allowed where the Octet String service is used.', '§ 4.1.3.4.2');

  if (avail === 0) check('err', 'No Packet Data Field — a Space Packet has at least 7 octets.', '§ 4.1.2.2');
  else if (avail < declared) check('err', 'Packet is truncated: Packet Data Length declares ' + oct(declared) + ' of Packet Data Field, but only ' + avail + ' follow the header (' + (declared - avail) + ' missing).', '§ 4.1.3.5.2');
  else if (avail > declared) check('warn', oct(avail - declared) + ' after the end of the packet (octet ' + total + ' onward) — not part of this packet. Possibly the next packet or fill.', '§ 4.1.3.5.2');
  else check('ok', 'Packet Data Length matches the data received: C + 1 = ' + oct(declared) + ' of Packet Data Field, ' + total + ' octets in total.', '§ 4.1.3.5');
  if (total > set.maxLen) check('warn', 'Packet length ' + total + ' octets exceeds the mission Maximum Packet Length of ' + set.maxLen + ' octets.', 'TABLE 5-1');

  let pos = 6;
  if (shf) {
    const shLen = set.tcfLen + set.adfLen;
    if (shLen === 0) check('warn', 'Secondary Header Flag is ‘1’ but the mission settings give the Packet Secondary Header 0 octets. Set the Time Code and/or Ancillary Data Field length; until then the whole Packet Data Field is shown as User Data.', '§ 4.1.4.2.1.4');
    else if (shLen > declared) check('err', 'Mission settings put the Packet Secondary Header at ' + oct(shLen) + ', but the Packet Data Field is only ' + oct(declared) + ' long.', '§ 4.1.4.2');
    const tcf = Math.min(set.tcfLen, declared), adf = Math.min(set.adfLen, declared - tcf);
    if (tcf) { octField('sptc', 'Time Code Field', 'TCF', pos, tcf, 'CCSDS time code — format fixed per managed data path'); pos += tcf; }
    if (adf) { octField('spad', 'Ancillary Data Field', 'ADF', pos, adf, 'Mission-defined ancillary data'); pos += adf; }
  }
  const ud = declared - (pos - 6);
  if (ud > 0) octField('spud', 'User Data Field', idle ? 'IDLE' : 'USER', pos, ud, idle ? 'Idle Data — mission-defined pattern' : 'Application data');
  else if (shf && set.tcfLen + set.adfLen <= declared) check('info', 'No User Data Field — allowed because a Packet Secondary Header is present.', '§ 4.1.4.3.2');
  if (avail > declared) octField(null, 'Octets after the packet', 'EXTRA', total, avail - declared, 'Not part of this packet', { extra: true });

  return { fields, checks };
}
