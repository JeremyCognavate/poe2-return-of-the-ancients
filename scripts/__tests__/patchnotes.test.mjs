import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { parsePatchNotes } from '../patchnotes.mjs';

const html = readFileSync('scripts/__fixtures__/patchnotes-forum.html', 'utf8');

describe('parsePatchNotes', () => {
  it('returns an array of section entries', () => {
    const sections = parsePatchNotes(html);
    expect(Array.isArray(sections)).toBe(true);
    expect(sections.length).toBeGreaterThan(10);
  });

  it('each section has required fields', () => {
    const sections = parsePatchNotes(html);
    for (const s of sections) {
      expect(s).toHaveProperty('id');
      expect(s).toHaveProperty('title');
      expect(s).toHaveProperty('category');
      expect(s).toHaveProperty('entries');
      expect(Array.isArray(s.entries)).toBe(true);
    }
  });

  it('finds The Runes of Aldur League section', () => {
    const sections = parsePatchNotes(html);
    const runes = sections.find(s => s.title.toLowerCase().includes('runes of aldur'));
    expect(runes).toBeDefined();
    expect(runes.entries.length).toBeGreaterThan(0);
  });

  it('finds Ascendancy Changes section', () => {
    const sections = parsePatchNotes(html);
    const asc = sections.find(s => s.title.toLowerCase().includes('ascendancy'));
    expect(asc).toBeDefined();
  });

  it('maps sections to site taxonomy categories', () => {
    const sections = parsePatchNotes(html);
    const validCategories = ['league', 'endgame', 'ascendancy', 'skills', 'balance',
      'uniques', 'items', 'qol', 'campaign', 'other'];
    for (const s of sections) {
      expect(validCategories).toContain(s.category);
    }
  });
});
