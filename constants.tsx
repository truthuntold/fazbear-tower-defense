
import { Rarity, Character, Position, Difficulty, PotionType } from './types';

export const CHARACTERS: Record<string, Character> = {
  // COMMON
  'freddy': { id: 'freddy', name: 'Freddy Fazbear', rarity: Rarity.COMMON, damage: 12, range: 2.5, fireRate: 35, cost: 50, color: '#6d4c41', gameOrigin: 'FNAF 1', features: ['hat', 'ears', 'bowtie'] },
  'bonnie': { id: 'bonnie', name: 'Bonnie', rarity: Rarity.COMMON, damage: 8, range: 2, fireRate: 20, cost: 45, color: '#7986cb', gameOrigin: 'FNAF 1', features: ['ears_long', 'bowtie'] },
  'chica': { id: 'chica', name: 'Chica', rarity: Rarity.COMMON, damage: 18, range: 2.2, fireRate: 45, cost: 60, color: '#fff176', gameOrigin: 'FNAF 1', features: ['beak', 'bib'] },
  'foxy': { id: 'foxy', name: 'Foxy', rarity: Rarity.COMMON, damage: 6, range: 3.5, fireRate: 15, cost: 75, color: '#e57373', gameOrigin: 'FNAF 1', features: ['ears_pointed', 'eyepatch'] },
  'endo_01': { id: 'endo_01', name: 'Endo-01', rarity: Rarity.COMMON, damage: 10, range: 2.0, fireRate: 30, cost: 40, color: '#9e9e9e', gameOrigin: 'FNAF 1', features: ['wires'] },

  // UNCOMMON
  'toy_freddy': { id: 'toy_freddy', name: 'Toy Freddy', rarity: Rarity.UNCOMMON, damage: 25, range: 3, fireRate: 40, cost: 130, color: '#8d6e63', gameOrigin: 'FNAF 2', features: ['hat', 'ears', 'bowtie', 'cheeks'] },
  'toy_bonnie': { id: 'toy_bonnie', name: 'Toy Bonnie', rarity: Rarity.UNCOMMON, damage: 15, range: 2.5, fireRate: 20, cost: 120, color: '#4fc3f7', gameOrigin: 'FNAF 2', features: ['ears_long', 'bowtie', 'cheeks'] },
  'mangle': { id: 'mangle', name: 'Mangle', rarity: Rarity.UNCOMMON, damage: 20, range: 3.5, fireRate: 30, cost: 150, color: '#fce4ec', gameOrigin: 'FNAF 2', features: ['ears_pointed', 'withered', 'cheeks', 'wires'] },
  'balloon_boy': { id: 'balloon_boy', name: 'Balloon Boy', rarity: Rarity.UNCOMMON, damage: 2, range: 5, fireRate: 30, cost: 110, color: '#f44336', gameOrigin: 'FNAF 2', features: ['propeller', 'hat', 'cheeks', 'sign'], ability: 'slow' },

  // RARE
  'withered_freddy': { id: 'withered_freddy', name: 'Withered Freddy', rarity: Rarity.RARE, damage: 55, range: 3.2, fireRate: 60, cost: 350, color: '#5d4037', gameOrigin: 'FNAF 2', features: ['hat', 'ears', 'withered', 'bowtie'] },
  'puppet': { id: 'puppet', name: 'The Puppet', rarity: Rarity.RARE, damage: 40, range: 4.5, fireRate: 35, cost: 400, color: '#111111', gameOrigin: 'FNAF 2', features: ['mask', 'cheeks'] },
  'sparky': { id: 'sparky', name: 'Sparky the Dog', rarity: Rarity.RARE, damage: 70, range: 2.8, fireRate: 25, cost: 380, color: '#5d4037', gameOrigin: 'Hoax', features: ['ears_pointed', 'withered'] },

  // EPIC
  'springtrap': { id: 'springtrap', name: 'Springtrap', rarity: Rarity.EPIC, damage: 95, range: 3.5, fireRate: 45, cost: 900, color: '#7cb342', gameOrigin: 'FNAF 3', features: ['ears_long', 'withered', 'bowtie'] },
  'nightmare_fredbear': { id: 'nightmare_fredbear', name: 'Nightmare Fredbear', rarity: Rarity.EPIC, damage: 150, range: 4, fireRate: 55, cost: 1200, color: '#fbc02d', gameOrigin: 'FNAF 4', features: ['hat', 'ears', 'teeth', 'bowtie'] },
  'dreadbear': { id: 'dreadbear', name: 'Dreadbear', rarity: Rarity.EPIC, damage: 180, range: 3.2, fireRate: 70, cost: 1300, color: '#2e7d32', gameOrigin: 'Help Wanted', features: ['hat', 'ears', 'stitched', 'bolts'] },

  // LEGENDARY
  'circus_baby': { id: 'circus_baby', name: 'Circus Baby', rarity: Rarity.LEGENDARY, damage: 280, range: 4.5, fireRate: 50, cost: 2200, color: '#d32f2f', gameOrigin: 'Sister Location', features: ['pigtails', 'cheeks'] },
  'molten_freddy': { id: 'molten_freddy', name: 'Molten Freddy', rarity: Rarity.LEGENDARY, damage: 220, range: 5, fireRate: 30, cost: 2500, color: '#ef6c00', gameOrigin: 'FFPS', features: ['mask', 'wires', 'bowtie'] },
  'grimm_foxy': { id: 'grimm_foxy', name: 'Grimm Foxy', rarity: Rarity.LEGENDARY, damage: 190, range: 6, fireRate: 20, cost: 2800, color: '#ff3d00', gameOrigin: 'Curse of Dreadbear', features: ['ears_pointed', 'fire', 'hook'] },

  // MYTHIC
  'glitchtrap': { id: 'glitchtrap', name: 'Glitchtrap', rarity: Rarity.MYTHIC, damage: 450, range: 7, fireRate: 40, cost: 5500, color: '#ffeb3b', gameOrigin: 'Help Wanted', features: ['ears_long', 'suit', 'bowtie', 'vest'] },
  'shattered_roxanne': { id: 'shattered_roxanne', name: 'Shattered Roxanne', rarity: Rarity.MYTHIC, damage: 500, range: 5.5, fireRate: 25, cost: 6500, color: '#9c27b0', gameOrigin: 'Security Breach', features: ['ears_pointed', 'withered', 'hair'] },
  'the_blob': { id: 'the_blob', name: 'The Blob', rarity: Rarity.MYTHIC, damage: 350, range: 8, fireRate: 35, cost: 8000, color: '#424242', gameOrigin: 'Security Breach', features: ['wires', 'many_heads', 'mask'] },

  // SECRET
  'golden_freddy': { id: 'golden_freddy', name: 'Golden Freddy', rarity: Rarity.SECRET, damage: 1983, range: 12, fireRate: 120, cost: 10000, color: '#ffd600', gameOrigin: 'FNAF 1', features: ['hat', 'ears', 'ghostly', 'bowtie'] },
  'nightmarionne': { id: 'nightmarionne', name: 'Nightmarionne', rarity: Rarity.SECRET, damage: 850, range: 10, fireRate: 20, cost: 15000, color: '#0a0a0a', gameOrigin: 'FNAF 4', features: ['mask', 'long_limbs', 'stripes'], ability: 'slow' },
  'shadow_bonnie': { id: 'shadow_bonnie', name: 'Shadow Bonnie', rarity: Rarity.SECRET, damage: 1200, range: 6, fireRate: 15, cost: 20000, color: '#1a1a1a', gameOrigin: 'FNAF 2', features: ['ears_long', 'glitchy', 'teeth'] },
};

