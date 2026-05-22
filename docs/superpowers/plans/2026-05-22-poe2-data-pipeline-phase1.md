# POE2 0.5 Data Pipeline & Patch Notes — Phase 1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a reusable PoE2DB scraper and patch-notes parser, refresh all 0.5.0 content data, and ship a curated + filterable Patch Notes section alongside the updated existing sections — all before the 2026-05-29 launch.

**Architecture:** A `scripts/` pipeline (Node ESM, Cheerio) fetches PoE2DB HTML and the official patch notes forum post, writes structured JSON to `src/content/generated/`, and the existing `src/content/*.ts` modules merge that scraped data with their hand-authored curation. Patch notes are a second independent content module that drives a new filterable Patch Notes section + updated confidence tiers in existing sections. Phase 2 (tooltip/interactivity overhaul) depends on the data model established here and is planned separately.

**Tech Stack:** Astro 5, pnpm, Node ESM (.mjs), Cheerio 1.x (HTML parsing), Vitest (tests), TypeScript, Tailwind v4, React 18 (existing island pattern). Source URLs: `https://poe2db.tw/us/*`, `https://www.pathofexile.com/forum/view-thread/3932540`.

---

## File Map

```
scripts/
  poe2db/
    fetch.mjs              # Polite fetcher: cache, rate limit, UA, robots
    parsers/
      uniques.mjs          # Unique items: list page + detail pages
      runes.mjs            # Runes of Aldur: rune list + stats
      kalguuran.mjs        # Kalguuran skills + supports
      ascendancies.mjs     # Spirit Walker + Martial Artist nodes
      endgame.mjs          # Atlas nodes, endgame mechanics
  patchnotes.mjs           # Patch notes forum parser
  scrape.mjs               # Orchestrator — parameterised, idempotent
  __tests__/
    fetch.test.mjs
    uniques.test.mjs
    runes.test.mjs
    kalguuran.test.mjs
    ascendancies.test.mjs
    endgame.test.mjs
    patchnotes.test.mjs
  __fixtures__/
    uniques-list.html      # Saved from cache after first scrape run
    unique-detail.html
    runes-list.html
    kalguuran-list.html
    ascendancies-spirit-walker.html
    endgame-version.html
    patchnotes-forum.html

src/content/
  generated/              # Gitignored machine output (run pnpm scrape to populate)
    uniques.json
    runes.json
    kalguuran.json
    ascendancies.json
    endgame.json
    patchNotes.json
  sources.ts              # MODIFY: extend with MergedRecord, SourcePrecedence types
  uniques.ts              # MODIFY: import generated/uniques.json, merge
  runes.ts                # MODIFY: import generated/runes.json, merge
  kalguuran.ts            # MODIFY: import generated/kalguuran.json, merge
  ascendancies.ts         # MODIFY: import generated/ascendancies.json, merge
  endgame.ts              # MODIFY: import generated/endgame.json, merge
  atlasNodes.ts           # MODIFY: import generated/endgame.json atlas section, merge
  balance.ts              # MODIFY: import generated/patchNotes.json balance sections, merge
  masters.ts              # MODIFY: update Alith from patchNotes if mentioned
  timeline.ts             # MODIFY: patch notes confirm dates → confidence: 'confirmed'
  qol.ts                  # MODIFY: merge QoL from patch notes
  patchNotes.ts           # CREATE: typed wrapper for generated/patchNotes.json
  index.ts                # MODIFY: export patchNotes

src/components/
  PatchNotesFilter.tsx    # CREATE: React island — search + category filter for patch notes
  PatchNotesSection.astro # CREATE: Astro wrapper component for the patch notes section

src/pages/
  index.astro             # MODIFY: add patch notes section + updated confidence on existing sections

src/components/
  Sidebar.tsx             # MODIFY: add patch-notes nav entry

src/styles/
  global.css              # MODIFY: patch notes filter/card styles

package.json              # MODIFY: add cheerio dep, vitest, scrape script, test script
.gitignore                # MODIFY: add .cache/, .superpowers/, src/content/generated/
```

---

## Task 1: Setup — deps, .gitignore, scripts skeleton, package.json scripts

**Files:**
- Modify: `package.json`
- Modify: `.gitignore`
- Create: `scripts/poe2db/parsers/.gitkeep` (skeleton)

- [ ] **Step 1.1: Install cheerio and vitest**

```bash
pnpm add -D cheerio vitest
```

Expected: `pnpm-lock.yaml` updated, `node_modules/cheerio` present.

- [ ] **Step 1.2: Add scripts and test script to package.json**

In `package.json`, add to `"scripts"`:
```json
"scrape": "node scripts/scrape.mjs",
"test": "vitest run"
```

Full updated scripts block:
```json
"scripts": {
  "dev": "astro dev",
  "build": "astro build",
  "preview": "astro preview",
  "astro": "astro",
  "deploy": "astro build && wrangler pages deploy ./dist",
  "scrape": "node scripts/scrape.mjs",
  "test": "vitest run"
}
```

- [ ] **Step 1.3: Update .gitignore**

Append to `.gitignore`:
```
# Scrape cache (re-run pnpm scrape to refresh)
.cache/

# Brainstorming session
.superpowers/

# Machine-generated content (run pnpm scrape to regenerate)
src/content/generated/
```

- [ ] **Step 1.4: Create directory skeleton**

```bash
mkdir -p scripts/poe2db/parsers
mkdir -p scripts/__tests__
mkdir -p scripts/__fixtures__
mkdir -p .cache/poe2db
mkdir -p src/content/generated
```

- [ ] **Step 1.5: Verify vitest runs (empty)**

```bash
pnpm test
```

Expected output: `No test files found` (or similar — no failures).

- [ ] **Step 1.6: Commit**

```bash
git add package.json pnpm-lock.yaml .gitignore
git commit -m "chore: add cheerio + vitest, scrape/test scripts, gitignore entries"
```

---

## Task 2: Polite Fetcher (`scripts/poe2db/fetch.mjs`)

Rate-limited, disk-cached, robots-respecting fetcher. No network on re-runs.

**Files:**
- Create: `scripts/poe2db/fetch.mjs`
- Create: `scripts/__tests__/fetch.test.mjs`

- [ ] **Step 2.1: Write the failing test**

Create `scripts/__tests__/fetch.test.mjs`:
```js
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { promises as fs } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fetchCached } from '../poe2db/fetch.mjs';

describe('fetchCached', () => {
  let cacheDir;

  beforeEach(async () => {
    cacheDir = join(tmpdir(), `poe2db-test-${Date.now()}`);
    await fs.mkdir(cacheDir, { recursive: true });
  });

  afterEach(async () => {
    await fs.rm(cacheDir, { recursive: true, force: true });
  });

  it('returns HTML string from cache when available', async () => {
    const cacheKey = 'test-page';
    const fakePath = join(cacheDir, `${cacheKey}.html`);
    await fs.writeFile(fakePath, '<html><body>cached</body></html>', 'utf8');

    const html = await fetchCached('https://example.com/test-page', { cacheDir, cacheKey });
    expect(html).toBe('<html><body>cached</body></html>');
  });

  it('cache file is created after a live fetch (integration — skipped without network)', async () => {
    // Only assert the cache key derivation doesn't throw
    const key = cacheKeyFor('https://poe2db.tw/us/Test_Page');
    expect(key).toBe('us_Test_Page');
  });
});

function cacheKeyFor(url) {
  const u = new URL(url);
  return u.pathname.replace(/^\//, '').replace(/\//g, '_');
}
```

- [ ] **Step 2.2: Run test to verify it fails**

```bash
pnpm test
```

Expected: `Cannot find module '../poe2db/fetch.mjs'`

- [ ] **Step 2.3: Implement `scripts/poe2db/fetch.mjs`**

```js
// scripts/poe2db/fetch.mjs
import { promises as fs } from 'node:fs';
import { join } from 'node:path';

const CACHE_DIR = '.cache/poe2db';
const RATE_LIMIT_MS = 1100;
const USER_AGENT = 'poe2-05-site/1.0 (data refresh; github.com/your-repo; polite-bot)';

let lastFetchTime = 0;

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export function cacheKeyFor(url) {
  const u = new URL(url);
  return u.pathname.replace(/^\//, '').replace(/\//g, '_') || 'index';
}

export async function fetchCached(url, options = {}) {
  const cacheDir = options.cacheDir ?? CACHE_DIR;
  const cacheKey = options.cacheKey ?? cacheKeyFor(url);
  const cachePath = join(cacheDir, `${cacheKey}.html`);

  await fs.mkdir(cacheDir, { recursive: true });

  try {
    const cached = await fs.readFile(cachePath, 'utf8');
    console.log(`[cache hit] ${cacheKey}`);
    return cached;
  } catch {
    // cache miss — fetch live
  }

  const now = Date.now();
  const wait = RATE_LIMIT_MS - (now - lastFetchTime);
  if (wait > 0) await sleep(wait);
  lastFetchTime = Date.now();

  console.log(`[fetch] ${url}`);
  const res = await fetch(url, {
    headers: {
      'User-Agent': USER_AGENT,
      'Accept': 'text/html,application/xhtml+xml',
    },
  });

  if (!res.ok) throw new Error(`HTTP ${res.status} fetching ${url}`);

  const html = await res.text();
  await fs.writeFile(cachePath, html, 'utf8');
  return html;
}

export async function fetchCachedForce(url) {
  const cacheKey = cacheKeyFor(url);
  const cachePath = join(CACHE_DIR, `${cacheKey}.html`);
  try { await fs.rm(cachePath); } catch {}
  return fetchCached(url, { cacheKey });
}
```

