// scripts/scrape.mjs
import { mkdir } from 'node:fs/promises';
import { writeFileSync } from 'node:fs';
import { fetchCached } from './poe2db/fetch.mjs';
import { parseUniqueList, parseUniqueDetail } from './poe2db/parsers/uniques.mjs';
import { parseRunes } from './poe2db/parsers/runes.mjs';
import { parseKalguuranSkills } from './poe2db/parsers/kalguuran.mjs';
import { parseAscendancy } from './poe2db/parsers/ascendancies.mjs';
import { parseEndgameContent } from './poe2db/parsers/endgame.mjs';
import { fetchPatchNotes } from './patchnotes.mjs';

const OUT = 'src/content/generated';

async function ensureOutDir() {
  await mkdir(OUT, { recursive: true });
}

function write(name, data) {
  const path = `${OUT}/${name}.json`;
  writeFileSync(path, JSON.stringify(data, null, 2), 'utf8');
  console.log(`Written: ${path} (${data?.length ?? Object.keys(data ?? {}).length} records)`);
}

async function scrapeUniques() {
  console.log('\n=== Uniques ===');
  const listHtml = await fetchCached('https://poe2db.tw/us/Runes_of_Aldur_uniques');
  const items = parseUniqueList(listHtml);
  console.log(`Found ${items.length} uniques in league list. Fetching details...`);

  const detailed = [];
  for (const item of items) {
    const detailHtml = await fetchCached(`https://poe2db.tw/us/${item.slug}`);
    const detail = parseUniqueDetail(detailHtml, item.slug);
    detailed.push({ ...item, ...detail, confidence: 'confirmed' });
  }

  write('uniques', detailed);
}

async function scrapeRunes() {
  console.log('\n=== Runes ===');
  const html = await fetchCached('https://poe2db.tw/us/Runes_of_Aldur_league');
  const runes = parseRunes(html);
  write('runes', runes);
}

async function scrapeKalguuran() {
  console.log('\n=== Kalguuran Skills ===');
  const html = await fetchCached('https://poe2db.tw/us/Kalguuran_Skills');
  const skills = parseKalguuranSkills(html);
  write('kalguuran', skills);
}

async function scrapeAscendancies() {
  console.log('\n=== Ascendancies ===');
  const swHtml = await fetchCached('https://poe2db.tw/us/Spirit_Walker');
  const maHtml = await fetchCached('https://poe2db.tw/us/Martial_Artist');
  const spiritWalker = parseAscendancy(swHtml, 'Spirit Walker');
  const martialArtist = parseAscendancy(maHtml, 'Martial Artist');
  write('ascendancies', [spiritWalker, martialArtist]);
}

async function scrapeEndgame() {
  console.log('\n=== Endgame ===');
  const html = await fetchCached('https://poe2db.tw/us/Version_0.5.0');
  const mechanics = parseEndgameContent(html);
  write('endgame', mechanics);
}

async function scrapePatchNotes() {
  const sections = await fetchPatchNotes();
  write('patchNotes', sections);
}

const CATEGORIES = {
  uniques: scrapeUniques,
  runes: scrapeRunes,
  kalguuran: scrapeKalguuran,
  ascendancies: scrapeAscendancies,
  endgame: scrapeEndgame,
  patchnotes: scrapePatchNotes,
};

async function main() {
  await ensureOutDir();
  const targets = process.argv.slice(2);

  if (targets.length > 0) {
    const unknown = targets.filter(t => !(t in CATEGORIES));
    if (unknown.length > 0) {
      console.error('Unknown categories:', unknown.join(', '));
      console.error('Valid:', Object.keys(CATEGORIES).join(', '));
      process.exit(1);
    }
  }

  const toRun = targets.length > 0 ? targets : Object.keys(CATEGORIES);
  for (const cat of toRun) {
    await CATEGORIES[cat]();
  }
  console.log('\nScrape complete.');
}

main().catch(err => { console.error(err); process.exit(1); });
