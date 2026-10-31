// TM Space Data Link Protocol — CCSDS 132.0-B-3.
// Field reference pages, structure maps, breadcrumb names, Frame Builder spec and Frame Decoder.

const TM_FIELDS = {
  ph: { n: 'Transfer Frame Primary Header', parent: 'frame', bits: 'BITS 0–47', len: '6 OCTETS', pres: 'MANDATORY', ref: '§ 4.1.2',
    desc: 'The mandatory six-field header of every TM Transfer Frame. It identifies the frame within its Master and Virtual Channel and describes how the Data Field is structured.',
    q: [
      { t: 'The Transfer Frame Primary Header is mandatory and shall consist of six fields, positioned contiguously, in the following sequence: a) Master Channel Identifier (12 bits, mandatory); b) Virtual Channel Identifier (3 bits, mandatory); c) Operational Control Field Flag (1 bit, mandatory); d) Master Channel Frame Count (1 octet, mandatory); e) Virtual Channel Frame Count (1 octet, mandatory); f) Transfer Frame Data Field Status (2 octets, mandatory).', ref: '§ 4.1.2.1' } ],
    sp: [], nt: ['The format of the Transfer Frame Primary Header is shown in figure 4-2 of the Standard.'],
    map: 'frame', hi: ['ph'], kids: ['mcid', 'vcid', 'ocff', 'mcfc', 'vcfc', 'dfs'] },

  mcid: { n: 'Master Channel Identifier', parent: 'ph', bits: 'BITS 0–11', len: '12 BITS', pres: 'MANDATORY', ref: '§ 4.1.2.2',
    desc: 'Identifies the Master Channel: the concatenation of the Transfer Frame Version Number and the Spacecraft Identifier. All frames with the same MCID on a Physical Channel belong to one Master Channel.',
    q: [
      { t: 'Bits 0–11 of the Transfer Frame Primary Header shall contain the Master Channel Identifier (MCID). The Master Channel Identifier shall consist of: a) Transfer Frame Version Number (2 bits, mandatory); b) Spacecraft Identifier (10 bits, mandatory).', ref: '§ 4.1.2.2.1' } ],
    sp: [], nt: [], map: 'ph', hi: ['vn', 'scid'], kids: ['vn', 'scid'] },

  vn: { n: 'Transfer Frame Version Number', parent: 'mcid', bits: 'BITS 0–1', len: '2 BITS', pres: 'MANDATORY', ref: '§ 4.1.2.2.2',
    desc: 'Identifies the data unit as a TM Version 1 Synchronous Transfer Frame. Always set to ‘00’ — the only version defined by the Standard.',
    q: [
      { t: 'Bits 0–1 of the Transfer Frame Primary Header shall contain the (binary encoded) Transfer Frame Version Number.', ref: '§ 4.1.2.2.2.1' },
      { t: 'This 2-bit field shall identify the data unit as a Transfer Frame defined by this Recommended Standard; it shall be set to ‘00’.', ref: '§ 4.1.2.2.2.2' } ],
    sp: [ { c: '‘00’', d: 'TM Version 1 Synchronous Transfer Frame — the only version defined by this Standard', ref: '§ 4.1.2.2.2 NOTE 1' } ],
    nt: ['Although they have the same version number, TC Transfer Frames and TM Transfer Frames are distinguishable by the Attached Sync Marker (reference [3]) or the Start Sequence (reference [C8]).'],
    map: 'ph', hi: ['vn'], kids: [] },

  scid: { n: 'Spacecraft Identifier', parent: 'mcid', bits: 'BITS 2–11', len: '10 BITS', pres: 'MANDATORY', ref: '§ 4.1.2.2.3',
    desc: 'Identifies the spacecraft associated with the data contained in the frame. Assigned by SANA and static throughout all Mission Phases.',
    q: [
      { t: 'The Spacecraft Identifier shall provide the identification of the spacecraft which is associated with the data contained in the Transfer Frame.', ref: '§ 4.1.2.2.3.2' },
      { t: 'The Spacecraft Identifier shall be static throughout all Mission Phases.', ref: '§ 4.1.2.2.3.3' } ],
    sp: [],
    nt: ['The Space Assigned Numbers Authority (SANA) assigns Spacecraft Identifiers according to the procedures in reference [7]. SCIDs are uniquely assigned within the frequency band in which the spacecraft operates.'],
    map: 'ph', hi: ['scid'], kids: [] },

  vcid: { n: 'Virtual Channel Identifier', parent: 'ph', bits: 'BITS 12–14', len: '3 BITS', pres: 'MANDATORY', ref: '§ 4.1.2.3',
    desc: 'Identifies the Virtual Channel — up to eight Virtual Channels can share one Master Channel.',
    q: [ { t: 'Bits 12–14 of the Transfer Frame Primary Header shall contain the VCID.', ref: '§ 4.1.2.3' } ],
    sp: [],
    nt: ['The Virtual Channel Identifier provides the identification of the Virtual Channel.', 'There are no restrictions on the selection of Virtual Channel Identifiers. In particular, Virtual Channels are not required to be numbered consecutively.'],
    map: 'ph', hi: ['vcid'], kids: [] },

  ocff: { n: 'Operational Control Field Flag', parent: 'ph', bits: 'BIT 15', len: '1 BIT', pres: 'MANDATORY', ref: '§ 4.1.2.4',
    desc: 'Signals the presence or absence of the Operational Control Field in the frame trailer. Static within the associated Master or Virtual Channel for a Mission Phase.',
    q: [
      { t: 'The Operational Control Field Flag shall indicate the presence or absence of the Operational Control Field. It shall be ‘1’ if the Operational Control Field is present; it shall be ‘0’ if the Operational Control Field is not present.', ref: '§ 4.1.2.4.2' },
      { t: 'The Operational Control Field Flag shall be static within the associated Master or Virtual Channel throughout a Mission Phase.', ref: '§ 4.1.2.4.3' } ],
    sp: [
      { c: '‘1’', d: 'Operational Control Field present', ref: '§ 4.1.2.4.2' },
      { c: '‘0’', d: 'Operational Control Field not present', ref: '§ 4.1.2.4.2' } ],
    nt: [], map: 'ph', hi: ['ocff'], kids: [] },

  mcfc: { n: 'Master Channel Frame Count', parent: 'ph', bits: 'BITS 16–23', len: '8 BITS', pres: 'MANDATORY', ref: '§ 4.1.2.5',
    desc: 'Running modulo-256 count of every Transfer Frame transmitted on the Master Channel; provides continuity checking across all Virtual Channels of the spacecraft.',
    q: [
      { t: 'This 8-bit field shall contain a sequential binary count (modulo-256) of each Transfer Frame transmitted within a specific Master Channel.', ref: '§ 4.1.2.5.2' },
      { t: 'A re-setting of the Master Channel Frame Count before reaching 255 shall not take place unless it is unavoidable.', ref: '§ 4.1.2.5.3' } ],
    sp: [],
    nt: ['If the Master Channel Frame Count is re-set because of an unavoidable re-initialization, the completeness of a sequence of Transfer Frames in the related Master Channel cannot be determined.'],
    map: 'ph', hi: ['mcfc'], kids: [] },

  vcfc: { n: 'Virtual Channel Frame Count', parent: 'ph', bits: 'BITS 24–31', len: '8 BITS', pres: 'MANDATORY', ref: '§ 4.1.2.6',
    desc: 'Running modulo-256 count of every Transfer Frame transmitted on the Virtual Channel; the key input for systematic Packet extraction at the receiving end.',
    q: [
      { t: 'This 8-bit field shall contain a sequential binary count (modulo-256) of each Transfer Frame transmitted within a specific Virtual Channel.', ref: '§ 4.1.2.6.2' },
      { t: 'A re-setting of the Virtual Channel Frame Count before reaching 255 shall not take place unless it is unavoidable.', ref: '§ 4.1.2.6.3' } ],
    sp: [],
    nt: ['The purpose of this field is to provide individual accountability for each Virtual Channel, primarily to enable systematic Packet extraction from the Transfer Frame Data Field.'],
    map: 'ph', hi: ['vcfc'], kids: [] },

  dfs: { n: 'Transfer Frame Data Field Status', parent: 'ph', bits: 'BITS 32–47', len: '16 BITS', pres: 'MANDATORY', ref: '§ 4.1.2.7',
    desc: 'Five sub-fields that describe how the Data Field is structured: the Secondary Header Flag, Synchronization Flag, Packet Order Flag, Segment Length Identifier and First Header Pointer.',
    q: [
      { t: 'This 16-bit field shall be sub-divided into five sub-fields, as follows: a) Transfer Frame Secondary Header Flag (1 bit, mandatory); b) Synchronization Flag (1 bit, mandatory); c) Packet Order Flag (1 bit, mandatory); d) Segment Length Identifier (2 bits, mandatory); e) First Header Pointer (11 bits, mandatory).', ref: '§ 4.1.2.7.1.2' } ],
    sp: [], nt: ['The format of the Transfer Frame Data Field Status is shown in figure 4-3 of the Standard.'],
    map: 'ph', hi: ['dfs'], kids: ['shf', 'sync', 'pof', 'slid', 'fhp'] },

  shf: { n: 'Transfer Frame Secondary Header Flag', parent: 'dfs', bits: 'BIT 32', len: '1 BIT', pres: 'MANDATORY', ref: '§ 4.1.2.7.2',
    desc: 'Signals the presence or absence of the Transfer Frame Secondary Header. Static within the associated Master or Virtual Channel for a Mission Phase.',
    q: [
      { t: 'The Transfer Frame Secondary Header Flag shall signal the presence or absence of the Transfer Frame Secondary Header. It shall be ‘1’ if a Transfer Frame Secondary Header is present; it shall be ‘0’ if a Transfer Frame Secondary Header is not present.', ref: '§ 4.1.2.7.2.2' } ],
    sp: [
      { c: '‘1’', d: 'Secondary Header present', ref: '§ 4.1.2.7.2.2' },
      { c: '‘0’', d: 'Secondary Header not present', ref: '§ 4.1.2.7.2.2' } ],
    nt: ['The Transfer Frame Secondary Header Flag shall be static within the associated Master or Virtual Channel throughout a Mission Phase (4.1.2.7.2.3).'],
    map: 'dfs', hi: ['shf'], kids: [] },

  sync: { n: 'Synchronization Flag', parent: 'dfs', bits: 'BIT 33', len: '1 BIT', pres: 'MANDATORY', ref: '§ 4.1.2.7.3',
    desc: 'Signals the type of data inserted into the Data Field: octet-synchronized, forward-ordered Packets or Idle Data (‘0’), or a VCA_SDU (‘1’).',
    q: [
      { t: 'The Synchronization Flag shall signal the type of data which are inserted into the Transfer Frame Data Field. It shall be ‘0’ if octet-synchronized and forward-ordered Packets or Idle Data are inserted; it shall be ‘1’ if a VCA_SDU is inserted.', ref: '§ 4.1.2.7.3.2' },
      { t: 'The Synchronization Flag shall be static within a specific Virtual Channel throughout a Mission Phase.', ref: '§ 4.1.2.7.3.3' } ],
    sp: [
      { c: '‘0’', d: 'Octet-synchronized, forward-ordered Packets or Idle Data in the Data Field', ref: '§ 4.1.2.7.3.2' },
      { c: '‘1’', d: 'A VCA_SDU (Virtual Channel Access service data unit) in the Data Field', ref: '§ 4.1.2.7.3.2' } ],
    nt: [], map: 'dfs', hi: ['sync'], kids: [] },

  pof: { n: 'Packet Order Flag', parent: 'dfs', bits: 'BIT 34', len: '1 BIT', pres: 'MANDATORY', ref: '§ 4.1.2.7.4',
    desc: 'Reserved bit. Set to ‘0’ when the Synchronization Flag is ‘0’; undefined when the Synchronization Flag is ‘1’.',
    q: [ { t: 'Bit 34 of the Transfer Frame Primary Header shall contain the Packet Order Flag.', ref: '§ 4.1.2.7.4' } ],
    sp: [ { c: '‘0’', d: 'Reserved for future use by the CCSDS (when Synchronization Flag = ‘0’)', ref: '§ 4.1.2.7.4 NOTE' } ],
    nt: ['If the Synchronization Flag is set to ‘0’, the Packet Order Flag is reserved for future use by the CCSDS and is set to ‘0’. If the Synchronization Flag is set to ‘1’, the use of the Packet Order Flag is undefined.'],
    map: 'dfs', hi: ['pof'], kids: [] },

  slid: { n: 'Segment Length Identifier', parent: 'dfs', bits: 'BITS 35–36', len: '2 BITS', pres: 'MANDATORY', ref: '§ 4.1.2.7.5',
    desc: 'Legacy field kept from earlier versions of the Standard (Source Packet Segments are no longer defined). Set to ‘11’ when the Synchronization Flag is ‘0’.',
    q: [ { t: 'If the Synchronization Flag is set to ‘0’, the Segment Length Identifier shall be set to ‘11’.', ref: '§ 4.1.2.7.5.2' } ],
    sp: [ { c: '‘11’', d: 'Denotes non-use of Source Packet Segments (mandatory value when Sync Flag = ‘0’)', ref: '§ 4.1.2.7.5.2' } ],
    nt: ['This Identifier was required for earlier versions of this Recommended Standard to allow for the use of Source Packet Segments, which are no longer defined.', 'If the Synchronization Flag is set to ‘1’, then the Segment Length Identifier is undefined.'],
    map: 'dfs', hi: ['slid'], kids: [] },

  fhp: { n: 'First Header Pointer', parent: 'dfs', bits: 'BITS 37–47', len: '11 BITS', pres: 'MANDATORY', ref: '§ 4.1.2.7.6',
    desc: 'Points to the first octet of the first Packet that starts in the Data Field, enabling delimiting of variable-length Packets. Two reserved values signal ‘no Packet starts here’ and ‘Only Idle Data’.',
    q: [
      { t: 'If the Synchronization Flag is set to ‘0’, the First Header Pointer shall contain the position of the first octet of the first Packet that starts in the Transfer Frame Data Field.', ref: '§ 4.1.2.7.6.2' },
      { t: 'The locations of the octets in the Transfer Frame Data Field shall be numbered in ascending order. The first octet in this Field is assigned the number 0.', ref: '§ 4.1.2.7.6.3' } ],
    sp: [
      { c: '‘11111111111’', d: 'No Packet starts in the Transfer Frame Data Field (e.g. a long Packet spans the whole frame)', ref: '§ 4.1.2.7.6.4' },
      { c: '‘11111111110’', d: 'Only Idle Data in the Data Field — an OID Transfer Frame', ref: '§ 4.1.2.7.6.5' } ],
    nt: ['If the last Packet of frame N spills over into frame M of the same Virtual Channel, the First Header Pointer in frame M ignores the residue of the split Packet and indicates the start of the next Packet that starts in frame M.', 'If the Synchronization Flag is set to ‘1’, the First Header Pointer is undefined.'],
    map: 'dfs', hi: ['fhp'], kids: [] },

  sh: { n: 'Transfer Frame Secondary Header', parent: 'frame', bits: null, len: 'UP TO 64 OCTETS', pres: 'OPTIONAL', ref: '§ 4.1.3',
    desc: 'Optional fixed-length extension for mission-specific data transferred synchronously with a Master or Virtual Channel. Its presence is signaled by the Secondary Header Flag in the Primary Header.',
    q: [
      { t: 'If present, the Transfer Frame Secondary Header shall follow, without gap, the Transfer Frame Primary Header.', ref: '§ 4.1.3.1.1' },
      { t: 'The Transfer Frame Secondary Header shall consist of an integral number of octets as follows: a) Transfer Frame Secondary Header Identification Field (1 octet, mandatory); b) Transfer Frame Secondary Header Data Field (1 to 63 octets, mandatory).', ref: '§ 4.1.3.1.3' },
      { t: 'The Transfer Frame Secondary Header shall be of fixed length within the associated Master or Virtual Channel throughout a Mission Phase.', ref: '§ 4.1.3.1.6' } ],
    sp: [], nt: ['If present, this field occurs within every Transfer Frame transmitted through the associated Master or Virtual Channel throughout a Mission Phase (4.1.3.1.5).'],
    map: 'frame', hi: ['sh'], kids: ['shid', 'shdf'] },

  shid: { n: 'Secondary Header Identification Field', parent: 'sh', bits: 'SH BITS 0–7', len: '1 OCTET', pres: 'MANDATORY WITHIN SH', ref: '§ 4.1.3.2',
    desc: 'The first octet of the Secondary Header: a 2-bit version number followed by a 6-bit length field.',
    q: [
      { t: 'The Transfer Frame Secondary Header Identification Field shall be sub-divided into two sub-fields as follows: a) Transfer Frame Secondary Header Version Number (2 bits, mandatory); b) Transfer Frame Secondary Header Length (6 bits, mandatory).', ref: '§ 4.1.3.2.1.2' } ],
    sp: [], nt: [], map: 'sh', hi: ['shvn', 'shlen'], kids: ['shvn', 'shlen'] },

  shvn: { n: 'Secondary Header Version Number', parent: 'shid', bits: 'SH BITS 0–1', len: '2 BITS', pres: 'MANDATORY WITHIN SH', ref: '§ 4.1.3.2.2',
    desc: 'Indicates which of up to four Secondary Header versions is used; only Version 1 (‘00’) is defined.',
    q: [ { t: 'The Transfer Frame Secondary Header Version Number shall be set to ‘00’.', ref: '§ 4.1.3.2.2.2' } ],
    sp: [ { c: '‘00’', d: 'Version 1 — the only Secondary Header version recognized by this Standard', ref: '§ 4.1.3.2.2.2 NOTE' } ],
    nt: [], map: 'sh', hi: ['shvn'], kids: [] },

  shlen: { n: 'Secondary Header Length', parent: 'shid', bits: 'SH BITS 2–7', len: '6 BITS', pres: 'MANDATORY WITHIN SH', ref: '§ 4.1.3.2.3',
    desc: 'The total length of the Secondary Header in octets, minus one, binary encoded. Static within the associated channel for a Mission Phase.',
    q: [
      { t: 'This sub-field shall contain the total length of the Transfer Frame Secondary Header in octets minus one, represented as a binary number.', ref: '§ 4.1.3.2.3.2' },
      { t: 'The Transfer Frame Secondary Header Length shall be static within the associated Master or Virtual Channel throughout a Mission Phase.', ref: '§ 4.1.3.2.3.3' } ],
    sp: [ { c: 'VALUE = LENGTH − 1', d: 'e.g. a 12-octet Secondary Header carries the value 11 (‘001011’)', ref: '§ 4.1.3.2.3.2' } ],
    nt: ['When a Secondary Header is present, this length may be used to compute the location of the start of the field following the Secondary Header.'],
    map: 'sh', hi: ['shlen'], kids: [] },

  shdf: { n: 'Secondary Header Data Field', parent: 'sh', bits: null, len: '1–63 OCTETS', pres: 'MANDATORY WITHIN SH', ref: '§ 4.1.3.3',
    desc: 'Carries the mission-specific Secondary Header data (FSH_SDUs supplied through the MC_FSH or VC_FSH service). Fixed length within the associated channel.',
    q: [
      { t: 'The Transfer Frame Secondary Header Data Field shall follow, without gap, the Transfer Frame Secondary Header Identification Field.', ref: '§ 4.1.3.3.1' },
      { t: 'The Transfer Frame Secondary Header Data Field shall be of fixed length within the associated Master or Virtual Channel throughout a Mission Phase.', ref: '§ 4.1.3.3.3' } ],
    sp: [], nt: [], map: 'sh', hi: ['shdf'], kids: [] },

  df: { n: 'Transfer Frame Data Field', parent: 'frame', bits: null, len: 'VARIES', pres: 'MANDATORY', ref: '§ 4.1.4',
    desc: 'Carries the mission data: octet-synchronized Packets, one VCA_SDU, or Idle Data. Its length equals the fixed frame length minus the headers and trailer present.',
    q: [
      { t: 'The Transfer Frame Data Field shall contain Packets, one VCA_SDU, or Idle Data.', ref: '§ 4.1.4.3' },
      { t: 'If Packets are contained in the Transfer Frame Data Field, Packets shall be inserted contiguously and in forward order into the Transfer Frame Data Field.', ref: '§ 4.1.4.5' },
      { t: 'VCA_SDUs shall not be mixed with Packets on the same Virtual Channel.', ref: '§ 4.1.4.4' } ],
    sp: [
      { c: 'FHP = ‘11111111110’', d: 'OID Transfer Frame — the Data Field is filled with the mandatory Pseudo-Noise idle pattern', ref: '§ 4.1.4.6' },
      { c: 'D⁰+D¹+D²+D²²+D³²', d: 'Polynomial of the 32-cell LFSR that generates the PN idle sequence (annex D)', ref: '§ 4.1.4.6.2' },
      { c: 'FF FF FF FF 6D B6 D8 61 45 1F', d: 'First 10 bytes of the OID data pattern, in hexadecimal', ref: '§ 4.1.4.6.2 NOTE' } ],
    nt: ['The first and last Packets of the Data Field are not necessarily complete: the first may be a continuation from the previous frame, and the last may continue in the subsequent frame of the same Virtual Channel.'],
    map: 'frame', hi: ['df'], kids: [] },

  ocf: { n: 'Operational Control Field', parent: 'frame', bits: null, len: '4 OCTETS', pres: 'OPTIONAL', ref: '§ 4.1.5',
    desc: 'Standardized real-time reporting slot in the frame trailer. Carries a Type-1 Report (the COP-1 Communications Link Control Word) or a Type-2 Report (project-specific or an SDLS Frame Security Report).',
    q: [
      { t: 'If present, the Operational Control Field shall occupy the four octets following, without gap, the Transfer Frame Data Field.', ref: '§ 4.1.5.1' },
      { t: 'The Type Flag shall be ‘0’ if the Operational Control Field holds a Type-1-Report which shall contain a Communications Link Control Word, the content of which is defined in reference [C6]; the Type Flag shall be ‘1’ if the Operational Control Field holds a Type-2-Report.', ref: '§ 4.1.5.4' } ],
    sp: [
      { c: 'BIT 0 = ‘0’', d: 'Type-1 Report — Communications Link Control Word (COP-1, reference [C6])', ref: '§ 4.1.5.4' },
      { c: 'BIT 0 = ‘1’', d: 'Type-2 Report', ref: '§ 4.1.5.4' },
      { c: 'BIT 1 = ‘0’', d: 'Type-2 Report contents are project-specific', ref: '§ 4.1.5.5' },
      { c: 'BIT 1 = ‘1’', d: 'Type-2 Report contains an SDLS Frame Security Report (reference [11])', ref: '§ 4.1.5.5' } ],
    nt: ['The Type Flag may vary between Transfer Frames on the same Master or Virtual Channel that carries this field.', 'VCs carrying OCFs must be transmitted frequently enough not to disrupt the COP in use, which can time out if OCFs are not delivered in a timely fashion.'],
    map: 'frame', hi: ['ocf'], kids: [] },

  fecf: { n: 'Frame Error Control Field', parent: 'frame', bits: null, len: '2 OCTETS', pres: 'OPTIONAL', ref: '§ 4.1.6',
    desc: 'A 16-bit CRC computed over the whole frame, for detecting errors introduced during transmission and data handling. If used, it is present in every frame of the Physical Channel.',
    q: [
      { t: 'If present, the Frame Error Control Field shall occupy the two octets following, without gap, the Operational Control Field if this is present, or the Transfer Frame Data Field, if an Operational Control Field is not present.', ref: '§ 4.1.6.1.1' },
      { t: 'The Encoding Procedure shall accept an (n–16)-bit Transfer Frame, excluding the Frame Error Control Field, and generate a systematic binary (n,n–16) block code by appending a 16-bit Frame Error Control Field as the final 16 bits of the codeblock.', ref: '§ 4.1.6.2.1' } ],
    sp: [
      { c: 'G(X) = X¹⁶ + X¹² + X⁵ + 1', d: 'Generating polynomial of the CRC', ref: '§ 4.1.6.2.2' },
      { c: 'L(X) = X¹⁵ + X¹⁴ + … + X + 1', d: 'Presetting polynomial — the shift register is preset to the all-‘1’ state before encoding', ref: '§ 4.1.6.2.2' } ],
    nt: ['At the receiving end the syndrome S(X) is zero if no error is detected and non-zero if an error is detected (4.1.6.3).', 'This field may be mandatory depending on the selected options of the underlying Channel Coding Sublayer.'],
    map: 'frame', hi: ['fecf'], kids: [] },
};

