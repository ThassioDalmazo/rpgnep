
import { Character, SpellEntry, InventoryItem } from '../types';

const CARD_WIDTH = 2800;
const CARD_HEIGHT = 1400;
const OUTER_PAD = 35;
const INNER_PAD = 25;
const SECTION_GAP = 15;

const bodyFont = '"Spectral", Georgia, serif';
const titleFont = '"Cinzel", Georgia, serif';

const attributeLabels: Record<string, string> = {
  str: "FOR", dex: "DES", con: "CON", int: "INT", wis: "SAB", cha: "CAR"
};

const skillLabels: Record<string, string> = {
  acrobacia: "Acrobacia", arcanismo: "Arcanismo", atletismo: "Atletismo", atuacao: "Atuação",
  enganacao: "Enganação", furtividade: "Furtividade", historia: "História", intuicao: "Intuição",
  intimidacao: "Intimidação", investigacao: "Investigação", adestrar: "Adestrar Animais",
  medicina: "Medicina", natureza: "Natureza", percepcao: "Percepção", persuasao: "Persuasão",
  prestidigitacao: "Prestidigitação", religiao: "Religião", sobrevivencia: "Sobrevivência"
};

const skillAttr: Record<string, string> = {
    atletismo: 'str', acrobacia: 'dex', furtividade: 'dex', prestidigitacao: 'dex',
    arcanismo: 'int', historia: 'int', investigacao: 'int', natureza: 'int', religiao: 'int',
    intuicao: 'wis', medicina: 'wis', percepcao: 'wis', adestrar: 'wis', sobrevivencia: 'wis',
    atuacao: 'cha', enganacao: 'cha', intimidacao: 'cha', persuasao: 'cha'
};

