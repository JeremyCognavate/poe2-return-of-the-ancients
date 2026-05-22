// scripts/poe2db/parsers/kalguuran.mjs
import * as cheerio from 'cheerio';

/**
 * Slugs that are not Kalguuran skills even if present on the page.
 * Footer nav links (Economy, news, etc.) or anchors we know are unrelated.
 */
const NAV_SLUGS = new Set([
  'Economy',
  'news',
  'privacy',
  'General_disclaimer',
  'patreon',
  'Runes_of_Aldur_challenges',
  'Build_Planner',
]);

/**
 * Known Kalguuran skill slugs from the Kalguuran_Skills page.
 * Used as an allowlist so we don't accidentally include navigation links.
 */
const SKILL_SLUG_RE =
  /^(Frostflame_Nova|Hollow_Shell|Repulsion|Triskelion_Cascade|Concussive_Runes|Runic_Infusion|Mark_of_Repulsion)$/;

/**
 * Parse the Kalguuran_Skills page (https://poe2db.tw/us/Kalguuran_Skills).
 *
 * The page lists 6 skills as anchor links with relative hrefs inside a <ul>:
 *   Frostflame_Nova, Hollow_Shell, Repulsion, Triskelion_Cascade,
 *   Concussive_Runes, Runic_Infusion
 *
 * Note: The league page (Runes_of_Aldur_league) calls one skill
 * "Mark of Repulsion" (slug Mark_of_Repulsion), while the Kalguuran_Skills
 * page calls the same or a related skill "Repulsion" (slug Repulsion).
 * Both are captured here if present; the T10 merge task resolves the conflict.
 *
 * Returned shape:
 *   { name: string, slug: string, iconUrl: string }[]
 *
 * iconUrl is empty string — the page does not embed images for these links.
 */
export function parseKalguuranSkills(html) {
  const $ = cheerio.load(html);
  const seen = new Set();
  const skills = [];

  $('a').each((_, el) => {
    const href = $(el).attr('href') || '';

    // Only relative hrefs (no slash, no http, no hash)
    if (href.startsWith('/') || href.startsWith('http') || href.includes('#')) return;

    const slug = href.trim();
    if (!slug || slug.length < 2) return;
    if (NAV_SLUGS.has(slug)) return;
    // Accept known skill slugs OR any slug that looks like a skill (CamelCase, no spaces)
    // Prefer SKILL_SLUG_RE allowlist; fall through to a broader heuristic only if needed.
    if (!SKILL_SLUG_RE.test(slug) && !/^[A-Z][A-Za-z_]+$/.test(slug)) return;
    // Skip pure navigation that leaked through
    if (['Atziris_Temple', 'Waystones', 'Shrine', 'Strongbox', 'Essence',
         'Archnemesis', 'Azmeri_Spirit', 'Rogue_Exile', 'Map_Boss',
         'Precursor_Towers', 'Corrupted_Nexus', 'Abyss', 'Breach', 'Ritual',
         'Delirium', 'Expedition', 'The_Burning_Monolith',
         'Trial_of_the_Sekhemas', 'The_Trial_of_Chaos',
         'League', 'Kalguuran'].includes(slug)) return;

    if (seen.has(slug)) return;
    seen.add(slug);

    const name = $(el).text().trim();
    if (!name) return;

    // Icon: look for an img sibling or inside parent
    const img = $(el).find('img').first();
    const parentImg = $(el).parent().find('img').first();
    const iconUrl = img.attr('src') || parentImg.attr('src') || '';

    skills.push({ name, slug, iconUrl });
  });

  return skills;
}
