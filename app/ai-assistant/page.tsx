'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, Sparkles, Bot, User, Loader2, RefreshCw, MessageSquare, 
  HelpCircle, BookOpen, AlertCircle 
} from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function AIAssistantPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: `Hello! I am your **ThesisMate AI Academic Assistant**. I am connected directly to your current thesis settings, literature library, and outstanding supervisor comment logs.\n\nAsk me questions about your research gap, source synthesis, or supervisor action plan!`,
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({ sourcesCount: 0, commentsCount: 0, title: '' });

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Scroll to bottom when new messages arrive
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    // Fetch count stats for dashboard context in sidebar helper
    const fetchStats = async () => {
      try {
        const res = await fetch('/api/thesis');
        const data = await res.json();
        setStats({
          sourcesCount: data.sources?.length || 0,
          commentsCount: data.comments?.filter((c: any) => c.status !== 'DONE').length || 0,
          title: data.title || '',
        });
      } catch (err) {
        // Silently fail
      }
    };
    fetchStats();
  }, []);

  const handleSend = async (e?: React.FormEvent, customText?: string) => {
    e?.preventDefault();
    const textToSend = customText || input;
    if (!textToSend.trim() || loading) return;

    const userMessage: Message = { role: 'user', content: textToSend };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage],
        }),
      });

      if (!res.ok) {
        throw new Error('API communication error.');
      }

      const reply = await res.json();
      setMessages(prev => [...prev, reply]);
    } catch (err) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'I encountered an error connecting to my academic knowledge base. Please check that Next.js server is fully running and try again.',
      }]);
    } finally {
      setLoading(false);
    }
  };

  const suggestPrompts = [
    { label: 'Suggest a thesis structure', action: 'Propose a structured chapter outline' },
    { label: 'Synthesize supervisor comments', action: 'Synthesize my supervisor comments into action items' },
    { label: 'Summarize my literature sources', action: 'Summarize my literature sources' },
    { label: 'Analyze my research gap', action: 'Analyze my research gap' },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-indigo-600">AI Assistant</p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-900">Your Intelligent Research Co-Pilot</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
          Ask questions about your research objectives, outline structures, references, and pending feedback. The assistant automatically references loaded source summaries and pending comments.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-4">
        {/* Left Side: Context Widget Panel */}
        <div className="space-y-4 lg:col-span-1">
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-slate-950 uppercase tracking-wider pb-2 border-b border-slate-100 flex items-center gap-2">
              <Bot size={16} className="text-indigo-600" />
              Co-Pilot Context
            </h2>
            <div className="space-y-3">
              <div className="rounded-2xl bg-indigo-50/50 p-4 border border-indigo-100/50">
                <p className="text-xs font-bold text-indigo-800 uppercase tracking-wider">Active Workspace</p>
                <p className="mt-2 text-xs font-semibold text-slate-900 leading-relaxed truncate">
                  {stats.title || 'Sustainable Mobility Framework'}
                </p>
              </div>
              <div className="flex gap-3">
                <div className="flex-1 rounded-2xl bg-slate-50 border border-slate-100 p-3 text-center">
                  <BookOpen size={16} className="text-slate-400 mx-auto mb-1" />
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Library</p>
                  <p className="text-base font-bold text-slate-950 mt-1">{stats.sourcesCount} Docs</p>
                </div>
                <div className="flex-1 rounded-2xl bg-slate-50 border border-slate-100 p-3 text-center">
                  <AlertCircle size={16} className="text-slate-400 mx-auto mb-1" />
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Comments</p>
                  <p className="text-base font-bold text-slate-950 mt-1">{stats.commentsCount} Active</p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Prompts Panel */}
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-slate-950 uppercase tracking-wider pb-2 border-b border-slate-100 flex items-center gap-2">
              <HelpCircle size={16} className="text-indigo-600" />
              Suggested Queries
            </h2>
            <div className="space-y-2">
              {suggestPrompts.map((p, i) => (
                <button
                  key={i}
                  onClick={() => handleSend(undefined, p.action)}
                  className="w-full text-left rounded-xl border border-slate-100 bg-slate-50 hover:bg-indigo-50/50 hover:border-indigo-100 px-3.5 py-2.5 text-xs font-semibold text-slate-700 hover:text-indigo-900 transition leading-snug"
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side: Primary Chat Box Workspace */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-3 flex flex-col h-[600px]">
          {/* Messages Log area */}
          <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2 select-text">
            {messages.map((m, i) => (
              <div 
                key={i}
                className={`flex gap-3 max-w-[85%] ${m.role === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
              >
                <div className={`shrink-0 rounded-2xl w-9 h-9 flex items-center justify-center border shadow-sm ${
                  m.role === 'user' 
                    ? 'bg-slate-50 text-slate-700 border-slate-200' 
                    : 'bg-indigo-50 text-indigo-700 border-indigo-100'
                }`}>
                  {m.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                </div>

                <div className={`rounded-3xl px-5 py-3.5 text-sm leading-7 shadow-sm border ${
                  m.role === 'user'
                    ? 'bg-slate-900 text-white border-slate-950 rounded-tr-none'
                    : 'bg-slate-50/50 text-slate-800 border-slate-100 rounded-tl-none'
                }`}>
                  <div className="whitespace-pre-wrap select-text selection:bg-indigo-200 font-medium">
                    {/* Render basic bold formatting directly */}
                    {m.content.split('\n').map((line, idx) => {
                      // Process bold text syntax **text**
                      let processed = line;
                      const parts = [];
                      let boldRegex = /\*\*(.*?)\*\*/g;
                      let lastIdx = 0;
                      let match;
                      
                      while ((match = boldRegex.exec(line)) !== null) {
                        if (match.index > lastIdx) {
                          parts.push(line.substring(lastIdx, match.index));
                        }
                        parts.push(<strong key={match.index} className="font-bold text-indigo-950 dark:text-white">{match[1]}</strong>);
                        lastIdx = boldRegex.lastIndex;
                      }
                      
                      if (lastIdx < line.length) {
                        parts.push(line.substring(lastIdx));
                      }
                      
                      // Process italic text syntax *text*
                      // Just return processed line if no bold match was found, else return parts
                      return (
                        <p key={idx} className={idx > 0 ? 'mt-2' : ''}>
                          {parts.length > 0 ? parts : line}
                        </p>
                      );
                    })}
                  </div>
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex gap-3 max-w-[80%] mr-auto">
                <div className="shrink-0 rounded-2xl w-9 h-9 flex items-center justify-center border bg-indigo-50 border-indigo-100 text-indigo-700">
                  <Bot size={16} />
                </div>
                <div className="rounded-3xl px-5 py-3.5 text-sm bg-slate-50/50 text-slate-500 border border-slate-100 flex items-center gap-2">
                  <Loader2 className="animate-spin text-indigo-600" size={16} />
                  Co-pilot is organizing reference contexts...
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Form input bar */}
          <form onSubmit={(e) => handleSend(e)} className="border-t border-slate-100 pt-4 flex gap-3">
            <input
              type="text"
              placeholder="Ask anything about your thesis research landscape (e.g. Propose methodology structure)..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={loading}
              className="flex-grow rounded-2xl border border-slate-200 px-4 py-3 text-sm font-medium outline-none focus:border-indigo-500 disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="rounded-2xl bg-indigo-600 text-white px-5 py-3 shadow-sm hover:bg-indigo-700 transition disabled:opacity-40 active:scale-95 shrink-0 flex items-center justify-center"
            >
              <Send size={18} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
