// Builds the single-file viewer (CCSDS-protocol-viewer.html) from src/ and vendor/.
//
//   src/index.html     dc template; pulls in other src files with <!--#include path -->
//   asset:<path>       reference to a file in vendor/ — replaced by its bundle uuid
//   vendor/assets.json the bundled assets (uuid, file, mime, gzip or not), in manifest order
//   vendor/bundler/shell.html  self-unpacking loader; receives the manifest and the template
//
// Usage: node build.mjs [--check]   (--check: fail if the committed output is out of date)

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { gzipSync } from 'node:zlib';

const ROOT = dirname(fileURLToPath(import.meta.url));
const SRC = join(ROOT, 'src');
const VENDOR = join(ROOT, 'vendor');
export const OUTPUT = join(ROOT, 'CCSDS-protocol-viewer.html');

// Fixed gzip header (mtime 0, OS byte 0x0a) so identical input gives identical output.
const GZIP_HEADER = Buffer.from('1f8b080000000000000a', 'hex');
const INCLUDE = /^([ \t]*)<!--#include ([\w./-]+) -->\n|<!--#include ([\w./-]+) -->/gm;

function read(path) { return readFileSync(path, 'utf8'); }

// A directive alone on its line is replaced together with its line; elsewhere it is replaced inline.
export function expandIncludes(text, dir = SRC, seen = []) {
  return text.replace(INCLUDE, (_, indent, lineRel, inlineRel) => {
    const rel = lineRel || inlineRel;
    if (seen.includes(rel)) throw new Error('include cycle: ' + [...seen, rel].join(' → '));
    const path = join(dir, rel);
    if (!existsSync(path)) throw new Error('missing include: src/' + rel);
    return expandIncludes(read(path), dir, [...seen, rel]);
  });
}

export function loadAssets() { return JSON.parse(read(join(VENDOR, 'assets.json'))); }

export function resolveAssets(text, assets) {
  const byFile = new Map(assets.map(a => [a.file, a.uuid]));
  return text.replace(/asset:([\w./-]+)/g, (m, file) => {
    if (!byFile.has(file)) throw new Error('unknown asset: ' + file + ' (not in vendor/assets.json)');
    return byFile.get(file);
  });
}

export function buildTemplate() {
  return resolveAssets(expandIncludes(read(join(SRC, 'index.html'))), loadAssets());
}

// The component script exactly as the runtime evaluates it (used by the tests).
export function buildScript() {
  const t = buildTemplate();
  const open = t.indexOf('<script type="text/x-dc"');
  const start = t.indexOf('">\n', open) + 3;
  return t.slice(start, t.indexOf('</script>', start));
}

function buildManifest(assets) {
  const manifest = {};
  for (const a of assets) {
    const raw = readFileSync(join(VENDOR, a.file));
    const data = a.compressed ? Buffer.concat([GZIP_HEADER, gzipSync(raw, { level: 6 }).subarray(10)]) : raw;
    manifest[a.uuid] = { mime: a.mime, compressed: a.compressed, data: data.toString('base64') };
  }
  return manifest;
}

export function build() {
  const assets = loadAssets();
  const template = JSON.stringify(buildTemplate()).replaceAll('</', '<\\u002F');
  const shell = read(join(VENDOR, 'bundler', 'shell.html'));
  const out = shell.replace('__BUNDLE_MANIFEST__', () => JSON.stringify(buildManifest(assets)))
    .replace('__BUNDLE_TEMPLATE__', () => template);
  if (out === shell) throw new Error('bundle shell has no placeholders');
  return out;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const out = build();
  if (process.argv.includes('--check')) {
    const current = existsSync(OUTPUT) ? read(OUTPUT) : '';
    if (current !== out) { console.error('CCSDS-protocol-viewer.html is out of date — run: node build.mjs'); process.exit(1); }
    console.log('CCSDS-protocol-viewer.html is up to date');
  } else {
    writeFileSync(OUTPUT, out);
    console.log('wrote CCSDS-protocol-viewer.html (' + Math.round(out.length / 1024) + ' KB)');
  }
}
