// Mission profile: the managed parameters of one mission, kept in the browser and exchanged as JSON.
// PROFILE_SCHEMA drives the form, the validation and the file format, so the three cannot disagree. Pure functions over plain data.
const PROFILE_FORMAT = 'ccsds-viewer-mission-profile';
const PROFILE_VERSION = 1;
const PROFILE_KEY = 'ccsds-viewer.mission-profile';

const PROFILE_SERVICES = { none: SDLS_NONE, authentication: SDLS_AUTH, encryption: SDLS_ENC, 'authenticated-encryption': SDLS_AE };

function profileSdlsFields(link, tableRef) {
  const length = (key, n, range, note) => ({ path: link + '.sdls.' + key, n, type: 'int', min: 0, max: range[1], values: [0, ...Array.from({ length: range[1] - range[0] + 1 }, (_, i) => range[0] + i)], unit: 'octets', ref: '355.0 TABLE 6-1', note, showIf: (p) => p[link].sdls.service !== 'none' });
  return [
    { path: link + '.sdls.service', n: 'Space Data Link Security', type: 'enum', ref: tableRef, note: 'Service type of the Security Association on this link.',
      opts: [{ v: 'none', l: 'Not in use' }, { v: 'authentication', l: 'Authentication' }, { v: 'encryption', l: 'Encryption' }, { v: 'authenticated-encryption', l: 'Authenticated Encryption' }] },
    length('iv', 'Initialization Vector length', SDLS_LEN.iv, '1–32 octets, 0 = not used.'),
    length('sn', 'Sequence Number length', SDLS_LEN.sn, '2–8 octets, 0 = not used.'),
    length('pl', 'Pad Length field length', SDLS_LEN.pl, '1–2 octets, 0 = not used.'),
    length('mac', 'MAC length', SDLS_LEN.mac, '8–64 octets, 0 = no Security Trailer.')
  ];
}

const PROFILE_SCHEMA = [
  { title: 'MISSION', fields: [
    { path: 'name', n: 'Mission name', type: 'text', maxLen: 80, note: 'Shown wherever the profile is used, and names the exported file.' },
    { path: 'scid', n: 'Spacecraft Identifier', type: 'int', min: 0, max: 1023, ref: 'TABLE 5-1', note: 'Frames carrying another SCID are flagged by the decoder.' } ] },
  { title: 'TM SDLP', ref: 'CCSDS 132.0-B-3', fields: [
    { path: 'tm.frameLen', n: 'Transfer Frame Length', type: 'int', min: 0, max: 65535, unit: 'octets', ref: 'TABLE 5-1', note: 'Fixed for the Physical Channel. 0 = not set: the decoder takes the octets received, and offsets past the Data Field stay relative to the end.' },
    { path: 'tm.secondaryHeaderLen', n: 'Secondary Header length', type: 'int', min: 0, max: 64, values: [0, ...Array.from({ length: 63 }, (_, i) => i + 2)], unit: 'octets', ref: 'TABLES 5-2, 5-3', note: '2–64 octets including its identification octet, 0 = none.' },
    { path: 'tm.ocf', n: 'Presence of the Operational Control Field', type: 'bool', ref: 'TABLES 5-2, 5-3' },
    { path: 'tm.fecf', n: 'Presence of Frame Error Control', type: 'bool', ref: 'TABLE 5-1' },
    ...profileSdlsFields('tm', '132.0 TABLE 6-1') ] },
  { title: 'TC SDLP', ref: 'CCSDS 232.0-B-4', fields: [
    { path: 'tc.maxFrameLen', n: 'Maximum Transfer Frame Length', type: 'int', min: 5, max: 1024, unit: 'octets', ref: 'TABLE 5-1' },
    { path: 'tc.segmentHeader', n: 'Presence of Segment Header', type: 'bool', ref: 'TABLE 5-3' },
    { path: 'tc.fecf', n: 'Presence of Frame Error Control', type: 'bool', ref: 'TABLE 5-1' },
    ...profileSdlsFields('tc', '232.0 TABLES 6-2, 6-3') ] },
  { title: 'SPACE PACKET', ref: 'CCSDS 133.0-B-2', fields: [
    { path: 'spp.timeCodeLen', n: 'Time Code Field length', type: 'int', min: 0, max: 64, unit: 'octets', ref: '§ 4.1.4.2.2', note: '0 = no Time Code Field.' },
    { path: 'spp.ancillaryLen', n: 'Ancillary Data Field length', type: 'int', min: 0, max: 256, unit: 'octets', ref: '§ 4.1.4.2.3', note: '0 = no Ancillary Data Field. With both at 0, packets have no Secondary Header.' },
    { path: 'spp.maxPacketLen', n: 'Maximum Packet Length', type: 'int', min: 7, max: 65542, unit: 'octets', ref: 'TABLE 5-1' } ] }
];