export async function exportCharacterToCard(char: Character) {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  canvas.width = CARD_WIDTH;
  canvas.height = CARD_HEIGHT;

  // 1. FUNDO PARGAMINHO
  drawBackground(ctx, CARD_HEIGHT);

  // 2. IMAGEM (Coluna Esquerda - 18% para sobrar mais espaço de texto)
  const leftColWidth = CARD_WIDTH * 0.18;
  const imageAreaH = CARD_HEIGHT - OUTER_PAD * 2;
  
  if (char.imageUrl) {
    try {
        const img = await loadImage(char.imageUrl);
        drawCharacterImage(ctx, img, OUTER_PAD, OUTER_PAD, leftColWidth, imageAreaH);
    } catch {
        drawPlaceholder(ctx, OUTER_PAD, OUTER_PAD, leftColWidth, imageAreaH, "Personagem");
    }
  } else {
    drawPlaceholder(ctx, OUTER_PAD, OUTER_PAD, leftColWidth, imageAreaH, "Personagem");
  }

  const contentX = OUTER_PAD + leftColWidth + SECTION_GAP;
  const contentW = CARD_WIDTH - contentX - OUTER_PAD;

  // 3. CABEÇALHO (Compacto)
  ctx.fillStyle = "#2a1b14";
  ctx.font = `700 64px ${titleFont}`;
  ctx.fillText(char.name?.toUpperCase() || "HERÓI SEM NOME", contentX, OUTER_PAD + 55);

  ctx.fillStyle = "#8b6343";
  ctx.font = `italic 24px ${bodyFont}`;
  const subText = `${char.race || 'Raça'} | ${char.class || 'Classe'} ${char.subclass ? `(${char.subclass})` : ''} - Nível ${char.level || 1}`;
  ctx.fillText(subText, contentX, OUTER_PAD + 90);

  // Stats Boxes (CA, HP, etc)
  const statsStartX = contentX + contentW * 0.65;
  const statsW = contentW * 0.35;
  const statsH = 75;
  const bioItems = [
      ["CA", String(char.ac || 10)],
      ["HP", `${char.hp.current}/${char.hp.max}`],
      ["INIC.", `${char.initiative >= 0 ? '+' : ''}${char.initiative}`],
      ["PROF.", `+${Math.ceil((char.level || 1) / 4) + 1}`]
  ];
  bioItems.forEach((stat, i) => {
      const boxW = (statsW / 4) - 6;
      const bx = statsStartX + (i * (boxW + 6));
      drawStatBox(ctx, stat[0], stat[1], bx, OUTER_PAD + 15, boxW, statsH);
  });

  let currentY = OUTER_PAD + 115;

  // 4. ATRIBUTOS
  const attrAreaW = contentW;
  const attrBoxW = (attrAreaW / 6) - 10;
  const attrH = 100;
  Object.entries(char.attributes).forEach(([key, val], i) => {
      const mod = Math.floor((val - 10) / 2);
      const modStr = (mod >= 0 ? '+' : '') + mod;
      const ax = contentX + (i * (attrBoxW + 10));
      drawAttributeCard(ctx, attributeLabels[key], String(val), modStr, ax, currentY, attrBoxW, attrH);
  });

  currentY += attrH + SECTION_GAP;

  // 5. COLUNAS DINÂMICAS (5 colunas para máximo de magias e habilidades)
  const bottomH = CARD_HEIGHT - currentY - OUTER_PAD;
  const colW = (contentW - SECTION_GAP * 4) / 5;

  // COLUNA 1: MAGIAS (Parte 1)
  const spellsDrawn1 = drawMagiasCol(ctx, char.spellList || [], contentX, currentY, colW, bottomH, "MAGIAS (I)");

  // COLUNA 2: MAGIAS (Parte 2)
  const remainingSpells1 = (char.spellList || []).slice(spellsDrawn1);
  const spellsDrawn2 = drawMagiasCol(ctx, remainingSpells1, contentX + colW + SECTION_GAP, currentY, colW, bottomH, "MAGIAS (II)");

  // COLUNA 3: MAGIAS (Parte 3)
  const remainingSpells2 = (char.spellList || []).slice(spellsDrawn1 + spellsDrawn2);
  const spellsDrawn3 = drawMagiasCol(ctx, remainingSpells2, contentX + (colW + SECTION_GAP) * 2, currentY, colW, bottomH, "MAGIAS (III)");

  // COLUNA 4: PERÍCIAS (Compacta)
  const profBonusValue = Math.ceil((char.level || 1) / 4) + 1;
  const sortedSkills = Object.keys(skillLabels).sort().map(key => {
      const attr = skillAttr[key] || 'dex';
      const attrVal = (char.attributes as any)[attr] || 10;
      const mod = Math.floor((attrVal - 10) / 2);
      const isProf = !!char.skills?.[key];
      const total = mod + (isProf ? profBonusValue : 0);
      return { label: skillLabels[key], value: (total >= 0 ? '+' : '') + total, isProf };
  });
  drawPericiasTable(ctx, sortedSkills, contentX + (colW + SECTION_GAP) * 3, currentY, colW, bottomH);

  // COLUNA 5: EQUIPAMENTO & HABILIDADES
  drawMiscCol(ctx, char, contentX + (colW + SECTION_GAP) * 4, currentY, colW, bottomH);


  // FINALIZAR
  canvas.toBlob(async (blob) => {
    if (!blob) return;
    const jsonText = JSON.stringify(char);
    const enrichedBlob = await injectPngMetadata(blob, "card-json", jsonText);
    downloadBlob(enrichedBlob, `${(char.name || 'Ficha').replace(/\s+/g, '_')}_legend.png`);
  }, 'image/png');
}

// --- AUXILIARES DE DESENHO ---

