
import React, { useState } from 'react';
import { Monster, EncounterParticipant, LogEntry, Character } from '../types';
import { SPELLS_DB, COMMON_WEAPONS } from '../constants';
import { Search, Shield, Ghost, Sword, Play, ArrowDownUp, Dices, Crosshair, Minus, ChevronsUp, ChevronsDown, Trash2, Activity, Sparkles, Wand2, ScrollText, Star, X, Plus, Pencil, Users, Axe, Book, Zap } from 'lucide-react';

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
}

const CR_XP: Record<string, number> = {
    '0': 10, '1/8': 25, '1/4': 50, '1/2': 100,
    '1': 200, '2': 450, '3': 700, '4': 1100, '5': 1800,
    '6': 2300, '7': 2900, '8': 3900, '9': 5000, '10': 5900,
    '11': 7200, '12': 8400, '13': 10000, '14': 11500, '15': 13000,
    '16': 15000, '17': 18000, '18': 20000, '19': 22000, '20': 25000,
    '21': 33000, '22': 41000, '23': 50000, '24': 62000, '30': 155000
};

export const DMTools: React.FC<Props> = ({ encounter = [], setEncounter, logs = [], addLog, characters = [], monsters = [], setMonsters, turnIndex, setTurnIndex, targetUid, setTargetUid }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [libraryTab, setLibraryTab] = useState<'party' | 'bestiary' | 'spells' | 'weapons' | 'abilities'>('party');
  
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
  const getCharacterActions = (char: Character): { n: string; hit: number; dmg: string }[] => {
    const actions: { n: string; hit: number; dmg: string }[] = [];
    if (!char) return actions;

    const prof = Math.ceil(1 + ((char.level || 1) / 4));
    const strMod = Math.floor(((char.attributes?.str || 10) - 10) / 2);
    const dexMod = Math.floor(((char.attributes?.dex || 10) - 10) / 2);
    const chaMod = Math.floor(((char.attributes?.cha || 10) - 10) / 2);
    
    // Spell Casting
    const castingStatStr = char.spells?.castingStat || 'int';
    // @ts-ignore
    const castingMod = Math.floor(((char.attributes?.[castingStatStr as keyof typeof char.attributes] || 10) - 10) / 2);
    const spellHit = prof + castingMod;

    const isMonk = char.class?.toLowerCase() === 'monge';
    const isHexblade = char.subclass?.toLowerCase().includes('hexblade');

    const invLines = (char.inventory || "").split('\n');
    invLines.forEach(line => {
        const structMatch = line.match(/(?:-\s*)?(.*?)\s*\|\s*Dano:\s*(\d+d\d+)/i);
        if (structMatch) {
            const name = structMatch[1].trim();
            const dmgBase = structMatch[2];
            
            const lowerLine = line.toLowerCase();
            const isFinesse = lowerLine.includes('acuidade') || lowerLine.includes('sutil');
            const isRanged = lowerLine.includes('distância') || lowerLine.includes('arco') || lowerLine.includes('besta');
            const isThrown = lowerLine.includes('arremesso');
            
            let mod = strMod;
            if (isHexblade && !lowerLine.includes('duas mãos')) mod = chaMod;
            else if (isRanged && !isThrown) mod = dexMod;
            else if (isFinesse || (isMonk && !lowerLine.includes('pesada'))) mod = Math.max(strMod, dexMod);
            else if (isThrown) mod = strMod;

            const hitBonus = prof + mod;
            const dmgBonus = mod; 

            actions.push({ n: name, hit: hitBonus, dmg: `${dmgBase}${dmgBonus !== 0 ? (dmgBonus > 0 ? '+' : '') + dmgBonus : ''}` });
        }
    });

    let unarmedDmg = "1d4"; 
    let unarmedMod = strMod;
    
    const r = (char.race || "").toLowerCase();
    if (r.includes('tabaxi') || r.includes('leonino') || r.includes('aarakocra')) unarmedDmg = "1d4";
    if (r.includes('lagarto') || r.includes('minotauro')) unarmedDmg = "1d6";

    if (isMonk) {
        let die = 4;
        if (char.level >= 5) die = 6;
        if (char.level >= 11) die = 8;
        if (char.level >= 17) die = 10;
        unarmedDmg = `1d${die}`;
        unarmedMod = Math.max(strMod, dexMod);
    }

    if (!actions.some(a => a.n.toLowerCase().includes('desarmado') || a.n.toLowerCase().includes('artes marciais'))) {
        actions.push({ n: isMonk ? 'Artes Marciais' : 'Desarmado', hit: prof + unarmedMod, dmg: `${unarmedDmg}${unarmedMod >= 0 ? '+' : ''}${unarmedMod}` });
    }

    if (char.spells?.known) {
        const spellLines = char.spells.known.split('\n');
        spellLines.forEach(line => {
             const nameMatch = line.match(/(?:\[.*?\]\s*)?(.*?):/);
             const spellName = nameMatch ? nameMatch[1].trim() : line.trim();
             const dbSpell = SPELLS_DB[spellName] || customSpells[spellName] || Object.values(SPELLS_DB).find((s: any) => line.includes(s.desc.substring(0, 10)));
             if (dbSpell) {
                 const dmgMatch = dbSpell.desc.match(/(\d+d\d+)/);
                 if (dmgMatch && !dbSpell.desc.toLowerCase().includes('cura')) {
                     actions.push({ n: spellName, hit: spellHit, dmg: dmgMatch[1] });
                 }
             }
        });
    }
    return actions;
  };

  const addToEncounter = (mob: Monster) => {
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
    setEncounter([...encounter, participant]);
    addLog('Entrada', `${participant.name} entrou no combate.`, 'info');
  };

  const addCharacterToEncounter = (char: Character) => {
    const dexMod = Math.floor(((char.attributes?.dex || 10) - 10) / 2);
    const charActions = getCharacterActions(char);
    const charSpells: string[] = [];
    if (char.spells?.known) {
         char.spells.known.split('\n').forEach(l => {
             const m = l.match(/(?:\[.*?\]\s*)?(.*?):/);
             if (m) charSpells.push(m[1].trim());
         });
    }

    const participant: EncounterParticipant = {
      id: Date.now(), 
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
      spells: charSpells
    };
    setEncounter([...encounter, participant]);
    addLog('Entrada', `${char.name} (PJ) entrou no combate.`, 'info');
  };

  const removeFromEncounter = (uid: number) => {
    const mob = encounter.find(e => e.uid === uid);
    if (mob) {
        const xp = CR_XP[mob.cr];
        if (xp) {
            const newTotal = sessionXp + xp;
            setSessionXp(newTotal);
            addLog('XP', `${mob.name} derrotado. +${xp} XP (Sessão: ${newTotal})`, 'info');
        } else {
            addLog('Removido', `${mob.name} saiu do combate.`, 'info');
        }
    }
    setEncounter(encounter.filter(e => e.uid !== uid));
    if (targetUid === uid) setTargetUid(null);
    if (turnIndex >= encounter.length - 1) setTurnIndex(0);
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

  const updateInitiative = (uid: number, val: number) => {
      setEncounter(encounter.map(e => e.uid === uid ? { ...e, initiative: val } : e));
  };

  const toggleCondition = (uid: number, condition: string) => {
      setEncounter(encounter.map(e => {
          if (e.uid === uid) {
              const has = e.conditions.includes(condition);
              const newConditions = has 
                ? e.conditions.filter(c => c !== condition) 
                : [...e.conditions, condition];
              return { ...e, conditions: newConditions };
          }
          return e;
      }));
  };

  const rollAttack = (attackerName: string, actionName: string, hitBonus: number, dmg: string) => {
    const r1 = Math.floor(Math.random() * 20) + 1;
    const r2 = Math.floor(Math.random() * 20) + 1;
    let d20 = r1;
    let rollDetails = `(${r1})`;

    if (rollMode === 'adv') { d20 = Math.max(r1, r2); rollDetails = `(Adv: ${r1}, ${r2})`; } 
    else if (rollMode === 'dis') { d20 = Math.min(r1, r2); rollDetails = `(Des: ${r1}, ${r2})`; }

    const totalHit = d20 + hitBonus;
    const isCrit = d20 === 20;
    const isFail = d20 === 1;

    let hitResult = "";
    let hitColor: LogEntry['type'] = isCrit ? 'crit' : (isFail ? 'fail' : 'combat');
    const target = encounter.find(e => e.uid === targetUid);

    if (target) {
        if (isCrit) hitResult = `CRÍTICO! Acerta ${target.name}`;
        else if (isFail) hitResult = `FALHA! Erra ${target.name}`;
        else if (totalHit >= target.ac) { hitResult = `ACERTA ${target.name} (CA ${target.ac})`; hitColor = 'info'; } 
        else { hitResult = `ERRA ${target.name} (CA ${target.ac})`; hitColor = 'fail'; }
    }

    let dmgTotal = 0;
    let dmgRolls = "";
    
    if (dmg.includes('d') || dmg.match(/\d+/)) {
        const dmgMatch = dmg.match(/(\d+)d(\d+)\s*([+-]?\s*\d+)?/);
        
        if (dmgMatch) {
            const numDice = parseInt(dmgMatch[1]) * (isCrit ? 2 : 1);
            const faces = parseInt(dmgMatch[2]);
            const modStr = (dmgMatch[3] || "").replace(/\s/g, '');
            const mod = parseInt(modStr || '0');
            
            const rolls = [];
            let diceSum = 0;
            
            for(let i=0; i<numDice; i++) {
                const r = Math.floor(Math.random() * faces) + 1;
                rolls.push(r);
                diceSum += r;
            }
            
            dmgTotal = Math.max(0, diceSum + mod);
            dmgRolls = `[${rolls.join(',')}]${mod !== 0 ? (mod>0 ? `+${mod}` : mod) : ''}`;
        } else {
            const staticMatch = dmg.match(/^(\d+)([+-]\d+)?$/);
            if (staticMatch) {
                const base = parseInt(staticMatch[1]);
                const mod = parseInt(staticMatch[2] || '0');
                dmgTotal = isCrit ? (base * 2) + mod : base + mod; 
                dmgRolls = `[Fixo]`; 
            } else { dmgRolls = dmg; }
        }
    } else { dmgRolls = dmg; }

    const title = `${attackerName} usa ${actionName}`;
    const details = `${hitResult ? `>> ${hitResult} <<\n` : ''}Acerto: ${d20}${rollDetails} + ${hitBonus} = ${totalHit}${dmgTotal > 0 ? `\nDano: ${dmgTotal} ${dmgRolls}` : `\nEfeito: ${dmgRolls}`}`;

    addLog(title, details, hitColor);
  };

  const useSpell = (casterName: string, spellName: string) => {
    const spell = SPELLS_DB[spellName] || customSpells[spellName] || customAbilities[spellName];
    if (spell) addLog(`${casterName} usa ${spellName}`, `${spell.level} | ${spell.desc}`, 'magic');
    else addLog(`${casterName} usa ${spellName}`, "Conjuração realizada.", 'magic');
  };

  const sortInitiative = () => {
    const sorted = [...encounter].sort((a, b) => b.initiative - a.initiative);
    setEncounter(sorted);
    setTurnIndex(0); 
    addLog('Sistema', 'Iniciativa ordenada. Rodada 1 começou.', 'info');
  };

  const rerollInitiative = () => {
      setEncounter(encounter.map(e => ({ ...e, initiative: Math.floor(Math.random() * 20) + 1 })));
      addLog('Sistema', 'Iniciativa re-rolada para todos.', 'info');
  };

  const nextTurn = () => {
      if (encounter.length === 0) return;
      const next = (turnIndex + 1) % encounter.length;
      setTurnIndex(next);
      addLog('Turno', `Turno de ${encounter[next].name}`, 'info');
  };

  const addActionToTarget = (action: {n: string, hit: number, dmg: string}) => {
      if (!targetUid) { alert("Selecione um combatente para adicionar esta ação a ele."); return; }
      setEncounter(encounter.map(e => e.uid === targetUid ? { ...e, actions: [...e.actions, action] } : e));
      addLog('Sistema', `Adicionou ${action.n} a ${encounter.find(e => e.uid === targetUid)?.name}`, 'info');
  };

  const addSpellToTarget = (name: string) => {
      if (!targetUid) { alert("Selecione um combatente para adicionar esta magia."); return; }
      setEncounter(encounter.map(e => e.uid === targetUid ? { ...e, spells: e.spells ? [...e.spells, name] : [name] } : e));
      addLog('Sistema', `Adicionou magia ${name} a ${encounter.find(e => e.uid === targetUid)?.name}`, 'info');
  };

  const openEditMonster = (mob: Monster) => {
      setNewMonster({ name: mob.name, type: mob.type, cr: mob.cr, ac: mob.ac, hp: mob.hp, actions: mob.actions, spells: mob.spells });
      setEditingMonsterId(mob.id);
      setCustomModalOpen(true);
  };

  const saveCustomMonster = () => {
    if (!newMonster.name) return;
    if (editingMonsterId) {
        setMonsters(monsters.map(m => m.id === editingMonsterId ? { ...m, ...newMonster } as Monster : m));
    } else {
        const m: Monster = { id: Date.now(), name: newMonster.name, type: newMonster.type || 'Desconhecido', cr: newMonster.cr || '0', ac: newMonster.ac || 10, hp: newMonster.hp || 10, speed: '9m', actions: newMonster.actions && newMonster.actions.length > 0 ? newMonster.actions : [{n: 'Ataque Básico', hit: 3, dmg: '1d4+1'}], spells: newMonster.spells };
        setMonsters([...monsters, m]);
    }
    setCustomModalOpen(false);
    setEditingMonsterId(null);
    setNewMonster({ name: '', hp: 10, ac: 10, cr: '1/8', actions: [], spells: [] });
  };
  
  const handleCreateLibItem = () => {
      if (!newLibItem.name) return;
      if (libraryTab === 'spells') setCustomSpells({ ...customSpells, [newLibItem.name]: { level: newLibItem.stat1 || 'Truque', desc: newLibItem.stat2 || 'Efeito Mágico' } });
      else if (libraryTab === 'weapons') setCustomWeapons([ ...customWeapons, { n: newLibItem.name, dmg: newLibItem.stat1 || '1d4', prop: newLibItem.stat2 || 'Simples' } ]);
      else if (libraryTab === 'abilities') setCustomAbilities({ ...customAbilities, [newLibItem.name]: { level: 'Habilidade', desc: newLibItem.stat2 || 'Efeito Especial' } });
      setIsCreating(false);
      setNewLibItem({name: '', stat1: '', stat2: ''});
  };

  const addTempAction = () => {
    if (!actionInput.n) return;
    setNewMonster(prev => ({ ...prev, actions: [...(prev.actions || []), { n: actionInput.n, hit: actionInput.hit, dmg: actionInput.dmg }] }));
    setActionInput({ n: '', hit: 0, dmg: '' });
  };

  const removeTempAction = (index: number) => {
    setNewMonster(prev => ({ ...prev, actions: (prev.actions || []).filter((_, i) => i !== index) }));
  };

  const displayedSpells = [...(Object.entries(SPELLS_DB) as [string, {level: string, desc: string}][]).filter(([_, s]) => s.level !== 'Habilidade'), ...Object.entries(customSpells)]
    .filter(([name]) => name.toLowerCase().includes(searchTerm.toLowerCase())) as [string, {level: string, desc: string}][];

  const displayedAbilities = [...(Object.entries(SPELLS_DB) as [string, {level: string, desc: string}][]).filter(([_, s]) => s.level === 'Habilidade'), ...Object.entries(customAbilities)]
    .filter(([name]) => name.toLowerCase().includes(searchTerm.toLowerCase())) as [string, {level: string, desc: string}][];

  const displayedWeapons = [...COMMON_WEAPONS, ...customWeapons]
    .filter(w => w.n.toLowerCase().includes(searchTerm.toLowerCase()));

  const getHpColor = (current: number, max: number) => {
      const pct = current / max;
      if (pct > 0.6) return 'bg-gradient-to-r from-green-500 to-green-600';
      if (pct > 0.3) return 'bg-gradient-to-r from-yellow-500 to-amber-500';
      return 'bg-gradient-to-r from-red-600 to-red-700';
  };

  const parseCR = (cr: string) => {
      if (cr.includes('/')) { const [n, d] = cr.split('/'); return parseInt(n) / parseInt(d); }
      return parseFloat(cr);
  };

  const groupMonstersByCR = (mobs: Monster[]) => {
      const grouped: Record<string, Monster[]> = {};
      mobs.forEach(m => { if (!grouped[m.cr]) grouped[m.cr] = []; grouped[m.cr].push(m); });
      const sortedKeys = Object.keys(grouped).sort((a, b) => parseCR(a) - parseCR(b));
      return sortedKeys.map(key => ({ cr: key, items: grouped[key] }));
  };

  const filteredMonsters = monsters.filter(m => m.name.toLowerCase().includes(searchTerm.toLowerCase()));
  const groupedMonsters = groupMonstersByCR(filteredMonsters);

  return (
    <div className="flex flex-col h-full bg-[#121212] text-stone-200 font-lato overflow-hidden">
      <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
        {/* Left: Library */}
        <div className="w-full md:w-80 bg-[#1a1a1d] border-r border-[#2a2a2e] flex flex-col p-4 shadow-xl z-10 md:h-full h-1/3 shrink-0">
           {/* Tabs */}
           <div className="flex bg-[#0f0f11] p-1 rounded-lg mb-4 border border-[#333]">
                {[
                    {id: 'party', icon: Users, title: 'Heróis', color: 'text-blue-400'},
                    {id: 'bestiary', icon: Ghost, title: 'Bestiário', color: 'text-stone-300'},
                    {id: 'spells', icon: Book, title: 'Magias', color: 'text-purple-400'},
                    {id: 'weapons', icon: Axe, title: 'Armas', color: 'text-red-400'},
                    {id: 'abilities', icon: Zap, title: 'Habs', color: 'text-amber-400'}
                ].map(tab => (
                    <button 
                        key={tab.id}
                        onClick={() => setLibraryTab(tab.id as any)} 
                        className={`flex-1 py-2 rounded-md flex items-center justify-center transition-all duration-200 ${libraryTab === tab.id ? 'bg-[#2a2a2e] text-white shadow-md' : 'text-stone-500 hover:text-stone-300'}`} 
                        title={tab.title}
                    >
                        <tab.icon size={16} className={libraryTab === tab.id ? tab.color : ''}/>
                    </button>
                ))}
           </div>

           <div className="flex gap-2 mb-4">
             <div className="relative flex-1 group">
                <Search className="absolute left-2.5 top-2 text-stone-500 group-focus-within:text-amber-500 transition-colors" size={16} />
                <input 
                  className="w-full bg-[#252529] border border-[#333] rounded-lg py-1.5 pl-9 pr-7 text-sm focus:outline-none focus:border-amber-600 focus:ring-1 focus:ring-amber-600/50 text-stone-200 placeholder-stone-600 transition-all shadow-inner" 
                  placeholder={`Buscar...`}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                {searchTerm && <button onClick={() => setSearchTerm('')} className="absolute right-2 top-2 text-stone-500 hover:text-white"><X size={14}/></button>}
             </div>
             {/* Add Buttons */}
             {libraryTab === 'bestiary' && <button onClick={() => { setEditingMonsterId(null); setNewMonster({ name: '', hp: 10, ac: 10, cr: '1/8', actions: [], spells: [] }); setCustomModalOpen(true); }} className="bg-amber-600 text-white rounded-lg px-2.5 hover:bg-amber-500 shadow-lg shadow-amber-900/20 transition-all hover:scale-105" title="Criar Monstro"><Plus size={20} /></button>}
             {libraryTab !== 'bestiary' && libraryTab !== 'party' && <button onClick={() => { setIsCreating(!isCreating); setNewLibItem({name: '', stat1: '', stat2: ''}) }} className="bg-[#333] text-stone-300 rounded-lg px-2.5 hover:bg-[#444] border border-[#444] transition-all" title="Criar Personalizado"><Plus size={20} /></button>}
           </div>

           {/* Creation Form */}
           {isCreating && libraryTab !== 'bestiary' && libraryTab !== 'party' && (
               <div className="bg-[#202024] p-3 mb-3 rounded-lg border border-[#333] shadow-lg animate-in fade-in slide-in-from-top-2">
                   <div className="text-[10px] font-bold mb-2 text-amber-500 uppercase tracking-wider">Novo Item</div>
                   <input className="w-full bg-black/30 border border-[#333] rounded p-1.5 text-xs mb-2 text-white focus:border-amber-500 focus:outline-none" placeholder="Nome" value={newLibItem.name} onChange={e => setNewLibItem({...newLibItem, name: e.target.value})} />
                   {libraryTab !== 'abilities' && (
                       <input className="w-full bg-black/30 border border-[#333] rounded p-1.5 text-xs mb-2 text-white focus:border-amber-500 focus:outline-none" placeholder={libraryTab === 'spells' ? 'Nível (ex: 3º Nível)' : 'Dano (ex: 1d8)'} value={newLibItem.stat1} onChange={e => setNewLibItem({...newLibItem, stat1: e.target.value})} />
                   )}
                   <input className="w-full bg-black/30 border border-[#333] rounded p-1.5 text-xs mb-2 text-white focus:border-amber-500 focus:outline-none" placeholder={libraryTab === 'spells' ? 'Descrição' : libraryTab === 'weapons' ? 'Propriedades' : 'Descrição do Efeito'} value={newLibItem.stat2} onChange={e => setNewLibItem({...newLibItem, stat2: e.target.value})} />
                   <button onClick={handleCreateLibItem} className="w-full bg-green-700 hover:bg-green-600 text-white rounded p-1.5 text-xs font-bold uppercase tracking-wide">Salvar</button>
               </div>
           )}
           
           <div className="flex-1 overflow-y-auto space-y-2 custom-scrollbar pr-1">
             {libraryTab === 'party' && (
                <>
                    {characters.length === 0 && <div className="text-xs text-stone-500 italic text-center p-4">Nenhum herói criado na aba Fichas.</div>}
                    {characters.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase())).map((char, i) => (
                        <div key={i} className="bg-[#222226] p-3 rounded-lg border border-[#333] hover:border-blue-600/50 hover:bg-[#2a2a30] transition-all flex justify-between items-center group shadow-sm">
                            <div>
                                <div className="font-bold text-blue-400 group-hover:text-blue-300">{char.name}</div>
                                <div className="text-[10px] text-stone-500 uppercase tracking-wide font-bold">Nvl {char.level} • {char.race} {char.class}</div>
                            </div>
                            <button onClick={() => addCharacterToEncounter(char)} className="text-stone-500 hover:text-green-400 hover:bg-green-900/20 p-1.5 rounded-md transition-colors" title="Adicionar ao Combate"><Plus size={18} /></button>
                        </div>
                    ))}
                </>
             )}

             {libraryTab === 'bestiary' && (
                 <div className="space-y-4">
                     {groupedMonsters.length === 0 && <div className="text-xs text-stone-500 text-center">Nenhuma criatura encontrada.</div>}
                     {groupedMonsters.map(group => (
                         <div key={group.cr}>
                             <div className="text-[10px] font-bold text-stone-500 uppercase border-b border-[#333] pb-1 mb-2 ml-1 sticky top-0 bg-[#1a1a1d] z-10">
                                 Nível de Desafio {group.cr}
                             </div>
                             <div className="space-y-2">
                                 {group.items.map(m => (
                                   <div key={m.id} className="bg-[#222226] p-2 rounded border border-[#333] hover:border-stone-500 transition-all flex justify-between items-center group">
                                     <div className="flex-1">
                                       <div className="font-bold text-stone-300 text-sm group-hover:text-white">{m.name}</div>
                                       <div className="text-[10px] text-stone-500">{m.type} • PV {m.hp} • CA {m.ac}</div>
                                     </div>
                                     <div className="flex gap-1">
                                         <button onClick={() => openEditMonster(m)} className="text-stone-600 hover:text-blue-400 p-1 rounded transition-colors" title="Editar Criatura"><Pencil size={14}/></button>
                                         <button onClick={() => addToEncounter(m)} className="text-stone-500 hover:text-amber-400 hover:bg-amber-900/20 p-1 rounded transition-colors"><Plus size={16}/></button>
                                     </div>
                                   </div>
                                 ))}
                             </div>
                         </div>
                     ))}
                 </div>
             )}

             {libraryTab === 'spells' && displayedSpells.map(([name, spell]) => (
                 <div key={name} className="bg-[#222226] p-2 rounded border border-[#333] hover:border-purple-600/50 transition-all group flex justify-between items-center cursor-help">
                   <div onClick={() => addLog(`Ref: ${name}`, `${spell.level} | ${spell.desc}`, 'magic')} className="flex-1 cursor-pointer">
                        <div className="font-bold text-purple-400 text-sm group-hover:text-purple-300">{name}</div>
                        <div className="text-[10px] text-stone-500">{spell.level}</div>
                   </div>
                   <button onClick={() => addSpellToTarget(name)} className="opacity-0 group-hover:opacity-100 p-1.5 rounded hover:bg-purple-900/30 text-purple-400 transition-opacity" title="Adicionar magia ao alvo selecionado"><Wand2 size={14}/></button>
                 </div>
             ))}
             {libraryTab === 'abilities' && displayedAbilities.map(([name, ability]) => (
                 <div key={name} className="bg-[#222226] p-2 rounded border border-[#333] hover:border-amber-600/50 transition-all group flex justify-between items-center cursor-help">
                   <div onClick={() => addLog(`Ref: ${name}`, `${ability.desc}`, 'info')} className="flex-1 cursor-pointer">
                        <div className="font-bold text-amber-500 text-sm group-hover:text-amber-400">{name}</div>
                   </div>
                   <button onClick={() => addSpellToTarget(name)} className="opacity-0 group-hover:opacity-100 p-1.5 rounded hover:bg-amber-900/30 text-amber-400 transition-opacity" title="Adicionar habilidade ao alvo selecionado"><Plus size={14}/></button>
                 </div>
             ))}
             {libraryTab === 'weapons' && displayedWeapons.map(w => (
                 <div key={w.n} className="bg-[#222226] p-2 rounded border border-[#333] hover:border-red-600/50 transition-all group flex justify-between items-center cursor-help">
                   <div onClick={() => addLog(`Ref: ${w.n}`, `${w.dmg} | ${w.prop}`, 'info')} className="flex-1 cursor-pointer">
                        <div className="font-bold text-red-400 text-sm group-hover:text-red-300">{w.n}</div>
                        <div className="text-[10px] text-stone-500">{w.dmg}</div>
                   </div>
                   <button onClick={() => addActionToTarget({n: w.n, hit: 4, dmg: w.dmg})} className="opacity-0 group-hover:opacity-100 p-1.5 rounded hover:bg-red-900/30 text-red-400 transition-opacity" title="Adicionar arma ao alvo selecionado (+4 acerto)"><Sword size={14}/></button>
                 </div>
             ))}
           </div>
        </div>

        {/* Center: Encounter */}
        <div className="flex-1 bg-[#0c0c0e] p-6 overflow-y-auto relative bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#1f1f23] to-[#0c0c0e] border-x border-[#333]">
           <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
             <div className="flex flex-col">
                <div className="flex items-center gap-3">
                    <h2 className="text-3xl font-cinzel text-amber-500 drop-shadow-md">Combate Ativo</h2>
                </div>
                <div className="text-xs text-stone-400 mt-1 flex items-center gap-2 h-5">
                    {targetUid ? (
                        <span className="text-red-400 font-bold flex items-center gap-1 animate-pulse"><Crosshair size={14}/> Alvo: {encounter.find((e: EncounterParticipant) => e.uid === targetUid)?.name} (CA {encounter.find((e: EncounterParticipant) => e.uid === targetUid)?.ac})</span>
                    ) : (
                        <span className="opacity-50">Selecione um alvo clicando no card</span>
                    )}
                </div>
             </div>
             
             <div className="flex flex-wrap items-center gap-2">
                 <div className="flex items-center bg-[#1a1a1d] p-1 rounded-lg border border-[#333] shadow-md">
                    <button onClick={sortInitiative} className="px-3 py-1.5 text-xs font-bold rounded flex items-center gap-1.5 bg-blue-900/40 text-blue-300 hover:bg-blue-800/60 transition-colors border border-blue-800/50" title="Ordenar por Iniciativa"><ArrowDownUp size={14}/> Ordenar</button>
                    <div className="w-[1px] h-4 bg-[#333] mx-1"></div>
                    <button onClick={rerollInitiative} className="px-3 py-1.5 text-xs font-bold rounded flex items-center gap-1.5 bg-stone-800 text-stone-300 hover:bg-stone-700 transition-colors" title="Rolar Iniciativa para Todos"><Dices size={14}/> Rolar Todos</button>
                 </div>

                 <div className="flex items-center bg-[#1a1a1d] p-1 rounded-lg border border-[#333] shadow-md">
                    <button onClick={() => setRollMode('normal')} className={`px-3 py-1.5 text-xs font-bold rounded flex items-center gap-1 transition-all ${rollMode === 'normal' ? 'bg-stone-700 text-white shadow-sm' : 'text-stone-500 hover:text-stone-300'}`}><Minus size={14}/> Normal</button>
                    <button onClick={() => setRollMode('adv')} className={`px-3 py-1.5 text-xs font-bold rounded flex items-center gap-1 transition-all ${rollMode === 'adv' ? 'bg-green-900/50 text-green-400 border border-green-800/50' : 'text-stone-500 hover:text-green-500'}`}><ChevronsUp size={14}/> Vant</button>
                    <button onClick={() => setRollMode('dis')} className={`px-3 py-1.5 text-xs font-bold rounded flex items-center gap-1 transition-all ${rollMode === 'dis' ? 'bg-red-900/50 text-red-400 border border-red-800/50' : 'text-stone-500 hover:text-red-500'}`}><ChevronsDown size={14}/> Desv</button>
                 </div>

                 <div className="flex gap-2 items-center ml-2">
                     <button onClick={nextTurn} className="px-4 py-2 bg-green-700 hover:bg-green-600 text-white font-bold text-sm rounded-lg flex items-center gap-2 shadow-lg shadow-green-900/20 border-b-2 border-green-900 active:border-b-0 active:translate-y-0.5 transition-all"><Play size={16} fill="currentColor"/> Próximo Turno</button>
                     <button onClick={() => {setEncounter([]); setTurnIndex(-1); setTargetUid(null);}} className="p-2 bg-red-900/20 text-red-500 hover:bg-red-900/40 hover:text-red-400 rounded-lg border border-red-900/30 transition-colors" title="Limpar Combate"><Trash2 size={18}/></button>
                 </div>
             </div>
           </div>

           {encounter.length === 0 ? (
               <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-[#333] rounded-xl text-stone-600">
                   <Ghost size={48} className="mb-4 opacity-50"/>
                   <p className="font-cinzel text-xl">O campo de batalha está vazio</p>
                   <p className="text-sm">Adicione heróis ou monstros da biblioteca à esquerda.</p>
               </div>
           ) : (
               <div className="grid grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3 gap-4 pb-20">
                  {encounter.map((participant: EncounterParticipant, idx: number) => {
                     const isTarget = targetUid === participant.uid;
                     const isTurn = turnIndex === idx;
                     return (
                        <div 
                          key={participant.uid} 
                          onClick={() => setTargetUid(participant.uid)}
                          className={`relative group rounded-xl border transition-all duration-300 cursor-pointer overflow-hidden ${isTurn ? 'bg-[#1e1e24] border-amber-500/80 shadow-[0_0_15px_rgba(245,158,11,0.15)] scale-[1.01] z-10' : 'bg-[#161619] border-[#333] hover:border-stone-500'} ${isTarget ? 'ring-2 ring-red-500/70' : ''}`}
                        >
                          {/* Turn Indicator Strip */}
                          {isTurn && <div className="absolute top-0 left-0 w-1 h-full bg-amber-500 shadow-[0_0_10px_#f59e0b]"></div>}
                          
                          <div className="p-4">
                              {/* Header Card */}
                              <div className="flex justify-between items-start mb-4">
                                 <div className="flex items-center gap-3">
                                    <div className="relative">
                                        <input 
                                            type="number" 
                                            className={`w-12 h-12 text-center font-bold text-2xl rounded-lg border-2 focus:outline-none transition-colors ${isTurn ? 'bg-amber-900/20 border-amber-600 text-amber-500' : 'bg-[#0f0f11] border-[#333] text-stone-400'}`}
                                            value={participant.initiative}
                                            onClick={(e: React.MouseEvent) => e.stopPropagation()}
                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateInitiative(participant.uid, parseInt(e.target.value) || 0)}
                                        />
                                        <div className="absolute -top-2 -right-2 bg-[#222] text-[9px] px-1 rounded border border-[#444] text-stone-500 uppercase font-bold">Inic</div>
                                    </div>
                                    <div>
                                        <h3 className={`font-bold text-lg leading-none mb-1 ${isTurn ? 'text-amber-400' : 'text-stone-200'}`}>{participant.name}</h3>
                                        <div className="text-xs text-stone-500 flex items-center gap-2">
                                            <span className="px-1.5 py-0.5 rounded bg-[#222] border border-[#333]">{participant.type}</span>
                                            {participant.cr && <span>ND {participant.cr}</span>}
                                        </div>
                                    </div>
                                 </div>
                                 
                                 <div className="flex items-center gap-2">
                                     <button onClick={(e: React.MouseEvent) => {e.stopPropagation(); setConditionModalUid(participant.uid)}} className={`p-1.5 rounded-lg transition-colors ${participant.conditions.length > 0 ? 'bg-amber-900/30 text-amber-500' : 'text-stone-600 hover:text-stone-300 hover:bg-[#222]'}`} title="Condições"><Activity size={18}/></button>
                                     <div className="flex flex-col items-center justify-center w-10 h-10 bg-[#0f0f11] rounded-lg border border-[#333] relative">
                                        <Shield size={16} className="text-stone-600 absolute opacity-30"/>
                                        <span className="font-bold text-sm relative z-10 text-stone-300">{participant.ac}</span>
                                     </div>
                                     <button onClick={(e: React.MouseEvent) => {e.stopPropagation(); removeFromEncounter(participant.uid)}} className="text-stone-600 hover:text-red-500 hover:bg-red-900/10 p-1.5 rounded-lg transition-colors"><Trash2 size={18}/></button>
                                 </div>
                              </div>

                              {/* HP Section */}
                              <div className="mb-4 bg-[#0f0f11] p-2 rounded-lg border border-[#222]">
                                 <div className="flex justify-between text-[10px] font-bold uppercase text-stone-500 mb-1 px-1">
                                    <span>Pontos de Vida</span>
                                    <span>{participant.hpCurrent} <span className="text-stone-600">/</span> {participant.hpMax}</span>
                                 </div>
                                 <div className="relative h-3 bg-[#222] rounded-full overflow-hidden shadow-inner">
                                     <div className={`absolute top-0 left-0 h-full transition-all duration-500 ease-out ${getHpColor(participant.hpCurrent, participant.hpMax)}`} style={{width: `${Math.min(100, (participant.hpCurrent/participant.hpMax)*100)}%`}}/>
                                 </div>
                                 <div className="flex justify-between mt-2 gap-1">
                                     <div className="flex gap-1">
                                        <button onClick={(e: React.MouseEvent) => {e.stopPropagation(); updateHP(participant.uid, -1)}} className="px-2 py-0.5 text-xs font-bold rounded bg-[#222] text-red-400 hover:bg-red-900/30 border border-[#333]">-1</button>
                                        <button onClick={(e: React.MouseEvent) => {e.stopPropagation(); updateHP(participant.uid, -5)}} className="px-2 py-0.5 text-xs font-bold rounded bg-[#222] text-red-400 hover:bg-red-900/30 border border-[#333]">-5</button>
                                     </div>
                                     <div className="flex gap-1">
                                        <button onClick={(e: React.MouseEvent) => {e.stopPropagation(); updateHP(participant.uid, 1)}} className="px-2 py-0.5 text-xs font-bold rounded bg-[#222] text-green-400 hover:bg-green-900/30 border border-[#333]">+1</button>
                                        <button onClick={(e: React.MouseEvent) => {e.stopPropagation(); updateHP(participant.uid, 5)}} className="px-2 py-0.5 text-xs font-bold rounded bg-[#222] text-green-400 hover:bg-green-900/30 border border-[#333]">+5</button>
                                     </div>
                                 </div>
                              </div>

                              {/* Conditions Badges */}
                              {participant.conditions.length > 0 && (
                                  <div className="flex flex-wrap gap-1 mb-3">
                                      {participant.conditions.map((c: string) => (
                                          <span key={c} className="text-[9px] px-2 py-0.5 rounded-full bg-red-900/40 text-red-300 border border-red-900/50 uppercase font-bold tracking-wide">{c}</span>
                                      ))}
                                  </div>
                              )}

                              {/* Actions List */}
                              <div className="space-y-1">
                                  {participant.actions.map((act: any, i: number) => (
                                      <button key={i} onClick={(e: React.MouseEvent) => {e.stopPropagation(); rollAttack(participant.name, act.n, act.hit, act.dmg)}} className="w-full text-left bg-[#252529] hover:bg-[#333] border border-[#333] hover:border-stone-500 p-2 rounded-md flex justify-between items-center text-sm transition-all group/btn">
                                          <span className="font-bold text-stone-300 group-hover/btn:text-white flex items-center gap-2">
                                              <Sword size={12} className="text-stone-500 group-hover/btn:text-stone-300"/> {act.n}
                                          </span>
                                          <span className="font-mono text-xs text-stone-400 bg-[#151518] px-1.5 py-0.5 rounded">+{act.hit} <span className="text-stone-600">|</span> {act.dmg}</span>
                                      </button>
                                  ))}
                              </div>
                              
                              {/* Spells List */}
                              {participant.spells && participant.spells.length > 0 && (
                                <div className="mt-3 pt-2 border-t border-[#333]">
                                    <div className="text-[9px] font-bold uppercase text-purple-500 mb-2 flex items-center gap-1 tracking-widest"><Sparkles size={10}/> Grimório</div>
                                    <div className="space-y-1">
                                        {participant.spells.map((spellName: string, i: number) => (
                                            <button key={i} onClick={(e: React.MouseEvent) => {e.stopPropagation(); useSpell(participant.name, spellName)}} className="w-full text-left bg-purple-900/10 hover:bg-purple-900/20 border border-purple-900/30 hover:border-purple-500/50 p-2 rounded-md flex justify-between items-center text-sm text-purple-300 transition-all group/spell">
                                                <span className="font-bold flex items-center gap-2"><Wand2 size={12} className="opacity-50 group-hover/spell:opacity-100"/> {spellName}</span>
                                                <span className="text-[9px] uppercase font-bold opacity-0 group-hover/spell:opacity-100 transition-opacity bg-purple-900/50 px-1 rounded">Conjurar</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                              )}
                          </div>
                        </div>
                     );
                  })}
               </div>
           )}
        </div>

        {/* Right: Logs */}
        <div className="w-full md:w-72 bg-[#161619] border-l border-[#2a2a2e] flex flex-col shadow-xl z-10 md:h-full h-1/3 shrink-0">
            <div className="p-3 border-b border-[#2a2a2e] bg-[#1a1a1d]">
                <h3 className="font-cinzel text-stone-400 text-sm flex items-center gap-2"><ScrollText size={16} className="text-amber-600"/> Histórico</h3>
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar bg-[#121212]">
                {logs.map(log => (
                    <div key={log.id} className={`p-2.5 rounded-lg border text-xs relative overflow-hidden ${
                        log.type === 'crit' ? 'bg-amber-900/20 border-amber-600/50 text-amber-200' : 
                        log.type === 'fail' ? 'bg-red-900/20 border-red-600/50 text-red-300' :
                        log.type === 'magic' ? 'bg-purple-900/20 border-purple-600/50 text-purple-200' :
                        log.type === 'combat' ? 'bg-[#1f1f23] border-[#333] text-stone-300' :
                        'bg-transparent border-transparent text-stone-500'
                    }`}>
                        {log.type === 'crit' && <Star size={40} className="absolute -right-2 -top-2 text-amber-500 opacity-10 rotate-12"/>}
                        <div className="flex justify-between text-[9px] opacity-60 mb-1 uppercase tracking-wider font-bold">
                            <span>{log.type}</span>
                            <span>{log.timestamp.toLocaleTimeString()}</span>
                        </div>
                        <div className="font-bold mb-1 text-sm">{log.title}</div>
                        <div className="font-mono opacity-80 leading-relaxed whitespace-pre-wrap">{log.details}</div>
                    </div>
                ))}
            </div>
        </div>
      </div>
      
      {/* Modals */}
      {conditionModalUid && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[110] p-4" onClick={() => setConditionModalUid(null)}>
              <div className="bg-[#1a1a1d] border border-[#333] rounded-xl p-6 w-96 shadow-2xl animate-in zoom-in-95 duration-200" onClick={(e: React.MouseEvent) => e.stopPropagation()}>
                  <h3 className="text-lg font-cinzel font-bold text-stone-200 mb-4 flex items-center gap-2 border-b border-[#333] pb-2"><Activity size={20} className="text-amber-500"/> Condições</h3>
                  <div className="grid grid-cols-2 gap-2 max-h-96 overflow-y-auto custom-scrollbar">
                      {conditionsList.map(cond => {
                          const isActive = encounter.find((e: EncounterParticipant) => e.uid === conditionModalUid)?.conditions.includes(cond);
                          return (
                              <button key={cond} onClick={() => toggleCondition(conditionModalUid, cond)} className={`px-3 py-2 text-xs font-bold rounded-lg border transition-all ${isActive ? 'bg-red-900/40 border-red-500 text-red-200 shadow-[0_0_10px_rgba(220,38,38,0.2)]' : 'bg-[#222] border-[#333] text-stone-500 hover:bg-[#2a2a2e]'}`}>
                                  {cond}
                              </button>
                          )
                      })}
                  </div>
              </div>
          </div>
      )}

      {/* Modal Criar Monstro */}
      {customModalOpen && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-[110] p-4">
              <div className="bg-[#1a1a1d] border border-[#333] rounded-xl w-full max-w-lg p-6 shadow-2xl animate-in slide-in-from-bottom-10">
                  <div className="flex justify-between items-center mb-6 border-b border-[#333] pb-2">
                      <h3 className="text-xl font-cinzel font-bold text-amber-500 flex items-center gap-2"><Ghost size={24}/> {editingMonsterId ? 'Editar Criatura' : 'Criar Criatura'}</h3>
                      <button onClick={() => setCustomModalOpen(false)} className="text-stone-500 hover:text-white"><X size={20}/></button>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                          <label className="block text-[10px] font-bold text-stone-500 uppercase mb-1">Nome</label>
                          <input className="w-full bg-black/40 border border-[#333] rounded p-2 text-sm text-white focus:border-amber-500 focus:outline-none" value={newMonster.name} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewMonster({...newMonster, name: e.target.value})} />
                      </div>
                      <div>
                          <label className="block text-[10px] font-bold text-stone-500 uppercase mb-1">Tipo</label>
                          <input className="w-full bg-black/40 border border-[#333] rounded p-2 text-sm text-white focus:border-amber-500 focus:outline-none" value={newMonster.type} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewMonster({...newMonster, type: e.target.value})} placeholder="Humanóide, Fera..." />
                      </div>
                      <div>
                          <label className="block text-[10px] font-bold text-stone-500 uppercase mb-1">PV Máximo</label>
                          <input type="number" className="w-full bg-black/40 border border-[#333] rounded p-2 text-sm text-white focus:border-amber-500 focus:outline-none" value={newMonster.hp} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewMonster({...newMonster, hp: parseInt(e.target.value)})} />
                      </div>
                      <div className="flex gap-2">
                          <div className="flex-1">
                              <label className="block text-[10px] font-bold text-stone-500 uppercase mb-1">CA</label>
                              <input type="number" className="w-full bg-black/40 border border-[#333] rounded p-2 text-sm text-white focus:border-amber-500 focus:outline-none" value={newMonster.ac} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewMonster({...newMonster, ac: parseInt(e.target.value)})} />
                          </div>
                          <div className="flex-1">
                              <label className="block text-[10px] font-bold text-stone-500 uppercase mb-1">ND</label>
                              <input className="w-full bg-black/40 border border-[#333] rounded p-2 text-sm text-white focus:border-amber-500 focus:outline-none" value={newMonster.cr} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewMonster({...newMonster, cr: e.target.value})} />
                          </div>
                      </div>
                  </div>
                  
                  <div className="mb-4 bg-[#222] p-3 rounded-lg border border-[#333]">
                      <label className="block text-[10px] font-bold text-stone-500 uppercase mb-2 flex items-center gap-2"><Sword size={12}/> Ações Rápidas</label>
                      <div className="space-y-2 mb-2 max-h-32 overflow-y-auto custom-scrollbar">
                          {newMonster.actions?.map((act: any, i: number) => (
                              <div key={i} className="flex justify-between items-center text-xs bg-[#151518] p-2 rounded border border-[#333]">
                                  <span className="font-bold text-stone-300">{act.n} <span className="text-stone-500 font-normal">+{act.hit} ({act.dmg})</span></span>
                                  <button onClick={() => removeTempAction(i)} className="text-stone-600 hover:text-red-500"><X size={14}/></button>
                              </div>
                          ))}
                      </div>
                      <div className="flex gap-2">
                          <input className="flex-[2] bg-black/40 border border-[#333] rounded p-1.5 text-xs text-white" placeholder="Ataque (ex: Garra)" value={actionInput.n} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setActionInput({...actionInput, n: e.target.value})} />
                          <input className="w-12 bg-black/40 border border-[#333] rounded p-1.5 text-xs text-center text-white" placeholder="+Hit" value={actionInput.hit} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setActionInput({...actionInput, hit: parseInt(e.target.value)})} />
                          <input className="flex-1 bg-black/40 border border-[#333] rounded p-1.5 text-xs text-white" placeholder="Dano (1d6+2)" value={actionInput.dmg} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setActionInput({...actionInput, dmg: e.target.value})} />
                          <button onClick={addTempAction} className="bg-stone-700 hover:bg-stone-600 text-white px-2 rounded"><Plus size={16}/></button>
                      </div>
                  </div>
                  
                  <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-[#333]">
                      <button onClick={() => setCustomModalOpen(false)} className="px-4 py-2 text-stone-500 hover:text-stone-300 text-sm font-bold">Cancelar</button>
                      <button onClick={saveCustomMonster} className="px-6 py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-lg shadow-lg">{editingMonsterId ? 'Salvar Alterações' : 'Criar Criatura'}</button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};