const TM_MAPS = {
  frame: { title: 'WITHIN TM TRANSFER FRAME', cells: [
    { id: 'ph', l: 'PRIMARY HEADER', w: 6 }, { id: 'sh', l: 'SECONDARY HDR', w: 5 },
    { id: 'df', l: 'DATA FIELD', w: 8 }, { id: 'ocf', l: 'OCF', w: 2.6 }, { id: 'fecf', l: 'FECF', w: 2.2 } ] },
  ph: { title: 'WITHIN PRIMARY HEADER (48 BITS)', cells: [
    { id: 'vn', l: 'VN', w: 2.4 }, { id: 'scid', l: 'SPACECRAFT ID', w: 10 }, { id: 'vcid', l: 'VCID', w: 3 },
    { id: 'ocff', l: 'O', w: 1.4 }, { id: 'mcfc', l: 'MC COUNT', w: 8 }, { id: 'vcfc', l: 'VC COUNT', w: 8 },
    { id: 'dfs', l: 'DATA FIELD STATUS', w: 16 } ] },
  dfs: { title: 'WITHIN DATA FIELD STATUS (16 BITS)', cells: [
    { id: 'shf', l: 'SHF', w: 1.6 }, { id: 'sync', l: 'SF', w: 1.6 }, { id: 'pof', l: 'POF', w: 1.6 },
    { id: 'slid', l: 'SLID', w: 2.4 }, { id: 'fhp', l: 'FIRST HEADER POINTER', w: 11 } ] },
  sh: { title: 'WITHIN SECONDARY HEADER (UP TO 64 OCTETS)', cells: [
    { id: 'shvn', l: 'VN', w: 2 }, { id: 'shlen', l: 'SH LENGTH', w: 6 }, { id: 'shdf', l: 'SH DATA FIELD (1–63 OCTETS)', w: 24 } ] },
};

