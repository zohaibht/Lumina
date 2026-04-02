import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, ChatLink } from '../types';
import { getDesignAdvice } from '../services/geminiService';

interface ChatInterfaceProps {
  currentImage: string | null;
  onEditRequested: (instruction: string) => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ currentImage, onEditRequested }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'model', text: "Hi! I'm Lumina, your AI interior design consultant. How can I help you refine your space today?", timestamp: Date.now() }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userText = input.trim();
    const newUserMsg: ChatMessage = { role: 'user', text: userText, timestamp: Date.now() };
    setMessages(prev => [...prev, newUserMsg]);
    setInput('');
    setIsLoading(true);

    try {
      // Heuristic: If user asks to "change", "add", "make", "remove" something in the image, trigger editing
      const editKeywords = ['change', 'add', 'remove', 'make', 'put', 'filter', 'swap', 'replace'];
      const isEditRequest = editKeywords.some(keyword => userText.toLowerCase().includes(keyword));

      if (isEditRequest && currentImage) {
          onEditRequested(userText);
      }

      const { text, links } = await getDesignAdvice(userText, currentImage || undefined);
      const newAiMsg: ChatMessage = { role: 'model', text, links, timestamp: Date.now() };
      setMessages(prev => [...prev, newAiMsg]);
    } catch (error: any) {
      console.error("Chat Error:", error);
      setMessages(prev => [...prev, { 
        role: 'model', 
        text: "I encountered an error connecting to my design circuits. Please check your internet connection or try again later.", 
        timestamp: Date.now() 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[650px] bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100">
      <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center font-bold text-lg shadow-inner">L</div>
          <div>
            <h4 className="font-bold text-sm">Lumina AI Consultant</h4>
            <p className="text-[10px] text-slate-300 flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span>
              Expert design assistant
            </p>
          </div>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-6 bg-slate-50">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[90%] space-y-3`}>
              <div className={`rounded-2xl p-4 shadow-sm text-sm leading-relaxed ${
                msg.role === 'user' 
                  ? 'bg-indigo-600 text-white rounded-tr-none shadow-indigo-200' 
                  : 'bg-white text-slate-800 border border-slate-200 rounded-tl-none'
              }`}>
                <div className="whitespace-pre-wrap">{String(msg.text)}</div>
              </div>

              {msg.links && msg.links.length > 0 && (
                <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-500">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1 flex items-center gap-2">
                    <span className="w-4 h-px bg-slate-200"></span>
                    Recommended Items
                    <span className="w-full h-px bg-slate-200"></span>
                  </p>
                  <div className="grid grid-cols-1 gap-2">
                    {msg.links.map((link, idx) => (
                      <a 
                        key={idx} 
                        href={link.uri} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-3 bg-white border border-slate-100 rounded-xl hover:border-indigo-300 hover:shadow-md transition-all group"
                      >
                        <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                          </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-slate-900 truncate">{link.title}</p>
                          <p className="text-[10px] text-slate-400 truncate">{new URL(link.uri).hostname}</p>
                        </div>
                        <svg className="w-4 h-4 text-slate-300 group-hover:text-indigo-600 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white text-slate-400 border border-slate-200 rounded-2xl rounded-tl-none p-4 shadow-sm flex items-center gap-3">
              <div className="flex gap-1">
                <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-duration:0.8s]"></span>
                <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-duration:0.8s] [animation-delay:0.2s]"></span>
                <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-duration:0.8s] [animation-delay:0.4s]"></span>
              </div>
              <span className="text-xs font-medium italic">Lumina is curating picks...</span>
            </div>
          </div>
        )}
      </div>

      <form onSubmit={handleSend} className="p-4 bg-white border-t border-slate-100 flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask for advice..."
          className="flex-1 bg-slate-100 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all placeholder:text-slate-400"
        />
        <button
          type="submit"
          disabled={!input.trim() || isLoading}
          className="w-12 h-12 bg-indigo-600 text-white rounded-xl flex items-center justify-center hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all disabled:bg-slate-200 disabled:shadow-none disabled:cursor-not-allowed"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </button>
      </form>
    </div>
  );
};

export default ChatInterface;