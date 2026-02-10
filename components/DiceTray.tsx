
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
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col items-end gap-3">
      {isOpen && (
        <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4 shadow-2xl animate-in slide-in-from-bottom-5 w-64 border-b-amber-500 border-b-4">
          <div className="flex justify-between items-center mb-4">
            <span className="text-xs font-bold uppercase tracking-widest text-stone-500">Bandeja de Dados</span>
            <button onClick={clearPool} className="text-stone-500 hover:text-red-500"><Trash2 size={14}/></button>
          </div>
          
          <div className="grid grid-cols-4 gap-2 mb-4">
            {[4, 6, 8, 10, 12, 20, 100].map(d => (
              <button 
                key={d} 
                onClick={() => addDice(d)}
                className="flex flex-col items-center justify-center p-2 bg-stone-800 hover:bg-stone-700 rounded-lg border border-stone-700 transition-all relative group"
              >
                <span className="text-stone-500 text-[10px] group-hover:text-amber-500">d{d}</span>
                {(Number(dicePool[d]) || 0) > 0 && (
                  <span className="absolute -top-1 -right-1 bg-amber-500 text-stone-950 text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center">
                    {dicePool[d]}
                  </span>
                )}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3 bg-stone-950 p-2 rounded-xl border border-stone-800 mb-4">
            <span className="text-[10px] font-bold text-stone-500 uppercase">Modificador</span>
            <div className="flex items-center gap-2 ml-auto">
              <button onClick={() => setModifier(m => m - 1)} className="p-1 hover:text-red-500"><Minus size={14}/></button>
              <span className={`font-mono font-bold ${modifier > 0 ? 'text-green-500' : modifier < 0 ? 'text-red-500' : 'text-stone-400'}`}>
                {modifier >= 0 ? '+' : ''}{modifier}
              </span>
              <button onClick={() => setModifier(m => m + 1)} className="p-1 hover:text-green-500"><Plus size={14}/></button>
            </div>
          </div>

          <button 
            onClick={executeRoll}
            disabled={totalDice === 0}
            className="w-full bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white font-black py-3 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg"
          >
            <Zap size={16} fill="currentColor"/> ROLAR
          </button>
        </div>
      )}
      
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-all hover:scale-110 active:scale-95 ${isOpen ? 'bg-amber-500 text-stone-950 rotate-45' : 'bg-stone-900 text-amber-500 border border-stone-800'}`}
      >
        {isOpen ? <X size={28}/> : <Dices size={28}/>}
        {!isOpen && totalDice > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center animate-pulse">
                {totalDice}
            </span>
        )}
      </button>
    </div>
  );
};
