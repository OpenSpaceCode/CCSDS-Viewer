// TC Space Data Link Protocol — CCSDS 232.0-B-4.
// Field reference pages, structure maps, breadcrumb names, Frame Builder spec and Frame Decoder.

const TC_FIELDS = {
  tcph: { n: 'Transfer Frame Primary Header', parent: 'tcframe', bits: 'BITS 0–39', len: '5 OCTETS', pres: 'MANDATORY', ref: '§ 4.1.2',
    desc: 'The mandatory five-octet header of every TC Transfer Frame. Eight fields identify the frame, control the FARM acceptance checks, and give the frame length and sequence number.',
    q: [
      { t: 'The Transfer Frame Primary Header is mandatory and shall consist of eight fields, positioned contiguously, in the following sequence: a) Transfer Frame Version Number (2 bits, mandatory); b) Bypass Flag (1 bit, mandatory); c) Control Command Flag (1 bit, mandatory); d) Reserved Spare (2 bits, mandatory); e) Spacecraft Identifier (10 bits, mandatory); f) Virtual Channel Identifier (6 bits, mandatory); g) Frame Length (10 bits, mandatory); h) Frame Sequence Number (8 bits, mandatory).', ref: '§ 4.1.2.1' } ],
    sp: [], nt: ['The format of the Transfer Frame Primary Header is shown in figure 4-2 of the Standard.'],
    map: 'tcframe', hi: ['tcph'], kids: ['tcvn', 'tcbf', 'tcccf', 'tcrsvd', 'tcscid', 'tcvcid', 'tcflen', 'tcfsn'] },

  tcvn: { n: 'Transfer Frame Version Number', parent: 'tcph', bits: 'BITS 0–1', len: '2 BITS', pres: 'MANDATORY', ref: '§ 4.1.2.2',
    desc: 'Identifies the data unit as a TC Version 1 Asynchronous Transfer Frame. Always set to ‘00’ — the only version defined by the Standard.',
    q: [
      { t: 'Bits 0–1 of the Transfer Frame Primary Header shall contain the (binary encoded) Transfer Frame Version Number.', ref: '§ 4.1.2.2.1' },
      { t: 'This 2-bit field shall identify the data unit as a Transfer Frame defined by this Recommended Standard and shall be set to ‘00’.', ref: '§ 4.1.2.2.2' } ],
    sp: [ { c: '‘00’', d: 'TC Version 1 Asynchronous Transfer Frame — the only version defined by this Standard', ref: '§ 4.1.2.2.2 NOTE' } ],
    nt: [], map: 'tcph', hi: ['tcvn'], kids: [] },

  tcbf: { n: 'Bypass Flag', parent: 'tcph', bits: 'BIT 2', len: '1 BIT', pres: 'MANDATORY', ref: '§ 4.1.2.3.1',
    desc: 'Controls the application of Frame Acceptance Checks by the receiving end: ‘0’ marks a Type-A frame (subject to FARM checks), ‘1’ a Type-B frame (checks bypassed).',
    q: [
      { t: 'Setting the Bypass Flag to value ‘0’ shall specify that this Transfer Frame is a Type-A Transfer Frame, and acceptance of this Transfer Frame by the receiving end shall be subject to the normal Frame Acceptance Checks of the FARM.', ref: '§ 4.1.2.3.1.2 a)' },
      { t: 'Setting the Bypass Flag to value ‘1’ shall specify that this Transfer Frame is a Type-B Transfer Frame, and the Frame Acceptance Checks of the FARM by the receiving end shall be bypassed.', ref: '§ 4.1.2.3.1.2 b)' } ],
    sp: [
      { c: 'BF=0 · CCF=0', d: 'Type-AD — Data Field carries an FDU, subject to FARM Frame Acceptance Checks (Sequence-Controlled / AD Service of the COP)', ref: 'TABLE 4-1' },
      { c: 'BF=0 · CCF=1', d: 'Reserved for future application', ref: 'TABLE 4-1' },
      { c: 'BF=1 · CCF=0', d: 'Type-BD — Data Field carries an FDU, checks bypassed (Expedited / BD Service of the COP)', ref: 'TABLE 4-1' },
      { c: 'BF=1 · CCF=1', d: 'Type-BC — Data Field carries Control Commands, checks bypassed (controls the Sequence-Controlled Service)', ref: 'TABLE 4-1' } ],
    nt: ['The FARM associated with the COP can be made to operate in a normal ‘Acceptance’ mode (Type-A frames) or a ‘Bypass’ mode (Type-B frames), according to the setting of the Bypass Flag.', 'All received Transfer Frames first undergo a basic standard set of Frame Validation Checks, applied regardless of the Bypass Flag setting (see 4.4.9.3).'],
    map: 'tcph', hi: ['tcbf'], kids: [] },

  tcccf: { n: 'Control Command Flag', parent: 'tcph', bits: 'BIT 3', len: '1 BIT', pres: 'MANDATORY', ref: '§ 4.1.2.3.2',
    desc: 'Specifies whether the Data Field conveys Control Commands (Type-C) or Data (Type-D).',
    q: [
      { t: 'Setting the Control Command Flag to value ‘0’ shall indicate that the Transfer Frame Data Field contains a Frame Data Unit (FDU) (Type-D); setting the Control Command Flag to value ‘1’ shall indicate that the Transfer Frame Data Field contains control information (Type-C).', ref: '§ 4.1.2.3.2.2' } ],
    sp: [
      { c: '‘0’', d: 'Type-D — Data Field contains a Frame Data Unit', ref: '§ 4.1.2.3.2.2 a)' },
      { c: '‘1’', d: 'Type-C — Data Field contains control information', ref: '§ 4.1.2.3.2.2 b)' } ],
    nt: ['In the C mode, the Data Field conveys control information used to set the parameters of the FARM to the proper configuration to accept data. In the D mode, the Data Field contains a Frame Data Unit.', 'The combined states of the Bypass and Control Command Flags define frame types AD, BD and BC — see the Bypass Flag page (table 4-1).'],
    map: 'tcph', hi: ['tcccf'], kids: [] },

  tcrsvd: { n: 'Reserved Spare', parent: 'tcph', bits: 'BITS 4–5', len: '2 BITS', pres: 'MANDATORY', ref: '§ 4.1.2.4',
    desc: 'Two bits reserved for future application; always set to ‘00’.',
    q: [ { t: 'These two bits are reserved for future application and shall be set to ‘00’.', ref: '§ 4.1.2.4.2' } ],
    sp: [ { c: '‘00’', d: 'Mandatory value — reserved by the CCSDS', ref: '§ 4.1.2.4.2' } ],
    nt: [], map: 'tcph', hi: ['tcrsvd'], kids: [] },

  tcscid: { n: 'Spacecraft Identifier', parent: 'tcph', bits: 'BITS 6–15', len: '10 BITS', pres: 'MANDATORY', ref: '§ 4.1.2.5',
    desc: 'Identifies the spacecraft associated with the data contained in the frame. Assigned by the CCSDS and static throughout all Mission Phases.',
    q: [
      { t: 'The Spacecraft Identifier is assigned by the CCSDS and shall provide the identification of the spacecraft associated with the data contained in the Transfer Frame.', ref: '§ 4.1.2.5.2' },
      { t: 'The Spacecraft Identifier shall be static throughout all Mission Phases.', ref: '§ 4.1.2.5.3' } ],
    sp: [],
    nt: ['The Secretariat of the CCSDS assigns Spacecraft Identifiers according to the procedures in reference [6].'],
    map: 'tcph', hi: ['tcscid'], kids: [] },

  tcvcid: { n: 'Virtual Channel Identifier', parent: 'tcph', bits: 'BITS 16–21', len: '6 BITS', pres: 'MANDATORY', ref: '§ 4.1.2.6',
    desc: 'Identifies the Virtual Channel — up to 64 Virtual Channels per spacecraft on the TC link.',
    q: [ { t: 'The Virtual Channel Identifier shall be used to identify the Virtual Channel.', ref: '§ 4.1.2.6.2' } ],
    sp: [],
    nt: ['There are no restrictions on the selection of Virtual Channel Identifiers. In particular, Virtual Channels are not required to be numbered consecutively.'],
    map: 'tcph', hi: ['tcvcid'], kids: [] },

  tcflen: { n: 'Frame Length', parent: 'tcph', bits: 'BITS 22–31', len: '10 BITS', pres: 'MANDATORY', ref: '§ 4.1.2.7',
    desc: 'A length count C equal to one fewer than the total number of octets in the frame, measured from the first bit of the Primary Header to the last bit of the FECF (or Data Field if the FECF is omitted).',
    q: [
      { t: 'This 10-bit field shall contain a length count C which equals one fewer than the total octets in the Transfer Frame.', ref: '§ 4.1.2.7.2' },
      { t: 'The count shall be measured from the first bit of the Transfer Frame Primary Header to the last bit of the Frame Error Control Field (if present), or to the last bit of the Transfer Frame Data Field (if the Frame Error Control Field is omitted).', ref: '§ 4.1.2.7.3' } ],
    sp: [
      { c: 'C = TOTAL OCTETS − 1', d: 'The encoded length count', ref: '§ 4.1.2.7 NOTE 1' },
      { c: 'MAX 1024 OCTETS', d: 'The size of this field limits the maximum length of a Transfer Frame to 1024 octets', ref: '§ 4.1.2.7 NOTE 2' } ],
    nt: [], map: 'tcph', hi: ['tcflen'], kids: [] },

  tcfsn: { n: 'Frame Sequence Number', parent: 'tcph', bits: 'BITS 32–39', len: '8 BITS', pres: 'MANDATORY', ref: '§ 4.1.2.8',
    desc: 'N(S) — enables the FARM to check the sequentiality of incoming Type-A frames. Maintained separately for each Virtual Channel.',
    q: [ { t: 'Bits 32–39 of the Transfer Frame Primary Header shall contain the Frame Sequence Number, N(S).', ref: '§ 4.1.2.8' } ],
    sp: [ { c: 'ALL ZEROES', d: 'The COP does not use this field of Type-B Transfer Frames; in this case the contents are set to ‘all zeroes’ by COP', ref: '§ 4.1.2.8 NOTE 3' } ],
    nt: ['The procedure for assigning the Frame Sequence Number to Transfer Frames is defined in reference [4].', 'The Frame Sequence Number is Virtual Channel dependent; this protocol maintains a separate Frame Sequence Number for each of the Virtual Channels.'],
    map: 'tcph', hi: ['tcfsn'], kids: [] },

  tcdf: { n: 'Transfer Frame Data Field', parent: 'tcframe', bits: null, len: 'UP TO 1019 OCTETS', pres: 'MANDATORY', ref: '§ 4.1.3',
    desc: 'Carries one Frame Data Unit (Type-D frames) — optionally prefixed by a Segment Header — or Control Command information (Type-C frames).',
    q: [
      { t: 'The Transfer Frame Data Field shall follow, without gap, the Transfer Frame Primary Header.', ref: '§ 4.1.3.1.1' },
      { t: 'The Transfer Frame Data Field, which shall contain an integral number of octets, may vary in length up to a maximum of 1019 octets (1017 octets if the Frame Error Control Field is present).', ref: '§ 4.1.3.1.2' },
      { t: 'The Transfer Frame Data Field shall contain either an integral number of octets of data corresponding to one Frame Data Unit (for a Type-D Transfer Frame) or an integral number of octets of Control Command information (for a Type-C Transfer Frame).', ref: '§ 4.1.3.1.3' } ],
    sp: [], nt: ['A Frame Data Unit that has a Segment Header is called a Segment.'],
    map: 'tcframe', hi: ['tcdf'], kids: ['tcseg', 'tcud', 'tccc'] },

  tcseg: { n: 'Segment Header', parent: 'tcdf', bits: null, len: '1 OCTET', pres: 'OPTIONAL', ref: '§ 4.1.3.2.2',
    desc: 'Optional one-octet prefix of a Frame Data Unit: Sequence Flags plus the MAP Identifier. Required on Virtual Channels with more than one MAP or with service data units larger than one frame.',
    q: [
      { t: 'If present, the Segment Header shall follow, without gap, the Transfer Frame Primary Header. The Segment Header is optional; its presence or absence shall be established by management for each Virtual Channel.', ref: '§ 4.1.3.2.2.1.1–.2' },
      { t: 'The Segment Header shall contain the following fields: a) Sequence Flags (2 bits, mandatory); b) Multiplexer Access Point (MAP) Identifier (6 bits, mandatory).', ref: '§ 4.1.3.2.2.1.4' } ],
    sp: [],
    nt: ['The Segment Header must not be present in Transfer Frames carrying Control Commands (4.1.3.2.2.1.3).', 'The Segment Header is required for any Virtual Channel which has more than one MAP or which transfers service data units larger than permitted in a single Transfer Frame; if used on a Virtual Channel, it must be used for all Transfer Frames carrying Frame Data Units on that channel.'],
    map: 'tcdf', hi: ['tcseg'], kids: ['tcsqf', 'tcmap'] },

  tcsqf: { n: 'Sequence Flags', parent: 'tcseg', bits: 'SEG HDR BITS 0–1', len: '2 BITS', pres: 'MANDATORY WITHIN SEG HDR', ref: '§ 4.1.3.2.2.2',
    desc: 'Delimits the user’s service data unit by indicating the sequential position of the User Data in this Frame Data Unit relative to the whole service data unit.',
    q: [ { t: 'Bits 0–1 of the Segment Header shall contain the Sequence Flags.', ref: '§ 4.1.3.2.2.2.1' } ],
    sp: [
      { c: '‘01’', d: 'First portion of service data unit on one MAP', ref: 'TABLE 4-2' },
      { c: '‘00’', d: 'Continuing portion of service data unit on one MAP', ref: 'TABLE 4-2' },
      { c: '‘10’', d: 'Last portion of service data unit on one MAP', ref: 'TABLE 4-2' },
      { c: '‘11’', d: 'No segmentation — one complete service data unit or multiple Packets', ref: 'TABLE 4-2' } ],
    nt: [], map: 'tcseg', hi: ['tcsqf'], kids: [] },

  tcmap: { n: 'Multiplexer Access Point Identifier', parent: 'tcseg', bits: 'SEG HDR BITS 2–7', len: '6 BITS', pres: 'MANDATORY WITHIN SEG HDR', ref: '§ 4.1.3.2.2.3',
    desc: 'Identifies the MAP Channel within a Virtual Channel — up to 64 MAPs per Virtual Channel.',
    q: [
      { t: 'Bits 2–7 of the Segment Header shall contain the Multiplexer Access Point Identifier (MAP ID).', ref: '§ 4.1.3.2.2.3.1' },
      { t: 'If multiple MAPs are not used on a particular Virtual Channel, but the Segment Header is otherwise required to be present, the MAP Identifier shall be set to a constant value for all Frame Data Units which are placed on that Virtual Channel.', ref: '§ 4.1.3.2.2.3.2' } ],
    sp: [],
    nt: ['There are no restrictions on the selection of MAP Identifiers. In particular, MAPs are not required to be numbered consecutively.'],
    map: 'tcseg', hi: ['tcmap'], kids: [] },

  tcud: { n: 'User Data (Frame Data Unit)', parent: 'tcdf', bits: null, len: 'UP TO 1019 OCTETS', pres: 'MANDATORY IN TYPE-D FRAMES', ref: '§ 4.1.3.2',
    desc: 'The user content of a Type-D frame: Packets, a MAP_SDU or a VCA_SDU — whole or as a segmented portion, depending on the Segment Header.',
    q: [
      { t: 'A Frame Data Unit shall consist of either a) an integral number of User Data octets; or b) a Segment Header followed by an integral number of User Data octets, if the Segment Header is used on the Virtual Channel.', ref: '§ 4.1.3.2.1.1' },
      { t: 'If the Segment Header is present, the User Data contained in a Frame Data Unit shall consist of one of the following: a) a complete Packet; b) multiple Packets; c) a portion of a Packet; d) a complete MAP_SDU; e) a portion of a MAP_SDU.', ref: '§ 4.1.3.2.1.2' },
      { t: 'If the Segment Header is not present, the User Data contained in a Frame Data Unit shall consist of one of the following: a) a complete Packet; b) multiple Packets; c) a complete VCA_SDU.', ref: '§ 4.1.3.2.1.3' } ],
    sp: [], nt: [], map: 'tcdf', hi: ['tcud'], kids: [] },

  tccc: { n: 'Control Commands', parent: 'tcdf', bits: null, len: '1 OR 3 OCTETS', pres: 'TYPE-C (BC) FRAMES ONLY', ref: '§ 4.1.3.3',
    desc: 'The content of a Type-BC frame Data Field. Two Control Commands are defined — Unlock and Set V(R) — which configure the FARM to accept data.',
    q: [
      { t: 'Two Control Commands are defined: Unlock and Set V(R); the action to be taken when the FARM receives one of these Control Commands is defined in reference [4].', ref: '§ 4.1.3.3.1' },
      { t: 'The Unlock Control Command shall consist of a single octet containing ‘all zeroes’.', ref: '§ 4.1.3.3.2' } ],
    sp: [
      { c: '00000000', d: 'Unlock — a single octet of all zeroes', ref: '§ 4.1.3.3.2' },
      { c: '10000010 00000000 XXXXXXXX', d: 'Set V(R) — three octets; XXXXXXXX is the value to which the FARM should set the Receiver_Frame_Sequence_Number, V(R)', ref: '§ 4.1.3.3.3' } ],
    nt: ['All other bit combinations for Control Commands are reserved by the CCSDS for future application (4.1.3.3.4).'],
    map: 'tcdf', hi: ['tcud'], kids: [] },

  tcfecf: { n: 'Frame Error Control Field', parent: 'tcframe', bits: null, len: '2 OCTETS', pres: 'OPTIONAL', ref: '§ 4.1.4',
    desc: 'A 16-bit CRC computed over the whole frame, for detecting errors introduced during transmission and data handling. If used, it is present in every frame of the Physical Channel.',
    q: [
      { t: 'The Frame Error Control Field is optional; its presence or absence shall be established by management.', ref: '§ 4.1.4.1.1' },
      { t: 'If present, the Frame Error Control Field shall occupy the two octets following, without gap, the Transfer Frame Data Field.', ref: '§ 4.1.4.1.2' },
      { t: 'The Frame Error Control Field Encoding Procedure shall accept an (n–16)-bit Transfer Frame, excluding the Frame Error Control Field, and generate a systematic binary (n,n–16) block code by appending a 16-bit Frame Error Control Field as the final 16 bits of the codeblock.', ref: '§ 4.1.4.2.1' } ],
    sp: [
      { c: 'G(X) = X¹⁶ + X¹² + X⁵ + 1', d: 'Generating polynomial of the CRC', ref: '§ 4.1.4.2.2' },
      { c: 'L(X) = X¹⁵ + X¹⁴ + … + X + 1', d: 'Presetting polynomial — the shift register is preset to the all-‘1’ state before encoding', ref: '§ 4.1.4.2.2' } ],
    nt: ['At the receiving end the syndrome S(X) is zero if no error is detected and non-zero if an error is detected (4.1.4.3).', 'Whether this field should be used on a particular Physical Channel is determined by mission requirements for data quality and the selected options of the underlying Channel Coding Sublayer.'],
    map: 'tcframe', hi: ['tcfecf'], kids: [] },
};

