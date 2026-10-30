class Component extends DCLogic {
  state = { proto: 'spp', view: 'diagram', fid: null, phOpen: null, shOpen: null, dfsOpen: null, tcPhOpen: null, tcDfOpen: null, spPhOpen: null, spShOpen: null, sdShOpen: null, sdTrOpen: null, dfsModal: false, epOpen: false, epId: null, epHdrOpen: null, epDataOpen: null, tip: null, bProto: 'spp', bVals: {}, sdCov: 'tm', dProto: 'spp', dHex: {}, dSet: {}, retView: null };

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

  BUILD_SPECS = { tm: TM_BUILD, tc: TC_BUILD, spp: SPP_BUILD, sdls: SDLS_BUILD };

  BUILD_ORDER = ['tm', 'tc', 'spp', 'sdls'];

  bTint(i) {
    const t = ['46%', '20%', '68%', '32%'];
    return 'color-mix(in srgb, var(--color-accent) ' + t[i % 4] + ', var(--color-bg))';
  }

  bFieldBits(f, vals) {
    if (!f.varOct) return f.bits;
    const raw = vals[f.id + '__oct'];
    const o = raw === undefined || raw === '' ? f.defOct : Number(raw);
    return (isFinite(o) && o >= 0 ? Math.min(o, f.maxOct) : f.defOct) * 8;
  }

  bHexClean(s) { return String(s == null ? '' : s).replace(/[^0-9a-fA-F]/g, '').toUpperCase(); }

  bMakeField(fd, fi, vals, allBits, ribbon) {
    const nb = this.bFieldBits(fd, vals);
    const tint = this.bTint(fi);
    const isHex = fd.kind === 'hex';
    const derived = !!fd.derive;
    const nOct = Math.floor(nb / 8);
    const max = nb > 0 ? Math.pow(2, nb) - 1 : 0;
    let bin = '', over = false, vc = 0, hexVal = '', note = '';
    if (isHex) {
      const rawH = vals[fd.id];
      hexVal = this.bHexClean(rawH === undefined ? (fd.defHex || '') : rawH);
      const want = nOct * 2;
      const h = hexVal.slice(0, want).padEnd(want, '0');
      if (hexVal.length > want) note = nOct === 0 ? 'Length is 0 — this field is not transmitted.' : 'Extra digits ignored — field is ' + nOct + ' octet' + (nOct === 1 ? '' : 's') + '.';
      else if (hexVal.length < want) note = 'Zero-padded to ' + nOct + ' octet' + (nOct === 1 ? '' : 's') + '.';
      bin = h.split('').map(c => parseInt(c, 16).toString(2).padStart(4, '0')).join('');
    } else {
      const raw = derived ? fd.derive(vals) : vals[fd.id];
      let v = Number(raw === undefined || raw === '' ? fd.def : raw);
      if (!isFinite(v) || v < 0) v = 0;
      v = Math.floor(v);
      over = v > max;
      vc = over ? max : v;
      bin = nb > 0 ? vc.toString(2).padStart(nb, '0') : '';
      if (over) note = 'Maximum for ' + nb + ' bits is ' + max + ' — clamped.';
    }
    for (let i = 0; i < nb; i++) allBits.push({ b: bin[i], fi, tint, fname: fd.n });
    const octRaw = vals[fd.id + '__oct'];
    const octVal = fd.varOct ? String(octRaw === undefined || octRaw === '' ? fd.defOct : octRaw) : '';
    const octOpts = [];
    if (fd.varOct && !fd.octNum) for (let o = (fd.minOct || 0); o <= fd.maxOct; o++) octOpts.push({ v: String(o), l: o === 0 ? '0 · field absent' : o + (o === 1 ? ' octet' : ' octets') });
    if (nb > 0) ribbon.push({
      abbr: fd.abbr, bits: String(nb),
      value: isHex ? (nOct <= 2 ? hexVal.slice(0, nOct * 2).padEnd(nOct * 2, '0') : nOct + ' OCT') : String(vc),
      style: { flex: String(Math.min(nb, 24)) + ' 1 auto', minWidth: '40px', border: '1px solid var(--color-text)', marginLeft: ribbon.length ? '-1px' : '0', background: tint, padding: '9px 3px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '2px', textAlign: 'center', overflow: 'hidden' }
    });
    return {
      id: fd.id, n: fd.n, swatch: nb > 0 ? tint : 'transparent',
      bitsLabel: nb > 0 ? nb + ' BIT' + (nb === 1 ? '' : 'S') : 'ABSENT',
      isEnum: !!fd.opts && !derived, isNum: !fd.opts && !isHex && !derived && nb > 0,
      isHex, isDerived: derived,
      opts: (fd.opts || []).map(o => ({ v: String(o.v), l: o.l })),
      value: isHex ? hexVal : String(derived ? vc : (vals[fd.id] === undefined || vals[fd.id] === '' ? fd.def : vals[fd.id])),
      derivedLabel: derived ? String(vc) : '', derivedNote: fd.deriveNote || '',
      hexPlaceholder: nOct > 0 ? '00'.repeat(Math.min(nOct, 12)) : 'field absent',
      max: String(max), binLabel: nb > 0 && !isHex ? bin : '',
      hasOct: !!fd.varOct && !fd.octNum, hasOctNum: !!fd.octNum, oct: octVal, octOpts, maxOct: String(fd.maxOct || 0),
      over: !!note, overMsg: note,
      onChange: (e) => this.bSetVal(fd.id, isHex ? this.bHexClean(e.target.value) : e.target.value),
      onOct: (e) => this.bSetVal(fd.id + '__oct', e.target.value)
    };
  }

  bSetVal(id, raw) {
    const p = this.state.bProto;
    this.setState(s => ({ bVals: { ...s.bVals, [p]: { ...(s.bVals[p] || {}), [id]: raw } } }));
  }

  // Frame decoder. Each spec's decode(bytes, settings) returns
  //   fields: [{ fid, n, abbr, off, bits, value, raw, meaning, octets, extra }] — wire order, off/bits in bits;
  //           octets = octet string (raw is hex), extra = received but not part of the PDU
  //   checks: [{ level: 'ok' | 'info' | 'warn' | 'err', msg, ref }]
  // settings are the mission's managed parameters, resolved to numbers by dSettings().
  DECODE_ORDER = ['spp', 'tm', 'tc', 'sdls'];
  DECODE_SPECS = {
    spp: SPP_DECODE,
    tm: { tab: 'TM SDLP', soon: true },
    tc: { tab: 'TC SDLP', soon: true },
    sdls: { tab: 'SDLS', soon: true }
  };

  dSettings(proto) {
    const spec = this.DECODE_SPECS[proto], raw = this.state.dSet[proto] || {}, out = {};
    (spec.settings || []).forEach(s => {
      const v = Number(raw[s.id] === undefined || raw[s.id] === '' ? s.def : raw[s.id]);
      out[s.id] = isFinite(v) ? Math.min(Math.max(Math.floor(v), s.min), s.max) : s.def;
    });
    return out;
  }

  EP_GROUPS = SDLS_EP_GROUPS;
  EP_DEF = SDLS_EP_PROCEDURES;
  EP_FIELD_IDS = SDLS_EP_FIELD_IDS;

  PROTOS = {
    spp:  { title: 'SPACE PACKET PROTOCOL', code: 'CCSDS 133.0-B-2', url: 'https://ccsds.org/Pubs/133x0b2e2.pdf' },
    tc:   { title: 'TC SPACE DATA LINK PROTOCOL', code: 'CCSDS 232.0-B-4', url: 'https://ccsds.org/Pubs/232x0b4e1c1.pdf' },
    sdls: { title: 'SPACE DATA LINK SECURITY PROTOCOL', code: 'CCSDS 355.0-B-2', url: 'https://ccsds.org/Pubs/355x0b2.pdf' }
  };

  // Per-protocol tables are defined in src/protocols/*.js; order matters only for iteration.
  MAPS = { ...TM_MAPS, ...TC_MAPS, ...SPP_MAPS, ...SDLS_MAPS, ...SDLS_EP_MAPS };
  F = { ...TM_FIELDS, ...TC_FIELDS, ...SPP_FIELDS, ...SDLS_FIELDS, ...SDLS_EP_FIELDS };
  CRUMB_NAMES = { ...TM_CRUMBS, ...TC_CRUMBS, ...SPP_CRUMBS, ...SDLS_CRUMBS, ...SDLS_EP_CRUMBS };

  // retView: where BACK leads from a field page. Kept while browsing between field pages, reset when entered from elsewhere.
  openPage(id, retView) {
    const ret = retView !== undefined ? retView : (this.state.view === 'field' ? this.state.retView : null);
    this.setState({ view: 'field', fid: id, tip: null, dfsModal: false, retView: ret });
    if (this.mainEl) this.mainEl.scrollTop = 0;
  }

  openEp(id) {
    if (!this.EP_DEF[id]) return;
    this.setState({ view: 'ep', epId: id, fid: null, tip: null, dfsModal: false });
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
    const ep = st.epId ? this.EP_DEF[st.epId] : null;
    const showEpDiagram = st.view === 'ep' && !!ep;
    const f = st.fid ? F[st.fid] : null;
    const showField = st.view === 'field' && !!f;
    const showPlaceholder = false;
    const showBuilder = st.view === 'build';

    // ---- frame builder ----
    const bSpec = this.BUILD_SPECS[st.bProto] || this.BUILD_SPECS.tm;
    const bVals = st.bVals[st.bProto] || {};
    const bFieldList = [], bSecList = [], bRibbon = [], allBits = [];
    let bIdx = 0;
    bSpec.fields.forEach(fd => { bFieldList.push(this.bMakeField(fd, bIdx++, bVals, allBits, bRibbon)); });
    const bSec = bSpec.sec || null;
    let bSecOn = false;
    if (bSec) {
      const flagDef = (bSpec.fields.find(f => f.id === bSec.flag) || {}).def;
      const flagRaw = bVals[bSec.flag];
      bSecOn = Number(flagRaw === undefined || flagRaw === '' ? flagDef : flagRaw) === 1;
      if (bSecOn) bSec.fields.forEach(fd => { bSecList.push(this.bMakeField(fd, bIdx++, bVals, allBits, bRibbon)); });
    }
    const bSecBits = bSecList.reduce((n, f) => n + (f.bitsLabel === 'ABSENT' ? 0 : parseInt(f.bitsLabel, 10)), 0);
    const bPayList = [];
    if (bSpec.pay) bPayList.push(this.bMakeField({ id: 'payload', n: bSpec.pay.field, bits: 0, def: 0, abbr: bSpec.pay.abbr, kind: 'hex', varOct: true, octNum: true, defOct: 0, minOct: 0, maxOct: 128, defHex: '' }, bIdx++, bVals, allBits, bRibbon));
    const bPayBits = bPayList.length && bPayList[0].bitsLabel !== 'ABSENT' ? parseInt(bPayList[0].bitsLabel, 10) : 0;
    const bOctets = [];
    for (let i = 0; i < allBits.length; i += 8) {
      const chunk = allBits.slice(i, i + 8);
      const binStr = chunk.map(x => x.b).join('');
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
    const bHexStr = bOctets.map(o => o.hex.replace('0x', '')).join(' ');
    const bBinStr = bOctets.map(o => o.cells.map(c => c.b).join('')).join(' ');

    // ---- frame decoder ----
    const showDecoder = st.view === 'decode';
    const dSpec = this.DECODE_SPECS[st.dProto];
    const dText = st.dHex[st.dProto] !== undefined ? st.dHex[st.dProto] : dSpec.examples[0].hex;
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
        onClick: (e) => { const id = e.currentTarget.dataset.dfield; if (id && F[id]) { this.setState({ proto: st.dProto }); this.openPage(id, 'decode'); } },
        rowStyle: { display: 'grid', gridTemplateColumns: '14px minmax(0,2fr) minmax(0,.9fr) minmax(0,1.5fr) minmax(0,.9fr) minmax(0,2fr)', columnGap: '10px', alignItems: 'baseline', padding: '9px 6px', borderBottom: '1px solid var(--color-divider)', cursor: fd.fid ? 'pointer' : 'default' }
      };
    });
    const D_DUMP_MAX = 512, D_WIRE_MAX = 16;
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
    const dChecks = dRes.checks.map(c => ({ label: D_LEVEL[c.level].l, msg: c.msg, ref: c.ref || '', badgeStyle: dBadge + D_LEVEL[c.level].css }));
    const dErrs = dRes.checks.filter(c => c.level === 'err').length, dWarns = dRes.checks.filter(c => c.level === 'warn').length;
    const dSummaryLevel = dParsed.err || dErrs ? 'err' : dWarns ? 'warn' : dBytes.length ? 'ok' : 'info';
    const dSummary = dParsed.err ? 'INPUT ERROR' : !dBytes.length ? 'NO INPUT'
      : dErrs || dWarns ? [dErrs ? dErrs + (dErrs === 1 ? ' ERROR' : ' ERRORS') : '', dWarns ? dWarns + (dWarns === 1 ? ' WARNING' : ' WARNINGS') : ''].filter(Boolean).join(' · ')
      : 'VALID ' + dSpec.name;
    const dSetRaw = st.dSet[st.dProto] || {}, dSetNum = this.dSettings(st.dProto);

    const fromEp = !!(st.fid && this.EP_FIELD_IDS.includes(st.fid));
    const fromTc = !!(st.fid && st.fid.slice(0, 2) === 'tc');
    const fromSd = !fromEp && !!(st.fid && (st.fid.slice(0, 2) === 'sd' || ['spi', 'iv', 'sqn', 'pl', 'mac'].includes(st.fid)));
    const fromSp = !fromEp && !!(st.fid && st.fid.slice(0, 2) === 'sp' && !fromSd);
    const srcDoc = fromEp ? 'CCSDS 355.1-B-1' : fromTc ? 'CCSDS 232.0-B-4' : fromSp ? 'CCSDS 133.0-B-2' : fromSd ? 'CCSDS 355.0-B-2' : 'CCSDS 132.0-B-3';
    const srcLine = fromEp
      ? 'SOURCE · CCSDS 355.1-B-1 · SPACE DATA LINK SECURITY PROTOCOL — EXTENDED PROCEDURES · BLUE BOOK ISSUE 1 · FEBRUARY 2020'
      : fromTc
      ? 'SOURCE · CCSDS 232.0-B-4 · TC SPACE DATA LINK PROTOCOL · BLUE BOOK ISSUE 4 · OCTOBER 2021'
      : fromSp
        ? 'SOURCE · CCSDS 133.0-B-2 · SPACE PACKET PROTOCOL · BLUE BOOK ISSUE 2 · JUNE 2020'
        : fromSd
          ? 'SOURCE · CCSDS 355.0-B-2 · SPACE DATA LINK SECURITY PROTOCOL · BLUE BOOK ISSUE 2 · JULY 2022'
          : 'SOURCE · CCSDS 132.0-B-3 · TM SPACE DATA LINK PROTOCOL · BLUE BOOK ISSUE 3 · OCTOBER 2021';
    const pr = this.PROTOS[proto] || {};

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
        { t: f.ref, cls: 'tag-outline' }
      ].filter(Boolean);
      quotes = f.q;
      special = f.sp;
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
      isSpp: proto === 'spp' && !showBuilder && !showDecoder, isTm: proto === 'tm' && !showBuilder && !showDecoder, isTc: proto === 'tc' && !showBuilder && !showDecoder, isSdls: proto === 'sdls' && !showBuilder && !showDecoder,
      pickProto: (e) => this.setState({ proto: e.currentTarget.dataset.proto, view: 'diagram', tip: null, retView: null }),
      goTm: () => this.setState({ proto: 'tm', view: 'diagram', tip: null }),
      toggleEp: () => this.setState(s => ({ epOpen: !s.epOpen })),
      epOpen: st.epOpen,
      epBadge: st.epOpen ? '▾' : '▸',
      epGroups,
      stopClick: (e) => e.stopPropagation(),
      mainRef: (el) => { this.mainEl = el; },

      // views
      showDiagram, showTcDiagram, showSpDiagram, showSdlsDiagram, showField, showPlaceholder,
      showBuilder,
      bProtoTabs: this.BUILD_ORDER.map(id => ({
        id, name: this.BUILD_SPECS[id].tab,
        onClick: (e) => this.setState({ bProto: e.currentTarget.dataset.bproto, tip: null }),
        style: { padding: '8px 15px', border: '1px solid ' + (id === st.bProto ? 'var(--color-accent)' : 'var(--color-divider)'), background: id === st.bProto ? 'color-mix(in srgb, var(--color-accent) 12%, var(--color-bg))' : 'var(--color-bg)', cursor: 'pointer', fontSize: '12.5px', letterSpacing: '.06em', fontFamily: 'var(--font-heading)', fontWeight: '600', whiteSpace: 'nowrap', color: id === st.bProto ? 'var(--color-accent-900)' : 'var(--color-text)' }
      })),
      bSpecName: bSpec.name, bSpecNote: bSpec.note,
      bSecShow: !!bSec, bSecOn, bSecOff: !!bSec && !bSecOn, bSecList,
      bSecName: bSec ? bSec.name : '', bSecForm: bSec ? bSec.form : '',
      bSecNote: bSec ? (bSecOn ? bSec.note : bSec.off) : '',
      bSecLen: bSecOn ? bSecBits + ' BITS · ' + (bSecBits / 8) + ' OCTETS' : '',
      bPayShow: !!bSpec.pay, bPayList, bPayName: bSpec.pay ? bSpec.pay.name : '', bPayNote: bSpec.pay ? bSpec.pay.note : '',
      bPayLen: bPayBits ? bPayBits + ' BITS · ' + (bPayBits / 8) + ' OCTETS' : 'NOT INCLUDED',
      bFieldList, bRibbon, bOctets, bHex: bHexStr, bBin: bBinStr,
      bTotalLabel: allBits.length + ' BITS · ' + (allBits.length / 8) + ' OCTETS',
      openBuilder: () => { this.setState({ view: 'build', fid: null, tip: null, retView: null }); if (this.mainEl) this.mainEl.scrollTop = 0; },
      bReset: () => this.setState(s => ({ bVals: { ...s.bVals, [s.bProto]: {} } })),
      showDecoder,
      openDecoder: () => { this.setState({ view: 'decode', fid: null, tip: null, retView: null }); if (this.mainEl) this.mainEl.scrollTop = 0; },
      dProtoTabs: this.DECODE_ORDER.map(id => {
        const sp = this.DECODE_SPECS[id], on = id === st.dProto;
        return { id, name: sp.tab, soon: !!sp.soon, title: sp.soon ? 'Decoder not implemented yet' : '',
          onClick: sp.soon ? (() => {}) : ((e) => this.setState({ dProto: e.currentTarget.dataset.dproto, tip: null })),
          style: { padding: '8px 15px', border: '1px solid ' + (on ? 'var(--color-accent)' : 'var(--color-divider)'), background: on ? 'color-mix(in srgb, var(--color-accent) 12%, var(--color-bg))' : 'var(--color-bg)', cursor: sp.soon ? 'default' : 'pointer', opacity: sp.soon ? '.55' : '1', fontSize: '12.5px', letterSpacing: '.06em', fontFamily: 'var(--font-heading)', fontWeight: '600', whiteSpace: 'nowrap', color: on ? 'var(--color-accent-900)' : 'var(--color-text)' } };
      }),
      dSpecName: dSpec.name, dSpecNote: dSpec.note, dSetNote: dSpec.setNote,
      dSettingsList: dSpec.settings.map(sd => {
        const raw = dSetRaw[sd.id], v = raw === undefined ? String(sd.def) : raw;
        const clamped = raw !== undefined && raw !== '' && String(dSetNum[sd.id]) !== String(Number(raw));
        return { id: sd.id, n: sd.n, ref: sd.ref, unit: sd.unit, note: sd.note, min: String(sd.min), max: String(sd.max), value: v,
          over: clamped, overMsg: 'Allowed range is ' + sd.min + '–' + sd.max + ' — using ' + dSetNum[sd.id] + '.',
          onInput: (e) => { const val = e.target.value, p2 = this.state.dProto; this.setState(s2 => ({ dSet: { ...s2.dSet, [p2]: { ...(s2.dSet[p2] || {}), [sd.id]: val } } })); } };
      }),
      dHexText: dText,
      dOnHex: (e) => { const val = e.target.value, p2 = this.state.dProto; this.setState(s2 => ({ dHex: { ...s2.dHex, [p2]: val } })); },
      dClear: () => this.setState(s2 => ({ dHex: { ...s2.dHex, [s2.dProto]: '' } })),
      dExamples: dSpec.examples.map(x => ({ l: x.l, hex: x.hex, onClick: () => this.setState(s2 => ({ dHex: { ...s2.dHex, [s2.dProto]: x.hex } })) })),
      dParseBad: !!dParsed.err, dParseErr: dParsed.err,
      dParseLabel: dParsed.err ? 'INVALID' : dBytes.length + (dBytes.length === 1 ? ' OCTET' : ' OCTETS'),
      dTotalLabel: dParsed.err ? 'INVALID INPUT' : dBytes.length * 8 + ' BITS · ' + dBytes.length + ' OCTETS',
      dSummary, dSummaryStyle: 'font-size:9.5px;letter-spacing:.12em;font-weight:600;padding:3px 9px;white-space:nowrap;' + D_LEVEL[dSummaryLevel].css,
      dChecks, dHasFields: dRes.fields.length > 0, dRibbon, dFields, dDump, dOctets,
      dDumpMore: dBytes.length > D_DUMP_MAX, dDumpMoreLabel: '… ' + (dBytes.length - D_DUMP_MAX) + ' more octets not shown.',
      dWireNote: 'Transmission order — most significant bit of octet 0 first.' + (dBytes.length > D_WIRE_MAX ? ' First ' + D_WIRE_MAX + ' of ' + dBytes.length + ' octets.' : ''),
      protoTitle: pr.title || '', protoCode: pr.code || '',
      protoCodeLabel: pr.code ? pr.code + ' ↗' : '', protoCodeUrl: pr.url || '#',

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
      sdCovName: cov.name, sdCovFig: cov.fig, sdCovBase: cov.base, sdCovNote: cov.note,
      sdCovCells: cov.cells.map((c, i) => ({
        n: c.n, sub: c.sub || '', hasSub: !!c.sub, len: c.len,
        style: 'min-width:0;border:1px solid var(--color-text);' + (i ? 'margin-left:-1px;' : '') + 'min-height:108px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:3px;text-align:center;padding:8px 4px;background:' + (c.enc ? 'var(--color-accent-100)' : 'var(--color-bg)')
      })),
      sdCovPay: cov.cells.map((c, i) => {
        const first = cov.cells.findIndex(x => x.pay), lastPay = cov.cells.map(x => x.pay).lastIndexOf(true);
        const base = 'min-width:0;height:14px;display:flex;align-items:center;justify-content:center;border-left:1px solid transparent;border-right:1px solid transparent;' + (i ? 'margin-left:-1px;' : '');
        if (!c.pay) return { style: base };
        return { style: base + 'border-top:1px solid var(--color-neutral-600);' + (i === first ? 'border-left-color:var(--color-neutral-600);' : '') + (i === lastPay ? 'border-right-color:var(--color-neutral-600);' : '') };
      }),
      sdCovMac: cov.cells.map((c, i) => this.covSeg(c, i, cov.cells.length - 1, c.mac === 'in' ? 'fill' : (c.mac === 'mask' ? 'mask' : 'none'), c.mac === 'mask' ? 'MASKED OUT' : '')),
      sdCovAad: cov.cells.map((c, i) => this.covSeg(c, i, cov.cells.length - 1, c.enc ? 'none' : (c.mac === 'in' ? 'fill' : (c.mac === 'mask' ? 'mask' : 'none')), c.enc ? '' : '')),
      sdCovEnc: cov.cells.map((c, i) => this.covSeg(c, i, cov.cells.length - 1, c.enc ? 'deep' : 'none', c.enc ? 'ENCRYPTED' : '')),
      showEpDiagram,
      epTitle: ep ? ep.name : '', epTitleUpper: ep ? ep.name.toUpperCase() : '',
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
        if (this.state.retView === 'decode') this.setState({ view: 'decode', fid: null, tip: null, retView: null });
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
      backLabel: st.retView === 'decode' ? 'FRAME DECODER' : fromEp ? 'PDU DIAGRAM' : 'FRAME DIAGRAM',
      crumbs, fieldChips: chips, fieldQuotes: quotes,
      hasSpecial: special.length > 0, fieldSpecial: special,
      hasNotes: notes.length > 0, fieldNotes: notes,
      hasMap: mapCells.length > 0, mapTitle, mapCells,
      hasStruct: struct.length > 0, structCells: struct,
      hasKids: kids.length > 0, fieldKids: kids
    };
  }
}

