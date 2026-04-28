
import React, { useState, useMemo, useCallback, Fragment } from 'react';
import { GoogleGenAI } from "@google/genai";
import { Monster, EncounterParticipant, LogEntry, Character, MapConfig } from '../types';
import { SPELLS_DB, COMMON_WEAPONS } from '../constants';
import { Search, Shield, Ghost, Sword, Play, ArrowDownUp, Dices, Crosshair, Minus, ChevronsUp, ChevronsDown, Trash2, Activity, Sparkles, Wand2, ScrollText, Star, X, Plus, Pencil, Users, Axe, Book, Zap, Eye, BrainCircuit, Loader2, Backpack, Tag, Hand, Info, Skull, Heart, Move, ChevronDown, List, Target, History, Cross, Clock, Calculator, Save, GripVertical, RotateCcw, RefreshCw, Check, Cloud, Wind } from 'lucide-react';
import { List as ListWindow } from 'react-window';

interface Props {
  encounter: EncounterParticipant[];
  setEncounter: (e: EncounterParticipant[]) => void;
  logs: LogEntry[];
  addLog: (title: string, details: string, type?: LogEntry['type']) => void;
  clearLogs?: () => void;
  characters: Character[];
  monsters: Monster[];
  setMonsters: (m: Monster[]) => void;
  turnIndex: number;
  setTurnIndex: (index: number) => void;
  targetUid: number | null;
  setTargetUid: (uid: number | null) => void;
  compact?: boolean;
  onAddCombatant?: (combatant: EncounterParticipant) => void;
  round?: number;
  setRound?: (r: number) => void;
  turnCounter?: number;
  setTurnCounter?: (c: number) => void;
  npcs?: Character[]; 
  permissions?: {
    canMoveTokens: boolean;
    canEditCharacters: boolean;
    canRollDice: boolean;
  };
  setPermissions?: React.Dispatch<React.SetStateAction<{
    canMoveTokens: boolean;
    canEditCharacters: boolean;
    canRollDice: boolean;
  }>>;
  setConfirmModal?: (modal: {message: string, onConfirm: () => void, onCancel?: () => void} | null) => void;
  onImportMonsterDrive?: () => void;
}

const CR_XP: Record<string, number> = {
    '0': 10, '1/8': 25, '1/4': 50, '1/2': 100,
    '1': 200, '2': 450, '3': 700, '4': 1100, '5': 1800,
    '6': 2300, '7': 2900, '8': 3900, '9': 5000, '10': 5900,
    '11': 7200, '12': 8400, '13': 10000, '14': 11500, '15': 13000,
    '16': 15000, '17': 18000, '18': 20000, '19': 22000, '20': 25000,
    '21': 33000, '22': 41000, '23': 50000, '24': 62000, '30': 155000
};

const LEVEL_DIFF: Record<number, {easy: number, medium: number, hard: number, deadly: number}> = {
  1: { easy: 25, medium: 50, hard: 75, deadly: 100 },
  2: { easy: 50, medium: 100, hard: 150, deadly: 200 },
  3: { easy: 75, medium: 150, hard: 225, deadly: 400 },
  4: { easy: 125, medium: 250, hard: 375, deadly: 500 },
  5: { easy: 250, medium: 500, hard: 750, deadly: 1100 },
  6: { easy: 300, medium: 600, hard: 900, deadly: 1400 },
  7: { easy: 350, medium: 750, hard: 1100, deadly: 1700 },
  8: { easy: 450, medium: 900, hard: 1400, deadly: 2100 },
  9: { easy: 550, medium: 1100, hard: 1600, deadly: 2400 },
  10: { easy: 600, medium: 1200, hard: 1900, deadly: 2800 },
  11: { easy: 800, medium: 1600, hard: 2400, deadly: 3600 },
  12: { easy: 1000, medium: 2000, hard: 3000, deadly: 4500 },
  13: { easy: 1100, medium: 2200, hard: 3400, deadly: 5100 },
  14: { easy: 1250, medium: 2500, hard: 3800, deadly: 5700 },
  15: { easy: 1400, medium: 2800, hard: 4300, deadly: 6400 },
  16: { easy: 1600, medium: 3200, hard: 4800, deadly: 7200 },
  17: { easy: 2000, medium: 3900, hard: 5900, deadly: 8800 },
  18: { easy: 2100, medium: 4200, hard: 6300, deadly: 9500 },
  19: { easy: 2400, medium: 4900, hard: 7300, deadly: 10900 },
  20: { easy: 2800, medium: 5700, hard: 8500, deadly: 12700 },
};

const getMulti = (n: number) => {
    if (n === 1) return 1;
    if (n === 2) return 1.5;
    if (n >= 3 && n <= 6) return 2;
    if (n >= 7 && n <= 10) return 2.5;
    if (n >= 11 && n <= 14) return 3;
    return 4;
};

