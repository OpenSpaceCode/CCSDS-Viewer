// Field search (Ctrl+K). Pure functions over the field tables.
// Special values are written as binary in the Standards (‘11111111110’), so numeric queries like 0x7FE or 2046 are
// matched by value, not as text.

// Numbers in a literal: runs of 0s and 1s are binary, other digits decimal. '0XXXXXXX' holds none.
function searchLiteralValues(code) {
  const out = [];
  for (const [run] of code.matchAll(/\b\d+\b/g)) {
    if (run.length <= 48) out.push(/^[01]+$/.test(run) ? parseInt(run, 2) : parseInt(run, 10));
  }
  return out;
}

// The values a query token can stand for. Hex needs 0x or a mix of digits and letters (7fe), so words like 'fade' stay words.
// Short decimals are left out: '3' would match every flag set to ‘11’.
function searchQueryValues(token) {
  if (/^0x[0-9a-f]+$/.test(token)) return [parseInt(token, 16)];
  if (/^[0-9a-f]+$/.test(token) && /[0-9]/.test(token) && /[a-f]/.test(token)) return [parseInt(token, 16)];
  if (/^\d{3,}$/.test(token)) return [parseInt(token, 10), ...(/^[01]+$/.test(token) ? [parseInt(token, 2)] : [])];
  return [];
}

function searchInitials(name) {
  return name.replace(/\(.*?\)/g, ' ').split(/[\s-]+/).filter(w => w && !['of', 'or', 'the', 'and'].includes(w.toLowerCase())).map(w => w[0]).join('');
}

function searchWordStart(text, token) {
  const i = text.indexOf(token);
  if (i < 0) return false;
  for (let at = i; at >= 0; at = text.indexOf(token, at + 1)) if (at === 0 || !/[a-z0-9]/.test(text[at - 1])) return true;
  return false;
}

// sources: [{ proto, label, fields, abbr }]. procedures: [{ id, label, name, ref, meta, desc, code }] open a whole PDU page.
function searchBuildIndex(sources, procedures) {
  const entries = [];
  const quoted = (text) => [...text.matchAll(/‘([01]+)’/g)].map(m => ({ code: m[0], value: parseInt(m[1], 2) }));
  for (const src of sources) for (const [id, f] of Object.entries(src.fields)) {
    const specials = f.sp.map(s => ({ code: s.c, codeLower: s.c.toLowerCase(), desc: s.d, descLower: s.d.toLowerCase(), values: searchLiteralValues(s.c) }));
    const prose = [...f.q.map(q => q.t), ...f.nt].join(' ');
    entries.push({ kind: 'field', id, proto: src.proto, label: src.label, name: f.n, nameLower: f.n.toLowerCase(),
      abbrs: [...new Set([...(src.abbr[id] || []), searchInitials(f.n)])].filter(a => a.length > 1).map(a => a.toLowerCase()),
      shownAbbr: (src.abbr[id] || [])[0] || '',
      refs: [f.ref, ...f.q.map(q => q.ref), ...f.sp.map(s => s.ref)].map(r => r.replace(/^§\s*/, '').toLowerCase()),
      // The parent tells apart fields of the same name, such as the SPI of each Extended Procedures PDU.
      meta: [src.fields[f.parent] && src.fields[f.parent].n, f.bits, f.len, f.ref].filter(Boolean).join(' · '),
      desc: f.desc, descLower: f.desc.toLowerCase(), proseLower: prose.toLowerCase(),
      specials, proseValues: quoted(f.desc + ' ' + prose) });
  }
  for (const p of procedures) {
    entries.push({ kind: 'procedure', id: p.id, proto: 'sdls', label: p.label, name: p.name, nameLower: p.name.toLowerCase(),
      abbrs: [], shownAbbr: '', refs: [p.ref.replace(/^§\s*/, '').toLowerCase()], meta: p.meta,
      desc: p.desc, descLower: p.desc.toLowerCase(), proseLower: '', specials: [], proseValues: quoted(p.code) });
  }
  return entries;
}

// Score of one token against one entry, with what matched when that is worth showing. Score 0 = no match.
function searchScoreToken(e, token) {
  const nums = searchQueryValues(token);
  const tokenRef = token.replace(/^§/, '');
  let best = { score: 0, hit: null };
  const offer = (score, hit) => { if (score > best.score) best = { score, hit: hit || null }; };

  if (e.abbrs.includes(token)) offer(100);
  if (e.nameLower === token) offer(90);
  for (const s of e.specials) {
    if (nums.some(n => s.values.includes(n))) offer(85, { code: s.code, desc: s.desc });
    if (token.length >= 2 && s.codeLower.includes(token)) offer(45, { code: s.code, desc: s.desc });
    if (searchWordStart(s.descLower, token)) offer(25, { code: s.code, desc: s.desc });
  }
  if (nums.length) for (const v of e.proseValues) if (nums.includes(v.value)) offer(30, { code: v.code, desc: '' });
  if (e.nameLower.startsWith(token)) offer(70);
  if (searchWordStart(e.nameLower, token)) offer(60);
  if (/^\d/.test(tokenRef) && tokenRef.includes('.')) {
    if (e.refs[0] && e.refs[0].startsWith(tokenRef)) offer(55);
    if (e.refs.some(r => r.startsWith(tokenRef))) offer(35);
  }
  if (token.length >= 2 && e.abbrs.some(a => a.startsWith(token))) offer(50);
  if (token.length >= 3 && e.nameLower.includes(token)) offer(40);
  if (e.label.toLowerCase().split(/\s+/).includes(token) || e.proto === token) offer(30);
  if (searchWordStart(e.descLower, token)) offer(15);
  if (searchWordStart(e.proseLower, token)) offer(8);
  return best;
}

// Every token must match. Best score first; a whole procedure page beats a field on a tie, then the index's own order decides.
function searchRun(index, query, limit) {
  const tokens = String(query || '').toLowerCase().split(/\s+/).filter(t => t && t !== '§');
  if (!tokens.length) return [];
  const results = [];
  index.forEach((e, order) => {
    let score = 0, hit = null;
    for (const t of tokens) {
      const r = searchScoreToken(e, t);
      if (!r.score) return;
      score += r.score;
      if (r.hit && !hit) hit = r.hit;
    }
    results.push({ entry: e, score: score + (e.kind === 'procedure' ? 1 : 0), hit, order });
  });
  return results.sort((a, b) => b.score - a.score || a.order - b.order).slice(0, limit);
}
