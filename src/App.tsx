
import React, { useState, useEffect, useRef } from 'react';
import { AppMode, Character, EncounterParticipant, LogEntry, Token, CampaignData, ChatMessage, MapConfig, Monster } from './types';
import { CharacterSheet } from './components/CharacterSheet';
import { DMTools } from './components/DMTools';
import { VirtualTabletop } from './components/VirtualTabletop';
import { Chat } from './components/Chat';
import { AIChat } from './components/AIChat';
import { NPCManager } from './components/NPCManager';
import { DiceTray } from './components/DiceTray';
import { PrivacyPolicy } from './components/PrivacyPolicy';
import { TermsOfService } from './components/TermsOfService';
import { SoundController } from './components/SoundController';
import { DMScreen } from './components/DMScreen';
import { User, Sun, Moon, Plus, Save, Upload, Zap, Globe, ShieldCheck, LogOut, Cloud, Loader2, Map as MapIcon, Settings, Sparkles, MessageSquare, PlayCircle, WifiOff, AlertTriangle, Key, Link as LinkIcon, Lock, Unlock, Users, Mail, UserCheck, X, Download, FileUp, FileText, LayoutDashboard, Menu, RotateCcw, PanelLeftClose, PanelLeftOpen, BookOpen } from 'lucide-react';
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
  return {
    ...INITIAL_CHAR,
    ...char,
    id: char.id || generateId(),
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
    tileSize: 32, 
    bgUrl: null,
    bgX: 0,
    bgY: 0,
    bgScale: 1
};

const AUTOSAVE_KEY = 'rpgnep_autosave_v2';

