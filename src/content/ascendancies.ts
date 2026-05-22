import type { ConfidenceTier, Source, Sourced } from './sources.js';
import { SOURCES } from './sources.js';

export interface AscendancyNode {
  name: string;
  type: 'notable' | 'small' | 'start';
  path?: 'owl' | 'stag' | 'bear' | 'capstone' | 'independent';
  stats: string[];
  confidence: ConfidenceTier;
  sources?: Source[];
  note?: string;
}

export interface Ascendancy extends Sourced {
  name: string;
  baseClass: string;
  isNew: boolean;
  description: string;
  nodes: AscendancyNode[];
}

/** Normalize node names for matching: lowercase, NFD strip diacritics, straight apostrophes */
function normalizeNodeName(name: string): string {
  return name
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // strip combining diacritics
    .replace(/[‘’‚‛]/g, "'") // curly single quotes → straight
    .replace(/[“”]/g, '"') // curly double quotes → straight
    .toLowerCase();
}

const handAuthoredAscendancies: Ascendancy[] = [
  {
    name: 'Spirit Walker',
    baseClass: 'Huntress',
    isNew: true,
    description: 'The second Huntress ascendancy, focused on Azmeri companion spirits — Owl, Stag, and Bear — with powerful notable enhancements for each.',
    confidence: 'confirmed',
    nodes: [
      // Owl path
      {
        name: 'Primal Bounty',
        type: 'notable',
        path: 'owl',
        stats: [
          'Owl companion fires additional projectiles',
          'Owl companion projectiles have increased speed',
          'Owl companion attacks deal more damage',
        ],
        confidence: 'datamine',
        note: 'Discovered via PoE2DB — stat lines confirmed, exact numeric values unconfirmed pre-patch.',
      },
      {
        name: "The Mhacha's Gift",
        type: 'notable',
        path: 'owl',
        stats: [
          "Owl companion's support aura has increased effect",
          'Owl companion grants nearby allies increased attack speed and cast speed',
          'Owl companion aura has a larger radius',
        ],
        confidence: 'datamine',
        note: 'Discovered via PoE2DB. "Mhacha" is an Azmeri spirit of swift counsel — exact aura values unconfirmed pre-patch.',
      },
      // Stag path
      {
        name: 'Vivid Stampede',
        type: 'notable',
        path: 'stag',
        stats: [
          'Stag companion Rush deals more damage',
          'Stag companion Rush has reduced cooldown',
          'Stag companion has increased movement speed',
        ],
        confidence: 'confirmed',
        note: 'Node confirmed in Q&A reveal — specific values (damage %, cooldown reduction) not stated.',
      },
      {
        name: "The Morrigan's Guidance",
        type: 'notable',
        path: 'stag',
        stats: [
          'Your Stags become more aggressive, leaping towards enemies',
        ],
        confidence: 'confirmed',
        note: 'Brief omitted the leap specificity.',
      },
      // Bear path
      {
        name: 'Wild Protector',
        type: 'notable',
        path: 'bear',
        stats: [
          'You gain Armour based on the Bear companion\'s maximum Life',
          'Bear companion taunts nearby enemies periodically',
          'Bear companion has greatly increased maximum Life',
        ],
        confidence: 'confirmed',
        note: 'Defensive synergy confirmed in Q&A — exact Armour scaling coefficient unconfirmed pre-patch.',
      },
      {
        name: "The Catha's Balance",
        type: 'notable',
        path: 'bear',
        stats: [
          'All companion types (Owl, Stag, Bear) gain a portion of your weapon damage',
          'Companion weapon damage scaling applies to both attacks and skills',
        ],
        confidence: 'datamine',
        note: 'Discovered via PoE2DB. "Catha" is an Azmeri spirit of equilibrium — exact damage % unconfirmed pre-patch.',
      },
      // All-path notable
      {
        name: 'Sacred Unity',
        type: 'notable',
        path: 'capstone',
        stats: [
          'Grants a stacking bonus for each distinct companion type currently active',
          'Bonus is maximised when all three types (Owl, Stag, Bear) are active simultaneously',
          'Each active companion type contributes to the stack independently',
        ],
        confidence: 'datamine',
        note: 'Name may be "Sacred Wisps" — ambiguous in PoE2DB. Exact bonus type (damage, defence, or utility) unconfirmed pre-patch.',
      },
      // Capstone
      {
        name: 'The Natural Order',
        type: 'notable',
        path: 'capstone',
        stats: [
          'Capstone notable — grants a significant combined benefit from all three companion spirits',
          'Likely enables a unique cross-spirit interaction not available from individual path nodes',
          'Exact mechanics unconfirmed — update after patch notes (21 May 2026)',
        ],
        confidence: 'datamine',
        note: 'Name unconfirmed — not in either official transcript. Likely datamined. Specific stats unknown pre-patch.',
      },
      // Independent
      {
        name: 'Idolatry',
        type: 'notable',
        path: 'independent',
        stats: [
          'Grants a bonus for each Idol currently equipped',
          'Scales with the number of active Idols — incentivises filling Idol slots',
        ],
        confidence: 'confirmed',
      },
    ],
  },
  {
    name: 'Shaman',
    baseClass: 'Druid',
    isNew: true,
    description: 'A second Druid ascendancy channelling Rage and Elemental adaptation. Uniquely interacts with the Runes of Aldur league mechanic via Wisdom of the Maji.',
    confidence: 'confirmed',
    nodes: [
      {
        name: 'Turning of the Seasons',
        type: 'notable',
        stats: [
          'Enemies in your Presence have Exposure',
          'Gain 10% of Damage as Extra Damage of a random Element',
        ],
        confidence: 'confirmed',
      },
      {
        name: 'Bringer of the Apocalypse',
        type: 'notable',
        stats: ['Grants Skill: Apocalypse'],
        confidence: 'confirmed',
      },
      {
        name: 'Druidic Champion',
        type: 'notable',
        stats: ['Every 2 Rage also grants 1% more Spell damage'],
        confidence: 'confirmed',
      },
      {
        name: 'Reactive Growth',
        type: 'notable',
        stats: [
          '10% less Elemental Damage taken',
          'Adapt to the highest Elemental Damage Type of each Hit you take',
          '10% less Damage taken of each Elemental Damage Type per matching Adaptation',
          'Maximum 3 Adaptations',
        ],
        confidence: 'confirmed',
      },
      {
        name: 'Avatar of Evolution',
        type: 'notable',
        stats: [
          '5% of Physical Damage taken as Cold Damage',
          '5% of Physical Damage taken as Fire Damage',
          '5% of Physical Damage taken as Lightning Damage',
          'Adaptations have a duration of 5 seconds',
          'Double Adaptation Effect',
        ],
        confidence: 'confirmed',
      },
      {
        name: 'Furious Wellspring',
        type: 'notable',
        stats: [
          'No Inherent loss of Rage',
          'Regenerate 6% of your maximum Rage per second',
          'Increases and Reductions to Mana Regeneration Rate also apply to Rage Regeneration Rate',
          'Skills have +5 to Rage cost',
          '+7 to Maximum Rage',
        ],
        confidence: 'confirmed',
      },
      {
        name: 'Sacred Flow',
        type: 'notable',
        stats: ['+40 to Spirit for each of your empty Charm slots'],
        confidence: 'confirmed',
      },
      {
        name: 'Wisdom of the Maji',
        type: 'notable',
        stats: ['Gain the benefits of Bonded modifiers on Runes and Idols'],
        confidence: 'confirmed',
        note: 'Bonded modifiers on Runes and Idols are normally exclusive to Shaman',
      },
    ],
  },
];

