
import { Monster, Character } from "./types";

export const INITIAL_CHAR: Character = {
  id: 'init',
  name: "Herói", class: "Guerreiro", subclass: "", level: 1, 
  background: "Soldado", race: "Humano",
  playerName: "", alignment: "Neutro", xp: 0,
  attributes: { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 },
  skills: {}, saves: {},
  hp: { current: 10, max: 10, temp: 0 },
  hitDice: { current: 1, max: "d10" },
  deathSaves: { successes: 0, failures: 0 },
  ac: 10, speed: "9m", initiative: 0,
  inventory: "",
  bio: { traits: "", ideals: "", bonds: "", flaws: "", backstory: "", features: "" },
  spells: { slots: [], known: "", castingStat: "int" },
  wallet: { cp: 0, sp: 0, ep: 0, gp: 0, pp: 0 },
  customWeapons: [],
  customSpells: [],
  exhaustion: 0,
  imageUrl: ""
};

export const CLASSES_DB: Record<string, { dv: number; sub: string[]; slots: 'full' | 'half' | 'half-up' | 'pact' | null }> = {
  'Bárbaro': { 
    dv: 12, 
    sub: [
      'Caminho do Berserker', 'Guerreiro Totêmico', 'Guardião Ancestral', 
      'Arauto da Tempestade', 'Zelote', 'Fera', 'Magia Selvagem', 'Furioso de Batalha'
    ], 
    slots: null 
  },
  'Bardo': { 
    dv: 8, 
    sub: [
      'Colégio do Conhecimento', 'Colégio da Bravura', 'Colégio do Glamour', 
      'Colégio das Espadas', 'Colégio dos Sussurros', 'Colégio da Eloquência', 
      'Colégio da Criação', 'Colégio dos Espíritos'
    ], 
    slots: 'full' 
  },
  'Clérigo': { 
    dv: 8, 
    sub: [
      'Domínio do Conhecimento', 'Domínio da Vida', 'Domínio da Luz', 
      'Domínio da Natureza', 'Domínio da Tempestade', 'Domínio da Trapaça', 
      'Domínio da Guerra', 'Domínio da Morte', 'Domínio da Forja', 
      'Domínio da Sepultura', 'Domínio da Ordem', 'Domínio da Paz', 
      'Domínio do Crepúsculo', 'Domínio Arcano'
    ], 
    slots: 'full' 
  },
  'Druida': { 
    dv: 8, 
    sub: [
      'Círculo da Terra', 'Círculo da Lua', 'Círculo dos Pastores', 
      'Círculo dos Sonhos', 'Círculo dos Esporos', 'Círculo das Estrelas', 
      'Círculo do Fogo Selvagem'
    ], 
    slots: 'full' 
  },
  'Guerreiro': { 
    dv: 10, 
    sub: [
      'Campeão', 'Mestre de Batalha', 'Cavaleiro Arcano', 'Arqueiro Arcano', 
      'Cavaleiro', 'Samurai', 'Guerreiro Psiônico', 'Cavaleiro Rúnico', 
      'Cavaleiro do Dragão Púrpura (Banneret)'
    ], 
    slots: null 
  },
  'Monge': { 
    dv: 8, 
    sub: [
      'Caminho da Mão Aberta', 'Caminho das Sombras', 'Caminho dos Quatro Elementos', 
      'Caminho da Longa Morte', 'Caminho da Alma Solar', 'Caminho Kensei', 
      'Caminho do Mestre Bêbado', 'Caminho do Eu Astral', 'Caminho da Misericórdia', 
      'Caminho do Dragão Ascendente'
    ], 
    slots: null 
  },
  'Paladino': { 
    dv: 10, 
    sub: [
      'Juramento de Devoção', 'Juramento dos Antigos', 'Juramento de Vingança', 
      'Juramento da Coroa', 'Juramento da Conquista', 'Juramento da Redenção', 
      'Juramento da Glória', 'Juramento dos Vigilantes', 'Quebra-Juramento'
    ], 
    slots: 'half' 
  },
  'Patrulheiro': { 
    dv: 10, 
    sub: [
      'Caçador', 'Mestre das Bestas', 'Perseguidor da Escuridão (Gloom Stalker)', 
      'Andarilho do Horizonte', 'Caçador de Monstros', 'Andarilho Feérico', 
      'Guardião do Enxame', 'Guardião Dracônico (Drake Warden)'
    ], 
    slots: 'half' 
  },
  'Ladino': { 
    dv: 8, 
    sub: [
      'Ladrão', 'Assassino', 'Trapaceiro Arcano', 'Mestre Tático (Mastermind)', 
      'Espadachim (Swashbuckler)', 'Investigativo (Inquisitive)', 'Batedor (Scout)', 
      'Fantasma', 'Lâmina da Alma (Soulknife)'
    ], 
    slots: null 
  },
  'Feiticeiro': { 
    dv: 6, 
    sub: [
      'Linhagem Dracônica', 'Magia Selvagem', 'Feitiçaria da Tempestade', 
      'Alma Divina', 'Magia das Sombras', 'Mente Aberrante', 'Alma Mecânica (Clockwork)'
    ], 
    slots: 'full' 
  },
  'Bruxo': { 
    dv: 8, 
    sub: [
      'Arquifada', 'Corruptor (Infernal)', 'Grande Antigo', 'Imortal (Undying)', 
      'Celestial', 'Hexblade', 'Insondável (Fathomless)', 'Gênio', 'Morto-Vivo (Undead)'
    ], 
    slots: 'pact' 
  },
  'Mago': { 
    dv: 6, 
    sub: [
      'Escola de Abjuração', 'Escola de Conjuração', 'Escola de Adivinhação', 
      'Escola de Encantamento', 'Escola de Evocação', 'Escola de Ilusão', 
      'Escola de Necromancia', 'Escola de Transmutação', 'Magia de Guerra', 
      'Cantor da Lâmina (Bladesinging)', 'Ordem dos Escribas', 'Cronurgia', 'Graviturgia'
    ], 
    slots: 'full' 
  },
  'Artífice': { 
    dv: 8, 
    sub: [
      'Alquimista', 'Artilheiro', 'Armeiro (Armorer)', 'Ferreiro de Batalha (Battle Smith)'
    ], 
    slots: 'half-up' 
  }
};