- [ ] **Step 2.4: Run test to verify it passes**

```bash
pnpm test
```

Expected: all tests pass.

- [ ] **Step 2.5: Commit**

```bash
git add scripts/poe2db/fetch.mjs scripts/__tests__/fetch.test.mjs
git commit -m "feat: add polite disk-cached fetcher for PoE2DB scraping"
```

---

## Task 3: Patch Notes Parser (`scripts/patchnotes.mjs`)

Fetches the forum thread and parses its ~25 h3-headed sections into structured entries.

**Files:**
- Create: `scripts/patchnotes.mjs`
- Create: `scripts/__tests__/patchnotes.test.mjs`
- Create: `scripts/__fixtures__/patchnotes-forum.html` (populated at step 3.1)

The official patch notes URL: `https://www.pathofexile.com/forum/view-thread/3932540`

Patch notes HTML structure (confirmed by inspection):
- Main post body in a `.content` or `.forum-post` container
- Major sections: `<h3>Section Title</h3>` headings
- Items: `<ul><li>...</li></ul>` or `<p>` paragraphs under each h3
- No special spans for game term markup — plain text

- [ ] **Step 3.1: Save fixture HTML**

```bash
node -e "
import('./poe2db/fetch.mjs').then(({ fetchCached }) =>
  fetchCached('https://www.pathofexile.com/forum/view-thread/3932540', {
    cacheDir: '.cache/patchnotes',
    cacheKey: 'forum-thread-3932540'
  }).then(html => {
    require('fs').writeFileSync('scripts/__fixtures__/patchnotes-forum.html', html);
    console.log('Fixture saved. Length:', html.length);
  })
)" 2>/dev/null || node --input-type=module <<'EOF'
import { fetchCached } from './scripts/poe2db/fetch.mjs';
import { writeFileSync } from 'node:fs';
const html = await fetchCached('https://www.pathofexile.com/forum/view-thread/3932540', {
  cacheDir: '.cache/patchnotes',
  cacheKey: 'forum-thread-3932540'
});
writeFileSync('scripts/__fixtures__/patchnotes-forum.html', html);
console.log('Fixture saved. Length:', html.length);
EOF
```

Expected: `scripts/__fixtures__/patchnotes-forum.html` created, length > 50000 chars.

If the above one-liner is awkward on Windows, use this instead:

```bash
node scripts/save-fixture.mjs patchnotes https://www.pathofexile.com/forum/view-thread/3932540 scripts/__fixtures__/patchnotes-forum.html
```

(Create `scripts/save-fixture.mjs` as a tiny helper if needed — see step 3.2.)

- [ ] **Step 3.2: Write failing test**

Create `scripts/__tests__/patchnotes.test.mjs`:
```js
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { parsePatchNotes } from '../patchnotes.mjs';

const html = readFileSync('scripts/__fixtures__/patchnotes-forum.html', 'utf8');

describe('parsePatchNotes', () => {
  it('returns an array of section entries', () => {
    const sections = parsePatchNotes(html);
    expect(Array.isArray(sections)).toBe(true);
    expect(sections.length).toBeGreaterThan(10);
  });

  it('each section has required fields', () => {
    const sections = parsePatchNotes(html);
    for (const s of sections) {
      expect(s).toHaveProperty('id');
      expect(s).toHaveProperty('title');
      expect(s).toHaveProperty('category');
      expect(s).toHaveProperty('entries');
      expect(Array.isArray(s.entries)).toBe(true);
    }
  });

  it('finds The Runes of Aldur League section', () => {
    const sections = parsePatchNotes(html);
    const runes = sections.find(s => s.title.toLowerCase().includes('runes of aldur'));
    expect(runes).toBeDefined();
    expect(runes.entries.length).toBeGreaterThan(0);
  });

  it('finds Ascendancy Changes section', () => {
    const sections = parsePatchNotes(html);
    const asc = sections.find(s => s.title.toLowerCase().includes('ascendancy'));
    expect(asc).toBeDefined();
  });

  it('maps sections to site taxonomy categories', () => {
    const sections = parsePatchNotes(html);
    const validCategories = ['league', 'endgame', 'ascendancy', 'skills', 'balance',
      'uniques', 'items', 'qol', 'campaign', 'other'];
    for (const s of sections) {
      expect(validCategories).toContain(s.category);
    }
  });
});
```

- [ ] **Step 3.3: Run test — expect fixture-not-found or import failure**

```bash
pnpm test scripts/__tests__/patchnotes.test.mjs
```

Expected: fails (module not found or fixture empty).

- [ ] **Step 3.4: Implement `scripts/patchnotes.mjs`**

```js
// scripts/patchnotes.mjs
import * as cheerio from 'cheerio';
import { fetchCached } from './poe2db/fetch.mjs';
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';

const PATCH_NOTES_URL = 'https://www.pathofexile.com/forum/view-thread/3932540';
const OUTPUT_PATH = 'src/content/generated/patchNotes.json';

const CATEGORY_MAP = {
  'runes of aldur': 'league',
  'kalguuran': 'league',
  'endgame': 'endgame',
  'origins of divinity': 'endgame',
  'masters of the atlas': 'endgame',
  'delirium': 'endgame',
  'breach': 'endgame',
  'ritual': 'endgame',
  'abyss': 'endgame',
  'expedition': 'endgame',
  'fate of the vaal': 'endgame',
  'atlas': 'endgame',
  'ascendancy': 'ascendancy',
  'passive tree': 'balance',
  'skill changes': 'skills',
  'support changes': 'skills',
  'unique item': 'uniques',
  'item changes': 'items',
  'player changes': 'balance',
  'monster changes': 'balance',
  'campaign': 'campaign',
  'user interface': 'qol',
  'quality of life': 'qol',
  'quest': 'other',
  'microtransaction': 'other',
  'bug fix': 'other',
  'new content': 'other',
};

function titleToCategory(title) {
  const lower = title.toLowerCase();
  for (const [key, cat] of Object.entries(CATEGORY_MAP)) {
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

  // Forum post body — try common containers
  const postBody = $('.forum-post-content, .content, [class*="post"] .content, .forum-post .userContent, #thread-post-container .content').first();
  const root = postBody.length ? postBody : $('body');

  root.find('h3').each((_, el) => {
    const titleEl = $(el);
    const title = titleEl.text().trim();
    if (!title) return;

    const entries = [];
    let next = titleEl.next();

    while (next.length && !next.is('h3')) {
      if (next.is('ul')) {
        next.find('li').each((_, li) => {
          const text = $(li).text().trim();
          if (text) entries.push(text);
        });
      } else if (next.is('p')) {
        const text = next.text().trim();
        if (text && !text.startsWith('[Return to top')) entries.push(text);
      }
      next = next.next();
    }

    sections.push({
      id: titleToId(title),
      title,
      category: titleToCategory(title),
      entries,
    });
  });

  return sections;
}

export async function runPatchNotes() {
  console.log('Fetching patch notes...');
  const html = await fetchCached(PATCH_NOTES_URL, {
    cacheDir: '.cache/patchnotes',
    cacheKey: 'forum-thread-3932540',
  });
  const sections = parsePatchNotes(html);
  console.log(`Parsed ${sections.length} sections, ${sections.reduce((n, s) => n + s.entries.length, 0)} entries.`);
  writeFileSync(OUTPUT_PATH, JSON.stringify(sections, null, 2), 'utf8');
  console.log(`Written to ${OUTPUT_PATH}`);
  return sections;
}

if (process.argv[1] === new URL(import.meta.url).pathname) {
  runPatchNotes().catch(console.error);
}
```

- [ ] **Step 3.5: Run test to verify it passes**

```bash
pnpm test scripts/__tests__/patchnotes.test.mjs
```

Expected: all 5 tests pass.

If the h3 selector finds 0 sections: the forum HTML may use a different structure. Inspect the fixture:
```bash
node -e "import('./poe2db/fetch.mjs').then()" # just loads ok
# Then open scripts/__fixtures__/patchnotes-forum.html in a browser or
# grep for heading tags:
node --input-type=module -e "
import { readFileSync } from 'fs';
const html = readFileSync('scripts/__fixtures__/patchnotes-forum.html', 'utf8');
const matches = html.match(/<h[1-6][^>]*>.*?<\/h[1-6]>/gi) || [];
console.log(matches.slice(0, 20).join('\n'));
"
```
Adjust the Cheerio selector in `parsePatchNotes` to match the actual heading tags found.

