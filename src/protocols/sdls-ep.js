// SDLS Extended Procedures — CCSDS 355.1-B-1.
// Procedure PDU definitions, sidebar groups, field reference pages, structure maps and breadcrumb names.

const SDLS_EP_GROUPS = [
  { name: 'KEY MANAGEMENT', items: [
    { id: 'otar', fig: '5-3', name: 'OTAR Command' },
    { id: 'keyact', fig: '5-4', name: 'Key Activation Command' },
    { id: 'keydeact', fig: '5-5', name: 'Key Deactivation Command' },
    { id: 'keydestr', fig: '5-6', name: 'Key Destruction Command' },
    { id: 'keyver', fig: '5-7', name: 'Key Verification Command' },
    { id: 'keyverrep', fig: '5-8', name: 'Key Verification Reply' },
    { id: 'keyinv', fig: '5-9', name: 'Key Inventory Command' },
    { id: 'keyinvrep', fig: '5-10', name: 'Key Inventory Reply' } ] },
  { name: 'SECURITY ASSOCIATION MGMT', items: [
    { id: 'startsa', fig: '5-12', name: 'Start SA' },
    { id: 'stopsa', fig: '5-13', name: 'Stop SA' },
    { id: 'rekeysa', fig: '5-14', name: 'Rekey SA' },
    { id: 'expiresa', fig: '5-15', name: 'Expire SA' },
    { id: 'createsa', fig: '5-16', name: 'Create SA' },
    { id: 'deletesa', fig: '5-17', name: 'Delete SA' },
    { id: 'setarsn', fig: '5-18', name: 'Set ARSN' },
    { id: 'setarsnw', fig: '5-19', name: 'Set ARSN Window' },
    { id: 'sastat', fig: '5-20', name: 'SA Status Request' },
    { id: 'sastatrep', fig: '5-21', name: 'SA Status Request Reply' },
    { id: 'readarsn', fig: '5-22', name: 'Read ARSN Command' },
    { id: 'readarsnrep', fig: '5-23', name: 'Read ARSN Reply' } ] },
  { name: 'MONITORING & CONTROL', items: [
    { id: 'ping', fig: '5-24', name: 'Ping Command' },
    { id: 'pingrep', fig: '5-25', name: 'Ping Reply' },
    { id: 'logstat', fig: '5-26', name: 'Log Status Command' },
    { id: 'logstatrep', fig: '5-27', name: 'Log Status Reply' },
    { id: 'dumplog', fig: '5-28', name: 'Dump Log Command' },
    { id: 'dumplogrep', fig: '5-29', name: 'Dump Log Reply' },
    { id: 'eraselog', fig: '5-30', name: 'Erase Log Command' },
    { id: 'eraselogrep', fig: '5-31', name: 'Erase Log Reply' },
    { id: 'selftest', fig: '5-32', name: 'Self-Test Command' },
    { id: 'selftestrep', fig: '5-33', name: 'Self-Test Reply' },
    { id: 'alarmreset', fig: '5-34', name: 'Alarm Flag Reset Command' } ] }
];

const SDLS_EP_PROCEDURES = {
  otar: {
    name: 'OTAR Command', fig: 'Figure 5-3', ref: '§ 5.4.2.1', proc: '‘0001’', service: 'KEY MANAGEMENT',
    intro: 'The OTAR (Over-The-Air-Rekeying) Command realizes the secure — encrypted and authenticated — transmission of new session keys from the Initiator to the Recipient. Its PDU Data Field carries the Master Key ID, an optional Initialization Vector, an Upload Key Block of N (Encrypted Key ID, Encrypted Key) pairs, and a MAC over the authenticated-encrypted block.',
    dataNote: 'MANAGED FIELD LENGTHS · § 5.4.2.1.2',
    iterate: { from: 'ekid', to: 'ekey' },
    cells: ['mkid', 'epiv', 'ekid', 'ekey', 'epmac'] },
  keyact: {
    name: 'Key Activation Command', fig: 'Figure 5-4', ref: '§ 5.4.2.2', proc: '‘0010’', service: 'KEY MANAGEMENT',
    intro: 'The Key Activation Command transitions a set of pre-loaded keys from the Pre-Active State to the Active State at both ends of the link, so they can subsequently be used for cryptographic operations. Its PDU Data Field is simply a Key ID field, repeated one to N times — one entry per key to activate.',
    dataNote: 'MANAGED FIELD LENGTHS · § 5.4.2.2.2',
    iterate: { from: 'epkeyid', to: 'epkeyid' },
    cells: ['epkeyid'] },
  keydeact: {
    name: 'Key Deactivation Command', fig: 'Figure 5-5', ref: '§ 5.4.2.3', proc: '‘0011’', service: 'KEY MANAGEMENT',
    intro: 'The Key Deactivation Command transitions a set of keys from the Active State to the Deactivated State at both ends of the link. A deactivated key can no longer be used for cryptographic operations. Its PDU Data Field is a Key ID field, repeated one to N times — one entry per key to deactivate.',
    dataNote: 'MANAGED FIELD LENGTHS · § 5.4.2.3.2',
    iterate: { from: 'kdkeyid', to: 'kdkeyid' },
    cells: ['kdkeyid'] },
  keydestr: {
    name: 'Key Destruction Command', fig: 'Figure 5-6', ref: '§ 5.4.2.4', proc: '‘0110’', service: 'KEY MANAGEMENT',
    intro: 'The Key Destruction Command transitions a set of keys from the Deactivated State to the Destroyed State at both ends of the link — the terminal, irreversible state of the key lifecycle. Its PDU Data Field is a Key ID field, repeated one to N times — one entry per key to destroy.',
    dataNote: 'MANAGED FIELD LENGTHS · § 5.4.2.4.2',
    iterate: { from: 'kxkeyid', to: 'kxkeyid' },
    cells: ['kxkeyid'] },
  keyver: {
    name: 'Key Verification Command', fig: 'Figure 5-7', ref: '§ 5.4.2.5', proc: '‘0100’', service: 'KEY MANAGEMENT', pt: '0',
    intro: 'The Key Verification Command lets the Initiator confirm that a set of active keys at the Recipient are not corrupted or modified and are fully operational. Its PDU Data Field carries (Key ID, Challenge) pairs, repeated one to N times — one pair per key to be verified.',
    dataNote: 'MANAGED FIELD LENGTHS · § 5.4.2.5.2',
    iterate: { from: 'kvkeyid', to: 'kvchal' },
    cells: ['kvkeyid', 'kvchal'] },
  keyverrep: {
    name: 'Key Verification Reply', fig: 'Figure 5-8', ref: '§ 5.4.2.5', proc: '‘0100’', service: 'KEY MANAGEMENT', pt: '1',
    intro: 'The Key Verification Reply returns the Recipient’s response to a Key Verification Command. For each verified key it carries, in encrypted and authenticated form, the response to the challenge. Its PDU Data Field carries (Key ID, IV, Encrypted Challenge, Challenge MAC) quadruples, repeated one to N times.',
    dataNote: 'MANAGED FIELD LENGTHS · § 5.4.2.5.3',
    iterate: { from: 'krkeyid', to: 'krmac' },
    cells: ['krkeyid', 'kriv', 'krechal', 'krmac'] },
  keyinv: {
    name: 'Key Inventory Command', fig: 'Figure 5-9', ref: '§ 5.4.2.6', proc: '‘0111’', service: 'KEY MANAGEMENT', pt: '0',
    intro: 'The Key Inventory Command requests the status of a contiguous range of keys held in the Recipient key data base. Its PDU Data Field carries just two fields — the First and Last Key ID of the range to be scanned.',
    dataNote: 'MANAGED FIELD LENGTHS · § 5.4.2.6.2',
    cells: ['kifirst', 'kilast'] },
  keyinvrep: {
    name: 'Key Inventory Reply', fig: 'Figure 5-10', ref: '§ 5.4.2.6', proc: '‘0111’', service: 'KEY MANAGEMENT', pt: '1',
    intro: 'The Key Inventory Reply returns the inventory for the range requested by a Key Inventory Command. It opens with the total number of Key IDs returned, followed by that many (Key ID, Key State) pairs — one per key found in the range.',
    dataNote: 'MANAGED FIELD LENGTHS · § 5.4.2.6.3',
    iterate: { from: 'kikeyid', to: 'kistate' },
    cells: ['kitotal', 'kikeyid', 'kistate'] },
  startsa: {
    name: 'Start SA', fig: 'Figure 5-12', ref: '§ 5.5.1.2', proc: '‘1011’', service: 'SA MANAGEMENT', pt: '0',
    intro: 'The Start SA directive begins using a particular Security Association on a channel. Its PDU Data Field carries the 16-bit SPI of the applicable SA, followed by one to N GVC ID/GMAP ID fields naming the Global Virtual Channel(s)/Global MAP(s) the SA is to be used with.',
    dataNote: 'SPI 16 BITS · GVCID/GMAPID MANAGED · § 5.5.1.2.2',
    iterate: { from: 'sagvcid', to: 'sagvcid' },
    cells: ['saspi', 'sagvcid'] },
  stopsa: {
    name: 'Stop SA', fig: 'Figure 5-13', ref: '§ 5.5.1.3', proc: '‘1110’', service: 'SA MANAGEMENT', pt: '0',
    intro: 'The Stop SA directive stops using a particular Security Association on a channel. Its PDU Data Field consists of a single field — the 16-bit SPI of the applicable SA, which must be in the ‘Operational’ state.',
    dataNote: 'SPI 16 BITS · § 5.5.1.3.2',
    cells: ['ssaspi'] },
  rekeysa: {
    name: 'Rekey SA', fig: 'Figure 5-14', ref: '§ 5.5.1.4', proc: '‘0110’', service: 'SA MANAGEMENT', pt: '0',
    intro: 'The Rekey SA directive changes the keys and ARSN of a particular Security Association. Its PDU Data Field carries the 16-bit SPI, then — optionally — a new encryption key ID and a new authentication key ID, followed by a mandatory new ARSN and, if needed, a new IV for the encryption key.',
    dataNote: 'SPI 16 BITS · OTHERS MANAGED · § 5.5.1.4.2',
    cells: ['rkspi', 'rkenckey', 'rkauthkey', 'rkarsn', 'rkiv'] },
  expiresa: {
    name: 'Expire SA', fig: 'Figure 5-15', ref: '§ 5.5.1.5', proc: '‘1001’', service: 'SA MANAGEMENT', pt: '0',
    intro: 'The Expire SA directive expires the key of a particular Security Association. Its PDU Data Field consists of a single mandatory field — the 16-bit SPI of the applicable SA whose key is to be expired.',
    dataNote: 'SPI 16 BITS · § 5.5.1.5.2',
    cells: ['exspi'] },
  createsa: {
    name: 'Create SA', fig: 'Figure 5-16', ref: '§ 5.5.1.6', proc: '‘0001’', service: 'SA MANAGEMENT', pt: '0',
    intro: 'The Create SA directive creates a new Security Association and fully specifies its cryptographic configuration. Its PDU Data Field carries a managed number of contiguous fields: the SPI, service-type flags, the security header/trailer field lengths, and the cipher suite, IV, authentication bit mask and ARSN descriptors — each length field followed by its optional managed-length value.',
    dataNote: 'MANAGED FIELD LENGTHS · § 5.5.1.6.2',
    cells: ['csspi', 'csenc', 'csauth', 'csivlen', 'cssnlen', 'cspllen', 'csmaclen', 'csenclen', 'csencid', 'csivvlen', 'csivval', 'csauthlen', 'csauthid', 'csbmlen', 'csbmval', 'csarsnlen', 'csarsnval', 'cswinlen', 'cswinval'] },
  deletesa: {
    name: 'Delete SA', fig: 'Figure 5-17', ref: '§ 5.5.1.7', proc: '‘0100’', service: 'SA MANAGEMENT', pt: '0',
    intro: 'The Delete SA directive removes a Security Association entirely, returning it to the null (‘No SA’) state and erasing all its managed parameters. The SA must be in the ‘Unkeyed’ state. Its PDU Data Field consists of a single mandatory field — the 16-bit SPI of the SA to be deleted.',
    dataNote: 'SPI 16 BITS · § 5.5.1.7.2',
    cells: ['dsspi'] },
  setarsn: {
    name: 'Set ARSN', fig: 'Figure 5-18', ref: '§ 5.5.1.8', proc: '‘1010’', service: 'SA MANAGEMENT', pt: '0',
    intro: 'The Set Anti-Replay Sequence Number directive sets a new ARSN value for a particular Security Association. Its PDU Data Field carries the 16-bit SPI of the applicable SA, followed by the new ARSN value of managed length.',
    dataNote: 'SPI 16 BITS · ARSN MANAGED · § 5.5.1.8.2',
    cells: ['saraspi', 'sarval'] },
  setarsnw: {
    name: 'Set ARSN Window', fig: 'Figure 5-19', ref: '§ 5.5.1.9', proc: '‘0101’', service: 'SA MANAGEMENT', pt: '0',
    intro: 'The Set Anti-Replay Sequence Number Window directive sets a new ARSN window — the tolerance within which out-of-order sequence numbers are accepted — for a particular Security Association. Its PDU Data Field carries the 16-bit SPI of the applicable SA, followed by the new ARSN window value of managed length.',
    dataNote: 'SPI 16 BITS · WINDOW MANAGED · § 5.5.1.9.2',
    cells: ['sarwspi', 'sarwval'] },
  sastat: {
    name: 'SA Status Request', fig: 'Figure 5-20', ref: '§ 5.5.1.10', proc: '‘1111’', service: 'SA MANAGEMENT', pt: '0',
    intro: 'The SA Status Request directive queries the current status of a particular Security Association. Its PDU Data Field consists of a single mandatory field — the 16-bit SPI of the SA to be queried. The Recipient answers with an SA Status Request Reply.',
    dataNote: 'SPI 16 BITS · § 5.5.1.10.2',
    cells: ['ssqspi'] },
  sastatrep: {
    name: 'SA Status Request Reply', fig: 'Figure 5-21', ref: '§ 5.5.1.10', proc: '‘1111’', service: 'SA MANAGEMENT', pt: '1',
    intro: 'The SA Status Request Reply returns the Recipient’s response to an SA Status Request. Its PDU Data Field carries two contiguous mandatory fields — the 16-bit SPI of the queried SA, and the 8-bit Procedure Identification of the last executed state-transition directive for that SA.',
    dataNote: 'SPI 16 BITS · DIRECTIVE 8 BITS · § 5.5.1.10.3',
    cells: ['ssrspi', 'ssrdir'] },
  readarsn: {
    name: 'Read ARSN Command', fig: 'Figure 5-22', ref: '§ 5.5.1.11', proc: '‘0000’', service: 'SA MANAGEMENT', pt: '0',
    intro: 'The Read Anti-Replay Sequence Number Command reads the current ARSN value associated with a given Security Association. Its PDU Data Field consists of a single mandatory field — the 16-bit SPI of the SA whose ARSN is to be read. The Recipient answers with a Read ARSN Reply.',
    dataNote: 'SPI 16 BITS · § 5.5.1.11.2',
    cells: ['rdspi'] },
  readarsnrep: {
    name: 'Read ARSN Reply', fig: 'Figure 5-23', ref: '§ 5.5.1.11', proc: '‘0000’', service: 'SA MANAGEMENT', pt: '1',
    intro: 'The Read Anti-Replay Sequence Number Reply returns the Recipient’s response to a Read ARSN Command. Its PDU Data Field consists of a single mandatory field — the current ARSN value of the queried SA, of managed length, carried in full without truncation.',
    dataNote: 'ARSN VALUE MANAGED · § 5.5.1.11.3',
    cells: ['rdarsnval'] },
  ping: {
    name: 'Ping Command', fig: 'Figure 5-24', ref: '§ 5.6.1.1', proc: '‘0001’', service: 'SECURITY MONITORING & CONTROL', pt: '0',
    intro: 'The Ping Command verifies that the SDLS Security Function on the Recipient is present and responsive. It belongs to the Security Monitoring & Control service group and has no PDU Data Field — the PDU Header alone carries the directive. The Recipient answers with a Ping Reply.',
    dataNote: 'NO DATA FIELD · § 5.6.1.1.2',
    cells: [] },
  pingrep: {
    name: 'Ping Reply', fig: 'Figure 5-25', ref: '§ 5.6.1.1', proc: '‘0001’', service: 'SECURITY MONITORING & CONTROL', pt: '1',
    intro: 'The Ping Reply is the Recipient’s response to a Ping Command; its receipt confirms the SDLS Security Function is present and responsive. Like the command, it has no PDU Data Field — the PDU Header alone carries the reply.',
    dataNote: 'NO DATA FIELD · § 5.6.1.1.3',
    cells: [] },
  logstat: {
    name: 'Log Status Command', fig: 'Figure 5-26', ref: '§ 5.6.1.2', proc: '‘0010’', service: 'SECURITY MONITORING & CONTROL', pt: '0',
    intro: 'The Log Status Command requests a summary of the on-board Security Log. It belongs to the Security Monitoring & Control service group and has no PDU Data Field — the PDU Header alone carries the directive. The Recipient answers with a Log Status Reply.',
    dataNote: 'NO DATA FIELD · § 5.6.1.2.2',
    cells: [] },
  logstatrep: {
    name: 'Log Status Reply', fig: 'Figure 5-27', ref: '§ 5.6.1.2', proc: '‘0010’', service: 'SECURITY MONITORING & CONTROL', pt: '1',
    intro: 'The Log Status Reply returns the Recipient’s summary of the Security Log. Its PDU Data Field carries two contiguous mandatory fields of managed length — the number of events currently held in the Security Log and the remaining space still available in it.',
    dataNote: 'MANAGED FIELD LENGTHS · § 5.6.1.2.3',
    cells: ['lsevents', 'lsspace'] },
  dumplog: {
    name: 'Dump Log Command', fig: 'Figure 5-28', ref: '§ 5.6.1.3', proc: '‘0011’', service: 'SECURITY MONITORING & CONTROL', pt: '0',
    intro: 'The Dump Log Command requests that the Recipient send the entire content of the on-board Security Log to the ground. It does not erase the log. It belongs to the Security Monitoring & Control service group and has no PDU Data Field — the PDU Header alone carries the directive. The Recipient answers with a Dump Log Reply.',
    dataNote: 'NO DATA FIELD · § 5.6.1.3.2',
    cells: [] },
  dumplogrep: {
    name: 'Dump Log Reply', fig: 'Figure 5-29', ref: '§ 5.6.1.3', proc: '‘0011’', service: 'SECURITY MONITORING & CONTROL', pt: '1',
    intro: 'The Dump Log Reply returns the full content of the on-board Security Log. Its PDU Data Field is a variable number of contiguous Security Event Messages in TLV (Tag–Length–Value) format — an Event Message Tag, an Event Message Length, then the variable-length Event Message itself — repeated one to N times, one triple per logged event. The Tag and Length field sizes are Managed Parameters.',
    dataNote: 'TLV · MANAGED T/L LENGTHS · § 5.6.1.3.3',
    iterate: { from: 'dltag', to: 'dlval' },
    cells: ['dltag', 'dllen', 'dlval'] },
  eraselog: {
    name: 'Erase Log Command', fig: 'Figure 5-30', ref: '§ 5.6.1.4', proc: '‘0100’', service: 'SECURITY MONITORING & CONTROL', pt: '0',
    intro: 'The Erase Log Command requests that the Recipient erase the entire content of the on-board Security Log. It belongs to the Security Monitoring & Control service group and has no PDU Data Field — the PDU Header alone carries the directive. The Recipient answers with an Erase Log Reply giving the log status after erasure.',
    dataNote: 'NO DATA FIELD · § 5.6.1.4.2',
    cells: [] },
  eraselogrep: {
    name: 'Erase Log Reply', fig: 'Figure 5-31', ref: '§ 5.6.1.4', proc: '‘0100’', service: 'SECURITY MONITORING & CONTROL', pt: '1',
    intro: 'The Erase Log Reply returns the status of the Security Log after erasure. Its PDU Data Field carries two contiguous mandatory fields of managed length — the number of events still in the log after erasure, and the remaining space now available.',
    dataNote: 'MANAGED FIELD LENGTHS · § 5.6.1.4.3',
    cells: ['elevents', 'elspace'] },
  selftest: {
    name: 'Self-Test Command', fig: 'Figure 5-32', ref: '§ 5.6.1.5', proc: '‘0101’', service: 'SECURITY MONITORING & CONTROL', pt: '0',
    intro: 'The Self-Test Command requests that the Recipient run a self-test of its SDLS Security Function. It belongs to the Security Monitoring & Control service group and has no PDU Data Field — the PDU Header alone carries the directive. The Recipient answers with a Self-Test Reply carrying the result.',
    dataNote: 'NO DATA FIELD · § 5.6.1.5.2',
    cells: [] },
  selftestrep: {
    name: 'Self-Test Reply', fig: 'Figure 5-33', ref: '§ 5.6.1.5', proc: '‘0101’', service: 'SECURITY MONITORING & CONTROL', pt: '1',
    intro: 'The Self-Test Reply returns the outcome of the Recipient’s self-test. Its PDU Data Field is a single mandatory 8-bit Self-Test Result field: the most significant bit signals the outcome — 0 = Self-Test OK, 1 = Self-Test not OK — while the remaining seven bits are left to the implementer.',
    dataNote: 'RESULT 8 BITS · § 5.6.1.5.3',
    cells: ['stresult'] },
  alarmreset: {
    name: 'Alarm Flag Reset Command', fig: 'Figure 5-34', ref: '§ 5.6.1.6', proc: '‘0111’', service: 'SECURITY MONITORING & CONTROL', pt: '0',
    intro: 'The Alarm Flag Reset Command requests that the Recipient clear the security alarm flag raised by its SDLS Security Function. The Alarm Flag Reset Procedure supports a single PDU data field structure — the command only — and it has no PDU Data Field, so the PDU Header alone carries the directive.',
    dataNote: 'NO DATA FIELD · § 5.6.1.6.2',
    cells: [] }
};

