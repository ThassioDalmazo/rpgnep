
import React, { useEffect, useState, useMemo, Dispatch, SetStateAction, useRef } from 'react';
import { compressImage } from '../lib/imageUtils';
import { exportCharacterToCard, extractCharacterFromPng } from './cardExport';
import { getMaxSpellCircle, getSpellsLimit } from '../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { Character, LogEntry, SpellEntry, InventoryItem, ItemEffect } from '../types';
import { LIST_CREATURES, LIST_AVATARS } from '../assets';
import { CLASSES_DB, SKILL_LIST, RACES_LIST, BACKGROUNDS_DB, COMMON_WEAPONS, SPELLS_DB, CLASS_FEATURES, ARMOR_DB, FEATS_DB, DEFAULT_MONSTERS, INITIAL_CHAR, RACE_BONUSES, CLASS_STARTING_EQUIPMENT, BACKGROUND_STARTING_EQUIPMENT, SLOTS_TABLE, PACT_SLOTS, CLASS_SPELLS, SUBCLASS_FEATURES, SUBCLASS_SPELLS, RACE_FEATURES, FIGHTING_STYLES, MAGIC_ITEMS_DB, CONDITIONS_LIST } from '../constants';
import { Sword, Shield, Heart, Zap, Scroll, Backpack, Save, Upload, Skull, Brain, Plus, ChevronDown, ChevronRight, Book, Moon, Trash2, ArrowUpCircle, Sparkles, Calculator, AlertTriangle, List, FileText, Check, X, Search, User, Camera, Eraser, BookOpen, Library, Flame, Link as LinkIcon, Star, Hammer, ShoppingBag, Store, CircleDollarSign, GripVertical, Image as ImageIcon, Download, Move, RotateCcw, Wind, Clock, MinusCircle, Dices, Ghost, Info } from 'lucide-react';

interface Props {
  char: Character;
  setChar: Dispatch<SetStateAction<Character>>;
  onRoll: (d: number, mod: number, label: string) => void;
  onDelete: () => void;
  isNPC?: boolean;
  permissions?: {
    canMoveTokens: boolean;
    canEditCharacters: boolean;
    canRollDice: boolean;
  };
  setConfirmModal?: (modal: {message: string, onConfirm: () => void, onCancel?: () => void} | null) => void;
  addLog?: (title: string, details: string, type?: LogEntry['type']) => void;
}

const toSpellEntry = (sName: string): SpellEntry => {
    // Busca normalizada para melhorar a "correção" automática
    const normalizedSearch = sName.trim().toLowerCase();
    const foundEntry = Object.entries(SPELLS_DB).find(([key]) => key.toLowerCase() === normalizedSearch);
    const sInfo = (foundEntry ? foundEntry[1] : null) || SPELLS_DB[sName] || { 
        level: "0", desc: "", castingTime: "1 Ação", range: "Pessoal", components: "V, S", duration: "Instantânea", concentration: false 
    };
    
    // Se encontrou, usa o nome oficial da DB
    const finalName = foundEntry ? foundEntry[0] : sName;
    
    return {
        id: finalName.toLowerCase().replace(/\s+/g, '-') + '-' + Math.random().toString(36).substring(2, 5),
        name: finalName,
        level: sInfo.level === 'Truque' ? 0 : parseInt(sInfo.level.replace(/\D/g, '')) || 0,
        school: sInfo.school || 'Magia',
        castingTime: sInfo.castingTime || "1 Ação",
        range: sInfo.range || "Pessoal",
        components: sInfo.components || "V, S",
        duration: sInfo.duration || "Instantânea",
        concentration: sInfo.concentration || false,
        description: sInfo.desc || "",
        prepared: true
    };
};

const POINT_BUY_COSTS: Record<number, number> = { 8: 0, 9: 1, 10: 2, 11: 3, 12: 4, 13: 5, 14: 7, 15: 9 };

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

const DAMAGE_TYPES = ['Cortante', 'Perfurante', 'Concussão', 'Ácido', 'Fogo', 'Frio', 'Elétrico', 'Trovejante', 'Venenoso', 'Psíquico', 'Radiante', 'Necrótico', 'Força'];
const RARITIES = ['Comum', 'Incomum', 'Raro', 'Muito Raro', 'Lendário', 'Artefato'];

// --- SHOP DATA ---
const SHOP_ITEMS = [
    { cat: 'Armas Básicas', items: [
        { n: 'Adaga', c: 2, w: '0.5kg', d: 'Dano: 1d4 perfurante | Acuidade, Leve, Arr (6/18) | Uma pequena lâmina versátil, fácil de ocultar e perfeita para ataques rápidos ou arremessos precisos.' },
        { n: 'Azagaia', c: 0.5, w: '1kg', d: 'Dano: 1d6 perfurante | Arr (9/36) | Uma lança leve projetada especificamente para ser arremessada com precisão à distância.' },
        { n: 'Bordão', c: 0.2, w: '2kg', d: 'Dano: 1d6 concussão | Versátil (1d8) | Um bastão de madeira resistente, foco comum para magos e monges iniciantes.' },
        { n: 'Clava', c: 0.1, w: '1kg', d: 'Dano: 1d4 concussão | Leve | Um pedaço de madeira bruta ou osso pesado, simples mas extremamente contundente.' },
        { n: 'Lança', c: 1, w: '1.5kg', d: 'Dano: 1d6 perfurante | Arr (6/18), Versátil (1d8) | A arma padrão das milícias terrestres, versátil e letal em mãos treinadas.' },
        { n: 'Maça', c: 5, w: '2kg', d: 'Dano: 1d6 concussão | Uma cabeça de metal pesada em um cabo curto, projetada para ignorar a proteção de armaduras leves.' },
        { n: 'Arco Curto', c: 25, w: '1kg', d: 'Dano: 1d6 perfurante | Mun (24/96), 2 Mãos | Rápido e fácil de manusear, ideal para fustigar inimigos em movimento.' },
        { n: 'Besta Leve', c: 25, w: '2.5kg', d: 'Dano: 1d8 perfurante | Mun (24/96), Recarga, 2 Mãos | Mecânica simples com alto poder de penetração, favorita de guardas de muralha.' },
    ]},
    { cat: 'Armas Marciais', items: [
        { n: 'Espada Curta', c: 10, w: '1kg', d: 'Dano: 1d6 perfurante | Acuidade, Leve | A lâmina ágil do soldado de elite, ideal para o combate próximo e manobras furtivas.' },
        { n: 'Espada Longa', c: 15, w: '1.5kg', d: 'Dano: 1d8 cortante | Versátil (1d10) | A arma clássica da cavalaria, letal tanto com uma proteção de escudo quanto com as duas mãos.' },
        { n: 'Rapieira', c: 25, w: '1kg', d: 'Dano: 1d8 perfurante | Acuidade | Uma espada fina e flexível para duelistas que prezam pela precisão cirúrgica em vez de força.' },
        { n: 'Cimitarra', c: 25, w: '1.5kg', d: 'Dano: 1d6 cortante | Acuidade, Leve | Lâmina curva elegante que favorece ataques fluidos e rápidos em sucessão.' },
        { n: 'Machado Grande', c: 30, w: '3.5kg', d: 'Dano: 1d12 cortante | Pesada, 2 Mãos | Uma massa de metal massiva capaz de decapitar oponentes com um único golpe bem desferido.' },
        { n: 'Espada Grande', c: 50, w: '3kg', d: 'Dano: 2d6 cortante | Pesada, 2 Mãos | Requer grande força para liberar seu potencial devastador, capaz de varrer campos de batalha.' },
        { n: 'Alabarda', c: 20, w: '3kg', d: 'Dano: 1d10 cortante | Pesada, Alcance, 2 Mãos | Mantém os inimigos à distância com sua haste longa e lâmina de machado poderosa.' },
        { n: 'Martelo de Guerra', c: 15, w: '1kg', d: 'Dano: 1d8 concussão | Versátil (1d10) | Projetado especificamente para esmagar placas de metal e ossos através de tecidos grossos.' },
        { n: 'Arco Longo', c: 50, w: '1kg', d: 'Dano: 1d8 perfurante | Mun (45/180), Pesada, 2 Mãos | Alcance superior e precisão fatal em mãos de arqueiros treinados em ambientes abertos.' },
        { n: 'Besta Pesada', c: 50, w: '8kg', d: 'Dano: 1d10 perfurante | Mun (30/120), Recarga, Pesada, 2 Mãos | Um coice de metal que atravessa as proteções mais pesadas com força bruta.' },
        { n: 'Besta de Mão', c: 75, w: '1.5kg', d: 'Dano: 1d6 perfurante | Mun (9/36), Leve, Recarga | Compacta o suficiente para ser usada secretamente, ideal para disparos inesperados.' },
    ]},
    { cat: 'Armaduras & Escudos', items: [
        { n: 'Couro', c: 10, w: '5kg', d: 'CA 11 + Des | Proteção básica de couro fervido que não limita os movimentos do usuário.' },
        { n: 'Couro Batido', c: 45, w: '6.5kg', d: 'CA 12 + Des | Reforçada com tachas de metal estrategicamente posicionadas para maior resistência.' },
        { n: 'Camisão de Malha', c: 50, w: '10kg', d: 'CA 13 + Des (máx 2) | Uma rede de anéis de aço que protege o tronco sem ser excessivamente pesada.' },
        { n: 'Peitoral', c: 400, w: '10kg', d: 'CA 14 + Des (máx 2) | Uma placa de metal de alta qualidade cobrindo apenas o peito e abdômen.' },
        { n: 'Meia-Armadura', c: 750, w: '20kg', d: 'CA 15 + Des (máx 2) | Desv. Furtividade | Quase uma armadura completa, protegendo a maioria das áreas vitais.' },
        { n: 'Cota de Malha', c: 75, w: '27.5kg', d: 'CA 16 | Requer For 13, Desv. Furtividade | Cobertura total de metal, pesada e ruidosa, mas muito confiável.' },
        { n: 'Cota de Talas', c: 200, w: '30kg', d: 'CA 17 | Requer For 15, Desv. Furtividade | Tiras de metal sobrepostas oferecendo excelente defesa física em combate frontal.' },
        { n: 'Placas', c: 1500, w: '32.5kg', d: 'CA 18 | Requer For 15, Desv. Furtividade | O ápice da forja medieval; o usuário se torna uma fortaleza ambulante no campo de batalha.' },
        { n: 'Escudo', c: 10, w: '3kg', d: '+2 na CA | Uma prancha reforçada de madeira ou metal, essencial para a sobrevivência em linhas de frente.' },
    ]},
    { cat: 'Poções & Consumíveis', items: [
        { n: 'Poção de Cura', c: 50, w: '0.5kg', d: 'Um líquido vermelho cintilante que fecha ferimentos instantaneamente (recupera 2d4+2 PVs).' },
        { n: 'Poção de Cura Maior', c: 150, w: '0.5kg', d: 'Uma infusão potente que regenera tecidos profundamente (recupera 4d4+4 PVs).' },
        { n: 'Poção de Cura Superior', c: 450, w: '0.5kg', d: 'O segredo dos alquimistas reais para curar danos catastróficos (recupera 8d4+8 PVs).' },
        { n: 'Água Benta', c: 25, w: '0.5kg', d: 'Água abençoada por rituais de clérigos, causa dano radiante letal contra seres da escuridão e mortos-vivos.' },
        { n: 'Fogo de Alquimista', c: 50, w: '0.5kg', d: 'Uma mistura volátil em frasco de vidro que se incendeia violentamente ao entrar em contato com o ar.' },
        { n: 'Ácido (Frasco)', c: 25, w: '0.5kg', d: 'Líquido corrosivo capaz de dissolver metal e carne com ferocidade química.' },
        { n: 'Veneno Básico', c: 100, w: '0.5kg', d: 'Toxina simples para aplicar em lâminas e munições, garantindo dano extra às vítimas.' },
        { n: 'Antídoto', c: 50, w: '0.5kg', d: 'Neutraliza toxinas comuns no sangue e ajuda a proteger contra paralisia causada por venenos.' },
    ]},
    { cat: 'Equipamento de Aventura', items: [
        { n: 'Mochila', c: 2, w: '2.5kg', d: 'Robusta e espaçosa, feita de couro reforçado, o lar portátil essencial de todo aventureiro.' },
        { n: 'Pacote de Explorador', c: 10, w: '25kg', d: 'Equipamento básico completo: mochila, saco de dormir, kit de refeição, pederneira, 10 tochas, 10 dias de rações e um cantil.' },
        { n: 'Pacote de Masmorreiro', c: 12, w: '30kg', d: 'Especializado para dungeons: inclui mochila, pé de cabra, martelo, 10 pítons, 10 tochas, pederneira, 10 dias de rações e 15m de corda.' },
        { n: 'Pé de Cabra', c: 2, w: '2.5kg', d: 'Uma ferramenta de aço para alavancagem.' },
        { n: 'Martelo', c: 1, w: '1kg', d: 'Um martelo de ferro para pregar pítons ou construir.' },
        { n: 'Pederneira e Isqueiro', c: 1, w: '-', d: 'Usado para acender fogo rapidamente.' },
        { n: 'Corda de Cânhamo (15m)', c: 1, w: '5kg', d: 'Fibra natural robusta.' },
        { n: 'Tocha', c: 0.01, w: '0.5kg', d: 'Brilha por 1 hora.' },
        { n: 'Rações (1 dia)', c: 0.5, w: '1kg', d: 'Comida seca.' },
        { n: 'Cantil', c: 0.2, w: '2.5kg', d: 'Transporta água.' },
        { n: 'Saco de Dormir', c: 1, w: '3.5kg', d: 'Cobertor térmico.' },
        { n: 'Algemas', c: 2, w: '3kg', d: 'Para prender prisioneiros.' },
    ]},
    { cat: 'Ferramentas', items: [
        { n: 'Kit de Herbalismo', c: 5, w: '1.5kg', d: 'Ferramentas para criar poções de cura e antídotos.' },
        { n: 'Kit de Envenenador', c: 50, w: '1kg', d: 'Componentes para extrair e aplicar toxinas.' },
        { n: 'Ferramentas de Alquimista', c: 50, w: '4kg', d: 'Equipamento para transmutar substâncias.' },
        { n: 'Ferramentas de Ferreiro', c: 20, w: '4kg', d: 'Para reparar e forjar metal.' },
        { n: 'Utensílios de Cozinheiro', c: 1, w: '4kg', d: 'Panelas e temperos.' },
    ]},
    { cat: 'Montarias & Sela', items: [
        { n: 'Cavalo de Carga', c: 50, w: '-', d: 'Animal de tração lento e forte.' },
        { n: 'Cavalo de Montaria', c: 75, w: '-', d: 'Veloz e ágil.' },
        { n: 'Pônei', c: 30, w: '-', d: 'Ideal para raças pequenas.' },
        { n: 'Sela de Carga', c: 5, w: '7.5kg', d: 'Para cavalos de bagagem.' },
        { n: 'Sela de Montaria', c: 10, w: '12.5kg', d: 'Para viajantes.' },
    ]},
    { cat: 'Ferramentas & Kits', items: [
        { n: 'Ferramentas de Ladrão', c: 25, w: '0.5kg', d: 'Um conjunto de gazuas, limas e espelhos pequenos para manipular mecanismos de trancas e armadilhas.' },
        { n: 'Kit de Primeiros Socorros', c: 5, w: '1.5kg', d: 'Bandagens, pomadas e talas para estabilizar ferimentos graves em pleno combate (possui 10 usos).' },
        { n: 'Kit de Escalar', c: 25, w: '6kg', d: 'Botas com travas, luvas de couro e arneses para auxiliar nas subidas mais verticais e perigosas.' },
        { n: 'Foco Arcano', c: 10, w: '1kg', d: 'Um cajado, cristal ou orbe que permite ao conjurador canalizar as energias místicas sem necessidade de componentes materiais comuns.' },
        { n: 'Símbolo Sagrado', c: 5, w: '0.5kg', d: 'O emblema sagrado da divindade do portador, servindo como canalizador de fé e proteção divina.' },
        { n: 'Instrumento Musical', c: 30, w: '3kg', d: 'Seja um alaúde, flauta ou tambor, este instrumento é usado para encantar plateias e inspirar aliados.' },
        { n: 'Livro de Magias', c: 50, w: '1.5kg', d: 'Um tomo volumoso de pergaminho onde magos transcrevem as fórmulas matemáticas e rúnicas de seus feitiços.' },
    ]},
    { cat: 'Itens Mágicos Comuns', items: [
        { n: 'Mochila de Carga (Bag of Holding)', c: 500, w: '7kg', d: 'Item Mágico | O interior é um espaço extradimensional capaz de carregar até 250kg independentemente do seu peso externo.' },
        { n: 'Corda de Escalada', c: 100, w: '1.5kg', d: 'Item Mágico | Uma corda encantada que obedece comandos vocais simples, como se fixar em um ponto ou se enrolar sozinha.' },
        { n: 'Pedra de Mensagem (Par)', c: 200, w: '-', d: 'Item Mágico | Permite a comunicação vinda de uma pedra aparecer na mente do portador da outra em grandes distâncias.' },
        { n: 'Bastão Imovível', c: 300, w: '1kg', d: 'Item Mágico | Ao pressionar o botão, o bastão se fixa no espaço ocupado, suportando toneladas de peso sem se mover do lugar.' },
        { n: 'Botas Élficas', c: 400, w: '-', d: 'Item Mágico | Sapatilhas de veludo mágico que tornam o caminhar totalmente silencioso, garantindo vantagem em Furtividade.' },
        { n: 'Manto da Proteção', c: 350, w: '-', d: 'Item Mágico | Um traje abençoado que desvia ataques magicamente, conferindo +1 na CA e testes de resistência.' },
        { n: 'Anel de Caminhar na Água', c: 600, w: '-', d: 'Item Mágico | Permite ao usuário andar sobre líquidos como se fossem terrenos sólidos.' },
        { n: 'Gema da Luminosidade', c: 150, w: '0.1kg', d: 'Item Mágico | Uma gema que brilha intensamente quando segurada, dissipando escuridão mágica em um curto alcance.' },
    ]}
];

const ALL_SHOP_ITEMS: Record<string, { n: string, d: string, w: string, c: number }> = {};
SHOP_ITEMS.forEach(cat => {
    cat.items.forEach(item => {
        ALL_SHOP_ITEMS[item.n.toLowerCase()] = item;
    });
});

const AUTO_ACTIONS: Record<string, { type: 'inv' | 'spell', text: string }> = {
    'Fúria': { type: 'spell', text: '[Habilidade] Fúria (Bárbaro): Dano +2, Vantagem FOR, Resistência Físico' },
    'Ataque Descuidado': { type: 'spell', text: '[Habilidade] Ataque Descuidado: Vantagem no ataque, Inimigos têm Vantagem em você' },
    'Inspiração de Bardo (d6)': { type: 'spell', text: '[Habilidade] Inspiração de Bardo: Dado 1d6 | Bônus Action, 18m' },
    'Canção de Descanso (d6)': { type: 'spell', text: '[Habilidade] Canção de Descanso: Cura 1d6 extra no descanso curto' },
    'Canalizar Divindade (1/descanso)': { type: 'spell', text: '[Habilidade] Canalizar Divindade: Uso 1/descanso curto' },
    'Forma Selvagem': { type: 'spell', text: '[Habilidade] Forma Selvagem: Transformação em Besta | 2/descanso curto' },
    'Retomar o Fôlego': { type: 'spell', text: '[Habilidade] Retomar o Fôlego: Cura 1d10 + Nível | Ação Bônus, 1/descanso' },
    'Surto de Ação': { type: 'spell', text: '[Habilidade] Surto de Ação: Ganha 1 ação extra | 1/descanso' },
    'Indomável': { type: 'spell', text: '[Habilidade] Indomável: Refaz um teste de resistência falho | 1/dia' },
    'Crítico Aprimorado': { type: 'spell', text: '[Habilidade] Crítico Aprimorado: Acerto crítico com 19 ou 20 no dado' },
    'Arquearia (Estilo)': { type: 'spell', text: '[Habilidade] Estilo de Luta: Arquearia | +2 de bônus em jogadas de ataque com armas à distância' },
    'Defesa (Estilo)': { type: 'spell', text: '[Habilidade] Estilo de Luta: Defesa | +1 de bônus na CA enquanto estiver usando armadura' },
    'Duelismo (Estilo)': { type: 'spell', text: '[Habilidade] Estilo de Luta: Duelismo | +2 de bônus em jogadas de dano com armas corpo-a-corpo em uma mão (sem outra arma)' },
    'Combate com Armas Grandes (Estilo)': { type: 'spell', text: '[Habilidade] Estilo de Luta: Armas Grandes | Quando rolar 1 ou 2 no dado de dano de arma de duas mãos, você pode rolar novamente' },
    'Proteção (Estilo)': { type: 'spell', text: '[Habilidade] Estilo de Luta: Proteção | Reação: Imponha desvantagem no ataque contra um aliado a 1,5m (requer escudo)' },
    'Combate com Duas Armas (Estilo)': { type: 'spell', text: '[Habilidade] Estilo de Luta: Duas Armas | Você pode adicionar seu modificador de atributo ao dano do segundo ataque' },
    'Cegueira (Estilo)': { type: 'spell', text: '[Habilidade] Estilo de Luta: Luta às Cegas | Você tem percepção às cegas em um raio de 3 metros' },
    'Intercepção (Estilo)': { type: 'spell', text: '[Habilidade] Estilo de Luta: Intercepção | Reação: Reduz o dano de um ataque contra aliado próximo em 1d10 + Prof' },
    'Artes Marciais': { type: 'spell', text: '[Ataque] Artes Marciais: Pode usar DES em ataques desarmados; Ataque bônus desarmado se atacar com arma de monge' },
    'Ki': { type: 'spell', text: '[Habilidade] Pontos de Ki: Recurso para habilidades de Monge. Recupera em Descanso Curto.' },
    'Rajada de Golpes': { type: 'spell', text: '[Ataque] Rajada de Golpes (1 Ki): Realiza dois ataques desarmados como ação bônus' },
    'Defesa Paciente': { type: 'spell', text: '[Habilidade] Defesa Paciente (1 Ki): Ação de Esquiva como ação bônus' },
    'Passo do Vento': { type: 'spell', text: '[Habilidade] Passo do Vento (1 Ki): Desengajar ou Disparar como bônus; dobra pulo' },
    'Defletir Projéteis': { type: 'spell', text: '[Habilidade] Defletir Projéteis: Reação para reduzir dano de projétil em 1d10 + DES + Nv. Se zerar, pode arremessar de volta (1 Ki)' },
    'Ataque Atordoante': { type: 'spell', text: '[Habilidade] Ataque Atordoante (1 Ki): Alvo faz TR de Con ou fica atordoado até seu próx. turno' },
    'Queda Lenta': { type: 'spell', text: '[Habilidade] Queda Lenta (Reação): Reduz dano de queda em 5x seu nível de Monge' },
    'Golpes de Ki': { type: 'spell', text: '[Habilidade] Golpes de Ki: Seus ataques desarmados contam como mágicos para superar resistências' },
    'Evasão': { type: 'spell', text: '[Habilidade] Evasão: Em testes de DES para metade do dano, você não sofre dano se passar e apenas metade se falhar' },
    'Mente Tranquila': { type: 'spell', text: '[Habilidade] Mente Tranquila: Ação para encerrar um efeito de medo ou charme em si mesmo' },
    'Mão Aberta: Técnica': { type: 'spell', text: '[Habilidade] Técnica da Mão Aberta: Rajada de Golpes pode derrubar (TR For), empurrar (TR For 4.5m) ou impedir reações' },
    'Integridade Corporal': { type: 'spell', text: '[Habilidade] Integridade Corporal: Ação p/ recuperar PV = 3x seu nível de Monge | 1/Descanso Longo' },
    'Cura pelas Mãos': { type: 'spell', text: '[Habilidade] Cura pelas Mãos: Pool 5 x Nível PV | Toque' },
    'Destruição Divina (Smite)': { type: 'spell', text: '[Habilidade] Destruição Divina (Smite): Dano 2d8 Radiante (+1d8/slot)' },
    'Ataque Furtivo (1d6)': { type: 'spell', text: '[Habilidade] Ataque Furtivo: Dano 1d6 extra | Requer Vantagem ou Aliado 1.5m' },
    'Ação Astuta': { type: 'spell', text: '[Habilidade] Ação Astuta: Dash, Disengage ou Hide como Ação Bônus' },
    'Fonte de Magia (Pontos de Feitiçaria)': { type: 'spell', text: '[Habilidade] Pontos de Feitiçaria: Recurso para Metamagia e Slots' },
    'Invocações Místicas': { type: 'spell', text: '[Habilidade] Invocações Místicas: Consulte suas escolhas de classe.' },
    'Recuperação Arcana': { type: 'spell', text: '[Habilidade] Recuperação Arcana: Recupera slots (Nível/2) no descanso curto' },
    'Infusão de Itens': { type: 'spell', text: '[Habilidade] Infusão de Itens: Infusões de Artífice | Melhora itens mundanos' },
    // Racial Actions
    'Sopro Dracônico': { type: 'spell', text: '[Ataque] Sopro Dracônico: Dano 2d6 (teste Des/Con CD 8+Prof+Con). Escala no Nv 5 (3d6) e Nv 11 (4d6).' },
    'Segundo Sopro (Controle)': { type: 'spell', text: '[Habilidade] Segundo Sopro (Metal): Efeito de controle (Empurrar ou Incapacitar).' },
    'Alma Radiante': { type: 'spell', text: '[Habilidade] Alma Radiante (Aasimar): Voo 9m, Dano extra Radiante = Prof (1/turno).' },
    'Consumo Radiante': { type: 'spell', text: '[Habilidade] Consumo Radiante (Aasimar): Aura 3m, Dano Radiante = Prof (1/turno).' },
    'Sudário Necrótico': { type: 'spell', text: '[Habilidade] Sudário Necrótico (Aasimar): Amedrontar, Dano extra Necrótico = Prof (1/turno).' },
    'Mudança de Forma (Shifter)': { type: 'spell', text: '[Habilidade] Mudança de Forma: Ganha PV Temp (Prof + Nível) e efeito animal.' },
    'Bênção da Rainha Corvo': { type: 'spell', text: '[Habilidade] Bênção da Rainha Corvo: Teleporte 9m (Ação Bônus). No Nv 3 concede resistência.' },
    'Passo Feérico': { type: 'spell', text: '[Habilidade] Passo Feérico (Eladrin): Teleporte 9m (Ação Bônus). No Nv 3 ganha efeito de Estação.' },
    'Fúria dos Pequenos': { type: 'spell', text: '[Habilidade] Fúria dos Pequenos (Goblin): Dano extra = Nível (1/descanso curto).' },
    'Grito Dracônico': { type: 'spell', text: '[Habilidade] Grito Dracônico (Kobold): Vantagem aliados (1/descanso longo).' },
    'Rugido Assustador': { type: 'spell', text: '[Habilidade] Rugido Assustador (Leonino): Amedronta em cone 3m (1/descanso curto).' },
    'Mandíbulas Famintas': { type: 'spell', text: '[Ataque] Mandíbulas Famintas (Lagarto): Ataque mordida, ganha PV Temp = Prof (1/descanso curto).' },
    'Corrida de Adrenalina': { type: 'spell', text: '[Habilidade] Corrida de Adrenalina (Orc): Dash (Ação Bônus) + PV Temp = Prof.' },
    'Salto do Coelho': { type: 'spell', text: '[Habilidade] Salto do Coelho (Harengon): Salto (Ação Bônus) de (Prof x 1.5) metros.' },
    'Truque de Mago': { type: 'spell', text: '[Truque] Truque de Mago: Escolha um truque de Mago. Dano escala nos níveis 5, 11 e 17.' },
    'Ilusão Menor (Gnomo)': { type: 'spell', text: '[Truque] Ilusão Menor: Cria sons ou imagens simples.' },
    'Taumaturgia (Tiefling)': { type: 'spell', text: '[Truque] Taumaturgia: Manifestações sobrenaturais menores.' },
    // Subclass Actions - Warrior
    'Manifestar Eco': { type: 'spell', text: '[Habilidade] Manifestar Eco (Ação Bônus): Cria uma imagem cinzenta de si mesmo em 4.5m. Pode atacar de sua posição.' },
    'Manto do Gigante': { type: 'spell', text: '[Habilidade] Manto do Gigante (Ação Bônus): Torna-se Grande por 1 min. Vantagem em FOR e +1d6 de dano (1/turno).' },
    // Subclass Actions - Cleric
    'Santuário do Crepúsculo': { type: 'spell', text: '[Canalizar Divindade] Santuário do Crepúsculo: Aura 9m por 1 min. Aliados ganham 1d6 + Nível PV Temp ou terminam Encantado/Amedrontado.' },
    'Voz da Autoridade': { type: 'spell', text: '[Habilidade] Voz da Autoridade: Ao conjurar magia de 1º nvl+ em aliado, ele pode usar Reação para um ataque imediato.' },
    // Subclass Actions - Bard
    'Palavras de Inquietude': { type: 'spell', text: '[Inspiração] Palavras de Inquietude: Alvo subtrai o dado de Inspiração da próxima salvaguarda.' },
    'Lâmina Psíquica': { type: 'spell', text: '[Inspiração] Lâmina Psíquica: Gasta Inspiração para causar dano extra psíquico em ataque (2d6 escalonável).' },
    // Subclass Actions - Warlock
    'Respaldar do Gênio': { type: 'spell', text: '[Habilidade] Respaldar do Gênio: Adiciona dano extra (Igual Proficiência) 1/turno do elemento do seu Gênio.' },
    'Presença Feérica': { type: 'spell', text: '[Habilidade] Presença Feérica (Ação): Criaturas em cubo de 3m devem resistir a CD de Magia ou ficar Encantadas/Amedrontadas.' },
};

const DICE_TYPES = [4, 6, 8, 10, 12, 20];

// Basic XP progression table for D&D 5e
const XP_TABLE: number[] = [0, 300, 900, 2700, 6500, 14000, 23000, 34000, 48000, 64000, 85000, 100000, 120000, 140000, 165000, 195000, 225000, 265000, 305000, 355000];

