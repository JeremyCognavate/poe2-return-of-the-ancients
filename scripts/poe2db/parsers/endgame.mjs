// scripts/poe2db/parsers/endgame.mjs
import * as cheerio from 'cheerio';

/**
 * Endgame section names to extract from the Version_0.5.0 page.
 * These are the headings that correspond to endgame mechanics:
 * the Endgame category plus all the specific mechanics and systems.
 *
 * Sections deliberately excluded: Table of Contents, The Runes of Aldur League,
 * Campaign Replayability, Player Changes, New Content and Features,
 * Ascendancy/Passive/Skill/Support/Unique/Item/Monster/Quest/UI/Microtransaction
 * Changes, Bug Fixes.
 */
const ENDGAME_SECTIONS = new Set([
  'Endgame',
  'Origins of Divinity, the Endgame Overhaul',
  'Masters of the Atlas',
  'Delirium',
  'Breach',
  'Ritual',
  'Fate of the Vaal Moving To Core',
  'Abyss',
  'Expedition',
  'Other Endgame Changes',
]);

/**
 * Slugify a heading name for use as an `id`.
 *
 * @param {string} text
 * @returns {string}
 */
function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

/**
 * Parse endgame mechanics from the Version_0.5.0 patch notes page.
 *
 * Structure: the page has a `.box-content` div containing a sequence of
 * <h3> headings. Each endgame section heading is immediately followed by a
 * <ul> of bullet-point details.
 *
 * @param {string} html - Full HTML of the version page
 * @returns {Array<{ id: string, name: string, category: string, shortDesc: string, details: string[], confidence: string }>}
 */
export function parseEndgameContent(html) {
  if (!html || typeof html !== 'string') return [];

  const $ = cheerio.load(html);

  // The news post is inside .box-content
  const content = $('.box-content');
  if (!content.length) return [];

  const mechanics = [];

  content.find('h3').each((_, h3) => {
    const name = $(h3).text().trim();
    if (!ENDGAME_SECTIONS.has(name)) return;

    // Collect bullet items from the immediately following <ul>
    const ul = $(h3).next('ul');
    const details = [];
    ul.find('> li').each((_, li) => {
      // Nested lists: get just the top-level text for top-level items,
      // but include full .text() which is fine for details
      const text = $(li).text().trim();
      if (text) details.push(text);
    });

    // shortDesc = first bullet (empty string if no bullets)
    const shortDesc = details[0] || '';

    mechanics.push({
      id: slugify(name),
      name,
      category: 'endgame',
      shortDesc,
      details,
      confidence: 'confirmed',
    });
  });

  return mechanics;
}
