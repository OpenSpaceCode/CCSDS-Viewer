// The Blue Books the viewer is written from: which revision of each, and links to the page a reference is on.
// Revisions are from each book's Document Control page. Pages are in bluebook-pages.js, generated from the same PDFs as these URLs.
const BLUE_BOOKS = {
  tm: { code: 'CCSDS 132.0-B-3', title: 'TM Space Data Link Protocol', issue: 3, date: 'October 2021', url: 'https://ccsds.org/Pubs/132x0b3.pdf', changes: [] },
  tc: { code: 'CCSDS 232.0-B-4', title: 'TC Space Data Link Protocol', issue: 4, date: 'October 2021', url: 'https://ccsds.org/Pubs/232x0b4e1c1.pdf', changes: [
    { id: 'COR. 1', name: 'Technical Corrigendum 1', date: 'October 2023', what: 'Expands and clarifies § 6.5.2, order of processing between TC, COP-1 and SDLS.' },
    { id: 'EC 1', name: 'Editorial Change 1', date: 'October 2024', what: 'Corrects a callout in table 6-1, wording in figure 6-3, the layout of annex A and change bars; page size to A4.' } ] },
  spp: { code: 'CCSDS 133.0-B-2', title: 'Space Packet Protocol', issue: 2, date: 'June 2020', url: 'https://ccsds.org/Pubs/133x0b2e2.pdf', changes: [
    { id: 'EC 1', name: 'Editorial Change 1', date: 'October 2020', what: 'Corrects figure 2-1.' },
    { id: 'EC 2', name: 'Editorial Change 2', date: 'September 2024', what: 'Corrects duplicated table of contents entries; page size to A4.' } ] },
  sdls: { code: 'CCSDS 355.0-B-2', title: 'Space Data Link Security Protocol', issue: 2, date: 'July 2022', url: 'https://ccsds.org/Pubs/355x0b2.pdf', changes: [] },
  ep: { code: 'CCSDS 355.1-B-1', title: 'Space Data Link Security Protocol — Extended Procedures', issue: 1, date: 'February 2020', url: 'https://ccsds.org/Pubs/355x1b1.pdf', changes: [] }
};

// References may name another book first: '355.0 § 4.1.1'.
const BLUE_BOOK_PREFIX = { '132.0': 'tm', '232.0': 'tc', '133.0': 'spp', '355.0': 'sdls', '355.1': 'ep' };

// 'ISSUE 4 · OCTOBER 2021 · COR. 1 OCTOBER 2023 · EC 1 OCTOBER 2024'
function blueBookRevision(doc) {
  const b = BLUE_BOOKS[doc];
  return ['ISSUE ' + b.issue + ' · ' + b.date.toUpperCase(), ...b.changes.map(c => c.id + ' ' + c.date.toUpperCase())].join(' · ');
}

function blueBookRevisionDetail(doc) {
  const b = BLUE_BOOKS[doc];
  return [b.code + ', Issue ' + b.issue + ', ' + b.date + '.', ...b.changes.map(c => c.name + ', ' + c.date + ': ' + c.what)].join('\n');
}

// The PDF page of a reference, or null. '§ 4.1.3.3.3.2 / .4', '§ 4.1.2.2.2 NOTE 1' and 'TABLES 5-2, 5-3' go to their first target.
// A numbered item only found as part of its parent (exact: false) goes to the parent's page.
function blueBookFind(doc, ref) {
  const p = BLUE_BOOK_PAGES[doc];
  let m = ref.match(/^§\s*(\d+(?:\.\d+)*)/);
  if (m) {
    let parts = m[1].replace(/\.$/, '').split('.');
    for (let exact = true; parts.length; exact = false, parts = parts.slice(0, -1)) {
      const page = p.sections[parts.join('.')];
      if (page) return { page, exact };
    }
    return null;
  }
  m = ref.match(/^(TABLE|FIGURE)S?\s+([A-Z]?\d*-\d+)/i);
  if (m) {
    const page = p[m[1].toLowerCase() + 's'][m[2]];
    return page ? { page, exact: true } : null;
  }
  m = ref.match(/^ANNEX\s+([A-Z])/i);
  if (m && p.annexes[m[1].toUpperCase()]) return { page: p.annexes[m[1].toUpperCase()], exact: true };
  return null;
}

function blueBookLink(doc, ref) {
  const prefix = String(ref || '').match(/^(\d{3}\.\d)\s+(.*)$/);
  const book = prefix && BLUE_BOOK_PREFIX[prefix[1]] ? BLUE_BOOK_PREFIX[prefix[1]] : doc;
  const target = prefix ? prefix[2] : String(ref || '');
  const found = book ? blueBookFind(book, target) : null;
  if (!found) return null;
  const printed = BLUE_BOOK_PAGES[book].printed[found.page - 1];
  return { href: BLUE_BOOKS[book].url + '#page=' + found.page, page: found.page, printed, exact: found.exact,
    title: BLUE_BOOKS[book].code + ', page ' + printed + ' (page ' + found.page + ' of the PDF). Opens the Blue Book in a new tab.' };
}
