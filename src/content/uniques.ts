import type { ConfidenceTier } from './sources';

export interface UniqueItem {
  name: string;
  baseType: string;
  itemClass: string;
  reqLevel?: number;
  /** Implicit / "Grants Skill" lines, displayed at top of tooltip */
  implicits: string[];
  /** Explicit mods — the bulk of the item */
  explicits: string[];
  /** Italic flavour text shown at bottom of tooltip */
  flavour?: string;
  /** Filename in src/assets/uniques/ (no path) — undefined if no icon scraped */
  iconFile?: string;
  confidence: ConfidenceTier;
  note?: string;
  /** Marks items with explicit Spirit Walker / Companion synergy */
  spiritWalkerSynergy?: boolean;
}

export const uniqueItems: UniqueItem[] = [
  // ── Spear ─────────────────────────────────────────────────────
  {
    name: 'The Ordained',
    baseType: 'Grand Spear',
    itemClass: 'Spear',
    reqLevel: 79,
    implicits: [
      'Grants Skill: Spear Throw',
      'Grants Skill: Level 18 Righteous Descent',
      '25% increased Melee Strike Range with this weapon',
    ],
    explicits: [
      '243% increased Physical Damage',
      'Adds 1 to 209 Lightning Damage',
      '+6.47% to Critical Hit Chance',
      'Life Leech recovers based on your Lightning damage as well as Physical damage',
      'Create a Fragment of Divinity in your Presence every 4 seconds',
    ],
    iconFile: 'TheOrdained.png',
    confidence: 'datamine',
  },

  // ── Bows ──────────────────────────────────────────────────────
  {
    name: 'Periphery',
    baseType: 'Heartwood Shortbow',
    itemClass: 'Bow',
    reqLevel: 72,
    implicits: ['Grants Skill: Level 17 Azmerian Swarms'],
    explicits: [
      'Adds 49 to 90 Fire Damage',
      'Adds 38 to 70 Cold Damage',
      'Adds 1 to 135 Lightning Damage',
      '12% increased Attack Speed',
      'Elemental Damage from Hits Contributes to Flammability, Ignite, and Chill Magnitudes, Freeze Buildup, and Shock Chance',
    ],
    iconFile: 'Periphery.png',
    confidence: 'datamine',
  },
  {
    name: 'Ironbound',
    baseType: 'Warden Bow',
    itemClass: 'Bow',
    reqLevel: 11,
    implicits: ['23% chance to Chain an additional time'],
    explicits: [
      '+119 to Armour',
      '9% increased Attack Speed',
      '+12% to Block chance',
      '5% increased Block chance per 100 total Item Armour on Equipped Armour Items',
      'Hits with this weapon have 1 to 4 Added Physical Damage per 1% Block Chance',
      'Arrows Return if they have Pierced a target which had Fully Broken Armour',
    ],
    iconFile: 'Ironbound.png',
    confidence: 'datamine',
  },

  // ── Sceptre ───────────────────────────────────────────────────
  {
    name: "Sylvan's Effigy",
    baseType: 'Stoic Sceptre',
    itemClass: 'Sceptre',
    reqLevel: 78,
    implicits: [
      'Grants Skill: Level 18 Discipline',
      'Grants Skill: Level 18 Azmerian Wolf',
    ],
    explicits: [
      '54% increased Spirit',
      'Allies in your Presence Regenerate 64 Life per second',
      '+9 to all Attributes',
      'Companions deal 85% increased damage to your Marked targets',
      'You can have any number of Companions of different types',
    ],
    iconFile: 'SylvansEffigy.png',
    confidence: 'datamine',
    spiritWalkerSynergy: true,
    note: 'Removes one-companion-per-type limit; combined with Azmerian Wolf grant, enables a Wolf companion',
  },

  // ── Two Hand Maces ────────────────────────────────────────────
  {
    name: 'Twisted Empyrean',
    baseType: 'Aberrant Sledge',
    itemClass: 'Two Hand Mace',
    reqLevel: 78,
    implicits: ['Grants Skill: Level 18 Starborn Onslaught'],
    explicits: [
      '94% increased Physical Damage',
      'Adds 166 to 372 Cold Damage',
      '+319 to maximum Mana',
      '+4.43% to Critical Hit Chance',
      '10% of Damage is taken from Mana before Life',
      'Attacks with this Weapon have Added Cold Damage equal to 6% to 10% of maximum Mana',
      'Convert 100% of Fire Damage with Mace Skills to Cold Damage',
    ],
    iconFile: 'TwistedEmpyrean.png',
    confidence: 'datamine',
  },
  {
    name: "Brutus' Lead Sprinkler",
    baseType: 'Morning Star',
    itemClass: 'Two Hand Mace',
    reqLevel: 78,
    implicits: ['Grants Skill: Level 18 Molten Shower'],
    explicits: [
      'Hits with this Weapon have 5% chance to Trigger Molten Shower per 25 Strength',
      '102% increased Physical Damage',
      '7% increased Attack Speed',
      '+23 to Strength',
      '5 to 10 Added Attack Fire Damage per 25 Strength',
    ],
    iconFile: 'BrutusLeadSprinkler.png',
    confidence: 'datamine',
    note: 'Returning PoE1 unique reimagined for PoE2',
  },
  {
    name: "Serle's Grit",
    baseType: 'Kalguuran Forgehammer',
    itemClass: 'Two Hand Mace',
    reqLevel: 47,
    implicits: ['Has 3 Sockets'],
    explicits: [
      'Grants Skill: Level 19 Runic Tempering',
      'Adds 30 to 35 Physical Damage',
      '+31 to Strength',
      'Skills which Empower an Attack have 14% chance to not count that Attack',
      '113 to Physical Thorns damage per active Protective Rune',
      'Maximum Quality is 40%',
    ],
    confidence: 'datamine',
  },

  // ── Wand ──────────────────────────────────────────────────────
  {
    name: 'Liminal Coil',
    baseType: 'Twisted Wand',
    itemClass: 'Wand',
    reqLevel: 72,
    implicits: ['Grants Skill: Level 17 Coiling Bolts'],
    explicits: [
      '71% increased Spell Damage',
      '11% increased Cast Speed',
      'Magnitudes of Curses you inflict are zero',
      'Curses you inflict ignore Curse limit',
      'Spell Hits Gain 27% of Damage as Extra Chaos Damage per Curse on target',
      'Spell Hits Gain 27% of Damage as Extra Physical Damage per Curse on target',
    ],
    iconFile: 'LiminalCoil.png',
    confidence: 'datamine',
  },

  // ── Staff ─────────────────────────────────────────────────────
  {
    name: "The Raven's Flock",
    baseType: 'Perching Staff',
    itemClass: 'Staff',
    reqLevel: 78,
    implicits: ['Grants Skill: Level 18 Spiraling Conspiracy'],
    explicits: [
      '14% increased Cast Speed',
      '+24 to Intelligence',
      'Minions deal 111% increased Damage',
      'Minions have 12% chance to inflict Gruelling Madness on Hit',
      '34% increased Spirit Reservation Efficiency of Skills',
    ],
    iconFile: 'TheRavensFlock.png',
    confidence: 'datamine',
  },

  // ── Amulet ────────────────────────────────────────────────────
  {
    name: 'Eventide Petals',
    baseType: 'Veridical Chain',
    itemClass: 'Amulet',
    reqLevel: 78,
    implicits: [
      'Grants Skill: Level 18 Midnight Zenith',
      '+32 to maximum Runic Ward',
    ],
    explicits: [
      '32% increased Critical Hit Chance',
      '+26 to Intelligence',
      '49% increased Light Radius',
      'Ice Crystals have 2% increased maximum Life per 5% Cold Resistance you have',
    ],
    flavour: "Dannig sculpted the Verisium to evoke the night-blooming lotus of Middengard's stygian peaks, which grow only where ash meets the snow and stars.",
    iconFile: 'EventidePetals.png',
    confidence: 'datamine',
  },

  // ── Gloves ────────────────────────────────────────────────────
  {
    name: "Horror's Flight",
    baseType: 'Engraved Bracers',
    itemClass: 'Gloves',
    reqLevel: 78,
    implicits: ['Grants Skill: Level 18 Crushing Fear'],
    explicits: [
      '213% increased Evasion Rating',
      '14% increased Attack Speed',
      '+22 to Dexterity',
      'Adds 19 to 34 Chaos Damage to Attacks',
      'Gain 1 Fear Incarnate when you Cull a target',
    ],
    iconFile: 'HorrorsFlight.png',
    confidence: 'datamine',
  },

  // ── Body Armour ───────────────────────────────────────────────
  {
    name: 'The Unleashed',
    baseType: 'Revered Vestments',
    itemClass: 'Body Armour',
    reqLevel: 65,
    implicits: ['+1% to all Maximum Elemental Resistances'],
    explicits: [
      '183% increased Armour and Energy Shield',
      '100% increased Spell Damage',
      '+17 to Strength and Intelligence',
      '17% of Damage taken from Hits bypasses Energy Shield if Energy Shield is below half',
      'Lose all Runic Bindings when you Shapeshift to gain an equal amount of Unbound Potential',
      'Gain 1 Runic Binding on Hit with Spells, no more than once each second',
    ],
    confidence: 'datamine',
  },

  // ── Jewel ─────────────────────────────────────────────────────
  {
    name: 'Voices',
    baseType: 'Sapphire',
    itemClass: 'Jewel',
    implicits: [],
    explicits: ['Allocates 2 Sinister Jewel sockets'],
    iconFile: 'Voices.png',
    confidence: 'confirmed',
    note: 'Three versions confirmed in reveal stream: +2, +3, or +4 Sinister Jewel sockets. Each version occupies one jewel slot on the passive tree. The 4-socket version described as "absurdly lucky or rich."',
  },

  // ── Belts (no PoE2DB data yet) ────────────────────────────────
  {
    name: 'Mageblood',
    baseType: 'Heavy Belt',
    itemClass: 'Belt',
    implicits: [],
    explicits: [],
    confidence: 'confirmed',
    note: 'Confirmed return in 0.5.0 — full mod data not yet on PoE2DB as of 2026-05-10',
  },

  // ── Lineage Support — no PoE2DB page ──────────────────────────
  {
    name: "Vruun's Aftermath",
    baseType: 'Unknown',
    itemClass: 'Lineage Support',
    implicits: [],
    explicits: [],
    confidence: 'inferred',
    note: 'Lineage Support item — no PoE2DB page as of 2026-05-10',
  },
];
