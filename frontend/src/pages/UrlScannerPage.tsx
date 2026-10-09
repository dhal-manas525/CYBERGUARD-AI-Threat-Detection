import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Search,
  ArrowRight,
  Download,
  AlertCircle,
  FileText,
  RefreshCw,
  Share2,
} from 'lucide-react';
import { api } from '../services/api';
import type { ScanResponse } from '../types';
import { RiskGauge } from '../components/scanner/RiskGauge';
import { ThreatBadge } from '../components/common/ThreatBadge';
import { CyberTrustPanel } from '../components/scanner/CyberTrustPanel';
import { ScanProgressStages } from '../components/scanner/ScanProgressStages';
import { QuickSamplePills } from '../components/scanner/QuickSamplePills';
import { CyberSecurityCore } from '../components/3d/CyberSecurityCore';
import { validateUrlInput } from '../utils/validators';
import type { DemoSample } from '../services/demoData';

export const UrlScannerPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [url, setUrl] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<ScanResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Check URL search parameters (e.g. from landing page quick analyze)
  useEffect(() => {
    const targetParam = searchParams.get('target');
    if (targetParam) {
      setUrl(targetParam);
      runScan(targetParam);
    }
  }, [searchParams]);

  const runScan = async (targetUrl: string) => {
    const cleanUrl = targetUrl.trim();
    
    // Strict lexical & structural validation
    const validation = validateUrlInput(cleanUrl);
    if (!validation.isValid) {
      setError(validation.error || 'Please enter a valid URL or domain to analyze.');
      setScanResult(null);
      return;
    }

    setError(null);
    setIsScanning(true);
    setScanResult(null);

    try {
      const data = await api.scanUrl(cleanUrl);
      setScanResult(data);
    } catch (err: any) {
      setError(err.message || 'Unable to analyze this URL right now. Please try again.');
    } finally {
      setIsScanning(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    runScan(url);
  };

  const handleSelectSample = (sample: DemoSample) => {
    if (sample.payload.url) {
      setUrl(sample.payload.url);
      runScan(sample.payload.url);
    }
  };

  const handlePrintReport = () => {
    window.print();
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Top Banner / Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-cyan-500/15">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 uppercase tracking-widest">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            PRIMARY INVESTIGATION SUITE
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
            URL Threat & Impersonation Scanner
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Autonomous multi-vector analysis powered by CyberTrust Intelligence™.
          </p>
        </div>

        {scanResult && (
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handlePrintReport}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 border border-slate-700 hover:border-cyan-500/40 text-slate-200 text-xs font-mono transition"
            >
              <Download className="w-4 h-4 text-cyan-400" />
              <span>Export Report</span>
            </button>
            <button
              type="button"
              onClick={() => runScan(url)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 border border-slate-700 hover:border-cyan-500/40 text-slate-200 text-xs font-mono transition"
              title="Rescan"
            >
              <RefreshCw className="w-4 h-4 text-cyan-400" />
              <span>Rescan</span>
            </button>
          </div>
        )}
      </div>

      {/* URL Input Form */}
      <div className="rounded-2xl border border-cyan-500/30 bg-slate-900/80 p-6 backdrop-blur-xl shadow-neon-cyan">
        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block text-xs font-mono uppercase tracking-wider text-slate-300">
            Target URL or Hostname
          </label>
          <div className="relative flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="relative flex-1 flex items-center">
              <Search className="absolute left-4 w-5 h-5 text-cyan-400 pointer-events-none" />
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com/login or http://sbi-kyc-verify.xyz"
                disabled={isScanning}
                className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-slate-950/80 border border-slate-700 focus:border-cyan-400 text-sm text-white font-mono placeholder-slate-500 focus:outline-none transition shadow-inner"
              />
            </div>
            <button
              type="submit"
              disabled={isScanning || !url.trim()}
              className="flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 text-black font-bold font-mono text-xs uppercase tracking-wider hover:opacity-95 disabled:opacity-50 transition shadow-neon-cyan shrink-0"
            >
              <span>{isScanning ? 'Analyzing...' : 'Analyze Threat'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>

        {/* Demo Mode Pills */}
        <div className="mt-5 pt-4 border-t border-slate-800">
          <QuickSamplePills onSelectSample={handleSelectSample} filterType="url" />
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-rose-950/40 border border-rose-500/40 text-sm text-rose-300">
          <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Scanning Stage Progress Indicator */}
      {isScanning && (
        <div className="py-4">
          <ScanProgressStages isScanning={isScanning} />
        </div>
      )}

      {/* RESULTS DISPLAY */}
      {scanResult && !isScanning && (
        <div className="space-y-8 animate-fadeIn">
          {/* Top Threat Summary Card */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-xl">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              {/* Circular Gauge */}
              <div className="lg:col-span-3 flex flex-col items-center justify-center p-4 rounded-xl bg-slate-950/60 border border-slate-800/80">
                <RiskGauge score={scanResult.risk_score} threatLevel={scanResult.threat_level} />
                <div className="mt-3">
                  <ThreatBadge level={scanResult.threat_level} size="lg" />
                </div>
              </div>

              {/* Threat Description & Target Header */}
              <div className="lg:col-span-6 space-y-4">
                <div>
                  <div className="text-xs text-slate-400 uppercase font-mono tracking-wider">
                    Target Resource Under Inspection
                  </div>
                  <div className="text-base sm:text-lg font-bold font-mono text-cyan-300 break-all mt-1">
                    {scanResult.target}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800">
                    <div className="text-xs text-slate-400">Classified Threat Category</div>
                    <div className="text-sm font-semibold text-white mt-1">
                      {scanResult.threat_category}
                    </div>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800">
                    <div className="text-xs text-slate-400">Identity Status</div>
                    <div className="text-sm font-semibold text-white mt-1">
                      {scanResult.cybertrust.identity_match_status}
                    </div>
                  </div>
                </div>

                <div className="text-xs text-slate-400 leading-relaxed">
                  Timestamp: {new Date(scanResult.created_at).toLocaleString()} | Inspection ID: #{scanResult.id || 'LIVE'}
                </div>
              </div>

              {/* Mini 3D Core Reflecting Result State */}
              <div className="lg:col-span-3 hidden lg:flex flex-col items-center justify-center">
                <div className="w-48 h-48 rounded-2xl bg-slate-950/70 border border-slate-800 p-2 overflow-hidden relative">
                  <CyberSecurityCore threatLevel={scanResult.threat_level} className="w-full h-full" />
                  <div className="absolute bottom-2 inset-x-2 text-center text-[10px] font-mono text-slate-400 bg-slate-950/80 rounded py-0.5 border border-slate-800">
                    HUD STATE: {scanResult.threat_level}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* THE SIGNATURE CYBERTRUST INTELLIGENCE™ PANEL */}
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
