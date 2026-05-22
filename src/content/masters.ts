import type { ConfidenceTier, Source } from './sources.js';
import { SOURCES } from './sources.js';

export interface Master {
  name: string;
  role: string;
  location: string;
  description: string;
  services: string[];
  confidence: ConfidenceTier;
  sources?: Source[];
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
  {
    name: 'Jado',
    role: 'Atlas Master — Order of the Djinn',
    location: 'Atlas',
    description: "Master of the Atlas aligned with the Order of the Djinn. Jado's Spycraft questline is unlocked by completing an anomaly map near the starting location.",
    services: ['Atlas Master progression (4 of 12 nodes active)', 'Unique asymmetric Atlas bonuses'],
    confidence: 'confirmed',
    sources: [SOURCES.PATCH_NOTES],
  },
  {
    name: 'Hilda',
    role: 'Atlas Master — Monster Hunter',
    location: 'Atlas',
    description: "Monster hunter and Atlas Master. Hilda's Hunting questline is unlocked by visiting Hilda's Campsite slightly south-west of the Atlas starting location.",
    services: ['Atlas Master progression (4 of 12 nodes active)', 'Unique asymmetric Atlas bonuses'],
    confidence: 'confirmed',
    sources: [SOURCES.PATCH_NOTES],
  },
  {
    name: 'Doryani',
    role: 'Atlas Master — Science',
    location: 'Atlas (Corruption Nexus)',
    description: "Doryani's Science questline is unlocked by clearing a corruption nexus.",
    services: ['Atlas Master progression (4 of 12 nodes active)', 'Unique asymmetric Atlas bonuses'],
    confidence: 'confirmed',
    sources: [SOURCES.PATCH_NOTES],
  },
];
