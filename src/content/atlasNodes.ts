import type { ConfidenceTier } from './sources.js';

export const atlasContext = {
  totalNodes: '400+',
  confidence: 'confirmed' as ConfidenceTier,
  note: 'Full Atlas tree from 0.5.0 patch notes (2026-05-22)',
};

export type AtlasTreeKind = 'core' | 'master' | 'league';

export interface AtlasTreeGroup {
  id: string;
  name: string;
  kind: AtlasTreeKind;
  scale: string;
  summary: string;
  highlights: string[];
  confidence: ConfidenceTier;
}

const KIND_MAP: Record<string, AtlasTreeKind> = {
  'origins-of-divinity-the-endgame-overhaul': 'core',
  'masters-of-the-atlas':                     'master',
  delirium:                                    'league',
  breach:                                      'league',
  ritual:                                      'league',
  abyss:                                       'league',
  'fate-of-the-vaal-moving-to-core':           'league',
};

const SCALE_MAP: Record<string, string> = {
  'origins-of-divinity-the-endgame-overhaul': '300+ nodes',
  'masters-of-the-atlas':                     '3 masters · 4 of 12',
  delirium:                                    'revamped tree',
  breach:                                      'revamped tree',
  ritual:                                      'revamped tree',
  abyss:                                       'revamped tree',
  'fate-of-the-vaal-moving-to-core':           'revamped tree',
};

const TREE_RE = /atlas|node|passive|tree|master/i;

function pickHighlights(details: string[]): string[] {
  const hits = details.filter(d => TREE_RE.test(d));
  return hits.length > 0 ? hits : details.slice(0, 4);
}

const FALLBACK_GROUPS: AtlasTreeGroup[] = [
  {
    id: 'origins-of-divinity-the-endgame-overhaul',
    name: 'Origins of Divinity — Atlas Tree',
    kind: 'core',
    scale: '300+ nodes',
    summary: 'The Atlas tree has been significantly expanded with over 300 nodes via the new Fortress endgame storyline.',
    highlights: [
      'The Atlas Tree has been significantly expanded with over 300 nodes.',
      'Maps inside the fortress grant one or more passive points for the Atlas Passive Tree.',
      'As the entire atlas tree can be fully allocated, there is no need to allow respecialisation.',
      'Multi-choice nodes on the tree can be changed between options at any time.',
    ],
    confidence: 'confirmed',
  },
  {
    id: 'masters-of-the-atlas',
    name: 'Masters of the Atlas',
    kind: 'master',
    scale: '3 masters · 4 of 12',
    summary: 'Ascendancy-style endgame progression: align with one of three masters, each with 12 nodes, 4 selectable at once.',
    highlights: [
      'Each master has 12 nodes of which 4 can be selected at the same time.',
      'You can change your selection at any time.',
      'All three masters can be allocated at the same time with quick select button.',
    ],
    confidence: 'confirmed',
  },
];

interface ScrapedMechanic {
  id: string;
  name: string;
  shortDesc: string;
  details: string[];
  confidence: ConfidenceTier;
}

let scrapedEndgame: ScrapedMechanic[] = [];
try {
  const { default: data } = await import('./generated/endgame.json', { with: { type: 'json' } });
  scrapedEndgame = data as ScrapedMechanic[];
} catch {
  // generated/ not available — use fallback below
}

export const atlasTreeGroups: AtlasTreeGroup[] = (() => {
  const groups: AtlasTreeGroup[] = [];
  for (const mechanic of scrapedEndgame) {
    const kind = KIND_MAP[mechanic.id];
    if (!kind) continue;
    groups.push({
      id: mechanic.id,
      name: mechanic.name,
      kind,
      scale: SCALE_MAP[mechanic.id] ?? 'revamped tree',
      summary: mechanic.shortDesc.split('\n')[0].slice(0, 160),
      highlights: pickHighlights(mechanic.details),
      confidence: mechanic.confidence,
    });
  }
  return groups.length > 0 ? groups : FALLBACK_GROUPS;
})();
