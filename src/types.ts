
export interface Character {
  id: string; // Identificador único para controle do React
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
  skills: Record<string, boolean>; // proficiencies
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
    slots: boolean[][]; // [level][slotIndex]
    known: string;
    castingStat: string;
  };
  wallet: { cp: number; sp: number; ep: number; gp: number; pp: number };
  // Campos para itens personalizados salvos
  customWeapons?: { n: string; dmg: string; prop: string }[];
  customSpells?: { name: string; level: string; desc: string }[];
  feats?: string[]; // Novo campo para Talentos
  autoHp?: boolean;
  autoAc?: boolean;
  equippedArmor?: string;
  equippedShield?: string;
  stealthDisadvantage?: boolean;
  exhaustion: number;
  imageUrl?: string; // URL ou Base64 da imagem do personagem
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
  traits?: { n: string; d: string }[]; // Abilities/Passive
  spells?: string[]; // List of spell names or descriptions
}

export interface EncounterParticipant extends Monster {
  uid: number; // Unique instance ID
  hpCurrent: number;
  hpMax: number;
  initiative: number;
  conditions: string[];
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
  image?: string; // URL ou Base64 da imagem personalizada
  hp: number;
  max: number;
  color: string;
  size: number; // Backward compatibility
  width?: number;
  height?: number;
  name?: string;
  ac?: number;
  isProp?: boolean; // Se true, renderiza sem fundo, borda ou nome (estilo cenário)
  markers?: string[]; // Cores de status (ex: ['red', 'blue'])
  rotation?: number; // 0, 90, 180, 270
  flipX?: boolean;
  flipY?: boolean;
  // Novos campos para vínculo de ficha
  linkedId?: string | number; // ID do Personagem ou Monstro
  linkedType?: 'character' | 'monster';
  // Novos campos de Aura
  auraRadius?: number; // Em metros/unidades do grid
  auraColor?: string;
}

export interface MapConfig {
    scale: number;
    unit: string;
    gridColor: string;
    gridOpacity: number;
    gridStyle: 'line' | 'dot';
    tileSize?: number; // Nova propriedade para resolução em pixels
    bgUrl: string | null;
    bgX: number;
    bgY: number;
    bgScale: number;
    weather?: 'none' | 'rain' | 'snow' | 'ember' | 'fog';
}

export type AppMode = 'SHEET' | 'DM' | 'VTT' | 'CHAT' | 'NPC';

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

export interface CampaignData {
  version: string;
  timestamp: number;
  name?: string; // Campaign Display Name
  password?: string; // Optional Password
  characters: Character[];
  npcs?: Character[]; // Novo campo para NPCs
  encounter: EncounterParticipant[];
  logs: LogEntry[];
  map: {
    grid: string[][];
    tokens: Token[];
    fog?: boolean[][];
    weather?: 'none' | 'rain' | 'snow' | 'ember' | 'fog'; // Novo campo de clima
    config?: Partial<MapConfig>;
  };
  // Adicionado para suportar monstros customizados salvos
  monsters?: Monster[];
  combat?: {
    turnIndex: number;
    targetUid: number | null;
  };
  notes?: string;
}