const TC_MAPS = {
  tcframe: { title: 'WITHIN TC TRANSFER FRAME', cells: [
    { id: 'tcph', l: 'PRIMARY HEADER', w: 5 }, { id: 'tcdf', l: 'DATA FIELD (UP TO 1019 OCTETS)', w: 10 }, { id: 'tcfecf', l: 'FECF', w: 2.5 } ] },
  tcph: { title: 'WITHIN PRIMARY HEADER (40 BITS)', cells: [
    { id: 'tcvn', l: 'VN', w: 2.2 }, { id: 'tcbf', l: 'B', w: 1.3 }, { id: 'tcccf', l: 'C', w: 1.3 }, { id: 'tcrsvd', l: 'R', w: 1.6 },
    { id: 'tcscid', l: 'SPACECRAFT ID', w: 10 }, { id: 'tcvcid', l: 'VCID', w: 6 }, { id: 'tcflen', l: 'FRAME LENGTH', w: 10 }, { id: 'tcfsn', l: 'SEQ NUMBER', w: 8 } ] },
  tcdf: { title: 'WITHIN TRANSFER FRAME DATA FIELD', cells: [
    { id: 'tcseg', l: 'SEG HDR', w: 3 }, { id: 'tcud', l: 'USER DATA', w: 13 } ] },
  tcseg: { title: 'WITHIN SEGMENT HEADER (8 BITS)', cells: [
    { id: 'tcsqf', l: 'SEQ FLAGS', w: 2 }, { id: 'tcmap', l: 'MAP IDENTIFIER', w: 6 } ] },
};

