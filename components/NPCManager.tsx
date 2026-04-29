import React, { useState, useMemo } from 'react';
import { Character } from '../types';
import { CharacterSheet } from './CharacterSheet';
import { Plus, Users, Ghost, Book, Cloud, Search } from 'lucide-react';
import { Monster } from '../types';
import { List } from 'react-window';

interface Props {
  npcs: Character[];
  monsters: Monster[];
  onUpdate: (char: Character) => void;
  onAdd: () => void;
  onAddMonster: (monster: Monster) => void;
  onImportDrive: () => void;
  onDelete: (id: string) => void;
  onRoll: (d: number, mod: number, label: string) => void;
  addLog?: (title: string, details: string, type?: any) => void;
  setConfirmModal?: (modal: {message: string, onConfirm: () => void, onCancel?: () => void} | null) => void;
  optimizeImage?: (base64: string, maxWidth?: number, maxHeight?: number, quality?: number) => Promise<string>;
}

const MonsterCard = React.memo(({ monster, onAdd }: { monster: Monster, onAdd: (m: Monster) => void }) => (
    <div className="bg-stone-900 border border-stone-800 rounded-xl p-0 hover:border-amber-600/50 transition-all group flex flex-col h-full overflow-hidden shadow-xl">
        <div className="relative h-72 w-full bg-stone-950 overflow-hidden shrink-0 cursor-zoom-in">
            {monster.imageUrl ? (
                <img 
                    src={monster.imageUrl} 
                    alt={monster.name} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 opacity-80 group-hover:opacity-100"
                    referrerPolicy="no-referrer"
                />
            ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-stone-700 bg-stone-900/50">
                    <Ghost size={64} className="mb-2 opacity-50" />
                    <span className="text-xs uppercase font-bold tracking-widest">Sem Ilustração</span>
                </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-stone-900 via-transparent to-transparent opacity-60"></div>
            <div className="absolute top-3 right-3 flex flex-col gap-2 items-end">
                <span className="text-[10px] bg-amber-600 px-2 py-1 rounded text-white font-bold uppercase shadow-lg border border-amber-500/50">{monster.cr !== '0' ? `ND ${monster.cr}` : 'ND 0'}</span>
                <span className="text-[10px] bg-stone-800/80 px-2 py-1 rounded text-stone-300 font-bold uppercase shadow-lg border border-stone-700/50 flex items-center gap-1">
                    <Ghost size={10} /> {monster.type}
                </span>
            </div>
            <div className="absolute bottom-3 left-4 right-4">
                 <h3 className="font-cinzel text-xl font-bold text-amber-500 group-hover:text-amber-400 transition-colors drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]" title={monster.name}>{monster.name}</h3>
            </div>
        </div>
        
        <div className="p-5 flex-1 flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-stone-950/50 p-2 rounded border border-stone-800 flex flex-col items-center">
                    <span className="text-[9px] uppercase tracking-tighter text-stone-500 font-bold">CA</span>
                    <span className="text-stone-100 font-mono text-xl">{monster.ac}</span>
                </div>
                <div className="bg-stone-950/50 p-2 rounded border border-stone-800 flex flex-col items-center">
                    <span className="text-[9px] uppercase tracking-tighter text-stone-500 font-bold">HP</span>
                    <span className="text-stone-100 font-mono text-xl">{monster.hp}</span>
                </div>
            </div>

            {/* Ações */}
            <div className="space-y-2">
                <h4 className="text-[10px] uppercase font-black tracking-widest text-stone-500 border-b border-stone-800 pb-1 flex justify-between items-center">
                    Ações <span>{monster.actions.length}</span>
                </h4>
                <div className="space-y-1 max-h-24 overflow-y-auto custom-scrollbar pr-1">
                    {monster.actions.map((action, i) => (
                        <div key={i} className="text-[11px] bg-stone-950/30 p-1.5 rounded border border-stone-800/50">
                            <span className="text-amber-600/80 font-bold">{action.n}:</span> <span className="text-stone-400">+{action.hit} | {action.dmg}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Essência e Drops */}
            <div className="grid grid-cols-2 gap-3 mt-auto pt-2 border-t border-stone-800">
                <div className="flex flex-col gap-1">
                    <span className="text-[9px] uppercase font-bold text-stone-500">Essência</span>
                    <div className={`text-[10px] truncate ${monster.essence ? 'text-purple-400' : 'text-stone-600 italic'}`}>
                        {monster.essence ? monster.essence.name : 'Nenhuma'}
                    </div>
                </div>
                <div className="flex flex-col gap-1">
                    <span className="text-[9px] uppercase font-bold text-stone-500">Drops</span>
                    <div className={`text-[10px] truncate ${monster.drops && monster.drops.length > 0 ? 'text-blue-400' : 'text-stone-600 italic'}`}>
                        {monster.drops && monster.drops.length > 0 ? `${monster.drops.length} itens` : 'Nenhum'}
                    </div>
                </div>
            </div>

            <button 
                onClick={() => onAdd(monster)}
                className="w-full py-3 bg-amber-700/20 hover:bg-amber-600 text-amber-500 hover:text-white rounded-lg text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 border border-amber-900/30 hover:border-amber-500 shadow-lg mt-2"
            >
                <Plus size={14} /> Incorporar Monstro
            </button>
        </div>
    </div>
));

export const NPCManager: React.FC<Props> = ({ npcs, monsters, onUpdate, onAdd, onAddMonster, onImportDrive, onDelete, onRoll, addLog, setConfirmModal, optimizeImage }) => {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [showLibrary, setShowLibrary] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);

  const activeNPC = npcs.find(n => n.id === activeId);

  const filteredMonsters = useMemo(() => monsters.filter(m => 
    m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.type.toLowerCase().includes(searchTerm.toLowerCase())
  ), [monsters, searchTerm]);

  // Virtualization logic: Group monsters into rows of 2 (matching xl:grid-cols-2)
  const itemsPerRow = 2;
  const rows = useMemo(() => {
      const r = [];
      for (let i = 0; i < filteredMonsters.length; i += itemsPerRow) {
          r.push(filteredMonsters.slice(i, i + itemsPerRow));
      }
      return r;
  }, [filteredMonsters, itemsPerRow]);

  const Row = ({ index, style }: { index: number, style: React.CSSProperties }) => (
      <div style={style} className="grid grid-cols-1 xl:grid-cols-2 gap-6 px-1 pb-6">
          {rows[index].map(monster => (
              <div key={monster.id} onClick={(e) => {
                  // Capture click on image for zoom
                  const target = e.target as HTMLElement;
                  if (target.tagName === 'IMG' && monster.imageUrl) {
                      setZoomedImage(monster.imageUrl);
                      e.stopPropagation();
                      return;
                  }
              }}>
                <MonsterCard monster={monster} onAdd={(m) => {
                    onAddMonster(m);
                    setShowLibrary(false);
                }} />
              </div>
          ))}
      </div>
  );

  return (
    <div className="flex h-full">
      {/* Zoom Modal */}
      {zoomedImage && (
          <div 
            className="fixed inset-0 z-[100] bg-black/90 p-4 md:p-12 flex items-center justify-center cursor-zoom-out animate-in fade-in zoom-in duration-300"
            onClick={() => setZoomedImage(null)}
          >
              <button 
                className="absolute top-6 right-6 p-3 bg-stone-900/50 hover:bg-stone-800 rounded-full text-white transition-all hover:scale-110 z-10"
                onClick={() => setZoomedImage(null)}
              >
                  <Plus size={32} className="rotate-45" />
              </button>
              <img 
                src={zoomedImage} 
                alt="Enlarged monster" 
                className="max-w-full max-h-full object-contain shadow-2xl rounded-lg"
                referrerPolicy="no-referrer"
              />
          </div>
      )}
      {/* Sidebar List */}
      <aside className="w-64 bg-stone-900 border-r border-stone-800 flex flex-col z-20 shadow-lg shrink-0">
        <div className="p-3 border-b border-stone-800 flex justify-between items-center bg-stone-950">
            <span className="text-xs font-bold text-stone-400 uppercase tracking-wider flex items-center gap-2"><Users size={14}/> Lista de NPCs</span>
            <div className="flex gap-1">
                <button 
                    onClick={onImportDrive} 
                    className="p-1.5 rounded bg-blue-600 text-white hover:bg-blue-500 transition-colors shadow-sm" 
                    title="Importar do Drive"
                >
                    <Cloud size={16}/>
                </button>
                <button 
                    onClick={() => setShowLibrary(true)} 
                    className="p-1.5 rounded bg-purple-600 text-white hover:bg-purple-500 transition-colors shadow-sm" 
                    title="Biblioteca de Monstros"
                >
                    <Book size={16}/>
                </button>
                <button 
                    onClick={onAdd} 
                    className="p-1.5 rounded bg-amber-600 text-white hover:bg-amber-500 transition-colors shadow-sm" 
                    title="Novo NPC"
                >
                    <Plus size={16}/>
                </button>
            </div>
        </div>
        <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-2">
            {npcs.map((npc) => (
                <button 
                    key={npc.id} 
                    onClick={() => setActiveId(npc.id)} 
                    className={`w-full p-3 rounded-lg border text-left transition-all group relative overflow-hidden ${activeId === npc.id ? 'bg-amber-900/20 border-amber-600/50 shadow-md' : 'bg-stone-800/50 border-stone-800 hover:border-stone-600 hover:bg-stone-800'}`}
                >
                    {activeId === npc.id && <div className="absolute left-0 top-0 h-full w-1 bg-amber-600"></div>}
                    <div className={`font-bold text-sm ${activeId === npc.id ? 'text-amber-500' : 'text-stone-300'} truncate`}>{npc.name}</div>
                    <div className="text-[10px] text-stone-500 flex justify-between mt-1">
                        <span>{npc.race || 'Raça'}</span>
                        <span>ND {npc.level}</span>
                    </div>
                </button>
            ))}
            {npcs.length === 0 && (
                <div className="flex flex-col items-center justify-center mt-10 opacity-30 px-4 text-center">
                    <Ghost size={32} className="mb-2" />
                    <p className="text-xs italic">Nenhum NPC no diretório.</p>
                </div>
            )}
        </div>
      </aside>

      {/* Main Area */}
      <div className="flex-1 overflow-hidden relative bg-stone-100 dark:bg-stone-950">
          {showLibrary && (
              <div className="absolute inset-0 z-30 bg-stone-950/95 backdrop-blur-sm flex flex-col p-6 overflow-hidden">
                  <div className="flex justify-between items-center mb-6">
                      <h2 className="text-2xl font-cinzel font-bold text-amber-500 flex items-center gap-3">
                          <Book size={24} /> Biblioteca de Monstros
                      </h2>
                      <button 
                        onClick={() => setShowLibrary(false)}
                        className="p-2 hover:bg-stone-800 rounded-full text-stone-400 hover:text-white transition-colors"
                      >
                          <Plus size={24} className="rotate-45" />
                      </button>
                  </div>

                  <div className="relative mb-4">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-500" size={18} />
                      <input 
                        type="text" 
                        placeholder="Buscar monstro por nome ou tipo..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-stone-900 border border-stone-800 rounded-lg pl-10 pr-4 py-3 text-stone-200 focus:outline-none focus:border-amber-600 transition-colors"
                      />
                  </div>

                  <div className="flex-1 overflow-hidden" id="monster-list-container">
                      {filteredMonsters.length > 0 ? (
                          <List
                            style={{ height: '100%', width: '100%' }}
                            rowCount={rows.length}
                            rowHeight={650}
                            className="custom-scrollbar"
                            rowComponent={Row}
                            rowProps={{} as any}
                          />
                      ) : (
                          <div className="flex flex-col items-center justify-center h-full opacity-30">
                              <Ghost size={48} className="mb-2" />
                              <p>Nenhum monstro encontrado.</p>
                          </div>
                      )}
                  </div>
              </div>
          )}

          {activeNPC ? (
              <div className="h-full overflow-y-auto custom-scrollbar p-4 lg:p-8">
                  <CharacterSheet 
                      char={activeNPC} 
                      setConfirmModal={setConfirmModal}
                      addLog={addLog}
                      setChar={(updater: any) => {
                          if (typeof updater === 'function') {
                              onUpdate(updater(activeNPC));
                          } else {
                              onUpdate(updater);
                          }
                      }} 
                      onRoll={onRoll}
                      onDelete={() => {
                          if (setConfirmModal) {
                              setConfirmModal({
                                  message: `Excluir NPC ${activeNPC.name}?`,
                                  onConfirm: () => {
                                      onDelete(activeNPC.id);
                                      setActiveId(null);
                                  }
                              });
                          }
                      }}
                      isNPC={true}
                  />
              </div>
          ) : (
              <div className="flex flex-col items-center justify-center h-full text-stone-600/40">
                  <Users size={80} className="mb-4" />
                  <p className="text-xl font-cinzel font-bold tracking-widest uppercase">Gerenciador de NPCs</p>
                  <p className="text-sm italic mt-2">Crie figuras lendárias, vilões ou simples plebeus para sua campanha.</p>
                  <button 
                    onClick={onAdd}
                    className="mt-6 px-6 py-2 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-lg border border-stone-700 font-bold transition-all flex items-center gap-2"
                  >
                      <Plus size={18} /> Novo Figurante
                  </button>
              </div>
          )}
      </div>
    </div>
  );
};