const SDLS_EP_FIELD_IDS = ['ephdr', 'eptag', 'eptype', 'epuser', 'epsg', 'eppi', 'eplen', 'epdata_otar', 'epdata_keyact', 'epdata_keydeact', 'epdata_keydestr', 'mkid', 'epiv', 'ekid', 'ekey', 'epmac', 'epkeyid', 'kdkeyid', 'kxkeyid', 'epdata_keyver', 'kvkeyid', 'kvchal', 'epdata_keyverrep', 'krkeyid', 'kriv', 'krechal', 'krmac', 'epdata_keyinv', 'kifirst', 'kilast', 'epdata_keyinvrep', 'kitotal', 'kikeyid', 'kistate', 'epdata_startsa', 'saspi', 'sagvcid', 'epdata_stopsa', 'ssaspi', 'epdata_rekeysa', 'rkspi', 'rkenckey', 'rkauthkey', 'rkarsn', 'rkiv', 'epdata_expiresa', 'exspi', 'epdata_createsa', 'csspi', 'csenc', 'csauth', 'csivlen', 'cssnlen', 'cspllen', 'csmaclen', 'csenclen', 'csencid', 'csivvlen', 'csivval', 'csauthlen', 'csauthid', 'csbmlen', 'csbmval', 'csarsnlen', 'csarsnval', 'cswinlen', 'cswinval', 'epdata_deletesa', 'dsspi', 'epdata_setarsn', 'saraspi', 'sarval', 'epdata_setarsnw', 'sarwspi', 'sarwval', 'epdata_sastat', 'ssqspi', 'epdata_sastatrep', 'ssrspi', 'ssrdir', 'epdata_readarsn', 'rdspi', 'epdata_readarsnrep', 'rdarsnval', 'epdata_ping', 'epdata_pingrep', 'epdata_logstat', 'epdata_logstatrep', 'lsevents', 'lsspace', 'epdata_dumplog', 'epdata_dumplogrep', 'dltag', 'dllen', 'dlval', 'epdata_eraselog', 'epdata_eraselogrep', 'elevents', 'elspace', 'epdata_selftest', 'epdata_selftestrep', 'stresult', 'epdata_alarmreset'];

// One-page cheat sheet. The procedures table comes from SDLS_EP_PROCEDURES.
const SDLS_EP_SHEET = { doc: 'ep', title: 'SDLS EXTENDED PROCEDURES', procedures: true,
  headerTitle: 'PDU HEADER · 3 OCTETS',
  rows: [[['PT', 1, 'eptype'], ['UF', 1, 'epuser'], ['SG', 2, 'epsg'], ['PI', 4, 'eppi'], ['DATA FIELD LENGTH', 16, 'eplen']]],
  fields: [
    ['eptype', 'PT', '0 = command, 1 = reply.'], ['epuser', 'UF', '0 = CCSDS defined procedure, 1 = user defined.'], ['epsg', 'SG', 'Service Group, which also scopes the Procedure Identification.'], ['eppi', 'PI', 'Procedure Identification: see the table below, within its Service Group.'], ['eplen', 'LEN', 'Length of the PDU Data Field, in bits. Octet-aligned.'] ],
  specials: [['SG ‘00’', 'Key Management.', '§ 5.3.2.2.2.3.2'], ['SG ‘01’', 'SA Management, SAs handling Initiator → Recipient traffic.', '§ 5.3.2.2.2.3.3'], ['SG ‘10’', 'SA Management, SAs handling Recipient → Initiator traffic.', '§ 5.3.2.2.2.3.4'], ['SG ‘11’', 'Security Monitoring & Control.', '§ 5.3.2.2.2.3.5'] ],
  rules: [['The Data Field Length counts bits, not octets, and is octet-aligned.', '§ 5.3.2.3.2'], ['A length of zero means there is no Data Field.', '§ 5.3.2.4.3']] };

