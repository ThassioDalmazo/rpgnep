
import React, { useState } from 'react';
import { GoogleGenAI } from "@google/genai";
import { Monster, EncounterParticipant, LogEntry, Character } from '../types';
import { SPELLS_DB, COMMON_WEAPONS } from '../constants';
import { Search, Shield, Ghost, Sword, Play, ArrowDownUp, Dices, Crosshair, Minus, ChevronsUp, ChevronsDown, Trash2, Activity, Sparkles, Wand2, ScrollText, Star, X, Plus, Pencil, Users, Axe, Book, Zap, Eye, BrainCircuit, Loader2, Backpack, Tag, Hand, Info, Skull, Heart, Move, ChevronDown, List, Target, History, Cross, Clock, Calculator } from 'lucide-react';

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
  round?: number;
  setRound?: (r: number) => void;
  npcs?: Character[]; // Added npcs prop as optional
}

const CR_XP: Record<string, number> = {
    '0': 10, '1/8': 25, '1/4': 50, '1/2': 100,
    '1': 200, '2': 450, '3': 700, '4': 1100, '5': 1800,
    '6': 2300, '7': 2900, '8': 3900, '9': 5000, '10': 5900,
    '11': 7200, '12': 8400, '13': 10000, '14': 11500, '15': 13000,
    '16': 15000, '17': 18000, '18': 20000, '19': 22000, '20': 25000,
    '21': 33000, '22': 41000, '23': 50000, '24': 62000, '30': 155000
};

