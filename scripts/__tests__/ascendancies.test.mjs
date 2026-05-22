import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join, dirname } from 'node:path';
import { parseAscendancy } from '../poe2db/parsers/ascendancies.mjs';
import { parseEndgameContent } from '../poe2db/parsers/endgame.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const swHtml = readFileSync(join(__dirname, '../__fixtures__/ascendancies-spirit-walker.html'), 'utf8');
const versionHtml = readFileSync(join(__dirname, '../__fixtures__/endgame-version.html'), 'utf8');

describe('parseAscendancy', () => {
  it('returns ascendancy with name + nodes', () => {
    const result = parseAscendancy(swHtml, 'Spirit Walker');
    expect(result).toHaveProperty('name', 'Spirit Walker');
    expect(result).toHaveProperty('nodes');
    expect(Array.isArray(result.nodes)).toBe(true);
  });

  it('nodes have name and stats', () => {
    const result = parseAscendancy(swHtml, 'Spirit Walker');
    for (const node of result.nodes) {
      expect(node).toHaveProperty('name');
      expect(node).toHaveProperty('stats');
    }
  });
});

describe('parseEndgameContent', () => {
  it('returns endgame mechanics array', () => {
    const result = parseEndgameContent(versionHtml);
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThan(3);
  });

  it('each mechanic has id and name', () => {
    const result = parseEndgameContent(versionHtml);
    for (const m of result) {
      expect(m).toHaveProperty('id');
      expect(m).toHaveProperty('name');
    }
  });
});
