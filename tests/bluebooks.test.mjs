// Blue Book links: every reference the viewer shows must lead to a page, and the right one.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadComponent, loadSrc } from './load.mjs';

const Component = loadComponent();
const { blueBookLink, blueBookRevision, blueBookRevisionDetail, BLUE_BOOKS, BLUE_BOOK_PAGES } = loadSrc(['lib/bluebook-pages.js', 'lib/bluebooks.js'], ['blueBookLink', 'blueBookRevision', 'blueBookRevisionDetail', 'BLUE_BOOKS', 'BLUE_BOOK_PAGES']);
const proto = new Component({});
const SRC = join(dirname(fileURLToPath(import.meta.url)), '..', 'src');
const render = (state) => { const c = new Component({}); c.state = { ...c.state, ...state }; return c.renderVals(); };

test('pages known from reading the PDFs', () => {
  for (const [doc, ref, page, printed] of [
    ['tm', '§ 4.1.2.7.6', 66, '4-7'], ['tm', '§ 4.1.6.3', 73, '4-14'], ['tc', 'TABLE 4-1', 72, '4-4'], ['tc', '§ 4.1.3.3.3', 77, '4-9'],
    ['spp', '§ 4.1.3.5', 36, '4-6'], ['spp', 'TABLE 5-1', 42, '5-1'], ['tm', 'FIGURE 4-1', 61, '4-2'], ['tm', 'ANNEX D', 112, 'D-1']]) {
    const l = blueBookLink(doc, ref);
    assert.equal(l.page, page, doc + ' ' + ref);
    assert.equal(l.printed, printed, doc + ' ' + ref);
    assert.equal(l.exact, true);
    assert.equal(l.href, BLUE_BOOKS[doc].url + '#page=' + page);
    assert.match(l.title, new RegExp(BLUE_BOOKS[doc].code + ', page ' + printed + ' \\(page ' + page + ' of the PDF\\)'));
  }
});

