// src/content/whatsnew.ts
import data from './whatsnew.json';

export type WhatsNewKind = 'added' | 'changed' | 'teaser';

export interface WhatsNewEntry {
  date: string;
  kind: WhatsNewKind;
  dataset?: string;
  key?: string;
  label: string;
  fields?: string[];
  channel?: string;
  url?: string;
  thumbnail?: string;
  summary?: string;
}

export const whatsNewEntries = data as WhatsNewEntry[];