const PROFILE_FIELDS = PROFILE_SCHEMA.flatMap(s => s.fields);

// A blank profile starts from what the Standards leave open as simply as possible, with the annex E baselines for SDLS.
function profileNew() {
  return { name: 'New mission', scid: 0,
    tm: { frameLen: 0, secondaryHeaderLen: 0, ocf: false, fecf: true, sdls: { service: 'none', iv: 12, sn: 0, pl: 0, mac: 16 } },
    tc: { maxFrameLen: 1024, segmentHeader: true, fecf: true, sdls: { service: 'none', iv: 0, sn: 4, pl: 0, mac: 16 } },
    spp: { timeCodeLen: 0, ancillaryLen: 0, maxPacketLen: 65542 } };
}

function profileGet(obj, path) { return path.split('.').reduce((o, k) => (o === null || o === undefined ? undefined : o[k]), obj); }

function profileSet(obj, path, value) {
  const keys = path.split('.'), last = keys.pop();
  const copy = { ...obj };
  let cur = copy;
  for (const k of keys) { cur[k] = { ...cur[k] }; cur = cur[k]; }
  cur[last] = value;
  return copy;
}

// Why this value is not acceptable for this field, or '' if it is.
function profileFieldError(f, v) {
  if (f.type === 'text') return typeof v !== 'string' ? 'must be text' : !v.trim() ? 'must not be empty' : v.length > f.maxLen ? 'is longer than ' + f.maxLen + ' characters' : '';
  if (f.type === 'bool') return typeof v === 'boolean' ? '' : 'must be true or false';
  if (f.type === 'enum') return f.opts.some(o => o.v === v) ? '' : 'must be one of: ' + f.opts.map(o => o.v).join(', ');
  if (typeof v !== 'number' || !Number.isInteger(v)) return 'must be a whole number';
  if (v < f.min || v > f.max) return 'must be ' + f.min + '–' + f.max;
  if (f.values && !f.values.includes(v)) return 'cannot be ' + v + ': allowed are 0 and ' + f.values[1] + '–' + f.max;
  return '';
}

// Checks a parsed file. Everything is required: a field silently defaulted could change how every frame of a mission is read.
function profileValidate(data) {
  if (!data || typeof data !== 'object' || Array.isArray(data)) return { profile: null, errors: ['The file does not hold a JSON object.'] };
  if (data.format !== PROFILE_FORMAT) return { profile: null, errors: ['This is not a mission profile: "format" should be "' + PROFILE_FORMAT + '".'] };
  if (data.version !== PROFILE_VERSION) return { profile: null, errors: ['Unsupported profile version ' + JSON.stringify(data.version) + ': this viewer reads version ' + PROFILE_VERSION + '.'] };
  const errors = [];
  let profile = profileNew();
  for (const f of PROFILE_FIELDS) {
    const v = profileGet(data, f.path);
    if (v === undefined) { errors.push(f.path + ' is missing.'); continue; }
    const err = profileFieldError(f, v);
    if (err) errors.push(f.path + ' ' + err + '.');
    else profile = profileSet(profile, f.path, v);
  }
  return errors.length ? { profile: null, errors } : { profile, errors: [] };
}

function profileToJson(profile) {
  return JSON.stringify({ format: PROFILE_FORMAT, version: PROFILE_VERSION, ...profile }, null, 2) + '\n';
}

function profileParse(text) {
  let data;
  try {
    data = JSON.parse(text);
  } catch (e) {
    return { profile: null, errors: ['The file is not valid JSON: ' + e.message] };
  }
  return profileValidate(data);
}

function profileFileName(profile) {
  const slug = profile.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  return (slug || 'mission') + '.mission-profile.json';
}

function profileLoad() {
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    return raw ? profileParse(raw).profile : null;
  } catch (e) {
    return null;
  }
}

// false if the browser would not keep it, so the page can say that it will be lost.
function profileStore(profile) {
  try {
    if (profile) localStorage.setItem(PROFILE_KEY, profileToJson(profile));
    else localStorage.removeItem(PROFILE_KEY);
    return true;
  } catch (e) {
    return false;
  }
}

function profileSdlsSet(s) {
  return { secSvc: PROFILE_SERVICES[s.service], secIv: s.iv, secSn: s.sn, secPl: s.pl, secMac: s.mac };
}

