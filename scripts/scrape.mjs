// scripts/scrape.mjs
import { mkdir } from 'node:fs/promises';
import { writeFileSync, readFileSync, existsSync } from 'node:fs';
import { fetchCached } from './poe2db/fetch.mjs';
import { parseUniqueList, parseUniqueDetail } from './poe2db/parsers/uniques.mjs';
import { parseRunes } from './poe2db/parsers/runes.mjs';
import { parseKalguuranSkills } from './poe2db/parsers/kalguuran.mjs';
import { parseAscendancy } from './poe2db/parsers/ascendancies.mjs';
import { parseEndgameContent } from './poe2db/parsers/endgame.mjs';
import { fetchPatchNotes } from './patchnotes.mjs';
import { diffDatasets } from './diff.mjs';

const OUT = 'src/content/generated';
const KEY_FIELDS = {
  uniques: 'slug', runes: 'slug', kalguuran: 'slug',
  ascendancies: 'name', endgame: 'id', patchNotes: 'id',
};
const changelog = [];

async function ensureOutDir() {
  await mkdir(OUT, { recursive: true });
}

function write(name, data) {
  const path = `${OUT}/${name}.json`;
  const keyField = KEY_FIELDS[name];
  if (keyField && Array.isArray(data)) {
    const prior = existsSync(path)
      ? JSON.parse(readFileSync(path, 'utf8'))
      : null;
    const normalized = JSON.parse(JSON.stringify(data));
    const { added, changed } = diffDatasets(prior, normalized, keyField);
    const today = new Date().toISOString().slice(0, 10);
    const byKey = new Map(data.map(o => [o[keyField], o]));
    for (const key of added) {
      const o = byKey.get(key);
      changelog.push({ date: today, kind: 'added', dataset: name, key, label: o?.name ?? o?.title ?? key });
    }
    for (const { key, fields } of changed) {
      const o = byKey.get(key);
      changelog.push({ date: today, kind: 'changed', dataset: name, key, label: o?.name ?? o?.title ?? key, fields });
    }
  }
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
  if (changelog.length > 0) {
    const wnPath = 'src/content/whatsnew.json';
    const existing = existsSync(wnPath) ? JSON.parse(readFileSync(wnPath, 'utf8')) : [];
    const cutoff = new Date(Date.now() - 7 * 864e5).toISOString().slice(0, 10);
    const merged = [...changelog, ...existing].filter(e => e.date >= cutoff);
    writeFileSync(wnPath, JSON.stringify(merged, null, 2), 'utf8');
    console.log(`What's New: +${changelog.length} entries`);
  }
  console.log('\nScrape complete.');
}

main().catch(err => { console.error(err); process.exit(1); });
