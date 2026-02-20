
export interface Character {
  id: string;
  name: string;
  class: string;
  subclass: string;
  level: number;
  background: string;
  race: string;
  playerName: string;
  alignment: string;
  xp: number;
  attributes: {
    str: number;
    dex: number;
    con: number;
    int: number;
    wis: number;
    cha: number;
  };
  skills: Record<string, boolean>;
  saves: Record<string, boolean>;
  hp: { current: number; max: number; temp: number };
  hitDice: { current: number; max: string };
  deathSaves: { successes: number; failures: number };
  ac: number;
  speed: string;
  initiative: number;
  inventory: string;
  bio: {
    traits: string;
    ideals: string;
    bonds: string;
    flaws: string;
    backstory: string;
    features: string;
  };
  spells: {
    slots: boolean[][];
    known: string;
    castingStat: string;
  };
  wallet: { cp: number; sp: number; ep: number; gp: number; pp: number };
  customWeapons?: { n: string; dmg: string; prop: string }[];
  customSpells?: { name: string; level: string; desc: string }[];
  feats?: string[];
  autoHp?: boolean;
  autoAc?: boolean;
  equippedArmor?: string;
  equippedShield?: string;
  stealthDisadvantage?: boolean;
  exhaustion: number;
  imageUrl?: string;
  // Propriedades para Token Multi-tile
  width?: number; 
  height?: number;
}

export interface Monster {
  id: number;
  name: string;
  type: string;
  cr: string;
  ac: number;
  hp: number;
  speed: string;
  actions: { n: string; hit: number; dmg: string }[];
  traits?: { n: string; d: string }[];
  spells?: string[];
  imageUrl?: string;
  description?: string;
  // Monstros também podem ter tamanho padrão no futuro, mas por enquanto default é 1x1
  width?: number;
  height?: number;
  // Atributos opcionais
  attributes?: { str: number; dex: number; con: number; int: number; wis: number; cha: number; };
}

export interface EncounterParticipant extends Monster {
  uid: number;
  hpCurrent: number;
  hpMax: number;
  initiative: number;
  conditions: string[];
  linkedCharId?: string;
  imageUrl?: string;
  attributes?: { str: number; dex: number; con: number; int: number; wis: number; cha: number; };
}

export interface MapTile {
  c: string; // char/emoji
  r: number; // rotation
  t: 'base' | 'obj'; // type
}

export interface Token {
  id: number;
  x: number;
  y: number;
  icon: string;
  image?: string;
  hp: number;
  max: number;
  color: string;
  size: number;
  // Multi-tile
  width?: number; 
  height?: number;
  name?: string;
  ac?: number;
  isProp?: boolean;
  // Background Layer
  isBackground?: boolean;
  locked?: boolean;
  markers?: string[];
  rotation?: number;
  flipX?: boolean;
  flipY?: boolean;
  linkedId?: string | number;
  linkedType?: 'character' | 'monster';
  auraRadius?: number;
  auraColor?: string;
}

export interface MapConfig {
    scale: number;
    unit: string;
    gridColor: string;
    gridOpacity: number;
    gridStyle: 'line' | 'dot';
    tileSize?: number;
    bgUrl: string | null;
    bgX: number;
    bgY: number;
    bgScale: number;
    weather?: 'none' | 'rain' | 'snow' | 'ember' | 'fog';
}

export type AppMode = 'SHEET' | 'DM' | 'VTT' | 'CHAT' | 'NPC' | 'GM_DASHBOARD';

export interface LogEntry {
  id: number;
  title: string;
  details: string;
  timestamp: Date;
  type: 'info' | 'combat' | 'dice' | 'crit' | 'fail' | 'magic';
  author?: string;
}

export interface ChatMessage {
  id: string;
  author: string;
  text: string;
  timestamp: number;
  isSystem?: boolean;
}

export interface AudioTrack {
    id: string;
    name: string;
    url: string;
    volume: number;
    loop: boolean;
    isPlaying: boolean;
    category: 'music' | 'ambience' | 'sfx';
}

export interface CampaignData {
  version: string;
  timestamp: number;
  name?: string;
  password?: string;
  characters: Character[];
  npcs?: Character[];
  encounter: EncounterParticipant[];
  logs: LogEntry[];
  map: {
    grid: string[][];
    tokens: Token[];
    fog?: boolean[][];
    weather?: 'none' | 'rain' | 'snow' | 'ember' | 'fog';
    config?: Partial<MapConfig>;
  };
  monsters?: Monster[];
  combat?: {
    turnIndex: number;
    targetUid: number | null;
    round?: number; // Novo campo
  };
  notes?: string;
  lastUpdate?: number;
}