- [ ] **Step 3.6: Run patch notes scraper standalone**

```bash
node scripts/patchnotes.mjs
```

Expected: `src/content/generated/patchNotes.json` created, console shows 20+ sections and 200+ entries.

- [ ] **Step 3.7: Commit**

```bash
git add scripts/patchnotes.mjs scripts/__tests__/patchnotes.test.mjs scripts/__fixtures__/patchnotes-forum.html
git commit -m "feat: patch notes parser — fetches + parses 0.5.0 forum thread into structured JSON"
```

---

## Task 4: Uniques Parser (`scripts/poe2db/parsers/uniques.mjs`)

Scrapes `/us/Runes_of_Aldur_uniques` (league-specific) + `/us/Unique_item` (full list filtered to 0.5.0-new). Follows links to individual item pages for full mod text.

**Files:**
- Create: `scripts/poe2db/parsers/uniques.mjs`
- Create: `scripts/__tests__/uniques.test.mjs`
- Create: `scripts/__fixtures__/uniques-list.html`
- Create: `scripts/__fixtures__/unique-detail.html`

Known from PoE2DB inspection:
- List page: card grid with `<a href="/us/ItemName">`, `<img src="https://cdn.poe2db.tw/...">`, item name text
- Individual page URL: `https://poe2db.tw/us/Brutus_Lead_Sprinkler` etc.
- The league uniques from the existing `src/content/uniques.ts` include: Brutus' Lead Sprinkler, Eventide Petals, Horror's Flight, Ironbound, Liminal Coil, Periphery, Sylvan's Effigy, The Ordained, The Raven's Flock, Twisted Empyrean, Voices

- [ ] **Step 4.1: Save fixtures**

```bash
node --input-type=module <<'EOF'
import { fetchCached } from './scripts/poe2db/fetch.mjs';
import { writeFileSync } from 'node:fs';

const leagueHtml = await fetchCached('https://poe2db.tw/us/Runes_of_Aldur_uniques');
writeFileSync('scripts/__fixtures__/uniques-list.html', leagueHtml);

const detailHtml = await fetchCached('https://poe2db.tw/us/Brutus_Lead_Sprinkler');
writeFileSync('scripts/__fixtures__/unique-detail.html', detailHtml);
console.log('Fixtures saved.');
EOF
```

- [ ] **Step 4.2: Write failing test**

Create `scripts/__tests__/uniques.test.mjs`:
```js
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

  it('icon URL is a CDN URL', () => {
    const item = parseUniqueDetail(detailHtml, 'Brutus_Lead_Sprinkler');
    expect(item.iconUrl).toMatch(/cdn\.poe2db\.tw/);
  });
});
```

- [ ] **Step 4.3: Run test — expect failure**

```bash
pnpm test scripts/__tests__/uniques.test.mjs
```

Expected: module not found.

- [ ] **Step 4.4: Implement `scripts/poe2db/parsers/uniques.mjs`**

```js
// scripts/poe2db/parsers/uniques.mjs
import * as cheerio from 'cheerio';

export function parseUniqueList(html) {
  const $ = cheerio.load(html);
  const items = [];

  // PoE2DB unique list: links with the pattern /us/Item_Name
  $('a[href^="/us/"]').each((_, el) => {
    const href = $(el).attr('href');
    const slug = href.replace('/us/', '');
    // Skip non-item slugs (categories, mechanics, etc.)
    if (!slug || slug.includes('/') || slug.length < 2) return;
    // Has an image child = item card
    const img = $(el).find('img');
    if (!img.length) return;
    const name = $(el).text().trim() || slug.replace(/_/g, ' ');
    const iconUrl = img.attr('src') || '';
    items.push({ name, slug, iconUrl });
  });

  // Deduplicate by slug
  const seen = new Set();
  return items.filter(item => {
    if (seen.has(item.slug)) return false;
    seen.add(item.slug);
    return true;
  });
}

export function parseUniqueDetail(html, slug) {
  const $ = cheerio.load(html);

  // Item name — usually an h1 or .item-name
  const name = $('h1, .item-name, .itemName').first().text().trim()
    || slug.replace(/_/g, ' ');

  // Base type — second line or .baseType
  const baseType = $('.baseType, .item-base, .itemBase').first().text().trim() || '';

  // Icon from og:image or first cdn img
  const ogImage = $('meta[property="og:image"]').attr('content') || '';
  const cdnImg = $('img[src*="cdn.poe2db.tw"]').first().attr('src') || '';
  const iconUrl = ogImage || cdnImg;

  // Mods — implicit/explicit sections
  const implicits = [];
  const explicits = [];

  // PoE2DB typically uses divs/spans with classes for mod lines
  $('.implicit .mod, .itemMod.implicit, [class*="implicit"] .mod-text').each((_, el) => {
    implicits.push($(el).text().trim());
  });

  $('.explicit .mod, .itemMod:not(.implicit), [class*="explicit"] .mod-text').each((_, el) => {
    explicits.push($(el).text().trim());
  });

  // Fallback: any .mod elements if classified mods not found
  if (implicits.length === 0 && explicits.length === 0) {
    $('.mod, .item-mod, .itemMod').each((_, el) => {
      explicits.push($(el).text().trim());
    });
  }

  // req level
  const reqLevelText = $('body').text().match(/Requires Level (\d+)/i);
  const reqLevel = reqLevelText ? parseInt(reqLevelText[1]) : undefined;

  return { name, slug, baseType, iconUrl, implicits, explicits, reqLevel };
}
```

**Note:** After implementing, inspect the fixture HTML if selectors return empty arrays:
```bash
node --input-type=module <<'EOF'
import { readFileSync } from 'fs';
import * as cheerio from 'cheerio';
const html = readFileSync('scripts/__fixtures__/unique-detail.html', 'utf8');
const $ = cheerio.load(html);
// Find what classes are present on mod elements:
$('[class]').slice(0, 30).each((_, el) => console.log($(el).attr('class')));
EOF
```
Adjust selector strings in `parseUniqueDetail` to match actual classes found.

- [ ] **Step 4.5: Run test to verify it passes**

```bash
pnpm test scripts/__tests__/uniques.test.mjs
```

Expected: all tests pass.

- [ ] **Step 4.6: Commit**

```bash
git add scripts/poe2db/parsers/uniques.mjs scripts/__tests__/uniques.test.mjs scripts/__fixtures__/
git commit -m "feat: PoE2DB uniques parser — list page + detail page extraction"
```

---

## Task 5: Runes + Kalguuran Parsers

**Files:**
- Create: `scripts/poe2db/parsers/runes.mjs`
- Create: `scripts/poe2db/parsers/kalguuran.mjs`
- Create: `scripts/__tests__/runes.test.mjs`
- Create: `scripts/__fixtures__/runes-list.html`
- Create: `scripts/__fixtures__/kalguuran-list.html`

Target URLs:
- Runes of Aldur league: `https://poe2db.tw/us/Runes_of_Aldur_league`
- Kalguuran skills: `https://poe2db.tw/us/Gems` (filter for Kalguuran tag) or `/us/Version_0.5.0` kalguuran section

- [ ] **Step 5.1: Save fixtures**

```bash
node --input-type=module <<'EOF'
import { fetchCached } from './scripts/poe2db/fetch.mjs';
import { writeFileSync } from 'node:fs';

const html = await fetchCached('https://poe2db.tw/us/Runes_of_Aldur_league');
writeFileSync('scripts/__fixtures__/runes-list.html', html);

const gemsHtml = await fetchCached('https://poe2db.tw/us/Gems');
writeFileSync('scripts/__fixtures__/kalguuran-list.html', gemsHtml);
console.log('Fixtures saved');
EOF
```

- [ ] **Step 5.2: Write failing test for runes**

Create `scripts/__tests__/runes.test.mjs`:
```js
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { parseRunes } from '../poe2db/parsers/runes.mjs';
import { parseKalguuranSkills } from '../poe2db/parsers/kalguuran.mjs';

const runesHtml = readFileSync('scripts/__fixtures__/runes-list.html', 'utf8');
const kalguuranHtml = readFileSync('scripts/__fixtures__/kalguuran-list.html', 'utf8');

describe('parseRunes', () => {
  it('returns an array of rune objects', () => {
    const runes = parseRunes(runesHtml);
    expect(runes.length).toBeGreaterThan(0);
  });

  it('each rune has name, tier, and at least one effect', () => {
    const runes = parseRunes(runesHtml);
    for (const r of runes) {
      expect(r).toHaveProperty('name');
      expect(r).toHaveProperty('tier');
      expect(typeof r.name).toBe('string');
    }
  });
});

describe('parseKalguuranSkills', () => {
  it('returns skill objects with name and tags', () => {
    const skills = parseKalguuranSkills(kalguuranHtml);
    expect(skills.length).toBeGreaterThan(0);
    for (const s of skills) {
      expect(s).toHaveProperty('name');
      expect(s).toHaveProperty('slug');
    }
  });
});
```