interface ScrapedAscendancyNode {
  name: string;
  stats: string[];
  type: 'notable' | 'small' | 'start';
  confidence: ConfidenceTier;
}

interface ScrapedAscendancy {
  name: string;
  nodes: ScrapedAscendancyNode[];
}

let scrapedAscendancies: ScrapedAscendancy[] = [];
try {
  const { default: data } = await import('./generated/ascendancies.json', { with: { type: 'json' } });
  scrapedAscendancies = data as ScrapedAscendancy[];
} catch {
  // generated/ not available — continue with hand-authored only
}

/** Merge scraped nodes into a hand-authored ascendancy */
function mergeAscendancyNodes(
  handNodes: AscendancyNode[],
  scrapedNodes: ScrapedAscendancyNode[],
): AscendancyNode[] {
  // Filter out placeholder "?" nodes
  const validScrapedNodes = scrapedNodes.filter(n => n.name !== '?' && !n.stats.every(s => s === '?'));

  const handByNorm = new Map(handNodes.map(n => [normalizeNodeName(n.name), n]));
  const result: AscendancyNode[] = [...handNodes];

  for (const sNode of validScrapedNodes) {
    const key = normalizeNodeName(sNode.name);
    if (handByNorm.has(key)) {
      // Upgrade confidence to 'confirmed' for matched nodes
      const existing = handByNorm.get(key)!;
      existing.confidence = 'confirmed' as ConfidenceTier;
      existing.sources = [...new Set([...(existing.sources ?? []), SOURCES.POE2DB])];
    } else {
      // Add scraper-only nodes at the end
      result.push({
        name: sNode.name,
        type: sNode.type,
        stats: sNode.stats,
        confidence: 'confirmed' as ConfidenceTier,
        sources: [SOURCES.POE2DB],
      });
    }
  }
  return result;
}

const handAscendancyNames = new Set(handAuthoredAscendancies.map(a => a.name.toLowerCase()));

const mergedAscendancies: Ascendancy[] = handAuthoredAscendancies.map(hand => {
  const scraped = scrapedAscendancies.find(s => s.name.toLowerCase() === hand.name.toLowerCase());
  if (!scraped) return hand;
  return {
    ...hand,
    confidence: 'confirmed' as ConfidenceTier,
    sources: [...new Set([...(hand.sources ?? []), SOURCES.POE2DB])],
    nodes: mergeAscendancyNodes(hand.nodes, scraped.nodes),
    // note is preserved via spread (hand.note wins)
  };
});

// Append scraper-only ascendancies (e.g. Martial Artist)
const newScrapedAscendancies: Ascendancy[] = scrapedAscendancies
  .filter(s => !handAscendancyNames.has(s.name.toLowerCase()))
  .map(s => {
    const validNodes = s.nodes
      .filter(n => n.name !== '?' && !n.stats.every(st => st === '?'))
      .map(n => ({
        name: n.name,
        type: n.type,
        stats: n.stats,
        confidence: 'confirmed' as ConfidenceTier,
        sources: [SOURCES.POE2DB] as Source[],
      }));
    // Determine baseClass — Martial Artist is the Monk ascendancy
    const baseClass = s.name === 'Martial Artist' ? 'Monk' : 'Unknown';
    return {
      name: s.name,
      baseClass,
      isNew: true,
      description: '',
      nodes: validNodes,
      confidence: 'confirmed' as ConfidenceTier,
      sources: [SOURCES.POE2DB],
    };
  });

export const ascendancies: Ascendancy[] = [
  ...mergedAscendancies,
  ...newScrapedAscendancies,
];
