export interface BalanceDelta {
  before: string;
  after: string;
}

const ARROW = '→'; // →
// Character class matching straight and smart double-quotes
const Q = `["“”]`;
// "Before text" → "After text" optional trailing context (e.g. "(multiple nodes)")
const ARROW_QUOTED_RE = new RegExp(`^${Q}(.+?)${Q}\\s*${ARROW}\\s*${Q}(.+?)${Q}\\s*(.*?)$`);
// Unquoted or mixed arrow fallback
const ARROW_PLAIN_RE = /^(.+?)\s*→\s*(.+?)$/;
// Sentence text (previously Y).
const PREV_RE = /^(.*?)\s*\(previously\s+([^)]+)\)\.?$/s;

export function extractDeltas(lines: string[]): BalanceDelta[] {
  const results: BalanceDelta[] = [];
  for (const line of lines) {
    if (line.includes(ARROW)) {
      const mq = line.match(ARROW_QUOTED_RE);
      if (mq) {
        const before   = mq[1].trim();
        const trailing = mq[3]?.trim();
        const after    = trailing ? `${mq[2].trim()} ${trailing}` : mq[2].trim();
        if (before && after) { results.push({ before, after }); continue; }
      }
      const mp = line.match(ARROW_PLAIN_RE);
      if (mp) {
        const before = mp[1].trim();
        const after  = mp[2].trim();
        if (before && after) { results.push({ before, after }); continue; }
      }
    }
    const mv = line.match(PREV_RE);
    if (mv) {
      const after  = mv[1].trim();
      const before = mv[2].trim();
      if (before && after) results.push({ before, after });
    }
  }
  return results;
}
