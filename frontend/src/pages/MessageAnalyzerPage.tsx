import React, { useState } from 'react';
import { MessageSquare, ArrowRight, AlertCircle, Send } from 'lucide-react';
import { api } from '../services/api';
import type { ScanResponse } from '../types';
import { RiskGauge } from '../components/scanner/RiskGauge';
import { ThreatBadge } from '../components/common/ThreatBadge';
import { CyberTrustPanel } from '../components/scanner/CyberTrustPanel';
import { QuickSamplePills } from '../components/scanner/QuickSamplePills';
import type { DemoSample } from '../services/demoData';

import { validateMessageInput } from '../utils/validators';

export const MessageAnalyzerPage: React.FC = () => {
  const [content, setContent] = useState('');
  const [platform, setPlatform] = useState('WhatsApp');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [scanResult, setScanResult] = useState<ScanResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanContent = content.trim();
    const validation = validateMessageInput(cleanContent);
    if (!validation.isValid) {
      setError(validation.error || 'Please provide realistic message content to analyze.');
      setScanResult(null);
      return;
    }

    setError(null);
    setIsAnalyzing(true);
    setScanResult(null);

    try {
      const data = await api.scanMessage(content, platform);
      setScanResult(data);
    } catch (err: any) {
      setError(err.message || 'Unable to analyze message.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSelectSample = (sample: DemoSample) => {
    if (sample.payload) {
      setContent(sample.payload.content || '');
      setPlatform(sample.payload.platform || 'WhatsApp');
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="pb-6 border-b border-cyan-500/15">
        <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 uppercase tracking-widest">
          <MessageSquare className="w-4 h-4" />
          <span>MESSAGING FRAUD & SOCIAL ENGINEERING SENSOR</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
          SMS, WhatsApp & Telegram Scam Analyzer
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Detects extortion messages, utility disconnection hoaxes, fake jobs, and OTP extraction tactics.
        </p>
      </div>

      {/* Input Form */}
      <div className="rounded-2xl border border-cyan-500/30 bg-slate-900/80 p-6 backdrop-blur-xl shadow-neon-cyan">
        <form onSubmit={handleAnalyze} className="space-y-4">
          <div>
            <label className="block text-xs font-mono uppercase text-slate-300 mb-2">
              Message Source / Protocol
            </label>
            <div className="flex flex-wrap gap-2">
              {['WhatsApp', 'SMS / Text', 'Telegram', 'Social Media DM'].map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPlatform(p)}
                  className={`px-4 py-2 rounded-xl text-xs font-mono transition ${
                    platform === p
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 font-bold shadow-[0_0_10px_rgba(0,242,254,0.2)]'
                      : 'bg-slate-950/80 text-slate-400 border border-slate-800 hover:text-white'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono uppercase text-slate-300 mb-1">
              Raw Message Content
            </label>
            <textarea
              rows={4}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Paste suspicious SMS or WhatsApp message here..."
              className="w-full px-4 py-3 rounded-xl bg-slate-950/80 border border-slate-700 focus:border-cyan-400 text-sm text-white font-sans placeholder-slate-500 focus:outline-none"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isAnalyzing || !content.trim()}
              className="flex items-center gap-2 px-7 py-3 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 text-black font-bold font-mono text-xs uppercase tracking-wider hover:opacity-95 disabled:opacity-50 transition shadow-neon-cyan"
            >
              <Send className="w-4 h-4" />
              <span>{isAnalyzing ? 'Analyzing Message...' : 'Inspect Message Threat'}</span>
            </button>
          </div>
        </form>

        {/* Demo Mode Pills */}
        <div className="mt-5 pt-4 border-t border-slate-800">
          <QuickSamplePills onSelectSample={handleSelectSample} filterType="message" />
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-rose-950/40 border border-rose-500/40 text-sm text-rose-300">
          <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Results */}
      {scanResult && !isAnalyzing && (
        <div className="space-y-8 animate-fadeIn">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-xl">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
              <div className="md:col-span-4 flex flex-col items-center justify-center p-4 rounded-xl bg-slate-950/60 border border-slate-800/80">
                <RiskGauge score={scanResult.risk_score} threatLevel={scanResult.threat_level} />
                <div className="mt-3">
                  <ThreatBadge level={scanResult.threat_level} size="lg" />
                </div>
              </div>

              <div className="md:col-span-8 space-y-3">
                <div className="text-xs text-slate-400 uppercase font-mono tracking-wider">
                  Social Engineering Signature
                </div>
                <div className="text-base font-bold text-white">
                  {scanResult.threat_category}
                </div>
                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-slate-300">
                  <span className="text-slate-400 block mb-1">Target Snippet:</span>
                  <p className="font-mono text-cyan-300">{scanResult.target}</p>
                </div>
              </div>
            </div>
          </div>

          <CyberTrustPanel
            cybertrust={scanResult.cybertrust}
            threatLevel={scanResult.threat_level}
            riskScore={scanResult.risk_score}
            mlPrediction={scanResult.ml_prediction}
            mlConfidence={scanResult.ml_confidence}
          />
        </div>
      )}
    </div>
  );
};