const SDLS_EP_FIELDS = {
  ephdr: { n: 'Extended Procedures PDU Header', parent: 'epframe', bits: 'BITS 0–23', len: '3 OCTETS · 24 BITS', pres: 'MANDATORY', ref: '§ 5.3.2.2',
    desc: 'The mandatory 24-bit header of every Extended Procedures PDU. It carries the Extended Procedures Tag — which identifies the procedure — followed by the Data Field Length.',
    q: [
      { t: 'The Extended Procedures PDU Header shall consist of two mandatory fields, positioned contiguously, in the following sequence: a) Extended Procedures Tag (8 bits, mandatory); b) Extended Procedures Data Field Length (16 bits, mandatory).', ref: '§ 5.3.2.2.1.1' } ],
    sp: [], nt: ['The format of the Extended Procedures PDU is shown in figure 5-2 of the Standard.'],
    map: 'ephdr', hi: ['eptag', 'eplen'], kids: ['eptag', 'eplen'] },

  eptag: { n: 'Extended Procedures Tag', parent: 'ephdr', bits: 'BITS 0–7', len: '8 BITS', pres: 'MANDATORY', ref: '§ 5.3.2.2.1.2',
    desc: 'The 8-bit tag that uniquely identifies the procedure. Four sub-fields: Procedure Type, User Flag, Service Group and the Procedure Identification.',
    q: [
      { t: 'The Extended Procedures Tag shall consist of four mandatory fields, positioned contiguously, in the following sequence: a) Procedure Type (1 bit, mandatory); b) User Flag (1 bit, mandatory); c) Service Group Field (2 bits, mandatory); d) Procedure Identification Field (4 bits, mandatory).', ref: '§ 5.3.2.2.1.2' } ],
    sp: [], nt: [],
    map: 'eptag', hi: ['eptype', 'epuser', 'epsg', 'eppi'], kids: ['eptype', 'epuser', 'epsg', 'eppi'] },

  eptype: { n: 'Procedure Type Flag', parent: 'eptag', bits: 'BIT 0', len: '1 BIT', pres: 'MANDATORY', ref: '§ 5.3.2.2.2',
    desc: 'Identifies whether the PDU is a command (Initiator → Recipient) or a reply (Recipient → Initiator).',
    q: [
      { t: 'The Procedure Type Flag shall identify if the Extended Procedures PDU is associated with a command from the Initiator to the Recipient, or a reply from the Recipient.', ref: '§ 5.3.2.2.2.1.1' } ],
    sp: [
      { c: '‘0’', d: 'Command', ref: '§ 5.3.2.2.2.1.2' },
      { c: '‘1’', d: 'Reply', ref: '§ 5.3.2.2.2.1.3' } ],
    nt: [], map: 'eptag', hi: ['eptype'], kids: [] },

  epuser: { n: 'User Flag', parent: 'eptag', bits: 'BIT 1', len: '1 BIT', pres: 'MANDATORY', ref: '§ 5.3.2.2.2.2',
    desc: 'Identifies whether the PDU carries a CCSDS-defined procedure or a user-defined (proprietary) procedure.',
    q: [
      { t: 'The User Flag shall identify if the Extended Procedures PDU is carrying a CCSDS defined procedure or a user defined procedure.', ref: '§ 5.3.2.2.2.2.1' } ],
    sp: [
      { c: '‘0’', d: 'CCSDS defined procedure', ref: '§ 5.3.2.2.2.2.2' },
      { c: '‘1’', d: 'User defined procedure', ref: '§ 5.3.2.2.2.2.3' } ],
    nt: ['Thanks to the TLV format, proprietary (user-defined) messages are simply skipped by a Recipient that does not recognize them.'],
    map: 'eptag', hi: ['epuser'], kids: [] },

  epsg: { n: 'Service Group Field', parent: 'eptag', bits: 'BITS 2–3', len: '2 BITS', pres: 'MANDATORY', ref: '§ 5.3.2.2.2.3',
    desc: 'Identifies the Extended Procedures Service the PDU belongs to — and, for SA Management, the direction of the SAs targeted.',
    q: [
      { t: 'The Service Group shall identify the Extended Procedures Service that the Extended Procedures PDU is associated with.', ref: '§ 5.3.2.2.2.3.1' } ],
    sp: [
      { c: '‘00’', d: 'Key Management procedure', ref: '§ 5.3.2.2.2.3.2' },
      { c: '‘01’', d: 'SA Management — SAs handling Initiator → Recipient traffic', ref: '§ 5.3.2.2.2.3.3' },
      { c: '‘10’', d: 'SA Management — SAs handling Recipient → Initiator traffic', ref: '§ 5.3.2.2.2.3.4' },
      { c: '‘11’', d: 'Security Monitoring & Control procedure', ref: '§ 5.3.2.2.2.3.5' } ],
    nt: [], map: 'eptag', hi: ['epsg'], kids: [] },

  eppi: { n: 'Procedure Identification Field', parent: 'eptag', bits: 'BITS 4–7', len: '4 BITS', pres: 'MANDATORY', ref: '§ 5.3.2.2.2.4',
    desc: 'Identifies the specific procedure being communicated. Interpreted together with the Service Group (see table 5-1).',
    q: [
      { t: 'The Procedure Identification Field shall identify the procedure that is being communicated through the Extended Procedures PDU.', ref: '§ 5.3.2.2.2.4.1' } ],
    sp: [
      { c: '‘0001’ · SG ‘00’', d: 'OTAR', ref: 'TABLE 5-1' },
      { c: '‘0010’ · SG ‘00’', d: 'Key Activation', ref: 'TABLE 5-1' },
      { c: '‘0011’ · SG ‘00’', d: 'Key Deactivation', ref: 'TABLE 5-1' },
      { c: '‘0100’ · SG ‘00’', d: 'Key Verification', ref: 'TABLE 5-1' },
      { c: '‘0110’ · SG ‘00’', d: 'Key Destruction', ref: 'TABLE 5-1' },
      { c: '‘0111’ · SG ‘00’', d: 'Key Inventory', ref: 'TABLE 5-1' } ],
    nt: ['The same Procedure Identification value can denote different procedures under different Service Groups — always read it together with the Service Group field.'],
    map: 'eptag', hi: ['eppi'], kids: [] },

  eplen: { n: 'Extended Procedures Data Field Length', parent: 'ephdr', bits: 'BITS 8–23', len: '16 BITS', pres: 'MANDATORY', ref: '§ 5.3.2.3',
    desc: 'Signals the length of the PDU Data Field, in bits, octet-aligned. When zero, the Data Field is not present.',
    q: [
      { t: 'The Extended Procedures Data Field Length shall signal the length of the Extended Procedures PDU Data Field in bits.', ref: '§ 5.3.2.3.1' },
      { t: 'The Extended Procedures Data Field Length value shall be octet-aligned.', ref: '§ 5.3.2.3.2' },
      { t: 'If the Extended Procedures PDU Data Field Length is zero, the Extended Procedures PDU Data Field shall not be present.', ref: '§ 5.3.2.4.3' } ],
    sp: [], nt: [], map: 'ephdr', hi: ['eplen'], kids: [] },

  epdata_otar: { n: 'OTAR PDU Data Field', parent: 'epframe', bits: null, len: 'MANAGED', pres: 'MANDATORY', ref: '§ 5.4.2.1.2',
    desc: 'The Data Field of an OTAR Command: the Master Key ID, an optional Initialization Vector, an Upload Key Block of N (Encrypted Key ID, Encrypted Key) pairs, and a MAC over the authenticated-encrypted block. All field sizes are Managed Parameters.',
    q: [
      { t: 'The OTAR command PDU shall consist of a managed number of contiguously positioned mandatory fields: a) Key ID of the master key used for encryption of session keys; b) Initialization Vector for the authenticated encryption of the Upload Key Block (optional); c) Upload Key Block consisting of N (Encrypted Key ID Field, Encrypted Upload Key Field) field pairs (managed length, mandatory); d) MAC field for the authenticated encryption of the Upload Key Block.', ref: '§ 5.4.2.1.2.2' } ],
    sp: [], nt: ['The PDU data field of the OTAR Command PDU may be repeated one to N times, N being a managed parameter.', 'The sizes of the fields of the OTAR Command PDU data field are managed parameters.'],
    map: 'epdata_otar', hi: ['mkid', 'epiv', 'ekid', 'ekey', 'epmac'], kids: ['mkid', 'epiv', 'ekid', 'ekey', 'epmac'] },

  mkid: { n: 'Master Key ID', parent: 'epdata_otar', bits: null, len: 'MANAGED', pres: 'MANDATORY', ref: '§ 5.4.2.1.2.3',
    desc: 'Signals the Key ID of the master key used for the encrypted authentication of the Upload Key Block.',
    q: [ { t: 'The Master Key ID field shall signal the Key ID of the master key used for encrypted authentication of the Upload Key Block.', ref: '§ 5.4.2.1.2.3' } ],
    sp: [], nt: [], map: 'epdata_otar', hi: ['mkid'], kids: [] },

  epiv: { n: 'Initialization Vector', parent: 'epdata_otar', bits: null, len: 'MANAGED', pres: 'OPTIONAL', ref: '§ 5.4.2.1.2.4',
    desc: 'Signals, if applicable, the Initialization Vector required by the cryptographic algorithm used for the authenticated encryption of the Upload Key Block.',
    q: [ { t: 'The Initialization Vector fields shall signal, if applicable, the Initialization Vector required by the cryptographic algorithm used for authenticated encryption of the Upload Key Block.', ref: '§ 5.4.2.1.2.4' } ],
    sp: [], nt: [], map: 'epdata_otar', hi: ['epiv'], kids: [] },

  ekid: { n: 'Encrypted Key ID', parent: 'epdata_otar', bits: null, len: 'MANAGED', pres: 'MANDATORY · ITERATED', ref: '§ 5.4.2.1.2.5',
    desc: 'Signals, in encrypted format, the identifiers of the session keys to be uploaded. Paired with an Encrypted Key and repeated N times within the Upload Key Block.',
    q: [ { t: 'The Encrypted Key ID field shall signal, in encrypted format, the identifiers of the session keys to be uploaded.', ref: '§ 5.4.2.1.2.5' } ],
    sp: [], nt: ['The (Encrypted Key ID, Encrypted Key) pair repeats one to N times — one per uploaded session key.'],
    map: 'epdata_otar', hi: ['ekid'], kids: [] },

  ekey: { n: 'Encrypted Key', parent: 'epdata_otar', bits: null, len: 'MANAGED', pres: 'MANDATORY · ITERATED', ref: '§ 5.4.2.1.2.6',
    desc: 'Signals, in encrypted format, the cryptographic keys to be uploaded to the Recipient. Paired with an Encrypted Key ID and repeated N times.',
    q: [ { t: 'The Encrypted Upload Key field shall signal, in encrypted format, the cryptographic keys to be uploaded to the Recipient.', ref: '§ 5.4.2.1.2.6' } ],
    sp: [], nt: [], map: 'epdata_otar', hi: ['ekey'], kids: [] },

  epmac: { n: 'Message Authentication Code', parent: 'epdata_otar', bits: null, len: 'MANAGED', pres: 'MANDATORY', ref: '§ 5.4.2.1.2.7',
    desc: 'Signals the Message Authentication Code computed by the cryptographic algorithm used for the authenticated encryption of the Upload Key Block.',
    q: [ { t: 'The MAC field shall signal the Message Authentication Code computed by the cryptographic algorithm used for authenticated encryption of the Upload Key Block.', ref: '§ 5.4.2.1.2.7' } ],
    sp: [], nt: [], map: 'epdata_otar', hi: ['epmac'], kids: [] },

  epdata_keyact: { n: 'Key Activation PDU Data Field', parent: 'epframe', bits: null, len: 'MANAGED', pres: 'MANDATORY', ref: '§ 5.4.2.2.2',
    desc: 'The Data Field of a Key Activation Command: a single Key ID field, repeated one to N times — one entry per key to be activated on the Recipient. All field sizes are Managed Parameters.',
    q: [
      { t: 'The Key Activation Command PDU shall consist of a managed number of contiguously positioned mandatory fields: Key ID field (managed length, mandatory).', ref: '§ 5.4.2.2.2.2' } ],
    sp: [], nt: ['The PDU data field of the Key Activation Command PDU may be repeated one to N times, N being a managed parameter.', 'The sizes of the fields of the Key Activation Command PDU data field are managed parameters.'],
    map: 'epdata_keyact', hi: ['epkeyid'], kids: ['epkeyid'] },

  epkeyid: { n: 'Key ID', parent: 'epdata_keyact', bits: null, len: 'MANAGED', pres: 'MANDATORY · ITERATED', ref: '§ 5.4.2.2.2.3',
    desc: 'Signals the identifiers of the cryptographic keys to be activated on the Recipient. Repeated one to N times — one Key ID per key.',
    q: [ { t: 'The Key ID fields shall signal the identifiers of the cryptographic keys to be activated on the recipient.', ref: '§ 5.4.2.2.2.3' } ],
    sp: [], nt: [], map: 'epdata_keyact', hi: ['epkeyid'], kids: [] },

  epdata_keydeact: { n: 'Key Deactivation PDU Data Field', parent: 'epframe', bits: null, len: 'MANAGED', pres: 'MANDATORY', ref: '§ 5.4.2.3.2',
    desc: 'The Data Field of a Key Deactivation Command: a single Key ID field, repeated one to N times — one entry per key to be deactivated on the Recipient. All field sizes are Managed Parameters.',
    q: [
      { t: 'The Key Deactivation Command PDU shall consist of a managed number of contiguously positioned mandatory fields: Key ID field (managed length, mandatory).', ref: '§ 5.4.2.3.2.2' } ],
    sp: [], nt: ['The PDU data field of the Key Deactivation Command PDU may be repeated one to N times, N being a managed parameter.', 'The sizes of the fields of the Key Deactivation Command PDU data field are managed parameters.'],
    map: 'epdata_keydeact', hi: ['kdkeyid'], kids: ['kdkeyid'] },

  kdkeyid: { n: 'Key ID', parent: 'epdata_keydeact', bits: null, len: 'MANAGED', pres: 'MANDATORY · ITERATED', ref: '§ 5.4.2.3.2.3',
    desc: 'Signals the identifiers of the cryptographic keys to be deactivated on the Recipient. Repeated one to N times — one Key ID per key.',
    q: [ { t: 'The Key ID fields shall signal the identifiers of the cryptographic keys to be deactivated on the recipient.', ref: '§ 5.4.2.3.2.3' } ],
    sp: [], nt: [], map: 'epdata_keydeact', hi: ['kdkeyid'], kids: [] },

  epdata_keydestr: { n: 'Key Destruction PDU Data Field', parent: 'epframe', bits: null, len: 'MANAGED', pres: 'MANDATORY', ref: '§ 5.4.2.4.2',
    desc: 'The Data Field of a Key Destruction Command: a single Key ID field, repeated one to N times — one entry per key to be destroyed on the Recipient. Destruction is the terminal, irreversible state of the key lifecycle. All field sizes are Managed Parameters.',
    q: [
      { t: 'The Key Destruction Command PDU shall consist of a managed number of contiguously positioned mandatory fields: Key ID field (managed length, mandatory).', ref: '§ 5.4.2.4.2.2' } ],
    sp: [], nt: ['The PDU data field of the Key Destruction Command PDU may be repeated one to N times, N being a managed parameter.', 'The sizes of the fields of the Key Destruction Command PDU data field are managed parameters.'],
    map: 'epdata_keydestr', hi: ['kxkeyid'], kids: ['kxkeyid'] },

  kxkeyid: { n: 'Key ID', parent: 'epdata_keydestr', bits: null, len: 'MANAGED', pres: 'MANDATORY · ITERATED', ref: '§ 5.4.2.4.2.3',
    desc: 'Signals the identifiers of the cryptographic keys to be destroyed on the Recipient. Repeated one to N times — one Key ID per key.',
    q: [ { t: 'The Key ID fields shall signal the identifiers of the cryptographic keys to be destroyed on the recipient.', ref: '§ 5.4.2.4.2.3' } ],
    sp: [], nt: [], map: 'epdata_keydestr', hi: ['kxkeyid'], kids: [] },

  epdata_keyver: { n: 'Key Verification PDU Data Field', parent: 'epframe', bits: null, len: 'MANAGED', pres: 'MANDATORY', ref: '§ 5.4.2.5.2',
    desc: 'The Data Field of a Key Verification Command: a (Key ID, Challenge) pair, repeated one to N times — one pair per key to be verified at the Recipient. All field sizes are Managed Parameters.',
    q: [
      { t: 'The Key Verification Command PDU shall consist of a managed number of contiguously positioned mandatory fields: (Key ID Field, Challenge Field) pairs fields (managed length, mandatory).', ref: '§ 5.4.2.5.2.2' } ],
    sp: [], nt: ['The PDU data field of the Key Verification Command PDU may be repeated one to N times, N being a managed parameter.', 'The sizes of the fields of the Key Verification Command PDU data field are managed parameters.'],
    map: 'epdata_keyver', hi: ['kvkeyid', 'kvchal'], kids: ['kvkeyid', 'kvchal'] },

  kvkeyid: { n: 'Key ID', parent: 'epdata_keyver', bits: null, len: 'MANAGED', pres: 'MANDATORY · ITERATED', ref: '§ 5.4.2.5.2.3',
    desc: 'Signals the identifiers of the keys to be verified at the Recipient. Paired with a Challenge and repeated one to N times.',
    q: [ { t: 'The Key ID fields shall signal the identifiers of the keys to be verified.', ref: '§ 5.4.2.5.2.3' } ],
    sp: [], nt: [], map: 'epdata_keyver', hi: ['kvkeyid'], kids: [] },

  kvchal: { n: 'Challenge', parent: 'epdata_keyver', bits: null, len: 'MANAGED', pres: 'MANDATORY · ITERATED', ref: '§ 5.4.2.5.2.4',
    desc: 'Signals the challenges to be used for verification of the keys at the Recipient. Paired with a Key ID and repeated one to N times.',
    q: [ { t: 'The Challenge fields shall signal the challenges to be used for verification of keys at the Recipient.', ref: '§ 5.4.2.5.2.4' } ],
    sp: [], nt: [], map: 'epdata_keyver', hi: ['kvchal'], kids: [] },

  epdata_keyverrep: { n: 'Key Verification Reply PDU Data Field', parent: 'epframe', bits: null, len: 'MANAGED', pres: 'MANDATORY', ref: '§ 5.4.2.5.3',
    desc: 'The Data Field of a Key Verification Reply: a (Key ID, IV, Encrypted Challenge, Challenge MAC) quadruple, repeated one to N times — one quadruple per verified key. All field sizes are Managed Parameters.',
    q: [
      { t: 'The Key Verification Reply PDU shall consist of a managed number of contiguously positioned mandatory fields: (Key ID Field, IV Field, Encrypted Challenge Field, Challenge MAC Field) quadruple fields (managed length, mandatory).', ref: '§ 5.4.2.5.3.2' } ],
    sp: [], nt: ['The PDU data field of the Key Verification Reply PDU may be repeated one to N times, N being a managed parameter.', 'The sizes of the fields of the Key Verification Reply PDU data field are managed parameters.'],
    map: 'epdata_keyverrep', hi: ['krkeyid', 'kriv', 'krechal', 'krmac'], kids: ['krkeyid', 'kriv', 'krechal', 'krmac'] },

  krkeyid: { n: 'Key ID', parent: 'epdata_keyverrep', bits: null, len: 'MANAGED', pres: 'MANDATORY · ITERATED', ref: '§ 5.4.2.5.3.3',
    desc: 'Signals the identifiers of the keys that were verified. First field of each quadruple, repeated one to N times.',
    q: [ { t: 'The Key ID fields shall signal the identifiers of the keys to be verified.', ref: '§ 5.4.2.5.3.3' } ],
    sp: [], nt: [], map: 'epdata_keyverrep', hi: ['krkeyid'], kids: [] },

  kriv: { n: 'Initialization Vector', parent: 'epdata_keyverrep', bits: null, len: 'MANAGED', pres: 'MANDATORY · ITERATED', ref: '§ 5.4.2.5.3',
    desc: 'Signals, if applicable, the Initialization Vector required by the cryptographic algorithm used for the authenticated encryption of the challenge response.',
    q: [ { t: 'The IV fields signal the Initialization Vector required by the cryptographic algorithm used for the authenticated encryption of the challenge responses.', ref: '§ 5.4.2.5.3' } ],
    sp: [], nt: [], map: 'epdata_keyverrep', hi: ['kriv'], kids: [] },

  krechal: { n: 'Encrypted Challenge', parent: 'epdata_keyverrep', bits: null, len: 'MANAGED', pres: 'MANDATORY · ITERATED', ref: '§ 5.4.2.5.3.4',
    desc: 'Signals, in encrypted format, the responses to the challenges sent in the Key Verification Command.',
    q: [ { t: 'The Response fields shall signal, in encrypted format, the responses to the challenges.', ref: '§ 5.4.2.5.3.4' } ],
    sp: [], nt: [], map: 'epdata_keyverrep', hi: ['krechal'], kids: [] },

  krmac: { n: 'Challenge MAC', parent: 'epdata_keyverrep', bits: null, len: 'MANAGED', pres: 'MANDATORY · ITERATED', ref: '§ 5.4.2.5.3',
    desc: 'Signals the Message Authentication Code computed by the cryptographic algorithm used for the authenticated encryption of the challenge response.',
    q: [ { t: 'The Challenge MAC fields signal the Message Authentication Code computed by the cryptographic algorithm used for the authenticated encryption of the challenge responses.', ref: '§ 5.4.2.5.3' } ],
    sp: [], nt: [], map: 'epdata_keyverrep', hi: ['krmac'], kids: [] },

  epdata_keyinv: { n: 'Key Inventory PDU Data Field', parent: 'epframe', bits: null, len: 'MANAGED', pres: 'MANDATORY', ref: '§ 5.4.2.6.2',
    desc: 'The Data Field of a Key Inventory Command: two contiguous mandatory fields — the First and Last Key ID of the range to be scanned in the Recipient key data base. Not iterated. All field sizes are Managed Parameters.',
    q: [
      { t: 'The Key Inventory Command PDU shall consist of the contiguously positioned mandatory fields: First Key ID in range; Last Key ID in range.', ref: '§ 5.4.2.6.2.2' } ],
    sp: [], nt: ['The First Key ID and Last Key ID fields signal the range of Key IDs to be scanned in the Recipient Key Data Base to extract available keys and their status.'],
    map: 'epdata_keyinv', hi: ['kifirst', 'kilast'], kids: ['kifirst', 'kilast'] },

  kifirst: { n: 'First Key ID in Range', parent: 'epdata_keyinv', bits: null, len: 'MANAGED', pres: 'MANDATORY', ref: '§ 5.4.2.6.2.3',
    desc: 'Signals the first Key ID of the range to be scanned in the Recipient Key Data Base to extract available keys and their status.',
    q: [ { t: 'The First Key ID and Last Key ID fields shall signal the range of Key IDs to be scanned in the Recipient Key Data Base to extract available keys and their status.', ref: '§ 5.4.2.6.2.3' } ],
    sp: [], nt: [], map: 'epdata_keyinv', hi: ['kifirst'], kids: [] },

  kilast: { n: 'Last Key ID in Range', parent: 'epdata_keyinv', bits: null, len: 'MANAGED', pres: 'MANDATORY', ref: '§ 5.4.2.6.2.3',
    desc: 'Signals the last Key ID of the range to be scanned in the Recipient Key Data Base to extract available keys and their status.',
    q: [ { t: 'The First Key ID and Last Key ID fields shall signal the range of Key IDs to be scanned in the Recipient Key Data Base to extract available keys and their status.', ref: '§ 5.4.2.6.2.3' } ],
    sp: [], nt: [], map: 'epdata_keyinv', hi: ['kilast'], kids: [] },

  epdata_keyinvrep: { n: 'Key Inventory Reply PDU Data Field', parent: 'epframe', bits: null, len: 'MANAGED', pres: 'MANDATORY', ref: '§ 5.4.2.6.3',
    desc: 'The Data Field of a Key Inventory Reply: a 16-bit Total Number of Key IDs Returned field, followed by that many (Key ID, Key State) pairs — one per key found in the requested range.',
    q: [
      { t: 'The Key Inventory Reply PDU shall consist of: Total number of Key IDs returned field (16 bits, mandatory); (Key ID, Key state) field pairs (managed length, mandatory).', ref: '§ 5.4.2.6.3.2' } ],
    sp: [], nt: ['(Key ID, Key state) is repeated N times, N being the ‘Total number of Key IDs returned’.', 'The sizes of the Key ID and Key state fields of the Key Inventory Reply PDU data field are managed parameters.'],
    map: 'epdata_keyinvrep', hi: ['kitotal', 'kikeyid', 'kistate'], kids: ['kitotal', 'kikeyid', 'kistate'] },

  kitotal: { n: 'Total Number of Key IDs Returned', parent: 'epdata_keyinvrep', bits: null, len: '16 BITS', pres: 'MANDATORY', ref: '§ 5.4.2.6.3.3',
    desc: 'Signals the number of keys in the Recipient key data base for the range of Key IDs specified in the Key Inventory Command PDU. Sets N — the number of (Key ID, Key State) pairs that follow.',
    q: [ { t: 'The ‘Total number of Key IDs returned’ field shall signal the number of keys in the Recipient key data base for the range of Key IDs specified in the Key Inventory Command PDU.', ref: '§ 5.4.2.6.3.3' } ],
    sp: [], nt: [], map: 'epdata_keyinvrep', hi: ['kitotal'], kids: [] },

  kikeyid: { n: 'Key ID', parent: 'epdata_keyinvrep', bits: null, len: 'MANAGED', pres: 'MANDATORY · ITERATED', ref: '§ 5.4.2.6.3.4',
    desc: 'Signals the identifier of a key found in the requested range. Paired with its Key State and repeated N times.',
    q: [ { t: 'The (Key ID, Key state) fields shall signal, for each key in the range, the Key ID and its state (pre-activation, active, deactivated, destroyed).', ref: '§ 5.4.2.6.3.4' } ],
    sp: [], nt: [], map: 'epdata_keyinvrep', hi: ['kikeyid'], kids: [] },

  kistate: { n: 'Key State', parent: 'epdata_keyinvrep', bits: null, len: 'MANAGED', pres: 'MANDATORY · ITERATED', ref: '§ 5.4.2.6.3.4',
    desc: 'Signals the state of the paired key within the cryptographic key lifecycle. Paired with a Key ID and repeated N times.',
    q: [ { t: 'The (Key ID, Key state) fields shall signal, for each key in the range, the Key ID and its state (pre-activation, active, deactivated, destroyed).', ref: '§ 5.4.2.6.3.4' } ],
    sp: [
      { c: 'PRE-ACTIVATION', d: 'Key loaded but not yet usable', ref: '§ 2.4' },
      { c: 'ACTIVE', d: 'Key usable for cryptographic operations', ref: '§ 2.4' },
      { c: 'DEACTIVATED', d: 'Key no longer usable', ref: '§ 2.4' },
      { c: 'DESTROYED', d: 'Terminal, irreversible state', ref: '§ 2.4' } ],
    nt: [], map: 'epdata_keyinvrep', hi: ['kistate'], kids: [] },

  epdata_startsa: { n: 'Start SA PDU Data Field', parent: 'epframe', bits: null, len: 'MANAGED', pres: 'MANDATORY', ref: '§ 5.5.1.2.2',
    desc: 'The Data Field of a Start SA PDU: a 16-bit SPI naming the applicable Security Association, followed by one to N GVC ID/GMAP ID fields naming the Global Virtual Channel(s)/Global MAP(s) the SA is to be used with.',
    q: [
      { t: 'The Start SA PDU shall consist of a managed number of contiguously positioned mandatory fields: SPI of the applicable Security Association (16 bits, mandatory); GVC ID/GMAP ID(s) with which the SA is to be used (managed length, mandatory).', ref: '§ 5.5.1.2.2.2' } ],
    sp: [], nt: ['Each GVC ID/GMAP ID is encoded into a unique 32-bit field; the precise method of encoding is mission-specific.', 'The GVC ID/GMAP ID field may be repeated to associate the SA with more than one Global Virtual Channel or Global MAP.'],
    map: 'epdata_startsa', hi: ['saspi', 'sagvcid'], kids: ['saspi', 'sagvcid'] },

  saspi: { n: 'Security Parameter Index (SPI)', parent: 'epdata_startsa', bits: null, len: '16 BITS', pres: 'MANDATORY', ref: '§ 5.5.1.2.2.3',
    desc: 'Signals the applicable Security Association to be started. The SPI uniquely identifies the SA within the Recipient SA database.',
    q: [ { t: 'The SPI field shall signal the applicable Security Association.', ref: '§ 5.5.1.2.2.3' } ],
    sp: [], nt: [], map: 'epdata_startsa', hi: ['saspi'], kids: [] },

  sagvcid: { n: 'GVC ID / GMAP ID', parent: 'epdata_startsa', bits: null, len: 'MANAGED (32-bit units)', pres: 'MANDATORY · ITERATED', ref: '§ 5.5.1.2.2.4',
    desc: 'Signals the Global Virtual Channel(s)/Global MAP(s) with which the Security Association is to be used. Each ID is encoded into a unique 32-bit field; repeated one to N times.',
    q: [ { t: 'The GVC ID/GMAP ID field shall signal the Global Virtual Channel(s)/Global Multiplexer Access Point(s) with which the SA is to be activated.', ref: '§ 5.5.1.2.2.4' } ],
    sp: [], nt: ['The precise method of encoding a GVC ID/GMAP ID into a unique 32-bit field is mission-specific.'],
    map: 'epdata_startsa', hi: ['sagvcid'], kids: [] },

  epdata_stopsa: { n: 'Stop SA PDU Data Field', parent: 'epframe', bits: null, len: '16 BITS', pres: 'MANDATORY', ref: '§ 5.5.1.3.2',
    desc: 'The Data Field of a Stop SA PDU: a single 16-bit SPI field naming the applicable Security Association, which must be in the ‘Operational’ state.',
    q: [
      { t: 'The Stop SA PDU shall consist of a single field: SPI of the applicable Security Association (16 bits, mandatory).', ref: '§ 5.5.1.3.2.2' } ],
    sp: [], nt: ['The Security Association identified by the SPI must be in the ‘Operational’ state for the Stop SA directive to be executed.'],
    map: 'epdata_stopsa', hi: ['ssaspi'], kids: ['ssaspi'] },

  ssaspi: { n: 'Security Parameter Index (SPI)', parent: 'epdata_stopsa', bits: null, len: '16 BITS', pres: 'MANDATORY', ref: '§ 5.5.1.3.2.3',
    desc: 'Signals the applicable Security Association to be stopped. The SPI uniquely identifies the SA within the Recipient SA database.',
    q: [ { t: 'The SPI field shall signal the applicable Security Association.', ref: '§ 5.5.1.3.2.3' } ],
    sp: [], nt: [], map: 'epdata_stopsa', hi: ['ssaspi'], kids: [] },

  epdata_rekeysa: { n: 'Rekey SA PDU Data Field', parent: 'epframe', bits: null, len: 'MANAGED', pres: 'MANDATORY', ref: '§ 5.5.1.4.2',
    desc: 'The Data Field of a Rekey SA PDU: a 16-bit SPI naming the applicable Security Association, then an optional new encryption key ID and optional new authentication key ID, a mandatory new ARSN value, and — if needed — a new IV for the encryption key.',
    q: [
      { t: 'The Rekey SA PDU shall consist of a managed number of contiguously positioned fields: SPI of the applicable Security Association (16 bits, mandatory); New encryption key ID for the SA (managed length, optional); New authentication key ID for the SA (managed length, optional); New ARSN of the applicable Security Association (managed length, mandatory); New IV associated with the encryption key if needed (managed length, optional).', ref: '§ 5.5.1.4.2.2' } ],
    sp: [], nt: ['The New Encryption Key ID and New Authentication Key ID fields are optional; the New ARSN field is mandatory.', 'The New IV field is present only if an IV is needed for the encryption key.'],
    map: 'epdata_rekeysa', hi: ['rkspi', 'rkenckey', 'rkauthkey', 'rkarsn', 'rkiv'], kids: ['rkspi', 'rkenckey', 'rkauthkey', 'rkarsn', 'rkiv'] },

  rkspi: { n: 'Security Parameter Index (SPI)', parent: 'epdata_rekeysa', bits: null, len: '16 BITS', pres: 'MANDATORY', ref: '§ 5.5.1.4.2.3',
    desc: 'Signals the SPI of the Security Association to be rekeyed. Uniquely identifies the SA within the Recipient SA database.',
    q: [ { t: 'The SPI field shall signal the SPI of the Security Association to be rekeyed.', ref: '§ 5.5.1.4.2.3' } ],
    sp: [], nt: [], map: 'epdata_rekeysa', hi: ['rkspi'], kids: [] },

  rkenckey: { n: 'New Encryption Key ID', parent: 'epdata_rekeysa', bits: null, len: 'MANAGED', pres: 'OPTIONAL', ref: '§ 5.5.1.4.2.4',
    desc: 'Signals the new encryption key for the Security Association. Optional — present only when the encryption key is being changed.',
    q: [ { t: 'The New Encryption Key ID field shall signal the new encryption key.', ref: '§ 5.5.1.4.2.4' } ],
    sp: [], nt: [], map: 'epdata_rekeysa', hi: ['rkenckey'], kids: [] },

  rkauthkey: { n: 'New Authentication Key ID', parent: 'epdata_rekeysa', bits: null, len: 'MANAGED', pres: 'OPTIONAL', ref: '§ 5.5.1.4.2.5',
    desc: 'Signals the new authentication key for the Security Association. If the SA service type is Authenticated Encryption using a combined single-key algorithm, this field signals the new key.',
    q: [
      { t: 'The New Authentication Key ID field shall signal the new authentication key.', ref: '§ 5.5.1.4.2.5' },
      { t: 'If the SA service type is Authenticated Encryption using a combined single-key algorithm, the New Authentication Key ID field shall signal the new key.', ref: '§ 5.5.1.4.2.6' } ],
    sp: [], nt: [], map: 'epdata_rekeysa', hi: ['rkauthkey'], kids: [] },

  rkarsn: { n: 'New Anti-Replay Sequence Number', parent: 'epdata_rekeysa', bits: null, len: 'MANAGED', pres: 'MANDATORY', ref: '§ 5.5.1.4.2.7',
    desc: 'Signals the new value of the Anti-Replay Sequence Number (ARSN) to be used with the new key.',
    q: [ { t: 'The Anti-Replay Sequence Number value field shall signal the new value of the ARSN to be used with the new key.', ref: '§ 5.5.1.4.2.7' } ],
    sp: [], nt: [], map: 'epdata_rekeysa', hi: ['rkarsn'], kids: [] },

  rkiv: { n: 'New Initialization Vector (IV)', parent: 'epdata_rekeysa', bits: null, len: 'MANAGED', pres: 'OPTIONAL', ref: '§ 5.5.1.4.2.8',
    desc: 'Signals the new value of the IV to be used with the encryption key. Present only if an IV is needed for the encryption key.',
    q: [ { t: 'The IV field shall signal the new value of the IV to be used with the encryption key.', ref: '§ 5.5.1.4.2.8' } ],
    sp: [], nt: [], map: 'epdata_rekeysa', hi: ['rkiv'], kids: [] },

  epdata_expiresa: { n: 'Expire SA PDU Data Field', parent: 'epframe', bits: null, len: '16 BITS', pres: 'MANDATORY', ref: '§ 5.5.1.5.2',
    desc: 'The Data Field of an Expire SA PDU: a single 16-bit SPI field naming the applicable Security Association whose key is to be expired.',
    q: [
      { t: 'The Expire SA PDU shall consist of a single mandatory field: SPI of the applicable Security Association (16 bits, mandatory).', ref: '§ 5.5.1.5.2.2' } ],
    sp: [], nt: [], map: 'epdata_expiresa', hi: ['exspi'], kids: ['exspi'] },

  exspi: { n: 'Security Parameter Index (SPI)', parent: 'epdata_expiresa', bits: null, len: '16 BITS', pres: 'MANDATORY', ref: '§ 5.5.1.5.2.3',
    desc: 'Signals the SPI of the Security Association whose key is to be expired.',
    q: [ { t: 'The SPI field shall signal the SPI of the Security Association whose key is to be expired.', ref: '§ 5.5.1.5.2.3' } ],
    sp: [], nt: [], map: 'epdata_expiresa', hi: ['exspi'], kids: [] },

  epdata_createsa: { n: 'Create SA PDU Data Field', parent: 'epframe', bits: null, len: 'MANAGED', pres: 'MANDATORY', ref: '§ 5.5.1.6.2',
    desc: 'The Data Field of a Create SA PDU: a managed number of contiguous fields that fully specify a new Security Association — the SPI, encryption/authentication service-type flags, the security-header field lengths (IV, SN, PL) and trailer MAC length, and the cipher suite / IV / authentication bit mask / ARSN / ARSN-window descriptors. Each of the last five is a mandatory length field followed by an optional managed-length value.',
    q: [
      { t: 'The Create SA PDU shall consist of a managed number of contiguously positioned fields: SPI (16 bits, M); SA Service Type flag for Encryption (1 bit, M); SA Service Type flag for Authentication (1 bit, M); Security Header IV Field Length (6 bits, M); Security Header SN Field Length (6 bits, M); Security Header PL Field Length (2 bits, M); Security Trailer MAC Field Length (8 bits, M); Encryption cipher suite length (8 bits, M); Encryption cipher suite identifier (managed, O); IV length (8 bits, M); IV value (managed, O); Authentication cipher suite length (8 bits, M); Authentication cipher suite identifier (managed, O); Authentication bit mask length (8 bits, M); Authentication bit mask value (managed, O); ARSN length (8 bits, M); ARSN value (managed, O); ARSN Window length (8 bits, M); ARSN Window value (managed, O).', ref: '§ 5.5.1.6.2.2' } ],
    sp: [], nt: ['Each of the cipher-suite, IV, bit-mask, ARSN and ARSN-window descriptors is a mandatory 8-bit length field followed by an optional value of that managed length.'],
    map: 'epdata_createsa', hi: ['csspi', 'csenc', 'csauth', 'csivlen', 'cssnlen', 'cspllen', 'csmaclen', 'csenclen', 'csencid', 'csivvlen', 'csivval', 'csauthlen', 'csauthid', 'csbmlen', 'csbmval', 'csarsnlen', 'csarsnval', 'cswinlen', 'cswinval'],
    kids: ['csspi', 'csenc', 'csauth', 'csivlen', 'cssnlen', 'cspllen', 'csmaclen', 'csenclen', 'csencid', 'csivvlen', 'csivval', 'csauthlen', 'csauthid', 'csbmlen', 'csbmval', 'csarsnlen', 'csarsnval', 'cswinlen', 'cswinval'] },

  csspi: { n: 'Security Parameter Index (SPI)', parent: 'epdata_createsa', bits: null, len: '16 BITS', pres: 'MANDATORY', ref: '§ 5.5.1.6.2.2 a',
    desc: 'Signals the SPI of the Security Association to be created.',
    q: [ { t: 'SPI of the applicable Security Association (16 bits, mandatory).', ref: '§ 5.5.1.6.2.2 a' } ],
    sp: [], nt: [], map: 'epdata_createsa', hi: ['csspi'], kids: [] },

  csenc: { n: 'SA Service Type — Encryption', parent: 'epdata_createsa', bits: null, len: '1 BIT', pres: 'MANDATORY', ref: '§ 5.5.1.6.2.2 b',
    desc: 'SA Service Type flag for Encryption — signals whether the Security Association to be created provides an encryption service.',
    q: [
      { t: 'SA Service Type flag for Encryption (1 bit, mandatory).', ref: '§ 5.5.1.6.2.2 b' },
      { t: 'The Encryption Service Type flag shall signal that the SA to be created provides encryption service (1 = encryption; 0 = no encryption).', ref: '§ 5.5.1.6.2.4' } ],
    sp: [
      { c: '1', d: 'Encryption service provided', ref: '§ 5.5.1.6.2.4' },
      { c: '0', d: 'No encryption service', ref: '§ 5.5.1.6.2.4' } ],
    nt: ['If the SA Service Type is Authenticated Encryption, both the Encryption and Authentication Service Type flags shall be set.'],
    map: 'epdata_createsa', hi: ['csenc'], kids: [] },

  csauth: { n: 'SA Service Type — Authentication', parent: 'epdata_createsa', bits: null, len: '1 BIT', pres: 'MANDATORY', ref: '§ 5.5.1.6.2.2 c',
    desc: 'SA Service Type flag for Authentication — signals whether the Security Association to be created provides an authentication service.',
    q: [
      { t: 'SA Service Type flag for Authentication (1 bit, mandatory).', ref: '§ 5.5.1.6.2.2 c' },
      { t: 'The Authentication Service Type flag shall signal that the SA to be created provides authentication service (1 = authentication; 0 = no authentication).', ref: '§ 5.5.1.6.2.5' } ],
    sp: [
      { c: '1', d: 'Authentication service provided', ref: '§ 5.5.1.6.2.5' },
      { c: '0', d: 'No authentication service', ref: '§ 5.5.1.6.2.5' } ],
    nt: ['If the SA Service Type is Authenticated Encryption, both the Encryption and Authentication Service Type flags shall be set.'],
    map: 'epdata_createsa', hi: ['csauth'], kids: [] },

  csivlen: { n: 'Security Header IV Field Length', parent: 'epdata_createsa', bits: null, len: '6 BITS', pres: 'MANDATORY', ref: '§ 5.5.1.6.2.2 d',
    desc: 'Signals the length of the Initialization Vector field in the SDLS Security Header for this SA.',
    q: [ { t: 'Security Header IV Field Length (6 bits, mandatory).', ref: '§ 5.5.1.6.2.2 d' } ],
    sp: [], nt: [], map: 'epdata_createsa', hi: ['csivlen'], kids: [] },

  cssnlen: { n: 'Security Header SN Field Length', parent: 'epdata_createsa', bits: null, len: '6 BITS', pres: 'MANDATORY', ref: '§ 5.5.1.6.2.2 e',
    desc: 'Signals the length of the Sequence Number field in the SDLS Security Header for this SA.',
    q: [ { t: 'Security Header SN Field Length (6 bits, mandatory).', ref: '§ 5.5.1.6.2.2 e' } ],
    sp: [], nt: [], map: 'epdata_createsa', hi: ['cssnlen'], kids: [] },

  cspllen: { n: 'Security Header PL Field Length', parent: 'epdata_createsa', bits: null, len: '2 BITS', pres: 'MANDATORY', ref: '§ 5.5.1.6.2.2 f',
    desc: 'Signals the length of the Pad Length field in the SDLS Security Header for this SA.',
    q: [ { t: 'Security Header PL Field Length (2 bits, mandatory).', ref: '§ 5.5.1.6.2.2 f' } ],
    sp: [], nt: [], map: 'epdata_createsa', hi: ['cspllen'], kids: [] },

  csmaclen: { n: 'Security Trailer MAC Field Length', parent: 'epdata_createsa', bits: null, len: '8 BITS', pres: 'MANDATORY', ref: '§ 5.5.1.6.2.2 g',
    desc: 'Signals the length of the Message Authentication Code field in the SDLS Security Trailer for this SA.',
    q: [ { t: 'Security Trailer MAC Field Length (8 bits, mandatory).', ref: '§ 5.5.1.6.2.2 g' } ],
    sp: [], nt: [], map: 'epdata_createsa', hi: ['csmaclen'], kids: [] },

  csenclen: { n: 'Encryption Cipher Suite Length', parent: 'epdata_createsa', bits: null, len: '8 BITS', pres: 'MANDATORY', ref: '§ 5.5.1.6.2.2 h',
    desc: 'Signals the length in octets of the Encryption cipher suite identifier field that follows.',
    q: [ { t: 'Encryption cipher suite length (8 bits, mandatory).', ref: '§ 5.5.1.6.2.2 h' } ],
    sp: [], nt: [], map: 'epdata_createsa', hi: ['csenclen'], kids: [] },

  csencid: { n: 'Encryption Cipher Suite Identifier', parent: 'epdata_createsa', bits: null, len: 'MANAGED', pres: 'OPTIONAL', ref: '§ 5.5.1.6.2.2 i',
    desc: 'Signals the identifier of the encryption cipher suite to be used with the SA. Present only when the length field above is non-zero.',
    q: [ { t: 'Encryption cipher suite identifier (managed length, optional).', ref: '§ 5.5.1.6.2.2 i' } ],
    sp: [], nt: [], map: 'epdata_createsa', hi: ['csencid'], kids: [] },

  csivvlen: { n: 'Initialization Vector Length', parent: 'epdata_createsa', bits: null, len: '8 BITS', pres: 'MANDATORY', ref: '§ 5.5.1.6.2.2 j',
    desc: 'Signals the length in octets of the IV value field that follows.',
    q: [ { t: 'Initialization vector length (8 bits, mandatory).', ref: '§ 5.5.1.6.2.2 j' } ],
    sp: [], nt: [], map: 'epdata_createsa', hi: ['csivvlen'], kids: [] },

  csivval: { n: 'Initialization Vector Value', parent: 'epdata_createsa', bits: null, len: 'MANAGED', pres: 'OPTIONAL', ref: '§ 5.5.1.6.2.2 k',
    desc: 'Signals the initial Initialization Vector value for the SA. Present only when the IV length field above is non-zero.',
    q: [ { t: 'IV value (managed length, optional).', ref: '§ 5.5.1.6.2.2 k' } ],
    sp: [], nt: [], map: 'epdata_createsa', hi: ['csivval'], kids: [] },

  csauthlen: { n: 'Authentication Cipher Suite Length', parent: 'epdata_createsa', bits: null, len: '8 BITS', pres: 'MANDATORY', ref: '§ 5.5.1.6.2.2 l',
    desc: 'Signals the length in octets of the Authentication cipher suite identifier field that follows.',
    q: [ { t: 'Authentication cipher suite length (8 bits, mandatory).', ref: '§ 5.5.1.6.2.2 l' } ],
    sp: [], nt: [], map: 'epdata_createsa', hi: ['csauthlen'], kids: [] },

  csauthid: { n: 'Authentication Cipher Suite Identifier', parent: 'epdata_createsa', bits: null, len: 'MANAGED', pres: 'OPTIONAL', ref: '§ 5.5.1.6.2.2 m',
    desc: 'Signals the identifier of the authentication cipher suite to be used with the SA. Present only when the length field above is non-zero.',
    q: [ { t: 'Authentication cipher suite identifier (managed length, optional).', ref: '§ 5.5.1.6.2.2 m' } ],
    sp: [], nt: [], map: 'epdata_createsa', hi: ['csauthid'], kids: [] },

  csbmlen: { n: 'Authentication Bit Mask Length', parent: 'epdata_createsa', bits: null, len: '8 BITS', pres: 'MANDATORY', ref: '§ 5.5.1.6.2.2 n',
    desc: 'Signals the length in octets of the Authentication bit mask value field that follows.',
    q: [ { t: 'Authentication bit mask length (8 bits, mandatory).', ref: '§ 5.5.1.6.2.2 n' } ],
    sp: [], nt: [], map: 'epdata_createsa', hi: ['csbmlen'], kids: [] },

  csbmval: { n: 'Authentication Bit Mask Value', parent: 'epdata_createsa', bits: null, len: 'MANAGED', pres: 'OPTIONAL', ref: '§ 5.5.1.6.2.2 o',
    desc: 'Signals the bit mask that selects which bits of the frame are covered by authentication. Present only when the length field above is non-zero.',
    q: [ { t: 'Authentication bit mask value (managed length, optional).', ref: '§ 5.5.1.6.2.2 o' } ],
    sp: [], nt: [], map: 'epdata_createsa', hi: ['csbmval'], kids: [] },

  csarsnlen: { n: 'ARSN Length', parent: 'epdata_createsa', bits: null, len: '8 BITS', pres: 'MANDATORY', ref: '§ 5.5.1.6.2.2 p',
    desc: 'Signals the length in octets of the ARSN value field that follows.',
    q: [ { t: 'ARSN length (8 bits, mandatory).', ref: '§ 5.5.1.6.2.2 p' } ],
    sp: [], nt: [], map: 'epdata_createsa', hi: ['csarsnlen'], kids: [] },

  csarsnval: { n: 'ARSN Value', parent: 'epdata_createsa', bits: null, len: 'MANAGED', pres: 'OPTIONAL', ref: '§ 5.5.1.6.2.2 q',
    desc: 'Signals the initial Anti-Replay Sequence Number value for the SA. Present only when the ARSN length field above is non-zero.',
    q: [ { t: 'ARSN value (managed length, optional).', ref: '§ 5.5.1.6.2.2 q' } ],
    sp: [], nt: [], map: 'epdata_createsa', hi: ['csarsnval'], kids: [] },

  cswinlen: { n: 'ARSN Window Length', parent: 'epdata_createsa', bits: null, len: '8 BITS', pres: 'MANDATORY', ref: '§ 5.5.1.6.2.2 r',
    desc: 'Signals the length in octets of the Anti-Replay Sequence Number Window value field that follows.',
    q: [ { t: 'Anti-Replay Sequence Number Window length (8 bits, mandatory).', ref: '§ 5.5.1.6.2.2 r' } ],
    sp: [], nt: [], map: 'epdata_createsa', hi: ['cswinlen'], kids: [] },

  cswinval: { n: 'ARSN Window Value', parent: 'epdata_createsa', bits: null, len: 'MANAGED', pres: 'OPTIONAL', ref: '§ 5.5.1.6.2.2 s',
    desc: 'Signals the Anti-Replay Sequence Number window — the tolerance within which out-of-order sequence numbers are accepted. Present only when the length field above is non-zero.',
    q: [ { t: 'Anti-Replay Sequence Number Window value (managed length, optional).', ref: '§ 5.5.1.6.2.2 s' } ],
    sp: [], nt: [], map: 'epdata_createsa', hi: ['cswinval'], kids: [] },

  epdata_deletesa: { n: 'Delete SA PDU Data Field', parent: 'epframe', bits: null, len: '16 BITS', pres: 'MANDATORY', ref: '§ 5.5.1.7.2',
    desc: 'The Data Field of a Delete SA PDU: a single 16-bit SPI field naming the Security Association to be removed. The SA must be in the ‘Unkeyed’ state; on execution it transitions to the null (‘No SA’) state and all its managed parameters are erased.',
    q: [ { t: 'The Delete SA PDU shall consist of a single mandatory field: SPI of the applicable Security Association (16 bits, mandatory).', ref: '§ 5.5.1.7.2.2' } ],
    sp: [], nt: ['Precondition: the Security Association must be in the ‘Unkeyed’ state.', 'On execution the SA transitions to a null state (‘No SA’) and all managed parameters of the SA are erased.'],
    map: 'epdata_deletesa', hi: ['dsspi'], kids: ['dsspi'] },

  dsspi: { n: 'Security Parameter Index (SPI)', parent: 'epdata_deletesa', bits: null, len: '16 BITS', pres: 'MANDATORY', ref: '§ 5.5.1.7.2.3',
    desc: 'Signals the SPI of the Security Association to be deleted.',
    q: [ { t: 'The SPI field shall signal the SPI of the Security Association to be deleted.', ref: '§ 5.5.1.7.2.3' } ],
    sp: [], nt: [], map: 'epdata_deletesa', hi: ['dsspi'], kids: [] },

  epdata_setarsn: { n: 'Set ARSN PDU Data Field', parent: 'epframe', bits: null, len: 'MANAGED', pres: 'MANDATORY', ref: '§ 5.5.1.8.2',
    desc: 'The Data Field of a Set Anti-Replay Sequence Number PDU: a 16-bit SPI naming the applicable Security Association, followed by the new ARSN value of managed length.',
    q: [ { t: 'The Set Anti-Replay Sequence Number PDU shall consist of a managed number of contiguously positioned mandatory fields: SPI of the applicable Security Association (16 bits, mandatory); new value of the Anti-Replay Sequence Number (managed length, mandatory).', ref: '§ 5.5.1.8.2.2' } ],
    sp: [], nt: ['The size of the new ARSN value field is a managed parameter.'],
    map: 'epdata_setarsn', hi: ['saraspi', 'sarval'], kids: ['saraspi', 'sarval'] },

  saraspi: { n: 'Security Parameter Index (SPI)', parent: 'epdata_setarsn', bits: null, len: '16 BITS', pres: 'MANDATORY', ref: '§ 5.5.1.8.2.3',
    desc: 'Signals the SPI of the Security Association whose Anti-Replay Sequence Number is to be modified.',
    q: [ { t: 'The SPI field shall signal the SPI of the Security Association whose Anti-Replay Sequence Number is to be modified.', ref: '§ 5.5.1.8.2.3' } ],
    sp: [], nt: [], map: 'epdata_setarsn', hi: ['saraspi'], kids: [] },

  sarval: { n: 'New Anti-Replay Sequence Number', parent: 'epdata_setarsn', bits: null, len: 'MANAGED', pres: 'MANDATORY', ref: '§ 5.5.1.8.2.4',
    desc: 'Signals the new Anti-Replay Sequence Number value to be set for the Security Association.',
    q: [ { t: 'The Anti-Replay Sequence Number field shall signal the new Anti-Replay Sequence Number value.', ref: '§ 5.5.1.8.2.4' } ],
    sp: [], nt: [], map: 'epdata_setarsn', hi: ['sarval'], kids: [] },

  epdata_setarsnw: { n: 'Set ARSN Window PDU Data Field', parent: 'epframe', bits: null, len: 'MANAGED', pres: 'MANDATORY', ref: '§ 5.5.1.9.2',
    desc: 'The Data Field of a Set Anti-Replay Sequence Number Window PDU: a 16-bit SPI naming the applicable Security Association, followed by the new ARSN window value of managed length.',
    q: [ { t: 'The Set Anti-Replay Sequence Number Window PDU shall consist of a managed number of contiguously positioned mandatory fields: SPI of the applicable Security Association (16 bits, mandatory); new value of the Anti-Replay Sequence Number window (managed length, mandatory).', ref: '§ 5.5.1.9.2.2' } ],
    sp: [], nt: ['The size of the new ARSN window value field is a managed parameter.'],
    map: 'epdata_setarsnw', hi: ['sarwspi', 'sarwval'], kids: ['sarwspi', 'sarwval'] },

  sarwspi: { n: 'Security Parameter Index (SPI)', parent: 'epdata_setarsnw', bits: null, len: '16 BITS', pres: 'MANDATORY', ref: '§ 5.5.1.9.2.3',
    desc: 'Signals the SPI of the Security Association whose Anti-Replay Sequence Number window is to be modified.',
    q: [ { t: 'The SPI field shall signal the SPI of the Security Association whose Anti-Replay Sequence Number window is to be modified.', ref: '§ 5.5.1.9.2.3' } ],
    sp: [], nt: [], map: 'epdata_setarsnw', hi: ['sarwspi'], kids: [] },

  sarwval: { n: 'New Anti-Replay Sequence Number Window', parent: 'epdata_setarsnw', bits: null, len: 'MANAGED', pres: 'MANDATORY', ref: '§ 5.5.1.9.2.4',
    desc: 'Signals the new Anti-Replay Sequence Number window value — the tolerance within which out-of-order sequence numbers are accepted — to be set for the Security Association.',
    q: [ { t: 'The Anti-Replay Sequence Number Window field shall signal the new Anti-Replay Sequence Number window value.', ref: '§ 5.5.1.9.2.4' } ],
    sp: [], nt: [], map: 'epdata_setarsnw', hi: ['sarwval'], kids: [] },

  epdata_sastat: { n: 'SA Status Request PDU Data Field', parent: 'epframe', bits: null, len: '16 BITS', pres: 'MANDATORY', ref: '§ 5.5.1.10.2',
    desc: 'The Data Field of an SA Status Request PDU: a single 16-bit SPI field naming the Security Association whose status is to be queried.',
    q: [ { t: 'The SA Status Request PDU shall consist of a single mandatory field: SPI of the applicable Security Association (16 bits, mandatory).', ref: '§ 5.5.1.10.2.2' } ],
    sp: [], nt: [], map: 'epdata_sastat', hi: ['ssqspi'], kids: ['ssqspi'] },

  ssqspi: { n: 'Security Parameter Index (SPI)', parent: 'epdata_sastat', bits: null, len: '16 BITS', pres: 'MANDATORY', ref: '§ 5.5.1.10.2.3',
    desc: 'Signals the SPI of the Security Association to be queried.',
    q: [ { t: 'The SPI field shall signal the SPI of the Security Association to be queried.', ref: '§ 5.5.1.10.2.3' } ],
    sp: [], nt: [], map: 'epdata_sastat', hi: ['ssqspi'], kids: [] },

  epdata_sastatrep: { n: 'SA Status Request Reply PDU Data Field', parent: 'epframe', bits: null, len: 'MANAGED', pres: 'MANDATORY', ref: '§ 5.5.1.10.3',
    desc: 'The Data Field of an SA Status Request Reply PDU: two contiguous mandatory fields — the 16-bit SPI of the queried SA, and the State Transition Directive giving the Procedure Identification of the last executed state-transition directive for that SA.',
    q: [ { t: 'The SA Status Request Reply PDU shall consist of two contiguously positioned mandatory fields: SPI of the applicable Security Association (16 bits, mandatory); State Transition Directive (mandatory).', ref: '§ 5.5.1.10.3.2' } ],
    sp: [], nt: [], map: 'epdata_sastatrep', hi: ['ssrspi', 'ssrdir'], kids: ['ssrspi', 'ssrdir'] },

  ssrspi: { n: 'Security Parameter Index (SPI)', parent: 'epdata_sastatrep', bits: null, len: '16 BITS', pres: 'MANDATORY', ref: '§ 5.5.1.10.3.3',
    desc: 'Signals the SPI of the Security Association that was queried.',
    q: [ { t: 'The SPI field shall signal the SPI of the Security Association to be queried.', ref: '§ 5.5.1.10.3.3' } ],
    sp: [], nt: [], map: 'epdata_sastatrep', hi: ['ssrspi'], kids: [] },

  ssrdir: { n: 'State Transition Directive', parent: 'epdata_sastatrep', bits: null, len: '8 BITS', pres: 'MANDATORY', ref: '§ 5.5.1.10.3.4',
    desc: 'Signals the Procedure Identification of the last executed state transition directive for the applicable Security Association; or, if no previous state transition for the SA is known, the current state of the SA. Within the Procedure Identification, the previous (exited) state of the SA is the leftmost two bits and the current (entered) state is the rightmost two bits.',
    q: [ { t: 'The State Transition Directive field shall signal the Procedure Identification of the last executed state transition directive for the applicable Security Association; or, if no previous state transition for the SA is known, the current state of the SA.', ref: '§ 5.5.1.10.3.4' } ],
    sp: [
      { c: '00', d: 'Null state (‘No SA’)', ref: '§ 5.5.1.1' },
      { c: '01', d: 'Unkeyed state', ref: '§ 5.5.1.1' },
      { c: '10', d: 'Keyed state', ref: '§ 5.5.1.1' },
      { c: '11', d: 'Operational state', ref: '§ 5.5.1.1' } ],
    nt: ['Within each SA state transition directive, the previous (exited) state of the SA corresponds to the leftmost two bits of the Procedure Identification, and the current (entered) state corresponds to the rightmost two bits.'],
    map: 'epdata_sastatrep', hi: ['ssrdir'], kids: [] },

  epdata_readarsn: { n: 'Read ARSN PDU Data Field', parent: 'epframe', bits: null, len: '16 BITS', pres: 'MANDATORY', ref: '§ 5.5.1.11.2',
    desc: 'The Data Field of a Read Anti-Replay Sequence Number Command PDU: a single 16-bit SPI field naming the Security Association whose ARSN is to be read.',
    q: [ { t: 'The Read Anti-Replay Sequence Number Command PDU shall consist of one mandatory data field: SPI of the SA whose ARSN is to be read (16 bits, mandatory).', ref: '§ 5.5.1.11.2.2' } ],
    sp: [], nt: [], map: 'epdata_readarsn', hi: ['rdspi'], kids: ['rdspi'] },

  rdspi: { n: 'Security Parameter Index (SPI)', parent: 'epdata_readarsn', bits: null, len: '16 BITS', pres: 'MANDATORY', ref: '§ 5.5.1.11.2.2',
    desc: 'Signals the SPI of the Security Association whose Anti-Replay Sequence Number is to be read.',
    q: [ { t: 'The Read Anti-Replay Sequence Number Command PDU shall consist of one mandatory data field: SPI of the SA whose ARSN is to be read (16 bits, mandatory).', ref: '§ 5.5.1.11.2.2' } ],
    sp: [], nt: [], map: 'epdata_readarsn', hi: ['rdspi'], kids: [] },

  epdata_readarsnrep: { n: 'Read ARSN Reply PDU Data Field', parent: 'epframe', bits: null, len: 'MANAGED', pres: 'MANDATORY', ref: '§ 5.5.1.11.3',
    desc: 'The Data Field of a Read Anti-Replay Sequence Number Reply PDU: a single mandatory ARSN Value field of managed length, carrying the current Anti-Replay Sequence Number of the queried SA in full, without truncation.',
    q: [ { t: 'The Read Anti-Replay Sequence Number Reply PDU shall consist of one mandatory data field: ARSN Value (managed length, mandatory).', ref: '§ 5.5.1.11.3.2' } ],
    sp: [], nt: ['The Anti-Replay Sequence Number Value field shall contain the full value of the Anti-Replay Sequence Number, without truncation.'],
    map: 'epdata_readarsnrep', hi: ['rdarsnval'], kids: ['rdarsnval'] },

  rdarsnval: { n: 'Anti-Replay Sequence Number Value', parent: 'epdata_readarsnrep', bits: null, len: 'MANAGED', pres: 'MANDATORY', ref: '§ 5.5.1.11.3.2',
    desc: 'Signals the current Anti-Replay Sequence Number value associated with the queried Security Association. Carried in full, without truncation.',
    q: [ { t: 'The Read Anti-Replay Sequence Number Reply PDU shall consist of one mandatory data field: ARSN Value (managed length, mandatory).', ref: '§ 5.5.1.11.3.2' } ],
    sp: [], nt: ['The Anti-Replay Sequence Number Value field shall contain the full value of the Anti-Replay Sequence Number, without truncation.'],
    map: 'epdata_readarsnrep', hi: ['rdarsnval'], kids: [] },

  epdata_ping: { n: 'Ping Command PDU Data Field', parent: 'epframe', bits: null, len: 'NONE', pres: 'ABSENT', ref: '§ 5.6.1.1.2',
    desc: 'The Ping Command PDU has no data field. The Ping directive verifies that the SDLS Security Function on the Recipient is responsive; everything needed is carried by the PDU Header alone, and the Recipient answers with a Ping Reply.',
    q: [ { t: 'The Ping Command PDU shall have no data field.', ref: '§ 5.6.1.1.2.2' } ],
    sp: [], nt: ['The Ping Command PDU belongs to the Security Monitoring & Control service group (Service Group bits ‘11’).', 'The format of the Ping Command PDU is shown in figure 5-24.'],
    map: 'epframe', hi: ['epdata'], kids: [] },

  epdata_pingrep: { n: 'Ping Reply PDU Data Field', parent: 'epframe', bits: null, len: 'NONE', pres: 'ABSENT', ref: '§ 5.6.1.1.3',
    desc: 'The Ping Reply PDU has no data field. Its mere receipt by the Initiator confirms that the Recipient’s SDLS Security Function is present and responsive; all information is carried by the PDU Header alone.',
    q: [ { t: 'The Ping Reply PDU shall have no data field.', ref: '§ 5.6.1.1.3.2' } ],
    sp: [], nt: ['The Ping Reply PDU belongs to the Security Monitoring & Control service group (Service Group bits ‘11’).', 'The format of the Ping Reply PDU is shown in figure 5-25.'],
    map: 'epframe', hi: ['epdata'], kids: [] },

  epdata_logstat: { n: 'Log Status Command PDU Data Field', parent: 'epframe', bits: null, len: 'NONE', pres: 'ABSENT', ref: '§ 5.6.1.2.2',
    desc: 'The Log Status Command PDU has no data field. The directive requests a summary of the on-board Security Log; everything needed is carried by the PDU Header alone, and the Recipient answers with a Log Status Reply.',
    q: [ { t: 'The Log Status Command PDU shall have no data field.', ref: '§ 5.6.1.2.2.2' } ],
    sp: [], nt: ['The Log Status Command PDU belongs to the Security Monitoring & Control service group (Service Group bits ‘11’).', 'The format of the Log Status Command PDU is shown in figure 5-26.'],
    map: 'epframe', hi: ['epdata'], kids: [] },

  epdata_logstatrep: { n: 'Log Status Reply PDU Data Field', parent: 'epframe', bits: null, len: 'MANAGED', pres: 'MANDATORY', ref: '§ 5.6.1.2.3',
    desc: 'The Data Field of a Log Status Reply PDU: two contiguous mandatory fields of managed length — the number of events currently held in the Security Log, and the remaining space still available in it.',
    q: [ { t: 'The Log Status Reply PDU shall consist of two contiguously positioned mandatory fields: number of events in the Security Log (managed length, mandatory); remaining space in the Security Log (managed length, mandatory).', ref: '§ 5.6.1.2.3.2' } ],
    sp: [], nt: [], map: 'epdata_logstatrep', hi: ['lsevents', 'lsspace'], kids: ['lsevents', 'lsspace'] },

  lsevents: { n: 'Number of Events in the Security Log', parent: 'epdata_logstatrep', bits: null, len: 'MANAGED', pres: 'MANDATORY', ref: '§ 5.6.1.2.3.2',
    desc: 'Signals the number of Security Event Messages currently held in the on-board Security Log.',
    q: [ { t: 'The Log Status Reply PDU shall consist of two contiguously positioned mandatory fields: number of events in the Security Log (managed length, mandatory); remaining space in the Security Log (managed length, mandatory).', ref: '§ 5.6.1.2.3.2' } ],
    sp: [], nt: [], map: 'epdata_logstatrep', hi: ['lsevents'], kids: [] },

  lsspace: { n: 'Remaining Space in the Security Log', parent: 'epdata_logstatrep', bits: null, len: 'MANAGED', pres: 'MANDATORY', ref: '§ 5.6.1.2.3.2',
    desc: 'Signals the space still available in the on-board Security Log for further Security Event Messages.',
    q: [ { t: 'The Log Status Reply PDU shall consist of two contiguously positioned mandatory fields: number of events in the Security Log (managed length, mandatory); remaining space in the Security Log (managed length, mandatory).', ref: '§ 5.6.1.2.3.2' } ],
    sp: [], nt: [], map: 'epdata_logstatrep', hi: ['lsspace'], kids: [] },

  epdata_dumplog: { n: 'Dump Log Command PDU Data Field', parent: 'epframe', bits: null, len: 'NONE', pres: 'ABSENT', ref: '§ 5.6.1.3.2',
    desc: 'The Dump Log Command PDU has no data field. The directive requests that the Recipient send the entire content of the on-board Security Log to the ground — it does not erase the log. Everything needed is carried by the PDU Header alone, and the Recipient answers with a Dump Log Reply.',
    q: [ { t: 'The Dump Log Command PDU shall have no data field.', ref: '§ 5.6.1.3.2.2' } ],
    sp: [], nt: ['The Dump Log Command PDU belongs to the Security Monitoring & Control service group (Service Group bits ‘11’).', 'The Dump Log directive does not erase the Security Log.', 'The format of the Dump Log Command PDU is shown in figure 5-28.'],
    map: 'epframe', hi: ['epdata'], kids: [] },

  epdata_dumplogrep: { n: 'Dump Log Reply PDU Data Field', parent: 'epframe', bits: null, len: 'VARIABLE', pres: 'MANDATORY', ref: '§ 5.6.1.3.3',
    desc: 'The Data Field of a Dump Log Reply PDU: a variable number of contiguous Security Event Messages, each carried in TLV (Tag–Length–Value) format — an Event Message Tag, an Event Message Length, then the variable-length Event Message. The triple is repeated one to N times, one per logged event.',
    q: [
      { t: 'The Dump Log Reply PDU shall consist of a variable number of contiguously positioned fields: Security Event Message (TLV formatted, T and L field lengths managed).', ref: '§ 5.6.1.3.3.2' } ],
    sp: [], nt: ['Each Security Event Message is TLV (Tag–Length–Value) formatted; the Tag (T) and Length (L) field sizes are managed parameters.', 'The Security Event Message field is repeated one to N times, one per event stored in the Security Log.'],
    map: 'epdata_dumplogrep', hi: ['dltag', 'dllen', 'dlval'], kids: ['dltag', 'dllen', 'dlval'] },

  dltag: { n: 'Event Message Tag', parent: 'epdata_dumplogrep', bits: null, len: 'MANAGED', pres: 'MANDATORY · ITERATED', ref: '§ 5.6.1.3.3.2',
    desc: 'The Tag (T) of a TLV-formatted Security Event Message — identifies the type of the logged event. First field of each triple; its length is a managed parameter.',
    q: [ { t: 'Security Event Message (TLV formatted, T and L field lengths managed).', ref: '§ 5.6.1.3.3.2' } ],
    sp: [], nt: [], map: 'epdata_dumplogrep', hi: ['dltag'], kids: [] },

  dllen: { n: 'Event Message Length', parent: 'epdata_dumplogrep', bits: null, len: 'MANAGED', pres: 'MANDATORY · ITERATED', ref: '§ 5.6.1.3.3.2',
    desc: 'The Length (L) of a TLV-formatted Security Event Message — signals the size in octets of the Event Message value that follows. Its length is a managed parameter.',
    q: [ { t: 'Security Event Message (TLV formatted, T and L field lengths managed).', ref: '§ 5.6.1.3.3.2' } ],
    sp: [], nt: [], map: 'epdata_dumplogrep', hi: ['dllen'], kids: [] },

  dlval: { n: 'Event Message', parent: 'epdata_dumplogrep', bits: null, len: 'VARIABLE (managed by L)', pres: 'MANDATORY · ITERATED', ref: '§ 5.6.1.3.3.2',
    desc: 'The Value (V) of a TLV-formatted Security Event Message — the variable-length body of a single logged security event. Its length is given by the preceding Event Message Length field.',
    q: [ { t: 'Security Event Message (TLV formatted, T and L field lengths managed).', ref: '§ 5.6.1.3.3.2' } ],
    sp: [], nt: [], map: 'epdata_dumplogrep', hi: ['dlval'], kids: [] },

  epdata_eraselog: { n: 'Erase Log Command PDU Data Field', parent: 'epframe', bits: null, len: 'NONE', pres: 'ABSENT', ref: '§ 5.6.1.4.2',
    desc: 'The Erase Log Command PDU has no data field. The directive requests that the Recipient erase the entire content of the on-board Security Log. Everything needed is carried by the PDU Header alone, and the Recipient answers with an Erase Log Reply giving the log status after erasure.',
    q: [ { t: 'The Erase Log Command PDU shall have no data field.', ref: '§ 5.6.1.4.2.2' } ],
    sp: [], nt: ['The Erase Log Command PDU belongs to the Security Monitoring & Control service group (Service Group bits ‘11’).', 'The format of the Erase Log Command PDU is shown in figure 5-30.'],
    map: 'epframe', hi: ['epdata'], kids: [] },

  epdata_eraselogrep: { n: 'Erase Log Reply PDU Data Field', parent: 'epframe', bits: null, len: 'MANAGED', pres: 'MANDATORY', ref: '§ 5.6.1.4.3',
    desc: 'The Data Field of an Erase Log Reply PDU: two contiguous mandatory fields of managed length — the number of events still in the Security Log after erasure, and the remaining space now available in the log.',
    q: [ { t: 'The Erase Log Reply PDU shall consist of two contiguously positioned mandatory fields: number of events in the Security Log after erasure (managed length, mandatory); remaining space in the Security Log after erasure (managed length, mandatory).', ref: '§ 5.6.1.4.3.2' } ],
    sp: [], nt: [], map: 'epdata_eraselogrep', hi: ['elevents', 'elspace'], kids: ['elevents', 'elspace'] },

  elevents: { n: 'Number of Events After Erasure', parent: 'epdata_eraselogrep', bits: null, len: 'MANAGED', pres: 'MANDATORY', ref: '§ 5.6.1.4.3.2 a',
    desc: 'Signals the number of Security Event Messages remaining in the on-board Security Log after erasure of the log.',
    q: [ { t: 'Number of events in the Security Log after erasure of the Security Log (managed length, mandatory).', ref: '§ 5.6.1.4.3.2 a' } ],
    sp: [], nt: [], map: 'epdata_eraselogrep', hi: ['elevents'], kids: [] },

  elspace: { n: 'Remaining Space After Erasure', parent: 'epdata_eraselogrep', bits: null, len: 'MANAGED', pres: 'MANDATORY', ref: '§ 5.6.1.4.3.2 b',
    desc: 'Signals the space still available in the on-board Security Log for further Security Event Messages after erasure of the log.',
    q: [ { t: 'Remaining space in the Security Log after erasure of the Security Log (managed length, mandatory).', ref: '§ 5.6.1.4.3.2 b' } ],
    sp: [], nt: [], map: 'epdata_eraselogrep', hi: ['elspace'], kids: [] },

  epdata_selftest: { n: 'Self-Test Command PDU Data Field', parent: 'epframe', bits: null, len: 'NONE', pres: 'ABSENT', ref: '§ 5.6.1.5.2',
    desc: 'The Self-Test Command PDU has no data field. The directive requests that the Recipient run a self-test of its SDLS Security Function. Everything needed is carried by the PDU Header alone, and the Recipient answers with a Self-Test Reply carrying the result.',
    q: [ { t: 'The Self-Test Command PDU shall have no data field.', ref: '§ 5.6.1.5.2.2' } ],
    sp: [], nt: ['The Self-Test Command PDU belongs to the Security Monitoring & Control service group (Service Group bits ‘11’).', 'The format of the Self-Test Command PDU is shown in figure 5-32.'],
    map: 'epframe', hi: ['epdata'], kids: [] },

  epdata_selftestrep: { n: 'Self-Test Reply PDU Data Field', parent: 'epframe', bits: null, len: '8 BITS', pres: 'MANDATORY', ref: '§ 5.6.1.5.3',
    desc: 'The Data Field of a Self-Test Reply PDU: a single mandatory 8-bit Self-Test Result field. The most significant bit signals the outcome; the remaining seven bits are not used by CCSDS and are left to the implementer.',
    q: [ { t: 'The Self-Test Reply PDU shall consist of one mandatory data field: Self-Test result — 0XXXXXXXb: Self-Test OK (8-bit length); 1XXXXXXXb: Self-Test not OK (8-bit length).', ref: '§ 5.6.1.5.3.2' } ],
    sp: [], nt: [], map: 'epdata_selftestrep', hi: ['stresult'], kids: ['stresult'] },

  stresult: { n: 'Self-Test Result', parent: 'epdata_selftestrep', bits: null, len: '8 BITS', pres: 'MANDATORY', ref: '§ 5.6.1.5.3.2',
    desc: 'Signals the outcome of the Recipient self-test. The most significant bit carries the result; the low seven bits (‘X’) are not used by CCSDS and their values are left to the implementer.',
    q: [ { t: 'The Self-Test Reply PDU shall consist of one mandatory data field: Self-Test result — 0XXXXXXXb: Self-Test OK (8-bit length); 1XXXXXXXb: Self-Test not OK (8-bit length).', ref: '§ 5.6.1.5.3.2' } ],
    sp: [
      { c: '0XXXXXXX', d: 'Self-Test OK (MSB = 0)', ref: '§ 5.6.1.5.3.2' },
      { c: '1XXXXXXX', d: 'Self-Test not OK (MSB = 1)', ref: '§ 5.6.1.5.3.2' } ],
    nt: ['The bits having the value ‘X’ are not used by CCSDS; their values are left to the implementer’s choice.'],
    map: 'epdata_selftestrep', hi: ['stresult'], kids: [] },

  epdata_alarmreset: { n: 'Alarm Flag Reset Command PDU Data Field', parent: 'epframe', bits: null, len: 'NONE', pres: 'ABSENT', ref: '§ 5.6.1.6.2',
    desc: 'The Alarm Flag Reset Command PDU has no data field. The directive requests that the Recipient clear the security alarm flag raised by its SDLS Security Function. Everything needed is carried by the PDU Header alone.',
    q: [ { t: 'The Alarm Flag Reset Command PDU shall have no data field.', ref: '§ 5.6.1.6.2.2' } ],
    sp: [], nt: ['The Alarm Flag Reset Procedure supports a single Extended Procedures PDU data field structure: the Alarm Flag Reset Command PDU (there is no reply PDU).', 'The Alarm Flag Reset Command PDU belongs to the Security Monitoring & Control service group (Service Group bits ‘11’).', 'The format of the Alarm Flag Reset Command PDU is shown in figure 5-34.'],
    map: 'epframe', hi: ['epdata'], kids: [] }
};

