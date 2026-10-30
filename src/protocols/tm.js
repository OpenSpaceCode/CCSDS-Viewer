// TM Space Data Link Protocol — CCSDS 132.0-B-3.
// Field reference pages, structure maps, breadcrumb names and the Frame Builder spec.

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
