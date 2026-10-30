// Loads src/ scripts the way the viewer does: plain scripts sharing one scope (no modules).
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildScript } from '../build.mjs';

const SRC = join(dirname(fileURLToPath(import.meta.url)), '..', 'src');

// loadSrc(['lib/bits.js', 'protocols/spp.js'], ['decodeSpp']) → { decodeSpp }
export function loadSrc(files, names) {
  const code = files.map(f => readFileSync(join(SRC, f), 'utf8')).join('\n');
  return new Function(code + '\n;return { ' + names.join(', ') + ' };')();
}

// The built Component class, with a minimal stand-in for the runtime's DCLogic base class.
export function loadComponent() {
  class DCLogic {
    constructor(props) { this.props = props || {}; this.state = {}; }
    setState(u) { this.state = { ...this.state, ...(typeof u === 'function' ? u(this.state) : u) }; }
  }
  return new Function('DCLogic', 'StreamableLogic', 'React', buildScript() + '\n;return Component;')(DCLogic, DCLogic, {});
}