export const CLASS_FEATURES: Record<string, Record<number, string[]>> = {
  'Bárbaro': {
    1: ['Fúria', 'Defesa sem Armadura'], 2: ['Ataque Descuidado', 'Sentido de Perigo'], 3: ['Caminho Primitivo (Subclasse)', 'Fúria Adicional'], 4: ['Incremento de Atributo (ASI)'], 5: ['Ataque Extra', 'Movimento Rápido'],
    6: ['Caminho Primitivo'], 7: ['Instinto Selvagem'], 8: ['Incremento de Atributo (ASI)'], 9: ['Crítico Brutal (1 dado)'], 10: ['Caminho Primitivo'], 11: ['Fúria Implacável'], 12: ['Incremento de Atributo (ASI)'],
    13: ['Crítico Brutal (2 dados)'], 14: ['Caminho Primitivo'], 15: ['Fúria Persistente'], 16: ['Incremento de Atributo (ASI)'], 17: ['Crítico Brutal (3 dados)'], 18: ['Força Indomável'], 19: ['Incremento de Atributo (ASI)'], 20: ['Campeão Primitivo']
  },
  'Bardo': {
    1: ['Conjuração', 'Inspiração de Bardo (d6)'], 2: ['Pau pra Toda Obra', 'Canção de Descanso (d6)'], 3: ['Colégio de Bardo (Subclasse)', 'Especialização'], 4: ['Incremento de Atributo (ASI)'], 5: ['Inspiração de Bardo (d8)', 'Fonte de Inspiração'],
    6: ['Contraencantamento', 'Colégio de Bardo'], 8: ['Incremento de Atributo (ASI)'], 10: ['Inspiração de Bardo (d10)', 'Especialização', 'Segredos Mágicos'], 12: ['Incremento de Atributo (ASI)'], 14: ['Segredos Mágicos', 'Colégio de Bardo'], 
    15: ['Inspiração de Bardo (d12)'], 16: ['Incremento de Atributo (ASI)'], 18: ['Segredos Mágicos'], 19: ['Incremento de Atributo (ASI)'], 20: ['Inspiração Superior']
  },
  'Clérigo': {
    1: ['Conjuração', 'Domínio Divino (Subclasse)'], 2: ['Canalizar Divindade (1/descanso)', 'Domínio Divino'], 3: [], 4: ['Incremento de Atributo (ASI)'], 5: ['Destruir Mortos-Vivos (ND 1/2)'],
    6: ['Canalizar Divindade (2/descanso)', 'Domínio Divino'], 8: ['Incremento de Atributo (ASI)', 'Destruir Mortos-Vivos (ND 1)', 'Golpe Divino / Conjuração Potente'], 10: ['Intervenção Divina'], 11: ['Destruir Mortos-Vivos (ND 2)'],
    12: ['Incremento de Atributo (ASI)'], 14: ['Destruir Mortos-Vivos (ND 3)'], 16: ['Incremento de Atributo (ASI)'], 17: ['Destruir Mortos-Vivos (ND 4)', 'Domínio Divino'], 18: ['Canalizar Divindade (3/descanso)'], 19: ['Incremento de Atributo (ASI)'], 20: ['Intervenção Divina Aprimorada']
  },
  'Druida': {
    1: ['Druídico', 'Conjuração'], 2: ['Forma Selvagem', 'Círculo Druídico (Subclasse)'], 3: [], 4: ['Incremento de Atributo (ASI)', 'Forma Selvagem Aprimorada'], 5: [], 6: ['Círculo Druídico'],
    8: ['Incremento de Atributo (ASI)', 'Forma Selvagem Aprimorada (Voo)'], 10: ['Círculo Druídico'], 12: ['Incremento de Atributo (ASI)'], 14: ['Círculo Druídico'], 16: ['Incremento de Atributo (ASI)'],
    18: ['Corpo Atemporal', 'Magia da Natureza'], 19: ['Incremento de Atributo (ASI)'], 20: ['Arquidruida']
  },
  'Guerreiro': {
    1: ['Estilo de Luta', 'Retomar o Fôlego'], 2: ['Surto de Ação (1)'], 3: ['Arquétipo Marcial (Subclasse)'], 4: ['Incremento de Atributo (ASI)'], 5: ['Ataque Extra'],
    6: ['Incremento de Atributo (ASI)'], 7: ['Arquétipo Marcial'], 8: ['Incremento de Atributo (ASI)'], 9: ['Indomável (1)'], 10: ['Arquétipo Marcial'], 11: ['Ataque Extra (2)'],
    12: ['Incremento de Atributo (ASI)'], 13: ['Indomável (2)'], 14: ['Incremento de Atributo (ASI)'], 15: ['Arquétipo Marcial'], 16: ['Incremento de Atributo (ASI)'], 17: ['Surto de Ação (2)', 'Indomável (3)'], 18: ['Arquétipo Marcial'], 19: ['Incremento de Atributo (ASI)'], 20: ['Ataque Extra (3)']
  },
  'Monge': {
    1: ['Defesa sem Armadura', 'Artes Marciais'], 2: ['Ki', 'Movimento sem Armadura'], 3: ['Tradição Monástica (Subclasse)', 'Defletir Projéteis'], 4: ['Incremento de Atributo (ASI)', 'Queda Lenta'], 5: ['Ataque Extra', 'Ataque Atordoante'],
    6: ['Golpes de Ki', 'Tradição Monástica'], 7: ['Evasão', 'Mente Tranquila'], 8: ['Incremento de Atributo (ASI)'], 9: ['Movimento sem Armadura Aprimorado'], 10: ['Pureza Corporal'],
    11: ['Tradição Monástica'], 12: ['Incremento de Atributo (ASI)'], 13: ['Língua do Sol e da Lua'], 14: ['Alma de Diamante'], 15: ['Corpo Atemporal'], 16: ['Incremento de Atributo (ASI)'], 17: ['Tradição Monástica'], 18: ['Corpo Vazio'], 19: ['Incremento de Atributo (ASI)'], 20: ['Eu Perfeito']
  },
  'Paladino': {
    1: ['Sentido Divino', 'Cura pelas Mãos'], 2: ['Estilo de Luta', 'Conjuração', 'Destruição Divina (Smite)'], 3: ['Saúde Divina', 'Juramento Sagrado (Subclasse)'], 4: ['Incremento de Atributo (ASI)'], 5: ['Ataque Extra'],
    6: ['Aura de Proteção'], 7: ['Juramento Sagrado'], 8: ['Incremento de Atributo (ASI)'], 10: ['Aura de Coragem'], 11: ['Destruição Divina Aprimorada'], 12: ['Incremento de Atributo (ASI)'],
    14: ['Toque Purificador'], 15: ['Juramento Sagrado'], 16: ['Incremento de Atributo (ASI)'], 18: ['Aura Aprimorada'], 19: ['Incremento de Atributo (ASI)'], 20: ['Juramento Sagrado']
  },
  'Patrulheiro': {
    1: ['Inimigo Favorito', 'Explorador Natural'], 2: ['Estilo de Luta', 'Conjuração'], 3: ['Arquétipo de Patrulheiro (Subclasse)', 'Consciência Primitiva'], 4: ['Incremento de Atributo (ASI)'], 5: ['Ataque Extra'],
    6: ['Inimigo Favorito e Explorador Natural Aprimorados'], 7: ['Arquétipo de Patrulheiro'], 8: ['Incremento de Atributo (ASI)', 'Passo da Terra'], 10: ['Camuflagem na Natureza'], 11: ['Arquétipo de Patrulheiro'],
    12: ['Incremento de Atributo (ASI)'], 14: ['Desaparecer'], 15: ['Arquétipo de Patrulheiro'], 16: ['Incremento de Atributo (ASI)'], 18: ['Sentidos Selvagens'], 19: ['Incremento de Atributo (ASI)'], 20: ['Caçador de Inimigos']
  },
  'Ladino': {
    1: ['Ataque Furtivo (1d6)', 'Gíria de Ladrão', 'Especialização'], 2: ['Ação Astuta'], 3: ['Arquétipo Ladino (Subclasse)', 'Ataque Furtivo (2d6)'], 4: ['Incremento de Atributo (ASI)'], 5: ['Esquiva Sobrenatural', 'Ataque Furtivo (3d6)'],
    6: ['Especialização'], 7: ['Evasão', 'Ataque Furtivo (4d6)'], 8: ['Incremento de Atributo (ASI)'], 9: ['Arquétipo Ladino', 'Ataque Furtivo (5d6)'], 10: ['Incremento de Atributo (ASI)'],
    11: ['Talento Confiável', 'Ataque Furtivo (6d6)'], 12: ['Incremento de Atributo (ASI)'], 13: ['Arquétipo Ladino', 'Ataque Furtivo (7d6)'], 14: ['Sentido Cego'], 15: ['Mente Escorregadia', 'Ataque Furtivo (8d6)'], 16: ['Incremento de Atributo (ASI)'], 17: ['Arquétipo Ladino', 'Ataque Furtivo (9d6)'], 18: ['Elusivo'], 19: ['Incremento de Atributo (ASI)', 'Ataque Furtivo (10d6)'], 20: ['Golpe de Sorte']
  },
  'Feiticeiro': {
    1: ['Conjuração', 'Origem da Feitiçaria (Subclasse)'], 2: ['Fonte de Magia (Pontos de Feitiçaria)'], 3: ['Metamagia'], 4: ['Incremento de Atributo (ASI)'], 5: [],
    6: ['Origem da Feitiçaria'], 8: ['Incremento de Atributo (ASI)'], 10: ['Metamagia'], 12: ['Incremento de Atributo (ASI)'], 14: ['Origem da Feitiçaria'],
    16: ['Incremento de Atributo (ASI)'], 17: ['Metamagia'], 18: ['Origem da Feitiçaria'], 19: ['Incremento de Atributo (ASI)'], 20: ['Restauração de Feitiçaria']
  },
  'Bruxo': {
    1: ['Patrono Sobrenatural (Subclasse)', 'Magia de Pacto'], 2: ['Invocações Místicas'], 3: ['Dádiva do Pacto'], 4: ['Incremento de Atributo (ASI)'], 5: ['Invocação Mística'],
    6: ['Patrono Sobrenatural'], 7: ['Invocação Mística'], 8: ['Incremento de Atributo (ASI)'], 9: ['Invocação Mística'], 10: ['Patrono Sobrenatural'],
    11: ['Arcanum Místico (6º nível)'], 12: ['Incremento de Atributo (ASI)', 'Invocação Mística'], 13: ['Arcanum Místico (7º nível)'], 14: ['Patrono Sobrenatural'], 15: ['Invocação Mística', 'Arcanum Místico (8º nível)'], 16: ['Incremento de Atributo (ASI)'], 17: ['Arcanum Místico (9º nível)'], 18: ['Invocação Mística'], 19: ['Incremento de Atributo (ASI)'], 20: ['Mestre do Eldritch']
  },
  'Mago': {
    1: ['Conjuração', 'Recuperação Arcana'], 2: ['Tradição Arcana (Subclasse)'], 3: [], 4: ['Incremento de Atributo (ASI)'], 5: [],
    6: ['Tradição Arcana'], 8: ['Incremento de Atributo (ASI)'], 10: ['Tradição Arcana'], 12: ['Incremento de Atributo (ASI)'], 14: ['Tradição Arcana'],
    16: ['Incremento de Atributo (ASI)'], 18: ['Domínio de Magia'], 19: ['Incremento de Atributo (ASI)'], 20: ['Assinatura Mágica']
  },
  'Artífice': {
    1: ['Engenhocas Mágicas', 'Conjuração'], 2: ['Infusão de Itens'], 3: ['Especialista em Artificaria (Subclasse)', 'Ferramenta Certa pro Trabalho'], 4: ['Incremento de Atributo (ASI)'], 5: ['Especialista em Artificaria'],
    6: ['Especialização em Ferramentas'], 7: ['Lampejo de Genialidade'], 8: ['Incremento de Atributo (ASI)'], 9: ['Especialista em Artificaria'], 10: ['Adepto de Itens Mágicos'],
    11: ['Item Armazenador de Magia'], 12: ['Incremento de Atributo (ASI)'], 14: ['Sábio de Itens Mágicos'], 15: ['Especialista em Artificaria'], 16: ['Incremento de Atributo (ASI)'], 18: ['Mestre de Itens Mágicos'], 19: ['Incremento de Atributo (ASI)'], 20: ['Alma do Artifício']
  }
};