function getAutoAttacks(char: Character) {
    const attacks: { n: string; d: string }[] = [];
    const level = char.level || 1;
    const cls = (char.class || "").toLowerCase();
    const prof = Math.ceil(level / 4) + 1;

    const getMod = (attr: keyof typeof char.attributes) => Math.floor(((char.attributes[attr] || 10) - 10) / 2);
    const strMod = getMod('str');
    const dexMod = getMod('dex');

    // MONGE
    if (cls.includes('monk') || cls.includes('monge')) {
        const die = level >= 17 ? 'd10' : level >= 11 ? 'd8' : level >= 5 ? 'd6' : 'd4';
        const mod = Math.max(strMod, dexMod);
        const bonusAttack = `1${die}${mod >= 0 ? '+' : ''}${mod}`;
        
        attacks.push({ n: "Ataque Desarmado", d: `${bonusAttack} | +${mod + prof}` });
        attacks.push({ n: "Artes Marciais", d: `Atq. Bônus: ${bonusAttack}` });
        
        if (level >= 2) {
            attacks.push({ n: "Rajada de Golpes", d: `2 Atqs Bônus: ${bonusAttack} (1 Ki)` });
        }
        if (level >= 5) {
            attacks.push({ n: "Ataque Atordoante", d: "Gasta 1 Ki p/ Atordoar alvo (Save CON)" });
        }
    }

    // LADINO (Ataque Furtivo)
    if (cls.includes('rogue') || cls.includes('ladino')) {
        const diceCount = Math.ceil(level / 2);
        attacks.push({ n: "Ataque Furtivo", d: `+${diceCount}d6 extra (Vantagem ou Aliado próximo)` });
    }

    // BÁRBARO (Dano de Fúria)
    if (cls.includes('barbarian') || cls.includes('barbaro')) {
        const rageDmg = level >= 16 ? 4 : level >= 9 ? 3 : 2;
        attacks.push({ n: "Dano de Fúria", d: `+${rageDmg} de dano em ataques de Força` });
    }

    // ATAQUE EXTRA (Marciais)
    const extraAttackClasses = ['guerreiro', 'fighter', 'barbarian', 'barbaro', 'paladin', 'paladino', 'ranger', 'patrulheiro', 'monge', 'monk'];
    const hasExtraAttack = level >= 5 && extraAttackClasses.some(c => cls.includes(c));

    if (hasExtraAttack) {
        let text = "2 Ataques por ação";
        if (cls.includes('fighter') || cls.includes('guerreiro')) {
            if (level >= 11) text = "3 Ataques por ação";
            if (level >= 20) text = "4 Ataques por ação";
        }
        attacks.push({ n: "Ataque Extra", d: text });
    }

    return attacks;
}