export const DMTools: React.FC<Props> = ({ encounter = [], setEncounter, logs = [], addLog, clearLogs, characters = [], monsters = [], setMonsters, turnIndex, setTurnIndex, targetUid, setTargetUid, compact = false, onAddCombatant, round = 1, setRound, turnCounter = 0, setTurnCounter, npcs = [], permissions, setPermissions, setConfirmModal, onImportMonsterDrive }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [libraryTab, setLibraryTab] = useState<'party' | 'bestiary' | 'spells' | 'weapons' | 'abilities' | 'npcs' | 'permissions' | 'assets'>('party');
  const [localAssets, setLocalAssets] = useState<string[]>([]);
  const [isLoadingAssets, setIsLoadingAssets] = useState(false);

  const fetchLocalAssets = useCallback(async () => {
    setIsLoadingAssets(true);
    try {
      const res = await fetch('/api/assets/creatures');
      const data = await res.json();
      setLocalAssets(data);
    } catch (err) {
      console.error("Erro ao carregar assets locais:", err);
    } finally {
      setIsLoadingAssets(false);
    }
  }, []);

  React.useEffect(() => {
    if (libraryTab === 'assets') {
      fetchLocalAssets();
    }
  }, [libraryTab, fetchLocalAssets]);
  
  // Compact Mode Tab State
  const [compactTab, setCompactTab] = useState<'tracker' | 'library' | 'logs'>('tracker');

  const [showLibrary, setShowLibrary] = useState(!compact);
  const [showLogs, setShowLogs] = useState(!compact);
  
  // Custom Library States
  const [customSpells, setCustomSpells] = useState<Record<string, {level: string, desc: string}>>({});
  const [customWeapons, setCustomWeapons] = useState<{n: string, dmg: string, prop: string}[]>([]);
  const [customAbilities, setCustomAbilities] = useState<Record<string, {level: string, desc: string}>>({});
  
  // Creation States
  const [isCreating, setIsCreating] = useState(false);
  const [newLibItem, setNewLibItem] = useState<{name: string, stat1: string, stat2: string}>({name: '', stat1: '', stat2: ''});

  // AI Monster Gen State
  const [aiPromptOpen, setAiPromptOpen] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  
  // Monster Editor State
  const [editingMonster, setEditingMonster] = useState<Monster | null>(null);
  const [showPositionModal, setShowPositionModal] = useState(false);

  const difficultyData = useMemo(() => {
     let partyEasy = 0, partyMedium = 0, partyHard = 0, partyDeadly = 0;
     characters.forEach(c => {
         const d = LEVEL_DIFF[c.level] || LEVEL_DIFF[1];
         partyEasy += d.easy;
         partyMedium += d.medium;
         partyHard += d.hard;
         partyDeadly += d.deadly;
     });

     let monsterXP = 0;
     let monsterCount = 0;
     encounter.forEach(e => {
        monsterXP += CR_XP[e.cr] || 0;
        monsterCount++;
     });

     const adjustedXP = monsterXP * getMulti(monsterCount);
     
     let difficulty = "Nenhum";
     let color = "text-stone-400";
     
     if (adjustedXP >= partyDeadly) { difficulty = "Mortal"; color = "text-red-500 font-black"; }
     else if (adjustedXP >= partyHard) { difficulty = "Difícil"; color = "text-orange-500 font-bold"; }
     else if (adjustedXP >= partyMedium) { difficulty = "Médio"; color = "text-yellow-500 font-bold"; }
     else if (adjustedXP >= partyEasy) { difficulty = "Fácil"; color = "text-green-500 font-bold"; }

     return { difficulty, adjustedXP, monsterXP, color, thresholds: { partyEasy, partyMedium, partyHard, partyDeadly } };
  }, [characters, encounter]);

  // Inspection State
  const [inspectingUid, setInspectingUid] = useState<number | null>(null);
  
  // Conditions Modal
  const [conditionModalUid, setConditionModalUid] = useState<number | null>(null);
  
  // Combat State
  const [sessionXp, setSessionXp] = useState(0);
  const [expandedUid, setExpandedUid] = useState<number | null>(null);
  const [expandedTab, setExpandedTab] = useState<'actions' | 'spells' | 'rolls' | 'calc'>('actions');
  const [calcValue, setCalcValue] = useState(0);

  const conditionsList = [
    "Agarrado", "Amedrontado", "Atordoado", "Caído", "Cego", 
    "Enfeitiçado", "Envenenado", "Exausto", "Impedido", 
    "Incapacitado", "Inconsciente", "Invisível", "Paralisado", 
    "Petrificado", "Surdo"
  ];

  // Helper Functions
  const getMod = (val: number) => Math.floor((val - 10) / 2);
  const fmt = (val: number) => (val >= 0 ? "+" : "") + val;

  const parseDice = (diceStr: string) => {
      const match = diceStr.match(/(\d+)d(\d+)(\s*[+\-]\s*\d+)?/);
      if (match) {
          return {
              count: parseInt(match[1]),
              faces: parseInt(match[2]),
              mod: parseInt((match[3] || '0').replace(/\s/g, ''))
          };
      }
      return null;
  };

  // --- MONSTER EDITOR LOGIC ---
  const handleSaveMonster = () => {
      if (!editingMonster || !editingMonster.name) return;
      
      const exists = monsters.some(m => m.id === editingMonster.id);
      let updatedList = [];
      
      if (exists) {
          updatedList = monsters.map(m => m.id === editingMonster.id ? editingMonster : m);
          addLog("Sistema", `Ficha de bestiário "${editingMonster.name}" atualizada.`, 'info');
      } else {
          updatedList = [...monsters, { ...editingMonster, id: Date.now() }]; // Ensure unique ID on creation
          addLog("Sistema", `Nova criatura "${editingMonster.name}" adicionada ao bestiário.`, 'info');
      }
      
      setMonsters(updatedList);
      setEditingMonster(null);
  };

  const createEmptyMonster = () => {
      setEditingMonster({
          id: Date.now(),
          name: "Nova Criatura",
          type: "Humanóide",
          cr: "1/4",
          ac: 10,
          hp: 10,
          speed: "9m",
          attributes: { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 },
          actions: [],
          traits: [],
          spells: [],
          imageUrl: ""
      });
  };

  const getCharacterActions = (char: Character): { n: string; hit: number; dmg: string }[] => {
    // ... (Existing logic kept intact)
    const actions: { n: string; hit: number; dmg: string }[] = [];
    if (!char) return actions;

    const level = char.level || 1;
    const profBonus = Math.ceil(1 + (level / 4));
    
    const str = char.attributes.str || 10;
    const dex = char.attributes.dex || 10;
    const strMod = Math.floor((str - 10) / 2);
    const dexMod = Math.floor((dex - 10) / 2);

    const castingStat = char.spells?.castingStat || 'int';
    // @ts-ignore
    const castAttrVal = char.attributes[castingStat] || 10;
    const castMod = Math.floor((castAttrVal - 10) / 2);
    const spellHit = profBonus + castMod;

    if (char.inventory) {
        const lines = char.inventory.split('\n');
        lines.forEach(line => {
            const cleanLine = line.replace(/^-/, '').trim();
            if (!cleanLine) return;

            const damageMatch = cleanLine.match(/\|\s*Dano:\s*(\d+d\d+)/i);
            
            if (damageMatch) {
                const nameParts = cleanLine.split('|')[0].trim().replace(/\[E\]/, '').trim(); 
                const name = nameParts.replace(/\[.*?\]/g, '').trim(); 
                const baseDmg = damageMatch[1];
                const lowerLine = cleanLine.toLowerCase();

                let isFinesse = lowerLine.includes('acuidade') || lowerLine.includes('finesse');
                let isRanged = lowerLine.includes('distância') || lowerLine.includes('arco') || lowerLine.includes('besta');
                
                let mod = strMod;
                if (isRanged && !lowerLine.includes('arremesso')) mod = dexMod; 
                else if (isFinesse) mod = (dexMod > strMod) ? dexMod : strMod; 
                else if (lowerLine.includes('arremesso') && !isFinesse) mod = strMod; 

                const hit = profBonus + mod;
                const damage = `${baseDmg}${mod >= 0 ? '+' : ''}${mod}`;
                
                actions.push({ n: name, hit, dmg: damage });
            }
        });
    }

    if (char.customWeapons) {
        char.customWeapons.forEach(w => {
            const lowerProp = w.prop.toLowerCase();
            let mod = strMod;
            if (lowerProp.includes('acuidade')) mod = (dexMod > strMod) ? dexMod : strMod;
            else if (lowerProp.includes('distância') || w.n.toLowerCase().includes('arco')) mod = dexMod;
            
            actions.push({
                n: w.n,
                hit: profBonus + mod,
                dmg: `${w.dmg}${mod >= 0 ? '+' : ''}${mod}`
            });
        });
    }

    const processedSpells = new Set<string>();
    
    const analyzeSpell = (spellName: string) => {
        if (processedSpells.has(spellName)) return;
        processedSpells.add(spellName);

        let dbSpell = SPELLS_DB[spellName];
        if (!dbSpell && char.customSpells) {
            const custom = char.customSpells.find(s => s.name === spellName);
            if (custom) dbSpell = { level: custom.level, desc: custom.desc };
        }

        if (dbSpell) {
            const dmgMatch = dbSpell.desc.match(/(\d+d\d+)/);
            if (dmgMatch) {
                actions.push({ n: spellName, hit: spellHit, dmg: dmgMatch[1] });
            }
        }
    };

    if (char.spells?.known) {
        char.spells.known.split('\n').forEach(line => {
            const match = line.match(/(?:\[.*?\]\s*)?([^:]+)/);
            if (match) {
                const sName = match[1].trim();
                if (sName) analyzeSpell(sName);
            }
        });
    }

    if (actions.length === 0) {
        actions.push({ n: 'Desarmado', hit: profBonus + strMod, dmg: `1+${strMod}` });
    }

    return actions;
  };

  const generateMonsterAI = async () => {
      if (!aiPrompt.trim()) return;
      setIsGeneratingAi(true);
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      if (!apiKey) {
          addLog("Oráculo Silencioso", "API Key do Gemini não configurada.", "fail");
          setIsGeneratingAi(false);
          return;
      }
      try {
          const ai = new GoogleGenAI({ apiKey });
          const systemPrompt = `You are a D&D 5e Monster Generator. Generate a valid JSON object for a monster based on the user prompt. CRITICAL: Also provide a "description" field containing Lore, Behavior, and Combat Tactics. STRICTLY follow this JSON structure: { "name": "Monster Name", "type": "Type", "cr": "Challenge Rating", "ac": number, "hp": number, "speed": "String", "actions": [ { "n": "Action Name", "hit": number, "dmg": "Damage Dice" } ], "traits": [ { "n": "Trait Name", "d": "Description" } ], "spells": ["Spell Name 1"], "attributes": {"str": 10, "dex": 10, "con": 10, "int": 10, "wis": 10, "cha": 10}, "description": "Concise paragraph." }`;
          const result = await ai.models.generateContent({ model: "gemini-3-flash-preview", contents: [{ role: "user", parts: [{ text: systemPrompt + "\n\nUser Request: " + aiPrompt }] }] });
          const responseText = result.text || "";
          const cleanJson = responseText.replace(/```json|```/g, '').trim();
          const mobData = JSON.parse(cleanJson);
          const generatedTraits = Array.isArray(mobData.traits) ? mobData.traits : [];
          if (mobData.description) generatedTraits.unshift({ n: "Descrição & Táticas", d: mobData.description });
          const newMob: Monster = { id: Date.now(), name: String(mobData.name), type: String(mobData.type), cr: String(mobData.cr), ac: Number(mobData.ac), hp: Number(mobData.hp), speed: String(mobData.speed), actions: Array.isArray(mobData.actions) ? mobData.actions : [], traits: generatedTraits, spells: Array.isArray(mobData.spells) ? mobData.spells : [], attributes: mobData.attributes || {str:10,dex:10,con:10,int:10,wis:10,cha:10} };
          setMonsters([...monsters, newMob]);
          addLog("IA Criadora", `Criatura "${newMob.name}" forjada no éter e adicionada ao bestiário.`, 'magic');
          setAiPromptOpen(false); setAiPrompt('');
      } catch (error) { console.error("AI Generation Error", error); console.warn("Falha ao gerar monstro. Tente novamente."); } finally { setIsGeneratingAi(false); }
  };

  const internalAddToEncounter = (mob: Monster) => {
    const count = encounter.filter(e => e.id === mob.id).length + 1;
    const attrs = mob.attributes || { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 };
    const participant: EncounterParticipant = { ...mob, uid: Date.now() + Math.random(), name: `${mob.name} ${count > 1 ? count : ''}`, hpCurrent: mob.hp, hpMax: mob.hp, hpTemp: 0, initiative: Math.floor(Math.random() * 20) + 1 + getMod(attrs.dex), conditions: [], attributes: attrs };
    if (onAddCombatant) onAddCombatant(participant); else { setEncounter([...encounter, participant]); addLog('Entrada', `${participant.name} entrou no combate.`, 'info'); }
  };

  const internalAddCharToEncounter = (char: Character) => {
    const dexMod = Math.floor(((char.attributes?.dex || 10) - 10) / 2);
    const charActions = getCharacterActions(char);
    const charSpells: string[] = [];
    if (char.spells?.known) { 
        char.spells.known.split('\n').forEach(l => { 
            const m = l.match(/(?:\[.*?\]\s*)?(.*?)(?::|$)/); 
            if (m) charSpells.push(m[1].trim()); 
        }); 
    }
    const charTraits: {n: string, d: string}[] = [];
    if (char.bio?.features) { 
        char.bio.features.split('\n').forEach(l => { 
            if (l.trim()) { 
                const parts = l.split(':'); 
                if (parts.length > 1) charTraits.push({ n: parts[0].trim(), d: parts.slice(1).join(':').trim() }); 
                else charTraits.push({ n: 'Habilidade', d: l.trim() }); 
            } 
        }); 
    }
    const participant: EncounterParticipant = { 
        id: Number(char.id) || Date.now(), 
        uid: Date.now() + Math.random(), 
        name: char.name, 
        type: `${char.race} ${char.class}`, 
        cr: `Nvl ${char.level}`, 
        ac: char.ac, 
        hp: char.hp.max, 
        hpCurrent: char.hp.current, 
        hpMax: char.hp.max, 
        hpTemp: char.hp.temp || 0,
        speed: char.speed, 
        initiative: Math.floor(Math.random() * 20) + 1 + dexMod, 
        conditions: [], 
        actions: charActions, 
        spells: charSpells, 
        spellList: char.spellList,
        traits: charTraits, 
        linkedCharId: char.id, 
        imageUrl: char.imageUrl,
        attributes: char.attributes
    };
    if (onAddCombatant) onAddCombatant(participant); 
    else { setEncounter([...encounter, participant]); addLog('Entrada', `${char.name} (PJ) entrou no combate.`, 'info'); }
  };

  const removeFromEncounter = (uid: number) => {
    const mob = encounter.find(e => e.uid === uid);
    if (mob && CR_XP[mob.cr]) { const xp = CR_XP[mob.cr]; setSessionXp(sessionXp + xp); addLog('XP', `${mob.name} derrotado. +${xp} XP`, 'info'); }
    setEncounter(encounter.filter(e => e.uid !== uid));
    if (targetUid === uid) setTargetUid(null);
    if (expandedUid === uid) setExpandedUid(null);
  };

  const updateHP = (uid: number, delta: number) => { 
    setEncounter(encounter.map(e => { 
      if (e.uid === uid) { 
        let newHp = e.hpCurrent;
        let newTemp = e.hpTemp || 0;
        
        if (delta < 0) { // Dano
          const damage = Math.abs(delta);
          if (newTemp > 0) {
            const absorbed = Math.min(newTemp, damage);
            newTemp -= absorbed;
            const remainingDamage = damage - absorbed;
            newHp = Math.max(0, newHp - remainingDamage);
          } else {
            newHp = Math.max(0, newHp - damage);
          }
        } else { // Cura
          newHp = Math.min(e.hpMax, newHp + delta);
        }
        
        return { ...e, hpCurrent: newHp, hpTemp: newTemp }; 
      } 
      return e; 
    })); 
  };
  const updateTempHP = (uid: number, val: number) => setEncounter(encounter.map(e => e.uid === uid ? { ...e, hpTemp: val } : e));
  const updateInitiative = (uid: number, val: number) => setEncounter(encounter.map(e => e.uid === uid ? { ...e, initiative: val } : e));
  const toggleCondition = (uid: number, condition: string) => setEncounter(encounter.map(e => e.uid === uid ? { ...e, conditions: e.conditions.includes(condition) ? e.conditions.filter(c => c !== condition) : [...e.conditions, condition] } : e));
  const toggleInspiration = (uid: number) => setEncounter(encounter.map(e => e.uid === uid ? { ...e, inspiration: !e.inspiration } : e));

  const performAttack = (name: string, bonus: number, dmg: string, combatantName: string) => {
      const r1 = Math.floor(Math.random() * 20) + 1;
      let d20 = r1;
      const totalHit = d20 + bonus;
      const isCrit = d20 === 20;
      const isFail = d20 === 1;
      const target = encounter.find(e => e.uid === targetUid);
      let hitStatus = '';
      let logType: LogEntry['type'] = 'combat';

      if (isCrit) {
          hitStatus = 'CRÍTICO! (Automático)';
          logType = 'crit';
      } else if (isFail) {
          hitStatus = 'FALHA CRÍTICA! (Erro)';
          logType = 'fail';
      } else if (target) {
          if (totalHit >= target.ac) {
              hitStatus = `ACERTOU (CA ${target.ac})`;
              logType = 'combat'; 
          } else {
              hitStatus = `ERROU (CA ${target.ac})`;
              logType = 'fail'; 
          }
      }

      let dmgResult = '';
      const dmgMatch = parseDice(dmg);
      
      if (dmgMatch) {
          let rollTotal = 0;
          const rolls = [];
          const diceCount = isCrit ? dmgMatch.count * 2 : dmgMatch.count;
          for(let i=0; i<diceCount; i++) {
              const r = Math.floor(Math.random() * dmgMatch.faces) + 1;
              rollTotal += r;
              rolls.push(r);
          }
          rollTotal += dmgMatch.mod;
          const modStr = dmgMatch.mod ? (dmgMatch.mod > 0 ? `+${dmgMatch.mod}` : dmgMatch.mod) : '';
          dmgResult = `Dano: **${rollTotal}** ${isCrit ? '💥' : '🩸'} [${rolls.join(',')}${modStr}]`;
      } else {
          const flat = parseInt(dmg);
          if (!isNaN(flat)) {
             const finalDmg = isCrit ? flat * 2 : flat;
             dmgResult = `Dano: **${finalDmg}** ${isCrit ? '(x2)' : ''}`;
          } else {
             dmgResult = `Dano: ${dmg}`;
          }
      }

      const vsTarget = target ? ` vs ${target.name}` : '';
      const rollStr = `Ataque: [${d20}] ${fmt(bonus)} = **${totalHit}**${vsTarget}`;
      const details = `${hitStatus ? `**${hitStatus}**\n` : ''}${rollStr}\n${dmgResult}`;
      addLog(`${combatantName} usa ${name}`, details, logType);
  };

  const rollStat = (uid: number, statName: string, mod: number, isSave: boolean) => {
      const combatant = encounter.find(e => e.uid === uid);
      const r1 = Math.floor(Math.random() * 20) + 1;
      const total = r1 + mod;
      const typeStr = isSave ? "Salvaguarda" : "Teste";
      const title = `${combatant?.name} rola ${typeStr} de ${statName}`;
      const detail = `[${r1}] ${fmt(mod)} = **${total}**`;
      addLog(title, detail, r1 === 20 ? 'crit' : r1 === 1 ? 'fail' : 'dice');
  };

  const sortInitiative = () => {
    const sorted = [...encounter].sort((a, b) => b.initiative - a.initiative);
    setEncounter(sorted);
    setTurnIndex(0); 
    if (setRound) setRound(1);
    if (setTurnCounter) setTurnCounter(1);
    addLog('Sistema', 'Iniciativa ordenada. Rodada 1 começou.', 'info');
  };

  const rollAllInitiative = () => {
    const newEncounter = encounter.map(e => {
        const dexMod = getMod(e.attributes?.dex || 10);
        const roll = Math.floor(Math.random() * 20) + 1;
        return { ...e, initiative: roll + dexMod };
    });
    const sorted = newEncounter.sort((a, b) => b.initiative - a.initiative);
    setEncounter(sorted);
    setTurnIndex(0);
    if (setRound) setRound(1);
    if (setTurnCounter) setTurnCounter(1);
    addLog('Sistema', 'Iniciativa rolada para todos os combatentes.', 'dice');
  };

  const nextTurn = () => {
      if (encounter.length === 0) return;
      const next = (turnIndex + 1) % encounter.length;
      if (setTurnCounter) setTurnCounter(turnCounter + 1);
      if (next === 0 && setRound) {
          setRound(round + 1);
          addLog('Sistema', `Início da Rodada ${round + 1}`, 'info');
      }
      setTurnIndex(next);
      setExpandedUid(encounter[next].uid);
      addLog('Turno', `Turno de ${encounter[next].name}`, 'info');
  };

  const addActionToTarget = (action: {n: string, hit: number, dmg: string}) => { if (!targetUid) { console.warn("Selecione um alvo."); return; } setEncounter(encounter.map(e => e.uid === targetUid ? { ...e, actions: [...(e.actions||[]), action] } : e)); addLog('Sistema', `Ação '${action.n}' adicionada ao alvo.`, 'info'); };
  const addSpellToTarget = (name: string) => { if (!targetUid) { console.warn("Selecione um alvo."); return; } setEncounter(encounter.map(e => e.uid === targetUid ? { ...e, spells: e.spells ? [...e.spells, name] : [name] } : e)); addLog('Sistema', `Magia '${name}' aprendida pelo alvo.`, 'magic'); };
  
  const handleCreateLibItem = () => {
      if (!newLibItem.name) return;
      if (libraryTab === 'spells') setCustomSpells({ ...customSpells, [newLibItem.name]: { level: newLibItem.stat1 || 'Truque', desc: newLibItem.stat2 || 'Efeito Mágico' } });
      else if (libraryTab === 'weapons') setCustomWeapons([ ...customWeapons, { n: newLibItem.name, dmg: newLibItem.stat1 || '1d4', prop: newLibItem.stat2 || 'Simples' } ]);
      else if (libraryTab === 'abilities') setCustomAbilities({ ...customAbilities, [newLibItem.name]: { level: 'Habilidade', desc: newLibItem.stat2 || 'Efeito Especial' } });
      setIsCreating(false); setNewLibItem({name: '', stat1: '', stat2: ''});
  };

  const parseCR = (cr: string) => { if (cr.includes('/')) { const [n, d] = cr.split('/'); return parseInt(n) / parseInt(d); } return parseFloat(cr); };
  
  const displayedSpells = React.useMemo(() => {
    return [...(Object.entries(SPELLS_DB) as [string, {level: string, desc: string}][]).filter(([_, s]) => s.level !== 'Habilidade'), ...Object.entries(customSpells)].filter(([name]) => name.toLowerCase().includes(searchTerm.toLowerCase())) as [string, {level: string, desc: string}][];
  }, [customSpells, searchTerm]);

  const displayedAbilities = React.useMemo(() => {
    return [...(Object.entries(SPELLS_DB) as [string, {level: string, desc: string}][]).filter(([_, s]) => s.level === 'Habilidade'), ...Object.entries(customAbilities)].filter(([name]) => name.toLowerCase().includes(searchTerm.toLowerCase())) as [string, {level: string, desc: string}][];
  }, [customAbilities, searchTerm]);

  const displayedWeapons = React.useMemo(() => {
    return [...COMMON_WEAPONS, ...customWeapons].filter(w => w.n.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [customWeapons, searchTerm]);

  const groupedMonsters = React.useMemo(() => {
    return Object.entries(monsters.reduce((acc, m) => { if (!acc[m.cr]) acc[m.cr] = []; acc[m.cr].push(m); return acc; }, {} as Record<string, Monster[]>)).sort((a, b) => parseCR(a[0]) - parseCR(b[0])).map(([cr, items]) => ({ cr, items: items as Monster[] }));
  }, [monsters]);

  const flattenedBestiary = React.useMemo(() => {
      const flat: ( { type: 'header', cr: string } | { type: 'monster', monster: Monster } )[] = [];
      groupedMonsters.forEach(group => {
          const filteredItems = group.items.filter(m => m.name.toLowerCase().includes(searchTerm.toLowerCase()));
          if (filteredItems.length > 0) {
              flat.push({ type: 'header', cr: group.cr });
              filteredItems.forEach(m => flat.push({ type: 'monster', monster: m }));
          }
      });
      return flat;
  }, [groupedMonsters, searchTerm]);

  const BestiaryRow = ({ index, style }: { index: number, style: React.CSSProperties }) => {
      const item = flattenedBestiary[index];
      if (item.type === 'header') {
          return (
              <div style={style} className="flex items-center gap-2 px-2 mb-2">
                  <div className="h-px flex-1 bg-stone-800"></div>
                  <div className="text-[9px] font-bold text-stone-600 uppercase tracking-widest">ND {item.cr}</div>
                  <div className="h-px flex-1 bg-stone-800"></div>
              </div>
          );
      }
      const m = item.monster;
      return (
          <div style={style} className="px-2">
              <div className="bg-stone-900/40 p-2.5 rounded-xl border border-stone-800 hover:border-stone-600 flex justify-between items-center group mb-2 transition-all hover:bg-stone-900/60 shadow-sm">
                  <div className="flex items-center gap-3 overflow-hidden">
                      <div className="w-10 h-10 bg-stone-950 rounded-xl overflow-hidden border border-stone-800 relative shrink-0 shadow-inner">
                          {m.imageUrl ? (
                              <img 
                                  src={m.imageUrl} 
                                  loading="lazy" 
                                  className="w-full h-full object-contain"
                                  style={{
                                      transform: `translate(${m.imageConfig?.x || 0}%, ${m.imageConfig?.y || 0}%) scale(${m.imageConfig?.scale || 1}) rotate(${m.imageConfig?.rotation || 0}deg)`
                                  }}
                              />
                          ) : (
                              <Ghost size={18} className="m-auto mt-2.5 text-stone-700"/>
                          )}
                      </div>
                      <div className="text-sm font-bold text-stone-300 truncate tracking-tight flex items-center gap-1" title={m.name}>
                          {m.name}
                          {(m.legendaryActions?.length || 0) > 0 && (
                              <span title="Criatura Lendária">
                                  <Star size={12} className="text-amber-500 fill-amber-500" />
                              </span>
                          )}
                      </div>
                  </div>
                  <div className="flex gap-1.5 shrink-0">
                      <button onClick={() => setEditingMonster(m)} className="text-stone-600 hover:text-blue-400 p-2 bg-stone-950/50 rounded-lg hover:bg-stone-950 opacity-0 group-hover:opacity-100 transition-all border border-transparent hover:border-stone-800"><Pencil size={14}/></button>
                      <button onClick={() => internalAddToEncounter(m)} className="text-stone-500 hover:text-amber-400 p-2 bg-stone-950/50 rounded-lg hover:bg-stone-950 border border-transparent hover:border-stone-800 transition-all shadow-lg"><Plus size={18}/></button>
                  </div>
              </div>
          </div>
      );
  };

  const renderInspector = () => {
      if (!inspectingUid) return null;
      const participant = encounter.find(e => e.uid === inspectingUid);
      if (!participant) return null;
      return (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-end z-[100]" onClick={() => setInspectingUid(null)}>
              <div className="w-[400px] h-full bg-[#1c1c21] border-l border-amber-600/30 shadow-2xl animate-in slide-in-from-right overflow-y-auto flex flex-col" onClick={e => e.stopPropagation()}>
                  <div className="p-4 bg-[#151518] border-b border-[#333] flex justify-between items-center">
                      <h3 className="font-bold text-amber-500 truncate">{participant.name}</h3>
                      <button onClick={() => setInspectingUid(null)}><X className="text-white"/></button>
                  </div>
                  <div className="p-4 space-y-4">
                      <div className="flex gap-4">
                          <div className="w-20 h-20 bg-black rounded border border-[#333] overflow-hidden">
                              {participant.imageUrl ? (
                                  <img 
                                      src={participant.imageUrl} 
                                      loading="lazy"
                                      className="w-full h-full object-contain"
                                      style={{
                                          transform: `translate(${participant.imageConfig?.x || 0}%, ${participant.imageConfig?.y || 0}%) scale(${participant.imageConfig?.scale || 1}) rotate(${participant.imageConfig?.rotation || 0}deg)`
                                      }}
                                  />
                              ) : (
                                  <Ghost className="w-full h-full p-4 text-stone-600"/>
                              )}
                          </div>
                          <div>
                              <div className="text-xs text-stone-500 uppercase font-bold">{participant.type} • {participant.cr}</div>
                              <div className="text-2xl font-bold text-white">{participant.hpCurrent} <span className="text-sm text-stone-500">/ {participant.hpMax} PV</span></div>
                              <div className="text-sm text-blue-400 font-bold">CA {participant.ac}</div>
                          </div>
                      </div>
                      
                      <div className="bg-[#222] p-2 rounded border border-[#333]">
                          <div className="text-[10px] uppercase font-bold text-stone-500 mb-2">Ações & Ataques</div>
                          <div className="space-y-1">
                              {participant.actions?.map((a, i) => (
                                  <div key={i} className="flex justify-between items-center bg-[#1a1a1d] p-2 rounded border border-[#333]">
                                      <span className="text-xs font-bold text-stone-300">{a.n}</span>
                                      <span className="text-[10px] text-stone-500 font-mono">{fmt(a.hit)} / {a.dmg}</span>
                                  </div>
                              ))}
                              {(!participant.actions || participant.actions.length === 0) && <div className="text-xs text-stone-600 italic">Sem ações.</div>}
                          </div>
                      </div>

                      {participant.traits && participant.traits.length > 0 && (
                          <div className="bg-[#222] p-2 rounded border border-[#333]">
                              <div className="text-[10px] uppercase font-bold text-stone-500 mb-2">Habilidades & Características</div>
                              <div className="space-y-2">
                                  {participant.traits.map((t, i) => (
                                      <div key={i}>
                                          <div className="text-xs font-bold text-amber-500">{t.n}</div>
                                          <div className="text-[10px] text-stone-400 leading-relaxed">{t.d}</div>
                                      </div>
                                  ))}
                              </div>
                          </div>
                      )}

                      {participant.legendaryActions && participant.legendaryActions.length > 0 && (
                          <div className="bg-[#222] p-2 rounded border border-[#333] shadow-[0_0_15px_rgba(245,158,11,0.1)]">
                              <div className="text-[10px] uppercase font-black text-amber-500 mb-2 flex items-center gap-1 border-b border-amber-500/20 pb-1">
                                  <Star size={10} fill="currentColor"/> Ações Lendárias
                              </div>
                              <div className="space-y-2">
                                  {participant.legendaryActions.map((a, i) => (
                                      <div key={i} className="border-l-2 border-amber-500 pl-2">
                                          <div className="text-xs font-bold text-stone-200">{a.n} {a.cost && <span className="text-amber-500 ml-1">(Custo: {a.cost})</span>}</div>
                                          <div className="text-[10px] text-stone-400 leading-tight italic">{a.d}</div>
                                      </div>
                                  ))}
                              </div>
                          </div>
                      )}

                      {participant.lairActions && participant.lairActions.length > 0 && (
                          <div className="bg-[#222] p-2 rounded border border-[#333] shadow-[0_0_15px_rgba(37,99,235,0.1)]">
                              <div className="text-[10px] uppercase font-black text-blue-400 mb-2 flex items-center gap-1 border-b border-blue-400/20 pb-1">
                                  <Cloud size={10} fill="currentColor"/> Ações de Covil
                              </div>
                              <div className="space-y-2">
                                  {participant.lairActions.map((a, i) => (
                                      <div key={i} className="border-l-2 border-blue-400 pl-2">
                                          <div className="text-xs font-bold text-stone-200">{a.n}</div>
                                          <div className="text-[10px] text-stone-400 leading-tight italic">{a.d}</div>
                                      </div>
                                  ))}
                              </div>
                          </div>
                      )}
                  </div>
              </div>
          </div>
      )
  };

  return (
    <div className="flex flex-col h-full bg-stone-950 text-stone-200 font-sans overflow-hidden">
      {renderInspector()}

      {/* Dashboard Header (Desktop Only) */}
      {!compact && (
        <div className="h-12 border-b border-stone-800 flex items-center justify-between px-3 bg-stone-900/50 shrink-0 z-30 shadow-xl">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shadow-inner">
                <Shield size={14} className="text-amber-500" />
              </div>
              <span className="font-cinzel text-sm font-black tracking-widest text-white">PAINEL GM</span>
            </div>
            <div className="h-5 w-px bg-stone-800"></div>
            <div className="flex gap-1">
              <button onClick={() => setShowLibrary(!showLibrary)} className={`p-1.5 rounded-lg transition-all shadow-lg ${showLibrary ? 'bg-amber-500 text-stone-950' : 'bg-stone-800 text-stone-500 hover:text-stone-200 hover:bg-stone-700'}`} title="Biblioteca"><Book size={14}/></button>
              <button onClick={() => setShowLogs(!showLogs)} className={`p-1.5 rounded-lg transition-all shadow-lg ${showLogs ? 'bg-amber-500 text-stone-950' : 'bg-stone-800 text-stone-500 hover:text-stone-200 hover:bg-stone-700'}`} title="Logs"><History size={14}/></button>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
             <div className="flex items-center gap-2 bg-stone-950/50 px-2 py-1 rounded-lg border border-stone-800 shadow-inner">
                <div className="flex items-center gap-1.5">
                   <Users size={12} className="text-blue-400"/>
                   <span className="text-[10px] font-black text-stone-300 tracking-tight">{characters.length}</span>
                </div>
                <div className="w-1 h-1 rounded-full bg-stone-700"></div>
                <div className="flex items-center gap-1.5">
                   <Ghost size={12} className="text-red-400"/>
                   <span className="text-[10px] font-black text-stone-300 tracking-tight">{encounter.length}</span>
                </div>
             </div>
          </div>
        </div>
      )}
      
      {/* Image Position Modal */}
      {showPositionModal && editingMonster && editingMonster.imageUrl && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
              <div className="bg-stone-900 border border-stone-800 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl">
                  <div className="p-6 border-b border-stone-800 flex justify-between items-center bg-stone-900/50">
                      <h3 className="text-xl font-cinzel font-bold text-white flex items-center gap-2">
                          <Move className="text-amber-500" size={20} />
                          Posicionar Imagem
                      </h3>
                      <button onClick={() => setShowPositionModal(false)} className="p-2 hover:bg-stone-800 rounded-full transition-colors text-stone-400 hover:text-white">
                          <X size={20} />
                      </button>
                  </div>

                  <div className="p-8 space-y-8">
                      {/* Preview Area */}
                      <div className="flex justify-center">
                          <div className="w-48 h-48 rounded-2xl bg-stone-950 border-2 border-stone-800 overflow-hidden relative shadow-inner">
                              <img 
                                  src={editingMonster.imageUrl} 
                                  alt="Preview" 
                                  className="w-full h-full object-contain"
                                  style={{
                                      transform: `translate(${editingMonster.imageConfig?.x || 0}%, ${editingMonster.imageConfig?.y || 0}%) scale(${editingMonster.imageConfig?.scale || 1}) rotate(${editingMonster.imageConfig?.rotation || 0}deg)`,
                                      transition: 'none'
                                  }}
                              />
                              <div className="absolute inset-0 pointer-events-none opacity-20 border border-white/10 flex items-center justify-center">
                                  <div className="w-px h-full bg-white/20"></div>
                                  <div className="h-px w-full bg-white/20 absolute"></div>
                              </div>
                          </div>
                      </div>

                      <div className="space-y-6">
                          <div className="space-y-3">
                              <div className="flex justify-between text-xs font-bold uppercase tracking-wider text-stone-500">
                                  <span>Posição X</span>
                                  <span className="text-amber-500">{editingMonster.imageConfig?.x || 0}%</span>
                              </div>
                              <input 
                                  type="range" min="-100" max="100" step="1"
                                  value={editingMonster.imageConfig?.x || 0}
                                  onChange={(e) => setEditingMonster({ ...editingMonster, imageConfig: { ...(editingMonster.imageConfig || { x: 0, y: 0, scale: 1, rotation: 0 }), x: parseInt(e.target.value) } })}
                                  className="w-full h-1.5 bg-stone-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                              />
                          </div>

                          <div className="space-y-3">
                              <div className="flex justify-between text-xs font-bold uppercase tracking-wider text-stone-500">
                                  <span>Posição Y</span>
                                  <span className="text-amber-500">{editingMonster.imageConfig?.y || 0}%</span>
                              </div>
                              <input 
                                  type="range" min="-100" max="100" step="1"
                                  value={editingMonster.imageConfig?.y || 0}
                                  onChange={(e) => setEditingMonster({ ...editingMonster, imageConfig: { ...(editingMonster.imageConfig || { x: 0, y: 0, scale: 1, rotation: 0 }), y: parseInt(e.target.value) } })}
                                  className="w-full h-1.5 bg-stone-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                              />
                          </div>

                          <div className="space-y-3">
                              <div className="flex justify-between text-xs font-bold uppercase tracking-wider text-stone-500">
                                  <span>Escala</span>
                                  <span className="text-amber-500">{editingMonster.imageConfig?.scale || 1}x</span>
                              </div>
                              <input 
                                  type="range" min="0.5" max="3" step="0.05"
                                  value={editingMonster.imageConfig?.scale || 1}
                                  onChange={(e) => setEditingMonster({ ...editingMonster, imageConfig: { ...(editingMonster.imageConfig || { x: 0, y: 0, scale: 1, rotation: 0 }), scale: parseFloat(e.target.value) } })}
                                  className="w-full h-1.5 bg-stone-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                              />
                          </div>

                          <div className="space-y-3">
                              <div className="flex justify-between text-xs font-bold uppercase tracking-wider text-stone-500">
                                  <span>Rotação</span>
                                  <span className="text-amber-500">{editingMonster.imageConfig?.rotation || 0}°</span>
                              </div>
                              <input 
                                  type="range" min="-180" max="180" step="1"
                                  value={editingMonster.imageConfig?.rotation || 0}
                                  onChange={(e) => setEditingMonster({ ...editingMonster, imageConfig: { ...(editingMonster.imageConfig || { x: 0, y: 0, scale: 1, rotation: 0 }), rotation: parseInt(e.target.value) } })}
                                  className="w-full h-1.5 bg-stone-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                              />
                          </div>
                      </div>

                      <div className="flex gap-3 pt-4">
                          <button 
                              onClick={() => setEditingMonster({ ...editingMonster, imageConfig: { x: 0, y: 0, scale: 1, rotation: 0 } })}
                              className="flex-1 py-3 px-4 bg-stone-800 hover:bg-stone-700 text-white rounded-xl font-bold transition-all flex items-center justify-center gap-2"
                          >
                              <RotateCcw size={18} />
                              Resetar
                          </button>
                          <button 
                              onClick={() => setShowPositionModal(false)}
                              className="flex-1 py-3 px-4 bg-amber-600 hover:bg-amber-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-amber-900/20 flex items-center justify-center gap-2"
                          >
                              <Check size={18} />
                              Confirmar
                          </button>
                      </div>
                  </div>
              </div>
          </div>
      )}

      {aiPromptOpen && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[110] p-4">
              <div className="bg-[#1a1a1d] border border-amber-600/50 rounded-xl w-full max-w-lg p-6 shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-600 to-purple-600 animate-pulse"></div>
                  <div className="flex justify-between items-center mb-4"><h3 className="text-xl font-bold text-white flex items-center gap-2"><BrainCircuit className="text-amber-500"/> Criar Monstro com IA</h3><button onClick={() => setAiPromptOpen(false)} className="text-stone-500 hover:text-white"><X size={20}/></button></div>
                  <textarea className="w-full h-32 bg-black/40 border border-[#333] rounded-lg p-3 text-sm text-white resize-none outline-none focus:border-amber-500 mb-4" placeholder="Descreva a criatura..." value={aiPrompt} onChange={e => setAiPrompt(e.target.value)} />
                  <div className="flex justify-end gap-2"><button onClick={() => setAiPromptOpen(false)} className="px-4 py-2 text-stone-400 hover:text-white text-sm font-bold">Cancelar</button><button onClick={generateMonsterAI} disabled={isGeneratingAi || !aiPrompt.trim()} className="px-6 py-2 bg-gradient-to-r from-amber-700 to-purple-700 text-white font-bold rounded-lg shadow-lg flex items-center gap-2 disabled:opacity-50">{isGeneratingAi ? <Loader2 className="animate-spin"/> : <Sparkles size={16}/>} {isGeneratingAi ? 'Forjando...' : 'Invocar'}</button></div>
              </div>
          </div>
      )}

      {/* MONSTER EDITOR MODAL */}
      {editingMonster && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[120] p-4">
              <div className="bg-[#1a1a1d] border border-stone-700 rounded-xl w-full max-w-3xl h-[90vh] flex flex-col shadow-2xl relative overflow-hidden">
                  <div className="p-4 bg-[#151518] border-b border-[#333] flex justify-between items-center shrink-0">
                      <h3 className="text-xl font-bold text-white flex items-center gap-2"><Ghost className="text-amber-500"/> Editor de Criatura</h3>
                      <button onClick={() => setEditingMonster(null)} className="text-stone-500 hover:text-white"><X size={20}/></button>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-[#121212]">
                      <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1">
                              <label className="text-[10px] text-stone-500 uppercase font-bold">Nome</label>
                              <input className="w-full bg-[#222] border border-[#333] rounded p-2 text-white" value={editingMonster.name} onChange={e => setEditingMonster({...editingMonster, name: e.target.value})} />
                          </div>
                          <div className="space-y-1">
                              <label className="text-[10px] text-stone-500 uppercase font-bold">Tipo / Subtipo</label>
                              <input className="w-full bg-[#222] border border-[#333] rounded p-2 text-white" value={editingMonster.type} onChange={e => setEditingMonster({...editingMonster, type: e.target.value})} />
                          </div>
                      </div>

                      <div className="grid grid-cols-4 gap-4 bg-[#1a1a1d] p-4 rounded-lg border border-[#333]">
                          <div><label className="text-[10px] text-stone-500 uppercase font-bold block">ND (CR)</label><input className="w-full bg-[#222] border border-[#333] rounded p-1 text-center font-bold text-amber-500" value={editingMonster.cr} onChange={e => setEditingMonster({...editingMonster, cr: e.target.value})} /></div>
                          <div><label className="text-[10px] text-stone-500 uppercase font-bold block">CA</label><input type="number" className="w-full bg-[#222] border border-[#333] rounded p-1 text-center font-bold text-blue-400" value={editingMonster.ac} onChange={e => setEditingMonster({...editingMonster, ac: parseInt(e.target.value)})} /></div>
                          <div><label className="text-[10px] text-stone-500 uppercase font-bold block">PV</label><input type="number" className="w-full bg-[#222] border border-[#333] rounded p-1 text-center font-bold text-green-500" value={editingMonster.hp} onChange={e => setEditingMonster({...editingMonster, hp: parseInt(e.target.value)})} /></div>
                          <div><label className="text-[10px] text-stone-500 uppercase font-bold block">Desloc.</label><input className="w-full bg-[#222] border border-[#333] rounded p-1 text-center" value={editingMonster.speed} onChange={e => setEditingMonster({...editingMonster, speed: e.target.value})} /></div>
                      </div>

                      <div className="space-y-2">
                          <label className="text-[10px] text-stone-500 uppercase font-bold">Atributos</label>
                          <div className="grid grid-cols-6 gap-2">
                              {Object.keys(editingMonster.attributes || {}).map(attr => (
                                  <div key={attr} className="flex flex-col items-center bg-[#1a1a1d] p-2 rounded border border-[#333]">
                                      <span className="text-[10px] text-stone-500 font-bold uppercase">{attr}</span>
                                      <input 
                                        type="number" 
                                        className="w-full bg-transparent text-center font-bold text-white outline-none" 
                                        // @ts-ignore
                                        value={editingMonster.attributes[attr]} 
                                        // @ts-ignore
                                        onChange={e => setEditingMonster({...editingMonster, attributes: {...editingMonster.attributes, [attr]: parseInt(e.target.value)}})} 
                                      />
                                      <span className="text-[9px] text-stone-600">{fmt(getMod(editingMonster.attributes?.[attr as keyof typeof editingMonster.attributes] || 10))}</span>
                                  </div>
                              ))}
                          </div>
                      </div>

                      <div className="space-y-2">
                          <div className="flex justify-between items-center">
                              <label className="text-[10px] text-stone-500 uppercase font-bold">Ações</label>
                              <button onClick={() => setEditingMonster({...editingMonster, actions: [...editingMonster.actions, {n: "Novo Ataque", hit: 0, dmg: "1d6"}]})} className="text-[10px] text-green-400 hover:text-green-300 flex items-center gap-1"><Plus size={12}/> Adicionar</button>
                          </div>
                          {editingMonster.actions.map((act, i) => (
                              <div key={i} className="flex gap-2 items-center bg-[#1a1a1d] p-2 rounded border border-[#333]">
                                  <input className="flex-1 bg-[#222] border border-[#333] rounded p-1 text-xs text-white" value={act.n} onChange={e => {const newA = [...editingMonster.actions]; newA[i].n = e.target.value; setEditingMonster({...editingMonster, actions: newA})}} placeholder="Nome" />
                                  <input type="number" className="w-16 bg-[#222] border border-[#333] rounded p-1 text-xs text-center text-white" value={act.hit} onChange={e => {const newA = [...editingMonster.actions]; newA[i].hit = parseInt(e.target.value); setEditingMonster({...editingMonster, actions: newA})}} placeholder="Hit" />
                                  <input className="w-24 bg-[#222] border border-[#333] rounded p-1 text-xs text-white" value={act.dmg} onChange={e => {const newA = [...editingMonster.actions]; newA[i].dmg = e.target.value; setEditingMonster({...editingMonster, actions: newA})}} placeholder="Dano" />
                                  <button onClick={() => {const newA = [...editingMonster.actions]; newA.splice(i, 1); setEditingMonster({...editingMonster, actions: newA})}} className="text-red-500 hover:text-red-400"><Trash2 size={14}/></button>
                              </div>
                          ))}
                      </div>

                      <div className="space-y-2">
                          <div className="flex justify-between items-center">
                              <label className="text-[10px] text-stone-500 uppercase font-bold">Traços & Habilidades</label>
                              <button onClick={() => setEditingMonster({...editingMonster, traits: [...(editingMonster.traits||[]), {n: "Nova Habilidade", d: "Descrição"}]})} className="text-[10px] text-green-400 hover:text-green-300 flex items-center gap-1"><Plus size={12}/> Adicionar</button>
                          </div>
                          {(editingMonster.traits || []).map((trait, i) => (
                              <div key={i} className="bg-[#1a1a1d] p-2 rounded border border-[#333] space-y-1">
                                  <div className="flex justify-between items-center gap-2">
                                      <input className="flex-1 bg-[#222] border border-[#333] rounded p-1 text-xs text-amber-500 font-bold" value={trait.n} onChange={e => {const newT = [...(editingMonster.traits||[])]; newT[i].n = e.target.value; setEditingMonster({...editingMonster, traits: newT})}} />
                                      <button onClick={() => {const newT = [...(editingMonster.traits||[])]; newT.splice(i, 1); setEditingMonster({...editingMonster, traits: newT})}} className="text-red-500 hover:text-red-400"><Trash2 size={14}/></button>
                                  </div>
                                  <textarea className="w-full bg-[#222] border border-[#333] rounded p-1 text-xs text-stone-300 resize-none h-16" value={trait.d} onChange={e => {const newT = [...(editingMonster.traits||[])]; newT[i].d = e.target.value; setEditingMonster({...editingMonster, traits: newT})}} />
                              </div>
                          ))}
                      </div>
                      
                      <div className="space-y-1">
                          <label className="text-[10px] text-stone-500 uppercase font-bold">URL da Imagem</label>
                          <div className="flex gap-2">
                              <input className="flex-1 bg-[#222] border border-[#333] rounded p-2 text-white text-xs" value={editingMonster.imageUrl || ''} onChange={e => setEditingMonster({...editingMonster, imageUrl: e.target.value})} placeholder="https://..." />
                              {editingMonster.imageUrl && (
                                  <button 
                                      onClick={() => setShowPositionModal(true)}
                                      className="p-2 bg-stone-800 border border-stone-700 rounded hover:bg-stone-700 text-stone-300"
                                      title="Posicionar Imagem"
                                  >
                                      <Move size={14} />
                                  </button>
                              )}
                          </div>
                      </div>
                  </div>

                  <div className="p-4 bg-[#151518] border-t border-[#333] flex justify-end gap-3 shrink-0">
                      <button onClick={() => setEditingMonster(null)} className="px-4 py-2 text-stone-400 hover:text-white font-bold text-sm">Cancelar</button>
                      <button onClick={handleSaveMonster} className="px-6 py-2 bg-green-700 hover:bg-green-600 text-white font-bold rounded shadow-lg flex items-center gap-2"><Save size={16}/> Salvar Criatura</button>
                  </div>
              </div>
          </div>
      )}

      {compact && (
          <div className="flex bg-stone-950 border-b border-stone-800 shrink-0 p-1 gap-1">
              <button onClick={() => setCompactTab('tracker')} className={`flex-1 py-2 px-1 text-[10px] font-black uppercase tracking-tighter flex items-center justify-center gap-1.5 rounded-lg transition-all ${compactTab === 'tracker' ? 'text-amber-500 bg-amber-500/10 border border-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.1)]' : 'text-stone-500 hover:text-stone-300 hover:bg-stone-900'}`}><Activity size={12}/> Combate</button>
              <button onClick={() => setCompactTab('library')} className={`flex-1 py-2 px-1 text-[10px] font-black uppercase tracking-tighter flex items-center justify-center gap-1.5 rounded-lg transition-all ${compactTab === 'library' ? 'text-blue-500 bg-blue-500/10 border border-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.1)]' : 'text-stone-500 hover:text-stone-300 hover:bg-stone-900'}`}><Book size={12}/> Biblio</button>
              <button onClick={() => setCompactTab('logs')} className={`flex-1 py-2 px-1 text-[10px] font-black uppercase tracking-tighter flex items-center justify-center gap-1.5 rounded-lg transition-all ${compactTab === 'logs' ? 'text-green-500 bg-green-500/10 border border-green-500/20 shadow-[0_0_15px_rgba(34,197,94,0.1)]' : 'text-stone-500 hover:text-stone-300 hover:bg-stone-900'}`}><List size={12}/> Logs</button>
          </div>
      )}

      <div className={`flex flex-1 overflow-hidden ${compact ? 'flex-col relative' : 'flex-row bg-stone-950'}`}>
        
        {((!compact && showLibrary) || (compact && compactTab === 'library')) && (
            <div className={`${compact ? 'absolute inset-0 z-10 bg-[#0c0a09]' : 'w-64 lg:w-72 border-r'} border-stone-800 flex flex-col bg-[#0c0a09] overflow-hidden`}>
                <div className="p-4 border-b border-stone-800 bg-stone-900/30 flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-400">Biblioteca</span>
                    {compact && <button onClick={() => setCompactTab('tracker')} className="text-stone-500 hover:text-white"><X size={14}/></button>}
                </div>
                
                <div className="flex flex-col flex-1 overflow-hidden">
                    <div className="grid grid-cols-4 gap-1 bg-stone-900/50 p-1.5 m-2 rounded-xl border border-stone-800 shadow-inner">
                        {[
                            {id: 'party', icon: Users, title: 'Heróis', color: 'text-blue-400'},
                            {id: 'npcs', icon: Users, title: 'NPCs', color: 'text-green-400'},
                            {id: 'bestiary', icon: Ghost, title: 'Bestiário', color: 'text-stone-300'},
                            {id: 'assets', icon: Star, title: 'Galeria Local', color: 'text-amber-400'},
                            {id: 'spells', icon: Book, title: 'Magias', color: 'text-purple-400'},
                            {id: 'weapons', icon: Axe, title: 'Armas', color: 'text-red-400'},
                            {id: 'permissions', icon: Shield, title: 'Permissões', color: 'text-amber-400'},
                        ].map(tab => (
                            <button key={tab.id} onClick={() => setLibraryTab(tab.id as any)} className={`py-2 rounded-lg flex items-center justify-center transition-all ${libraryTab === tab.id ? 'bg-amber-500 text-stone-950 shadow-lg shadow-amber-500/20' : 'text-stone-600 hover:text-stone-400 hover:bg-stone-800'}`} title={tab.title}>
                                <tab.icon size={16} className={libraryTab === tab.id ? '' : ''}/>
                            </button>
                        ))}
                    </div>

                    <div className="px-3 mb-3">
                        <div className="relative group">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-600 group-focus-within:text-amber-500 transition-colors" size={14} />
                            <input className="w-full bg-stone-900 border border-stone-800 rounded-xl py-2 pl-9 pr-3 text-[11px] focus:border-amber-500/50 focus:outline-none text-white placeholder-stone-700 transition-all" placeholder="Buscar na biblioteca..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}/>
                        </div>
                    </div>
                
                {libraryTab === 'bestiary' && ( 
                    <div className="flex gap-1 mb-2">
                        <button onClick={createEmptyMonster} className="flex-1 py-1.5 bg-stone-800 border border-stone-600 rounded text-[10px] font-bold text-stone-300 hover:text-white hover:border-stone-400 flex items-center justify-center gap-1"><Plus size={12}/> Manual</button>
                        <button onClick={() => setAiPromptOpen(true)} className="flex-1 py-1.5 bg-gradient-to-r from-purple-900/40 to-amber-900/40 border border-purple-500/30 rounded text-[10px] font-bold text-purple-300 hover:text-white hover:border-purple-500 flex items-center justify-center gap-1"><BrainCircuit size={12}/> IA</button> 
                        {onImportMonsterDrive && (
                            <button onClick={onImportMonsterDrive} className="flex-1 py-1.5 bg-blue-900/40 border border-blue-500/30 rounded text-[10px] font-bold text-blue-300 hover:text-white hover:border-blue-500 flex items-center justify-center gap-1"><Cloud size={12}/> Drive</button>
                        )}
                    </div>
                )}
                {libraryTab !== 'bestiary' && libraryTab !== 'party' && libraryTab !== 'npcs' && libraryTab !== 'permissions' && ( <button onClick={() => { setIsCreating(!isCreating); setNewLibItem({name: '', stat1: '', stat2: ''}) }} className="w-full mb-2 py-1.5 bg-[#252535] border border-[#333] hover:border-[#555] rounded text-xs text-stone-300 flex items-center justify-center gap-2"><Plus size={14}/> Criar Personalizado</button> )}

                {isCreating && libraryTab !== 'bestiary' && libraryTab !== 'party' && libraryTab !== 'npcs' && libraryTab !== 'permissions' && (
                    <div className="bg-[#202024] p-2 mb-2 rounded border border-[#333] shadow-lg animate-in fade-in slide-in-from-top-2">
                        <input className="w-full bg-black/30 border border-[#333] rounded p-1 text-[10px] mb-1 text-white focus:border-amber-500 focus:outline-none" placeholder="Nome" value={newLibItem.name} onChange={e => setNewLibItem({...newLibItem, name: e.target.value})} />
                        {libraryTab !== 'abilities' && ( <input className="w-full bg-black/30 border border-[#333] rounded p-1 text-[10px] mb-1 text-white focus:border-amber-500 focus:outline-none" placeholder={libraryTab === 'spells' ? 'Nível' : 'Dano'} value={newLibItem.stat1} onChange={e => setNewLibItem({...newLibItem, stat1: e.target.value})} /> )}
                        <input className="w-full bg-black/30 border border-[#333] rounded p-1 text-[10px] mb-1 text-white focus:border-amber-500 focus:outline-none" placeholder="Descrição/Propriedades" value={newLibItem.stat2} onChange={e => setNewLibItem({...newLibItem, stat2: e.target.value})} />
                        <button onClick={handleCreateLibItem} className="w-full bg-green-700 hover:bg-green-600 text-white rounded p-1 text-[10px] font-bold uppercase">Salvar</button>
                    </div>
                )}

                <div className="flex-1 overflow-hidden">
                    {libraryTab === 'party' && (
                        <div className="h-full overflow-y-auto custom-scrollbar space-y-1">
                            {(characters as Character[]).filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase())).map((char, i) => (
                                <div key={i} className="bg-[#222226] p-2 rounded border border-[#333] hover:border-blue-600/50 flex justify-between items-center group">
                                    <div className="flex items-center gap-2">
                                        <div className="w-6 h-6 bg-black rounded overflow-hidden border border-[#333]">
                                            {char.imageUrl ? <img src={char.imageUrl} className="w-full h-full object-contain" referrerPolicy="no-referrer"/> : <Users size={12} className="m-auto mt-1 text-stone-600"/>}
                                        </div>
                                        <div className="text-xs font-bold text-blue-400">{char.name}</div>
                                    </div>
                                    <button onClick={() => internalAddCharToEncounter(char)} className="text-stone-500 hover:text-green-400 p-1 bg-black/30 rounded hover:bg-black/50"><Plus size={14}/></button>
                                </div>
                            ))}
                        </div>
                    )}
                    {libraryTab === 'npcs' && (
                        <div className="h-full overflow-y-auto custom-scrollbar space-y-1">
                            {npcs && npcs.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase())).map((char, i) => (
                                <div key={i} className="bg-[#222226] p-2 rounded border border-[#333] hover:border-green-600/50 flex justify-between items-center group">
                                    <div className="flex items-center gap-2">
                                        <div className="w-6 h-6 bg-black rounded overflow-hidden border border-[#333]">
                                            {char.imageUrl ? <img src={char.imageUrl} className="w-full h-full object-contain" referrerPolicy="no-referrer"/> : <Users size={12} className="m-auto mt-1 text-stone-600"/>}
                                        </div>
                                        <div className="text-xs font-bold text-green-400">{char.name}</div>
                                    </div>
                                    <button onClick={() => internalAddCharToEncounter(char)} className="text-stone-500 hover:text-green-400 p-1 bg-black/30 rounded hover:bg-black/50"><Plus size={14}/></button>
                                </div>
                            ))}
                        </div>
                    )}
                    {libraryTab === 'bestiary' && (
                        <div className="flex flex-col h-full overflow-hidden text-left">
                            {/* Encounter Difficulty Summary */}
                            <div className="px-3 py-2 bg-stone-900 border-b border-stone-800 flex justify-between items-center shrink-0">
                                <div className="flex flex-col">
                                    <div className="text-[8px] font-black uppercase text-stone-500 tracking-widest">Dificuldade Estimada</div>
                                    <div className={`text-xs font-black uppercase tracking-tighter ${difficultyData.color}`}>
                                        {difficultyData.difficulty}
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-[8px] font-black uppercase text-stone-500 tracking-widest">XP Ajustado</div>
                                    <div className="text-xs font-mono text-stone-300">
                                        {Math.floor(difficultyData.adjustedXP)} XP
                                    </div>
                                </div>
                            </div>

                            <div className="p-2 shrink-0 border-b border-stone-800 bg-stone-900/40">
                                 <div className="relative">
                                    <Search className="absolute left-3 top-2 text-stone-600" size={14}/>
                                    <input className="w-full bg-stone-950 border border-stone-800 rounded-lg py-1.5 pl-9 pr-3 text-[11px] focus:border-amber-500/50 focus:outline-none text-white placeholder-stone-700 transition-all shadow-inner" placeholder="Buscar no bestiário..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}/>
                                </div>
                            </div>

                            <div className="flex-1 overflow-hidden">
                            <ListWindow
                                style={{ height: compact ? 400 : 700, width: '100%' }}
                                rowCount={flattenedBestiary.length}
                                rowHeight={55}
                                className="custom-scrollbar"
                                rowComponent={BestiaryRow}
                                rowProps={{} as any}
                            />
                            </div>
                        </div>
                    )}
                    {libraryTab === 'spells' && (
                        <div className="h-full overflow-y-auto custom-scrollbar space-y-1">
                            {displayedSpells.map(([name, spell]) => (
                                <div key={name} className="bg-[#222226] p-1.5 rounded border border-[#333] hover:border-purple-600/50 flex justify-between items-center group cursor-help" title={spell.desc}>
                                    <div className="flex-1 overflow-hidden"><div className="text-xs font-bold text-purple-400 truncate">{name}</div><div className="text-[9px] text-stone-500">{spell.level}</div></div>
                                    <div className="flex gap-1"><button onClick={() => addLog(`Ref: ${name}`, `${spell.level} | ${spell.desc}`, 'magic')} className="text-stone-500 hover:text-stone-300 p-1"><Info size={12}/></button><button onClick={() => addSpellToTarget(name)} className="text-stone-500 hover:text-purple-400 p-1"><Plus size={14}/></button></div>
                                </div>
                            ))}
                        </div>
                    )}
                    {libraryTab === 'weapons' && (
                        <div className="h-full overflow-y-auto custom-scrollbar space-y-1">
                            {displayedWeapons.map((w, i) => (
                                <div key={i} className="bg-[#222226] p-1.5 rounded border border-[#333] hover:border-red-600/50 flex justify-between items-center group">
                                    <div className="flex-1 overflow-hidden"><div className="text-xs font-bold text-red-400 truncate">{w.n}</div><div className="text-[9px] text-stone-500">{w.dmg}</div></div>
                                    <button onClick={() => addActionToTarget({n: w.n, hit: 0, dmg: w.dmg})} className="text-stone-500 hover:text-red-400 p-1"><Plus size={14}/></button>
                                </div>
                            ))}
                        </div>
                    )}
                    {libraryTab === 'abilities' && (
                        <div className="h-full overflow-y-auto custom-scrollbar space-y-1">
                            {displayedAbilities.map(([name, ab]) => (
                                <div key={name} className="bg-[#222226] p-1.5 rounded border border-[#333] hover:border-amber-600/50 flex justify-between items-center group cursor-help" title={ab.desc}>
                                    <div className="flex-1 overflow-hidden"><div className="text-xs font-bold text-amber-400 truncate">{name}</div><div className="text-[9px] text-stone-500">{ab.level}</div></div>
                                    <button onClick={() => {
                                        if (targetUid) {
                                            setEncounter(encounter.map(e => e.uid === targetUid ? { ...e, traits: [...(e.traits || []), { n: name, d: ab.desc }] } : e));
                                            addLog('Sistema', `Habilidade '${name}' aprendida pelo alvo.`, 'info');
                                        } else {
                                            console.warn("Selecione um alvo.");
                                        }
                                    }} className="text-stone-500 hover:text-amber-400 p-1"><Plus size={14}/></button>
                                </div>
                            ))}
                        </div>
                    )}
                    {libraryTab === 'assets' && (
                        <div className="h-full flex flex-col overflow-hidden">
                            <div className="flex items-center justify-between px-2 py-1 bg-stone-950/50 border-b border-stone-800">
                                <span className="text-[9px] text-stone-500 font-bold uppercase">Texturas Locais</span>
                                <button onClick={fetchLocalAssets} className="p-1 hover:bg-stone-800 rounded text-stone-500 hover:text-white transition-colors" title="Atualizar">
                                    <RefreshCw size={10} className={isLoadingAssets ? 'animate-spin' : ''}/>
                                </button>
                            </div>
                            <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
                                {localAssets.length === 0 ? (
                                    <div className="text-center py-10">
                                        <p className="text-[10px] text-stone-600 italic">Nenhuma imagem encontrada em:</p>
                                        <p className="text-[8px] text-stone-700 mt-1 break-all">public/textures/creatures</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-3 gap-2">
                                        {localAssets.map((url, idx) => (
                                            <button 
                                                key={idx} 
                                                onClick={() => {
                                                    if (editingMonster) {
                                                        setEditingMonster({...editingMonster, imageUrl: url});
                                                    } else if (targetUid) {
                                                        setEncounter(encounter.map(e => e.uid === targetUid ? { ...e, imageUrl: url } : e));
                                                        addLog("Avatar Atualizado", "Nova textura aplicada via galeria local", "info");
                                                    } else {
                                                        navigator.clipboard.writeText(url);
                                                    }
                                                }}
                                                className="aspect-square bg-black rounded border border-stone-800 hover:border-amber-500 transition-all overflow-hidden group relative"
                                            >
                                                <img src={url} className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                                                <div className="absolute inset-0 bg-amber-500/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                    <Plus size={16} className="text-white drop-shadow-lg" />
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                    {libraryTab === 'permissions' && permissions && setPermissions && (
                        <div className="space-y-2 p-2">
                            <div className="text-xs font-bold text-amber-500 mb-2 uppercase tracking-widest border-b border-stone-800 pb-1">Permissões dos Jogadores</div>
                            
                            <label className="flex items-center justify-between p-2 bg-stone-900/50 rounded-lg border border-stone-800 cursor-pointer hover:bg-stone-800 transition-colors">
                                <span className="text-sm text-stone-300">Mover Tokens</span>
                                <input 
                                    type="checkbox" 
                                    checked={permissions.canMoveTokens}
                                    onChange={(e) => setPermissions(prev => ({ ...prev, canMoveTokens: e.target.checked }))}
                                    className="w-4 h-4 accent-amber-500 bg-stone-800 border-stone-700 rounded"
                                />
                            </label>

                            <label className="flex items-center justify-between p-2 bg-stone-900/50 rounded-lg border border-stone-800 cursor-pointer hover:bg-stone-800 transition-colors">
                                <span className="text-sm text-stone-300">Editar Fichas</span>
                                <input 
                                    type="checkbox" 
                                    checked={permissions.canEditCharacters}
                                    onChange={(e) => setPermissions(prev => ({ ...prev, canEditCharacters: e.target.checked }))}
                                    className="w-4 h-4 accent-amber-500 bg-stone-800 border-stone-700 rounded"
                                />
                            </label>

                            <label className="flex items-center justify-between p-2 bg-stone-900/50 rounded-lg border border-stone-800 cursor-pointer hover:bg-stone-800 transition-colors">
                                <span className="text-sm text-stone-300">Rolar Dados</span>
                                <input 
                                    type="checkbox" 
                                    checked={permissions.canRollDice}
                                    onChange={(e) => setPermissions(prev => ({ ...prev, canRollDice: e.target.checked }))}
                                    className="w-4 h-4 accent-amber-500 bg-stone-800 border-stone-700 rounded"
                                />
                            </label>
                            <div className="text-[10px] text-stone-500 mt-2 italic">
                                Alterações são salvas automaticamente e aplicadas a todos os jogadores conectados.
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
        )}

        {((!compact) || (compact && compactTab === 'tracker')) && (
        <div className={`flex-1 bg-stone-950 p-1 md:p-3 overflow-y-auto custom-scrollbar relative flex flex-col ${compact ? 'absolute inset-0 z-0' : ''}`}>
           
           <div className="flex flex-wrap justify-between items-center mb-3 gap-3 shrink-0 bg-[#0c0a09] p-3 rounded-[1.5rem] border border-stone-800 shadow-2xl sticky top-0 z-20 backdrop-blur-md">
                <div className="flex items-center gap-4">
                    <div className="flex flex-col">
                        <span className="text-[10px] font-black text-amber-500 uppercase tracking-[0.2em] mb-0.5">Combate</span>
                        <div className="flex items-center gap-2">
                            <span className="text-[11px] font-bold text-stone-500 uppercase">Rodada</span>
                            <span className="text-white font-mono font-black text-lg">{round}</span>
                        </div>
                    </div>
                    <div className="h-8 w-px bg-stone-800"></div>
                    <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-stone-600 uppercase mb-0.5">Turno</span>
                        <span className="text-white font-mono font-black text-lg">{turnCounter}</span>
                    </div>
                    <div className="h-8 w-px bg-stone-800"></div>
                    <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-stone-600 uppercase mb-0.5">Sessão XP</span>
                        <span className="text-amber-500 font-mono font-black text-lg">{sessionXp}</span>
                    </div>
                </div>
                
                <div className="flex gap-2">
                    <button onClick={rollAllInitiative} className="p-2 bg-stone-900 border border-stone-800 rounded-xl text-amber-500 hover:bg-amber-500 hover:text-stone-950 transition-all shadow-lg" title="Rolar Iniciativa para Todos">
                        <Dices size={18}/>
                    </button>
                   <button onClick={sortInitiative} className="p-2 bg-stone-900 border border-stone-800 rounded-xl hover:text-white text-stone-400 hover:bg-stone-800 transition-all shadow-lg" title="Ordenar Iniciativa"><ArrowDownUp size={18}/></button>
                   <button onClick={nextTurn} className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white font-black text-xs rounded-xl flex items-center gap-2 shadow-xl transition-all uppercase tracking-tight"><Play size={14}/> Próximo</button>
                    <button onClick={() => {
                        if (setConfirmModal) {
                            setConfirmModal({
                                message: "Limpar todo o combate?",
                                onConfirm: () => {
                                    setEncounter([]);
                                    setTurnIndex(-1);
                                    if (setRound) setRound(1);
                                    if (setTurnCounter) setTurnCounter(0);
                                }
                            });
                        } else {
                            setEncounter([]);
                            setTurnIndex(-1);
                            if (setRound) setRound(1);
                            if (setTurnCounter) setTurnCounter(0);
                        }
                   }} className="p-2 bg-stone-900 border border-stone-800 rounded-xl text-red-500 hover:bg-red-600 hover:text-white transition-all shadow-lg" title="Limpar"><Trash2 size={18}/></button>
                </div>
           </div>

           {/* Mass Actions Dashboard */}
           <div className="flex flex-wrap gap-2 mb-3 bg-[#0c0a09] p-2 rounded-[1.5rem] border border-stone-800 items-center shadow-inner">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-stone-900 rounded-full border border-stone-800">
                    <Zap size={12} className="text-amber-500"/>
                    <span className="text-[10px] font-black text-stone-400 uppercase tracking-widest">Massa</span>
                </div>
                <div className="flex gap-1 flex-1">
                    <button onClick={() => encounter.forEach(p => updateHP(p.uid, -5))} className="flex-1 py-1.5 bg-stone-900 text-red-500 text-[10px] font-black rounded-xl border border-stone-800 hover:bg-red-600 hover:text-white transition-all">-5 HP</button>
                    <button onClick={() => encounter.forEach(p => updateHP(p.uid, 5))} className="flex-1 py-1.5 bg-stone-900 text-green-500 text-[10px] font-black rounded-xl border border-stone-800 hover:bg-green-600 hover:text-white transition-all">+5 HP</button>
                    <button onClick={() => encounter.forEach(p => updateTempHP(p.uid, 10))} className="flex-1 py-1.5 bg-stone-900 text-blue-500 text-[10px] font-black rounded-xl border border-stone-800 hover:bg-blue-600 hover:text-white transition-all">+10 Tmp</button>
                </div>
                <button onClick={() => {
                    if (setConfirmModal) {
                        setConfirmModal({
                            message: "Resetar todos?",
                            onConfirm: () => setEncounter(encounter.map(p => ({...p, hpCurrent: p.hpMax, hpTemp: 0})))
                        });
                    } else {
                        setEncounter(encounter.map(p => ({...p, hpCurrent: p.hpMax, hpTemp: 0})));
                    }
                }} className="p-2 text-stone-500 hover:text-amber-500 transition-colors" title="Resetar Todos"><RefreshCw size={16}/></button>
           </div>

           <div className="space-y-2">
               {encounter.map((participant, idx) => {
                   const isActive = turnIndex === idx;
                   const hpPercent = (participant.hpCurrent / participant.hpMax) * 100;
                   const isExpanded = expandedUid === participant.uid;
                   const isTarget = targetUid === participant.uid;

                   return (
                   <Fragment key={participant.uid}>
                   <div 
                       draggable="true"
                       onDragStart={(e) => {
                           e.dataTransfer.setData('application/x-rpg-combatant', JSON.stringify(participant));
                       }}
                       onClick={() => setExpandedUid(isExpanded ? null : participant.uid)} 
                       className={`relative bg-[#0c0a09] border transition-all cursor-pointer group overflow-hidden rounded-[1.5rem] p-3 ${isActive ? 'border-amber-500/50 shadow-[0_0_20px_rgba(245,158,11,0.1)]' : 'border-stone-800 hover:border-stone-700'} ${isTarget ? 'ring-2 ring-red-600' : ''}`}
                   >
                        {isActive && <div className="absolute left-0 top-0 bottom-0 w-1 bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]"></div>}
                        <div className="space-y-3">
                            {/* Row 1: HP Bar & AC */}
                            <div className="flex items-center gap-3">
                                <div className="flex-1 h-6 bg-stone-900 rounded-full overflow-hidden relative border border-stone-800 shadow-inner">
                                    <div 
                                        className={`h-full transition-all duration-700 ease-out ${hpPercent < 30 ? 'bg-red-600' : hpPercent < 60 ? 'bg-amber-500' : 'bg-green-500'}`} 
                                        style={{width: `${Math.min(100, hpPercent)}%`}}
                                    ></div>
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <span className="text-xs font-black text-white drop-shadow-md">
                                            {participant.hpCurrent} / {participant.hpMax}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1 bg-stone-900 px-2 py-1 rounded-lg border border-stone-800 shadow-sm">
                                    <Shield size={14} className="text-blue-400"/>
                                    <span className="text-xs font-black text-white">{participant.ac}</span>
                                </div>
                            </div>

                            {/* Row 2: Initiative, Avatar, Name, Actions */}
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-stone-900 rounded-xl border border-stone-800 flex items-center justify-center shrink-0">
                                    <input 
                                        type="number" 
                                        className="w-full bg-transparent text-center font-mono font-black text-stone-400 outline-none" 
                                        value={participant.initiative} 
                                        onChange={(e) => { e.stopPropagation(); updateInitiative(participant.uid, parseInt(e.target.value)||0); }} 
                                        onClick={e => e.stopPropagation()}
                                    />
                                </div>

                                <div className="w-10 h-10 bg-stone-900 rounded-xl border border-stone-800 overflow-hidden shrink-0 relative shadow-inner flex items-center justify-center">
                                    {participant.imageUrl ? (
                                        <img 
                                            src={participant.imageUrl} 
                                            alt={participant.name} 
                                            loading="lazy"
                                            className="w-full h-full object-contain"
                                            style={{
                                                transform: `translate(${participant.imageConfig?.x || 0}%, ${participant.imageConfig?.y || 0}%) scale(${participant.imageConfig?.scale || 1}) rotate(${participant.imageConfig?.rotation || 0}deg)`
                                            }}
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-stone-700"><Ghost size={14}/></div>
                                    )}
                                </div>

                                <div className="flex-1 font-black text-sm text-white truncate tracking-tight">
                                    {participant.name}
                                </div>

                                <div className="flex gap-1">
                                    <button onClick={(e) => {e.stopPropagation(); setTargetUid(isTarget ? null : participant.uid)}} className={`p-2 rounded-xl border transition-all ${isTarget ? 'bg-red-600 border-red-500 text-white' : 'bg-stone-900 border-stone-800 text-stone-600 hover:text-white'}`}><Target size={16}/></button>
                                    <button onClick={(e) => {e.stopPropagation(); toggleInspiration(participant.uid)}} className={`p-2 rounded-xl border transition-all ${participant.inspiration ? 'bg-amber-500 border-amber-400 text-stone-950 shadow-lg shadow-amber-500/20' : 'bg-stone-900 border-stone-800 text-stone-600 hover:text-white'}`} title="Inspiração"><Star size={16} className={participant.inspiration ? 'fill-current' : ''}/></button>
                                    <button onClick={(e) => {e.stopPropagation(); setConditionModalUid(participant.uid)}} className={`p-2 rounded-xl border transition-all ${participant.conditions.length > 0 ? 'bg-amber-500/20 border-amber-500 text-amber-500' : 'bg-stone-900 border-stone-800 text-stone-600 hover:text-white'}`}><Activity size={16}/></button>
                                    <button onClick={(e) => {e.stopPropagation(); setInspectingUid(participant.uid)}} className="p-2 bg-stone-900 border border-stone-800 rounded-xl text-stone-600 hover:text-white transition-all"><Eye size={16}/></button>
                                    <button onClick={(e) => {e.stopPropagation(); removeFromEncounter(participant.uid)}} className="p-2 bg-stone-900 border border-stone-800 rounded-xl text-stone-600 hover:text-red-500 transition-all"><Trash2 size={16}/></button>
                                </div>
                            </div>

                            {/* Row 3: HP Controls */}
                            <div className="flex gap-1">
                                <button onClick={(e) => {e.stopPropagation(); updateHP(participant.uid, -10)}} className="flex-1 py-2 bg-stone-900 border border-stone-800 text-red-600 font-black text-xs rounded-xl hover:bg-red-900/20 transition-all">-10</button>
                                <button onClick={(e) => {e.stopPropagation(); updateHP(participant.uid, -1)}} className="flex-1 py-2 bg-stone-900 border border-stone-800 text-red-500 font-black text-xs rounded-xl hover:bg-red-900/20 transition-all">-1</button>
                                
                                <div className="flex gap-1 shrink-0">
                                    <input 
                                        className="w-12 h-10 bg-black border border-stone-800 rounded-xl text-center text-sm text-white font-black outline-none focus:border-amber-500" 
                                        value={participant.hpCurrent} 
                                        onChange={(e) => {
                                            const val = parseInt(e.target.value);
                                            if (!isNaN(val)) setEncounter(encounter.map(p => p.uid === participant.uid ? {...p, hpCurrent: val} : p));
                                        }}
                                        onClick={e => e.stopPropagation()}
                                    />
                                    <input 
                                        className="w-12 h-10 bg-black border border-stone-800 rounded-xl text-center text-[10px] text-blue-500 font-black outline-none focus:border-blue-500" 
                                        placeholder="Tmp"
                                        value={participant.hpTemp || ''} 
                                        onChange={(e) => {
                                            const val = parseInt(e.target.value);
                                            updateTempHP(participant.uid, isNaN(val) ? 0 : val);
                                        }}
                                        onClick={e => e.stopPropagation()}
                                    />
                                </div>

                                <button onClick={(e) => {e.stopPropagation(); updateHP(participant.uid, 1)}} className="flex-1 py-2 bg-stone-900 border border-stone-800 text-green-500 font-black text-xs rounded-xl hover:bg-green-900/20 transition-all">+1</button>
                                <button onClick={(e) => {e.stopPropagation(); updateHP(participant.uid, 10)}} className="flex-1 py-2 bg-stone-900 border border-stone-800 text-green-600 font-black text-xs rounded-xl hover:bg-green-900/20 transition-all">+10</button>
                            </div>
                        </div>

                        {participant.conditions.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2 pl-1">
                                {participant.conditions.map(c => (
                                    <span key={c} className="text-[9px] bg-red-900/30 text-red-300 px-1.5 rounded border border-red-900/50 flex items-center gap-1 cursor-pointer" onClick={(e) => {e.stopPropagation(); toggleCondition(participant.uid, c)}}>
                                        {c} <X size={8} className="opacity-50 hover:opacity-100"/>
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>

                       {/* EXPANDED ACTIONS */}
                       {isExpanded && (
                           <div className="border-t-2 border-[#ffb74d] bg-[#1a1a1e] p-4 animate-in slide-in-from-top-2 cursor-default flex flex-col items-center" onClick={e => e.stopPropagation()}>
                                
                                <div className="bg-[#2a2a2e] w-full border border-stone-600 rounded-t-xl text-center py-2 mb-2 shadow-md">
                                    <h3 className="font-cinzel text-xl font-bold text-[#ffb74d] uppercase tracking-widest drop-shadow-md">{participant.name}</h3>
                                    <div className="text-[10px] font-bold uppercase text-stone-400">{participant.type} • ND {participant.cr}</div>
                                </div>

                                <div className="w-full max-w-[280px] aspect-square bg-black border-4 border-[#333] rounded-lg shadow-2xl overflow-hidden mb-4 relative group/img">
                                    {participant.imageUrl ? (
                                        <img 
                                            src={participant.imageUrl} 
                                            loading="lazy"
                                            className="w-full h-full object-contain transition-transform duration-700 group-hover/img:scale-110" 
                                            style={{
                                                transform: `translate(${participant.imageConfig?.x || 0}%, ${participant.imageConfig?.y || 0}%) scale(${participant.imageConfig?.scale || 1}) rotate(${participant.imageConfig?.rotation || 0}deg)`
                                            }}
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-stone-700"><Ghost size={64}/></div>
                                    )}
                                </div>

                                <div className="flex gap-1 w-full mb-4 bg-stone-900 p-1 rounded-xl border border-stone-800">
                                    <button onClick={() => setExpandedTab('actions')} className={`flex-1 py-2 text-[10px] font-black uppercase rounded-lg transition-all ${expandedTab === 'actions' ? 'bg-amber-500 text-stone-950 shadow-lg shadow-amber-500/20' : 'text-stone-500 hover:text-stone-300'}`}>Ações</button>
                                    <button onClick={() => setExpandedTab('spells')} className={`flex-1 py-2 text-[10px] font-black uppercase rounded-lg transition-all ${expandedTab === 'spells' ? 'bg-amber-500 text-stone-950 shadow-lg shadow-amber-500/20' : 'text-stone-500 hover:text-stone-300'}`}>Magias</button>
                                    <button onClick={() => setExpandedTab('rolls')} className={`flex-1 py-2 text-[10px] font-black uppercase rounded-lg transition-all ${expandedTab === 'rolls' ? 'bg-amber-500 text-stone-950 shadow-lg shadow-amber-500/20' : 'text-stone-500 hover:text-stone-300'}`}>Atrib</button>
                                    <button onClick={() => setExpandedTab('calc')} className={`flex-1 py-2 text-[10px] font-black uppercase rounded-lg transition-all ${expandedTab === 'calc' ? 'bg-amber-500 text-stone-950 shadow-lg shadow-amber-500/20' : 'text-stone-500 hover:text-stone-300'}`}>Calc</button>
                                </div>

                                <div className="w-full bg-stone-900/50 p-4 rounded-[1.5rem] border border-stone-800 shadow-inner">
                                    {expandedTab === 'actions' && (
                                        <div className="space-y-2">
                                            {participant.actions?.map((action, i) => (
                                                <div key={i} className="group bg-[#1a1a1d] p-2 rounded border border-[#333] hover:border-red-500/50 cursor-pointer transition-colors relative" onClick={() => performAttack(action.n, action.hit, action.dmg, participant.name)}>
                                                    <div className="flex justify-between items-center mb-1">
                                                        <span className="font-bold text-stone-200 text-xs">{action.n}</span>
                                                        <span className="text-[10px] bg-black/40 px-1.5 py-0.5 rounded text-stone-400 group-hover:text-red-400 font-mono border border-stone-800">
                                                            {fmt(action.hit)}
                                                        </span>
                                                    </div>
                                                    <div className="text-[10px] text-stone-500 font-mono">{action.dmg}</div>
                                                </div>
                                            ))}
                                            {(!participant.actions || participant.actions.length === 0) && <div className="text-[10px] text-stone-600 italic">Nenhuma ação registrada.</div>}
                                        </div>
                                    )}

                                    {expandedTab === 'spells' && (
                                        <div className="space-y-1 max-h-80 overflow-y-auto custom-scrollbar pr-1">
                                            {/* Detailed Spells from list */}
                                            {participant.spellList?.map((spell, i) => (
                                                <div key={`list-${i}`} className="group bg-[#1a1a1d] p-3 rounded border border-[#333] hover:border-purple-500/50 cursor-pointer transition-colors relative" onClick={() => addLog(`${participant.name} conjura ${spell.name}`, `[Círculo ${spell.level}] ${spell.castingTime} | ${spell.range} | ${spell.components} | ${spell.duration}${spell.concentration ? ' (Conc)' : ''}\n\n${spell.description}`, 'magic')}>
                                                    <div className="flex justify-between items-center mb-1">
                                                        <span className="font-bold text-purple-300 text-xs flex items-center gap-2">
                                                            <Wand2 size={12}/> {spell.name}
                                                            {spell.concentration && <Wind size={10} className="text-indigo-400" />}
                                                        </span>
                                                        <span className="text-[9px] bg-black/40 px-1.5 py-0.5 rounded text-stone-500 group-hover:text-purple-400 font-mono border border-stone-800">
                                                            {spell.level === 0 ? 'Truque' : `${spell.level}º`}
                                                        </span>
                                                    </div>
                                                    <div className="flex gap-2 text-[8px] text-stone-600 uppercase font-black mb-1">
                                                        <span>{spell.castingTime}</span>
                                                        <span>•</span>
                                                        <span>{spell.range}</span>
                                                    </div>
                                                    <div className="text-[10px] text-stone-500 font-mono leading-relaxed line-clamp-2">{spell.description}</div>
                                                </div>
                                            ))}

                                            {/* Legacy text-based spells */}
                                            {participant.spells?.filter(sn => !participant.spellList?.some(sl => sl.name === sn)).map((spellName, i) => {
                                                const dbSpell = SPELLS_DB[spellName] || customSpells[spellName];
                                                const level = dbSpell?.level || '???';
                                                const desc = dbSpell?.desc || 'Descrição não disponível.';
                                                
                                                return (
                                                    <div key={`text-${i}`} className="group bg-[#1a1a1d] p-2 rounded border border-[#333] hover:border-purple-500/50 cursor-pointer transition-colors relative" onClick={() => addLog(`${participant.name} conjura ${spellName}`, `[${level}] ${desc}`, 'magic')}>
                                                        <div className="flex justify-between items-center mb-1">
                                                            <span className="font-bold text-purple-300 text-xs flex items-center gap-2"><Wand2 size={12}/> {spellName}</span>
                                                            <span className="text-[9px] bg-black/40 px-1.5 py-0.5 rounded text-stone-500 group-hover:text-purple-400 font-mono border border-stone-800">
                                                                {level}
                                                            </span>
                                                        </div>
                                                        <div className="text-[10px] text-stone-500 font-mono leading-relaxed line-clamp-2">{desc}</div>
                                                    </div>
                                                )
                                            })}
                                            {(!participant.spells || participant.spells.length === 0) && (!participant.spellList || participant.spellList.length === 0) && <div className="text-[10px] text-stone-600 italic text-center py-2">Nenhum conhecimento arcano.</div>}
                                        </div>
                                    )}

                                    {expandedTab === 'rolls' && (
                                        <div className="space-y-4">
                                            <div className="grid grid-cols-3 gap-2">
                                                {Object.entries(participant.attributes || {str:10, dex:10, con:10, int:10, wis:10, cha:10}).map(([key, val]) => {
                                                    const mod = getMod(val as number);
                                                    return (
                                                        <div key={key} className="bg-[#1a1a1d] p-2 rounded border border-[#333] flex flex-col items-center group">
                                                            <div className="text-[9px] font-bold text-stone-500 uppercase mb-1">{key}</div>
                                                            <div className="text-xl font-bold text-stone-300 mb-1">{val}</div>
                                                            <div className="flex gap-1 w-full">
                                                                <button onClick={() => rollStat(participant.uid, key.toUpperCase(), mod, false)} className="flex-1 bg-stone-800 hover:bg-stone-700 text-[9px] py-1 rounded text-stone-400 border border-stone-700" title="Teste de Atributo">T:{fmt(mod)}</button>
                                                                <button onClick={() => rollStat(participant.uid, key.toUpperCase(), mod, true)} className="flex-1 bg-stone-800 hover:bg-stone-700 text-[9px] py-1 rounded text-stone-400 border border-stone-700" title="Teste de Resistência">R:{fmt(mod)}</button>
                                                            </div>
                                                        </div>
                                                    )
                                                })}
                                            </div>
                                            <div className="text-[10px] text-stone-500 text-center italic">Clique em 'T' para Teste ou 'R' para Resistência.</div>
                                        </div>
                                    )}

                                    {expandedTab === 'calc' && (
                                        <div className="flex flex-col gap-3">
                                            <div className="bg-black p-3 rounded border border-stone-800 flex items-center justify-between">
                                                <input type="number" className="bg-transparent text-2xl font-bold text-white outline-none w-full text-center" placeholder="Valor" value={calcValue} onChange={(e) => setCalcValue(parseInt(e.target.value) || 0)} />
                                            </div>
                                            <div className="grid grid-cols-2 gap-2">
                                                <button onClick={() => { updateHP(participant.uid, -calcValue); setCalcValue(0); }} className="bg-red-900/30 hover:bg-red-900/50 border border-red-800 text-red-400 font-bold py-3 rounded flex items-center justify-center gap-2"><Minus size={16}/> Dano</button>
                                                <button onClick={() => { updateHP(participant.uid, calcValue); setCalcValue(0); }} className="bg-green-900/30 hover:bg-green-900/50 border border-green-800 text-green-400 font-bold py-3 rounded flex items-center justify-center gap-2"><Plus size={16}/> Cura</button>
                                            </div>
                                            <div className="grid grid-cols-4 gap-1">
                                                {[1, 5, 10, 20].map(v => (
                                                    <button key={v} onClick={() => setCalcValue(v)} className="bg-stone-800 hover:bg-stone-700 text-stone-400 text-xs py-1 rounded">{v}</button>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                           </div>
                       )}
                   </Fragment>
               )})}
               
               {encounter.length === 0 && (
                   <div className="text-center text-stone-600 mt-20 italic flex flex-col items-center">
                       <Skull size={48} className="mb-4 opacity-20"/>
                       <p>O campo de batalha está vazio.</p>
                       <p className="text-xs mt-2">Adicione combatentes da biblioteca à esquerda.</p>
                   </div>
               )}
           </div>
        </div>
        )}

        {/* Right: Logs Sidebar */}
        {((!compact && showLogs) || (compact && compactTab === 'logs')) && (
            <div className={`${compact ? 'absolute inset-0 z-10 bg-[#0c0a09]' : 'w-64 lg:w-72 border-l'} bg-[#0c0a09] border-stone-800 flex flex-col shadow-2xl shrink-0 overflow-hidden`}>
                <div className="p-4 border-b border-stone-800 bg-stone-900/30 flex justify-between items-center shrink-0">
                    <div className="flex items-center gap-2">
                        <History size={16} className="text-amber-500/50"/>
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-400">Log de Eventos</span>
                    </div>
                    <button onClick={() => clearLogs && clearLogs()} className="text-stone-600 hover:text-red-500 p-2 hover:bg-stone-800 rounded-xl transition-all" title="Limpar Logs"><Trash2 size={16}/></button>
                </div>
                <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar bg-black/20">
                    {logs.length === 0 && (
                        <div className="h-full flex flex-col items-center justify-center text-stone-700 opacity-50">
                            <ScrollText size={32} className="mb-2"/>
                            <span className="text-[10px] uppercase font-bold">Nenhum evento registrado</span>
                        </div>
                    )}
                    {logs.map(log => {
                        let bgColor = 'bg-stone-900/40 border-stone-800';
                        let textColor = 'text-stone-400';
                        let titleColor = 'text-stone-300';
                        let accentColor = 'bg-stone-700';
                        let Icon = Info;

                        if (log.type === 'crit') {
                            bgColor = 'bg-amber-500/5 border-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.05)]';
                            textColor = 'text-amber-200/80';
                            titleColor = 'text-amber-500';
                            accentColor = 'bg-amber-500';
                            Icon = Star;
                        } else if (log.type === 'fail') {
                            bgColor = 'bg-red-500/5 border-red-500/20';
                            textColor = 'text-red-300/80';
                            titleColor = 'text-red-500';
                            accentColor = 'bg-red-500';
                            Icon = Skull;
                        } else if (log.type === 'combat') {
                            bgColor = 'bg-stone-800/40 border-stone-700';
                            titleColor = 'text-stone-100';
                            accentColor = 'bg-stone-500';
                            Icon = Sword;
                        } else if (log.type === 'magic') {
                            bgColor = 'bg-purple-500/5 border-purple-500/20';
                            textColor = 'text-purple-200/80';
                            titleColor = 'text-purple-400';
                            accentColor = 'bg-purple-500';
                            Icon = Wand2;
                        } else if (log.type === 'dice') {
                            bgColor = 'bg-blue-500/5 border-blue-500/20';
                            textColor = 'text-blue-200/80';
                            titleColor = 'text-blue-400';
                            accentColor = 'bg-blue-500';
                            Icon = Dices;
                        }

                        const formattedDetails = log.details.split(/(\d+|ACERTA|ERRA|CRÍTICO|FALHA)/g).map((part, i) => {
                            if (/^\d+$/.test(part) || ['ACERTA', 'CRÍTICO'].includes(part)) return <span key={i} className="font-bold text-white">{part}</span>;
                            if (['ERRA', 'FALHA'].includes(part)) return <span key={i} className="font-bold text-red-400">{part}</span>;
                            return part;
                        });

                        return (
                            <div key={log.id} className={`p-2 rounded-xl border text-[10px] leading-relaxed animate-in slide-in-from-right-2 shadow-sm relative overflow-hidden group transition-all hover:border-stone-600 ${bgColor} ${textColor}`}>
                                <div className={`absolute left-0 top-0 bottom-0 w-0.5 ${accentColor} opacity-50`}></div>
                                <div className="flex justify-between items-center mb-0.5 border-b border-white/5 pb-0.5">
                                    <div className="flex items-center gap-1">
                                        <Icon size={8} className={titleColor} />
                                        <span className={`font-black text-[8px] uppercase tracking-tighter ${titleColor}`}>{log.title}</span>
                                    </div>
                                    <span className="text-[7px] opacity-30 font-mono">{new Date(log.timestamp).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</span>
                                </div>
                                <div className="text-[9px] leading-tight opacity-80">
                                    {formattedDetails}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        )}
      </div>
      
      {/* Condition Modal */}
      {conditionModalUid && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[110] p-4" onClick={() => setConditionModalUid(null)}>
              <div className="bg-[#1a1a1d] border border-[#333] rounded-xl p-4 w-72 shadow-2xl animate-in zoom-in-95" onClick={(e) => e.stopPropagation()}>
                  <div className="flex justify-between items-center mb-3 border-b border-[#333] pb-2">
                    <h3 className="font-bold text-stone-200 text-sm">Gerenciar Condições</h3>
                    <button onClick={() => setConditionModalUid(null)}><X size={16} className="text-stone-500 hover:text-white"/></button>
                  </div>
                  <div className="grid grid-cols-2 gap-1.5 max-h-80 overflow-y-auto custom-scrollbar">
                      {conditionsList.map(cond => {
                          const participant = encounter.find((e: EncounterParticipant) => e.uid === conditionModalUid);
                          const isActive = participant?.conditions?.includes(cond);
                          return (
                              <button key={cond} onClick={() => toggleCondition(conditionModalUid, cond)} className={`px-2 py-1.5 text-[10px] font-bold rounded border transition-all text-left ${isActive ? 'bg-red-900/40 border-red-500 text-red-200' : 'bg-[#222] border-[#333] text-stone-400 hover:bg-[#2a2a2e] hover:text-white'}`}>
                                  {cond}
                              </button>
                          )
                      })}
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};
