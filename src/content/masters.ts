import type { ConfidenceTier } from './sources';

export interface Master {
  name: string;
  role: string;
  location: string;
  description: string;
  services: string[];
  confidence: ConfidenceTier;
  note?: string;
}

export const masters: Master[] = [
  {
    name: 'Alith',
    role: 'Keeper of the Flame (recruits the player)',
    location: 'Acts',
    description: 'Alith is herself a Keeper of the Flame who recruits the player into the order — not a replacement for the Keepers.',
    services: ['Introduces the Runes of Aldur league mechanic'],
    confidence: 'confirmed',
    note: 'Brief incorrectly framed Alith as "replacing Keepers of the Flame" — she IS a Keeper recruiting the player.',
  },
];