export const DMTools: React.FC<Props> = ({ encounter = [], setEncounter, logs = [], addLog, characters = [], monsters = [], setMonsters, turnIndex, setTurnIndex, targetUid, setTargetUid, compact = false, onAddCombatant, round = 1, setRound, npcs = [] }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [libraryTab, setLibraryTab] = useState<'party' | 'bestiary' | 'spells' | 'weapons' | 'abilities' | 'npcs'>('party');
  
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

  const getCharacterActions = (char: Character): { n: string; hit: number; dmg: string }[] => {
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
      const apiKey = process.env.API_KEY;
      try {
          const ai = new GoogleGenAI({ apiKey: apiKey! });
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
      } catch (error) { console.error("AI Generation Error", error); alert("Falha ao gerar monstro. Tente novamente."); } finally { setIsGeneratingAi(false); }
  };

  const internalAddToEncounter = (mob: Monster) => {
    const count = encounter.filter(e => e.id === mob.id).length + 1;
    const attrs = mob.attributes || { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 };
    const participant: EncounterParticipant = { ...mob, uid: Date.now() + Math.random(), name: `${mob.name} ${count > 1 ? count : ''}`, hpCurrent: mob.hp, hpMax: mob.hp, initiative: Math.floor(Math.random() * 20) + 1 + getMod(attrs.dex), conditions: [], attributes: attrs };
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
        speed: char.speed, 
        initiative: Math.floor(Math.random() * 20) + 1 + dexMod, 
        conditions: [], 
        actions: charActions, 
        spells: charSpells, 
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

  const updateHP = (uid: number, delta: number) => { setEncounter(encounter.map(e => { if (e.uid === uid) { const newHp = Math.min(e.hpMax, Math.max(0, e.hpCurrent + delta)); return { ...e, hpCurrent: newHp }; } return e; })); };
  const updateInitiative = (uid: number, val: number) => setEncounter(encounter.map(e => e.uid === uid ? { ...e, initiative: val } : e));
  const toggleCondition = (uid: number, condition: string) => setEncounter(encounter.map(e => e.uid === uid ? { ...e, conditions: e.conditions.includes(condition) ? e.conditions.filter(c => c !== condition) : [...e.conditions, condition] } : e));

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
    addLog('Sistema', 'Iniciativa ordenada. Rodada 1 começou.', 'info');
  };

  const nextTurn = () => {
      if (encounter.length === 0) return;
      const next = (turnIndex + 1) % encounter.length;
      if (next === 0 && setRound) {
          setRound(round + 1);
          addLog('Sistema', `Início da Rodada ${round + 1}`, 'info');
      }
      setTurnIndex(next);
      setExpandedUid(encounter[next].uid);
      addLog('Turno', `Turno de ${encounter[next].name}`, 'info');
  };

  const addActionToTarget = (action: {n: string, hit: number, dmg: string}) => { if (!targetUid) { alert("Selecione um alvo."); return; } setEncounter(encounter.map(e => e.uid === targetUid ? { ...e, actions: [...(e.actions||[]), action] } : e)); addLog('Sistema', `Ação '${action.n}' adicionada ao alvo.`, 'info'); };
  const addSpellToTarget = (name: string) => { if (!targetUid) { alert("Selecione um alvo."); return; } setEncounter(encounter.map(e => e.uid === targetUid ? { ...e, spells: e.spells ? [...e.spells, name] : [name] } : e)); addLog('Sistema', `Magia '${name}' aprendida pelo alvo.`, 'magic'); };
  
  const handleCreateLibItem = () => {
      if (!newLibItem.name) return;
      if (libraryTab === 'spells') setCustomSpells({ ...customSpells, [newLibItem.name]: { level: newLibItem.stat1 || 'Truque', desc: newLibItem.stat2 || 'Efeito Mágico' } });
      else if (libraryTab === 'weapons') setCustomWeapons([ ...customWeapons, { n: newLibItem.name, dmg: newLibItem.stat1 || '1d4', prop: newLibItem.stat2 || 'Simples' } ]);
      else if (libraryTab === 'abilities') setCustomAbilities({ ...customAbilities, [newLibItem.name]: { level: 'Habilidade', desc: newLibItem.stat2 || 'Efeito Especial' } });
      setIsCreating(false); setNewLibItem({name: '', stat1: '', stat2: ''});
  };

  const displayedSpells = [...(Object.entries(SPELLS_DB) as [string, {level: string, desc: string}][]).filter(([_, s]) => s.level !== 'Habilidade'), ...Object.entries(customSpells)].filter(([name]) => name.toLowerCase().includes(searchTerm.toLowerCase())) as [string, {level: string, desc: string}][];
  const displayedAbilities = [...(Object.entries(SPELLS_DB) as [string, {level: string, desc: string}][]).filter(([_, s]) => s.level === 'Habilidade'), ...Object.entries(customAbilities)].filter(([name]) => name.toLowerCase().includes(searchTerm.toLowerCase())) as [string, {level: string, desc: string}][];
  const displayedWeapons = [...COMMON_WEAPONS, ...customWeapons].filter(w => w.n.toLowerCase().includes(searchTerm.toLowerCase()));

  const parseCR = (cr: string) => { if (cr.includes('/')) { const [n, d] = cr.split('/'); return parseInt(n) / parseInt(d); } return parseFloat(cr); };
  const groupedMonsters = Object.entries(monsters.reduce((acc, m) => { if (!acc[m.cr]) acc[m.cr] = []; acc[m.cr].push(m); return acc; }, {} as Record<string, Monster[]>)).sort((a, b) => parseCR(a[0]) - parseCR(b[0])).map(([cr, items]) => ({ cr, items: items as Monster[] }));

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
                              {participant.imageUrl ? <img src={participant.imageUrl} className="w-full h-full object-cover"/> : <Ghost className="w-full h-full p-4 text-stone-600"/>}
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
                              <div className="text-[10px] uppercase font-bold text-stone-500 mb-2">Habilidades</div>
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
                  </div>
              </div>
          </div>
      )
  };

  return (
    <div className="flex flex-col h-full bg-[#121212] text-stone-200 font-lato overflow-hidden">
      {renderInspector()}
      
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

      {compact && (
          <div className="flex bg-[#121212] border-b border-[#333] shrink-0">
              <button onClick={() => setCompactTab('tracker')} className={`flex-1 p-3 text-xs font-bold flex items-center justify-center gap-2 transition-all ${compactTab === 'tracker' ? 'text-amber-500 border-b-2 border-amber-500 bg-[#1a1a1e]' : 'text-stone-500 hover:text-stone-300 hover:bg-[#1a1a1e]'}`}><Activity size={14}/> Combate</button>
              <button onClick={() => setCompactTab('library')} className={`flex-1 p-3 text-xs font-bold flex items-center justify-center gap-2 transition-all ${compactTab === 'library' ? 'text-blue-500 border-b-2 border-blue-500 bg-[#1a1a1e]' : 'text-stone-500 hover:text-stone-300 hover:bg-[#1a1a1e]'}`}><Book size={14}/> Biblio</button>
              <button onClick={() => setCompactTab('logs')} className={`flex-1 p-3 text-xs font-bold flex items-center justify-center gap-2 transition-all ${compactTab === 'logs' ? 'text-green-500 border-b-2 border-green-500 bg-[#1a1a1e]' : 'text-stone-500 hover:text-stone-300 hover:bg-[#1a1a1e]'}`}><List size={14}/> Logs</button>
          </div>
      )}

      <div className={`flex flex-1 overflow-hidden ${compact ? 'flex-col relative' : 'flex-row'}`}>
        
        {((!compact && showLibrary) || (compact && compactTab === 'library')) && (
            <div className={`${compact ? 'absolute inset-0 z-10 bg-[#121212]' : 'w-80 border-r'} border-[#2a2a2e] flex flex-col p-3 shadow-xl overflow-hidden`}>
                <div className="flex bg-[#0f0f11] p-1 rounded-lg mb-2 border border-[#333]">
                    {[
                        {id: 'party', icon: Users, title: 'Heróis', color: 'text-blue-400'},
                        {id: 'npcs', icon: Users, title: 'NPCs', color: 'text-green-400'},
                        {id: 'bestiary', icon: Ghost, title: 'Bestiário', color: 'text-stone-300'},
                        {id: 'spells', icon: Book, title: 'Magias', color: 'text-purple-400'},
                        {id: 'weapons', icon: Axe, title: 'Armas', color: 'text-red-400'},
                    ].map(tab => (
                        <button key={tab.id} onClick={() => setLibraryTab(tab.id as any)} className={`flex-1 py-1.5 rounded flex items-center justify-center ${libraryTab === tab.id ? 'bg-[#2a2a2e] text-white shadow' : 'text-stone-500 hover:text-stone-300'}`} title={tab.title}><tab.icon size={14} className={libraryTab === tab.id ? tab.color : ''}/></button>
                    ))}
                </div>
                <div className="relative mb-2">
                    <Search className="absolute left-2 top-1.5 text-stone-500" size={14} />
                    <input className="w-full bg-[#252529] border border-[#333] rounded py-1 pl-7 pr-2 text-xs focus:border-amber-600 focus:outline-none text-white" placeholder="Buscar..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}/>
                </div>
                
                {libraryTab === 'bestiary' && ( <button onClick={() => setAiPromptOpen(true)} className="w-full mb-2 py-1.5 bg-gradient-to-r from-purple-900/40 to-amber-900/40 border border-purple-500/30 rounded text-xs font-bold text-purple-300 hover:text-white hover:border-purple-500 flex items-center justify-center gap-2"><BrainCircuit size={14}/> Criar Monstro (IA)</button> )}
                {libraryTab !== 'bestiary' && libraryTab !== 'party' && libraryTab !== 'npcs' && ( <button onClick={() => { setIsCreating(!isCreating); setNewLibItem({name: '', stat1: '', stat2: ''}) }} className="w-full mb-2 py-1.5 bg-[#252535] border border-[#333] hover:border-[#555] rounded text-xs text-stone-300 flex items-center justify-center gap-2"><Plus size={14}/> Criar Personalizado</button> )}

                {isCreating && libraryTab !== 'bestiary' && libraryTab !== 'party' && libraryTab !== 'npcs' && (
                    <div className="bg-[#202024] p-2 mb-2 rounded border border-[#333] shadow-lg animate-in fade-in slide-in-from-top-2">
                        <input className="w-full bg-black/30 border border-[#333] rounded p-1 text-[10px] mb-1 text-white focus:border-amber-500 focus:outline-none" placeholder="Nome" value={newLibItem.name} onChange={e => setNewLibItem({...newLibItem, name: e.target.value})} />
                        {libraryTab !== 'abilities' && ( <input className="w-full bg-black/30 border border-[#333] rounded p-1 text-[10px] mb-1 text-white focus:border-amber-500 focus:outline-none" placeholder={libraryTab === 'spells' ? 'Nível' : 'Dano'} value={newLibItem.stat1} onChange={e => setNewLibItem({...newLibItem, stat1: e.target.value})} /> )}
                        <input className="w-full bg-black/30 border border-[#333] rounded p-1 text-[10px] mb-1 text-white focus:border-amber-500 focus:outline-none" placeholder="Descrição/Propriedades" value={newLibItem.stat2} onChange={e => setNewLibItem({...newLibItem, stat2: e.target.value})} />
                        <button onClick={handleCreateLibItem} className="w-full bg-green-700 hover:bg-green-600 text-white rounded p-1 text-[10px] font-bold uppercase">Salvar</button>
                    </div>
                )}

                <div className="flex-1 overflow-y-auto custom-scrollbar space-y-1">
                    {libraryTab === 'party' && (characters as Character[]).filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase())).map((char, i) => (
                        <div key={i} className="bg-[#222226] p-2 rounded border border-[#333] hover:border-blue-600/50 flex justify-between items-center group">
                            <div className="flex items-center gap-2">
                                <div className="w-6 h-6 bg-black rounded overflow-hidden border border-[#333]">
                                    {char.imageUrl ? <img src={char.imageUrl} className="w-full h-full object-cover"/> : <Users size={12} className="m-auto mt-1 text-stone-600"/>}
                                </div>
                                <div className="text-xs font-bold text-blue-400">{char.name}</div>
                            </div>
                            <button onClick={() => internalAddCharToEncounter(char)} className="text-stone-500 hover:text-green-400 p-1 bg-black/30 rounded hover:bg-black/50"><Plus size={14}/></button>
                        </div>
                    ))}
                    {libraryTab === 'npcs' && npcs && npcs.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase())).map((char, i) => (
                        <div key={i} className="bg-[#222226] p-2 rounded border border-[#333] hover:border-green-600/50 flex justify-between items-center group">
                            <div className="flex items-center gap-2">
                                <div className="w-6 h-6 bg-black rounded overflow-hidden border border-[#333]">
                                    {char.imageUrl ? <img src={char.imageUrl} className="w-full h-full object-cover"/> : <Users size={12} className="m-auto mt-1 text-stone-600"/>}
                                </div>
                                <div className="text-xs font-bold text-green-400">{char.name}</div>
                            </div>
                            <button onClick={() => internalAddCharToEncounter(char)} className="text-stone-500 hover:text-green-400 p-1 bg-black/30 rounded hover:bg-black/50"><Plus size={14}/></button>
                        </div>
                    ))}
                    {libraryTab === 'bestiary' && groupedMonsters.map(group => (
                        <div key={group.cr}>
                            <div className="text-[9px] font-bold text-stone-500 uppercase border-b border-[#333] mb-1">ND {group.cr}</div>
                            {group.items.filter(m => m.name.toLowerCase().includes(searchTerm.toLowerCase())).map(m => (
                                <div key={m.id} className="bg-[#222226] p-1.5 rounded border border-[#333] hover:border-stone-500 flex justify-between items-center mb-1">
                                    <div className="flex items-center gap-2">
                                        <div className="w-6 h-6 bg-black rounded overflow-hidden border border-[#333]">
                                            {m.imageUrl ? <img src={m.imageUrl} className="w-full h-full object-cover"/> : <Ghost size={12} className="m-auto mt-1 text-stone-600"/>}
                                        </div>
                                        <div className="text-xs font-bold text-stone-300">{m.name}</div>
                                    </div>
                                    <button onClick={() => internalAddToEncounter(m)} className="text-stone-500 hover:text-amber-400 p-1 bg-black/30 rounded hover:bg-black/50"><Plus size={14}/></button>
                                </div>
                            ))}
                        </div>
                    ))}
                    {libraryTab === 'spells' && displayedSpells.map(([name, spell]) => (
                        <div key={name} className="bg-[#222226] p-1.5 rounded border border-[#333] hover:border-purple-600/50 flex justify-between items-center group cursor-help" title={spell.desc}>
                            <div className="flex-1 overflow-hidden"><div className="text-xs font-bold text-purple-400 truncate">{name}</div><div className="text-[9px] text-stone-500">{spell.level}</div></div>
                            <div className="flex gap-1"><button onClick={() => addLog(`Ref: ${name}`, `${spell.level} | ${spell.desc}`, 'magic')} className="text-stone-500 hover:text-stone-300 p-1"><Info size={12}/></button><button onClick={() => addSpellToTarget(name)} className="text-stone-500 hover:text-purple-400 p-1"><Plus size={14}/></button></div>
                        </div>
                    ))}
                    {libraryTab === 'weapons' && displayedWeapons.map((w, i) => (
                        <div key={i} className="bg-[#222226] p-1.5 rounded border border-[#333] hover:border-red-600/50 flex justify-between items-center group">
                            <div className="flex-1 overflow-hidden"><div className="text-xs font-bold text-red-400 truncate">{w.n}</div><div className="text-[9px] text-stone-500">{w.dmg}</div></div>
                            <button onClick={() => addActionToTarget({n: w.n, hit: 0, dmg: w.dmg})} className="text-stone-500 hover:text-red-400 p-1"><Plus size={14}/></button>
                        </div>
                    ))}
                </div>
            </div>
        )}

        {((!compact) || (compact && compactTab === 'tracker')) && (
        <div className={`flex-1 bg-[#0c0c0e] p-2 md:p-4 overflow-y-auto custom-scrollbar relative flex flex-col ${compact ? 'absolute inset-0 z-0' : ''}`}>
           <div className="flex flex-wrap justify-between items-center mb-4 gap-2 shrink-0 bg-[#1a1a1d] p-3 rounded-xl border border-[#333] shadow-md sticky top-0 z-20">
                <div className="flex items-center gap-4">
                    <span className="text-lg font-cinzel text-amber-500 font-bold">Combate</span>
                    <div className="h-6 w-px bg-[#333]"></div>
                    <div className="text-xs text-stone-400 flex items-center gap-2">
                        <Clock size={14} className="text-stone-500"/>
                        Rodada: <span className="text-white font-bold">{round}</span>
                    </div>
                    <div className="h-6 w-px bg-[#333]"></div>
                    <div className="text-xs text-stone-400">XP: <span className="text-amber-500 font-bold">{sessionXp}</span></div>
                </div>
                <div className="flex gap-2">
                    <button onClick={sortInitiative} className="p-2 bg-[#222] border border-[#333] rounded hover:text-white text-stone-400 hover:bg-[#333]" title="Ordenar Iniciativa"><ArrowDownUp size={18}/></button>
                    <button onClick={nextTurn} className="px-4 py-2 bg-green-700 hover:bg-green-600 text-white font-bold text-xs rounded flex items-center gap-2 shadow-lg"><Play size={14}/> Próximo</button>
                    <button onClick={() => {if(window.confirm("Limpar Combate?")) {setEncounter([]); setTurnIndex(-1);}}} className="p-2 bg-red-900/20 border border-red-900/50 rounded text-red-400 hover:bg-red-900/40 hover:text-white" title="Limpar"><Trash2 size={18}/></button>
                </div>
           </div>

           <div className="space-y-2 pb-20">
               {encounter.map((participant, idx) => {
                   const isActive = turnIndex === idx;
                   const hpPercent = (participant.hpCurrent / participant.hpMax) * 100;
                   const isExpanded = expandedUid === participant.uid;
                   const isTarget = targetUid === participant.uid;

                   return (
                   <div key={participant.uid} onClick={() => setExpandedUid(isExpanded ? null : participant.uid)} className={`relative bg-[#161619] border rounded-lg transition-all cursor-pointer group ${isActive ? 'border-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.15)] bg-[#1c1c20]' : 'border-[#333] hover:border-stone-500'} ${isTarget ? 'ring-2 ring-red-600' : ''}`}>
                       {isActive && <div className="absolute left-0 top-0 bottom-0 w-1 bg-amber-500 rounded-l"></div>}
                       
                       <div className="p-2">
                           <div className="flex justify-between items-center mb-2 pl-2">
                               <div className="flex items-center gap-3 flex-1 min-w-0">
                                    <input type="number" className={`w-8 h-8 text-center font-bold text-lg rounded bg-[#0f0f11] border border-[#333] focus:border-amber-500 outline-none shrink-0 ${isActive ? 'text-amber-500' : 'text-stone-400'}`} value={participant.initiative} onChange={(e) => { e.stopPropagation(); updateInitiative(participant.uid, parseInt(e.target.value)||0); }} onClick={e => e.stopPropagation()}/>
                                    
                                    <div className="w-10 h-10 bg-black rounded-md border border-[#333] overflow-hidden shrink-0 relative group/img">
                                        {participant.imageUrl ? (
                                            <img src={participant.imageUrl} alt={participant.name} className="w-full h-full object-cover"/>
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-stone-700"><Ghost size={16}/></div>
                                        )}
                                    </div>

                                    <div className="min-w-0 flex-1">
                                        <div className={`font-bold text-sm leading-none truncate ${isActive ? 'text-amber-400' : 'text-stone-200'}`}>{participant.name}</div>
                                        <div className="text-[10px] text-stone-500 flex gap-2 mt-0.5">
                                            <span>CA <span className="text-stone-300 font-bold">{participant.ac}</span></span>
                                            <span>HP <span className={`${hpPercent < 30 ? 'text-red-400' : 'text-stone-300'} font-bold`}>{participant.hpCurrent}</span>/{participant.hpMax}</span>
                                        </div>
                                    </div>
                               </div>
                               
                               <div className="flex gap-1 items-center ml-2">
                                   <button 
                                      onClick={(e) => {e.stopPropagation(); setTargetUid(isTarget ? null : participant.uid)}} 
                                      className={`p-2 rounded-full border transition-all ${isTarget ? 'bg-red-600 border-red-500 text-white animate-pulse shadow-[0_0_10px_red]' : 'bg-[#222] border-[#333] text-stone-500 hover:text-red-400 hover:border-red-900'}`} 
                                      title="Definir como Alvo"
                                   >
                                       <Target size={16} />
                                   </button>

                                   <button onClick={(e) => {e.stopPropagation(); setConditionModalUid(participant.uid)}} className={`p-1.5 rounded bg-[#222] border border-[#333] ${participant.conditions.length > 0 ? 'text-amber-500 border-amber-900' : 'text-stone-600 hover:text-white'}`}><Activity size={14}/></button>
                                   <button onClick={(e) => {e.stopPropagation(); setInspectingUid(participant.uid)}} className="p-1.5 text-stone-600 hover:text-white bg-[#222] rounded border border-[#333]"><Eye size={14}/></button>
                                   <button onClick={(e) => {e.stopPropagation(); removeFromEncounter(participant.uid)}} className="p-1.5 text-stone-600 hover:text-red-500 hover:bg-red-900/10 bg-[#222] rounded border border-[#333]"><Trash2 size={14}/></button>
                               </div>
                           </div>

                           <div className="h-1.5 bg-[#0a0a0c] rounded-full overflow-hidden mb-2 mx-1 border border-[#222]">
                               <div className={`h-full transition-all duration-500 ${hpPercent < 30 ? 'bg-red-600' : hpPercent < 60 ? 'bg-yellow-600' : 'bg-green-600'}`} style={{width: `${Math.min(100, hpPercent)}%`}}></div>
                           </div>

                           <div className="flex gap-1 justify-center">
                               <button onClick={(e) => {e.stopPropagation(); updateHP(participant.uid, -10)}} className="flex-1 py-0.5 bg-[#222] border border-[#333] text-red-500 text-[10px] rounded hover:bg-red-900/20 font-bold">-10</button>
                               <button onClick={(e) => {e.stopPropagation(); updateHP(participant.uid, -1)}} className="flex-1 py-0.5 bg-[#222] border border-[#333] text-red-400 text-[10px] rounded hover:bg-red-900/20 font-bold">-1</button>
                               <input 
                                    className="w-12 bg-black border border-[#333] rounded text-center text-xs text-white font-bold" 
                                    value={participant.hpCurrent} 
                                    onChange={(e) => {
                                        const val = parseInt(e.target.value);
                                        if (!isNaN(val)) setEncounter(encounter.map(p => p.uid === participant.uid ? {...p, hpCurrent: val} : p));
                                    }}
                                    onClick={e => e.stopPropagation()}
                               />
                               <button onClick={(e) => {e.stopPropagation(); updateHP(participant.uid, 1)}} className="flex-1 py-0.5 bg-[#222] border border-[#333] text-green-400 text-[10px] rounded hover:bg-green-900/20 font-bold">+1</button>
                               <button onClick={(e) => {e.stopPropagation(); updateHP(participant.uid, 10)}} className="flex-1 py-0.5 bg-[#222] border border-[#333] text-green-500 text-[10px] rounded hover:bg-green-900/20 font-bold">+10</button>
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
                                        <img src={participant.imageUrl} className="w-full h-full object-cover transition-transform duration-700 group-hover/img:scale-110" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-stone-700"><Ghost size={64}/></div>
                                    )}
                                </div>

                                <div className="flex gap-1 w-full mb-3 bg-[#222] p-1 rounded-lg border border-[#333]">
                                    <button onClick={() => setExpandedTab('actions')} className={`flex-1 py-1 text-[10px] font-bold uppercase rounded ${expandedTab === 'actions' ? 'bg-[#ffb74d] text-black' : 'text-stone-400 hover:text-white'}`}>Ações</button>
                                    <button onClick={() => setExpandedTab('spells')} className={`flex-1 py-1 text-[10px] font-bold uppercase rounded ${expandedTab === 'spells' ? 'bg-[#ffb74d] text-black' : 'text-stone-400 hover:text-white'}`}>Magias</button>
                                    <button onClick={() => setExpandedTab('rolls')} className={`flex-1 py-1 text-[10px] font-bold uppercase rounded ${expandedTab === 'rolls' ? 'bg-[#ffb74d] text-black' : 'text-stone-400 hover:text-white'}`}>Atrib</button>
                                    <button onClick={() => setExpandedTab('calc')} className={`flex-1 py-1 text-[10px] font-bold uppercase rounded ${expandedTab === 'calc' ? 'bg-[#ffb74d] text-black' : 'text-stone-400 hover:text-white'}`}>Calc</button>
                                </div>

                                <div className="w-full bg-[#222] p-3 rounded-lg border border-stone-700">
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
                                        <div className="space-y-1 max-h-60 overflow-y-auto custom-scrollbar pr-1">
                                            {participant.spells?.map((spellName, i) => {
                                                const dbSpell = SPELLS_DB[spellName] || customSpells[spellName];
                                                const level = dbSpell?.level || '???';
                                                const desc = dbSpell?.desc || 'Descrição não disponível.';
                                                
                                                return (
                                                    <div key={i} className="group bg-[#1a1a1d] p-2 rounded border border-[#333] hover:border-purple-500/50 cursor-pointer transition-colors relative" onClick={() => addLog(`${participant.name} conjura ${spellName}`, `[${level}] ${desc}`, 'magic')}>
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
                                            {(!participant.spells || participant.spells.length === 0) && <div className="text-[10px] text-stone-600 italic text-center py-2">Nenhum conhecimento arcano.</div>}
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
                   </div>
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

        {/* Right: Logs */}
        {((!compact && showLogs) || (compact && compactTab === 'logs')) && (
            <div className={`${compact ? 'absolute inset-0 z-10 bg-[#121212]' : 'w-72 border-l'} bg-[#161619] border-[#2a2a2e] flex flex-col shadow-xl shrink-0`}>
                <div className="p-3 border-b border-[#2a2a2e] bg-[#1a1a1d] flex justify-between items-center shrink-0">
                    <span className="text-xs font-bold uppercase text-stone-400 flex items-center gap-2"><History size={14}/> Log de Batalha</span>
                    <button onClick={() => addLog('Sistema', 'Log limpo.', 'info')} className="text-stone-600 hover:text-white p-1 hover:bg-stone-800 rounded transition-colors"><Trash2 size={14}/></button>
                </div>
                <div className="flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar bg-[#121212]">
                    {logs.map(log => {
                        let bgColor = 'bg-[#1a1a1d] border-[#333]';
                        let textColor = 'text-stone-400';
                        let titleColor = 'text-stone-300';
                        let Icon = Info;

                        if (log.type === 'crit') {
                            bgColor = 'bg-amber-950/40 border-amber-600/50 shadow-[0_0_10px_rgba(245,158,11,0.1)]';
                            textColor = 'text-amber-200';
                            titleColor = 'text-amber-400';
                            Icon = Star;
                        } else if (log.type === 'fail') {
                            bgColor = 'bg-red-950/40 border-red-800/50';
                            textColor = 'text-red-300';
                            titleColor = 'text-red-400';
                            Icon = Cross;
                        } else if (log.type === 'combat') {
                            bgColor = 'bg-stone-900 border-stone-700';
                            titleColor = 'text-stone-200';
                            Icon = Sword;
                        } else if (log.type === 'magic') {
                            bgColor = 'bg-purple-950/30 border-purple-800/50';
                            textColor = 'text-purple-200';
                            titleColor = 'text-purple-400';
                            Icon = Wand2;
                        }

                        const formattedDetails = log.details.split(/(\d+|ACERTA|ERRA|CRÍTICO|FALHA)/g).map((part, i) => {
                            if (/^\d+$/.test(part) || ['ACERTA', 'CRÍTICO'].includes(part)) return <span key={i} className="font-bold text-white">{part}</span>;
                            if (['ERRA', 'FALHA'].includes(part)) return <span key={i} className="font-bold text-red-400">{part}</span>;
                            return part;
                        });

                        return (
                            <div key={log.id} className={`p-3 rounded-lg border text-[11px] leading-relaxed animate-in slide-in-from-right-2 shadow-sm ${bgColor} ${textColor}`}>
                                <div className="flex justify-between items-center mb-1.5 border-b border-white/5 pb-1">
                                    <div className="flex items-center gap-1.5">
                                        <Icon size={12} className={titleColor} />
                                        <span className={`font-bold text-xs ${titleColor}`}>{log.title}</span>
                                    </div>
                                    <span className="text-[9px] opacity-50">{new Date(log.timestamp).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</span>
                                </div>
                                <div className="font-mono opacity-90 whitespace-pre-wrap">{formattedDetails}</div>
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