const SDLS_EP_MAPS = {
  epframe: { title: 'WITHIN EXTENDED PROCEDURES PDU', cells: [
    { id: 'ephdr', l: 'PDU HEADER', w: 3 }, { id: 'epdata', l: 'PDU DATA FIELD', w: 4 } ] },
  ephdr: { title: 'WITHIN PDU HEADER (24 BITS)', cells: [
    { id: 'eptag', l: 'TAG', w: 8 }, { id: 'eplen', l: 'DATA FIELD LENGTH', w: 16 } ] },
  eptag: { title: 'WITHIN EXTENDED PROCEDURES TAG (8 BITS)', cells: [
    { id: 'eptype', l: 'PT', w: 2 }, { id: 'epuser', l: 'UF', w: 2 }, { id: 'epsg', l: 'SVC GRP', w: 3 }, { id: 'eppi', l: 'PROC IDENT', w: 5 } ] },
  epdata_otar: { title: 'WITHIN OTAR PDU DATA FIELD', cells: [
    { id: 'mkid', l: 'MASTER KEY ID', w: 5 }, { id: 'epiv', l: 'IV', w: 4 }, { id: 'ekid', l: 'ENC KEY ID', w: 5 }, { id: 'ekey', l: 'ENC KEY', w: 5 }, { id: 'epmac', l: 'MAC', w: 5 } ] },
  epdata_keyact: { title: 'WITHIN KEY ACTIVATION PDU DATA FIELD', cells: [
    { id: 'epkeyid', l: 'KEY ID', w: 1 } ] },
  epdata_keydeact: { title: 'WITHIN KEY DEACTIVATION PDU DATA FIELD', cells: [
    { id: 'kdkeyid', l: 'KEY ID', w: 1 } ] },
  epdata_keydestr: { title: 'WITHIN KEY DESTRUCTION PDU DATA FIELD', cells: [
    { id: 'kxkeyid', l: 'KEY ID', w: 1 } ] },
  epdata_keyver: { title: 'WITHIN KEY VERIFICATION PDU DATA FIELD', cells: [
    { id: 'kvkeyid', l: 'KEY ID', w: 2 }, { id: 'kvchal', l: 'CHALLENGE', w: 6 } ] },
  epdata_keyverrep: { title: 'WITHIN KEY VERIFICATION REPLY PDU DATA FIELD', cells: [
    { id: 'krkeyid', l: 'KEY ID', w: 2 }, { id: 'kriv', l: 'IV', w: 5 }, { id: 'krechal', l: 'ENC CHALLENGE', w: 6 }, { id: 'krmac', l: 'CHALLENGE MAC', w: 6 } ] },
  epdata_keyinv: { title: 'WITHIN KEY INVENTORY PDU DATA FIELD', cells: [
    { id: 'kifirst', l: 'FIRST KEY ID', w: 1 }, { id: 'kilast', l: 'LAST KEY ID', w: 1 } ] },
  epdata_keyinvrep: { title: 'WITHIN KEY INVENTORY REPLY PDU DATA FIELD', cells: [
    { id: 'kitotal', l: 'TOTAL KEY IDS', w: 2 }, { id: 'kikeyid', l: 'KEY ID', w: 2 }, { id: 'kistate', l: 'KEY STATE', w: 2 } ] },
  epdata_startsa: { title: 'WITHIN START SA PDU DATA FIELD', cells: [
    { id: 'saspi', l: 'SPI', w: 2 }, { id: 'sagvcid', l: 'GVC ID / GMAP ID', w: 4 } ] },
  epdata_stopsa: { title: 'WITHIN STOP SA PDU DATA FIELD', cells: [
    { id: 'ssaspi', l: 'SPI', w: 2 } ] },
  epdata_rekeysa: { title: 'WITHIN REKEY SA PDU DATA FIELD', cells: [
    { id: 'rkspi', l: 'SPI', w: 2 }, { id: 'rkenckey', l: 'NEW ENC KEY ID', w: 3 }, { id: 'rkauthkey', l: 'NEW AUTH KEY ID', w: 3 }, { id: 'rkarsn', l: 'NEW ARSN', w: 3 }, { id: 'rkiv', l: 'NEW IV', w: 3 } ] },
  epdata_expiresa: { title: 'WITHIN EXPIRE SA PDU DATA FIELD', cells: [
    { id: 'exspi', l: 'SPI', w: 2 } ] },
  epdata_createsa: { title: 'WITHIN CREATE SA PDU DATA FIELD', cells: [
    { id: 'csspi', l: 'SPI', w: 2 }, { id: 'csenc', l: 'ENC', w: 1 }, { id: 'csauth', l: 'AUTH', w: 1 }, { id: 'csivlen', l: 'IV LEN', w: 1 }, { id: 'cssnlen', l: 'SN LEN', w: 1 }, { id: 'cspllen', l: 'PL LEN', w: 1 }, { id: 'csmaclen', l: 'MAC LEN', w: 1 }, { id: 'csenclen', l: 'ENC CS LEN', w: 1 }, { id: 'csencid', l: 'ENC CS ID', w: 2 }, { id: 'csivvlen', l: 'IV LEN', w: 1 }, { id: 'csivval', l: 'IV VAL', w: 2 }, { id: 'csauthlen', l: 'AUTH CS LEN', w: 1 }, { id: 'csauthid', l: 'AUTH CS ID', w: 2 }, { id: 'csbmlen', l: 'BM LEN', w: 1 }, { id: 'csbmval', l: 'BM VAL', w: 2 }, { id: 'csarsnlen', l: 'ARSN LEN', w: 1 }, { id: 'csarsnval', l: 'ARSN VAL', w: 2 }, { id: 'cswinlen', l: 'WIN LEN', w: 1 }, { id: 'cswinval', l: 'WIN VAL', w: 2 } ] }
  , epdata_deletesa: { title: 'WITHIN DELETE SA PDU DATA FIELD', cells: [
    { id: 'dsspi', l: 'SPI', w: 2 } ] },
  epdata_setarsn: { title: 'WITHIN SET ARSN PDU DATA FIELD', cells: [
    { id: 'saraspi', l: 'SPI', w: 2 }, { id: 'sarval', l: 'NEW ARSN', w: 4 } ] },
  epdata_setarsnw: { title: 'WITHIN SET ARSN WINDOW PDU DATA FIELD', cells: [
    { id: 'sarwspi', l: 'SPI', w: 2 }, { id: 'sarwval', l: 'NEW ARSN WINDOW', w: 4 } ] },
  epdata_sastat: { title: 'WITHIN SA STATUS REQUEST PDU DATA FIELD', cells: [
    { id: 'ssqspi', l: 'SPI', w: 2 } ] },
  epdata_sastatrep: { title: 'WITHIN SA STATUS REQUEST REPLY PDU DATA FIELD', cells: [
    { id: 'ssrspi', l: 'SPI', w: 2 }, { id: 'ssrdir', l: 'STATE TRANSITION DIRECTIVE', w: 4 } ] },
  epdata_readarsn: { title: 'WITHIN READ ARSN PDU DATA FIELD', cells: [
    { id: 'rdspi', l: 'SPI', w: 2 } ] },
  epdata_readarsnrep: { title: 'WITHIN READ ARSN REPLY PDU DATA FIELD', cells: [
    { id: 'rdarsnval', l: 'ARSN VALUE', w: 4 } ] },
  epdata_ping: { title: 'PING COMMAND PDU — NO DATA FIELD', cells: [] },
  epdata_pingrep: { title: 'PING REPLY PDU — NO DATA FIELD', cells: [] },
  epdata_logstat: { title: 'LOG STATUS COMMAND PDU — NO DATA FIELD', cells: [] },
  epdata_logstatrep: { title: 'WITHIN LOG STATUS REPLY PDU DATA FIELD', cells: [
    { id: 'lsevents', l: 'NUMBER OF EVENTS', w: 3 }, { id: 'lsspace', l: 'REMAINING SPACE', w: 3 } ] },
  epdata_dumplog: { title: 'DUMP LOG COMMAND PDU — NO DATA FIELD', cells: [] },
  epdata_dumplogrep: { title: 'WITHIN DUMP LOG REPLY PDU DATA FIELD', cells: [
    { id: 'dltag', l: 'EVENT MSG TAG', w: 2 }, { id: 'dllen', l: 'EVENT MSG LENGTH', w: 2 }, { id: 'dlval', l: 'EVENT MESSAGE', w: 5 } ] },
  epdata_eraselog: { title: 'ERASE LOG COMMAND PDU — NO DATA FIELD', cells: [] },
  epdata_eraselogrep: { title: 'WITHIN ERASE LOG REPLY PDU DATA FIELD', cells: [
    { id: 'elevents', l: 'NUMBER OF EVENTS', w: 3 }, { id: 'elspace', l: 'REMAINING SPACE', w: 3 } ] },
  epdata_selftest: { title: 'SELF-TEST COMMAND PDU — NO DATA FIELD', cells: [] },
  epdata_selftestrep: { title: 'WITHIN SELF-TEST REPLY PDU DATA FIELD', cells: [
    { id: 'stresult', l: 'SELF-TEST RESULT', w: 1 } ] },
  epdata_alarmreset: { title: 'ALARM FLAG RESET COMMAND PDU — NO DATA FIELD', cells: [] }
};

