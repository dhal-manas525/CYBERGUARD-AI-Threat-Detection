import React, { useState } from 'react';
import { Globe, ArrowRight, AlertCircle, ShieldCheck, Lock, ExternalLink } from 'lucide-react';
import { api } from '../services/api';
import type { ScanResponse } from '../types';
import { RiskGauge } from '../components/scanner/RiskGauge';
import { ThreatBadge } from '../components/common/ThreatBadge';
import { CyberTrustPanel } from '../components/scanner/CyberTrustPanel';
import { validateUrlInput } from '../utils/validators';

export const WebsiteAnalyzerPage: React.FC = () => {
  const [url, setUrl] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [scanResult, setScanResult] = useState<ScanResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUrl = url.trim();
    const validation = validateUrlInput(cleanUrl);
    if (!validation.isValid) {
      setError(validation.error || 'Please provide a valid website URL or domain.');
      setScanResult(null);
      return;
    }

    setError(null);
    setIsAnalyzing(true);
    setScanResult(null);

    try {
      const data = await api.scanWebsite(url.trim());
      setScanResult(data);
    } catch (err: any) {
      setError(err.message || 'Unable to inspect website.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="pb-6 border-b border-cyan-500/15">
        <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 uppercase tracking-widest">
          <Globe className="w-4 h-4" />
          <span>NON-INVASIVE DOMAIN & PROTOCOL INSPECTION</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
          Safe Website Inspector
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Validates TLS certificates, structural integrity, and brand spoofing with strict SSRF protections.
        </p>
      </div>

      {/* Input */}
      <div className="rounded-2xl border border-cyan-500/30 bg-slate-900/80 p-6 backdrop-blur-xl shadow-neon-cyan">
        <form onSubmit={handleAnalyze} className="space-y-4">
          <label className="block text-xs font-mono uppercase text-slate-300">
            Website URL or Domain
          </label>
          <div className="relative flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="relative flex-1 flex items-center">
              <Globe className="absolute left-4 w-5 h-5 text-cyan-400 pointer-events-none" />
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://examplebank.com or https://suspicious-checkout.xyz"
                disabled={isAnalyzing}
                className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-slate-950/80 border border-slate-700 focus:border-cyan-400 text-sm text-white font-mono placeholder-slate-500 focus:outline-none"
              />
            </div>
            <button
              type="submit"
              disabled={isAnalyzing || !url.trim()}
              className="flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 text-black font-bold font-mono text-xs uppercase tracking-wider hover:opacity-95 disabled:opacity-50 transition shadow-neon-cyan shrink-0"
            >
              <span>{isAnalyzing ? 'Inspecting...' : 'Inspect Website'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>

        <div className="mt-4 flex flex-wrap gap-2 text-xs font-mono text-slate-400">
          <span className="text-slate-500">Quick Test:</span>
          <button
            type="button"
            onClick={() => setUrl('https://www.paypal.com')}
            className="px-2 py-0.5 rounded bg-slate-800 text-cyan-300 hover:bg-slate-700"
          >
            paypal.com
          </button>
          <button
            type="button"
            onClick={() => setUrl('http://paypal-security-alert-center.top')}
            className="px-2 py-0.5 rounded bg-slate-800 text-rose-300 hover:bg-slate-700"
          >
            paypal-alert.top
          </button>
          <button
            type="button"
            onClick={() => setUrl('https://www.onlinesbi.sbi')}
            className="px-2 py-0.5 rounded bg-slate-800 text-cyan-300 hover:bg-slate-700"
          >
            onlinesbi.sbi
          </button>
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
          {/* Top Card */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-xl">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
              <div className="md:col-span-4 flex flex-col items-center justify-center p-4 rounded-xl bg-slate-950/60 border border-slate-800/80">
                <RiskGauge score={scanResult.risk_score} threatLevel={scanResult.threat_level} />
                <div className="mt-3">
                  <ThreatBadge level={scanResult.threat_level} size="lg" />
                </div>
              </div>

              <div className="md:col-span-8 space-y-4">
                <div>
                  <div className="text-xs text-slate-400 uppercase font-mono tracking-wider">
                    Website Inspection Summary
                  </div>
                  <div className="text-lg font-bold font-mono text-cyan-300 break-all mt-1">
                    {scanResult.target}
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
                  <div className="text-xs font-semibold text-slate-300 font-mono flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>Verified Non-Intrusive Security Checks Performed:</span>
                  </div>
                  <ul className="text-xs text-slate-400 space-y-1 list-disc list-inside">
                    <li>Strict SSRF & Private RFC1918 range filtering enforced</li>
                    <li>Transport Layer (HTTPS) protocol verification</li>
                    <li>Brand impersonation & typosquatting homoglyph audit</li>
                    <li>Autonomous ML multi-class structural evaluation</li>
                  </ul>
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
