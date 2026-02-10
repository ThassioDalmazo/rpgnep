
import React, { useEffect, useState, Dispatch, SetStateAction, useRef } from 'react';
import { Character } from '../types';
import { CLASSES_DB, SKILL_LIST, RACES_LIST, BACKGROUNDS_DB, COMMON_WEAPONS, SPELLS_DB, CLASS_FEATURES, ARMOR_DB, INITIAL_CHAR } from '../constants';
import { Sword, Shield, Heart, Zap, Scroll, Backpack, Save, Upload, Skull, BatteryCharging, Brain, Plus, ChevronDown, ChevronRight, Book, Moon, Trash2, ArrowUpCircle, Clock, Ruler, Hourglass, Sparkles, Calculator, AlertTriangle, Dices, GripVertical, List, FileText, Check, X, Search, Activity, User, Camera } from 'lucide-react';

interface Props {
  char: Character;
  setChar: Dispatch<SetStateAction<Character>>;
  onRoll: (d: number, mod: number, label: string) => void;
  onDelete: () => void;
  isNPC?: boolean;
}

const ATTR_MAP: Record<string, string> = {
  str: 'FORÇA',
  dex: 'DESTREZA',
  con: 'CONST',
  int: 'INTEL',
  wis: 'SABED',
  cha: 'CARISMA'
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

  // Inventory States
  const [invViewMode, setInvViewMode] = useState<'list' | 'text'>('list');
  const [newItemInput, setNewItemInput] = useState('');
  const [draggedItemIndex, setDraggedItemIndex] = useState<number | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  // ... (Other standard functions: updateAttr, toggleSkill, etc. remain the same) ...
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
        
        // DETECTOR DE FORMATO LEGADO (O JSON que o usuário mandou)
        if (json.nome_personagem || json.attr_for) {
            const converted: Character = {
                ...char, // Mantém ID e estrutura base
                name: json.nome_personagem || char.name,
                class: json.classe || char.class,
                subclass: json.subclasse || char.subclass,
                level: parseInt(json.nivel) || 1,
                background: json.antecedente || char.background,
                race: json.raca || char.race,
                playerName: json.jogador || char.playerName,
                alignment: json.alinhamento || char.alignment,
                xp: parseInt(json.xp) || 0,
                attributes: {
                    str: parseInt(json.attr_for) || 10,
                    dex: parseInt(json.attr_des) || 10,
                    con: parseInt(json.attr_con) || 10,
                    int: parseInt(json.attr_int) || 10,
                    wis: parseInt(json.attr_sab) || 10,
                    cha: parseInt(json.attr_car) || 10
                },
                // Map boolean strings/bools
                saves: {
                    str: !!json.save_prof_for,
                    dex: !!json.save_prof_des,
                    con: !!json.save_prof_con,
                    int: !!json.save_prof_int,
                    wis: !!json.save_prof_sab,
                    cha: !!json.save_prof_car
                },
                hp: {
                    ...char.hp,
                    max: parseInt(json.pv_max) || char.hp.max,
                    current: parseInt(json.pv_atual) || char.hp.current,
                    temp: parseInt(json.pv_temp) || 0
                },
                ac: parseInt(json.ca) || 10,
                speed: json.deslocamento || "9m",
                initiative: parseInt(json.iniciativa) || 0,
                bio: {
                    ...char.bio,
                    traits: json.bio_tracos || "",
                    ideals: json.bio_ideals || "",
                    bonds: json.bio_vinculos || "",
                    flaws: json.bio_defeitos || "",
                    backstory: json.bio_historia || "",
                    features: json.bio_features || ""
                },
                inventory: json.equipamento || char.inventory,
                spells: {
                    ...char.spells,
                    known: json.lista_magias || char.spells.known,
                    castingStat: json.attr_conjuracao || 'int'
                },
                wallet: {
                    cp: parseInt(json.coin_pc) || 0,
                    sp: parseInt(json.coin_pp) || 0,
                    ep: parseInt(json.coin_pe) || 0,
                    gp: parseInt(json.coin_po) || 0,
                    pp: parseInt(json.coin_pl) || 0
                }
            };
            
            // Map skills manually because names might differ slightly in keys
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

            setChar(converted);
            alert("Ficha legada importada com sucesso!");
        } else {
            // Formato Padrão RPGNEP
            setChar(prev => ({...prev, ...json, id: prev.id}));
            alert("Ficha carregada com sucesso!");
        }
      } catch (err) { alert("Erro ao carregar arquivo. O formato parece inválido."); }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          const reader = new FileReader();
          reader.onload = (ev) => {
              if (ev.target?.result) {
                  setChar({ ...char, imageUrl: ev.target.result as string });
              }
          };
          reader.readAsDataURL(file);
      }
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

  // --- Inventory Helper Functions ---
  const getInventoryLines = () => {
      return char.inventory.split('\n').filter(line => line.trim() !== '');
  };

  const addItem = () => {
      if(!newItemInput.trim()) return;
      const lines = getInventoryLines();
      lines.push(`- ${newItemInput}`);
      setChar({...char, inventory: lines.join('\n')});
      setNewItemInput('');
  };

  const toggleEquipItem = (index: number) => {
      const lines = getInventoryLines();
      if (lines[index]) {
          const isEquipped = lines[index].includes('[E]');
          if (isEquipped) {
              lines[index] = lines[index].replace('[E]', '').trim();
              if (lines[index].startsWith('- -')) lines[index] = lines[index].replace('- -', '-'); 
          } else {
              const cleanContent = lines[index].replace(/^-\s*/, '');
              lines[index] = `- [E] ${cleanContent}`;
          }
          setChar({...char, inventory: lines.join('\n')});
      }
  };

  const deleteItem = (index: number) => {
      const lines = getInventoryLines();
      lines.splice(index, 1);
      setChar({...char, inventory: lines.join('\n')});
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
      setDraggedItemIndex(index);
      e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
      e.preventDefault();
      if (draggedItemIndex === null || draggedItemIndex === dropIndex) return;
      
      const lines = getInventoryLines();
      const itemToMove = lines[draggedItemIndex];
      lines.splice(draggedItemIndex, 1);
      lines.splice(dropIndex, 0, itemToMove);
      
      setChar({...char, inventory: lines.join('\n')});
      setDraggedItemIndex(null);
  };

  const allWeapons = [...COMMON_WEAPONS, ...(char.customWeapons || [])];
  const allSpells = [...(Object.entries(SPELLS_DB) as [string, {level: string, desc: string}][]).map(([n, s]) => ({name: n, ...s})), ...(char.customSpells || [])];

  return (
    <div className="bg-[#121212] text-stone-200 p-6 rounded-2xl shadow-2xl max-w-6xl mx-auto border border-stone-800 relative">
      {/* Level Up Modal */}
      {showLevelUp && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
              <div className="bg-stone-900 border border-amber-600 rounded-2xl w-full max-w-lg p-8 shadow-[0_0_50px_rgba(245,158,11,0.2)] relative max-h-[90vh] overflow-y-auto">
                  <h3 className="text-3xl font-bold text-amber-500 mb-4 font-cinzel flex items-center gap-3"><ArrowUpCircle size={32}/> Ascender ao Nível {nextLevelNum}</h3>
                  <div className="space-y-6 mb-8">
                      <div className="bg-stone-800 p-4 rounded-xl border border-stone-700 shadow-inner">
                          <label className="block text-xs font-bold text-stone-500 uppercase mb-2">PV Extra</label>
                          {char.autoHp ? <div className="text-sm font-bold text-green-500">Calculado automaticamente (Média Fixa).</div> : <input type="number" className="w-full text-center font-bold text-3xl p-2 rounded-lg bg-black border border-stone-600 focus:border-amber-500 outline-none" value={newLevelHP} onChange={e => setNewLevelHP(safeInt(e.target.value))} />}
                      </div>
                      {isASILevel && (
                          <div className="bg-stone-800 p-4 rounded-xl border border-stone-700 shadow-inner">
                             <label className="block text-xs font-bold text-stone-500 uppercase mb-3">Incremento de Atributo (+2 Pontos)</label>
                             <div className="grid grid-cols-3 gap-3">
                                 {Object.keys(asiPoints).map(attr => (
                                     <div key={attr} className="flex flex-col items-center bg-black p-2 rounded-lg border border-stone-600">
                                         <span className="font-bold uppercase text-[10px] text-stone-500">{attr}</span>
                                         <div className="flex items-center gap-2 mt-1">
                                             <button onClick={() => setAsiPoints({...asiPoints, [attr]: Math.max(0, asiPoints[attr]-1)})} className="w-6 h-6 bg-stone-700 rounded-full font-bold hover:bg-stone-600">-</button>
                                             <span className="font-bold text-lg text-amber-500">{asiPoints[attr]}</span>
                                             <button onClick={() => setAsiPoints({...asiPoints, [attr]: asiPoints[attr]+1})} className="w-6 h-6 bg-amber-600 text-white rounded-full font-bold hover:bg-amber-500">+</button>
                                         </div>
                                     </div>
                                 ))}
                             </div>
                          </div>
                      )}
                  </div>
                  <div className="flex justify-end gap-3 pt-4 border-t border-stone-700">
                      <button onClick={() => setShowLevelUp(false)} className="px-5 py-2 text-stone-500 font-bold hover:text-stone-300 transition-colors">Abortar</button>
                      <button onClick={confirmLevelUp} className="px-8 py-3 bg-amber-600 hover:bg-amber-500 text-white font-black rounded-xl shadow-lg transition-all active:scale-95">CONFIRMAR EVOLUÇÃO</button>
                  </div>
              </div>
          </div>
      )}

      {/* Header Info */}
      <div className="flex flex-col gap-6 mb-8 border-b border-stone-800 pb-6">
        <div className="flex flex-col md:flex-row gap-6 items-start">
            
            {/* Avatar Section */}
            <div className="relative group shrink-0 mx-auto md:mx-0">
                <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="w-24 h-24 md:w-32 md:h-32 rounded-2xl bg-stone-900 border-2 border-stone-800 flex items-center justify-center overflow-hidden cursor-pointer hover:border-amber-500 transition-all shadow-lg"
                >
                    {char.imageUrl ? (
                        <img src={char.imageUrl} alt={char.name} className="w-full h-full object-cover" />
                    ) : (
                        <User size={48} className="text-stone-600 group-hover:text-stone-400 transition-colors" />
                    )}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                        <Camera size={24} className="text-white" />
                    </div>
                </div>
                <input 
                    type="file" 
                    ref={fileInputRef}
                    className="hidden" 
                    accept="image/*"
                    onChange={handleImageUpload}
                />
            </div>

            <div className="flex-1 w-full">
                <input className="text-5xl font-cinzel font-bold bg-transparent border-b border-transparent hover:border-stone-700 focus:border-amber-500 w-full focus:outline-none transition-all placeholder-stone-700 text-white" value={char.name} onChange={(e) => setChar({ ...char, name: e.target.value })} placeholder="Nome do Herói" />
                <div className="flex gap-4 mt-2 text-sm text-stone-400 font-bold uppercase tracking-wider">
                    <span>{char.race}</span>
                    <span className="text-stone-600">•</span>
                    <span>{char.class} {char.level}</span>
                    <span className="text-stone-600">•</span>
                    <span>{char.background}</span>
                </div>
            </div>
            
            <div className="flex items-center gap-3 self-start md:self-auto">
               <div className="flex gap-2">
                   <button onClick={handleShortRest} className="flex flex-col items-center justify-center w-16 h-16 bg-stone-900 rounded-xl border border-stone-800 hover:border-red-500/50 hover:bg-red-900/10 group transition-all">
                       <Heart size={20} className="text-red-500 group-hover:scale-110 transition-transform mb-1"/>
                       <span className="text-[9px] font-black uppercase text-stone-500 group-hover:text-red-400">Curto</span>
                   </button>
                   <button onClick={handleLongRest} className="flex flex-col items-center justify-center w-16 h-16 bg-stone-900 rounded-xl border border-stone-800 hover:border-indigo-500/50 hover:bg-indigo-900/10 group transition-all">
                       <Moon size={20} className="text-indigo-500 group-hover:scale-110 transition-transform mb-1"/>
                       <span className="text-[9px] font-black uppercase text-stone-500 group-hover:text-indigo-400">Longo</span>
                   </button>
               </div>
               
               <div className="w-px h-12 bg-stone-800 mx-2 hidden md:block"></div>
               
               <div className="text-center hidden md:block">
                  <div className="text-[10px] font-black text-stone-600 uppercase tracking-widest mb-1">Proficiência</div>
                  <div className="text-4xl font-black text-amber-500">+{profBonus}</div>
               </div>

               <button onClick={onDelete} className="ml-4 p-3 text-stone-600 hover:text-red-500 hover:bg-red-900/10 rounded-xl transition-all"><Trash2 size={20} /></button>
            </div>
        </div>

        {/* Detailed Stats Row (Collapsible logic could be added here) */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 text-xs">
          <div className="bg-stone-900 p-2 rounded-lg border border-stone-800">
              <label className="block text-stone-500 text-[9px] uppercase font-bold mb-1">Classe</label>
              <select className="w-full bg-transparent font-bold text-stone-300 outline-none" value={char.class} onChange={(e) => setChar({ ...char, class: e.target.value, subclass: '' })}>{Object.keys(CLASSES_DB).map(c => <option key={c} value={c}>{c}</option>)}</select>
          </div>
          <div className="bg-stone-900 p-2 rounded-lg border border-stone-800">
              <label className="block text-stone-500 text-[9px] uppercase font-bold mb-1">Subclasse</label>
              <select className="w-full bg-transparent font-bold text-stone-300 outline-none" value={char.subclass} onChange={(e) => setChar({ ...char, subclass: e.target.value })} disabled={!char.class || !CLASSES_DB[char.class]?.sub}><option value="">-</option>{char.class && CLASSES_DB[char.class]?.sub.map(s => <option key={s} value={s}>{s}</option>)}</select>
          </div>
          <div className="bg-stone-900 p-2 rounded-lg border border-stone-800">
              <label className="block text-stone-500 text-[9px] uppercase font-bold mb-1">Raça</label>
              <select className="w-full bg-transparent font-bold text-stone-300 outline-none" value={char.race} onChange={(e) => setChar({ ...char, race: e.target.value })}>{RACES_LIST.map(r => <option key={r} value={r}>{r}</option>)}</select>
          </div>
          <div className="bg-stone-900 p-2 rounded-lg border border-stone-800">
              <label className="block text-stone-500 text-[9px] uppercase font-bold mb-1">Antecedente</label>
              <select className="w-full bg-transparent font-bold text-stone-300 outline-none" value={char.background} onChange={handleBackgroundChange}>{Object.keys(BACKGROUNDS_DB).map(b => <option key={b} value={b}>{b}</option>)}</select>
          </div>
          <div className="bg-stone-900 p-2 rounded-lg border border-stone-800">
              <label className="block text-stone-500 text-[9px] uppercase font-bold mb-1">Alinhamento</label>
              <input className="w-full bg-transparent font-bold text-stone-300 outline-none" value={char.alignment} onChange={(e) => setChar({...char, alignment: e.target.value})} />
          </div>
          <div className="flex gap-2">
              <div className="bg-stone-900 p-2 rounded-lg border border-stone-800 flex-1 relative group cursor-pointer" onClick={openLevelUp}>
                  <label className="block text-stone-500 text-[9px] uppercase font-bold mb-1 text-center">Nível</label>
                  <div className="text-center font-bold text-white group-hover:text-amber-500">{char.level}</div>
                  <ArrowUpCircle size={14} className="absolute top-1 right-1 text-amber-600 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <div className="bg-stone-900 p-2 rounded-lg border border-stone-800 flex-[2]">
                  <label className="block text-stone-500 text-[9px] uppercase font-bold mb-1 text-right">XP</label>
                  <input type="number" className="w-full bg-transparent text-right font-mono text-stone-300 outline-none" value={char.xp} onChange={(e) => setChar({ ...char, xp: safeInt(e.target.value) })} />
              </div>
          </div>
        </div>
      </div>

      <div className="flex gap-2 mb-6 border-b border-stone-800 overflow-x-auto no-scrollbar">
        {[{ id: 'main', icon: Sword, label: 'Personagem' }, { id: 'spells', icon: Zap, label: 'Magias' }, { id: 'inv', icon: Backpack, label: 'Itens' }, { id: 'bio', icon: Scroll, label: 'História' }].map((tab) => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={`flex items-center gap-2 px-6 py-3 text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap border-b-2 ${activeTab === tab.id ? 'border-amber-600 text-amber-500' : 'border-transparent text-stone-500 hover:text-stone-300 hover:bg-white/5'}`}><tab.icon size={16} /> {tab.label}</button>
        ))}
        <div className="flex-1" />
        <button onClick={handleSave} className="p-2 text-stone-500 hover:text-amber-500 transition-colors" title="Exportar Ficha"><Save size={20} /></button>
        <label className="p-2 text-stone-500 hover:text-amber-500 cursor-pointer transition-colors" title="Importar Ficha"><Upload size={20} /><input type="file" hidden onChange={handleLoad} accept=".json" /></label>
      </div>

      {activeTab === 'main' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Attributes Column (Left) - Span 3 */}
          <div className="lg:col-span-3 space-y-3">
            <div className="grid grid-cols-3 lg:grid-cols-1 gap-3">
                {Object.entries(char.attributes).map(([key, val]) => {
                const mod = getMod(val as number);
                return (
                    <div key={key} className="bg-stone-900 rounded-xl border border-stone-800 relative group overflow-hidden flex flex-col items-center p-3 transition-all hover:border-amber-600/50 hover:shadow-[0_0_15px_rgba(217,119,6,0.1)]">
                        <div className="text-[10px] font-black uppercase text-stone-500 tracking-widest mb-1">{ATTR_MAP[key] || key}</div>
                        <div className="text-4xl font-cinzel font-bold text-white mb-1 group-hover:text-amber-500 transition-colors">{fmt(mod)}</div>
                        <div className="w-12 h-8 bg-stone-950 rounded border border-stone-800 flex items-center justify-center">
                            <input type="number" className="w-full text-center bg-transparent text-sm font-bold text-stone-400 focus:text-white outline-none" value={val as number} onChange={(e) => updateAttr(key as any, safeInt(e.target.value) || 10)} />
                        </div>
                        <button onClick={() => onRoll(20, mod, `Teste de ${ATTR_MAP[key] || key}`)} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" title={`Rolar ${ATTR_MAP[key]}`}></button>
                    </div>
                );
                })}
            </div>
             <div className="mt-4 p-4 bg-stone-900 rounded-xl border border-stone-800">
                <div className="flex justify-between items-center mb-3">
                    <span className="text-[10px] font-black uppercase text-stone-500 tracking-widest">Exaustão</span>
                    <span className="font-mono text-xl font-bold text-red-500">{char.exhaustion || 0}</span>
                </div>
                <div className="flex gap-1">
                    {[1,2,3,4,5,6].map(lvl => (
                        <button key={lvl} onClick={() => setChar(prev => ({...prev, exhaustion: prev.exhaustion === lvl ? lvl - 1 : lvl}))} className={`h-2 flex-1 rounded-full transition-all duration-300 ${char.exhaustion && char.exhaustion >= lvl ? 'bg-red-600 shadow-[0_0_8px_rgba(220,38,38,0.6)]' : 'bg-stone-800'}`}/>
                    ))}
                </div>
            </div>
          </div>

          {/* Center Column (Stats & Health) - Span 5 */}
          <div className="lg:col-span-5 space-y-6">
             <div className="grid grid-cols-3 gap-3">
               {/* AC */}
               <div className="bg-stone-900 p-3 rounded-2xl border border-stone-800 relative group">
                  <div className="flex flex-col items-center">
                      <div className="text-[10px] font-black text-stone-500 uppercase tracking-widest mb-1">Defesa</div>
                      <Shield size={32} className="text-stone-800 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-50 group-hover:text-amber-900 transition-colors" />
                      <input type="number" className={`relative z-10 w-full bg-transparent text-center font-cinzel font-bold text-3xl focus:outline-none ${char.autoAc ? 'text-blue-400' : 'text-white'}`} value={char.ac} readOnly={char.autoAc} onChange={e => setChar({...char, ac: safeInt(e.target.value) || 10})} />
                      <label className="flex items-center gap-1 cursor-pointer mt-1" title="Auto-cálculo">
                        <input type="checkbox" checked={char.autoAc || false} onChange={(e) => setChar({...char, autoAc: e.target.checked})} className="accent-blue-600 w-3 h-3" />
                        <span className="text-[9px] font-black text-stone-600">AUTO</span>
                      </label>
                  </div>
                  {char.autoAc && (
                      <div className="absolute top-full left-0 mt-2 hidden group-hover:block z-50 bg-stone-950 border border-stone-700 p-2 rounded-lg text-[10px] text-stone-400 shadow-xl w-48 text-center">
                          {getAcBreakdown()}
                      </div>
                  )}
               </div>
               
               {/* Initiative */}
               <div className="bg-stone-900 p-3 rounded-2xl border border-stone-800 cursor-pointer hover:border-amber-600/50 group transition-all relative overflow-hidden" onClick={() => onRoll(20, getMod(char.attributes.dex), "Iniciativa")}>
                  <div className="absolute inset-0 bg-amber-600/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="flex flex-col items-center relative z-10">
                      <div className="text-[10px] font-black text-stone-500 uppercase tracking-widest mb-1">Iniciativa</div>
                      <div className="text-3xl font-cinzel font-bold text-amber-500 group-hover:scale-110 transition-transform">{fmt(getMod(char.attributes.dex))}</div>
                      <div className="text-[9px] text-stone-600 font-bold mt-1">DESTREZA</div>
                  </div>
               </div>

               {/* Speed */}
               <div className="bg-stone-900 p-3 rounded-2xl border border-stone-800">
                  <div className="flex flex-col items-center">
                      <div className="text-[10px] font-black text-stone-500 uppercase tracking-widest mb-1">Desloc.</div>
                      <input type="text" className="w-full bg-transparent text-center font-cinzel font-bold text-2xl focus:outline-none text-white" value={char.speed} onChange={e => setChar({...char, speed: e.target.value})} />
                      <div className="text-[9px] text-stone-600 font-bold mt-1">METROS</div>
                  </div>
               </div>
             </div>

             {/* HP Section - Visual Upgrade */}
             <div className="bg-stone-900 p-6 rounded-3xl border border-stone-800 shadow-xl relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-b from-red-900/5 to-transparent pointer-events-none"></div>
                
                <div className="flex justify-between items-start mb-2 relative z-10">
                   <div className="flex items-center gap-2 text-stone-500">
                        <Heart size={16} className="text-red-600" fill="currentColor" />
                        <span className="font-black text-xs uppercase tracking-widest">Pontos de Vida</span>
                   </div>
                   <div className="flex items-center gap-2">
                        <label className="flex items-center gap-1 cursor-pointer text-[10px] font-bold text-stone-600 hover:text-stone-400">
                            <input type="checkbox" checked={char.autoHp || false} onChange={(e) => setChar({...char, autoHp: e.target.checked})} className="accent-red-600" />
                            AUTO
                        </label>
                        <div className="bg-black/40 px-2 py-1 rounded text-xs font-mono text-stone-400 border border-stone-800">
                            MAX: {char.hp.max}
                        </div>
                   </div>
                </div>
                
                <div className="relative z-10 flex items-center justify-center py-2">
                    <input type="number" className="w-full text-center text-7xl font-cinzel font-bold bg-transparent text-white focus:outline-none drop-shadow-md" value={char.hp.current} onChange={e => setChar({...char, hp: {...char.hp, current: safeInt(e.target.value)}})} />
                </div>
                
                {/* Health Bar Container */}
                <div className="h-6 w-full bg-black rounded-full overflow-hidden border border-stone-800 relative shadow-inner">
                    {/* Background Pattern */}
                    <div className="absolute inset-0 opacity-20" style={{backgroundImage: 'linear-gradient(45deg, #222 25%, transparent 25%, transparent 75%, #222 75%, #222), linear-gradient(45deg, #222 25%, transparent 25%, transparent 75%, #222 75%, #222)', backgroundSize: '10px 10px', backgroundPosition: '0 0, 5px 5px'}}></div>
                    
                    {/* Liquid Fill */}
                    <div 
                        className="h-full transition-all duration-500 ease-out relative"
                        style={{
                            width: `${Math.min(100, Math.max(0, (char.hp.current / char.hp.max) * 100))}%`,
                            background: `linear-gradient(90deg, #7f1d1d, #ef4444)`,
                            boxShadow: '0 0 20px rgba(239, 68, 68, 0.5)'
                        }}
                    >
                        {/* Shimmer Effect */}
                        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-white/20 to-transparent"></div>
                    </div>
                </div>
                
                {/* Temp HP */}
                <div className="mt-4 flex justify-center">
                    <div className="flex items-center gap-2 bg-blue-900/20 px-4 py-1.5 rounded-full border border-blue-900/40">
                        <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Temporário</span>
                        <input type="number" className="w-12 bg-transparent text-center text-blue-300 font-bold outline-none border-b border-blue-500/30 focus:border-blue-500" value={char.hp.temp} onChange={e => setChar({...char, hp: {...char.hp, temp: safeInt(e.target.value)}})} placeholder="0" />
                    </div>
                </div>
             </div>
             
             <div className="grid grid-cols-2 gap-4">
                 <div className="bg-stone-900 p-4 rounded-2xl border border-stone-800">
                    <div className="text-[10px] font-black text-stone-500 uppercase text-center mb-3 tracking-widest flex items-center justify-center gap-2"><Zap size={12}/> Dados de Vida</div>
                    <div className="flex items-center justify-center gap-2">
                        <input type="number" className="w-10 text-center bg-stone-950 border border-stone-800 rounded-lg py-1 font-bold text-lg text-white focus:border-amber-600 outline-none" value={char.hitDice.current} onChange={(e) => setChar({...char, hitDice: {...char.hitDice, current: safeInt(e.target.value)}})}/>
                        <span className="text-stone-600 font-black text-xl">/</span>
                        <input type="text" className="w-12 text-center bg-stone-950 border border-stone-800 rounded-lg py-1 font-bold text-sm text-stone-400 outline-none" value={char.hitDice.max} onChange={(e) => setChar({...char, hitDice: {...char.hitDice, max: e.target.value}})}/>
                    </div>
                 </div>
                 <div className="bg-stone-900 p-4 rounded-2xl border border-stone-800">
                    <div className="text-[10px] font-black text-stone-500 uppercase text-center mb-3 tracking-widest flex items-center justify-center gap-2"><Skull size={12}/> Salvaguardas</div>
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center justify-between px-2">
                            <span className="text-[10px] font-black text-green-500 uppercase">SUC</span>
                            <div className="flex gap-1">
                                {[1,2,3].map(i => (<input key={i} type="checkbox" className="accent-green-600 w-4 h-4 rounded-full bg-stone-800 border-stone-700" checked={char.deathSaves.successes >= i} onChange={() => setChar({...char, deathSaves: {...char.deathSaves, successes: char.deathSaves.successes >= i ? i - 1 : i}})}/>))}
                            </div>
                        </div>
                        <div className="flex items-center justify-between px-2">
                            <span className="text-[10px] font-black text-red-500 uppercase">FAL</span>
                            <div className="flex gap-1">
                                {[1,2,3].map(i => (<input key={i} type="checkbox" className="accent-red-600 w-4 h-4 rounded-full bg-stone-800 border-stone-700" checked={char.deathSaves.failures >= i} onChange={() => setChar({...char, deathSaves: {...char.deathSaves, failures: char.deathSaves.failures >= i ? i - 1 : i}})}/>))}
                            </div>
                        </div>
                    </div>
                 </div>
             </div>
          </div>

          {/* Right Column (Skills & Saves) - Span 4 */}
          <div className="lg:col-span-4 space-y-6">
             <div className="bg-stone-900 p-4 rounded-2xl border border-stone-800 h-full flex flex-col">
               <h3 className="font-black text-[10px] uppercase mb-4 text-stone-500 text-center tracking-[4px] flex items-center justify-center gap-2"><Brain size={14}/> PERÍCIAS & TESTES</h3>
               
               {/* Saves Mini-Grid */}
               <div className="grid grid-cols-2 gap-2 mb-4 pb-4 border-b border-stone-800">
                  {Object.keys(char.attributes).map(attr => {
                     const mod = getMod(char.attributes[attr as keyof typeof char.attributes]) + (char.saves[attr] ? profBonus : 0);
                     return (
                       <button key={attr} className={`flex items-center justify-between px-2 py-1 rounded text-xs border ${char.saves[attr] ? 'bg-amber-900/20 border-amber-600/30 text-amber-100' : 'bg-stone-950 border-stone-800 text-stone-500 hover:border-stone-600'}`} onClick={() => onRoll(20, mod, `Resistência de ${ATTR_MAP[attr]}`)}>
                         <span className="font-bold">{ATTR_MAP[attr].substring(0,3)}</span>
                         <div className="flex items-center gap-2">
                            {char.saves[attr] && <span className="w-1.5 h-1.5 bg-amber-500 rounded-full"></span>}
                            <span>{fmt(mod)}</span>
                         </div>
                       </button>
                     )
                  })}
               </div>

               {/* Skills List */}
               <div className="flex-1 overflow-y-auto pr-1 space-y-1 custom-scrollbar max-h-[400px]">
                 {SKILL_LIST.map(skill => {
                   const attrVal = char.attributes[skill.a as keyof typeof char.attributes];
                   const mod = getMod(attrVal) + (char.skills[skill.id] ? profBonus : 0);
                   const isStealth = skill.id === 'furtividade';
                   return (
                     <div key={skill.id} className="flex items-center text-sm p-1.5 hover:bg-stone-800 rounded-lg cursor-pointer group transition-all" onClick={() => onRoll(20, mod, skill.n)}>
                       <div onClick={(e) => { e.stopPropagation(); toggleSkill(skill.id); }} className={`w-3 h-3 rounded-full border mr-3 ${char.skills[skill.id] ? 'bg-amber-500 border-amber-500' : 'border-stone-600 hover:border-stone-400'}`}></div>
                       <span className={`flex-1 truncate text-xs font-medium ${char.skills[skill.id] ? 'text-stone-200' : 'text-stone-500 group-hover:text-stone-300'}`}>
                        {skill.n}
                        {isStealth && char.stealthDisadvantage && <span className="ml-2 text-red-500 inline-block" title="Desvantagem"><AlertTriangle size={10}/></span>}
                       </span>
                       <span className={`font-mono text-xs ${char.skills[skill.id] ? 'text-amber-500 font-bold' : 'text-stone-600'}`}>{fmt(mod)}</span>
                     </div>
                   );
                 })}
               </div>
            </div>
          </div>
        </div>
      )}

      {/* Other tabs content (Spells, Inv, Bio) - kept structurally similar but with darker theme classes applied naturally by parent */}
      
      {activeTab === 'spells' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
           <div className="space-y-6">
             <div className="bg-stone-900 p-6 rounded-3xl border border-stone-800 shadow-lg text-center">
                <label className="block text-stone-500 text-[10px] uppercase font-black tracking-[2px] mb-4">Mecanismo de Conjuração</label>
                <div className="flex gap-4 mb-6">
                    <select className="flex-1 bg-stone-950 border-2 border-stone-800 p-2.5 rounded-xl font-bold outline-none focus:border-purple-600 transition-colors text-white" value={char.spells.castingStat} onChange={e => setChar({...char, spells: {...char.spells, castingStat: e.target.value}})}>
                      <option value="int">Inteligência (INT)</option>
                      <option value="wis">Sabedoria (SAB)</option>
                      <option value="cha">Carisma (CAR)</option>
                    </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                   <div className="bg-stone-950 p-4 rounded-2xl border border-stone-800 shadow-inner">
                     <div className="text-[10px] text-stone-500 font-black uppercase mb-1">CD de Magia</div>
                     <div className="text-4xl font-black text-purple-500">{8 + profBonus + getMod(char.attributes[char.spells.castingStat as keyof typeof char.attributes] || 10)}</div>
                   </div>
                   <div className="bg-stone-950 p-4 rounded-2xl border border-stone-800 shadow-inner">
                     <div className="text-[10px] text-stone-500 font-black uppercase mb-1">Ataque Mágico</div>
                     <div className="text-4xl font-black text-purple-500">{fmt(profBonus + getMod(char.attributes[char.spells.castingStat as keyof typeof char.attributes] || 10))}</div>
                   </div>
                </div>
             </div>

             <div className="bg-stone-900 p-5 rounded-2xl border border-stone-800 shadow-md">
                <h4 className="font-black text-[10px] uppercase text-stone-500 mb-4 border-b border-stone-800 pb-2 tracking-widest flex items-center gap-2"><Sparkles size={14}/> RESERVA DE SLOTS</h4>
                <div className="space-y-2">
                    {[1,2,3,4,5,6,7,8,9].map(lvl => { 
                        const slots = (char.spells.slots && char.spells.slots[lvl]) || []; 
                        return (
                            <div key={lvl} className="flex items-center gap-4 bg-stone-950 p-2 rounded-xl border border-stone-800">
                                <div className="w-20 font-black text-[10px] text-stone-400 uppercase tracking-tighter">Nível {lvl}</div>
                                <div className="flex-1 flex gap-1.5 flex-wrap">
                                    {slots.map((ready, i) => (
                                        <button key={i} onClick={() => toggleSlot(lvl, i)} className={`w-7 h-7 rounded-lg border flex items-center justify-center transition-all ${ready ? 'bg-purple-600 border-purple-500 text-white shadow-[0_0_12px_rgba(147,51,234,0.4)]' : 'bg-stone-900 border-stone-800 text-stone-600'}`}>
                                            {ready ? <Zap size={14} className="fill-current"/> : <div className="w-1 h-1 bg-stone-700 rounded-full"/>}
                                        </button>
                                    ))}
                                    <div className="flex gap-1 ml-auto">
                                        <button onClick={() => addSlot(lvl)} className="w-7 h-7 rounded-lg border border-stone-800 text-stone-600 hover:text-green-500 hover:border-green-500/50 transition-colors flex items-center justify-center"><Plus size={14}/></button>
                                        <button onClick={() => removeSlot(lvl)} className="w-7 h-7 rounded-lg border border-stone-800 text-stone-600 hover:text-red-500 hover:border-red-500/50 transition-colors flex items-center justify-center"><Trash2 size={12}/></button>
                                    </div>
                                </div>
                            </div>
                        ); 
                    })}
                </div>
             </div>
             
             <div className="bg-stone-900 border-2 border-purple-900/30 rounded-3xl p-5 shadow-lg space-y-4">
                <h4 className="font-black text-purple-400 text-sm mb-2 flex items-center gap-2 uppercase tracking-widest"><Plus size={16}/> Teclado de Criação Arcana</h4>
                <div className="flex gap-2">
                    <input className="flex-[2] bg-stone-950 border border-stone-800 p-2.5 rounded-xl text-sm focus:border-purple-600 outline-none text-white" placeholder="Nome da Magia" value={customSpell.name} onChange={e => setCustomSpell({...customSpell, name: e.target.value})} />
                    <select className="flex-1 bg-stone-950 border border-stone-800 p-2.5 rounded-xl text-sm focus:border-purple-600 outline-none text-white" value={customSpell.level} onChange={e => setCustomSpell({...customSpell, level: e.target.value})}>{['Truque', '1º Nível', '2º Nível', '3º Nível', '4º Nível', '5º Nível', '6º Nível', '7º Nível', '8º Nível', '9º Nível'].map(l => <option key={l} value={l}>{l}</option>)}</select>
                </div>
                <div className="grid grid-cols-2 gap-2">
                    <select className="bg-stone-950 border border-stone-800 p-2 rounded-xl text-xs outline-none text-stone-300" value={customSpell.school} onChange={e => setCustomSpell({...customSpell, school: e.target.value})}>{['Abjuração', 'Adivinhação', 'Conjuração', 'Encantamento', 'Evocação', 'Ilusão', 'Necromancia', 'Transmutação'].map(s => <option key={s} value={s}>{s}</option>)}</select>
                    <input className="bg-stone-950 border border-stone-800 p-2 rounded-xl text-xs outline-none text-white" placeholder="Tempo (ex: 1 Ação)" value={customSpell.time} onChange={e => setCustomSpell({...customSpell, time: e.target.value})} />
                </div>
                <textarea className="w-full bg-stone-950 border border-stone-800 p-3 rounded-2xl text-sm h-24 resize-none outline-none focus:border-purple-600 text-white" placeholder="Efeitos e Danos..." value={customSpell.desc} onChange={e => setCustomSpell({...customSpell, desc: e.target.value})} />
                <button onClick={createCustomSpell} className="w-full bg-purple-700 hover:bg-purple-600 text-white p-3 rounded-2xl font-black text-xs shadow-lg uppercase tracking-widest transition-all active:scale-95">GRAVAR NO GRIMÓRIO</button>
             </div>
           </div>

           <div className="flex flex-col h-full">
             <div className="flex items-center justify-between mb-4">
                <h3 className="font-cinzel text-xl font-bold text-stone-400 border-b-2 border-amber-900/30 pb-1">GRIMÓRIO CONHECIDO</h3>
                <button onClick={() => setShowSpells(!showSpells)} className="px-4 py-2 bg-stone-800 hover:bg-stone-700 rounded-xl text-[10px] font-black text-stone-400 uppercase tracking-widest flex items-center gap-2 border border-stone-700">Bibliotecário {showSpells ? <ChevronDown size={14}/> : <ChevronRight size={14}/>}</button>
             </div>
             
             {showSpells && (
                 <div className="mb-4 h-64 overflow-y-auto bg-black border border-stone-800 rounded-2xl p-3 custom-scrollbar shadow-inner">
                     <div className="grid grid-cols-1 gap-2">
                        {allSpells.map((s, i) => (
                            <div key={i} className="flex justify-between items-center p-2 hover:bg-stone-900 rounded-xl group border border-transparent hover:border-purple-600/30">
                                <div className="text-xs">
                                    <div className="font-black text-purple-400 uppercase tracking-tight">{s.name}</div>
                                    <div className="text-[9px] text-stone-500 font-bold">{s.level} • {s.desc.substring(0, 40)}...</div>
                                </div>
                                <button onClick={() => addSpellToSheet(s.name, s)} className="w-8 h-8 bg-stone-800 rounded-lg text-stone-400 hover:bg-green-600 hover:text-white flex items-center justify-center transition-all"><Plus size={18}/></button>
                            </div>
                        ))}
                     </div>
                 </div>
             )}
             
             <textarea className="w-full flex-1 bg-stone-950 p-4 rounded-3xl border border-stone-800 shadow-inner font-mono text-sm leading-relaxed focus:ring-1 ring-purple-600/50 outline-none text-stone-300" placeholder="Magias serão listadas aqui..." value={char.spells.known} onChange={e => setChar({...char, spells: {...char.spells, known: e.target.value}})} />
           </div>
        </div>
      )}

      {activeTab === 'inv' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            {!isNPC && (
                <div className="bg-stone-900 p-5 rounded-3xl border border-stone-800 shadow-lg">
                    <h3 className="font-black text-[10px] text-amber-600 mb-4 uppercase tracking-[4px] text-center">TESOURO & MOEDAS</h3>
                    <div className="grid grid-cols-5 gap-3 text-center">
                    {['pc','pp','pe','po','pl'].map((label, i) => {
                        const keys = ['cp','sp','ep','gp','pp'];
                        return (
                        <div key={label} className="flex flex-col gap-1">
                            <label className="block text-stone-500 uppercase font-black text-[10px] tracking-widest">{label}</label>
                            <input type="number" className="w-full text-center bg-stone-950 border border-stone-800 p-2 rounded-xl font-black text-amber-500 focus:border-amber-600 outline-none transition-all" value={char.wallet[keys[i] as keyof typeof char.wallet]} onChange={(e) => setChar({...char, wallet: {...char.wallet, [keys[i]]: safeInt(e.target.value)}})} />
                        </div>
                        )
                    })}
                    </div>
                </div>
            )}
            
            <div className="bg-stone-900 p-5 rounded-3xl border border-stone-800 shadow-md">
                <div className="flex items-center justify-between mb-4 border-b border-stone-800 pb-2">
                    <h3 className="font-black text-[10px] text-blue-500 uppercase tracking-[4px] flex items-center gap-2"><Shield size={14}/> DEFESA & ARMADURAS</h3>
                    <button onClick={() => setShowArmors(!showArmors)} className="text-[9px] font-black text-stone-500 hover:text-stone-300 uppercase tracking-widest px-3 py-1 bg-stone-800 rounded-full border border-stone-700">{showArmors ? 'FECHAR' : 'ABRIR'}</button>
                </div>
                
                {showArmors && (
                    <div className="h-64 overflow-y-auto bg-stone-950 rounded-2xl border border-stone-800 p-3 custom-scrollbar mb-4 shadow-inner">
                        {Object.values(ARMOR_DB).map((armor) => {
                            const isEquipped = char.equippedArmor === armor.n || char.equippedShield === armor.n;
                            return (
                                <div key={armor.n} className="flex justify-between items-center p-2.5 hover:bg-stone-900 rounded-xl group mb-1 border border-transparent hover:border-blue-600/30 transition-all">
                                    <div className="text-xs">
                                        <div className="font-black text-blue-400 uppercase">{armor.n}</div>
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
                        <div className="flex justify-between items-center bg-blue-900/10 p-3 rounded-2xl border border-blue-900/30">
                            <div>
                                <div className="text-[9px] text-stone-500 font-black uppercase tracking-widest mb-0.5">Armadura Ativa</div>
                                <div className="font-black text-blue-400">{char.equippedArmor}</div>
                            </div>
                            <button onClick={() => toggleArmor(char.equippedArmor!)} className="w-8 h-8 bg-red-900/20 text-red-500 rounded-xl hover:bg-red-600 hover:text-white flex items-center justify-center transition-all"><Trash2 size={16}/></button>
                        </div>
                    )}
                    {char.equippedShield && (
                        <div className="flex justify-between items-center bg-blue-900/10 p-3 rounded-2xl border border-blue-900/30">
                            <div>
                                <div className="text-[9px] text-stone-500 font-black uppercase tracking-widest mb-0.5">Escudo Ativo</div>
                                <div className="font-black text-blue-400">+2 Classe de Armadura</div>
                            </div>
                            <button onClick={() => toggleShield()} className="w-8 h-8 bg-red-900/20 text-red-500 rounded-xl hover:bg-red-600 hover:text-white flex items-center justify-center transition-all"><Trash2 size={16}/></button>
                        </div>
                    )}
                    {!char.equippedArmor && !char.equippedShield && <div className="text-center py-4 border-2 border-dashed border-stone-800 rounded-2xl text-stone-600 text-[10px] font-black uppercase tracking-widest italic">Nenhuma defesa equipada</div>}
                </div>
            </div>
            
            <div className="bg-stone-900 border-2 border-red-900/30 rounded-3xl p-5 shadow-2xl space-y-4">
                <h4 className="font-black text-red-500 text-sm mb-2 flex items-center gap-2 uppercase tracking-widest"><Plus size={16}/> Bancada do Ferreiro</h4>
                <div className="flex gap-2">
                    <input className="flex-[2] bg-stone-950 border border-stone-800 p-2.5 rounded-xl text-sm focus:border-red-600 outline-none text-white" placeholder="Nome do Item" value={customWeapon.name} onChange={e => setCustomWeapon({...customWeapon, name: e.target.value})} />
                    <input className="flex-1 bg-stone-950 border border-stone-800 p-2.5 rounded-xl text-sm focus:border-red-600 outline-none text-white" placeholder="1d8" value={customWeapon.dmg} onChange={e => setCustomWeapon({...customWeapon, dmg: e.target.value})} />
                </div>
                <input className="w-full bg-stone-950 border border-stone-800 p-2.5 rounded-xl text-sm focus:border-red-600 outline-none text-white" placeholder="Propriedades (ex: Versátil, Mágica)" value={customWeapon.props} onChange={e => setCustomWeapon({...customWeapon, props: e.target.value})} />
                <button onClick={createCustomWeapon} className="w-full bg-red-700 hover:bg-red-600 text-white p-3 rounded-2xl font-black text-xs shadow-lg uppercase tracking-widest transition-all active:scale-95">FORJAR EQUIPAMENTO</button>
            </div>

            <button onClick={() => setShowWeapons(!showWeapons)} className="w-full flex items-center justify-between p-3 bg-red-900/10 text-red-500 font-black rounded-2xl border border-red-900/30 hover:bg-red-900/20 transition-all uppercase text-[10px] tracking-widest">
                <span className="flex items-center gap-2"><Sword size={16}/> ARSENAL DE ARMAS (SRD)</span>
                {showWeapons ? <ChevronDown size={18}/> : <ChevronRight size={18}/>}
            </button>
            {showWeapons && (
                <div className="h-64 overflow-y-auto bg-stone-950 border border-stone-800 rounded-3xl p-4 custom-scrollbar shadow-inner">
                    {allWeapons.map((w, i) => (
                        <div key={i} className="flex justify-between items-center p-2.5 hover:bg-stone-900 rounded-xl group border border-transparent hover:border-red-900/30 transition-all mb-1">
                            <div className="text-xs">
                                <div className="font-black text-red-400 uppercase tracking-tight">{w.n}</div>
                                <div className="text-[9px] text-stone-500 font-bold uppercase">{w.dmg} • {w.prop}</div>
                            </div>
                            <button onClick={() => addWeaponToSheet(w)} className="w-8 h-8 bg-stone-800 rounded-lg text-stone-400 hover:bg-green-600 hover:text-white flex items-center justify-center transition-all shadow-sm"><Plus size={20}/></button>
                        </div>
                    ))}
                </div>
            )}
          </div>
          
          <div className="flex flex-col h-full">
             <div className="flex justify-between items-center mb-4 border-b-2 border-amber-900/30 pb-1">
                 <h3 className="font-cinzel text-xl font-bold text-stone-400 tracking-wider uppercase">MOCHILA & ALFORGE</h3>
                 <div className="flex gap-1 bg-stone-900 p-1 rounded-lg border border-stone-800">
                     <button onClick={() => setInvViewMode('list')} className={`p-1.5 rounded transition-colors ${invViewMode === 'list' ? 'bg-amber-600 text-white' : 'text-stone-500 hover:text-stone-300'}`} title="Modo Visual"><List size={16}/></button>
                     <button onClick={() => setInvViewMode('text')} className={`p-1.5 rounded transition-colors ${invViewMode === 'text' ? 'bg-amber-600 text-white' : 'text-stone-500 hover:text-stone-300'}`} title="Modo Texto"><FileText size={16}/></button>
                 </div>
             </div>
             
             {invViewMode === 'list' ? (
                 <div className="flex-1 flex flex-col min-h-[600px] bg-stone-900 p-4 rounded-3xl border border-stone-800 shadow-inner">
                     <div className="flex gap-2 mb-4">
                         <input 
                            className="flex-1 bg-stone-950 border border-stone-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-amber-500 transition-colors text-white"
                            placeholder="Adicionar novo item..."
                            value={newItemInput}
                            onChange={e => setNewItemInput(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && addItem()}
                         />
                         <button onClick={addItem} className="bg-amber-600 text-white p-2 rounded-lg hover:bg-amber-500 transition-colors"><Plus size={20}/></button>
                     </div>
                     <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2 pr-2">
                         {char.inventory.split('\n').filter(i => i.trim() !== '').map((itemLine, idx) => {
                             const isEquipped = itemLine.includes('[E]');
                             const cleanName = itemLine.replace(/^- /, '').replace('[E]', '').trim();
                             
                             return (
                                 <div 
                                    key={idx} 
                                    draggable
                                    onDragStart={(e) => handleDragStart(e, idx)}
                                    onDragOver={(e) => handleDragOver(e, idx)}
                                    onDrop={(e) => handleDrop(e, idx)}
                                    className={`flex items-center gap-3 p-3 rounded-xl border transition-all cursor-move group ${
                                        isEquipped 
                                        ? 'bg-amber-900/10 border-amber-600/40' 
                                        : 'bg-stone-950 border-stone-800 hover:border-stone-600'
                                    } ${draggedItemIndex === idx ? 'opacity-50 border-dashed border-amber-500' : ''}`}
                                 >
                                     <GripVertical size={16} className="text-stone-500 cursor-grab active:cursor-grabbing"/>
                                     <button onClick={() => toggleEquipItem(idx)} className={`transition-colors ${isEquipped ? 'text-amber-500' : 'text-stone-600 hover:text-stone-400'}`} title={isEquipped ? "Desequipar" : "Equipar"}>
                                         {isEquipped ? <Check size={18} strokeWidth={3}/> : <div className="w-4 h-4 rounded-full border-2 border-current"></div>}
                                     </button>
                                     <span className={`flex-1 text-sm font-medium ${isEquipped ? 'text-amber-400' : 'text-stone-300'}`}>{cleanName}</span>
                                     <button onClick={() => deleteItem(idx)} className="opacity-0 group-hover:opacity-100 text-stone-500 hover:text-red-500 transition-all p-1">
                                         <Trash2 size={16}/>
                                     </button>
                                 </div>
                             )
                         })}
                         {char.inventory.trim() === '' && (
                             <div className="text-center text-stone-500 py-10 opacity-50 italic text-sm">Inventário vazio. Adicione itens acima.</div>
                         )}
                     </div>
                 </div>
             ) : (
                 <textarea className="w-full flex-1 min-h-[600px] bg-stone-950 p-6 rounded-3xl border border-stone-800 shadow-inner font-mono text-sm leading-relaxed focus:ring-1 ring-amber-600/30 outline-none text-stone-300" placeholder="Suas posses e equipamentos..." value={char.inventory} onChange={e => setChar({...char, inventory: e.target.value})}></textarea>
             )}
          </div>
        </div>
      )}

      {activeTab === 'bio' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 h-full">
           <div className="space-y-6">
             {['traits', 'ideals', 'bonds', 'flaws'].map(field => (
               <div key={field} className="bg-stone-900 p-4 rounded-2xl border border-stone-800 shadow-md">
                 <label className="text-[10px] font-black uppercase text-stone-500 tracking-[3px] block mb-2">{BIO_MAP[field] || field}</label>
                 <textarea 
                    className="w-full h-24 bg-stone-950 p-3 rounded-xl border border-stone-800 resize-none text-sm text-stone-300 outline-none focus:border-amber-600 transition-all leading-relaxed shadow-inner"
                    value={char.bio[field as keyof typeof char.bio]}
                    onChange={(e) => setChar({...char, bio: {...char.bio, [field]: e.target.value}})}
                 />
               </div>
             ))}
           </div>
           <div className="space-y-6">
             <div className="bg-stone-900 p-5 rounded-3xl border border-stone-800 shadow-md h-64 flex flex-col">
                <label className="text-[10px] font-black uppercase text-stone-500 tracking-[3px] block mb-3">BIOGRAFIA & ORIGEM</label>
                <textarea 
                  className="w-full flex-1 bg-stone-950 p-4 rounded-2xl border border-stone-800 resize-none text-sm text-stone-300 outline-none focus:border-amber-600 transition-all leading-relaxed shadow-inner"
                  value={char.bio.backstory}
                  onChange={(e) => setChar({...char, bio: {...char.bio, backstory: e.target.value}})}
                />
             </div>
             <div className="bg-stone-950 p-6 rounded-3xl border-2 border-stone-900 shadow-2xl flex-1 flex flex-col">
                <label className="text-[10px] font-black uppercase text-amber-500 tracking-[4px] block mb-4 flex items-center gap-2"><Calculator size={14}/> NOTAS DO MESTRE & TALENTOS</label>
                <textarea 
                  className="w-full flex-1 bg-black/50 p-4 rounded-2xl border border-stone-900 resize-none text-sm outline-none focus:border-amber-600 transition-all leading-relaxed text-stone-400 font-mono shadow-inner"
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