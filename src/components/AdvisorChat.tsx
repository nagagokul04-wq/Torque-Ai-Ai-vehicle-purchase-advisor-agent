import React, { useState, useEffect, useRef } from 'react';
import { ChatMessage } from '../types/vehicle';
import { Sparkles, Send, Copy, Check, RotateCcw, ShieldCheck, User, Bot, AlertCircle } from 'lucide-react';

interface AdvisorChatProps {
  initialPrompt?: string | null;
  onClearInitialPrompt?: () => void;
}

export const AdvisorChat: React.FC<AdvisorChatProps> = ({ initialPrompt, onClearInitialPrompt }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'model',
      content: `Hello! I am **TorqueAI**, your dedicated Vehicle Purchase Advisor and Deal Negotiation Agent.

I'm here to ensure you never overpay at a dealership, fall for predatory finance markups, or buy a vehicle that doesn't fit your 5-year budget.

**What we can tackle right now:**
1. **Audit a Dealer Quote**: Paste line items, doc fees, or APR offers for an instant fairness critique.
2. **Negotiation Scripts**: Get exact word-for-word emails or counter-offers to send the sales manager.
3. **Lease vs. Finance Analysis**: Determine if leasing an EV or financing a hybrid yields lower 5-year TCO.
4. **Trade-In Strategy**: How to extract maximum value without letting the dealer play a 4-square shell game.

How can I protect your wallet today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  // Handle external prompts routed from other dashboards
  useEffect(() => {
    if (initialPrompt && initialPrompt.trim()) {
      handleSendPrompt(initialPrompt);
      if (onClearInitialPrompt) onClearInitialPrompt();
    }
  }, [initialPrompt]);

  const handleSendPrompt = async (promptText: string) => {
    if (!promptText.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: promptText.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch('/api/advisor/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMsg],
        }),
      });

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }

      const data = await response.json();
      const modelMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        content: data.reply || 'I received your inquiry and am reviewing the numbers.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, modelMsg]);
    } catch (err: any) {
      console.error(err);
      const errorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        content: `I encountered an issue connecting to the advisory server: ${err.message || 'Please check your connection and try again.'}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const resetChat = () => {
    setMessages([
      {
        id: 'welcome-reset',
        role: 'model',
        content: `Conversation refreshed. What vehicle deal, pricing quote, or negotiation hurdle would you like to review?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  const promptStarters = [
    'How do I negotiate off an $895 dealer documentation fee?',
    'Write a counter-offer email rejecting a $2,000 market adjustment markup.',
    'Should I lease or purchase a new electric vehicle with the $7,500 tax credit?',
    'How do I prevent the dealership from lowballing my trade-in value?',
    'What are the mandatory government fees vs optional dealer profit items?',
  ];

  return (
    <div className="flex flex-col h-[780px] rounded-3xl border border-slate-800 bg-slate-900/80 overflow-hidden shadow-2xl">
      {/* Top Advisor Header Bar */}
      <div className="flex items-center justify-between border-b border-slate-800 bg-slate-950/70 px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-600/20 text-cyan-400 ring-1 ring-cyan-500/30">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <span>TorqueAI Advisor War Room</span>
              <span className="inline-flex items-center gap-1 text-[11px] font-normal text-emerald-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Active Agent
              </span>
            </h2>
            <p className="text-xs text-slate-400">Unbiased Deal Negotiation & Automotive Finance Intelligence</p>
          </div>
        </div>

        <button
          onClick={resetChat}
          className="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs text-slate-400 hover:text-white hover:border-slate-700 transition-colors"
          title="Start fresh session"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          <span>New Session</span>
        </button>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={msg.id}
              className={`flex gap-3 max-w-3xl ${isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
            >
              {/* Avatar Icon */}
              <div
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-bold ${
                  isUser
                    ? 'bg-blue-600 text-white'
                    : 'bg-cyan-950 text-cyan-400 border border-cyan-800/60'
                }`}
              >
                {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
              </div>

              {/* Message Bubble */}
              <div
                className={`group relative rounded-2xl p-4 text-xs leading-relaxed space-y-2 ${
                  isUser
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-950 border border-slate-800/80 text-slate-200'
                }`}
              >
                <div className="whitespace-pre-wrap select-text font-sans">
                  {/* Clean formatting for markdown bolding/bullets */}
                  {msg.content}
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-slate-800/40 text-[10px] text-slate-500">
                  <span>{msg.timestamp}</span>
                  {!isUser && (
                    <button
                      onClick={() => handleCopy(msg.id, msg.content)}
                      className="opacity-0 group-hover:opacity-100 flex items-center gap-1 text-slate-400 hover:text-cyan-400 transition-opacity"
                    >
                      {copiedId === msg.id ? (
                        <>
                          <Check className="h-3 w-3 text-emerald-400" />
                          <span>Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-3 w-3" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {loading && (
          <div className="flex gap-3 mr-auto max-w-lg">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-cyan-950 text-cyan-400 border border-cyan-800/60">
              <Bot className="h-4 w-4 animate-pulse" />
            </div>
            <div className="rounded-2xl bg-slate-950 border border-slate-800 p-4 text-xs text-slate-400 flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-cyan-400 animate-ping" />
              <span>TorqueAI is crunching automotive financials and drafting guidance...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Starter Chips */}
      <div className="px-6 py-2 border-t border-slate-800/60 bg-slate-950/40 overflow-x-auto flex items-center gap-2">
        <span className="text-[11px] text-slate-500 shrink-0">Tactics:</span>
        {promptStarters.map((starter, i) => (
          <button
            key={i}
            onClick={() => handleSendPrompt(starter)}
            disabled={loading}
            className="px-3 py-1 rounded-lg border border-slate-800 bg-slate-900 text-[11px] text-slate-300 hover:border-cyan-500/50 hover:text-cyan-300 transition-colors whitespace-nowrap shrink-0"
          >
            {starter}
          </button>
        ))}
      </div>

      {/* Input Bar */}
      <div className="p-4 border-t border-slate-800 bg-slate-950">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendPrompt(input);
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            placeholder="Ask about a quote, lease terms, negotiation script, or dealer tactic..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
            className="flex-1 rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-xs text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="flex items-center justify-center rounded-xl bg-cyan-600 px-5 py-3 text-xs font-semibold text-white hover:bg-cyan-500 transition-colors shadow-md disabled:opacity-40"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
