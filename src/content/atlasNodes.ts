import type { ConfidenceTier } from './sources';

export interface AtlasNodeGroup {
  name: string;
  description: string;
  confidence: ConfidenceTier;
}

export const atlasContext = {
  totalNodes: '400+',
  confidence: 'confirmed' as ConfidenceTier,
  note: 'Full Atlas tree not yet in PoE2DB as of 2026-05-09',
};

// Placeholder — full node data unavailable until patch notes or DB update
export const atlasNodeGroups: AtlasNodeGroup[] = [];
