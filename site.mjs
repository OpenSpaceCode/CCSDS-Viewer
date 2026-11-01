// Generates what GitHub Pages publishes: the viewer as index.html, and a plain reference page per protocol.
// The viewer is one address and needs a script to show anything, so these pages are what a search can land on. They are made
// from the viewer's own field tables, so the two cannot disagree. Usage: node site.mjs [output folder, default _site]
import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { build, buildScript } from './build.mjs';

const ROOT = dirname(fileURLToPath(import.meta.url));

const PAGES = [
  { slug: 'spp', doc: 'spp', source: 'SpacePacket', nav: 'Space Packet', open: '#/spp', sheet: 'spp' },
  { slug: 'tm', doc: 'tm', source: 'TM SDLP', nav: 'TM SDLP', open: '#/tm', sheet: 'tm' },
  { slug: 'tc', doc: 'tc', source: 'TC SDLP', nav: 'TC SDLP', open: '#/tc', sheet: 'tc' },
  { slug: 'sdls', doc: 'sdls', source: 'SDLS', nav: 'SDLS', open: '#/sdls', sheet: 'sdls',
    lead: 'SDLS adds security to TM, TC, AOS and USLP Transfer Frames. It has no frame of its own: a Security Header and an optional Security Trailer go around the Frame Data, and their field lengths come from the Security Association named by the Security Parameter Index.' },
  { slug: 'sdls-ep', doc: 'ep', source: 'SDLS EP', nav: 'SDLS EP', open: '#/sdls-ep', sheet: 'ep',
    lead: 'The Extended Procedures manage SDLS in flight: keys, Security Associations, and monitoring and control. Each procedure is a PDU with a 3-octet header, identified by its Service Group and Procedure Identification.' }
];

const esc = (text) => String(text).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const CSS = ':root{color-scheme:light dark;--bg:#fff;--text:#1c2733;--muted:#5a6b7b;--line:#d5dce3;--link:#1f4e79}'
  + '@media (prefers-color-scheme:dark){:root{--bg:#10171e;--text:#e3e9ef;--muted:#9aa9b7;--line:#2c3a47;--link:#8dbbe6}}'
  + '*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--text);font:16px/1.55 -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif}'
  + 'nav,main,footer{max-width:76ch;margin:0 auto;padding:0 20px}nav{display:flex;flex-wrap:wrap;gap:4px 14px;padding-top:20px;font-size:14px}nav a{white-space:nowrap}nav a[aria-current]{font-weight:700;color:inherit;text-decoration:none}'
  + 'h1{font-size:30px;line-height:1.2;margin:24px 0 6px}h2{font-size:21px;margin:34px 0 8px;padding-top:14px;border-top:1px solid var(--line)}h3{font-size:17px;margin:24px 0 4px}'
  + 'a{color:var(--link)}p{margin:0 0 10px}abbr{text-decoration:none;color:var(--muted);font-weight:400;margin-left:6px}.meta{font-size:13px;color:var(--muted)}.open{font-weight:600}'
  + 'ul{margin:0 0 12px;padding-left:22px}li{margin-bottom:4px}.scroll{overflow-x:auto}table{border-collapse:collapse;margin:6px 0 12px;font-size:14px;width:100%}th,td{text-align:left;vertical-align:top;padding:5px 10px 5px 0;border-bottom:1px solid var(--line)}th{font-weight:600;color:var(--muted)}code{font-family:ui-monospace,Menlo,Consolas,monospace}.clause{white-space:nowrap}'
  + 'footer{margin-top:36px;padding-bottom:36px;font-size:13px;color:var(--muted)}';

// The viewer's scripts, run as the page runs them, for their tables.
function loadViewer() {
  class DCLogic { constructor(props) { this.props = props || {}; this.state = {}; } setState() {} }
  const code = buildScript() + '\n;return { Component, BLUE_BOOKS, blueBookLink };';
  const { Component, ...rest } = new Function('DCLogic', 'StreamableLogic', 'React', code)(DCLogic, DCLogic, {});
  return { viewer: new Component({}), ...rest };
}

