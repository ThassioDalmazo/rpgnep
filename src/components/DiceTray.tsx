
import React, { useState } from 'react';
import { Dices, Plus, Minus, Trash2, Zap, X } from 'lucide-react';

interface Props {
  onRoll: (text: string) => void;
}

export const DiceTray: React.FC<Props> = ({ onRoll }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [modifier, setModifier] = useState(0);
  const [dicePool, setDicePool] = useState<Record<number, number>>({});

  const addDice = (sides: number) => {
    setDicePool(prev => ({ ...prev, [sides]: (prev[sides] || 0) + 1 }));
  };

  const clearPool = () => {
    setDicePool({});
    setModifier(0);
  };

  const executeRoll = () => {
    const parts: string[] = [];
    (Object.entries(dicePool) as [string, number][]).forEach(([sides, count]) => {
      if (count > 0) parts.push(`${count}d${sides}`);
    });
    
    if (parts.length === 0) return;
    
    let rollStr = parts.join(' + ');
    if (modifier !== 0) {
      rollStr += (modifier > 0 ? ` + ${modifier}` : ` - ${Math.abs(modifier)}`);
    }
    
    onRoll(`/r ${rollStr}`);
    clearPool();
    setIsOpen(false);
  };

  const totalDice = (Object.values(dicePool) as number[]).reduce((a: number, b: number) => a + b, 0);

  return (
    <div className="fixed bottom-24 md:bottom-8 right-4 md:right-8 z-[100] flex flex-col items-end gap-3 pointer-events-none">
      <div className="pointer-events-auto flex flex-col items-end gap-3">
      {isOpen && (
        <div className="bg-stone-900/90 backdrop-blur-md border border-stone-700/50 rounded-3xl p-5 shadow-2xl animate-in slide-in-from-bottom-5 w-72 ring-1 ring-white/10 mb-2">
          <div className="flex justify-between items-center mb-4 border-b border-stone-800 pb-2">
            <span className="text-xs font-bold uppercase tracking-widest text-amber-500 font-cinzel">Bandeja de Dados</span>
            <button onClick={clearPool} className="text-stone-500 hover:text-red-500 transition-colors p-1"><Trash2 size={16}/></button>
          </div>
          
          <div className="grid grid-cols-4 gap-2 mb-4">
            {[4, 6, 8, 10, 12, 20, 100].map(d => (
              <button 
                key={d} 
                onClick={() => addDice(d)}
                className="relative flex flex-col items-center justify-center p-3 bg-stone-800/50 hover:bg-stone-800 rounded-xl border border-stone-700 hover:border-amber-500/50 transition-all group active:scale-95"
              >
                <Dices className="text-stone-600 group-hover:text-amber-500 mb-1 transition-colors" size={16} />
                <span className="text-stone-400 text-[10px] font-bold group-hover:text-white">d{d}</span>
                {(Number(dicePool[d]) || 0) > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-amber-600 text-white text-[9px] font-black w-5 h-5 rounded-full flex items-center justify-center shadow-md border border-stone-900">
                    {dicePool[d]}
                  </span>
                )}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3 bg-black/40 p-2 rounded-xl border border-stone-800 mb-4">
            <span className="text-[10px] font-bold text-stone-500 uppercase ml-2">Modificador</span>
            <div className="flex items-center gap-2 ml-auto">
              <button onClick={() => setModifier(m => m - 1)} className="w-8 h-8 flex items-center justify-center bg-stone-800 rounded-lg hover:bg-stone-700 hover:text-red-400 transition-colors"><Minus size={14}/></button>
              <span className={`font-mono font-bold w-8 text-center ${modifier > 0 ? 'text-green-400' : modifier < 0 ? 'text-red-400' : 'text-stone-400'}`}>
                {modifier >= 0 ? '+' : ''}{modifier}
              </span>
              <button onClick={() => setModifier(m => m + 1)} className="w-8 h-8 flex items-center justify-center bg-stone-800 rounded-lg hover:bg-stone-700 hover:text-green-400 transition-colors"><Plus size={14}/></button>
            </div>
          </div>

          <button 
            onClick={executeRoll}
            disabled={totalDice === 0}
            className="w-full bg-gradient-to-r from-amber-700 to-amber-600 hover:from-amber-600 hover:to-amber-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-black py-3 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-amber-900/20 active:scale-95"
          >
            <Zap size={18} fill="currentColor"/> ROLAR
          </button>
        </div>
      )}
      
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-2xl transition-all hover:scale-105 active:scale-95 z-50 ${isOpen ? 'bg-amber-500 text-stone-950 rotate-90 shadow-amber-500/20' : 'bg-stone-900/80 backdrop-blur-md text-amber-500 border border-stone-700 hover:border-amber-500'}`}
      >
        {isOpen ? <X size={28}/> : <Dices size={28}/>}
        {!isOpen && totalDice > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center animate-pulse shadow-md border border-stone-900">
                {totalDice}
            </span>
        )}
      </button>
      </div>
    </div>
  );
};