function getClassFeatures(char: Character) {
    const features: string[] = [];
    const level = char.level || 1;
    const cls = (char.class || "").toLowerCase();
    
    function profBonus(l: number) { return Math.ceil(l / 4) + 1; }
    const prof = profBonus(level);
    const getMod = (attr: keyof typeof char.attributes) => Math.floor(((char.attributes[attr] || 10)-10)/2);

    // MONGE
    if (cls.includes('monk') || cls.includes('monge')) {
        const wisMod = getMod('wis');
        features.push(`Ki: ${level} pts (CD ${8 + wisMod + prof})`);
        features.push("Defesa sem Armadura: CA = 10 + DES + SAB");
        if (level >= 2) features.push("Movimento sem Armadura: Vel. aumentada");
        if (level >= 3) features.push("Defletir Projéteis: Reação p/ reduzir dano (1d10+DES+Nv)");
        if (level >= 7) features.push("Evasão: Dano 0 se passar save Dex");
    }

    // GUERREIRO
    if (cls.includes('fighter') || cls.includes('guerreiro')) {
        features.push("Retomar o Fôlego: Cura 1d10+Nv (Ação Bônus, 1/Desc)");
        if (level >= 2) features.push("Surto de Ação: +1 Ação no turno (1/Desc)");
        if (level >= 9) features.push("Indomável: Refaz Resistência falha (1/Dia)");
        if (char.subclass?.toLowerCase().includes('battle') || char.subclass?.toLowerCase().includes('mestre')) {
            const die = level >= 18 ? '12' : level >= 10 ? '10' : '8';
            features.push(`Combate Superior: Dados d${die} (Manobras)`);
        }
    }

    // BÁRBARO
    if (cls.includes('barbaro') || cls.includes('barbarian')) {
        features.push(`Fúria: ${level >= 20 ? 'Infinita' : (level >= 17 ? 6 : (level >= 12 ? 5 : (level >= 6 ? 4 : (level >= 3 ? 3 : 2))))} usos/Desc. Longo`);
        features.push("Defesa sem Armadura: CA = 10 + DES + CON");
        if (level >= 2) features.push("Ataque Descuidado: Vantagem atq (inimigos tem contra você)");
        if (level >= 2) features.push("Sentido de Perigo: Vantagem em Saves de DES");
    }

    // PALADINO
    if (cls.includes('paladino') || cls.includes('paladin')) {
        features.push(`Imposição de Mãos: ${level * 5} PV p/ curar`);
        features.push("Sentido Divino: Detecta tipos de criaturas (1+CAR/Dia)");
        if (level >= 2) features.push("Destruição Divina (Smite): Gasta slot p/ dano radiante");
        if (level >= 6) features.push(`Aura de Proteção: +${Math.max(1, getMod('cha'))} nos Resistências (Aliados 3m)`);
    }

    // LADINO
    if (cls.includes('ladino') || cls.includes('rogue')) {
        features.push("Especialização: Bônus dobrado em perícias escolhidas");
        if (level >= 2) features.push("Ação Ardilosa: Bônus p/ Correr/Desengajar/Esconder");
        if (level >= 5) features.push("Esquiva Sobrenatural: Reação p/ metade do dano");
        if (level >= 7) features.push("Evasão: Dano 0 se passar save Dex");
    }

    // CLÉRIGO
    if (cls.includes('clerigo') || cls.includes('cleric')) {
        features.push(`Canalizar Divindade: ${level >= 18 ? 3 : (level >= 6 ? 2 : 1)}/Descanso`);
        if (level >= 5) features.push(`Expulsar Mortos-Vivos: CR ${level >= 17 ? 4 : (level >= 14 ? 3 : (level >= 11 ? 2 : (level >= 8 ? 1 : 0.5)))}`);
    }

    // BARDO
    if (cls.includes('bardo') || cls.includes('bard')) {
        const die = level >= 15 ? 'd12' : level >= 10 ? 'd10' : level >= 5 ? 'd8' : 'd6';
        features.push(`Inspiração Bárdica: ${getMod('cha') || 1}/Long (Dado ${die})`);
        features.push("O Pau pra Toda Obra: +metade da Prof em testes s/ proficiência");
        if (level >= 2) features.push("Canção de Descanso: +1d6 (e escala) cura no descanso curto");
    }

    // DRUIDA
    if (cls.includes('druida') || cls.includes('druid')) {
        features.push(`Forma Selvagem: 2/Desc (Nv ${level}, CR Max ${cls.includes('lua') || cls.includes('moon') ? Math.max(1, Math.floor(level/3)) : (level >= 8 ? 1 : (level >= 4 ? 0.5 : 0.25))})`);
    }

    // RANGER
    if (cls.includes('ranger') || cls.includes('patrulheiro')) {
        features.push("Inimigo Favorito e Explorador Natural (Vantagens de Rastreio)");
        if (level >= 3) features.push("Consciência Primal (Detectar tipos de criaturas)");
        if (level >= 10) features.push("Mimetismo (Esconder-se em terreno natural)");
    }

    // FEITICEIRO
    if (cls.includes('sorcerer') || cls.includes('feiticeiro')) {
        if (level >= 2) features.push(`Pontos de Feitiçaria: ${level}`);
        if (level >= 3) features.push("Metamagia: Altera propriedades de magias");
    }

    // BRUXO
    if (cls.includes('warlock') || cls.includes('bruxo')) {
        features.push(`Invocações Místicas: ${level >= 18 ? 8 : (level >= 15 ? 7 : (level >= 11 ? 6 : (level >= 9 ? 5 : (level >= 7 ? 4 : (level >= 5 ? 3 : (level >= 2 ? 2 : 0))))))}`);
        if (level >= 3) features.push("Dádiva do Pacto (Corrente, Lâmina, Tomo ou Talismã)");
    }

    // MAGO
    if (cls.includes('mago') || cls.includes('wizard')) {
        features.push(`Recuperação Arcana: Recupera ${Math.ceil(level/2)} slots no Desc. Curto`);
    }

    return features;
}

