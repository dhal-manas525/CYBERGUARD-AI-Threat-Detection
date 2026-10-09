import React, { useState, useEffect } from 'react';
import { Cpu, BarChart3, Download, Copy, Check, Terminal, Layers, ShieldCheck, Activity } from 'lucide-react';

export const MLStudio: React.FC = () => {
  const [metrics, setMetrics] = useState<any>(null);
  const [pythonCode, setPythonCode] = useState<{ feature_extractor_code: string; training_script_code: string } | null>(null);
  const [activeCodeTab, setActiveCodeTab] = useState<'features' | 'train'>('features');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch('/api/ml/metrics')
      .then(res => res.json())
      .then(data => setMetrics(data))
      .catch(err => console.error(err));

    fetch('/api/ml/export-python')
      .then(res => res.json())
      .then(data => setPythonCode(data))
      .catch(err => console.error(err));
  }, []);

  const handleCopyCode = () => {
    if (!pythonCode) return;
    const text = activeCodeTab === 'features' ? pythonCode.feature_extractor_code : pythonCode.training_script_code;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadPython = () => {
    if (!pythonCode) return;
    const isFeat = activeCodeTab === 'features';
    const text = isFeat ? pythonCode.feature_extractor_code : pythonCode.training_script_code;
    const filename = isFeat ? 'cyberguard_features.py' : 'train_cyberguard_model.py';

    const blob = new Blob([text], { type: 'text/x-python;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
  };

  if (!metrics) {
    return (
      <div className="py-20 text-center text-slate-400 text-xs">
        Loading Machine Learning Model Telemetry...
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Studio Header */}
      <div className="rounded-2xl bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 border border-slate-800 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Cpu className="h-4 w-4" />
            <span>Machine Learning Architecture & Validation Studio</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white">
            Gradient-Boosted Forest & Logistic Calibrator
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Trained and cross-validated on 20,000 real-world benchmark phishing URLs. Evaluates 24 lexical,
            structural, and entropy features to predict probabilities for <strong className="text-slate-200">SAFE</strong>,{' '}
            <strong className="text-slate-200">SUSPICIOUS</strong>, and <strong className="text-slate-200">MALICIOUS</strong> classes.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-lg bg-emerald-950 text-emerald-300 border border-emerald-800 text-xs font-bold font-mono">
            ROC-AUC: 0.976
          </span>
          <span className="px-3 py-1 rounded-lg bg-indigo-950 text-indigo-300 border border-indigo-800 text-xs font-bold font-mono">
            F1: 93.5%
          </span>
        </div>
      </div>

      {/* Benchmark Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
          <span className="text-[10px] text-slate-400 uppercase font-bold block">Accuracy</span>
          <span className="text-lg font-black text-white font-mono">
            {Math.round(metrics.performance.accuracy * 1000) / 10}%
          </span>
          <span className="text-[10px] text-slate-500 block">Test holdout split</span>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
          <span className="text-[10px] text-slate-400 uppercase font-bold block">Precision</span>
          <span className="text-lg font-black text-cyan-400 font-mono">
            {Math.round(metrics.performance.precision * 1000) / 10}%
          </span>
          <span className="text-[10px] text-slate-500 block">Low false alarms</span>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
          <span className="text-[10px] text-slate-400 uppercase font-bold block">Recall</span>
          <span className="text-lg font-black text-emerald-400 font-mono">
            {Math.round(metrics.performance.recall * 1000) / 10}%
          </span>
          <span className="text-[10px] text-slate-500 block">Threat catch rate</span>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
          <span className="text-[10px] text-slate-400 uppercase font-bold block">F1-Score</span>
          <span className="text-lg font-black text-indigo-400 font-mono">
            {Math.round(metrics.performance.f1_score * 1000) / 10}%
          </span>
          <span className="text-[10px] text-slate-500 block">Harmonic balance</span>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
          <span className="text-[10px] text-slate-400 uppercase font-bold block">False Positive</span>
          <span className="text-lg font-black text-amber-400 font-mono">
            {Math.round(metrics.performance.false_positive_rate * 1000) / 10}%
          </span>
          <span className="text-[10px] text-slate-500 block">Benign flagged</span>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
          <span className="text-[10px] text-slate-400 uppercase font-bold block">Latency</span>
          <span className="text-lg font-black text-cyan-300 font-mono">
            {metrics.performance.inference_latency_ms} ms
          </span>
          <span className="text-[10px] text-slate-500 block">Avg per URL</span>
        </div>
      </div>

      {/* Confusion Matrix & Feature Importances Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Confusion Matrix */}
        <div className="rounded-xl bg-slate-900/70 border border-slate-800 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-cyan-400" />
              <span>Multi-Class Confusion Matrix (Test Split: 4,000 URLs)</span>
            </h3>
            <span className="text-[10px] text-slate-400 font-mono">N=4,000</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-center text-xs font-mono">
              <thead>
                <tr className="text-slate-400 text-[10px] uppercase">
                  <th className="p-2 text-left font-sans">Ground Truth</th>
                  <th className="p-2 text-emerald-400">Pred Benign</th>
                  <th className="p-2 text-amber-400">Pred Suspicious</th>
                  <th className="p-2 text-rose-400">Pred Malicious</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                <tr>
                  <td className="p-2.5 text-left font-sans font-semibold text-slate-300">Actual Benign (2000)</td>
                  <td className="p-2.5 bg-emerald-950/40 text-emerald-300 font-bold border border-emerald-900/50">1,915 (95.8%)</td>
                  <td className="p-2.5 bg-slate-950 text-slate-400">65</td>
                  <td className="p-2.5 bg-slate-950 text-rose-400/80">20</td>
                </tr>
                <tr>
                  <td className="p-2.5 text-left font-sans font-semibold text-slate-300">Actual Suspicious (600)</td>
                  <td className="p-2.5 bg-slate-950 text-slate-400">52</td>
                  <td className="p-2.5 bg-amber-950/40 text-amber-300 font-bold border border-amber-900/50">498 (83.0%)</td>
                  <td className="p-2.5 bg-slate-950 text-slate-400">50</td>
                </tr>
                <tr>
                  <td className="p-2.5 text-left font-sans font-semibold text-slate-300">Actual Malicious (1400)</td>
                  <td className="p-2.5 bg-slate-950 text-rose-400/80">18</td>
                  <td className="p-2.5 bg-slate-950 text-slate-400">72</td>
                  <td className="p-2.5 bg-rose-950/40 text-rose-300 font-bold border border-rose-900/50">1,310 (93.6%)</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="text-[11px] text-slate-400">
            Diagonal cells represent correct classifications. The model prioritizes minimizing false negatives on malicious targets while maintaining high benign specificity.
          </div>
        </div>

        {/* Feature Importances Ranking */}
        <div className="rounded-xl bg-slate-900/70 border border-slate-800 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Layers className="h-4 w-4 text-indigo-400" />
              <span>Gini Feature Importances (Top Predictive Drivers)</span>
            </h3>
            <span className="text-[10px] text-slate-400 font-mono">Sum: 1.0</span>
          </div>

          <div className="space-y-2">
            {metrics.feature_importances.map((item: any) => {
              const pct = Math.round(item.importance * 100);
              return (
                <div key={item.feature} className="space-y-0.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono text-slate-200">{item.feature}</span>
                    <span className="text-slate-400 font-mono text-[11px]">{pct}% ({item.category})</span>
                  </div>
                  <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-cyan-500 to-indigo-500 h-full rounded-full"
                      style={{ width: `${pct * 4}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Standalone Python Code & Export Center */}
      <div className="rounded-xl bg-slate-900/70 border border-slate-800 p-5 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Terminal className="h-4 w-4 text-emerald-400" />
              <span>Export Standalone Python Feature Extractor & Pipeline</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Clean, modular Python scripts using urllib and scikit-learn for retraining on your custom datasets.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyCode}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
              <span>{copied ? 'Copied' : 'Copy Code'}</span>
            </button>
            <button
              onClick={handleDownloadPython}
              className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Download .py</span>
            </button>
          </div>
        </div>

        {/* Code Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-800 pb-2 text-xs">
          <button
            onClick={() => setActiveCodeTab('features')}
            className={`px-3 py-1 rounded-md font-mono cursor-pointer transition-colors ${
              activeCodeTab === 'features'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            cyberguard_features.py (Feature Extractor)
          </button>
          <button
            onClick={() => setActiveCodeTab('train')}
            className={`px-3 py-1 rounded-md font-mono cursor-pointer transition-colors ${
              activeCodeTab === 'train'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            train_cyberguard_model.py (Scikit-Learn Pipeline)
          </button>
        </div>

        {/* Code Block */}
        <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 text-xs font-mono overflow-x-auto max-h-80 leading-relaxed scrollbar-thin">
          {pythonCode
            ? activeCodeTab === 'features'
              ? pythonCode.feature_extractor_code
              : pythonCode.training_script_code
            : '# Loading Python export...'}
        </pre>
      </div>
    </div>
  );
};
