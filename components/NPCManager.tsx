import React, { useState } from 'react';
import { Character } from '../types';
import { CharacterSheet } from './CharacterSheet';
import { Plus, Users, Ghost } from 'lucide-react';

interface Props {
  npcs: Character[];
  onUpdate: (char: Character) => void;
  onAdd: () => void;
  onDelete: (id: string) => void;
  onRoll: (d: number, mod: number, label: string) => void;
}

export const NPCManager: React.FC<Props> = ({ npcs, onUpdate, onAdd, onDelete, onRoll }) => {
  const [activeId, setActiveId] = useState<string | null>(null);

  const activeNPC = npcs.find(n => n.id === activeId);

  return (
    <div className="flex h-full">
      {/* Sidebar List */}
      <aside className="w-64 bg-stone-900 border-r border-stone-800 flex flex-col z-20 shadow-lg shrink-0">
        <div className="p-3 border-b border-stone-800 flex justify-between items-center bg-stone-950">
            <span className="text-xs font-bold text-stone-400 uppercase tracking-wider flex items-center gap-2"><Users size={14}/> Lista de NPCs</span>
            <button 
                onClick={onAdd} 
                className="p-1.5 rounded bg-amber-600 text-white hover:bg-amber-500 transition-colors shadow-sm" 
                title="Novo NPC"
            >
                <Plus size={16}/>
            </button>
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
          {activeNPC ? (
              <div className="h-full overflow-y-auto custom-scrollbar p-4 lg:p-8">
                  <CharacterSheet 
                      char={activeNPC} 
                      setChar={(updater: any) => {
                          if (typeof updater === 'function') {
                              onUpdate(updater(activeNPC));
                          } else {
                              onUpdate(updater);
                          }
                      }} 
                      onRoll={onRoll}
                      onDelete={() => {
                          if(window.confirm(`Excluir NPC ${activeNPC.name}?`)) {
                              onDelete(activeNPC.id);
                              setActiveId(null);
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