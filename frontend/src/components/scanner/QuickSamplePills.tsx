import React from 'react';
import { DEMO_SAMPLES } from '../../services/demoData';
import type { DemoSample } from '../../services/demoData';
import { Sparkles, ArrowRight } from 'lucide-react';

interface QuickSamplePillsProps {
  onSelectSample: (sample: DemoSample) => void;
  filterType?: 'url' | 'email' | 'message';
}

export const QuickSamplePills: React.FC<QuickSamplePillsProps> = ({
  onSelectSample,
  filterType,
}) => {
  const filteredSamples = filterType
    ? DEMO_SAMPLES.filter((s) => s.type === filterType)
    : DEMO_SAMPLES;

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4 backdrop-blur-md">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 text-xs font-mono text-cyan-400">
          <Sparkles className="w-3.5 h-3.5" />
          <span className="uppercase tracking-wider">Demo Mode Test Scenarios</span>
        </div>
        <span className="text-[11px] text-slate-500 font-mono">
          Synthetic benchmark data for hackathon evaluation
        </span>
      </div>

      <div className="flex flex-wrap gap-2">
        {filteredSamples.map((sample) => {
          let categoryColor = 'bg-slate-800 text-slate-300 hover:border-slate-600';
          if (sample.category === 'Safe') {
            categoryColor = 'bg-emerald-950/40 text-emerald-300 border-emerald-500/30 hover:bg-emerald-900/50';
          } else if (sample.category === 'Brand Impersonation') {
            categoryColor = 'bg-rose-950/40 text-rose-300 border-rose-500/30 hover:bg-rose-900/50';
          } else if (sample.category === 'Suspicious') {
            categoryColor = 'bg-amber-950/40 text-amber-300 border-amber-500/30 hover:bg-amber-900/50';
          }

          return (
            <button
              key={sample.id}
              type="button"
              onClick={() => onSelectSample(sample)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs transition duration-200 ${categoryColor}`}
              title={sample.description}
            >
              <span className="font-medium">{sample.title}</span>
              <ArrowRight className="w-3 h-3 opacity-60" />
            </button>
          );
        })}
      </div>
    </div>
  );
};
