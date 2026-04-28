import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI } from "@google/genai";
import { toPng } from 'html-to-image';
import { Download, Play, Save, CheckCircle, AlertCircle, Loader2, Skull, Sword, Settings2, Plus, List, FileJson, Upload, Zap, Shield, Heart, Move, Sparkles } from 'lucide-react';
// === Tipos e dados de monstros (inlined) ===
export interface MonsterAttribute {
  value: number;
  modifier: string;
}

export interface MonsterDrop {
  item: string;
  chance: string;
  effect: string;
}

export type CardTheme = 'default' | 'black' | 'red' | 'gold' | 'white' | 'green' | 'blue' | 'purple';

export interface MonsterData {
  id: string;
  name: string;
  nd: string;
  rank: string;
  type: string;
  attributes: {
    FOR: MonsterAttribute;
    DES: MonsterAttribute;
    CON: MonsterAttribute;
    INT: MonsterAttribute;
    SAB: MonsterAttribute;
    CAR: MonsterAttribute;
  };
  ca: number;
  pv: string;
  speed: string;
  attacks: string[];
  abilities: string[];
  drops: MonsterDrop[];
  description: string;
  essence?: string;
  proficiencies?: string[];
  skills?: string[];
  theme?: CardTheme;
  imageBgColor?: string;
}

