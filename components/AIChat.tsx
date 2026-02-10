
import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI } from "@google/genai";
import { Sparkles, Send, X, Bot, User, Loader2, BookOpen, Swords, AlertTriangle, ScrollText } from 'lucide-react';
import { Character, EncounterParticipant } from '../types';

interface AIMessage {
    role: 'user' | 'model';
    text: string;
    isError?: boolean;
}

interface AIChatProps {
  isOpen: boolean;
  onClose: () => void;
  characters: Character[];
  encounter: EncounterParticipant[];
}

export const AIChat: React.FC<AIChatProps> = ({ isOpen, onClose, characters, encounter }) => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<AIMessage[]>([
    { role: 'model', text: 'Saudações, nobre mestre ou aventureiro! Sou o Oráculo Arcano. O que as estrelas e o grimório devem revelar para sua jornada hoje?', isError: false }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (customPrompt?: string) => {
    const userMsg = (customPrompt || input).trim();
    if (!userMsg || isLoading) return;
    
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
        setMessages(prev => [...prev, { role: 'model', text: 'O Oráculo está mudo: API Key não configurada.', isError: true }]);
        return;
    }

    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey });
      
      const partySummary = characters.map(c => `${c.name} (Nvl ${c.level} ${c.class})`).join(', ') || 'Nenhum aventureiro detectado.';
      const combatSummary = encounter.length > 0 
        ? `Combate Ativo: ${encounter.map(e => `${e.name} (CA ${e.ac}, HP:${e.hpCurrent}/${e.hpMax})`).join(', ')}`
        : 'Paz momentânea (sem combate ativo).';

      const systemInstruction = `Você é o "Oráculo Arcano", o assistente definitivo para D&D 5e (Dungeons & Dragons 5ª Edição).
      Contexto Atual da Mesa:
      - Grupo: ${partySummary}
      - Status: ${combatSummary}
      
      Diretrizes de Personalidade e Resposta:
      1. Use um tom místico, erudito e prestativo.
      2. Conheça profundamente as regras da 5e (SRD). Se uma regra for solicitada, explique-a claramente.
      3. Seja conciso. Não escreva romances a menos que solicitado para narrar uma cena.
      4. Ajude o Mestre com: nomes de NPCs, descrições de salas, loot aleatório, ou estatísticas de monstros.
      5. Se solicitado um item mágico, adapte o nível de raridade ao nível médio do grupo.
      6. Você pode interpretar rolagens de dados se o usuário fornecer o resultado.`;

      const history = messages.filter(m => !m.isError).map(m => ({
          role: m.role,
          parts: [{ text: m.text }]
      }));

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview', 
        contents: [...history, { role: 'user', parts: [{ text: userMsg }] }],
        config: {
            systemInstruction,
            temperature: 0.7,
        }
      });

      const responseText = response.text || "O Plano Astral está silencioso no momento.";
      setMessages(prev => [...prev, { role: 'model', text: responseText, isError: false }]);
    } catch (error: any) {
      console.error("Gemini Oracle Error:", error);
      setMessages(prev => [...prev, { role: 'model', text: "Houve uma instabilidade no Plano Astral: " + (error.message || "Erro desconhecido"), isError: true }]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="absolute top-0 right-0 w-[320px] md:w-[400px] h-full bg-[#1c1917] border-l border-stone-800 shadow-[0_0_40px_rgba(0,0,0,0.7)] z-50 flex flex-col animate-in slide-in-from-right duration-300">
      <div className="p-4 bg-stone-950 border-b border-stone-800 flex justify-between items-center shrink-0">
        <div className="flex items-center gap-2 text-amber-500 font-cinzel font-bold">
            <Sparkles size={20} className={isLoading ? "animate-spin" : ""} />
            <span className="tracking-widest">ORÁCULO ARCANO</span>
        </div>
        <button onClick={onClose} className="text-stone-500 hover:text-white transition-colors">
            <X size={20} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar space-y-4 bg-[#0c0a09] relative bg-[url('https://www.transparenttextures.com/patterns/parchment.png')]">
        {messages.map((msg, i) => (
        <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-lg ${msg.role === 'user' ? 'bg-blue-600' : msg.isError ? 'bg-red-900' : 'bg-amber-700'}`}>
                {msg.role === 'user' ? <User size={16} /> : msg.isError ? <AlertTriangle size={16}/> : <Bot size={16} />}
            </div>
            <div className={`max-w-[85%] p-3 rounded-2xl text-sm leading-relaxed shadow-md ${
                msg.role === 'user' 
                ? 'bg-blue-900/20 border border-blue-600/30 text-stone-200 rounded-tr-none' 
                : msg.isError 
                    ? 'bg-red-900/20 border border-red-500/50 text-red-200'
                    : 'bg-[#262626] border border-stone-700 text-stone-300 rounded-tl-none'
            }`}>
                {msg.text}
            </div>
        </div>
        ))}
        {isLoading && (
            <div className="flex gap-3 items-center text-amber-500 text-xs italic animate-pulse">
                <Loader2 size={14} className="animate-spin" />
                <span>Consultando o éter...</span>
            </div>
        )}
        <div ref={scrollRef} />
      </div>

      <div className="p-4 bg-stone-950 border-t border-stone-800 space-y-3">
        <div className="grid grid-cols-2 gap-2">
            <button onClick={() => handleSend('Crie um encontro de nível fácil em uma floresta.')} className="text-[10px] bg-stone-800 hover:bg-stone-700 p-2 rounded text-stone-400 flex items-center gap-2 transition-colors"><Swords size={12}/> Encontro Rápido</button>
            <button onClick={() => handleSend('Sugira 3 nomes de NPCs para uma taverna portuária.')} className="text-[10px] bg-stone-800 hover:bg-stone-700 p-2 rounded text-stone-400 flex items-center gap-2 transition-colors"><ScrollText size={12}/> Nomes de NPCs</button>
        </div>
        <div className="flex gap-2">
            <input 
                className="flex-1 bg-[#1a1a1a] border border-stone-700 rounded-xl px-4 py-2.5 text-sm text-white focus:border-amber-600 outline-none transition-all placeholder-stone-600"
                placeholder="Pergunte ao Oráculo..."
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSend()}
            />
            <button 
                onClick={() => handleSend()}
                disabled={isLoading || !input.trim()}
                className="bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white p-2.5 rounded-xl transition-all shadow-lg shadow-amber-900/20"
            >
                <Send size={18} />
            </button>
        </div>
      </div>
    </div>
  );
};