// Decoder settings for a protocol. expect holds what the frame signals itself, to be compared with what the mission says.
function profileSettings(p, proto) {
  if (proto === 'tm') return { frameLen: p.tm.frameLen, fecf: p.tm.fecf ? 1 : 0, ...profileSdlsSet(p.tm.sdls), expect: { scid: p.scid, ocf: p.tm.ocf, shLen: p.tm.secondaryHeaderLen } };
  if (proto === 'tc') return { fecf: p.tc.fecf ? 1 : 0, seg: p.tc.segmentHeader ? 1 : 0, maxLen: p.tc.maxFrameLen, ...profileSdlsSet(p.tc.sdls), expect: { scid: p.scid } };
  return { tcfLen: p.spp.timeCodeLen, adfLen: p.spp.ancillaryLen, maxLen: p.spp.maxPacketLen };
}

// One protocol's layout, with real octet offsets. Fields after a Data Field of unknown length are placed by their distance from
// the end. Data Fields without a fixed length report the most the mission allows (upTo), or null when nothing bounds them.
function profileLayout(p, proto) {
  const sdls = (s) => {
    const set = profileSdlsSet(s), on = set.secSvc !== SDLS_NONE;
    return { hdr: on ? 2 + s.iv + s.sn + s.pl : 0, trl: on ? s.mac : 0, on, spi: on ? 2 : 0, iv: on ? s.iv : 0, sn: on ? s.sn : 0, pl: on ? s.pl : 0, encrypted: on && set.secSvc !== SDLS_AUTH, authenticated: on && set.secSvc !== SDLS_ENC };
  };
  const place = (head, dataKey, dataName, tail, total, upTo) => {
    const fields = [];
    let at = 0;
    for (const [key, n, len] of head) { fields.push({ key, n, len, from: len ? at : null, to: len ? at + len - 1 : null }); at += len; }
    const tailLen = tail.reduce((sum, t) => sum + t[2], 0);
    const room = total === null ? null : total - at - tailLen;
    fields.push({ key: dataKey, n: dataName, len: room, from: at, to: room === null || room < 1 ? null : at + room - 1, upTo });
    let fromEnd = tailLen;
    for (const [key, n, len] of tail) {
      const fixed = total !== null && !upTo && room !== null && room >= 0;
      const from = fixed ? total - fromEnd : null;
      fields.push({ key, n, len, from: len && fixed ? from : null, to: len && fixed ? from + len - 1 : null, fromEnd: len ? fromEnd : null });
      fromEnd -= len;
    }
    return { fields, dataRoom: room, dataFrom: at, tooSmall: room !== null && room < 1 };
  };
  if (proto === 'tm') {
    const s = sdls(p.tm.sdls);
    const out = place([['ph', 'Primary Header', 6], ['sh', 'Secondary Header', p.tm.secondaryHeaderLen], ['sech', 'Security Header', s.hdr]], 'data', 'Frame Data', [['sect', 'Security Trailer', s.trl], ['ocf', 'Operational Control Field', p.tm.ocf ? 4 : 0], ['fecf', 'Frame Error Control Field', p.tm.fecf ? 2 : 0]], p.tm.frameLen || null, false);
    return { ...out, sdls: s };
  }
  if (proto === 'tc') {
    const s = sdls(p.tc.sdls);
    const out = place([['ph', 'Primary Header', 5], ['seg', 'Segment Header', p.tc.segmentHeader ? 1 : 0], ['sech', 'Security Header', s.hdr]], 'data', 'Frame Data', [['sect', 'Security Trailer', s.trl], ['fecf', 'Frame Error Control Field', p.tc.fecf ? 2 : 0]], p.tc.maxFrameLen, true);
    return { ...out, sdls: s };
  }
  return place([['ph', 'Primary Header', 6], ['tcf', 'Time Code Field', p.spp.timeCodeLen], ['adf', 'Ancillary Data Field', p.spp.ancillaryLen]], 'data', 'User Data Field', [], p.spp.maxPacketLen, true);
}

// A field's place in the layout, as a short label for the diagrams.
function profileFieldLabel(f) {
  const span = f.from === f.to ? f.from : f.from + '–' + f.to;
  if (!f.len && f.fromEnd === undefined && f.upTo === undefined && f.from === null) return 'ABSENT';
  if (f.key === 'data' || f.upTo !== undefined) {
    if (f.len === null) return 'VARIES · FROM ' + f.from;
    if (f.len < 1) return 'NO ROOM';
    return f.upTo ? 'UP TO ' + oct(f.len).toUpperCase() + ' · FROM ' + f.from : oct(f.len).toUpperCase() + ' · ' + span;
  }
  if (!f.len) return 'ABSENT';
  return f.from !== null ? oct(f.len).toUpperCase() + ' · ' + span : oct(f.len).toUpperCase() + ' · END−' + f.fromEnd;
}

