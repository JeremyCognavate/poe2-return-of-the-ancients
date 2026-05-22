import type { ConfidenceTier, Source } from './sources.js';
import { SOURCES } from './sources.js';

export interface AtlasNodeGroup {
  name: string;
  description: string;
  confidence: ConfidenceTier;
  sources?: Source[];
}

export const atlasContext = {
  totalNodes: '400+',
  confidence: 'confirmed' as ConfidenceTier,
  note: 'Full Atlas tree not yet in PoE2DB as of 2026-05-09',
};

interface ScrapedEndgameMechanic {
  id: string;
  name: string;
  shortDesc: string;
  confidence: ConfidenceTier;
}

let scrapedEndgameForAtlas: ScrapedEndgameMechanic[] = [];
try {
  const { default: data } = await import('./generated/endgame.json', { with: { type: 'json' } });
  scrapedEndgameForAtlas = data as ScrapedEndgameMechanic[];
} catch {
  // generated/ not available — atlasNodeGroups will remain empty
}

// Populate from endgame mechanics relevant to atlas navigation
export const atlasNodeGroups: AtlasNodeGroup[] = scrapedEndgameForAtlas
  .filter(s => s.id.includes('atlas') || s.id.includes('masters') || s.id.includes('origins'))
  .map(s => ({
    name: s.name,
    description: s.shortDesc,
    confidence: 'confirmed' as ConfidenceTier,
    sources: [SOURCES.PATCH_NOTES],
  }));