const SDLS_EP_CRUMBS = {
  epframe: 'EXTENDED PROCEDURES PDU',
  ephdr: 'PDU HEADER',
  eptag: 'EXT. PROC. TAG',
  epdata_otar: 'OTAR DATA FIELD',
  epdata_keyact: 'KEY ACT. DATA FIELD',
  epdata_keydeact: 'KEY DEACT. DATA FIELD',
  epdata_keydestr: 'KEY DESTR. DATA FIELD',
  epdata_keyver: 'KEY VERIF. DATA FIELD',
  epdata_keyverrep: 'KEY VERIF. REPLY DATA FIELD',
  epdata_keyinv: 'KEY INV. DATA FIELD',
  epdata_keyinvrep: 'KEY INV. REPLY DATA FIELD',
  epdata_startsa: 'START SA DATA FIELD',
  epdata_stopsa: 'STOP SA DATA FIELD',
  epdata_rekeysa: 'REKEY SA DATA FIELD',
  epdata_expiresa: 'EXPIRE SA DATA FIELD',
  epdata_createsa: 'CREATE SA DATA FIELD',
  epdata_deletesa: 'DELETE SA DATA FIELD',
  epdata_setarsn: 'SET ARSN DATA FIELD',
  epdata_setarsnw: 'SET ARSN WINDOW DATA FIELD',
  epdata_sastat: 'SA STATUS DATA FIELD',
  epdata_sastatrep: 'SA STATUS REPLY DATA FIELD',
  epdata_readarsn: 'READ ARSN DATA FIELD',
  epdata_readarsnrep: 'READ ARSN REPLY DATA FIELD',
  epdata_ping: 'PING DATA FIELD',
  epdata_pingrep: 'PING REPLY DATA FIELD',
  epdata_logstat: 'LOG STATUS DATA FIELD',
  epdata_logstatrep: 'LOG STATUS REPLY DATA FIELD',
  epdata_dumplog: 'DUMP LOG DATA FIELD',
  epdata_dumplogrep: 'DUMP LOG REPLY DATA FIELD',
  epdata_eraselog: 'ERASE LOG DATA FIELD',
  epdata_eraselogrep: 'ERASE LOG REPLY DATA FIELD',
  epdata_selftest: 'SELF-TEST DATA FIELD',
  epdata_selftestrep: 'SELF-TEST REPLY DATA FIELD',
  epdata_alarmreset: 'ALARM FLAG RESET DATA FIELD'
};
