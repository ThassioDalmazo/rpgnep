
import React, { useState, useEffect, useRef, useCallback } from 'react';
/* Added Monster to the imports from ./types */
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
// Fix: Added missing icons X, Download, FileUp and aliased Map as MapIcon to support both usage styles in the app
import { Dices, User, Sun, Moon, Plus, Save, Upload, Zap, Globe, ShieldCheck, LogOut, Cloud, CloudLightning, Loader2, Map, Map as MapIcon, Settings, CheckCircle2, Sparkles, MessageSquare, PlayCircle, WifiOff, AlertTriangle, Key, Link as LinkIcon, Lock, Unlock, Users, Mail, UserCheck, X, Download, FileUp, FileText, PenTool, LayoutDashboard, Menu, Shield, Scale } from 'lucide-react';
import { DEFAULT_MONSTERS, INITIAL_CHAR } from './constants';

import { auth, googleProvider, db, isDriveConfigured } from './firebaseConfig';

// Modular Firebase Auth Imports
import { 
  getRedirectResult, 
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

// Função auxiliar para converter JSON legado ou validar JSON novo
const processImportedCharacter = (json: any): Character | null => {
    // 1. Formato RPGNEP Moderno
    if (json.id && json.attributes && json.attributes.str !== undefined) {
        return sanitizeCharacter(json);
    }

    // 2. Formato Legado (Detectado pelos campos específicos)
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

        // Mapear perícias
        const skillMap: Record<string, string> = {
            'acrobacia': 'acrobacia', 'adestrar': 'adestrar', 'arcanismo': 'arcanismo',
            'atletismo': 'atletismo', 'atuacao': 'atuacao', 'enganacao': 'enganacao',
            'furtividade': 'furtividade', 'historia': 'historia', 'intimidacao': 'intimidacao',
            'intuicao': 'intuicao', 'investigacao': 'investigacao', 'medicina': 'medicina',
            'natureza': 'natureza', 'percepcao': 'percepcao', 'persuasao': 'persuasao',
            'prestidigitacao': 'prestidigitacao', 'religiao': 'religiao', 'sobrevivencia': 'sobrevivencia'
        };
        
        Object.keys(skillMap).forEach(k => {
            if (json[`prof_${k}`] !== undefined) {
                converted.skills[skillMap[k]] = !!json[`prof_${k}`];
            }
        });

        return converted;
    }

    return null;
};

type ThemeColor = 'amber' | 'blue' | 'purple' | 'emerald' | 'rose';
const THEMES: Record<ThemeColor, { primary: string, hover: string, text: string, border: string, ring: string, bgSoft: string }> = {
    amber: { primary: 'bg-amber-600', hover: 'hover:bg-amber-500', text: 'text-amber-500', border: 'border-amber-500', ring: 'ring-amber-500', bgSoft: 'bg-amber-900/20' },
    blue: { primary: 'bg-blue-600', hover: 'hover:bg-blue-500', text: 'text-blue-500', border: 'border-blue-500', ring: 'ring-blue-500', bgSoft: 'bg-blue-900/20' },
    purple: { primary: 'bg-purple-600', hover: 'hover:bg-purple-500', text: 'text-purple-500', border: 'border-purple-500', ring: 'ring-purple-500', bgSoft: 'bg-purple-900/20' },
    emerald: { primary: 'bg-emerald-600', hover: 'hover:bg-emerald-500', text: 'text-emerald-500', border: 'border-emerald-500', ring: 'ring-emerald-500', bgSoft: 'bg-amber-900/20' },
    rose: { primary: 'bg-rose-600', hover: 'hover:bg-rose-500', text: 'text-rose-500', border: 'border-rose-500', ring: 'ring-rose-500', bgSoft: 'bg-rose-900/20' },
};

