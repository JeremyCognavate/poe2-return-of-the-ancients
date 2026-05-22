import type { ConfidenceTier } from './sources';

export interface TimelineEvent {
  date: string;
  label: string;
  description: string;
  confidence: ConfidenceTier;
}

export const timeline: TimelineEvent[] = [
  {
    date: '2026-05-21',
    label: 'Patch Notes Released',
    description: 'Official 0.5.0 patch notes published.',
    confidence: 'confirmed',
  },
  {
    date: '2026-05-29',
    label: 'Launch — Return of the Ancients',
    description: 'Path of Exile 2 patch 0.5.0 "Return of the Ancients" goes live. Trade league and SSF available at launch.',
    confidence: 'confirmed',
  },
];