const TM_CRUMBS = {
  frame: 'TM TRANSFER FRAME',
  ph: 'PRIMARY HEADER',
  mcid: 'MASTER CHANNEL ID',
  dfs: 'DATA FIELD STATUS',
  sh: 'SECONDARY HEADER',
  shid: 'SH IDENTIFICATION FIELD'
};

const TM_BUILD = { name: 'TM TRANSFER FRAME PRIMARY HEADER', tab: 'TM SDLP',
  note: 'CCSDS 132.0-B-3 § 4.1.2 — the TM Transfer Frame Primary Header is 6 octets, mandatory and fixed in length. The Transfer Frame Data Field Status occupies the last 2 octets and is itself made of six sub-fields.',
  fields: [
    { id: 'tfvn', n: 'Transfer Frame Version Number', bits: 2, def: 0, abbr: 'TFVN', kind: 'enum', opts: [{ v: 0, l: '00 · This version' }, { v: 1, l: '01 · Reserved' }, { v: 2, l: '10 · Reserved' }, { v: 3, l: '11 · Reserved' }] },
    { id: 'scid', n: 'Spacecraft Identifier', bits: 10, def: 42, abbr: 'SCID' },
    { id: 'vcid', n: 'Virtual Channel Identifier', bits: 3, def: 1, abbr: 'VCID' },
    { id: 'ocff', n: 'Operational Control Field Flag', bits: 1, def: 0, abbr: 'OCF', kind: 'enum', opts: [{ v: 0, l: '0 · OCF absent' }, { v: 1, l: '1 · OCF present' }] },
    { id: 'mcfc', n: 'Master Channel Frame Count', bits: 8, def: 17, abbr: 'MCFC' },
    { id: 'vcfc', n: 'Virtual Channel Frame Count', bits: 8, def: 5, abbr: 'VCFC' },
    { id: 'shf', n: 'Secondary Header Flag', bits: 1, def: 0, abbr: 'SHF', kind: 'enum', opts: [{ v: 0, l: '0 · Absent' }, { v: 1, l: '1 · Present' }] },
    { id: 'syncf', n: 'Synchronization Flag', bits: 1, def: 0, abbr: 'SYNC', kind: 'enum', opts: [{ v: 0, l: '0 · Octet-synchronized' }, { v: 1, l: '1 · VCA_SDU' }] },
    { id: 'pof', n: 'Packet Order Flag', bits: 1, def: 0, abbr: 'POF', kind: 'enum', opts: [{ v: 0, l: '0 · Forward order' }, { v: 1, l: '1 · Undefined' }] },
    { id: 'slid', n: 'Segment Length Identifier', bits: 2, def: 3, abbr: 'SLID', kind: 'enum', opts: [{ v: 0, l: '00 · Reserved' }, { v: 1, l: '01 · Reserved' }, { v: 2, l: '10 · Reserved' }, { v: 3, l: '11 · No segmentation' }] },
    { id: 'fhp', n: 'First Header Pointer', bits: 11, def: 0, abbr: 'FHP' } ],
  sec: { flag: 'shf', name: 'TRANSFER FRAME SECONDARY HEADER', form: 'DEFINED FORM · CCSDS 132.0-B-3 § 4.1.3',
    note: 'One Identification octet — Version Number and Length — followed by the Secondary Header Data Field. The Data Field content is mission-specific, so it is entered as raw hex. The Length carries a count of one less than the total number of octets in the Secondary Header, so it follows the Data Field length.',
    off: 'The Secondary Header Flag is ‘0’, so no Transfer Frame Secondary Header is transmitted. Set the flag to ‘1’ above to build one.',
    fields: [
      { id: 'shvn', n: 'TFSH Version Number', bits: 2, def: 0, abbr: 'SHVN', kind: 'enum', opts: [{ v: 0, l: '00 · This version' }, { v: 1, l: '01 · Reserved' }, { v: 2, l: '10 · Reserved' }, { v: 3, l: '11 · Reserved' }] },
      { id: 'shlen', n: 'TFSH Length', bits: 6, def: 2, abbr: 'SHLEN', deriveNote: 'total octets − 1',
        derive: (vals) => { const r = vals['shdf__oct']; const o = r === undefined || r === '' ? 2 : Number(r); return Math.min(Math.max(isFinite(o) ? o : 2, 1), 63); } },
      { id: 'shdf', n: 'TFSH Data Field', bits: 0, def: 0, abbr: 'SHDF', kind: 'hex', varOct: true, defOct: 2, minOct: 1, maxOct: 63, defHex: 'A1B2' } ] },
  pay: { name: 'TRANSFER FRAME DATA FIELD', field: 'Data Field', abbr: 'DATA', note: 'Optional. The Data Field carries the payload — Packets, a VCA_SDU or a Bitstream. Give its length in octets and its content as raw hex; leave the length at 0 to build the header only.' } };