function drawBackground(ctx: CanvasRenderingContext2D, height: number) {
  ctx.fillStyle = "#fffcf2";
  ctx.fillRect(0, 0, CARD_WIDTH, height);
  // Bordas ornamentais simples
  ctx.strokeStyle = "#4a3321";
  ctx.lineWidth = 12;
  ctx.strokeRect(20, 20, CARD_WIDTH - 40, height - 40);
  ctx.lineWidth = 2;
  ctx.strokeRect(35, 35, CARD_WIDTH - 70, height - 70);
}

async function loadImage(url: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => resolve(img);
        img.onerror = () => reject();
        img.src = url;
    });
}

function drawCharacterImage(ctx: CanvasRenderingContext2D, img: HTMLImageElement, x: number, y: number, w: number, h: number) {
    ctx.save();
    roundRect(ctx, x, y, w, h, 20);
    ctx.clip();
    const imgRatio = img.width / img.height;
    const targetRatio = w / h;
    let dx = 0, dy = 0, dw = w, dh = h;
    if (imgRatio > targetRatio) { dw = h * imgRatio; dx = (w - dw) / 2; } 
    else { dh = w / imgRatio; dy = (h - dh) / 2; }
    ctx.drawImage(img, x + dx, y + dy, dw, dh);
    ctx.restore();
    ctx.strokeStyle = "#6d4727";
    ctx.lineWidth = 4;
    roundRect(ctx, x, y, w, h, 20);
    ctx.stroke();
}

function drawPlaceholder(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, label: string) {
    ctx.fillStyle = "#2a1b14";
    roundRect(ctx, x, y, w, h, 20);
    ctx.fill();
    ctx.fillStyle = "#777";
    ctx.font = `italic 30px ${bodyFont}`;
    ctx.textAlign = "center";
    ctx.fillText(label, x + w/2, y + h/2);
    ctx.textAlign = "left";
}

function drawStatBox(ctx: CanvasRenderingContext2D, label: string, val: string, x: number, y: number, w: number, h: number) {
    drawPanel(ctx, x, y, w, h, "rgba(141, 104, 65, 0.08)");
    ctx.fillStyle = "#8b6343";
    ctx.font = `700 20px ${bodyFont}`;
    ctx.fillText(label, x + 15, y + 35);
    ctx.fillStyle = "#2a1b14";
    ctx.font = `700 48px ${titleFont}`;
    ctx.fillText(val, x + 15, y + 85);
}

function drawAttributeCard(ctx: CanvasRenderingContext2D, label: string, val: string, mod: string, x: number, y: number, w: number, h: number) {
    drawPanel(ctx, x, y, w, h);
    ctx.fillStyle = "#8b6343";
    ctx.font = `700 22px ${bodyFont}`;
    ctx.fillText(label, x + 18, y + 35);
    ctx.fillStyle = "#2a1b14";
    ctx.font = `700 56px ${titleFont}`;
    ctx.fillText(val, x + 18, y + 95);
    ctx.fillStyle = "#6b3925";
    ctx.font = `700 40px ${bodyFont}`;
    ctx.fillText(mod, x + w - 70, y + 90);
}

