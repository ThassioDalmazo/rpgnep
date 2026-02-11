
import React, { useState } from 'react';
import { GoogleGenAI } from "@google/genai";
import { Monster, EncounterParticipant, LogEntry, Character } from '../types';
import { SPELLS_DB, COMMON_WEAPONS } from '../constants';
import { Search, Shield, Ghost, Sword, Play, ArrowDownUp, Dices, Crosshair, Minus, ChevronsUp, ChevronsDown, Trash2, Activity, Sparkles, Wand2, ScrollText, Star, X, Plus, Pencil, Users, Axe, Book, Zap, Eye, BrainCircuit, Loader2, Backpack, Tag, Hand, Info } from 'lucide-react';

interface Props {
  encounter: EncounterParticipant[];
  setEncounter: (e: EncounterParticipant[]) => void;
  logs: LogEntry[];
  addLog: (title: string, details: string, type?: LogEntry['type']) => void;
  characters: Character[];
  monsters: Monster[];
  setMonsters: (m: Monster[]) => void;
  turnIndex: number;
  setTurnIndex: (index: number) => void;
  targetUid: number | null;
  setTargetUid: (uid: number | null) => void;
  compact?: boolean;
  onAddCombatant?: (combatant: EncounterParticipant) => void;
}

const CR_XP: Record<string, number> = {
    '0': 10, '1/8': 25, '1/4': 50, '1/2': 100,
    '1': 200, '2': 450, '3': 700, '4': 1100, '5': 1800,
    '6': 2300, '7': 2900, '8': 3900, '9': 5000, '10': 5900,
    '11': 7200, '12': 8400, '13': 10000, '14': 11500, '15': 13000,
    '16': 15000, '17': 18000, '18': 20000, '19': 22000, '20': 25000,
    '21': 33000, '22': 41000, '23': 50000, '24': 62000, '30': 155000
};

