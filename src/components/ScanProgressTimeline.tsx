import React from 'react';
import {
  Binary, Cpu, Sparkles, Gauge, CheckCircle2, RefreshCw,
  Clock, ArrowRight, Shield, Layers, Zap
} from 'lucide-react';

export type TimelineStepId = 'preprocessing' | 'features' | 'cybertrust' | 'scoring';

export interface TimelineStep {
  id: TimelineStepId;
  label: string;
  sublabel: string;
  description: string;
  icon: React.ElementType;
}

export const TIMELINE_STEPS: TimelineStep[] = [
  {
    id: 'preprocessing',
    label: 'Preprocessing',
    sublabel: 'RFC 3986 Sanitization',
    description: 'Protocol normalization, path segmentation & credential token isolation.',
    icon: Binary
  },
  {
    id: 'features',
    label: 'Feature Extraction',
    sublabel: '24 Vector Attributes',
    description: 'Extracting Shannon entropy, subdomain depth, hyphen counts & auth keywords.',
    icon: Cpu
  },
  {
    id: 'cybertrust',
    label: 'CyberTrust Intelligence Analysis',
    sublabel: 'Brand & Typosquatting',
    description: 'Cross-referencing verified enterprise registry, Levenshtein distance & look-alikes.',
    icon: Sparkles
  },
  {
    id: 'scoring',
    label: 'Risk Scoring',
    sublabel: 'ML + Composite Calibration',
    description: 'Synthesizing ML forest probabilities and calibrating 0-100 composite risk.',
    icon: Gauge
  }
];

interface ScanProgressTimelineProps {
  currentStepIndex: number; // 0, 1, 2, 3, or 4 (all completed)
  isScanning: boolean;
  className?: string;
}

export const ScanProgressTimeline: React.FC<ScanProgressTimelineProps> = ({
  currentStepIndex,
  isScanning,
  className = ''
}) => {
  return (
    <div className={`rounded-2xl border border-slate-800 bg-slate-950/90 p-5 sm:p-6 shadow-2xl relative overflow-hidden backdrop-blur ${className}`}>
      {/* Background Cyber Glow */}
      <div className="absolute top-0 right-1/4 w-72 h-72 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3.5 mb-5">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-cyan-950 border border-cyan-800 text-cyan-400">
            <Zap className="h-4 w-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2">
              <span>CyberGuard Real-Time Pipeline Timeline</span>
              {isScanning && (
                <span className="flex items-center gap-1 text-[10px] font-mono text-cyan-400 px-2 py-0.5 rounded-full bg-cyan-950/80 border border-cyan-800 animate-pulse">
                  <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-ping" />
                  LIVE EXECUTION
                </span>
              )}
            </h4>
            <p className="text-[11px] text-slate-400">
              Deterministic 4-phase forensic analysis pipeline executing in real time
            </p>
          </div>
        </div>

        <div className="text-[10px] font-mono text-slate-400 flex items-center gap-2">
          <span>STEP {Math.min(currentStepIndex + 1, 4)} OF 4</span>
          <span className="text-slate-600">•</span>
          <span className="text-cyan-400">
            {currentStepIndex >= 4 ? '100% COMPLETE' : `${Math.round(((currentStepIndex) / 4) * 100)}% COMPLETE`}
          </span>
        </div>
      </div>

      {/* Steps Visual Grid with Connectors */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative">
        {TIMELINE_STEPS.map((step, index) => {
          const StepIcon = step.icon;
          const isCompleted = currentStepIndex > index;
          const isActive = currentStepIndex === index && isScanning;
          const isPending = currentStepIndex < index;

          return (
            <div
              key={step.id}
              className={`relative rounded-xl p-4 border transition-all duration-300 flex flex-col justify-between ${
                isActive
                  ? 'bg-gradient-to-b from-cyan-950/50 via-slate-900 to-slate-950 border-cyan-500/60 shadow-lg shadow-cyan-950/50 scale-[1.02]'
                  : isCompleted
                  ? 'bg-slate-900/80 border-emerald-800/60'
                  : 'bg-slate-900/40 border-slate-800/80 opacity-60'
              }`}
            >
              {/* Top Step Pill & Status Badge */}
              <div className="flex items-center justify-between mb-3">
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                    isActive
                      ? 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                      : isCompleted
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                      : 'bg-slate-950 text-slate-500 border border-slate-800'
                  }`}
                >
                  PHASE 0{index + 1}
                </span>

                <div className="flex items-center">
                  {isCompleted ? (
                    <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-400">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      <span>DONE</span>
                    </span>
                  ) : isActive ? (
                    <span className="flex items-center gap-1 text-[10px] font-bold text-cyan-300 animate-pulse font-mono">
                      <RefreshCw className="h-3.5 w-3.5 animate-spin text-cyan-400" />
                      <span>ACTIVE</span>
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-[10px] font-medium text-slate-400">
                      <Clock className="h-3 w-3" />
                      <span>PENDING</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Animated Icon & Step Name */}
              <div className="flex items-start gap-3 my-1">
                <div
                  className={`p-2.5 rounded-xl border shrink-0 transition-all ${
                    isActive
                      ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-md shadow-cyan-500/20'
                      : isCompleted
                      ? 'bg-emerald-950/60 border-emerald-800 text-emerald-400'
                      : 'bg-slate-950 border-slate-800 text-slate-500'
                  }`}
                >
                  <StepIcon className={`h-5 w-5 ${isActive ? 'animate-pulse' : ''}`} />
                </div>

                <div className="space-y-0.5">
                  <h5
                    className={`text-xs font-black tracking-tight leading-snug ${
                      isActive ? 'text-white' : isCompleted ? 'text-slate-100' : 'text-slate-400'
                    }`}
                  >
                    {step.label}
                  </h5>
                  <div className="text-[10px] font-mono text-cyan-400/90 font-medium">
                    {step.sublabel}
                  </div>
                </div>
              </div>

              {/* Step Description */}
              <p className="text-[11px] text-slate-400 leading-relaxed mt-2 pt-2 border-t border-slate-800/60">
                {step.description}
              </p>

              {/* Animated Indicator Bar at Bottom of Card */}
              <div className="mt-3 w-full bg-slate-950 rounded-full h-1 overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 rounded-full ${
                    isCompleted
                      ? 'w-full bg-emerald-500'
                      : isActive
                      ? 'w-full bg-gradient-to-r from-cyan-400 via-indigo-500 to-emerald-400 animate-pulse'
                      : 'w-0 bg-transparent'
                  }`}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Progress Track Line (Bottom) */}
      <div className="mt-5 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-slate-400">
        <div className="flex items-center gap-2">
          <span className="text-slate-400">PIPELINE EXECUTION:</span>
          <span className="text-slate-300">
            {currentStepIndex === 0 && 'Parsing protocol, hostname, path & authority...'}
            {currentStepIndex === 1 && 'Extracting Shannon entropy, hyphen ratio & keyword densities...'}
            {currentStepIndex === 2 && 'Querying official brand database & analyzing typosquatting...'}
            {currentStepIndex === 3 && 'Evaluating ML probability distribution & calibrating 0-100 risk score...'}
            {currentStepIndex >= 4 && 'All forensic steps finalized. Rendering report...'}
          </span>
        </div>

        <div className="hidden sm:flex items-center gap-1.5 text-cyan-400">
          <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-ping" />
          <span>CYBERGUARD ENGINE v2.4</span>
        </div>
      </div>
    </div>
  );
};
