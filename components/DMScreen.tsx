
import React, { useState } from 'react';
import { X, Search, Shield, Zap, Eye, Activity, Skull, BookOpen, Moon, Sun, Wind, Scale } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

type Category = 'combat' | 'conditions' | 'environment' | 'general' | 'items';

const RULE_DATA = {
  combat: [
    { title: "Ações em Combate", content: [
      { l: "Atacar", d: "Realiza um ataque corpo a corpo ou à distância." },
      { l: "Conjurar Magia", d: "Tempo de conjuração de 1 ação." },
      { l: "Disparada (Dash)", d: "Ganha deslocamento extra igual ao seu deslocamento atual." },
      { l: "Desengajar", d: "Seu movimento não provoca ataques de oportunidade neste turno." },
      { l: "Esquivar (Dodge)", d: "Até o início do próximo turno, ataques contra você têm desvantagem. Seus testes de Des têm vantagem." },
      { l: "Ajudar", d: "Concede vantagem no próximo teste de habilidade ou ataque de um aliado." },
      { l: "Esconder", d: "Faça um teste de Destreza (Furtividade) para tentar se ocultar." },
      { l: "Preparar", d: "Gatilha uma reação em resposta a uma condição definida." },
      { l: "Procurar", d: "Dedica atenção para encontrar algo (Investigação ou Percepção)." },
      { l: "Usar Objeto", d: "Interage com um objeto que exige uma ação." }
    ]},
    { title: "Cobertura", content: [
      { l: "Meia Cobertura", d: "+2 na CA e testes de resistência de Destreza." },
      { l: "Três Quartos", d: "+5 na CA e testes de resistência de Destreza." },
      { l: "Cobertura Total", d: "Não pode ser alvo direto de ataques ou magias." }
    ]},
    { title: "Combate com Duas Armas", content: [
      { l: "Regra", d: "Se atacar com arma leve em uma mão, pode usar ação bônus para atacar com arma leve na outra mão (sem mod de habilidade no dano)." }
    ]},
    { title: "Agarrar", content: [
      { l: "Regra", d: "Ataque especial corpo a corpo. Teste de Atletismo (For) vs Atletismo (For) ou Acrobacia (Des) do alvo." }
    ]}
  ],
  conditions: [
    { title: "Condições", content: [
      { l: "Agarrado", d: "Deslocamento 0. Termina se o agarrador for incapacitado ou efeito remover o agarrado do alcance." },
      { l: "Amedrontado", d: "Desvantagem em testes e ataques enquanto fonte do medo estiver visível. Não pode se aproximar da fonte." },
      { l: "Atordoado", d: "Incapacitado, não pode se mover, falha automática em resistências de For/Des. Ataques contra têm vantagem." },
      { l: "Caído", d: "Apenas rasteja. Desvantagem em ataques. Ataques contra têm vantagem se adjacentes (5ft), senão desvantagem." },
      { l: "Cego", d: "Falha automática em testes que exigem visão. Ataques contra têm vantagem. Seus ataques têm desvantagem." },
      { l: "Enfeitiçado", d: "Não pode atacar o encantador. Encantador tem vantagem em interações sociais." },
      { l: "Envenenado", d: "Desvantagem em jogadas de ataque e testes de habilidade." },
      { l: "Exausto", d: "1: Desv em testes. 2: Metade do deslocamento. 3: Desv ataques/saves. 4: Metade PV máx. 5: Deslocamento 0. 6: Morte." },
      { l: "Impedido", d: "Deslocamento 0. Ataques contra têm vantagem. Seus ataques têm desvantagem. Desv em saves de Des." },
      { l: "Incapacitado", d: "Não pode realizar ações ou reações." },
      { l: "Inconsciente", d: "Incapacitado, larga o que segura, cai. Falha em saves For/Des. Ataques contra têm vantagem. Crítico se atacante estiver a 1,5m." },
      { l: "Invisível", d: "Considerado em área de escuridão densa para fins de furtividade. Ataques contra têm desvantagem. Seus ataques têm vantagem." },
      { l: "Paralisado", d: "Incapacitado e não pode se mover ou falar. Falha auto em saves For/Des. Ataques contra têm vantagem e crítico automático se a 1,5m." },
      { l: "Petrificado", d: "Transformado em substância sólida. Incapacitado. Resistência a todo dano. Imune a veneno/doença." },
      { l: "Surdo", d: "Falha automática em testes que exigem audição." }
    ]}
  ],
  environment: [
    { title: "Luz e Visão", content: [
      { l: "Luz Plena", d: "A maioria das criaturas vê normalmente." },
      { l: "Penumbra", d: "Área de escuridão leve. Desvantagem em Percepção (visão)." },
      { l: "Escuridão", d: "Área de escuridão densa. Criaturas são cegas na área." },
      { l: "Visão no Escuro", d: "Vê na escuridão como se fosse penumbra (tons de cinza)." }
    ]},
    { title: "Movimento", content: [
      { l: "Terreno Difícil", d: "Custa 1,5m para cada 1m percorrido." },
      { l: "Escalar/Nadar", d: "Custa 3m para cada 1,5m (se não tiver deslocamento de escalada/natação)." },
      { l: "Rastejar", d: "Custa 3m para cada 1,5m." },
      { l: "Levantar-se", d: "Custa metade do seu deslocamento total." }
    ]},
    { title: "Sufocamento", content: [
      { l: "Prender Respiração", d: "1 + Mod Constituição minutos (min 30 seg)." },
      { l: "Sem Ar", d: "Sobrevive rodadas igual Mod Constituição (min 1). Depois cai a 0 PV e morre." }
    ]}
  ],
  general: [
    { title: "Dificuldade (CD)", content: [
      { l: "Muito Fácil", d: "CD 5" },
      { l: "Fácil", d: "CD 10" },
      { l: "Médio", d: "CD 15" },
      { l: "Difícil", d: "CD 20" },
      { l: "Muito Difícil", d: "CD 25" },
      { l: "Quase Impossível", d: "CD 30" }
    ]},
    { title: "Descanso", content: [
      { l: "Curto (1h)", d: "Pode gastar Dados de Vida para curar. Recupera recursos de classe (Bruxo, Monge, Guerreiro, etc)." },
      { l: "Longo (8h)", d: "Recupera todos PV e metade dos Dados de Vida totais. Recupera slots de magia e habilidades longas." }
    ]},
    { title: "Atributos", content: [
      { l: "Força", d: "Atletismo, Dano Corpo a Corpo, Carga, Saltar." },
      { l: "Destreza", d: "Acrobacia, Furtividade, Prestidigitação, CA, Iniciativa, Ataque à Distância." },
      { l: "Constituição", d: "Pontos de Vida, Concentração." },
      { l: "Inteligência", d: "Arcanismo, História, Investigação, Natureza, Religião." },
      { l: "Sabedoria", d: "Adestrar Animais, Intuição, Medicina, Percepção, Sobrevivência." },
      { l: "Carisma", d: "Atuação, Enganação, Intimidação, Persuasão." }
    ]}
  ],
  items: [
    { title: "Poções de Cura", content: [
      { l: "Comum", d: "2d4 + 2" },
      { l: "Maior", d: "4d4 + 4" },
      { l: "Superior", d: "8d4 + 8" },
      { l: "Suprema", d: "10d4 + 20" }
    ]},
    { title: "Serviços e Estadia", content: [
      { l: "Estadia Pobre", d: "1 pp / noite" },
      { l: "Estadia Modesta", d: "5 pp / noite" },
      { l: "Estadia Confortável", d: "8 pp / noite" },
      { l: "Estadia Rica", d: "2 po / noite" },
      { l: "Estadia Aristocrática", d: "4 po / noite" },
      { l: "Refeição Modesta", d: "3 pp" },
      { l: "Refeição Confortável", d: "5 pp" },
      { l: "Cerveja (Caneca)", d: "4 pc" }
    ]}
  ]
};