function renderPage(page, v, base) {
  const { viewer, BLUE_BOOKS, blueBookLink } = v;
  const book = BLUE_BOOKS[page.doc], source = viewer.Q_SOURCES.find(s => s.label === page.source), fields = source.fields;
  const sheet = viewer.CHEAT_SHEETS[page.sheet];
  const decode = viewer.DECODE_SPECS[page.doc];
  const lead = page.lead || decode.note.replace(/^.*? — (.)/, (m, c) => c.toUpperCase());
  const ref = (text, doc = page.doc) => {
    const link = blueBookLink(doc, text);
    return link ? '<a href="' + esc(link.href) + '" title="' + esc(link.title) + '">' + esc(text) + '</a>' : esc(text);
  };
  const open = (hash, label) => '<a class="open" href="../' + esc(hash) + '">' + esc(label) + '</a>';
  const abbrOf = (id) => {
    const inSheet = sheet.fields.find(f => f[0] === id);
    return inSheet ? inSheet[1] : source.abbr[id] ? source.abbr[id][0] : '';
  };
  const position = (f) => [f.bits, f.len, f.pres].filter(Boolean).join(' · ');
  const special = (sp) => !sp.length ? '' : '<div class="scroll"><table><thead><tr><th>Value</th><th>Meaning</th><th>Clause</th></tr></thead><tbody>'
    + sp.map(x => '<tr><td><code>' + esc(x.c) + '</code></td><td>' + esc(x.d) + '</td><td class="clause">' + ref(x.ref) + '</td></tr>').join('') + '</tbody></table></div>';
  const field = (id, f) => {
    const tag = fields[f.parent] ? 'h3' : 'h2', abbr = abbrOf(id);
    return '<section id="' + esc(id) + '"><' + tag + '>' + esc(f.n) + (abbr ? '<abbr>' + esc(abbr) + '</abbr>' : '') + '</' + tag + '>'
      + '<p class="meta">' + esc(position(f)) + ' · ' + ref(f.ref) + ' · ' + open('#/field/' + id, 'Open in the viewer') + '</p>'
      + '<p>' + esc(f.desc) + '</p>' + special(f.sp) + f.nt.map(n => '<p class="meta">' + esc(n) + '</p>').join('') + '</section>';
  };
  let body;
  if (page.doc === 'ep') {
    // Procedures share many of their fields, so only the header has a section of its own per field.
    const header = Object.entries(fields).filter(([id, f]) => id === 'ephdr' || f.parent === 'ephdr' || f.parent === 'eptag').map(([id, f]) => field(id, f)).join('');
    const procedures = viewer.EP_GROUPS.map(g => {
      const items = g.items.filter(it => viewer.EP_DEF[it.id]).map(it => {
        const p = viewer.EP_DEF[it.id];
        const cells = p.cells.filter(c => viewer.F[c]).map(c => '<tr><td>' + esc(viewer.F[c].n) + '</td><td>' + esc(viewer.F[c].bits || viewer.F[c].len) + '</td><td>' + esc(viewer.F[c].desc) + '</td></tr>').join('');
        return '<section id="' + esc(it.id) + '"><h3>' + esc(p.name) + '</h3>'
          + '<p class="meta">Procedure Identification <code>' + esc(p.proc) + '</code> · ' + ref(p.ref) + ' · ' + open('#/ep/' + it.id, 'Open in the viewer') + '</p>'
          + '<p>' + esc(p.intro) + '</p>'
          + (cells ? '<div class="scroll"><table><thead><tr><th>Field</th><th>Length</th><th>Meaning</th></tr></thead><tbody>' + cells + '</tbody></table></div>' : '') + '</section>';
      }).join('');
      return '<h2>' + esc(g.name.charAt(0) + g.name.slice(1).toLowerCase()) + '</h2>' + items;
    }).join('');
    body = header + procedures;
  } else {
    body = Object.entries(fields).map(([id, f]) => field(id, f)).join('');
  }
  const rules = sheet.rules.length ? '<h2>Rules</h2><ul>' + sheet.rules.map(([t, r]) => '<li>' + esc(t) + ' <span class="meta">' + ref(r) + '</span></li>').join('') + '</ul>' : '';
  const names = Object.entries(fields).filter(([, f]) => page.doc !== 'ep' || f.parent === 'ephdr').map(([, f]) => f.n);
  let description = 'Field reference for the ' + book.title + ' (' + book.code + '): ';
  const start = description.length;
  for (const n of names) {
    const next = description + (description.length > start ? ', ' : '') + n;
    if (next.length > 155) break;
    description = next;
  }
  const url = base + page.slug + '/';
  const links = PAGES.map(p => '<a href="../' + p.slug + '/"' + (p === page ? ' aria-current="page"' : '') + '>' + esc(p.nav) + '</a>').join('');
  return '<!DOCTYPE html>\n<html lang="en"><head><meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1">\n'
    + '<title>' + esc(book.title) + ' fields · ' + esc(book.code) + ' | CCSDS Protocol Viewer</title>\n'
    + '<meta name="description" content="' + esc(description) + '.">\n<link rel="canonical" href="' + esc(url) + '">\n<style>' + CSS + '</style></head>\n<body>\n'
    + '<nav><a href="../">CCSDS Protocol Viewer</a>' + links + '</nav>\n<main>\n'
    + '<h1>' + esc(book.title) + '</h1>\n'
    + '<p class="meta"><a href="' + esc(book.url) + '">' + esc(book.code) + '</a> · ' + esc(['Issue ' + book.issue + ', ' + book.date, ...book.changes.map(c => c.id + ' ' + c.date)].join(' · ')) + '</p>\n'
    + '<p>' + esc(lead) + '</p>\n<p>' + open(page.open, 'Open the interactive diagram, Frame Builder and Frame Decoder') + '</p>\n'
    + body + rules + '\n</main>\n<footer>A summary for quick reference, made from the tables of the <a href="../">CCSDS Protocol Viewer</a>. The Blue Book is normative. <a href="https://github.com/OpenSpaceCode/CCSDS-Viewer">Source on GitHub</a>.</footer>\n</body></html>\n';
}

// Published path → content.
export function sitePages() {
  const v = loadViewer();
  const base = readFileSync(join(ROOT, 'src', 'index.html'), 'utf8').match(/<link rel="canonical" href="([^"]+)"/)[1];
  const out = { 'index.html': build() };
  for (const page of PAGES) out[page.slug + '/index.html'] = renderPage(page, v, base);
  return out;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const dir = join(ROOT, process.argv[2] || '_site');
  rmSync(dir, { recursive: true, force: true });
  for (const [path, html] of Object.entries(sitePages())) {
    mkdirSync(dirname(join(dir, path)), { recursive: true });
    writeFileSync(join(dir, path), html);
    console.log('wrote ' + path + ' (' + Math.round(html.length / 1024) + ' KB)');
  }
}