- [ ] **Step 5.3: Run test — expect failure**

```bash
pnpm test scripts/__tests__/runes.test.mjs
```

- [ ] **Step 5.4: Implement `scripts/poe2db/parsers/runes.mjs`**

```js
// scripts/poe2db/parsers/runes.mjs
import * as cheerio from 'cheerio';

export function parseRunes(html) {
  const $ = cheerio.load(html);
  const runes = [];

  // Runes section on the Runes_of_Aldur_league page
  // Look for rune entries — they typically have a name and effect lines
  // Selectors may need adjustment based on actual HTML structure
  $('table tr, .rune-entry, .item-entry').each((_, el) => {
    const cells = $(el).find('td, .cell');
    if (cells.length < 2) return;

    const name = cells.eq(0).text().trim();
    const effect = cells.eq(1).text().trim();
    if (!name || name.toLowerCase() === 'name') return; // skip header

    // Infer tier from name (Lesser, Greater, Superior, Perfect etc.)
    const tier = name.match(/^(lesser|greater|superior|perfect|ornate|primal)/i)?.[1]?.toLowerCase() || 'unknown';

    runes.push({ name, tier, weaponEffect: effect, confidence: 'confirmed' });
  });

  // Fallback: any h3/h4 with "rune" in heading, followed by list
  if (runes.length === 0) {
    $('h3, h4').each((_, heading) => {
      const text = $(heading).text().trim();
      if (!text.toLowerCase().includes('rune')) return;
      let next = $(heading).next();
      while (next.length && !next.is('h3, h4')) {
        if (next.is('ul')) {
          next.find('li').each((_, li) => {
            const t = $(li).text().trim();
            if (t) runes.push({ name: t, tier: 'unknown', confidence: 'confirmed' });
          });
        }
        next = next.next();
      }
    });
  }

  return runes;
}
```

- [ ] **Step 5.5: Implement `scripts/poe2db/parsers/kalguuran.mjs`**

```js
// scripts/poe2db/parsers/kalguuran.mjs
import * as cheerio from 'cheerio';

// Kalguuran skills from the gems page — filter by tag or section
export function parseKalguuranSkills(html) {
  const $ = cheerio.load(html);
  const skills = [];

  // Gems page has links to individual gem pages
  // Kalguuran skills are a new gem type — look for section heading or filter links
  $('a[href^="/us/"]').each((_, el) => {
    const href = $(el).attr('href');
    const slug = href.replace('/us/', '');
    const name = $(el).text().trim();
    if (!name || name.length < 2) return;

    // Capture skills that have an image (gem cards) — same pattern as uniques
    const img = $(el).find('img');
    if (!img.length) return;

    const iconUrl = img.attr('src') || '';
    skills.push({ name, slug, iconUrl });
  });

  // Deduplicate
  const seen = new Set();
  return skills.filter(s => {
    if (seen.has(s.slug)) return false;
    seen.add(s.slug);
    return true;
  });
}
```

**Note:** The Kalguuran skill set may not be neatly separated in the gems list HTML. After running tests, if the result is too large (all gems), add a filter:
```js
// Add to parseKalguuranSkills, before dedup:
// Filter: if section heading "Kalguuran" exists, only collect items after it
// Otherwise fall back to collecting all gems and rely on the merge layer
// to match against the hand-authored kalguuran.ts names.
```

- [ ] **Step 5.6: Run tests to verify they pass**

```bash
pnpm test scripts/__tests__/runes.test.mjs
```

- [ ] **Step 5.7: Commit**

```bash
git add scripts/poe2db/parsers/runes.mjs scripts/poe2db/parsers/kalguuran.mjs \
  scripts/__tests__/runes.test.mjs scripts/__fixtures__/runes-list.html \
  scripts/__fixtures__/kalguuran-list.html
git commit -m "feat: runes + kalguuran skill parsers for PoE2DB"
```

---

## Task 6: Ascendancies + Endgame Parsers

**Files:**
- Create: `scripts/poe2db/parsers/ascendancies.mjs`
- Create: `scripts/poe2db/parsers/endgame.mjs`
- Create: `scripts/__tests__/ascendancies.test.mjs`
- Create: `scripts/__fixtures__/ascendancies-spirit-walker.html`
- Create: `scripts/__fixtures__/endgame-version.html`

Target URLs:
- Spirit Walker: `https://poe2db.tw/us/Spirit_Walker`
- Martial Artist: `https://poe2db.tw/us/Martial_Artist`
- Endgame overview: `https://poe2db.tw/us/Version_0.5.0`

- [ ] **Step 6.1: Save fixtures**

```bash
node --input-type=module <<'EOF'
import { fetchCached } from './scripts/poe2db/fetch.mjs';
import { writeFileSync } from 'node:fs';

const swHtml = await fetchCached('https://poe2db.tw/us/Spirit_Walker');
writeFileSync('scripts/__fixtures__/ascendancies-spirit-walker.html', swHtml);

const versionHtml = await fetchCached('https://poe2db.tw/us/Version_0.5.0');
writeFileSync('scripts/__fixtures__/endgame-version.html', versionHtml);
console.log('Fixtures saved');
EOF
```

- [ ] **Step 6.2: Write failing tests**

Create `scripts/__tests__/ascendancies.test.mjs`:
```js
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { parseAscendancy } from '../poe2db/parsers/ascendancies.mjs';
import { parseEndgameContent } from '../poe2db/parsers/endgame.mjs';

const swHtml = readFileSync('scripts/__fixtures__/ascendancies-spirit-walker.html', 'utf8');
const versionHtml = readFileSync('scripts/__fixtures__/endgame-version.html', 'utf8');

describe('parseAscendancy', () => {
  it('returns ascendancy with name + nodes', () => {
    const result = parseAscendancy(swHtml, 'Spirit Walker');
    expect(result).toHaveProperty('name', 'Spirit Walker');
    expect(result).toHaveProperty('nodes');
    expect(Array.isArray(result.nodes)).toBe(true);
  });

  it('nodes have name and stats', () => {
    const result = parseAscendancy(swHtml, 'Spirit Walker');
    for (const node of result.nodes) {
      expect(node).toHaveProperty('name');
      expect(node).toHaveProperty('stats');
    }
  });
});

describe('parseEndgameContent', () => {
  it('returns endgame mechanics array', () => {
    const result = parseEndgameContent(versionHtml);
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThan(3);
  });

  it('each mechanic has id and name', () => {
    const result = parseEndgameContent(versionHtml);
    for (const m of result) {
      expect(m).toHaveProperty('id');
      expect(m).toHaveProperty('name');
    }
  });
});
```

- [ ] **Step 6.3: Run test — expect failure**

```bash
pnpm test scripts/__tests__/ascendancies.test.mjs
```

- [ ] **Step 6.4: Implement `scripts/poe2db/parsers/ascendancies.mjs`**

```js
// scripts/poe2db/parsers/ascendancies.mjs
import * as cheerio from 'cheerio';

export function parseAscendancy(html, ascendancyName) {
  const $ = cheerio.load(html);
  const nodes = [];

  // Ascendancy pages have notable passive nodes — look for node entries
  // They're typically table rows or card elements with name + description
  $('table tr').each((_, el) => {
    const cells = $(el).find('td');
    if (cells.length < 2) return;
    const name = cells.eq(0).text().trim();
    const desc = cells.eq(1).text().trim();
    if (!name || name === 'Name') return;

    const stats = desc.split(/\n|•/).map(s => s.trim()).filter(Boolean);
    nodes.push({ name, stats, type: 'notable', confidence: 'confirmed' });
  });

  // Fallback: heading + bullet list pattern
  if (nodes.length === 0) {
    $('h3, h4, strong').each((_, el) => {
      const name = $(el).text().trim();
      if (!name || name.length > 80) return;
      const stats = [];
      let next = $(el).next();
      while (next.length && !next.is('h3,h4,strong')) {
        if (next.is('ul, p')) {
          next.find('li, p').each((_, li) => {
            const t = $(li).text().trim();
            if (t) stats.push(t);
          });
        }
        next = next.next();
      }
      if (stats.length) nodes.push({ name, stats, type: 'notable', confidence: 'confirmed' });
    });
  }

  return { name: ascendancyName, nodes };
}
```

- [ ] **Step 6.5: Implement `scripts/poe2db/parsers/endgame.mjs`**

