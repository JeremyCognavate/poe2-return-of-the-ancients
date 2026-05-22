// scripts/poe2db/parsers/kalguuran.mjs
import * as cheerio from 'cheerio';

/**
 * Known Kalguuran skill slugs from the Kalguuran_Skills page.
 * Used as the sole allowlist filter so we don't accidentally include navigation links.
 */
const SKILL_SLUG_RE =
  /^(Frostflame_Nova|Hollow_Shell|Repulsion|Triskelion_Cascade|Concussive_Runes|Runic_Infusion)$/;

/**
 * Parse the Kalguuran_Skills page (https://poe2db.tw/us/Kalguuran_Skills).
 *
 * The page lists 6 skills as anchor links with relative hrefs inside a <ul>
 * within the #markContent div:
 *   Frostflame_Nova, Hollow_Shell, Repulsion, Triskelion_Cascade,
 *   Concussive_Runes, Runic_Infusion
 *
 * Returned shape:
 *   { name: string, slug: string, iconUrl: string }[]
 *
 * iconUrl is empty string — the page does not embed images for these links.
 */
export function parseKalguuranSkills(html) {
  if (!html || typeof html !== 'string') return [];

  const $ = cheerio.load(html);
  const seen = new Set();
  const skills = [];

  $('#markContent a').each((_, el) => {
    const href = $(el).attr('href') || '';
    const slug = href.trim();

    if (!SKILL_SLUG_RE.test(slug)) return;

    if (seen.has(slug)) return;
    seen.add(slug);

    const name = $(el).text().trim();
    if (!name) return;

    const iconUrl = $(el).find('img').first().attr('src') || '';

    skills.push({ name, slug, iconUrl });
  });

  return skills;
}
