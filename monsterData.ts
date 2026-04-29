
import { Monster } from "./types";

export const BACKUP_MONSTERS: Monster[] = [
  // --- EX ---
  { 
    id: 1000, name: "Aranha das Trevas", type: "Monstruosidade", cr: "1", ac: 13, hp: 20, speed: "9m", imageUrl: "/textures/creatures/Aranha das Trevas.png", 
    actions: [{n: "Mordida", hit: 4, dmg: "1d6+2"}], 
    attributes: { str: 10, dex: 14, con: 12, int: 3, wis: 10, cha: 4 },
    essence: {
      id: "ess_aranha_trevas", name: "Essência da Aranha das Trevas", monsterSource: "Aranha das Trevas", cr: "1",
      attributeBonus: { attr: "dex", value: 1 },
      passive: { name: "Sentido Sombrio", desc: "Visão no escuro (18m) e vantagem em testes de furtividade em sombras." },
      active: { name: "Teia Umbral", desc: "Dispara uma teia que deixa o alvo impedido.", limit: "1/Descanso Curto" }
    },
    drops: [
      { n: "Fio de Seda Resistente", d: "Usado para criar cordas leves ou reforçar armaduras.", r: "Comum" },
      { n: "Glândula de Veneno", d: "Pode ser usada para criar óleos venenosos.", r: "Comum" },
      { n: "Olho Multi-focal", d: "Um olho que brilha levemente no escuro.", r: "Incomum" }
    ]
  },
  { 
    id: 1001, name: "Aranha da Sombra", type: "Monstruosidade", cr: "1", ac: 13, hp: 20, speed: "9m", imageUrl: "/textures/creatures/Aranha da Sombra.png", 
    actions: [{n: "Mordida", hit: 4, dmg: "1d6+2"}], 
    attributes: { str: 10, dex: 14, con: 12, int: 3, wis: 10, cha: 4 },
    essence: {
      id: "ess_aranha_sombra", name: "Essência da Aranha da Sombra", monsterSource: "Aranha da Sombra", cr: "1",
      attributeBonus: { attr: "dex", value: 1 },
      passive: { name: "Manto de Sombras", desc: "Visão no escuro (18m) e vantagem em furtividade na penumbra." },
      active: { name: "Passo Sombrio", desc: "Teletransporte de até 9m entre sombras.", limit: "1/Descanso Curto" }
    },
    drops: [
      { n: "Fio de Seda Resistente", d: "Seda que parece absorver a luz.", r: "Comum" },
      { n: "Glândula de Sombra", d: "Resíduo de energia sombria pura.", r: "Incomum" },
      { n: "Fragmento de Escuridão", d: "Um pequeno cristal preto que nunca reflete luz.", r: "Raro" }
    ]
  },
  { 
    id: 1002, name: "Aranha de Fogo", type: "Monstruosidade", cr: "1", ac: 13, hp: 20, speed: "9m", imageUrl: "/textures/creatures/Aranha de Fogo.png", 
    actions: [{n: "Mordida", hit: 4, dmg: "1d6+2"}], 
    attributes: { str: 10, dex: 14, con: 12, int: 3, wis: 10, cha: 4 },
    essence: {
      id: "ess_aranha_fogo", name: "Essência da Aranha de Fogo", monsterSource: "Aranha de Fogo", cr: "1",
      attributeBonus: { attr: "dex", value: 1 },
      passive: { name: "Sangue Escaldante", desc: "Resistência a dano de fogo." },
      active: { name: "Picada Incendiária", desc: "Seu próximo ataque causa 1d6 de dano de fogo extra.", limit: "1/Descanso Curto" }
    },
    drops: [
      { n: "Fio de Seda de Fogo", d: "Seda quente ao toque, usada em trajes térmicos.", r: "Comum" },
      { n: "Glândula de Fogo", d: "Contém um líquido altamente inflamável.", r: "Incomum" },
      { n: "Quelícera Carbonizada", d: "Pode ser lapidada para criar pontas de flecha ígneas.", r: "Incomum" }
    ]
  },
  { 
    id: 1003, name: "Aranha de Gelo", type: "Monstruosidade", cr: "1", ac: 13, hp: 20, speed: "9m", imageUrl: "/textures/creatures/Aranha de Gelo.png", 
    actions: [{n: "Mordida", hit: 4, dmg: "1d6+2"}], 
    attributes: { str: 10, dex: 14, con: 12, int: 3, wis: 10, cha: 4 },
    essence: {
      id: "ess_aranha_gelo", name: "Essência da Aranha de Gelo", monsterSource: "Aranha de Gelo", cr: "1",
      attributeBonus: { attr: "dex", value: 1 },
      passive: { name: "Passo Polar", desc: "Movimentação livre em terrenos de gelo ou neve." },
      active: { name: "Geada Paralisante", desc: "Reduz a velocidade do alvo em 3m por 1 rodada ao atingir um ataque.", limit: "1/Descanso Curto" }
    },
    drops: [
      { n: "Fio de Seda Vítrea", d: "Fio semi-transparente e frio.", r: "Comum" },
      { n: "Glândula de Gelo", d: "Substância que congela ao contato com o ar.", r: "Incomum" },
      { n: "Pata Congelada", d: "Troféu resistente que nunca derrete.", r: "Incomum" }
    ]
  },
  { 
    id: 1004, name: "Aranha Fantasma", type: "Morto-vivo", cr: "1", ac: 13, hp: 20, speed: "9m", imageUrl: "/textures/creatures/Aranha Fantasma.png", 
    actions: [{n: "Mordida", hit: 4, dmg: "1d6+2"}], 
    attributes: { str: 10, dex: 14, con: 12, int: 3, wis: 10, cha: 4 },
    essence: {
      id: "ess_aranha_fantasma", name: "Essência da Aranha Fantasma", monsterSource: "Aranha Fantasma", cr: "1",
      attributeBonus: { attr: "con", value: 1 },
      passive: { name: "Espectro Aracnídeo", desc: "Resistência a dano necrótico." },
      active: { name: "Toque Etéreo", desc: "Pode atravessar uma criatura ou objeto sólido de até 1,5m nesta rodada.", limit: "1/Descanso Curto" }
    },
    drops: [
      { n: "Ectoplasma Pegajoso", d: "Resíduo espiritual usado em poções de invisibilidade.", r: "Incomum" },
      { n: "Fio de Éter", d: "Um fio quase invisível que flutua.", r: "Incomum" },
      { n: "Fragmento de Alma", d: "Uma lasca brilhante de energia vital.", r: "Raro" }
    ]
  },
  { 
    id: 1005, name: "Aranha Necrótica", type: "Morto-vivo", cr: "1", ac: 13, hp: 20, speed: "9m", 
    actions: [{n: "Mordida", hit: 4, dmg: "1d6+2"}], 
    attributes: { str: 10, dex: 14, con: 12, int: 3, wis: 10, cha: 4 },
    essence: {
      id: "ess_aranha_necrotica", name: "Essência da Aranha Necrótica", monsterSource: "Aranha Necrótica", cr: "1",
      attributeBonus: { attr: "con", value: 1 },
      passive: { name: "Presença Mórbida", desc: "Resistência a dano necrótico e veneno." },
      active: { name: "Drenar Essência", desc: "Causa 1d4 de dano necrótico e recupera a mesma quantidade em PV.", limit: "1/Descanso Curto" }
    },
    drops: [
      { n: "Gás da Decomposição", d: "Um frasco com vapores necróticos.", r: "Incomum" },
      { n: "Quelícera Podre", d: "Material para armas de dano necrótico.", r: "Incomum" },
      { n: "Poeira de Ossos", d: "Usada em rituais necromânticos.", r: "Comum" }
    ]
  },
  { 
    id: 1006, name: "Basilisco de Cristal", type: "Monstruosidade", cr: "3", ac: 15, hp: 52, speed: "6m", 
    actions: [{n: "Mordida", hit: 5, dmg: "2d6+3"}], 
    attributes: { str: 16, dex: 8, con: 15, int: 2, wis: 8, cha: 7 },
    essence: {
      id: "ess_basilisco_cristal", name: "Essência do Basilisco de Cristal", monsterSource: "Basilisco de Cristal", cr: "3",
      attributeBonus: { attr: "str", value: 1 },
      passive: { name: "Pele Refratosa", desc: "+1 na Classe de Armadura (CA)." },
      active: { name: "Olhar Refratário", desc: "Força o alvo a ficar lento por 1 rodada ao falhar num Save de Con.", limit: "1/Descanso Curto" }
    },
    drops: [
      { n: "Lascas de Cristal", d: "Material para forjar armas brilhantes.", r: "Comum" },
      { n: "Escama de Cristal", d: "Rígida e bela, usada para escudos.", r: "Incomum" },
      { n: "Olho Petrificado", d: "Item raro que retém energia mística.", r: "Raro" }
    ]
  },
  { 
    id: 1007, name: "Basilisco de Ferro", type: "Monstruosidade", cr: "3", ac: 15, hp: 52, speed: "6m", 
    actions: [{n: "Mordida", hit: 5, dmg: "2d6+3"}], 
    attributes: { str: 16, dex: 8, con: 15, int: 2, wis: 8, cha: 7 },
    essence: {
      id: "ess_basilisco_ferro", name: "Essência do Basilisco de Ferro", monsterSource: "Basilisco de Ferro", cr: "3",
      attributeBonus: { attr: "str", value: 1 },
      passive: { name: "Carapaça Blindada", desc: "+1 na Classe de Armadura (CA)." },
      active: { name: "Olhar de Ferro", desc: "Força um teste de resistência; em caso de falha, o alvo fica caído.", limit: "1/Descanso Curto" }
    },
    drops: [
      { n: "Placa de Ferro Orgânico", d: "Metal extremamente flexível e resistente.", r: "Comum" },
      { n: "Língua Metálica", d: "Músculo rígido usado em mecanismos.", r: "Incomum" },
      { n: "Sangue de Mercúrio", d: "Líquido metálico usado por alquimistas.", r: "Raro" }
    ]
  },
  { 
    id: 1008, name: "Cadavre Golens (Corpse Golem)", type: "Construto", cr: "5", ac: 13, hp: 90, speed: "9m", 
    actions: [{n: "Pancada", hit: 7, dmg: "2d8+4"}], 
    attributes: { str: 18, dex: 9, con: 18, int: 3, wis: 10, cha: 1 },
    essence: {
      id: "ess_golem_cadavre", name: "Essência do Cadavre Golem", monsterSource: "Cadavre Golem", cr: "5",
      attributeBonus: { attr: "str", value: 2 },
      passive: { name: "Vontade do Além", desc: "Vantagem em testes contra medo." },
      active: { name: "Aversão ao Fogo", desc: "Ganha um surto (+1 ataque), mas recebe fraqueza a fogo na rodada.", limit: "1/Descanso Curto" }
    },
    drops: [
      { n: "Coração Pulsante", d: "Um órgão que insiste em bater.", r: "Incomum" },
      { n: "Óleo Cadavérico", d: "Líquido viscoso usado para embalsamamento.", r: "Comum" },
      { n: "Prego de Ferro Enferrujado", d: "Sustenta partes do golem.", r: "Comum" }
    ]
  },
  { 
    id: 1009, name: "Caveira de Gelo", type: "Morto-vivo", cr: "1/2", ac: 12, hp: 15, speed: "0m/9m voo", imageUrl: "/textures/creatures/Caveiras Gelo.PNG", 
    actions: [{n: "Raio de Gelo", hit: 4, dmg: "1d8"}], 
    attributes: { str: 1, dex: 14, con: 10, int: 10, wis: 10, cha: 10 },
    essence: {
      id: "ess_caveira_gelo", name: "Essência da Caveira de Gelo", monsterSource: "Caveira de Gelo", cr: "1/2",
      attributeBonus: { attr: "int", value: 1 },
      passive: { name: "Resistência Ártica", desc: "Resistência a dano de Gelo." },
      active: { name: "Disparo de Gelo", desc: "Lança um raio de gelo que causa 1d8 de dano.", limit: "1/Descanso Curto" }
    },
    drops: [
      { n: "Fragmento de Gelo Eterno", d: "Nunca derrete e emite frio constante.", r: "Comum" },
      { n: "Poeira de Ossos Gélida", d: "Pó frio usado em poções.", r: "Comum" },
      { n: "Órbita de Safira", d: "Um olho de gema semi-preciosa.", r: "Incomum" }
    ]
  },
  { 
    id: 1010, name: "Caveira de Sangue", type: "Morto-vivo", cr: "1/2", ac: 12, hp: 15, speed: "0m/9m voo", imageUrl: "/textures/creatures/Caveiras Sangue.PNG", 
    actions: [{n: "Drenar", hit: 4, dmg: "1d8"}], 
    attributes: { str: 1, dex: 14, con: 10, int: 10, wis: 10, cha: 10 },
    essence: {
      id: "ess_caveira_sangue", name: "Essência da Caveira de Sangue", monsterSource: "Caveira de Sangue", cr: "1/2",
      attributeBonus: { attr: "wis", value: 1 },
      passive: { name: "Resistência Vital", desc: "Resistência a dano Necrótico." },
      active: { name: "Disparo Sanguíneo", desc: "Lança um raio de sangue que causa 1d8 de dano.", limit: "1/Descanso Curto" }
    },
    drops: [
      { n: "Coágulo Energizado", d: "Sangue seco imbuído de magia.", r: "Comum" },
      { n: "Mandíbula Escarlate", d: "Pode ser usada como amuleto.", r: "Incomum" },
      { n: "Essência de Vida", d: "Resíduo vital de uma criatura caída.", r: "Incomum" }
    ]
  },
  { 
    id: 1011, name: "Caveira de Veneno", type: "Morto-vivo", cr: "1/2", ac: 12, hp: 15, speed: "0m/9m voo", imageUrl: "/textures/creatures/Caveiras Veneno.PNG", 
    actions: [{n: "Sopro Venenoso", hit: 4, dmg: "1d8"}], 
    attributes: { str: 1, dex: 14, con: 10, int: 10, wis: 10, cha: 10 },
    essence: {
      id: "ess_caveira_veneno", name: "Essência da Caveira de Veneno", monsterSource: "Caveira de Veneno", cr: "1/2",
      attributeBonus: { attr: "int", value: 1 },
      passive: { name: "Imunidade Tóxica", desc: "Resistência a dano de Veneno." },
      active: { name: "Disparo Tóxico", desc: "Lança um raio de veneno que causa 1d8 de dano.", limit: "1/Descanso Curto" }
    },
    drops: [
      { n: "Resíduo Tóxico", d: "Lama verde altamente corrosiva.", r: "Comum" },
      { n: "Dente Envenenado", d: "Contém vestígios de veneno letal.", r: "Incomum" },
      { n: "Poeira de Ossos Verde", d: "Ossos tingidos por toxinas.", r: "Comum" }
    ]
  },
  { 
    id: 1012, name: "Caveira Flamejante", type: "Morto-vivo", cr: "4", ac: 13, hp: 40, speed: "0m/9m voo", imageUrl: "/textures/creatures/Caveiras Fogo.PNG", 
    actions: [{n: "Raio de Fogo", hit: 5, dmg: "1d10"}], 
    attributes: { str: 1, dex: 17, con: 14, int: 16, wis: 10, cha: 11 },
    essence: {
      id: "ess_caveira_flamejante", name: "Essência da Caveira Flamejante", monsterSource: "Caveira Flamejante", cr: "4",
      attributeBonus: { attr: "int", value: 2 },
      passive: { name: "Manto Ígneo", desc: "Imunidade a fogo." },
      active: { name: "Reconstituição", desc: "Se cair a 0 HP, retorna com 1 HP.", limit: "1/Descanso Longo" }
    },
    drops: [
      { n: "Brasa Eterna", d: "Um osso que nunca para de queimar.", r: "Incomum" },
      { n: "Poeira de Fênix", d: "Cinzas mágicas com propriedades curativas.", r: "Raro" },
      { n: "Fogo Engarrafado", d: "Instável e explosivo.", r: "Incomum" }
    ]
  },
  { 
    id: 1013, name: "Centauro de Bronze", type: "Construto", cr: "2", ac: 15, hp: 45, speed: "15m", imageUrl: "/textures/creatures/Centauro de Bronze.png", 
    actions: [{n: "Lança", hit: 6, dmg: "1d8+4"}], 
    attributes: { str: 18, dex: 14, con: 14, int: 10, wis: 10, cha: 10 },
    essence: {
      id: "ess_centauro_bronze", name: "Essência do Centauro de Bronze", monsterSource: "Centauro de Bronze", cr: "2",
      attributeBonus: { attr: "str", value: 1 },
      passive: { name: "Passo Mecânico", desc: "+3m de deslocamento em estradas." },
      active: { name: "Investida de Bronze", desc: "Se mover 6m em linha reta, o próximo ataque causa +1d6 dano.", limit: "1/Descanso Curto" }
    },
    drops: [
      { n: "Engrenagem de Bronze", d: "Peça mecânica de precisão hípica.", r: "Comum" },
      { n: "Óleo de Manutenção", d: "Mantém juntas mecânicas lubrificadas.", r: "Comum" },
      { n: "Placa de Bronze Polido", d: "Material para armaduras metálicas.", r: "Incomum" }
    ]
  },
  { 
    id: 1014, name: "Centauro do Crepúsculo", type: "Fada", cr: "2", ac: 12, hp: 45, speed: "15m", 
    actions: [{n: "Arco Longo", hit: 4, dmg: "1d8+2"}], 
    attributes: { str: 14, dex: 14, con: 14, int: 10, wis: 12, cha: 11 },
    essence: {
      id: "ess_centauro_crepusculo", name: "Essência do Centauro do Crepúsculo", monsterSource: "Centauro do Crepúsculo", cr: "2",
      attributeBonus: { attr: "wis", value: 1 },
      passive: { name: "Trilha das Fadas", desc: "Não pode ser rastreado por meios não-mágicos em florestas." },
      active: { name: "Flecha Etérea", desc: "Seu próximo ataque à distância ignora cobertura.", limit: "1/Descanso Curto" }
    },
    drops: [
      { n: "Madeira de Carvalho Feérico", d: "Madeira que brilha sob o luar.", r: "Incomum" },
      { n: "Ponta de Flecha de Cristal", d: "Causa dano radiante extra.", r: "Incomum" },
      { n: "Casco de Prata", d: "Um troféu raro e valioso.", r: "Raro" }
    ]
  },
  { 
    id: 1015, name: "Ciclope da Montanha", type: "Gigante", cr: "6", ac: 14, hp: 107, speed: "9m", imageUrl: "/textures/creatures/Ciclope da Montanha.png", 
    actions: [{n: "Clava Grande", hit: 9, dmg: "3d8+6"}], 
    attributes: { str: 22, dex: 10, con: 20, int: 8, wis: 10, cha: 10 },
    essence: {
      id: "ess_ciclope_montanha", name: "Essência do Ciclope da Montanha", monsterSource: "Ciclope da Montanha", cr: "6",
      attributeBonus: { attr: "str", value: 2 },
      passive: { name: "Arremesso de Elite", desc: "Dobra a distância de arremesso de objetos." },
      active: { name: "Foco de Único Olho", desc: "Ganha vantagem no próximo ataque, mas desvantagem na CA até o próximo turno.", limit: "1/Descanso Curto" }
    },
    drops: [
      { n: "Couro de Gigante", d: "Material extremamente durável para mochilas ou tendas.", r: "Raro" },
      { n: "Olho de Ciclope", d: "Amuleto que concede bônus em percepção à distância.", r: "Lendário" },
      { n: "Clava de Pedra Brutal", d: "Uma arma massiva e rudimentar.", r: "Incomum" }
    ]
  },
  { 
    id: 1016, name: "Dragão de Fumaça", type: "Dragão", cr: "8", ac: 17, hp: 136, speed: "12m/24m voo", imageUrl: "/textures/creatures/Dragão de Fumaça.png", 
    actions: [{n: "Sopro de Fumaça", hit: 0, dmg: "8d6 (CD 15)"}], 
    attributes: { str: 19, dex: 14, con: 18, int: 14, wis: 11, cha: 15 },
    essence: {
      id: "ess_dragao_fumaca", name: "Essência do Dragão de Fumaça", monsterSource: "Dragão de Fumaça", cr: "8",
      attributeBonus: { attr: "str", value: 2 },
      passive: { name: "Pulmão Cinzento", desc: "Resistência a dano de fogo e fumaça." },
      active: { name: "Mini-Sopro de Fumaça", desc: "Cria uma nuvem de fumaça que obscurece a área em 3m.", limit: "1/Descanso Longo" }
    },
    drops: [
      { n: "Escama de Ébano", d: "Escama escura que exala calor.", r: "Incomum" },
      { n: "Garra Enublada", d: "Garra afiada usada em adagas.", r: "Incomum" },
      { n: "Coração de Fuligem", d: "Pedra rítmica que gera fumaça.", r: "Raro" }
    ]
  },
  { 
    id: 1017, name: "Dragão de Jade", type: "Dragão", cr: "10", ac: 18, hp: 178, speed: "12m/24m voo", imageUrl: "/textures/creatures/Dragão de Jade.png", 
    actions: [{n: "Sopro de Jade", hit: 0, dmg: "10d6 (CD 17)"}], 
    attributes: { str: 23, dex: 10, con: 21, int: 14, wis: 11, cha: 19 },
    essence: {
      id: "ess_dragao_jade", name: "Essência do Dragão de Jade", monsterSource: "Dragão de Jade", cr: "10",
      attributeBonus: { attr: "cha", value: 2 },
      passive: { name: "Escamas de Jade", desc: "Resistência a dano radiante ou veneno." },
      active: { name: "Mini-Sopro de Jade", desc: "Um cone de 4.5m que causa 4d6 dano de veneno.", limit: "1/Descanso Longo" }
    },
    drops: [
      { n: "Escama de Jade Real", d: "Material para armaduras lendárias.", r: "Lendário" },
      { n: "Dente de Dragão", d: "Lapidado para adagas de alto dano.", r: "Raro" },
      { n: "Olho de Esmeralda", d: "Uma gema de valor inestimável.", r: "Lendário" }
    ]
  },
  { 
    id: 1018, name: "Dragão de Osso", type: "Morto-vivo", cr: "12", ac: 16, hp: 150, speed: "12m/24m voo", imageUrl: "/textures/creatures/Dragão de Osso.png", 
    actions: [{n: "Sopro Necrótico", hit: 0, dmg: "12d6 (CD 18)"}], 
    attributes: { str: 23, dex: 10, con: 21, int: 14, wis: 11, cha: 19 },
    essence: {
      id: "ess_dragao_osso", name: "Essência do Dragão de Osso", monsterSource: "Dragão de Osso", cr: "12",
      attributeBonus: { attr: "con", value: 2 },
      passive: { name: "Ossada Impenetrável", desc: "Resistência a dano necrótico e perfurante." },
      active: { name: "Mini-Sopro Necrótico", desc: "Causa 5d6 dano necrótico a um alvo.", limit: "1/Descanso Longo" }
    },
    drops: [
      { n: "Osso de Dragão Ancestral", d: "Ossos gigantescos imbuídos de necromancia.", r: "Raro" },
      { n: "Pó de Dragão", d: "Cinzas de dragão mortas-vivas.", r: "Incomum" },
      { n: "Chifre Quebrado", d: "Pode ser usado como berrante de guerra.", r: "Raro" }
    ]
  },
  { 
    id: 1019, name: "Dragão de Veneno", type: "Dragão", cr: "8", ac: 17, hp: 136, speed: "12m/24m voo", imageUrl: "/textures/creatures/Dragão de Veneno.png", 
    actions: [{n: "Sopro Venenoso", hit: 0, dmg: "8d6 (CD 15)"}], 
    attributes: { str: 19, dex: 14, con: 18, int: 14, wis: 11, cha: 15 },
    essence: {
      id: "ess_dragao_veneno", name: "Essência do Dragão de Veneno", monsterSource: "Dragão de Veneno", cr: "8",
      attributeBonus: { attr: "dex", value: 2 },
      passive: { name: "Escamas Tóxicas", desc: "Imunidade a veneno." },
      active: { name: "Mini-Sopro Venenoso", desc: "Uma nuvem de 3m que causa 4d6 dano veneno.", limit: "1/Descanso Longo" }
    },
    drops: [
      { n: "Escama Verde Ácida", d: "Corrói metais comuns ao contato prolongado.", r: "Incomum" },
      { n: "Veneno de Dragão Puro", d: "Toxina extremamente letal.", r: "Raro" },
      { n: "Garra de Veneno", d: "Uma garra que goteja ácido.", r: "Incomum" }
    ]
  },
  { 
    id: 1020, name: "Dríade Corrompida", type: "Fada", cr: "1", ac: 11, hp: 22, speed: "9m", imageUrl: "/textures/creatures/Dríade Corrompida.png", 
    actions: [{n: "Bordão", hit: 2, dmg: "1d4"}], 
    attributes: { str: 10, dex: 12, con: 11, int: 14, wis: 15, cha: 18 },
    essence: {
      id: "ess_driade_corrompida", name: "Essência da Dríade Corrompida", monsterSource: "Dríade Corrompida", cr: "1",
      attributeBonus: { attr: "cha", value: 1 },
      passive: { name: "Passo Arborícola", desc: "Pode se mover através de plantas espinhosas sem sofrer dano." },
      active: { name: "Encanto Agoniante", desc: "Força o alvo a passar em Save de Sabedoria ou ser fascinado.", limit: "1/Descanso Curto" }
    },
    drops: [
      { n: "Casca de Árvore Podre", d: "Material feérico corrompido.", r: "Comum" },
      { n: "Lágrima de Fada", d: "Líquido amargo usado em alquimia das sombras.", r: "Incomum" },
      { n: "Semente de Trevas", d: "Pode ser plantada para criar terreno difícil.", r: "Raro" }
    ]
  },
  { 
    id: 1021, name: "Elemental de Cinzas", type: "Elemental", cr: "5", ac: 14, hp: 100, speed: "15m voo", imageUrl: "/textures/creatures/Elemental de Cinzas.png", 
    actions: [{n: "Pancada", hit: 7, dmg: "2d8+4"}], 
    attributes: { str: 14, dex: 18, con: 16, int: 6, wis: 10, cha: 6 },
    essence: {
      id: "ess_elemental_cinzas", name: "Essência do Elemental de Cinzas", monsterSource: "Elemental de Cinzas", cr: "5",
      attributeBonus: { attr: "dex", value: 2 },
      passive: { name: "Corpo de Fuligem", desc: "Vantagem em testes de furtividade em áreas de fumaça." },
      active: { name: "Nuvem de Cinzas", desc: "Cria uma área de 3m que cega inimigos por 1 rodada.", limit: "1/Descanso Curto" }
    },
    drops: [
      { n: "Essência de Cinzas", d: "Pó quente que nunca esfria.", r: "Incomum" },
      { n: "Núcleo de Fuligem", d: "Resíduo sólido de energia elemental.", r: "Raro" },
      { n: "Fragmento Vulcânico", d: "Pedra porosa e leve.", r: "Comum" }
    ]
  },
  { 
    id: 1022, name: "Elemental de Fogo", type: "Elemental", cr: "5", ac: 13, hp: 102, speed: "15m", imageUrl: "/textures/creatures/Elemental de Fogo.png", 
    actions: [{n: "Toque Ígneo", hit: 6, dmg: "2d8+3 fogo"}], 
    attributes: { str: 10, dex: 17, con: 16, int: 6, wis: 10, cha: 7 },
    essence: {
      id: "ess_elemental_fogo", name: "Essência do Elemental de Fogo", monsterSource: "Elemental de Fogo", cr: "5",
      attributeBonus: { attr: "dex", value: 2 },
      passive: { name: "Aura de Calor", desc: "Resistência a dano de fogo." },
      active: { name: "Explosão de Chamas", desc: "Causa 2d6 de dano de fogo a inimigos adjacentes.", limit: "1/Descanso Curto" }
    },
    drops: [
      { n: "Chama Eterna Presa", d: "Um fogo que não precisa de combustível.", r: "Raro" },
      { n: "Núcleo Ígneo", d: "Esfera de puro calor.", r: "Incomum" },
      { n: "Essência Elemental Instável", d: "Explode se arremessada (3d6 fogo).", r: "Raro" }
    ]
  },
  { 
    id: 1023, name: "Elemental de Fumaça", type: "Elemental", cr: "5", ac: 14, hp: 100, speed: "15m voo", imageUrl: "/textures/creatures/Elemental de Fumaça.png", 
    actions: [{n: "Pancada", hit: 7, dmg: "2d8+4"}], 
    attributes: { str: 14, dex: 18, con: 16, int: 6, wis: 10, cha: 6 },
    essence: {
      id: "ess_elemental_fumaca", name: "Essência do Elemental de Fumaça", monsterSource: "Elemental de Fumaça", cr: "5",
      attributeBonus: { attr: "dex", value: 2 },
      passive: { name: "Forma Gasosa", desc: "Pode passar por frestas de até 2cm." },
      active: { name: "Sufocamento", desc: "Alvo deve passar em Save de Con ou ficar incapacitado por 1 rodada.", limit: "1/Descanso Curto" }
    },
    drops: [
      { n: "Fumaça Engarrafada", d: "Usada para criar distrações.", r: "Comum" },
      { n: "Éter de Fumaça", d: "Líquido volátil usado por espiões.", r: "Incomum" },
      { n: "Núcleo Nebuloso", d: "Gira constantemente emitindo névoa.", r: "Raro" }
    ]
  },
  { 
    id: 1024, name: "Elemental de Relâmpago", type: "Elemental", cr: "5", ac: 15, hp: 90, speed: "27m voo", imageUrl: "/textures/creatures/Elemental de Relâmpago.png", 
    actions: [{n: "Toque Elétrico", hit: 8, dmg: "2d8+5 elétrico"}], 
    attributes: { str: 14, dex: 20, con: 14, int: 6, wis: 10, cha: 6 },
    essence: {
      id: "ess_elemental_relampago", name: "Essência do Elemental de Relâmpago", monsterSource: "Elemental de Relâmpago", cr: "5",
      attributeBonus: { attr: "dex", value: 2 },
      passive: { name: "Velocidade da Luz", desc: "+3m de deslocamento." },
      active: { name: "Arco Elétrico", desc: "Causa 3d6 de dano de raio a dois alvos próximos.", limit: "1/Descanso Curto" }
    },
    drops: [
      { n: "Magnetite Energizada", d: "Atrai pequenos objetos metálicos.", r: "Incomum" },
      { n: "Núcleo Elétrico", d: "Emite faíscas constantes.", r: "Raro" },
      { n: "Essência Elemental Instável", d: "Explode se arremessada (3d6 raio).", r: "Raro" }
    ]
  },
  { 
    id: 1025, name: "Elemental de Sangue", type: "Elemental", cr: "5", ac: 14, hp: 114, speed: "9m", 
    actions: [{n: "Pancada", hit: 7, dmg: "2d8+4"}], 
    attributes: { str: 18, dex: 14, con: 18, int: 6, wis: 10, cha: 6 },
    essence: {
      id: "ess_elemental_sangue", name: "Essência do Elemental de Sangue", monsterSource: "Elemental de Sangue", cr: "5",
      attributeBonus: { attr: "con", value: 2 },
      passive: { name: "Vigor Sanguíneo", desc: "Vantagem contra exaustão." },
      active: { name: "Forma Fluida", desc: "Desengajar como ação bônus nesta rodada.", limit: "1/Descanso Curto" }
    },
    drops: [
      { n: "Sangue Vital Concentrado", d: "Pode ser usado para criar poções de cura potentes.", r: "Incomum" },
      { n: "Núcleo Vermelho", d: "Pulsa como um coração.", r: "Raro" },
      { n: "Frasco de Hemoglobina Mágica", d: "Material alquímico raro.", r: "Raro" }
    ]
  },
  { 
    id: 1026, name: "Elemental de Terra", type: "Elemental", cr: "5", ac: 17, hp: 126, speed: "9m", imageUrl: "/textures/creatures/elemental_da_terra.PNG",
    actions: [{n: "Pancada", hit: 8, dmg: "2d8+5"}], 
    attributes: { str: 20, dex: 8, con: 20, int: 5, wis: 10, cha: 5 },
    essence: {
      id: "ess_elemental_terra", name: "Essência do Elemental de Terra", monsterSource: "Elemental de Terra", cr: "5",
      attributeBonus: { attr: "str", value: 2 },
      passive: { name: "Passo Rochoso", desc: "Ignora terreno difícil de pedra ou terra." },
      active: { name: "Pancada Sísmica", desc: "Cria um pequeno tremor que pode derrubar inimigos adjacentes.", limit: "1/Descanso Curto" }
    },
    drops: [
      { n: "Geodo de Cristal", d: "Contém gemas preciosas em seu interior.", r: "Incomum" },
      { n: "Núcleo de Terra", d: "Pedra pesada imbuída de gravidade.", r: "Raro" },
      { n: "Fragmento de Diamante Bruto", d: "Material de altíssimo valor.", r: "Lendário" }
    ]
  },
  { 
    id: 1027, name: "Elemental de Veneno", type: "Elemental", cr: "5", ac: 14, hp: 114, speed: "9m", imageUrl: "/textures/creatures/Elemental de veneno.png", 
    actions: [{n: "Pancada", hit: 7, dmg: "2d8+4"}], 
    attributes: { str: 18, dex: 14, con: 18, int: 6, wis: 10, cha: 6 },
    essence: {
      id: "ess_elemental_veneno", name: "Essência do Elemental de Veneno", monsterSource: "Elemental de Veneno", cr: "5",
      attributeBonus: { attr: "con", value: 2 },
      passive: { name: "Resistência Tóxica", desc: "Imunidade a dano de veneno." },
      active: { name: "Nuvem Tóxica", desc: "Libera um gás que envenena inimigos adjacentes por 1 rodada.", limit: "1/Descanso Curto" }
    },
    drops: [
      { n: "Lodo Venenoso", d: "Substância verde e borbulhante.", r: "Comum" },
      { n: "Núcleo Tóxico", d: "Emite um odor acre e perigoso.", r: "Raro" },
      { n: "Essência Elemental Instável", d: "Explode se arremessada (3d6 veneno).", r: "Raro" }
    ]
  },
  { 
    id: 1028, name: "Elemental de Água", type: "Elemental", cr: "5", ac: 14, hp: 114, speed: "9m", imageUrl: "/textures/creatures/Elemental de Água.png", 
    actions: [{n: "Pancada", hit: 7, dmg: "2d8+4"}], 
    attributes: { str: 18, dex: 14, con: 18, int: 6, wis: 10, cha: 6 },
    essence: {
      id: "ess_elemental_agua", name: "Essência do Elemental de Água", monsterSource: "Elemental de Água", cr: "5",
      attributeBonus: { attr: "con", value: 2 },
      passive: { name: "Anfíbio", desc: "Capacidade de respirar debaixo d'água." },
      active: { name: "Forma Fluida", desc: "Desengajar como ação bônus nesta rodada.", limit: "1/Descanso Curto" }
    },
    drops: [
      { n: "Água Benta Elemental", d: "Água pura com capacidades curativas leves.", r: "Incomum" },
      { n: "Núcleo Aquático", d: "Uma esfera de água que nunca se dispersa.", r: "Raro" },
      { n: "Cristal de Gelo Líquido", d: "Material raro para alquimia.", r: "Incomum" }
    ]
  },
  { 
    id: 1029, name: "Espectro da Névoa", type: "Morto-vivo", cr: "2", ac: 12, hp: 22, speed: "15m voo", imageUrl: "/textures/creatures/Espectros Névoa .PNG", 
    actions: [{n: "Toque Gélido", hit: 4, dmg: "2d6+2 frio"}, {n: "Névoa Ofuscante", hit: 0, dmg: "Cega por 1 rodada (CD 12)"}], 
    attributes: { str: 1, dex: 14, con: 11, int: 10, wis: 10, cha: 11 },
    essence: {
      id: "ess_espectro_nevoa", name: "Essência do Espectro da Névoa", monsterSource: "Espectro da Névoa", cr: "2",
      attributeBonus: { attr: "dex", value: 1 },
      passive: { name: "Passo de Névoa", desc: "Pode se mover através de outras criaturas como terreno difícil." },
      active: { name: "Camuflagem de Névoa", desc: "Torna-se invisível até o final do próximo turno se estiver em área de névoa ou penumbra.", limit: "1/Descanso Curto" }
    },
    drops: [{ n: "Essência de Eter", d: "Substância volátil usada em poções de invisibilidade.", r: "Incomum" }, { n: "Trapo Espectral", d: "Tecido que parece flutuar sozinho.", r: "Comum" }]
  },
  { 
    id: 1030, name: "Espectro de Fogo", type: "Morto-vivo", cr: "2", ac: 12, hp: 22, speed: "15m voo", imageUrl: "/textures/creatures/Espectros Fogo.PNG", 
    actions: [{n: "Toque Calcinante", hit: 5, dmg: "2d6+3 fogo"}, {n: "Explosão de Cinzas", hit: 0, dmg: "2d4 fogo em área (CD 12)"}], 
    attributes: { str: 1, dex: 14, con: 11, int: 10, wis: 10, cha: 11 },
    essence: {
      id: "ess_espectro_fogo", name: "Essência do Espectro de Fogo", monsterSource: "Espectro de Fogo", cr: "2",
      attributeBonus: { attr: "cha", value: 1 },
      passive: { name: "Calor Residual", desc: "Atacantes corpo-a-corpo recebem 1 de dano de fogo." },
      active: { name: "Chama Espectral", desc: "Seu próximo ataque causa +1d6 dano de fogo.", limit: "1/Descanso Curto" }
    },
    drops: [{ n: "Brasa Cinzenta", d: "Nunca apaga completamente.", r: "Comum" }, { n: "Ectoplasma Flamejante", d: "Goteja fogo azulado.", r: "Incomum" }]
  },
  { 
    id: 1035, name: "Esqueleto Gigante", type: "Morto-vivo", cr: "7", ac: 14, hp: 115, speed: "9m", imageUrl: "/textures/creatures/esqueleto_guerreiro.PNG",
    actions: [{n: "Clava de Osso", hit: 8, dmg: "3d8+5"}, {n: "Esmagar", hit: 8, dmg: "4d10+5 (Atropelar)"}], 
    attributes: { str: 21, dex: 10, con: 20, int: 6, wis: 8, cha: 5 },
    essence: {
      id: "ess_esqueleto_gigante", name: "Essência do Esqueleto Gigante", monsterSource: "Esqueleto Gigante", cr: "7",
      attributeBonus: { attr: "str", value: 2 },
      passive: { name: "Estrutura Colossal", desc: "Vantagem em testes de resistência de Força." },
      active: { name: "Grito dos Mortos", desc: "Força um teste de Sabedoria; em caso de falha, o alvo fica amedrontado.", limit: "1/Descanso Curto" }
    },
    drops: [{ n: "Fêmur Gigante", d: "Pode ser usado como clava improvisada mágica.", r: "Raro" }, { n: "Crânio de Pedra", d: "Extremamente pesado e resistente.", r: "Incomum" }]
  },
  { 
    id: 1038, name: "Golem de Carne", type: "Construto", cr: "5", ac: 9, hp: 93, speed: "9m", imageUrl: "/textures/creatures/Golem de Carne.png", 
    actions: [{n: "Pancada Dupla", hit: 7, dmg: "2d8+4"}, {n: "Berserk", hit: 0, dmg: "Aumenta o dano em +2 (Auto)"}], 
    attributes: { str: 19, dex: 9, con: 18, int: 6, wis: 10, cha: 5 },
    essence: {
      id: "ess_golem_carne", name: "Essência do Golem de Carne", monsterSource: "Golem de Carne", cr: "5",
      attributeBonus: { attr: "con", value: 2 },
      passive: { name: "Absorsão de Relâmpago", desc: "Cura PV ao receber dano elétrico." },
      active: { name: "Fúria Desenfreada", desc: "Realiza um ataque extra nesta rodada.", limit: "1/Descanso Longo" }
    },
    drops: [{ n: "Tecido Muscular Fortificado", d: "Usado para enxertos ou poções de força.", r: "Incomum" }, { n: "Parafuso Imbuído", d: "Retém carga elétrica.", r: "Comum" }]
  },
  { 
    id: 1041, name: "Golem de Ferro", type: "Construto", cr: "16", ac: 20, hp: 210, speed: "9m", imageUrl: "/textures/creatures/golem_ferro.PNG",
    actions: [{n: "Esmagar", hit: 13, dmg: "3d10+7"}, {n: "Sopro de Veneno", hit: 0, dmg: "10d8 veneno (CD 19)"}], 
    attributes: { str: 24, dex: 9, con: 20, int: 3, wis: 11, cha: 1 },
    essence: {
      id: "ess_golem_ferro", name: "Essência do Golem de Ferro", monsterSource: "Golem de Ferro", cr: "16",
      attributeBonus: { attr: "str", value: 3 },
      passive: { name: "Couraça Inexpugnável", desc: "+2 na Classe de Armadura (CA)." },
      active: { name: "Sopro Venenoso", desc: "Lança um cone de veneno de 4.5m que causa 5d8 de dano.", limit: "1/Descanso Longo" }
    },
    drops: [{ n: "Lingote de Ferro Elemental", d: "Metal sagrado usado em armas lendárias.", r: "Lendário" }, { n: "Núcleo de Forja", d: "Gera calor imenso constante.", r: "Raro" }]
  },
  { 
    id: 1042, name: "Golem de Lava", type: "Construto", cr: "10", ac: 18, hp: 150, speed: "9m", imageUrl: "/textures/creatures/Golem de Lava.png", 
    actions: [{n: "Pancada de Magma", hit: 10, dmg: "3d8+6 fogo"}, {n: "Espalhar Lava", hit: 0, dmg: "2d10 fogo em área (CD 17)"}], 
    attributes: { str: 22, dex: 9, con: 22, int: 3, wis: 10, cha: 1 },
    essence: {
      id: "ess_golem_lava", name: "Essência do Golem de Lava", monsterSource: "Golem de Lava", cr: "10",
      attributeBonus: { attr: "str", value: 2 },
      passive: { name: "Passo Vulcânico", desc: "Ignora terreno difícil de fogo ou lava e recupera 1d6 PV ao iniciar turno neles." },
      active: { name: "Armadura de Magma", desc: "Recebe resistência a dano físico por 1 rodada.", limit: "1/Descanso Longo" }
    },
    drops: [{ n: "Pedra de Lava Fluida", d: "Roca que emite luz e calor.", r: "Raro" }, { n: "Núcleo de Magma", d: "Material extremamente quente.", r: "Raro" }]
  },
  { 
    id: 1043, name: "Golem de Madeira", type: "Construto", cr: "3", ac: 13, hp: 60, speed: "9m", imageUrl: "/textures/creatures/Golem de Madeira.png", 
    actions: [{n: "Pancada de Ramo", hit: 5, dmg: "1d8+3"}, {n: "Enredar", hit: 5, dmg: "Alvo Impedido (CD 13)"}], 
    attributes: { str: 16, dex: 10, con: 16, int: 3, wis: 10, cha: 1 },
    essence: {
      id: "ess_golem_madeira", name: "Essência do Golem de Madeira", monsterSource: "Golem de Madeira", cr: "3",
      attributeBonus: { attr: "con", value: 1 },
      passive: { name: "Crescimento Natural", desc: "Recupera 1 PV por rodada se estiver sob luz solar." },
      active: { name: "Prisão de Raízes", desc: "Lança raízes que prendem um alvo a até 9m.", limit: "1/Descanso Curto" }
    },
    drops: [{ n: "Madeira Viva", d: "Madeira que continua crescendo.", r: "Incomum" }, { n: "Seiva Mística", d: "Usada em poções regenerativas.", r: "Comum" }]
  },
  { 
    id: 1052, name: "Gárgula de Fogo", type: "Elemental", cr: "3", ac: 15, hp: 60, speed: "9m/18m voo", 
    actions: [{n: "Mordida Flamejante", hit: 5, dmg: "1d6+3 fogo"}, {n: "Garras Infernais", hit: 5, dmg: "1d6+3 cortante"}], 
    attributes: { str: 15, dex: 11, con: 16, int: 6, wis: 11, cha: 7 },
    essence: {
      id: "ess_gargula_fogo", name: "Essência da Gárgula de Fogo", monsterSource: "Gárgula de Fogo", cr: "3",
      attributeBonus: { attr: "con", value: 1 },
      passive: { name: "Pele de Pedra Quente", desc: "Atacantes corpo-a-corpo recebem 1d4 de dano de fogo se atingirem você." },
      active: { name: "Voo Incendiário", desc: "Deixa um rastro de fogo ao se mover voando nesta rodada.", limit: "1/Descanso Curto" }
    },
    drops: [{ n: "Coração de Pedra Ígneo", d: "Pedra vulcânica que pulsa.", r: "Incomum" }, { n: "Fragmento de Obsidiana", d: "Vidro vulcânico afiado.", r: "Comum" }]
  },
  { 
    id: 1058, name: "Harpia da Morte", type: "Monstruosidade", cr: "3", ac: 12, hp: 50, speed: "6m/15m voo", 
    actions: [{n: "Garras Necróticas", hit: 5, dmg: "2d6+2 necrótico"}, {n: "Canto Fúnebre", hit: 0, dmg: "Alvo fica Amaldiçoado (CD 13)"}], 
    attributes: { str: 14, dex: 15, con: 14, int: 9, wis: 12, cha: 15 },
    essence: {
      id: "ess_harpia_morte", name: "Essência da Harpia da Morte", monsterSource: "Harpia da Morte", cr: "3",
      attributeBonus: { attr: "cha", value: 1 },
      passive: { name: "Voz do Além", desc: "Vantagem em testes de Intimidação." },
      active: { name: "Canto Paralisante", desc: "Um alvo deve passar em Save de Sabedoria ou ficar paralisado.", limit: "1/Descanso Longo" }
    },
    drops: [{ n: "Pena de Corvo Gigante", d: "Pena negra e pesada.", r: "Comum" }, { n: "Garra de Harpia", d: "Usada na criação de adagas.", r: "Incomum" }]
  },
  { 
    id: 1059, name: "Harpia da Tempestade", type: "Monstruosidade", cr: "3", ac: 13, hp: 55, speed: "6m/18m voo", 
    actions: [{n: "Garras Elétricas", hit: 5, dmg: "2d6+2 raio"}, {n: "Grito Trovejante", hit: 0, dmg: "2d8 som (CD 13)"}], 
    attributes: { str: 14, dex: 16, con: 14, int: 9, wis: 12, cha: 15 },
    essence: {
      id: "ess_harpia_tempestade", name: "Essência da Harpia da Tempestade", monsterSource: "Harpia da Tempestade", cr: "3",
      attributeBonus: { attr: "dex", value: 1 },
      passive: { name: "Coração da Tempestade", desc: "Resistência a dano de raio e trovão." },
      active: { name: "Impacto Rápido", desc: "Seu próximo ataque ignora resistência física.", limit: "1/Descanso Curto" }
    },
    drops: [{ n: "Pena Elétrica", d: "Pena que estala com eletricidade.", r: "Incomum" }, { n: "Garra Relampejante", d: "Material condutor.", r: "Incomum" }]
  },
  { 
    id: 1062, name: "Hidra de Gelo", type: "Monstruosidade", cr: "8", ac: 15, hp: 172, speed: "9m", imageUrl: "/textures/creatures/Hidra de Gelo.png", 
    actions: [{n: "Múltiplas Mordidas Gélidas", hit: 8, dmg: "1d10+5 frio"}, {n: "Sopro Polar", hit: 0, dmg: "6d6 frio (CD 15)"}], 
    attributes: { str: 20, dex: 12, con: 20, int: 2, wis: 10, cha: 7 },
    essence: {
      id: "ess_hidra_gelo", name: "Essência da Hidra de Gelo", monsterSource: "Hidra de Gelo", cr: "8",
      attributeBonus: { attr: "con", value: 2 },
      passive: { name: "Regeneração Criogênica", desc: "Recupera 5 PV por rodada a menos que receba dano de fogo." },
      active: { name: "Múltiplos Golpes", desc: "Realiza dois ataques básicos em vez de um nesta rodada.", limit: "1/Descanso Longo" }
    },
    drops: [{ n: "Escama de Hidra Congelada", d: "Dura como diamante.", r: "Raro" }, { n: "Coração Congelado", d: "Pulsa com um frio profundo.", r: "Raro" }]
  },
  { 
    id: 1068, name: "Lich Menor", type: "Morto-vivo", cr: "12", ac: 15, hp: 90, speed: "9m", 
    actions: [{n: "Toque Paralisante", hit: 8, dmg: "3d6 necrótico"}, {n: "Raio de Enfraquecimento", hit: 8, dmg: "2d8 necrótico + Debilitado"}], 
    attributes: { str: 11, dex: 16, con: 16, int: 20, wis: 14, cha: 16 },
    essence: {
      id: "ess_lich_menor", name: "Essência do Lich Menor", monsterSource: "Lich Menor", cr: "12",
      attributeBonus: { attr: "int", value: 2 },
      passive: { name: "Mente Imortal", desc: "Imunidade a ser enfeitiçado ou amedrontado." },
      active: { name: "Olhar do Pavor", desc: "Força alvos que olham para você a passarem em Save de Sabedoria ou fugirem.", limit: "1/Descanso Longo" }
    },
    drops: [{ n: "Fragmento de Filactéria", d: "Uma lasca de vidro contendo almas aprisionadas.", r: "Raro" }, { n: "Poeira de Lich", d: "Cinzas de um mago imortal.", r: "Lendário" }]
  },
  { id: 1069, name: "Lich Sussurrante", type: "Morto-vivo", cr: "15", ac: 16, hp: 110, speed: "9m", actions: [{n: "Toque Paralisante", hit: 10, dmg: "3d6"}], attributes: { str: 11, dex: 16, con: 16, int: 20, wis: 14, cha: 16 } },
  { id: 1070, name: "Lobo da Noite Eterna", type: "Fera", cr: "2", ac: 14, hp: 45, speed: "15m", actions: [{n: "Mordida", hit: 6, dmg: "2d6+4"}], attributes: { str: 18, dex: 15, con: 16, int: 3, wis: 12, cha: 7 } },
  { id: 1071, name: "Lobo de Gelo", type: "Fera", cr: "2", ac: 14, hp: 45, speed: "15m", actions: [{n: "Mordida", hit: 6, dmg: "2d6+4"}], attributes: { str: 18, dex: 15, con: 16, int: 3, wis: 12, cha: 7 } },
  { id: 1072, name: "Manticora Dourada", type: "Monstruosidade", cr: "4", ac: 14, hp: 80, speed: "9m/15m voo", actions: [{n: "Mordida", hit: 6, dmg: "1d8+4"}], attributes: { str: 18, dex: 16, con: 17, int: 7, wis: 12, cha: 8 } },
  { id: 1073, name: "Manticora Sombria", type: "Monstruosidade", cr: "4", ac: 14, hp: 80, speed: "9m/15m voo", actions: [{n: "Mordida", hit: 6, dmg: "1d8+4"}], attributes: { str: 18, dex: 16, con: 17, int: 7, wis: 12, cha: 8 } },
  { id: 1074, name: "Medusa de Bronze", type: "Monstruosidade", cr: "6", ac: 15, hp: 127, speed: "9m", actions: [{n: "Cabelo de Serpente", hit: 5, dmg: "1d4+2"}], attributes: { str: 10, dex: 15, con: 16, int: 12, wis: 13, cha: 15 } },
  { id: 1075, name: "Minotauro de Bronze", type: "Monstruosidade", cr: "4", ac: 15, hp: 85, speed: "12m", actions: [{n: "Machado Grande", hit: 7, dmg: "2d12+4"}], attributes: { str: 18, dex: 11, con: 16, int: 6, wis: 16, cha: 9 } },
  { id: 1076, name: "Mímico (Mimic)", type: "Monstruosidade", cr: "2", ac: 12, hp: 58, speed: "4.5m", actions: [{n: "Pseudópode", hit: 5, dmg: "1d8+3"}], attributes: { str: 17, dex: 12, con: 15, int: 5, wis: 13, cha: 8 } },
  { id: 1077, name: "Mímico Ancestral", type: "Monstruosidade", cr: "5", ac: 14, hp: 100, speed: "6m", actions: [{n: "Pseudópode", hit: 7, dmg: "2d8+4"}], attributes: { str: 19, dex: 12, con: 17, int: 5, wis: 13, cha: 8 } },
  { id: 1078, name: "Naga das Sombras", type: "Monstruosidade", cr: "4", ac: 15, hp: 75, speed: "12m", actions: [{n: "Mordida", hit: 6, dmg: "1d8+4"}], attributes: { str: 18, dex: 15, con: 16, int: 12, wis: 15, cha: 16 } },
  { id: 1079, name: "Naga de Fogo", type: "Monstruosidade", cr: "4", ac: 15, hp: 75, speed: "12m", actions: [{n: "Mordida", hit: 6, dmg: "1d8+4"}], attributes: { str: 18, dex: 15, con: 16, int: 12, wis: 15, cha: 16 } },
  { id: 1080, name: "Naga de Gelo", type: "Monstruosidade", cr: "4", ac: 15, hp: 75, speed: "12m", actions: [{n: "Mordida", hit: 6, dmg: "1d8+4"}], attributes: { str: 18, dex: 15, con: 16, int: 12, wis: 15, cha: 16 } },
  { id: 1081, name: "Naga de Veneno", type: "Monstruosidade", cr: "4", ac: 15, hp: 75, speed: "12m", actions: [{n: "Mordida", hit: 6, dmg: "1d8+4"}], attributes: { str: 18, dex: 15, con: 16, int: 12, wis: 15, cha: 16 } },
  { id: 1082, name: "Orc Herói", type: "Humanóide", cr: "5", ac: 16, hp: 90, speed: "9m", actions: [{n: "Machado Grande", hit: 8, dmg: "2d12+5"}], attributes: { str: 20, dex: 12, con: 18, int: 11, wis: 11, cha: 16 } },
  { id: 1083, name: "Quimera de Fogo", type: "Monstruosidade", cr: "6", ac: 14, hp: 114, speed: "9m/18m voo", actions: [{n: "Mordida", hit: 7, dmg: "1d10+4"}], attributes: { str: 19, dex: 11, con: 19, int: 3, wis: 14, cha: 10 } },
  { id: 1084, name: "Quimera de Gelo", type: "Monstruosidade", cr: "6", ac: 14, hp: 114, speed: "9m/18m voo", actions: [{n: "Mordida", hit: 7, dmg: "1d10+4"}], attributes: { str: 19, dex: 11, con: 19, int: 3, wis: 14, cha: 10 } },
  { id: 1085, name: "Quimera de Veneno", type: "Monstruosidade", cr: "6", ac: 14, hp: 114, speed: "9m/18m voo", actions: [{n: "Mordida", hit: 7, dmg: "1d10+4"}], attributes: { str: 19, dex: 11, con: 19, int: 3, wis: 14, cha: 10 } },
  { id: 1086, name: "Rei dos Ossos", type: "Morto-vivo", cr: "10", ac: 17, hp: 150, speed: "9m", actions: [{n: "Espada Grande", hit: 9, dmg: "4d6+5"}], imageUrl: "/textures/creatures/Rei dos Ossos.png", attributes: { str: 20, dex: 10, con: 20, int: 12, wis: 14, cha: 16 } },
  { id: 1087, name: "Sereia Abissal", type: "Monstruosidade", cr: "2", ac: 12, hp: 38, speed: "3m/12m nado", actions: [{n: "Garras", hit: 4, dmg: "1d6+2"}], imageUrl: "/textures/creatures/Sereia Abissal.png", attributes: { str: 12, dex: 14, con: 12, int: 10, wis: 10, cha: 14 } },
  { id: 1088, name: "Sereia de Gelo", type: "Monstruosidade", cr: "2", ac: 12, hp: 38, speed: "3m/12m nado", actions: [{n: "Garras", hit: 4, dmg: "1d6+2"}], imageUrl: "/textures/creatures/Sereia gelo.png", attributes: { str: 12, dex: 14, con: 12, int: 10, wis: 10, cha: 14 } },
  { id: 1089, name: "Troll de Fogo", type: "Gigante", cr: "5", ac: 15, hp: 84, speed: "9m", actions: [{n: "Mordida", hit: 7, dmg: "1d6+4"}], attributes: { str: 18, dex: 13, con: 20, int: 7, wis: 9, cha: 7 } },
  { id: 1090, name: "Troll de Gelo", type: "Gigante", cr: "5", ac: 15, hp: 84, speed: "9m", actions: [{n: "Mordida", hit: 7, dmg: "1d6+4"}], attributes: { str: 18, dex: 13, con: 20, int: 7, wis: 9, cha: 7 } },
  { id: 1091, name: "Troll de Veneno", type: "Gigante", cr: "5", ac: 15, hp: 84, speed: "9m", actions: [{n: "Mordida", hit: 7, dmg: "1d6+4"}], attributes: { str: 18, dex: 13, con: 20, int: 7, wis: 9, cha: 7 } },
  { 
    id: 1092, name: "Vampiro Antigo", type: "Morto-vivo", cr: "7", ac: 17, hp: 125, speed: "9m", 
    actions: [{n: "Mordida Ancestral", hit: 8, dmg: "2d6+5 perfurante + 1d8 necrótico"}, {n: "Olhar Paralisante", hit: 8, dmg: "Paralisado (CD 15 Sab)"}], 
    imageUrl: "/textures/creatures/Vampiro_Ancestral_ilustracao.png", 
    attributes: { str: 20, dex: 18, con: 18, int: 17, wis: 15, cha: 18 },
    essence: {
      id: "ess_vampiro_antigo", name: "Essência do Vampiro Antigo", monsterSource: "Vampiro Antigo", cr: "7",
      attributeBonus: { attr: "con", value: 2 },
      passive: { name: "Resiliência Secular", desc: "Você tem vantagem em testes de resistência contra magias de necromancia." },
      active: { name: "Vigor de Sangue", desc: "Recupere 4d6 PV instantaneamente.", limit: "1/Descanso Longo" }
    },
    drops: [{ n: "Medalhão de Família Nobre", d: "Joia antiga cravejada com pequenos rubis.", r: "Raro" }, { n: "Poeira de Caixão", d: "Pode ser usada para magias de proteção.", r: "Comum" }]
  },
  { 
    id: 1093, name: "Vampiro da Névoa", type: "Morto-vivo", cr: "6", ac: 16, hp: 95, speed: "12m", 
    actions: [{n: "Ataque de Névoa", hit: 7, dmg: "2d8+4 necrótico"}, {n: "Forma Gasosa", hit: 0, dmg: "Fica intangível por 1 rodada"}], 
    imageUrl: "/textures/creatures/Vampiro_Nevoento_ilustracao.png", 
    attributes: { str: 18, dex: 20, con: 18, int: 17, wis: 15, cha: 18 },
    essence: {
      id: "ess_vampiro_nevoa", name: "Essência do Vampiro da Névoa", monsterSource: "Vampiro da Névoa", cr: "6",
      attributeBonus: { attr: "dex", value: 2 },
      passive: { name: "Passo Enegrecido", desc: "Você ignora terreno difícil e não provoca ataques de oportunidade ao se mover." },
      active: { name: "Cortina de Névoa", desc: "Cria uma área de 6m de escuridão mágica focada em você.", limit: "1/Descanso Curto" }
    },
    drops: [{ n: "Essência Etérea", d: "Um gás azulado preso em um frasco térmico.", r: "Incomum" }, { n: "Trapos de Seda Fina", d: "Resistentes à umidade.", r: "Comum" }]
  },
  { id: 1094, name: "Wight Sombrio", type: "Morto-vivo", cr: "3", ac: 14, hp: 45, speed: "9m", actions: [{n: "Espada Longa", hit: 4, dmg: "1d8+2"}], imageUrl: "/textures/creatures/Wight .PNG", attributes: { str: 15, dex: 14, con: 16, int: 10, wis: 13, cha: 15 } },
  { id: 1095, name: "Wyvern da Morte", type: "Dragão", cr: "6", ac: 13, hp: 110, speed: "6m/24m voo", actions: [{n: "Ferrão", hit: 7, dmg: "2d6+4"}], imageUrl: "/textures/creatures/Wyvern da Morte.PNG", attributes: { str: 19, dex: 10, con: 16, int: 5, wis: 12, cha: 6 } },
  { id: 1096, name: "Wyvern de Gelo", type: "Dragão", cr: "6", ac: 13, hp: 110, speed: "6m/24m voo", actions: [{n: "Ferrão", hit: 7, dmg: "2d6+4"}], imageUrl: "/textures/creatures/Wyvern de Gelo.PNG", attributes: { str: 19, dex: 10, con: 16, int: 5, wis: 12, cha: 6 } },
  { id: 1097, name: "Wyvern de Veneno", type: "Dragão", cr: "6", ac: 13, hp: 110, speed: "6m/24m voo", actions: [{n: "Ferrão", hit: 7, dmg: "2d6+4"}], imageUrl: "/textures/creatures/Wyvern de Veneno.PNG", attributes: { str: 19, dex: 10, con: 16, int: 5, wis: 12, cha: 6 } },
  { id: 1098, name: "Wyvern Elétrica", type: "Dragão", cr: "6", ac: 13, hp: 110, speed: "6m/24m voo", actions: [{n: "Ferrão", hit: 7, dmg: "2d6+4"}], imageUrl: "/textures/creatures/Wyvern Elétrica.PNG", attributes: { str: 19, dex: 10, con: 16, int: 5, wis: 12, cha: 6 } },
  { id: 1099, name: "Wyvern Venenosa", type: "Dragão", cr: "6", ac: 13, hp: 110, speed: "6m/24m voo", actions: [{n: "Ferrão", hit: 7, dmg: "2d6+4"}], attributes: { str: 19, dex: 10, con: 16, int: 5, wis: 12, cha: 6 } },

  // --- GOBLINS ---
  { id: 1100, name: "Bugbear Assassino", type: "Humanóide", cr: "3", ac: 15, hp: 45, speed: "9m", actions: [{n: "Maça Estrela", hit: 5, dmg: "2d8+3"}], imageUrl: "/textures/creatures/Bugbear_Assassino_20260407183009.png", attributes: { str: 17, dex: 14, con: 14, int: 11, wis: 12, cha: 11 } },
  { id: 1101, name: "Bugbear Bruto", type: "Humanóide", cr: "2", ac: 16, hp: 27, speed: "9m", actions: [{n: "Maça Estrela", hit: 4, dmg: "2d8+2"}], imageUrl: "/textures/creatures/Bugbear_Bruto_20260407162136.png", attributes: { str: 15, dex: 14, con: 13, int: 8, wis: 11, cha: 9 } },
  { id: 1102, name: "Bugbear Chefe da Tribo", type: "Humanóide", cr: "4", ac: 17, hp: 65, speed: "9m", actions: [{n: "Maça Estrela", hit: 6, dmg: "2d8+4"}], imageUrl: "/textures/creatures/Bugbear_Chefe_da_Tribo_20260407162331.png", attributes: { str: 18, dex: 14, con: 16, int: 11, wis: 12, cha: 11 } },
  { id: 1103, name: "Bugbear Sombrio", type: "Humanóide", cr: "3", ac: 15, hp: 45, speed: "9m", actions: [{n: "Maça Estrela", hit: 5, dmg: "2d8+3"}], imageUrl: "/textures/creatures/Bugbear_Sombrio_20260407164940.png", attributes: { str: 17, dex: 14, con: 14, int: 11, wis: 12, cha: 11 } },
  { 
    id: 1104, name: "Goblin Armadilheiro", type: "Humanóide", cr: "1/2", ac: 15, hp: 10, speed: "9m", 
    actions: [{n: "Cimitarra", hit: 4, dmg: "1d6+2"}, {n: "Rede", hit: 4, dmg: "Alvo Impedido (CD 12)"}], 
    attributes: { str: 8, dex: 14, con: 10, int: 10, wis: 8, cha: 8 },
    essence: {
      id: "ess_goblin_armadilheiro", name: "Essência do Goblin Armadilheiro", monsterSource: "Goblin Armadilheiro", cr: "1/2",
      attributeBonus: { attr: "dex", value: 1 },
      passive: { name: "Cuidado com os Pés", desc: "Vantagem em testes para detectar armadilhas." },
      active: { name: "Suprimento de Armadilha", desc: "Cria uma armadilha simples num quadrado adjacente.", limit: "1/Descanso Curto" }
    },
    drops: [{ n: "Gancho de Ferro", d: "Usado em escaladas ou armadilhas.", r: "Comum" }, { n: "Rede de Pesca Velha", d: "Pode ser reparada.", r: "Comum" }]
  },
  { 
    id: 1111, name: "Goblin Xamã", type: "Humanóide", cr: "1", ac: 12, hp: 15, speed: "9m", 
    actions: [{n: "Cajado", hit: 2, dmg: "1d6"}, {n: "Choque", hit: 4, dmg: "1d10 raio"}], 
    imageUrl: "/textures/creatures/Goblin_Xamã.png",
    attributes: { str: 8, dex: 12, con: 10, int: 12, wis: 14, cha: 10 },
    essence: {
      id: "ess_goblin_xama", name: "Essência do Goblin Xamã", monsterSource: "Goblin Xamã", cr: "1",
      attributeBonus: { attr: "wis", value: 1 },
      passive: { name: "Conexão Espiritual", desc: "Resistência a dano de raio." },
      active: { name: "Benção Tribal", desc: "Concede +1d4 no próximo ataque de um aliado próximo.", limit: "1/Descanso Curto" }
    },
    drops: [{ n: "Cajado Entalhado", d: "Um cajado com símbolos goblinoides.", r: "Comum" }, { n: "Pena Colorida", d: "Usada em rituais.", r: "Comum" }]
  },
  { id: 1112, name: "Hobgoblin Arqueiro", type: "Humanóide", cr: "1/2", ac: 15, hp: 11, speed: "9m", actions: [{n: "Arco Longo", hit: 3, dmg: "1d8+1"}], imageUrl: "/textures/creatures/Hobgoblin_Arqueiro_20260329123110.png", attributes: { str: 13, dex: 12, con: 12, int: 10, wis: 10, cha: 9 } },
  { id: 1113, name: "Hobgoblin Capitão", type: "Humanóide", cr: "3", ac: 17, hp: 39, speed: "9m", actions: [{n: "Espada Grande", hit: 4, dmg: "2d6+2"}], imageUrl: "/textures/creatures/Hobgoblin_Capitão_20260329123636.png", attributes: { str: 15, dex: 14, con: 14, int: 12, wis: 10, cha: 13 } },
  { id: 1114, name: "Hobgoblin Cavaleiro Pesado", type: "Humanóide", cr: "2", ac: 18, hp: 22, speed: "9m", actions: [{n: "Espada Longa", hit: 3, dmg: "1d8+1"}], imageUrl: "/textures/creatures/Hobgoblin_Cavaleiro_Pesado_20260407180501.png", attributes: { str: 13, dex: 12, con: 12, int: 10, wis: 10, cha: 9 } },
  { id: 1115, name: "Hobgoblin Devoto", type: "Humanóide", cr: "1", ac: 15, hp: 15, speed: "9m", actions: [{n: "Maça", hit: 3, dmg: "1d6+1"}], imageUrl: "/textures/creatures/Hobgoblin_Devoto_20260407181128.png", attributes: { str: 13, dex: 10, con: 12, int: 10, wis: 14, cha: 10 } },
  { id: 1116, name: "Hobgoblin Soldado", type: "Humanóide", cr: "1/2", ac: 18, hp: 11, speed: "9m", actions: [{n: "Espada Longa", hit: 3, dmg: "1d8+1"}], imageUrl: "/textures/creatures/Hobgoblin_Soldado.png", attributes: { str: 13, dex: 12, con: 12, int: 10, wis: 10, cha: 9 } },

  // --- VAMPIROS ---
  { 
    id: 1200, name: "Arquiduque Vampiro", type: "Morto-vivo", cr: "7", ac: 18, hp: 120, speed: "12m", 
    actions: [{n: "Mordida de Sangue", hit: 8, dmg: "2d6+5 necrótico"}, {n: "Espada das Sombras", hit: 8, dmg: "1d10+5 cortante"}, {n: "Comando Tirânico", hit: 0, dmg: "CD 15 Sab ou Amedrontado"}], 
    attributes: { str: 20, dex: 18, con: 18, int: 16, wis: 14, cha: 18 },
    essence: {
      id: "ess_arquiduque_vampiro", name: "Essência do Arquiduque Vampiro", monsterSource: "Arquiduque Vampiro", cr: "7",
      attributeBonus: { attr: "cha", value: 2 },
      passive: { name: "Majestade Sombria", desc: "Criaturas têm desvantagem em ataques se você estiver com vida cheia." },
      active: { name: "Dominação Hipnótica", desc: "Força um alvo a realizar um ataque contra um aliado dele.", limit: "1/Descanso Longo" }
    },
    drops: [{ n: "Cálice de Ouro Maldito", d: "Item valioso imbuído de mágica de sangue.", r: "Raro" }, { n: "Manto de Veludo das Sombras", d: "Concede bônus em furtividade.", r: "Incomum" }]
  },
  { 
    id: 1201, name: "Arquimago Vampiro", type: "Morto-vivo", cr: "7", ac: 15, hp: 95, speed: "9m", 
    actions: [{n: "Toque Vampírico", hit: 8, dmg: "3d6 necrótico (Cura)"}, {n: "Raio Enfraquecedor", hit: 8, dmg: "2d8 necrótico"}], 
    imageUrl: "/textures/creatures/Vampiro_Arcano_ilustracao.png", 
    attributes: { str: 10, dex: 16, con: 14, int: 20, wis: 16, cha: 16 },
    essence: {
      id: "ess_arquimago_vampiro", name: "Essência do Arquimago Vampiro", monsterSource: "Arquimago Vampiro", cr: "7",
      attributeBonus: { attr: "int", value: 2 },
      passive: { name: "Suficiência Arcana", desc: "Você pode usar INT para testes de resistência de Sabedoria." },
      active: { name: "Elo Sanguíneo", desc: "Seu próximo feitiço de dano cura você em metade do valor causado.", limit: "1/Descanso Curto" }
    },
    drops: [{ n: "Grimório de Pele Humana", d: "Contém magias proibidas de necromancia.", r: "Raro" }, { n: "Pó de Sangue Cristalizado", d: "Componente mágico potente.", r: "Incomum" }]
  },
  { 
    id: 1202, name: "Besta de Caverna Vampírica", type: "Monstruosidade", cr: "4", ac: 14, hp: 75, speed: "12m", 
    actions: [{n: "Garra Lacerante", hit: 6, dmg: "2d6+4 cortante"}, {n: "Bote", hit: 6, dmg: "1d8+4 e derruba (CD 13 For)"}], 
    imageUrl: "/textures/creatures/Vampiro_Bestial_ilustracao.png", 
    attributes: { str: 18, dex: 14, con: 16, int: 3, wis: 12, cha: 5 },
    essence: {
      id: "ess_besta_vampirica", name: "Essência da Besta Vampírica", monsterSource: "Besta de Caverna Vampírica", cr: "4",
      attributeBonus: { attr: "str", value: 1 },
      passive: { name: "Predador Cego", desc: "Sentido cego em 9m se houver sangue no ambiente." },
      active: { name: "Frenesi de Sangue", desc: "Realize um ataque de garra como ação bônus nesta rodada.", limit: "1/Descanso Curto" }
    },
    drops: [{ n: "Couro Rígido", d: "Material resistente para armaduras.", r: "Comum" }, { n: "Garra Infectada", d: "Pode ser usada para criar venenos.", r: "Incomum" }]
  },
  { 
    id: 1203, name: "Cavaleiro Vampiro", type: "Morto-vivo", cr: "6", ac: 18, hp: 105, speed: "9m", 
    actions: [{n: "Espada Longa Profana", hit: 7, dmg: "1d8+4 cortante + 1d6 necrótico"}, {n: "Escudada", hit: 7, dmg: "1d6+4 e atordoa (CD 14 Con)"}], 
    imageUrl: "/textures/creatures/Vampiro_Cavaleiro_Negro_ilustracao.png", 
    attributes: { str: 18, dex: 14, con: 18, int: 12, wis: 12, cha: 14 },
    essence: {
      id: "ess_cavaleiro_vampiro", name: "Essência do Cavaleiro Vampiro", monsterSource: "Cavaleiro Vampiro", cr: "6",
      attributeBonus: { attr: "con", value: 2 },
      passive: { name: "Honra Imortal", desc: "Você recebe +2 em testes de resistência contra medo e expulsar mortos-vivos." },
      active: { name: "Desafio de Sangue", desc: "Obriga um inimigo a focar ataques em você por 1 rodada.", limit: "1/Descanso Curto" }
    },
    drops: [{ n: "Fragmento de Armadura Negra", d: "Metal frio que absorve luz.", r: "Incomum" }, { n: "Espada Quebrada Antiga", d: "Ainda retém vestígios de mágica.", r: "Incomum" }]
  },
  { 
    id: 1204, name: "Cria de Vampiro", type: "Morto-vivo", cr: "4", ac: 15, hp: 65, speed: "9m", 
    actions: [{n: "Mordida Faminta", hit: 6, dmg: "1d6+3 perfurante + 2d6 necrótico (Cura PV igual ao dano necrótico)"}, {n: "Garras Multiattaque", hit: 6, dmg: "2d4+3 cortante"}], 
    attributes: { str: 16, dex: 16, con: 16, int: 11, wis: 10, cha: 12 },
    essence: {
      id: "ess_cria_vampira", name: "Essência da Cria de Vampiro", monsterSource: "Cria de Vampiro", cr: "4",
      attributeBonus: { attr: "dex", value: 1 },
      passive: { name: "Regeneração de Cria", desc: "Recupera 5 PV no início do seu turno se não estiver no sol." },
      active: { name: "Escalar como Aranha", desc: "Pode escalar superfícies verticais sem testes por 1 minuto.", limit: "1/Descanso Curto" }
    },
    drops: [{ n: "Presa de Vampiro", d: "Rara e afiada.", r: "Incomum" }, { n: "Anel de Sinete Velho", d: "Pode pertencer a uma família nobre.", r: "Comum" }]
  },
  { 
    id: 1205, name: "Deus Vampiro Primordial", type: "Morto-vivo", cr: "7", ac: 19, hp: 150, speed: "12m", 
    actions: [
      {n: "Aniquilação Vital", hit: 10, dmg: "4d10+6 necrótico (Cura PV)"}, 
      {n: "Explosão de Sangue Negro", hit: 0, dmg: "Área de 9m: 8d6 necrótico (CD 17 Des p/ metade)"}
    ], 
    imageUrl: "/textures/creatures/Deus Vampiro Primordial.png", 
    attributes: { str: 22, dex: 18, con: 22, int: 18, wis: 18, cha: 22 },
    essence: {
      id: "ess_deus_vampiro", name: "Essência do Deus Vampiro", monsterSource: "Deus Vampiro Primordial", cr: "7",
      attributeBonus: { attr: "cha", value: 2 },
      passive: { name: "Divindade Pálida", desc: "Você tem resistência a dano radiante, necrótico e psíquico." },
      active: { name: "Comando Divino", desc: "O alvo deve ser bem-sucedido em um salvamento de Sabedoria (CD 17) ou ficará sob seu controle por 1 min.", limit: "1/Descanso Longo" }
    },
    drops: [
      { n: "Coração de Éter Sombrio", d: "Pulsa com uma energia que desafia a morte.", r: "Lendário" },
      { n: "Sangue Divino", d: "Líquido prateado que nunca seca.", r: "Raro" }
    ]
  },
  { 
    id: 1206, name: "Dragão Vampiro Ancião", type: "Morto-vivo", cr: "7", ac: 18, hp: 140, speed: "12m/24m voo", 
    actions: [{n: "Bote de Sangue", hit: 9, dmg: "2d10+6 perfurante"}, {n: "Sopro de Sangue Podre", hit: 0, dmg: "8d6 necrótico (CD 16)"}], 
    attributes: { str: 24, dex: 12, con: 22, int: 14, wis: 14, cha: 18 },
    essence: {
      id: "ess_dragao_vampiro", name: "Essência do Dragão Vampiro", monsterSource: "Dragão Vampiro Ancião", cr: "7",
      attributeBonus: { attr: "str", value: 2 },
      passive: { name: "Escamas Drenantes", desc: "Atacantes corpo a corpo recebem 1d4 de dano necrótico ao te atingir." },
      active: { name: "Rugido Sangrento", desc: "Causa medo em área e cura você em 10 PV por inimigo afetado.", limit: "1/Descanso Longo" }
    },
    drops: [{ n: "Escala Dragônica Púrpura", d: "Material para armaduras lendárias.", r: "Raro" }, { n: "Garra Titânica", d: "Pode ser forjada em uma arma devastadora.", r: "Raro" }]
  },
  { 
    id: 1207, name: "Espreitador Noturno", type: "Morto-vivo", cr: "5", ac: 16, hp: 70, speed: "12m", 
    actions: [{n: "Lâmina Silenciosa", hit: 7, dmg: "2d6+4 cortante"}, {n: "Passo Sombrio", hit: 0, dmg: "Teletransporte de 18m"}], 
    attributes: { str: 14, dex: 20, con: 16, int: 10, wis: 14, cha: 12 },
    essence: {
      id: "ess_espreitador_noturno", name: "Essência do Espreitador Noturno", monsterSource: "Espreitador Noturno", cr: "5",
      attributeBonus: { attr: "dex", value: 2 },
      passive: { name: "Invisibilidade Natural", desc: "Vantagem em testes de Furtividade na penumbra." },
      active: { name: "Golpe de Misericórdia", desc: "Seu ataque causa +2d10 se o alvo estiver surpreso.", limit: "1/Descanso Curto" }
    },
    drops: [{ n: "Capa de Sombras", d: "Parece feita de fumaça sólida.", r: "Incomum" }, { n: "Adaga Envenenada", d: "Veneno que nunca seca.", r: "Incomum" }]
  },
  { 
    id: 1208, name: "Feiticeiro Carmesim", type: "Morto-vivo", cr: "5", ac: 14, hp: 75, speed: "9m", 
    actions: [{n: "Explosão Sanguínea", hit: 8, dmg: "3d8 necrótico"}, {n: "Escudo de Sangue", hit: 0, dmg: "Ganha 15 PV temp"}], 
    attributes: { str: 10, dex: 16, con: 14, int: 16, wis: 12, cha: 20 },
    essence: {
      id: "ess_feiticeiro_carmesim", name: "Essência do Feiticeiro Carmesim", monsterSource: "Feiticeiro Carmesim", cr: "5",
      attributeBonus: { attr: "cha", value: 2 },
      passive: { name: "Sifão Vital", desc: "Cura 2 PV sempre que lançar uma magia de dano." },
      active: { name: "Onda Carmesim", desc: "Explosão de 3m que drena vida de todos ao redor.", limit: "1/Descanso Curto" }
    },
    drops: [{ n: "Amuleto de Rubi", d: "Aumenta o poder de magias de sangue.", r: "Incomum" }, { n: "Manto Vermelho Velho", d: "Ainda está seco apesar do sangue.", r: "Comum" }]
  },
  { 
    id: 1209, name: "General Vampiro", type: "Morto-vivo", cr: "6", ac: 18, hp: 110, speed: "9m", 
    actions: [{n: "Machado de Guerra", hit: 8, dmg: "1d12+5 cortante"}, {n: "Grito de Comando", hit: 0, dmg: "Aliados ganham +1d6 no ataque"}], 
    attributes: { str: 20, dex: 14, con: 18, int: 14, wis: 14, cha: 16 },
    essence: {
      id: "ess_general_vampiro", name: "Essência do General Vampiro", monsterSource: "General Vampiro", cr: "6",
      attributeBonus: { attr: "str", value: 2 },
      passive: { name: "Presença Galvânica", desc: "Aliados a 3m ganham +1 na CA." },
      active: { name: "Ataque Coordenado", desc: "Você e um aliado atacam simultaneamente o mesmo alvo.", limit: "1/Descanso Curto" }
    },
    drops: [{ n: "Insígnia Militar de Prata", d: "Símbolo de comando antigo.", r: "Incomum" }, { n: "Placas de Armadura Forte", d: "Podem ser restauradas.", r: "Incomum" }]
  },
  { 
    id: 1210, name: "Imperador Vampiro", type: "Morto-vivo", cr: "7", ac: 19, hp: 130, speed: "9m", 
    actions: [{n: "Cetro Real", hit: 9, dmg: "2d8+6 concussão + 1d8 psíquico"}, {n: "Olhar Imperial", hit: 9, dmg: "Fascinado (CD 16 Sab)"}], 
    imageUrl: "/textures/creatures/Imperador Vampiro.png", 
    attributes: { str: 22, dex: 16, con: 20, int: 18, wis: 16, cha: 22 },
    essence: {
      id: "ess_imperador_vampiro", name: "Essência do Imperador Vampiro", monsterSource: "Imperador Vampiro", cr: "7",
      attributeBonus: { attr: "cha", value: 2 },
      passive: { name: "Vontade Soberana", desc: "Imunidade a ser enfeitiçado ou amedrontado." },
      active: { name: "Kneel!", desc: "Força todos os inimigos a 6m a ficarem caídos (CD 16 For).", limit: "1/Descanso Longo" }
    },
    drops: [{ n: "Cetro de Ouro e Safira", d: "Extremamente valioso.", r: "Épico" }, { n: "Anel do Soberano", d: "Permite dar comandos simples a mortos-vivos.", r: "Raro" }]
  },
  { 
    id: 1211, name: "Lich Vampiro", type: "Morto-vivo", cr: "7", ac: 16, hp: 100, speed: "9m", 
    actions: [{n: "Toque Gélido da Morte", hit: 9, dmg: "4d6 frio"}, {n: "Drenar Vida", hit: 9, dmg: "3d8 necrótico (Cura)"}], 
    attributes: { str: 10, dex: 16, con: 16, int: 22, wis: 18, cha: 18 },
    essence: {
      id: "ess_lich_vampiro", name: "Essência do Lich Vampiro", monsterSource: "Lich Vampiro", cr: "7",
      attributeBonus: { attr: "int", value: 2 },
      passive: { name: "Filactéria de Sangue", desc: "Você tem resistência a dano de armas não-mágicas." },
      active: { name: "Nuvem de Decomposição", desc: "Área de 6m que causa 2d6 dano necrótico todo turno.", limit: "1/Descanso Longo" }
    },
    drops: [{ n: "Fragmento de Filactéria", d: "Um cristal que pulsa com luz fria.", r: "Raro" }, { n: "Ossos de Cristal", d: "Podem ser usados como foco arcano.", r: "Incomum" }]
  },
  { 
    id: 1212, name: "Lorde Vampiro", type: "Morto-vivo", cr: "6", ac: 17, hp: 110, speed: "9m", 
    actions: [{n: "Mordida Cruel", hit: 8, dmg: "1d8+5 perfurante + 2d6 necrótico"}, {n: "Garras de Aço", hit: 8, dmg: "2d6+5 cortante"}], 
    imageUrl: "/textures/creatures/Vampiro_Senhor_da_Noite_ilustracao.png", 
    attributes: { str: 20, dex: 18, con: 18, int: 16, wis: 14, cha: 18 },
    essence: {
      id: "ess_lorde_vampiro", name: "Essência do Lorde Vampiro", monsterSource: "Lorde Vampiro", cr: "6",
      attributeBonus: { attr: "str", value: 2 },
      passive: { name: "Elegância Mortal", desc: "Sua CA aumenta em +1 se você estiver usando apenas armaduras leves." },
      active: { name: "Sede de Sangue", desc: "Todos os seus ataques curam você em 5 PV nesta rodada.", limit: "1/Descanso Curto" }
    },
    drops: [{ n: "Manto de Veludo Nobre", d: "Confortável e elegante.", r: "Incomum" }, { n: "Chave de Mansão Antiga", d: "Pode abrir segredos esquecidos.", r: "Comum" }]
  },
  { 
    id: 1213, name: "Matador de Almas", type: "Morto-vivo", cr: "5", ac: 16, hp: 85, speed: "12m", 
    actions: [{n: "Lâmina da Alma", hit: 8, dmg: "2d8+5 psíquico"}, {n: "Corte Abissal", hit: 8, dmg: "1d10+5 cortante"}], 
    attributes: { str: 20, dex: 18, con: 18, int: 12, wis: 14, cha: 16 },
    essence: {
      id: "ess_matador_almas", name: "Essência do Matador de Almas", monsterSource: "Matador de Almas", cr: "5",
      attributeBonus: { attr: "str", value: 1 },
      passive: { name: "Caçador de Espíritos", desc: "Você pode ver criaturas invisíveis ou no plano etéreo a até 9m." },
      active: { name: "Golpe Disruptivo", desc: "O próximo ataque cancela a concentração do alvo automaticamente.", limit: "1/Descanso Curto" }
    },
    drops: [{ n: "Essência de Alma Aprisionada", d: "Uma joia que brilha fracamente.", r: "Incomum" }, { n: "Lâmina de Ébano Quebrada", d: "Extremamente afiada.", r: "Incomum" }]
  },
  { 
    id: 1214, name: "Rainha do Gelo Sanguíneo", type: "Morto-vivo", cr: "6", ac: 17, hp: 100, speed: "9m", 
    actions: [{n: "Toque Gélido", hit: 8, dmg: "4d6 frio + Lento"}, {n: "Estaca de Gelo Sangrenta", hit: 8, dmg: "2d10 perfurante"}], 
    attributes: { str: 14, dex: 18, con: 18, int: 18, wis: 16, cha: 22 },
    essence: {
      id: "ess_rainha_gelo", name: "Essência da Rainha do Gelo Sanguíneo", monsterSource: "Rainha do Gelo Sanguíneo", cr: "6",
      attributeBonus: { attr: "cha", value: 2 },
      passive: { name: "Coração de Gelo", desc: "Imunidade a dano de frio e resistência a fogo." },
      active: { name: "Prisão Ártica", desc: "Congela o chão em 6m, impedindo movimento inimigo.", limit: "1/Descanso Curto" }
    },
    drops: [{ n: "Tiara de Cristal de Gelo", d: "Fria ao toque.", r: "Raro" }, { n: "Lágrima de Sangue Congelada", d: "Componente para alquimia polar.", r: "Incomum" }]
  },
  { 
    id: 1215, name: "Sanguinário Rastejante", type: "Morto-vivo", cr: "4", ac: 14, hp: 60, speed: "12m", 
    actions: [{n: "Mordida de Parasita", hit: 6, dmg: "1d8+4 perfurante + Dreno (5 PV/rodada)"}, {n: "Salto", hit: 6, dmg: "Agarra o alvo (CD 13)"}], 
    imageUrl: "/textures/creatures/Vampiro_Parasita_ilustracao.png", 
    attributes: { str: 18, dex: 16, con: 16, int: 3, wis: 12, cha: 7 },
    essence: {
      id: "ess_sanguinario", name: "Essência do Sanguinário Rastejante", monsterSource: "Sanguinário Rastejante", cr: "4",
      attributeBonus: { attr: "str", value: 1 },
      passive: { name: "Aderência", desc: "Você pode se fixar em paredes sem usar as mãos." },
      active: { name: "Drenagem Voraz", desc: "Dobra o dano de dreno nesta rodada.", limit: "1/Descanso Curto" }
    },
    drops: [{ n: "Glândula de Drenagem", d: "Cheia de anticoagulante.", r: "Comum" }, { n: "Pedaço de Carne Pálida", d: "Repugnante.", r: "Comum" }]
  },
  { 
    id: 1216, name: "Senhor dos Morcegos", type: "Morto-vivo", cr: "6", ac: 16, hp: 95, speed: "9m/18m voo", 
    actions: [{n: "Mordida Aérea", hit: 8, dmg: "1d8+5 perfurante"}, {n: "Enxame de Asas", hit: 0, dmg: "Cria cobertura para aliados"}], 
    imageUrl: "/textures/creatures/Vampiro_Lich_ilustracao.png", 
    attributes: { str: 16, dex: 20, con: 16, int: 14, wis: 14, cha: 18 },
    essence: {
      id: "ess_senhor_morcegos", name: "Essência do Senhor dos Morcegos", monsterSource: "Senhor dos Morcegos", cr: "6",
      attributeBonus: { attr: "dex", value: 2 },
      passive: { name: "Ecolocalização", desc: "Percepção às cegas a até 18m." },
      active: { name: "Forma de Enxame", desc: "Você se torna um enxame por 1 rodada, recebendo metade do dano físico.", limit: "1/Descanso Longo" }
    },
    drops: [{ n: "Asas de Morcego Gigante", d: "Material flexível e resistente.", r: "Incomum" }, { n: "Dente de Sabre Vampírico", d: "Muito longo.", r: "Incomum" }]
  },
  { 
    id: 1217, name: "Vampiro Ladrão de Sangue", type: "Morto-vivo", cr: "7", ac: 15, hp: 110, speed: "12m", 
    actions: [{n: "Mordida de Precisão", hit: 9, dmg: "1d10+5 perfurante + Rouba Cura"}, {n: "Pancada Veloz", hit: 9, dmg: "1d8+5"}], 
    imageUrl: "/textures/creatures/Vampiro_de_Sangue_Puro_ilustracao.png", 
    attributes: { str: 18, dex: 20, con: 18, int: 12, wis: 12, cha: 16 },
    essence: {
      id: "ess_ladrao_sangue", name: "Essência do Vampiro Ladrão de Sangue", monsterSource: "Vampiro Ladrão de Sangue", cr: "7",
      attributeBonus: { attr: "dex", value: 2 },
      passive: { name: "Metabolismo Acelerado", desc: "Recupera 10 PV sempre que matar uma criatura." },
      active: { name: "Golpe Faminto", desc: "Seu ataque ignora CA de armaduras nesta rodada.", limit: "1/Descanso Curto" }
    },
    drops: [{ n: "Frasco de Sangue Puro", d: "Pode ser bebido para curar 2d10 PV.", r: "Incomum" }, { n: "Adaga de Coleta", d: "Lâmina oca.", r: "Incomum" }]
  },
  { 
    id: 1218, name: "Vampiro Mentalista", type: "Morto-vivo", cr: "5", ac: 14, hp: 80, speed: "9m", 
    actions: [{n: "Rajada Mental", hit: 8, dmg: "4d6 psíquico"}, {n: "Confusão", hit: 0, dmg: "Alvo ataca aleatoriamente (CD 15)"}], 
    attributes: { str: 10, dex: 16, con: 16, int: 20, wis: 16, cha: 20 },
    essence: {
      id: "ess_vampiro_mentalista", name: "Essência do Vampiro Mentalista", monsterSource: "Vampiro Mentalista", cr: "5",
      attributeBonus: { attr: "int", value: 2 },
      passive: { name: "Escudo Psíquico", desc: "Resistência a dano psíquico." },
      active: { name: "Leitura de Intenção", desc: "Dê desvantagem no próximo ataque do inimigo contra você.", limit: "1/Descanso Curto" }
    },
    drops: [{ n: "Cristal Mental Oculto", d: "Amplifica ondas cerebrais.", r: "Incomum" }, { n: "Pergaminho de Dominação", d: "Instruções cruéis.", r: "Comum" }]
  },
  { 
    id: 1219, name: "Vampiro Sombrio", type: "Morto-vivo", cr: "6", ac: 16, hp: 100, speed: "9m", 
    actions: [{n: "Garra de Sombra", hit: 8, dmg: "2d8+5 necrótico"}, {n: "Abraço do Vazio", hit: 8, dmg: "Dreno (CD 14)"}], 
    imageUrl: "/textures/creatures/Vampiro_das_Sombras_ilustracao.png", 
    attributes: { str: 18, dex: 18, con: 18, int: 14, wis: 14, cha: 16 },
    essence: {
      id: "ess_vampiro_sombrio", name: "Essência do Vampiro Sombrio", monsterSource: "Vampiro Sombrio", cr: "6",
      attributeBonus: { attr: "dex", value: 1 },
      passive: { name: "Corpo Enegrecido", desc: "Vantagem em testes de Furtividade e DES em sombras." },
      active: { name: "Susto Sombrio", desc: "Torna-se invisível por 1 rodada após receber dano.", limit: "1/Descanso Curto" }
    },
    drops: [{ n: "Essência de Sombras", d: "Fumaça que não se dispersa.", r: "Incomum" }, { n: "Pano de Manto Sombrio", d: "Tecido quase invisível no escuro.", r: "Incomum" }]
  },
  // --- NOVOS TOKENS ---
  { id: 2000, name: "Alex", type: "Humanóide", cr: "1", ac: 15, hp: 30, speed: "9m", actions: [{n: "Ataque", hit: 5, dmg: "1d8+3"}], imageUrl: "/textures/creatures/alex.png", attributes: { str: 14, dex: 14, con: 14, int: 10, wis: 10, cha: 10 } },
  { id: 2001, name: "Bugbear Assassino", type: "Humanóide", cr: "3", ac: 15, hp: 45, speed: "9m", actions: [{n: "Punhalada", hit: 6, dmg: "2d6+4"}], imageUrl: "/textures/creatures/Bugbear_Assassino_20260407183009.png", attributes: { str: 14, dex: 16, con: 14, int: 10, wis: 12, cha: 10 } },
  { id: 2002, name: "Bugbear Bruto", type: "Humanóide", cr: "2", ac: 14, hp: 50, speed: "9m", actions: [{n: "Maça Estrela", hit: 5, dmg: "2d8+3"}], imageUrl: "/textures/creatures/Bugbear_Bruto_20260407162136.png", attributes: { str: 16, dex: 12, con: 16, int: 8, wis: 10, cha: 8 } },
  { id: 2003, name: "Bugbear Chefe da Tribo", type: "Humanóide", cr: "4", ac: 16, hp: 65, speed: "9m", actions: [{n: "Machado de Batalha", hit: 6, dmg: "2d10+4"}], imageUrl: "/textures/creatures/Bugbear_Chefe_da_Tribo_20260407162331.png", attributes: { str: 18, dex: 14, con: 16, int: 10, wis: 12, cha: 12 } },
  { id: 2004, name: "Bugbear Rei dos Pesadelos", type: "Humanóide", cr: "6", ac: 17, hp: 90, speed: "9m", actions: [{n: "Lâmina do Pesadelo", hit: 8, dmg: "3d10+5"}], imageUrl: "/textures/creatures/Bugbear_Rei_dos_Pesadelos_20260407182344.png", attributes: { str: 20, dex: 14, con: 18, int: 12, wis: 14, cha: 14 } },
  { id: 2005, name: "Bugbear Sombrio", type: "Humanóide", cr: "3", ac: 15, hp: 45, speed: "9m", actions: [{n: "Ataque Furtivo", hit: 6, dmg: "2d6+4"}], imageUrl: "/textures/creatures/Bugbear_Sombrio_20260407164940.png", attributes: { str: 14, dex: 16, con: 14, int: 10, wis: 12, cha: 10 } },
  { id: 2006, name: "Carol", type: "Humanóide", cr: "1", ac: 14, hp: 25, speed: "9m", actions: [{n: "Magia", hit: 5, dmg: "1d10+3"}], imageUrl: "/textures/creatures/carol.PNG", attributes: { str: 10, dex: 14, con: 12, int: 16, wis: 12, cha: 14 } },
  { id: 2007, name: "Draconato", type: "Humanóide", cr: "2", ac: 16, hp: 35, speed: "9m", actions: [{n: "Espada Larga", hit: 5, dmg: "2d6+3"}], imageUrl: "/textures/creatures/draconato.png", attributes: { str: 16, dex: 10, con: 14, int: 10, wis: 10, cha: 12 } },
  { id: 2008, name: "Esfige", type: "Monstruosidade", cr: "11", ac: 17, hp: 136, speed: "9m/18m voo", actions: [{n: "Garras", hit: 9, dmg: "2d10+5"}], imageUrl: "/textures/creatures/esfige.PNG", attributes: { str: 18, dex: 15, con: 18, int: 18, wis: 18, cha: 18 } },
  { id: 2009, name: "Goblin Armadilheiro", type: "Humanóide", cr: "1/2", ac: 14, hp: 12, speed: "9m", actions: [{n: "Armadilha", hit: 4, dmg: "1d6+2"}], imageUrl: "/textures/creatures/Goblin_Armadilheiro (1)_20260326114451 (1).png", attributes: { str: 8, dex: 16, con: 12, int: 12, wis: 10, cha: 8 } },
  { id: 2010, name: "Goblin Arqueiro Elite", type: "Humanóide", cr: "1/2", ac: 14, hp: 15, speed: "9m", actions: [{n: "Arco Curto", hit: 5, dmg: "1d6+3"}], imageUrl: "/textures/creatures/Goblin_Arqueiro_20260329120529.png", attributes: { str: 8, dex: 16, con: 12, int: 10, wis: 10, cha: 8 } },
  { id: 2011, name: "Goblin Berserker", type: "Humanóide", cr: "1", ac: 13, hp: 25, speed: "9m", actions: [{n: "Machadinha", hit: 5, dmg: "1d6+3"}], imageUrl: "/textures/creatures/Goblin_Berserker.png", attributes: { str: 14, dex: 14, con: 14, int: 8, wis: 8, cha: 8 } },
  { id: 2012, name: "Goblin Escravo", type: "Humanóide", cr: "0", ac: 10, hp: 5, speed: "9m", actions: [{n: "Soco", hit: 2, dmg: "1"}], imageUrl: "/textures/creatures/Goblin_Escravo-1_20260329122440.png", attributes: { str: 8, dex: 10, con: 10, int: 8, wis: 8, cha: 8 } },
  { id: 2013, name: "Goblin Guerreiro Pesado", type: "Humanóide", cr: "1/2", ac: 16, hp: 18, speed: "7.5m", actions: [{n: "Espada Curta", hit: 4, dmg: "1d6+2"}], imageUrl: "/textures/creatures/Goblin_Guerreiro.png", attributes: { str: 12, dex: 12, con: 14, int: 10, wis: 8, cha: 8 } },
  { id: 2014, name: "Goblin Lich", type: "Morto-vivo", cr: "5", ac: 14, hp: 60, speed: "9m", actions: [{n: "Toque Necrótico", hit: 7, dmg: "3d6+4"}], imageUrl: "/textures/creatures/Goblin_Lich_(Espírito_Corrompido)_20260407181819.png", attributes: { str: 8, dex: 14, con: 14, int: 18, wis: 14, cha: 16 } },
  { id: 2015, name: "Goblin Montado", type: "Humanóide", cr: "1", ac: 14, hp: 25, speed: "15m", actions: [{n: "Lança", hit: 5, dmg: "1d8+3"}], imageUrl: "/textures/creatures/Goblin_Montado_(lobo).png", attributes: { str: 12, dex: 14, con: 12, int: 10, wis: 10, cha: 8 } },
  { id: 2016, name: "Goblin Mutante", type: "Humanóide", cr: "3", ac: 13, hp: 65, speed: "9m", actions: [{n: "Pancada", hit: 6, dmg: "2d8+4"}], imageUrl: "/textures/creatures/Goblin_Mutante_(Ogro)_20260329122036.png", attributes: { str: 18, dex: 12, con: 16, int: 6, wis: 8, cha: 6 } },
  { id: 2017, name: "Goblin Rastreador", type: "Humanóide", cr: "1/2", ac: 14, hp: 15, speed: "9m", actions: [{n: "Adaga", hit: 5, dmg: "1d4+3"}], imageUrl: "/textures/creatures/Goblin_Rastreador.png", attributes: { str: 10, dex: 16, con: 12, int: 12, wis: 14, cha: 8 } },
  { id: 2018, name: "Goblin Xamã Elite", type: "Humanóide", cr: "2", ac: 13, hp: 30, speed: "9m", actions: [{n: "Cajado", hit: 5, dmg: "1d6+3"}], imageUrl: "/textures/creatures/Goblin_Xamã.png", attributes: { str: 8, dex: 14, con: 12, int: 14, wis: 16, cha: 12 } },
  { id: 2019, name: "Gorila", type: "Fera", cr: "2", ac: 12, hp: 51, speed: "9m", actions: [{n: "Pancada", hit: 5, dmg: "1d10+3"}], imageUrl: "/textures/creatures/gorila.png", attributes: { str: 16, dex: 14, con: 14, int: 6, wis: 12, cha: 7 } },
  { id: 2020, name: "Hobgoblin Arqueiro", type: "Humanóide", cr: "1", ac: 15, hp: 22, speed: "9m", actions: [{n: "Arco Longo", hit: 5, dmg: "1d8+3"}], imageUrl: "/textures/creatures/Hobgoblin_Arqueiro_20260329123110.png", attributes: { str: 13, dex: 16, con: 14, int: 10, wis: 12, cha: 10 } },
  { id: 2021, name: "Hobgoblin Campeão Imortal", type: "Humanóide", cr: "8", ac: 19, hp: 120, speed: "9m", actions: [{n: "Espada Grande", hit: 9, dmg: "2d12+6"}], imageUrl: "/textures/creatures/Hobgoblin_Campeão_Imortal_20260407181453.png", attributes: { str: 20, dex: 14, con: 18, int: 12, wis: 14, cha: 14 } },
  { id: 2022, name: "Hobgoblin Capitão", type: "Humanóide", cr: "3", ac: 17, hp: 39, speed: "9m", actions: [{n: "Espada Grande", hit: 6, dmg: "2d6+4"}], imageUrl: "/textures/creatures/Hobgoblin_Capitão_20260329123636.png", attributes: { str: 15, dex: 14, con: 14, int: 12, wis: 10, cha: 13 } },
  { id: 2023, name: "Hobgoblin Cavaleiro Pesado", type: "Humanóide", cr: "4", ac: 18, hp: 60, speed: "7.5m", actions: [{n: "Lança de Montaria", hit: 7, dmg: "1d12+4"}], imageUrl: "/textures/creatures/Hobgoblin_Cavaleiro_Pesado_20260407180501.png", attributes: { str: 18, dex: 12, con: 16, int: 10, wis: 12, cha: 10 } },
  { id: 2024, name: "Hobgoblin Devoto", type: "Humanóide", cr: "2", ac: 16, hp: 35, speed: "9m", actions: [{n: "Maça", hit: 5, dmg: "1d6+3"}], imageUrl: "/textures/creatures/Hobgoblin_Devoto_20260407181128.png", attributes: { str: 14, dex: 12, con: 14, int: 10, wis: 16, cha: 14 } },
  { id: 2025, name: "Hobgoblin Mago de Guerra", type: "Humanóide", cr: "4", ac: 15, hp: 45, speed: "9m", actions: [{n: "Magia de Guerra", hit: 7, dmg: "2d10+4"}], imageUrl: "/textures/creatures/Hobgoblin_Mago_de_Guerra_20260407161641.png", attributes: { str: 10, dex: 14, con: 14, int: 18, wis: 14, cha: 12 } },
  { id: 2026, name: "Hobgoblin Senhor da Guerra", type: "Humanóide", cr: "6", ac: 18, hp: 97, speed: "9m", actions: [{n: "Espada Longa", hit: 9, dmg: "1d10+5"}], imageUrl: "/textures/creatures/Hobgoblin_Senhor_da_Guerra_20260407161336.png", attributes: { str: 20, dex: 14, con: 18, int: 14, wis: 12, cha: 16 } },
  { id: 2027, name: "Hobgoblin Soldado Elite", type: "Humanóide", cr: "1", ac: 18, hp: 25, speed: "9m", actions: [{n: "Espada Longa", hit: 5, dmg: "1d8+3"}], imageUrl: "/textures/creatures/Hobgoblin_Soldado.png", attributes: { str: 15, dex: 12, con: 14, int: 10, wis: 10, cha: 10 } },
  { id: 2028, name: "Hobgoblin Warlord", type: "Humanóide", cr: "6", ac: 18, hp: 97, speed: "9m", actions: [{n: "Espada Longa", hit: 9, dmg: "1d10+5"}], imageUrl: "/textures/creatures/Hobgoblin_Warlord_20260407160919.png", attributes: { str: 20, dex: 14, con: 18, int: 14, wis: 12, cha: 16 } },
  { id: 2029, name: "Jonas", type: "Humanóide", cr: "1", ac: 14, hp: 25, speed: "9m", actions: [{n: "Ataque", hit: 5, dmg: "1d8+3"}], imageUrl: "/textures/creatures/jonas.PNG", attributes: { str: 14, dex: 14, con: 14, int: 10, wis: 10, cha: 10 } },
  { id: 2030, name: "Pedro", type: "Humanóide", cr: "1", ac: 14, hp: 25, speed: "9m", actions: [{n: "Ataque", hit: 5, dmg: "1d8+3"}], imageUrl: "/textures/creatures/pedro.PNG", attributes: { str: 14, dex: 14, con: 14, int: 10, wis: 10, cha: 10 } },
  { id: 2031, name: "Rato Gigante Elite", type: "Fera", cr: "1/2", ac: 13, hp: 15, speed: "9m", actions: [{n: "Mordida", hit: 5, dmg: "1d6+3"}], imageUrl: "/textures/creatures/Rato_Gigante_20260329124050.png", attributes: { str: 10, dex: 16, con: 12, int: 2, wis: 10, cha: 4 } },
  { id: 2032, name: "Webert", type: "Humanóide", cr: "1", ac: 14, hp: 25, speed: "9m", actions: [{n: "Ataque", hit: 5, dmg: "1d8+3"}], imageUrl: "/textures/creatures/webert.PNG", attributes: { str: 14, dex: 14, con: 14, int: 10, wis: 10, cha: 10 } },
  { id: 2033, name: "Criatura Gerada", type: "Monstruosidade", cr: "5", ac: 15, hp: 75, speed: "9m", actions: [{n: "Ataque", hit: 7, dmg: "2d8+4"}], imageUrl: "/textures/creatures/Gemini_Generated_Image_rk427frk427frk42_20260407171415.png", attributes: { str: 16, dex: 14, con: 16, int: 10, wis: 12, cha: 10 } },
  {
    id: 3000, name: "Lich Arcano (Lendário)", type: "Morto-vivo", cr: "21", ac: 17, hp: 135, speed: "9m", 
    actions: [{n: "Toque Paralisante", hit: 12, dmg: "3d6 necrótico (CD 18 paralisado)"}, {n: "Raio de Gelo", hit: 12, dmg: "4d8 frio"}], 
    attributes: { str: 11, dex: 16, con: 16, int: 20, wis: 14, cha: 16 },
    essence: {
      id: "ess_lich_arcano", name: "Essência do Lich Arcano", monsterSource: "Lich Arcano", cr: "21",
      attributeBonus: { attr: "int", value: 3 },
      passive: { name: "Barreira Arcana", desc: "Resistência a dano de magias." },
      active: { name: "Aniquilação Arcana", desc: "Lança uma esfera de energia que causa 10d6 de dano em área.", limit: "1/Descanso Longo" }
    },
    drops: [{ n: "Filactéria Incompleta", d: "Um artefato de imenso poder necromântico.", r: "Lendário" }, { n: "Grimório de Ébano", d: "Contém feitiços proibidos.", r: "Lendário" }],
    legendaryActions: [
      { n: "Truque", d: "O lich conjura um truque.", cost: 1 },
      { n: "Toque Paralisante", d: "Usa seu toque paralisante.", cost: 2 },
      { n: "Olhar Aterrorizante", d: "Alvo a 3m deve passar em CD 18 Wisdom ou ficar amedrontado.", cost: 2 }
    ],
    lairActions: [
      { n: "Energia Negativa", d: "O lich recupera um slot de magia de 5º nível ou menor." },
      { n: "Gritos dos Mortos", d: "Criaturas em 18m recebem 6d6 de dano necrótico (CD 18 Metade)." }
    ]
  },
  {
    id: 3001, name: "Dragão Vermelho Adulto", type: "Dragão", cr: "17", ac: 19, hp: 256, speed: "12m/24m voo", imageUrl: "/textures/creatures/Dragão Vermelho Adulto.png",
    actions: [{n: "Mordida", hit: 14, dmg: "2d10+8"}, {n: "Sopro de Fogo", hit: 0, dmg: "18d6 fogo (CD 21)"}],
    attributes: { str: 27, dex: 10, con: 25, int: 16, wis: 13, cha: 21 },
    legendaryActions: [
      { n: "Detectar", d: "O dragão faz um teste de Percepção.", cost: 1 },
      { n: "Ataque de Cauda", d: "Ataque corpo-a-corpo: +14 para atingir, alcance 4.5m, 2d8+8 dano.", cost: 1 },
      { n: "Ataque de Asa", d: "Bate as asas. Criaturas em 3m recebem 2d6+8 dano e caem.", cost: 2 }
    ],
    lairActions: [
      { n: "Erupção de Magma", d: "Magma sobe do chão. 4d6 dano de fogo em área." },
      { n: "Tremor de Terra", d: "Terreno torna-se difícil até o próximo round." }
    ]
  }
];
