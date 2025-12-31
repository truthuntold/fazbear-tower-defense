
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
  'withered_bonnie': { id: 'withered_bonnie', name: 'Withered Bonnie', rarity: Rarity.RARE, damage: 60, range: 3.0, fireRate: 55, cost: 360, color: '#3f51b5', gameOrigin: 'FNAF 2', features: ['ears_long', 'withered', 'bowtie', 'faceless'] },
  'withered_chica': { id: 'withered_chica', name: 'Withered Chica', rarity: Rarity.RARE, damage: 65, range: 2.8, fireRate: 50, cost: 370, color: '#fbc02d', gameOrigin: 'FNAF 2', features: ['beak', 'withered', 'bib', 'wide_jaw'] },
  'phantom_freddy': { id: 'phantom_freddy', name: 'Phantom Freddy', rarity: Rarity.RARE, damage: 45, range: 4.0, fireRate: 40, cost: 320, color: '#3e2723', gameOrigin: 'FNAF 3', features: ['hat', 'ears', 'ghostly', 'burnt'] },
  'phantom_foxy': { id: 'phantom_foxy', name: 'Phantom Foxy', rarity: Rarity.RARE, damage: 40, range: 4.2, fireRate: 35, cost: 330, color: '#bf360c', gameOrigin: 'FNAF 3', features: ['ears_pointed', 'ghostly', 'burnt', 'hook'] },
  'phantom_bb': { id: 'phantom_bb', name: 'Phantom BB', rarity: Rarity.RARE, damage: 15, range: 5.0, fireRate: 25, cost: 300, color: '#3e2723', gameOrigin: 'FNAF 3', features: ['propeller', 'ghostly', 'burnt'], ability: 'slow' },
  'puppet': { id: 'puppet', name: 'The Puppet', rarity: Rarity.RARE, damage: 40, range: 4.5, fireRate: 35, cost: 400, color: '#111111', gameOrigin: 'FNAF 2', features: ['mask', 'cheeks'] },
  'sparky': { id: 'sparky', name: 'Sparky the Dog', rarity: Rarity.RARE, damage: 70, range: 2.8, fireRate: 25, cost: 380, color: '#5d4037', gameOrigin: 'Hoax', features: ['ears_pointed', 'withered'] },
  'trash_and_the_gang': { id: 'trash_and_the_gang', name: 'Trash & Gang', rarity: Rarity.RARE, damage: 25, range: 3.0, fireRate: 10, cost: 200, color: '#757575', gameOrigin: 'FFPS', features: ['wires', 'glitchy'] },

  // EPIC
  'springtrap': { id: 'springtrap', name: 'Springtrap', rarity: Rarity.EPIC, damage: 95, range: 3.5, fireRate: 45, cost: 900, color: '#7cb342', gameOrigin: 'FNAF 3', features: ['ears_long', 'withered', 'bowtie'] },
  'nightmare_fredbear': { id: 'nightmare_fredbear', name: 'Nightmare Fredbear', rarity: Rarity.EPIC, damage: 150, range: 4, fireRate: 55, cost: 1200, color: '#fbc02d', gameOrigin: 'FNAF 4', features: ['hat', 'ears', 'teeth', 'bowtie'] },
  'nightmare_bonnie': { id: 'nightmare_bonnie', name: 'Nightmare Bonnie', rarity: Rarity.EPIC, damage: 110, range: 3.8, fireRate: 50, cost: 950, color: '#304ffe', gameOrigin: 'FNAF 4', features: ['ears_long', 'teeth', 'withered', 'bowtie'] },
  'nightmare_chica': { id: 'nightmare_chica', name: 'Nightmare Chica', rarity: Rarity.EPIC, damage: 115, range: 3.6, fireRate: 48, cost: 980, color: '#ffeb3b', gameOrigin: 'FNAF 4', features: ['beak', 'teeth', 'withered', 'bib'] },
  'nightmare_foxy': { id: 'nightmare_foxy', name: 'Nightmare Foxy', rarity: Rarity.EPIC, damage: 105, range: 4.2, fireRate: 45, cost: 920, color: '#d32f2f', gameOrigin: 'FNAF 4', features: ['ears_pointed', 'teeth', 'withered', 'hook'] },
  'funtime_freddy': { id: 'funtime_freddy', name: 'Funtime Freddy', rarity: Rarity.EPIC, damage: 130, range: 3.8, fireRate: 42, cost: 1100, color: '#f3e5f5', gameOrigin: 'Sister Location', features: ['hat', 'ears', 'bowtie', 'bonbon'] },
  'funtime_foxy': { id: 'funtime_foxy', name: 'Funtime Foxy', rarity: Rarity.EPIC, damage: 125, range: 4.0, fireRate: 40, cost: 1050, color: '#f8bbd0', gameOrigin: 'Sister Location', features: ['ears_pointed', 'bowtie', 'cheeks'] },
  'dreadbear': { id: 'dreadbear', name: 'Dreadbear', rarity: Rarity.EPIC, damage: 180, range: 3.2, fireRate: 70, cost: 1300, color: '#2e7d32', gameOrigin: 'Help Wanted', features: ['hat', 'ears', 'stitched', 'bolts'] },
  'jack_o_bonnie': { id: 'jack_o_bonnie', name: 'Jack-O-Bonnie', rarity: Rarity.EPIC, damage: 140, range: 3.8, fireRate: 52, cost: 1150, color: '#ff6d00', gameOrigin: 'FNAF 4', features: ['ears_long', 'fire', 'teeth'] },
  'jack_o_chica': { id: 'jack_o_chica', name: 'Jack-O-Chica', rarity: Rarity.EPIC, damage: 145, range: 3.6, fireRate: 50, cost: 1180, color: '#ff6d00', gameOrigin: 'FNAF 4', features: ['beak', 'fire', 'teeth', 'bib'] },
  'ballora': { id: 'ballora', name: 'Ballora', rarity: Rarity.EPIC, damage: 100, range: 5.0, fireRate: 30, cost: 1000, color: '#512da8', gameOrigin: 'Sister Location', features: ['hair', 'closed_eyes', 'skirt'] },

  // LEGENDARY
  'circus_baby': { id: 'circus_baby', name: 'Circus Baby', rarity: Rarity.LEGENDARY, damage: 280, range: 4.5, fireRate: 50, cost: 2200, color: '#d32f2f', gameOrigin: 'Sister Location', features: ['pigtails', 'cheeks'] },
  'molten_freddy': { id: 'molten_freddy', name: 'Molten Freddy', rarity: Rarity.LEGENDARY, damage: 220, range: 5, fireRate: 30, cost: 2500, color: '#ef6c00', gameOrigin: 'FFPS', features: ['mask', 'wires', 'bowtie'] },
  'grimm_foxy': { id: 'grimm_foxy', name: 'Grimm Foxy', rarity: Rarity.LEGENDARY, damage: 190, range: 6, fireRate: 20, cost: 2800, color: '#ff3d00', gameOrigin: 'Curse of Dreadbear', features: ['ears_pointed', 'fire', 'hook'] },
  'lefty': { id: 'lefty', name: 'Lefty', rarity: Rarity.LEGENDARY, damage: 240, range: 4.2, fireRate: 45, cost: 2300, color: '#212121', gameOrigin: 'FFPS', features: ['hat', 'ears', 'bowtie', 'missing_eye'] },
  'ennard': { id: 'ennard', name: 'Ennard', rarity: Rarity.LEGENDARY, damage: 260, range: 4.8, fireRate: 40, cost: 2400, color: '#bdbdbd', gameOrigin: 'Sister Location', features: ['mask', 'wires', 'hat_tiny'] },
  'scrap_baby': { id: 'scrap_baby', name: 'Scrap Baby', rarity: Rarity.LEGENDARY, damage: 290, range: 4.0, fireRate: 55, cost: 2600, color: '#d84315', gameOrigin: 'FFPS', features: ['pigtails', 'withered', 'claw'] },
  'scraptrap': { id: 'scraptrap', name: 'Scraptrap', rarity: Rarity.LEGENDARY, damage: 270, range: 4.0, fireRate: 50, cost: 2550, color: '#827717', gameOrigin: 'FFPS', features: ['ears_long', 'withered', 'bone'] },
  'montgomery_gator': { id: 'montgomery_gator', name: 'Montgomery Gator', rarity: Rarity.LEGENDARY, damage: 250, range: 3.5, fireRate: 60, cost: 2450, color: '#2e7d32', gameOrigin: 'Security Breach', features: ['glasses', 'tail', 'mohawk'] },
  'roxanne_wolf': { id: 'roxanne_wolf', name: 'Roxanne Wolf', rarity: Rarity.LEGENDARY, damage: 245, range: 4.5, fireRate: 45, cost: 2400, color: '#9e9e9e', gameOrigin: 'Security Breach', features: ['ears_pointed', 'hair', 'cheeks'] },
  'glamrock_chica': { id: 'glamrock_chica', name: 'Glamrock Chica', rarity: Rarity.LEGENDARY, damage: 255, range: 4.0, fireRate: 50, cost: 2420, color: '#ffffff', gameOrigin: 'Security Breach', features: ['beak', 'bow', 'earrings'] },

  // MYTHIC
  'glitchtrap': { id: 'glitchtrap', name: 'Glitchtrap', rarity: Rarity.MYTHIC, damage: 450, range: 7, fireRate: 40, cost: 5500, color: '#ffeb3b', gameOrigin: 'Help Wanted', features: ['ears_long', 'suit', 'bowtie', 'vest'] },
  'shattered_roxanne': { id: 'shattered_roxanne', name: 'Shattered Roxanne', rarity: Rarity.MYTHIC, damage: 500, range: 5.5, fireRate: 25, cost: 6500, color: '#9c27b0', gameOrigin: 'Security Breach', features: ['ears_pointed', 'withered', 'hair'] },
  'the_blob': { id: 'the_blob', name: 'The Blob', rarity: Rarity.MYTHIC, damage: 350, range: 8, fireRate: 35, cost: 8000, color: '#424242', gameOrigin: 'Security Breach', features: ['wires', 'many_heads', 'mask'] },
  'nightmare': { id: 'nightmare', name: 'Nightmare', rarity: Rarity.MYTHIC, damage: 550, range: 5.0, fireRate: 60, cost: 6000, color: '#000000', gameOrigin: 'FNAF 4', features: ['hat', 'ears', 'teeth', 'transparent'] },
  'music_man': { id: 'music_man', name: 'Music Man', rarity: Rarity.MYTHIC, damage: 400, range: 6.0, fireRate: 50, cost: 5800, color: '#fbe9e7', gameOrigin: 'FFPS', features: ['cymbals', 'many_legs', 'teeth'] },
  'dj_music_man': { id: 'dj_music_man', name: 'DJ Music Man', rarity: Rarity.MYTHIC, damage: 600, range: 9.0, fireRate: 20, cost: 7000, color: '#1a1a1a', gameOrigin: 'Security Breach', features: ['headphones', 'many_legs', 'huge'] },
  'nightmare_bb': { id: 'nightmare_bb', name: 'Nightmare BB', rarity: Rarity.MYTHIC, damage: 380, range: 6.5, fireRate: 45, cost: 5600, color: '#d84315', gameOrigin: 'FNAF 4', features: ['propeller', 'teeth', 'long_fingers'] },
  'old_man_consequences': { id: 'old_man_consequences', name: 'Old Man C.', rarity: Rarity.MYTHIC, damage: 420, range: 10.0, fireRate: 15, cost: 5900, color: '#b71c1c', gameOrigin: 'UCN', features: ['8bit', 'fishing_rod'] },

  // SECRET
  'golden_freddy': { id: 'golden_freddy', name: 'Golden Freddy', rarity: Rarity.SECRET, damage: 1983, range: 12, fireRate: 120, cost: 10000, color: '#ffd600', gameOrigin: 'FNAF 1', features: ['hat', 'ears', 'ghostly', 'bowtie'] },
  'nightmarionne': { id: 'nightmarionne', name: 'Nightmarionne', rarity: Rarity.SECRET, damage: 850, range: 10, fireRate: 20, cost: 15000, color: '#0a0a0a', gameOrigin: 'FNAF 4', features: ['mask', 'long_limbs', 'stripes'], ability: 'slow' },
  'shadow_bonnie': { id: 'shadow_bonnie', name: 'Shadow Bonnie', rarity: Rarity.SECRET, damage: 1200, range: 6, fireRate: 15, cost: 20000, color: '#1a1a1a', gameOrigin: 'FNAF 2', features: ['ears_long', 'glitchy', 'teeth'] },
  'shadow_freddy': { id: 'shadow_freddy', name: 'Shadow Freddy', rarity: Rarity.SECRET, damage: 1150, range: 7, fireRate: 25, cost: 18000, color: '#4a148c', gameOrigin: 'FNAF 2', features: ['hat', 'ears', 'ghostly'] },
  'dee_dee': { id: 'dee_dee', name: 'Dee Dee', rarity: Rarity.SECRET, damage: 777, range: 15, fireRate: 10, cost: 12000, color: '#e91e63', gameOrigin: 'UCN', features: ['propeller', 'fishing_rod', 'annoying'] },
  'plushtrap': { id: 'plushtrap', name: 'Plushtrap', rarity: Rarity.SECRET, damage: 999, range: 4.0, fireRate: 30, cost: 14000, color: '#827717', gameOrigin: 'FNAF 4', features: ['ears_long', 'teeth', 'tiny'] },
  'lolbit': { id: 'lolbit', name: 'Lolbit', rarity: Rarity.SECRET, damage: 1337, range: 20, fireRate: 5, cost: 25000, color: '#ff6f00', gameOrigin: 'Sister Location', features: ['ears_pointed', 'glitchy', 'screen'] },
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
