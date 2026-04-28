import React, { useState, useEffect } from 'react';
import { Game, HeroClass } from '../adventureLogic';
import { Sword, Shield, Heart, Zap, Play, FastForward, Backpack, Skull, Save, RotateCcw, Sparkles, Coins, ShoppingBag, ShieldAlert } from 'lucide-react';

export const AdventureMode: React.FC = () => {
    const [game, setGame] = useState<Game>(new Game());
    const [tick, setTick] = useState(0); // Force re-render

    const updateView = () => setTick(t => t + 1);

    useEffect(() => {
        const saved = localStorage.getItem('rpgnep_adventure_save');
        if (saved) {
            const g = new Game();
            g.load();
            setGame(g);
        }
    }, []);

    const handleStart = (heroClass: HeroClass) => { game.startGame(heroClass); updateView(); };
    const handleNextRoom = () => { game.nextRoom(); updateView(); };
    const handleAttack = () => { game.attack(); updateView(); };
    const handleSkill = () => { game.useSkill(); updateView(); };
    const handleFlee = () => { game.flee(); updateView(); };
    const handleUseItem = (idx: number) => { game.useItem(idx); updateView(); };
    const handleBuyItem = (idx: number) => { game.buyItem(idx); updateView(); };
    const handleEventAction = (action: () => void) => { action(); updateView(); };
    const handleSave = () => { game.save(); updateView(); };
    const handleRestart = () => { 
        setConfirmRestart(true);
    };

    const [confirmRestart, setConfirmRestart] = useState(false);

    const performRestart = () => {
        const newGame = new Game();
        setGame(newGame);
        localStorage.removeItem('rpgnep_adventure_save');
        setConfirmRestart(false);
        updateView();
    };

    const p = game.player;
    const e = game.currentEnemy;

    if (game.state === 'start') {
        return (
            <div className="h-full w-full flex items-center justify-center bg-[#0c0a09] p-4">
                <div className="max-w-3xl w-full bg-stone-900/80 p-8 rounded-3xl border border-stone-800 shadow-2xl text-center">
                    <h1 className="text-5xl font-black font-cinzel text-amber-500 mb-4">MODO AVENTURA</h1>
                    <p className="text-stone-400 mb-8">Escolha sua classe para iniciar a jornada.</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <button onClick={() => handleStart('Guerreiro')} className="p-6 bg-stone-950 border border-stone-800 rounded-2xl hover:border-amber-500 hover:bg-stone-900 transition-all group">
                            <Sword size={48} className="mx-auto text-stone-500 group-hover:text-amber-500 mb-4 transition-colors"/>
                            <h3 className="text-xl font-bold text-white mb-2">Guerreiro</h3>
                            <p className="text-xs text-stone-500">Alto HP e Defesa. Usa Golpe Brutal.</p>
                        </button>
                        <button onClick={() => handleStart('Mago')} className="p-6 bg-stone-950 border border-stone-800 rounded-2xl hover:border-blue-500 hover:bg-stone-900 transition-all group">
                            <Sparkles size={48} className="mx-auto text-stone-500 group-hover:text-blue-500 mb-4 transition-colors"/>
                            <h3 className="text-xl font-bold text-white mb-2">Mago</h3>
                            <p className="text-xs text-stone-500">Alto MP e Dano. Usa Bola de Fogo.</p>
                        </button>
                        <button onClick={() => handleStart('Ladino')} className="p-6 bg-stone-950 border border-stone-800 rounded-2xl hover:border-emerald-500 hover:bg-stone-900 transition-all group">
                            <FastForward size={48} className="mx-auto text-stone-500 group-hover:text-emerald-500 mb-4 transition-colors"/>
                            <h3 className="text-xl font-bold text-white mb-2">Ladino</h3>
                            <p className="text-xs text-stone-500">Equilibrado. Usa Ataque Furtivo (Crítico).</p>
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full w-full p-4 md:p-8 overflow-y-auto custom-scrollbar bg-[#0c0a09] text-stone-200">
            <div className="max-w-5xl mx-auto space-y-6">
                
                {/* Header */}
                <div className="flex justify-between items-center bg-stone-900/80 p-4 rounded-2xl border border-stone-800 shadow-lg">
                    <div>
                        <h2 className="text-2xl font-cinzel font-bold text-amber-500">Modo Aventura</h2>
                        <p className="text-sm text-stone-400">Sala Atual: {game.currentRoom}</p>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={handleSave} className="p-2 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-lg transition-colors" title="Salvar Jogo"><Save size={20}/></button>
                        <button onClick={handleRestart} className="p-2 bg-red-900/20 hover:bg-red-900/40 text-red-500 rounded-lg transition-colors" title="Reiniciar"><RotateCcw size={20}/></button>
                    </div>
                </div>

                {confirmRestart && (
                    <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
                        <div className="bg-stone-900 border border-stone-700 p-8 rounded-3xl shadow-2xl max-w-md w-full animate-in zoom-in-95 text-center">
                            <RotateCcw size={48} className="text-amber-500 mx-auto mb-4 animate-spin-slow" />
                            <h3 className="text-2xl font-cinzel font-bold text-white mb-2">Reiniciar Aventura?</h3>
                            <p className="text-stone-400 mb-8">Todo o progresso atual será perdido permanentemente.</p>
                            <div className="grid grid-cols-2 gap-4">
                                <button 
                                    onClick={() => setConfirmRestart(false)} 
                                    className="px-6 py-3 bg-stone-800 hover:bg-stone-700 text-white rounded-xl font-bold transition-all"
                                >
                                    Cancelar
                                </button>
                                <button 
                                    onClick={performRestart} 
                                    className="px-6 py-3 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-red-900/20"
                                >
                                    Confirmar
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    
                    {/* Player Status */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="bg-stone-900/80 p-5 rounded-2xl border border-stone-800 shadow-lg">
                            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2 border-b border-stone-800 pb-2"><Heart size={18} className="text-red-500"/> Herói (Nível {p.level})</h3>
                            
                            <div className="space-y-3">
                                <div>
                                    <div className="flex justify-between text-xs font-bold mb-1">
                                        <span className="text-stone-400">HP</span>
                                        <span className="text-red-400">{p.hp} / {p.hpMax}</span>
                                    </div>
                                    <div className="w-full bg-stone-950 rounded-full h-2.5 border border-stone-800">
                                        <div className="bg-red-600 h-2.5 rounded-full transition-all duration-500" style={{ width: `${Math.max(0, (p.hp / p.hpMax) * 100)}%` }}></div>
                                    </div>
                                </div>
                                
                                <div>
                                    <div className="flex justify-between text-xs font-bold mb-1">
                                        <span className="text-stone-400">MP</span>
                                        <span className="text-blue-400">{p.mp} / {p.mpMax}</span>
                                    </div>
                                    <div className="w-full bg-stone-950 rounded-full h-2.5 border border-stone-800">
                                        <div className="bg-blue-600 h-2.5 rounded-full transition-all duration-500" style={{ width: `${Math.max(0, (p.mp / p.mpMax) * 100)}%` }}></div>
                                    </div>
                                </div>

                                <div>
                                    <div className="flex justify-between text-xs font-bold mb-1">
                                        <span className="text-stone-400">XP</span>
                                        <span className="text-emerald-400">{p.xp} / {p.xpNeeded()}</span>
                                    </div>
                                    <div className="w-full bg-stone-950 rounded-full h-2.5 border border-stone-800">
                                        <div className="bg-emerald-600 h-2.5 rounded-full transition-all duration-500" style={{ width: `${Math.min(100, (p.xp / p.xpNeeded()) * 100)}%` }}></div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3 pt-2">
                                    <div className="bg-stone-950 p-2 rounded-lg border border-stone-800 flex items-center gap-2">
                                        <Sword size={16} className="text-amber-500"/>
                                        <div>
                                            <div className="text-[10px] text-stone-500 uppercase">Ataque</div>
                                            <div className="font-bold text-sm">{p.attack} <span className="text-[10px] text-stone-500">({p.baseAttack}+{p.weapon?.atkBonus||0})</span></div>
                                        </div>
                                    </div>
                                    <div className="bg-stone-950 p-2 rounded-lg border border-stone-800 flex items-center gap-2">
                                        <Shield size={16} className="text-stone-400"/>
                                        <div>
                                            <div className="text-[10px] text-stone-500 uppercase">Defesa</div>
                                            <div className="font-bold text-sm">{p.defense} <span className="text-[10px] text-stone-500">({p.baseDefense}+{p.armor?.defBonus||0})</span></div>
                                        </div>
                                    </div>
                                    <div className="bg-stone-950 p-2 rounded-lg border border-stone-800 flex items-center gap-2 col-span-2">
                                        <Coins size={16} className="text-yellow-500"/>
                                        <div>
                                            <div className="text-[10px] text-stone-500 uppercase">Ouro</div>
                                            <div className="font-bold text-sm text-yellow-500">{p.gold} PO</div>
                                        </div>
                                    </div>
                                </div>
                                
                                {/* Equipment */}
                                <div className="pt-2 border-t border-stone-800 mt-2 space-y-2">
                                    <div className="flex items-center gap-2 bg-stone-950 p-2 rounded-lg border border-stone-800">
                                        <Sword size={14} className="text-stone-500"/>
                                        <div className="text-xs">
                                            <span className="text-stone-500">Arma: </span>
                                            <span className={p.weapon ? 'text-stone-300 font-bold' : 'text-stone-600'}>{p.weapon ? p.weapon.name : 'Desarmado'}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 bg-stone-950 p-2 rounded-lg border border-stone-800">
                                        <Shield size={14} className="text-stone-500"/>
                                        <div className="text-xs">
                                            <span className="text-stone-500">Armadura: </span>
                                            <span className={p.armor ? 'text-stone-300 font-bold' : 'text-stone-600'}>{p.armor ? p.armor.name : 'Roupas Comuns'}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Inventory */}
                        <div className="bg-stone-900/80 p-5 rounded-2xl border border-stone-800 shadow-lg">
                            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2 border-b border-stone-800 pb-2"><Backpack size={18} className="text-amber-700"/> Inventário</h3>
                            <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar pr-2">
                                {p.inventory.length === 0 ? (
                                    <div className="text-sm text-stone-500 text-center py-4">Inventário vazio</div>
                                ) : (
                                    p.inventory.map((item, idx) => (
                                        <div key={idx} className="flex justify-between items-center bg-stone-950 p-2 rounded-lg border border-stone-800">
                                            <div>
                                                <div className={`text-sm font-bold ${item.rarity === 'Lendário' ? 'text-amber-400' : item.rarity === 'Épico' ? 'text-purple-400' : item.rarity === 'Raro' ? 'text-blue-400' : 'text-stone-300'}`}>{item.name}</div>
                                                <div className="text-[10px] text-stone-500">
                                                    {item.type === 'potion' && item.heal && `Cura ${item.heal} HP`}
                                                    {item.type === 'potion' && item.mpHeal && `Recupera ${item.mpHeal} MP`}
                                                    {item.type === 'weapon' && `+${item.atkBonus} Ataque`}
                                                    {item.type === 'armor' && `+${item.defBonus} Defesa`}
                                                </div>
                                            </div>
                                            <button 
                                                onClick={() => handleUseItem(idx)}
                                                disabled={game.state === 'gameover'}
                                                className="px-3 py-1 bg-stone-800 hover:bg-stone-700 text-xs font-bold rounded transition-colors disabled:opacity-50"
                                            >
                                                {item.type === 'potion' ? 'Usar' : 'Equipar'}
                                            </button>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Main Area (Enemy & Actions) */}
                    <div className="lg:col-span-2 space-y-6 flex flex-col">
                        
                        {/* Enemy / Room View */}
                        <div className="bg-stone-900/80 p-6 rounded-2xl border border-stone-800 shadow-lg flex-1 flex flex-col items-center justify-center min-h-[250px] relative overflow-hidden">
                            {game.state === 'gameover' ? (
                                <div className="text-center space-y-4 animate-in zoom-in">
                                    <Skull size={64} className="text-red-600 mx-auto"/>
                                    <h2 className="text-3xl font-black text-red-500 font-cinzel">FIM DE JOGO</h2>
                                    <p className="text-stone-400">Você sobreviveu até a sala {game.currentRoom}.</p>
                                </div>
                            ) : game.state === 'victory' ? (
                                <div className="text-center space-y-4 animate-in zoom-in">
                                    <div className="text-6xl mx-auto">🏆</div>
                                    <h2 className="text-3xl font-black text-amber-500 font-cinzel">VITÓRIA!</h2>
                                    <p className="text-stone-300">Você derrotou o Chefe Final e conquistou a masmorra!</p>
                                    <p className="text-sm text-stone-500">Nível Final: {p.level} | Ouro: {p.gold}</p>
                                </div>
                            ) : game.state === 'combat' && e ? (
                                <div className="w-full max-w-md animate-in slide-in-from-right flex flex-col items-center">
                                    {e.imageUrl && (
                                        <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-stone-800 shadow-2xl mb-4 relative">
                                            <img src={e.imageUrl} alt={e.name} className="w-full h-full object-cover" />
                                            {e.isBoss && <div className="absolute inset-0 ring-4 ring-purple-500 rounded-full animate-pulse"></div>}
                                        </div>
                                    )}
                                    <div className="text-center mb-6">
                                        <h3 className={`text-2xl font-black font-cinzel ${e.isBoss ? 'text-purple-500' : 'text-red-500'}`}>{e.name}</h3>
                                        <p className="text-sm text-stone-400">CA: {e.defense} | CR: {e.monsterDef?.cr || '?'}</p>
                                    </div>
                                    
                                    <div className="mb-2 w-full">
                                        <div className="flex justify-between text-xs font-bold mb-1">
                                            <span className="text-stone-400">HP Inimigo</span>
                                            <span className="text-red-400">{e.hp} / {e.hpMax}</span>
                                        </div>
                                        <div className="w-full bg-stone-950 rounded-full h-4 border border-stone-800 overflow-hidden">
                                            <div className={`h-full transition-all duration-300 ${e.isBoss ? 'bg-purple-600' : 'bg-red-600'}`} style={{ width: `${Math.max(0, (e.hp / e.hpMax) * 100)}%` }}></div>
                                        </div>
                                    </div>
                                </div>
                            ) : game.state === 'merchant' ? (
                                <div className="w-full max-w-md animate-in fade-in">
                                    <div className="text-center mb-6">
                                        <ShoppingBag size={48} className="text-amber-500 mx-auto mb-4"/>
                                        <h3 className="text-2xl font-black font-cinzel text-amber-500">Mercador</h3>
                                        <p className="text-sm text-stone-400">"Tenho mercadorias raras, se você tiver o ouro."</p>
                                    </div>
                                    <div className="space-y-3">
                                        {game.merchantItems.map((item, idx) => (
                                            <div key={idx} className={`flex justify-between items-center bg-stone-950 p-3 rounded-xl border ${item.sold ? 'border-stone-800 opacity-50' : 'border-stone-700'}`}>
                                                <div>
                                                    <div className={`text-sm font-bold ${item.rarity === 'Lendário' ? 'text-amber-400' : item.rarity === 'Épico' ? 'text-purple-400' : item.rarity === 'Raro' ? 'text-blue-400' : 'text-stone-300'}`}>{item.name}</div>
                                                    <div className="text-[10px] text-stone-500">
                                                        {item.type === 'potion' && item.heal && `Cura ${item.heal} HP`}
                                                        {item.type === 'potion' && item.mpHeal && `Recupera ${item.mpHeal} MP`}
                                                        {item.type === 'weapon' && `+${item.atkBonus} Ataque`}
                                                        {item.type === 'armor' && `+${item.defBonus} Defesa`}
                                                    </div>
                                                </div>
                                                <button 
                                                    onClick={() => handleBuyItem(idx)}
                                                    disabled={item.sold || p.gold < item.price}
                                                    className="px-4 py-2 bg-amber-900/20 hover:bg-amber-900/40 text-amber-500 border border-amber-900/50 text-xs font-bold rounded-lg transition-colors disabled:opacity-50 flex items-center gap-1"
                                                >
                                                    {item.sold ? 'Vendido' : <>{item.price} <Coins size={12}/></>}
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : game.state === 'event' && game.currentEvent ? (
                                <div className="w-full max-w-md animate-in fade-in text-center">
                                    <ShieldAlert size={48} className="text-purple-500 mx-auto mb-4"/>
                                    <h3 className="text-2xl font-black font-cinzel text-purple-400 mb-2">{game.currentEvent.title}</h3>
                                    <p className="text-stone-300 mb-8">{game.currentEvent.desc}</p>
                                    <div className="space-y-3">
                                        {game.currentEvent.options.map((opt, idx) => (
                                            <button 
                                                key={idx}
                                                onClick={() => handleEventAction(opt.action)}
                                                className="w-full p-4 bg-stone-950 hover:bg-stone-800 border border-stone-700 rounded-xl font-bold text-stone-300 transition-colors"
                                            >
                                                {opt.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center space-y-4 text-stone-400 animate-in fade-in">
                                    <FastForward size={48} className="text-stone-600 mx-auto"/>
                                    <p>A sala parece segura. O que você fará?</p>
                                </div>
                            )}
                        </div>

                        {/* Actions */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            <button 
                                onClick={handleNextRoom}
                                disabled={game.state === 'combat' || game.state === 'gameover' || game.state === 'victory' || game.state === 'merchant' || game.state === 'event'}
                                className="p-4 bg-stone-800 hover:bg-stone-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl font-bold flex flex-col items-center gap-2 transition-all border border-stone-700"
                            >
                                <Play size={24} className="text-emerald-500"/>
                                <span className="text-xs uppercase tracking-wider">Avançar Sala</span>
                            </button>
                            
                            <button 
                                onClick={handleAttack}
                                disabled={game.state !== 'combat'}
                                className="p-4 bg-red-900/20 hover:bg-red-900/40 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl font-bold flex flex-col items-center gap-2 transition-all border border-red-900/50 text-red-400"
                            >
                                <Sword size={24}/>
                                <span className="text-xs uppercase tracking-wider">Atacar</span>
                            </button>

                            <button 
                                onClick={handleSkill}
                                disabled={game.state !== 'combat' || p.mp < 10}
                                className="p-4 bg-blue-900/20 hover:bg-blue-900/40 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl font-bold flex flex-col items-center gap-2 transition-all border border-blue-900/50 text-blue-400"
                            >
                                <Sparkles size={24}/>
                                <span className="text-xs uppercase tracking-wider">Habilidade</span>
                            </button>

                            <button 
                                onClick={handleFlee}
                                disabled={game.state !== 'combat' || e?.isBoss}
                                className="p-4 bg-stone-800 hover:bg-stone-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl font-bold flex flex-col items-center gap-2 transition-all border border-stone-700 text-stone-400"
                            >
                                <FastForward size={24}/>
                                <span className="text-xs uppercase tracking-wider">Fugir</span>
                            </button>
                        </div>

                        {/* Logs */}
                        <div className="bg-stone-950 p-4 rounded-2xl border border-stone-800 shadow-inner h-48 overflow-y-auto custom-scrollbar flex flex-col-reverse">
                            <div className="space-y-2">
                                {game.logs.map((log, i) => (
                                    <div key={i} className={`text-sm ${i === 0 ? 'text-white font-bold' : 'text-stone-500'}`}>
                                        <span className="opacity-50 mr-2">&gt;</span> {log}
                                    </div>
                                ))}
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
};
