import type { ConfidenceTier } from './sources';

export interface Rune {
  name: string;
  tier: 'lesser' | 'base' | 'greater' | 'special';
  socketTarget: 'weapon' | 'armour' | 'any';
  weaponEffect?: string;
  armourEffect?: string;
  wandOrStaffEffect?: string;
  bondedEffect?: string;
  note?: string;
  confidence: ConfidenceTier;
}

export interface RunicSupport {
  name: string;
  description: string;
  confidence: ConfidenceTier;
}

export const runeCount = {
  total: 160,
  confidence: 'confirmed' as ConfidenceTier,
  source: 'QA transcript lines 725 and 2223',
};

export const runes: Rune[] = [
  // Weapon leech runes
  {
    name: 'Lesser Body Rune',
    tier: 'lesser',
    socketTarget: 'weapon',
    weaponEffect: 'Leeches 2% of Physical Damage as Life',
    wandOrStaffEffect: '+25 to maximum Energy Shield',
    armourEffect: '+20 to maximum Life',
    bondedEffect: 'Martial Weapon: 5% increased maximum Life / Wand or Staff: 5% increased maximum Life / Armour: +10 to maximum Life, +10 to maximum Mana',
    confidence: 'confirmed',
  },
  {
    name: 'Lesser Mind Rune',
    tier: 'lesser',
    socketTarget: 'weapon',
    weaponEffect: 'Leeches 1.5% of Physical Damage as Mana',
    wandOrStaffEffect: '+30 to maximum Mana',
    armourEffect: '+15 to maximum Mana',
    bondedEffect: 'Martial Weapon: 5% increased maximum Mana / Wand or Staff: 5% increased maximum Mana / Armour: +10 to maximum Life, +10 to maximum Mana',
    confidence: 'confirmed',
  },
  {
    name: 'Body Rune',
    tier: 'base',
    socketTarget: 'weapon',
    weaponEffect: 'Leeches 2.5% of Physical Damage as Life',
    wandOrStaffEffect: '+30 to maximum Energy Shield',
    armourEffect: '+30 to maximum Life',
    bondedEffect: 'Martial Weapon: 5% increased maximum Life / Wand or Staff: 5% increased maximum Life / Armour: +10 to maximum Life, +10 to maximum Mana',
    confidence: 'confirmed',
  },
  {
    name: 'Mind Rune',
    tier: 'base',
    socketTarget: 'weapon',
    weaponEffect: 'Leeches 2% of Physical Damage as Mana',
    wandOrStaffEffect: '+40 to maximum Mana',
    armourEffect: '+25 to maximum Mana',
    bondedEffect: 'Martial Weapon: 5% increased maximum Mana / Wand or Staff: 5% increased maximum Mana / Armour: +10 to maximum Life, +10 to maximum Mana',
    confidence: 'confirmed',
  },
  {
    name: 'Greater Body Rune',
    tier: 'greater',
    socketTarget: 'weapon',
    weaponEffect: 'Leeches 3% of Physical Damage as Life',
    wandOrStaffEffect: '+35 to maximum Energy Shield',
    armourEffect: '+40 to maximum Life',
    bondedEffect: 'Martial Weapon: 5% increased maximum Life / Wand or Staff: 5% increased maximum Life / Armour: +10 to maximum Life, +10 to maximum Mana',
    confidence: 'confirmed',
  },
  {
    name: 'Greater Mind Rune',
    tier: 'greater',
    socketTarget: 'weapon',
    weaponEffect: 'Leeches 2.5% of Physical Damage as Mana',
    wandOrStaffEffect: '+50 to maximum Mana',
    armourEffect: '+35 to maximum Mana',
    bondedEffect: 'Martial Weapon: 5% increased maximum Mana / Wand or Staff: 5% increased maximum Mana / Armour: +10 to maximum Life, +10 to maximum Mana',
    confidence: 'confirmed',
  },
  // Crafting-related special runes
  {
    name: "Olroth's Legacy",
    tier: 'special',
    socketTarget: 'any',
    weaponEffect: 'Destroy a unique item to extract its unique rune — that rune can then be traded or socketed',
    confidence: 'confirmed',
    source: 'QA transcript',
    note: 'Major crafting mechanic — enables unique rune economy',
  } as Rune & { source: string },
  {
    name: 'Masterwork Rune',
    tier: 'special',
    socketTarget: 'any',
    weaponEffect: 'Upgrades a rune past its normal cap',
    confidence: 'confirmed',
    source: 'QA transcript',
    note: 'Tradeable item',
  } as Rune & { source: string },
  // Runic Supports
];

export const runicSupports: RunicSupport[] = [
  {
    name: 'Runic Infusion',
    description: 'Attacks cost +20% of maximum Ward as additional cost; grant +25% of Ward cost as added physical damage.',
    confidence: 'confirmed',
  },
  {
    name: 'Concussive Runes',
    description: 'Trigger Runic Shockwave on Heavy Stun. Requires Ward to fire.',
    confidence: 'confirmed',
  },
];

export interface RunicAlloy {
  name: string;
  effect: string;
  confidence: ConfidenceTier;
  note?: string;
}

export const runicAlloys: RunicAlloy[] = [
  {
    name: 'Runic Alloy',
    effect: 'Reforges a socketed rune, randomly re-rolling all of its modifiers. The primary reforging currency of the Runes of Aldur league — analogous to an Orb of Alteration.',
    confidence: 'confirmed',
  },
  {
    name: 'Imbued Alloy',
    effect: 'Reforges a rune, producing enhanced modifier values or preserving one existing modifier during the reforge. An upgraded tier of reforging compared to Runic Alloy.',
    confidence: 'inferred',
    note: 'Confirmed in Q&A as a distinct reforging tier — exact lock-and-reroll mechanic inferred from name.',
  },
  {
    name: 'Expansive Alloy',
    effect: 'Reforges a rune and adds one additional modifier beyond its normal maximum, expanding the rune\'s total modifier count.',
    confidence: 'inferred',
    note: '"Expansive" name strongly implies modifier-count expansion — exact increase unconfirmed pre-patch.',
  },
  {
    name: 'Swift Alloy',
    effect: 'Reforges a rune with outcomes weighted toward speed and movement modifiers (attack speed, cast speed, movement speed, projectile speed).',
    confidence: 'inferred',
    note: 'Bias mechanic inferred from "Swift" naming — confirmed as a specialised reforging tier.',
  },
  {
    name: 'Mystic Alloy',
    effect: 'Reforges a rune with outcomes weighted toward spell and elemental modifiers, favouring caster-oriented results.',
    confidence: 'inferred',
    note: 'Bias mechanic inferred from "Mystic" naming — confirmed as a specialised reforging tier.',
  },
];
