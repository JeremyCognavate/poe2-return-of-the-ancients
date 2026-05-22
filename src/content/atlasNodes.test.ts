import { describe, it, expect } from 'vitest';
import { atlasTreeGroups } from './atlasNodes.js';

describe('atlasTreeGroups', () => {
  it('is non-empty', () => {
    expect(atlasTreeGroups.length).toBeGreaterThan(0);
  });

  it('covers all three kinds', () => {
    const kinds = new Set(atlasTreeGroups.map(g => g.kind));
    expect(kinds.has('core')).toBe(true);
    expect(kinds.has('master')).toBe(true);
    expect(kinds.has('league')).toBe(true);
  });

  it('every group has a name, scale, summary, and highlights', () => {
    for (const g of atlasTreeGroups) {
      expect(g.name).toBeTruthy();
      expect(g.scale).toBeTruthy();
      expect(g.summary).toBeTruthy();
      expect(g.highlights.length).toBeGreaterThan(0);
    }
  });

  it('core group is the Origins of Divinity Atlas overhaul', () => {
    const core = atlasTreeGroups.find(g => g.kind === 'core');
    expect(core).toBeDefined();
    expect(core!.scale).toMatch(/node/i);
  });
});
