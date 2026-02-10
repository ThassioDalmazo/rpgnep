
import React, { useEffect, useState, Dispatch, SetStateAction } from 'react';
import { Character } from '../types';
import { CLASSES_DB, SKILL_LIST, RACES_LIST, BACKGROUNDS_DB, COMMON_WEAPONS, SPELLS_DB, CLASS_FEATURES, ARMOR_DB } from '../constants';
import { Sword, Shield, Heart, Zap, Scroll, Backpack, Save, Upload, Skull, BatteryCharging, Brain, Plus, ChevronDown, ChevronRight, Book, Moon, Trash2, ArrowUpCircle, Clock, Ruler, Hourglass, Sparkles, Calculator, AlertTriangle, Dices } from 'lucide-react';

interface Props {
  char: Character;
  setChar: Dispatch<SetStateAction<Character>>;
  onRoll: (d: number, mod: number, label: string) => void;
  onDelete: () => void;
  isNPC?: boolean;
}

const ATTR_MAP: Record<string, string> = {
  str: 'FOR',
  dex: 'DES',
  con: 'CON',
  int: 'INT',
  wis: 'SAB',
  cha: 'CAR'
};

const BIO_MAP: Record<string, string> = {
  traits: 'Traços de Personalidade',
  ideals: 'Ideais',
  bonds: 'Vínculos',
  flaws: 'Defeitos'
};

const AUTO_ACTIONS: Record<string, { type: 'inv' | 'spell', text: string }> = {
    'Fúria': { type: 'inv', text: '- Fúria (Bárbaro) | Dano: +2, Vantagem FOR | Resistência Físico' },
    'Ataque Descuidado': { type: 'inv', text: '- Ataque Descuidado | Efeito: Vantagem no ataque, Inimigos têm Vantagem em você' },
    'Inspiração de Bardo (d6)': { type: 'inv', text: '- Inspiração de Bardo | Dado: 1d6 | Bônus Action, 18m' },
    'Canção de Descanso (d6)': { type: 'inv', text: '- Canção de Descanso | Cura: 1d6 extra no descanso curto' },
    'Canalizar Divindade (1/descanso)': { type: 'inv', text: '- Canalizar Divindade | Uso: 1/descanso curto' },
    'Forma Selvagem': { type: 'inv', text: '- Forma Selvagem | Transformação em Besta | 2/descanso curto' },
    'Retomar o Fôlego': { type: 'inv', text: '- Retomar o Fôlego | Cura: 1d10 + Nível | Ação Bônus, 1/descanso' },
    'Surto de Ação (1)': { type: 'inv', text: '- Surto de Ação | Efeito: Ganha 1 ação extra | 1/descanso' },
    'Ki': { type: 'inv', text: '- Pontos de Ki | Recurso para habilidades de Monge' },
    'Rajada de Golpes': { type: 'inv', text: '- Rajada de Golpes (Ki) | Dano: Desarmado x2 | Ação Bônus' },
    'Cura pelas Mãos': { type: 'inv', text: '- Cura pelas Mãos | Pool: 5 x Nível PV | Toque' },
    'Destruição Divina (Smite)': { type: 'inv', text: '- Destruição Divina | Dano: 2d8 Radiante (+1d8/slot) | Ao acertar ataque' },
    'Ataque Furtivo (1d6)': { type: 'inv', text: '- Ataque Furtivo | Dano: 1d6 extra | Requer Vantagem ou Aliado 1.5m' },
    'Ação Astuta': { type: 'inv', text: '- Ação Astuta | Efeito: Dash, Disengage ou Hide como Ação Bônus' },
    'Fonte de Magia (Pontos de Feitiçaria)': { type: 'inv', text: '- Pontos de Feitiçaria | Recurso para Metamagia e Slots' },
    'Invocações Místicas': { type: 'spell', text: '[Habilidade] Invocações Místicas: Consulte suas escolhas de classe.' },
    'Recuperação Arcana': { type: 'inv', text: '- Recuperação Arcana | Efeito: Recupera slots (Nível/2) no descanso curto' },
    'Infusão de Itens': { type: 'inv', text: '- Infusões de Artífice | Melhora itens mundanos' },
};

