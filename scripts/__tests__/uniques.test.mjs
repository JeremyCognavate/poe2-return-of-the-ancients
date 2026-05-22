import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { parseUniqueList, parseUniqueDetail } from '../poe2db/parsers/uniques.mjs';

const listHtml = readFileSync('scripts/__fixtures__/uniques-list.html', 'utf8');
const detailHtml = readFileSync('scripts/__fixtures__/unique-detail.html', 'utf8');

describe('parseUniqueList', () => {
  it('returns an array of items with name + slug', () => {
    const items = parseUniqueList(listHtml);
    expect(items.length).toBeGreaterThan(0);
    for (const item of items) {
      expect(item).toHaveProperty('name');
      expect(item).toHaveProperty('slug');
      expect(typeof item.slug).toBe('string');
    }
  });

  it('includes Brutus Lead Sprinkler', () => {
    const items = parseUniqueList(listHtml);
    const brutus = items.find(i => i.name.includes('Brutus'));
    expect(brutus).toBeDefined();
    expect(brutus.slug).toBe('Brutus_Lead_Sprinkler');
  });

  it('extracts name without base type for structured items (Serle\'s Grit)', () => {
    const items = parseUniqueList(listHtml);
    const serle = items.find(i => i.slug === 'Serles_Grit');
    expect(serle).toBeDefined();
    expect(serle.name).toBe("Serle's Grit");
    // Name should NOT include the base type
    expect(serle.name).not.toContain('Forgehammer');
  });

  it('returns 19 items (all items on the league page)', () => {
    const items = parseUniqueList(listHtml);
    expect(items.length).toBe(19);
  });

  it('includes all expected league unique slugs', () => {
    const items = parseUniqueList(listHtml);
    const slugs = items.map(i => i.slug);
    const expected = [
      'Brutus_Lead_Sprinkler',
      'Eventide_Petals',
      'Horrors_Flight',
      'Ironbound',
      'Liminal_Coil',
      'Periphery',
      'Sylvans_Effigy',
      'The_Ordained',
      'The_Ravens_Flock',
      'Twisted_Empyrean',
      'Voices',
    ];
    for (const slug of expected) {
      expect(slugs).toContain(slug);
    }
  });
});

describe('parseUniqueDetail', () => {
  it('returns item with name, baseType, implicits, explicits, iconUrl', () => {
    const item = parseUniqueDetail(detailHtml, 'Brutus_Lead_Sprinkler');
    expect(item).toHaveProperty('name');
    expect(item).toHaveProperty('baseType');
    expect(item).toHaveProperty('implicits');
    expect(item).toHaveProperty('explicits');
    expect(item).toHaveProperty('iconUrl');
    expect(Array.isArray(item.explicits)).toBe(true);
  });

  it('extracts correct item name and base type', () => {
    const item = parseUniqueDetail(detailHtml, 'Brutus_Lead_Sprinkler');
    expect(item.name).toBe("Brutus' Lead Sprinkler");
    expect(item.baseType).toBe('Morning Star');
  });

  it('icon URL is a valid CDN or poecdn URL', () => {
    const item = parseUniqueDetail(detailHtml, 'Brutus_Lead_Sprinkler');
    expect(item.iconUrl).toMatch(/poecdn\.com|cdn\.poe2db\.tw/);
  });

  it('extracts implicits array with correct content', () => {
    const item = parseUniqueDetail(detailHtml, 'Brutus_Lead_Sprinkler');
    expect(item.implicits.length).toBe(1);
    expect(item.implicits[0]).toContain('Molten Shower');
  });

  it('extracts explicits array without duplicates', () => {
    const item = parseUniqueDetail(detailHtml, 'Brutus_Lead_Sprinkler');
    expect(item.explicits.length).toBe(5);
    expect(item.explicits.some(e => e.includes('Physical Damage'))).toBe(true);
    expect(item.explicits.some(e => e.includes('Strength'))).toBe(true);
  });
});
