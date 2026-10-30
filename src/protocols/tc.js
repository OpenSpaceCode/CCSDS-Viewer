// TC Space Data Link Protocol — CCSDS 232.0-B-4.
// Field reference pages, structure maps, breadcrumb names and the Frame Builder spec.

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

const TC_BUILD = { name: 'TC TRANSFER FRAME PRIMARY HEADER', tab: 'TC SDLP',
  note: 'CCSDS 232.0-B-4 § 4.1.2 — the TC Transfer Frame Primary Header is 5 octets, mandatory and fixed in length. Frame Length is expressed as total octets minus one.',
  fields: [
    { id: 'tcvn', n: 'Transfer Frame Version Number', bits: 2, def: 0, abbr: 'TFVN', kind: 'enum', opts: [{ v: 0, l: '00 · This version' }, { v: 1, l: '01 · Reserved' }, { v: 2, l: '10 · Reserved' }, { v: 3, l: '11 · Reserved' }] },
    { id: 'byp', n: 'Bypass Flag', bits: 1, def: 1, abbr: 'BYP', kind: 'enum', opts: [{ v: 0, l: '0 · Type-A (sequence controlled)' }, { v: 1, l: '1 · Type-B (bypass)' }] },
    { id: 'ccf', n: 'Control Command Flag', bits: 1, def: 0, abbr: 'CCF', kind: 'enum', opts: [{ v: 0, l: '0 · Type-D (data)' }, { v: 1, l: '1 · Type-C (control)' }] },
    { id: 'rsvd', n: 'Reserved Spare', bits: 2, def: 0, abbr: 'RSVD', kind: 'enum', opts: [{ v: 0, l: '00 · Required value' }] },
    { id: 'tcscid', n: 'Spacecraft Identifier', bits: 10, def: 42, abbr: 'SCID' },
    { id: 'tcvcid', n: 'Virtual Channel Identifier', bits: 6, def: 1, abbr: 'VCID' },
    { id: 'tcflen', n: 'Frame Length', bits: 10, def: 63, abbr: 'LEN' },
    { id: 'tcfsn', n: 'Frame Sequence Number', bits: 8, def: 7, abbr: 'FSN' } ],
  pay: { name: 'TRANSFER FRAME DATA FIELD', field: 'Data Field', abbr: 'DATA', note: 'Optional. The Data Field carries the payload — one or more Packets, a Segment or a VCA_SDU. Give its length in octets and its content as raw hex; leave the length at 0 to build the header only.' } };
