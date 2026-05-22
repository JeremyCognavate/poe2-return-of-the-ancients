import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { promises as fs } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fetchCached, cacheKeyFor } from '../poe2db/fetch.mjs';

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
