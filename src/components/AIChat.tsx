
import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI } from "@google/genai";
import { Sparkles, Send, X, Bot, User, Loader2, BookOpen, Swords, AlertTriangle } from 'lucide-react';
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
    { role: 'model', text: 'Saudações! Sou o Oráculo Arcano. Como posso ajudar em sua aventura hoje?', isError: false }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
        setMessages(prev => [...prev, { role: 'model', text: 'Erro de Configuração: API Key não encontrada nas variáveis de ambiente.', isError: true }]);
        return;
    }

    const userMsg = input.trim();
    setInput('');
    
    const userMessage: AIMessage = { role: 'user', text: userMsg, isError: false };
    
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey });
      
      const partySummary = characters.map(c => `${c.name} (${c.class} ${c.level})`).join(', ');
      const combatSummary = encounter.length > 0 
        ? `Combate Ativo: ${encounter.map(e => `${e.name} (HP:${e.hpCurrent}/${e.hpMax})`).join(', ')}`
        : 'Sem combate ativo.';

      const systemPrompt = `Você é o "Oráculo Arcano", especialista em D&D 5e.
      Mesa Atual:
      - Grupo: ${partySummary}
      - Situação: ${combatSummary}
      
      Diretrizes:
      1. Respostas curtas e diretas (max 3 parágrafos).
      2. Use regras oficiais da 5e.
      3. Seja imersivo mas útil.`;

      const apiContents = messages
        .filter(m => !m.isError) 
        .map(m => ({
          role: m.role,
          parts: [{ text: m.text }]
        }));
      
      // Add the new user message
      apiContents.push({
          role: 'user',
          parts: [{ text: userMsg }]
      });

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview', 
        contents: apiContents,
        config: {
            systemInstruction: systemPrompt,
            temperature: 0.7,
        }
      });

      setMessages(prev => [...prev, { role: 'model', text: response.text || "O silêncio do vazio respondeu (Resposta vazia).", isError: false }]);
    } catch (error: any) {
      console.error("Gemini Error:", error);
      let errorMsg = "Erro desconhecido na conexão com o plano astral.";
      
      if (error.message?.includes('403') || error.toString().includes('403')) {
          errorMsg = "Erro 403 (Permissão): A chave API atual não tem permissão ou expirou.";
      } else if (error.message?.includes('400')) {
          errorMsg = "Erro 400: O Oráculo não entendeu a requisição.";
      } else if (error.message?.includes('429')) {
          errorMsg = "Erro 429: Muitos pedidos ao Oráculo. Aguarde um momento.";
      }

      setMessages(prev => [...prev, { role: 'model', text: errorMsg, isError: true }]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="absolute top-0 right-0 w-80 md:w-96 h-full bg-stone-900 border-l border-stone-800 shadow-2xl z-50 flex flex-col animate-in slide-in-from-right duration-300">
      <div className="p-4 bg-stone-950 border-b border-stone-800 flex justify-between items-center shrink-0">
        <div className="flex items-center gap-2 text-purple-400 font-cinzel font-bold">
            <Sparkles size={20} className={isLoading ? "animate-spin" : ""} />
            <span>ORÁCULO ARCANO</span>
        </div>
        <div className="flex gap-2">
            <button onClick={onClose} className="text-stone-500 hover:text-white transition-colors">
                <X size={20} />
            </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar space-y-4 bg-[#0a0a0a] relative">
        {messages.map((msg, i) => (
        <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-sm ${msg.role === 'user' ? 'bg-amber-600' : msg.isError ? 'bg-red-900' : 'bg-purple-900'}`}>
                {msg.role === 'user' ? <User size={16} /> : msg.isError ? <AlertTriangle size={16}/> : <Bot size={16} />}
            </div>
            <div className={`max-w-[85%] p-3 rounded-lg text-sm leading-relaxed ${
                msg.role === 'user' 
                ? 'bg-amber-900/20 border border-amber-600/30 text-stone-200' 
                : msg.isError 
                    ? 'bg-red-900/20 border border-red-500/50 text-red-200'
                    : 'bg-stone-800 border border-stone-700 text-stone-300'
            }`}>
                {msg.text}
            </div>
        </div>
        ))}
        {isLoading && (
            <div className="flex gap-3 items-center text-purple-400 text-xs italic animate-pulse">
                <Loader2 size={14} className="animate-spin" />
                <span>Consultando os planos...</span>
            </div>
        )}
        <div ref={scrollRef} />
      </div>

      <div className="p-4 bg-stone-950 border-t border-stone-800 space-y-3">
        <div className="grid grid-cols-2 gap-2">
            <button onClick={() => setInput('Descreva uma sala de tesouro amaldiçoada.')} className="text-[10px] bg-stone-800 hover:bg-stone-700 p-1.5 rounded text-stone-400 flex items-center gap-1"><BookOpen size={10}/> Descrever Sala</button>
            <button onClick={() => setInput('Como funciona a regra de agarrar?')} className="text-[10px] bg-stone-800 hover:bg-stone-700 p-1.5 rounded text-stone-400 flex items-center gap-1"><Swords size={10}/> Regra Combate</button>
        </div>
        <div className="flex gap-2">
            <input 
                className="flex-1 bg-stone-900 border border-stone-700 rounded-lg px-3 py-2 text-sm text-white focus:border-purple-600 outline-none transition-all"
                placeholder="Pergunte ao Oráculo..."
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSend()}
            />
            <button 
                onClick={handleSend}
                disabled={isLoading || !input.trim()}
                className="bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white p-2 rounded-lg transition-all"
            >
                <Send size={18} />
            </button>
        </div>
      </div>
    </div>
  );
};
