// scripts/poe2db/parsers/ascendancies.mjs
import * as cheerio from 'cheerio';

/**
 * Split the innerHTML of a <td> on <br> tags to get individual stat lines.
 *
 * PoE2DB uses <br> as line separators inside the Detail column. Calling
 * .text() would concatenate them without spacing. This helper splits on
 * <br> and strips any residual HTML tags from each fragment.
 */
function splitBrStats($, td) {
  const html = $(td).html() || '';
  return html
    .split(/<br\s*\/?>/i)
    .map(s => s.replace(/<[^>]+>/g, '').trim())
    .filter(Boolean);
}

/**
 * Parse an ascendancy page from poe2db.
 *
 * The Community Wiki tab (e.g. #SpiritWalker) contains a markdown-rendered
 * table with two columns: "Name" and "Detail". Each row is one ascendancy
 * passive node. The Detail cell uses <br> as line separators for the stat
 * list.
 *
 * @param {string} html - Full HTML of the ascendancy page
 * @param {string} ascendancyName - Display name (e.g. 'Spirit Walker')
 * @returns {{ name: string, nodes: Array<{ name: string, stats: string[], type: string, confidence: string }> }}
 */
export function parseAscendancy(html, ascendancyName) {
  if (!html || typeof html !== 'string') {
    return { name: ascendancyName, nodes: [] };
  }

  const $ = cheerio.load(html);

  // The wiki tab id is derived from the ascendancy name with spaces removed
  // e.g. 'Spirit Walker' -> '#SpiritWalker'
  const tabId = ascendancyName.replace(/\s+/g, '');
  // Escape CSS-special characters so the selector doesn't throw on unusual names
  const escaped = tabId.replace(/([!"#$%&'()*+,./:;<=>?@[\\\]^`{|}~])/g, '\\$1');
  const tab = $(`#${escaped}`);

  // Fall back to searching all .markdown-body tables if the tab is not found
  const searchRoot = tab.length ? tab : $('body');

  const nodes = [];

  // Find the Name/Detail table — it has exactly two header columns
  searchRoot.find('table').each((_, table) => {
    const headers = $(table).find('thead th');
    if (headers.length < 2) return;

    const h0 = headers.eq(0).text().trim().toLowerCase();
    const h1 = headers.eq(1).text().trim().toLowerCase();
    if (h0 !== 'name' || h1 !== 'detail') return;

    // Parse each data row
    $(table).find('tbody tr').each((_, row) => {
      const cells = $(row).find('td');
      if (cells.length < 2) return;

      const name = cells.eq(0).text().trim();
      if (!name) return;

      const stats = splitBrStats($, cells.eq(1));

      nodes.push({
        name,
        stats,
        // PoE2DB doesn't distinguish keystones from notables in the table — treat all as notable
        type: 'notable',
        confidence: 'confirmed',
      });
    });

    // Only use the first matching table
    return false;
  });

  return { name: ascendancyName, nodes };
}