```js
// scripts/poe2db/parsers/endgame.mjs
import * as cheerio from 'cheerio';

function slugify(text) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

export function parseEndgameContent(html) {
  const $ = cheerio.load(html);
  const mechanics = [];

  // Version page has h3 sections for each mechanic
  $('h3').each((_, el) => {
    const name = $(el).text().trim();
    if (!name) return;

    const details = [];
    let next = $(el).next();
    while (next.length && !next.is('h3')) {
      if (next.is('ul')) {
        next.find('li').each((_, li) => {
          const t = $(li).text().trim();
          if (t) details.push(t);
        });
      } else if (next.is('p')) {
        const t = next.text().trim();
        if (t && !t.startsWith('[Return')) details.push(t);
      }
      next = next.next();
    }

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
```

- [ ] **Step 6.6: Run tests to verify they pass**

```bash
pnpm test scripts/__tests__/ascendancies.test.mjs
```

- [ ] **Step 6.7: Commit**

```bash
git add scripts/poe2db/parsers/ascendancies.mjs scripts/poe2db/parsers/endgame.mjs \
  scripts/__tests__/ascendancies.test.mjs scripts/__fixtures__/
git commit -m "feat: ascendancy + endgame parsers for PoE2DB 0.5.0 content"
```

---

## Task 7: Scrape Orchestrator (`scripts/scrape.mjs`)

Runs all parsers, writes JSON to `src/content/generated/`. Parameterised by category; idempotent via cache.

**Files:**
- Create: `scripts/scrape.mjs`

- [ ] **Step 7.1: Implement `scripts/scrape.mjs`**

```js
// scripts/scrape.mjs
import { mkdir } from 'node:fs/promises';
import { writeFileSync } from 'node:fs';
import { fetchCached } from './poe2db/fetch.mjs';
import { parseUniqueList, parseUniqueDetail } from './poe2db/parsers/uniques.mjs';
import { parseRunes } from './poe2db/parsers/runes.mjs';
import { parseKalguuranSkills } from './poe2db/parsers/kalguuran.mjs';
import { parseAscendancy } from './poe2db/parsers/ascendancies.mjs';
import { parseEndgameContent } from './poe2db/parsers/endgame.mjs';
import { runPatchNotes } from './patchnotes.mjs';

const OUT = 'src/content/generated';

async function ensureOutDir() {
  await mkdir(OUT, { recursive: true });
}

function write(name, data) {
  const path = `${OUT}/${name}.json`;
  writeFileSync(path, JSON.stringify(data, null, 2), 'utf8');
  console.log(`Written: ${path} (${data.length ?? Object.keys(data).length} records)`);
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
  const html = await fetchCached('https://poe2db.tw/us/Gems');
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

const CATEGORIES = {
  uniques: scrapeUniques,
  runes: scrapeRunes,
  kalguuran: scrapeKalguuran,
  ascendancies: scrapeAscendancies,
  endgame: scrapeEndgame,
  patchnotes: runPatchNotes,
};

async function main() {
  await ensureOutDir();
  const targets = process.argv.slice(2);
  const toRun = targets.length > 0
    ? targets.filter(t => t in CATEGORIES)
    : Object.keys(CATEGORIES);

  if (toRun.length === 0) {
    console.error('Unknown categories:', targets.join(', '));
    console.error('Valid:', Object.keys(CATEGORIES).join(', '));
    process.exit(1);
  }

  for (const cat of toRun) {
    await CATEGORIES[cat]();
  }
  console.log('\nScrape complete.');
}

main().catch(err => { console.error(err); process.exit(1); });
```

- [ ] **Step 7.2: Run end-to-end scrape (all categories)**

```bash
pnpm scrape
```

Expected: `.cache/poe2db/` populated with HTML files, `src/content/generated/` contains `uniques.json`, `runes.json`, `kalguuran.json`, `ascendancies.json`, `endgame.json`, `patchNotes.json`.

Check output:
```bash
ls src/content/generated/
node --input-type=module -e "
import data from './src/content/generated/uniques.json' with { type: 'json' };
console.log('Uniques count:', data.length);
console.log('First:', JSON.stringify(data[0], null, 2).slice(0, 300));
"
```

- [ ] **Step 7.3: Fix any parser issues found during full run**

If a parser returns empty arrays, inspect the cached HTML:
```bash
node --input-type=module -e "
import { readFileSync } from 'fs';
// e.g. check cached runes page:
const html = readFileSync('.cache/poe2db/us_Runes_of_Aldur_league.html', 'utf8');
// Find heading tags:
const matches = html.match(/<h[1-6][^>]*>[\s\S]*?<\/h[1-6]>/gi) || [];
console.log(matches.slice(0, 15).join('\n'));
"
```
Adjust parser selectors accordingly, re-run `pnpm scrape <category>`.

- [ ] **Step 7.4: Commit**

```bash
git add scripts/scrape.mjs
git commit -m "feat: scrape orchestrator — parameterised, idempotent, runs all PoE2DB parsers"
```

---

## Task 8: Sources & Types Refactor (`src/content/sources.ts`)

Extend the existing types to support the merge layer without breaking existing consumers.

**Files:**
- Modify: `src/content/sources.ts`

Current state:
```ts
// sources.ts:1
export type ConfidenceTier = 'confirmed' | 'datamine' | 'inferred' | 'speculation';
export const SOURCES = { REVEAL: '...', QA: '...', POE2DB: '...', PRESSKIT: '...' };
export type Source = typeof SOURCES[keyof typeof SOURCES];
```

- [ ] **Step 8.1: Write the new content of `src/content/sources.ts`**

```ts
// src/content/sources.ts
export type ConfidenceTier = 'confirmed' | 'datamine' | 'inferred' | 'speculation';

export const SOURCES = {
  REVEAL: 'GGG Reveal',
  QA: 'Q&A Session',
  POE2DB: 'PoE2DB Datamine',
  PRESSKIT: 'Press Kit',
  PATCH_NOTES: 'Official Patch Notes 0.5.0',
} as const;

export type Source = typeof SOURCES[keyof typeof SOURCES];

/** A record with structured source attribution for the merge layer. */
export interface Sourced {
  confidence: ConfidenceTier;
  sources?: Source[];
  note?: string;
}

/**
 * Merge precedence: patch-notes-confirmed fields win over datamine.
 * Hand-authored note/confidence overrides always win over machine output.
 */
export const SOURCE_PRECEDENCE = [
  SOURCES.PATCH_NOTES,  // highest
  SOURCES.REVEAL,
  SOURCES.QA,
  SOURCES.PRESSKIT,
  SOURCES.POE2DB,       // lowest
] as const;
```

- [ ] **Step 8.2: Verify build still passes**

```bash
pnpm build
```

Expected: build succeeds with no TypeScript errors. (The `Source` type now includes `PATCH_NOTES` — existing `note` fields using other source strings remain valid.)

- [ ] **Step 8.3: Commit**

```bash
git add src/content/sources.ts
git commit -m "refactor: extend sources.ts with Sourced interface, PATCH_NOTES source, SOURCE_PRECEDENCE"
```

---

## Task 9: Content Merge — Uniques

Refactor `src/content/uniques.ts` to import scraped JSON and merge with hand-authored entries.

