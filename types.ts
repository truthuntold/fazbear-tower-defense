
export enum Rarity {
  COMMON = 'Common',
  UNCOMMON = 'Uncommon',
  RARE = 'Rare',
  EPIC = 'Epic',
  LEGENDARY = 'Legendary',
  MYTHIC = 'Mythic',
  SECRET = 'Secret'
}

export enum Difficulty {
  EASY = 'Easy',
  MEDIUM = 'Medium',
  HARD = 'Hard',
  EXTREME = 'Extreme',
  BOSS_RUSH = 'Boss Rush'
}

export enum PotionType {
  LUCK = 'Luck',
  MONEY = 'Money',
  SPEED = 'Speed'
}

export interface Potion {
  type: PotionType;
  tier: 1 | 2 | 3;
}

export interface ActiveEffect {
  type: PotionType;
  multiplier: number;
  endTime: number;
}

export interface Character {
  id: string;
  name: string;
  rarity: Rarity;
  damage: number;
  range: number;
  fireRate: number;
  cost: number;
  color: string;
  ability?: string;
  gameOrigin: string;
  features: string[];
}

export interface Position {
  x: number;
  y: number;
}

export interface PlacedTower {
  id: string;
  characterId: string;
  pos: Position;
  lastFired: number;
  level: number;
  targetId?: string;
}

export interface Projectile {
  id: string;
  start: Position;
  end: Position;
  startTime: number;
  duration: number;
  color: string;
}

export interface Enemy {
  id: string;
  type: 'Human' | 'Zombie' | 'Boss' | 'Phantom' | 'Nightmare' | 'Stitchwraith';
  maxHp: number;
  hp: number;
  speed: number;
  originalSpeed: number;
  positionIndex: number;
  lerpFactor: number;
  slowTimer: number;
}

export interface GameState {
  health: number;
  fazCoins: number;
  wave: number;
  isWaveActive: boolean;
  isPrepPhase: boolean;
  prepTimeRemaining: number;
  inventory: string[];
  potions: Record<string, number>;
  activeEffects: ActiveEffect[];
  placedTowers: PlacedTower[];
  enemies: Enemy[];
  projectiles: Projectile[];
  selectedTowerId: string | null;
  selectedPlacedTowerId: string | null;
  difficulty: Difficulty | null;
  isDifficultySelected: boolean;
  autoSellSettings: Record<Rarity, boolean>;
  gameSpeed: number;
  purchasedSpeeds: number[]; // [1, 2, 3]
  hasWon: boolean;
  isGameOver: boolean;
  autoSkipPrep: boolean;
}