export const DMScreen: React.FC<Props> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<Category>('conditions');
  const [searchTerm, setSearchTerm] = useState('');

  if (!isOpen) return null;

  const categories: {id: Category, icon: any, label: string}[] = [
    { id: 'conditions', icon: Skull, label: 'Condições' },
    { id: 'combat', icon: Shield, label: 'Combate' },
    { id: 'general', icon: Scale, label: 'Regras Gerais' },
    { id: 'environment', icon: Sun, label: 'Ambiente' },
    { id: 'items', icon: BookOpen, label: 'Itens' },
  ];

  const filterContent = (data: typeof RULE_DATA[Category]) => {
      if (!searchTerm) return data;
      return data.map(section => ({
          ...section,
          content: section.content.filter(item => 
              item.l.toLowerCase().includes(searchTerm.toLowerCase()) || 
              item.d.toLowerCase().includes(searchTerm.toLowerCase())
          )
      })).filter(section => section.content.length > 0);
  };

  const currentData = filterContent(RULE_DATA[activeTab]);

  return (
    <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 md:p-8 animate-in fade-in duration-200">
      <div className="bg-[#1c1c1e] border-2 border-amber-900/50 w-full max-w-6xl h-[85vh] rounded-xl shadow-2xl flex flex-col relative overflow-hidden ring-1 ring-amber-600/20">
        
        {/* Header */}
        <div className="bg-[#151518] p-4 border-b border-amber-900/30 flex justify-between items-center shrink-0">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-900/20 rounded-lg border border-amber-700/50">
                    <Shield size={24} className="text-amber-500" />
                </div>
                <div>
                    <h2 className="text-2xl font-cinzel font-bold text-amber-500 tracking-wider">Escudo do Mestre</h2>
                    <p className="text-[10px] text-stone-500 uppercase tracking-widest font-bold">Referência Rápida SRD 5.1</p>
                </div>
            </div>
            
            <div className="flex-1 max-w-md mx-6 relative">
                <Search className="absolute left-3 top-2.5 text-stone-500" size={16}/>
                <input 
                    className="w-full bg-[#0a0a0c] border border-stone-800 rounded-lg py-2 pl-10 text-sm text-stone-300 focus:border-amber-600 focus:outline-none placeholder-stone-600"
                    placeholder="Buscar regra (ex: Exausto, Cobertura)..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    autoFocus
                />
            </div>

            <button onClick={onClose} className="p-2 text-stone-500 hover:text-white hover:bg-stone-800 rounded-full transition-colors">
                <X size={24} />
            </button>
        </div>

        {/* Tabs */}
        <div className="flex bg-[#121214] border-b border-stone-800 shrink-0 overflow-x-auto no-scrollbar">
            {categories.map(cat => (
                <button
                    key={cat.id}
                    onClick={() => { setActiveTab(cat.id); setSearchTerm(''); }}
                    className={`flex items-center gap-2 px-6 py-4 text-xs font-bold uppercase tracking-widest transition-all whitespace-nowrap border-b-2 ${
                        activeTab === cat.id 
                        ? 'border-amber-500 text-amber-500 bg-amber-900/10' 
                        : 'border-transparent text-stone-500 hover:text-stone-300 hover:bg-stone-800'
                    }`}
                >
                    <cat.icon size={16} /> {cat.label}
                </button>
            ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-[#0c0a09] custom-scrollbar bg-[url('https://www.transparenttextures.com/patterns/dark-leather.png')]">
            {currentData.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {currentData.map((section, idx) => (
                        <div key={idx} className="break-inside-avoid">
                            <h3 className="text-amber-500 font-cinzel font-bold text-lg mb-3 border-b border-amber-900/30 pb-1">{section.title}</h3>
                            <div className="space-y-3">
                                {section.content.map((item, i) => (
                                    <div key={i} className="bg-[#1a1a1d] border border-stone-800 rounded-lg p-3 hover:border-stone-600 transition-colors shadow-sm group">
                                        <div className="font-bold text-stone-200 text-sm mb-1 group-hover:text-amber-400">{item.l}</div>
                                        <div className="text-xs text-stone-400 leading-relaxed">{item.d}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center h-full text-stone-600 opacity-50">
                    <Search size={48} className="mb-4"/>
                    <p>Nenhuma regra encontrada para "{searchTerm}".</p>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};
