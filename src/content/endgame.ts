import type { ConfidenceTier } from './sources';

export interface EndgameMechanic {
  id: string;
  name: string;
  category: 'league' | 'existing' | 'new' | 'rework';
  shortDesc: string;
  details: string[];
  bosses?: string[];
  access?: string;
  confidence: ConfidenceTier;
  note?: string;
}

export const endgameMechanics: EndgameMechanic[] = [
  {
    id: 'ocean-expedition',
    name: 'Ocean Expedition (Kalguuran Tomb)',
    category: 'new',
    shortDesc: 'Collect Runic Splinters from expedition encounters, then spend 50 at the Realmgate to enter the Kalguuran Tomb.',
    details: [
      'Runic Splinters drop from expedition encounters (stack to 300)',
      'Spend 50 Runic Splinters at the Realmgate to access Kalguuran Tomb',
      'Separate from classic Expedition (which uses Exotic Coinage and existing faction NPCs)',
      'Expedition areas include: Kalguuran Tomb, Barren Atoll, Bleached Shoals, Lush Isle, Frigid Bluffs, Scorched Cay, Smuggler\'s Den, Hidden Aquifer, Sulphur Mines',
    ],
    bosses: ['Medved (named boss)', 'Uhtred, the Stardrinker (pinnacle)'],
    confidence: 'confirmed',
    note: 'Do not confuse with classic Expedition (Dannig/Gwennen/Rog/Tujen factions). Uhtred, Covetous Traitor is the EXISTING Rog-faction boss.',
  },
  {
    id: 'delirium',
    name: 'Delirium — The Raven and the Hare',
    category: 'rework',
    shortDesc: 'Expanded Delirium system with depth bar, mirror shards, and a new pinnacle boss Tangmazu.',
    details: [
      'Official name is "The Raven and the Hare" (brief incorrectly said "The Hare and the Raven")',
      'Depth bar accumulates as you push further into Delirium',
      'Purple mirror shards and red mirror shards',
      'Grand Mirror fruit crafting item',
      'Simulacrum trigger via Simulacrum Splinter (stack 300)',
      'Tangmazu is the new pinnacle boss — drops Tangmazu\'s Reliquary Key',
      'Potent Emotions jewel crafting',
      '20+ instilled notables',
    ],
    bosses: ['Tangmazu (new pinnacle)'],
    confidence: 'confirmed',
  },
  {
    id: 'breach',
    name: 'Breach — Waking the Dreamer',
    category: 'rework',
    shortDesc: 'Tul and Esh now gate access to Xesht (pinnacle). New Genesis Tree crafting system uses Wombgifts from Hiveborn enemies.',
    details: [
      'Official name is "Waking the Dreamer"',
      'Tul and Esh are NOT the pinnacle — they are gatekeepers to Xesht',
      'Xesht remains the Breach pinnacle boss',
      'Breachstones and Breach Splinters (stack 300) used for access',
      'Marshal of Xesht — elite Hiveborn variant; the most dangerous foe Breach can spawn; drops Wombgifts',
      'Genesis Tree crafting: deposit Wombgifts harvested from Hiveborn enemies, fertilise with Hiveblood to birth random rare jewellery (amulets, belts, rings) or eventually Breachstones',
      'Atlas nodes available to control which Wombgift types you receive from Breach encounters',
    ],
    bosses: ['Tul (gatekeeper)', 'Esh (gatekeeper)', 'Xesht (pinnacle)', 'Marshal of Xesht (elite Hiveborn)'],
    confidence: 'confirmed',
  },
  {
    id: 'ritual',
    name: 'Ritual — An Audience with the King',
    category: 'rework',
    shortDesc: 'Expanded Ritual with a full quest line through the Wildwood, a new pinnacle boss, and a light/darkness arena mechanic.',
    details: [
      '"An Audience with the King" is the fragment item name — right-clicking creates 100 Petition Splinters',
      'Djinn Barya remains the Trial of Sekhemas access item (separate system)',
      'Aoife — a lost spirit — appears after your first Endgame Ritual and guides you into the Wildwood',
      'Inside the Wildwood, spirits can take physical form; Aoife has been bound there by the King in the Mists',
      'Ritual quest line: follow Aoife\'s guidance through the Wildwood, reach and kill the King in the Mists, free Aoife',
      'Pinnacle boss fight takes place underground with a light/darkness mechanic — bring spirit entities to interact with the light',
      'The King in the Mists is repositioned from a campaign side boss to the Ritual pinnacle (with entirely new skills)',
    ],
    bosses: ["The King's Bride", "The King in the Mists (pinnacle, new skills)"],
    access: '"An Audience with the King" fragment (creates 100 Petition Splinters)',
    confidence: 'confirmed',
    note: 'Brief referred to this as "Audience with the Queen" — correct name is "An Audience with the King". Aoife is the Ritual quest NPC.',
  },
  {
    id: 'abyss',
    name: 'Abyss — Well of Souls',
    category: 'rework',
    shortDesc: 'Kulemak, a new entity, is the Abyss pinnacle — accessed via Kulemak\'s Invitation to the Well of Souls.',
    details: [
      'Kulemak is the entity behind the Well of Souls',
      'Accessed via "Kulemak\'s Invitation" item',
      'Kulemak summons Abyss commanders Amanamu, Kurgal, and Ulaman during the fight',
      'Has an uber form (confirmed via voice lines)',
      '"Something awaits you in the Well" — Kulemak\'s Invitation flavour text',
    ],
    bosses: ['Kulemak (pinnacle)', 'Amanamu', 'Kurgal', 'Ulaman'],
    access: "Kulemak's Invitation",
    confidence: 'confirmed',
  },
  {
    id: 'atlas',
    name: 'Atlas Tree',
    category: 'new',
    shortDesc: '400+ node Atlas passive skill tree.',
    details: [
      '400+ nodes confirmed',
      'Full Atlas tree not yet in PoE2DB',
    ],
    confidence: 'confirmed',
  },
  {
    id: 'challenges',
    name: 'Challenges System',
    category: 'new',
    shortDesc: 'First challenge system in PoE2 — 8 challenges rewarding the Knight of Aldur Armour Set with progressive unlocks.',
    details: [
      '8 challenges total',
      'Reward: Knight of Aldur Armour Set — pieces unlock progressively (first piece at 2 challenges, full set at 8)',
      'Completing all 8 challenges also rewards a hideout statue',
      'First ever challenge system in Path of Exile 2',
    ],
    confidence: 'confirmed',
  },
];