export const CharacterSheet: React.FC<Props> = ({ char, setChar, onRoll, onDelete, isNPC = false }) => {
  const [activeTab, setActiveTab] = useState<'main' | 'spells' | 'inv' | 'bio'>('main');
  const [showWeapons, setShowWeapons] = useState(false);
  const [showArmors, setShowArmors] = useState(false);
  const [showSpells, setShowSpells] = useState(false);

  const [showLevelUp, setShowLevelUp] = useState(false);
  const [newLevelHP, setNewLevelHP] = useState(0);
  const [asiPoints, setAsiPoints] = useState<Record<string, number>>({ str: 0, dex: 0, con: 0, int: 0, wis: 0, cha: 0 });

  const [customSpell, setCustomSpell] = useState({ 
      name: '', level: 'Truque', school: 'Evocação', 
      time: '1 Ação', range: '18m', duration: 'Instantânea', desc: '' 
  });
  const [customWeapon, setCustomWeapon] = useState({ 
      name: '', dmg: '1d6', type: 'cortante', range: 'Permanece', props: '' 
  });
  
  const safeInt = (val: string) => {
      const parsed = parseInt(val);
      return isNaN(parsed) ? 0 : parsed;
  };

  const getMod = (val: number) => Math.floor((val - 10) / 2);
  const fmt = (val: number) => (val >= 0 ? "+" : "") + val;
  const profBonus = Math.ceil(1 + (char.level / 4));

  // --- AC & HP Automated System ---
  useEffect(() => {
    if (!char?.class || !char?.attributes) return;
    
    const conMod = getMod(char.attributes.con || 10);
    const dexMod = getMod(char.attributes.dex || 10);
    const wisMod = getMod(char.attributes.wis || 10);

    // AC Calculation
    let baseAc = 10;
    let dexBonus = dexMod;
    let shieldBonus = char.equippedShield ? (ARMOR_DB[char.equippedShield]?.ac || 0) : 0;
    let hasArmorDis = false;

    if (char.equippedArmor) {
        const armor = ARMOR_DB[char.equippedArmor];
        if (armor) {
            baseAc = armor.ac;
            if (armor.type === 'heavy') dexBonus = 0;
            if (armor.type === 'medium') dexBonus = Math.min(2, dexMod);
            if (armor.stealthDis) hasArmorDis = true;
        }
    } else {
        if (char.class === 'Bárbaro') baseAc = 10 + conMod;
        if (char.class === 'Monge') baseAc = 10 + wisMod;
    }

    const calculatedAC = baseAc + dexBonus + shieldBonus;

    // HP Calculation
    let calculatedHP = char.hp.max;
    if (char.autoHp) {
        const dv = CLASSES_DB[char.class]?.dv || 8;
        const level1HP = dv + conMod;
        const avgHP = (Math.floor(dv / 2) + 1) + conMod;
        calculatedHP = level1HP + ((char.level - 1) * avgHP);
        calculatedHP = Math.max(1, calculatedHP);
    }

    setChar(prev => {
        const updates: Partial<Character> = {};
        if (prev.autoAc && prev.ac !== calculatedAC) updates.ac = calculatedAC;
        else if (prev.ac === 0) updates.ac = calculatedAC;

        if (prev.autoHp && prev.hp.max !== calculatedHP) updates.hp = { ...prev.hp, max: calculatedHP };
        
        if (prev.stealthDisadvantage !== hasArmorDis) updates.stealthDisadvantage = hasArmorDis;

        const hitDieSize = CLASSES_DB[char.class]?.dv || 8;
        if (!prev.hitDice.max) updates.hitDice = { ...prev.hitDice, max: `d${hitDieSize}` };
        
        return Object.keys(updates).length > 0 ? { ...prev, ...updates } : prev;
    });
  }, [char?.class, char?.level, char?.attributes, char?.autoHp, char?.autoAc, char?.equippedArmor, char?.equippedShield]); 

  const nextLevelNum = (char.level || 0) + 1;
  const featuresAtNextLevel = CLASS_FEATURES[char.class]?.[nextLevelNum] || [];
  const isASILevel = featuresAtNextLevel.some(f => f.includes('Incremento de Atributo'));

  const updateAttr = (attr: keyof Character['attributes'], val: number) => {
    setChar({ ...char, attributes: { ...char.attributes, [attr]: val } });
  };

  const toggleSkill = (skill: string) => {
    setChar({ ...char, skills: { ...char.skills, [skill]: !char.skills[skill] } });
  };

  const toggleSave = (attr: string) => {
    setChar({ ...char, saves: { ...char.saves, [attr]: !char.saves[attr] } });
  };

  const handleBackgroundChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const bgName = e.target.value;
    const bgData = BACKGROUNDS_DB[bgName];
    let newSkills = { ...char.skills };
    let newFeatures = char.bio.features || '';
    if (bgData) {
      bgData.skills.forEach(skillId => { newSkills[skillId] = true; });
      const featureString = `[Antecedente: ${bgName}] ${bgData.feature}`;
      if (!newFeatures.includes(bgData.feature)) {
        newFeatures = newFeatures ? `${newFeatures}\n\n${featureString}` : featureString;
      }
    }
    setChar({ ...char, background: bgName, skills: newSkills, bio: { ...char.bio, features: newFeatures } });
  };

  const openLevelUp = () => {
      if (nextLevelNum > 20) { alert("Nível 20 atingido!"); return; }
      const hitDieSize = CLASSES_DB[char.class]?.dv || 8;
      const conMod = getMod(char.attributes.con);
      const avgHPGain = Math.floor(hitDieSize / 2) + 1 + conMod;
      setNewLevelHP(Math.max(1, avgHPGain));
      setAsiPoints({ str: 0, dex: 0, con: 0, int: 0, wis: 0, cha: 0 });
      setShowLevelUp(true);
  };

  const confirmLevelUp = () => {
      const features = CLASS_FEATURES[char.class]?.[nextLevelNum] || [];
      const newAttrs = { ...char.attributes };
      let spent = 0;
      Object.keys(asiPoints).forEach(k => { 
          newAttrs[k as keyof typeof newAttrs] += asiPoints[k]; 
          spent += asiPoints[k]; 
      });
      if (spent > 2) { alert("Máximo de 2 pontos."); return; }

      let featureText = char.bio.features;
      if (features.length > 0) featureText += `\n\n[Nível ${nextLevelNum}]: ` + features.join(', ');
      
      let newInventory = char.inventory;
      let newKnownSpells = char.spells.known;
      features.forEach(featName => {
          const key = Object.keys(AUTO_ACTIONS).find(k => featName.includes(k));
          if (key) {
              const action = AUTO_ACTIONS[key];
              if (action.type === 'inv' && !newInventory.includes(key)) newInventory += `\n${action.text}`; 
              else if (action.type === 'spell' && !newKnownSpells.includes(key)) newKnownSpells += `\n${action.text}`;
          }
      });

      let newHPMax = char.hp.max;
      let newHPCurrent = char.hp.current;
      if (!char.autoHp) { 
          newHPMax += newLevelHP; 
          newHPCurrent += newLevelHP; 
      } 

      setChar({ 
          ...char, 
          level: nextLevelNum, 
          hp: { ...char.hp, max: newHPMax, current: newHPCurrent }, 
          attributes: newAttrs, 
          bio: { ...char.bio, features: featureText }, 
          inventory: newInventory, 
          spells: { ...char.spells, known: newKnownSpells } 
      });
      setShowLevelUp(false);
  };

  const handleLongRest = () => {
      if(!window.confirm("Descanso Longo? (PV, Slots e Dados de Vida)")) return;
      setChar(prev => {
          const maxHP = Number(prev.hp?.max) || 1; 
          const currentHitDice = Number(prev.hitDice?.current) || 0;
          const maxHitDice = prev.level || 1; 
          const regainedHitDice = Math.max(1, Math.floor(maxHitDice / 2));
          const slots = prev.spells?.slots || [];
          const refreshedSlots = slots.map(levelSlots => Array.isArray(levelSlots) ? levelSlots.map(() => true) : []);
          return { ...prev, hp: { ...prev.hp, current: maxHP, temp: 0 }, hitDice: { ...prev.hitDice, current: Math.min(maxHitDice, currentHitDice + regainedHitDice) }, spells: { ...prev.spells, slots: refreshedSlots } };
      });
  };

  const handleShortRest = () => {
      const hdAvailable = Number(char.hitDice?.current) || 0;
      if (hdAvailable <= 0) { alert("Sem Dados de Vida."); return; }
      const maxStr = char.hitDice?.max || "d8";
      const hitDieSize = parseInt(maxStr.replace(/[^\d]/g, '')) || 8;
      const roll = Math.floor(Math.random() * hitDieSize) + 1;
      const conMod = getMod(char.attributes.con);
      const totalHeal = Math.max(0, roll + conMod);
      if(window.confirm(`Gastar 1 Dado de Vida? (1d${hitDieSize}+${conMod}=${totalHeal})`)) {
          setChar(prev => {
              const curHP = Number(prev.hp?.current) || 0;
              const maxHP = Number(prev.hp?.max) || 1;
              const curHD = Number(prev.hitDice?.current) || 0;
              return { ...prev, hp: { ...prev.hp, current: Math.min(maxHP, curHP + totalHeal) }, hitDice: { ...prev.hitDice, current: Math.max(0, curHD - 1) } };
          });
      }
  };

  const toggleSlot = (levelIdx: number, slotIdx: number) => {
      const newSlots = [...(char.spells.slots || [])];
      if (!newSlots[levelIdx]) newSlots[levelIdx] = [];
      newSlots[levelIdx][slotIdx] = !newSlots[levelIdx][slotIdx];
      setChar({ ...char, spells: { ...char.spells, slots: newSlots } });
  };

  const addSlot = (levelIdx: number) => {
      const newSlots = [...(char.spells.slots || [])];
      if (!newSlots[levelIdx]) newSlots[levelIdx] = [];
      newSlots[levelIdx].push(true);
      setChar({ ...char, spells: { ...char.spells, slots: newSlots } });
  };

  const removeSlot = (levelIdx: number) => {
      const newSlots = [...(char.spells.slots || [])];
      if (newSlots[levelIdx] && newSlots[levelIdx].length > 0) {
          newSlots[levelIdx].pop();
          setChar({ ...char, spells: { ...char.spells, slots: newSlots } });
      }
  };

  const handleSave = () => {
    const blob = new Blob([JSON.stringify(char, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${char.name || 'Hero'}_Sheet.json`;
    a.click();
  };

  const handleLoad = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const json = JSON.parse(ev.target?.result as string);
        setChar(prev => ({...prev, ...json}));
      } catch (err) { alert("Erro no carregamento."); }
    };
    reader.readAsText(file);
  };

  const toggleArmor = (armorName: string) => {
      setChar({ ...char, equippedArmor: char.equippedArmor === armorName ? undefined : armorName });
  };

  const toggleShield = () => {
      setChar({ ...char, equippedShield: char.equippedShield === "Escudo" ? undefined : "Escudo" });
  };

  const addWeaponToSheet = (w: {n: string, dmg: string, prop: string}) => {
     if (!char.inventory.includes(w.n)) setChar({ ...char, inventory: char.inventory + `\n- ${w.n} | Dano: ${w.dmg} | ${w.prop}` });
  };

  const createCustomWeapon = () => {
    if (!customWeapon.name) return;
    const entry = `\n- ${customWeapon.name} | Dano: ${customWeapon.dmg} ${customWeapon.type} | Alcance: ${customWeapon.range}, ${customWeapon.props}`;
    setChar({ ...char, inventory: char.inventory + entry, customWeapons: [...(char.customWeapons || []), { n: customWeapon.name, dmg: customWeapon.dmg, prop: customWeapon.props }] });
    setCustomWeapon({ name: '', dmg: '1d6', type: 'cortante', range: 'Permanece', props: '' });
  };

  const addSpellToSheet = (name: string, spell: {level: string, desc: string}) => {
      if (!char.spells.known.includes(name)) setChar({...char, spells: {...char.spells, known: char.spells.known + `\n[${spell.level}] ${name}: ${spell.desc}`}});
  };

  const createCustomSpell = () => {
      if (!customSpell.name) return;
      const desc = `(${customSpell.school}, ${customSpell.time}, ${customSpell.range}, ${customSpell.duration}) ${customSpell.desc}`;
      setChar({ ...char, spells: {...char.spells, known: char.spells.known + `\n[${customSpell.level}] ${customSpell.name}: ${desc}`}, customSpells: [...(char.customSpells || []), { name: customSpell.name, level: customSpell.level, desc }] });
      setCustomSpell({ name: '', level: 'Truque', school: 'Evocação', time: '1 Ação', range: '18m', duration: 'Instantânea', desc: '' });
  };

  const getAcBreakdown = () => {
      const dexMod = getMod(char.attributes.dex);
      const conMod = getMod(char.attributes.con);
      const wisMod = getMod(char.attributes.wis);
      let base = 10;
      let dexBonus = dexMod;
      let shieldBonus = char.equippedShield ? 2 : 0;
      let label = "Natural";

      if (char.equippedArmor) {
          const armor = ARMOR_DB[char.equippedArmor];
          base = armor.ac;
          label = armor.n;
          if (armor.type === 'heavy') dexBonus = 0;
          if (armor.type === 'medium') dexBonus = Math.min(2, dexMod);
      } else {
          if (char.class === 'Bárbaro') { base = 10 + conMod; label = "Defesa Sem Armadura (CON)"; }
          if (char.class === 'Monge') { base = 10 + wisMod; label = "Defesa Sem Armadura (SAB)"; }
      }

      return `${base} (${label}) + ${dexBonus} (DES) + ${shieldBonus} (Escudo) = ${base + dexBonus + shieldBonus}`;
  };

  const allWeapons = [...COMMON_WEAPONS, ...(char.customWeapons || [])];
  const allSpells = [...(Object.entries(SPELLS_DB) as [string, {level: string, desc: string}][]).map(([n, s]) => ({name: n, ...s})), ...(char.customSpells || [])];

  return (
    <div className="bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-200 p-6 rounded-xl shadow-2xl max-w-6xl mx-auto border border-stone-200 dark:border-stone-800 relative">
      {/* Level Up Modal */}
      {showLevelUp && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
              <div className="bg-stone-100 dark:bg-stone-900 border border-amber-500 rounded-2xl w-full max-w-lg p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto">
                  <h3 className="text-3xl font-bold text-amber-600 mb-4 font-cinzel flex items-center gap-3"><ArrowUpCircle size={32}/> Ascender ao Nível {nextLevelNum}</h3>
                  <div className="space-y-6 mb-8">
                      <div className="bg-stone-200 dark:bg-stone-800 p-4 rounded-xl border border-stone-300 dark:border-stone-700 shadow-inner">
                          <label className="block text-xs font-bold text-stone-500 uppercase mb-2">PV Extra</label>
                          {char.autoHp ? <div className="text-sm font-bold text-green-600">Calculado automaticamente (Média Fixa).</div> : <input type="number" className="w-full text-center font-bold text-3xl p-2 rounded-lg bg-white dark:bg-black border border-stone-400" value={newLevelHP} onChange={e => setNewLevelHP(safeInt(e.target.value))} />}
                      </div>
                      {isASILevel && (
                          <div className="bg-stone-200 dark:bg-stone-800 p-4 rounded-xl border border-stone-300 dark:border-stone-700 shadow-inner">
                             <label className="block text-xs font-bold text-stone-500 uppercase mb-3">Incremento de Atributo (+2 Pontos)</label>
                             <div className="grid grid-cols-3 gap-3">
                                 {Object.keys(asiPoints).map(attr => (
                                     <div key={attr} className="flex flex-col items-center bg-white dark:bg-black p-2 rounded-lg border border-stone-500">
                                         <span className="font-bold uppercase text-[10px] text-stone-500">{attr}</span>
                                         <div className="flex items-center gap-2 mt-1">
                                             <button onClick={() => setAsiPoints({...asiPoints, [attr]: Math.max(0, asiPoints[attr]-1)})} className="w-6 h-6 bg-stone-300 dark:bg-stone-700 rounded-full font-bold">-</button>
                                             <span className="font-bold text-lg text-amber-600">{asiPoints[attr]}</span>
                                             <button onClick={() => setAsiPoints({...asiPoints, [attr]: asiPoints[attr]+1})} className="w-6 h-6 bg-amber-500 text-white rounded-full font-bold">+</button>
                                         </div>
                                     </div>
                                 ))}
                             </div>
                          </div>
                      )}
                  </div>
                  <div className="flex justify-end gap-3 pt-4 border-t border-stone-300 dark:border-stone-700">
                      <button onClick={() => setShowLevelUp(false)} className="px-5 py-2 text-stone-500 font-bold hover:text-stone-300 transition-colors">Abortar</button>
                      <button onClick={confirmLevelUp} className="px-8 py-3 bg-amber-600 hover:bg-amber-500 text-white font-black rounded-xl shadow-lg transition-all active:scale-95">CONFIRMAR EVOLUÇÃO</button>
                  </div>
              </div>
          </div>
      )}

      {/* Header Info */}
      <div className="flex flex-col gap-4 mb-6 border-b border-stone-300 dark:border-stone-700 pb-4">
        <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 flex gap-2">
                <input className="flex-1 text-4xl font-bold bg-transparent border-b border-stone-400 w-full focus:outline-none focus:border-amber-500 font-cinzel tracking-tight" value={char.name} onChange={(e) => setChar({ ...char, name: e.target.value })} placeholder="Nome do Herói" />
                <button onClick={onDelete} className="p-2 text-stone-400 hover:text-red-500 transition-colors"><Trash2 size={24} /></button>
            </div>
            <div className="flex items-center gap-4">
               <div className="flex gap-2">
                   <button onClick={handleShortRest} className="flex flex-col items-center p-2.5 bg-stone-100 dark:bg-stone-800 rounded-xl border border-stone-300 dark:border-stone-600 hover:bg-amber-600/10 group transition-all"><Heart size={18} className="text-red-500 group-hover:scale-110 transition-transform"/><span className="text-[10px] font-black uppercase mt-1">CURTO</span></button>
                   <button onClick={handleLongRest} className="flex flex-col items-center p-2.5 bg-stone-100 dark:bg-stone-800 rounded-xl border border-stone-300 dark:border-stone-600 hover:bg-indigo-600/10 group transition-all"><Moon size={18} className="text-indigo-500 group-hover:scale-110 transition-transform"/><span className="text-[10px] font-black uppercase mt-1">LONGO</span></button>
               </div>
               <div className="text-right hidden md:block border-l pl-4 border-stone-300 dark:border-stone-700">
                  <div className="text-[10px] font-black text-stone-500 uppercase tracking-widest">Proficiência</div>
                  <div className="text-4xl font-black text-amber-600">+{profBonus}</div>
               </div>
            </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 text-sm">
          <div><label className="block text-stone-500 text-[10px] uppercase font-black tracking-wider">Classe</label><select className="w-full bg-stone-100 dark:bg-stone-800 rounded-lg p-1.5 border-b-2 border-stone-300 dark:border-stone-700 focus:border-amber-500 outline-none" value={char.class} onChange={(e) => setChar({ ...char, class: e.target.value, subclass: '' })}>{Object.keys(CLASSES_DB).map(c => <option key={c} value={c}>{c}</option>)}</select></div>
          <div><label className="block text-stone-500 text-[10px] uppercase font-black tracking-wider">Subclasse</label><select className="w-full bg-stone-100 dark:bg-stone-800 rounded-lg p-1.5 border-b-2 border-stone-300 dark:border-stone-700 focus:border-amber-500 outline-none" value={char.subclass} onChange={(e) => setChar({ ...char, subclass: e.target.value })} disabled={!char.class || !CLASSES_DB[char.class]?.sub}><option value="">-</option>{char.class && CLASSES_DB[char.class]?.sub.map(s => <option key={s} value={s}>{s}</option>)}</select></div>
          <div><label className="block text-stone-500 text-[10px] uppercase font-black tracking-wider">Raça</label><select className="w-full bg-stone-100 dark:bg-stone-800 rounded-lg p-1.5 border-b-2 border-stone-300 dark:border-stone-700 focus:border-amber-500 outline-none" value={char.race} onChange={(e) => setChar({ ...char, race: e.target.value })}>{RACES_LIST.map(r => <option key={r} value={r}>{r}</option>)}</select></div>
          <div><label className="block text-stone-500 text-[10px] uppercase font-black tracking-wider">Antecedente</label><select className="w-full bg-stone-100 dark:bg-stone-800 rounded-lg p-1.5 border-b-2 border-stone-300 dark:border-stone-700 focus:border-amber-500 outline-none" value={char.background} onChange={handleBackgroundChange}>{Object.keys(BACKGROUNDS_DB).map(b => <option key={b} value={b}>{b}</option>)}</select></div>
          <div><label className="block text-stone-500 text-[10px] uppercase font-black tracking-wider">Alinhamento</label><input className="w-full bg-stone-100 dark:bg-stone-800 rounded-lg p-1.5 border-b-2 border-stone-300 dark:border-stone-700 focus:border-amber-500 outline-none" value={char.alignment} onChange={(e) => setChar({...char, alignment: e.target.value})} /></div>
          <div className="flex gap-2"><div className="w-16 relative"><label className="block text-stone-500 text-[10px] uppercase font-black tracking-wider">Nível</label><input type="number" className="w-full bg-stone-100 dark:bg-stone-800 rounded-lg p-1.5 text-center font-black" value={char.level} onChange={(e) => setChar({ ...char, level: safeInt(e.target.value) || 1 })}/><button onClick={openLevelUp} className="absolute -right-2 -top-2 bg-amber-500 text-stone-950 rounded-full w-6 h-6 flex items-center justify-center shadow-xl animate-pulse font-black text-xs hover:bg-amber-400 transition-colors"><ArrowUpCircle size={16} /></button></div><div className="flex-1"><label className="block text-stone-500 text-[10px] uppercase font-black tracking-wider">XP</label><input type="number" className="w-full bg-stone-100 dark:bg-stone-800 rounded-lg p-1.5 text-right font-mono text-xs" value={char.xp} onChange={(e) => setChar({ ...char, xp: safeInt(e.target.value) })} /></div></div>
        </div>
      </div>

      <div className="flex gap-2 mb-6 border-b border-stone-300 dark:border-stone-700 overflow-x-auto">
        {[{ id: 'main', icon: Sword, label: 'Personagem' }, { id: 'spells', icon: Zap, label: 'Magias' }, { id: 'inv', icon: Backpack, label: 'Itens' }, { id: 'bio', icon: Scroll, label: 'História' }].map((tab) => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={`flex items-center gap-2 px-6 py-3 text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === tab.id ? 'border-b-4 border-amber-600 text-amber-600 bg-amber-600/5' : 'text-stone-500 hover:text-stone-300 hover:bg-stone-800/20'}`}><tab.icon size={16} /> {tab.label}</button>
        ))}
        <div className="flex-1" />
        <button onClick={handleSave} className="p-2 text-stone-500 hover:text-amber-500 transition-colors" title="Exportar Ficha"><Save size={20} /></button>
        <label className="p-2 text-stone-500 hover:text-amber-500 cursor-pointer transition-colors" title="Importar Ficha"><Upload size={20} /><input type="file" hidden onChange={handleLoad} accept=".json" /></label>
      </div>

      {activeTab === 'main' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Attributes Column */}
          <div className="space-y-4">
            {Object.entries(char.attributes).map(([key, val]) => {
              const mod = getMod(val as number);
              return (
                <div key={key} className="flex items-center bg-stone-50 dark:bg-stone-850 p-3 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-md relative overflow-hidden group hover:border-amber-600/50 transition-colors">
                  <div className="w-16 text-center z-10 border-r border-stone-200 dark:border-stone-800 mr-4 pr-2">
                    <div className="text-[10px] font-black uppercase text-stone-500 tracking-widest mb-1">{ATTR_MAP[key] || key}</div>
                    <div className="text-3xl font-black text-stone-900 dark:text-stone-100">{fmt(mod)}</div>
                  </div>
                  <div className="flex flex-col gap-1">
                      <label className="text-[9px] font-black text-stone-500 uppercase tracking-widest">Valor</label>
                      <input type="number" className="w-14 text-center bg-white dark:bg-stone-950 border border-stone-300 dark:border-stone-800 rounded-lg py-1 font-bold focus:border-amber-500 outline-none" value={val as number} onChange={(e) => updateAttr(key as any, safeInt(e.target.value) || 10)} />
                  </div>
                  <button onClick={() => onRoll(20, mod, `Teste de ${ATTR_MAP[key] || key}`)} className="ml-auto w-12 h-12 bg-stone-200 dark:bg-stone-800 rounded-xl hover:bg-amber-600 hover:text-white flex items-center justify-center shadow-inner transition-all group-hover:scale-105 active:scale-95"><div className="text-xs font-black">d20</div></button>
                  <div className="absolute top-0 left-0 w-1 h-full bg-amber-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </div>
              );
            })}
             <div className="mt-6 p-4 bg-stone-50 dark:bg-stone-850 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-md">
                <div className="flex justify-between items-center mb-3">
                    <span className="text-[10px] font-black uppercase text-stone-500 tracking-widest">Nível de Exaustão</span>
                    <span className="font-mono text-2xl font-black text-red-600">{char.exhaustion || 0}</span>
                </div>
                <div className="flex gap-1.5 h-3">
                    {[1,2,3,4,5,6].map(lvl => (
                        <button key={lvl} onClick={() => setChar(prev => ({...prev, exhaustion: prev.exhaustion === lvl ? lvl - 1 : lvl}))} className={`flex-1 rounded-full transition-all duration-300 ${char.exhaustion && char.exhaustion >= lvl ? 'bg-red-600 shadow-[0_0_10px_rgba(220,38,38,0.5)]' : 'bg-stone-300 dark:bg-stone-700'}`}/>
                    ))}
                </div>
            </div>
          </div>

          <div className="space-y-6">
             <div className="bg-stone-50 dark:bg-stone-850 p-4 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-md">
              <h3 className="font-black text-[10px] uppercase mb-4 text-stone-500 text-center tracking-[4px] flex items-center justify-center gap-2"><Shield size={14}/> TESTES DE RESISTÊNCIA</h3>
              <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                {Object.keys(char.attributes).map(attr => {
                   const mod = getMod(char.attributes[attr as keyof typeof char.attributes]) + (char.saves[attr] ? profBonus : 0);
                   return (
                     <div key={attr} className="flex items-center text-sm group cursor-pointer hover:bg-stone-200 dark:hover:bg-stone-800 p-1.5 rounded-lg transition-colors" onClick={() => onRoll(20, mod, `Resistência de ${ATTR_MAP[attr]}`)}>
                       <input type="checkbox" checked={char.saves[attr] || false} onChange={(e) => {e.stopPropagation(); toggleSave(attr)}} className="mr-3 accent-amber-600 w-4 h-4 cursor-pointer" />
                       <span className="uppercase text-[11px] font-black text-stone-600 dark:text-stone-400 tracking-wider">{ATTR_MAP[attr] || attr}</span>
                       <span className={`font-mono ml-auto font-black text-lg ${char.saves[attr] ? 'text-amber-500' : ''}`}>{fmt(mod)}</span>
                     </div>
                   )
                })}
              </div>
            </div>

            <div className="bg-stone-50 dark:bg-stone-850 p-4 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-md flex flex-col flex-1">
               <h3 className="font-black text-[10px] uppercase mb-4 text-stone-500 text-center tracking-[4px] flex items-center justify-center gap-2"><Brain size={14}/> PERÍCIAS ATIVAS</h3>
               <div className="flex-1 overflow-y-auto pr-2 space-y-1.5 custom-scrollbar max-h-[450px]">
                 {SKILL_LIST.map(skill => {
                   const attrVal = char.attributes[skill.a as keyof typeof char.attributes];
                   const mod = getMod(attrVal) + (char.skills[skill.id] ? profBonus : 0);
                   const isStealth = skill.id === 'furtividade';
                   return (
                     <div key={skill.id} className="flex items-center text-sm p-2 hover:bg-stone-200 dark:hover:bg-stone-800 rounded-xl cursor-pointer group transition-all" onClick={() => onRoll(20, mod, skill.n)}>
                       <input type="checkbox" checked={char.skills[skill.id] || false} onChange={(e) => { e.stopPropagation(); toggleSkill(skill.id); }} className="mr-3 accent-amber-600 w-4 h-4 cursor-pointer" />
                       <span className="flex-1 truncate text-stone-700 dark:text-stone-300 font-bold group-hover:text-amber-500">
                        {skill.n} <span className="text-[10px] text-stone-500 font-normal uppercase ml-1">({ATTR_MAP[skill.a] || skill.a})</span>
                        {isStealth && char.stealthDisadvantage && <span className="ml-2 text-red-500 inline-block animate-pulse" title="Desvantagem por Armadura"><AlertTriangle size={12}/></span>}
                       </span>
                       <span className={`font-mono font-black text-lg ${char.skills[skill.id] ? 'text-amber-600' : 'text-stone-500'}`}>{fmt(mod)}</span>
                     </div>
                   );
                 })}
               </div>
            </div>
          </div>

          <div className="space-y-6">
             <div className="grid grid-cols-3 gap-3 text-center">
               <div className="bg-stone-50 dark:bg-stone-850 p-3 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-md relative group hover:border-amber-500 transition-colors">
                  <div className="flex flex-col items-center gap-1 mb-1">
                      <div className="text-[10px] font-black text-stone-500 uppercase tracking-widest">CA</div>
                      <label className="flex items-center gap-1 cursor-pointer scale-90" title="Auto-cálculo de Defesa">
                        <input type="checkbox" checked={char.autoAc || false} onChange={(e) => setChar({...char, autoAc: e.target.checked})} className="accent-blue-600" />
                        <span className="text-[9px] font-black text-stone-500">AUTO</span>
                      </label>
                  </div>
                  <Shield size={40} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-stone-200 dark:text-stone-800 opacity-30 group-hover:scale-110 transition-transform" />
                  <input type="number" className={`relative font-black text-3xl z-10 w-full bg-transparent text-center focus:outline-none ${char.autoAc ? 'text-blue-500' : ''}`} value={char.ac} readOnly={char.autoAc} onChange={e => setChar({...char, ac: safeInt(e.target.value) || 10})} />
                  {char.autoAc && (
                      <div className="absolute bottom-full left-0 w-max max-w-[200px] mb-2 hidden group-hover:block z-50 bg-stone-900 border border-amber-600/50 p-2.5 rounded-xl text-[10px] text-stone-300 shadow-2xl leading-tight">
                          <div className="font-black text-amber-500 mb-1 border-b border-stone-800 pb-1 uppercase">Cálculo de Defesa</div>
                          {getAcBreakdown()}
                      </div>
                  )}
               </div>
               <div className="bg-stone-50 dark:bg-stone-850 p-3 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-md cursor-pointer hover:border-amber-500 group transition-all" onClick={() => onRoll(20, getMod(char.attributes.dex), "Iniciativa")}>
                  <div className="text-[10px] font-black text-stone-500 uppercase tracking-widest mb-1">Iniciativa</div>
                  <div className="text-3xl font-black text-amber-600 group-hover:scale-110 transition-transform">{fmt(getMod(char.attributes.dex))}</div>
                  <div className="text-[9px] text-stone-500 font-bold">(DES)</div>
               </div>
               <div className="bg-stone-50 dark:bg-stone-850 p-3 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-md">
                  <div className="text-[10px] font-black text-stone-500 uppercase tracking-widest mb-1">Desloc.</div>
                  <input type="text" className="w-full bg-transparent text-center font-black text-2xl focus:outline-none text-stone-900 dark:text-stone-100" value={char.speed} onChange={e => setChar({...char, speed: e.target.value})} />
                  <div className="text-[9px] text-stone-500 font-bold">METROS</div>
               </div>
             </div>

             <div className="bg-stone-50 dark:bg-stone-850 p-5 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-xl overflow-hidden relative">
                <div className="flex justify-between items-start mb-4">
                   <div className="flex items-center gap-2">
                        <div className="p-2 bg-red-600/20 rounded-xl"><Heart size={20} className="text-red-500" /></div>
                        <div className="flex flex-col">
                            <span className="font-black text-xs text-stone-500 uppercase tracking-tighter">Pontos de Vida</span>
                            <div className="flex items-center gap-2">
                                <label className="flex items-center gap-1 cursor-pointer" title="Auto HP por Nível (Média)">
                                    <input type="checkbox" checked={char.autoHp || false} onChange={(e) => setChar({...char, autoHp: e.target.checked})} className="accent-red-600" />
                                    <span className="text-[9px] font-black text-stone-500">FIXO</span>
                                </label>
                            </div>
                        </div>
                   </div>
                   <div className="flex items-center gap-2 bg-stone-100 dark:bg-stone-950 px-3 py-1 rounded-full border border-stone-200 dark:border-stone-800">
                        <span className="text-[10px] font-black text-stone-500">MÁX:</span>
                        <input type="number" className={`w-10 bg-transparent text-center font-black text-sm focus:outline-none ${char.autoHp ? 'text-stone-500 cursor-not-allowed' : 'text-stone-300'}`} value={char.hp.max} readOnly={char.autoHp} onChange={(e) => !char.autoHp && setChar({...char, hp: {...char.hp, max: safeInt(e.target.value)}})} />
                   </div>
                </div>
                
                <input type="number" className="w-full text-center text-6xl font-black bg-transparent text-red-600 focus:outline-none mb-4 selection:bg-red-900/30" value={char.hp.current} onChange={e => setChar({...char, hp: {...char.hp, current: safeInt(e.target.value)}})} />
                
                <div className="w-full bg-stone-200 dark:bg-stone-950 h-5 rounded-full overflow-hidden shadow-inner p-1 border border-stone-300 dark:border-stone-800">
                  <div className="bg-gradient-to-r from-red-700 via-red-500 to-red-600 h-full rounded-full transition-all duration-700 ease-out relative" style={{width: `${Math.min(100, Math.max(0, (char.hp.current / char.hp.max) * 100))}%`}}>
                      <div className="absolute top-0 right-0 h-full w-4 bg-white/20 blur-sm"></div>
                  </div>
                </div>
                
                <div className="mt-6 flex items-center gap-3 bg-blue-600/5 p-3 rounded-2xl border border-blue-600/20">
                    <BatteryCharging size={18} className="text-blue-500" />
                    <span className="text-[10px] font-black text-blue-500/80 uppercase tracking-widest">HP TEMPORÁRIO</span>
                    <input type="number" className="flex-1 bg-white dark:bg-stone-950 border border-blue-600/30 rounded-xl px-3 py-1 text-center text-blue-500 font-black text-xl outline-none focus:ring-2 ring-blue-500/20" value={char.hp.temp} onChange={e => setChar({...char, hp: {...char.hp, temp: safeInt(e.target.value)}})} />
                </div>
             </div>
             
             <div className="grid grid-cols-2 gap-4">
                 <div className="bg-stone-50 dark:bg-stone-850 p-4 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-md">
                    <div className="text-[10px] font-black text-stone-500 uppercase text-center mb-3 tracking-widest flex items-center justify-center gap-2"><Zap size={12}/> Dados de Vida</div>
                    <div className="flex items-center justify-center gap-2">
                        <input type="number" className="w-10 text-center bg-white dark:bg-stone-950 border border-stone-800 rounded-lg py-1 font-black text-lg focus:border-amber-500 outline-none" value={char.hitDice.current} onChange={(e) => setChar({...char, hitDice: {...char.hitDice, current: safeInt(e.target.value)}})}/>
                        <span className="text-stone-500 font-black text-xl">/</span>
                        <input type="text" className="w-12 text-center bg-white dark:bg-stone-950 border border-stone-800 rounded-lg py-1 font-black text-sm text-stone-400 outline-none" value={char.hitDice.max} onChange={(e) => setChar({...char, hitDice: {...char.hitDice, max: e.target.value}})}/>
                    </div>
                 </div>
                 <div className="bg-stone-50 dark:bg-stone-850 p-4 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-md">
                    <div className="text-[10px] font-black text-stone-500 uppercase text-center mb-3 tracking-widest flex items-center justify-center gap-2"><Skull size={12}/> Salvaguardas</div>
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center justify-between px-2">
                            <span className="text-[10px] font-black text-green-500 uppercase">SUC</span>
                            <div className="flex gap-1">
                                {[1,2,3].map(i => (<input key={i} type="checkbox" className="accent-green-600 w-4 h-4 rounded-full" checked={char.deathSaves.successes >= i} onChange={() => setChar({...char, deathSaves: {...char.deathSaves, successes: char.deathSaves.successes >= i ? i - 1 : i}})}/>))}
                            </div>
                        </div>
                        <div className="flex items-center justify-between px-2">
                            <span className="text-[10px] font-black text-red-500 uppercase">FAL</span>
                            <div className="flex gap-1">
                                {[1,2,3].map(i => (<input key={i} type="checkbox" className="accent-red-600 w-4 h-4 rounded-full" checked={char.deathSaves.failures >= i} onChange={() => setChar({...char, deathSaves: {...char.deathSaves, failures: char.deathSaves.failures >= i ? i - 1 : i}})}/>))}
                            </div>
                        </div>
                    </div>
                 </div>
             </div>

             <div className="bg-stone-900 p-5 rounded-3xl border border-amber-600/30 h-48 flex flex-col shadow-2xl">
                <div className="text-[10px] font-black text-amber-500 uppercase mb-3 border-b border-stone-800 pb-2 tracking-[2px] flex items-center gap-2"><Calculator size={14}/> RESUMO DE COMBATE</div>
                <textarea className="w-full flex-1 bg-transparent resize-none text-xs p-1 focus:outline-none font-mono leading-relaxed text-amber-200/80" placeholder="Equipe itens no inventário..." value={(char.equippedArmor ? `[🛡️ ARMADURA] ${char.equippedArmor}\n` : '') + (char.equippedShield ? `[🛡️ ESCUDO] ${char.equippedShield}\n` : '') + char.inventory.split('\n').filter(l => l.startsWith('-')).join('\n')} readOnly />
                <div className="mt-2 text-[9px] text-stone-500 italic">Preenchido automaticamente pelo arsenal.</div>
             </div>
          </div>
        </div>
      )}

      {activeTab === 'spells' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
           <div className="space-y-6">
             <div className="bg-stone-100 dark:bg-stone-850 p-6 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-lg text-center">
                <label className="block text-stone-500 text-[10px] uppercase font-black tracking-[2px] mb-4">Mecanismo de Conjuração</label>
                <div className="flex gap-4 mb-6">
                    <select className="flex-1 bg-white dark:bg-stone-950 border-2 border-stone-200 dark:border-stone-800 p-2.5 rounded-xl font-bold outline-none focus:border-purple-600 transition-colors" value={char.spells.castingStat} onChange={e => setChar({...char, spells: {...char.spells, castingStat: e.target.value}})}>
                      <option value="int">Inteligência (INT)</option>
                      <option value="wis">Sabedoria (SAB)</option>
                      <option value="cha">Carisma (CAR)</option>
                    </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                   <div className="bg-white dark:bg-stone-950 p-4 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-inner">
                     <div className="text-[10px] text-stone-500 font-black uppercase mb-1">CD de Magia</div>
                     <div className="text-4xl font-black text-purple-600">{8 + profBonus + getMod(char.attributes[char.spells.castingStat as keyof typeof char.attributes] || 10)}</div>
                   </div>
                   <div className="bg-white dark:bg-stone-950 p-4 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-inner">
                     <div className="text-[10px] text-stone-500 font-black uppercase mb-1">Ataque Mágico</div>
                     <div className="text-4xl font-black text-purple-600">{fmt(profBonus + getMod(char.attributes[char.spells.castingStat as keyof typeof char.attributes] || 10))}</div>
                   </div>
                </div>
             </div>

             <div className="bg-stone-50 dark:bg-stone-850 p-5 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-md">
                <h4 className="font-black text-[10px] uppercase text-stone-500 mb-4 border-b border-stone-200 dark:border-stone-800 pb-2 tracking-widest flex items-center gap-2"><Sparkles size={14}/> RESERVA DE SLOTS</h4>
                <div className="space-y-2">
                    {[1,2,3,4,5,6,7,8,9].map(lvl => { 
                        const slots = (char.spells.slots && char.spells.slots[lvl]) || []; 
                        return (
                            <div key={lvl} className="flex items-center gap-4 bg-white dark:bg-stone-950 p-2 rounded-xl border border-stone-200 dark:border-stone-800">
                                <div className="w-20 font-black text-[10px] text-stone-400 uppercase tracking-tighter">Nível {lvl}</div>
                                <div className="flex-1 flex gap-1.5 flex-wrap">
                                    {slots.map((ready, i) => (
                                        <button key={i} onClick={() => toggleSlot(lvl, i)} className={`w-7 h-7 rounded-lg border-2 flex items-center justify-center transition-all ${ready ? 'bg-purple-600 border-purple-400 text-white shadow-[0_0_12px_rgba(147,51,234,0.4)]' : 'bg-stone-200 dark:bg-stone-900 border-stone-400 dark:border-stone-700 text-stone-500 opacity-40'}`}>
                                            {ready ? <Zap size={14} className="fill-current"/> : <div className="w-1 h-1 bg-stone-400 rounded-full"/>}
                                        </button>
                                    ))}
                                    <div className="flex gap-1 ml-auto">
                                        <button onClick={() => addSlot(lvl)} className="w-7 h-7 rounded-lg border border-stone-400 text-stone-400 hover:text-green-500 hover:border-green-500 transition-colors flex items-center justify-center"><Plus size={14}/></button>
                                        <button onClick={() => removeSlot(lvl)} className="w-7 h-7 rounded-lg border border-stone-400 text-stone-400 hover:text-red-500 hover:border-red-500 transition-colors flex items-center justify-center"><Trash2 size={12}/></button>
                                    </div>
                                </div>
                            </div>
                        ); 
                    })}
                </div>
             </div>

             <div className="bg-stone-900 border-2 border-purple-600/30 rounded-3xl p-5 shadow-2xl space-y-4">
                <h4 className="font-black text-purple-400 text-sm mb-2 flex items-center gap-2 uppercase tracking-widest"><Plus size={16}/> Teclado de Criação Arcana</h4>
                <div className="flex gap-2">
                    <input className="flex-[2] bg-stone-950 border border-stone-800 p-2.5 rounded-xl text-sm focus:border-purple-600 outline-none" placeholder="Nome da Magia" value={customSpell.name} onChange={e => setCustomSpell({...customSpell, name: e.target.value})} />
                    <select className="flex-1 bg-stone-950 border border-stone-800 p-2.5 rounded-xl text-sm focus:border-purple-600 outline-none" value={customSpell.level} onChange={e => setCustomSpell({...customSpell, level: e.target.value})}>{['Truque', '1º Nível', '2º Nível', '3º Nível', '4º Nível', '5º Nível', '6º Nível', '7º Nível', '8º Nível', '9º Nível'].map(l => <option key={l} value={l}>{l}</option>)}</select>
                </div>
                <div className="grid grid-cols-2 gap-2">
                    <select className="bg-stone-950 border border-stone-800 p-2 rounded-xl text-xs outline-none" value={customSpell.school} onChange={e => setCustomSpell({...customSpell, school: e.target.value})}>{['Abjuração', 'Adivinhação', 'Conjuração', 'Encantamento', 'Evocação', 'Ilusão', 'Necromancia', 'Transmutação'].map(s => <option key={s} value={s}>{s}</option>)}</select>
                    <input className="bg-stone-950 border border-stone-800 p-2 rounded-xl text-xs outline-none" placeholder="Tempo (ex: 1 Ação)" value={customSpell.time} onChange={e => setCustomSpell({...customSpell, time: e.target.value})} />
                </div>
                <textarea className="w-full bg-stone-950 border border-stone-800 p-3 rounded-2xl text-sm h-24 resize-none outline-none focus:border-purple-600" placeholder="Efeitos e Danos..." value={customSpell.desc} onChange={e => setCustomSpell({...customSpell, desc: e.target.value})} />
                <button onClick={createCustomSpell} className="w-full bg-purple-700 hover:bg-purple-600 text-white p-3 rounded-2xl font-black text-xs shadow-lg uppercase tracking-widest transition-all active:scale-95">GRAVAR NO GRIMÓRIO</button>
             </div>
           </div>

           <div className="flex flex-col h-full">
             <div className="flex items-center justify-between mb-4">
                <h3 className="font-cinzel text-xl font-bold text-stone-400 border-b-2 border-amber-600/30 pb-1">GRIMÓRIO CONHECIDO</h3>
                <button onClick={() => setShowSpells(!showSpells)} className="px-4 py-2 bg-stone-800 hover:bg-stone-700 rounded-xl text-[10px] font-black text-stone-400 uppercase tracking-widest flex items-center gap-2 border border-stone-700">Bibliotecário {showSpells ? <ChevronDown size={14}/> : <ChevronRight size={14}/>}</button>
             </div>
             
             {showSpells && (
                 <div className="mb-4 h-64 overflow-y-auto bg-stone-100 dark:bg-black border border-stone-200 dark:border-stone-800 rounded-2xl p-3 custom-scrollbar shadow-inner">
                     <div className="grid grid-cols-1 gap-2">
                        {allSpells.map((s, i) => (
                            <div key={i} className="flex justify-between items-center p-2 hover:bg-stone-200 dark:hover:bg-stone-900 rounded-xl group border border-transparent hover:border-purple-600/30">
                                <div className="text-xs">
                                    <div className="font-black text-purple-600 dark:text-purple-400 uppercase tracking-tight">{s.name}</div>
                                    <div className="text-[9px] text-stone-500 font-bold">{s.level} • {s.desc.substring(0, 40)}...</div>
                                </div>
                                <button onClick={() => addSpellToSheet(s.name, s)} className="w-8 h-8 bg-stone-200 dark:bg-stone-800 rounded-lg text-stone-400 hover:bg-green-600 hover:text-white flex items-center justify-center transition-all"><Plus size={18}/></button>
                            </div>
                        ))}
                     </div>
                 </div>
             )}
             
             <textarea className="w-full flex-1 bg-stone-50 dark:bg-stone-850 p-4 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-inner font-mono text-sm leading-relaxed focus:ring-2 ring-purple-600/20 outline-none" placeholder="Magias serão listadas aqui..." value={char.spells.known} onChange={e => setChar({...char, spells: {...char.spells, known: e.target.value}})} />
           </div>
        </div>
      )}

      {activeTab === 'inv' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            {!isNPC && (
                <div className="bg-stone-100 dark:bg-stone-850 p-5 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-lg">
                    <h3 className="font-black text-[10px] text-amber-600 mb-4 uppercase tracking-[4px] text-center">TESOURO & MOEDAS</h3>
                    <div className="grid grid-cols-5 gap-3 text-center">
                    {['pc','pp','pe','po','pl'].map((label, i) => {
                        const keys = ['cp','sp','ep','gp','pp'];
                        return (
                        <div key={label} className="flex flex-col gap-1">
                            <label className="block text-stone-500 uppercase font-black text-[10px] tracking-widest">{label}</label>
                            <input type="number" className="w-full text-center bg-white dark:bg-stone-950 border-2 border-stone-200 dark:border-stone-800 p-2 rounded-xl font-black text-stone-900 dark:text-stone-100 focus:border-amber-500 outline-none transition-all" value={char.wallet[keys[i] as keyof typeof char.wallet]} onChange={(e) => setChar({...char, wallet: {...char.wallet, [keys[i]]: safeInt(e.target.value)}})} />
                        </div>
                        )
                    })}
                    </div>
                </div>
            )}

            {/* Equipment and Defense Sub-Tab */}
            <div className="bg-stone-50 dark:bg-stone-850 p-5 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-md">
                <div className="flex items-center justify-between mb-4 border-b border-stone-200 dark:border-stone-800 pb-2">
                    <h3 className="font-black text-[10px] text-blue-600 uppercase tracking-[4px] flex items-center gap-2"><Shield size={14}/> DEFESA & ARMADURAS</h3>
                    <button onClick={() => setShowArmors(!showArmors)} className="text-[9px] font-black text-stone-500 hover:text-stone-300 uppercase tracking-widest px-3 py-1 bg-stone-100 dark:bg-stone-800 rounded-full border border-stone-700">{showArmors ? 'FECHAR ARSENAL' : 'ABRIR ARSENAL'}</button>
                </div>
                
                {showArmors && (
                    <div className="h-64 overflow-y-auto bg-white dark:bg-stone-950 rounded-2xl border border-stone-200 dark:border-stone-800 p-3 custom-scrollbar mb-4 shadow-inner">
                        {Object.values(ARMOR_DB).map((armor) => {
                            const isEquipped = char.equippedArmor === armor.n || char.equippedShield === armor.n;
                            return (
                                <div key={armor.n} className="flex justify-between items-center p-2.5 hover:bg-stone-50 dark:hover:bg-stone-900 rounded-xl group mb-1 border border-transparent hover:border-blue-600/30 transition-all">
                                    <div className="text-xs">
                                        <div className="font-black text-blue-600 dark:text-blue-400 uppercase">{armor.n}</div>
                                        <div className="text-[9px] text-stone-500 font-bold uppercase tracking-tighter">
                                            {armor.type === 'shield' ? `+${armor.ac} CA` : `Base ${armor.ac} CA`} • {armor.type}
                                            {armor.stealthDis && <span className="ml-2 text-red-500">❌ FURTIVIDADE</span>}
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => armor.type === 'shield' ? toggleShield() : toggleArmor(armor.n)}
                                        className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase transition-all shadow-md active:scale-95 ${isEquipped ? 'bg-red-600 hover:bg-red-500 text-white' : 'bg-blue-600 hover:bg-blue-500 text-white'}`}
                                    >
                                        {isEquipped ? 'Remover' : 'Equipar'}
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                )}
                
                <div className="space-y-3">
                    {char.equippedArmor && (
                        <div className="flex justify-between items-center bg-blue-600/5 p-3 rounded-2xl border border-blue-600/30">
                            <div>
                                <div className="text-[9px] text-stone-500 font-black uppercase tracking-widest mb-0.5">Armadura Ativa</div>
                                <div className="font-black text-blue-400">{char.equippedArmor}</div>
                            </div>
                            <button onClick={() => toggleArmor(char.equippedArmor!)} className="w-8 h-8 bg-red-600/20 text-red-500 rounded-xl hover:bg-red-600 hover:text-white flex items-center justify-center transition-all"><Trash2 size={16}/></button>
                        </div>
                    )}
                    {char.equippedShield && (
                        <div className="flex justify-between items-center bg-blue-600/5 p-3 rounded-2xl border border-blue-600/30">
                            <div>
                                <div className="text-[9px] text-stone-500 font-black uppercase tracking-widest mb-0.5">Escudo Ativo</div>
                                <div className="font-black text-blue-400">+2 Classe de Armadura</div>
                            </div>
                            <button onClick={() => toggleShield()} className="w-8 h-8 bg-red-600/20 text-red-500 rounded-xl hover:bg-red-600 hover:text-white flex items-center justify-center transition-all"><Trash2 size={16}/></button>
                        </div>
                    )}
                    {!char.equippedArmor && !char.equippedShield && <div className="text-center py-4 border-2 border-dashed border-stone-800 rounded-2xl text-stone-600 text-[10px] font-black uppercase tracking-widest italic">Nenhuma defesa equipada</div>}
                </div>
            </div>

            <div className="bg-stone-900 border-2 border-red-600/30 rounded-3xl p-5 shadow-2xl space-y-4">
                <h4 className="font-black text-red-500 text-sm mb-2 flex items-center gap-2 uppercase tracking-widest"><Plus size={16}/> Bancada do Ferreiro</h4>
                <div className="flex gap-2">
                    <input className="flex-[2] bg-stone-950 border border-stone-800 p-2.5 rounded-xl text-sm focus:border-red-600 outline-none" placeholder="Nome do Item" value={customWeapon.name} onChange={e => setCustomWeapon({...customWeapon, name: e.target.value})} />
                    <input className="flex-1 bg-stone-950 border border-stone-800 p-2.5 rounded-xl text-sm focus:border-red-600 outline-none" placeholder="1d8" value={customWeapon.dmg} onChange={e => setCustomWeapon({...customWeapon, dmg: e.target.value})} />
                </div>
                <input className="w-full bg-stone-950 border border-stone-800 p-2.5 rounded-xl text-sm focus:border-red-600 outline-none" placeholder="Propriedades (ex: Versátil, Mágica)" value={customWeapon.props} onChange={e => setCustomWeapon({...customWeapon, props: e.target.value})} />
                <button onClick={createCustomWeapon} className="w-full bg-red-700 hover:bg-red-600 text-white p-3 rounded-2xl font-black text-xs shadow-lg uppercase tracking-widest transition-all active:scale-95">FORJAR EQUIPAMENTO</button>
            </div>

            <button onClick={() => setShowWeapons(!showWeapons)} className="w-full flex items-center justify-between p-3 bg-red-900/10 text-red-500 font-black rounded-2xl border border-red-900/30 hover:bg-red-900/20 transition-all uppercase text-[10px] tracking-widest">
                <span className="flex items-center gap-2"><Sword size={16}/> ARSENAL DE ARMAS (SRD)</span>
                {showWeapons ? <ChevronDown size={18}/> : <ChevronRight size={18}/>}
            </button>
            {showWeapons && (
                <div className="h-64 overflow-y-auto bg-white dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-3xl p-4 custom-scrollbar shadow-inner">
                    {allWeapons.map((w, i) => (
                        <div key={i} className="flex justify-between items-center p-2.5 hover:bg-stone-50 dark:hover:bg-stone-900 rounded-xl group border border-transparent hover:border-red-600/30 transition-all mb-1">
                            <div className="text-xs">
                                <div className="font-black text-red-600 dark:text-red-400 uppercase tracking-tight">{w.n}</div>
                                <div className="text-[9px] text-stone-500 font-bold uppercase">{w.dmg} • {w.prop}</div>
                            </div>
                            <button onClick={() => addWeaponToSheet(w)} className="w-8 h-8 bg-stone-100 dark:bg-stone-800 rounded-lg text-stone-400 hover:bg-green-600 hover:text-white flex items-center justify-center transition-all shadow-sm"><Plus size={20}/></button>
                        </div>
                    ))}
                </div>
            )}
          </div>
          
          <div className="flex flex-col h-full">
             <h3 className="font-cinzel text-xl font-bold text-stone-400 mb-4 border-b-2 border-amber-600/30 pb-1 tracking-wider uppercase">MOCHILA & ALFORGE</h3>
             <textarea className="w-full flex-1 min-h-[600px] bg-stone-50 dark:bg-stone-850 p-6 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-inner font-mono text-sm leading-relaxed focus:ring-2 ring-amber-600/20 outline-none text-stone-900 dark:text-stone-300" placeholder="Suas posses e equipamentos..." value={char.inventory} onChange={e => setChar({...char, inventory: e.target.value})}></textarea>
          </div>
        </div>
      )}

      {activeTab === 'bio' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 h-full">
           <div className="space-y-6">
             {['traits', 'ideals', 'bonds', 'flaws'].map(field => (
               <div key={field} className="bg-stone-50 dark:bg-stone-850 p-4 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-md">
                 <label className="text-[10px] font-black uppercase text-stone-500 tracking-[3px] block mb-2">{BIO_MAP[field] || field}</label>
                 <textarea 
                    className="w-full h-24 bg-white dark:bg-stone-950 p-3 rounded-xl border border-stone-300 dark:border-stone-800 resize-none text-sm outline-none focus:border-amber-600 transition-all leading-relaxed shadow-inner"
                    value={char.bio[field as keyof typeof char.bio]}
                    onChange={(e) => setChar({...char, bio: {...char.bio, [field]: e.target.value}})}
                 />
               </div>
             ))}
           </div>
           <div className="space-y-6">
             <div className="bg-stone-50 dark:bg-stone-850 p-5 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-md h-64 flex flex-col">
                <label className="text-[10px] font-black uppercase text-stone-500 tracking-[3px] block mb-3">BIOGRAFIA & ORIGEM</label>
                <textarea 
                  className="w-full flex-1 bg-white dark:bg-stone-950 p-4 rounded-2xl border border-stone-300 dark:border-stone-800 resize-none text-sm outline-none focus:border-amber-600 transition-all leading-relaxed shadow-inner"
                  value={char.bio.backstory}
                  onChange={(e) => setChar({...char, bio: {...char.bio, backstory: e.target.value}})}
                />
             </div>
             <div className="bg-stone-900 p-6 rounded-3xl border-2 border-stone-800 shadow-2xl flex-1 flex flex-col">
                <label className="text-[10px] font-black uppercase text-amber-500 tracking-[4px] block mb-4 flex items-center gap-2"><Calculator size={14}/> NOTAS DO MESTRE & TALENTOS</label>
                <textarea 
                  className="w-full flex-1 bg-stone-950 p-4 rounded-2xl border border-stone-800 resize-none text-sm outline-none focus:border-amber-600 transition-all leading-relaxed text-stone-400 font-mono shadow-inner"
                  value={char.bio.features}
                  onChange={(e) => setChar({...char, bio: {...char.bio, features: e.target.value}})}
                  placeholder="Habilidades especiais, talentos e notas de campanha..."
                />
             </div>
           </div>
        </div>
      )}
    </div>
  );
};
