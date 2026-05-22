import type { ConfidenceTier } from './sources';

export interface BalanceChange {
  id: string;
  category: 'nerf' | 'buff' | 'rework' | 'new';
  subject: string;
  summary: string;
  details: string[];
  confidence: ConfidenceTier;
  note?: string;
}

export const balanceChanges: BalanceChange[] = [
  {
    id: 'leech-rework',
    category: 'rework',
    subject: 'Leech',
    summary: 'Paradigm-shift rework — single-source cap, and leech calculation now based on damage dealt cap.',
    details: [
      'Only one leech source applies at a time (single-source cap)',
      'Leech amount is now calculated against a damage cap',
      'Major impact on attack builds that relied on stacking multiple leech sources',
    ],
    confidence: 'confirmed',
  },
  {
    id: 'ghost-dance-nerf',
    category: 'nerf',
    subject: 'Ghost Dance (Evasion/ES node)',
    summary: 'Ghost Dance specifically nerfed, not just a general ES slight nerf.',
    details: [
      'Ghost Dance passive nerfed significantly',
      'General ES adjustments also present but Ghost Dance was called out specifically',
    ],
    confidence: 'confirmed',
    note: 'Brief generically said "ES slightly nerfed" — the specific target is Ghost Dance',
  },
  {
    id: 'companion-overhaul',
    category: 'rework',
    subject: 'Companion builds',
    summary: 'Full companion build overhaul beyond just Tame Beast changes.',
    details: [
      'Tame Beast: Wisp duration 8–11.8s (scales with gem level)',
      'Tame Beast: Retains 4 monster modifiers',
      'Tame Beast: Hinder applies 30% movement speed reduction on ensnared beast',
      'Tame Beast mana cost: 22–99',
      'Tame Beast level mismatch confirmed — GGG says "we have a solution"',
      'Overall companion system overhauled beyond Tame Beast alone',
    ],
    confidence: 'confirmed',
  },
  {
    id: 'huntress-passives',
    category: 'rework',
    subject: 'Huntress Class Passives',
    summary: 'Several Huntress passive tree nodes updated — Projectile Damage converted to Attack Damage in multiple places.',
    details: [
      '"10% increased Projectile Damage" → "10% increased Attack Damage" (multiple nodes)',
      '"8% increased Projectile Damage" → "8% increased Attack Damage"',
      '"15% chance to Pierce / 15% increased Projectile Damage" → "30% increased Melee Damage if dealt Projectile Attack Hit recently"',
      '"33% increased Damage vs Ailment enemies" → "+30 Accuracy, 10% increased Accuracy"',
      'Attack speed nodes adjusted',
    ],
    confidence: 'confirmed',
  },
  {
    id: 'ascendancy-trials',
    category: 'rework',
    subject: 'Ascendancy Trials',
    summary: 'Existing two trials being improved; third ascendancy trial is "coin flip" for 1.0.',
    details: [
      'Trial of the Sekhemas and Trial of Chaos both receiving improvements',
      'Third ascendancy trial design is uncertain — described as "coin flip" for whether it ships at 1.0',
    ],
    confidence: 'confirmed',
  },
  {
    id: 'defense-overhaul',
    category: 'rework',
    subject: 'Defence Systems (Armour / Evasion / Deflection)',
    summary: 'Broad defence rework: deflection equation revised, armour/evasion passive notables buffed, hybrid nodes added, Ghost Dance specifically targeted.',
    details: [
      'Deflection equation revised — was "too rewarding for very little investment"',
      'Armour and Evasion notable passives were "hyperconditional" and many didn\'t even grant armour or evasion — being buffed',
      'New hybrid armour/evasion nodes added to the passive tree',
      'Ghost Dance specifically nerfed — the differential between pure evasion and evasion + 1k ES was too large',
      'All defensive base types buffed from Act 3 onwards',
    ],
    confidence: 'confirmed',
    note: 'Ghost Dance is the most prominent change but is part of a broader defensive system overhaul. QA transcript: "the deflection equation is honestly kind of not good enough."',
  },
  {
    id: 'portal-revive',
    category: 'rework',
    subject: 'Map Portals & Revive System',
    summary: 'Portal loss formula changed to −1 per 2 modifiers; Atlas tree and crafting master provide additional revives.',
    details: [
      'Revised formula: −1 portal per 2 map modifiers (previously −1 per 6)',
      'Atlas passive tree includes nodes that grant additional map revives',
      'Crafting master provides one additional revive',
      'One Atlas node option removes all revives entirely (for challenge/reward builds)',
    ],
    confidence: 'confirmed',
    note: 'QA transcript: "we now have it be minus one portal per two modifiers... Atlas nodes and the master for additional revives."',
  },
  {
    id: 'temple-incursion',
    category: 'rework',
    subject: 'Temple of Atzoatl (Incursion)',
    summary: 'Temple snaking strategy removed; temple gains its own in-dungeon meta-progression separate from the Atlas.',
    details: [
      'Snaking strategy fixed: rooms that would disconnect the temple now become empty connector rooms instead of being deleted',
      'GGG: current snaking results in "1,000% unacceptable levels of item drops" — fix ships in 0.5',
      'Temple now has its own in-dungeon meta-progression (tablet, tree, quest line unlocked by killing architects)',
      'Temple does not have an Atlas active mechanic — the dungeon itself is the content loop',
    ],
    confidence: 'confirmed',
    note: 'QA transcript lines 2786–2814. Temple going core with Incursion was separately confirmed.',
  },
  {
    id: 'rogue-exiles',
    category: 'buff',
    subject: 'Rogue Exiles — Nemesis System',
    summary: 'Rogue Exiles significantly buffed and gain a nemesis mechanic: defeated exiles can retreat and return to hunt you in adjacent maps.',
    details: [
      'Nemesis system: a defeated Rogue Exile may retreat to an adjacent map and return to fight you again',
      'Atlas nodes allow specialising into Rogue Exile hunting grounds with multiple exiles hunting rare beasts',
      'Exiles made significantly more powerful ("more substantial") — less of a pushover in endgame',
      'GGG note: "The patent has expired" — reference to PoE1 Nemesis league mechanic',
    ],
    confidence: 'confirmed',
    note: 'QA transcript lines 3877–3880. Reveal transcript lines 627–699.',
  },
];
