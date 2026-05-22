import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { parseRunes } from '../poe2db/parsers/runes.mjs';
import { parseKalguuranSkills } from '../poe2db/parsers/kalguuran.mjs';

const runesHtml = readFileSync(new URL('../__fixtures__/runes-list.html', import.meta.url), 'utf8');
const kalguuranHtml = readFileSync(new URL('../__fixtures__/kalguuran-list.html', import.meta.url), 'utf8');

describe('parseRunes', () => {
  it('returns a non-empty array of rune objects', () => {
    const runes = parseRunes(runesHtml);
    expect(runes.length).toBeGreaterThan(0);
  });

  it('returns all 17 known runes from the league page', () => {
    const runes = parseRunes(runesHtml);
    expect(runes.length).toBe(17);
  });

  it('each rune has name, slug, tier, and confidence fields', () => {
    const runes = parseRunes(runesHtml);
    for (const r of runes) {
      expect(r).toHaveProperty('name');
      expect(typeof r.name).toBe('string');
      expect(r.name.length).toBeGreaterThan(0);

      expect(r).toHaveProperty('slug');
      expect(typeof r.slug).toBe('string');
      expect(r.slug.length).toBeGreaterThan(0);

      expect(r).toHaveProperty('tier');
      expect(['archaic', 'warding', 'aldur', 'special']).toContain(r.tier);

      expect(r).toHaveProperty('confidence');
      expect(r.confidence).toBe('confirmed');
    }
  });

  it('correctly infers tiers for each rune group', () => {
    const runes = parseRunes(runesHtml);
    const byTier = Object.fromEntries(
      ['archaic', 'warding', 'aldur', 'special'].map(t => [
        t,
        runes.filter(r => r.tier === t).map(r => r.name),
      ])
    );

    // 7 Archaic runes
    expect(byTier.archaic).toHaveLength(7);
    expect(byTier.archaic).toContain('Archaic Rune of Retaliation');
    expect(byTier.archaic).toContain('Archaic Rune of the Titan');

    // 3 Warding runes
    expect(byTier.warding).toHaveLength(3);
    expect(byTier.warding).toContain('Warding Rune of Bravado');

    // 4 Aldur runes (including the 3 unlinked ones)
    expect(byTier.aldur).toHaveLength(4);
    expect(byTier.aldur).toContain('Breach of Aldur');
    expect(byTier.aldur).toContain('Ire of Aldur');
    expect(byTier.aldur).toContain('Passion of Aldur');
    expect(byTier.aldur).toContain('Betrayal of Aldur');

    // 3 special runes
    expect(byTier.special).toHaveLength(3);
    expect(byTier.special).toContain('Ward Rune');
  });

  it('does not include Kalguuran skills in rune output', () => {
    const runes = parseRunes(runesHtml);
    const names = runes.map(r => r.name);
    expect(names).not.toContain('Concussive Runes');
    expect(names).not.toContain('Frostflame Nova');
    expect(names).not.toContain('Runic Infusion');
  });
});

describe('parseKalguuranSkills', () => {
  it('returns skill objects with name and slug', () => {
    const skills = parseKalguuranSkills(kalguuranHtml);
    expect(skills.length).toBeGreaterThan(0);
    for (const s of skills) {
      expect(s).toHaveProperty('name');
      expect(s).toHaveProperty('slug');
      expect(typeof s.slug).toBe('string');
      expect(s.slug.length).toBeGreaterThan(0);
    }
  });

  it('returns exactly 6 Kalguuran skills from the dedicated page', () => {
    const skills = parseKalguuranSkills(kalguuranHtml);
    expect(skills.length).toBe(6);
  });

  it('includes all expected Kalguuran skills', () => {
    const skills = parseKalguuranSkills(kalguuranHtml);
    const slugs = skills.map(s => s.slug);
    expect(slugs).toContain('Frostflame_Nova');
    expect(slugs).toContain('Hollow_Shell');
    expect(slugs).toContain('Triskelion_Cascade');
    expect(slugs).toContain('Concussive_Runes');
    expect(slugs).toContain('Runic_Infusion');
    expect(slugs).toContain('Repulsion');
  });

  it('each skill has an iconUrl field (may be empty string)', () => {
    const skills = parseKalguuranSkills(kalguuranHtml);
    for (const s of skills) {
      expect(s).toHaveProperty('iconUrl');
      expect(typeof s.iconUrl).toBe('string');
    }
  });
});