const TC_CRUMBS = {
  tcframe: 'TC TRANSFER FRAME',
  tcph: 'PRIMARY HEADER',
  tcdf: 'DATA FIELD',
  tcseg: 'SEGMENT HEADER'
};

// Field search: abbreviations in common use, by field. Initials of the name are matched without being listed.
const TC_ABBR = { tcph: ['PH'], tcvn: ['TFVN', 'VN'], tcbf: ['BF', 'BYP'], tcccf: ['CCF'], tcrsvd: ['RSVD'], tcscid: ['SCID'], tcvcid: ['VCID'], tcflen: ['FL', 'LEN'], tcfsn: ['FSN', 'N(S)', 'NS'],
  tcdf: ['DF'], tcseg: ['SEG'], tcsqf: ['SEQF'], tcmap: ['MAP', 'MAPID'], tcud: ['FDU'], tccc: ['CC', 'V(R)'], tcfecf: ['FECF', 'ECF', 'CRC'] };

const TC_BUILD = { name: 'TC TRANSFER FRAME PRIMARY HEADER', tab: 'TC SDLP',
  note: 'CCSDS 232.0-B-4 § 4.1.2 — the TC Transfer Frame Primary Header is 5 octets, mandatory and fixed in length. Frame Length is expressed as total octets minus one.',
  fields: [
    { id: 'tcvn', n: 'Transfer Frame Version Number', bits: 2, def: 0, abbr: 'TFVN', kind: 'enum', opts: [{ v: 0, l: '00 · This version' }, { v: 1, l: '01 · Reserved' }, { v: 2, l: '10 · Reserved' }, { v: 3, l: '11 · Reserved' }] },
    { id: 'byp', n: 'Bypass Flag', bits: 1, def: 1, abbr: 'BYP', kind: 'enum', opts: [{ v: 0, l: '0 · Type-A (sequence controlled)' }, { v: 1, l: '1 · Type-B (bypass)' }] },
    { id: 'ccf', n: 'Control Command Flag', bits: 1, def: 0, abbr: 'CCF', kind: 'enum', opts: [{ v: 0, l: '0 · Type-D (data)' }, { v: 1, l: '1 · Type-C (control)' }] },
    { id: 'rsvd', n: 'Reserved Spare', bits: 2, def: 0, abbr: 'RSVD', kind: 'enum', opts: [{ v: 0, l: '00 · Required value' }] },
    { id: 'tcscid', n: 'Spacecraft Identifier', bits: 10, def: 42, abbr: 'SCID' },
    { id: 'tcvcid', n: 'Virtual Channel Identifier', bits: 6, def: 1, abbr: 'VCID' },
    { id: 'tcflen', n: 'Frame Length', bits: 10, def: 0, abbr: 'LEN', overridable: true, deriveNote: 'total octets − 1',
      derive: (vals) => Math.max((vals.__frameOct || 1) - 1, 0),
      overrideNote: (want) => 'Differs from the frame as built: ' + oct(want + 1) + ', so the derived value is ' + want + '.' },
    { id: 'tcfsn', n: 'Frame Sequence Number', bits: 8, def: 0, abbr: 'FSN' } ],
  fecfForm: 'CCSDS 232.0-B-4 § 4.1.4',
  // Type-C frames have neither a Segment Header (§ 4.1.3.2.2.1.3) nor SDLS fields (§ 6.3.4.1). Lengths are the annex E2 baseline of 355.0.
  sdls: { baseline: { iv: 0, sn: 4, pl: 0, mac: 16 }, applies: (get) => get('ccf') === 0,
    blocked: 'SDLS is not used for frames carrying control information (CCSDS 232.0-B-4 § 6.3.4.1), so a Type-C frame has no Security Header or Trailer.' },
  sec: { flag: 'seg', name: 'SEGMENT HEADER', form: 'MANAGED PER VIRTUAL CHANNEL · CCSDS 232.0-B-4 § 4.1.3.2.2', applies: (get) => get('ccf') === 0,
    setting: { id: 'seg', n: 'Presence of Segment Header', abbr: 'SEG', bits: 0, def: 1, setting: true, opts: [{ v: 1, l: 'Present' }, { v: 0, l: 'Absent' }] },
    note: 'One octet at the start of the Frame Data Unit. The frame does not signal its presence; management establishes it for each Virtual Channel.',
    off: 'Management has established no Segment Header on this Virtual Channel, so the Frame Data Unit is User Data only.',
    blocked: 'The Segment Header must not be present in Transfer Frames carrying Control Commands (CCSDS 232.0-B-4 § 4.1.3.2.2.1.3).',
    fields: [
      { id: 'segf', n: 'Sequence Flags', bits: 2, def: 3, abbr: 'SEQF', kind: 'enum', opts: [{ v: 0, l: '00 · Continuing portion' }, { v: 1, l: '01 · First portion' }, { v: 2, l: '10 · Last portion' }, { v: 3, l: '11 · No segmentation' }] },
      { id: 'segmap', n: 'Multiplexer Access Point Identifier', bits: 6, def: 0, abbr: 'MAP' } ] },
  pay: { name: 'TRANSFER FRAME DATA FIELD', field: 'Data Field', abbr: 'DATA', note: 'Optional. The Data Field carries the payload — one or more Packets, a Segment or a VCA_SDU. Give its length in octets and its content as raw hex; leave the length at 0 to build the header only.' } };