export const CharacterSheet: React.FC<Props> = ({ char, setChar: originalSetChar, onRoll: originalOnRoll, onDelete, isNPC = false, permissions, setConfirmModal, addLog = () => {} }) => {
  const setChar: Dispatch<SetStateAction<Character>> = (value) => {
    if (permissions && !permissions.canEditCharacters) {
      return;
    }
    originalSetChar(value);
  };

  const onRoll = (d: number, mod: number, label: string) => {
    if (permissions && !permissions.canRollDice) {
      return;
    }
    originalOnRoll(d, mod, label);
  };

  const [activeTab, setActiveTab] = useState<'main' | 'combat' | 'spells' | 'inv' | 'bio'>('main');
  const [creationStep, setCreationStep] = useState<number | null>(null);

  const getSpellLines = () => char.spells.known.split('\n').filter(line => line.trim() !== '');

  const categorizedActions = useMemo(() => {
    const cantrips = (char.spellList || []).filter(s => s.level === 0);
    const leveledSpells = (char.spellList || []).filter(s => s.level > 0 && s.prepared);
    
    const simpleActions = getSpellLines();
    const raceAbilities: string[] = [];
    const attacks: string[] = [];
    const classAbilities: string[] = [];
    const simpleSpells: string[] = [];

    simpleActions.forEach(line => {
      const lower = line.toLowerCase();
      const isRace = lower.includes('[raça]') || lower.includes('[racial]');
      const isAttack = lower.includes('[ataque]') || lower.includes('ataque') || lower.includes('dano') || line.match(/\d+d\d+/);
      const isSpell = lower.includes('[magia]');
      const isAbility = lower.includes('[habilidade]');

      if (isRace) raceAbilities.push(line);
      else if (isAttack) attacks.push(line);
      else if (isSpell) simpleSpells.push(line);
      else if (isAbility) classAbilities.push(line);
      else classAbilities.push(line); // Default
    });
    
    return { cantrips, leveledSpells, raceAbilities, attacks, classAbilities, simpleSpells };
  }, [char.spellList, char.spells.known]);

  const getActionColor = (type: 'spell' | 'cantrip' | 'ability' | 'attack' | 'race') => {
    switch(type) {
      case 'spell': return 'bg-blue-600';
      case 'cantrip': return 'bg-green-600';
      case 'ability': return 'bg-amber-600';
      case 'attack': return 'bg-rose-600';
      case 'race': return 'bg-violet-600';
      default: return 'bg-stone-800';
    }
  };

  const rollLevelUpHP = () => {
    const hitDieSize = CLASSES_DB[levelUpClass]?.dv || 8;
    const roll = Math.floor(Math.random() * hitDieSize) + 1;
    const conMod = getMod(char.attributes.con);
    setNewLevelHP(Math.max(1, roll + conMod));
    addLog?.("Sistema", `Rolou d${hitDieSize} para vida extra: **${roll}** (Total +${Math.max(1, roll + conMod)})`, 'dice');
  };

  const pointsSpent = useMemo(() => {
    return Object.entries(char.attributes).reduce((acc, [attr, val]) => {
      const raceBonus = RACE_BONUSES[char.race]?.attrs?.[attr as keyof typeof char.attributes] || 0;
      const base = val - raceBonus;
      return acc + (POINT_BUY_COSTS[base] || 0);
    }, 0);
  }, [char.attributes, char.race]);
  const [showWeapons, setShowWeapons] = useState(false);
  const [showArmors, setShowArmors] = useState(false);
  const [spellSearch, setSpellSearch] = useState('');
  const [archiveLevelFilter, setArchiveLevelFilter] = useState<number | 'all'>('all');
  const [archiveConcentrationFilter, setArchiveConcentrationFilter] = useState(false);
  const [archiveRitualFilter, setArchiveRitualFilter] = useState(false);
  const [archiveSchoolFilter, setArchiveSchoolFilter] = useState<string>('Todas');
  const [archiveClassFilter, setArchiveClassFilter] = useState<string>('Todas');
  const [showShop, setShowShop] = useState(false);
  const [shopSearch, setShopSearch] = useState('');
  const [showFeatsModal, setShowFeatsModal] = useState(false);
  const [featSearch, setFeatSearch] = useState('');
  const [showGrimorioBook, setShowGrimorioBook] = useState(false);
  const [showBibliotecarioBook, setShowBibliotecarioBook] = useState(false);

  const [showLevelUp, setShowLevelUp] = useState(false);
  const [levelUpClass, setLevelUpClass] = useState('');
  const [levelUpStep, setLevelUpStep] = useState(0); 
  const [newLevelHP, setNewLevelHP] = useState(0);
  const [asiPoints, setAsiPoints] = useState<Record<string, number>>({ str: 0, dex: 0, con: 0, int: 0, wis: 0, cha: 0 });
  const [levelUpChoice, setLevelUpChoice] = useState<'asi'|'feat'>('asi');
  const [levelUpFeat, setLevelUpFeat] = useState('');
  const [levelUpSubclass, setLevelUpSubclass] = useState('');
  const [levelUpFightingStyle, setLevelUpFightingStyle] = useState('');
  const [selectedLevelUpSpells, setSelectedLevelUpSpells] = useState<string[]>([]);

  // Avatar Selection State
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [showPositionModal, setShowPositionModal] = useState(false);
  const [avatarSearch, setAvatarSearch] = useState('');
  const [avatarTab, setAvatarTab] = useState<'avatars' | 'creatures' | 'all'>('avatars');
  const [localAssets, setLocalAssets] = useState<string[]>([]);

  useEffect(() => {
    if (showAvatarModal && localAssets.length === 0) {
      fetch('/api/assets/creatures')
        .then(res => res.json())
        .then(data => setLocalAssets(data))
        .catch(err => console.error("Erro ao carregar avatares:", err));
    }
  }, [showAvatarModal, localAssets.length]);

  // Accordion state for spells
  const [expandedSpellLevels, setExpandedSpellLevels] = useState<Record<string, boolean>>({});

  const [customSpell, setCustomSpell] = useState({ 
      name: '', level: 'Truque', school: 'Evocação', 
      time: '1 Ação', range: '18m', duration: 'Instantânea', 
      desc: '', damage: '', damageType: 'Fogo',
      components: { v: false, s: false, m: false },
      concentration: false, ritual: false,
      saveAttr: 'Nenhum'
  });

  const [customItem, setCustomItem] = useState({ 
      name: '', type: 'Arma', rarity: 'Comum',
      damage: '', damageType: 'cortante',
      ac: 0, props: '', weight: '', cost: '',
      attunement: false, desc: ''
  });

  const [invViewMode, setInvViewMode] = useState<'list' | 'text'>('list');
  const [newItemInput, setNewItemInput] = useState('');
  const [draggedItemIndex, setDraggedItemIndex] = useState<number | null>(null);

  const [spellViewMode, setSpellViewMode] = useState<'list' | 'text'>('list');
  const [newSpellInput, setNewSpellInput] = useState('');
  const [draggedSpellIndex, setDraggedSpellIndex] = useState<number | null>(null);
  
  const [newDetailedSpell, setNewDetailedSpell] = useState<SpellEntry>({ 
    id: '', name: '', level: 0, castingTime: '1 Ação', range: '18m', 
    components: 'V, S, M', duration: 'Instantânea', concentration: false, 
    description: '', prepared: true 
  });
  const [grimorioSearch, setGrimorioSearch] = useState('');
  const [grimorioFilter, setGrimorioFilter] = useState<number | 'all'>('all');
  const [grimorioConcentrationFilter, setGrimorioConcentrationFilter] = useState(false);
  const [grimorioRitualFilter, setGrimorioRitualFilter] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const safeInt = (val: string) => {
      const parsed = parseInt(val);
      return isNaN(parsed) ? 0 : parsed;
  };

  const getMod = (val: number) => Math.floor((val - 10) / 2);
  const fmt = (val: number) => (val >= 0 ? "+" : "") + val;
  const profBonus = Math.ceil(1 + (char.level / 4));
  const pbStr = fmt(profBonus);

  // Automatic attributes
  const dexMod = getMod(char.attributes.dex);
  const wisMod = getMod(char.attributes.wis);
  const initiative = dexMod; // Future: add bonuses from items/features
  const passivePerception = 10 + wisMod + (char.skills.percepcao ? profBonus : 0);

  const getLevelNum = (lvlStr: any): number => {
    if (typeof lvlStr === 'number') return lvlStr;
    if (!lvlStr || typeof lvlStr !== 'string') return 0;
    const s = lvlStr.toLowerCase();
    if (s.includes('truque')) return 0;
    if (s.includes('habilidade')) return 0;
    const match = lvlStr.match(/\d+/);
    return match ? parseInt(match[0]) : 0;
  };

  const appendDiceToString = (current: string, face: number): string => {
      const dieStr = `1d${face}`;
      const regex = new RegExp(`(\\d+)d${face}`);
      const match = current.match(regex);

      if (match) {
          const newCount = parseInt(match[1]) + 1;
          return current.replace(regex, `${newCount}d${face}`);
      } else {
          if (!current || current.trim() === '') return dieStr;
          return `${current} + ${dieStr}`;
      }
  };

  useEffect(() => {
    if (!char?.class || !char?.attributes) return;
    const wisMod = getMod(char.attributes.wis || 10);
    
    // Efeitos de itens mágicos e condições
    let itemAcBonus = 0;
    let itemSaveBonus = 0;
    const effectiveAttributes = { ...char.attributes };
    
    (char.inventoryList || []).forEach(item => {
        const active = (item.att && item.isAtt) || (!item.att && (item.eq || item.t === 'item'));
        if (active && item.eff) {
            item.eff.forEach(eff => {
                if (eff.type === 'ac') itemAcBonus += eff.value;
                if (eff.type === 'save') itemSaveBonus += eff.value;
                if (eff.type === 'attr' && eff.stat) {
                    const key = eff.stat as keyof typeof effectiveAttributes;
                    if (eff.value > effectiveAttributes[key]) effectiveAttributes[key] = eff.value;
                }
            });
        }
    });

    const conMod = getMod(effectiveAttributes.con);
    const dexMod = getMod(effectiveAttributes.dex);
    const effWisMod = getMod(effectiveAttributes.wis);

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
        const classes = char.classes || [{ name: char.class, level: char.level, subclass: char.subclass }];
        if (classes.some(c => c.name === 'Bárbaro')) baseAc = 10 + conMod;
        else if (classes.some(c => c.name === 'Monge')) baseAc = 10 + effWisMod;
    }
    
    const calculatedAC = baseAc + dexBonus + shieldBonus + itemAcBonus;
    let calculatedHP = char.hp.max;
    if (char.autoHp) {
        const classes = char.classes || [{ name: char.class, level: char.level, subclass: char.subclass }];
        let totalHP = 0;
        classes.forEach((c, idx) => {
            const dv = CLASSES_DB[c.name]?.dv || 8;
            if (idx === 0) {
                totalHP += dv + conMod;
                totalHP += (c.level - 1) * (Math.floor(dv / 2) + 1 + conMod);
            } else {
                totalHP += c.level * (Math.floor(dv / 2) + 1 + conMod);
            }
        });

        // Bônus Raciais de Vida
        if (char.race === 'Anão da Colina') {
            totalHP += char.level; // +1 PV por nível
        }

        calculatedHP = Math.max(1, totalHP);
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
  }, [char.class, char.level, char.classes, char.attributes, char.autoHp, char.autoAc, char.equippedArmor, char.equippedShield]); 

  const nextLevelNum = (char.level || 0) + 1;
  const featuresAtNextLevel = [
    ...(CLASS_FEATURES[char.class]?.[nextLevelNum] || []),
    ...(SUBCLASS_FEATURES[char.subclass]?.[nextLevelNum] || [])
  ];
  const isASILevel = featuresAtNextLevel.some(f => f.includes('Incremento de Atributo'));

  // Calculate XP Progress
  const nextLevelXP = XP_TABLE[char.level] || 355000; // Cap at max
  const currentLevelXP = XP_TABLE[char.level - 1] || 0;
  const xpProgress = Math.min(100, Math.max(0, ((char.xp - currentLevelXP) / (nextLevelXP - currentLevelXP)) * 100));

  const updateAttr = (attr: keyof Character['attributes'], val: number) => {
    setChar({ ...char, attributes: { ...char.attributes, [attr]: val } });
  };

  const toggleSkill = (skill: string) => {
    setChar({ ...char, skills: { ...char.skills, [skill]: !char.skills[skill] } });
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

  const handleLevelDown = (className: string) => {
      if (!char.classes || char.classes.length === 0) return;
      if (char.level <= 1) {
          addLog?.("Sistema", "Nível mínimo alcançado. Não é possível reduzir mais.", 'fail');
          return;
      }

      if (setConfirmModal) {
          setConfirmModal({
              message: `Reduzir 1 nível de ${className}? (HP e Atributos não serão revertidos automaticamente, faça ajustes manuais se necessário)`,
              onConfirm: () => {
                  const newClasses = char.classes!.map(c => {
                      if (c.name === className) return { ...c, level: c.level - 1 };
                      return c;
                  }).filter(c => c.level > 0);

                  const newLevel = char.level - 1;
                  const primaryClass = newClasses.length > 0 ? newClasses[0].name : 'Paladino';
                  const primarySub = newClasses.length > 0 ? (newClasses[0].subclass || '') : '';

                  setChar(prev => ({
                      ...prev,
                      level: newLevel,
                      class: primaryClass,
                      subclass: primarySub,
                      classes: newClasses
                  }));

                  addLog?.("Sistema", `${char.name} reduziu um nível de ${className}.`, 'info');
              }
          });
      }
  };

  const openLevelUp = () => {
      const totalLevel = (char.classes || []).reduce((sum, c) => sum + c.level, 0);
      if (totalLevel >= 20) { console.warn("Nível 20 atingido!"); return; }
      setLevelUpClass(char.class); // Default to current primary class
      const hitDieSize = CLASSES_DB[char.class]?.dv || 8;
      const conMod = getMod(char.attributes.con);
      const avgHPGain = Math.floor(hitDieSize / 2) + 1 + conMod;
      setNewLevelHP(Math.max(1, avgHPGain));
      setAsiPoints({ str: 0, dex: 0, con: 0, int: 0, wis: 0, cha: 0 });
      setLevelUpChoice('asi');
      setLevelUpFeat('');
      setLevelUpSubclass('');
      setLevelUpFightingStyle('');
      setSelectedLevelUpSpells([]);
      setLevelUpStep(0);
      setShowLevelUp(true);
  };

  const confirmLevelUp = () => {
      const isNewClass = !char.classes?.some(c => c.name === levelUpClass);
      let classData = CLASSES_DB[levelUpClass];
      
      // Fix: If classes is empty, we assume the current character level belongs to the primary class
      const currentClassLevel = char.classes?.find(c => c.name === levelUpClass)?.level || 
                               (char.class === levelUpClass ? (char.level || 1) : 0);
      const nextLevelInThisClass = currentClassLevel + 1;
      const nextTotalLevel = (char.level || 0) + 1;
      
      const isASILevel = (CLASS_FEATURES[levelUpClass]?.[nextLevelInThisClass] || []).some(f => f.includes('Incremento de Atributo'));
      const isCasterData = !!classData?.slots;
      
      const subLevelNum = classData?.subLevel || 3;
      const existingSubclass = char.classes?.find(c => c.name === levelUpClass)?.subclass;
      const needsSubclass = nextLevelInThisClass >= subLevelNum && !existingSubclass && !levelUpSubclass;

      const features = [
        ...(CLASS_FEATURES[levelUpClass]?.[nextLevelInThisClass] || []),
        ...(SUBCLASS_FEATURES[levelUpSubclass || existingSubclass || '']?.[nextLevelInThisClass] || [])
      ];

      const needsFightingStyle = features.some(f => f.includes('Estilo de Luta')) && !levelUpFightingStyle;

      // Step transition
      if (levelUpStep === 0) {
          if (needsSubclass && !levelUpSubclass) {
              alert("Por favor, escolha uma subclasse.");
              return;
          }
          if (needsFightingStyle && !levelUpFightingStyle) {
              setLevelUpStep(3); // Specialized step for fighting style
              return;
          }
          if (isASILevel) { setLevelUpStep(1); return; }
          if (isCasterData) { setLevelUpStep(2); return; }
      } else if (levelUpStep === 1) {
          if (isCasterData) { setLevelUpStep(2); return; }
      } else if (levelUpStep === 3) {
          if (isASILevel) { setLevelUpStep(1); return; }
          if (isCasterData) { setLevelUpStep(2); return; }
      }
      
      const allFeatures = [
        ...features,
        ...(RACE_FEATURES[char.race]?.[nextTotalLevel] || [])
      ];

      if (levelUpFightingStyle) {
          allFeatures.push(`Estilo de Luta: ${levelUpFightingStyle}`);
      }

      const newAttrs = { ...char.attributes };
      
      if (isASILevel && levelUpChoice === 'asi') {
          Object.keys(asiPoints).forEach(k => { 
              newAttrs[k as keyof typeof newAttrs] += asiPoints[k]; 
          });
      }

      let featureText = char.bio.features;
      if (allFeatures.length > 0) featureText += `\n\n[${levelUpClass} Nv ${nextLevelInThisClass}]: ` + allFeatures.join(', ');
      
      let newFeats = char.feats || [];
      if (isASILevel && levelUpChoice === 'feat' && levelUpFeat) {
          if (!newFeats.includes(levelUpFeat)) {
              newFeats = [...newFeats, levelUpFeat];
          }
      }
      
      let newInventory = char.inventory;
      let newKnownSpellsHeader = char.spells.known;
      let newDetailedSpellsList = [...(char.spellList || [])];

      // Add Subclass Spells automatically
      const currentSub = levelUpSubclass || existingSubclass;
      if (currentSub && SUBCLASS_SPELLS[currentSub]) {
          const subSpellsAtLevel = SUBCLASS_SPELLS[currentSub][nextLevelInThisClass] || [];
          subSpellsAtLevel.forEach(sName => {
              if (!newDetailedSpellsList.some(s => s.name === sName)) {
                  newDetailedSpellsList.push(toSpellEntry(sName));
                  allFeatures.push(`Magia de Subclasse: ${sName}`);
              }
          });
      }

      allFeatures.forEach(featName => {
          // If fighting style, add full description
          if (featName.toLowerCase().includes('estilo de luta')) {
              const styleName = featName.split(':').pop()?.trim();
              if (styleName && FIGHTING_STYLES[styleName]) {
                  const styleDesc = FIGHTING_STYLES[styleName];
                  if (!newKnownSpellsHeader.includes(styleName)) {
                      newKnownSpellsHeader += `\n[Estilo] ${styleName}: ${styleDesc}`;
                  }
              }
          }

          // Check if it should be a detailed spell/ability
          if (SPELLS_DB[featName] && !newDetailedSpellsList.some(s => s.name === featName)) {
              newDetailedSpellsList.push(toSpellEntry(featName));
          }

          const key = Object.keys(AUTO_ACTIONS).find(k => featName.includes(k));
          if (key) {
              const action = AUTO_ACTIONS[key];
              if (action.type === 'inv' && !newInventory.includes(key)) newInventory += `\n${action.text}`; 
              else if (action.type === 'spell' && !newKnownSpellsHeader.includes(key)) newKnownSpellsHeader += `\n${action.text}`;
          }
      });

      let newHPMax = char.hp.max;
      let newHPCurrent = char.hp.current;
      if (!char.autoHp) { 
          newHPMax += newLevelHP; 
          newHPCurrent += newLevelHP; 
      } else {
          const hitDieSize = classData?.dv || 8;
          const conMod = getMod(newAttrs.con);
          const avgHPGain = Math.floor(hitDieSize / 2) + 1 + conMod;
          newHPMax += avgHPGain;
          newHPCurrent += avgHPGain;
      }

      // --- MULTICLASS SPELL SLOTS D&D 5E ---
      const newClasses = (char.classes && char.classes.length > 0) 
        ? [...char.classes] 
        : [{ name: char.class, level: char.level, subclass: char.subclass }];

      const classIdx = newClasses.findIndex(c => c.name === levelUpClass);
      if (classIdx >= 0) {
          newClasses[classIdx] = { ...newClasses[classIdx], level: nextLevelInThisClass, subclass: levelUpSubclass || newClasses[classIdx].subclass };
      } else {
          newClasses.push({ name: levelUpClass, level: 1, subclass: levelUpSubclass || '' });
      }

      let newSlots = char.spells.slots || [];
      
      // Calculate multislots
      let totalCasterLevel = 0;
      let hasPactMagic = false;
      let pactLevel = 0;

      const castingClasses = newClasses.filter(c => CLASSES_DB[c.name]?.slots || CLASSES_DB[c.name]?.magicSubclasses?.includes(c.subclass));
      const isMulticlass = castingClasses.length > 1;

      newClasses.forEach(c => {
          const cData = CLASSES_DB[c.name];
          const isMagicSub = cData?.magicSubclasses?.includes(c.subclass);
          
          if (cData?.slots === 'full') {
              totalCasterLevel += c.level;
          } else if (cData?.slots === 'half') {
              // Multiclass half-casters round DOWN, single class rounds UP
              totalCasterLevel += isMulticlass ? Math.floor(c.level / 2) : Math.ceil(c.level / 2);
          } else if (cData?.slots === 'half-up') {
              // Artificer always rounds UP
              totalCasterLevel += Math.ceil(c.level / 2);
          } else if (cData?.slots === 'pact') {
              hasPactMagic = true;
              pactLevel = c.level;
          }
          
          if (isMagicSub) {
              totalCasterLevel += Math.floor(c.level / 3);
          }
      });

      if (totalCasterLevel > 0) {
          const slotCounts = SLOTS_TABLE[totalCasterLevel] || [];
          newSlots = slotCounts.map((count, i) => {
              const current = (char.spells.slots?.[i] || []);
              const diff = count - current.length;
              if (diff > 0) return [...current, ...Array(diff).fill(true)];
              if (diff < 0) return current.slice(0, count);
              return current;
          });
      }

      // --- ADD/UPDATE PACT MAGIC SLOTS (WARLOCK) ---
      if (hasPactMagic) {
          const pactSlotLevel = pactLevel < 3 ? 1 : pactLevel < 5 ? 2 : pactLevel < 7 ? 3 : pactLevel < 9 ? 4 : 5;
          const pactSlotCount = pactLevel === 1 ? 1 : pactLevel < 11 ? 2 : pactLevel < 17 ? 3 : 4;
          const levelIdx = pactSlotLevel - 1;
          
          // Initialize slots array if empty
          if (newSlots.length === 0) newSlots = Array(9).fill([]);
          
          const currentSlots = [...(newSlots[levelIdx] || [])];
          // Determine how many of these are pact slots (simplified: pact slots are added on top or tracked separately in a more complex app)
          // For this app, we ensure there are AT LEAST 'pactSlotCount' slots of that level.
          const diff = pactSlotCount - currentSlots.length;
          if (diff > 0) {
              newSlots[levelIdx] = [...currentSlots, ...Array(diff).fill(true)];
          }
      }

      // --- ADD NEW SPELLS ---
      let updatedSpellList = [...newDetailedSpellsList];
      selectedLevelUpSpells.forEach(sName => {
         if (!updatedSpellList.some(s => s.name === sName)) {
            updatedSpellList.push(toSpellEntry(sName));
         }
      });

      setChar({ 
          ...char, 
          level: nextTotalLevel, 
          class: newClasses[0].name, // Primary class is the first one
          subclass: newClasses[0].subclass,
          classes: newClasses,
          hp: { ...char.hp, max: newHPMax, current: newHPCurrent }, 
          attributes: newAttrs, 
          bio: { ...char.bio, features: featureText }, 
          inventory: newInventory, 
          spells: { ...char.spells, known: newKnownSpellsHeader, slots: newSlots },
          feats: newFeats,
          spellList: updatedSpellList
      });
      setShowLevelUp(false);
  };

   const handleLongRest = () => {
       const confirm = () => {
           setChar(prev => {
               const maxHP = Number(prev.hp?.max) || 1; 
               const currentHitDice = Number(prev.hitDice?.current) || 0;
               const maxHitDice = prev.level || 1; 
               const regainedHitDice = Math.max(1, Math.floor(maxHitDice / 2));
               const slots = prev.spells?.slots || [];
               const refreshedSlots = slots.map(levelSlots => Array.isArray(levelSlots) ? levelSlots.map(() => true) : []);
               
               let pact = prev.spells?.pact;
               if (pact) pact = { ...pact, current: pact.max };
               
               return { 
                   ...prev, 
                   hp: { ...prev.hp, current: maxHP, temp: 0 }, 
                   hitDice: { ...prev.hitDice, current: Math.min(maxHitDice, currentHitDice + regainedHitDice) }, 
                   spells: { ...prev.spells, slots: refreshedSlots, pact }
               };
           });
           addLog("Sistema", `${char.name} realizou um Descanso Longo e recuperou todos os PV, Slots e metade dos Dados de Vida!`, 'info');
       };

       if (setConfirmModal) {
           setConfirmModal({
               message: "Realizar um Descanso Longo? Recupera PV, Slots, Pacto e metade dos Dados de Vida.",
               onConfirm: confirm
           });
       } else {
           confirm();
       }
   };

   const handleShortRest = () => {
       const hasPact = !!char.spells?.pact;
       const hdAvailable = Number(char.hitDice?.current) || 0;

       const recoverPact = () => {
          setChar(prev => {
              if (!prev.spells?.pact) return prev;
              return {
                  ...prev,
                  spells: {
                      ...prev.spells,
                      pact: { ...prev.spells.pact, current: prev.spells.pact.max }
                  }
              };
          });
          addLog("Sistema", `${char.name} recuperou espaços de magia de pacto.`, 'info');
       };

       if (hdAvailable <= 0) {
           if (hasPact && setConfirmModal) {
               setConfirmModal({
                   message: "Você não tem Dados de Vida, mas pode realizar um Descanso Curto para recuperar seus Espaços de Pacto. Continuar?",
                   onConfirm: recoverPact
               });
           } else {
               addLog("Aviso", "Sem Dados de Vida disponíveis para descanso curto.", 'info');
           }
           return; 
       }

      const maxStr = char.hitDice?.max || "d8";
      const hitDieSize = parseInt(maxStr.replace(/[^\d]/g, '')) || 8;
      const roll = Math.floor(Math.random() * hitDieSize) + 1;
      const conMod = getMod(char.attributes.con);
      const totalHeal = Math.max(0, roll + conMod);
      
      if (setConfirmModal) {
          setConfirmModal({
              message: `Gastar 1 Dado de Vida? (1d${hitDieSize}+${conMod}=${totalHeal})`,
              onConfirm: () => {
                  setChar(prev => {
                      const curHP = Number(prev.hp?.current) || 0;
                      const maxHP = Number(prev.hp?.max) || 1;
                      const curHD = Number(prev.hitDice?.current) || 0;

                      // Recover Pact Magic Slots
                      let updatedSlots = prev.spells?.slots || [];
                      const warlockClass = prev.classes?.find(c => c.name === 'Bruxo');
                      if (warlockClass) {
                          const pLevel = warlockClass.level;
                          const pactSlotLevel = pLevel < 3 ? 1 : pLevel < 5 ? 2 : pLevel < 7 ? 3 : pLevel < 9 ? 4 : 5;
                          const pactSlotCount = pLevel === 1 ? 1 : pLevel < 11 ? 2 : pLevel < 17 ? 3 : 4;
                          const levelIdx = pactSlotLevel - 1;
                          updatedSlots = updatedSlots.map((lvlSlots, idx) => {
                              if (idx === levelIdx) return (lvlSlots || []).map((s, sIdx) => sIdx < pactSlotCount ? true : s);
                              return lvlSlots;
                          });
                      }

                      return { 
                          ...prev, 
                          hp: { ...prev.hp, current: Math.min(maxHP, curHP + totalHeal) }, 
                          hitDice: { ...prev.hitDice, current: Math.max(0, curHD - 1) },
                          spells: { ...prev.spells, slots: updatedSlots }
                      };
                  });
                  addLog("Dice", `${char.name} gastou 1 Dado de Vida e recuperou ${totalHeal} PV.`, 'dice');
              }
          });
      } else {
          setChar(prev => {
              const curHP = Number(prev.hp?.current) || 0;
              const maxHP = Number(prev.hp?.max) || 1;
              const curHD = Number(prev.hitDice?.current) || 0;
              
              let updatedSlots = prev.spells?.slots || [];
              const warlockClass = prev.classes?.find(c => c.name === 'Bruxo');
              if (warlockClass) {
                  const pLevel = warlockClass.level;
                  const pactSlotLevel = pLevel < 3 ? 1 : pLevel < 5 ? 2 : pLevel < 7 ? 3 : pLevel < 9 ? 4 : 5;
                  const pactSlotCount = pLevel === 1 ? 1 : pLevel < 11 ? 2 : pLevel < 17 ? 3 : 4;
                  const levelIdx = pactSlotLevel - 1;
                  updatedSlots = updatedSlots.map((lvlSlots, idx) => {
                      if (idx === levelIdx) return (lvlSlots || []).map((s, sIdx) => sIdx < pactSlotCount ? true : s);
                      return lvlSlots;
                  });
              }

              return { 
                  ...prev, 
                  hp: { ...prev.hp, current: Math.min(maxHP, curHP + totalHeal) }, 
                  hitDice: { ...prev.hitDice, current: Math.max(0, curHD - 1) },
                  spells: { ...prev.spells, slots: updatedSlots }
              };
          });
          addLog("Dice", `${char.name} recuperou ${totalHeal} PV no descanso curto.`, 'dice');
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

  const spendSlot = (level: number) => {
      if (level === 0) return; // Truques não gastam slots
      const levelIdx = level - 1;
      const newSlots = [...(char.spells.slots || [])];
      if (!newSlots[levelIdx] || newSlots[levelIdx].length === 0) {
          console.warn(`Nenhum espaço de magia de nível ${level} disponível.`);
          return;
      }
      // Find the first available (true) slot
      const slotIdx = newSlots[levelIdx].findIndex(s => s === true);
      if (slotIdx !== -1) {
          newSlots[levelIdx] = [...newSlots[levelIdx]];
          newSlots[levelIdx][slotIdx] = false;
          setChar({ ...char, spells: { ...char.spells, slots: newSlots } });
          addLog("Magia", `${char.name} gastou 1 espaço de magia de Nível ${level}.`, 'magic');
      } else {
          console.warn(`Todos os espaços de magia de nível ${level} já foram gastos.`);
      }
  };

  const handleSave = () => {
    const blob = new Blob([JSON.stringify(char, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${char.name || 'Hero'}_Sheet.json`;
    a.click();
  };

  const handleExportCard = async () => {
      try {
          await exportCharacterToCard(char);
          addLog("Sistema", "Card de personagem exportado com sucesso (PNG + Metadados).", 'info');
      } catch (err) {
          console.error("Erro ao exportar card:", err);
          alert("Erro ao gerar o card de personagem.");
      }
  };

  const handleLoad = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.name.toLowerCase().endsWith('.png')) {
        const extractedChar = await extractCharacterFromPng(file);
        if (extractedChar) {
            setChar(prev => ({ ...prev, ...extractedChar, id: prev.id }));
            addLog("Sistema", "Personagem recuperado do Card PNG com sucesso!", 'info');
            e.target.value = '';
            return;
        }
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const json = JSON.parse(ev.target?.result as string);
        if (json.nome_personagem || json.attr_for) {
            console.warn("Ficha legada importada (parcial).");
        } else {
            setChar(prev => ({...prev, ...json, id: prev.id}));
            console.warn("Ficha carregada com sucesso!");
        }
      } catch (err) { console.warn("Erro ao carregar arquivo. O formato parece inválido."); }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          const reader = new FileReader();
          reader.onload = async (ev) => { 
              if (ev.target?.result) {
                  const compressed = await compressImage(ev.target.result as string, 400, 400, 0.8);
                  setChar({ ...char, imageUrl: compressed });
                  setShowAvatarModal(false);
              }
          };
          reader.readAsDataURL(file);
      }
  };

  const handleSelectGalleryImage = (url: string) => {
      setChar({ ...char, imageUrl: url });
      setShowAvatarModal(false);
  };

  const toggleArmor = (armorName: string) => { setChar({ ...char, equippedArmor: char.equippedArmor === armorName ? undefined : armorName }); };
  const toggleShield = () => { setChar({ ...char, equippedShield: char.equippedShield === "Escudo" ? undefined : "Escudo" }); };

  const addWeaponToSheet = (w: {n: string, dmg: string, prop: string}) => {
     if (!char.inventory.includes(w.n)) setChar({ ...char, inventory: `- ${w.n} | Dano: ${w.dmg} | ${w.prop}\n` + char.inventory });
  };

  const createCustomItem = () => {
    if (!customItem.name) return;
    
    let details = '';
    if (customItem.type === 'Arma') details = `| Dano: ${customItem.damage || '1d4'} ${customItem.damageType}`;
    else if (customItem.type === 'Armadura' || customItem.type === 'Escudo') details = `| CA: +${customItem.ac || 0}`;
    
    const props = customItem.props ? `| ${customItem.props}` : '';
    const attune = customItem.attunement ? '(S)' : '';
    const rarityInfo = customItem.rarity !== 'Comum' ? `[${customItem.rarity}]` : '';
    const weightCost = (customItem.weight || customItem.cost) ? `| ${customItem.weight}kg, ${customItem.cost}PO` : '';

    const entry = `- ${rarityInfo} ${customItem.name} ${attune} ${details} ${props} ${weightCost}\n`.trim() + "\n";
    
    setChar(prev => ({ 
        ...prev, 
        inventory: entry + prev.inventory,
        customWeapons: customItem.type === 'Arma' ? [...(prev.customWeapons || []), { n: customItem.name, dmg: customItem.damage, prop: customItem.props }] : prev.customWeapons 
    }));

    console.warn(`Item "${customItem.name}" forjado e adicionado ao topo do inventário!`);

    setCustomItem({ 
        name: '', type: 'Arma', rarity: 'Comum', damage: '', damageType: 'cortante',
        ac: 0, props: '', weight: '', cost: '', attunement: false, desc: '' 
    });
  };

  const addSpellToSheet = (name: string, spell: {level: string, desc: string, school?: string, castingTime?: string, range?: string, components?: string, duration?: string, concentration?: boolean}) => {
    // Check for duplicates in the detailed list
    if (char.spellList?.some(s => s.name === name)) return;

    let levelNum = getLevelNum(spell.level);
    
    const newEntry: SpellEntry = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      name: name,
      level: levelNum,
      school: spell.school,
      castingTime: spell.castingTime || '1 Ação',
      range: spell.range || 'Varía',
      components: spell.components || 'V, S, M',
      duration: spell.duration || 'Varía',
      concentration: spell.concentration || false,
      description: spell.desc,
      prepared: false
    };

    setChar(prev => ({
      ...prev,
      spellList: [...(prev.spellList || []), newEntry]
    }));
  };

  const createCustomSpell = () => {
      if (!customSpell.name) return;
      
      const compStr = [
          customSpell.components.v ? 'V' : '',
          customSpell.components.s ? 'S' : '',
          customSpell.components.m ? 'M' : ''
      ].filter(Boolean).join(',');

      const tags = [
          compStr ? `(${compStr})` : '',
          customSpell.concentration ? 'Conc' : '',
          customSpell.ritual ? 'Ritual' : ''
      ].filter(Boolean).join(', ');

      const dmgInfo = customSpell.damage ? `| Dano: ${customSpell.damage} [${customSpell.damageType}]` : '';
      const saveInfo = customSpell.saveAttr !== 'Nenhum' ? `| CD ${customSpell.saveAttr}` : '';
      
      const desc = `(${customSpell.school}) ${customSpell.time} | ${customSpell.range} | ${tags} ${dmgInfo} ${saveInfo} | ${customSpell.desc}`;
      
      addSpellLine(`[${customSpell.level}] ${customSpell.name}: ${desc}`);
      
      setChar(prev => ({
          ...prev, 
          customSpells: [...(prev.customSpells || []), { name: customSpell.name, level: customSpell.level, desc }] 
      }));

      setCustomSpell({ 
          name: '', level: 'Truque', school: 'Evocação', 
          time: '1 Ação', range: '18m', duration: 'Instantânea', 
          desc: '', damage: '', damageType: 'Fogo',
          components: { v: false, s: false, m: false },
          concentration: false, ritual: false,
          saveAttr: 'Nenhum'
      });
  };

  const buyItem = (item: { n: string, c: number, w: string, d: string }) => {
      const currentGP = char.wallet.gp || 0;
      if (currentGP >= item.c) {
          setChar(prev => ({
              ...prev,
              wallet: { ...prev.wallet, gp: parseFloat((prev.wallet.gp - item.c).toFixed(2)) },
              inventory: `- ${item.n} | ${item.d} | ${item.w}\n` + prev.inventory
          }));
      } else {
          console.warn(`Você não tem Ouro (PO) suficiente para comprar ${item.n}. Custa ${item.c} PO.`);
      }
  };

  const addFeat = (featName: string) => {
      if ((char.feats || []).includes(featName)) { console.warn("Você já possui este talento!"); return; }
      setChar(prev => ({
          ...prev,
          feats: [...(prev.feats || []), featName]
      }));
      setShowFeatsModal(false);
  };

  const removeFeat = (featName: string) => {
      setChar(prev => ({
          ...prev,
          feats: (prev.feats || []).filter(f => f !== featName)
      }));
  };

  const getAcBreakdown = () => {
      const dexMod = getMod(char.attributes.dex);
      const conMod = getMod(char.attributes.con);
      const wisMod = getMod(char.attributes.wis);
      let base = 10;
      let dexBonus = dexMod;
      let shieldBonus = char.equippedShield ? (ARMOR_DB[char.equippedShield]?.ac || 0) : 0;
      let label = "Natural";

      if (char.equippedArmor) {
          const armor = ARMOR_DB[char.equippedArmor];
          if (armor) {
              base = armor.ac;
              label = armor.n;
              if (armor.type === 'heavy') dexBonus = 0;
              if (armor.type === 'medium') dexBonus = Math.min(2, dexMod);
          }
      } else {
          if (char.class === 'Bárbaro') { base = 10 + conMod; label = "Defesa Sem Armadura (CON)"; }
          if (char.class === 'Monge') { base = 10 + wisMod; label = "Defesa Sem Armadura (SAB)"; }
      }

      const total = base + dexBonus + shieldBonus;
      return { total, base, dex: dexBonus, shield: shieldBonus, label, toString: () => `${base} (${label}) + ${dexBonus} (DES) + ${shieldBonus} (Escudo) = ${total}` };
  };

  const getInventoryLines = () => char.inventory.split('\n').filter(line => line.trim() !== '');
  
  const addItem = () => {
      if(!newItemInput.trim()) return;
      const lines = getInventoryLines();
      
      const weapon = COMMON_WEAPONS.find(w => w.n.toLowerCase() === newItemInput.toLowerCase());
      const armor = ARMOR_DB[newItemInput];
      const shopItem = ALL_SHOP_ITEMS[newItemInput.toLowerCase()];
      
      let finalItem = newItemInput;
      if (weapon) finalItem = `${weapon.n} | Dano: ${weapon.dmg} | ${weapon.prop} | ${weapon.desc}`;
      else if (armor) finalItem = `${armor.n} | CA: ${armor.ac} | ${armor.type} | Proteção essencial para o campo de batalha.`;
      else if (shopItem) finalItem = `${shopItem.n} | ${shopItem.d}`;

      lines.unshift(`- ${finalItem}`); 
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

  const handleDragStart = (e: React.DragEvent, index: number) => { setDraggedItemIndex(index); e.dataTransfer.effectAllowed = 'move'; };
  const handleDragOver = (e: React.DragEvent, index: number) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; };
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

  const auditAndFixCharacter = () => {
      let updated = { ...char };
      let auditLogs: string[] = [];

      // 1. Recursos de Classe e Ações Automáticas
      let newFeatures = updated.bio.features || '';
      let newInventory = updated.inventory || '';
      let newKnownSpells = updated.spells.known || '';
      let newDetailedSpells = [...(updated.spellList || [])];

      // Helper para buscar na SPELLS_DB de forma resiliente
      const findSpell = (name: string) => {
          const norm = name.trim().toLowerCase();
          const found = Object.entries(SPELLS_DB).find(([k]) => k.toLowerCase() === norm);
          return found ? { name: found[0], data: found[1] } : null;
      };

      // --- 1a. Recursos de Classe ---
      if (!updated.classes || updated.classes.length === 0) {
          updated.classes = [{ name: updated.class, subclass: updated.subclass, level: updated.level }];
          auditLogs.push(`Estrutura de multiclasse inicializada para ${updated.class} Nível ${updated.level}`);
      }
      const classList = updated.classes;
      
      classList.forEach(cls => {
          for (let lvl = 1; lvl <= cls.level; lvl++) {
              const features = [
                  ...(CLASS_FEATURES[cls.name]?.[lvl] || []),
                  ...(SUBCLASS_FEATURES[cls.subclass || '']?.[lvl] || [])
              ];
              
              features.forEach(feat => {
                  // Add to features bio if new
                  if (!newFeatures.toLowerCase().includes(feat.toLowerCase())) {
                      newFeatures = newFeatures ? `${newFeatures}\n[Nível ${lvl} ${cls.name}]: ${feat}` : `[Nível ${lvl} ${cls.name}]: ${feat}`;
                      auditLogs.push(`Adicionado recurso (${cls.name}): ${feat}`);
                  }

                  // Priority 1: Check FIGHTING_STYLES
                  if (feat.toLowerCase().includes('estilo de luta')) {
                      const styleName = feat.split(':').pop()?.trim();
                      if (styleName && FIGHTING_STYLES[styleName]) {
                          const styleDesc = FIGHTING_STYLES[styleName];
                          const alreadyInGrimorio = newKnownSpells.toLowerCase().includes(styleName.toLowerCase());
                          if (!alreadyInGrimorio) {
                              newKnownSpells = newKnownSpells ? `${newKnownSpells}\n[Estilo] ${styleName}: ${styleDesc}` : `[Estilo] ${styleName}: ${styleDesc}`;
                              auditLogs.push(`Estilo de luta adicionado: ${styleName}`);
                          }
                      }
                  }

                  // Priority 2: Check spell DB for full description
                  const spellLookup = findSpell(feat);
                  if (spellLookup) {
                      const alreadyInDetailed = newDetailedSpells.some(s => s.name.toLowerCase() === feat.toLowerCase());
                      if (!alreadyInDetailed) {
                          newDetailedSpells.push(toSpellEntry(spellLookup.name));
                          auditLogs.push(`Magia/Habilidade detalhada adicionada: ${spellLookup.name}`);
                      } else {
                          // Se já existe, garante que a descrição está atualizada com a DB
                          const idx = newDetailedSpells.findIndex(s => s.name.toLowerCase() === feat.toLowerCase());
                          if (newDetailedSpells[idx].description !== spellLookup.data.desc) {
                              newDetailedSpells[idx] = { ...newDetailedSpells[idx], description: spellLookup.data.desc };
                              auditLogs.push(`Descrição de "${spellLookup.name}" atualizada.`);
                          }
                      }
                  } else {
                      // Priority 3: Check AUTO_ACTIONS 
                      const autoKey = Object.keys(AUTO_ACTIONS).find(k => feat.toLowerCase().includes(k.toLowerCase()));
                      if (autoKey) {
                          const action = AUTO_ACTIONS[autoKey];
                          if (!newKnownSpells.toLowerCase().includes(autoKey.toLowerCase())) {
                              newKnownSpells = newKnownSpells ? `${newKnownSpells}\n${action.text}` : action.text;
                              auditLogs.push(`Ação automática adicionada: ${autoKey}`);
                          }
                      }
                  }
              });
          }
      });

      // --- 1b. Recursos de Raça ---
      const totalLevel = updated.level;
      const raceData = RACE_BONUSES[updated.race];
      const racePrefix = `[Raça]`;
      
      if (raceData && raceData.traits) {
          raceData.traits.forEach(trait => {
              if (!newFeatures.toLowerCase().includes(trait.toLowerCase())) {
                  newFeatures = newFeatures ? `${newFeatures}\n${racePrefix} ${trait}` : `${racePrefix} ${trait}`;
                  auditLogs.push(`Traço racial identificado: ${trait}`);
              }

              const spellLookup = findSpell(trait);
              if (spellLookup) {
                  const alreadyInDetailed = newDetailedSpells.some(s => s.name.toLowerCase() === trait.toLowerCase());
                  if (!alreadyInDetailed) {
                      newDetailedSpells.push(toSpellEntry(spellLookup.name));
                      auditLogs.push(`Magia racial adicionada: ${spellLookup.name}`);
                  }
              } else {
                  const autoKey = Object.keys(AUTO_ACTIONS).find(k => trait.toLowerCase().includes(k.toLowerCase()));
                  const alreadyInSimple = newKnownSpells.toLowerCase().includes(trait.toLowerCase());
                  const alreadyInDetailed = newDetailedSpells.some(s => s.name.toLowerCase() === trait.toLowerCase());
                  
                  if (autoKey) {
                      const action = AUTO_ACTIONS[autoKey];
                      if (!alreadyInSimple) {
                          newKnownSpells = newKnownSpells ? `${newKnownSpells}\n${action.text}` : action.text;
                          auditLogs.push(`Habilidade automática da raça: ${autoKey}`);
                      }
                  } else if (!alreadyInSimple && !alreadyInDetailed) {
                      newKnownSpells = newKnownSpells ? `${newKnownSpells}\n[Habilidade] ${trait}: Benefício racial.` : `[Habilidade] ${trait}: Benefício racial.`;
                      auditLogs.push(`Habilidade da raça: ${trait}`);
                  }
              }
          });
      }

      for (let lvl = 1; lvl <= totalLevel; lvl++) {
          const racialFeatures = RACE_FEATURES[updated.race]?.[lvl] || [];
          racialFeatures.forEach(feat => {
              if (!newFeatures.toLowerCase().includes(feat.toLowerCase())) {
                  newFeatures = newFeatures ? `${newFeatures}\n[Nível ${lvl} Raça]: ${feat}` : `[Nível ${lvl} Raça]: ${feat}`;
                  auditLogs.push(`Recurso racial de nível (${lvl}): ${feat}`);
                  
                  const spellLookup = findSpell(feat);
                  if (spellLookup) {
                      const alreadyInDetailed = newDetailedSpells.some(s => s.name.toLowerCase() === feat.toLowerCase());
                      if (!alreadyInDetailed) {
                          newDetailedSpells.push(toSpellEntry(spellLookup.name));
                          auditLogs.push(`Magia racial de nível adicionada: ${spellLookup.name}`);
                      }
                  } else {
                      const autoKey = Object.keys(AUTO_ACTIONS).find(k => feat.toLowerCase().includes(k.toLowerCase()));
                      if (autoKey) {
                          const action = AUTO_ACTIONS[autoKey];
                          if (!newKnownSpells.toLowerCase().includes(autoKey.toLowerCase())) {
                              newKnownSpells = newKnownSpells ? `${newKnownSpells}\n${action.text}` : action.text;
                              auditLogs.push(`Habilidade automática da raça (Nv ${lvl}): ${autoKey}`);
                          }
                      }
                  }
              }
          });
      }

      // --- 1c. Subclass Spells ---
      classList.forEach(cls => {
          const sub = cls.subclass;
          if (sub && SUBCLASS_SPELLS[sub]) {
              for (let lvlNum = 1; lvlNum <= cls.level; lvlNum++) {
                  const spellsAtThisLvl = SUBCLASS_SPELLS[sub][lvlNum] || [];
                  spellsAtThisLvl.forEach(sName => {
                      const spellLookup = findSpell(sName);
                      const finalName = spellLookup ? spellLookup.name : sName;
                      if (!newDetailedSpells.some(s => s.name.toLowerCase() === finalName.toLowerCase())) {
                          newDetailedSpells.push(toSpellEntry(finalName));
                          auditLogs.push(`Magia de Subclasse adicionada: ${finalName} (${sub} Nv ${lvlNum})`);
                      }
                  });
              }
          }
      });

      if (!updated.inventoryList) updated.inventoryList = [];
      if (!updated.conditions) updated.conditions = [];
      
      updated.bio.features = newFeatures;
      updated.inventory = newInventory;
      updated.spells.known = newKnownSpells;
      updated.spellList = newDetailedSpells;

      // 2. Equipamento Inicial (apenas se o inventário estiver quase vazio)
      const invLines = newInventory.split('\n').filter(l => l.trim().startsWith('-'));
      if (invLines.length < 3) {
          const classEq = CLASS_STARTING_EQUIPMENT[char.class] || [];
          const bgData = BACKGROUND_STARTING_EQUIPMENT[char.background];
          const bgEq = bgData?.items || [];
          
          [...classEq, ...bgEq].forEach(item => {
              const cleanedItem = item.replace(/\(.*\)/, '').trim().toLowerCase();
              const alreadyHas = newInventory.toLowerCase().includes(cleanedItem);
              
              if (!alreadyHas) {
                  const weapon = COMMON_WEAPONS.find(w => w.n === item);
                  const armor = ARMOR_DB[item];
                  const shopItem = ALL_SHOP_ITEMS[item.toLowerCase()];
                  
                  let desc = "";
                  if (weapon) desc = ` | Dano: ${weapon.dmg} | ${weapon.prop} | ${weapon.desc}`;
                  else if (armor) desc = ` | CA: ${armor.ac} | ${armor.type} | ${armor.desc}`;
                  else if (shopItem) desc = ` | ${shopItem.d}`;
                  
                  newInventory = `- ${item}${desc}\n` + newInventory;
                  auditLogs.push(`Equipamento sugerido: ${item}`);
              }
          });
          updated.inventory = newInventory;
      }

      // 3. PV Máximo (se estiver 0)
      if (updated.hp.max <= 1) {
          const dv = CLASSES_DB[char.class]?.dv || 8;
          const conMod = Math.floor((char.attributes.con - 10) / 2);
          const firstLevel = dv + conMod;
          const subsequent = (Math.floor(dv / 2) + 1 + conMod) * (char.level - 1);
          
          let totalHp = firstLevel + subsequent;
          
          // Bônus Racial: Anão da Colina (+1 por nível)
          if (char.race === 'Anão da Colina') {
              totalHp += char.level;
              auditLogs.push(`Bônus de Robustez de Colina aplicado (+${char.level} PV).`);
          }

          updated.hp.max = Math.max(1, totalHp);
          updated.hp.current = updated.hp.max;
          auditLogs.push(`PV Máximo auto-preenchido para ${updated.hp.max}`);
      }

      // 4. Salvaguardas da Classe
      const classData = CLASSES_DB[char.class];
      if (classData && classData.saves) {
          const newSaves = { ...updated.saves };
          let addedSave = false;
          classData.saves.forEach((s: string) => {
              const key = s.toLowerCase();
              if (!newSaves[key]) {
                  newSaves[key] = true;
                  addedSave = true;
                  auditLogs.push(`Proficiência em Salvaguarda: ${s}`);
              }
          });
          if (addedSave) updated.saves = newSaves;
      }

      // 5. Perícias do Antecedente
      const bgInfo = BACKGROUNDS_DB[char.background];
      if (bgInfo) {
          const newSkills = { ...updated.skills };
          let addedSkill = false;
          bgInfo.skills.forEach(sId => {
              if (!newSkills[sId]) {
                  newSkills[sId] = true;
                  addedSkill = true;
                  auditLogs.push(`Perícia do Antecedente: ${sId}`);
              }
          });
          if (addedSkill) updated.skills = newSkills;
      }
      
      // 6. Sincronizar Nível Total e Espaços de Magia
      const actualTotalLevel = updated.classes.reduce((sum, c) => sum + (c.level || 0), 0);
      if (updated.level !== actualTotalLevel) {
          updated.level = actualTotalLevel;
          auditLogs.push(`Nível total sincronizado para ${actualTotalLevel}`);
      }

      // Recalcular Slots de Magia (Multiclasse)
      let totalCasterLevel = 0;
      let hasPactMagic = false;
      let pactLevel = 0;
      
      const castingClasses = updated.classes.filter(c => CLASSES_DB[c.name]?.slots || CLASSES_DB[c.name]?.magicSubclasses?.includes(c.subclass));
      const isMulticlass = castingClasses.length > 1;

      updated.classes.forEach(c => {
          const cData = CLASSES_DB[c.name];
          const isMagicSub = cData?.magicSubclasses?.includes(c.subclass);
          
          if (cData?.slots === 'full') {
              totalCasterLevel += c.level;
          } else if (cData?.slots === 'half') {
              totalCasterLevel += isMulticlass ? Math.floor(c.level / 2) : Math.ceil(c.level / 2);
          } else if (cData?.slots === 'half-up') {
              totalCasterLevel += Math.ceil(c.level / 2);
          } else if (cData?.slots === 'pact') {
              hasPactMagic = true;
              pactLevel = c.level;
          }
          
          if (isMagicSub) {
              totalCasterLevel += Math.floor(c.level / 3);
          }
      });

      const multiclassSlots = SLOTS_TABLE[totalCasterLevel] || [0,0,0,0,0,0,0,0,0];
      const newSlots = multiclassSlots.map(count => Array(count).fill(true));
      
      // Pact Magic
      if (hasPactMagic) {
          const pactSlots = PACT_SLOTS[pactLevel] || { count: 0, level: 0 };
          updated.spells.pact = {
              current: updated.spells.pact?.current ?? pactSlots.count,
              max: pactSlots.count,
              level: pactSlots.level
          };
      } else {
          updated.spells.pact = undefined;
      }

      if (JSON.stringify(updated.spells.slots) !== JSON.stringify(newSlots)) {
          updated.spells.slots = newSlots;
          auditLogs.push(`Espaços de Magia recalculados (Caster Nv ${totalCasterLevel})`);
      }

      setChar(updated);
      if (auditLogs.length > 0) {
          addLog("Auditoria e Correção", `Detectamos elementos faltantes ou desatualizados e os corrigimos:\n${auditLogs.join(', ')}`, 'info');
          console.warn(`[Auditoria] ${auditLogs.length} correções aplicadas.`);
      } else {
          console.log("[Auditoria] Ficha está completa e atualizada.");
      }
  };

  
  // Spell Parsing for Accordion
  const getSpellsByLevel = () => {
      const lines = getSpellLines();
      const groups: Record<string, {line: string, index: number}[]> = {};
      let currentLevel = 'Outros';
      
      lines.forEach((line, idx) => {
          const levelMatch = line.match(/^\[(.*?)\]/);
          if (levelMatch) {
              // This line defines a level block usually, but our logic is one spell per line often
              // If the format is [1º Nível] Spell Name, we use that.
              currentLevel = levelMatch[1];
          } 
          if (!groups[currentLevel]) groups[currentLevel] = [];
          groups[currentLevel].push({line, index: idx});
      });
      return groups;
  };

  const rollDiceString = (diceStr: string, label: string) => {
    const match = diceStr.match(/(\d+)d(\d+)([+-]\d+)?/);
    if (!match) return;
    const num = parseInt(match[1]);
    const sides = parseInt(match[2]);
    const mod = match[3] ? parseInt(match[3]) : 0;
    
    let total = 0;
    let rolls: number[] = [];
    for (let i = 0; i < num; i++) {
        const r = Math.floor(Math.random() * sides) + 1;
        rolls.push(r);
        total += r;
    }
    total += mod;
    
    const details = `Rolagem (${diceStr}): [${rolls.join(', ')}]${mod ? (mod > 0 ? ' + ' + mod : ' - ' + Math.abs(mod)) : ''} = **${total}**`;
    // We use onRoll as a way to broadcast, but here we might want a custom broadcast or just use onRoll multiple times.
    // For now, let's just add a log entry if possible, or use onRoll with a fake 'sides' to show the total.
    onRoll(1, total - 1, label); // Hack: d1 + (total-1) = total
  };

  const addSpellLine = (lineToAdd: string) => {
      const lines = getSpellLines();
      if (!lines.includes(lineToAdd)) {
          lines.push(lineToAdd);
          setChar({ ...char, spells: { ...char.spells, known: lines.join('\n') } });
      }
  };
  const addNewSpellFromInput = () => { if (!newSpellInput.trim()) return; addSpellLine(newSpellInput); setNewSpellInput(''); };
  const deleteSpellLine = (index: number) => { const lines = getSpellLines(); lines.splice(index, 1); setChar({ ...char, spells: { ...char.spells, known: lines.join('\n') } }); };
  const togglePreparedSpell = (index: number) => {
      const lines = getSpellLines();
      if (lines[index]) {
          const isPrepared = lines[index].includes('[P]');
          lines[index] = isPrepared ? lines[index].replace('[P]', '').trim() : `[P] ${lines[index]}`;
          setChar({ ...char, spells: { ...char.spells, known: lines.join('\n') } });
      }
  };
  const handleSpellDragStart = (e: React.DragEvent, index: number) => { setDraggedSpellIndex(index); e.dataTransfer.effectAllowed = 'move'; };
  const handleSpellDrop = (e: React.DragEvent, dropIndex: number) => {
      e.preventDefault();
      if (draggedSpellIndex === null || draggedSpellIndex === dropIndex) return;
      const lines = getSpellLines();
      const itemToMove = lines[draggedSpellIndex];
      lines.splice(draggedSpellIndex, 1);
      lines.splice(dropIndex, 0, itemToMove);
      setChar({ ...char, spells: { ...char.spells, known: lines.join('\n') } });
      setDraggedSpellIndex(null);
  };

  const addDetailedSpell = () => {
    if (!newDetailedSpell.name) return;
    const spellWithId = { ...newDetailedSpell, id: Date.now().toString() };
    setChar(prev => ({
      ...prev,
      spellList: [...(prev.spellList || []), spellWithId]
    }));
    setNewDetailedSpell({
      id: '',
      name: '',
      level: 0,
      castingTime: '1 Ação',
      range: '18m',
      components: 'V, S, M',
      duration: 'Instantânea',
      concentration: false,
      description: '',
      prepared: true
    });
  };

  const removeDetailedSpell = (id: string) => {
    setChar(prev => ({
      ...prev,
      spellList: (prev.spellList || []).filter(s => s.id !== id)
    }));
  };

  const addMagicItem = (itemKey: string) => {
    const baseItem = MAGIC_ITEMS_DB[itemKey];
    if (!baseItem) return;
    const newItem: InventoryItem = {
        ...baseItem,
        id: Math.random().toString(36).substring(2, 9),
        isAtt: false,
        eq: false
    };
    setChar(prev => ({
        ...prev,
        inventoryList: [...(prev.inventoryList || []), newItem]
    }));
  };

  const toggleItemAttunement = (id: string) => {
      setChar(prev => ({
          ...prev,
          inventoryList: (prev.inventoryList || []).map(it => it.id === id ? { ...it, isAtt: !it.isAtt } : it)
      }));
  };

  const toggleItemEquipped = (id: string) => {
      setChar(prev => ({
          ...prev,
          inventoryList: (prev.inventoryList || []).map(it => it.id === id ? { ...it, eq: !it.eq } : it)
      }));
  };

  const removeInventoryItem = (id: string) => {
      setChar(prev => ({
          ...prev,
          inventoryList: (prev.inventoryList || []).filter(it => it.id !== id)
      }));
  };

  const togglePreparedDetailedSpell = (id: string) => {
    setChar(prev => ({
      ...prev,
      spellList: (prev.spellList || []).map(s => s.id === id ? { ...s, prepared: !s.prepared } : s)
    }));
  };

  // Spell Filtering and Memoization for the Grimório
  const filteredGrimorioDetailed = useMemo(() => {
    let list = char.spellList || [];
    if (grimorioFilter !== 'all') {
      list = list.filter(s => s.level === grimorioFilter);
    }
    if (grimorioSearch.trim()) {
      const s = grimorioSearch.toLowerCase();
      list = list.filter(spell => spell.name.toLowerCase().includes(s) || spell.description.toLowerCase().includes(s));
    }
    if (grimorioConcentrationFilter) {
      list = list.filter(s => s.concentration);
    }
    if (grimorioRitualFilter) {
      list = list.filter(s => s.description.toLowerCase().includes('ritual') || s.castingTime.toLowerCase().includes('ritual'));
    }
    return list;
  }, [char.spellList, grimorioFilter, grimorioSearch, grimorioConcentrationFilter, grimorioRitualFilter]);

  const filteredGrimorioSimple = useMemo(() => {
    const lines = getSpellLines();
    let filtered = lines;
    if (grimorioSearch.trim()) {
      const s = grimorioSearch.toLowerCase();
      filtered = filtered.filter(line => line.toLowerCase().includes(s));
    }
    // Simplificando o filtro de concentração/ritual para linhas simples (apenas se tiver a tag manual)
    if (grimorioConcentrationFilter) {
      filtered = filtered.filter(line => line.toLowerCase().includes('[conc]') || line.toLowerCase().includes('concentração'));
    }
    if (grimorioRitualFilter) {
      filtered = filtered.filter(line => line.toLowerCase().includes('[ritual]') || line.toLowerCase().includes('ritual'));
    }
    return filtered;
  }, [char.spells.known, grimorioSearch, grimorioConcentrationFilter, grimorioRitualFilter]);

  const getDetailedSpellsByLevel = () => {
    const list = filteredGrimorioDetailed;
    const groups: Record<number, typeof list> = {};
    list.forEach(s => {
      if (!groups[s.level]) groups[s.level] = [];
      groups[s.level].push(s);
    });
    return groups;
  };

  const allWeapons = [...COMMON_WEAPONS, ...(char.customWeapons || [])];

  const allSpells = React.useMemo(() => [
    ...(Object.entries(SPELLS_DB) as [string, any][]).map(([n, s]) => ({name: n, ...s})), 
    ...(char.customSpells || [])
  ], [char.customSpells]);

  const SPELL_SCHOOLS = ['Todas', 'Abjuração', 'Conjuração', 'Adivinhação', 'Encantamento', 'Evocação', 'Ilusão', 'Necromancia', 'Transmutação'];

  const filteredSpells = React.useMemo(() => {
    const search = spellSearch.toLowerCase();
    
    return allSpells.filter(s => {
      // Pesquisa de texto
      const matchesText = !search || 
        s.name.toLowerCase().includes(search) || 
        s.desc.toLowerCase().includes(search);
      if (!matchesText) return false;

      // Filtro de Nível
      if (archiveLevelFilter !== 'all') {
        const lvl = getLevelNum(s.level);
        if (lvl !== archiveLevelFilter) return false;
      }

      // Filtro de Concentração
      if (archiveConcentrationFilter && !s.concentration) return false;

      // Filtro de Ritual
      if (archiveRitualFilter) {
        const isRitual = (s as any).ritual || (s.castingTime && s.castingTime.toLowerCase().includes('ritual'));
        if (!isRitual) return false;
      }

      // Filtro de Escola
      if (archiveSchoolFilter !== 'Todas') {
          const sObj = s as any;
          const schoolInObj = sObj.school && sObj.school.toLowerCase().includes(archiveSchoolFilter.toLowerCase());
          const schoolInDesc = s.desc.toLowerCase().includes(archiveSchoolFilter.toLowerCase());
          if (!schoolInObj && !schoolInDesc) return false;
      }

      // Filtro de Classe
      if (archiveClassFilter !== 'Todas') {
          const availClass = CLASS_SPELLS[archiveClassFilter] || [];
          const availSub = Object.values(SUBCLASS_SPELLS).flatMap(o => {
            // Find if this subclass belongs to the filtered class
            // For now, if archiveClassFilter is '-', we show all.
            // If it's a specific class, we should ideally filter subclasses.
            // But SUBCLASS_SPELLS keys are subclass names.
            return Object.values(o).flat();
          });
          // To be simple, if a class filter is active, we just show class spells.
          // If we want to show subclass spells too, we need a mapping of subclass -> class.
          const classSpells = availClass;
          if (!classSpells.includes(s.name)) return false;
      }

      return true;
    });
  }, [allSpells, spellSearch, archiveLevelFilter, archiveConcentrationFilter, archiveRitualFilter, archiveSchoolFilter, archiveClassFilter]);

  const spellSuggestions = React.useMemo(() => {
    const search = newSpellInput.toLowerCase();
    if (!search || search.length < 1) return [];
    return allSpells
      .filter(s => s.name.toLowerCase().includes(search))
      .filter(s => !char.spells.known.includes(s.name)) // Don't suggest spells already known
      .slice(0, 15);
  }, [allSpells, newSpellInput, char.spells.known]);

  const startWizard = () => {
    setConfirmModal?.({
       message: "Isso irá resetar os dados atuais do personagem para iniciar a criação guiada. Deseja continuar?",
       onConfirm: () => {
           setChar(INITIAL_CHAR);
           setCreationStep(0);
       }
    });
  };

  const applyRaceChanges = (race: string) => {
    let attrs = { ...INITIAL_CHAR.attributes };
    let traitsToAdd: string[] = [];
    let speed = INITIAL_CHAR.speed;
    let ac = INITIAL_CHAR.ac;
    let newSkills = { ...INITIAL_CHAR.skills };
    
    // Detailed race mapping from RACE_BONUSES
    const bonuses = RACE_BONUSES[race];
    if (bonuses) {
        if (bonuses.attrs) {
            Object.entries(bonuses.attrs).forEach(([attr, mod]) => {
                if (attrs[attr as keyof typeof attrs] !== undefined) {
                    attrs[attr as keyof typeof attrs] += mod;
                }
            });
        }
        if (bonuses.speed) speed = bonuses.speed;
        if (bonuses.ac) {
            // If it's a bonus (like Forjado Bélico +1) or a base (like Tortle 17)
            if (bonuses.ac < 10) ac += bonuses.ac;
            else ac = bonuses.ac;
        }
        if (bonuses.skills) {
            bonuses.skills.forEach(s => {
                const skillId = SKILL_LIST.find(sk => sk.n.toLowerCase().includes(s.toLowerCase()))?.id;
                if (skillId) newSkills[skillId] = true;
            });
        }
        if (bonuses.traits) {
            traitsToAdd = [...traitsToAdd, ...bonuses.traits];
        }
    }
    
    // Auto-discover other racial traits from SPELLS_DB (avoiding duplicates)
    Object.entries(SPELLS_DB).forEach(([name, data]) => {
        if (data.level === "Traço Racial" && !traitsToAdd.includes(name)) {
            const raceWords = race.toLowerCase().split(' ');
            const traitWords = name.toLowerCase().split(' ');
            if (traitWords.some(w => raceWords.includes(w)) || name.toLowerCase().includes(race.toLowerCase())) {
                traitsToAdd.push(name);
            }
        }
    });

    const newSpellEntries = traitsToAdd.map(name => ({
        id: Math.random().toString(36).substr(2, 9),
        name: name,
        level: 0,
        castingTime: SPELLS_DB[name]?.castingTime || "Passivo",
        range: SPELLS_DB[name]?.range || "Pessoal",
        components: SPELLS_DB[name]?.components || "-",
        duration: SPELLS_DB[name]?.duration || "Permanente",
        concentration: SPELLS_DB[name]?.concentration || false,
        description: SPELLS_DB[name]?.desc || "Traço Racial",
        prepared: true
    }));

    setChar(prev => ({ 
        ...prev, 
        race: race, 
        attributes: attrs,
        speed: speed,
        ac: ac,
        skills: newSkills,
        spellList: [...(prev.spellList || []), ...newSpellEntries]
    }));
    setCreationStep(2);
  };

  const applyClassChanges = (className: string) => {
    const classData = CLASSES_DB[className];
    const features = CLASS_FEATURES[className]?.[1] || [];
    
    const featureEntries = features.map(f => ({
        id: Math.random().toString(36).substr(2, 9),
        name: f,
        level: 0,
        castingTime: "Ação",
        range: "Pessoal",
        components: "-",
        duration: "Instantânea",
        concentration: false,
        description: SPELLS_DB[f]?.desc || "Habilidade de Classe",
        prepared: true
    }));

    setChar(prev => ({
        ...prev,
        class: className,
        level: 1,
        classes: [{ name: className, level: 1, subclass: '' }],
        hitDice: { current: 1, max: `d${classData?.dv || 8}` },
        hp: { current: (classData?.dv || 8) + getMod(prev.attributes.con), max: (classData?.dv || 8) + getMod(prev.attributes.con), temp: 0 },
        spellList: [...(prev.spellList || []), ...featureEntries]
    }));
    setCreationStep(3);
  };

  const applySubclassChanges = (sub: string) => {
    setChar(prev => {
        const newClasses = [...(prev.classes || [])];
        if (newClasses.length > 0) {
            newClasses[0] = { ...newClasses[0], subclass: sub };
        }
        return { ...prev, subclass: sub, classes: newClasses };
    });
    setCreationStep(4);
  };

  const applyBackgroundChanges = (bgName: string) => {
    const bgData = BACKGROUNDS_DB[bgName];
    const newSkills = { ...char.skills };
    if (bgData) {
        bgData.skills.forEach(s => {
            const skillId = SKILL_LIST.find(sk => sk.n.toLowerCase().includes(s.toLowerCase()))?.id;
            if (skillId) newSkills[skillId] = true;
        });
    }

    setChar(prev => ({
        ...prev,
        background: bgName,
        skills: newSkills
    }));
    setCreationStep(5);
  };

  const applyStartingItems = () => {
      const classItems = CLASS_STARTING_EQUIPMENT[char.class] || [];
      const bgData = BACKGROUND_STARTING_EQUIPMENT[char.background];
      const bgItems = bgData?.items || [];
      const bgGold = bgData?.gold || 0;

      let newInventory = char.inventory;
      
      [...classItems, ...bgItems].forEach(item => {
          if (!newInventory.includes(item)) {
              const weapon = COMMON_WEAPONS.find(w => w.n === item);
              const armor = ARMOR_DB[item];
              const shopItem = ALL_SHOP_ITEMS[item.toLowerCase()];
              
              let desc = "";
              if (weapon) desc = ` | Dano: ${weapon.dmg} | ${weapon.prop}`;
              else if (armor) desc = ` | CA: ${armor.ac} | ${armor.type}`;
              else if (shopItem) desc = ` | ${shopItem.d}`;
              
              newInventory = `- ${item}${desc}\n` + newInventory;
          }
      });

      setChar(prev => ({
          ...prev,
          inventory: newInventory,
          wallet: { ...prev.wallet, gp: (prev.wallet.gp || 0) + bgGold }
      }));

      // If Fighter or Paladin, go to Fighting Style step
      if (['Guerreiro', 'Paladino'].includes(char.class)) {
          setCreationStep(10);
      } else {
          setCreationStep(7);
      }
  };

  const finishWizard = () => {
      setCreationStep(null);
      addLog("Criação de Personagem", `O herói ${char.name} iniciou sua jornada!`, 'info');
  };

  const filteredFeats = Object.entries(FEATS_DB).filter(([name]) => name.toLowerCase().includes(featSearch.toLowerCase()));

  // Extract unique monster images for gallery
  const galleryImages = useMemo(() => {
      const baseImages = new Set<string>();
      
      if (avatarTab === 'avatars' || avatarTab === 'all') {
          LIST_AVATARS.forEach(url => baseImages.add(url));
      }
      
      if (avatarTab === 'creatures' || avatarTab === 'all') {
          LIST_CREATURES.forEach(url => baseImages.add(url));
          DEFAULT_MONSTERS.forEach(m => m.imageUrl && baseImages.add(m.imageUrl));
      }
      
      // Add dynamically fetched assets from server
      localAssets.forEach(url => baseImages.add(url));
      
      return Array.from(baseImages)
        .filter(url => !avatarSearch || url!.toLowerCase().includes(avatarSearch.toLowerCase()))
        .sort((a, b) => {
            // Put avatars first if in "all" tab
            const aIsAvatar = LIST_AVATARS.includes(a);
            const bIsAvatar = LIST_AVATARS.includes(b);
            if (aIsAvatar && !bIsAvatar) return -1;
            if (!aIsAvatar && bIsAvatar) return 1;
            return a.localeCompare(b);
        });
  }, [avatarTab, localAssets, avatarSearch]);

  return (
    <div className="bg-parchment text-stone-900 p-8 rounded-sm shadow-2xl max-w-7xl mx-auto border-4 border-double border-stone-800 relative font-spectral">
      {/* Level Up Modal */}
      {showLevelUp && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
              <div className="bg-parchment border-4 border-double border-stone-800 rounded-sm w-full max-w-xl p-8 shadow-2xl relative max-h-[95vh] overflow-hidden flex flex-col">
                  {/* HEADER */}
                  <div className="flex justify-between items-center mb-6">
                      <h3 className="text-3xl font-bold text-stone-900 font-cinzel flex items-center gap-3 uppercase tracking-tighter">
                          <ArrowUpCircle size={32} className="text-stone-600"/> 
                          Nível {nextLevelNum}
                      </h3>
                      <div className="flex gap-1">
                          {[0, 1, 2, 3].map(step => {
                              const classLevel = (char.classes?.find(c => c.name === levelUpClass)?.level || 0);
                              const nextClassLevel = classLevel + 1;
                              const isASI = step === 1 && (CLASS_FEATURES[levelUpClass]?.[nextClassLevel] || []).some(f => f.includes('Incremento de Atributo'));
                              const isSpells = step === 2 && CLASSES_DB[levelUpClass]?.slots;
                              const isFightingStyle = step === 3 && (CLASS_FEATURES[levelUpClass]?.[nextClassLevel] || []).some(f => f.includes('Estilo de Luta'));

                              if (step === 1 && !isASI) return null;
                              if (step === 2 && !isSpells) return null;
                              if (step === 3 && !isFightingStyle) return null;

                              return (
                                  <div key={step} className={`w-3 h-3 rounded-full border border-stone-400 ${levelUpStep === step ? 'bg-stone-800' : 'bg-transparent'}`} />
                              );
                          })}
                      </div>
                  </div>

                  <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-6">
                      {/* STEP 0: HP & SUBCLASS */}
                      {levelUpStep === 0 && (
                          <div className="animate-in fade-in slide-in-from-bottom-4 duration-300 space-y-8">
                              <div className="bg-white/40 p-5 rounded border border-stone-800 shadow-sm transition-all hover:shadow-md">
                                  <label className="block text-[10px] font-black text-stone-500 uppercase tracking-[2px] mb-3">Crescimento de Carreira</label>
                                  <div className="space-y-4">
                                      <div>
                                          <label className="block text-[8px] font-black text-stone-400 uppercase mb-1">Classe para Subir de Nível</label>
                                          <select 
                                              className="w-full bg-white/60 border border-stone-300 rounded p-3 text-sm font-bold text-stone-800 outline-none focus:border-stone-800 shadow-sm"
                                              value={levelUpClass}
                                              onChange={e => {
                                                  const newClass = e.target.value;
                                                  setLevelUpClass(newClass);
                                                  const hitDieSize = CLASSES_DB[newClass]?.dv || 8;
                                                  const conMod = getMod(char.attributes.con);
                                                  const avgHPGain = Math.floor(hitDieSize / 2) + 1 + conMod;
                                                  setNewLevelHP(Math.max(1, avgHPGain));
                                                  setLevelUpSubclass('');
                                              }}
                                          >
                                              <optgroup label="Caminhos Atuais">
                                                  {(char.classes || [{ name: char.class, level: char.level, subclass: char.subclass }]).map(c => (
                                                      <option key={c.name} value={c.name}>{c.name} (Nv {c.level})</option>
                                                  ))}
                                              </optgroup>
                                              <optgroup label="Novo Caminho (Multiclasse)">
                                                  {Object.keys(CLASSES_DB).filter(k => k !== 'Criatura' && k !== 'Monstruosidade' && !char.classes?.some(c => c.name === k)).map(name => (
                                                      <option key={name} value={name}>{name}</option>
                                                  ))}
                                              </optgroup>
                                          </select>
                                      </div>

                                      <div className="bg-stone-100/30 p-3 rounded border border-stone-200">
                                          <label className="block text-[10px] font-black text-stone-500 uppercase tracking-[2px] mb-3">Vida Extra</label>
                                          {char.autoHp ? (
                                              <div className="flex items-center gap-3 text-sm font-bold text-stone-600 italic py-2">
                                                  <Calculator size={18}/> {levelUpClass}: Automatizado pela média (+{Math.floor((CLASSES_DB[levelUpClass]?.dv || 8) / 2) + 1 + getMod(char.attributes.con)})
                                              </div>
                                          ) : (
                                              <div className="flex items-center gap-4">
                                                  <input 
                                                    type="number" 
                                                    className="w-20 text-center font-bold text-2xl py-2 rounded bg-white/60 border border-stone-300 focus:border-stone-800 outline-none shadow-inner text-stone-900" 
                                                    value={newLevelHP} 
                                                    onChange={e => setNewLevelHP(safeInt(e.target.value))} 
                                                  />
                                                  <div className="flex flex-col">
                                                      <button 
                                                        onClick={rollLevelUpHP}
                                                        className="px-4 py-1 bg-amber-400 hover:bg-amber-500 text-amber-900 font-black text-[10px] uppercase tracking-widest rounded shadow-sm transition-all active:scale-95 flex items-center gap-2"
                                                      >
                                                          <Dices size={14}/> Girar Dado
                                                      </button>
                                                      <div className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mt-1 ml-1">d{CLASSES_DB[levelUpClass]?.dv || 8} + {getMod(char.attributes.con)} (CON)</div>
                                                  </div>
                                              </div>
                                          )}
                                      </div>
                                  </div>
                              </div>

                              <div className="bg-white/40 p-5 rounded border border-stone-800 shadow-sm transition-all hover:shadow-md">
                                  <label className="block text-[10px] font-black text-stone-500 uppercase tracking-[2px] mb-3">Novas Habilidades</label>
                                  <div className="space-y-2">
                                      {(CLASS_FEATURES[levelUpClass]?.[(char.classes?.find(c => c.name === levelUpClass)?.level || 0) + 1] || []).length > 0 ? (
                                          (CLASS_FEATURES[levelUpClass]?.[(char.classes?.find(c => c.name === levelUpClass)?.level || 0) + 1] || []).map(feat => (
                                              <div key={feat} className="flex items-center gap-3 bg-stone-100/50 px-4 py-2 rounded border border-stone-200">
                                                  <Sparkles size={14} className="text-amber-500"/>
                                                  <span className="text-sm font-bold text-stone-700">{feat}</span>
                                              </div>
                                          ))
                                      ) : (
                                          <div className="text-[10px] text-stone-400 italic">Nenhum marco de habilidade neste nível.</div>
                                      )}
                                  </div>
                              </div>

                              {((CLASSES_DB[levelUpClass]?.subLevel === (char.classes?.find(c => c.name === levelUpClass)?.level || 0) + 1) || 
                                ((char.classes?.find(c => c.name === levelUpClass)?.level || 0) + 1 > (CLASSES_DB[levelUpClass]?.subLevel || 3) && !(char.classes?.find(c => c.name === levelUpClass)?.subclass))) && (
                                  <div className="bg-white/40 p-5 rounded border border-stone-800 shadow-sm animate-in zoom-in-95 duration-500">
                                      <label className="block text-[10px] font-black text-stone-500 uppercase tracking-[2px] mb-3">Caminho da Classe (Subclasse)</label>
                                      <select 
                                        className="w-full bg-white/60 border border-stone-300 rounded p-4 text-sm font-bold text-stone-800 outline-none focus:border-stone-800 shadow-inner"
                                        value={levelUpSubclass}
                                        onChange={e => setLevelUpSubclass(e.target.value)}
                                      >
                                          <option value="">-- Escolha seu Arquétipo --</option>
                                          {CLASSES_DB[levelUpClass]?.sub.sort().map(s => (
                                              <option key={s} value={s}>{s}</option>
                                          ))}
                                      </select>
                                      <p className="mt-2 text-[10px] text-stone-400 italic">Uma escolha definitiva que define seus poderes futuros.</p>
                                  </div>
                              )}
                          </div>
                      )}

                      {/* STEP 3: FIGHTING STYLE */}
                      {levelUpStep === 3 && (
                          <div className="animate-in fade-in slide-in-from-bottom-4 duration-300 space-y-6">
                              <div className="bg-white/40 p-5 rounded border border-stone-800 shadow-sm">
                                  <label className="block text-[10px] font-black text-stone-500 uppercase tracking-[2px] mb-4">Escolha seu Estilo de Luta</label>
                                  <div className="grid grid-cols-1 gap-3">
                                      {Object.entries(FIGHTING_STYLES).map(([name, desc]) => (
                                          <button 
                                            key={name}
                                            onClick={() => setLevelUpFightingStyle(name)}
                                            className={`flex flex-col p-4 rounded border text-left transition-all ${levelUpFightingStyle === name ? 'bg-stone-800 border-stone-900 text-white shadow-md' : 'bg-white border-stone-200 hover:border-stone-400 text-stone-900'}`}
                                          >
                                              <span className="font-bold text-sm uppercase tracking-widest">{name}</span>
                                              <span className={`text-xs mt-1 italic ${levelUpFightingStyle === name ? 'text-stone-300' : 'text-stone-500'}`}>{desc}</span>
                                          </button>
                                      ))}
                                  </div>
                              </div>
                          </div>
                      )}

                      {/* STEP 1: ASI/FEAT */}
                      {levelUpStep === 1 && (
                          <div className="animate-in fade-in slide-in-from-bottom-4 duration-300 space-y-6">
                              <div className="bg-white/40 p-5 rounded border border-stone-800 shadow-sm relative overflow-hidden">
                                 <div className="absolute top-0 right-0 p-2 bg-stone-800 text-white text-[8px] font-black uppercase tracking-tighter rotate-45 translate-x-3 translate-y-[-1px] w-20 text-center shadow-lg">ASI</div>
                                 <div className="flex gap-2 mb-6 p-1 bg-stone-200 rounded-lg">
                                     <button onClick={() => setLevelUpChoice('asi')} className={`flex-1 py-3 rounded-md font-black text-[10px] uppercase tracking-widest transition-all ${levelUpChoice === 'asi' ? 'bg-stone-800 text-white shadow-lg' : 'text-stone-500 hover:text-stone-800'}`}>Atributos</button>
                                     <button onClick={() => setLevelUpChoice('feat')} className={`flex-1 py-3 rounded-md font-black text-[10px] uppercase tracking-widest transition-all ${levelUpChoice === 'feat' ? 'bg-stone-800 text-white shadow-lg' : 'text-stone-500 hover:text-stone-800'}`}>Talento</button>
                                 </div>
                                 
                                 {levelUpChoice === 'asi' ? (
                                     <div className="space-y-4">
                                         <div className="flex justify-between items-center">
                                             <label className="block text-[10px] font-black text-stone-500 uppercase tracking-[2px]">Incremento de Atributo</label>
                                             <span className={`px-2 py-1 rounded text-[10px] font-black ${Object.values(asiPoints).reduce((a,b)=>a+b,0) === 2 ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                                                 {Object.values(asiPoints).reduce((a,b)=>a+b,0)} / 2 Pontos
                                             </span>
                                         </div>
                                         <div className="grid grid-cols-3 gap-3">
                                             {Object.keys(asiPoints).map(attr => (
                                                 <div key={attr} className="flex flex-col items-center bg-white/60 p-3 rounded border border-stone-300 shadow-inner group transition-all hover:bg-stone-50">
                                                     <span className="font-black uppercase text-[10px] text-stone-400 tracking-wider mb-2 group-hover:text-stone-600">{attr}</span>
                                                     <div className="flex items-center gap-3">
                                                         <button onClick={() => setAsiPoints({...asiPoints, [attr]: Math.max(0, asiPoints[attr]-1)})} className="w-6 h-6 bg-stone-100 text-stone-600 rounded-full font-bold hover:bg-stone-200 border border-stone-300 flex items-center justify-center">-</button>
                                                         <span className="font-bold text-xl text-stone-900 min-w-[20px] text-center">{asiPoints[attr]}</span>
                                                         <button 
                                                           onClick={() => {
                                                               if (Object.values(asiPoints).reduce((a,b)=>a+b,0) < 2) {
                                                                 setAsiPoints({...asiPoints, [attr]: asiPoints[attr]+1});
                                                               }
                                                           }} 
                                                           className={`w-6 h-6 rounded-full font-bold flex items-center justify-center transition-all ${Object.values(asiPoints).reduce((a,b)=>a+b,0) < 2 ? 'bg-stone-800 text-white hover:bg-stone-900' : 'bg-stone-200 text-stone-400 cursor-not-allowed'}`}
                                                         >+</button>
                                                     </div>
                                                 </div>
                                             ))}
                                         </div>
                                     </div>
                                 ) : (
                                     <div className="space-y-4">
                                         <label className="block text-[10px] font-black text-stone-500 uppercase tracking-[2px]">Novo Talento</label>
                                         <select 
                                             className="w-full bg-white/60 border border-stone-300 rounded p-4 text-sm font-bold text-stone-800 outline-none focus:border-stone-800 shadow-inner"
                                             value={levelUpFeat}
                                             onChange={(e) => setLevelUpFeat(e.target.value)}
                                         >
                                             <option value="">-- Selecione seu novo poder --</option>
                                             {Object.keys(FEATS_DB).sort().map(feat => (
                                                 <option key={feat} value={feat}>{feat}</option>
                                             ))}
                                         </select>
                                         {levelUpFeat && FEATS_DB[levelUpFeat] && (
                                             <div className="p-4 bg-orange-50/50 rounded border border-orange-200 text-xs text-stone-600 leading-relaxed italic shadow-inner animate-in fade-in slide-in-from-top-2 duration-300">
                                                 {FEATS_DB[levelUpFeat]}
                                             </div>
                                         )}
                                     </div>
                                 )}
                              </div>
                          </div>
                      )}

                      {/* STEP 2: SPELLS */}
                      {levelUpStep === 2 && (
                          <div className="animate-in fade-in slide-in-from-bottom-4 duration-300 space-y-4 h-full flex flex-col">
                              <div className="bg-white/40 p-5 rounded border border-stone-800 shadow-sm">
                                  <div className="flex justify-between items-end mb-3">
                                      <label className="block text-[10px] font-black text-stone-500 uppercase tracking-[2px]">Conhecimento Arcano (Novas Magias)</label>
                                      {(() => {
                                          const classLevel = (char.classes?.find(c => c.name === levelUpClass)?.level || 0);
                                          const nextClassLevel = classLevel + 1;
                                          const prevLimits = getSpellsLimit(levelUpClass, classLevel);
                                          const newLimits = getSpellsLimit(levelUpClass, nextClassLevel);
                                          const allowedNewCantrips = Math.max(0, newLimits.cantrips - prevLimits.cantrips);
                                          const isWizard = levelUpClass.toLowerCase() === 'mago';
                                          const allowedNewSpells = isWizard ? 2 : (newLimits.spells > prevLimits.spells ? (newLimits.spells - prevLimits.spells) : 1);
                                          
                                          const selectedCantripsNum = selectedLevelUpSpells.filter(n => SPELLS_DB[n]?.level === 'Truque').length;
                                          const selectedSpellsNum = selectedLevelUpSpells.filter(n => SPELLS_DB[n]?.level !== 'Truque').length;

                                          return (
                                              <div className="flex gap-2">
                                                  {allowedNewCantrips > 0 && (
                                                      <span className={`text-[10px] font-black px-2 py-0.5 rounded ${selectedCantripsNum >= allowedNewCantrips ? 'bg-green-100 text-green-700' : 'bg-stone-800 text-white'}`}>
                                                          Truques: {selectedCantripsNum}/{allowedNewCantrips}
                                                      </span>
                                                  )}
                                                  <span className={`text-[10px] font-black px-2 py-0.5 rounded ${selectedSpellsNum >= allowedNewSpells ? 'bg-green-100 text-green-700' : 'bg-stone-800 text-white'}`}>
                                                      Magias: {selectedSpellsNum}/{allowedNewSpells}
                                                  </span>
                                              </div>
                                          );
                                      })()}
                                  </div>
                                  <div className="text-[10px] text-stone-400 mb-4 leading-tight italic">
                                      Escolha as magias que seu personagem aprendeu ou preparou ao ascender.
                                  </div>
                                  <div className="grid grid-cols-1 gap-2 overflow-y-auto max-h-[40vh] pr-2 custom-scrollbar">
                                      {(() => {
                                          const classLevel = (char.classes?.find(c => c.name === levelUpClass)?.level || 0);
                                          const nextClassLevel = classLevel + 1;
                                          const prevLimits = getSpellsLimit(levelUpClass, classLevel);
                                          const newLimits = getSpellsLimit(levelUpClass, nextClassLevel);
                                          const allowedNewCantrips = Math.max(0, newLimits.cantrips - prevLimits.cantrips);
                                          const isWizard = levelUpClass.toLowerCase() === 'mago';
                                          const allowedNewSpells = isWizard ? 2 : (newLimits.spells > prevLimits.spells ? (newLimits.spells - prevLimits.spells) : 1);

                                          return (CLASS_SPELLS[levelUpClass] || [])
                                            .filter(sName => {
                                                const info = SPELLS_DB[sName];
                                                if (!info) return false;
                                                const maxCircle = getMaxSpellCircle(CLASSES_DB[levelUpClass]?.slots, nextClassLevel);
                                                const lvlNum = info.level === 'Truque' ? 0 : (parseInt(info.level.replace(/\D/g, '')) || 0);
                                                return lvlNum <= maxCircle;
                                            })
                                            .sort()
                                            .map(sName => {
                                              const isSelected = selectedLevelUpSpells.includes(sName);
                                              const isKnown = (char.spellList || []).some(s => s.name === sName);
                                              const sInfo = SPELLS_DB[sName];
                                              if (!sInfo) return null;
                                              const isCantrip = sInfo.level === 'Truque';
                                              
                                              const selectedCantripsNum = selectedLevelUpSpells.filter(n => SPELLS_DB[n]?.level === 'Truque').length;
                                              const selectedSpellsNum = selectedLevelUpSpells.filter(n => SPELLS_DB[n]?.level !== 'Truque').length;

                                              const canAdd = isCantrip ? (selectedCantripsNum < allowedNewCantrips) : (selectedSpellsNum < allowedNewSpells);

                                              return (
                                                  <button 
                                                    key={sName}
                                                    disabled={isKnown || (!isSelected && !canAdd)}
                                                    onClick={() => {
                                                        if (isSelected) setSelectedLevelUpSpells(prev => prev.filter(n => n !== sName));
                                                        else if (canAdd) setSelectedLevelUpSpells(prev => [...prev, sName]);
                                                    }}
                                                    className={`flex items-center justify-between p-3 rounded border transition-all text-left ${
                                                        isKnown ? 'bg-stone-50 border-stone-200 opacity-50 cursor-not-allowed' :
                                                        isSelected ? 'bg-stone-800 border-stone-800 text-white shadow-md' : 
                                                        canAdd ? 'bg-white border-stone-200 hover:border-stone-800 hover:bg-stone-50' :
                                                        'bg-stone-50 border-stone-100 opacity-40 cursor-not-allowed'
                                                    }`}
                                                  >
                                                  <div className="flex flex-col">
                                                      <span className="text-sm font-bold uppercase tracking-tight">{sName}</span>
                                                      <span className={`text-[9px] uppercase font-black ${isSelected ? 'text-stone-300' : 'text-stone-400'}`}>
                                                          {sInfo.level === 'Truque' ? 'Truque' : `Nível ${sInfo.level}`} • {sInfo.school || 'Magia'}
                                                      </span>
                                                  </div>
                                                  {isKnown ? <Check size={16} className="text-stone-400"/> : isSelected ? <Plus size={16} className="text-white"/> : <Plus size={16} className="text-stone-300"/>}
                                              </button>
                                          );
                                      })
                                  })()}
                                  </div>
                              </div>
                          </div>
                      )}
                  </div>

                  {/* FOOTER */}
                  <div className="flex justify-between items-center pt-6 border-t border-stone-300 mt-4">
                      <button 
                        onClick={() => {
                            if (levelUpStep > 0) setLevelUpStep(prev => prev - 1);
                            else setShowLevelUp(false);
                        }} 
                        className="px-6 py-3 text-stone-400 font-black text-[10px] uppercase tracking-widest hover:text-stone-600 transition-all"
                      >
                          {levelUpStep === 0 ? 'Abortar' : 'Voltar'}
                      </button>
                      
                      <button 
                        onClick={confirmLevelUp} 
                        className="px-10 py-4 bg-stone-800 hover:bg-stone-900 text-white font-black text-xs uppercase tracking-[2px] rounded shadow-xl transition-all active:scale-95 flex items-center gap-2 group"
                      >
                          {(() => {
                              const nextClassLevel = (char.classes?.find(c => c.name === levelUpClass)?.level || 0) + 1;
                              const isASI = (CLASS_FEATURES[levelUpClass]?.[nextClassLevel] || []).some(f => f.includes('Incremento de Atributo'));
                              const isCaster = !!CLASSES_DB[levelUpClass]?.slots;

                              if (levelUpStep === 0 && (isASI || isCaster)) return 'Próximo Passo';
                              if (levelUpStep === 1 && isCaster) return 'Próximo Passo';
                              return 'Completar Ascensão';
                          })()}
                          <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform"/>
                      </button>
                  </div>
              </div>
          </div>
      )}

      {/* FEATS MODAL */}
      {showFeatsModal && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[70] p-4 backdrop-blur-sm">
              <div className="bg-parchment border-4 border-double border-stone-800 rounded-sm w-full max-w-2xl h-[80vh] flex flex-col shadow-2xl relative overflow-hidden">
                  <div className="flex justify-between items-center p-5 border-b border-stone-300 bg-white/40">
                      <h3 className="text-xl font-bold text-stone-900 font-cinzel flex items-center gap-2 uppercase tracking-widest"><Star size={20} className="text-stone-600"/> Talentos Disponíveis</h3>
                      <button onClick={() => setShowFeatsModal(false)} className="text-stone-500 hover:text-stone-900"><X size={24}/></button>
                  </div>
                  <div className="p-5 border-b border-stone-300 bg-white/20">
                      <div className="relative">
                          <Search className="absolute left-4 top-3 text-stone-400" size={18}/>
                          <input 
                            className="w-full bg-white/60 border border-stone-300 rounded py-3 pl-12 text-sm text-stone-800 focus:outline-none focus:border-stone-800 shadow-inner" 
                            placeholder="Buscar talento pelo nome..." 
                            value={featSearch} 
                            onChange={(e) => setFeatSearch(e.target.value)}
                          />
                      </div>
                  </div>
                  <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-3">
                      {filteredFeats.map(([name, desc]) => (
                          <div key={name} className="bg-white/40 p-4 rounded border border-stone-200 hover:border-stone-800 transition-all group shadow-sm">
                              <div className="flex justify-between items-start gap-4 mb-2">
                                  <h4 className="font-black text-stone-800 text-sm uppercase tracking-wider">{name}</h4>
                                  <button 
                                    onClick={() => addFeat(name)} 
                                    className="px-4 py-1.5 bg-stone-100 hover:bg-stone-800 text-stone-600 hover:text-white text-[10px] font-black uppercase tracking-widest rounded border border-stone-300 transition-all"
                                  >
                                      Aprender
                                  </button>
                              </div>
                              <p className="text-xs text-stone-600 leading-relaxed italic">
                                  {desc}
                              </p>
                          </div>
                      ))}
                      {filteredFeats.length === 0 && (
                          <div className="text-center text-stone-400 py-12 italic border-2 border-dashed border-stone-200 rounded">
                              Nenhum talento encontrado com este nome.
                          </div>
                      )}
                  </div>
              </div>
          </div>
      )}

      {/* AVATAR SELECTION MODAL */}
      {/* Image Position Modal */}
      {showPositionModal && char.imageUrl && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
              <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-parchment border-4 border-double border-stone-800 rounded-sm w-full max-w-md overflow-hidden shadow-2xl"
              >
                  <div className="p-6 border-b border-stone-300 flex justify-between items-center bg-white/40">
                      <h3 className="text-xl font-cinzel font-bold text-stone-900 flex items-center gap-2">
                          <Move className="text-stone-600" size={20} />
                          Posicionar Avatar
                      </h3>
                      <button onClick={() => setShowPositionModal(false)} className="p-2 hover:bg-white/60 rounded-full transition-colors text-stone-500 hover:text-stone-900">
                          <X size={20} />
                      </button>
                  </div>

                  <div className="p-8 space-y-8">
                      {/* Preview Area */}
                      <div className="flex justify-center">
                          <div className="w-48 h-48 rounded bg-white/60 border-2 border-stone-800 overflow-hidden relative shadow-inner">
                              <img 
                                  src={char.imageUrl} 
                                  alt="Preview" 
                                  className="w-full h-full object-contain"
                                  style={{
                                      transform: `translate(${char.imageConfig?.x || 0}%, ${char.imageConfig?.y || 0}%) scale(${char.imageConfig?.scale || 1}) rotate(${char.imageConfig?.rotation || 0}deg)`,
                                      transition: 'none'
                                  }}
                              />
                              {/* Overlay Grid for alignment */}
                              <div className="absolute inset-0 pointer-events-none opacity-20 border border-stone-800/20 flex items-center justify-center">
                                  <div className="w-px h-full bg-stone-800/20"></div>
                                  <div className="h-px w-full bg-stone-800/20 absolute"></div>
                              </div>
                          </div>
                      </div>

                      <div className="space-y-6">
                          <div className="space-y-3">
                              <div className="flex justify-between text-xs font-bold uppercase tracking-wider text-stone-500">
                                  <span>Posição X</span>
                                  <span className="text-stone-900">{char.imageConfig?.x || 0}%</span>
                              </div>
                              <input 
                                  type="range" min="-100" max="100" step="1"
                                  value={char.imageConfig?.x || 0}
                                  onChange={(e) => setChar({ ...char, imageConfig: { ...(char.imageConfig || { x: 0, y: 0, scale: 1, rotation: 0 }), x: parseInt(e.target.value) } })}
                                  className="w-full h-1.5 bg-stone-300 rounded-lg appearance-none cursor-pointer accent-stone-800"
                              />
                          </div>

                          <div className="space-y-3">
                              <div className="flex justify-between text-xs font-bold uppercase tracking-wider text-stone-500">
                                  <span>Posição Y</span>
                                  <span className="text-stone-900">{char.imageConfig?.y || 0}%</span>
                              </div>
                              <input 
                                  type="range" min="-100" max="100" step="1"
                                  value={char.imageConfig?.y || 0}
                                  onChange={(e) => setChar({ ...char, imageConfig: { ...(char.imageConfig || { x: 0, y: 0, scale: 1, rotation: 0 }), y: parseInt(e.target.value) } })}
                                  className="w-full h-1.5 bg-stone-300 rounded-lg appearance-none cursor-pointer accent-stone-800"
                              />
                          </div>

                          <div className="space-y-3">
                              <div className="flex justify-between text-xs font-bold uppercase tracking-wider text-stone-500">
                                  <span>Escala</span>
                                  <span className="text-stone-900">{char.imageConfig?.scale || 1}x</span>
                              </div>
                              <input 
                                  type="range" min="0.5" max="3" step="0.05"
                                  value={char.imageConfig?.scale || 1}
                                  onChange={(e) => setChar({ ...char, imageConfig: { ...(char.imageConfig || { x: 0, y: 0, scale: 1, rotation: 0 }), scale: parseFloat(e.target.value) } })}
                                  className="w-full h-1.5 bg-stone-300 rounded-lg appearance-none cursor-pointer accent-stone-800"
                              />
                          </div>

                          <div className="space-y-3">
                              <div className="flex justify-between text-xs font-bold uppercase tracking-wider text-stone-500">
                                  <span>Rotação</span>
                                  <span className="text-stone-900">{char.imageConfig?.rotation || 0}°</span>
                              </div>
                              <input 
                                  type="range" min="-180" max="180" step="1"
                                  value={char.imageConfig?.rotation || 0}
                                  onChange={(e) => setChar({ ...char, imageConfig: { ...(char.imageConfig || { x: 0, y: 0, scale: 1, rotation: 0 }), rotation: parseInt(e.target.value) } })}
                                  className="w-full h-1.5 bg-stone-300 rounded-lg appearance-none cursor-pointer accent-stone-800"
                              />
                          </div>
                      </div>

                      <div className="flex gap-4 pt-4">
                          <button 
                              onClick={() => setChar({ ...char, imageConfig: { x: 0, y: 0, scale: 1, rotation: 0 } })}
                              className="flex-1 py-3 bg-white border border-stone-300 text-stone-600 font-black text-xs uppercase tracking-widest rounded hover:bg-stone-50 transition-all"
                          >
                              Resetar
                          </button>
                          <button 
                              onClick={() => setShowPositionModal(false)}
                              className="flex-1 py-3 bg-stone-800 text-white font-black text-xs uppercase tracking-widest rounded hover:bg-stone-900 transition-all shadow-md"
                          >
                              Confirmar
                          </button>
                      </div>
                  </div>
              </motion.div>
          </div>
      )}

      {showAvatarModal && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[80] p-4 backdrop-blur-sm">
              <div className="bg-parchment border-4 border-double border-stone-800 rounded-sm w-full max-w-3xl h-[80vh] flex flex-col shadow-2xl relative overflow-hidden">
                  <div className="flex justify-between items-center p-4 border-b border-stone-300 bg-white/40">
                      <h3 className="text-xl font-bold text-stone-900 font-cinzel flex items-center gap-2 uppercase tracking-widest"><ImageIcon size={20}/> Escolher Avatar</h3>
                      <button onClick={() => setShowAvatarModal(false)} className="text-stone-500 hover:text-stone-900"><X size={20}/></button>
                  </div>
                  
                  <div className="p-4 border-b border-stone-300 bg-white/20 flex flex-col gap-4">
                      <div className="flex gap-2 p-1 bg-stone-200/50 rounded-lg self-start">
                          <button 
                            onClick={() => setAvatarTab('avatars')}
                            className={`px-4 py-1.5 rounded-md text-sm font-bold transition-all ${avatarTab === 'avatars' ? 'bg-stone-800 text-white shadow-md' : 'text-stone-600 hover:bg-stone-300'}`}
                          >
                              Personagens
                          </button>
                          <button 
                            onClick={() => setAvatarTab('creatures')}
                            className={`px-4 py-1.5 rounded-md text-sm font-bold transition-all ${avatarTab === 'creatures' ? 'bg-stone-800 text-white shadow-md' : 'text-stone-600 hover:bg-stone-300'}`}
                          >
                              Criaturas
                          </button>
                          <button 
                            onClick={() => setAvatarTab('all')}
                            className={`px-4 py-1.5 rounded-md text-sm font-bold transition-all ${avatarTab === 'all' ? 'bg-stone-800 text-white shadow-md' : 'text-stone-600 hover:bg-stone-300'}`}
                          >
                              Ver Tudo
                          </button>
                      </div>

                      <div className="flex gap-4">
                          <div className="relative flex-1">
                              <Search className="absolute left-3 top-2.5 text-stone-400" size={16}/>
                              <input 
                                className="w-full bg-white/60 border border-stone-300 rounded py-2 pl-10 text-sm text-stone-800 focus:outline-none focus:border-stone-800" 
                                placeholder="Filtrar galeria..." 
                                value={avatarSearch} 
                                onChange={(e) => setAvatarSearch(e.target.value)}
                              />
                          </div>
                          <button 
                            onClick={() => fileInputRef.current?.click()} 
                            className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-600 font-bold rounded border border-stone-300 flex items-center gap-2 transition-colors"
                          >
                              <Upload size={16}/> Upload
                          </button>
                      </div>
                  </div>

                  <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
                      <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-4">
                          {galleryImages.map((url, idx) => (
                              <div 
                                key={idx} 
                                onClick={() => handleSelectGalleryImage(url!)}
                                className="aspect-square rounded border border-stone-300 overflow-hidden cursor-pointer hover:border-stone-800 hover:shadow-md transition-all group relative bg-white/40"
                              >
                                  <img src={url} alt="Avatar" className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500" loading="lazy" />
                                  <div className="absolute inset-0 bg-stone-800/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                      <Check className="text-stone-800" size={24}/>
                                  </div>
                              </div>
                          ))}
                      </div>
                      {galleryImages.length === 0 && <div className="text-center text-stone-400 py-10 italic">Nenhuma imagem encontrada na galeria.</div>}
                  </div>
              </div>
          </div>
      )}

      {/* Header and Tabs UI */}
      <div className="flex flex-col gap-6 mb-8 border-b-2 border-stone-800/30 pb-6">
        <div className="flex flex-col md:flex-row gap-6 items-start">
            
            {/* Avatar Section */}
            <div className="relative group shrink-0 mx-auto md:mx-0">
                <div 
                    onClick={() => setShowAvatarModal(true)}
                    className="w-40 h-40 md:w-64 md:h-64 rounded-lg bg-white/60 border-2 border-stone-800 flex items-center justify-center overflow-hidden cursor-pointer hover:border-stone-900 transition-all shadow-md relative group"
                >
                    {char.imageUrl ? (
                        <img 
                            src={char.imageUrl} 
                            alt={char.name} 
                            className="w-full h-full object-contain" 
                            style={{
                                transform: `translate(${char.imageConfig?.x || 0}%, ${char.imageConfig?.y || 0}%) scale(${char.imageConfig?.scale || 1}) rotate(${char.imageConfig?.rotation || 0}deg)`,
                                transition: 'transform 0.2s ease-out'
                            }}
                        />
                    ) : (
                        <User size={64} className="text-stone-400 group-hover:text-stone-600 transition-colors" />
                    )}
                    <div className="absolute inset-0 bg-stone-800/20 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                        <Camera size={24} className="text-stone-800" />
                    </div>
                </div>
                
                {char.imageUrl && (
                    <button 
                        onClick={(e) => { e.stopPropagation(); setShowPositionModal(true); }}
                        className="absolute -bottom-2 -right-2 p-2 bg-white border border-stone-800 rounded-full hover:bg-stone-100 text-stone-600 hover:text-stone-900 transition-all shadow-md z-10"
                        title="Posicionar Imagem"
                    >
                        <Move size={14} />
                    </button>
                )}

                <input 
                    type="file" 
                    ref={fileInputRef}
                    className="hidden" 
                    accept="image/*"
                    onChange={handleImageUpload}
                />
            </div>

            <div className="flex-1 w-full relative group/name">
                <input className="text-5xl font-cinzel font-black bg-transparent border-b-2 border-transparent hover:border-stone-300 focus:border-stone-800 w-full focus:outline-none transition-all placeholder-stone-300 text-stone-900 pr-12" value={char.name} onChange={(e) => setChar({ ...char, name: e.target.value })} placeholder="Nome do Herói" />
                <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-sm text-stone-500 font-bold uppercase tracking-[3px]">
                    <span>{char.race}</span>
                    <span className="text-stone-300">•</span>
                    <span>
                        {char.classes && char.classes.length > 0 
                            ? char.classes.map((c, idx) => (
                                <span key={idx} className="group/cls relative">
                                    <span className="text-stone-400 lowercase mr-1">Nv</span>{c.name}{c.subclass ? ` (${c.subclass})` : ''} {c.level}
                                    <button 
                                        onClick={() => handleLevelDown(c.name)}
                                        className="ml-1 opacity-0 group-hover/cls:opacity-100 text-red-500 hover:text-red-700 transition-all inline-flex items-center align-middle"
                                        title={`Reduzir nível de ${c.name}`}
                                    >
                                        <MinusCircle size={12} />
                                    </button>
                                    {idx < char.classes!.length - 1 && <span className="mx-2 text-stone-300">/</span>}
                                </span>
                            ))
                            : `${char.class}${char.subclass ? ` (${char.subclass})` : ''} ${char.level}`}
                    </span>
                    <span className="text-stone-300">•</span>
                    <span>{char.background}</span>
                </div>
            </div>
            
            <div className="flex items-center gap-3 self-start md:self-auto">
               <div className="flex gap-2">
                   <button onClick={handleShortRest} className="flex flex-col items-center justify-center w-16 h-16 bg-white/60 rounded border border-stone-800 hover:border-red-700 hover:bg-red-50 group transition-all shadow-sm">
                       <Heart size={20} className="text-red-700 group-hover:scale-110 transition-transform mb-1"/>
                       <span className="text-[9px] font-black uppercase text-stone-500 group-hover:text-red-700">Curto</span>
                   </button>
                   <button onClick={handleLongRest} className="flex flex-col items-center justify-center w-16 h-16 bg-white/60 rounded border border-stone-800 hover:border-indigo-700 hover:bg-indigo-50 group transition-all shadow-sm">
                       <Moon size={20} className="text-indigo-700 group-hover:scale-110 transition-transform mb-1"/>
                       <span className="text-[9px] font-black uppercase text-stone-500 group-hover:text-indigo-700">Longo</span>
                   </button>
               </div>
               
               <div className="w-px h-12 bg-stone-300 mx-2 hidden md:block"></div>

               {/* Conditions Selector */}
               <div className="flex flex-wrap gap-2 items-center">
                   <div className="flex -space-x-1 overflow-hidden p-1">
                       {(char.conditions || []).map(cond => (
                           <div key={cond} className="group relative">
                               <div className="w-8 h-8 rounded-full bg-red-100 border border-red-700 flex items-center justify-center text-red-700 shadow-sm hover:z-10 transition-all cursor-help">
                                   <AlertTriangle size={14} />
                               </div>
                               <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 p-2 bg-stone-900 text-white text-[10px] rounded shadow-xl opacity-0 group-hover:opacity-100 whitespace-nowrap pointer-events-none z-50 transition-all border border-white/10">
                                   <div className="font-bold border-b border-white/10 mb-1">{cond}</div>
                                   <div className="max-w-[150px] whitespace-normal leading-tight opacity-70">
                                       {CONDITIONS_LIST.find(c => c.n.includes(cond))?.d || 'Efeito da condição ativo.'}
                                   </div>
                               </div>
                           </div>
                       ))}
                   </div>
                   <div className="relative">
                       <select 
                           className="appearance-none bg-stone-100 border border-stone-300 rounded-full px-4 py-2 pr-8 text-[10px] font-black uppercase tracking-wider text-stone-600 focus:outline-none focus:border-stone-800 hover:bg-stone-200 transition-all cursor-pointer shadow-sm"
                           onChange={(e) => {
                               const val = e.target.value;
                               if (val && !char.conditions?.includes(val)) {
                                   setChar({ ...char, conditions: [...(char.conditions || []), val] });
                               }
                               e.target.value = "";
                           }}
                           value=""
                       >
                           <option value="">+ Condição</option>
                           {CONDITIONS_LIST.map(c => (
                               <option key={c.n} value={c.n.split(' (')[0]}>{c.n}</option>
                           ))}
                       </select>
                       <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-stone-400"/>
                   </div>
                   {(char.conditions || []).length > 0 && (
                       <button 
                           onClick={() => setChar({ ...char, conditions: [] })}
                           className="p-2 text-stone-400 hover:text-red-600 transition-colors"
                           title="Limpar todos os estados"
                       >
                           <Eraser size={14} />
                       </button>
                   )}
               </div>
               
               <div className="text-center hidden md:flex flex-col items-center">
                  <div className="text-[10px] font-black text-stone-500 uppercase tracking-widest mb-1">Bônus de Proficiência</div>
                  <div className="text-4xl font-black text-stone-900">{pbStr}</div>
                   <div className="flex gap-2 mt-2">
                       <button onClick={auditAndFixCharacter} className="p-1.5 bg-amber-500 text-stone-900 rounded shadow-md hover:bg-amber-600 transition-all hover:scale-110 active:scale-95 group/audit relative" title="Auditoria e Correção Mágica"><Hammer size={14} /><span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-stone-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover/audit:opacity-100 whitespace-nowrap pointer-events-none transition-opacity">Corrigir</span></button>
                       <button onClick={startWizard} className="p-1.5 bg-stone-800 text-amber-400 rounded shadow-md hover:bg-stone-900 transition-all hover:scale-110 active:scale-95 group/wiz relative" title="Iniciar Criação Guiada"><Sparkles size={14} /><span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-stone-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover/wiz:opacity-100 whitespace-nowrap pointer-events-none transition-opacity">Criar</span></button>
                   </div>
               </div>

               <button onClick={onDelete} className="ml-4 p-3 text-stone-400 hover:text-red-700 hover:bg-red-50 rounded transition-all"><Trash2 size={20} /></button>
            </div>
        </div>

        {/* Detailed Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 text-xs">
          <div className="bg-white/40 p-2 rounded border border-stone-800 shadow-sm">
              <label className="block text-stone-500 text-[9px] uppercase font-bold mb-1 tracking-wider">Classe</label>
              <select className="w-full bg-transparent font-bold text-stone-900 outline-none" value={char.class} onChange={(e) => setChar({ ...char, class: e.target.value, subclass: '' })}>{Object.keys(CLASSES_DB).map(c => <option key={c} value={c}>{c}</option>)}</select>
          </div>
          <div className="bg-white/40 p-2 rounded border border-stone-800 shadow-sm">
              <label className="block text-stone-500 text-[9px] uppercase font-bold mb-1 tracking-wider">Subclasse</label>
              <select className="w-full bg-transparent font-bold text-stone-900 outline-none" value={char.subclass} onChange={(e) => setChar({ ...char, subclass: e.target.value })} disabled={!char.class || !CLASSES_DB[char.class]?.sub}><option value="">-</option>{char.class && CLASSES_DB[char.class]?.sub.map(s => <option key={s} value={s}>{s}</option>)}</select>
          </div>
          <div className="bg-white/40 p-2 rounded border border-stone-800 shadow-sm">
              <label className="block text-stone-500 text-[9px] uppercase font-bold mb-1 tracking-wider">Raça</label>
              <select className="w-full bg-transparent font-bold text-stone-900 outline-none" value={char.race} onChange={(e) => setChar({ ...char, race: e.target.value })}>{RACES_LIST.map(r => <option key={r} value={r}>{r}</option>)}</select>
          </div>
          <div className="bg-white/40 p-2 rounded border border-stone-800 shadow-sm">
              <label className="block text-stone-500 text-[9px] uppercase font-bold mb-1 tracking-wider">Antecedente</label>
              <select className="w-full bg-transparent font-bold text-stone-900 outline-none" value={char.background} onChange={handleBackgroundChange}>{Object.keys(BACKGROUNDS_DB).map(b => <option key={b} value={b}>{b}</option>)}</select>
          </div>
          <div className="bg-white/40 p-2 rounded border border-stone-800 shadow-sm">
              <label className="block text-stone-500 text-[9px] uppercase font-bold mb-1 tracking-wider">Alinhamento</label>
              <input className="w-full bg-transparent font-bold text-stone-900 outline-none" value={char.alignment} onChange={(e) => setChar({...char, alignment: e.target.value})} />
          </div>
          <div className="flex gap-2">
              <div className="bg-white/40 p-2 rounded border border-stone-800 flex-1 relative group cursor-pointer shadow-sm" onClick={openLevelUp}>
                  <label className="block text-stone-500 text-[9px] uppercase font-bold mb-1 text-center tracking-wider">Nível</label>
                  <div className="text-center font-bold text-stone-900 group-hover:text-stone-600">{char.level}</div>
                  <ArrowUpCircle size={14} className="absolute top-1 right-1 text-stone-600 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <div className="bg-white/40 p-2 rounded border border-stone-800 flex-[2] relative overflow-hidden group/xp shadow-sm" title={`Progresso: ${Math.floor(xpProgress)}%`}>
                  <div className="absolute inset-0 bg-stone-800/5"></div>
                  <div className="absolute inset-0 bg-stone-800/20 transition-all duration-500" style={{ width: `${xpProgress}%` }}></div>
                  <label className="block text-stone-500 text-[9px] uppercase font-bold mb-1 text-right relative z-10 mr-1 tracking-wider">XP</label>
                  <input type="number" className="w-full bg-transparent text-right font-mono text-stone-900 outline-none relative z-10" value={char.xp} onChange={(e) => setChar({ ...char, xp: safeInt(e.target.value) })} />
              </div>
          </div>
        </div>
      </div>

      <div className="flex gap-1 mb-8 border-b-2 border-stone-800/20 overflow-x-auto no-scrollbar">
        {[{ id: 'main', icon: Sword, label: 'Geral' }, { id: 'combat', icon: Flame, label: 'Combate' }, { id: 'spells', icon: Zap, label: 'Magias' }, { id: 'inv', icon: Backpack, label: 'Itens & Poderes' }, { id: 'bio', icon: Scroll, label: 'História' }].map((tab) => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={`flex items-center gap-2 px-4 py-3 text-[10px] font-black uppercase tracking-[2px] transition-all whitespace-nowrap border-b-4 ${activeTab === tab.id ? 'border-stone-800 text-stone-900 bg-white/30' : 'border-transparent text-stone-400 hover:text-stone-600 hover:bg-white/40'}`}>
            <tab.icon size={14} /> {tab.label}
          </button>
        ))}
        <div className="flex-1" />
        <button onClick={handleExportCard} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200 transition-all text-xs font-bold uppercase" title="Exportar Ficha como Imagem PNG">
          <ImageIcon size={16} /> <span>Salvar PNG</span>
        </button>
        <button onClick={handleSave} className="p-2 text-stone-400 hover:text-stone-900 transition-colors" title="Exportar Ficha"><Save size={20} /></button>
        <label className="p-2 text-stone-400 hover:text-stone-900 cursor-pointer transition-colors" title="Importar Ficha (JSON ou PNG-Card)"><Upload size={20} /><input type="file" hidden onChange={handleLoad} accept=".json,.png" /></label>
      </div>

      {activeTab === 'main' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-2 space-y-3">
            <div className="grid grid-cols-3 lg:grid-cols-1 gap-2">
                {Object.entries(char.attributes).map(([key, val]) => {
                const mod = getMod(val as number);
                return (
                    <div key={key} className="bg-white/40 rounded border border-stone-800 relative group overflow-hidden flex flex-col items-center p-2 transition-all hover:border-stone-900 hover:shadow-md shadow-sm">
                        <div className="text-[9px] font-black uppercase text-stone-400 tracking-[1px] mb-1">{ATTR_MAP[key] || key}</div>
                        <div className="text-3xl font-cinzel font-black text-stone-900 mb-1 group-hover:scale-105 transition-transform drop-shadow-sm">{fmt(mod)}</div>
                        <div className="relative z-10 w-12 h-7 bg-white/60 rounded border border-stone-300 flex items-center justify-center shadow-inner">
                            <input type="number" className="w-full text-center bg-transparent text-[11px] font-black text-stone-500 focus:text-stone-900 outline-none relative z-20" value={val as number} onChange={(e) => updateAttr(key as any, safeInt(e.target.value))} />
                        </div>
                        <button onClick={() => onRoll(20, mod, `Teste de ${ATTR_MAP[key] || key}`)} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" title={`Rolar ${ATTR_MAP[key]}`}></button>
                    </div>
                );
                })}
            </div>
             <div className="flex gap-4 mt-4">
                 <div className="flex-1 p-5 bg-white/40 rounded border border-stone-800 shadow-sm">
                    <div className="flex justify-between items-center mb-4">
                        <span className="text-[10px] font-black uppercase text-stone-400 tracking-[2px]">Exaustão</span>
                        <span className="font-mono text-2xl font-black text-red-800 drop-shadow-sm">{char.exhaustion || 0}</span>
                    </div>
                    <div className="flex gap-1.5">
                        {[1,2,3,4,5,6].map(lvl => (
                            <button key={lvl} onClick={() => setChar(prev => ({...prev, exhaustion: prev.exhaustion === lvl ? lvl - 1 : lvl}))} className={`h-2.5 flex-1 rounded-full transition-all duration-300 border border-stone-300/30 ${char.exhaustion && char.exhaustion >= lvl ? 'bg-red-800 shadow-md' : 'bg-stone-200 shadow-inner'}`}/>
                        ))}
                    </div>
                 </div>

                 <button 
                    onClick={() => setChar(prev => ({ ...prev, inspiration: !prev.inspiration }))}
                    className={`flex-1 p-5 rounded border-2 transition-all flex flex-col items-center justify-center gap-1 shadow-sm ${char.inspiration ? 'bg-amber-50 border-amber-500 shadow-amber-200/50' : 'bg-white/40 border-stone-800'}`}
                 >
                    <Star size={24} className={char.inspiration ? 'text-amber-500 fill-amber-500 animate-pulse' : 'text-stone-300'} />
                    <span className={`text-[10px] font-black uppercase tracking-widest ${char.inspiration ? 'text-amber-600' : 'text-stone-400'}`}>Inspiração</span>
                 </button>
            </div>
          </div>

          <div className="lg:col-span-5 space-y-6">
             <div className="grid grid-cols-3 gap-3">
               <div className="bg-white/40 p-4 rounded border border-stone-800 relative group shadow-sm">
                  <div className="flex flex-col items-center">
                      <div className="text-[10px] font-black text-stone-400 uppercase tracking-[2px] mb-2">Defesa</div>
                      <Shield size={32} className="text-stone-200 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[60%] opacity-40 group-hover:text-stone-300 transition-colors" />
                      <input type="number" className={`relative z-10 w-full bg-transparent text-center font-cinzel font-black text-4xl focus:outline-none drop-shadow-sm ${char.autoAc ? 'text-stone-600' : 'text-stone-900'}`} value={char.ac} readOnly={char.autoAc} onChange={e => setChar({...char, ac: safeInt(e.target.value) || 10})} />
                      <label className="flex items-center gap-1 cursor-pointer mt-2 relative z-10" title="Auto-cálculo">
                        <input type="checkbox" checked={char.autoAc || false} onChange={(e) => setChar({...char, autoAc: e.target.checked})} className="accent-stone-800 w-3 h-3" />
                        <span className="text-[9px] font-black text-stone-400 tracking-wider">AUTO</span>
                      </label>
                  </div>
                  {char.autoAc && (
                      <div className="absolute top-full left-0 mt-2 hidden group-hover:block z-50 bg-parchment border border-stone-800 p-3 rounded text-[10px] text-stone-600 shadow-2xl w-56 text-center italic leading-relaxed">
                          {getAcBreakdown().toString()}
                      </div>
                  )}
               </div>
               
               <div className="bg-white/40 p-4 rounded border border-stone-800 cursor-pointer hover:border-stone-900 group transition-all relative overflow-hidden shadow-sm" onClick={() => onRoll(20, initiative, "Iniciativa")}>
                  <div className="absolute inset-0 bg-stone-900/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="flex flex-col items-center relative z-10">
                      <div className="text-[10px] font-black text-stone-400 uppercase tracking-[2px] mb-2">Iniciativa</div>
                      <div className="text-4xl font-cinzel font-black text-stone-900 group-hover:scale-110 transition-transform drop-shadow-sm">{fmt(initiative)}</div>
                      <div className="text-[9px] text-stone-400 font-black mt-2 tracking-wider">MODIFICADOR</div>
                  </div>
               </div>

               <div className="bg-white/40 p-4 rounded border border-stone-800 shadow-sm relative group overflow-hidden">
                   <div className="flex flex-col items-center relative z-10">
                        <div className="text-[10px] font-black text-stone-400 uppercase tracking-[2px] mb-2">P. Passiva</div>
                        <div className="text-4xl font-cinzel font-black text-stone-900 drop-shadow-sm">{passivePerception}</div>
                        <div className="text-[9px] text-stone-400 font-black mt-2 tracking-wider">PERCEPÇÃO</div>
                   </div>
               </div>

               <div className="bg-white/40 p-4 rounded border border-stone-800 shadow-sm">
                   <div className="flex flex-col items-center">
                       <div className="text-[10px] font-black text-stone-400 uppercase tracking-[2px] mb-2">Desloc.</div>
                       <input type="text" className="w-full bg-transparent text-center font-cinzel font-black text-3xl focus:outline-none text-stone-900 drop-shadow-sm" value={char.speed} onChange={e => setChar({...char, speed: e.target.value})} />
                       <div className="text-[9px] text-stone-400 font-black mt-2 tracking-wider">METROS</div>
                   </div>
                </div>
              </div>

              {/* Conditions Summary */}
              <div className="bg-white/40 p-4 rounded border border-stone-800 shadow-sm">
                <div className="flex justify-between items-center mb-3">
                  <div className="text-[10px] font-black text-stone-400 uppercase tracking-[2px]">Condições & Efeitos</div>
                  <Sparkles size={14} className="text-stone-300" />
                </div>
                <div className="flex flex-wrap gap-2">
                  {[
                    "Cego", "Ensurdecido", "Amaldiçoado", "Atordoado", "Caído", "Envenenado", 
                    "Incapacitado", "Invisível", "Paralisado", "Petrificado", "Agarrado", "Impedido",
                    "Freado", "Inconsciente"
                  ].map(cond => {
                    const hasCond = (char.conditions || []).includes(cond);
                    return (
                        <button 
                            key={cond}
                            onClick={() => {
                                const current = char.conditions || [];
                                const next = current.includes(cond) ? current.filter(c => c !== cond) : [...current, cond];
                                setChar({ ...char, conditions: next });
                            }}
                            className={`px-2 py-1 rounded text-[9px] font-black uppercase transition-all border ${hasCond ? 'bg-stone-800 text-white border-stone-800 shadow-md transform scale-105' : 'bg-white/40 border-stone-300 text-stone-400 hover:border-stone-500'}`}
                        >
                            {cond}
                        </button>
                    );
                  })}
                  {(char.conditions || []).length === 0 && <div className="text-[11px] text-stone-400 italic">Nenhuma condição ativa.</div>}
                </div>
              </div>

             <div className="bg-white/40 p-8 rounded border border-stone-800 shadow-md relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-b from-stone-800/5 to-transparent pointer-events-none"></div>
                
                <div className="flex justify-between items-start mb-4 relative z-10">
                   <div className="flex items-center gap-2 text-stone-400">
                        <Heart size={18} className="text-red-800" fill="currentColor" />
                        <span className="font-black text-[10px] uppercase tracking-[3px]">Pontos de Vida</span>
                   </div>
                   <div className="flex items-center gap-3">
                        <label className="flex items-center gap-1 cursor-pointer text-[10px] font-black text-stone-400 hover:text-stone-600 tracking-wider">
                            <input type="checkbox" checked={char.autoHp || false} onChange={(e) => setChar({...char, autoHp: e.target.checked})} className="accent-red-800" />
                            AUTO
                        </label>
                        <div className="bg-white/60 px-3 py-1 rounded text-[10px] font-black text-stone-500 border border-stone-300 shadow-inner tracking-widest">
                            MAX: {char.hp.max}
                        </div>
                   </div>
                </div>
                
                <div className="relative z-10 flex items-center justify-center py-4">
                    <input type="number" className="w-full text-center text-8xl font-cinzel font-black bg-transparent text-stone-900 focus:outline-none drop-shadow-md" value={char.hp.current} onChange={e => setChar({...char, hp: {...char.hp, current: safeInt(e.target.value)}})} />
                </div>
                
                <div className="h-8 w-full bg-stone-200 rounded border border-stone-800 relative shadow-inner overflow-hidden">
                    <div 
                        className="h-full transition-all duration-700 ease-out relative"
                        style={{
                            width: `${Math.min(100, Math.max(0, (char.hp.current / char.hp.max) * 100))}%`,
                            background: `linear-gradient(90deg, ${char.hp.current / char.hp.max > 0.5 ? '#166534, #15803d' : char.hp.current / char.hp.max > 0.2 ? '#854d0e, #a16207' : '#7f1d1d, #991b1b'})`,
                        }}
                    >
                        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-white/20 to-transparent"></div>
                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')] opacity-20"></div>
                    </div>
                </div>
                
                <div className="mt-6 flex justify-center">
                    <div className="flex items-center gap-3 bg-white/60 px-6 py-2 rounded border border-stone-300 shadow-inner">
                        <span className="text-[10px] font-black text-stone-400 uppercase tracking-[2px]">Temporário</span>
                        <input type="number" className="w-14 bg-transparent text-center text-stone-900 font-black text-lg outline-none border-b-2 border-stone-300 focus:border-stone-800 transition-colors" value={char.hp.temp} onChange={e => setChar({...char, hp: {...char.hp, temp: safeInt(e.target.value)}})} placeholder="0" />
                    </div>
                </div>
             </div>

             {/* QUICK ATTACKS SECTION */}
             <div className="bg-white/40 p-6 rounded border border-stone-800 shadow-sm relative overflow-hidden">
                <div className="flex justify-between items-center mb-4">
                    <div className="text-[10px] font-black text-stone-400 uppercase tracking-[3px] flex items-center gap-2">
                        <Sword size={14} className="text-stone-600" />
                        Ações de Combate
                    </div>
                </div>
                
                <div className="space-y-3">
                    {char.inventory.split('\n').filter(i => i.includes('[E]') && i.includes('Dano:')).map((weaponLine, idx) => {
                        const name = weaponLine.replace(/^- /, '').replace('[E]', '').split('|')[0].trim();
                        const damageMatch = weaponLine.match(/Dano: ([\d\w+d\s]+)/);
                        const damageStr = damageMatch ? damageMatch[1].trim() : '1d4';
                        const isFinesse = weaponLine.toLowerCase().includes('acuidade');
                        
                        const strMod = getMod(char.attributes.str);
                        const dexMod = getMod(char.attributes.dex);
                        const attackMod = isFinesse ? Math.max(strMod, dexMod) : strMod;
                        const totalAttack = attackMod + profBonus;

                        return (
                            <div key={idx} className="bg-white/60 border border-stone-300 rounded p-3 flex justify-between items-center group hover:border-stone-800 transition-all shadow-sm">
                                <div className="flex-1">
                                    <div className="font-black text-stone-900 uppercase text-xs truncate max-w-[200px]">{name}</div>
                                    <div className="text-[9px] text-stone-500 font-bold uppercase tracking-tighter">Atk: {fmt(totalAttack)} • {damageStr}</div>
                                </div>
                                <div className="flex gap-1">
                                    <button onClick={() => onRoll(20, totalAttack, `Ataque: ${name}`)} className="px-2 py-1.5 bg-stone-800 hover:bg-stone-900 text-white rounded text-[9px] font-black uppercase tracking-tight shadow-sm active:scale-95 transition-all">ATK</button>
                                    <button 
                                        onClick={() => {
                                            const parts = damageStr.split(' ');
                                            const dice = parts[0];
                                            const type = parts.slice(1).join(' ');
                                            const match = dice.match(/(\d+)d(\d+)/);
                                            if(match) {
                                                const count = parseInt(match[1]);
                                                const sides = parseInt(match[2]);
                                                let total = attackMod;
                                                let rolls = [];
                                                for(let i=0; i<count; i++) {
                                                    const r = Math.floor(Math.random() * sides) + 1;
                                                    rolls.push(r);
                                                    total += r;
                                                }
                                                addLog?.(char.name, `causou **${total}** de dano ${type} com ${name}! (${rolls.join('+')}${fmt(attackMod)})`, 'info');
                                            }
                                        }}
                                        className="px-2 py-1.5 bg-red-700 hover:bg-red-800 text-white rounded text-[9px] font-black uppercase tracking-tight shadow-sm active:scale-95 transition-all"
                                    >
                                        DANO
                                    </button>
                                </div>
                            </div>
                        )
                    })}
                    {char.inventory.split('\n').filter(i => i.includes('[E]') && i.includes('Dano:')).length === 0 && (
                        <div className="flex items-center justify-between bg-white/60 border border-stone-300 rounded p-3 shadow-sm">
                            <div className="flex-1">
                                <div className="font-black text-stone-900 uppercase text-xs">Golpe Desarmado</div>
                                <div className="text-[9px] text-stone-500 font-bold uppercase tracking-tighter">Atk: {fmt(getMod(char.attributes.str) + profBonus)} • Dano 1 + {getMod(char.attributes.str)}</div>
                            </div>
                            <div className="flex gap-1">
                                <button onClick={() => onRoll(20, getMod(char.attributes.str) + profBonus, `Ataque Desarmado`)} className="px-2 py-1.5 bg-stone-800 text-white rounded text-[9px] font-black uppercase shadow-sm">ATK</button>
                                <button onClick={() => addLog?.(char.name, `causou **${1 + getMod(char.attributes.str)}** de dano de concussão com os punhos!`, 'info')} className="px-2 py-1.5 bg-red-700 text-white rounded text-[9px] font-black uppercase shadow-sm">DANO</button>
                            </div>
                        </div>
                    )}
                </div>
             </div>

             <div className="grid grid-cols-2 gap-4">
                 <div className="bg-white/40 p-5 rounded border border-stone-800 shadow-sm">
                    <div className="text-[10px] font-black text-stone-400 uppercase text-center mb-4 tracking-[2px] flex items-center justify-center gap-2"><Zap size={14} className="text-stone-600"/> Dados de Vida</div>
                    <div className="flex items-center justify-center gap-3">
                        <input type="number" className="w-12 text-center bg-white/60 border border-stone-300 rounded py-2 font-black text-2xl text-stone-900 focus:border-stone-800 outline-none shadow-inner" value={char.hitDice.current} onChange={(e) => setChar({...char, hitDice: {...char.hitDice, current: safeInt(e.target.value)}})}/>
                        <span className="text-stone-300 font-black text-2xl">/</span>
                        <input type="text" className="w-14 text-center bg-white/60 border border-stone-300 rounded py-2 font-black text-sm text-stone-500 outline-none shadow-inner" value={char.hitDice.max} onChange={(e) => setChar({...char, hitDice: {...char.hitDice, max: e.target.value}})}/>
                    </div>
                 </div>
                 <div className="bg-white/40 p-5 rounded border border-stone-800 shadow-sm">
                    <div className="text-[10px] font-black text-stone-400 uppercase text-center mb-4 tracking-[2px] flex items-center justify-center gap-2"><Skull size={14} className="text-stone-600"/> Salvaguardas</div>
                    <div className="flex flex-col gap-3">
                        <div className="flex items-center justify-between px-2">
                            <span className="text-[10px] font-black text-stone-400 uppercase tracking-wider">SUC</span>
                            <div className="flex gap-1.5">
                                {[1,2,3].map(i => (<input key={i} type="checkbox" className="accent-stone-800 w-4 h-4 rounded-full bg-stone-200 border-stone-400" checked={char.deathSaves.successes >= i} onChange={() => setChar({...char, deathSaves: {...char.deathSaves, successes: char.deathSaves.successes >= i ? i - 1 : i}})}/>))}
                            </div>
                        </div>
                        <div className="flex items-center justify-between px-2">
                            <span className="text-[10px] font-black text-stone-400 uppercase tracking-wider">FAL</span>
                            <div className="flex gap-1.5">
                                {[1,2,3].map(i => (<input key={i} type="checkbox" className="accent-red-800 w-4 h-4 rounded-full bg-stone-200 border-stone-400" checked={char.deathSaves.failures >= i} onChange={() => setChar({...char, deathSaves: {...char.deathSaves, failures: char.deathSaves.failures >= i ? i - 1 : i}})}/>))}
                            </div>
                        </div>
                    </div>
                 </div>
             </div>
          </div>

          <div className="lg:col-span-5 space-y-6">
             <div className="bg-white/40 p-5 rounded border border-stone-800 h-full flex flex-col shadow-sm">
               <h3 className="font-black text-[10px] uppercase mb-6 text-stone-400 text-center tracking-[4px] flex items-center justify-center gap-2"><Brain size={16} className="text-stone-600"/> PERÍCIAS & TESTES</h3>
               
               <div className="grid grid-cols-2 gap-2 mb-6 pb-6 border-b border-stone-300">
                  {Object.keys(char.attributes).map(attr => {
                     const isProf = char.saves[attr];
                     const mod = getMod(char.attributes[attr as keyof typeof char.attributes]) + (isProf ? profBonus : 0);
                     return (
                       <button key={attr} className={`flex items-center justify-between px-3 py-2 rounded text-[10px] border transition-all ${isProf ? 'bg-stone-800 text-white border-stone-900 shadow-md' : 'bg-white/60 border-stone-300 text-stone-500 hover:border-stone-800 hover:text-stone-800'}`} onClick={() => onRoll(20, mod, `Resistência de ${ATTR_MAP[attr]}`)}>
                         <span className="font-black uppercase tracking-wider">{ATTR_MAP[attr].substring(0,3)}</span>
                         <div className="flex items-center gap-2">
                            {isProf && <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span>}
                            <span className="font-CINZEL font-black text-sm">{fmt(mod)}</span>
                         </div>
                       </button>
                     )
                  })}
               </div>

               <div className="flex-1 overflow-y-auto pr-2 space-y-1.5 custom-scrollbar max-h-[450px]">
                 {SKILL_LIST.map(skill => {
                   const attrVal = char.attributes[skill.a as keyof typeof char.attributes];
                   const mod = getMod(attrVal) + (char.skills[skill.id] ? profBonus : 0);
                   const isStealth = skill.id === 'furtividade';
                   return (
                     <div key={skill.id} className="flex items-center text-sm p-2 hover:bg-white/60 rounded cursor-pointer group transition-all border border-transparent hover:border-stone-200" onClick={() => onRoll(20, mod, skill.n)}>
                       <div onClick={(e) => { e.stopPropagation(); toggleSkill(skill.id); }} className={`w-3.5 h-3.5 rounded-full border-2 mr-3 transition-colors ${char.skills[skill.id] ? 'bg-stone-800 border-stone-800' : 'border-stone-300 group-hover:border-stone-500'}`}></div>
                       <span className={`flex-1 truncate text-xs tracking-tight ${char.skills[skill.id] ? 'text-stone-900 font-black uppercase' : 'text-stone-500 group-hover:text-stone-700 font-medium'}`}>
                        {skill.n}
                        {isStealth && char.stealthDisadvantage && <span className="ml-2 text-red-800 inline-block" title="Desvantagem"><AlertTriangle size={12}/></span>}
                       </span>
                       <span className={`font-mono text-xs font-bold ${char.skills[skill.id] ? 'text-stone-900' : 'text-stone-400'}`}>{fmt(mod)}</span>
                     </div>
                   );
                 })}
               </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'main' && (
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8 pt-10 border-t-2 border-stone-800/20">
            <div className="bg-white/40 p-8 rounded border border-stone-800 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 p-2 opacity-10">
                    <Sparkles size={80} className="text-stone-900" />
                </div>
                <h3 className="font-cinzel text-xl font-black text-stone-900 mb-6 border-b border-stone-300 pb-3 flex items-center gap-3 uppercase tracking-widest">
                    <Sparkles size={24} className="text-stone-600" />
                    Essência da Alma
                </h3>
                <textarea 
                    className="w-full bg-transparent border-none resize-none focus:outline-none text-stone-800 min-h-[200px] font-spectral italic text-lg leading-relaxed placeholder:text-stone-300"
                    placeholder="Descreva a essência da alma do seu herói, seus ideais mais profundos e o que o move..."
                    value={char.essence || ''}
                    onChange={(e) => setChar({...char, essence: e.target.value})}
                />
            </div>

            <div className="bg-white/40 p-8 rounded border border-stone-800 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 p-2 opacity-10">
                    <ShoppingBag size={80} className="text-stone-900" />
                </div>
                <h3 className="font-cinzel text-xl font-black text-stone-900 mb-6 border-b border-stone-300 pb-3 flex items-center gap-3 uppercase tracking-widest">
                    <ShoppingBag size={24} className="text-stone-600" />
                    Drops & Recompensas
                </h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                        <thead>
                            <tr className="border-b-2 border-stone-300">
                                <th className="py-3 px-2 font-black uppercase text-stone-400 tracking-widest">Item / Recompensa</th>
                                <th className="py-3 px-2 font-black uppercase text-stone-400 tracking-widest text-right">Qtd</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr className="border-b border-stone-200 group">
                                <td className="py-4 px-2">
                                    <textarea 
                                        className="w-full bg-transparent border-none resize-none focus:outline-none text-stone-800 font-spectral italic text-sm leading-tight placeholder:text-stone-300"
                                        placeholder="Novas conquistas e espólios de guerra..."
                                        rows={6}
                                        value={char.drops || ''}
                                        onChange={(e) => setChar({...char, drops: e.target.value})}
                                    />
                                </td>
                                <td className="py-4 px-2 text-right align-top">
                                    <span className="font-mono text-stone-400 font-bold italic">Auto</span>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
      )}

      {/* Rest of the component (Spells, Inv, Bio tabs) remains unchanged, just using the modal for avatar selection */}
      {activeTab === 'combat' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="space-y-6">
                <div className="bg-white/40 border border-stone-800 rounded p-6 shadow-sm">
                    <h3 className="font-cinzel text-sm font-black text-stone-900 mb-6 uppercase tracking-[4px] flex items-center gap-2 border-b border-stone-300 pb-2"><Sword size={18}/> ATAQUES COM ARMAS</h3>
                    <div className="space-y-4">
                        {char.inventory.split('\n').filter(i => i.includes('[E]') && i.includes('Dano:')).map((weaponLine, idx) => {
                            const name = weaponLine.replace(/^- /, '').replace('[E]', '').split('|')[0].trim();
                            const damageMatch = weaponLine.match(/Dano: ([\d\w+d\s]+)/);
                            const damageStr = damageMatch ? damageMatch[1].trim() : '1d4';
                            const isFinesse = weaponLine.toLowerCase().includes('acuidade');
                            
                            const strMod = getMod(char.attributes.str);
                            const dexMod = getMod(char.attributes.dex);
                            const attackMod = isFinesse ? Math.max(strMod, dexMod) : strMod;
                            const totalAttack = attackMod + profBonus;

                             return (
                                <div key={idx} className="bg-white/60 border border-stone-300 rounded p-4 flex justify-between items-center group hover:border-stone-800 transition-all shadow-sm">
                                    <div className="flex-1">
                                        <div className="font-black text-stone-900 uppercase text-xs mb-1">{name}</div>
                                        <div className="text-[10px] text-stone-500 font-bold uppercase tracking-tighter">Bônus: {fmt(totalAttack)} • Dano: {damageStr}</div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button 
                                            onClick={() => onRoll(20, totalAttack, `Ataque: ${name}`)}
                                            className="px-4 py-2 bg-stone-800 hover:bg-stone-900 text-white rounded text-[10px] font-black uppercase tracking-widest shadow-md active:scale-95 transition-all"
                                        >
                                            ACERTAR
                                        </button>
                                        <button 
                                            onClick={() => {
                                                const parts = damageStr.split(' ');
                                                const dice = parts[0];
                                                const type = parts.slice(1).join(' ');
                                                const mod = attackMod;
                                                // Simplified dice parsing for the custom roll
                                                const match = dice.match(/(\d+)d(\d+)/);
                                                if(match) {
                                                    const count = parseInt(match[1]);
                                                    const sides = parseInt(match[2]);
                                                    let total = mod;
                                                    let rolls = [];
                                                    for(let i=0; i<count; i++) {
                                                        const r = Math.floor(Math.random() * sides) + 1;
                                                        rolls.push(r);
                                                        total += r;
                                                    }
                                                    addLog(char.name, `causou **${total}** de dano ${type} com ${name}! (${rolls.join('+')}${fmt(mod)})`, 'info');
                                                }
                                            }}
                                            className="px-4 py-2 bg-red-700 hover:bg-red-800 text-white rounded text-[10px] font-black uppercase tracking-widest shadow-md active:scale-95 transition-all"
                                        >
                                            DANO
                                        </button>
                                    </div>
                                </div>
                             )
                        })}
                        {char.inventory.split('\n').filter(i => i.includes('[E]') && i.includes('Dano:')).length === 0 && (
                            <div className="text-center py-10 border border-dashed border-stone-300 rounded text-stone-400 text-[10px] font-black uppercase tracking-widest italic">Equipe armas no Inventário para vê-las aqui</div>
                        )}
                        
                        {/* Unarmed Strike */}
                        <div className="bg-white/60 border border-stone-300 rounded p-4 flex justify-between items-center group hover:border-stone-800 transition-all shadow-sm">
                            <div className="flex-1">
                                <div className="font-black text-stone-900 uppercase text-xs mb-1">Golpe Desarmado</div>
                                <div className="text-[10px] text-stone-500 font-bold uppercase tracking-tighter">Bônus: {fmt(getMod(char.attributes.str) + profBonus)} • Dano: 1 + {getMod(char.attributes.str)}</div>
                            </div>
                            <div className="flex gap-2">
                                <button onClick={() => onRoll(20, getMod(char.attributes.str) + profBonus, `Ataque Desarmado`)} className="px-4 py-2 bg-stone-800 hover:bg-stone-900 text-white rounded text-[10px] font-black uppercase tracking-widest shadow-md transition-all active:scale-95">ACERTAR</button>
                                <button onClick={() => addLog(char.name, `causou **${1 + getMod(char.attributes.str)}** de dano de concussão com os punhos!`, 'info')} className="px-4 py-2 bg-red-700 hover:bg-red-800 text-white rounded text-[10px] font-black uppercase tracking-widest shadow-md transition-all active:scale-95">DANO</button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white/40 border border-stone-800 rounded p-6 shadow-sm">
                    <h3 className="font-cinzel text-sm font-black text-stone-900 mb-6 uppercase tracking-[4px] flex items-center gap-2 border-b border-stone-300 pb-2"><Zap size={18}/> MAGIAS E HABILIDADES DE ATAQUE</h3>
                    <div className="space-y-4">
                        {/* Detailed Spells */}
                        {(char.spellList || []).map((s, idx) => {
                            const castingMod = getMod(char.attributes[char.spells.castingStat as keyof typeof char.attributes] || 10);
                            const spellAttack = castingMod + profBonus;
                            const desc = s.description.toLowerCase();
                            const damageMatch = s.description.match(/(\d+d\d+)/);
                            const damageStr = damageMatch ? damageMatch[1] : 'Dano Variável';

                            // Improved logic: Show all Cantrips and Prepared Leveled Spells 
                            // OR Spells that look like combat actions (even if not marked as prepared by mistake)
                            const isCombatAction = desc.includes('dano') || desc.includes('ataque') || desc.includes('damage') || 
                                                 desc.includes('hit') || desc.includes('cure') || desc.includes('heal') || 
                                                 desc.includes('cura') || desc.includes('causar') || desc.includes('atacar') ||
                                                 desc.includes('bonus d\'ataque') || desc.includes('vulnerabilidade');
                            
                            if (s.level > 0 && !s.prepared && !isCombatAction) return null;

                            return (
                                <div key={`detailed-${idx}`} className={`bg-white/60 border-l-[6px] border-y border-r border-stone-300 rounded-r-xl p-4 flex justify-between items-center group hover:border-stone-800 transition-all shadow-sm relative overflow-hidden ${s.level === 0 ? 'border-l-emerald-600' : 'border-l-indigo-600'}`}>
                                     {s.prepared && s.level > 0 && (
                                        <div className="absolute left-0 top-0 w-1 h-full bg-indigo-500 opacity-50"></div>
                                    )}
                                    <div className="flex-1">
                                        <div className="font-black text-stone-900 uppercase text-xs mb-1 flex items-center gap-2">
                                            {s.name}
                                            {s.level === 0 ? (
                                                <span className="text-[8px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-black uppercase">Truque</span>
                                            ) : (
                                                <span className="text-[8px] bg-indigo-100 text-indigo-800 px-1.5 py-0.5 rounded font-black uppercase">Círculo {s.level}</span>
                                            )}
                                        </div>
                                        <div className="text-[10px] text-stone-500 font-bold uppercase tracking-tighter">Nível: {s.level} • Bônus: {fmt(spellAttack)} • CD: {8 + spellAttack}</div>
                                        <div className="text-[9px] text-stone-400 font-spectral italic mt-1 line-clamp-1 max-w-[250px]">{s.description}</div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button onClick={() => onRoll(20, spellAttack, `Magia: ${s.name}`)} className={`px-4 py-2 text-white rounded text-[10px] font-black uppercase tracking-widest shadow-md transition-all active:scale-95 ${s.level === 0 ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-indigo-600 hover:bg-indigo-700'}`}>
                                            {s.level === 0 ? 'USAR' : 'CONJURAR'}
                                        </button>
                                        {(damageMatch || desc.includes('dano') || desc.includes('cura')) && (
                                            <button 
                                                onClick={() => {
                                                    const match = damageStr.match(/(\d+)d(\d+)/);
                                                    if(match) {
                                                        const count = parseInt(match[1]);
                                                        const sides = parseInt(match[2]);
                                                        let total = 0;
                                                        let rolls = [];
                                                        for(let i=0; i<count; i++) {
                                                            const r = Math.floor(Math.random() * sides) + 1;
                                                            rolls.push(r);
                                                            total += r;
                                                        }
                                                        const actionType = desc.includes('cura') || desc.includes('heal') ? 'curou' : 'conjurou';
                                                        addLog(char.name, `${actionType} **${s.name}** causando **${total}**! (${rolls.join('+')})`, 'info');
                                                    } else {
                                                        addLog(char.name, `conjurou **${s.name}**!`, 'info');
                                                    }
                                                }}
                                                className={`px-4 py-2 ${desc.includes('cura') || desc.includes('heal') ? 'bg-emerald-700 hover:bg-emerald-800' : 'bg-indigo-700 hover:bg-indigo-800'} text-white rounded text-[10px] font-black uppercase tracking-widest shadow-md transition-all active:scale-95`}
                                            >
                                                {desc.includes('cura') || desc.includes('heal') ? 'CURAR' : 'EFEITO'}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            )
                        }).filter(Boolean)}

                        {/* Simple Abilities from getSpellLines() */}
                        {getSpellLines().map((line, idx) => {
                            const l = line.toLowerCase();
                            const isOffensive = l.includes('dano') || l.includes('ataque') || l.includes('damage') || 
                                               l.includes('hit') || l.includes('cura') || l.includes('heal') || 
                                               line.match(/\d+d\d+/);
                            
                            if (!isOffensive) return null;

                            const name = line.split(':')[0].replace(/\[.*?\]/g, '').trim();
                            const damageMatch = line.match(/(\d+d\d+)/);
                            const damageStr = damageMatch ? damageMatch[1] : null;

                            const isRace = l.includes('[raça]') || l.includes('[racial]');
                            const isAbility = l.includes('[habilidade]');
                            const isAttack = l.includes('[ataque]') || l.includes('ataque') || l.includes('dano') || line.match(/\d+d\d+/);
                            
                            let borderClass = 'border-l-amber-600';
                            let btnClass = 'bg-amber-600 hover:bg-amber-700';
                            let tagLabel = 'Habilidade';
                            let tagClass = 'bg-amber-100 text-amber-800';

                            if (isRace) { borderClass = 'border-l-violet-600'; btnClass = 'bg-violet-600 hover:bg-violet-700'; tagLabel = 'Raça'; tagClass = 'bg-violet-100 text-violet-800'; }
                            else if (isAttack) { borderClass = 'border-l-rose-600'; btnClass = 'bg-rose-600 hover:bg-rose-700'; tagLabel = 'Ataque'; tagClass = 'bg-rose-100 text-rose-800'; }
                            else if (isAbility) { borderClass = 'border-l-amber-600'; btnClass = 'bg-amber-600 hover:bg-amber-700'; tagLabel = 'Classe'; tagClass = 'bg-amber-100 text-amber-800'; }

                            return (
                                <div key={`simple-${idx}`} className={`bg-white/60 border-l-[6px] border-y border-r border-stone-300 rounded-r-xl p-4 flex justify-between items-center group hover:border-stone-800 transition-all shadow-sm ${borderClass}`}>
                                    <div className="flex-1">
                                        <div className="font-black text-stone-900 uppercase text-[10px] mb-1 flex items-center gap-2">
                                            {name}
                                            <span className={`text-[8px] px-1.5 py-0.5 rounded font-black uppercase ${tagClass}`}>{tagLabel}</span>
                                        </div>
                                        <div className="text-[9px] text-stone-500 font-bold uppercase tracking-tighter leading-tight max-w-[250px] line-clamp-2">{line.includes(':') ? line.split(':').slice(1).join(':').trim() : 'Poder Especial'}</div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button onClick={() => addLog(char.name, `usou **${name}**!`, 'info')} className={`px-4 py-2 text-white rounded text-[10px] font-black uppercase tracking-widest shadow-md transition-all active:scale-95 ${btnClass}`}>USAR</button>
                                        {damageStr && (
                                            <button 
                                                onClick={() => {
                                                    const match = damageStr.match(/(\d+)d(\d+)/);
                                                    if(match) {
                                                        const count = parseInt(match[1]);
                                                        const sides = parseInt(match[2]);
                                                        let total = 0;
                                                        let rolls = [];
                                                        for(let i=0; i<count; i++) {
                                                            const r = Math.floor(Math.random() * sides) + 1;
                                                            rolls.push(r);
                                                            total += r;
                                                        }
                                                        const actionType = l.includes('cura') || l.includes('heal') ? 'curou' : 'usou';
                                                        addLog(char.name, `${actionType} **${name}** causando **${total}**! (${rolls.join('+')})`, 'info');
                                                    }
                                                }}
                                                className={`px-4 py-2 ${l.includes('cura') || l.includes('heal') ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-red-600 hover:bg-red-700'} text-white rounded text-[10px] font-black uppercase tracking-widest shadow-md transition-all active:scale-95`}
                                            >
                                                {l.includes('cura') || l.includes('heal') ? 'CURAR' : 'DANO'}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            )
                        }).filter(Boolean)}

                        {/* Empty State */}
                        {((char.spellList || []).filter(s => s.level === 0 || s.prepared || s.description.toLowerCase().match(/dano|ataque|damage|hit|cure|heal|cura|causar/)).length === 0 && 
                          getSpellLines().filter(l => {
                            const low = l.toLowerCase();
                            return low.includes('dano') || low.includes('ataque') || low.includes('damage') || low.includes('hit') || low.includes('cura') || low.includes('heal') || l.match(/\d+d\d+/);
                          }).length === 0) && (
                            <div className="text-center py-14 bg-stone-50/50 border border-dashed border-stone-200 rounded-lg">
                                <Sparkles size={32} className="mx-auto text-stone-300 mb-3 opacity-50" />
                                <div className="text-stone-400 text-[11px] font-black uppercase tracking-[3px] italic">Silêncio no Grimório de Combate</div>
                                <p className="text-stone-300 text-[9px] font-bold mt-2">Adicione magias de ataque ou habilidades ofensivas no seu Grimório.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="space-y-6">
                <div className="bg-white/40 border-2 border-stone-800 rounded p-6 shadow-md relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-5 rotate-12">
                        <Shield size={120} className="text-stone-900" />
                    </div>
                    <h3 className="font-cinzel text-sm font-black text-stone-900 mb-6 uppercase tracking-[4px] border-b border-stone-300 pb-2 relative z-10">ESTATÍSTICAS VITAIS</h3>
                    <div className="grid grid-cols-2 gap-4 relative z-10">
                        <div className="bg-white/60 p-4 rounded border border-stone-300 shadow-inner flex flex-col items-center">
                            <label className="text-[9px] font-black text-stone-400 uppercase tracking-widest mb-1">Iniciativa</label>
                            <div className="text-4xl font-cinzel font-black text-stone-900 mb-2">{fmt(initiative)}</div>
                            <button onClick={() => onRoll(20, initiative, 'Iniciativa')} className="w-full py-1.5 bg-stone-800 text-white rounded text-[8px] font-black uppercase tracking-widest hover:bg-stone-900 transition-colors">ROLAR</button>
                        </div>
                        <div className="bg-white/60 p-4 rounded border border-stone-300 shadow-inner flex flex-col items-center">
                            <label className="text-[9px] font-black text-stone-400 uppercase tracking-widest mb-1">Classe de Armadura</label>
                            <div className="text-4xl font-cinzel font-black text-stone-900 mb-2">{getAcBreakdown().total}</div>
                            <div className="text-[8px] text-stone-500 font-bold uppercase">{getAcBreakdown().base} + {getAcBreakdown().dex} + {getAcBreakdown().shield}</div>
                        </div>
                    </div>
                    <div className="mt-4 bg-white/60 p-4 rounded border border-stone-300 shadow-inner">
                        <div className="flex justify-between items-center mb-2">
                            <label className="text-[9px] font-black text-stone-400 uppercase tracking-widest">Pontos de Vida</label>
                            <span className="text-xs font-black text-stone-900">{char.hp.current} / {char.hp.max}</span>
                        </div>
                        <div className="h-4 bg-stone-200 rounded-full overflow-hidden border border-stone-300">
                            <motion.div 
                                className="h-full bg-gradient-to-r from-red-700 to-red-500"
                                initial={{ width: 0 }}
                                animate={{ width: `${(char.hp.current / char.hp.max) * 100}%` }}
                            />
                        </div>
                    </div>
                </div>

                <div className="bg-white/40 border border-stone-800 rounded p-6 shadow-sm">
                    <h3 className="font-cinzel text-sm font-black text-stone-900 mb-6 uppercase tracking-[4px] border-b border-stone-300 pb-2">AÇÕES DE COMBATE</h3>
                    <div className="grid grid-cols-2 gap-3">
                        {['Ataque', 'Conjurar', 'Disparada', 'Desengajar', 'Esconder', 'Ajudar', 'Usar Objeto', 'Esquivar'].map(action => (
                            <div key={action} className="bg-white/60 border border-stone-200 p-2.5 rounded flex items-center gap-2 hover:border-stone-800 transition-all cursor-help group shadow-sm">
                                <div className="w-2 h-2 rounded-full bg-stone-400 group-hover:bg-red-700 transition-colors"></div>
                                <span className="text-[10px] font-black text-stone-600 uppercase tracking-wider">{action}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-white/40 border border-stone-800 rounded p-6 shadow-sm">
                    <h3 className="font-cinzel text-sm font-black text-stone-900 mb-4 uppercase tracking-[4px]">CONDIÇÕES ATIVAS</h3>
                    <div className="flex flex-wrap gap-2">
                        {(char.conditions || []).length > 0 ? (char.conditions || []).map(c => (
                            <span key={c} className="px-3 py-1 bg-red-100 text-red-800 border border-red-200 rounded-full text-[9px] font-black uppercase tracking-widest flex items-center gap-2">
                                {c} <button onClick={() => setChar({...char, conditions: (char.conditions || []).filter(con => con !== c)})} className="hover:text-red-900"><X size={10}/></button>
                            </span>
                        )) : <div className="text-stone-400 italic text-[10px] font-bold uppercase tracking-widest">Nenhuma condição adversa</div>}
                    </div>
                </div>
            </div>
        </div>
      )}

      {activeTab === 'spells' && (
        <div className="grid grid-cols-1 lg:grid-cols-[1fr,2fr] gap-8">
           <div className="space-y-6">
             <div className="bg-white/40 p-8 rounded border border-stone-800 shadow-sm text-center relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-stone-800/20 to-transparent"></div>
                <label className="block text-stone-400 text-[10px] uppercase font-black tracking-[3px] mb-6">Mecanismo de Conjuração</label>
                <div className="flex gap-4 mb-8">
                    <select className="flex-1 bg-white/60 border border-stone-300 p-3 rounded font-black text-xs uppercase tracking-widest outline-none focus:border-stone-800 transition-all text-stone-900 shadow-inner" value={char.spells.castingStat} onChange={e => setChar({...char, spells: {...char.spells, castingStat: e.target.value}})}>
                      <option value="int">Inteligência (INT)</option>
                      <option value="wis">Sabedoria (SAB)</option>
                      <option value="cha">Carisma (CAR)</option>
                    </select>
                </div>
                <div className="grid grid-cols-2 gap-6">
                   <div className="bg-white/60 p-5 rounded border border-stone-300 shadow-inner relative group">
                     <div className="text-[10px] text-stone-400 font-black uppercase mb-2 tracking-wider">CD de Magia</div>
                     <div className="text-5xl font-cinzel font-black text-stone-900 drop-shadow-sm">{8 + profBonus + getMod(char.attributes[char.spells.castingStat as keyof typeof char.attributes] || 10)}</div>
                     <div className="absolute -bottom-1 -right-1 opacity-5 group-hover:opacity-10 transition-opacity">
                        <Zap size={40} className="text-stone-900" />
                     </div>
                   </div>
                   <div className="bg-white/60 p-5 rounded border border-stone-300 shadow-inner relative group">
                     <div className="text-[10px] text-stone-400 font-black uppercase mb-2 tracking-wider">Ataque Mágico</div>
                     <div className="text-5xl font-cinzel font-black text-stone-900 drop-shadow-sm">{fmt(profBonus + getMod(char.attributes[char.spells.castingStat as keyof typeof char.attributes] || 10))}</div>
                     <div className="absolute -bottom-1 -right-1 opacity-5 group-hover:opacity-10 transition-opacity">
                        <Flame size={40} className="text-stone-900" />
                     </div>
                   </div>
                </div>
             </div>

             <div className="bg-white/40 p-6 rounded border border-stone-800 shadow-sm">
                <h4 className="font-black text-[10px] uppercase text-stone-400 mb-6 border-b border-stone-300 pb-3 tracking-[3px] flex items-center gap-3"><Sparkles size={16} className="text-stone-600"/> Reserva de Slots Arcanos</h4>
                <div className="space-y-3">
                    {[1,2,3,4,5,6,7,8,9].map(lvl => { 
                        const slots = (char.spells.slots && char.spells.slots[lvl]) || []; 
                        return (
                            <div key={lvl} className="flex items-center gap-4 bg-white/60 p-3 rounded border border-stone-300 shadow-inner group transition-all hover:border-stone-400">
                                <div className="w-24 font-black text-[10px] text-stone-400 uppercase tracking-tighter">Círculo {lvl}</div>
                                <div className="flex-1 flex gap-2 flex-wrap">
                                    {slots.map((ready, i) => (
                                        <button key={i} onClick={() => toggleSlot(lvl, i)} className={`w-8 h-8 rounded border flex items-center justify-center transition-all ${ready ? 'bg-stone-800 border-stone-900 text-white shadow-md scale-110' : 'bg-white/40 border-stone-300 text-stone-300 hover:border-stone-500 hover:text-stone-500'}`}>
                                            {ready ? <Zap size={16} className="fill-current"/> : <div className="w-1.5 h-1.5 bg-stone-300 rounded-full"/>}
                                        </button>
                                    ))}
                                    <div className="flex gap-1 ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => addSlot(lvl)} className="w-8 h-8 rounded border border-stone-300 text-stone-400 hover:text-stone-800 hover:border-stone-800 transition-all flex items-center justify-center bg-white/40"><Plus size={16}/></button>
                                        <button onClick={() => removeSlot(lvl)} className="w-8 h-8 rounded border border-stone-300 text-stone-400 hover:text-red-800 hover:border-red-800 transition-all flex items-center justify-center bg-white/40"><Trash2 size={14}/></button>
                                    </div>
                                </div>
                            </div>
                        ); 
                    })}
                </div>
             </div>
             
             {/* Custom Spell Creator (Detailed) */}
             <div className="bg-white/40 border-2 border-stone-800 rounded p-6 shadow-md space-y-4">
                <h4 className="font-black text-stone-900 text-sm mb-4 flex items-center gap-3 uppercase tracking-[3px] border-b border-stone-300 pb-2"><BookOpen size={18} className="text-stone-600"/> Adicionar Nova Magia ou Habilidade</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="space-y-1">
                        <label className="text-[9px] font-black uppercase text-stone-400 tracking-wider">Nome da Magia</label>
                        <input className="w-full bg-white/60 border border-stone-300 p-2.5 rounded text-sm focus:border-stone-800 outline-none text-stone-900 shadow-inner" placeholder="Puxão de Gravidade" value={newDetailedSpell.name} onChange={e => setNewDetailedSpell({...newDetailedSpell, name: e.target.value})} />
                    </div>
                    <div className="space-y-1">
                        <label className="text-[9px] font-black uppercase text-stone-400 tracking-wider">Círculo / Nível</label>
                        <select className="w-full bg-white/60 border border-stone-300 p-2.5 rounded text-[10px] font-black uppercase tracking-wider focus:border-stone-800 outline-none text-stone-900 shadow-inner" value={newDetailedSpell.level} onChange={e => setNewDetailedSpell({...newDetailedSpell, level: parseInt(e.target.value)})}>
                            {[0,1,2,3,4,5,6,7,8,9].map(l => <option key={l} value={l}>{l === 0 ? 'Truque' : `${l}º Círculo`}</option>)}
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    <div className="space-y-1">
                        <label className="text-[9px] font-black uppercase text-stone-400 tracking-wider">Tempo de Conjuração</label>
                        <input className="w-full bg-white/60 border border-stone-300 p-2 rounded text-[10px] font-bold outline-none text-stone-900 shadow-inner" placeholder="1 Ação" value={newDetailedSpell.castingTime} onChange={e => setNewDetailedSpell({...newDetailedSpell, castingTime: e.target.value})} />
                    </div>
                    <div className="space-y-1">
                        <label className="text-[9px] font-black uppercase text-stone-400 tracking-wider">Alcance</label>
                        <input className="w-full bg-white/60 border border-stone-300 p-2 rounded text-[10px] font-bold outline-none text-stone-900 shadow-inner" placeholder="18m" value={newDetailedSpell.range} onChange={e => setNewDetailedSpell({...newDetailedSpell, range: e.target.value})} />
                    </div>
                    <div className="space-y-1">
                        <label className="text-[9px] font-black uppercase text-stone-400 tracking-wider">Componentes</label>
                        <input className="w-full bg-white/60 border border-stone-300 p-2 rounded text-[10px] font-bold outline-none text-stone-900 shadow-inner" placeholder="V, S, M" value={newDetailedSpell.components} onChange={e => setNewDetailedSpell({...newDetailedSpell, components: e.target.value})} />
                    </div>
                    <div className="space-y-1">
                        <label className="text-[9px] font-black uppercase text-stone-400 tracking-wider">Duração</label>
                        <input className="w-full bg-white/60 border border-stone-300 p-2 rounded text-[10px] font-bold outline-none text-stone-900 shadow-inner" placeholder="Concentração, up to 1 min" value={newDetailedSpell.duration} onChange={e => setNewDetailedSpell({...newDetailedSpell, duration: e.target.value})} />
                    </div>
                </div>

                <div className="flex items-center gap-4 bg-white/40 p-3 rounded border border-stone-300">
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input 
                            type="checkbox" 
                            className="w-4 h-4 accent-stone-800"
                            checked={newDetailedSpell.concentration}
                            onChange={(e) => setNewDetailedSpell({...newDetailedSpell, concentration: e.target.checked})}
                        />
                        <span className="text-[10px] font-black uppercase text-stone-600 tracking-widest">Requer Concentração</span>
                    </label>
                </div>

                <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase text-stone-400 tracking-wider">Descrição dos Efeitos</label>
                    <textarea className="w-full bg-white/60 border border-stone-300 p-4 rounded text-sm h-32 resize-none outline-none focus:border-stone-800 text-stone-900 shadow-inner font-spectral italic leading-relaxed placeholder:text-stone-300" placeholder="A criatura deve ser bem-sucedida em um teste de resistência de..." value={newDetailedSpell.description} onChange={e => setNewDetailedSpell({...newDetailedSpell, description: e.target.value})} />
                </div>

                <button onClick={addDetailedSpell} className="w-full bg-stone-800 hover:bg-stone-900 text-white p-4 rounded font-black text-xs shadow-xl uppercase tracking-[3px] transition-all active:scale-95 flex items-center justify-center gap-3">
                    <Plus size={18}/> Salvar no Grimório
                </button>
             </div>
           </div>

           <div className="flex flex-col h-full bg-white/30 backdrop-blur-md p-8 rounded-xl border border-stone-800/20 shadow-2xl overflow-hidden relative">
                 {/* Parchment Texture Overlay */}
                 <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/old-map.png')]"></div>
                 
                 <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8 border-b-4 border-double border-stone-800/40 pb-6 relative z-10">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-stone-900 text-amber-500 rounded-lg shadow-xl shadow-stone-900/20">
                            <Scroll size={32}/>
                        </div>
                        <div>
                            <h3 className="font-cinzel text-3xl font-black text-stone-900 tracking-widest uppercase">Grimório Arcano</h3>
                            <div className="text-[10px] font-black text-stone-500 uppercase tracking-[4px] mt-1">Magias, Rituais e Habilidades de Classe</div>
                        </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                        <div className="flex items-center gap-2 px-4 py-2 bg-stone-800 text-white rounded-full shadow-lg border border-stone-700">
                           <Sparkles size={14} className="text-amber-400"/>
                           <span className="text-[11px] font-black uppercase tracking-[2px]">{ (char.spellList?.length || 0) + getSpellLines().length } Registros Totais</span>
                        </div>
                        <div className="text-[9px] text-stone-400 font-bold uppercase tracking-widest italic pr-2">A sabedoria é a arma mais poderosa</div>
                    </div>
                 </div>

                 {/* Library Access and Filters */}
                 <div className="space-y-6 mb-8 relative z-10">
                    <div className="flex flex-col xl:flex-row gap-4">
                        <div className="flex-1 flex flex-col sm:flex-row gap-4">
                            <div className="flex-1 relative group">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 group-focus-within:text-stone-800 transition-colors" size={18}/>
                                <input 
                                    className="w-full bg-white/80 border-2 border-stone-200 focus:border-stone-800 rounded-xl py-3.5 pl-12 pr-6 text-sm text-stone-900 font-bold outline-none transition-all placeholder:text-stone-300 shadow-sm" 
                                    placeholder="Procurar no seu grimório pessoal..." 
                                    value={grimorioSearch} 
                                    onChange={(e) => setGrimorioSearch(e.target.value)}
                                />
                            </div>
                            <div className="flex gap-2">
                                <button 
                                    onClick={() => setGrimorioConcentrationFilter(!grimorioConcentrationFilter)}
                                    className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border-2 transition-all flex items-center gap-2 ${grimorioConcentrationFilter ? 'bg-amber-100 border-amber-500 text-amber-700' : 'bg-white border-stone-200 text-stone-400'}`}
                                >
                                    Conc.
                                </button>
                                <button 
                                    onClick={() => setGrimorioRitualFilter(!grimorioRitualFilter)}
                                    className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border-2 transition-all flex items-center gap-2 ${grimorioRitualFilter ? 'bg-indigo-100 border-indigo-500 text-indigo-700' : 'bg-white border-stone-200 text-stone-400'}`}
                                >
                                    Ritual
                                </button>
                            </div>
                        </div>
                        <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar scroll-smooth">
                            <button 
                                onClick={() => setGrimorioFilter('all')}
                                className={`px-5 py-3.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all whitespace-nowrap shadow-sm border-2 ${grimorioFilter === 'all' ? 'bg-stone-900 border-stone-800 text-white shadow-stone-900/20' : 'bg-white border-stone-200 text-stone-400 hover:border-stone-400 hover:text-stone-600'}`}
                            >
                                TODOS
                            </button>
                            {[0,1,2,3,4,5,6,7,8,9].map(lvl => (
                                <button 
                                    key={lvl}
                                    onClick={() => setGrimorioFilter(lvl)}
                                    className={`px-5 py-3.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all whitespace-nowrap shadow-sm border-2 ${grimorioFilter === lvl ? 'bg-indigo-950 border-indigo-800 text-white shadow-indigo-900/20' : 'bg-white border-stone-200 text-stone-400 hover:border-indigo-400 hover:text-indigo-600'}`}
                                >
                                    {lvl === 0 ? 'TRUQUE' : `CÍRCULO ${lvl}`}
                                </button>
                            ))}
                        </div>
                    </div>

                    <button 
                        onClick={() => setShowGrimorioBook(true)} 
                        className="w-full px-6 py-5 rounded-2xl font-black text-[11px] uppercase tracking-[5px] flex items-center justify-center gap-4 bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 border-2 border-stone-900 text-stone-950 shadow-[0_15px_40px_rgba(245,158,11,0.2)] hover:shadow-[0_20px_50px_rgba(245,158,11,0.4)] transition-all hover:-translate-y-1 active:scale-95 group mb-4 relative overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/handmade-paper.png')] opacity-10 pointer-events-none"></div>
                        <BookOpen size={24} className="group-hover:rotate-12 transition-transform duration-500"/>
                        ABRIR GRIMÓRIO ILUSTRADO (IMERSIVO)
                    </button>

                    <button 
                        onClick={() => setShowBibliotecarioBook(true)} 
                        className="w-full px-6 py-5 rounded-2xl font-black text-[11px] uppercase tracking-[5px] flex items-center justify-center gap-4 bg-stone-900 border-2 border-stone-800 text-amber-400 shadow-[0_15px_40px_rgba(0,0,0,0.3)] hover:shadow-[0_20px_50px_rgba(0,0,0,0.5)] transition-all hover:-translate-y-1 active:scale-95 group mb-8 relative overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20 pointer-events-none"></div>
                        <Library size={24} className="group-hover:-rotate-12 transition-transform duration-500"/>
                        CONSULTAR GRANDE BIBLIOTECA (IMERSIVO)
                    </button>
                    </div>
                    
                    <div className="space-y-12 overflow-y-auto pr-4 custom-scrollbar max-h-[1200px] pb-20 relative z-10">
                    {/* Filtered Simple Abilities Section */}
                    {grimorioFilter === 'all' && filteredGrimorioSimple.length > 0 && (
                        <div className="space-y-6">
                            <h4 className="flex items-center gap-6 text-stone-900">
                                <span className="bg-stone-900 text-amber-500 px-5 py-1.5 rounded-lg font-black text-[11px] uppercase tracking-[5px] shadow-lg">Habilidades & Talentos</span>
                                <div className="h-0.5 bg-gradient-to-r from-stone-800/20 via-stone-800/40 to-transparent flex-1"></div>
                            </h4>
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                {filteredGrimorioSimple.map((line, idx) => {
                                    const isAbility = line.includes('[Habilidade]');
                                    const isSpell = line.includes('[Magia]');
                                    const cleanLine = line.replace('[Habilidade]', '').replace('[Magia]', '').trim();
                                    const parts = cleanLine.split(':');
                                    const title = parts.length > 1 ? parts[0] : null;
                                    const content = parts.length > 1 ? parts.slice(1).join(':') : cleanLine;

                                    return (
                                        <motion.div 
                                            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                                            key={idx} 
                                            className="bg-white/90 border-2 border-stone-800 p-6 rounded-none shadow-md group hover:shadow-xl transition-all flex flex-col relative overflow-hidden"
                                        >
                                            <div className="absolute top-0 right-0 p-2">
                                                {isAbility && <div className="text-[8px] bg-stone-900 text-white px-3 py-1 rounded-full font-black uppercase tracking-widest">Habilidade</div>}
                                                {isSpell && <div className="text-[8px] bg-indigo-900 text-white px-3 py-1 rounded-full font-black uppercase tracking-widest">Magia</div>}
                                            </div>
                                            <div className="flex-1 pr-10">
                                                {title && <div className="font-cinzel font-black text-xs text-stone-900 uppercase mb-3 tracking-widest border-b border-stone-100 pb-2">{title}</div>}
                                                <div className="text-[14px] font-spectral italic text-stone-800 leading-relaxed indent-6">{content}</div>
                                            </div>
                                            <button 
                                                onClick={() => deleteSpellLine(idx)}
                                                className="absolute bottom-4 right-4 w-9 h-9 bg-white border border-stone-200 text-stone-300 hover:text-red-700 hover:border-red-700 rounded-full flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 shadow-sm active:scale-95"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Filtered Detailed Spells Mapping */}
                    {(grimorioFilter === 'all' || typeof grimorioFilter === 'number') && (
                        <div className="space-y-10">
                            {Object.keys(getDetailedSpellsByLevel())
                              .map(Number)
                              .sort((a,b) => a - b)
                              .filter(lvl => grimorioFilter === 'all' || lvl === grimorioFilter)
                              .map(lvl => {
                                const spells = getDetailedSpellsByLevel()[lvl];
                                
                                if (spells.length === 0) return null;

                                return (
                                    <div key={lvl} className="space-y-6">
                                        <h4 className="flex items-center gap-6 text-stone-900">
                                            <span className="bg-indigo-900 text-white px-5 py-1.5 rounded-lg font-black text-[11px] uppercase tracking-[5px] shadow-lg">
                                                {lvl === 0 ? 'Truques Arcanos' : `${lvl}º Círculo de Poder`}
                                            </span>
                                            <div className="h-0.5 bg-gradient-to-r from-indigo-800/20 via-indigo-800/40 to-transparent flex-1"></div>
                                        </h4>
                                        
                                        <div className="space-y-4">
                                            {spells.map(s => (
                                                <div 
                                                    key={s.id} 
                                                    className={`border-2 p-6 bg-white relative rounded-none ${s.prepared ? 'border-indigo-600' : 'border-stone-800'}`}
                                                >
                                                    <div className="flex flex-col md:flex-row justify-between items-start gap-6 border-b border-stone-200 pb-4 mb-4">
                                                        <div className="flex-1">
                                                            <div className="flex items-center gap-3 mb-1">
                                                                <span className="text-[10px] font-black uppercase tracking-widest text-stone-500">
                                                                    {s.level === 0 ? 'Truque' : `${s.level}º Círculo`}
                                                                    {s.concentration && ' • Requer Concentração'}
                                                                </span>
                                                            </div>
                                                            <h5 className="font-cinzel font-black text-2xl text-stone-900 uppercase">
                                                                {s.name}
                                                            </h5>
                                                        </div>
                                                        <div className="flex gap-2">
                                                            {s.level > 0 && (
                                                                <button 
                                                                    onClick={(e) => { spendSlot(s.level); }}
                                                                    className="px-4 py-2 bg-amber-500 border-2 border-stone-800 text-stone-900 font-black text-xs uppercase tracking-widest hover:bg-amber-400 transition-all flex items-center gap-2"
                                                                >
                                                                    <Zap size={14} fill="currentColor"/> Gastar
                                                                </button>
                                                            )}
                                                            <button 
                                                                onClick={() => togglePreparedDetailedSpell(s.id)} 
                                                                className={`px-4 py-2 border-2 font-black text-xs uppercase tracking-widest transition-all ${s.prepared ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white border-stone-800 text-stone-800 hover:bg-stone-100'}`}
                                                            >
                                                                {s.prepared ? 'Preparada' : 'Preparar'}
                                                            </button>
                                                            <button 
                                                                onClick={() => removeDetailedSpell(s.id)} 
                                                                className="px-4 py-2 border-2 border-red-700 text-red-700 font-black text-xs uppercase tracking-widest hover:bg-red-50"
                                                            >
                                                                Remover
                                                            </button>
                                                        </div>
                                                    </div>

                                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 bg-stone-50 p-4 border border-stone-200">
                                                        <div>
                                                            <div className="text-[9px] font-black text-stone-400 uppercase tracking-widest">Conjuração</div>
                                                            <div className="text-xs font-bold text-stone-800">{s.castingTime}</div>
                                                        </div>
                                                        <div>
                                                            <div className="text-[9px] font-black text-stone-400 uppercase tracking-widest">Alcance</div>
                                                            <div className="text-xs font-bold text-stone-800">{s.range}</div>
                                                        </div>
                                                        <div>
                                                            <div className="text-[9px] font-black text-stone-400 uppercase tracking-widest">Duração</div>
                                                            <div className="text-xs font-bold text-stone-800">{s.duration}</div>
                                                        </div>
                                                        <div>
                                                            <div className="text-[9px] font-black text-stone-400 uppercase tracking-widest">Atributo</div>
                                                            <div className="text-xs font-bold text-stone-800">{char.spells.castingStat.toUpperCase()}</div>
                                                        </div>
                                                    </div>

                                                    <div className="text-base text-stone-800 leading-relaxed bg-white p-4 border border-stone-100 italic font-spectral whitespace-pre-wrap">
                                                        {s.description}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                );
                              })}
                        </div>
                    )}
                 </div>
              </div>
           </div>
        )}

      {activeTab === 'inv' && (
        <div className="grid grid-cols-1 lg:grid-cols-[1.5fr,2fr] gap-8">
          <div className="space-y-6">
            {/* Habilidades & Poderes Combined inside Items tab */}
            <div className="bg-white/40 p-5 rounded border-2 border-stone-800 shadow-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 p-2 bg-stone-800 text-white text-[8px] font-black uppercase rotate-45 translate-x-3 translate-y-[-1px] w-24 text-center">PODERES</div>
                <h3 className="font-cinzel text-sm font-black text-stone-900 mb-4 uppercase tracking-[4px] flex items-center gap-3">
                   <Sparkles size={18} className="text-amber-600"/> Habilidades de Classe & Talentos
                </h3>
                <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                   {filteredGrimorioSimple.length === 0 && filteredGrimorioDetailed.length === 0 && (
                       <div className="text-center py-8 text-stone-400 text-xs italic bg-stone-50/50 rounded border border-dashed border-stone-300">Nenhuma habilidade especial registrada.</div>
                   )}
                   
                   {/* Detailed Abilities (Level 0 or features) */}
                   {filteredGrimorioDetailed.filter(s => s.level === 0).map(feat => (
                       <div key={feat.id} className="bg-white/60 border border-stone-300 rounded p-3 hover:border-stone-800 transition-all border-l-4 border-l-stone-800">
                           <div className="flex justify-between items-start">
                               <h4 className="font-black text-stone-900 text-xs uppercase tracking-wider">{feat.name}</h4>
                               <button onClick={() => removeDetailedSpell(feat.id)} className="text-stone-300 hover:text-red-700"><Trash2 size={12}/></button>
                           </div>
                           <p className="text-[10px] text-stone-500 mt-1 leading-relaxed line-clamp-3">{feat.description}</p>
                       </div>
                   ))}

                   {/* Simple Abilities mapped from text lines */}
                   {filteredGrimorioSimple.map((line, idx) => {
                       if (line.startsWith('[') && !line.includes('Truque') && !line.includes('Nível')) {
                           return (
                               <div key={idx} className="bg-stone-50/80 border border-stone-200 rounded p-2 text-[11px] font-semibold text-stone-700 flex items-center gap-2 border-l-4 border-l-stone-400">
                                   <div className="w-1.5 h-1.5 bg-stone-400 rounded-full"/>
                                   {line.replace(/^\[.*?\]/, '').trim()}
                               </div>
                           );
                       }
                       return null;
                   })}
                </div>
            </div>

            {!isNPC && (
                <div className="bg-white/40 p-5 rounded border border-stone-800 shadow-sm">
                    <h3 className="font-cinzel text-sm font-black text-stone-900 mb-4 uppercase tracking-[4px] text-center">TESOURO & MOEDAS</h3>
                    <div className="grid grid-cols-5 gap-3 text-center">
                    {['pc','pp','pe','po','pl'].map((label, i) => {
                        const keys = ['cp','sp','ep','gp','pp'];
                        return (
                        <div key={label} className="flex flex-col gap-1">
                            <label className="block text-stone-500 uppercase font-black text-[10px] tracking-widest">{label}</label>
                            <input type="number" className="w-full text-center bg-white/60 border border-stone-300 p-2 rounded font-black text-stone-900 focus:border-stone-800 outline-none transition-all" value={char.wallet[keys[i] as keyof typeof char.wallet]} onChange={(e) => setChar({...char, wallet: {...char.wallet, [keys[i]]: safeInt(e.target.value)}})} />
                        </div>
                        )
                    })}
                    </div>
                </div>
            )}
            
            {/* Magic Items & Attunement */}
            <div className="bg-white/40 p-5 rounded border border-stone-800 shadow-sm">
                <div className="flex items-center justify-between mb-4 border-b border-stone-300 pb-2">
                    <h3 className="font-cinzel text-sm font-black text-stone-900 uppercase tracking-[4px] flex items-center gap-2"><Sparkles size={14} className="text-amber-600"/> ITENS MÁGICOS & SINTONIA</h3>
                    <div className="text-[10px] font-black text-stone-500 bg-white/60 px-2 py-1 rounded border border-stone-300">
                        {char.inventoryList?.filter(i => i.att && i.isAtt).length || 0} / 3 SINTONIZADOS
                    </div>
                </div>

                <div className="flex gap-2 mb-4">
                    <select 
                        className="flex-1 bg-white/60 border border-stone-300 rounded p-2 text-xs font-bold text-stone-800 outline-none focus:border-stone-800"
                        onChange={(e) => { if(e.target.value) { addMagicItem(e.target.value); e.target.value=""; } }}
                        value=""
                    >
                        <option value="">+ Adicionar Item Mágico...</option>
                        {Object.keys(MAGIC_ITEMS_DB).map(k => (
                            <option key={k} value={k}>{k} ({MAGIC_ITEMS_DB[k].r})</option>
                        ))}
                    </select>
                </div>

                <div className="space-y-2">
                    {(char.inventoryList || []).length === 0 && <div className="text-center py-4 text-stone-400 text-xs italic">Nenhum item mágico no inventário.</div>}
                    {(char.inventoryList || []).map(item => (
                        <div key={item.id} className="bg-white/60 border border-stone-300 rounded p-3 hover:border-stone-800 transition-all group">
                            <div className="flex justify-between items-start mb-2">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h4 className="font-black text-stone-900 text-sm uppercase tracking-wider">{item.n}</h4>
                                        <span className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded border border-current ${
                                            item.r === 'Comum' ? 'text-stone-500' :
                                            item.r === 'Incomum' ? 'text-green-600' :
                                            item.r === 'Raro' ? 'text-blue-600' :
                                            item.r === 'Muito Raro' ? 'text-purple-600' :
                                            item.r === 'Lendário' ? 'text-amber-600' : 'text-red-600'
                                        }`}>
                                            {item.r}
                                        </span>
                                    </div>
                                    <p className="text-[10px] text-stone-500 mt-1 italic">{item.d}</p>
                                </div>
                                <button onClick={() => removeInventoryItem(item.id)} className="opacity-0 group-hover:opacity-100 p-1 text-stone-400 hover:text-red-700 transition-all"><Trash2 size={14}/></button>
                            </div>
                            <div className="flex gap-2 mt-3">
                                {item.att && (
                                    <button 
                                        onClick={() => toggleItemAttunement(item.id)}
                                        className={`flex-1 py-1.5 text-[9px] font-black uppercase tracking-widest border-2 transition-all rounded ${
                                            item.isAtt ? 'bg-amber-500 border-stone-800 text-stone-900 shadow-[2px_2px_0_0_rgba(0,0,0,1)]' : 'bg-white border-stone-300 text-stone-400 hover:border-stone-800 hover:text-stone-800'
                                        }`}
                                    >
                                        {item.isAtt ? 'Sintonizado' : 'Sintonizar'}
                                    </button>
                                )}
                                <button 
                                    onClick={() => toggleItemEquipped(item.id)}
                                    className={`flex-1 py-1.5 text-[9px] font-black uppercase tracking-widest border-2 transition-all rounded ${
                                        item.eq ? 'bg-indigo-600 border-stone-800 text-white shadow-[2px_2px_0_0_rgba(0,0,0,1)]' : 'bg-white border-stone-300 text-stone-400 hover:border-stone-800 hover:text-stone-800'
                                    }`}
                                >
                                    {item.eq ? 'Equipado' : 'Equipar'}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="bg-white/40 p-5 rounded border border-stone-800 shadow-sm">
                <div className="flex items-center justify-between mb-4 border-b border-stone-300 pb-2">
                    <h3 className="font-cinzel text-sm font-black text-stone-900 uppercase tracking-[4px] flex items-center gap-2"><Shield size={14}/> DEFESA & ARMADURAS</h3>
                    <button onClick={() => setShowArmors(!showArmors)} className="text-[9px] font-black text-stone-500 hover:text-stone-900 uppercase tracking-widest px-3 py-1 bg-white/60 rounded border border-stone-300">{showArmors ? 'FECHAR' : 'ABRIR'}</button>
                </div>
                
                {showArmors && (
                    <div className="h-64 overflow-y-auto bg-white/60 rounded border border-stone-300 p-3 custom-scrollbar mb-4 shadow-inner">
                        {Object.values(ARMOR_DB).map((armor: any) => {
                            const isEquipped = char.equippedArmor === armor.n || char.equippedShield === armor.n;
                            return (
                                <div key={armor.n} className="flex justify-between items-center p-2.5 hover:bg-white/80 rounded group mb-1 border border-transparent hover:border-stone-300 transition-all">
                                    <div className="text-xs">
                                        <div className="font-black text-stone-800 uppercase">{armor.n}</div>
                                        <div className="text-[9px] text-stone-500 font-bold uppercase tracking-tighter">
                                            {armor.type === 'shield' ? `+${armor.ac} CA` : `Base ${armor.ac} CA`} • {armor.type}
                                            {armor.stealthDis && <span className="ml-2 text-red-700">❌ FURTIVIDADE</span>}
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => armor.type === 'shield' ? toggleShield() : toggleArmor(armor.n)}
                                        className={`px-4 py-1.5 rounded text-[9px] font-black uppercase transition-all shadow-sm active:scale-95 ${isEquipped ? 'bg-red-700 hover:bg-red-800 text-white' : 'bg-stone-800 hover:bg-stone-900 text-white'}`}
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
                        <div className="flex justify-between items-center bg-stone-100/50 p-3 rounded border border-stone-300">
                            <div>
                                <div className="text-[9px] text-stone-500 font-black uppercase tracking-widest mb-0.5">Armadura Ativa</div>
                                <div className="font-black text-stone-800">{char.equippedArmor}</div>
                            </div>
                            <button onClick={() => toggleArmor(char.equippedArmor!)} className="w-8 h-8 bg-white border border-stone-300 text-red-700 rounded hover:bg-red-700 hover:text-white flex items-center justify-center transition-all"><Trash2 size={16}/></button>
                        </div>
                    )}
                    {char.equippedShield && (
                        <div className="flex justify-between items-center bg-stone-100/50 p-3 rounded border border-stone-300">
                            <div>
                                <div className="text-[9px] text-stone-500 font-black uppercase tracking-widest mb-0.5">Escudo Ativo</div>
                                <div className="font-black text-stone-800">+2 Classe de Armadura</div>
                            </div>
                            <button onClick={() => toggleShield()} className="w-8 h-8 bg-white border border-stone-300 text-red-700 rounded hover:bg-red-700 hover:text-white flex items-center justify-center transition-all"><Trash2 size={16}/></button>
                        </div>
                    )}
                    {!char.equippedArmor && !char.equippedShield && <div className="text-center py-4 border border-dashed border-stone-300 rounded text-stone-400 text-[10px] font-black uppercase tracking-widest italic">Nenhuma defesa equipada</div>}
                </div>
            </div>
            
            {showShop ? (
                <div className="bg-white border-2 border-stone-800 p-6 shadow-md space-y-6 animate-in fade-in rounded-none">
                    <div className="flex items-center justify-between border-b-2 border-stone-800 pb-4">
                        <div className="flex items-center gap-3">
                            <Store className="text-stone-800" size={20}/>
                            <h4 className="font-cinzel text-lg font-black text-stone-900 uppercase tracking-widest">Loja Real</h4>
                        </div>
                                <div className="flex gap-1">
                                    <div className="flex-1 relative">
                                        <Search className="absolute left-3 top-2.5 text-stone-400" size={16}/>
                                        <input 
                                            className="w-full bg-white/60 border border-stone-300 rounded py-2.5 pl-10 text-[10px] uppercase font-black tracking-widest outline-none focus:border-stone-800 transition-all text-stone-900" 
                                            placeholder="Buscar na loja..." 
                                            value={shopSearch} 
                                            onChange={e => setShopSearch(e.target.value)}
                                        />
                                    </div>
                                    <div className="flex items-center gap-2 bg-amber-50 px-3 py-1 border border-amber-200 rounded-none">
                                        <CircleDollarSign size={14} className="text-amber-600"/>
                                        <span className="text-sm font-black text-stone-900">{char.wallet.gp} PO</span>
                                    </div>
                                    <button onClick={() => setShowShop(false)} className="text-[10px] font-black uppercase text-stone-500 hover:text-stone-900 tracking-widest bg-stone-100 hover:bg-stone-200 px-4 py-2 border border-stone-300">Voltar</button>
                                </div>
                    </div>
                    
                    <div className="h-[600px] overflow-y-auto custom-scrollbar pr-2 space-y-8">
                        {SHOP_ITEMS.map((cat, idx) => {
                            const filteredItems = cat.items.filter(it => 
                                it.n.toLowerCase().includes(shopSearch.toLowerCase()) || 
                                it.d.toLowerCase().includes(shopSearch.toLowerCase())
                            );
                            if (shopSearch && filteredItems.length === 0) return null;

                            return (
                                <div key={idx} className="space-y-4">
                                    <div className="text-[11px] font-black text-stone-400 uppercase tracking-[4px] border-l-4 border-stone-800 pl-4 py-1">{cat.cat}</div>
                                    <div className="grid grid-cols-1 gap-2">
                                        {(shopSearch ? filteredItems : cat.items).map((item, i) => (
                                            <div key={i} className="flex flex-col md:flex-row justify-between items-start md:items-center bg-stone-50 p-4 border border-stone-200 hover:border-stone-800 transition-all group gap-4 rounded-none">
                                            <div className="flex-1">
                                                <div className="font-black text-stone-900 uppercase text-xs tracking-tight">{item.n}</div>
                                                <div className="text-[10px] text-stone-500 font-medium leading-tight mt-1">{item.d}</div>
                                                <div className="text-[9px] text-stone-400 font-bold uppercase mt-1 tracking-tighter">Peso: {item.w}</div>
                                            </div>
                                            <div className="flex items-center gap-3 w-full md:w-auto">
                                                <div className="text-xs font-black text-stone-900 border-b-2 border-amber-400 px-1">{item.c} PO</div>
                                                <button 
                                                    onClick={() => buyItem(item)} 
                                                    disabled={char.wallet.gp < item.c}
                                                    className={`flex-1 md:flex-none px-6 py-2.5 border-2 font-black text-[10px] uppercase tracking-widest transition-all ${char.wallet.gp >= item.c ? 'bg-stone-800 border-stone-800 text-white hover:bg-stone-900' : 'bg-white border-stone-200 text-stone-300 cursor-not-allowed'}`}
                                                >
                                                    Comprar
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            ) : (
                <div className="bg-white/40 border border-stone-800 rounded p-5 shadow-sm space-y-4 animate-in fade-in">
                    <div className="flex items-center justify-between mb-2">
                        <h4 className="font-cinzel text-sm font-black text-stone-900 flex items-center gap-2 uppercase tracking-widest"><Hammer size={16}/> Bancada do Artífice</h4>
                        <button onClick={() => setShowShop(true)} className="text-[10px] bg-stone-100 hover:bg-stone-200 text-stone-600 px-3 py-1 rounded border border-stone-300 flex items-center gap-1"><ShoppingBag size={12}/> Ir à Loja</button>
                    </div>
                    
                    <div className="flex gap-2">
                        <input className="flex-[2] bg-white/60 border border-stone-300 p-2.5 rounded text-sm focus:border-stone-800 outline-none text-stone-900" placeholder="Nome do Item" value={customItem.name} onChange={e => setCustomItem({...customItem, name: e.target.value})} />
                        <select className="flex-1 bg-white/60 border border-stone-300 p-2.5 rounded text-xs focus:border-stone-800 outline-none text-stone-600 font-bold" value={customItem.rarity} onChange={e => setCustomItem({...customItem, rarity: e.target.value})}>
                            {RARITIES.map(r => <option key={r} value={r}>{r}</option>)}
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                        <select className="bg-white/60 border border-stone-300 p-2 rounded text-xs focus:border-stone-800 outline-none text-stone-900" value={customItem.type} onChange={e => setCustomItem({...customItem, type: e.target.value})}>
                            <option value="Arma">Arma</option>
                            <option value="Armadura">Armadura/Escudo</option>
                            <option value="Poção">Poção</option>
                            <option value="Item">Item Maravilhoso</option>
                            <option value="Engenhoca">Engenhoca</option>
                        </select>
                        
                        {customItem.type === 'Arma' ? (
                            <div className="flex gap-1">
                                <input className="w-16 bg-white/60 border border-stone-300 rounded p-2 text-xs text-stone-900 text-center" placeholder="1d8" value={customItem.damage} onChange={e => setCustomItem({...customItem, damage: e.target.value})} />
                                <select className="flex-1 bg-white/60 border border-stone-300 rounded text-[9px] text-stone-600 outline-none" value={customItem.damageType} onChange={e => setCustomItem({...customItem, damageType: e.target.value})}>
                                    {DAMAGE_TYPES.map(d => <option key={d} value={d}>{d}</option>)}
                                </select>
                            </div>
                        ) : (customItem.type === 'Armadura' || customItem.type === 'Escudo') ? (
                            <input type="number" className="bg-white/60 border border-stone-300 rounded p-2 text-xs text-stone-900 text-center" placeholder="CA Base (+)" value={customItem.ac || ''} onChange={e => setCustomItem({...customItem, ac: parseInt(e.target.value)})} />
                        ) : (
                            <div className="bg-white/60 border border-stone-300 rounded p-2 text-[10px] text-stone-500 flex items-center justify-center italic">Sem stats de combate</div>
                        )}
                    </div>

                    <div className="flex gap-2 items-center bg-white/60 p-2 rounded border border-stone-300">
                        <label className="flex items-center gap-1 cursor-pointer text-[10px] font-bold text-stone-600">
                            <input type="checkbox" checked={customItem.attunement} onChange={e => setCustomItem({...customItem, attunement: e.target.checked})} className="accent-stone-800"/> <LinkIcon size={12}/> Sintonização
                        </label>
                        <div className="h-4 w-px bg-stone-300 mx-1"></div>
                        <div className="flex-1 flex gap-1">
                            <input className="w-full bg-transparent border-b border-stone-300 text-[10px] text-stone-900 focus:border-stone-800 outline-none" placeholder="Peso (kg)" value={customItem.weight} onChange={e => setCustomItem({...customItem, weight: e.target.value})} />
                            <input className="w-full bg-transparent border-b border-stone-300 text-[10px] text-stone-900 focus:border-stone-800 outline-none" placeholder="Custo (PO)" value={customItem.cost} onChange={e => setCustomItem({...customItem, cost: e.target.value})} />
                        </div>
                    </div>

                    {/* ITEM DICE PICKER */}
                    {(customItem.type === 'Arma' || customItem.type === 'Poção') && (
                        <div className="flex gap-1 overflow-x-auto pb-1 no-scrollbar">
                            {DICE_TYPES.map(d => (
                                <button key={d} onClick={() => setCustomItem(prev => ({...prev, damage: appendDiceToString(prev.damage, d)}))} className="px-2 py-1 bg-stone-100 hover:bg-stone-800 text-stone-600 hover:text-white rounded text-[10px] font-bold border border-stone-300 transition-colors">d{d}</button>
                            ))}
                            <button onClick={() => setCustomItem(prev => ({...prev, damage: ''}))} className="px-2 py-1 bg-stone-100 hover:bg-red-700 text-stone-400 hover:text-white rounded text-[10px] font-bold transition-colors ml-auto"><Eraser size={12}/></button>
                        </div>
                    )}

                    <input className="w-full bg-white/60 border border-stone-300 p-2.5 rounded text-xs focus:border-stone-800 outline-none text-stone-900" placeholder="Propriedades (ex: Leve, Versátil, Mágica)" value={customItem.props} onChange={e => setCustomItem({...customItem, props: e.target.value})} />
                    <button onClick={createCustomItem} className="w-full bg-stone-800 hover:bg-stone-900 text-white p-3 rounded font-black text-xs shadow-md uppercase tracking-widest transition-all active:scale-95">Forjar Item</button>
                </div>
            )}

            {/* Listas SRD (Existing) */}
            <button onClick={() => setShowWeapons(!showWeapons)} className="w-full flex items-center justify-between p-3 bg-stone-100 text-stone-800 font-black rounded border border-stone-300 hover:bg-stone-200 transition-all uppercase text-[10px] tracking-widest">
                <span className="flex items-center gap-2"><Sword size={16}/> ARSENAL DE ARMAS (SRD)</span>
                {showWeapons ? <ChevronDown size={18}/> : <ChevronRight size={18}/>}
            </button>
            {showWeapons && (
                <div className="h-64 overflow-y-auto bg-white/60 border border-stone-300 rounded p-4 custom-scrollbar shadow-inner">
                    {allWeapons.map((w, i) => (
                        <div key={i} className="flex justify-between items-center p-2.5 hover:bg-white/80 rounded group border border-transparent hover:border-stone-300 transition-all mb-1">
                            <div className="text-xs">
                                <div className="font-black text-stone-800 uppercase tracking-tight">{w.n}</div>
                                <div className="text-[9px] text-stone-500 font-bold uppercase">{w.dmg} • {w.prop}</div>
                            </div>
                            <button onClick={() => addWeaponToSheet(w)} className="w-8 h-8 bg-white border border-stone-300 rounded text-stone-400 hover:bg-stone-800 hover:text-white flex items-center justify-center transition-all shadow-sm"><Plus size={20}/></button>
                        </div>
                    ))}
                </div>
            )}
          </div>
          
          <div className="flex flex-col h-full">
             <div className="flex justify-between items-center mb-4 border-b-2 border-stone-800/30 pb-1">
                 <h3 className="font-cinzel text-xl font-bold text-stone-900 tracking-wider uppercase">MOCHILA & ALFORGE</h3>
                 <div className="flex gap-1 bg-white/40 p-1 rounded border border-stone-300">
                     <button onClick={() => setInvViewMode('list')} className={`p-1.5 rounded transition-colors ${invViewMode === 'list' ? 'bg-stone-800 text-white' : 'text-stone-400 hover:text-stone-600'}`} title="Modo Visual"><List size={16}/></button>
                     <button onClick={() => setInvViewMode('text')} className={`p-1.5 rounded transition-colors ${invViewMode === 'text' ? 'bg-stone-800 text-white' : 'text-stone-400 hover:text-stone-600'}`} title="Modo Texto"><FileText size={16}/></button>
                 </div>
             </div>
             
             {invViewMode === 'list' ? (
                 <div className="flex-1 flex flex-col min-h-[600px] bg-white/40 p-4 rounded border border-stone-800 shadow-inner">
                     <div className="flex gap-2 mb-4">
                         <input 
                            className="flex-1 bg-white/80 border border-stone-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-stone-800 transition-colors text-stone-900"
                            placeholder="Adicionar novo item..."
                            value={newItemInput}
                            onChange={e => setNewItemInput(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && addItem()}
                         />
                         <button onClick={addItem} className="bg-stone-800 text-white p-2 rounded hover:bg-stone-900 transition-colors"><Plus size={20}/></button>
                     </div>
                     <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2 pr-2">
                         {char.inventory.split('\n').filter(i => i.trim() !== '').map((itemLine, idx) => {
                             const isEquipped = itemLine.includes('[E]');
                             const cleanName = itemLine.replace(/^- /, '').replace('[E]', '').trim();
                             
                             // Rarity Color Logic (Simple heuristic based on text)
                             let rarityColor = 'text-stone-800';
                             if(itemLine.includes('[Incomum]')) rarityColor = 'text-green-700';
                             if(itemLine.includes('[Raro]')) rarityColor = 'text-blue-700';
                             if(itemLine.includes('[Muito Raro]')) rarityColor = 'text-purple-700';
                             if(itemLine.includes('[Lendário]')) rarityColor = 'text-orange-700';
                             if(itemLine.includes('[Artefato]')) rarityColor = 'text-rose-700';

                             return (
                                 <div 
                                    key={idx} 
                                    draggable
                                    onDragStart={(e) => handleDragStart(e, idx)}
                                    onDragOver={(e) => handleDragOver(e, idx)}
                                    onDrop={(e) => handleDrop(e, idx)}
                                    className={`flex items-center gap-3 p-3 rounded border transition-all cursor-move group ${
                                        isEquipped 
                                        ? 'bg-stone-800/10 border-stone-800/40' 
                                        : 'bg-white/60 border-stone-200 hover:border-stone-400'
                                    } ${draggedItemIndex === idx ? 'opacity-50 border-dashed border-stone-500' : ''}`}
                                 >
                                     <GripVertical size={16} className="text-stone-300 cursor-grab active:cursor-grabbing"/>
                                     <button onClick={() => toggleEquipItem(idx)} className={`transition-colors ${isEquipped ? 'text-stone-800' : 'text-stone-400 hover:text-stone-600'}`} title={isEquipped ? "Desequipar" : "Equipar"}>
                                         {isEquipped ? <Check size={18} strokeWidth={3}/> : <div className="w-4 h-4 rounded-full border-2 border-current"></div>}
                                     </button>
                                     <div className="flex-1 flex flex-col min-w-0">
                                         <span className={`text-sm font-black tracking-tight truncate ${isEquipped ? 'text-stone-900' : rarityColor}`}>
                                             {cleanName.split('|')[0].trim().replace(/\[.*?\]/g, '').trim()}
                                         </span>
                                         {cleanName.includes('|') && (
                                             <span className="text-[10px] text-stone-500 font-medium leading-tight line-clamp-2">
                                                 {cleanName.split('|').slice(1).join('|').trim()}
                                             </span>
                                         )}
                                     </div>
                                     {itemLine.includes('(S)') && <span title="Requer Sintonização"><LinkIcon size={12} className="text-purple-700"/></span>}
                                     <button onClick={() => deleteItem(idx)} className="opacity-0 group-hover:opacity-100 text-stone-400 hover:text-red-700 transition-all p-1">
                                         <Trash2 size={16}/>
                                     </button>
                                 </div>
                             )
                         })}
                         {char.inventory.trim() === '' && (
                             <div className="text-center text-stone-400 py-10 opacity-50 italic text-sm">Inventário vazio. Adicione itens acima.</div>
                         )}
                     </div>
                 </div>
             ) : (
                 <textarea className="w-full flex-1 min-h-[600px] bg-white/60 p-6 rounded border border-stone-800 shadow-inner font-mono text-sm leading-relaxed focus:ring-1 ring-stone-800/30 outline-none text-stone-800" placeholder="Suas posses e equipamentos..." value={char.inventory} onChange={e => setChar({...char, inventory: e.target.value})}></textarea>
             )}
          </div>
        </div>
      )}

      {activeTab === 'bio' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 h-full">
           <div className="space-y-6">
             {['traits', 'ideals', 'bonds', 'flaws'].map(field => (
               <div key={field} className="bg-white/40 p-4 rounded border border-stone-800 shadow-sm">
                 <label className="text-[10px] font-black uppercase text-stone-500 tracking-[3px] block mb-2">{BIO_MAP[field] || field}</label>
                 <textarea 
                    className="w-full h-24 bg-white/60 p-3 rounded border border-stone-300 resize-none text-sm text-stone-800 outline-none focus:border-stone-800 transition-all leading-relaxed shadow-inner"
                    value={char.bio[field as keyof typeof char.bio]}
                    onChange={(e) => setChar({...char, bio: {...char.bio, [field]: e.target.value}})}
                 />
               </div>
             ))}
           </div>
           <div className="space-y-6">
             <div className="bg-white/40 p-5 rounded border border-stone-800 shadow-sm flex flex-col">
                <div className="flex justify-between items-center mb-4">
                    <label className="text-[10px] font-black uppercase text-stone-500 tracking-[3px]">TALENTOS (FEATS)</label>
                    <button onClick={() => {setShowFeatsModal(true); setFeatSearch('');}} className="px-3 py-1 bg-stone-100 text-stone-600 rounded border border-stone-300 text-[10px] font-bold hover:bg-stone-800 hover:text-white flex items-center gap-1 transition-all">
                        <Plus size={12}/> Adicionar
                    </button>
                </div>
                <div className="space-y-2 mb-6">
                    {(char.feats || []).map((featName, i) => (
                        <details key={i} className="bg-white/60 rounded border border-stone-300 group">
                            <summary className="flex justify-between items-center p-3 cursor-pointer list-none">
                                <div className="font-bold text-sm text-stone-800 flex items-center gap-2">
                                    <Star size={14} className="text-stone-600"/> {featName}
                                </div>
                                <div className="flex items-center gap-2">
                                    <ChevronDown size={14} className="text-stone-400 group-open:rotate-180 transition-transform"/>
                                    <button onClick={(e) => { e.preventDefault(); removeFeat(featName); }} className="text-stone-400 hover:text-red-700 p-1"><X size={14}/></button>
                                </div>
                            </summary>
                            <div className="px-3 pb-3 text-xs text-stone-600 leading-relaxed border-t border-stone-200 pt-2">
                                {FEATS_DB[featName] || "Descrição não encontrada."}
                            </div>
                        </details>
                    ))}
                    {(!char.feats || char.feats.length === 0) && (
                        <div className="text-center text-xs text-stone-400 italic py-4 border border-dashed border-stone-300 rounded">
                            Nenhum talento adquirido.
                        </div>
                    )}
                </div>

                <label className="text-[10px] font-black uppercase text-stone-500 tracking-[3px] block mb-3">BIOGRAFIA & ORIGEM</label>
                <textarea 
                  className="w-full h-40 bg-white/60 p-4 rounded border border-stone-300 resize-none text-sm text-stone-800 outline-none focus:border-stone-800 transition-all leading-relaxed shadow-inner"
                  value={char.bio.backstory}
                  onChange={(e) => setChar({...char, bio: {...char.bio, backstory: e.target.value}})}
                />
             </div>
             <div className="bg-white/40 p-6 rounded border border-stone-800 shadow-sm flex-1 flex flex-col">
                <label className="text-[10px] font-black uppercase text-stone-500 tracking-[4px] block mb-4 flex items-center gap-2"><Calculator size={14}/> NOTAS DO MESTRE & OUTRAS HABILIDADES</label>
                <textarea 
                  className="w-full flex-1 min-h-[150px] bg-white/60 resize-none text-sm text-stone-800 outline-none focus:border-stone-800 transition-all leading-relaxed shadow-inner p-4 rounded border border-stone-300"
                  value={char.bio.features}
                  onChange={(e) => setChar({...char, bio: {...char.bio, features: e.target.value}})}
                />
             </div>
           </div>
        </div>
      )}
      <AnimatePresence>
        {creationStep !== null && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-md">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white/95 w-full max-w-4xl max-h-[90vh] rounded-3xl border-4 border-stone-800 shadow-2xl overflow-hidden flex flex-col font-sans"
            >
              <div className="bg-stone-800 p-6 text-white flex justify-between items-center">
                <h2 className="font-cinzel text-xl font-black tracking-[4px] flex items-center gap-3 decoration-amber-400 underline decoration-2 underline-offset-8 uppercase">
                  <Sparkles size={24} className="text-amber-400" />
                  Assistente de Criação
                </h2>
                <div className="flex gap-2">
                    {[0,1,2,3,4,5,6,7,8,9].map(s => (
                        <div key={s} className={`w-2.5 h-2.5 rounded-full border-2 transition-all ${creationStep === s ? 'bg-amber-400 border-amber-400 scale-150' : s < creationStep ? 'bg-white border-white' : 'border-stone-500'}`} />
                    ))}
                </div>
              </div>
              
              <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                {creationStep === 0 && (
                  <div className="text-center space-y-8 py-10 animate-in fade-in zoom-in duration-500">
                    <div className="w-28 h-28 bg-stone-100 rounded-full flex items-center justify-center mx-auto shadow-inner border-4 border-stone-800 relative group overflow-hidden">
                        <User size={56} className="text-stone-300 group-hover:text-stone-800 transition-colors"/>
                        <div className="absolute inset-0 bg-stone-800/5 group-hover:bg-transparent transition-all"></div>
                    </div>
                    <div className="space-y-4">
                        <h3 className="font-cinzel text-3xl font-black text-stone-900 uppercase tracking-widest">Qual o nome da lenda?</h3>
                        <p className="text-stone-400 font-spectral italic text-lg">Este nome ecoará por séculos nas tavernas de todo o mundo.</p>
                    </div>
                    <input 
                      autoFocus
                      className="w-full max-w-lg bg-white/50 border-b-4 border-stone-800 p-6 text-center text-5xl font-spectral italic text-stone-900 focus:outline-none placeholder:text-stone-200 shadow-sm rounded-t-xl"
                      placeholder="Ex: Alistair, Kael..."
                      value={char.name}
                      onChange={(e) => setChar({...char, name: e.target.value})}
                      onKeyDown={(e) => e.key === 'Enter' && char.name && setCreationStep(1)}
                    />
                    <div className="pt-6">
                        <button 
                            disabled={!char.name}
                            onClick={() => setCreationStep(1)}
                            className="bg-stone-800 text-amber-400 px-16 py-5 rounded-full font-black uppercase tracking-[5px] disabled:opacity-30 transition-all hover:scale-105 active:scale-95 shadow-2xl flex items-center gap-4 mx-auto"
                        >
                            Prosseguir <ChevronRight size={20}/>
                        </button>
                    </div>
                  </div>
                )}

                {creationStep === 1 && (
                  <div className="space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-500">
                    <div className="text-center bg-stone-50 p-6 rounded-2xl border border-stone-200">
                        <h3 className="font-cinzel text-3xl font-black text-stone-900 uppercase tracking-widest">Escolha sua Linhagem</h3>
                        <p className="text-stone-500 font-spectral italic text-lg mt-2">Os bônus de atributos, traços e bônus especiais (como a Couraça do Tortle) serão aplicados automaticamente.</p>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {RACES_LIST.map(r => {
                            const bonus = RACE_BONUSES[r];
                            return (
                                <button 
                                    key={r}
                                    onClick={() => applyRaceChanges(r)}
                                    className={`group p-4 bg-white border-2 rounded-2xl transition-all text-center space-y-3 hover:shadow-xl hover:-translate-y-1 active:translate-y-0 ${char.race === r ? 'border-stone-800 shadow-lg bg-stone-50' : 'border-stone-100'}`}
                                >
                                    <div className="w-10 h-10 bg-stone-50 rounded-full flex items-center justify-center mx-auto group-hover:bg-amber-50 transition-colors">
                                        <Wind size={20} className="text-stone-300 group-hover:text-amber-600"/>
                                    </div>
                                    <span className={`block font-black uppercase text-[10px] tracking-widest ${char.race === r ? 'text-amber-600' : 'text-stone-500 group-hover:text-stone-900'}`}>{r}</span>
                                    {bonus && (
                                        <div className="flex flex-wrap justify-center gap-1">
                                            {bonus.attrs && Object.entries(bonus.attrs).map(([a, v]) => (
                                                <span key={a} className="text-[7px] bg-stone-100 px-1 rounded font-bold">{a.toUpperCase()} +{v}</span>
                                            ))}
                                        </div>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                  </div>
                )}

                {creationStep === 2 && (
                  <div className="space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-500">
                    <div className="text-center bg-stone-50 p-6 rounded-2xl border border-stone-200">
                        <h3 className="font-cinzel text-3xl font-black text-stone-900 uppercase tracking-widest">Defina sua Vocação</h3>
                        <p className="text-stone-500 font-spectral italic text-lg mt-2">Habilidades de classe e vida inicial serão configuradas agora.</p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                        {Object.entries(CLASSES_DB).map(([name, data]) => (
                            <button 
                                key={name}
                                onClick={() => applyClassChanges(name)}
                                className={`group p-6 bg-white border-2 rounded-3xl transition-all text-left space-y-4 hover:shadow-2xl hover:-translate-y-1 ${char.class === name ? 'border-stone-800 shadow-xl' : 'border-stone-100'}`}
                            >
                                <div className="flex justify-between items-center">
                                    <span className="font-cinzel font-black text-stone-900 uppercase tracking-[2px]">{name}</span>
                                    <span className="text-[10px] bg-stone-900 text-white px-3 py-1 rounded-full font-bold">d{data.dv}</span>
                                </div>
                                <div className="h-px bg-stone-100"></div>
                                <div className="space-y-1">
                                    <p className="text-[9px] text-stone-400 font-black uppercase tracking-widest">Subclasses Notáveis:</p>
                                    <p className="text-[10px] text-stone-600 font-medium italic line-clamp-1">{data.sub.slice(0, 3).join(', ')}...</p>
                                </div>
                            </button>
                        ))}
                    </div>
                  </div>
                )}

                {creationStep === 3 && (
                  <div className="space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-500">
                    <div className="text-center bg-stone-50 p-6 rounded-2xl border border-stone-200">
                        <h3 className="font-cinzel text-3xl font-black text-stone-900 uppercase tracking-widest">Especialização (Subclasse)</h3>
                        <p className="text-stone-500 font-spectral italic text-lg mt-2">Escolha sua especialização ou arquétipo marcial.</p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {CLASSES_DB[char.class]?.sub.map(sub => (
                            <button 
                                key={sub}
                                onClick={() => applySubclassChanges(sub)}
                                className="group p-5 bg-white border-2 border-stone-100 rounded-2xl hover:border-stone-800 transition-all text-left flex items-center justify-between hover:shadow-lg"
                            >
                                <span className="font-black text-stone-800 uppercase text-xs tracking-widest group-hover:text-amber-600">{sub}</span>
                                <ChevronRight size={16} className="text-stone-300 group-hover:translate-x-1 transition-transform"/>
                            </button>
                        ))}
                    </div>
                    <div className="flex justify-center mt-10">
                        <button onClick={() => setCreationStep(4)} className="text-stone-400 hover:text-stone-800 font-black uppercase text-[10px] tracking-[4px] underline underline-offset-4">Pular escolha de subclasse por enquanto</button>
                    </div>
                  </div>
                )}

                {creationStep === 4 && (
                  <div className="space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-500">
                    <div className="text-center bg-stone-50 p-6 rounded-2xl border border-stone-200">
                        <h3 className="font-cinzel text-3xl font-black text-stone-900 uppercase tracking-widest">De onde você veio?</h3>
                        <p className="text-stone-500 font-spectral italic text-lg mt-2">Sua vida antes da aventura concede perícias e contatos valiosos.</p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {Object.entries(BACKGROUNDS_DB).map(([name, data]) => (
                            <button 
                                key={name}
                                onClick={() => applyBackgroundChanges(name)}
                                className="group p-6 bg-white border-2 border-stone-100 rounded-2xl hover:border-stone-800 transition-all text-left flex gap-5 items-center hover:shadow-xl hover:-translate-y-0.5"
                            >
                                <div className="p-4 bg-stone-50 rounded-xl group-hover:bg-amber-50 group-hover:text-amber-600 transition-colors shadow-inner">
                                    <Hammer size={24}/>
                                </div>
                                <div>
                                    <span className="block font-black text-stone-900 uppercase text-sm tracking-[2px]">{name}</span>
                                    <div className="flex gap-2 mt-1">
                                        {data.skills.map(s => <span key={s} className="text-[8px] bg-stone-100 px-1.5 py-0.5 rounded font-black uppercase text-stone-400">{s}</span>)}
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                  </div>
                )}

                {creationStep === 5 && (
                  <div className="space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-500 pb-20">
                    <div className="text-center bg-stone-50 p-6 rounded-2xl border border-stone-200">
                        <h3 className="font-cinzel text-3xl font-black text-stone-900 uppercase tracking-widest">Perícias e Talentos</h3>
                        <p className="text-stone-500 font-spectral italic text-lg mt-2">Sua classe e raça definem em quais perícias você é treinado.</p>
                    </div>

                    <div className="max-w-4xl mx-auto space-y-8">
                        {/* Class Skills */}
                        <div className="bg-white p-8 rounded-3xl border border-stone-100 shadow-xl space-y-6">
                            <div className="flex justify-between items-center border-b border-stone-50 pb-4">
                                <h4 className="font-cinzel font-black text-stone-900 uppercase tracking-widest text-lg">Perícias de {char.class}</h4>
                                <div className="bg-amber-400 text-stone-900 px-4 py-1 rounded-full font-black text-xs uppercase shadow-md">
                                    {(CLASSES_DB[char.class]?.skillsCount || 0) - (CLASSES_DB[char.class]?.availableSkills.filter(sId => char.skills[sId] && !(RACE_BONUSES[char.race]?.skills?.includes(SKILL_LIST.find(sk => sk.id === sId)?.n || "")) && !(BACKGROUNDS_DB[char.background]?.skills.includes(SKILL_LIST.find(sk => sk.id === sId)?.id || ""))).length || 0)} Restantes
                                </div>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                {CLASSES_DB[char.class]?.availableSkills.map(sId => {
                                    const skill = SKILL_LIST.find(sk => sk.id === sId);
                                    if (!skill) return null;
                                    const fromSource = (RACE_BONUSES[char.race]?.skills?.includes(skill.n)) || (BACKGROUNDS_DB[char.background]?.skills.includes(sId));
                                    
                                    return (
                                        <button 
                                            key={sId}
                                            disabled={!!fromSource}
                                            onClick={() => {
                                                const currentPicks = CLASSES_DB[char.class]?.availableSkills.filter(id => char.skills[id] && !(RACE_BONUSES[char.race]?.skills?.includes(SKILL_LIST.find(sk => sk.id === id)?.n || "")) && !(BACKGROUNDS_DB[char.background]?.skills.includes(id))).length || 0;
                                                if (char.skills[sId]) {
                                                    setChar(prev => ({...prev, skills: {...prev.skills, [sId]: false}}));
                                                } else if (currentPicks < (CLASSES_DB[char.class]?.skillsCount || 0)) {
                                                    setChar(prev => ({...prev, skills: {...prev.skills, [sId]: true}}));
                                                }
                                            }}
                                            className={`p-4 rounded-xl border-2 transition-all text-left flex items-center gap-3 ${
                                                char.skills[sId] ? 'border-amber-500 bg-amber-50 shadow-md scale-[1.02]' : fromSource ? 'border-stone-100 bg-stone-50/50 opacity-100' : 'border-stone-100 hover:border-stone-300'
                                            }`}
                                        >
                                            <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${char.skills[sId] ? 'bg-amber-500 border-amber-500' : 'border-stone-200'}`}>
                                                {char.skills[sId] && <Check size={12} className="text-white"/>}
                                            </div>
                                            <div>
                                                <span className={`block font-black text-[10px] uppercase tracking-widest ${char.skills[sId] ? 'text-amber-700' : 'text-stone-600'}`}>{skill.n}</span>
                                                {fromSource && <span className="text-[8px] font-bold text-stone-400 uppercase italic">Já possui</span>}
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Race Skills if any */}
                        {RACE_BONUSES[char.race]?.skillsCount && (
                            <div className="bg-white p-8 rounded-3xl border border-stone-100 shadow-xl space-y-6">
                                <div className="flex justify-between items-center border-b border-stone-50 pb-4">
                                    <h4 className="font-cinzel font-black text-stone-900 uppercase tracking-widest text-lg">Perícias de {char.race}</h4>
                                    <div className="bg-blue-400 text-white px-4 py-1 rounded-full font-black text-xs uppercase shadow-md">
                                        {(RACE_BONUSES[char.race]?.skillsCount || 0) - (RACE_BONUSES[char.race]?.availableSkills?.filter(sId => char.skills[sId] && !CLASSES_DB[char.class]?.availableSkills.includes(sId) && !(BACKGROUNDS_DB[char.background]?.skills.includes(sId))).length || 0)} Restantes
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                    {RACE_BONUSES[char.race]?.availableSkills?.map(sId => {
                                        const skill = SKILL_LIST.find(sk => sk.id === sId);
                                        if (!skill) return null;
                                        const fromOther = CLASSES_DB[char.class]?.availableSkills.includes(sId) || BACKGROUNDS_DB[char.background]?.skills.includes(sId);
                                        
                                        return (
                                            <button 
                                                key={sId}
                                                disabled={!!fromOther}
                                                onClick={() => {
                                                    const currentPicks = RACE_BONUSES[char.race]?.availableSkills?.filter(id => char.skills[id] && !CLASSES_DB[char.class]?.availableSkills.includes(id) && !(BACKGROUNDS_DB[char.background]?.skills.includes(id))).length || 0;
                                                    if (char.skills[sId]) {
                                                        setChar(prev => ({...prev, skills: {...prev.skills, [sId]: false}}));
                                                    } else if (currentPicks < (RACE_BONUSES[char.race]?.skillsCount || 0)) {
                                                        setChar(prev => ({...prev, skills: {...prev.skills, [sId]: true}}));
                                                    }
                                                }}
                                                className={`p-4 rounded-xl border-2 transition-all text-left flex items-center gap-3 ${
                                                    char.skills[sId] ? 'border-blue-500 bg-blue-50 shadow-md scale-[1.02]' : fromOther ? 'border-stone-100 bg-stone-50/50 opacity-100' : 'border-stone-100 hover:border-stone-300'
                                                }`}
                                            >
                                                <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${char.skills[sId] ? 'bg-blue-500 border-blue-500' : 'border-stone-200'}`}>
                                                    {char.skills[sId] && <Check size={12} className="text-white"/>}
                                                </div>
                                                <div>
                                                    <span className={`block font-black text-[10px] uppercase tracking-widest ${char.skills[sId] ? 'text-blue-700' : 'text-stone-600'}`}>{skill.n}</span>
                                                    {fromOther && <span className="text-[8px] font-bold text-stone-400 uppercase italic">Outra fonte</span>}
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="flex justify-center pt-10">
                        <button 
                            onClick={() => setCreationStep(6)}
                            className="bg-stone-800 text-amber-400 px-20 py-5 rounded-full font-black uppercase tracking-[5px] transition-all hover:scale-105 active:scale-95 shadow-2xl flex items-center gap-4"
                        >
                            Confirmar Perícias <ChevronRight size={20}/>
                        </button>
                    </div>
                  </div>
                )}

                {creationStep === 6 && (
                  <div className="space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-500">
                    <div className="text-center bg-stone-50 p-6 rounded-2xl border border-stone-200">
                      <h3 className="font-cinzel text-3xl font-black text-stone-900 uppercase tracking-widest">Equipamento Padrão</h3>
                      <p className="text-stone-500 font-spectral italic text-lg mt-2">Você receberá os itens básicos de sua Classe e Antecedente.</p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-2xl mx-auto">
                        <div className="bg-white p-6 rounded-2xl border border-stone-100 shadow-sm space-y-4">
                            <h4 className="font-black text-stone-400 text-[10px] uppercase tracking-widest border-b border-stone-100 pb-2 flex items-center gap-2"><Backpack size={14}/> Itens de {char.class}</h4>
                            <ul className="space-y-2">
                                {(CLASS_STARTING_EQUIPMENT[char.class] || []).map((item, i) => (
                                    <li key={i} className="text-sm font-bold text-stone-700 flex items-center gap-2"><Check size={14} className="text-green-600"/> {item}</li>
                                ))}
                            </ul>
                        </div>
                        <div className="bg-white p-6 rounded-2xl border border-stone-100 shadow-sm space-y-4">
                            <h4 className="font-black text-stone-400 text-[10px] uppercase tracking-widest border-b border-stone-100 pb-2 flex items-center gap-2"><CircleDollarSign size={14}/> Itens de {char.background}</h4>
                            <ul className="space-y-2">
                                {(BACKGROUND_STARTING_EQUIPMENT[char.background]?.items || []).map((item, i) => (
                                    <li key={i} className="text-sm font-bold text-stone-700 flex items-center gap-2"><Check size={14} className="text-green-600"/> {item}</li>
                                ))}
                                <li className="text-sm font-bold text-amber-600 flex items-center gap-2"><CircleDollarSign size={14}/> +{BACKGROUND_STARTING_EQUIPMENT[char.background]?.gold || 0} PO</li>
                            </ul>
                        </div>
                    </div>

                    <div className="flex justify-center pt-10">
                        <button 
                            onClick={applyStartingItems}
                            className="bg-stone-800 text-amber-400 px-20 py-5 rounded-full font-black uppercase tracking-[5px] transition-all hover:scale-105 active:scale-95 shadow-2xl flex items-center gap-4"
                        >
                            Equipar e Continuar <Sparkles size={20}/>
                        </button>
                    </div>
                  </div>
                )}

                {creationStep === 10 && (
                  <div className="space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-500">
                    <div className="text-center bg-stone-50 p-6 rounded-2xl border border-stone-200">
                      <h3 className="font-cinzel text-3xl font-black text-stone-900 uppercase tracking-widest">Estilo de Luta</h3>
                      <p className="text-stone-500 font-spectral italic text-lg mt-2">Sua classe permite que você se especialize em uma técnica de combate.</p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto">
                        {Object.entries(FIGHTING_STYLES).map(([name, desc]) => (
                            <button 
                                key={name}
                                onClick={() => {
                                    const styleFeat = `Estilo de Luta: ${name}`;
                                    setChar(prev => ({
                                        ...prev,
                                        bio: { ...prev.bio, features: prev.bio.features ? `${prev.bio.features}\n[Nv 1]: ${styleFeat}` : `[Nv 1]: ${styleFeat}` },
                                        spells: { ...prev.spells, known: prev.spells.known ? `${prev.spells.known}\n[Estilo] ${name}: ${desc}` : `[Estilo] ${name}: ${desc}` }
                                    }));
                                    setCreationStep(7);
                                }}
                                className="group p-5 bg-white border-2 border-stone-100 rounded-2xl hover:border-stone-800 transition-all text-left space-y-2 hover:shadow-xl"
                            >
                                <span className="font-black text-stone-900 uppercase text-xs tracking-widest group-hover:text-amber-600">{name}</span>
                                <p className="text-[10px] text-stone-500 leading-relaxed italic">{desc}</p>
                            </button>
                        ))}
                    </div>
                  </div>
                )}

                {creationStep === 7 && (
                  <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-500 pb-20">
                    <div className="text-center bg-stone-50 p-8 rounded-3xl border border-stone-200 shadow-inner">
                        <h3 className="font-cinzel text-4xl font-black text-stone-900 uppercase tracking-widest">Poder Interior</h3>
                        <p className="text-stone-500 font-spectral italic text-xl mt-3">Distribua as forças natas do seu personagem usando o sistema de pontos (D&D 5e).</p>
                        <div className="mt-4 inline-flex items-center gap-4 bg-stone-900 text-amber-400 px-6 py-2 rounded-full font-black text-sm uppercase tracking-widest shadow-xl">
                            <span>Pontos Gastos: {pointsSpent} / 27</span>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-10 max-w-4xl mx-auto">
                        {Object.entries(char.attributes).map(([attr, val]) => {
                            const raceBonus = RACE_BONUSES[char.race]?.attrs?.[attr as keyof typeof char.attributes] || 0;
                            const base = val - raceBonus;

                            const canDecrease = base > 8;
                            const nextCost = POINT_BUY_COSTS[base + 1] !== undefined ? POINT_BUY_COSTS[base + 1] - POINT_BUY_COSTS[base] : 0;
                            const canIncrease = base < 15 && (27 - pointsSpent) >= nextCost;

                            return (
                                <div key={attr} className="text-center group relative">
                                    <label className="block font-black text-stone-400 uppercase text-[11px] tracking-[6px] mb-6 group-hover:text-stone-800 transition-colors">{ATTR_MAP[attr]}</label>
                                    <div className="flex items-center justify-center gap-6">
                                        <button 
                                            onClick={() => {
                                                if (canDecrease) {
                                                    setChar(prev => ({...prev, attributes: {...prev.attributes, [attr]: val - 1}}));
                                                }
                                            }} 
                                            disabled={!canDecrease}
                                            className={`w-12 h-12 rounded-full border-2 flex items-center justify-center transition-all shadow-sm ${
                                                canDecrease ? 'border-stone-200 text-stone-300 hover:border-stone-800 hover:text-stone-800 active:scale-90' : 'border-stone-100 text-stone-100 cursor-not-allowed'
                                            }`}
                                        >
                                            <ChevronDown size={24}/>
                                        </button>
                                        <div className="w-24 h-24 bg-stone-900 border-4 border-stone-800 text-white rounded-3xl shadow-2xl flex flex-col items-center justify-center relative transform group-hover:rotate-3 transition-transform">
                                            <span className="text-4xl font-black font-cinzel select-none">{val}</span>
                                            <div className="absolute -bottom-5 bg-white border-2 border-stone-800 text-stone-900 px-4 py-1 rounded-full text-xs font-black shadow-lg">
                                                {fmt(getMod(val))}
                                            </div>
                                            {raceBonus !== 0 && (
                                                <div className="absolute -top-3 -right-3 bg-amber-400 text-stone-900 w-8 h-8 rounded-full border-2 border-stone-800 flex items-center justify-center text-[10px] font-black shadow-lg animate-bounce" title="Bônus de Raça">
                                                    +{raceBonus}
                                                </div>
                                            )}
                                        </div>
                                        <button 
                                            onClick={() => {
                                                if (canIncrease) {
                                                    setChar(prev => ({...prev, attributes: {...prev.attributes, [attr]: val + 1}}));
                                                }
                                            }} 
                                            disabled={!canIncrease}
                                            className={`w-12 h-12 rounded-full border-2 flex items-center justify-center transition-all shadow-sm ${
                                                canIncrease ? 'border-stone-200 text-stone-300 hover:border-stone-800 hover:text-stone-800 active:scale-90' : 'border-stone-100 text-stone-100 cursor-not-allowed'
                                            }`}
                                        >
                                            <ChevronRight size={24} className="-rotate-90"/>
                                        </button>
                                    </div>
                                    <div className="mt-4 text-[10px] font-bold text-stone-400 uppercase tracking-widest">
                                        Base: {base} 
                                        {base < 15 && <span className="ml-2 text-stone-300">({nextCost} pt)</span>}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    <div className="flex justify-center pt-16">
                        <button 
                            onClick={() => {
                                // If class has spells, go to spell selection, else go to final review
                                if (CLASSES_DB[char.class]?.slots) {
                                    setCreationStep(8);
                                } else {
                                    setCreationStep(9);
                                }
                            }}
                            className="bg-stone-800 text-amber-400 px-20 py-6 rounded-2xl font-black uppercase tracking-[8px] transition-all hover:scale-105 active:scale-95 shadow-2xl flex items-center gap-6"
                        >
                            <Sparkles size={24}/> Consagrar Herói
                        </button>
                    </div>
                  </div>
                )}

                {creationStep === 8 && (
                  <div className="space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-500">
                    <div className="text-center bg-stone-50 p-8 rounded-3xl border border-stone-200">
                        <h3 className="font-cinzel text-4xl font-black text-stone-900 uppercase tracking-widest">Despertar Arcano</h3>
                        <p className="text-stone-500 font-spectral italic text-xl mt-3">Sua classe permite a manipulação da trama da magia. Escolha suas magias iniciais.</p>
                        <div className="mt-6 flex justify-center gap-6">
                           {(() => {
                               const limits = getSpellsLimit(char.class, 1);
                               const currentCantrips = (char.spellList || []).filter(s => s.level === 0).length;
                               const currentSpells = (char.spellList || []).filter(s => s.level > 0).length;
                               
                               return (
                                   <>
                                       {limits.cantrips > 0 && (
                                           <div className={`px-4 py-2 rounded-full font-black text-xs uppercase tracking-widest shadow-md ${currentCantrips >= limits.cantrips ? 'bg-green-100 text-green-800' : 'bg-stone-900 text-amber-400'}`}>
                                               Truques: {currentCantrips} / {limits.cantrips}
                                           </div>
                                       )}
                                       {limits.spells > 0 && (
                                           <div className={`px-4 py-2 rounded-full font-black text-xs uppercase tracking-widest shadow-md ${currentSpells >= limits.spells ? 'bg-green-100 text-green-800' : 'bg-stone-900 text-amber-400'}`}>
                                               Magias: {currentSpells} / {limits.spells}
                                           </div>
                                       )}
                                   </>
                               );
                           })()}
                        </div>
                    </div>
                    
                    <div className="bg-white/40 p-6 rounded-3xl border border-stone-800 shadow-sm max-w-4xl mx-auto">
                        <label className="block text-[10px] font-black text-stone-500 uppercase tracking-[3px] mb-4">Magias Disponíveis (Progresso Nvl 1)</label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 overflow-y-auto max-h-[50vh] pr-2 custom-scrollbar">
                            {(() => {
                                const limits = getSpellsLimit(char.class, 1);
                                const currentCantrips = (char.spellList || []).filter(s => s.level === 0).length;
                                const currentSpells = (char.spellList || []).filter(s => s.level > 0).length;

                                const availableClass = CLASS_SPELLS[char.class] || [];
                                const availableSub = Object.values(SUBCLASS_SPELLS[char.subclass] || {}).flat();
                                const available = Array.from(new Set([...availableClass, ...availableSub]))
                                    .filter(sName => {
                                        const info = SPELLS_DB[sName];
                                        if (!info) return false;
                                        const maxCircle = getMaxSpellCircle(CLASSES_DB[char.class]?.slots, 1);
                                        const lvlNum = info.level === 'Truque' ? 0 : parseInt(info.level.replace(/\D/g, '')) || 0;
                                        return lvlNum <= maxCircle;
                                    })
                                    .sort();
                                
                                if (available.length === 0) {
                                    return (
                                        <div className="col-span-full py-20 text-center space-y-4">
                                            <div className="text-stone-300 flex justify-center"><BookOpen size={48}/></div>
                                            <p className="text-stone-400 font-spectral italic text-lg pr-4">Seu caminho não concede mistérios arcanos no primeiro nível. <br/>Continue para finalizar sua jornada.</p>
                                        </div>
                                    );
                                }

                                return available.map(sName => {
                                    const isSelected = (char.spellList || []).some(s => s.name === sName);
                                    const sInfo = SPELLS_DB[sName];
                                    if (!sInfo) return null;
                                    const isCantrip = sInfo.level === 'Truque';

                                    const canSelect = isCantrip ? (currentCantrips < limits.cantrips) : (currentSpells < limits.spells);

                                    return (
                                        <button 
                                            key={sName}
                                            onClick={() => {
                                                if (isSelected) {
                                                    setChar(prev => ({
                                                        ...prev,
                                                        spellList: (prev.spellList || []).filter(s => s.name !== sName)
                                                    }));
                                                } else if (canSelect) {
                                                    setChar(prev => ({
                                                        ...prev,
                                                        spellList: [...(prev.spellList || []), toSpellEntry(sName)]
                                                    }));
                                                }
                                            }}
                                            className={`flex items-center justify-between p-4 rounded-2xl border transition-all text-left group ${
                                                isSelected ? 'bg-stone-800 border-stone-800 text-white shadow-xl scale-[1.02]' : 
                                                canSelect ? 'bg-white border-stone-100 hover:border-stone-800' : 'bg-stone-50 border-stone-100 opacity-50 cursor-not-allowed'
                                            }`}
                                        >
                                            <div className="flex flex-col">
                                                <span className="text-sm font-black uppercase tracking-tight">{sName}</span>
                                                <span className={`text-[9px] uppercase font-bold transition-colors ${isSelected ? 'text-stone-400' : 'text-stone-400 group-hover:text-stone-600'}`}>
                                                    {sInfo.level} • {sInfo.school || 'Magia'}
                                                </span>
                                            </div>
                                            {isSelected ? <Check size={18} className="text-amber-400"/> : <Plus size={18} className="text-stone-300"/>}
                                        </button>
                                    );
                                });
                            })()}
                        </div>
                    </div>

                    <div className="flex justify-center pt-10">
                        <button 
                            onClick={() => setCreationStep(9)}
                            className="bg-stone-800 text-amber-400 px-24 py-6 rounded-full font-black uppercase tracking-[10px] transition-all hover:scale-105 active:scale-95 shadow-2xl flex items-center gap-6"
                        >
                            Finalizar <Sparkles size={24}/>
                        </button>
                    </div>
                  </div>
                )}

                {creationStep === 9 && (
                  <div className="space-y-12 animate-in fade-in zoom-in duration-700 py-10 text-center">
                    <div className="relative inline-block">
                        <div className="w-48 h-48 bg-white border-[12px] border-stone-800 rounded-full flex items-center justify-center mx-auto shadow-[0_20px_50px_rgba(0,0,0,0.3)] relative overflow-hidden">
                            <User size={100} className="text-stone-900 opacity-20 absolute"/>
                            <Sparkles size={120} className="text-stone-800 animate-pulse"/>
                        </div>
                        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute -right-4 -bottom-4 w-20 h-20 bg-amber-400 border-4 border-stone-800 rounded-full flex flex-col items-center justify-center shadow-xl">
                            <span className="text-[10px] font-black uppercase text-stone-800 leading-none">Nvl</span>
                            <span className="text-2xl font-black text-stone-900 leading-none">1</span>
                        </motion.div>
                    </div>
                    
                    <div className="space-y-4">
                        <div className="inline-block px-4 py-1 bg-stone-100 rounded-full text-[10px] font-black tracking-[4px] text-stone-400 uppercase">Ficha Master Concluída</div>
                        <h3 className="font-cinzel text-6xl font-black text-stone-900 uppercase tracking-tighter leading-tight">{char.name}</h3>
                        <p className="text-3xl font-spectral italic text-stone-500">{char.race} • {char.class} ({char.subclass || 'Sem Subclasse'})</p>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto pt-6">
                        <div className="p-6 bg-white rounded-3xl border-2 border-stone-100 shadow-lg">
                             <div className="text-[10px] font-black text-stone-300 uppercase tracking-widest mb-1">Pontos de Vida</div>
                             <div className="text-4xl font-black font-cinzel text-stone-900">{char.hp.max}</div>
                        </div>
                        <div className="p-6 bg-white rounded-3xl border-2 border-stone-100 shadow-lg">
                             <div className="text-[10px] font-black text-stone-300 uppercase tracking-widest mb-1">Armadura Base</div>
                             <div className="text-4xl font-black font-cinzel text-stone-900">{char.ac}</div>
                        </div>
                        <div className="p-6 bg-white rounded-3xl border-2 border-stone-100 shadow-lg">
                             <div className="text-[10px] font-black text-stone-300 uppercase tracking-widest mb-1">Deslocamento</div>
                             <div className="text-4xl font-black font-cinzel text-stone-900">{char.speed}</div>
                        </div>
                        <div className="p-6 bg-white rounded-3xl border-2 border-stone-100 shadow-lg">
                             <div className="text-[10px] font-black text-stone-300 uppercase tracking-widest mb-1">Dado de Vida</div>
                             <div className="text-4xl font-black font-cinzel text-stone-900">{char.hitDice.max}</div>
                        </div>
                    </div>

                    <div className="flex flex-col gap-6 max-w-sm mx-auto pt-10">
                        <button 
                            onClick={finishWizard}
                            className="bg-stone-800 text-white p-8 rounded-3xl font-black uppercase text-xl tracking-[8px] transition-all hover:scale-105 active:scale-95 shadow-[0_20px_40px_rgba(0,0,0,0.2)]"
                        >
                            Assinar Ficha
                        </button>
                        <button 
                            onClick={() => setCreationStep(1)}
                            className="text-stone-400 hover:text-red-700 font-black uppercase text-[10px] tracking-[4px] transition-colors flex items-center justify-center gap-2"
                        >
                            <RotateCcw size={14}/> Descartar e Recomeçar
                        </button>
                    </div>
                  </div>
                )}
              </div>

              {creationStep > 0 && creationStep < 8 && (
                 <div className="p-6 bg-white border-t border-stone-100 flex justify-between items-center px-10">
                    <button 
                        onClick={() => setCreationStep(prev => prev! - 1)}
                        className="flex items-center gap-2 text-stone-400 hover:text-stone-800 font-black uppercase text-[10px] tracking-[4px] transition-all"
                    >
                        <ChevronRight className="rotate-180" size={18}/> Voltar
                    </button>
                    <div className="flex flex-col items-center">
                        <span className="text-[10px] font-black text-stone-800 uppercase tracking-[6px] mb-1">Progresso</span>
                        <div className="w-48 h-1 bg-stone-100 rounded-full overflow-hidden">
                            <motion.div initial={{ width: 0 }} animate={{ width: `${(creationStep / 8) * 100}%` }} className="h-full bg-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.5)]"></motion.div>
                        </div>
                    </div>
                    <span className="text-[10px] font-black text-stone-300 uppercase tracking-[4px]">Passo {creationStep + 1} / 9</span>
                 </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showGrimorioBook && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-stone-950/90 backdrop-blur-md">
              <motion.div 
                  initial={{ opacity: 0, scale: 0.9, rotateY: -30 }}
                  animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                  exit={{ opacity: 0, scale: 0.9, rotateY: 30 }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                  className="w-full max-w-6xl h-[90vh] bg-[#f4e4bc] bg-[url('https://www.transparenttextures.com/patterns/parchment.png')] shadow-[0_0_100px_rgba(0,0,0,0.8)] relative rounded-sm flex flex-col md:flex-row overflow-hidden"
                  style={{ border: '20px solid #2d2d2d', borderImage: 'url("https://www.transparenttextures.com/patterns/leather.png") 30 repeat' }}
              >
                  {/* Spine Shadow */}
                  <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-12 -ml-6 bg-gradient-to-r from-black/20 via-transparent to-black/20 z-20 pointer-events-none"></div>

                  {/* Left Page */}
                  <div className="flex-1 overflow-y-auto p-12 relative flex flex-col custom-scrollbar border-r border-stone-400/30">
                      <div className="mb-12 text-center relative">
                          <div className="absolute top-0 left-0 text-stone-300 font-serif italic text-[10px]">Folha Arcaica {char.level}</div>
                          <h2 className="font-cinzel text-3xl font-black text-stone-900 uppercase tracking-[10px] border-b-4 border-double border-stone-800 pb-3 inline-block">Grimório</h2>
                          <p className="text-stone-500 text-[9px] font-black uppercase tracking-[5px] mt-4">Transcrições de {char.name}</p>
                      </div>

                      <div className="space-y-16">
                          {/* TRUQUES - Green Theme */}
                          <section>
                              <div className="flex items-center gap-4 mb-8 border-b-2 border-emerald-100 pb-2">
                                  <div className="w-10 h-10 rounded bg-emerald-100 flex items-center justify-center text-emerald-600">
                                      <Wind size={24} />
                                  </div>
                                  <h3 className="font-cinzel text-2xl font-bold text-emerald-800 tracking-widest">Truques</h3>
                              </div>
                              <div className="grid grid-cols-1 gap-8">
                                  {categorizedActions.cantrips.map(s => {
                                      const mod = getMod(char.attributes[char.spells.castingStat as keyof typeof char.attributes] || 10) + profBonus;
                                      return (
                                          <div key={s.id} className="relative group">
                                              <div className="flex justify-between items-baseline mb-2">
                                                  <h4 className="font-black text-emerald-950 uppercase text-sm tracking-widest flex items-center gap-2">
                                                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                                                      {s.name}
                                                  </h4>
                                                  <button 
                                                      onClick={() => onRoll(20, mod, `Truque: ${s.name}`)}
                                                      className="text-[10px] font-black text-emerald-600 hover:text-emerald-900 border-b border-emerald-200 transition-all uppercase tracking-widest"
                                                  >
                                                      Usar ({fmt(mod)})
                                                  </button>
                                              </div>
                                              <p className="text-xs text-stone-700 font-spectral italic leading-relaxed pl-4 border-l-2 border-emerald-50">{s.description}</p>
                                          </div>
                                      );
                                  })}
                                  {categorizedActions.cantrips.length === 0 && <p className="text-xs text-stone-400 italic">Sem truques preparados.</p>}
                              </div>
                          </section>

                          {/* MAGIAS - Blue Theme */}
                          <section>
                              <div className="flex items-center gap-4 mb-8 border-b-2 border-indigo-100 pb-2">
                                  <div className="w-10 h-10 rounded bg-indigo-100 flex items-center justify-center text-indigo-600">
                                      <RotateCcw size={24} />
                                  </div>
                                  <h3 className="font-cinzel text-2xl font-bold text-indigo-800 tracking-widest">Magias</h3>
                              </div>
                              <div className="space-y-12">
                                  {[1,2,3,4,5,6,7,8,9].map(lvl => {
                                      const spells = categorizedActions.leveledSpells.filter(s => s.level === lvl);
                                      if (spells.length === 0) return null;
                                      const mod = getMod(char.attributes[char.spells.castingStat as keyof typeof char.attributes] || 10) + profBonus;
                                      return (
                                          <div key={lvl}>
                                              <div className="flex items-center gap-3 mb-6">
                                                  <span className="h-px bg-indigo-100 flex-1"></span>
                                                  <span className="text-[10px] font-black text-indigo-400 uppercase tracking-[6px]">{lvl}º Círculo</span>
                                                  <span className="h-px bg-indigo-100 flex-1"></span>
                                              </div>
                                              <div className="grid grid-cols-1 gap-8">
                                                  {spells.map(s => (
                                                      <div key={s.id} className="relative group">
                                                          <div className="flex justify-between items-baseline mb-2">
                                                              <h4 className="font-black text-indigo-950 uppercase text-sm tracking-widest flex items-center gap-2">
                                                                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400"></span>
                                                                  {s.name}
                                                              </h4>
                                                              <button 
                                                                  onClick={() => onRoll(20, mod, `Magia: ${s.name}`)}
                                                                  className="text-[10px] font-black text-indigo-600 hover:text-indigo-900 border-b border-indigo-200 transition-all uppercase tracking-widest"
                                                              >
                                                                  Conjurar ({fmt(mod)})
                                                              </button>
                                                          </div>
                                                          <p className="text-xs text-stone-700 font-spectral italic leading-relaxed pl-4 border-l-2 border-indigo-50">{s.description}</p>
                                                      </div>
                                                  ))}
                                              </div>
                                          </div>
                                      );
                                  })}
                                  {categorizedActions.leveledSpells.length === 0 && <p className="text-xs text-stone-400 italic">Nenhuma magia de nível preparada.</p>}
                              </div>
                          </section>
                      </div>
                  </div>

                  {/* Right Page */}
                  <div className="flex-1 overflow-y-auto p-12 relative flex flex-col custom-scrollbar">
                      <button 
                        onClick={() => setShowGrimorioBook(false)}
                        className="absolute top-8 right-8 p-3 text-stone-400 hover:text-stone-900 hover:bg-stone-200/50 rounded-full transition-all z-30"
                      >
                        <X size={32} />
                      </button>

                      <div className="mb-12 text-center">
                          <h2 className="font-cinzel text-3xl font-black text-stone-900 uppercase tracking-[10px] border-b-4 border-double border-stone-800 pb-3 inline-block">Proezas</h2>
                          <p className="text-stone-500 text-[9px] font-black uppercase tracking-[5px] mt-4">{char.class} de Ferro</p>
                      </div>

                      <div className="space-y-16">
                          {/* ATTACKS - Red Theme */}
                          {categorizedActions.attacks.length > 0 && (
                            <section>
                                <div className="flex items-center gap-4 mb-8 border-b-2 border-rose-100 pb-2">
                                    <div className="w-10 h-10 rounded bg-rose-100 flex items-center justify-center text-rose-700">
                                        <Sword size={24} />
                                    </div>
                                    <h3 className="font-cinzel text-2xl font-bold text-rose-800 tracking-widest">Ações de Ataque</h3>
                                </div>
                                <div className="grid grid-cols-1 gap-10">
                                    {categorizedActions.attacks.map((line, idx) => {
                                        const name = line.split(':')[0].replace(/\[.*?\]/g, '').trim();
                                        const desc = line.includes(':') ? line.split(':').slice(1).join(':').trim() : 'Fúria em combate.';
                                        return (
                                            <div key={idx} className="relative">
                                                <div className="flex justify-between items-baseline mb-2">
                                                    <h4 className="font-black text-rose-950 uppercase text-sm tracking-widest flex items-center gap-2">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                                                        {name}
                                                    </h4>
                                                    <button onClick={() => addLog(char.name, `ataca com ${name}!`, 'info')} className="text-[10px] font-black text-rose-600 hover:text-rose-900 border-b border-rose-200 transition-all uppercase tracking-widest">Rolar Ataque</button>
                                                </div>
                                                <p className="text-xs text-stone-700 font-spectral italic leading-relaxed pl-4 border-l-2 border-rose-50">{desc}</p>
                                            </div>
                                        );
                                    })}
                                </div>
                            </section>
                          )}

                          {/* ABILITIES - Orange Theme */}
                          <section>
                              <div className="flex items-center gap-4 mb-8 border-b-2 border-orange-100 pb-2">
                                  <div className="w-10 h-10 rounded bg-orange-100 flex items-center justify-center text-orange-700">
                                      <Zap size={24} />
                                  </div>
                                  <h3 className="font-cinzel text-2xl font-bold text-orange-800 tracking-widest">Habilidades de Classe</h3>
                              </div>
                              <div className="grid grid-cols-1 gap-10">
                                  {categorizedActions.classAbilities.map((line, idx) => {
                                      const name = line.split(':')[0].replace(/\[.*?\]/g, '').trim();
                                      const desc = line.includes(':') ? line.split(':').slice(1).join(':').trim() : 'Poder de classe.';
                                      return (
                                          <div key={idx} className="relative">
                                              <div className="flex justify-between items-baseline mb-2">
                                                  <h4 className="font-black text-orange-950 uppercase text-sm tracking-widest flex items-center gap-2">
                                                      <span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span>
                                                      {name}
                                                  </h4>
                                                  <button onClick={() => addLog(char.name, `usou ${name}!`, 'info')} className="text-[10px] font-black text-orange-600 hover:text-orange-900 border-b border-orange-200 transition-all uppercase tracking-widest">Ativar</button>
                                              </div>
                                              <p className="text-xs text-stone-700 font-spectral italic leading-relaxed pl-4 border-l-2 border-orange-50">{desc}</p>
                                          </div>
                                      );
                                  })}
                                  {categorizedActions.classAbilities.length === 0 && <p className="text-xs text-stone-400 italic">Sem habilidades registradas.</p>}
                              </div>
                          </section>

                          {/* RACE - Purple Theme */}
                          {categorizedActions.raceAbilities.length > 0 && (
                            <section>
                                <div className="flex items-center gap-4 mb-8 border-b-2 border-violet-100 pb-2">
                                    <div className="w-10 h-10 rounded bg-violet-100 flex items-center justify-center text-violet-700">
                                        <Sparkles size={24} />
                                    </div>
                                    <h3 className="font-cinzel text-2xl font-bold text-violet-800 tracking-widest">Herança Élfica / Racial</h3>
                                </div>
                                <div className="grid grid-cols-1 gap-10">
                                    {categorizedActions.raceAbilities.map((line, idx) => {
                                        const name = line.split(':')[0].replace(/\[.*?\]/g, '').trim();
                                        const desc = line.includes(':') ? line.split(':').slice(1).join(':').trim() : 'Poder hereditário.';
                                        return (
                                            <div key={idx} className="relative">
                                                <div className="flex justify-between items-baseline mb-2">
                                                    <h4 className="font-black text-violet-950 uppercase text-sm tracking-widest flex items-center gap-2">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-violet-400"></span>
                                                        {name}
                                                    </h4>
                                                    <button onClick={() => addLog(char.name, `manifestou ${name}!`, 'info')} className="text-[10px] font-black text-violet-600 hover:text-violet-900 border-b border-violet-200 transition-all uppercase tracking-widest">Manifestar</button>
                                                </div>
                                                <p className="text-xs text-stone-700 font-spectral italic leading-relaxed pl-4 border-l-2 border-violet-50">{desc}</p>
                                            </div>
                                        );
                                    })}
                                </div>
                            </section>
                          )}
                      </div>

                      <div className="mt-auto pt-16 flex flex-col items-center">
                          <div className="w-32 h-px bg-stone-300 mb-4"></div>
                          <div className="text-[10px] font-spectral italic text-stone-400">Escrito sob a luz das estrelas</div>
                          <div className="text-[8px] font-black text-stone-300 uppercase tracking-[8px] mt-2">D&D 5E System</div>
                      </div>
                  </div>
              </motion.div>
          </div>
        )}
      </AnimatePresence>

       <AnimatePresence>
        {showBibliotecarioBook && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-stone-950/90 backdrop-blur-md font-sans">
              <motion.div 
                  initial={{ opacity: 0, scale: 0.9, rotateY: 30 }}
                  animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                  exit={{ opacity: 0, scale: 0.9, rotateY: -30 }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                  className="w-full max-w-6xl h-[90vh] bg-[#1a1a1a] bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')] shadow-[0_0_100px_rgba(0,0,0,0.8)] relative rounded-sm flex flex-col md:flex-row overflow-hidden border-[20px] border-stone-800"
                  style={{ borderImage: 'url("https://www.transparenttextures.com/patterns/carbon-fibre.png") 30 repeat' }}
              >
                  {/* Spine Shadow */}
                  <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-12 -ml-6 bg-gradient-to-r from-black/40 via-transparent to-black/40 z-20 pointer-events-none"></div>

                  {/* Left Page - Filters & Controls */}
                  <div className="flex-1 overflow-y-auto p-12 relative flex flex-col custom-scrollbar border-r border-stone-700/30 bg-stone-900/50 text-stone-300">
                      <div className="mb-10 text-center relative pt-4">
                          <h2 className="font-cinzel text-3xl font-black text-amber-500 tracking-[8px] uppercase border-b-4 border-double border-amber-600/30 pb-3 inline-block">Biblioteca Arcaica</h2>
                          <p className="text-stone-500 text-[9px] font-black uppercase tracking-[5px] mt-4">Catálogo Universal de Magia</p>
                      </div>

                      <div className="space-y-8">
                          {/* Search */}
                          <div className="space-y-4">
                              <label className="text-[10px] font-black text-amber-600 uppercase tracking-widest ml-1">Filtro por Palavras-Chave</label>
                              <div className="relative">
                                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-600" size={18}/>
                                  <input 
                                      className="w-full bg-stone-800 border-2 border-stone-700 rounded-xl py-4 pl-12 pr-6 text-sm text-stone-100 font-bold outline-none focus:border-amber-500 transition-all placeholder:text-stone-600" 
                                      placeholder="Procurar pergaminhos..." 
                                      value={spellSearch} 
                                      onChange={(e) => setSpellSearch(e.target.value)}
                                  />
                              </div>
                          </div>

                          {/* Level Group Selector */}
                          <div className="space-y-4">
                              <label className="text-[10px] font-black text-amber-600 uppercase tracking-widest ml-1">Círculos de Poder</label>
                              <div className="grid grid-cols-5 gap-2">
                                  <button onClick={() => setArchiveLevelFilter('all')} className={`p-3 rounded-lg border font-black text-[9px] uppercase tracking-widest transition-all ${archiveLevelFilter === 'all' ? 'bg-amber-600 border-amber-500 text-stone-900' : 'bg-stone-800 border-stone-700 text-stone-400 hover:text-stone-200'}`}>Todos</button>
                                  {[0,1,2,3,4,5,6,7,8,9].map(lvl => (
                                    <button 
                                        key={lvl}
                                        onClick={() => setArchiveLevelFilter(lvl)} 
                                        className={`p-3 rounded-lg border font-black text-[9px] uppercase tracking-widest transition-all ${archiveLevelFilter === lvl ? 'bg-amber-600 border-amber-500 text-stone-900 shadow-[0_0_15px_rgba(217,119,6,0.3)]' : 'bg-stone-800 border-stone-700 text-stone-400 hover:text-stone-200'}`}
                                    >
                                        {lvl}
                                    </button>
                                  ))}
                              </div>
                          </div>

                          {/* Class & School Selectors */}
                          <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-4">
                                  <label className="text-[10px] font-black text-amber-600 uppercase tracking-widest ml-1">Vocação Classe</label>
                                  <select 
                                      value={archiveClassFilter}
                                      onChange={(e) => setArchiveClassFilter(e.target.value)}
                                      className="w-full bg-stone-800 border-2 border-stone-700 rounded-xl p-3.5 text-xs text-stone-200 outline-none focus:border-amber-500 cursor-pointer"
                                  >
                                      <option value="Todas">Todas as Classes</option>
                                      {Object.keys(CLASS_SPELLS).sort().map(c => <option key={c} value={c}>{c}</option>)}
                                  </select>
                              </div>
                              <div className="space-y-4">
                                  <label className="text-[10px] font-black text-amber-600 uppercase tracking-widest ml-1">Escola Mística</label>
                                  <select 
                                      value={archiveSchoolFilter}
                                      onChange={(e) => setArchiveSchoolFilter(e.target.value)}
                                      className="w-full bg-stone-800 border-2 border-stone-700 rounded-xl p-3.5 text-xs text-stone-200 outline-none focus:border-amber-500 cursor-pointer"
                                  >
                                      {SPELL_SCHOOLS.map(s => <option key={s} value={s}>{s}</option>)}
                                  </select>
                              </div>
                          </div>

                          {/* Checkboxes */}
                          <div className="flex gap-4">
                              <label className="flex-1 flex items-center justify-center gap-3 p-4 bg-stone-800 border-2 border-stone-700 rounded-xl cursor-pointer hover:bg-stone-700 transition-all border-dashed">
                                  <input type="checkbox" checked={archiveConcentrationFilter} onChange={e => setArchiveConcentrationFilter(e.target.checked)} className="hidden" />
                                  <div className={`w-5 h-5 rounded flex items-center justify-center border ${archiveConcentrationFilter ? 'bg-amber-600 border-amber-500' : 'border-stone-600 bg-stone-900'}`}>{archiveConcentrationFilter && <Check size={14} className="text-white"/>}</div>
                                  <span className="text-[10px] font-black uppercase text-stone-400 tracking-widest">Concentração</span>
                              </label>
                              <label className="flex-1 flex items-center justify-center gap-3 p-4 bg-stone-800 border-2 border-stone-700 rounded-xl cursor-pointer hover:bg-stone-700 transition-all border-dashed">
                                  <input type="checkbox" checked={archiveRitualFilter} onChange={e => setArchiveRitualFilter(e.target.checked)} className="hidden" />
                                  <div className={`w-5 h-5 rounded flex items-center justify-center border ${archiveRitualFilter ? 'bg-amber-600 border-amber-500' : 'border-stone-600 bg-stone-900'}`}>{archiveRitualFilter && <Check size={14} className="text-white"/>}</div>
                                  <span className="text-[10px] font-black uppercase text-stone-400 tracking-widest">Ritual</span>
                              </label>
                          </div>

                          <button 
                              onClick={() => {
                                  setSpellSearch('');
                                  setArchiveLevelFilter('all');
                                  setArchiveConcentrationFilter(false);
                                  setArchiveRitualFilter(false);
                                  setArchiveClassFilter('Todas');
                                  setArchiveSchoolFilter('Todas');
                              }}
                              className="w-full p-4 bg-stone-700 text-stone-300 rounded-xl font-black text-[10px] uppercase tracking-[4px] hover:bg-stone-600 transition-all border-2 border-stone-600 active:scale-95"
                          >
                              Limpar Filtros de Arquivo
                          </button>
                      </div>

                      <div className="mt-auto p-8 border-t border-stone-800 flex items-center justify-between font-sans">
                          <div className="flex items-center gap-3">
                              <Sparkles size={16} className="text-amber-500 animate-pulse" />
                              <span className="text-[10px] font-black text-stone-500 uppercase tracking-widest">{filteredSpells.length} Registros Catalografados</span>
                          </div>
                      </div>
                  </div>

                  {/* Right Page - Spell Listing */}
                  <div className="flex-[1.5] overflow-y-auto p-12 relative flex flex-col custom-scrollbar bg-stone-950/20 text-stone-300">
                      <button 
                        onClick={() => setShowBibliotecarioBook(false)}
                        className="absolute top-8 right-8 p-3 text-stone-500 hover:text-amber-500 hover:bg-stone-800/50 rounded-full transition-all z-30"
                      >
                        <X size={32} />
                      </button>

                      <div className="mb-10 flex items-center gap-6">
                        <div className="p-4 bg-amber-600 text-stone-900 rounded-2xl shadow-xl shadow-amber-600/10">
                            <Library size={40} />
                        </div>
                        <div>
                            <h2 className="font-cinzel text-3xl font-black text-stone-100 uppercase tracking-[5px]">Arquivo de Magia</h2>
                            <p className="text-amber-600 text-[10px] font-black uppercase tracking-[4px] mt-1 italic">Conhecimento compartilhado entre os reinos</p>
                        </div>
                      </div>

                      <div className="space-y-6">
                          {filteredSpells.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 opacity-30 text-stone-400">
                                <Search size={64} className="mb-4" />
                                <p className="font-spectral text-xl italic">Nenhum registro encontrado nas sombras...</p>
                            </div>
                          ) : (
                            filteredSpells.map((s, idx) => {
                                const isOwned = char.spells.known.toLowerCase().includes(s.name.toLowerCase());
                                return (
                                    <motion.div 
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: idx * 0.02 }}
                                        key={idx} 
                                        className="p-6 bg-stone-900/60 border-l-4 border-amber-600/50 rounded-r-2xl border border-stone-800 group hover:border-amber-500/50 transition-all"
                                    >
                                        <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                                            <div className="flex-1 w-full text-stone-300 font-sans">
                                                <div className="flex items-center flex-wrap gap-3 mb-3">
                                                    <h3 className="font-black text-stone-100 uppercase tracking-widest text-base group-hover:text-amber-400 transition-colors uppercase">{s.name}</h3>
                                                    <span className="px-3 py-0.5 bg-amber-600 text-stone-950 rounded-full font-black text-[9px] uppercase">{s.level}º Círculo</span>
                                                    {(s as any).school && <span className="text-[9px] text-stone-500 font-black uppercase tracking-widest">{(s as any).school}</span>}
                                                </div>
                                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
                                                    <div className="space-y-1">
                                                        <span className="text-[8px] text-stone-600 font-bold uppercase block">Tempo</span>
                                                        <span className="text-[10px] text-stone-300 font-bold whitespace-nowrap">{s.castingTime}</span>
                                                    </div>
                                                    <div className="space-y-1">
                                                        <span className="text-[8px] text-stone-600 font-bold uppercase block">Alcance</span>
                                                        <span className="text-[10px] text-stone-300 font-bold whitespace-nowrap">{s.range}</span>
                                                    </div>
                                                    <div className="space-y-1">
                                                        <span className="text-[8px] text-stone-600 font-bold uppercase block">Duração</span>
                                                        <span className="text-[10px] text-stone-300 font-bold whitespace-nowrap">{s.duration}</span>
                                                    </div>
                                                    <div className="space-y-1">
                                                        <span className="text-[8px] text-stone-600 font-bold uppercase block">Conc./Ritual</span>
                                                        <div className="flex gap-1">
                                                          {s.concentration && <Zap size={12} className="text-amber-500" />}
                                                          {(s as any).ritual && <Book size={12} className="text-indigo-400" />}
                                                          {!s.concentration && !(s as any).ritual && <span className="text-[10px] text-stone-600">—</span>}
                                                        </div>
                                                    </div>
                                                </div>
                                                <p className="text-xs text-stone-400 leading-relaxed font-spectral italic line-clamp-3 group-hover:line-clamp-none transition-all">{s.desc}</p>
                                            </div>
                                            <div className="w-full md:w-auto">
                                                {isOwned ? (
                                                    <div className="px-6 py-3 bg-stone-800 text-stone-500 rounded-xl font-black text-[10px] uppercase tracking-widest border border-stone-700 flex items-center justify-center gap-2 cursor-default font-sans">
                                                        <Check size={16} /> JÁ CONHECIDO
                                                    </div>
                                                ) : (
                                                    <button 
                                                        onClick={() => {
                                                          const sInfo = SPELLS_DB[s.name] || s;
                                                          const newSpell = {
                                                            id: Math.random().toString(36).substr(2, 9),
                                                            name: s.name,
                                                            level: s.level === 'Truque' ? 0 : (typeof s.level === 'number' ? s.level : parseInt(s.level.toString().replace(/\D/g, '')) || 0),
                                                            school: (s as any).school || 'Magia',
                                                            castingTime: s.castingTime || "1 Ação",
                                                            range: s.range || "Pessoal",
                                                            components: (s as any).components || "V, S",
                                                            duration: s.duration || "Instantânea",
                                                            concentration: s.concentration || false,
                                                            description: s.desc || "",
                                                            prepared: true
                                                          };
                                                          setChar(prev => ({
                                                            ...prev,
                                                            spellList: [...(prev.spellList || []), newSpell]
                                                          }));
                                                          addLog?.('Magia Aprendida', `Você adicionou ${s.name} ao seu grimório!`, 'info');
                                                        }}
                                                        className="w-full px-6 py-3 bg-amber-600 hover:bg-amber-500 text-stone-900 rounded-xl font-black text-[10px] uppercase tracking-[3px] transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2 font-sans"
                                                    >
                                                        <Plus size={16} strokeWidth={3} /> APRENDER
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })
                          )}
                      </div>

                      <div className="mt-auto pt-16 flex flex-col items-center">
                          <div className="w-32 h-px bg-stone-800 mb-4"></div>
                          <div className="text-[10px] font-spectral italic text-stone-600">Arquivado pelo Bibliotecário</div>
                          <div className="text-[8px] font-black text-stone-800 uppercase tracking-[8px] mt-2">Grimório Universal</div>
                      </div>
                  </div>
              </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