function drawMagiasCol(ctx: CanvasRenderingContext2D, spells: SpellEntry[], x: number, y: number, w: number, h: number, title = "MAGIAS CONHECIDAS") {
    drawPanel(ctx, x, y, w, h);
    ctx.fillStyle = "#6b3925";
    ctx.font = `700 34px ${titleFont}`;
    ctx.fillText(title, x + INNER_PAD, y + 55);
    
    let curY = y + 100;
    let count = 0;
    if (spells.length === 0) {
        ctx.fillStyle = "#999";
        ctx.font = `italic 24px ${bodyFont}`;
        ctx.fillText("Sem magias.", x + INNER_PAD, curY);
        return 0;
    }

    for (const s of spells) {
        if (curY > y + h - 50) break; 
        
        ctx.fillStyle = "#6b3925";
        ctx.font = `700 22px ${bodyFont}`;
        ctx.fillText(`${s.name} (Nv ${s.level})`, x + INNER_PAD, curY);
        curY += 24;
        
        ctx.fillStyle = "#4a3321";
        ctx.font = `italic 17px ${bodyFont}`;
        const desc = s.description || "Sem descrição.";
        const lines = wrapText(ctx, desc, w - INNER_PAD * 2);
        
        // Show as many lines as fit for this spell
        let linesDrawn = 0;
        for (const line of lines.slice(0, 5)) {
            if (curY < y + h - 25) {
                ctx.fillText(line, x + INNER_PAD, curY);
                curY += 23;
                linesDrawn++;
            } else {
                break;
            }
        }
        curY += 15;
        count++;
    }
    return count;
}

function drawPericiasTable(ctx: CanvasRenderingContext2D, skills: any[], x: number, y: number, w: number, h: number) {
    drawPanel(ctx, x, y, w, h);
    ctx.fillStyle = "#6b3925";
    ctx.font = `700 28px ${titleFont}`;
    ctx.fillText("PERÍCIAS", x + INNER_PAD, y + 45);
    
    const tableY = y + 65;
    const rowH = 26; // More compact
    const col2X = x + w * 0.52;
    
    ctx.font = `500 19px ${bodyFont}`;
    
    let maxY = tableY;
    skills.forEach((s, i) => {
        const isCol2 = i >= 9;
        const rowIndex = isCol2 ? i - 9 : i;
        const curX = isCol2 ? col2X : x + INNER_PAD;
        const curY = tableY + rowIndex * rowH + rowH;
        
        if (curY > y + h - 10) return;
        if (curY > maxY) maxY = curY;

        // Marcador proficiência
        if (s.isProf) {
            ctx.fillStyle = "#8b6343";
            ctx.beginPath();
            ctx.arc(curX + 6, curY - 6, 5, 0, Math.PI * 2);
            ctx.fill();
        }
        
        ctx.fillStyle = "#2a1b14";
        ctx.textAlign = "left";
        ctx.fillText(s.label, curX + 20, curY);
        
        ctx.textAlign = "right";
        ctx.fillStyle = "#6b3925";
        ctx.fillText(s.value, (isCol2 ? x + w : col2X) - 15, curY);
        ctx.textAlign = "left";
        
        // Linha da tabela
        ctx.strokeStyle = "rgba(141, 104, 65, 0.12)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(curX, curY + 4);
        ctx.lineTo((isCol2 ? x + w : col2X) - 10, curY + 4);
        ctx.stroke();
    });
    return maxY + 20; 
}