export const CONDITIONS_LIST = [
    "Agarrado", "Amedrontado", "Atordoado", "Caído", "Cego", 
    "Enfeitiçado", "Envenenado", "Exausto", "Impedido", 
    "Incapacitado", "Inconsciente", "Invisível", "Paralisado", 
    "Petrificado", "Surdo"
];

export const RACES_LIST = [
  "Aarakocra", "Aasimar", "Anão", "Anão da Colina", "Anão da Montanha", 
  "Bugbear", "Centauro", "Changeling", "Draconato", "Duergar", 
  "Elfo", "Elfo Alto", "Elfo da Floresta", "Elfo Negro (Drow)", "Eladrin",
  "Fada", "Firbolg", "Forjado Bélico", "Genasi (Ar)", "Genasi (Água)", "Genasi (Fogo)", "Genasi (Terra)", 
  "Githyanki", "Githzerai", "Gnomo", "Gnomo da Floresta", "Gnomo das Rochas", "Gnomo das Profundezas", 
  "Goblin", "Golias", "Halfling", "Halfling Pés-Leves", "Halfling Robusto", 
  "Harengon", "Hobgoblin", "Humano", "Humano Variante", "Kalashtar", "Kenku", 
  "Kobold", "Leonino", "Loxodonte", "Meio-Elfo", "Meio-Orc", "Minotauro", "Orc", 
  "Povo-Lagarto", "Sátiro", "Shifter", "Tabaxi", "Tiefling", "Tortle", "Tritão", 
  "Vedalken", "Verdan", "Yuan-ti Puro-Sangue"
];

