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
    <div className="bg-stone-900 border border-stone-800 rounded-xl p-4 hover:border-amber-600/50 transition-all group flex flex-col justify-between h-full">
        <div>
            <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-amber-500 group-hover:text-amber-400 transition-colors truncate pr-2" title={monster.name}>{monster.name}</h3>
                <span className="text-[10px] bg-stone-800 px-2 py-0.5 rounded text-stone-400 uppercase shrink-0">{monster.cr !== '0' ? `ND ${monster.cr}` : 'ND 0'}</span>
            </div>
            <p className="text-xs text-stone-500 italic mb-3 truncate">{monster.type}</p>
            <div className="grid grid-cols-2 gap-2 text-[10px] text-stone-400">
                <div className="flex justify-between border-b border-stone-800 pb-1">
                    <span>CA</span>
                    <span className="text-stone-200">{monster.ac}</span>
                </div>
                <div className="flex justify-between border-b border-stone-800 pb-1">
                    <span>PV</span>
                    <span className="text-stone-200">{monster.hp}</span>
                </div>
            </div>
        </div>
        <button 
            onClick={() => onAdd(monster)}
            className="mt-4 w-full py-2 bg-stone-800 hover:bg-amber-600 text-stone-300 hover:text-white rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2"
        >
            <Plus size={14} /> Adicionar
        </button>
    </div>
));

export const NPCManager: React.FC<Props> = ({ npcs, monsters, onUpdate, onAdd, onAddMonster, onImportDrive, onDelete, onRoll, addLog, setConfirmModal, optimizeImage }) => {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [showLibrary, setShowLibrary] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const activeNPC = npcs.find(n => n.id === activeId);

  const filteredMonsters = useMemo(() => monsters.filter(m => 
    m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.type.toLowerCase().includes(searchTerm.toLowerCase())
  ), [monsters, searchTerm]);

  // Virtualization logic: Group monsters into rows of 3 (matching lg:grid-cols-3)
  const itemsPerRow = 3;
  const rows = useMemo(() => {
      const r = [];
      for (let i = 0; i < filteredMonsters.length; i += itemsPerRow) {
          r.push(filteredMonsters.slice(i, i + itemsPerRow));
      }
      return r;
  }, [filteredMonsters]);

  const Row = ({ index, style }: { index: number, style: React.CSSProperties }) => (
      <div style={style} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 px-1 pb-4">
          {rows[index].map(monster => (
              <MonsterCard key={monster.id} monster={monster} onAdd={(m) => {
                  onAddMonster(m);
                  setShowLibrary(false);
              }} />
          ))}
      </div>
  );

  return (
    <div className="flex h-full">
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

                  <div className="flex-1 overflow-hidden">
                      {filteredMonsters.length > 0 ? (
                          <List
                            style={{ height: 500, width: '100%' }}
                            rowCount={rows.length}
                            rowHeight={180}
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