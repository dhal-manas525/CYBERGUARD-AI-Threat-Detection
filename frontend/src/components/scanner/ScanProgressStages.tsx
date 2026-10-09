import React, { useEffect, useState } from 'react';
import { CheckCircle2, Loader2 } from 'lucide-react';

interface ScanProgressStagesProps {
  isScanning: boolean;
  onComplete?: () => void;
}

const STAGES = [
  'Parsing URL & Syntax Decomposition',
  'Extracting 21 Structural & Lexical Features',
  'Checking Security Indicators & Homoglyphs',
  'Executing Multi-Class Machine Learning Pipeline',
  'Evaluating Brand Identity & Organization Signatures',
  'Calculating Weighted Composite Risk Score',
  'Generating Explainable CyberTrust Intelligence™',
];

export const ScanProgressStages: React.FC<ScanProgressStagesProps> = ({ isScanning }) => {
  const [currentStage, setCurrentStage] = useState(0);

  useEffect(() => {
    if (!isScanning) {
      setCurrentStage(STAGES.length);
      return;
    }

    setCurrentStage(0);
    const interval = setInterval(() => {
      setCurrentStage((prev) => {
        if (prev < STAGES.length - 1) {
          return prev + 1;
        }
        return prev;
      });
    }, 280);

    return () => clearInterval(interval);
  }, [isScanning]);

  if (!isScanning && currentStage === STAGES.length) return null;

  return (
    <div className="w-full rounded-xl border border-cyan-500/30 bg-slate-900/90 p-5 backdrop-blur-md shadow-neon-cyan animate-pulse-glow">
      <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Loader2 className="w-5 h-5 text-cyan-400 animate-spin" />
          <span className="font-mono text-sm font-semibold tracking-wide text-cyan-300 uppercase">
            Threat Analysis Pipeline Active
          </span>
        </div>
        <span className="font-mono text-xs text-slate-400">
          Stage {Math.min(currentStage + 1, STAGES.length)} of {STAGES.length}
        </span>
      </div>

      <div className="space-y-2.5">
        {STAGES.map((stageName, idx) => {
          const isDone = currentStage > idx;
          const isCurrent = currentStage === idx;

          return (
            <div
              key={idx}
              className={`flex items-center gap-3 p-2 rounded-lg transition-all text-xs font-mono ${
                isDone
                  ? 'text-emerald-400 bg-emerald-950/20'
                  : isCurrent
                  ? 'text-cyan-300 bg-cyan-950/40 border border-cyan-500/40 font-semibold'
                  : 'text-slate-600'
              }`}
            >
              {isDone ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : isCurrent ? (
                <Loader2 className="w-4 h-4 text-cyan-400 animate-spin shrink-0" />
              ) : (
                <div className="w-4 h-4 rounded-full border border-slate-700 shrink-0" />
              )}
              <span>{stageName}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
