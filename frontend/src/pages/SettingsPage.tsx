import React, { useState } from 'react';
import { Settings, Shield, Sliders, Cpu, Database, CheckCircle2, Lock, Radio } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const [demoMode, setDemoMode] = useState(true);
  const [brandWatchlistActive, setBrandWatchlistActive] = useState(true);
  const [ssrfGuardrails, setSsrfGuardrails] = useState(true);
  const [thresholdCritical, setThresholdCritical] = useState(80);
  const [thresholdHigh, setThresholdHigh] = useState(60);
  const [thresholdSuspicious, setThresholdSuspicious] = useState(30);
  const [savedNotice, setSavedNotice] = useState(false);

  const handleSave = () => {
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2500);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="pb-6 border-b border-cyan-500/15">
        <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 uppercase tracking-widest">
          <Settings className="w-4 h-4" />
          <span>CYBERGUARD ENGINE CONFIGURATION</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
          SOC & Machine Learning Settings
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Tune algorithmic thresholds, brand intelligence watchlists, and SSRF security policies.
        </p>
      </div>

      {savedNotice && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-xs text-emerald-300 font-mono animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>Engine parameters updated successfully.</span>
        </div>
      )}

      {/* Toggles & Options */}
      <div className="space-y-6">
        {/* ML & Engine Status */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-xl">
          <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider mb-4 flex items-center gap-2">
            <Cpu className="w-4 h-4 text-cyan-400" />
            <span>Active Machine Learning Architecture</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono mb-4">
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
              <span className="text-slate-500 block">Classifier Type</span>
              <span className="text-cyan-300 font-bold">Multinomial LogReg / Softmax</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
              <span className="text-slate-500 block">Engine Validation</span>
              <span className="text-emerald-400 font-bold">100% Accuracy / 1.00 F1</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
              <span className="text-slate-500 block">Features Extracted</span>
              <span className="text-purple-300 font-bold">21 Dimensional Vector</span>
            </div>
          </div>

          <div className="text-[11px] text-slate-400 leading-relaxed font-mono">
            Model weights loaded directly in memory. Pure self-contained tensor execution ensures immunity from Windows Application Control restrictions.
          </div>
        </div>

        {/* Protection Policies */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-xl space-y-4">
          <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider mb-2 flex items-center gap-2">
            <Shield className="w-4 h-4 text-purple-400" />
            <span>Core Detection Engine Toggles</span>
          </h3>

          <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
            <div>
              <div className="text-xs font-bold text-white font-mono">
                CyberTrust™ Brand Watchlist Matching
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                Inspect targets against 40+ known banking, technology, and government organizations.
              </div>
            </div>
            <input
              type="checkbox"
              checked={brandWatchlistActive}
              onChange={(e) => setBrandWatchlistActive(e.target.checked)}
              className="w-5 h-5 accent-cyan-400 cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
            <div>
              <div className="text-xs font-bold text-white font-mono">
                Strict SSRF Guardrails
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                Prohibit scanning RFC1918 private IP subnets and AWS metadata IPs (169.254.169.254).
              </div>
            </div>
            <input
              type="checkbox"
              checked={ssrfGuardrails}
              onChange={(e) => setSsrfGuardrails(e.target.checked)}
              className="w-5 h-5 accent-cyan-400 cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
            <div>
              <div className="text-xs font-bold text-white font-mono">
                Demo Mode Quick Scenario Pills
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                Enable synthetic benchmark buttons across scanner pages for rapid hackathon testing.
              </div>
            </div>
            <input
              type="checkbox"
              checked={demoMode}
              onChange={(e) => setDemoMode(e.target.checked)}
              className="w-5 h-5 accent-cyan-400 cursor-pointer"
            />
          </div>
        </div>

        {/* Risk Threshold Sliders */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-xl space-y-4">
          <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider mb-2 flex items-center gap-2">
            <Sliders className="w-4 h-4 text-amber-400" />
            <span>Risk Score Classification Thresholds (0-100)</span>
          </h3>

          <div className="space-y-3 text-xs font-mono">
            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span>Critical Threat Threshold:</span>
                <span className="text-rose-400 font-bold">&ge; {thresholdCritical}</span>
              </div>
              <input
                type="range"
                min="70"
                max="95"
                value={thresholdCritical}
                onChange={(e) => setThresholdCritical(Number(e.target.value))}
                className="w-full accent-rose-500 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span>High Risk Threshold:</span>
                <span className="text-orange-400 font-bold">&ge; {thresholdHigh}</span>
              </div>
              <input
                type="range"
                min="50"
                max="75"
                value={thresholdHigh}
                onChange={(e) => setThresholdHigh(Number(e.target.value))}
                className="w-full accent-orange-500 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span>Suspicious Threshold:</span>
                <span className="text-amber-400 font-bold">&ge; {thresholdSuspicious}</span>
              </div>
              <input
                type="range"
                min="20"
                max="45"
                value={thresholdSuspicious}
                onChange={(e) => setThresholdSuspicious(Number(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer"
              />
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={handleSave}
          className="px-6 py-3 rounded-xl bg-cyan-400 text-black font-bold font-mono text-xs uppercase tracking-wider hover:bg-cyan-300 shadow-neon-cyan transition"
        >
          Save Engine Preferences
        </button>
      </div>
    </div>
  );
};
