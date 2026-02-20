
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
  feats: [],
  exhaustion: 0,
  imageUrl: ""
};

export const FEATS_DB: Record<string, string> = {
  "Alerta": "+5 na iniciativa. Você não pode ser surpreso enquanto estiver consciente. Outras criaturas não ganham vantagem em jogadas de ataque contra você por estarem escondidas.",
  "Atirador de Elite": "Atacar a longo alcance não impõe desvantagem. Seus ataques à distância ignoram meia cobertura e três quartos de cobertura. Antes de atacar, você pode escolher -5 no acerto para +10 no dano.",
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
  "Explorador de Masmorras": "Vantagem em Sabedoria (Percepção) e Inteligência (Investigação) para achar portas secretas. Vantagem em resistência contra armadilhas. Resistência a dano de armadilhas. Viaja rápido sem penalidade.",
  "Iniciado em Magia": "Escolha Bardo, Clérigo, Druida, Feiticeiro, Bruxo ou Mago. Aprenda 2 truques e 1 magia de 1º nível (uma vez por dia longo).",
  "Líder Inspirador": "Requer Car 13. Gasta 10 min para inspirar 6 aliados. Eles ganham PV temporários igual ao seu nível + mod Carisma. Uma vez por descanso curto.",
  "Mestre de Armas": "Aumente Força ou Destreza em 1. Ganha proficiência em 4 armas à sua escolha.",
  "Mestre de Armas de Haste": "Ao atacar com glaive, alabarda ou bastão, pode usar bônus para ataque com cabo (1d4 concussão). Inimigos provocam oportunidade ao entrar no alcance.",
  "Mestre de Armas Grandes": "Ao fazer crítico ou reduzir criatura a 0, pode fazer ataque extra como bônus. Antes de atacar com arma pesada, pode escolher -5 no acerto para +10 no dano.",
  "Mestre de Armadura Média": "Requer Armadura Média. Não tem desvantagem em Furtividade. Pode somar +3 de Destreza na CA em vez de +2.",
  "Mestre de Armadura Pesada": "Requer Armadura Pesada. Aumente Força em 1. Reduz dano de concussão, cortante e perfurante de armas não-mágicas em 3.",
  "Mestre de Escudo": "Se atacar, pode usar bônus para empurrar com escudo. Adiciona bônus de escudo em testes de Des contra magias. Se passar em save de Des para meio dano, não toma nenhum.",
  "Móvel": "Aumente deslocamento em 3m. Dash em terreno difícil não custa extra. Se atacar criatura corpo a corpo, não provoca oportunidade dela neste turno.",
  "Observador": "Aumente Int ou Sab em 1. Se puder ver boca, entende o que é dito. +5 em Percepção e Investigação passivas.",
  "Perito": "Ganhe proficiência em 3 perícias ou ferramentas à sua escolha.",
  "Resiliente": "Aumente um atributo em 1. Ganhe proficiência em testes de resistência desse atributo.",
  "Robusto": "Seus pontos de vida máximos aumentam em 2x seu nível. A cada nível ganha +2 PV.",
  "Sentinela": "Ao acertar oportunidade, deslocamento do alvo vira 0. Provoca oportunidade mesmo se fizerem Desengajar. Se inimigo atacar outro alvo a 1,5m, você pode usar reação para atacar esse inimigo.",
  "Sortudo": "3 pontos de sorte por dia longo. Pode gastar 1 para rolar d20 adicional em ataque, teste ou resistência e escolher resultado. Pode usar para fazer inimigo rolar d20 extra e escolher.",
  "Matador de Magos": "Reação para atacar criatura a 1,5m que conjure magia. Dano em mago concentrando impõe desvantagem no teste. Vantagem em resistência contra magias de criaturas a 1,5m."
};

