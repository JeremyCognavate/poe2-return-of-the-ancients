import type { ConfidenceTier, Sourced } from './sources.js';
import { SOURCES } from './sources.js';

export interface KalguuranSkill extends Sourced {
  name: string;
  slug?: string;
  iconUrl?: string;
  tags: string[];
  cost: string;
  castTime?: string;
  cooldown?: string;
  description: string;
  keyStats: string[];
}

/** Runic Supports that appear in scraped kalguuran.json but are NOT Kalguuran skills */
const RUNIC_SUPPORT_NAMES = new Set(['Concussive Runes', 'Runic Infusion']);

const handAuthoredKalguuran: KalguuranSkill[] = [
  {
    name: 'Triskelion Cascade',
    tags: ['Spell', 'Buff', 'Duration'],
    cost: '20 Ward',
    castTime: '0.45s',
    cooldown: '1s base + 800% of empowered skill cast time',
    description: "Tap into the Triskelion Flame to Empower the next area spell you cast. The Empowered Spell centres on your location and targets six additional areas in a Triskelion pattern.",
    keyStats: [
      '800% of Empowered Skill\'s cast time added to cooldown',
      'Empowered Skill has 40% less area of effect',
      'Empowered Skill deals 30% less damage',
      'Maximum Buff duration 4 seconds',
    ],
    confidence: 'confirmed',
  },
  {
    name: 'Frostflame Nova',
    tags: ['Spell', 'AoE'],
    cost: '93 Ward',
    description: 'Wave that leeches onto Ignited enemies, converting the leech into simultaneous freeze and burn.',
    keyStats: [
      'Leeches onto Ignited enemies',
      'Converts leech to simultaneous freeze + burn',
    ],
    confidence: 'confirmed',
  },
  {
    name: 'Hollow Shell',
    tags: ['Spell', 'Buff', 'AoE', 'Nova'],
    cost: '100% of Runic Ward',
    castTime: '0.60s',
    description: 'Sacrifice your Runic Ward to send out an energy pulse that grants nearby Allies Guard.',
    keyStats: [
      'Spends 100% of Runic Ward',
      'Allies gain Guard equal to 35% of Ward spent',
      '3 metre pulse radius',
      '6 second Guard duration',
    ],
    confidence: 'confirmed',
  },
  {
    name: 'Mark of Repulsion',
    tags: ['Spell', 'Mark'],
    cost: '15 Ward',
    description: 'Apply a mark that triggers an explosion and knockback when the enemy reaches the ailment threshold.',
    keyStats: [
      'Triggers explosion + knockback at 200% ailment threshold',
    ],
    confidence: 'confirmed',
  },
];

/** Normalize a name for fuzzy matching: lowercase, strip "Mark of ", strip trailing "s" */
function normalizeName(name: string): string {
  return name
    .toLowerCase()
    .replace(/^mark of\s+/i, '')
    .replace(/s$/, '')
    .trim();
}

interface ScrapedKalguuran {
  name: string;
  slug: string;
  iconUrl: string;
}

let scrapedKalguuran: ScrapedKalguuran[] = [];
try {
  const { default: data } = await import('./generated/kalguuran.json', { with: { type: 'json' } });
  scrapedKalguuran = (data as ScrapedKalguuran[]).filter(s => !RUNIC_SUPPORT_NAMES.has(s.name));
} catch {
  // generated/ not available — continue with hand-authored only
}

// Build lookup maps for scraper records
const scrapeByExactName = new Map(scrapedKalguuran.map(s => [s.name.toLowerCase(), s]));
const scrapeByNormalizedName = new Map(scrapedKalguuran.map(s => [normalizeName(s.name), s]));

function mergeKalguuranSkill(hand: KalguuranSkill): KalguuranSkill {
  const scrapeRecord =
    scrapeByExactName.get(hand.name.toLowerCase()) ??
    scrapeByNormalizedName.get(normalizeName(hand.name));
  if (!scrapeRecord) return hand;
  return {
    ...hand,
    slug: scrapeRecord.slug,
    iconUrl: scrapeRecord.iconUrl || undefined,
    confidence: scrapeRecord ? 'confirmed' : hand.confidence,
    sources: [...new Set([...(hand.sources ?? []), SOURCES.POE2DB])],
    // hand-authored description/keyStats/tags/note always win
  };
}

const handKalguuranNames = new Set([
  ...handAuthoredKalguuran.map(h => h.name.toLowerCase()),
  ...handAuthoredKalguuran.map(h => normalizeName(h.name)),
]);

const newScrapedKalguuran: KalguuranSkill[] = scrapedKalguuran
  .filter(s => !handKalguuranNames.has(s.name.toLowerCase()) && !handKalguuranNames.has(normalizeName(s.name)))
  .map(s => ({
    name: s.name,
    slug: s.slug,
    iconUrl: s.iconUrl || undefined,
    tags: [],
    cost: '',
    description: '',
    keyStats: [],
    confidence: 'confirmed' as ConfidenceTier,
    sources: [SOURCES.POE2DB],
  }));

export const kalguuranSkills: KalguuranSkill[] = [
  ...handAuthoredKalguuran.map(mergeKalguuranSkill),
  ...newScrapedKalguuran,
];

export const kalguuranContext = {
  totalNewSkills: '25+',
  confidence: 'confirmed' as ConfidenceTier,
  loreNote: 'Kalguuran skills draw on Ward as a resource rather than Mana, using the Runic Ward mechanic introduced with the Runes of Aldur league.',
};