export const monsters: any[] = [
  {
    id: "goblin-rastejante",
    name: "Goblin Rastejante",
    nd: "ND 1/4",
    rank: "F",
    type: "Goblin",
    attributes: {
      FOR: { value: 8, modifier: "-1" },
      DES: { value: 14, modifier: "+2" },
      CON: { value: 8, modifier: "-1" },
      INT: { value: 8, modifier: "-1" },
      SAB: { value: 10, modifier: "+0" },
      CAR: { value: 6, modifier: "-2" },
    },
    ca: 12,
    pv: "5 (2d6-2)",
    speed: "9 m",
    attacks: ["Adaga: +4 acerto, 1d4+2 perfurante"],
    abilities: ["Furtividade: +6 em testes de Esconder-se."],
    drops: [
      { item: "Essência de Goblin Rastejante (Rank 7)", chance: "20%", effect: "+1 Destreza. Passiva: 'Rastejar Sombrio'." },
      { item: "Pele de Goblin", chance: "50%", effect: "Material comum." },
      { item: "Moedas (1d6 po)", chance: "70%", effect: "Pequena quantia de ouro." }
    ],
    description: "Um goblin furtivo que se move silenciosamente pelas sombras."
  },
  {
    id: "goblin-escravo",
    name: "Goblin Escravo",
    nd: "ND 0",
    rank: "F",
    type: "Goblin",
    attributes: {
      FOR: { value: 10, modifier: "+0" },
      DES: { value: 10, modifier: "+0" },
      CON: { value: 10, modifier: "+0" },
      INT: { value: 8, modifier: "-1" },
      SAB: { value: 8, modifier: "-1" },
      CAR: { value: 6, modifier: "-2" },
    },
    ca: 10,
    pv: "4 (1d6+1)",
    speed: "9 m",
    attacks: ["Porrete: +2 acerto, 1d4 contundente"],
    abilities: ["Medo: desvantagem em ataques se aliado morrer."],
    drops: [
      { item: "Essência de Goblin Escravo (Rank 7)", chance: "15%", effect: "+1 Constituição. Passiva: 'Servil'." },
      { item: "Trapo Rasgado", chance: "40%", effect: "Material sem valor." },
      { item: "Moedas (1d4 po)", chance: "30%", effect: "Algumas moedas." }
    ],
    description: "Um goblin subjugado, forçado a lutar em condições terríveis."
  },
  {
    id: "goblin-arqueiro",
    name: "Goblin Arqueiro",
    nd: "ND 1/4",
    rank: "F",
    type: "Goblin",
    attributes: {
      FOR: { value: 8, modifier: "-1" },
      DES: { value: 16, modifier: "+3" },
      CON: { value: 10, modifier: "+0" },
      INT: { value: 10, modifier: "+0" },
      SAB: { value: 12, modifier: "+1" },
      CAR: { value: 8, modifier: "-1" },
    },
    ca: 12,
    pv: "7 (2d6)",
    speed: "9 m",
    attacks: ["Arco Curto: +5 acerto, 1d6+3 perfurante"],
    abilities: ["Atirador Furtivo: +1d6 se tiver vantagem."],
    drops: [
      { item: "Essência de Goblin Arqueiro (Rank 7)", chance: "30%", effect: "+1 Destreza. Passiva: 'Atirador Furtivo'." },
      { item: "Arco Curto Goblin", chance: "35%", effect: "Arma simples." },
      { item: "Flechas (x10)", chance: "60%", effect: "Munição comum." }
    ],
    description: "Especialista em ataques à distância, prefere manter-se seguro."
  },
  {
    id: "goblin-guerreiro",
    name: "Goblin Guerreiro",
    nd: "ND 1/2",
    rank: "F",
    type: "Goblin",
    attributes: {
      FOR: { value: 12, modifier: "+1" },
      DES: { value: 14, modifier: "+2" },
      CON: { value: 12, modifier: "+1" },
      INT: { value: 8, modifier: "-1" },
      SAB: { value: 8, modifier: "-1" },
      CAR: { value: 6, modifier: "-2" },
    },
    ca: 13,
    pv: "10 (3d6)",
    speed: "9 m",
    attacks: ["Espada Curta: +3 acerto, 1d6+1 perfurante"],
    abilities: ["Tática de Bando: vantagem se aliado adjacente."],
    drops: [
      { item: "Essência de Goblin Guerreiro (Rank 7)", chance: "30%", effect: "+1 Destreza. Passiva: 'Tática de Bando'." },
      { item: "Espada Curta Goblin", chance: "40%", effect: "Arma comum." },
      { item: "Escudo Quebrado", chance: "20%", effect: "Pode ser reparado." }
    ],
    description: "O soldado padrão das tribos goblin, perigoso em grupo."
  },
  {
    id: "goblin-berserker",
    name: "Goblin Berserker",
    nd: "ND 1",
    rank: "F",
    type: "Goblin",
    attributes: {
      FOR: { value: 16, modifier: "+3" },
      DES: { value: 14, modifier: "+2" },
      CON: { value: 14, modifier: "+2" },
      INT: { value: 6, modifier: "-2" },
      SAB: { value: 8, modifier: "-1" },
      CAR: { value: 6, modifier: "-2" },
    },
    ca: 14,
    pv: "18 (4d6+4)",
    speed: "9 m",
    attacks: ["Machado de Mão: +5 acerto, 1d6+3 cortante"],
    abilities: ["Fúria Selvagem: ação bônus, resistência a dano físico."],
    drops: [
      { item: "Essência de Goblin Berserker (Rank 6)", chance: "25%", effect: "+2 Força. Passiva: 'Resistência Berserker'." },
      { item: "Machado de Mão Goblin", chance: "40%", effect: "Arma simples." },
      { item: "Amuleto de Osso", chance: "15%", effect: "+1 Força." }
    ],
    description: "Um goblin tomado por uma fúria cega e incontrolável."
  },
  {
    id: "goblin-xama",
    name: "Goblin Xamã",
    nd: "ND 1",
    rank: "F",
    type: "Goblin",
    attributes: {
      FOR: { value: 8, modifier: "-1" },
      DES: { value: 12, modifier: "+1" },
      CON: { value: 12, modifier: "+1" },
      INT: { value: 10, modifier: "+0" },
      SAB: { value: 14, modifier: "+2" },
      CAR: { value: 12, modifier: "+1" },
    },
    ca: 11,
    pv: "14 (4d6)",
    speed: "9 m",
    attacks: ["Truques: Poison Spray, Guidance"],
    abilities: ["Bênção da Tribo: concede vantagem a aliado."],
    drops: [
      { item: "Essência de Goblin Xamã (Rank 6)", chance: "25%", effect: "+1 Sabedoria. Passiva: 'Sabedoria da Tribo'." },
      { item: "Cajado do Xamã", chance: "30%", effect: "Foco arcano." },
      { item: "Amuleto da Tribo", chance: "20%", effect: "+1 Sabedoria." }
    ],
    description: "Líder espiritual que utiliza magias rudimentares e venenos."
  },
  {
    id: "goblin-rastreador",
    name: "Goblin Rastreador",
    nd: "ND 1/2",
    rank: "F",
    type: "Goblin",
    attributes: {
      FOR: { value: 10, modifier: "+0" },
      DES: { value: 16, modifier: "+3" },
      CON: { value: 12, modifier: "+1" },
      INT: { value: 10, modifier: "+0" },
      SAB: { value: 12, modifier: "+1" },
      CAR: { value: 8, modifier: "-1" },
    },
    ca: 14,
    pv: "13 (3d6+3)",
    speed: "12 m",
    attacks: ["Dardo Venenoso: +5 acerto, 1d4+3 + 1d6 veneno"],
    abilities: ["Movimento Furtivo: ação bônus para Esconder."],
    drops: [
      { item: "Essência de Rastreador (Rank 6)", chance: "25%", effect: "+1 Destreza. Passiva: 'Passos Silenciosos'." },
      { item: "Dardos Venenosos (x3)", chance: "40%", effect: "+1d4 veneno cada." },
      { item: "Antídoto Goblin", chance: "20%", effect: "Cura veneno." }
    ],
    description: "Especialista em perseguição, utiliza dardos embebidos em toxinas."
  },
  {
    id: "goblin-armadilheiro",
    name: "Goblin Armadilheiro",
    nd: "ND 1/2",
    rank: "F",
    type: "Goblin",
    attributes: {
      FOR: { value: 12, modifier: "+1" },
      DES: { value: 14, modifier: "+2" },
      CON: { value: 12, modifier: "+1" },
      INT: { value: 10, modifier: "+0" },
      SAB: { value: 10, modifier: "+0" },
      CAR: { value: 8, modifier: "-1" },
    },
    ca: 12,
    pv: "11 (2d8+2)",
    speed: "9 m",
    attacks: ["Rede: +4 acerto, restringe alvo"],
    abilities: ["Armadilha de Piso: 2d4 perfurante."],
    drops: [
      { item: "Essência de Armadilheiro (Rank 6)", chance: "20%", effect: "+1 Inteligência. Passiva: 'Conhecimento de Armadilhas'." },
      { item: "Kit de Armadilhas", chance: "50%", effect: "Permite montar armadilhas." },
      { item: "Rede de Combate", chance: "30%", effect: "Arma de arremesso." }
    ],
    description: "Engenhoso e cruel, prepara o terreno com armadilhas mortais."
  },
  {
    id: "goblin-montado-lobo",
    name: "Goblin Montado (lobo)",
    nd: "ND 1",
    rank: "F",
    type: "Goblin",
    attributes: {
      FOR: { value: 14, modifier: "+2" },
      DES: { value: 14, modifier: "+2" },
      CON: { value: 12, modifier: "+1" },
      INT: { value: 8, modifier: "-1" },
      SAB: { value: 10, modifier: "+0" },
      CAR: { value: 8, modifier: "-1" },
    },
    ca: 15,
    pv: "22 (4d8+4)",
    speed: "12 m",
    attacks: ["Lança Montada: +4 acerto, 1d8+2 perfurante"],
    abilities: ["Carga Devastadora: dano extra e derruba."],
    drops: [
      { item: "Essência de Montado (Rank 5)", chance: "20%", effect: "+1 Força, +1 Destreza. Passiva: 'Vínculo com Montaria'." },
      { item: "Lança de Cavalaria", chance: "40%", effect: "Arma marcial 1d10." },
      { item: "Pele de Lobo", chance: "25%", effect: "Material para capa." }
    ],
    description: "Um cavaleiro goblin que utiliza lobos como montarias rápidas."
  },
  {
    id: "hobgoblin-soldado",
    name: "Hobgoblin Soldado",
    nd: "ND 2",
    rank: "E",
    type: "Hobgoblin",
    attributes: {
      FOR: { value: 16, modifier: "+3" },
      DES: { value: 12, modifier: "+1" },
      CON: { value: 14, modifier: "+2" },
      INT: { value: 10, modifier: "+0" },
      SAB: { value: 10, modifier: "+0" },
      CAR: { value: 12, modifier: "+1" },
    },
    ca: 16,
    pv: "32 (5d8+10)",
    speed: "9 m",
    attacks: ["Espada Longa: +5 acerto, 1d8+3 cortante"],
    abilities: ["Disciplina Marcial: +1d6 dano se aliado adjacente."],
    drops: [
      { item: "Essência de Hobgoblin (Rank 5)", chance: "30%", effect: "+1 Força. Passiva: 'Disciplina Marcial'." },
      { item: "Espada Longa de Aço", chance: "50%", effect: "Arma marcial." },
      { item: "Cota de Malha Hobgoblin", chance: "20%", effect: "Armadura média CA 16." }
    ],
    description: "Guerreiros disciplinados, a elite militar dos goblinóides."
  },
  {
    id: "hobgoblin-arqueiro",
    name: "Hobgoblin Arqueiro",
    nd: "ND 2",
    rank: "E",
    type: "Hobgoblin",
    attributes: {
      FOR: { value: 12, modifier: "+1" },
      DES: { value: 16, modifier: "+3" },
      CON: { value: 14, modifier: "+2" },
      INT: { value: 10, modifier: "+0" },
      SAB: { value: 12, modifier: "+1" },
      CAR: { value: 10, modifier: "+0" },
    },
    ca: 15,
    pv: "28 (4d8+10)",
    speed: "9 m",
    attacks: ["Arco Longo: +5 acerto, 1d8+3 perfurante"],
    abilities: ["Foco Marcial: +2 acerto se não se mover."],
    drops: [
      { item: "Essência de Hobgoblin Arqueiro (Rank 5)", chance: "30%", effect: "+1 Destreza. Passiva: 'Foco Marcial'." },
      { item: "Arco Longo", chance: "45%", effect: "Arma marcial." },
      { item: "Flechas de Aço (x20)", chance: "50%", effect: "+1 acerto." }
    ],
    description: "Arqueiros treinados que mantêm formações perfeitas."
  },
  {
    id: "hobgoblin-capitao",
    name: "Hobgoblin Capitão",
    nd: "ND 3",
    rank: "E",
    type: "Hobgoblin",
    attributes: {
      FOR: { value: 18, modifier: "+4" },
      DES: { value: 12, modifier: "+1" },
      CON: { value: 16, modifier: "+3" },
      INT: { value: 12, modifier: "+1" },
      SAB: { value: 10, modifier: "+0" },
      CAR: { value: 14, modifier: "+2" },
    },
    ca: 17,
    pv: "45 (6d8+18)",
    speed: "9 m",
    attacks: ["Montante: +6 acerto, 2d6+4 cortante"],
    abilities: ["Grito de Comando: aliados atacam com reação."],
    drops: [
      { item: "Essência de Capitão Hobgoblin (Rank 4)", chance: "25%", effect: "+1 Força, +1 Carisma. Passiva: 'Presença de Líder'." },
      { item: "Montante da Horda", chance: "30%", effect: "Crítico 19-20." },
      { item: "Bandeira de Guerra", chance: "20%", effect: "Vantagem contra medo." }
    ],
    description: "Um líder nato que comanda suas tropas com autoridade."
  },
  {
    id: "bugbear-assassino",
    name: "Bugbear Assassino",
    nd: "ND 2",
    rank: "E",
    type: "Bugbear",
    attributes: {
      FOR: { value: 15, modifier: "+2" },
      DES: { value: 14, modifier: "+2" },
      CON: { value: 14, modifier: "+2" },
      INT: { value: 8, modifier: "-1" },
      SAB: { value: 10, modifier: "+0" },
      CAR: { value: 8, modifier: "-1" },
    },
    ca: 15,
    pv: "39 (6d8+12)",
    speed: "9 m",
    attacks: ["Espada Curta: +4 acerto, 1d6+2 + 2d6 se surpresa"],
    abilities: ["Emboscada: +2d6 dano no primeiro turno."],
    drops: [
      { item: "Essência de Bugbear (Rank 5)", chance: "25%", effect: "+1 Força. Passiva: 'Emboscada'." },
      { item: "Adaga Envenenada", chance: "30%", effect: "1d4+1d4 veneno." },
      { item: "Manto de Couro Negro", chance: "20%", effect: "Vantagem em Furtividade." }
    ],
    description: "Um bugbear que trocou a força bruta pela sutileza letal."
  },
  {
    id: "bugbear-bruto",
    name: "Bugbear Bruto",
    nd: "ND 3",
    rank: "E",
    type: "Bugbear",
    attributes: {
      FOR: { value: 18, modifier: "+4" },
      DES: { value: 12, modifier: "+1" },
      CON: { value: 16, modifier: "+3" },
      INT: { value: 8, modifier: "-1" },
      SAB: { value: 10, modifier: "+0" },
      CAR: { value: 8, modifier: "-1" },
    },
    ca: 16,
    pv: "52 (7d8+21)",
    speed: "9 m",
    attacks: ["Clava Pesada: +6 acerto, 2d6+4 contundente"],
    abilities: ["Agarramento Brutal: agarrar com vantagem."],
    drops: [
      { item: "Essência de Bugbear Bruto (Rank 4)", chance: "25%", effect: "+2 Força. Passiva: 'Agarramento Brutal'." },
      { item: "Clava de Guerra", chance: "40%", effect: "Arma marcial 1d8." },
      { item: "Pele de Bugbear", chance: "25%", effect: "Material para armadura." }
    ],
    description: "A personificação da força goblinóide, capaz de esmagar ossos."
  },
  {
    id: "hobgoblin-devoto",
    name: "Hobgoblin Devoto",
    nd: "ND 3",
    rank: "E",
    type: "Hobgoblin",
    attributes: {
      FOR: { value: 14, modifier: "+2" },
      DES: { value: 10, modifier: "+0" },
      CON: { value: 14, modifier: "+2" },
      INT: { value: 10, modifier: "+0" },
      SAB: { value: 16, modifier: "+3" },
      CAR: { value: 12, modifier: "+1" },
    },
    ca: 15,
    pv: "40 (6d8+12)",
    speed: "9 m",
    attacks: ["Magias: Bless, Bane, Spiritual Weapon"],
    abilities: ["Canalizar Divindade: concede +1d4 em testes."],
    drops: [
      { item: "Essência de Devoto (Rank 4)", chance: "25%", effect: "+2 Sabedoria. Passiva: 'Canalizar Divindade'." },
      { item: "Símbolo Sagrado", chance: "35%", effect: "Foco divino." },
      { item: "Poção de Cura Maior", chance: "20%", effect: "Restaura 4d4+4 PV." }
    ],
    description: "Um clérigo de guerra que canaliza o poder de divindades sombrias."
  },
  {
    id: "goblin-mutante-ogro",
    name: "Goblin Mutante (Ogro)",
    nd: "ND 2",
    rank: "E",
    type: "Goblin",
    attributes: {
      FOR: { value: 18, modifier: "+4" },
      DES: { value: 8, modifier: "-1" },
      CON: { value: 14, modifier: "+2" },
      INT: { value: 6, modifier: "-2" },
      SAB: { value: 8, modifier: "-1" },
      CAR: { value: 6, modifier: "-2" },
    },
    ca: 12,
    pv: "45 (6d10+12)",
    speed: "9 m",
    attacks: ["Punho Enorme: +6 acerto, 2d6+4 contundente"],
    abilities: ["Regeneração: 3 PV por turno."],
    drops: [
      { item: "Essência de Ogro Goblin (Rank 5)", chance: "25%", effect: "+1 Força, +1 Constituição. Passiva: 'Regeneração'." },
      { item: "Braçadeiras de Osso", chance: "30%", effect: "Ataques desarmados 1d6." },
      { item: "Pele de Ogro", chance: "25%", effect: "Material para armadura natural." }
    ],
    description: "Um goblin que sofreu mutações grotescas, tornando-se enorme."
  },
  {
    id: "hobgoblin-warlord",
    name: "Hobgoblin Warlord",
    nd: "ND 5",
    rank: "D",
    type: "Hobgoblin",
    attributes: {
      FOR: { value: 20, modifier: "+5" },
      DES: { value: 14, modifier: "+2" },
      CON: { value: 18, modifier: "+4" },
      INT: { value: 14, modifier: "+2" },
      SAB: { value: 12, modifier: "+1" },
      CAR: { value: 16, modifier: "+3" },
    },
    ca: 18,
    pv: "85 (10d8+40)",
    speed: "9 m",
    attacks: ["Espada Vorpal: +8 acerto, 2d6+5 cortante"],
    abilities: ["Liderança Inspiradora: aliados +1d4 acerto."],
    drops: [
      { item: "Essência de Warlord (Rank 3)", chance: "20%", effect: "+2 Força, +1 Carisma. Passiva: 'Liderança Inspiradora'." },
      { item: "Espada Vorpal (fragmento)", chance: "15%", effect: "Arma +1, crítico 19-20." },
      { item: "Armadura de Placas", chance: "25%", effect: "Armadura pesada CA 18." }
    ],
    description: "O ápice do comando hobgoblin, um mestre tático."
  },
  {
    id: "hobgoblin-mago-de-guerra",
    name: "Hobgoblin Mago de Guerra",
    nd: "ND 5",
    rank: "D",
    type: "Hobgoblin",
    attributes: {
      FOR: { value: 12, modifier: "+1" },
      DES: { value: 14, modifier: "+2" },
      CON: { value: 16, modifier: "+3" },
      INT: { value: 18, modifier: "+4" },
      SAB: { value: 12, modifier: "+1" },
      CAR: { value: 10, modifier: "+0" },
    },
    ca: 16,
    pv: "72 (9d8+36)",
    speed: "9 m",
    attacks: ["Magias: Fireball, Shield, Scorching Ray"],
    abilities: ["Contramágica: reação para anular magia."],
    drops: [
      { item: "Essência de Mago de Guerra (Rank 3)", chance: "20%", effect: "+2 Inteligência. Passiva: 'Contramágica'." },
      { item: "Cajado Arcano", chance: "30%", effect: "Foco +1 CD de magia." },
      { item: "Pergaminho de Fireball", chance: "20%", effect: "Pode lançar Fireball." }
    ],
    description: "Um estudioso das artes arcanas focado puramente na destruição."
  },
  {
    id: "bugbear-chefe-da-tribo",
    name: "Bugbear Chefe da Tribo",
    nd: "ND 4",
    rank: "D",
    type: "Bugbear",
    attributes: {
      FOR: { value: 19, modifier: "+4" },
      DES: { value: 12, modifier: "+1" },
      CON: { value: 16, modifier: "+3" },
      INT: { value: 10, modifier: "+0" },
      SAB: { value: 12, modifier: "+1" },
      CAR: { value: 14, modifier: "+2" },
    },
    ca: 17,
    pv: "75 (10d8+30)",
    speed: "9 m",
    attacks: ["Machado Grande: +7 acerto, 2d8+4 cortante"],
    abilities: ["Intimidação Aterrorizante: ação bônus para causar medo."],
    drops: [
      { item: "Essência de Chefe Bugbear (Rank 3)", chance: "20%", effect: "+1 Força, +1 Constituição. Passiva: 'Intimidação Aterrorizante'." },
      { item: "Machado Grande da Tribo", chance: "35%", effect: "Arma +1." },
      { item: "Colar de Dentes", chance: "25%", effect: "+1 Intimidação." }
    ],
    description: "O líder de uma tribo bugbear, governando através do medo."
  },
  {
    id: "goblin-rei-montaria-dragao",
    name: "Goblin Rei (Montaria Dragão)",
    nd: "ND 5",
    rank: "D",
    type: "Goblin",
    attributes: {
      FOR: { value: 14, modifier: "+2" },
      DES: { value: 16, modifier: "+3" },
      CON: { value: 14, modifier: "+2" },
      INT: { value: 12, modifier: "+1" },
      SAB: { value: 10, modifier: "+0" },
      CAR: { value: 14, modifier: "+2" },
    },
    ca: 17,
    pv: "68 (8d8+32)",
    speed: "9 m (voo 15m)",
    attacks: ["Lança de Cavaleiro: +7 acerto, 1d10+3 perfurante"],
    abilities: ["Ataque Aéreo: mergulho causa +4d6."],
    drops: [
      { item: "Essência de Rei Goblin (Rank 3)", chance: "20%", effect: "+1 Destreza, +1 Carisma. Passiva: 'Lorde dos Céus'." },
      { item: "Lança de Dragão", chance: "30%", effect: "Arma +1, +1d6 fogo." },
      { item: "Escamas de Dragão", chance: "20%", effect: "Material resistente a fogo." }
    ],
    description: "Um rei goblin que domou uma fera alada, terror nos céus."
  },
  {
    id: "hobgoblin-cavaleiro-pesado",
    name: "Hobgoblin Cavaleiro Pesado",
    nd: "ND 4",
    rank: "D",
    type: "Hobgoblin",
    attributes: {
      FOR: { value: 18, modifier: "+4" },
      DES: { value: 10, modifier: "+0" },
      CON: { value: 16, modifier: "+3" },
      INT: { value: 12, modifier: "+1" },
      SAB: { value: 10, modifier: "+0" },
      CAR: { value: 12, modifier: "+1" },
    },
    ca: 20,
    pv: "90 (12d8+36)",
    speed: "9 m",
    attacks: ["Montante: +7 acerto, 2d6+4 cortante"],
    abilities: ["Carga Implacável: não provoca ataques de oportunidade."],
    drops: [
      { item: "Essência de Cavaleiro (Rank 4)", chance: "25%", effect: "+2 Força. Passiva: 'Carga Implacável'." },
      { item: "Armadura de Cavaleiro", chance: "30%", effect: "Armadura pesada CA 18." },
      { item: "Escudo de Torre", chance: "25%", effect: "+3 CA." }
    ],
    description: "Um tanque humanoide, protegido por camadas de aço."
  },
  {
    id: "bugbear-sombrio",
    name: "Bugbear Sombrio",
    nd: "ND 4",
    rank: "D",
    type: "Bugbear",
    attributes: {
      FOR: { value: 16, modifier: "+3" },
      DES: { value: 18, modifier: "+4" },
      CON: { value: 14, modifier: "+2" },
      INT: { value: 10, modifier: "+0" },
      SAB: { value: 12, modifier: "+1" },
      CAR: { value: 8, modifier: "-1" },
    },
    ca: 16,
    pv: "65 (10d8+20)",
    speed: "12 m",
    attacks: ["Adaga Envenenada: +7 acerto, 1d4+4 + 3d6 veneno"],
    abilities: ["Passos Sombrios: teleporte 9m como ação bônus."],
    drops: [
      { item: "Essência de Bugbear Sombrio (Rank 3)", chance: "20%", effect: "+2 Destreza. Passiva: 'Passos Sombrios'." },
      { item: "Adaga Sombria", chance: "30%", effect: "Arma +1, crítico 19-20." },
      { item: "Manto Sombrio", chance: "20%", effect: "Vantagem em Furtividade." }
    ],
    description: "Mestre da emboscada que utiliza magia das sombras."
  },
  {
    id: "hobgoblin-senhor-da-guerra",
    name: "Hobgoblin Senhor da Guerra",
    nd: "ND 8",
    rank: "C",
    type: "Hobgoblin",
    attributes: {
      FOR: { value: 22, modifier: "+6" },
      DES: { value: 14, modifier: "+2" },
      CON: { value: 20, modifier: "+5" },
      INT: { value: 16, modifier: "+3" },
      SAB: { value: 14, modifier: "+2" },
      CAR: { value: 18, modifier: "+4" },
    },
    ca: 19,
    pv: "130 (14d8+70)",
    speed: "9 m",
    attacks: ["Espada Lendária: +10 acerto, 2d8+6 cortante + 1d8 radiante"],
    abilities: ["Grito de Guerra: todos aliados ganham ataque extra."],
    drops: [
      { item: "Essência de Senhor da Guerra (Rank 2)", chance: "15%", effect: "+2 Força, +2 Carisma. Passiva: 'Presença Aterradora'." },
      { item: "Espada Lendária (fragmento)", chance: "12%", effect: "Arma +2, +1d8 radiante." },
      { item: "Armadura de Mithral", chance: "20%", effect: "Armadura pesada CA 18." }
    ],
    description: "Um general lendário cujas táticas são conhecidas em todos os reinos."
  },
  {
    id: "goblin-arch-xama",
    name: "Goblin Arch-Xamã",
    nd: "ND 7",
    rank: "C",
    type: "Goblin",
    attributes: {
      FOR: { value: 10, modifier: "+0" },
      DES: { value: 14, modifier: "+2" },
      CON: { value: 16, modifier: "+3" },
      INT: { value: 14, modifier: "+2" },
      SAB: { value: 20, modifier: "+5" },
      CAR: { value: 16, modifier: "+3" },
    },
    ca: 15,
    pv: "95 (10d8+50)",
    speed: "9 m",
    attacks: ["Magias: Spirit Guardians, Harm, Mass Cure Wounds"],
    abilities: ["Totem Ancestral: invoca totem que cura ou causa dano."],
    drops: [
      { item: "Essência de Arch-Xamã (Rank 2)", chance: "15%", effect: "+2 Sabedoria. Passiva: 'Sabedoria Ancestral'." },
      { item: "Cajado do Arch-Xamã", chance: "25%", effect: "Foco +2 CD." },
      { item: "Amuleto Ancestral", chance: "20%", effect: "+2 Sabedoria." }
    ],
    description: "Mestre das energias espirituais, capaz de moldar o campo de batalha."
  },
  {
    id: "bugbear-rei-dos-pesadelos",
    name: "Bugbear Rei dos Pesadelos",
    nd: "ND 8",
    rank: "C",
    type: "Bugbear",
    attributes: {
      FOR: { value: 20, modifier: "+5" },
      DES: { value: 16, modifier: "+3" },
      CON: { value: 18, modifier: "+4" },
      INT: { value: 12, modifier: "+1" },
      SAB: { value: 14, modifier: "+2" },
      CAR: { value: 14, modifier: "+2" },
    },
    ca: 18,
    pv: "145 (15d8+75)",
    speed: "12 m",
    attacks: ["Machado de Duas Mãos: +9 acerto, 2d8+5 cortante + 2d6 psíquico"],
    abilities: ["Presença Aterradora: causa medo em área."],
    drops: [
      { item: "Essência de Rei Pesadelo (Rank 2)", chance: "15%", effect: "+2 Força, +1 Constituição. Passiva: 'Presença Aterradora'." },
      { item: "Machado dos Pesadelos", chance: "20%", effect: "Arma +2, +1d6 psíquico." },
      { item: "Capa do Pesadelo", chance: "15%", effect: "Causa medo em área." }
    ],
    description: "Uma criatura de puro terror que assombra os sonhos."
  },
  {
    id: "hobgoblin-dragao-montado",
    name: "Hobgoblin Dragão-Montado",
    nd: "ND 9",
    rank: "C",
    type: "Hobgoblin",
    attributes: {
      FOR: { value: 20, modifier: "+5" },
      DES: { value: 12, modifier: "+1" },
      CON: { value: 18, modifier: "+4" },
      INT: { value: 14, modifier: "+2" },
      SAB: { value: 12, modifier: "+1" },
      CAR: { value: 16, modifier: "+3" },
    },
    ca: 19,
    pv: "140 (12d10+80)",
    speed: "9 m (voo 18m)",
    attacks: ["Lança de Dragão: +9 acerto, 2d6+5 perfurante + 2d6 fogo"],
    abilities: ["Sopro do Dragão: cone de fogo 6d6."],
    drops: [
      { item: "Essência de Cavaleiro Dragão (Rank 1)", chance: "10%", effect: "+2 Força, +2 Carisma. Passiva: 'Vínculo com Dragão'." },
      { item: "Lança de Dragão", chance: "20%", effect: "Arma +2, +2d6 fogo." },
      { item: "Escama de Dragão", chance: "25%", effect: "Resistência a fogo." }
    ],
    description: "Um cavaleiro de elite que comanda um dragão real."
  },
  {
    id: "goblin-lich-espirito-corrompido",
    name: "Goblin Lich (Espírito Corrompido)",
    nd: "ND 9",
    rank: "C",
    type: "Goblin",
    attributes: {
      FOR: { value: 12, modifier: "+1" },
      DES: { value: 14, modifier: "+2" },
      CON: { value: 14, modifier: "+2" },
      INT: { value: 18, modifier: "+4" },
      SAB: { value: 16, modifier: "+3" },
      CAR: { value: 18, modifier: "+4" },
    },
    ca: 17,
    pv: "110 (13d8+52)",
    speed: "9 m",
    attacks: ["Magias: Finger of Death, Animate Dead"],
    abilities: ["Renascimento: retorna em 1d10 dias."],
    drops: [
      { item: "Essência de Lich Goblin (Rank 1)", chance: "10%", effect: "+2 Inteligência, +2 Carisma. Passiva: 'Renascimento'." },
      { item: "Foco de Lich", chance: "15%", effect: "Foco +2 CD." },
      { item: "Frasco de Alma", chance: "12%", effect: "Recupera todos os PV." }
    ],
    description: "Um goblin que buscou a imortalidade através da necromancia."
  },
  {
    id: "hobgoblin-campeao-imortal",
    name: "Hobgoblin Campeão Imortal",
    nd: "ND 10",
    rank: "C",
    type: "Hobgoblin",
    attributes: {
      FOR: { value: 24, modifier: "+7" },
      DES: { value: 16, modifier: "+3" },
      CON: { value: 22, modifier: "+6" },
      INT: { value: 12, modifier: "+1" },
      SAB: { value: 14, modifier: "+2" },
      CAR: { value: 20, modifier: "+5" },
    },
    ca: 20,
    pv: "180 (15d12+90)",
    speed: "12 m",
    attacks: ["Espada Lendária: +12 acerto, 2d10+7 cortante + 2d8 radiante"],
    abilities: ["Imortalidade: recupera 20 PV por turno."],
    drops: [
      { item: "Essência de Campeão Imortal (Rank 1)", chance: "8%", effect: "+3 Força, +2 Constituição. Passiva: 'Imortalidade'." },
      { item: "Espada Imortal", chance: "10%", effect: "Arma +3, +1d8 radiante." },
      { item: "Armadura Imortal", chance: "15%", effect: "Resistência a dano não mágico." }
    ],
    description: "Um guerreiro que transcendeu a mortalidade, imparável."
  }
,
,
  {
  "id": "lobo-alfa",
  "name": "Lobo Alfa",
  "nd": "ND 1/2",
  "rank": "E",
  "type": "Besta",
  "attributes": {
    "FOR": {
      "value": 14,
      "modifier": "+2"
    },
    "DES": {
      "value": 16,
      "modifier": "+3"
    },
    "CON": {
      "value": 12,
      "modifier": "+1"
    },
    "INT": {
      "value": 6,
      "modifier": "-2"
    },
    "SAB": {
      "value": 12,
      "modifier": "+1"
    },
    "CAR": {
      "value": 6,
      "modifier": "-2"
    }
  },
  "ca": 13,
  "pv": "13 (3d8)",
  "speed": "12 m",
  "attacks": [
    "Mordida: +4 acerto, 2d4+2 perfurante",
    "Ataque de Alcance (dardo de espinho): +3 acerto, 1d6+3 perfurante"
  ],
  "abilities": [
    "Ataque em Bando: vantagem se aliado adjacente",
    "Visão Aguçada: vantagem em Percepção baseada em visão"
  ],
  "drops": [
    {
      "item": "Essência de Lobo Alfa (Rank 6)",
      "chance": "30%",
      "effect": "+1 Força, +1 Destreza. Passiva: Ataque em Bando. Ativa: Uivo Aterrorizante (1x/descanso curto)."
    },
    {
      "item": "Presas de Lobo",
      "chance": "40%",
      "effect": "Material para adaga +1."
    },
    {
      "item": "Pele de Lobo",
      "chance": "25%",
      "effect": "Capa com resistência a frio."
    },
    {
      "item": "Moedas (1d10 po)",
      "chance": "70%",
      "effect": "Moedas de prata e ouro."
    }
  ],
  "description": "A creature known as Lobo Alfa."
},
  {
  "id": "urso-corrompido",
  "name": "Urso Corrompido",
  "nd": "ND 2",
  "rank": "D",
  "type": "Besta",
  "attributes": {
    "FOR": {
      "value": 18,
      "modifier": "+4"
    },
    "DES": {
      "value": 10,
      "modifier": "+0"
    },
    "CON": {
      "value": 16,
      "modifier": "+3"
    },
    "INT": {
      "value": 4,
      "modifier": "-3"
    },
    "SAB": {
      "value": 10,
      "modifier": "+0"
    },
    "CAR": {
      "value": 6,
      "modifier": "-2"
    }
  },
  "ca": 14,
  "pv": "45 (6d10+12)",
  "speed": "9 m",
  "attacks": [
    "Garra: +6 acerto, 2d6+4 cortante",
    "Mordida: +6 acerto, 1d8+4 perfurante"
  ],
  "abilities": [
    "Fúria Sombria: quando ferido, ganha resistência a dano físico por 1 minuto",
    "Regeneração Corrompida: recupera 3 PV por turno (para com fogo/ácido)"
  ],
  "drops": [
    {
      "item": "Essência de Urso Corrompido (Rank 5)",
      "chance": "25%",
      "effect": "+2 Força, +1 Constituição. Passiva: Fúria Sombria. Ativa: Regeneração (recupera 2 PV/turno por 1 minuto, 1x/descanso longo)."
    },
    {
      "item": "Garra de Urso",
      "chance": "35%",
      "effect": "Material para manopla +1."
    },
    {
      "item": "Coração Corrompido",
      "chance": "15%",
      "effect": "Consumível: +4 Força por 1 hora, mas causa 1d6 necrótico."
    },
    {
      "item": "Moedas (3d8 po)",
      "chance": "100%",
      "effect": "Tesouro da toca."
    }
  ],
  "description": "A creature known as Urso Corrompido."
},
  {
  "id": "aguia-gigante",
  "name": "Águia Gigante",
  "nd": "ND 1",
  "rank": "E",
  "type": "Besta",
  "attributes": {
    "FOR": {
      "value": 16,
      "modifier": "+3"
    },
    "DES": {
      "value": 14,
      "modifier": "+2"
    },
    "CON": {
      "value": 12,
      "modifier": "+1"
    },
    "INT": {
      "value": 8,
      "modifier": "-1"
    },
    "SAB": {
      "value": 14,
      "modifier": "+2"
    },
    "CAR": {
      "value": 10,
      "modifier": "+0"
    }
  },
  "ca": 12,
  "pv": "26 (4d10+4)",
  "speed": "10 m (voo 24 m)",
  "attacks": [
    "Bicada: +5 acerto, 1d8+3 perfurante",
    "Garras: +5 acerto, 2d6+3 cortante (apenas em mergulho)"
  ],
  "abilities": [
    "Mergulho Veloz: se mover 9m em linha reta antes do ataque, causa +2d6 de dano",
    "Visão Aguçada: vantagem em Percepção"
  ],
  "drops": [
    {
      "item": "Essência de Águia Gigante (Rank 6)",
      "chance": "25%",
      "effect": "+1 Destreza, +1 Sabedoria. Passiva: Visão Aguçada. Ativa: Mergulho (1x/descanso curto, +2d6 dano)."
    },
    {
      "item": "Penas de Águia",
      "chance": "50%",
      "effect": "Material para flechas +1."
    },
    {
      "item": "Ovo de Águia",
      "chance": "10%",
      "effect": "Vende por 50 po ou choca como mascote."
    },
    {
      "item": "Moedas (2d6 po)",
      "chance": "80%",
      "effect": "Moedas e joias."
    }
  ],
  "description": "A creature known as Águia Gigante."
},
  {
  "id": "cervo-ancestral",
  "name": "Cervo Ancestral",
  "nd": "ND 1/2",
  "rank": "F",
  "type": "Besta",
  "attributes": {
    "FOR": {
      "value": 14,
      "modifier": "+2"
    },
    "DES": {
      "value": 16,
      "modifier": "+3"
    },
    "CON": {
      "value": 12,
      "modifier": "+1"
    },
    "INT": {
      "value": 8,
      "modifier": "-1"
    },
    "SAB": {
      "value": 12,
      "modifier": "+1"
    },
    "CAR": {
      "value": 10,
      "modifier": "+0"
    }
  },
  "ca": 13,
  "pv": "11 (2d8+2)",
  "speed": "12 m",
  "attacks": [
    "Chifradas: +4 acerto, 2d4+2 contundente",
    "Galopada: +3 acerto, 1d6+3 perfurante (pisoteio)"
  ],
  "abilities": [
    "Fuga Veloz: ação bônus para Desengajar",
    "Passos Silenciosos: vantagem em Furtividade em florestas"
  ],
  "drops": [
    {
      "item": "Essência de Cervo Ancestral (Rank 7)",
      "chance": "20%",
      "effect": "+1 Destreza. Passiva: Passos Silenciosos. Ativa: Fuga Veloz."
    },
    {
      "item": "Chifres Enfileirados",
      "chance": "30%",
      "effect": "Material para arco curto +1."
    },
    {
      "item": "Pérola da Floresta",
      "chance": "15%",
      "effect": "+1 em testes de Sobrevivência."
    },
    {
      "item": "Moedas (1d8 po)",
      "chance": "60%",
      "effect": "Moedas antigas."
    }
  ],
  "description": "A creature known as Cervo Ancestral."
},
  {
  "id": "cobra-gigante",
  "name": "Cobra Gigante",
  "nd": "ND 1",
  "rank": "D",
  "type": "Besta",
  "attributes": {
    "FOR": {
      "value": 12,
      "modifier": "+1"
    },
    "DES": {
      "value": 18,
      "modifier": "+4"
    },
    "CON": {
      "value": 14,
      "modifier": "+2"
    },
    "INT": {
      "value": 4,
      "modifier": "-3"
    },
    "SAB": {
      "value": 10,
      "modifier": "+0"
    },
    "CAR": {
      "value": 6,
      "modifier": "-2"
    }
  },
  "ca": 14,
  "pv": "22 (4d8+4)",
  "speed": "9 m",
  "attacks": [
    "Mordida: +6 acerto, 1d8+4 perfurante + 2d6 veneno (CD 12 Con reduz metade)",
    "Constrição: +6 acerto, 1d6+4 contundente e alvo agarrado"
  ],
  "abilities": [
    "Emboscada: vantagem em ataques contra alvos surpresos",
    "Movimento Silencioso: vantagem em Furtividade"
  ],
  "drops": [
    {
      "item": "Essência de Cobra Gigante (Rank 5)",
      "chance": "25%",
      "effect": "+2 Destreza. Passiva: Emboscada. Ativa: Veneno Paralizante (aplica paralisia 1x/descanso longo)."
    },
    {
      "item": "Veneno de Cobra (frasco)",
      "chance": "30%",
      "effect": "Aplica 2d6 veneno em arma (3 usos)."
    },
    {
      "item": "Pele de Cobra",
      "chance": "20%",
      "effect": "Material para armadura leve +1."
    },
    {
      "item": "Moedas (2d8 po)",
      "chance": "70%",
      "effect": "Tesouro do ninho."
    }
  ],
  "description": "A creature known as Cobra Gigante."
},
  {
  "id": "javali-enfurecido",
  "name": "Javali Enfurecido",
  "nd": "ND 1/2",
  "rank": "E",
  "type": "Besta",
  "attributes": {
    "FOR": {
      "value": 16,
      "modifier": "+3"
    },
    "DES": {
      "value": 10,
      "modifier": "+0"
    },
    "CON": {
      "value": 14,
      "modifier": "+2"
    },
    "INT": {
      "value": 4,
      "modifier": "-3"
    },
    "SAB": {
      "value": 8,
      "modifier": "-1"
    },
    "CAR": {
      "value": 6,
      "modifier": "-2"
    }
  },
  "ca": 12,
  "pv": "18 (3d8+6)",
  "speed": "9 m",
  "attacks": [
    "Presa: +5 acerto, 2d4+3 cortante",
    "Carga: +5 acerto, 2d6+3 contundente (requer deslocamento de 6m)"
  ],
  "abilities": [
    "Fúria Irracional: quando ferido, entra em fúria (vantagem Força, +2 dano, resistência dano físico)",
    "Investida Imprudente: após carga, -2 CA até próximo turno"
  ],
  "drops": [
    {
      "item": "Essência de Javali Enfurecido (Rank 6)",
      "chance": "20%",
      "effect": "+1 Força, +1 Constituição. Passiva: Fúria Irracional. Ativa: Carga Devastadora."
    },
    {
      "item": "Presas de Javali",
      "chance": "35%",
      "effect": "Material para punhal +1."
    },
    {
      "item": "Carne Selvagem",
      "chance": "40%",
      "effect": "Ração que recupera 1d4+1 PV."
    },
    {
      "item": "Moedas (1d6 po)",
      "chance": "60%",
      "effect": "Moedas de cobre."
    }
  ],
  "description": "A creature known as Javali Enfurecido."
},
  {
  "id": "coruja-sabia",
  "name": "Coruja Sábia",
  "nd": "ND 1/4",
  "rank": "F",
  "type": "Besta",
  "attributes": {
    "FOR": {
      "value": 6,
      "modifier": "-2"
    },
    "DES": {
      "value": 14,
      "modifier": "+2"
    },
    "CON": {
      "value": 10,
      "modifier": "+0"
    },
    "INT": {
      "value": 12,
      "modifier": "+1"
    },
    "SAB": {
      "value": 16,
      "modifier": "+3"
    },
    "CAR": {
      "value": 8,
      "modifier": "-1"
    }
  },
  "ca": 11,
  "pv": "4 (1d8)",
  "speed": "3 m (voo 12 m)",
  "attacks": [
    "Garras: +4 acerto, 1d4+2 cortante"
  ],
  "abilities": [
    "Voar Silenciosamente: vantagem em Furtividade ao voar",
    "Percepção Aguçada: vantagem em Percepção (audiovisual)"
  ],
  "drops": [
    {
      "item": "Essência de Coruja Sábia (Rank 7)",
      "chance": "15%",
      "effect": "+1 Sabedoria. Passiva: Percepção Aguçada. Ativa: Olhar Profundo (ver invisibilidade 1x/descanso curto)."
    },
    {
      "item": "Pena de Coruja",
      "chance": "40%",
      "effect": "Material para pergaminhos."
    },
    {
      "item": "Símbolo da Sabedoria",
      "chance": "10%",
      "effect": "Amuleto +1 Intuição."
    },
    {
      "item": "Moedas (1d4 po)",
      "chance": "50%",
      "effect": "Pequenas moedas."
    }
  ],
  "description": "A creature known as Coruja Sábia."
},
  {
  "id": "rato-gigante",
  "name": "Rato Gigante",
  "nd": "ND 1/8",
  "rank": "F",
  "type": "Besta",
  "attributes": {
    "FOR": {
      "value": 10,
      "modifier": "+0"
    },
    "DES": {
      "value": 14,
      "modifier": "+2"
    },
    "CON": {
      "value": 10,
      "modifier": "+0"
    },
    "INT": {
      "value": 4,
      "modifier": "-3"
    },
    "SAB": {
      "value": 8,
      "modifier": "-1"
    },
    "CAR": {
      "value": 6,
      "modifier": "-2"
    }
  },
  "ca": 11,
  "pv": "5 (2d6-2)",
  "speed": "9 m",
  "attacks": [
    "Mordida: +4 acerto, 1d4+2 perfurante"
  ],
  "abilities": [
    "Enxame: se houver 3 ou mais ratos adjacentes, causam +1d4 de dano"
  ],
  "drops": [
    {
      "item": "Essência de Rato Gigante (Rank 7)",
      "chance": "10%",
      "effect": "+1 Destreza. Passiva: Enxame. Ativa: Escapar (ação bônus para desengajar)."
    },
    {
      "item": "Dentes de Rato",
      "chance": "30%",
      "effect": "Material para veneno barato."
    },
    {
      "item": "Moedas (1d4 po)",
      "chance": "40%",
      "effect": "Alguns centavos."
    }
  ],
  "description": "A creature known as Rato Gigante."
},
  {
  "id": "pantera-negra",
  "name": "Pantera Negra",
  "nd": "ND 1",
  "rank": "D",
  "type": "Besta",
  "attributes": {
    "FOR": {
      "value": 14,
      "modifier": "+2"
    },
    "DES": {
      "value": 18,
      "modifier": "+4"
    },
    "CON": {
      "value": 12,
      "modifier": "+1"
    },
    "INT": {
      "value": 6,
      "modifier": "-2"
    },
    "SAB": {
      "value": 12,
      "modifier": "+1"
    },
    "CAR": {
      "value": 8,
      "modifier": "-1"
    }
  },
  "ca": 14,
  "pv": "22 (4d8+4)",
  "speed": "12 m",
  "attacks": [
    "Garra: +6 acerto, 1d8+4 cortante",
    "Mordida: +6 acerto, 1d6+4 perfurante"
  ],
  "abilities": [
    "Ataque Furtivo: +2d6 de dano se tiver vantagem",
    "Escalar: deslocamento de escalada 9 m"
  ],
  "drops": [
    {
      "item": "Essência de Pantera Negra (Rank 5)",
      "chance": "25%",
      "effect": "+2 Destreza. Passiva: Ataque Furtivo. Ativa: Escalar (deslocamento de escalada igual ao de movimento)."
    },
    {
      "item": "Pele de Pantera",
      "chance": "30%",
      "effect": "Capa que concede vantagem em Furtividade à noite."
    },
    {
      "item": "Garras Afiadas",
      "chance": "20%",
      "effect": "Material para arma +1."
    },
    {
      "item": "Moedas (2d6 po)",
      "chance": "80%",
      "effect": "Tesouro do covil."
    }
  ],
  "description": "A creature known as Pantera Negra."
},
  {
  "id": "hipogrifo",
  "name": "Hipogrifo",
  "nd": "ND 2",
  "rank": "C",
  "type": "Besta",
  "attributes": {
    "FOR": {
      "value": 18,
      "modifier": "+4"
    },
    "DES": {
      "value": 14,
      "modifier": "+2"
    },
    "CON": {
      "value": 14,
      "modifier": "+2"
    },
    "INT": {
      "value": 8,
      "modifier": "-1"
    },
    "SAB": {
      "value": 12,
      "modifier": "+1"
    },
    "CAR": {
      "value": 10,
      "modifier": "+0"
    }
  },
  "ca": 13,
  "pv": "45 (6d10+12)",
  "speed": "9 m (voo 18 m)",
  "attacks": [
    "Bicada: +6 acerto, 1d10+4 perfurante",
    "Garras: +6 acerto, 2d6+4 cortante"
  ],
  "abilities": [
    "Voo Veloz: ação bônus para Desengajar",
    "Ataque em Mergulho: +2d6 de dano se deslocar 9m em linha reta"
  ],
  "drops": [
    {
      "item": "Essência de Hipogrifo (Rank 4)",
      "chance": "20%",
      "effect": "+1 Força, +1 Destreza. Passiva: Voo Veloz. Ativa: Mergulho (1x/descanso curto)."
    },
    {
      "item": "Penas de Hipogrifo",
      "chance": "40%",
      "effect": "Material para flechas de precisão."
    },
    {
      "item": "Ovo de Hipogrifo",
      "chance": "10%",
      "effect": "Pode ser vendido ou chocado como montaria."
    },
    {
      "item": "Moedas (4d8 po)",
      "chance": "100%",
      "effect": "Tesouro."
    }
  ],
  "description": "A creature known as Hipogrifo."
},
  {
  "id": "basilisco-jovem",
  "name": "Basilisco Jovem",
  "nd": "ND 3",
  "rank": "B",
  "type": "Besta",
  "attributes": {
    "FOR": {
      "value": 16,
      "modifier": "+3"
    },
    "DES": {
      "value": 8,
      "modifier": "-1"
    },
    "CON": {
      "value": 16,
      "modifier": "+3"
    },
    "INT": {
      "value": 4,
      "modifier": "-3"
    },
    "SAB": {
      "value": 10,
      "modifier": "+0"
    },
    "CAR": {
      "value": 8,
      "modifier": "-1"
    }
  },
  "ca": 15,
  "pv": "52 (7d10+14)",
  "speed": "6 m",
  "attacks": [
    "Mordida: +5 acerto, 2d6+3 perfurante + 2d6 veneno (CD 13 Con reduz metade)",
    "Olhar Petrífico: CD 13 Con ou fica lentificado por 1 rodada"
  ],
  "abilities": [
    "Resistência a Veneno",
    "Camuflagem: vantagem em Furtividade em pedra"
  ],
  "drops": [
    {
      "item": "Essência de Basilisco Jovem (Rank 3)",
      "chance": "15%",
      "effect": "+1 Força, +1 Con. Passiva: Resistência a Veneno. Ativa: Olhar Petrífico (1x/descanso longo, alvo paralisado 1 rodada)."
    },
    {
      "item": "Olho de Basilisco",
      "chance": "10%",
      "effect": "Item raro que pode paralisar criaturas uma vez."
    },
    {
      "item": "Pele Escamosa",
      "chance": "25%",
      "effect": "Material para armadura resistente a veneno."
    },
    {
      "item": "Moedas (5d10 po)",
      "chance": "100%",
      "effect": "Tesouro."
    }
  ],
  "description": "A creature known as Basilisco Jovem."
},
  {
  "id": "grifo-anciao",
  "name": "Grifo Ancião",
  "nd": "ND 4",
  "rank": "A",
  "type": "Besta",
  "attributes": {
    "FOR": {
      "value": 20,
      "modifier": "+5"
    },
    "DES": {
      "value": 12,
      "modifier": "+1"
    },
    "CON": {
      "value": 18,
      "modifier": "+4"
    },
    "INT": {
      "value": 8,
      "modifier": "-1"
    },
    "SAB": {
      "value": 14,
      "modifier": "+2"
    },
    "CAR": {
      "value": 12,
      "modifier": "+1"
    }
  },
  "ca": 16,
  "pv": "85 (10d10+30)",
  "speed": "9 m (voo 24 m)",
  "attacks": [
    "Bicada: +8 acerto, 2d8+5 perfurante",
    "Garras: +8 acerto, 2d8+5 cortante",
    "Ataque de Asa: área 3m, CD 15 Destreza ou 2d6+5 contundente e queda"
  ],
  "abilities": [
    "Voo Implacável: pode voar mesmo com metade dos PV",
    "Rugido Aterrorizante: ação bônus, CD 13 Sab ou ficar amedrontado"
  ],
  "drops": [
    {
      "item": "Essência de Grifo Ancião (Rank 2)",
      "chance": "10%",
      "effect": "+2 Força, +1 Sabedoria. Passiva: Voo Implacável. Ativa: Rugido Aterrorizante."
    },
    {
      "item": "Penas Lendárias",
      "chance": "30%",
      "effect": "Material para arco +2."
    },
    {
      "item": "Garra de Grifo",
      "chance": "20%",
      "effect": "Arma natural +2."
    },
    {
      "item": "Moedas (10d10 po)",
      "chance": "100%",
      "effect": "Tesouro lendário."
    }
  ],
  "description": "A creature known as Grifo Ancião."
},
  {
  "id": "cao-infernal",
  "name": "Cão Infernal",
  "nd": "ND 2",
  "rank": "C",
  "type": "Besta",
  "attributes": {
    "FOR": {
      "value": 16,
      "modifier": "+3"
    },
    "DES": {
      "value": 14,
      "modifier": "+2"
    },
    "CON": {
      "value": 14,
      "modifier": "+2"
    },
    "INT": {
      "value": 6,
      "modifier": "-2"
    },
    "SAB": {
      "value": 10,
      "modifier": "+0"
    },
    "CAR": {
      "value": 8,
      "modifier": "-1"
    }
  },
  "ca": 14,
  "pv": "39 (6d8+12)",
  "speed": "12 m",
  "attacks": [
    "Mordida: +5 acerto, 1d10+3 perfurante + 1d6 fogo",
    "Sopro de Fogo (cone 4,5m): 3d6 fogo, CD 12 Destreza reduz metade"
  ],
  "abilities": [
    "Resistência a Fogo",
    "Visão no Escuro (18m)"
  ],
  "drops": [
    {
      "item": "Essência de Cão Infernal (Rank 4)",
      "chance": "20%",
      "effect": "+1 Força, +1 Constituição. Passiva: Resistência a Fogo. Ativa: Sopro de Fogo (1x/descanso curto)."
    },
    {
      "item": "Chifre Infernal",
      "chance": "25%",
      "effect": "Material para arma com dano de fogo."
    },
    {
      "item": "Pele de Cão Infernal",
      "chance": "30%",
      "effect": "Capa que concede resistência a fogo."
    },
    {
      "item": "Moedas (3d10 po)",
      "chance": "80%",
      "effect": "Moedas aquecidas."
    }
  ],
  "description": "A creature known as Cão Infernal."
},
  {
  "id": "garra-de-gelo",
  "name": "Garra de Gelo",
  "nd": "ND 1",
  "rank": "D",
  "type": "Besta",
  "attributes": {
    "FOR": {
      "value": 12,
      "modifier": "+1"
    },
    "DES": {
      "value": 16,
      "modifier": "+3"
    },
    "CON": {
      "value": 10,
      "modifier": "+0"
    },
    "INT": {
      "value": 8,
      "modifier": "-1"
    },
    "SAB": {
      "value": 12,
      "modifier": "+1"
    },
    "CAR": {
      "value": 8,
      "modifier": "-1"
    }
  },
  "ca": 13,
  "pv": "19 (3d8+6)",
  "speed": "9 m",
  "attacks": [
    "Garra de Gelo: +5 acerto, 1d6+3 cortante + 1d4 frio"
  ],
  "abilities": [
    "Aura de Frio: criaturas adjacentes sofrem 1d4 frio no início do turno",
    "Resistência a Frio"
  ],
  "drops": [
    {
      "item": "Essência de Garra de Gelo (Rank 5)",
      "chance": "25%",
      "effect": "+1 Destreza. Passiva: Resistência a Frio. Ativa: Aura de Frio (1x/descanso curto, 1 minuto)."
    },
    {
      "item": "Cristal de Gelo",
      "chance": "35%",
      "effect": "Material para arma com dano de frio."
    },
    {
      "item": "Moedas (2d6 po)",
      "chance": "70%",
      "effect": "Moedas cobertas de gelo."
    }
  ],
  "description": "A creature known as Garra de Gelo."
},
  {
  "id": "serpente-aquatica",
  "name": "Serpente Aquática",
  "nd": "ND 2",
  "rank": "D",
  "type": "Besta",
  "attributes": {
    "FOR": {
      "value": 14,
      "modifier": "+2"
    },
    "DES": {
      "value": 12,
      "modifier": "+1"
    },
    "CON": {
      "value": 14,
      "modifier": "+2"
    },
    "INT": {
      "value": 6,
      "modifier": "-2"
    },
    "SAB": {
      "value": 10,
      "modifier": "+0"
    },
    "CAR": {
      "value": 8,
      "modifier": "-1"
    }
  },
  "ca": 14,
  "pv": "33 (5d10+10)",
  "speed": "9 m (natação 12 m)",
  "attacks": [
    "Mordida: +4 acerto, 2d6+2 perfurante",
    "Constrição: +4 acerto, 1d8+2 contundente e agarrado"
  ],
  "abilities": [
    "Anfíbio",
    "Esconder-se na Água: vantagem em Furtividade submersa"
  ],
  "drops": [
    {
      "item": "Essência de Serpente Aquática (Rank 5)",
      "chance": "20%",
      "effect": "+1 Força, +1 Constituição. Passiva: Anfíbio. Ativa: Constrição."
    },
    {
      "item": "Escamas Azuis",
      "chance": "40%",
      "effect": "Material para armadura leve."
    },
    {
      "item": "Veneno Aquático",
      "chance": "15%",
      "effect": "Aplica 2d6 veneno, mas apenas em água."
    },
    {
      "item": "Moedas (3d8 po)",
      "chance": "80%",
      "effect": "Moedas encharcadas."
    }
  ],
  "description": "A creature known as Serpente Aquática."
},
  {
  "id": "aranha-gigante",
  "name": "Aranha Gigante",
  "nd": "ND 1",
  "rank": "E",
  "type": "Besta",
  "attributes": {
    "FOR": {
      "value": 12,
      "modifier": "+1"
    },
    "DES": {
      "value": 16,
      "modifier": "+3"
    },
    "CON": {
      "value": 10,
      "modifier": "+0"
    },
    "INT": {
      "value": 4,
      "modifier": "-3"
    },
    "SAB": {
      "value": 10,
      "modifier": "+0"
    },
    "CAR": {
      "value": 6,
      "modifier": "-2"
    }
  },
  "ca": 12,
  "pv": "22 (4d8+4)",
  "speed": "9 m (escalada 9 m)",
  "attacks": [
    "Mordida: +5 acerto, 1d6+3 perfurante + 2d6 veneno (CD 12 Con reduz metade)",
    "Teia: alcance 9 m, restringe alvo (CD 12 Força)"
  ],
  "abilities": [
    "Caminhar nas Paredes",
    "Visão no Escuro"
  ],
  "drops": [
    {
      "item": "Essência de Aranha Gigante (Rank 6)",
      "chance": "25%",
      "effect": "+1 Destreza. Passiva: Caminhar nas Paredes. Ativa: Teia (1x/descanso curto)."
    },
    {
      "item": "Fios de Seda",
      "chance": "50%",
      "effect": "Material para corda resistente."
    },
    {
      "item": "Glândula de Veneno",
      "chance": "20%",
      "effect": "Aplica 1d6 veneno em arma."
    },
    {
      "item": "Moedas (1d12 po)",
      "chance": "70%",
      "effect": "Tesouro grudado em teias."
    }
  ],
  "description": "A creature known as Aranha Gigante."
},
  {
  "id": "mamute-lanoso",
  "name": "Mamute Lanoso",
  "nd": "ND 3",
  "rank": "B",
  "type": "Besta",
  "attributes": {
    "FOR": {
      "value": 22,
      "modifier": "+6"
    },
    "DES": {
      "value": 6,
      "modifier": "-2"
    },
    "CON": {
      "value": 18,
      "modifier": "+4"
    },
    "INT": {
      "value": 4,
      "modifier": "-3"
    },
    "SAB": {
      "value": 10,
      "modifier": "+0"
    },
    "CAR": {
      "value": 8,
      "modifier": "-1"
    }
  },
  "ca": 15,
  "pv": "76 (9d12+36)",
  "speed": "12 m",
  "attacks": [
    "Presas: +8 acerto, 3d6+6 cortante",
    "Pisoteio: +8 acerto, 3d8+6 contundente (carga)"
  ],
  "abilities": [
    "Carga Implacável: após mover 6m, causa dano extra e derruba",
    "Resistência a Frio"
  ],
  "drops": [
    {
      "item": "Essência de Mamute Lanoso (Rank 3)",
      "chance": "15%",
      "effect": "+2 Força, +1 Con. Passiva: Resistência a Frio. Ativa: Carga Implacável."
    },
    {
      "item": "Presas de Marfim",
      "chance": "40%",
      "effect": "Valiosas (50 po cada)."
    },
    {
      "item": "Pele Lanosa",
      "chance": "35%",
      "effect": "Material para capa resistente ao frio."
    },
    {
      "item": "Moedas (8d10 po)",
      "chance": "100%",
      "effect": "Tesouro."
    }
  ],
  "description": "A creature known as Mamute Lanoso."
},
  {
  "id": "leao-das-montanhas",
  "name": "Leão das Montanhas",
  "nd": "ND 1",
  "rank": "D",
  "type": "Besta",
  "attributes": {
    "FOR": {
      "value": 17,
      "modifier": "+3"
    },
    "DES": {
      "value": 14,
      "modifier": "+2"
    },
    "CON": {
      "value": 12,
      "modifier": "+1"
    },
    "INT": {
      "value": 6,
      "modifier": "-2"
    },
    "SAB": {
      "value": 12,
      "modifier": "+1"
    },
    "CAR": {
      "value": 8,
      "modifier": "-1"
    }
  },
  "ca": 12,
  "pv": "26 (4d10+4)",
  "speed": "12 m",
  "attacks": [
    "Garra: +5 acerto, 1d8+3 cortante",
    "Mordida: +5 acerto, 1d10+3 perfurante"
  ],
  "abilities": [
    "Ataque em Bando (se aliado adjacente, +1d6 dano)",
    "Rugido Intimidante: ação bônus, CD 12 Sab ou ficar amedrontado"
  ],
  "drops": [
    {
      "item": "Essência de Leão (Rank 5)",
      "chance": "20%",
      "effect": "+1 Força, +1 Carisma. Passiva: Rugido Intimidante. Ativa: Ataque em Bando."
    },
    {
      "item": "Juba de Leão",
      "chance": "30%",
      "effect": "Capa que concede vantagem em Intimidação."
    },
    {
      "item": "Garras",
      "chance": "25%",
      "effect": "Material para arma +1."
    },
    {
      "item": "Moedas (2d10 po)",
      "chance": "80%",
      "effect": "Tesouro."
    }
  ],
  "description": "A creature known as Leão das Montanhas."
},
  {
  "id": "bufalo-do-pantano",
  "name": "Búfalo do Pântano",
  "nd": "ND 1/2",
  "rank": "E",
  "type": "Besta",
  "attributes": {
    "FOR": {
      "value": 18,
      "modifier": "+4"
    },
    "DES": {
      "value": 8,
      "modifier": "-1"
    },
    "CON": {
      "value": 14,
      "modifier": "+2"
    },
    "INT": {
      "value": 4,
      "modifier": "-3"
    },
    "SAB": {
      "value": 8,
      "modifier": "-1"
    },
    "CAR": {
      "value": 6,
      "modifier": "-2"
    }
  },
  "ca": 11,
  "pv": "22 (3d10+6)",
  "speed": "9 m",
  "attacks": [
    "Chifrada: +6 acerto, 2d6+4 cortante",
    "Pisoteio: +6 acerto, 1d8+4 contundente"
  ],
  "abilities": [
    "Investida: após mover 6m, causa +2d6 e derruba",
    "Resistência a Veneno"
  ],
  "drops": [
    {
      "item": "Essência de Búfalo (Rank 6)",
      "chance": "20%",
      "effect": "+1 Força, +1 Con. Passiva: Resistência a Veneno. Ativa: Investida."
    },
    {
      "item": "Chifres de Búfalo",
      "chance": "30%",
      "effect": "Material para arma."
    },
    {
      "item": "Couro Grosso",
      "chance": "40%",
      "effect": "Material para armadura."
    },
    {
      "item": "Moedas (1d10 po)",
      "chance": "70%",
      "effect": "Moedas."
    }
  ],
  "description": "A creature known as Búfalo do Pântano."
},
  {
  "id": "corca-da-luz",
  "name": "Corça da Luz",
  "nd": "ND 1/4",
  "rank": "F",
  "type": "Besta",
  "attributes": {
    "FOR": {
      "value": 10,
      "modifier": "+0"
    },
    "DES": {
      "value": 16,
      "modifier": "+3"
    },
    "CON": {
      "value": 10,
      "modifier": "+0"
    },
    "INT": {
      "value": 8,
      "modifier": "-1"
    },
    "SAB": {
      "value": 14,
      "modifier": "+2"
    },
    "CAR": {
      "value": 12,
      "modifier": "+1"
    }
  },
  "ca": 13,
  "pv": "8 (2d8)",
  "speed": "12 m",
  "attacks": [
    "Chifres: +5 acerto, 1d4+3 contundente"
  ],
  "abilities": [
    "Passos Leves: não deixa rastros",
    "Aura Curativa: uma vez por dia, pode curar 1d8+2 PV em um aliado"
  ],
  "drops": [
    {
      "item": "Essência de Corça da Luz (Rank 7)",
      "chance": "15%",
      "effect": "+1 Destreza, +1 Sabedoria. Passiva: Passos Leves. Ativa: Aura Curativa."
    },
    {
      "item": "Chifre Brilhante",
      "chance": "25%",
      "effect": "Material para foco divino."
    },
    {
      "item": "Pelo Radiante",
      "chance": "30%",
      "effect": "Tecido para vestes de cura."
    },
    {
      "item": "Moedas (1d6 po)",
      "chance": "60%",
      "effect": "Moedas."
    }
  ],
  "description": "A creature known as Corça da Luz."
},
  {
  "id": "fera-da-escuridao",
  "name": "Fera da Escuridão",
  "nd": "ND 2",
  "rank": "C",
  "type": "Besta",
  "attributes": {
    "FOR": {
      "value": 18,
      "modifier": "+4"
    },
    "DES": {
      "value": 14,
      "modifier": "+2"
    },
    "CON": {
      "value": 16,
      "modifier": "+3"
    },
    "INT": {
      "value": 6,
      "modifier": "-2"
    },
    "SAB": {
      "value": 12,
      "modifier": "+1"
    },
    "CAR": {
      "value": 8,
      "modifier": "-1"
    }
  },
  "ca": 15,
  "pv": "45 (6d10+12)",
  "speed": "12 m",
  "attacks": [
    "Garra Sombria: +6 acerto, 2d6+4 cortante + 1d6 necrótico",
    "Mordida: +6 acerto, 1d8+4 perfurante"
  ],
  "abilities": [
    "Passos Sombrios: ação bônus para teleporte 3m",
    "Visão no Escuro (18m)"
  ],
  "drops": [
    {
      "item": "Essência de Fera da Escuridão (Rank 4)",
      "chance": "20%",
      "effect": "+1 Força, +1 Destreza. Passiva: Visão no Escuro. Ativa: Passos Sombrios."
    },
    {
      "item": "Garras Negras",
      "chance": "30%",
      "effect": "Arma +1 com dano necrótico."
    },
    {
      "item": "Pele Sombria",
      "chance": "25%",
      "effect": "Capa que concede vantagem em Furtividade à noite."
    },
    {
      "item": "Moedas (4d8 po)",
      "chance": "100%",
      "effect": "Tesouro."
    }
  ],
  "description": "A creature known as Fera da Escuridão."
},
  {
  "id": "dragaozinho-de-fogo",
  "name": "Dragãozinho de Fogo",
  "nd": "ND 3",
  "rank": "B",
  "type": "Besta",
  "attributes": {
    "FOR": {
      "value": 12,
      "modifier": "+1"
    },
    "DES": {
      "value": 14,
      "modifier": "+2"
    },
    "CON": {
      "value": 14,
      "modifier": "+2"
    },
    "INT": {
      "value": 8,
      "modifier": "-1"
    },
    "SAB": {
      "value": 10,
      "modifier": "+0"
    },
    "CAR": {
      "value": 12,
      "modifier": "+1"
    }
  },
  "ca": 16,
  "pv": "52 (7d8+14)",
  "speed": "9 m (voo 18 m)",
  "attacks": [
    "Mordida: +4 acerto, 1d10+1 perfurante + 1d6 fogo",
    "Sopro de Fogo (cone 4,5m): 4d6 fogo, CD 13 Destreza reduz metade"
  ],
  "abilities": [
    "Resistência a Fogo",
    "Voo"
  ],
  "drops": [
    {
      "item": "Essência de Dragãozinho (Rank 3)",
      "chance": "15%",
      "effect": "+1 Carisma, +1 Destreza. Passiva: Resistência a Fogo. Ativa: Sopro de Fogo."
    },
    {
      "item": "Escama de Dragão",
      "chance": "40%",
      "effect": "Material para armadura resistente a fogo."
    },
    {
      "item": "Glândula de Fogo",
      "chance": "10%",
      "effect": "Pode ser usada como granada (3d6 fogo)."
    },
    {
      "item": "Moedas (5d10 po)",
      "chance": "100%",
      "effect": "Tesouro."
    }
  ],
  "description": "A creature known as Dragãozinho de Fogo."
},
  {
  "id": "manticora-jovem",
  "name": "Manticora Jovem",
  "nd": "ND 4",
  "rank": "A",
  "type": "Besta",
  "attributes": {
    "FOR": {
      "value": 18,
      "modifier": "+4"
    },
    "DES": {
      "value": 12,
      "modifier": "+1"
    },
    "CON": {
      "value": 16,
      "modifier": "+3"
    },
    "INT": {
      "value": 8,
      "modifier": "-1"
    },
    "SAB": {
      "value": 12,
      "modifier": "+1"
    },
    "CAR": {
      "value": 10,
      "modifier": "+0"
    }
  },
  "ca": 14,
  "pv": "78 (9d10+27)",
  "speed": "9 m (voo 15 m)",
  "attacks": [
    "Mordida: +7 acerto, 2d8+4 perfurante",
    "Espinhos (x3): +5 acerto, 1d8+2 perfurante, alcance 18/36 m",
    "Garras: +7 acerto, 1d10+4 cortante"
  ],
  "abilities": [
    "Lançar Espinhos: ação bônus, até 3 espinhos por rodada",
    "Voo"
  ],
  "drops": [
    {
      "item": "Essência de Manticora Jovem (Rank 2)",
      "chance": "10%",
      "effect": "+2 Força, +1 Destreza. Passiva: Lançar Espinhos. Ativa: Voo."
    },
    {
      "item": "Espinhos de Manticora",
      "chance": "35%",
      "effect": "Dardos venenosos +1."
    },
    {
      "item": "Pele de Manticora",
      "chance": "20%",
      "effect": "Armadura +1."
    },
    {
      "item": "Moedas (8d10 po)",
      "chance": "100%",
      "effect": "Tesouro."
    }
  ],
  "description": "A creature known as Manticora Jovem."
},
  {
  "id": "quimera",
  "name": "Quimera",
  "nd": "ND 5",
  "rank": "S",
  "type": "Besta",
  "attributes": {
    "FOR": {
      "value": 20,
      "modifier": "+5"
    },
    "DES": {
      "value": 10,
      "modifier": "+0"
    },
    "CON": {
      "value": 18,
      "modifier": "+4"
    },
    "INT": {
      "value": 6,
      "modifier": "-2"
    },
    "SAB": {
      "value": 12,
      "modifier": "+1"
    },
    "CAR": {
      "value": 10,
      "modifier": "+0"
    }
  },
  "ca": 16,
  "pv": "102 (12d10+36)",
  "speed": "9 m (voo 12 m)",
  "attacks": [
    "Mordida de Leão: +8 acerto, 2d10+5 cortante",
    "Chifres de Bode: +8 acerto, 2d8+5 perfurante",
    "Sopro de Dragão (cone 9m): 6d8 fogo, CD 15 Destreza reduz metade"
  ],
  "abilities": [
    "Três Cabeças: vantagem em testes de Percepção",
    "Resistência a Fogo"
  ],
  "drops": [
    {
      "item": "Essência de Quimera (Rank 1)",
      "chance": "8%",
      "effect": "+2 Força, +2 Constituição. Passiva: Três Cabeças (vantagem em Percepção). Ativa: Sopro de Dragão."
    },
    {
      "item": "Cabeça de Dragão",
      "chance": "15%",
      "effect": "Troféu valioso (250 po)."
    },
    {
      "item": "Pele de Quimera",
      "chance": "20%",
      "effect": "Armadura +2."
    },
    {
      "item": "Moedas (15d10 po)",
      "chance": "100%",
      "effect": "Tesouro lendário."
    }
  ],
  "description": "A creature known as Quimera."
}
,
  {
  "id": "aranha-saltadora",
  "name": "Aranha Saltadora",
  "nd": "ND 1/4",
  "rank": "F",
  "type": "Inseto/Aracnídeo",
  "attributes": {
    "FOR": {
      "value": 8,
      "modifier": "-1"
    },
    "DES": {
      "value": 16,
      "modifier": "+3"
    },
    "CON": {
      "value": 8,
      "modifier": "-1"
    },
    "INT": {
      "value": 2,
      "modifier": "-4"
    },
    "SAB": {
      "value": 12,
      "modifier": "+1"
    },
    "CAR": {
      "value": 4,
      "modifier": "-3"
    }
  },
  "ca": 13,
  "pv": "6 (2d6-1)",
  "speed": "9 m (escalada 9 m)",
  "attacks": [
    "Mordida: +5 acerto, 1d4+3 perfurante + 1d4 veneno (CD 11 Con reduz metade)"
  ],
  "abilities": [
    "Salto Poderoso: pode saltar até 6m horizontalmente",
    "Visão Aguda: vantagem em Percepção"
  ],
  "drops": [
    {
      "item": "Essência de Aranha Saltadora (Rank 7)",
      "chance": "25%",
      "effect": "+1 Destreza. Passiva: Salto Poderoso. Ativa: Escalar (1x/descanso curto)."
    },
    {
      "item": "Glândula de Veneno",
      "chance": "30%",
      "effect": "Aplica 1d4 veneno em arma (3 usos)."
    },
    {
      "item": "Seda de Aranha",
      "chance": "40%",
      "effect": "Material para corda leve."
    },
    {
      "item": "Moedas (1d4 po)",
      "chance": "50%",
      "effect": "Pequenas moedas."
    }
  ],
  "description": "Um(a) aranha saltadora gigante e perigoso(a), encontrado(a) em florestas densas, cavernas ou ruínas."
},
  {
  "id": "formiga-operaria",
  "name": "Formiga Operária",
  "nd": "ND 0",
  "rank": "F",
  "type": "Inseto/Aracnídeo",
  "attributes": {
    "FOR": {
      "value": 10,
      "modifier": "+0"
    },
    "DES": {
      "value": 12,
      "modifier": "+1"
    },
    "CON": {
      "value": 10,
      "modifier": "+0"
    },
    "INT": {
      "value": 1,
      "modifier": "-5"
    },
    "SAB": {
      "value": 8,
      "modifier": "-1"
    },
    "CAR": {
      "value": 2,
      "modifier": "-4"
    }
  },
  "ca": 11,
  "pv": "4 (1d6+1)",
  "speed": "9 m",
  "attacks": [
    "Mordida: +2 acerto, 1d4 perfurante"
  ],
  "abilities": [
    "Feromônios: se ferida, outras formigas em 9m ganham vantagem no próximo ataque",
    "Força Coletiva: +1 Força por formiga adjacente (máx +3)"
  ],
  "drops": [
    {
      "item": "Essência de Formiga Operária (Rank 7)",
      "chance": "15%",
      "effect": "+1 Força. Passiva: Força Coletiva (limitada a +2). Ativa: Feromônios (1x/descanso curto)."
    },
    {
      "item": "Fragmento de Carapaça",
      "chance": "30%",
      "effect": "Material para armadura leve."
    },
    {
      "item": "Moedas (1d4 po)",
      "chance": "40%",
      "effect": "Poucas moedas."
    }
  ],
  "description": "Um(a) formiga operária gigante e perigoso(a), encontrado(a) em florestas densas, cavernas ou ruínas."
},
  {
  "id": "besouro-chifrudo",
  "name": "Besouro Chifrudo",
  "nd": "ND 1/2",
  "rank": "E",
  "type": "Inseto/Aracnídeo",
  "attributes": {
    "FOR": {
      "value": 14,
      "modifier": "+2"
    },
    "DES": {
      "value": 8,
      "modifier": "-1"
    },
    "CON": {
      "value": 14,
      "modifier": "+2"
    },
    "INT": {
      "value": 2,
      "modifier": "-4"
    },
    "SAB": {
      "value": 8,
      "modifier": "-1"
    },
    "CAR": {
      "value": 4,
      "modifier": "-3"
    }
  },
  "ca": 15,
  "pv": "13 (2d8+4)",
  "speed": "6 m",
  "attacks": [
    "Chifrada: +4 acerto, 1d8+2 contundente",
    "Pisoteio: +4 acerto, 1d6+2 contundente (após carga)"
  ],
  "abilities": [
    "Carga: se mover 6m em linha reta, causa +2d6 de dano e derruba (CD 12 Força)",
    "Armadura Natural: resistência a dano cortante"
  ],
  "drops": [
    {
      "item": "Essência de Besouro Chifrudo (Rank 6)",
      "chance": "20%",
      "effect": "+1 Força, +1 Constituição. Passiva: Armadura Natural. Ativa: Carga."
    },
    {
      "item": "Chifre de Besouro",
      "chance": "35%",
      "effect": "Material para maça +1."
    },
    {
      "item": "Carapaça Dura",
      "chance": "40%",
      "effect": "Material para escudo."
    },
    {
      "item": "Moedas (1d8 po)",
      "chance": "60%",
      "effect": "Moedas."
    }
  ],
  "description": "Um(a) besouro chifrudo gigante e perigoso(a), encontrado(a) em florestas densas, cavernas ou ruínas."
},
  {
  "id": "enxame-de-vespas",
  "name": "Enxame de Vespas",
  "nd": "ND 1/2",
  "rank": "E",
  "type": "Inseto/Aracnídeo",
  "attributes": {
    "FOR": {
      "value": 3,
      "modifier": "-4"
    },
    "DES": {
      "value": 14,
      "modifier": "+2"
    },
    "CON": {
      "value": 10,
      "modifier": "+0"
    },
    "INT": {
      "value": 1,
      "modifier": "-5"
    },
    "SAB": {
      "value": 8,
      "modifier": "-1"
    },
    "CAR": {
      "value": 2,
      "modifier": "-4"
    }
  },
  "ca": 12,
  "pv": "16 (3d8+3)",
  "speed": "9 m (voo 12 m)",
  "attacks": [
    "Ferrões: +4 acerto, 2d4+2 perfurante + 1d4 veneno (CD 11 Con reduz metade)"
  ],
  "abilities": [
    "Enxame: resistência a dano físico",
    "Ferrões Múltiplos: pode atacar duas criaturas adjacentes por rodada"
  ],
  "drops": [
    {
      "item": "Essência de Enxame de Vespas (Rank 6)",
      "chance": "20%",
      "effect": "+1 Destreza. Passiva: Enxame (resistência a dano físico). Ativa: Ferrões Múltiplos (1x/descanso curto)."
    },
    {
      "item": "Ferrão de Vespa",
      "chance": "30%",
      "effect": "Material para dardo +1."
    },
    {
      "item": "Favo de Mel Selvagem",
      "chance": "25%",
      "effect": "Consumível: recupera 1d4+1 PV."
    },
    {
      "item": "Moedas (1d6 po)",
      "chance": "50%",
      "effect": "Moedas."
    }
  ],
  "description": "Um(a) enxame de vespas gigante e perigoso(a), encontrado(a) em florestas densas, cavernas ou ruínas."
},
  {
  "id": "gafanhoto-carniceiro",
  "name": "Gafanhoto Carniceiro",
  "nd": "ND 1/4",
  "rank": "F",
  "type": "Inseto/Aracnídeo",
  "attributes": {
    "FOR": {
      "value": 10,
      "modifier": "+0"
    },
    "DES": {
      "value": 15,
      "modifier": "+2"
    },
    "CON": {
      "value": 10,
      "modifier": "+0"
    },
    "INT": {
      "value": 2,
      "modifier": "-4"
    },
    "SAB": {
      "value": 8,
      "modifier": "-1"
    },
    "CAR": {
      "value": 4,
      "modifier": "-3"
    }
  },
  "ca": 12,
  "pv": "8 (2d6+1)",
  "speed": "12 m (salto 9 m)",
  "attacks": [
    "Mordida: +4 acerto, 1d6+2 perfurante"
  ],
  "abilities": [
    "Salto Devastador: pode saltar até 9m e causar +1d6 de dano no ataque",
    "Pular para Fora: ação bônus para Desengajar após ataque"
  ],
  "drops": [
    {
      "item": "Essência de Gafanhoto (Rank 7)",
      "chance": "20%",
      "effect": "+1 Destreza. Passiva: Salto Devastador. Ativa: Pular para Fora."
    },
    {
      "item": "Pernas Saltadoras",
      "chance": "30%",
      "effect": "Material para botas de salto."
    },
    {
      "item": "Moedas (1d4 po)",
      "chance": "50%",
      "effect": "Moedas."
    }
  ],
  "description": "Um(a) gafanhoto carniceiro gigante e perigoso(a), encontrado(a) em florestas densas, cavernas ou ruínas."
},
  {
  "id": "escorpiao-pequeno",
  "name": "Escorpião Pequeno",
  "nd": "ND 1/2",
  "rank": "E",
  "type": "Inseto/Aracnídeo",
  "attributes": {
    "FOR": {
      "value": 12,
      "modifier": "+1"
    },
    "DES": {
      "value": 12,
      "modifier": "+1"
    },
    "CON": {
      "value": 12,
      "modifier": "+1"
    },
    "INT": {
      "value": 2,
      "modifier": "-4"
    },
    "SAB": {
      "value": 10,
      "modifier": "+0"
    },
    "CAR": {
      "value": 4,
      "modifier": "-3"
    }
  },
  "ca": 13,
  "pv": "10 (2d8+1)",
  "speed": "9 m",
  "attacks": [
    "Pinça: +3 acerto, 1d6+1 contundente (agarrar CD 11)",
    "Ferrão: +3 acerto, 1d4+1 perfurante + 2d4 veneno (CD 11 Con reduz metade)"
  ],
  "abilities": [
    "Visão no Escuro",
    "Armadura Natural: CA 13"
  ],
  "drops": [
    {
      "item": "Essência de Escorpião (Rank 6)",
      "chance": "20%",
      "effect": "+1 Força, +1 Constituição. Passiva: Visão no Escuro. Ativa: Ferrão Venenoso (aplica 2d4 veneno)."
    },
    {
      "item": "Ferrão de Escorpião",
      "chance": "25%",
      "effect": "Material para adaga envenenada."
    },
    {
      "item": "Pinça",
      "chance": "30%",
      "effect": "Material para manopla."
    },
    {
      "item": "Moedas (1d6 po)",
      "chance": "60%",
      "effect": "Moedas."
    }
  ],
  "description": "Um(a) escorpião pequeno gigante e perigoso(a), encontrado(a) em florestas densas, cavernas ou ruínas."
},
  {
  "id": "lagarta-monstruosa",
  "name": "Lagarta Monstruosa",
  "nd": "ND 1/2",
  "rank": "E",
  "type": "Inseto/Aracnídeo",
  "attributes": {
    "FOR": {
      "value": 14,
      "modifier": "+2"
    },
    "DES": {
      "value": 6,
      "modifier": "-2"
    },
    "CON": {
      "value": 14,
      "modifier": "+2"
    },
    "INT": {
      "value": 2,
      "modifier": "-4"
    },
    "SAB": {
      "value": 8,
      "modifier": "-1"
    },
    "CAR": {
      "value": 4,
      "modifier": "-3"
    }
  },
  "ca": 10,
  "pv": "18 (3d8+6)",
  "speed": "6 m",
  "attacks": [
    "Mordida: +4 acerto, 1d8+2 perfurante"
  ],
  "abilities": [
    "Espinhos Irritantes: ao ser atingida corpo a corpo, causa 1d4 perfurante ao atacante",
    "Regeneração Lenta: recupera 1 PV por turno se tiver pelo menos 1 PV"
  ],
  "drops": [
    {
      "item": "Essência de Lagarta (Rank 6)",
      "chance": "20%",
      "effect": "+1 Constituição. Passiva: Regeneração Lenta (recupera 1 PV/turno). Ativa: Espinhos (1x/descanso curto)."
    },
    {
      "item": "Seda Bruta",
      "chance": "40%",
      "effect": "Material para corda."
    },
    {
      "item": "Moedas (1d8 po)",
      "chance": "60%",
      "effect": "Moedas."
    }
  ],
  "description": "Um(a) lagarta monstruosa gigante e perigoso(a), encontrado(a) em florestas densas, cavernas ou ruínas."
},
  {
  "id": "vaga-lume-gigante",
  "name": "Vaga-Lume Gigante",
  "nd": "ND 1/4",
  "rank": "F",
  "type": "Inseto/Aracnídeo",
  "attributes": {
    "FOR": {
      "value": 8,
      "modifier": "-1"
    },
    "DES": {
      "value": 12,
      "modifier": "+1"
    },
    "CON": {
      "value": 10,
      "modifier": "+0"
    },
    "INT": {
      "value": 2,
      "modifier": "-4"
    },
    "SAB": {
      "value": 10,
      "modifier": "+0"
    },
    "CAR": {
      "value": 6,
      "modifier": "-2"
    }
  },
  "ca": 11,
  "pv": "6 (1d8+2)",
  "speed": "6 m (voo 9 m)",
  "attacks": [
    "Contato: +3 acerto, 1d4+1 radiante"
  ],
  "abilities": [
    "Luz Cegante: ação bônus, criaturas em 3m devem fazer CD 11 Con ou ficar cegas por 1 rodada",
    "Bioluminescência: emite luz suave"
  ],
  "drops": [
    {
      "item": "Essência de Vaga-Lume (Rank 7)",
      "chance": "15%",
      "effect": "+1 Carisma. Passiva: Bioluminescência. Ativa: Luz Cegante (1x/descanso curto)."
    },
    {
      "item": "Glândula Luminosa",
      "chance": "30%",
      "effect": "Cria luz suave por 1 hora."
    },
    {
      "item": "Moedas (1d4 po)",
      "chance": "40%",
      "effect": "Moedas."
    }
  ],
  "description": "Um(a) vaga-lume gigante gigante e perigoso(a), encontrado(a) em florestas densas, cavernas ou ruínas."
},
  {
  "id": "aranha-armadeira",
  "name": "Aranha Armadeira",
  "nd": "ND 2",
  "rank": "C",
  "type": "Inseto/Aracnídeo",
  "attributes": {
    "FOR": {
      "value": 14,
      "modifier": "+2"
    },
    "DES": {
      "value": 18,
      "modifier": "+4"
    },
    "CON": {
      "value": 12,
      "modifier": "+1"
    },
    "INT": {
      "value": 4,
      "modifier": "-3"
    },
    "SAB": {
      "value": 12,
      "modifier": "+1"
    },
    "CAR": {
      "value": 6,
      "modifier": "-2"
    }
  },
  "ca": 14,
  "pv": "28 (4d8+10)",
  "speed": "12 m (escalada 12 m)",
  "attacks": [
    "Mordida: +6 acerto, 1d8+4 perfurante + 3d6 veneno (CD 12 Con reduz metade)",
    "Teia: +6 acerto, alcance 9m, restringe alvo (CD 12 Força)"
  ],
  "abilities": [
    "Emboscada: vantagem em ataques contra alvos surpresos",
    "Caminhar nas Paredes"
  ],
  "drops": [
    {
      "item": "Essência de Aranha Armadeira (Rank 4)",
      "chance": "20%",
      "effect": "+2 Destreza. Passiva: Emboscada. Ativa: Teia (1x/descanso curto)."
    },
    {
      "item": "Veneno Potente",
      "chance": "25%",
      "effect": "Aplica 3d6 veneno (3 usos)."
    },
    {
      "item": "Seda de Aranha Reforçada",
      "chance": "35%",
      "effect": "Material para corda +1."
    },
    {
      "item": "Moedas (3d8 po)",
      "chance": "80%",
      "effect": "Tesouro."
    }
  ],
  "description": "Um(a) aranha armadeira gigante e perigoso(a), encontrado(a) em florestas densas, cavernas ou ruínas."
},
  {
  "id": "formiga-soldado",
  "name": "Formiga Soldado",
  "nd": "ND 2",
  "rank": "C",
  "type": "Inseto/Aracnídeo",
  "attributes": {
    "FOR": {
      "value": 16,
      "modifier": "+3"
    },
    "DES": {
      "value": 12,
      "modifier": "+1"
    },
    "CON": {
      "value": 14,
      "modifier": "+2"
    },
    "INT": {
      "value": 6,
      "modifier": "-2"
    },
    "SAB": {
      "value": 10,
      "modifier": "+0"
    },
    "CAR": {
      "value": 6,
      "modifier": "-2"
    }
  },
  "ca": 16,
  "pv": "32 (5d8+10)",
  "speed": "9 m",
  "attacks": [
    "Mordida: +5 acerto, 1d8+3 cortante",
    "Ácido: +4 acerto, 2d6 ácido, alcance 6m"
  ],
  "abilities": [
    "Feromônios de Ataque: aliados em 9m ganham +1d4 dano",
    "Carapaça: resistência a dano perfurante"
  ],
  "drops": [
    {
      "item": "Essência de Formiga Soldado (Rank 4)",
      "chance": "20%",
      "effect": "+1 Força, +1 Constituição. Passiva: Carapaça. Ativa: Ácido (1x/descanso curto)."
    },
    {
      "item": "Glândula de Ácido",
      "chance": "25%",
      "effect": "Causa 2d6 ácido em área."
    },
    {
      "item": "Mandíbula de Formiga",
      "chance": "30%",
      "effect": "Material para espada curta +1."
    },
    {
      "item": "Moedas (3d6 po)",
      "chance": "80%",
      "effect": "Moedas."
    }
  ],
  "description": "Um(a) formiga soldado gigante e perigoso(a), encontrado(a) em florestas densas, cavernas ou ruínas."
},
  {
  "id": "besouro-rinoceronte",
  "name": "Besouro Rinoceronte",
  "nd": "ND 3",
  "rank": "B",
  "type": "Inseto/Aracnídeo",
  "attributes": {
    "FOR": {
      "value": 20,
      "modifier": "+5"
    },
    "DES": {
      "value": 6,
      "modifier": "-2"
    },
    "CON": {
      "value": 18,
      "modifier": "+4"
    },
    "INT": {
      "value": 2,
      "modifier": "-4"
    },
    "SAB": {
      "value": 8,
      "modifier": "-1"
    },
    "CAR": {
      "value": 4,
      "modifier": "-3"
    }
  },
  "ca": 18,
  "pv": "52 (5d12+20)",
  "speed": "6 m",
  "attacks": [
    "Chifrada: +7 acerto, 2d8+5 contundente",
    "Pisoteio: +7 acerto, 2d6+5 contundente (após carga)"
  ],
  "abilities": [
    "Carga Poderosa: após mover 6m, causa +3d6 e derruba (CD 14 Força)",
    "Armadura Impenetrável: resistência a dano cortante e perfurante"
  ],
  "drops": [
    {
      "item": "Essência de Besouro Rinoceronte (Rank 3)",
      "chance": "15%",
      "effect": "+2 Força, +2 Constituição. Passiva: Armadura Impenetrável. Ativa: Carga Poderosa."
    },
    {
      "item": "Chifre Rinoceronte",
      "chance": "30%",
      "effect": "Material para maça +2."
    },
    {
      "item": "Carapaça de Besouro",
      "chance": "40%",
      "effect": "Material para armadura pesada +1."
    },
    {
      "item": "Moedas (5d10 po)",
      "chance": "100%",
      "effect": "Tesouro."
    }
  ],
  "description": "Um(a) besouro rinoceronte gigante e perigoso(a), encontrado(a) em florestas densas, cavernas ou ruínas."
},
  {
  "id": "enxame-de-abelhas",
  "name": "Enxame de Abelhas",
  "nd": "ND 2",
  "rank": "C",
  "type": "Inseto/Aracnídeo",
  "attributes": {
    "FOR": {
      "value": 3,
      "modifier": "-4"
    },
    "DES": {
      "value": 16,
      "modifier": "+3"
    },
    "CON": {
      "value": 12,
      "modifier": "+1"
    },
    "INT": {
      "value": 3,
      "modifier": "-4"
    },
    "SAB": {
      "value": 12,
      "modifier": "+1"
    },
    "CAR": {
      "value": 6,
      "modifier": "-2"
    }
  },
  "ca": 12,
  "pv": "35 (5d8+10)",
  "speed": "9 m (voo 15 m)",
  "attacks": [
    "Ferrões: +5 acerto, 2d6+3 perfurante + 2d6 veneno (CD 12 Con reduz metade)"
  ],
  "abilities": [
    "Enxame: resistência a dano físico",
    "Ferrões Sacrificiais: ao morrer, causa 2d6 veneno em área"
  ],
  "drops": [
    {
      "item": "Essência de Enxame de Abelhas (Rank 4)",
      "chance": "20%",
      "effect": "+1 Destreza, +1 Sabedoria. Passiva: Enxame. Ativa: Ferrões Sacrificiais (1x/descanso longo)."
    },
    {
      "item": "Mel Curativo",
      "chance": "30%",
      "effect": "Recupera 2d4+2 PV."
    },
    {
      "item": "Ferrão de Abelha",
      "chance": "25%",
      "effect": "Material para dardo envenenado."
    },
    {
      "item": "Moedas (2d8 po)",
      "chance": "70%",
      "effect": "Moedas."
    }
  ],
  "description": "Um(a) enxame de abelhas gigante e perigoso(a), encontrado(a) em florestas densas, cavernas ou ruínas."
},
  {
  "id": "escorpiao-gigante",
  "name": "Escorpião Gigante",
  "nd": "ND 3",
  "rank": "B",
  "type": "Inseto/Aracnídeo",
  "attributes": {
    "FOR": {
      "value": 16,
      "modifier": "+3"
    },
    "DES": {
      "value": 14,
      "modifier": "+2"
    },
    "CON": {
      "value": 14,
      "modifier": "+2"
    },
    "INT": {
      "value": 4,
      "modifier": "-3"
    },
    "SAB": {
      "value": 10,
      "modifier": "+0"
    },
    "CAR": {
      "value": 4,
      "modifier": "-3"
    }
  },
  "ca": 15,
  "pv": "52 (7d10+14)",
  "speed": "9 m",
  "attacks": [
    "Pinças: +5 acerto, 2d6+3 contundente (agarrar CD 13)",
    "Ferrão: +5 acerto, 1d8+3 perfurante + 4d6 veneno (CD 13 Con reduz metade)"
  ],
  "abilities": [
    "Visão no Escuro (18m)",
    "Armadura Natural: CA 15"
  ],
  "drops": [
    {
      "item": "Essência de Escorpião Gigante (Rank 3)",
      "chance": "15%",
      "effect": "+2 Força, +1 Constituição. Passiva: Visão no Escuro. Ativa: Ferrão Venenoso (4d6)."
    },
    {
      "item": "Ferrão Venenoso",
      "chance": "25%",
      "effect": "Arma +1, +1d6 veneno."
    },
    {
      "item": "Pinça Gigante",
      "chance": "30%",
      "effect": "Material para manopla +1."
    },
    {
      "item": "Moedas (5d8 po)",
      "chance": "100%",
      "effect": "Tesouro."
    }
  ],
  "description": "Um(a) escorpião gigante gigante e perigoso(a), encontrado(a) em florestas densas, cavernas ou ruínas."
},
  {
  "id": "larva-monstruosa",
  "name": "Larva Monstruosa",
  "nd": "ND 2",
  "rank": "C",
  "type": "Inseto/Aracnídeo",
  "attributes": {
    "FOR": {
      "value": 16,
      "modifier": "+3"
    },
    "DES": {
      "value": 8,
      "modifier": "-1"
    },
    "CON": {
      "value": 14,
      "modifier": "+2"
    },
    "INT": {
      "value": 2,
      "modifier": "-4"
    },
    "SAB": {
      "value": 8,
      "modifier": "-1"
    },
    "CAR": {
      "value": 4,
      "modifier": "-3"
    }
  },
  "ca": 12,
  "pv": "45 (6d10+12)",
  "speed": "6 m",
  "attacks": [
    "Mordida: +5 acerto, 2d6+3 perfurante",
    "Engolir: alvo agarrado sofre 2d6 ácido por rodada (CD 13 para escapar)"
  ],
  "abilities": [
    "Regeneração: recupera 5 PV por turno se tiver pelo menos 1 PV (para com fogo)"
  ],
  "drops": [
    {
      "item": "Essência de Larva Monstruosa (Rank 4)",
      "chance": "20%",
      "effect": "+1 Força, +1 Con. Passiva: Regeneração (recupera 2 PV/turno). Ativa: Engolir."
    },
    {
      "item": "Seda Bruta",
      "chance": "40%",
      "effect": "Material para corda."
    },
    {
      "item": "Glândula de Ácido",
      "chance": "25%",
      "effect": "Causa 2d6 ácido."
    },
    {
      "item": "Moedas (3d10 po)",
      "chance": "80%",
      "effect": "Tesouro."
    }
  ],
  "description": "Um(a) larva monstruosa gigante e perigoso(a), encontrado(a) em florestas densas, cavernas ou ruínas."
},
  {
  "id": "vespa-gigante",
  "name": "Vespa Gigante",
  "nd": "ND 2",
  "rank": "C",
  "type": "Inseto/Aracnídeo",
  "attributes": {
    "FOR": {
      "value": 12,
      "modifier": "+1"
    },
    "DES": {
      "value": 16,
      "modifier": "+3"
    },
    "CON": {
      "value": 12,
      "modifier": "+1"
    },
    "INT": {
      "value": 3,
      "modifier": "-4"
    },
    "SAB": {
      "value": 10,
      "modifier": "+0"
    },
    "CAR": {
      "value": 6,
      "modifier": "-2"
    }
  },
  "ca": 14,
  "pv": "32 (5d8+10)",
  "speed": "6 m (voo 15 m)",
  "attacks": [
    "Ferrão: +5 acerto, 1d8+3 perfurante + 3d6 veneno (CD 12 Con reduz metade)"
  ],
  "abilities": [
    "Voo Rápido: pode usar ação bônus para Desengajar",
    "Feromônios de Alarme: ao ferir, chama outras vespas (se houver)"
  ],
  "drops": [
    {
      "item": "Essência de Vespa Gigante (Rank 4)",
      "chance": "20%",
      "effect": "+1 Destreza, +1 Con. Passiva: Voo Rápido. Ativa: Ferrão (aplica 3d6 veneno)."
    },
    {
      "item": "Ferrão de Vespa",
      "chance": "30%",
      "effect": "Material para dardo +1."
    },
    {
      "item": "Asas de Vespa",
      "chance": "25%",
      "effect": "Material para item de voo."
    },
    {
      "item": "Moedas (3d8 po)",
      "chance": "80%",
      "effect": "Moedas."
    }
  ],
  "description": "Um(a) vespa gigante gigante e perigoso(a), encontrado(a) em florestas densas, cavernas ou ruínas."
},
  {
  "id": "aranha-cacadora",
  "name": "Aranha Caçadora",
  "nd": "ND 4",
  "rank": "A",
  "type": "Inseto/Aracnídeo",
  "attributes": {
    "FOR": {
      "value": 16,
      "modifier": "+3"
    },
    "DES": {
      "value": 20,
      "modifier": "+5"
    },
    "CON": {
      "value": 14,
      "modifier": "+2"
    },
    "INT": {
      "value": 6,
      "modifier": "-2"
    },
    "SAB": {
      "value": 14,
      "modifier": "+2"
    },
    "CAR": {
      "value": 6,
      "modifier": "-2"
    }
  },
  "ca": 16,
  "pv": "65 (10d8+20)",
  "speed": "12 m (escalada 12 m)",
  "attacks": [
    "Mordida: +8 acerto, 2d6+5 perfurante + 4d6 veneno (CD 14 Con reduz metade)",
    "Teia de Caça: +8 acerto, alcance 12m, restringe (CD 14 Força)"
  ],
  "abilities": [
    "Emboscada Letal: +2d6 dano se atacar com vantagem",
    "Passos Silenciosos: vantagem em Furtividade"
  ],
  "drops": [
    {
      "item": "Essência de Aranha Caçadora (Rank 2)",
      "chance": "12%",
      "effect": "+2 Destreza. Passiva: Emboscada Letal. Ativa: Teia de Caça."
    },
    {
      "item": "Veneno Letal",
      "chance": "20%",
      "effect": "Aplica 4d6 veneno (2 usos)."
    },
    {
      "item": "Seda de Aranha Mágica",
      "chance": "25%",
      "effect": "Material para corda +2."
    },
    {
      "item": "Moedas (8d10 po)",
      "chance": "100%",
      "effect": "Tesouro."
    }
  ],
  "description": "Um(a) aranha caçadora gigante e perigoso(a), encontrado(a) em florestas densas, cavernas ou ruínas."
},
  {
  "id": "formiga-rainha",
  "name": "Formiga Rainha",
  "nd": "ND 5",
  "rank": "A",
  "type": "Inseto/Aracnídeo",
  "attributes": {
    "FOR": {
      "value": 14,
      "modifier": "+2"
    },
    "DES": {
      "value": 8,
      "modifier": "-1"
    },
    "CON": {
      "value": 18,
      "modifier": "+4"
    },
    "INT": {
      "value": 12,
      "modifier": "+1"
    },
    "SAB": {
      "value": 14,
      "modifier": "+2"
    },
    "CAR": {
      "value": 14,
      "modifier": "+2"
    }
  },
  "ca": 14,
  "pv": "85 (10d8+40)",
  "speed": "6 m",
  "attacks": [
    "Mordida: +6 acerto, 2d6+3 cortante",
    "Feromônios Controladores: ação bônus, aliados em 18m ganham +1d6 dano e vantagem em ataques"
  ],
  "abilities": [
    "Gerar Feromônios: pode criar até 2 Formigas Soldado por descanso longo (como ação de 1 minuto)",
    "Liderança: aliados em 9m têm +1 em salvaguardas"
  ],
  "drops": [
    {
      "item": "Essência de Formiga Rainha (Rank 2)",
      "chance": "10%",
      "effect": "+2 Carisma, +2 Con. Passiva: Liderança. Ativa: Gerar Feromônios (invoca 2 formigas soldado 1x/descanso longo)."
    },
    {
      "item": "Glândula Real",
      "chance": "15%",
      "effect": "Consumível: convoca 1 formiga soldado."
    },
    {
      "item": "Carapaça da Rainha",
      "chance": "25%",
      "effect": "Material para armadura +1."
    },
    {
      "item": "Moedas (12d10 po)",
      "chance": "100%",
      "effect": "Tesouro real."
    }
  ],
  "description": "Um(a) formiga rainha gigante e perigoso(a), encontrado(a) em florestas densas, cavernas ou ruínas."
},
  {
  "id": "besouro-bombardeiro",
  "name": "Besouro Bombardeiro",
  "nd": "ND 4",
  "rank": "A",
  "type": "Inseto/Aracnídeo",
  "attributes": {
    "FOR": {
      "value": 18,
      "modifier": "+4"
    },
    "DES": {
      "value": 10,
      "modifier": "+0"
    },
    "CON": {
      "value": 16,
      "modifier": "+3"
    },
    "INT": {
      "value": 2,
      "modifier": "-4"
    },
    "SAB": {
      "value": 10,
      "modifier": "+0"
    },
    "CAR": {
      "value": 4,
      "modifier": "-3"
    }
  },
  "ca": 17,
  "pv": "68 (8d10+24)",
  "speed": "9 m",
  "attacks": [
    "Mordida: +7 acerto, 2d6+4 cortante",
    "Bombardeio: ação, cone 6m, 5d6 fogo, CD 14 Destreza reduz metade (1x/descanso curto)"
  ],
  "abilities": [
    "Carapaça Reforçada: resistência a dano cortante e perfurante",
    "Explosão Fétida: ao morrer, causa 2d6 fogo em área"
  ],
  "drops": [
    {
      "item": "Essência de Besouro Bombardeiro (Rank 2)",
      "chance": "12%",
      "effect": "+2 Força, +1 Con. Passiva: Carapaça Reforçada. Ativa: Bombardeio."
    },
    {
      "item": "Glândula Explosiva",
      "chance": "20%",
      "effect": "Granada que causa 4d6 fogo."
    },
    {
      "item": "Carapaça de Besouro",
      "chance": "30%",
      "effect": "Material para armadura +2."
    },
    {
      "item": "Moedas (8d10 po)",
      "chance": "100%",
      "effect": "Tesouro."
    }
  ],
  "description": "Um(a) besouro bombardeiro gigante e perigoso(a), encontrado(a) em florestas densas, cavernas ou ruínas."
},
  {
  "id": "enxame-de-pragas",
  "name": "Enxame de Pragas",
  "nd": "ND 4",
  "rank": "A",
  "type": "Inseto/Aracnídeo",
  "attributes": {
    "FOR": {
      "value": 3,
      "modifier": "-4"
    },
    "DES": {
      "value": 18,
      "modifier": "+4"
    },
    "CON": {
      "value": 14,
      "modifier": "+2"
    },
    "INT": {
      "value": 2,
      "modifier": "-4"
    },
    "SAB": {
      "value": 12,
      "modifier": "+1"
    },
    "CAR": {
      "value": 4,
      "modifier": "-3"
    }
  },
  "ca": 14,
  "pv": "72 (9d8+36)",
  "speed": "9 m (voo 12 m)",
  "attacks": [
    "Picadas: +7 acerto, 3d6+4 perfurante + 2d6 veneno (CD 13 Con reduz metade)"
  ],
  "abilities": [
    "Enxame Devorador: ignora resistência a dano físico",
    "Praga: criaturas que começam turno no enxame devem fazer CD 13 Con ou ficar envenenadas"
  ],
  "drops": [
    {
      "item": "Essência de Enxame de Pragas (Rank 2)",
      "chance": "10%",
      "effect": "+2 Destreza. Passiva: Enxame Devorador. Ativa: Praga (1x/descanso curto)."
    },
    {
      "item": "Veneno Concentrado",
      "chance": "20%",
      "effect": "Aplica 2d6 veneno por 1 minuto."
    },
    {
      "item": "Moedas (6d10 po)",
      "chance": "80%",
      "effect": "Tesouro."
    }
  ],
  "description": "Um(a) enxame de pragas gigante e perigoso(a), encontrado(a) em florestas densas, cavernas ou ruínas."
},
  {
  "id": "escorpiao-imperial",
  "name": "Escorpião Imperial",
  "nd": "ND 5",
  "rank": "S",
  "type": "Inseto/Aracnídeo",
  "attributes": {
    "FOR": {
      "value": 20,
      "modifier": "+5"
    },
    "DES": {
      "value": 12,
      "modifier": "+1"
    },
    "CON": {
      "value": 18,
      "modifier": "+4"
    },
    "INT": {
      "value": 4,
      "modifier": "-3"
    },
    "SAB": {
      "value": 12,
      "modifier": "+1"
    },
    "CAR": {
      "value": 6,
      "modifier": "-2"
    }
  },
  "ca": 18,
  "pv": "95 (10d10+40)",
  "speed": "9 m",
  "attacks": [
    "Pinças Gigantes: +8 acerto, 2d8+5 contundente (agarrar CD 15)",
    "Ferrão: +8 acerto, 1d10+5 perfurante + 5d6 veneno (CD 15 Con reduz metade)"
  ],
  "abilities": [
    "Cauda Ameaçadora: pode atacar com ferrão como ação bônus",
    "Armadura Natural: CA 18"
  ],
  "drops": [
    {
      "item": "Essência de Escorpião Imperial (Rank 1)",
      "chance": "8%",
      "effect": "+2 Força, +2 Con. Passiva: Armadura Natural. Ativa: Ferrão Aprimorado."
    },
    {
      "item": "Ferrão Imperial",
      "chance": "15%",
      "effect": "Arma +2, +1d6 veneno."
    },
    {
      "item": "Carapaça Imperial",
      "chance": "20%",
      "effect": "Material para armadura +2."
    },
    {
      "item": "Moedas (15d10 po)",
      "chance": "100%",
      "effect": "Tesouro."
    }
  ],
  "description": "Um(a) escorpião imperial gigante e perigoso(a), encontrado(a) em florestas densas, cavernas ou ruínas."
},
  {
  "id": "aranha-ancia",
  "name": "Aranha Anciã",
  "nd": "ND 8",
  "rank": "S",
  "type": "Inseto/Aracnídeo",
  "attributes": {
    "FOR": {
      "value": 18,
      "modifier": "+4"
    },
    "DES": {
      "value": 22,
      "modifier": "+6"
    },
    "CON": {
      "value": 18,
      "modifier": "+4"
    },
    "INT": {
      "value": 12,
      "modifier": "+1"
    },
    "SAB": {
      "value": 16,
      "modifier": "+3"
    },
    "CAR": {
      "value": 10,
      "modifier": "+0"
    }
  },
  "ca": 18,
  "pv": "130 (12d10+60)",
  "speed": "12 m (escalada 12 m)",
  "attacks": [
    "Mordida: +10 acerto, 2d8+6 perfurante + 6d6 veneno (CD 16 Con reduz metade)",
    "Teia de Seda Encantada: +10 acerto, alcance 15m, restringe (CD 16 Força)"
  ],
  "abilities": [
    "Teia Invisível: pode criar teias invisíveis",
    "Aranha da Sombra: ação bônus para teleporte entre teias",
    "Imunidade a Veneno"
  ],
  "drops": [
    {
      "item": "Essência de Aranha Anciã (Rank 1)",
      "chance": "5%",
      "effect": "+2 Destreza, +2 Con. Passiva: Imunidade a Veneno. Ativa: Teia Invisível."
    },
    {
      "item": "Seda Ancestral",
      "chance": "10%",
      "effect": "Material para corda +3."
    },
    {
      "item": "Veneno Ancião",
      "chance": "12%",
      "effect": "Aplica 6d6 veneno (1 uso)."
    },
    {
      "item": "Moedas (20d10 po)",
      "chance": "100%",
      "effect": "Tesouro lendário."
    }
  ],
  "description": "Um(a) aranha anciã gigante e perigoso(a), encontrado(a) em florestas densas, cavernas ou ruínas."
},
  {
  "id": "colmeia-viva",
  "name": "Colmeia Viva",
  "nd": "ND 9",
  "rank": "S",
  "type": "Inseto/Aracnídeo",
  "attributes": {
    "FOR": {
      "value": 10,
      "modifier": "+0"
    },
    "DES": {
      "value": 6,
      "modifier": "-2"
    },
    "CON": {
      "value": 20,
      "modifier": "+5"
    },
    "INT": {
      "value": 8,
      "modifier": "-1"
    },
    "SAB": {
      "value": 14,
      "modifier": "+2"
    },
    "CAR": {
      "value": 12,
      "modifier": "+1"
    }
  },
  "ca": 16,
  "pv": "150 (12d12+72)",
  "speed": "0 m (imóvel)",
  "attacks": [
    "Enxame Guardião: 3 ataques por rodada, +8 acerto, 2d8+4 perfurante + 2d6 veneno",
    "Feromônios de Controle: ação bônus, até 5 criaturas em 18m devem fazer CD 15 Sab ou ficar enfeitiçadas"
  ],
  "abilities": [
    "Regeneração Colmeia: recupera 10 PV por turno",
    "Rainha Central: se reduzida a 0 PV, a colmeia entra em colapso e todas as criaturas enfeitiçadas são libertadas"
  ],
  "drops": [
    {
      "item": "Essência de Colmeia Viva (Rank 1)",
      "chance": "5%",
      "effect": "+2 Con, +2 Sabedoria. Passiva: Regeneração. Ativa: Feromônios de Controle."
    },
    {
      "item": "Mel da Colmeia",
      "chance": "15%",
      "effect": "Cura 5d8+10 PV."
    },
    {
      "item": "Favo Ancestral",
      "chance": "20%",
      "effect": "Material para item mágico."
    },
    {
      "item": "Moedas (20d10 po)",
      "chance": "100%",
      "effect": "Tesouro lendário."
    }
  ],
  "description": "Um(a) colmeia viva gigante e perigoso(a), encontrado(a) em florestas densas, cavernas ou ruínas."
}
];
// === Componente Card (inlined) ===
export interface ThemeColors {
  bg: string;
  border: string;
  text: string;
  accent: string;
  subtle: string;
  headerText: string;
  texture?: string;
}