function drawMiscCol(ctx: CanvasRenderingContext2D, char: Character, x: number, y: number, w: number, h: number) {
    const sectionH = (h - SECTION_GAP) / 2.2;
    
    // EQUIPAMENTO & ATAQUES
    drawPanel(ctx, x, y, w, sectionH);
    ctx.fillStyle = "#6b3925";
    ctx.font = `700 30px ${titleFont}`;
    ctx.fillText("EQUIPAMENTO & ATAQUES", x + INNER_PAD, y + 50);
    
    let curY = y + 90;
    
    // Auto-attacks from class
    const autoAttacks = getAutoAttacks(char);
    
    // Get all equipped items
    const inventoryList = char.inventoryList || [];
    const equipped = inventoryList.filter(item => item.eq);
    const legacyEquipped = char.inventory.split('\n')
        .filter(l => l.includes('[E]'))
        .map(l => {
            const parts = l.replace('[E]', '').replace(/^- /, '').split('|');
            return { n: parts[0].trim(), d: l.match(/Dano: ([^|]+)/)?.[1] || "" };
        });

    const allEquipped = [
        ...autoAttacks,
        ...equipped.map(it => ({ n: it.n, d: it.d })), 
        ...legacyEquipped
    ];

    if (allEquipped.length === 0) {
        ctx.fillStyle = "#999";
        ctx.font = `italic 22px ${bodyFont}`;
        ctx.fillText("Nenhum item equipado.", x + INNER_PAD, curY);
    } else {
        allEquipped.slice(0, 10).forEach(item => {
            if (curY > y + sectionH - 10) return;
            ctx.fillStyle = "#2a1b14";
            ctx.font = `700 22px ${bodyFont}`;
            ctx.fillText(item.n, x + INNER_PAD, curY);
            if (item.d) {
                ctx.textAlign = "right";
                ctx.fillStyle = "#8b6343";
                ctx.font = `600 18px ${bodyFont}`;
                ctx.fillText(item.d.length > 25 ? item.d.substring(0, 22) + '...' : item.d, x + w - INNER_PAD, curY);
                ctx.textAlign = "left";
            }
            curY += 28;
        });
    }

    // ESSENCIAIS (Habilidades de Classe, Talentos, etc)
    const essentialsY = y + sectionH + SECTION_GAP;
    const essentialsH = h - sectionH - SECTION_GAP;
    drawPanel(ctx, x, essentialsY, w, essentialsH);
    ctx.fillStyle = "#6b3925";
    ctx.font = `700 30px ${titleFont}`;
    ctx.fillText("HABILIDADES & TALENTOS", x + INNER_PAD, essentialsY + 50);
    
    let ey = essentialsY + 90;
    
    // Class Features (Auto)
    const autoFeatures = getClassFeatures(char);
    const userFeatures = (char.bio?.features || "").split('\n').filter(l => l.trim().length > 0);
    
    // Skill/Spell list abilities (anything not a level-based spell)
    // We treat level 0 as potential ability if it's name-matched or just display it as feature
    const listAbilities = (char.spellList || [])
        .filter(s => s.level === 0 || s.name.includes('(Estilo)') || s.description.includes('[Habilidade]'))
        .map(s => s.name);

    const allFeatures = [...autoFeatures, ...listAbilities, ...userFeatures];

    if (allFeatures.length > 0) {
        ctx.fillStyle = "#2a1b14";
        ctx.font = `500 19px ${bodyFont}`;
        allFeatures.forEach(feat => {
            if (ey > essentialsY + essentialsH - 40) return;
            const lines = wrapText(ctx, "• " + feat, w - INNER_PAD * 2);
            lines.forEach(l => {
                if (ey < essentialsY + essentialsH - 20) {
                    ctx.fillText(l, x + INNER_PAD, ey);
                    ey += 20;
                }
            });
            ey += 4;
        });
    }

    if (char.essence) {
        if (ey < essentialsY + essentialsH - 60) {
            ctx.fillStyle = "#8b6343";
            ctx.font = `700 22px ${bodyFont}`;
            ctx.fillText("ESSÊNCIA:", x + INNER_PAD, ey);
            ey += 30;
            ctx.fillStyle = "#2a1b14";
            ctx.font = `500 21px ${bodyFont}`;
            const lines = wrapText(ctx, char.essence, w - INNER_PAD * 2);
            lines.slice(0, 4).forEach(l => { 
                if (ey < essentialsY + essentialsH - 25) {
                    ctx.fillText(l, x + INNER_PAD, ey); 
                    ey += 24; 
                }
            });
            ey += 15;
        }
    }

    if (char.conditions?.length) {
        if (ey < essentialsY + essentialsH - 40) {
            ctx.fillStyle = "#8b6343";
            ctx.font = `700 22px ${bodyFont}`;
            ctx.fillText("CONDIÇÕES:", x + INNER_PAD, ey);
            ey += 30;
            ctx.fillStyle = "#cd1818";
            ctx.font = `700 21px ${bodyFont}`;
            ctx.fillText(char.conditions.join(", "), x + INNER_PAD, ey);
            ey += 35;
        }
    }

    if (char.inspiration && ey < essentialsY + essentialsH - 30) {
        ctx.fillStyle = "#6b3925";
        ctx.font = `bold 24px ${bodyFont}`;
        ctx.fillText("✦ INSPIRAÇÃO DISPONÍVEL", x + INNER_PAD, ey);
    }
}

