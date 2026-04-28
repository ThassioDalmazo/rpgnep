
import { Monster, Character, InventoryItem } from "./types";
import { BACKUP_MONSTERS } from "./monsterData";

export const INITIAL_CHAR: Character = {
  id: "temp-id-" + Math.random().toString(36).substr(2, 9),
  name: "", class: "", subclass: "", level: 1, 
  classes: [],
  background: "", race: "",
  playerName: "", alignment: "Neutro", xp: 0,
  attributes: { str: 8, dex: 8, con: 8, int: 8, wis: 8, cha: 8 },
  skills: {}, saves: {},
  hp: { current: 10, max: 10, temp: 0 },
  hitDice: { current: 1, max: "d10" },
  deathSaves: { successes: 0, failures: 0 },
  ac: 10, speed: "9m", initiative: 0,
  inventory: "",
  bio: { traits: "", ideals: "", bonds: "", flaws: "", backstory: "", features: "" },
  spells: { slots: [], known: "", castingStat: "int" },
  spellList: [],
  wallet: { cp: 0, sp: 0, ep: 0, gp: 0, pp: 0 },
  customWeapons: [],
  customSpells: [],
  feats: [],
  exhaustion: 0,
  conditions: [],
  imageUrl: ""
};

export const FEATS_DB: Record<string, string> = {
  "Adepto Elemental": "Suas magias ignoram resistência a um tipo de dano escolhido (ácido, frio, fogo, elétrico ou trovejante). Ao rolar dano desse tipo, trate qualquer 1 no dado como 2.",
  "Adepto Marcial": "Você aprende duas manobras do Mestre de Batalha e ganha um dado de superioridade (d6) que recupera após um descanso curto ou longo.",
  "Alerta": "+5 na iniciativa. Você não pode ser surpreso enquanto estiver consciente. Outras criaturas não ganham vantagem em jogadas de ataque contra você por estarem escondidas.",
  "Atacante Selvagem": "Uma vez por turno, ao rolar dano para um ataque com arma corpo a corpo, você pode rolar o dano da arma novamente e usar qualquer um dos resultados.",
  "Atirador de Elite": "Atacar a longo alcance não impõe desvantagem. Seus ataques à distância ignoram meia cobertura e três quartos de cobertura. Antes de atacar, você pode escolher -5 no acerto para +10 no dano.",
  "Atirador de Magia": "O alcance de magias de ataque dobra. Seus ataques mágicos à distância ignoram meia cobertura e três quartos de cobertura. Você aprende um truque de ataque.",
  "Atleta": "Aumente Força ou Destreza em 1. Levantar-se de estar caído custa apenas 1,5m de movimento. Escalada não custa movimento extra. Salto à distância correndo requer apenas 1,5m.",
  "Ator": "Aumente Carisma em 1. Vantagem em Enganação e Atuação para se passar por outra pessoa. Pode imitar a fala de outra pessoa ou sons.",
  "Brigão de Taverna": "Aumente Força ou Constituição em 1. Proficiência com armas improvisadas e desarmado (1d4). Ao acertar ataque desarmado/improvisado, pode usar ação bônus para agarrar.",
  "Combate Montado": "Vantagem em ataques corpo a corpo contra criaturas menores que sua montaria. Pode forçar ataque na montaria a alvejar você. Montaria tem Evasão se passar em teste de Destreza.",
  "Combatente com Duas Armas": "+1 na CA enquanto empunhar duas armas corpo a corpo. Pode usar duas armas mesmo que não sejam leves. Pode sacar ou guardar duas armas.",
  "Conjurador de Guerra": "Vantagem em Con para manter concentração. Pode conjurar com armas/escudo nas mãos. Pode usar reação para conjurar magia em vez de ataque de oportunidade.",
  "Conjurador de Ritual": "Requer Int ou Sab 13. Aprende 2 rituais de qualquer classe. Pode copiar rituais se tiver nível apropriado (2 horas e 50 po por nível).",
  "Curandeiro": "Ao usar kit de curandeiro para estabilizar, a criatura recupera 1 PV. Pode usar kit para curar 1d6 + 4 + Nível PV (uma vez por descanso curto por criatura).",
  "Duelista Defensivo": "Requer Des 13. Quando for acertado por ataque corpo a corpo enquanto empunha arma de acuidade, pode usar reação para adicionar proficiência na CA.",
  "Durável": "Aumente Constituição em 1. Ao rolar Dados de Vida, recupera no mínimo 2x seu mod de Constituição (mínimo 2).",
  "Especialista em Besta": "Ignora propriedade de recarga de bestas. Estar a 1,5m de inimigo não impõe desvantagem. Ao atacar com arma de uma mão, pode usar bônus para atacar com besta de mão.",
  "Especialista em Furtividade": "Requer Des 13. Você pode tentar se esconder quando estiver levemente obscurecido. Errar ataque à distância escondido não revela sua posição. Penumbra não impõe desvantagem em Percepção.",
  "Especialista em Luta Agarrada": "Requer For 13. Vantagem em ataques contra criatura agarrada por você. Pode usar ação para imobilizar a criatura agarrada (ambos ficam impedidos).",
  "Explorador de Masmorras": "Vantagem em Sabedoria (Percepção) e Inteligência (Investigação) para achar portas secretas. Vantagem em resistência contra armadilhas. Resistência a dano de armadilhas. Viaja rápido sem penalidade.",
  "Iniciado em Magia": "Escolha Bardo, Clérigo, Druida, Feiticeiro, Bruxo ou Mago. Aprenda 2 truques e 1 magia de 1º nível (uma vez por dia longo).",
  "Investida Poderosa": "Quando usar a ação de Disparada, pode fazer um ataque corpo a corpo ou empurrar como ação bônus. Se mover 3m em linha reta, ganha +5 de dano ou empurra 3m.",
  "Linguista": "Aumente Inteligência em 1. Aprende 3 idiomas. Pode criar cifras escritas que requerem teste de Inteligência (CD = sua Int + proficiência) para decifrar.",
  "Líder Inspirador": "Requer Car 13. Gasta 10 min para inspirar 6 aliados. Eles ganham PV temporários igual ao seu nível + mod Carisma. Uma vez por descanso curto.",
  "Matador de Magos": "Reação para atacar criatura a 1,5m que conjure magia. Dano em mago concentrando impõe desvantagem no teste. Vantagem em resistência contra magias de criaturas a 1,5m.",
  "Mente Aguçada": "Aumente Inteligência em 1. Você sempre sabe onde é o norte, sabe o número de horas até o próximo nascer/pôr do sol e lembra de tudo que viu/ouviu no último mês.",
  "Mestre de Armadura Leve": "Aumente Força ou Destreza em 1. Ganha proficiência com armaduras leves.",
  "Mestre de Armadura Média": "Requer Armadura Média. Não tem desvantagem em Furtividade. Pode somar +3 de Destreza na CA em vez de +2.",
  "Mestre de Armadura Pesada": "Requer Armadura Pesada. Aumente Força em 1. Reduz dano de concussão, cortante e perfurante de armas não-mágicas em 3.",
  "Mestre de Armas": "Aumente Força ou Destreza em 1. Ganha proficiência em 4 armas à sua escolha.",
  "Mestre de Armas de Haste": "Ao atacar com glaive, alabarda ou bastão, pode usar bônus para ataque com cabo (1d4 concussão). Inimigos provocam oportunidade ao entrar no alcance.",
  "Mestre de Armas Grandes": "Ao fazer crítico ou reduzir criatura a 0, pode fazer ataque extra como bônus. Antes de atacar com arma pesada, pode escolher -5 no acerto para +10 no dano.",
  "Mestre de Escudo": "Se atacar, pode usar bônus para empurrar com escudo. Adiciona bônus de escudo em testes de Des contra magias. Se passar em save de Des para meio dano, não toma nenhum.",
  "Moderadamente Blindado": "Requer Armadura Leve. Aumente Força ou Destreza em 1. Ganha proficiência com armaduras médias e escudos.",
  "Móvel": "Aumente deslocamento em 3m. Dash em terreno difícil não custa extra. Se atacar criatura corpo a corpo, não provoca oportunidade dela neste turno.",
  "Observador": "Aumente Int ou Sab em 1. Se puder ver boca, entende o que é dito. +5 em Percepção e Investigação passivas.",
  "Perito": "Ganhe proficiência em 3 perícias ou ferramentas à sua escolha.",
  "Pesadamente Blindado": "Requer Armadura Média. Aumente Força em 1. Ganha proficiência com armaduras pesadas.",
  "Resiliente": "Aumente um atributo em 1. Ganhe proficiência em testes de resistência desse atributo.",
  "Robusto": "Seus pontos de vida máximos aumentam em 2x seu nível. A cada nível ganha +2 PV.",
  "Sentinela": "Ao acertar oportunidade, deslocamento do alvo vira 0. Provoca oportunidade mesmo se fizerem Desengajar. Se inimigo atacar outro alvo a 1,5m, você pode usar reação para atacar esse inimigo.",
  "Sortudo": "3 pontos de sorte por dia longo. Pode gastar 1 para rolar d20 adicional em ataque, teste ou resistência e escolher resultado. Pode usar para fazer inimigo rolar d20 extra e escolher."
};

export const CLASSES_DB: Record<string, { 
  dv: number; 
  sub: string[]; 
  subLevel: number; 
  slots: 'full' | 'half' | 'half-up' | 'pact' | null; 
  saves: string[]; 
  castingStat?: string;
  skillsCount: number;
  availableSkills: string[];
  magicSubclasses?: string[];
}> = {
  'Bárbaro': { 
    dv: 12, subLevel: 3, slots: null, saves: ['FOR', 'CON'], skillsCount: 2,
    availableSkills: ['adestrar', 'atletismo', 'intimidacao', 'natureza', 'percepcao', 'sobrevivencia'],
    sub: ['Caminho do Furioso', 'Caminho do Guerreiro Totêmico', 'Caminho do Guardião Ancestral', 'Caminho do Arauto da Tempestade', 'Caminho do Zelote', 'Caminho da Besta', 'Caminho da Magia Selvagem']
  },
  'Bardo': { 
    dv: 8, subLevel: 3, slots: 'full', saves: ['DES', 'CAR'], castingStat: 'cha', skillsCount: 3,
    availableSkills: ['acrobacia', 'adestrar', 'arcanismo', 'atletismo', 'atuacao', 'enganacao', 'furtividade', 'historia', 'intimidacao', 'intuicao', 'investigacao', 'medicina', 'natureza', 'percepcao', 'persuasao', 'prestidigitacao', 'religiao', 'sobrevivencia'],
    sub: ['Colégio do Conhecimento', 'Colégio da Bravura', 'Colégio do Glamour', 'Colégio das Espadas', 'Colégio dos Sussurros', 'Colégio da Eloquência', 'Colégio da Criação', 'Colégio dos Espíritos']
  },
  'Clérigo': { 
    dv: 8, subLevel: 1, slots: 'full', saves: ['SAB', 'CAR'], castingStat: 'wis', skillsCount: 2,
    availableSkills: ['historia', 'intuicao', 'medicina', 'persuasao', 'religiao'],
    sub: ['Domínio do Conhecimento', 'Domínio da Vida', 'Domínio da Luz', 'Domínio da Natureza', 'Domínio da Tempestade', 'Domínio da Trapaça', 'Domínio da Guerra', 'Domínio da Ordem', 'Domínio da Forja', 'Domínio do Crepúsculo']
  },
  'Druida': { 
    dv: 8, subLevel: 2, slots: 'full', saves: ['INT', 'SAB'], castingStat: 'wis', skillsCount: 2,
    availableSkills: ['adestrar', 'arcanismo', 'intuicao', 'medicina', 'natureza', 'percepcao', 'religiao', 'sobrevivencia'],
    sub: ['Círculo da Terra', 'Círculo da Lua', 'Círculo dos Sonhos', 'Círculo do Pastor', 'Círculo dos Esporos', 'Círculo das Estrelas', 'Círculo do Fogo Selvagem']
  },
  'Guerreiro': { 
    dv: 10, subLevel: 3, slots: null, saves: ['FOR', 'CON'], castingStat: 'int', skillsCount: 2,
    availableSkills: ['acrobacia', 'adestrar', 'atletismo', 'historia', 'intuicao', 'intimidacao', 'percepcao', 'sobrevivencia'],
    magicSubclasses: ['Cavaleiro Arcano'],
    sub: ['Campeão', 'Mestre de Batalha', 'Cavaleiro Arcano', 'Cavaleiro', 'Arqueiro Arcano', 'Samurai', 'Guerreiro Psíquico', 'Cavaleiro Rúnico']
  },
  'Monge': { 
    dv: 8, subLevel: 3, slots: null, saves: ['FOR', 'DES'], castingStat: 'wis', skillsCount: 2,
    availableSkills: ['acrobacia', 'atletismo', 'furtividade', 'historia', 'intuicao', 'religiao'],
    sub: ['Caminho da Mão Aberta', 'Caminho das Sombras', 'Caminho dos Quatro Elementos', 'Caminho da Alma Radiante', 'Caminho Kensei', 'Caminho da Misericórdia', 'Caminho do Eu Astral']
  },
  'Paladino': { 
    dv: 10, subLevel: 3, slots: 'half', saves: ['SAB', 'CAR'], castingStat: 'cha', skillsCount: 2,
    availableSkills: ['atletismo', 'intimidacao', 'intuicao', 'medicina', 'persuasao', 'religiao'],
    sub: ['Juramento de Devoção', 'Juramento dos Anciões', 'Juramento de Vingança', 'Juramento da Conquista', 'Juramento da Redenção', 'Juramento da Glória', 'Juramento da Vigilância']
  },
  'Patrulheiro': { 
    dv: 10, subLevel: 3, slots: 'half', saves: ['FOR', 'DES'], castingStat: 'wis', skillsCount: 3,
    availableSkills: ['adestrar', 'atletismo', 'furtividade', 'investigacao', 'natureza', 'percepcao', 'sobrevivencia'],
    sub: ['Caçador', 'Mestre das Bestas', 'Perseguidor Sombrio', 'Andarilho do Horizonte', 'Matador de Monstros', 'Andarilho das Fadas', 'Guardião do Enxame', 'Guardião de Dragão']
  },
  'Ladino': { 
    dv: 8, subLevel: 3, slots: null, saves: ['DES', 'INT'], castingStat: 'int', skillsCount: 4,
    availableSkills: ['acrobacia', 'atletismo', 'atuacao', 'enganacao', 'furtividade', 'intimidacao', 'intuicao', 'investigacao', 'percepcao', 'persuasao', 'prestidigitacao'],
    magicSubclasses: ['Trapaceiro Arcano'],
    sub: ['Ladrão', 'Assassino', 'Trapaceiro Arcano', 'Inquisitivo', 'Fanfarrão', 'Mestre de Estratégia', 'Fantasma', 'Lâmina Psíquica', 'Batedor']
  },
  'Feiticeiro': { 
    dv: 6, subLevel: 1, slots: 'full', saves: ['CON', 'CAR'], castingStat: 'cha', skillsCount: 2,
    availableSkills: ['arcanismo', 'enganacao', 'intuicao', 'intimidacao', 'persuasao', 'religiao'],
    sub: ['Linhagem Dracônica', 'Magia Selvagem', 'Magia da Tempestade', 'Alma Favorecida', 'Mente Aberrante', 'Feiticeiro de Relógio', 'Sombras']
  },
  'Bruxo': { 
    dv: 8, subLevel: 1, slots: 'pact', saves: ['SAB', 'CAR'], castingStat: 'cha', skillsCount: 2,
    availableSkills: ['arcanismo', 'enganacao', 'historia', 'intimidacao', 'investigacao', 'natureza', 'religiao'],
    sub: ['A Fada Rainha', 'Corruptor (Infernal)', 'Grande Antigo', 'Imortal (Undying)', 'Celestial', 'Hexblade', 'Insondável (Fathomless)', 'O Gênio', 'Morto-Vivo (Undead)']
  },
  'Mago': { 
    dv: 6, subLevel: 2, slots: 'full', saves: ['INT', 'SAB'], castingStat: 'int', skillsCount: 2,
    availableSkills: ['arcanismo', 'historia', 'intuicao', 'investigacao', 'medicina', 'religiao'],
    sub: ['Abjuração', 'Conjuração', 'Divinação', 'Encantamento', 'Evocação', 'Ilusão', 'Necromancia', 'Transmutação', 'Magia de Guerra', 'Cantoria da Lâmina', 'Ordem dos Scribas']
  },
  'Artífice': { 
    dv: 8, subLevel: 3, slots: 'half-up', saves: ['CON', 'INT'], castingStat: 'int', skillsCount: 2,
    availableSkills: ['arcanismo', 'historia', 'investigacao', 'medicina', 'natureza', 'percepcao', 'prestidigitacao'],
    sub: ['Alquimista', 'Artilheiro', 'Armeiro (Armorer)', 'Ferreiro de Batalha (Battle Smith)']
  },
  'Criatura': {
    dv: 10, subLevel: 0, slots: null, saves: ['FOR', 'CON'], skillsCount: 2,
    availableSkills: ['atletismo', 'percepcao', 'sobrevivencia', 'furtividade', 'adestrar'],
    sub: ['Monstruosidade', 'Aberração', 'Construto', 'Morto-Vivo', 'Elemental', 'Fada', 'Demônio']
  }
};

export const CLASS_FEATURES: Record<string, Record<number, string[]>> = {
  'Bárbaro': {
    1: ['Fúria', 'Defesa sem Armadura'], 2: ['Ataque Descuidado', 'Sentido de Perigo'], 3: ['Caminho Primitivo'], 4: ['Incremento de Atributo (ASI)'], 5: ['Ataque Extra', 'Movimento Rápido'],
    6: ['Caminho Primitivo'], 7: ['Instinto Selvagem'], 8: ['Incremento de Atributo (ASI)'], 9: ['Crítico Brutal (1 dado)'], 10: ['Caminho Primitivo'], 11: ['Fúria Implacável'], 12: ['Incremento de Atributo (ASI)'],
    13: ['Crítico Brutal (2 dados)'], 14: ['Caminho Primitivo'], 15: ['Fúria Persistente'], 16: ['Incremento de Atributo (ASI)'], 17: ['Crítico Brutal (3 dados)'], 18: ['Força Indomável'], 19: ['Incremento de Atributo (ASI)'], 20: ['Campeão Primitivo']
  },
  'Bardo': {
    1: ['Conjuração', 'Inspiração de Bardo (d6)'], 2: ['Pau pra Toda Obra', 'Canção de Descanso (d6)'], 3: ['Colégio de Bardo', 'Especialização'], 4: ['Incremento de Atributo (ASI)'], 5: ['Inspiração de Bardo (d8)', 'Fonte de Inspiração'],
    6: ['Contraencantamento', 'Colégio de Bardo'], 7: [], 8: ['Incremento de Atributo (ASI)'], 9: ['Canção de Descanso (d8)'], 10: ['Inspiração de Bardo (d10)', 'Especialização', 'Segredos Mágicos'], 11: [], 12: ['Incremento de Atributo (ASI)'], 
    13: ['Canção de Descanso (d10)'], 14: ['Segredos Mágicos', 'Colégio de Bardo'], 15: ['Inspiração de Bardo (d12)'], 16: ['Incremento de Atributo (ASI)'], 17: ['Canção de Descanso (d12)'], 18: ['Segredos Mágicos'], 19: ['Incremento de Atributo (ASI)'], 20: ['Inspiração Superior']
  },
  'Clérigo': {
    1: ['Conjuração', 'Domínio Divino'], 2: ['Canalizar Divindade (1/descanso)', 'Efeito do Domínio'], 3: [], 4: ['Incremento de Atributo (ASI)'], 5: ['Destruir Mortos-Vivos (ND 1/2)'],
    6: ['Canalizar Divindade (2/descanso)', 'Efeito do Domínio'], 7: [], 8: ['Incremento de Atributo (ASI)', 'Destruir Mortos-Vivos (ND 1)', 'Golpe Divino / Conjuração Potente'], 9: [], 10: ['Intervenção Divina'], 11: ['Destruir Mortos-Vivos (ND 2)'],
    12: ['Incremento de Atributo (ASI)'], 13: [], 14: ['Destruir Mortos-Vivos (ND 3)'], 15: [], 16: ['Incremento de Atributo (ASI)'], 17: ['Destruir Mortos-Vivos (ND 4)', 'Efeito do Domínio'], 18: ['Canalizar Divindade (3/descanso)'], 19: ['Incremento de Atributo (ASI)'], 20: ['Intervenção Divina Garantida']
  },
  'Druida': {
    1: ['Druídico', 'Conjuração'], 2: ['Forma Selvagem', 'Círculo Druídico'], 3: [], 4: ['Incremento de Atributo (ASI)', 'Forma Selvagem Aprimorada'], 5: [], 6: ['Círculo Druídico'], 7: [],
    8: ['Incremento de Atributo (ASI)', 'Forma Selvagem Aprimorada (Voo)'], 9: [], 10: ['Círculo Druídico'], 11: [], 12: ['Incremento de Atributo (ASI)'], 13: [], 14: ['Círculo Druídico'], 15: [], 16: ['Incremento de Atributo (ASI)'], 17: [],
    18: ['Corpo Atemporal', 'Magia da Natureza'], 19: ['Incremento de Atributo (ASI)'], 20: ['Arquidruida']
  },
  'Guerreiro': {
    1: ['Estilo de Luta', 'Retomar o Fôlego'], 2: ['Surto de Ação (1)'], 3: ['Arquétipo Marcial'], 4: ['Incremento de Atributo (ASI)'], 5: ['Ataque Extra'],
    6: ['Incremento de Atributo (ASI)'], 7: ['Arquétipo Marcial'], 8: ['Incremento de Atributo (ASI)'], 9: ['Indomável (1)'], 10: ['Arquétipo Marcial'], 11: ['Ataque Extra (2)'],
    12: ['Incremento de Atributo (ASI)'], 13: ['Indomável (2)'], 14: ['Incremento de Atributo (ASI)'], 15: ['Arquétipo Marcial'], 16: ['Incremento de Atributo (ASI)'], 17: ['Surto de Ação (2)', 'Indomável (3)'], 18: ['Arquétipo Marcial'], 19: ['Incremento de Atributo (ASI)'], 20: ['Ataque Extra (3)']
  },
  'Monge': {
    1: ['Defesa sem Armadura', 'Artes Marciais'], 2: ['Ki', 'Movimento sem Armadura'], 3: ['Tradição Monástica', 'Defletir Projéteis'], 4: ['Incremento de Atributo (ASI)', 'Queda Lenta'], 5: ['Ataque Extra', 'Ataque Atordoante'],
    6: ['Golpes de Ki', 'Tradição Monástica'], 7: ['Evasão', 'Mente Tranquila'], 8: ['Incremento de Atributo (ASI)'], 9: ['Movimento sem Armadura Aprimorado'], 10: ['Pureza Corporal'],
    11: ['Tradição Monástica'], 12: ['Incremento de Atributo (ASI)'], 13: ['Língua do Sol e da Lua'], 14: ['Alma de Diamante'], 15: ['Corpo Atemporal'], 16: ['Incremento de Atributo (ASI)'], 17: ['Tradição Monástica'], 18: ['Corpo Vazio'], 19: ['Incremento de Atributo (ASI)'], 20: ['Eu Perfeito']
  },
  'Paladino': {
    1: ['Sentido Divino', 'Cura pelas Mãos'], 2: ['Estilo de Luta', 'Conjuração', 'Destruição Divina (Smite)'], 3: ['Saúde Divina', 'Juramento Sagrado'], 4: ['Incremento de Atributo (ASI)'], 5: ['Ataque Extra'],
    6: ['Aura de Proteção'], 7: ['Característica do Juramento'], 8: ['Incremento de Atributo (ASI)'], 9: [], 10: ['Aura de Coragem'], 11: ['Destruição Divina Aprimorada'], 12: ['Incremento de Atributo (ASI)'],
    13: [], 14: ['Toque Purificador'], 15: ['Característica do Juramento'], 16: ['Incremento de Atributo (ASI)'], 17: [], 18: ['Aura Aprimorada (9m)'], 19: ['Incremento de Atributo (ASI)'], 20: ['Avatar Sagrado (Juramento)']
  },
  'Patrulheiro': {
    1: ['Inimigo Favorito', 'Explorador Natural'], 2: ['Estilo de Luta', 'Conjuração'], 3: ['Arquétipo de Patrulheiro'], 4: ['Incremento de Atributo (ASI)'], 5: ['Ataque Extra'],
    6: ['Inimigo Favorito/Explorador Aprimorados'], 7: ['Arquétipo de Patrulheiro'], 8: ['Incremento de Atributo (ASI)', 'Passo da Terra'], 9: [], 10: ['Camuflagem na Natureza'], 11: ['Arquétipo de Patrulheiro'],
    12: ['Incremento de Atributo (ASI)'], 13: [], 14: ['Desaparecer'], 15: ['Arquétipo de Patrulheiro'], 16: ['Incremento de Atributo (ASI)'], 17: [], 18: ['Sentidos Selvagens'], 19: ['Incremento de Atributo (ASI)'], 20: ['Caçador de Inimigos']
  },
  'Ladino': {
    1: ['Ataque Furtivo (1d6)', 'Gíria de Ladrão', 'Especialização'], 2: ['Ação Astuta'], 3: ['Arquétipo Ladino', 'Ataque Furtivo (2d6)'], 4: ['Incremento de Atributo (ASI)'], 5: ['Esquiva Sobrenatural', 'Ataque Furtivo (3d6)'],
    6: ['Especialização'], 7: ['Evasão', 'Ataque Furtivo (4d6)'], 8: ['Incremento de Atributo (ASI)'], 9: ['Arquétipo Ladino', 'Ataque Furtivo (5d6)'], 10: ['Incremento de Atributo (ASI)'],
    11: ['Talento Confiável', 'Ataque Furtivo (6d6)'], 12: ['Incremento de Atributo (ASI)'], 13: ['Arquétipo Ladino', 'Ataque Furtivo (7d6)'], 14: ['Sentido Cego'], 15: ['Mente Escorregadia', 'Ataque Furtivo (8d6)'], 16: ['Incremento de Atributo (ASI)'], 17: ['Arquétipo Ladino', 'Ataque Furtivo (9d6)'], 18: ['Elusivo'], 19: ['Incremento de Atributo (ASI)', 'Ataque Furtivo (10d6)'], 20: ['Golpe de Sorte']
  },
  'Feiticeiro': {
    1: ['Conjuração', 'Origem da Feitiçaria'], 2: ['Fonte de Magia (Pontos)'], 3: ['Metamagia'], 4: ['Incremento de Atributo (ASI)'], 5: [],
    6: ['Origem da Feitiçaria'], 7: [], 8: ['Incremento de Atributo (ASI)'], 9: [], 10: ['Metamagia'], 11: [], 12: ['Incremento de Atributo (ASI)'], 13: [], 14: ['Origem da Feitiçaria'], 15: [],
    16: ['Incremento de Atributo (ASI)'], 17: ['Metamagia'], 18: ['Origem da Feitiçaria'], 19: ['Incremento de Atributo (ASI)'], 20: ['Restauração de Feitiçaria']
  },
  'Bruxo': {
    1: ['Patrono Sobrenatural', 'Magia de Pacto'], 2: ['Invocações Místicas'], 3: ['Dádiva do Pacto'], 4: ['Incremento de Atributo (ASI)'], 5: ['Invocação Mística'],
    6: ['Patrono Sobrenatural'], 7: ['Invocação Mística'], 8: ['Incremento de Atributo (ASI)'], 9: ['Invocação Mística'], 10: ['Patrono Sobrenatural'],
    11: ['Arcanum Místico (6º círculo)'], 12: ['Incremento de Atributo (ASI)', 'Invocação Mística'], 13: ['Arcanum Místico (7º círculo)'], 14: ['Patrono Sobrenatural'], 15: ['Invocação Mística', 'Arcanum Místico (8º nível)'], 16: ['Incremento de Atributo (ASI)'], 17: ['Arcanum Místico (9º círculo)'], 18: ['Invocação Mística'], 19: ['Incremento de Atributo (ASI)'], 20: ['Mestre do Eldritch']
  },
  'Mago': {
    1: ['Conjuração', 'Recuperação Arcana'], 2: ['Tradição Arcana'], 3: [], 4: ['Incremento de Atributo (ASI)'], 5: [],
    6: ['Tradição Arcana'], 7: [], 8: ['Incremento de Atributo (ASI)'], 9: [], 10: ['Tradição Arcana'], 11: [], 12: ['Incremento de Atributo (ASI)'], 13: [], 14: ['Tradição Arcana'], 15: [],
    16: ['Incremento de Atributo (ASI)'], 17: [], 18: ['Domínio de Magia'], 19: ['Incremento de Atributo (ASI)'], 20: ['Assinatura Mágica']
  },
  'Artífice': {
    1: ['Engenhocas Mágicas', 'Conjuração'], 2: ['Infusão de Itens'], 3: ['Especialista em Artificaria', 'Ferramenta Certa pro Trabalho'], 4: ['Incremento de Atributo (ASI)'], 5: ['Especialista em Artificaria'],
    6: ['Especialização em Ferramentas'], 7: ['Lampejo de Genialidade'], 8: ['Incremento de Atributo (ASI)'], 9: ['Especialista em Artificaria'], 10: ['Adepto de Itens Mágicos'],
    11: ['Item Armazenador de Magia'], 12: ['Incremento de Atributo (ASI)'], 13: [], 14: ['Sábio de Itens Mágicos'], 15: ['Especialista em Artificaria'], 16: ['Incremento de Atributo (ASI)'], 17: [], 18: ['Mestre de Itens Mágicos'], 19: ['Incremento de Atributo (ASI)'], 20: ['Alma do Artifício']
  },
  'Criatura': {
    1: ['Traços de Criatura', 'Instintos Selvagens'], 2: ['Resistência Natural'], 3: [], 4: ['Evolução Súbita (ASI)'], 5: ['Ataque Extra'], 6: [], 7: [], 8: ['Evolução Súbita (ASI)'], 9: [], 10: ['Couraça Reforçada'], 11: [], 12: ['Evolução Súbita (ASI)'], 13: [], 14: [], 15: ['Frenesi Bestial'], 16: ['Evolução Súbita (ASI)'], 17: [], 18: [], 19: ['Evolução Súbita (ASI)'], 20: ['Avatar da Natureza']
  }
};

export const CONDITIONS_LIST = [
  { n: 'Caído', d: 'Ataques a 1.5m têm vantagem. Seus ataques têm desvantagem. Requer metade do movimento para levantar.' },
  { n: 'Envenenado', d: 'Desvantagem em jogadas de ataque e testes de atributo.' },
  { n: 'Incapacitado', d: 'Não pode realizar ações ou reações.' },
  { n: 'Invisível', d: 'Ataques contra você têm desvantagem. Seus ataques têm vantagem. Não pode ser visto sem magia.' },
  { n: 'Amedrontado', d: 'Desvantagem em testes e ataques enquanto a fonte do medo estiver na vista. Não pode se aproximar.' },
  { n: 'Paralisado', d: 'Incapacitado. Ataques a 1.5m são críticos automáticos. Falha automática em saves de For/Des.' },
  { n: 'Atordoado', d: 'Incapacitado. Falha automática em saves de For/Des. Ataques contra têm vantagem.' },
  { n: 'Contido', d: 'Deslocamento 0. Seus ataques têm desvantagem. Ataques contra têm vantagem. Desvantagem em saves de Destreza.' },
  { n: 'Agarrado', d: 'Deslocamento torna-se 0. Termina se o agarrador for incapacitado ou se um efeito remover você do alcance.' },
  { n: 'Cego', d: 'Falha automática em testes que requerem visão. Seus ataques têm desvantagem. Ataques contra têm vantagem.' },
  { n: 'Enfeitiçado', d: 'Não pode atacar quem o enfeitiçou. O encantador tem vantagem em interações sociais.' },
  { n: 'Exausto', d: 'Efeito acumulativo por níveis (1-6). Nv 6 é morte.' },
  { n: 'Inconsciente', d: 'Incapacitado. Larga o que estiver segurando. Falha automática em saves de For/Des. Ataques contra têm vantagem e são críticos se a 1.5m.' },
  { n: 'Petrificado', d: 'Transformado em substância inanimada sólida. Peso aumenta 10x. Não envelhece. Imune a veneno/doença.' },
  { n: 'Surdo', d: 'Falha automática em testes que requerem audição.' }
];

export const RACES_LIST = [
  "Criatura", "Aarakocra", "Aasimar Protetor", "Aasimar Flagelo", "Aasimar Caído", 
  "Anão da Colina", "Anão da Montanha", "Anão Cinzento (Duergar)",
  "Bugbear", "Centauro", "Changeling", "Draconato (Cromo)", "Draconato (Metal)",
  "Elfo Alto", "Elfo da Floresta", "Elfo Negro (Drow)", "Eladrin", "Elfo do Mar", "Shadar-kai",
  "Fada", "Firbolg", "Forjado Bélico", 
  "Genasi (Ar)", "Genasi (Água)", "Genasi (Fogo)", "Genasi (Terra)", 
  "Githyanki", "Githzerai", 
  "Gnomo da Floresta", "Gnomo das Rochas", "Gnomo das Profundezas", 
  "Goblin", "Golias", "Grung",
  "Halfling Pés-Leves", "Halfling Robusto", "Halfling Ghostwise",
  "Harengon", "Hexblood", "Hobgoblin", "Humano", "Humano Variante", "Kalashtar", "Kenku", 
  "Kobold", "Leonino", "Loxodonte", "Meio-Elfo", "Meio-Orc", "Minotauro", "Orc", 
  "Owlin", "Povo-Lagarto", "Sátiro", "Shifter", "Tabaxi", "Tiefling", "Tiefling Feral", 
  "Tiefling Devil Tongue", "Tiefling Alado", "Tortle", "Tritão", 
  "Vedalken", "Verdan", "Yuan-ti Puro-Sangue"
];

export const RACE_BONUSES: Record<string, { attrs?: Record<string, number>, ac?: number, speed?: string, skills?: string[], skillsCount?: number, availableSkills?: string[], traits?: string[] }> = {
  "Aarakocra": { attrs: { dex: 2, wis: 1 }, speed: "7.5m (Voo 15m)", traits: ["Voo (Aarakocra)", "Garras (Aarakocra)", "Lufada de Vento (Aarakocra)"] },
  "Aasimar Protetor": { attrs: { cha: 2, wis: 1 }, traits: ["Visão no Escuro (Traço)", "Mãos Curadoras", "Resistência Radiante", "Resistência Necrótica", "Luz Portadora"] },
  "Aasimar Flagelo": { attrs: { cha: 2, con: 1 }, traits: ["Visão no Escuro (Traço)", "Mãos Curadoras", "Resistência Radiante", "Resistência Necrótica", "Luz Portadora"] },
  "Aasimar Caído": { attrs: { cha: 2, str: 1 }, traits: ["Visão no Escuro (Traço)", "Mãos Curadoras", "Resistência Radiante", "Resistência Necrótica", "Luz Portadora"] },
  "Anão da Colina": { attrs: { con: 2, wis: 1 }, speed: "7.5m", traits: ["Visão no Escuro (Traço)", "Resiliência Anã", "Treinamento Anão em Combate", "Conhecimento de Pedreiro", "Robustez de Colina"] },
  "Anão da Montanha": { attrs: { con: 2, str: 2 }, speed: "7.5m", traits: ["Visão no Escuro (Traço)", "Resiliência Anã", "Treinamento Anão em Combate", "Conhecimento de Pedreiro", "Treinamento Anão em Armaduras"] },
  "Anão Cinzento (Duergar)": { attrs: { con: 2, str: 1 }, speed: "7.5m", traits: ["Visão no Escuro Superior", "Resiliência Duergar", "Guarda Duergar", "Sensibilidade à Luz Solar"] },
  "Bugbear": { attrs: { str: 2, dex: 1 }, traits: ["Visão no Escuro (Traço)", "Membros Longos", "Construção Poderosa", "Esgueirar-se", "Ataque Surpresa"] },
  "Centauro": { attrs: { str: 2, wis: 1 }, speed: "12m", traits: ["Cascos", "Investida (Centauro)", "Construção Poderosa"] },
  "Changeling": { attrs: { cha: 2 }, traits: ["Mudança de Forma", "Instintos Mutáveis"] },
  "Draconato (Cromo)": { attrs: { str: 2, cha: 1 }, traits: ["Ancestralidade Dracônica (Cromo)", "Arma de Sopro", "Resistência a Dano"] },
  "Draconato (Metal)": { attrs: { str: 2, cha: 1 }, traits: ["Ancestralidade Dracônica (Metal)", "Arma de Sopro", "Resistência a Dano"] },
  "Elfo Alto": { attrs: { dex: 2, int: 1 }, traits: ["Visão no Escuro (Traço)", "Ancestralidade Feérica", "Transe", "Sentidos Aguçados", "Treinamento Armado Élfico", "Truque de Mago"] },
  "Elfo da Floresta": { attrs: { dex: 2, wis: 1 }, speed: "10.5m", traits: ["Visão no Escuro (Traço)", "Ancestralidade Feérica", "Transe", "Sentidos Aguçados", "Máscara da Natureza", "Treinamento Armado Élfico", "Pés Ligeiros"] },
  "Elfo Negro (Drow)": { attrs: { dex: 2, cha: 1 }, traits: ["Visão no Escuro Superior", "Ancestralidade Feérica", "Transe", "Sentidos Aguçados", "Globos de Luz (Drow)", "Sensibilidade à Luz Solar", "Treinamento com Armas Drow"] },
  "Eladrin": { attrs: { dex: 2, cha: 1 }, traits: ["Visão no Escuro (Traço)", "Ancestralidade Feérica", "Transe", "Sentidos Aguçados", "Passo Feérico"] },
  "Elfo do Mar": { attrs: { dex: 2, con: 1 }, speed: "9m (Natação 9m)", traits: ["Visão no Escuro (Traço)", "Ancestralidade Feérica", "Transe", "Respiração Anfíbia", "Amigo do Mar"] },
  "Shadar-kai": { attrs: { dex: 2, con: 1 }, traits: ["Visão no Escuro (Traço)", "Ancestralidade Feérica", "Transe", "Bênção da Rainha Corvo"] },
  "Fada": { attrs: { cha: 2 }, traits: ["Voo de Fada", "Passagem Feérica", "Druidismo (Fada)"] },
  "Firbolg": { attrs: { wis: 2, str: 1 }, traits: ["Magia de Firbolg", "Passo Oculto", "Fala das Bestas e Folhas", "Construção Poderosa"] },
  "Genasi (Ar)": { attrs: { con: 2, dex: 1 }, traits: ["Sopro Interminável", "Toque Chocante (Genasi)", "Resistência a Relâmpago"] },
  "Genasi (Água)": { attrs: { con: 2, wis: 1 }, speed: "9m (Natação 9m)", traits: ["Anfíbio", "Espirro Ácido (Genasi)", "Resistência a Ácido"] },
  "Genasi (Fogo)": { attrs: { con: 2, int: 1 }, traits: ["Visão no Escuro (Traço Fogo)", "Resistência ao Fogo", "Produzir Chama (Genasi)"] },
  "Genasi (Terra)": { attrs: { con: 2, str: 1 }, traits: ["Caminhar sobre a Terra", "Proteção contra Lâminas (Ação Bônus)"] },
  "Githyanki": { attrs: { str: 2, int: 1 }, traits: ["Maestria Astral", "Resistência a Psíquico", "Mãos Mágicas (Githyanki)"] },
  "Githzerai": { attrs: { wis: 2, int: 1 }, traits: ["Fortaleza Mental Githzerai", "Mãos Mágicas (Githzerai)"] },
  "Gnomo da Floresta": { attrs: { int: 2, dex: 1 }, traits: ["Visão no Escuro (Traço)", "Astúcia Gnômica", "Ilusionista Natural", "Ilusão Menor (Gnomo)"] },
  "Gnomo das Rochas": { attrs: { int: 2, con: 1 }, traits: ["Visão no Escuro (Traço)", "Astúcia Gnômica", "Conhecimento de Artífice", "Engenhoca"] },
  "Gnomo das Profundezas": { attrs: { int: 2, dex: 1 }, traits: ["Visão no Escuro Superior", "Astúcia Gnômica", "Camuflagem Rochosa"] },
  "Goblin": { attrs: { dex: 2, con: 1 }, traits: ["Visão no Escuro (Traço)", "Ancestralidade Feérica", "Fúria dos Pequenos", "Escape Ágil"] },
  "Golias": { attrs: { str: 2, con: 1 }, traits: ["Resistência da Pedra", "Atleta Natural", "Construção Poderosa", "Resistência a Frio"] },
  "Grung": { attrs: { dex: 2, con: 1 }, speed: "7.5m (Escalada 7.5m)", traits: ["Anfíbio", "Pele Venenosa", "Salto em Pé", "Imunidade a Veneno"] },
  "Halfling Pés-Leves": { attrs: { dex: 2, cha: 1 }, speed: "7.5m", traits: ["Sortudo", "Bravura", "Agilidade Halfling", "Furtividade Natural"] },
  "Halfling Robusto": { attrs: { dex: 2, con: 1 }, speed: "7.5m", traits: ["Sortudo", "Bravura", "Agilidade Halfling", "Resistência a Veneno"] },
  "Halfling Ghostwise": { attrs: { dex: 2, wis: 1 }, speed: "7.5m", traits: ["Sortudo", "Bravura", "Agilidade Halfling", "Fala Silenciosa"] },
  "Harengon": { attrs: { dex: 1, con: 1, cha: 1 }, traits: ["Iniciativa de Lebre", "Salto de Coelho", "Jogo de Pernas"] },
  "Hexblood": { attrs: { cha: 2 }, traits: ["Sinal Eletrizante", "Magia de Megera (Disfarçar-se)", "Magia de Megera (Mau-Olhado)"] },
  "Hobgoblin": { attrs: { con: 2, int: 1 }, traits: ["Visão no Escuro (Traço)", "Ancestralidade Feérica", "Dádiva da Fartura (Ajuda)"] },
  "Humano": { attrs: { str: 1, dex: 1, con: 1, int: 1, wis: 1, cha: 1 } },
  "Humano Variante": { attrs: { str: 1, dex: 1 }, skillsCount: 1, availableSkills: ['acrobacia', 'adestrar', 'arcanismo', 'atletismo', 'atuacao', 'enganacao', 'furtividade', 'historia', 'intimidacao', 'intuicao', 'investigacao', 'medicina', 'natureza', 'percepcao', 'persuasao', 'prestidigitacao', 'religiao', 'sobrevivencia'], traits: ["Talento Inato"] },
  "Kalashtar": { attrs: { wis: 2, cha: 1 }, traits: ["Conexão Dupla", "Disciplina Mental"] },
  "Kenku": { attrs: { dex: 2, wis: 1 }, skillsCount: 2, availableSkills: ['acrobacia', 'enganacao', 'furtividade', 'prestidigitacao'], traits: ["Lembrança Especialista", "Mimetismo"] },
  "Kobold": { attrs: { dex: 2 }, traits: ["Visão no Escuro (Traço)", "Grito Dracônico", "Legado Dracônico"] },
  "Leonino": { attrs: { con: 2, str: 1 }, speed: "10.5m", traits: ["Rugido Assustador", "Garras"] },
  "Loxodonte": { attrs: { con: 2, wis: 1 }, ac: 12, traits: ["Armadura Natural (Loxodonte)", "Tromba Versátil", "Vantagem contra Medo/Encanto"] },
  "Meio-Elfo": { attrs: { cha: 2, dex: 1, wis: 1 }, skillsCount: 2, availableSkills: ['acrobacia', 'adestrar', 'arcanismo', 'atletismo', 'atuacao', 'enganacao', 'furtividade', 'historia', 'intimidacao', 'intuicao', 'investigacao', 'medicina', 'natureza', 'percepcao', 'persuasao', 'prestidigitacao', 'religiao', 'sobrevivencia'], traits: ["Visão no Escuro (Traço)", "Ancestralidade Feérica", "Versatilidade em Perícias"] },
  "Meio-Orc": { attrs: { str: 2, con: 1 }, skills: ["intimidacao"], traits: ["Visão no Escuro (Traço)", "Tolerância Infindável", "Ataque Selvagem", "Ameaçador"] },
  "Minotauro": { attrs: { str: 2, con: 1 }, traits: ["Chifres", "Investida com Chifres", "Martelada", "Presença Imponente"] },
  "Orc": { attrs: { str: 2, con: 1 }, traits: ["Visão no Escuro (Traço)", "Tolerância Implacável", "Corrida de Adrenalina", "Construção Poderosa"] },
  "Owlin": { attrs: { dex: 2, wis: 1 }, speed: "9m (Voo 9m)", skills: ["furtividade"], traits: ["Visão no Escuro (Traço 36m)", "Voo Silencioso"] },
  "Povo-Lagarto": { attrs: { con: 2, wis: 1 }, ac: 13, skillsCount: 2, availableSkills: ['adestrar', 'atletismo', 'natureza', 'percepcao', 'furtividade', 'sobrevivencia'], traits: ["Mordida (Racial)", "Artesão Ágil", "Prender o Fôlego", "Mandíbulas Famintas"] },
  "Sátiro": { attrs: { cha: 2, dex: 1 }, speed: "10.5m", skills: ["persuasao", "atuacao"], traits: ["Chifradas", "Ancestralidade Feérica", "Saltos Mirabolantes", "Resistência à Magia"] },
  "Shifter": { attrs: { str: 2, dex: 1 }, traits: ["Visão no Escuro (Traço)", "Mudança de Forma (Shifter)"] },
  "Tabaxi": { attrs: { dex: 2, cha: 1 }, speed: "9m (Escalada 9m)", skills: ["percepcao", "furtividade"], traits: ["Visão no Escuro (Traço)", "Agilidade Felina", "Garras de Gato"] },
  "Tiefling": { attrs: { cha: 2, int: 1 }, traits: ["Visão no Escuro (Traço)", "Resistência Infernal", "Taumaturgia (Tiefling)"] },
  "Tiefling Feral": { attrs: { dex: 2, int: 1 }, traits: ["Visão no Escuro (Traço)", "Resistência Infernal", "Taumaturgia (Tiefling)"] },
  "Tiefling Devil Tongue": { attrs: { cha: 2, int: 1 }, traits: ["Visão no Escuro (Traço)", "Resistência Infernal", "Zombaria Viciosa (Tiefling)"] },
  "Tiefling Alado": { attrs: { cha: 2, int: 1 }, speed: "9m (Voo 9m)", traits: ["Visão no Escuro (Traço)", "Resistência Infernal", "Asas"] },
  "Tortle": { attrs: { str: 2, wis: 1 }, ac: 17, speed: "9m", traits: ["Garras (Tortle)", "Prender o Fôlego", "Armadura Natural (Tortle)", "Defesa da Casca"] },
  "Tritão": { attrs: { str: 1, con: 1, cha: 1 }, traits: ["Anfíbio", "Emissário do Mar", "Névoa Obscurecente (Tritão)"] },
  "Vedalken": { attrs: { int: 2, wis: 1 }, traits: ["Desprendimento Vedalken", "Precisão Vedalken"] },
  "Verdan": { attrs: { cha: 2, con: 1 }, traits: ["Cura Telepática", "Sangue Negro Verdan"] },
  "Yuan-ti Puro-Sangue": { attrs: { cha: 2, int: 1 }, traits: ["Visão no Escuro (Traço)", "Conjuração Inata (Yuan-ti)", "Resistência à Magia", "Imunidade a Veneno"] }
};

export const SKILL_LIST = [
  { id: 'acrobacia', n: 'Acrobacia', a: 'dex' },
  { id: 'adestrar', n: 'Adestrar Animais', a: 'wis' },
  { id: 'arcanismo', n: 'Arcanismo', a: 'int' },
  { id: 'atletismo', n: 'Atletismo', a: 'str' },
  { id: 'atuacao', n: 'Atuação', a: 'cha' },
  { id: 'enganacao', n: 'Enganação', a: 'cha' },
  { id: 'furtividade', n: 'Furtividade', a: 'dex' },
  { id: 'historia', n: 'História', a: 'int' },
  { id: 'intimidacao', n: 'Intimidação', a: 'cha' },
  { id: 'intuicao', n: 'Intuição', a: 'wis' },
  { id: 'investigacao', n: 'Investigação', a: 'int' },
  { id: 'medicina', n: 'Medicina', a: 'wis' },
  { id: 'natureza', n: 'Natureza', a: 'int' },
  { id: 'percepcao', n: 'Percepção', a: 'wis' },
  { id: 'persuasao', n: 'Persuasão', a: 'cha' },
  { id: 'prestidigitacao', n: 'Prestidigitação', a: 'dex' },
  { id: 'religiao', n: 'Religião', a: 'int' },
  { id: 'sobrevivencia', n: 'Sobrevivência', a: 'wis' }
];

export const CLASS_STARTING_EQUIPMENT: Record<string, string[]> = {
  'Bárbaro': ['Machado Grande', 'Machadinha (x2)', 'Pacote de Explorador', 'Azagaia (x4)'],
  'Bardo': ['Estoque', 'Pacote de Artista', 'Lute (Alaúde)', 'Armadura de Couro', 'Adaga'],
  'Clérigo': ['Maça', 'Cota de Malha', 'Besta Leve', 'Pacote do Sacerdote', 'Escudo', 'Símbolo Sagrado'],
  'Druida': ['Escudo de Madeira', 'Cimitarra', 'Armadura de Couro', 'Pacote do Explorador', 'Foco Druídico'],
  'Guerreiro': ['Cota de Malha', 'Espada Longa & Escudo', 'Besta Leve', 'Pacote de Masmorreiro'],
  'Monge': ['Espada Curta', 'Pacote de Masmorreiro', 'Dardo (x10)'],
  'Paladino': ['Espada Longa & Escudo', 'Azagaia (x5)', 'Pacote de Explorador', 'Cota de Malha', 'Símbolo Sagrado'],
  'Patrulheiro': ['Armadura de Escamas', 'Espada Curta (x2)', 'Pacote de Explorador', 'Arco Longo (20 Flechas)'],
  'Ladino': ['Estoque', 'Arco Curto (20 Flechas)', 'Pacote de Assaltante', 'Armadura de Couro', 'Adaga (x2)', 'Ferramentas de Ladrão'],
  'Feiticeiro': ['Besta Leve', 'Foco Arcano', 'Pacote de Masmorreiro', 'Adaga (x2)'],
  'Bruxo': ['Besta Leve', 'Foco Arcano', 'Pacote de Estudioso', 'Armadura de Couro', 'Arma Simples', 'Adaga (x2)'],
  'Mago': ['Bordão', 'Foco Arcano', 'Pacote de Estudioso', 'Grimório'],
  'Artífice': ['Martelo de Guerra', 'Besta Leve', 'Armadura de Couro Batido', 'Ferramentas de Ladrão', 'Pacote de Masmorreiro']
};

export const PACT_SLOTS: Record<number, {count: number, level: number}> = {
  1: { count: 1, level: 1 },
  2: { count: 2, level: 1 },
  3: { count: 2, level: 2 },
  4: { count: 2, level: 2 },
  5: { count: 2, level: 3 },
  6: { count: 2, level: 3 },
  7: { count: 2, level: 4 },
  8: { count: 2, level: 4 },
  9: { count: 2, level: 5 },
  10: { count: 2, level: 5 },
  11: { count: 3, level: 5 },
  12: { count: 3, level: 5 },
  13: { count: 3, level: 5 },
  14: { count: 3, level: 5 },
  15: { count: 3, level: 5 },
  16: { count: 3, level: 5 },
  17: { count: 4, level: 5 },
  18: { count: 4, level: 5 },
  19: { count: 4, level: 5 },
  20: { count: 4, level: 5 }
};

export const SLOTS_TABLE: Record<number, number[]> = {
  1: [2, 0, 0, 0, 0, 0, 0, 0, 0],
  2: [3, 0, 0, 0, 0, 0, 0, 0, 0],
  3: [4, 2, 0, 0, 0, 0, 0, 0, 0],
  4: [4, 3, 0, 0, 0, 0, 0, 0, 0],
  5: [4, 3, 2, 0, 0, 0, 0, 0, 0],
  6: [4, 3, 3, 0, 0, 0, 0, 0, 0],
  7: [4, 3, 3, 1, 0, 0, 0, 0, 0],
  8: [4, 3, 3, 2, 0, 0, 0, 0, 0],
  9: [4, 3, 3, 3, 1, 0, 0, 0, 0],
  10: [4, 3, 3, 3, 2, 0, 0, 0, 0],
  11: [4, 3, 3, 3, 2, 1, 0, 0, 0],
  12: [4, 3, 3, 3, 2, 1, 0, 0, 0],
  13: [4, 3, 3, 3, 2, 1, 1, 0, 0],
  14: [4, 3, 3, 3, 2, 1, 1, 0, 0],
  15: [4, 3, 3, 3, 2, 1, 1, 1, 0],
  16: [4, 3, 3, 3, 2, 1, 1, 1, 0],
  17: [4, 3, 3, 3, 2, 1, 1, 1, 1],
  18: [4, 3, 3, 3, 3, 1, 1, 1, 1],
  19: [4, 3, 3, 3, 3, 2, 1, 1, 1],
  20: [4, 3, 3, 3, 3, 2, 2, 1, 1]
};

export const BACKGROUNDS_DB: Record<string, { skills: string[]; feature: string }> = {
  'Criatura': { skills: [], feature: 'Essência vital de um ser não-aventureiro.' },
  'Acólito': { skills: ['intuicao', 'religiao'], feature: 'Abrigo do Fiel' },
  'Artesão de Guilda': { skills: ['intuicao', 'persuasao'], feature: 'Membro de Guilda' },
  'Artista': { skills: ['acrobacia', 'atuacao'], feature: 'Aclamado pelo Povo' },
  'Charlatão': { skills: ['enganacao', 'prestidigitacao'], feature: 'Identidade Falsa' },
  'Criminoso': { skills: ['enganacao', 'furtividade'], feature: 'Contato Criminal' },
  'Eremita': { skills: ['medicina', 'religiao'], feature: 'Descoberta' },
  'Forasteiro': { skills: ['atletismo', 'sobrevivencia'], feature: 'Andarilho' },
  'Herói do Povo': { skills: ['adestrar', 'sobrevivencia'], feature: 'Hospitalidade Rústica' },
  'Marinheiro': { skills: ['atletismo', 'percepcao'], feature: 'Passagem de Navio' },
  'Nobre': { skills: ['historia', 'persuasao'], feature: 'Posição de Privilégio' },
  'Órfão': { skills: ['prestidigitacao', 'furtividade'], feature: 'Segredos da Cidade' },
  'Sábio': { skills: ['arcanismo', 'historia'], feature: 'Pesquisador' },
  'Soldado': { skills: ['atletismo', 'intimidacao'], feature: 'Patente Militar' }
};

export const SPELLS_DB: Record<string, { 
    level: string, 
    desc: string, 
    school?: string,
    castingTime?: string, 
    range?: string, 
    components?: string, 
    duration?: string, 
    concentration?: boolean 
}> = {
  "Dardo de Fogo": { 
    level: "Truque", 
    school: "Evocação", 
    desc: "Você aponta seu dedo para uma criatura ou objeto dentro do alcance e libera um projétil de chamas sibilantes. Faça uma jogada de ataque de magia à distância contra o alvo. Se acertar, o alvo sofre 1d10 de dano de fogo. Um objeto inflamável atingido por esta magia incendeia se não estiver sendo usado ou carregado. Esta magia canaliza a energia bruta do Plano Elemental do Fogo.\n\n**Em Níveis Superiores:** O dano desta magia aumenta em 1d10 quando você alcança o 5° nível (2d10), 11° nível (3d10) e 17° nível (4d10).", 
    castingTime: "1 Ação", 
    range: "36m", 
    components: "V, S", 
    duration: "Instantânea", 
    concentration: false 
  },
  "Explosão Mística": { 
    level: "Truque", 
    school: "Evocação", 
    desc: "Um feixe de energia arcana crepitante e violenta dispara em direção a uma criatura. Faça uma jogada de ataque de magia à distância contra o alvo. Se acertar, o alvo sofre 1d10 de dano de força, sentindo o impacto de um martelo invisível. Esta magia é a assinatura dos pactos mais sombrios.\n\n**Em Níveis Superiores:** A magia cria mais de um feixe quando você alcança níveis mais altos: dois feixes no 5º nível, três feixes no 11º nível e quatro feixes no 17º nível. Você pode direcionar os feixes para o mesmo alvo ou para alvos diferentes. Faça uma jogada de ataque separada para cada feixe.", 
    castingTime: "1 Ação", 
    range: "36m", 
    components: "V, S", 
    duration: "Instantânea", 
    concentration: false 
  },
  "Chama Sagrada": { level: "Truque", school: "Evocação", desc: "Radiação divina semelhante a chamas desce sobre uma criatura que você possa ver dentro do alcance. O alvo deve ser bem-sucedido em um teste de resistência de Destreza ou sofrerá 1d8 de dano radiante. O alvo não recebe nenhum benefício de cobertura contra esse teste de resistência. O dano da magia aumenta em 1d8 quando você alcança o 5° nível (2d8), 11° nível (3d8) e 17° nível (4d8).", castingTime: "1 Ação", range: "18m", components: "V, S", duration: "Instantânea", concentration: false },
  "Sinos dos Mortos": { level: "Truque", school: "Necromancia", desc: "Você aponta para uma criatura que pode ver dentro do alcance e o som de um sino melancólico e lúgubre preenche o ar ao redor dela por um momento. O alvo deve ser bem-sucedido em um teste de resistência de Sabedoria ou sofrerá 1d8 de dano necrótico. Se o alvo estiver com menos que o seu total de pontos de vida máximo, ele sofre 1d12 de dano necrótico em vez disso. O dano da magia aumenta em um dado quando você alcança o 5° nível (2d8 ou 2d12), 11° nível (3d8 ou 3d12) e 17° nível (4d8 ou 4d12).", castingTime: "1 Ação", range: "18m", components: "V, S", duration: "Instantânea", concentration: false },
  "Toque Arrepiante": { level: "Truque", school: "Necromancia", desc: "Você cria uma mão esquelética e fantasmagórica no espaço de uma criatura dentro do alcance. Faça uma jogada de ataque de magia à distância contra a criatura para atingi-la com o frio do túmulo. Se acertar, o alvo sofre 1d8 de dano necrótico e não pode recuperar pontos de vida até o início do seu próximo turno. Até lá, a mão se prende ao alvo. Se você atingir um alvo morto-vivo, ele também terá desvantagem nas jogadas de ataque contra você até o final do seu próximo turno. O dano aumenta em 1d8 no 5° (2d8), 11° (3d8) e 17° (4d8) níveis.", castingTime: "1 Ação", range: "36m", components: "V, S", duration: "1 rodada", concentration: false },
  "Raio de Gelo": { level: "Truque", school: "Evocação", desc: "Um raio gélido de luz azul-esbranquiçada dispara em direção a uma criatura dentro do alcance. Faça uma jogada de ataque de magia à distância contra o alvo. Se acertar, ele sofre 1d8 de dano de frio e seu deslocamento é reduzido em 3 metros até o início do seu próximo turno. O dano da magia aumenta em 1d8 quando você alcança o 5° nível (2d8), 11° nível (3d8) e 17° nível (4d8).", castingTime: "1 Ação", range: "18m", components: "V, S", duration: "Instantânea", concentration: false },
  "Toque Chocante": { level: "Truque", school: "Evocação", desc: "Relâmpagos saltam da sua mão para desferir um choque em uma criatura que você tentar tocar. Faça uma jogada de ataque de magia corpo-a-corpo contra o alvo. Você tem vantagem na jogada de ataque se o alvo estiver vestindo qualquer armadura feita de metal. Se acertar, o alvo sofre 1d8 de dano elétrico e não pode realizar reações até o início do próximo turno dele. O dano aumenta em 1d8 no 5° (2d8), 11° (3d8) e 17° (4d8) níveis.", castingTime: "1 Ação", range: "Toque", components: "V, S", duration: "Instantânea", concentration: false },
  "Zombaria Viciosa": { level: "Truque", school: "Encantamento", desc: "Você lança uma série de insultos imbuídos de sutis encantamentos em uma criatura que você possa ver dentro do alcance. Se o alvo puder ouvir você (ele não precisa entender você), ele deve ser bem-sucedido em um teste de resistência de Sabedoria ou sofrerá 1d4 de dano psíquico e terá desvantagem na próxima jogada de ataque que fizer antes do final do próximo turno dele. O dano da magia aumenta em 1d4 no 5° (2d4), 11° (3d4) e 17° (4d4) níveis.", castingTime: "1 Ação", range: "18m", components: "V", duration: "Instantânea", concentration: false },
  "Lâmina Estrondosa": { level: "Truque", school: "Evocação", desc: "Como parte da ação usada para conjurar esta magia, você deve realizar um ataque corpo-a-corpo com uma arma contra uma criatura dentro do alcance da magia, caso contrário a magia falha. Se acertar, o alvo sofre os efeitos normais do ataque e fica envolto em energia trovejante até o início do seu próximo turno. Se o alvo se mover voluntariamente antes disso, ele sofre imediatamente 1d8 de dano trovejante e a magia termina. O dano aumenta nos níveis 5, 11 e 17.", castingTime: "1 Ação", range: "1,5m", components: "S, M (Uma arma)", duration: "1 rodada", concentration: false },
  "Lâmina de Chama Verde": { level: "Truque", school: "Evocação", desc: "Como parte da ação usada para conjurar esta magia, você deve realizar um ataque corpo-a-corpo com uma arma contra uma criatura dentro do alcance da magia, caso contrário a magia falha. Se acertar, o alvo sofre os efeitos normais do ataque e chamas verdes saltam do alvo para uma criatura diferente, à sua escolha, que você possa ver a até 1,5 metro dele. A segunda criatura sofre dano de fogo igual ao seu modificador de atributo de conjuração. O dano aumenta nos níveis 5, 11 e 17.", castingTime: "1 Ação", range: "1,5m", components: "S, M (Uma arma)", duration: "Instantânea", concentration: false },
  "Golpe Certeiro": { level: "Truque", school: "Adivinhação", desc: "Você estende sua mão e aponta o dedo para um alvo que você possa ver dentro do alcance. Sua magia concede a você um breve vislumbre das defesas do alvo. Na sua próxima rodada, você tem vantagem na primeira jogada de ataque que realizar contra o alvo, desde que esta magia ainda não tenha terminado.", castingTime: "1 Ação", range: "9m", components: "S", duration: "Concentração, até 1 rodada", concentration: true },
  "Estabilizar": { level: "Truque", school: "Abjuração", desc: "Você toca uma criatura viva que esteja com 0 pontos de vida. A criatura torna-se estável. Esta magia não tem efeito sobre mortos-vivos ou construtos.", castingTime: "1 Ação", range: "Toque", components: "V, S", duration: "Instantânea", concentration: false },
  "Ilusão Menor": { level: "Truque", school: "Ilusão", desc: "Você cria um som ou uma imagem de um objeto dentro do alcance que dura pela duração. Se for um som, o volume pode variar de um sussurro a um grito. Se for uma imagem, ela deve caber em um cubo de 1,5m e não pode criar som, luz ou cheiro. A ilusão termina se você a conjurar novamente ou usar uma ação para dissipá-la.", castingTime: "1 Ação", range: "9m", components: "S, M", duration: "1 minuto", concentration: false },
  "Luz": { level: "Truque", school: "Evocação", desc: "Você toca um objeto que não seja maior que 3 metros em qualquer dimensão. Até a magia acabar, o objeto emite luz plena num raio de 6 metros e penumbra por mais 6 metros adicionais. A luz pode ter a cor que você desejar. Cobrir o objeto completamente com algo opaco bloqueia a luz. A magia termina se você a conjurar novamente ou se a dissipar como uma ação.", castingTime: "1 Ação", range: "Toque", components: "V, M (Um pirilampo ou musgo fosforescente)", duration: "1 hora", concentration: false },
  "Mãos Mágicas": { level: "Truque", school: "Conjuração", desc: "Uma mão espectral e flutuante aparece em um ponto à sua escolha dentro do alcance. A mão permanece pela duração ou até que você a dispense como uma ação. A mão desaparece se estiver a mais de 9 metros de você ou se você conjurar esta magia novamente. Você pode usar sua ação para controlar a mão. Você pode usar a mão para manipular um objeto, abrir uma porta ou recipiente destrancado, guardar ou retirar um item de um recipiente aberto, ou derramar o conteúdo de um frasco. Você pode mover a mão até 9 metros cada vez que a utiliza. A mão não pode atacar, ativar itens mágicos ou carregar mais de 5 quilos.", castingTime: "1 Ação", range: "9m", components: "V, S", duration: "1 minuto", concentration: false },
  "Prestidigitação": { level: "Truque", school: "Transmutação", desc: "Esta magia é um truque mágico leve que conjuradores aprendizes utilizam para praticar. Você cria um dos seguintes efeitos mágicos dentro do alcance: um efeito sensorial instantâneo e inofensivo; você instantaneamente acende ou apaga uma vela, uma tocha ou uma fogueira pequena; você limpa ou suja instantaneamente um objeto de até 0,3 metros cubicos; você resfria, aquece ou tempera material inanimado por 1 hora; você faz uma cor, uma pequena marca ou um símbolo aparecer em um objeto ou superfície por 1 hora; ou você cria uma bugiganga não-mágica ou uma imagem ilusória que cabe na sua mão e dura até o final do seu próximo turno.", castingTime: "1 Ação", range: "3m", components: "V, S", duration: "Até 1 hora", concentration: false },
  "Estilhaço Mental": { level: "Truque", school: "Encantamento", desc: "Você finca um pico de energia psíquica na mente de uma criatura que você possa ver dentro do alcance. O alvo deve ser bem-sucedido em um teste de resistência de Inteligência ou sofrerá 1d6 de dano psíquico e subtrairá 1d4 da próxima jogada de teste de resistência que fizer antes do final do seu próximo turno. O dano aumenta em 1d6 no 5° (2d6), 11° (3d6) e 17° (4d6) níveis.", castingTime: "1 Ação", range: "18m", components: "V, S", duration: "Instantânea", concentration: false },
  "Mordida de Gelo": { level: "Truque", school: "Evocação", desc: "Você cria um frio entorpecente em torno de uma criatura que você possa ver dentro do alcance. O alvo deve ser bem-sucedido em um teste de resistência de Constituição ou sofrerá 1d6 de dano de frio e terá desvantagem na próxima jogada de ataque com arma que fizer antes do final do seu próximo turno. O dano aumenta em 1d6 no 5° (2d6), 11° (3d6) e 17° (4d6) níveis.", castingTime: "1 Ação", range: "18m", components: "V, S", duration: "Instantânea", concentration: false },
  "Infestação": { level: "Truque", school: "Conjuração", desc: "Você faz com que ácaros, pulgas e outros parasitas irritantes apareçam momentaneamente em uma criatura que você possa ver dentro do alcance. O alvo deve ser bem-sucedido em um teste de resistência de Constituição ou sofrerá 1d6 de dano de veneno e se moverá 1,5 metro em uma direção aleatória se o deslocamento dele for maior que 0. Para determinar a direção, role um d4: 1, norte; 2, sul; 3, leste; ou 4, oeste. O movimento não provoca ataques de oportunidade. O dano aumenta em 1d6 no 5° (2d6), 11° (3d6) e 17° (4d6) níveis.", castingTime: "1 Ação", range: "9m", components: "V, S, M (Uma gota de urina de rato)", duration: "Instantânea", concentration: false },
  "Estalo Trovejante": { level: "Truque", school: "Evocação", desc: "Você cria um estouro de som trovejante que pode ser ouvido a até 30 metros de distância. Cada criatura a até 1,5 metro de você, exceto você, deve ser bem-sucedida em um teste de resistência de Constituição ou sofrerá 1d6 de dano trovejante. O dano aumenta em 1d6 no 5° (2d6), 11° (3d6) e 17° (4d6) níveis.", castingTime: "1 Ação", range: "1,5m", components: "S", duration: "Instantânea", concentration: false },
  "Criar Fogueira": { level: "Truque", school: "Conjuração", desc: "Você cria uma fogueira mágica no chão, em um ponto que você possa ver dentro do alcance. Até a magia acabar, a fogueira preenche um cubo de 1,5 metro. Qualquer criatura no espaço da fogueira quando você conjurar a magia deve ser bem-sucedida em um teste de resistência de Destreza ou sofrerá 1d8 de dano de fogo. Uma criatura também deve realizar o teste de resistência quando entrar no espaço da fogueira pela primeira vez em um turno ou terminar o turno dela ali. O dano aumenta em 1d8 no 5° (2d8), 11° (3d8) e 17° (4d8) níveis.", castingTime: "1 Ação", range: "18m", components: "V, S", duration: "Concentração, até 1 min", concentration: true },
  "Mísseis Mágicos": { level: "1º Nível", school: "Evocação", desc: "Você cria três dardos brilhantes de força mágica pura. Cada dardo atinge, automaticamente, uma criatura à sua escolha que você possa ver, dentro do alcance. Um dardo causa 1d4 + 1 de dano de força ao alvo. Os dardos atingem todos simultaneamente e você pode direcioná-los para atingir uma criatura ou várias. Quando você conjura esta magia usando um espaço de magia de 2° nível ou superior, a magia cria um dardo adicional para cada nível do espaço acima do 1°.", castingTime: "1 Ação", range: "36m", components: "V, S", duration: "Instantânea", concentration: false },
  "Armadura Arcana": { level: "1º Nível", school: "Abjuração", desc: "Você toca uma criatura voluntária que não esteja vestindo armadura e uma força mágica protetora a envolve até a magia acabar. A CA base do alvo se torna 13 + o modificador de Destreza dele. A magia acaba se o alvo vestir uma armadura ou se você dissipar a magia usando uma ação.", castingTime: "1 Ação", range: "Toque", components: "V, S, M (Um pedaço de couro curado)", duration: "8 horas", concentration: false },
  "Alarme": { level: "1º Nível", school: "Abjuração", desc: "Você cria um alarme mental ou audível em uma porta, janela ou área de até 6m. Dura 8 horas e avisa quando uma criatura entra ou toca a área sem a sua permissão.", castingTime: "1 minuto (Ritual)", range: "9m", components: "V, S, M (Um pequeno sino de prata)", duration: "8 horas", concentration: false },
  "Amizade Animal": { level: "1º Nível", school: "Encantamento", desc: "Esta magia permite que você convença uma fera que você não quer prejudicá-la. Escolha uma fera que você possa ver dentro do alcance. Ela deve ver e ouvir você. Se a Inteligência da fera for 4 ou maior, a magia falha. Do contrário, a fera deve ser bem-sucedida em um teste de resistência de Sabedoria ou ficará encantada por você pela duração da magia. Se você ou um dos seus companheiros ferir o alvo, a magia termina. Quando você conjura esta magia usando um espaço de magia de 2° nível ou superior, você pode afetar uma fera adicional para cada nível do espaço acima do 1°.", castingTime: "1 Ação", range: "9m", components: "V, S, M (Um bocado de comida)", duration: "24 horas", concentration: false },
  "Bom Fruto": { level: "1º Nível", school: "Transmutação", desc: "Até dez bagas aparecem na sua mão e são infundidas com magia pela duração. Uma criatura pode usar sua ação para comer uma baga. Comer uma baga restaura 1 ponto de vida e a baga fornece nutrição suficiente para sustentar uma criatura por um dia. As bagas perdem seu potencial se não forem consumidas dentro de 24 horas após a conjuração desta magia.", castingTime: "1 Ação", range: "Toque", components: "V, S, M (Um ramo de visco)", duration: "Instantânea", concentration: false },
  "Constrição": { level: "1º Nível", school: "Conjuração", desc: "Grasas e ervas daninhas brotam do chão em um quadrado de 6 metros, partindo de um ponto dentro do alcance. Pela duração, essas plantas transformam o chão da área em terreno difícil. Uma criatura na área quando você conjura a magia deve ser bem-sucedida em um teste de resistência de Força ou ficará impedida pelas plantas até a magia acabar. Uma criatura impedida pelas plantas pode usar sua ação para realizar um teste de Força contra a CD de resistência da sua magia. Se for bem-sucedida, ela se liberta. Quando a magia acaba, as plantas murcham.", castingTime: "1 Ação", range: "27m", components: "V, S", duration: "Concentração, até 1 min", concentration: true },
  "Compreender Idiomas": { level: "1º Nível", school: "Adivinhação", desc: "Pela duração, você entende o significado literal de qualquer idioma falado que você ouvir. Você também entende qualquer idioma escrito que vir, mas você deve tocar a superfície onde as palavras estão escritas. Leva cerca de 1 minuto para ler uma página de texto. Esta magia não decifra mensagens secretas em um texto ou glifo, como um selo arcano, que não seja parte de um idioma escrito.", castingTime: "1 Ação (Ritual)", range: "Pessoal", components: "V, S, M (Um punhado de sal e fuligem)", duration: "1 hora", concentration: false },
  "Curar Ferimentos": { level: "1º Nível", school: "Evocação", desc: "Uma criatura que você tocar recupera uma quantidade de pontos de vida igual a 1d8 + seu modificador de atributo de conjuração. Esta magia não tem efeito em mortos-vivos ou constructos. Ao conjurar esta magia usando um espaço de magia de 2° nível ou superior, a cura aumenta em 1d8 para cada nível do espaço acima do 1°.", castingTime: "1 Ação", range: "Toque", components: "V, S", duration: "Instantânea", concentration: false },
  "Palavra Curativa": { level: "1º Nível", school: "Evocação", desc: "Um chamado reconfortante que cura uma criatura que você possa ver dentro do alcance. Ela recupera 1d4 + seu modificador de atributo de conjuração em pontos de vida.", castingTime: "1 Ação Bônus", range: "18m", components: "V", duration: "Instantânea", concentration: false },
  "Mãos Flamejantes": { level: "1º Nível", school: "Evocação", desc: "Conforme você coloca seus polegares juntos e estende seus dedos, uma farta cortina de chamas explode das pontas dos seus dedos. Cada criatura em um cone de 4,5 metros deve realizar um teste de resistência de Destreza. Uma criatura sofre 3d6 de dano de fogo se falhar na resistência ou metade desse dano se obtiver sucesso. O fogo incendeia qualquer objeto inflamável na área que não esteja sendo usado ou carregado. Ao conjurar esta magia usando um espaço de magia de 2° nível ou superior, o dano aumenta em 1d6 para cada nível do espaço acima do 1°.", castingTime: "1 Ação", range: "Pessoal (Cone de 4,5m)", components: "V, S", duration: "Instantânea", concentration: false },
  "Onda Trovejante": { level: "1º Nível", school: "Evocação", desc: "Uma onda de força trovejante emana de você. Cada criatura num cubo de 4,5 metros originado em você deve realizar um teste de resistência de Constituição. Se falhar, uma criatura sofre 2d8 de dano trovejante e é empurrada 3 metros para longe de você. Se obtiver sucesso, a criatura sofre metade desse dano e não é empurrada. Além disso, objetos soltos que estejam completamente dentro da área de efeito são automaticamente empurrados 3 metros para longe de você devido ao efeito da magia, e a magia emite um trovão audível a até 90 metros. Ao conjurar esta magia usando um espaço de magia de 2° nível ou superior, o dano aumenta em 1d8 para cada nível do espaço acima do 1°.", castingTime: "1 Ação", range: "Pessoal (Cubo de 4,5m)", components: "V, S", duration: "Instantânea", concentration: false },
  "Orbe Cromático": { level: "1º Nível", school: "Evocação", desc: "Você lança uma esfera de energia de 10 centímetros de diâmetro em uma criatura que você possa ver dentro do alcance. Você escolhe ácido, frio, fogo, elétrico, veneno ou trovão para o tipo de orbe que você cria e, então, faz uma jogada de ataque de magia à distância contra o alvo. Se o ataque acertar, o alvo sofre 3d8 de dano do tipo que você escolheu. Ao conjurar esta magia usando um espaço de magia de 2° nível ou superior, o dano aumenta em 1d8 para cada nível do espaço acima do 1°.", castingTime: "1 Ação", range: "27m", components: "V, S, M (Um diamante valendo pelo menos 50 po)", duration: "Instantânea", concentration: false },
  "Raio Guiador": { level: "1º Nível", school: "Evocação", desc: "Um lampejo de luz dispara em direção a uma criatura dentro do alcance. Faça uma jogada de ataque de magia à distância contra o alvo. Se acertar, o alvo sofre 4d6 de dano radiante e a próxima jogada de ataque feita contra esse alvo antes do final do seu próximo turno tem vantagem, graças à mística luz cintilante que brilha no alvo. Ao conjurar esta magia usando um espaço de magia de 2° nível ou superior, o dano aumenta em 1d6 para cada nível do espaço acima do 1°.", castingTime: "1 Ação", range: "36m", components: "V, S", duration: "1 rodada", concentration: false },
  "Infligir Ferimentos": { level: "1º Nível", school: "Necromancia", desc: "Faça uma jogada de ataque de magia corpo-a-corpo contra uma criatura ao seu alcance. Se acertar, o alvo sofre 3d10 de dano necrótico. Ao conjurar esta magia usando um espaço de magia de 2° nível ou superior, o dano aumenta em 1d10 para cada nível do espaço acima do 1°.", castingTime: "1 Ação", range: "Toque", components: "V, S", duration: "Instantânea", concentration: false },
  "Área Escorregadia": { level: "1º Nível", school: "Conjuração", desc: "Você cobre o chão em um quadrado de 3 metros de lado centrado em um ponto dentro do alcance, cobrindo-o com graxa escorregadia. A área torna-se terreno difícil pela duração. Quando a graxa aparece, cada criatura de pé na área deve ser bem-sucedida em um teste de resistência de Destreza ou cairá caída. Uma criatura que entrar na área ou terminar seu turno nela deve ser bem-sucedida em um teste de resistência de Destreza ou cairá caída.", castingTime: "1 Ação", range: "18m", components: "V, S, M (Um pouco de pele de porco ou manteiga)", duration: "1 minuto", concentration: false },
  "Armadura de Agathys": { level: "1º Nível", school: "Abjuração", desc: "Uma geada espectral envolve você. Você ganha 5 pontos de vida temporários pela duração. Se uma criatura atingir você com um ataque corpo-a-corpo enquanto você tiver esses pontos de vida, a criatura sofre 5 de dano de frio. Quando você conjura esta magia usando um espaço de magia de 2° nível ou superior, tanto os pontos de vida temporários quanto o dano de frio aumentam em 5 para cada nível do espaço acima do 1°.", castingTime: "1 Ação", range: "Pessoal", components: "V, S, M (Um copo d'água)", duration: "1 hora", concentration: false },
  "Comando": { level: "1º Nível", school: "Encantamento", desc: "Você profere um comando de uma única palavra a uma criatura que você possa ver dentro do alcance. O alvo deve ser bem-sucedido em um teste de resistência de Sabedoria ou seguirá o comando no próximo turno dele. A magia não tem efeito se o alvo for um morto-vivo, se ele não entender seu idioma ou se o seu comando for diretamente prejudicial a ele. Opções comuns: Fugir, Cair, Parar, Largar. Ao usar um espaço de magia de 2° nível ou superior, você pode afetar uma criatura adicional para cada nível do espaço acima do 1°.", castingTime: "1 Ação", range: "18m", components: "V", duration: "1 rodada", concentration: false },
  "Escudo da Fé": { level: "1º Nível", school: "Abjuração", desc: "Um campo cintilante surge e envolve uma criatura à sua escolha, dentro do alcance, concedendo a ela um bônus de +2 na CA pela duração.", castingTime: "1 Ação Bônus", range: "18m", components: "V, S, M (Um pequeno pedaço de pergaminho sagrado com um pouco de texto sagrado escrito nele)", duration: "Concentração, até 10 min", concentration: true },
  "Repreensão Infernal": { level: "1º Nível", school: "Evocação", desc: "Você aponta seu dedo e a criatura que atingiu você é momentaneamente cercada por chamas infernais. A criatura deve realizar um teste de resistência de Destreza. Ela sofre 2d10 de dano de fogo se falhar na resistência, ou metade desse dano se for bem-sucedida. Quando você conjura esta magia usando um espaço de magia de 2° nível ou superior, o dano aumenta em 1d10 para cada nível do espaço acima do 1°.", castingTime: "1 Reação (que você toma em resposta a sofrer dano de uma criatura a até 18 metros de você que você possa ver)", range: "18m", components: "V, S", duration: "Instantânea", concentration: false },
  "Sussurros Dissonantes": { level: "1º Nível", school: "Encantamento", desc: "Você sussurra uma melodia dissonante que apenas uma criatura à sua escolha, dentro do alcance, pode ouvir, assolando-a com espasmos de dor terríveis. O alvo deve realizar um teste de resistência de Sabedoria. Se falhar, ele sofre 3d6 de dano psíquico e deve imediatamente usar sua reação, se disponível, para se mover para o mais longe possível de você. Em um sucesso, o alvo sofre metade do dano e não precisa se mover. O dano aumenta em 1d6 para cada nível do espaço acima do 1°.", castingTime: "1 Ação", range: "18m", components: "V", duration: "Instantânea", concentration: false },
  "Detectar Magia": { level: "1º Nível", school: "Adivinhação", desc: "Pela duração, você sente a presença de magia a até 9 metros de você. Se você sentir magia desta forma, você pode usar sua ação para ver uma aura tênue ao redor de qualquer criatura ou objeto visível na área que carregue magia, e você aprende a escola de magia, se houver uma. A magia pode penetrar a maioria das barreiras, mas é bloqueada por 30cm de rocha, 2,5cm de metal comum, uma fina camada de chumbo ou 90cm de madeira ou terra.", castingTime: "1 Ação (Ritual)", range: "Pessoal", components: "V, S", duration: "Concentração, até 10 min", concentration: true },
  "Escudo Arcano": { level: "1º Nível", school: "Abjuração", desc: "Uma barreira invisível de força mágica surge para proteger você. Até o início do seu próximo turno, você recebe um bônus de +5 na CA, incluindo contra o ataque que engatilhou a reação, e você não sofre dano de Mísseis Mágicos.", castingTime: "1 Reação (que você toma quando é atingido por um ataque ou vira alvo da magia Mísseis Mágicos)", range: "Pessoal", components: "V, S", duration: "1 rodada", concentration: false },
  "Golpe Colérico": { level: "1º Nível", school: "Encantamento", desc: "A próxima vez que você atingir com um ataque de arma corpo-a-corpo antes da magia acabar, seu ataque causa 1d6 de dano psíquico extra. Além disso, se o alvo for uma criatura, ele deve realizar um teste de resistência de Sabedoria ou ficará amedrontado por você até a magia acabar. Como uma ação, a criatura pode realizar um teste de Sabedoria contra a CD da sua magia para resistir ao medo e terminar a magia.", castingTime: "1 Ação Bônus", range: "Pessoal", components: "V", duration: "Concentração, até 1 min", concentration: true },
  "Marca do Caçador": { level: "1º Nível", school: "Adivinhação", desc: "Você escolhe uma criatura que você possa ver, dentro do alcance, e a marca misticamente como sua presa. Até a magia acabar, você causa 1d6 de dano extra ao alvo sempre que o atingir com um ataque com arma, e você tem vantagem em qualquer teste de Sabedoria (Percepção) ou Sabedoria (Sobrevivência) que fizer para localizá-lo. Se o alvo cair a 0 pontos de vida antes da magia acabar, você pode usar uma ação bônus em um turno posterior para marcar uma nova criatura.", castingTime: "1 Ação Bônus", range: "27m", components: "V", duration: "Concentração, até 1 hora", concentration: true },
  "Bruxaria (Hex)": { 
    level: "1º Nível", 
    school: "Encantamento", 
    desc: "Você roga uma maldição em uma criatura que você possa ver dentro do alcance. Até a magia acabar, você causa 1d6 de dano necrótico extra ao alvo sempre que atingi-lo com um ataque. Além disso, escolha um atributo quando você conjura esta magia. O alvo tem desvantagem em testes de atributo feitos com o atributo escolhido. Se o alvo cair a 0 pontos de vida antes da magia acabar, você pode usar uma ação bônus em um turno posterior para amaldiçoar uma nova criatura.\n\n**Em Níveis Superiores:** Quando você conjura esta magia usando um espaço de magia de 3º ou 4º nível, você pode manter sua concentração nela por até 8 horas. Quando você usa um espaço de magia de 5º nível ou superior, pode manter a concentração por até 24 horas.", 
    castingTime: "1 Ação Bônus", 
    range: "27m", 
    components: "V, S, M (Um olho de salamandra petrificado)", 
    duration: "Concentração, até 1 hora", 
    concentration: true 
  },
  "Raio Ardente": { 
    level: "2º Nível", 
    school: "Evocação", 
    desc: "Você cria três raios de fogo e os arremessa em alvos dentro do alcance. Você pode dispará-los em um alvo ou em vários. Faça uma jogada de ataque de magia à distância para cada raio. Se acertar, o alvo sofre 2d6 de dano de fogo.\n\n**Em Níveis Superiores:** Quando você conjura esta magia usando um espaço de magia de 3° nível ou superior, você cria um raio adicional para cada nível do espaço acima do 2°.", 
    castingTime: "1 Ação", 
    range: "36m", 
    components: "V, S", 
    duration: "Instantânea", 
    concentration: false 
  },
  "Despedaçar": { 
    level: "2º Nível", 
    school: "Evocação", 
    desc: "Um ruído súbito e ensurdecedor, doloroso de se ouvir, ecoa em um ponto à sua escolha dentro do alcance. Cada criatura em uma esfera de 3 metros de raio deve realizar um teste de resistência de Constituição. Se falhar, sofre 3d8 de dano trovejante, ou metade se obtiver sucesso. Uma criatura feita de material inorgânico, como pedra, cristal ou metal, tem desvantagem nesse teste de resistência. Um objeto não-mágico que não esteja sendo usado ou carregado também sofre o dano.\n\n**Em Níveis Superiores:** O dano aumenta em 1d8 para cada nível do espaço acima do 2° nível.", 
    castingTime: "1 Ação", 
    range: "18m", 
    components: "V, S, M (Uma lasca de vidro)", 
    duration: "Instantânea", 
    concentration: false 
  },
  "Esfera Flamejante": { level: "2º Nível", school: "Evocação", desc: "Uma esfera de fogo de 1,5 metro de diâmetro aparece em um espaço desocupado de sua escolha, dentro do alcance, e permanece pela duração. Qualquer criatura que terminar o turno dela a até 1,5 metro da esfera deve realizar um teste de resistência de Destreza. A criatura sofre 2d6 de dano de fogo se falhar na resistência ou metade desse dano se for bem-sucedida. Como uma ação bônus, você pode mover a esfera até 9 metros. Se você chocar a esfera contra uma criatura, ela deve realizar o teste de resistência contra o dano da esfera e a esfera para de se mover naquele turno.", castingTime: "1 Ação", range: "18m", components: "V, S, M (Um pouco de sebo, uma pitada de enxofre e um pouco de pó de ferro)", duration: "Concentração, até 1 min", concentration: true },
  "Invisibilidade": { 
    level: "2º Nível", 
    school: "Ilusão", 
    desc: "Uma criatura que você tocar torna-se invisível até a magia acabar. Qualquer coisa que o alvo esteja vestindo ou carregando fica invisível enquanto estiver com ele. A magia termina precocemente se o alvo atacar ou conjurar uma magia.\n\n**Em Níveis Superiores:** Quando você conjura esta magia usando um espaço de magia de 3° nível ou superior, você pode marcar uma criatura adicional como alvo para cada nível de espaço acima do 2°.", 
    castingTime: "1 Ação", 
    range: "Toque", 
    components: "V, S, M (Uma pestana presa em um pouco de goma arábica)", 
    duration: "Concentração, até 1 hora", 
    concentration: true 
  },
  "Bola de Fogo": { 
    level: "3º Nível", 
    school: "Evocação", 
    desc: "Um lampejo brilhante dispara da ponta do seu dedo para um ponto que você escolher dentro do alcance e, então, eclode com um rugido baixo em uma explosão de chamas. Cada criatura em uma esfera de 6 metros de raio, centrada no ponto, deve realizar um teste de resistência de Destreza. Uma criatura sofre 8d6 de dano de fogo se falhar na resistência, ou metade desse dano se for bem-sucedida. O fogo se espalha dobrando esquinas e incendeia objetos inflamáveis na área que não estejam sendo usados ou carregados.\n\n**Em Níveis Superiores:** Quando você conjura esta magia usando um espaço de magia de 4° nível ou superior, o dano aumenta em 1d6 para cada nível do espaço acima do 3°.", 
    castingTime: "1 Ação", 
    range: "45m", 
    components: "V, S, M (Uma minúscula bola de guano de morcego e enxofre)", 
    duration: "Instantânea", 
    concentration: false 
  },
  "Toque Vampírico": { 
    level: "3º Nível", 
    school: "Necromancia", 
    desc: "O toque da sua mão envolta em sombras pode drenar a força vital de outros para curar suas feridas. Faça uma jogada de ataque de magia corpo-a-corpo contra uma criatura ao seu alcance. Se acertar, o alvo sofre 3d6 de dano necrótico e você recupera pontos de vida iguais à metade do dano necrótico causado. Até a magia acabar, você pode usar sua ação em cada um de seus turnos para realizar este ataque novamente.\n\n**Em Níveis Superiores:** Quando você conjura esta magia usando um espaço de magia de 4° nível ou superior, o dano aumenta em 1d6 para cada nível do espaço acima do 3°.", 
    castingTime: "1 Ação", 
    range: "Toque", 
    components: "V, S", 
    duration: "Concentração, até 1 min", 
    concentration: true 
  },
  "Invocar Relâmpago": { level: "3º Nível", school: "Conjuração", desc: "Uma nuvem de tempestade aparece sob a forma de um cilindro de 3 metros de altura e 18 metros de raio, centrada em um ponto que você possa ver 30 metros diretamente acima de você. A magia falha se você não puder ver um ponto no ar onde a nuvem possa aparecer. Quando você conjura a magia, escolha um ponto que você possa ver sob a nuvem. Um relâmpago desce desse ponto em uma criatura a até 1,5 metro do ponto. Cada criatura ali deve realizar um teste de resistência de Destreza, sofrendo 3d10 de dano elétrico se falhar ou metade se obtiver sucesso. Em cada um de seus turnos, você pode usar sua ação para convocar um novo relâmpago si as condições de tempestade persistirem.", castingTime: "1 Ação", range: "36m", components: "V, S", duration: "Concentração, até 10 min", concentration: true },
  "Contramágica": { level: "3º Nível", school: "Abjuração", desc: "Você tenta interromper uma criatura no processo de conjurar uma magia. Se a criatura estiver conjurando uma magia de 3° nível ou inferior, a magia falha e não tem efeito. Se ela estiver conjurando uma magia de 4° nível ou superior, faça um teste de atributo de conjuração (CD 10 + o nível da magia). Se for bem-sucedido, a magia da criatura falha e não tem efeito. Quando você conjura esta magia usando um espaço de magia de 4° nível ou superior, a magia interrompida falha se o seu nível for igual ou inferior ao nível do espaço de magia que você usou.", castingTime: "1 Reação (que você toma quando vê uma criatura a até 18 metros de você conjurando uma magia)", range: "18m", components: "S", duration: "Instantânea", concentration: false },
  "Velocidade": { level: "3º Nível", school: "Transmutação", desc: "Você escolhe uma criatura voluntária que possa ver dentro do alcance. Até a magia acabar, o deslocamento do alvo é dobrado, ele ganha um bônus de +2 na CA, tem vantagem em testes de resistência de Destreza e ganha uma ação adicional em cada um de seus turnos. Essa ação pode ser usada apenas para realizar as ações Atacar (um único ataque de arma apenas), Disparar, Desengajar, Esconder ou Usar um Objeto. Quando a magia acaba, o alvo não pode se mover nem realizar ações até depois do seu próximo turno, conforme uma onda de letargia o atinge.", castingTime: "1 Ação", range: "Toque", components: "V, S, M (Uma fatia de raiz de alcaçuz)", duration: "Concentração, até 1 min", concentration: true },
  "Voo": { level: "3º Nível", school: "Transmutação", desc: "Você toca uma criatura voluntária. O alvo ganha deslocamento de voo de 18 metros pela duração. Quando a magia acaba, o alvo cai se ainda estiver no ar, a menos que possa deter a queda. Ao conjurar esta magia usando um espaço de magia de 4° nível ou superior, você pode atingir uma criatura adicional para cada nível do espaço acima do 3°.", castingTime: "1 Ação", range: "Toque", components: "V, S, M (Uma pena da asa de um pássaro)", duration: "Concentração, até 10 min", concentration: true },
  "Onda de Maré": { level: "3º Nível", school: "Conjuração", desc: "Você conjura uma onda de água que surge em uma área à sua escolha dentro do alcance. A área pode ter até 9 metros de comprimento, 3 metros de largura e 3 metros de altura. Cada criatura na área deve realizar um teste de resistência de Destreza. Se falhar, a criatura sofre 4d8 de dano de concussão e cai caída. Se for bem-sucedida, sofre metade do dano e não cai. A água então se espalha pelo chão, extinguindo chamas desprotegidas na área e a até 9 metros de distância.", castingTime: "1 Ação", range: "36m", components: "V, S, M (Uma gota d'água)", duration: "Instantânea", concentration: false },
  "Erupção de Terra": { level: "3º Nível", school: "Transmutação", desc: "Você escolhe um ponto que possa ver no chão dentro do alcance. Uma explosão de rocha e terra irrompe em um cubo de 6 metros centrado naquele ponto. Cada criatura na área deve realizar um teste de resistência de Destreza. Uma criatura sofre 3d12 de dano de concussão se falhar ou metade se for bem-sucedida. Além disso, o chão na área torna-se terreno difícil até que seja limpo. Cada seção de 1,5 metro da área leva 1 minuto para ser limpa manualmente. O dano aumenta em 1d12 para cada nível do espaço acima do 3°.", castingTime: "1 Ação", range: "36m", components: "V, S, M (Um pedaço de obsidiana)", duration: "Instantânea", concentration: false },
  "Tempestade de Gelo": { level: "4º Nível", school: "Evocação", desc: "Uma chuva de granizo pesado e frio congelante desce no chão em um cilindro de 6 metros de raio por 12 metros de altura, centrado em um ponto dentro do alcance. Cada criatura na área deve realizar um teste de resistência de Destreza. Uma criatura sofre 2d8 de dano de concussão e 4d6 de dano de frio se falhar, ou metade se obtiver sucesso. O granizo torna a área da tempestade em terreno difícil até el final do seu próximo turno. Quando você conjura esta magia usando um espaço de magia de 5° nível ou superior, o dano de concussão aumenta em 1d8 para cada nível do espaço acima do 4°.", castingTime: "1 Ação", range: "90m", components: "V, S, M (Uma pitada de poeira e algumas gotas de água)", duration: "Instantânea", concentration: false },
  "Esfera Vitriólica": { level: "4º Nível", school: "Evocação", desc: "Você cria uma esfera de 30 centímetros de ácido esmeralda que voa para um ponto escolhido dentro do alcance e explode em uma chuva de ácido em uma esfera de 6 metros de raio. Cada criatura na área deve realizar um teste de resistência de Destreza. Uma criatura sofre 10d4 de dano ácido se falhar, ou metade se obtiver sucesso. Uma criatura que tenha falhado na resistência também sofre 5d4 de dano ácido no final do próximo turno dela. Ao usar um espaço de 5° nível ou superior, o dano inicial aumenta em 2d4 para cada nível acima do 4°.", castingTime: "1 Ação", range: "45m", components: "V, S, M (Uma gota de bile de dragão gigante)", duration: "Instantânea", concentration: false },
  "Polimorfia": { level: "4º Nível", school: "Transmutação", desc: "Esta magia transforma uma criatura que você possa ver dentro do alcance em uma nova forma. Um alvo involuntário deve realizar um teste de resistência de Sabedoria para evitar o efeito. A magia não tem efeito em um metamorfo ou em uma criatura com 0 pontos de vida. A transformação dura pela duração ou até o alvo cair a 0 pontos de vida ou morrer. A nova forma pode ser qualquer besta cujo nível de desafio seja igual ou inferior ao nível do alvo (ou nível do personagem). As estatísticas do alvo são substituídas pelas da nova forma.", castingTime: "1 Ação", range: "18m", components: "V, S, M (Um pedaço de casulo)", duration: "Concentração, até 1 hora", concentration: true },
  "Movimentação Livre": { level: "4º Nível", school: "Abjuração", desc: "Você toca uma criatura voluntária. Pela duração, o deslocamento do alvo não pode ser reduzido por terreno difícil, magias ou outros efeitos mágicos. O alvo também pode gastar 1,5 metro de movimento para escapar automaticamente de amarras não-mágicas ou de ser agarrado por uma criatura. Por fim, estar submerso em água não impõe penalidades ao movimento ou ataques do alvo.", castingTime: "1 Ação", range: "Toque", components: "V, S, M (Uma tira de couro de 4,5 metros, amarrada ao redor do braço ou apêndice similar)", duration: "1 hora", concentration: false },
  "Similaridade (Geas)": { level: "5º Nível", school: "Encantamento", desc: "Você coloca um comando mágico em uma criatura que você possa ver dentro do alcance, forçando-a a realizar algum serviço ou a se abster de alguma ação ou curso de atividade conforme você decidir. Se a criatura puder entender você, ela deve ser bem-sucedida em um teste de resistência de Sabedoria ou ficará encantada por você pela duração. Enquanto a criatura estiver encantada por você, ela sofre 5d10 de dano psíquico sempre que agir de maneira diretamente oposta às suas instruções, mas não mais do que uma vez por dia. Uma criatura que não possa entender você não é afetada pela magia.", castingTime: "1 minuto", range: "18m", components: "V", duration: "30 dias", concentration: false },
  "Teletransporte por Árvores": { level: "6º Nível", school: "Conjuração", desc: "Você ganha a habilidade de entrar em uma árvore viva e sair de dentro de outra árvore viva da mesma espécie a qualquer distância. Ambas as árvores devem ser vivas e ter tamanho pelo menos Grande. Você deve usar 1,5 metro de seu movimento para entrar na árvore. Você sabe instantaneamente a localização de todas as outras árvores da mesma espécie a até 150 metros e, como parte do movimento usado para entrar na árvore, pode passar para outra dessas árvores ou para qualquer outra árvore da mesma espécie que você tenha visto ou que esteja em qualquer lugar do mundo.", castingTime: "1 Ação", range: "Pessoal", components: "V, S", duration: "1 rodada", concentration: false },
  "Frenesi": { 
    level: "Habilidade", 
    desc: "Você se entrega a uma sede de sangue cega e devastadora. Enquanto estiver em Fúria, você pode realizar um único ataque de arma corpo-a-corpo como uma ação bônus em cada um de seus turnos. No entanto, o custo para tal poder é alto: quando sua fúria termina, você sofre um nível de exaustão, reflexo do preço físico de tal esforço sobre-humano." 
  },
  "Fúria Inabalável": { 
    level: "Habilidade", 
    desc: "Sua vontade em batalha torna-se uma fortaleza impenetrável. Enquanto estiver em fúria, você se torna imune às condições 'Enfeitiçado' ou 'Amedrontado'. Se estiver sob tais efeitos ao entrar no frenesi, eles são suspensos até que sua raiva se acalme." 
  },
  "Artes das Sombras": { 
    level: "Habilidade", 
    desc: "Você aprende a tecer a própria escuridão com seu Ki. Como uma ação, você pode gastar 2 pontos de Ki para conjurar 'Escuridão', 'Visão no Escuro', 'Passar sem Rastros' ou 'Silêncio' sem componentes materiais. Suas pegadas tornam-se apenas um eco no vazio." 
  },
  "Mão da Cura": { 
    level: "Habilidade", 
    desc: "Você canaliza o fluxo vital através de seus meridianos para selar feridas. Como uma ação, ou substituindo um golpe de sua Rajada de Golpes, você pode gastar 1 ponto de Ki para restaurar vida a uma criatura tocada (Dado de Artes Marciais + Mod. Sabedoria)." 
  },
  "Golpe de Vento Cortante": { 
    level: "Habilidade", 
    desc: "Seus ataques desarmados ou com armas de monge podem projetar vácuos cortantes. Você pode gastar 1 ponto de Ki para aumentar seu alcance em 3 metros por um turno e causar dano de força extra." 
  },
  "Ancestral Dracônico (Feiticeiro)": { 
    level: "Habilidade", 
    desc: "O sangue de dragões corre em suas veias. Você escolhe um tipo de dragão como ancestral, o que concede resistência a um tipo de dano e aumenta o poder de suas magias elementais correspondentes." 
  },
  "Resiliência Dracônica (Feiticeiro)": { 
    level: "Habilidade", 
    desc: "O sangue de dragão em suas veias manifesta-se fisicamente. Partes do seu corpo são cobertas por escamas dracônicas quase invisíveis. Seu máximo de pontos de vida aumenta em 1 para cada nível nesta classe e, enquanto não estiver usando armadura, sua CA base é 13 + seu modificador de Destreza. Sua pele é tão resistente quanto o couro de um dragão jovem.",
    castingTime: "Passiva",
    range: "Pessoal",
    components: "-",
    duration: "Permanente"
  },
  "Marés de Caos": { 
    level: "Habilidade", 
    desc: "Você manipula as forças do azar e da sorte a seu bel-prazer. Você ganha vantagem em uma jogada de ataque, teste de atributo ou teste de resistência. Uma vez utilizado, você deve completar um descanso longo para recuperar o uso, ou o mestre pode exigir uma rolagem na tabela de Magia Selvagem após você conjurar uma magia, restaurando o uso desta habilidade instantaneamente através do caos.",
    castingTime: "Livre",
    range: "Pessoal",
    components: "-",
    duration: "Instantânea"
  },
  "Ward Arcano": { 
    level: "Habilidade", 
    school: "Abjuração", 
    desc: "Ao conjurar uma magia de abjuração de 1º nível ou superior, você tece fios de magia para criar uma barreira arcana protetora. O escudo possui pontos de vida iguais a (2 vezes seu nível de mago) + seu modificador de Inteligência. Sempre que você conjurar uma magia de abjuração posterior, o escudo recupera pontos de vida iguais a duas vezes o nível da magia conjurada, absorvendo o impacto dos ataques por você.",
    castingTime: "Passiva (Conjuração)",
    range: "Pessoal",
    components: "-",
    duration: "Até ser destruído"
  },
  "Esculpir Magias": { 
    level: "Habilidade", 
    school: "Evocação", 
    desc: "Você pode criar bolsas de segurança dentro de suas magias de área. Ao conjurar uma magia de evocação, você pode escolher um número de criaturas igual a 1 + o nível da magia. As criaturas escolhidas passam automaticamente em seus testes de resistência e não sofrem nenhum dano se normalmente sofreriam metade no caso de um sucesso.",
    castingTime: "Passiva (Conjuração)",
    range: "Especial",
    components: "-",
    duration: "Instantânea"
  },
  "Portento": { 
    level: "Habilidade", 
    school: "Adivinhação", 
    desc: "Visões do futuro passam por sua mente como fragmentos de destino. Após um descanso longo, role dois d20s e guarde os resultados. Você pode substituir qualquer jogada de ataque, teste de resistência ou teste de atributo (sua ou de outra criatura que você possa ver a até 9 metros) por um desses resultados. Você deve escolher fazer isso antes da rolagem ser realizada, alterando o curso da causalidade a seu favor.",
    castingTime: "Reação",
    range: "9m",
    components: "-",
    duration: "Instantânea"
  },
  "Mãos Mágicas Versáteis": { 
    level: "Habilidade", 
    desc: "Suas Mãos Mágicas tornam-se uma extensão invisível e sofisticada da sua vontade. Elas podem realizar tarefas complexas, como destrancar portas, desarmar armadilhas ou furtar bolsos, enquanto você permanece escondido. Você também pode usar sua Ação Astuta para controlar a mão como uma ação bônus."
  },
  "Manobra de Defesa": { 
    level: "Habilidade", 
    desc: "Você usa sua maestria com a arma para proteger a si mesmo ou a outros. Quando você ou uma criatura que você possa ver a até 1,5 metro de distância for atingida por um ataque, você pode usar sua reação e gastar um dado de superioridade. Role o dado e adicione o resultado à CA do alvo contra aquele ataque, potencialmente transformando um golpe certeiro em um erro." 
  },
  "Golpe de Arco Searing": { level: "Habilidade", desc: "Sua técnica de combate inflama o próprio ar. Imediatamente após você realizar a ação de Ataque no seu turno, você pode gastar 2 pontos de Ki para conjurar a magia 'Mãos Flamejantes' as a ação bônus. Você pode gastar pontos de Ki adicionais para conjurar a magia em níveis superiores, representando uma explosão de calor cada vez mais intensa." },
  "Sussurros dos Mortos": { level: "Habilidade", desc: "Você pode buscar o conhecimento residual dos espíritos que já partiram. No final de um descanso curto ou longo, você pode escolher uma perícia ou ferramenta na qual não tenha proficiência e ganhar proficiência nela. Este conhecimento permanece com você, guiado pelos sussurros do além, até que você utilize esta habilidade novamente." },
  "Caminho da Floresta": { level: "Habilidade", desc: "Você se move pelos ambientes naturais com a graça de um predador. O terreno difícil não-mágico não custa movimento adicional para você e você pode passar por plantas não-mágicas sem ser impedido por elas. Além disso, você tem vantagem em testes de resistência contra plantas que foram criadas ou manipuladas magicamente para impedir o movimento." },
  "Recuperação Natural": { level: "Habilidade", desc: "Sua profunda conexão com a natureza permite que você canalize as energias ambientais para restaurar seu poder mágico. Durante um descanso curto, você pode meditar para recuperar espaços de magia gastos cujos níveis combinados sejam iguais ou inferiores a metade do seu nível de Druida (arredondado para cima), até o máximo de um espaço de 5º nível." },
  "Formas de Círculo": { level: "Habilidade", desc: "Seu domínio sobre as formas animais é superior ao de outros druidas. Você pode se transformar em criaturas muito mais perigosas, permitindo o uso de 'Forma Selvagem' para assumir o aspecto de feras com um Nível de Desafio (ND) significativamente mais alto (começando em ND 1 no nível 2 e aumentando conforme você progride)." },
  "Forma Selvagem Elemental": { level: "Habilidade", desc: "Você transcende o mundo biológico para se tornar uma força primordial da natureza. Ao gastar dois usos de sua 'Forma Selvagem' simultaneamente, você pode se transformar em um Elemental de Ar, Terra, Fogo ou Água, ganhando todas as suas resistências, imunidades e habilidades especiais devastadoras." },
  "Mil Formas": { level: "Habilidade", desc: "Sua conexão com a essência da vida permite que você altere sua fisionomia à vontade. Você ganha a habilidade de conjurar a magia 'Alterar-se' sem consumir espaços de magia ou componentes materiais, permitindo que você mude sua aparência, desenvolva brânquias ou garras letais instantaneamente." },
  "Bálsamo da Corte de Verão": { level: "Habilidade", desc: "Você carrega uma reserva de luz feérica da Corte de Verão. Como uma ação bônus, você pode gastar dados d6 de sua reserva (limitada ao seu nível de Druida) para curar uma criatura que você possa ver a até 36 metros. O alvo recupera pontos de vida e ganha 1 ponto de vida temporário para cada dado gasto." },
  "Totem Espiritual": { level: "Habilidade", desc: "Você invoca um espírito protetor da natureza em uma aura de 9 metros. Urso: Concede pontos de vida temporários e vantagem em testes de Força. Falcão: Dá vantagem em testes de Percepção e permite usar sua reação para conceder vantagem em ataques. Unicórnio: Detecta criaturas e potencializa dramaticamente qualquer magia de cura conjurada na área." },
  "Forma Estelar": { level: "Habilidade", desc: "Você assume uma forma luminescente e astral. Arqueiro: Permite realizar um ataque bônus de luz radiante a até 18 metros. Cálice: Quando você conjura uma magia de cura, um aliado próximo recupera vida extra. Dragão: Garante que você nunca role menos que 10 em testes de Inteligência, Sabedoria ou concentração." },
  "Expulsar o Profano": { level: "Habilidade", desc: "Você canaliza sua divindade para afastar as trevas. Como uma ação, você apresenta seu símbolo sagrado. Cada morto-vivo ou ínfero em um raio de 9 metros deve passar em um teste de resistência de Sabedoria ou será forçado a fugir de você por 1 minuto, incapaz de se aproximar voluntariamente." },
  "Abjurar Inimigo": { level: "Habilidade", desc: "Você profere palavras de condenação eterna contra seus adversários. Como uma ação, escolha uma criatura a até 18 metros. Ela deve passar em um teste de resistência de Sabedoria ou ficará Amedrontada e terá seu deslocamento reduzido a 0 por 1 minuto. Mortos-vivos e ínferos têm desvantagem neste teste." },
  "Presença Conquistadora": { level: "Habilidade", desc: "Você emana uma aura de autoridade terrível e esmagadora. Como uma ação, cada criatura à sua escolha em um raio de 9 metros que possa ver você deve passar em um teste de resistência de Sabedoria ou ficarará Amedrontada por 1 minuto. A criatura pode repetir o teste no final de cada um dos turnos dela." },
  "Golpe Guiado": { level: "Habilidade", desc: "Sua divindade guia sua mão para garantir que a justiça seja feita. Quando você realiza uma jogada de ataque, você pode usar seu 'Canalizar Divindade' para adicionar um bônus de +10 àquela jogada específica. Você pode escolher usar esta habilidade após ver a rolagem do dado, mas antes do Mestre dizer se o ataque atingiu ou errou." },
  "Emissário da Paz": { level: "Habilidade", desc: "Sua aura irradia uma calma sobrenatural que pacifica conflitos. Como uma ação bônus, você ganha um bônus de +5 em todos os seus testes de Carisma (Persuasão) por 10 minutos. Este poder divino facilita a diplomacia, permitindo que você acalme multidões ou convença líderes relutantes." },
  "Revidar com Justiça": { level: "Habilidade", desc: "Você pune aqueles que ousam ferir seus protegidos. Quando você ou uma criatura a até 9 metros de você sofrer dano, você pode usar sua reação e seu 'Canalizar Divindade' para forçar o atacante a realizar um teste de resistência de Carisma. Em uma falha, ele sofre dano radiante igual ao dano que causou." },
  "Atleta Incomparável": { level: "Habilidade", desc: "Você canaliza o vigor de heróis lendários para superar os limites físicos. Como uma ação bônus, você ganha vantagem em todos os seus testes de Atletismo e Acrobacia, e sua distância de salto (longo ou alto) é dobrada por 10 minutos, permitindo proezas de movimentação impossíveis para mortais comuns." },
  "Golpe Inspirador": { level: "Habilidade", desc: "Sua coragem em combate infunde força em seus aliados. Imediatamente após você atingir uma criatura com sua 'Destruição Divina', você pode usar uma ação bônus para conceder pontos de vida temporários iguais a 1d10 + seu nível de Paladino a um número de criaturas a até 9 metros de você." },
  "Vontade do Vigilante": { level: "Habilidade", desc: "Você protege a mente de seus aliados contra influências malignas. Como uma ação, você concede a si mesmo e a um número de aliados igual ao seu modificador de Carisma (mínimo 1) vantagem em todos os testes de resistência de Inteligência, Sabedoria e Carisma durante 1 minuto." },
  "Abjurar o Extraplanar": { level: "Habilidade", desc: "Você utiliza seu poder divino para banir influências de outros planos. Como uma ação, cada elemental, fada, aberração ou ínfero em um raio de 9 metros deve passar em um teste de resistência de Sabedoria ou será forçado a fugir de você por 1 minuto, impedido de realizar ações além da Disparada." },
  "Ira Destrutiva": { level: "Habilidade", desc: "Você canaliza sua divindade para descarregar o poder máximo da tempestade. Quando você rola dano elétrico ou trovejante, você pode usar seu 'Canalizar Divindade' para não rolar os dados e, em vez disso, usar o valor máximo possível para o dano, garantindo um impacto devastador que sacode o campo de batalha." },
  "Bênção do Artesão": { level: "Habilidade", desc: "Você realiza um ritual místico de criação que transmuta matéria. Ao longo de 1 hora, você pode realizar um ritual que utiliza metal no valor do item que deseja criar para forjar um objeto de metal (como uma ferramenta, arma ou armadura) cujo valor não exceda 100 po." },
  "Bênção da Vigilância (Clérigo)": { level: "Habilidade", desc: "Você toca uma criatura para aguçar seus sentidos contra emboscadas. Enquanto a bênção durar, o alvo tem vantagem na próxima jogada de iniciativa que realizar. A bênção termina imediatamente após a jogada de iniciativa ser feita ou se você usar esta habilidade em outra criatura." },
  "Alquimia Menor": { level: "Habilidade", desc: "Você altera temporariamente as propriedades físicas de um objeto inanimado e não-mágico. Após 10 minutos de manipulação, você transforma um objeto de madeira, pedra, ferro, cobre ou prata inteiramente em um desses outros materiais. A transformação dura 1 hora ou até que você perca a concentração." },
  "Força do Insepulto": { level: "Habilidade", desc: "Sua centelha vital está ancorada no limiar entre a vida e a morte. Quando seus pontos de vida caem a 0 e você não morre instantaneamente, você pode realizar um teste de Carisma (CD 5 + dano sofrido). Se tiver sucesso, você recupera 1 ponto de vida e permanece consciente. Esta habilidade não funciona contra dano radiante ou críticos." },
  "Artes Marciais": { level: "Habilidade", desc: "Seu treinamento desarmado permite ataques fluidos e precisos. Você pode usar Destreza em vez de Força para ataques e dano com artes marciais. Você pode realizar um ataque desarmado adicional como ação bônus após usar a ação de Ataque com uma arma de monge ou ataque desarmado no seu turno." },
  "Defletir Projéteis": { level: "Habilidade", desc: "Seus reflexos são tão aguçados que você pode interceptar projéteis em pleno ar. Como uma reação ao ser atingido por um ataque à distância, você reduz o dano. Se reduzir o dano a 0, você pode pegar o projétil e, se tiver pelo menos uma mão livre e gastar 1 ponto de Ki, devolvê-lo imediatamente como um contra-ataque." },
  "Ataque Atordoante": { level: "Habilidade", desc: "Você golpeia pontos de pressão específicos para interferir no fluxo de Ki no corpo de um inimigo. Ao atingir uma criatura com um ataque de arma corpo-a-corpo, você pode gastar 1 ponto de Ki para forçar o alvo a passar num teste de resistência de Constituição ou ficará Atordoado até o final do seu próximo turno." },
  "Queda Lenta": { level: "Habilidade", desc: "Através do controle do Ki, você aprende a dissipar a energia do impacto ao cair. Como uma reação ao sofrer dano de queda, você pode reduzir o dano sofrido em um valor igual a cinco vezes o seu nível de monge, permitindo que você salte de alturas vertiginosas e aterrissagem com segurança total sob seus pés." },
  "Golpes de Ki": { level: "Habilidade", desc: "Seus ataques desarmados são tão carregados de energia mística que ultrapassam as defesas físicas comuns. A partir do 6º nível, seus ataques desarmados são considerados mágicos para o propósito de superar a resistência e imunidade a ataques e danos não-mágicos, permitindo que você fira seres sobrenaturais." },
  "Mente Tranquila": { level: "Habilidade", desc: "Você desenvolveu uma fortaleza mental capaz de descartar influências externas e ilusões. Como uma ação, você pode usar sua concentração para encerrar imediatamente um efeito que esteja causando as condições 'Enfeitiçado' ou 'Amedrontado' em si mesmo, recuperando o controle total sobre seus pensamentos e ações." },
  "Arquearia (Estilo)": { level: "Habilidade", desc: "Você foca seu treinamento na perfeição do tiro à distância. Você ganha um bônus constante de +2 em todas as suas jogadas de ataque realizadas com armas de ataque à distância, tornando-se um mestre na pontaria e no manuseio de arcos e bestas." },
  "Defesa (Estilo)": { level: "Habilidade", desc: "Você aprende a transformar sua armadura em uma segunda pele. Enquanto estiver usando qualquer tipo de armadura (Leve, Média ou Pesada), você ganha um bônus permanente de +1 na sua Classe de Armadura, focando em posicionar suas proteções para desviar golpes de forma mais eficiente." },
  "Duelismo (Estilo)": { level: "Habilidade", desc: "Você domina a arte de usar uma única arma com precisão letal. Quando você estiver empunhando uma arma de ataque corpo-a-corpo em uma mão e nenhuma outra arma, você ganha um bônus de +2 em todas as suas jogadas de dano com essa arma, focando toda sua potência em golpes únicos e certeiros." },
  "Armas Grandes (Estilo)": { level: "Habilidade", desc: "Você usa o peso de armas massivas para garantir danos pesados. Quando você rola um 1 ou 2 em qualquer dado de dano de um ataque com arma de duas mãos (ou versátil usada com ambas as mãos), você pode rolar o dado novamente e deve usar o novo resultado, minimizando a chance de golpes fracos." },
  "Proteção (Estilo)": { level: "Habilidade", desc: "Você usa seu escudo para proteger ativamente seus companheiros. Quando uma criatura que você pode ver ataca um alvo (que não seja você) a até 1,5 metro de você, você pode usar sua reação para romper o ataque inimigo, impondo desvantagem na jogada de ataque dele." },
  "Duas Armas (Estilo)": { level: "Habilidade", desc: "Você aprende a lutar com uma arma em cada mão com coordenação perfeita. Quando você realiza um ataque com a segunda arma como uma ação bônus, você pode adicionar seu modificador de atributo à jogada de dano desse ataque." },
  "Luta às Cegas (Estilo)": { level: "Habilidade", desc: "Seus outros sentidos são tão aguçados que você não precisa mais dos olhos para lutar. Você ganha percepção às cegas em um raio de 3 metros, permitindo-lhe localizar criaturas invisíveis ou em escuridão total, desde que o alvo não esteja escondido e você não esteja surdo." },
  "Intercepção (Estilo)": { level: "Habilidade", desc: "Você coloca sua arma ou escudo no caminho de um ataque para mitigar o dano. Quando uma criatura que você possa ver atinge um aliado a até 1,5 metro de você, você pode usar sua reação para reduzir o dano sofrido pelo aliado em 1d10 + seu bônus de proficiência." },
  "Luta Desarmada (Estilo)": { level: "Habilidade", desc: "Seu corpo é sua arma definitiva. Seus ataques desarmados causam 1d6 + modificador de Força de dano. Se você não estiver segurando armas ou escudos no início do ataque, o dano aumenta para 1d8. Além disso, você pode causar 1d4 de dano extra a uma criatura agarrada por você no início de cada um dos seus turnos." },
  "Técnica Superior (Estilo)": { level: "Habilidade", desc: "Seu treinamento militar incluiu táticas avançadas de campo. Você aprende uma Manobra de sua escolha da lista do Guerreiro Mestre de Batalha e ganha um Dado de Superioridade (d6) para utilizá-la, recuperando-o após um descanso curto ou longo." },

  "Sentido Divino": { level: "Habilidade", school: "Adivinhação", desc: "A presença do mal forte ressoa em seus sentidos como um odor nocivo. Você sabe a localização de qualquer celestial, feérico ou corruptor a até 18 metros de você que não esteja atrás de cobertura total.", castingTime: "1 Ação", range: "18m", components: "V, S", duration: "Até o final do seu próximo turno" },
  "Cura pelas Mãos": { level: "Habilidade", school: "Cura", desc: "Seu toque abençoado pode curar feridas. Você possui uma reserva de poder curativo que se regenera após um descanso longo. Com ela, você pode restaurar PV ou curar doenças e venenos.", castingTime: "1 Ação", range: "Toque", components: "S", duration: "Instantânea" },
  "Destruição Divina (Smite)": { level: "Habilidade", desc: "Você infunde seus ataques com o furor sagrado dos céus. Quando você atinge uma criatura com um ataque de arma corpo-a-corpo, você pode gastar um espaço de magia para causar dano radiante extra ao alvo (2d8 para 1º nível, +1d8 por nível acima, até o máximo de 5d8)." },
  "Esquivar": { level: "Habilidade", desc: "Ação. Você se concentra totalmente em evitar golpes. Até o início do seu próximo turno, qualquer jogada de ataque contra você tem desvantagem se você puder ver o atacante, e você ganha vantagem em todos os testes de resistência de Destreza que realizar." },
  "Desengajar": { level: "Habilidade", desc: "Ação. Você se foca em recuar ou se reposicionar sem baixar a guarda. Ao usar esta ação, seu movimento não provoca ataques de oportunidade pelo resto do turno atual, permitindo que você navegue com segurança entre as linhas inimigas." },
  "Ajudar": { level: "Habilidade", desc: "Ação. Você presta auxílio direto a um aliado. O alvo ganha vantagem no próximo teste de atributo que realizar para completar uma tarefa, ou você pode distrair um inimigo para que o próximo ataque de um aliado contra ele tenha vantagem." },
  "Esconder": { level: "Habilidade", desc: "Ação. Você tenta desaparecer da vista de seus inimigos realizando um teste de Destreza (Furtividade). Você só pode tentar se esconder se estiver em uma área com cobertura total, cobertura parcial ou obscuridade adequada para ocultar sua presença." },
  "Agarrar": { level: "Habilidade", desc: "Ação especial de ataque corpo-a-corpo. Você tenta prender uma criatura fisicamente. Você realiza um teste de Força (Atletismo) resistido pelo teste de Força (Atletismo) ou Destreza (Acrobacia) do alvo. Se for bem-sucedido, a velocidade do alvo torna-se 0." },
  "Empurrar": { level: "Habilidade", desc: "Ação especial de ataque corpo-a-corpo. Você usa sua força física para derrubar um inimigo ou empurrá-lo para longe. Através de um teste de Força (Atletismo) resistido pelo Atletismo ou Acrobacia do alvo, você pode derrubá-lo ou movê-lo 1,5 metro de distância." },
  "Ataque de Oportunidade": { level: "Habilidade", desc: "Reação. Você aproveita um momento de vulnerabilidade para realizar um ataque físico contra uma criatura que saia do seu alcance corpo-a-corpo sem usar a ação de 'Desengajar'. O ataque ocorre pouco antes de a criatura deixar o seu alcance." },
  "Sopro de Dragão (Ancestralidade)": { level: "Habilidade", desc: "Você exala a energia elemental pura do seu ancestral dracônico. Como uma ação, você libera um sopro em cone ou linha que causa dano baseado no seu nível e tipo de herança (Fogo, Frio, Ácido, Elétrico ou Veneno), exigindo um teste de resistência." },
  "Manobra: Ataque de Precisão": { level: "Habilidade", desc: "Você foca sua mira no momento exato do impacto. Ao realizar uma jogada de ataque com arma contra uma criatura, você pode gastar um dado de superioridade e adicioná-lo ao resultado da jogada para garantir que o golpe atinja o alvo." },
  "Manobra: Ataque Ameaçador": { level: "Habilidade", desc: "Seu golpe instila um terror profundo no alvo. Quando atinge uma criatura com um ataque de arma, você pode gastar um dado de superioridade para somar ao dano. Além disso, o alvo deve passar num Save de Sabedoria ou ficará Amedrontado até o fim do seu próximo turno." },
  "Manobra: Ataque de Rasteira": { level: "Habilidade", desc: "Você golpeia as pernas ou o centro de gravidade do seu oponente. Ao atingir com um ataque, pode gastar um dado de superioridade para somar ao dano e forçar um alvo Grande ou menor a realizar um Save de Força; se falhar, ele cai Caído." },
  "Armadura de Sombras": { level: "Habilidade", desc: "Você pode invocar sombras protetoras para envolver seu corpo. Você pode conjurar a magia 'Armadura Arcana' em si mesmo à vontade, sem gastar espaços de magia ou componentes materiais, definindo sua CA base como 13 + seu modificador de Destreza." },
  "Visão do Diabo": { level: "Habilidade", desc: "Seus olhos são imbuídos com uma visão sobrenatural e maligna. Você pode enxergar normalmente tanto em escuridão normal quanto em escuridão mágica em um raio de 36 metros." },
  "Construção Poderosa": { 
    level: "Traço Racial", 
    desc: "Sua musculatura é densa e sua força imensa, permitindo que você realize feitos de carga que desafiam seu tamanho aparente. Você é considerado um tamanho maior para o propósito de determinar sua capacidade de carga e o peso que você pode empurrar, arrastar ou levantar. Você pode mover pedregulhos, carregar suprimentos massivos e dificilmente é sobrecarregado por equipamentos pesados.", 
    castingTime: "Passiva", 
    range: "Pessoal", 
    components: "-", 
    duration: "Permanente" 
  },
  "Cascos": { 
    level: "Traço Racial", 
    desc: "Seus cascos são armas naturais poderosas que podem esmagar ossos e romper armaduras leves. Seus ataques desarmados com os cascos causam 1d4 + seu modificador de Força em dano contundente, em vez do dano normal para um ataque desarmado. Eles são ferramentas letais tanto para o combate quanto para a intimidação física.", 
    castingTime: "Passiva", 
    range: "Pessoal", 
    components: "-", 
    duration: "Permanente" 
  },
  "Investida (Centauro)": { 
    level: "Traço Racial", 
    desc: "A força da sua corrida pode ser convertida em um impacto esmagador. Se você se mover pelo menos 6 metros em linha reta em direção a um alvo e atingi-lo com um ataque de arma no mesmo turno, você pode usar uma ação bônus para desferir um ataque de cascos. Este golpe aproveita o momento da investida para desequilibrar ou incapacitar o oponente.", 
    castingTime: "1 Ação Bônus", 
    range: "Pessoal", 
    components: "-", 
    duration: "Instantânea" 
  },
  "Instintos Mutáveis": { 
    level: "Traço Racial", 
    desc: "Sua herança transmorfa concedeu-lhe uma intuição aguçada sobre o comportamento e as mentiras dos outros. Você ganha proficiência em duas perícias à sua escolha entre: Enganação, Intuição, Intimidação ou Persuasão. Esses instintos são fundamentais para sobreviver em sociedades que muitas vezes temem o que você é.", 
    castingTime: "Passiva", 
    range: "Pessoal", 
    components: "-", 
    duration: "Permanente" 
  },
  "Resistência Duergar": { 
    level: "Traço Racial", 
    desc: "Sua mente é endurecida pelas pressões e perigos das profundezas do Subterrâneo. Você possui vantagem em testes de resistência contra ilusões que tentem enganar seus sentidos e para resistir a ser enfeitiçado ou paralisado por meios mágicos. Sua determinação é fria e inabalável como a rocha.", 
    castingTime: "Passiva", 
    range: "Pessoal", 
    components: "-", 
    duration: "Permanente" 
  },
  "Magia Duergar": { 
    level: "Traço Racial", 
    desc: "Você domina magias ancestrais de distorção física e ocultação. No 3º nível, você pode conjurar 'Aumentar' (apenas em si mesmo). No 5º nível, pode conjurar 'Invisibilidade' (apenas em si mesmo). Você recupera o uso dessas magias após um descanso longo. Inteligência é o seu atributo de conjuração.", 
    castingTime: "1 Ação", 
    range: "Pessoal", 
    components: "V, S", 
    duration: "Especial" 
  },
  "Sensibilidade à Luz Solar": { 
    level: "Traço Racial", 
    desc: "Sua natureza é intrinsecamente ligada às sombras. Você possui desvantagem em jogadas de ataque e testes de Sabedoria (Percepção) que dependam da visão quando você ou o seu alvo estiverem sob luz solar direta. Seus olhos, projetados para a escuridão eterna, são sobrecarregados pelo brilho do sol.", 
    castingTime: "Passiva", 
    range: "Pessoal", 
    components: "-", 
    duration: "Permanente" 
  },
  "Magia Drow": { 
    level: "Traço Racial", 
    desc: "Você herda a astúcia mística dos Elfos Negros. Você conhece o truque 'Globos de Luz'. No 3º nível, pode conjurar 'Fogo das Fadas' e no 5º nível, 'Escuridão'. Você recupera a capacidade de conjurar essas magias após um descanso longo. Carisma é o seu atributo de conjuração.", 
    castingTime: "1 Ação", 
    range: "Especial", 
    components: "V, S", 
    duration: "Especial" 
  },
  "Passo Feérico": { 
    level: "Traço Racial", 
    desc: "Através de uma conexão mística com o Plano Feérico, você pode dobrar o espaço ao seu redor. Como uma ação bônus, você pode se teletransportar magicamente até 9 metros para um local desocupado que você possa ver. Dependendo da sua linhagem sazonal (Primavera, Verão, Outono, Inverno), efeitos adicionais podem ocorrer ao redor do ponto de partida ou de chegada.", 
    castingTime: "1 Ação Bônus", 
    range: "9m", 
    components: "-", 
    duration: "Instantânea" 
  },
  "Voo de Fada": { 
    level: "Traço Racial", 
    desc: "Suas asas, cintilantes com pó estelar, permitem que você deixe o solo para trás. Você possui um deslocamento de voo igual ao seu deslocamento terrestre e pode pairar no ar sem cair. Você não pode voar se estiver usando armadura pesada (ou média, dependendo da linhagem).", 
    castingTime: "Passiva", 
    range: "Pessoal", 
    components: "-", 
    duration: "Permanente" 
  },
  "Magia de Fada": { 
    level: "Traço Racial", 
    desc: "A magia vibrante da natureza flui através de você. Você conhece o truque 'Druidismo'. No 3º nível, pode conjurar 'Fogo das Fadas' e no 5º nível, 'Aumentar/Reduzir'. Você pode usar Inteligência, Sabedoria ou Carisma como seu atributo de conjuração, permitindo uma adaptação perfeita à sua personalidade.", 
    castingTime: "1 Ação", 
    range: "Especial", 
    components: "V, S", 
    duration: "Especial" 
  },
  "Magia Oculta": { 
    level: "Traço Racial", 
    desc: "Com um pensamento, você pode se desvencilhar da percepção alheia. Como uma ação bônus, você fica invisível até o início do seu próximo turno, ou até que você ataque, cause dano ou force alguém a um teste de resistência. Este traço é ideal para reposicionamentos estratégicos ou fugas desesperadas.", 
    castingTime: "1 Ação Bônus", 
    range: "Pessoal", 
    components: "-", 
    duration: "1 rodada" 
  },
  "Fala das Bestas e Folhas": { 
    level: "Traço Racial", 
    desc: "Sua alma está em sintonia com os ritmos naturais. Você pode se comunicar com bestas e plantas como se compartilhasse um idioma. Eles podem não ser capazes de respondê-lo verbalmente, mas entendem suas intenções, e você entende as deles através de sentimentos e imagens simples. Você tem vantagem em testes de Carisma feitos para influenciá-los.", 
    castingTime: "Passiva", 
    range: "Pessoal", 
    components: "-", 
    duration: "Permanente" 
  },
  "Proteção Integrada": { 
    level: "Traço Racial", 
    desc: "Seu corpo foi forjado com camadas extras de defesa. Você ganha um bônus de +1 na sua Classe de Armadura. Além disso, você pode integrar e remover armaduras ao seu corpo como parte de um descanso longo, fundindo as placas à sua estrutura ou desprendendo-as.", 
    castingTime: "Passiva", 
    range: "Pessoal", 
    components: "-", 
    duration: "Permanente" 
  },
  "Resiliência do Construto": { 
    level: "Traço Racial", 
    desc: "Sua fisiologia artificial o torna imune a muitas fraquezas biológicas. Você possui vantagem em testes de resistência contra venenos e resistência a dano de veneno. Você não precisa comer, beber ou respirar, e não sofre cansaço por falta de sono (embora ainda precise de descanso para recuperar habilidades). Você é imune a doenças mundanas.", 
    castingTime: "Passiva", 
    range: "Pessoal", 
    components: "-", 
    duration: "Permanente" 
  },
  "Descendente do Vento": { 
    level: "Traço Racial", 
    desc: "Você possui a leveza do ar em sua respiração. Você pode prender a sua respiração indefinidamente e não pode sofrer sufocamento enquanto não estiver incapacitado. Isso permite que você ignore gases venenosos nos pulmões ou sobreviva em ambientes sem oxigênio por tempo indeterminado.", 
    castingTime: "Passiva", 
    range: "Pessoal", 
    components: "-", 
    duration: "Permanente" 
  },
  "Sopros Infinitos": { 
    level: "Traço Racial", 
    desc: "Você manipula o ar ao seu redor com uma facilidade inata. Você pode conjurar a magia 'Levitar' em si mesmo sem usar componentes materiais. Uma vez que você use este traço, não pode fazê-lo novamente até terminar um descanso longo. Sabedoria ou Carisma pode ser o seu atributo de conjuração.", 
    castingTime: "1 Ação", 
    range: "Pessoal", 
    components: "V, S", 
    duration: "Concentração, até 10 min" 
  },
  "Chamado das Marés": { 
    level: "Traço Racial", 
    desc: "O oceano responde ao seu comando. Você conhece o truque 'Moldar Água'. No 3º nível, pode conjurar 'Criar ou Destruir Água' sem usar componentes materiais uma vez por descanso longo. Sabedoria ou Carisma é o seu atributo de conjuração para este traço.", 
    castingTime: "1 Ação", 
    range: "Especial", 
    components: "V, S", 
    duration: "Especial" 
  },
  "Alcance das Chamas": { 
    level: "Traço Racial", 
    desc: "Uma brasa elemental queima em seu espírito. Você conhece o truque 'Produzir Chama'. No 3º nível, pode conjurar 'Mãos Flamejantes' sem usar componentes materiais uma vez por descanso longo. Inteligência ou Carisma é o seu atributo de conjuração para este traço.", 
    castingTime: "1 Ação", 
    range: "Especial", 
    components: "V, S", 
    duration: "Especial" 
  },
  "Mesclar-se às Rochas": { 
    level: "Traço Racial", 
    desc: "Sua pele e presença podem se fundir visualmente com o ambiente mineral. Você pode conjurar a magia 'Passar sem Rastros' em si mesmo, sem usar componentes materiais, uma vez por descanso longo. Sabedoria ou Carisma é o seu atributo de conjuração.", 
    castingTime: "1 Ação", 
    range: "Pessoal", 
    components: "V, S", 
    duration: "Concentração, até 1 hora" 
  },
  "Psiônica Githyanki": { 
    level: "Traço Racial", 
    desc: "Sua mente é forjada para a guerra e a manipulação espacial. Você conhece 'Mãos Mágicas' (a mão é invisível). No 3º nível, conjura 'Salto' e no 5º nível, 'Passo Nebuloso'. Você recupera a capacidade de conjurar essas magias após um descanso longo. Inteligência é seu atributo de conjuração.", 
    castingTime: "1 Ação", 
    range: "Especial", 
    components: "S", 
    duration: "Especial" 
  },
  "Gatilho de Lebre": { 
    level: "Traço Racial", 
    desc: "Seus reflexos são tão rápidos quanto os de um coelho em alerta constante. Você pode adicionar seu bônus de proficiência em todas as suas jogadas de iniciativa, permitindo que você quase sempre aja antes que o perigo se materialize completamente.", 
    castingTime: "Passiva", 
    range: "Pessoal", 
    components: "-", 
    duration: "Permanente" 
  },
  "Disciplina Mental": { 
    level: "Traço Racial", 
    desc: "Barragens psicomentais protegem seu cérebro de ataques invasivos. Você possui resistência natural a dano psíquico. Essa disciplina é frequentemente associada à meditação profunda e ao autocontrole absoluto.", 
    castingTime: "Passiva", 
    range: "Pessoal", 
    components: "-", 
    duration: "Permanente" 
  },
  "Falsificação": { 
    level: "Traço Racial", 
    desc: "Suas mãos são capazes de reproduzir detalhes minuciosos e texturas precisas. Você possui vantagem em todos os testes realizados para produzir falsificações ou duplicatas perfeitas de artes, documentos ou moedas. Quase nada escapa ao seu olho clínico.", 
    castingTime: "Passiva", 
    range: "Pessoal", 
    components: "-", 
    duration: "Permanente" 
  },
  "Rugido Inspirador": { 
    level: "Traço Racial", 
    desc: "Como uma ação bônus, você emite um rugido de comando que ecoa com autoridade régia. Seus aliados a até 9 metros ganham vantagem em sua próxima jogada de ataque antes do início do seu próximo turno. Esse rugido renova a determinação e a fúria na luta.", 
    castingTime: "1 Ação Bônus", 
    range: "9m", 
    components: "-", 
    duration: "1 rodada" 
  },
  "Couro de Loxodonte": { 
    level: "Traço Racial", 
    desc: "Sua pele é espessa, rugosa e surpreendentemente resistente. Quando você não estiver usando armadura, sua CA é igual a 12 + seu modificador de Constituição. Você pode usar um escudo e ainda ganhar este benefício. Armaduras leves e médias raramente são tão eficazes quanto sua própria anatomia.", 
    castingTime: "Passiva", 
    range: "Pessoal", 
    components: "-", 
    duration: "Permanente" 
  },
  "Tromba": { 
    level: "Traço Racial", 
    desc: "Sua tromba é um membro preênsil incrivelmente forte e versátil. Você pode usá-la para manipular objetos simples, carregar itens de até 15 quilos, respirar sob a água ou desferir ataques desarmados com alcance de 1,5 metro. Ela é um terceiro braço indispensável.", 
    castingTime: "Passiva", 
    range: "1,5m", 
    components: "-", 
    duration: "Permanente" 
  },
  "Criação Reacionária": { 
    level: "Traço Racial", 
    desc: "Você possui a habilidade ancestral de transformar restos mortais em ferramentas de sobrevivência. Durante um descanso curto, você pode fabricar um escudo, uma clava, dardos ou flechas a partir dos ossos, couro e tendões de uma criatura morta de tamanho Médio ou maior.", 
    castingTime: "Passiva", 
    range: "Pessoal", 
    components: "-", 
    duration: "Permanente" 
  },
  "Salto de Coelho": { 
    level: "Traço Racial", 
    desc: "Como uma ação bônus, você pode realizar um salto explosivo sem provocar ataques de oportunidade. O salto cobre uma distância de 5 vezes o seu bônus de proficiência (em metros). Este movimento é vital para escapar de cercos ou flanquear inimigos rapidamente.", 
    castingTime: "1 Ação Bônus", 
    range: "Pessoal", 
    components: "-", 
    duration: "Instantânea" 
  },
  "Treinamento Marcial": { 
    level: "Traço Racial", 
    desc: "Sua sociedade valoriza o domínio das armas de guerra desde cedo. Você possui proficiência em duas armas de guerra de sua escolha e em armaduras leves. Esse treinamento é o pilar da sua disciplina em campo de batalha.", 
    castingTime: "Passiva", 
    range: "Pessoal", 
    components: "-", 
    duration: "Permanente" 
  },
  "Salvo pela Face": { 
    level: "Traço Racial", 
    desc: "A sorte e o incentivo de seus aliados o salvam nos momentos mais críticos. Se falhar em uma jogada de ataque, teste de atributo ou teste de resistência, você ganha um bônus no resultado igual ao número de aliados visíveis a até 9 metros (máximo +5). Você recupera o uso deste traço após um descanso curto ou longo.", 
    castingTime: "Passiva", 
    range: "9m", 
    components: "-", 
    duration: "Instantânea" 
  },
  "Conexão Dupla": { 
    level: "Traço Racial", 
    desc: "Sua mente está ancorada em duas realidades ou almas em harmonia. Você possui vantagem em todos os testes de resistência de Sabedoria, protegendo-o contra confusões mentais, possessões e magias que tentem dominar sua vontade.", 
    castingTime: "Passiva", 
    range: "Pessoal", 
    components: "-", 
    duration: "Permanente" 
  },
  "Telepatia Limitada": { 
    level: "Traço Racial", 
    desc: "Sua mente pode tocar a mente de outros de forma unidirecional. Você pode falar mentalmente com qualquer criatura que você possa ver em um raio de 9 metros. A criatura não precisa compartilhar um idioma com você, mas precisa ser capaz de entender ao menos um idioma para compreender sua mensagem.", 
    castingTime: "Passiva", 
    range: "9m", 
    components: "-", 
    duration: "Permanente" 
  },
  "Persuasão Inata": { 
    level: "Traço Racial", 
    desc: "Você possui uma aura de autoridade amigável ou intimidadora que facilita o diálogo. Você ganha proficiência na perícia Persuasão. Suas palavras carregam o peso da honestidade ou da convicção absoluta, abrindo portas que outros encontrariam trancadas.", 
    castingTime: "Passiva", 
    range: "Pessoal", 
    components: "-", 
    duration: "Permanente" 
  },
  "Agressividade": { level: "Traço Racial", desc: "Como uma ação bônus, você pode se mover até o seu deslocamento terrestre em direção a uma criatura hostil que você possa ver, fechando a distância com uma feracidade implacável." },
  "Prontidão Adrenérgica": { level: "Traço Racial", desc: "Seus instintos de sobrevivência são aguçados pela adrenalina constante. Você possui proficiência em duas perícias à sua escolha entre: Adestrar Animais, Intuição, Intimidação, Natureza, Percepção ou Sobrevivência." },
  "Fôlego Preso": { level: "Traço Racial", desc: "Sua constituição pulmonar única permite períodos prolongados sem oxigênio. Você pode prender a sua respiração por até 15 minutos sem sofrer os efeitos de sufocamento." },
  "Agilidade Felina": { level: "Traço Racial", desc: "Sua agilidade natural permite surtos de velocidade estonteante. Você pode dobrar o seu deslocamento por um turno. Você deve passar um turno sem se mover antes de poder usar esta habilidade novamente." },
  "Garras de Gato": { level: "Traço Racial", desc: "Seas garras são ferramentas perfeitas para escalada e combate. Seus ataques desarmados causam 1d4 + modificador de Força em dano cortante, e você tem um deslocamento de escalada natural de 6 metros." },
  "Casco Natural": { level: "Traço Racial", desc: "Seu corpo é protegido por um casco maciço e impenetravel. Sua CA é 17 quando não estiver usando armadura. Você não pode usar armadura e não adiciona seu bônus de Destreza à sua CA." },
  "Defesa de Casco": { level: "Traço Racial", desc: "Como uma ação, você pode se retrair para dentro do seu casco. Enquanto estiver lá, você ganha um bônus de +4 na sua CA e vantagem em testes de resistência de Força e Constituição, mas desvantagem em Destreza e não pode se mover." },
  "Controle do Ar e da Água": { level: "Traço Racial", desc: "Você detém o controle sutil dos elementos da tempestade. Você conhece 'Névoa Obscurecente'. No 3º nível, pode conjurar 'Lufada de Vento' e no 5º nível, 'Muralha de Água'. O Carisma é seu atributo de conjuração." },
  "Emissário do Mar": { level: "Traço Racial", desc: "Sua conexão com os oceanos permite uma comunicação empática. Você pode comunicar conceitos e ideias simples para qualquer animal que possua um deslocamento de natação natural." },
  "Desprendimento Vedalken": { level: "Traço Racial", desc: "Sua mente é inerentemente racional e distante, protegendo-o de influências externas. Você possui vantagem em todos os testes de resistência de Inteligência, Sabedoria e Carisma." },
  "Cura de Sangue Negro": { level: "Traço Racial", desc: "Sua vitalidade monstruosa permite que você se cure de ferimentos de forma mais eficiente. Sempre que você rolar um 1 ou 2 em um dado de vida para recuperar pontos de vida, você pode rolar o dado novamente." },

  "Voo (Aarakocra)": {
    level: "Traço Racial",
    desc: "Você possui um deslocamento de voo de 15 metros. Para usar esse deslocamento, você não pode estar usando armadura média ou pesada. O voo permite que você ignore obstáculos terrestres e se posicione estrategicamente acima de seus inimigos.",
    castingTime: "Passiva",
    range: "Pessoal",
    components: "-",
    duration: "Permanente"
  },
  "Garras (Aarakocra)": {
    level: "Traço Racial",
    desc: "Suas garras são armas naturais extremamente afiadas. Você pode usá-las para realizar ataques desarmados que causam 1d4 + modificador de Força em dano cortante, perfurando o couro e a carne com facilidade.",
    castingTime: "Passiva",
    range: "Toque",
    components: "-",
    duration: "Permanente"
  },
  "Lufada de Vento (Aarakocra)": {
    level: "Traço Racial",
    desc: "Sua habilidade de manipular as correntes de ar permite que você projete um vendaval súbito. Uma linha de vento forte de 18 metros de comprimento e 3 metros de largura emana de você. Cada criatura que começar seu turno na área deve realizar um teste de resistência de Força ou será empurrada 4,5 metros para longe. Além disso, criatuas na linha devem gastar 2m de movimento para cada 1m que avancem em sua direção. O vento dispersa fumaça e apaga chamas fracas.",
    castingTime: "1 Ação",
    range: "18m (Linha)",
    components: "V, S",
    duration: "Concentração, até 1 minuto"
  },
  "Garras (Tortle)": {
    level: "Traço Racial",
    desc: "Suas garras são ferramentas pesadas e resistentes. Seus ataques desarmados causam 1d4 + modificador de Força em dano cortante. Elas são úteis tanto para o combate quanto para manipulações brutas no ambiente.",
    castingTime: "Passiva",
    range: "Toque",
    components: "-",
    duration: "Permanente"
  },
  "Armadura Natural (Tortle)": {
    level: "Traço Racial",
    desc: "Seu casco oferece uma proteção maciça. Sua CA base é 17, independentemente da Destreza. Você não pode usar armadura, mas pode se beneficiar do uso de um escudo normalmente.",
    castingTime: "Passiva",
    range: "Pessoal",
    components: "-",
    duration: "Permanente"
  },
  "Defesa da Casca": {
    level: "Traço Racial",
    desc: "Como uma ação, você entra no seu casco. Enquanto estiver lá, você ganha +4 na CA e vantagem em testes de resistência de Força e Constituição. No entanto, você fica Caído, tem desvantagem em testes de resistência de Destreza, seu deslocamento se torna 0 e você não pode realizar reações.",
    castingTime: "1 Ação",
    range: "Pessoal",
    components: "-",
    duration: "Até sair"
  },
  "Mordida (Racial)": {
    level: "Traço Racial",
    desc: "Sua mandíbula poderosa é uma arma letal. Seus ataques desarmados podem ser mordidas que causam 1d6 + modificador de Força em dano perfurante.",
    castingTime: "Passiva",
    range: "Toque",
    components: "-",
    duration: "Permanente"
  },
  "Artesão Ágil": {
    level: "Traço Racial",
    desc: "Com partes de uma criatura Pequena ou maior que tenha morrido, você pode fabricar itens simples durante um descanso curto: um escudo, uma clava, dardos ou flechas. Suas mãos são treinadas para improvisar com o que a natureza oferece.",
    castingTime: "Descanso Curto",
    range: "Pessoal",
    components: "-",
    duration: "Instantânea"
  },
  "Prender o Fôlego": {
    level: "Traço Racial",
    desc: "Sua anatomia resiliente permite que você fique sem respirar por até 15 minutos de cada vez. Útil para emboscadas aquáticas ou para sobreviver em ambientes com gases tóxicos.",
    castingTime: "Passiva",
    range: "Pessoal",
    components: "-",
    duration: "Permanente"
  },
  "Mandíbulas Famintas": {
    level: "Traço Racial",
    desc: "Em um ataque de mordida, você pode morder com uma fúria selvagem. Se acertar, você causa o dano normal e ganha pontos de vida temporários iguais ao seu bônus de proficiência. Uma vez usado, você deve terminar um descanso curto ou longo para usar novamente.",
    castingTime: "1 Ação Bônus",
    range: "Toque",
    components: "-",
    duration: "Instantânea"
  },

  "Consertar": { level: "Truque", school: "Transmutação", desc: "Esta magia repara um único quebro ou rasgo em um objeto que você toca, como um elo de corrente quebrado, duas metades de uma chave partida, um rasgo em uma capa ou um vazamento em um odre. Desde que o quebro ou rasgo não tenha mais de 30 centímetros em qualquer dimensão, você o conserta, não deixando nenhum vestígio do dano anterior. Esta magia pode reparar fisicamente um item mágico ou constructo, mas a magia não restaura a magia em tais objetos.", castingTime: "1 minuto", range: "Toque", components: "V, S, M (Duas pedras magnéticas)", duration: "Instantânea", concentration: false },
  "Criar Chamas": { level: "Truque", school: "Conjuração", desc: "Uma chama pequena aparece em sua mão. A chama permanece lá pela duração e não prejudica você nem seu equipamento. A chama emite luz plena em um raio de 3 metros e penumbra por mais 3 metros. A magia termina se você a dissipar como uma ação ou se você conjurá-la novamente. Você também pode atacar com a chama, embora fazer isso encerre a magia. Quando você conjura esta magia, ou como uma ação em um turno posterior, você pode arremessar a chama em uma criatura a até 9 metros de você. Faça uma jogada de ataque de magia à distância. Se acertar, o alvo sofre 1d8 de dano de fogo. O dano aumenta em 1d8 no 5° (2d8), 11° (3d8) e 17° (4d8) níveis.", castingTime: "1 Ação", range: "Pessoal", components: "V, S", duration: "10 minutos", concentration: false },
  "Estilhaço de Gelo": { level: "Truque", school: "Evocação", desc: "Você projeta um fragmento de gelo contra uma criatura dentro do alcance. Faça uma jogada de ataque de magia à distância. Se acertar, o alvo sofre 1d8 de dano de frio e seu deslocamento é reduzido em 3 metros até o início do seu próximo turno. O dano aumenta em 1d8 no 5° (2d8), 11° (3d8) e 17° (4d8) níveis.", castingTime: "1 Ação", range: "18m", components: "V, S", duration: "Instantânea", concentration: false },
  "Globos de Luz": { level: "Truque", school: "Evocação", desc: "Você cria até quatro luzes do tamanho de tochas dentro do alcance, fazendo-as parecer tochas, lanternas ou esferas brilhantes que flutuam no ar pela duração. Você também pode combinar as quatro luzes em uma forma luminescente, vagamente humanoide, de tamanho Médio. À escolha sua, cada luz emite penumbra em um raio de 3 metros. Como uma ação bônus no seu turno, você pode mover as luzes por até 18 metros para um novo ponto dentro do alcance. Uma luz deve estar a até 6 metros de outra luz criada por esta magia e uma luz some se exceder o alcance da magia.", castingTime: "1 Ação", range: "36m", components: "V, S, M (Um pouco de fósforo ou erva-dos-bruxos ou um pirilampo)", duration: "Concentração, até 1 min", concentration: true },
  "Lufada": { level: "Truque", school: "Transmutação", desc: "Você toma o controle do ar e cria um dos seguintes efeitos em um ponto que você possa ver dentro do alcance: Uma criatura Média ou menor que você escolher deve ser bem-sucedida em um teste de resistência de Força ou será empurrada por até 1,5 metro para longe de você; você cria uma lufada de ar pequena capaz de mover um objeto que não esteja sendo carregado ou segurado e que não pese mais de 2,5 quilos. O objeto é empurrado por até 3 metros para longe de você; ou você cria um efeito sensorial inofensivo utilizando o ar, como fazer folhas soprarem, janelas baterem ou suas roupas se agitarem com a brisa.", castingTime: "1 Ação", range: "9m", components: "V, S", duration: "Instantânea", concentration: false },
  "Mensagem": { level: "Truque", school: "Transmutação", desc: "Você aponta seu dedo para uma criatura dentro do alcance e sussurra uma mensagem. O alvo (e somente ele) ouve a mensagem e pode responder em um sussurro que apenas você ouve. Você pode conjurar esta magia através de objetos sólidos se você estiver familiarizado com o alvo e souber que ele está além da barreira. 30 centímetros de rocha, 2,5 centímetros de metal comum, uma fina camada de chumbo ou 90 centímetros de madeira ou terra bloqueiam a magia. A magia não precisa seguir uma linha reta e pode viajar livremente através de cantos ou aberturas.", castingTime: "1 Ação", range: "36m", components: "V, S, M (Um pequeno pedaço de fio de cobre)", duration: "1 rodada", concentration: false },
  "Moldar Água": { level: "Truque", school: "Transmutação", desc: "Você escolhe uma área de água que possa ver dentro do alcance e que caiba em um cubo de 1,5 metro. Você pode manipular a água de uma das seguintes formas: você move instantaneamente ou muda o fluxo da água como desejar por até 1,5 metro (este movimento não causa dano); você faz a água formar formas simples e animá-las sob seu comando (dura 1 hora); você muda a cor ou opacidade da água (dura 1 hora); ou você congela a água, desde que não haja criaturas nela (dura 1 hora).", castingTime: "1 Ação", range: "9m", components: "S", duration: "Instantânea (ou 1 hora)", concentration: false },
  "Moldar Terra": { level: "Truque", school: "Transmutação", desc: "Você escolhe uma área de terra frouxa que possa ver dentro do alcance e que caiba em um cubo de 1,5 metro. Você pode manipular a terra de uma das seguintes formas: você escava a terra frouxa instantaneamente e a move por até 1,5 metro ao longo do chão (este movimento não causa dano); você faz com que formas, como relevos ou símbolos, apareçam na terra frouxa; ou você torna a terra frouxa em um terreno difícil ou normal (duras 1 hora). Você pode ter até dois desses efeitos não-instantâneos ativos por vez.", castingTime: "1 Ação", range: "9m", components: "S", duration: "Instantânea (ou 1 hora)", concentration: false },
  "Orientação": { level: "Truque", school: "Adivinhação", desc: "Você toca uma criatura voluntária. Uma vez, antes da magia acabar, o alvo pode rolar um d4 e adicionar o número rolado a um teste de atributo de sua escolha. Ele pode rolar o dado antes ou depois de realizar o teste de atributo. A magia então termina.", castingTime: "1 Ação", range: "Toque", components: "V, S", duration: "Concentração, até 1 min", concentration: true },
  "Proteção contra Lâminas": { level: "Truque", school: "Abjuração", desc: "Você estende sua mão e traça um símbolo de proteção no ar. Até o final do seu próximo turno, você tem resistência a dano contundente, cortante e perfurante desferido por ataques de armas.", castingTime: "1 Ação", range: "Pessoal", components: "V, S", duration: "1 rodada", concentration: false },
  "Rajada de Veneno": { level: "Truque", school: "Conjuração", desc: "Você projeta uma nuvem púululante de gás tóxico da palma da sua mão. Uma criatura que você possa ver dentro do alcance deve ser bem-sucedida em um teste de resistência de Constituição ou sofrerá 1d12 de dano de veneno. O dano aumenta em 1d12 no 5° (2d12), 11° (3d12) e 17° (4d12) níveis.", castingTime: "1 Ação", range: "3m", components: "V, S", duration: "Instantânea", concentration: false },
  "Resistência": { level: "Truque", school: "Abjuração", desc: "Você toca uma criatura voluntária e a imbuí com uma força interior resiliente. Uma vez, antes da magia acabar, o alvo pode rolar um d4 e adicionar o número rolado a um teste de resistência de sua escolha. Ele pode rolar o dado antes ou depois de realizar o teste. A magia então termina.", castingTime: "1 Ação", range: "Toque", components: "V, S, M (Uma miniatura de manto)", duration: "Concentração, até 1 min", concentration: true },
  "Taumaturgia": { level: "Truque", school: "Transmutação", desc: "Você manifesta um pequeno milagre, uma demonstração de poder sobrenatural, dentro do alcance. Você cria um dos seguintes efeitos mágicos: sua voz ressoa com o triplo do volume normal por 1 minuto; você faz chamas de velas, tochas ou fogueiras tremularem, brilharem, diminuírem ou mudarem de cor por 1 minuto; você causa tremores inofensivos no chão por 1 minuto; você cria um som instantâneo que se origina de um ponto à sua escolha dentro do alcance; ou você faz uma porta ou janela destrancada se abrir ou fechar subitamente.", castingTime: "1 Ação", range: "9m", components: "V", duration: "Até 1 minuto", concentration: false },
  "Pirotecnia": { level: "2º Nível", school: "Transmutação", desc: "Você seleciona uma área de chamas não-mágicas que você possa ver dentro do alcance e que caiba em um cubo de 1,5 metro. Você pode extinguir o fogo na área e criar ou fogo de artifício ou fumaça. Fogos de Artifício: O alvo explode com luzes coloridas. Cada criatura a até 3 metros deve passar num Save de Constituição ou ficará Cega até o final do seu próximo turno. Fumaça: Uma espessa nuvem de fumaça negra se espalha num raio de 6 metros, obscurecendo a área por 1 minuto.", castingTime: "1 Ação", range: "18m", components: "V, S", duration: "Instantânea", concentration: false },
  "Palavra de Resplendor": { level: "Truque", school: "Evocação", desc: "Você profere uma palavra divina e uma luz brilhante explode de você. Cada criatura à sua escolha que você possa ver dentro do alcance deve ser bem-sucedida em um teste de resistência de Constituição ou sofrerá 1d6 de dano radiante. O dano aumenta em 1d6 no 5° (2d6), 11° (3d6) e 17° (4d6) níveis.", castingTime: "1 Ação", range: "1,5m", components: "V, M (Um símbolo sagrado)", duration: "Instantânea", concentration: false },
  "Heroísmo": { level: "1º Nível", school: "Encantamento", desc: "Uma criatura voluntária é imbuída de coragem divina. Ela torna-se imune ao medo e ganha pontos de vida temporários iguais ao seu modificador de atributo no início de cada um dos turnos dela.", castingTime: "1 Ação", range: "Toque", components: "V, S", duration: "Concentração, até 1 min", concentration: true },
  "Leque Cromático": { level: "1º Nível", school: "Ilusão", desc: "Um leque deslumbrante de cores projeta-se das suas mãos. Role 6d10; o total é o número de pontos de vida de criaturas que você pode afetar (da menor para a maior). Criaturas afetadas ficam Cegas pela duração.", castingTime: "1 Ação", range: "4,5m (Cone)", components: "V, S, M", duration: "1 rodada", concentration: false },
  "Passos Longos": { level: "1º Nível", school: "Transmutação", desc: "Você toca uma criatura e aumenta seu deslocamento terrestre em 3 metros até que a magia termine, permitindo que ela se mova com uma agilidade sobrenatural.", castingTime: "1 Ação", range: "Toque", components: "V, S, M", duration: "1 hora", concentration: false },
  "Perdição": { level: "1º Nível", school: "Encantamento", desc: "Você amaldiçoa até três criaturas que possa ver. Cada alvo deve passar num Save de Carisma ou subtrair 1d4 de todas as suas jogadas de ataque e testes de resistência pela duração.", castingTime: "1 Ação", range: "9m", components: "V, S, M", duration: "Concentração, até 1 min", concentration: true },
  "Raio Adoecente": { level: "1º Nível", school: "Necromancia", desc: "Um raio de energia esmeralda doentia dispara em direção a uma criatura. Se acertar o ataque de magia, causa 2d8 de dano necrótico e o alvo deve passar num Save de Constituição ou ficará Envenenado até o fim do seu próximo turno.", castingTime: "1 Ação", range: "18m", components: "V, S", duration: "Instantânea", concentration: false },
  "Recuo Acelerado": { level: "1º Nível", school: "Transmutação", desc: "Você canaliza magia em suas pernas para ganhar uma velocidade incrível. Pela duração da magia, você pode realizar a ação de Disparada como uma ação bônus em cada um dos seus turnos.", castingTime: "1 Ação Bônus", range: "Pessoal", components: "V, S", duration: "Concentração, até 10 min", concentration: true },
  "Santuário": { 
    level: "1º Nível", 
    school: "Abjuração", 
    desc: "Você cria uma ala protetora ao redor de uma criatura. Qualquer inimigo que tente atacar o alvo ou afetá-lo com uma magia prejudicial deve primeiro passar num teste de resistência de Sabedoria. Se falhar, deve escolher um novo alvo ou perder o ataque/ação. A magia termina se o alvo protegido realizar um ataque ou conjurar uma magia que afete um inimigo.", 
    castingTime: "1 Ação Bônus", 
    range: "9m", 
    components: "V, S, M (Um pequeno espelho)", 
    duration: "1 minuto", 
    concentration: false 
  },
  "Sono": { 
    level: "1º Nível", 
    school: "Encantamento", 
    desc: "Você projeta um arco de areia mágica e poeira estrela que mergulha as criaturas em um torpor místico. Role 5d8; o total é o número de pontos de vida de criaturas que caem em um sono profundo (Inconscientes). Começando pela criatura com menos PV na área de uma esfera de 6m de raio.", 
    castingTime: "1 Ação", 
    range: "27m", 
    components: "V, S, M (Uma pitada de areia fina)", 
    duration: "1 minuto", 
    concentration: false 
  },
  "Acalmar Emoções": { level: "2º Nível", school: "Encantamento", desc: "Você tenta suprimir emoções fortes em um grupo de humanoides. Você pode tornar um alvo indiferente a criaturas que ele seja hostil ou encerrar efeitos que o deixem enfeitiçado ou amedrontado.", castingTime: "1 Ação", range: "18m", components: "V, S", duration: "Concentração, até 1 min", concentration: true },
  "Acesso de Raiva": { level: "2º Nível", school: "Encantamento", desc: "Você instiga uma fúria cega em uma criatura. O alvo deve passar num Save de Sabedoria ou terá vantagem em ataques corpo-a-corpo e sofrerá desvantagem em testes de resistência de Inteligência e Sabedoria.", castingTime: "1 Ação", range: "18m", components: "V, S, M", duration: "Concentração, até 1 min", concentration: true },
  "Alterar-se": { level: "2º Nível", school: "Transmutação", desc: "Você altera sua forma física. Você pode ganhar Brânquias para respirar na água, Garras para ataques naturais potentes (1d6 + For) ou Mudar de Aparência para se transformar em outra pessoa.", castingTime: "1 Ação", range: "Pessoal", components: "V, S", duration: "Concentração, até 1 hora", concentration: true },
  "Arma Mágica": { level: "2º Nível", school: "Transmutação", desc: "Você toca uma arma não-mágica. Até a magia acabar, a arma torna-se uma arma mágica com bônus de +1 nas jogadas de ataque e dano.", castingTime: "1 Ação Bônus", range: "Toque", components: "V, S", duration: "Concentração, até 1 hora", concentration: true },
  "Arrombar": { level: "2º Nível", school: "Transmutação", desc: "Você escolhe um objeto que possa ver no alcance. Um alvo trancado por meios mundanos ou mágicos (como trincos, cadeados ou a magia Tranca Arcana) é aberto de forma barulhenta e repentina.", castingTime: "1 Ação", range: "18m", components: "V", duration: "Instantânea", concentration: false },
  "Aumentar/Reduzir": { level: "2º Nível", school: "Transmutação", desc: "Você altera o tamanho de uma criatura ou objeto. 'Aumentar' dobra o tamanho e dá vantagem em testes de Força e +1d4 de dano. 'Reduzir' corta o tamanho pela metade, dá desvantagem em Força e -1d4 de dano.", castingTime: "1 Ação", range: "9m", components: "V, S, M", duration: "Concentração, até 1 min", concentration: true },
  "Aviso": { level: "2º Nível", school: "Adivinhação", desc: "Você coloca um gatilho mental em uma criatura. Quando ela for alvo de um ataque ou estiver em perigo imediato, você recebe um aviso mental se estiver a até 9m dela.", castingTime: "1 Ação Bônus", range: "9m", components: "V, S", duration: "Concentração, até 8 horas", concentration: true },
  "Cegueira/Surdez": { level: "2º Nível", school: "Necromancia", desc: "Você amaldiçoa uma criatura. O alvo deve fazer um Save de Constituição. Se falhar, fica Cego ou Surdo (à sua escolha). Ele pode repetir o teste no final de cada um de seus turnos para encerrar o efeito.", castingTime: "1 Ação", range: "9m", components: "V", duration: "1 minuto", concentration: false },
  "Chama Contínua": { level: "2º Nível", school: "Evocação", desc: "Uma chama que não produz calor nem consome oxigênio surge em um objeto que você toca. A chama parece uma tocha normal, mas é eterna e não pode ser apagada por meios convencionais.", castingTime: "1 Ação", range: "Toque", components: "V, S, M", duration: "Até ser dissipada", concentration: false },
  "Coroa da Loucura": { level: "2º Nível", school: "Encantamento", desc: "Uma coroa retorcida de ferro e sombras aparece na cabeça de um humanoide. O alvo fica encantado por você e deve usar sua ação para atacar uma criatura à sua escolha que você designar mentalmente.", castingTime: "1 Ação", range: "36m", components: "V, S", duration: "Concentração, até 1 min", concentration: true },
  "Crescimento de Espinhos": { level: "2º Nível", school: "Transmutação", desc: "O chão em um raio de 6m torna-se retorcido e espinhoso. A área é terreno difícil. Quando uma criatura se move na área, ela sofre 2d4 de dano perfurante para cada 1,5m que se deslocar.", castingTime: "1 Ação", range: "45m", components: "V, S, M", duration: "Concentração, até 10 min", concentration: true },
  "Detectar Pensamentos": { level: "2º Nível", school: "Adivinhação", desc: "Você foca sua mente nos pensamentos superficiais de uma criatura próxima. Você pode ler o que ela está pensando no momento ou tentar sondar mais profundamente, forçando um teste de Sabedoria.", castingTime: "1 Ação", range: "Pessoal (9m)", components: "V, S, M", duration: "Concentração, até 1 min", concentration: true },
  "Espírito Curador": { level: "2º Nível", school: "Conjuração", desc: "Você evoca um espírito da natureza em um espaço. Quando uma criatura entra no espaço do espírito ou termina seu turno lá, você pode curá-la em 1d6 PV. O espírito pode ser movido 9m.", castingTime: "1 Ação Bônus", range: "18m", components: "V, S", duration: "Concentração, até 1 min", concentration: true },
  "Escuridão": { level: "2º Nível", school: "Evocação", desc: "Uma escuridão mágica emana de um ponto que você escolher, preenchendo uma esfera de 4,5m de raio. Criaturas com visão no escuro não podem ver através dela e nenhuma luz não-mágica pode iluminá-la.", castingTime: "1 Ação", range: "18m", components: "V, M", duration: "Concentração, até 10 min", concentration: true },
  "Força Fantasmagórica": { level: "2º Nível", school: "Ilusão", desc: "Você cria uma ilusão profunda na mente de um alvo. Ele acredita que a ilusão é um objeto, criatura ou fenômeno real e sofrerá 1d6 de dano psíquico por turno se interagir com ela de forma perigosa.", castingTime: "1 Ação", range: "18m", components: "V, S, M", duration: "Concentração, até 1 min", concentration: true },
  "Levitar": { level: "2º Nível", school: "Transmutação", desc: "Uma criatura ou objeto à sua escolha é erguido verticalmente até 6m no ar. Um alvo involuntário pode fazer um Save de Constituição para resistir. Você pode mudar a altura do alvo em seu turno.", castingTime: "1 Ação", range: "18m", components: "V, S, M", duration: "Concentração, até 10 min", concentration: true },
  "Mensageiro Animal": { level: "2º Nível", school: "Encantamento", desc: "Você convoca uma besta miúda para entregar uma mensagem. Você especifica um local e um destinatário e o animal viaja até lá para transmitir sua mensagem de até 25 palavras.", castingTime: "1 Ação (ou ritual)", range: "9m", components: "V, S, M", duration: "24 horas", concentration: false },
  "Montaria Fantasma": { level: "2º Nível", school: "Ilusão", desc: "Você convoca uma montaria ilusória para si ou para um aliado. A montaria tem o aspecto de um cavalo e uma velocidade de 30m, mas desaparece se sofrer qualquer dano.", castingTime: "1 Ação (ou ritual)", range: "9m", components: "V, S", duration: "1 hora", concentration: false },
  "Oração Curativa": { level: "2º Nível", school: "Abjuração", desc: "Você canaliza energia divina para curar seus aliados ao longo de uma breve meditação. Você recupera 2d8 + seu modificador de atributo de pontos de vida de até seis criaturas.", castingTime: "10 minutos", range: "9m", components: "V", duration: "Instantânea", concentration: false },
  "Passos sem Pegadas": { level: "2º Nível", school: "Abjuração", desc: "Uma sombra e silêncio envolvem você e seus companheiros. Cada criatura à sua escolha a até 9m de você ganha um bônus de +10 em testes de Destreza (Furtividade) e não pode ser rastreada por meios não-mágicos.", castingTime: "1 Ação", range: "Pessoal", components: "V, S, M", duration: "Concentração, até 1 hora", concentration: true },
  "Raio do Enfraquecimento": { level: "2º Nível", school: "Necromancia", desc: "Um raio de energia negra dispara de sua mão. Se acertar o ataque de magia, o alvo causa apenas metade do dano com ataques de arma baseados em Força até que a magia termine.", castingTime: "1 Ação", range: "18m", components: "V, S", duration: "Concentração, até 1 min", concentration: true },
  "Reflexos": { 
    level: "2º Nível", 
    school: "Ilusão", 
    desc: "Três duplicatas ilusórias de você aparecem em seu espaço. Até a magia acabar, as duplicatas movem-se com você e imitam suas ações, mudando de posição para que seja impossível rastrear qual imagem é real. Cada vez que uma criatura alveja você com um ataque enquanto a magia durar, role um d20 para determinar se o ataque alveja você ou uma de suas duplicatas. Se você tiver três duplicatas, você deve rolar 6 ou mais para mudar o alvo para uma duplicata. Com duas, 8 ou mais. Com uma, 11 ou mais. Uma duplicata tem CA 10 + seu mod de Destreza. Se um ataque atingir uma duplicata, a duplicata é destruída.", 
    castingTime: "1 Ação", 
    range: "Pessoal", 
    components: "V, S", 
    duration: "1 minuto", 
    concentration: false 
  },
  "Nublar": { 
    level: "2º Nível", 
    school: "Ilusão", 
    desc: "Sua imagem torna-se borrada, ondulante e incerta para todos que o veem. Pela duração, qualquer criatura tem desvantagem nas jogadas de ataque contra você. Um atacante é imune a esse efeito se não depender da visão, como com percepção cega, ou se puder ver através de ilusões, como com visão verdadeira.", 
    castingTime: "1 Ação", 
    range: "Pessoal", 
    components: "V", 
    duration: "Concentração, até 1 minuto", 
    concentration: true 
  },
  "Restauração Menor": { level: "2º Nível", school: "Abjuração", desc: "Você toca uma criatura e encerra uma doença ou uma condição que a esteja afligindo. A condição pode ser Cego, Surdo, Paralisado ou Envenenado.", castingTime: "1 Ação", range: "Toque", components: "V, S", duration: "Instantânea", concentration: false },
  "Flecha Ácida de Melf": { level: "2º Nível", school: "Evocação", desc: "Uma flecha cintilante de ácido verde atinge um alvo. Causa 4d4 de dano de ácido imediatamente e mais 2d4 de dano de ácido no final do próximo turno do alvo. No erro, causa metade do dano inicial.", castingTime: "1 Ação", range: "27m", components: "V, S, M", duration: "Instantânea", concentration: false },
  "Silêncio": { level: "2º Nível", school: "Ilusão", desc: "Pela duração, nenhum som pode ser criado ou atravessar uma esfera de 6m de raio centrada em um ponto. Qualquer criatura na área fica Surda e é imune a dano de trovão e não pode conjurar magias com componentes verbais.", castingTime: "1 Ação (ou ritual)", range: "36m", components: "V, S", duration: "Concentração, até 10 min", concentration: true },
  "Sugestão": { level: "2º Nível", school: "Encantamento", desc: "Você sugere um curso de atividade (limitado a uma ou duas frases) a uma criatura. O curso deve parecer razoável. O alvo deve passar num Save de Sabedoria ou seguirá sua sugestão por até 8 horas.", castingTime: "1 Ação", range: "9m", components: "V, M", duration: "Concentração, até 8 horas", concentration: true },
  "Truque de Corda": { level: "2º Nível", school: "Transmutação", desc: "Você toca uma corda e uma de suas extremidades sobe para um espaço extradimensional invisível. Até oito criaturas podem subir na corda e se esconder no espaço, onde ficam seguras de observação externa.", castingTime: "1 Ação", range: "Toque", components: "V, S, M", duration: "1 hora", concentration: false },
  "Vento Protetor": { level: "2º Nível", school: "Transmutação", desc: "Ventos fortes giram ao seu redor em um raio de 3m. Inimigos têm desvantagem em ataques à distância contra você e a área é considerada terreno difícil para outras criaturas.", castingTime: "1 Ação", range: "Pessoal", components: "V", duration: "Concentração, até 10 min", concentration: true },
  "Ver o Invisível": { level: "2º Nível", school: "Adivinhação", desc: "Pela duração, você vê criaturas e objetos invisíveis como se fossem visíveis e pode ver no Plano Etéreo em um raio de 18m de você.", castingTime: "1 Ação", range: "Pessoal", components: "V, S, M", duration: "1 hora", concentration: false },
  "Vínculo Protetor": { level: "2º Nível", school: "Abjuração", desc: "Você cria uma conexão mística com um aliado. O aliado ganha +1 na CA e testes de resistência, e sempre que ele sofrer dano, você sofre a mesma quantidade de dano (ignorando suas resistências).", castingTime: "1 Ação", range: "Toque", components: "V, S, M", duration: "1 hora", concentration: false },
  "Andar na Água": { level: "3º Nível", school: "Transmutação", desc: "Esta magia concede a habilidade de se mover através de qualquer superfície líquida - como água, lama, neve, areia movediça ou lava - como se fosse chão sólido.", castingTime: "1 Ação (ou ritual)", range: "9m", components: "V, S, M", duration: "1 hora", concentration: false },
  "Dissipar Magia": { level: "3º Nível", school: "Abjuração", desc: "Você escolhe uma criatura, objeto ou efeito mágico. Qualquer magia de 3º nível ou inferior no alvo termina. Para magias de nível superior, você deve passar num teste de atributo de conjuração.", castingTime: "1 Ação", range: "36m", components: "V, S", duration: "Instantânea", concentration: false },
  "Animar Mortos": { level: "3º Nível", school: "Necromancia", desc: "Você imbui um amontoado de ossos ou um cadáver de um humanoide com um simulacro de vida, transformando-o em um esqueleto ou zumbi sob seu controle por 24 horas.", castingTime: "1 minuto", range: "3m", components: "V, S, M", duration: "Instantânea", concentration: false },
  "Aura de Vitalidade": { level: "3º Nível", school: "Evocação", desc: "Energia curativa emana de você em uma aura de 9m de raio. Pela duração, você pode usar uma ação bônus para fazer com que uma criatura na aura (incluindo você) recupere 2d6 pontos de vida.", castingTime: "1 Ação", range: "Pessoal (9m)", components: "V", duration: "Concentração, até 1 min", concentration: true },
  "Círculo Mágico": { level: "3º Nível", school: "Abjuração", desc: "Você cria um cilindro de energia mágica de 3m de raio. Você escolhe um tipo de criatura (celestiais, elementais, fadas, demônios ou mortos-vivos) que não podem entrar voluntariamente no cilindro.", castingTime: "1 minuto", range: "3m", components: "V, S, M", duration: "1 hora", concentration: false },
  "Clarividência": { level: "3º Nível", school: "Adivinhação", desc: "Você cria um sensor invisível em um local familiar. Você pode ouvir ou ver através do sensor como se estivesse lá. Você pode alternar entre visão e audição como uma ação.", castingTime: "10 minutos", range: "1,5 km", components: "V, S, M", duration: "Concentração, até 10 min", concentration: true },
  "Crescimento Plantas": { level: "3º Nível", school: "Transmutação", desc: "Você canaliza energia para as plantas em uma área. Elas tornam-se densas e entrelaçadas, tornando o terreno difícil e exigindo 4 metros de movimento para cada 1 metro percorrido.", castingTime: "1 Ação (ou 8 horas)", range: "45m", components: "V, S", duration: "Instantânea", concentration: false },
  "Dificultar Detecção": { level: "3º Nível", school: "Abjuração", desc: "Você esconde uma criatura ou objeto de magias de adivinhação. Pela duração, o alvo não pode ser alvo de vidência ou ser detectado por magias que localizam criaturas.", castingTime: "1 Ação", range: "Toque", components: "V, S, M", duration: "8 horas", concentration: false },
  "Falar com os Mortos": { level: "3º Nível", school: "Necromancia", desc: "Você concede um simulacro de vida a um cadáver, permitindo que ele responda a até cinco perguntas. O cadáver deve ter uma boca e não pode ser um morto-vivo.", castingTime: "1 Ação", range: "3m", components: "V, S, M", duration: "10 minutos", concentration: false },
  "Fingir Morte": { level: "3º Nível", school: "Necromancia", desc: "Você toca uma criatura voluntária e a coloca em um estado de catalepsia. A criatura parece morta para todos os sentidos e magias de detecção de vida e ganha resistência a danos.", castingTime: "1 Ação", range: "Toque", components: "V, S, M", duration: "1 hora", concentration: false },
  "Fome de Hadar": { level: "3º Nível", school: "Conjuração", desc: "Você abre uma fenda para o vazio entre as estrelas. Uma esfera de escuridão mágica de 6m de raio aparece. Criaturas na área sofrem 2d6 de dano de frio e 2d6 de ácido por turno.", castingTime: "1 Ação", range: "45m", components: "V, S, M", duration: "Concentração, até 1 min", concentration: true },
  "Forma Gasosa": { level: "3º Nível", school: "Transmutação", desc: "Você transforma uma criatura voluntária em uma nuvem de gás. Ela ganha deslocamento de voo de 3m, resistência a dano não-mágico e pode passar por fendas pequenas.", castingTime: "1 Ação", range: "Toque", components: "V, S, M", duration: "Concentração, até 1 hora", concentration: true },
  "Pequena Cabana": { level: "3º Nível", school: "Evocação", desc: "Um domo imóvel de força mágica surge ao seu redor. O domo é opaco de fora para dentro e mantém uma temperatura confortável. Criaturas podem passar livremente na criação.", castingTime: "1 minuto (ou ritual)", range: "Pessoal (3m)", components: "V, S, M", duration: "8 horas", concentration: false },
  "Glifo de Guarda": { level: "3º Nível", school: "Abjuração", desc: "Você traça um glifo que detona quando acionado. Você pode escolher uma Runa Explosiva (dano elemental) ou uma Magia de Glifo (armazena uma magia de 3º nível ou inferior).", castingTime: "1 hora", range: "Toque", components: "V, S, M", duration: "Até ser ativado", concentration: false },
  "Idiomas": { level: "3º Nível", school: "Adivinhação", desc: "Esta magia concede ao alvo a habilidade de entender e falar qualquer idioma falado que ele ouvir. Além disso, qualquer criatura entende o que o alvo diz.", castingTime: "1 Ação", range: "Toque", components: "V, M", duration: "1 hora", concentration: false },
  "Lentidão": { level: "3º Nível", school: "Transmutação", desc: "Você altera o tempo para até seis criaturas. Alvos afetados têm seu deslocamento reduzido pela metade, sofrem -2 na CA e testes de Destreza, e não podem usar reações.", castingTime: "1 Ação", range: "36m", components: "V, S, M", duration: "Concentração, até 1 min", concentration: true },
  "Luz do Dia": { level: "3º Nível", school: "Evocação", desc: "Uma esfera de 18m de raio de luz brilhante emana de um ponto. A luz é considerada luz do sol e dispersa escuridão mágica criada por magias de 3º nível ou inferior.", castingTime: "1 Ação", range: "18m", components: "V, S", duration: "1 hora", concentration: false },
  "Medo": { level: "3º Nível", school: "Ilusão", desc: "Você projeta uma imagem dos piores medos de seus inimigos. Cada criatura em um cone de 9m deve passar num Save de Sabedoria ou ficará amedrontada enquanto a magia durar.", castingTime: "1 Ação", range: "9m (Cone)", components: "V, S, M", duration: "Concentração, até 1 min", concentration: true },
  "Mesclar-se a Rochas": { level: "3º Nível", school: "Transmutação", desc: "Você entra em um objeto de pedra. Enquanto estiver mesclado, você não pode ver o que ocorre fora, mas pode ouvir e permanece consciente do passar do tempo.", castingTime: "1 Ação (ou ritual)", range: "Toque", components: "V, S", duration: "8 horas", concentration: false },
  "Névoa Fétida": { level: "3º Nível", school: "Conjuração", desc: "Você cria uma esfera de 6m de raio de gás nojento. Uma criatura que começar o turno na névoa deve passar num Save de Constituição ou passará seu turno vomitando.", castingTime: "1 Ação", range: "27m", components: "V, S, M", duration: "Concentração, até 1 min", concentration: true },
  "Padrão Hipnótico": { level: "3º Nível", school: "Ilusão", desc: "Um caleidoscópio hipnótico de luzes coloridas surge em um cubo de 9m. Criaturas que falharem em um Save de Sabedoria ficam Incapacitadas e com deslocamento 0, perdidas em um transe profundo até sofrerem dano ou serem sacudidas.", castingTime: "1 Ação", range: "36m", components: "S, M (Um pedaço de cristal)", duration: "Concentração, até 1 min", concentration: true },
  "Palavra Cura em Massa": { level: "3º Nível", school: "Evocação", desc: "Suas palavras ressoam com poder benevolente, fechando feridas em massa. Até seis aliados visíveis recuperam 1d4 + seu mod de atributo de conjuração.", castingTime: "1 Ação Bônus", range: "18m", components: "V", duration: "Instantânea", concentration: false },
  "Passo Trovejante": { level: "3º Nível", school: "Evocação", desc: "Você se dissolve em um trovão ensurdecedor e reaparece em outro local. Criaturas em um raio de 3m do local de partida sofrem 3d10 de dano trovejante (Metade se passar em Destreza).", castingTime: "1 Ação", range: "27m", components: "V", duration: "Instantânea", concentration: false },
  "Piscar": { level: "3º Nível", school: "Transmutação", desc: "Role um d20 no final de seus turnos. Se tirar 11+, você entra no Plano Etéreo. No início do seu próximo turno, você retorna a um espaço em até 3m de onde sumiu.", castingTime: "1 Ação", range: "Pessoal", components: "V, S", duration: "1 minuto", concentration: false },
  "Proteção contra Energia": { level: "3º Nível", school: "Abjuração", desc: "Para a duração, a criatura voluntária tem resistência a um tipo de dano de sua escolha: ácido, frio, fogo, relâmpago ou trovão.", castingTime: "1 Ação", range: "Toque", components: "V, S", duration: "Concentração, até 1 hora", concentration: true },
  "Remover Maldição": { level: "3º Nível", school: "Abjuração", desc: "Ao seu toque, todas as maldições que afetam uma criatura ou objeto terminam. Se o objeto for um item amaldiçoado, a magia permite que o usuário largue o item.", castingTime: "1 Ação", range: "Toque", components: "V, S", duration: "Instantânea", concentration: false },
  "Reviver": { level: "3º Nível", school: "Necromancia", desc: "Você toca uma criatura que morreu no último minuto. A criatura retorna à vida com 1 ponto de vida. Esta magia não restaura membros perdidos.", castingTime: "1 Ação", range: "Toque", components: "V, S, M", duration: "Instantânea", concentration: false },
  "Tempestade de Neve": { level: "3º Nível", school: "Conjuração", desc: "Uma tempestade de granizo cai em um cilindro de 12m de raio. A área fica obscurecida, apaga chamas expostas, torna-se terreno difícil e força testes de concentração.", castingTime: "1 Ação", range: "45m", components: "V, S, M", duration: "Concentração, até 1 min", concentration: true },
  "Assassino Fantasmagórico": { level: "4º Nível", school: "Ilusão", desc: "Você manifesta os medos mais profundos de uma criatura. O alvo deve passar num Save de Sabedoria ou ficará Amedrontado. Enquanto durar, o alvo sofre 4d10 de dano psíquico por turno.", castingTime: "1 Ação", range: "36m", components: "V, S", duration: "Concentração, até 1 min", concentration: true },
  "Aura de Pureza": { level: "4º Nível", school: "Abjuração", desc: "Energia purificadora irradia de você. Alvos na aura têm vantagem em Saves contra várias condições e são imunes a doenças e venenos enquanto estiverem na aura.", castingTime: "1 Ação", range: "Pessoal (9m)", components: "V", duration: "Concentração, até 10 min", concentration: true },
  "Aura de Vida": { level: "4º Nível", school: "Abjuração", desc: "Uma aura de energia vital protege os aliados em um raio de 9m. Criaturas na aura têm resistência a dano necrótico e seu PV máximo não pode ser reduzido.", castingTime: "1 Ação", range: "Pessoal (9m)", components: "V", duration: "Concentração, até 10 min", concentration: true },
  "Cão Fiel de Mordenkainen": { level: "4º Nível", school: "Conjuração", desc: "Você conjura um cão de guarda invisível. O cão late se uma criatura se aproximar a 9m e morde qualquer inimigo a até 1,5m dele, causando 4d8 de dano perfurante.", castingTime: "1 Ação", range: "9m", components: "V, S, M", duration: "8 horas", concentration: false },
  "Confusão": { level: "4º Nível", school: "Encantamento", desc: "Esta magia ataca as mentes das criaturas em uma esfera de 3m. Alvos que falharem num Save devem rolar um d10 para determinar seu comportamento aleatório em cada turno.", castingTime: "1 Ação", range: "27m", components: "V, S, M", duration: "Concentração, até 1 min", concentration: true },
  "Conjurar Seres da Floresta": { level: "4º Nível", school: "Conjuração", desc: "Você convoca fadas para ajudá-lo. Você pode invocar uma criatura de nível de desafio 2 ou menos, ou várias de nível inferior, que obedecem aos seus comandos verbais.", castingTime: "1 Ação", range: "18m", components: "V, S, M", duration: "Concentração, até 1 hora", concentration: true },
  "Conjurar Elementais Menores": { level: "4º Nível", school: "Conjuração", desc: "Você convoca elementais fracos (como mephits). Você pode invocar um elemental de ND 2 ou menos, ou vários menores, que lutam ao seu lado.", castingTime: "1 minuto", range: "27m", components: "V, S", duration: "Concentração, até 1 hora", concentration: true },
  "Controlar a Água": { level: "4º Nível", school: "Transmutação", desc: "Você manipula uma grande massa de água. Você pode causar inundações, dividir a água para criar um caminho, formar redemoinhos ou alterar o fluxo de uma corrente.", castingTime: "1 Ação", range: "90m", components: "V, S, M", duration: "Concentração, até 10 min", concentration: true },
  "Esfera Resiliente de Otiluke": { level: "4º Nível", school: "Evocação", desc: "Uma esfera de força cintilante envolve uma criatura. A esfera é impecável e nada pode passar através dela. O alvo pode ser movido rolando a esfera pelo chão.", castingTime: "1 Ação", range: "9m", components: "V, S, M", duration: "Concentração, até 1 min", concentration: true },
  "Espaço Secreto": { level: "4º Nível", school: "Ilusão", desc: "Você torna uma área de até 6m de lado invisível e silenciosa do lado de fora. Criaturas dentro da área podem ver e ouvir o exterior normalmente, mas o interior parece vazio.", castingTime: "1 Ação", range: "9m", components: "V, S, M", duration: "24 horas", concentration: false },
  "Fabricar": { level: "4º Nível", school: "Transmutação", desc: "Você transforma materiais brutos em um objeto acabado. Você pode criar uma ponte de madeira, um traje de armadura ou uma estátua de pedra, desde que tenha os materiais.", castingTime: "10 minutos", range: "36m", components: "V, S", duration: "Instantânea", concentration: false },
  "Invisibilidade Maior": { level: "4º Nível", school: "Ilusão", desc: "Você ou uma criatura que tocar torna-se invisível. Diferente da magia Invisibilidade comum, o efeito não acaba se o alvo atacar ou conjurar magias.", castingTime: "1 Ação", range: "Toque", components: "V, S", duration: "Concentração, até 1 min", concentration: true },
  "Localizar Criatura": { level: "4º Nível", school: "Adivinhação", desc: "Você descreve ou nomeia uma criatura que lhe é familiar. Você sente a direção da localização da criatura, desde que ela esteja a até 300 metros de você.", castingTime: "1 Ação", range: "Pessoal (300m)", components: "V, S, M", duration: "Concentração, até 1 hora", concentration: true },
  "Maldição Elemental": { level: "4º Nível", school: "Transmutação", desc: "Você amaldiçoa uma criatura com vulnerabilidade a um tipo de dano (ácido, frio, fogo, relâmpago ou trovão). O alvo sofre 2d6 de dano extra desse tipo uma vez por turno.", castingTime: "1 Ação", range: "27m", components: "V, S", duration: "Concentração, até 1 min", concentration: true },
  "Metamorfose": { level: "4º Nível", school: "Transmutação", desc: "Você reescreve a essência de uma criatura, transformando-a em uma besta (ND igual ou menor ao nível do alvo). O alvo assume os PV e estatísticas físicas da nova forma. Se os PV da nova forma caírem a 0, o excesso de dano passa para a forma original.", castingTime: "1 Ação", range: "18m", components: "V, S, M (Um pouco de casulo)", duration: "Concentração, até 1 hora", concentration: true },
  "Moldar Rochas": { level: "4º Nível", school: "Transmutação", desc: "Você molda um objeto de pedra de tamanho Médio ou menor em qualquer formato que desejar. Você pode criar um baú, uma porta de pedra ou transformar um corredor em um beco sem saída.", castingTime: "1 Ação", range: "Toque", components: "V, S, M", duration: "Instantânea", concentration: false },
  "Olho Arcano": { level: "4º Nível", school: "Adivinhação", desc: "Você cria um olho invisível e flutuante que envia informações visuais para você. O olho tem visão no escuro e pode se mover em qualquer direção, inclusive através de fendas pequenas.", castingTime: "1 Ação", range: "9m", components: "V, S, M", duration: "Concentração, até 1 hora", concentration: true },
  "Pele de Pedra": { level: "4º Nível", school: "Abjuração", desc: "A pele de uma criatura voluntária torna-se dura como diamante. O alvo tem resistência a dano contundente, cortante e perfurante não-mágico pela duração.", castingTime: "1 Ação", range: "Toque", components: "V, S, M", duration: "Concentração, até 1 hora", concentration: true },
  "Perdição (Secar)": { level: "4º Nível", school: "Necromancia", desc: "Você drena a umidade de uma criatura. O alvo deve passar num Save de Constituição ou sofrer 8d8 de dano necrótico. Plantas e elementais de água têm desvantagem no teste.", castingTime: "1 Ação", range: "9m", components: "V, S, M", duration: "Instantânea", concentration: false },
  "Porta Dimensional": { level: "4º Nível", school: "Conjuração", desc: "Você se teletransporta instantaneamente para qualquer local que possa visualizar ou descrever dentro do alcance. Você pode levar consigo uma criatura voluntária de seu tamanho ou menor.", castingTime: "1 Ação", range: "150m", components: "V", duration: "Instantânea", concentration: false },
  "Proteção contra a Morte": { level: "4º Nível", school: "Abjuração", desc: "Você concede proteção contra o fim prematuro. Na primeira vez que o alvo cair a 0 PV, ele cai para 1 PV. Se o efeito for de morte instantânea, o efeito é anulado.", castingTime: "1 Ação", range: "Toque", components: "V, S", duration: "8 horas", concentration: false },
  "Santuário Particular": { level: "4º Nível", school: "Abjuração", desc: "Você protege uma área de até 30m de lado. A área fica protegida contra vidência, sensores mágicos e teletransporte, e pode ser preenchida com neblina ou escuridão.", castingTime: "10 minutos", range: "36m", components: "V, S, M", duration: "24 horas", concentration: false },
  "Tentáculos Negros de Evard": { level: "4º Nível", school: "Conjuração", desc: "Tentáculos negros e viscosos surgem do chão em uma área de 6m. Criaturas na área devem passar num Save de Destreza ou ficarão Agarradas e sofrerão 3d6 de dano contundente por turno.", castingTime: "1 Ação", range: "27m", components: "V, S, M", duration: "Concentração, até 1 min", concentration: true },
  "Terreno Alucinatório": { level: "4º Nível", school: "Ilusão", desc: "Você faz o terreno natural em um cubo de 45m parecer, soar e cheirar como outro tipo de terreno. Uma planície pode parecer um pântano ou uma montanha pode parecer uma floresta.", castingTime: "10 minutos", range: "90m", components: "V, S, M", duration: "24 horas", concentration: false },
  "Vinha Esmagadora": { level: "4º Nível", school: "Conjuração", desc: "Você conjura uma videira mágica em um ponto. Como uma ação bônus, você pode comandar a videira para puxar uma criatura a até 9m dela em sua direção.", castingTime: "1 Ação Bônus", range: "9m", components: "V, S, M", duration: "Concentração, até 1 min", concentration: true },
  "Amigos Inseparáveis": { level: "5º Nível", school: "Adivinhação", desc: "Você cria um vínculo telepático entre até oito criaturas voluntárias. O vínculo dura pela duração e permite comunicação telepática instantânea através de qualquer distância, contanto que estejam no mesmo plano.", castingTime: "1 Ação (ou ritual)", range: "Pessoal", components: "V, S, M", duration: "1 hora", concentration: false },
  "Curar Ferimentos em Massa": { level: "5º Nível", school: "Evocação", desc: "Uma onda de energia curativa flui de você. Escolha até seis criaturas que você possa ver dentro do alcance. Elas recuperam 3d8 + seu modificador de atributo de conjuração.", castingTime: "1 Ação", range: "18m", components: "V, S", duration: "Instantânea", concentration: false },
  "Despertar": { level: "5º Nível", school: "Transmutação", desc: "Você toca uma besta ou planta e lhe dá consciência. O alvo ganha Inteligência 10 e a habilidade de falar um idioma. O alvo fica encantado por você por 30 dias.", castingTime: "8 horas", range: "Toque", components: "V, S, M", duration: "Instantânea", concentration: false },
  "Dominação de Pessoa": { level: "5º Nível", school: "Encantamento", desc: "Você tenta controlar um humanoide telepaticamente. O alvo deve passar num Save de Sabedoria ou ficará sob seu controle total, realizando qualquer comando que você der mentalmente.", castingTime: "1 Ação", range: "18m", components: "V, S", duration: "Concentração, até 1 min", concentration: true },
  "Golpe Flamejante": { level: "5º Nível", school: "Evocação", desc: "Um pilar vertical de fogo divino rugindo desce dos céus. Cada criatura em um cilindro de 3m de raio e 12m de altura deve sofrer 4d6 de dano de fogo e 4d6 de dano radiante no fracasso de um Save.", castingTime: "1 Ação", range: "18m", components: "V, S, M", duration: "Instantânea", concentration: false },
  "Imobilizar Monstro": { level: "5º Nível", school: "Encantamento", desc: "Você tenta paralisar uma criatura (de qualquer tipo, exceto mortos-vivos). O alvo deve passar num Save de Sabedoria ou ficará Paralisado enquanto a magia durar.", castingTime: "1 Ação", range: "27m", components: "V, S, M", duration: "Concentração, até 1 min", concentration: true },
  "Muralha de Força": { level: "5º Nível", school: "Evocação", desc: "Você cria uma parede invisível de força física. A parede é indestrutível por qualquer dano e nada pode atravessá-la. Ela pode ser um domo de 3m de raio ou uma superfície plana de 6m de lado.", castingTime: "1 Ação", range: "36m", components: "V, S, M", duration: "Concentração, até 10 min", concentration: true },
  "Muralha de Pedra": { level: "5º Nível", school: "Evocação", desc: "Você ergue uma muralha de rocha sólida composta por dez painéis de 3m de lado. Se a concentração for mantida por toda a duração (10 minutos), a muralha torna-se permanente.", castingTime: "1 Ação", range: "36m", components: "V, S, M", duration: "Concentração, até 10 min", concentration: true },
  "Névoa Mortal": { level: "5º Nível", school: "Conjuração", desc: "Você cria uma esfera de 6m de raio de gás venenoso denso. Criaturas na névoa sofrem 5d8 de dano de veneno por turno. A névoa se move 3m para longe de você a cada turno.", castingTime: "1 Ação", range: "36m", components: "V, S", duration: "Concentração, até 10 min", concentration: true },
  "Praga de Insetos": { level: "5º Nível", school: "Conjuração", desc: "Uma esfera de 6m de raio de insetos vorazes aparece. A área é terreno difícil e obscurecida. Criaturas na área devem passar num Save de Constituição ou sofrer 4d10 de dano perfurante.", castingTime: "1 Ação", range: "90m", components: "V, S, M", duration: "Concentração, até 10 min", concentration: true },
  "Reencarnação": { level: "5º Nível", school: "Transmutação", desc: "Você toca uma criatura morta e conjura um novo corpo para sua alma habitar. Se a alma estiver disposta e livre, ela retorna à vida em um novo corpo de raça aleatória determinado pelo destino.", castingTime: "1 hora", range: "Toque", components: "V, S, M", duration: "Instantânea", concentration: false },
  "Restauração Maior": { level: "5º Nível", school: "Abjuração", desc: "Você toca uma criatura e canaliza energia revigorante para remover um efeito deletério. Você pode reduzir exaustão ou encerrar efeitos de petrificação, maldição ou redução de atributos.", castingTime: "1 Ação", range: "Toque", components: "V, S, M", duration: "Instantânea", concentration: false },
  "Sonho": { level: "5º Nível", school: "Ilusão", desc: "Você ou um mensageiro entra nos sonhos de uma criatura familiar. Você pode moldar o sonho ou transformá-lo em um pesadelo que causa 3d6 de dano psíquico e impede o descanso.", castingTime: "1 minuto", range: "Especial", components: "V, S, M", duration: "8 horas", concentration: false },
  "Aliado Planar": { level: "6º Nível", school: "Conjuração", desc: "Você suplica a uma entidade poderosa (como um deus ou senhor elemental) para enviar um aliado para ajudá-lo.", castingTime: "10 minutos", range: "18m", components: "V, S", duration: "Instantânea", concentration: false },
  "Ataque Visual Maior": { level: "6º Nível", school: "Necromancia", desc: "Seus olhos brilham com um poder terrível que pode subjugar outros. Durante a magia, você pode usar uma ação para causar um efeito: Adormecer, Aterrorizar ou Enfraquecer.", castingTime: "1 Ação", range: "Pessoal", components: "V, S", duration: "Concentração, até 1 min", concentration: true },
  "Banquete de Heróis": { level: "6º Nível", school: "Conjuração", desc: "Você traz à existência um banquete magnífico. Participantes tornam-se imunes a veneno e medo, e ganham PV temporários por 24 horas.", castingTime: "10 minutos", range: "36m", components: "V, S, M", duration: "Instantânea", concentration: false },
  "Barreira de Lâminas": { level: "6º Nível", school: "Evocação", desc: "Você cria uma parede vertical de lâminas giratórias. Uma criatura sofre 6d10 de dano cortante quando entra na barreira ou começa seu turno nela.", castingTime: "1 Ação", range: "27m", components: "V, S", duration: "Concentração, até 10 min", concentration: true },
  "Carne para Pedra": { level: "6º Nível", school: "Transmutação", desc: "Você tenta transformar uma criatura em pedra. Se o alvo falhar em Saves, ele fica Petrificado permanentemente até ser curado.", castingTime: "1 Ação", range: "18m", components: "V, S, M", duration: "Concentração, até 1 min", concentration: true },
  "Conjurar Fada": { level: "6º Nível", school: "Conjuração", desc: "Você convoca um espírito feérico (ND 6 ou inferior). A fada obedece seus comandos verbais, mas torna-se hostil se você perder concentração.", castingTime: "1 minuto", range: "27m", components: "V, S", duration: "Concentração, até 1 hora", concentration: true },
  "Cura Plena": { level: "6º Nível", school: "Evocação", desc: "Uma poderosa onda de energia divina restaura completamente a vitalidade. O alvo recupera 70 pontos de vida e é curado de cegueira, surdez e qualquer doença.", castingTime: "1 Ação", range: "18m", components: "V, S", duration: "Instantânea", concentration: false },
  "Dança Irresistível de Otto": { level: "6º Nível", school: "Encantamento", desc: "Você escolhe uma criatura. O alvo começa a dançar comicamente e deve usar todo o seu movimento para dançar no lugar.", castingTime: "1 Ação", range: "9m", components: "V", duration: "Concentração, até 1 min", concentration: true },
  "Doença Plena (Harm)": { level: "6º Nível", school: "Necromancia", desc: "Você libera uma doença virulenta. O alvo deve passar num Save ou sofrer 14d6 de dano necrótico e ter seu PV máximo reduzido.", castingTime: "1 Ação", range: "18m", components: "V, S", duration: "Instantânea", concentration: false },
  "Encontrar o Caminho": { level: "6º Nível", school: "Adivinhação", desc: "Permite encontrar a rota física mais curta para um local específico. Você sempre sabe a direção do seu destino.", castingTime: "1 minuto", range: "Pessoal", components: "V, S, M", duration: "Concentração, até 1 dia", concentration: true },
  "Esfera Congelante de Otiluke": { level: "6º Nível", school: "Evocação", desc: "Um globo de energia gélida explode ao impacto, causando 10d6 de dano de frio a todas as criaturas em um raio de 18m.", castingTime: "1 Ação", range: "90m", components: "V, S, M", duration: "Instantânea", concentration: false },
  "Globo de Invulnerabilidade": { level: "6º Nível", school: "Abjuração", desc: "Uma barreira de 3m de raio envolve você. Magias de 5º nível ou inferior de fora não têm efeito sobre o interior.", castingTime: "1 Ação", range: "Pessoal (3m)", components: "V, S, M", duration: "Concentração, até 1 min", concentration: true },
  "Ilusão Programada": { level: "6º Nível", school: "Ilusão", desc: "Cria uma ilusão que é ativada por um gatilho específico. A ilusão pode durar até 5 minutos por ativação.", castingTime: "1 Ação", range: "36m", components: "V, S, M", duration: "Até ser dissipada", concentration: false },
  "Invocação Inst. de Drawmij": { level: "6º Nível", school: "Conjuração", desc: "Você coloca um selo mágico em um objeto. Você pode usar uma ação para invocá-lo de qualquer distância no mesmo plano.", castingTime: "1 minuto", range: "Toque", components: "V, S, M", duration: "Instantânea", concentration: false },
  "Magia Contingente": { level: "6º Nível", school: "Abjuração", desc: "Você armazena uma magia latente que será lançada automaticamente sobre você em uma circunstância gatilho.", castingTime: "10 minutos", range: "Pessoal", components: "V, S, M", duration: "Até ser ativada", concentration: false },
  "Mover Terra": { level: "6º Nível", school: "Transmutação", desc: "Você remodela o terreno natural, elevando ou rebaixando a terra em uma área de até 12 metros a cada 10 minutos.", castingTime: "1 Ação", range: "36m", components: "V, S, M", duration: "Concentração, até 2 horas", concentration: true },
  "Muralha de Gelo": { level: "6º Nível", school: "Evocação", desc: "Cria uma muralha de gelo sólido. Se destruída, deixa ar congelante que causa 10d6 de dano de frio.", castingTime: "1 Ação", range: "36m", components: "V, S, M", duration: "Concentração, até 10 min", concentration: true },
  "Muralha de Espinhos": { level: "6º Nível", school: "Conjuração", desc: "Uma muralha de espinhos grossos surge. Criaturas na área sofrem 7d8 de dano perfurante e movimento é drasticamente reduzido.", castingTime: "1 Ação", range: "36m", components: "V, S, M", duration: "Concentração, até 10 min", concentration: true },
  "Palavra de Recordação": { level: "6º Nível", school: "Conjuração", desc: "Você e até cinco criaturas voluntárias são teletransportados instantaneamente para um santuário designado.", castingTime: "1 Ação", range: "1,5 km", components: "V", duration: "Instantânea", concentration: false },
  "Passo no Vento": { level: "6º Nível", school: "Transmutação", desc: "Você e até dez criaturas voluntárias tornam-se nuvens de fumaça vaporosa com deslocamento de voo de 90m.", castingTime: "1 minuto", range: "9m", components: "V, S, M", duration: "Até 8 horas", concentration: false },
  "Portão Arcano": { level: "6º Nível", school: "Conjuração", desc: "Você cria dois portais interligados. Criaturas podem passar por um e sair pelo outro instantaneamente.", castingTime: "1 Ação", range: "150m", components: "V, S", duration: "Concentração, até 10 min", concentration: true },
  "Proibição": { level: "6º Nível", school: "Abjuração", desc: "Protege área massiva contra teletransporte e criaturas planares. Inimigos na área sofrem 5d10 de dano por turno.", castingTime: "10 minutos", range: "Toque", components: "V, S, M", duration: "Até 1 dia", concentration: false },
  "Raio Solar": { level: "6º Nível", school: "Evocação", desc: "Um feixe de luz brilhante na linha de 18m causa 6d8 de dano radiante e cegueira a quem falhar no Save.", castingTime: "1 Ação", range: "Pessoal (Linha de 18m)", components: "V, S, M", duration: "Concentração, até 1 min", concentration: true },
  "Sugestão em Massa": { level: "6º Nível", school: "Encantamento", desc: "Sugere curso de ação para até doze criaturas. Se razoável, alvos que falharem no Save seguirão a instrução por 24h.", castingTime: "1 Ação", range: "18m", components: "V, M", duration: "24 horas", concentration: false },
  "Transporte Via Plantas": { level: "6º Nível", school: "Conjuração", desc: "Cria elo mágico entre duas plantas grandes. Você e criaturas podem entrar em uma e sair na outra.", castingTime: "1 Ação", range: "3m", components: "V, S", duration: "1 rodada", concentration: false },
  "Truque de Mágica": { level: "6º Nível", school: "Ilusão", desc: "Cria ilusões sensoriais complexas. A magia produz sons, cheiros e imagens que parecem reais para todos os sentidos naturais.", castingTime: "1 Ação", range: "Toque", components: "V, S, M", duration: "Especial", concentration: false },
  "Visão da Verdade": { level: "6º Nível", school: "Adivinhação", desc: "Alvo ganha habilidade de ver as coisas como realmente são: vê através de ilusões, invisibilidade e vê no Etéreo.", castingTime: "1 Ação", range: "Toque", components: "V, S, M", duration: "1 hora", concentration: false },
  "Bola de Fogo Controlável": { level: "7º Nível", school: "Evocação", desc: "Feixe condensado em conta brilhante. Você pode detonar imediatamente ou esperar até 1 minuto para acumular poder (até 12d6 + bonus).", castingTime: "1 Ação", range: "45m", components: "V, S, M", duration: "Concentração, até 1 min", concentration: true },
  "Cúpula Cintilante": { level: "7º Nível", school: "Abjuração", desc: "Cúpula de energia que protege você. Atacantes externos sofrem dano elétrico e têm desvantagem em ataques.", castingTime: "1 Ação", range: "Pessoal (3m)", components: "V, S, M", duration: "Concentração, até 1 min", concentration: true },
  "Espada de Mordenkainen": { level: "7º Nível", school: "Evocação", desc: "Cria espada de força flutuante. Como ação bônus, você move a espada e ataca causando 3d10 de dano de força.", castingTime: "1 Ação", range: "18m", components: "V, S, M", duration: "Concentração, até 1 min", concentration: true },
  "Eterealidade": { level: "7º Nível", school: "Transmutação", desc: "Você e até três outras criaturas entram no Plano Etéreo, permitindo mover-se através de objetos materiais.", castingTime: "1 Ação", range: "Pessoal", components: "V, S", duration: "Até 8 horas", concentration: false },
  "Forma Etérea": { level: "7º Nível", school: "Transmutação", desc: "Você entra nas fronteiras do Plano Etéreo, tornando-se uma sombra pálida intangível no Plano Material.", castingTime: "1 Ação", range: "Pessoal", components: "V, S", duration: "Até 8 horas", concentration: false },
  "Ilusão de Puxão": { level: "7º Nível", school: "Encantamento", desc: "Cria ilusão que impele criaturas a se aproximarem do centro da área de efeito se falharem no Save.", castingTime: "1 Ação", range: "36m", components: "V, S, M", duration: "Concentração, até 1 min", concentration: true },
  "Inversão da Gravidade": { level: "7º Nível", school: "Transmutação", desc: "Altera a gravidade em um cilindro de 30m. Criaturas e objetos caem para cima e ficam suspensos no topo.", castingTime: "1 Ação", range: "30m", components: "V, S, M", duration: "Concentração, até 1 min", concentration: true },
  "Jaula de Força": { level: "7º Nível", school: "Evocação", desc: "Barreira invisível de força indestrutível e intransponível por meios físicos ou teletransporte simples.", castingTime: "1 Ação", range: "30m", components: "V, S, M", duration: "1 hora", concentration: false },
  "Lufada de Vento Divina": { level: "7º Nível", school: "Evocação", desc: "Vendaval de energia que empurra inimigos e causa dano de concussão, protegendo aliados contra projéteis.", castingTime: "1 Ação", range: "36m", components: "V, S, M", duration: "Concentração, até 1 min", concentration: true },
  "Mansão Magnífica de Mordenkainen": { level: "7º Nível", school: "Conjuração", desc: "Você conjura uma mansão extradimensional num ponto que você pode ver. A mansão contém inúmeros quartos, comida e servos invisíveis para atender até 100 pessoas.", castingTime: "1 minuto", range: "90m", components: "V, S, M", duration: "24 horas", concentration: false },
  "Miragem": { level: "7º Nível", school: "Ilusão", desc: "Altera aparência de 1,5 km de terreno. Muda visão e tato para fazer deserto parecer floresta ou similar.", castingTime: "10 minutos", range: "Visão", components: "V, S, M", duration: "10 dias", concentration: false },
  "Palavra Divina": { level: "7º Nível", school: "Evocação", desc: "Palavra de poder que ensurdece, cega, paralisa ou mata criaturas dependendo de seus PV atuais.", castingTime: "1 Ação Bônus", range: "9m", components: "V", duration: "Instantânea", concentration: false },
  "Prisão de Gelo": { level: "7º Nível", school: "Conjuração", desc: "Prende criatura em cubo de gelo. Alvo fica paralisado e sofre 10d6 de dano de frio por turno.", castingTime: "1 Ação", range: "18m", components: "V, S, M", duration: "Concentração, até 1 min", concentration: true },
  "Projeção Holográfica": { level: "7º Nível", school: "Ilusão", desc: "Simulacro seu que pode se mover, falar e conjurar magias em seu lugar.", castingTime: "1 Ação", range: "Pessoal", components: "V, S, M", duration: "Concentração, até 1 hora", concentration: true },
  "Raio Prismático": { level: "7º Nível", school: "Evocação", desc: "Sete raios coloridos em cone. Cada um causa danos elementais ou efeitos de status aleatórios potentes.", castingTime: "1 Ação", range: "18m", components: "V, S", duration: "Instantânea", concentration: false },
  "Ressurreição": { level: "7º Nível", school: "Necromancia", desc: "Toca criatura morta há até um século. Alma retorna com PV e membros restaurados se livre e disposta.", castingTime: "1 hora", range: "Toque", components: "V, S, M", duration: "Instantânea", concentration: false },
  "Símbolo": { level: "7º Nível", school: "Abjuração", desc: "Glifo mortal em objeto/chão. Gatilho causa efeitos como dor, sono ou morte em área.", castingTime: "1 hora", range: "Toque", components: "V, S, M", duration: "Até ser dissipado", concentration: false },
  "Teletransporte": { level: "7º Nível", school: "Conjuração", desc: "Transporta grupo para destino conhecido. Sucesso depende da familiaridade com o local.", castingTime: "1 Ação", range: "3m", components: "V", duration: "Instantânea", concentration: false },
  "Viagem Planar": { level: "7º Nível", school: "Conjuração", desc: "Transporta grupo para outro plano ou tenta banir criatura hostil para outro plano.", castingTime: "1 Ação", range: "Toque", components: "V, S, M", duration: "Instantânea", concentration: false },
  "Aura Sagrada": { level: "8º Nível", school: "Abjuração", desc: "Você emite uma luz divina em um raio de 9m. Aliados na aura têm vantagem em todos os Saves e inimigos têm desvantagem em ataques contra eles.", castingTime: "1 Ação", range: "Pessoal (9m)", components: "V, S, M", duration: "Concentração, até 1 min", concentration: true },
  "Campo Antimagia": { level: "8º Nível", school: "Abjuração", desc: "Uma esfera invisível de 3m de raio envolve você. Dentro dela, nenhuma magia funciona, itens mágicos tornam-se mundanos e criaturas invocadas desaparecem.", castingTime: "1 Ação", range: "Pessoal (3m)", components: "V, S, M", duration: "Concentração, até 1 hora", concentration: true },
  "Clone": { level: "8º Nível", school: "Necromancia", desc: "Você cria uma duplicata inerte de uma criatura em um receptáculo. Se a alma da criatura morrer, ela é transferida para o clone, garantindo imortalidade.", castingTime: "1 hora", range: "Toque", components: "V, S, M", duration: "Instantânea", concentration: false },
  "Controlar o Clima": { level: "8º Nível", school: "Transmutação", desc: "Você altera as condições climáticas em um raio de vários quilômetros. Você pode mudar temperatura, vento e precipitação ao longo de vários minutos.", castingTime: "10 minutos", range: "Pessoal (8 km de raio)", components: "V, S, M", duration: "Concentração, até 8 horas", concentration: true },
  "Dominar Monstro": { level: "8º Nível", school: "Encantamento", desc: "Você tenta controlar qualquer criatura telepaticamente. O alvo deve passar num Save de Sabedoria ou ficará sob seu controle total por toda a duração.", castingTime: "1 Ação", range: "18m", components: "V, S", duration: "Concentração, até 1 hora", concentration: true },
  "Enfraquecer o Intelecto": { level: "8º Nível", school: "Encantamento", desc: "Você atinge a mente de uma criatura com energia psíquica. O alvo sofre 4d6 de dano e sua Inteligência e Carisma tornam-se 1, impedindo magias ou comunicação.", castingTime: "1 Ação", range: "45m", components: "V, S, M", duration: "Instantânea", concentration: false },
  "Escudo Mental": { level: "8º Nível", school: "Abjuração", desc: "Você protege uma criatura contra invasão mental. O alvo torna-se imune a ser lido, encantado ou detectado por meios mágicos de adivinhação.", castingTime: "1 Ação", range: "Toque", components: "V, S", duration: "24 horas", concentration: false },
  "Explosão Solar": { level: "8º Nível", school: "Evocação", desc: "Luz solar brilhante explode em um raio de 18m. Criaturas na área sofrem 12d6 de dano radiante e ficam cegas se falharem no Save de Constituição.", castingTime: "1 Ação", range: "45m", components: "V, S, M", duration: "Instantânea", concentration: false },
  "Limpar a Mente": { level: "8º Nível", school: "Abjuração", desc: "Você toca uma criatura e remove qualquer efeito que esteja alterando sua mente, incluindo charme, medo e possessão.", castingTime: "1 Ação", range: "Toque", components: "V, S", duration: "Instantânea", concentration: false },
  "Labirinto": { level: "8º Nível", school: "Conjuração", desc: "Você bane uma criatura para um labirinto extradimensional. O alvo permanece lá até passar num teste de Inteligência ou a magia terminar.", castingTime: "1 Ação", range: "18m", components: "V, S", duration: "Concentração, até 10 min", concentration: true },
  "Nuvem Incendiária": { level: "8º Nível", school: "Conjuração", desc: "Você cria uma nuvem de fumaça e brasas. Criaturas na área sofrem 10d8 de dano de fogo. A nuvem se move para longe de você a cada turno.", castingTime: "1 Ação", range: "45m", components: "V, S", duration: "Concentração, até 1 min", concentration: true },
  "Palavra de Poder: Atordoar": { level: "8º Nível", school: "Encantamento", desc: "Você profere uma palavra de poder. Se o alvo tiver 150 PV ou menos, ele fica atordoado imediatamente, sem direito a salvaguarda inicial.", castingTime: "1 Ação", range: "18m", components: "V", duration: "Até ser dissipada", concentration: false },
  "Poeira da Morte": { level: "8º Nível", school: "Necromancia", desc: "Você sopra uma nuvem de poeira cinzenta em um cone de 18m. Seres vivos na área sofrem 10d10 de dano necrótico enquanto suas carnes apodrecem.", castingTime: "1 Ação", range: "Pessoal (Cone de 18m)", components: "V, S", duration: "Instantânea", concentration: false },
  "Telepatia": { level: "8º Nível", school: "Adivinhação", desc: "Você cria um elo telepático com uma criatura que conheça. Vocês podem se comunicar instantaneamente através de qualquer distância no mesmo plano.", castingTime: "1 Ação", range: "Ilimitado", components: "V, S, M", duration: "24 horas", concentration: false },
  "Terremoto": { level: "8º Nível", school: "Evocação", desc: "Você cria um tremor intenso em um raio de 30m. O chão racha, estruturas desabam e fendas se abrem, causando danos massivos a tudo na área.", castingTime: "1 Ação", range: "150m", components: "V, S, M", duration: "Concentração, até 1 min", concentration: true },
  "Tsunami": { level: "8º Nível", school: "Conjuração", desc: "Uma muralha de água de até 90m de altura surge. A muralha avança esmagando e carregando criaturas e estruturas, causando 6d10 de dano por turno.", castingTime: "1 minuto", range: "Visão", components: "V, S", duration: "Concentração, até 6 rounds", concentration: true },
  "Aprisionamento": { level: "9º Nível", school: "Abjuração", desc: "Uma magia de selamento supremo que prende uma criatura perpetuamente em um estado de estase, enterrada ou dentro de um cristal indestrutível.", castingTime: "1 minuto", range: "9m", components: "V, S, M", duration: "Até ser dissipada", concentration: false },
  "Sexto Sentido": { level: "9º Nível", school: "Adivinhação", desc: "Você ganha uma visão limitada do futuro imediato. Você tem vantagem em todos os ataques, saves e testes, e inimigos têm desvantagem contra você.", castingTime: "1 minuto", range: "Toque", components: "V, S, M", duration: "8 horas", concentration: false },
  "Desejo": { level: "9º Nível", school: "Conjuração", desc: "A manifestação máxima da vontade de um conjurador. Você pode duplicar qualquer magia de 8º nível ou inferior instantaneamente, ou pedir por feitos impossíveis que podem causar estresse severo à sua alma (Risco de nunca mais poder conjurar Desejo).", castingTime: "1 Ação", range: "Pessoal", components: "V", duration: "Instantânea", concentration: false },
  "Chuva de Meteoros": { level: "9º Nível", school: "Evocação", desc: "Orbes de fogo despencam do céu em quatro pontos à sua escolha. Cada criatura em um raio de 12m sofre 20d6 de fogo e 20d6 de concussão (Metade se passar em Destreza). Estruturas sofrem dano dobrado.", castingTime: "1 Ação", range: "1,5 km", components: "V, S", duration: "Instantânea", concentration: false },
  "Palavra de Poder Curar": { level: "9º Nível", school: "Evocação", desc: "Uma palavra que restaura completamente PV e encerra efeitos de cegueira, surdez, paralisia e atordoamento em uma criatura que você toque.", castingTime: "1 Ação", range: "Toque", components: "V, S", duration: "Instantânea", concentration: false },
  "Palavra de Poder: Matar": { level: "9º Nível", school: "Encantamento", desc: "Você profere uma sílaba de poder absoluto que interrompe os batimentos cardíacos. Se o alvo tiver 100 PV ou menos, ele morre instantaneamente. Não há teste de resistência; apenas a morte.", castingTime: "1 Ação", range: "18m", components: "V", duration: "Instantânea", concentration: false },
  "Parar o Tempo": { level: "9º Nível", school: "Transmutação", desc: "Você congela o fluxo do tempo para todos, exceto você. Você ganha 1d4 + 1 turnos extras para agir antes que o tempo volte ao normal.", castingTime: "1 Ação", range: "Pessoal", components: "V", duration: "Instantânea", concentration: false },
  "Portal": { level: "9º Nível", school: "Conjuração", desc: "Você abre uma fenda interplanar ligando seu local a um ponto específico em outro plano de existência, permitindo viagem ou invocação de seres.", castingTime: "1 Ação", range: "18m", components: "V, S, M", duration: "Concentração, até 1 min", concentration: true },
  "Projeção Astral": { level: "9º Nível", school: "Necromancia", desc: "Você e até oito criaturas projetam suas formas astrais no Mar Astral. Seus corpos físicos permanecem em estase enquanto vocês viajam.", castingTime: "1 hora", range: "Toque", components: "V, S, M", duration: "Especial", concentration: false },
  "Ressurreição Verdadeira": { level: "9º Nível", school: "Necromancia", desc: "Traz criatura morta de volta à vida com PV totais. Funciona mesmo sem corpo físico, desde que saiba o nome e a criatura tenha morrido há menos de 200 anos.", castingTime: "1 hora", range: "Toque", components: "V, S, M", duration: "Instantânea", concentration: false },
  "Metamorfose Verdadeira": { level: "9º Nível", school: "Transmutação", desc: "Transforma uma criatura ou objeto em outra criatura ou objeto. Se mantida por 1 hora, a transformação torna-se permanente e irreversível.", castingTime: "1 Ação", range: "9m", components: "V, S, M", duration: "Concentração, até 1 hora", concentration: true },
  "Muralha Prismática": { level: "9º Nível", school: "Abjuração", desc: "Uma barreira cintilante de sete cores. Cada camada tem um efeito perigoso diferente e deve ser destruída por métodos específicos.", castingTime: "1 Ação", range: "18m", components: "V, S", duration: "10 minutos", concentration: false },
  "Tempestade de Vingança": { level: "9º Nível", school: "Conjuração", desc: "Uma nuvem de tempestade gigante causa chuva ácida, relâmpagos, saraiva e ventos gélidos ao longo de vários turnos em uma área massiva.", castingTime: "1 Ação", range: "Visão", components: "V, S", duration: "Concentração, até 1 min", concentration: true },
  "Afinidade Animal Maior": { level: "8º Nível", school: "Conjuração", desc: "Você traz feras gigantes sob seu controle em um raio de 9m.", castingTime: "1 Ação", range: "9m", components: "V, S", duration: "Concentração, até 1 hora", concentration: true },
  "Encarnação do Mal": { level: "8º Nível", school: "Necromancia", desc: "Exala uma aura macabra que condena os inimigos em sua volta.", castingTime: "1 Ação", range: "Pessoal", components: "V", duration: "Concentração, até 1 min", concentration: true },
  "Raio Polar": { level: "8º Nível", school: "Evocação", desc: "Rajadas gélidas que cristalizam instantaneamente o alvo.", castingTime: "1 Ação", range: "36m", components: "V, S", duration: "Instantânea", concentration: false },
  "Luz Divina Extrema": { level: "8º Nível", school: "Evocação", desc: "Feixes dos céus que expurgam alinhamentos contrários.", castingTime: "1 Ação", range: "Visão", components: "V", duration: "Instantânea", concentration: false },
  "Alterar Realidade": { level: "9º Nível", school: "Transmutação", desc: "Molda grandes escopos do mundo celestial de acordo com sua vontade.", castingTime: "1 Ação", range: "Especial", components: "V, S", duration: "Instantânea", concentration: false },
  "Julgamento de Fogo": { level: "9º Nível", school: "Evocação", desc: "Explosão concentrada da ira de um panteão divino.", castingTime: "1 Ação", range: "45m", components: "V", duration: "Instantânea", concentration: false },
  "Fenda Planar Múltipla": { level: "9º Nível", school: "Conjuração", desc: "Mistura três planos mortais no meio do campo de batalha.", castingTime: "1 Ação", range: "30m", components: "V, S", duration: "Concentração, até 1 min", concentration: true },
  "Invocação de Titãs": { level: "9º Nível", school: "Conjuração", desc: "Puxa elementais anciões do caos primevo para lutar por você.", castingTime: "1 Ação", range: "90m", components: "V, S", duration: "Concentração, até 1 hora", concentration: true },
  "Sinfonia da Ruína": { level: "9º Nível", school: "Encantamento", desc: "Canção dilacerante que corta pela metade os atributos dos alvos.", castingTime: "1 Ação", range: "18m", components: "V", duration: "Concentração, até 1 min", concentration: true },
  "Aura dos Deuses": { level: "9º Nível", school: "Abjuração", desc: "Imunidade total a danos mundanos e mágicos inferiores.", castingTime: "1 Ação", range: "Pessoal", components: "V, S", duration: "Concentração, até 10 min", concentration: true },
  "Eclipse de Sombras": { level: "9º Nível", school: "Ilusão", desc: "Apaga o sol de uma área, espalhando pânico extremo e cegueira.", castingTime: "1 Ação", range: "Céu", components: "V, S", duration: "Concentração, até 1 hora", concentration: true },
  "Réquiem Final": { level: "9º Nível", school: "Necromancia", desc: "Ergue um exército imediato de todos os corpos caídos na área.", castingTime: "1 Ação", range: "90m", components: "V, S, M", duration: "Instantânea", concentration: false },
  "Chicote Elétrico": { level: "Truque", desc: "4,5m | 1d8 Relâmpago | Impede o alvo de realizar reações até o início do seu próximo turno.", castingTime: "1 Ação", range: "4,5m", components: "V, S", duration: "1 rodada", concentration: false },
  "Golpe de Gelo": { level: "1º Nível", desc: "18m | 1d10 Frio + 2d6 Frio em área | Cria um fragmento de gelo que explode ao atingir.", castingTime: "1 Ação", range: "18m", components: "V, S, M", duration: "Instantânea", concentration: false },
  "Absorver Elementos": { level: "1º Nível", desc: "Reação | Resistência | Garante resistência ao dano elementar recebido e bônus no próx atq.", castingTime: "1 Reação", range: "Pessoal", components: "S", duration: "1 rodada", concentration: false },
  "Libertar": { level: "4º Nível", desc: "O alvo ignora terreno difícil e não pode ser paralisado ou impedido." },
  "Clarão Destrutivo": { level: "5º Nível", desc: "Explosão de luz divina que causa 4d6 de dano radiante e cega inimigos." },
  "Resiliência": { level: "4º Nível", desc: "Garante resistência a um tipo de dano e vantagem em testes de resistência." },
  "Santidade do Corpo": { level: "4º Nível", desc: "O corpo do alvo torna-se imune a doenças e venenos." },
  "Arcanismo de Mordenkainen": { level: "4º Nível", desc: "Invoca um cão invisível que protege uma área." },
  "Marca da Punição": { level: "2º Nível", desc: "Bônus. Alvo atingido sofre 2d6 dano extra de fogo." },
  "Favor Divino": { level: "1º Nível", desc: "Bônus. +1d4 radiante em ataques por 1 min." },
  "Passo Distante": { level: "5º Nível", desc: "Bônus. Teleporte-se 18m para um local visível a cada turno." },
  "Investida de Carne": { level: "5º Nível", desc: "Cria uma conexão de dor com o alvo, compartilhando danos recebidos." },
  "Tremor de Terra": { level: "1º Nível", desc: "3m (raio). 1d6 de dano e derruba criaturas ao seu redor." },
  "Aperto da Terra de Maximilian": { level: "2º Nível", desc: "9m | 2d6 Contundente | Mão de terra agarra e esmaga o alvo." },
  "Aprimorar Habilidade": { level: "2º Nível", desc: "Toque | Buff | Dá vantagem em testes de um atributo e outros bônus." },
  "Augúrio": { level: "2º Nível", desc: "Pessoal | Informação | Recebe sinal sobre ações próximas (Bom, Mau, Ambos, Nada)." },
  "Aura Mágica de Nystul": { level: "2º Nível", desc: "Toque | Ilusão | Altera como criatura ou objeto é detectado por magias." },
  "Auxílio": { level: "2º Nível", desc: "9m | +5 PV Máx | Aumenta vida máxima de 3 criaturas por 8h." },
  "Boca Encantada": { level: "2º Nível", desc: "9m | Mensagem | Objeto fala mensagem pré-gravada sob condição técnica." },
  "Cativar": { level: "2º Nível", desc: "18m | Encantamento | Distrai criaturas, dando desvantagem em Percepção." },
  "Chamuscar de Aganazzar": { level: "2º Nível", desc: "9m | 3d8 Fogo | Linha de chamas que queima o que estiver no caminho." },
  "Chicote Mental de Tasha": { level: "2º Nível", desc: "27m | 3d6 Psíquico | Alvo sofre dano e fica limitado a uma ação ou movimento." },
  "Conhecimento Emprestado": { level: "2º Nível", desc: "Pessoal | Proficiência | Ganha proficiência em uma perícia à escolha por 1h." },
  "Encontrar Armadilhas": { level: "2º Nível", desc: "Pessoal | Detecção | Sente presença e natureza de armadilhas em 36m." },
  "Encontrar Montaria": { level: "2º Nível", desc: "9m | Invocação | Invoca um espírito que assume forma de montaria leal." },
  "Escrita Celeste": { level: "2º Nível", desc: "Visão | Mensagem | Escreve até 10 palavras com nuvens no céu." },
  "Golpe Marcante": { level: "2º Nível", desc: "Bônus. Próximo ataque causa +2d6 radiante e revela invisibilidade." },
  "Imobilizar Pessoa": { level: "2º Nível", desc: "18m | Paralisia | Paralisa criatura humanoide (Sab save)." },
  "Invocar Besta": { level: "2º Nível", desc: "27m | Invocação | Traz um espírito bestial para lutar ao seu lado." },
  "Lâmina Flamejante": { level: "2º Nível", desc: "Pessoal | 3d6 Fogo | Cria foice de fogo que pode ser usada para ataques." },
  "Lâmina Sombria": { level: "2º Nível", desc: "Pessoal | 2d8 Psíquico | Cria arma de sombras com vantagem em luz fraca." },
  "Localizar Animais ou Plantas": { level: "2º Nível", desc: "Pessoal | Busca | Localiza tipo específico de besta ou planta em 8km." },
  "Localizar Objeto": { level: "2º Nível", desc: "Pessoal | Busca | Sente direção de objeto conhecido ou familiar em 300m." },
  "Lufada de Vento": { level: "2º Nível", desc: "18m | Empurrão | Linha de vento forte de 18m que empurra e apaga chamas." },
  "Patas de Aranha": { level: "2º Nível", desc: "Toque | Movimento | Permite escalar superfícies verticais e tetos." },
  "Pele de Árvore": { level: "2º Nível", desc: "Toque | CA 16 | Pele endurece, CA mínima se torna 16." },
  "Picada Mental": { level: "2º Nível", desc: "18m | 3d6 Psíquico | Dano e você sempre sabe a localização do alvo." },
  "Prender à Terra": { level: "2º Nível", desc: "90m | Queda | Reduz deslocamento de voo para 0m, forçando alvo a descer." },
  "Proteção contra Veneno": { level: "2º Nível", desc: "Toque | Resistência | Dá resistência a veneno e vantagem em saves contra este." },
  "Redemoinho de Poeira": { level: "2º Nível", desc: "18m | 1d8 Contundente | Funil de poeira que empurra criaturas." },
  "Repouso Tranquilo": { level: "2º Nível", desc: "Toque | Preservação | Impede cadáver de apodrecer ou ser erguido como morto-vivo." },
  "Sentido Bestial": { level: "2º Nível", desc: "Toque | Percepção | Você vê e ouve através dos sentidos de uma besta disposta." },
  "Tempestade de Bolas de Neve de Snilloc": { level: "2º Nível", desc: "27m | 3d6 Frio | Explosão de saraiva em área de 1,5m." },
  "Visão no Escuro": { level: "2º Nível", desc: "Toque | Visão | Dá visão no escuro de 18m para uma criatura." },
  "Zona da Verdade": { level: "2º Nível", desc: "18m | Verdade | Criaturas na área não podem falar mentiras deliberadas." },
  "Palavras de Terror": { level: "Habilidade", desc: "Você tece frases carregadas de medo ancestral. Após falar com um humanoide sozinho por 1 minuto, você instila um terror profundo em seu coração. O alvo deve passar em um Save de Sabedoria ou ficará aterrorizado por você ou outra criatura, fugindo de sua presença." },
  "Swarming Dispersal": { level: "Habilidade", desc: "Você se dissolve em uma nuvem de fada ou sombras. Quando sofre dano, você usa sua reação para se dispersar e reaparecer a até 9 metros, ganhando resistência contra o ataque que desencadeou esta fuga frenética." },
  "Segredos Mágicos Adicionais": { level: "Habilidade", desc: "Sua erudição mística transcende as artes dos bardos. Você aprende duas magias de qualquer classe, moldando-as conforme sua própria sensibilidade artística e tornando-as parte permanente de seu repertório." },
  "Perícia Inigualável": { level: "Habilidade", desc: "Sua dedicação a um ofício é absoluta. Quando você falha em um teste de perícia, sua genialidade permite que você some um dado de Inspiração para superar o desafio e garantir o sucesso." },
  "Magia de Batalha": { level: "Habilidade", desc: "Você move-se em uma dança de aço e música. Sempre que usar sua ação para conjurar uma magia de bardo, você pode realizar um ataque com arma como uma ação bônus, fundindo perfeitamente as duas artes." },
  "Manto de Inspiração": { level: "Habilidade", desc: "Você assume uma aparência feérica e majestosa. Como ação bônus, gaste um dado de Inspiração para conceder vigor (PV temporários) a seus aliados e permitir que eles se reposicionem no campo de batalha sem sofrer ataques de oportunidade." },
  "Performance Enfeitiçante": { level: "Habilidade", desc: "Sua arte é fascinante demais para ser ignorada. Após uma performance de 1 minuto, criaturas que falharem em um Save de Sabedoria tornam-se devotas a você por 1 hora, tratando-o como seu ídolo absoluto." },
  "Manto de Majestade": { level: "Habilidade", desc: "Você irradia uma autoridade divina insuportável. Por 1 minuto, você pode conjurar 'Comando' como ação bônus em cada turno sem gastar slots. Inimigos que você já encantou falham automaticamente no teste." },
  "Majestade Inquebrável": { level: "Habilidade", desc: "Sua postura é tão imponente que os ataques parecem hesitar diante de você. Criaturas que tentarem atingi-lo devem primeiro resistir à sua autoridade (Save de Carisma) ou serão forçadas a atacar outro alvo." },
  "Floreio de Lâmina": { level: "Habilidade", desc: "Sua esgrima é uma forma de arte letal. Ao atingir um inimigo, você pode gastar Inspiração para realizar manobras elegantes: aumentar sua defesa, ferir múltiplos alvos ou empurrar oponentes com força graciosa." },
  "Mestre de Floreio": { level: "Habilidade", desc: "Sua técnica com a lâmina é tão refinada que o esforço básico não o cansa. Você pode realizar seus Floreios de Lâmina menores (d6) sem gastar suas reservas de Inspiração." },
  "Lâminas Psíquicas (Bardo)": { level: "Habilidade", desc: "Suas palavras sussurradas ferem a alma. Ao atingir uma criatura, você pode gastar Inspiração para infundir o golpe com energia psíquica pura, dilacerando a mente do oponente por dentro." },
  "Cura Telepática": { level: "Habilidade", desc: "Sempre que você usar o Dado de Vida para recuperar PV, você pode adicionar seu modificador de Carisma ao total recuperado." },
  "Sangue Negro Verdan": { level: "Habilidade", desc: "Sempre que você rolar um 1 ou 2 em um Dado de Vida para recuperar PV, você pode rolar o dado novamente (deve usar o novo resultado)." },
  "Resistência de Anão": { 
    level: "Traço Racial", 
    desc: "O sangue resistente dos anões corre em suas veias, protegendo-o contra toxinas. Você possui vantagem em testes de resistência contra veneno e tem resistência a dano de veneno. Sua herança mineral torna seu sistema imunológico uma fortaleza inexpugnável.", 
    castingTime: "Passiva", 
    range: "Pessoal", 
    components: "-", 
    duration: "Permanente" 
  },
  "Visão no Escuro Superior": { 
    level: "Traço Racial", 
    desc: "Sua adaptação às profundezas abissais do Subterrâneo é absoluta. Você pode enxergar na penumbra como se fosse luz plena e na escuridão total como se fosse penumbra em um raio de 36 metros. Você não pode distinguir cores no escuro, apenas tons de cinza, percebendo o mundo através de formas e texturas sombrias.", 
    castingTime: "Passiva", 
    range: "Pessoal", 
    components: "-", 
    duration: "Permanente" 
  },
  "Robustez de Colina": { 
    level: "Traço Racial", 
    desc: "Sua linhagem de anão da colina concede uma resistência física extraordinária. Seu máximo de pontos de vida aumenta em 1 e aumenta em mais 1 a cada vez que você ganha um nível. Seu corpo é tão sólido quanto as montanhas, absorvendo impactos que derrubariam outros guerreiros.", 
    castingTime: "Passiva", 
    range: "Pessoal", 
    components: "-", 
    duration: "Permanente" 
  },
  "Resiliência Duergar": { 
    level: "Traço Racial", 
    desc: "Sua mente é endurecida pelas duras condições do Subterrâneo. Você possui vantagem em testes de resistência contra ilusões e para resistir a ser enfeitiçado ou paralisado por meios mágicos. Sua vontade é como o ferro temperado nas forjas profundas.", 
    castingTime: "Passiva", 
    range: "Pessoal", 
    components: "-", 
    duration: "Permanente" 
  },
  "Ancestralidade Feérica": {
    level: "Traço Racial",
    desc: "Seu sangue é tocado pela magia selvagem da Agrestia das Fadas. Você possui vantagem em testes de resistência para evitar ser enfeitiçado e magias não podem colocar você para dormir. Sua mente é um labirinto de herança feérica impenetrável à manipulação básica.",
    castingTime: "Passiva",
    range: "Pessoal",
    components: "-",
    duration: "Permanente"
  },
  "Transe": {
    level: "Traço Racial",
    desc: "Elfos não precisam dormir. Em vez disso, eles meditam profundamente, permanecendo semiconscientes, durante 4 horas por dia. Enquanto medita, você pode sonhar de certa forma; tais sonhos são, na verdade, exercícios mentais que se tornaram reflexos através de anos de prática. Após descansar dessa forma, você ganha os mesmos benefícios que um humano ganha com 8 horas de sono.",
    castingTime: "Passiva",
    range: "Pessoal",
    components: "-",
    duration: "Permanente"
  },
  "Sentidos Aguçados": {
    level: "Traço Racial",
    desc: "Seus olhos e ouvidos são treinados para captar as sutilezas do mundo ao seu redor. Você tem proficiência na perícia Percepção, permitindo que você note detalhes que passariam despercebidos por outros.",
    castingTime: "Passiva",
    range: "Pessoal",
    components: "-",
    duration: "Permanente"
  },
  "Treinamento Armado Élfico": {
    level: "Traço Racial",
    desc: "Desde a infância, você foi treinado no uso das armas tradicionais do seu povo. Você tem proficiência com espadas longas, espadas curtas, arcos curtos e arcos longos.",
    castingTime: "Passiva",
    range: "Pessoal",
    components: "-",
    duration: "Permanente"
  },
  "Máscara da Natureza": {
    level: "Traço Racial",
    desc: "Você pode tentar se esconder mesmo quando estiver apenas levemente obscurecido por folhagem, chuva forte, neve caindo, névoa ou outro fenômeno natural. Sua conexão com a floresta permite que você se funda ao ambiente.",
    castingTime: "Passiva",
    range: "Pessoal",
    components: "-",
    duration: "Permanente"
  },
  "Pés Ligeiros": {
    level: "Traço Racial",
    desc: "Seu deslocamento base aumenta em 1,5 metros. Sua passos são rápidos e graciosos, permitindo que você cubra distâncias maiores com menos esforço.",
    castingTime: "Passiva",
    range: "Pessoal",
    components: "-",
    duration: "Permanente"
  },
  "Sortudo": {
    level: "Traço Racial",
    desc: "Quando você rolar um 1 natural no dado de 20 para uma jogada de ataque, teste de atributo ou teste de resistência, você pode rolar o dado novamente e deve usar o novo resultado. O destino parece sorrir para você nos momentos mais improváveis.",
    castingTime: "Passiva",
    range: "Pessoal",
    components: "-",
    duration: "Permanente"
  },
  "Bravura": {
    level: "Traço Racial",
    desc: "Seu coração pequeno abriga um espírito indomável. Você tem vantagem em testes de resistência contra ser amedrontado.",
    castingTime: "Passiva",
    range: "Pessoal",
    components: "-",
    duration: "Permanente"
  },
  "Agilidade Halfling": {
    level: "Traço Racial",
    desc: "Você pode se mover através do espaço de qualquer criatura que seja de um tamanho maior que o seu. Sua baixa estatura e flexibilidade permitem que você deslize entre pernas e obstáculos com facilidade.",
    castingTime: "Passiva",
    range: "Pessoal",
    components: "-",
    duration: "Permanente"
  },
  "Furtividade Natural": {
    level: "Traço Racial",
    desc: "Você pode tentar se esconder mesmo quando estiver obscurecido por uma criatura que seja pelo menos um tamanho maior que o seu. Você usa os outros como cobertura natural para desaparecer de vista.",
    castingTime: "Passiva",
    range: "Pessoal",
    components: "-",
    duration: "Permanente"
  },
  "Resistência Infernal": {
    level: "Traço Racial",
    desc: "Seu sangue demoníaco protege você contra o calor intenso. Você tem resistência a dano de fogo, permitindo-lhe caminhar através de brasas ou resistir a explosões flamejantes com facilidade.",
    castingTime: "Passiva",
    range: "Pessoal",
    components: "-",
    duration: "Permanente"
  },
  "Tolerância Infindável": {
    level: "Traço Racial",
    desc: "Quando você é reduzido a 0 pontos de vida mas não morre imediatamente, você pode voltar para 1 ponto de vida em vez disso. Você não pode usar esse traço novamente até completar um descanso longo. Sua ferocidade orc o mantém lutando quando outros já teriam caído.",
    castingTime: "Passiva",
    range: "Pessoal",
    components: "-",
    duration: "Permanente"
  },
  "Ataque Selvagem": {
    level: "Traço Racial",
    desc: "Quando você atinge um acerto crítico com um ataque de arma corpo-a-corpo, você pode rolar um dos dados de dano da arma mais uma vez e adicioná-lo ao dano extra do acerto crítico.",
    castingTime: "Passiva",
    range: "Pessoal",
    components: "-",
    duration: "Permanente"
  },
  "Arma de Sopro": {
    level: "Traço Racial",
    desc: "Você pode usar sua ação para exalar uma energia destrutiva dependendo da sua ancestralidade dracônica. Cada criatura na área da exalação deve realizar um teste de resistência (CD = 8 + seu mod de Con + seu Bônus de Proficiência). Uma criatura sofre 2d6 de dano em uma falha, ou metade em um sucesso. O dano aumenta para 3d6 no 6º nível, 4d6 no 11º e 5d6 no 16º.",
    castingTime: "1 Ação",
    range: "Variável",
    components: "-",
    duration: "Instantânea"
  },
  "Resistência a Dano": {
    level: "Traço Racial",
    desc: "Sua escamas dracônicas são infundidas com a essência do seu ancestral. Você tem resistência ao tipo de dano associado à sua cor dracônica.",
    castingTime: "Passiva",
    range: "Pessoal",
    components: "-",
    duration: "Permanente"
  },
  "Visão no Escuro (Traço)": {
    level: "Traço Racial",
    desc: "Você enxerga na penumbra a até 18 metros como se fosse luz plena, e na escuridão como se fosse penumbra. Você não pode distinguir cores no escuro, apenas tons de cinza.",
    castingTime: "Passiva",
    range: "18m",
    components: "-",
    duration: "Permanente"
  },
  "Astúcia Gnômica": {
    level: "Traço Racial",
    desc: "Sua mente é ágil e protegida contra manipulações externas. Você tem vantagem em todos os testes de resistência de Inteligência, Sabedoria e Carisma contra magia.",
    castingTime: "Passiva",
    range: "Pessoal",
    components: "-",
    duration: "Permanente"
  },
  "Ataque Furtivo": {
    level: "Habilidade de Classe",
    desc: "Você sabe como atingir sutilmente e explorar a distração de um oponente. Uma vez por turno, você pode causar dano extra a uma criatura que atingir com um ataque, se tiver vantagem na jogada de ataque. O ataque deve ser com uma arma de acuidade ou à distância. Você não precisa de vantagem se outro inimigo do alvo estiver a 1,5 metro dele, se esse inimigo não estiver incapacitado e se você não tiver desvantagem na jogada de ataque.",
    castingTime: "Ataque",
    range: "Arma",
    components: "-",
    duration: "Instantânea"
  },
  "Ação Astuta": {
    level: "Habilidade de Classe",
    desc: "Sua agilidade natural permite que você se mova e aja com rapidez. Você pode realizar uma ação bônus em cada um dos seus turnos em combate. Esta ação pode ser usada apenas para realizar as ações de Disparar, Desengajar ou Esconder.",
    castingTime: "1 Ação Bônus",
    range: "Pessoal",
    components: "-",
    duration: "Instantânea"
  },
  "Gíria de Ladrão": {
    level: "Habilidade de Classe",
    desc: "Durante seu treinamento como ladino, você aprendeu a gíria de ladrão, uma mistura de dialeto, jargão e sinais secretos que permite transmitir mensagens em uma conversa aparentemente normal. Somente outra criatura que conheça a gíria de ladrão entende tais mensagens.",
    castingTime: "Livre",
    range: "Pessoal",
    components: "-",
    duration: "Permanente"
  },
  "Especialização": {
    level: "Habilidade de Classe",
    desc: "Você escolhe duas de suas perícias em que seja proficiente, ou uma proficiência de perícia e sua proficiência com ferramentas de ladrão. Seu bônus de proficiência é dobrado para qualquer teste de atributo que você fizer e que use qualquer uma das proficiências escolhidas.",
    castingTime: "Passiva",
    range: "Pessoal",
    components: "-",
    duration: "Permanente"
  },
  "Evasão": {
    level: "Habilidade de Classe",
    desc: "Você pode se esquivar agilmente de certos efeitos em área, como o sopro de fogo de um dragão vermelho ou uma magia relâmpago. Quando você for alvo de um efeito que exija um teste de resistência de Destreza para sofrer apenas metade do dano, você não sofre dano algum se passar no teste e apenas metade do dano se falhar.",
    castingTime: "Passiva",
    range: "Pessoal",
    components: "-",
    duration: "Permanente"
  },
  "Sentido Sobrenatural": {
    level: "Habilidade de Classe",
    desc: "Você ganha uma consciência estranha sobre quando criaturas e objetos estão próximos. Você não sofre desvantagem em jogadas de ataque contra criaturas que não pode ver, desde que elas não estejam escondidas de você, e você tem consciência da localização de qualquer criatura invisível a até 3 metros de você.",
    castingTime: "Passiva",
    range: "3m",
    components: "-",
    duration: "Permanente"
  },
  "Mãos Rápidas": {
    level: "Habilidade de Classe",
    desc: "Você pode usar a sua Ação Astuta para realizar um teste de Destreza (Prestidigitação), usar suas ferramentas de ladrão para desarmar uma armadilha ou abrir uma fechadura, ou realizar a ação de Usar um Objeto.",
    castingTime: "1 Ação Bônus",
    range: "Pessoal",
    components: "-",
    duration: "Instantânea"
  },
  "Escalador Especialista": {
    level: "Habilidade de Classe",
    desc: "Você ganha a habilidade de escalar mais rápido do que o normal; escalar não custa mais movimento extra. Além disso, quando você fizer um salto com corrida, a distância que você percorre aumenta em um número de metros igual ao seu modificador de Destreza.",
    castingTime: "Passiva",
    range: "Pessoal",
    components: "-",
    duration: "Permanente"
  },
  "Assassinato": {
    level: "Habilidade de Classe",
    desc: "Você é mais letal quando ataca primeiro. Você tem vantagem em jogadas de ataque contra qualquer criatura que ainda não tenha jogado seu turno no combate. Além disso, qualquer acerto que você desferir contra uma criatura surpresa é um acerto crítico.",
    castingTime: "Passiva",
    range: "Pessoal",
    components: "-",
    duration: "Permanente"
  },
  "Infiltração de Especialista": {
    level: "Habilidade de Classe",
    desc: "Você pode criar falsas identidades para si mesmo de forma infalível. Você deve gastar sete dias e 25 po para estabelecer o histórico, profissão e amizades de uma identidade. Outras criaturas acreditam que você é essa pessoa até que tenham uma razão óbvia para não acreditar.",
    castingTime: "7 dias",
    range: "Pessoal",
    components: "-",
    duration: "Permanente"
  },
  "Esquiva Sobrenatural": {
    level: "Habilidade de Classe",
    desc: "Quando um atacante que você possa ver atinge você com um ataque, você pode usar sua reação para reduzir o dano do ataque à metade.",
    castingTime: "1 Reação",
    range: "Pessoal",
    components: "-",
    duration: "Instantânea"
  },
  "Ataque Descuidado": {
    level: "Habilidade de Classe",
    desc: "Você joga toda a cautela ao vento para maximizar seu potencial de ataque. No seu turno, você pode decidir atacar de forma descuidada. Ao fazer isso, você tem vantagem em todas as jogadas de ataque com armas corpo-a-corpo que usarem Força durante este turno, mas todas as jogadas de ataque contra você têm vantagem até o início do seu próximo turno.",
    castingTime: "Passiva (No seu turno)",
    range: "Pessoal",
    components: "-",
    duration: "1 rodada"
  },
  "Defesa sem Armadura": {
    level: "Habilidade de Classe",
    desc: "Enquanto você não estiver usando nenhuma armadura, sua Classe de Armadura é igual a 10 + seu modificador de Destreza + seu modificador de Constituição (para Bárbaros) ou Sabedoria (para Monges). Você pode usar um escudo e ainda assim ganhar este bônus como Bárbaro.",
    castingTime: "Passiva",
    range: "Pessoal",
    components: "-",
    duration: "Permanente"
  },
  "Mãos Curadoras": {
    level: "Traço Racial",
    desc: "Como uma ação, você pode tocar uma criatura e liberar uma centelha do poder divino ancestral para curar suas feridas. A criatura recupera um número de pontos de vida igual ao seu nível. Uma vez utilizado, você deve completar um descanso longo para usar esse traço novamente. Sua herança celestial serve como um farol de esperança e restauração para seus aliados.",
    castingTime: "1 Ação",
    range: "Toque",
    components: "S",
    duration: "Instantânea"
  },
  "Resistência Radiante": {
    level: "Traço Racial",
    desc: "Sua natureza celestial protege você contra energias sagradas devastadoras. Você tem resistência a dano radiante, permitindo que suporte luzes intensas e punições divinas com maior resiliência.",
    castingTime: "Passiva",
    range: "Pessoal",
    components: "-",
    duration: "Permanente"
  },
  "Resistência Necrótica": {
    level: "Traço Racial",
    desc: "Sua alma é fortalecida contra o toque da morte e da corrupção. Você possui resistência a dano necrótico, protegendo seu corpo contra o murchar causado por energias negativas e mortos-vivos.",
    castingTime: "Passiva",
    range: "Pessoal",
    components: "-",
    duration: "Permanente"
  },
  "Luz Portadora": {
    level: "Traço Racial",
    desc: "Você conhece o truque Luz. O Carisma é seu atributo de conjuração para essa magia, permitindo que você convoque o brilho dos planos superiores para iluminar o caminho.",
    castingTime: "1 Ação",
    range: "Toque",
    components: "V, M",
    duration: "1 hora"
  },
  "Membros Longos": {
    level: "Traço Racial",
    desc: "Suas pernas e braços são desproporcionalmente longos para o seu corpo, conferindo-lhe uma vantagem tática incomum. Quando você realiza um ataque corpo-a-corpo no seu turno, seu alcance é 1,5 metro maior do que o normal. Isso permite golpear inimigos antes que eles possam alcançá-lo.",
    castingTime: "Passiva",
    range: "Pessoal",
    components: "-",
    duration: "Permanente"
  },
  "Ataque Surpresa": {
    level: "Traço Racial",
    desc: "Se você atingir uma criatura com um ataque no seu primeiro turno de combate e a criatura ainda não tiver realizado um turno, o ataque causa 2d6 de dano extra. Sua ferocidade inicial é projetada para encerrar conflitos antes que eles realmente comecem.",
    castingTime: "Passiva",
    range: "Arma",
    components: "-",
    duration: "Instantânea"
  },
  "Rugido Assustador": {
    level: "Traço Racial",
    desc: "Como uma ação bônus, você solta um rugido aterrorizante que ressoa pelos ossos de seus inimigos. Cada criatura à sua escolha em um raio de 3 metros deve passar por um teste de resistência de Sabedoria (CD 8 + seu mod de Con + seu Bônus de Proficiência) ou ficará aterrorizada por você até o final do seu próximo turno. Você recupera o uso deste traço após um descanso curto ou longo.",
    castingTime: "1 Ação Bônus",
    range: "3m (Raio)",
    components: "V",
    duration: "1 rodada"
  },
  "Tromba Versátil": {
    level: "Traço Racial",
    desc: "Sua tromba é uma ferramenta extraordinariamente útil. Você pode usá-la para manipular objetos simples, carregar coisas leves, ou até mesmo como um tubo de respiração em águas rasas. Em combate, ela pode ser usada para realizar a ação de Agarrar ou Empurrar uma criatura, deixando suas mãos livres para empunhar armas.",
    castingTime: "Passiva",
    range: "1,5m",
    components: "-",
    duration: "Permanente"
  },
  "Iniciativa de Lebre": {
    level: "Traço Racial",
    desc: "Seus reflexos são extremamente rápidos, como os de uma lebre em alerta. Você adiciona seu bônus de proficiência à sua jogada de iniciativa, garantindo que quase sempre seja um dos primeiros a agir no combate.",
    castingTime: "Passiva",
    range: "Pessoal",
    components: "-",
    duration: "Permanente"
  },
  "Corrida de Adrenalina": {
    level: "Traço Racial",
    desc: "Como uma ação bônus, você pode realizar a ação de Disparar (Dash). Além disso, quando você realiza essa ação bônus, você ganha um número de pontos de vida temporários igual ao seu bônus de proficiência. Você pode usar este traço um número de vezes igual ao seu bônus de proficiência e recupera todos os usos após um descanso longo.",
    castingTime: "1 Ação Bônus",
    range: "Pessoal",
    components: "-",
    duration: "Instantânea"
  },
  "Visão no Escuro (Traço Fogo)": {
    level: "Traço Racial",
    desc: "Sua herança elemental do fogo concede-lhe uma visão adaptada às chamas. Você enxerga na escuridão a até 18 metros como se fosse penumbra. Sua visão nesse estado possui um brilho avermelhado constante.",
    castingTime: "Passiva",
    range: "18m",
    components: "-",
    duration: "Permanente"
  },
  "Resistência ao Fogo": {
    level: "Traço Racial",
    desc: "Seu corpo irradia um calor sutil e suas células são adaptadas a temperaturas extremas. Você possui resistência a dano de fogo.",
    castingTime: "Passiva",
    range: "Pessoal",
    components: "-",
    duration: "Permanente"
  },
  "Fúria dos Pequenos": {
    level: "Traço Racial",
    desc: "Quando você causa dano a uma criatura com um ataque ou magia e o tamanho da criatura é maior que o seu, você pode fazer com que o ataque ou magia cause dano extra igual ao seu bônus de proficiência. Você pode usar este traço um número de vezes igual ao seu bônus de proficiência e recupera os usos após um descanso longo.",
    castingTime: "Passiva",
    range: "Arma/Magia",
    components: "-",
    duration: "Instantânea"
  },
  "Escape Ágil": {
    level: "Traço Racial",
    desc: "Você pode realizar a ação de Desengajar ou Esconder como uma ação bônus em cada um de seus turnos. Sua baixa estatura e agilidade natural tornam você um alvo difícil de prender.",
    castingTime: "1 Ação Bônus",
    range: "Pessoal",
    components: "-",
    duration: "Instantânea"
  },
  "Mãos Mágicas (Githyanki)": {
    level: "Traço Racial",
    desc: "Você conhece o truque Mãos Mágicas. Quando você o conjura, a mão é invisível. Esta habilidade reflete sua maestria inata sobre as energias mentais do Plano Astral.",
    castingTime: "1 Ação",
    range: "9m",
    components: "V, S",
    duration: "1 minuto"
  },
  "Visão no Escuro Superior (Gnomo)": {
    level: "Traço Racial",
    desc: "Adaptado à vida nas profundezas abissais, sua visão no escuro tem um alcance de 36 metros. Você enxerga no escuro total como se fosse penumbra.",
    castingTime: "Passiva",
    range: "36m",
    components: "-",
    duration: "Permanente"
  },
  "Camuflagem Rochosa": {
    level: "Traço Racial",
    desc: "Sua pele e movimentos imitam as texturas e sombras das rochas. Você tem vantagem em testes de Destreza (Furtividade) realizados em terrenos rochosos ou subterrâneos.",
    castingTime: "Passiva",
    range: "Pessoal",
    components: "-",
    duration: "Permanente"
  },
  "Sopro Interminável": {
    level: "Traço Racial",
    desc: "Seus pulmões são infundidos com a essência do Plano do Ar. Você pode prender a respiração indefinidamente enquanto não estiver incapacitado. Você nunca corre o risco de sufocar enquanto estiver consciente.",
    castingTime: "Passiva",
    range: "Pessoal",
    components: "-",
    duration: "Permanente"
  },
  "Caminhar sobre a Terra": {
    level: "Traço Racial",
    desc: "Sua conexão com o elemento terra é tão profunda que você pode ignorar terrenos difíceis compostos de terra ou pedra. Você se move sobre pedregulhos, areia e lama sem qualquer penalidade de movimento.",
    castingTime: "Passiva",
    range: "Pessoal",
    components: "-",
    duration: "Permanente"
  },
  "Mudança de Forma": {
    level: "Traço Racial",
    desc: "Como uma ação, você pode alterar sua aparência física. Você decide todos os detalhes, incluindo altura, peso, traços faciais, som da voz, comprimento do cabelo e marcas distintivas. Você pode se parecer com um membro de outra raça, embora suas estatísticas não mudem. Você não pode usar esse traço para duplicar a aparência de uma criatura que nunca viu.",
    castingTime: "1 Ação",
    range: "Pessoal",
    components: "-",
    duration: "Até mudar novamente"
  },
  "Estilo de Luta": {
    level: "Habilidade de Classe",
    desc: "Você adota um estilo particular de combate como sua especialidade. Escolha entre: Arquearia (+2 em ataques à distância), Defesa (+1 na CA com armadura), Duelismo (+2 no dano com uma arma em uma mão), Combate com Duas Armas (soma mod no segundo ataque), ou Proteção (usa reação para dar desvantagem no inimigo).",
    castingTime: "Passiva",
    range: "Pessoal",
    components: "-",
    duration: "Permanente"
  },
  "Ataque Extra": {
    level: "Habilidade de Classe",
    desc: "Através do treinamento marcial rigoroso, você pode atacar duas vezes, em vez de uma, sempre que realizar a ação de Ataque no seu turno. Algumas classes, como o Guerreiro, podem ganhar ataques adicionais em níveis mais altos.",
    castingTime: "Ação de Ataque",
    range: "Pessoal",
    components: "-",
    duration: "Instantânea"
  },
  "Dádiva da Fartura (Ajuda)": {
    level: "Traço Racial",
    desc: "Sua cultura valoriza a cooperação tática extrema. Você pode realizar a ação de Ajudar (Help) como uma ação bônus um número de vezes igual ao seu bônus de proficiência. Além disso, a partir do 3º nível, quando você ajuda um aliado, você pode escolher um benefício adicional: PV temporários, velocidade extra ou vantagem em um ataque.",
    castingTime: "1 Ação Bônus",
    range: "Pessoal",
    components: "-",
    duration: "Instantânea"
  },
  "Lembrança Especialista": {
    level: "Traço Racial",
    desc: "Você possui uma memória fotográfica para detalhes técnicos e movimentos. Você ganha proficiência em duas perícias de sua escolha. Além disso, quando falha em um teste de perícia, você pode usar seu conhecimento ancestral para ganhar vantagem naquele teste um número de vezes igual ao seu bônus de proficiência.",
    castingTime: "Passiva",
    range: "Pessoal",
    components: "-",
    duration: "Permanente"
  },
  "Mimetismo": {
    level: "Traço Racial",
    desc: "Você pode imitar sons que ouviu, incluindo vozes. Uma criatura que ouça os sons pode perceber que são imitações através de um teste bem-sucedido de Sabedoria (Intuição) contra seu teste de Carisma (Enganação).",
    castingTime: "Passiva",
    range: "Voz",
    components: "-",
    duration: "Permanente"
  },
  "Grito Dracônico": {
    level: "Traço Racial",
    desc: "Como uma ação bônus, você solta um grito que inspira seus aliados e abala seus inimigos. Até o final do seu próximo turno, você e seus aliados têm vantagem em jogadas de ataque contra inimigos a até 3 metros de você. Você pode usar este traço um número de vezes igual ao seu bônus de proficiência.",
    castingTime: "1 Ação Bônus",
    range: "3m",
    components: "V",
    duration: "1 rodada"
  },
  "Pele Venenosa": {
    level: "Traço Racial",
    desc: "Qualquer criatura que agarre você ou o atinja com um ataque desarmado deve passar num teste de resistência de Constituição ou ficará envenenada por 1 minuto. Além disso, você pode aplicar esse veneno às suas armas como parte de um ataque.",
    castingTime: "Passiva",
    range: "Toque",
    components: "-",
    duration: "Permanente"
  },
  "Salto em Pé": {
    level: "Traço Racial",
    desc: "Seu salto em distância é de até 7,5 metros e seu salto em altura é de até 4,5 metros, com ou sem uma corrida inicial. Sua anatomia de anfíbio permite impulsos motores verticais incríveis.",
    castingTime: "Passiva",
    range: "Pessoal",
    components: "-",
    duration: "Permanente"
  },
  "Ancestralidade Dracônica (Cromo)": {
    level: "Traço Racial",
    desc: "Sua linhagem provém dos dragões cromáticos (Preto, Azul, Verde, Vermelho ou Branco). Você ganha uma arma de sopro de 4,5 metros e resistência ao tipo de dano elemental correspondente. A partir do 5º nível, você ganha a 'Proteção Cromática' como reação para se tornar imune ao seu tipo de dano por um curto período.",
    castingTime: "Passiva",
    range: "Pessoal",
    components: "-",
    duration: "Permanente"
  },
  "Ancestralidade Dracônica (Metal)": {
    level: "Traço Racial",
    desc: "Sua linhagem provém dos dragões metálicos (Latão, Bronze, Cobre, Ouro ou Prata). Você possui uma arma de sopro poderosa e resistência elemental. A partir do 5º nível, você ganha um 'Sopro Metálico Secundário' que pode repelir ou incapacitar inimigos em vez de apenas causar dano.",
    castingTime: "Passiva",
    range: "Pessoal",
    components: "-",
    duration: "Permanente"
  },
  "Fúria": { 
    level: "Habilidade", 
    school: "Combate", 
    desc: "Em batalha, você luta com uma ferocidade primordial e cega. Enquanto estiver em fúria, você ganha força física descomunal, tornando-se mais difícil de derrubar, causando danos devastadores com armas corpo-a-corpo e resistindo a ferimentos que matariam um homem comum. Sua fúria dura 1 minuto e exige que você ataque ou sofra dano para se manter ativa. É um estado de transe onde a dor é apenas um combustível para sua raiva.", 
    castingTime: "1 Ação Bônus", 
    range: "Pessoal", 
    components: "V", 
    duration: "1 minuto" 
  },
  "Sentido de Perigo": { 
    level: "Habilidade", 
    school: "Defesa", 
    desc: "Seus instintos foram forjados na selvageria, permitindo que você sinta o perigo antes mesmo que ele se manifeste em sua direção. Você tem vantagem em testes de resistência de Destreza contra efeitos e perigos que você possa ver, como armadilhas mortais, quedas de rochas ou labaredas mágicas, desde que você não esteja cego, surdo ou incapacitado.", 
    castingTime: "Passiva", 
    range: "Pessoal", 
    components: "-", 
    duration: "Permanente" 
  },
  "Retomar o Fôlego": { 
    level: "Habilidade", 
    school: "Cura", 
    desc: "Você possui uma reserva oculta de vitalidade e determinação que lhe permite ignorar a fadiga e os ferimentos leves em meio ao caos do combate. Como uma ação bônus, você respira fundo e recupera uma quantidade significativa de vigor (1d10 + nível de guerreiro). Este momento de clareza restaura sua prontidão física.", 
    castingTime: "1 Ação Bônus", 
    range: "Pessoal", 
    components: "-", 
    duration: "Instantânea" 
  },
  "Surto de Ação": { 
    level: "Habilidade", 
    school: "Combate", 
    desc: "Por um breve instante, você ultrapassa os limites humanos da exaustão e se move com uma velocidade sobrenatural. No seu turno, você pode realizar uma ação adicional completa, além da sua ação normal e ação bônus. Este esforço é exaustivo e exige um breve descanso para ser usado novamente, representando o pináculo do treinamento marcial.", 
    castingTime: "Passiva (No seu turno)", 
    range: "Pessoal", 
    components: "-", 
    duration: "Instantânea" 
  },
  "Espírito Totêmico": {
    level: "Habilidade de Subclasse",
    desc: "Ao escolher este caminho no 3º nível, você escolhe um espírito totêmico e ganha sua feição. Urso: resistência a todo dano exceto psíquico. Águia: vantagem para evitar ataques de oportunidade e pode correr como ação bônus. Lobo: vantagem para aliados em ataques corpo-a-corpo contra inimigos próximos a você. Seu corpo torna-se um receptáculo para a força da natureza.",
    castingTime: "Passiva / Especial",
    range: "Pessoal",
    components: "-",
    duration: "Permanente"
  },
  "Buscador Espiritual": {
    level: "Habilidade de Subclasse",
    desc: "Sua conexão com o mundo espiritual permite que você busque sabedoria além do véu. Você pode conjurar as magias 'Falar com Animais' e 'Sentido Bestial' como rituais, buscando orientação da fauna local e dos espíritos ancestrais da floresta.",
    castingTime: "Ritual (10 min)",
    range: "Especial",
    components: "V, S",
    duration: "Instantânea"
  },
  "Técnica da Mão Aberta": {
    level: "Habilidade de Subclasse",
    desc: "Você manipula o Ki do seu oponente através de golpes precisos. Ao atingir uma criatura com a sua Rajada de Golpes, você pode aplicar um dos seguintes efeitos: forçá-la a um teste de Destreza para não cair Caída, um teste de Força para ser empurrada 4,5m, ou impedi-la de realizar reações até o fim do seu próximo turno.",
    castingTime: "Ação de Ataque",
    range: "Toque",
    components: "-",
    duration: "Instantânea"
  },
  "Integridade Corporal": {
    level: "Habilidade de Subclasse",
    desc: "Você aprendeu a fechar suas próprias feridas através da meditação e controle de energia. Com uma ação, você pode recuperar pontos de vida iguais a três vezes o seu nível de monge. Uma vez que você use este recurso, deve completar um descanso longo para usá-lo novamente.",
    castingTime: "1 Ação",
    range: "Pessoal",
    components: "S",
    duration: "Instantânea"
  },
  "Passo das Sombras": {
    level: "Habilidade de Subclasse",
    desc: "Você ganha a habilidade mística de saltar entre as sombras. Quando estiver em penumbra ou escuridão, com uma ação bônus, você pode se teletransportar a até 18 metros para um local não ocupado que também esteja em penumbra ou escuridão. Você ganha vantagem no próximo ataque corpo-a-corpo que realizar no mesmo turno.",
    castingTime: "1 Ação Bônus",
    range: "18m",
    components: "S",
    duration: "Instantânea"
  },
  "Vínculo com Arma": {
    level: "Habilidade de Subclasse",
    desc: "Você cria uma ligação mágica indissolúvel com sua arma. Através de um ritual de 1 hora, você fixa sua essência nela. Você não pode ser desarmado dessa arma a menos que esteja incapacitado e, se estiver no mesmo plano, pode convocá-la instantaneamente para sua mão como uma ação bônus.",
    castingTime: "Ritual / 1 Ação Bônus",
    range: "Pessoal (Especial)",
    components: "V",
    duration: "Até ser dissipado"
  },
  "Tiro Arcano": {
    level: "Habilidade de Subclasse",
    desc: "Você infunde suas flechas com energias dimensionais ou elementais devastadoras. Você pode escolher entre opções como 'Tiro de Enredar' (cria vinhas no alvo), 'Tiro Perfurante' (atravessa inimigos) ou 'Tiro Explosivo' (dano em área). Você possui dois usos desta habilidade que recarregam após um descanso curto ou longo.",
    castingTime: "Com o Ataque",
    range: "Arma",
    components: "Arma à Distância",
    duration: "Instantânea"
  },
  "Atleta de Telhado": {
    level: "Habilidade de Subclasse",
    desc: "A selva urbana ou as montanhas escarpadas são seu habitat natural. Escalar não gasta mais movimento extra para você. Além disso, quando você realiza um salto corrido, a distância que você percorre aumenta em um número de metros igual ao seu modificador de Destreza.",
    castingTime: "Passiva",
    range: "Pessoal",
    components: "-",
    duration: "Permanente"
  },
  "Furtividade Suprema": {
    level: "Habilidade de Subclasse",
    desc: "Você se torna um espectro indetectável. Você tem vantagem em testes de Destreza (Furtividade) se você se mover no máximo metade do seu deslocamento no mesmo turno. Sombras parecem curvar-se para esconder sua presença.",
    castingTime: "Passiva",
    range: "Pessoal",
    components: "-",
    duration: "Permanente"
  },
  "Emboscada Mágica": {
    level: "Habilidade de Subclasse",
    desc: "Se você estiver escondido de uma criatura quando conjurar uma magia nela, a criatura terá desvantagem em qualquer teste de resistência que fizer contra a magia naquele turno. Você ataca os pontos cegos mentais da sua vítima.",
    castingTime: "Passiva (Conjuração)",
    range: "Magia",
    components: "-",
    duration: "Instantânea"
  },
  "Palavras Cortantes": {
    level: "Habilidade de Subclasse",
    desc: "Você aprende a proferir insultos carregados de magia para desorientar o inimigo. Quando uma criatura que você vê a até 18 metros realiza um ataque, teste ou dano, você pode gastar um uso de Inspiração de Bardo como reação e subtrair o valor do dado do total da criatura.",
    castingTime: "Reação",
    range: "18m",
    components: "V",
    duration: "Instantânea"
  },
  "Inspiração de Combate": {
    level: "Habilidade de Subclasse",
    desc: "Seus hinos de guerra inspiram atos heroicos no campo de batalha. Criaturas com sua Inspiração de Bardo podem adicionar o dado ao dano de um ataque com arma ou usar sua reação para adicionar o resultado à sua Classe de Armadura contra um ataque que as atingiria.",
    castingTime: "Passiva (Inspirar)",
    range: "Pessoal",
    components: "V",
    duration: "Especial"
  },
  "Presa do Caçador": {
    level: "Habilidade de Subclasse",
    desc: "Você estuda as fraquezas de suas presas. Escolha entre: 'Matador de Colossos' (dano extra em alvos feridos), 'Quebra-Hordas' (ataque adicional contra inimigos próximos) ou 'Matador de Gigantes' (reação para contra-atacar se o alvo errar).",
    castingTime: "Passiva",
    range: "Pessoal",
    components: "-",
    duration: "Permanente"
  },
  "Companheiro do Patrulheiro": {
    level: "Habilidade de Subclasse",
    desc: "Você forma um vínculo espiritual e físico com uma besta orgânica ou espiritual. Em combate, ela age no seu valor de iniciativa e você pode usar sua ação (ou um dos seus ataques se tiver Ataque Extra) para comandá-la a realizar a ação de Ataque, Disparar, Desengajar ou Ajudar.",
    castingTime: "Passiva / Comando",
    range: "Visual",
    components: "V",
    duration: "Permanente"
  },
  "Emboscador Temível": {
    level: "Habilidade de Subclasse",
    desc: "Você domina os primeiros instantes letais de qualquer confronto. Você adiciona seu modificador de Sabedoria à sua iniciativa. No seu primeiro turno de cada combate, seu deslocamento aumenta em 3 metros e você pode realizar um ataque extra que causa 1d8 de dano adicional se atingir.",
    castingTime: "Passiva",
    range: "Pessoal",
    components: "-",
    duration: "1 rodada (Início)"
  },
  "Visão Umbral": {
    level: "Habilidade de Subclasse",
    desc: "Você é um mestre da escuridão profunda. Você ganha visão no escuro (18 metros). Além disso, você é invisível para qualquer criatura que dependa de visão no escuro para enxergá-lo enquanto estiver na escuridão total. Você é o pesadelo que vive no escuro.",
    castingTime: "Passiva",
    range: "18m",
    components: "-",
    duration: "Permanente"
  },
  "Arma Sagrada": {
    level: "Habilidade de Subclasse",
    desc: "Você imbui sua lâmina com a força da sua fé. Por 1 minuto, você adiciona seu modificador de Carisma às jogadas de ataque com essa arma (mínimo +1), a arma emite luz brilhante e é considerada mágica para superar resistências.",
    castingTime: "1 Ação",
    range: "Pessoal",
    components: "V",
    duration: "1 minuto"
  },
  "Voto de Enimizade": {
    level: "Habilidade de Subclasse",
    desc: "Você marca um inimigo para o julgamento final. Você ganha vantagem em todas as jogadas de ataque contra uma criatura escolhida a até 3 metros por 1 minuto ou até que ela caia a 0 PV. Nada pode desviar seu foco punitivo.",
    castingTime: "1 Ação Bônus",
    range: "3m",
    components: "V",
    duration: "1 minuto"
  },
  "Ira da Natureza": {
    level: "Habilidade de Subclasse",
    desc: "Você invoca raízes bárbaras e vinhas espectrais para prender seus oponentes. Cada criatura a até 3 metros deve passar num teste de resistência de Força ou Destreza ou ficará Contida pelo crescimento sobrenatural da flora.",
    castingTime: "1 Ação",
    range: "3m (Raio)",
    components: "V, S",
    duration: "1 minuto"
  },
  "Discípulo da Vida": {
    level: "Habilidade de Subclasse",
    desc: "Sua conexão com o Domínio da Vida potencializa cada cura que você conjura. Sempre que usar uma magia de nível 1 ou superior para restaurar PV, o alvo recupera pontos adicionais iguais a 2 + o nível da magia. Sua fé é um bálsamo inesgotável.",
    castingTime: "Passiva (Cura)",
    range: "Pessoal",
    components: "-",
    duration: "Instantânea"
  },
  "Guerreiro dos Deuses": {
    level: "Habilidade de Subclasse",
    desc: "Sua alma é um farol para os deuses e eles relutam em deixá-lo partir definitivamente. Se uma magia, como 'Reviver os Mortos', for usada para trazê-lo de volta à vida (mas não para curar ferimentos), o conjurador não precisa de componentes materiais para conjurar a magia em você. A morte é apenas um breve intervalo em sua cruzada.",
    castingTime: "Passiva",
    range: "Pessoal",
    components: "-",
    duration: "Permanente"
  },
  "Fúria Divina": {
    level: "Habilidade de Subclasse",
    desc: "Você canaliza o fervor religioso para seus golpes. Enquanto estiver em fúria, a primeira criatura que você atingir em cada um dos seus turnos com um ataque de arma sofre 1d6 + metade do seu nível de bárbaro em dano radiante ou necrótico extra (você escolhe o tipo ao ganhar esta habilidade).",
    castingTime: "Passiva (Fúria)",
    range: "Arma",
    components: "-",
    duration: "Instantânea"
  },
  "Sentido do Caçador": {
    level: "Habilidade de Subclasse",
    desc: "Você ganha a habilidade de examinar misticamente uma criatura e discernir como melhor feri-la. Como uma ação, escolha uma criatura que você possa ver a até 18 metros. Você descobre se a criatura possui imunidades, resistências ou vulnerabilidades a danos e quais são elas, permitindo uma caçada eficiente.",
    castingTime: "1 Ação",
    range: "18m",
    components: "V, S",
    duration: "Instantânea"
  },
  "Conhecimento das Eras": {
    level: "Habilidade de Subclasse",
    desc: "Você acessa uma fonte infinita de conhecimento divino. Como uma ação, você escolhe uma perícia ou ferramenta. Por 10 minutos, você ganha proficiência com a escolha feita, como se tivesse anos de treinamento e estudo acumulados em um instante.",
    castingTime: "1 Ação",
    range: "Pessoal",
    components: "V, S",
    duration: "10 minutos"
  },
  "Ler Pensamentos": {
    level: "Habilidade de Subclasse",
    desc: "Você usa seu Canalizar Divindade para sondar a mente alheia. Como uma ação, escolha uma criatura a até 18 metros. Ela deve passar num teste de resistência de Sabedoria ou você lerá seus pensamentos superficiais. Enquanto durar, você pode encerrar o efeito para conjurar 'Sugestão' sem gastar energia.",
    castingTime: "1 Ação",
    range: "18m",
    components: "V, S",
    duration: "1 minuto"
  },
  "Preservar a Vida": {
    level: "Habilidade de Subclasse",
    desc: "Você canaliza uma onda de energia vital regeneradora. Como uma ação, você distribui uma cura total igual a 5 vezes seu nível de clérigo entre criaturas a até 9 metros. Esta característica não pode restaurar PV de uma criatura além da metade de seu máximo.",
    castingTime: "1 Ação",
    range: "9m (Raio)",
    components: "V, S",
    duration: "Instantânea"
  },
  "Cura Abençoada": {
    level: "Habilidade de Subclasse",
    desc: "Sua dedicação em curar os outros nutre sua própria vida. Sempre que você conjurar uma magia de 1º nível ou superior que restaure pontos de vida a outra criatura, você recupera pontos de vida iguais a 2 + o nível da magia conjurada.",
    castingTime: "Passiva (Cura)",
    range: "Pessoal",
    components: "-",
    duration: "Instantânea"
  },
  "Lampejo de Proteção": {
    level: "Habilidade de Subclasse",
    desc: "Você manifesta um clarão de luz divina para desviar ataques. Quando uma criatura que você possa ver a até 9 metros ataca você, você pode usar sua reação para causar desvantagem na jogada de ataque, cegando momentaneamente o oponente.",
    castingTime: "Reação",
    range: "9m",
    components: "-",
    duration: "Instantânea"
  },
  "Resplendor do Amanhecer": {
    level: "Habilidade de Subclasse",
    desc: "Você expulsa a escuridão com o puro brilho solar. Como uma ação, qualquer escuridão mágica a até 9 metros é dissipada. Além disso, cada criatura hostil na área deve passar num teste de Constituição ou sofrerá 2d10 + seu nível de clérigo em dano radiante.",
    castingTime: "1 Ação",
    range: "9m (Raio)",
    components: "V, S",
    duration: "Instantânea"
  },
  "Sacerdote da Guerra": {
    level: "Habilidade de Subclasse",
    desc: "Seu deus lhe concede lampejos de destreza marcial inspirada. Quando você realiza a ação de Ataque, pode realizar um ataque de arma adicional como uma ação bônus. Você pode usar esta característica um número de vezes igual ao seu modificador de Sabedoria.",
    castingTime: "1 Ação Bônus",
    range: "Arma",
    components: "-",
    duration: "Instantânea"
  },
  "Invocar Duplicata": {
    level: "Habilidade de Subclasse",
    desc: "Você cria uma cópia ilusória e perfeita de si mesmo. Como uma ação, a duplicata aparece num espaço livre a até 9 metros. Você pode conjurar magias como se estivesse no espaço da duplicata, e tem vantagem em ataques se ambos estiverem próximos ao alvo.",
    castingTime: "1 Ação",
    range: "9m",
    components: "S",
    duration: "1 minuto (Concentração)"
  },
  "Defesa Arcana": {
    level: "Habilidade de Subclasse",
    desc: "Você aprendeu a tecer defesas mágicas instantâneas contra ataques e feitiços. Quando você for atingido por um ataque ou falhar em um teste de resistência, você pode usar sua reação para ganhar +2 na CA contra aquele ataque ou +4 no teste de resistência.",
    castingTime: "Reação",
    range: "Pessoal",
    components: "-",
    duration: "Instantânea"
  },
  "Manifestação Mental": {
    level: "Habilidade de Subclasse",
    desc: "Sua vontade intelectual manifesta-se como uma entidade espectral feita de pura tinta e saber. Você pode fazer com que o espírito de seu livro de magias se manifeste a até 18 metros. Você pode ver e ouvir através dele e conjurar magias a partir do seu espaço.",
    castingTime: "1 Ação",
    range: "Pessoal (Manifestação a 18m)",
    components: "V, S",
    duration: "Permanente (até ser dissipada)"
  },
  "Lâminas Mágicas de Kensei": {
    level: "Habilidade de Subclasse",
    desc: "Suas armas Kensei tornam-se extensões de sua própria energia vital refinada. Seus ataques com elas contam como mágicos para superar resistências. Além disso, uma vez por turno, quando você atinge um alvo com uma arma Kensei, pode gastar 1 ponto de Ki para causar dano adicional igual a um dado de Artes Marciais.",
    castingTime: "Passiva / 1 Ki",
    range: "Toque",
    components: "-",
    duration: "Instantânea"
  },
  "Aspecto da Besta": {
    level: "Habilidade de Subclasse",
    desc: "No 6º nível, você ganha um benefício místico baseado no totem escolhido. Urso: sua capacidade de carga dobra e você tem vantagem em testes de Força para empurrar. Águia: você enxerga perfeitamente a até 1,5 km. Lobo: você pode rastrear criaturas enquanto viaja em ritmo rápido e mover-se furtivamente em ritmo normal.",
    castingTime: "Passiva",
    range: "Pessoal",
    components: "-",
    duration: "Permanente"
  },
  "Caminhante Espiritual": {
    level: "Habilidade de Subclasse",
    desc: "Você pode conjurar a magia 'Comunhão com a Natureza' como um ritual. Ao fazer isso, uma versão espiritual de um dos seus animais totêmicos aparece para transmitir as informações sobre o terreno, recursos ou perigos próximos.",
    castingTime: "Ritual (10 min)",
    range: "Especial",
    components: "V, S",
    duration: "Instantânea"
  },
  "Sintonia Totêmica": {
    level: "Habilidade de Subclasse",
    desc: "No 14º nível, sua conexão com o espírito animal atinge o ápice. Urso: inimigos próximos têm desvantagem em ataques contra outros. Águia: você ganha um deslocamento de voo igual ao seu deslocamento de caminhada enquanto estiver em fúria. Lobo: você pode derrubar uma criatura com uma ação bônus ao atingi-la.",
    castingTime: "Passiva (Fúria)",
    range: "Pessoal",
    components: "-",
    duration: "Enquanto em Fúria"
  },
  "Retaliação": {
    level: "Habilidade de Subclasse",
    desc: "No 14º nível, quando você sofre dano de uma criatura que está a até 1,5 metro de você, você pode usar sua reação para realizar um ataque de arma corpo-a-corpo contra essa criatura. Sua fúria não deixa nenhum golpe sem resposta.",
    castingTime: "Reação",
    range: "1,5m",
    components: "-",
    duration: "Instantânea"
  },
  "Tranquilidade": {
    level: "Habilidade de Subclasse",
    desc: "Você entra em um estado de meditação constante que envolve seu ser em uma aura de paz. Ao final de um descanso longo, você ganha o benefício da magia 'Santuário' que dura até o início do seu próximo descanso longo (a magia pode ser encerrada cedo se você atacar ou conjurar magias).",
    castingTime: "Passiva (Descanso)",
    range: "Pessoal",
    components: "-",
    duration: "Até o próximo descanso"
  },
  "Palma Vibrante": {
    level: "Habilidade de Subclasse",
    desc: "Você aprende a técnica suprema de canalizar vibrações letais. Ao atingir uma criatura com um ataque desarmado, você pode gastar 3 pontos de Ki para iniciar vibrações imperceptíveis. Como uma ação posterior, você pode forçar o alvo a um teste de resistência de Constituição; se falhar, ele cai a 0 PV; se passar, sofre 10d10 de dano necrótico.",
    castingTime: "Ação de Ataque / 1 Ação para Ativar",
    range: "Toque",
    components: "S",
    duration: "Até 1 dia por nível"
  },
  "Invisibilidade das Sombras": {
    level: "Habilidade de Subclasse",
    desc: "Quando você estiver em uma área de penumbra ou escuridão, você pode usar sua ação para ficar invisível. Essa invisibilidade termina se você atacar, conjurar uma magia ou entrar em uma área de luz brilhante. Você se torna um com a própria escuridão.",
    castingTime: "1 Ação",
    range: "Pessoal",
    components: "S",
    duration: "Até ser revelado"
  },
  "Oportunista": {
    level: "Habilidade de Subclasse",
    desc: "No 17º nível, você aprende a explorar cada falha na defesa do inimigo. Sempre que uma criatura a até 1,5 metro de você for atingida por um ataque de outra criatura que não seja você, você pode usar sua reação para realizar um ataque corpo-a-corpo contra aquela criatura.",
    castingTime: "Reação",
    range: "1,5m",
    components: "-",
    duration: "Instantânea"
  },
  "Atleta Notável": {
    level: "Habilidade de Subclasse",
    desc: "Sua excelência física física transborda. Você pode adicionar metade do seu bônus de proficiência (arredondado para cima) em qualquer teste de Força, Destreza ou Constituição que você já não possua proficiência. Além disso, a distância do seu salto em distância aumenta em um número de metros igual ao seu modificador de Força.",
    castingTime: "Passiva",
    range: "Pessoal",
    components: "-",
    duration: "Permanente"
  },
  "Crítico Superior": {
    level: "Habilidade de Subclasse",
    desc: "Sua precisão marcial atinge níveis lendários. Suas jogadas de ataque com arma agora resultam em um acerto crítico com um resultado de 18, 19 ou 20 no dado. Poucas armaduras podem resistir ao seu golpe cirúrgico.",
    castingTime: "Passiva",
    range: "Arma",
    components: "-",
    duration: "Permanente"
  },
  "Sobrevivente": {
    level: "Habilidade de Subclasse",
    desc: "No 18º nível, você atinge o ápice da resiliência física. No início de cada um dos seus turnos, se você tiver menos da metade dos seus pontos de vida, você recupera um número de pontos de vida igual a 5 + seu modificador de Constituição. Se estiver com 0 PV, esta característica não funciona.",
    castingTime: "Passiva",
    range: "Pessoal",
    components: "-",
    duration: "Permanente"
  },
  "Conheça seu Inimigo": {
    level: "Habilidade de Subclasse",
    desc: "Se você passar pelo menos 1 minuto observando ou interagindo com outra criatura fora de combate, você descobre se ela é igual, superior ou inferior a você em dois dos seguintes: Valores de Atributo, Classe de Armadura, PV atuais ou Níveis totais de classe.",
    castingTime: "1 minuto",
    range: "Visual",
    components: "-",
    duration: "Instantânea"
  },
  "Implacável": {
    level: "Habilidade de Subclasse",
    desc: "Sua superioridade tática é inesgotável. Quando você rolar iniciativa e não tiver nenhum dado de superioridade restante, você recupera um dado de superioridade. Isso garante que você nunca entre em um combate sem suas manobras preparadas.",
    castingTime: "Passiva (Iniciativa)",
    range: "Pessoal",
    components: "-",
    duration: "Instantânea"
  },
  "Infiltração Especialista": {
    level: "Habilidade de Subclasse",
    desc: "Você pode criar identidades falsas infalíveis. Com sete dias de trabalho e 25 po, você pode criar uma identidade com documentos, contatos e disfarces. Outras criaturas acreditam que você é essa pessoa, a menos que tenham um motivo óbvio para duvidar de você.",
    castingTime: "7 dias",
    range: "Pessoal",
    components: "-",
    duration: "Até ser abandonada"
  },
  "Usar Item Mágico": {
    level: "Habilidade de Subclasse",
    desc: "Você aprendeu o suficiente sobre o funcionamento da magia para improvisar o uso de itens que não foram feitos para você. Você ignora todas as exigências de classe, raça e nível para sintonizar ou usar qualquer item mágico.",
    castingTime: "Passiva",
    range: "Pessoal",
    components: "-",
    duration: "Permanente"
  },
  "Reflexos de Ladrão": {
    level: "Habilidade de Subclasse",
    desc: "No 17º nível, você se torna tão rápido que pode agir duas vezes antes que os outros percebam. Durante a primeira rodada de qualquer combate, você realiza dois turnos. O primeiro turno ocorre em sua iniciativa normal e o segundo turnos ocorre em sua iniciativa menos 10.",
    castingTime: "Passiva",
    range: "Pessoal",
    components: "-",
    duration: "1 rodada (Início)"
  },
  "Ladrão de Magia": {
    level: "Habilidade de Subclasse",
    desc: "No 17º nível, você ganha a habilidade de roubar o conhecimento de como conjurar uma magia de outro conjurador. Quando uma criatura conjura uma magia que alveja você ou inclui você em sua área, você pode usar sua reação para forçar a criatura a um teste de resistência. Se falhar, você nega o efeito da magia e pode conjurá-la pelas próximas 8 horas.",
    castingTime: "Reação",
    range: "Visto",
    components: "S",
    duration: "8 horas"
  },
  "Táticas Defensivas": {
    level: "Habilidade de Subclasse",
    desc: "No 7º nível, você ganha uma das seguintes características: 'Escapar da Horda' (desvantagem em ataques de oportunidade contra você), 'Defesa Contra Ataques Multiplos' (+4 na CA contra ataques subsequentes da mesma criatura) ou 'Vontade de Aço' (vantagem contra medo).",
    castingTime: "Passiva",
    range: "Pessoal",
    components: "-",
    duration: "Permanente"
  },
  "Compartilhar Magias": {
    level: "Habilidade de Subclasse",
    desc: "No 15º nível, quando você conjura uma magia que alveja você, você pode fazer com que a magia também alveje seu companheiro animal, desde que ele esteja a até 9 metros de você. O vínculo místico entre vocês permite que o fluxo de magia os envolva simultaneamente.",
    castingTime: "Passiva (Conjuração)",
    range: "9m",
    components: "-",
    duration: "Duração da Magia"
  },
  "Guerreiro Planar": {
    level: "Habilidade de Subclasse",
    desc: "Você aprende a extrair energia dos planos para ferir seus inimigos. Como uma ação bônus, escolha uma criatura a até 9 metros. O próximo ataque que você atingir nessa criatura neste turno causa 1d8 de dano de força extra e todo o dano do ataque torna-se dano de força.",
    castingTime: "1 Ação Bônus",
    range: "9m",
    components: "S",
    duration: "1 turno"
  },
  "Defesa Espectral": {
    level: "Habilidade de Subclasse",
    desc: "No 15º nível, sua habilidade de transitar entre os planos permite que você suavize golpes físicos. Quando você sofre dano, você pode usar sua reação para ganhar resistência a todos os tipos de dano daquele ataque, tornando-se momentaneamente incorpóreo.",
    castingTime: "Reação",
    range: "Pessoal",
    components: "-",
    duration: "Instantânea"
  },
  "Nêmesis do Conjurador": {
    level: "Habilidade de Subclasse",
    desc: "No 11º nível, você ganha a habilidade de frustrar a magia alheia através de pura força de vontade. Quando você vê uma criatura a até 18 metros conjurando uma magia ou se teletransportando, você pode usar sua reação para forçá-la a um teste de Sabedoria. Se falhar, a magia ou teletransporte falha e é desperdiçado.",
    castingTime: "Reação",
    range: "18m",
    components: "V",
    duration: "Instantânea"
  },
  "Aura de Alacridade": {
    level: "Habilidade de Subclasse",
    desc: "Sua presença inspira velocidade sobrenatural. Você e seus aliados a até 3 metros de você ganham um bônus de 3 metros no deslocamento de caminhada. No 18º nível, o raio desta aura aumenta para 9 metros.",
    castingTime: "Passiva",
    range: "3m (Aura)",
    components: "-",
    duration: "Permanente"
  },
  "Baluarte Mortal": {
    level: "Habilidade de Subclasse",
    desc: "Você torna-se a personificação da vigilância inabalável. Por 1 minuto, você ganha 'Visão Verdadeira' (18m), tem vantagem em ataques contra criaturas que ainda não agiram no combate e, quando atinge uma criatura com Destruição Divina, pode forçá-la a ficar Atordoada.",
    castingTime: "1 Ação",
    range: "Pessoal/Aura",
    components: "V, S",
    duration: "1 minuto"
  },
  "Espírito Protetor": {
    level: "Habilidade de Subclasse",
    desc: "No 15º nível, uma aura de cura passiva emana de você durante o combate. No início de cada um dos seus turnos, você recupera pontos de vida iguais a 1d6 + metade do seu nível de paladino se estiver com menos da metade da vida e não estiver incapacitado.",
    castingTime: "Passiva",
    range: "Pessoal",
    components: "-",
    duration: "Permanente"
  },
  "Forma de Combate": {
    level: "Habilidade de Subclasse",
    desc: "Você ganha a habilidade de usar sua Forma Selvagem como uma ação bônus, em vez de uma ação. Além disso, enquanto estiver transformado, você pode gastar um espaço de magia como uma ação bônus para recuperar 1d8 pontos de vida por nível do espaço gasto.",
    castingTime: "1 Ação Bônus",
    range: "Pessoal",
    components: "V, S",
    duration: "Instantânea"
  },
  "Golpes Primordiais": {
    level: "Habilidade de Subclasse",
    desc: "Suas garras e presas em forma selvagem tornam-se imbuídas com a energia mágica da natureza. No 6º nível, seus ataques em forma de besta contam como mágicos para o propósito de superar resistência e imunidade a ataques não-mágicos.",
    castingTime: "Passiva",
    range: "Pessoal",
    components: "-",
    duration: "Permanente"
  },
  "Halo de Esporos": {
    level: "Habilidade de Subclasse",
    desc: "Você é cercado por esporos invisíveis e letais que ganham vida quando você é ameaçado. Quando uma criatura que você possa ver se move para um espaço a até 3 metros de você ou começa seu turno lá, você pode usar sua reação para causar seu dano de Halo de Esporos (1d4, escala com nível) como dano necrótico.",
    castingTime: "Reação",
    range: "3m",
    components: "S",
    duration: "Instantânea"
  },
  "Entidade Simbiótica": {
    level: "Habilidade de Subclasse",
    desc: "Você desperta os esporos em seu corpo para ganhar uma vitalidade fúngica. Como uma ação bônus, você gasta um uso de Forma Selvagem para ganhar 4 PV temporários por nível de druida. Enquanto os tiver, seu dano de Halo de Esporos dobra e seus ataques causam 1d6 de dano necrótico extra.",
    castingTime: "1 Ação Bônus",
    range: "Pessoal",
    components: "S",
    duration: "10 min ou até perder PV temporários"
  },
  "Bênçãos do Conhecimento": {
    level: "Habilidade de Subclasse",
    desc: "Seu deus lhe concede sabedoria imediata em áreas de estudo profundo. Você aprende dois idiomas à sua escolha e ganha proficiência em duas perícias entre Arcanismo, História, Natureza ou Religião. Seu bônus de proficiência é dobrado para qualquer teste de atributo que use essas perícias.",
    castingTime: "Passiva",
    range: "Pessoal",
    components: "-",
    duration: "Permanente"
  },
  "Truque de Luz": {
    level: "Habilidade de Subclasse",
    desc: "Você ganha o truque 'Luz' se ainda não o conhecia. Este truque não conta contra o número de truques que você pode conhecer. Além disso, você pode conjurá-lo com alcance aumentado ou através de sua duplicata sagrada.",
    castingTime: "Passiva / Truque",
    range: "Pessoal",
    components: "-",
    duration: "Permanente"
  },
  "Ira da Tempestade": {
    level: "Habilidade de Subclasse",
    desc: "Você pode repreender os agressores com o trovão e o relâmpago dos céus. Quando uma criatura a até 1,5 metro que você possa ver te atingir com um ataque, você pode usar sua reação para causar 2d8 de dano elétrico ou trovejante (teste de Destreza para metade).",
    castingTime: "Reação",
    range: "1,5m",
    components: "V, S",
    duration: "Instantânea"
  },
  "Bênção do Trapaceiro": {
    level: "Habilidade de Subclasse",
    desc: "Você pode tocar uma criatura voluntária para conceder-lhe a astúcia de um ladino. Por 1 hora ou até que você use esta característica novamente, o alvo tem vantagem em testes de Destreza (Furtividade). Você não pode conceder esse benefício a si mesmo.",
    castingTime: "1 Ação",
    range: "Toque",
    components: "S",
    duration: "1 hora"
  },
  "Voz da Autoridade": {
    level: "Habilidade de Subclasse",
    desc: "Sua palavra no campo de batalha é lei absoluta. Se você conjurar uma magia de nível 1 ou superior que restaura PV a um aliado, esse aliado pode usar sua reação para realizar um ataque de arma contra uma criatura ao alcance dele imediatamente.",
    castingTime: "Passiva (Conjuração)",
    range: "Visto",
    components: "V",
    duration: "Instantânea"
  },
  "Bênção da Forja": {
    level: "Habilidade de Subclasse",
    desc: "Ao final de um descanso longo, você toca um item não mágico — uma arma ou armadura — e o imbuy com o poder da forja divina. O item torna-se uma arma mágica com +1 no ataque/dano ou uma armadura mágica com +1 na CA até o próximo descanso longo.",
    castingTime: "1 Ação (Descanso)",
    range: "Toque",
    components: "S, M (Ferramentas de Ferreiro)",
    duration: "Até o próximo descanso longo"
  },
  "Olhos da Noite (Clérigo)": {
    level: "Habilidade de Subclasse",
    desc: "Você pode ver na escuridão absoluta como se fosse dia. Você ganha visão no escuro com alcance infinito (ou 90m dependendo da regra da mesa). Além disso, você pode usar uma ação para compartilhar essa visão com aliados a até 3 metros por 1 hora.",
    castingTime: "Passiva / 1 Ação para Compartilhar",
    range: "Especial",
    components: "-",
    duration: "Permanente"
  },
  "Afinidade Elemental (Feiticeiro)": {
    level: "Habilidade de Subclasse",
    desc: "No 6º nível, quando você conjura uma magia que causa o tipo de dano associado à sua ancestralidade dracônica, você adiciona seu modificador de Carisma ao dano. Além disso, você pode gastar 1 ponto de feitiçaria para ganhar resistência a esse tipo de dano por 1 hora.",
    castingTime: "Passiva / 1 Ponto de Feitiçaria",
    range: "Pessoal",
    components: "-",
    duration: "Especial"
  },
  "Fala Telepática": {
    level: "Habilidade de Subclasse",
    desc: "Sua mente é um conduto para o psiquismo alienígena. Como uma ação bônus, escolha uma criatura que você possa ver a até 9 metros. Você e a criatura podem se comunicar telepaticamente enquanto estiverem em um raio de milhas igual ao seu modificador de Carisma.",
    castingTime: "1 Ação Bônus",
    range: "Especial",
    components: "-",
    duration: "Duração baseada no nível"
  },
  "Restaurar o Equilíbrio": {
    level: "Habilidade de Subclasse",
    desc: "A ordem flui através de você para estabilizar o caos. Quando uma criatura que você vê a até 18 metros está prestes a realizar uma rolagem com vantagem ou desvantagem, você pode usar sua reação para cancelar esse efeito, forçando uma rolagem normal.",
    castingTime: "Reação",
    range: "18m",
    components: "-",
    duration: "Instantânea"
  },
  "Mapa Estelar": {
    level: "Habilidade de Subclasse",
    desc: "Você possui um mapa estelar celestial que serve como seu foco místico. Enquanto o segura, você conhece o truque 'Orientação', pode conjurar 'Dardo Guia' sem gastar espaço de magia um número de vezes igual ao seu bônus de proficiência.",
    castingTime: "Passiva",
    range: "Pessoal",
    components: "M (Mapa Estelar)",
    duration: "Permanente"
  },
  "Protetores Ancestrais": {
    level: "Habilidade de Subclasse",
    desc: "Guerreiros espectrais surgem para proteger seus aliados quando você entra em fúria. A primeira criatura que você atingir em cada um dos seus turnos tem desvantagem em ataques contra qualquer um que não seja você, e seus aliados têm resistência contra dano causado por essa criatura.",
    castingTime: "Passiva (Fúria)",
    range: "Pessoal",
    components: "-",
    duration: "Enquanto em Fúria"
  },
  "Escudo Espiritual": {
    level: "Habilidade de Subclasse",
    desc: "Seus ancestrais podem absorver impactos físicos por seus companheiros. Quando uma criatura que você vê a até 9 metros sofre dano, você pode usar sua reação para reduzir esse dano em 2d6 (aumenta com o nível).",
    castingTime: "Reação",
    range: "9m",
    components: "-",
    duration: "Instantânea"
  },
  "Aura de Tempestade": {
    level: "Habilidade de Subclasse",
    desc: "Você emana uma aura de energia elemental enquanto está em fúria. A aura estende-se por 3 metros de você. Dependendo do ambiente escolhido (Deserto, Mar ou Tundra), você pode causar dano de fogo, raio ou conceder pontos de vida temporários aos aliados.",
    castingTime: "Passiva (Fúria)",
    range: "3m (Aura)",
    components: "-",
    duration: "Enquanto em Fúria"
  },
  "Forma da Besta": {
    level: "Habilidade de Subclasse",
    desc: "Quando você entra em fúria, você manifesta traços animais. Escolha entre: Mordida (recupera PV), Garras (ataque extra como ação bônus) ou Cauda (reação para aumentar sua CA). Seu corpo torna-se uma arma da selva.",
    castingTime: "Passiva (Fúria)",
    range: "Pessoal",
    components: "-",
    duration: "Enquanto em Fúria"
  },
  "Braços do Eu Astral": {
    level: "Habilidade de Subclasse",
    desc: "Você manifesta braços espectrais feitos de pura energia Ki. Como uma ação bônus, você gasta 1 ponto de Ki para invocá-los. Você pode usar seu modificador de Sabedoria em vez de Força para testes de Força e ataques desarmados, e seu alcance aumenta em 1,5 metro.",
    castingTime: "1 Ação Bônus",
    range: "Pessoal",
    components: "S",
    duration: "10 minutos"
  },
  "Espírito de Luta": {
    level: "Habilidade de Subclasse",
    desc: "Você canaliza sua determinação para garantir a vitória. Como uma ação bônus, você ganha vantagem em todas as jogadas de ataque com arma até o final do seu turno atual e ganha 5 PV temporários (escala com nível).",
    castingTime: "1 Ação Bônus",
    range: "Pessoal",
    components: "-",
    duration: "1 turno"
  },
  "Audácia Panache": {
    level: "Habilidade de Subclasse",
    desc: "Sua confiança é sua maior arma. Você ganha um bônus em sua iniciativa igual ao seu modificador de Carisma. Além disso, você não precisa de vantagem para usar seu Ataque Furtivo contra uma criatura se estiver a até 1,5 metro dela e nenhuma outra criatura estiver a até 1,5 metro de você.",
    castingTime: "Passiva",
    range: "Pessoal",
    components: "-",
    duration: "Permanente"
  },
  "Lamentos do Túmulo": {
    level: "Habilidade de Subclasse",
    desc: "Ao atingir uma criatura com Ataque Furtivo, você pode canalizar um eco de mortalidade. Outra criatura que você veja a até 9 metros sofre metade do número de dados de Ataque Furtivo como dano necrótico, conforme os espíritos a assombram momentaneamente.",
    castingTime: "Passiva (Ataque Furtivo)",
    range: "9m",
    components: "-",
    duration: "Instantânea"
  },
  "Escaramuça": {
    level: "Habilidade de Subclasse",
    desc: "Você é um mestre em se reposicionar. Você pode se mover até metade do seu deslocamento como uma reação quando um inimigo termina o turno dele a até 1,5 metro de você. Esse movimento não provoca ataques de oportunidade.",
    castingTime: "Reação",
    range: "Pessoal",
    components: "-",
    duration: "Instantânea"
  },
  "Sentido Planar": {
    level: "Habilidade de Subclasse",
    desc: "Como uma ação, você detecta a presença de portais planares a até 1,5 km. Você sabe a distância e direção do portal mais próximo, permitindo que você navegue entre as dimensões com facilidade.",
    castingTime: "1 Ação",
    range: "1,5 km",
    components: "-",
    duration: "Instantânea"
  },
  "Enxame Reunido": {
    level: "Habilidade de Subclasse",
    desc: "Um enxame de espíritos naturais (fadas, insetos ou pássaros) circunda você. Uma vez por turno, ao atingir um ataque, você causa 1d6 de dano extra, move-se 4,5 metros ou empurra o alvo 4,5 metros. O enxame é sua força constante.",
    castingTime: "Passiva",
    range: "Pessoal",
    components: "-",
    duration: "Permanente"
  },
  "Dádiva Dracônica": {
    level: "Habilidade de Subclasse",
    desc: "Você ganha uma conexão mística com o poder dos dragões. Você aprende o idioma Dracônico e conhece o truque 'Taumaturgia'. Sua voz ganha o peso de um ancião dracônico.",
    castingTime: "Passiva",
    range: "Pessoal",
    components: "-",
    duration: "Permanente"
  },
  "Companheiro Dracônico": {
    level: "Habilidade de Subclasse",
    desc: "Você manifesta um filhote de dragão vinculado à sua alma. Como uma ação, você gasta um espaço de magia para invocá-lo. Você escolhe a essência elemental dele (Fogo, Gelo, Ácido, Raio ou Veneno). Ele age no seu turno e pode usar seu Sopro Dracônico.",
    castingTime: "1 Ação",
    range: "Pessoal/18m",
    components: "V, S",
    duration: "Até ser dissipado"
  },
};

export const COMMON_WEAPONS: { n: string, dmg: string, prop: string, desc: string }[] = [
  { n: "Adaga", dmg: "1d4 perfurante", prop: "Acuidade, Leve, Arr (6/18)", desc: "Uma pequena lâmina versátil, fácil de ocultar e perfeita para ataques rápidos ou arremessos precisos em pontos vitais." },
  { n: "Azagaia", dmg: "1d6 perfurante", prop: "Arr (9/36)", desc: "Uma lança curta e equilibrada projetada especificamente para ser arremessada a longas distâncias com força e precisão." },
  { n: "Clava", dmg: "1d4 concussão", prop: "Leve", desc: "Um bastão de madeira pesada ou osso reforçado, rústico mas eficaz para esmagar guardas e crânios." },
  { n: "Foice Curta", dmg: "1d4 cortante", prop: "Leve", desc: "Uma ferramenta agrícola adaptada para o combate, com uma lâmina curva interna extremamente afiada." },
  { n: "Lança", dmg: "1d6 perfurante", prop: "Arr (6/18), Versátil (1d8)", desc: "A arma padrão de quase todas as milícias; versátil o suficiente para combater à distância ou segurar linhas de defesa." },
  { n: "Machadinha", dmg: "1d6 cortante", prop: "Leve, Arr (6/18)", desc: "Um machado de mão equilibrado perfeitamente para o combate corpo a corpo ou para ser lançado como um projétil circular." },
  { n: "Martelo Leve", dmg: "1d4 concussão", prop: "Leve, Arr (6/18)", desc: "Um martelo de ferreiro reforçado, útil tanto para manutenção de equipamentos quanto para quebrar a guarda inimiga." },
  { n: "Cajado", dmg: "1d6 concussão", prop: "Versátil (1d8)", desc: "Um bastão longo de madeira tratada, favorito de magos e monges como foco místico e ferramenta de autodefesa." },
  { n: "Alabarda", dmg: "1d10 cortante", prop: "Pesada, Alcance, 2 Mãos", desc: "Uma arma de haste massiva com uma lâmina de machado e uma ponta de lança, capaz de manter qualquer inimigo à distância." },
  { n: "Cimitarra", dmg: "1d6 cortante", prop: "Acuidade, Leve", desc: "Uma lâmina curva e elegante de origem oriental, projetada para cortes fluidos e ataques ágeis em sucessão." },
  { n: "Chicote", dmg: "1d4 cortante", prop: "Acuidade, Alcance", desc: "Uma tira longa de couro trançado que pode desferir estalos dolorosos e atingir alvos fora do alcance corporal comum." },
  { n: "Espada Curta", dmg: "1d6 perfurante", prop: "Acuidade, Leve", desc: "Uma lâmina reta e ágil, a arma secundária clássica para quem preza por velocidade e eficiência no combate próximo." },
  { n: "Sabre Curto", dmg: "1d6 perfurante", prop: "Acuidade, Leve", desc: "Equivalente marcial da espada curta, focado em estocadas rápidas e manobras defensivas sofisticadas." },
  { n: "Espada Grande", dmg: "2d6 cortante", prop: "Pesada, 2 Mãos", desc: "Uma montante massiva que exige ambas as mãos para ser manejada, capaz de atravessar armaduras e ossos com um único golpe." },
  { n: "Espadão", dmg: "2d6 cortante", prop: "Pesada, 2 Mãos", desc: "Uma variante da espada grande com foco em peso e equilíbrio, permitindo cortes circulares devastadores." },
  { n: "Espada Longa", dmg: "1d8 cortante", prop: "Versátil (1d10)", desc: "A rainha do campo de batalha; balanceada perfeitamente para o uso com uma mão e escudo ou com as duas mãos para maior poder." },
  { n: "Glaive", dmg: "1d10 cortante", prop: "Pesada, Alcance, 2 Mãos", desc: "Uma arma de haste com uma lâmina de gume único, permitindo golpes amplos e poderosos contra múltiplos oponentes." },
  { n: "Machado de Batalha", dmg: "1d8 cortante", prop: "Versátil (1d10)", desc: "Um machado de guerra pesado com um gume largo, projetado para rachar escudos metálicos e couros grossos." },
  { n: "Machado Grande", dmg: "1d12 cortante", prop: "Pesada, 2 Mãos", desc: "Uma massa colossal de aço que canaliza a força bruta em um único ponto de impacto, encerrando lutas rapidamente." },
  { n: "Maça Estrela", dmg: "1d8 perfurante", prop: "-", desc: "Uma esfera metálica com cravos afiados em um cabo curto, projetada para esmagar e perfurar armaduras de placas." },
  { n: "Martelo de Guerra", dmg: "1d8 concussão", prop: "Versátil (1d10)", desc: "Um símbolo de autoridade e poder; o martelo de guerra esmaga ossos e amassa metal com uma eficiência aterrorizante." },
  { n: "Marreta", dmg: "2d6 concussão", prop: "Pesada, 2 Mãos", desc: "Uma marreta de combate massiva; nada resiste ao seu impacto frontal, derrubando até os mais pesados guerreiros." },
  { n: "Rapieira", dmg: "1d8 perfurante", prop: "Acuidade", desc: "A arma do duelista mestre; fina e letal, seus ataques são focados em precisão cirúrgica em vez de força bruta." },
  { n: "Arco Curto", dmg: "1d6 perfurante", prop: "Mun (24/96), 2 Mãos", desc: "Um arco flexível e leve, ideal para ser usado por caçadores e batedores que precisam de mobilidade constante." },
  { n: "Arco Longo", dmg: "1d8 perfurante", prop: "Mun (45/180), Pesada, 2 Mãos", desc: "Construído em teixo nobre, este arco exige grande força para ser retesado, mas possui um alcance mortal." },
  { n: "Besta Leve", dmg: "1d8 perfurante", prop: "Mun (24/96), Recarga, 2 Mãos", desc: "Um gatilho mecânico que lança virotes com força consistente, fácil de aprender e mortal a curtas distâncias." },
  { n: "Besta Pesada", dmg: "1d10 perfurante", prop: "Mun (30/120), Recarga, Pesada", desc: "Um guincho de metal reforçado; lenta para recarregar, mas seu disparo atravessa os escudos mais grossos." },
  { n: "Besta de Mão", dmg: "1d6 perfurante", prop: "Mun (9/36), Leve, Recarga", desc: "A arma oculta favorita de assassinos e espiões; pequena o suficiente para ser disparada discretamente." },
  { n: "Malho", dmg: "2d6 concussão", prop: "Pesada, 2 Mãos", desc: "Um grande martelo de duas mãos que esmaga qualquer obstáculo ou oponente com facilidade." },
  { n: "Mangual", dmg: "1d8 concussão", prop: "-", desc: "Uma bola de ferro com cravos presa por uma corrente, perfeita para contornar escudos inimigos." },
  { n: "Picareta de Guerra", dmg: "1d8 perfurante", prop: "-", desc: "Similar a uma picareta mineradora, mas reforçada para furar armaduras de metal sólido." },
  { n: "Tridente", dmg: "1d6 perfurante", prop: "Arr (6/18), Versátil (1d8)", desc: "Uma arma de haste com três pontas, comum entre guardas costeiros e gladiadores." }
];

export const ARMOR_DB: Record<string, { n: string, ac: number, type: 'light' | 'medium' | 'heavy' | 'shield', stealthDis?: boolean, cost: number, weight: string, desc: string }> = {
  'Couro': { n: 'Couro', ac: 11, type: 'light', cost: 10, weight: '5kg', desc: "Feita de couro fervido em óleo para endurecer, oferece proteção básica sem sacrificar a mobilidade." },
  'Couro Batido': { n: 'Couro Batido', ac: 12, type: 'light', cost: 45, weight: '6.5kg', desc: "Reforçada com rebites de metal ou camadas extras, é o equilíbrio ideal para aventureiros ágeis." },
  'Camisão de Malha': { n: 'Camisão de Malha', ac: 13, type: 'medium', cost: 50, weight: '10kg', desc: "Uma túnica de anéis de metal entrelaçados, protegendo o tronco contra cortes e estocadas." },
  'Peitoral': { n: 'Peitoral', ac: 14, type: 'medium', cost: 400, weight: '10kg', desc: "Uma placa de aço polido que cobre o peito e as costas, permitindo livre movimento dos braços." },
  'Meia-Armadura': { n: 'Meia-Armadura', ac: 15, type: 'medium', stealthDis: true, cost: 750, weight: '20kg', desc: "Uma combinação de placas de metal e malha, oferecendo excelente proteção para veteranos." },
  'Cota de Malha': { n: 'Cota de Malha', ac: 16, type: 'heavy', stealthDis: true, cost: 75, weight: '27.5kg', desc: "Uma armadura pesada completa composta por anéis de metal, exigindo grande força para ser usada." },
  'Cota de Talas': { n: 'Cota de Talas', ac: 17, type: 'heavy', stealthDis: true, cost: 200, weight: '30kg', desc: "Feita de tiras verticais de metal rebitadas a um suporte de couro, comum entre a infantaria pesada." },
  'Placas': { n: 'Placas', ac: 18, type: 'heavy', stealthDis: true, cost: 1500, weight: '32.5kg', desc: "A proteção máxima do cavaleiro; placas de aço moldadas que cobrem todo o corpo, tornando o usuário quase invulnerável." },
  'Escudo': { n: 'Escudo', ac: 2, type: 'shield', cost: 10, weight: '3kg', desc: "Uma barreira de madeira reforçada com metal, essencial para desviar golpes fatais e flechas." }
};

export const DEFAULT_MONSTERS: Monster[] = [
    // --- 000-099: Low Challenge / Common ---
    // --- 000-199: Baixo Desafio / Comuns ---
    { id: 100, name: "Aranha de Teto Venenosa", type: "Fera", cr: "0", ac: 12, hp: 4, speed: "6m", actions: [{n: "Mordida Inoculadora", hit: 4, dmg: "1 perfurante + 1d4 veneno (CD 10 Con)"}], traits: [{n: "Sentido Sísmico", d: "Detecta vibrações em teias próximas."}], imageUrl: "/textures/creatures/aranha_menor.PNG" , attributes: { str: 2, dex: 14, con: 10, int: 1, wis: 10, cha: 2 } },
    { id: 101, name: "Plebeu Assustado", type: "Humanóide", cr: "0", ac: 10, hp: 4, speed: "9m", actions: [{n: "Clava de Madeira Improvisada", hit: 2, dmg: "1d4 concussão"}], imageUrl: "/textures/creatures/plebeu.PNG" , attributes: { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 } },
    { id: 102, name: "Rato Gigante Atroz", type: "Fera", cr: "1/8", ac: 12, hp: 7, speed: "9m", actions: [{n: "Mordida Infestada", hit: 4, dmg: "1d4+2 perfurante"}], traits: [{n: "Sentidos Aguçados", d: "Vantagem em Percepção pelo olfato."}], imageUrl: "/textures/creatures/rato.PNG" , attributes: { str: 7, dex: 15, con: 11, int: 2, wis: 10, cha: 4 } },
    { id: 103, name: "Bandido de Estrada Desesperado", type: "Humanóide", cr: "1/8", ac: 12, hp: 11, speed: "9m", actions: [{n: "Cimitarra Rompida", hit: 3, dmg: "1d6+1 cortante" }, {n: "Besta Leve Enferrujada", hit: 3, dmg: "1d8+1 perfurante"}], imageUrl: "/textures/creatures/bandido.PNG" , attributes: { str: 11, dex: 12, con: 12, int: 10, wis: 10, cha: 10 } },
    { id: 104, name: "Kobold Escavador de Elite", type: "Humanóide", cr: "1/8", ac: 12, hp: 5, speed: "9m", actions: [{n: "Picareta de Pedra", hit: 4, dmg: "1d4+2 perfurante" }, {n: "Funda de Couro de Grifo", hit: 4, dmg: "1d4+2 concussão"}], traits: [{n: "Táticas de Matilha", d: "Vantagem se aliado estiver a 1,5m do alvo."}, {n: "Sensibilidade à Luz", d: "Desvantagem sob luz solar direta."}], imageUrl: "/textures/creatures/kobold.PNG" , attributes: { str: 7, dex: 15, con: 9, int: 8, wis: 7, cha: 8 } },
    { id: 105, name: "Goblin Saqueador da Floresta", type: "Humanóide", cr: "1/4", ac: 15, hp: 7, speed: "9m", actions: [{n: "Cimitarra Curta de Sucata", hit: 4, dmg: "1d6+2 cortante" }, {n: "Arco Curto de Samambaia", hit: 4, dmg: "1d6+2 perfurante"}], traits: [{n: "Ação Célere", d: "Desengajar ou Esconder como ação bônus."}], imageUrl: "/textures/creatures/goblin.PNG" , attributes: { str: 8, dex: 14, con: 10, int: 10, wis: 8, cha: 8 } },
    { id: 106, name: "Esqueleto Reanimado por Ódio", type: "Morto-vivo", cr: "1/4", ac: 13, hp: 13, speed: "9m", actions: [{n: "Espada Curta Lascada", hit: 4, dmg: "1d6+2 perfurante" }, {n: "Arco Curto de Costelas", hit: 4, dmg: "1d6+2 perfurante"}], traits: [{n: "Ossos Quebradiços", d: "Vulnerabilidade a dano de concussão."}], imageUrl: "/textures/creatures/esqueleto.PNG" , attributes: { str: 10, dex: 14, con: 15, int: 6, wis: 8, cha: 5 } },
    { id: 107, name: "Zumbi Putrefato e Faminto", type: "Morto-vivo", cr: "1/4", ac: 8, hp: 22, speed: "6m", actions: [{n: "Pancada com Membro Decomposto", hit: 3, dmg: "1d6+1 concussão"}], traits: [{n: "Fortitude Cadavérica", d: "Chance de não morrer ao cair a 0 PV."}], imageUrl: "/textures/creatures/zumbi.PNG" , attributes: { str: 13, dex: 6, con: 16, int: 3, wis: 6, cha: 5 } },
    { id: 108, name: "Lobo de Caça Cinzento", type: "Fera", cr: "1/4", ac: 13, hp: 11, speed: "12m", actions: [{n: "Mordida Lacerante", hit: 4, dmg: "2d4+2 perfurante (CD 11 For ou Caído)"}], traits: [{n: "Táticas de Matilha", d: "Vantagem se um aliado estiver próximo."}], imageUrl: "/textures/creatures/lobo.PNG" , attributes: { str: 12, dex: 15, con: 12, int: 3, wis: 12, cha: 6 } },
    { id: 109, name: "Orc Saqueador das Planícies", type: "Humanóide", cr: "1/2", ac: 13, hp: 15, speed: "9m", actions: [{n: "Machado Grande de Ferro Negro", hit: 5, dmg: "1d12+3 cortante" }, {n: "Azagaia de Arremesso Pesada", hit: 5, dmg: "1d6+3 perfurante"}], traits: [{n: "Fúria Orc", d: "Mover-se até o inimigo como ação bônus."}], imageUrl: "/textures/creatures/orc.PNG" , attributes: { str: 16, dex: 12, con: 16, int: 7, wis: 11, cha: 10 } },
    { id: 110, name: "Gnoll Carniceiro de Matilha", type: "Humanóide", cr: "1/2", ac: 15, hp: 22, speed: "9m", actions: [{n: "Mordida de Hiena Sangrenta", hit: 4, dmg: "1d4+2 perfurante" }, {n: "Lança de Osso de Mamute", hit: 4, dmg: "1d8+2 perfurante"}], traits: [{n: "Frenesi do Abate", d: "Ação bônus de movimento e ataque ao matar alvo."}], imageUrl: "/textures/creatures/gnoll.PNG" , attributes: { str: 14, dex: 12, con: 11, int: 6, wis: 10, cha: 7 } },
    { id: 111, name: "Harpia Sedutora das Penhas", type: "Monstruosidade", cr: "1", ac: 11, hp: 38, speed: "6m/12m voo", actions: [{n: "Garras Lacerantes de Rapina", hit: 3, dmg: "2d4+1 cortante"}, {n: "Canto Melódico de Lure", hit: 0, dmg: "CD 11 Sab ou ficar Enfeitiçado"}], imageUrl: "/textures/creatures/harpia.PNG" , attributes: { str: 12, dex: 13, con: 12, int: 7, wis: 10, cha: 13 } },
    { id: 204, name: "Diabrete Trapaceiro", type: "Infernal", cr: "1", ac: 13, hp: 10, speed: "6m/12m voo", actions: [{n: "Ferrão Venenoso", hit: 5, dmg: "1d4+3 perfurante + 3d6 veneno" }], traits: [{n: "Invisibilidade", d: "Pode ficar invisível como ação."}], imageUrl: "/textures/creatures/diabrete.PNG" , attributes: { str: 6, dex: 17, con: 13, int: 11, wis: 12, cha: 14 } },
    { id: 205, name: "Ogro Esmagador", type: "Gigante", cr: "2", ac: 11, hp: 59, speed: "12m", actions: [{n: "Clava de Tronco", hit: 6, dmg: "2d8+4 concussão" }, {n: "Azagaia Pesada", hit: 6, dmg: "2d6+4 perfurante"}], imageUrl: "/textures/creatures/ogro.PNG" , attributes: { str: 19, dex: 8, con: 16, int: 5, wis: 7, cha: 7 } },
    { id: 206, name: "Mímico Faminto", type: "Monstruosidade", cr: "2", ac: 12, hp: 58, speed: "4.5m", actions: [{n: "Pseudópode Pegajoso", hit: 5, dmg: "1d8+3 concussão + Agarrado" }, {n: "Mordida Ácida", hit: 5, dmg: "1d8+3 perfurante + 1d8 ácido"}], traits: [{n: "Forma Falsa", d: "Indistinguível de objeto comum enquanto imóvel."}], imageUrl: "/textures/creatures/mimic.PNG" , attributes: { str: 17, dex: 12, con: 15, int: 5, wis: 13, cha: 8 } },
    { id: 207, name: "Grifo de Montanha", type: "Monstruosidade", cr: "2", ac: 12, hp: 59, speed: "9m/24m voo", actions: [{n: "Bico Afiado", hit: 6, dmg: "1d8+4 perfurante"}, {n: "Garras de Rapina", hit: 6, dmg: "2d6+4 cortante"}], imageUrl: "/textures/creatures/grifo.PNG" , attributes: { str: 18, dex: 15, con: 16, int: 2, wis: 13, cha: 8 } },
    { id: 208, name: "Capitão Bandido", type: "Humanóide", cr: "2", ac: 15, hp: 65, speed: "9m", actions: [{n: "Cimitarra Afiada", hit: 5, dmg: "1d6+3 cortante" }, {n: "Adaga Oculta", hit: 5, dmg: "1d4+3 perfurante"}], imageUrl: "/textures/creatures/capitão_dos_bandidos.PNG" , attributes: { str: 15, dex: 16, con: 14, int: 14, wis: 11, cha: 14 } },
    { id: 209, name: "Escrivão Arcano", type: "Humanóide", cr: "2", ac: 12, hp: 45, speed: "9m", actions: [{n: "Bordão de Faia", hit: 2, dmg: "1d6 concussão"}], spells: ["Mísseis Mágicos (3x1d4+1 força)", "Onda Trovejante (2d8 trovejante)", "Teia (CD 13)", "Escudo (+5 CA)"], imageUrl: "/textures/creatures/guarda_mago.PNG" , attributes: { str: 10, dex: 14, con: 12, int: 16, wis: 12, cha: 10 } },
    { id: 210, name: "Gárgula Grotesca", type: "Elemental", cr: "2", ac: 15, hp: 52, speed: "9m/18m voo", actions: [{n: "Mordida de Pedra", hit: 4, dmg: "1d6+2 perfurante"}, {n: "Garras de Rocha", hit: 4, dmg: "1d6+2 cortante"}], traits: [{n: "Aparência de Estátua", d: "Imóvel, parece uma estátua comum."}], imageUrl: "/textures/creatures/gargula.PNG" , attributes: { str: 15, dex: 11, con: 16, int: 6, wis: 11, cha: 7 } },
    { id: 211, name: "Gosma Ácida Voraz", type: "Limo", cr: "2", ac: 8, hp: 45, speed: "3m", actions: [{n: "Pseudópode Pegajoso", hit: 1, dmg: "1d6+1 concussão + 2d6 ácido"}], traits: [{n: "Corrosivo", d: "Dano de ácido ao toque."}], imageUrl: "/textures/creatures/slime.PNG" , attributes: { str: 12, dex: 6, con: 16, int: 1, wis: 6, cha: 1 } },

    // --- 300-399: Mid Challenge ---
    { id: 300, name: "Urso-Coruja Feroz", type: "Monstruosidade", cr: "3", ac: 13, hp: 59, speed: "12m", actions: [{n: "Bico Afiado e Adunco", hit: 7, dmg: "1d10+5 perfurante"}, {n: "Garras Lacerantes de Urso", hit: 7, dmg: "2d8+5 cortante"}], imageUrl: "/textures/creatures/urso_coruja.PNG" , attributes: { str: 20, dex: 12, con: 17, int: 3, wis: 12, cha: 7 } },
    { id: 301, name: "Lobisomem Maldito", type: "Humanóide", cr: "3", ac: 12, hp: 58, speed: "12m", actions: [{n: "Mordida de Maldição Bélica", hit: 4, dmg: "1d8+2 perfurante + CD 12 Con (Licantropia)"}, {n: "Garras de Fera Sangrenta", hit: 4, dmg: "2d4+2 cortante"}], imageUrl: "/textures/creatures/lobisomen.PNG" , attributes: { str: 15, dex: 13, con: 14, int: 10, wis: 11, cha: 10 } },
    { id: 302, name: "Basilisco das Profundezas", type: "Monstruosidade", cr: "3", ac: 15, hp: 52, speed: "6m", actions: [{n: "Mordida de Mandíbula de Aço", hit: 5, dmg: "2d6+3 perfurante + 2d6 veneno"}], traits: [{n: "Olhar de Pedra", d: "CD 12 Con ou Petrificado."}], imageUrl: "/textures/creatures/basilisco.PNG" , attributes: { str: 16, dex: 8, con: 15, int: 2, wis: 8, cha: 7 } },
    { id: 303, name: "Mantícora Espinhosa", type: "Monstruosidade", cr: "3", ac: 14, hp: 68, speed: "9m/15m voo", actions: [{n: "Mordida de Leão", hit: 5, dmg: "1d8+3 perfurante"}, {n: "Garras Lacerantes", hit: 5, dmg: "2d6+3 cortante"}, {n: "Chuva de Espinhos de Cauda", hit: 5, dmg: "1d8+3 (x3) perfurante"}], imageUrl: "/textures/creatures/manticora.PNG" , attributes: { str: 17, dex: 16, con: 17, int: 7, wis: 12, cha: 8 } },
    { id: 304, name: "Sargento da Guarda Real", type: "Humanóide", cr: "3", ac: 18, hp: 52, speed: "9m", actions: [{n: "Espada Grande Martelada", hit: 5, dmg: "2d6+3 cortante"}, {n: "Besta Pesada de Cerco", hit: 3, dmg: "1d10+2 perfurante"}], traits: [{n: "Comando de Batalha", d: "Aliados a 9m ganham +1d4 em ataques."}], imageUrl: "/textures/creatures/guarda_sargento.PNG" , attributes: { str: 16, dex: 14, con: 14, int: 11, wis: 11, cha: 13 } },
    { id: 305, name: "Minotauro dos Labirintos", type: "Monstruosidade", cr: "3", ac: 14, hp: 76, speed: "12m", actions: [{n: "Machado Grande Monumental", hit: 6, dmg: "2d12+4 cortante" }, {n: "Chifres de Marfim", hit: 6, dmg: "2d8+4 perfurante"}], traits: [{n: "Investida Poderosa", d: "Dano extra e empurrão se mover 3m em linha reta."}], imageUrl: "/textures/creatures/minotauro.PNG" , attributes: { str: 18, dex: 11, con: 16, int: 6, wis: 16, cha: 9 } },
    { id: 306, name: "Escorpião Imperial Gigante", type: "Fera", cr: "3", ac: 15, hp: 52, speed: "12m", actions: [{n: "Pinças Esmagadoras", hit: 4, dmg: "1d8+2 concussão"}, {n: "Ferrão de Escarlate", hit: 4, dmg: "1d10+2 perfurante + 4d10 veneno (CD 12 Con p/ metade)"}], imageUrl: "/textures/creatures/escorpiao.PNG" , attributes: { str: 15, dex: 13, con: 15, int: 1, wis: 9, cha: 3 } },
    { id: 307, name: "Aparição Sombria (Fantasma)", type: "Morto-vivo", cr: "4", ac: 11, hp: 45, speed: "12m voo", actions: [{n: "Toque Debilitante do Além", hit: 5, dmg: "4d6+3 necrótico" }, {n: "Possessão Calafriante", hit: 0, dmg: "CD 13 Car ou Controlado"}], imageUrl: "/textures/creatures/fantasma.PNG" , attributes: { str: 7, dex: 13, con: 10, int: 10, wis: 12, cha: 17 } },
    { id: 308, name: "Banshee das Sombras", type: "Morto-vivo", cr: "4", ac: 12, hp: 58, speed: "0m/12m voo", actions: [{n: "Toque Corruptor Necrótico", hit: 4, dmg: "3d6+2 necrótico" }, {n: "Lamento da Morte", hit: 0, dmg: "CD 13 Con ou cair a 0 PV (1/dia)"}], imageUrl: "/textures/creatures/banshee.PNG" , attributes: { str: 1, dex: 14, con: 10, int: 12, wis: 11, cha: 17 } },
    { id: 309, name: "Ettin (Ogro de Duas Cabeças)", type: "Gigante", cr: "4", ac: 12, hp: 85, speed: "12m", actions: [{n: "Machado de Batalha Imundo", hit: 7, dmg: "2d8+5 cortante"}, {n: "Maça de Rocha Bruta", hit: 7, dmg: "2d8+5 concussão"}], imageUrl: "/textures/creatures/ogro_duas_cabeças.PNG" , attributes: { str: 21, dex: 8, con: 17, int: 6, wis: 10, cha: 8 } },
    { id: 310, name: "Chefe de Guerra Orc de Olho-Morto", type: "Humanóide", cr: "4", ac: 16, hp: 93, speed: "9m", actions: [{n: "Machado Grande de Combate", hit: 6, dmg: "1d12+4 + 1d8 cortante"}], traits: [{n: "Grito de Guerra Gruumsh", d: "Aliados ganham vantagem em ataques até o próximo turno."}], imageUrl: "/textures/creatures/orc_cavalheiro.PNG" , attributes: { str: 18, dex: 12, con: 18, int: 11, wis: 11, cha: 16 } },
    { id: 311, name: "Guarda Real de Elite", type: "Humanóide", cr: "4", ac: 20, hp: 60, speed: "9m", actions: [{n: "Espada Longa de Aço Fino", hit: 6, dmg: "1d8+4 cortante (Versátil 1d10)"}], imageUrl: "/textures/creatures/guarda_real.PNG" , attributes: { str: 18, dex: 14, con: 16, int: 10, wis: 12, cha: 12 } },
    { id: 312, name: "Assassino das Sombras do Culto", type: "Humanóide", cr: "4", ac: 15, hp: 50, speed: "12m", actions: [{n: "Cimitarra Envenenada", hit: 6, dmg: "1d6+4 + 2d6 veneno" }, {n: "Besta Silenciosa", hit: 6, dmg: "1d8+4 + 2d6 veneno"}], traits: [{n: "Ataque Furtivo Mortal", d: "Dano extra se tiver vantagem (crit auto se surpreso)."}], imageUrl: "/textures/creatures/assassino_culto.PNG" , attributes: { str: 11, dex: 18, con: 14, int: 13, wis: 11, cha: 10 } },
    { id: 313, name: "Beholder Zumbi Decomposto", type: "Morto-vivo", cr: "5", ac: 15, hp: 93, speed: "0m/9m voo", actions: [{n: "Mordida de Mandíbula Podre", hit: 5, dmg: "3d6 perfurante" }, {n: "Raio Ocular de Murchar", hit: 5, dmg: "CD 14 (Efeito de Raio Aleatório)"}], imageUrl: "/textures/creatures/beholder_zumbi.PNG" , attributes: { str: 10, dex: 14, con: 18, int: 3, wis: 8, cha: 5 } },
    { id: 314, name: "Cria Vampírica Sedenta", type: "Morto-vivo", cr: "5", ac: 15, hp: 82, speed: "9m", actions: [{n: "Garras de Terror", hit: 6, dmg: "2d4+3 cortante"}, {n: "Mordida Sanguessuga", hit: 6, dmg: "1d6+3 perfurante + 2d6 necrótico (Cura)"}], imageUrl: "/textures/creatures/vampiro_cria.PNG" , attributes: { str: 16, dex: 16, con: 16, int: 11, wis: 10, cha: 12 } },
    { id: 315, name: "Troll das Cavernas Voraz", type: "Gigante", cr: "5", ac: 15, hp: 84, speed: "9m", actions: [{n: "Mordida Repugnante", hit: 7, dmg: "1d6+4 perfurante"}, {n: "Garras Lacerantes Gêmeas", hit: 7, dmg: "2d6+4 cortante"}], traits: [{n: "Regeneração Troll", d: "Recupera 10 PV no início do turno (fogo/ácido anula)."}], imageUrl: "/textures/creatures/troll.PNG" , attributes: { str: 18, dex: 13, con: 20, int: 7, wis: 9, cha: 7 } },
    { id: 316, name: "Gladiador da Arena de Sangue", type: "Humanóide", cr: "5", ac: 16, hp: 112, speed: "9m", actions: [{n: "Lança de Ferro de Guerra", hit: 7, dmg: "2d6+4 perfurante"}, {n: "Escudada de Impacto", hit: 7, dmg: "1d4+4 concussão + CD 15 For ou derruba"}], imageUrl: "/textures/creatures/gladiador.PNG" , attributes: { str: 18, dex: 15, con: 16, int: 10, wis: 12, cha: 15 } },
    { id: 317, name: "Elemental da Terra Primordial", type: "Elemental", cr: "5", ac: 17, hp: 126, speed: "9m/9m escavar", actions: [{n: "Pancada de Rocha Sólida", hit: 8, dmg: "2d8+5 concussão"}], traits: [{n: "Deslizar na Rocha", d: "Pode mover-se através de terra/pedra não-mágica."}], imageUrl: "/textures/creatures/elemental_da_terra.PNG" , attributes: { str: 20, dex: 8, con: 20, int: 5, wis: 10, cha: 5 } },
    { id: 318, name: "Guarda da Cidadela Gigante", type: "Gigante", cr: "5", ac: 16, hp: 105, speed: "12m", actions: [{n: "Espadão Gigante de Bronze", hit: 8, dmg: "3d6+5 cortante"}], imageUrl: "/textures/creatures/guarda_gigante.PNG" , attributes: { str: 21, dex: 10, con: 18, int: 10, wis: 12, cha: 10 } },
    { id: 319, name: "Ogro Gigante de Pedra", type: "Gigante", cr: "6", ac: 14, hp: 120, speed: "12m", actions: [{n: "Esmagar com Clava de Rocha", hit: 9, dmg: "4d8+6 concussão"}], imageUrl: "/textures/creatures/ogro_gigante.PNG" , attributes: { str: 23, dex: 8, con: 20, int: 6, wis: 8, cha: 7 } },
    { id: 320, name: "Quimera de Três Cabeças", type: "Monstruosidade", cr: "6", ac: 14, hp: 114, speed: "9m/18m voo", actions: [{n: "Mordida de Leão e Bode", hit: 7, dmg: "2d10+4"}, {n: "Sopro de Fogo de Dragão", hit: 0, dmg: "7d8 fogo (CD 15 Des) Recarga 5-6"}], imageUrl: "/textures/creatures/quimera.PNG" , attributes: { str: 19, dex: 11, con: 19, int: 3, wis: 14, cha: 10 } },
    { id: 321, name: "Mago Negro do Conselho", type: "Humanóide", cr: "6", ac: 12, hp: 40, speed: "9m", actions: [{n: "Adaga de Cristal Negro", hit: 5, dmg: "1d4+2"}], spells: ["Bola de Fogo (8d6)", "Relâmpago (8d6)", "Voo Arcano", "Invisibilidade Maior"], imageUrl: "/textures/creatures/mago_negro.PNG" , attributes: { str: 9, dex: 14, con: 12, int: 18, wis: 12, cha: 11 } },
    { id: 322, name: "Assassino a Vapor Hextech", type: "Construto", cr: "6", ac: 18, hp: 90, speed: "12m", actions: [{n: "Lâmina Oculta Retrátil", hit: 8, dmg: "2d8+5 cortante" }, {n: "Jato de Vapor Superaquecido", hit: 0, dmg: "4d8 fogo (CD 15 Des)"}], imageUrl: "/textures/creatures/assassino_vapor.PNG" , attributes: { str: 18, dex: 16, con: 16, int: 10, wis: 10, cha: 7 } },
    { id: 323, name: "Aranha Metálica de Guarda", type: "Construto", cr: "5", ac: 18, hp: 75, speed: "12m", actions: [{n: "Patas Laminadas de Aço", hit: 7, dmg: "2d10+4 cortante" }, {n: "Teia de Malha de Aço", hit: 7, dmg: "CD 15 For ou Contido"}], imageUrl: "/textures/creatures/aranha_metalica.PNG" , attributes: { str: 16, dex: 18, con: 14, int: 6, wis: 10, cha: 5 } },
    { id: 330, name: "Basilisco Ancião Pétreo", type: "Monstruosidade", cr: "5", ac: 16, hp: 80, speed: "7.5m", actions: [{n: "Mordida Tóxica Dilacerante", hit: 6, dmg: "3d6+4 perfurante + 3d6 veneno"}], traits: [{n: "Aura de Petrificação", d: "Criaturas a 9m devem salvar CD 14 Con."}], imageUrl: "/textures/creatures/basilisco_1.PNG" , attributes: { str: 18, dex: 8, con: 17, int: 2, wis: 8, cha: 7 } },
    { id: 331, name: "Lobisomem Alpha da Alcatéia", type: "Humanóide", cr: "5", ac: 14, hp: 90, speed: "15m", actions: [{n: "Despedaçar com Garras", hit: 7, dmg: "3d8+4 cortante" }, {n: "Uivo Aterrorizante", hit: 0, dmg: "CD 14 Sab ou Amedrontado"}], imageUrl: "/textures/creatures/lobisomen_1.PNG" , attributes: { str: 18, dex: 15, con: 16, int: 10, wis: 12, cha: 12 } },
    { id: 332, name: "Mantícora Anciã das Nuvens", type: "Monstruosidade", cr: "5", ac: 16, hp: 95, speed: "9m/18m voo", actions: [{n: "Chuva de Espinhos Penetrantes", hit: 7, dmg: "2d8+4 (x3) perfurante"}], imageUrl: "/textures/creatures/manticora_1.PNG" , attributes: { str: 19, dex: 16, con: 19, int: 7, wis: 12, cha: 8 } },
    { id: 333, name: "Mímico Gigante Místico", type: "Monstruosidade", cr: "5", ac: 14, hp: 100, speed: "6m", actions: [{n: "Engolir em Massa", hit: 6, dmg: "2d10+5 perfurante + 4d6 ácido"}], imageUrl: "/textures/creatures/mimic_1.PNG" , attributes: { str: 19, dex: 12, con: 17, int: 5, wis: 13, cha: 8 } },

    // --- 400-499: High Challenge ---
    { id: 400, name: "Ilythid Soberano do Vazio Psíquico", type: "Aberração", cr: "7", ac: 15, hp: 71, speed: "9m", actions: [{n: "Tentáculos de Dominação Mental", hit: 7, dmg: "2d10+4 psíquico + Atordoado (CD 15 Int)" }, {n: "Extrair Essência Cerebral", hit: 7, dmg: "10d10 perfurante (Morte instantânea se chegar a 0 PV)"}], imageUrl: "/textures/creatures/devorador_de_mentes.PNG" , attributes: { str: 11, dex: 12, con: 12, int: 19, wis: 17, cha: 17 } },
    { id: 401, name: "Arquimago Zelot do Sol Negro", type: "Humanóide", cr: "12", ac: 15, hp: 99, speed: "9m", actions: [{n: "Cajado de Ébano do Infinito +2", hit: 8, dmg: "1d8+4 concussão + 1d6 força"}], spells: ["Parar o Tempo", "Globo de Invulnerabilidade", "Cone de Frio Polar (8d8)", "Muralha de Fogo Infernal (5d8)"], imageUrl: "/textures/creatures/arquimago.PNG" , attributes: { str: 10, dex: 14, con: 12, int: 20, wis: 15, cha: 16 } },
    { id: 402, name: "Draco Vermelho Vulcânico Jovem", type: "Dragão", cr: "10", ac: 18, hp: 178, speed: "12m/24m voo", actions: [{n: "Mordida de Brasas Incandescentes", hit: 10, dmg: "2d10+6 perfurante + 1d6 fogo" }, {n: "Garras de Obsidiana Afiada", hit: 10, dmg: "2d6+6 cortante"}, {n: "Sopro de Magma Primordial", hit: 0, dmg: "16d6 fogo (CD 17 Des)"}], imageUrl: "/textures/creatures/dragao.PNG" , attributes: { str: 23, dex: 10, con: 21, int: 14, wis: 11, cha: 19 } },
    { id: 403, name: "Colosso de Ferro Antigo da Forja Elemental", type: "Construto", cr: "16", ac: 20, hp: 210, speed: "9m", actions: [{n: "Pancada Titânica de Esmagamento", hit: 13, dmg: "3d8+7 concussão"}, {n: "Espada Larga de Aço Negro Gigante", hit: 13, dmg: "3d10+7 cortante"}, {n: "Sopro de Gás Venenoso de Decomposição", hit: 0, dmg: "10d8 veneno (CD 19 Con)"}], imageUrl: "/textures/creatures/golem_ferro.PNG" , attributes: { str: 24, dex: 9, con: 20, int: 3, wis: 11, cha: 1 } },
    { id: 404, name: "Observador Ocular (Beholder) do Reino Abissal", type: "Aberração", cr: "13", ac: 18, hp: 180, speed: "0m/6m voo", actions: [{n: "Mordida Dilacerante de Mandíbula Aberta", hit: 5, dmg: "4d6 perfurante" }, {n: "Raios Oculares do Caos Primitivo (3)", hit: 0, dmg: "Var (CD 16): Petrificação, Morte, Desintegração"}], imageUrl: "/textures/creatures/beholder.PNG" , attributes: { str: 10, dex: 14, con: 18, int: 17, wis: 15, cha: 17 } },
    { id: 405, name: "Conde Vampiro Sanguinário de Valáquia", type: "Morto-vivo", cr: "13", ac: 16, hp: 144, speed: "9m", actions: [{n: "Pancada de Sangue Corrompido", hit: 9, dmg: "1d8+4 necrótico"}, {n: "Mordida da Eternidade Sombria", hit: 9, dmg: "1d6+4 perfurante + 3d6 necrótico (Cura o Vampiro)"}], traits: [{n: "Regeneração Atroz Atemporal", d: "Recupera 20 PV no início do turno se não estiver sob o sol."}], imageUrl: "/textures/creatures/vampiro.PNG" , attributes: { str: 18, dex: 18, con: 18, int: 17, wis: 15, cha: 18 } },
    { id: 406, name: "Gigante das Tormentas Soberano dos Mares", type: "Gigante", cr: "13", ac: 16, hp: 230, speed: "15m", actions: [{n: "Espada Grande de Relâmpagos Celestiais", hit: 14, dmg: "6d6+9 cortante" }, {n: "Invocação do Relâmpago Destruidor", hit: 0, dmg: "12d8 elétrico (CD 17) Recarga 5-6"}], imageUrl: "/textures/creatures/gigante_da_tempestade.PNG" , attributes: { str: 29, dex: 14, con: 20, int: 16, wis: 18, cha: 18 } },
    { id: 407, name: "Serpente Negra Adulta (Dragão) das Sombras", type: "Dragão", cr: "14", ac: 19, hp: 195, speed: "12m/24m voo", actions: [{n: "Mordida de Ácido Corrosivo", hit: 11, dmg: "2d10+6 perfurante + 1d8 ácido" }, {n: "Chicote de Cauda de Aço", hit: 11, dmg: "2d8+6 concussão"}, {n: "Sopro de Névoa de Ácido Mortal", hit: 0, dmg: "12d8 ácido (CD 18 Des)"}], imageUrl: "/textures/creatures/dragao_negro.PNG" , attributes: { str: 23, dex: 14, con: 21, int: 14, wis: 13, cha: 17 } },
    { id: 408, name: "Verme Púrpura Voraz do Abismo Interior", type: "Monstruosidade", cr: "15", ac: 18, hp: 247, speed: "15m escavar", actions: [{n: "Mordida de Engolir em Massa", hit: 14, dmg: "3d8+9 perfurante + Engolir (CD 19 For)" }, {n: "Ferrão de Escorpião do Deserto Sangrento", hit: 14, dmg: "3d6+9 perfurante + 12d6 veneno"}], imageUrl: "/textures/creatures/verme.PNG" , attributes: { str: 28, dex: 7, con: 22, int: 1, wis: 8, cha: 4 } },
    { id: 409, name: "Gorgon: Touro Metálico Transmutado", type: "Monstruosidade", cr: "5", ac: 19, hp: 114, speed: "12m", actions: [{n: "Investida de Chifres de Ferro", hit: 8, dmg: "2d12+5 perfurante" }, {n: "Sopro de Fumaça Petrificante", hit: 0, dmg: "CD 13 Con ou Petrificado"}], imageUrl: "/textures/creatures/touro_metalico.PNG" , attributes: { str: 20, dex: 11, con: 16, int: 2, wis: 12, cha: 7 } },
    { id: 410, name: "Esqueleto da Ruína Amaldiçoada", type: "Morto-vivo", cr: "7", ac: 18, hp: 90, speed: "9m", actions: [{n: "Espada das Sombras Necróticas", hit: 8, dmg: "2d6+5 cortante + 2d6 necrótico"}], imageUrl: "/textures/creatures/esqueleto_ruina.PNG" , attributes: { str: 16, dex: 16, con: 16, int: 8, wis: 10, cha: 8 } },

    // --- 500+ NPCs & Bosses ---
    { id: 500, name: "Mestre Artífice das Engrenagens", type: "Humanóide", cr: "3", ac: 16, hp: 45, speed: "9m", actions: [{n: "Martelo de Forja Encantado", hit: 5, dmg: "1d8+2 concussão"}], spells: ["Mísseis Mágicos de Estilhaços", "Curar Ferimentos Mecânico", "Levitação de Precisão"], imageUrl: "/textures/creatures/artf.PNG" , attributes: { str: 10, dex: 14, con: 12, int: 16, wis: 12, cha: 10 } },
    { id: 501, name: "Autômato Guardião Rúnico", type: "Construto", cr: "1", ac: 16, hp: 30, speed: "9m", actions: [{n: "Pancada de Bronze Maciço", hit: 4, dmg: "1d6+2 concussão"}], imageUrl: "/textures/creatures/automato.PNG" , attributes: { str: 14, dex: 10, con: 14, int: 6, wis: 10, cha: 5 } },
    { id: 502, name: "Bárbaro Golias, O Britador de Pedras", type: "Humanóide", cr: "5", ac: 15, hp: 90, speed: "12m", actions: [{n: "Machado Grande Monumental", hit: 7, dmg: "1d12+4 + 2 (Fúria) cortante"}], imageUrl: "/textures/creatures/barbaro_golias.PNG" , attributes: { str: 18, dex: 14, con: 16, int: 10, wis: 12, cha: 10 } },
    { id: 503, name: "Bárbaro Meio-Orc da Horda Selvagem", type: "Humanóide", cr: "4", ac: 14, hp: 75, speed: "9m", actions: [{n: "Machado Duplo de Execução", hit: 6, dmg: "2d6+3 cortante"}], imageUrl: "/textures/creatures/barbaro_meioorc.PNG" , attributes: { str: 16, dex: 14, con: 16, int: 10, wis: 10, cha: 10 } },
    { id: 504, name: "Bardo Kenku dos Murmúrios Imitados", type: "Humanóide", cr: "2", ac: 14, hp: 30, speed: "9m", actions: [{n: "Adaga Oculta de Penas", hit: 4, dmg: "1d4+2 perfurante"}], spells: ["Zombaria Viciosa de Mil Vozes", "Onda Trovejante Grita-Céu", "Invisibilidade de Sombra"], imageUrl: "/textures/creatures/bardo_kenku.PNG" , attributes: { str: 10, dex: 16, con: 12, int: 12, wis: 10, cha: 16 } },
    { id: 505, name: "Bruxo Tiefling do Pacto Infernal", type: "Humanóide", cr: "3", ac: 12, hp: 35, speed: "9m", actions: [{n: "Rajada Mística de Almas", hit: 5, dmg: "1d10+3 força"}], spells: ["Braços de Hadar Faminto", "Escuridão Profunda", "Raio Ardente de Enxofre"], imageUrl: "/textures/creatures/bruxo_tiefling.PNG" , attributes: { str: 10, dex: 14, con: 14, int: 12, wis: 10, cha: 16 } },
    { id: 506, name: "Alto Clérigo da Ordem Branca", type: "Humanóide", cr: "3", ac: 18, hp: 40, speed: "9m", actions: [{n: "Maça Divina de Impacto", hit: 4, dmg: "1d6+2 concussão"}], spells: ["Cura Ferimentos de Luz", "Benção dos Deuses", "Arma Espiritual Guardiã"], imageUrl: "/textures/creatures/clerigo.PNG" , attributes: { str: 14, dex: 10, con: 14, int: 10, wis: 16, cha: 12 } },
    { id: 507, name: "Druida Tortle do Mar Coral", type: "Humanóide", cr: "2", ac: 17, hp: 38, speed: "9m", actions: [{n: "Bordão de Madeira de Sândalo", hit: 4, dmg: "1d6+2 concussão"}], spells: ["Constrição de Algas", "Pele de Árvore Marinha", "Curar Ferimentos de Água"], imageUrl: "/textures/creatures/druida_tortie.PNG" , attributes: { str: 10, dex: 10, con: 14, int: 12, wis: 16, cha: 10 } },
    { id: 508, name: "Druida Elfo do Bosque Sagrado", type: "Humanóide", cr: "2", ac: 14, hp: 27, speed: "10.5m", actions: [{n: "Cimitarra de Obsidiana Verde", hit: 4, dmg: "1d6+2 cortante"}], spells: ["Fogo das Fadas Brilhante", "Onda Trovejante da Floresta"], imageUrl: "/textures/creatures/duida_elfo.PNG" , attributes: { str: 10, dex: 14, con: 12, int: 12, wis: 16, cha: 10 } },
    { id: 509, name: "Dama de Guerra Githyanki", type: "Humanóide", cr: "5", ac: 17, hp: 65, speed: "9m", actions: [{n: "Espada Grande de Prata Astral", hit: 7, dmg: "2d6+4 cortante + 2d6 psíquico"}], imageUrl: "/textures/creatures/guerreira_githyanki.PNG" , attributes: { str: 16, dex: 14, con: 14, int: 14, wis: 12, cha: 10 } },
    { id: 510, name: "Assassino Halfling do Ponto Cego", type: "Humanóide", cr: "3", ac: 16, hp: 33, speed: "7.5m", actions: [{n: "Adaga de Ponta Envenenada", hit: 6, dmg: "1d4+3 perfurante + 2d6 (Ataque Furtivo)"}], imageUrl: "/textures/creatures/ladino_hafling.PNG" , attributes: { str: 8, dex: 18, con: 12, int: 12, wis: 10, cha: 14 } },
    { id: 511, name: "Mago Acadêmico de Candlekeep", type: "Humanóide", cr: "2", ac: 12, hp: 22, speed: "9m", actions: [{n: "Bordão de Carvalho Arcano", hit: 2, dmg: "1d6 concussão"}], spells: ["Mãos Flamejantes de Fogo Vivo", "Escudo Arcano de Refração", "Mísseis Mágicos de Precisão"], imageUrl: "/textures/creatures/mago.PNG" , attributes: { str: 8, dex: 14, con: 12, int: 16, wis: 12, cha: 10 } },
    { id: 512, name: "Mestre Monge Tabaxi da Garra Veloz", type: "Humanóide", cr: "4", ac: 16, hp: 55, speed: "12m", actions: [{n: "Ataque Desarmado de Gatuna", hit: 6, dmg: "1d6+4 concussão" }, {n: "Rajada de Golpes da Tempestade", hit: 6, dmg: "2x 1d6+4 concussão"}], imageUrl: "/textures/creatures/monge_tabaxi.PNG" , attributes: { str: 10, dex: 18, con: 14, int: 10, wis: 16, cha: 10 } },
    { id: 513, name: "Vingador Paladino Draconato", type: "Humanóide", cr: "5", ac: 18, hp: 70, speed: "9m", actions: [{n: "Espada Longa de Justiça Divina", hit: 7, dmg: "1d8+4 cortante" }, {n: "Sopro de Fogo Dracônico Real", hit: 0, dmg: "3d6 fogo (CD 13 Des)"}], imageUrl: "/textures/creatures/paladino_draconato.PNG" , attributes: { str: 16, dex: 10, con: 14, int: 10, wis: 12, cha: 16 } },
    
    // --- 600+ Special & Unique ---
    { id: 600, name: "Lich Ancestral", type: "Morto-vivo", cr: "21", ac: 17, hp: 135, speed: "9m", actions: [{n: "Toque Paralisante Corruptor", hit: 12, dmg: "3d6 frio + CD 18 Con ou Paralisado"}], spells: ["Dedo da Morte (7d8+30 necrótico)", "Palavra de Poder: Matar", "Desintegrar (10d6+40 força)"], imageUrl: "/textures/creatures/lich.PNG" , attributes: { str: 11, dex: 16, con: 16, int: 20, wis: 14, cha: 16 } },
    { id: 601, name: "Balor, Senhor das Chamas", type: "Demônio", cr: "19", ac: 19, hp: 262, speed: "12m/24m voo", actions: [{n: "Lâmina de Relâmpago", hit: 14, dmg: "3d8+8 cortante + 3d8 elétrico" }, {n: "Chicote de Fogo", hit: 14, dmg: "2d6+8 cortante + 3d6 fogo"}], traits: [{n: "Aura de Fogo", d: "10 de dano de fogo a inimigos próximos."}], imageUrl: "/textures/creatures/rei_demonio.PNG" , attributes: { str: 26, dex: 15, con: 22, int: 20, wis: 16, cha: 22 } },
    { id: 602, name: "Tarrasque (O Devorador de Mundos)", type: "Monstruosidade", cr: "30", ac: 25, hp: 676, speed: "12m", actions: [{n: "Multiataque Destrutivo", hit: 19, dmg: "Mordida + 2x Garra + Chifres + Cauda" }, {n: "Mordida Voraz", hit: 19, dmg: "4d12+10 perfurante + Agarrado"}], traits: [{n: "Carapaça Refletora", d: "Imune a mísseis mágicos; reflete raios."}, {n: "Resistência Lendária", d: "Pode escolher passar em 3 testes falhos ao dia."}], imageUrl: "/textures/creatures/tarrasque.PNG" , attributes: { str: 30, dex: 11, con: 30, int: 3, wis: 11, cha: 11 } },
    { id: 603, name: "Urso-Besta das Cavernas", type: "Fera", cr: "2", ac: 13, hp: 45, speed: "12m", actions: [{n: "Mordida Brutal", hit: 7, dmg: "1d8+5 perfurante" }, {n: "Garras Despedaçar", hit: 7, dmg: "2d6+5 cortante"}], imageUrl: "/textures/creatures/urso_atroz.PNG" , attributes: { str: 19, dex: 10, con: 16, int: 2, wis: 13, cha: 7 } },
    { id: 604, name: "Morcego Gigante Vampírico", type: "Fera", cr: "1/4", ac: 13, hp: 22, speed: "1.5m / 18m voo", actions: [{n: "Mordida Drenante", hit: 4, dmg: "1d6+2 perfurante"}], imageUrl: "/textures/creatures/morcego.PNG" , attributes: { str: 15, dex: 16, con: 11, int: 2, wis: 12, cha: 6 } },
    { id: 605, name: "Gárgula de Bronze Reanimada", type: "Construto", cr: "2", ac: 16, hp: 40, speed: "9m", actions: [{n: "Pancada Metálica", hit: 5, dmg: "1d8+3 concussão"}], traits: [{n: "Couraça de Bronze", d: "Resistência a dano de fogo."}], imageUrl: "/textures/creatures/gargula_lata.PNG" , attributes: { str: 15, dex: 11, con: 16, int: 6, wis: 11, cha: 7 } },
    { id: 606, name: "Campeão da Arena", type: "Humanóide", cr: "7", ac: 18, hp: 130, speed: "9m", actions: [{n: "Tridente de Combate", hit: 8, dmg: "2d6+5 perfurante" }, {n: "Rede de Contenção", hit: 5, dmg: "Contenção (CD 15 For)"}], imageUrl: "/textures/creatures/gladiador_1.PNG" , attributes: { str: 18, dex: 15, con: 16, int: 10, wis: 12, cha: 15 } },
    { id: 607, name: "Gosma de Alcatrão", type: "Limo", cr: "4", ac: 8, hp: 85, speed: "6m", actions: [{n: "Pseudópode Pegajoso", hit: 5, dmg: "2d6+3 concussão + 2d8 necrótico"}], traits: [{n: "Aderência", d: "Criaturas atingidas por ataques corpo a corpo ficam presas."}], imageUrl: "/textures/creatures/silime_2.PNG" , attributes: { str: 15, dex: 6, con: 14, int: 2, wis: 6, cha: 1 } },
    { id: 608, name: "Aparição Secular", type: "Morto-vivo", cr: "6", ac: 12, hp: 70, speed: "12m voo", actions: [{n: "Olhar de Pavor", hit: 0, dmg: "CD 15 Sab ou Amedrontado" }, {n: "Toque do Vazio", hit: 6, dmg: "5d8 necrótico"}], traits: [{n: "Evasão Efêmera", d: "Resistência a danos não-mágicos."}], imageUrl: "/textures/creatures/fantasma_1.PNG" , attributes: { str: 7, dex: 13, con: 10, int: 10, wis: 12, cha: 17 } },
    { id: 609, name: "Gnu da Savana Amaldiçoada", type: "Fera", cr: "1/2", ac: 11, hp: 20, speed: "12m", actions: [{n: "Investida de Chifres", hit: 5, dmg: "1d8+3 perfurante"}], imageUrl: "/textures/creatures/gnu.PNG" , attributes: { str: 16, dex: 10, con: 14, int: 2, wis: 10, cha: 4 } },
    { id: 610, name: "Demilich Desperto", type: "Morto-vivo", cr: "18", ac: 20, hp: 80, speed: "0m/9m voo", actions: [{n: "Uivo Mortal", hit: 0, dmg: "CD 15 Con ou Caído a 0 PV" }, {n: "Drenagem de Energia", hit: 10, dmg: "10d6 necrótico (cura Demilich)"}], imageUrl: "/textures/creatures/lich_1.PNG" , attributes: { str: 1, dex: 20, con: 10, int: 20, wis: 17, cha: 20 } },
    { id: 611, name: "Nuvem de Morcegos Sanguinários", type: "Fera", cr: "1/2", ac: 12, hp: 22, speed: "0m/9m voo", actions: [{n: "Milhares de Mordidas", hit: 4, dmg: "2d4 perfurante"}], traits: [{n: "Forma de Enxame", d: "Pode ocupar espaço de outros; resistência a dano simples."}], imageUrl: "/textures/creatures/morcego_1.PNG" , attributes: { str: 5, dex: 15, con: 10, int: 2, wis: 12, cha: 4 } },
    
    // --- 700+ New Illustrated Tokens ---
    { id: 700, name: "Cervo Ancestral Sagrado", type: "Fera", cr: "2", ac: 14, hp: 45, speed: "15m", actions: [{n: "Chifres Reais", hit: 6, dmg: "2d8+4 perfurante"}], traits: [{n: "Passagem Etérea", d: "Pode se mover pelo terreno sem penalidade."}], imageUrl: "/textures/creatures/Cervo_Ancestral_ilustracao.png", attributes: { str: 18, dex: 14, con: 14, int: 10, wis: 14, cha: 10 } },
    { id: 701, name: "Cobra Gigante Constritora", type: "Fera", cr: "1", ac: 12, hp: 30, speed: "9m", actions: [{n: "Mordida Venenosa", hit: 5, dmg: "1d8+3 perfurante + 1d6 veneno"}, {n: "Constrição", hit: 5, dmg: "1d10+3 concussão + Agarrado (CD 12 For)"}], imageUrl: "/textures/creatures/Cobra_Gigante_ilustracao.png", attributes: { str: 14, dex: 14, con: 12, int: 2, wis: 10, cha: 3 } },
    { id: 702, name: "Coruja Sábia Vigilante", type: "Fera", cr: "1/2", ac: 13, hp: 15, speed: "3m/18m voo", actions: [{n: "Garras de Precisão", hit: 5, dmg: "1d6+3 cortante"}], traits: [{n: "Visão Aguçada", d: "Vantagem em testes de Percepção (visão)."}], imageUrl: "/textures/creatures/Coruja_Sábia_ilustracao.png", attributes: { str: 8, dex: 16, con: 12, int: 10, wis: 14, cha: 12 } },
    { id: 703, name: "Cão Infernal das Chamas", type: "Infernal", cr: "3", ac: 15, hp: 45, speed: "15m", actions: [{n: "Mordida de Fogo", hit: 5, dmg: "1d8+3 perfurante + 1d6 fogo", }, {n: "Sopro de Brasas", hit: 0, dmg: "6d6 fogo (CD 12 Des Rec 5-6)"}], imageUrl: "/textures/creatures/Cão_Infernal_ilustracao.png", attributes: { str: 17, dex: 12, con: 14, int: 6, wis: 13, cha: 6 } },
    { id: 704, name: "Grifo Ancião das Nuvens", type: "Monstruosidade", cr: "5", ac: 15, hp: 90, speed: "9m/24m voo", actions: [{n: "Múltiplos Ataques", hit: 8, dmg: "Bico + Garra" }, {n: "Bico Poderoso", hit: 8, dmg: "2d8+5 perfurante"}, {n: "Garras Destruidoras", hit: 8, dmg: "2d10+5 cortante"}], imageUrl: "/textures/creatures/Grifo_Ancião_ilustracao.png", attributes: { str: 20, dex: 15, con: 18, int: 8, wis: 14, cha: 10 } },
    { id: 705, name: "Javali Enfurecido das Presas", type: "Fera", cr: "1/2", ac: 12, hp: 18, speed: "12m", actions: [{n: "Presas de Marfim", hit: 4, dmg: "1d10+2 perfurante"}], traits: [{n: "Resiliência do Javali", d: "Se levar dano letal, fica com 1 PV (1/descanso)."}], imageUrl: "/textures/creatures/Javali_Enfurecido_ilustracao.png", attributes: { str: 14, dex: 10, con: 14, int: 2, wis: 9, cha: 5 } },
    { id: 706, name: "Lobo Alfa da Alcateia", type: "Fera", cr: "2", ac: 14, hp: 45, speed: "15m", actions: [{n: "Mordida Esmagadora", hit: 6, dmg: "2d6+4 perfurante | CD 13 For ou Derrubado"}], traits: [{n: "Tática de Matilha", d: "Vantagem se houver aliado próximo ao alvo."}], imageUrl: "/textures/creatures/Lobo_Alfa_ilustracao.png", attributes: { str: 18, dex: 15, con: 15, int: 4, wis: 13, cha: 8 } },
    { id: 707, name: "Pantera Negra das Sombras", type: "Fera", cr: "1/2", ac: 12, hp: 15, speed: "15m", actions: [{n: "Garras Silenciosas", hit: 5, dmg: "1d6+3 cortante"}], traits: [{n: "Pulo do Predador", d: "Pode saltar grandes distâncias e atacar com vantagem."}], imageUrl: "/textures/creatures/Pantera_Negra_ilustracao.png", attributes: { str: 14, dex: 16, con: 12, int: 3, wis: 14, cha: 8 } },
];

export const CLASS_SPELLS: Record<string, string[]> = {
  'Bardo': ["Amizade", "Ilusão Menor", "Mãos Mágicas", "Prestidigitação", "Zombaria Viciosa", "Bênção", "Curar Ferimentos", "Detectar Magia", "Escudo Arcano", "Fogo das Fadas", "Heroísmo", "Onda Trovejante", "Palavra Curativa", "Riso Histérico de Tasha", "Amizade Animal", "Compreender Idiomas", "Disfarçar-se", "Escrita Ilusória", "Enfeitiçar Pessoa", "Identificar", "Imagem Silenciosa", "Passo Nebuloso", "Sugestão", "Invisibilidade", "Imobilizar Pessoa", "Cativar", "Cegueira/Surdez", "Detectar Pensamentos", "Força Sugestiva", "Localizar Objeto", "Mensagem", "Nuvem de Adagas", "Padrão Hipnótico", "Clarividência", "Dissipar Magia", "Enviar Mensagem", "Falar com Plantas", "Falar com Mortos", "Línguas", "Medo", "Montaria Fantasmagórica", "Palavra Curativa em Massa", "Pequena Cabana de Leomund", "Rogar Maldição", "Confusão", "Dominar Pessoa", "Invisibilidade Maior", "Localizar Criatura", "Metamorfose", "Porta Dimensional", "Animar Objetos", "Imobilizar Monstro", "Modificar Memória", "Passar Muralhas", "Teletransporte", "Olhar Penetrante", "Sugestão em Massa", "Visão Verdadeira", "Espada de Mordenkainen", "Inverter a Gravidade", "Mansão Magnífica", "Dominar Monstro", "Limpar a Mente", "Palavra de Poder: Atordoar", "Sexto Sentido", "Palavra de Poder: Matar", "Desejo", "Tremor de Terra", "Servo Invisível", "Acalmar Emoções", "Aprimorar Habilidade", "Arrombar", "Auxílio", "Boca Encantada", "Chicote Mental de Tasha", "Conhecimento Emprestado", "Escrita Celeste", "Força Fantasmagórica", "Levitar", "Mensageiro Animal", "Nublar", "Picada Mental", "Repouso Tranquilo", "Restauração Menor", "Silêncio", "Ver o Invisível", "Visão no Escuro", "Zona da Verdade"],
  'Clérigo': ["Chama Sagrada", "Estabilizar", "Luz", "Orientação", "Resistência", "Taumaturgia", "Bênção", "Comando", "Curar Ferimentos", "Detectar Magia", "Detectar Bem e Mal", "Escudo da Fé", "Infligir Ferimentos", "Palavra Curativa", "Proteção contra o Bem e o Mal", "Purificar Alimentos e Bebidas", "Santuário", "Auxílio", "Arma Espiritual", "Augúrio", "Cegueira/Surdez", "Chama Contínua", "Imobilizar Pessoa", "Luz do Dia", "Mensuração", "Oração Curativa", "Proteção contra Veneno", "Restauração Menor", "Silêncio", "Vínculo Protetor", "Animar Mortos", "Caminhar na Água", "Círculo de Magia", "Clarividência", "Coluna de Chamas", "Dissipar Magia", "Espíritos Guardiões", "Falar com os Mortos", "Glifo de Proteção", "Mesclar-se às Rochas", "Palavra Curativa em Massa", "Proteção contra Energia", "Remover Maldição", "Revivificar", "Rogar Maldição", "Banimento", "Controlar Água", "Guardião da Fé", "Localizar Criatura", "Moldar Rocha", "Proteção contra Morte", "Cura Completa", "Comunhão", "Consagrar", "Curar Ferimentos em Massa", "Lenda Viva", "Missão", "Praga", "Ressurreição", "Escuridão Profunda", "Barreira de Lâminas", "Cura Completa", "Encontrar o Caminho", "Harmonia", "Palavra Sagrada", "Proibição", "Sugestão em Massa", "Visão Verdadeira", "Conjurar Celestial", "Divindade Etérea", "Forma de Fogo", "Inverter a Gravidade", "Regenerar", "Ressurreição", "Símbolo", "Tempestade de Fogo", "Aura Sagrada", "Campo Antimagia", "Controlar o Tempo", "Terremoto", "Muralha de Luz", "Portal", "Projeção Astral", "Ressurreição Verdadeira", "Tempestade de Vingança"],
  'Mago': ["Amizade", "Chicote de Espinhos", "Criar Fogueira", "Dardo de Fogo", "Ilusão Menor", "Luz", "Mãos Mágicas", "Mensagem", "Prestidigitação", "Raio de Gelo", "Toque Chocante", "Alarme", "Armadura Arcana", "Compreender Idiomas", "Detectar Magia", "Disfarçar-se", "Enfeitiçar Pessoa", "Escrita Ilusória", "Escudo Arcano", "Identificar", "Imagem Silenciosa", "Mãos Flamejantes", "Mísseis Mágicos", "Névoa Obscurecente", "Onda Trovejante", "Orbe Cromático", "Queda Suave", "Raio Bruxo", "Recuo Acelerado", "Riso Histérico de Tasha", "Salto", "Servo Invisível", "Vida Falsa", "Alterar-se", "Arma Mágica", "Arrombar", "Aumentar/Reduzir", "Boca Mágica", "Cegueira/Surdez", "Coroa da Loucura", "Despedaçar", "Detectar Pensamentos", "Escrita Celeste", "Escuridão", "Esfera Flamejante", "Flecha Ácida de Melf", "Força Fantasmagórica", "Lâmina Sombria", "Nublar", "Patas de Aranha", "Picada Mental", "Prender à Terra", "Sopro do Dragão", "Tempestade de Bolas de Neve de Snilloc", "Truque de Corda", "Animar Mortos", "Bola de Fogo", "Clarividência", "Círculo de Magia", "Dificultar Detecção", "Dissipar Magia", "Enviar Mensagem", "Forma Gasosa", "Glifo de Proteção", "Lentidão", "Línguas", "Medo", "Montaria Fantasmagórica", "Névoa Fétida", "Padrão Hipnótico", "Pequena Cabana de Leomund", "Piscar", "Proteção contra Energia", "Relâmpago", "Remover Maldição", "Respirar na Água", "Rogar Maldição", "Toque Vampírico", "Velocidade", "Voo", "Olho Arcano", "Banimento", "Secar", "Confusão", "Controlar Água", "Fabricar", "Invisibilidade Maior", "Localizar Criatura", "Metamorfose", "Muralha de Fogo", "O olho de Oro", "Pele de Pedra", "Porta Dimensional", "Tempestade de Gelo", "Tentáculos Negros de Evard", "Animar Objetos", "Caminhar no Ar", "Círculo de Teletransporte", "Cone de Frio", "Criação", "Dominar Pessoa", "Imobilizar Monstro", "Mão de Bigby", "Ligação Telepática de Rary", "Muralha de Força", "Muralha de Pedra", "Modificar Memória", "Névoa Mortal", "Passo Distante", "Teletransporte", "Semiplano", "Contigência", "Corrente de Relâmpagos", "Desintegrar", "Esfera Gélida de Otiluke", "Globo de Invulnerabilidade", "Invisibilidade em Massa", "Olhar Penetrante", "Muralha de Gelo", "Sugestão em Massa", "Visão Verdadeira", "Dedo da Morte", "Espada de Mordenkainen", "Inverter a Gravidade", "Isolamento", "Mansão Magnífica de Mordenkainen", "Projeção Astral", "Símbolo", "Teletransporte", "Eterealidade", "Labirinto", "Dominar Monstro", "Limpar a Mente", "Nuvem Incendiária", "Palavra de Poder: Atordoar", "Clone", "Semiplano", "Explosão Solar", "Chuva de Meteoros", "Desejo", "Aprisionamento", "Metamorfose Verdadeira", "Muralha Prismática", "Parar o Tempo", "Portal", "Sexto Sentido", "Tempestade de Vingança", "Catapulta", "Causar Medo", "Cerimônia", "Disco Flutuante de Tenser", "Encontrar Familiar", "Faca de Gelo", "Proteção contra o Bem e o Mal", "Tremor de Terra", "Aperto da Terra de Maximilian", "Aprimorar Habilidade", "Aura Mágica de Nystul", "Boca Encantada", "Chamuscar de Aganazzar", "Chicote Mental de Tasha", "Conhecimento Emprestado", "Escrita Celeste"],
  'Artífice': ["Orientação", "Mãos Mágicas", "Mensagem", "Prestidigitação", "Chicote Elétrico", "Toque Chocante", "Alarme", "Curar Ferimentos", "Disfarçar-se", "Fogo das Fadas", "Identificar", "Salto", "Recuo Acelerado", "Santuário", "Queda Suave", "Purificar Alimentos e Bebidas", "Absorver Elementos", "Catapulta", "Favor Divino", "Alterar-se", "Arma Mágica", "Arrombar", "Aumentar/Reduzir", "Invisibilidade", "Levitar", "Localizar Objeto", "Proteção contra Veneno", "Pirotecnia", "Restauração Menor", "Ver o Invisível", "Visão no Escuro", "Teia", "Calor no Metal", "Dissipar Magia", "Caminhar na Água", "Piscar", "Criar Alimentos e Bebidas", "Proteção contra Energia", "Revivificar", "Respirar na Água", "Pequena Cabana de Leomund", "Aura de Vitalidade", "Arcanismo de Mordenkainen", "Fabricar", "Libertar", "Metamorfose", "Pele de Pedra", "Resiliência", "Santidade do Corpo", "Animação de Objetos", "Criação", "Mão de Bigby", "Muralha de Pedra", "Restauração Maior", "Transmutar Rochas", "Detectar Magia", "Escudo Arcano"]
};

export const MAGIC_ITEMS_DB: Record<string, Omit<InventoryItem, 'id' | 'isAtt' | 'eq'>> = {
  "Cinto de Força do Gigante da Colina": {
    n: "Cinto de Força do Gigante da Colina",
    d: "Sua Força torna-se 21 enquanto você usar este cinto. Não tem efeito se sua Força já for 21 ou maior.",
    r: "Raro", t: "item", att: true,
    eff: [{ type: 'attr', stat: 'str', value: 21 }]
  },
  "Cinto de Força do Gigante de Fogo": {
    n: "Cinto de Força do Gigante de Fogo",
    d: "Sua Força torna-se 25 enquanto você usar este cinto. Não tem efeito se sua Força já for 25 ou maior.",
    r: "Muito Raro", t: "item", att: true,
    eff: [{ type: 'attr', stat: 'str', value: 25 }]
  },
  "Cinto de Força do Gigante das Nuvens": {
    n: "Cinto de Força do Gigante das Nuvens",
    d: "Sua Força torna-se 27 enquanto você usar este cinto.",
    r: "Lendário", t: "item", att: true,
    eff: [{ type: 'attr', stat: 'str', value: 27 }]
  },
  "Cinto de Força do Gigante da Tempestade": {
    n: "Cinto de Força do Gigante da Tempestade",
    d: "Sua Força torna-se 29 enquanto você usar este cinto.",
    r: "Lendário", t: "item", att: true,
    eff: [{ type: 'attr', stat: 'str', value: 29 }]
  },
  "Manoplas de Força do Ogro": {
    n: "Manoplas de Força do Ogro",
    d: "Sua Força torna-se 19 enquanto você usar estas manoplas.",
    r: "Incomum", t: "item", att: true,
    eff: [{ type: 'attr', stat: 'str', value: 19 }]
  },
  "Amuleto de Saúde": {
    n: "Amuleto de Saúde",
    d: "Sua Constituição torna-se 19 enquanto você usar este amuleto.",
    r: "Raro", t: "item", att: true,
    eff: [{ type: 'attr', stat: 'con', value: 19 }]
  },
  "Tiara de Intelecto": {
    n: "Tiara de Intelecto",
    d: "Sua Inteligência torna-se 19 enquanto você usar esta tiara.",
    r: "Incomum", t: "item", att: true,
    eff: [{ type: 'attr', stat: 'int', value: 19 }]
  },
  "Capa de Proteção": {
    n: "Capa de Proteção",
    d: "Você ganha +1 de bônus na CA e em todos os testes de resistência.",
    r: "Incomum", t: "item", att: true,
    eff: [{ type: 'ac', value: 1 }, { type: 'save', value: 1 }]
  },
  "Anel de Proteção": {
    n: "Anel de Proteção",
    d: "Você ganha +1 de bônus na CA e em todos os testes de resistência.",
    r: "Raro", t: "item", att: true,
    eff: [{ type: 'ac', value: 1 }, { type: 'save', value: 1 }]
  },
  "Braceletes de Defesa": {
    n: "Braceletes de Defesa",
    d: "Você ganha +2 de bônus na CA enquanto não estiver usando armadura ou escudo.",
    r: "Raro", t: "item", att: true,
    eff: [{ type: 'ac', value: 2 }]
  },
  "Pedra de Boa Sorte (Luckstone)": {
    n: "Pedra de Boa Sorte (Luckstone)",
    d: "Você ganha +1 de bônus em testes de atributo e testes de resistência.",
    r: "Incomum", t: "item", att: true,
    eff: [{ type: 'save', value: 1 }]
  },
  "Anel de Evasão": {
    n: "Anel de Evasão",
    d: "Possui 3 cargas. Se falhar num teste de resistência de Destreza, você pode gastar 1 carga para passar em vez disso.",
    r: "Raro", t: "item", att: true
  },
  "Botas de Velocidade": {
    n: "Botas de Velocidade",
    d: "Ação Bônus: Dobra seu deslocamento e impõe desvantagem em ataques contra você por 10 min.",
    r: "Raro", t: "item", att: true
  },
  "Botas Aladas": {
    n: "Botas Aladas",
    d: "Você tem um deslocamento de voo igual ao seu deslocamento de caminhada (máx 4 horas).",
    r: "Incomum", t: "item", att: true
  },
  "Botas de Caminhar e Saltar": {
    n: "Botas de Caminhar e Saltar",
    d: "Seu deslocamento de caminhada aumenta em 3m e sua distância de salto é triplicada.",
    r: "Incomum", t: "item", att: true,
    eff: [{ type: 'speed', value: 3 }]
  },
  "Manto de Invisibilidade": {
    n: "Manto de Invisibilidade",
    d: "Use uma ação para ficar invisível por até 2 horas.",
    r: "Lendário", t: "item", att: true
  },
  "Cajado do Poder": {
    n: "Cajado do Poder",
    d: "+2 no ataque/dano, CA e testes de resistência. Possui 20 cargas para magias.",
    r: "Muito Raro", t: "item", att: true,
    eff: [{ type: 'ac', value: 2 }, { type: 'save', value: 2 }, { type: 'attack', value: 2 }, { type: 'damage', value: 2 }]
  },
  "Varinha de Mísseis Mágicos": {
    n: "Varinha de Mísseis Mágicos",
    d: "Lança Mísseis Mágicos gastando cargas (7 cargas).",
    r: "Incomum", t: "item"
  },
  "Pérola de Poder": {
    n: "Pérola de Poder",
    d: "Recupera um espaço de magia gasto de até 3º nível (1x/dia).",
    r: "Incomum", t: "item", att: true
  },
  "Espada Vorpal": {
    n: "Espada Vorpal",
    d: "+3 de ataque/dano. Em um 20 natural, você corta a cabeça da criatura.",
    r: "Lendário", t: "arma", att: true,
    eff: [{ type: 'attack', value: 3 }, { type: 'damage', value: 3 }]
  },
  "Vingadora Sagrada": {
    n: "Vingadora Sagrada",
    d: "+3 de ataque/dano. +2d10 radiante contra mortos-vivos/ínferos. Aura de vantagem em Saves contra magia.",
    r: "Lendário", t: "arma", att: true,
    eff: [{ type: 'attack', value: 3 }, { type: 'damage', value: 3 }]
  },
  "Arco do Juramento": {
    n: "Arco do Juramento",
    d: "Quando você atira, pode dizer 'Morte aos meus inimigos'. Ganha vantagem e +3d6 de dano contra o alvo.",
    r: "Muito Raro", t: "arma", att: true
  },
  "Armadura de Placas de Anão": {
    n: "Armadura de Placas de Anão",
    d: "+2 de bônus na CA. Você pode reduzir empurrões em 3 metros.",
    r: "Muito Raro", t: "armadura",
    eff: [{ type: 'ac', value: 2 }]
  },
  "Robo do Arquimago": {
    n: "Robo do Arquimago",
    d: "Se não usar armadura, CA base é 15+Des. Vantagem em Saves contra magia e CD de magia aumenta em 2.",
    r: "Lendário", t: "item", att: true,
    eff: [{ type: 'ac', value: 5 }]
  },
  "Mochila de Carga (Bag of Holding)": {
    n: "Mochila de Carga (Bag of Holding)",
    d: "Espaço dimensional que carrega até 250kg, mas sempre pesa 7kg.",
    r: "Incomum", t: "item"
  },
  "Espada +1": { n: "Espada +1", d: "+1 bônus mágico.", r: "Incomum", t: "arma", eff: [{ type: 'attack', value: 1 }, { type: 'damage', value: 1 }] },
  "Espada +2": { n: "Espada +2", d: "+2 bônus mágico.", r: "Raro", t: "arma", eff: [{ type: 'attack', value: 2 }, { type: 'damage', value: 2 }] },
  "Espada +3": { n: "Espada +3", d: "+3 bônus mágico.", r: "Muito Raro", t: "arma", eff: [{ type: 'attack', value: 3 }, { type: 'damage', value: 3 }] },
  "Armadura +1": { n: "Armadura +1", d: "+1 bônus mágico na CA.", r: "Raro", t: "armadura", eff: [{ type: 'ac', value: 1 }] },
  "Armadura +2": { n: "Armadura +2", d: "+2 bônus mágico na CA.", r: "Muito Raro", t: "armadura", eff: [{ type: 'ac', value: 2 }] },
  "Escudo +1": { n: "Escudo +1", d: "+1 bônus mágico na CA.", r: "Incomum", t: "escudo", eff: [{ type: 'ac', value: 1 }] },
  "Escudo +2": { n: "Escudo +2", d: "+2 bônus mágico na CA.", r: "Raro", t: "escudo", eff: [{ type: 'ac', value: 2 }] },
  "Anel de Armazenar Magia": {
    n: "Anel de Armazenar Magia",
    d: "Pode armazenar até 5 níveis de magias conjuradas nele para uso posterior.",
    r: "Raro", t: "item", att: true
  },
  "Iscas de Dragão": {
    n: "Iscas de Dragão (Dragon Slayer)",
    d: "+1 de ataque/dano. Contra dragões, causa +3d6 de dano extra.",
    r: "Raro", t: "arma"
  },
  "Anel de Invisibilidade": {
    n: "Anel de Invisibilidade",
    d: "Enquanto usar este anel, você pode ficar invisível como uma ação. Qualquer coisa que você esteja vestindo ou carregando fica invisível com você.",
    r: "Lendário", t: "item", att: true
  },
  "Capa do Morcego": {
    n: "Capa do Morcego",
    d: "Vantagem em testes de Furtividade. Em penumbra ou escuridão, você tem deslocamento de voo de 12m.",
    r: "Raro", t: "item", att: true
  },
  "Varinha de Bolas de Fogo": {
    n: "Varinha de Bolas de Fogo",
    d: "Possui 7 cargas. Você pode usar uma ação para gastar 1 carga e conjurar Bola de Fogo (CD 15).",
    r: "Raro", t: "item", att: true
  },
  "Botas de Transposição": {
    n: "Botas de Transposição",
    d: "Como uma ação bônus, você pode se teletransportar até 9 metros para um espaço desocupado que possa ver.",
    r: "Raro", t: "item", att: true
  },
  "Escudo do Guardião": {
    n: "Escudo do Guardião",
    d: "Enquanto segura este escudo, você ganha +2 de bônus na iniciativa e não pode ser surpreendido.",
    r: "Incomum", t: "escudo", att: true
  },
  "Broche de Escudo": {
    n: "Broche de Escudo",
    d: "Você tem resistência a dano de força e é imune à magia Mísseis Mágicos.",
    r: "Incomum", t: "item", att: true
  },
  "Capa de Elvenkind": {
    n: "Capa de Elvenkind",
    d: "Enquanto estiver com o capuz levantado, testes de Percepção para ver você têm desvantagem, e você tem vantagem em testes de Furtividade.",
    r: "Incomum", t: "item", att: true
  }
};

export const BACKGROUND_STARTING_EQUIPMENT: Record<string, { items: string[], gold: number }> = {
  'Acólito': { items: ['Símbolo Sagrado', 'Livro de Orações', 'Varetas de Incenso (x5)', 'Vestes', 'Roupas Comuns'], gold: 15 },
  'Artesão de Guilda': { items: ['Ferramentas de Artesão', 'Carta de Recomendação', 'Roupas de Viagem'], gold: 15 },
  'Artista': { items: ['Instrumento Musical', 'Admirador Secreto', 'Fantasia'], gold: 15 },
  'Charlatão': { items: ['Roupas Finas', 'Kit de Falsificação'], gold: 15 },
  'Criminoso': { items: ['Pé de Cabra', 'Roupas Comuns Escuras'], gold: 15 },
  'Eremita': { items: ['Estojo de Manuscrito', 'Cobertor', 'Roupas Comuns', 'Kit de Herbalismo'], gold: 5 },
  'Forasteiro': { items: ['Bordão', 'Armadilha de Caça', 'Troféu de Animal', 'Roupas de Viagem'], gold: 10 },
  'Herói do Povo': { items: ['Ferramentas de Artesão', 'Pá', 'Pote de Ferro', 'Roupas Comuns'], gold: 10 },
  'Marinheiro': { items: ['Porrete (Club)', 'Corda de Seda (15m)', 'Amuleto da Sorte', 'Roupas Comuns'], gold: 10 },
  'Nobre': { items: ['Roupas Finas', 'Anel de Sinete', 'Pergaminho de Linhagem'], gold: 25 },
  'Órfão': { items: ['Faca Pequena', 'Mapa da Cidade', 'Camundongo de Estimação', 'Amuleto de Conforto', 'Roupas Comuns'], gold: 10 },
  'Sábio': { items: ['Vidro de Tinta Preta', 'Pena de Escrita', 'Faca Pequena', 'Carta de um Amigo Morto', 'Roupas Comuns'], gold: 10 },
  'Soldado': { items: ['Insígnia de Patente', 'Troféu', 'Conjunto de Dados ou Cartas', 'Roupas Comuns'], gold: 10 }
};

export const SHOP_ITEMS = [
  { cat: 'Armas Simples', items: [
      { n: 'Adaga', c: 2, w: '0.5kg', d: '1d4 perfurante | Acuidade, Leve, Arremesso (6/18)' },
      { n: 'Azagaia', c: 0.5, w: '1kg', d: '1d6 perfurante | Arremesso (9/36)' },
      { n: 'Bordão', c: 0.2, w: '2kg', d: '1d6 concussão | Versátil (1d8)' },
      { n: 'Clava', c: 0.1, w: '1kg', d: '1d4 concussão | Leve' },
      { n: 'Lança', c: 1, w: '1.5kg', d: '1d6 perfurante | Arremesso (6/18), Versátil (1d8)' },
      { n: 'Maça', c: 5, w: '2kg', d: '1d6 concussão' },
      { n: 'Arco Curto', c: 25, w: '1kg', d: '1d6 perfurante | Munição (24/96), Duas Mãos' },
      { n: 'Besta Leve', c: 25, w: '2.5kg', d: '1d8 perfurante | Munição (24/96), Recarga, Duas Mãos' },
  ]},
  { cat: 'Armas Marciais', items: [
      { n: 'Espada Curta', c: 10, w: '1kg', d: '1d6 perfurante | Acuidade, Leve' },
      { n: 'Espada Longa', c: 15, w: '1.5kg', d: '1d8 cortante | Versátil (1d10)' },
      { n: 'Rapieira', c: 25, w: '1kg', d: '1d8 perfurante | Acuidade' },
      { n: 'Cimitarra', c: 25, w: '1.5kg', d: '1d6 cortante | Acuidade, Leve' },
      { n: 'Machado Grande', c: 30, w: '3.5kg', d: '1d12 cortante | Pesada, Duas Mãos' },
      { n: 'Espada Grande', c: 50, w: '3kg', d: '2d6 cortante | Pesada, Duas Mãos' },
      { n: 'Alabarda', c: 20, w: '3kg', d: '1d10 cortante | Pesada, Alcance, Duas Mãos' },
      { n: 'Martelo de Guerra', c: 15, w: '1kg', d: '1d8 concussão | Versátil (1d10)' },
      { n: 'Arco Longo', c: 50, w: '1kg', d: '1d8 perfurante | Munição (45/180), Pesada, Duas Mãos' },
      { n: 'Besta Pesada', c: 50, w: '8kg', d: '1d10 perfurante | Munição (30/120), Recarga, Pesada, Duas Mãos' },
  ]},
  { cat: 'Armaduras & Escudos', items: [
      { n: 'Padded (Acolchoada)', c: 5, w: '4kg', d: 'CA 11 + Mod. Des | Desvantagem Furtividade' },
      { n: 'Couro', c: 10, w: '5kg', d: 'CA 11 + Mod. Des' },
      { n: 'Couro Batido', c: 45, w: '6.5kg', d: 'CA 12 + Mod. Des' },
      { n: 'Camisão de Malha', c: 50, w: '10kg', d: 'CA 13 + Mod. Des (máx 2)' },
      { n: 'Peitoral', c: 400, w: '10kg', d: 'CA 14 + Mod. Des (máx 2)' },
      { n: 'Meia-Armadura', c: 750, w: '20kg', d: 'CA 15 + Mod. Des (máx 2) | Desvan. Furtividade' },
      { n: 'Cota de Malha', c: 75, w: '27.5kg', d: 'CA 16 | Requer FOR 13, Desvan. Furtividade' },
      { n: 'Cota de Talas', c: 200, w: '30kg', d: 'CA 17 | Requer FOR 15, Desvan. Furtividade' },
      { n: 'Placas', c: 1500, w: '32.5kg', d: 'CA 18 | Requer FOR 15, Desvan. Furtividade' },
      { n: 'Escudo', c: 10, w: '3kg', d: '+2 na CA' },
  ]},
  { cat: 'Consumíveis', items: [
      { n: 'Poção de Cura', c: 50, w: '0.5kg', d: 'Recupera 2d4+2 PV.' },
      { n: 'Poção de Cura Maior', c: 150, w: '0.5kg', d: 'Recupera 4d4+4 PV.' },
      { n: 'Poção de Cura Superior', c: 450, w: '0.5kg', d: 'Recupera 8d4+8 PV.' },
      { n: 'Água Benta', c: 25, w: '0.5kg', d: 'Dano radiante contra ínferos/mortos-vivos.' },
      { n: 'Fogo de Alquimista', c: 50, w: '0.5kg', d: 'Provoca dano de fogo em cada turno.' },
      { n: 'Antídoto', c: 50, w: '0.5kg', d: 'Cura venenos comuns.' },
  ]},
  { cat: 'Suprimentos & Ferramentas', items: [
      { n: 'Mochila', c: 2, w: '2.5kg', d: 'Capacidade de carga de 15kg.' },
      { n: 'Ferramentas de Ladrão', c: 25, w: '0.5kg', d: 'Usado para abrir fechaduras e desarmar armadilhas.' },
      { n: 'Kit de Primeiros Socorros', c: 5, w: '1.5kg', d: 'Estabiliza criatura moribunda sem teste de Medicina (10 usos).' },
      { n: 'Corda de Seda (15m)', c: 10, w: '2.5kg', d: 'Suporta 500kg.' },
      { n: 'Tocha', c: 0.01, w: '0.5kg', d: 'Luz por 1 hora (6m brilhante, 6m penumbra).' },
      { n: 'Ração de Viagem (1 dia)', c: 0.5, w: '1kg', d: 'Comida seca e durável.' },
      { n: 'Algemas', c: 2, w: '1kg', d: 'CD 20 Destreza ou Força para escapar.' },
      { n: 'Pé de Cabra', c: 2, w: '2.5kg', d: 'Vantagem em testes de Força para abrir objetos.' },
      { n: 'Funda', c: 0.1, w: '0kg', d: '1d4 concussão | Arremesso (9/36).' },
      { n: 'Flechas (20)', c: 1, w: '1kg', d: 'Munição para arco.' },
      { n: 'Virotes (20)', c: 1, w: '1.5kg', d: 'Munição para besta.' },
  ]},
  { cat: 'Itens Mágicos Comuns', items: [
      { n: 'Espada +1', c: 500, w: '1.5kg', d: 'Arma Mágica | +1 bônus de ataque/dano', isMagic: true },
      { n: 'Escudo +1', c: 300, w: '3kg', d: 'Escudo Mágico | +1 CA adicional', isMagic: true },
      { n: 'Capa de Proteção', c: 400, w: '0.5kg', d: 'Aumenta CA e Saves em +1 | (Requer Sintonia)', isMagic: true },
      { n: 'Manoplas de Força do Ogro', c: 500, w: '1kg', d: 'Sua Força torna-se 19 | (Requer Sintonia)', isMagic: true },
      { n: 'Mochila de Carga', c: 500, w: '7kg', d: 'Carrega até 250kg sem pesar.', isMagic: true },
      { n: 'Varinha de Mísseis Mágicos', c: 600, w: '0.5kg', d: 'Lança Mísseis Mágicos sem gastar mana.', isMagic: true },
      { n: 'Anel de Sopro de Água', c: 400, w: '0.1kg', d: 'Permite respirar debaixo d\'água.', isMagic: true },
      { n: 'Botas de Caminhar e Saltar', c: 500, w: '1kg', d: 'Triplica distância de salto e +3m de movimento | (Requer Sintonia)', isMagic: true },
  ]}
];

export const FIGHTING_STYLES: Record<string, string> = {
  "Arquearia": "+2 de bônus nas jogadas de ataque com armas de distância.",
  "Defesa": "+1 na CA enquanto estiver usando armadura.",
  "Duelismo": "+2 de bônus nas jogadas de dano com armas de uma mão.",
  "Combate com Grandes Armas": "Role novamente resultados 1 ou 2 nos dados de dano (deve usar o novo resultado).",
  "Proteção": "Reação para impor desvantagem no ataque contra aliado próximo usando seu escudo.",
  "Combate com Duas Armas": "Soma o bônus de atributo no dano do segundo ataque.",
  "Observação (Blind Fighting)": "Visão cega em um raio de 3 metros.",
  "Técnica Superior": "Ganha uma manobra de Mestre de Batalha e um dado de superioridade d6."
};


export const RACE_FEATURES: Record<string, Record<number, string[]>> = {
  'Draconato (Cromo)': { 1: ['Sopro Dracônico', 'Resistência Dracônica'], 5: ['Sopro Dracônico (Escala 1)'], 11: ['Sopro Dracônico (Escala 2)'] },
  'Draconato (Metal)': { 1: ['Sopro Dracônico', 'Resistência Dracônica'], 5: ['Sopro Dracônico (Escala 1)', 'Segundo Sopro (Controle)'], 11: ['Sopro Dracônico (Escala 2)'] },
  'Elfo Negro (Drow)': { 1: ['Visão no Escuro Superior', 'Sensibilidade à Luz Solar', 'Globos de Luz'], 3: ['Fogo das Fadas (Drow)'], 5: ['Escuridão (Drow)'] },
  'Anão Cinzento (Duergar)': { 1: ['Visão no Escuro Superior', 'Resiliência Duergar', 'Sensibilidade à Luz Solar'], 3: ['Aumentar/Reduzir (Duergar)'], 5: ['Invisibilidade (Duergar)'] },
  'Tiefling': { 1: ['Taumaturgia'], 3: ['Repreensão Infernal'], 5: ['Escuridão'] },
  'Tiefling Feral': { 1: ['Taumaturgia'], 3: ['Repreensão Infernal'], 5: ['Escuridão'] },
  'Tiefling Devil Tongue': { 1: ['Zombaria Viciosa'], 3: ['Enfeitiçar Pessoa'], 5: ['Cativar'] },
  'Genasi (Ar)': { 1: ['Toque Chocante'], 3: ['Queda Suave'], 5: ['Levitar'] },
  'Genasi (Água)': { 1: ['Espirro Ácido'], 3: ['Criar ou Destruir Água'], 5: ['Caminhar nas Águas'] },
  'Genasi (Fogo)': { 1: ['Produzir Chama'], 3: ['Mãos Ardentes'], 5: ['Esfera Flamejante'] },
  'Genasi (Terra)': { 1: ['Proteção contra Lâminas (Bônus)'], 5: ['Passos sem Pegadas'] },
  'Githyanki': { 1: ['Mãos Mágicas (Psiônico)'], 3: ['Salto'], 5: ['Passo Nebuloso'] },
  'Githzerai': { 1: ['Mãos Mágicas (Psiônico)'], 3: ['Escudo Arcano'], 5: ['Detectar Pensamentos'] },
  'Aasimar Protetor': { 1: ['Luz', 'Mãos Curadoras'], 3: ['Alma Radiante'] },
  'Aasimar Flagelo': { 1: ['Luz', 'Mãos Curadoras'], 3: ['Consumo Radiante'] },
  'Aasimar Caído': { 1: ['Luz', 'Mãos Curadoras'], 3: ['Sudário Necrótico'] },
  'Fada': { 1: ['Druidismo'], 3: ['Fogo das Fadas'], 5: ['Aumentar/Reduzir'] },
  'Yuan-ti Puro-Sangue': { 1: ['Amizade com Animais (Sempre Serpentes)', 'Picada de Veneno'], 3: ['Sugestão'] },
  'Gnomo das Profundezas': { 3: ['Disfarçar-se', 'Dificultar Detecção'], 5: ['Borrão'] },
  'Aarakocra': { 5: ['Lufada de Vento (Aarakocra)'] },
  'Tritão': { 1: ['Moldar Água'], 3: ['Criar ou Destruir Água'], 5: ['Muralha de Água'] },
  'Eladrin': { 1: ['Passo Feérico'], 3: ['Passo Feérico (Efeito de Estação)'] },
  'Shadar-kai': { 1: ['Bênção da Rainha Corvo (Teleporte)'], 3: ['Bênção da Rainha Corvo (Resistência)'] },
  'Hobgoblin': { 3: ['Dádiva da Fartura (Melhorada)'] },
  'Elfo Alto': { 1: ['Truque de Mago Extra'], 5: ['Dano de Truque Escala (Nv 5)'], 11: ['Dano de Truque Escala (Nv 11)'] },
  'Anão da Colina': { 1: ['Robustez de Colina (+1 PV/Nível)'] }
};

export const SUBCLASS_FEATURES: Record<string, Record<number, string[]>> = {
  // --- Bárbaro ---
  'Caminho do Furioso': { 3: ['Frenesi'], 6: ['Fúria Inabalável'], 10: ['Presença Intimidadora'], 14: ['Retaliação'] },
  'Caminho do Guerreiro Totêmico': { 3: ['Espírito Totêmico', 'Buscador Espiritual'], 6: ['Aspecto da Besta'], 10: ['Caminhante Espiritual'], 14: ['Sintonia Totêmica'] },
  'Caminho do Guardião Ancestral': { 3: ['Protetores Ancestrais'], 6: ['Escudo Espiritual'], 10: ['Consultar os Antepassados'], 14: ['Ancestrais Vingativos'] },
  'Caminho do Arauto da Tempestade': { 3: ['Aura de Tempestade'], 6: ['Alma da Tempestade'], 10: ['Escudo da Tempestade'], 14: ['Tempestade Furiosa'] },
  'Caminho do Zelote': { 3: ['Fúria Divina', 'Guerreiro dos Deuses'], 6: ['Foco Fanático'], 10: ['Presença Fanática'], 14: ['Fúria Além da Morte'] },
  'Caminho da Besta': { 3: ['Forma da Besta'], 6: ['Alma Bestial'], 10: ['Doença Infecciosa'], 14: ['Chamado da Caça'] },
  'Caminho da Magia Selvagem': { 3: ['Consciência Mágica', 'Surto Selvagem'], 6: ['Infusão Fortalecedora'], 10: ['Reação Instável'], 14: ['Surto Controlado'] },

  // --- Monge ---
  'Caminho da Mão Aberta': { 3: ['Técnica da Mão Aberta'], 6: ['Integridade Corporal'], 11: ['Tranquilidade'], 17: ['Palma Vibrante'] },
  'Caminho das Sombras': { 3: ['Artes das Sombras'], 6: ['Passo das Sombras'], 11: ['Invisibilidade das Sombras'], 17: ['Oportunista'] },
  'Caminho dos Quatro Elementos': { 3: ['Discípulo dos Elementos'] },
  'Caminho da Alma Radiante': { 3: ['Parafuso de Sol Radiante'], 6: ['Golpe de Arco Searing'], 11: ['Explosão Solar Searing'], 17: ['Escudo Solar'] },
  'Caminho da Misericórdia': { 3: ['Implementos de Misericórdia', 'Mão da Cura', 'Mão do Dano'], 6: ['Toque de Cura'], 11: ['Cura de Rajada'], 17: ['Mão da Misericórdia Suprema'] },
  'Caminho do Eu Astral': { 3: ['Braços do Eu Astral'], 6: ['Visagem do Eu Astral'], 11: ['Corpo do Eu Astral'], 17: ['Eu Astral Desperto'] },
  'Caminho Kensei': { 3: ['Caminho do Kensei (Defesa Ágil/Disparo)'], 6: ['Lâminas Mágicas de Kensei', 'Golpe Preciso'], 11: ['Afiar a Lâmina'], 17: ['Precisão de Unerring'] },

  // --- Guerreiro ---
  'Campeão': { 3: ['Crítico Melhorado'], 7: ['Atleta Notável'], 10: ['Estilo de Luta Adicional'], 15: ['Crítico Superior'], 18: ['Sobrevivente'] },
  'Mestre de Batalha': { 3: ['Superioridade em Combate', 'Estudante da Guerra'], 7: ['Conheça seu Inimigo'], 10: ['Superioridade em Combate Melhorada'], 15: ['Implacável'], 18: ['Superioridade em Combate Melhorada (d12)'] },
  'Cavaleiro Arcano': { 3: ['Conjuração', 'Vínculo com Arma'], 7: ['Magia de Guerra'], 10: ['Golpe Místico'], 15: ['Investida Arcana'], 18: ['Magia de Guerra Melhorada'] },
  'Cavaleiro': { 3: ['Proficiência Adicional', 'Desafiar nascido na Sela', 'Marca Inabalável'], 7: ['Manobra de Defesa'], 10: ['Guardião Incansável'], 15: ['Investida Feroz'], 18: ['Defensor Vigilante'] },
  'Arqueiro Arcano': { 3: ['Lore do Arqueiro Arcano', 'Tiro Arcano'], 7: ['Flecha Mágica', 'Tiro Curvado'], 15: ['Tiro Sempre Pronto'], 18: ['Opções de Tiro Arcano (Melhora)'] },
  'Samurai': { 3: ['Proficiência Adicional', 'Espírito de Luta'], 7: ['Cortesão Elegante'], 10: ['Espírito Incansável'], 15: ['Ataque Rápido'], 18: ['Força Antes da Morte'] },
  'Guerreiro Psíquico': { 3: ['Poder Psiônico'], 7: ['Salto Telecinético'], 10: ['Mente Guardada'], 15: ['Baluarte Psiônico'], 18: ['Mestre da Telecinésia'] },
  'Cavaleiro Rúnico': { 3: ['Proficiência em Ferramentas (Rúnico)', 'Entalhador de Runas', 'Might do Gigante'], 7: ['Escudo Rúnico'], 10: ['Grande Estatura'], 15: ['Mestre das Runas'], 18: ['Juggernaut Rúnico'] },

  // --- Ladino ---
  'Assassino': { 3: ['Proficiências Adicionais (Assassino)', 'Assassinato'], 9: ['Infiltração Especialista'], 13: ['Impostor'], 17: ['Golpe Mortal'] },
  'Ladrão': { 3: ['Mãos Rápidas', 'Atleta de Telhado'], 9: ['Furtividade Suprema'], 13: ['Usar Item Mágico'], 17: ['Reflexos de Ladrão'] },
  'Trapaceiro Arcano': { 3: ['Conjuração (Trapaceiro)', 'Mãos Mágicas Versáteis'], 9: ['Emboscada Mágica'], 13: ['Trapaceiro Versátil'], 17: ['Ladrão de Magia'] },
  'Inquisitivo': { 3: ['Ouvido para o Engano', 'Olho para Detalhes', 'Luta Perspicaz'], 9: ['Olhar Firme'], 13: ['Mestre da Especulação'], 17: ['Olho do Exterminador'] },
  'Fanfarrão': { 3: ['Passos Arrojados', 'Audácia Panache'], 9: ['Panache'], 13: ['Elegância Elegante'], 17: ['Mestre Duelista'] },
  'Mestre de Estratégia': { 3: ['Mestre da Intriga', 'Mestre de Táticas'], 9: ['Perspicácia do Manipulador'], 13: ['Desvio de Atenção'], 17: ['Mente de Aço'] },
  'Fantasma': { 3: ['Sussurros dos Mortos', 'Lamentos do Túmulo'], 9: ['Tokens dos Partidos'], 13: ['Caminho Fantasmagórico'], 17: ['Amigo da Morte'] },
  'Lâmina Psíquica': { 3: ['Poder Psiônico (Lâmina)', 'Lâminas Psíquicas'], 9: ['Lâminas Teleguiadas', 'Passo Psíquico'], 13: ['Véu Psíquico'], 17: ['Rendição Mental'] },
  'Batedor': { 3: ['Escaramuça', 'Sobrevivencialista'], 9: ['Mobilidade Superior'], 13: ['Emboscada'], 17: ['Ataque Súbito'] },

  // --- Patrulheiro ---
  'Caçador': { 3: ['Presa do Caçador'], 7: ['Táticas Defensivas'], 11: ['Ataque Múltiplo'], 15: ['Defesa de Caçador Superior'] },
  'Mestre das Bestas': { 3: ['Companheiro do Patrulheiro'], 7: ['Treinamento Excepcional'], 11: ['Frenesi Bestial'], 15: ['Compartilhar Magias'] },
  'Perseguidor Sombrio': { 3: ['Emboscador Temível', 'Visão Umbral'], 7: ['Mente de Ferro'], 11: ['Rajada do Conjurador'], 15: ['Esquiva Sombria'] },
  'Andarilho do Horizonte': { 3: ['Sentido Planar', 'Guerreiro Planar'], 7: ['Passo Etéreo'], 11: ['Caminho Distante'], 15: ['Defesa Espectral'] },
  'Matador de Monstros': { 3: ['Sentido do Caçador', 'Presa do Matador'], 7: ['Defesa Sobrenatural'], 11: ['Nêmesis do Conjurador'], 15: ['Contra-Ataque do Matador'] },
  'Andarilho das Fadas': { 3: ['Glamour Extraplanar', 'Alegria Terrível'], 7: ['Distorção Sedutora'], 11: ['Passo Selvagem Feérico'], 15: ['Presença Nebulosa'] },
  'Guardião do Enxame': { 3: ['Enxame Reunido', 'Magias do Guardião do Enxame'], 7: ['Maré Giratória'], 11: ['Enxame Poderoso'], 15: ['Dispersão em Enxame'] },
  'Guardião de Dragão': { 3: ['Dádiva Dracônica', 'Companheiro Dracônico'], 7: ['Vínculo de Presas e Escamas'], 11: ['Sopro do Dragão'], 15: ['Vínculo Perfeito'] },

  // --- Druida ---
  'Círculo da Terra': { 2: ['Truque Adicional (Druida Terra)', 'Recuperação Natural', 'Magias de Círculo (Terra)'], 6: ['Caminho da Floresta'], 10: ['Proteção da Natureza'], 14: ['Santuário da Natureza'] },
  'Círculo da Lua': { 2: ['Forma de Combate', 'Formas de Círculo'], 6: ['Golpes Primordiais'], 10: ['Forma Selvagem Elemental'], 14: ['Mil Formas'] },
  'Círculo dos Sonhos': { 2: ['Bálsamo da Corte de Verão'], 6: ['Lareira de Luar e Sombras'], 11: ['Caminho Oculto'], 14: ['Andarilho dos Sonhos'] },
  'Círculo do Pastor': { 2: ['Fala da Floresta', 'Totem Espiritual'], 6: ['Invocador Poderoso'], 10: ['Espírito Guardião'], 14: ['Fiel às Fadas'] },
  'Círculo dos Esporos': { 2: ['Halo de Esporos', 'Entidade Simbiótica'], 6: ['Infestação Fúngica'], 10: ['Esporos Propagadores'], 14: ['Corpo Fúngico'] },
  'Círculo das Estrelas': { 2: ['Mapa Estelar', 'Forma Estelar'], 6: ['Presságio Cósmico'], 10: ['Constelação Cintilante'], 14: ['Estrela Plena'] },
  'Círculo do Fogo Selvagem': { 2: ['Invocar Espírito do Fogo Selvagem'], 6: ['Vínculo Aprimorado'], 10: ['Chamas Revigorantes'], 14: ['Fênix Flamejante'] },

  // --- Paladino ---
  'Juramento de Devoção': { 3: ['Arma Sagrada', 'Expulsar o Profano'], 7: ['Aura de Devoção'], 15: ['Pureza de Espírito'], 20: ['Halo Sagrado'] },
  'Juramento dos Anciões': { 3: ['Ira da Natureza', 'Expulsar o Infiel'], 7: ['Aura de Sentinela'], 15: ['Sentinela Imortal'], 20: ['Campeão Antigo'] },
  'Juramento de Vingança': { 3: ['Abjurar Inimigo', 'Voto de Enimizade'], 7: ['Perseguidor Implacável'], 15: ['Alma de Vingança'], 20: ['Anjo da Vingança'] },
  'Juramento da Conquista': { 3: ['Presença Conquistadora', 'Golpe Guiado'], 7: ['Aura de Conquista'], 15: ['Reprimenda Desdenhosa'], 20: ['Invencível Conquistador'] },
  'Juramento da Redenção': { 3: ['Emissário da Paz', 'Revidar com Justiça'], 7: ['Aura do Guardião'], 15: ['Espírito Protetor'], 20: ['Emissário da Redenção'] },
  'Juramento da Glória': { 3: ['Atleta Incomparável', 'Golpe Inspirador'], 7: ['Aura de Alacridade'], 15: ['Defesa Gloriosa'], 20: ['Lenda Viva'] },
  'Juramento da Vigilância': { 3: ['Vontade do Vigilante', 'Abjurar o Extraplanar'], 7: ['Aura de Sentinela (Vigilante)'], 15: ['Rebate Vigilante'], 20: ['Baluarte Mortal'] },

  // --- Clérigo ---
  'Domínio do Conhecimento': { 1: ['Bênçãos do Conhecimento'], 2: ['Conhecimento das Eras'], 6: ['Ler Pensamentos'], 8: ['Conjuração Potente'], 17: ['Visões do Passado'] },
  'Domínio da Vida': { 1: ['Discípulo da Vida', 'Proficiência em Armadura Pesada'], 2: ['Preservar a Vida'], 6: ['Cura Abençoada'], 8: ['Golpe Divino'], 17: ['Cura Suprema'] },
  'Domínio da Luz': { 1: ['Truque de Luz', 'Lampejo de Proteção'], 2: ['Resplendor do Amanhecer'], 6: ['Lampejo Melhorado'], 8: ['Conjuração Potente'], 17: ['Corona de Luz'] },
  'Domínio da Natureza': { 1: ['Acólito da Natureza', 'Proficiência em Armadura Pesada (Clérigo)'], 2: ['Enfeitiçar Animais e Plantas'], 6: ['Amortecer Elementos'], 8: ['Golpe Divino'], 17: ['Mestre da Natureza'] },
  'Domínio da Tempestade': { 1: ['Proficiência em Armas/Armaduras Guerreiro', 'Ira da Tempestade'], 2: ['Ira Destrutiva'], 6: ['Golpe de Relâmpago'], 8: ['Golpe Divino'], 17: ['Nascido na Tempestade'] },
  'Domínio da Trapaça': { 1: ['Bênção do Trapaceiro'], 2: ['Invocar Duplicata'], 6: ['Manto de Sombras'], 8: ['Golpe Divino'], 17: ['Duplicata Melhorada'] },
  'Domínio da Guerra': { 1: ['Proficiência em Armas/Armaduras Guerreiro', 'Sacerdote da Guerra'], 2: ['Ataque Guiado'], 6: ['Bênção do Deus da Guerra'], 8: ['Golpe Divino'], 17: ['Avatar da Guerra'] },
  'Domínio da Ordem': { 1: ['Voz da Autoridade'], 2: ['Demanda da Ordem'], 6: ['Corporificação da Lei'], 8: ['Golpe Divino'], 17: ['Ira da Ordem'] },
  'Domínio da Forja': { 1: ['Bênção da Forja'], 2: ['Bênção do Artesão'], 6: ['Alma da Forja'], 8: ['Golpe Divino'], 17: ['Santo da Forja e Fogo'] },
  'Domínio do Crepúsculo': { 1: ['Olhos da Noite (Clérigo)', 'Bênção da Vigilância (Clérigo)'], 2: ['Santuário do Crepúsculo'], 6: ['Passos da Noite'], 8: ['Golpe Divino'], 17: ['Mortalha do Crepúsculo'] },

  // --- Mago ---
  'Abjuração': { 2: ['Ward Arcano'], 6: ['Ward Projetado'], 10: ['Abjuração Aprimorada'], 14: ['Resistência a Magia'] },
  'Conjuração': { 2: ['Conjuração Menor'], 6: ['Transposição Benigna'], 10: ['Conjuração Focada'], 14: ['Invocações Duráveis'] },
  'Divinação': { 2: ['Portento'], 6: ['Especialista em Divinação'], 10: ['O Terceiro Olho'], 14: ['Portento Maior'] },
  'Encantamento': { 2: ['Hipnotismo Hipnótico'], 6: ['Encantamento Instintivo'], 10: ['Encantamento Dividido'], 14: ['Alterar Memórias'] },
  'Evocação': { 2: ['Esculpir Magias'], 6: ['Truque Potente'], 10: ['Evocação Potencializada'], 14: ['Sobrecarga'] },
  'Ilusão': { 2: ['Ilusão Menor Aprimorada'], 6: ['Ilusões Maleáveis'], 10: ['Auto-Ilusão'], 14: ['Realidade Ilusória'] },
  'Necromancia': { 2: ['Colheita Sombria'], 6: ['Servos Mortos-Vivos'], 10: ['Inured to Undead'], 14: ['Comandar Mortos-Vivos'] },
  'Transmutação': { 2: ['Alquimia Menor'], 6: ['Pedra do Transmutador'], 10: ['Metamorfo'], 14: ['Mestre Transmutador'] },
  'Magia de Guerra': { 2: ['Defesa Arcana', 'Inteligência Tática'], 6: ['Surto de Poder'], 10: ['Defesa Durável'], 14: ['Mortalha de Poder'] },
  'Cantoria da Lâmina': { 2: ['Cantoria da Lâmina (Habilidade)'], 6: ['Ataque Extra'], 14: ['Canção de Vitória'] },
  'Ordem dos Scribas': { 2: ['Manifestação Mental'], 6: ['Mestre da Escrita'] },

  // --- Feiticeiro ---
  'Linhagem Dracônica': { 1: ['Ancestral Dracônico (Feiticeiro)', 'Resiliência Dracônica (Feiticeiro)'], 6: ['Afinidade Elemental (Feiticeiro)'], 14: ['Asas de Dragão (Feiticeiro)'], 18: ['Presença Dracônica (Feiticeiro)'] },
  'Magia Selvagem': { 1: ['Surto de Magia Selvagem (Feiticeiro)', 'Marés de Caos'], 6: ['Dobrar a Sorte'], 14: ['Caos Controlado'], 18: ['Bombardeio Selvagem'] },
  'Magia da Tempestade': { 1: ['Magia Tempestuosa'], 6: ['Coração da Tempestade', 'Guia da Tempestade'], 14: ['Fúria da Tempestade'], 18: ['Fúria do Vento'] },
  'Alma Favorecida': { 1: ['Favor dos Deuses'], 6: ['Cura Fortalecida'], 14: ['Outras Formas de Asas'], 18: ['Recuperação Inabalável'] },
  'Mente Aberrante': { 1: ['Fala Telepática', 'Magias Psiônicas'], 6: ['Feitiçaria Psiônica'], 14: ['Revelação Psíquica'], 18: ['Fenda de Guerra'] },
  'Feiticeiro de Relógio': { 1: ['Restaurar o Equilíbrio', 'Magias de Relógio'], 6: ['Baluarte de Ordem'], 14: ['Transe da Ordem'], 18: ['Cavalaria do Relógio'] },
  'Sombras': { 1: ['Olhos da Noite (Sombras)', 'Força do Insepulto'], 6: ['Cão de Agouro'], 14: ['Passo das Sombras (Sombras)'], 18: ['Forma de Sombras'] },

  // --- Bardo ---
  'Colégio do Conhecimento': { 3: ['Palavras Cortantes', 'Perícias Adicionais (Bardo)'], 6: ['Segredos Mágicos Adicionais'], 14: ['Perícia Inigualável'] },
  'Colégio da Bravura': { 3: ['Proficiências de Combate (Bardo)', 'Inspiração de Combate'], 6: ['Ataque Extra'], 14: ['Magia de Batalha'] },
  'Colégio do Glamour': { 3: ['Manto de Inspiração', 'Performance Enfeitiçante'], 6: ['Manto de Majestade'], 14: ['Majestade Inquebrável'] },
  'Colégio das Espadas': { 3: ['Proficiências de Combate (Bardo)', 'Floreio de Lâmina', 'Estilo de Luta (Bardo)'], 6: ['Ataque Extra'], 14: ['Mestre de Floreio'] },
  'Colégio dos Sussurros': { 3: ['Lâminas Psíquicas (Bardo)', 'Palavras de Terror'], 6: ['Manto de Sussurros'], 14: ['Conhecimento das Sombras'] },
  'Colégio da Eloquência': { 3: ['Prata de Língua', 'Inspiração Inquietante'], 6: ['Inspiração Inabalável'], 14: ['Oratória Contagiante'] },
  'Colégio da Criação': { 3: ['Nota de Potencial', 'Performance de Criação'], 6: ['Item Animado'], 14: ['Coro da Criação'] },

  // --- Artífice ---
  'Alquimista': { 3: ['Ferramentas de Alquimista', 'Elixir Experimental'], 5: ['Alquimista Atômico'], 9: ['Reagentes Restauradores'], 15: ['Mestre da Química'] },
  'Artilheiro': { 3: ['Ferramentas de Artilheiro', 'Canhão de Proteção'], 5: ['Arma de Fogo Arcana'], 9: ['Canhão Explosivo'], 15: ['Fortaleza Fortificada'] },
  'Armeiro (Armorer)': { 3: ['Ferramentas de Armeiro', 'Armadura Arcana', 'Modelo de Armadura'], 5: ['Ataque Extra'], 9: ['Modificações de Armadura'], 15: ['Armaduras Aperfeiçoadas'] },
  'Ferreiro de Batalha (Battle Smith)': { 3: ['Ferramentas de Ferreiro', 'Defensor de Aço', 'Pronto para a Batalha'], 5: ['Ataque Extra'], 9: ['Choque Arcano'], 15: ['Defensor Aperfeiçoado'] },
};

export const SUBCLASS_SPELLS: Record<string, Record<number, string[]>> = {
  'Domínio da Vida': { 1: ['Bênção', 'Curar Ferimentos'], 3: ['Auxílio', 'Restauração Menor'], 5: ['Revivificar', 'Farol de Esperança'], 7: ['Guardião da Fé', 'Proteção contra Morte'], 9: ['Curar Ferimentos em Massa', 'Reviver os Mortos'] },
  'Domínio da Luz': { 1: ['Fogo das Fadas', 'Mãos Flamejantes'], 3: ['Esfera Flamejante', 'Raio Ardente'], 5: ['Bola de Fogo', 'Luz do Dia'], 7: ['Guardião da Fé', 'Muralha de Fogo'], 9: ['Coluna de Chamas', 'Clarão Destrutivo'] },
  'Juramento de Devoção': { 3: ['Proteção contra o Bem e o Mal', 'Santuário'], 5: ['Zona da Verdade', 'Restauração Menor'], 9: ['Farol de Esperança', 'Dissipar Magia'], 13: ['Liberdade de Movimento', 'Guardião da Fé'], 17: ['Comunhão', 'Coluna de Chamas'] },
  'Alquimista': { 3: ['Palavra Curativa', "Raio Adoecente"], 5: ["Esfera Flamejante", "Restauração Menor"], 9: ["Forma Gasosa", "Palavra Curativa em Massa"], 13: ["Proteção contra a Morte", "Secar"], 17: ["Névoa Mortal", "Restauração Maior"] },
  'Artilheiro': { 3: ["Escudo Arcano", "Onda Trovejante"], 5: ["Raio Ardente", "Despedaçar"], 9: ["Bola de Fogo", "Muralha de Vento"], 13: ["Tempestade de Gelo", "Muralha de Fogo"], 17: ["Cone de Frio", "Muralha de Força"] },
  'Armeiro (Armorer)': { 3: ["Mísseis Mágicos", "Onda Trovejante"], 5: ["Reflexos", "Despedaçar"], 9: ["Relâmpago", "Pele de Pedra"], 13: ["Muralha de Fogo", "Invisibilidade Maior"], 17: ["Passo Distante", "Muralha de Força"] },
  'Ferreiro de Batalha (Battle Smith)': { 3: ["Heroísmo", "Escudo Arcano"], 5: ["Marca da Punição", "Vínculo Protetor"], 9: ["Aura de Vitalidade", "Conjurar Barragem"], 13: ["Aura de Pureza", "Escudo de Fogo"], 17: ["Banimento", "Curar Ferimentos em Massa"] },
  'Domínio da Guerra': { 1: ['Favor Divino', 'Escudo da Fé'], 3: ['Arma Mágica', 'Arma Espiritual'], 5: ['Manto do Cruzado', 'Espíritos Guardiões'], 7: ['Libertar', 'Pele de Pedra'], 9: ['Coluna de Chamas', 'Imobilizar Monstro'] },
  'Domínio da Tempestade': { 1: ['Névoa Obscurecente', 'Onda Trovejante'], 3: ['Lufada de Vento', 'Despedaçar'], 5: ['Chamar Relâmpagos', 'Nevasca'], 7: ['Controlar Água', 'Tempestade de Gelo'], 9: ['Praga de Insetos', 'Onda Destrutiva'] },
  'Domínio da Natureza': { 1: ['Amizade Animal', 'Falar com Animais'], 3: ['Pele de Árvore', 'Crescimento de Espinhos'], 5: ['Ampliar Plantas', 'Padrão Hipnótico'], 7: ['Dominar Fera', 'Vinha Esmagadora'], 9: ['Praga de Insetos', 'Caminhar em Árvores'] },
  'Juramento de Vingança': { 3: ['Perdição', 'Marca do Caçador'], 5: ['Imobilizar Pessoa', 'Passo Nebuloso'], 9: ['Velocidade', 'Proteção contra Energia'], 13: ['Banimento', "Localizar Criatura"], 17: ['Imobilizar Monstro', "Vidência"] },
  'Juramento dos Antigos': { 3: ['Constrição', 'Falar com Animais'], 5: ['Passos sem Pegadas', 'Raio Lunar'], 9: ['Ampliar Plantas', 'Proteção contra Energia'], 13: ['Tempestade de Gelo', "Pele de Pedra"], 17: ['Comunhão com a Natureza', "Caminhar em Árvores"] },
  'Perseguidor Sombrio': { 3: ['Disfarçar-se'], 5: ['Passo Nebuloso'], 9: ['Medo'], 13: ['Invisibilidade Maior'], 17: ['Aparência'] },
  'Andarilho do Horizonte': { 3: ['Proteção contra o Bem e o Mal'], 5: ['Passo Nebuloso'], 9: ['Velocidade'], 13: ['Banimento'], 17: ['Círculo de Teletransporte'] },
  'Matador de Monstros': { 3: ['Proteção contra o Bem e o Mal'], 5: ['Zona da Verdade'], 9: ['Círculo Mágico'], 13: ['Banimento'], 17: ['Imobilizar Monstro'] },
  'Andarilho das Fadas': { 3: ['Fogo das Fadas'], 5: ['Passo Nebuloso'], 9: ['Dissipar Magia'], 13: ['Banimento'], 17: ['Enganar'] },
  'Guardião do Enxame': { 3: ['Mãos Mágicas', 'Fogo das Fadas'], 5: ['Passo Nebuloso'], 9: ['Forma Gasosa'], 13: ['Banimento'], 17: ['Inseto Gigante'] },
  'Círculo da Terra (Ártico)': { 3: ['Imobilizar Pessoa', 'Crescimento de Espinhos'], 5: ['Nevasca', 'Lentidão'], 7: ['Liberdade de Movimento', 'Tempestade de Gelo'], 9: ['Comunhão com a Natureza', 'Cone de Frio'] },
  'Círculo da Terra (Costa)': { 3: ['Reflexos', 'Passo Nebuloso'], 5: ['Respirar na Água', 'Caminhar na Água'], 7: ['Controlar Água', 'Liberdade de Movimento'], 9: ['Conjurar Elemental', 'Vidência'] },
  'Círculo da Terra (Deserto)': { 3: ['Silêncio', 'Passo Nebuloso'], 5: ['Luz do Dia', 'Padrão Hipnótico'], 7: ['Praga', 'Muralha de Fogo'], 9: ['Praga de Insetos', 'Muralha de Pedras'] },
  'Círculo da Terra (Floresta)': { 3: ['Patas de Aranha', 'Passo Nebuloso'], 5: ['Chamar Relâmpagos', 'Ampliar Plantas'], 7: ['Liberdade de Movimento', 'Vinha Esmagadora'], 9: ['Comunhão com a Natureza', 'Caminhar em Árvores'] },
  'Círculo da Terra (Montanha)': { 3: ['Patas de Aranha', 'Crescimento de Espinhos'], 5: ['Relâmpago', 'Mesclar-se às Rochas'], 7: ['Pele de Pedra', 'Moldar Rochas'], 9: ['Muralha de Pedras', 'Passo de Passagem'] },
  'Círculo da Terra (Pântano)': { 3: ['Escuridão', 'Flecha Ácida de Melf'], 5: ['Caminhar na Água', 'Névoa Fétida'], 7: ['Liberdade de Movimento', 'Localizar Criatura'], 9: ['Praga de Insetos', 'Vidência'] },
  'Círculo da Terra (Planície)': { 3: ['Passos sem Pegadas', 'Invisibilidade'], 5: ['Luz do Dia', 'Velocidade'], 7: ['Liberdade de Movimento', 'Guardião da Fé'], 9: ['Praga de Insetos', 'Vidência'] },
  'Círculo da Terra (Subterrâneo)': { 3: ['Patas de Aranha', 'Teia'], 5: ['Forma Gasosa', 'Névoa Fétida'], 7: ['Invisibilidade Maior', 'Pele de Pedra'], 9: ['Névoa Mortal', 'Muralha de Pedra'] },
  'Círculo dos Sonhos': { 2: ['Bálsamo da Corte de Verão'], 6: ['Lareira de Luar e Sombras'], 11: ['Caminho Oculto'], 14: ['Andarilho dos Sonhos'] },
  'Círculo do Pastor': { 2: ['Fala da Floresta', 'Totem Espiritual'], 6: ['Invocador Poderoso'], 10: ['Espírito Guardião'], 14: ['Fiel às Fadas'] },
  'Círculo dos Esporos': { 2: ['Toque Arrepiante', 'Cegueira/Surdez'], 5: ['Animar Mortos', 'Forma Gasosa'], 7: ['Definhar', 'Confusão'], 9: ['Névoa Mortal', 'Contágio'] },
  'Círculo das Estrelas': { 2: ['Orientação', 'Flecha Guia'] },
  'Círculo do Fogo Selvagem': { 2: ['Mãos Flamejantes', 'Curar Ferimentos'], 3: ['Esfera Flamejante', 'Raio Ardente'], 5: ['Ampliar Plantas', 'Revivificar'], 7: ['Aura de Vida', 'Escudo de Fogo'], 9: ['Coluna de Chamas', 'Curar Ferimentos em Massa'] },
  'Juramento da Conquista': { 3: ['Armadura de Agathys', 'Comando'], 5: ['Imobilizar Pessoa', 'Arma Espiritual'], 9: ['Rogar Maldição', 'Medo'], 13: ['Dominar Fera', 'Pele de Pedra'], 17: ['Névoa Mortal', 'Dominar Pessoa'] },
  'Juramento da Redenção': { 3: ['Santuário', 'Sono'], 5: ['Acalmar Emoções', 'Imobilizar Pessoa'], 9: ['Contramágica', 'Padrão Hipnótico'], 13: ['Esfera Resiliente de Otiluke', 'Pele de Pedra'], 17: ['Imobilizar Monstro', 'Muralha de Força'] },
  'Juramento da Glória': { 3: ['Guiding Bolt', 'Heroísmo'], 5: ['Aprimorar Habilidade', 'Arma Mágica'], 9: ['Velocidade', 'Proteção contra Energia'], 13: ['Compulsão', 'Liberdade de Movimento'], 17: ['Comunhão', 'Coluna de Chamas'] },
  'Juramento da Vigilância': { 3: ['Alarme', 'Detectar Magia'], 5: ['Raio Lunar', 'Ver o Invisível'], 9: ['Contramágica', 'Dificultar Detecção'], 13: ['Aura de Pureza', 'Banimento'], 17: ['Imobilizar Monstro', 'Vidência'] },
  'Domínio do Conhecimento': { 1: ['Comando', 'Identificar'], 3: ['Augúrio', 'Sugestão'], 5: ['Dificultar Detecção', 'Falar com os Mortos'], 7: ['Olho Arcano', 'Confusão'], 9: ['Lenda Viva', 'Vidência'] },
  'Domínio da Forja': { 1: ['Identificar', 'Golpe Ardente'], 3: ['Aquecer Metal', 'Arma Mágica'], 5: ['Arma Elemental', 'Proteção contra Energia'], 7: ['Fabricar', 'Muralha de Fogo'], 9: ['Animar Objetos', 'Criação'] },
  'Mente Aberrante': { 1: ['Braços de Hadar', 'Sussurros Dissonantes', 'Picada Mental'], 3: ['Acalmar Emoções', 'Detectar Pensamentos'], 5: ['Fome de Hadar', 'Enviar Mensagem'], 7: ['Tentáculos Negros de Evard', 'Invocar Aberração'], 9: ['Ligação Telepática de Rary', 'Telecinésia'] },
  'Feiticeiro de Relógio': { 1: ['Alarme', 'Proteção contra o Bem e o Mal'], 3: ['Auxílio', 'Restauração Menor'], 5: ['Dissipar Magia', 'Proteção contra Energia'], 7: ['Liberdade de Movimento', 'Invocar Construto'], 9: ['Restauração Maior', 'Muralha de Força'] },
  'Mestre das Bestas': { 3: ['Adestrar Animais', 'Falar com Animais'], 5: ["Sentido Bestial", "Localizar Animais ou Plantas"], 9: ["Conjurar Animais", "Revivificar"], 13: ["Dominar Bestas", "Localizar Criatura"], 17: ["Conjurar Seres da Floresta", "Caminhar em Árvores"] },
  'Caçador': { 3: ['Marca do Caçador', 'Alarme'], 5: ["Localizar Objeto", "Passos sem Pegadas"], 9: ["Conjurar Barragem", "Proteção contra Energia"], 13: ["Libertar", "Vinha Esmagadora"], 17: ["Aljava Veloz", "Comunhão com a Natureza"] },
  'Trapaceiro Arcano': { 3: ['Ilusão Menor', "Mãos Mágicas"], 7: ["Disfarçar-se", "Imagem Silenciosa"], 13: ["Invisibilidade", "Sugestão"], 19: ["Medo", "Padrão Hipnótico"] },
  'Cavaleiro Arcano': { 3: ['Mãos Mágicas', "Escudo Arcano"], 7: ["Mãos Flamejantes", "Onda Trovejante"], 13: ["Relâmpago", "Bola de Fogo"], 19: ["Banimento", "Invisibilidade Maior"] },
  'Domínio do Crepúsculo': { 1: ['Fogo das Fadas', 'Sono'], 3: ['Esfera Flamejante', 'Passo Nebuloso'], 5: ['Aura de Vitalidade', 'Luz do Dia'], 7: ['Aura de Vida', 'Invisibilidade Maior'], 9: ['Círculo de Poder', 'Desejo de Morte'] },
  'Domínio da Ordem': { 1: ['Comando', 'Heroísmo'], 3: ['Imobilizar Pessoa', 'Zona da Verdade'], 5: ['Palavra Curativa em Massa', 'Lentidão'], 7: ['Compulsão', 'Localizar Criatura'], 9: ['Dominar Pessoa', 'Comunhão'] },
  'O Gênio': { 1: ['Detectar o Bem e o Mal'], 3: ['Força Fantasmagórica'], 5: ['Criar Alimentos'], 7: ['Assassino Fantasmagórico'], 9: ['Criação'] },
  'A Fada Rainha': { 1: ['Fogo das Fadas', 'Sono'], 3: ['Cativar', 'Força Fantasmagórica'], 5: ['Piscar', 'Ampliar Plantas'], 7: ['Dominar Besta', 'Invisibilidade Maior'], 9: ['Dominar Pessoa', 'Aparência'] }
};

