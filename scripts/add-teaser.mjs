// scripts/add-teaser.mjs
import { readFileSync, writeFileSync, existsSync } from 'node:fs';

const WN = 'src/content/whatsnew.json';

function arg(flag) {
  const i = process.argv.indexOf(flag);
  return i >= 0 ? process.argv[i + 1] : undefined;
}

const url = arg('--url');
const summary = arg('--summary');
if (!url || !summary) {
  console.error('Usage: node scripts/add-teaser.mjs --url <yt-url> --summary "<text>"');
  process.exit(1);
}

const oembed = await fetch(
  `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`
).then(r => {
  if (!r.ok) throw new Error(`oEmbed ${r.status}`);
  return r.json();
});

const entry = {
  date: new Date().toISOString().slice(0, 10),
  kind: 'teaser',
  label: oembed.title,
  channel: oembed.author_name,
  url,
  thumbnail: oembed.thumbnail_url,
  summary,
};

const existing = existsSync(WN) ? JSON.parse(readFileSync(WN, 'utf8')) : [];
writeFileSync(WN, JSON.stringify([entry, ...existing], null, 2), 'utf8');
console.log(`Added teaser: ${entry.label}`);
