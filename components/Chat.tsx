import React, { useEffect, useRef, useState } from 'react';
import { ChatMessage } from '../types';
import { MessageCircle, Send, Dices, Shield, Sword, Sparkles, User, Bot, History, Trash2 } from 'lucide-react';

interface ChatProps {
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
  onClearMessages?: () => void;
  username: string;
  isFullPage?: boolean;
}

export const Chat: React.FC<ChatProps> = ({ messages, onSendMessage, onClearMessages, username, isFullPage = false }) => {
  const [inputText, setInputText] = useState('');
  const [showQuickRolls, setShowQuickRolls] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleSend = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputText.trim()) return;
    onSendMessage(inputText);
    setInputText('');
  };

  const quickRoll = (dice: string) => {
    onSendMessage(`/r ${dice}`);
    setShowQuickRolls(false);
  };

  const parseMessageText = (text: string) => {
      if (text.startsWith('🎲 Rolou')) {
          const parts = text.split('**');
          if (parts.length >= 2) {
              return (
                  <div className="flex flex-col bg-amber-500/10 border border-amber-500/30 p-2 rounded-lg my-1">
                      <span className="text-[10px] font-bold uppercase text-amber-600 mb-1 flex items-center gap-1">
                          <Dices size={10}/> Resultado do Dado
                      </span>
                      <span className="text-sm">
                          {parts[0].replace('🎲 ', '')} 
                          <span className="font-bold text-xl text-amber-500 ml-1 drop-shadow-[0_0_8px_rgba(245,158,11,0.3)]">
                              {parts[1]}
                          </span>
                      </span>
                  </div>
              );
          }
      }
      if (text.startsWith('*') && text.endsWith('*')) {
          return <span className="italic text-stone-400 opacity-80">{text.slice(1, -1)}</span>;
      }
      return text;
  };

  const containerClasses = isFullPage 
    ? "flex flex-col h-full w-full bg-[#0f0f11] border border-stone-800 rounded-xl shadow-2xl overflow-hidden"
    : "w-full h-full bg-[#0f0f11] border border-stone-800 rounded-xl flex flex-col shadow-lg overflow-hidden";

  return (
    <div className={containerClasses}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-[#151518] border-b border-stone-800 shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-amber-500/10 rounded-lg">
            <MessageCircle size={isFullPage ? 20 : 18} className="text-amber-500"/> 
          </div>
          <div>
            <h2 className={`font-cinzel font-bold text-stone-200 ${isFullPage ? "text-lg" : "text-sm"}`}>
              Chat da Campanha
            </h2>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
              <span className="text-[10px] text-stone-500 uppercase font-bold tracking-wider">Online</span>
            </div>
          </div>
        </div>
        {onClearMessages && (
          <button 
            onClick={onClearMessages}
            className="p-2 text-stone-500 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
            title="Apagar Histórico"
          >
            <Trash2 size={18} />
          </button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-[#0a0a0c]">
        {messages.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-center text-stone-500 opacity-40">
                <MessageCircle size={48} className="mb-4"/>
                <p className="text-sm font-cinzel">O silêncio impera na taverna...</p>
                <p className="mt-2 text-[10px] uppercase font-bold tracking-widest">Inicie a conversa ou role os dados</p>
            </div>
        )}
        {messages.map((msg) => {
          const isMe = msg.author === username;
          const isSystem = msg.isSystem;
          const isDM = msg.author === 'Mestre' || msg.author === 'DM';
          
          if (isSystem && !msg.text.includes('🎲')) {
              return (
                  <div key={msg.id} className="flex items-center gap-3 my-4">
                      <div className="h-px flex-1 bg-gradient-to-r from-transparent via-stone-800 to-transparent"></div>
                      <span className="text-[10px] text-stone-500 italic font-bold uppercase tracking-widest px-2">
                        {msg.text}
                      </span>
                      <div className="h-px flex-1 bg-gradient-to-r from-transparent via-stone-800 to-transparent"></div>
                  </div>
              )
          }

          const isDice = msg.text.includes('🎲');

          return (
            <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} animate-in fade-in slide-in-from-bottom-2`}>
              <div className={`flex items-center gap-1.5 mb-1 px-1 ${isMe ? 'flex-row-reverse' : ''}`}>
                <div className={`p-1 rounded bg-stone-900 border border-stone-800`}>
                  {isDM ? <Shield size={10} className="text-amber-500"/> : isSystem ? <Bot size={10} className="text-blue-500"/> : <User size={10} className="text-stone-400"/>}
                </div>
                <span className={`text-[10px] font-bold uppercase tracking-wider ${isMe ? 'text-amber-500' : isDM ? 'text-amber-400' : 'text-stone-500'}`}>
                  {msg.author}
                </span>
              </div>
              
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm shadow-xl relative group transition-all ${
                  isDice 
                    ? 'bg-[#1a1a1d] border border-amber-500/20 text-stone-200 rounded-lg'
                    : isMe
                        ? 'bg-amber-600/10 text-stone-200 border border-amber-600/30 rounded-tr-none hover:bg-amber-600/20'
                        : isDM
                          ? 'bg-purple-600/10 text-stone-200 border border-purple-600/30 rounded-tl-none hover:bg-purple-600/20'
                          : 'bg-stone-900 text-stone-300 border border-stone-800 rounded-tl-none hover:bg-stone-800'
                }`}
              >
                <div className="leading-relaxed">
                  {parseMessageText(msg.text)}
                </div>
                <div className={`text-[8px] mt-1 opacity-0 group-hover:opacity-40 transition-opacity absolute bottom-1 ${isMe ? 'right-2' : 'left-2'}`}>
                  {new Date(msg.timestamp).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Rolls Panel */}
      {showQuickRolls && (
        <div className="px-4 py-2 bg-[#151518] border-t border-stone-800 flex flex-wrap gap-2 animate-in slide-in-from-bottom-2">
          {['1d4', '1d6', '1d8', '1d10', '1d12', '1d20', '1d100'].map(dice => (
            <button 
              key={dice}
              onClick={() => quickRoll(dice)}
              className="px-2 py-1 bg-stone-900 border border-stone-700 rounded text-[10px] font-bold text-stone-400 hover:text-amber-500 hover:border-amber-500 transition-all"
            >
              {dice}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <form onSubmit={handleSend} className="p-4 bg-[#151518] border-t border-stone-800 flex gap-2 items-center shrink-0">
        <button 
          type="button"
          onClick={() => setShowQuickRolls(!showQuickRolls)}
          className={`p-2 rounded-lg border transition-all ${showQuickRolls ? 'bg-amber-500 border-amber-400 text-black' : 'bg-stone-900 border-stone-800 text-stone-500 hover:text-amber-500 hover:border-amber-500'}`}
          title="Rolagens Rápidas"
        >
          <Dices size={20}/>
        </button>
        <div className="flex-1 relative">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Digite sua mensagem ou /r 1d20..."
            className="w-full bg-[#0a0a0c] border border-stone-800 rounded-xl py-2.5 pl-4 pr-10 text-sm text-stone-200 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all"
          />
          <button
            type="submit"
            disabled={!inputText.trim()}
            className="absolute right-2 top-1.5 p-1.5 text-amber-600 hover:text-amber-500 disabled:opacity-30 disabled:hover:text-amber-600 transition-colors"
          >
            <Send size={18} />
          </button>
        </div>
      </form>
    </div>
  );
};
