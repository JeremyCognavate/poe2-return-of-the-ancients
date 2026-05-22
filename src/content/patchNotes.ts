// src/content/patchNotes.ts
export interface PatchNotesEntry {
  id: string;
  title: string;
  category: 'league' | 'endgame' | 'ascendancy' | 'skills' | 'balance' | 'uniques' | 'items' | 'qol' | 'campaign' | 'other';
  entries: string[];
}

let rawData: PatchNotesEntry[] = [];
try {
  const { default: data } = await import('./generated/patchNotes.json', { with: { type: 'json' } });
  rawData = data as PatchNotesEntry[];
} catch {
  // Generated data not available
}

export const patchNotes: PatchNotesEntry[] = rawData;

export const PATCH_NOTE_CATEGORIES = [
  { id: 'league', label: 'Runes of Aldur' },
  { id: 'endgame', label: 'Endgame' },
  { id: 'ascendancy', label: 'Ascendancies' },
  { id: 'skills', label: 'Skills & Supports' },
  { id: 'balance', label: 'Balance' },
  { id: 'uniques', label: 'Unique Items' },
  { id: 'items', label: 'Items' },
  { id: 'qol', label: 'QoL & UI' },
  { id: 'campaign', label: 'Campaign' },
  { id: 'other', label: 'Other' },
] as const;