export const BACKGROUNDS_DB: Record<string, { skills: string[]; feature: string }> = {
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

export const SPELLS_DB: Record<string, { level: string, desc: string }> = {
  "Projétil de Fogo": { level: "Truque", desc: "1d10 de fogo." },
  "Rajada Sobrenatural": { level: "Truque", desc: "1d10 de força (por raio)." },
  "Chama Sagrada": { level: "Truque", desc: "1d8 radiante (CD Des)." },
  "Badalar dos Mortos": { level: "Truque", desc: "1d8 ou 1d12 necrótico (se ferido)." },
  "Toque Gélido": { level: "Truque", desc: "1d8 necrótico e impede cura." },
  "Raio de Gelo": { level: "Truque", desc: "1d8 frio e reduz desl. em 3m." },
  "Toque Chocante": { level: "Truque", desc: "1d8 relâmpago e remove reação." },
  "Pulverizar Veneno": { level: "Truque", desc: "1d12 veneno (CD Con)." },
  "Salpico de Ácido": { level: "Truque", desc: "1d6 ácido (1 ou 2 alvos)." },
  "Zombaria Cruel": { level: "Truque", desc: "1d4 psíquico + desvantagem no atq." },
  "Lâmina Trovejante": { level: "Truque", desc: "1d8 trovejante se mover." },
  "Lâmina Chama Verde": { level: "Truque", desc: "1d8 fogo (salta p/ outro)." },
  "Ataque Certeiro": { level: "Truque", desc: "30ft. Adv no próximo ataque." },
  "Estabilizar": { level: "Truque", desc: "Toque. Criatura com 0 PV torna-se estável." },
  "Ilusão Menor": { level: "Truque", desc: "Cria som ou imagem de objeto." },
  "Luz": { level: "Truque", desc: "Objeto brilha como tocha." },
  "Mãos Mágicas": { level: "Truque", desc: "9m. Cria mão espectral que manipula objetos." },
  "Prestidigitação": { level: "Truque", desc: "Efeitos sensoriais inofensivos, limpar, acender." },
  "Rajada Mística": { level: "Truque", desc: "36m. Ataque mágico. 1d10 energia." },
  "Zombaria Viciosa": { level: "Truque", desc: "18m. CD Sab ou 1d4 psíquico + desvantagem." },
  "Estilhaço Mental": { level: "Truque", desc: "1d6 psíquico e -1d4 no próx save." },
  "Mordida de Gelo": { level: "Truque", desc: "1d6 frio e Desvantagem no próx ataque." },
  "Infestação": { level: "Truque", desc: "1d6 veneno e movimento forçado." },
  "Estalo Trovejante": { level: "Truque", desc: "1d6 trovejante (área 1.5m)." },
  "Criar Fogueira": { level: "Truque", desc: "1d8 fogo (conc, por turno)." },
  "Mísseis Mágicos": { level: "1º Nível", desc: "1d4 + 1 de força (por míssil)." },
  "Mãos Flamejantes": { level: "1º Nível", desc: "3d6 de fogo (Cone)." },
  "Onda Trovejante": { level: "1º Nível", desc: "2d8 trovejante e empurra." },
  "Orbe Cromático": { level: "1º Nível", desc: "3d8 (tipo variável)." },
  "Projétil Guiador": { level: "1º Nível", desc: "4d6 radiante e Adv no próx atq." },
  "Ferir": { level: "1º Nível", desc: "3d10 necrótico." },
  "Cura Ferimentos": { level: "1º Nível", desc: "1d8 + modificador de conjuração." },
  "Palavra de Cura": { level: "1º Nível", desc: "1d4 + modificador de conjuração (Bônus)." },
  "Marca do Caçador": { level: "1º Nível", desc: "1d6 extra por acerto no alvo." },
  "Hex": { level: "1º Nível", desc: "1d6 necrótico extra por acerto." },
  "Golpe Trovejante": { level: "1º Nível", desc: "2d6 trovejante e empurra." },
  "Golpe Ardente": { level: "1º Nível", desc: "1d6 fogo (extra por turno)." },
  "Chuva de Espinhos": { level: "1º Nível", desc: "1d10 perfurante (área)." },
  "Braços de Hadar": { level: "1º Nível", desc: "2d6 necrótico em área." },
  "Benção": { level: "1º Nível", desc: "9m. 3 alvos. +1d4 em ataques e saves." },
  "Detectar Magia": { level: "1º Nível", desc: "Sente presença de magia em 9m." },
  "Escudo Arcano": { level: "1º Nível", desc: "Reação. +5 CA até o início do próximo turno." },
  "Repreensão Infernal": { level: "1º Nível", desc: "Reação. 2d10 fogo se ferido." },
  "Sussurros Dissonantes": { level: "1º Nível", desc: "3d6 psíquico e usa reação para fugir." },
  "Favor Divino": { level: "1º Nível", desc: "Bônus. +1d4 radiante em ataques." },
  "Golpe Colérico": { level: "1º Nível", desc: "Bônus. 1d6 psíquico e amedrontado." },
  "Rajada Escaldante": { level: "2º Nível", desc: "2d6 de fogo (por raio)." },
  "Fragmentar": { level: "2º Nível", desc: "3d8 trovejante (CD Con)." },
  "Arma Espiritual": { level: "2º Nível", desc: "1d8 + mod conjuração (Força)." },
  "Feixe Lunar": { level: "2º Nível", desc: "2d10 radiante (área persistente)." },
  "Esfera Flamejante": { level: "2º Nível", desc: "2d6 de fogo (por turno)." },
  "Metal Ardente": { level: "2º Nível", desc: "2d8 de fogo (sem save se segurando)." },
  "Coroa de Loucura": { level: "2º Nível", desc: "4d6 psíquico e controla ação." },
  "Invisibilidade": { level: "2º Nível", desc: "Toque. Alvo fica invisível. Quebra se atacar/conjurar." },
  "Passo Nebuloso": { level: "2º Nível", desc: "Teleporte 9m (Bônus)." },
  "Raio Ardente": { level: "2º Nível", desc: "36m. 3 raios. 2d6 fogo cada." },
  "Teia": { level: "2º Nível", desc: "18m. Cubo 6m. Terreno difícil e contenção." },
  "Nuvem de Adagas": { level: "2º Nível", desc: "4d4 cortante (início do turno na área)." },
  "Respiração de Dragão": { level: "2º Nível", desc: "Bônus. Toque. Alvo ganha sopro 3d6." },
  "Golpe Marcador": { level: "2º Nível", desc: "Bônus. 2d6 radiante e remove invisibilidade." },
  "Bola de Fogo": { level: "3º Nível", desc: "8d6 de fogo (Raio 6m)." },
  "Relâmpago": { level: "3º Nível", desc: "8d6 de relâmpago (Linha)." },
  "Guardiões Espirituais": { level: "3º Nível", desc: "3d8 radiante ou necrótico (Aura)." },
  "Toque Vampírico": { level: "3º Nível", desc: "3d6 necrótico e cura metade." },
  "Invocar Relâmpago": { level: "3º Nível", desc: "3d10 de relâmpago." },
  "Contramágica": { level: "3º Nível", desc: "Reação. Interrompe magia de 3º nível ou menor." },
  "Espíritos Guardiões": { level: "3º Nível", desc: "Aura 4.5m. 3d8 radiante/necrótico por turno." },
  "Velocidade": { level: "3º Nível", desc: "Toque. Dobra desl, +2 CA, ação extra." },
  "Voo": { level: "3º Nível", desc: "Toque. Deslocamento de voo 18m." },
  "Onda Tidal": { level: "3º Nível", desc: "4d8 concussão e derruba." },
  "Terra em Erupção": { level: "3º Nível", desc: "3d12 concussão e terreno difícil." },
  "Golpe Cegante": { level: "3º Nível", desc: "Bônus. 3d8 radiante e cego." },
  "Praga": { level: "4º Nível", desc: "8d8 necrótico." },
  "Tempestade de Gelo": { level: "4º Nível", desc: "2d8 concussão + 4d6 frio." },
  "Esfera Vitriólica": { level: "4º Nível", desc: "15d4 ácido (inicial) + dano posterior." },
  "Polimorfia": { level: "4º Nível", desc: "18m. Transforma criatura em besta." },
  "Muralha de Fogo": { level: "4º Nível", desc: "36m. 5d8 fogo a quem atravessar." },
  "Banimento": { level: "4º Nível", desc: "18m. Envia alvo para outro plano (Cha save)." },
  "Radiância Debilitante": { level: "4º Nível", desc: "4d10 radiante e exaustão." },
  "Golpe Atordoante": { level: "4º Nível", desc: "Bônus. 4d6 psíquico e Desv em atq/checks." },
  "Cone de Frio": { level: "5º Nível", desc: "8d8 de frio (Cone)." },
  "Nuvem Mortal": { level: "5º Nível", desc: "5d8 veneno (Área)." },
  "Mão de Bigby": { level: "5º Nível", desc: "4d8 de força (Punho Cerrado)." },
  "Amanhecer": { level: "5º Nível", desc: "4d10 radiante (Cilindro, fim do turno)." },
  "Golpe Banidor": { level: "5º Nível", desc: "Bônus. 5d10 força. Bane se < 50 PV." },
  "Relâmpago em Cadeia": { level: "6º Nível", desc: "10d8 de relâmpago (salta alvos)." },
  "Desintegrar": { level: "6º Nível", desc: "10d6 + 40 de força." },
  "Círculo da Morte": { level: "6º Nível", desc: "8d6 necrótico (Raio 18m)." },
  "Ferimento": { level: "6º Nível", desc: "14d6 necrótico. Reduz PV máx." },
  "Dedo da Morte": { level: "7º Nível", desc: "7d8 + 30 necrótico. Cria zumbi." },
  "Enxame de Meteoros": { level: "9º Nível", desc: "20d6 fogo + 20d6 concussão." },
  "Ataque Furtivo": { level: "Habilidade", desc: "Adicione até 10d6 extra se tiver vantagem/aliado." },
  "Golpe Divino": { level: "Habilidade", desc: "2d8 radiante (+1d8 por slot acima de 1º)." },
  "Golpe Divino Aprimorado": { level: "Habilidade", desc: "1d8 radiante extra passivo." },
  "Fúria": { level: "Habilidade", desc: "+2 a +4 dano (Baseado no Nível)." },
  "Rajada de Golpes": { level: "Habilidade", desc: "Ataque desarmado extra (1d4 a 1d10)." },
  "Canhão Arcano": { level: "Habilidade", desc: "2d8 força ou fogo (Artífice)." },
  "Impulso Arcano": { level: "Habilidade", desc: "2d6 ou 4d6 força (Artífice)." },
  "Inimigo Jurado": { level: "Habilidade", desc: "1d4/1d6/1d8 extra (Ranger)." },
  "Matador de Colossos": { level: "Habilidade", desc: "1d8 extra (se alvo ferido)." },
  "Emboscador Temido": { level: "Habilidade", desc: "1d8 extra (1º turno)." },
  "Golpe Flamejante (Elemento)": { level: "Habilidade", desc: "3d6 fogo extra (Monge 4 Elementos)." },
  "Ataque do Defensor de Aço": { level: "Habilidade", desc: "1d8 + Prof de força (Artífice)." },
  "Impulso Arcano Aprimorado": { level: "Habilidade", desc: "6d6 força (Artífice Nvl 15)." },
  "Ataque Desarmado (Monge)": { level: "Habilidade", desc: "1d4 a 1d10 (concussão)." },
  "Explosão de Ki": { level: "Habilidade", desc: "3d10 dano elemental (Monge)." },
  "Ataque Extra": { level: "Habilidade", desc: "Permite realizar outro ataque com a arma." }
};

export const COMMON_WEAPONS: { n: string, dmg: string, prop: string }[] = [
  { n: "Adaga", dmg: "1d4 perfurante", prop: "Acuidade, Leve, Arr (6/18)" },
  { n: "Azagaia", dmg: "1d6 perfurante", prop: "Arr (9/36)" },
  { n: "Clava", dmg: "1d4 concussão", prop: "Leve" },
  { n: "Foice Curta", dmg: "1d4 cortante", prop: "Leve" },
  { n: "Lança", dmg: "1d6 perfurante", prop: "Arr (6/18), Versátil (1d8)" },
  { n: "Machadinha", dmg: "1d6 cortante", prop: "Leve, Arr (6/18)" },
  { n: "Martelo Leve", dmg: "1d4 concussão", prop: "Leve, Arr (6/18)" },
  { n: "Cajado", dmg: "1d6 concussão", prop: "Versátil (1d8)" },
  { n: "Alabarda", dmg: "1d10 cortante", prop: "Pesada, Alcance, 2 Mãos" },
  { n: "Cimitarra", dmg: "1d6 cortante", prop: "Acuidade, Leve" },
  { n: "Chicote", dmg: "1d4 cortante", prop: "Acuidade, Alcance" },
  { n: "Espada Curta", dmg: "1d6 perfurante", prop: "Acuidade, Leve" },
  { n: "Sabre Curto", dmg: "1d6 perfurante", prop: "Acuidade, Leve" },
  { n: "Espada Grande", dmg: "2d6 cortante", prop: "Pesada, 2 Mãos" },
  { n: "Espadão", dmg: "2d6 cortante", prop: "Pesada, 2 Mãos" },
  { n: "Espada Longa", dmg: "1d8 cortante", prop: "Versátil (1d10)" },
  { n: "Glaive", dmg: "1d10 cortante", prop: "Pesada, Alcance, 2 Mãos" },
  { n: "Machado Batalha", dmg: "1d8 cortante", prop: "Versátil (1d10)" },
  { n: "Machado de Batalha", dmg: "1d8 cortante", prop: "Versátil (1d10)" },
  { n: "Machado Grande", dmg: "1d12 cortante", prop: "Pesada, 2 Mãos" },
  { n: "Maça Estrela", dmg: "1d8 perfurante", prop: "-" },
  { n: "Martelo Guerra", dmg: "1d8 concussão", prop: "Versátil (1d10)" },
  { n: "Martelo de Guerra", dmg: "1d8 concussão", prop: "Versátil (1d10)" },
  { n: "Marreta", dmg: "2d6 concussão", prop: "Pesada, 2 Mãos" },
  { n: "Rapieira", dmg: "1d8 perfurante", prop: "Acuidade" },
  { n: "Arco Curto", dmg: "1d6 perfurante", prop: "Mun (24/96), 2 Mãos" },
  { n: "Arco Longo", dmg: "1d8 perfurante", prop: "Mun (45/180), Pesada, 2 Mãos" },
  { n: "Besta Leve", dmg: "1d8 perfurante", prop: "Mun (24/96), Recarga, 2 Mãos" },
  { n: "Besta Pesada", dmg: "1d10 perfurante", prop: "Mun (30/120), Recarga, Pesada" },
  { n: "Besta Mão", dmg: "1d6 perfurante", prop: "Mun (9/36), Leve, Recarga" }
];

export const ARMOR_DB: Record<string, { n: string, ac: number, type: 'light' | 'medium' | 'heavy' | 'shield', dexMax?: number, minStr?: number, stealthDis?: boolean }> = {
  // Leves
  "Acolchoada": { n: "Acolchoada", ac: 11, type: "light", stealthDis: true },
  "Couro": { n: "Couro", ac: 11, type: "light" },
  "Couro Batido": { n: "Couro Batido", ac: 12, type: "light" },
  // Médias
  "Gibão de Peles": { n: "Gibão de Peles", ac: 12, type: "medium", dexMax: 2 },
  "Camisão de Malha": { n: "Camisão de Malha", ac: 13, type: "medium", dexMax: 2 },
  "Brunea": { n: "Brunea", ac: 14, type: "medium", dexMax: 2, stealthDis: true },
  "Peitoral": { n: "Peitoral", ac: 14, type: "medium", dexMax: 2 },
  "Meia-Armadura": { n: "Meia-Armadura", ac: 15, type: "medium", dexMax: 2, stealthDis: true },
  // Pesadas
  "Cota de Anéis": { n: "Cota de Anéis", ac: 14, type: "heavy", dexMax: 0, stealthDis: true },
  "Cota de Malha": { n: "Cota de Malha", ac: 16, type: "heavy", dexMax: 0, minStr: 13, stealthDis: true },
  "Cota de Talas": { n: "Cota de Talas", ac: 17, type: "heavy", dexMax: 0, minStr: 15, stealthDis: true },
  "Placas": { n: "Placas", ac: 18, type: "heavy", dexMax: 0, minStr: 15, stealthDis: true },
  // Escudo
  "Escudo": { n: "Escudo", ac: 2, type: "shield" }
};

export const DEFAULT_MONSTERS: Monster[] = [
  { id: 120, name: "Prisioneiro (Enfraquecido)", type: "Humanóide", cr: "0", ac: 10, hp: 4, speed: "9m", actions: [{n: "Soco", hit: 2, dmg: "1"}] },
  { id: 101, name: "Plebeu", type: "Humanóide", cr: "0", ac: 10, hp: 4, speed: "9m", actions: [{n: "Clava", hit: 2, dmg: "1d4"}] },
  { id: 109, name: "Kobold", type: "Humanóide", cr: "1/8", ac: 12, hp: 5, speed: "9m", actions: [{n: "Adaga", hit: 4, dmg: "1d4+2"}, {n: "Funda", hit: 4, dmg: "1d4+2"}], traits: [{n: "Táticas de Matilha", d: "Vantagem se aliado estiver a 1.5m do alvo."}, {n: "Sensibilidade à Luz", d: "Desvantagem em ataques sob luz solar."}] },
  { id: 107, name: "Bandido", type: "Humanóide", cr: "1/8", ac: 12, hp: 11, speed: "9m", actions: [{n: "Cimitarra", hit: 3, dmg: "1d6+1"}, {n: "Besta Leve", hit: 3, dmg: "1d8+1"}] },
  { id: 110, name: "Guarda (Recruta)", type: "Humanóide", cr: "1/8", ac: 16, hp: 11, speed: "9m", actions: [{n: "Lança", hit: 3, dmg: "1d6+1"}] },
  { id: 121, name: "Prisioneiro (Criminoso)", type: "Humanóide", cr: "1/8", ac: 11, hp: 11, speed: "9m", actions: [{n: "Faca Improvisada", hit: 3, dmg: "1d4+1"}] },
  { id: 102, name: "Goblin", type: "Humanóide", cr: "1/4", ac: 15, hp: 7, speed: "9m", 
    actions: [{n: "Cimitarra", hit: 4, dmg: "1d6+2"}, {n: "Arco Curto", hit: 4, dmg: "1d6+2"}],
    traits: [{n: "Escapar Ágil", d: "Pode usar Desengajar ou Esconder como ação bônus."}]
  },
  { id: 103, name: "Esqueleto", type: "Morto-vivo", cr: "1/4", ac: 13, hp: 13, speed: "9m", 
    actions: [{n: "Espada Curta", hit: 4, dmg: "1d6+2"}, {n: "Arco Curto", hit: 4, dmg: "1d6+2"}],
    traits: [{n: "Vulnerabilidade", d: "Dano de concussão."}] 
  },
  { id: 104, name: "Zumbi", type: "Morto-vivo", cr: "1/4", ac: 8, hp: 22, speed: "6m", 
    actions: [{n: "Pancada", hit: 3, dmg: "1d6+1"}],
    traits: [{n: "Fortitude de Morto-Vivo", d: "Se cair a 0 PV, chance de voltar com 1 PV (CD 5+dano)."}]
  },
  { id: 108, name: "Lobo", type: "Fera", cr: "1/4", ac: 13, hp: 11, speed: "12m", 
    actions: [{n: "Mordida", hit: 4, dmg: "2d4+2 | CD 11 For ou Caído"}],
    traits: [{n: "Táticas de Matilha", d: "Vantagem se aliado estiver a 1.5m do alvo."}, {n: "Audição e Olfato Apurados", d: "Vantagem em Percepção."}]
  },
  { id: 122, name: "Prisioneiro (Cultista)", type: "Humanóide", cr: "1/4", ac: 12, hp: 9, speed: "9m", actions: [{n: "Adaga", hit: 3, dmg: "1d4+1"}], spells: ["Chama Sagrada (1d8)", "Taumaturgia"] },
  { id: 111, name: "Guarda (Carcereiro)", type: "Humanóide", cr: "1/2", ac: 14, hp: 16, speed: "9m", actions: [{n: "Arco Longo", hit: 3, dmg: "1d8+1"}, {n: "Espada Curta", hit: 4, dmg: "1d6+2"}, {n: "Rede", hit: 3, dmg: "Contenção"}] },
  { id: 123, name: "Prisioneiro (Bruto)", type: "Humanóide", cr: "1/2", ac: 13, hp: 32, speed: "9m", actions: [{n: "Ataque Múltiplo", hit: 4, dmg: "2x"}, {n: "Ataque Desarmado", hit: 4, dmg: "1d4+2"}] },
  { id: 105, name: "Orc", type: "Humanóide", cr: "1/2", ac: 13, hp: 15, speed: "9m", 
    actions: [{n: "Machado Grande", hit: 5, dmg: "1d12+3"}, {n: "Azagaia", hit: 5, dmg: "1d6+3"}],
    traits: [{n: "Agressivo", d: "Ação bônus para mover até seu deslocamento em direção a inimigo."}]
  },
  { id: 106, name: "Gnoll", type: "Humanóide", cr: "1/2", ac: 15, hp: 22, speed: "9m", 
    actions: [{n: "Mordida", hit: 4, dmg: "1d4+2"}, {n: "Lança", hit: 4, dmg: "1d8+2"}, {n: "Arco Longo", hit: 3, dmg: "1d8+1"}],
    traits: [{n: "Frenesi", d: "Quando reduz criatura a 0 PV, pode fazer ataque de mordida como ação bônus."}]
  },
  { id: 201, name: "Urso Marrom", type: "Fera", cr: "1", ac: 11, hp: 34, speed: "12m", actions: [{n: "Multiataque", hit: 6, dmg: "Mordida + Garra"}, {n: "Mordida", hit: 6, dmg: "1d8+4"}, {n: "Garras", hit: 6, dmg: "2d6+4"}] },
  { id: 206, name: "Lobo Atroz", type: "Fera", cr: "1", ac: 14, hp: 37, speed: "15m", 
    actions: [{n: "Mordida", hit: 5, dmg: "2d6+3 | CD 13 For ou Caído"}],
    traits: [{n: "Táticas de Matilha", d: "Vantagem se aliado estiver a 1.5m do alvo."}]
  },
  { id: 701, name: "Diabrete (Imp)", type: "Infernal", cr: "1", ac: 13, hp: 10, speed: "6m/12m voo", actions: [{n: "Ferrão", hit: 5, dmg: "1d4+3 + 3d6 veneno (CD 11 Con metade)"}], traits: [{n: "Invisibilidade", d: "Ação para ficar invisível."}, {n: "Resistência à Magia", d: "Vantagem em testes de resistência."}] },
  { id: 202, name: "Harpia", type: "Monstruosidade", cr: "1", ac: 11, hp: 38, speed: "6m/12m voo", actions: [{n: "Multiataque", hit: 3, dmg: "2x"}, {n: "Garras", hit: 3, dmg: "2d4+1"}, {n: "Clava", hit: 3, dmg: "1d4+1"}, {n: "Canção Sedutora", hit: 0, dmg: "CD 11 Sab ou Enfeitiçado"}] },
  { id: 203, name: "Cubo Gelatinoso", type: "Limo", cr: "2", ac: 6, hp: 84, speed: "4.5m", actions: [{n: "Pseudópode", hit: 4, dmg: "3d6+1d6 ácido"}, {n: "Engolfar", hit: 0, dmg: "CD 12 Des ou 6d6 ácido + Preso"}], traits: [{n: "Transparente", d: "CD 15 Percepção para notar."}] },
  { id: 204, name: "Ogro", type: "Gigante", cr: "2", ac: 11, hp: 59, speed: "12m", actions: [{n: "Clava Grande", hit: 6, dmg: "2d8+4"}, {n: "Azagaia", hit: 6, dmg: "2d6+4"}] },
  { id: 205, name: "Mímico", type: "Monstruosidade", cr: "2", ac: 12, hp: 58, speed: "4.5m", 
    actions: [{n: "Pseudópode", hit: 5, dmg: "1d8+3 + Agarrado"}, {n: "Mordida", hit: 5, dmg: "1d8+3 + 1d8 ácido"}],
    traits: [{n: "Aderente", d: "Criaturas tocadas ficam presas (CD 13 Força)."}, {n: "Aparência Falsa", d: "Indistinguível de objeto enquanto imóvel."}]
  },
  { id: 702, name: "Grifo", type: "Monstruosidade", cr: "2", ac: 12, hp: 59, speed: "9m/24m voo", actions: [{n: "Multiataque", hit: 6, dmg: "Bico + Garra"}, {n: "Bico", hit: 6, dmg: "1d8+4"}, {n: "Garras", hit: 6, dmg: "2d6+4"}] },
  { id: 207, name: "Capitão dos Bandidos", type: "Humanóide", cr: "2", ac: 15, hp: 65, speed: "9m", actions: [{n: "Multiataque", hit: 5, dmg: "2x Cimitarra + 1x Adaga"}, {n: "Cimitarra", hit: 5, dmg: "1d6+3"}, {n: "Adaga", hit: 5, dmg: "1d4+3"}], traits: [{n: "Aparar", d: "Reação: +2 CA contra um ataque corpo a corpo."}] },
  { id: 113, name: "Guarda (Mago de Combate)", type: "Humanóide", cr: "2", ac: 12, hp: 45, speed: "9m", actions: [{n: "Bordão", hit: 2, dmg: "1d6"}], spells: ["Mísseis Mágicos (3x1d4+1)", "Onda Trovejante (2d8)", "Teia (CD 13)", "Escudo Arcano (+5 CA)"] },
  { id: 301, name: "Urso Coruja", type: "Monstruosidade", cr: "3", ac: 13, hp: 59, speed: "12m", actions: [{n: "Multiataque", hit: 7, dmg: "Bico + Garra"}, {n: "Bico", hit: 7, dmg: "1d10+5"}, {n: "Garras", hit: 7, dmg: "2d8+5"}] },
  { id: 302, name: "Lobisomem", type: "Humanóide", cr: "3", ac: 12, hp: 58, speed: "12m", actions: [{n: "Multiataque", hit: 4, dmg: "Mordida + Garra (Híbrido)"}, {n: "Mordida", hit: 4, dmg: "1d8+2 + CD 12 Con Maldição"}, {n: "Garras", hit: 4, dmg: "2d4+2"}, {n: "Lança", hit: 4, dmg: "1d8+2"}], traits: [{n: "Imunidade", d: "Dano cortante/perfurante/concussão de armas não-mágicas."}] },
  { id: 308, name: "Basilisco", type: "Monstruosidade", cr: "3", ac: 15, hp: 52, speed: "6m", actions: [{n: "Mordida", hit: 5, dmg: "2d6+3 + 2d6 veneno"}], traits: [{n: "Olhar Petrificante", d: "CD 12 Con ou petrificado."}] },
  { id: 703, name: "Mantícora", type: "Monstruosidade", cr: "3", ac: 14, hp: 68, speed: "9m/15m voo", actions: [{n: "Multiataque", hit: 5, dmg: "Mordida + 2x Garra"}, {n: "Mordida", hit: 5, dmg: "1d8+3"}, {n: "Garras", hit: 5, dmg: "2d6+3"}, {n: "Espinhos da Cauda", hit: 5, dmg: "1d8+3 (x3)"}] },
  { id: 112, name: "Guarda (Sargento)", type: "Humanóide", cr: "3", ac: 18, hp: 52, speed: "9m", actions: [{n: "Multiataque", hit: 5, dmg: "2x"}, {n: "Espada Grande", hit: 5, dmg: "2d6+3"}, {n: "Besta Pesada", hit: 3, dmg: "1d10"}], traits: [{n: "Liderança", d: "Aliados a 9m ganham +1d4 em ataques."}] },
  { id: 303, name: "Fantasma", type: "Morto-vivo", cr: "4", ac: 11, hp: 45, speed: "12m voo", actions: [{n: "Toque Debilitante", hit: 5, dmg: "4d6+3 necrótico"}, {n: "Possessão", hit: 0, dmg: "CD 13 Car ou Controlado"}], traits: [{n: "Movimento Incorpóreo", d: "Pode atravessar objetos e criaturas."}] },
  { id: 309, name: "Banshee", type: "Morto-vivo", cr: "4", ac: 12, hp: 58, speed: "0m/12m voo", actions: [{n: "Toque Corruptor", hit: 4, dmg: "3d6+2 necrótico"}, {n: "Lamento", hit: 0, dmg: "CD 13 Con ou 0 PV (1/dia)"}], traits: [{n: "Detectar Vida", d: "Sente vida a 8km."}] },
  { id: 704, name: "Ettin", type: "Gigante", cr: "4", ac: 12, hp: 85, speed: "12m", actions: [{n: "Multiataque", hit: 7, dmg: "Machado + Maça"}, {n: "Machado de Batalha", hit: 7, dmg: "2d8+5"}, {n: "Maça Estrela", hit: 7, dmg: "2d8+5"}], traits: [{n: "Duas Cabeças", d: "Vantagem em Percepção e testes contra cegueira/encantamento."}] },
  { id: 304, name: "Beholder Zumbi", type: "Morto-vivo", cr: "5", ac: 15, hp: 93, speed: "0m/9m voo", actions: [{n: "Mordida", hit: 5, dmg: "3d6"}, {n: "Raio Ocular", hit: 5, dmg: "CD 14 (Des/Con/Sab/For) 3d6 (Var)"}] },
  { id: 305, name: "Vampiro (Cria)", type: "Morto-vivo", cr: "5", ac: 15, hp: 82, speed: "9m", actions: [{n: "Multiataque", hit: 6, dmg: "2x"}, {n: "Garras", hit: 6, dmg: "2d4+3"}, {n: "Mordida", hit: 6, dmg: "1d6+3 + 2d6 necrótico"}], traits: [{n: "Regeneração", d: "Recupera 10 PV no início do turno se não levar dano radiante/solar."}] },
  { id: 306, name: "Troll", type: "Gigante", cr: "5", ac: 15, hp: 84, speed: "9m", actions: [{n: "Multiataque", hit: 7, dmg: "Mordida + 2x Garra"}, {n: "Mordida", hit: 7, dmg: "1d6+4"}, {n: "Garras", hit: 7, dmg: "2d6+4"}], traits: [{n: "Regeneração", d: "Recupera 10 PV se não levar dano de fogo/ácido."}] },
  { id: 307, name: "Gladiador", type: "Humanóide", cr: "5", ac: 16, hp: 112, speed: "9m", actions: [{n: "Multiataque", hit: 7, dmg: "3x Corpo a Corpo"}, {n: "Lança", hit: 7, dmg: "2d6+4"}, {n: "Escudada", hit: 7, dmg: "1d4+4 + Derrubar (CD 15 For)"}], traits: [{n: "Bravura", d: "Vantagem contra medo."}] },
  { id: 705, name: "Elemental da Terra", type: "Elemental", cr: "5", ac: 17, hp: 126, speed: "9m/9m escavar", actions: [{n: "Multiataque", hit: 8, dmg: "2x"}, {n: "Pancada", hit: 8, dmg: "2d8+5"}], traits: [{n: "Cerco", d: "Dobra o dano contra objetos e estruturas."}] },
  { id: 310, name: "Quimera", type: "Monstruosidade", cr: "6", ac: 14, hp: 114, speed: "9m/18m voo", actions: [{n: "Multiataque", hit: 7, dmg: "Mordida + Chifres + Garras"}, {n: "Mordida", hit: 7, dmg: "2d6+4"}, {n: "Chifres", hit: 7, dmg: "1d12+4"}, {n: "Garras", hit: 7, dmg: "2d6+4"}, {n: "Sopro de Fogo", hit: 0, dmg: "7d8 (CD 15) Recarga 5-6"}] },
  { id: 404, name: "Devorador de Mentes", type: "Aberração", cr: "7", ac: 15, hp: 71, speed: "9m", actions: [{n: "Tentáculos", hit: 7, dmg: "2d10+4 + Agarrado"}, {n: "Extrair Cérebro", hit: 7, dmg: "10d10 perfurante"}, {n: "Rajada Mental", hit: 0, dmg: "4d8+4 (CD 15 Int)"}], spells: ["Detectar Pensamentos", "Levitação", "Invisibilidade", "Domar Monstro"] },
  { id: 401, name: "Dragão Vermelho Jovem", type: "Dragão", cr: "10", ac: 18, hp: 178, speed: "12m/24m voo", actions: [{n: "Multiataque", hit: 10, dmg: "Mordida + 2x Garra"}, {n: "Mordida", hit: 10, dmg: "2d10+6+1d6 fogo"}, {n: "Garras", hit: 10, dmg: "2d6+6"}, {n: "Sopro de Fogo", hit: 0, dmg: "16d6 fogo (CD 17 Des) Recarga 5-6"}] },
  { id: 403, name: "Gigante da Tempestade", type: "Gigante", cr: "13", ac: 16, hp: 230, speed: "15m", 
    actions: [{n: "Multiataque", hit: 14, dmg: "2x Espada Grande"}, {n: "Espada Grande", hit: 14, dmg: "6d6+9"}, {n: "Relâmpago", hit: 0, dmg: "12d8 (CD 17) Recarga 5-6"}],
    traits: [{n: "Anfíbio", d: "Respira ar e água."}, {n: "Imunidade", d: "Elétrico e Trovão."}]
  },
  { id: 405, name: "Dragão Negro Adulto", type: "Dragão", cr: "14", ac: 19, hp: 195, speed: "12m/24m voo", actions: [{n: "Multiataque", hit: 11, dmg: "Mordida + 2x Garra"}, {n: "Mordida", hit: 11, dmg: "2d10+6 + 1d8 ácido"}, {n: "Garras", hit: 11, dmg: "2d6+6"}, {n: "Cauda", hit: 11, dmg: "2d8+6"}, {n: "Sopro Ácido", hit: 0, dmg: "12d8 (CD 18 Des) Recarga 5-6"}], traits: [{n: "Lendário (3/Turno)", d: "Pode usar ações lendárias no fim do turno de outros (Cauda, Asas)."}] },
  { id: 402, name: "Lich", type: "Morto-vivo", cr: "21", ac: 17, hp: 135, speed: "9m", 
    actions: [{n: "Toque Paralisante", hit: 12, dmg: "3d6 frio + CD 18 Con ou Paralisado"}, {n: "Disrupt Life (Lendário)", hit: 0, dmg: "6d6 necrótico (CD 18 Con)"}],
    spells: ["Raio de Gelo", "Mãos Mágicas", "Escudo Arcano", "Mísseis Mágicos", "Detectar Magia", "Bola de Fogo", "Contramágica", "Dedo da Morte", "Palavra de Poder: Matar"],
    traits: [{n: "Resistência Lendária (3/Dia)", d: "Se falhar em teste de resistência, pode escolher passar."}, {n: "Rejuvenescimento", d: "Se tiver filactéria, ganha novo corpo em 1d10 dias."}]
  },
  { id: 999, name: "Tarrasque", type: "Monstruosidade", cr: "30", ac: 25, hp: 676, speed: "12m", 
    actions: [{n: "Multiataque", hit: 19, dmg: "Mordida + 2x Garra + Chifres + Cauda"}, {n: "Mordida", hit: 19, dmg: "4d12+10 + Agarrado"}, {n: "Garras", hit: 19, dmg: "4d8+10"}, {n: "Cauda", hit: 19, dmg: "4d6+10 + CD 20 For ou Caído"}, {n: "Chifres", hit: 19, dmg: "4d10+10"}],
    traits: [{n: "Carapaça Refletiva", d: "Imune a mísseis mágicos e magias de linha/raio."}, {n: "Resistência Lendária (3/Dia)", d: "Passa no teste se falhar."}]
  }
];

export const MAP_ASSETS = {
  struct: [
      {c:'⬛', n:'Parede Pedra', t:'base'}, {c:'🧱', n:'Parede Tijolo', t:'base'},
      {c:'⬜', n:'Chão Pedra', t:'base'}, {c:'🟫', n:'Chão Madeira', t:'base'},
      {c:'🚪', n:'Porta', t:'obj'}, {c:'🪜', n:'Escada', t:'obj'},
      {c:'🌫️', n:'Água/Gás', t:'base'}, {c:'🔥', n:'Lava', t:'base'}
  ],
  furniture: [
      {c:'🪑', n:'Cadeira', t:'obj'}, {c:'🪵', n:'Mesa', t:'obj'},
      {c:'🛏️', n:'Cama', t:'obj'}, {c:'👑', n:'Trono', t:'obj'},
      {c:'📦', n:'Baú', t:'obj'}, {c:'🕯️', n:'Castiçal', t:'obj'}
  ],
  dungeon: [
      {c:'💀', n:'Crânio', t:'obj'}, {c:'⛓️', n:'Correntes', t:'obj'},
      {c:'🕸️', n:'Teia', t:'obj'}, {c:'🩸', n:'Sangue', t:'obj'},
      {c:'⚙️', n:'Armadilha', t:'obj'}
  ],
  nature: [
      {c:'🌲', n:'Pinheiro', t:'obj'}, {c:'🪨', n:'Rocha', t:'obj'},
      {c:'🌿', n:'Arbusto', t:'obj'}, {c:'🍄', n:'Cogumelo', t:'obj'}
  ]
};

export const SKILL_LIST = [
  {id:'acrobacia', n:'Acrobacia', a:'dex'}, {id:'adestrar', n:'Adestrar Animais', a:'wis'},
  {id:'arcanismo', n:'Arcanismo', a:'int'}, {id:'atletismo', n:'Atletismo', a:'str'},
  {id:'atuacao', n:'Atuação', a:'cha'}, {id:'enganacao', n:'Enganação', a:'cha'},
  {id:'furtividade', n:'Furtividade', a:'dex'}, {id:'historia', n:'História', a:'int'},
  {id:'intimidacao', n:'Intimidação', a:'cha'}, {id:'intuicao', n:'Intuição', a:'wis'},
  {id:'investigacao', n:'Investigação', a:'int'}, {id:'medicina', n:'Medicina', a:'wis'},
  {id:'natureza', n:'Natureza', a:'int'}, {id:'natureza', n:'Natureza', a:'int'},
  {id:'percepcao', n:'Percepção', a:'wis'}, {id:'persuasao', n:'Persuasão', a:'cha'},
  {id:'prestidigitacao', n:'Prestidigitação', a:'dex'}, {id:'religiao', n:'Religião', a:'int'},
  {id:'sobrevivencia', n:'Sobrevivência', a:'wis'}
];