**Files:**
- Modify: `src/content/uniques.ts`
- Read first (it's a large existing file with UniqueItem type + hand-authored array)

- [ ] **Step 9.1: Read the current uniques.ts to understand the UniqueItem type**

Read `src/content/uniques.ts`. Note the `UniqueItem` interface shape and the `uniqueItems` export. The hand-authored records have fields: `name, baseType, itemClass, reqLevel?, implicits[], explicits[], flavour?, iconFile?, confidence, note?, spiritWalkerSynergy?`.

- [ ] **Step 9.2: Implement the merge in `src/content/uniques.ts`**

Replace the file's content with (preserve the `UniqueItem` type exactly, just change the export logic):

```ts
// src/content/uniques.ts
// — type definition stays exactly as before —
import type { Sourced } from './sources.js';
import { SOURCES } from './sources.js';

// UniqueItem type — preserve the full existing interface here
export interface UniqueItem extends Sourced {
  name: string;
  baseType: string;
  itemClass: string;
  reqLevel?: number;
  implicits: string[];
  explicits: string[];
  flavour?: string;
  iconFile?: string;
  iconUrl?: string;        // NEW: CDN URL from scraper (Phase 2 tooltips use this)
  note?: string;
  spiritWalkerSynergy?: string;
}

// --- Hand-authored curation (source of truth for note/ordering/overrides) ---
// Keep the existing uniqueItems array exactly as it is, just renamed:
// INSTRUCTION: Read src/content/uniques.ts and find the line:
//   export const uniqueItems: UniqueItem[] = [
// Rename it to:
//   const handAuthored: UniqueItem[] = [
// DO NOT change any records inside the array — only the variable name and export keyword.
const handAuthored: UniqueItem[] = [ /* all existing records from the file, unchanged */ ];

// --- Merge with scraped data ---
let scraped: Partial<UniqueItem>[] = [];
try {
  // Dynamic import at module init — generated/ may not exist yet (run pnpm scrape first)
  const { default: data } = await import('./generated/uniques.json', { with: { type: 'json' } });
  scraped = data as Partial<UniqueItem>[];
} catch {
  // Generated data not available — continue with hand-authored only
}

function mergeUnique(hand: UniqueItem, scrapeRecord?: Partial<UniqueItem>): UniqueItem {
  if (!scrapeRecord) return hand;
  return {
    ...hand,
    // Patch-notes-confirmed: upgrade confidence
    confidence: scrapeRecord.confidence === 'confirmed' ? 'confirmed' : hand.confidence,
    // Scraper provides CDN icon URL
    iconUrl: scrapeRecord.iconUrl ?? hand.iconFile,
    // Scraper may have richer mod lists — only use if hand-authored lacks them
    implicits: hand.implicits.length > 0 ? hand.implicits : (scrapeRecord.implicits ?? []),
    explicits: hand.explicits.length > 0 ? hand.explicits : (scrapeRecord.explicits ?? []),
    // reqLevel from scraper if not hand-authored
    reqLevel: hand.reqLevel ?? scrapeRecord.reqLevel,
    // sources attribution
    sources: [
      ...(hand.sources ?? []),
      SOURCES.POE2DB,
    ],
    // Hand-authored note ALWAYS preserved
    note: hand.note,
  };
}

// Build lookup from scraper data by name
const scrapeByName = new Map(scraped.map(s => [s.name?.toLowerCase(), s]));

// Add scraped-only items not in hand-authored (new 0.5.0 uniques)
const handNames = new Set(handAuthored.map(h => h.name.toLowerCase()));
const scrapedNew: UniqueItem[] = scraped
  .filter(s => s.name && !handNames.has(s.name.toLowerCase()))
  .map(s => ({
    name: s.name!,
    baseType: s.baseType ?? '',
    itemClass: 'Unknown',
    implicits: s.implicits ?? [],
    explicits: s.explicits ?? [],
    confidence: 'confirmed',
    sources: [SOURCES.POE2DB],
    iconUrl: s.iconUrl,
  }));

export const uniqueItems: UniqueItem[] = [
  ...handAuthored.map(h => mergeUnique(h, scrapeByName.get(h.name.toLowerCase()))),
  ...scrapedNew,
];
```

**Note:** The `await import(...)` at module top-level requires Astro's Vite environment which supports top-level await. If TypeScript complains, add `"module": "ESNext", "moduleResolution": "bundler"` to `tsconfig.json` — check current tsconfig first; if already correct, no change needed.

Alternative if top-level await is problematic: read the JSON synchronously via `createRequire`:
```ts
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
let scraped = [];
try { scraped = require('./generated/uniques.json'); } catch {}
```

- [ ] **Step 9.3: Verify build**

```bash
pnpm build
```

Expected: build succeeds. The uniques section in the output HTML still renders.

- [ ] **Step 9.4: Commit**

```bash
git add src/content/uniques.ts
git commit -m "feat: uniques content merge layer — imports scraped data, patches-notes-wins precedence"
```

---

## Task 10: Content Merge — Runes, Kalguuran, Ascendancies, Endgame, Atlas

Same merge pattern as Task 9. Follow the same template for each file.

**Files:**
- Modify: `src/content/runes.ts`
- Modify: `src/content/kalguuran.ts`
- Modify: `src/content/ascendancies.ts`
- Modify: `src/content/endgame.ts`
- Modify: `src/content/atlasNodes.ts` (currently empty placeholder — populate from endgame.json)

For each file, the pattern is:
1. Read the existing file's type definition and hand-authored array.
2. Add a scraped JSON import with try/catch.
3. Write a `mergeRecord` function that:
   - Preserves hand-authored `note`, ordering, and confidence overrides.
   - Patches `confidence: 'confirmed'` when scraper confirms a record.
   - Adds new scraped-only records.
4. Export the merged array under the same export name as before.

- [ ] **Step 10.1: Merge `src/content/runes.ts`**

The existing `Rune` type has `name, tier, socketTarget, weaponEffect?, armourEffect?, wandOrStaffEffect?, bondedEffect?, note?, confidence`. Scraper provides `name, tier, weaponEffect`.

Make these targeted changes to `src/content/runes.ts`:

1. Add imports at top:
```ts
import type { Sourced } from './sources.js';
import { SOURCES } from './sources.js';
```

2. Extend `Rune` interface: `export interface Rune extends Sourced {` (keep all existing fields).

3. After the closing `];` of the hand-authored `runesData` (or whatever the existing array variable is), append:
```ts
let scrapedRunes: Partial<Rune>[] = [];
try {
  const { default: data } = await import('./generated/runes.json', { with: { type: 'json' } });
  scrapedRunes = data as Partial<Rune>[];
} catch {}

const scrapeRunesByName = new Map(scrapedRunes.map(s => [s.name?.toLowerCase(), s]));
const handRuneNames = new Set(runesData.map(r => r.name.toLowerCase()));

function mergeRune(hand: Rune, scrape?: Partial<Rune>): Rune {
  if (!scrape) return hand;
  return {
    ...hand,
    confidence: scrape.confidence === 'confirmed' ? 'confirmed' : hand.confidence,
    weaponEffect: hand.weaponEffect ?? scrape.weaponEffect,
    sources: [...(hand.sources ?? []), SOURCES.POE2DB],
    note: hand.note,
  };
}

const newFromScrape: Rune[] = scrapedRunes
  .filter(s => s.name && !handRuneNames.has(s.name.toLowerCase()))
  .map(s => ({
    name: s.name!,
    tier: s.tier ?? 'unknown',
    socketTarget: 'Any',
    weaponEffect: s.weaponEffect,
    confidence: 'confirmed' as const,
    sources: [SOURCES.POE2DB],
  }));
```

4. Replace the existing export at the bottom of the file:
```ts
// Before (whatever the current export name is):
export const runesData: Rune[] = [ ... ]; // or export const runes = ...
// After:
export const runesData: Rune[] = [
  ...runesData.map(r => mergeRune(r, scrapeRunesByName.get(r.name.toLowerCase()))),
  ...newFromScrape,
];
```

**Note:** The existing export name may be `runesData`, `runes`, `specialRunes`, etc. — read the file first to get the exact name, then use it consistently.

- [ ] **Step 10.2: Merge `src/content/kalguuran.ts`**

Import `./generated/kalguuran.json`. Match by `name`. Existing `KalguuranSkill` has `name, tags[], cost, castTime?, cooldown?, description, keyStats[], confidence`. Scraper provides `name, slug, iconUrl`. Enrich with `iconUrl`; hand-authored `description`/`keyStats` preserved.

- [ ] **Step 10.3: Merge `src/content/ascendancies.ts`**

Import `./generated/ascendancies.json`. Match `Ascendancy.name`. Merge nodes array: match by node `name`, preserve hand-authored `note`; upgrade `confidence` if scraper marks `confirmed`. Scraper adds any nodes in the 0.5.0 data not yet in hand-authored list.

- [ ] **Step 10.4: Merge `src/content/endgame.ts`**

Import `./generated/endgame.json`. Match by `id`. Preserve `details`, `note`, hand-authored `bosses` and `access`. Upgrade confidence to `confirmed`. Add new mechanics not in hand-authored.

- [ ] **Step 10.5: Populate `src/content/atlasNodes.ts`**

`atlasNodeGroups` is currently `[]`. Import `./generated/endgame.json` filtered to atlas-relevant sections (mechanics with `id` containing `atlas` or `masters`). Map to `AtlasNodeGroup { name, description, confidence }`.

```ts
// src/content/atlasNodes.ts
import type { Sourced } from './sources.js';

export interface AtlasNodeGroup extends Sourced {
  name: string;
  description: string;
}

// Atlas context prose (preserve as-is)
export const atlasContext = `...`; // preserve existing

let scraped: any[] = [];
try {
  const { default: data } = await import('./generated/endgame.json', { with: { type: 'json' } });
  scraped = data;
} catch {}

export const atlasNodeGroups: AtlasNodeGroup[] = scraped
  .filter(m => m.id.includes('atlas') || m.id.includes('masters') || m.id.includes('origins'))
  .map(m => ({
    name: m.name,
    description: m.details?.[0] ?? m.shortDesc ?? '',
    confidence: 'confirmed',
    sources: ['Official Patch Notes 0.5.0'],
  }));
```

- [ ] **Step 10.6: Verify build after all five merges**

```bash
pnpm build
```

Expected: build succeeds, all existing sections render. Check the dev server for the atlas section (should now have data where it was empty).

- [ ] **Step 10.7: Commit**

```bash
git add src/content/runes.ts src/content/kalguuran.ts src/content/ascendancies.ts \
  src/content/endgame.ts src/content/atlasNodes.ts
git commit -m "feat: content merge layer for runes, kalguuran, ascendancies, endgame, atlas"
```

---

## Task 11: Content Merge — Balance, Timeline, QoL, Masters

- [ ] **Step 11.1: Merge `src/content/balance.ts` with patch notes balance sections**

Import `./generated/patchNotes.json`. Filter entries with `category === 'balance' || category === 'skills' || category === 'uniques'`. Map each entry to `BalanceChange` or append as new records with `confidence: 'confirmed'`. The `BalanceChange` type has `id, category('nerf'|'buff'|'rework'|'new'), subject, summary, details[], confidence, note?`. Map patch-note entries to appropriate `category` based on keywords (nerf: "reduced", "now longer", "decreased"; buff: "increased", "now"; rework: "reworked", "redesigned").

- [ ] **Step 11.2: Update `src/content/timeline.ts`**

The timeline events for 0.5.0 can be confirmed. Read `timeline.ts`, find events with dates around 2026-05-22 and 2026-05-29, change `confidence` to `'confirmed'` and add `sources: [SOURCES.PATCH_NOTES]`.

- [ ] **Step 11.3: Update `src/content/qol.ts`**

Import `./generated/patchNotes.json`, filter for `category === 'qol'`. Map entries to `QoLFeature { name, description, confidence: 'confirmed', note? }`. Merge into existing array (preserve hand-authored, add new QoL entries from patch notes not yet listed).

- [ ] **Step 11.4: Update `src/content/masters.ts`**

Read current `masters.ts`. If Alith (or any master) appears in patchNotes entries, upgrade their `confidence` to `'confirmed'`. The three new masters (Jado, Hilda, Doryani) should be added as confirmed entries based on the patch notes data. Add their records:

```ts
// New masters to add (from patch notes — Masters of the Atlas section)
const patchNotesMasters = [
  { name: 'Jado', role: 'Master of the Atlas', location: 'Atlas', services: ['Atlas progression'], confidence: 'confirmed' as const },
  { name: 'Hilda', role: 'Master of the Atlas', location: 'Atlas', services: ['Atlas progression'], confidence: 'confirmed' as const },
  { name: 'Doryani', role: 'Master of the Atlas', location: 'Atlas', services: ['Atlas progression'], confidence: 'confirmed' as const },
];
```

- [ ] **Step 11.5: Verify build**

```bash
pnpm build
```

- [ ] **Step 11.6: Commit**

```bash
git add src/content/balance.ts src/content/timeline.ts src/content/qol.ts src/content/masters.ts
git commit -m "feat: balance/timeline/qol/masters merge with patch notes data"
```

---

## Task 12: Patch Notes Content Module (`src/content/patchNotes.ts`)

Creates the typed wrapper for the generated patch notes JSON, used by the new section.

**Files:**
- Create: `src/content/patchNotes.ts`
- Modify: `src/content/index.ts`

- [ ] **Step 12.1: Create `src/content/patchNotes.ts`**

```ts
// src/content/patchNotes.ts
export interface PatchNotesEntry {
  id: string;
  title: string;
  category: 'league' | 'endgame' | 'ascendancy' | 'skills' | 'balance' | 'uniques' | 'items' | 'qol' | 'campaign' | 'other';
  entries: string[];
}

let rawData: PatchNotesEntry[] = [];
try {
  const { default: data } = await import('./generated/patchNotes.json', { with: { type: 'json' } });
  rawData = data as PatchNotesEntry[];
} catch {
  // Generated data not available
}

export const patchNotes: PatchNotesEntry[] = rawData;

export const PATCH_NOTE_CATEGORIES = [
  { id: 'league', label: 'Runes of Aldur' },
  { id: 'endgame', label: 'Endgame' },
  { id: 'ascendancy', label: 'Ascendancies' },
  { id: 'skills', label: 'Skills & Supports' },
  { id: 'balance', label: 'Balance' },
  { id: 'uniques', label: 'Unique Items' },
  { id: 'items', label: 'Items' },
  { id: 'qol', label: 'QoL & UI' },
  { id: 'campaign', label: 'Campaign' },
  { id: 'other', label: 'Other' },
] as const;
```

- [ ] **Step 12.2: Add export to `src/content/index.ts`**

Add to `src/content/index.ts`:
```ts
export * from './patchNotes.js';
```

- [ ] **Step 12.3: Verify build**

```bash
pnpm build
```

- [ ] **Step 12.4: Commit**

```bash
git add src/content/patchNotes.ts src/content/index.ts
git commit -m "feat: patchNotes content module — typed wrapper for generated patch notes JSON"
```

---

## Task 13: Patch Notes Section UI

**Files:**
- Create: `src/components/PatchNotesFilter.tsx`
- Create: `src/components/PatchNotesSection.astro`

- [ ] **Step 13.1: Create `src/components/PatchNotesFilter.tsx`**

This is a React island (`client:load`) that drives search + category filter for the patch notes.

```tsx
// src/components/PatchNotesFilter.tsx
import { useState, useMemo } from 'react';

interface Entry {
  id: string;
  title: string;
  category: string;
  entries: string[];
}

interface Category {
  id: string;
  label: string;
}

interface Props {
  sections: Entry[];
  categories: Category[];
}

export default function PatchNotesFilter({ sections, categories }: Props) {
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return sections.filter(section => {
      const matchCat = activeCategory === null || section.category === activeCategory;
      if (!matchCat) return false;
      if (!query) return true;
      const q = query.toLowerCase();
      return (
        section.title.toLowerCase().includes(q) ||
        section.entries.some(e => e.toLowerCase().includes(q))
      );
    });
  }, [sections, query, activeCategory]);

  return (
    <div className="patch-notes-filter">
      <div className="patch-notes-controls">
        <input
          className="patch-notes-search"
          type="search"
          placeholder="Search patch notes…"
          value={query}
          onChange={e => setQuery(e.target.value)}
          aria-label="Search patch notes"
        />
        <div className="patch-notes-categories" role="group" aria-label="Filter by category">
          <button
            className={`pn-cat-btn${activeCategory === null ? ' active' : ''}`}
            onClick={() => setActiveCategory(null)}
          >
            All
          </button>
          {categories.map(cat => (
            <button
              key={cat.id}
              className={`pn-cat-btn${activeCategory === cat.id ? ' active' : ''}`}
              onClick={() => setActiveCategory(activeCategory === cat.id ? null : cat.id)}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      <div className="patch-notes-results">
        {filtered.length === 0 && (
          <p className="patch-notes-empty">No results for "{query}"</p>
        )}
        {filtered.map(section => (
          <details key={section.id} className="pn-section" open={!!query}>
            <summary className="pn-section-title">{section.title}</summary>
            <ul className="pn-entries">
              {section.entries.map((entry, i) => {
                const hl = query
                  ? entry.replace(new RegExp(`(${query})`, 'gi'), '<mark>$1</mark>')
                  : entry;
                return (
                  <li
                    key={i}
                    className="pn-entry"
                    dangerouslySetInnerHTML={{ __html: hl }}
                  />
                );
              })}
            </ul>
          </details>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 13.2: Create `src/components/PatchNotesSection.astro`**

```astro
---
// src/components/PatchNotesSection.astro
import { patchNotes, PATCH_NOTE_CATEGORIES } from '../content/index.js';
import PatchNotesFilter from './PatchNotesFilter.tsx';
---

<div class="patch-notes-intro">
  <p>
    Official patch notes for <strong>Content Update 0.5.0 — Return of the Ancients</strong>,
    released 2026-05-22. Source:
    <a
      href="https://www.pathofexile.com/forum/view-thread/3932540"
      target="_blank"
      rel="noopener"
    >pathofexile.com</a>.
  </p>
  <p>
    <span class="badge badge-confirmed">Confirmed</span> All entries sourced directly from
    official patch notes.
  </p>
</div>

<PatchNotesFilter
  sections={patchNotes}
  categories={PATCH_NOTE_CATEGORIES as any}
  client:load
/>
```

- [ ] **Step 13.3: Verify no TypeScript errors**

```bash
pnpm astro check
```

Expected: 0 errors.

- [ ] **Step 13.4: Commit**

```bash
git add src/components/PatchNotesFilter.tsx src/components/PatchNotesSection.astro
git commit -m "feat: PatchNotesFilter React island + PatchNotesSection Astro component"
```

---

## Task 14: Wire Patch Notes into Page + Sidebar

**Files:**
- Modify: `src/pages/index.astro`
- Modify: `src/components/Sidebar.tsx`

- [ ] **Step 14.1: Add patch notes section to `src/pages/index.astro`**

Read `src/pages/index.astro` first. Find the last `<Section>` block (qol section). After it, add:

```astro
import PatchNotesSection from '../components/PatchNotesSection.astro';

<!-- after the existing last section: -->
<Section
  id="patch-notes"
  title="Patch Notes"
  subtitle="Content Update 0.5.0 — Official changes for the Return of the Ancients update."
>
  <PatchNotesSection />
</Section>
```

Also add the import at the top of the frontmatter block alongside existing imports.

- [ ] **Step 14.2: Add "Patch Notes" to `src/components/Sidebar.tsx`**

Read `src/components/Sidebar.tsx`. Find the `sections` array (or wherever section ids are listed for the nav). Add `{ id: 'patch-notes', label: 'Patch Notes' }` as the last entry.

The existing Sidebar derives its nav items from a hardcoded list. Add the new entry:
```ts
// In the sections array:
{ id: 'patch-notes', label: 'Patch Notes' },
```

- [ ] **Step 14.3: Start dev server and verify**

```bash
pnpm dev
```

Open browser. Confirm:
1. "Patch Notes" appears in the sidebar nav.
2. Clicking "Patch Notes" scrolls to the section.
3. The section renders with search input + category filter buttons + collapsible sections.
4. Typing in the search box filters sections in real time.
5. Clicking a category button narrows results.
6. Clicking a category again (toggle) shows all results.

- [ ] **Step 14.4: Commit**

```bash
git add src/pages/index.astro src/components/Sidebar.tsx
git commit -m "feat: wire patch notes section into page and sidebar nav"
```

---

## Task 15: Patch Notes Styles (`src/styles/global.css`)

**Files:**
- Modify: `src/styles/global.css`

- [ ] **Step 15.1: Append patch notes styles to `src/styles/global.css`**

Read `src/styles/global.css` first. The existing PoE design tokens are: `--color-gold-primary: #c9a961`, `--color-parchment: #ede0c8`, background `#080605`, font-family from `@fontsource` (Cormorant Garamond display, EB Garamond body). Append to end of file:

```css
/* ===== Patch Notes Section ===== */

.patch-notes-filter {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.patch-notes-controls {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  position: sticky;
  top: 3.5rem;
  z-index: 10;
  background: rgba(8, 6, 5, 0.95);
  backdrop-filter: blur(4px);
  padding: 0.75rem 0;
}

.patch-notes-search {
  width: 100%;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid #3a2f1c;
  border-radius: 4px;
  color: var(--color-parchment, #ede0c8);
  font-family: inherit;
  font-size: 0.95rem;
  padding: 0.5rem 0.75rem;
  outline: none;
  transition: border-color 0.2s;
}

.patch-notes-search:focus {
  border-color: var(--color-gold-primary, #c9a961);
}

.patch-notes-categories {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
}

.pn-cat-btn {
  background: transparent;
  border: 1px solid #3a2f1c;
  border-radius: 3px;
  color: #888;
  cursor: pointer;
  font-family: inherit;
  font-size: 0.8rem;
  letter-spacing: 0.04em;
  padding: 0.25rem 0.6rem;
  text-transform: uppercase;
  transition: border-color 0.15s, color 0.15s, background 0.15s;
}

.pn-cat-btn:hover {
  border-color: var(--color-gold-primary, #c9a961);
  color: var(--color-parchment, #ede0c8);
}

.pn-cat-btn.active {
  background: rgba(201, 169, 97, 0.15);
  border-color: var(--color-gold-primary, #c9a961);
  color: var(--color-gold-primary, #c9a961);
}

.patch-notes-results {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.patch-notes-empty {
  color: #666;
  font-style: italic;
  padding: 1rem 0;
  text-align: center;
}

.pn-section {
  border: 1px solid #2a2018;
  border-radius: 4px;
  overflow: hidden;
}

.pn-section[open] {
  border-color: #3a2f1c;
}

.pn-section-title {
  color: var(--color-gold-primary, #c9a961);
  cursor: pointer;
  font-family: 'Cormorant Garamond', serif;
  font-size: 1.05rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  list-style: none;
  padding: 0.65rem 0.875rem;
  user-select: none;
}

.pn-section-title::marker,
.pn-section-title::-webkit-details-marker {
  display: none;
}

.pn-section-title::before {
  content: '▶ ';
  font-size: 0.7em;
  opacity: 0.6;
  transition: transform 0.15s;
}

.pn-section[open] .pn-section-title::before {
  content: '▼ ';
}

.pn-entries {
  list-style: none;
  margin: 0;
  padding: 0 0.875rem 0.75rem 0.875rem;
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.pn-entry {
  color: var(--color-parchment, #ede0c8);
  font-size: 0.9rem;
  line-height: 1.55;
  padding-left: 1rem;
  position: relative;
}

.pn-entry::before {
  content: '⬥';
  color: var(--color-gold-primary, #c9a961);
  font-size: 0.55em;
  left: 0;
  position: absolute;
  top: 0.45em;
}

.pn-entry mark {
  background: rgba(201, 169, 97, 0.25);
  color: var(--color-gold-primary, #c9a961);
  border-radius: 2px;
  padding: 0 2px;
}

.patch-notes-intro {
  border-left: 2px solid var(--color-gold-primary, #c9a961);
  margin-bottom: 1.5rem;
  padding: 0.75rem 1rem;
  background: rgba(201, 169, 97, 0.04);
  border-radius: 0 4px 4px 0;
}

.patch-notes-intro p {
  margin: 0.25rem 0;
  font-size: 0.9rem;
  color: #aaa;
}

.patch-notes-intro strong,
.patch-notes-intro a {
  color: var(--color-parchment, #ede0c8);
}
```

- [ ] **Step 15.2: Start dev server and verify visual quality**

```bash
pnpm dev
```

Verify in browser:
1. Search input has gold focus border.
2. Category buttons have the PoE gold-on-dark aesthetic; active state gold-fill.
3. Section title uses Cormorant Garamond, gold color, diamond bullet prefix.
4. Entry bullets use the ⬥ diamond, consistent with existing site dividers.
5. Search highlight marks are subtle gold.
6. Controls are sticky — scrolling through many results keeps the filter visible.

- [ ] **Step 15.3: Final build check**

```bash
pnpm build
```

Expected: clean build, no errors.

- [ ] **Step 15.4: Commit**

```bash
git add src/styles/global.css
git commit -m "feat: patch notes section styles — PoE gold/parchment aesthetic, sticky filter"
```

---

## Task 16: End-to-End Verification

- [ ] **Step 16.1: Run full test suite**

```bash
pnpm test
```

Expected: all tests pass.

- [ ] **Step 16.2: Run scraper end-to-end with cache cleared (one category)**

```bash
# Remove one category's cache to test a fresh scrape
rm .cache/poe2db/us_Runes_of_Aldur_uniques.html 2>/dev/null || true
pnpm scrape uniques
```

Expected: re-fetches the page (logs `[fetch]`), updates `src/content/generated/uniques.json`, subsequent re-run logs `[cache hit]`.

- [ ] **Step 16.3: Spot-check 5 data records against live sources**

Manually verify these specific records against `https://www.pathofexile.com/forum/view-thread/3932540` and `https://poe2db.tw/us/Runes_of_Aldur_uniques`:

1. One unique item: name, baseType, at least one explicit mod line matches the live page.
2. One patch notes section: title and first 3 entries match the forum post exactly.
3. One balance change: confirm the `confidence` is `'confirmed'` and the `sources` array includes `'Official Patch Notes 0.5.0'`.
4. Ascendancy node: at least one Spirit Walker or Martial Artist node in the rendered page with correct stat text.
5. Timeline: launch date entry (2026-05-29) has `confidence: 'confirmed'`.

- [ ] **Step 16.4: Cross-browser check**

Start `pnpm dev`. Open in browser and verify:
- Patch notes section: search, filter, expand/collapse all work.
- All existing sections (league, endgame, uniques, ascendancies, etc.) still render correctly — no regressions.
- Sidebar "Patch Notes" nav entry scrolls to section.
- Existing UniqueCard tooltips still function on hover.

- [ ] **Step 16.5: Production build + deploy check**

```bash
pnpm build
pnpm preview
```

Open `http://localhost:4321`. Repeat the browser check in preview mode (static build). Confirm `src/content/generated/` is present locally (not gitignored at build time — `.gitignore` excludes `generated/` but that is only relevant to git; Astro reads it from disk at build time).

**Important:** The `src/content/generated/` directory is gitignored (it's machine output). In production CI/CD (Cloudflare Pages via `wrangler pages deploy`), the scraper must be run before `pnpm build`. Update `package.json` build script if deploying automatically:
```json
"build": "node scripts/scrape.mjs && astro build"
```
Only do this if `pnpm deploy` is used in CI; if building locally and deploying dist, it's already handled.

- [ ] **Step 16.6: Final commit**

```bash
git add -A
git commit -m "chore: Phase 1 complete — data pipeline, patch notes, curated section verified"
```

---

## Phase 2 Reminder

Phase 2 (hybrid tooltip system + section interactivity) is planned separately. Its precondition — structured `mods[]` fields in the content types — is started here (Phase 2a data model refactor). When ready, invoke the writing-plans skill for Phase 2.