// Frame Decoder spec — see DECODE_SPECS in component.js for the decode() contract.
const TM_DECODE = { name: 'TM TRANSFER FRAME', tab: 'TM SDLP',
  note: 'CCSDS 132.0-B-3 § 4.1 — a TM Transfer Frame is a 6-octet Primary Header, an optional Secondary Header of up to 64 octets, the Data Field, and an optional Trailer (OCF, FECF). With SDLS (§ 6.3, CCSDS 355.0-B-2) a Security Header and optional Security Trailer surround the Data Field. The Trailer is located from the end of the frame, which is why the Frame Length matters.',
  setNote: 'The frame does not signal these itself; they are established by management (tables 5-1 and 6-1). The Secondary Header and the OCF need no setting: header flags signal their presence, and the Secondary Header carries its own length. SDLS adds its fields inside this frame, with lengths from the Security Association.',
  settings: [
    { id: 'frameLen', n: 'Transfer Frame Length', ref: 'TABLE 5-1', unit: 'octets', def: 0, min: 0, max: 65535,
      note: 'Fixed for the Physical Channel. 0 = take the number of octets received as the frame length.' },
    { id: 'fecf', n: 'Presence of Frame Error Control', ref: 'TABLE 5-1', def: 1, opts: [{ v: 1, l: 'Present — last 2 octets are the FECF' }, { v: 0, l: 'Absent' }],
      note: 'If present, the CRC is computed and compared with the received value.' },
    ...sdlsSettings({ iv: 12, sn: 0, pl: 0, mac: 16 }) ],   // annex E1 baseline of 355.0
  exampleSet: SDLS_OFF,
  examples: [
    { l: 'Packets · OCF', hex: '02 A3 11 05 18 00 08 64 C0 01 00 0B 3A 5C 01 00 01 02 03 04 05 06 07 08 01 00 00 05 A8 4C' },
    { l: 'Secondary Header · split Packet', hex: '02 A2 12 06 98 04 02 A1 B2 AA BB CC DD 00 05 C0 0A 00 03 11 22 33 44 B3 49' },
    { l: 'Only Idle Data', hex: '02 AE 13 09 1F FE FF FF FF FF 6D B6 D8 61 45 1F 11 F1 97 16 72 3C BE 7E 00 B1 DE 90 B2 62 B9 3B' },
    { l: 'VCA_SDU', hex: '02 A4 14 07 47 FF 48 65 6C 6C 6F 20 54 4D 87 7A' },
    { l: 'Bad FECF', hex: '02 A3 11 05 18 00 08 64 C0 01 00 0B 2A 5C 01 00 01 02 03 04 05 06 07 08 01 00 00 05 A8 4C' },
    { l: 'FHP past Data Field', hex: '02 A2 15 08 18 C8 08 64 C0 01 00 0B 3A 5C 01 00 01 02 03 04 05 06 07 08 B2 E6' },
    { l: 'SDLS · baseline', set: { secSvc: SDLS_AE, secIv: 12, secSn: 0, secPl: 0, secMac: 16 },
      hex: '02 A3 11 05 18 00 00 01 0A B3 06 82 30 35 66 1B B8 DB A2 1C F8 DC B3 43 08 E5 C6 9F 46 A3 3C AF A6 2B D9 22 47 6B 34 8A 62 9F 5C EE D0 32 C3 E8 70 6E C4 7D 9B FA 01 00 00 05 FB 83' } ],
  decode: decodeTm };