// Frame Decoder spec — see DECODE_SPECS in component.js for the decode() contract.
const TC_DECODE = { name: 'TC TRANSFER FRAME', tab: 'TC SDLP',
  note: 'CCSDS 232.0-B-4 § 4.1 — a TC Transfer Frame is a 5-octet Primary Header, a Data Field of up to 1019 octets and an optional 2-octet FECF. The Data Field holds a Frame Data Unit (Type-D, with an optional Segment Header) or Control Commands (Type-C). With SDLS (§ 6.3, CCSDS 355.0-B-2) a Security Header and optional Security Trailer surround the User Data of Type-D frames.',
  setNote: 'The frame carries its own length, but it does not signal these; they are established by management (tables 5-1, 5-3, 6-2 and 6-3). Type-C frames never have a Segment Header or SDLS fields, so those settings apply to Type-D frames only.',
  settings: [
    { id: 'fecf', n: 'Presence of Frame Error Control', ref: 'TABLE 5-1', def: 1, opts: [{ v: 1, l: 'Present — last 2 octets are the FECF' }, { v: 0, l: 'Absent' }],
      note: 'If present, the CRC is computed and compared with the received value.' },
    { id: 'seg', n: 'Presence of Segment Header', ref: 'TABLE 5-3', def: 1, opts: [{ v: 1, l: 'Present — Sequence Flags and MAP ID' }, { v: 0, l: 'Absent' }],
      note: 'Per Virtual Channel. Required with more than one MAP, or for service data units too large for one frame.' },
    { id: 'maxLen', n: 'Maximum Transfer Frame Length', ref: 'TABLE 5-1', unit: 'octets', def: 1024, min: 5, max: 1024,
      note: 'Largest frame the mission allows. The Standard’s limit is 1024.' },
    ...sdlsSettings({ iv: 0, sn: 4, pl: 0, mac: 16 }) ],   // annex E2 baseline of 355.0
  exampleSet: SDLS_OFF,
  examples: [
    { l: 'Type-BD · Segment', hex: '20 2A 04 13 00 C5 11 A2 C0 2A 00 05 A1 B2 C3 D4 E5 F6 87 4D' },
    { l: 'Type-AD · first portion', hex: '00 2A 08 0B 07 43 DE AD BE EF 0F 04' },
    { l: 'Type-BC · Unlock', hex: '30 2A 04 07 00 00 20 E7' },
    { l: 'Type-BC · Set V(R)', hex: '30 2A 04 09 00 82 00 2A 94 95' },
    { l: 'Fill Data', hex: '20 2A 04 13 00 C5 11 A2 C0 2A 00 05 A1 B2 C3 D4 E5 F6 87 4D 55 55 55' },
    { l: 'Truncated', hex: '20 2A 04 13 00 C5 11 A2 C0 2A 00 05 A1 B2 C3' },
    { l: 'Bad FECF', hex: '20 2A 04 13 00 C5 11 A2 C4 2A 00 05 A1 B2 C3 D4 E5 F6 87 4D' },
    { l: 'SDLS · baseline', set: { secSvc: SDLS_AUTH, secIv: 0, secSn: 4, secPl: 0, secMac: 16 },
      hex: '20 2A 04 29 00 C5 00 02 00 00 00 2A 11 A2 C0 2A 00 05 A1 B2 C3 D4 E5 F6 3F 56 8E 02 23 C0 DB F4 17 1D AD 30 4C E5 E0 90 6D 87' } ],
  decode: decodeTc };

