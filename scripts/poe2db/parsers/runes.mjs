// scripts/poe2db/parsers/runes.mjs
import * as cheerio from 'cheerio';

/**
 * Slug patterns that identify rune items (used to find the primary rune list UL).
 */
const RUNE_SLUG_RE =
  /^(Archaic_Rune|Warding_Rune|Ward_Rune|.*_of_Aldur$|Cadigans_Epiphany|Uhtreds_Sidereus)/;

/**
 * Name patterns that identify rune items when no anchor link is present.
 * Used for unlinked <li> text like "Ire of Aldur".
 */
const RUNE_NAME_RE =
  /^(Archaic Rune|Warding Rune|Ward Rune|.+ of Aldur$|Cadigan|Uhtred)/;

/**
 * Infer a tier string from a rune name.
 * - "Archaic Rune of X" -> 'archaic'
 * - "Warding Rune of X" -> 'warding'
 * - "X of Aldur" -> 'aldur'
 * - Everything else (Ward Rune, named items) -> 'special'
 */
function inferTier(name) {
  if (/^archaic/i.test(name)) return 'archaic';
  if (/^warding/i.test(name)) return 'warding';
  if (/of aldur$/i.test(name)) return 'aldur';
  return 'special';
}

/**
 * Convert a display name to a slug (spaces -> underscores, apostrophes stripped).
 * Used for unlinked items where no href is available.
 */
function nameToSlug(name) {
  return name.replace(/'/g, '').replace(/\s+/g, '_');
}

/**
 * Parse the Runes_of_Aldur_league page.
 *
 * The page is narrative prose with no data table. Rune items appear as a
 * single <ul> list, most as anchor links with relative hrefs, but three
 * ("Ire of Aldur", "Passion of Aldur", "Betrayal of Aldur") are plain text
 * <li> items without anchors.
 *
 * Strategy:
 *   1. Find the <ul> that contains the most anchor hrefs matching RUNE_SLUG_RE.
 *   2. Extract every <li> from that UL — linked items get their name + slug
 *      from the anchor; unlinked items get their name from text and a derived slug.
 *
 * Returned shape:
 *   { name: string, slug: string, tier: string, confidence: 'confirmed' }[]
 *
 * No per-rune effect text is available on this page.
 */
export function parseRunes(html) {
  const $ = cheerio.load(html);

  // Find the UL with the most rune anchor links
  let bestUl = null;
  let bestCount = 0;

  $('ul').each((_, ul) => {
    const count = $(ul).find('a').filter((_, a) => {
      const href = $(a).attr('href') || '';
      return RUNE_SLUG_RE.test(href);
    }).length;

    if (count > bestCount) {
      bestCount = count;
      bestUl = $(ul);
    }
  });

  if (!bestUl || bestCount === 0) return [];

  const runes = [];

  bestUl.find('li').each((_, li) => {
    const anchor = $(li).find('a').first();
    let name, slug;

    if (anchor.length) {
      const href = anchor.attr('href') || '';
      slug = href.trim();
      name = anchor.text().trim();
    } else {
      // Plain text item — derive slug from name
      name = $(li).text().trim();
      slug = nameToSlug(name);
    }

    if (!name || name.length < 2) return;

    // Only accept names that look like runes
    if (!RUNE_NAME_RE.test(name)) return;

    runes.push({
      name,
      slug,
      tier: inferTier(name),
      confidence: 'confirmed',
    });
  });

  return runes;
}
