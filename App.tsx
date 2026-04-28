
import React, { useState, useEffect, useRef, Suspense, lazy, startTransition } from 'react';
import { AppMode, Character, EncounterParticipant, LogEntry, Token, CampaignData, ChatMessage, MapConfig, Monster, CustomAsset } from './types';

const CharacterSheet = lazy(() => import('./components/CharacterSheet').then(module => ({ default: module.CharacterSheet })));
const DMTools = lazy(() => import('./components/DMTools').then(module => ({ default: module.DMTools })));
const VirtualTabletop = lazy(() => import('./components/VirtualTabletop').then(module => ({ default: module.VirtualTabletop })));
const Chat = lazy(() => import('./components/Chat').then(module => ({ default: module.Chat })));
const AIChat = lazy(() => import('./components/AIChat').then(module => ({ default: module.AIChat })));
const NPCManager = lazy(() => import('./components/NPCManager').then(module => ({ default: module.NPCManager })));
const DiceTray = lazy(() => import('./components/DiceTray').then(module => ({ default: module.DiceTray })));
const PrivacyPolicy = lazy(() => import('./components/PrivacyPolicy').then(module => ({ default: module.PrivacyPolicy })));
const TermsOfService = lazy(() => import('./components/TermsOfService').then(module => ({ default: module.TermsOfService })));
const SoundController = lazy(() => import('./components/SoundController').then(module => ({ default: module.SoundController })));
const DMScreen = lazy(() => import('./components/DMScreen').then(module => ({ default: module.DMScreen })));
const AdventureMode = lazy(() => import('./components/AdventureMode').then(module => ({ default: module.AdventureMode })));

