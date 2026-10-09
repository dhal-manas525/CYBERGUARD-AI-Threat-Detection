import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Bot,
  Send,
  User,
  Shield,
  Sparkles,
  AlertTriangle,
  Lightbulb,
  CornerDownLeft,
  RotateCcw
} from 'lucide-react';
import { api } from '../services/api';
import type { ChatMessage } from '../types';

const INITIAL_MESSAGE: ChatMessage = {
  id: 'init-1',
  role: 'assistant',
  content: `Hello! I am **CYBERGUARD AI ASSISTANT**, your cybersecurity advisor.\n\nI can assist you with:\n- **Incident Response**: Urgent steps if you clicked a suspicious link or surrendered credentials.\n- **Threat Explanation**: Breakdown of why a specific URL, message, or domain was flagged.\n- **CyberTrust Attribution**: Explaining adversary intent and brand impersonation tactics.\n- **Preventative Best Practices**: Hardening enterprise identities and stopping social engineering.\n\nHow can I help protect your systems today?`,
  timestamp: new Date().toLocaleTimeString(),
  model_used: 'CYBERGUARD Grounded Engine'
};

const PROMPT_SUGGESTIONS = [
  'I clicked a suspicious link and entered my password. What should I do right now?',
  'How do attackers use homoglyphs to impersonate banking domains?',
  'What is the difference between brute force and horizontal password spraying?',
  'Explain what CYBERTRUST INTELLIGENCE™ does.'
];

export const AssistantPage: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([INITIAL_MESSAGE]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend || input).trim();
    if (!text || loading) return;

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString()
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const historyPayload = newMessages.map((m) => ({
        role: m.role,
        content: m.content
      }));

      const res = await api.chatAssistant(historyPayload);

      const botMsg: ChatMessage = {
        id: `a-${Date.now()}`,
        role: 'assistant',
        content: res.reply,
        timestamp: new Date().toLocaleTimeString(),
        model_used: res.model_used
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        role: 'assistant',
        content: 'Unable to communicate with cybersecurity advisor right now. Please check your backend connection.',
        timestamp: new Date().toLocaleTimeString(),
        model_used: 'System Offline'
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setMessages([INITIAL_MESSAGE]);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 h-[calc(100vh-6rem)] flex flex-col space-y-4">
      {/* Top Banner */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-mono uppercase tracking-wider">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            AI Cybersecurity Advisor
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            CyberGuard AI Assistant
          </h1>
        </div>

        <button
          onClick={handleReset}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-slate-200 text-xs transition-colors"
          title="Reset conversation"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Reset Chat
        </button>
      </div>

      {/* Chat Messages Area */}
      <div className="flex-1 bg-slate-900/60 border border-slate-800 rounded-2xl p-4 sm:p-6 overflow-y-auto space-y-4 backdrop-blur-md">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
          >
            <div
              className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${
                msg.role === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gradient-to-br from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/20'
              }`}
            >
              {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>

            <div
              className={`max-w-[85%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-blue-600/90 text-white rounded-tr-none'
                  : 'bg-slate-950/90 border border-slate-800 text-slate-200 rounded-tl-none shadow-xl'
              }`}
            >
              <div className="whitespace-pre-wrap font-sans">{msg.content}</div>

              <div
                className={`flex items-center gap-2 mt-2 pt-1 border-t text-[10px] ${
                  msg.role === 'user'
                    ? 'border-white/20 text-white/70 justify-end'
                    : 'border-slate-800/80 text-slate-500 justify-between'
                }`}
              >
                {msg.model_used && (
                  <span className="font-mono text-cyan-400/80">
                    Engine: {msg.model_used}
                  </span>
                )}
                <span>{msg.timestamp}</span>
              </div>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 text-white flex items-center justify-center">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-slate-950/90 border border-slate-800 p-4 rounded-2xl rounded-tl-none text-xs text-slate-400 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              <span>Analyzing threat intelligence & synthesizing recommendations...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Prompt Suggestions */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <Lightbulb className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
        <span className="text-[11px] text-slate-500 uppercase tracking-wider font-semibold whitespace-nowrap">
          Suggestions:
        </span>
        {PROMPT_SUGGESTIONS.map((p, i) => (
          <button
            key={i}
            onClick={() => handleSend(p)}
            className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-cyan-500/40 text-slate-300 hover:text-cyan-300 whitespace-nowrap transition-colors"
          >
            {p}
          </button>
        ))}
      </div>

      {/* Input Box */}
      <div className="relative">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSend();
          }}
          placeholder="Ask a cybersecurity question or describe an observed suspicious event..."
          className="w-full bg-slate-900 border border-slate-800 rounded-2xl pl-5 pr-14 py-3.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 shadow-xl transition-colors"
        />

        <button
          onClick={() => handleSend()}
          disabled={loading || !input.trim()}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-30 text-white transition-all shadow-md shadow-cyan-500/20"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
export default AssistantPage;
