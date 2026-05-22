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