export default function App() {
  const [viewState, setViewState] = useState<'LAUNCHER' | 'APP'>('LAUNCHER');
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [roomName, setRoomName] = useState('Minha Campanha');
  const [campaignName, setCampaignName] = useState(''); 
  const [campaignPassword, setCampaignPassword] = useState(''); 
  
  const [isSyncing, setIsSyncing] = useState(false);
  const [authError, setAuthError] = useState('');
  const [isJoiningViaLink, setIsJoiningViaLink] = useState(false);

  const [showPasswordPrompt, setShowPasswordPrompt] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [pendingRoomId, setPendingRoomId] = useState('');

  const [mode, setMode] = useState<AppMode>('SHEET');
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [accentColor, setAccentColor] = useState<ThemeColor>('amber');
  const [bgTheme, setBgTheme] = useState<string>('stone');
  
  const [characters, setCharacters] = useState<Character[]>([{ ...INITIAL_CHAR, id: generateId() }]);
  const [npcs, setNpcs] = useState<Character[]>([]); 
  const [monsters, setMonsters] = useState<Monster[]>(DEFAULT_MONSTERS);
  const [activeCharIndex, setActiveCharIndex] = useState(0);
  const [encounter, setEncounter] = useState<EncounterParticipant[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [notes, setNotes] = useState('');
  
  const [mapGrid, setMapGrid] = useState<string[][]>(Array(40).fill(null).map(() => Array(40).fill('⬜||')));
  const [mapTokens, setMapTokens] = useState<Token[]>([]);
  const [fogGrid, setFogGrid] = useState<boolean[][]>(Array(40).fill(null).map(() => Array(40).fill(false))); 
  const [mapConfig, setMapConfig] = useState<MapConfig>(DEFAULT_MAP_CONFIG);

  const [turnIndex, setTurnIndex] = useState<number>(-1);
  const [targetUid, setTargetUid] = useState<number | null>(null);
  const [round, setRound] = useState<number>(1); // Added Round Tracking

  const [isDriveReady, setIsDriveReady] = useState(false);
  const [driveStatus, setDriveStatus] = useState<'disconnected' | 'connected' | 'saving' | 'error'>('disconnected');
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false); 
  const [showTerms, setShowTerms] = useState(false); 
  const [showAI, setShowAI] = useState(false);
  const [showNotepad, setShowNotepad] = useState(false);
  const [showDMScreen, setShowDMScreen] = useState(false); // Added DM Screen state
  const [isDriveLoading, setIsDriveLoading] = useState(false);
  const [unsavedChanges, setUnsavedChanges] = useState(false);
  const [isOnlineMultiplayer, setIsOnlineMultiplayer] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [gmSidebarOpen, setGmSidebarOpen] = useState(true);
  
  const [hasLocalSave, setHasLocalSave] = useState(false);

  const isRemoteUpdate = useRef(false);
  const updateTimeout = useRef<any>(null);
  
  const [saveFilename, setSaveFilename] = useState('');
  const localLoadRef = useRef<HTMLInputElement>(null);
  const username = currentUser?.displayName || "Jogador";

  const th = THEMES[accentColor];
  const bg = BG_THEMES[bgTheme] || BG_THEMES['stone'];

  useEffect(() => {
    if (theme === 'dark') document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [theme]);

  // Check for local save on boot
  useEffect(() => {
      const saved = localStorage.getItem(AUTOSAVE_KEY);
      if (saved) setHasLocalSave(true);
  }, []);

  // Autosave Effect
  useEffect(() => {
      if (viewState === 'APP' && !isOnlineMultiplayer && characters.length > 0) {
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
                  combat: { turnIndex, targetUid, round },
                  notes
              };
              localStorage.setItem(AUTOSAVE_KEY, JSON.stringify(backup));
              setUnsavedChanges(false); // Local saved counts as saved for simple users
          }, 2000);
          return () => clearTimeout(timeout);
      }
  }, [characters, npcs, monsters, encounter, logs, mapGrid, mapTokens, fogGrid, mapConfig, turnIndex, targetUid, notes, viewState, isOnlineMultiplayer, campaignName, roomName, round]);

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
              }
              if (data.notes) setNotes(data.notes);

              setCurrentUser({ uid: 'offline', displayName: 'Viajante', isAnonymous: true } as any);
              setTimeout(() => {
                  setViewState('APP');
                  setIsSyncing(false);
              }, 500);
          }
      } catch(e) {
          console.error("Erro ao recuperar sessão", e);
          alert("Erro ao recuperar sessão anterior.");
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
    if (!auth) return;
    const unsubscribe = onAuthStateChanged(auth as Auth, (user) => {
      if (user) setCurrentUser(user);
      else setViewState('LAUNCHER');
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
      } catch (e) { 
          console.error("Drive Init Fail", e); 
          setDriveStatus('error');
      }
    };
    const t = setTimeout(() => {
        if (currentUser && !currentUser.isAnonymous) initDrive();
    }, 1000);
    return () => clearTimeout(t);
  }, [viewState, currentUser]);

  useEffect(() => {
      const handleBeforeUnload = (e: BeforeUnloadEvent) => {
          if (unsavedChanges && isOnlineMultiplayer) { e.preventDefault(); e.returnValue = ''; }
      };
      window.addEventListener('beforeunload', handleBeforeUnload);
      return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [unsavedChanges, isOnlineMultiplayer]);

  useEffect(() => {
      if (viewState === 'APP') {
          if (isOnlineMultiplayer) setUnsavedChanges(true);
          const isOfflineUser = !currentUser || currentUser.isAnonymous || currentUser.uid === 'demo' || currentUser.uid === 'offline';
          const database = db;

          if (!isRemoteUpdate.current && roomName && database && !isOfflineUser) {
              if (updateTimeout.current) clearTimeout(updateTimeout.current);
              updateTimeout.current = setTimeout(() => {
                  const campaignRef = ref(database, `campaigns/${sanitizeRoomName(roomName)}`);
                  const payload: CampaignData = {
                      version: '2.0',
                      timestamp: Date.now(),
                      name: campaignName || roomName,
                      password: campaignPassword,
                      characters,
                      npcs, 
                      monsters,
                      encounter,
                      logs, 
                      map: { grid: mapGrid, tokens: mapTokens, fog: fogGrid, config: mapConfig },
                      combat: { turnIndex, targetUid, round },
                      notes
                  };
                  update(campaignRef, { ...payload, lastUpdate: Date.now() }).catch(e => console.error("Sync Error", e));
              }, 1000); 
          }
          isRemoteUpdate.current = false;
      }
  }, [characters, npcs, encounter, mapGrid, mapTokens, monsters, fogGrid, turnIndex, targetUid, campaignName, campaignPassword, notes, mapConfig, currentUser, roomName, round]);

  const sanitizeRoomName = (name: string) => name.trim().toLowerCase().replace(/[.#$[\]]/g, '_');

  useEffect(() => {
      if (viewState !== 'APP' || !roomName || !db) return;
      if (currentUser?.uid === 'offline' || currentUser?.uid === 'demo') return;

      const database = db;
      const cleanRoom = sanitizeRoomName(roomName);
      const campaignRef = ref(database, `campaigns/${cleanRoom}`);
      const logsRef = ref(database, `campaigns/${cleanRoom}/logs`);
      const chatRef = ref(database, `campaigns/${cleanRoom}/chat`);

      setIsOnlineMultiplayer(true);

      const unsubscribeData = onValue(campaignRef, (snapshot) => {
          const data = snapshot.val();
          if (data && data.lastUpdate) {
              isRemoteUpdate.current = true;
              if (data.name) setCampaignName(data.name);
              if (data.password) setCampaignPassword(data.password);
              if (data.characters) setCharacters(data.characters.map(sanitizeCharacter));
              if (data.npcs) setNpcs(data.npcs.map(sanitizeCharacter));
              if (data.monsters) setMonsters(data.monsters);
              if (data.encounter) {
                  // Sanitize remote encounter data
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
                  if (data.map.fog) setFogGrid(data.map.fog);
                  if (data.map.config) setMapConfig(prev => ({ ...prev, ...data.map.config }));
              }
              if (data.combat) {
                  setTurnIndex(data.combat.turnIndex ?? -1);
                  setTargetUid(data.combat.targetUid ?? null);
                  setRound(data.combat.round || 1);
              }
              if (data.notes) setNotes(data.notes);
          } else if (!data) {
              setCampaignName(roomName);
          }
      });

      const unsubscribeLogs = onValue(logsRef, (snapshot) => {
          const data = snapshot.val();
          if (data) {
              const logArray = Object.values(data).reverse() as LogEntry[];
              const parsedLogs = logArray.map(l => ({...l, timestamp: new Date(l.timestamp)}));
              setLogs(parsedLogs);
          }
      });

      const unsubscribeChat = onValue(chatRef, (snapshot) => {
          const data = snapshot.val();
          if (data) {
              const chatArray = Object.values(data) as ChatMessage[];
              chatArray.sort((a, b) => a.timestamp - b.timestamp);
              setChatMessages(chatArray);
          }
      });

      return () => {
          unsubscribeData();
          unsubscribeLogs();
          unsubscribeChat();
          setIsOnlineMultiplayer(false);
      };
  }, [viewState, roomName, currentUser]);

  const broadcastMap = (grid: string[][], tokens: Token[], fog?: boolean[][]) => {
    setMapGrid(grid); 
    setMapTokens(tokens);
    if (fog) setFogGrid(fog);
  };

  const broadcastChat = (text: string) => {
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
    
    if (roomName && db) {
        const cleanRoom = sanitizeRoomName(roomName);
        const newMsgRef = push(ref(db, `campaigns/${cleanRoom}/chat`));
        set(newMsgRef, msg);
    }
  };

  const addLogEntry = (title: string, details: string, type?: LogEntry['type']) => {
      const safeType = type || 'info';
      const entry: LogEntry = { id: Date.now(), title, details, timestamp: new Date(), type: safeType, author: username };
      setLogs(prev => [entry, ...prev]);
      if (roomName && db) {
          const cleanRoom = sanitizeRoomName(roomName);
          const newLogRef = push(ref(db, `campaigns/${cleanRoom}/logs`));
          set(newLogRef, { ...entry, timestamp: entry.timestamp.getTime() });
      }
  };

  const checkRoomPassword = async (room: string) => {
      if (!db) return true;
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
      if (!roomName.trim()) { alert("Digite o nome da sala."); return; }
      setIsSyncing(true);
      if (currentUser?.uid === 'demo' || currentUser?.uid === 'offline') {
          setViewState('APP');
          setIsSyncing(false);
          return;
      }
      const requiredPwd = await checkRoomPassword(roomName);
      if (requiredPwd) {
          setIsSyncing(false);
          setPendingRoomId(requiredPwd); 
          setShowPasswordPrompt(true);
      } else {
          setViewState('APP');
          setIsSyncing(false);
      }
  };

  const verifyPassword = () => {
      if (passwordInput === pendingRoomId) {
          setShowPasswordPrompt(false);
          setViewState('APP');
      } else {
          alert("Senha incorreta!");
      }
  };

  const handleLogin = async (e: React.FormEvent, method: 'popup' | 'redirect' = 'popup') => {
    e.preventDefault();
    setIsSyncing(true);
    setAuthError('');
    if (!auth || !googleProvider) { setIsSyncing(false); setAuthError("Erro Crítico: Configuração do Firebase incompleta."); return; }
    try {
      if (!currentUser) {
          if (method === 'popup') await signInWithPopup(auth as Auth, googleProvider);
          else { await signInWithRedirect(auth as Auth, googleProvider); return; }
      }
      setIsSyncing(false);
      attemptJoinRoom();
    } catch (e: any) { handleAuthError(e); }
  };

  const handleAnonymousLogin = async () => {
      setIsSyncing(true);
      try {
          if (!auth) throw new Error("Auth module missing");
          await signInAnonymously(auth as Auth);
          setIsSyncing(false);
          attemptJoinRoom();
      } catch (e: any) {
          if (e.code !== 'auth/admin-restricted-operation') handleAuthError(e);
          else {
              setCurrentUser({ uid: 'offline', displayName: 'Viajante', isAnonymous: true } as any);
              setIsSyncing(false);
              setViewState('APP');
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
            { id: 1, x: 10, y: 10, icon: '🛡️', hp: 30, max: 30, color: '#3b82f6', size: 1, width: 1, height: 1, name: "Valeros" },
            { id: 2, x: 11, y: 10, icon: '🧙‍♂️', hp: 20, max: 20, color: '#a855f7', size: 1, width: 1, height: 1, name: "Ezren" },
            { id: 3, x: 15, y: 10, icon: '💀', hp: 7, max: 7, color: '#ef4444', size: 1, width: 1, height: 1, name: "Goblin 1" },
            { id: 4, x: 15, y: 12, icon: '💀', hp: 7, max: 7, color: '#ef4444', size: 1, width: 1, height: 1, name: "Goblin 2" }
        ];
        setMapTokens(demoTokens);
        setMapGrid(Array(40).fill(null).map(() => Array(40).fill('⬜||')));
        setNotes('Bem-vindo à demonstração!\nUse este espaço para anotações rápidas.');
        setCurrentUser({ uid: 'demo', displayName: 'Visitante', isAnonymous: true } as unknown as any);
        setViewState('APP');
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
            alert("Mesa carregada com sucesso!");
            setUnsavedChanges(false);
        } else {
            const importedChar = processImportedCharacter(json);
            if (importedChar) {
                setCharacters(prev => [...prev, importedChar]);
                setActiveCharIndex(characters.length);
                alert(`Personagem "${importedChar.name}" importado com sucesso!`);
            } else { throw new Error("Formato não reconhecido"); }
        }
      } catch (err) { alert("Erro ao carregar arquivo."); console.error(err); }
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
                  alert(`Personagem "${importedChar.name}" adicionado!`);
              } else { alert("Arquivo inválido."); }
          } catch(err) { console.error(err); alert("Erro ao ler arquivo."); }
      };
      reader.readAsText(file);
      e.target.value = '';
  };

  const executeSave = async () => {
    if (!isDriveConfigured()) { alert("Erro: Google Drive não configurado."); return; }
    setIsDriveLoading(true);
    setDriveStatus('saving');
    try {
      const data: CampaignData = { version: '2.0', timestamp: Date.now(), name: campaignName || roomName, characters, npcs, encounter, logs, map: { grid: mapGrid, tokens: mapTokens, fog: fogGrid, config: mapConfig }, monsters, combat: { turnIndex, targetUid, round }, notes };
      const fileData = await saveFileToDrive(saveFilename || campaignName || roomName, data) as any;
      alert('Campanha salva com sucesso no Google Drive!');
      if (fileData && fileData.webViewLink) window.open(fileData.webViewLink, '_blank');
      setShowSaveModal(false);
      setUnsavedChanges(false);
      setDriveStatus('connected');
    } catch (e: any) { console.error("Drive Save Error:", e); setDriveStatus('error'); alert(`Erro ao salvar no Drive: ${e.message || e.error}`); }
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
            alert("Campanha carregada com sucesso!");
            setShowSaveModal(false);
            setUnsavedChanges(false);
            setDriveStatus('connected');
        } else { throw new Error("Formato inválido"); }
      }
    } catch (e: any) { if (e !== "CANCELLED") { console.error(e); setDriveStatus('error'); alert("Erro ao carregar do Drive: " + e); } else { setDriveStatus('connected'); } }
    setIsDriveLoading(false);
  };

  const getInviteLink = () => {
      const baseUrl = window.location.origin + window.location.pathname;
      return `${baseUrl}?room=${encodeURIComponent(roomName)}`;
  };

  const handleShare = async () => {
      const link = getInviteLink();
      const shareData = { title: `RPGNEP - ${campaignName}`, text: `Venha jogar RPG comigo na mesa "${campaignName}"!`, url: link };
      if (navigator.share) { try { await navigator.share(shareData); } catch (e) { /* ignore abort */ } } else { navigator.clipboard.writeText(link); alert(`Link de convite copiado!\n\n${link}`); }
  };

  const handleEmailInvite = () => {
      const link = getInviteLink();
      const subject = encodeURIComponent(`Convite para RPG: ${campaignName}`);
      const body = encodeURIComponent(`Olá!\n\nVocê foi convidado para participar de uma sessão de RPG no RPGNEP.\n\nMesa: ${campaignName}\nLink de Acesso: ${link}\n\nNos vemos lá!`);
      window.open(`mailto:?subject=${subject}&body=${body}`);
  };

  const activeChar = characters[activeCharIndex] || characters[0];
  const activeParticipant = encounter[turnIndex];
  const activeTokenIds = React.useMemo(() => {
      if (!activeParticipant) return [];
      return mapTokens.filter(t => {
          if (t.linkedId) return t.linkedId == activeParticipant.id;
          return t.name === activeParticipant.name;
      }).map(t => t.id);
  }, [encounter, turnIndex, mapTokens]);

  return (
    <div className={`h-screen w-screen flex flex-col overflow-hidden ${theme === 'dark' ? 'dark ' + bg.className : 'bg-stone-100'}`}>
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
          <header className="hidden md:flex fixed top-4 left-6 right-6 z-40 bg-stone-950/80 backdrop-blur-md border border-white/10 rounded-2xl h-[60px] justify-between items-center shadow-2xl px-6 transition-all">
            {/* Logo & Navigation */}
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-3 group cursor-pointer" onClick={() => setMode('SHEET')}>
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
                    { id: 'CHAT', icon: MessageSquare, label: 'Chat' }
                ].map((item) => (
                    <button 
                        key={item.id}
                        onClick={() => setMode(item.id as any)}
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
                <div className={`hidden xl:flex items-center gap-3 px-3 py-1.5 rounded-lg border border-white/5 bg-black/20 hover:bg-black/30 transition-all group cursor-default shadow-inner`}>
                    <div className="flex items-center gap-2 text-xs text-stone-400">
                        {campaignPassword ? <Lock size={12} className="text-amber-500/80" /> : <Unlock size={12} className="text-emerald-500/80" />}
                        <span className="truncate max-w-[120px] font-bold text-stone-300 group-hover:text-white transition-colors">{campaignName || roomName}</span>
                    </div>
                    <div className="h-3 w-px bg-white/10"></div>
                    <button onClick={handleShare} className="text-stone-500 hover:text-blue-400 transition-colors p-1 rounded hover:bg-white/5" title="Copiar Link"><LinkIcon size={12}/></button>
                </div>

                <div className={`hidden lg:flex items-center justify-center w-8 h-8 rounded-full border text-[10px] font-bold transition-all shadow-sm ${
                    isOnlineMultiplayer 
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-emerald-900/20' 
                    : 'bg-red-500/10 text-red-400 border-red-500/20'
                }`} title={isOnlineMultiplayer ? "Online" : "Offline"}>
                    {isOnlineMultiplayer ? <Globe size={14}/> : <WifiOff size={14}/>}
                </div>

                <div className="h-6 w-px bg-white/10 mx-1"></div>

                <div className="flex items-center gap-1">
                    <button onClick={handleEmailInvite} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/5 text-stone-400 hover:text-blue-400 transition-all" title="Convidar"><Mail size={18}/></button>
                    <button onClick={() => setShowDMScreen(!showDMScreen)} className={`w-8 h-8 flex items-center justify-center rounded-lg transition-all duration-300 ${showDMScreen ? 'bg-amber-500/20 text-amber-400 ring-1 ring-amber-500/50' : 'hover:bg-white/5 text-stone-400 hover:text-amber-400'}`} title="Escudo do Mestre"><BookOpen size={18}/></button>
                    <button onClick={() => setShowAI(!showAI)} className={`w-8 h-8 flex items-center justify-center rounded-lg transition-all duration-300 ${showAI ? 'bg-purple-500/20 text-purple-400 ring-1 ring-purple-500/50 shadow-[0_0_10px_rgba(168,85,247,0.3)]' : 'hover:bg-white/5 text-stone-400 hover:text-purple-400'}`} title="Oráculo IA"><Sparkles size={18}/></button>
                    <button onClick={() => setShowNotepad(!showNotepad)} className={`w-8 h-8 flex items-center justify-center rounded-lg transition-all duration-300 ${showNotepad ? 'bg-yellow-500/20 text-yellow-400 ring-1 ring-yellow-500/50' : 'hover:bg-white/5 text-stone-400 hover:text-yellow-400'}`} title="Bloco de Notas"><FileText size={18}/></button>
                    <button onClick={() => setShowSaveModal(true)} className={`w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/5 transition-all relative ${unsavedChanges ? 'text-amber-500' : 'text-stone-400 hover:text-green-400'}`} title="Salvar / Carregar"><Save size={18}/>{unsavedChanges && <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-amber-500 rounded-full shadow-[0_0_5px_#f59e0b] animate-pulse"></span>}</button>
                    <button onClick={() => setShowConfigModal(true)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/5 text-stone-400 hover:text-white transition-all" title="Configurações"><Settings size={18}/></button>
                    <button onClick={() => { if(auth) signOut(auth as Auth); setViewState('LAUNCHER'); setCurrentUser(null); }} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-500/10 text-stone-400 hover:text-red-500 transition-all" title="Sair"><LogOut size={18}/></button>
                </div>
            </div>
          </header>

          {/* MOBILE HEADER (Visible on Mobile) */}
          <header className={`md:hidden fixed top-0 left-0 right-0 z-40 bg-stone-950/80 backdrop-blur-md border-b border-white/10 h-[56px] flex justify-between items-center px-4 shadow-md`}>
             <div className="flex items-center gap-3">
                <img src="/favicon.png" alt="RPGNEP" className="w-8 h-8 object-contain" onError={(e) => {e.currentTarget.style.display='none'; e.currentTarget.parentElement!.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-amber-500"><path d="m21.64 3.64-1.28-1.28a1.21 1.21 0 0 0-1.72 0L2.36 18.64a1.21 1.21 0 0 0 0 1.72l1.28 1.28a1.2 1.2 0 0 0 1.72 0L21.64 5.36a1.2 1.2 0 0 0 0-1.72Z"/><path d="m14 7 3 3"/><path d="M5 6v4"/><path d="M19 14v4"/><path d="M10 2v2"/><path d="M7 8H5"/><path d="M21 16h-2"/><path d="M16 12h2"/></svg>'}} />
                <h1 className="text-lg font-cinzel font-bold text-white tracking-widest">RPGNEP</h1>
             </div>
             <div className="flex items-center gap-4">
                <div className={`w-2.5 h-2.5 rounded-full ${isOnlineMultiplayer ? 'bg-emerald-500 shadow-[0_0_8px_#10b981]' : 'bg-red-500'}`}></div>
                <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-stone-400 p-2 rounded-lg hover:bg-white/10 active:bg-white/20"><Menu size={22}/></button>
             </div>
          </header>

          {/* MOBILE MENU DRAWER */}
          {mobileMenuOpen && (
              <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex justify-end" onClick={() => setMobileMenuOpen(false)}>
                  <div className="w-72 bg-[#121214] h-full border-l border-stone-800 p-5 animate-in slide-in-from-right shadow-2xl flex flex-col" onClick={e => e.stopPropagation()}>
                      <div className="flex justify-between items-center mb-8 border-b border-stone-800 pb-4">
                          <span className="font-bold text-lg text-stone-200 font-cinzel">Menu</span>
                          <button onClick={() => setMobileMenuOpen(false)} className="p-2 bg-stone-800 rounded-full text-stone-400 hover:text-white"><X size={18}/></button>
                      </div>
                      <div className="space-y-3 flex-1">
                          <button onClick={() => {setShowDMScreen(!showDMScreen); setMobileMenuOpen(false);}} className="w-full flex items-center gap-3 p-3 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-300 font-bold transition-all"><BookOpen size={18} className="text-amber-500"/> Escudo do Mestre</button>
                          <button onClick={() => {setShowAI(!showAI); setMobileMenuOpen(false);}} className="w-full flex items-center gap-3 p-3 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-300 font-bold transition-all"><Sparkles size={18} className="text-purple-500"/> Oráculo IA</button>
                          <button onClick={() => {setShowNotepad(!showNotepad); setMobileMenuOpen(false);}} className="w-full flex items-center gap-3 p-3 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-300 font-bold transition-all"><FileText size={18} className="text-yellow-500"/> Bloco de Notas</button>
                          <button onClick={() => {setShowSaveModal(true); setMobileMenuOpen(false);}} className="w-full flex items-center gap-3 p-3 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-300 font-bold transition-all"><Save size={18} className="text-blue-500"/> Salvar / Carregar</button>
                          <button onClick={() => {setShowConfigModal(true); setMobileMenuOpen(false);}} className="w-full flex items-center gap-3 p-3 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-300 font-bold transition-all"><Settings size={18} className="text-stone-500"/> Configurações</button>
                          <button onClick={handleShare} className="w-full flex items-center gap-3 p-3 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-300 font-bold transition-all"><LinkIcon size={18} className="text-emerald-500"/> Compartilhar Sala</button>
                      </div>
                      <div className="border-t border-stone-800 pt-4 mt-auto">
                          <button onClick={() => { if(auth) signOut(auth as Auth); setViewState('LAUNCHER'); }} className="w-full flex items-center gap-3 p-3 rounded-xl bg-red-950/30 text-red-400 font-bold hover:bg-red-900/50 transition-all border border-red-900/30"><LogOut size={18}/> Sair</button>
                      </div>
                  </div>
              </div>
          )}

          {/* MOBILE BOTTOM NAVIGATION (Floating Dock) */}
          <nav className="md:hidden fixed bottom-6 left-4 right-4 z-40 bg-stone-950/80 backdrop-blur-xl border border-white/10 rounded-2xl h-[64px] flex items-center justify-around px-2 shadow-2xl pb-safe">
            {[
                { id: 'SHEET', icon: User, label: 'Herói' },
                { id: 'NPC', icon: Users, label: 'NPCs' },
                { id: 'VTT', icon: MapIcon, label: 'Mapa' },
                { id: 'DM', icon: ShieldCheck, label: 'Mestre' },
                { id: 'CHAT', icon: MessageSquare, label: 'Chat' }
            ].map((item) => (
                <button 
                    key={item.id}
                    onClick={() => setMode(item.id as AppMode)}
                    className={`relative flex flex-col items-center justify-center w-full h-full gap-1 transition-all group`}
                >
                    <div className={`p-2 rounded-xl transition-all duration-300 ${mode === item.id ? 'bg-amber-500 text-stone-950 -translate-y-2 shadow-lg shadow-amber-900/50' : 'text-stone-500 group-hover:text-stone-300'}`}>
                        <item.icon size={mode === item.id ? 20 : 20} className={mode === item.id ? '' : 'opacity-70'} />
                    </div>
                    {mode === item.id && <span className="text-[9px] font-bold uppercase tracking-tight text-amber-500 absolute bottom-1 animate-in fade-in slide-in-from-bottom-1">{item.label}</span>}
                </button>
            ))}
          </nav>

          <main className="flex-1 overflow-hidden relative flex mt-0 md:mt-[80px] h-screen md:h-[calc(100vh-80px)]">
            <SoundController />
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
                <div className="h-full overflow-y-auto custom-scrollbar p-2 md:p-6 lg:p-8 pb-24 md:pb-6">
                    {/* Mobile Character Toggle */}
                    <div className="md:hidden flex overflow-x-auto gap-2 mb-4 no-scrollbar pb-2 pt-14">
                        <button onClick={() => {const newC = {...INITIAL_CHAR, id: generateId()}; setCharacters([...characters, newC]); setActiveCharIndex(characters.length);}} className="flex-shrink-0 w-12 h-12 rounded-2xl bg-stone-800 border border-stone-700 flex items-center justify-center text-stone-400 shadow-md"><Plus size={24}/></button>
                        {characters.map((c, i) => (
                            <button 
                                key={c.id} 
                                onClick={() => setActiveCharIndex(i)}
                                className={`flex-shrink-0 px-5 py-3 rounded-2xl border text-xs font-bold shadow-md transition-all ${activeCharIndex === i ? `bg-gradient-to-br ${th.gradient} text-white border-transparent` : 'bg-stone-900 border-stone-800 text-stone-500'}`}
                            >
                                {c.name}
                            </button>
                        ))}
                    </div>

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
                            if(characters.length <= 1) { alert("Você precisa ter pelo menos um personagem."); return; }
                            if(window.confirm(`Excluir ${activeChar.name}?`)) {
                                const newChars = characters.filter(c => c.id !== activeChar.id);
                                setCharacters(newChars);
                                setActiveCharIndex(0);
                            }
                        }}
                    />
                </div>
                )}
                
                {mode === 'NPC' && (
                    <div className="h-full pt-14 md:pt-0">
                        <NPCManager 
                            npcs={npcs} 
                            onUpdate={(updated) => setNpcs(prev => prev.map(n => n.id === updated.id ? updated : n))}
                            onAdd={() => setNpcs(prev => [...prev, { ...INITIAL_CHAR, id: generateId(), name: "Novo NPC", level: 0 }])}
                            onDelete={(id) => setNpcs(prev => prev.filter(n => n.id !== id))}
                            onRoll={(d, mod, label) => {
                                const r1 = Math.floor(Math.random() * d) + 1;
                                const total = r1 + mod;
                                addLogEntry(label, `Mestre rolou ${label}: [${r1}] + ${mod} = ${total}`, 'dice');
                                broadcastChat(`🎲 Mestre rolou ${label}: [${r1}]${mod>=0?'+':''}${mod} = **${total}**`);
                            }}
                        />
                    </div>
                )}

                {mode === 'VTT' && (
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
                    />
                )}
                
                {mode === 'DM' && (
                <div className="h-full overflow-hidden pt-14 md:pt-0">
                    <DMToolsMemo 
                        encounter={encounter} 
                        setEncounter={(e: EncounterParticipant[]) => { 
                            setEncounter(e);
                            // Sync HP to tokens
                            setMapTokens(prev => prev.map(t => {
                                const p = e.find(part => part.uid === t.linkedId);
                                if (p && (t.hp !== p.hpCurrent)) {
                                    return { ...t, hp: p.hpCurrent };
                                }
                                return t;
                            }));
                        }} 
                        logs={logs} 
                        addLog={addLogEntry}
                        characters={characters}
                        npcs={npcs}
                        monsters={monsters}
                        setMonsters={setMonsters}
                        turnIndex={turnIndex}
                        setTurnIndex={setTurnIndex}
                        targetUid={targetUid}
                        setTargetUid={setTargetUid}
                        round={round}
                        setRound={setRound}
                    />
                </div>
                )}

                {mode === 'GM_DASHBOARD' && (
                    <div className="flex h-full w-full overflow-hidden bg-stone-950 relative pt-14 md:pt-0">
                        {/* GM Sidebar (Combat Tracker) */}
                        <div 
                            className={`flex flex-col border-r border-stone-800 bg-[#161619] z-20 shrink-0 shadow-2xl transition-all duration-300 ease-in-out absolute md:relative h-full ${
                                gmSidebarOpen ? 'translate-x-0 w-[350px] lg:w-[400px]' : '-translate-x-full md:w-0 md:opacity-0 md:overflow-hidden absolute'
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
                                        if (p && (t.hp !== p.hpCurrent)) {
                                            return { ...t, hp: p.hpCurrent };
                                        }
                                        return t;
                                    }));
                                }}
                                logs={logs}
                                addLog={addLogEntry}
                                characters={characters}
                                npcs={npcs}
                                monsters={monsters}
                                setMonsters={setMonsters}
                                turnIndex={turnIndex}
                                setTurnIndex={setTurnIndex}
                                targetUid={targetUid}
                                setTargetUid={setTargetUid}
                                compact={true}
                                round={round}
                                setRound={setRound}
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
                                    activeTokenIds={activeTokenIds}
                                />
                            </div>
                        </div>
                    </div>
                )}
                
                {mode === 'CHAT' && (
                    <div className="h-full w-full p-2 md:p-4 overflow-hidden bg-stone-950 flex flex-col items-center pt-16 md:pt-4">
                        <div className="w-full max-w-4xl h-full flex flex-col">
                           <Chat messages={chatMessages} onSendMessage={broadcastChat} username={username} isFullPage={true} />
                        </div>
                    </div>
                )}
            </div>

            <AIChat isOpen={showAI} onClose={() => setShowAI(false)} characters={characters} encounter={encounter} notes={notes} campaignName={campaignName || roomName} />
            <DMScreen isOpen={showDMScreen} onClose={() => setShowDMScreen(false)} />
            <DiceTray onRoll={broadcastChat} />

            {/* SAVE MODAL (RESTAURADO) */}
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
