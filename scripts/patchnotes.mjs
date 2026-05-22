// scripts/patchnotes.mjs
import * as cheerio from 'cheerio';
import { fetchCached } from './poe2db/fetch.mjs';
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { pathToFileURL } from 'node:url';

const PATCH_NOTES_URL = 'https://www.pathofexile.com/forum/view-thread/3932540';
const OUTPUT_PATH = 'src/content/generated/patchNotes.json';

// Maps lowercased title keywords to site taxonomy categories.
// Order matters: more specific keys must precede broader overlapping ones.
const CATEGORY_MAP = [
  ['runes of aldur', 'league'],
  ['kalguuran', 'league'],
  ['origins of divinity', 'endgame'],
  ['masters of the atlas', 'endgame'],
  ['delirium', 'endgame'],
  ['breach', 'endgame'],
  ['ritual', 'endgame'],
  ['fate of the vaal', 'endgame'],
  ['abyss', 'endgame'],
  ['expedition', 'endgame'],
  ['other endgame', 'endgame'],
  ['endgame', 'endgame'],
  ['atlas', 'endgame'],
  ['ascendancy', 'ascendancy'],
  ['passive tree', 'balance'],
  ['skill', 'skills'],
  ['support', 'skills'],
  ['unique item', 'uniques'],
  ['item', 'items'],
  ['player changes', 'balance'],
  ['monster changes', 'balance'],
  ['campaign', 'campaign'],
  ['user interface', 'qol'],
  ['quality of life', 'qol'],
  ['quest', 'other'],
  ['microtransaction', 'other'],
  ['bug fix', 'other'],
  ['new content', 'other'],
];

function titleToCategory(title) {
  const lower = title.toLowerCase();
  for (const [key, cat] of CATEGORY_MAP) {
    if (lower.includes(key)) return cat;
  }
  return 'other';
}

function titleToId(title) {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

export function parsePatchNotes(html) {
  const $ = cheerio.load(html);
  const sections = [];

  // Each content section is wrapped in .lbox-container[id], skipping #top (Table of Contents).
  $('.lbox-container[id]').not('#top').each((_, container) => {
    const $c = $(container);
    const title = $c.find('h3').first().text().trim();
    if (!title) return;

    const entries = [];

    // Collect all li items from ul elements directly inside .box-content
    $c.find('.box-content > ul > li').each((_, li) => {
      const text = $(li).text().trim();
      if (text) entries.push(text);
    });

    // Also collect any direct p paragraphs (excluding "Return to top" nav links)
    $c.find('.box-content > p').each((_, p) => {
      const text = $(p).text().trim();
      if (text && !/return to top/i.test(text)) entries.push(text);
    });

    sections.push({
      id: titleToId(title),
      title,
      category: titleToCategory(title),
      entries,
    });
  });

  return sections;
}

export async function fetchPatchNotes() {
  console.log('\n=== Patch Notes ===');
  console.log('Fetching patch notes...');
  const html = await fetchCached(PATCH_NOTES_URL, {
    cacheDir: '.cache/patchnotes',
    cacheKey: 'forum-thread-3932540',
  });
  const sections = parsePatchNotes(html);
  const totalEntries = sections.reduce((n, s) => n + s.entries.length, 0);
  console.log(`Parsed ${sections.length} sections, ${totalEntries} entries.`);
  return sections;
}

export async function runPatchNotes() {
  const sections = await fetchPatchNotes();
  mkdirSync(dirname(OUTPUT_PATH), { recursive: true });
  writeFileSync(OUTPUT_PATH, JSON.stringify(sections, null, 2), 'utf8');
  console.log(`Written to ${OUTPUT_PATH}`);
  return sections;
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  runPatchNotes().catch(console.error);
}