const CARD_THEMES: Record<CardTheme, ThemeColors> = {
  default: {
    bg: '#e4d5b7',
    border: '#3d2b1f',
    text: '#2c1e14',
    accent: '#8b6d4d',
    subtle: '#d4c3a3',
    headerText: '#4a321f',
    texture: 'https://www.transparenttextures.com/patterns/old-map.png'
  },
  black: {
    bg: '#1a1a1a',
    border: '#000000',
    text: '#e0e0e0',
    accent: '#4a4a4a',
    subtle: '#2a2a2a',
    headerText: '#ffffff',
    texture: 'https://www.transparenttextures.com/patterns/carbon-fibre.png'
  },
  red: {
    bg: '#4a0e0e',
    border: '#2a0505',
    text: '#f2dada',
    accent: '#8b1a1a',
    subtle: '#5a1515',
    headerText: '#ff4d4d',
    texture: 'https://www.transparenttextures.com/patterns/asfalt-dark.png'
  },
  gold: {
    bg: '#d4af37',
    border: '#8b6d05',
    text: '#2c1e14',
    accent: '#b8860b',
    subtle: '#e5c158',
    headerText: '#4a321f',
    texture: 'https://www.transparenttextures.com/patterns/gold-dust.png'
  },
  white: {
    bg: '#f5f5f5',
    border: '#d1d1d1',
    text: '#1a1a1a',
    accent: '#9e9e9e',
    subtle: '#e0e0e0',
    headerText: '#000000'
  },
  green: {
    bg: '#1b3022',
    border: '#0d1a12',
    text: '#d9e6dd',
    accent: '#2d5a3f',
    subtle: '#24402d',
    headerText: '#4ade80',
    texture: 'https://www.transparenttextures.com/patterns/dark-leather.png'
  },
  blue: {
    bg: '#0f172a',
    border: '#020617',
    text: '#e2e8f0',
    accent: '#1e293b',
    subtle: '#1e293b',
    headerText: '#38bdf8',
    texture: 'https://www.transparenttextures.com/patterns/dark-matter.png'
  },
  purple: {
    bg: '#2e1065',
    border: '#1e1b4b',
    text: '#f5f3ff',
    accent: '#4c1d95',
    subtle: '#4338ca',
    headerText: '#a78bfa',
    texture: 'https://www.transparenttextures.com/patterns/dark-matter.png'
  }
};

