import React, { useState, useEffect, useRef } from 'react';
import {
  Send, Sparkles, Shield, AlertTriangle, CheckCircle2, RotateCcw,
  Copy, Check, Bot, User, HelpCircle, Terminal, Lock, Zap,
  ExternalLink, Layers, ShieldAlert, Cpu
} from 'lucide-react';
import { ScanResultPayload } from '../types';

interface Message {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: string;
  modelUsed?: string;
}

interface CyberAssistantViewProps {
  scanContext?: ScanResultPayload | null;
  onNavigateToScan?: () => void;
}

export const CyberAssistantView: React.FC<CyberAssistantViewProps> = ({
  scanContext,
  onNavigateToScan
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'init-1',
      role: 'model',
      content: `Hello! I am **CYBERGUARD AI ASSISTANT**, your cybersecurity defense advisor.

I am here to help you:
- **Understand Threats**: Analyze why a URL, email, or message was flagged.
- **CyberTrust Intelligence™**: Explain claimed identity and why you should or shouldn't trust a domain.
- **Incident Response**: What to do immediately if you clicked a link or entered passwords.
- **Security Education**: Learn how phishing, look-alike domains, and social engineering work.

${scanContext ? `💡 *I have the active findings for \`${scanContext.target || 'your recent scan'}\` loaded in my context. Feel free to ask: "Why was this flagged?" or "Can I trust this?"*` : 'How can I assist your security today?'}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      modelUsed: 'CYBERGUARD Security Guide'
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [includeScanContext, setIncludeScanContext] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const QUICK_PROMPTS = [
    { label: 'Why was this flagged?', query: 'Why was this target flagged as risky? Explain the detected signals.' },
    { label: 'Can I trust this?', query: 'Can I trust this website? Who does it appear to represent?' },
    { label: 'I entered my password!', query: 'I think I entered my password on a suspicious website. What should I do right now?' },
    { label: 'What is typosquatting?', query: 'What is typosquatting and look-alike brand impersonation?' },
    { label: 'Someone asked for my OTP', query: 'Someone is asking for my OTP or verification code. Is this safe?' },
    { label: 'How does Risk Score work?', query: 'Explain how CYBERGUARD calculates Risk Score (0-100) vs Model Confidence.' }
  ];

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputValue).trim();
    if (!text || isLoading) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const newThread = [...messages, userMessage];
    setMessages(newThread);
    setInputValue('');
    setIsLoading(true);

    try {
      // Build API messages payload
      const apiMessages = newThread.map(m => ({
        role: m.role,
        content: m.content
      }));

      // Prepare optional scan context payload
      const scanContextPayload = (includeScanContext && scanContext) ? {
        target: scanContext.target,
        risk_score: scanContext.risk_score,
        risk_level: scanContext.risk_level,
        threat_type: scanContext.threat_type,
        claimed_identity: scanContext.cybertrust?.claimed_identity,
        impersonation_detected: scanContext.cybertrust?.impersonation_detected,
        attack_goal: scanContext.attack_goal || scanContext.cybertrust?.attack_goal,
        signals: scanContext.signals,
        recommendations: scanContext.recommendations,
        why_flagged: scanContext.cybertrust?.why_flagged,
        official_domains: scanContext.cybertrust?.official_domains
      } : null;

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: apiMessages,
          scanContext: scanContextPayload
        })
      });

      if (!res.ok) {
        throw new Error(`Chat error HTTP ${res.status}`);
      }

      const data = await res.json();
      const assistantMessage: Message = {
        id: `model-${Date.now()}`,
        role: 'model',
        content: data.reply || 'Analysis complete.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        modelUsed: data.model_used || 'gemini-3.8-flash'
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (err: any) {
      console.error(err);
      const errorMessage: Message = {
        id: `err-${Date.now()}`,
        role: 'model',
        content: `I encountered an unexpected connection error. However, as general guidance: if you are dealing with a suspicious link or message, **do not submit credentials or OTPs**, close the page, and check the organization's official website directly.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        modelUsed: 'CyberGuard Safety Guard'
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleResetChat = () => {
    setMessages([
      {
        id: `init-${Date.now()}`,
        role: 'model',
        content: `Conversation refreshed. I am **CYBERGUARD AI ASSISTANT**. Ask me anything about suspicious links, impersonation, or emergency account protection.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        modelUsed: 'CYBERGUARD Security Guide'
      }
    ]);
  };

  return (
    <div className="space-y-4 animate-fadeIn flex flex-col h-[calc(100vh-12rem)] min-h-[600px]">
      {/* Top Assistant Header & Scan Context Status Bar */}
      <div className="rounded-2xl bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 border border-slate-800 p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-cyan-600 via-indigo-600 to-emerald-500 p-0.5 shadow-lg shadow-cyan-950/50 shrink-0">
            <div className="h-full w-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Bot className="h-6 w-6 text-cyan-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-black text-white tracking-wide">
                CYBERGUARD AI ASSISTANT
              </h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-950 text-cyan-300 border border-cyan-800">
                GEMINI 3.8 FLASH
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Cybersecurity education, threat explanation & prioritized incident response
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs">
          {scanContext && (
            <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 cursor-pointer text-[11px]">
              <input
                type="checkbox"
                checked={includeScanContext}
                onChange={e => setIncludeScanContext(e.target.checked)}
                className="rounded text-cyan-500 focus:ring-0 cursor-pointer"
              />
              <span>Attach Scan Context</span>
            </label>
          )}

          <button
            onClick={handleResetChat}
            className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition-colors cursor-pointer"
            title="Reset Conversation"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Active Scan Context Callout (If active scan exists) */}
      {scanContext && includeScanContext && (
        <div className="p-3 rounded-xl bg-slate-900/90 border border-cyan-800/40 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <span
              className={`px-2 py-0.5 rounded text-[10px] font-black uppercase font-mono ${
                scanContext.risk_level === 'CRITICAL' ? 'bg-rose-950 text-rose-300 border border-rose-800' :
                scanContext.risk_level === 'HIGH RISK' ? 'bg-orange-950 text-orange-300 border border-orange-800' :
                scanContext.risk_level === 'SAFE' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' :
                'bg-amber-950 text-amber-300 border border-amber-800'
              }`}
            >
              {scanContext.risk_score}/100 {scanContext.risk_level}
            </span>
            <span className="font-mono text-slate-300 truncate">
              {scanContext.target}
            </span>
            {scanContext.cybertrust?.claimed_identity && (
              <span className="text-cyan-400 font-semibold hidden md:inline">
                • Claimed: {scanContext.cybertrust.claimed_identity}
              </span>
            )}
          </div>

          {onNavigateToScan && (
            <button
              onClick={onNavigateToScan}
              className="text-[11px] text-cyan-400 hover:text-cyan-300 font-medium whitespace-nowrap cursor-pointer flex items-center gap-1"
            >
              <span>View Full Forensic Card</span>
              <ExternalLink className="h-3 w-3" />
            </button>
          )}
        </div>
      )}

      {/* Chat Messages Thread */}
      <div className="flex-1 rounded-2xl bg-slate-900/60 border border-slate-800 p-4 sm:p-5 overflow-y-auto space-y-4 shadow-xl backdrop-blur scrollbar-thin">
        {messages.map(msg => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={msg.id}
              className={`flex gap-3 text-xs leading-relaxed ${isUser ? 'justify-end' : 'justify-start'}`}
            >
              {!isUser && (
                <div className="h-7 w-7 rounded-lg bg-cyan-950 border border-cyan-800 text-cyan-400 flex items-center justify-center shrink-0 mt-0.5">
                  <Bot className="h-4 w-4" />
                </div>
              )}

              <div
                className={`max-w-[85%] sm:max-w-2xl rounded-2xl p-3.5 sm:p-4 space-y-2 relative group shadow-sm ${
                  isUser
                    ? 'bg-gradient-to-r from-cyan-600 to-indigo-600 text-white rounded-tr-none'
                    : 'bg-slate-950 border border-slate-800 text-slate-200 rounded-tl-none'
                }`}
              >
                {/* Message Header with Timestamp & Model */}
                <div className="flex items-center justify-between text-[10px] text-slate-400 border-b border-white/10 pb-1 mb-1">
                  <span className="font-bold">
                    {isUser ? 'Security Analyst' : 'CYBERGUARD AI'}
                  </span>
                  <div className="flex items-center gap-2">
                    {msg.modelUsed && !isUser && (
                      <span className="text-cyan-400 font-mono text-[9px]">
                        {msg.modelUsed}
                      </span>
                    )}
                    <span>{msg.timestamp}</span>
                  </div>
                </div>

                {/* Formatted Message Content */}
                <div className="whitespace-pre-wrap font-sans text-xs sm:text-[13px] leading-relaxed">
                  {msg.content}
                </div>

                {/* Copy Button */}
                {!isUser && (
                  <button
                    onClick={() => handleCopy(msg.id, msg.content)}
                    className="absolute bottom-2 right-2 p-1 rounded bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition-opacity opacity-0 group-hover:opacity-100 cursor-pointer"
                    title="Copy Answer"
                  >
                    {copiedId === msg.id ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                  </button>
                )}
              </div>

              {isUser && (
                <div className="h-7 w-7 rounded-lg bg-indigo-950 border border-indigo-800 text-indigo-400 flex items-center justify-center shrink-0 mt-0.5">
                  <User className="h-4 w-4" />
                </div>
              )}
            </div>
          );
        })}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex gap-3 text-xs justify-start">
            <div className="h-7 w-7 rounded-lg bg-cyan-950 border border-cyan-800 text-cyan-400 flex items-center justify-center shrink-0">
              <Bot className="h-4 w-4 animate-spin" />
            </div>
            <div className="bg-slate-950 border border-slate-800 rounded-2xl rounded-tl-none p-3.5 flex items-center gap-2 text-cyan-400">
              <div className="h-2 w-2 rounded-full bg-cyan-400 animate-ping" />
              <span className="font-mono text-xs">CYBERGUARD analyzing question & formulating security guidance...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Prompt Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs scrollbar-none">
        <span className="text-[10px] text-slate-500 font-bold uppercase shrink-0 flex items-center gap-1">
          <Zap className="h-3 w-3 text-amber-400" />
          Suggested:
        </span>
        {QUICK_PROMPTS.map((p, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(p.query)}
            disabled={isLoading}
            className="px-2.5 py-1 rounded-full bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-cyan-500/50 text-slate-300 hover:text-cyan-300 text-[11px] whitespace-nowrap transition-colors cursor-pointer shrink-0 disabled:opacity-50"
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Message Input Box */}
      <div className="relative rounded-2xl bg-slate-900 border border-slate-800 p-2 shadow-xl flex items-center gap-2">
        <input
          type="text"
          value={inputValue}
          onChange={e => setInputValue(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSendMessage();
            }
          }}
          disabled={isLoading}
          placeholder="Ask CYBERGUARD: e.g. 'Why is this dangerous?', 'I clicked a link, what do I do?', 'How does CyberTrust work?'..."
          className="flex-1 bg-transparent px-3 py-2 text-xs sm:text-sm text-slate-100 placeholder:text-slate-500 outline-none"
        />

        <button
          onClick={() => handleSendMessage()}
          disabled={isLoading || !inputValue.trim()}
          className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all shadow-md cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Send className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Ask AI</span>
        </button>
      </div>
    </div>
  );
};