test('a reference to another book goes to that book', () => {
  const l = blueBookLink('tm', '355.0 § 4.1.1.2.3');
  assert.match(l.href, /355x0b2\.pdf#page=\d+$/);
  assert.equal(l.page, BLUE_BOOK_PAGES.sdls.sections['4.1.1.2.3']);
  assert.match(blueBookLink('spp', '132.0 TABLE 6-1').href, /132x0b3\.pdf/);
  assert.match(blueBookLink('tm', '232.0 TABLES 6-2, 6-3').href, /232x0b4e1c1\.pdf/);
});

test('annotated references go to the numbered part', () => {
  const page = (doc, ref) => blueBookLink(doc, ref).page, sec = (doc, s) => BLUE_BOOK_PAGES[doc].sections[s];
  assert.equal(page('tm', '§ 4.1.2.2.2 NOTE 1'), sec('tm', '4.1.2.2.2'));
  assert.equal(page('tc', '§ 4.1.2.3.1.2 a)'), sec('tc', '4.1.2.3.1.2'));
  assert.equal(page('spp', '§ 4.1.3.3.3.2 / .4'), sec('spp', '4.1.3.3.3.2'));
  assert.equal(page('tc', '§ 4.1.3.2.2.1.1–.2'), sec('tc', '4.1.3.2.2.1.1'));
  assert.equal(page('sdls', '§ 2.3.2 / 2.3.3'), sec('sdls', '2.3.2'));
  assert.equal(blueBookLink('tm', 'TABLES 5-2, 5-3').page, BLUE_BOOK_PAGES.tm.tables['5-2']);
});

test('an unknown reference has no link rather than a wrong one', () => {
  for (const ref of ['', null, 'nonsense', 'TABLE 9-9', 'FIGURE 9-9', '§ 99.1', 'ANNEX Z']) assert.equal(blueBookLink('tm', ref), null, String(ref));
  assert.equal(blueBookLink('tm', '§ 4.1.2.7.6.99').exact, false, 'a sub-item not found on its own goes to its parent, and says so');
});

test('every reference on a field page leads to its exact section, table or figure', () => {
  const missing = [];
  const check = (doc, ref, where) => { const l = blueBookLink(doc, ref); if (!l || !l.exact) missing.push(doc + ' ' + ref + ' (' + where + ')'); };
  for (const [id, f] of Object.entries(proto.F)) {
    const doc = proto.fieldDoc(id);
    check(doc, f.ref, id);
    f.q.forEach(q => check(doc, q.ref, id));
    f.sp.forEach(s => check(doc, s.ref, id));
  }
  for (const [id, p] of Object.entries(proto.EP_DEF)) { check('ep', p.ref, id); check('ep', p.fig, id); }
  for (const id of proto.SDLS_COV_ORDER) check('sdls', proto.SDLS_COV[id].fig, id);
  assert.deepEqual(missing, []);
});

test('every reference the decoders and settings can show leads to its exact page', () => {
  const missing = [];
  for (const [doc, file] of [['tm', 'protocols/tm.js'], ['tc', 'protocols/tc.js'], ['spp', 'protocols/spp.js'], ['sdls', 'protocols/sdls.js']]) {
    const text = readFileSync(join(SRC, file), 'utf8');
    const code = text.slice(Math.max(text.indexOf('_DECODE = '), text.indexOf('// SDLS has no frame of its own')));
    for (const [, ref] of code.matchAll(/'((?:\d{3}\.\d )?(?:§ [\d.]+|TABLES? [\d-]+(?:, [\d-]+)?))'/g)) {
      const l = blueBookLink(doc, ref);
      if (!l || !l.exact) missing.push(doc + ': ' + ref);
    }
  }
  assert.deepEqual(missing, []);
});

test('each field page quotes the book it belongs to', () => {
  for (const [id, doc] of [['fhp', 'tm'], ['tcmap', 'tc'], ['spapid', 'spp'], ['spi', 'sdls'], ['iv', 'sdls'], ['mac', 'sdls'], ['mkid', 'ep'], ['epmac', 'ep'], ['ephdr', 'ep'], ['tcfecf', 'tc'], ['fecf', 'tm']])
    assert.equal(proto.fieldDoc(id), doc, id);
});

test('revisions match the Document Control page of each book', () => {
  assert.equal(blueBookRevision('tm'), 'ISSUE 3 · OCTOBER 2021');
  assert.equal(blueBookRevision('tc'), 'ISSUE 4 · OCTOBER 2021 · COR. 1 OCTOBER 2023 · EC 1 OCTOBER 2024');
  assert.equal(blueBookRevision('spp'), 'ISSUE 2 · JUNE 2020 · EC 1 OCTOBER 2020 · EC 2 SEPTEMBER 2024');
  assert.equal(blueBookRevision('sdls'), 'ISSUE 2 · JULY 2022');
  assert.equal(blueBookRevision('ep'), 'ISSUE 1 · FEBRUARY 2020');
  assert.match(blueBookRevisionDetail('tc'), /Technical Corrigendum 1, October 2023: Expands and clarifies § 6\.5\.2/);
  assert.match(blueBookRevisionDetail('tc'), /Editorial Change 1, October 2024/);
  assert.equal(blueBookRevisionDetail('tm'), 'CCSDS 132.0-B-3, Issue 3, October 2021.');
});

test('the URLs are the revisions the page table was generated from', () => {
  // The PDFs were verified byte-identical to these URLs when the table was generated; a new revision changes the file name.
  assert.equal(Object.keys(BLUE_BOOKS).length, Object.keys(BLUE_BOOK_PAGES).length);
  for (const [doc, p] of Object.entries(BLUE_BOOK_PAGES)) {
    assert.match(p.sha256, /^[0-9a-f]{64}$/, doc);
    assert.equal(p.printed.length, p.pages, doc);
    for (const pg of Object.values(p.sections)) assert.ok(pg >= 1 && pg <= p.pages, doc);
  }
  assert.ok(Object.values(BLUE_BOOKS).every(b => /^https:\/\/ccsds\.org\/Pubs\/\w+\.pdf$/.test(b.url)));
});

test('no view hard-codes a URL or revision any more', () => {
  for (const f of readdirSync(join(SRC, 'views'))) {
    const text = readFileSync(join(SRC, 'views', f), 'utf8');
    assert.doesNotMatch(text, /ccsds\.org\/Pubs/, f);
    assert.doesNotMatch(text, />ISSUE \d/, f);
  }
});

test('a field page links its section chip, quotes and special values', () => {
  const v = render({ view: 'field', fid: 'fhp', proto: 'tm' });
  const chip = v.fieldChips.at(-1);
  assert.equal(chip.isLink, true);
  assert.equal(chip.href, 'https://ccsds.org/Pubs/132x0b3.pdf#page=66');
  assert.equal(v.fieldChips[0].isLink, false, 'bits and length are not references');
  assert.ok(v.fieldQuotes.every(q => q.hasLink && /#page=\d+$/.test(q.href)));
  assert.equal(v.fieldQuotes[0].pageLabel, 'p. 4-7');
  assert.ok(v.fieldSpecial.every(s => s.hasLink));
  assert.equal(v.srcLine, 'SOURCE · CCSDS 132.0-B-3 · TM SPACE DATA LINK PROTOCOL · BLUE BOOK ISSUE 3 · OCTOBER 2021');
  assert.match(render({ view: 'field', fid: 'tcmap' }).srcLine, /CCSDS 232\.0-B-4 .*COR\. 1 OCTOBER 2023 · EC 1 OCTOBER 2024/);
  assert.match(render({ view: 'field', fid: 'mkid' }).srcLine, /CCSDS 355\.1-B-1 · SPACE DATA LINK SECURITY PROTOCOL — EXTENDED PROCEDURES/);
});

test('decoder checks and settings link to the book they cite', () => {
  const v = render({ view: 'decode', dProto: 'tm', dHex: { tm: '02 A3 11 05 18 00 AA BB CC DD 01 00 00 05 12 34' } });
  const fecf = v.dChecks.find(c => /Frame Error Control Field/.test(c.msg));
  assert.equal(fecf.hasLink, true);
  assert.equal(fecf.href, 'https://ccsds.org/Pubs/132x0b3.pdf#page=' + BLUE_BOOK_PAGES.tm.sections['4.1.6.3']);
  assert.ok(v.dSettingsList.every(s => s.hasLink), 'settings');
  const secured = render({ view: 'decode', dProto: 'tc', dHex: { tc: '20 2A 04 13 00 C5 00 00' }, dSet: { tc: { secSvc: '1' } } });
  assert.ok(secured.dChecks.filter(c => c.ref.startsWith('355.0')).every(c => /355x0b2\.pdf/.test(c.href)));
  assert.ok(secured.dSettingsList.find(s => s.id === 'secIv').href.includes('355x0b2.pdf'));
});

test('diagrams and Extended Procedures pages show the revision and link their figures', () => {
  const v = render({ proto: 'tc', view: 'diagram' });
  assert.equal(v.bb.tcRev, 'ISSUE 4 · OCTOBER 2021 · COR. 1 OCTOBER 2023 · EC 1 OCTOBER 2024');
  assert.match(v.bb.tcFig41Href, /232x0b4e1c1\.pdf#page=\d+$/);
  const ep = render({ view: 'ep', epId: 'otar' });
  assert.match(ep.epFigHref, /355x1b1\.pdf#page=\d+$/);
  assert.equal(ep.epRefHref, 'https://ccsds.org/Pubs/355x1b1.pdf#page=' + BLUE_BOOK_PAGES.ep.sections['5.4.2.1']);
  assert.match(render({ proto: 'sdls', sdCov: 'tc' }).sdCovFigHref, /355x0b2\.pdf#page=\d+$/);
});