interface CardProps {
  monster: MonsterData;
  imageUrl?: string;
  isGenerating?: boolean;
  imageSettings?: { scale: number; x: number; y: number };
}

const Card: React.FC<CardProps> = ({ monster, imageUrl, isGenerating, imageSettings }) => {
  const theme = CARD_THEMES[monster.theme || 'default'];

  return (
    <div 
      id={`card-${monster.id}`}
      className="relative w-[1000px] min-h-[1100px] p-12 pb-24 shadow-2xl border-[16px] rounded-sm font-serif"
      style={{
        backgroundColor: theme.bg,
        borderColor: theme.border,
        color: theme.text,
        backgroundImage: theme.texture ? `url('${theme.texture}')` : 'none',
        backgroundRepeat: 'repeat',
        boxShadow: 'inset 0 0 100px rgba(0,0,0,0.2), 0 20px 50px rgba(0,0,0,0.5)'
      }}
    >
      {/* Ornate Border Overlay */}
      <div className="absolute inset-0 border-[2px] m-2 pointer-events-none opacity-40" style={{ borderColor: theme.accent }}></div>
      <div className="absolute inset-0 border-[1px] m-4 pointer-events-none opacity-20" style={{ borderColor: theme.accent }}></div>

      {/* Header */}
      <div className="relative z-10 text-center mb-6">
        <h1 className="text-5xl font-bold uppercase tracking-widest drop-shadow-sm" style={{ fontFamily: "'Cinzel', serif", color: theme.headerText }}>
          {monster.name}
        </h1>
        <div className="mt-2 flex justify-center items-center gap-4">
          <div className="h-[1px] w-20" style={{ backgroundColor: theme.accent }}></div>
          <div className="px-4 py-1 rounded-full text-xl font-bold border-2" style={{ backgroundColor: theme.border, color: theme.bg, borderColor: theme.accent }}>
            {monster.nd}
          </div>
          <div className="h-[1px] w-20" style={{ backgroundColor: theme.accent }}></div>
        </div>
      </div>

      {/* Central Image */}
      <div className="relative z-10 w-full h-[450px] mb-8 border-4 overflow-hidden shadow-inner flex items-center justify-center" style={{ borderColor: theme.border, backgroundColor: monster.imageBgColor || '#000000' }}>
        {imageUrl ? (
          <img 
            src={imageUrl} 
            alt={monster.name} 
            className="w-full h-full"
            crossOrigin="anonymous"
            style={{
              objectFit: 'contain',
              objectPosition: `${imageSettings?.x ?? 50}% ${imageSettings?.y ?? 50}%`,
              transform: `scale(${imageSettings?.scale ?? 1})`,
              mixBlendMode: (monster.theme === 'default' || monster.theme === 'white' || monster.theme === 'gold') ? 'screen' : 'normal'
            }}
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="flex flex-col items-center gap-4" style={{ color: theme.accent }}>
            {isGenerating ? (
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-t-transparent" style={{ borderColor: theme.accent }}></div>
            ) : (
              <Skull size={64} className="opacity-20" />
            )}
            <p className="italic text-sm">Ilustração em pergaminho...</p>
          </div>
        )}
        {/* Decorative corners for image */}
        <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4" style={{ borderColor: theme.accent }}></div>
        <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4" style={{ borderColor: theme.accent }}></div>
        <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4" style={{ borderColor: theme.accent }}></div>
        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4" style={{ borderColor: theme.accent }}></div>
      </div>

      {/* Stats Row */}
      <div className="relative z-10 grid grid-cols-[1.5fr_1fr] gap-8 mb-6">
        {/* Attributes & Proficiencies/Skills */}
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-6 gap-2 p-4 rounded border" style={{ backgroundColor: `${theme.subtle}80`, borderColor: `${theme.accent}4d` }}>
            {(Object.entries(monster.attributes) as [string, { value: number; modifier: string }][]).map(([key, attr]) => (
              <div key={key} className="text-center border-r last:border-0" style={{ borderColor: `${theme.accent}33` }}>
                <div className="text-[11px] font-bold uppercase" style={{ color: theme.accent }}>{key}</div>
                <div className="text-2xl font-bold">{attr.value}</div>
                <div className="text-sm opacity-80">({attr.modifier})</div>
              </div>
            ))}
          </div>

          {(monster.proficiencies?.length || monster.skills?.length) ? (
            <div className="grid grid-cols-2 gap-4 text-[13px]">
              {monster.proficiencies && monster.proficiencies.length > 0 && (
                <div className="p-2 rounded border" style={{ backgroundColor: `${theme.subtle}40`, borderColor: `${theme.accent}33` }}>
                  <span className="font-bold uppercase text-[10px] block mb-1" style={{ color: theme.accent }}>Proficiências</span>
                  <div className="italic leading-tight">{monster.proficiencies.join(', ')}</div>
                </div>
              )}
              {monster.skills && monster.skills.length > 0 && (
                <div className="p-2 rounded border" style={{ backgroundColor: `${theme.subtle}40`, borderColor: `${theme.accent}33` }}>
                  <span className="font-bold uppercase text-[10px] block mb-1" style={{ color: theme.accent }}>Perícias</span>
                  <div className="italic leading-tight">{monster.skills.join(', ')}</div>
                </div>
              )}
            </div>
          ) : null}
        </div>

        {/* Combat Info */}
        <div className="flex flex-col justify-center gap-3 p-4 rounded border" style={{ backgroundColor: `${theme.border}0d`, borderColor: `${theme.accent}4d` }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-base font-bold uppercase">
              <Shield size={20} style={{ color: theme.accent }} /> CA
            </div>
            <div className="text-2xl font-bold">{monster.ca}</div>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-base font-bold uppercase">
              <Heart size={20} style={{ color: theme.accent }} /> PV
            </div>
            <div className="text-2xl font-bold">{monster.pv}</div>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-base font-bold uppercase">
              <Move size={20} style={{ color: theme.accent }} /> Desloc.
            </div>
            <div className="text-base font-bold">{monster.speed}</div>
          </div>
        </div>
      </div>

      {/* Content Grid */}
      <div className="relative z-10 grid grid-cols-2 gap-8 mb-8">
        {/* Left Column: Abilities */}
        <div className="space-y-6">
          <div>
            <h3 className="flex items-center gap-2 text-lg font-bold border-b-2 mb-2" style={{ borderColor: theme.accent, color: theme.headerText }}>
              <Sword size={20} /> Ataques
            </h3>
            <ul className="text-[15px] space-y-1.5 italic">
              {monster.attacks.map((atk, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="mt-2 w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: theme.accent }}></span>
                  {typeof atk === 'string' ? atk : JSON.stringify(atk)}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="flex items-center gap-2 text-lg font-bold border-b-2 mb-2" style={{ borderColor: theme.accent, color: theme.headerText }}>
              <Zap size={20} /> Habilidades Especiais
            </h3>
            <ul className="text-[15px] space-y-1.5 italic">
              {monster.abilities.map((abil, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="mt-2 w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: theme.accent }}></span>
                  {typeof abil === 'string' ? abil : JSON.stringify(abil)}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Right Column: Essence & Drops */}
        <div className="space-y-6">
          {/* Essence Section */}
          {monster.essence && (
            <div className="p-4 border-2 rounded-lg shadow-inner" style={{ backgroundColor: `${theme.border}1a`, borderColor: theme.accent }}>
              <h3 className="flex items-center gap-2 text-lg font-bold mb-2" style={{ color: theme.headerText }}>
                <Sparkles size={22} style={{ color: theme.accent }} /> Essência
              </h3>
              <div className="text-[14px] italic whitespace-pre-wrap leading-relaxed">
                {monster.essence}
              </div>
            </div>
          )}

          {/* Drops */}
          <div>
            <h3 className="flex items-center gap-2 text-lg font-bold border-b-2 mb-2" style={{ borderColor: theme.accent, color: theme.headerText }}>
              <Skull size={20} /> Drops & Recompensas
            </h3>
            <div className="w-full text-[13px] border rounded overflow-hidden" style={{ borderColor: `${theme.accent}4d` }}>
              <div className="grid grid-cols-[1fr_60px_1.5fr] p-2 font-bold" style={{ backgroundColor: theme.border, color: theme.bg }}>
                <div>Item</div>
                <div className="text-center">%</div>
                <div>Efeito</div>
              </div>
              {monster.drops.map((drop, i) => (
                <div key={i} className={`grid grid-cols-[1fr_60px_1.5fr] p-2 border-t ${i % 2 === 0 ? 'bg-transparent' : ''}`} style={{ borderColor: `${theme.accent}33`, backgroundColor: i % 2 !== 0 ? `${theme.border}0d` : 'transparent' }}>
                  <div className="font-bold">{drop.item}</div>
                  <div className="text-center">{drop.chance}</div>
                  <div className="italic text-[11px] leading-tight">{drop.effect}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Footer Texture */}
      <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t to-transparent pointer-events-none" style={{ backgroundImage: `linear-gradient(to top, ${theme.border}1a, transparent)` }}></div>
    </div>
  );
};


// === Aplicacao ===
type ImageSettings = { scale: number; x: number; y: number };

const App: React.FC = () => {
  const [currentMonsterIndex, setCurrentMonsterIndex] = useState(0);
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [customMonster, setCustomMonster] = useState<MonsterData>({
    id: 'custom-monster',
    name: 'Novo Monstro',
    nd: 'ND 1',
    rank: 'E',
    type: 'Desconhecido',
    attributes: {
      FOR: { value: 10, modifier: '+0' },
      DES: { value: 10, modifier: '+0' },
      CON: { value: 10, modifier: '+0' },
      INT: { value: 10, modifier: '+0' },
      SAB: { value: 10, modifier: '+0' },
      CAR: { value: 10, modifier: '+0' },
    },
    ca: 10,
    pv: '10 (2d8+2)',
    speed: '9 m',
    attacks: ['Ataque Básico: +2 acerto, 1d6 dano'],
    abilities: ['Habilidade Especial'],
    drops: [{ item: 'Item Comum', chance: '50%', effect: 'Nenhum' }],
    description: 'Uma criatura misteriosa.',
    essence: '',
    imageBgColor: '#000000'
  });
  const [monsterImages, setMonsterImages] = useState<Record<string, string>>({});
  const [showImportModal, setShowImportModal] = useState(false);
  const [importText, setImportText] = useState('');
  const [imageSettings, setImageSettings] = useState<Record<string, ImageSettings>>({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [status, setStatus] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

  const generateMonsterImage = async (monster: MonsterData, retryCount = 0): Promise<string | null> => {
    try {
      setStatus(`Gerando ilustração para ${monster.name}... ${retryCount > 0 ? `(Tentativa ${retryCount + 1})` : ''}`);
      const prompt = `A tiny, zoomed-out, full-body illustration of a ${monster.name} placed perfectly in the center of the canvas. The creature must be small compared to the canvas size, leaving huge empty margins on all sides (top, bottom, left, right). Do not crop any part of the creature. Fantasy style, bestiary art, detailed textures, professional digital painting, isolated on a pure solid black background, medieval fantasy aesthetic. ${monster.description}`;
      
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [{ text: prompt }],
        },
        config: {
          imageConfig: {
            aspectRatio: "1:1",
          },
        },
      });

      let imageUrl = '';
      for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
          imageUrl = `data:image/png;base64,${part.inlineData.data}`;
          break;
        }
      }

      if (imageUrl) {
        setMonsterImages(prev => ({ ...prev, [monster.id]: imageUrl }));
        setError(null);
        return imageUrl; // Success
      }
      throw new Error("Não foi possível gerar a imagem.");
    } catch (err: any) {
      console.error('Gemini Error:', err);
      
      // Robust rate limit detection
      const errStr = err?.message || err?.toString() || JSON.stringify(err);
      const isRateLimit = 
        errStr.includes('429') || 
        errStr.includes('RESOURCE_EXHAUSTED') ||
        err?.status === 'RESOURCE_EXHAUSTED' ||
        err?.error?.code === 429 ||
        err?.code === 429 ||
        err?.error?.status === 'RESOURCE_EXHAUSTED';
      
      if (isRateLimit && retryCount < 5) {
        const waitTime = (retryCount + 1) * 35000; // 35s, 70s, 105s, 140s, 175s
        setStatus(`Limite de cota atingido. Aguardando ${waitTime/1000}s para tentar novamente...`);
        
        for (let s = Math.floor(waitTime/1000); s > 0; s--) {
          await new Promise(resolve => setTimeout(resolve, 1000));
          setStatus(`Limite de cota atingido. Retentando em ${s}s... (${retryCount + 1}/5)`);
        }
        
        return generateMonsterImage(monster, retryCount + 1);
      }

      const errorMessage = err?.message || (err?.error?.message) || String(err);
      setError(`Erro ao gerar imagem para ${monster.name}: ${errorMessage}`);
      return null;
    }
  };

  const saveCardToProject = async (monster: MonsterData, imageUrl: string) => {
    try {
      setStatus(`Salvando carta de ${monster.name}...`);
      
      // Wait a bit for the image to render in the DOM
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const cardElement = document.getElementById(`card-${monster.id}`);
      if (!cardElement) throw new Error("Elemento da carta não encontrado.");

      const dataUrl = await toPng(cardElement, { 
        quality: 0.95,
        pixelRatio: 3, // Increased for 2K+ resolution (1000px * 3 = 3000px)
      });

      const response = await fetch('/api/save-card', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: monster.name,
          imageData: dataUrl
        }),
      });

      if (!response.ok) throw new Error("Falha ao salvar no servidor.");
      
      setStatus(`Carta de ${monster.name} salva com sucesso!`);
      setTimeout(() => setStatus(''), 3000);
      return true;
    } catch (err) {
      console.error(err);
      setError(`Erro ao salvar ${monster.name}: ${err instanceof Error ? err.message : String(err)}`);
      setStatus('');
      return false;
    }
  };

  const generateCurrent = async () => {
    setIsGenerating(true);
    setError(null);
    const monster = isCustomMode ? customMonster : monsters[currentMonsterIndex];
    await generateMonsterImage(monster);
    setIsGenerating(false);
  };

  const saveCurrent = async () => {
    const monster = isCustomMode ? customMonster : monsters[currentMonsterIndex];
    const imageUrl = monsterImages[monster.id];
    if (!imageUrl) {
      setError("Gere a imagem primeiro!");
      return;
    }
    setIsGenerating(true);
    await saveCardToProject(monster, imageUrl);
    setIsGenerating(false);
  };

  const downloadCard = async () => {
    const monster = isCustomMode ? customMonster : monsters[currentMonsterIndex];
    const cardElement = document.getElementById(`card-${monster.id}`);
    if (!cardElement) return;

    try {
      setIsGenerating(true);
      
      // Ensure all images in the card are loaded
      const images = cardElement.getElementsByTagName('img');
      const loadPromises = Array.from(images).map(img => {
        if (img.complete) return Promise.resolve();
        return new Promise(resolve => {
          img.onload = resolve;
          img.onerror = resolve;
        });
      });
      
      await Promise.all(loadPromises);
      // Extra delay for rendering
      await new Promise(resolve => setTimeout(resolve, 200));

      const dataUrl = await toPng(cardElement, { 
        quality: 0.95, 
        pixelRatio: 3,
        cacheBust: true,
        skipFonts: false // We need fonts for the card
      });
      
      const link = document.createElement('a');
      link.download = `${monster.name.replace(/\s+/g, "_")}.png`;
      link.href = dataUrl;
      link.click();
      setIsGenerating(false);
    } catch (err) {
      console.error(err);
      setError("Erro ao baixar a carta.");
      setIsGenerating(false);
    }
  };

  const downloadIllustration = () => {
    const monster = isCustomMode ? customMonster : monsters[currentMonsterIndex];
    const imageUrl = monsterImages[monster.id];
    if (!imageUrl) {
      setError("Gere ou importe uma imagem primeiro!");
      return;
    }
    
    const link = document.createElement('a');
    link.download = `${monster.name.replace(/\s+/g, "_")}_ilustracao.png`;
    link.href = imageUrl;
    link.click();
  };

  const currentMonster = isCustomMode ? customMonster : monsters[currentMonsterIndex];
  const currentSettings = imageSettings[currentMonster.id] || { scale: 1, x: 50, y: 50 };

  const updateSettings = (newSettings: Partial<ImageSettings>) => {
    setImageSettings(prev => ({
      ...prev,
      [currentMonster.id]: { ...currentSettings, ...newSettings }
    }));
  };

  const handleImportJson = () => {
    try {
      const data = JSON.parse(importText);
      
      const calculateMod = (val: number) => {
        const mod = Math.floor((val - 10) / 2);
        return mod >= 0 ? `+${mod}` : `${mod}`;
      };

      const mapped: MonsterData = {
        id: data.id || `custom-${Date.now()}`,
        name: data.name || 'Importado',
        nd: data.nd ? (data.nd.toString().startsWith('ND') ? data.nd : `ND ${data.nd}`) : 'ND 1',
        rank: data.rank || 'E',
        type: data.race || data.class || 'Desconhecido',
        attributes: {
          FOR: { value: data.attributes?.str || 10, modifier: calculateMod(data.attributes?.str || 10) },
          DES: { value: data.attributes?.dex || 10, modifier: calculateMod(data.attributes?.dex || 10) },
          CON: { value: data.attributes?.con || 10, modifier: calculateMod(data.attributes?.con || 10) },
          INT: { value: data.attributes?.int || 10, modifier: calculateMod(data.attributes?.int || 10) },
          SAB: { value: data.attributes?.wis || 10, modifier: calculateMod(data.attributes?.wis || 10) },
          CAR: { value: data.attributes?.cha || 10, modifier: calculateMod(data.attributes?.cha || 10) },
        },
        ca: data.ac || 10,
        pv: data.hp?.max ? `${data.hp.max}` : (data.pv || '10'),
        speed: data.speed || '9 m',
        attacks: Array.isArray(data.attacks) ? data.attacks.map((atk: any) => {
          if (typeof atk === 'string') return atk;
          if (typeof atk === 'object' && atk !== null) {
            return `${atk.name || 'Ataque'}: ${atk.bonus || ''} acerto, ${atk.damage || ''} ${atk.type || ''}`.trim();
          }
          return String(atk);
        }) : [],
        abilities: data.bio?.features ? data.bio.features.split('\n').filter(Boolean) : (Array.isArray(data.abilities) ? data.abilities.map((a: any) => typeof a === 'string' ? a : JSON.stringify(a)) : []),
        drops: Array.isArray(data.drops) ? data.drops : [],
        description: data.bio?.backstory || data.description || '',
        essence: '',
        proficiencies: Array.isArray(data.proficiencies) ? data.proficiencies : (data.proficiencies ? [data.proficiencies] : []),
        skills: Array.isArray(data.skills) ? data.skills : (data.skills ? [data.skills] : []),
        theme: data.theme || 'default',
        imageBgColor: data.imageBgColor || ''
      };

      // Parse inventory if it's a string (like in the example)
      if (typeof data.inventory === 'string') {
        const lines = data.inventory.split('\n');
        let inDrops = false;
        let essenceLines: string[] = [];
        
        lines.forEach((line: string) => {
          const trimmed = line.trim();
          
          // Detect Essence (starts with ✨ or contains "Essência")
          if (trimmed.includes('✨') || trimmed.toLowerCase().includes('essência')) {
            essenceLines.push(trimmed);
            return;
          }
          
          // If we already started collecting essence and the line is not a drop/attack, keep collecting
          if (essenceLines.length > 0 && !trimmed.includes('💀') && !trimmed.startsWith('-') && !inDrops && trimmed !== '') {
            essenceLines.push(trimmed);
            return;
          }

          if (trimmed.includes('💀 Drops:')) {
            inDrops = true;
            return;
          }
          if (trimmed.startsWith('- ') && !inDrops) {
            mapped.attacks.push(trimmed.replace('- ', ''));
          } else if (trimmed.startsWith('- ') && inDrops) {
            const dropParts = trimmed.replace('- ', '').split('(');
            const item = dropParts[0].trim();
            const chance = dropParts[1] ? dropParts[1].replace(')', '').trim() : '100%';
            mapped.drops.push({ item, chance, effect: 'Importado do inventário' });
          }
        });
        
        if (essenceLines.length > 0) {
          mapped.essence = essenceLines.join('\n');
        }
      }
      
      if (data.spells?.known) {
        if (typeof data.spells.known === 'string') {
          const spellLines = data.spells.known.split('\n').filter(Boolean);
          mapped.attacks.push(...spellLines);
        } else {
          mapped.attacks.push(String(data.spells.known));
        }
      }

      if (Array.isArray(data.customWeapons)) {
        data.customWeapons.forEach((w: any) => {
          if (typeof w === 'string') mapped.attacks.push(w);
          else if (typeof w === 'object' && w !== null) {
            mapped.attacks.push(`${w.name || 'Arma'}: ${w.bonus || ''} acerto, ${w.damage || ''} ${w.type || ''}`.trim());
          }
        });
      }

      // Handle image if present in JSON
      const imageUrl = data.image || data.img || data.imageUrl || data.picture;
      if (imageUrl && typeof imageUrl === 'string') {
        setMonsterImages(prev => ({
          ...prev,
          [mapped.id]: imageUrl
        }));
      }

      setCustomMonster(mapped);
      setIsCustomMode(true);
      setShowImportModal(false);
      setImportText('');
      setStatus('Monstro importado com sucesso!');
      setTimeout(() => setStatus(''), 3000);
    } catch (err) {
      setError('Erro ao processar JSON: ' + (err instanceof Error ? err.message : String(err)));
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setImportText(content);
    };
    reader.readAsText(file);
  };

  const THEMES: { id: CardTheme; name: string; color: string }[] = [
    { id: 'default', name: 'Padrão (Pergaminho)', color: '#e4d5b7' },
    { id: 'black', name: 'Sombrio (Preto)', color: '#1a1a1a' },
    { id: 'red', name: 'Sangue (Vermelho)', color: '#4a0e0e' },
    { id: 'gold', name: 'Épico (Dourado)', color: '#d4af37' },
    { id: 'white', name: 'Divino (Branco)', color: '#f5f5f5' },
    { id: 'green', name: 'Veneno (Verde)', color: '#1b3022' },
    { id: 'blue', name: 'Arcano (Azul)', color: '#0f172a' },
    { id: 'purple', name: 'Vazio (Roxo)', color: '#2e1065' },
  ];

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setMonsterImages(prev => ({
        ...prev,
        [currentMonster.id]: content
      }));
      setStatus('Ilustração importada com sucesso!');
      setTimeout(() => setStatus(''), 3000);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="min-h-screen bg-[#1a1a1a] text-[#e4d5b7] p-8 flex flex-col items-center font-sans">
      {/* Header */}
      <div className="max-w-4xl w-full text-center mb-12">
        <h1 className="text-4xl font-bold mb-4 flex items-center justify-center gap-3">
          <Skull className="text-[#8b6d4d]" size={40} />
          Gerador de Bestiário RPG
        </h1>
        <p className="text-[#8b6d4d] italic">
          Gere ilustrações e salve fichas de monstros em estilo pergaminho antigo.
        </p>
      </div>

      {/* Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-12 max-w-6xl w-full">
        {/* Preview Area */}
          <div className="flex flex-col items-center gap-6">
            <div className="transform scale-[0.45] lg:scale-[0.55] origin-top shadow-2xl transition-transform duration-300 min-h-[750px]">
            <Card 
              monster={currentMonster} 
              imageUrl={monsterImages[currentMonster.id]} 
              isGenerating={isGenerating && !monsterImages[currentMonster.id]}
              imageSettings={currentSettings}
            />
          </div>
          
          <div className="flex gap-4">
            <button 
              onClick={() => {
                setIsCustomMode(false);
                setCurrentMonsterIndex(prev => Math.max(0, prev - 1));
              }}
              disabled={isGenerating || (currentMonsterIndex === 0 && !isCustomMode)}
              className="px-6 py-3 bg-[#3d2b1f] hover:bg-[#4d3b2f] rounded border border-[#8b6d4d] disabled:opacity-50 transition-colors font-bold"
            >
              &larr; Monstro Anterior
            </button>
            <button 
              onClick={() => {
                setIsCustomMode(false);
                setCurrentMonsterIndex(prev => Math.min(monsters.length - 1, prev + 1));
              }}
              disabled={isGenerating || (currentMonsterIndex === monsters.length - 1 && !isCustomMode)}
              className="px-6 py-3 bg-[#3d2b1f] hover:bg-[#4d3b2f] rounded border border-[#8b6d4d] disabled:opacity-50 transition-colors font-bold"
            >
              Próximo Monstro &rarr;
            </button>
          </div>
        </div>

        {/* Controls Area */}
        <div className="bg-[#2c1e14] p-6 rounded-lg border-2 border-[#8b6d4d] shadow-xl h-fit flex flex-col gap-6">
              <div className="flex gap-2">
                <button 
                  onClick={() => setIsCustomMode(false)}
                  className={`flex-1 py-2 rounded flex items-center justify-center gap-2 font-bold transition-colors ${!isCustomMode ? 'bg-[#8b6d4d] text-[#2c1e14]' : 'bg-[#3d2b1f] text-[#8b6d4d] hover:bg-[#4d3b2f]'}`}
                >
                  <List size={18} /> Preset
                </button>
                <button 
                  onClick={() => setIsCustomMode(true)}
                  className={`flex-1 py-2 rounded flex items-center justify-center gap-2 font-bold transition-colors ${isCustomMode ? 'bg-[#8b6d4d] text-[#2c1e14]' : 'bg-[#3d2b1f] text-[#8b6d4d] hover:bg-[#4d3b2f]'}`}
                >
                  <Plus size={18} /> Criar Novo
                </button>
              </div>

              {isCustomMode && (
                <div className="space-y-4 p-4 bg-black/20 rounded border border-[#8b6d4d]/30">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-sm font-bold text-[#8b6d4d] uppercase tracking-wider">Dados do Monstro</h3>
                    <button 
                      onClick={() => setShowImportModal(true)}
                      className="text-[10px] bg-[#3d2b1f] hover:bg-[#4d3b2f] text-[#8b6d4d] px-2 py-1 rounded border border-[#8b6d4d]/30 flex items-center gap-1 transition-colors"
                    >
                      <FileJson size={12} /> Importar JSON
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="col-span-2">
                      <label className="text-[10px] uppercase text-[#8b6d4d] block mb-1">Nome</label>
                      <input 
                        type="text" 
                        value={customMonster.name} 
                        onChange={(e) => setCustomMonster({...customMonster, name: e.target.value})}
                        className="w-full bg-[#1a1a1a] border border-[#8b6d4d]/50 rounded px-2 py-1 text-sm text-[#e4d5b7]"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] uppercase text-[#8b6d4d] block mb-1">ND</label>
                      <input 
                        type="text" 
                        value={customMonster.nd} 
                        onChange={(e) => setCustomMonster({...customMonster, nd: e.target.value})}
                        className="w-full bg-[#1a1a1a] border border-[#8b6d4d]/50 rounded px-2 py-1 text-sm text-[#e4d5b7]"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] uppercase text-[#8b6d4d] block mb-1">Tipo</label>
                      <input 
                        type="text" 
                        value={customMonster.type} 
                        onChange={(e) => setCustomMonster({...customMonster, type: e.target.value})}
                        className="w-full bg-[#1a1a1a] border border-[#8b6d4d]/50 rounded px-2 py-1 text-sm text-[#e4d5b7]"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] uppercase text-[#8b6d4d] block mb-1">CA</label>
                      <input 
                        type="number" 
                        value={customMonster.ca} 
                        onChange={(e) => setCustomMonster({...customMonster, ca: parseInt(e.target.value) || 0})}
                        className="w-full bg-[#1a1a1a] border border-[#8b6d4d]/50 rounded px-2 py-1 text-sm text-[#e4d5b7]"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] uppercase text-[#8b6d4d] block mb-1">PV</label>
                      <input 
                        type="text" 
                        value={customMonster.pv} 
                        onChange={(e) => setCustomMonster({...customMonster, pv: e.target.value})}
                        className="w-full bg-[#1a1a1a] border border-[#8b6d4d]/50 rounded px-2 py-1 text-sm text-[#e4d5b7]"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="text-[10px] uppercase text-[#8b6d4d] block mb-1">Descrição (Para a IA)</label>
                      <textarea 
                        value={customMonster.description} 
                        onChange={(e) => setCustomMonster({...customMonster, description: e.target.value})}
                        className="w-full bg-[#1a1a1a] border border-[#8b6d4d]/50 rounded px-2 py-1 text-sm text-[#e4d5b7] h-20 resize-none"
                        placeholder="Descreva a aparência para a ilustração..."
                      />
                    </div>

                    {/* Attributes */}
                    <div className="col-span-2 grid grid-cols-3 gap-2 pt-2 border-t border-[#8b6d4d]/20">
                      {(Object.keys(customMonster.attributes) as Array<keyof typeof customMonster.attributes>).map((attr) => (
                        <div key={attr}>
                          <label className="text-[10px] uppercase text-[#8b6d4d] block mb-1">{attr}</label>
                          <input 
                            type="number" 
                            value={customMonster.attributes[attr].value} 
                            onChange={(e) => {
                              const val = parseInt(e.target.value) || 0;
                              const mod = Math.floor((val - 10) / 2);
                              const modStr = mod >= 0 ? `+${mod}` : `${mod}`;
                              setCustomMonster({
                                ...customMonster,
                                attributes: {
                                  ...customMonster.attributes,
                                  [attr]: { value: val, modifier: modStr }
                                }
                              });
                            }}
                            className="w-full bg-[#1a1a1a] border border-[#8b6d4d]/50 rounded px-2 py-1 text-sm text-[#e4d5b7]"
                          />
                        </div>
                      ))}
                    </div>

                    <div className="col-span-2 grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] uppercase text-[#8b6d4d] block mb-1">Tema da Carta</label>
                        <select 
                          value={customMonster.theme || 'default'} 
                          onChange={(e) => setCustomMonster({...customMonster, theme: e.target.value as CardTheme})}
                          className="w-full bg-[#1a1a1a] border border-[#8b6d4d]/50 rounded px-2 py-1 text-sm text-[#e4d5b7]"
                        >
                          {THEMES.map(t => (
                            <option key={t.id} value={t.id}>{t.name}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] uppercase text-[#8b6d4d] block mb-1">Fundo da Ilustração</label>
                        <div className="flex gap-2">
                          <input 
                            type="color" 
                            value={customMonster.imageBgColor || '#d4c3a3'} 
                            onChange={(e) => setCustomMonster({...customMonster, imageBgColor: e.target.value})}
                            className="w-10 h-8 bg-transparent border-none cursor-pointer"
                          />
                          <input 
                            type="text" 
                            value={customMonster.imageBgColor || ''} 
                            onChange={(e) => setCustomMonster({...customMonster, imageBgColor: e.target.value})}
                            placeholder="#hex"
                            className="flex-1 bg-[#1a1a1a] border border-[#8b6d4d]/50 rounded px-2 py-1 text-xs text-[#e4d5b7]"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="col-span-2">
                      <label className="text-[10px] uppercase text-[#8b6d4d] block mb-1">Proficiências (Separadas por vírgula)</label>
                      <input 
                        type="text" 
                        value={customMonster.proficiencies?.join(', ') || ''} 
                        onChange={(e) => setCustomMonster({...customMonster, proficiencies: e.target.value.split(',').map(s => s.trim()).filter(s => s !== '')})}
                        className="w-full bg-[#1a1a1a] border border-[#8b6d4d]/50 rounded px-2 py-1 text-sm text-[#e4d5b7]"
                        placeholder="Ex: Armaduras leves, Espadas curtas..."
                      />
                    </div>

                    <div className="col-span-2">
                      <label className="text-[10px] uppercase text-[#8b6d4d] block mb-1">Perícias (Separadas por vírgula)</label>
                      <input 
                        type="text" 
                        value={customMonster.skills?.join(', ') || ''} 
                        onChange={(e) => setCustomMonster({...customMonster, skills: e.target.value.split(',').map(s => s.trim()).filter(s => s !== '')})}
                        className="w-full bg-[#1a1a1a] border border-[#8b6d4d]/50 rounded px-2 py-1 text-sm text-[#e4d5b7]"
                        placeholder="Ex: Atletismo +4, Furtividade +6..."
                      />
                    </div>

                    <div className="col-span-2">
                      <label className="text-[10px] uppercase text-[#8b6d4d] block mb-1">Ataques (Um por linha)</label>
                      <textarea 
                        value={customMonster.attacks.join('\n')} 
                        onChange={(e) => setCustomMonster({...customMonster, attacks: e.target.value.split('\n')})}
                        className="w-full bg-[#1a1a1a] border border-[#8b6d4d]/50 rounded px-2 py-1 text-sm text-[#e4d5b7] h-16 resize-none"
                      />
                    </div>

                    <div className="col-span-2">
                      <label className="text-[10px] uppercase text-[#8b6d4d] block mb-1">Habilidades (Uma por linha)</label>
                      <textarea 
                        value={customMonster.abilities.join('\n')} 
                        onChange={(e) => setCustomMonster({...customMonster, abilities: e.target.value.split('\n')})}
                        className="w-full bg-[#1a1a1a] border border-[#8b6d4d]/50 rounded px-2 py-1 text-sm text-[#e4d5b7] h-16 resize-none"
                      />
                    </div>

                    <div className="col-span-2">
                      <label className="text-[10px] uppercase text-[#8b6d4d] block mb-1">Essência da Criatura</label>
                      <textarea 
                        value={customMonster.essence || ''} 
                        onChange={(e) => setCustomMonster({...customMonster, essence: e.target.value})}
                        className="w-full bg-[#1a1a1a] border border-[#8b6d4d]/50 rounded px-2 py-1 text-sm text-[#e4d5b7] h-24 resize-none"
                        placeholder="✨ Essência de... Bônus... Passiva... Ativa..."
                      />
                    </div>

                    <div className="col-span-2">
                      <label className="text-[10px] uppercase text-[#8b6d4d] block mb-1">Drops (Item | % | Efeito)</label>
                      <textarea 
                        value={customMonster.drops.map(d => `${d.item} | ${d.chance} | ${d.effect}`).join('\n')} 
                        onChange={(e) => {
                          const lines = e.target.value.split('\n');
                          const newDrops = lines.map(line => {
                            const [item, chance, effect] = line.split('|').map(s => s.trim());
                            return { item: item || '', chance: chance || '', effect: effect || '' };
                          });
                          setCustomMonster({...customMonster, drops: newDrops});
                        }}
                        className="w-full bg-[#1a1a1a] border border-[#8b6d4d]/50 rounded px-2 py-1 text-sm text-[#e4d5b7] h-16 resize-none"
                        placeholder="Ex: Espada | 10% | +1 Atk"
                      />
                    </div>
                  </div>
                </div>
              )}

              <h2 className="text-xl font-bold border-b border-[#8b6d4d] pb-2 flex items-center gap-2">
                <Sword size={20} /> Ações da Carta
              </h2>
              
              <div className="space-y-4">
                <button 
                  onClick={generateCurrent}
                  disabled={isGenerating}
                  className="w-full py-4 bg-[#8b6d4d] hover:bg-[#a6825d] text-[#2c1e14] font-bold rounded-lg border-2 border-[#a6825d] flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                >
                  {isGenerating ? <Loader2 className="animate-spin" size={20} /> : <Play size={20} />}
                  Gerar Ilustração
                </button>

                <label className="w-full py-3 bg-[#3d2b1f] hover:bg-[#4d3b2f] text-[#e4d5b7] font-bold rounded-lg border border-[#8b6d4d] flex items-center justify-center gap-2 transition-colors cursor-pointer">
                  <Upload size={18} />
                  Importar Ilustração do PC
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleImageUpload} 
                    className="hidden" 
                  />
                </label>
                
                <button 
                  onClick={saveCurrent}
                  disabled={isGenerating || !monsterImages[currentMonster.id]}
                  className="w-full py-3 bg-[#3d2b1f] hover:bg-[#4d3b2f] text-[#e4d5b7] font-bold rounded-lg border border-[#8b6d4d] flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                >
                  <Save size={18} />
                  Salvar no Projeto
                </button>
                
                <button 
                  onClick={downloadCard}
                  disabled={isGenerating || !monsterImages[currentMonster.id]}
                  className="w-full py-3 bg-[#1a1a1a] hover:bg-[#2a2a2a] text-[#e4d5b7] font-bold rounded-lg border border-[#8b6d4d] flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                >
                  <Download size={18} />
                  Baixar Imagem (PNG)
                </button>
              </div>

            {status && (
              <div className="flex items-center gap-2 text-sm text-[#a6825d] animate-pulse p-3 bg-black/30 rounded border border-[#8b6d4d]/30">
                <Loader2 size={16} className="animate-spin shrink-0" />
                <span>{status}</span>
              </div>
            )}

            {error && (
              <div className="p-3 bg-red-900/30 border border-red-500/50 rounded text-red-200 text-xs flex items-start gap-2">
                <AlertCircle size={16} className="shrink-0" />
                {error}
              </div>
            )}

            {monsterImages[currentMonster.id] && (
              <div className="mt-2 p-4 bg-black/30 rounded border border-[#8b6d4d]/30 space-y-4">
                <h3 className="text-sm font-bold text-[#8b6d4d] uppercase tracking-wider flex items-center gap-2">
                  <Settings2 size={16} /> Personalização Visual
                </h3>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-[#e4d5b7] block mb-1">Tema</label>
                    <select 
                      value={currentMonster.theme || 'default'} 
                      onChange={(e) => {
                        const newTheme = e.target.value as CardTheme;
                        if (isCustomMode) {
                          setCustomMonster({...customMonster, theme: newTheme});
                        } else {
                          // For default monsters, we temporarily override
                          const updated = [...monsters];
                          updated[currentMonsterIndex] = { ...updated[currentMonsterIndex], theme: newTheme };
                          // Note: this won't persist to the file, but works for the session
                          setCustomMonster({...currentMonster, theme: newTheme});
                          setIsCustomMode(true);
                        }
                      }}
                      className="w-full bg-[#1a1a1a] border border-[#8b6d4d]/50 rounded px-2 py-1 text-xs text-[#e4d5b7]"
                    >
                      {THEMES.map(t => (
                        <option key={t.id} value={t.id}>{t.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-[#e4d5b7] block mb-1">Fundo Imagem</label>
                    <input 
                      type="color" 
                      value={currentMonster.imageBgColor || '#d4c3a3'} 
                      onChange={(e) => {
                        const newColor = e.target.value;
                        if (isCustomMode) {
                          setCustomMonster({...customMonster, imageBgColor: newColor});
                        } else {
                          setCustomMonster({...currentMonster, imageBgColor: newColor});
                          setIsCustomMode(true);
                        }
                      }}
                      className="w-full h-7 bg-transparent border-none cursor-pointer"
                    />
                  </div>
                </div>
                
                <div className="space-y-3 pt-2 border-t border-[#8b6d4d]/20">
                  <div>
                    <label className="text-xs text-[#e4d5b7] block mb-1">Proficiências</label>
                    <input 
                      type="text" 
                      value={currentMonster.proficiencies?.join(', ') || ''} 
                      onChange={(e) => {
                        const val = e.target.value.split(',').map(s => s.trim()).filter(s => s !== '');
                        if (isCustomMode) {
                          setCustomMonster({...customMonster, proficiencies: val});
                        } else {
                          setCustomMonster({...currentMonster, proficiencies: val});
                          setIsCustomMode(true);
                        }
                      }}
                      className="w-full bg-[#1a1a1a] border border-[#8b6d4d]/50 rounded px-2 py-1 text-xs text-[#e4d5b7]"
                      placeholder="Armaduras, Armas..."
                    />
                  </div>
                  <div>
                    <label className="text-xs text-[#e4d5b7] block mb-1">Perícias</label>
                    <input 
                      type="text" 
                      value={currentMonster.skills?.join(', ') || ''} 
                      onChange={(e) => {
                        const val = e.target.value.split(',').map(s => s.trim()).filter(s => s !== '');
                        if (isCustomMode) {
                          setCustomMonster({...customMonster, skills: val});
                        } else {
                          setCustomMonster({...currentMonster, skills: val});
                          setIsCustomMode(true);
                        }
                      }}
                      className="w-full bg-[#1a1a1a] border border-[#8b6d4d]/50 rounded px-2 py-1 text-xs text-[#e4d5b7]"
                      placeholder="Atletismo, Furtividade..."
                    />
                  </div>
                </div>
                
                <div className="pt-2 border-t border-[#8b6d4d]/20">
                  <h4 className="text-[10px] uppercase text-[#8b6d4d] mb-2">Enquadramento</h4>
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs flex justify-between mb-1 text-[#e4d5b7]">
                        <span>Zoom</span> 
                        <span>{Math.round(currentSettings.scale * 100)}%</span>
                      </label>
                      <input 
                        type="range" min="0.5" max="2" step="0.05" 
                        value={currentSettings.scale} 
                        onChange={(e) => updateSettings({ scale: parseFloat(e.target.value) })} 
                        className="w-full accent-[#8b6d4d]" 
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] text-[#e4d5b7] block mb-1">Posição X</label>
                        <input 
                          type="range" min="0" max="100" 
                          value={currentSettings.x} 
                          onChange={(e) => updateSettings({ x: parseInt(e.target.value) })} 
                          className="w-full accent-[#8b6d4d]" 
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-[#e4d5b7] block mb-1">Posição Y</label>
                        <input 
                          type="range" min="0" max="100" 
                          value={currentSettings.y} 
                          onChange={(e) => updateSettings({ y: parseInt(e.target.value) })} 
                          className="w-full accent-[#8b6d4d]" 
                        />
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="pt-2 border-t border-[#8b6d4d]/20 space-y-2">
                  <h4 className="text-[10px] uppercase text-[#8b6d4d] mb-1">Exportar Ilustração</h4>
                  <button 
                    onClick={downloadIllustration}
                    className="w-full py-3 bg-[#8b6d4d] hover:bg-[#a6825d] text-[#2c1e14] text-xs font-bold rounded border border-[#a6825d] flex items-center justify-center gap-2 transition-colors"
                  >
                    <Download size={16} /> Baixar Ilustração (Alta Resolução)
                  </button>
                  <p className="text-[10px] text-[#8b6d4d]/60 text-center italic">
                    Baixa a imagem original gerada pela IA sem filtros ou fundos extras.
                  </p>
                </div>

                <button 
                  onClick={() => updateSettings({ scale: 1, x: 50, y: 50 })} 
                  className="text-xs text-[#8b6d4d] hover:text-[#e4d5b7] underline w-full text-center"
                >
                  Resetar Ajustes
                </button>
              </div>
            )}

            <div className="mt-4">
              <h3 className="text-sm font-bold mb-3 text-[#8b6d4d] uppercase tracking-wider">
                Lista de Criaturas ({monsters.length})
              </h3>
              <div className="max-h-[400px] overflow-y-auto space-y-1 pr-2 custom-scrollbar">
                {monsters.map((m, idx) => (
                  <div 
                    key={m.id}
                    onClick={() => !isGenerating && setCurrentMonsterIndex(idx)}
                    className={`text-sm p-3 rounded cursor-pointer transition-colors flex justify-between items-center ${
                      currentMonsterIndex === idx ? 'bg-[#8b6d4d] text-[#2c1e14] font-bold' : 'hover:bg-[#3d2b1f]'
                    }`}
                  >
                    <span>{idx + 1}. {m.name}</span>
                    {monsterImages[m.id] && <CheckCircle size={16} className={currentMonsterIndex === idx ? 'text-[#2c1e14]' : 'text-[#8b6d4d]'} />}
                  </div>
                ))}
              </div>
            </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700&family=Inter:wght@400;700&display=swap');
        
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(0,0,0,0.1);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #8b6d4d;
          border-radius: 10px;
        }
      `}} />

      {/* Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#2c1e14] border-2 border-[#8b6d4d] rounded-lg w-full max-w-2xl p-6 shadow-2xl">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2 text-[#e4d5b7]">
              <FileJson className="text-[#8b6d4d]" /> Importar Criatura (JSON)
            </h2>
            <p className="text-sm text-[#8b6d4d] mb-4">
              Cole o código JSON da criatura abaixo ou selecione um arquivo do seu computador.
            </p>
            
            <div className="mb-4">
              <label className="flex items-center justify-center gap-2 w-full py-3 bg-[#3d2b1f] hover:bg-[#4d3b2f] text-[#e4d5b7] rounded border border-[#8b6d4d]/50 cursor-pointer transition-colors text-sm font-bold">
                <Upload size={18} /> Selecionar Arquivo .json
                <input 
                  type="file" 
                  accept=".json" 
                  onChange={handleFileUpload} 
                  className="hidden" 
                />
              </label>
            </div>

            <textarea 
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
              className="w-full h-80 bg-[#1a1a1a] border border-[#8b6d4d]/50 rounded p-4 text-xs font-mono text-[#e4d5b7] mb-6 focus:border-[#8b6d4d] outline-none"
              placeholder='{ "name": "Mímico", ... }'
            />
            <div className="flex gap-4">
              <button 
                onClick={() => setShowImportModal(false)}
                className="flex-1 py-3 bg-[#3d2b1f] hover:bg-[#4d3b2f] text-[#8b6d4d] font-bold rounded transition-colors"
              >
                Cancelar
              </button>
              <button 
                onClick={handleImportJson}
                disabled={!importText.trim()}
                className="flex-1 py-3 bg-[#8b6d4d] hover:bg-[#a6825d] text-[#2c1e14] font-bold rounded flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
              >
                <Upload size={18} /> Processar e Importar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;

