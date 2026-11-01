class Component extends DCLogic {
  state = { proto: 'spp', view: 'diagram', fid: null, phOpen: null, shOpen: null, dfsOpen: null, tcPhOpen: null, tcDfOpen: null, spPhOpen: null, spShOpen: null, sdShOpen: null, sdTrOpen: null, dfsModal: false, epOpen: false, epId: null, epHdrOpen: null, epDataOpen: null, tip: null, bProto: 'spp', bVals: {}, sdCov: 'tm', dProto: 'spp', dHex: {}, dSet: {}, retView: null, qOpen: false, qText: '', qIdx: 0, cProto: 'spp', profile: null, profileOn: false, pDraft: {}, pMsg: '', pErrors: [], pStoreFailed: false };

  // Which part of each base frame SDLS authenticates and encrypts — see protocols/sdls.js.
  SDLS_COV_ORDER = SDLS_COVERAGE_ORDER;
  SDLS_COV = SDLS_COVERAGE;

  covSeg(c, i, last, kind, label) {
    const base = 'min-width:0;height:26px;display:flex;align-items:center;justify-content:center;text-align:center;overflow:hidden;white-space:nowrap;font-family:var(--font-heading);font-weight:600;font-size:8.5px;letter-spacing:.11em;'
      + 'border-left:1px solid transparent;border-right:1px solid transparent;' + (i ? 'margin-left:-1px;' : '');
    if (kind === 'fill') return { style: base + 'background:var(--color-accent);color:var(--color-bg)', label: label || '', title: '' };
    if (kind === 'deep') return { style: base + 'background:var(--color-accent-900);color:var(--color-bg)', label: label || '', title: '' };
    if (kind === 'mask') return { style: base + 'background:repeating-linear-gradient(45deg,var(--color-accent-200) 0 5px,var(--color-bg) 5px 10px);box-shadow:inset 0 1px 0 var(--color-accent),inset 0 -1px 0 var(--color-accent)', label: '', title: label || '' };
    return { style: base + 'background:transparent;color:var(--color-neutral-500)', label: '', title: '' };
  }

  BUILD_SPECS = { tm: TM_BUILD, tc: TC_BUILD, spp: SPP_BUILD };

  BUILD_ORDER = ['tm', 'tc', 'spp'];
  BUILD_WIRE_MAX = 256;

  // Frame Error Control Field of the TM and TC builders. The frame does not signal its presence, and its value is the CRC of
  // everything before it, which only exists once the rest is assembled. It can be overridden, to build a frame with a bad CRC.
  BUILD_FECF_SETTING = { id: 'fecfOn', n: 'Presence of Frame Error Control', abbr: 'FEC', bits: 0, def: 1, setting: true, opts: [{ v: 1, l: 'Present' }, { v: 0, l: 'Absent' }] };
  BUILD_FECF_FIELD = { id: 'fecf', n: 'Frame Error Control Field', bits: 16, def: 0, abbr: 'FECF', kind: 'hex', overridable: true, deriveNote: 'CRC of the frame',
    derive: (vals) => (vals.__crc || 0).toString(16).toUpperCase().padStart(4, '0'),
    overrideNote: (want) => 'Differs from the computed CRC, 0x' + want + ': a receiver will reject this frame.' };
  BUILD_FECF_NOTE = 'CRC-16 with G(X) = X¹⁶ + X¹² + X⁵ + 1, the register preset to all ones, computed over every octet before it. It updates as the frame changes.';
  BUILD_FECF_OFF = 'Management has established no Frame Error Control on this Physical Channel, so no FECF is transmitted.';

  bTint(i) {
    const t = ['46%', '20%', '68%', '32%'];
    return 'color-mix(in srgb, var(--color-accent) ' + t[i % 4] + ', var(--color-bg))';
  }

  // Length in octets of a variable field. With octValues, only those lengths exist: others move up to the next allowed one.
  bFieldOct(f, vals) {
    const raw = vals[f.id + '__oct'];
    const n = Number(raw === undefined || raw === '' ? f.defOct : raw);
    const o = isFinite(n) && n >= 0 ? n : f.defOct;
    if (!f.octValues) return Math.min(o, f.maxOct);
    const up = f.octValues.find(v => v >= o);
    return up === undefined ? f.maxOct : up;
  }

  bFieldBits(f, vals) { return f.varOct ? this.bFieldOct(f, vals) * 8 : f.bits; }

  bHexClean(s) { return String(s == null ? '' : s).replace(/[^0-9a-fA-F]/g, '').toUpperCase(); }

  bMakeField(fd, fi, vals, allBits, ribbon) {
    const nb = this.bFieldBits(fd, vals);
    const tint = this.bTint(fi);
    const isHex = fd.kind === 'hex';
    // An overridable field follows fd.derive until the user takes over.
    const overridden = !!fd.overridable && vals[fd.id + '__manual'] === '1';
    const derived = !!fd.derive && !overridden;
    const nOct = Math.floor(nb / 8);
    const max = nb > 0 ? Math.pow(2, nb) - 1 : 0;
    let bin = '', over = false, vc = 0, hexVal = '', note = '';
    if (isHex) {
      const rawH = derived ? fd.derive(vals) : vals[fd.id];
      hexVal = this.bHexClean(rawH === undefined ? (fd.defHex || '') : rawH);
      const want = nOct * 2;
      const h = hexVal.slice(0, want).padEnd(want, '0');
      if (hexVal.length > want) note = nOct === 0 ? 'Length is 0 — this field is not transmitted.' : 'Extra digits ignored — field is ' + nOct + ' octet' + (nOct === 1 ? '' : 's') + '.';
      else if (hexVal.length < want) note = 'Zero-padded to ' + nOct + ' octet' + (nOct === 1 ? '' : 's') + '.';
      else if (overridden && h !== fd.derive(vals)) note = fd.overrideNote(fd.derive(vals));
      bin = h.split('').map(c => parseInt(c, 16).toString(2).padStart(4, '0')).join('');
    } else {
      const raw = derived ? fd.derive(vals) : vals[fd.id];
      let v = Number(raw === undefined || raw === '' ? fd.def : raw);
      if (!isFinite(v) || v < 0) v = 0;
      v = Math.floor(v);
      over = v > max;
      vc = over ? max : v;
      bin = nb > 0 ? vc.toString(2).padStart(nb, '0') : '';
      if (over && nb > 0) note = 'Maximum for ' + nb + ' bits is ' + max + ' — clamped.';
      else note = (fd.warn && fd.warn(vc, vals)) || (overridden && vc !== fd.derive(vals) ? fd.overrideNote(fd.derive(vals)) : '');
    }
    for (let i = 0; i < nb; i++) allBits.push({ b: bin[i], fi, tint, fname: fd.n });
    const octRaw = vals[fd.id + '__oct'];
    const octVal = !fd.varOct ? '' : fd.octValues ? String(this.bFieldOct(fd, vals)) : String(octRaw === undefined || octRaw === '' ? fd.defOct : octRaw);
    const octOpts = [];
    const octChoices = fd.octValues || Array.from({ length: fd.varOct ? fd.maxOct - (fd.minOct || 0) + 1 : 0 }, (_, i) => (fd.minOct || 0) + i);
    if (fd.varOct && !fd.octNum) octChoices.forEach(o => octOpts.push({ v: String(o), l: o === 0 ? '0 · field absent' : o + (o === 1 ? ' octet' : ' octets') }));
    if (nb > 0) ribbon.push({
      abbr: fd.abbr, bits: String(nb),
      value: isHex ? (nOct <= 2 ? hexVal.slice(0, nOct * 2).padEnd(nOct * 2, '0') : nOct + ' OCT') : String(vc),
      style: { flex: String(Math.min(nb, 24)) + ' 1 auto', minWidth: '40px', border: '1px solid var(--color-text)', marginLeft: ribbon.length ? '-1px' : '0', background: tint, padding: '9px 3px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '2px', textAlign: 'center', overflow: 'hidden' }
    });
    return {
      id: fd.id, n: fd.n, nb, swatch: nb > 0 ? tint : 'transparent',
      bitsLabel: fd.setting ? 'MANAGED' : nb > 0 ? nb + ' BIT' + (nb === 1 ? '' : 'S') : 'ABSENT',
      isEnum: !!fd.opts && !derived, isNum: !fd.opts && !isHex && !derived && nb > 0,
      isHex: isHex && !derived, isDerived: derived,
      opts: (fd.opts || []).map(o => ({ v: String(o.v), l: o.l })),
      value: isHex ? hexVal : String(derived ? vc : (vals[fd.id] === undefined || vals[fd.id] === '' ? fd.def : vals[fd.id])),
      derivedLabel: !derived ? '' : isHex ? '0x' + hexVal : String(vc), derivedNote: fd.deriveNote || '',
      canOverride: !!fd.overridable && derived, isOverridden: overridden,
      onOverride: () => { this.bSetVal(fd.id, isHex ? hexVal : String(vc)); this.bSetVal(fd.id + '__manual', '1'); },
      onDerive: () => this.bSetVal(fd.id + '__manual', ''),
      hexPlaceholder: nOct > 0 ? '00'.repeat(Math.min(nOct, 12)) : 'field absent',
      max: String(max), binLabel: nb > 0 && !isHex ? bin : '',
      hasOct: !!fd.varOct && !fd.octNum, hasOctNum: !!fd.octNum, oct: octVal, octOpts, maxOct: String(fd.maxOct || 0),
      over: !!note, overMsg: note,
      onChange: (e) => this.bSetVal(fd.id, isHex ? this.bHexClean(e.target.value) : e.target.value),
      onOct: (e) => this.bSetVal(fd.id + '__oct', e.target.value)
    };
  }

  // Fields that depend on the finished frame have fixed widths, so the frame can be assembled in passes: first to measure it,
  // then with its length in place, then with the CRC of those bytes, which include the length.
  bAssembleDerived(bSpec, bVals) {
    const measured = this.bAssemble(bSpec, bVals);
    const sized = { ...bVals, __frameOct: measured.allBits.length / 8 };
    const withLength = this.bAssemble(bSpec, sized);
    if (!withLength.bFecfOn) return withLength;
    const bytes = [];
    for (let i = 0; i + 16 < withLength.allBits.length; i += 8) bytes.push(parseInt(withLength.allBits.slice(i, i + 8).map(x => x.b).join(''), 2));
    return this.bAssemble(bSpec, { ...sized, __crc: crc16(bytes, 0, bytes.length) });
  }

  // Builds one protocol's frame from the entered values: the field rows, field map and bits in wire order.
  bAssemble(bSpec, bVals) {
    const bFieldList = [], bRibbon = [], allBits = [];
    let bIdx = 0;
    // A managed setting puts no bits on the wire, so it takes no place in the field colour order.
    const bAdd = (fd) => this.bMakeField(fd, fd.setting ? bIdx : bIdx++, bVals, allBits, bRibbon);
    bSpec.fields.forEach(fd => bFieldList.push(bAdd(fd)));
    const bSec = bSpec.sec || null, bSdls = bSpec.sdls || null;
    // Current value of a header field or managed setting, for the rules that decide which sections exist.
    const bDefs = Object.fromEntries([...bSpec.fields, ...(bSec && bSec.setting ? [bSec.setting] : []), SDLS_BUILD_SERVICE, this.BUILD_FECF_SETTING].map(fd => [fd.id, fd.def]));
    const bGet = (id) => Number(bVals[id] === undefined || bVals[id] === '' ? bDefs[id] : bVals[id]);
    // Sections are added in wire order, so their bits land in the frame in that order. head is always shown; fields only when on.
    const bSection = (name, form, on, note, head, fields) => {
      const list = [...head, ...(on ? fields : [])].map(bAdd);
      const bits = list.reduce((n, f) => n + f.nb, 0);
      return { name, form, on, off: !on, note, list, len: on ? bits + ' BITS · ' + (bits / 8) + ' OCTETS' : '' };
    };
    const bSections = [], bAfter = [];
    if (bSec) {
      const allowed = !bSec.applies || bSec.applies(bGet), on = allowed && bGet(bSec.flag) === 1;
      bSections.push(bSection(bSec.name, bSec.form, on, on ? bSec.note : allowed ? bSec.off : bSec.blocked, bSec.setting ? [bSec.setting] : [], bSec.fields));
    }
    const bSvc = bSdls ? bGet('secSvc') : SDLS_NONE;
    const bSdlsOn = !!bSdls && bSvc !== SDLS_NONE && bSdls.applies(bGet);
    const bSdlsFields = bSdlsOn ? sdlsBuildFields(bSvc, bSdls.baseline, (fd) => this.bFieldOct(fd, bVals)) : { hdr: [], trl: [] };
    if (bSdls) bSections.push(bSection('SECURITY HEADER', 'SPACE DATA LINK SECURITY · CCSDS 355.0-B-2 § 4.1.1', bSdlsOn,
      bSvc !== SDLS_NONE && !bSdlsOn ? bSdls.blocked : sdlsBuildNote(bSvc), [SDLS_BUILD_SERVICE], bSdlsFields.hdr));
    const bPayList = [];
    if (bSpec.pay) bPayList.push(bAdd({ id: 'payload', n: bSpec.pay.field, bits: 0, def: 0, abbr: bSpec.pay.abbr, kind: 'hex', varOct: true, octNum: true, defOct: 0, minOct: 0, maxOct: this.state.profileOn && this.state.profile ? 2048 : 128, defHex: '' }));
    const bPayBits = bPayList.length ? bPayList[0].nb : 0;
    if (bSdlsFields.trl.length) bAfter.push(bSection('SECURITY TRAILER', 'SPACE DATA LINK SECURITY · CCSDS 355.0-B-2 § 4.1.2', true, SDLS_BUILD_TRAILER_NOTE, [], bSdlsFields.trl));
    if (bSpec.trail) {
      const on = bGet(bSpec.trail.flag) === 1;
      bAfter.push(bSection(bSpec.trail.name, bSpec.trail.form, on, on ? bSpec.trail.note(bVals) : bSpec.trail.off, [], bSpec.trail.fields));
    }
    const bFecfOn = !!bSpec.fecfForm && bGet('fecfOn') === 1;
    if (bSpec.fecfForm) bAfter.push(bSection('FRAME ERROR CONTROL FIELD', bSpec.fecfForm, bFecfOn, bFecfOn ? this.BUILD_FECF_NOTE : this.BUILD_FECF_OFF, [this.BUILD_FECF_SETTING], [this.BUILD_FECF_FIELD]));
    return { bFieldList, bRibbon, allBits, bSections, bAfter, bPayList, bPayBits, bSvc, bSdlsOn, bFecfOn };
  }

  // With the profile on, the Builder keeps its own entered values: they start from the profile, and manual ones are left alone.
  bValsKey(st) { return st.profileOn && st.profile ? st.bProto + '@profile' : st.bProto; }

  bSetVal(id, raw) {
    const p = this.bValsKey(this.state);
    this.setState(s => ({ bVals: { ...s.bVals, [p]: { ...(s.bVals[p] || {}), [id]: raw } } }));
  }

  // Frame decoder. Each spec's decode(bytes, settings) returns
  //   fields: [{ fid, n, abbr, off, bits, value, raw, meaning, octets, extra }] — wire order, off/bits in bits;
  //           octets = octet string (raw is hex), extra = received but not part of the PDU
  //   checks: [{ level: 'ok' | 'info' | 'warn' | 'err', msg, ref }]
  // settings are the mission's managed parameters, resolved to numbers by dSettings().
  DECODE_ORDER = ['spp', 'tm', 'tc'];
  DECODE_SPECS = {
    spp: SPP_DECODE,
    tm: TM_DECODE,
    tc: TC_DECODE
  };

  dSettings(proto) {
    if (this.state.profileOn && this.state.profile) return profileSettings(this.state.profile, proto);
    const spec = this.DECODE_SPECS[proto], raw = this.state.dSet[proto] || {}, out = {};
    (spec.settings || []).forEach(s => {
      const v = Number(raw[s.id] === undefined || raw[s.id] === '' ? s.def : raw[s.id]);
      out[s.id] = s.opts ? v : isFinite(v) ? Math.min(Math.max(Math.floor(v), s.min), s.max) : s.def;
    });
    return out;
  }

  EP_GROUPS = SDLS_EP_GROUPS;
  EP_DEF = SDLS_EP_PROCEDURES;
  EP_FIELD_IDS = SDLS_EP_FIELD_IDS;

  // Per-protocol tables are defined in src/protocols/*.js; order matters only for iteration.
  MAPS = { ...TM_MAPS, ...TC_MAPS, ...SPP_MAPS, ...SDLS_MAPS, ...SDLS_EP_MAPS };
  F = { ...TM_FIELDS, ...TC_FIELDS, ...SPP_FIELDS, ...SDLS_FIELDS, ...SDLS_EP_FIELDS };
  CRUMB_NAMES = { ...TM_CRUMBS, ...TC_CRUMBS, ...SPP_CRUMBS, ...SDLS_CRUMBS, ...SDLS_EP_CRUMBS };

  // ---- field search (Ctrl+K) ----
  Q_LIMIT = 40;
  Q_SOURCES = [
    { proto: 'tm', label: 'TM SDLP', fields: TM_FIELDS, abbr: TM_ABBR },
    { proto: 'tc', label: 'TC SDLP', fields: TC_FIELDS, abbr: TC_ABBR },
    { proto: 'spp', label: 'SpacePacket', fields: SPP_FIELDS, abbr: SPP_ABBR },
    { proto: 'sdls', label: 'SDLS', fields: SDLS_FIELDS, abbr: SDLS_ABBR },
    { proto: 'sdls', label: 'SDLS EP', fields: SDLS_EP_FIELDS, abbr: {} } ];

  qIndex() {
    if (!this.qIndexCache) this.qIndexCache = searchBuildIndex(this.Q_SOURCES, Object.entries(this.EP_DEF).map(([id, p]) => (
      { id, label: 'SDLS EP', name: p.name, ref: p.ref, meta: [p.fig, p.ref, p.service].filter(Boolean).join(' · '), desc: p.intro, code: p.proc || '' })));
    return this.qIndexCache;
  }

  qShow() {
    this.qFocusBefore = typeof document !== 'undefined' ? document.activeElement : null;
    this.setState({ qOpen: true, qText: '', qIdx: 0, tip: null });
  }

  qHide() {
    this.setState({ qOpen: false });
    const el = this.qFocusBefore;
    this.qFocusBefore = null;
    if (el && el.focus) el.focus();
  }

  // Stable across renders, so the input is focused once, when it appears.
  qInputRef = (el) => { if (el) el.focus(); };

  // Global: Ctrl+K or Cmd+K toggles the search from anywhere; Escape closes it.
  qOnWindowKey = (e) => {
    if ((e.ctrlKey || e.metaKey) && !e.shiftKey && !e.altKey && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      if (this.state.qOpen) this.qHide(); else this.qShow();
    } else if (e.key === 'Escape' && this.state.qOpen) {
      e.preventDefault();
      this.qHide();
    }
  };

  // ---- cheat sheets ----
  CHEAT_ORDER = ['spp', 'tm', 'tc', 'sdls', 'ep'];
  CHEAT_SHEETS = { spp: SPP_SHEET, tm: TM_SHEET, tc: TC_SHEET, sdls: SDLS_SHEET, ep: SDLS_EP_SHEET };
  CHEAT_TABS = { spp: 'SpacePacket', tm: 'TM SDLP', tc: 'TC SDLP', sdls: 'SDLS', ep: 'SDLS EP' };

  // Which sheet to open: the protocol in view, as long as it has one.
  cheatProtoFor(st) {
    if (st.view === 'ep' || (st.view === 'field' && st.fid && this.fieldDoc(st.fid) === 'ep')) return 'ep';
    if (st.view === 'diagram' && this.CHEAT_SHEETS[st.proto]) return st.proto;
    if (st.view === 'field' && st.fid) return this.fieldDoc(st.fid);
    if (st.view === 'build' && this.CHEAT_SHEETS[st.bProto]) return st.bProto;
    if (st.view === 'decode' && this.CHEAT_SHEETS[st.dProto]) return st.dProto;
    return st.cProto;
  }

  cheatPrint(sheetCode) {
    // The browser offers the page title as the name of the PDF.
    const title = document.title;
    document.title = sheetCode + ' cheat sheet';
    window.print();
    document.title = title;
  }

  cheatVals(st, pr, shown) {
    const open = { cOpen: () => { this.setState(s => ({ view: 'cheat', fid: null, tip: null, retView: null, cProto: this.cheatProtoFor(s) })); if (this.mainEl) this.mainEl.scrollTop = 0; } };
    if (!shown) return open;
    const doc = st.cProto, sheet = this.CHEAT_SHEETS[doc], book = BLUE_BOOKS[doc];
    const linked = (ref) => ({ ref, ...this.bbRefVals(doc, ref) });
    const box = (w, i, extra) => ({ flex: String(w) + ' 1 0', minWidth: 0, border: '.6pt solid var(--color-text)', marginLeft: i ? '-.6pt' : 0, padding: '2.5pt 1.5pt', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', gap: '.5pt', ...extra });
    const strip = (title, cells) => ({ title, cells: cells.map((c, i) => ({ n: c.n, len: c.len.replace(/ OCTETS? · /, ' OCT · '), style: box(c.w, i, c.shade ? { background: 'var(--color-accent-100)' } : c.opt ? { background: 'repeating-linear-gradient(45deg,transparent 0 3pt,var(--color-neutral-300) 3pt 3.4pt)' } : {}) })) });
    const laid = (proto) => profileLayout(pr, proto).fields.filter(f => f.len !== 0).map(f => ({ n: f.n.toUpperCase(), len: profileFieldLabel(f), w: f.key === 'data' ? 3 : 1.2, shade: f.key === 'sech' || f.key === 'sect' }));
    const covered = (link) => { const lay = pr ? profileLayout(pr, link) : null; return this.SDLS_COV[link].cells.map(c => ({ n: c.n, len: lay && c.k ? profileFieldLabel(lay.fields.find(f => f.key === c.k)) : c.len, w: c.w, shade: c.n.startsWith('SECURITY') })); };
    const cStrips = sheet.links ? sheet.links.map(l => strip(this.SDLS_COV[l].name + ' WITH SDLS', covered(l)))
      : sheet.frame ? [strip(sheet.frameTitle, pr && sheet.layout ? laid(sheet.layout) : sheet.frame)] : [];
    let bit = 0;
    const cRows = sheet.rows.map(row => {
      const total = row.reduce((n, c) => n + c[1], 0), from = bit;
      const cells = row.map(([abbr, bits, , size], i) => ({ abbr, size: size || (bits === 1 ? '1 BIT' : bits + ' BITS'), style: box(bits, i) }));
      const fixed = row.every(c => !c[3]);
      bit += total;
      return { label: fixed ? 'OCT ' + from / 8 + (total > 8 ? '–' + ((from + total) / 8 - 1) : '') : '', cells };
    });
    const cFields = sheet.fields.map(([id, abbr, v]) => {
      const f = this.F[id];
      return { id, abbr, v, n: f.n, pos: String(f.bits || f.len).replace(/^BITS? /, '').replace(/^SH BITS /, 'SH ').replace(/^SEG HDR BITS /, 'SEG ').replace(/ OR /, '/').replace(/ OCTETS?$/, ' oct').replace(/^MANAGED.*/, 'managed'), ...linked(f.ref),
        onClick: () => { this.setState({ proto: this.fieldDoc(id) === 'ep' ? 'sdls' : this.fieldDoc(id) }); this.openPage(id, 'cheat'); } };
    });
    const groups = sheet.procedures ? this.EP_GROUPS.map(g => ({ name: g.name, items: g.items.filter(it => it.id && this.EP_DEF[it.id]).map(it => {
      const p = this.EP_DEF[it.id];
      return { id: it.id, name: p.name, pi: p.proc, ref: p.ref, onClick: () => { this.setState({ proto: 'sdls', epOpen: true }); this.openEp(it.id, 'cheat'); } };
    }) })) : [];
    const spec = this.DECODE_SPECS[doc];
    const set = pr && spec ? profileSettings(pr, doc) : null;
    const value = (sd) => { if (!set) return sd.opts ? (sd.opts.length > 2 ? 'Service type' : sd.opts.map(o => o.l.split(' — ')[0]).join(' / ')) : (sd.unit === 'octets' ? 'N octets' : ''); return sd.opts ? sd.opts.find(o => o.v === set[sd.id]).l.split(' — ')[0] : set[sd.id] + ' ' + (sd.unit || ''); };
    const managed = spec ? spec.settings.filter(sd => !sd.showIf || (set && sd.showIf(set))).map(sd => ({ id: sd.id, n: sd.n, value: value(sd), refShort: sd.ref, ...this.bbRefVals(doc, sd.ref) })) : [];
    const sdlsRow = (id, key, n) => ({ id, n, refShort: 'TABLE 6-1', ...this.bbRefVals('sdls', 'TABLE 6-1'),
      value: pr ? 'TM ' + (pr.tm.sdls.service === 'none' ? '—' : pr.tm.sdls[key]) + ' · TC ' + (pr.tc.sdls.service === 'none' ? '—' : pr.tc.sdls[key]) : { iv: '1–32 octets', sn: '2–8 octets', pl: '1–2 octets', mac: '8–64 octets' }[key] });
    const cManaged = doc === 'sdls' ? [sdlsRow('iv', 'iv', 'SA_length_IV'), sdlsRow('sn', 'sn', 'SA_length_SN'), sdlsRow('pl', 'pl', 'SA_length_PL'), sdlsRow('mac', 'mac', 'SA_length_MAC')] : managed;
    const rev = blueBookRevision(doc);
    return { ...open,
      cTabs: this.CHEAT_ORDER.map(id => ({ id, name: this.CHEAT_TABS[id], onClick: () => this.setState({ cProto: id }),
        style: { padding: '8px 15px', border: '1px solid ' + (id === doc ? 'var(--color-accent)' : 'var(--color-divider)'), background: id === doc ? 'color-mix(in srgb, var(--color-accent) 12%, var(--color-bg))' : 'var(--color-bg)', cursor: 'pointer', fontSize: '12.5px', letterSpacing: '.06em', fontFamily: 'var(--font-heading)', fontWeight: '600', whiteSpace: 'nowrap', color: id === doc ? 'var(--color-accent-900)' : 'var(--color-text)' } })),
      cPrint: () => this.cheatPrint(book.code), cStop: (e) => e.stopPropagation(),
      cTitle: sheet.title, cCode: book.code, cRev: rev, cRevShort: rev.toLowerCase().replace(/^issue/, 'Issue').replace(/ · /g, ', ').replace(/\b(january|february|march|april|may|june|july|august|september|october|november|december)\b/g, m => m[0].toUpperCase() + m.slice(1)).replace(/cor\. 1/, 'Cor. 1').replace(/ec (\d)/g, 'EC $1'), cUrl: book.url,
      cMission: pr ? ' · ' + pr.name.toUpperCase() : '',
      cStrips, cHeaderTitle: sheet.headerTitle, cRows, cFields,
      cHasServices: !!sheet.services, cServices: (sheet.services || []).map(([a, b, c, d]) => ({ a, b, c, d })),
      cHasProcedures: !!sheet.procedures, cProcedures: groups,
      cSpecialTitle: doc === 'sdls' ? 'VALUES AND BASELINES' : doc === 'ep' ? 'SERVICE GROUPS' : 'SPECIAL VALUES',
      cSpecials: sheet.specials.map(([c, d, ref]) => ({ c, d, ...linked(ref) })),
      cRules: sheet.rules.map(([t, ref]) => ({ t, ...linked(ref) })),
      cHasManaged: cManaged.length > 0, cManaged, cManagedTitle: pr ? 'MANAGED PARAMETERS · ' + pr.name.toUpperCase() : 'MANAGED PARAMETERS · NOT IN THE FRAME' };
  }

  // ---- Blue Book links ----
  // Which book a field page quotes.
  fieldDoc(id) {
    if (!this.fieldDocs) {
      this.fieldDocs = {};
      for (const s of this.Q_SOURCES) for (const k of Object.keys(s.fields)) this.fieldDocs[k] = s.label === 'SDLS EP' ? 'ep' : s.proto;
    }
    return this.fieldDocs[id] || 'tm';
  }

  // Template values for a reference shown as a link when its page is known, and as plain text otherwise.
  bbRefVals(doc, ref) {
    const l = blueBookLink(doc, ref);
    return { hasLink: !!l, noLink: !l, href: l ? l.href : '', linkTitle: l ? l.title : '', pageLabel: l ? 'p. ' + l.printed : '' };
  }

  bbVals() {
    const out = {};
    for (const doc of Object.keys(BLUE_BOOKS)) {
      out[doc + 'Rev'] = blueBookRevision(doc);
      out[doc + 'Detail'] = blueBookRevisionDetail(doc);
      out[doc + 'Url'] = BLUE_BOOKS[doc].url;
      const fig = blueBookLink(doc, 'FIGURE 4-1');
      out[doc + 'Fig41Href'] = fig ? fig.href : BLUE_BOOKS[doc].url;
      out[doc + 'Fig41Title'] = fig ? fig.title : '';
    }
    return out;
  }

  // ---- mission profile ----
  // Octet labels of the diagrams: what the Standard says in general, or with a profile on, where each field really is.
  diagramLabels(pr, sdCov) {
    const label = (proto, key) => profileFieldLabel(profileLayout(pr, proto).fields.find(f => f.key === key));
    const base = { tmPh: '6 OCTETS', tmSh: 'UP TO 64 OCTETS', tmDf: 'VARIES', tmOcf: '4 OCTETS', tmFecf: '2 OCTETS', tmShdf: '1–63 OCTETS',
      sppTag: '7 TO 65542 OCTETS', sppPh: '6 OCTETS', sppDf: 'PACKET DATA FIELD (1 TO 65536 OCTETS)', sppSh: 'VARIABLE', sppShHead: 'VARIABLE', sppUd: 'VARIABLE', sppTcf: 'VARIABLE', sppAdf: 'VARIABLE',
      tcTag: 'VARIABLE LENGTH · MAX 1024 OCTETS', tcPh: '5 OCTETS', tcDf: 'UP TO 1019 OCTETS · VARIES', tcFecf: '2 OCTETS',
      sdHdr: '≤ 64 OCTETS', sdHdrHead: '≤ 64 OCTETS', sdData: 'VARIES', sdTrl: 'MANAGED', sdTrlHead: 'MANAGED LENGTH', sdEcf: '2 OCT', sdIv: 'MANAGED · OPTIONAL', sdSn: 'MANAGED · OPTIONAL', sdPl: 'MANAGED · OPTIONAL', sdMac: 'MANAGED · OPTIONAL' };
    if (!pr) return base;
    const sppSh = pr.spp.timeCodeLen + pr.spp.ancillaryLen, tcLay = profileLayout(pr, 'tc'), tcFecf = pr.tc.fecf ? 2 : 0;
    const out = { ...base, tmPh: label('tm', 'ph'), tmSh: label('tm', 'sh'), tmDf: label('tm', 'data'), tmOcf: label('tm', 'ocf'), tmFecf: label('tm', 'fecf'),
      tmShdf: pr.tm.secondaryHeaderLen ? oct(pr.tm.secondaryHeaderLen - 1).toUpperCase() : 'ABSENT',
      sppTag: '7 TO ' + pr.spp.maxPacketLen + ' OCTETS', sppPh: label('spp', 'ph'), sppDf: 'PACKET DATA FIELD (1 TO ' + (pr.spp.maxPacketLen - 6) + ' OCTETS)', sppSh: sppSh ? oct(sppSh).toUpperCase() + ' · 6–' + (5 + sppSh) : 'ABSENT', sppShHead: sppSh ? oct(sppSh).toUpperCase() : 'ABSENT',
      sppUd: label('spp', 'data'), sppTcf: label('spp', 'tcf'), sppAdf: label('spp', 'adf'),
      tcTag: 'VARIABLE LENGTH · MAX ' + pr.tc.maxFrameLen + ' OCTETS', tcPh: label('tc', 'ph'), tcFecf: label('tc', 'fecf'),
      tcDf: 'UP TO ' + oct(Math.max(pr.tc.maxFrameLen - 5 - tcFecf, 0)).toUpperCase() + ' · FROM 5' };
    if (tcLay.tooSmall) out.tcDf = 'NO ROOM';
    if (!['tm', 'tc'].includes(sdCov)) return out;
    // The SDLS page is not about one link: it shows the one selected in its coverage view.
    const lay = profileLayout(pr, sdCov), s = lay.sdls, find = (k) => profileFieldLabel(lay.fields.find(f => f.key === k));
    const size = (n) => (s.on && n ? oct(n).toUpperCase() : 'ABSENT');
    return { ...out, sdHdr: find('sech'), sdHdrHead: size(s.hdr), sdData: find('data'), sdTrl: find('sect'), sdTrlHead: size(s.trl), sdEcf: find('fecf'), sdIv: size(s.iv), sdSn: size(s.sn), sdPl: size(s.pl), sdMac: size(s.trl) };
  }

  profileSave(next, extra) {
    const stored = profileStore(next);
    this.setState({ profile: next, pStoreFailed: !stored, ...(next ? {} : { profileOn: false }), ...extra });
  }

  // A value that is not acceptable yet stays as a draft in its input, with the reason, and the profile keeps its last good value.
  profileEdit(f, raw) {
    const value = f.type === 'int' ? (/^\d+$/.test(raw) ? Number(raw) : NaN) : f.type === 'bool' ? raw === 'true' : raw;
    const draft = { ...this.state.pDraft };
    if (profileFieldError(f, value)) {
      draft[f.path] = raw;
      this.setState({ pDraft: draft });
    } else {
      delete draft[f.path];
      this.profileSave(profileSet(this.state.profile, f.path, value), { pDraft: draft });
    }
  }

  // An import that fails leaves the current profile as it is.
  profileImportText(text, fileName) {
    const { profile, errors } = profileParse(text);
    if (errors.length) this.setState({ pErrors: errors, pMsg: '' });
    else this.profileSave(profile, { pErrors: [], pDraft: {}, pMsg: 'Imported ‘' + profile.name + '’ from ' + fileName + '.' });
  }

  profileExport() {
    const url = URL.createObjectURL(new Blob([profileToJson(this.state.profile)], { type: 'application/json' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = profileFileName(this.state.profile);
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  profileVals(st, pr, showProfile) {
    const p = st.profile;
    const barStyle = (on, enabled) => ({ padding: '6px 12px', fontSize: '11.5px', letterSpacing: '.06em', fontFamily: 'var(--font-heading)', fontWeight: '600', whiteSpace: 'nowrap',
      border: '1px solid ' + (on ? 'var(--color-accent)' : 'var(--color-divider)'), marginLeft: '-1px', cursor: enabled ? 'pointer' : 'not-allowed', opacity: enabled ? '1' : '.5',
      background: on ? 'color-mix(in srgb, var(--color-accent) 12%, var(--color-bg))' : 'var(--color-bg)', color: on ? 'var(--color-accent-900)' : 'var(--color-text)' });
    const fieldRow = (f) => {
      const draft = st.pDraft[f.path], value = p ? profileGet(p, f.path) : '';
      const reason = draft !== undefined ? profileFieldError(f, f.type === 'int' ? (/^\d+$/.test(draft) ? Number(draft) : NaN) : draft) : '';
      return { path: f.path, n: f.n, ref: f.ref || '', note: f.note || '', hasNote: !!f.note, unit: f.unit || '',
        isInt: f.type === 'int', isText: f.type === 'text', isSelect: f.type === 'enum' || f.type === 'bool',
        opts: f.type === 'bool' ? [{ v: 'true', l: 'Present' }, { v: 'false', l: 'Absent' }] : (f.opts || []),
        value: draft !== undefined ? draft : String(value), min: String(f.min), max: String(f.max),
        hasErr: !!reason, err: 'This value ' + reason + ', so the profile keeps ' + value + '.',
        onInput: (e) => this.profileEdit(f, e.target.value) };
    };
    const layoutRows = (proto) => profileLayout(p, proto).fields.filter(f => f.len !== 0).map(f => ({ n: f.n, label: profileFieldLabel(f) }));
    return {
      showProfile, pHas: !!p, pNone: !p, pOn: !!pr,
      pName: p ? p.name : '', pSubtitle: p ? p.name : 'Not defined',
      pBarShow: ['build', 'decode'].includes(st.view),
      pManualStyle: barStyle(!pr, true), pProfileStyle: barStyle(!!pr, !!p),
      pBarLabel: p ? p.name : 'Mission profile',
      pBarNote: !pr ? '' : st.view === 'decode' ? 'Settings come from the profile.' : 'Values start from the profile.',
      pBarManual: () => this.setState({ profileOn: false }),
      pBarProfile: () => { if (this.state.profile) this.setState({ profileOn: true }); },
      pOpen: () => { this.setState({ view: 'profile', fid: null, tip: null, retView: null, pMsg: '', pErrors: [] }); if (this.mainEl) this.mainEl.scrollTop = 0; },
      pCreate: () => this.profileSave(profileNew(), { pMsg: '', pErrors: [], pDraft: {} }),
      pDelete: () => { if (typeof confirm !== 'function' || confirm('Delete the mission profile ‘' + this.state.profile.name + '’? Export it first to keep a copy.')) this.profileSave(null, { pMsg: '', pErrors: [], pDraft: {} }); },
      pExport: () => this.profileExport(),
      pImport: (e) => { const input = e.target, file = input.files && input.files[0]; if (!file) return; file.text().then(text => { this.profileImportText(text, file.name); input.value = ''; }); },
      pMsg: st.pMsg, pHasMsg: !!st.pMsg,
      pErrors: st.pErrors.map(t => ({ t })), pHasErrors: st.pErrors.length > 0,
      pStoreFailed: st.pStoreFailed,
      pSections: showProfile && p ? PROFILE_SCHEMA.map(sec => ({ title: sec.title, ref: sec.ref || '', rows: sec.fields.filter(f => !f.showIf || f.showIf(p)).map(fieldRow) })) : [],
      pWarnings: showProfile && p ? profileWarnings(p) : [], pHasWarnings: showProfile && !!p && profileWarnings(p).length > 0,
      pLayouts: showProfile && p ? [['tm', 'TM TRANSFER FRAME'], ['tc', 'TC TRANSFER FRAME'], ['spp', 'SPACE PACKET']].map(([id, name]) => ({ name, rows: layoutRows(id), hasCov: id !== 'spp', cov: id !== 'spp' ? profileCoverage(p, id).text : '' })) : []
    };
  }

  // ---- refresh ----
  // What survives a refresh: where you are and what you entered. Tooltips, dialogs and the search are not worth reopening.
  SESSION_STATE = ['proto', 'view', 'fid', 'retView', 'phOpen', 'shOpen', 'dfsOpen', 'tcPhOpen', 'tcDfOpen', 'spPhOpen', 'spShOpen', 'sdShOpen', 'sdTrOpen',
    'epOpen', 'epId', 'epHdrOpen', 'epDataOpen', 'bProto', 'bVals', 'sdCov', 'dProto', 'dHex', 'dSet', 'profileOn', 'cProto'];

  constructor(props) {
    super(props);
    const saved = sessionRead();
    const linked = this.linkTarget();
    this.state = { ...this.state, ...this.sessionRestore(saved), ...linked, profile: profileLoad() };
    if (!this.state.profile) this.state.profileOn = false;
    this.scrollToRestore = linked.view ? 0 : Number(saved.scroll) || 0;
  }

  // The state a link from the published reference pages asks for: #/tm, #/sdls-ep, #/field/fhp, #/ep/otar. Read once and then
  // cleared from the address, so a refresh keeps wherever the user has gone since.
  linkTarget() {
    if (typeof location === 'undefined') return {};
    const m = String(location.hash).match(/^#\/([\w-]+)(?:\/([\w-]+))?$/);
    if (!m) return {};
    let target = {};
    if (m[1] === 'field' && m[2] && Object.prototype.hasOwnProperty.call(this.F, m[2])) {
      const doc = this.fieldDoc(m[2]);
      target = { view: 'field', fid: m[2], proto: doc === 'ep' ? 'sdls' : doc, retView: null, ...(doc === 'ep' ? { epOpen: true, epId: this.qEpOf(m[2]) } : {}) };
    } else if (m[1] === 'ep' && m[2] && Object.prototype.hasOwnProperty.call(this.EP_DEF, m[2])) target = { view: 'ep', epId: m[2], proto: 'sdls', epOpen: true, retView: null };
    else if (m[1] === 'sdls-ep' && !m[2]) target = { view: 'diagram', proto: 'sdls', epOpen: true, fid: null, retView: null };
    else if (['tm', 'tc', 'spp', 'sdls'].includes(m[1]) && !m[2]) target = { view: 'diagram', proto: m[1], fid: null, retView: null };
    if (!Object.keys(target).length) return {};
    try { history.replaceState(null, '', location.pathname + location.search); } catch (e) { /* the link stays in the address */ }
    return target;
  }

  // Only what this build still has: a saved tab, field or view that no longer exists must not break the page.
  sessionRestore(saved) {
    const out = {};
    this.SESSION_STATE.forEach(k => { if (saved[k] !== undefined) out[k] = saved[k]; });
    const known = (k, valid) => { if (k in out && !valid(out[k])) delete out[k]; };
    const isMap = (v) => !!v && typeof v === 'object' && !Array.isArray(v);
    const has = (table, v) => typeof v === 'string' && Object.prototype.hasOwnProperty.call(table, v);
    known('proto', v => ['tm', 'tc', 'spp', 'sdls'].includes(v));
    known('view', v => ['diagram', 'field', 'ep', 'build', 'decode', 'profile', 'cheat'].includes(v));
    known('cProto', v => has(this.CHEAT_SHEETS, v));
    known('profileOn', v => typeof v === 'boolean');
    known('retView', v => v === null || ['decode', 'build', 'cheat'].includes(v));
    known('fid', v => v === null || has(this.F, v));
    known('epId', v => v === null || has(this.EP_DEF, v));
    known('bProto', v => has(this.BUILD_SPECS, v));
    known('dProto', v => has(this.DECODE_SPECS, v));
    known('sdCov', v => this.SDLS_COV_ORDER.includes(v));
    ['bVals', 'dHex', 'dSet'].forEach(k => known(k, isMap));
    if (out.view === 'field' && !out.fid) out.view = 'diagram';
    if (out.view === 'ep' && !out.epId) out.view = 'diagram';
    return out;
  }

  sessionSave = () => {
    const data = { scroll: this.mainEl ? this.mainEl.scrollTop : 0 };
    this.SESSION_STATE.forEach(k => { data[k] = this.state[k]; });
    sessionWrite(data);
  };

  componentDidMount() {
    window.addEventListener('keydown', this.qOnWindowKey);
    window.addEventListener('pagehide', this.sessionSave);
    if (this.mainEl && this.scrollToRestore) this.mainEl.scrollTop = this.scrollToRestore;
    this.scrollToRestore = 0;
  }

  componentWillUnmount() {
    window.removeEventListener('keydown', this.qOnWindowKey);
    window.removeEventListener('pagehide', this.sessionSave);
  }

  // The procedure page BACK returns to: the one owning this field, else the one last open.
  qEpOf(id) {
    for (let cur = id; cur; cur = this.F[cur] ? this.F[cur].parent : null) {
      if (cur.startsWith('epdata_')) return cur.slice('epdata_'.length);
    }
    return this.state.epId || Object.keys(this.EP_DEF)[0];
  }

  qGo(entry) {
    const from = this.state.view;
    this.qHide();
    if (entry.kind === 'procedure') {
      this.setState({ proto: 'sdls', epOpen: true });
      this.openEp(entry.id);
    } else {
      const isEp = this.EP_FIELD_IDS.includes(entry.id);
      this.setState({ proto: entry.proto, ...(isEp ? { epId: this.qEpOf(entry.id), epOpen: true } : {}) });
      this.openPage(entry.id, ['decode', 'build', 'cheat'].includes(from) ? from : undefined);
    }
  }

  // retView: where BACK leads from a field page. Kept while browsing between field pages, reset when entered from elsewhere.
  openPage(id, retView) {
    const ret = retView !== undefined ? retView : (this.state.view === 'field' ? this.state.retView : null);
    this.setState({ view: 'field', fid: id, tip: null, dfsModal: false, retView: ret });
    if (this.mainEl) this.mainEl.scrollTop = 0;
  }

  openEp(id, retView) {
    if (!this.EP_DEF[id]) return;
    this.setState({ view: 'ep', epId: id, fid: null, tip: null, dfsModal: false, retView: retView || null });
    if (this.mainEl) this.mainEl.scrollTop = 0;
  }

  resolved() {
    const p = this.props;
    return {
      ph: this.state.phOpen ?? (p.startExpanded ?? true),
      sh: this.state.shOpen ?? false,
      dfs: this.state.dfsOpen ?? false,
      tcPh: this.state.tcPhOpen ?? (p.startExpanded ?? true),
      tcDf: this.state.tcDfOpen ?? false,
      spPh: this.state.spPhOpen ?? (p.startExpanded ?? true),
      spSh: this.state.spShOpen ?? false,
      sdSh: this.state.sdShOpen ?? (p.startExpanded ?? true),
      sdTr: this.state.sdTrOpen ?? false,
      epHdr: this.state.epHdrOpen ?? (p.startExpanded ?? true),
      epData: this.state.epDataOpen ?? (p.startExpanded ?? true)
    };
  }

  renderVals() {
    const st = this.state, p = this.props, F = this.F;
    const open = this.resolved();
    const proto = st.proto;
    const showDiagram = proto === 'tm' && st.view === 'diagram';
    const showTcDiagram = proto === 'tc' && st.view === 'diagram';
    const showSpDiagram = proto === 'spp' && st.view === 'diagram';
    const showSdlsDiagram = proto === 'sdls' && st.view === 'diagram';
    const cov = this.SDLS_COV[st.sdCov || 'tm'];
    const pr = st.profileOn && st.profile ? st.profile : null;
    const covLay = pr && ['tm', 'tc'].includes(st.sdCov || 'tm') ? profileLayout(pr, st.sdCov || 'tm') : null;
    const lay = this.diagramLabels(pr, st.sdCov || 'tm');
    // In general the view shows what SDLS can cover; with a profile, what this link's service does cover.
    const covAuth = !covLay || covLay.sdls.authenticated, covEnc = !covLay || covLay.sdls.encrypted, covAad = covAuth && covEnc;
    const ep = st.epId ? this.EP_DEF[st.epId] : null;
    const showEpDiagram = st.view === 'ep' && !!ep;
    const f = st.fid ? F[st.fid] : null;
    const showField = st.view === 'field' && !!f;
    const showBuilder = st.view === 'build';
    const showProfile = st.view === 'profile';
    const showCheat = st.view === 'cheat';

    // ---- frame builder ----
    const bSpec = this.BUILD_SPECS[st.bProto] || this.BUILD_SPECS.tm;
    const bVals = { ...(pr ? profileBuildValues(pr, st.bProto) : {}), ...(st.bVals[this.bValsKey(st)] || {}) };
    const bBuilt = this.bAssembleDerived(bSpec, bVals);
    const { bFieldList, bRibbon, allBits, bSections, bAfter, bPayList, bPayBits, bSvc, bSdlsOn } = bBuilt;
    const bOctets = [];
    const bHexList = [], bBinList = [];
    for (let i = 0; i < allBits.length; i += 8) {
      const chunk = allBits.slice(i, i + 8);
      const binStr = chunk.map(x => x.b).join('');
      bHexList.push(chunk.length === 8 ? parseInt(binStr, 2).toString(16).toUpperCase().padStart(2, '0') : '—');
      bBinList.push(binStr);
      // A whole frame of bit cells would slow every keystroke; the hex and binary above stay complete.
      if (i / 8 >= this.BUILD_WIRE_MAX) continue;
      bOctets.push({
        label: 'OCTET ' + (i / 8),
        bitRange: i + '–' + (i + chunk.length - 1),
        hex: chunk.length === 8 ? '0x' + parseInt(binStr, 2).toString(16).toUpperCase().padStart(2, '0') : '—',
        cells: chunk.map((c, ci) => ({
          b: c.b,
          style: { width: '21px', height: '27px', flex: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'ui-monospace,Menlo,Consolas,monospace', fontSize: '12px', fontWeight: '600', background: c.tint, borderTop: '1px solid var(--color-text)', borderBottom: '1px solid var(--color-text)', borderLeft: '1px solid var(--color-text)', borderRight: ci === chunk.length - 1 ? '1px solid var(--color-text)' : '0' }
        }))
      });
    }
    const bHexStr = bHexList.join(' ');
    const bBinStr = bBinList.join(' ');
    const bProfileNote = pr ? profileFrameNote(pr, st.bProto, allBits.length / 8) : '';

    // ---- frame decoder ----
    const showDecoder = st.view === 'decode';
    const dSpec = this.DECODE_SPECS[st.dProto];
    const dText = st.dHex[st.dProto] || '';
    const dParsed = parseHex(dText);
    const dBytes = dParsed.bytes;
    const dRes = showDecoder && !dParsed.err ? dSpec.decode(dBytes, this.dSettings(st.dProto)) : { fields: [], checks: [] };
    const dTint = (fd, i) => fd.extra ? 'var(--color-neutral-200)' : this.bTint(i);
    const dOwner = [];   // field index per received bit
    dRes.fields.forEach((fd, i) => { for (let k = fd.off; k < fd.off + fd.bits; k++) dOwner[k] = i; });
    const dTintAt = (bit) => dOwner[bit] === undefined ? 'var(--color-bg)' : dTint(dRes.fields[dOwner[bit]], dOwner[bit]);
    const dRibbon = dRes.fields.map((fd, i) => ({ fd, i })).filter(x => x.fd.bits > 0).map(({ fd, i }, k) => ({
      abbr: fd.abbr, bits: fd.octets ? fd.bits / 8 + ' OCT' : fd.bits + 'b',
      value: fd.octets ? (fd.bits <= 16 ? fd.raw : fd.raw.slice(0, 4) + '…') : fd.value,
      style: { flex: String(Math.min(fd.bits, 24)) + ' 1 auto', minWidth: '40px', border: '1px solid var(--color-text)', marginLeft: k ? '-1px' : '0', background: dTint(fd, i), padding: '9px 3px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '2px', textAlign: 'center', overflow: 'hidden' }
    }));
    const dFields = dRes.fields.map((fd, i) => {
      const o0 = fd.off / 8, o1 = (fd.off + fd.bits) / 8 - 1;
      return {
        fid: fd.fid || '', n: fd.n, raw: fd.raw, value: fd.value,
        pos: fd.octets ? 'OCT ' + o0 + (o1 > o0 ? '–' + o1 : '') : 'BIT ' + fd.off + (fd.bits > 1 ? '–' + (fd.off + fd.bits - 1) : ''),
        meaning: fd.meaning, swatch: fd.bits ? dTint(fd, i) : 'transparent',
        onClick: (e) => { const id = e.currentTarget.dataset.dfield; if (id && F[id]) { this.setState({ proto: fd.proto || st.dProto }); this.openPage(id, 'decode'); } },
        rowStyle: { display: 'grid', gridTemplateColumns: '14px minmax(0,2fr) minmax(0,.9fr) minmax(0,1.5fr) minmax(0,.9fr) minmax(0,2fr)', columnGap: '10px', alignItems: 'baseline', padding: '9px 6px', borderBottom: '1px solid var(--color-divider)', cursor: fd.fid ? 'pointer' : 'default' }
      };
    });
    const D_DUMP_MAX = 2048, D_WIRE_MAX = 16;
    const dDump = [];
    for (let r = 0; r < Math.min(dBytes.length, D_DUMP_MAX); r += 16) {
      const cells = [];
      for (let o = r; o < Math.min(r + 16, dBytes.length, D_DUMP_MAX); o++) {
        const names = [...new Set(Array.from({ length: 8 }, (_, k) => dOwner[o * 8 + k]).filter(x => x !== undefined).map(x => dRes.fields[x].n))];
        cells.push({ h: dBytes[o].toString(16).toUpperCase().padStart(2, '0'), title: 'Octet ' + o + (names.length ? ' · ' + names.join(' / ') : ''),
          style: { width: '26px', flex: 'none', textAlign: 'center', fontFamily: 'ui-monospace,Menlo,Consolas,monospace', fontSize: '12px', fontWeight: '600', padding: '3px 0', border: '1px solid var(--color-divider)', background: dTintAt(o * 8), marginLeft: o % 8 === 0 && o % 16 ? '6px' : '0' } });
      }
      dDump.push({ off: r.toString(16).toUpperCase().padStart(4, '0'), cells });
    }
    const dOctets = [];
    for (let o = 0; o < Math.min(dBytes.length, D_WIRE_MAX); o++) {
      dOctets.push({
        label: 'OCTET ' + o, bitRange: o * 8 + '–' + (o * 8 + 7), hex: '0x' + dBytes[o].toString(16).toUpperCase().padStart(2, '0'),
        cells: dBytes[o].toString(2).padStart(8, '0').split('').map((bit, k) => ({
          b: bit,
          style: { width: '21px', height: '27px', flex: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'ui-monospace,Menlo,Consolas,monospace', fontSize: '12px', fontWeight: '600', background: dTintAt(o * 8 + k), borderTop: '1px solid var(--color-text)', borderBottom: '1px solid var(--color-text)', borderLeft: '1px solid var(--color-text)', borderRight: k === 7 ? '1px solid var(--color-text)' : '0' }
        }))
      });
    }
    const D_LEVEL = {
      ok: { l: 'OK', css: 'border:1px solid var(--color-accent);color:var(--color-accent-800);background:var(--color-accent-100)' },
      info: { l: 'INFO', css: 'border:1px solid var(--color-divider);color:var(--color-neutral-700)' },
      warn: { l: 'WARN', css: 'border:1px solid #b07d2a;color:#7a5414;background:color-mix(in srgb, #b07d2a 14%, var(--color-bg))' },
      err: { l: 'ERROR', css: 'border:1px solid #b4483c;color:var(--color-bg);background:#b4483c' }
    };
    const dBadge = 'flex:none;width:52px;text-align:center;font-size:9.5px;letter-spacing:.12em;font-weight:600;padding:3px 0;';
    const dChecks = dRes.checks.map(c => ({ label: D_LEVEL[c.level].l, msg: c.msg, ref: c.ref || '', ...this.bbRefVals(st.dProto, c.ref), badgeStyle: dBadge + D_LEVEL[c.level].css }));
    const dErrs = dRes.checks.filter(c => c.level === 'err').length, dWarns = dRes.checks.filter(c => c.level === 'warn').length;
    const dSummaryLevel = dParsed.err || dErrs ? 'err' : dWarns ? 'warn' : dBytes.length ? 'ok' : 'info';
    const dSummary = dParsed.err ? 'INPUT ERROR' : !dBytes.length ? 'NO INPUT'
      : dErrs || dWarns ? [dErrs ? dErrs + (dErrs === 1 ? ' ERROR' : ' ERRORS') : '', dWarns ? dWarns + (dWarns === 1 ? ' WARNING' : ' WARNINGS') : ''].filter(Boolean).join(' · ')
      : 'VALID ' + dSpec.name;
    const dSetRaw = st.dSet[st.dProto] || {}, dSetNum = this.dSettings(st.dProto);

    // ---- field search ----
    const qHits = st.qOpen ? searchRun(this.qIndex(), st.qText, this.Q_LIMIT) : [];
    const qActive = Math.min(st.qIdx, Math.max(qHits.length - 1, 0));
    const qRows = qHits.map(({ entry: e, hit }, i) => ({
      name: e.name, abbr: e.shownAbbr, hasAbbr: !!e.shownAbbr, label: e.label, meta: e.meta, desc: e.desc,
      hasHit: !!hit, noHit: !hit, hitCode: hit ? hit.code : '', hitDesc: hit ? hit.desc : '',
      active: String(i === qActive),
      onClick: () => this.qGo(e),
      style: { padding: '10px 16px', cursor: 'pointer', borderBottom: '1px solid color-mix(in srgb, var(--color-text) 8%, transparent)',
        borderLeft: '2px solid ' + (i === qActive ? 'var(--color-accent)' : 'transparent'),
        background: i === qActive ? 'color-mix(in srgb, var(--color-accent) 10%, transparent)' : 'transparent' }
    }));
    const qTyped = st.qText.trim() !== '';

    const fromEp = !!(st.fid && this.EP_FIELD_IDS.includes(st.fid));
    const fDoc = st.fid ? this.fieldDoc(st.fid) : 'tm', fBook = BLUE_BOOKS[fDoc];
    const srcDoc = fBook.code;
    const srcLine = 'SOURCE · ' + fBook.code + ' · ' + fBook.title.toUpperCase() + ' · BLUE BOOK ' + blueBookRevision(fDoc);

    // tooltip
    const t = st.tip;
    const tf = t ? F[t.id] : null;
    const tipMeta = tf ? [tf.bits, tf.len, tf.pres].filter(Boolean).join(' · ') : '';
    const detail = p.tooltipDetail ?? 'full';

    // field page derived data
    let crumbs = [], chips = [], quotes = [], special = [], notes = [], mapCells = [], kids = [], struct = [], mapTitle = '';
    if (f) {
      const chain = [];
      let cur = f.parent;
      while (cur) { chain.unshift(cur); cur = cur === 'frame' ? null : (F[cur] ? F[cur].parent : null); }
      crumbs = chain.map((id, i) => ({ id, name: this.CRUMB_NAMES[id] || (F[id] ? F[id].n.toUpperCase() : id), sep: i < chain.length - 1 ? '/' : '' }));
      chips = [
        f.bits ? { t: f.bits, cls: 'tag-neutral' } : null,
        { t: f.len, cls: 'tag-neutral' },
        { t: f.pres, cls: f.pres === 'OPTIONAL' ? 'tag-outline' : 'tag-accent' },
        { t: f.ref, cls: 'tag-outline', link: blueBookLink(fDoc, f.ref) }
      ].filter(Boolean).map(c => ({ ...c, isLink: !!c.link, notLink: !c.link, href: c.link ? c.link.href : '', title: c.link ? c.link.title : '' }));
      quotes = f.q.map(q => ({ ...q, ...this.bbRefVals(fDoc, q.ref) }));
      special = f.sp.map(x => ({ ...x, ...this.bbRefVals(fDoc, x.ref) }));
      notes = f.nt;
      kids = f.kids.map(id => ({ id, name: F[id].n, meta: [F[id].bits, F[id].len].filter(Boolean).join(' · ') }));
      const weightOf = (fl) => {
        const L = fl.len || '';
        let m2 = L.match(/(\d+)\s*BIT/i); if (m2) return parseInt(m2[1], 10);
        m2 = L.match(/(?:–|-)\s*(\d+)\s*OCTET/i); if (m2) return Math.min(parseInt(m2[1], 10) * 8, 40);
        m2 = L.match(/(\d+)\s*OCTET/i); if (m2) return Math.min(parseInt(m2[1], 10) * 8, 40);
        m2 = L.match(/(\d+)\s*TO\s*(\d+)/i); if (m2) return 24;
        return 20;
      };
      struct = f.kids.map(id => {
        const k = F[id];
        const w = Math.max(weightOf(k), 2.2);
        return {
          id, name: k.n, meta: [k.bits, k.len].filter(Boolean).join(' · '),
          style: {
            flex: String(w), minWidth: 0, marginLeft: '-1px', height: '92px', padding: '8px 4px',
            border: '1px solid var(--color-text)', background: 'var(--color-bg)', cursor: 'pointer',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            gap: '4px', textAlign: 'center', transition: 'transform .12s ease, background .12s ease, box-shadow .12s ease'
          }
        };
      });
      if (struct.length) struct[0].style.marginLeft = 0;
      const m = this.MAPS[f.map];
      mapTitle = m.title;
      mapCells = m.cells.map(c => {
        const on = f.hi.includes(c.id);
        return {
          id: c.id, label: c.l,
          style: {
            flex: String(c.w), minWidth: 0, marginLeft: '-1px', padding: '10px 3px', textAlign: 'center',
            border: '1px solid ' + (on ? 'var(--color-accent)' : 'var(--color-text)'),
            fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: '11px', letterSpacing: '.06em',
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', cursor: 'pointer',
            background: on ? 'var(--color-accent)' : 'var(--color-bg)',
            color: on ? 'var(--color-bg)' : 'var(--color-text)'
          }
        };
      });
    }

    // EP diagram derived data
    let epDataCells = [], epIterInset = '0', epIterSpan = '1', epIterRest = '0', epHasIterate = false, epDataId = '', epNoData = false;
    if (ep) {
      const m = this.MAPS['epdata_' + st.epId];
      epDataId = 'epdata_' + st.epId;
      const cells = m.cells;
      epNoData = cells.length === 0;
      const total = cells.reduce((s, c) => s + c.w, 0);
      epDataCells = cells.map((c, i) => {
        const fld = F[c.id];
        const opt = fld && fld.pres === 'OPTIONAL';
        return {
          id: c.id, name: fld ? fld.n : c.l, meta: fld ? fld.pres : '', opt,
          style: {
            flex: String(c.w), minWidth: 0, marginLeft: i ? '-1px' : 0, height: '92px', padding: '8px 4px',
            border: '1px solid var(--color-text)', background: 'var(--color-bg)', cursor: 'pointer', position: 'relative',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            gap: '4px', textAlign: 'center', transition: 'transform .12s ease, background .12s ease, box-shadow .12s ease'
          }
        };
      });
      if (ep.iterate) {
        const iFrom = cells.findIndex(c => c.id === ep.iterate.from);
        const iTo = cells.findIndex(c => c.id === ep.iterate.to);
        if (iFrom >= 0 && iTo >= 0) {
          epHasIterate = true;
          const before = cells.slice(0, iFrom).reduce((s, c) => s + c.w, 0);
          const span = cells.slice(iFrom, iTo + 1).reduce((s, c) => s + c.w, 0);
          const after = total - before - span;
          epIterInset = (before / total * 100) + '%';
          epIterSpan = String(span);
          epIterRest = String(after);
        }
      }
    }

    const epItem = (it) => {
      const ready = !!(it.id && this.EP_DEF[it.id]);
      const active = ready && st.epId === it.id && st.view === 'ep';
      return {
        id: it.id || '', fig: it.fig, name: it.name, ready, active,
        onClick: ready ? ((e) => this.openEp(e.currentTarget.dataset.ep)) : (() => {}),
        rowStyle: {
          position: 'relative', padding: '5px 16px 5px 34px', display: 'flex', alignItems: 'center', gap: '8px',
          color: 'var(--color-neutral-800)', cursor: ready ? 'pointer' : 'default'
        }
      };
    };
    const epGroups = this.EP_GROUPS.map(g => ({ name: g.name, items: g.items.map(epItem) }));

    return {
      // nav
      isSpp: proto === 'spp' && !showBuilder && !showDecoder && !showProfile && !showCheat, isTm: proto === 'tm' && !showBuilder && !showDecoder && !showProfile && !showCheat, isTc: proto === 'tc' && !showBuilder && !showDecoder && !showProfile && !showCheat, isSdls: proto === 'sdls' && !showBuilder && !showDecoder && !showProfile && !showCheat,
      pickProto: (e) => this.setState({ proto: e.currentTarget.dataset.proto, view: 'diagram', tip: null, retView: null }),
      toggleEp: () => this.setState(s => ({ epOpen: !s.epOpen })),
      epOpen: st.epOpen,
      epBadge: st.epOpen ? '▾' : '▸',
      epGroups,
      stopClick: (e) => e.stopPropagation(),
      mainRef: (el) => { this.mainEl = el; },

      // views
      showDiagram, showTcDiagram, showSpDiagram, showSdlsDiagram, showField,
      lay, ...this.profileVals(st, pr, showProfile),
      bb: this.bbVals(),
      showCheat, ...this.cheatVals(st, pr, showCheat),
      showBuilder,
      qOpen: st.qOpen, qText: st.qText, qResults: qRows, qHasResults: qRows.length > 0,
      qShowMessage: qRows.length === 0,
      qMessage: qTyped ? 'Nothing matches ‘' + st.qText.trim() + '’.' : 'Search every field of every protocol by name, abbreviation, value or section. Values work in hex, decimal or binary: 0x7FE, 2046 and 11111111110 find the same thing. Add a protocol to narrow it down: tc scid.',
      qCount: qRows.length === this.Q_LIMIT ? 'First ' + qRows.length + ' results' : qRows.length ? qRows.length + (qRows.length === 1 ? ' result' : ' results') : '',
      qInputRef: this.qInputRef,
      qOpenClick: () => this.qShow(),
      qOnInput: (e) => this.setState({ qText: e.target.value, qIdx: 0 }),
      qBackdrop: (e) => { if (e.target === e.currentTarget) this.qHide(); },
      qOnKey: (e) => {
        if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
          e.preventDefault();
          if (!qHits.length) return;
          const next = (qActive + (e.key === 'ArrowDown' ? 1 : qHits.length - 1)) % qHits.length;
          this.setState({ qIdx: next }, () => {
            const row = typeof document !== 'undefined' && document.querySelector('[data-qactive="true"]');
            if (row && row.scrollIntoView) row.scrollIntoView({ block: 'nearest' });
          });
        } else if (e.key === 'Enter') {
          e.preventDefault();
          if (qHits[qActive]) this.qGo(qHits[qActive].entry);
        } else if (e.key === 'Tab') {
          e.preventDefault();
        }
      },
      bProtoTabs: this.BUILD_ORDER.map(id => ({
        id, name: this.BUILD_SPECS[id].tab,
        onClick: (e) => this.setState({ bProto: e.currentTarget.dataset.bproto, tip: null }),
        style: { padding: '8px 15px', border: '1px solid ' + (id === st.bProto ? 'var(--color-accent)' : 'var(--color-divider)'), background: id === st.bProto ? 'color-mix(in srgb, var(--color-accent) 12%, var(--color-bg))' : 'var(--color-bg)', cursor: 'pointer', fontSize: '12.5px', letterSpacing: '.06em', fontFamily: 'var(--font-heading)', fontWeight: '600', whiteSpace: 'nowrap', color: id === st.bProto ? 'var(--color-accent-900)' : 'var(--color-text)' }
      })),
      bSpecName: bSpec.name, bSpecNote: bSpec.note,
      bSections, bAfter,
      bPayShow: !!bSpec.pay, bPayList, bPayName: bSpec.pay ? bSpec.pay.name : '', bPayNote: bSpec.pay ? bSpec.pay.note + (bSdlsOn ? sdlsBuildPayloadNote(bSvc) : '') : '',
      bPayLen: bPayBits ? bPayBits + ' BITS · ' + (bPayBits / 8) + ' OCTETS' : 'NOT INCLUDED',
      bFieldList, bRibbon, bOctets, bHex: bHexStr, bBin: bBinStr,
      bTotalLabel: allBits.length + ' BITS · ' + (allBits.length / 8) + ' OCTETS',
      openBuilder: () => { this.setState({ view: 'build', fid: null, tip: null, retView: null }); if (this.mainEl) this.mainEl.scrollTop = 0; },
      bReset: () => this.setState(s => ({ bVals: { ...s.bVals, [this.bValsKey(s)]: {} } })),
      bProfileNote, bHasProfileNote: !!bProfileNote,
      bWireNote: 'Transmission order — most significant bit of octet 0 first.' + (allBits.length / 8 > this.BUILD_WIRE_MAX ? ' First ' + this.BUILD_WIRE_MAX + ' of ' + allBits.length / 8 + ' octets.' : ''),
      showDecoder,
      openDecoder: () => { this.setState({ view: 'decode', fid: null, tip: null, retView: null }); if (this.mainEl) this.mainEl.scrollTop = 0; },
      dProtoTabs: this.DECODE_ORDER.map(id => {
        const sp = this.DECODE_SPECS[id], on = id === st.dProto;
        return { id, name: sp.tab,
          onClick: (e) => this.setState({ dProto: e.currentTarget.dataset.dproto, tip: null }),
          style: { padding: '8px 15px', border: '1px solid ' + (on ? 'var(--color-accent)' : 'var(--color-divider)'), background: on ? 'color-mix(in srgb, var(--color-accent) 12%, var(--color-bg))' : 'var(--color-bg)', cursor: 'pointer', fontSize: '12.5px', letterSpacing: '.06em', fontFamily: 'var(--font-heading)', fontWeight: '600', whiteSpace: 'nowrap', color: on ? 'var(--color-accent-900)' : 'var(--color-text)' } };
      }),
      dSpecName: dSpec.name, dSpecNote: dSpec.note,
      dSetNote: pr ? 'From the mission profile ‘' + pr.name + '’. Edit them on the Mission Profile page, or switch to Manual above.' + (st.dProto === 'spp' ? '' : ' Each frame is also compared with what the profile says about its Spacecraft Identifier' + (st.dProto === 'tm' ? ', OCF and Secondary Header.' : '.')) : dSpec.setNote,
      dResetShow: !pr, dExampleNote: pr ? 'Loading an example switches to Manual: examples come with their own settings.' : '', dHasExampleNote: !!pr,
      dSettingsList: dSpec.settings.filter(sd => !sd.showIf || sd.showIf(dSetNum)).map(sd => {
        if (pr) {
          const fixed = dSetNum[sd.id];
          return { ...this.bbRefVals(st.dProto, sd.ref), id: sd.id, n: sd.n, ref: sd.ref, note: sd.note, isEnum: false, isNum: false, isFixed: true, unit: '', opts: [], min: '', max: '', value: '', over: false, overMsg: '', onInput: () => {},
            fixedLabel: sd.opts ? sd.opts.find(o => o.v === fixed).l : fixed + (sd.unit ? ' ' + sd.unit : '') };
        }
        const raw = dSetRaw[sd.id], v = raw === undefined ? String(sd.def) : raw;
        const clamped = !sd.opts && raw !== undefined && raw !== '' && String(dSetNum[sd.id]) !== String(Number(raw));
        return { ...this.bbRefVals(st.dProto, sd.ref), id: sd.id, n: sd.n, ref: sd.ref, unit: sd.unit, note: sd.note, min: String(sd.min), max: String(sd.max), value: v,
          isEnum: !!sd.opts, isNum: !sd.opts, isFixed: false, fixedLabel: '', opts: (sd.opts || []).map(o => ({ v: String(o.v), l: o.l })),
          over: clamped, overMsg: 'Allowed range is ' + sd.min + '–' + sd.max + ' — using ' + dSetNum[sd.id] + '.',
          onInput: (e) => { const val = e.target.value, p2 = this.state.dProto; this.setState(s2 => ({ dSet: { ...s2.dSet, [p2]: { ...(s2.dSet[p2] || {}), [sd.id]: val } } })); } };
      }),
      dHexText: dText,
      dOnHex: (e) => { const val = e.target.value, p2 = this.state.dProto; this.setState(s2 => ({ dHex: { ...s2.dHex, [p2]: val } })); },
      dClear: () => this.setState(s2 => ({ dHex: { ...s2.dHex, [s2.dProto]: '' } })),
      dResetSettings: () => this.setState(s2 => ({ dSet: { ...s2.dSet, [s2.dProto]: {} } })),
      dExamples: dSpec.examples.map(x => ({ l: x.l, hex: x.hex, onClick: () => this.setState(s2 => {
        const apply = Object.entries({ ...dSpec.exampleSet, ...x.set }).map(([k, v]) => [k, String(v)]);
        return { profileOn: false, dHex: { ...s2.dHex, [s2.dProto]: x.hex }, dSet: { ...s2.dSet, [s2.dProto]: { ...(s2.dSet[s2.dProto] || {}), ...Object.fromEntries(apply) } } };
      }) })),
      dParseBad: !!dParsed.err, dParseErr: dParsed.err,
      dParseLabel: dParsed.err ? 'INVALID' : dBytes.length + (dBytes.length === 1 ? ' OCTET' : ' OCTETS'),
      dTotalLabel: dParsed.err ? 'INVALID INPUT' : dBytes.length * 8 + ' BITS · ' + dBytes.length + ' OCTETS',
      dSummary, dSummaryStyle: 'font-size:9.5px;letter-spacing:.12em;font-weight:600;padding:3px 9px;white-space:nowrap;' + D_LEVEL[dSummaryLevel].css,
      dChecks, dHasFields: dRes.fields.length > 0, dRibbon, dFields, dDump, dOctets,
      dDumpMore: dBytes.length > D_DUMP_MAX, dDumpMoreLabel: '… ' + (dBytes.length - D_DUMP_MAX) + ' more octets not shown.',
      dWireNote: 'Transmission order — most significant bit of octet 0 first.' + (dBytes.length > D_WIRE_MAX ? ' First ' + D_WIRE_MAX + ' of ' + dBytes.length + ' octets.' : ''),

      // diagram
      phOpen: open.ph, shOpen: open.sh, dfsOpen: open.ph && open.dfs,
      phBadge: open.ph ? '▾' : '▸', shBadge: open.sh ? '▾' : '▸', dfsBadge: '§',
      tcPhOpen: open.tcPh, tcDfOpen: open.tcDf,
      tcPhBadge: open.tcPh ? '▾' : '▸', tcDfBadge: open.tcDf ? '▾' : '▸',
      spPhOpen: open.spPh, spShOpen: open.spSh,
      spPhBadge: open.spPh ? '▾' : '▸', spShBadge: open.spSh ? '▾' : '▸',
      sdShOpen: open.sdSh, sdTrOpen: open.sdTr,
      sdShBadge: open.sdSh ? '▾' : '▸', sdTrBadge: open.sdTr ? '▾' : '▸',
      ...Object.fromEntries(['ph','sh','spPh','spSh','tcPh','tcDf'].map(k => [k + 'Bg', open[k] ? 'var(--color-accent-200)' : 'var(--color-bg)'])),
      sdShBg: open.sdSh ? 'var(--color-accent-300)' : 'var(--color-accent-100)', sdTrBg: open.sdTr ? 'var(--color-accent-300)' : 'var(--color-accent-100)',

      // SDLS coverage — MAC vs encryption over each securable base frame
      sdCovTabs: this.SDLS_COV_ORDER.map(id => {
        const on = (st.sdCov || 'tm') === id;
        return { id, name: this.SDLS_COV[id].tab,
          style: 'padding:7px 15px;cursor:pointer;font-family:var(--font-heading);font-weight:600;font-size:11.5px;letter-spacing:.14em;border:1px solid ' + (on ? 'var(--color-accent)' : 'var(--color-divider)') + ';background:' + (on ? 'var(--color-accent)' : 'transparent') + ';color:' + (on ? 'var(--color-bg)' : 'var(--color-neutral-700)'),
          onClick: () => this.setState({ sdCov: id, tip: null }) };
      }),
      sdCovGrid: '152px ' + cov.cells.map(c => 'minmax(0,' + c.w + 'fr)').join(' '),
      sdCovFigHref: (blueBookLink('sdls', cov.fig) || { href: BLUE_BOOKS.sdls.url }).href, sdCovFigTitle: (blueBookLink('sdls', cov.fig) || { title: '' }).title,
      sdCovName: cov.name, sdCovFig: cov.fig, sdCovBase: cov.base, sdCovNote: cov.note,
      sdCovHasRanges: !!covLay, sdCovRanges: covLay ? profileCoverage(pr, st.sdCov || 'tm').text : '',
      sdCovCells: cov.cells.map((c, i) => ({
        n: c.n, sub: c.sub || '', hasSub: !!c.sub, len: covLay && c.k ? profileFieldLabel(covLay.fields.find(x => x.key === c.k)) : c.len,
        style: 'min-width:0;border:1px solid var(--color-text);' + (i ? 'margin-left:-1px;' : '') + 'min-height:108px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:3px;text-align:center;padding:8px 4px;background:' + (c.enc && covEnc ? 'var(--color-accent-100)' : 'var(--color-bg)')
      })),
      sdCovPay: cov.cells.map((c, i) => {
        const first = cov.cells.findIndex(x => x.pay), lastPay = cov.cells.map(x => x.pay).lastIndexOf(true);
        const base = 'min-width:0;height:14px;display:flex;align-items:center;justify-content:center;border-left:1px solid transparent;border-right:1px solid transparent;' + (i ? 'margin-left:-1px;' : '');
        if (!c.pay) return { style: base };
        return { style: base + 'border-top:1px solid var(--color-neutral-600);' + (i === first ? 'border-left-color:var(--color-neutral-600);' : '') + (i === lastPay ? 'border-right-color:var(--color-neutral-600);' : '') };
      }),
      sdCovMac: cov.cells.map((c, i) => this.covSeg(c, i, cov.cells.length - 1, !covAuth ? 'none' : c.mac === 'in' ? 'fill' : (c.mac === 'mask' ? 'mask' : 'none'), covAuth && c.mac === 'mask' ? 'MASKED OUT' : '')),
      sdCovAad: cov.cells.map((c, i) => this.covSeg(c, i, cov.cells.length - 1, !covAad || c.enc ? 'none' : (c.mac === 'in' ? 'fill' : (c.mac === 'mask' ? 'mask' : 'none')), '')),
      sdCovEnc: cov.cells.map((c, i) => this.covSeg(c, i, cov.cells.length - 1, c.enc && covEnc ? 'deep' : 'none', c.enc && covEnc ? 'ENCRYPTED' : '')),
      showEpDiagram,
      epTitle: ep ? ep.name : '', epTitleUpper: ep ? ep.name.toUpperCase() : '',
      ...(() => {
        const fig = ep ? blueBookLink('ep', ep.fig) : null, ref = ep ? blueBookLink('ep', ep.ref) : null;
        return { epFigHref: fig ? fig.href : BLUE_BOOKS.ep.url, epFigTitle: fig ? fig.title : '', epRefHref: ref ? ref.href : BLUE_BOOKS.ep.url, epRefTitle: ref ? ref.title : '' };
      })(),
      epServiceLabel: ep ? ep.service : '', epFig: ep ? ep.fig : '', epIntro: ep ? ep.intro : '',
      epRefLabel: ep ? ep.ref : '', epProcCode: ep ? ep.proc : '', epDataNote: ep ? ep.dataNote : '', epTypeBit: ep ? (ep.pt || '0') : '0',
      epHdrOpen: open.epHdr, epDataOpen: open.epData,
      epHdrBadge: open.epHdr ? '▾' : '▸', epDataBadge: open.epData ? '▾' : '▸',
      epDataCells, epHasIterate, epIterInset, epIterSpan, epIterRest, epDataId,
      epNoData, epHasData: !epNoData, epDataBoxSub: epNoData ? 'EMPTY · NO DATA FIELD' : 'VARIABLE · OCTET-ALIGNED',
      hatch: p.hatchOptional ?? true,
      fieldClick: (e) => {
        const id = e.currentTarget.dataset.field;
        if (!id) return;
        const o = this.resolved();
        if (id === 'ph') this.setState({ phOpen: !o.ph, tip: null });
        else if (id === 'sh') this.setState({ shOpen: !o.sh, tip: null });
        else if (id === 'tcph') this.setState({ tcPhOpen: !o.tcPh, tip: null });
        else if (id === 'tcdf') this.setState({ tcDfOpen: !o.tcDf, tip: null });
        else if (id === 'spph') this.setState({ spPhOpen: !o.spPh, tip: null });
        else if (id === 'spsh') this.setState({ spShOpen: !o.spSh, tip: null });
        else if (id === 'sdsh') this.setState({ sdShOpen: !o.sdSh, tip: null });
        else if (id === 'sdtr') this.setState({ sdTrOpen: !o.sdTr, tip: null });
        else if (id === 'ephdr') this.setState({ epHdrOpen: !o.epHdr, tip: null });
        else if (id === 'epdata') this.setState({ epDataOpen: !o.epData, tip: null });
        else this.openPage(id);
      },
      openRef: (e) => {
        e.stopPropagation();
        const id = e.currentTarget.dataset.field;
        if (!id) return;
        if (id === 'epframe') { this.setState({ view: 'ep', fid: null, tip: null }); return; }
        if (id === 'frame' || id === 'tcframe' || id === 'spframe' || id === 'sdframe') { this.setState({ view: 'diagram', fid: null, tip: null, retView: null }); return; }
        this.openPage(id);
      },
      back: () => {
        if (this.state.retView) this.setState({ view: this.state.retView, fid: null, tip: null, retView: null });
        else if (this.state.fid && this.EP_FIELD_IDS.includes(this.state.fid) && this.state.epId) this.setState({ view: 'ep', fid: null, tip: null });
        else this.setState({ view: 'diagram', fid: null, tip: null });
      },

      // tooltip
      tipOn: !!tf,
      tipPos: t ? { position: 'fixed', left: t.x + 'px', top: t.y + 'px', transform: 'translate(-50%,-100%)', zIndex: 60, pointerEvents: 'none' } : {},
      tipName: tf ? tf.n : '', tipMeta,
      tipDesc: tf && detail === 'full' ? tf.desc : '',
      tipRef: tf ? tf.ref : '',
      tipIn: (e) => {
        const id = e.currentTarget.dataset.field;
        if (!id || !F[id]) return;
        const r = e.currentTarget.getBoundingClientRect();
        const x = Math.min(Math.max(r.left + r.width / 2, 152), window.innerWidth - 152);
        this.setState({ tip: { id, x, y: r.top - 9 } });
      },
      tipOut: () => { if (this.state.tip) this.setState({ tip: null }); },
      clearTip: () => { if (this.state.tip) this.setState({ tip: null }); },

      // field page
      fieldName: f ? f.n : '', fieldDesc: f ? f.desc : '', fieldRef: f ? f.ref : '', srcDoc, srcLine,
      epCanGoBack: st.retView === 'cheat',
      backLabel: st.retView === 'decode' ? 'FRAME DECODER' : st.retView === 'build' ? 'FRAME BUILDER' : st.retView === 'cheat' ? 'CHEAT SHEET' : fromEp ? 'PDU DIAGRAM' : 'FRAME DIAGRAM',
      crumbs, fieldChips: chips, fieldQuotes: quotes,
      hasSpecial: special.length > 0, fieldSpecial: special,
      hasNotes: notes.length > 0, fieldNotes: notes,
      hasMap: mapCells.length > 0, mapTitle, mapCells,
      hasStruct: struct.length > 0, structCells: struct,
      hasKids: kids.length > 0, fieldKids: kids
    };
  }
}

