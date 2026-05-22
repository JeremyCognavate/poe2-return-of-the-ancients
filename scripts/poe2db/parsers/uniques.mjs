// scripts/poe2db/parsers/uniques.mjs
import * as cheerio from 'cheerio';

/**
 * Parse the league-specific uniques list page.
 * Returns an array of { name, slug, iconUrl } objects.
 *
 * PoE2DB structure (Runes_of_Aldur_uniques page):
 *   Each item is an `a.UniqueItem` element.
 *   Two sub-patterns:
 *     1. Plain-text anchor: href="Slug" (relative), inner text = item name
 *     2. Structured anchor: href="/us/Slug", contains span.uniqueName + span.uniqueTypeLine
 *   Icon is the first `<img>` in the sibling `.d-flex` container (may be absent).
 */
export function parseUniqueList(html) {
  const $ = cheerio.load(html);
  const items = [];

  $('a.UniqueItem').each((_, el) => {
    const href = $(el).attr('href') || '';

    // Normalise slug: strip /us/ prefix and any leading slash
    const slug = href.replace(/^\/us\//, '').replace(/^\//, '').trim();
    if (!slug || slug.includes('/') || slug.length < 2) return;

    // Prefer .uniqueName child text when present (structured pattern)
    const nameEl = $(el).find('.uniqueName');
    const name = nameEl.length
      ? nameEl.text().trim()
      : $(el).text().trim();

    if (!name) return;

    // Icon: look in the ancestor .d-flex for the first img
    const dFlex = $(el).closest('.d-flex');
    const iconUrl = dFlex.find('img').first().attr('src') || '';

    items.push({ name, slug, iconUrl });
  });

  // Deduplicate by slug (shouldn't occur, but be safe)
  const seen = new Set();
  return items.filter(item => {
    if (seen.has(item.slug)) return false;
    seen.add(item.slug);
    return true;
  });
}

/**
 * Parse an individual unique item detail page.
 * Scopes to `#Deferred .UniquePopup` to avoid reading duplicated hover tooltips.
 *
 * Returns { name, slug, baseType, iconUrl, implicits, explicits, reqLevel }.
 */
export function parseUniqueDetail(html, slug) {
  const $ = cheerio.load(html);

  // Authoritative item frame: the #Deferred tab's first UniquePopup
  const popup = $('#Deferred .UniquePopup').first();

  // Item name (not the typeLine)
  const name = popup.find('.itemName').not('.typeLine').first().text().trim()
    || $('meta[property="og:title"]').attr('content')?.trim()
    || slug.replace(/_/g, ' ');

  // Base type (the typeLine)
  const baseType = popup.find('.itemName.typeLine').first().text().trim() || '';

  // Icon: og:image is most reliable for the item art
  const iconUrl = $('meta[property="og:image"]').attr('content')?.trim() || '';

  // Mods scoped to the popup
  const implicits = [];
  popup.find('.implicitMod').each((_, el) => {
    const text = $(el).text().trim();
    if (text) implicits.push(text);
  });

  const explicits = [];
  popup.find('.explicitMod').each((_, el) => {
    const text = $(el).text().trim();
    if (text) explicits.push(text);
  });

  // Required level — appears in the Stats section as text
  const statsText = popup.find('.Stats').text();
  const reqLevelMatch = statsText.match(/Requires[:\s]+Level\s+(\d+)/i);
  const reqLevel = reqLevelMatch ? parseInt(reqLevelMatch[1], 10) : undefined;

  return { name, slug, baseType, iconUrl, implicits, explicits, reqLevel };
}