export const RARITY_ORDER: Rarity[] = [
  Rarity.COMMON,
  Rarity.UNCOMMON,
  Rarity.RARE,
  Rarity.EPIC,
  Rarity.LEGENDARY,
  Rarity.MYTHIC,
  Rarity.SECRET
];

export const DIFFICULTY_CONFIG = {
  [Difficulty.EASY]: { hpMult: 0.8, speedMult: 0.8, coinMult: 1.0 },
  [Difficulty.MEDIUM]: { hpMult: 1.0, speedMult: 1.0, coinMult: 1.5 },
  [Difficulty.HARD]: { hpMult: 1.5, speedMult: 1.2, coinMult: 2.5 },
  [Difficulty.EXTREME]: { hpMult: 2.5, speedMult: 1.4, coinMult: 4.0 },
  [Difficulty.BOSS_RUSH]: { hpMult: 5.0, speedMult: 0.6, coinMult: 6.0 },
};

export const RARITY_UPGRADE_SCALING: Record<Rarity, number> = {
  [Rarity.COMMON]: 1.2,
  [Rarity.UNCOMMON]: 1.3,
  [Rarity.RARE]: 1.5,
  [Rarity.EPIC]: 1.7,
  [Rarity.LEGENDARY]: 2.0,
  [Rarity.MYTHIC]: 2.5,
  [Rarity.SECRET]: 3.5,
};

export const RARITY_WEIGHTS: Record<Rarity, number> = {
  [Rarity.COMMON]: 500,
  [Rarity.UNCOMMON]: 250,
  [Rarity.RARE]: 120,
  [Rarity.EPIC]: 70,
  [Rarity.LEGENDARY]: 40,
  [Rarity.MYTHIC]: 15,
  [Rarity.SECRET]: 5,
};

export const RARITY_COLORS: Record<Rarity, string> = {
  [Rarity.COMMON]: '#9e9e9e',
  [Rarity.UNCOMMON]: '#4caf50',
  [Rarity.RARE]: '#2196f3',
  [Rarity.EPIC]: '#9c27b0',
  [Rarity.LEGENDARY]: '#ff9800',
  [Rarity.MYTHIC]: '#f44336',
  [Rarity.SECRET]: '#ffd700',
};

export const POTION_DATA = {
  [PotionType.LUCK]: {
    baseCost: 250,
    tiers: {
      1: { multiplier: 1.2, duration: 30000 },
      2: { multiplier: 1.5, duration: 60000 },
      3: { multiplier: 2.5, duration: 120000 },
    }
  },
  [PotionType.MONEY]: {
    baseCost: 350,
    tiers: {
      1: { multiplier: 1.5, duration: 60000 },
      2: { multiplier: 2.0, duration: 120000 },
      3: { multiplier: 4.0, duration: 240000 },
    }
  },
  [PotionType.SPEED]: {
    baseCost: 200,
    tiers: {
      1: { multiplier: 0.7, duration: 30000 },
      2: { multiplier: 0.4, duration: 60000 },
      3: { multiplier: 0.1, duration: 120000 },
    }
  }
};

export const DOUBLE_ROLL_COST = 200;
export const TRIPLE_ROLL_COST = 300;
export const MAX_LEVEL = 10;
export const VICTORY_WAVE = 15;

export const PATH: Position[] = [
  { x: 0, y: 5 },
  { x: 3, y: 5 },
  { x: 3, y: 2 },
  { x: 8, y: 2 },
  { x: 8, y: 8 },
  { x: 5, y: 8 },
  { x: 5, y: 11 },
  { x: 11, y: 11 },
];

export const GRID_SIZE = 12;
export const FAZ_COIN_DROP = 15;
export const STARTING_HEALTH = 20;
export const STARTING_COINS = 500;
export const GACHA_COST = 100;
export const PREP_TIME_SECONDS = 10;