// --- UTILS ---

function drawPanel(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, bgColor = "#fff9ef") {
  ctx.fillStyle = bgColor;
  roundRect(ctx, x, y, w, h, 20);
  ctx.fill();
  ctx.strokeStyle = "#8d6841";
  ctx.lineWidth = 3;
  ctx.stroke();
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath(); ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxW: number) {
  const words = text.split(' ');
  const lines = [];
  let current = words[0] || "";
  for (let i = 1; i < words.length; i++) {
    if (ctx.measureText(current + " " + words[i]).width < maxW) current += " " + words[i];
    else { lines.push(current); current = words[i]; }
  }
  if (current) lines.push(current);
  return lines;
}

async function injectPngMetadata(blob: Blob, keyword: string, text: string): Promise<Blob> {
  const buffer = await blob.arrayBuffer();
  const bytes = new Uint8Array(buffer);
  const keywordBytes = new TextEncoder().encode(keyword);
  const textBytes = new TextEncoder().encode(text);
  const iTXtData = new Uint8Array(keywordBytes.length + 5 + textBytes.length);
  iTXtData.set(keywordBytes, 0); iTXtData.set(textBytes, keywordBytes.length + 5);
  const chunk = makeChunk("iTXt", iTXtData);
  const iendOffset = findIEND(bytes);
  const result = new Uint8Array(bytes.length + chunk.length);
  result.set(bytes.slice(0, iendOffset), 0); result.set(chunk, iendOffset);
  result.set(bytes.slice(iendOffset), iendOffset + chunk.length);
  return new Blob([result], { type: 'image/png' });
}

function makeChunk(type: string, data: Uint8Array): Uint8Array {
  const typeBytes = new TextEncoder().encode(type);
  const chunk = new Uint8Array(12 + data.length);
  new DataView(chunk.buffer).setUint32(0, data.length);
  chunk.set(typeBytes, 4); chunk.set(data, 8);
  const crc = calculateCRC(chunk.slice(4, 8 + data.length));
  new DataView(chunk.buffer).setUint32(8 + data.length, crc);
  return chunk;
}

function findIEND(bytes: Uint8Array): number {
  for (let i = bytes.length - 8; i >= 0; i--) {
    if (bytes[i] === 73 && bytes[i+1] === 69 && bytes[i+2] === 78 && bytes[i+3] === 68) return i - 4;
  }
  return bytes.length;
}

function calculateCRC(bytes: Uint8Array): number {
  let crc = 0xffffffff;
  for (let b of bytes) {
    crc ^= b;
    for (let i = 0; i < 8; i++) crc = (crc & 1) ? (0xedb88320 ^ (crc >>> 1)) : (crc >>> 1);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function downloadBlob(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = name; a.click();
  URL.revokeObjectURL(url);
}

export async function extractCharacterFromPng(file: File): Promise<Character | null> {
  const buffer = await file.arrayBuffer();
  const bytes = new Uint8Array(buffer);
  let offset = 8;
  while (offset < bytes.length) {
    const length = new DataView(bytes.buffer).getUint32(offset);
    const type = new TextDecoder().decode(bytes.slice(offset + 4, offset + 8));
    if (type === "iTXt") {
      const data = bytes.slice(offset + 8, offset + 8 + length);
      let keywordEnd = 0; while (data[keywordEnd] !== 0) keywordEnd++;
      const keyword = new TextDecoder().decode(data.slice(0, keywordEnd));
      if (keyword === "card-json") {
        const text = new TextDecoder().decode(data.slice(keywordEnd + 5));
        return JSON.parse(text);
      }
    }
    offset += length + 12;
  }
  return null;
}
