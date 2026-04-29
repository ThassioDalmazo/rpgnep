
export interface ImageConfig {
  x: number;
  y: number;
  scale: number;
  rotation?: number;
}

export interface ClassInfo {
  name: string;
  subclass: string;
  level: number;
}

export interface Character {
  id: string;
  name: string;
  class: string;
  subclass: string;
  level: number;
  classes?: ClassInfo[]; // Optional for backward compatibility, will be initialized
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
    pact?: {
      current: number;
      max: number;
      level: number;
    };
  };
  wallet: { cp: number; sp: number; ep: number; gp: number; pp: number };
  customWeapons?: { n: string; dmg: string; prop: string }[];
  customSpells?: { 
    name: string; 
    level: string; 
    desc: string;
    school?: string;
    castingTime?: string;
    range?: string;
    components?: string;
    duration?: string;
    concentration?: boolean;
  }[];
  feats?: string[];
  autoHp?: boolean;
  autoAc?: boolean;
  equippedArmor?: string;
  equippedShield?: string;
  stealthDisadvantage?: boolean;
  exhaustion: number;
  inspiration?: boolean;
  conditions?: string[];
  imageUrl?: string;
  imageConfig?: ImageConfig;
  essence?: string;
  drops?: string;
  spellList?: SpellEntry[];
  // Propriedades para Token Multi-tile
  width?: number; 
  height?: number;
  inventoryList?: InventoryItem[];
  // Novos campos para Essências
  equippedEssences?: string[]; // Nomes das essências equipadas
  essenceInventory?: string[];  // Nomes das essências coletadas
  guildRank?: number;          // Rank da Guilda para cálculo de slots
}

export interface Essence {
  id: string;
  name: string;
  monsterSource: string;
  cr: string;
  attributeBonus: {
    attr: 'str' | 'dex' | 'con' | 'int' | 'wis' | 'cha';
    value: number;
  };
  passive: {
    name: string;
    desc: string;
  };
  active: {
    name: string;
    desc: string;
    limit: string; // ex: "1/descanso curto"
  };
}

export interface ItemEffect {
  type: 'ac' | 'attack' | 'damage' | 'attr' | 'save' | 'skill' | 'speed';
  value: number;
  stat?: string; // ex: 'str', 'dex', 'atletismo'
}

export interface InventoryItem {
  id: string;
  n: string; // nome
  d: string; // descrição
  r: 'Mundano' | 'Comum' | 'Incomum' | 'Raro' | 'Muito Raro' | 'Lendário' | 'Artefato';
  t: 'arma' | 'armadura' | 'escudo' | 'item' | 'consumível';
  att?: boolean; // requer sintonização?
  isAtt?: boolean; // está sintonizado?
  eq?: boolean; // está equipado?
  eff?: ItemEffect[];
  weight?: number;
  cost?: string;
}

export interface SpellEntry {
  id: string;
  name: string;
  level: number;
  school?: string;
  castingTime: string;
  range: string;
  components: string;
  duration: string;
  concentration: boolean;
  description: string;
  prepared?: boolean;
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
  spellList?: SpellEntry[];
  imageUrl?: string;
  imageConfig?: ImageConfig;
  description?: string;
  lairActions?: { n: string; d: string }[];
  legendaryActions?: { n: string; d: string; cost?: number }[];
  // Monstros também podem ter tamanho padrão no futuro, mas por enquanto default é 1x1
  width?: number;
  height?: number;
  // Atributos opcionais
  attributes?: { str: number; dex: number; con: number; int: number; wis: number; cha: number; };
  // Novas propriedades de Rework
  essence?: Essence;
  drops?: { n: string; d: string; r: 'Mundano' | 'Comum' | 'Incomum' | 'Raro' | 'Épico' | 'Lendário' }[];
}

export interface EncounterParticipant extends Monster {
  uid: number;
  hpCurrent: number;
  hpMax: number;
  hpTemp?: number;
  initiative: number;
  conditions: string[];
  inspiration?: boolean;
  linkedCharId?: string;
  spellList?: SpellEntry[];
  imageUrl?: string;
  imageConfig?: ImageConfig;
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
  frame?: string;
  inspiration?: boolean;
  conditions?: string[];
  imageConfig?: ImageConfig;
}

export interface CustomAsset {
    id: string;
    url: string;
    name: string;
    type?: 'upload' | 'edited';
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
    bgBrightness?: number;
    bgStretch?: boolean;
    weather?: 'none' | 'rain' | 'snow' | 'ember' | 'fog';
    customAssets?: Record<string, CustomAsset>;
}

export type AppMode = 'SHEET' | 'DM' | 'VTT' | 'CHAT' | 'NPC' | 'GM_DASHBOARD' | 'ADVENTURE';

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
    round?: number;
    turnCounter?: number;
  };
  notes?: string;
  lastUpdate?: number;
  permissions?: {
    canMoveTokens: boolean;
    canEditCharacters: boolean;
    canRollDice: boolean;
  };
}