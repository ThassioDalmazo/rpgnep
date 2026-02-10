import React, { useEffect, useRef, useState } from 'react';
import { ChatMessage } from '../types';
import { MessageCircle, Send, Dices } from 'lucide-react';

interface ChatProps {
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
  username: string;
  isFullPage?: boolean;
}

export const Chat: React.FC<ChatProps> = ({ messages, onSendMessage, username, isFullPage = false }) => {
  const [inputText, setInputText] = useState('');
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

  const parseMessageText = (text: string) => {
      if (text.startsWith('🎲 Rolou')) {
          const parts = text.split('**');
          if (parts.length >= 2) {
              return (
                  <span className="flex flex-col">
                      <span className="text-[10px] font-bold uppercase text-stone-500 mb-1 flex items-center gap-1"><Dices size={10}/> Resultado</span>
                      <span>{parts[0].replace('🎲 ', '')} <span className="font-bold text-lg text-amber-500">{parts[1]}</span></span>
                  </span>
              );
          }
      }
      if (text.startsWith('*') && text.endsWith('*')) {
          return <span className="italic text-stone-400">{text.slice(1, -1)}</span>;
      }
      return text;
  };

  const containerClasses = isFullPage 
    ? "flex flex-col h-full w-full bg-stone-100 dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-lg shadow-sm"
    : "w-full h-full bg-stone-100 dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-lg flex flex-col";

  return (
    <div className={containerClasses}>
      {/* Header */}
      <div className={`flex items-center justify-between p-3 bg-stone-200 dark:bg-stone-950 border-b border-stone-300 dark:border-stone-800 shrink-0 rounded-t-lg`}>
        <div className="flex items-center gap-2 font-bold text-stone-700 dark:text-stone-300 text-sm">
          <MessageCircle size={isFullPage ? 20 : 16} className="text-amber-600"/> 
          <span className={isFullPage ? "text-lg font-cinzel" : ""}>Chat da Campanha</span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar bg-stone-50 dark:bg-[#0a0a0c]">
        {messages.length === 0 && (
            <div className="text-center text-xs text-stone-400 mt-10 italic opacity-60">
                <MessageCircle size={48} className="mx-auto mb-2 opacity-20"/>
                <p>O chat está vazio.</p>
                <p className="mt-2 text-[10px]">Tente digitar <strong>/r 1d20</strong> para rolar um dado.</p>
            </div>
        )}
        {messages.map((msg) => {
          const isMe = msg.author === username;
          const isSystem = msg.isSystem;
          
          if (isSystem && !msg.text.includes('🎲')) {
              return (
                  <div key={msg.id} className="text-center my-2 px-4">
                      <span className="text-[10px] text-stone-500 italic block">
                        {parseMessageText(msg.text)}
                      </span>
                  </div>
              )
          }

          const isDice = msg.text.startsWith('🎲');

          return (
            <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
              <div className={`text-[10px] mb-1 px-1 font-bold ${isMe ? 'text-amber-600' : 'text-stone-500'}`}>
                {msg.author}
              </div>
              <div
                className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm shadow-sm relative group ${
                  isDice 
                    ? 'bg-stone-200 dark:bg-stone-800 border border-stone-400 dark:border-stone-600 text-stone-800 dark:text-stone-200 rounded-lg'
                    : isMe
                        ? 'bg-amber-100 dark:bg-amber-900/40 text-stone-900 dark:text-stone-200 border border-amber-200 dark:border-amber-800/50 rounded-tr-none'
                        : 'bg-white dark:bg-[#1a1a1d] text-stone-800 dark:text-stone-300 border border-stone-200 dark:border-stone-800 rounded-tl-none'
                }`}
              >
                {parseMessageText(msg.text)}
                <div className={`text-[9px] mt-1 opacity-40 ${isMe && !isDice ? 'text-amber-900 dark:text-amber-100 text-right' : 'text-stone-500 text-left'}`}>
                    {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="p-3 border-t border-stone-300 dark:border-stone-800 bg-stone-200 dark:bg-stone-950 rounded-b-lg shrink-0 flex gap-2">
        <input
          className="flex-1 bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-amber-500 text-stone-900 dark:text-stone-200 shadow-inner"
          placeholder="Mensagem ou /r 1d20..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
        />
        <button
          type="submit"
          disabled={!inputText.trim()}
          className="p-2.5 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 disabled:hover:bg-amber-600 text-white rounded-lg transition-all shadow-md hover:shadow-lg active:scale-95"
        >
          <Send size={18} />
        </button>
      </form>
    </div>
  );
};