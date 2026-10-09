import React, { useState } from 'react';
import { Bot, X, MessageSquare, Sparkles, ChevronUp, ChevronDown } from 'lucide-react';
import { CyberAssistantView } from './CyberAssistantView';
import { ScanResultPayload } from '../types';

interface FloatingAssistantDrawerProps {
  scanContext?: ScanResultPayload | null;
  onNavigateToScan?: () => void;
}

export const FloatingAssistantDrawer: React.FC<FloatingAssistantDrawerProps> = ({
  scanContext,
  onNavigateToScan
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-5 right-5 z-40">
      {/* Floating Trigger Bubble Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="group relative flex items-center gap-2.5 px-4 py-3 rounded-full bg-gradient-to-r from-cyan-500 via-indigo-600 to-emerald-500 text-white font-bold text-xs shadow-2xl shadow-cyan-950/80 hover:shadow-cyan-500/40 hover:scale-105 active:scale-95 transition-all cursor-pointer border border-cyan-400/30"
        >
          <div className="h-7 w-7 rounded-full bg-slate-950 flex items-center justify-center text-cyan-400">
            <Bot className="h-4 w-4 group-hover:rotate-12 transition-transform" />
          </div>
          <span className="tracking-wide">Ask CYBERGUARD AI</span>
          <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
        </button>
      )}

      {/* Floating Drawer Modal */}
      {isOpen && (
        <div className="w-[92vw] sm:w-[540px] max-w-full h-[640px] max-h-[85vh] rounded-3xl bg-slate-950 border border-slate-700/80 shadow-2xl flex flex-col overflow-hidden backdrop-blur-xl animate-fadeIn">
          {/* Top Bar */}
          <div className="p-3.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bot className="h-4 w-4 text-cyan-400" />
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                CYBERGUARD AI Cybersecurity Assistant
              </span>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Assistant View Embedded */}
          <div className="flex-1 p-3 overflow-hidden flex flex-col">
            <CyberAssistantView
              scanContext={scanContext}
              onNavigateToScan={onNavigateToScan}
            />
          </div>
        </div>
      )}
    </div>
  );
};