function decodeTc(b, set) {
  const h = decodeHelpers(b);
  const { fields, checks, check, bitField, octField, fecfField } = h;
  const FILL = 0x55, FILL_MAX = 6;   // § 4.4.9.2.6

  if (b.length < 5) {
    if (b.length) check('err', 'The Transfer Frame Primary Header is 5 octets — only ' + oct(b.length) + ' received, so nothing can be decoded.', '§ 4.1.2.1');
    return { fields, checks };
  }

  const bypass = readBits(b, 2, 1), control = readBits(b, 3, 1);
  const frameType = bypass ? (control ? 'Type-BC' : 'Type-BD') : (control ? 'Reserved combination' : 'Type-AD');

  const tfvn = bitField('tcvn', 'Transfer Frame Version Number', 'TFVN', 0, 2, v => v === 0 ? 'TC Version 1 Asynchronous Transfer Frame' : 'Not a Transfer Frame defined by this Standard');
  bitField('tcbf', 'Bypass Flag', 'BYP', 2, 1, v => v ? 'Type-B — Frame Acceptance Checks bypassed' : 'Type-A — subject to Frame Acceptance Checks');
  bitField('tcccf', 'Control Command Flag', 'CCF', 3, 1, v => v ? 'Type-C — Control Commands' : 'Type-D — Frame Data Unit');
  const rsvd = bitField('tcrsvd', 'Reserved Spare', 'RSVD', 4, 2, v => v === 0 ? 'Required value' : 'Shall be ‘00’');
  bitField('tcscid', 'Spacecraft Identifier', 'SCID', 6, 10, v => '0x' + v.toString(16).toUpperCase().padStart(3, '0'));
  bitField('tcvcid', 'Virtual Channel Identifier', 'VCID', 16, 6, v => 'Virtual Channel ' + v);
  const flen = bitField('tcflen', 'Frame Length', 'LEN', 22, 10, v => 'C + 1 = ' + oct(v + 1) + ' in the frame');
  const fsn = bitField('tcfsn', 'Frame Sequence Number', 'FSN', 32, 8, () => bypass ? 'N(S) — not used by the COP in a Type-B frame' : 'N(S) — checked by the FARM');

  const total = flen + 1;

  if (tfvn !== 0) check('err', 'Transfer Frame Version Number is ‘' + tfvn.toString(2).padStart(2, '0') + '’ — a TC Transfer Frame carries ‘00’.', '§ 4.1.2.2.2');
  if (!bypass && control) check('err', 'Bypass Flag ‘0’ with Control Command Flag ‘1’ is reserved for future application.', 'TABLE 4-1');
  else check('info', frameType + ' frame' + (frameType === 'Type-AD' ? ' — Sequence-Controlled Service of the COP.' : frameType === 'Type-BD' ? ' — Expedited Service of the COP.' : ' — controls the Sequence-Controlled Service of the COP.'), 'TABLE 4-1');
  if (rsvd !== 0) check('err', 'Reserved Spare is ‘' + rsvd.toString(2).padStart(2, '0') + '’ — it shall be ‘00’.', '§ 4.1.2.4.2');
  if (bypass && fsn !== 0) check('warn', 'Frame Sequence Number is ' + fsn + ' in a Type-B frame — the COP does not use it and sets it to all zeroes.', '§ 4.1.2.8');

  if (b.length < total) check('err', 'Frame is truncated: Frame Length declares ' + oct(total) + ', but only ' + oct(b.length) + ' received. A receiver discards these octets.', '§ 4.4.9.2.5');
  else if (b.length === total) check('ok', 'Frame Length matches the data received: C + 1 = ' + oct(total) + '.', '§ 4.4.9.3.3');
  if (total > set.maxLen) check('warn', 'Frame length ' + oct(total) + ' exceeds the mission Maximum Transfer Frame Length of ' + oct(set.maxLen) + '.', 'TABLE 5-1');

  // Type-C frames have neither a Segment Header nor SDLS fields, whatever the settings say for Type-D frames.
  const seg = !control && set.seg ? 1 : 0, sec = sdlsLayout(set, !control);
  const fecf = set.fecf ? 2 : 0;
  const dataLen = total - 5 - seg - sec.hdr - sec.trl - fecf;
  if (sec.on) sdlsCheckSettings(check, set);

  if (dataLen < 1) {
    check('err', 'No room for a Data Field: Frame Length gives ' + oct(total) + ', but the headers and trailers take ' + oct(total - dataLen) + '. Check the mission settings if the frame itself looks right.', '§ 4.1.1');
  } else {
    let pos = 5;
    if (control && set.secSvc !== SDLS_NONE) check('info', 'Security settings are not applied: SDLS is not used for frames carrying control information.', '§ 6.3.4.1');
    if (seg) {
      if (b.length > pos) {
        bitField('tcsqf', 'Sequence Flags', 'SEQF', 40, 2, v => ['Continuing portion of a service data unit', 'First portion of a service data unit', 'Last portion of a service data unit', 'No segmentation'][v]);
        bitField('tcmap', 'Multiplexer Access Point Identifier', 'MAP', 42, 6, v => 'MAP Channel ' + v);
      } else octField('tcseg', 'Segment Header', 'SEG', pos, 1, 'Sequence Flags and MAP Identifier');
      pos += 1;
    }
    if (sec.on) {
      sdlsCoverage(check, set, pos + sec.hdr, pos + sec.hdr + dataLen, '355.0 § 5.2');
      sdlsHeaderFields(h, b, pos, set, dataLen);
      pos += sec.hdr;
    }

    if (control) {
      const got = Math.min(dataLen, b.length - pos);
      const isUnlock = dataLen === 1 && got === 1 && b[pos] === 0;
      const isSetVr = dataLen === 3 && got === 3 && b[pos] === 0x82 && b[pos + 1] === 0;
      octField('tccc', 'Control Commands', 'CC', pos, dataLen, isUnlock ? 'Unlock' : isSetVr ? 'Set V(R) — V(R) = ' + b[pos + 2] : got < dataLen ? 'Command not identified' : 'Reserved bit combination');
      if (got === dataLen && !isUnlock && !isSetVr) check('err', 'Control Commands are neither Unlock (00) nor Set V(R) (82 00 XX) — all other bit combinations are reserved.', '§ 4.1.3.3.4');
    } else {
      const content = seg ? 'Packets, a MAP_SDU, or a portion of one of them' : 'Packets or a VCA_SDU';
      octField('tcud', 'User Data', 'USER', pos, dataLen, sec.encrypted ? content + ' — ciphertext' : content);
    }
    pos += dataLen;

    if (sec.trl) { sdlsTrailerField(h, pos, set); pos += sec.trl; }
    if (fecf) fecfField('tcfecf', pos, '§ 4.1.4.3');
  }

  if (b.length > total) {
    const from = Math.max(total, 5), extra = b.length - from;
    const isFill = extra <= FILL_MAX && b.slice(from).every(x => x === FILL);
    if (isFill) {
      check('info', oct(extra) + ' of Fill Data after the frame, added by the Channel Coding Sublayer to complete its last Codeblock. A receiver discards them.', '§ 4.4.9.2.6');
      octField(null, 'Fill Data', 'FILL', from, extra, 'Not part of this frame', { extra: true });
    } else {
      check('warn', oct(extra) + ' after the end of the frame (octet ' + from + ' onward), and they are not Fill Data — at most 6 octets of ‘01010101’. Possibly the next frame of the same data unit.', '§ 4.4.9.2.3');
      octField(null, 'Octets after the frame', 'EXTRA', from, extra, 'Not part of this frame', { extra: true });
    }
  }

  return { fields, checks };
}
