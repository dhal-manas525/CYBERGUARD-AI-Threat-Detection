import React, { useEffect, useState } from 'react';
import { ShieldCheck, Cpu, Database, Eye, Activity, ShieldAlert, Sparkles, Bot } from 'lucide-react';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onNewScanClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab, onNewScanClick }) => {
  const [engineHealth, setEngineHealth] = useState<any>(null);

  useEffect(() => {
    fetch('/api/health')
      .then(res => res.json())
      .then(data => setEngineHealth(data))
      .catch(() => setEngineHealth({ status: 'OFFLINE' }));
  }, []);

  return (
    <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur sticky top-0 z-40">
      {/* Top Banner with Brand & Tagline */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-cyan-600 via-indigo-600 to-emerald-500 p-0.5 shadow-lg shadow-cyan-950/50">
              <div className="h-full w-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <ShieldCheck className="h-6 w-6 text-cyan-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-xl tracking-wider text-white">CYBERGUARD</span>
                <span className="px-2 py-0.5 text-[10px] font-bold bg-cyan-950 text-cyan-300 border border-cyan-800 rounded">
                  CYBERTRUST™ v2.4
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium hidden sm:block">
                "Don't just detect the threat. Understand who is behind it."
              </p>
            </div>
          </div>

          {/* Engine Status Indicators */}
          <div className="flex items-center gap-3">
            <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/80 border border-slate-800 text-xs text-slate-300">
              <div className="flex items-center gap-1.5 text-cyan-400">
                <Sparkles className="h-3.5 w-3.5" />
                <span className="font-semibold">CyberTrust™:</span>
                <span className="text-emerald-400">ONLINE</span>
              </div>
              <span className="text-slate-600">|</span>
              <div className="flex items-center gap-1.5 text-indigo-400">
                <Cpu className="h-3.5 w-3.5" />
                <span className="font-semibold">ML Forest:</span>
                <span className="text-emerald-400">94.1% ACC</span>
              </div>
              <span className="text-slate-600">|</span>
              <div className="flex items-center gap-1.5 text-emerald-400">
                <Activity className="h-3.5 w-3.5" />
                <span className="font-semibold">Explainer:</span>
                <span className="text-slate-200">
                  {engineHealth?.capabilities?.explainable_ai === 'GEMINI_ACTIVE' ? 'Gemini 3.8' : 'Active'}
                </span>
              </div>
            </div>

            <button
              onClick={onNewScanClick}
              className="px-3.5 py-1.5 bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white text-xs font-semibold rounded-lg shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <ShieldAlert className="h-3.5 w-3.5" />
              <span>Launch Scan</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-1 sm:space-x-4 border-t border-slate-800/80 py-2 overflow-x-auto scrollbar-none text-xs">
          {[
            { id: 'scanner', label: 'Threat Scanner', icon: ShieldAlert },
            { id: 'assistant', label: 'AI Assistant', icon: Bot },
            { id: 'brands', label: 'CyberTrust™ Brand Intel', icon: Database },
            { id: 'ml', label: 'ML & Feature Studio', icon: Cpu },
            { id: 'dashboard', label: 'SOC Dashboard & Reports', icon: Activity },
            { id: 'api', label: 'API & Python Export', icon: Eye }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                <Icon className={`h-3.5 w-3.5 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
