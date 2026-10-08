import React, { useState, useRef, useEffect } from 'react';
import { 
  MessageSquare, 
  X, 
  Send, 
  Sparkles, 
  Bot, 
  User, 
  Minimize2, 
  Maximize2,
  Cpu
} from 'lucide-react';
import { PCBuild, Language } from '../types/hardware';
import { TRANSLATIONS } from '../data/translations';

interface AIChatDrawerProps {
  build: PCBuild;
  language: Language;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

export const AIChatDrawer: React.FC<AIChatDrawerProps> = ({ build, language }) => {
  const t = TRANSLATIONS[language];
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: language === 'uz'
        ? "Salom! Men sizning AI kompyuter mutaxassisingizman. Tanlagan qismlaringiz mosligi, o'yinlardagi FPS yoki byudjetni tejash bo'yicha istalgan savolingizni bering!"
        : language === 'ru'
        ? "Привет! Я ваш AI специалист по компьютерному железу. Спрашивайте о совместимости выбранных комплектующих, FPS в играх или оптимизации бюджета!"
        : "Hello! I'm your AI hardware engineer. Ask me about component compatibility, estimated FPS in your favorite games, or power supply recommendations!",
      timestamp: 'Just now',
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSend = async (messageText?: string) => {
    const textToSend = messageText || inputValue;
    if (!textToSend.trim() || isTyping) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: textToSend.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!messageText) setInputValue('');
    setIsTyping(true);

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: textToSend,
          currentBuild: build,
          language,
        }),
      });

      if (!response.ok) throw new Error('AI response failed');

      const data = await response.json();
      const botMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'assistant',
        text: data.reply || 'No response generated.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      console.error('Chat error:', err);
      const errorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'assistant',
        text: 'Sorry, I encountered an issue connecting to the hardware neural engine. Please verify your connection or try again.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const selectedCount = Object.values(build).filter(Boolean).length;

  return (
    <div className="fixed bottom-5 right-5 z-50">
      {/* Floating Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="relative flex items-center gap-3 rounded-full bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-500 p-3.5 text-white shadow-2xl shadow-purple-500/30 hover:scale-105 transition-transform duration-300 group cursor-pointer"
        >
          <div className="relative">
            <Sparkles className="h-6 w-6 text-white animate-pulse" />
            <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-500"></span>
            </span>
          </div>
          <span className="hidden sm:inline font-heading text-xs font-bold uppercase tracking-wider pr-2">
            Ask AI Assistant
          </span>
          {selectedCount > 0 && (
            <span className="rounded-full bg-black/40 px-2 py-0.5 text-[10px] font-mono font-bold text-cyan-300 border border-white/20">
              Build ({selectedCount})
            </span>
          )}
        </button>
      )}

      {/* Chat Window Drawer */}
      {isOpen && (
        <div className="flex flex-col w-[92vw] sm:w-[420px] h-[550px] max-h-[85vh] rounded-2xl border border-purple-500/30 bg-neutral-950/95 shadow-2xl backdrop-blur-xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-neutral-800 bg-neutral-900/90 px-4 py-3">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-cyan-500 text-white shadow-md">
                <Bot className="h-4 w-4" />
              </div>
              <div>
                <h3 className="font-heading text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <span>{t.aiChatTitle}</span>
                  <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
                </h3>
                <p className="text-[10px] text-neutral-400">
                  {selectedCount > 0 ? `Active: ${selectedCount} parts in workbench` : t.aiChatSubtitle}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsOpen(false)}
                className="rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-800 hover:text-white transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Quick Context Pill */}
          {selectedCount > 0 && (
            <div className="bg-neutral-900/50 border-b border-neutral-800/80 px-4 py-1.5 flex items-center gap-2 text-[10px] text-neutral-400">
              <Cpu className="h-3 w-3 text-cyan-400" />
              <span className="truncate">
                Current build: {build.cpu?.name || 'No CPU'} + {build.gpu?.name || 'No GPU'}
              </span>
            </div>
          )}

          {/* Messages list */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.sender === 'assistant' && (
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-purple-500/20 text-purple-400 border border-purple-500/30">
                    <Bot className="h-3.5 w-3.5" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed whitespace-pre-wrap ${
                    msg.sender === 'user'
                      ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-br-xs font-medium'
                      : 'bg-neutral-900 text-neutral-200 border border-neutral-800 rounded-bl-xs'
                  }`}
                >
                  <p>{msg.text}</p>
                  <span className="block mt-1 text-[9px] text-neutral-400 text-right opacity-70">
                    {msg.timestamp}
                  </span>
                </div>

                {msg.sender === 'user' && (
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                    <User className="h-3.5 w-3.5" />
                  </div>
                )}
              </div>
            ))}

            {isTyping && (
              <div className="flex gap-2 items-center text-xs text-purple-400 animate-pulse">
                <Bot className="h-4 w-4" />
                <span>{t.aiThinking}</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Suggested Quick Questions */}
          <div className="border-t border-neutral-800/80 bg-neutral-900/40 p-2.5 space-y-1.5">
            <div className="text-[10px] text-neutral-500 font-semibold uppercase tracking-wider">
              {t.suggestedQuestions}
            </div>
            <div className="flex flex-wrap gap-1">
              {[t.q1, t.q2, t.q3].map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(q)}
                  className="rounded-lg bg-neutral-900 border border-neutral-800 px-2 py-1 text-[10px] text-neutral-300 hover:border-cyan-500/50 hover:text-cyan-400 transition-colors text-left"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>

          {/* Input field */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="border-t border-neutral-800 bg-neutral-950 p-3 flex items-center gap-2"
          >
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={t.aiChatPlaceholder}
              className="flex-1 rounded-xl bg-neutral-900 border border-neutral-800 px-3.5 py-2.5 text-xs text-white placeholder-neutral-500 outline-none focus:border-cyan-500 transition-colors"
            />
            <button
              type="submit"
              disabled={!inputValue.trim() || isTyping}
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-r from-purple-500 to-cyan-500 text-white shadow-md disabled:opacity-40 hover:scale-105 transition-transform cursor-pointer"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