// Frame values for the Builder when it starts from the profile. Strings, as entered values are.
function profileBuildValues(p, proto) {
  const sdls = (s) => ({ secSvc: String(PROFILE_SERVICES[s.service]), secIv__oct: String(s.iv), secSn__oct: String(s.sn), secPl__oct: String(s.pl), secMac__oct: String(s.mac) });
  if (proto === 'tm') {
    const room = profileLayout(p, 'tm').dataRoom;
    return { scid: String(p.scid), ocff: p.tm.ocf ? '1' : '0', fecfOn: p.tm.fecf ? '1' : '0', shf: p.tm.secondaryHeaderLen ? '1' : '0',
      ...(p.tm.secondaryHeaderLen ? { shdf__oct: String(p.tm.secondaryHeaderLen - 1) } : {}), ...(room > 0 ? { payload__oct: String(room) } : {}), ...sdls(p.tm.sdls) };
  }
  if (proto === 'tc') return { tcscid: String(p.scid), seg: p.tc.segmentHeader ? '1' : '0', fecfOn: p.tc.fecf ? '1' : '0', ...sdls(p.tc.sdls) };
  const secondary = p.spp.timeCodeLen + p.spp.ancillaryLen > 0;
  return { pshf: secondary ? '1' : '0', sptcf__oct: String(p.spp.timeCodeLen), spadf__oct: String(p.spp.ancillaryLen) };
}

// How the frame the Builder has made compares with what the mission fixes. '' if it fits.
function profileFrameNote(p, proto, octets) {
  if (proto === 'tm' && p.tm.frameLen && octets !== p.tm.frameLen) return 'The profile fixes this frame at ' + oct(p.tm.frameLen) + '; it is now ' + octets + '.';
  if (proto === 'tc' && octets > p.tc.maxFrameLen) return 'The profile allows at most ' + oct(p.tc.maxFrameLen) + '; this frame is ' + octets + '.';
  if (proto === 'spp' && octets > p.spp.maxPacketLen) return 'The profile allows at most ' + oct(p.spp.maxPacketLen) + '; this packet is ' + octets + '.';
  return '';
}

// What is valid field by field but does not hang together. Reported, not rejected: the decoder reports the same on each frame.
function profileWarnings(p) {
  const out = [];
  for (const [link, label] of [['tm', 'TM'], ['tc', 'TC']]) {
    if (p[link].sdls.service !== 'none') sdlsCheckSettings((level, msg, ref) => out.push({ msg: label + ': ' + msg, ref }), profileSdlsSet(p[link].sdls));
    if (profileLayout(p, link).tooSmall) out.push({ msg: label + ': the frame length leaves no room for a Data Field.', ref: link === 'tm' ? '§ 4.1.4.2' : '§ 4.1.1' });
  }
  if (profileLayout(p, 'spp').tooSmall) out.push({ msg: 'Space Packet: the maximum length leaves no room for data.', ref: '§ 4.1.2.2' });
  return out;
}

// SDLS coverage of one link in octets: what the MAC covers and what is encrypted (355.0 figures 5-1, 5-2).
function profileCoverage(p, link) {
  const lay = profileLayout(p, link), s = lay.sdls;
  if (!s.on) return { on: false, text: 'SDLS is not in use on this link in the profile, so nothing here is authenticated or encrypted.' };
  const data = lay.fields.find(f => f.key === 'data');
  if (data.len === null) return { on: true, text: 'Frame Data starts at octet ' + data.from + '. Set the Transfer Frame Length in the profile to get its end.' };
  if (data.len < 1) return { on: true, text: 'The frame length leaves no room for Frame Data.' };
  const qualifier = data.upTo ? ' at the maximum frame length' : '';
  const parts = [];
  if (s.authenticated) parts.push('The MAC covers octets 0–' + data.to + ', less any bits zeroed by the authentication mask.');
  if (s.encrypted) parts.push('Octets ' + data.from + '–' + data.to + ' are encrypted.');
  if (!s.encrypted) parts.push('Nothing is encrypted.');
  if (!s.authenticated) parts.push('Nothing is authenticated.');
  return { on: true, text: parts.join(' ') + (qualifier ? ' Offsets are' + qualifier + '.' : '') };
}
