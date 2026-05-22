import type { ConfidenceTier } from './sources';

export interface KalguuranSkill {
  name: string;
  tags: string[];
  cost: string;
  castTime?: string;
  cooldown?: string;
  description: string;
  keyStats: string[];
  confidence: ConfidenceTier;
}

export const kalguuranSkills: KalguuranSkill[] = [
  {
    name: 'Triskelion Cascade',
    tags: ['Spell', 'Buff', 'Duration'],
    cost: '20 Ward',
    castTime: '0.45s',
    cooldown: '1s base + 800% of empowered skill cast time',
    description: "Tap into the Triskelion Flame to Empower the next area spell you cast. The Empowered Spell centres on your location and targets six additional areas in a Triskelion pattern.",
    keyStats: [
      '800% of Empowered Skill\'s cast time added to cooldown',
      'Empowered Skill has 40% less area of effect',
      'Empowered Skill deals 30% less damage',
      'Maximum Buff duration 4 seconds',
    ],
    confidence: 'confirmed',
  },
  {
    name: 'Frostflame Nova',
    tags: ['Spell', 'AoE'],
    cost: '93 Ward',
    description: 'Wave that leeches onto Ignited enemies, converting the leech into simultaneous freeze and burn.',
    keyStats: [
      'Leeches onto Ignited enemies',
      'Converts leech to simultaneous freeze + burn',
    ],
    confidence: 'confirmed',
  },
  {
    name: 'Hollow Shell',
    tags: ['Spell', 'Buff', 'AoE', 'Nova'],
    cost: '100% of Runic Ward',
    castTime: '0.60s',
    description: 'Sacrifice your Runic Ward to send out an energy pulse that grants nearby Allies Guard.',
    keyStats: [
      'Spends 100% of Runic Ward',
      'Allies gain Guard equal to 35% of Ward spent',
      '3 metre pulse radius',
      '6 second Guard duration',
    ],
    confidence: 'confirmed',
  },
  {
    name: 'Mark of Repulsion',
    tags: ['Spell', 'Mark'],
    cost: '15 Ward',
    description: 'Apply a mark that triggers an explosion and knockback when the enemy reaches the ailment threshold.',
    keyStats: [
      'Triggers explosion + knockback at 200% ailment threshold',
    ],
    confidence: 'confirmed',
  },
];

export const kalguuranContext = {
  totalNewSkills: '25+',
  confidence: 'confirmed' as ConfidenceTier,
  loreNote: 'Kalguuran skills draw on Ward as a resource rather than Mana, using the Runic Ward mechanic introduced with the Runes of Aldur league.',
};