export const DMTools: React.FC<Props> = ({ encounter = [], setEncounter, logs = [], addLog, characters = [], monsters = [], setMonsters, turnIndex, setTurnIndex, targetUid, setTargetUid, compact = false, onAddCombatant }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [libraryTab, setLibraryTab] = useState<'party' | 'bestiary' | 'spells' | 'weapons' | 'abilities'>('party');
  const [showLibrary, setShowLibrary] = useState(!compact);
  const [showLogs, setShowLogs] = useState(!compact);
  
  // Custom Library States
  const [customSpells, setCustomSpells] = useState<Record<string, {level: string, desc: string}>>({});
  const [customWeapons, setCustomWeapons] = useState<{n: string, dmg: string, prop: string}[]>([]);
  const [customAbilities, setCustomAbilities] = useState<Record<string, {level: string, desc: string}>>({});
  
  // Creation States
  const [isCreating, setIsCreating] = useState(false);
  const [newLibItem, setNewLibItem] = useState<{name: string, stat1: string, stat2: string}>({name: '', stat1: '', stat2: ''});

  // Custom Monster Modal
  const [customModalOpen, setCustomModalOpen] = useState(false);
  const [editingMonsterId, setEditingMonsterId] = useState<number | null>(null);
  const [newMonster, setNewMonster] = useState<Partial<Monster>>({ 
    name: '', hp: 10, ac: 10, cr: '1/8', type: 'Humanóide',
    actions: [], spells: [] 
  });

  // AI Monster Gen State
  const [aiPromptOpen, setAiPromptOpen] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  
  // Inspection State
  const [inspectingUid, setInspectingUid] = useState<number | null>(null);
  const [inspectorTab, setInspectorTab] = useState<'actions' | 'spells' | 'inv' | 'traits'>('actions');
  
  // Conditions Modal
  const [conditionModalUid, setConditionModalUid] = useState<number | null>(null);
  
  // Temp states for adding items in modal
  const [actionInput, setActionInput] = useState({ n: '', hit: 0, dmg: '' });
  
  // Combat State
  const [rollMode, setRollMode] = useState<'normal' | 'adv' | 'dis'>('normal');
  const [sessionXp, setSessionXp] = useState(0);

  const conditionsList = [
    "Agarrado", "Amedrontado", "Atordoado", "Caído", "Cego", 
    "Enfeitiçado", "Envenenado", "Exausto", "Impedido", 
    "Incapacitado", "Inconsciente", "Invisível", "Paralisado", 
    "Petrificado", "Surdo"
  ];

  // Helper Functions
  const getMod = (val: number) => Math.floor((val - 10) / 2);
  const fmt = (val: number) => (val >= 0 ? "+" : "") + val;

  const getPassivePerception = (char: Character): number => {
      const wisMod = getMod(char.attributes.wis);
      const prof = Math.ceil(1 + (char.level / 4));
      const hasSkill = char.skills['percepcao'] || false;
      return 10 + wisMod + (hasSkill ? prof : 0);
  };

  const getCharacterActions = (char: Character): { n: string; hit: number; dmg: string }[] => {
    const actions: { n: string; hit: number; dmg: string }[] = [];
    if (!char) return actions;
    const prof = Math.ceil(1 + ((char.level || 1) / 4));
    const strMod = Math.floor(((char.attributes?.str || 10) - 10) / 2);
    const dexMod = Math.floor(((char.attributes?.dex || 10) - 10) / 2);
    
    // Spell Casting
    const castingStatStr = char.spells?.castingStat || 'int';
    // @ts-ignore
    const castingMod = Math.floor(((char.attributes?.[castingStatStr as keyof typeof char.attributes] || 10) - 10) / 2);
    const spellHit = prof + castingMod;

    // Simple parsing for weapons in inventory
    const invLines = (char.inventory || "").split('\n');
    invLines.forEach(line => {
        const structMatch = line.match(/(?:-\s*)?(.*?)\s*\|\s*Dano:\s*(\d+d\d+)/i);
        if (structMatch) {
            const name = structMatch[1].trim();
            const dmgBase = structMatch[2];
            // Simple logic: Finesse/Ranged uses Dex, otherwise Str (Basic approximation)
            const isRanged = line.toLowerCase().includes('arco') || line.toLowerCase().includes('besta');
            const mod = isRanged ? dexMod : strMod;
            actions.push({ n: name, hit: prof + mod, dmg: `${dmgBase}${mod >= 0 ? '+' : ''}${mod}` }); 
        }
    });

    // Parsing Spells (Standard & Custom) to Actions if they have Damage
    if (char.spells?.known) {
        const spellLines = char.spells.known.split('\n');
        spellLines.forEach(line => {
             const nameMatch = line.match(/(?:\[.*?\]\s*)?(.*?):/);
             const spellName = nameMatch ? nameMatch[1].trim() : line.trim();
             
             // Search Priority: 
             // 1. Character Custom Spells (Highest Priority for user override)
             // 2. DM Local Custom Spells
             // 3. Official DB
             let dbSpell: any = char.customSpells?.find(s => s.name === spellName);
             if (!dbSpell) dbSpell = customSpells[spellName];
             if (!dbSpell) dbSpell = SPELLS_DB[spellName];
             
             // Fuzzy match fallback
             if (!dbSpell) {
                 dbSpell = Object.values(SPELLS_DB).find((s: any) => line.includes(s.desc.substring(0, 10)));
             }

             if (dbSpell) {
                 // Look for dice notation in description (e.g. "8d6")
                 const dmgMatch = dbSpell.desc.match(/(\d+d\d+)/);
                 if (dmgMatch) {
                     // Add to actions list for roll buttons
                     actions.push({ n: spellName, hit: spellHit, dmg: dmgMatch[1] });
                 }
             }
        });
    }

    // Add simple default if empty
    if (actions.length === 0) actions.push({n: 'Desarmado', hit: prof + strMod, dmg: `1+${strMod}`});
    return actions;
  };

  const generateMonsterAI = async () => {
      if (!aiPrompt.trim()) return;
      setIsGeneratingAi(true);
      const apiKey = process.env.API_KEY;
      
      try {
          const ai = new GoogleGenAI({ apiKey: apiKey! });
          
          const systemPrompt = `You are a D&D 5e Monster Generator. 
          Generate a valid JSON object for a monster based on the user prompt. 
          
          CRITICAL: Also provide a "description" field containing Lore, Behavior, and Combat Tactics.
          
          STRICTLY follow this JSON structure:
          {
            "name": "Monster Name",
            "type": "Type (e.g. Beast, Humanoid)",
            "cr": "Challenge Rating (e.g. '1/4', '5')",
            "ac": number,
            "hp": number,
            "speed": "String (e.g. '9m')",
            "actions": [
              { "n": "Action Name", "hit": number (bonus to hit), "dmg": "Damage Dice (e.g. 2d6+3)" }
            ],
            "traits": [
               { "n": "Trait Name", "d": "Description" }
            ],
            "spells": ["Spell Name 1", "Spell Name 2"],
            "description": "Write a concise paragraph describing the monster's appearance, lore, and specifically its combat tactics/behavior."
          }
          Do not include markdown formatting (like \`\`\`json). Return only the raw JSON.`;

          const result = await ai.models.generateContent({
              model: "gemini-3-flash-preview",
              contents: [
                  { role: "user", parts: [{ text: systemPrompt + "\n\nUser Request: " + aiPrompt }] }
              ]
          });

          const responseText = result.text || "";
          const cleanJson = responseText.replace(/```json|```/g, '').trim();
          const mobData = JSON.parse(cleanJson);

          // Add description as a trait if it exists
          const generatedTraits = Array.isArray(mobData.traits) ? mobData.traits : [];
          if (mobData.description) {
              generatedTraits.unshift({ n: "Descrição & Táticas", d: mobData.description });
          }

          const newMob: Monster = {
              id: Date.now(),
              name: String(mobData.name || "Monstro Desconhecido"),
              type: String(mobData.type || "Desconhecido"),
              cr: String(mobData.cr || "0"),
              ac: Number(mobData.ac || 10),
              hp: Number(mobData.hp || 10),
              speed: String(mobData.speed || "9m"),
              actions: Array.isArray(mobData.actions) ? mobData.actions : [],
              traits: generatedTraits,
              spells: Array.isArray(mobData.spells) ? mobData.spells : []
          };

          setMonsters([...monsters, newMob]);
          addLog("IA Criadora", `Criatura "${newMob.name}" forjada no éter e adicionada ao bestiário.`, 'magic');
          setAiPromptOpen(false);
          setAiPrompt('');

      } catch (error) {
          console.error("AI Generation Error", error);
          alert("Falha ao gerar monstro. Tente novamente.");
      } finally {
          setIsGeneratingAi(false);
      }
  };

  const internalAddToEncounter = (mob: Monster) => {
    const count = encounter.filter(e => e.id === mob.id).length + 1;
    const participant: EncounterParticipant = {
      ...mob,
      uid: Date.now() + Math.random(),
      name: `${mob.name} ${count}`,
      hpCurrent: mob.hp,
      hpMax: mob.hp,
      initiative: Math.floor(Math.random() * 20) + 1, 
      conditions: []
    };
    if (onAddCombatant) {
        onAddCombatant(participant);
    } else {
        setEncounter([...encounter, participant]);
        addLog('Entrada', `${participant.name} entrou no combate.`, 'info');
    }
  };

  const internalAddCharToEncounter = (char: Character) => {
    const dexMod = Math.floor(((char.attributes?.dex || 10) - 10) / 2);
    const charActions = getCharacterActions(char);
    
    // Parse Spells into a string array
    const charSpells: string[] = [];
    if (char.spells?.known) {
         char.spells.known.split('\n').forEach(l => {
             const m = l.match(/(?:\[.*?\]\s*)?(.*?):/);
             if (m) charSpells.push(m[1].trim());
             else if (l.trim().length > 0) charSpells.push(l.trim());
         });
    }

    // Parse Features into Traits
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
      speed: char.speed,
      initiative: Math.floor(Math.random() * 20) + 1 + dexMod,
      conditions: [],
      actions: charActions,
      spells: charSpells,
      traits: charTraits,
      // @ts-ignore
      linkedCharId: char.id 
    };
    if (onAddCombatant) {
        onAddCombatant(participant);
    } else {
        setEncounter([...encounter, participant]);
        addLog('Entrada', `${char.name} (PJ) entrou no combate.`, 'info');
    }
  };

  const removeFromEncounter = (uid: number) => {
    const mob = encounter.find(e => e.uid === uid);
    if (mob && CR_XP[mob.cr]) {
        const xp = CR_XP[mob.cr];
        setSessionXp(sessionXp + xp);
        addLog('XP', `${mob.name} derrotado. +${xp} XP`, 'info');
    }
    setEncounter(encounter.filter(e => e.uid !== uid));
    if (targetUid === uid) setTargetUid(null);
  };

  const updateHP = (uid: number, delta: number) => {
    setEncounter(encounter.map(e => {
      if (e.uid === uid) {
        const newHp = Math.min(e.hpMax, Math.max(0, e.hpCurrent + delta));
        return { ...e, hpCurrent: newHp };
      }
      return e;
    }));
  };

  const updateInitiative = (uid: number, val: number) => setEncounter(encounter.map(e => e.uid === uid ? { ...e, initiative: val } : e));
  const toggleCondition = (uid: number, condition: string) => setEncounter(encounter.map(e => e.uid === uid ? { ...e, conditions: e.conditions.includes(condition) ? e.conditions.filter(c => c !== condition) : [...e.conditions, condition] } : e));

  const rollAttack = (attackerName: string, actionName: string, hitBonus: number, dmg: string) => {
    const r1 = Math.floor(Math.random() * 20) + 1;
    const r2 = Math.floor(Math.random() * 20) + 1;
    let d20 = r1;
    let rollDetails = `(${r1})`;

    if (rollMode === 'adv') { d20 = Math.max(r1, r2); rollDetails = `(Adv: ${r1}, ${r2})`; } 
    else if (rollMode === 'dis') { d20 = Math.min(r1, r2); rollDetails = `(Des: ${r1}, ${r2})`; }

    const totalHit = d20 + hitBonus;
    const isCrit = d20 === 20;
    
    // Parse Damage
    let dmgTotal = 0;
    let diceRolledStr = "";
    
    // Robust Damage Parsing to handle "1d10 + 3" or "3d6"
    const dmgRegex = /(\d+)d(\d+)(\s*[+\-]\s*\d+)?/;
    const dmgMatch = dmg.match(dmgRegex);
    
    if (dmgMatch) {
        const num = parseInt(dmgMatch[1]) * (isCrit ? 2 : 1);
        const faces = parseInt(dmgMatch[2]);
        const modStr = (dmgMatch[3] || "").replace(/\s/g, '');
        const mod = parseInt(modStr || '0');
        
        let rolls = [];
        for(let i=0; i<num; i++) {
            const r = Math.floor(Math.random() * faces) + 1;
            rolls.push(r);
            dmgTotal += r;
        }
        dmgTotal = Math.max(0, dmgTotal + mod);
        diceRolledStr = `[${rolls.join(',')}]${mod ? (mod > 0 ? `+${mod}` : mod) : ''}`;
    } else {
        // Flat damage?
        const flat = parseInt(dmg);
        if (!isNaN(flat)) {
            dmgTotal = flat * (isCrit ? 2 : 1);
            diceRolledStr = `[Fixo ${flat}${isCrit?'x2':''}]`;
        }
    }

    addLog(
        `${attackerName} ataca com ${actionName}`, 
        `Acerto: ${d20}${rollDetails} + ${hitBonus} = ${totalHit}\nDano: ${dmgTotal} ${diceRolledStr} ${isCrit ? '(CRÍTICO!)' : ''}`, 
        isCrit ? 'crit' : 'combat'
    );
  };

  const castSpell = (participant: EncounterParticipant, spellName: string) => {
        // Find spell data prioritizing custom character spells if linked
        let spellData: any = null;

        // @ts-ignore
        const linkedCharId = participant.linkedCharId;
        if (linkedCharId) {
            const char = characters.find(c => c.id === linkedCharId);
            if (char && char.customSpells) {
                spellData = char.customSpells.find(s => s.name === spellName);
            }
        }

        if (!spellData) spellData = SPELLS_DB[spellName] || customSpells[spellName];
        
        // Try to find by partial match in standard DB
        if (!spellData) {
             const found = Object.entries(SPELLS_DB).find(([k]) => spellName.includes(k));
             if (found) spellData = found[1];
        }

        if (!spellData) {
            // Just log if unknown
            addLog(participant.name, `Conjurou ${spellName}`, 'magic');
            return;
        }

        const desc = spellData.desc;
        // Check for damage dice in description to decide if it's a combat roll
        const dmgMatch = desc.match(/(\d+)d(\d+)(\s*[+\-]\s*\d+)?/);

        if (dmgMatch) {
            // It has damage, calculate hit bonus and roll attack
            let hitBonus = 0;
            
            if (linkedCharId) {
                const char = characters.find(c => c.id === linkedCharId);
                if (char) {
                    const prof = Math.ceil(1 + (char.level / 4));
                    const stat = char.spells.castingStat || 'int';
                    // @ts-ignore
                    const mod = Math.floor(((char.attributes[stat] || 10) - 10) / 2);
                    hitBonus = prof + mod;
                }
            } else {
                // Estimate for monster
                if (participant.actions.length > 0) {
                    hitBonus = Math.max(...participant.actions.map(a => a.hit));
                } else {
                    hitBonus = 4; // Fallback
                }
            }

            const damageDice = dmgMatch[0]; // The "1d10" part
            rollAttack(participant.name, `${spellName}`, hitBonus, damageDice);
        } else {
            // Utility spell
            addLog(participant.name, `Conjurou ${spellName}`, 'magic');
        }
  };

  const sortInitiative = () => {
    const sorted = [...encounter].sort((a, b) => b.initiative - a.initiative);
    setEncounter(sorted);
    setTurnIndex(0); 
    addLog('Sistema', 'Iniciativa ordenada. Rodada 1 começou.', 'info');
  };

  const nextTurn = () => {
      if (encounter.length === 0) return;
      const next = (turnIndex + 1) % encounter.length;
      setTurnIndex(next);
      addLog('Turno', `Turno de ${encounter[next].name}`, 'info');
  };

  // --- LIBRARY ACTIONS ---
  const addActionToTarget = (action: {n: string, hit: number, dmg: string}) => {
      if (!targetUid) { alert("Selecione um combatente no cardápio de combate (clique no card) para adicionar esta arma."); return; }
      setEncounter(encounter.map(e => e.uid === targetUid ? { ...e, actions: [...e.actions, action] } : e));
      addLog('Sistema', `Arma/Ação '${action.n}' adicionada ao alvo selecionado.`, 'info');
  };

  const addSpellToTarget = (name: string) => {
      if (!targetUid) { alert("Selecione um combatente para adicionar esta magia."); return; }
      setEncounter(encounter.map(e => e.uid === targetUid ? { ...e, spells: e.spells ? [...e.spells, name] : [name] } : e));
      addLog('Sistema', `Magia '${name}' aprendida pelo alvo selecionado.`, 'magic');
  };

  const addTraitToTarget = (name: string, desc: string) => {
      if (!targetUid) { alert("Selecione um combatente para adicionar esta habilidade."); return; }
      setEncounter(encounter.map(e => e.uid === targetUid ? { ...e, traits: [...(e.traits || []), {n: name, d: desc}] } : e));
      addLog('Sistema', `Habilidade '${name}' adquirida pelo alvo selecionado.`, 'magic');
  };

  const handleCreateLibItem = () => {
      if (!newLibItem.name) return;
      if (libraryTab === 'spells') setCustomSpells({ ...customSpells, [newLibItem.name]: { level: newLibItem.stat1 || 'Truque', desc: newLibItem.stat2 || 'Efeito Mágico' } });
      else if (libraryTab === 'weapons') setCustomWeapons([ ...customWeapons, { n: newLibItem.name, dmg: newLibItem.stat1 || '1d4', prop: newLibItem.stat2 || 'Simples' } ]);
      else if (libraryTab === 'abilities') setCustomAbilities({ ...customAbilities, [newLibItem.name]: { level: 'Habilidade', desc: newLibItem.stat2 || 'Efeito Especial' } });
      setIsCreating(false);
      setNewLibItem({name: '', stat1: '', stat2: ''});
  };

  // Data Filters
  const displayedSpells = [...(Object.entries(SPELLS_DB) as [string, {level: string, desc: string}][]).filter(([_, s]) => s.level !== 'Habilidade'), ...Object.entries(customSpells)]
    .filter(([name]) => name.toLowerCase().includes(searchTerm.toLowerCase())) as [string, {level: string, desc: string}][];

  const displayedAbilities = [...(Object.entries(SPELLS_DB) as [string, {level: string, desc: string}][]).filter(([_, s]) => s.level === 'Habilidade'), ...Object.entries(customAbilities)]
    .filter(([name]) => name.toLowerCase().includes(searchTerm.toLowerCase())) as [string, {level: string, desc: string}][];

  const displayedWeapons = [...COMMON_WEAPONS, ...customWeapons]
    .filter(w => w.n.toLowerCase().includes(searchTerm.toLowerCase()));

  // Render Helpers
  const parseCR = (cr: string) => {
      if (cr.includes('/')) { const [n, d] = cr.split('/'); return parseInt(n) / parseInt(d); }
      return parseFloat(cr);
  };
  const groupedMonsters = Object.entries(monsters.reduce((acc, m) => {
      if (!acc[m.cr]) acc[m.cr] = [];
      acc[m.cr].push(m);
      return acc;
  }, {} as Record<string, Monster[]>)).sort((a, b) => parseCR(a[0]) - parseCR(b[0])).map(([cr, items]) => ({ cr, items: items as Monster[] }));

  // INSPECTOR RENDERER
  const renderInspector = () => {
      if (!inspectingUid) return null;
      const participant = encounter.find(e => e.uid === inspectingUid);
      if (!participant) return null;

      const char = characters.find(c => c.id === (participant as any).linkedCharId || c.name === participant.name);
      const isPlayer = !!char;

      const spellsList = isPlayer && char ? char.spells.known.split('\n').filter(s => s.trim()) : (participant.spells || []);
      const invList = isPlayer && char ? char.inventory.split('\n').filter(s => s.trim()) : [];
      const traitsList = isPlayer && char ? char.bio.features.split('\n').filter(s => s.trim()) : (participant.traits || []);

      return (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-end z-[100]" onClick={() => setInspectingUid(null)}>
              <div className="w-[400px] h-full bg-[#1c1c21] border-l border-amber-600/30 shadow-2xl animate-in slide-in-from-right duration-300 overflow-y-auto flex flex-col" onClick={e => e.stopPropagation()}>
                  <div className="p-4 bg-[#151518] border-b border-[#333] flex justify-between items-center sticky top-0 z-10 shrink-0">
                      <h3 className="font-cinzel font-bold text-amber-500 text-xl truncate">{participant.name}</h3>
                      <button onClick={() => setInspectingUid(null)}><X className="text-stone-500 hover:text-white"/></button>
                  </div>
                  
                  <div className="p-4 space-y-6 flex-1 overflow-y-auto custom-scrollbar">
                      <div className="grid grid-cols-3 gap-2 text-center">
                          <div className="bg-[#2a2a30] p-2 rounded border border-[#333]">
                              <div className="text-[10px] uppercase font-bold text-stone-500">CA (Armor)</div>
                              <div className="text-2xl font-bold text-blue-400">{participant.ac}</div>
                          </div>
                          <div className="bg-[#2a2a30] p-2 rounded border border-[#333]">
                              <div className="text-[10px] uppercase font-bold text-stone-500">HP (Vida)</div>
                              <div className="text-2xl font-bold text-red-500">{participant.hpCurrent} <span className="text-sm text-stone-600">/ {participant.hpMax}</span></div>
                          </div>
                          <div className="bg-[#2a2a30] p-2 rounded border border-[#333]">
                              <div className="text-[10px] uppercase font-bold text-stone-500">Percepção</div>
                              <div className="text-2xl font-bold text-green-500">{isPlayer && char ? getPassivePerception(char) : 10}</div>
                          </div>
                      </div>

                      {participant.conditions.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                              {participant.conditions.map(c => (
                                  <span key={c} className="px-2 py-1 bg-red-900/30 border border-red-800 text-red-300 text-xs rounded uppercase font-bold">{c}</span>
                              ))}
                          </div>
                      )}

                      <div className="flex border-b border-[#333]">
                          <button onClick={() => setInspectorTab('actions')} className={`flex-1 py-2 text-xs font-bold uppercase ${inspectorTab === 'actions' ? 'text-amber-500 border-b-2 border-amber-500' : 'text-stone-500'}`}>Ações</button>
                          <button onClick={() => setInspectorTab('spells')} className={`flex-1 py-2 text-xs font-bold uppercase ${inspectorTab === 'spells' ? 'text-purple-500 border-b-2 border-purple-500' : 'text-stone-500'}`}>Magias</button>
                          <button onClick={() => setInspectorTab('inv')} className={`flex-1 py-2 text-xs font-bold uppercase ${inspectorTab === 'inv' ? 'text-blue-500 border-b-2 border-blue-500' : 'text-stone-500'}`}>Items</button>
                          <button onClick={() => setInspectorTab('traits')} className={`flex-1 py-2 text-xs font-bold uppercase ${inspectorTab === 'traits' ? 'text-green-500 border-b-2 border-green-500' : 'text-stone-500'}`}>Habs</button>
                      </div>

                      <div className="min-h-[200px]">
                          {inspectorTab === 'actions' && (
                              <div className="space-y-2">
                                  {participant.actions.map((act, i) => (
                                      <div key={i} className="bg-[#252529] p-2 rounded flex justify-between items-center hover:bg-[#2d2d33] cursor-pointer" onClick={() => rollAttack(participant.name, act.n, act.hit, act.dmg)}>
                                          <span className="text-sm font-bold text-stone-200 flex items-center gap-2"><Sword size={12}/> {act.n}</span>
                                          <span className="text-xs font-mono text-stone-400">+{act.hit} ({act.dmg})</span>
                                      </div>
                                  ))}
                                  {participant.actions.length === 0 && <div className="text-xs text-stone-500 text-center py-4">Nenhuma ação listada.</div>}
                              </div>
                          )}

                          {inspectorTab === 'spells' && (
                              <div className="space-y-2">
                                  {spellsList.map((spell, i) => (
                                      <div key={i} className="bg-[#252529] p-2 rounded border border-[#333] hover:border-purple-500/50 cursor-pointer" onClick={() => castSpell(participant, typeof spell === 'string' ? spell : spell)}>
                                          <div className="text-xs font-bold text-purple-300 flex items-center gap-2"><Wand2 size={12}/> {typeof spell === 'string' ? spell : spell}</div>
                                      </div>
                                  ))}
                                  {spellsList.length === 0 && <div className="text-xs text-stone-500 text-center py-4">Nenhuma magia conhecida.</div>}
                              </div>
                          )}

                          {inspectorTab === 'inv' && (
                              <div className="space-y-1">
                                  {invList.map((item, i) => (
                                      <div key={i} className="text-xs text-stone-400 border-b border-[#333] py-1 flex items-center gap-2">
                                          <Backpack size={10} className="text-blue-500"/> {item}
                                      </div>
                                  ))}
                                  {invList.length === 0 && <div className="text-xs text-stone-500 text-center py-4">Inventário vazio ou não disponível.</div>}
                              </div>
                          )}

                          {inspectorTab === 'traits' && (
                              <div className="space-y-2">
                                  {isPlayer ? (
                                      traitsList.map((feat, i) => (
                                          <div key={i} className="bg-[#252529] p-2 rounded border border-[#333]">
                                              <div className="text-xs text-stone-300 flex items-start gap-2">
                                                  <Tag size={12} className="text-green-500 mt-0.5 shrink-0"/> 
                                                  <span className="whitespace-pre-wrap">{feat}</span>
                                              </div>
                                          </div>
                                      ))
                                  ) : (
                                      participant.traits && participant.traits.map((t, i) => (
                                          <div key={i} className="bg-[#252529] p-2 rounded border border-[#333]">
                                              <div className="text-xs text-stone-400">
                                                  <strong className="text-stone-200 block mb-1">{t.n}</strong> {t.d}
                                              </div>
                                          </div>
                                      ))
                                  )}
                                  {((isPlayer && traitsList.length === 0) || (!isPlayer && (!participant.traits || participant.traits.length === 0))) && 
                                      <div className="text-xs text-stone-500 text-center py-4">Nenhuma característica especial.</div>
                                  }
                              </div>
                          )}
                      </div>
                  </div>
              </div>
          </div>
      )
  };

  return (
    <div className="flex flex-col h-full bg-[#121212] text-stone-200 font-lato overflow-hidden">
      
      {/* Inspector Modal */}
      {renderInspector()}

      {/* AI Prompt Modal */}
      {aiPromptOpen && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[110] p-4">
              <div className="bg-[#1a1a1d] border border-amber-600/50 rounded-xl w-full max-w-lg p-6 shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-600 to-purple-600 animate-pulse"></div>
                  <div className="flex justify-between items-center mb-4">
                      <h3 className="text-xl font-cinzel font-bold text-white flex items-center gap-2"><BrainCircuit className="text-amber-500"/> Criar Monstro com IA</h3>
                      <button onClick={() => setAiPromptOpen(false)} className="text-stone-500 hover:text-white"><X size={20}/></button>
                  </div>
                  <textarea 
                      className="w-full h-32 bg-black/40 border border-[#333] rounded-lg p-3 text-sm text-white resize-none outline-none focus:border-amber-500 mb-4"
                      placeholder="Descreva a criatura... ex: Um goblin xamã que controla fogo e tem um cajado de ossos."
                      value={aiPrompt}
                      onChange={e => setAiPrompt(e.target.value)}
                  />
                  <div className="flex justify-end gap-2">
                      <button onClick={() => setAiPromptOpen(false)} className="px-4 py-2 text-stone-400 hover:text-white text-sm font-bold">Cancelar</button>
                      <button 
                          onClick={generateMonsterAI} 
                          disabled={isGeneratingAi || !aiPrompt.trim()} 
                          className="px-6 py-2 bg-gradient-to-r from-amber-700 to-purple-700 text-white font-bold rounded-lg shadow-lg flex items-center gap-2 disabled:opacity-50"
                      >
                          {isGeneratingAi ? <Loader2 className="animate-spin"/> : <Sparkles size={16}/>}
                          {isGeneratingAi ? 'Forjando...' : 'Invocar'}
                      </button>
                  </div>
              </div>
          </div>
      )}

      {/* Compact Header for Dashboard Mode */}
      {compact && (
          <div className="flex bg-[#1a1a1d] p-1 border-b border-[#333] shrink-0">
              <button onClick={() => setShowLibrary(!showLibrary)} className={`flex-1 p-2 rounded text-xs font-bold flex items-center justify-center gap-2 ${showLibrary ? 'bg-[#ffb74d] text-black' : 'text-stone-400 hover:bg-[#252535]'}`}><Book size={14}/> Biblio</button>
              <button onClick={() => setShowLogs(!showLogs)} className={`flex-1 p-2 rounded text-xs font-bold flex items-center justify-center gap-2 ${showLogs ? 'bg-[#ffb74d] text-black' : 'text-stone-400 hover:bg-[#252535]'}`}><ScrollText size={14}/> Logs</button>
          </div>
      )}

      <div className={`flex flex-1 overflow-hidden ${compact ? 'flex-col' : 'flex-row'}`}>
        {/* Left: Library */}
        {(showLibrary || !compact) && (
            <div className={`${compact ? 'h-1/3 border-b' : 'w-80 border-r'} bg-[#1a1a1d] border-[#2a2a2e] flex flex-col p-3 shadow-xl z-10 shrink-0`}>
                <div className="flex bg-[#0f0f11] p-1 rounded-lg mb-2 border border-[#333]">
                    {[
                        {id: 'party', icon: Users, title: 'Heróis', color: 'text-blue-400'},
                        {id: 'bestiary', icon: Ghost, title: 'Bestiário', color: 'text-stone-300'},
                        {id: 'spells', icon: Book, title: 'Magias', color: 'text-purple-400'},
                        {id: 'weapons', icon: Axe, title: 'Armas', color: 'text-red-400'},
                        {id: 'abilities', icon: Zap, title: 'Habs', color: 'text-amber-400'}
                    ].map(tab => (
                        <button key={tab.id} onClick={() => setLibraryTab(tab.id as any)} className={`flex-1 py-1.5 rounded flex items-center justify-center ${libraryTab === tab.id ? 'bg-[#2a2a2e] text-white shadow' : 'text-stone-500 hover:text-stone-300'}`} title={tab.title}><tab.icon size={14} className={libraryTab === tab.id ? tab.color : ''}/></button>
                    ))}
                </div>
                <div className="relative mb-2">
                    <Search className="absolute left-2 top-1.5 text-stone-500" size={14} />
                    <input className="w-full bg-[#252529] border border-[#333] rounded py-1 pl-7 pr-2 text-xs focus:border-amber-600 focus:outline-none" placeholder="Buscar..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}/>
                </div>
                
                {/* AI Button in Bestiary */}
                {libraryTab === 'bestiary' && (
                    <button onClick={() => setAiPromptOpen(true)} className="w-full mb-2 py-1.5 bg-gradient-to-r from-purple-900/40 to-amber-900/40 border border-purple-500/30 rounded text-xs font-bold text-purple-300 hover:text-white hover:border-purple-500 flex items-center justify-center gap-2">
                        <BrainCircuit size={14}/> Criar Monstro (IA)
                    </button>
                )}

                {/* Create Custom Item Button (Non-Bestiary/Party) */}
                {libraryTab !== 'bestiary' && libraryTab !== 'party' && (
                    <button onClick={() => { setIsCreating(!isCreating); setNewLibItem({name: '', stat1: '', stat2: ''}) }} className="w-full mb-2 py-1.5 bg-[#252535] border border-[#333] hover:border-[#555] rounded text-xs text-stone-300 flex items-center justify-center gap-2"><Plus size={14}/> Criar Personalizado</button>
                )}

                {/* Creation Form */}
                {isCreating && libraryTab !== 'bestiary' && libraryTab !== 'party' && (
                    <div className="bg-[#202024] p-2 mb-2 rounded border border-[#333] shadow-lg animate-in fade-in slide-in-from-top-2">
                        <input className="w-full bg-black/30 border border-[#333] rounded p-1 text-[10px] mb-1 text-white focus:border-amber-500 focus:outline-none" placeholder="Nome" value={newLibItem.name} onChange={e => setNewLibItem({...newLibItem, name: e.target.value})} />
                        {libraryTab !== 'abilities' && (
                            <input className="w-full bg-black/30 border border-[#333] rounded p-1 text-[10px] mb-1 text-white focus:border-amber-500 focus:outline-none" placeholder={libraryTab === 'spells' ? 'Nível' : 'Dano'} value={newLibItem.stat1} onChange={e => setNewLibItem({...newLibItem, stat1: e.target.value})} />
                        )}
                        <input className="w-full bg-black/30 border border-[#333] rounded p-1 text-[10px] mb-1 text-white focus:border-amber-500 focus:outline-none" placeholder="Descrição/Propriedades" value={newLibItem.stat2} onChange={e => setNewLibItem({...newLibItem, stat2: e.target.value})} />
                        <button onClick={handleCreateLibItem} className="w-full bg-green-700 hover:bg-green-600 text-white rounded p-1 text-[10px] font-bold uppercase">Salvar</button>
                    </div>
                )}

                <div className="flex-1 overflow-y-auto custom-scrollbar space-y-1">
                    {libraryTab === 'party' && (characters as Character[]).filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase())).map((char, i) => (
                        <div key={i} className="bg-[#222226] p-2 rounded border border-[#333] hover:border-blue-600/50 flex justify-between items-center group">
                            <div className="text-xs font-bold text-blue-400">{char.name}</div>
                            <button onClick={() => internalAddCharToEncounter(char)} className="text-stone-500 hover:text-green-400 p-1"><Plus size={14}/></button>
                        </div>
                    ))}
                    {libraryTab === 'bestiary' && groupedMonsters.map(group => (
                        <div key={group.cr}>
                            <div className="text-[9px] font-bold text-stone-500 uppercase border-b border-[#333] mb-1">ND {group.cr}</div>
                            {group.items.filter(m => m.name.toLowerCase().includes(searchTerm.toLowerCase())).map(m => (
                                <div key={m.id} className="bg-[#222226] p-1.5 rounded border border-[#333] hover:border-stone-500 flex justify-between items-center mb-1">
                                    <div className="text-xs font-bold text-stone-300">{m.name}</div>
                                    <button onClick={() => internalAddToEncounter(m)} className="text-stone-500 hover:text-amber-400 p-1"><Plus size={14}/></button>
                                </div>
                            ))}
                        </div>
                    ))}
                    {libraryTab === 'spells' && displayedSpells.map(([name, spell]) => (
                        <div key={name} className="bg-[#222226] p-1.5 rounded border border-[#333] hover:border-purple-600/50 flex justify-between items-center group cursor-help" title={spell.desc}>
                            <div className="flex-1 overflow-hidden">
                                <div className="text-xs font-bold text-purple-400 truncate">{name}</div>
                                <div className="text-[9px] text-stone-500">{spell.level}</div>
                            </div>
                            <div className="flex gap-1">
                                <button onClick={() => addLog(`Ref: ${name}`, `${spell.level} | ${spell.desc}`, 'magic')} className="text-stone-500 hover:text-stone-300 p-1" title="Ver Info"><Info size={12}/></button>
                                <button onClick={() => addSpellToTarget(name)} className="text-stone-500 hover:text-purple-400 p-1" title="Adicionar ao Alvo"><Plus size={14}/></button>
                            </div>
                        </div>
                    ))}
                    {libraryTab === 'abilities' && displayedAbilities.map(([name, ability]) => (
                        <div key={name} className="bg-[#222226] p-1.5 rounded border border-[#333] hover:border-amber-600/50 flex justify-between items-center group cursor-help" title={ability.desc}>
                            <div className="flex-1 overflow-hidden">
                                <div className="text-xs font-bold text-amber-500 truncate">{name}</div>
                            </div>
                            <div className="flex gap-1">
                                <button onClick={() => addLog(`Ref: ${name}`, `${ability.desc}`, 'info')} className="text-stone-500 hover:text-stone-300 p-1" title="Ver Info"><Info size={12}/></button>
                                <button onClick={() => addTraitToTarget(name, ability.desc)} className="text-stone-500 hover:text-amber-400 p-1" title="Adicionar ao Alvo"><Plus size={14}/></button>
                            </div>
                        </div>
                    ))}
                    {libraryTab === 'weapons' && displayedWeapons.map((w, i) => (
                        <div key={i} className="bg-[#222226] p-1.5 rounded border border-[#333] hover:border-red-600/50 flex justify-between items-center group cursor-help" title={w.prop}>
                            <div className="flex-1 overflow-hidden">
                                <div className="text-xs font-bold text-red-400 truncate">{w.n}</div>
                                <div className="text-[9px] text-stone-500">{w.dmg}</div>
                            </div>
                            <div className="flex gap-1">
                                <button onClick={() => addLog(`Ref: ${w.n}`, `${w.dmg} | ${w.prop}`, 'info')} className="text-stone-500 hover:text-stone-300 p-1" title="Ver Info"><Info size={12}/></button>
                                <button onClick={() => addActionToTarget({n: w.n, hit: 4, dmg: w.dmg})} className="text-stone-500 hover:text-red-400 p-1" title="Adicionar ao Alvo (+4 hit)"><Plus size={14}/></button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        )}

        {/* Center: Encounter Tracker */}
        <div className={`flex-1 bg-[#0c0c0e] p-2 md:p-4 overflow-y-auto custom-scrollbar relative ${compact ? 'order-first flex-grow' : ''}`}>
           {/* Controls */}
           <div className="flex flex-wrap justify-between items-center mb-4 gap-2">
                <h2 className="text-xl font-cinzel text-amber-500">Combate</h2>
                <div className="flex gap-1">
                    <button onClick={sortInitiative} className="p-1.5 bg-[#1a1a1d] border border-[#333] rounded hover:text-white text-stone-400" title="Ordenar"><ArrowDownUp size={16}/></button>
                    <button onClick={nextTurn} className="px-3 py-1.5 bg-green-700 hover:bg-green-600 text-white font-bold text-xs rounded flex items-center gap-1 shadow"><Play size={14}/> Próximo</button>
                    <button onClick={() => {setEncounter([]); setTurnIndex(-1);}} className="p-1.5 bg-red-900/20 border border-red-900/50 rounded text-red-400 hover:bg-red-900/40" title="Limpar"><Trash2 size={16}/></button>
                </div>
           </div>

           {/* List */}
           <div className="space-y-2">
               {encounter.map((participant, idx) => (
                   <div key={participant.uid} onClick={() => setTargetUid(participant.uid)} className={`relative bg-[#161619] border rounded-lg p-2 transition-all cursor-pointer ${turnIndex === idx ? 'border-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.2)]' : 'border-[#333] hover:border-stone-500'} ${targetUid === participant.uid ? 'ring-1 ring-red-500' : ''}`}>
                       <div className="flex justify-between items-center mb-2">
                           <div className="flex items-center gap-2">
                                <input type="number" className={`w-8 h-8 text-center font-bold text-lg rounded bg-[#0f0f11] border border-[#333] focus:border-amber-500 outline-none ${turnIndex === idx ? 'text-amber-500' : 'text-stone-400'}`} value={participant.initiative} onChange={(e) => updateInitiative(participant.uid, parseInt(e.target.value) || 0)} onClick={e => e.stopPropagation()}/>
                                <div>
                                    <div className={`font-bold text-sm leading-none ${turnIndex === idx ? 'text-amber-400' : 'text-stone-200'}`}>{participant.name}</div>
                                    <div className="text-[10px] text-stone-500">AC {participant.ac} • {participant.hpCurrent}/{participant.hpMax} HP</div>
                                </div>
                           </div>
                           <div className="flex gap-1">
                               <button onClick={(e) => {e.stopPropagation(); setInspectingUid(participant.uid)}} className="p-1 text-stone-500 hover:text-white bg-[#222] rounded border border-[#333] hover:border-stone-500" title="Inspecionar Ficha"><Eye size={14}/></button>
                               <button onClick={(e) => {e.stopPropagation(); setConditionModalUid(participant.uid)}} className={`p-1 rounded ${participant.conditions.length > 0 ? 'text-amber-500 bg-amber-900/20' : 'text-stone-600 hover:bg-[#222]'}`}><Activity size={14}/></button>
                               <button onClick={(e) => {e.stopPropagation(); removeFromEncounter(participant.uid)}} className="p-1 text-stone-600 hover:text-red-500 hover:bg-red-900/10 rounded"><Trash2 size={14}/></button>
                           </div>
                       </div>
                       
                       {/* HP Bar */}
                       <div className="h-1.5 bg-[#222] rounded-full overflow-hidden mb-2">
                           <div className={`h-full transition-all ${participant.hpCurrent/participant.hpMax < 0.3 ? 'bg-red-600' : 'bg-green-600'}`} style={{width: `${Math.min(100, (participant.hpCurrent/participant.hpMax)*100)}%`}}></div>
                       </div>
                       
                       {/* Quick Actions (HP) */}
                       <div className="flex gap-1 justify-center mb-2">
                           <button onClick={(e) => {e.stopPropagation(); updateHP(participant.uid, -1)}} className="px-2 py-0.5 bg-[#222] border border-[#333] text-red-400 text-[10px] rounded hover:bg-red-900/20">-1</button>
                           <button onClick={(e) => {e.stopPropagation(); updateHP(participant.uid, -5)}} className="px-2 py-0.5 bg-[#222] border border-[#333] text-red-400 text-[10px] rounded hover:bg-red-900/20">-5</button>
                           <button onClick={(e) => {e.stopPropagation(); updateHP(participant.uid, 1)}} className="px-2 py-0.5 bg-[#222] border border-[#333] text-green-400 text-[10px] rounded hover:bg-green-900/20">+1</button>
                           <button onClick={(e) => {e.stopPropagation(); updateHP(participant.uid, 5)}} className="px-2 py-0.5 bg-[#222] border border-[#333] text-green-400 text-[10px] rounded hover:bg-green-900/20">+5</button>
                       </div>

                       {/* Expanded Actions (Only if targeted or turn) - NOW SHOWS ALL */}
                       {(turnIndex === idx || targetUid === participant.uid) && (
                           <div className="mt-2 pt-2 border-t border-[#333] space-y-3 max-h-60 overflow-y-auto custom-scrollbar">
                               {/* Actions */}
                               {participant.actions.length > 0 && (
                                   <div className="space-y-1">
                                       {participant.actions.map((act: any, i: number) => (
                                           <button key={i} onClick={(e) => {e.stopPropagation(); rollAttack(participant.name, act.n, act.hit, act.dmg)}} className="w-full text-left text-xs bg-[#252529] hover:bg-[#333] border border-[#333] hover:border-stone-500 p-1.5 rounded flex justify-between items-center group transition-colors">
                                               <span className="font-bold text-stone-300 group-hover:text-white flex items-center gap-1.5"><Sword size={12}/> {act.n}</span>
                                               <span className="text-stone-500 font-mono">+{act.hit} ({act.dmg})</span>
                                           </button>
                                       ))}
                                   </div>
                               )}
                               
                               {/* Spells */}
                               {participant.spells && participant.spells.length > 0 && (
                                   <div className="space-y-1">
                                       <div className="text-[9px] font-bold text-purple-500 uppercase tracking-wider flex items-center gap-1"><Sparkles size={10}/> Magias</div>
                                       <div className="flex flex-wrap gap-1">
                                           {participant.spells.map((spell: string, i: number) => (
                                               <button key={i} onClick={(e) => {e.stopPropagation(); castSpell(participant, spell)}} className="px-2 py-1 text-[10px] bg-purple-900/20 hover:bg-purple-900/40 text-purple-300 border border-purple-900/50 rounded transition-colors truncate max-w-full">
                                                   {spell}
                                               </button>
                                           ))}
                                       </div>
                                   </div>
                               )}

                               {/* Traits */}
                               {participant.traits && participant.traits.length > 0 && (
                                   <div className="space-y-1">
                                       <div className="text-[9px] font-bold text-amber-500 uppercase tracking-wider flex items-center gap-1"><Zap size={10}/> Habilidades</div>
                                       <div className="space-y-1">
                                           {participant.traits.map((trait: any, i: number) => (
                                               <div key={i} className="text-[10px] text-stone-400 bg-[#252529] p-1.5 rounded border border-[#333]">
                                                   <span className="font-bold text-stone-300 block">{trait.n}</span>
                                                   <span className="line-clamp-2 hover:line-clamp-none cursor-help">{trait.d}</span>
                                               </div>
                                           ))}
                                       </div>
                                   </div>
                               )}
                           </div>
                       )}
                   </div>
               ))}
           </div>
        </div>

        {/* Right: Logs */}
        {(showLogs || !compact) && (
            <div className={`${compact ? 'h-1/4 border-t' : 'w-72 border-l'} bg-[#161619] border-[#2a2a2e] flex flex-col shadow-xl z-10 shrink-0`}>
                <div className="p-2 border-b border-[#2a2a2e] bg-[#1a1a1d] text-xs font-bold text-stone-400 uppercase">Histórico</div>
                <div className="flex-1 overflow-y-auto p-2 space-y-2 custom-scrollbar bg-[#121212]">
                    {logs.map(log => (
                        <div key={log.id} className={`p-2 rounded border text-[10px] leading-snug ${log.type === 'crit' ? 'bg-amber-900/20 border-amber-600/50 text-amber-200' : 'bg-[#1f1f23] border-[#333] text-stone-400'}`}>
                            <div className="font-bold text-stone-300">{log.title}</div>
                            <div className="opacity-80 whitespace-pre-wrap">{log.details}</div>
                        </div>
                    ))}
                </div>
            </div>
        )}
      </div>
      
      {/* Condtion Modal (Same as before) */}
      {conditionModalUid && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[110] p-4" onClick={() => setConditionModalUid(null)}>
              <div className="bg-[#1a1a1d] border border-[#333] rounded-xl p-4 w-64 shadow-2xl" onClick={(e) => e.stopPropagation()}>
                  <h3 className="font-bold text-stone-200 mb-2 text-sm">Condições</h3>
                  <div className="grid grid-cols-2 gap-1 max-h-60 overflow-y-auto custom-scrollbar">
                      {conditionsList.map(cond => {
                          const isActive = encounter.find((e: EncounterParticipant) => e.uid === conditionModalUid)?.conditions.includes(cond);
                          return (
                              <button key={cond} onClick={() => toggleCondition(conditionModalUid, cond)} className={`px-2 py-1 text-[10px] font-bold rounded border transition-all ${isActive ? 'bg-red-900/40 border-red-500 text-red-200' : 'bg-[#222] border-[#333] text-stone-500'}`}>
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
