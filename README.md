# CCSDS Protocol Viewer

Quick-reference viewer for a layered space link stack — Space Packet, TM / TC SDLP, SDLS and SDLS Extended Procedures — built from the CCSDS Blue Books. Frame diagrams, field reference pages, a Frame Builder and a Frame Decoder.

**To use it**, open `CCSDS-protocol-viewer.html` in a browser. It is a single self-contained file: no server and no network needed.

## Development

The HTML file is generated — edit `src/`, then rebuild. Needs Node ≥ 21, no dependencies.

```sh
npm run build    # src/ + vendor/ → CCSDS-protocol-viewer.html
npm test         # decoder test vectors + smoke tests (also fails if the HTML is stale)
```

```
src/
  index.html          page template; pulls files in with <!--#include path -->
  views/              markup per view (sidebar, diagrams, builder, decoder, field page, …)
  styles/             design-system CSS
  protocols/          per protocol: field reference pages, maps, builder + decoder specs
  lib/bits.js         octet/bit helpers for the decoder
  lib/search.js       field search (Ctrl+K): indexing, value matching, ranking
  lib/session.js      keeps the page across a refresh (sessionStorage)
  component.js        state, navigation and renderVals() — the glue
vendor/               React, dc-runtime, fonts and the self-unpacking bundle shell (not edited)
tests/                node:test suites
build.mjs             the bundler
```

The scripts in `src/` are plain scripts that share one scope (no modules), in the order listed at the bottom of `src/index.html`. Reference vendor files as `asset:<path>`, for example `url("asset:fonts/barlow-400-latin.woff2")`.