import { User, Sun, Moon, Plus, Save, Upload, Zap, Globe, ShieldCheck, LogOut, Cloud, CloudOff, Loader2, Map as MapIcon, Settings, Sparkles, MessageSquare, PlayCircle, WifiOff, AlertTriangle, Key, Link as LinkIcon, Lock, Unlock, Users, Mail, UserCheck, X, Download, FileUp, FileText, LayoutDashboard, Menu, RotateCcw, PanelLeftClose, PanelLeftOpen, BookOpen, PanelRightOpen, PanelRightClose, Dices, RefreshCw, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { DEFAULT_MONSTERS, INITIAL_CHAR } from './constants';

import { auth, googleProvider, db, isDriveConfigured } from './firebaseConfig';

// Modular Firebase Auth Imports
import { 
  onAuthStateChanged, 
  signInWithPopup, 
  signInWithRedirect, 
  signInAnonymously, 
  signOut, 
  User as FirebaseUser,
  Auth
} from "firebase/auth";

import { ref, onValue, set, update, push, child, get } from "firebase/database";
import { initGapiClient, initGisClient, saveFileToDrive, openDrivePicker } from './googleDrive';

const CharacterSheetMemo = React.memo(CharacterSheet);
const DMToolsMemo = React.memo(DMTools);
const VirtualTabletopMemo = React.memo(VirtualTabletop);

const generateId = () => Math.random().toString(36).substr(2, 9);

const sanitizeCharacter = (char: any): Character => {
  if (!char || typeof char !== 'object') return { ...INITIAL_CHAR, id: generateId() };
  const sanitized = {
    ...INITIAL_CHAR,
    ...char,
    id: (char.id && char.id !== 'init' && !char.id.startsWith('temp-id-')) ? char.id : generateId(),
    attributes: { ...INITIAL_CHAR.attributes, ...(char.attributes || {}) },
    skills: { ...INITIAL_CHAR.skills, ...(char.skills || {}) },
    saves: { ...INITIAL_CHAR.saves, ...(char.saves || {}) },
    hp: { ...INITIAL_CHAR.hp, ...(char.hp || {}) },
    hitDice: { ...INITIAL_CHAR.hitDice, ...(char.hitDice || {}) },
    bio: { ...INITIAL_CHAR.bio, ...(char.bio || {}) },
    spells: { ...INITIAL_CHAR.spells, ...(char.spells || {}) },
    wallet: { ...INITIAL_CHAR.wallet, ...(char.wallet || {}) },
    imageUrl: char.imageUrl || ""
  };
  
  if (!sanitized.classes || sanitized.classes.length === 0) {
    sanitized.classes = [{ name: sanitized.class, subclass: sanitized.subclass, level: sanitized.level }];
  }
  
  return sanitized;
};

const processImportedCharacter = (json: any): Character | null => {
    if (json.id && json.attributes && json.attributes.str !== undefined) return sanitizeCharacter(json);
    if (json.nome_personagem || json.attr_for) {
        const safeInt = (v: any) => parseInt(v) || 0;
        const converted: Character = {
            ...INITIAL_CHAR,
            id: generateId(),
            name: json.nome_personagem || "Sem Nome",
            class: json.classe || "Guerreiro",
            subclass: json.subclasse || "",
            level: safeInt(json.nivel) || 1,
            background: json.antecedente || "",
            race: json.raca || "Humano",
            playerName: json.jogador || "",
            alignment: json.alinhamento || "",
            xp: safeInt(json.xp),
            attributes: {
                str: safeInt(json.attr_for) || 10,
                dex: safeInt(json.attr_des) || 10,
                con: safeInt(json.attr_con) || 10,
                int: safeInt(json.attr_int) || 10,
                wis: safeInt(json.attr_sab) || 10,
                cha: safeInt(json.attr_car) || 10
            },
            saves: {
                str: !!json.save_prof_for,
                dex: !!json.save_prof_des,
                con: !!json.save_prof_con,
                int: !!json.save_prof_int,
                wis: !!json.save_prof_sab,
                cha: !!json.save_prof_car
            },
            hp: {
                current: safeInt(json.pv_atual) || 10,
                max: safeInt(json.pv_max) || 10,
                temp: safeInt(json.pv_temp) || 0
            },
            ac: safeInt(json.ca) || 10,
            speed: json.deslocamento || "9m",
            initiative: safeInt(json.iniciativa),
            bio: {
                ...INITIAL_CHAR.bio,
                traits: json.bio_tracos || "",
                ideals: json.bio_ideals || "",
                bonds: json.bio_vinculos || "",
                flaws: json.bio_defeitos || "",
                backstory: json.bio_historia || "",
                features: json.bio_features || ""
            },
            inventory: json.equipamento || "",
            spells: {
                ...INITIAL_CHAR.spells,
                known: json.lista_magias || "",
                castingStat: json.attr_conjuracao || "int"
            },
            wallet: {
                cp: safeInt(json.coin_pc),
                sp: safeInt(json.coin_pp),
                ep: safeInt(json.coin_pe),
                gp: safeInt(json.coin_po),
                pp: safeInt(json.coin_pl)
            },
            imageUrl: json.avatar_url || ""
        };
        const skillMap: Record<string, string> = {
            'acrobacia': 'acrobacia', 'adestrar': 'adestrar', 'arcanismo': 'arcanismo',
            'atletismo': 'atletismo', 'atuacao': 'atuacao', 'enganacao': 'enganacao',
            'furtividade': 'furtividade', 'historia': 'historia', 'intimidacao': 'intimidacao',
            'intuicao': 'intuicao', 'investigacao': 'investigacao', 'medicina': 'medicina',
            'natureza': 'natureza', 'percepcao': 'percepcao', 'persuasao': 'persuasao',
            'prestidigitacao': 'prestidigitacao', 'religiao': 'religiao', 'sobrevivencia': 'sobrevivencia'
        };
        Object.keys(skillMap).forEach(k => {
            if (json[`prof_${k}`] !== undefined) converted.skills[skillMap[k]] = !!json[`prof_${k}`];
        });
        return converted;
    }
    return null;
};

type ThemeColor = 'amber' | 'blue' | 'purple' | 'emerald' | 'rose';
const THEMES: Record<ThemeColor, { primary: string, hover: string, text: string, border: string, ring: string, bgSoft: string, gradient: string }> = {
    amber: { primary: 'bg-amber-600', hover: 'hover:bg-amber-500', text: 'text-amber-500', border: 'border-amber-500', ring: 'ring-amber-500', bgSoft: 'bg-amber-900/20', gradient: 'from-amber-600 to-orange-600' },
    blue: { primary: 'bg-blue-600', hover: 'hover:bg-blue-500', text: 'text-blue-500', border: 'border-blue-500', ring: 'ring-blue-500', bgSoft: 'bg-blue-900/20', gradient: 'from-blue-600 to-indigo-600' },
    purple: { primary: 'bg-purple-600', hover: 'hover:bg-purple-500', text: 'text-purple-500', border: 'border-purple-500', ring: 'ring-purple-500', bgSoft: 'bg-purple-900/20', gradient: 'from-purple-600 to-fuchsia-600' },
    emerald: { primary: 'bg-emerald-600', hover: 'hover:bg-emerald-500', text: 'text-emerald-500', border: 'border-emerald-500', ring: 'ring-emerald-500', bgSoft: 'bg-amber-900/20', gradient: 'from-emerald-600 to-green-600' },
    rose: { primary: 'bg-rose-600', hover: 'hover:bg-rose-500', text: 'text-rose-500', border: 'border-rose-500', ring: 'ring-rose-500', bgSoft: 'bg-rose-900/20', gradient: 'from-rose-600 to-red-600' },
};

const BG_THEMES: Record<string, { name: string, className: string, sidebar: string }> = {
  stone: { name: 'Padrão (Escuro)', className: 'bg-[#0c0a09]', sidebar: 'bg-[#1a1a1d]' },
  red: { name: 'Infernal (Vermelho)', className: 'bg-red-950', sidebar: 'bg-red-900' },
  orange: { name: 'Vulcânico (Laranja)', className: 'bg-orange-950', sidebar: 'bg-orange-900' },
  amber: { name: 'Deserto (Âmbar)', className: 'bg-amber-950', sidebar: 'bg-amber-900' },
  green: { name: 'Floresta (Verde)', className: 'bg-green-950', sidebar: 'bg-green-900' },
  emerald: { name: 'Pântano (Esmeralda)', className: 'bg-emerald-950', sidebar: 'bg-emerald-900' },
  teal: { name: 'Profundezas (Ciano)', className: 'bg-teal-950', sidebar: 'bg-teal-900' },
  blue: { name: 'Oceano (Azul)', className: 'bg-blue-950', sidebar: 'bg-blue-900' },
  indigo: { name: 'Noite (Índigo)', className: 'bg-indigo-950', sidebar: 'bg-indigo-900' },
  purple: { name: 'Umbra (Roxo)', className: 'bg-purple-950', sidebar: 'bg-purple-900' },
  fuchsia: { name: 'Feérico (Fúcsia)', className: 'bg-fuchsia-950', sidebar: 'bg-fuchsia-900' },
  pink: { name: 'Sonho (Rosa)', className: 'bg-pink-950', sidebar: 'bg-pink-900' },
  rose: { name: 'Paixão (Rose)', className: 'bg-rose-950', sidebar: 'bg-rose-900' },
};

const DEFAULT_MAP_CONFIG: MapConfig = {
    scale: 1.5,
    unit: 'm',
    gridColor: '#ffffff',
    gridOpacity: 0.15,
    gridStyle: 'line',
    tileSize: 64, 
    bgUrl: null,
    bgX: 0,
    bgY: 0,
    bgScale: 1
};

const AUTOSAVE_KEY = 'rpgnep_autosave_v2';

export default function App() {
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  
  const showToast = (msg: string) => {
      setToastMessage(msg);
      setTimeout(() => setToastMessage(null), 3000);
  };

  const [confirmModal, setConfirmModal] = useState<{message: string, onConfirm: () => void, onCancel?: () => void} | null>(null);
  const [viewState, setViewState] = useState<'LAUNCHER' | 'APP'>('LAUNCHER');
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [roomName, setRoomName] = useState('Minha Campanha');
  const [campaignName, setCampaignName] = useState(''); 
  const [campaignPassword, setCampaignPassword] = useState(''); 
  
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<number | null>(null);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [isCloudSyncEnabled, setIsCloudSyncEnabled] = useState(false);
  const [authError, setAuthError] = useState('');
  const [isJoiningViaLink, setIsJoiningViaLink] = useState(false);
  const [roomUsers, setRoomUsers] = useState<{ id: string, name: string, isDM: boolean }[]>([]);

  const [showPasswordPrompt, setShowPasswordPrompt] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [pendingRoomId, setPendingRoomId] = useState('');

  const [mode, setMode] = useState<AppMode>('SHEET');
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [accentColor, setAccentColor] = useState<ThemeColor>('amber');
  const [bgTheme, setBgTheme] = useState<string>('stone');
  const [hudStyle, setHudStyle] = useState<'glass' | 'solid' | 'minimal'>('glass');
  
  const [characters, setCharacters] = useState<Character[]>([{ ...INITIAL_CHAR, id: generateId() }]);
  const [npcs, setNpcs] = useState<Character[]>([]); 
  const [monsters, setMonsters] = useState<Monster[]>(DEFAULT_MONSTERS);
  const [activeCharIndex, setActiveCharIndex] = useState(0);
  const [encounter, setEncounter] = useState<EncounterParticipant[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  
  const clearLogs = () => {
    const performClear = () => {
        setLogs([]);
        if (roomName && db) {
            const cleanRoom = sanitizeRoomName(roomName);
            set(ref(db, `campaigns/${cleanRoom}/logs`), null);
        }
        setConfirmModal(null);
    };

    setConfirmModal({
        message: "Tem certeza que deseja apagar todos os logs? Esta ação não pode ser desfeita.",
        onConfirm: performClear
    });
  };

  const clearChatMessages = () => {
    const performClear = () => {
        setChatMessages([]);
        if (roomName && db) {
            const cleanRoom = sanitizeRoomName(roomName);
            set(ref(db, `campaigns/${cleanRoom}/chat`), null);
        }
        setConfirmModal(null);
    };

    setConfirmModal({
        message: "Tem certeza que deseja apagar todo o histórico do chat? Esta ação não pode ser desfeita.",
        onConfirm: performClear
    });
  };

  const [notes, setNotes] = useState('');
  const [permissions, setPermissions] = useState({
    canMoveTokens: true,
    canEditCharacters: true,
    canRollDice: true
  });
  
  const [mapGrid, setMapGrid] = useState<string[][]>(Array(40).fill(null).map(() => Array(40).fill('⬜||')));
  const [mapTokens, setMapTokens] = useState<Token[]>([]);
  const [fogGrid, setFogGrid] = useState<boolean[][]>(Array(40).fill(null).map(() => Array(40).fill(false))); 
  const [mapConfig, setMapConfig] = useState<MapConfig>(DEFAULT_MAP_CONFIG);
  const [customAssets, setCustomAssets] = useState<Record<string, CustomAsset>>({});

  const [turnIndex, setTurnIndex] = useState<number>(-1);
  const [targetUid, setTargetUid] = useState<number | null>(null);
  const [round, setRound] = useState<number>(1); // Added Round Tracking
  const [turnCounter, setTurnCounter] = useState<number>(0); // Added Turn Counter

  const [isDriveReady, setIsDriveReady] = useState(false);
  const [driveStatus, setDriveStatus] = useState<'disconnected' | 'connected' | 'saving' | 'error'>('disconnected');
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false); 
  const [showTerms, setShowTerms] = useState(false); 
  const [showAI, setShowAI] = useState(false);
  const [showNotepad, setShowNotepad] = useState(false);
  const [showDMScreen, setShowDMScreen] = useState(false); // Added DM Screen state
  const [activeUtility, setActiveUtility] = useState<'none' | 'chat' | 'dice'>('none'); // Floating tools
  const [isDriveLoading, setIsDriveLoading] = useState(false);
  const [unsavedChanges, setUnsavedChanges] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [gmSidebarOpen, setGmSidebarOpen] = useState(true);
  
  const [hasLocalSave, setHasLocalSave] = useState(false);

  // Sync character stats to map tokens
  useEffect(() => {
    if (characters.length > 0) {
      setMapTokens(prev => {
        let changed = false;
        const next = prev.map(token => {
          if (token.linkedType === 'character' && token.linkedId) {
            const char = characters.find(c => c.id === token.linkedId);
            if (char) {
              const needsSync = token.inspiration !== char.inspiration || 
                                JSON.stringify(token.conditions) !== JSON.stringify(char.conditions) ||
                                token.hp !== char.hp.current ||
                                token.max !== char.hp.max;
              
              if (needsSync) {
                changed = true;
                return {
                  ...token,
                  inspiration: char.inspiration || false,
                  conditions: char.conditions || [],
                  hp: char.hp.current,
                  max: char.hp.max
                };
              }
            }
          }
          return token;
        });
        return changed ? next : prev;
      });
    }
  }, [characters]);

  const isRemoteUpdate = useRef(false);
  const hasReceivedInitialState = useRef(false);
  const updateTimeout = useRef<any>(null);
  
  const [saveFilename, setSaveFilename] = useState('');
  const localLoadRef = useRef<HTMLInputElement>(null);
  const username = currentUser?.displayName || "Jogador";

  const th = THEMES[accentColor];
  const bg = BG_THEMES[bgTheme] || BG_THEMES['stone'];

  const getHudClasses = (base: string = '') => {
      if (hudStyle === 'solid') return `${base} bg-[#121212] border border-stone-800 shadow-xl`;
      if (hudStyle === 'minimal') return `${base} bg-transparent border-none`;
      return `${base} bg-stone-950/80 backdrop-blur-md border border-white/10 shadow-2xl`;
  };

  // Load settings on boot
  useEffect(() => {
    const savedTheme = localStorage.getItem('rpgnep_theme');
    const savedAccent = localStorage.getItem('rpgnep_accent');
    const savedBg = localStorage.getItem('rpgnep_bg');
    const savedFont = localStorage.getItem('rpgnep_font');
    const savedHudStyle = localStorage.getItem('rpgnep_hud_style');
    const savedCloudSync = localStorage.getItem('rpgnep_cloud_sync');
    
    if (savedTheme === 'light' || savedTheme === 'dark') setTheme(savedTheme);
    if (savedAccent && Object.keys(THEMES).includes(savedAccent)) setAccentColor(savedAccent as ThemeColor);
    if (savedBg && Object.keys(BG_THEMES).includes(savedBg)) setBgTheme(savedBg);
    if (savedHudStyle === 'glass' || savedHudStyle === 'solid' || savedHudStyle === 'minimal') setHudStyle(savedHudStyle as any);
    if (savedCloudSync === 'true') setIsCloudSyncEnabled(true);
    else if (savedCloudSync === 'false') setIsCloudSyncEnabled(false);
    
    if (savedFont === 'cinzel') document.body.style.fontFamily = "'Cinzel', serif";
    else if (savedFont === 'sans') document.body.style.fontFamily = "'Inter', sans-serif";
  }, []);

  // Save settings when they change
  useEffect(() => {
    localStorage.setItem('rpgnep_theme', theme);
    localStorage.setItem('rpgnep_accent', accentColor);
    localStorage.setItem('rpgnep_bg', bgTheme);
    localStorage.setItem('rpgnep_hud_style', hudStyle);
    localStorage.setItem('rpgnep_cloud_sync', isCloudSyncEnabled.toString());
  }, [theme, accentColor, bgTheme, hudStyle, isCloudSyncEnabled]);

  useEffect(() => {
    if (theme === 'dark') document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [theme]);

  useEffect(() => {
    document.documentElement.classList.remove('hud-glass', 'hud-solid', 'hud-minimal');
    document.documentElement.classList.add(`hud-${hudStyle}`);
  }, [hudStyle]);

  // Socket.IO Connection (REMOVED)
  useEffect(() => {
    if (viewState === 'APP' && roomName) {
        // Multiplayer logic removed to focus on single-player performance
        return () => {};
    }
  }, [viewState, roomName]);

  // Check for local save on boot
  useEffect(() => {
      const saved = localStorage.getItem(AUTOSAVE_KEY);
      if (saved) setHasLocalSave(true);
  }, []);

  // Autosave Effect
  useEffect(() => {
      if (viewState === 'APP' && characters.length > 0) {
          const timeout = setTimeout(() => {
              const backup: CampaignData = {
                  version: '2.0',
                  timestamp: Date.now(),
                  name: campaignName || roomName,
                  password: '',
                  characters,
                  npcs,
                  monsters,
                  encounter,
                  logs,
                  map: { grid: mapGrid, tokens: mapTokens, fog: fogGrid, config: mapConfig },
                  combat: { turnIndex, targetUid, round, turnCounter },
                  notes
              };
              try {
                  localStorage.setItem(AUTOSAVE_KEY, JSON.stringify(backup));
              } catch (e) {
                  if (e instanceof DOMException && e.name === 'QuotaExceededError') {
                      console.warn("Local storage quota exceeded. Autosave disabled for this session.");
                  } else {
                      console.error("Autosave error:", e);
                  }
              }
              setUnsavedChanges(false); // Local saved counts as saved for simple users
          }, 2000);
          return () => clearTimeout(timeout);
      }
  }, [characters, npcs, monsters, encounter, logs, mapGrid, mapTokens, fogGrid, mapConfig, turnIndex, targetUid, notes, viewState, campaignName, roomName, round, permissions]);

  const handleContinueSession = () => {
      try {
          const saved = localStorage.getItem(AUTOSAVE_KEY);
          if (saved) {
              const data = JSON.parse(saved) as CampaignData;
              setIsSyncing(true);
              
              if (data.name) { setCampaignName(data.name); setRoomName(data.name); }
              if (data.characters) setCharacters(data.characters.map(sanitizeCharacter));
              if (data.npcs) setNpcs(data.npcs.map(sanitizeCharacter));
              if (data.monsters) setMonsters(data.monsters);
              if (data.encounter) {
                  // Sanitize encounter data to avoid crashes
                  setEncounter(data.encounter.map((p: any) => ({
                      ...p,
                      conditions: p.conditions || [],
                      actions: p.actions || [],
                      spells: p.spells || [],
                      traits: p.traits || []
                  })));
              }
              if (data.logs) setLogs(data.logs.map((l: any) => ({ ...l, timestamp: new Date(l.timestamp) })));
              if (data.map) {
                  setMapGrid(data.map.grid || []);
                  setMapTokens(data.map.tokens || []);
                  if (data.map.fog) setFogGrid(data.map.fog);
                  if (data.map.config) setMapConfig(prev => ({ ...prev, ...data.map.config }));
              }
              if (data.combat) {
                  setTurnIndex(data.combat.turnIndex ?? -1);
                  setTargetUid(data.combat.targetUid ?? null);
                  setRound(data.combat.round || 1);
                  setTurnCounter(data.combat.turnCounter || 0);
              }
              if (data.notes) setNotes(data.notes);
              if (data.permissions) setPermissions(data.permissions);

              setCurrentUser({ uid: 'offline', displayName: 'Viajante', isAnonymous: true } as any);
              setTimeout(() => {
                  startTransition(() => setViewState('APP'));
                  setIsSyncing(false);
              }, 500);
          }
      } catch(e) {
          console.error("Erro ao recuperar sessão", e);
          showToast("Erro ao recuperar sessão anterior.");
      }
  };

  const handleAuthError = (e: any) => {
      console.error("Auth Error:", e);
      setIsSyncing(false);
      let errorMessage = `Erro ao conectar: ${e.message}`;
      if (e.code === 'auth/popup-closed-by-user') errorMessage = 'Janela de login foi fechada antes da conclusão.';
      else if (e.code === 'auth/unauthorized-domain') errorMessage = `DOMÍNIO NÃO AUTORIZADO (${window.location.hostname}).`;
      else if (e.code === 'auth/operation-not-allowed') errorMessage = 'O método de login (Google) não está ativado no Firebase Console.';
      else if (e.code === 'auth/network-request-failed') errorMessage = 'Erro de conexão. Verifique sua internet.';
      setAuthError(errorMessage);
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sharedRoom = params.get('room');
    if (sharedRoom) {
      setRoomName(sharedRoom);
      setIsJoiningViaLink(true);
    }
    
    if (!auth) {
      console.warn("Auth não disponível. Pulando onAuthStateChanged.");
      startTransition(() => setViewState('LAUNCHER'));
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) setCurrentUser(user);
      else startTransition(() => setViewState('LAUNCHER'));
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (viewState !== 'APP') return;
    const initDrive = async () => {
      if (!isDriveConfigured()) return;
      try {
        await initGapiClient();
        await initGisClient();
        setIsDriveReady(true);
        setDriveStatus('connected');
      } catch (e: any) { 
          console.error("Drive Init Fail", e); 
          // Check if it's a 403 error (blocked API key)
          if (e?.error?.code === 403 || e?.status === 403 || (typeof e === 'string' && e.includes('403'))) {
              setDriveStatus('error');
              console.warn("Google Drive API access is restricted for this API key.");
          } else {
              setDriveStatus('error');
          }
      }
    };
    const t = setTimeout(() => {
        if (currentUser && !currentUser.isAnonymous) initDrive();
    }, 1000);
    return () => clearTimeout(t);
  }, [viewState, currentUser]);

  useEffect(() => {
      const handleBeforeUnload = (e: BeforeUnloadEvent) => {
          if (unsavedChanges) { e.preventDefault(); e.returnValue = ''; }
      };
      window.addEventListener('beforeunload', handleBeforeUnload);
      return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [unsavedChanges]);

  const compressFog = (fog: boolean[][]) => {
      if (!fog || fog.length === 0) return "";
      const h = fog.length;
      const w = fog[0].length;
      let res = `${w},${h},`;
      for (let r = 0; r < h; r++) {
          for (let c = 0; c < w; c++) {
              res += fog[r][c] ? "1" : "0";
          }
      }
      return res;
  };

  const decompressFog = (compressed: string) => {
      if (!compressed || typeof compressed !== 'string') return Array(40).fill(null).map(() => Array(40).fill(false));
      const parts = compressed.split(',');
      if (parts.length < 3) return Array(40).fill(null).map(() => Array(40).fill(false));
      const w = parseInt(parts[0]);
      const h = parseInt(parts[1]);
      const data = parts[2];
      const res: boolean[][] = [];
      for (let r = 0; r < h; r++) {
          const row: boolean[] = [];
          for (let c = 0; c < w; c++) {
              row.push(data[r * w + c] === "1");
          }
          res.push(row);
      }
      return res;
  };

  // Sync assets separately to avoid "Write too large"
  useEffect(() => {
      const isOfflineUser = !currentUser || currentUser.uid === 'demo' || currentUser.uid === 'offline';
      if (roomName && !isOfflineUser && hasReceivedInitialState.current && isCloudSyncEnabled) {
          const database = db;
          if (database) {
              const cleanRoom = sanitizeRoomName(roomName);
              // Only sync if there are assets
              if (Object.keys(customAssets).length > 0) {
                  const assetsRef = ref(database, `campaigns/${cleanRoom}/assets`);
                  // We use update to only add new assets, but for simplicity we'll just sync the whole object
                  // Actually, to be safe against "Write too large", we should only sync NEW assets.
                  // But let's try syncing the whole object first, if it fails we'll need a more granular approach.
                  // Wait, if we sync the whole object, we are back to the same problem.
                  // Let's implement granular sync for assets.
              }
          }
      }
  }, [customAssets, roomName, currentUser]);

  const syncAsset = (asset: CustomAsset) => {
      const isOfflineUser = !currentUser || currentUser.uid === 'demo' || currentUser.uid === 'offline';
      if (roomName && !isOfflineUser && db && isCloudSyncEnabled) {
          const cleanRoom = sanitizeRoomName(roomName);
          const assetRef = ref(db, `campaigns/${cleanRoom}/assets/${asset.id}`);
          update(assetRef, asset).catch(e => console.error("Asset Sync Error", e));
      }
  };

  useEffect(() => {
      if (viewState === 'APP') {
          setUnsavedChanges(true);
          const isOfflineUser = !currentUser || currentUser.uid === 'demo' || currentUser.uid === 'offline';
          const database = db;

          if (isRemoteUpdate.current) {
              isRemoteUpdate.current = false;
              if (updateTimeout.current) clearTimeout(updateTimeout.current);
              return;
          }

          if (roomName && !isOfflineUser && hasReceivedInitialState.current && isCloudSyncEnabled) {
              if (updateTimeout.current) clearTimeout(updateTimeout.current);
              setSyncStatus('saving');
              updateTimeout.current = setTimeout(() => {
                  // Exclude customAssets from mapConfig to keep payload small
                  const { customAssets: _, ...cleanConfig } = mapConfig;
                  
                  const payload: any = {
                      version: '2.1',
                      timestamp: Date.now(),
                      name: campaignName || roomName,
                      password: campaignPassword,
                      characters,
                      npcs, 
                      monsters,
                      encounter,
                      logs, 
                      map: { 
                          grid: mapGrid, 
                          tokens: mapTokens, 
                          fog: compressFog(fogGrid), 
                          config: cleanConfig 
                      },
                      combat: { turnIndex, targetUid, round },
                      notes,
                      permissions
                  };
                  
                  if (database) {
                      const campaignRef = ref(database, `campaigns/${sanitizeRoomName(roomName)}`);
                      update(campaignRef, { ...payload, lastUpdate: Date.now() })
                        .then(() => {
                            setSyncStatus('saved');
                            setLastSyncTime(Date.now());
                            setTimeout(() => setSyncStatus('idle'), 2000);
                        })
                        .catch(e => {
                            console.error("Sync Error", e);
                            setSyncStatus('error');
                        });
                  }
              }, 3000); // Optimized debounce
          }
      }
  }, [characters, npcs, encounter, mapGrid, mapTokens, monsters, fogGrid, turnIndex, targetUid, campaignName, campaignPassword, notes, mapConfig, currentUser, roomName, round, permissions]);

  const sanitizeRoomName = (name: string) => name.trim().toLowerCase().replace(/[.#$[\]]/g, '_');

  useEffect(() => {
      if (viewState !== 'APP' || !roomName || !db || !isCloudSyncEnabled) return;
      if (currentUser?.uid === 'offline' || currentUser?.uid === 'demo') return;

      const database = db;
      const cleanRoom = sanitizeRoomName(roomName);
      const campaignRef = ref(database, `campaigns/${cleanRoom}`);
      const logsRef = ref(database, `campaigns/${cleanRoom}/logs`);
      const chatRef = ref(database, `campaigns/${cleanRoom}/chat`);

      // One-time fetch instead of real-time listener for better performance (Single Player focus)
      get(campaignRef).then((snapshot) => {
          const data = snapshot.val();
          hasReceivedInitialState.current = true;
          if (data && data.lastUpdate) {
              isRemoteUpdate.current = true;
              if (data.name) setCampaignName(data.name);
              if (data.password) setCampaignPassword(data.password);
              if (data.characters) setCharacters(data.characters.map(sanitizeCharacter));
              if (data.npcs) setNpcs(data.npcs.map(sanitizeCharacter));
              if (data.monsters) setMonsters(data.monsters);
              if (data.encounter) {
                  setEncounter(data.encounter.map((p: any) => ({
                      ...p,
                      conditions: p.conditions || [],
                      actions: p.actions || [],
                      spells: p.spells || [],
                      traits: p.traits || []
                  })));
              }
              if (data.map) {
                  setMapGrid(data.map.grid || []);
                  setMapTokens(data.map.tokens || []);
                  if (data.map.fog) {
                      if (typeof data.map.fog === 'string') {
                          setFogGrid(decompressFog(data.map.fog));
                      } else {
                          setFogGrid(data.map.fog);
                      }
                  }
                  if (data.map.config) setMapConfig(prev => ({ ...prev, ...data.map.config }));
              }
              if (data.assets) {
                  setCustomAssets(data.assets);
              }
              if (data.combat) {
                  setTurnIndex(data.combat.turnIndex ?? -1);
                  setTargetUid(data.combat.targetUid ?? null);
                  setRound(data.combat.round || 1);
              }
              if (data.notes) setNotes(data.notes);
              if (data.permissions) setPermissions(data.permissions);
          } else if (!data) {
              setCampaignName(roomName);
          }
      }).catch(e => console.error("Error fetching campaign", e));

      // Logs and Chat can still be real-time if needed, but we'll stick to one-time for now to optimize
      const unsubscribeLogs = onValue(logsRef, (snapshot) => {
          const data = snapshot.val();
          if (data) {
              const logArray = Object.values(data).reverse() as LogEntry[];
              const parsedLogs = logArray.map(l => ({...l, timestamp: new Date(l.timestamp)}));
              setLogs(parsedLogs);
          } else {
              setLogs([]);
          }
      });

      const unsubscribeChat = onValue(chatRef, (snapshot) => {
          const data = snapshot.val();
          if (data) {
              const chatArray = Object.values(data) as ChatMessage[];
              chatArray.sort((a, b) => a.timestamp - b.timestamp);
              setChatMessages(chatArray);
          } else {
              setChatMessages([]);
          }
      });

      return () => {
          unsubscribeLogs();
          unsubscribeChat();
          hasReceivedInitialState.current = false;
      };
  }, [viewState, roomName, currentUser]);

  const broadcastMap = React.useCallback((grid: string[][], tokens: Token[], fog?: boolean[][]) => {
    setMapGrid(grid); 
    setMapTokens(tokens);
    if (fog) setFogGrid(fog);
  }, []);

  const broadcastChat = React.useCallback((text: string) => {
    let finalAuthor = username;
    let finalText = text;
    let isSystemMsg = false;

    if (text.startsWith('/r ') || text.startsWith('/roll ')) {
        const rollCmd = text.replace(/^\/(r|roll)\s+/i, '').trim();
        const diceMatch = rollCmd.match(/(\d+)d(\d+)(\s*[+\-]\s*\d+)?/i);
        
        if (diceMatch) {
            const num = parseInt(diceMatch[1]);
            const faces = parseInt(diceMatch[2]);
            const modStr = (diceMatch[3] || '').replace(/\s/g, '');
            const mod = parseInt(modStr || '0');
            
            if (num > 0 && faces > 0 && num <= 50) {
                const rolls = [];
                let sum = 0;
                for(let i=0; i<num; i++) {
                    const r = Math.floor(Math.random() * faces) + 1;
                    rolls.push(r);
                    sum += r;
                }
                const total = sum + mod;
                finalText = `🎲 Rolou ${rollCmd}: [${rolls.join(', ')}]${mod ? (mod > 0 ? ` + ${mod}` : ` - ${Math.abs(mod)}`) : ''} = **${total}**`;
                isSystemMsg = true;
            } else {
                finalText = `⚠️ Comando de dados inválido: ${rollCmd}`;
                isSystemMsg = true;
            }
        }
    } 
    else if (text.startsWith('/me ')) {
        finalText = `*${username} ${text.substring(4)}*`;
        isSystemMsg = true;
    }

    const msg: ChatMessage = { id: generateId(), author: finalAuthor, text: finalText, timestamp: Date.now(), isSystem: isSystemMsg };
    setChatMessages(prev => [...prev, msg]);
    
    if (roomName && db && isCloudSyncEnabled) {
        const cleanRoom = sanitizeRoomName(roomName);
        const newMsgRef = push(ref(db, `campaigns/${cleanRoom}/chat`));
        set(newMsgRef, msg);
    }
  }, [username, roomName]);

  const addLogEntry = React.useCallback((title: string, details: string, type?: LogEntry['type']) => {
      const safeType = type || 'info';
      const entry: LogEntry = { id: Date.now(), title, details, timestamp: new Date(), type: safeType, author: username };
      setLogs(prev => [entry, ...prev]);
      if (roomName && db && isCloudSyncEnabled) {
          const cleanRoom = sanitizeRoomName(roomName);
          const newLogRef = push(ref(db, `campaigns/${cleanRoom}/logs`));
          set(newLogRef, { ...entry, timestamp: entry.timestamp.getTime() });
      }
  }, [username, roomName]);

  const checkRoomPassword = async (room: string) => {
      if (!db) return null;
      const cleanRoom = sanitizeRoomName(room);
      try {
          const snapshot = await get(child(ref(db), `campaigns/${cleanRoom}/password`));
          if (snapshot.exists()) {
              const pwd = snapshot.val();
              if (pwd && String(pwd).trim().length > 0) return pwd;
          }
      } catch (e) { console.error("Error checking password", e); }
      return null;
  };

  const attemptJoinRoom = async () => {
      if (!roomName.trim()) { showToast("Digite o nome da sala."); return; }
      setIsSyncing(true);
      if (currentUser?.uid === 'demo' || currentUser?.uid === 'offline' || !isCloudSyncEnabled) {
          startTransition(() => setViewState('APP'));
          setIsSyncing(false);
          return;
      }
      const requiredPwd = await checkRoomPassword(roomName);
      if (requiredPwd) {
          setIsSyncing(false);
          setPendingRoomId(requiredPwd); 
          setShowPasswordPrompt(true);
      } else {
          startTransition(() => setViewState('APP'));
          setIsSyncing(false);
      }
  };

  const verifyPassword = () => {
      if (passwordInput === pendingRoomId) {
          setShowPasswordPrompt(false);
          startTransition(() => setViewState('APP'));
      } else {
          showToast("Senha incorreta!");
      }
  };

  const handleLogin = async (e: React.FormEvent, method: 'popup' | 'redirect' = 'popup') => {
    e.preventDefault();
    if (!auth || !googleProvider) {
      setAuthError('Firebase ou Provedor Google não configurado. Verifique as chaves de API.');
      return;
    }
    setIsSyncing(true);
    setAuthError('');
    try {
      if (!currentUser) {
          if (method === 'popup') await signInWithPopup(auth, googleProvider);
          else { await signInWithRedirect(auth, googleProvider); return; }
      }
      setIsSyncing(false);
      attemptJoinRoom();
    } catch (e: any) { handleAuthError(e); }
  };

  const handleAnonymousLogin = async () => {
      if (!auth) {
        setAuthError('Firebase não configurado. Verifique as chaves de API.');
        return;
      }
      setIsSyncing(true);
      try {
          await signInAnonymously(auth);
          setIsSyncing(false);
          attemptJoinRoom();
      } catch (e: any) {
          if (e.code !== 'auth/admin-restricted-operation') handleAuthError(e);
          else {
              setCurrentUser({ uid: 'offline', displayName: 'Viajante', isAnonymous: true } as any);
              setIsSyncing(false);
              startTransition(() => setViewState('APP'));
          }
      }
  };

  const handleDemoMode = () => {
    setIsSyncing(true);
    setTimeout(() => {
        setRoomName("Mesa de Demonstração");
        setCampaignName("Mesa de Demonstração");
        setCharacters([
            { ...INITIAL_CHAR, id: 'demo_warrior', name: "Valeros", class: "Guerreiro", level: 3, hp: {current: 30, max: 30, temp: 0}, attributes: {...INITIAL_CHAR.attributes, str: 16, con: 14}, inventory: "- Espada Longa | Dano: 1d8 cortante" },
            { ...INITIAL_CHAR, id: 'demo_mage', name: "Ezren", class: "Mago", level: 3, hp: {current: 20, max: 20, temp: 0}, attributes: {...INITIAL_CHAR.attributes, int: 16, wis: 12}, spells: { ...INITIAL_CHAR.spells, known: "Mísseis Mágicos: 3x 1d4+1" } }
        ]);
        setLogs([{ id: Date.now(), title: "Demo Iniciada", details: "Bem-vindo ao RPGNEP. Modo offline ativado.", timestamp: new Date(), type: 'info'}]);
        const demoTokens: Token[] = [
            { id: 1, x: 10, y: 10, icon: '🛡️', hp: 30, max: 30, color: '#3b82f6', size: 2, width: 2, height: 2, name: "Valeros" },
            { id: 2, x: 12, y: 10, icon: '🧙‍♂️', hp: 20, max: 20, color: '#a855f7', size: 2, width: 2, height: 2, name: "Ezren" },
            { id: 3, x: 16, y: 10, icon: '💀', hp: 7, max: 7, color: '#ef4444', size: 2, width: 2, height: 2, name: "Goblin 1" },
            { id: 4, x: 16, y: 12, icon: '💀', hp: 7, max: 7, color: '#ef4444', size: 2, width: 2, height: 2, name: "Goblin 2" }
        ];
        setMapTokens(demoTokens);
        setMapGrid(Array(40).fill(null).map(() => Array(40).fill('⬜||')));
        setNotes('Bem-vindo à demonstração!\nUse este espaço para anotações rápidas.');
        setCurrentUser({ uid: 'demo', displayName: 'Visitante', isAnonymous: true } as unknown as any);
        startTransition(() => setViewState('APP'));
        setIsSyncing(false);
    }, 800);
  };

  const handleLocalSave = () => {
    const data: CampaignData = { 
        version: '2.0', timestamp: Date.now(), name: campaignName || roomName, characters, npcs, encounter, logs, map: { grid: mapGrid, tokens: mapTokens, fog: fogGrid, config: mapConfig }, monsters, combat: { turnIndex, targetUid, round }, notes
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${saveFilename || campaignName || roomName}.rpgnep.json`;
    a.click();
    URL.revokeObjectURL(url);
    setShowSaveModal(false);
    setUnsavedChanges(false);
  };

  const handleLocalLoad = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const json = JSON.parse(ev.target?.result as string);
        if (json.characters && Array.isArray(json.characters)) {
            const data = json as CampaignData;
            if (data.name) setCampaignName(data.name);
            if (data.characters) setCharacters(data.characters.map(sanitizeCharacter));
            if (data.npcs) setNpcs(data.npcs.map(sanitizeCharacter));
            if (data.monsters) setMonsters(data.monsters);
            if (data.encounter) {
                // Sanitize local load
                setEncounter(data.encounter.map((p: any) => ({
                    ...p,
                    conditions: p.conditions || [],
                    actions: p.actions || [],
                    spells: p.spells || [],
                    traits: p.traits || []
                })));
            }
            if (data.logs) setLogs(data.logs.map((l: any) => ({ ...l, timestamp: new Date(l.timestamp) })));
            if (data.map) { 
                setMapGrid(data.map.grid || []); 
                setMapTokens(data.map.tokens || []);
                if (data.map.fog) setFogGrid(data.map.fog);
                if (data.map.config) setMapConfig(prev => ({ ...prev, ...data.map.config }));
            }
            if (data.combat) {
                setTurnIndex(data.combat.turnIndex ?? -1);
                setTargetUid(data.combat.targetUid ?? null);
                setRound(data.combat.round || 1);
            }
            if (data.notes) setNotes(data.notes);
            if (data.permissions) setPermissions(data.permissions);
            showToast("Mesa carregada com sucesso!");
            setUnsavedChanges(false);
        } else {
            const importedChar = processImportedCharacter(json);
            if (importedChar) {
                setCharacters(prev => [...prev, importedChar]);
                setActiveCharIndex(characters.length);
                showToast(`Personagem "${importedChar.name}" importado com sucesso!`);
            } else { throw new Error("Formato não reconhecido"); }
        }
      } catch (err) { showToast("Erro ao carregar arquivo."); console.error(err); }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleCharacterImport = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
          try {
              const json = JSON.parse(ev.target?.result as string);
              const importedChar = processImportedCharacter(json);
              if (importedChar) {
                  setCharacters(prev => [...prev, importedChar]);
                  setActiveCharIndex(characters.length);
                  showToast(`Personagem "${importedChar.name}" adicionado!`);
              } else { showToast("Arquivo inválido."); }
          } catch(err) { console.error(err); showToast("Erro ao ler arquivo."); }
      };
      reader.readAsText(file);
      e.target.value = '';
  };

  const executeSave = async () => {
    if (!isDriveConfigured()) { showToast("Erro: Google Drive não configurado."); return; }
    setIsDriveLoading(true);
    setDriveStatus('saving');
    try {
      const data: CampaignData = { version: '2.0', timestamp: Date.now(), name: campaignName || roomName, characters, npcs, encounter, logs, map: { grid: mapGrid, tokens: mapTokens, fog: fogGrid, config: mapConfig }, monsters, combat: { turnIndex, targetUid, round }, notes };
      const fileData = await saveFileToDrive(saveFilename || campaignName || roomName, data) as any;
      showToast('Campanha salva com sucesso no Google Drive!');
      if (fileData && fileData.webViewLink) window.open(fileData.webViewLink, '_blank');
      setShowSaveModal(false);
      setUnsavedChanges(false);
      setDriveStatus('connected');
    } catch (e: any) { console.error("Drive Save Error:", e); setDriveStatus('error'); showToast(`Erro ao salvar no Drive: ${e.message || e.error}`); }
    setIsDriveLoading(false);
  };

  const handlePickFromDrive = async () => {
    setIsDriveLoading(true);
    setDriveStatus('saving'); 
    try {
      const data = await openDrivePicker();
      if (data) {
        const parsed = (typeof data === 'string') ? JSON.parse(data) : data;
        if (parsed.characters || parsed.map) {
            if (parsed.name) setCampaignName(parsed.name);
            if (parsed.characters) setCharacters(parsed.characters.map(sanitizeCharacter));
            if (parsed.npcs) setNpcs(parsed.npcs.map(sanitizeCharacter));
            if (parsed.monsters) setMonsters(parsed.monsters);
            if (parsed.encounter) {
                // Sanitize drive load
                setEncounter(parsed.encounter.map((p: any) => ({
                    ...p,
                    conditions: p.conditions || [],
                    actions: p.actions || [],
                    spells: p.spells || [],
                    traits: p.traits || []
                })));
            }
            if (parsed.logs) setLogs(parsed.logs.map((l: any) => ({ ...l, timestamp: new Date(l.timestamp) })));
            if (parsed.map) { 
                setMapGrid(parsed.map.grid || []); 
                setMapTokens(parsed.map.tokens || []);
                if (parsed.map.fog) setFogGrid(parsed.map.fog);
                if (parsed.map.config) setMapConfig(prev => ({ ...prev, ...parsed.map.config }));
            }
            if (parsed.combat) {
                setTurnIndex(parsed.combat.turnIndex ?? -1);
                setTargetUid(parsed.combat.targetUid ?? null);
                setRound(parsed.combat.round || 1);
            }
            if (parsed.notes) setNotes(parsed.notes);
            showToast("Campanha carregada com sucesso!");
            setShowSaveModal(false);
            setUnsavedChanges(false);
            setDriveStatus('connected');
        } else { throw new Error("Formato inválido"); }
      }
    } catch (e: any) { if (e !== "CANCELLED") { console.error(e); setDriveStatus('error'); showToast("Erro ao carregar do Drive: " + e); } else { setDriveStatus('connected'); } }
    setIsDriveLoading(false);
  };

  const getInviteLink = () => {
      const baseUrl = window.location.origin + window.location.pathname;
      return `${baseUrl}?room=${encodeURIComponent(roomName)}`;
  };

  const handleShare = async () => {
      const link = getInviteLink();
      const shareData = { title: `RPGNEP - ${campaignName}`, text: `Venha jogar RPG comigo na mesa "${campaignName}"!`, url: link };
      if (navigator.share) { try { await navigator.share(shareData); } catch (e) { /* ignore abort */ } } else { navigator.clipboard.writeText(link); showToast(`Link de convite copiado!\n\n${link}`); }
  };

  const handleEmailInvite = () => {
      const link = getInviteLink();
      const subject = encodeURIComponent(`Convite para RPG: ${campaignName}`);
      const body = encodeURIComponent(`Olá!\n\nVocê foi convidado para participar de uma sessão de RPG no RPGNEP.\n\nMesa: ${campaignName}\nLink de Acesso: ${link}\n\nNos vemos lá!`);
      window.open(`mailto:?subject=${subject}&body=${body}`);
  };

  const isDM = !isJoiningViaLink;
  const activePermissions = isDM ? { canMoveTokens: true, canEditCharacters: true, canRollDice: true } : permissions;

  const activeChar = characters[activeCharIndex] || characters[0];
  const activeParticipant = encounter[turnIndex];
  const activeTokenIds = React.useMemo(() => {
      if (!activeParticipant) return [];
      return mapTokens.filter(t => {
          if (t.linkedId) return t.linkedId == activeParticipant.id;
          return t.name === activeParticipant.name;
      }).map(t => t.id);
  }, [encounter, turnIndex, mapTokens]);

    const handleAddMonsterAsNPC = (monster: Monster) => {
        const newNPC: Character = {
            ...INITIAL_CHAR,
            id: generateId(),
            name: monster.name,
            race: monster.type,
            level: parseInt(monster.cr) || 0,
            ac: monster.ac,
            hp: { current: monster.hp, max: monster.hp, temp: 0 },
            attributes: monster.attributes ? { ...monster.attributes } : { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 },
            imageUrl: monster.imageUrl || ""
        };
        setNpcs(prev => [...prev, newNPC]);
        showToast(`${monster.name} adicionado aos NPCs.`);
    };

    const handleImportMonsterDrive = async () => {
        try {
            const json = (await openDrivePicker()) as any;
            if (json && json.name && json.hp) {
                const newMonster: Monster = {
                    ...json,
                    id: json.id || generateId()
                };
                setMonsters(prev => [...prev, newMonster]);
                showToast(`Monstro ${newMonster.name} importado do Drive.`);
            } else {
                showToast("Arquivo de monstro inválido.");
            }
        } catch (err) {
            if (err !== "CANCELLED") {
                console.error("Erro ao importar monstro do Drive", err);
                showToast("Erro ao acessar o Google Drive.");
            }
        }
    };

    const handleImportNPCDrive = async () => {
        try {
            const json = await openDrivePicker();
            const imported = processImportedCharacter(json);
            if (imported) {
                setNpcs(prev => [...prev, imported]);
                showToast(`NPC ${imported.name} importado do Drive.`);
            } else {
                showToast("Arquivo inválido ou formato não suportado.");
            }
        } catch (err) {
            if (err !== "CANCELLED") {
                console.error("Erro ao importar do Drive", err);
                showToast("Erro ao acessar o Google Drive.");
            }
        }
    };

  return (
    <div className={`h-screen w-screen flex flex-col overflow-hidden ${theme === 'dark' ? 'dark ' + bg.className : 'bg-stone-100'}`}>
      {confirmModal && (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4">
          <div className="bg-stone-900 border border-stone-700 p-6 rounded-xl shadow-2xl max-w-sm w-full animate-in zoom-in-95">
            <h3 className="text-lg font-bold text-white mb-4">{confirmModal.message}</h3>
            <div className="flex justify-end gap-3">
              <button onClick={() => { if (confirmModal.onCancel) confirmModal.onCancel(); setConfirmModal(null); }} className="px-4 py-2 bg-stone-800 hover:bg-stone-700 text-white rounded">Cancelar</button>
              <button onClick={() => { confirmModal.onConfirm(); setConfirmModal(null); }} className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white font-bold rounded">Confirmar</button>
            </div>
          </div>
        </div>
      )}
      {toastMessage && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-stone-800 text-white px-4 py-2 rounded-lg shadow-xl border border-stone-700 animate-in slide-in-from-top-2">
          {toastMessage}
        </div>
      )}
      {viewState === 'LAUNCHER' ? (
        <div className={`flex h-full w-full ${bg.className} relative overflow-hidden`}>
          {/* Launcher UI... (Identical to previous) */}
          <div className="hidden lg:flex w-1/2 relative flex-col justify-between p-12 overflow-hidden">
              <div className="absolute inset-0 bg-[url('https://drive.google.com/thumbnail?id=1LBa-K4kKe0YzK57xOd8MprAiGQRdUAvX&sz=s3000')] bg-cover bg-center opacity-60"></div>
              <div className={`absolute inset-0 bg-gradient-to-r from-transparent to-[${bg.className.replace('bg-', '')}]`}></div>
              <div className="relative z-10 animate-in slide-in-from-left duration-700">
                  <div className="flex items-center gap-3 mb-6">
                      <img src="/favicon.png" alt="Logo" className="w-16 h-16 drop-shadow-lg" onError={(e) => { e.currentTarget.style.display='none'; }} />
                      <h1 className="text-6xl font-cinzel font-bold text-stone-100 tracking-tighter drop-shadow-lg">RPGNEP</h1>
                  </div>
                  <p className="text-xl text-stone-300 max-w-md leading-relaxed font-serif italic drop-shadow-md">"Onde lendas são forjadas e destinos rolados."</p>
              </div>
              <div className="relative z-10 text-stone-500 text-sm flex gap-4 items-center">
                  <span>v2.1 • Ultimate</span>
                  <span>|</span>
                  <button onClick={() => setShowPrivacy(true)} className="hover:text-amber-500 transition-colors">Política de Privacidade</button>
                  <span>|</span>
                  <button onClick={() => setShowTerms(true)} className="hover:text-amber-500 transition-colors">Termos de Uso</button>
              </div>
          </div>

          <div className={`w-full lg:w-1/2 flex flex-col items-center justify-center p-8 ${bg.className} relative`}>
            <div className="w-full max-w-md space-y-8 animate-in zoom-in-95 duration-500">
                <div className="lg:hidden text-center mb-8">
                    <img src="/favicon.png" alt="Logo" className="w-20 h-20 mx-auto mb-4 drop-shadow-lg" onError={(e) => { e.currentTarget.style.display='none'; }} />
                    <h1 className="text-4xl font-cinzel font-bold text-white">RPGNEP</h1>
                </div>

                <div className="bg-[#161618] border border-stone-800 p-8 rounded-2xl shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-amber-600 to-transparent opacity-50"></div>
                    <h2 className="text-2xl font-bold text-white mb-6 text-center font-cinzel">Iniciar Aventura</h2>
                    
                    {!auth && (
                        <div className="mb-6 bg-red-900/30 text-red-400 p-4 rounded-lg border border-red-800/50 text-xs flex flex-col gap-2 animate-pulse">
                            <div className="flex items-center gap-2 font-bold">
                                <AlertTriangle size={16}/>
                                <span>CONFIGURAÇÃO PENDENTE</span>
                            </div>
                            <p>O Firebase não foi detectado. Para habilitar o modo online e login com Google, configure as chaves de API no menu <strong>Settings</strong> do AI Studio.</p>
                        </div>
                    )}

                    {hasLocalSave && !isJoiningViaLink && (
                        <button 
                            onClick={handleContinueSession}
                            className="w-full mb-6 bg-stone-800/80 hover:bg-stone-700 text-amber-400 font-bold py-3 rounded-lg border border-amber-900/50 flex items-center justify-center gap-2 transition-all shadow-md group animate-pulse"
                        >
                            <RotateCcw size={18} className="group-hover:-rotate-180 transition-transform duration-500"/>
                            CONTINUAR SESSÃO ANTERIOR (OFFLINE)
                        </button>
                    )}

                    {isJoiningViaLink && (
                        <div className="mb-4 bg-amber-900/30 text-amber-400 p-3 rounded-lg border border-amber-800/50 text-sm flex items-center gap-2">
                            <LinkIcon size={16}/>
                            <span>Você foi convidado para a mesa: <strong>{roomName}</strong></span>
                        </div>
                    )}

                    {!showPasswordPrompt ? (
                        <form onSubmit={(e) => handleLogin(e, 'popup')} className="space-y-5">
                            <div className="relative group">
                                <input className={`w-full bg-[#202022] border border-stone-700 rounded-lg p-4 text-white focus:border-${accentColor}-500 outline-none transition-all placeholder-stone-600 focus:bg-[#252528]`} id="room" placeholder="Nome da Sala (ex: Mesa do Dragão)" value={roomName} onChange={e => setRoomName(e.target.value)} readOnly={isJoiningViaLink} />
                            </div>
                            {isSyncing ? (
                                <div className="flex gap-2">
                                    <button type="button" disabled className={`flex-1 ${th.primary} opacity-70 text-white font-bold py-4 rounded-lg flex items-center justify-center gap-3 cursor-wait`}>
                                        <Loader2 className="animate-spin" /> CONECTANDO...
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {currentUser ? (
                                        <button type="button" onClick={() => attemptJoinRoom()} className={`w-full ${th.primary} ${th.hover} text-white font-bold py-3 rounded-lg transition-all flex items-center justify-center gap-3 shadow-lg hover:scale-[1.02] active:scale-95`}>
                                            <PlayCircle size={20} fill="currentColor" /> ENTRAR COMO {currentUser.displayName?.split(' ')[0] || 'CONVIDADO'}
                                        </button>
                                    ) : (
                                        <>
                                            <button type="submit" className={`w-full ${th.primary} ${th.hover} text-white font-bold py-3 rounded-lg transition-all flex items-center justify-center gap-3 shadow-lg hover:scale-[1.02] active:scale-95`}>
                                                <Zap size={20} fill="currentColor" /> ENTRAR COM GOOGLE
                                            </button>
                                            <button type="button" onClick={handleAnonymousLogin} className="w-full bg-[#252529] hover:bg-[#303035] text-stone-300 font-bold py-3 rounded-lg transition-all flex items-center justify-center gap-3 border border-stone-700 hover:border-stone-500">
                                                <UserCheck size={20} /> ENTRAR COMO CONVIDADO
                                            </button>
                                        </>
                                    )}
                                </div>
                            )}
                        </form>
                    ) : (
                        <div className="space-y-5 animate-in slide-in-from-right">
                            <div className="text-center text-stone-400 text-sm">Esta sala é protegida por senha.</div>
                            <div className="relative group">
                                <Key className="absolute left-3 top-4 text-stone-500" size={20} />
                                <input type="password" className={`w-full bg-[#202022] border border-stone-700 rounded-lg p-4 pl-10 text-white focus:border-${accentColor}-500 outline-none transition-all placeholder-stone-600 focus:bg-[#252528]`} placeholder="Senha da Campanha" value={passwordInput} onChange={e => setPasswordInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && verifyPassword()} />
                            </div>
                            <div className="flex gap-2">
                                <button onClick={() => setShowPasswordPrompt(false)} className="flex-1 bg-stone-800 hover:bg-stone-700 text-stone-300 font-bold py-3 rounded-lg">Voltar</button>
                                <button onClick={verifyPassword} className={`flex-1 ${th.primary} ${th.hover} text-white font-bold py-3 rounded-lg`}>Acessar</button>
                            </div>
                        </div>
                    )}
                    
                    {currentUser && !showPasswordPrompt && (
                        <div className="mt-4 text-center">
                            <button onClick={() => {if(auth) signOut(auth as Auth); setCurrentUser(null);}} className="text-xs text-stone-500 hover:text-white underline">Sair de {currentUser.email || 'Convidado'}</button>
                        </div>
                    )}

                    {!showPasswordPrompt && (
                        <button type="button" onClick={handleDemoMode} disabled={isSyncing} className="w-full mt-6 bg-transparent hover:bg-stone-800 text-stone-400 font-bold py-3 rounded-lg transition-all border border-stone-700 flex items-center justify-center gap-2 text-sm hover:text-white">
                            <PlayCircle size={16} /> MODO DEMONSTRAÇÃO
                        </button>
                    )}
                </div>
                
                <div className="text-center mt-4 lg:hidden flex gap-4 justify-center">
                    <button onClick={() => setShowPrivacy(true)} className="text-xs text-stone-600 hover:text-stone-400">Privacidade</button>
                    <button onClick={() => setShowTerms(true)} className="text-xs text-stone-600 hover:text-stone-400">Termos</button>
                </div>

                {authError && (
                    <div className="bg-red-900/20 p-4 rounded-lg border border-red-800/50 flex flex-col gap-2 animate-in fade-in slide-in-from-bottom-2">
                        <div className="flex items-start gap-3">
                            <AlertTriangle className="text-red-500 shrink-0 mt-1" size={20}/>
                            <div className="text-red-300 text-sm whitespace-pre-wrap flex-1">{authError}</div>
                        </div>
                    </div>
                )}
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* PC HEADER (Floating Glass UI) */}
          <header className={`hidden md:flex fixed top-4 left-6 right-6 z-40 rounded-2xl h-[60px] justify-between items-center px-6 transition-all hud-panel`}>
            {/* Logo & Navigation */}
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-3 group cursor-pointer" onClick={() => startTransition(() => setMode('SHEET'))}>
                <div className={`p-2 rounded-lg bg-gradient-to-br from-stone-800 to-stone-900 border border-white/5 group-hover:border-amber-500/50 transition-all shadow-md`}>
                    <img src="/favicon.png" alt="RPGNEP" className="w-6 h-6 object-contain group-hover:scale-110 transition-transform duration-300" onError={(e) => {e.currentTarget.style.display='none'; e.currentTarget.parentElement!.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-amber-500 transition-transform group-hover:rotate-180 duration-500"><path d="m21.64 3.64-1.28-1.28a1.21 1.21 0 0 0-1.72 0L2.36 18.64a1.21 1.21 0 0 0 0 1.72l1.28 1.28a1.2 1.2 0 0 0 1.72 0L21.64 5.36a1.2 1.2 0 0 0 0-1.72Z"/><path d="m14 7 3 3"/><path d="M5 6v4"/><path d="M19 14v4"/><path d="M10 2v2"/><path d="M7 8H5"/><path d="M21 16h-2"/><path d="M16 12h2"/></svg>'}} />
                </div>
                <div className="flex flex-col">
                    <h1 className="text-lg font-cinzel font-bold text-stone-200 tracking-widest group-hover:text-white transition-colors bg-clip-text text-transparent bg-gradient-to-r from-stone-100 to-stone-400">RPGNEP</h1>
                </div>
              </div>
              
              <nav className="flex items-center gap-1 bg-black/20 p-1 rounded-xl border border-white/5">
                {[
                    { id: 'SHEET', icon: User, label: 'Heróis' },
                    { id: 'NPC', icon: Users, label: 'NPCs' },
                    { id: 'VTT', icon: MapIcon, label: 'Mapa' },
                    { id: 'DM', icon: ShieldCheck, label: 'Mestre' },
                    { id: 'GM_DASHBOARD', icon: LayoutDashboard, label: 'Painel GM' },
                    { id: 'CHAT', icon: MessageSquare, label: 'Chat' },
                    { id: 'ADVENTURE', icon: PlayCircle, label: 'Aventura' }
                ].map((item) => (
                    <button 
                        key={item.id}
                        onClick={() => startTransition(() => setMode(item.id as any))}
                        className={`relative px-4 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2 transition-all duration-300 group ${
                            mode === item.id 
                            ? `bg-stone-800 text-amber-500 shadow-sm border border-stone-700` 
                            : 'text-stone-500 hover:text-stone-300 hover:bg-white/5'
                        }`}
                    >
                        <item.icon size={14} className={mode === item.id ? 'text-amber-500' : 'text-stone-600 group-hover:text-stone-400 transition-colors'} />
                        <span className="hidden lg:inline tracking-wide">{item.label}</span>
                    </button>
                ))}
              </nav>
            </div>

            {/* Room Info & Actions */}
            <div className="flex items-center gap-3">
                {isCloudSyncEnabled ? (
                    currentUser && (
                        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all duration-500 ${
                            syncStatus === 'saving' ? 'bg-amber-900/20 border border-amber-500/30 text-amber-400 animate-pulse' :
                            syncStatus === 'saved' ? 'bg-green-900/20 border border-green-500/30 text-green-400' :
                            syncStatus === 'error' ? 'bg-red-900/20 border border-red-500/30 text-red-400' :
                            'bg-stone-800/50 border border-stone-700 text-stone-500'
                        }`}>
                            {syncStatus === 'saving' ? <Loader2 size={14} className="animate-spin"/> : 
                             syncStatus === 'saved' ? <CheckCircle2 size={14}/> :
                             syncStatus === 'error' ? <AlertTriangle size={14}/> :
                             <Cloud size={14}/>}
                            <span>
                                {syncStatus === 'saving' ? 'Salvando...' : 
                                 syncStatus === 'saved' ? 'Salvo' :
                                 syncStatus === 'error' ? 'Erro Sync' :
                                 'Sincronizado'}
                            </span>
                        </div>
                    )
                ) : (
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-stone-800/50 border border-stone-700 rounded-lg text-stone-500 text-[10px] font-bold uppercase tracking-widest">
                        <CloudOff size={14}/> Local
                    </div>
                )}

                <button 
                    onClick={() => {
                        if (!isCloudSyncEnabled) {
                            showToast("Sincronização em nuvem desativada nas configurações.");
                            return;
                        }
                        if (currentUser && roomName && db) {
                            const campaignRef = ref(db, `campaigns/${sanitizeRoomName(roomName)}`);
                            get(campaignRef).then(snapshot => {
                                const data = snapshot.val();
                                if (data) {
                                    if (data.characters) setCharacters(data.characters.map(sanitizeCharacter));
                                    if (data.npcs) setNpcs(data.npcs.map(sanitizeCharacter));
                                    if (data.monsters) setMonsters(data.monsters);
                                    if (data.encounter) setEncounter(data.encounter);
                                    if (data.map) {
                                        if (data.map.grid) setMapGrid(data.map.grid);
                                        if (data.map.tokens) setMapTokens(data.map.tokens);
                                        if (data.map.fog) setFogGrid(data.map.fog);
                                        if (data.map.config) setMapConfig(data.map.config);
                                    }
                                    if (data.combat) {
                                        setTurnIndex(data.combat.turnIndex || -1);
                                        setTargetUid(data.combat.targetUid || null);
                                        setRound(data.combat.round || 1);
                                    }
                                    if (data.notes) setNotes(data.notes);
                                    if (data.permissions) setPermissions(data.permissions);
                                    addLogEntry('Sistema', 'Sessão sincronizada manualmente.', 'info');
                                }
                            });
                        }
                    }}
                    className="p-1.5 rounded-lg border border-white/5 bg-black/20 hover:bg-black/30 text-stone-400 hover:text-amber-500 transition-all"
                    title="Forçar Sincronização"
                >
                    <RefreshCw size={14} />
                </button>

                <div className={`hidden xl:flex items-center gap-3 px-3 py-1.5 rounded-lg border border-white/5 bg-black/20 hover:bg-black/30 transition-all group cursor-default shadow-inner`}>
                    <div className="flex items-center gap-2 text-xs text-stone-400">
                        {campaignPassword ? <Lock size={12} className="text-amber-500/80" /> : <Unlock size={12} className="text-emerald-500/80" />}
                        <span className="truncate max-w-[120px] font-bold text-stone-300 group-hover:text-white transition-colors">{campaignName || roomName}</span>
                    </div>
                    <div className="h-3 w-px bg-white/10"></div>
                    <button onClick={handleShare} className="text-stone-500 hover:text-blue-400 transition-colors p-1 rounded hover:bg-white/5" title="Copiar Link"><LinkIcon size={12}/></button>
                </div>

                <div className={`hidden lg:flex items-center justify-center w-8 h-8 rounded-full border text-[10px] font-bold transition-all shadow-sm bg-stone-500/10 text-stone-400 border-stone-500/20`} title="Offline">
                    <WifiOff size={14}/>
                </div>

                <div className="h-6 w-px bg-white/10 mx-1"></div>

                <div className="flex items-center gap-1">
                    <button onClick={handleEmailInvite} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/5 text-stone-400 hover:text-blue-400 transition-all" title="Convidar"><Mail size={18}/></button>
                    <button onClick={() => setShowDMScreen(!showDMScreen)} className={`w-8 h-8 flex items-center justify-center rounded-lg transition-all duration-300 ${showDMScreen ? 'bg-amber-500/20 text-amber-400 ring-1 ring-amber-500/50' : 'hover:bg-white/5 text-stone-400 hover:text-amber-400'}`} title="Escudo do Mestre"><BookOpen size={18}/></button>
                    <button onClick={() => setShowAI(!showAI)} className={`w-8 h-8 flex items-center justify-center rounded-lg transition-all duration-300 ${showAI ? 'bg-purple-500/20 text-purple-400 ring-1 ring-purple-500/50 shadow-[0_0_10px_rgba(168,85,247,0.3)]' : 'hover:bg-white/5 text-stone-400 hover:text-purple-400'}`} title="Oráculo IA"><Sparkles size={18}/></button>
                    <button onClick={() => setShowNotepad(!showNotepad)} className={`w-8 h-8 flex items-center justify-center rounded-lg transition-all duration-300 ${showNotepad ? 'bg-yellow-500/20 text-yellow-400 ring-1 ring-yellow-500/50' : 'hover:bg-white/5 text-stone-400 hover:text-yellow-400'}`} title="Bloco de Notas"><FileText size={18}/></button>
                    <button onClick={() => setShowSaveModal(true)} className={`w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/5 transition-all relative ${unsavedChanges ? 'text-amber-500' : 'text-stone-400 hover:text-green-400'}`} title="Salvar / Carregar"><Save size={18}/>{unsavedChanges && <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-amber-500 rounded-full shadow-[0_0_5px_#f59e0b] animate-pulse"></span>}</button>
                    <button onClick={() => setShowConfigModal(true)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/5 text-stone-400 hover:text-white transition-all" title="Configurações"><Settings size={18}/></button>
                    <button onClick={() => { if(auth) signOut(auth as Auth); startTransition(() => setViewState('LAUNCHER')); setCurrentUser(null); }} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-500/10 text-stone-400 hover:text-red-500 transition-all" title="Sair"><LogOut size={18}/></button>
                </div>
            </div>
          </header>

          {/* MOBILE HEADER (Visible on Mobile) */}
          <header className={`md:hidden fixed top-0 left-0 right-0 z-40 h-[60px] flex justify-between items-center px-4 hud-panel`}>
             <div className="flex items-center gap-3">
                <div className="p-1.5 rounded-lg bg-gradient-to-br from-stone-800 to-stone-900 border border-white/5">
                    <img src="/favicon.png" alt="RPGNEP" className="w-7 h-7 object-contain" onError={(e) => {e.currentTarget.style.display='none'; e.currentTarget.parentElement!.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-amber-500"><path d="m21.64 3.64-1.28-1.28a1.21 1.21 0 0 0-1.72 0L2.36 18.64a1.21 1.21 0 0 0 0 1.72l1.28 1.28a1.2 1.2 0 0 0 1.72 0L21.64 5.36a1.2 1.2 0 0 0 0-1.72Z"/><path d="m14 7 3 3"/><path d="M5 6v4"/><path d="M19 14v4"/><path d="M10 2v2"/><path d="M7 8H5"/><path d="M21 16h-2"/><path d="M16 12h2"/></svg>'}} />
                </div>
                <h1 className="text-lg font-cinzel font-bold text-stone-100 tracking-wider">RPGNEP</h1>
             </div>
             <div className="flex items-center gap-2">
                <button 
                    onClick={() => {
                        if (!isCloudSyncEnabled) {
                            showToast("Sincronização desativada.");
                            return;
                        }
                        if (currentUser && roomName && db) {
                            const campaignRef = ref(db, `campaigns/${sanitizeRoomName(roomName)}`);
                            get(campaignRef).then(snapshot => {
                                const data = snapshot.val();
                                if (data) {
                                    if (data.characters) setCharacters(data.characters.map(sanitizeCharacter));
                                    if (data.npcs) setNpcs(data.npcs.map(sanitizeCharacter));
                                    if (data.monsters) setMonsters(data.monsters);
                                    if (data.encounter) setEncounter(data.encounter);
                                    if (data.map) {
                                        if (data.map.grid) setMapGrid(data.map.grid);
                                        if (data.map.tokens) setMapTokens(data.map.tokens);
                                        if (data.map.fog) setFogGrid(data.map.fog);
                                        if (data.map.config) setMapConfig(data.map.config);
                                    }
                                    if (data.combat) {
                                        setTurnIndex(data.combat.turnIndex || -1);
                                        setTargetUid(data.combat.targetUid || null);
                                        setRound(data.combat.round || 1);
                                    }
                                    if (data.notes) setNotes(data.notes);
                                    if (data.permissions) setPermissions(data.permissions);
                                    addLogEntry('Sistema', 'Sessão sincronizada manualmente.', 'info');
                                }
                            });
                        }
                    }}
                    className="p-2.5 rounded-xl bg-stone-900 border border-stone-800 text-stone-400 active:scale-90 transition-transform"
                >
                    <RefreshCw size={20}/>
                </button>
                <button 
                    onClick={() => {
                        const r = Math.floor(Math.random() * 20) + 1;
                        broadcastChat(`🎲 Rolagem Rápida (d20): **${r}**`);
                        addLogEntry("Rolagem Rápida", `Rolou d20: ${r}`, r === 20 ? 'crit' : r === 1 ? 'fail' : 'dice');
                    }}
                    className="p-2.5 rounded-xl bg-stone-900 border border-stone-800 text-amber-500 active:scale-90 transition-transform"
                >
                    <Dices size={20}/>
                </button>
                <div className="h-6 w-px bg-white/10 mx-1"></div>
                <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-stone-300 p-2.5 rounded-xl bg-stone-900 border border-stone-800 active:scale-90 transition-transform"><Menu size={20}/></button>
             </div>
          </header>

          {/* MOBILE MENU DRAWER */}
          <AnimatePresence>
            {mobileMenuOpen && (
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex justify-end" 
                    onClick={() => setMobileMenuOpen(false)}
                >
                    <motion.div 
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="w-80 bg-[#0c0a09] h-full border-l border-stone-800 p-6 shadow-2xl flex flex-col" 
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="flex justify-between items-center mb-8 border-b border-stone-800 pb-4">
                            <div className="flex items-center gap-2">
                                <Settings size={18} className="text-stone-500"/>
                                <span className="font-bold text-lg text-stone-200 font-cinzel tracking-widest">Menu</span>
                            </div>
                            <button onClick={() => setMobileMenuOpen(false)} className="p-2 bg-stone-800 rounded-full text-stone-400 hover:text-white"><X size={18}/></button>
                        </div>
                        <div className="space-y-3 flex-1 overflow-y-auto custom-scrollbar pr-2">
                            <button onClick={() => {setShowDMScreen(!showDMScreen); setMobileMenuOpen(false);}} className="w-full flex items-center gap-4 p-4 rounded-2xl bg-stone-900/50 border border-stone-800/50 text-stone-300 font-bold transition-all active:bg-stone-800"><BookOpen size={20} className="text-amber-500"/> Escudo do Mestre</button>
                            <button onClick={() => {setShowAI(!showAI); setMobileMenuOpen(false);}} className="w-full flex items-center gap-4 p-4 rounded-2xl bg-stone-900/50 border border-stone-800/50 text-stone-300 font-bold transition-all active:bg-stone-800"><Sparkles size={20} className="text-purple-500"/> Oráculo IA</button>
                            <button onClick={() => {setShowNotepad(!showNotepad); setMobileMenuOpen(false);}} className="w-full flex items-center gap-4 p-4 rounded-2xl bg-stone-900/50 border border-stone-800/50 text-stone-300 font-bold transition-all active:bg-stone-800"><FileText size={20} className="text-yellow-500"/> Bloco de Notas</button>
                            <button onClick={() => {setShowSaveModal(true); setMobileMenuOpen(false);}} className="w-full flex items-center gap-4 p-4 rounded-2xl bg-stone-900/50 border border-stone-800/50 text-stone-300 font-bold transition-all active:bg-stone-800"><Save size={20} className="text-blue-500"/> Salvar / Carregar</button>
                            <button onClick={() => {setShowConfigModal(true); setMobileMenuOpen(false);}} className="w-full flex items-center gap-4 p-4 rounded-2xl bg-stone-900/50 border border-stone-800/50 text-stone-300 font-bold transition-all active:bg-stone-800"><Settings size={20} className="text-stone-500"/> Configurações</button>
                            <button onClick={handleShare} className="w-full flex items-center gap-4 p-4 rounded-2xl bg-stone-900/50 border border-stone-800/50 text-stone-300 font-bold transition-all active:bg-stone-800"><LinkIcon size={20} className="text-emerald-500"/> Compartilhar Sala</button>
                        </div>
                        <div className="border-t border-stone-800 pt-6 mt-auto">
                            <button onClick={() => { if(auth) signOut(auth as Auth); startTransition(() => setViewState('LAUNCHER')); }} className="w-full flex items-center gap-4 p-4 rounded-2xl bg-red-950/20 text-red-400 font-bold hover:bg-red-900/30 transition-all border border-red-900/20 active:scale-95"><LogOut size={20}/> Sair da Sessão</button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
          </AnimatePresence>

          {/* MOBILE BOTTOM NAVIGATION (Floating Dock) */}
          <nav className={`md:hidden fixed bottom-0 left-0 right-0 z-50 bg-stone-950/90 backdrop-blur-xl border-t border-stone-800/50 h-[72px] flex items-center justify-around px-2 pb-safe shadow-[0_-10px_40px_rgba(0,0,0,0.5)]`}>
            {[
                { id: 'SHEET', icon: User, label: 'Ficha' },
                { id: 'NPC', icon: Users, label: 'NPCs' },
                { id: 'VTT', icon: MapIcon, label: 'Mapa' },
                { id: 'DM', icon: ShieldCheck, label: 'Mestre' },
                { id: 'CHAT', icon: MessageSquare, label: 'Chat' },
                { id: 'ADVENTURE', icon: PlayCircle, label: 'Aventura' }
            ].map((item) => (
                <button 
                    key={item.id}
                    onClick={() => startTransition(() => setMode(item.id as AppMode))}
                    className={`relative flex flex-col items-center justify-center w-full h-full transition-all duration-300`}
                >
                    <div className={`p-2 rounded-2xl transition-all duration-500 relative ${mode === item.id ? 'text-amber-500' : 'text-stone-500'}`}>
                        {mode === item.id && (
                            <motion.div 
                                layoutId="mobile-nav-bg"
                                className="absolute inset-0 bg-amber-500/15 border border-amber-500/30 rounded-xl shadow-[0_0_15px_rgba(245,158,11,0.1)]"
                                transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                            />
                        )}
                        <item.icon size={22} className={`relative z-10 transition-transform duration-300 ${mode === item.id ? 'scale-110' : 'scale-100 opacity-70'}`} />
                    </div>
                    <span className={`text-[9px] font-black uppercase tracking-widest transition-all duration-300 mt-1 ${mode === item.id ? 'text-amber-500 opacity-100' : 'text-stone-600 opacity-0 hidden'}`}>
                        {item.label}
                    </span>
                </button>
            ))}
          </nav>

          <main className="flex-1 overflow-hidden relative flex mt-[60px] md:mt-[80px] h-[calc(100vh-132px)] md:h-[calc(100vh-80px)] pb-0 md:pb-0">
            <Suspense fallback={<div className="flex items-center justify-center h-full"><Loader2 className="animate-spin text-stone-500" /></div>}>
                <SoundController />
            </Suspense>
            {mode === 'SHEET' && (
                <aside className="hidden md:flex w-72 bg-stone-900/50 backdrop-blur-md border-r border-stone-800 flex-col z-20 shadow-xl">
                    <div className="p-5 border-b border-stone-800 flex justify-between items-center bg-stone-950/50">
                        <span className="text-xs font-bold text-stone-400 uppercase tracking-wider flex items-center gap-2"><LayoutDashboard size={14}/> Aventureiros</span>
                        <div className="flex gap-1">
                            <label className="p-2 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-400 hover:text-white cursor-pointer transition-all" title="Importar Ficha">
                                <FileUp size={16}/>
                                <input type="file" hidden accept=".json" onChange={handleCharacterImport} />
                            </label>
                            <button onClick={() => {const newC = {...INITIAL_CHAR, id: generateId()}; setCharacters([...characters, newC]); setActiveCharIndex(characters.length);}} className={`p-2 rounded-lg bg-stone-800 hover:bg-amber-600 text-stone-400 hover:text-white transition-all`} title="Novo Personagem"><Plus size={16}/></button>
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-2">
                        {characters.map((c, i) => (
                            <button 
                                key={c.id} 
                                onClick={() => setActiveCharIndex(i)} 
                                className={`w-full p-3 rounded-xl border text-left transition-all duration-300 group relative overflow-hidden ${
                                    activeCharIndex === i 
                                    ? `bg-gradient-to-r ${th.gradient} border-transparent shadow-lg transform scale-[1.02]` 
                                    : 'bg-stone-800/40 border-stone-800 hover:bg-stone-800 hover:border-stone-700'
                                }`}
                            >
                                <div className={`font-bold text-sm mb-1 ${activeCharIndex === i ? 'text-white' : 'text-stone-300 group-hover:text-white'}`}>{c.name}</div>
                                <div className={`text-[10px] flex justify-between items-center ${activeCharIndex === i ? 'text-white/80' : 'text-stone-500'}`}>
                                    <span className={`${activeCharIndex === i ? 'bg-white/20' : 'bg-black/20'} px-2 py-0.5 rounded-md`}>{c.class}</span>
                                    <span className="font-mono font-bold">Nvl {c.level}</span>
                                </div>
                            </button>
                        ))}
                    </div>
                </aside>
            )}

            <div className={`flex-1 overflow-hidden relative ${bg.className}`}>
                {mode === 'SHEET' && (
                <div className="h-full overflow-y-auto custom-scrollbar p-2 md:p-6 lg:p-8 pb-6">
                    {/* Mobile Character Toggle */}
                    <div className="md:hidden flex overflow-x-auto gap-3 mb-6 no-scrollbar pb-2 pt-2 px-1">
                        <button 
                            onClick={() => {const newC = {...INITIAL_CHAR, id: generateId()}; setCharacters([...characters, newC]); setActiveCharIndex(characters.length);}} 
                            className="flex-shrink-0 w-14 h-14 rounded-2xl bg-stone-900 border border-stone-800 flex items-center justify-center text-stone-500 shadow-lg active:scale-90 transition-transform"
                        >
                            <Plus size={28}/>
                        </button>
                        {characters.map((c, i) => (
                            <button 
                                key={c.id} 
                                onClick={() => setActiveCharIndex(i)}
                                className={`flex-shrink-0 px-6 py-3 rounded-2xl border text-sm font-black shadow-xl transition-all duration-300 relative overflow-hidden ${
                                    activeCharIndex === i 
                                    ? `bg-gradient-to-br ${th.gradient} text-white border-transparent scale-105 ring-2 ring-amber-500/20` 
                                    : 'bg-stone-900 border-stone-800 text-stone-500 active:bg-stone-800'
                                }`}
                            >
                                {c.name}
                                {activeCharIndex === i && (
                                    <motion.div 
                                        layoutId="active-char-indicator"
                                        className="absolute inset-0 bg-white/10"
                                        initial={false}
                                    />
                                )}
                            </button>
                        ))}
                    </div>

                    <Suspense fallback={<div className="flex items-center justify-center h-full"><Loader2 className="animate-spin text-stone-500" /></div>}>
                        <CharacterSheetMemo 
                            char={activeChar} 
                            setChar={(c: any) => {
                                const newChars = [...characters];
                                if (typeof c === 'function') {
                                    newChars[activeCharIndex] = c(newChars[activeCharIndex]);
                                } else {
                                    newChars[activeCharIndex] = c;
                                }
                                setCharacters(newChars);
                            }} 
                            onRoll={(d: number, mod: number, label: string) => {
                                const r1 = Math.floor(Math.random() * d) + 1;
                                const total = r1 + mod;
                                addLogEntry(label, `${activeChar.name} rolou ${label}: [${r1}] + ${mod} = ${total}`, r1 === 20 ? 'crit' : r1 === 1 ? 'fail' : 'dice');
                                broadcastChat(`🎲 Rolou ${label}: [${r1}]${mod>=0?'+':''}${mod} = **${total}**`);
                            }}
                            onDelete={() => {
                                if(characters.length <= 1) { showToast("Você precisa ter pelo menos um personagem."); return; }
                                setConfirmModal({
                                    message: `Excluir ${activeChar.name}?`,
                                    onConfirm: () => {
                                        const newChars = characters.filter(c => c.id !== activeChar.id);
                                        setCharacters(newChars);
                                        setActiveCharIndex(0);
                                    }
                                });
                            }}
                            permissions={activePermissions}
                            setConfirmModal={setConfirmModal}
                            addLog={addLogEntry}
                        />
                    </Suspense>
                </div>
                )}
                
                {mode === 'NPC' && (
                    <div className="h-full">
                        <Suspense fallback={<div className="flex items-center justify-center h-full"><Loader2 className="animate-spin text-stone-500" /></div>}>
                            <NPCManager 
                                npcs={npcs} 
                                monsters={monsters}
                                onUpdate={(updated) => setNpcs(prev => prev.map(n => n.id === updated.id ? updated : n))}
                                onAdd={() => setNpcs(prev => [...prev, { ...INITIAL_CHAR, id: generateId(), name: "Novo NPC", level: 0 }])}
                                onAddMonster={handleAddMonsterAsNPC}
                                onImportDrive={handleImportNPCDrive}
                                addLog={addLogEntry}
                                onDelete={(id) => setNpcs(prev => prev.filter(n => n.id !== id))}
                                onRoll={(d, mod, label) => {
                                    const r1 = Math.floor(Math.random() * d) + 1;
                                    const total = r1 + mod;
                                    addLogEntry(label, `Mestre rolou ${label}: [${r1}] + ${mod} = ${total}`, 'dice');
                                    broadcastChat(`🎲 Mestre rolou ${label}: [${r1}]${mod>=0?'+':''}${mod} = **${total}**`);
                                }}
                                setConfirmModal={setConfirmModal}
                            />
                        </Suspense>
                    </div>
                )}

                {mode === 'VTT' && (
                    <div className="h-full">
                        <Suspense fallback={<div className="flex items-center justify-center h-full"><Loader2 className="animate-spin text-stone-500" /></div>}>
                            <VirtualTabletopMemo 
                                mapGrid={mapGrid} 
                                setMapGrid={(g: string[][]) => broadcastMap(g, mapTokens, fogGrid)} 
                                tokens={mapTokens} 
                                setTokens={(t: any) => {
                                    const newVal = typeof t === 'function' ? t(mapTokens) : t;
                                    broadcastMap(mapGrid, newVal, fogGrid);
                                    
                                    // Check for HP changes to sync back to Encounter
                                    newVal.forEach((token: Token) => {
                                        if (token.linkedId) {
                                            setEncounter(prevEnc => prevEnc.map(p => {
                                                if (p.uid === token.linkedId && (p.hpCurrent !== token.hp)) {
                                                    return { ...p, hpCurrent: token.hp };
                                                }
                                                return p;
                                            }));
                                        }
                                    });
                                }}
                                fogGrid={fogGrid}
                                setFogGrid={(fog: boolean[][]) => broadcastMap(mapGrid, mapTokens, fog)}
                                characters={characters}
                                npcs={npcs}
                                monsters={monsters}
                                mapConfig={mapConfig}
                                setMapConfig={setMapConfig}
                                activeTokenIds={activeTokenIds}
                                permissions={activePermissions}
                                isDM={isDM}
                                setConfirmModal={setConfirmModal}
                            />
                        </Suspense>
                    </div>
                )}
                
                {mode === 'DM' && (
                <div className="h-full overflow-hidden">
                    <Suspense fallback={<div className="flex items-center justify-center h-full"><Loader2 className="animate-spin text-stone-500" /></div>}>
                        <DMToolsMemo 
                            encounter={encounter} 
                            setEncounter={(e: EncounterParticipant[]) => { 
                                setEncounter(e);
                                // Sync HP, Conditions and Inspiration to tokens
                                setMapTokens(prev => prev.map(t => {
                                    const p = e.find(part => part.uid === t.linkedId);
                                    if (p) {
                                        return { 
                                            ...t, 
                                            hp: p.hpCurrent, 
                                            max: p.hpMax,
                                            conditions: p.conditions || [],
                                            inspiration: p.inspiration || false
                                        };
                                    }
                                    return t;
                                }));
                                // Sync back to characters if linked
                                setCharacters(prevChars => prevChars.map(c => {
                                    const p = e.find(part => part.linkedCharId === c.id);
                                    if (p) {
                                        return {
                                            ...c,
                                            hp: { ...c.hp, current: p.hpCurrent, max: p.hpMax, temp: p.hpTemp || 0 },
                                            conditions: p.conditions || [],
                                            inspiration: p.inspiration || false
                                        };
                                    }
                                    return c;
                                }));
                            }} 
                            logs={logs} 
                            addLog={addLogEntry}
                            clearLogs={clearLogs}
                            characters={characters}
                            npcs={npcs}
                            monsters={monsters}
                            setMonsters={setMonsters}
                            turnIndex={turnIndex}
                            setTurnIndex={setTurnIndex}
                            turnCounter={turnCounter}
                            setTurnCounter={setTurnCounter}
                            targetUid={targetUid}
                            setTargetUid={setTargetUid}
                            round={round}
                            setRound={setRound}
                            permissions={permissions}
                            setPermissions={setPermissions}
                            setConfirmModal={setConfirmModal}
                            onImportMonsterDrive={handleImportMonsterDrive}
                        />
                    </Suspense>
                </div>
                )}

                {mode === 'GM_DASHBOARD' && (
                    <div className="flex h-full w-full overflow-hidden bg-stone-950 relative">
                        {/* GM Sidebar (Combat Tracker) */}
                        <div 
                            className={`flex flex-col border-r border-stone-800 bg-[#161619] z-20 shrink-0 shadow-2xl transition-all duration-300 ease-in-out absolute md:relative h-full ${
                                gmSidebarOpen ? 'translate-x-0 w-[280px] lg:w-[320px]' : '-translate-x-full md:w-0 md:opacity-0 md:overflow-hidden absolute'
                            }`}
                        >
                            <div className="flex items-center justify-between p-3 border-b border-stone-800 bg-stone-950/50">
                                <span className="text-xs font-black text-amber-500 uppercase tracking-widest flex items-center gap-2"><LayoutDashboard size={14}/> Centro de Comando</span>
                                <button onClick={() => setGmSidebarOpen(false)} className="p-1 text-stone-500 hover:text-white bg-stone-800/50 rounded-lg hover:bg-stone-800 transition-colors"><PanelLeftClose size={16}/></button>
                            </div>
                            <DMToolsMemo
                                encounter={encounter}
                                setEncounter={(e) => {
                                    setEncounter(e);
                                    setMapTokens(prev => prev.map(t => {
                                        const p = e.find(part => part.uid === t.linkedId);
                                        if (p) {
                                            return { 
                                                ...t, 
                                                hp: p.hpCurrent, 
                                                max: p.hpMax,
                                                conditions: p.conditions || [],
                                                inspiration: p.inspiration || false
                                            };
                                        }
                                        return t;
                                    }));
                                    setCharacters(prevChars => prevChars.map(c => {
                                        const p = e.find(part => part.linkedCharId === c.id);
                                        if (p) {
                                            return {
                                                ...c,
                                                hp: { ...c.hp, current: p.hpCurrent, max: p.hpMax, temp: p.hpTemp || 0 },
                                                conditions: p.conditions || [],
                                                inspiration: p.inspiration || false
                                            };
                                        }
                                        return c;
                                    }));
                                }}
                                logs={logs}
                                addLog={addLogEntry}
                                clearLogs={clearLogs}
                                characters={characters}
                                npcs={npcs}
                                monsters={monsters}
                                setMonsters={setMonsters}
                                turnIndex={turnIndex}
                                setTurnIndex={setTurnIndex}
                                turnCounter={turnCounter}
                                setTurnCounter={setTurnCounter}
                                targetUid={targetUid}
                                setTargetUid={setTargetUid}
                                compact={true}
                                round={round}
                                setRound={setRound}
                                permissions={permissions}
                                setPermissions={setPermissions}
                                setConfirmModal={setConfirmModal}
                                onImportMonsterDrive={handleImportMonsterDrive}
                            />
                        </div>

                        {/* Expand Button (when sidebar is closed) */}
                        {!gmSidebarOpen && (
                            <button 
                                onClick={() => setGmSidebarOpen(true)} 
                                className="absolute top-4 left-4 z-30 p-2 bg-stone-900 border border-stone-700 rounded-lg text-amber-500 hover:bg-stone-800 shadow-xl hover:scale-105 transition-all"
                                title="Abrir Painel GM"
                            >
                                <PanelLeftOpen size={20}/>
                            </button>
                        )}

                        {/* VTT Main View */}
                        <div className="flex-1 relative bg-stone-900/50">
                            <div className="absolute inset-0">
                                <VirtualTabletopMemo
                                    mapGrid={mapGrid}
                                    setMapGrid={(g) => broadcastMap(g, mapTokens, fogGrid)}
                                    tokens={mapTokens}
                                    setTokens={(t) => {
                                        const newVal = typeof t === 'function' ? t(mapTokens) : t;
                                        broadcastMap(mapGrid, newVal, fogGrid);
                                        newVal.forEach((token: Token) => {
                                            if (token.linkedId) {
                                                setEncounter(prevEnc => prevEnc.map(p => {
                                                    if (p.uid === token.linkedId && (p.hpCurrent !== token.hp)) {
                                                        return { ...p, hpCurrent: token.hp };
                                                    }
                                                    return p;
                                                }));
                                            }
                                        });
                                    }}
                                    fogGrid={fogGrid}
                                    setFogGrid={(fog) => broadcastMap(mapGrid, mapTokens, fog)}
                                    characters={characters}
                                    npcs={npcs}
                                    monsters={monsters}
                                    mapConfig={mapConfig}
                                    setMapConfig={setMapConfig}
                                    customAssets={customAssets}
                                    setCustomAssets={setCustomAssets}
                                    onSyncAsset={syncAsset}
                                    activeTokenIds={activeTokenIds}
                                    permissions={activePermissions}
                                    isDM={isDM}
                                    setConfirmModal={setConfirmModal}
                                />
                            </div>
                        </div>

                        {/* Unified Floating Utility Panel */}
                        <AnimatePresence>
                            {activeUtility !== 'none' && (
                                <motion.div 
                                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                                    className="fixed right-4 bottom-24 w-[320px] md:w-[360px] h-[500px] max-h-[75vh] rounded-3xl flex flex-col z-[100] shadow-[0_25px_60px_rgba(0,0,0,0.6)] border border-stone-800 bg-stone-950/95 backdrop-blur-2xl overflow-hidden ring-1 ring-white/5"
                                >
                                    <div className="p-1.5 border-b border-stone-800 flex justify-between items-center bg-stone-900/40">
                                        <div className="flex bg-stone-950/50 p-1 rounded-2xl border border-stone-800/50">
                                            <button 
                                                onClick={() => startTransition(() => setActiveUtility('chat'))}
                                                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all ${activeUtility === 'chat' ? 'bg-amber-500 text-stone-950 shadow-lg' : 'text-stone-500 hover:text-stone-300'}`}
                                            >
                                                <MessageSquare size={14}/> CHAT
                                            </button>
                                            <button 
                                                onClick={() => startTransition(() => setActiveUtility('dice'))}
                                                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all ${activeUtility === 'dice' ? 'bg-amber-500 text-stone-950 shadow-lg' : 'text-stone-500 hover:text-stone-300'}`}
                                            >
                                                <Dices size={14}/> DADOS
                                            </button>
                                        </div>
                                        <button onClick={() => startTransition(() => setActiveUtility('none'))} className="text-stone-500 hover:text-white p-2 hover:bg-stone-800 rounded-xl transition-all mr-1">
                                            <X size={18}/>
                                        </button>
                                    </div>
                                    <div className="flex-1 overflow-hidden relative">
                                        <Suspense fallback={<div className="flex items-center justify-center h-full"><Loader2 className="animate-spin text-stone-500" /></div>}>
                                            {activeUtility === 'chat' && (
                                                <Chat messages={chatMessages} onSendMessage={broadcastChat} onClearMessages={clearChatMessages} username={username} isFullPage={false} />
                                            )}
                                            {activeUtility === 'dice' && (
                                                <div className="h-full bg-stone-900/20 p-4 overflow-y-auto custom-scrollbar flex items-center justify-center">
                                                    <DiceTray onRoll={broadcastChat} permissions={activePermissions} forceOpen={true} />
                                                </div>
                                            )}
                                        </Suspense>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Integrated Floating Utility Toggle */}
                        <button 
                            onClick={() => {
                                startTransition(() => {
                                    if (activeUtility === 'none') {
                                        setActiveUtility('chat');
                                    } else {
                                        setActiveUtility('none');
                                    }
                                });
                            }}
                            className={`fixed bottom-6 right-6 z-[101] w-16 h-16 rounded-full border shadow-[0_10px_30px_rgba(0,0,0,0.5)] flex items-center justify-center transition-all hover:scale-110 active:scale-95 group overflow-hidden ${activeUtility !== 'none' ? 'bg-amber-500 text-stone-950 border-amber-400 rotate-0' : 'bg-stone-900 text-amber-500 border-stone-800'}`}
                            title={activeUtility !== 'none' ? "Fechar Ferramentas" : "Abrir Chat e Dados"}
                        >
                            <motion.div
                                animate={{ rotate: activeUtility !== 'none' ? 90 : 0 }}
                                transition={{ type: 'spring', damping: 15 }}
                                className="relative z-10"
                            >
                                {activeUtility !== 'none' ? <X size={32} /> : (
                                    <div className="relative">
                                        <MessageSquare size={28} className="absolute -top-1 -left-1 opacity-40 group-hover:opacity-100 transition-opacity" />
                                        <Dices size={28} className="relative z-10 translate-x-1 translate-y-1" />
                                    </div>
                                )}
                            </motion.div>
                            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none"></div>
                        </button>
                    </div>
                )}
                
                {mode === 'CHAT' && (
                    <div className="h-full w-full p-2 md:p-4 overflow-hidden bg-stone-950 flex flex-col items-center">
                        <div className="w-full max-w-4xl h-full flex flex-col">
                           <Suspense fallback={<div className="flex items-center justify-center h-full"><Loader2 className="animate-spin text-stone-500" /></div>}>
                                <Chat messages={chatMessages} onSendMessage={broadcastChat} onClearMessages={clearChatMessages} username={username} isFullPage={true} />
                           </Suspense>
                        </div>
                    </div>
                )}

                {mode === 'ADVENTURE' && (
                    <Suspense fallback={<div className="flex items-center justify-center h-full"><Loader2 className="animate-spin text-stone-500" /></div>}>
                        <AdventureMode />
                    </Suspense>
                )}
            </div>

            <Suspense fallback={null}>
                <AIChat isOpen={showAI} onClose={() => setShowAI(false)} characters={characters} encounter={encounter} mapTokens={mapTokens} notes={notes} campaignName={campaignName || roomName} />
            </Suspense>
            <Suspense fallback={null}>
                <DMScreen isOpen={showDMScreen} onClose={() => setShowDMScreen(false)} />
            </Suspense>

            {/* CONFIG MODAL */}
            {showConfigModal && (
                <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-[#1c1c1e] border border-stone-700 w-full max-w-lg rounded-2xl shadow-2xl p-6 relative"
                    >
                        <button onClick={() => setShowConfigModal(false)} className="absolute top-4 right-4 text-stone-500 hover:text-white"><X size={20}/></button>
                        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2 font-cinzel"><Settings className="text-amber-500"/> Configurações de Aparência</h3>
                        
                        <div className="space-y-6">
                            {/* Tema */}
                            <div>
                                <h4 className="text-xs font-bold text-stone-500 uppercase tracking-widest mb-3">Tema do Sistema</h4>
                                <div className="grid grid-cols-2 gap-3">
                                    <button 
                                        onClick={() => setTheme('light')} 
                                        className={`py-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-all border ${theme === 'light' ? 'bg-white text-black border-white' : 'bg-stone-800 text-stone-400 border-stone-700 hover:bg-stone-700'}`}
                                    >
                                        <Sun size={18}/> Claro
                                    </button>
                                    <button 
                                        onClick={() => setTheme('dark')} 
                                        className={`py-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-all border ${theme === 'dark' ? 'bg-stone-900 text-white border-stone-600' : 'bg-stone-800 text-stone-400 border-stone-700 hover:bg-stone-700'}`}
                                    >
                                        <Moon size={18}/> Escuro
                                    </button>
                                </div>
                            </div>

                            {/* Cor de Destaque */}
                            <div>
                                <h4 className="text-xs font-bold text-stone-500 uppercase tracking-widest mb-3">Cor de Destaque</h4>
                                <div className="flex flex-wrap gap-3">
                                    {(Object.keys(THEMES) as ThemeColor[]).map(color => (
                                        <button 
                                            key={color}
                                            onClick={() => setAccentColor(color)}
                                            className={`w-10 h-10 rounded-full border-2 transition-all transform hover:scale-110 ${accentColor === color ? 'border-white scale-110 shadow-lg' : 'border-transparent opacity-60 hover:opacity-100'} ${THEMES[color].primary}`}
                                            title={color}
                                        />
                                    ))}
                                </div>
                            </div>

                            {/* Cloud Sync Toggle */}
                            <div className="bg-stone-900/50 p-4 rounded-xl border border-stone-800 flex items-center justify-between">
                                <div>
                                    <h4 className="text-sm font-bold text-stone-200">Sincronização em Nuvem</h4>
                                    <p className="text-[10px] text-stone-500">Salvar automaticamente no Realtime Database (Multiplayer)</p>
                                </div>
                                <button 
                                    onClick={() => setIsCloudSyncEnabled(!isCloudSyncEnabled)}
                                    className={`w-12 h-6 rounded-full transition-all relative ${isCloudSyncEnabled ? 'bg-amber-600' : 'bg-stone-700'}`}
                                >
                                    <motion.div 
                                        animate={{ x: isCloudSyncEnabled ? 26 : 2 }}
                                        className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-lg"
                                    />
                                </button>
                            </div>

                            {/* Fundo da Mesa */}
                            <div>
                                <h4 className="text-xs font-bold text-stone-500 uppercase tracking-widest mb-3">Ambiente da Mesa</h4>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-48 overflow-y-auto custom-scrollbar p-1">
                                    {Object.entries(BG_THEMES).map(([key, value]) => (
                                        <button 
                                            key={key}
                                            onClick={() => setBgTheme(key)}
                                            className={`p-2 rounded-lg text-[10px] font-bold border transition-all ${bgTheme === key ? 'bg-stone-700 border-amber-500 text-white' : 'bg-stone-800/50 border-stone-700 text-stone-500 hover:border-stone-500'}`}
                                        >
                                            <div className={`w-full h-8 rounded mb-1 ${value.className} border border-white/5`}></div>
                                            {value.name}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Estilo da HUD */}
                            <div>
                                <h4 className="text-xs font-bold text-stone-500 uppercase tracking-widest mb-3">Estilo da HUD</h4>
                                <div className="grid grid-cols-3 gap-3">
                                    <button 
                                        onClick={() => setHudStyle('glass')} 
                                        className={`py-3 rounded-lg font-bold flex flex-col items-center justify-center gap-1 transition-all border ${hudStyle === 'glass' ? 'bg-stone-800 text-amber-500 border-amber-500' : 'bg-stone-900 text-stone-400 border-stone-700 hover:bg-stone-800'}`}
                                    >
                                        <span className="text-sm">Vidro</span>
                                        <span className="text-[10px] font-normal opacity-70">Moderno</span>
                                    </button>
                                    <button 
                                        onClick={() => setHudStyle('solid')} 
                                        className={`py-3 rounded-lg font-bold flex flex-col items-center justify-center gap-1 transition-all border ${hudStyle === 'solid' ? 'bg-stone-800 text-amber-500 border-amber-500' : 'bg-stone-900 text-stone-400 border-stone-700 hover:bg-stone-800'}`}
                                    >
                                        <span className="text-sm">Sólido</span>
                                        <span className="text-[10px] font-normal opacity-70">Clássico</span>
                                    </button>
                                    <button 
                                        onClick={() => setHudStyle('minimal')} 
                                        className={`py-3 rounded-lg font-bold flex flex-col items-center justify-center gap-1 transition-all border ${hudStyle === 'minimal' ? 'bg-stone-800 text-amber-500 border-amber-500' : 'bg-stone-900 text-stone-400 border-stone-700 hover:bg-stone-800'}`}
                                    >
                                        <span className="text-sm">Mínimo</span>
                                        <span className="text-[10px] font-normal opacity-70">Limpo</span>
                                    </button>
                                </div>
                            </div>

                            {/* Fonte */}
                            <div>
                                <h4 className="text-xs font-bold text-stone-500 uppercase tracking-widest mb-3">Estilo de Fonte</h4>
                                <div className="grid grid-cols-2 gap-3">
                                    <button 
                                        onClick={() => {
                                            document.body.style.fontFamily = "'Inter', sans-serif";
                                            localStorage.setItem('rpgnep_font', 'sans');
                                        }} 
                                        className={`py-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-all border bg-stone-800 text-stone-400 border-stone-700 hover:bg-stone-700 font-sans`}
                                    >
                                        Moderno (Sans)
                                    </button>
                                    <button 
                                        onClick={() => {
                                            document.body.style.fontFamily = "'Cinzel', serif";
                                            localStorage.setItem('rpgnep_font', 'cinzel');
                                        }} 
                                        className={`py-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-all border bg-stone-800 text-stone-400 border-stone-700 hover:bg-stone-700 font-cinzel`}
                                    >
                                        Épico (Cinzel)
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 pt-4 border-t border-stone-800 flex justify-between items-center">
                            <button 
                                onClick={() => {
                                    setTheme('dark');
                                    setAccentColor('amber');
                                    setBgTheme('stone');
                                }}
                                className="text-xs text-stone-500 hover:text-white underline"
                            >
                                Resetar Padrões
                            </button>
                            <button 
                                onClick={() => setShowConfigModal(false)}
                                className={`px-6 py-2 rounded-lg font-bold text-white ${th.primary} ${th.hover} transition-all shadow-lg`}
                            >
                                Salvar Alterações
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}

            {/* SAVE MODAL */}
            {showSaveModal && (
                <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-[#1c1c1e] border border-stone-700 w-full max-w-lg rounded-2xl shadow-2xl p-6 relative animate-in zoom-in-95">
                        <button onClick={() => setShowSaveModal(false)} className="absolute top-4 right-4 text-stone-500 hover:text-white"><X size={20}/></button>
                        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2 font-cinzel"><Save className="text-amber-500"/> Salvar & Carregar</h3>
                        
                        <div className="space-y-6">
                            {/* LOCAL */}
                            <div className="bg-[#121214] p-4 rounded-xl border border-stone-800">
                                <h4 className="text-xs font-bold text-stone-500 uppercase tracking-widest mb-3">Armazenamento Local (Arquivo)</h4>
                                <div className="grid grid-cols-2 gap-3">
                                    <button onClick={handleLocalSave} className="bg-stone-800 hover:bg-stone-700 text-stone-300 py-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-all border border-stone-700">
                                        <Download size={18}/> Baixar JSON
                                    </button>
                                    <label className="bg-stone-800 hover:bg-stone-700 text-stone-300 py-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-all border border-stone-700 cursor-pointer">
                                        <Upload size={18}/> Carregar JSON
                                        <input type="file" hidden accept=".json" onChange={handleLocalLoad} ref={localLoadRef} />
                                    </label>
                                </div>
                            </div>

                            {/* CLOUD */}
                            <div className="bg-[#121214] p-4 rounded-xl border border-stone-800 relative overflow-hidden">
                                <h4 className="text-xs font-bold text-stone-500 uppercase tracking-widest mb-3 flex items-center gap-2"><Cloud size={14}/> Nuvem (Google Drive)</h4>
                                
                                <div className="space-y-3">
                                    {!isDriveReady ? (
                                        <div className="text-center py-4 text-stone-500 text-xs">
                                            {driveStatus === 'error' ? 'Erro na conexão com Drive.' : 'Conectando ao Google Drive...'}
                                        </div>
                                    ) : (
                                        <>
                                            <div className="flex gap-2">
                                                <input 
                                                    className="flex-1 bg-stone-900 border border-stone-700 rounded-lg px-3 text-sm text-white focus:border-blue-500 outline-none"
                                                    placeholder="Nome do Arquivo (Opcional)"
                                                    value={saveFilename}
                                                    onChange={e => setSaveFilename(e.target.value)}
                                                />
                                                <button onClick={executeSave} disabled={isDriveLoading} className="bg-blue-700 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 disabled:opacity-50 transition-all">
                                                    {isDriveLoading ? <Loader2 className="animate-spin"/> : <Upload size={18}/>} Salvar
                                                </button>
                                            </div>
                                            <button onClick={handlePickFromDrive} disabled={isDriveLoading} className="w-full bg-stone-800 hover:bg-stone-700 text-blue-400 border border-blue-900/30 py-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-all">
                                                <Cloud size={18}/> Carregar do Drive
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 pt-4 border-t border-stone-800 text-center text-[10px] text-stone-600">
                            Recomendamos salvar regularmente. O autosave local é temporário.
                        </div>
                    </div>
                </div>
            )}
            
            {showNotepad && (
                <div className="fixed top-[80px] right-4 md:right-20 w-[90%] md:w-96 bg-[#1c1917]/90 backdrop-blur-xl border border-stone-700 shadow-2xl rounded-2xl z-[60] flex flex-col overflow-hidden animate-in slide-in-from-top-5 ring-1 ring-white/10">
                    <div className="bg-gradient-to-r from-yellow-900/20 to-stone-900/50 p-3 flex justify-between items-center border-b border-stone-700 cursor-move">
                        <div className="flex items-center gap-2 text-yellow-500 font-bold text-sm">
                            <FileText size={18}/> Bloco de Notas
                        </div>
                        <button onClick={() => setShowNotepad(false)} className="text-stone-500 hover:text-white transition-colors p-1 hover:bg-white/10 rounded"><X size={18}/></button>
                    </div>
                    <textarea 
                        className="w-full h-80 p-5 bg-transparent resize-y outline-none text-stone-300 text-sm leading-relaxed font-mono placeholder-stone-700"
                        placeholder="Anotações rápidas da sessão..."
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                    />
                    <div className="bg-stone-900/50 p-2 text-[10px] text-stone-500 text-center border-t border-stone-800 font-bold uppercase tracking-widest">
                        Sincronizado automaticamente
                    </div>
                </div>
            )}
          </main>
        </>
      )}
    </div>
  );
}
