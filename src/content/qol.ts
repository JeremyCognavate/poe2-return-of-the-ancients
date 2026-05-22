import type { ConfidenceTier, Source } from './sources.js';
import { SOURCES } from './sources.js';

export interface QoLFeature {
  name: string;
  description: string;
  confidence: ConfidenceTier;
  sources?: Source[];
  note?: string;
}

export const qolFeatures: QoLFeature[] = [
  {
    name: 'Build Planner',
    description: 'Download a build guide file from content creators. The file appears in the game client showing Passive Tree nodes, Ascendancy points, Skill Gems, and more. File format spec available at pathofexile.com/developer/docs/game#buildplanner.',
    confidence: 'confirmed',
  },
  {
    name: 'Fragment Stash Tab',
    description: 'Dedicated stash tab holding up to 5,000 of each fragment type. Supports public listing for trade. Holds all 0.5.0 fragments: Runic Splinters, Breach Splinters, Simulacrum Splinters, Petition Splinters — plus existing items including Djinn Barya, Kulemak\'s Invitation, An Audience with the King, and Precursor Tablets.',
    confidence: 'confirmed',
  },
  {
    name: 'Atlas Search & Filtering',
    description: 'New search and filter functionality for the 400+ node Atlas passive skill tree. Quickly locate and highlight specific nodes across the full tree without manual scrolling — essential for navigating the expanded endgame tree.',
    confidence: 'confirmed',
    note: 'Functionality shown in official press kit image — exact feature scope confirmed at patch notes (21 May 2026).',
  },
  {
    name: 'Idol System',
    description: 'Idols are Azmeri-fashioned Augments that can be socketed into dedicated Idol slots and equipped. The Spirit Walker\'s Idolatry notable grants bonuses based on the number equipped. The Shaman\'s Wisdom of the Maji unlocks Bonded modifiers on both Runes and Idols.',
    confidence: 'confirmed',
  },
  {
    name: 'Trade League & SSF at Launch',
    description: 'Both Trade league and Solo Self-Found are available from day one of the 0.5.0 launch on 29 May 2026. No staggered rollout.',
    confidence: 'confirmed',
  },
];

interface PatchNotesSection {
  id: string;
  title: string;
  category: string;
  entries: string[];
}

let patchNotesSections: PatchNotesSection[] = [];
try {
  const { default: data } = await import('./generated/patchNotes.json', { with: { type: 'json' } });
  patchNotesSections = data as PatchNotesSection[];
} catch {
  // generated/ not available — continue with hand-authored only
}

function entryToName(entry: string): string {
  // Prefer splitting on first '. ' or ': ' if the result is under 60 chars
  const dotIdx = entry.indexOf('. ');
  const colonIdx = entry.indexOf(': ');
  let splitIdx = -1;
  if (dotIdx !== -1 && (colonIdx === -1 || dotIdx < colonIdx)) {
    splitIdx = dotIdx;
  } else if (colonIdx !== -1) {
    splitIdx = colonIdx;
  }
  if (splitIdx > 0 && splitIdx < 60) {
    return entry.slice(0, splitIdx);
  }
  return entry.slice(0, 60).trimEnd();
}

const handAuthoredNames = new Set(qolFeatures.map(f => f.name.toLowerCase()));

const qolSections = patchNotesSections.filter(s => s.category === 'qol');

for (const section of qolSections) {
  for (const entry of section.entries) {
    const name = entryToName(entry);
    if (handAuthoredNames.has(name.toLowerCase())) continue;
    qolFeatures.push({
      name,
      description: entry,
      confidence: 'confirmed',
      sources: [SOURCES.PATCH_NOTES],
    });
    handAuthoredNames.add(name.toLowerCase());
  }
}