const DEFAULT_MAP_CONFIG: MapConfig = {
    scale: 1.5,
    unit: 'm',
    gridColor: '#ffffff',
    gridOpacity: 0.15,
    gridStyle: 'line',
    tileSize: 32, // Resolução padrão
    bgUrl: null,
    bgX: 0,
    bgY: 0,
    bgScale: 1
};

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
  
  const [characters, setCharacters] = useState<Character[]>([{ ...INITIAL_CHAR, id: generateId() }]);
  const [npcs, setNpcs] = useState<Character[]>([]); // Estado dos NPCs
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

  const [isDriveReady, setIsDriveReady] = useState(false);
  const [driveStatus, setDriveStatus] = useState<'disconnected' | 'connected' | 'saving' | 'error'>('disconnected');
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false); // Estado para o modal de privacidade
  const [showTerms, setShowTerms] = useState(false); // Estado para o modal de Termos de Uso
  const [showAI, setShowAI] = useState(false);
  const [showNotepad, setShowNotepad] = useState(false);
  const [isDriveLoading, setIsDriveLoading] = useState(false);
  const [unsavedChanges, setUnsavedChanges] = useState(false);
  const [isOnlineMultiplayer, setIsOnlineMultiplayer] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const isRemoteUpdate = useRef(false);
  const updateTimeout = useRef<any>(null);
  
  const [saveFilename, setSaveFilename] = useState('');
  const localLoadRef = useRef<HTMLInputElement>(null);
  const username = currentUser?.displayName || "Jogador";

  const th = THEMES[accentColor];

  useEffect(() => {
    if (theme === 'dark') document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [theme]);

  // Função centralizada para tratar erros de autenticação
  const handleAuthError = (e: any) => {
      console.error("Auth Error:", e);
      setIsSyncing(false);
      
      let errorMessage = `Erro ao conectar: ${e.message}`;
      
      if (e.code === 'auth/popup-closed-by-user') {
          errorMessage = 'Janela de login foi fechada antes da conclusão.';
      } else if (e.code === 'auth/unauthorized-domain') {
          const currentDomain = window.location.hostname;
          errorMessage = `DOMÍNIO NÃO AUTORIZADO (${currentDomain}).\n\nPara corrigir:\n1. Acesse o Firebase Console.\n2. Vá em Authentication > Settings > Authorized Domains.\n3. Adicione "${currentDomain}" à lista.`;
      } else if (e.code === 'auth/operation-not-allowed') {
          errorMessage = 'O método de login (Google) não está ativado no Firebase Console.';
      } else if (e.code === 'auth/network-request-failed') {
          errorMessage = 'Erro de conexão. Verifique sua internet.';
      }

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
    
    // Auth State Observer using Modular syntax
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
          if (unsavedChanges) { e.preventDefault(); e.returnValue = ''; }
      };
      window.addEventListener('beforeunload', handleBeforeUnload);
      return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [unsavedChanges]);

  useEffect(() => {
      if (viewState === 'APP') {
          setUnsavedChanges(true);
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
                      combat: { turnIndex, targetUid },
                      notes
                  };
                  update(campaignRef, { ...payload, lastUpdate: Date.now() }).catch(e => console.error("Sync Error", e));
              }, 1000); 
          }
          isRemoteUpdate.current = false;
      }
  }, [characters, npcs, encounter, mapGrid, mapTokens, monsters, fogGrid, turnIndex, targetUid, campaignName, campaignPassword, notes, mapConfig, currentUser, roomName]);

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
              if (data.encounter) setEncounter(data.encounter);
              if (data.map) {
                  setMapGrid(data.map.grid || []);
                  setMapTokens(data.map.tokens || []);
                  if (data.map.fog) setFogGrid(data.map.fog);
                  if (data.map.config) setMapConfig(prev => ({ ...prev, ...data.map.config }));
              }
              if (data.combat) {
                  setTurnIndex(data.combat.turnIndex ?? -1);
                  setTargetUid(data.combat.targetUid ?? null);
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
    
    if (!auth || !googleProvider) {
        setIsSyncing(false);
        setAuthError("Erro Crítico: Configuração do Firebase incompleta.");
        return;
    }

    try {
      if (!currentUser) {
          if (method === 'popup') await signInWithPopup(auth as Auth, googleProvider);
          else { await signInWithRedirect(auth as Auth, googleProvider); return; }
      }
      setIsSyncing(false);
      attemptJoinRoom();
    } catch (e: any) { 
        handleAuthError(e);
    }
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
              // Fallback for projects where anonymous auth is disabled
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
        version: '2.0', timestamp: Date.now(), name: campaignName || roomName, characters, npcs, encounter, logs, map: { grid: mapGrid, tokens: mapTokens, fog: fogGrid, config: mapConfig }, monsters, combat: { turnIndex, targetUid }, notes
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
        
        // Verifica se é uma campanha completa (possui array de personagens)
        if (json.characters && Array.isArray(json.characters)) {
            const data = json as CampaignData;
            if (data.name) setCampaignName(data.name);
            if (data.characters) setCharacters(data.characters.map(sanitizeCharacter));
            if (data.npcs) setNpcs(data.npcs.map(sanitizeCharacter));
            if (data.monsters) setMonsters(data.monsters);
            if (data.encounter) setEncounter(data.encounter);
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
            }
            if (data.notes) setNotes(data.notes);
            alert("Mesa carregada com sucesso!");
            setUnsavedChanges(false);
        } 
        // Verifica se é uma Ficha Individual (Legada ou Nova)
        else {
            const importedChar = processImportedCharacter(json);
            if (importedChar) {
                // Adiciona o personagem à lista atual
                setCharacters(prev => [...prev, importedChar]);
                // Opcional: focar no novo personagem
                setActiveCharIndex(characters.length);
                alert(`Personagem "${importedChar.name}" importado com sucesso!`);
            } else {
                throw new Error("Formato não reconhecido");
            }
        }
      } catch (err) { alert("Erro ao carregar arquivo. O formato parece inválido ou corrompido."); console.error(err); }
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
              } else {
                  alert("Arquivo inválido: Não parece ser uma ficha de personagem.");
              }
          } catch(err) { console.error(err); alert("Erro ao ler arquivo."); }
      };
      reader.readAsText(file);
      e.target.value = '';
  };

  const executeSave = async () => {
    if (!isDriveConfigured()) { 
        alert("Erro: O Google Drive não está configurado corretamente.");
        return; 
    }
    setIsDriveLoading(true);
    setDriveStatus('saving');
    try {
      const data: CampaignData = { version: '2.0', timestamp: Date.now(), name: campaignName || roomName, characters, npcs, encounter, logs, map: { grid: mapGrid, tokens: mapTokens, fog: fogGrid, config: mapConfig }, monsters, combat: { turnIndex, targetUid }, notes };
      // Cast to any to avoid 'unknown' type error
      const fileData = await saveFileToDrive(saveFilename || campaignName || roomName, data) as any;
      
      alert('Campanha salva com sucesso no Google Drive!');
      if (fileData && fileData.webViewLink) window.open(fileData.webViewLink, '_blank');

      setShowSaveModal(false);
      setUnsavedChanges(false);
      setDriveStatus('connected');
    } catch (e: any) { 
        console.error("Drive Save Error:", e);
        setDriveStatus('error');
        alert(`Erro ao salvar no Drive: ${e.message || e.error}`); 
    }
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
            if (parsed.encounter) setEncounter(parsed.encounter);
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
            }
            if (parsed.notes) setNotes(parsed.notes);
            alert("Campanha carregada com sucesso!");
            setShowSaveModal(false);
            setUnsavedChanges(false);
            setDriveStatus('connected');
        } else {
            throw new Error("Formato inválido");
        }
      }
    } catch (e: any) { 
        if (e !== "CANCELLED") {
            console.error(e); 
            setDriveStatus('error');
            alert("Erro ao carregar do Drive: " + e); 
        } else {
            setDriveStatus('connected');
        }
    }
    setIsDriveLoading(false);
  };

  const getInviteLink = () => {
      const baseUrl = window.location.origin + window.location.pathname;
      return `${baseUrl}?room=${encodeURIComponent(roomName)}`;
  };

  const handleShare = async () => {
      const link = getInviteLink();
      const shareData = {
          title: `RPGNEP - ${campaignName}`,
          text: `Venha jogar RPG comigo na mesa "${campaignName}"!`,
          url: link
      };
      if (navigator.share) {
          try { await navigator.share(shareData); } catch (e) { /* ignore abort */ }
      } else {
          navigator.clipboard.writeText(link);
          alert(`Link de convite copiado!\n\n${link}`);
      }
  };

  const handleEmailInvite = () => {
      const link = getInviteLink();
      const subject = encodeURIComponent(`Convite para RPG: ${campaignName}`);
      const body = encodeURIComponent(`Olá!\n\nVocê foi convidado para participar de uma sessão de RPG no RPGNEP.\n\nMesa: ${campaignName}\nLink de Acesso: ${link}\n\nNos vemos lá!`);
      window.open(`mailto:?subject=${subject}&body=${body}`);
  };

  const activeChar = characters[activeCharIndex] || characters[0];

  // Logic to identify active tokens based on turn
  const activeParticipant = encounter[turnIndex];
  const activeTokenIds = React.useMemo(() => {
      if (!activeParticipant) return [];
      return mapTokens.filter(t => {
          if (t.linkedId) {
              return t.linkedId == activeParticipant.id;
          }
          // Fallback matching by name for legacy
          return t.name === activeParticipant.name;
      }).map(t => t.id);
  }, [encounter, turnIndex, mapTokens]);

  return (
    <div className={`h-screen w-screen flex flex-col overflow-hidden ${theme === 'dark' ? 'dark bg-stone-950' : 'bg-stone-100'}`}>
      {viewState === 'LAUNCHER' ? (
        <div className="flex h-full w-full bg-[#0c0a09] relative overflow-hidden">
          {/* Launcher UI... */}
          <div className="hidden lg:flex w-1/2 relative flex-col justify-between p-12 overflow-hidden">
              <div className="absolute inset-0 bg-[url('https://drive.google.com/thumbnail?id=1LBa-K4kKe0YzK57xOd8MprAiGQRdUAvX&sz=s3000')] bg-cover bg-center opacity-60"></div>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#0c0a09]"></div>
              <div className="relative z-10 animate-in slide-in-from-left duration-700">
                  <div className="flex items-center gap-3 mb-6">
                      <img src="/favicon.png" alt="Logo" className="w-16 h-16 drop-shadow-lg" onError={(e) => { e.currentTarget.style.display='none'; }} />
                      <h1 className="text-6xl font-cinzel font-bold text-stone-100 tracking-tighter drop-shadow-lg">RPGNEP</h1>
                  </div>
                  <p className="text-xl text-stone-300 max-w-md leading-relaxed font-serif italic drop-shadow-md">
                      "Onde lendas são forjadas e destinos rolados."
                  </p>
              </div>
              <div className="relative z-10 text-stone-500 text-sm flex gap-4 items-center">
                  <span>v2.1 • Ultimate</span>
                  <span>|</span>
                  <button onClick={() => setShowPrivacy(true)} className="hover:text-amber-500 transition-colors">Política de Privacidade</button>
                  <span>|</span>
                  <button onClick={() => setShowTerms(true)} className="hover:text-amber-500 transition-colors">Termos de Uso</button>
              </div>
          </div>

          <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-8 bg-[#0c0a09] relative">
            <div className="w-full max-w-md space-y-8 animate-in zoom-in-95 duration-500">
                <div className="lg:hidden text-center mb-8">
                    <img src="/favicon.png" alt="Logo" className="w-20 h-20 mx-auto mb-4 drop-shadow-lg" onError={(e) => { e.currentTarget.style.display='none'; }} />
                    <h1 className="text-4xl font-cinzel font-bold text-white">RPGNEP</h1>
                </div>

                <div className="bg-[#161618] border border-stone-800 p-8 rounded-2xl shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-amber-600 to-transparent opacity-50"></div>
                    <h2 className="text-2xl font-bold text-white mb-6 text-center font-cinzel">Iniciar Aventura</h2>
                    
                    {isJoiningViaLink && (
                        <div className="mb-4 bg-amber-900/30 text-amber-400 p-3 rounded-lg border border-amber-800/50 text-sm flex items-center gap-2">
                            <LinkIcon size={16}/>
                            <span>Você foi convidado para a mesa: <strong>{roomName}</strong></span>
                        </div>
                    )}

                    {!showPasswordPrompt ? (
                        <form onSubmit={(e) => handleLogin(e, 'popup')} className="space-y-5">
                            <div className="relative group">
                                <input 
                                    className={`w-full bg-[#202022] border border-stone-700 rounded-lg p-4 text-white focus:border-${accentColor}-500 outline-none transition-all placeholder-stone-600 focus:bg-[#252528]`} 
                                    id="room" 
                                    placeholder="Nome da Sala (ex: Mesa do Dragão)" 
                                    value={roomName} 
                                    onChange={e => setRoomName(e.target.value)} 
                                    readOnly={isJoiningViaLink}
                                />
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
                                <input 
                                    type="password"
                                    className={`w-full bg-[#202022] border border-stone-700 rounded-lg p-4 pl-10 text-white focus:border-${accentColor}-500 outline-none transition-all placeholder-stone-600 focus:bg-[#252528]`} 
                                    placeholder="Senha da Campanha" 
                                    value={passwordInput} 
                                    onChange={e => setPasswordInput(e.target.value)} 
                                    onKeyDown={e => e.key === 'Enter' && verifyPassword()}
                                />
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
                        <button 
                            type="button" 
                            onClick={handleDemoMode} 
                            disabled={isSyncing} 
                            className="w-full mt-6 bg-transparent hover:bg-stone-800 text-stone-400 font-bold py-3 rounded-lg transition-all border border-stone-700 flex items-center justify-center gap-2 text-sm hover:text-white"
                        >
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
          {/* PC HEADER (Hidden on Mobile) */}
          <header className={`hidden md:flex fixed top-0 left-0 right-0 z-40 bg-stone-950/70 backdrop-blur-md border-b border-white/5 px-4 h-[64px] justify-between items-center shadow-lg transition-all`}>
            {/* Logo & Navigation */}
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-3 group cursor-pointer" onClick={() => setMode('SHEET')}>
                <div className={`p-2 rounded-lg bg-gradient-to-br from-stone-800 to-stone-900 border border-white/10 group-hover:border-amber-500/50 transition-colors`}>
                    <img src="/favicon.png" alt="RPGNEP" className="w-6 h-6 object-contain group-hover:rotate-12 transition-transform duration-500" onError={(e) => {e.currentTarget.style.display='none'; e.currentTarget.parentElement!.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-amber-500 transition-transform group-hover:rotate-180 duration-500"><path d="m21.64 3.64-1.28-1.28a1.21 1.21 0 0 0-1.72 0L2.36 18.64a1.21 1.21 0 0 0 0 1.72l1.28 1.28a1.2 1.2 0 0 0 1.72 0L21.64 5.36a1.2 1.2 0 0 0 0-1.72Z"/><path d="m14 7 3 3"/><path d="M5 6v4"/><path d="M19 14v4"/><path d="M10 2v2"/><path d="M7 8H5"/><path d="M21 16h-2"/><path d="M16 12h2"/></svg>'}} />
                </div>
                <h1 className="text-xl font-cinzel font-bold text-stone-200 tracking-widest group-hover:text-white transition-colors bg-clip-text text-transparent bg-gradient-to-r from-stone-200 to-stone-400">RPGNEP</h1>
              </div>
              
              <nav className="flex items-center bg-stone-900/50 p-1 rounded-xl border border-white/5">
                {[
                    { id: 'SHEET', icon: User, label: 'Heróis' },
                    { id: 'NPC', icon: Users, label: 'NPCs' },
                    { id: 'VTT', icon: MapIcon, label: 'Mapa' },
                    { id: 'DM', icon: ShieldCheck, label: 'Mestre' },
                    { id: 'CHAT', icon: MessageSquare, label: 'Chat' }
                ].map((item) => (
                    <button 
                        key={item.id}
                        onClick={() => setMode(item.id as AppMode)}
                        className={`relative px-4 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2 transition-all duration-300 ${
                            mode === item.id 
                            ? `bg-stone-800 text-white shadow-sm ring-1 ring-white/10` 
                            : 'text-stone-500 hover:text-stone-300 hover:bg-white/5'
                        }`}
                    >
                        <item.icon size={14} className={mode === item.id ? th.text : ''} />
                        <span className="hidden sm:inline">{item.label}</span>
                        {mode === item.id && <span className={`absolute bottom-[-4px] left-1/2 -translate-x-1/2 w-1 h-1 rounded-full ${th.primary}`}></span>}
                    </button>
                ))}
              </nav>
            </div>

            {/* Room Info & Actions */}
            <div className="flex items-center gap-3">
                <div className="hidden xl:flex items-center gap-3 px-3 py-1.5 bg-stone-900/50 rounded-full border border-white/5 hover:border-white/10 transition-colors group cursor-default">
                    <div className="flex items-center gap-2 text-xs text-stone-400">
                        {campaignPassword ? <Lock size={12} className="text-amber-500/80" /> : <Unlock size={12} className="text-emerald-500/80" />}
                        <span className="truncate max-w-[150px] font-medium text-stone-300 group-hover:text-white transition-colors">{campaignName || roomName}</span>
                    </div>
                    <div className="h-4 w-px bg-white/10"></div>
                    <button onClick={handleShare} className="text-stone-500 hover:text-blue-400 transition-colors" title="Copiar Link"><LinkIcon size={14}/></button>
                </div>

                <div className={`hidden lg:flex items-center justify-center w-8 h-8 rounded-full border text-xs font-bold transition-all ${
                    isOnlineMultiplayer ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-stone-800/50 text-stone-500 border-white/5'
                }`} title={isOnlineMultiplayer ? "Online" : "Offline"}>
                    {isOnlineMultiplayer ? <Globe size={14}/> : <WifiOff size={14}/>}
                </div>

                <div className="h-6 w-px bg-white/10 mx-1"></div>

                <div className="flex items-center gap-1">
                    <button onClick={handleEmailInvite} className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-white/5 text-stone-400 hover:text-blue-400 transition-colors" title="Convidar"><Mail size={18}/></button>
                    <button onClick={() => setShowAI(!showAI)} className={`w-9 h-9 flex items-center justify-center rounded-lg transition-all duration-300 ${showAI ? 'bg-purple-500/20 text-purple-400 ring-1 ring-purple-500/50' : 'hover:bg-white/5 text-stone-400 hover:text-purple-400'}`} title="Oráculo IA"><Sparkles size={18}/></button>
                    <button onClick={() => setShowNotepad(!showNotepad)} className={`w-9 h-9 flex items-center justify-center rounded-lg transition-all duration-300 ${showNotepad ? 'bg-yellow-500/20 text-yellow-400 ring-1 ring-yellow-500/50' : 'hover:bg-white/5 text-stone-400 hover:text-yellow-400'}`} title="Bloco de Notas"><FileText size={18}/></button>
                    <button onClick={() => setShowSaveModal(true)} className={`w-9 h-9 flex items-center justify-center rounded-lg hover:bg-white/5 transition-colors relative ${unsavedChanges ? 'text-amber-500' : 'text-stone-400 hover:text-green-400'}`} title="Salvar / Carregar"><Save size={18}/>{unsavedChanges && <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-amber-500 rounded-full shadow-[0_0_8px_#f59e0b]"></span>}</button>
                    <button onClick={() => setShowConfigModal(true)} className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-white/5 text-stone-400 hover:text-white transition-colors" title="Configurações"><Settings size={18}/></button>
                    <button onClick={() => { if(auth) signOut(auth as Auth); setViewState('LAUNCHER'); setCurrentUser(null); }} className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-red-500/10 text-stone-400 hover:text-red-500 transition-colors" title="Sair"><LogOut size={18}/></button>
                </div>
            </div>
          </header>

          {/* MOBILE HEADER (Visible on Mobile) */}
          <header className={`md:hidden fixed top-0 left-0 right-0 z-40 bg-stone-950/90 backdrop-blur-md border-b border-white/5 h-[50px] flex justify-between items-center px-4 shadow-md`}>
             <div className="flex items-center gap-2">
                <img src="/favicon.png" alt="RPGNEP" className="w-6 h-6 object-contain" onError={(e) => {e.currentTarget.style.display='none'; e.currentTarget.parentElement!.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-amber-500"><path d="m21.64 3.64-1.28-1.28a1.21 1.21 0 0 0-1.72 0L2.36 18.64a1.21 1.21 0 0 0 0 1.72l1.28 1.28a1.2 1.2 0 0 0 1.72 0L21.64 5.36a1.2 1.2 0 0 0 0-1.72Z"/><path d="m14 7 3 3"/><path d="M5 6v4"/><path d="M19 14v4"/><path d="M10 2v2"/><path d="M7 8H5"/><path d="M21 16h-2"/><path d="M16 12h2"/></svg>'}} />
                <h1 className="text-lg font-cinzel font-bold text-white tracking-widest">RPGNEP</h1>
             </div>
             <div className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full ${isOnlineMultiplayer ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
                <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-stone-400"><Menu size={24}/></button>
             </div>
          </header>

          {/* MOBILE MENU DRAWER */}
          {mobileMenuOpen && (
              <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex justify-end" onClick={() => setMobileMenuOpen(false)}>
                  <div className="w-64 bg-stone-900 h-full border-l border-stone-800 p-4 animate-in slide-in-from-right" onClick={e => e.stopPropagation()}>
                      <div className="flex justify-between items-center mb-6 border-b border-stone-800 pb-2">
                          <span className="font-bold text-stone-200">Menu</span>
                          <button onClick={() => setMobileMenuOpen(false)}><X size={24} className="text-stone-500"/></button>
                      </div>
                      <div className="space-y-4">
                          <button onClick={() => {setShowAI(!showAI); setMobileMenuOpen(false);}} className="w-full flex items-center gap-3 p-3 rounded-lg bg-stone-800 text-stone-300"><Sparkles size={18}/> Oráculo IA</button>
                          <button onClick={() => {setShowNotepad(!showNotepad); setMobileMenuOpen(false);}} className="w-full flex items-center gap-3 p-3 rounded-lg bg-stone-800 text-stone-300"><FileText size={18}/> Bloco de Notas</button>
                          <button onClick={() => {setShowSaveModal(true); setMobileMenuOpen(false);}} className="w-full flex items-center gap-3 p-3 rounded-lg bg-stone-800 text-stone-300"><Save size={18}/> Salvar / Carregar</button>
                          <button onClick={() => {setShowConfigModal(true); setMobileMenuOpen(false);}} className="w-full flex items-center gap-3 p-3 rounded-lg bg-stone-800 text-stone-300"><Settings size={18}/> Configurações</button>
                          <button onClick={handleShare} className="w-full flex items-center gap-3 p-3 rounded-lg bg-stone-800 text-stone-300"><LinkIcon size={18}/> Compartilhar Sala</button>
                          <div className="border-t border-stone-800 my-2"></div>
                          <button onClick={() => { if(auth) signOut(auth as Auth); setViewState('LAUNCHER'); }} className="w-full flex items-center gap-3 p-3 rounded-lg bg-red-900/20 text-red-400"><LogOut size={18}/> Sair</button>
                      </div>
                  </div>
              </div>
          )}

          {/* MOBILE BOTTOM NAVIGATION */}
          <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-stone-950 border-t border-white/10 h-[60px] flex items-center justify-around px-2 pb-safe">
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
                    className={`flex flex-col items-center justify-center w-full h-full gap-1 ${mode === item.id ? 'text-amber-500' : 'text-stone-500'}`}
                >
                    <item.icon size={20} className={mode === item.id ? 'fill-current/20' : ''} />
                    <span className="text-[9px] font-bold uppercase">{item.label}</span>
                </button>
            ))}
          </nav>

          <main className="flex-1 overflow-hidden relative flex mt-[50px] mb-[60px] md:mt-[64px] md:mb-0 h-[calc(100vh-110px)] md:h-[calc(100vh-64px)]">
            {mode === 'SHEET' && (
                <aside className="hidden md:flex w-64 bg-stone-900 border-r border-stone-800 flex-col z-20 shadow-xl">
                    <div className="p-4 border-b border-stone-800 flex justify-between items-center bg-stone-950/50">
                        <span className="text-xs font-bold text-stone-400 uppercase tracking-wider flex items-center gap-2"><LayoutDashboard size={14}/> Aventureiros</span>
                        <div className="flex gap-1">
                            <label className="p-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-400 hover:text-white cursor-pointer transition-all" title="Importar Ficha">
                                <FileUp size={16}/>
                                <input type="file" hidden accept=".json" onChange={handleCharacterImport} />
                            </label>
                            <button onClick={() => {const newC = {...INITIAL_CHAR, id: generateId()}; setCharacters([...characters, newC]); setActiveCharIndex(characters.length);}} className={`p-1.5 rounded-lg bg-stone-800 hover:bg-amber-600 text-stone-400 hover:text-white transition-all`} title="Novo Personagem"><Plus size={16}/></button>
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-2">
                        {characters.map((c, i) => (
                            <button 
                                key={c.id} 
                                onClick={() => setActiveCharIndex(i)} 
                                className={`w-full p-3 rounded-xl border text-left transition-all group relative overflow-hidden ${
                                    activeCharIndex === i 
                                    ? `bg-gradient-to-r from-stone-800 to-stone-800/50 border-amber-500/30 shadow-lg` 
                                    : 'bg-stone-900 border-transparent hover:bg-stone-800 hover:border-stone-700'
                                }`}
                            >
                                {activeCharIndex === i && <div className={`absolute left-0 top-0 bottom-0 w-1 ${th.primary}`}></div>}
                                <div className={`font-bold text-sm mb-0.5 ${activeCharIndex === i ? 'text-white' : 'text-stone-400 group-hover:text-stone-200'}`}>{c.name}</div>
                                <div className="text-[10px] text-stone-500 flex justify-between items-center">
                                    <span className="bg-black/20 px-1.5 py-0.5 rounded">{c.class}</span>
                                    <span className={`font-mono ${activeCharIndex === i ? 'text-amber-500' : ''}`}>Nvl {c.level}</span>
                                </div>
                            </button>
                        ))}
                    </div>
                </aside>
            )}

            <div className="flex-1 overflow-hidden relative bg-[#0c0a09]">
                {mode === 'SHEET' && (
                <div className="h-full overflow-y-auto custom-scrollbar p-2 md:p-4 lg:p-8">
                    {/* Mobile Character Toggle */}
                    <div className="md:hidden flex overflow-x-auto gap-2 mb-4 no-scrollbar pb-2">
                        <button onClick={() => {const newC = {...INITIAL_CHAR, id: generateId()}; setCharacters([...characters, newC]); setActiveCharIndex(characters.length);}} className="flex-shrink-0 w-10 h-10 rounded-full bg-stone-800 border border-stone-700 flex items-center justify-center text-stone-400"><Plus size={20}/></button>
                        <label className="flex-shrink-0 w-10 h-10 rounded-full bg-stone-800 border border-stone-700 flex items-center justify-center text-stone-400 cursor-pointer">
                            <FileUp size={20}/>
                            <input type="file" hidden accept=".json" onChange={handleCharacterImport} />
                        </label>
                        {characters.map((c, i) => (
                            <button 
                                key={c.id} 
                                onClick={() => setActiveCharIndex(i)}
                                className={`flex-shrink-0 px-4 py-2 rounded-full border text-xs font-bold ${activeCharIndex === i ? 'bg-amber-900/30 border-amber-600 text-amber-500' : 'bg-stone-900 border-stone-800 text-stone-500'}`}
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
                )}

                {mode === 'VTT' && (
                    <VirtualTabletopMemo 
                        mapGrid={mapGrid} 
                        setMapGrid={(g: string[][]) => broadcastMap(g, mapTokens, fogGrid)} 
                        tokens={mapTokens} 
                        setTokens={(t: any) => {
                            const newVal = typeof t === 'function' ? t(mapTokens) : t;
                            broadcastMap(mapGrid, newVal, fogGrid);
                        }}
                        fogGrid={fogGrid}
                        setFogGrid={(fog: boolean[][]) => broadcastMap(mapGrid, mapTokens, fog)}
                        characters={characters}
                        monsters={monsters}
                        mapConfig={mapConfig}
                        setMapConfig={setMapConfig}
                        activeTokenIds={activeTokenIds}
                    />
                )}
                
                {mode === 'DM' && (
                <div className="h-full overflow-hidden">
                    <DMToolsMemo 
                        encounter={encounter} 
                        setEncounter={(e: EncounterParticipant[]) => { setEncounter(e); }} 
                        logs={logs} 
                        addLog={addLogEntry}
                        characters={characters}
                        monsters={monsters}
                        setMonsters={setMonsters}
                        turnIndex={turnIndex}
                        setTurnIndex={setTurnIndex}
                        targetUid={targetUid}
                        setTargetUid={setTargetUid}
                    />
                </div>
                )}
                
                {mode === 'CHAT' && (
                    <div className="h-full w-full p-2 md:p-4 overflow-hidden bg-stone-950 flex flex-col items-center">
                        <div className="w-full max-w-4xl h-full flex flex-col">
                           <Chat messages={chatMessages} onSendMessage={broadcastChat} username={username} isFullPage={true} />
                        </div>
                    </div>
                )}
            </div>

            <AIChat isOpen={showAI} onClose={() => setShowAI(false)} characters={characters} encounter={encounter} />
            <DiceTray onRoll={broadcastChat} />
            
            {showNotepad && (
                <div className="fixed top-[60px] right-4 md:right-20 w-[90%] md:w-80 bg-[#1c1917] border border-stone-800 shadow-2xl rounded-xl z-[60] flex flex-col overflow-hidden animate-in slide-in-from-top-5 ring-1 ring-white/10">
                    <div className="bg-gradient-to-r from-yellow-900/20 to-stone-900 p-3 flex justify-between items-center border-b border-stone-800 cursor-move">
                        <div className="flex items-center gap-2 text-yellow-500 font-bold text-sm">
                            <FileText size={16}/> Bloco de Notas
                        </div>
                        <button onClick={() => setShowNotepad(false)} className="text-stone-500 hover:text-white transition-colors"><X size={16}/></button>
                    </div>
                    <textarea 
                        className="w-full h-64 p-4 bg-[#0c0a09] resize-y outline-none text-stone-300 text-sm leading-relaxed font-mono placeholder-stone-700"
                        placeholder="Anotações rápidas da sessão..."
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                    />
                    <div className="bg-stone-900 p-1.5 text-[10px] text-stone-500 text-center border-t border-stone-800">
                        Sincronizado automaticamente
                    </div>
                </div>
            )}
          </main>

          {/* ... (Modals remain mostly same but ensure they match dark theme) ... */}
          {showSaveModal && (
              <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[70] p-4 backdrop-blur-sm">
                  {/* ... content ... */}
                  <div className="bg-[#1a1a1d] border border-stone-700 p-6 rounded-lg w-full max-w-md shadow-2xl relative">
                      <button onClick={() => setShowSaveModal(false)} className="absolute top-2 right-2 text-stone-500 hover:text-white"><X size={20}/></button>
                      <h2 className={`text-xl font-bold text-stone-200 mb-4 flex items-center gap-2`}><Save size={20} className={th.text}/> Gerenciar Campanha</h2>
                      <div className="space-y-4">
                          <input className="w-full bg-[#222] border border-[#333] rounded p-2 text-white focus:border-amber-500 outline-none" value={saveFilename} onChange={e => setSaveFilename(e.target.value)} placeholder={campaignName || roomName} />
                          <div className="grid grid-cols-2 gap-3">
                              <button onClick={handleLocalSave} className="flex flex-col items-center justify-center p-3 bg-stone-800 hover:bg-stone-700 rounded border border-stone-600 gap-2 transition-all">
                                  <Download className="text-blue-400" size={24}/>
                                  <span className="text-xs font-bold text-stone-300">Download Local</span>
                              </button>
                              <button onClick={executeSave} disabled={!isDriveReady || isDriveLoading} className={`flex flex-col items-center justify-center p-3 rounded gap-2 transition-all group ${isDriveReady ? 'bg-green-900/30 border border-green-700 hover:bg-green-900/50' : 'bg-stone-800/50 border border-stone-700 opacity-50 cursor-not-allowed'}`}>
                                  {isDriveLoading ? <Loader2 className="animate-spin text-green-400" size={24}/> : <Cloud className={isDriveReady ? "text-green-400 group-hover:scale-110 transition-transform" : "text-stone-500"} size={24}/>}
                                  <span className="text-xs font-bold text-stone-300">Google Drive</span>
                              </button>
                          </div>
                          <div className="border-t border-stone-700 pt-4">
                              <div className="grid grid-cols-2 gap-3">
                                  <label className="flex flex-col items-center justify-center p-3 bg-stone-800 hover:bg-stone-700 rounded border border-stone-600 gap-2 cursor-pointer transition-all">
                                      <FileUp className={th.text} size={24}/>
                                      <span className="text-xs font-bold text-stone-300">Upload Local</span>
                                      <input type="file" hidden accept=".json" onChange={handleLocalLoad} />
                                  </label>
                                  <button onClick={handlePickFromDrive} disabled={!isDriveReady || isDriveLoading} className={`flex flex-col items-center justify-center p-3 rounded border gap-2 transition-all ${isDriveReady ? 'bg-purple-900/30 border-purple-700 hover:bg-purple-900/50' : 'bg-stone-800/50 opacity-50 cursor-not-allowed'}`}>
                                      <Globe className="text-purple-400" size={24}/>
                                      <span className="text-xs font-bold text-stone-300">Abrir Drive</span>
                                  </button>
                              </div>
                          </div>
                      </div>
                  </div>
              </div>
          )}

          {showConfigModal && (
              <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[70] p-4">
                  <div className="bg-[#1a1a1d] border border-stone-700 rounded-xl p-6 w-full max-w-md shadow-2xl">
                      <h3 className="text-xl font-bold text-white mb-4">Configurações</h3>
                      <div className="space-y-4">
                          <div>
                              <label className="block text-stone-400 text-sm mb-2">Tema</label>
                              <div className="flex gap-2">
                                  <button onClick={() => setTheme('dark')} className={`flex-1 py-2 rounded border ${theme === 'dark' ? 'bg-stone-700 border-stone-500 text-white' : 'bg-[#222] border-[#333] text-stone-500'}`}><Moon size={16} className="mx-auto"/></button>
                                  <button onClick={() => setTheme('light')} className={`flex-1 py-2 rounded border ${theme === 'light' ? 'bg-stone-200 border-stone-300 text-black' : 'bg-[#222] border-[#333] text-stone-500'}`}><Sun size={16} className="mx-auto"/></button>
                              </div>
                          </div>
                          <div>
                              <label className="block text-stone-400 text-sm mb-2">Senha da Sala (Mestre)</label>
                              <div className="flex gap-2">
                                  <input type="text" className="flex-1 bg-[#222] border border-stone-600 rounded p-2 text-white focus:border-amber-500 outline-none" value={campaignPassword} onChange={e => setCampaignPassword(e.target.value)} placeholder="Opcional" />
                              </div>
                          </div>
                      </div>
                      <button onClick={() => setShowConfigModal(false)} className="w-full mt-6 bg-amber-600 hover:bg-amber-500 text-white font-bold py-2 rounded">Concluído</button>
                  </div>
              </div>
          )}
        </>
      )}
    </div>
  );
}