export const FEAT_PREREQUISITES: Record<string, { attr?: Record<string, number>; class?: string[]; armor?: string }> = {
  "Mestre de Armadura Pesada": { armor: "heavy" },
  "Mestre de Armadura Média": { armor: "medium" },
  "Líder Inspirador": { attr: { cha: 13 } },
  "Conjurador de Ritual": { attr: { int: 13 } },
  "Duelista Defensivo": { attr: { dex: 13 } },
  "Brigão de Taverna": { attr: { str: 13 } }
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

export const ARMOR_DB: Record<string, { n: string, ac: number, type: 'light' | 'medium' | 'heavy' | 'shield', stealthDis?: boolean, cost: number, weight: string }> = {
  'Couro': { n: 'Couro', ac: 11, type: 'light', cost: 10, weight: '5kg' },
  'Couro Batido': { n: 'Couro Batido', ac: 12, type: 'light', cost: 45, weight: '6.5kg' },
  'Camisão de Malha': { n: 'Camisão de Malha', ac: 13, type: 'medium', cost: 50, weight: '10kg' },
  'Peitoral': { n: 'Peitoral', ac: 14, type: 'medium', cost: 400, weight: '10kg' },
  'Meia-Armadura': { n: 'Meia-Armadura', ac: 15, type: 'medium', stealthDis: true, cost: 750, weight: '20kg' },
  'Cota de Malha': { n: 'Cota de Malha', ac: 16, type: 'heavy', stealthDis: true, cost: 75, weight: '27.5kg' },
  'Cota de Talas': { n: 'Cota de Talas', ac: 17, type: 'heavy', stealthDis: true, cost: 200, weight: '30kg' },
  'Placas': { n: 'Placas', ac: 18, type: 'heavy', stealthDis: true, cost: 1500, weight: '32.5kg' },
  'Escudo': { n: 'Escudo', ac: 2, type: 'shield', cost: 10, weight: '3kg' }
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

export const CREATURE_IMAGES = [
  "aelion.PNG", "alair.png", "aranha.PNG", "aranha_menor.PNG", "aranha_metalica.PNG", 
  "arquimago.PNG", "artf.PNG", "askhael.png", "aslan.PNG", "assassino_culto.PNG", 
  "assassino_vapor.PNG", "automato.PNG", "bandido.PNG", "banshee.PNG", "barbaro_golias.PNG", 
  "barbaro_meioorc.PNG", "bardo_kenku.PNG", "basilisco.PNG", "basilisco_1.PNG", "beholder.PNG", 
  "beholder_zumbi.PNG", "bruxo_tiefling.PNG", "capitão_dos_bandidos.PNG", "centopeia.PNG", 
  "clerigo.PNG", "cobra.PNG", "devorador_de_mentes.PNG", "diabrete.PNG", "dragao.PNG", 
  "dragao_negro.PNG", "druida_tortie.PNG", "duida_elfo.PNG", "elemental_da_terra.PNG", 
  "escorpiao.PNG", "esqueleto.PNG", "esqueleto_guerreiro.PNG", "esqueleto_ruina.PNG", 
  "fantasma.PNG", "fantasma_1.PNG", "gargula.PNG", "gargula_lata.PNG", "gigante_da_tempestade.PNG", 
  "gladiador.PNG", "gladiador_1.PNG", "gnoll.PNG", "gnu.PNG", "goblin.PNG", "goblin_1.PNG", 
  "goblin_arqueiro.PNG", "goblin_ladrão.PNG", "golem_ferro.PNG", "grifo.PNG", "guarda_canino.PNG", 
  "guarda_carcereiro.PNG", "guarda_carcereiro_2.PNG", "guarda_gigante.PNG", "guarda_mago.PNG", 
  "guarda_real.PNG", "guarda_recruta.PNG", "guarda_sargento.PNG", "guerreira_githyanki.PNG", 
  "harpia.PNG", "harpia_1.PNG", "kobold.PNG", "ladino_hafling.PNG", "lich.PNG", "lich_1.PNG", 
  "lobisomen.PNG", "lobisomen_1.PNG", "lobo.PNG", "lobo_atroz.PNG", "lorack.PNG", "mago.PNG", 
  "mago_negro.PNG", "manticora.PNG", "manticora_1.PNG", "mimic.PNG", "mimic_1.PNG", "minotauro.PNG", 
  "monge_tabaxi.PNG", "morcego.PNG", "morcego_1.PNG", "ogro.PNG", "ogro_1.PNG", "ogro_duas_cabeças.PNG", 
  "ogro_gigante.PNG", "orc.PNG", "orc_2.PNG", "orc_3.PNG", "orc_cavalheiro.PNG", "paladino_draconato.PNG", 
  "plebeu.PNG", "prisioneiro_anão.PNG", "prisioneiro_bruto.PNG", "prisioneiro_bruto_2.PNG", 
  "prisioneiro_criminoso.PNG", "prisioneiro_cultista.PNG", "prisioneiro_cultista_2.PNG", 
  "prisioneiro_elfa.PNG", "prisioneiro_enfraquecido.PNG", "prisioneiro_nobre.PNG", "quimera.PNG", 
  "rato.PNG", "rei_demonio.PNG", "saeel.PNG", "sapo.PNG", "silime_2.PNG", "slime.PNG", "slime_1.PNG", 
  "snow.PNG", "tarrasque.PNG", "touro_metalico.PNG", "troll.PNG", "urso.PNG", "urso_atroz.PNG", 
  "urso_coruja.PNG", "vampiro.PNG", "vampiro_cria.PNG", "verme.PNG", "vespa.PNG", "zumbi.PNG"
].map(f => `/textures/creatures/${f}`);

export const DEFAULT_MONSTERS: Monster[] = [
    // --- 000-099: Low Challenge / Common ---
    { id: 100, name: "Aranha", type: "Fera", cr: "0", ac: 12, hp: 1, speed: "6m", actions: [{n: "Mordida", hit: 4, dmg: "1"}], imageUrl: "/textures/creatures/aranha_menor.PNG" },
    { id: 101, name: "Plebeu", type: "Humanóide", cr: "0", ac: 10, hp: 4, speed: "9m", actions: [{n: "Clava", hit: 2, dmg: "1d4"}], imageUrl: "/textures/creatures/plebeu.PNG" },
    { id: 102, name: "Prisioneiro (Enfraquecido)", type: "Humanóide", cr: "0", ac: 10, hp: 4, speed: "9m", actions: [{n: "Soco", hit: 2, dmg: "1"}], imageUrl: "/textures/creatures/prisioneiro_enfraquecido.PNG" },
    { id: 103, name: "Rato Gigante", type: "Fera", cr: "1/8", ac: 12, hp: 7, speed: "9m", actions: [{n: "Mordida", hit: 4, dmg: "1d4+2"}], imageUrl: "/textures/creatures/rato.PNG" },
    { id: 104, name: "Bandido", type: "Humanóide", cr: "1/8", ac: 12, hp: 11, speed: "9m", actions: [{n: "Cimitarra", hit: 3, dmg: "1d6+1"}, {n: "Besta Leve", hit: 3, dmg: "1d8+1"}], imageUrl: "/textures/creatures/bandido.PNG" },
    { id: 105, name: "Kobold", type: "Humanóide", cr: "1/8", ac: 12, hp: 5, speed: "9m", actions: [{n: "Adaga", hit: 4, dmg: "1d4+2"}, {n: "Funda", hit: 4, dmg: "1d4+2"}], traits: [{n: "Táticas de Matilha", d: "Vantagem se aliado estiver a 1.5m do alvo."}, {n: "Sensibilidade à Luz", d: "Desvantagem em ataques sob luz solar."}], imageUrl: "/textures/creatures/kobold.PNG" },
    { id: 106, name: "Guarda (Recruta)", type: "Humanóide", cr: "1/8", ac: 16, hp: 11, speed: "9m", actions: [{n: "Lança", hit: 3, dmg: "1d6+1"}], imageUrl: "/textures/creatures/guarda_recruta.PNG" },
    { id: 107, name: "Prisioneiro (Criminoso)", type: "Humanóide", cr: "1/8", ac: 11, hp: 11, speed: "9m", actions: [{n: "Faca Improvisada", hit: 3, dmg: "1d4+1"}], imageUrl: "/textures/creatures/prisioneiro_criminoso.PNG" },
    { id: 108, name: "Goblin", type: "Humanóide", cr: "1/4", ac: 15, hp: 7, speed: "9m", actions: [{n: "Cimitarra", hit: 4, dmg: "1d6+2"}, {n: "Arco Curto", hit: 4, dmg: "1d6+2"}], traits: [{n: "Escapar Ágil", d: "Pode usar Desengajar ou Esconder como ação bônus."}], imageUrl: "/textures/creatures/goblin.PNG" },
    { id: 109, name: "Goblin (Guerreiro)", type: "Humanóide", cr: "1/4", ac: 15, hp: 10, speed: "9m", actions: [{n: "Machadinha", hit: 4, dmg: "1d6+2"}], imageUrl: "/textures/creatures/goblin_1.PNG" },
    { id: 110, name: "Goblin Arqueiro", type: "Humanóide", cr: "1/4", ac: 14, hp: 7, speed: "9m", actions: [{n: "Arco Curto", hit: 4, dmg: "1d6+2"}], imageUrl: "/textures/creatures/goblin_arqueiro.PNG" },
    { id: 111, name: "Goblin Ladrão", type: "Humanóide", cr: "1/4", ac: 14, hp: 9, speed: "9m", actions: [{n: "Adaga", hit: 5, dmg: "1d4+3"}], imageUrl: "/textures/creatures/goblin_ladrão.PNG" },
    { id: 112, name: "Esqueleto", type: "Morto-vivo", cr: "1/4", ac: 13, hp: 13, speed: "9m", actions: [{n: "Espada Curta", hit: 4, dmg: "1d6+2"}, {n: "Arco Curto", hit: 4, dmg: "1d6+2"}], traits: [{n: "Vulnerabilidade", d: "Dano de concussão."}], imageUrl: "/textures/creatures/esqueleto.PNG" },
    { id: 113, name: "Zumbi", type: "Morto-vivo", cr: "1/4", ac: 8, hp: 22, speed: "6m", actions: [{n: "Pancada", hit: 3, dmg: "1d6+1"}], traits: [{n: "Fortitude de Morto-Vivo", d: "Se cair a 0 PV, chance de voltar com 1 PV (CD 5+dano)."}], imageUrl: "/textures/creatures/zumbi.PNG" },
    { id: 114, name: "Cobra Venenosa", type: "Fera", cr: "1/4", ac: 13, hp: 13, speed: "9m", actions: [{n: "Mordida", hit: 5, dmg: "1d1+1 + 2d4 veneno"}], imageUrl: "/textures/creatures/cobra.PNG" },
    { id: 115, name: "Prisioneiro (Cultista)", type: "Humanóide", cr: "1/4", ac: 12, hp: 9, speed: "9m", actions: [{n: "Adaga", hit: 3, dmg: "1d4+1"}], spells: ["Chama Sagrada (1d8)", "Taumaturgia"], imageUrl: "/textures/creatures/prisioneiro_cultista.PNG" },
    { id: 116, name: "Lobo", type: "Fera", cr: "1/4", ac: 13, hp: 11, speed: "12m", actions: [{n: "Mordida", hit: 4, dmg: "2d4+2 | CD 11 For ou Caído"}], traits: [{n: "Táticas de Matilha", d: "Vantagem se aliado estiver a 1.5m do alvo."}], imageUrl: "/textures/creatures/lobo.PNG" },
    { id: 117, name: "Esqueleto Guerreiro", type: "Morto-vivo", cr: "1/2", ac: 14, hp: 20, speed: "9m", actions: [{n: "Espada Longa", hit: 4, dmg: "1d8+2"}], imageUrl: "/textures/creatures/esqueleto_guerreiro.PNG" },
    { id: 118, name: "Orc", type: "Humanóide", cr: "1/2", ac: 13, hp: 15, speed: "9m", actions: [{n: "Machado Grande", hit: 5, dmg: "1d12+3"}, {n: "Azagaia", hit: 5, dmg: "1d6+3"}], traits: [{n: "Agressivo", d: "Ação bônus para mover até seu deslocamento em direção a inimigo."}], imageUrl: "/textures/creatures/orc.PNG" },
    { id: 119, name: "Gnoll", type: "Humanóide", cr: "1/2", ac: 15, hp: 22, speed: "9m", actions: [{n: "Mordida", hit: 4, dmg: "1d4+2"}, {n: "Lança", hit: 4, dmg: "1d8+2"}, {n: "Arco Longo", hit: 3, dmg: "1d8+1"}], traits: [{n: "Frenesi", d: "Quando reduz criatura a 0 PV, pode fazer ataque de mordida como ação bônus."}], imageUrl: "/textures/creatures/gnoll.PNG" },
    { id: 120, name: "Guarda (Carcereiro)", type: "Humanóide", cr: "1/2", ac: 14, hp: 16, speed: "9m", actions: [{n: "Arco Longo", hit: 3, dmg: "1d8+1"}, {n: "Espada Curta", hit: 4, dmg: "1d6+2"}, {n: "Rede", hit: 3, dmg: "Contenção"}], imageUrl: "/textures/creatures/guarda_carcereiro.PNG" },
    { id: 121, name: "Guarda (Canino)", type: "Fera", cr: "1/2", ac: 13, hp: 22, speed: "12m", actions: [{n: "Mordida", hit: 4, dmg: "1d8+2"}], traits: [{n: "Faro Apurado", d: "Vantagem em Percepção (Olfato)."}], imageUrl: "/textures/creatures/guarda_canino.PNG" },
    { id: 122, name: "Prisioneiro (Bruto)", type: "Humanóide", cr: "1/2", ac: 13, hp: 32, speed: "9m", actions: [{n: "Ataque Múltiplo", hit: 4, dmg: "2x"}, {n: "Ataque Desarmado", hit: 4, dmg: "1d4+2"}], imageUrl: "/textures/creatures/prisioneiro_bruto.PNG" },
    { id: 123, name: "Prisioneiro (Anão)", type: "Humanóide", cr: "1/2", ac: 12, hp: 20, speed: "7.5m", actions: [{n: "Cabeçada", hit: 4, dmg: "1d6+2"}], traits: [{n: "Resiliência Anã", d: "Resistência a veneno."}], imageUrl: "/textures/creatures/prisioneiro_anão.PNG" },
    { id: 124, name: "Prisioneiro (Elfa)", type: "Humanóide", cr: "1/2", ac: 13, hp: 14, speed: "10.5m", actions: [{n: "Chute", hit: 4, dmg: "1d4+2"}], spells: ["Mãos Mágicas"], imageUrl: "/textures/creatures/prisioneiro_elfa.PNG" },
    { id: 125, name: "Sapo Gigante", type: "Fera", cr: "1/4", ac: 11, hp: 18, speed: "9m", actions: [{n: "Mordida", hit: 3, dmg: "1d6+1 + Agarrado"}], imageUrl: "/textures/creatures/sapo.PNG" },
    { id: 126, name: "Vespa Gigante", type: "Fera", cr: "1/2", ac: 12, hp: 13, speed: "3m/15m voo", actions: [{n: "Ferrão", hit: 4, dmg: "1d6+2 + 3d6 veneno"}], imageUrl: "/textures/creatures/vespa.PNG" },
    { id: 127, name: "Centopeia Gigante", type: "Fera", cr: "1/4", ac: 13, hp: 4, speed: "9m", actions: [{n: "Mordida", hit: 4, dmg: "1d4+2 veneno"}], imageUrl: "/textures/creatures/centopeia.PNG" },
    { id: 130, name: "Guarda (Carcereiro Chefe)", type: "Humanóide", cr: "1", ac: 16, hp: 25, speed: "9m", actions: [{n: "Espada Longa", hit: 5, dmg: "1d8+3"}, {n: "Rede Pesada", hit: 4, dmg: "Contenção (CD 12)"}], imageUrl: "/textures/creatures/guarda_carcereiro_2.PNG" },
    { id: 131, name: "Orc Xamã", type: "Humanóide", cr: "2", ac: 13, hp: 30, speed: "9m", actions: [{n: "Cajado", hit: 4, dmg: "1d6+2"}], spells: ["Raio de Fogo (2d10)", "Benção", "Arma Espiritual"], imageUrl: "/textures/creatures/orc_3.PNG" },
    
    // --- 200-299: Mid-Low Challenge ---
    { id: 200, name: "Aranha Gigante", type: "Fera", cr: "1", ac: 14, hp: 26, speed: "9m", actions: [{n: "Mordida", hit: 5, dmg: "1d8+3 + 2d8 veneno"}, {n: "Teia", hit: 5, dmg: "Contenção"}], imageUrl: "/textures/creatures/aranha.PNG" },
    { id: 201, name: "Urso Marrom", type: "Fera", cr: "1", ac: 11, hp: 34, speed: "12m", actions: [{n: "Multiataque", hit: 6, dmg: "Mordida + Garra"}, {n: "Mordida", hit: 6, dmg: "1d8+4"}, {n: "Garras", hit: 6, dmg: "2d6+4"}], imageUrl: "/textures/creatures/urso.PNG" },
    { id: 202, name: "Lobo Atroz", type: "Fera", cr: "1", ac: 14, hp: 37, speed: "15m", actions: [{n: "Mordida", hit: 5, dmg: "2d6+3 | CD 13 For ou Caído"}], imageUrl: "/textures/creatures/lobo_atroz.PNG" },
    { id: 203, name: "Harpia", type: "Monstruosidade", cr: "1", ac: 11, hp: 38, speed: "6m/12m voo", actions: [{n: "Multiataque", hit: 3, dmg: "2x"}, {n: "Garras", hit: 3, dmg: "2d4+1"}, {n: "Canção Sedutora", hit: 0, dmg: "CD 11 Sab ou Enfeitiçado"}], imageUrl: "/textures/creatures/harpia.PNG" },
    { id: 204, name: "Diabrete (Imp)", type: "Infernal", cr: "1", ac: 13, hp: 10, speed: "6m/12m voo", actions: [{n: "Ferrão", hit: 5, dmg: "1d4+3 + 3d6 veneno (CD 11 Con metade)"}], imageUrl: "/textures/creatures/diabrete.PNG" },
    { id: 205, name: "Ogro", type: "Gigante", cr: "2", ac: 11, hp: 59, speed: "12m", actions: [{n: "Clava Grande", hit: 6, dmg: "2d8+4"}, {n: "Azagaia", hit: 6, dmg: "2d6+4"}], imageUrl: "/textures/creatures/ogro.PNG" },
    { id: 206, name: "Mímico", type: "Monstruosidade", cr: "2", ac: 12, hp: 58, speed: "4.5m", actions: [{n: "Pseudópode", hit: 5, dmg: "1d8+3 + Agarrado"}, {n: "Mordida", hit: 5, dmg: "1d8+3 + 1d8 ácido"}], imageUrl: "/textures/creatures/mimic.PNG" },
    { id: 207, name: "Grifo", type: "Monstruosidade", cr: "2", ac: 12, hp: 59, speed: "9m/24m voo", actions: [{n: "Multiataque", hit: 6, dmg: "Bico + Garra"}, {n: "Bico", hit: 6, dmg: "1d8+4"}, {n: "Garras", hit: 6, dmg: "2d6+4"}], imageUrl: "/textures/creatures/grifo.PNG" },
    { id: 208, name: "Capitão dos Bandidos", type: "Humanóide", cr: "2", ac: 15, hp: 65, speed: "9m", actions: [{n: "Multiataque", hit: 5, dmg: "2x Cimitarra + 1x Adaga"}, {n: "Cimitarra", hit: 5, dmg: "1d6+3"}, {n: "Adaga", hit: 5, dmg: "1d4+3"}], imageUrl: "/textures/creatures/capitão_dos_bandidos.PNG" },
    { id: 209, name: "Guarda (Mago)", type: "Humanóide", cr: "2", ac: 12, hp: 45, speed: "9m", actions: [{n: "Bordão", hit: 2, dmg: "1d6"}], spells: ["Mísseis Mágicos (3x1d4+1)", "Onda Trovejante (2d8)", "Teia (CD 13)", "Escudo Arcano (+5 CA)"], imageUrl: "/textures/creatures/guarda_mago.PNG" },
    { id: 210, name: "Gárgula", type: "Elemental", cr: "2", ac: 15, hp: 52, speed: "9m/18m voo", actions: [{n: "Multiataque", hit: 4, dmg: "Mordida + Garra"}, {n: "Mordida", hit: 4, dmg: "1d6+2"}, {n: "Garras", hit: 4, dmg: "1d6+2"}], imageUrl: "/textures/creatures/gargula.PNG" },
    { id: 211, name: "Slime (Gosma)", type: "Limo", cr: "2", ac: 8, hp: 45, speed: "3m", actions: [{n: "Pseudópode", hit: 4, dmg: "1d6+2 + 2d6 ácido"}], traits: [{n: "Corrosivo", d: "Dano em armas não-mágicas."}], imageUrl: "/textures/creatures/slime.PNG" },
    { id: 212, name: "Orc (Guerreiro)", type: "Humanóide", cr: "2", ac: 16, hp: 30, speed: "9m", actions: [{n: "Machado Grande", hit: 5, dmg: "1d12+3"}], imageUrl: "/textures/creatures/orc_2.PNG" },
    { id: 213, name: "Prisioneiro (Cultista Líder)", type: "Humanóide", cr: "2", ac: 13, hp: 33, speed: "9m", actions: [{n: "Adaga", hit: 4, dmg: "1d4+2"}], spells: ["Arma Espiritual (1d8+3)", "Imobilizar Pessoa (CD 13)"], imageUrl: "/textures/creatures/prisioneiro_cultista_2.PNG" },
    { id: 214, name: "Prisioneiro (Bruto Elite)", type: "Humanóide", cr: "2", ac: 14, hp: 45, speed: "9m", actions: [{n: "Ataque Múltiplo", hit: 5, dmg: "2x"}, {n: "Ataque Desarmado", hit: 5, dmg: "1d6+3"}], imageUrl: "/textures/creatures/prisioneiro_bruto_2.PNG" },
    { id: 215, name: "Prisioneiro (Nobre)", type: "Humanóide", cr: "1/8", ac: 15, hp: 9, speed: "9m", actions: [{n: "Rapieira", hit: 3, dmg: "1d8+1"}], traits: [{n: "Aparar", d: "+2 CA (reação)."}], imageUrl: "/textures/creatures/prisioneiro_nobre.PNG" },
    { id: 216, name: "Gnu", type: "Fera", cr: "1/4", ac: 10, hp: 15, speed: "12m", actions: [{n: "Chifres", hit: 6, dmg: "1d6+4"}], imageUrl: "/textures/creatures/gnu.PNG" },
    { id: 220, name: "Harpia Matriarca", type: "Monstruosidade", cr: "3", ac: 12, hp: 50, speed: "6m/15m voo", actions: [{n: "Multiataque", hit: 5, dmg: "2x"}, {n: "Garras", hit: 5, dmg: "2d6+2"}, {n: "Grito Ensurdecedor", hit: 0, dmg: "3d6 sônico (CD 13 Con)"}], imageUrl: "/textures/creatures/harpia_1.PNG" },
    { id: 221, name: "Ogro Esmagador", type: "Gigante", cr: "3", ac: 13, hp: 65, speed: "12m", actions: [{n: "Marreta", hit: 7, dmg: "2d10+5"}], imageUrl: "/textures/creatures/ogro_1.PNG" },
    { id: 222, name: "Slime Ácido", type: "Limo", cr: "3", ac: 9, hp: 60, speed: "4.5m", actions: [{n: "Pseudópode", hit: 5, dmg: "2d6+3 + 3d6 ácido"}], imageUrl: "/textures/creatures/slime_1.PNG" },
    
    // --- 300-399: Mid Challenge ---
    { id: 300, name: "Urso Coruja", type: "Monstruosidade", cr: "3", ac: 13, hp: 59, speed: "12m", actions: [{n: "Multiataque", hit: 7, dmg: "Bico + Garra"}, {n: "Bico", hit: 7, dmg: "1d10+5"}, {n: "Garras", hit: 7, dmg: "2d8+5"}], imageUrl: "/textures/creatures/urso_coruja.PNG" },
    { id: 301, name: "Lobisomem", type: "Humanóide", cr: "3", ac: 12, hp: 58, speed: "12m", actions: [{n: "Multiataque", hit: 4, dmg: "Mordida + Garra (Híbrido)"}, {n: "Mordida", hit: 4, dmg: "1d8+2 + CD 12 Con Maldição"}, {n: "Garras", hit: 4, dmg: "2d4+2"}], imageUrl: "/textures/creatures/lobisomen.PNG" },
    { id: 302, name: "Basilisco", type: "Monstruosidade", cr: "3", ac: 15, hp: 52, speed: "6m", actions: [{n: "Mordida", hit: 5, dmg: "2d6+3 + 2d6 veneno"}], traits: [{n: "Olhar Petrificante", d: "CD 12 Con ou petrificado."}], imageUrl: "/textures/creatures/basilisco.PNG" },
    { id: 303, name: "Mantícora", type: "Monstruosidade", cr: "3", ac: 14, hp: 68, speed: "9m/15m voo", actions: [{n: "Multiataque", hit: 5, dmg: "Mordida + 2x Garra"}, {n: "Mordida", hit: 5, dmg: "1d8+3"}, {n: "Garras", hit: 5, dmg: "2d6+3"}, {n: "Espinhos da Cauda", hit: 5, dmg: "1d8+3 (x3)"}], imageUrl: "/textures/creatures/manticora.PNG" },
    { id: 304, name: "Guarda (Sargento)", type: "Humanóide", cr: "3", ac: 18, hp: 52, speed: "9m", actions: [{n: "Multiataque", hit: 5, dmg: "2x"}, {n: "Espada Grande", hit: 5, dmg: "2d6+3"}, {n: "Besta Pesada", hit: 3, dmg: "1d10"}], traits: [{n: "Liderança", d: "Aliados a 9m ganham +1d4 em ataques."}], imageUrl: "/textures/creatures/guarda_sargento.PNG" },
    { id: 305, name: "Minotauro", type: "Monstruosidade", cr: "3", ac: 14, hp: 76, speed: "12m", actions: [{n: "Machado Grande", hit: 6, dmg: "2d12+4"}, {n: "Chifres", hit: 6, dmg: "2d8+4"}], traits: [{n: "Investida", d: "Se mover 3m e acertar chifres, alvo empurrado/derrubado."}], imageUrl: "/textures/creatures/minotauro.PNG" },
    { id: 306, name: "Escorpião Gigante", type: "Fera", cr: "3", ac: 15, hp: 52, speed: "12m", actions: [{n: "Multiataque", hit: 4, dmg: "2x Garras + 1x Ferrão"}, {n: "Garras", hit: 4, dmg: "1d8+2"}, {n: "Ferrão", hit: 4, dmg: "1d10+2 + 4d10 veneno"}], imageUrl: "/textures/creatures/escorpiao.PNG" },
    { id: 307, name: "Fantasma", type: "Morto-vivo", cr: "4", ac: 11, hp: 45, speed: "12m voo", actions: [{n: "Toque Debilitante", hit: 5, dmg: "4d6+3 necrótico"}, {n: "Possessão", hit: 0, dmg: "CD 13 Car ou Controlado"}], imageUrl: "/textures/creatures/fantasma.PNG" },
    { id: 308, name: "Banshee", type: "Morto-vivo", cr: "4", ac: 12, hp: 58, speed: "0m/12m voo", actions: [{n: "Toque Corruptor", hit: 4, dmg: "3d6+2 necrótico"}, {n: "Lamento", hit: 0, dmg: "CD 13 Con ou 0 PV (1/dia)"}], imageUrl: "/textures/creatures/banshee.PNG" },
    { id: 309, name: "Ogro de Duas Cabeças (Ettin)", type: "Gigante", cr: "4", ac: 12, hp: 85, speed: "12m", actions: [{n: "Multiataque", hit: 7, dmg: "Machado + Maça"}, {n: "Machado", hit: 7, dmg: "2d8+5"}, {n: "Maça", hit: 7, dmg: "2d8+5"}], imageUrl: "/textures/creatures/ogro_duas_cabeças.PNG" },
    { id: 310, name: "Orc Chefe de Guerra", type: "Humanóide", cr: "4", ac: 16, hp: 93, speed: "9m", actions: [{n: "Multiataque", hit: 6, dmg: "2x"}, {n: "Machado Grande", hit: 6, dmg: "1d12+4 + 1d8"}], traits: [{n: "Grito de Batalha", d: "Aliados ganham vantagem (1/dia)."}], imageUrl: "/textures/creatures/orc_cavalheiro.PNG" },
    { id: 311, name: "Guarda Real", type: "Humanóide", cr: "4", ac: 20, hp: 60, speed: "9m", actions: [{n: "Multiataque", hit: 6, dmg: "2x"}, {n: "Espada Longa", hit: 6, dmg: "1d8+4"}], imageUrl: "/textures/creatures/guarda_real.PNG" },
    { id: 312, name: "Assassino do Culto", type: "Humanóide", cr: "4", ac: 15, hp: 50, speed: "12m", actions: [{n: "Cimitarra", hit: 6, dmg: "1d6+4 + veneno"}, {n: "Besta", hit: 6, dmg: "1d8+4 + veneno"}], traits: [{n: "Vantagem em Furtividade", d: "Se tiver sucesso, dano crítico automático."}], imageUrl: "/textures/creatures/assassino_culto.PNG" },
    { id: 313, name: "Beholder Zumbi", type: "Morto-vivo", cr: "5", ac: 15, hp: 93, speed: "0m/9m voo", actions: [{n: "Mordida", hit: 5, dmg: "3d6"}, {n: "Raio Ocular", hit: 5, dmg: "CD 14 (Var)"}], imageUrl: "/textures/creatures/beholder_zumbi.PNG" },
    { id: 314, name: "Vampiro (Cria)", type: "Morto-vivo", cr: "5", ac: 15, hp: 82, speed: "9m", actions: [{n: "Multiataque", hit: 6, dmg: "2x"}, {n: "Garras", hit: 6, dmg: "2d4+3"}, {n: "Mordida", hit: 6, dmg: "1d6+3 + 2d6 necrótico"}], imageUrl: "/textures/creatures/vampiro_cria.PNG" },
    { id: 315, name: "Troll", type: "Gigante", cr: "5", ac: 15, hp: 84, speed: "9m", actions: [{n: "Multiataque", hit: 7, dmg: "Mordida + 2x Garra"}, {n: "Mordida", hit: 7, dmg: "1d6+4"}, {n: "Garras", hit: 7, dmg: "2d6+4"}], traits: [{n: "Regeneração", d: "Recupera 10 PV se não levar dano de fogo/ácido."}], imageUrl: "/textures/creatures/troll.PNG" },
    { id: 316, name: "Gladiador", type: "Humanóide", cr: "5", ac: 16, hp: 112, speed: "9m", actions: [{n: "Multiataque", hit: 7, dmg: "3x Corpo a Corpo"}, {n: "Lança", hit: 7, dmg: "2d6+4"}, {n: "Escudada", hit: 7, dmg: "1d4+4 + Derrubar (CD 15 For)"}], imageUrl: "/textures/creatures/gladiador.PNG" },
    { id: 317, name: "Elemental da Terra", type: "Elemental", cr: "5", ac: 17, hp: 126, speed: "9m/9m escavar", actions: [{n: "Multiataque", hit: 8, dmg: "2x"}, {n: "Pancada", hit: 8, dmg: "2d8+5"}], imageUrl: "/textures/creatures/elemental_da_terra.PNG" },
    { id: 318, name: "Guarda Gigante", type: "Gigante", cr: "5", ac: 16, hp: 105, speed: "12m", actions: [{n: "Multiataque", hit: 8, dmg: "2x"}, {n: "Espadão Gigante", hit: 8, dmg: "3d6+5"}], imageUrl: "/textures/creatures/guarda_gigante.PNG" },
    { id: 319, name: "Ogro Gigante", type: "Gigante", cr: "6", ac: 14, hp: 120, speed: "12m", actions: [{n: "Esmagar", hit: 9, dmg: "4d8+6"}], imageUrl: "/textures/creatures/ogro_gigante.PNG" },
    { id: 320, name: "Quimera", type: "Monstruosidade", cr: "6", ac: 14, hp: 114, speed: "9m/18m voo", actions: [{n: "Multiataque", hit: 7, dmg: "Mordida + Chifres + Garras"}, {n: "Sopro de Fogo", hit: 0, dmg: "7d8 (CD 15) Recarga 5-6"}], imageUrl: "/textures/creatures/quimera.PNG" },
    { id: 321, name: "Mago Negro", type: "Humanóide", cr: "6", ac: 12, hp: 40, speed: "9m", actions: [{n: "Adaga", hit: 5, dmg: "1d4+2"}], spells: ["Bola de Fogo (8d6)", "Relâmpago (8d6)", "Voo", "Invisibilidade Maior"], imageUrl: "/textures/creatures/mago_negro.PNG" },
    { id: 322, name: "Assassino a Vapor", type: "Construto", cr: "6", ac: 18, hp: 90, speed: "12m", actions: [{n: "Lâmina Oculta", hit: 8, dmg: "2d8+5"}, {n: "Jato de Vapor", hit: 0, dmg: "4d8 fogo (CD 15 Des)"}], imageUrl: "/textures/creatures/assassino_vapor.PNG" },
    { id: 323, name: "Aranha Metálica", type: "Construto", cr: "5", ac: 18, hp: 75, speed: "12m", actions: [{n: "Patas Laminadas", hit: 7, dmg: "2d10+4"}, {n: "Teia de Aço", hit: 7, dmg: "Contenção (CD 15 For)"}], imageUrl: "/textures/creatures/aranha_metalica.PNG" },
    { id: 330, name: "Basilisco Ancião", type: "Monstruosidade", cr: "5", ac: 16, hp: 80, speed: "7.5m", actions: [{n: "Mordida Tóxica", hit: 6, dmg: "3d6+4 + 3d6 veneno"}], traits: [{n: "Aura Petrificante", d: "CD 14 Con em área de 9m."}], imageUrl: "/textures/creatures/basilisco_1.PNG" },
    { id: 331, name: "Lobisomem Alpha", type: "Humanóide", cr: "5", ac: 14, hp: 90, speed: "15m", actions: [{n: "Despedaçar", hit: 7, dmg: "3d8+4"}, {n: "Uivo", hit: 0, dmg: "CD 14 Sab ou Medo"}], imageUrl: "/textures/creatures/lobisomen_1.PNG" },
    { id: 332, name: "Mantícora Anciã", type: "Monstruosidade", cr: "5", ac: 16, hp: 95, speed: "9m/18m voo", actions: [{n: "Espinhos Penetrantes", hit: 7, dmg: "2d8+4 (x3)"}], imageUrl: "/textures/creatures/manticora_1.PNG" },
    { id: 333, name: "Mímico Gigante", type: "Monstruosidade", cr: "5", ac: 14, hp: 100, speed: "6m", actions: [{n: "Engolir", hit: 6, dmg: "2d10+5 + Ácido"}], imageUrl: "/textures/creatures/mimic_1.PNG" },

    // --- 400-499: High Challenge ---
    { id: 400, name: "Devorador de Mentes", type: "Aberração", cr: "7", ac: 15, hp: 71, speed: "9m", actions: [{n: "Tentáculos", hit: 7, dmg: "2d10+4 + Agarrado"}, {n: "Extrair Cérebro", hit: 7, dmg: "10d10 perfurante"}, {n: "Rajada Mental", hit: 0, dmg: "4d8+4 (CD 15 Int)"}], imageUrl: "/textures/creatures/devorador_de_mentes.PNG" },
    { id: 401, name: "Mago (Arquimago)", type: "Humanóide", cr: "12", ac: 15, hp: 99, speed: "9m", actions: [{n: "Adaga +2", hit: 8, dmg: "1d4+4"}], spells: ["Parar o Tempo", "Globo de Invulnerabilidade", "Cone de Frio (8d8)", "Muralha de Fogo (5d8)"], imageUrl: "/textures/creatures/arquimago.PNG" },
    { id: 402, name: "Dragão Vermelho Jovem", type: "Dragão", cr: "10", ac: 18, hp: 178, speed: "12m/24m voo", actions: [{n: "Multiataque", hit: 10, dmg: "Mordida + 2x Garra"}, {n: "Sopro de Fogo", hit: 0, dmg: "16d6 fogo (CD 17 Des)"}], imageUrl: "/textures/creatures/dragao.PNG" },
    { id: 403, name: "Golem de Ferro", type: "Construto", cr: "16", ac: 20, hp: 210, speed: "9m", actions: [{n: "Multiataque", hit: 13, dmg: "2x Pancada"}, {n: "Pancada", hit: 13, dmg: "3d8+7"}, {n: "Sopro de Veneno", hit: 0, dmg: "10d8 (CD 19 Con)"}], imageUrl: "/textures/creatures/golem_ferro.PNG" },
    { id: 404, name: "Beholder", type: "Aberração", cr: "13", ac: 18, hp: 180, speed: "0m/6m voo", actions: [{n: "Mordida", hit: 5, dmg: "4d6"}, {n: "Raios Oculares (3)", hit: 0, dmg: "Vários Efeitos (CD 16)"}], imageUrl: "/textures/creatures/beholder.PNG" },
    { id: 405, name: "Vampiro (Lorde)", type: "Morto-vivo", cr: "13", ac: 16, hp: 144, speed: "9m", actions: [{n: "Multiataque", hit: 9, dmg: "2x + Mordida"}, {n: "Desarmado", hit: 9, dmg: "1d8+4 + 3d6 necrótico"}, {n: "Mordida", hit: 9, dmg: "1d6+4 + 3d6 necrótico"}], traits: [{n: "Regeneração", d: "20 PV/turno."}], imageUrl: "/textures/creatures/vampiro.PNG" },
    { id: 406, name: "Gigante da Tempestade", type: "Gigante", cr: "13", ac: 16, hp: 230, speed: "15m", actions: [{n: "Multiataque", hit: 14, dmg: "2x Espada Grande"}, {n: "Espada Grande", hit: 14, dmg: "6d6+9"}, {n: "Relâmpago", hit: 0, dmg: "12d8 (CD 17) Recarga 5-6"}], imageUrl: "/textures/creatures/gigante_da_tempestade.PNG" },
    { id: 407, name: "Dragão Negro Adulto", type: "Dragão", cr: "14", ac: 19, hp: 195, speed: "12m/24m voo", actions: [{n: "Multiataque", hit: 11, dmg: "Mordida + 2x Garra"}, {n: "Sopro Ácido", hit: 0, dmg: "12d8 (CD 18 Des)"}], imageUrl: "/textures/creatures/dragao_negro.PNG" },
    { id: 408, name: "Verme Púrpura", type: "Monstruosidade", cr: "15", ac: 18, hp: 247, speed: "15m escavar", actions: [{n: "Mordida", hit: 14, dmg: "3d8+9 + Engolir"}, {n: "Ferrão", hit: 14, dmg: "3d6+9 + 12d6 veneno"}], imageUrl: "/textures/creatures/verme.PNG" },
    { id: 409, name: "Touro Metálico (Gorgon)", type: "Monstruosidade", cr: "5", ac: 19, hp: 114, speed: "12m", actions: [{n: "Chifres", hit: 8, dmg: "2d12+5"}, {n: "Sopro Petrificante", hit: 0, dmg: "CD 13 Con ou Petrificado"}], imageUrl: "/textures/creatures/touro_metalico.PNG" },
    { id: 410, name: "Esqueleto da Ruína", type: "Morto-vivo", cr: "7", ac: 18, hp: 90, speed: "9m", actions: [{n: "Espada das Sombras", hit: 8, dmg: "2d6+5 + 2d6 necrótico"}], imageUrl: "/textures/creatures/esqueleto_ruina.PNG" },

    // --- 500+ NPCs & Bosses ---
    { id: 500, name: "Artífice (NPC)", type: "Humanóide", cr: "3", ac: 16, hp: 45, speed: "9m", actions: [{n: "Martelo", hit: 5, dmg: "1d8+2"}], spells: ["Mísseis Mágicos", "Curar Ferimentos", "Levitação"], imageUrl: "/textures/creatures/artf.PNG" },
    { id: 501, name: "Autômato", type: "Construto", cr: "1", ac: 16, hp: 30, speed: "9m", actions: [{n: "Pancada", hit: 4, dmg: "1d6+2"}], imageUrl: "/textures/creatures/automato.PNG" },
    { id: 502, name: "Bárbaro Golias (NPC)", type: "Humanóide", cr: "5", ac: 15, hp: 90, speed: "12m", actions: [{n: "Machado Grande", hit: 7, dmg: "1d12+4 + 2 (Fúria)"}], imageUrl: "/textures/creatures/barbaro_golias.PNG" },
    { id: 503, name: "Bárbaro Meio-Orc (NPC)", type: "Humanóide", cr: "4", ac: 14, hp: 75, speed: "9m", actions: [{n: "Machado Duplo", hit: 6, dmg: "2d6+3"}], imageUrl: "/textures/creatures/barbaro_meioorc.PNG" },
    { id: 504, name: "Bardo Kenku (NPC)", type: "Humanóide", cr: "2", ac: 14, hp: 30, speed: "9m", actions: [{n: "Adaga", hit: 4, dmg: "1d4+2"}], spells: ["Zombaria Viciosa", "Onda Trovejante", "Invisibilidade"], imageUrl: "/textures/creatures/bardo_kenku.PNG" },
    { id: 505, name: "Bruxo Tiefling (NPC)", type: "Humanóide", cr: "3", ac: 12, hp: 35, speed: "9m", actions: [{n: "Rajada Mística", hit: 5, dmg: "1d10+3"}], spells: ["Braços de Hadar", "Escuridão", "Raio Ardente"], imageUrl: "/textures/creatures/bruxo_tiefling.PNG" },
    { id: 506, name: "Clérigo (NPC)", type: "Humanóide", cr: "3", ac: 18, hp: 40, speed: "9m", actions: [{n: "Maça", hit: 4, dmg: "1d6+2"}], spells: ["Cura Ferimentos", "Benção", "Arma Espiritual"], imageUrl: "/textures/creatures/clerigo.PNG" },
    { id: 507, name: "Druida Tortle (NPC)", type: "Humanóide", cr: "2", ac: 17, hp: 38, speed: "9m", actions: [{n: "Bordão", hit: 4, dmg: "1d6+2"}], spells: ["Constrição", "Pele de Árvore", "Curar Ferimentos"], imageUrl: "/textures/creatures/druida_tortie.PNG" },
    { id: 508, name: "Druida Elfo (NPC)", type: "Humanóide", cr: "2", ac: 14, hp: 27, speed: "10.5m", actions: [{n: "Cimitarra", hit: 4, dmg: "1d6+2"}], spells: ["Fogo das Fadas", "Onda Trovejante"], imageUrl: "/textures/creatures/duida_elfo.PNG" },
    { id: 509, name: "Guerreira Githyanki (NPC)", type: "Humanóide", cr: "5", ac: 17, hp: 65, speed: "9m", actions: [{n: "Espada Grande de Prata", hit: 7, dmg: "2d6+4 + 2d6 psíquico"}], imageUrl: "/textures/creatures/guerreira_githyanki.PNG" },
    { id: 510, name: "Ladino Halfling (NPC)", type: "Humanóide", cr: "3", ac: 16, hp: 33, speed: "7.5m", actions: [{n: "Adaga", hit: 6, dmg: "1d4+3 + 2d6 (Furtivo)"}], imageUrl: "/textures/creatures/ladino_hafling.PNG" },
    { id: 511, name: "Mago (NPC)", type: "Humanóide", cr: "2", ac: 12, hp: 22, speed: "9m", actions: [{n: "Bordão", hit: 2, dmg: "1d6"}], spells: ["Mãos Flamejantes", "Escudo Arcano", "Mísseis Mágicos"], imageUrl: "/textures/creatures/mago.PNG" },
    { id: 512, name: "Monge Tabaxi (NPC)", type: "Humanóide", cr: "4", ac: 16, hp: 55, speed: "12m", actions: [{n: "Ataque Desarmado", hit: 6, dmg: "1d6+4"}, {n: "Rajada de Golpes", hit: 6, dmg: "2x 1d6+4"}], imageUrl: "/textures/creatures/monge_tabaxi.PNG" },
    { id: 513, name: "Paladino Draconato (NPC)", type: "Humanóide", cr: "5", ac: 18, hp: 70, speed: "9m", actions: [{n: "Espada Longa", hit: 7, dmg: "1d8+4"}, {n: "Sopro de Fogo", hit: 0, dmg: "3d6 (CD 13)"}], imageUrl: "/textures/creatures/paladino_draconato.PNG" },
    
    // --- 600+ Special & Unique ---
    { id: 600, name: "Lich", type: "Morto-vivo", cr: "21", ac: 17, hp: 135, speed: "9m", actions: [{n: "Toque Paralisante", hit: 12, dmg: "3d6 frio + CD 18 Con ou Paralisado"}], spells: ["Dedo da Morte", "Palavra de Poder: Matar", "Desintegrar"], imageUrl: "/textures/creatures/lich.PNG" },
    { id: 601, name: "Rei Demônio (Balor)", type: "Demônio", cr: "19", ac: 19, hp: 262, speed: "12m/24m voo", actions: [{n: "Espada Longa Relâmpago", hit: 14, dmg: "3d8+8 + 3d8 elétrico"}, {n: "Chicote de Fogo", hit: 14, dmg: "2d6+8 + 3d6 fogo"}], imageUrl: "/textures/creatures/rei_demonio.PNG" },
    { id: 602, name: "Tarrasque", type: "Monstruosidade", cr: "30", ac: 25, hp: 676, speed: "12m", actions: [{n: "Multiataque", hit: 19, dmg: "Mordida + 2x Garra + Chifres + Cauda"}, {n: "Mordida", hit: 19, dmg: "4d12+10 + Agarrado"}], traits: [{n: "Carapaça Refletiva", d: "Imune a mísseis mágicos e magias de linha/raio."}], imageUrl: "/textures/creatures/tarrasque.PNG" },
    { id: 603, name: "Urso Atroz", type: "Fera", cr: "2", ac: 13, hp: 45, speed: "12m", actions: [{n: "Mordida", hit: 7, dmg: "1d8+5"}, {n: "Garras", hit: 7, dmg: "2d6+5"}], imageUrl: "/textures/creatures/urso_atroz.PNG" },
    { id: 604, name: "Morcego Gigante", type: "Fera", cr: "1/4", ac: 13, hp: 22, speed: "18m voo", actions: [{n: "Mordida", hit: 4, dmg: "1d6+2"}], imageUrl: "/textures/creatures/morcego.PNG" },
    { id: 605, name: "Gárgula de Lata", type: "Construto", cr: "2", ac: 16, hp: 40, speed: "9m", actions: [{n: "Pancada", hit: 5, dmg: "1d8+3"}], imageUrl: "/textures/creatures/gargula_lata.PNG" },
    { id: 606, name: "Gladiador Elite", type: "Humanóide", cr: "7", ac: 18, hp: 130, speed: "9m", actions: [{n: "Tridente", hit: 8, dmg: "2d6+5"}, {n: "Rede", hit: 5, dmg: "Contenção"}], imageUrl: "/textures/creatures/gladiador_1.PNG" },
    { id: 607, name: "Slime Negro", type: "Limo", cr: "4", ac: 8, hp: 85, speed: "6m", actions: [{n: "Pseudópode", hit: 5, dmg: "2d6+3 + 2d8 ácido"}], imageUrl: "/textures/creatures/silime_2.PNG" },
    { id: 608, name: "Fantasma Ancião", type: "Morto-vivo", cr: "6", ac: 12, hp: 70, speed: "12m voo", actions: [{n: "Amedrontar", hit: 0, dmg: "CD 15 Sab"}, {n: "Drenar Vida", hit: 6, dmg: "5d8 necrótico"}], imageUrl: "/textures/creatures/fantasma_1.PNG" },
    { id: 609, name: "Gnu (Fera)", type: "Fera", cr: "1/2", ac: 11, hp: 20, speed: "12m", actions: [{n: "Chifres", hit: 5, dmg: "1d8+3"}], imageUrl: "/textures/creatures/gnu.PNG" },
    { id: 610, name: "Demilich", type: "Morto-vivo", cr: "18", ac: 20, hp: 80, speed: "0m/9m voo", actions: [{n: "Uivo", hit: 0, dmg: "CD 15 Con ou 0 HP"}, {n: "Drenar Energia", hit: 10, dmg: "10d6 necrótico"}], imageUrl: "/textures/creatures/lich_1.PNG" },
    { id: 611, name: "Enxame de Morcegos", type: "Fera", cr: "1/2", ac: 12, hp: 22, speed: "0m/9m voo", actions: [{n: "Mordidas", hit: 4, dmg: "2d4"}], traits: [{n: "Enxame", d: "Pode ocupar espaço de outra criatura."}], imageUrl: "/textures/creatures/morcego_1.PNG" }
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