// OID data is a 32-cell LFSR sequence (D0 + D1 + D2 + D22 + D32, § 4.1.4.6.2) that is never restarted, so a frame holds
// an arbitrary window of it: from bit 32 of the window on, every bit must follow from the bits before it.
// All zeros satisfies that too, but the register can never reach that state. Returns the first bad bit offset, or -1.
function oidMismatch(b, from, count) {
  const bit = (i) => (b[from + (i >> 3)] >> (7 - (i & 7))) & 1;
  if (b[from] === 0 && b[from + 1] === 0 && b[from + 2] === 0 && b[from + 3] === 0) return 0;
  for (let i = 32; i < count * 8; i++) if (bit(i) !== (bit(i - 1) ^ bit(i - 2) ^ bit(i - 22) ^ bit(i - 32))) return i;
  return -1;
}

function decodeTm(b, set) {
  const h = decodeHelpers(b);
  const { fields, checks, check, bitField, octField, fecfField } = h;
  const FHP_NONE = 0x7FF, FHP_OID = 0x7FE;

  if (b.length < 6) {
    if (b.length) check('err', 'The Transfer Frame Primary Header is 6 octets — only ' + oct(b.length) + ' received, so nothing can be decoded.', '§ 4.1.2.1');
    return { fields, checks };
  }

  // Layout first: the First Header Pointer's meaning depends on where the Data Field starts.
  const frameLen = set.frameLen || b.length;
  const ocff = readBits(b, 15, 1), shf = readBits(b, 32, 1), sync = readBits(b, 33, 1), fhp = readBits(b, 37, 11);
  const shTotal = shf && b.length > 6 ? readBits(b, 50, 6) + 1 : 0;
  const trailer = (ocff ? 4 : 0) + (set.fecf ? 2 : 0);
  // An OID frame identifies a Virtual Channel that does not use SDLS (§ 6.4.6.2), whatever the settings say for other VCs.
  const oid = !sync && fhp === FHP_OID;
  const sec = sdlsLayout(set, !oid);
  const dfStart = 6 + shTotal + sec.hdr;
  const dfLen = frameLen - trailer - sec.trl - dfStart;
  const dfMeaning = (m) => sec.encrypted ? m + ' — ciphertext' : m;

  const tfvn = bitField('vn', 'Transfer Frame Version Number', 'TFVN', 0, 2, v => v === 0 ? 'TM Version 1 Synchronous Transfer Frame' : 'Not a Transfer Frame defined by this Standard');
  bitField('scid', 'Spacecraft Identifier', 'SCID', 2, 10, () => 'MCID 0x' + readBits(b, 0, 12).toString(16).toUpperCase().padStart(3, '0'));
  bitField('vcid', 'Virtual Channel Identifier', 'VCID', 12, 3, v => 'Virtual Channel ' + v);
  bitField('ocff', 'Operational Control Field Flag', 'OCFF', 15, 1, v => v ? 'OCF present' : 'No OCF');
  bitField('mcfc', 'Master Channel Frame Count', 'MCFC', 16, 8, () => 'Modulo-256 count per Master Channel');
  bitField('vcfc', 'Virtual Channel Frame Count', 'VCFC', 24, 8, () => 'Modulo-256 count per Virtual Channel');
  bitField('shf', 'Transfer Frame Secondary Header Flag', 'SHF', 32, 1, v => v ? 'Secondary Header present' : 'No Secondary Header');
  bitField('sync', 'Synchronization Flag', 'SYNC', 33, 1, v => v ? 'VCA_SDU in the Data Field' : 'Packets or Idle Data in the Data Field');
  const pof = bitField('pof', 'Packet Order Flag', 'POF', 34, 1, () => sync ? 'Undefined with a VCA_SDU' : 'Reserved by CCSDS');
  const slid = bitField('slid', 'Segment Length Identifier', 'SLID', 35, 2, v => sync ? 'Undefined with a VCA_SDU' : v === 3 ? 'Required value' : 'Shall be ‘11’');
  bitField('fhp', 'First Header Pointer', 'FHP', 37, 11, v => sync ? 'Undefined with a VCA_SDU'
    : v === FHP_NONE ? 'No Packet starts in this frame'
    : v === FHP_OID ? 'Only Idle Data frame'
    : v < dfLen ? 'First Packet starts at Data Field octet ' + v + ' (frame octet ' + (dfStart + v) + ')'
    : 'Points past the Data Field');

  if (tfvn !== 0) check('err', 'Transfer Frame Version Number is ‘' + tfvn.toString(2).padStart(2, '0') + '’ — a TM Transfer Frame carries ‘00’.', '§ 4.1.2.2.2.2');
  if (!sync && pof) check('warn', 'Packet Order Flag is ‘1’ — with the Synchronization Flag at ‘0’ it is reserved and set to ‘0’.', '§ 4.1.2.7.4');
  if (!sync && slid !== 3) check('err', 'Segment Length Identifier is ‘' + slid.toString(2).padStart(2, '0') + '’ — it shall be ‘11’ when the Synchronization Flag is ‘0’.', '§ 4.1.2.7.5.2');

  if (!set.frameLen) check('info', 'Transfer Frame Length is not set, so the ' + oct(b.length) + ' received are taken as the whole frame. Set it to detect truncated frames.', 'TABLE 5-1');
  else if (b.length < frameLen) check('err', 'Frame is truncated: ' + oct(b.length) + ' received, but the mission Transfer Frame Length is ' + oct(frameLen) + '.', '§ 4.1.1.2');
  else if (b.length > frameLen) check('warn', oct(b.length - frameLen) + ' after the end of the frame (octet ' + frameLen + ' onward) — not part of this frame. Possibly the next frame.', '§ 4.1.1.2');
  else check('ok', 'Received length matches the mission Transfer Frame Length of ' + oct(frameLen) + '.', '§ 4.1.1.2');

  if (sec.on) sdlsCheckSettings(check, set);

  let pos = 6;
  if (shf) {
    if (b.length > 6) {
      const shvn = bitField('shvn', 'Secondary Header Version Number', 'SHVN', 48, 2, v => v === 0 ? 'Version 1' : 'Shall be ‘00’');
      const shlen = bitField('shlen', 'Secondary Header Length', 'SHLEN', 50, 6, v => 'Total length − 1 = ' + oct(v + 1) + ' in the Secondary Header');
      if (shvn !== 0) check('err', 'Secondary Header Version Number is ‘' + shvn.toString(2).padStart(2, '0') + '’ — it shall be ‘00’.', '§ 4.1.3.2.2.2');
      if (shlen === 0) check('err', 'Secondary Header Length is 0, leaving no Secondary Header Data Field — it is 1 to 63 octets.', '§ 4.1.3.1.3');
      else octField('shdf', 'Secondary Header Data Field', 'SHDF', 7, shlen, 'Mission-defined');
      pos += shTotal;
    } else check('err', 'Secondary Header Flag is ‘1’ but the frame ends after the Primary Header.', '§ 4.1.3.1.1');
  }

  if (dfLen < 1) {
    check('err', 'No room for a Data Field: the frame is ' + oct(frameLen) + ', but the headers and trailers take ' + oct(frameLen - dfLen) + '.', '§ 4.1.4.2');
  } else {
    if (oid && set.secSvc !== SDLS_NONE) check('info', 'Security settings are not applied: an Only Idle Data frame identifies a Virtual Channel that does not use SDLS.', '§ 6.4.6.2');
    if (sec.on) {
      sdlsCoverage(check, set, dfStart, dfStart + dfLen, '355.0 § 5.1');
      sdlsHeaderFields(h, b, pos, set, dfLen);
      pos += sec.hdr;
    }

    if (sync) {
      octField('df', 'Transfer Frame Data Field', 'DATA', pos, dfLen, dfMeaning('One VCA_SDU'));
    } else if (oid) {
      octField('df', 'Transfer Frame Data Field', 'OID', pos, dfLen, 'Only Idle Data — PN sequence');
      const got = Math.min(dfLen, b.length - pos);
      if (got * 8 <= 32) check('info', 'Data Field is too short to check the Only Idle Data sequence.', '§ 4.1.4.6.2');
      else {
        const bad = oidMismatch(b, pos, got);
        if (bad < 0) check('ok', 'Data Field follows the Only Idle Data PN sequence.', '§ 4.1.4.6.2');
        else check('warn', 'Data Field does not follow the Only Idle Data PN sequence (first difference at Data Field bit ' + bad + ').', '§ 4.1.4.6.2');
      }
    } else if (fhp === FHP_NONE) {
      octField('df', 'Transfer Frame Data Field', 'DATA', pos, dfLen, dfMeaning('Middle of a Packet begun in an earlier frame'));
    } else if (fhp >= dfLen) {
      check('err', 'First Header Pointer is ' + fhp + ', past the end of the ' + oct(dfLen) + ' Data Field (valid: 0–' + (dfLen - 1) + ', or the reserved values 2046 and 2047).', '§ 4.1.2.7.6.3');
      octField('df', 'Transfer Frame Data Field', 'DATA', pos, dfLen, dfMeaning('Packet boundaries unknown — First Header Pointer is invalid'));
    } else {
      if (fhp > 0) octField('df', 'Data Field · end of previous Packet', 'RESID', pos, fhp, dfMeaning('Continues a Packet from an earlier frame of this Virtual Channel'));
      octField('df', fhp > 0 ? 'Data Field · from first Packet Header' : 'Transfer Frame Data Field', 'PKTS', pos + fhp, dfLen - fhp, dfMeaning('Packets, contiguous and in forward order'));
    }
    pos += dfLen;

    if (sec.trl) { sdlsTrailerField(h, pos, set); pos += sec.trl; }
    if (ocff) {
      const type = b.length > pos ? b[pos] >> 6 : -1;
      octField('ocf', 'Operational Control Field', 'OCF', pos, 4, type < 0 ? 'Report type unknown' : type < 2 ? 'Type-1 Report — CLCW' : type === 2 ? 'Type-2 Report — project-specific' : 'Type-2 Report — SDLS Frame Security Report');
      pos += 4;
    }
    if (set.fecf) fecfField('fecf', pos, '§ 4.1.6.3');
  }
  if (b.length > frameLen) octField(null, 'Octets after the frame', 'EXTRA', frameLen, b.length - frameLen, 'Not part of this frame', { extra: true });

  return { fields, checks };
}
