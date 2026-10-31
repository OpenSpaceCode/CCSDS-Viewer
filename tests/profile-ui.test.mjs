// Mission profile in the page: storage, the profile page, and its use by the Decoder, Builder and diagrams.
import { test, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { loadComponent, loadSrc } from './load.mjs';

const Component = loadComponent();
const { profileNew, profileSet, profileToJson } = loadSrc(['lib/bits.js', 'protocols/sdls.js', 'lib/profile.js'], ['profileNew', 'profileSet', 'profileToJson']);
const KEY = 'ccsds-viewer.mission-profile';
let local;

beforeEach(() => {
  local = {};
  globalThis.localStorage = { getItem: (k) => (k in local ? local[k] : null), setItem: (k, v) => { local[k] = v; }, removeItem: (k) => { delete local[k]; } };
});
afterEach(() => { delete globalThis.localStorage; });

const mission = (changes = {}) => Object.entries(changes).reduce((p, [k, v]) => profileSet(p, k, v), { ...profileNew(), name: 'Sentinel-X', scid: 77 });
const SECURED = { 'tm.frameLen': 100, 'tm.secondaryHeaderLen': 8, 'tm.ocf': true, 'tm.sdls.service': 'authenticated-encryption', 'tc.sdls.service': 'authentication', 'spp.timeCodeLen': 4 };
const page = (profile, state = {}) => {
  if (profile) local[KEY] = profileToJson(profile);
  const c = new Component({});
  c.state = { ...c.state, ...state };
  return c;
};
const on = (profile, state = {}) => page(profile, { profileOn: true, ...state });
const v = (c) => c.renderVals();
const rowOf = (view, path) => view.pSections.flatMap(s => s.rows).find(r => r.path === path);
const settingOf = (view, id) => view.dSettingsList.find(s => s.id === id);
const msgs = (view) => view.dChecks.map(c => c.msg);
const problems = (view) => view.dChecks.filter(c => c.label === 'ERROR' || c.label === 'WARN').map(c => c.msg);
const fieldRow = (view, fid) => view.dFields.find(f => f.fid === fid);

// ---- storage

test('with nothing stored there is no profile, and it cannot be switched on', () => {
  const c = new Component({});
  assert.equal(c.state.profile, null);
  v(c).pBarProfile();
  assert.equal(c.state.profileOn, false);
  assert.equal(v(c).pNone, true);
  assert.equal(v(c).pSubtitle, 'Not defined');
});

test('a stored profile is loaded on start, but Manual stays the default', () => {
  const c = page(mission());
  assert.equal(c.state.profile.name, 'Sentinel-X');
  assert.equal(c.state.profileOn, false);
  assert.equal(v(c).pSubtitle, 'Sentinel-X');
});

test('damaged or foreign stored data is ignored', () => {
  for (const raw of ['{not json', '{}', '{"format":"other"}', '[]']) {
    local[KEY] = raw;
    assert.equal(new Component({}).state.profile, null, raw);
  }
});

test('a browser without storage still works, and says the profile will not be kept', () => {
  delete globalThis.localStorage;
  const c = new Component({});
  assert.equal(c.state.profile, null);
  v(c).pCreate();
  assert.ok(c.state.profile);
  assert.equal(v(c).pStoreFailed, true);
});

// ---- the profile page

test('create, edit and delete all reach storage', () => {
  const c = new Component({});
  c.state = { ...c.state, view: 'profile' };
  v(c).pCreate();
  assert.equal(JSON.parse(local[KEY]).name, 'New mission');
  rowOf(v(c), 'name').onInput({ target: { value: 'Sentinel-X' } });
  rowOf(v(c), 'scid').onInput({ target: { value: '77' } });
  rowOf(v(c), 'tm.ocf').onInput({ target: { value: 'true' } });
  rowOf(v(c), 'tm.sdls.service').onInput({ target: { value: 'encryption' } });
  const saved = JSON.parse(local[KEY]);
  assert.deepEqual([saved.name, saved.scid, saved.tm.ocf, saved.tm.sdls.service], ['Sentinel-X', 77, true, 'encryption']);
  assert.equal(new Component({}).state.profile.scid, 77, 'a later start finds it');
  globalThis.confirm = () => true;
  try { v(c).pDelete(); } finally { delete globalThis.confirm; }
  assert.equal(local[KEY], undefined);
  assert.equal(c.state.profile, null);
});

test('deleting asks first, and asks by name', () => {
  const c = page(mission(), { view: 'profile' });
  let asked = '';
  globalThis.confirm = (m) => { asked = m; return false; };
  try { v(c).pDelete(); } finally { delete globalThis.confirm; }
  assert.match(asked, /Sentinel-X/);
  assert.ok(c.state.profile, 'declined');
});

test('deleting the profile in use goes back to Manual', () => {
  const c = on(mission(), { view: 'profile' });
  globalThis.confirm = () => true;
  try { v(c).pDelete(); } finally { delete globalThis.confirm; }
  assert.equal(c.state.profileOn, false);
  assert.ok(v(c).dSettingsList.every(s => !s.isFixed));
});

test('an unacceptable value stays as a draft and never reaches the profile', () => {
  const c = page(mission(), { view: 'profile' });
  rowOf(v(c), 'scid').onInput({ target: { value: '2000' } });
  assert.equal(c.state.profile.scid, 77);
  assert.equal(JSON.parse(local[KEY]).scid, 77);
  assert.equal(rowOf(v(c), 'scid').value, '2000', 'what was typed stays visible');
  assert.match(rowOf(v(c), 'scid').err, /must be 0–1023, so the profile keeps 77/);
  rowOf(v(c), 'scid').onInput({ target: { value: '' } });
  assert.equal(c.state.profile.scid, 77, 'empty, while retyping');
  rowOf(v(c), 'scid').onInput({ target: { value: '100' } });
  assert.equal(c.state.profile.scid, 100);
  assert.equal(rowOf(v(c), 'scid').hasErr, false);
});

test('SDLS lengths only show when a service is selected', () => {
  const c = page(mission(), { view: 'profile' });
  assert.equal(rowOf(v(c), 'tm.sdls.iv'), undefined);
  rowOf(v(c), 'tm.sdls.service').onInput({ target: { value: 'authentication' } });
  assert.ok(rowOf(v(c), 'tm.sdls.iv'));
  assert.equal(rowOf(v(c), 'tc.sdls.iv'), undefined, 'each link has its own');
});

test('the page shows the resulting layout, and what does not hang together', () => {
  const c = page(mission(SECURED), { view: 'profile' });
  const tm = v(c).pLayouts.find(l => l.name === 'TM TRANSFER FRAME');
  assert.ok(tm.rows.some(r => r.n === 'Frame Data' && r.label === '50 OCTETS · 28–77'));
  assert.match(tm.cov, /MAC covers octets 0–77/);
  assert.equal(v(c).pHasWarnings, false);
  const bad = page(mission({ 'tm.sdls.service': 'encryption', 'tm.sdls.sn': 2 }), { view: 'profile' });
  assert.equal(v(bad).pHasWarnings, true);
});

test('import: a good file replaces the profile; a bad one changes nothing', () => {
  const c = page(mission(), { view: 'profile' });
  c.profileImportText(profileToJson(mission({ name: 'Other', scid: 5 })), 'other.json');
  assert.equal(c.state.profile.name, 'Other');
  assert.equal(JSON.parse(local[KEY]).scid, 5);
  assert.match(v(c).pMsg, /Imported ‘Other’ from other\.json/);

  c.profileImportText('{"format":"nope"}', 'bad.json');
  assert.equal(c.state.profile.name, 'Other');
  assert.equal(JSON.parse(local[KEY]).name, 'Other');
  assert.equal(v(c).pHasErrors, true);
  assert.match(v(c).pErrors[0].t, /not a mission profile/);
  c.profileImportText(profileToJson(mission({ name: 'Third' })), 'third.json');
  assert.equal(v(c).pHasErrors, false, 'errors clear on the next good import');
});

test('import also clears drafts typed before it', () => {
  const c = page(mission(), { view: 'profile' });
  rowOf(v(c), 'scid').onInput({ target: { value: '2000' } });
  c.profileImportText(profileToJson(mission({ scid: 5 })), 'x.json');
  assert.equal(rowOf(v(c), 'scid').value, '5');
});

test('the switch is offered on the Builder and Decoder only', () => {
  const show = (view) => v(page(mission(), { view })).pBarShow;
  for (const view of ['build', 'decode']) assert.equal(show(view), true, view);
  for (const view of ['diagram', 'cheat', 'field', 'ep', 'profile']) assert.equal(show(view), false, view);
});

// ---- decoder

test('manual is untouched: its settings stay editable and are kept while the profile is on', () => {
  const c = page(mission(SECURED), { view: 'decode', dProto: 'tm', dSet: { tm: { frameLen: '40' } } });
  assert.equal(settingOf(v(c), 'frameLen').value, '40');
  assert.equal(settingOf(v(c), 'frameLen').isFixed, false);
  assert.equal(v(c).dResetShow, true);
  v(c).pBarProfile();
  assert.equal(settingOf(v(c), 'frameLen').isFixed, true);
  assert.equal(settingOf(v(c), 'frameLen').fixedLabel, '100 octets');
  assert.equal(v(c).dResetShow, false, 'nothing of the profile’s to reset here');
  v(c).pBarManual();
  assert.equal(settingOf(v(c), 'frameLen').value, '40', 'manual values came back');
});

test('with the profile on, each protocol reads its settings from it', () => {
  const c = on(mission(SECURED), { view: 'decode', dProto: 'tm' });
  assert.equal(settingOf(v(c), 'secSvc').fixedLabel, 'Authenticated Encryption');
  assert.equal(settingOf(v(c), 'secIv').fixedLabel, '12 octets', 'lengths follow the profile’s service');
  assert.equal(settingOf(v(c), 'fecf').fixedLabel, 'Present — last 2 octets are the FECF');
  assert.match(v(c).dSetNote, /mission profile ‘Sentinel-X’/);
  const tc = on(mission(SECURED), { view: 'decode', dProto: 'tc' });
  assert.equal(settingOf(v(tc), 'secSvc').fixedLabel, 'Authentication');
  assert.equal(settingOf(v(tc), 'secSn').fixedLabel, '4 octets');
  const spp = on(mission(SECURED), { view: 'decode', dProto: 'spp' });
  assert.equal(settingOf(v(spp), 'tcfLen').fixedLabel, '4 octets');
});

test('the profile changes how a frame is read', () => {
  const hex = '02 A3 11 05 18 00 AA BB CC DD 01 00 00 05';
  const manual = page(mission({ 'tm.fecf': false }), { view: 'decode', dProto: 'tm', dHex: { tm: hex } });
  assert.ok(msgs(v(manual)).some(m => /Frame Error Control Field mismatch/.test(m)), 'manual default: FECF present');
  const profile = on(mission({ scid: 42, 'tm.fecf': false, 'tm.ocf': true }), { view: 'decode', dProto: 'tm', dHex: { tm: hex } });
  assert.deepEqual(problems(v(profile)), [], 'profile: FECF absent');
  assert.equal(v(profile).dSummary, 'VALID TM TRANSFER FRAME');
});

test('a TM frame is compared with what the profile says', () => {
  const hex = '02 A3 11 05 18 00 AA BB CC DD 01 00 00 05 12 34';
  const problemsFor = (changes) => problems(v(on(mission({ scid: 42, 'tm.ocf': true, ...changes }), { view: 'decode', dProto: 'tm', dHex: { tm: hex } }))).filter(m => /mission profile/.test(m));
  assert.deepEqual(problemsFor({}), []);
  assert.match(problemsFor({ scid: 99 })[0], /Spacecraft Identifier is 42, but the mission profile says 99/);
  assert.match(problemsFor({ 'tm.ocf': false })[0], /OCF is absent/);
  assert.match(problemsFor({ 'tm.secondaryHeaderLen': 8 })[0], /has no Secondary Header, but the mission profile says 8 octets/);
  const withSh = '02 A3 11 05 98 00 02 A1 B2 AA BB 01 00 00 05 12 34';
  const sh = (len) => problems(v(on(mission({ scid: 42, 'tm.ocf': true, 'tm.secondaryHeaderLen': len }), { view: 'decode', dProto: 'tm', dHex: { tm: withSh } }))).filter(m => /mission profile/.test(m));
  assert.deepEqual(sh(3), []);
  assert.match(sh(4)[0], /has a Secondary Header of 3 octets, but the mission profile says 4/);
  assert.match(sh(0)[0], /says none/);
});

test('a TC frame is compared with the profile’s SCID; manual mode never compares', () => {
  const hex = '20 2A 04 13 00 C5 11 A2 C0 2A 00 05 A1 B2 C3 D4 E5 F6 87 4D';
  assert.ok(problems(v(on(mission({ scid: 99 }), { view: 'decode', dProto: 'tc', dHex: { tc: hex } }))).some(m => /Spacecraft Identifier is 42, but the mission profile says 99/.test(m)));
  assert.deepEqual(problems(v(on(mission({ scid: 42 }), { view: 'decode', dProto: 'tc', dHex: { tc: hex } }))), []);
  assert.deepEqual(problems(v(page(mission({ scid: 99 }), { view: 'decode', dProto: 'tc', dHex: { tc: hex } }))), []);
});

test('loading an example goes back to Manual, as examples bring their own settings', () => {
  const c = on(mission(SECURED), { view: 'decode', dProto: 'tm' });
  assert.equal(v(c).dHasExampleNote, true);
  v(c).dExamples.find(x => x.l === 'Packets · OCF').onClick();
  assert.equal(c.state.profileOn, false);
  assert.equal(v(c).dSummary, 'VALID TM TRANSFER FRAME');
});

// ---- builder

test('the Builder starts from the profile', () => {
  const c = on(mission({ scid: 77, ...SECURED }), { view: 'build', bProto: 'tm' });
  const view = v(c);
  assert.equal(view.bFieldList.find(f => f.id === 'scid').value, '77');
  assert.equal(view.bFieldList.find(f => f.id === 'ocff').value, '1');
  assert.equal(view.bFieldList.find(f => f.id === 'shf').value, '1');
  assert.equal(view.bTotalLabel, '800 BITS · 100 OCTETS', 'the Data Field fills the fixed frame');
  assert.equal(view.bHasProfileNote, false);
});

test('Builder values entered under each mode do not mix', () => {
  const c = page(mission({ scid: 77 }), { view: 'build', bProto: 'tm', bVals: { tm: { scid: '5' } } });
  const scid = () => v(c).bFieldList.find(f => f.id === 'scid');
  assert.equal(scid().value, '5');
  v(c).pBarProfile();
  assert.equal(scid().value, '77', 'the manual value does not cover the profile');
  scid().onChange({ target: { value: '78' } });
  assert.equal(scid().value, '78', 'it can still be changed');
  v(c).pBarManual();
  assert.equal(scid().value, '5');
  v(c).pBarProfile();
  assert.equal(scid().value, '78');
  v(c).bReset();
  assert.equal(scid().value, '77', 'RESET returns to the profile');
  v(c).pBarManual();
  assert.equal(scid().value, '5', 'and leaves manual alone');
});

test('the Builder says when the frame no longer fits the profile', () => {
  const c = on(mission({ 'tm.frameLen': 100 }), { view: 'build', bProto: 'tm' });
  assert.equal(v(c).bHasProfileNote, false);
  c.bSetVal('payload__oct', '10');
  assert.match(v(c).bProfileNote, /fixes this frame at 100 octets; it is now 18/);
  const tc = on(mission({ 'tc.maxFrameLen': 20 }), { view: 'build', bProto: 'tc' });
  tc.bSetVal('payload__oct', '50');
  assert.match(v(tc).bProfileNote, /at most 20 octets/);
});

test('round trip under one profile: what the Builder makes from it, the Decoder accepts', () => {
  const p = mission({ scid: 77, ...SECURED, 'spp.ancillaryLen': 3 });
  const roundTrip = (proto, name) => {
    const b = on(p, { view: 'build', bProto: proto, bVals: { [proto + '@profile']: proto === 'tm' ? {} : { payload__oct: '4', payload: 'CAFEF00D' } } });
    const d = on(p, { view: 'decode', dProto: proto, dHex: { [proto]: v(b).bHex } });
    assert.deepEqual(problems(v(d)), [], proto);
    assert.equal(v(d).dSummary, 'VALID ' + name, proto);
    return v(d);
  };
  const tm = roundTrip('tm', 'TM TRANSFER FRAME');
  assert.equal(fieldRow(tm, 'scid').value, '77');
  assert.ok(fieldRow(tm, 'iv') && fieldRow(tm, 'mac') && fieldRow(tm, 'ocf') && fieldRow(tm, 'fecf') && fieldRow(tm, 'shdf'));
  const tc = roundTrip('tc', 'TC TRANSFER FRAME');
  assert.ok(fieldRow(tc, 'sqn') && fieldRow(tc, 'tcsqf'));
  const spp = roundTrip('spp', 'SPACE PACKET');
  assert.ok(fieldRow(spp, 'sptc') && fieldRow(spp, 'spad') && fieldRow(spp, 'spud'));
});

test('a Data Field longer than the Manual limit is only for a frame the profile fixes', () => {
  assert.equal(v(page(null, { view: 'build', bProto: 'tm' })).bPayList[0].maxOct, '128');
  assert.equal(v(on(mission(), { view: 'build', bProto: 'tm' })).bPayList[0].maxOct, '2048');
});

test('a long frame: hex stays complete, while the bit view is capped and says so', () => {
  const c = on(mission({ 'tm.frameLen': 1115 }), { view: 'build', bProto: 'tm' });
  const view = v(c);
  assert.equal(view.bHex.split(' ').length, 1115);
  assert.equal(view.bBin.split(' ').length, 1115);
  assert.equal(view.bOctets.length, 256);
  assert.match(view.bWireNote, /First 256 of 1115 octets/);
  assert.equal(v(page(null, { view: 'build', bProto: 'tm' })).bWireNote, 'Transmission order — most significant bit of octet 0 first.');
});

// ---- diagrams

test('diagrams keep the Standard’s wording in Manual', () => {
  const lay = v(page(mission(SECURED))).lay;
  assert.deepEqual([lay.tmPh, lay.tmDf, lay.tcDf, lay.sppUd, lay.sdHdr, lay.sdTrl, lay.sdIv], ['6 OCTETS', 'VARIES', 'UP TO 1019 OCTETS · VARIES', 'VARIABLE', '≤ 64 OCTETS', 'MANAGED', 'MANAGED · OPTIONAL']);
  assert.equal(v(page(null)).lay.tmDf, 'VARIES');
});

test('with the profile on, diagrams show real offsets', () => {
  const lay = v(on(mission(SECURED))).lay;
  assert.equal(lay.tmPh, '6 OCTETS · 0–5');
  assert.equal(lay.tmSh, '8 OCTETS · 6–13');
  assert.equal(lay.tmDf, '50 OCTETS · 28–77');
  assert.equal(lay.tmOcf, '4 OCTETS · 94–97');
  assert.equal(lay.tmFecf, '2 OCTETS · 98–99');
  assert.equal(lay.tmShdf, '7 OCTETS');
  assert.equal(lay.tcPh, '5 OCTETS · 0–4');
  assert.equal(lay.tcTag, 'VARIABLE LENGTH · MAX 1024 OCTETS');
  assert.equal(lay.tcFecf, '2 OCTETS · END−2');
  assert.equal(lay.sppTcf, '4 OCTETS · 6–9');
  assert.equal(lay.sppAdf, 'ABSENT');
  assert.equal(lay.sppSh, '4 OCTETS · 6–9');
});

test('the SDLS diagram follows the link chosen in its coverage view', () => {
  const tm = v(on(mission(SECURED), { proto: 'sdls', sdCov: 'tm' }));
  assert.equal(tm.lay.sdHdr, '14 OCTETS · 14–27');
  assert.equal(tm.lay.sdIv, '12 OCTETS');
  assert.equal(tm.lay.sdSn, 'ABSENT');
  assert.equal(tm.lay.sdMac, '16 OCTETS');
  const tc = v(on(mission(SECURED), { proto: 'sdls', sdCov: 'tc' }));
  assert.equal(tc.lay.sdIv, 'ABSENT');
  assert.equal(tc.lay.sdSn, '4 OCTETS');
  const aos = v(on(mission(SECURED), { proto: 'sdls', sdCov: 'aos' }));
  assert.equal(aos.lay.sdIv, 'MANAGED · OPTIONAL', 'the profile has no AOS link');
});

test('the coverage view gives concrete ranges for TM and TC', () => {
  const tm = v(on(mission(SECURED), { proto: 'sdls', sdCov: 'tm' }));
  assert.equal(tm.sdCovHasRanges, true);
  assert.match(tm.sdCovRanges, /MAC covers octets 0–77.*Octets 28–77 are encrypted/);
  assert.deepEqual(tm.sdCovCells.map(c => c.len), ['6 OCTETS · 0–5', '8 OCTETS · 6–13', '14 OCTETS · 14–27', '50 OCTETS · 28–77', '16 OCTETS · 78–93', '4 OCTETS · 94–97', '2 OCTETS · 98–99']);
  const tc = v(on(mission(SECURED), { proto: 'sdls', sdCov: 'tc' }));
  assert.match(tc.sdCovRanges, /Nothing is encrypted/);
  assert.equal(tc.sdCovCells[1].len, '1 OCTET · 5');
  const aos = v(on(mission(SECURED), { proto: 'sdls', sdCov: 'aos' }));
  assert.equal(aos.sdCovHasRanges, false);
  assert.equal(aos.sdCovCells[0].len, '6–8 OCT', 'the Standard’s wording');
  const off = v(page(mission(SECURED), { proto: 'sdls', sdCov: 'tm' }));
  assert.equal(off.sdCovHasRanges, false);
  assert.equal(off.sdCovCells[3].len, 'VARIES');
});

test('the coverage bars follow the link’s service, so they cannot contradict the ranges', () => {
  const bars = (service, extra = {}) => {
    const r = v(on(mission({ 'tm.frameLen': 100, 'tm.sdls.service': service, ...extra }), { proto: 'sdls', sdCov: 'tm' }));
    return { enc: r.sdCovEnc.some(s => s.label === 'ENCRYPTED'), mac: r.sdCovMac.some(s => /--color-accent\)/.test(s.style)), aad: r.sdCovAad.some(s => /--color-accent\)/.test(s.style)) };
  };
  assert.deepEqual(bars('authenticated-encryption'), { enc: true, mac: true, aad: true });
  assert.deepEqual(bars('authentication', { 'tm.sdls.sn': 4 }), { enc: false, mac: true, aad: false });
  assert.deepEqual(bars('encryption', { 'tm.sdls.sn': 0, 'tm.sdls.mac': 0 }), { enc: true, mac: false, aad: false });
  assert.deepEqual(bars('none'), { enc: false, mac: false, aad: false });
  // Without a profile, and for links it does not cover, the view still shows what SDLS can do.
  for (const r of [v(page(null, { proto: 'sdls', sdCov: 'tm' })), v(on(mission(), { proto: 'sdls', sdCov: 'aos' }))])
    assert.ok(r.sdCovEnc.some(s => s.label === 'ENCRYPTED'));
});

test('a link without SDLS says so in the coverage view', () => {
  const r = v(on(mission(), { proto: 'sdls', sdCov: 'tm' }));
  assert.match(r.sdCovRanges, /not in use on this link/);
  assert.equal(r.sdCovCells[2].len, 'ABSENT');
});

// ---- across a refresh

test('the choice of mode survives a refresh, but not without a profile', () => {
  const store = {};
  globalThis.sessionStorage = { getItem: (k) => (k in store ? store[k] : null), setItem: (k, val) => { store[k] = val; } };
  try {
    const c = on(mission(), { view: 'profile' });
    c.sessionSave();
    const again = new Component({});
    assert.equal(again.state.profileOn, true);
    assert.equal(again.state.view, 'profile');
    delete local[KEY];
    assert.equal(new Component({}).state.profileOn, false, 'the profile has since been deleted');
  } finally { delete globalThis.sessionStorage; }
});
